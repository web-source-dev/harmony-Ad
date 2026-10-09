import API from '../BackendAPi/ApiProvider';
import publicOfflineStorage from './publicOfflineStorage';

class PublicSyncService {
  constructor() {
    this.listeners = [];
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.syncPromise = null;
    this.cacheVersion = null;
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('PublicSyncService: Network came online');
      this.isOnline = true;
      // Add a small delay to ensure network is stable
      setTimeout(() => {
        this.startSync();
      }, 1000);
    });
    
    window.addEventListener('offline', () => {
      console.log('PublicSyncService: Network went offline');
      this.isOnline = false;
    });
  }

  // Set cache version for this session
  setCacheVersion(version) {
    this.cacheVersion = version;
    console.log('PublicSyncService: Cache version set to', version);
  }

  addSyncListener(callback) {
    this.listeners.push(callback);
  }

  removeSyncListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }

  async startSync() {
    if (this.syncPromise) {
      console.log('Sync already in progress, waiting for it to finish');
      return this.syncPromise;
    }

    this.syncPromise = this.runSync().finally(() => {
      this.syncPromise = null;
    });
    return this.syncPromise;
  }

  // Fields the server accepts. Everything else (IndexedDB id, synced flag,
  // previous error) stays on the device and is never sent.
  toCustomerPayload(contact) {
    return {
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      source: 'public',
      fromPublicForm: true,
      isSubscribed: contact.isSubscribed !== false,
      emailSubscriberStatus: contact.emailSubscriberStatus || 'subscribed',
      smsSubscriberStatus: contact.smsSubscriberStatus || 'subscribed',
      labels: Array.isArray(contact.labels) ? contact.labels : [],
      visitorEmail: contact.visitorEmail || null,
      visitorName: contact.visitorName || null,
      isOffline: true,
      localId: contact.id,
    };
  }

  isNetworkError(error) {
    return !error?.response || error.code === 'ECONNABORTED' || error.message === 'Network Error';
  }

  async runSync() {
    this.isOnline = navigator.onLine;
    if (!navigator.onLine) {
      console.log('Sync skipped - offline');
      return { synced: 0, failed: 0, total: 0, offline: true };
    }

    let syncedCount = 0;
    let failedCount = 0;
    let unsyncedContacts = [];
    let stoppedEarly = false;
    let lastError = '';

    try {
      unsyncedContacts = await publicOfflineStorage.getUnsyncedContacts();

      if (unsyncedContacts.length === 0) {
        console.log('No unsynced contacts to sync');
        return { synced: 0, failed: 0, total: 0 };
      }

      this.syncInProgress = true;
      this.notifyListeners('syncStarted');
      console.log(`Syncing ${unsyncedContacts.length} contacts...`);

      for (const contact of unsyncedContacts) {
        if (!navigator.onLine) {
          stoppedEarly = true;
          lastError = 'Internet dropped while syncing. Saved contacts are still on this iPad.';
          break;
        }

        try {
          const payload = this.toCustomerPayload(contact);
          const response = await API.post('/api/admin/customers', payload, { timeout: 30000 });
          const serverContactId = response.data?.customer?._id || response.data?.customer?.id;

          if (payload.visitorEmail && serverContactId) {
            try {
              await publicOfflineStorage.markVisitorContactSynced(
                payload.visitorEmail,
                contact.id,
                serverContactId
              );
              await API.post('/api/visitor/mark-offline-synced', {
                visitorEmail: payload.visitorEmail,
                localId: contact.id,
                serverContactId,
              });
            } catch (visitorError) {
              console.error('Failed to update visitor contact tracking:', visitorError);
            }
          }

          // Only drop the local copy after the server has accepted it.
          try {
            await publicOfflineStorage.removeContact(contact.id);
          } catch (removeError) {
            console.error('Server saved the contact but the local copy could not be cleared:', removeError);
            await publicOfflineStorage.markContactSynced(contact.id, {
              id: serverContactId,
              customer: response.data?.customer,
            });
          }

          this.notifyListeners('contactSynced', {
            contact,
            serverResponse: response.data,
            visitorEmail: payload.visitorEmail,
          });

          syncedCount++;
          console.log(`Contact synced: ${contact.firstName} ${contact.lastName}`);
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Could not sync';
          console.error(`Failed to sync contact ${contact.id}:`, message);

          if (this.isNetworkError(error)) {
            // The iPad is not really online. Keep every remaining record and retry later.
            stoppedEarly = true;
            lastError = 'Still no connection to the server. These contacts are saved on this iPad.';
            failedCount += unsyncedContacts.length - syncedCount - failedCount;
            break;
          }

          failedCount++;
          lastError = message;
          try {
            await publicOfflineStorage.setContactSyncError(contact.id, message);
          } catch (storeError) {
            console.error('Failed to record sync error:', storeError);
          }
          this.notifyListeners('contactSyncFailed', { contact, error: message });
        }
      }

      const result = {
        synced: syncedCount,
        failed: failedCount,
        total: unsyncedContacts.length,
        stoppedEarly,
        message: lastError,
      };
      this.notifyListeners('syncCompleted', result);
      console.log(`Sync completed: ${syncedCount} synced, ${failedCount} failed`);
      return result;
    } catch (error) {
      console.error('Sync failed:', error);
      this.notifyListeners('syncError', { error });
      return { synced: syncedCount, failed: failedCount, total: unsyncedContacts.length, message: error.message };
    } finally {
      this.syncInProgress = false;
    }
  }

  async getSyncStatus() {
    const stats = await publicOfflineStorage.getStats();
    return {
      offlineContacts: stats.total,
      offlineCustomers: stats.unsynced,
      pendingSync: stats.unsynced,
      isSyncing: this.syncInProgress
    };
  }

  async hasUnsyncedData() {
    const stats = await publicOfflineStorage.getStats();
    return stats.unsynced > 0;
  }

  async forceSync() {
    console.log('Force sync triggered');
    await this.startSync();
  }

  async clearOfflineData() {
    await publicOfflineStorage.clearAll();
  }

  // Sync visitor info to server
  async syncVisitorInfo(visitorData) {
    if (!this.isOnline || !navigator.onLine) {
      console.log('Not online, storing visitor info locally');
      try {
        await publicOfflineStorage.storeVisitorInfo(visitorData);
        return { success: false, message: 'Stored locally, will sync when online' };
      } catch (error) {
        console.error('Failed to store visitor info locally:', error);
        return { success: false, error: error.message };
      }
    }

    try {
      const response = await API.post('/api/visitor/find-or-create', {
        name: visitorData.name,
        email: visitorData.email,
        source: 'public-form',
        referrer: document.referrer || null,
        userAgent: navigator.userAgent || null
      });

      // Store the server response locally as well
      await publicOfflineStorage.storeVisitorInfo({
        ...visitorData,
        serverId: response.data.visitor.id,
        sessionId: response.data.visitor.sessionId
      });

      return { 
        success: true, 
        visitor: response.data.visitor,
        message: 'Visitor info synced successfully'
      };
    } catch (error) {
      console.error('Failed to sync visitor info:', error);
      
      // Store locally as fallback
      try {
        await publicOfflineStorage.storeVisitorInfo(visitorData);
        return { 
          success: false, 
          message: 'Server sync failed, stored locally',
          error: error.message
        };
      } catch (localError) {
        console.error('Failed to store visitor info locally as fallback:', localError);
        return { 
          success: false, 
          error: `Server and local storage failed: ${error.message}` 
        };
      }
    }
  }

  // Check if we have unsynced data and trigger sync if online
  async checkAndSync() {
    if (!this.isOnline) {
      console.log('Not online, skipping sync check');
      return;
    }

    try {
      const status = await this.getSyncStatus();
      if (status.pendingSync > 0) {
        console.log(`Found ${status.pendingSync} unsynced contacts, starting sync...`);
        await this.startSync();
      } else {
        console.log('No unsynced contacts found');
      }
    } catch (error) {
      console.error('Error checking sync status:', error);
    }
  }
}

export default new PublicSyncService();
