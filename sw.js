const VERSION = 'v1';
const SHELL = 'tricalendar-shell-' + VERSION;
const DATA = 'tricalendar-data';
const FONTS = 'tricalendar-fonts';
const PRECACHE = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192x192.png', 'icons/icon-512x512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('tricalendar-shell-') && k !== SHELL).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = (await cache.match(req, {ignoreSearch: true})) || (await cache.match('./'));
    if (hit) return hit;
    throw err;
  }
}
async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const net = fetch(req).then(res => { if (res.ok || res.type === 'opaque') cache.put(req, res.clone()); return res; }).catch(() => hit);
  return hit || net;
}
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (url.pathname.endsWith('.ics')) return;
    if (url.pathname.endsWith('/data/races.json')) return e.respondWith(networkFirst(req, DATA));
    if (req.mode === 'navigate') return e.respondWith(networkFirst(req, SHELL));
    return e.respondWith(staleWhileRevalidate(req, SHELL));
  }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(staleWhileRevalidate(req, FONTS));
  }
});
