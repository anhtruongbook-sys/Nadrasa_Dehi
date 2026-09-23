// Service Worker for Neta Light & Poker PWA - Offline & Cache Architecture v5.0
-const CACHE_NAME = 'neta-poker-v5.0';
+const CACHE_NAME = 'neta-poker-v5.0';

const CORE_ASSETS = [
  './',
  'index.html',
  'styles.css?v=5.0',
  'html2canvas.min.js',
  'cards_base64_data.js?v=5.0',
  'cards_data.js?v=5.0',
  'poker_data.js?v=5.0',
  'app.js?v=5.0',
  'manifest.json?v=5.0',
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

// Cài đặt và kích hoạt ngay lập tức không chờ đợi
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

// Xóa triệt để toàn bộ cache cũ khi phiên bản mới kích hoạt
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

// Chiến lược nạp tài nguyên:
// 1. Ảnh tĩnh (.png, .jpg, .webp): Cache-First
// 2. Mã nguồn (HTML, CSS, JS): Network-First, fallback về Cache nếu offline
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Xử lý ảnh tĩnh (.png, .jpg, .jpeg, .ico, .webp) -> Cache First
  if (
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.webp')
  ) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
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

  // Các file mã nguồn HTML, CSS, JS -> Network First để luôn nhận bản cập nhật mới nhất
  e.respondWith(
    fetch(e.request)
      .then((networkResp) => {
        if (networkResp && networkResp.status === 200) {
          const clone = networkResp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return networkResp;
      })
      .catch(() => caches.match(e.request))
  );
});
