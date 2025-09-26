import API from '../BackendAPi/ApiProvider';
import publicOfflineStorage from './publicOfflineStorage';

class PublicSyncService {
  constructor() {
    this.listeners = [];
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.startSync();
    });
    
    window.addEventListener('offline', () => {
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
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    try {
      this.syncInProgress = true;
      this.notifyListeners('syncStarted');

      const unsyncedContacts = await publicOfflineStorage.getUnsyncedContacts();
      
      if (unsyncedContacts.length === 0) {
        console.log('No unsynced contacts to sync');
        this.syncInProgress = false;
        this.notifyListeners('syncCompleted');
        return;
      }

      console.log(`Syncing ${unsyncedContacts.length} contacts...`);

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
          
          console.log(`Contact synced: ${contact.firstName} ${contact.lastName}`);
        } catch (error) {
          console.error(`Failed to sync contact ${contact.id}:`, error);
          // Continue with other contacts even if one fails
        }
      }

      this.syncInProgress = false;
      this.notifyListeners('syncCompleted');
      console.log('Sync completed');
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
    await this.startSync();
  }

  async clearOfflineData() {
    await publicOfflineStorage.clearAll();
  }
}

export default new PublicSyncService();
