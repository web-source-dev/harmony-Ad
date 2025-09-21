// Service Worker for offline functionality
const CACHE_NAME = 'harmony-admin-v1';
const OFFLINE_CUSTOMERS_KEY = 'offline_customers';
const SYNC_QUEUE_KEY = 'sync_queue';

// Resources to cache for offline functionality
const CACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  // Add other static assets that might be needed
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell...');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        console.log('App shell cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache app shell:', error);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// Fetch event for offline handling
self.addEventListener('fetch', (event) => {
  // Handle API requests for customers
  if (event.request.url.includes('/api/admin/customers') && 
      event.request.method === 'POST') {
    event.respondWith(handleCustomerCreation(event.request));
    return;
  }

  // Handle navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If offline, serve the cached index.html
          return caches.match('/') || caches.match('/index.html');
        })
    );
    return;
  }

  // Handle other requests (JS, CSS, images, etc.)
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }
        
        // Otherwise, try to fetch from network
        return fetch(event.request)
          .then((response) => {
            // Cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseClone);
                });
            }
            return response;
          })
          .catch(() => {
            // If request fails and it's for an image, return a placeholder
            if (event.request.destination === 'image') {
              return new Response('', {
                status: 200,
                statusText: 'OK',
                headers: { 'Content-Type': 'image/svg+xml' }
              });
            }
            throw new Error('Network request failed');
          });
      })
  );
});

// Handle customer creation requests
async function handleCustomerCreation(request) {
  try {
    // Try to make the request online first
    const response = await fetch(request);
    return response;
  } catch (error) {
    console.log('Network error, storing customer offline:', error);
    
    // If offline, store the customer data for later sync
    const customerData = await request.clone().json();
    await storeOfflineCustomer(customerData);
    
    // Return a success response to the frontend
    return new Response(JSON.stringify({
      success: true,
      offline: true,
      message: 'Customer stored offline and will be synced when online'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Store customer data offline
async function storeOfflineCustomer(customerData) {
  const db = await openIndexedDB();
  const transaction = db.transaction(['customers'], 'readwrite');
  const store = transaction.objectStore('customers');
  
  const offlineCustomer = {
    ...customerData,
    id: Date.now() + Math.random(), // Temporary ID
    createdAt: new Date().toISOString(),
    offline: true,
    synced: false
  };
  
  await store.add(offlineCustomer);
  
  // Update sync queue
  await updateSyncQueue('create', offlineCustomer);
  
  console.log('Customer stored offline:', offlineCustomer);
}

// Update sync queue
async function updateSyncQueue(action, data) {
  const db = await openIndexedDB();
  const transaction = db.transaction(['syncQueue'], 'readwrite');
  const store = transaction.objectStore('syncQueue');
  
  const syncItem = {
    id: Date.now() + Math.random(),
    action,
    data,
    timestamp: new Date().toISOString(),
    attempts: 0
  };
  
  await store.add(syncItem);
}

// Open IndexedDB
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('HarmonyAdminDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create customers store
      if (!db.objectStoreNames.contains('customers')) {
        const customerStore = db.createObjectStore('customers', { keyPath: 'id' });
        customerStore.createIndex('synced', 'synced', { unique: false });
        customerStore.createIndex('offline', 'offline', { unique: false });
      }
      
      // Create sync queue store
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'customer-sync') {
    event.waitUntil(syncOfflineCustomers());
  }
});

// Sync offline customers when online
async function syncOfflineCustomers() {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['syncQueue'], 'readonly');
    const store = transaction.objectStore('syncQueue');
    const syncItems = await store.getAll();
    
    for (const item of syncItems) {
      if (item.action === 'create') {
        try {
          const response = await fetch('/api/admin/customers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(item.data)
          });
          
          if (response.ok) {
            // Remove from sync queue
            const deleteTransaction = db.transaction(['syncQueue'], 'readwrite');
            const deleteStore = deleteTransaction.objectStore('syncQueue');
            await deleteStore.delete(item.id);
            
            // Remove customer from IndexedDB after successful sync
            const customerTransaction = db.transaction(['customers'], 'readwrite');
            const customerStore = customerTransaction.objectStore('customers');
            await customerStore.delete(item.data.id);
            
            console.log('Customer synced and removed from offline storage:', item.data);
          }
        } catch (error) {
          console.error('Failed to sync customer:', error);
          // Increment attempts counter
          item.attempts += 1;
          if (item.attempts < 3) {
            const updateTransaction = db.transaction(['syncQueue'], 'readwrite');
            const updateStore = updateTransaction.objectStore('syncQueue');
            await updateStore.put(item);
          }
        }
      }
    }
  } catch (error) {
    console.error('Sync process failed:', error);
  }
}

// Listen for online/offline events
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'ONLINE_STATUS_CHANGED') {
    if (event.data.isOnline) {
      // Trigger sync when coming online
      syncOfflineCustomers();
    }
  }
});
