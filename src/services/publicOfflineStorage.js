class PublicOfflineStorage {
  constructor() {
    this.dbName = 'HarmonyContactDB';
    this.version = 2; // Incremented to force schema update
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
          contactStore.createIndex('visitorEmail', 'visitorEmail', { unique: false });
        }

        // Create visitor info store
        if (!db.objectStoreNames.contains('visitorInfo')) {
          const visitorStore = db.createObjectStore('visitorInfo', { 
            keyPath: 'email'
          });
          visitorStore.createIndex('sessionId', 'sessionId', { unique: false });
          visitorStore.createIndex('storedAt', 'storedAt', { unique: false });
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
        synced: false,
        visitorEmail: contactData.visitorEmail || null,
        visitorName: contactData.visitorName || null
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

  // Store visitor information
  async storeVisitorInfo(visitorData) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['visitorInfo'], 'readwrite');
      const store = transaction.objectStore('visitorInfo');
      
      const visitor = {
        email: visitorData.email,
        name: visitorData.name,
        sessionId: visitorData.sessionId,
        serverId: visitorData.serverId || null,
        visitedAt: visitorData.visitedAt,
        storedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        contactsCreated: [],
        offlineContactsCreated: []
      };

      // Check if visitor already exists
      const getRequest = store.get(visitorData.email);
      
      getRequest.onsuccess = () => {
        const existingVisitor = getRequest.result;
        
        if (existingVisitor) {
          // Update existing visitor
          existingVisitor.name = visitorData.name;
          existingVisitor.sessionId = visitorData.sessionId;
          existingVisitor.serverId = visitorData.serverId || existingVisitor.serverId;
          existingVisitor.lastUpdated = new Date().toISOString();
          
          const updateRequest = store.put(existingVisitor);
          
          updateRequest.onsuccess = () => {
            console.log('Visitor info updated offline:', existingVisitor);
            resolve(existingVisitor);
          };
          
          updateRequest.onerror = () => {
            console.error('Failed to update visitor info offline');
            reject(updateRequest.error);
          };
        } else {
          // Create new visitor
          const addRequest = store.add(visitor);
          
          addRequest.onsuccess = () => {
            console.log('Visitor info stored offline:', visitor);
            resolve(visitor);
          };
          
          addRequest.onerror = () => {
            console.error('Failed to store visitor info offline');
            reject(addRequest.error);
          };
        }
      };

      getRequest.onerror = () => {
        console.error('Failed to check existing visitor info');
        reject(getRequest.error);
      };
    });
  }

  // Get visitor information
  async getVisitorInfo(email) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['visitorInfo'], 'readonly');
      const store = transaction.objectStore('visitorInfo');
      const request = store.get(email);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error('Failed to get visitor info');
        reject(request.error);
      };
    });
  }

  // Update visitor contact tracking
  async updateVisitorContactTracking(email, contactData, isOffline = true) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['visitorInfo'], 'readwrite');
      const store = transaction.objectStore('visitorInfo');
      
      const getRequest = store.get(email);
      
      getRequest.onsuccess = () => {
        const visitor = getRequest.result;
        
        if (visitor) {
          const contactTracking = {
            localId: contactData.id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            contactEmail: contactData.email,
            contactName: `${contactData.firstName} ${contactData.lastName}`,
            createdAt: new Date().toISOString(),
            synced: !isOffline,
            syncedAt: isOffline ? null : new Date().toISOString()
          };
          
          if (isOffline) {
            visitor.offlineContactsCreated = visitor.offlineContactsCreated || [];
            visitor.offlineContactsCreated.push(contactTracking);
            console.log('Added offline contact tracking:', contactTracking);
          } else {
            visitor.contactsCreated = visitor.contactsCreated || [];
            visitor.contactsCreated.push(contactTracking);
            console.log('Added online contact tracking:', contactTracking);
          }
          
          visitor.lastUpdated = new Date().toISOString();
          
          const updateRequest = store.put(visitor);
          
          updateRequest.onsuccess = () => {
            console.log('Visitor contact tracking updated successfully. Total contacts:', 
              (visitor.contactsCreated?.length || 0) + (visitor.offlineContactsCreated?.length || 0));
            resolve(visitor);
          };
          
          updateRequest.onerror = () => {
            console.error('Failed to update visitor contact tracking');
            reject(updateRequest.error);
          };
        } else {
          console.error('Visitor not found for contact tracking:', email);
          reject(new Error('Visitor not found'));
        }
      };

      getRequest.onerror = () => {
        console.error('Failed to get visitor for contact tracking update');
        reject(getRequest.error);
      };
    });
  }

  // Mark offline contact as synced for visitor
  async markVisitorContactSynced(email, localId, serverContactId) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['visitorInfo'], 'readwrite');
      const store = transaction.objectStore('visitorInfo');
      
      const getRequest = store.get(email);
      
      getRequest.onsuccess = () => {
        const visitor = getRequest.result;
        
        if (visitor) {
          // Find and update the offline contact
          const offlineContact = visitor.offlineContactsCreated?.find(c => c.localId === localId);
          
          if (offlineContact) {
            // Mark as synced
            offlineContact.synced = true;
            offlineContact.syncedAt = new Date().toISOString();
            
            // Move to regular contacts created
            if (!visitor.contactsCreated) {
              visitor.contactsCreated = [];
            }
            
            visitor.contactsCreated.push({
              contactId: serverContactId,
              contactEmail: offlineContact.contactEmail,
              contactName: offlineContact.contactName,
              createdAt: offlineContact.createdAt,
              syncedAt: new Date().toISOString()
            });
            
            // Remove from offline contacts
            visitor.offlineContactsCreated = visitor.offlineContactsCreated.filter(c => c.localId !== localId);
          }
          
          visitor.lastUpdated = new Date().toISOString();
          
          const updateRequest = store.put(visitor);
          
          updateRequest.onsuccess = () => {
            console.log('Visitor contact marked as synced:', visitor);
            resolve(visitor);
          };
          
          updateRequest.onerror = () => {
            console.error('Failed to mark visitor contact as synced');
            reject(updateRequest.error);
          };
        } else {
          reject(new Error('Visitor not found'));
        }
      };

      getRequest.onerror = () => {
        console.error('Failed to get visitor for sync update');
        reject(getRequest.error);
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
      
      // Get all contacts and filter them instead of using index
      const request = store.getAll();

      request.onsuccess = () => {
        const allContacts = request.result || [];
        // Filter for unsynced contacts
        const unsyncedContacts = allContacts.filter(contact => 
          contact && contact.synced === false
        );
        resolve(unsyncedContacts);
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
          synced: contacts.filter(c => c && c.synced === true).length,
          unsynced: contacts.filter(c => c && c.synced === false).length
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
        const syncedContacts = contacts.filter(contact => contact && contact.synced === true);
        
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
      const transaction = this.db.transaction(['contacts', 'visitorInfo'], 'readwrite');
      
      const clearContacts = new Promise((resolveContacts, rejectContacts) => {
        const contactsRequest = transaction.objectStore('contacts').clear();
        contactsRequest.onsuccess = () => resolveContacts();
        contactsRequest.onerror = () => rejectContacts(contactsRequest.error);
      });
      
      const clearVisitorInfo = new Promise((resolveVisitor, rejectVisitor) => {
        const visitorRequest = transaction.objectStore('visitorInfo').clear();
        visitorRequest.onsuccess = () => resolveVisitor();
        visitorRequest.onerror = () => rejectVisitor(visitorRequest.error);
      });

      Promise.all([clearContacts, clearVisitorInfo])
        .then(() => {
          console.log('All offline data cleared');
          resolve();
        })
        .catch((error) => {
          console.error('Failed to clear offline data');
          reject(error);
        });
    });
  }
  // Force database recreation (for testing)
  forceRecreate() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close();
      }
      
      const deleteRequest = indexedDB.deleteDatabase(this.dbName);
      
      deleteRequest.onsuccess = () => {
        console.log('Database deleted successfully');
        this.db = null;
        this.init().then(resolve).catch(reject);
      };
      
      deleteRequest.onerror = () => {
        console.error('Failed to delete database');
        reject(deleteRequest.error);
      };
    });
  }
}

export default new PublicOfflineStorage();
 