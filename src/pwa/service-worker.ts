import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({url, request}) => (url.origin === 'https://firestore.googleapis.com' || url.origin === 'https://securetoken.googleapis.com') && request.method === 'GET',
  new StaleWhileRevalidate({
    cacheName: 'api-read-cache',
  })
);

registerRoute(
  ({url, request}) => (url.origin === 'https://firestore.googleapis.com' || url.origin === 'https://securetoken.googleapis.com') && request.method !== 'GET',
  new NetworkFirst({
    cacheName: 'api-write-cache',
  })
);

registerRoute(
  ({request}) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    plugins: [
      {
        handlerDidError: async () => Response.redirect('/offline.html', 302),
      }
    ]
  })
);