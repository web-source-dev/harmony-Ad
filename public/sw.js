// Service Worker for Harmony Admin
let CACHE_NAME = 'harmony-admin-v2';
const CACHE_VERSION = 'harmony-admin-v1';

// Install event - cache important resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache opened');
        // Don't pre-cache anything during install
        // Cache will be managed by the NetworkContext
        return cache;
      })
      .catch((error) => {
        console.error('Service Worker: Install failed', error);
      })
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches that don't match current version
            if (cacheName !== CACHE_NAME && cacheName.startsWith('harmony-admin-')) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - use the network when it is available so a refresh picks up
// the sync fix, and fall back to cache only when the iPad is offline.
// IndexedDB (the pending contacts) is never touched here.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          }).catch(() => {});
        }
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        return new Response('Offline - Please check your internet connection', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
  );
});

// Message event - handle cache management commands
self.addEventListener('message', (event) => {
  console.log('Service Worker: Received message:', event.data);
  
  if (event.data && event.data.type === 'CACHE_VERSION_UPDATE') {
    console.log('Service Worker: Cache version updated to:', event.data.version);
    // Update cache name with new version
    CACHE_NAME = event.data.version;
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('Service Worker: Clearing all caches...');
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              console.log('Service Worker: Deleting cache:', cacheName);
              return caches.delete(cacheName);
            })
          );
        })
        .then(() => {
          console.log('Service Worker: All caches cleared');
          event.ports[0].postMessage({ success: true });
        })
        .catch((error) => {
          console.error('Service Worker: Failed to clear caches:', error);
          event.ports[0].postMessage({ success: false, error: error.message });
        })
    );
  }
  
  if (event.data && event.data.type === 'ONLINE_STATUS_CHANGED') {
    console.log('Service Worker: Online status changed to:', event.data.isOnline);
    // Handle online/offline status changes
    if (event.data.isOnline) {
      // User came online - could trigger sync here if needed
      console.log('Service Worker: User is online');
    } else {
      // User went offline
      console.log('Service Worker: User is offline');
    }
  }
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'customer-sync') {
    event.waitUntil(
      // Handle background sync for customer data
      console.log('Service Worker: Processing customer sync...')
    );
  }
});

// Push event (for future notifications)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received');
  
  if (event.data) {
    const data = event.data.json();
    console.log('Service Worker: Push data:', data);
    
    // Show notification
    event.waitUntil(
      self.registration.showNotification(data.title || 'Harmony 4 All', {
        body: data.body || 'You have a new notification',
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: 'harmony-notification'
      })
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  // Open the app
  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('Service Worker: Script loaded');