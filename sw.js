// Service Worker for Neta Light PWA - Offline & Cache Architecture
const CACHE_NAME = 'neta-light-v3.4';

const CARD_ASSETS = [
  './',
  'index.html',
  'styles.css?v=3.4',
  'app.js?v=3.4',
  'cards_data.js?v=3.4',
  'manifest.json?v=3.4',
  'neta_cards/card_back.png',
  'neta_cards/phap_an.jpg',
  'icons/apple-touch-icon.png',
  'icons/favicon-32x32.png',
  'favicon.ico'
];

// Thêm toàn bộ 48 quân bài Neta Light vào danh sách nạp trước
for (let i = 1; i <= 48; i++) {
  const num = i < 10 ? '0' + i : '' + i;
  CARD_ASSETS.push(`neta_cards/card_${num}.png`);
}

// Cài đặt và nạp trước toàn bộ kho bài vào bộ nhớ máy
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Dùng nạp từng phần để không bị fail toàn bộ nếu 1 asset có vấn đề
      return Promise.allSettled(
        CARD_ASSETS.map((asset) =>
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
// 1. Ảnh bài (.png, .jpg): Cache-First (Lấy ngay trong máy, nếu chưa có mới tải qua mạng rồi lưu lại)
// 2. Mã nguồn (HTML, CSS, JS): Network-First (Lấy mã mới nhất, mất mạng thì lấy cache)
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
