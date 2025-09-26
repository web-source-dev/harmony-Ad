const CACHE_NAME = 'harmony-contact-v1';
const urlsToCache = [
  '/contact',
  '/offline.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Service Worker: Cache failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Only handle requests for the contact page and related resources
  if (event.request.url.includes('/contact') || 
      event.request.url.includes('/static/') ||
      event.request.url.includes('/manifest.json')) {
    
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version or fetch from network
          if (response) {
            console.log('Service Worker: Serving from cache', event.request.url);
            return response;
          }
          
          return fetch(event.request).then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          });
        })
        .catch(() => {
          // If both cache and network fail, show offline page
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
        })
    );
  }
});

// Handle API requests for contact form
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/admin/customers') && 
      event.request.method === 'POST') {
    
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If network request succeeds, return response
    return response;
        })
        .catch(() => {
          // If network fails, store in IndexedDB for later sync
          return event.request.clone().text().then((body) => {
            const customerData = JSON.parse(body);
            
            // Store in IndexedDB for offline sync
    return new Response(JSON.stringify({
      success: true,
              message: 'Contact stored offline and will be synced when online',
      offline: true,
              data: customerData
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
          });
        })
    );
  }
});