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

    checkOfflineCapability();

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

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
          
          // Wait for service worker to be ready
          return navigator.serviceWorker.ready;
        })
        .then((registration) => {
          console.log('Service Worker is ready');
          
          // Pre-cache important pages when online
          if (navigator.onLine) {
            preCacheImportantPages();
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
    if ('caches' in window) {
      try {
        const cache = await caches.open('harmony-admin-v1');
        // Only cache the Create Contact page
        const importantPages = [
          '/contacts/create'
        ];
        
        // Cache only the Create Contact page
        await Promise.allSettled(
          importantPages.map(async (page) => {
            try {
              const response = await fetch(page);
              if (response.ok) {
                await cache.put(page, response);
                console.log(`Pre-cached Create Contact page: ${page}`);
              }
            } catch (error) {
              console.warn(`Failed to pre-cache Create Contact page:`, error);
            }
          })
        );
        
        console.log('Create Contact page pre-cached successfully');
      } catch (error) {
        console.error('Failed to pre-cache Create Contact page:', error);
      }
    }
  };

  const value = {
    isOnline,
    wasOffline,
    isInitialized
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};
