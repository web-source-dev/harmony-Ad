import React, { createContext, useContext, useState, useEffect } from 'react';

const NetworkContext = createContext(null);

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(() => {
    // Initialize with navigator.onLine, but also check for cached content
    return navigator.onLine;
  });
  const [wasOffline, setWasOffline] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [cacheVersion, setCacheVersion] = useState(() => {
    // Generate a unique cache version for this session
    return `harmony-admin-v${Date.now()}`;
  });

  useEffect(() => {
    // Check if we have cached content (indicating offline capability)
    const checkOfflineCapability = async () => {
      if ('caches' in window) {
        try {
          const cache = await caches.open('harmony-admin-v1');
          const cachedResponse = await cache.match('/');
          if (cachedResponse) {
            console.log('Offline capability detected - cached content available');
          }
        } catch (error) {
          console.log('No cached content available');
        }
      }
      setIsInitialized(true);
    };

    // Auto-clear cache for online users on page load (not refresh)
    const handleCacheManagement = async () => {
      if (navigator.onLine && 'caches' in window) {
        try {
          console.log('User is online - clearing cache and setting up fresh cache');
          
          // Clear all existing caches
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => {
              console.log(`Deleting cache: ${cacheName}`);
              return caches.delete(cacheName);
            })
          );
          
          console.log('All caches cleared successfully');
          
          // Set up fresh cache after 5 seconds
          setTimeout(async () => {
            if (navigator.onLine) {
              console.log('Setting up fresh cache after 5 seconds...');
              await preCacheImportantPages();
            }
          }, 5000);
          
        } catch (error) {
          console.error('Failed to clear cache:', error);
        }
      } else {
        console.log('User is offline - preserving cache');
        await checkOfflineCapability();
      }
    };

    // Only clear cache on initial page load, not on refresh
    const isPageRefresh = performance.getEntriesByType('navigation')[0]?.type === 'reload';
    if (!isPageRefresh) {
      handleCacheManagement();
    } else {
      console.log('Page refresh detected - preserving cache');
      checkOfflineCapability();
    }

    const handleOnline = () => {
      console.log('Network: Online');
      setIsOnline(true);
      
      // If we were offline and now online, trigger sync
      if (wasOffline) {
        setWasOffline(false);
        // Notify service worker about online status
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'ONLINE_STATUS_CHANGED',
            isOnline: true
          });
        }
      }
    };

    const handleOffline = () => {
      console.log('Network: Offline');
      setIsOnline(false);
      setWasOffline(true);
      
      // Notify service worker about offline status
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'ONLINE_STATUS_CHANGED',
          isOnline: false
        });
      }
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker with cache version
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
          
          // Wait for service worker to be ready
          return navigator.serviceWorker.ready;
        })
        .then((registration) => {
          console.log('Service Worker is ready');
          
          // Send cache version to service worker
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'CACHE_VERSION_UPDATE',
              version: cacheVersion
            });
          }
          
          // Pre-cache important pages when online (only if not refreshing)
          if (navigator.onLine && !isPageRefresh) {
            // Don't pre-cache immediately if we just cleared cache
            // The cache will be set up after 5 seconds in handleCacheManagement
          }
          
          // Register background sync
          if ('sync' in window.ServiceWorkerRegistration.prototype) {
            return registration.sync.register('customer-sync');
          }
        })
        .then(() => {
          console.log('Background sync registered successfully');
        })
        .catch((error) => {
          console.error('Service Worker setup failed:', error);
        });
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  // Pre-cache only the Create Contact page when online
  const preCacheImportantPages = async () => {
    if ('caches' in window && navigator.onLine) {
      try {
        // Use the current cache version
        const cache = await caches.open(cacheVersion);
        console.log(`Using cache version: ${cacheVersion}`);
        
        // Only cache the Create Contact page
        const importantPages = [
          '/contact-intake'
        ];
        
        // Cache only the Create Contact page
        await Promise.allSettled(
          importantPages.map(async (page) => {
            try {
              const response = await fetch(page, {
                cache: 'no-cache', // Always fetch fresh content
                headers: {
                  'Cache-Control': 'no-cache',
                  'Pragma': 'no-cache'
                }
              });
              if (response.ok) {
                // Clone the response to avoid consuming it
                const responseClone = response.clone();
                await cache.put(page, responseClone);
                console.log(`Pre-cached Create Contact page: ${page} with version ${cacheVersion}`);
              }
            } catch (error) {
              console.warn(`Failed to pre-cache Create Contact page:`, error);
            }
          })
        );
        
        console.log(`Create Contact page pre-cached successfully with version ${cacheVersion}`);
      } catch (error) {
        console.error('Failed to pre-cache Create Contact page:', error);
      }
    }
  };

  const value = {
    isOnline,
    wasOffline,
    isInitialized,
    cacheVersion
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};
