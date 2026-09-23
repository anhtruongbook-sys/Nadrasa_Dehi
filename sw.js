// Service Worker for Neta Light & Poker PWA - Offline & Cache Architecture
const CACHE_NAME = 'neta-poker-v3.6';

const CORE_ASSETS = [
  './',
  'index.html',
  'styles.css?v=3.6',
  'app.js?v=3.6',
  'cards_data.js?v=3.6',
  'poker_data.js?v=3.6',
  'manifest.json?v=3.6',
  'neta_cards/card_back.png',
  'neta_cards/phap_an.jpg',
  'Porker/card_back.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32x32.png',
  'favicon.ico'
];

// Thêm toàn bộ 48 quân bài Neta Light
for (let i = 1; i <= 48; i++) {
  const num = i < 10 ? '0' + i : '' + i;
  CORE_ASSETS.push(`neta_cards/card_${num}.png`);
}

// Thêm toàn bộ 52 quân bài Poker
const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'];
for (const s of SUITS) {
  for (const r of RANKS) {
    CORE_ASSETS.push(`Porker/${r}_of_${s}.png`);
  }
}

// Cài đặt và nạp trước toàn bộ kho bài vào bộ nhớ máy
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        CORE_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn('Pre-cache asset warning:', asset, err);
          })
        )
      );
    })
  );
});

// Xóa cache phiên bản cũ khi phiên bản mới kích hoạt
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// Chiến lược định tuyến thông minh:
// 1. Ảnh bài (.png, .jpg): Cache-First
// 2. Mã nguồn (HTML, CSS, JS): Network-First
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Xử lý ảnh tĩnh (.png, .jpg, .ico, .webp) -> Cache First
  if (
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.ico')
  ) {
    e.respondWith(
      caches.match(e.request, { ignoreSearch: true }).then((cached) => {
        if (cached) return cached;
        return fetch(e.request)
          .then((networkResp) => {
            if (networkResp && networkResp.status === 200) {
              const clone = networkResp.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
            }
            return networkResp;
          })
          .catch(() => cached);
      })
    );
    return;
  }

  // Các tài nguyên khác -> Network First
  e.respondWith(
    fetch(e.request)
      .then((networkResp) => {
        if (networkResp && networkResp.status === 200) {
          const clone = networkResp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return networkResp;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
