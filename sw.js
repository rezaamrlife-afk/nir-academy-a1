/* NIR Academy service worker
   - Pre-caches the app shell so pages open offline.
   - HTML, CSS and JS use "network first, cache as fallback", so deployed updates show up
     as soon as the device is online (no stale app).
   - Audio and other range requests are never cached. */
var CACHE = 'nir-a1-v2';
var SHELL = [
  './',
  'index.html',
  'unit-1.html',
  'unit-1.css',
  'unit-1.js',
  'unit-notes.css',
  'unit-notes.js',
  'unit-worksheet.js',
  'unit-listen-check.js',
  'unit-say.js',
  'unit-days.js',
  'unit-phrases.js',
  'unit-whereisit.js',
  'unit-be-quiz.js',
  'unit-pron-1b.js',
  'pwa.js',
  'manifest.webmanifest',
  'icon-180.png',
  'icon-192.png',
  'icon-512.png',
  'icon-512-maskable.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      /* add one by one so a missing optional file does not abort the install */
      return Promise.all(SHELL.map(function (url) {
        return cache.add(url).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.headers.has('range')) return;
  if (/\.(mp3|wav|ogg|m4a|aac|mp4|webm)$/i.test(url.pathname)) return;

  event.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok && res.type === 'basic') {
        var copy = res.clone();
        caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (hit) {
        if (hit) return hit;
        if (req.mode === 'navigate') return caches.match('index.html');
        return Response.error();
      });
    })
  );
});
