import API from '../BackendAPi/ApiProvider';
import publicOfflineStorage from './publicOfflineStorage';

class PublicSyncService {
  constructor() {
    this.listeners = [];
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    
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
          const { id, createdAt, synced, syncedAt, serverId, ...contactData } = contact;
          
          const response = await API.post('/api/admin/customers', contactData);
          
          // Mark as synced
          await publicOfflineStorage.markContactSynced(contact.id, response.data);
          
          this.notifyListeners('contactSynced', {
            contact: contact,
            serverResponse: response.data
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
