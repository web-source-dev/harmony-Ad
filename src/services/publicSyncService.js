import API from '../BackendAPi/ApiProvider';
import publicOfflineStorage from './publicOfflineStorage';

class PublicSyncService {
  constructor() {
    this.listeners = [];
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
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
    if (this.syncInProgress) {
      console.log('Sync skipped - already in progress');
      return;
    }

    if (!this.isOnline || !navigator.onLine) {
      console.log('Sync skipped - offline');
      return;
    }

    try {
      this.syncInProgress = true;
      this.notifyListeners('syncStarted');

      // Test network connectivity
      try {
        await fetch('/api/admin/stats', { 
          method: 'HEAD',
          cache: 'no-cache',
          timeout: 5000 
        });
      } catch (error) {
        console.log('Network connectivity test failed, skipping sync');
        this.syncInProgress = false;
        this.notifyListeners('syncError', { error: 'Network connectivity test failed' });
        return;
      }

      const unsyncedContacts = await publicOfflineStorage.getUnsyncedContacts();
      
      if (unsyncedContacts.length === 0) {
        console.log('No unsynced contacts to sync');
        this.syncInProgress = false;
        this.notifyListeners('syncCompleted');
        return;
      }

      console.log(`Syncing ${unsyncedContacts.length} contacts...`);

      let syncedCount = 0;
      let failedCount = 0;

      for (const contact of unsyncedContacts) {
        try {
          // Remove offline-specific fields
          const { id, createdAt, synced, syncedAt, serverId, visitorEmail, visitorName, ...contactData } = contact;
          
          // Add visitor tracking data to the contact
          const contactDataWithVisitor = {
            ...contactData,
            visitorEmail: visitorEmail,
            visitorName: visitorName,
            isOffline: true,
            localId: contact.id
          };
          
          const response = await API.post('/api/admin/customers', contactDataWithVisitor);
          console.log('Contact synced to server:', response.data);
          
          // Mark contact as synced
          await publicOfflineStorage.markContactSynced(contact.id, response.data);
          
          // Update visitor contact tracking if visitor info exists
          if (visitorEmail) {
            try {
              console.log('Updating visitor contact tracking for:', visitorEmail);
              await publicOfflineStorage.markVisitorContactSynced(
                visitorEmail, 
                contact.id, 
                response.data.customer._id || response.data.customer.id
              );
              
              // Also update server-side visitor tracking
              await API.post('/api/visitor/mark-offline-synced', {
                visitorEmail: visitorEmail,
                localId: contact.id,
                serverContactId: response.data.customer._id || response.data.customer.id
              });
              console.log('Server-side visitor tracking updated');
            } catch (visitorError) {
              console.error('Failed to update visitor contact tracking:', visitorError);
              // Don't fail the contact sync if visitor tracking fails
            }
          }
          
          this.notifyListeners('contactSynced', {
            contact: contact,
            serverResponse: response.data,
            visitorEmail: visitorEmail
          });
          
          syncedCount++;
          console.log(`Contact synced: ${contact.firstName} ${contact.lastName}`);
          
          // Small delay to prevent overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`Failed to sync contact ${contact.id}:`, error);
          failedCount++;
          // Continue with other contacts even if one fails
        }
      }

      // Clean up synced contacts
      await publicOfflineStorage.cleanupSyncedContacts();

      this.syncInProgress = false;
      this.notifyListeners('syncCompleted', { 
        synced: syncedCount, 
        failed: failedCount,
        total: unsyncedContacts.length 
      });
      console.log(`Sync completed: ${syncedCount} synced, ${failedCount} failed`);
    } catch (error) {
      console.error('Sync failed:', error);
      this.syncInProgress = false;
      this.notifyListeners('syncError', { error });
    }
  }

  async getSyncStatus() {
    const stats = await publicOfflineStorage.getStats();
    return {
      offlineContacts: stats.total,
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
