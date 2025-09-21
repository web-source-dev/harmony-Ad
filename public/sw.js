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
  '/favicon.ico',
  // React app routes that should work offline
  '/contacts/create',
  '/contacts',
  '/admin/login'
];

// Cache strategy types
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  CACHE_ONLY: 'cache-only',
  NETWORK_ONLY: 'network-only'
};

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell...');
        // Try to cache all URLs, but don't fail if some fail
        return Promise.allSettled(
          CACHE_URLS.map(url => 
            cache.add(url).catch(error => {
              console.warn(`Failed to cache ${url}:`, error);
              return null;
            })
          )
        );
      })
      .then(() => {
        console.log('App shell caching completed');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache app shell:', error);
        // Still skip waiting even if caching fails
        return self.skipWaiting();
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
  const request = event.request;
  const url = new URL(request.url);

  // Handle API requests for customers
  if (url.pathname.includes('/api/admin/customers') && 
      request.method === 'POST') {
    event.respondWith(handleCustomerCreation(request));
    return;
  }

  // Handle navigation requests (HTML pages) - CRITICAL for offline support
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle static assets (JS, CSS, images, etc.)
  event.respondWith(handleStaticAssetRequest(request));
});

// Handle navigation requests with aggressive caching
async function handleNavigationRequest(request) {
  try {
    // Try network first for navigation
    const networkResponse = await fetch(request);
    
    // If successful, cache the response
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed for navigation, trying cache:', request.url);
    
    // Network failed, try to serve from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('Serving cached navigation:', request.url);
      return cachedResponse;
    }
    
    // Try to serve index.html for any navigation request
    const indexResponse = await caches.match('/');
    if (indexResponse) {
      console.log('Serving cached index.html for:', request.url);
      return indexResponse;
    }
    
    // Last resort: return a basic offline page
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Harmony Admin - Offline</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .offline { color: #666; }
            .retry { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
          </style>
        </head>
        <body>
          <h1>Harmony Admin</h1>
          <p class="offline">You're currently offline</p>
          <p>Some features may not be available.</p>
          <button class="retry" onclick="location.reload()">Retry</button>
        </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Handle static asset requests with cache-first strategy
async function handleStaticAssetRequest(request) {
  try {
    // Try cache first for static assets
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, try network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Failed to fetch static asset:', request.url);
    
    // For images, return a placeholder
    if (request.destination === 'image') {
      return new Response('', {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'image/svg+xml' }
      });
    }
    
    // For other assets, return a basic error
    throw error;
  }
}

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
