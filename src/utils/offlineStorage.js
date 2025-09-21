// IndexedDB utilities for offline storage
class OfflineStorage {
  constructor() {
    this.dbName = 'HarmonyAdminDB';
    this.version = 1;
    this.db = null;
  }

  // Initialize IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      // Check if IndexedDB is supported
      if (!('indexedDB' in window)) {
        const error = new Error('IndexedDB is not supported in this browser');
        console.error(error);
        reject(error);
        return;
      }

      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        // Don't reject immediately, try to continue without IndexedDB
        console.warn('IndexedDB failed, continuing without offline storage');
        this.db = null;
        resolve(null);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        try {
          // Create customers store
          if (!db.objectStoreNames.contains('customers')) {
            const customerStore = db.createObjectStore('customers', { keyPath: 'id' });
            customerStore.createIndex('synced', 'synced', { unique: false });
            customerStore.createIndex('offline', 'offline', { unique: false });
            customerStore.createIndex('createdAt', 'createdAt', { unique: false });
          }
          
          // Create sync queue store
          if (!db.objectStoreNames.contains('syncQueue')) {
            const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
            syncStore.createIndex('timestamp', 'timestamp', { unique: false });
            syncStore.createIndex('action', 'action', { unique: false });
          }
        } catch (error) {
          console.error('Error creating object stores:', error);
        }
      };

      request.onblocked = () => {
        console.warn('IndexedDB upgrade blocked by another tab');
      };
    });
  }

  // Store customer offline
  async storeCustomer(customerData) {
    if (!this.db) {
      const initResult = await this.init();
      if (!initResult) {
        // Fallback to localStorage
        return this.storeCustomerInLocalStorage(customerData);
      }
    }

    const offlineCustomer = {
      ...customerData,
      id: `offline_${Date.now()}_${Math.random()}`,
      createdAt: new Date().toISOString(),
      offline: true,
      synced: false
    };

    try {
      const transaction = this.db.transaction(['customers'], 'readwrite');
      const store = transaction.objectStore('customers');
      
      await new Promise((resolve, reject) => {
        const request = store.add(offlineCustomer);
        
        request.onsuccess = () => {
          console.log('Customer stored offline:', offlineCustomer);
          resolve();
        };
        
        request.onerror = () => {
          console.error('Failed to store customer offline:', request.error);
          reject(request.error);
        };
      });

      await this.addToSyncQueue('create', offlineCustomer);
      return offlineCustomer;
    } catch (error) {
      console.error('IndexedDB store failed, falling back to localStorage:', error);
      return this.storeCustomerInLocalStorage(customerData);
    }
  }

  // Fallback storage using localStorage
  storeCustomerInLocalStorage(customerData) {
    const offlineCustomer = {
      ...customerData,
      id: `offline_${Date.now()}_${Math.random()}`,
      createdAt: new Date().toISOString(),
      offline: true,
      synced: false
    };

    try {
      const existingCustomers = JSON.parse(localStorage.getItem('offline_customers') || '[]');
      existingCustomers.push(offlineCustomer);
      localStorage.setItem('offline_customers', JSON.stringify(existingCustomers));
      
      console.log('Customer stored in localStorage:', offlineCustomer);
      return offlineCustomer;
    } catch (error) {
      console.error('Failed to store customer in localStorage:', error);
      throw new Error('Failed to store customer offline');
    }
  }

  // Get all offline customers
  async getOfflineCustomers() {
    if (!this.db) {
      const initResult = await this.init();
      if (!initResult) {
        // Fallback to localStorage
        return this.getOfflineCustomersFromLocalStorage();
      }
    }

    try {
      const transaction = this.db.transaction(['customers'], 'readonly');
      const store = transaction.objectStore('customers');

      return new Promise((resolve, reject) => {
        // Get all customers and filter them instead of using index
        const request = store.getAll();
        
        request.onsuccess = () => {
          const allCustomers = request.result || [];
          // Filter for offline customers
          const offlineCustomers = allCustomers.filter(customer => 
            customer && customer.offline === true
          );
          resolve(offlineCustomers);
        };
        
        request.onerror = () => {
          console.error('Failed to get customers from IndexedDB:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('IndexedDB get failed, falling back to localStorage:', error);
      return this.getOfflineCustomersFromLocalStorage();
    }
  }

  // Fallback method to get customers from localStorage
  getOfflineCustomersFromLocalStorage() {
    try {
      const customers = JSON.parse(localStorage.getItem('offline_customers') || '[]');
      return customers.filter(customer => customer.offline);
    } catch (error) {
      console.error('Failed to get customers from localStorage:', error);
      return [];
    }
  }

  // Get all unsynced customers
  async getUnsyncedCustomers() {
    if (!this.db) {
      const initResult = await this.init();
      if (!initResult) {
        // Fallback to localStorage
        return this.getUnsyncedCustomersFromLocalStorage();
      }
    }

    try {
      const transaction = this.db.transaction(['customers'], 'readonly');
      const store = transaction.objectStore('customers');

      return new Promise((resolve, reject) => {
        // Get all customers and filter them instead of using index
        const request = store.getAll();
        
        request.onsuccess = () => {
          const allCustomers = request.result || [];
          // Filter for unsynced customers
          const unsyncedCustomers = allCustomers.filter(customer => 
            customer && customer.synced === false
          );
          resolve(unsyncedCustomers);
        };
        
        request.onerror = () => {
          console.error('Failed to get unsynced customers from IndexedDB:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('IndexedDB get unsynced failed, falling back to localStorage:', error);
      return this.getUnsyncedCustomersFromLocalStorage();
    }
  }

  // Fallback method to get unsynced customers from localStorage
  getUnsyncedCustomersFromLocalStorage() {
    try {
      const customers = JSON.parse(localStorage.getItem('offline_customers') || '[]');
      return customers.filter(customer => customer.synced === false);
    } catch (error) {
      console.error('Failed to get unsynced customers from localStorage:', error);
      return [];
    }
  }

  // Mark customer as synced
  async markCustomerSynced(customerId, serverResponse) {
    if (!this.db) {
      const initResult = await this.init();
      if (!initResult) {
        // Fallback to localStorage
        return this.markCustomerSyncedInLocalStorage(customerId, serverResponse);
      }
    }

    try {
      const transaction = this.db.transaction(['customers'], 'readwrite');
      const store = transaction.objectStore('customers');

      return new Promise((resolve, reject) => {
        const getRequest = store.get(customerId);
        
        getRequest.onsuccess = () => {
          const customer = getRequest.result;
          if (customer) {
            customer.synced = true;
            customer.offline = false;
            customer.serverId = serverResponse._id || serverResponse.id;
            customer.syncedAt = new Date().toISOString();
            
            const putRequest = store.put(customer);
            
            putRequest.onsuccess = () => {
              console.log('Customer marked as synced:', customer);
              resolve(customer);
            };
            
            putRequest.onerror = () => {
              reject(putRequest.error);
            };
          } else {
            reject(new Error('Customer not found'));
          }
        };
        
        getRequest.onerror = () => {
          reject(getRequest.error);
        };
      });
    } catch (error) {
      console.error('IndexedDB mark synced failed, falling back to localStorage:', error);
      return this.markCustomerSyncedInLocalStorage(customerId, serverResponse);
    }
  }

  // Fallback method to mark customer as synced in localStorage
  markCustomerSyncedInLocalStorage(customerId, serverResponse) {
    try {
      const customers = JSON.parse(localStorage.getItem('offline_customers') || '[]');
      const customerIndex = customers.findIndex(customer => customer.id === customerId);
      
      if (customerIndex !== -1) {
        customers[customerIndex].synced = true;
        customers[customerIndex].offline = false;
        customers[customerIndex].serverId = serverResponse._id || serverResponse.id;
        customers[customerIndex].syncedAt = new Date().toISOString();
        
        localStorage.setItem('offline_customers', JSON.stringify(customers));
        console.log('Customer marked as synced in localStorage:', customers[customerIndex]);
        return customers[customerIndex];
      } else {
        throw new Error('Customer not found in localStorage');
      }
    } catch (error) {
      console.error('Failed to mark customer as synced in localStorage:', error);
      throw error;
    }
  }

  // Remove customer from offline storage
  async removeCustomer(customerId) {
    if (!this.db) {
      const initResult = await this.init();
      if (!initResult) {
        // Fallback to localStorage
        return this.removeCustomerFromLocalStorage(customerId);
      }
    }

    try {
      const transaction = this.db.transaction(['customers'], 'readwrite');
      const store = transaction.objectStore('customers');

      return new Promise((resolve, reject) => {
        const request = store.delete(customerId);
        
        request.onsuccess = () => {
          console.log('Customer removed from IndexedDB:', customerId);
          resolve();
        };
        
        request.onerror = () => {
          console.error('Failed to remove customer from IndexedDB:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('IndexedDB remove failed, falling back to localStorage:', error);
      return this.removeCustomerFromLocalStorage(customerId);
    }
  }

  // Fallback method to remove customer from localStorage
  removeCustomerFromLocalStorage(customerId) {
    try {
      const customers = JSON.parse(localStorage.getItem('offline_customers') || '[]');
      const filteredCustomers = customers.filter(customer => customer.id !== customerId);
      
      localStorage.setItem('offline_customers', JSON.stringify(filteredCustomers));
      console.log('Customer removed from localStorage:', customerId);
    } catch (error) {
      console.error('Failed to remove customer from localStorage:', error);
      throw error;
    }
  }

  // Add item to sync queue
  async addToSyncQueue(action, data) {
    if (!this.db) await this.init();

    const syncItem = {
      id: `sync_${Date.now()}_${Math.random()}`,
      action,
      data,
      timestamp: new Date().toISOString(),
      attempts: 0
    };

    const transaction = this.db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    
    return new Promise((resolve, reject) => {
      const request = store.add(syncItem);
      
      request.onsuccess = () => {
        console.log('Item added to sync queue:', syncItem);
        resolve(syncItem);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Get sync queue
  async getSyncQueue() {
    if (!this.db) await this.init();

    const transaction = this.db.transaction(['syncQueue'], 'readonly');
    const store = transaction.objectStore('syncQueue');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Remove item from sync queue
  async removeFromSyncQueue(itemId) {
    if (!this.db) await this.init();

    const transaction = this.db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(itemId);
      
      request.onsuccess = () => {
        console.log('Item removed from sync queue:', itemId);
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Get statistics
  async getStats() {
    if (!this.db) {
      const initResult = await this.init();
      if (!initResult) {
        // Fallback to localStorage
        return this.getStatsFromLocalStorage();
      }
    }

    try {
      const [offlineCustomers, syncQueue] = await Promise.all([
        this.getOfflineCustomers(),
        this.getSyncQueue()
      ]);

      return {
        offlineCustomers: offlineCustomers.length,
        pendingSync: syncQueue.length,
        totalStored: offlineCustomers.length
      };
    } catch (error) {
      console.error('Failed to get stats from IndexedDB, falling back to localStorage:', error);
      return this.getStatsFromLocalStorage();
    }
  }

  // Fallback method to get stats from localStorage
  getStatsFromLocalStorage() {
    try {
      const customers = JSON.parse(localStorage.getItem('offline_customers') || '[]');
      const offlineCustomers = customers.filter(customer => customer.offline === true);
      
      return {
        offlineCustomers: offlineCustomers.length,
        pendingSync: offlineCustomers.filter(customer => customer.synced === false).length,
        totalStored: offlineCustomers.length
      };
    } catch (error) {
      console.error('Failed to get stats from localStorage:', error);
      return {
        offlineCustomers: 0,
        pendingSync: 0,
        totalStored: 0
      };
    }
  }

  // Clean up synced customers (remove customers that are already synced)
  async cleanupSyncedCustomers() {
    if (!this.db) {
      const initResult = await this.init();
      if (!initResult) {
        // Fallback to localStorage
        return this.cleanupSyncedCustomersFromLocalStorage();
      }
    }

    try {
      const transaction = this.db.transaction(['customers'], 'readwrite');
      const store = transaction.objectStore('customers');

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        
        request.onsuccess = () => {
          const allCustomers = request.result || [];
          const syncedCustomers = allCustomers.filter(customer => 
            customer && customer.synced === true
          );
          
          if (syncedCustomers.length === 0) {
            resolve(0);
            return;
          }

          // Remove synced customers
          const deletePromises = syncedCustomers.map(customer => {
            return new Promise((resolveDelete, rejectDelete) => {
              const deleteRequest = store.delete(customer.id);
              deleteRequest.onsuccess = () => resolveDelete();
              deleteRequest.onerror = () => rejectDelete(deleteRequest.error);
            });
          });

          Promise.all(deletePromises)
            .then(() => {
              console.log(`Cleaned up ${syncedCustomers.length} synced customers`);
              resolve(syncedCustomers.length);
            })
            .catch(reject);
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Failed to cleanup synced customers from IndexedDB:', error);
      return this.cleanupSyncedCustomersFromLocalStorage();
    }
  }

  // Fallback method to cleanup synced customers from localStorage
  cleanupSyncedCustomersFromLocalStorage() {
    try {
      const customers = JSON.parse(localStorage.getItem('offline_customers') || '[]');
      const unsyncedCustomers = customers.filter(customer => customer.synced !== true);
      const removedCount = customers.length - unsyncedCustomers.length;
      
      localStorage.setItem('offline_customers', JSON.stringify(unsyncedCustomers));
      console.log(`Cleaned up ${removedCount} synced customers from localStorage`);
      return removedCount;
    } catch (error) {
      console.error('Failed to cleanup synced customers from localStorage:', error);
      return 0;
    }
  }

  // Clear all offline data (for testing)
  async clearAll() {
    if (!this.db) {
      const initResult = await this.init();
      if (!initResult) {
        // Fallback to localStorage
        this.clearAllFromLocalStorage();
        return;
      }
    }

    try {
      const transaction = this.db.transaction(['customers', 'syncQueue'], 'readwrite');
      
      await Promise.all([
        new Promise((resolve, reject) => {
          const request = transaction.objectStore('customers').clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }),
        new Promise((resolve, reject) => {
          const request = transaction.objectStore('syncQueue').clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        })
      ]);

      console.log('All offline data cleared from IndexedDB');
    } catch (error) {
      console.error('Failed to clear IndexedDB, clearing localStorage:', error);
      this.clearAllFromLocalStorage();
    }
  }

  // Fallback method to clear localStorage
  clearAllFromLocalStorage() {
    try {
      localStorage.removeItem('offline_customers');
      console.log('All offline data cleared from localStorage');
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
}

// Create singleton instance
const offlineStorage = new OfflineStorage();

export default offlineStorage;
