'use strict';

// The files we want to cache
var urlsToCache = [
  '//agathao.github.io/Dominoes/dist/index.min.html',

  // Same list as in Gruntfile.js (for AppCache)
  '//agathao.github.io/Dominoes/dist/js/everything.min.js',
  '//agathao.github.io/Dominoes/dist/css/everything.min.css',
  "//agathao.github.io/Dominoes/dist/imgs/helper.svg",
  "//agathao.github.io/Dominoes/dist/imgs/icon.png",
  "//agathao.github.io/Dominoes/dist/imgs/iamge.svg",
  "//agathao.github.io/Dominoes/dist/imgs/image0.svg",
  "//agathao.github.io/Dominoes/dist/imgs/image1.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-0-0.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-0-1.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-0-2.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-0-3.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-0-4.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-0-5.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-0-6.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-1-1.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-1-2.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-1-3.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-1-4.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-1-5.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-1-6.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-2-1.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-2-2.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-2-3.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-2-4.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-2-5.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-2-6.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-3-3.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-3-4.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-3-5.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-3-6.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-4-4.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-4-5.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-4-6.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-5-5.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-5-6.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-6-6.svg",
  "//agathao.github.io/Dominoes/dist/imgs/domino-blank.svg",
];
var CACHE_NAME = 'cache-v2017-04-09T10:34:13.273Z';

self.addEventListener('activate', function(event) {
  event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
            cacheNames.map(function(cacheName) {
              if (cacheName != CACHE_NAME) {
                return caches.delete(cacheName);
              }
            })
        );
      })
  );
});

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          console.log('Service-worker: Cache hit for request ', event.request);
          return response;
        }
        //return fetch(event.request);

        console.log('Service-worker: Cache miss (fetching from internet) for request ', event.request);
        // Cache miss - fetch from the internet and put in cache (for things like avatars from FB).

        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have 2 stream.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                console.log('Service-worker: Storing in cache request ', event.request);
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});
