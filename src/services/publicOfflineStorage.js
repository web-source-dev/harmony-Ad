class PublicOfflineStorage {
  constructor() {
    this.dbName = 'HarmonyContactDB';
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Failed to open IndexedDB');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('Public offline storage initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create contacts store
        if (!db.objectStoreNames.contains('contacts')) {
          const contactStore = db.createObjectStore('contacts', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          contactStore.createIndex('email', 'email', { unique: false });
          contactStore.createIndex('createdAt', 'createdAt', { unique: false });
          contactStore.createIndex('synced', 'synced', { unique: false });
        }
      };
    });
  }

  async storeContact(contactData) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['contacts'], 'readwrite');
      const store = transaction.objectStore('contacts');
      
      const contact = {
        ...contactData,
        id: Date.now() + Math.random(), // Simple ID generation
        createdAt: new Date().toISOString(),
        synced: false
      };

      const request = store.add(contact);

      request.onsuccess = () => {
        console.log('Contact stored offline:', contact);
        resolve(contact);
      };

      request.onerror = () => {
        console.error('Failed to store contact offline');
        reject(request.error);
      };
    });
  }

  async getOfflineContacts() {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['contacts'], 'readonly');
      const store = transaction.objectStore('contacts');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('Failed to get offline contacts');
        reject(request.error);
      };
    });
  }

  async getUnsyncedContacts() {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['contacts'], 'readonly');
      const store = transaction.objectStore('contacts');
      const index = store.index('synced');
      const request = index.getAll(false); // Get all unsynced contacts

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('Failed to get unsynced contacts');
        reject(request.error);
      };
    });
  }

  async markContactSynced(contactId, serverResponse) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['contacts'], 'readwrite');
      const store = transaction.objectStore('contacts');
      const getRequest = store.get(contactId);

      getRequest.onsuccess = () => {
        const contact = getRequest.result;
        if (contact) {
          contact.synced = true;
          contact.syncedAt = new Date().toISOString();
          contact.serverId = serverResponse.id || serverResponse._id;

          const updateRequest = store.put(contact);
          updateRequest.onsuccess = () => {
            console.log('Contact marked as synced:', contactId);
            resolve(contact);
          };
          updateRequest.onerror = () => {
            console.error('Failed to mark contact as synced');
            reject(updateRequest.error);
          };
        } else {
          reject(new Error('Contact not found'));
        }
      };

      getRequest.onerror = () => {
        console.error('Failed to get contact for sync update');
        reject(getRequest.error);
      };
    });
  }

  async removeContact(contactId) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['contacts'], 'readwrite');
      const store = transaction.objectStore('contacts');
      const request = store.delete(contactId);

      request.onsuccess = () => {
        console.log('Contact removed from offline storage:', contactId);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to remove contact from offline storage');
        reject(request.error);
      };
    });
  }

  async getStats() {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['contacts'], 'readonly');
      const store = transaction.objectStore('contacts');
      const request = store.getAll();

      request.onsuccess = () => {
        const contacts = request.result || [];
        const stats = {
          total: contacts.length,
          synced: contacts.filter(c => c.synced).length,
          unsynced: contacts.filter(c => !c.synced).length
        };
        resolve(stats);
      };

      request.onerror = () => {
        console.error('Failed to get offline stats');
        reject(request.error);
      };
    });
  }

  async cleanupSyncedContacts() {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['contacts'], 'readwrite');
      const store = transaction.objectStore('contacts');
      const request = store.getAll();

      request.onsuccess = () => {
        const contacts = request.result || [];
        const syncedContacts = contacts.filter(contact => contact.synced === true);
        
        if (syncedContacts.length === 0) {
          console.log('No synced contacts to clean up');
          resolve(0);
          return;
        }

        // Delete synced contacts
        const deletePromises = syncedContacts.map(contact => {
          return new Promise((resolveDelete, rejectDelete) => {
            const deleteRequest = store.delete(contact.id);
            deleteRequest.onsuccess = () => resolveDelete();
            deleteRequest.onerror = () => rejectDelete(deleteRequest.error);
          });
        });

        Promise.all(deletePromises)
          .then(() => {
            console.log(`Cleaned up ${syncedContacts.length} synced contacts`);
            resolve(syncedContacts.length);
          })
          .catch(reject);
      };

      request.onerror = () => {
        console.error('Failed to get contacts for cleanup');
        reject(request.error);
      };
    });
  }

  async clearAll() {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['contacts'], 'readwrite');
      const store = transaction.objectStore('contacts');
      const request = store.clear();

      request.onsuccess = () => {
        console.log('All offline contacts cleared');
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to clear offline contacts');
        reject(request.error);
      };
    });
  }
}

export default new PublicOfflineStorage();
