import API from '../BackendAPi/ApiProvider';
import offlineStorage from '../utils/offlineStorage';

class SyncService {
  constructor() {
    this.isSyncing = false;
    this.syncListeners = [];
  }

  // Add sync listener
  addSyncListener(callback) {
    this.syncListeners.push(callback);
  }

  // Remove sync listener
  removeSyncListener(callback) {
    this.syncListeners = this.syncListeners.filter(listener => listener !== callback);
  }

  // Notify listeners
  notifyListeners(event, data) {
    this.syncListeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Sync listener error:', error);
      }
    });
  }

  // Start sync process
  async startSync() {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    this.isSyncing = true;
    this.notifyListeners('syncStarted', {});

    try {
      await offlineStorage.init();
      const unsyncedCustomers = await offlineStorage.getUnsyncedCustomers();
      
      console.log(`Starting sync for ${unsyncedCustomers.length} customers`);
      
      let syncedCount = 0;
      let failedCount = 0;

      for (const customer of unsyncedCustomers) {
        try {
          // Remove offline-specific fields before sending to server
          const customerData = { ...customer };
          delete customerData.id; // Remove temporary offline ID
          delete customerData.offline;
          delete customerData.synced;
          delete customerData.createdAt;
          delete customerData.syncedAt;
          delete customerData.serverId;

          const response = await API.post('/api/admin/customers', customerData);
          
          // Mark as synced and remove from offline storage
          await offlineStorage.markCustomerSynced(customer.id, response.data);
          await offlineStorage.removeCustomer(customer.id);
          syncedCount++;
          
          this.notifyListeners('customerSynced', {
            customer,
            serverResponse: response.data
          });
          
          console.log(`Customer synced: ${customer.firstName} ${customer.lastName}`);
          
          // Small delay to prevent overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`Failed to sync customer ${customer.firstName} ${customer.lastName}:`, error);
          failedCount++;
          
          this.notifyListeners('customerSyncFailed', {
            customer,
            error
          });
        }
      }

      const result = {
        total: unsyncedCustomers.length,
        synced: syncedCount,
        failed: failedCount,
        success: failedCount === 0
      };

      this.notifyListeners('syncCompleted', result);
      
      console.log('Sync completed:', result);
      return result;
      
    } catch (error) {
      console.error('Sync process failed:', error);
      this.notifyListeners('syncFailed', { error });
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  // Check if there are unsynced customers
  async hasUnsyncedData() {
    try {
      await offlineStorage.init();
      const unsyncedCustomers = await offlineStorage.getUnsyncedCustomers();
      return unsyncedCustomers.length > 0;
    } catch (error) {
      console.error('Error checking unsynced data:', error);
      return false;
    }
  }

  // Get sync status
  async getSyncStatus() {
    try {
      await offlineStorage.init();
      const stats = await offlineStorage.getStats();
      return {
        ...stats,
        isSyncing: this.isSyncing
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        offlineCustomers: 0,
        pendingSync: 0,
        totalStored: 0,
        isSyncing: this.isSyncing
      };
    }
  }

  // Force sync (for manual sync button)
  async forceSync() {
    console.log('Force sync triggered');
    return await this.startSync();
  }

  // Clear all offline data
  async clearOfflineData() {
    try {
      await offlineStorage.init();
      await offlineStorage.clearAll();
      this.notifyListeners('offlineDataCleared', {});
      console.log('All offline data cleared');
    } catch (error) {
      console.error('Error clearing offline data:', error);
      throw error;
    }
  }
}

// Create singleton instance
const syncService = new SyncService();

export default syncService;
