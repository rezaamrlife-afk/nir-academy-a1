/* Registers the service worker (HTTPS or localhost only). Shared by all pages. */
(function () {
  'use strict';
  if (!('serviceWorker' in navigator)) return;
  var secure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (!secure) return;
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').catch(function () { /* app still works online */ });
  });
})();
