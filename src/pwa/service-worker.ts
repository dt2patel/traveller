/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { offlineFallback } from 'workbox-recipes';

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST || []);

registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({ cacheName: 'pages' })
);

registerRoute(
  ({ url }) => url.origin.includes('firestore.googleapis.com'),
  new StaleWhileRevalidate({ cacheName: 'api' })
);

offlineFallback({ pageFallback: '/offline.html' });
