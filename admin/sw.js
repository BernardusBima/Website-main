// Tentukan nama cache
const CACHE_NAME = 'netlify-cms-pwa-v1';

// Daftar file inti yang harus di-cache (App Shell)
// Ini adalah file dari index.html Anda + config.yml yang penting
const URLS_TO_CACHE = [
  './', // Ini akan merujuk ke 'admin/index.html'
  './config.yml',
  'https://identity.netlify.com/v1/netlify-identity-widget.js',
  'https://unpkg.com/netlify-cms@^2.0.0/dist/netlify-cms.js'
];

// 1. Event 'install': P caching file-file inti
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache dibuka, menambahkan file inti...');
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // Memaksa service worker baru untuk aktif
  );
});

// 2. Event 'activate': Membersihkan cache lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Mengambil kontrol halaman
  );
});

// 3. Event 'fetch': Menyajikan konten dari cache (Cache-First)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika file ada di cache, langsung kembalikan dari cache
        if (response) {
          return response;
        }

        // Jika tidak ada di cache, ambil dari jaringan
        return fetch(event.request).then(
          networkResponse => {
            // Cek apakah respons valid
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              // Hati-hati: Kita tidak men-cache aset dari unpkg/identity (non-basic)
              // kecuali saat instalasi awal.
              return networkResponse;
            }

            // Simpan respons ke cache untuk lain kali
            // (Kita kloning respons karena akan digunakan)
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
      })
  );
});