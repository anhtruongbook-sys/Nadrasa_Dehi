// Service Worker for Neta Light & Poker PWA - Offline & Cache Architecture v14.5
const CACHE_NAME = 'neta-poker-v14.5';

const CORE_ASSETS = [
  './',
  'index.html',
  'styles.css',
  'html2canvas.min.js',
  'modules/html2pdf.bundle.min.js',
  'cards_base64_data.js',
  'poker_base64_data.js',
  'tarot_base64_data.js',
  'lakinh_base64_data.js',
  'phap_hanh_base64_data.js',
  'cards_data.js',
  'poker_data.js',
  'app.js',
  'manifest.json',
  'anh_logo.jpg',
  'Anh Logo.jpg',
  'neta_cards/card_back.png',
  'neta_cards/phap_an.jpg',
  'Porker/card_back.png',
  'icons/apple-touch-icon.png',
  'favicon.ico',
  'engines/calendar_engine.js',
  'engines/smart_picker.js',
  'engines/qmdj_engine.js',
  'engines/qmdj_fengshui.js',
  'engines/thai_at_engine.js',
  'engines/thai_at_interpreter.js',
  'engines/thai_at_fengshui.js',
  'modules/thai_at_view.js',
  'engines/luc_nham_engine.js',
  'engines/luc_nham_interpreter.js',
  'engines/luc_nham_fengshui.js',
  'modules/luc_nham_view.js',
  'engines/bazi_engine.js',
  'engines/tuvi_engine.js',
  'engines/tarot_engine.js',
  'modules/calendar_view.js',
  'modules/qmdj_view.js',
  'modules/bazi_view.js',
  'modules/tuvi_view.js',
  'modules/tarot_view.js',
  'assets/tarot/Major_00_Fool.webp',
  'assets/tarot/Back_Cover.webp',
  'assets/leaflet/leaflet.css',
  'assets/leaflet/leaflet.js',
  'assets/lakinh/lakinh.css',
  'assets/lakinh/thuoc_lap_cuc.png',
  'assets/lakinh/thuoc_lap_cuc_trans.png',
  'assets/lakinh/thuoc_lap_cuc_gold.png',
  'phap_hanh.css',
  'modules/phap_hanh_data.js',
  'modules/phap_hanh_view.js',
  'engines/hkdq_data.js',
  'engines/tam_hop_engine.js',
  'engines/tam_long_engine.js',
  'engines/lakinh_engine.js',
  'modules/lakinh_view.js',
  'assets/dialy/dialy.css',
  'modules/dialy_view.js',
  'assets/dichhoc/dichhoc.css',
  'engines/dichhoc_engine.js',
  'engines/luc_hao_2_engine.js',
  'engines/luc_hao_phong_thuy_engine.js',
  'modules/dichhoc_view.js',
  'engines/trachcat_data.js',
  'engines/trach_nhat_engine.js',
  'modules/trachcat_view.js',
  'modules/xlsx.full.min.js',
  'engines/diachinh_engine.js',
  'modules/diachinh_view.js',
  'assets/xindai/xindai.css',
  'assets/xindai/audio_b64.js',
  'assets/xindai/dia_tron_su.png',
  'assets/xindai/mat_duong.png',
  'assets/xindai/mat_am.png',
  'assets/xindai/dia_am_duong_phong_thuy.png',
  'assets/xindai/tieng_xu_roi_dia_su.wav',
  'modules/xindai_view.js'
];

// Thêm toàn bộ 18 Nơi Tại Phủ và 23 Bài học Pháp Hành
for (let i = 1; i <= 18; i++) {
  const num = i < 10 ? '0' + i : '' + i;
  CORE_ASSETS.push(`assets/phap_hanh/phu_${num}.jpg`);
}
for (let i = 1; i <= 26; i++) {
  const num = i < 10 ? '0' + i : '' + i;
  CORE_ASSETS.push(`assets/phap_hanh/lesson_${num}.jpg`);
}

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

// Cài đặt và kích hoạt ngay lập tức với chia nhỏ batch tải (chống nghẽn socket server)
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const CHUNK_SIZE = 10;
      for (let i = 0; i < CORE_ASSETS.length; i += CHUNK_SIZE) {
        const chunk = CORE_ASSETS.slice(i, i + CHUNK_SIZE);
        await Promise.allSettled(
          chunk.map((asset) =>
            cache.add(asset).catch((err) => {
              console.warn('Pre-cache asset warning:', asset, err);
            })
          )
        );
      }
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
// 1. Ảnh tĩnh: Cache-First
// 2. HTML/JS/CSS: Network-First (Fallback Cache an toàn khi lỗi mạng hoặc 502/503)
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
      caches.match(e.request, { ignoreSearch: true }).then((cached) => {
        if (cached) return cached;
        return fetch(e.request)
          .then((networkResp) => {
            if (networkResp && networkResp.status === 200) {
              const clone = networkResp.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
              return networkResp;
            }
            return cached || networkResp;
          })
          .catch(() => cached);
      })
    );
    return;
  }

  // Các file mã nguồn HTML, CSS, JS -> Network First với fallback Cache khi gặp lỗi kết nối hoặc 5xx
  e.respondWith(
    fetch(e.request)
      .then((networkResp) => {
        if (networkResp && networkResp.status === 200) {
          const clone = networkResp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          return networkResp;
        }
        // Nếu server báo lỗi 502/503/404, lập tức lấy bản cache hợp lệ đang có
        return caches.match(e.request, { ignoreSearch: true }).then((cached) => cached || networkResp);
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
