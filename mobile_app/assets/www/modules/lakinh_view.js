/**
 * NETA LIGHT - LAKINH SATELLITE VIEW MODULE (V2 - MOBILE-FIRST FULL VIEWPORT)
 * Tối đa hóa 100% diện tích quan sát Bản đồ Vệ tinh & La Kinh 36 Tầng
 * Hệ thống định vị GPS 2 tầng (High Accuracy + Network Fallback) & HUD Siêu Mỏng
 */

(function (global) {
  'use strict';

  let mapInstance = null;
  let currentLayer = null;
  let layers = {};
  let elevationLayerGroup = null;
  let surveyRayLayerGroup = null;
  let polygonLayerGroup = null;
  let userLocationLayerGroup = null;
  let searchMarkerLayerGroup = null;

  // Trạng thái vận hành
  const defaultSize = (typeof window !== 'undefined' && window.innerWidth < 500)
    ? Math.max(300, Math.min(Math.round(window.innerWidth * 0.92), 400))
    : 480;

  let state = {
    bgOpacity: 0.35, // Độ mờ nền tròn lót (0.0 = trong suốt 100% thấy rõ địa hình, 0.35 = kính mờ cân bằng, 0.85 = nền trắng)
    discOpacity: 1.0, // Độ đậm nét đĩa La Kinh
    activePlate: 'thuoc_trans', // Mặc định là Mica trong suốt 'thuoc_trans'
    size: defaultSize,
    rotation: 0.0,
    isSensorActive: false,
    isLocked: false,
    // Tia ngắm phong thủy (lập cực qua 1 điểm bất kỳ)
    isRayActive: false,
    isRayHudCollapsed: false, // Thu gọn floating HUD thành mini capsule khi bấm [✕]
    rayAngle: null, // Góc độ số của tia ngắm trên đĩa La Kinh (null = tự động trùng hướng nhà khi bật)
    rayDistance: 160, // Khoảng cách từ tâm đến điểm mục tiêu ghim trên bản vẽ (px)
    isDraggingRayTarget: false,
    // Bản vẽ mặt bằng kiến trúc (nằm dưới la kinh, tâm ảnh trùng tâm la kinh)
    planImageSrc: null,
    planScale: 1.0,
    planRotation: 0.0,
    planOpacity: 0.85,
    planOffsetX: 0,
    planOffsetY: 0,
    isPlanPanActive: false,
    isTracingPlot: false,
    isSheetOpen: false,
    isHudDetailOpen: false,
    polygonPoints: [],
    declination: -1.34,
    centerElevation: 19.0,
    centerCoords: [21.028511, 105.854167], // Mặc định Hà Nội
    userLocation: null, // [lat, lng] vị trí GPS thực tế của người dùng
    activeLayerName: 'googleSat',
    // Lớp Phủ Chiến Lược Kỳ Môn Độn Giáp (Joey Yap Compendium - Phase 3)
    isQmdjStratActive: false,
    isQmdjStratHudCollapsed: true,
    qmdjStratGoal: 'deal', // 'deal' | 'wealth' | 'career' | 'escape' | 'dispute'
    qmdjStratDate: null,
    // Phân Hệ Phong Thủy Tam Hợp Phái
    isTamHopActive: false,
    isTamHopHudCollapsed: true, // Mặc định thu gọn siêu mỏng không che La Kinh
    tamHopDuongCuc: 'tieu_cuc', // 'tieu_cuc' (20-40m) | 'trung_cuc' (40-350m) | 'dai_cuc' (350-2000m)
    tamHopCucData: {
      tieu_cuc: { deg: 115.0, son: 'Thìn', distM: 30 },
      trung_cuc: { deg: 115.0, son: 'Thìn', distM: 180 },
      dai_cuc: { deg: 115.0, son: 'Thìn', distM: 1000 }
    },
    tamHopThuyKhauDeg: 115.0, // Mặc định Thìn (Thủy Cục)
    tamHopDongChay: 'ta_dao_huu', // 'ta_dao_huu' (Dương thuận) | 'huu_dao_ta' (Âm nghịch)
    tamHopCanChu: 'Giáp',
    tamHopChiChu: 'Tý',
    tamHopNamChi: 'Thìn',
    tamHopMoTaSa: ''
  };
  if (typeof window !== 'undefined') {
    window.lakinhState = state;
  }

  function getPlateSrc(type) {
    if (type === 'thuoc_lap_cuc') {
      return (window.LAKINH_BASE64_DATA && window.LAKINH_BASE64_DATA['thuoc_lap_cuc.png'])
        || 'assets/lakinh/thuoc_lap_cuc.png';
    } else if (type === 'gold') {
      return (window.LAKINH_BASE64_DATA && window.LAKINH_BASE64_DATA['thuoc_lap_cuc_gold.png'])
        || 'assets/lakinh/thuoc_lap_cuc_gold.png';
    } else {
      return (window.LAKINH_BASE64_DATA && window.LAKINH_BASE64_DATA['thuoc_lap_cuc_trans.png'])
        || 'assets/lakinh/thuoc_lap_cuc_trans.png';
    }
  }

  function initLaKinhView() {
    const container = document.getElementById('view-lakinh');
    if (!container) return;
    renderLaKinh();
  }

  function renderLaKinh() {
    const container = document.getElementById('view-lakinh');
    if (!container) return;

    try {
      if (!container.querySelector('#lakinh-map')) {
        container.innerHTML = `
        <div id="lakinh-map"></div>

        <!-- Lớp Bản Vẽ Mặt Bằng Kiến Trúc (Nằm dưới La Kinh, Tâm Trùng Tâm La Kinh 100%) -->
        <div id="lakinh-floorplan-container">
          <div id="lakinh-floorplan-wrapper">
            <img id="lakinh-floorplan-img" alt="Mặt bằng kiến trúc" style="display: none;" />
          </div>
        </div>

        <div id="lakinh-crosshair"></div>

        <!-- Nút Nổi Bay Về Vị Trí Hiện Tại (My Location FAB - Siêu Gọn) -->
        <button id="lakinh-btn-my-location" title="Bay về vị trí GPS thực tế hiện tại của bạn" aria-label="Về vị trí hiện tại">
          <span style="font-size: 1.15rem; line-height: 1;">📍</span>
        </button>

        <!-- Đĩa La Kinh / Thước Lập Cực 36 Tầng Xuyên Thấu Siêu Nét -->
        <div id="lakinh-overlay-container" style="width: ${state.size}px; height: ${state.size}px;">
          <div id="lakinh-backdrop-circle" style="opacity: ${state.bgOpacity};"></div>
          <img id="lakinh-disc" src="${getPlateSrc(state.activePlate)}" alt="Thước Lập Cực 36 Tầng" style="opacity: ${state.discOpacity};" />
          <!-- Lớp Vector Kỳ Môn Chiến Lược Joey Yap (Phase 3) -->
          <svg id="lakinh-qmdj-svg" viewBox="0 0 1000 1000" style="${state.isQmdjStratActive ? '' : 'display: none;'}">
            <defs>
              <filter id="qmdj-glow-green" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="qmdj-glow-gold" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <marker id="qmdj-arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#22c55e" />
              </marker>
              <marker id="qmdj-arrow-gold" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#eab308" />
              </marker>
            </defs>
            <g id="lakinh-qmdj-svg-content"></g>
          </svg>
          <!-- Lớp Vector Phong Thủy Tam Hợp Phái (Thủy Khẩu, 4 Cung Cốt Tử, Hoàng Tuyền, Bát Sát, Tam Cát) -->
          <svg id="lakinh-tamhop-svg" viewBox="0 0 1000 1000" style="${state.isTamHopActive ? '' : 'display: none;'}">
            <defs>
              <filter id="tamhop-glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="tamhop-glow-gold" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="tamhop-glow-red" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <marker id="tamhop-arrow-cyan" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#06b6d4" />
              </marker>
              <marker id="tamhop-arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
              </marker>
              <marker id="tamhop-arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
              </marker>
            </defs>
            <g id="lakinh-tamhop-svg-content"></g>
          </svg>
          <!-- Thập Đạo Chỉ Tuyến Trục Dọc (Hướng 12h - Tọa 6h) Chuẩn Xác Tuyệt Đối -->
          <div id="lakinh-target-pointer">
            <div class="pointer-line-vertical"></div>
            <div class="pointer-huong-marker">
              <div class="pointer-huong-badge">HƯỚNG ĐO 12h</div>
              <div class="pointer-huong-arrow"></div>
            </div>
            <div class="pointer-toa-marker">
              <div class="pointer-toa-arrow"></div>
              <div class="pointer-toa-badge">TỌA SƠN 6h</div>
            </div>
          </div>
        </div>

        <!-- Lớp Vector Tia Ngắm Phong Thủy Siêu Nét (Laser Sighting Ray & Draggable Target) -->
        <div id="lakinh-ray-container" style="${state.isRayActive ? '' : 'display: none;'}">
          <svg id="lakinh-ray-svg">
            <defs>
              <filter id="ray-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <marker id="ray-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#06b6d4" />
              </marker>
            </defs>
            <circle id="ray-distance-circle" cx="0" cy="0" r="0" fill="none" stroke="rgba(6, 182, 212, 0.28)" stroke-dasharray="4, 4" />
            <line id="ray-line-full" x1="0" y1="0" x2="0" y2="0" stroke="rgba(6, 182, 212, 0.65)" stroke-width="2" stroke-dasharray="6, 4" />
            <line id="ray-line-target" x1="0" y1="0" x2="0" y2="0" stroke="#06b6d4" stroke-width="3" filter="url(#ray-glow)" marker-end="url(#ray-arrow)" />
          </svg>

          <!-- Điểm Mục Tiêu Ghim Bất Kỳ (Draggable Target Handle) -->
          <div id="lakinh-ray-target-handle" title="Kéo rê điểm này đến vị trí cần đo trên mặt bằng">
            <div class="ray-target-pulse"></div>
            <div class="ray-target-dot"></div>
          </div>
        </div>

        <!-- Stack Gom Nhóm Các Mini Capsule & Floating HUD (Không Che La Kinh) -->
        <div id="lakinh-hud-capsule-stack">
          <!-- 1. Mini Card Thu Gọn Của Ray HUD -->
          <div id="lakinh-ray-mini-pill" class="lakinh-ray-mini-card" style="display: none;">
            <div class="ray-mini-header-row">
              <div class="ray-mini-deg-box" id="btn-ray-mini-expand-header" title="Chạm để xem bảng thông số chi tiết">
                <span class="ray-mini-icon">🎯</span>
                <span class="ray-mini-deg" id="ray-mini-deg">0.0°</span>
                <span class="hud-capsule-sep">•</span>
                <span class="ray-mini-son" id="ray-mini-son">Sơn Tý (Khảm)</span>
              </div>
              <div class="ray-mini-actions">
                <button type="button" id="btn-ray-mini-expand" class="ray-mini-btn-expand" title="Xem chi tiết">▾ Chi tiết</button>
                <button type="button" id="btn-ray-mini-close" class="ray-mini-close-btn" title="Tắt tia ngắm">✕</button>
              </div>
            </div>
            <div class="ray-mini-hkdq-row" id="ray-mini-hkdq-strip" title="Chạm để xem bảng phân kim 64 Quẻ 384 Hào chi tiết">
              <div class="hkdq-row-left">
                <span class="hkdq-qp-icon">🔱</span>
                <span class="hkdq-qp-que" id="ray-mini-que">Bát Thuần Khôn</span>
              </div>
              <div class="hkdq-row-right">
                <span class="hkdq-qp-khivan" id="ray-mini-khivan">Khí 1 • Vận 1</span>
                <span class="hkdq-qp-sep">•</span>
                <span class="hkdq-qp-hao" id="ray-mini-hao">Hào 6</span>
                <span class="hkdq-qp-tag chinh" id="ray-mini-badge">⛰️ Chính Thần V9</span>
              </div>
            </div>
          </div>

          <!-- 2. Floating QMDJ Strategic HUD Card (Phase 3) -->
          <div id="lakinh-qmdj-floating-hud" class="lakinh-glass-panel ${state.isQmdjStratHudCollapsed ? 'is-collapsed' : ''}" style="${state.isQmdjStratActive ? '' : 'display: none;'}">
            <div class="qmdj-hud-header">
              <div class="qmdj-hud-title-group">
                <span class="qmdj-hud-title">⚔️ KỲ MÔN CHIẾN LƯỢC</span>
                <button type="button" id="btn-qmdj-hud-time-picker" class="qmdj-hud-time-btn" title="Bấm để đổi Ngày &amp; Giờ tác chiến">
                  <span class="qmdj-clock-icon">🕒</span>
                  <span id="qmdj-hud-time">Giờ Hiện Tại</span>
                  <span class="qmdj-time-edit-badge">✏️ Đổi giờ</span>
                </button>
                <button type="button" id="btn-qmdj-reset-now" class="qmdj-hud-reset-btn" title="Quay về giờ hiện tại thực tế" style="${state.qmdjStratDate ? 'display: inline-flex;' : 'display: none;'}">
                  ↺ Hiện tại
                </button>
              </div>
              <div class="qmdj-hud-actions">
                <button type="button" id="btn-qmdj-hud-guide" class="ray-hud-action-btn guide" title="Xem hướng dẫn giải nghĩa các phương vị chiến lược">ℹ️ Hướng dẫn</button>
                <button type="button" id="btn-qmdj-hud-collapse" class="ray-hud-action-btn collapse" title="Thu gọn ô chiến lược">${state.isQmdjStratHudCollapsed ? '+ Mở rộng' : '– Thu gọn'}</button>
                <button type="button" id="btn-qmdj-hud-close" class="ray-hud-action-btn close" title="Tắt lớp chiến lược">✕ Tắt</button>
              </div>
            </div>

            <!-- Thanh Tóm Tắt Khi Thu Gọn (Mini Capsule Cao ~32px Không Che La Kinh) -->
            <div id="qmdj-hud-compact-summary" class="qmdj-hud-compact-summary" style="${state.isQmdjStratHudCollapsed ? 'display: flex;' : 'display: none;'}">
              <span class="compact-pill green" id="compact-hud-back">🟢 Tọa: Đang tính...</span>
              <span class="compact-pill purple" id="compact-hud-aud">🎯 Ép: Đang tính...</span>
              <span class="compact-pill gold" id="compact-hud-horse">🐎 Mã: Đang tính...</span>
            </div>

            <!-- 5 Mục Tiêu Tác Chiến Mini Pills -->
            <div class="qmdj-hud-pills" style="${state.isQmdjStratHudCollapsed ? 'display: none;' : 'display: flex;'}">
              <button type="button" class="qmdj-hud-pill-btn ${state.qmdjStratGoal === 'deal' ? 'active' : ''}" data-goal="deal">💼 Đàm Phán</button>
              <button type="button" class="qmdj-hud-pill-btn ${state.qmdjStratGoal === 'wealth' ? 'active' : ''}" data-goal="wealth">💰 Cầu Tài</button>
              <button type="button" class="qmdj-hud-pill-btn ${state.qmdjStratGoal === 'career' ? 'active' : ''}" data-goal="career">📈 Thăng Tiến</button>
              <button type="button" class="qmdj-hud-pill-btn ${state.qmdjStratGoal === 'escape' ? 'active' : ''}" data-goal="escape">🐎 Thoát Hiểm</button>
              <button type="button" class="qmdj-hud-pill-btn ${state.qmdjStratGoal === 'dispute' ? 'active' : ''}" data-goal="dispute">🤝 Hòa Giải</button>
            </div>

            <!-- Các chỉ số chiến thuật trực quan -->
            <div class="qmdj-hud-body" id="qmdj-hud-body" style="${state.isQmdjStratHudCollapsed ? 'display: none;' : 'display: grid;'}">
              <div class="qmdj-hud-item green">
                <span class="lbl">🟢 Tọa Lưng (Ngồi quay lưng):</span>
                <strong id="qmdj-hud-back">Đang tính...</strong>
              </div>
              <div class="qmdj-hud-item purple">
                <span class="lbl">🎯 Ép Đối Tác (Xếp đối thủ ngồi):</span>
                <strong id="qmdj-hud-audience">Đang tính...</strong>
              </div>
              <div class="qmdj-hud-item gold">
                <span class="lbl">🟡 Thiên Mã (Hướng phá vây):</span>
                <strong id="qmdj-hud-horse">Đang tính...</strong>
              </div>
              <div class="qmdj-hud-item red">
                <span class="lbl">🚫 Bất Kích (Đại kỵ cấm ngồi):</span>
                <strong id="qmdj-hud-nonstrike">Đang tính...</strong>
              </div>
              <div class="qmdj-hud-item amber" id="qmdj-hud-item-wealth" style="${state.qmdjStratGoal === 'wealth' ? 'display: flex;' : 'display: none;'}">
                <span class="lbl">💰 Thu Tài (Sinh Môn nạp khí):</span>
                <strong id="qmdj-hud-wealth">Đang tính...</strong>
              </div>
            </div>

            <div class="qmdj-hud-footer" style="${state.isQmdjStratHudCollapsed ? 'display: none;' : 'display: block;'}">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                <button type="button" id="btn-qmdj-hud-open-time" class="qmdj-hud-link-btn" style="background: rgba(56, 189, 248, 0.2); border-color: rgba(56, 189, 248, 0.5); color: #38bdf8;">
                  🕒 Đổi Giờ Tác Chiến
                </button>
                <button type="button" id="btn-qmdj-hud-view-detail" class="qmdj-hud-link-btn">
                  🔮 Bàn Cờ 9 Cung ↗
                </button>
              </div>
            </div>
          </div>

          <!-- 3. Floating Tam Hợp HUD Card (Phong Thủy Tam Hợp Phái) -->
          <div id="lakinh-tamhop-floating-hud" class="lakinh-glass-panel ${state.isTamHopHudCollapsed ? 'is-collapsed' : ''}" style="${state.isTamHopActive ? '' : 'display: none;'}">
            <div class="tamhop-hud-header">
              <div class="tamhop-hud-title-group">
                <span class="tamhop-hud-title">🌊 TAM HỢP PHÁI</span>
                <button type="button" id="btn-tamhop-hud-config" class="tamhop-hud-cfg-btn" title="Chỉnh sửa Thủy Khẩu &amp; Gia Chủ">
                  <span>⚙️</span>
                  <span id="tamhop-hud-cuc-label">Thủy Cục</span>
                </button>
              </div>
              <div class="tamhop-hud-actions">
                <button type="button" id="btn-tamhop-hud-collapse" class="ray-hud-action-btn collapse" title="Thu gọn / Mở rộng">${state.isTamHopHudCollapsed ? '+ Mở rộng' : '– Thu gọn'}</button>
                <button type="button" id="btn-tamhop-hud-close" class="ray-hud-action-btn close" title="Tắt lớp Tam Hợp">✕ Tắt</button>
              </div>
            </div>

            <!-- Thanh Chọn Đường Cục (Tiểu Cục 40m / Trung Cục 350m / Đại Cục 2km / Quét DEM) -->
            <div class="tamhop-hud-duong-cuc-row">
              <button type="button" class="tamhop-cuc-btn ${state.tamHopDuongCuc === 'tieu_cuc' ? 'active' : ''}" data-duongcuc="tieu_cuc" title="Tiểu Minh Đường (40m): Cống ngầm, rãnh nước">🏠 Tiểu Cục</button>
              <button type="button" class="tamhop-cuc-btn ${state.tamHopDuongCuc === 'trung_cuc' ? 'active' : ''}" data-duongcuc="trung_cuc" title="Trung Minh Đường (350m): Ngã ba phố, kênh rạch">🏘️ Trung Cục</button>
              <button type="button" class="tamhop-cuc-btn ${state.tamHopDuongCuc === 'dai_cuc' ? 'active' : ''}" data-duongcuc="dai_cuc" title="Đại Minh Đường (2000m): Hợp lưu sông cái, hồ lớn">⛰️ Đại Cục</button>
              <button type="button" id="btn-tamhop-sync-dem" class="tamhop-cuc-btn dem-sync" title="Quét cao độ Google Earth / DEM để lấy Thủy Khẩu tự động">🛰️ Quét DEM</button>
            </div>

            <!-- Thanh Tóm Tắt Khi Thu Gọn (Mini Capsule Cao ~32px Không Che La Kinh) -->
            <div id="tamhop-hud-compact-summary" class="tamhop-hud-compact-summary" style="${state.isTamHopHudCollapsed ? 'display: flex;' : 'display: none;'}">
              <span class="tamhop-pill cyan" id="compact-th-khau">💧 Khẩu: Đang tính...</span>
              <span class="tamhop-pill green" id="compact-th-sinh">🌱 Sinh: Đang tính...</span>
              <span class="tamhop-pill gold" id="compact-th-vuong">👑 Vượng: Đang tính...</span>
              <span class="tamhop-pill purple" id="compact-th-mo">⛩️ Mộ: Đang tính...</span>
            </div>

            <!-- Bảng Thông Số Chi Tiết Khi Mở Rộng -->
            <div class="tamhop-hud-body" id="tamhop-hud-body" style="${state.isTamHopHudCollapsed ? 'display: none;' : 'display: grid;'}">
              <div class="tamhop-hud-item cyan">
                <span class="lbl">💧 Thủy Khẩu:</span>
                <strong id="tamhop-hud-khau">Đang tính...</strong>
              </div>
              <div class="tamhop-hud-item green">
                <span class="lbl">🌱 Vòng Trường Sinh:</span>
                <strong id="tamhop-hud-sinh">Đang tính...</strong>
              </div>
              <div class="tamhop-hud-item red">
                <span class="lbl">⚠️ Bát Lộ Hoàng Tuyền:</span>
                <strong id="tamhop-hud-hoangtuyen">Đang tính...</strong>
              </div>
              <div class="tamhop-hud-item red">
                <span class="lbl">🚫 Bát Sát Tiêu Vong:</span>
                <strong id="tamhop-hud-batsat">Đang tính...</strong>
              </div>
              <div class="tamhop-hud-item gold">
                <span class="lbl">💎 Tam Cát Thần Trợ:</span>
                <strong id="tamhop-hud-tamcat">Đang tính...</strong>
              </div>
            </div>

            <div class="tamhop-hud-footer" style="${state.isTamHopHudCollapsed ? 'display: none;' : 'display: block;'}">
              <button type="button" id="btn-tamhop-hud-open-modal" class="tamhop-hud-link-btn">
                🌊 Mở Thẩm Định Chuyên Sâu 6 Bước ↗
              </button>
            </div>
          </div>
        </div>

        <!-- Floating Ray HUD Card trên màn hình (Chi tiết khi mở rộng tia ngắm) -->
        <div id="lakinh-ray-floating-hud" class="lakinh-glass-panel" style="display: none;">
          <div class="ray-hud-header">
            <span class="ray-hud-title">🎯 TIA NGẮM PHÂN KIM</span>
            <span class="ray-hud-deg" id="ray-hud-deg">0.0°</span>
            <div class="ray-hud-actions">
              <button type="button" id="btn-ray-hud-collapse" class="ray-hud-action-btn collapse" title="Thu gọn ô thông tin (vẫn giữ tia ngắm)">– Thu gọn</button>
              <button type="button" id="btn-ray-hud-close" class="ray-hud-action-btn close" title="Tắt tia ngắm">✕ Tắt tia</button>
            </div>
          </div>
          <div class="ray-hud-body">
            <div class="ray-hud-item">
              <span class="lbl">Sơn Hướng:</span>
              <strong id="ray-hud-son" style="color: #38bdf8;">Sơn Tý (Khảm • Thủy)</strong>
            </div>
            <div class="ray-hud-item">
              <span class="lbl">Đại Quái:</span>
              <span style="text-align: right;">
                <strong id="ray-hud-que" style="color: #facc15;">Phong Địa Quan</strong>
                <span id="ray-hud-khivan" style="color: #cbd5e1; font-size: 0.72rem; margin-left: 4px;">(Khí 2 • Vận 2)</span>
              </span>
            </div>
            <div class="ray-hud-subitem" id="ray-hud-que-extra" style="color: #94a3b8; font-size: 0.68rem; display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span id="ray-hud-que-range">Dải 337.5° – 343.1°</span>
              <span id="ray-hud-que-ha-thuong" style="color: #cbd5e1;">Thượng Tốn Hạ Khôn</span>
            </div>
            <div class="ray-hud-item" style="border-top: 1px dashed rgba(255,255,255,0.12); padding-top: 3px; margin-top: 2px;">
              <span class="lbl">Hào Vị:</span>
              <span style="text-align: right;">
                <strong id="ray-hud-hao" style="color: #4ade80;">Hào 1 (Ất Mùi • Tử Tôn)</strong>
                <span id="ray-hud-badge-van9" class="ray-hud-badge">---</span>
              </span>
            </div>
            <div class="ray-hud-subitem" id="ray-hud-hao-extra" style="color: #94a3b8; font-size: 0.68rem; display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span id="ray-hud-hao-range">Dải: 341.25° – 342.19°</span>
              <span id="ray-hud-hao-amduong" style="color: #38bdf8;">Thuận (1 → 6)</span>
            </div>
            <div id="ray-hud-advice-box" style="background: rgba(2, 132, 199, 0.12); border-left: 2px solid #38bdf8; padding: 4px 6px; border-radius: 4px; font-size: 0.68rem; color: #e2e8f0; line-height: 1.35; margin-top: 3px;">
              <div id="ray-hud-advice-van9" style="color: #facc15; font-weight: 600;">Linh Thần Vận 9</div>
              <div id="ray-hud-advice-text" style="color: #cbd5e1; margin-top: 1px;">Cần ĐỘNG KHÍ, mở Cửa, Cổng, nạp Thủy chiêu tài.</div>
            </div>
            <div class="ray-hud-item" style="border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 4px; margin-top: 4px;">
              <span class="lbl">So Hướng Nhà:</span>
              <span id="ray-hud-diff" style="color: #f43f5e; font-weight: 700;">Trùng Chính Hướng</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px; padding-top: 3px; border-top: 1px solid rgba(255,255,255,0.08);">
              <span id="ray-hud-ung-ky" style="color: #94a3b8; font-size: 0.63rem;"></span>
              <div style="display: flex; gap: 4px;">
                <button type="button" id="btn-ray-hud-trachcat" style="background: rgba(245, 176, 65, 0.2); border: 1px solid rgba(245, 176, 65, 0.5); color: #facc15; font-size: 0.68rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; cursor: pointer;" title="Xem ngày tốt cho hướng tia ngắm">
                  🧭 Trạch Cát
                </button>
                <button type="button" id="btn-ray-hud-open-hkdq" style="background: rgba(245, 176, 65, 0.15); border: 1px solid rgba(245, 176, 65, 0.45); color: #facc15; font-size: 0.68rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; cursor: pointer;">
                  🔱 Xem Đủ 6 Hào
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Thanh Điều Khiển Nổi Thu Phóng & Dịch Tâm Mặt Bằng Trên Màn Hình -->
        <div id="lakinh-plan-pan-banner" class="lakinh-floating-plan-bar" style="display: none;">
          <div class="fl-plan-left">
            <span class="fl-plan-title">📐<span class="fl-btn-lbl"> Mặt Bằng</span></span>
            <button type="button" class="fl-plan-btn" id="fl-btn-scale-minus" title="Thu nhỏ (-15%)">🔍−</button>
            <button type="button" class="fl-plan-scale-chip" id="fl-plan-scale-val" title="Tỉ lệ hiện tại. Chạm để về 100%">100%</button>
            <button type="button" class="fl-plan-btn" id="fl-btn-scale-plus" title="Phóng to (+15%)">🔍+</button>
          </div>
          <div class="fl-plan-right">
            <button type="button" class="fl-plan-btn ${state.isPlanPanActive ? 'active' : ''}" id="fl-btn-plan-pan" title="Bật/Tắt chế độ kéo rê và 2 ngón tay thu phóng">✋<span class="fl-btn-lbl"> Kéo</span></button>
            <button type="button" class="fl-plan-btn" id="fl-btn-rot-match" title="Xoay khớp hướng nhà">🧭<span class="fl-btn-lbl"> Khớp</span></button>
            <button type="button" class="fl-plan-btn" id="fl-btn-plan-center" title="Đưa về chính tâm (0,0)">🎯<span class="fl-btn-lbl"> Tâm</span></button>
            <button type="button" class="fl-plan-btn icon-only" id="fl-btn-plan-opacity" title="Đổi độ mờ (35% / 65% / 85%)">👁️</button>
            <button type="button" class="fl-plan-btn icon-only" id="btn-plan-pan-done" title="Ẩn thanh công cụ mặt bằng">✕</button>
          </div>
        </div>


        <!-- 1. Cụm HUD Tọa Hướng & Huyền Không Đại Quái Tích Hợp Trên Cùng (Master Top Panel) -->
        <div id="lakinh-top-panel" class="lakinh-glass-panel">
          <!-- Hàng 1: Công Cụ Điều Khiển & Độ Số Tọa Hướng -->
          <div class="lakinh-top-row">
            <button class="lakinh-float-btn icon-only" id="lakinh-btn-search" title="Tìm địa chỉ / tọa độ GPS">
              🔍
            </button>
            <div id="lakinh-hud-pill" class="lakinh-deg-center" title="Chạm để xem thông số tọa hướng chi tiết">
              <span class="hud-pill-deg" id="hud-pill-deg">0.0°</span>
              <span class="hud-capsule-sep">•</span>
              <span class="hud-pill-son" id="hud-pill-son">Sơn Tý (Khảm)</span>
              <span class="hud-pill-arrow" id="hud-pill-arrow">▾</span>
            </div>
            <div class="lakinh-top-right-group">
              <button class="lakinh-float-btn icon-only" id="lakinh-btn-tam-hop" title="Thẩm Định Phong Thủy Tam Hợp Phái ">
                🌊
              </button>
              <button class="lakinh-float-btn icon-only ${state.isQmdjStratActive ? 'active' : ''}" id="lakinh-btn-qmdj-strat" title="Bật/Tắt Lớp Chiến Lược Kỳ Môn (Joey Yap)">
                ⚔️
              </button>
              <button class="lakinh-float-btn icon-only" id="lakinh-btn-plan-quick" title="Bản vẽ mặt bằng kiến trúc">
                📐
              </button>
              <button class="lakinh-float-btn icon-only" id="lakinh-btn-ray-quick" title="Bật/tắt tia ngắm phân kim">
                🎯
              </button>
              <button class="lakinh-float-btn icon-only" id="lakinh-btn-layer" title="Chuyển lớp bản đồ (Google / Esri / Phố)">
                🛰️
              </button>
              <button class="lakinh-float-btn icon-only" id="lakinh-btn-projects" title="Hồ sơ khảo sát">
                📁
              </button>
            </div>
          </div>

          <!-- Hàng 2: Huyền Không Đại Quái Trải Rộng Toàn Bộ Bề Ngang, Chữ To Rõ, Đầy Đủ 100% Thông Tin -->
          <div id="lakinh-hkdq-quick-strip" class="lakinh-hkdq-full-row" title="Chạm để mở bảng phân kim 64 Quẻ 384 Hào chi tiết">
            <div class="hkdq-row-left">
              <span class="hkdq-qp-icon">🔱</span>
              <span class="hkdq-qp-que" id="hkdq-quick-que">Bát Thuần Khôn</span>
            </div>
            <div class="hkdq-row-right">
              <span class="hkdq-qp-khivan" id="hkdq-quick-khivan">Khí 1 • Vận 1</span>
              <span class="hkdq-qp-sep">•</span>
              <span class="hkdq-qp-hao" id="hkdq-quick-hao">Hào 6</span>
              <span class="hkdq-qp-tag" id="hkdq-quick-tag">Linh Thần V9</span>
            </div>
          </div>
        </div>

        <!-- Thanh Tìm Kiếm Trực Tiếp Địa Chỉ & Tọa Độ GPS (Tự động ẩn sau khi chọn địa điểm) -->
        <div id="lakinh-search-bar-wrap" style="display: none;">
          <div class="lakinh-search-input-box">
            <span class="lakinh-search-lens">🔍</span>
            <input type="text" id="lakinh-search-bar-input" placeholder="Tìm địa chỉ hoặc tọa độ GPS (VD: 21.028, 105.854)..." autocomplete="off">
            <button type="button" id="lakinh-search-bar-clear" title="Xóa" style="display: none;">✕</button>
            <button type="button" id="lakinh-search-bar-btn">Tìm</button>
            <button type="button" id="lakinh-search-bar-close" title="Ẩn thanh tìm kiếm">▲</button>
          </div>
          <div id="lakinh-search-dropdown" class="lakinh-search-dropdown-menu"></div>
        </div>

        <!-- Thẻ Thông Tin Chi Tiết Thả Xuống Khi Chạm HUD Pill -->
        <div id="lakinh-hud-detail-card" class="lakinh-glass-panel">
          <div class="hud-card-row">
            <span>Tọa - Hướng:</span>
            <strong id="hud-detail-toa-huong" style="color: #f5b041;">Tọa Ngọ Hướng Tý</strong>
          </div>
          <div class="hud-card-row">
            <span>Cung & Ngũ Hành:</span>
            <span id="hud-detail-cung-hanh">Cung Khảm • Hành Thủy</span>
          </div>
          <div class="hud-card-divider"></div>
          <div class="hud-card-row hud-card-clickable" id="hud-row-hkdq-que" title="Chạm để mở bảng tra cứu 384 Hào">
            <span>Đại Quái 64 Quẻ:</span>
            <strong id="hud-detail-hkdq-que" style="color: #38bdf8;">Đang nạp...</strong>
          </div>
          <div class="hud-card-row hud-card-clickable" id="hud-row-hkdq-hao" title="Chạm để mở bảng tra cứu 384 Hào">
            <span>Phân Kim 384 Hào:</span>
            <span id="hud-detail-hkdq-hao" style="color: #4ade80;">Đang nạp...</span>
          </div>
          <div class="hud-card-row hud-card-clickable" id="hud-row-hkdq-badges" style="margin-top: 4px; display: flex; flex-wrap: wrap; gap: 4px; align-items: center;" title="Chạm để mở bảng tra cứu 384 Hào">
            <span class="hud-card-badge" id="hud-detail-hkdq-van9" style="background: rgba(2,132,199,0.18); color: #38bdf8; border-color: rgba(56,189,248,0.4);">🌊 Linh Thần Vận 9</span>
            <span class="hud-card-badge" id="hud-detail-hkdq-tkv" style="background: rgba(34,197,94,0.15); color: #4ade80; border-color: rgba(34,197,94,0.3);">🛡️ Tuyến An Toàn</span>
            <span style="font-size: 0.68rem; color: #f5b041; margin-left: auto; font-weight: 700;">[Xem 384 Hào ↗]</span>
          </div>
          <div class="hud-card-divider"></div>
          <!-- Tam Hợp Phái: Tam Bàn & 120 Phân Kim Vi Mô -->
          <div class="hud-card-row hud-card-clickable" id="hud-row-tamhop" title="Chạm để mở Thẩm Định Phong Thủy Tam Hợp Phái">
            <span style="display: flex; align-items: center; gap: 4px; color: #34d399; font-weight: 700;">🌊 Tam Bàn & Phân Kim:</span>
            <span style="font-size: 0.68rem; color: #34d399; margin-left: auto; font-weight: 700;">[Thẩm Định Tam Hợp ↗]</span>
          </div>
          <div class="hud-card-row" id="hud-row-tamban-details" style="font-size: 0.72rem; color: #cbd5e1; display: flex; flex-direction: column; gap: 3px; margin-top: 2px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color:#94a3b8;">• Địa Bàn: <b id="hud-tamban-dia" style="color:#f5b041;">Sơn Tý</b></span>
              <span style="color:#94a3b8;">• Nhân Bàn: <b id="hud-tamban-nhan" style="color:#38bdf8;">Sơn Nhâm</b></span>
              <span style="color:#94a3b8;">• Thiên Bàn: <b id="hud-tamban-thien" style="color:#a78bfa;">Sơn Quý</b></span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 2px;">
              <span style="color:#94a3b8;">120 Phân Kim:</span>
              <span id="hud-tamban-pk120" style="font-weight: 700; color: #4ade80;">Bính/Đinh (Châu Bảo)</span>
            </div>
          </div>
          <div class="hud-card-row" style="margin-top: 4px;">
            <button type="button" id="btn-hud-trachcat" style="width: 100%; background: linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(217,119,6,0.25) 100%); border: 1px solid rgba(245,158,11,0.5); color: #facc15; font-size: 0.75rem; font-weight: 700; padding: 6px 10px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
              🧭 Trạch Nhật (Xem Ngày Tốt Cho Tọa Sơn Này)
            </button>
          </div>
          <div class="hud-card-divider"></div>
          <div class="hud-card-row" style="margin-top: 4px;">
            <span class="hud-card-badge" id="hud-detail-dec">🧭 Từ thiên (WMM): -1.34° (Tây)</span>
            <span class="hud-card-badge" id="hud-detail-elev" style="background: rgba(34,197,94,0.15); color:#22c55e; border-color:rgba(34,197,94,0.3);">⛰️ Cao độ: 19.0 m</span>
          </div>
        </div>

        <!-- 2. Thanh Công Cụ Nổi Dưới Cùng (Floating Dock) -->
        <div id="lakinh-bottom-dock">
          <button class="lakinh-dock-btn" id="lakinh-dock-sensor" title="Bật/Tắt cảm biến la bàn thực địa">
            🧭 La Bàn
          </button>
          <button class="lakinh-dock-btn primary" id="lakinh-dock-gps" title="Bay về vị trí GPS thực tế hiện tại">
            📍 Vị Trí
          </button>
          <button class="lakinh-dock-btn gold" id="lakinh-dock-hkdq" title="Phân Kim Huyền Không Đại Quái 64 Quẻ 384 Hào">
            🔱 Đại Quái
          </button>
          <button class="lakinh-dock-btn" id="lakinh-dock-dem" title="Quét cao độ & Tam Hợp Thủy Pháp">
            🌊 Quét Cục
          </button>
          <button class="lakinh-dock-btn" id="lakinh-dock-tools" title="Bảng điều khiển công cụ">
            ⚙️ Công Cụ
          </button>
        </div>

        <!-- 3. Bảng Điều Khiển Dạng Bottom Sheet -->
        <div id="lakinh-bottom-sheet">
          <div class="sheet-handle-bar" id="sheet-handle"></div>
          <div class="sheet-header-row">
            <div class="sheet-title">
              <span>⚙️ BẢNG ĐIỀU KHIỂN LA KINH</span>
            </div>
            <button class="sheet-close-btn" id="sheet-close-btn">
              ✕ Đóng / Xem Toàn Màn Hình
            </button>
          </div>

          <!-- Nhóm chọn mẫu Đĩa La Kinh / Thước Lập Cực -->
          <div class="sheet-control-group">
            <div class="sheet-control-label">
              <span>Mẫu La Kinh / Thước Lập Cực</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px;">
              <button class="lakinh-step-btn active" id="btn-plate-trans" style="font-weight: 700; color: #38bdf8;">
                💎 Mica Trong
              </button>
              <button class="lakinh-step-btn" id="btn-plate-gold" style="font-weight: 700; color: #fbbf24;">
                ✨ Dạ Quang
              </button>
              <button class="lakinh-step-btn" id="btn-plate-thuoc">
                📄 Giấy Trắng
              </button>
            </div>
          </div>

          <!-- Nhóm trượt: Độ trong suốt nền lót (Thấy địa hình bên dưới) -->
          <div class="sheet-control-group">
            <div class="sheet-control-label">
              <span>Độ mờ nền lót (Thấy địa hình bên dưới)</span>
              <span class="val" id="sheet-val-bg-opacity">${Math.round(state.bgOpacity * 100)}%</span>
            </div>
            <input type="range" class="lakinh-slider" id="sheet-slider-bg-opacity" min="0" max="100" value="${Math.round(state.bgOpacity * 100)}">
            <div class="lakinh-btn-row" style="margin-top: 6px;">
              <button class="lakinh-step-btn" id="btn-bg-0" style="color:#38bdf8; font-weight: 600;">💎 Xuyên Thấu (0%)</button>
              <button class="lakinh-step-btn active" id="btn-bg-35" style="color:#22c55e; font-weight: 600;">🌫️ Kính Mờ (35%)</button>
              <button class="lakinh-step-btn" id="btn-bg-85" style="color:#f5b041; font-weight: 600;">🎯 Nền Sáng (85%)</button>
            </div>
            <div style="font-size: 0.65rem; color: #94a3b8; margin-top: 4px; line-height: 1.3;">
              💡 <em>Kéo về 0% để thấy 100% mái nhà/địa hình; chọn 35% để vừa thấy địa hình vừa nổi rõ chữ.</em>
            </div>
          </div>

          <div class="sheet-control-group">
            <div class="sheet-control-label">
              <span>Kích thước La Kinh (Thu phóng soi 36 tầng)</span>
              <span class="val" id="sheet-val-size">${state.size} px</span>
            </div>
            <input type="range" class="lakinh-slider" id="sheet-slider-size" min="260" max="1400" value="${state.size}" step="10">
            <div class="lakinh-btn-row" style="margin-top: 6px;">
              <button class="lakinh-step-btn active" id="btn-size-fit">📱 Chuẩn (1x)</button>
              <button class="lakinh-step-btn" id="btn-size-15x" style="color: #38bdf8; font-weight: 600;">🔍 Rõ Nét (1.5x)</button>
              <button class="lakinh-step-btn" id="btn-size-2x" style="color: #f5b041; font-weight: 600;">🔬 Soi Chi Tiết (2x)</button>
              <button class="lakinh-step-btn" id="btn-size-max" style="color: #ef4444; font-weight: 600;">👑 Cực Đại</button>
            </div>
          </div>

          <!-- Nhóm MẶT BẰNG BẢN VẼ KIẾN TRÚC (DƯỚI LA KINH) -->
          <div class="sheet-control-group">
            <div class="sheet-control-label">
              <span>📐 Mặt Bằng Bản Vẽ (Dưới La Kinh)</span>
              <span class="val" id="sheet-val-plan-status">${state.planImageSrc ? 'Đã nạp bản vẽ' : 'Chưa nạp ảnh'}</span>
            </div>
            
            <input type="file" id="lakinh-input-plan-file" accept="image/*" style="display: none;">
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
              <button type="button" class="lakinh-action-btn primary" id="btn-plan-upload">
                📥 Tải Ảnh Mặt Bằng
              </button>
              <button type="button" class="lakinh-action-btn secondary" id="btn-plan-remove" style="${state.planImageSrc ? '' : 'display: none;'}">
                🗑️ Gỡ Mặt Bằng
              </button>
            </div>

            <div id="lakinh-plan-controls-wrap" style="${state.planImageSrc ? '' : 'display: none;'}">
              <!-- Kích thước / Tỉ lệ bản vẽ -->
              <div style="margin-top: 8px;">
                <div class="sheet-control-sublabel">
                  <span>Tỉ lệ thu phóng (Scale)</span>
                  <span class="val" id="sheet-val-plan-scale">${Math.round(state.planScale * 100)}%</span>
                </div>
                <input type="range" class="lakinh-slider" id="sheet-slider-plan-scale" min="20" max="500" value="${Math.round(state.planScale * 100)}" step="5">
                <div class="lakinh-btn-row" style="margin-top: 4px; flex-wrap: wrap;">
                  <button class="lakinh-step-btn" id="btn-scale-step-m10">−10%</button>
                  <button class="lakinh-step-btn" id="btn-scale-step-p10">+10%</button>
                  <button class="lakinh-step-btn" id="btn-scale-50">50%</button>
                  <button class="lakinh-step-btn active" id="btn-scale-100">100%</button>
                  <button class="lakinh-step-btn" id="btn-scale-150">150%</button>
                  <button class="lakinh-step-btn" id="btn-scale-200">200%</button>
                  <button class="lakinh-step-btn" id="btn-scale-300">300%</button>
                </div>
              </div>

              <!-- Xoay góc bản vẽ -->
              <div style="margin-top: 10px;">
                <div class="sheet-control-sublabel">
                  <span>Xoay góc bản vẽ</span>
                  <span class="val" id="sheet-val-plan-rot">${state.planRotation.toFixed(1)}°</span>
                </div>
                <input type="range" class="lakinh-slider" id="sheet-slider-plan-rot" min="0" max="360" value="${state.planRotation.toFixed(1)}" step="0.5">
                <div class="lakinh-btn-row" style="margin-top: 4px;">
                  <button class="lakinh-step-btn" id="btn-plan-rot-match" style="color: #38bdf8; font-weight: 600;">🧭 Theo Hướng Nhà</button>
                  <button class="lakinh-step-btn" id="btn-plan-rot-zero">0° Bắc</button>
                  <button class="lakinh-step-btn" id="btn-plan-rot-m1">-1°</button>
                  <button class="lakinh-step-btn" id="btn-plan-rot-p1">+1°</button>
                </div>
              </div>

              <!-- Độ mờ bản vẽ -->
              <div style="margin-top: 10px;">
                <div class="sheet-control-sublabel">
                  <span>Độ mờ bản vẽ</span>
                  <span class="val" id="sheet-val-plan-opacity">${Math.round(state.planOpacity * 100)}%</span>
                </div>
                <input type="range" class="lakinh-slider" id="sheet-slider-plan-opacity" min="10" max="100" value="${Math.round(state.planOpacity * 100)}" step="5">
              </div>

              <!-- Căn chỉnh tâm nhà (Dịch tâm) -->
              <div style="margin-top: 10px;">
                <div class="sheet-control-sublabel">
                  <span>Căn chỉnh tim nhà (Dịch tâm)</span>
                  <span class="val" id="sheet-val-plan-offset">X: ${state.planOffsetX}px, Y: ${state.planOffsetY}px</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 4px;">
                  <button type="button" class="lakinh-action-btn secondary" id="sheet-btn-plan-pan">
                    ✋ Kéo Dịch Tâm
                  </button>
                  <button type="button" class="lakinh-action-btn secondary" id="sheet-btn-plan-reset-center" title="Trở về chính tâm (0, 0)">
                    🎯 Về Chính Tâm
                  </button>
                </div>
                <div class="lakinh-btn-row" style="margin-top: 6px; justify-content: center; gap: 6px;">
                  <button class="lakinh-step-btn" id="btn-plan-shift-left">← Trái</button>
                  <button class="lakinh-step-btn" id="btn-plan-shift-up">↑ Lên</button>
                  <button class="lakinh-step-btn" id="btn-plan-shift-down">↓ Xuống</button>
                  <button class="lakinh-step-btn" id="btn-plan-shift-right">→ Phải</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Xoay góc hướng nhà & Vi chỉnh -->
          <div class="sheet-control-group">
            <div class="sheet-control-label">
              <span>Góc hướng nhà (Hướng đo 12h)</span>
              <span class="val" id="sheet-val-rotation">0.0°</span>
            </div>
            <input type="range" class="lakinh-slider" id="sheet-slider-rotation" min="0" max="360" value="0" step="0.5">
            <div class="lakinh-btn-row">
              <button class="lakinh-step-btn" id="btn-rot-zero" style="font-weight: 700; color: #38bdf8;">🧭 Chuẩn Bắc (0°)</button>
              <button class="lakinh-step-btn" id="btn-rot-m5">-5°</button>
              <button class="lakinh-step-btn" id="btn-rot-m1">-1°</button>
              <button class="lakinh-step-btn" id="btn-rot-p1">+1°</button>
              <button class="lakinh-step-btn" id="btn-rot-p5">+5°</button>
            </div>
          </div>

          <!-- Tùy chọn la bàn & Cảm biến & TIA NGẮM PHÂN KIM (ĐI QUA 1 ĐIỂM BẤT KỲ) -->
          <div class="sheet-control-group">
            <div class="sheet-control-label">
              <span>🎯 Tia Ngắm Phân Kim (Qua 1 Điểm)</span>
              <span class="val" id="sheet-val-ray-deg">${((state.rayAngle !== null && state.rayAngle !== undefined) ? state.rayAngle : state.rotation).toFixed(1)}°</span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
              <button id="sheet-btn-lock" class="lakinh-action-btn secondary">
                🔓 Khóa Hướng Nhà
              </button>
              <button id="sheet-btn-ray" class="lakinh-action-btn ${state.isRayActive ? 'success' : 'secondary'}">
                ${state.isRayActive ? '🎯 Đang Bật Tia Ngắm' : '🎯 Bật Tia Ngắm'}
              </button>
            </div>

            <div id="lakinh-ray-controls-wrap" style="${state.isRayActive ? '' : 'display: none;'}">
              <div style="font-size: 0.68rem; color: #38bdf8; margin-bottom: 6px; line-height: 1.35;">
                💡 <em>Chạm vào bất kỳ điểm nào trên mặt bằng (Cửa, Bếp, Ban thờ...) hoặc kéo chấm tròn mục tiêu để tia ngắm đi qua điểm đó.</em>
              </div>

              <!-- Thanh trượt độ số tia ngắm -->
              <div class="sheet-control-sublabel">
                <span>Độ số tia ngắm</span>
                <span class="val" id="sheet-val-ray-deg-sub">${((state.rayAngle !== null && state.rayAngle !== undefined) ? state.rayAngle : state.rotation).toFixed(1)}°</span>
              </div>
              <input type="range" class="lakinh-slider" id="sheet-slider-ray-deg" min="0" max="359.9" value="${((state.rayAngle !== null && state.rayAngle !== undefined) ? state.rayAngle : state.rotation).toFixed(1)}" step="0.1">

              <div class="lakinh-btn-row" style="margin-top: 6px;">
                <button class="lakinh-step-btn" id="btn-ray-m5">-5°</button>
                <button class="lakinh-step-btn" id="btn-ray-m1">-1°</button>
                <button class="lakinh-step-btn" id="btn-ray-m01">-0.1°</button>
                <button class="lakinh-step-btn" id="btn-ray-p01">+0.1°</button>
                <button class="lakinh-step-btn" id="btn-ray-p1">+1°</button>
                <button class="lakinh-step-btn" id="btn-ray-p5">+5°</button>
              </div>

              <!-- Nút gán hướng nhanh -->
              <div class="lakinh-btn-row" style="margin-top: 6px;">
                <button class="lakinh-step-btn" id="btn-ray-snap-house" style="color: #38bdf8; font-weight: 600;">🎯 Hướng Nhà</button>
                <button class="lakinh-step-btn" id="btn-ray-snap-north">🧭 Bắc (0°)</button>
                <button class="lakinh-step-btn" id="btn-ray-snap-perp-left">📐 Vuông Tả</button>
                <button class="lakinh-step-btn" id="btn-ray-snap-perp-right">📐 Vuông Hữu</button>
                <button class="lakinh-step-btn" id="btn-ray-snap-toa">🔄 Tọa (180°)</button>
              </div>

              <!-- Bảng thông số phong thủy chi tiết của tia ngắm -->
              <div class="lakinh-ray-summary-card" style="margin-top: 8px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 8px; padding: 10px 12px; font-size: 0.78rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="color: #94a3b8;">24 Sơn:</span>
                  <strong id="sheet-ray-son" style="color: #38bdf8;">Sơn Tý (Khảm)</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="color: #94a3b8;">Đại Quái 64 Quẻ:</span>
                  <strong id="sheet-ray-que" style="color: #fbbf24;">Đang tính...</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="color: #94a3b8;">Hào Phân Kim 384:</span>
                  <span id="sheet-ray-hao" style="color: #4ade80;">Đang tính...</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 4px; margin-top: 4px;">
                  <span style="color: #94a3b8;">So Hướng Nhà:</span>
                  <strong id="sheet-ray-diff" style="color: #f43f5e;">Trùng Chính Hướng</strong>
                </div>
              </div>
            </div>

            <label style="font-size: 0.7rem; display: flex; align-items: center; gap: 6px; cursor: pointer; color: #94a3b8; margin-top: 8px;">
              <input type="checkbox" id="lakinh-chk-autodec" style="accent-color: #38bdf8;">
              <span>Tự động bù từ thiên WMM cho cảm biến thực địa</span>
            </label>
          </div>

          <!-- Các công cụ khảo sát nâng cao -->
          <div class="sheet-control-group">
            <div class="sheet-control-label">
              <span>Khảo Sát & Lập Cực Nâng Cao</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 8px;">
              <button class="lakinh-step-btn" id="btn-zoom-tieu">🔍 Tiểu (40m)</button>
              <button class="lakinh-step-btn" id="btn-zoom-trung">🔍 Trung (350m)</button>
              <button class="lakinh-step-btn" id="btn-zoom-dai">🔍 Đại (2km)</button>
            </div>
            <button id="sheet-btn-scan-elev" class="lakinh-action-btn warning">
              🌊 Quét Cao Độ DEM & Định Tứ Đại Cục
            </button>
            <button id="sheet-btn-tam-hop" class="lakinh-action-btn emerald">
              🌊 Thẩm Định Phong Thủy Tam Hợp Phái 
            </button>
            <button id="sheet-btn-huyenkhong" class="lakinh-action-btn purple">
              ☯️ Lập Tinh Bàn Huyền Không Vận 9
            </button>
            <button id="sheet-btn-hkdq" class="lakinh-action-btn gold">
              🔱 Phân Kim Đại Quái 64 Quẻ (384 Hào)
            </button>
            <button id="sheet-btn-centroid" class="lakinh-action-btn secondary">
              📐 Vẽ Ranh Đất / Tìm Tim Nhà
            </button>
          </div>

          <!-- Nhóm KỲ MÔN CHIẾN LƯỢC JOEY YAP COMPENDIUM (PHASE 3) -->
          <div class="sheet-control-group">
            <div class="sheet-control-label">
              <span>⚔️ Lớp Phủ Chiến Lược Kỳ Môn (Joey Yap)</span>
              <span class="val" id="sheet-val-qmdj-strat-status">${state.isQmdjStratActive ? 'Đang Bật' : 'Đang Tắt'}</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
              <button type="button" class="lakinh-action-btn ${state.isQmdjStratActive ? 'success' : 'secondary'}" id="sheet-btn-qmdj-strat-toggle">
                ${state.isQmdjStratActive ? '⚔️ Tắt Lớp Kỳ Môn' : '⚔️ Bật Lớp Kỳ Môn'}
              </button>
              <button type="button" class="lakinh-action-btn secondary" id="sheet-btn-qmdj-view-link">
                🔮 Mở Bàn Cờ 9 Cung ↗
              </button>
            </div>
            <div id="lakinh-qmdj-sheet-controls" style="${state.isQmdjStratActive ? '' : 'display: none;'}">
              <div class="sheet-control-sublabel">
                <span>Mục tiêu tác chiến (Joey Yap):</span>
              </div>
              <div class="sheet-qmdj-pills">
                <button type="button" class="sheet-qmdj-goal-btn ${state.qmdjStratGoal === 'deal' ? 'active' : ''}" data-goal="deal">💼 Đàm Phán / HĐ</button>
                <button type="button" class="sheet-qmdj-goal-btn ${state.qmdjStratGoal === 'wealth' ? 'active' : ''}" data-goal="wealth">💰 Cầu Tài / Vốn</button>
                <button type="button" class="sheet-qmdj-goal-btn ${state.qmdjStratGoal === 'career' ? 'active' : ''}" data-goal="career">📈 Thăng Tiến / Thi</button>
                <button type="button" class="sheet-qmdj-goal-btn ${state.qmdjStratGoal === 'escape' ? 'active' : ''}" data-goal="escape">🐎 Thoát Hiểm</button>
                <button type="button" class="sheet-qmdj-goal-btn ${state.qmdjStratGoal === 'dispute' ? 'active' : ''}" data-goal="dispute" style="grid-column: span 2;">🤝 Hòa Giải / Pháp Lý</button>
              </div>

              <!-- Thời gian áp dụng Kỳ Môn -->
              <div class="sheet-control-sublabel" style="margin-top: 10px;">
                <span>Thời gian áp dụng Kỳ Môn:</span>
                <span class="val" id="sheet-val-qmdj-time" style="color: #facc15; font-weight: 700;">Giờ Hiện Tại</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                <button type="button" class="lakinh-action-btn secondary" id="sheet-btn-qmdj-change-time">
                  🕒 Đổi Ngày &amp; Giờ Kế Hoạch
                </button>
                <button type="button" class="lakinh-action-btn secondary" id="sheet-btn-qmdj-reset-time">
                  ↺ Về Giờ Hiện Tại
                </button>
              </div>
              <button type="button" class="lakinh-action-btn secondary" id="sheet-btn-qmdj-guide" style="width: 100%; margin-bottom: 4px; color: #38bdf8; border-color: rgba(56, 189, 248, 0.45);">
                ℹ️ Xem Cẩm Nang Hướng Dẫn Ý Nghĩa Các Hướng
              </button>
            </div>
          </div>

          <!-- Lưu & Xuất file KML -->
          <div class="sheet-control-group" style="margin-bottom: 0;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <button id="sheet-btn-save" class="lakinh-action-btn success">
                💾 Lưu Hồ Sơ
              </button>
              <button id="sheet-btn-kml" class="lakinh-action-btn secondary">
                📄 Tải file KML Google Earth
              </button>
            </div>
          </div>
        </div>

        <!-- Modals Hộp thoại -->
        <div id="lakinh-modal-container"></div>
      `;

        initLeafletMap();
        bindLaKinhEvents();
        updateRotationDisplay(state.rotation);
        if (typeof updateQmdjStrategicLayer === 'function') {
          updateQmdjStrategicLayer();
        }
      } else {
        if (mapInstance) {
          mapInstance.invalidateSize();
          setTimeout(() => { if (mapInstance) mapInstance.invalidateSize(); }, 150);
          setTimeout(() => { if (mapInstance) mapInstance.invalidateSize(); }, 400);
        } else {
          initLeafletMap();
        }
        if (state.isQmdjStratActive && typeof updateQmdjStrategicLayer === 'function') {
          updateQmdjStrategicLayer();
        }
      }
    } catch (err) {
      console.error('Lỗi khi render La Kinh:', err);
    }
  }

  // Khởi tạo bản đồ Leaflet
  function initLeafletMap() {
    if (typeof L === 'undefined') {
      console.warn('Leaflet thư viện chưa tải xong, đang thử lại sau 200ms...');
      setTimeout(initLeafletMap, 200);
      return;
    }

    try {
      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }

      mapInstance = L.map('lakinh-map', {
        center: state.centerCoords,
        zoom: 18,
        maxZoom: 22,
        zoomControl: false
      });

    // Zoom control ở góc phải
    L.control.zoom({ position: 'topright' }).addTo(mapInstance);

    // Lớp ảnh vệ tinh Google Hybrid và các lớp khác
    layers = {
      googleSat: L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 22,
        subdomains: '0123',
        crossOrigin: true,
        attribution: 'Google Satellite'
      }),
      esriSat: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        crossOrigin: true,
        attribution: 'Esri World Imagery'
      }),
      osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        crossOrigin: true,
        attribution: 'OpenStreetMap'
      })
    };

    currentLayer = layers.googleSat;
    currentLayer.addTo(mapInstance);

    elevationLayerGroup = L.layerGroup().addTo(mapInstance);
    surveyRayLayerGroup = L.layerGroup().addTo(mapInstance);
    polygonLayerGroup = L.layerGroup().addTo(mapInstance);
    userLocationLayerGroup = L.layerGroup().addTo(mapInstance);
    searchMarkerLayerGroup = L.layerGroup().addTo(mapInstance);

    mapInstance.on('move', onMapMove);
    mapInstance.on('moveend', onMapMoveEnd);
    mapInstance.on('click', onMapClick);

    // Cập nhật thông số vị trí ban đầu
    updateLocationHUD(state.centerCoords[0], state.centerCoords[1]);

    // Force map to adapt to container layout
    setTimeout(() => { if (mapInstance) mapInstance.invalidateSize(); }, 100);
    setTimeout(() => { if (mapInstance) mapInstance.invalidateSize(); }, 350);

    // Tự động định vị ngầm vị trí hiện tại ngay khi mở bản đồ
    setTimeout(() => {
      getCurrentGPS(true);
    }, 1200);
  } catch (err) {
    console.error('Lỗi khởi tạo Leaflet map:', err);
  }
}

  function onMapMove() {
    if (state.isRayActive) {
      renderSurveyRay();
    }
  }

  function onMapMoveEnd() {
    if (!mapInstance) return;
    const center = mapInstance.getCenter();
    state.centerCoords = [center.lat, center.lng];
    updateLocationHUD(center.lat, center.lng);
  }

  function updateLocationHUD(lat, lng) {
    if (!global.NetaLaKinhEngine) return;
    const wmm = global.NetaLaKinhEngine.calculateMagneticDeclination(lat, lng);
    state.declination = wmm.declination;

    const decEl = document.getElementById('hud-detail-dec');
    if (decEl) {
      decEl.innerHTML = `🧭 Từ thiên (WMM): ${wmm.text}`;
    }
  }

  // Cập nhật góc xoay và HUD
  function updateRotationDisplay(deg) {
    state.rotation = ((deg % 360) + 360) % 360;
    const rounded = Math.round(state.rotation * 10) / 10;

    const disc = document.getElementById('lakinh-disc');
    if (disc) {
      // Đĩa La Kinh xoay ngược chiều (-rounded) để:
      // 1. Hướng đo (Sơn hướng nhà) nằm ở đỉnh 12h dưới vạch ngắm hồng ngoại
      // 2. Kim La Bàn (và Sơn Tý 0°) luôn chỉ chính xác 100% về hướng Bắc Trái Đất
      disc.style.transform = `rotate(${-rounded}deg)`;
    }

    const qmdjSvg = document.getElementById('lakinh-qmdj-svg');
    if (qmdjSvg) {
      qmdjSvg.style.transform = `rotate(${-rounded}deg)`;
      qmdjSvg.querySelectorAll('.qmdj-counter-rotate').forEach(el => {
        const cx = el.getAttribute('data-cx');
        const cy = el.getAttribute('data-cy');
        if (cx && cy) {
          el.setAttribute('transform', `rotate(${rounded}, ${cx}, ${cy})`);
        }
      });
    }

    const tamHopSvg = document.getElementById('lakinh-tamhop-svg');
    if (tamHopSvg) {
      tamHopSvg.style.transform = `rotate(${-rounded}deg)`;
      tamHopSvg.querySelectorAll('.tamhop-counter-rotate').forEach(el => {
        const cx = el.getAttribute('data-cx');
        const cy = el.getAttribute('data-cy');
        if (cx && cy) {
          el.setAttribute('transform', `rotate(${rounded}, ${cx}, ${cy})`);
        }
      });
    }

    const pillDeg = document.getElementById('hud-pill-deg');
    const pillSon = document.getElementById('hud-pill-son');
    const sheetValRot = document.getElementById('sheet-val-rotation');
    const sheetSliderRot = document.getElementById('sheet-slider-rotation');
    const detailToaHuong = document.getElementById('hud-detail-toa-huong');
    const detailCungHanh = document.getElementById('hud-detail-cung-hanh');

    if (pillDeg) pillDeg.textContent = `${rounded.toFixed(1)}°`;
    if (sheetValRot) sheetValRot.textContent = `${rounded.toFixed(1)}°`;
    if (sheetSliderRot && parseFloat(sheetSliderRot.value) !== rounded) {
      sheetSliderRot.value = rounded;
    }

    if (global.NetaLaKinhEngine) {
      const son = global.NetaLaKinhEngine.getSonInfo(rounded);
      const toa = global.NetaLaKinhEngine.getSonInfo((rounded + 180) % 360);
      if (pillSon) {
        pillSon.textContent = `Sơn ${son.name} (${son.cung})`;
      }
      if (detailToaHuong) {
        detailToaHuong.textContent = `Tọa ${toa.name} Hướng ${son.name} (${rounded.toFixed(1)}°)`;
      }
      if (detailCungHanh) {
        detailCungHanh.textContent = `Cung ${son.cung} • Hành ${son.hanh} (${son.am_duong})`;
      }

      if (global.NetaLaKinhEngine.getHKDQInfo) {
        const hkdq = global.NetaLaKinhEngine.getHKDQInfo(rounded);
        if (hkdq) {
          const detailHkdqQue = document.getElementById('hud-detail-hkdq-que');
          const detailHkdqHao = document.getElementById('hud-detail-hkdq-hao');
          const badgeVan9 = document.getElementById('hud-detail-hkdq-van9');
          const badgeTkv = document.getElementById('hud-detail-hkdq-tkv');

          if (detailHkdqQue) {
            detailHkdqQue.innerHTML = `${hkdq.que_name} <span style="font-size:0.75rem; color:#94a3b8; font-weight:normal;">(Khí ${hkdq.quai_khi || hkdq.quai_so} • Vận ${hkdq.quai_van})</span>`;
          }
          if (detailHkdqHao && hkdq.hao_vi_phan) {
            const h = hkdq.hao_vi_phan;
            const ltColor = (h.luc_than === 'Thê Tài' || h.luc_than === 'Tử Tôn') ? '#4ade80' : (h.luc_than === 'Quan Quỷ' ? '#f87171' : '#fb923c');
            detailHkdqHao.innerHTML = `${h.ten_hao} (${h.can_chi} • <b style="color:${ltColor}">${h.luc_than}</b>)`;
          }
          if (badgeVan9 && hkdq.van_9_role) {
            if (hkdq.van_9_role.is_duong_van_9) {
              badgeVan9.style.background = 'rgba(234, 179, 8, 0.22)';
              badgeVan9.style.color = '#facc15';
              badgeVan9.style.borderColor = 'rgba(250, 204, 21, 0.5)';
              badgeVan9.innerHTML = `✨ Đương Vận 9 (Đại Phát)`;
            } else if (hkdq.van_9_role.is_linh_than) {
              badgeVan9.style.background = 'rgba(2, 132, 199, 0.18)';
              badgeVan9.style.color = '#38bdf8';
              badgeVan9.style.borderColor = 'rgba(56, 189, 248, 0.4)';
              badgeVan9.innerHTML = `🌊 Linh Thần Vận 9 (Nạp Thủy)`;
            } else {
              badgeVan9.style.background = 'rgba(147, 51, 234, 0.18)';
              badgeVan9.style.color = '#c084fc';
              badgeVan9.style.borderColor = 'rgba(168, 85, 247, 0.4)';
              badgeVan9.innerHTML = `⛰️ Chính Thần Vận 9 (Tọa Sơn)`;
            }
          }
          if (badgeTkv && hkdq.canh_bao_khong_vong) {
            if (hkdq.canh_bao_khong_vong.is_near_boundary) {
              badgeTkv.style.background = 'rgba(239, 68, 68, 0.2)';
              badgeTkv.style.color = '#f87171';
              badgeTkv.style.borderColor = 'rgba(239, 68, 68, 0.6)';
              badgeTkv.innerHTML = `⚠️ Sát Ranh (${hkdq.canh_bao_khong_vong.distance}°)!`;
            } else {
              badgeTkv.style.background = 'rgba(34, 197, 94, 0.15)';
              badgeTkv.style.color = '#4ade80';
              badgeTkv.style.borderColor = 'rgba(34, 197, 94, 0.3)';
              badgeTkv.innerHTML = `🛡️ Tuyến Khí Thuần (An Toàn)`;
            }
          }

          // Cập nhật Banner Nổi Huyền Không Đại Quái trên màn hình chính
          const qQue = document.getElementById('hkdq-quick-que');
          const qKhivan = document.getElementById('hkdq-quick-khivan');
          const qHao = document.getElementById('hkdq-quick-hao');
          const qTag = document.getElementById('hkdq-quick-tag');

          if (qQue) qQue.textContent = hkdq.que_name || '';
          if (qKhivan) qKhivan.textContent = `Khí ${hkdq.quai_khi || hkdq.quai_so} • Vận ${hkdq.quai_van}`;
          if (qHao && hkdq.hao_vi_phan) {
            const h = hkdq.hao_vi_phan;
            const ltColor = (h.luc_than === 'Thê Tài' || h.luc_than === 'Tử Tôn') ? '#4ade80' : (h.luc_than === 'Quan Quỷ' ? '#f87171' : (h.luc_than === 'Phụ Mẫu' ? '#c084fc' : '#fb923c'));
            qHao.innerHTML = `${h.ten_hao} <span style="color:${ltColor}; font-weight:700;">(${h.luc_than || ''})</span>`;
          }
          if (qTag && hkdq.van_9_role) {
            if (hkdq.canh_bao_khong_vong && hkdq.canh_bao_khong_vong.is_near_boundary) {
              qTag.className = 'hkdq-qp-tag warn';
              qTag.style.background = '';
              qTag.style.color = '';
              qTag.style.borderColor = '';
              qTag.textContent = `⚠️ Ranh ${hkdq.canh_bao_khong_vong.distance}°`;
            } else if (hkdq.van_9_role.is_duong_van_9) {
              qTag.className = 'hkdq-qp-tag duong';
              qTag.style.background = 'rgba(234, 179, 8, 0.25)';
              qTag.style.color = '#facc15';
              qTag.style.borderColor = 'rgba(250, 204, 21, 0.6)';
              qTag.textContent = '✨ Đương Vận 9';
            } else if (hkdq.van_9_role.is_linh_than) {
              qTag.className = 'hkdq-qp-tag linh';
              qTag.style.background = '';
              qTag.style.color = '';
              qTag.style.borderColor = '';
              qTag.textContent = '🌊 Linh Thần V9';
            } else {
              qTag.className = 'hkdq-qp-tag chinh';
              qTag.style.background = '';
              qTag.style.color = '';
              qTag.style.borderColor = '';
              qTag.textContent = '⛰️ Chính Thần V9';
            }
          }
        }
      }

      if (global.TamHopEngine) {
        const dia = global.TamHopEngine.get_son_from_degree(rounded, "dia_ban");
        const nhan = global.TamHopEngine.get_son_from_degree(rounded, "nhan_ban");
        const thien = global.TamHopEngine.get_son_from_degree(rounded, "thien_ban");
        const pk120 = global.TamHopEngine.get_120_phan_kim(rounded);

        const elDia = document.getElementById('hud-tamban-dia');
        const elNhan = document.getElementById('hud-tamban-nhan');
        const elThien = document.getElementById('hud-tamban-thien');
        const elPk = document.getElementById('hud-tamban-pk120');

        if (elDia) elDia.textContent = `Sơn ${dia.son_name} (${dia.calc_degree.toFixed(1)}°)`;
        if (elNhan) elNhan.textContent = `Sơn ${nhan.son_name} (${nhan.calc_degree.toFixed(1)}°)`;
        if (elThien) elThien.textContent = `Sơn ${thien.son_name} (${thien.calc_degree.toFixed(1)}°)`;
        if (elPk) {
          const color = pk120.duoc_phep_lay ? '#4ade80' : '#f87171';
          elPk.innerHTML = `<span style="color:${color}; font-weight:700;">${pk120.phan_kim_type} • ${pk120.tinh_chat}</span>`;
        }
      }
    }

    if (state.isRayActive) {
      renderSurveyRay();
    }
  }

  // ================= 3.1. QUẢN LÝ MẶT BẰNG BẢN VẼ KIẾN TRÚC DƯỚI LA KINH =================
  function updateFloorPlanTransform() {
    const wrapper = document.getElementById('lakinh-floorplan-wrapper');
    const img = document.getElementById('lakinh-floorplan-img');
    const banner = document.getElementById('lakinh-plan-pan-banner');
    if (!wrapper || !img) return;

    if (!state.planImageSrc) {
      img.style.display = 'none';
      if (banner) banner.style.display = 'none';
      const planWrap = document.getElementById('lakinh-plan-controls-wrap');
      if (planWrap) planWrap.style.display = 'none';
      const statusVal = document.getElementById('sheet-val-plan-status');
      if (statusVal) statusVal.textContent = 'Chưa nạp ảnh';
      const btnRemove = document.getElementById('btn-plan-remove');
      if (btnRemove) btnRemove.style.display = 'none';
      return;
    }

    if (img.getAttribute('src') !== state.planImageSrc) {
      img.src = state.planImageSrc;
    }
    img.style.display = 'block';
    wrapper.style.transform = `translate(${state.planOffsetX}px, ${state.planOffsetY}px) rotate(${state.planRotation}deg) scale(${state.planScale})`;
    wrapper.style.opacity = state.planOpacity;

    // Cập nhật giá trị hiển thị trên Floating Plan Bar trên màn hình
    if (banner) {
      banner.style.display = state.planImageSrc ? 'flex' : 'none';
    }
    const flScaleVal = document.getElementById('fl-plan-scale-val');
    if (flScaleVal) flScaleVal.textContent = `${Math.round(state.planScale * 100)}%`;
    const flBtnPan = document.getElementById('fl-btn-plan-pan');
    if (flBtnPan) flBtnPan.classList.toggle('active', !!state.isPlanPanActive);

    // Cập nhật giá trị hiển thị trên bảng điều khiển Bottom Sheet
    const planWrap = document.getElementById('lakinh-plan-controls-wrap');
    if (planWrap) planWrap.style.display = 'block';
    const statusVal = document.getElementById('sheet-val-plan-status');
    if (statusVal) statusVal.textContent = 'Đã nạp bản vẽ';
    const btnRemove = document.getElementById('btn-plan-remove');
    if (btnRemove) btnRemove.style.display = 'block';

    const valScale = document.getElementById('sheet-val-plan-scale');
    if (valScale) valScale.textContent = `${Math.round(state.planScale * 100)}%`;
    const sliderScale = document.getElementById('sheet-slider-plan-scale');
    if (sliderScale && document.activeElement !== sliderScale) {
      sliderScale.value = Math.round(state.planScale * 100);
    }

    const valRot = document.getElementById('sheet-val-plan-rot');
    if (valRot) valRot.textContent = `${state.planRotation.toFixed(1)}°`;
    const sliderRot = document.getElementById('sheet-slider-plan-rot');
    if (sliderRot && document.activeElement !== sliderRot) {
      sliderRot.value = state.planRotation.toFixed(1);
    }

    const valOp = document.getElementById('sheet-val-plan-opacity');
    if (valOp) valOp.textContent = `${Math.round(state.planOpacity * 100)}%`;
    const sliderOp = document.getElementById('sheet-slider-plan-opacity');
    if (sliderOp && document.activeElement !== sliderOp) {
      sliderOp.value = Math.round(state.planOpacity * 100);
    }

    const valOffset = document.getElementById('sheet-val-plan-offset');
    if (valOffset) valOffset.textContent = `X: ${state.planOffsetX}px, Y: ${state.planOffsetY}px`;
  }

  function setFloorPlanFromDataUrl(dataUrl) {
    if (!dataUrl) return;
    state.planImageSrc = dataUrl;
    const img = document.getElementById('lakinh-floorplan-img');
    const statusVal = document.getElementById('sheet-val-plan-status');
    const controlsWrap = document.getElementById('lakinh-plan-controls-wrap');
    const btnRemove = document.getElementById('btn-plan-remove');

    if (statusVal) statusVal.textContent = 'Đang nạp ảnh...';

    const onImageLoaded = () => {
      // Hủy bỏ listener ngay để chống kích hoạt lại
      img.onload = null;
      img.onerror = null;

      // Chuẩn hóa tỉ lệ mặc định 100% (vừa vặn khung màn hình nhờ CSS max-width/max-height)
      state.planScale = 1.0;
      state.planOffsetX = 0;
      state.planOffsetY = 0;
      state.planRotation = 0.0;
      state.planOpacity = 0.85;
      state.isPlanPanActive = true; // Mặc định mở chế độ kéo để người dùng dễ căn chỉnh

      // Cập nhật DOM của Bottom Sheet nếu đang mở
      if (statusVal) statusVal.textContent = 'Đã nạp bản vẽ';
      if (controlsWrap) controlsWrap.style.display = 'block';
      if (btnRemove) btnRemove.style.display = 'block';

      // Tự động chuyển La Kinh sang Mica Trong Suốt và nền trong để thấy rõ mặt bằng bên dưới
      state.bgOpacity = 0.15;
      const bCircle = document.getElementById('lakinh-backdrop-circle');
      if (bCircle) bCircle.style.opacity = '0.15';
      const sBg = document.getElementById('sheet-slider-bg-opacity');
      if (sBg) sBg.value = 15;
      const valBg = document.getElementById('sheet-val-bg-opacity');
      if (valBg) valBg.textContent = '15%';

      if (state.activePlate !== 'thuoc_trans') {
        state.activePlate = 'thuoc_trans';
        const disc = document.getElementById('lakinh-disc');
        if (disc) disc.src = getPlateSrc('thuoc_trans');
        const btnPlateTrans = document.getElementById('btn-plate-trans');
        if (btnPlateTrans) btnPlateTrans.classList.add('active');
        const btnPlateThuoc = document.getElementById('btn-plate-thuoc');
        if (btnPlateThuoc) btnPlateThuoc.classList.remove('active');
        const btnPlateGold = document.getElementById('btn-plate-gold');
        if (btnPlateGold) btnPlateGold.classList.remove('active');
      }

      updateFloorPlanTransform();
      saveFloorPlanState();
      showLaKinhToast('✅ Đã nạp mặt bằng. Dùng nút + / - hoặc 2 ngón tay thu phóng.');
    };

    if (img) {
      img.onload = onImageLoaded;
      img.onerror = () => {
        img.onload = null;
        img.onerror = null;
        showLaKinhToast('❌ Không thể hiển thị ảnh mặt bằng');
      };
      img.src = state.planImageSrc;
      img.style.display = 'block';
    }
  }

  function loadFloorPlanFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawSrc = e.target.result;
      const tempImg = new Image();
      tempImg.onload = () => {
        const maxDim = 1600;
        let w = tempImg.naturalWidth;
        let h = tempImg.naturalHeight;
        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(tempImg, 0, 0, w, h);
          const compressedSrc = canvas.toDataURL('image/jpeg', 0.85);
          setFloorPlanFromDataUrl(compressedSrc);
        } else {
          setFloorPlanFromDataUrl(rawSrc);
        }
      };
      tempImg.src = rawSrc;
    };
    reader.readAsDataURL(file);
  }

  // Lắng nghe dữ liệu ảnh mặt bằng từ Flutter Native Android Kotlin
  window._onNativeFloorPlanReceived = function(images) {
    let targetSrc = null;
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed) && parsed.length > 0) targetSrc = parsed[0];
        else targetSrc = images;
      } catch (_) {
        targetSrc = images;
      }
    } else if (Array.isArray(images) && images.length > 0) {
      targetSrc = images[0];
    }
    if (targetSrc) {
      setFloorPlanFromDataUrl(targetSrc);
    }
  };

  function removeFloorPlan() {
    state.planImageSrc = null;
    state.planOffsetX = 0;
    state.planOffsetY = 0;
    state.planRotation = 0.0;
    state.planScale = 1.0;
    state.isPlanPanActive = false;
    const banner = document.getElementById('lakinh-plan-pan-banner');
    if (banner) banner.style.display = 'none';
    const btnPan = document.getElementById('sheet-btn-plan-pan');
    if (btnPan) btnPan.classList.remove('active');

    const img = document.getElementById('lakinh-floorplan-img');
    if (img) {
      img.src = '';
      img.style.display = 'none';
    }

    const statusVal = document.getElementById('sheet-val-plan-status');
    const controlsWrap = document.getElementById('lakinh-plan-controls-wrap');
    const btnRemove = document.getElementById('btn-plan-remove');
    if (statusVal) statusVal.textContent = 'Chưa nạp ảnh';
    if (controlsWrap) controlsWrap.style.display = 'none';
    if (btnRemove) btnRemove.style.display = 'none';

    updateFloorPlanTransform();
    try {
      localStorage.removeItem('lakinh_floorplan_state');
    } catch (_) {}
    showLaKinhToast('🗑️ Đã gỡ ảnh mặt bằng');
  }

  function togglePlanPanMode(force) {
    if (force !== undefined) {
      state.isPlanPanActive = force;
    } else {
      state.isPlanPanActive = !state.isPlanPanActive;
    }
    const btn = document.getElementById('sheet-btn-plan-pan');
    const flPanBtn = document.getElementById('fl-btn-plan-pan');
    const banner = document.getElementById('lakinh-plan-pan-banner');
    if (btn) {
      btn.classList.toggle('active', state.isPlanPanActive);
      btn.innerHTML = state.isPlanPanActive ? '✋ Đang Kéo Tâm (Xong)' : '✋ Kéo Dịch Tâm';
    }
    if (flPanBtn) {
      flPanBtn.classList.toggle('active', state.isPlanPanActive);
    }
    if (banner) {
      banner.style.display = state.planImageSrc ? 'flex' : 'none';
    }
    showLaKinhToast(state.isPlanPanActive
      ? '✋ Chế độ Kéo Tâm: Kéo 1 ngón để dịch chuyển, 2 ngón để phóng to/xoay'
      : '🔒 Đã cố định vị trí mặt bằng');
  }


  function saveFloorPlanState() {
    try {
      const data = {
        scale: state.planScale,
        rotation: state.planRotation,
        opacity: state.planOpacity,
        offsetX: state.planOffsetX,
        offsetY: state.planOffsetY
      };
      if (state.planImageSrc && state.planImageSrc.length < 2.5 * 1024 * 1024) {
        data.imageSrc = state.planImageSrc;
      }
      localStorage.setItem('lakinh_floorplan_state', JSON.stringify(data));
    } catch (_) {}
  }

  function restoreFloorPlanState() {
    try {
      const raw = localStorage.getItem('lakinh_floorplan_state');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.scale !== undefined && data.scale > 0) state.planScale = data.scale;
      else state.planScale = 1.0;
      if (data.rotation !== undefined) state.planRotation = data.rotation;
      if (data.opacity) state.planOpacity = data.opacity;
      if (data.offsetX !== undefined) state.planOffsetX = data.offsetX;
      if (data.offsetY !== undefined) state.planOffsetY = data.offsetY;
      if (data.imageSrc) {
        state.planImageSrc = data.imageSrc;
        const img = document.getElementById('lakinh-floorplan-img');
        if (img) {
          img.onload = null;
          img.src = state.planImageSrc;
          img.style.display = 'block';
        }
      }
      updateFloorPlanTransform();
    } catch (_) {}
  }

  // ================= 3.2. QUẢN LÝ TIA NGẮM PHONG THỦY (LẬP CỰC QUA 1 ĐIỂM) =================
  function setRayAngle(deg) {
    state.rayAngle = ((parseFloat(deg) % 360) + 360) % 360;
    state.rayAngle = Math.round(state.rayAngle * 10) / 10;
    updateSightingRay();
  }

  function onAimRayAtPoint(clientX, clientY) {
    const container = document.getElementById('view-lakinh');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 15) return;

    // Góc trên màn hình: 0° tại 12h (thẳng đứng lên), tăng theo chiều kim đồng hồ
    const screenAngle = ((Math.atan2(dx, -dy) * 180 / Math.PI) % 360 + 360) % 360;
    // Độ số La Kinh tương ứng trên mặt đĩa đã xoay theo hướng nhà (state.rotation):
    const laKinhDeg = ((state.rotation + screenAngle) % 360 + 360) % 360;
    state.rayAngle = Math.round(laKinhDeg * 10) / 10;
    state.rayDistance = Math.max(30, Math.min(Math.round(dist), Math.max(rect.width, rect.height) * 0.9));
    updateSightingRay();
  }

  function updateSightingRay() {
    const container = document.getElementById('view-lakinh');
    if (!container) return;
    const rayContainer = document.getElementById('lakinh-ray-container');
    const rayHud = document.getElementById('lakinh-ray-floating-hud');
    const miniPill = document.getElementById('lakinh-ray-mini-pill');
    const rayWrap = document.getElementById('lakinh-ray-controls-wrap');
    const btnRay = document.getElementById('sheet-btn-ray');
    const btnQuickRay = document.getElementById('lakinh-btn-ray-quick');

    if (!state.isRayActive) {
      if (rayContainer) rayContainer.style.display = 'none';
      if (rayHud) rayHud.style.display = 'none';
      if (miniPill) miniPill.style.display = 'none';
      if (rayWrap) rayWrap.style.display = 'none';
      if (btnRay) {
        btnRay.classList.remove('success');
        btnRay.innerHTML = '🎯 Bật Tia Ngắm';
      }
      if (btnQuickRay) btnQuickRay.classList.remove('active');
      if (surveyRayLayerGroup) surveyRayLayerGroup.clearLayers();
      return;
    }

    if (state.rayAngle === null || state.rayAngle === undefined) {
      state.rayAngle = state.rotation;
    }

    if (rayContainer) rayContainer.style.display = 'block';
    if (rayWrap) rayWrap.style.display = 'block';
    if (btnRay) {
      btnRay.classList.add('success');
      btnRay.innerHTML = '🎯 Đang Bật Tia Ngắm (Tắt)';
    }
    if (btnQuickRay) btnQuickRay.classList.add('active');

    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;

    const deg = ((state.rayAngle % 360) + 360) % 360;
    // Góc vẽ trên màn hình từ tâm (ngược lại từ La Kinh về tọa độ màn hình):
    const screenAngle = ((deg - state.rotation) % 360 + 360) % 360;
    const rad = screenAngle * Math.PI / 180;

    const r = Math.max(30, state.rayDistance || 160);
    const tx = cx + r * Math.sin(rad);
    const ty = cy - r * Math.cos(rad);

    const fullR = Math.max(w, h) * 2;
    const fx = cx + fullR * Math.sin(rad);
    const fy = cy - fullR * Math.cos(rad);

    // Cập nhật SVG
    const svg = document.getElementById('lakinh-ray-svg');
    if (svg) {
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.setAttribute('width', w);
      svg.setAttribute('height', h);

      const lineFull = document.getElementById('ray-line-full');
      if (lineFull) {
        lineFull.setAttribute('x1', cx);
        lineFull.setAttribute('y1', cy);
        lineFull.setAttribute('x2', fx);
        lineFull.setAttribute('y2', fy);
      }

      const lineTarget = document.getElementById('ray-line-target');
      if (lineTarget) {
        lineTarget.setAttribute('x1', cx);
        lineTarget.setAttribute('y1', cy);
        lineTarget.setAttribute('x2', tx);
        lineTarget.setAttribute('y2', ty);
      }

      const distCircle = document.getElementById('ray-distance-circle');
      if (distCircle) {
        distCircle.setAttribute('cx', cx);
        distCircle.setAttribute('cy', cy);
        distCircle.setAttribute('r', r);
      }
    }

    // Cập nhật vị trí điểm mục tiêu
    const targetHandle = document.getElementById('lakinh-ray-target-handle');
    if (targetHandle) {
      targetHandle.style.left = `${tx}px`;
      targetHandle.style.top = `${ty}px`;
    }

    // Tra cứu phong thủy chuyên sâu
    let sonName = 'Tý';
    let sonCung = 'Khảm';
    let sonHanh = 'Thủy';
    let queName = '';
    let quaiKhi = '';
    let quaiVan = '';
    let haoTen = '';
    let haoCanChi = '';
    let haoLucThan = '';
    let van9RoleText = '';
    let van9BadgeClass = '';
    let queRange = '';
    let haThuong = '';
    let haoRange = '';
    let haoAmDuong = '';
    let van9Advice = '';
    let lucThanAdvice = '';
    let ungKyText = '';
    let hkdq = null;

    if (global.NetaLaKinhEngine) {
      const son = global.NetaLaKinhEngine.getSonInfo(deg);
      if (son) {
        sonName = son.name;
        sonCung = son.cung;
        sonHanh = son.hanh;
      }
      if (global.NetaLaKinhEngine.getHKDQInfo) {
        hkdq = global.NetaLaKinhEngine.getHKDQInfo(deg);
        if (hkdq) {
          queName = hkdq.que_name || '';
          quaiKhi = hkdq.quai_khi || hkdq.quai_so || '';
          quaiVan = hkdq.quai_van || '';
          queRange = hkdq.deg_range_que ? `Dải: ${hkdq.deg_range_que}` : '';
          haThuong = hkdq.ha_thuong_quai ? `Quẻ: ${hkdq.ha_thuong_quai}` : '';

          if (hkdq.hao_vi_phan) {
            haoTen = hkdq.hao_vi_phan.ten_hao || '';
            haoCanChi = hkdq.hao_vi_phan.can_chi || '';
            haoLucThan = hkdq.hao_vi_phan.luc_than || '';
            haoRange = hkdq.hao_vi_phan.deg_range ? `Dải: ${hkdq.hao_vi_phan.deg_range}` : '';
            haoAmDuong = hkdq.chieu_hao ? `Chiều: ${hkdq.chieu_hao}` : '';
            lucThanAdvice = hkdq.hao_vi_phan.advice || '';
            if (hkdq.hao_vi_phan.nam_phat || hkdq.hao_vi_phan.nguoi_phat) {
              const np = hkdq.hao_vi_phan.nam_phat ? `Năm: ${hkdq.hao_vi_phan.nam_phat}` : '';
              const ngp = hkdq.hao_vi_phan.nguoi_phat ? `Ứng: ${hkdq.hao_vi_phan.nguoi_phat}` : '';
              ungKyText = [np, ngp].filter(Boolean).join(' • ');
            }
          }
          if (hkdq.van_9_role) {
            if (hkdq.van_9_role.is_duong_van_9) {
              van9RoleText = '✨ Đương Vận 9';
              van9BadgeClass = 'duong';
            } else if (hkdq.van_9_role.is_linh_than) {
              van9RoleText = '🌊 Linh Thần V9';
              van9BadgeClass = 'linh';
            } else {
              van9RoleText = '⛰️ Chính Thần V9';
              van9BadgeClass = 'chinh';
            }
            van9Advice = hkdq.van_9_role.advice || '';
          }
          if (hkdq.canh_bao_khong_vong && hkdq.canh_bao_khong_vong.is_near_boundary) {
            van9RoleText = `⚠️ Ranh ${hkdq.canh_bao_khong_vong.distance}°`;
            van9BadgeClass = 'warn';
          }
        }
      }
    }

    // Góc lệch so với hướng nhà
    let diff = ((deg - state.rotation + 180) % 360 + 360) % 360 - 180;
    diff = Math.round(diff * 10) / 10;
    let diffText = '';
    if (Math.abs(diff) < 0.2) {
      diffText = '🎯 Trùng Chính Hướng Nhà';
    } else if (Math.abs(Math.abs(diff) - 180) < 0.2) {
      diffText = '🔄 Trùng Chính Tọa Nhà';
    } else if (diff > 0) {
      diffText = `Lệch +${diff.toFixed(1)}° (Hữu / Bạch Hổ)`;
    } else {
      diffText = `Lệch ${diff.toFixed(1)}° (Tả / Thanh Long)`;
    }

    // Cập nhật nhãn ngay trên điểm mục tiêu
    const targetLabel = document.getElementById('lakinh-ray-target-label');
    if (targetLabel) {
      targetLabel.innerHTML = `
        <span class="rtl-deg">${deg.toFixed(1)}°</span>
        <span class="rtl-son">Sơn ${sonName}</span>
        ${queName ? `<span class="rtl-que" style="color:#fbbf24; margin-left:3px;">${queName}</span>` : ''}
      `;
    }

    // Cập nhật Floating HUD & Mini Capsule trên màn hình
    if (!state.isSheetOpen) {
      if (state.isRayHudCollapsed) {
        if (rayHud) rayHud.style.display = 'none';
        if (miniPill) {
          miniPill.style.display = 'flex';
          const miniDeg = document.getElementById('ray-mini-deg');
          const miniSon = document.getElementById('ray-mini-son');
          const miniQue = document.getElementById('ray-mini-que');
          const miniKhivan = document.getElementById('ray-mini-khivan');
          const miniHao = document.getElementById('ray-mini-hao');
          const miniBadge = document.getElementById('ray-mini-badge');

          if (miniDeg) miniDeg.textContent = `${deg.toFixed(1)}°`;
          if (miniSon) miniSon.textContent = `Sơn ${sonName} (${sonCung})`;
          if (miniQue) miniQue.textContent = queName || '---';
          if (miniKhivan) miniKhivan.textContent = quaiKhi ? `Khí ${quaiKhi} • Vận ${quaiVan}` : '---';
          if (miniHao) {
            if (hkdq && hkdq.hao_vi_phan) {
              const h = hkdq.hao_vi_phan;
              const ltColor = (h.luc_than === 'Thê Tài' || h.luc_than === 'Tử Tôn') ? '#4ade80' : (h.luc_than === 'Quan Quỷ' ? '#f87171' : (h.luc_than === 'Phụ Mẫu' ? '#c084fc' : '#fb923c'));
              miniHao.innerHTML = `${h.ten_hao} <span style="color:${ltColor}; font-weight:700;">(${h.luc_than || ''})</span>`;
            } else {
              miniHao.textContent = haoTen || '---';
            }
          }
          if (miniBadge && hkdq && hkdq.van_9_role) {
            if (hkdq.canh_bao_khong_vong && hkdq.canh_bao_khong_vong.is_near_boundary) {
              miniBadge.className = 'hkdq-qp-tag warn';
              miniBadge.textContent = `⚠️ Ranh ${hkdq.canh_bao_khong_vong.distance}°`;
            } else if (hkdq.van_9_role.is_duong_van_9) {
              miniBadge.className = 'hkdq-qp-tag duong';
              miniBadge.textContent = '✨ Đương Vận 9';
            } else if (hkdq.van_9_role.is_linh_than) {
              miniBadge.className = 'hkdq-qp-tag linh';
              miniBadge.textContent = '🌊 Linh Thần V9';
            } else {
              miniBadge.className = 'hkdq-qp-tag chinh';
              miniBadge.textContent = '⛰️ Chính Thần V9';
            }
            miniBadge.style.display = 'inline-block';
          } else if (miniBadge) {
            miniBadge.style.display = 'none';
          }
        }
      } else {
        if (miniPill) miniPill.style.display = 'none';
        if (rayHud) {
          rayHud.style.display = 'block';
          const hudDeg = document.getElementById('ray-hud-deg');
          const hudSon = document.getElementById('ray-hud-son');
          const hudQue = document.getElementById('ray-hud-que');
          const hudKhivan = document.getElementById('ray-hud-khivan');
          const hudQueRange = document.getElementById('ray-hud-que-range');
          const hudQueHaThuong = document.getElementById('ray-hud-que-ha-thuong');
          const hudHao = document.getElementById('ray-hud-hao');
          const hudHaoRange = document.getElementById('ray-hud-hao-range');
          const hudHaoAmDuong = document.getElementById('ray-hud-hao-amduong');
          const hudVan9 = document.getElementById('ray-hud-badge-van9');
          const hudAdviceVan9 = document.getElementById('ray-hud-advice-van9');
          const hudAdviceText = document.getElementById('ray-hud-advice-text');
          const hudUngKy = document.getElementById('ray-hud-ung-ky');
          const hudDiff = document.getElementById('ray-hud-diff');

          if (hudDeg) hudDeg.textContent = `${deg.toFixed(1)}°`;
          if (hudSon) hudSon.textContent = `Sơn ${sonName} (${sonCung} • ${sonHanh})`;
          if (hudQue) hudQue.textContent = queName ? `Quẻ ${queName}` : '';
          if (hudKhivan) hudKhivan.textContent = quaiKhi ? `(Khí ${quaiKhi} • Vận ${quaiVan})` : '';
          if (hudQueRange) hudQueRange.textContent = queRange;
          if (hudQueHaThuong) hudQueHaThuong.textContent = haThuong;
          if (hudHao) hudHao.textContent = haoTen ? `${haoTen} (${haoCanChi} • ${haoLucThan})` : '';
          if (hudHaoRange) hudHaoRange.textContent = haoRange;
          if (hudHaoAmDuong) hudHaoAmDuong.textContent = haoAmDuong;
          if (hudVan9) {
            hudVan9.textContent = van9RoleText;
            hudVan9.className = `ray-hud-badge ${van9BadgeClass}`;
            hudVan9.style.display = van9RoleText ? 'inline-block' : 'none';
          }
          if (hudAdviceVan9) {
            hudAdviceVan9.textContent = `${van9RoleText || 'Huyền Không Đại Quái'}:`;
          }
          if (hudAdviceText) {
            hudAdviceText.textContent = lucThanAdvice || van9Advice || 'Phương vị nạp khí phong thủy';
          }
          if (hudUngKy) hudUngKy.textContent = ungKyText;
          if (hudDiff) hudDiff.textContent = diffText;
        }
      }
    } else {
      if (rayHud) rayHud.style.display = 'none';
      if (miniPill) miniPill.style.display = 'none';
    }

    // Cập nhật thanh trượt và nhãn trong Sheet
    const sliderDeg = document.getElementById('sheet-slider-ray-deg');
    const valDeg = document.getElementById('sheet-val-ray-deg');
    const valDegSub = document.getElementById('sheet-val-ray-deg-sub');
    if (sliderDeg && document.activeElement !== sliderDeg) {
      sliderDeg.value = deg.toFixed(1);
    }
    if (valDeg) valDeg.textContent = `${deg.toFixed(1)}°`;
    if (valDegSub) valDegSub.textContent = `${deg.toFixed(1)}°`;

    // Cập nhật Card thông số trong Sheet
    const sheetSon = document.getElementById('sheet-ray-son');
    const sheetQue = document.getElementById('sheet-ray-que');
    const sheetHao = document.getElementById('sheet-ray-hao');
    const sheetDiff = document.getElementById('sheet-ray-diff');
    if (sheetSon) sheetSon.textContent = `Sơn ${sonName} (${sonCung} • Hành ${sonHanh})`;
    if (sheetQue) sheetQue.textContent = queName ? `Quẻ ${queName} (Khí ${quaiKhi} • Vận ${quaiVan})` : '---';
    if (sheetHao) sheetHao.textContent = haoTen ? `${haoTen} (${haoCanChi} • ${haoLucThan}) ${van9RoleText}` : '---';
    if (sheetDiff) sheetDiff.textContent = diffText;

    // Dọn dẹp layer phụ trên Leaflet map (tránh tạo thêm tia ngắm thứ 2 trùng lặp)
    if (surveyRayLayerGroup) {
      surveyRayLayerGroup.clearLayers();
    }
  }

  function renderSurveyRay() {
    updateSightingRay();
  }

  // ================= KỲ MÔN CHIẾN LƯỢC JOEY YAP COMPENDIUM (PHASE 3) =================
  const PALACE_DEG = {
    1: 0,    // Khảm (Bắc)
    8: 45,   // Cấn (Đông Bắc)
    3: 90,   // Chấn (Đông)
    4: 135,  // Tốn (Đông Nam)
    9: 180,  // Ly (Nam)
    2: 225,  // Khôn (Tây Nam)
    7: 270,  // Đoài (Tây)
    6: 315   // Càn (Tây Bắc)
  };

  const PALACE_NAMES = {
    1: 'Bắc (Khảm 1)',
    8: 'Đông Bắc (Cấn 8)',
    3: 'Đông (Chấn 3)',
    4: 'Đông Nam (Tốn 4)',
    9: 'Nam (Ly 9)',
    2: 'Tây Nam (Khôn 2)',
    7: 'Tây (Đoài 7)',
    6: 'Tây Bắc (Càn 6)'
  };

  const PALACE_DIRECTIONS = {
    1: 'Bắc 0°',
    8: 'Đông Bắc 45°',
    3: 'Đông 90°',
    4: 'Đông Nam 135°',
    9: 'Nam 180°',
    2: 'Tây Nam 225°',
    7: 'Tây 270°',
    6: 'Tây Bắc 315°'
  };

  function createSvgStrategicBadge({
    deg,
    radius,
    width = 220,
    height = 58,
    bgColor = 'rgba(15, 23, 42, 0.95)',
    borderColor = '#22c55e',
    icon = '🟢',
    title = 'TỌA LƯNG',
    subtitle = 'Cung Tốn • 135°',
    hint = 'Ngồi quay lưng hướng này',
    hintColor = '#a7f3d0'
  }) {
    const pt = getRadialVector(deg, radius, radius);
    const cx = parseFloat(pt.x1);
    const cy = parseFloat(pt.y1);
    const halfW = width / 2;
    const halfH = height / 2;
    const bx = (cx - halfW).toFixed(1);
    const by = (cy - halfH).toFixed(1);
    const curRot = state.rotation || 0;

    return `
      <g class="qmdj-counter-rotate" data-cx="${cx}" data-cy="${cy}" transform="rotate(${curRot}, ${cx}, ${cy})">
        <!-- Nền Đậm Chống Nhiễu 36 Tầng La Kinh -->
        <rect x="${bx}" y="${by}" width="${width}" height="${height}" rx="10" 
              fill="${bgColor}" 
              stroke="${borderColor}" stroke-width="2.5" 
              filter="drop-shadow(0 4px 12px rgba(0,0,0,0.92))" />
        <!-- Dòng 1: Tiêu đề & Icon nổi bật -->
        <text x="${cx}" y="${(parseFloat(by) + 18).toFixed(1)}" fill="${borderColor}" font-size="16" font-weight="900" 
              text-anchor="middle" dominant-baseline="middle" letter-spacing="0.5">
          ${icon} ${title}
        </text>
        <!-- Dòng 2: Cung vị & Góc độ -->
        <text x="${cx}" y="${(parseFloat(by) + 35).toFixed(1)}" fill="#ffffff" font-size="13" font-weight="800" 
              text-anchor="middle" dominant-baseline="middle">
          ${subtitle}
        </text>
        ${hint ? `
        <!-- Dòng 3: Ý nghĩa hành động thực tế -->
        <text x="${cx}" y="${(parseFloat(by) + 48).toFixed(1)}" fill="${hintColor}" font-size="10.5" font-weight="600" 
              text-anchor="middle" dominant-baseline="middle">
          ${hint}
        </text>` : ''}
      </g>
    `;
  }

  function getAnnularSectorPath(centerDeg, r1, r2, spanDeg = 45) {
    const half = spanDeg / 2;
    const a1 = (centerDeg - half) * Math.PI / 180;
    const a2 = (centerDeg + half) * Math.PI / 180;
    const x1 = 500 + r1 * Math.sin(a1);
    const y1 = 500 - r1 * Math.cos(a1);
    const x2 = 500 + r2 * Math.sin(a1);
    const y2 = 500 - r2 * Math.cos(a1);
    const x3 = 500 + r2 * Math.sin(a2);
    const y3 = 500 - r2 * Math.cos(a2);
    const x4 = 500 + r1 * Math.sin(a2);
    const y4 = 500 - r1 * Math.cos(a2);
    return `M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)} A ${r2} ${r2} 0 0 1 ${x3.toFixed(1)} ${y3.toFixed(1)} L ${x4.toFixed(1)} ${y4.toFixed(1)} A ${r1} ${r1} 0 0 0 ${x1.toFixed(1)} ${y1.toFixed(1)} Z`;
  }

  function getRadialVector(deg, r1, r2) {
    const rad = deg * Math.PI / 180;
    const x1 = 500 + r1 * Math.sin(rad);
    const y1 = 500 - r1 * Math.cos(rad);
    const x2 = 500 + r2 * Math.sin(rad);
    const y2 = 500 - r2 * Math.cos(rad);
    return { x1: x1.toFixed(1), y1: y1.toFixed(1), x2: x2.toFixed(1), y2: y2.toFixed(1) };
  }

      function normalizeDeg(deg) {
    let d = parseFloat(deg) || 0;
    d = d % 360.0;
    if (d < 0) d += 360.0;
    return d;
  }

  function getSonCenterDeg(sonName) {
    if (!sonName) return 0;
    const s = String(sonName).trim();
    const map = {
      'Tý': 0, 'Quý': 15, 'Sửu': 30, 'Cấn': 45, 'Dần': 60, 'Giáp': 75,
      'Mão': 90, 'Ất': 105, 'Thìn': 120, 'Tốn': 135, 'Tỵ': 150, 'Bính': 165,
      'Ngọ': 180, 'Đinh': 195, 'Mùi': 210, 'Khôn': 225, 'Thân': 240, 'Canh': 255,
      'Dậu': 270, 'Tân': 285, 'Tuất': 300, 'Càn': 315, 'Hợi': 330, 'Nhâm': 345
    };
    return map[s] !== undefined ? map[s] : 0;
  }

  function createSvgTamHopBadge({
    deg,
    radius,
    width = 175,
    height = 42,
    bgColor = 'rgba(15, 23, 42, 0.94)',
    borderColor = '#10b981',
    icon = '🌱',
    title = '',
    subtitle = '',
    hint = '',
    hintColor = '#cbd5e1'
  }) {
    const rad = deg * Math.PI / 180;
    const cx = (500 + radius * Math.sin(rad)).toFixed(1);
    const cy = (500 - radius * Math.cos(rad)).toFixed(1);
    const halfW = width / 2;
    const halfH = height / 2;
    const bx = (cx - halfW).toFixed(1);
    const by = (cy - halfH).toFixed(1);
    const curRot = state.rotation || 0;

    return `
      <g class="tamhop-counter-rotate" data-cx="${cx}" data-cy="${cy}" transform="rotate(${curRot}, ${cx}, ${cy})">
        <rect x="${bx}" y="${by}" width="${width}" height="${height}" rx="10" 
              fill="${bgColor}" 
              stroke="${borderColor}" stroke-width="2.2" 
              filter="drop-shadow(0 4px 12px rgba(0,0,0,0.92))" />
        <text x="${cx}" y="${(parseFloat(by) + 16).toFixed(1)}" fill="${borderColor}" font-size="14.5" font-weight="900" 
              text-anchor="middle" dominant-baseline="middle" letter-spacing="0.5">
          ${icon} ${title}
        </text>
        <text x="${cx}" y="${(parseFloat(by) + 31).toFixed(1)}" fill="#ffffff" font-size="12" font-weight="800" 
              text-anchor="middle" dominant-baseline="middle">
          ${subtitle}
        </text>
        ${hint ? `
        <text x="${cx}" y="${(parseFloat(by) + 43).toFixed(1)}" fill="${hintColor}" font-size="9.5" font-weight="600" 
              text-anchor="middle" dominant-baseline="middle">
          ${hint}
        </text>` : ''}
      </g>
    `;
  }

  function updateTamHopLayer() {
    const btnQuick = document.getElementById('lakinh-btn-tam-hop');
    const svgOverlay = document.getElementById('lakinh-tamhop-svg');
    const svgContent = document.getElementById('lakinh-tamhop-svg-content');
    const hud = document.getElementById('lakinh-tamhop-floating-hud');

    if (!state.isTamHopActive) {
      if (btnQuick) btnQuick.classList.remove('active');
      if (svgOverlay) svgOverlay.style.display = 'none';
      if (hud) hud.style.display = 'none';
      return;
    }

    if (btnQuick) btnQuick.classList.add('active');
    if (svgOverlay) {
      svgOverlay.style.display = 'block';
      svgOverlay.style.transform = `rotate(${-state.rotation}deg)`;
    }
    if (hud) {
      hud.style.display = 'block';
      hud.classList.toggle('is-collapsed', !!state.isTamHopHudCollapsed);
    }

    if (!global.TamHopEngine) {
      console.warn("TamHopEngine chưa nạp xong");
      return;
    }

    const curHuongDeg = normalizeDeg(state.rotation || 0);
    const thuyKhauDeg = normalizeDeg(state.tamHopThuyKhauDeg || 115.0);
    const dongChay = state.tamHopDongChay || 'ta_dao_huu';
    const canChu = state.tamHopCanChu || 'Giáp';
    const chiChu = state.tamHopChiChu || 'Tý';
    const namChi = state.tamHopNamChi || 'Thìn';
    const curCucInfo = (state.tamHopCucData && state.tamHopDuongCuc && state.tamHopCucData[state.tamHopDuongCuc]) ? state.tamHopCucData[state.tamHopDuongCuc] : null;

    const thuyPhap = global.TamHopEngine.evaluate_trach_thuy_phap(curHuongDeg, thuyKhauDeg, dongChay);
    const cucName = thuyPhap.cuc_name;
    const chieuQuay = thuyPhap.chieu_quay;
    const vongTS = global.TamHopEngine.get_vong_truong_sinh(cucName, chieuQuay);
    const tamCat = global.TamHopEngine.get_quy_nhan_loc_ma(canChu, chiChu);
    const tamSat = global.TamHopEngine.kiem_tra_tam_sat(namChi, thuyPhap.huong_nha.son_name);
    const hoangTuyen = global.TamHopEngine.kiem_tra_hoang_tuyen(thuyPhap.huong_nha.son_name, thuyPhap.thuy_khau.son_name);

    let cungTS = vongTS.find(c => c.cung_truong_sinh === 'Trường Sinh');
    let cungDV = vongTS.find(c => c.cung_truong_sinh === 'Đế Vượng');
    let cungLQ = vongTS.find(c => c.cung_truong_sinh === 'Lâm Quan');
    let cungMK = vongTS.find(c => c.cung_truong_sinh === 'Mộ');

    const tsSon = cungTS ? cungTS.song_son.split('/')[0] : 'Thân';
    const dvSon = cungDV ? cungDV.song_son.split('/')[0] : 'Tý';
    const lqSon = cungLQ ? cungLQ.song_son.split('/')[0] : 'Càn';
    const mkSon = cungMK ? cungMK.song_son.split('/')[0] : 'Thìn';

    const tsDeg = getSonCenterDeg(tsSon);
    const dvDeg = getSonCenterDeg(dvSon);
    const lqDeg = getSonCenterDeg(lqSon);
    const mkDeg = getSonCenterDeg(mkSon);

    if (svgContent) {
      let svgHtml = '';

      // 1. Thủy Khẩu (Tia nước thoát & Điểm chốt định Cục)
      const tkArrow = getRadialVector(thuyKhauDeg, 250, 475);
      svgHtml += `<line x1="${tkArrow.x1}" y1="${tkArrow.y1}" x2="${tkArrow.x2}" y2="${tkArrow.y2}" stroke="#06b6d4" stroke-width="4.5" stroke-dasharray="6,4" filter="url(#tamhop-glow-cyan)" marker-end="url(#tamhop-arrow-cyan)" />`;
      const tkPt = getRadialVector(thuyKhauDeg, 465, 465);
      svgHtml += `<circle cx="${tkPt.x1}" cy="${tkPt.y1}" r="12" fill="#06b6d4" stroke="#ffffff" stroke-width="2.5" />`;
      const curDistBadge = (curCucInfo && curCucInfo.distM) ? (' • ' + curCucInfo.distM + 'm') : '';
      svgHtml += createSvgTamHopBadge({
        deg: thuyKhauDeg,
        radius: 435,
        width: 190,
        height: 54,
        bgColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#06b6d4',
        icon: '💧',
        title: 'THỦY KHẨU (THOÁT)',
        subtitle: `Sơn ${thuyPhap.thuy_khau.son_name} (${thuyKhauDeg.toFixed(1)}°${curDistBadge})`,
        hint: `Cửa nước định ${cucName.split(' ')[0]}`,
        hintColor: '#a5f3fc'
      });

      // 2. Vòng Trường Sinh: Trường Sinh (Sinh Khí Khởi Phát)
      const tsArrow = getRadialVector(tsDeg, 200, 395);
      svgHtml += `<line x1="${tsArrow.x1}" y1="${tsArrow.y1}" x2="${tsArrow.x2}" y2="${tsArrow.y2}" stroke="#10b981" stroke-width="3" stroke-dasharray="4,4" />`;
      svgHtml += createSvgTamHopBadge({
        deg: tsDeg,
        radius: 360,
        width: 175,
        height: 52,
        bgColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#10b981',
        icon: '🌱',
        title: 'TRƯỜNG SINH (CÁT)',
        subtitle: `Sơn ${cungTS ? cungTS.song_son : tsSon}`,
        hint: 'Nguồn nước đến / Sinh khí tụ',
        hintColor: '#86efac'
      });

      // 3. Vòng Trường Sinh: Đế Vượng (Đỉnh Cao Tụ Khí)
      const dvArrow = getRadialVector(dvDeg, 200, 395);
      svgHtml += `<line x1="${dvArrow.x1}" y1="${dvArrow.y1}" x2="${dvArrow.x2}" y2="${dvArrow.y2}" stroke="#f59e0b" stroke-width="3.5" filter="url(#tamhop-glow-gold)" />`;
      svgHtml += createSvgTamHopBadge({
        deg: dvDeg,
        radius: 360,
        width: 175,
        height: 52,
        bgColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#f59e0b',
        icon: '👑',
        title: 'ĐẾ VƯỢNG (ĐẠI CÁT)',
        subtitle: `Sơn ${cungDV ? cungDV.song_son : dvSon}`,
        hint: 'Cực vượng tụ khí / Minh đường',
        hintColor: '#fef08a'
      });

      // 4. Vòng Trường Sinh: Lâm Quan (Thôi Quan Tiến Lộc)
      svgHtml += createSvgTamHopBadge({
        deg: lqDeg,
        radius: 360,
        width: 175,
        height: 52,
        bgColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#0ea5e9',
        icon: '⭐',
        title: 'LÂM QUAN (TIẾN LỘC)',
        subtitle: `Sơn ${cungLQ ? cungLQ.song_son : lqSon}`,
        hint: 'Thôi quan quý tài vững bền',
        hintColor: '#bae6fd'
      });

      // 5. Vòng Trường Sinh: Mộ Khố (Tiêu Thủy Đúng Vị)
      svgHtml += createSvgTamHopBadge({
        deg: mkDeg,
        radius: 360,
        width: 175,
        height: 52,
        bgColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#8b5cf6',
        icon: '⛩️',
        title: 'MỘ KHỐ (QUY TÀNG)',
        subtitle: `Sơn ${cungMK ? cungMK.song_son : mkSon}`,
        hint: 'Tụ tài tàng phong quy thủy',
        hintColor: '#ddd6fe'
      });

      // 6. Hoàng Tuyền Sát
      const htMap = {
        'Giáp': 'Cấn', 'Ất': 'Tốn', 'Bính': 'Tốn', 'Đinh': 'Khôn',
        'Canh': 'Khôn', 'Tân': 'Càn', 'Nhâm': 'Càn', 'Quý': 'Cấn'
      };
      const htSon = htMap[thuyPhap.huong_nha.son_name];
      if (htSon) {
        const htDeg = getSonCenterDeg(htSon);
        const pathD = getAnnularSectorPath(htDeg, 430, 480, 15);
        svgHtml += `<path d="${pathD}" fill="rgba(239, 68, 68, 0.28)" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="4,4" filter="url(#tamhop-glow-red)" />`;
        svgHtml += createSvgTamHopBadge({
          deg: htDeg,
          radius: 450,
          width: 185,
          height: 52,
          bgColor: 'rgba(15, 23, 42, 0.95)',
          borderColor: '#ef4444',
          icon: '☠️',
          title: 'HOÀNG TUYỀN (ĐẠI KỴ)',
          subtitle: `Sơn ${htSon}`,
          hint: 'Tuyệt đối cấm khứ thủy / mở cửa',
          hintColor: '#fca5a5'
        });
      }

      // 7. Bát Sát Tiêu Vong
      const batSatChiMap = {
        'Khảm': 'Thìn', 'Khôn': 'Mão', 'Chấn': 'Thân', 'Tốn': 'Dậu',
        'Càn': 'Ngọ', 'Đoài': 'Tỵ', 'Cấn': 'Dần', 'Ly': 'Hợi'
      };
      const bsChi = batSatChiMap[thuyPhap.huong_nha.cung_bat_quai];
      if (bsChi) {
        const bsDeg = getSonCenterDeg(bsChi);
        svgHtml += createSvgTamHopBadge({
          deg: bsDeg,
          radius: 450,
          width: 185,
          height: 52,
          bgColor: 'rgba(15, 23, 42, 0.95)',
          borderColor: '#dc2626',
          icon: '🚫',
          title: 'BÁT SÁT TIÊU VONG',
          subtitle: `Sơn ${bsChi} (${thuyPhap.huong_nha.cung_bat_quai} Quái)`,
          hint: 'Kỵ lai thủy & mở cổng cửa',
          hintColor: '#fca5a5'
        });
      }

      // 8. Tam Cát Thần Trợ (Vành trong r=275)
      if (tamCat.duong_quy_nhan && tamCat.duong_quy_nhan !== 'Chưa rõ') {
        const qnDeg = getSonCenterDeg(tamCat.duong_quy_nhan);
        svgHtml += createSvgTamHopBadge({
          deg: qnDeg,
          radius: 275,
          width: 155,
          height: 38,
          bgColor: 'rgba(15, 23, 42, 0.92)',
          borderColor: '#06b6d4',
          icon: '💎',
          title: 'DƯƠNG QUÝ NHÂN',
          subtitle: `Sơn ${tamCat.duong_quy_nhan}`,
          hintColor: '#67e8f9'
        });
      }
      if (tamCat.thien_loc && tamCat.thien_loc !== 'Chưa rõ') {
        const locDeg = getSonCenterDeg(tamCat.thien_loc);
        svgHtml += createSvgTamHopBadge({
          deg: locDeg,
          radius: 275,
          width: 145,
          height: 38,
          bgColor: 'rgba(15, 23, 42, 0.92)',
          borderColor: '#eab308',
          icon: '💰',
          title: 'THIÊN LỘC VỊ',
          subtitle: `Sơn ${tamCat.thien_loc}`,
          hintColor: '#fef08a'
        });
      }

      svgContent.innerHTML = svgHtml;
    }

    const cucLabel = document.getElementById('tamhop-hud-cuc-label');
    if (cucLabel) cucLabel.textContent = cucName.split(' ')[0];

    const cpKhau = document.getElementById('compact-th-khau');
    const cpSinh = document.getElementById('compact-th-sinh');
    const cpVuong = document.getElementById('compact-th-vuong');
    const cpMo = document.getElementById('compact-th-mo');

    const curDistM = (curCucInfo && curCucInfo.distM) ? (' • ' + curCucInfo.distM + 'm') : '';
    if (cpKhau) cpKhau.textContent = `💧 Khẩu: ${thuyPhap.thuy_khau.son_name} (${thuyKhauDeg.toFixed(0)}°${curDistM})`;
    if (cpSinh) cpSinh.textContent = `🌱 Sinh: ${tsSon}`;
    if (cpVuong) cpVuong.textContent = `👑 Vượng: ${dvSon}`;
    if (cpMo) cpMo.textContent = `⛩️ Mộ: ${mkSon}`;

    const hudKhau = document.getElementById('tamhop-hud-khau');
    const hudSinh = document.getElementById('tamhop-hud-sinh');
    const hudHT = document.getElementById('tamhop-hud-hoangtuyen');
    const hudBS = document.getElementById('tamhop-hud-batsat');
    const hudTC = document.getElementById('tamhop-hud-tamcat');

    if (hudKhau) hudKhau.innerHTML = `<span style="color:#06b6d4;">${thuyPhap.thuy_khau.son_name} (${thuyKhauDeg.toFixed(1)}°)</span> • <strong>${cucName}</strong> (${thuyPhap.the_cuc})`;
    if (hudSinh) hudSinh.innerHTML = `Sinh: <b style="color:#4ade80;">${tsSon}</b> • Vượng: <b style="color:#facc15;">${dvSon}</b> • Quan: <b style="color:#38bdf8;">${lqSon}</b> • Mộ: <b style="color:#c084fc;">${mkSon}</b>`;
    if (hudHT) hudHT.innerHTML = `${hoangTuyen.loai_sat} (${hoangTuyen.pham_sat ? 'Cảnh báo' : 'An toàn'})`;
    const batSatRes = global.TamHopEngine.kiem_tra_bat_sat_cung(thuyPhap.huong_nha.son_name, thuyPhap.thuy_khau.son_name);
    if (hudBS) hudBS.innerHTML = `${batSatRes.danh_gia}`;
    if (hudTC) hudTC.innerHTML = `Quý: <b>${tamCat.duong_quy_nhan}/${tamCat.am_quy_nhan}</b> • Lộc: <b>${tamCat.thien_loc}</b> • Mã: <b>${tamCat.dich_ma}</b>`;
  }

  function toggleTamHopLayer(forceState) {
    if (forceState !== undefined) {
      state.isTamHopActive = forceState;
    } else {
      state.isTamHopActive = !state.isTamHopActive;
    }
    updateTamHopLayer();
    if (state.isTamHopActive) {
      if (typeof showLaKinhToast === 'function') {
        showLaKinhToast('🌊 Đã bật Lớp Phong Thủy Tam Hợp Phái');
      }
    }
  }

function updateQmdjStrategicLayer() {
    const btnQuick = document.getElementById('lakinh-btn-qmdj-strat');
    const svgOverlay = document.getElementById('lakinh-qmdj-svg');
    const svgContent = document.getElementById('lakinh-qmdj-svg-content');
    const hud = document.getElementById('lakinh-qmdj-floating-hud');
    const sheetToggleBtn = document.getElementById('sheet-btn-qmdj-strat-toggle');
    const sheetVal = document.getElementById('sheet-val-qmdj-strat-status');
    const sheetControls = document.getElementById('lakinh-qmdj-sheet-controls');

    if (!state.isQmdjStratActive) {
      if (btnQuick) btnQuick.classList.remove('active');
      if (svgOverlay) svgOverlay.style.display = 'none';
      if (hud) hud.style.display = 'none';
      if (sheetToggleBtn) {
        sheetToggleBtn.classList.remove('success');
        sheetToggleBtn.classList.add('secondary');
        sheetToggleBtn.innerHTML = '⚔️ Bật Lớp Kỳ Môn';
      }
      if (sheetVal) sheetVal.textContent = 'Đang Tắt';
      if (sheetControls) sheetControls.style.display = 'none';
      return;
    }

    if (btnQuick) btnQuick.classList.add('active');
    if (svgOverlay) {
      svgOverlay.style.display = 'block';
      svgOverlay.style.transform = `rotate(${-state.rotation}deg)`;
    }
    if (hud) hud.style.display = 'block';
    if (sheetToggleBtn) {
      sheetToggleBtn.classList.remove('secondary');
      sheetToggleBtn.classList.add('success');
      sheetToggleBtn.innerHTML = '⚔️ Đang Bật Lớp Kỳ Môn (Tắt)';
    }
    if (sheetVal) sheetVal.textContent = 'Đang Bật';
    if (sheetControls) sheetControls.style.display = 'block';

    const targetDate = state.qmdjStratDate || new Date();
    const pad = n => String(n).padStart(2, '0');
    const timeStr = `${pad(targetDate.getHours())}:${pad(targetDate.getMinutes())} - ${pad(targetDate.getDate())}/${pad(targetDate.getMonth() + 1)}`;

    let solarTerm = "Xuân Phân";
    let lunarMonth = targetDate.getMonth() + 1;
    let hourBranch = 'Tý';
    let canChiStr = '';
    if (global.NetaCalendarEngine) {
      if (typeof global.NetaCalendarEngine.getSolarTerm === 'function') {
        solarTerm = global.NetaCalendarEngine.getSolarTerm(targetDate.getDate(), targetDate.getMonth() + 1, targetDate.getFullYear());
      }
      const lInfo = global.NetaCalendarEngine.getFullDayInfo(targetDate);
      if (lInfo && lInfo.lunar && lInfo.lunar.month) lunarMonth = lInfo.lunar.month;
      if (lInfo && lInfo.canChiHour && lInfo.canChiHour.chi) hourBranch = lInfo.canChiHour.chi;
      if (lInfo && lInfo.canChiHour && lInfo.canChiDay) {
        canChiStr = `${lInfo.canChiDay.can}${lInfo.canChiDay.chi} • ${lInfo.canChiHour.can}${lInfo.canChiHour.chi}`;
      }
    }

    if (!global.QMDJCore || !global.JoeyYapQMDJEngine) {
      console.warn("Kỳ Môn Engines chưa nạp xong");
      return;
    }

    let chart = null;
    let analysis = null;
    try {
      chart = new global.QMDJCore.TheArtOfBecomingInvisible(targetDate);
      analysis = global.JoeyYapQMDJEngine.analyzeQMDJCoreChart(chart, {
        solarTerm,
        lunarMonth,
        hourBranch,
        taskGoal: state.qmdjStratGoal || 'deal'
      });
    } catch (e) {
      console.error("Lỗi khi phân tích Kỳ Môn cho La Kinh:", e);
      return;
    }

    if (!analysis) return;

    // Chiết xuất các thông số chiến thuật
    const chiefPid = (analysis.three_victories && analysis.three_victories.first_victory && analysis.three_victories.first_victory.palace_id) || 1;
    const shPid = (analysis.sky_horse && analysis.sky_horse.palace_id) || 4;
    const shBranch = (analysis.sky_horse && analysis.sky_horse.sky_horse_branch) || 'Thìn';
    const shDeg = (analysis.sky_horse && analysis.sky_horse.degree !== undefined) ? analysis.sky_horse.degree : PALACE_DEG[shPid];

    const audiencePids = [];
    Object.keys(analysis.palaces || {}).forEach(pid => {
      const p = analysis.palaces[pid];
      if (p.door === 'Tử' || p.door === 'Kinh' || p.men === 'Tử Môn' || p.men === 'Kinh Môn') {
        audiencePids.push(parseInt(pid));
      }
    });
    if (audiencePids.length === 0) audiencePids.push(1, 8);

    const nonStrikePids = (analysis.five_restrictions && analysis.five_restrictions.restricted_sectors)
      ? analysis.five_restrictions.restricted_sectors.map(s => s.palace_id)
      : [chiefPid];

    // Render SVG Vectors & Sectors
    if (svgContent) {
      let svgHtml = '';

      // 1. Vùng Bất Kích (Non-Striking Arc - Phủ vành ngoài mỏng màu đỏ)
      nonStrikePids.forEach(pNum => {
        const deg = PALACE_DEG[pNum];
        if (deg !== undefined) {
          const pathD = getAnnularSectorPath(deg, 425, 475, 45);
          svgHtml += `<path d="${pathD}" fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="4,4" />`;
          const dirStr = PALACE_DIRECTIONS[pNum] || `${deg}°`;
          svgHtml += createSvgStrategicBadge({
            deg,
            radius: 450,
            width: 175,
            height: 38,
            bgColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: '#ef4444',
            icon: '🚫',
            title: 'BẤT KÍCH (TRÁNH)',
            subtitle: `${PALACE_NAMES[pNum]} • ${dirStr}`,
            hint: 'Cấm ngồi hoặc tấn công',
            hintColor: '#fca5a5'
          });
        }
      });

      // 2. Bố Trí Đối Tác (Audience Placement - Màu tím)
      audiencePids.forEach(pNum => {
        const deg = PALACE_DEG[pNum];
        if (deg !== undefined) {
          const pathD = getAnnularSectorPath(deg, 220, 415, 45);
          svgHtml += `<path d="${pathD}" fill="rgba(168, 85, 247, 0.28)" stroke="#a855f7" stroke-width="2.5" stroke-dasharray="5,4" />`;
          const dirStr = PALACE_DIRECTIONS[pNum] || `${deg}°`;
          svgHtml += createSvgStrategicBadge({
            deg,
            radius: 325,
            width: 215,
            height: 58,
            bgColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: '#a855f7',
            icon: '🎯',
            title: 'ÉP ĐỐI TÁC',
            subtitle: `${PALACE_NAMES[pNum]} • ${dirStr}`,
            hint: 'Xếp đối thủ ngồi ở hướng này',
            hintColor: '#e9d5ff'
          });
        }
      });

      // 3. Tọa Lưng Đắc Thắng (Presenter Back-Facing - Màu xanh lục phát quang)
      if (chiefPid && PALACE_DEG[chiefPid] !== undefined) {
        const deg = PALACE_DEG[chiefPid];
        const pathD = getAnnularSectorPath(deg, 200, 420, 45);
        svgHtml += `<path d="${pathD}" fill="rgba(34, 197, 94, 0.32)" stroke="#22c55e" stroke-width="3.5" stroke-dasharray="6,3" />`;
        const arrow = getRadialVector(deg, 220, 395);
        svgHtml += `<line x1="${arrow.x1}" y1="${arrow.y1}" x2="${arrow.x2}" y2="${arrow.y2}" stroke="#22c55e" stroke-width="4.5" marker-end="url(#qmdj-arrow-green)" filter="url(#qmdj-glow-green)" />`;
        const dirStr = PALACE_DIRECTIONS[chiefPid] || `${deg}°`;
        svgHtml += createSvgStrategicBadge({
          deg,
          radius: 310,
          width: 225,
          height: 60,
          bgColor: 'rgba(15, 23, 42, 0.96)',
          borderColor: '#22c55e',
          icon: '🟢',
          title: 'TỌA LƯNG (ĐẮC THẮNG)',
          subtitle: `${PALACE_NAMES[chiefPid]} • ${dirStr}`,
          hint: 'Bạn ngồi quay lưng vào đây',
          hintColor: '#a7f3d0'
        });
      }

      // 4. Nếu Mục Tiêu Cầu Tài: Đánh dấu Cung Thu Tài (Sinh Môn)
      if (state.qmdjStratGoal === 'wealth') {
        Object.keys(analysis.palaces || {}).forEach(k => {
          const p = analysis.palaces[k];
          if (p.men === 'Sinh Môn' || (p.raw && p.raw.men === '生门') || p.door === 'Sinh') {
            const deg = PALACE_DEG[k];
            if (deg !== undefined && parseInt(k) !== chiefPid) {
              const pathD = getAnnularSectorPath(deg, 260, 415, 45);
              svgHtml += `<path d="${pathD}" fill="rgba(245, 158, 11, 0.28)" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="4,4" />`;
              const dirStr = PALACE_DIRECTIONS[k] || `${deg}°`;
              svgHtml += createSvgStrategicBadge({
                deg,
                radius: 340,
                width: 215,
                height: 58,
                bgColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: '#f59e0b',
                icon: '💰',
                title: 'THU TÀI (SINH MÔN)',
                subtitle: `${PALACE_NAMES[k]} • ${dirStr}`,
                hint: 'Đón khách VIP, chốt hợp đồng',
                hintColor: '#fef08a'
              });
            }
          }
        });
      }

      // 5. Thái Trùng Thiên Mã (Sky Horse Escape - Tia Laser Hoàng Kim)
      if (shDeg !== undefined) {
        const arrow = getRadialVector(shDeg, 190, 455);
        svgHtml += `<line x1="${arrow.x1}" y1="${arrow.y1}" x2="${arrow.x2}" y2="${arrow.y2}" stroke="#eab308" stroke-width="4" stroke-dasharray="8,4" filter="url(#qmdj-glow-gold)" marker-end="url(#qmdj-arrow-gold)" />`;
        const pt = getRadialVector(shDeg, 445, 445);
        svgHtml += `<circle cx="${pt.x1}" cy="${pt.y1}" r="12" fill="#eab308" stroke="#ffffff" stroke-width="2" />`;
        svgHtml += createSvgStrategicBadge({
          deg: shDeg,
          radius: 390,
          width: 205,
          height: 56,
          bgColor: 'rgba(15, 23, 42, 0.95)',
          borderColor: '#eab308',
          icon: '🐎',
          title: 'THIÊN MÃ (PHÁ VÂY)',
          subtitle: `Chi ${shBranch} • ${shDeg.toFixed(1)}°`,
          hint: 'Hướng xuất hành / rút lui',
          hintColor: '#fef08a'
        });
      }

      svgContent.innerHTML = svgHtml;
    }

    // Cập nhật Floating HUD
    const hudTime = document.getElementById('qmdj-hud-time');
    const btnResetNow = document.getElementById('btn-qmdj-reset-now');
    const sheetValTime = document.getElementById('sheet-val-qmdj-time');
    const hudBack = document.getElementById('qmdj-hud-back');
    const hudAud = document.getElementById('qmdj-hud-audience');
    const hudHorse = document.getElementById('qmdj-hud-horse');
    const hudNonstrike = document.getElementById('qmdj-hud-nonstrike');
    const hudWealthItem = document.getElementById('qmdj-hud-item-wealth');
    const hudWealth = document.getElementById('qmdj-hud-wealth');

    const compactBack = document.getElementById('compact-hud-back');
    const compactAud = document.getElementById('compact-hud-aud');
    const compactHorse = document.getElementById('compact-hud-horse');

    const isCustomTime = !!state.qmdjStratDate;
    if (btnResetNow) btnResetNow.style.display = isCustomTime ? 'inline-flex' : 'none';

    const fullTimeStr = canChiStr ? `${timeStr} (${canChiStr})` : timeStr;
    const displayTimeStr = isCustomTime ? `${fullTimeStr} ⏰ Kế Hoạch` : fullTimeStr;
    if (hudTime) hudTime.textContent = displayTimeStr;
    if (sheetValTime) sheetValTime.textContent = displayTimeStr;

    document.querySelectorAll('.qmdj-hud-pill-btn, .sheet-qmdj-goal-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-goal') === state.qmdjStratGoal);
    });

    const bName = PALACE_NAMES[chiefPid] || `Cung ${chiefPid}`;
    const bDir = PALACE_DIRECTIONS[chiefPid] || '';
    if (hudBack) {
      hudBack.innerHTML = `<span class="hud-sector">${bName} (${bDir})</span> <span class="hud-note">(Đón Trực Phù trợ lực, át vía đối phương)</span>`;
    }
    if (compactBack) {
      compactBack.textContent = `🟢 Tọa: ${bName.split(' ')[0]}`;
    }

    const aNames = audiencePids.map(p => `${PALACE_NAMES[p]} (${PALACE_DIRECTIONS[p] || ''})`).join(', ');
    if (hudAud) {
      hudAud.innerHTML = `<span class="hud-sector">${aNames}</span> <span class="hud-note">(Phạm Tử/Kinh Môn, làm đối phương phân tâm)</span>`;
    }
    if (compactAud) {
      compactAud.textContent = `🎯 Ép: ${audiencePids.map(p => (PALACE_NAMES[p] || '').split(' ')[0]).join(',')}`;
    }

    const hName = PALACE_NAMES[shPid] || `Cung ${shPid}`;
    if (hudHorse) {
      hudHorse.innerHTML = `<span class="hud-sector">${hName} (Chi ${shBranch} • ${shDeg.toFixed(1)}°)</span> <span class="hud-note">(Xuất hành phá vây, giải thoát bế tắc)</span>`;
    }
    if (compactHorse) {
      compactHorse.textContent = `🐎 Mã: ${shBranch}`;
    }

    const nsNames = nonStrikePids.map(p => `${PALACE_NAMES[p]} (${PALACE_DIRECTIONS[p] || ''})`).join(', ');
    if (hudNonstrike) {
      hudNonstrike.innerHTML = `<span class="hud-sector">${nsNames}</span> <span class="hud-note">(Kỵ đối đầu, cấm ngồi xuất phát)</span>`;
    }

    if (hudWealthItem) {
      hudWealthItem.style.display = (state.qmdjStratGoal === 'wealth') ? 'flex' : 'none';
      if (hudWealth) {
        let wealthPids = [];
        Object.keys(analysis.palaces || {}).forEach(k => {
          const p = analysis.palaces[k];
          if (p.men === 'Sinh Môn' || (p.raw && p.raw.men === '生门') || p.door === 'Sinh') {
            if (parseInt(k) !== chiefPid) wealthPids.push(k);
          }
        });
        const wStr = wealthPids.map(p => `${PALACE_NAMES[p]} (${PALACE_DIRECTIONS[p] || ''})`).join(', ') || '---';
        hudWealth.innerHTML = `<span class="hud-sector">${wStr}</span> <span class="hud-note">(Đón tài khí, ký kết hợp đồng, mở hàng)</span>`;
      }
    }
  }

  // ================= 4. ĐỊNH VỊ GPS VỆ TINH 2 TẦNG (HIGH ACCURACY + FALLBACK) =================
  // Callback toàn cục nhận tọa độ từ Native App (Flutter Android)
  window._onNativeLocationReceived = function(lat, lng, accuracy) {
    const btn = document.getElementById('lakinh-dock-gps');
    const fab = document.getElementById('lakinh-btn-my-location');
    if (btn) btn.classList.remove('pulse-radar-active');
    if (fab) fab.classList.remove('pulse-radar-active');

    state.userLocation = [lat, lng];
    state.centerCoords = [lat, lng];

    if (mapInstance && userLocationLayerGroup) {
      userLocationLayerGroup.clearLayers();

      // Vòng tròn bán kính sai số GPS
      L.circle([lat, lng], {
        radius: Math.max(accuracy || 10, 12),
        color: '#38bdf8',
        fillColor: '#38bdf8',
        fillOpacity: 0.15,
        weight: 1.5,
        dashArray: '4, 4'
      }).addTo(userLocationLayerGroup);

      // Radar Beacon Marker nhấp nháy xanh tại vị trí thực
      L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'gps-live-dot',
          html: `<div class="gps-pulse-beacon"></div><div class="gps-inner-dot"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }).addTo(userLocationLayerGroup);

      mapInstance.setView([lat, lng], 19, { animate: true });
      showLaKinhToast(`🎯 Đã định vị chính xác qua GPS máy! (Sai số ~${Math.round(accuracy || 10)}m)`);
      updateLocationHUD(lat, lng);
    }
  };

  // Callback báo lỗi từ Native App
  window._onNativeLocationError = function(errMsg) {
    const btn = document.getElementById('lakinh-dock-gps');
    const fab = document.getElementById('lakinh-btn-my-location');
    if (btn) btn.classList.remove('pulse-radar-active');
    if (fab) fab.classList.remove('pulse-radar-active');

    console.warn('Native GPS Error:', errMsg);
    const isPermission = errMsg && (errMsg.includes('PERMISSION') || errMsg.includes('từ chối') || errMsg.includes('denied'));
    const isGpsOff = errMsg && (errMsg.includes('GPS_DISABLED') || errMsg.includes('bị tắt'));

    if (isGpsOff) {
      showLaKinhToast('⚠️ GPS của điện thoại đang bị tắt. Hãy bật Định vị (Vị trí)!');
      promptSearchLocation(false, true);
    } else if (isPermission) {
      showLaKinhToast('🚫 Quyền vị trí chưa được cấp cho ứng dụng');
      promptSearchLocation(true, false);
    } else {
      showLaKinhToast('⏳ Không bắt được tín hiệu vệ tinh GPS. Vui lòng thử lại hoặc kéo bản đồ.');
      promptSearchLocation(false, false);
    }
  };

  function getCurrentGPS(silent = false) {
    const btn = document.getElementById('lakinh-dock-gps');
    const fab = document.getElementById('lakinh-btn-my-location');
    if (btn) btn.classList.add('pulse-radar-active');
    if (fab) fab.classList.add('pulse-radar-active');

    // NẾU CHẠY TRONG APP FLUTTER ANDROID: Gọi cầu nối Native Bridge để truy cập GPS phần cứng máy
    if (typeof window !== 'undefined' && window.NativeBridge) {
      if (!silent) showLaKinhToast('🛰️ Đang lấy tọa độ GPS từ cảm biến máy...');
      try {
        window.NativeBridge.postMessage(JSON.stringify({ action: 'getLocation' }));
        return;
      } catch (err) {
        console.warn('NativeBridge getLocation error:', err);
      }
    }

    if (!navigator.geolocation) {
      if (btn) btn.classList.remove('pulse-radar-active');
      if (fab) fab.classList.remove('pulse-radar-active');
      if (!silent) showLaKinhToast('⚠️ Thiết bị của bạn không hỗ trợ định vị Geolocation');
      return;
    }

    // Nếu đã có tọa độ GPS đã lưu trước đó, bay về ngay lập tức để người dùng không phải chờ
    if (state.userLocation && mapInstance && !silent) {
      mapInstance.flyTo(state.userLocation, 19, { animate: true });
      showLaKinhToast('🎯 Đang bay về vị trí GPS hiện tại của bạn...');
    } else if (!silent) {
      showLaKinhToast('🛰️ Đang tìm kiếm tọa độ GPS vệ tinh...');
    }

    const onGpsSuccess = (pos) => {
      if (btn) btn.classList.remove('pulse-radar-active');
      if (fab) fab.classList.remove('pulse-radar-active');
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const accuracy = Math.round(pos.coords.accuracy || 0);

      state.userLocation = [lat, lng];
      state.centerCoords = [lat, lng];

      if (mapInstance && userLocationLayerGroup) {
        userLocationLayerGroup.clearLayers();

        // Vòng tròn bán kính sai số GPS
        L.circle([lat, lng], {
          radius: Math.max(accuracy, 12),
          color: '#38bdf8',
          fillColor: '#38bdf8',
          fillOpacity: 0.15,
          weight: 1.5,
          dashArray: '4, 4'
        }).addTo(userLocationLayerGroup);

        // Radar Beacon Marker nhấp nháy xanh tại vị trí thực
        L.marker([lat, lng], {
          icon: L.divIcon({
            className: 'gps-live-dot',
            html: `<div class="gps-pulse-beacon"></div><div class="gps-inner-dot"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })
        }).addTo(userLocationLayerGroup);

        // Đưa tâm bản đồ về vị trí người dùng
        mapInstance.setView([lat, lng], 19, { animate: true });
        if (!silent) {
          showLaKinhToast(`🎯 Đã định vị vị trí hiện tại! (Sai số ~${accuracy}m)`);
        }
        updateLocationHUD(lat, lng);
      }
    };

    const onGpsFailHighAccuracy = (err) => {
      console.warn('GPS phần cứng không phản hồi, kiểm tra fallback...', err);
      if (err.code === 1) {
        if (btn) btn.classList.remove('pulse-radar-active');
        if (fab) fab.classList.remove('pulse-radar-active');
        if (!silent) {
          showLaKinhToast('🚫 Quyền vị trí GPS đang bị chặn');
          promptSearchLocation(true);
        }
        return;
      }

      // Tầng 2: Fallback định vị mạng / trạm BTS / Wifi
      if (!silent) showLaKinhToast('🛰️ Đang chuyển sang định vị mạng Wifi/4G...');
      navigator.geolocation.getCurrentPosition(
        onGpsSuccess,
        (err2) => {
          if (btn) btn.classList.remove('pulse-radar-active');
          if (fab) fab.classList.remove('pulse-radar-active');
          if (err2.code === 1) {
            if (!silent) {
              showLaKinhToast('🚫 Quyền vị trí GPS đang bị chặn');
              promptSearchLocation(true);
            }
            return;
          }
          if (!silent) {
            let errMsg = 'Không lấy được tọa độ';
            if (err2.code === 2) errMsg = '⚠️ Vị trí không khả dụng (Hãy bật GPS điện thoại)';
            else if (err2.code === 3) errMsg = '⏳ Hết thời gian chờ tín hiệu GPS';
            showLaKinhToast(errMsg);
            promptSearchLocation(false);
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 300000 // Chấp nhận cache vị trí 5 phút
        }
      );
    };

    // Tầng 1: Thử GPS vệ tinh độ chính xác cao
    navigator.geolocation.getCurrentPosition(
      onGpsSuccess,
      onGpsFailHighAccuracy,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  // Chuyển đổi lớp bản đồ
  function switchMapLayer() {
    if (!mapInstance) return;
    const btn = document.getElementById('lakinh-btn-layer');

    if (currentLayer === layers.googleSat) {
      mapInstance.removeLayer(layers.googleSat);
      currentLayer = layers.esriSat;
      currentLayer.addTo(mapInstance);
      if (btn) {
        btn.innerHTML = '🌍';
        btn.title = 'Lớp bản đồ: Vệ Tinh Esri (Chạm để đổi)';
      }
      showLaKinhToast('Chuyển sang: Ảnh Vệ Tinh Esri');
    } else if (currentLayer === layers.esriSat) {
      mapInstance.removeLayer(layers.esriSat);
      currentLayer = layers.osm;
      currentLayer.addTo(mapInstance);
      if (btn) {
        btn.innerHTML = '🗺️';
        btn.title = 'Lớp bản đồ: Đường Phố OSM (Chạm để đổi)';
      }
      showLaKinhToast('Chuyển sang: Bản Đồ Đường Phố');
    } else {
      mapInstance.removeLayer(layers.osm);
      currentLayer = layers.googleSat;
      currentLayer.addTo(mapInstance);
      if (btn) {
        btn.innerHTML = '🛰️';
        btn.title = 'Lớp bản đồ: Vệ Tinh Google (Chạm để đổi)';
      }
      showLaKinhToast('Chuyển sang: Vệ Tinh Google Earth');
    }
  }

  // Quét Cao Độ & Minh Đường Cục
  async function scanElevationAndTiers() {
    if (!mapInstance || !global.NetaLaKinhEngine) return;
    const center = mapInstance.getCenter();

    closeBottomSheet();
    showLaKinhToast('⏳ Đang quét cao độ số DEM 3 cấp cự ly...');
    elevationLayerGroup.clearLayers();

    try {
      const result = await global.NetaLaKinhEngine.analyzeMinhDuongCuc(center.lat, center.lng);
      state.centerElevation = result.center.elevation;
      state.lastDemScanResult = result;

      // Liên thông dữ liệu Thủy Khẩu DEM (Google Earth) sang Phân hệ Tam Hợp Phái
      if (result.tiers) {
        if (result.tiers.tieu && result.tiers.tieu.thuyKhau) {
          state.tamHopCucData.tieu_cuc.deg = result.tiers.tieu.thuyKhau.analysis.bearing;
          state.tamHopCucData.tieu_cuc.son = result.tiers.tieu.thuyKhau.analysis.son;
          state.tamHopCucData.tieu_cuc.distM = result.tiers.tieu.thuyKhau.distanceM;
        }
        if (result.tiers.trung && result.tiers.trung.thuyKhau) {
          state.tamHopCucData.trung_cuc.deg = result.tiers.trung.thuyKhau.analysis.bearing;
          state.tamHopCucData.trung_cuc.son = result.tiers.trung.thuyKhau.analysis.son;
          state.tamHopCucData.trung_cuc.distM = result.tiers.trung.thuyKhau.distanceM;
        }
        if (result.tiers.dai && result.tiers.dai.thuyKhau) {
          state.tamHopCucData.dai_cuc.deg = result.tiers.dai.thuyKhau.analysis.bearing;
          state.tamHopCucData.dai_cuc.son = result.tiers.dai.thuyKhau.analysis.son;
          state.tamHopCucData.dai_cuc.distM = result.tiers.dai.thuyKhau.distanceM;
        }
        const activeTierKey = state.tamHopDuongCuc === 'dai_cuc' ? 'dai_cuc' : (state.tamHopDuongCuc === 'trung_cuc' ? 'trung_cuc' : 'tieu_cuc');
        state.tamHopThuyKhauDeg = state.tamHopCucData[activeTierKey].deg;
        if (state.isTamHopActive) {
          updateTamHopLayer();
        }
        showLaKinhToast(`🛰️ Đã quét xong DEM Google Earth: Thủy Khẩu ${state.tamHopCucData[activeTierKey].son} (${state.tamHopThuyKhauDeg.toFixed(1)}° • ${state.tamHopCucData[activeTierKey].distM}m)`);
      }

      const elevEl = document.getElementById('hud-detail-elev');
      if (elevEl) elevEl.innerHTML = `⛰️ Cao độ: ${result.center.elevation.toFixed(1)} m`;

      // Vẽ 3 vòng tròn bán kính trên bản đồ
      Object.values(result.tiers).forEach(t => {
        L.circle([center.lat, center.lng], {
          radius: t.radiusM,
          color: t.color,
          weight: 1.5,
          fillOpacity: 0.05,
          dashArray: '5, 5'
        }).addTo(elevationLayerGroup);

        // Đánh dấu Thủy Khẩu điểm trũng nhất (Thiên Bàn Phùng Châm) - Không nền che khuất thông tin bản đồ
        const a = t.thuyKhau.analysis;
        L.marker([t.thuyKhau.lat, t.thuyKhau.lng], {
          icon: L.divIcon({
            className: 'custom-watermouth-pin',
            html: `<div class="watermouth-pin-wrap" style="display:inline-flex;align-items:center;background:none;border:none;">
              <svg width="24" height="32" viewBox="0 0 28 36" fill="none" style="filter: drop-shadow(0 2px 5px rgba(0,0,0,0.85));">
                <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22c0-7.732-6.268-14-14-14z" fill="#0284c7" stroke="#ffffff" stroke-width="2"/>
                <path d="M14 8C14 8 10 13 10 15.5C10 17.7 11.8 19.5 14 19.5C16.2 19.5 18 17.7 18 15.5C18 13 14 8 14 8Z" fill="#ffffff"/>
              </svg>
              <span style="color:#38bdf8;font-size:11px;font-weight:800;white-space:nowrap;margin-left:3px;background:none;text-shadow:-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 1px 4px #000;">💧 ${t.name.split(' ')[0]} (${a.son} • ${t.thuyKhau.distanceM}m)</span>
            </div>`,
            iconSize: [85, 32],
            iconAnchor: [12, 32],
            popupAnchor: [0, -32]
          })
        }).bindPopup(`<div style="font-weight:700;font-size:12px;color:#0f172a;padding:4px 6px;">💧 Thủy Khẩu ${t.name} (${a.son} • ${a.songSon})<br>Cự ly điểm thấp nhất: <strong>${t.thuyKhau.distanceM}m</strong> (trong dải ${t.rangeLabel || ''})<br>Tam Hợp: ${a.cuc}<br>Cao độ: ${t.thuyKhau.elevation.toFixed(1)}m</div>`).addTo(elevationLayerGroup);
      });

      openMinhDuongModal(result);
    } catch (err) {
      console.error(err);
      showLaKinhToast('❌ Lỗi khi quét cao độ DEM');
    }
  }

  // Mở Modal Phân Tích Minh Đường Cục
  function openMinhDuongModal(data) {
    const modalBox = document.getElementById('lakinh-modal-container');
    if (!modalBox) return;

    let tiersHtml = '';
    for (const [key, t] of Object.entries(data.tiers)) {
      const tk = t.thuyKhau;
      const ll = t.laiLong;
      const a = tk.analysis;

      tiersHtml += `
        <div style="background: rgba(30,41,59,0.7); border: 1px solid ${t.color}; border-radius: 10px; padding: 10px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-weight: 700; font-size: 0.82rem; color: ${t.color};">
              ${t.name} (Bán kính ${t.radiusM}m)
            </div>
            <div style="font-size: 0.72rem; font-weight: 700; color: #38bdf8; background: rgba(56,189,248,0.15); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(56,189,248,0.3);">
              ${a.cuc}
            </div>
          </div>
          <div style="font-size: 0.73rem; line-height: 1.6; color: #e2e8f0;">
            • <strong>Thủy Khẩu điểm thấp nhất:</strong> Sơn <span style="color:#f5b041; font-weight:700;">${a.son}</span> (${a.bearing}°) • <strong>Cự ly thực tế:</strong> <span style="color:#38bdf8; font-weight:700;">${tk.distanceM}m</span> (trong dải ${t.rangeLabel || ''})<br>
            • <strong>Song Sơn Thiên Bàn:</strong> <span style="color:#f5b041; font-weight:700;">${a.songSon}</span><br>
            • <strong>Tam Hợp Thủy Pháp:</strong> <span style="color: #38bdf8; font-weight: 700;">${a.cuc}</span> (${a.tamHop})<br>
            • <strong>Tam Hợp Trường Sinh:</strong> ${a.sinhVuongMo}<br>
            • <strong>Cung vị Thủy Khẩu:</strong> <span style="color: #4ade80; font-weight: 700;">${a.viTriTruongSinh}</span><br>
            • <strong>Đánh giá Cát Hung:</strong> ${a.danhGia}<br>
            • <strong>Cao độ Thủy Khẩu:</strong> ${tk.elevation.toFixed(1)}m (Chênh ${tk.deltaElev >= 0 ? '+' : ''}${tk.deltaElev.toFixed(1)}m so với tâm)<br>
            • <strong>Lai Long (Địa Bàn Chính Châm):</strong> Sơn ${ll.son} (${ll.bearing.toFixed(1)}°) • Cao độ: ${ll.elevation.toFixed(1)}m (Chênh +${ll.deltaElev.toFixed(1)}m)<br>
            <div style="margin-top: 6px;">
              <a href="${a.googleMapsUrl}" target="_blank" style="color: #38bdf8; text-decoration: underline; font-size: 0.72rem;">📍 Mở vị trí Thủy Khẩu trên Google Maps</a>
            </div>
          </div>
        </div>
      `;
    }

    modalBox.innerHTML = `
      <div class="lakinh-modal-overlay" id="modal-minhduong-overlay">
        <div class="lakinh-glass-panel lakinh-modal-dialog">
          <div class="lakinh-modal-header">
            <div class="lakinh-modal-title">🌊 KHẢO SÁT MINH ĐƯỜNG CỤC (THIÊN BÀN PHÙNG CHÂM)</div>
            <button class="lakinh-modal-close" onclick="document.getElementById('modal-minhduong-overlay').remove()">✕</button>
          </div>
          <div style="font-size: 0.72rem; color: #94a3b8; margin-bottom: 10px;">
            Tọa độ tâm trạch: ${data.center.lat.toFixed(6)}, ${data.center.lng.toFixed(6)} • Cao độ gốc: ${data.center.elevation.toFixed(1)}m
          </div>
          ${tiersHtml}
          <button class="lakinh-action-btn" onclick="document.getElementById('modal-minhduong-overlay').remove()">Đóng</button>
        </div>
      </div>
    `;
  }

  // Mở Modal Huyền Không Phi Tinh Chính Tông (Chuẩn 16 Tinh Bàn - Vận 9)
  function openHuyenKhongModal(selectedPeriod = 9, explicitDeg = null, useGeoGrid = false) {
    const modalBox = document.getElementById('lakinh-modal-container');
    if (!modalBox || !global.NetaLaKinhEngine) return;

    closeBottomSheet();
    const period = parseInt(selectedPeriod, 10) || 9;
    const currentDeg = explicitDeg !== null ? parseFloat(explicitDeg) : state.rotation;
    const hk = global.NetaLaKinhEngine.generateHuyenKhongMatrix(currentDeg, period);
    const activeGrid = useGeoGrid ? hk.geoGrid : hk.orientedGrid;

    let cellsHtml = '';
    activeGrid.forEach(cell => {
      let roleTag = '';
      if (cell.isToa) roleTag = '<span class="lakinh-tag-toa">TỌA</span>';
      else if (cell.isFacing) roleTag = '<span class="lakinh-tag-facing">HƯỚNG</span>';

      const isPrime = cell.mountainStar === period || cell.facingStar === period;
      cellsHtml += `
        <div class="lakinh-palace-cell ${cell.isCenter ? 'center' : ''} ${isPrime ? 'prime-star' : ''}">
          <div class="lakinh-palace-name">${cell.name} ${roleTag}</div>
          <div class="lakinh-star-period-top" title="Vận Tinh">${cell.vanStar}</div>
          <div class="lakinh-palace-stars-bottom">
            <span class="lakinh-star-mountain" title="Sơn Tinh (Tọa Tinh) - Bay ${hk.mountainFlyDir > 0 ? 'Thuận +' : 'Nghịch -'}">${cell.mountainStar}</span>
            <span class="lakinh-star-facing" title="Hướng Tinh - Bay ${hk.facingFlyDir > 0 ? 'Thuận +' : 'Nghịch -'}">${cell.facingStar}</span>
          </div>
        </div>
      `;
    });

    const badgeClass = hk.patternCode === 'vuong_son_vuong_huong' ? 'badge-gold' :
                      (hk.patternCode === 'song_tinh_dao_huong' ? 'badge-emerald' :
                      (hk.patternCode === 'song_tinh_dao_toa' ? 'badge-blue' :
                      (hk.patternCode === 'thuong_son_ha_thuy' ? 'badge-red' : 'badge-slate')));

    const tinhBanList = global.NetaLaKinhEngine.TINH_BAN_16_LIST || [];

    modalBox.innerHTML = `
      <div class="lakinh-modal-overlay" id="modal-hk-overlay">
        <div class="lakinh-glass-panel lakinh-modal-dialog">
          <div class="lakinh-modal-header">
            <div class="lakinh-modal-title">☯️ HUYỀN KHÔNG PHI TINH VẬN ${period}</div>
            <button class="lakinh-modal-close" onclick="document.getElementById('modal-hk-overlay').remove()">✕</button>
          </div>

          <!-- Bảng Chọn Nhanh 16 Tinh Bàn & Vận -->
          <div class="lakinh-hk-header-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; gap: 6px;">
              <select id="hk-chart-select" class="lakinh-chart-select" style="flex: 1;">
                ${tinhBanList.map(item => `
                  <option value="${item.deg}" ${item.id === hk.tinhBanItem.id ? 'selected' : ''}>
                    ${item.name}
                  </option>
                `).join('')}
              </select>
              <select id="hk-period-select" class="lakinh-period-select">
                <option value="9" ${period === 9 ? 'selected' : ''}>Vận 9 (2024–2043)</option>
                <option value="8" ${period === 8 ? 'selected' : ''}>Vận 8 (2004–2023)</option>
                <option value="7" ${period === 7 ? 'selected' : ''}>Vận 7 (1984–2003)</option>
                <option value="6" ${period === 6 ? 'selected' : ''}>Vận 6 (1964–1983)</option>
                <option value="5" ${period === 5 ? 'selected' : ''}>Vận 5 (1944–1963)</option>
                <option value="4" ${period === 4 ? 'selected' : ''}>Vận 4 (1924–1943)</option>
                <option value="3" ${period === 3 ? 'selected' : ''}>Vận 3 (1904–1923)</option>
                <option value="2" ${period === 2 ? 'selected' : ''}>Vận 2 (1884–1903)</option>
                <option value="1" ${period === 1 ? 'selected' : ''}>Vận 1 (1864–1883)</option>
              </select>
            </div>

            <!-- Tọa Hướng & Độ Số -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span class="lakinh-hk-title-sub">
                ${hk.tinhBanItem.name} • Tọa ${hk.sonToa.name} Hướng ${hk.sonFacing.name} (${hk.facingDeg.toFixed(1)}°)
              </span>
              <button id="hk-toggle-grid-mode" class="lakinh-grid-toggle-btn" title="Chuyển đổi góc nhìn đồ hình">
                ${useGeoGrid ? '🗺️ Địa Bàn' : '🧭 Hướng Trên'}
              </button>
            </div>

            <!-- Chi tiết Tam Nguyên Long & Chiều Phi Tinh -->
            <div class="lakinh-hk-details">
              <div>• <strong>Tọa Sơn:</strong> Sơn ${hk.sonToa.name} (${hk.sonToa.cung} - Sơn ${hk.sonToa.long}: ${hk.sonToa.long_name} Nguyên Long - ${hk.sonToa.am_duong}) ➔ Sơn Tinh <strong>${hk.mountainCenterStar}</strong> (${hk.mountainFlyDir > 0 ? 'Bay Thuận +' : 'Bay Nghịch -'})</div>
              <div>• <strong>Hướng Sơn:</strong> Sơn ${hk.sonFacing.name} (${hk.sonFacing.cung} - Sơn ${hk.sonFacing.long}: ${hk.sonFacing.long_name} Nguyên Long - ${hk.sonFacing.am_duong}) ➔ Hướng Tinh <strong>${hk.facingCenterStar}</strong> (${hk.facingFlyDir > 0 ? 'Bay Thuận +' : 'Bay Nghịch -'})</div>
            </div>

            <!-- Cách Cục -->
            <div style="margin-top: 6px; display: flex; align-items: center; gap: 6px;">
              <span class="lakinh-hk-badge ${badgeClass}">${hk.patternName}</span>
            </div>
            <div class="lakinh-hk-desc">
              ${hk.patternDesc}
            </div>
          </div>

          <!-- Lưới Cửu Cung Chuẩn Bảng Tra (Hàng trên là HƯỚNG, hàng dưới là TỌA) -->
          <div class="lakinh-nine-grid">
            ${cellsHtml}
          </div>

          <div class="lakinh-hk-footnote">
            * <strong>Quy chuẩn Bảng Tra:</strong> Số lớn màu đỏ ở trên là <strong>Vận Tinh</strong>; Số dưới bên trái (xanh lam) là <strong>Sơn Tinh (Tọa Tinh)</strong>; Số dưới bên phải (đỏ) là <strong>Hướng Tinh</strong>. Ô viền sáng là vị trí sao Đương Lệnh (sao ${period}) đáo tới.
          </div>
          <button class="lakinh-action-btn" onclick="document.getElementById('modal-hk-overlay').remove()">Đóng</button>
        </div>
      </div>
    `;

    // Lắng nghe sự kiện chuyển đổi Tinh Bàn (1-16)
    const selectChart = document.getElementById('hk-chart-select');
    if (selectChart) {
      selectChart.addEventListener('change', (e) => {
        const deg = parseFloat(e.target.value);
        if (typeof updateRotationDisplay === 'function') {
          updateRotationDisplay(deg);
        }
        openHuyenKhongModal(period, deg, useGeoGrid);
      });
    }

    // Lắng nghe sự kiện chuyển đổi Vận
    const selectPeriod = document.getElementById('hk-period-select');
    if (selectPeriod) {
      selectPeriod.addEventListener('change', (e) => {
        openHuyenKhongModal(e.target.value, currentDeg, useGeoGrid);
      });
    }

    // Lắng nghe sự kiện toggle đổi chế độ hiển thị lưới
    const btnToggleGrid = document.getElementById('hk-toggle-grid-mode');
    if (btnToggleGrid) {
      btnToggleGrid.addEventListener('click', () => {
        openHuyenKhongModal(period, currentDeg, !useGeoGrid);
      });
    }
  }

  // Mở Modal Huyền Không Đại Quái (64 Quẻ & 384 Hào Vi Phân)
  function openHKDQModal(targetDeg) {
    const modalBox = document.getElementById('lakinh-modal-container');
    if (!modalBox || !global.NetaLaKinhEngine || !global.NetaLaKinhEngine.getHKDQInfo) return;

    closeBottomSheet();
    const isRayMode = (typeof targetDeg === 'number');
    const queryDeg = isRayMode ? targetDeg : state.rotation;
    const hkdq = global.NetaLaKinhEngine.getHKDQInfo(queryDeg);
    if (!hkdq) {
      showLaKinhToast('⚠️ Chưa nạp được CSDL Huyền Không Đại Quái');
      return;
    }

    const hVp = hkdq.hao_vi_phan;
    const curHIdx = hVp ? hVp.hao_index : 1;
    const tkv = hkdq.canh_bao_khong_vong;

    // Bát Quái vạch hào chuẩn (Hào 1 -> 3)
    const TRIGRAM_LINES = {
      'Càn': [1, 1, 1],
      'Đoài': [1, 1, 0],
      'Ly': [1, 0, 1],
      'Chấn': [1, 0, 0],
      'Tốn': [0, 1, 1],
      'Khảm': [0, 1, 0],
      'Cấn': [0, 0, 1],
      'Khôn': [0, 0, 0]
    };

    let queLines = [1, 1, 1, 1, 1, 1];
    if (hkdq.ha_thuong_quai) {
      const parts = hkdq.ha_thuong_quai.split('/');
      if (parts.length === 2) {
        const haName = parts[0].replace('Hạ', '').trim();
        const thuongName = parts[1].replace('Thượng', '').trim();
        const haLines = TRIGRAM_LINES[haName] || [1, 1, 1];
        const thuongLines = TRIGRAM_LINES[thuongName] || [1, 1, 1];
        queLines = [...haLines, ...thuongLines];
      }
    }

    // Render 6 Hào (từ hào 6 xuống hào 1 theo nguyên tắc Dịch học)
    let haosHtml = '';
    const haos = hkdq.haos || [];
    for (let i = 5; i >= 0; i--) {
      const hao = haos[i] || {};
      const hNum = i + 1;
      const isActive = (hNum === curHIdx);
      const lt = hao.luc_than || '';

      let badgeClass = 'luc-than-tai';
      if (lt === 'Tử Tôn') badgeClass = 'luc-than-ton';
      else if (lt === 'Quan Quỷ') badgeClass = 'luc-than-quy';
      else if (lt === 'Huynh Đệ') badgeClass = 'luc-than-huynh';
      else if (lt === 'Phụ Mẫu') badgeClass = 'luc-than-phu';

      // Tính tọa độ tâm hào dựa trên dải độ chuẩn xác của hào (Thuận hoặc Nghịch)
      let haoCenterDeg;
      if (typeof hao.deg_start === 'number' && typeof hao.deg_end === 'number') {
        haoCenterDeg = Math.round(((hao.deg_start + hao.deg_end) / 2) * 100) / 100;
      } else {
        const qStart = parseFloat((hkdq.deg_range_que || '').split('-')[0]) || 0;
        haoCenterDeg = Math.round((qStart + (hNum - 0.5) * 0.9375) * 100) / 100;
      }

      // Xác định vạch âm / dương từ quẻ chuẩn Dịch học
      const isYang = (queLines[i] === 1);
      const symbol = isYang ? '━━━' : '━ ━';

      haosHtml += `
        <div class="hkdq-hao-item ${isActive ? 'active-hao' : ''}" data-hao-deg="${haoCenterDeg}">
          <div class="hkdq-hao-left">
            <span class="hkdq-hao-symbol" style="color: ${isActive ? '#fbbf24' : '#94a3b8'}; font-weight: ${isYang ? '900' : '700'};">${symbol}</span>
            <div>
              <div class="hkdq-hao-title">
                Hào ${hNum}: ${hao.can_chi || ''}
                ${isActive ? '<span style="color:#fbbf24; font-size:0.65rem; margin-left:4px;">(Đang chỉ)</span>' : ''}
              </div>
              <div class="hkdq-hao-deg">${hao.deg_range || ''} • Tâm: ${haoCenterDeg}°</div>
            </div>
          </div>
          <div class="hkdq-hao-right">
            <span class="hkdq-hao-badge ${badgeClass}">${lt || 'Lục Thân'}</span>
            ${!isActive ? `<button type="button" class="hkdq-btn-rotate-hao" data-target-deg="${haoCenterDeg}">🎯 Xoay</button>` : ''}
          </div>
        </div>
      `;
    }

    modalBox.innerHTML = `
      <div class="lakinh-modal-overlay" id="modal-hkdq-overlay">
        <div class="lakinh-glass-panel lakinh-modal-dialog hkdq-modal-dialog">
          <div class="lakinh-modal-header">
            <div class="lakinh-modal-title">🔱 HUYỀN KHÔNG ĐẠI QUÁI ${isRayMode ? `(TIA NGẮM ${queryDeg.toFixed(1)}°)` : ''}</div>
            <button class="lakinh-modal-close" onclick="document.getElementById('modal-hkdq-overlay').remove()">✕</button>
          </div>

          <!-- Hero Card Quẻ Hiện Tại -->
          <div class="hkdq-hero-card">
            <div class="hkdq-hero-title">
              <span class="hkdq-hero-name">${hkdq.que_name}</span>
              <span class="hkdq-hero-fraction">Khí ${hkdq.quai_khi || hkdq.quai_so} / Vận ${hkdq.quai_van}</span>
            </div>
            <div class="hkdq-hero-sub">
              <span>🧭 ${hkdq.degree.toFixed(2)}° (${hkdq.son_24})</span>
              <span>•</span>
              <span>Cung ${hkdq.cung_bat_quai} (${hkdq.ngu_hanh_cung})</span>
              <span>•</span>
              <span style="color: ${hkdq.am_duong === 'Dương' ? '#fbbf24' : '#38bdf8'}; font-weight: 600;">${hkdq.am_duong || 'Quẻ'} • ${hkdq.chieu_hao || 'Thuận'}</span>
              <span>•</span>
              <span>Dải độ: ${hkdq.deg_range_que}</span>
            </div>
            ${hVp ? `
              <div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed rgba(255,255,255,0.18); display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 0.8rem; color: #f8fafc;">
                  ⚡ <strong>${hVp.ten_hao}:</strong> <span style="color: #67e8f9; font-weight: 600;">${hVp.can_chi || ''}</span>
                </span>
                <span class="hkdq-hao-badge ${
                  (hVp.luc_than === 'Tử Tôn') ? 'luc-than-ton' :
                  (hVp.luc_than === 'Thê Tài') ? 'luc-than-tai' :
                  (hVp.luc_than === 'Quan Quỷ') ? 'luc-than-quy' :
                  (hVp.luc_than === 'Huynh Đệ') ? 'luc-than-huynh' : 'luc-than-phu'
                }" style="font-size: 0.72rem; padding: 2px 10px; font-weight: 700;">
                  ${hVp.luc_than || 'Lục Thân'}
                </span>
              </div>
            ` : ''}
          </div>

          <!-- Trạng Thái Vận 9 & Tuyến Không Vong -->
          <div class="hkdq-status-grid">
            <div class="hkdq-status-card ${hkdq.van_9_role.is_duong_van_9 ? 'role-duong' : (hkdq.van_9_role.is_linh_than ? 'role-linh' : 'role-chinh')}">
              <div class="hkdq-card-label" style="color: ${hkdq.van_9_role.is_duong_van_9 ? '#facc15' : (hkdq.van_9_role.is_linh_than ? '#38bdf8' : '#c084fc')};">
                ${hkdq.van_9_role.is_duong_van_9 ? '✨ Đương Vận 9' : (hkdq.van_9_role.is_linh_than ? '🌊 Linh Thần Vận 9' : '⛰️ Chính Thần Vận 9')}
              </div>
              <div class="hkdq-card-val" style="color: ${hkdq.van_9_role.is_duong_van_9 ? '#eab308' : (hkdq.van_9_role.is_linh_than ? '#0284c7' : '#9333ea')};">
                ${hkdq.van_9_role.role}
              </div>
              <div class="hkdq-card-desc">
                ${hkdq.van_9_role.is_duong_van_9 ? 'Đương Vận 9 tối vượng (2024-2043), sinh khí tột đỉnh, đại cát đại lợi.' : (hkdq.van_9_role.is_linh_than ? 'Cần Nạp Thủy, mở Cổng Cửa, kê bàn làm việc kích tài lộc.' : 'Cần Tọa Sơn tĩnh tại, tựa lưng vững chãi, kỵ nước động.')}
              </div>
            </div>

            <div class="hkdq-status-card ${tkv.is_near_boundary ? 'tkv-warn' : 'tkv-safe'}">
              <div class="hkdq-card-label" style="color: ${tkv.is_near_boundary ? '#ef4444' : '#22c55e'};">
                ${tkv.is_near_boundary ? '⚠️ Tuyến Không Vong' : '🛡️ Khí Trường Thuần'}
              </div>
              <div class="hkdq-card-val" style="color: ${tkv.is_near_boundary ? '#dc2626' : '#16a34a'};">
                ${tkv.is_near_boundary ? (tkv.details && tkv.details.the_vi ? `${tkv.details.the_vi} (${tkv.distance}°)` : `Lệch ranh ${tkv.distance}°`) : 'An Toàn (Đắc Khí)'}
              </div>
              <div class="hkdq-card-desc">
                ${tkv.is_near_boundary ? (tkv.details ? `${tkv.details.tuyen_do_so}: ${tkv.details.the_vi} (${tkv.details.dang_hop_thanh || 'Ranh giới quẻ'})` : 'Sát ranh giới hào/quẻ, nên vi chỉnh về tâm hào để nạp khí thuần khiết.') : 'Khí trường thuần nhất, không bị lẫn lộn tạp khí.'}
              </div>
            </div>
          </div>

          <!-- Lời khuyên Hào Đang Chỉ -->
          ${hVp ? `
            <div style="background: rgba(30, 41, 59, 0.6); border-left: 3px solid #f59e0b; padding: 8px 10px; border-radius: 4px; margin-bottom: 10px; font-size: 0.72rem; line-height: 1.4;">
              <strong style="color: #fbbf24;">⚡ Phân kim ${hVp.ten_hao} (${hVp.can_chi} • ${hVp.luc_than}):</strong>
              <div style="color: #cbd5e1; margin-top: 3px;">${hVp.advice || ''}</div>
              ${hVp.nam_phat ? `<div style="color: #94a3b8; font-size: 0.68rem; margin-top: 2px;">• Ứng nghiệm: Năm ${hVp.nam_phat} • Người phát: ${hVp.nguoi_phat}</div>` : ''}
            </div>
          ` : ''}

          <!-- Danh Sách 6 Hào Vi Phân (0.9375°/hào) -->
          <div style="font-weight: 700; font-size: 0.75rem; color: #f5b041; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span>🔱 6 HÀO VI PHÂN (0.9375° / HÀO)</span>
            <span style="font-size: 0.65rem; color: #94a3b8;">Chạm để vi chỉnh</span>
          </div>
          <div class="hkdq-haos-container">
            ${haosHtml}
          </div>

          <div style="display: flex; gap: 8px;">
            <button class="lakinh-action-btn secondary" style="width: 100%;" onclick="document.getElementById('modal-hkdq-overlay').remove()">Đóng</button>
          </div>
        </div>
      </div>
    `;

    // Gắn sự kiện click cho các nút Xoay về hào
    modalBox.querySelectorAll('.hkdq-btn-rotate-hao').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const tDeg = parseFloat(btn.getAttribute('data-target-deg'));
        if (!isNaN(tDeg)) {
          if (isRayMode) {
            setRayAngle(tDeg);
            showLaKinhToast(`🎯 Đã định vị tia ngắm vào tâm Hào: ${tDeg.toFixed(2)}°`);
            openHKDQModal(tDeg);
          } else {
            updateRotationDisplay(tDeg);
            showLaKinhToast(`🎯 Đã vi chỉnh La Kinh về ${tDeg}°`);
            openHKDQModal();
          }
        }
      };
    });

    modalBox.querySelectorAll('.hkdq-hao-item').forEach(item => {
      item.onclick = () => {
        const tDeg = parseFloat(item.getAttribute('data-hao-deg'));
        if (!isNaN(tDeg)) {
          if (isRayMode) {
            setRayAngle(tDeg);
            showLaKinhToast(`🎯 Đã định vị tia ngắm vào tâm Hào: ${tDeg.toFixed(2)}°`);
            openHKDQModal(tDeg);
          } else {
            updateRotationDisplay(tDeg);
            showLaKinhToast(`🎯 Đã vi chỉnh La Kinh về ${tDeg}°`);
            openHKDQModal();
          }
        }
      };
    });
  }

  // Quản lý Bottom Sheet
  function openBottomSheet() {
    const sheet = document.getElementById('lakinh-bottom-sheet');
    const dockTools = document.getElementById('lakinh-dock-tools');
    if (sheet) {
      sheet.classList.add('open');
      state.isSheetOpen = true;
      if (dockTools) dockTools.classList.add('active');
      if (state.isRayActive) updateSightingRay();
    }
  }

  function closeBottomSheet() {
    const sheet = document.getElementById('lakinh-bottom-sheet');
    const dockTools = document.getElementById('lakinh-dock-tools');
    if (sheet) {
      sheet.classList.remove('open');
      state.isSheetOpen = false;
      if (dockTools) dockTools.classList.remove('active');
      if (state.isRayActive) updateSightingRay();
    }
  }

  function toggleBottomSheet() {
    if (state.isSheetOpen) {
      closeBottomSheet();
    } else {
      openBottomSheet();
    }
  }

  let activeSensorListeners = null;
  let hasReceivedAbsoluteEvent = false;

  function toggleCompassSensor() {
    const btnDock = document.getElementById('lakinh-dock-sensor');
    if (!state.isSensorActive) {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(resp => {
          if (resp === 'granted') startSensorListening(btnDock);
          else showLaKinhToast('⚠️ Cần cấp quyền cảm biến la bàn');
        }).catch(err => {
          showLaKinhToast('⚠️ Thiết bị không hỗ trợ cấp quyền cảm biến');
        });
      } else {
        startSensorListening(btnDock);
      }
    } else {
      stopSensorListening(btnDock);
    }
  }

  function startSensorListening(btn) {
    state.isSensorActive = true;
    if (btn) {
      btn.classList.add('active-green');
      btn.innerHTML = '🧭 Đang Đọc';
    }

    // 1. Luồng Cảm biến Phần cứng Cấp cao (Native Hardware Compass) qua NativeBridge
    // Áp dụng cho Ứng dụng Di Động Android APK (Flutter Native SensorManager)
    if (window.NativeBridge) {
      window._onNativeCompassHeading = (heading, accuracy) => {
        if (!state.isSensorActive || state.isLocked) return;
        state.isHardwareNative = true;
        updateRotationDisplay(heading);
      };
      window._onNativeCompassError = (err) => {
        showLaKinhToast('⚠️ Lỗi cảm biến phần cứng: ' + err);
      };
      try {
        window.NativeBridge.postMessage(JSON.stringify({ action: 'startCompass' }));
        showLaKinhToast('🧭 Đã bật La Bàn Phần Cứng (3D Hardware Compass - Kalman Filter)');
        return;
      } catch (e) {
        console.warn('NativeBridge startCompass failed, falling back to web events', e);
      }
    }

    hasReceivedAbsoluteEvent = false;

    // 2. Luồng tuyệt đối True North / Magnetic chuẩn (Android Chrome / Chromium)
    const onAbsolute = (e) => {
      if (!state.isSensorActive || state.isLocked) return;
      hasReceivedAbsoluteEvent = true;
      processSensorHeading(e, true);
    };

    // 3. Luồng thông thường (iOS Safari webkitCompassHeading hoặc Android fallback)
    const onStandard = (e) => {
      if (!state.isSensorActive || state.isLocked) return;
      if (hasReceivedAbsoluteEvent && !e.webkitCompassHeading) return;
      processSensorHeading(e, false);
    };

    activeSensorListeners = { onAbsolute, onStandard };

    window.addEventListener('deviceorientationabsolute', onAbsolute, true);
    window.addEventListener('deviceorientation', onStandard, true);

    showLaKinhToast('🧭 Đã bật cảm biến la bàn. Đỉnh điện thoại (12h) là hướng đo nhà.');
  }

  function stopSensorListening(btn) {
    state.isSensorActive = false;
    if (btn) {
      btn.classList.remove('active-green');
      btn.innerHTML = '🧭 La Bàn';
    }

    // Tắt cảm biến phần cứng native nếu đang mở
    if (window.NativeBridge) {
      try {
        window.NativeBridge.postMessage(JSON.stringify({ action: 'stopCompass' }));
      } catch (e) {}
      window._onNativeCompassHeading = null;
      window._onNativeCompassError = null;
    }

    if (activeSensorListeners) {
      window.removeEventListener('deviceorientationabsolute', activeSensorListeners.onAbsolute, true);
      window.removeEventListener('deviceorientation', activeSensorListeners.onStandard, true);
      activeSensorListeners = null;
    }
    hasReceivedAbsoluteEvent = false;
    showLaKinhToast('Đã dừng cảm biến la bàn');
  }

  function processSensorHeading(e, isAbsolute) {
    if (!state.isSensorActive || state.isLocked) return;

    let heading = null;

    // A. iOS Safari: webkitCompassHeading (0-360 chuẩn, đã được CoreMotion hiệu chuẩn trực tiếp theo la bàn iPhone)
    if (typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading)) {
      heading = e.webkitCompassHeading;
      // Lưu ý: webkitCompassHeading trên iOS đã khớp 100% với ứng dụng La Bàn của iPhone (Apple Compass),
      // không áp dụng bù từ thiên để tránh sai lệch số với la bàn hệ thống của máy.
    } 
    // B. Android / Chromium: alpha, beta, gamma theo chuẩn W3C Device Orientation Specification
    else if (typeof e.alpha === 'number' && !isNaN(e.alpha)) {
      const alpha = e.alpha;
      const beta = typeof e.beta === 'number' && !isNaN(e.beta) ? e.beta : 0;
      const gamma = typeof e.gamma === 'number' && !isNaN(e.gamma) ? e.gamma : 0;

      const degToRad = Math.PI / 180;
      const aRad = alpha * degToRad;
      const bRad = beta * degToRad;
      const gRad = gamma * degToRad;

      const cA = Math.cos(aRad), sA = Math.sin(aRad);
      const cB = Math.cos(bRad), sB = Math.sin(bRad);
      const cG = Math.cos(gRad), sG = Math.sin(gRad);

      const pitch = Math.abs(beta);

      // 1. Khi cầm điện thoại ngắm phẳng hoặc nghiêng đọc bài (|beta| <= 60 độ):
      // Đỉnh 12h (trục Y) chiếu xuống mặt phẳng ngang Trái Đất có phương vị = (360 - alpha) % 360
      const hFlat = (360 - alpha + 360) % 360;

      // 2. Khi dựng máy đứng ngắm qua camera (|beta| >= 80 độ):
      // Hướng ngắm là pháp tuyến lưng máy (-Z)
      const vEast = -cA * sG - sA * sB * cG;
      const vNorth = -sA * sG + cA * sB * cG;
      let hCam = Math.atan2(vEast, vNorth) * (180 / Math.PI);
      if (hCam < 0) hCam += 360;

      if (pitch <= 60) {
        heading = hFlat;
      } else if (pitch >= 80) {
        heading = hCam;
      } else {
        // Chuyển tiếp mượt mà giữa 60 và 80 độ, loại bỏ hoàn toàn nhảy số đột ngột
        let diffCam = hCam - hFlat;
        while (diffCam < -180) diffCam += 360;
        while (diffCam > 180) diffCam -= 360;
        const t = (pitch - 60) / 20;
        heading = (hFlat + t * diffCam + 360) % 360;
      }

      // Bù hướng xoay màn hình (Screen orientation angle)
      const screenAngle = (window.screen && window.screen.orientation && typeof window.screen.orientation.angle === 'number')
        ? window.screen.orientation.angle
        : (typeof window.orientation === 'number' ? window.orientation : 0);

      heading = (heading + screenAngle + 360) % 360;

      // Cảnh báo nếu đang dùng cảm biến tương đối trên trình duyệt web (không có dữ liệu từ trường)
      if (!isAbsolute && !hasReceivedAbsoluteEvent && !state._hasWarnedRelative) {
        state._hasWarnedRelative = true;
        showLaKinhToast('💡 Gợi ý: Dùng app Neta Light APK để kích hoạt La Bàn Phần Cứng chuẩn Bắc 100%');
      }

      // Tùy chọn bù từ thiên WMM: chỉ bù khi nguồn cảm biến là Bắc Từ (relative) chứ không phải True North
      const chkAutoDec = document.getElementById('lakinh-chk-autodec');
      if (chkAutoDec && chkAutoDec.checked && !isAbsolute) {
        heading = (heading + state.declination + 360) % 360;
      }
    }

    // Tính độ lệch góc ngắn nhất [-180, 180]
    let diff = heading - state.rotation;
    while (diff < -180) diff += 360;
    while (diff > 180) diff -= 360;

    // Vùng chết (Deadband filter): nếu tay chỉ rung nhẹ < 0.2 độ thì giữ nguyên, chống nhảy số
    if (Math.abs(diff) < 0.2) return;

    // Bộ lọc thích ứng (Adaptive low-pass filter):
    // Xoay nhanh thì bắt nhạy (alphaFilter = 0.45), xoay chậm thì làm mượt đầm êm (alphaFilter = 0.20)
    const alphaFilter = Math.abs(diff) > 15 ? 0.45 : 0.20;
    const smoothed = (state.rotation + alphaFilter * diff + 360) % 360;
    state.targetSmoothedHeading = smoothed;
    if (!state.rafHeadingPending) {
      state.rafHeadingPending = true;
      requestAnimationFrame(() => {
        state.rafHeadingPending = false;
        if (state.targetSmoothedHeading !== undefined) {
          updateRotationDisplay(state.targetSmoothedHeading);
        }
      });
    }
  }

  function toggleLockHeading() {
    state.isLocked = !state.isLocked;
    const btnLock = document.getElementById('sheet-btn-lock');
    const btnDock = document.getElementById('lakinh-dock-sensor');

    if (state.isLocked) {
      if (btnLock) {
        btnLock.innerHTML = '🔒 Đang Khóa Hướng Nhà';
        btnLock.style.background = '#dc2626';
      }
      if (btnDock) {
        btnDock.classList.add('locked-red');
        btnDock.innerHTML = '🔒 Đã Khóa Góc';
      }
      showLaKinhToast('🔒 Đã khóa góc đo hướng nhà');
    } else {
      if (btnLock) {
        btnLock.innerHTML = '🔓 Khóa Góc Hiện Tại';
        btnLock.style.background = '#334155';
      }
      if (btnDock) {
        btnDock.classList.remove('locked-red');
        btnDock.innerHTML = state.isSensorActive ? '🧭 Đang Đọc' : '🧭 La Bàn';
      }
      showLaKinhToast('🔓 Đã mở khóa góc');
    }
  }

  // Thao tác click trên bản đồ
  function onMapClick(e) {
    if (!state.isTracingPlot) {
      if (mapInstance && e.latlng) {
        mapInstance.panTo(e.latlng, { animate: true });
      }
      return;
    }
    state.polygonPoints.push(e.latlng);

    polygonLayerGroup.clearLayers();

    state.polygonPoints.forEach(pt => {
      L.circleMarker(pt, { radius: 5, color: '#f5b041', fillColor: '#fff', fillOpacity: 1 }).addTo(polygonLayerGroup);
    });

    if (state.polygonPoints.length >= 2) {
      L.polyline(state.polygonPoints, { color: '#f5b041', weight: 2, dashArray: '4, 4' }).addTo(polygonLayerGroup);
    }

    if (state.polygonPoints.length >= 3) {
      L.polygon(state.polygonPoints, { color: '#f5b041', fillColor: '#f5b041', fillOpacity: 0.15 }).addTo(polygonLayerGroup);

      if (global.NetaLaKinhEngine) {
        const centroid = global.NetaLaKinhEngine.calculatePolygonCentroid(state.polygonPoints);
        if (centroid) {
          L.marker([centroid.lat, centroid.lng], {
            icon: L.divIcon({
              className: 'custom-centroid-marker',
              html: `<div style="display:inline-flex;align-items:center;background:none;border:none;">
                <span style="font-size:18px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.9));">🎯</span>
                <span style="color:#ef4444;font-size:11px;font-weight:800;white-space:nowrap;margin-left:2px;background:none;text-shadow:-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 1px 4px #000;">${centroid.areaM2} m²</span>
              </div>`,
              iconSize: [60, 20],
              iconAnchor: [9, 10]
            })
          }).bindPopup(`<div style="font-weight:700;font-size:12px;color:#0f172a;padding:3px;">🎯 Tim Thửa Đất<br>Diện tích: ${centroid.areaM2} m²</div>`).addTo(polygonLayerGroup);

          mapInstance.panTo([centroid.lat, centroid.lng]);
        }
      }
    }
  }

  // Phân tích cú pháp tọa độ GPS linh hoạt
  function parseCoordinates(input) {
    if (!input) return null;
    const str = input.trim();
    // Khớp 2 số thực phân cách bởi dấu phẩy hoặc khoảng trắng
    const m = str.match(/([-+]?[0-9]*\.?[0-9]+)[,\s\t]+([-+]?[0-9]*\.?[0-9]+)/);
    if (!m) return null;
    let val1 = parseFloat(m[1]);
    let val2 = parseFloat(m[2]);
    if (isNaN(val1) || isNaN(val2)) return null;

    let lat, lng;
    // Tự động nhận diện vĩ độ / kinh độ tại Việt Nam và toàn cầu
    if (val1 >= -90 && val1 <= 90 && val2 >= -180 && val2 <= 180) {
      if (val1 >= 8 && val1 <= 24 && val2 >= 102 && val2 <= 110) {
        lat = val1; lng = val2;
      } else if (val2 >= 8 && val2 <= 24 && val1 >= 102 && val1 <= 110) {
        lat = val2; lng = val1; // Người dùng nhập ngược (kinh độ, vĩ độ)
      } else {
        lat = val1; lng = val2;
      }
      return { lat, lng };
    }
    return null;
  }

  // Nhảy đến vị trí và cắm marker khảo sát
  function jumpToLocation(lat, lng, name) {
    if (!mapInstance) return;
    mapInstance.setView([lat, lng], 19, { animate: true });
    state.centerCoords = [lat, lng];
    updateLocationHUD(lat, lng);

    if (searchMarkerLayerGroup) {
      searchMarkerLayerGroup.clearLayers();
      L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'custom-search-pin',
          html: `<div class="search-drop-pin" style="display:flex;align-items:center;justify-content:center;background:none;border:none;">
            <svg width="28" height="36" viewBox="0 0 28 36" fill="none" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.85));">
              <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22c0-7.732-6.268-14-14-14z" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
              <circle cx="14" cy="13" r="5" fill="#ffffff"/>
            </svg>
          </div>`,
          iconSize: [28, 36],
          iconAnchor: [14, 36],
          popupAnchor: [0, -36]
        })
      }).bindPopup(`<div style="font-size:12px;font-weight:700;color:#0f172a;padding:2px 4px;max-width:240px;text-align:center;">📍 ${name}</div>`).addTo(searchMarkerLayerGroup);
    }

    const dropdown = document.getElementById('lakinh-search-dropdown');
    if (dropdown) dropdown.style.display = 'none';

    // Tự động thu / ẩn thanh tìm kiếm sau khi hoàn thành nhiệm vụ để trả lại 100% tầm nhìn khảo sát
    const searchWrap = document.getElementById('lakinh-search-bar-wrap');
    if (searchWrap) searchWrap.style.display = 'none';

    showLaKinhToast(`🎯 Đã chuyển đến: ${name}`);
  }

  let searchDebounceTimer = null;

  function initQuickSearchBar() {
    const input = document.getElementById('lakinh-search-bar-input');
    const clearBtn = document.getElementById('lakinh-search-bar-clear');
    const searchBtn = document.getElementById('lakinh-search-bar-btn');
    const closeBtn = document.getElementById('lakinh-search-bar-close');
    const toggleBtn = document.getElementById('lakinh-btn-search');
    const searchWrap = document.getElementById('lakinh-search-bar-wrap');
    const dropdown = document.getElementById('lakinh-search-dropdown');
    if (!input || !dropdown) return;

    if (toggleBtn && searchWrap) {
      toggleBtn.onclick = (e) => {
        e.stopPropagation();
        const isHidden = searchWrap.style.display === 'none' || getComputedStyle(searchWrap).display === 'none';
        if (isHidden) {
          searchWrap.style.display = 'block';
          input.focus();
          if (!input.value.trim()) {
            showQuickCities();
          } else {
            performSearch(input.value);
          }
        } else {
          searchWrap.style.display = 'none';
          dropdown.style.display = 'none';
        }
      };
    }

    if (closeBtn && searchWrap) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        searchWrap.style.display = 'none';
        dropdown.style.display = 'none';
      };
    }

    const quickCities = [
      { name: 'Hà Nội', lat: 21.028511, lng: 105.854167 },
      { name: 'TP. Hồ Chí Minh', lat: 10.776889, lng: 106.700806 },
      { name: 'Đà Nẵng', lat: 16.054407, lng: 108.202167 },
      { name: 'Hải Phòng', lat: 20.844912, lng: 106.688084 },
      { name: 'Cần Thơ', lat: 10.045162, lng: 105.746857 }
    ];

    const removeVietnameseTones = (str) => {
      if (!str) return '';
      return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .toLowerCase()
        .trim();
    };

    const extractNumberAndStreet = (raw) => {
      const q = raw.trim();
      const m1 = q.match(/^(?:số\s*)?(\d+[\w\/-]*)\s+(.+)$/i);
      if (m1) return { num: m1[1], street: m1[2].trim() };
      const m2 = q.match(/^(.+?)\s+(?:số\s*)?(\d+[\w\/-]*)$/i);
      if (m2) return { num: m2[2], street: m2[1].trim() };
      return { num: null, street: q };
    };

    const localPlaces = [
      // Hà Nội - Địa danh & Trục đường huyết mạch
      { name: 'Đường Nguyễn Tuân, Thanh Xuân, Hà Nội', lat: 20.9975, lng: 105.8045 },
      { name: 'Đường Lê Văn Lương, Cầu Giấy / Thanh Xuân, Hà Nội', lat: 21.0062, lng: 105.8038 },
      { name: 'Đường Khuất Duy Tiến, Thanh Xuân, Hà Nội', lat: 20.9934, lng: 105.7958 },
      { name: 'Đường Hoàng Đạo Thúy, Cầu Giấy / Thanh Xuân, Hà Nội', lat: 21.0076, lng: 105.8012 },
      { name: 'Đường Nguyễn Trãi, Thanh Xuân, Hà Nội', lat: 20.9942, lng: 105.8115 },
      { name: 'Đường Trần Duy Hưng, Cầu Giấy, Hà Nội', lat: 21.0088, lng: 105.7981 },
      { name: 'Đường Cầu Giấy, Cầu Giấy, Hà Nội', lat: 21.0333, lng: 105.7937 },
      { name: 'Đường Xuân Thủy, Cầu Giấy, Hà Nội', lat: 21.0366, lng: 105.7831 },
      { name: 'Đường Trần Cung, Bắc Từ Liêm, Hà Nội', lat: 21.0475, lng: 105.7958 },
      { name: 'Viện Khoa học Công nghệ Xây dựng (IBST), Hà Nội', lat: 21.0475, lng: 105.7958 },
      { name: 'Đường Hoàng Quốc Việt, Cầu Giấy, Hà Nội', lat: 21.0456, lng: 105.7984 },
      { name: 'Đường Phạm Hùng, Nam Từ Liêm, Hà Nội', lat: 21.0232, lng: 105.7779 },
      { name: 'Đường Mễ Trì, Nam Từ Liêm, Hà Nội', lat: 21.0163, lng: 105.7792 },
      { name: 'Đường Kim Mã, Ba Đình, Hà Nội', lat: 21.0318, lng: 105.8235 },
      { name: 'Đường Liễu Giai, Ba Đình, Hà Nội', lat: 21.0345, lng: 105.8142 },
      { name: 'Đường Hoàng Hoa Thám, Ba Đình / Tây Hồ, Hà Nội', lat: 21.0415, lng: 105.8180 },
      { name: 'Đường Láng, Đống Đa, Hà Nội', lat: 21.0116, lng: 105.8095 },
      { name: 'Đường Xã Đàn, Đống Đa, Hà Nội', lat: 21.0152, lng: 105.8324 },
      { name: 'Đường Giải Phóng, Hoàng Mai, Hà Nội', lat: 20.9854, lng: 105.8421 },
      { name: 'Đường Võ Chí Công, Tây Hồ, Hà Nội', lat: 21.0635, lng: 105.8012 },
      { name: 'Đường Lạc Long Quân, Tây Hồ, Hà Nội', lat: 21.0612, lng: 105.8105 },
      { name: 'Đường Phố Huế, Hai Bà Trưng, Hà Nội', lat: 21.0145, lng: 105.8521 },
      { name: 'Đường Bà Triệu, Hoàn Kiếm / Hai Bà Trưng, Hà Nội', lat: 21.0182, lng: 105.8496 },
      { name: 'Đường Quang Trung, Hà Đông, Hà Nội', lat: 20.9702, lng: 105.7758 },
      { name: 'Hồ Hoàn Kiếm, Hà Nội', lat: 21.028511, lng: 105.854167 },
      { name: 'Quận Hoàn Kiếm, Hà Nội', lat: 21.0312, lng: 105.8525 },
      { name: 'Quận Cầu Giấy, Hà Nội', lat: 21.0333, lng: 105.7937 },
      { name: 'Quận Ba Đình, Hà Nội', lat: 21.0346, lng: 105.8239 },
      { name: 'Quận Đống Đa, Hà Nội', lat: 21.0182, lng: 105.8277 },
      { name: 'Quận Hai Bà Trưng, Hà Nội', lat: 21.0076, lng: 105.8524 },
      { name: 'Quận Tây Hồ, Hà Nội', lat: 21.0667, lng: 105.8208 },
      { name: 'Quận Long Biên, Hà Nội', lat: 21.0392, lng: 105.8927 },
      { name: 'Quận Nam Từ Liêm, Hà Nội', lat: 21.0128, lng: 105.7628 },
      { name: 'Quận Bắc Từ Liêm, Hà Nội', lat: 21.0658, lng: 105.7592 },
      { name: 'Quận Thanh Xuân, Hà Nội', lat: 20.9983, lng: 105.8078 },
      { name: 'Quận Hoàng Mai, Hà Nội', lat: 20.9734, lng: 105.8456 },
      { name: 'Quận Hà Đông, Hà Nội', lat: 20.9634, lng: 105.7725 },

      // TP. Hồ Chí Minh
      { name: 'Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh', lat: 10.7744, lng: 106.7032 },
      { name: 'Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh', lat: 10.7735, lng: 106.6998 },
      { name: 'Đường Đồng Khởi, Quận 1, TP. Hồ Chí Minh', lat: 10.7762, lng: 106.7028 },
      { name: 'Chợ Bến Thành, Quận 1, TP. Hồ Chí Minh', lat: 10.7725, lng: 106.6980 },
      { name: 'Đường Pasteur, Quận 1 / Quận 3, TP. Hồ Chí Minh', lat: 10.7812, lng: 106.6934 },
      { name: 'Đường Nam Kỳ Khởi Nghĩa, Quận 3, TP. Hồ Chí Minh', lat: 10.7876, lng: 106.6854 },
      { name: 'Đường Điện Biên Phủ, TP. Hồ Chí Minh', lat: 10.7963, lng: 106.6987 },
      { name: 'Đường Cách Mạng Tháng Tám, Quận 3, TP. Hồ Chí Minh', lat: 10.7825, lng: 106.6781 },
      { name: 'Đường Võ Văn Kiệt, TP. Hồ Chí Minh', lat: 10.7582, lng: 106.6874 },
      { name: 'Đường Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh', lat: 10.7302, lng: 106.7125 },
      { name: 'Quận 1, TP. Hồ Chí Minh', lat: 10.7769, lng: 106.7008 },
      { name: 'Quận 3, TP. Hồ Chí Minh', lat: 10.7844, lng: 106.6844 },
      { name: 'TP. Thủ Đức, TP. Hồ Chí Minh', lat: 10.8494, lng: 106.7717 },
      { name: 'Quận Bình Thạnh, TP. Hồ Chí Minh', lat: 10.8106, lng: 106.7091 },
      { name: 'Quận Tân Bình, TP. Hồ Chí Minh', lat: 10.8015, lng: 106.6548 },
      { name: 'Quận Phú Nhuận, TP. Hồ Chí Minh', lat: 10.7992, lng: 106.6803 },
      { name: 'Quận 7, TP. Hồ Chí Minh', lat: 10.7340, lng: 106.7218 },

      // Các thành phố lớn khác
      { name: 'TP. Đà Nẵng', lat: 16.0544, lng: 108.2022 },
      { name: 'Đường Bạch Đằng, Hải Châu, Đà Nẵng', lat: 16.0682, lng: 108.2241 },
      { name: 'Cầu Rồng, Đà Nẵng', lat: 16.0610, lng: 108.2272 },
      { name: 'TP. Hải Phòng', lat: 20.8449, lng: 106.6881 },
      { name: 'TP. Cần Thơ', lat: 10.0452, lng: 105.7469 },
      { name: 'TP. Nha Trang, Khánh Hòa', lat: 12.2388, lng: 109.1967 },
      { name: 'TP. Huế, Thừa Thiên Huế', lat: 16.4637, lng: 107.5909 },
      { name: 'TP. Vũng Tàu, Bà Rịa - Vũng Tàu', lat: 10.3460, lng: 107.0843 }
    ];

    const showQuickCities = () => {
      let html = `
        <div style="font-size:0.7rem; color:#94a3b8; margin-bottom:6px;">Chọn nhanh khu vực khảo sát:</div>
        <div class="lakinh-quick-cities" style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:4px;">
      `;
      quickCities.forEach((c) => {
        html += `<button type="button" class="lakinh-city-chip" style="font-size:0.7rem; padding:3px 8px;" data-lat="${c.lat}" data-lng="${c.lng}" data-name="${c.name}">📍 ${c.name}</button>`;
      });
      html += `</div>
        <div style="font-size:0.68rem; color:#64748b; margin-top:6px;">💡 Nhập tên đường, số nhà, địa chỉ hoặc tọa độ GPS (VD: 82 Nguyễn Tuân hoặc 21.0475, 105.7958)</div>
      `;
      dropdown.innerHTML = html;
      dropdown.style.display = 'block';

      dropdown.querySelectorAll('.lakinh-city-chip').forEach(btn => {
        btn.onclick = () => {
          const lat = parseFloat(btn.getAttribute('data-lat'));
          const lng = parseFloat(btn.getAttribute('data-lng'));
          const name = btn.getAttribute('data-name');
          input.value = name;
          jumpToLocation(lat, lng, name);
        };
      });
    };

    const performSearch = async (val) => {
      const q = val.trim();
      if (!q) {
        showQuickCities();
        return;
      }

      // 1. Kiểm tra tọa độ GPS
      const coords = parseCoordinates(q);
      let coordHtml = '';
      if (coords) {
        coordHtml = `
          <div class="lakinh-search-suggest-item highlight-coord" data-lat="${coords.lat}" data-lng="${coords.lng}" data-name="Tọa độ ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}">
            <div style="font-weight:800; font-size:0.78rem; color:#38bdf8;">🎯 Bay đến Tọa độ GPS: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}</div>
            <div style="font-size:0.68rem; color:#cbd5e1; margin-top:2px;">Chạm để đặt tâm La Kinh vào tọa độ này</div>
          </div>
        `;
      }

      // 2. Tìm kiếm trong danh mục ngoại tuyến (Instant Local Match & Smart Street Matching)
      const qNorm = removeVietnameseTones(q);
      const parsed = extractNumberAndStreet(q);
      const streetNorm = removeVietnameseTones(parsed.street);

      const matchedLocal = [];
      localPlaces.forEach(p => {
        const pNorm = removeVietnameseTones(p.name);
        if (pNorm.includes(qNorm) || (streetNorm.length >= 3 && pNorm.includes(streetNorm))) {
          matchedLocal.push(p);
        }
      });

      let localHtml = '';
      if (matchedLocal.length > 0) {
        matchedLocal.slice(0, 4).forEach(p => {
          let displayName = p.name;
          if (parsed.num) {
            displayName = `Số ${parsed.num} ${p.name}`;
          }
          localHtml += `
            <div class="lakinh-search-suggest-item" data-lat="${p.lat}" data-lng="${p.lng}" data-name="${displayName.replace(/"/g, '&quot;')}">
              <div style="font-weight:700; font-size:0.76rem; color:#f5b041;">📍 ${displayName}</div>
              <div style="font-size:0.68rem; color:#94a3b8; margin-top:2px;">⚡ Ngoại tuyến | Tọa độ: ${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}</div>
            </div>
          `;
        });
      }

      dropdown.style.display = 'block';
      dropdown.innerHTML = coordHtml + localHtml + '<div style="padding:6px; text-align:center; color:#94a3b8; font-size:0.72rem;">⏳ Đang tìm kiếm thêm từ máy chủ bản đồ vệ tinh...</div>';

      const bindItems = () => {
        dropdown.querySelectorAll('.lakinh-search-suggest-item').forEach(item => {
          item.onclick = () => {
            const lat = parseFloat(item.getAttribute('data-lat'));
            const lng = parseFloat(item.getAttribute('data-lng'));
            const name = item.getAttribute('data-name');
            input.value = name;
            jumpToLocation(lat, lng, name);
          };
        });
      };
      bindItems();

      // 3. Tìm kiếm trực tuyến đa máy chủ: Photon Komoot (Ưu tiên) + Nominatim (Dự phòng)
      try {
        const center = (state && state.centerCoords) ? { lat: state.centerCoords[0], lng: state.centerCoords[1] } : { lat: 21.0285, lng: 105.8542 };
        const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lat=${center.lat}&lon=${center.lng}&limit=6`;
        
        let fetchedFeatures = [];
        try {
          const controller = new AbortController();
          const tId = setTimeout(() => controller.abort(), 4500);
          const res = await fetch(photonUrl, { signal: controller.signal });
          clearTimeout(tId);
          if (res.ok) {
            const data = await res.json();
            if (data && data.features && data.features.length > 0) {
              fetchedFeatures = data.features;
            }
          }
        } catch (pe) {
          console.warn('Photon fetch failed:', pe);
        }

        // Dự phòng Nominatim nếu Photon không trả kết quả
        if (fetchedFeatures.length === 0) {
          try {
            const nomQuery = (q.toLowerCase().includes('việt') || q.toLowerCase().includes('viet')) ? q : `${q}, Việt Nam`;
            const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(nomQuery)}&format=json&addressdetails=1&limit=6`;
            const controller = new AbortController();
            const tId = setTimeout(() => controller.abort(), 4500);
            const res = await fetch(nomUrl, {
              signal: controller.signal,
              headers: { 'Accept-Language': 'vi,en;q=0.8' }
            });
            clearTimeout(tId);
            if (res.ok) {
              const nomData = await res.json();
              if (Array.isArray(nomData)) {
                fetchedFeatures = nomData.map(item => ({
                  properties: {
                    name: item.display_name.split(',')[0],
                    street: item.address ? (item.address.road || item.address.pedestrian || item.address.suburb) : '',
                    housenumber: item.address ? item.address.house_number : '',
                    district: item.address ? (item.address.suburb || item.address.quarter || item.address.county || item.address.city_district) : '',
                    city: item.address ? (item.address.city || item.address.town || item.address.province) : '',
                    country: 'Việt Nam'
                  },
                  geometry: {
                    coordinates: [parseFloat(item.lon), parseFloat(item.lat)]
                  }
                }));
              }
            }
          } catch (ne) {
            console.warn('Nominatim fallback failed:', ne);
          }
        }

        let placesHtml = '';
        if (fetchedFeatures.length > 0) {
          fetchedFeatures.forEach((feat) => {
            const props = feat.properties || {};
            const geom = feat.geometry || {};
            const c = geom.coordinates || [];
            const lng = c[0];
            const lat = c[1];
            if (!lat || !lng) return;

            let title = '';
            if (props.housenumber && props.street) {
              title = `${props.housenumber} ${props.street}`;
              if (props.name && props.name !== props.street && props.name !== props.housenumber) {
                title = `${props.name} (${props.housenumber} ${props.street})`;
              }
            } else if (props.name) {
              title = props.name;
              if (props.street && props.street !== props.name) {
                title += ` - ${props.street}`;
              }
            } else if (props.street) {
              title = props.street;
            } else {
              title = q;
            }

            const contextParts = [];
            if (props.district) contextParts.push(props.district);
            if (props.city && !contextParts.includes(props.city)) contextParts.push(props.city);
            if (props.state && !contextParts.includes(props.state) && props.state !== props.city) contextParts.push(props.state);
            if (props.country && !contextParts.includes(props.country)) contextParts.push(props.country);
            const context = contextParts.join(', ');

            const fullName = [title, context].filter(Boolean).join(', ');

            placesHtml += `
              <div class="lakinh-search-suggest-item" data-lat="${lat}" data-lng="${lng}" data-name="${fullName.replace(/"/g, '&quot;')}">
                <div style="font-weight:700; font-size:0.76rem; color:#38bdf8;">📍 ${title}</div>
                <div style="font-size:0.68rem; color:#cbd5e1; margin-top:2px;">${context}</div>
              </div>
            `;
          });
        }

        dropdown.innerHTML = coordHtml + localHtml + placesHtml;
        if (!coordHtml && !localHtml && !placesHtml) {
          dropdown.innerHTML = '<div style="padding:8px; text-align:center; color:#ef4444; font-size:0.73rem;">❌ Không tìm thấy địa chỉ này. Hãy thử nhập tên đường hoặc tọa độ (VD: 21.0285, 105.8542).</div>';
        }
        bindItems();
      } catch (err) {
        console.warn('Online geocoding fallback to local/coord:', err);
        if (coordHtml || localHtml) {
          dropdown.innerHTML = coordHtml + localHtml;
          bindItems();
        } else {
          dropdown.innerHTML = '<div style="padding:8px; text-align:center; color:#f59e0b; font-size:0.73rem;">⚠️ Không kết nối được máy chủ tìm kiếm. Hãy nhập trực tiếp tọa độ (VD: 21.0285, 105.8542).</div>';
        }
      }
    };

    input.onfocus = () => {
      if (input.value.trim().length === 0) {
        showQuickCities();
      } else {
        performSearch(input.value);
      }
    };

    input.oninput = () => {
      const val = input.value;
      if (clearBtn) clearBtn.style.display = val ? 'flex' : 'none';
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        performSearch(val);
      }, 300);
    };

    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const coords = parseCoordinates(input.value);
        if (coords) {
          jumpToLocation(coords.lat, coords.lng, `Tọa độ ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`);
        } else {
          performSearch(input.value);
        }
      }
    };

    if (clearBtn) {
      clearBtn.onclick = () => {
        input.value = '';
        clearBtn.style.display = 'none';
        input.focus();
        showQuickCities();
      };
    }

    if (searchBtn) {
      searchBtn.onclick = () => {
        const coords = parseCoordinates(input.value);
        if (coords) {
          jumpToLocation(coords.lat, coords.lng, `Tọa độ ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`);
        } else {
          performSearch(input.value);
        }
      };
    }
  }

  // Tìm kiếm địa điểm & Hướng dẫn gỡ chặn GPS
  function promptSearchLocation(isGpsBlocked = false, isGpsDisabled = false) {
    const modalBox = document.getElementById('lakinh-modal-container');
    if (!modalBox) return;

    const isNativeApp = typeof window !== 'undefined' && !!window.NativeBridge;

    const quickCities = [
      { name: 'Hà Nội', lat: 21.028511, lng: 105.854167 },
      { name: 'TP. Hồ Chí Minh', lat: 10.776889, lng: 106.700806 },
      { name: 'Đà Nẵng', lat: 16.054407, lng: 108.202167 },
      { name: 'Hải Phòng', lat: 20.844912, lng: 106.688084 },
      { name: 'Cần Thơ', lat: 10.045162, lng: 105.746857 },
      { name: 'Nha Trang', lat: 12.238791, lng: 109.196749 },
      { name: 'Huế', lat: 16.463714, lng: 107.590866 },
      { name: 'Vũng Tàu', lat: 10.345990, lng: 107.084260 }
    ];

    const chipsHtml = quickCities.map((c, i) => 
      `<button type="button" class="lakinh-city-chip" data-city-idx="${i}">📍 ${c.name}</button>`
    ).join('');

    let guideHtml = '';
    if (isGpsDisabled) {
      guideHtml = `
        <div class="lakinh-gps-guide-box">
          <div style="font-weight: 800; color: #f59e0b; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 1.1rem;">🛰️</span>
            <span>ĐỊNH VỊ GPS TRÊN ĐIỆN THOẠI ĐANG TẮT</span>
          </div>
          <div style="font-size: 0.74rem; line-height: 1.5; color: #e2e8f0; margin-bottom: 8px;">
            Để thiết bị tự động lấy tọa độ ngôi nhà qua vệ tinh GPS, vui lòng bật dịch vụ <b>Vị trí (GPS)</b> trong cài đặt máy:
          </div>
          <div style="display: flex; gap: 8px;">
            ${isNativeApp ? `
              <button type="button" id="btn-open-location-settings" class="lakinh-action-btn primary" style="font-size: 0.75rem; padding: 6px 12px; width: 100%;">
                🛰️ Bật GPS Trong Cài Đặt Máy
              </button>
            ` : ''}
          </div>
        </div>
      `;
    } else if (isGpsBlocked) {
      if (isNativeApp) {
        guideHtml = `
          <div class="lakinh-gps-guide-box">
            <div style="font-weight: 800; color: #ef4444; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 1.1rem;">⚠️</span>
              <span>QUYỀN VỊ TRÍ CHƯA ĐƯỢC CẤP CHO ỨNG DỤNG</span>
            </div>
            <div style="font-size: 0.74rem; line-height: 1.5; color: #e2e8f0; margin-bottom: 8px;">
              Ứng dụng cần quyền Vị trí để xác định tọa độ nhà bạn. Hãy bấm nút dưới để mở Cài đặt ứng dụng và bật quyền <b>Vị trí</b>:
            </div>
            <div style="display: flex; gap: 8px;">
              <button type="button" id="btn-open-app-settings" class="lakinh-action-btn primary" style="font-size: 0.75rem; padding: 6px 12px; width: 100%;">
                ⚙️ Mở Cài Đặt Cấp Quyền Vị Trí
              </button>
            </div>
          </div>
        `;
      } else {
        guideHtml = `
          <div class="lakinh-gps-guide-box">
            <div style="font-weight: 800; color: #f59e0b; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 1.1rem;">⚠️</span>
              <span>QUYỀN ĐỊNH VỊ GPS ĐANG BỊ TRÌNH DUYỆT CHẶN</span>
            </div>
            <div style="font-size: 0.74rem; line-height: 1.5; color: #e2e8f0;">
              Để thiết bị tự động lấy tọa độ ngôi nhà qua vệ tinh GPS:
              <ol style="margin: 6px 0 6px 18px; padding: 0;">
                <li>Chạm vào biểu tượng <b>🔒</b> (hoặc <b>⚙️ Cài đặt trang web</b>) ở góc trái thanh địa chỉ web trên cùng.</li>
                <li>Chọn <b>Quyền (Permissions)</b> ➔ <b>Vị trí (Location)</b> ➔ Chọn <b>Cho phép (Allow)</b>.</li>
                <li>Nhấn nút <b>"🔄 Thử Lại GPS"</b> bên dưới hoặc kéo vuốt để tải lại trang.</li>
              </ol>
            </div>
          </div>
        `;
      }
    }

    modalBox.innerHTML = `
      <div class="lakinh-modal-overlay" id="modal-search-overlay">
        <div class="lakinh-glass-panel lakinh-modal-dialog">
          <div class="lakinh-modal-header">
            <div class="lakinh-modal-title">
              <span>🔍 ĐỊNH VỊ VỊ TRÍ KHẢO SÁT</span>
            </div>
            <button class="lakinh-modal-close" id="btn-close-search-modal">✕</button>
          </div>

          ${guideHtml}

          <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 6px;">
            Nhập địa chỉ nhà, tên đường, phường xã hoặc tọa độ (VD: 21.0285, 105.8542):
          </div>

          <form id="lakinh-search-form" class="lakinh-search-box" onsubmit="return false;">
            <input type="text" id="lakinh-search-input" class="lakinh-search-input" placeholder="VD: 123 Hoàn Kiếm, Hà Nội..." autocomplete="off">
            <button type="submit" id="lakinh-search-submit" class="lakinh-action-btn" style="width: auto; padding: 0 16px;">
              🚀 Tìm
            </button>
          </form>

          <div style="font-size: 0.72rem; color: #94a3b8; margin-bottom: 6px;">
            Hoặc chọn nhanh khu vực:
          </div>
          <div class="lakinh-quick-cities" id="lakinh-quick-cities-container">
            ${chipsHtml}
          </div>

          <!-- Danh sách kết quả tìm kiếm -->
          <div id="lakinh-search-results" style="max-height: 180px; overflow-y: auto; margin-bottom: 12px; display: none;"></div>

          <div style="background: rgba(56, 189, 248, 0.1); border: 1px dashed rgba(56, 189, 248, 0.35); border-radius: 8px; padding: 8px 10px; font-size: 0.73rem; color: #38bdf8; line-height: 1.4; margin-bottom: 12px;">
            💡 <b>Mẹo khảo sát:</b> Bạn cũng có thể dùng tay <b>chạm và kéo trượt bản đồ vệ tinh</b> bên dưới để đặt tâm chữ thập đỏ chính xác vào nóc nhà hoặc tâm thửa đất cần đo!
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <button type="button" id="btn-retry-gps" class="lakinh-action-btn primary" style="font-size: 0.75rem;">
              🔄 Thử Lại GPS
            </button>
            <button type="button" id="btn-manual-pan" class="lakinh-action-btn secondary" style="font-size: 0.75rem;">
              🗺️ Tự Kéo Bản Đồ
            </button>
          </div>
        </div>
      </div>
    `;

    // Events in modal
    const closeBtn = document.getElementById('btn-close-search-modal');
    if (closeBtn) closeBtn.onclick = () => document.getElementById('modal-search-overlay')?.remove();

    const btnLocSettings = document.getElementById('btn-open-location-settings');
    if (btnLocSettings) {
      btnLocSettings.onclick = () => {
        if (window.NativeBridge) {
          window.NativeBridge.postMessage(JSON.stringify({ action: 'openLocationSettings' }));
        }
      };
    }

    const btnAppSettings = document.getElementById('btn-open-app-settings');
    if (btnAppSettings) {
      btnAppSettings.onclick = () => {
        if (window.NativeBridge) {
          window.NativeBridge.postMessage(JSON.stringify({ action: 'openAppSettings' }));
        }
      };
    }

    const manualPanBtn = document.getElementById('btn-manual-pan');
    if (manualPanBtn) {
      manualPanBtn.onclick = () => {
        document.getElementById('modal-search-overlay')?.remove();
        showLaKinhToast('👉 Chạm giữ và kéo bản đồ để đặt tâm vào vị trí ngôi nhà');
      };
    }

    const retryGpsBtn = document.getElementById('btn-retry-gps');
    if (retryGpsBtn) {
      retryGpsBtn.onclick = () => {
        document.getElementById('modal-search-overlay')?.remove();
        getCurrentGPS();
      };
    }

    // Quick cities
    document.querySelectorAll('.lakinh-city-chip').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.getAttribute('data-city-idx'), 10);
        const city = quickCities[idx];
        if (city && mapInstance) {
          mapInstance.setView([city.lat, city.lng], 17, { animate: true });
          document.getElementById('modal-search-overlay')?.remove();
          showLaKinhToast(`📍 Đã chuyển đến ${city.name}`);
        }
      };
    });

    // Handle Search Form
    const searchForm = document.getElementById('lakinh-search-form');
    const searchInput = document.getElementById('lakinh-search-input');
    const resultsContainer = document.getElementById('lakinh-search-results');

    const executeSearch = async () => {
      const q = searchInput.value.trim();
      if (!q) return;

      // 1. Tọa độ trực tiếp
      const coordMatch = q.match(/^([-+]?[0-9]*\.?[0-9]+)[\s,]+([-+]?[0-9]*\.?[0-9]+)$/);
      if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lng = parseFloat(coordMatch[2]);
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          if (mapInstance) {
            mapInstance.setView([lat, lng], 19, { animate: true });
          }
          document.getElementById('modal-search-overlay')?.remove();
          showLaKinhToast(`🎯 Đã bay đến tọa độ: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
          return;
        }
      }

      // 2. Tìm kiếm geocoding qua Komoot Photon (CORS-friendly, no-key)
      resultsContainer.style.display = 'block';
      resultsContainer.innerHTML = '<div style="padding:10px;text-align:center;color:#94a3b8;font-size:0.75rem;">⏳ Đang tìm kiếm địa chỉ...</div>';

      try {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5`);
        const data = await res.json();

        if (!data || !data.features || data.features.length === 0) {
          resultsContainer.innerHTML = '<div style="padding:10px;text-align:center;color:#ef4444;font-size:0.75rem;">❌ Không tìm thấy địa chỉ này. Hãy thử nhập tên đường hoặc tọa độ.</div>';
          return;
        }

        let resHtml = '';
        data.features.forEach((feat) => {
          const props = feat.properties || {};
          const geom = feat.geometry || {};
          const coords = geom.coordinates || [];
          const lng = coords[0];
          const lat = coords[1];

          const name = props.name || props.street || q;
          const context = [props.district, props.city, props.state, props.country].filter(Boolean).join(', ');

          resHtml += `
            <div class="lakinh-search-item" style="padding:8px 10px;border-bottom:1px solid rgba(255,255,255,0.08);cursor:pointer;background:rgba(30,41,59,0.7);margin-bottom:4px;border-radius:6px;" data-lat="${lat}" data-lng="${lng}" data-name="${name}">
              <div style="font-weight:700;font-size:0.78rem;color:#38bdf8;">📍 ${name}</div>
              <div style="font-size:0.68rem;color:#cbd5e1;margin-top:2px;">${context}</div>
            </div>
          `;
        });

        resultsContainer.innerHTML = resHtml;

        resultsContainer.querySelectorAll('.lakinh-search-item').forEach(item => {
          item.onclick = () => {
            const lat = parseFloat(item.getAttribute('data-lat'));
            const lng = parseFloat(item.getAttribute('data-lng'));
            const placeName = item.getAttribute('data-name');
            if (mapInstance && !isNaN(lat) && !isNaN(lng)) {
              mapInstance.setView([lat, lng], 19, { animate: true });
              document.getElementById('modal-search-overlay')?.remove();
              showLaKinhToast(`🎯 Đã chuyển đến: ${placeName}`);
            }
          };
        });
      } catch (err) {
        console.error('Search geocoding error:', err);
        resultsContainer.innerHTML = '<div style="padding:10px;text-align:center;color:#f59e0b;font-size:0.75rem;">⚠️ Lỗi kết nối dịch vụ tìm kiếm địa chỉ. Bạn có thể tự kéo bản đồ đến vị trí mong muốn.</div>';
      }
    };

    if (searchForm) {
      searchForm.onsubmit = (e) => {
        e.preventDefault();
        executeSearch();
      };
    }
  }

  // Lưu & Mở hồ sơ
  function saveCurrentProject() {
    const name = prompt('Nhập tên công trình / thửa đất:', `Khảo sát ${new Date().toLocaleDateString('vi-VN')}`);
    if (!name) return;

    const record = {
      id: 'lakinh_' + Date.now(),
      name: name,
      date: new Date().toISOString(),
      lat: state.centerCoords[0],
      lng: state.centerCoords[1],
      rotation: state.rotation,
      elevation: state.centerElevation,
      declination: state.declination
    };

    try {
      const list = JSON.parse(localStorage.getItem('neta_lakinh_projects') || '[]');
      list.unshift(record);
      localStorage.setItem('neta_lakinh_projects', JSON.stringify(list));
      showLaKinhToast('✅ Đã lưu hồ sơ khảo sát!');
      closeBottomSheet();
    } catch (e) {
      showLaKinhToast('❌ Lỗi khi lưu vào bộ nhớ máy');
    }
  }

  function openProjectsModal() {
    const modalBox = document.getElementById('lakinh-modal-container');
    if (!modalBox) return;

    const list = JSON.parse(localStorage.getItem('neta_lakinh_projects') || '[]');
    let itemsHtml = '';

    if (list.length === 0) {
      itemsHtml = '<div style="text-align:center;padding:20px;color:#94a3b8;font-size:0.75rem;">Chưa có hồ sơ khảo sát nào được lưu.</div>';
    } else {
      list.forEach((item, idx) => {
        itemsHtml += `
          <div style="background:rgba(30,41,59,0.7);border:1px solid rgba(245,176,65,0.2);border-radius:8px;padding:8px 10px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-weight:700;font-size:0.78rem;color:#f5b041;">${item.name}</div>
              <div style="font-size:0.68rem;color:#cbd5e1;margin-top:2px;">
                ${item.lat.toFixed(6)}, ${item.lng.toFixed(6)} • ${item.rotation.toFixed(1)}° • ${new Date(item.date).toLocaleDateString('vi-VN')}
              </div>
            </div>
            <div style="display:flex;gap:4px;">
              <button class="lakinh-step-btn" style="padding:4px 8px;" onclick="window.NetaLaKinhView.loadProject(${idx})">Mở</button>
              <button class="lakinh-step-btn" style="padding:4px 8px;color:#ef4444;" onclick="window.NetaLaKinhView.deleteProject(${idx})">Xóa</button>
            </div>
          </div>
        `;
      });
    }

    modalBox.innerHTML = `
      <div class="lakinh-modal-overlay" id="modal-projects-overlay">
        <div class="lakinh-glass-panel lakinh-modal-dialog">
          <div class="lakinh-modal-header">
            <div class="lakinh-modal-title">📁 HỒ SƠ KHẢO SÁT ĐÃ LƯU</div>
            <button class="lakinh-modal-close" onclick="document.getElementById('modal-projects-overlay').remove()">✕</button>
          </div>
          <div style="max-height: 50vh; overflow-y: auto;">
            ${itemsHtml}
          </div>
          <button class="lakinh-action-btn secondary" style="margin-top:10px;" onclick="document.getElementById('modal-projects-overlay').remove()">Đóng</button>
        </div>
      </div>
    `;
  }

  function loadProject(idx) {
    const list = JSON.parse(localStorage.getItem('neta_lakinh_projects') || '[]');
    const item = list[idx];
    if (!item) return;

    document.getElementById('modal-projects-overlay')?.remove();
    if (mapInstance) {
      mapInstance.setView([item.lat, item.lng], 19);
      updateRotationDisplay(item.rotation);
      showLaKinhToast(`Đã mở hồ sơ: ${item.name}`);
    }
  }

  function deleteProject(idx) {
    if (!confirm('Bạn có chắc muốn xóa hồ sơ này?')) return;
    const list = JSON.parse(localStorage.getItem('neta_lakinh_projects') || '[]');
    list.splice(idx, 1);
    localStorage.setItem('neta_lakinh_projects', JSON.stringify(list));
    openProjectsModal();
  }

  function exportKML() {
    if (!global.NetaLaKinhEngine) return;
    const kml = global.NetaLaKinhEngine.generateKML('Khao_Sat_La_Kinh', state.centerCoords[0], state.centerCoords[1], state.rotation);
    const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LaKinh_Overlay_${Math.round(state.rotation)}deg.kml`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
    showLaKinhToast('📥 Đã tạo file KML Google Earth!');
  }

  function showLaKinhToast(msg) {
    if (typeof global.showToast === 'function') {
      global.showToast(msg);
    } else {
      console.log(msg);
    }
  }

  // Gán sự kiện
  function bindLaKinhEvents() {
    // 1. HUD Pill chạm để mở thẻ chi tiết
    const hudPill = document.getElementById('lakinh-hud-pill');
    const hudCard = document.getElementById('lakinh-hud-detail-card');
    const hudArrow = document.getElementById('hud-pill-arrow');

    if (hudPill && hudCard) {
      hudPill.addEventListener('click', () => {
        state.isHudDetailOpen = !state.isHudDetailOpen;
        hudCard.style.display = state.isHudDetailOpen ? 'block' : 'none';
        if (hudArrow) hudArrow.textContent = state.isHudDetailOpen ? '▴' : '▾';
        if (state.isHudDetailOpen) {
          updateRotationDisplay(state.rotation);
        }
      });
    }

    // Đóng thẻ chi tiết và dropdown tìm kiếm khi chạm vào bản đồ
    if (mapInstance) {
      mapInstance.on('click', () => {
        if (state.isHudDetailOpen && hudCard) {
          state.isHudDetailOpen = false;
          hudCard.style.display = 'none';
          if (hudArrow) hudArrow.textContent = '▾';
        }
        const dropdown = document.getElementById('lakinh-search-dropdown');
        if (dropdown) dropdown.style.display = 'none';
        const searchWrap = document.getElementById('lakinh-search-bar-wrap');
        if (searchWrap) searchWrap.style.display = 'none';
      });
    }

    // 2. Nút Bay Về Vị Trí Hiện Tại (Floating FAB & Bottom Dock) - Phản hồi ngay lập tức
    const btnMyLocation = document.getElementById('lakinh-btn-my-location');
    if (btnMyLocation) {
      btnMyLocation.addEventListener('click', (e) => {
        e.stopPropagation();
        getCurrentGPS(false);
      });
    }

    const dockSensor = document.getElementById('lakinh-dock-sensor');
    if (dockSensor) {
      dockSensor.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCompassSensor();
      });
    }

    const dockGps = document.getElementById('lakinh-dock-gps');
    if (dockGps) {
      dockGps.addEventListener('click', (e) => {
        e.stopPropagation();
        getCurrentGPS(false);
      });
    }

    const dockDem = document.getElementById('lakinh-dock-dem');
    if (dockDem) {
      dockDem.addEventListener('click', (e) => {
        e.stopPropagation();
        scanElevationAndTiers();
      });
    }

    const dockHkdq = document.getElementById('lakinh-dock-hkdq');
    if (dockHkdq) {
      dockHkdq.addEventListener('click', (e) => {
        e.stopPropagation();
        openHKDQModal();
      });
    }

    const quickHkdq = document.getElementById('lakinh-hkdq-quick-strip');
    if (quickHkdq) {
      quickHkdq.addEventListener('click', (e) => {
        e.stopPropagation();
        openHKDQModal();
      });
    }

    const hudRowTamHop = document.getElementById('hud-row-tamhop');
    if (hudRowTamHop) {
      hudRowTamHop.addEventListener('click', (e) => {
        e.stopPropagation();
        openTamHopModal();
      });
    }

    const btnQuickTamHop = document.getElementById('lakinh-btn-tam-hop');
    if (btnQuickTamHop) {
      btnQuickTamHop.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTamHopLayer();
      });
    }

    const btnThCollapse = document.getElementById('btn-tamhop-hud-collapse');
    if (btnThCollapse) {
      btnThCollapse.addEventListener('click', () => {
        state.isTamHopHudCollapsed = !state.isTamHopHudCollapsed;
        const hud = document.getElementById('lakinh-tamhop-floating-hud');
        const hudBody = document.getElementById('tamhop-hud-body');
        const hudFooter = document.querySelector('.tamhop-hud-footer');
        const hudCompact = document.getElementById('tamhop-hud-compact-summary');
        if (hud) hud.classList.toggle('is-collapsed', state.isTamHopHudCollapsed);
        if (hudBody) hudBody.style.display = state.isTamHopHudCollapsed ? 'none' : 'grid';
        if (hudFooter) hudFooter.style.display = state.isTamHopHudCollapsed ? 'none' : 'block';
        if (hudCompact) hudCompact.style.display = state.isTamHopHudCollapsed ? 'flex' : 'none';
        btnThCollapse.textContent = state.isTamHopHudCollapsed ? '+ Mở rộng' : '– Thu gọn';
      });
    }

    const btnThClose = document.getElementById('btn-tamhop-hud-close');
    if (btnThClose) {
      btnThClose.addEventListener('click', () => {
        toggleTamHopLayer(false);
      });
    }

    const btnThConfig = document.getElementById('btn-tamhop-hud-config');
    if (btnThConfig) {
      btnThConfig.addEventListener('click', () => {
        openTamHopModal();
      });
    }

    const btnThOpenModal = document.getElementById('btn-tamhop-hud-open-modal');
    if (btnThOpenModal) {
      btnThOpenModal.addEventListener('click', () => {
        openTamHopModal();
      });
    }

    ['hud-row-hkdq-que', 'hud-row-hkdq-hao', 'hud-row-hkdq-badges'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          openHKDQModal();
        });
      }
    });

    const dockTools = document.getElementById('lakinh-dock-tools');
    if (dockTools) {
      dockTools.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleBottomSheet();
      });
    }

    // 3. Quản lý Bảng Điều Khiển La Kinh: Hỗ trợ vuốt xuống để thu gọn nhanh
    const sheet = document.getElementById('lakinh-bottom-sheet');
    if (sheet) {

      // Vuốt xuống trên thanh gạt hoặc tiêu đề bảng điều khiển để thu gọn nhanh
      const sheetHandle = document.getElementById('sheet-handle');
      const sheetHeader = sheet.querySelector('.sheet-header-row');
      [sheetHandle, sheetHeader].forEach(el => {
        if (!el) return;
        let startY = 0;
        el.addEventListener('touchstart', (e) => {
          if (e.touches && e.touches[0]) startY = e.touches[0].clientY;
        }, { passive: true });
        el.addEventListener('touchend', (e) => {
          if (e.changedTouches && e.changedTouches[0]) {
            const dy = e.changedTouches[0].clientY - startY;
            if (dy > 28) {
              closeBottomSheet();
              showLaKinhToast('Đã thu gọn bảng điều khiển');
            }
          }
        }, { passive: true });
      });
    }

    const sheetCloseBtn = document.getElementById('sheet-close-btn');
    if (sheetCloseBtn) sheetCloseBtn.addEventListener('click', closeBottomSheet);

    const sheetHandle = document.getElementById('sheet-handle');
    if (sheetHandle) sheetHandle.addEventListener('click', closeBottomSheet);

    // Chuyển đổi mẫu Đĩa La Kinh / Thước Lập Cực
    const btnPlateThuoc = document.getElementById('btn-plate-thuoc');
    const btnPlateTrans = document.getElementById('btn-plate-trans');
    const btnPlateGold = document.getElementById('btn-plate-gold');
    const disc = document.getElementById('lakinh-disc');
    const backdropCircle = document.getElementById('lakinh-backdrop-circle');

    const setPlate = (type) => {
      state.activePlate = type;
      if (disc) {
        disc.src = getPlateSrc(type);
        if (type === 'thuoc_lap_cuc') {
          showLaKinhToast('📄 Đã đổi sang: Bản Giấy Trắng Cổ Điển');
        } else if (type === 'gold') {
          showLaKinhToast('✨ Đã đổi sang: Thước Lập Cực Dạ Quang Vàng Kim (Chuyên Vệ Tinh)');
        } else {
          showLaKinhToast('💎 Đã đổi sang: Thước Lập Cực Mica Trong Suốt');
        }
      }
      if (btnPlateThuoc) {
        btnPlateThuoc.classList.toggle('active', type === 'thuoc_lap_cuc');
        btnPlateThuoc.style.color = type === 'thuoc_lap_cuc' ? '#38bdf8' : '';
        btnPlateThuoc.style.fontWeight = type === 'thuoc_lap_cuc' ? '700' : '';
      }
      if (btnPlateTrans) {
        btnPlateTrans.classList.toggle('active', type === 'thuoc_trans');
        btnPlateTrans.style.color = type === 'thuoc_trans' ? '#38bdf8' : '';
        btnPlateTrans.style.fontWeight = type === 'thuoc_trans' ? '700' : '';
      }
      if (btnPlateGold) {
        btnPlateGold.classList.toggle('active', type === 'gold');
        btnPlateGold.style.color = type === 'gold' ? '#fbbf24' : '';
        btnPlateGold.style.fontWeight = type === 'gold' ? '700' : '';
      }
    };

    if (btnPlateThuoc) btnPlateThuoc.addEventListener('click', () => setPlate('thuoc_lap_cuc'));
    if (btnPlateTrans) btnPlateTrans.addEventListener('click', () => setPlate('thuoc_trans'));
    if (btnPlateGold) btnPlateGold.addEventListener('click', () => setPlate('gold'));

    // Sliders: Độ mờ nền lót độc lập (0% = xuyên thấu 100%, 35% = kính mờ, 85% = nền sáng)
    const sBgOpacity = document.getElementById('sheet-slider-bg-opacity');
    const valBgOpacity = document.getElementById('sheet-val-bg-opacity');
    const btnBg0 = document.getElementById('btn-bg-0');
    const btnBg35 = document.getElementById('btn-bg-35');
    const btnBg85 = document.getElementById('btn-bg-85');

    const updateBgOpacity = (val) => {
      state.bgOpacity = Math.max(0.0, Math.min(1.0, val / 100.0));
      if (backdropCircle) {
        backdropCircle.style.opacity = state.bgOpacity;
      }
      if (sBgOpacity) sBgOpacity.value = Math.round(state.bgOpacity * 100);
      if (valBgOpacity) valBgOpacity.textContent = `${Math.round(state.bgOpacity * 100)}%`;

      if (btnBg0) btnBg0.classList.toggle('active', Math.round(state.bgOpacity * 100) === 0);
      if (btnBg35) btnBg35.classList.toggle('active', Math.round(state.bgOpacity * 100) === 35);
      if (btnBg85) btnBg85.classList.toggle('active', Math.round(state.bgOpacity * 100) === 85);
    };

    if (sBgOpacity) {
      sBgOpacity.addEventListener('input', (e) => {
        updateBgOpacity(parseFloat(e.target.value));
      });
    }

    if (btnBg0) btnBg0.addEventListener('click', () => {
      updateBgOpacity(0);
      showLaKinhToast('💎 Nền 100% trong suốt: Thấy trọn vẹn địa hình bên dưới');
    });
    if (btnBg35) btnBg35.addEventListener('click', () => {
      updateBgOpacity(35);
      showLaKinhToast('🌫️ Nền kính mờ 35%: Vừa thấy địa hình vừa rõ chữ');
    });
    if (btnBg85) btnBg85.addEventListener('click', () => {
      updateBgOpacity(85);
      showLaKinhToast('🎯 Nền sáng 85%: Tương phản rõ nét tối đa');
    });

    const sSize = document.getElementById('sheet-slider-size');
    const valSize = document.getElementById('sheet-val-size');
    const container = document.getElementById('lakinh-overlay-container');

    const updateSize = (newSize) => {
      state.size = newSize;
      if (container) {
        container.style.width = `${state.size}px`;
        container.style.height = `${state.size}px`;
      }
      if (sSize) sSize.value = state.size;
      if (valSize) valSize.textContent = `${state.size} px`;
    };

    if (sSize) {
      sSize.addEventListener('input', (e) => {
        updateSize(parseInt(e.target.value, 10));
      });
    }

    const btnSizeFits = [
      { id: 'btn-size-fit', size: defaultSize, toast: '📱 Kích thước chuẩn màn hình (1x)' },
      { id: 'btn-size-15x', size: Math.round(defaultSize * 1.5), toast: '🔍 Phóng đại 1.5x: Đọc rõ các vòng phân kim' },
      { id: 'btn-size-2x', size: Math.min(1400, Math.round(defaultSize * 2.0)), toast: '🔬 Soi chi tiết 2x: Đọc siêu nét từng hào quẻ & 36 tầng' },
      { id: 'btn-size-max', size: 1000, toast: '👑 Kích thước cực đại 1000px: Độ phân giải HD tối đa' }
    ];
    btnSizeFits.forEach(item => {
      const b = document.getElementById(item.id);
      if (b) {
        b.addEventListener('click', () => {
          updateSize(item.size);
          btnSizeFits.forEach(it => {
            const ob = document.getElementById(it.id);
            if (ob) ob.classList.toggle('active', it.id === item.id);
          });
          showLaKinhToast(item.toast);
        });
      }
    });

    const sRot = document.getElementById('sheet-slider-rotation');
    if (sRot) {
      sRot.addEventListener('input', (e) => {
        updateRotationDisplay(parseFloat(e.target.value));
      });
    }

    // Step buttons
    const bindStep = (id, delta) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          updateRotationDisplay(state.rotation + delta);
        });
      }
    };
    const btnRotZero = document.getElementById('btn-rot-zero');
    if (btnRotZero) {
      btnRotZero.addEventListener('click', () => {
        updateRotationDisplay(0.0);
        showLaKinhToast('🧭 Đã quay về Chuẩn Bắc (0°), khớp hướng Bắc bản đồ vệ tinh');
      });
    }

    bindStep('btn-rot-m5', -5);
    bindStep('btn-rot-m1', -1);
    bindStep('btn-rot-p1', 1);
    bindStep('btn-rot-p5', 5);

    // Zoom buttons
    const btnZoomTieu = document.getElementById('btn-zoom-tieu');
    if (btnZoomTieu) btnZoomTieu.addEventListener('click', () => {
      if (mapInstance) mapInstance.setZoom(20);
      closeBottomSheet();
    });

    const btnZoomTrung = document.getElementById('btn-zoom-trung');
    if (btnZoomTrung) btnZoomTrung.addEventListener('click', () => {
      if (mapInstance) mapInstance.setZoom(17);
      closeBottomSheet();
    });

    const btnZoomDai = document.getElementById('btn-zoom-dai');
    if (btnZoomDai) btnZoomDai.addEventListener('click', () => {
      if (mapInstance) mapInstance.setZoom(14);
      closeBottomSheet();
    });

    // Sheet actions
    const btnLock = document.getElementById('sheet-btn-lock');
    if (btnLock) btnLock.addEventListener('click', toggleLockHeading);

    // ================= 3.1. SỰ KIỆN MẶT BẰNG BẢN VẼ KIẾN TRÚC =================
    const inputPlanFile = document.getElementById('lakinh-input-plan-file');
    const btnPlanUpload = document.getElementById('btn-plan-upload');
    const btnPlanRemove = document.getElementById('btn-plan-remove');
    const btnPlanQuick = document.getElementById('lakinh-btn-plan-quick');
    const btnPlanPanDone = document.getElementById('btn-plan-pan-done');

    const triggerFloorPlanPicker = () => {
      if (window.NativeBridge && typeof window.NativeBridge.postMessage === 'function') {
        window.NativeBridge.postMessage(JSON.stringify({ action: 'pickFloorPlan' }));
      } else if (inputPlanFile) {
        inputPlanFile.click();
      }
    };

    if (btnPlanUpload) {
      btnPlanUpload.addEventListener('click', triggerFloorPlanPicker);
    }

    if (btnPlanQuick) {
      btnPlanQuick.addEventListener('click', () => {
        if (!state.planImageSrc) {
          triggerFloorPlanPicker();
        } else {
          openBottomSheet();
          const el = document.getElementById('lakinh-plan-controls-wrap');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    if (inputPlanFile) {
      inputPlanFile.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          loadFloorPlanFile(file);
          inputPlanFile.value = '';
        }
      });
    }

    if (btnPlanRemove) {
      btnPlanRemove.addEventListener('click', removeFloorPlan);
    }

    // ================= 3.1. SỰ KIỆN MẶT BẰNG BẢN VẼ KIẾN TRÚC =================
    // Nút nổi Floating Bar trên màn hình
    const flBtnScaleMinus = document.getElementById('fl-btn-scale-minus');
    if (flBtnScaleMinus) {
      flBtnScaleMinus.addEventListener('click', (e) => {
        e.stopPropagation();
        state.planScale = Math.max(0.2, Math.round((state.planScale - 0.15) * 100) / 100);
        updateFloorPlanTransform();
        saveFloorPlanState();
        showLaKinhToast(`🔍 Thu nhỏ: ${Math.round(state.planScale * 100)}%`);
      });
    }

    const flBtnScalePlus = document.getElementById('fl-btn-scale-plus');
    if (flBtnScalePlus) {
      flBtnScalePlus.addEventListener('click', (e) => {
        e.stopPropagation();
        state.planScale = Math.min(5.0, Math.round((state.planScale + 0.15) * 100) / 100);
        updateFloorPlanTransform();
        saveFloorPlanState();
        showLaKinhToast(`🔍 Phóng to: ${Math.round(state.planScale * 100)}%`);
      });
    }

    const flScaleVal = document.getElementById('fl-plan-scale-val');
    if (flScaleVal) {
      flScaleVal.addEventListener('click', (e) => {
        e.stopPropagation();
        state.planScale = 1.0;
        updateFloorPlanTransform();
        saveFloorPlanState();
        showLaKinhToast('📱 Đã đưa về tỉ lệ chuẩn 100%');
      });
    }

    const flBtnPan = document.getElementById('fl-btn-plan-pan');
    if (flBtnPan) {
      flBtnPan.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlanPanMode();
      });
    }

    const flBtnRotMatch = document.getElementById('fl-btn-rot-match');
    if (flBtnRotMatch) {
      flBtnRotMatch.addEventListener('click', (e) => {
        e.stopPropagation();
        state.planRotation = state.rotation;
        updateFloorPlanTransform();
        saveFloorPlanState();
        showLaKinhToast(`🧭 Đã xoay bản vẽ khớp hướng nhà (${state.rotation.toFixed(1)}°)`);
      });
    }

    const flBtnPlanCenter = document.getElementById('fl-btn-plan-center');
    if (flBtnPlanCenter) {
      flBtnPlanCenter.addEventListener('click', (e) => {
        e.stopPropagation();
        state.planOffsetX = 0;
        state.planOffsetY = 0;
        updateFloorPlanTransform();
        saveFloorPlanState();
        showLaKinhToast('🎯 Đã đưa mặt bằng về chính tâm La Kinh');
      });
    }

    const flBtnPlanOpacity = document.getElementById('fl-btn-plan-opacity');
    if (flBtnPlanOpacity) {
      flBtnPlanOpacity.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.planOpacity <= 0.4) state.planOpacity = 0.65;
        else if (state.planOpacity <= 0.7) state.planOpacity = 0.85;
        else state.planOpacity = 0.35;
        updateFloorPlanTransform();
        saveFloorPlanState();
        showLaKinhToast(`👁️ Độ mờ mặt bằng: ${Math.round(state.planOpacity * 100)}%`);
      });
    }

    if (btnPlanPanDone) {
      btnPlanPanDone.addEventListener('click', (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        const banner = document.getElementById('lakinh-plan-pan-banner');
        if (banner) banner.style.display = 'none';
        state.isPlanPanActive = false;
        showLaKinhToast('Đã ẩn thanh công cụ mặt bằng. Mở lại trong Tiện ích.');
      });
    }


    // Các điều khiển trong Bottom Sheet
    const sPlanScale = document.getElementById('sheet-slider-plan-scale');
    if (sPlanScale) {
      sPlanScale.addEventListener('input', (e) => {
        state.planScale = Math.max(0.2, Math.min(5.0, parseFloat(e.target.value) / 100.0));
        updateFloorPlanTransform();
        saveFloorPlanState();
      });
    }

    const btnScaleStepM10 = document.getElementById('btn-scale-step-m10');
    if (btnScaleStepM10) {
      btnScaleStepM10.addEventListener('click', () => {
        state.planScale = Math.max(0.2, Math.round((state.planScale - 0.10) * 100) / 100);
        updateFloorPlanTransform();
        saveFloorPlanState();
      });
    }

    const btnScaleStepP10 = document.getElementById('btn-scale-step-p10');
    if (btnScaleStepP10) {
      btnScaleStepP10.addEventListener('click', () => {
        state.planScale = Math.min(5.0, Math.round((state.planScale + 0.10) * 100) / 100);
        updateFloorPlanTransform();
        saveFloorPlanState();
      });
    }

    const scalePresets = [
      { id: 'btn-scale-50', scale: 0.5 },
      { id: 'btn-scale-100', scale: 1.0 },
      { id: 'btn-scale-150', scale: 1.5 },
      { id: 'btn-scale-200', scale: 2.0 },
      { id: 'btn-scale-300', scale: 3.0 }
    ];
    scalePresets.forEach(item => {
      const btn = document.getElementById(item.id);
      if (btn) {
        btn.addEventListener('click', () => {
          state.planScale = item.scale;
          updateFloorPlanTransform();
          saveFloorPlanState();
          scalePresets.forEach(it => {
            const b = document.getElementById(it.id);
            if (b) b.classList.toggle('active', it.id === item.id);
          });
        });
      }
    });

    const sPlanRot = document.getElementById('sheet-slider-plan-rot');
    if (sPlanRot) {
      sPlanRot.addEventListener('input', (e) => {
        state.planRotation = parseFloat(e.target.value);
        updateFloorPlanTransform();
        saveFloorPlanState();
      });
    }

    const btnPlanRotMatch = document.getElementById('btn-plan-rot-match');
    if (btnPlanRotMatch) {
      btnPlanRotMatch.addEventListener('click', () => {
        state.planRotation = state.rotation;
        updateFloorPlanTransform();
        saveFloorPlanState();
        showLaKinhToast(`🧭 Đã xoay bản vẽ khớp hướng nhà (${state.rotation.toFixed(1)}°)`);
      });
    }

    const btnPlanRotZero = document.getElementById('btn-plan-rot-zero');
    if (btnPlanRotZero) {
      btnPlanRotZero.addEventListener('click', () => {
        state.planRotation = 0.0;
        updateFloorPlanTransform();
        saveFloorPlanState();
        showLaKinhToast('🧭 Đã quay bản vẽ về Chuẩn Bắc (0°)');
      });
    }

    const bindPlanRotStep = (id, delta) => {
      const b = document.getElementById(id);
      if (b) {
        b.addEventListener('click', () => {
          state.planRotation = ((state.planRotation + delta) % 360 + 360) % 360;
          state.planRotation = Math.round(state.planRotation * 10) / 10;
          updateFloorPlanTransform();
          saveFloorPlanState();
        });
      }
    };
    bindPlanRotStep('btn-plan-rot-m1', -1);
    bindPlanRotStep('btn-plan-rot-p1', 1);

    const sPlanOpacity = document.getElementById('sheet-slider-plan-opacity');
    if (sPlanOpacity) {
      sPlanOpacity.addEventListener('input', (e) => {
        state.planOpacity = Math.max(0.1, Math.min(1.0, parseFloat(e.target.value) / 100.0));
        updateFloorPlanTransform();
        saveFloorPlanState();
      });
    }

    const btnPlanPan = document.getElementById('sheet-btn-plan-pan');
    if (btnPlanPan) {
      btnPlanPan.addEventListener('click', () => togglePlanPanMode());
    }

    const btnPlanResetCenter = document.getElementById('sheet-btn-plan-reset-center');
    if (btnPlanResetCenter) {
      btnPlanResetCenter.addEventListener('click', () => {
        state.planOffsetX = 0;
        state.planOffsetY = 0;
        updateFloorPlanTransform();
        saveFloorPlanState();
        showLaKinhToast('🎯 Đã đưa mặt bằng về chính tâm La Kinh (0, 0)');
      });
    }

    const bindPlanShift = (id, dx, dy) => {
      const b = document.getElementById(id);
      if (b) {
        b.addEventListener('click', () => {
          state.planOffsetX += dx;
          state.planOffsetY += dy;
          updateFloorPlanTransform();
          saveFloorPlanState();
        });
      }
    };
    bindPlanShift('btn-plan-shift-left', -5, 0);
    bindPlanShift('btn-plan-shift-right', 5, 0);
    bindPlanShift('btn-plan-shift-up', 0, -5);
    bindPlanShift('btn-plan-shift-down', 0, 5);

    // Kéo rê & Thu phóng 2 ngón tay (Pinch-to-Zoom & Pan) khi ở chế độ Mặt Bằng
    const lkContainer = document.getElementById('view-lakinh');
    const activePointers = new Map();
    let isPinching = false;
    let initialPinchDist = 0;
    let initialPinchScale = 1.0;
    let initialPinchAngle = 0;
    let initialPinchRot = 0.0;
    let isPlanDragging = false;
    let planDragStartX = 0;
    let planDragStartY = 0;
    let planDragInitOx = 0;
    let planDragInitOy = 0;

    if (lkContainer) {
      lkContainer.addEventListener('pointerdown', (e) => {
        if (!state.planImageSrc) return;
        if (!state.isPlanPanActive && !e.shiftKey) return;
        if (e.target.closest('#lakinh-bottom-sheet, #lakinh-bottom-dock, #lakinh-top-panel, #lakinh-plan-pan-banner, .lakinh-floating-plan-bar, button, input')) return;

        activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (activePointers.size === 1) {
          isPlanDragging = true;
          isPinching = false;
          planDragStartX = e.clientX;
          planDragStartY = e.clientY;
          planDragInitOx = state.planOffsetX;
          planDragInitOy = state.planOffsetY;
        } else if (activePointers.size === 2) {
          isPlanDragging = false;
          isPinching = true;
          const pts = Array.from(activePointers.values());
          initialPinchDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
          initialPinchScale = state.planScale;
          initialPinchAngle = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x) * 180 / Math.PI;
          initialPinchRot = state.planRotation;
        }

        try { lkContainer.setPointerCapture(e.pointerId); } catch (_) {}
        e.stopPropagation();
      });

      window.addEventListener('pointermove', (e) => {
        if (!activePointers.has(e.pointerId)) return;
        activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (isPinching && activePointers.size >= 2) {
          const pts = Array.from(activePointers.values());
          const curDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
          if (initialPinchDist > 10) {
            const factor = curDist / initialPinchDist;
            state.planScale = Math.max(0.2, Math.min(5.0, Math.round(initialPinchScale * factor * 100) / 100));
            const curAngle = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x) * 180 / Math.PI;
            const diffAngle = curAngle - initialPinchAngle;
            state.planRotation = Math.round(((initialPinchRot + diffAngle) % 360 + 360) % 360 * 10) / 10;
            updateFloorPlanTransform();
          }
          e.stopPropagation();
        } else if (isPlanDragging && activePointers.size === 1) {
          const dx = e.clientX - planDragStartX;
          const dy = e.clientY - planDragStartY;
          state.planOffsetX = Math.round(panDragInitOx + dx);
          state.planOffsetY = Math.round(panDragInitOy + dy);
          updateFloorPlanTransform();
          e.stopPropagation();
        }
      });

      const endPlanDrag = (e) => {
        if (activePointers.has(e.pointerId)) {
          activePointers.delete(e.pointerId);
          try { lkContainer.releasePointerCapture(e.pointerId); } catch (_) {}
        }
        if (activePointers.size === 0) {
          if (isPlanDragging || isPinching) {
            saveFloorPlanState();
          }
          isPlanDragging = false;
          isPinching = false;
        } else if (activePointers.size === 1) {
          isPinching = false;
          isPlanDragging = true;
          const rem = Array.from(activePointers.values())[0];
          planDragStartX = rem.x;
          planDragStartY = rem.y;
          planDragInitOx = state.planOffsetX;
          planDragInitOy = state.planOffsetY;
        }
      };

      window.addEventListener('pointerup', endPlanDrag);
      window.addEventListener('pointercancel', endPlanDrag);

      // Cuộn chuột trên Desktop để thu phóng mặt bằng
      lkContainer.addEventListener('wheel', (e) => {
        if (!state.planImageSrc) return;
        if (!state.isPlanPanActive && !e.ctrlKey) return;
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.1 : -0.1;
        state.planScale = Math.max(0.2, Math.min(5.0, Math.round((state.planScale + delta) * 100) / 100));
        updateFloorPlanTransform();
        saveFloorPlanState();
      }, { passive: false });
    }


    // ================= 3.2. SỰ KIỆN TIA NGẮM PHONG THỦY =================
    const btnRay = document.getElementById('sheet-btn-ray');
    const btnQuickRay = document.getElementById('lakinh-btn-ray-quick');
    const btnRayHudClose = document.getElementById('btn-ray-hud-close');

    const toggleSightingRay = () => {
      state.isRayActive = !state.isRayActive;
      if (state.isRayActive) {
        state.isRayHudCollapsed = false;
        if (state.rayAngle === null || state.rayAngle === undefined) {
          state.rayAngle = state.rotation;
        }
      }
      updateSightingRay();
      showLaKinhToast(state.isRayActive
        ? '🎯 Đã bật Tia Ngắm. Chạm điểm bất kỳ trên mặt bằng hoặc kéo thanh trượt để ngắm.'
        : 'Đã tắt tia ngắm');
    };

    const setRayHudTransparency = (transparent) => {
      const hud = document.getElementById('lakinh-ray-floating-hud');
      const mini = document.getElementById('lakinh-ray-mini-pill');
      if (hud) hud.classList.toggle('ray-hud-transparent', transparent);
      if (mini) mini.classList.toggle('ray-hud-transparent', transparent);
    };

    const turnOffRay = (e) => {
      e.stopPropagation();
      e.preventDefault();
      state.isRayActive = false;
      updateSightingRay();
      showLaKinhToast('Đã tắt tia ngắm');
    };

    const collapseRayHud = (e) => {
      e.stopPropagation();
      e.preventDefault();
      state.isRayHudCollapsed = true;
      updateSightingRay();
    };

    const expandRayHud = (e) => {
      e.stopPropagation();
      e.preventDefault();
      state.isRayHudCollapsed = false;
      updateSightingRay();
    };

    if (btnRay) btnRay.addEventListener('click', toggleSightingRay);
    if (btnQuickRay) btnQuickRay.addEventListener('click', toggleSightingRay);

    if (btnRayHudClose) {
      btnRayHudClose.addEventListener('click', turnOffRay);
      btnRayHudClose.addEventListener('touchend', turnOffRay);
    }

    const btnRayHudCollapse = document.getElementById('btn-ray-hud-collapse');
    if (btnRayHudCollapse) {
      btnRayHudCollapse.addEventListener('click', collapseRayHud);
      btnRayHudCollapse.addEventListener('touchend', collapseRayHud);
    }

    const bindRayMiniExpand = (id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', expandRayHud);
        el.addEventListener('touchend', expandRayHud);
      }
    };
    bindRayMiniExpand('btn-ray-mini-expand');
    bindRayMiniExpand('btn-ray-mini-expand-header');
    bindRayMiniExpand('ray-mini-hkdq-strip');

    const btnRayMiniClose = document.getElementById('btn-ray-mini-close');
    if (btnRayMiniClose) {
      btnRayMiniClose.addEventListener('click', turnOffRay);
      btnRayMiniClose.addEventListener('touchend', turnOffRay);
    }

    const btnRayOpenHkdq = document.getElementById('btn-ray-hud-open-hkdq');
    if (btnRayOpenHkdq) {
      btnRayOpenHkdq.addEventListener('click', (e) => {
        e.stopPropagation();
        const current = (state.rayAngle !== null && state.rayAngle !== undefined) ? state.rayAngle : state.rotation;
        openHKDQModal(current);
      });
    }

    const btnRayTrachCat = document.getElementById('btn-ray-hud-trachcat');
    if (btnRayTrachCat) {
      btnRayTrachCat.addEventListener('click', (e) => {
        e.stopPropagation();
        const current = (state.rayAngle !== null && state.rayAngle !== undefined) ? state.rayAngle : state.rotation;
        const sittingDeg = ((current + 180) % 360 + 360) % 360;
        if (typeof global.openTrachCatForSitting === 'function') {
          global.openTrachCatForSitting(sittingDeg, current);
        }
      });
    }

    const btnHudTrachCat = document.getElementById('btn-hud-trachcat');
    if (btnHudTrachCat) {
      btnHudTrachCat.addEventListener('click', (e) => {
        e.stopPropagation();
        const sittingDeg = ((state.rotation + 180) % 360 + 360) % 360;
        if (typeof global.openTrachCatForSitting === 'function') {
          global.openTrachCatForSitting(sittingDeg, state.rotation);
        }
      });
    }

    const sRayDeg = document.getElementById('sheet-slider-ray-deg');
    if (sRayDeg) {
      sRayDeg.addEventListener('input', (e) => {
        setRayHudTransparency(true);
        setRayAngle(parseFloat(e.target.value));
      });
      sRayDeg.addEventListener('change', () => {
        setRayHudTransparency(false);
      });
      sRayDeg.addEventListener('pointerup', () => {
        setRayHudTransparency(false);
      });
    }

    const bindRayStep = (id, delta) => {
      const b = document.getElementById(id);
      if (b) {
        b.addEventListener('click', () => {
          const current = (state.rayAngle !== null && state.rayAngle !== undefined) ? state.rayAngle : state.rotation;
          setRayAngle(current + delta);
        });
      }
    };
    bindRayStep('btn-ray-m5', -5);
    bindRayStep('btn-ray-m1', -1);
    bindRayStep('btn-ray-m01', -0.1);
    bindRayStep('btn-ray-p01', 0.1);
    bindRayStep('btn-ray-p1', 1);
    bindRayStep('btn-ray-p5', 5);

    // Gán góc nhanh cho tia ngắm
    const btnRaySnapHouse = document.getElementById('btn-ray-snap-house');
    if (btnRaySnapHouse) {
      btnRaySnapHouse.addEventListener('click', () => {
        setRayAngle(state.rotation);
        showLaKinhToast(`🎯 Tia ngắm khớp Chính Hướng Nhà (${state.rotation.toFixed(1)}°)`);
      });
    }

    const btnRaySnapNorth = document.getElementById('btn-ray-snap-north');
    if (btnRaySnapNorth) {
      btnRaySnapNorth.addEventListener('click', () => {
        setRayAngle(0.0);
        showLaKinhToast('🧭 Tia ngắm hướng Chuẩn Bắc (0.0°)');
      });
    }

    const btnRaySnapPerpLeft = document.getElementById('btn-ray-snap-perp-left');
    if (btnRaySnapPerpLeft) {
      btnRaySnapPerpLeft.addEventListener('click', () => {
        setRayAngle((state.rotation - 90 + 360) % 360);
        showLaKinhToast('📐 Tia ngắm vuông góc Tả (Bên Trái 90°)');
      });
    }

    const btnRaySnapPerpRight = document.getElementById('btn-ray-snap-perp-right');
    if (btnRaySnapPerpRight) {
      btnRaySnapPerpRight.addEventListener('click', () => {
        setRayAngle((state.rotation + 90) % 360);
        showLaKinhToast('📐 Tia ngắm vuông góc Hữu (Bên Phải 90°)');
      });
    }

    const btnRaySnapToa = document.getElementById('btn-ray-snap-toa');
    if (btnRaySnapToa) {
      btnRaySnapToa.addEventListener('click', () => {
        setRayAngle((state.rotation + 180) % 360);
        showLaKinhToast(`🔄 Tia ngắm đối diện Chính Tọa (${((state.rotation + 180) % 360).toFixed(1)}°)`);
      });
    }

    // Kéo rê điểm mục tiêu trên màn hình (Target Handle Drag)
    const targetHandle = document.getElementById('lakinh-ray-target-handle');
    if (targetHandle) {
      let isTargetDragging = false;
      targetHandle.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        isTargetDragging = true;
        setRayHudTransparency(true);
        try { targetHandle.setPointerCapture(e.pointerId); } catch (_) {}
      });

      const onTargetMove = (e) => {
        if (!isTargetDragging) return;
        e.stopPropagation();
        e.preventDefault();
        onAimRayAtPoint(e.clientX, e.clientY);
      };

      const endTargetDrag = (e) => {
        if (isTargetDragging) {
          isTargetDragging = false;
          setRayHudTransparency(false);
          try { targetHandle.releasePointerCapture(e.pointerId); } catch (_) {}
        }
      };

      window.addEventListener('pointermove', onTargetMove, { passive: false });
      window.addEventListener('pointerup', endTargetDrag);
      window.addEventListener('pointercancel', endTargetDrag);

      // Touch events fallback cho thiết bị di động
      targetHandle.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) {
          e.stopPropagation();
          isTargetDragging = true;
          setRayHudTransparency(true);
        }
      }, { passive: false });

      window.addEventListener('touchmove', (e) => {
        if (!isTargetDragging) return;
        if (e.touches && e.touches[0]) {
          onAimRayAtPoint(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: false });

      window.addEventListener('touchend', endTargetDrag);
      window.addEventListener('touchcancel', endTargetDrag);
    }

    // Chạm vào màn hình để đặt tia ngắm đi qua điểm chạm
    if (lkContainer) {
      lkContainer.addEventListener('click', (e) => {
        if (e.target.closest('#lakinh-bottom-sheet, #lakinh-bottom-dock, #lakinh-top-panel, #lakinh-hud-detail-card, #lakinh-btn-my-location, #lakinh-ray-target-handle, #lakinh-ray-floating-hud, #lakinh-ray-mini-pill, #lakinh-plan-pan-banner, .lakinh-float-btn, .sheet-control-group, input, button')) {
          return;
        }
        if (state.isRayActive && !state.isPlanPanActive) {
          onAimRayAtPoint(e.clientX, e.clientY);
        }
      });
    }

    // Khôi phục trạng thái bản vẽ và tia ngắm đã lưu
    restoreFloorPlanState();
    if (state.isRayActive) {
      updateSightingRay();
    }

    const chkAutoDec = document.getElementById('lakinh-chk-autodec');
    if (chkAutoDec) {
      chkAutoDec.addEventListener('change', () => {
        if (chkAutoDec.checked) {
          showLaKinhToast(`🧭 Đã bật bù từ thiên (Bắc Thực WMM: ${state.declination > 0 ? '+' : ''}${state.declination}°)`);
        } else {
          showLaKinhToast('🧭 Đã dùng Bắc Từ (Chuẩn kim La Kinh vật lý)');
        }
      });
    }

    const btnScanElev = document.getElementById('sheet-btn-scan-elev');
    if (btnScanElev) btnScanElev.addEventListener('click', scanElevationAndTiers);

    const btnTamHop = document.getElementById('sheet-btn-tam-hop');
    if (btnTamHop) {
      btnTamHop.addEventListener('click', (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        openTamHopModal();
      });
    }

    const btnHK = document.getElementById('sheet-btn-huyenkhong');
    if (btnHK) btnHK.addEventListener('click', openHuyenKhongModal);

    const btnHKDQ = document.getElementById('sheet-btn-hkdq');
    if (btnHKDQ) btnHKDQ.addEventListener('click', openHKDQModal);

    const btnCentroid = document.getElementById('sheet-btn-centroid');
    if (btnCentroid) {
      btnCentroid.addEventListener('click', () => {
        state.isTracingPlot = !state.isTracingPlot;
        closeBottomSheet();
        if (state.isTracingPlot) {
          state.polygonPoints = [];
          if (polygonLayerGroup) polygonLayerGroup.clearLayers();
          btnCentroid.innerHTML = '📐 Chạm các góc ranh đất...';
          showLaKinhToast('Chạm vào các đỉnh góc của thửa đất trên ảnh vệ tinh để tính tim đất');
        } else {
          btnCentroid.innerHTML = '📐 Vẽ Ranh Đất / Tìm Tim Nhà';
        }
      });
    }

    const btnSave = document.getElementById('sheet-btn-save');
    if (btnSave) btnSave.addEventListener('click', saveCurrentProject);

    const btnKML = document.getElementById('sheet-btn-kml');
    if (btnKML) btnKML.addEventListener('click', exportKML);

    // Khởi tạo thanh tìm kiếm trực tiếp
    initQuickSearchBar();

    // Top Strip buttons
    const btnSearch = document.getElementById('lakinh-btn-search');
    if (btnSearch) {
      btnSearch.addEventListener('click', () => {
        const inp = document.getElementById('lakinh-search-bar-input');
        if (inp) {
          inp.focus();
        }
      });
    }

    const btnLayer = document.getElementById('lakinh-btn-layer');
    if (btnLayer) btnLayer.addEventListener('click', switchMapLayer);

    const btnProjects = document.getElementById('lakinh-btn-projects');
    if (btnProjects) btnProjects.addEventListener('click', openProjectsModal);

    // KỲ MÔN CHIẾN LƯỢC JOEY YAP COMPENDIUM (PHASE 3) EVENTS
    bindQmdjStratEvents();
  }

  function toggleQmdjStrategicLayer(force) {
    if (typeof force === 'boolean') {
      state.isQmdjStratActive = force;
    } else {
      state.isQmdjStratActive = !state.isQmdjStratActive;
    }
    if (state.isQmdjStratActive) {
      state.isQmdjStratHudCollapsed = false;
    }
    updateQmdjStrategicLayer();
    showLaKinhToast(state.isQmdjStratActive
      ? '⚔️ Đã kích hoạt Lớp Chiến Lược Kỳ Môn Joey Yap trên La Kinh'
      : 'Đã tắt lớp chiến lược Kỳ Môn');
  }

  function openQmdjTimeModal() {
    const modalBox = document.getElementById('lakinh-modal-container');
    if (!modalBox) return;

    closeBottomSheet();

    let curDate = state.qmdjStratDate ? new Date(state.qmdjStratDate) : new Date();
    
    const pad = n => String(n).padStart(2, '0');
    const formatYMD = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const formatHM = d => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    const CAN_CHI_HOURS = [
      { chi: 'Tý', range: '23h - 01h', h: 0, m: 0, icon: '🐀' },
      { chi: 'Sửu', range: '01h - 03h', h: 2, m: 0, icon: '🐂' },
      { chi: 'Dần', range: '03h - 05h', h: 4, m: 0, icon: '🐅' },
      { chi: 'Mão', range: '05h - 07h', h: 6, m: 0, icon: '🐈' },
      { chi: 'Thìn', range: '07h - 09h', h: 8, m: 0, icon: '🐉' },
      { chi: 'Tỵ', range: '09h - 11h', h: 10, m: 0, icon: '🐍' },
      { chi: 'Ngọ', range: '11h - 13h', h: 12, m: 0, icon: '🐎' },
      { chi: 'Mùi', range: '13h - 15h', h: 14, m: 0, icon: '🐐' },
      { chi: 'Thân', range: '15h - 17h', h: 16, m: 0, icon: '🐒' },
      { chi: 'Dậu', range: '17h - 19h', h: 18, m: 0, icon: '🐓' },
      { chi: 'Tuất', range: '19h - 21h', h: 20, m: 0, icon: '🐕' },
      { chi: 'Hợi', range: '21h - 23h', h: 22, m: 0, icon: '🐖' }
    ];

    function getHourChi(h) {
      const MAP = [
        { chi: 'Tý', match: [23, 0] },
        { chi: 'Sửu', match: [1, 2] },
        { chi: 'Dần', match: [3, 4] },
        { chi: 'Mão', match: [5, 6] },
        { chi: 'Thìn', match: [7, 8] },
        { chi: 'Tỵ', match: [9, 10] },
        { chi: 'Ngọ', match: [11, 12] },
        { chi: 'Mùi', match: [13, 14] },
        { chi: 'Thân', match: [15, 16] },
        { chi: 'Dậu', match: [17, 18] },
        { chi: 'Tuất', match: [19, 20] },
        { chi: 'Hợi', match: [21, 22] }
      ];
      const found = MAP.find(item => item.match.includes(h));
      return found ? found.chi : 'Tý';
    }

    let tempDate = new Date(curDate);

    function renderModalContent() {
      const curH = tempDate.getHours();
      const activeChi = getHourChi(curH);

      let canChiDayStr = '';
      let canChiHourStr = '';
      let solarTermStr = '';
      let isDisharmony = false;

      if (global.NetaCalendarEngine) {
        const full = global.NetaCalendarEngine.getFullDayInfo(tempDate);
        if (full) {
          if (full.canChiDay) canChiDayStr = `${full.canChiDay.can} ${full.canChiDay.chi}`;
          if (full.canChiHour) canChiHourStr = `${full.canChiHour.can} ${full.canChiHour.chi}`;
        }
        if (typeof global.NetaCalendarEngine.getSolarTerm === 'function') {
          solarTermStr = global.NetaCalendarEngine.getSolarTerm(tempDate.getDate(), tempDate.getMonth() + 1, tempDate.getFullYear());
        }
      }

      if (global.JoeyYapQMDJEngine && typeof global.JoeyYapQMDJEngine.isDisharmonyHour === 'function' && canChiDayStr && canChiHourStr) {
        const dStem = canChiDayStr.split(' ')[0] || '';
        const hStem = canChiHourStr.split(' ')[0] || '';
        isDisharmony = global.JoeyYapQMDJEngine.isDisharmonyHour(dStem, hStem);
      }

      modalBox.innerHTML = `
        <div class="lakinh-modal-overlay" id="modal-qmdj-time-overlay">
          <div class="lakinh-glass-panel lakinh-modal-dialog qmdj-time-modal-dialog">
            <div class="lakinh-modal-header">
              <div class="lakinh-modal-title">
                🕒 ĐỔI GIỜ TÁC CHIẾN KỲ MÔN
              </div>
              <button class="lakinh-modal-close" id="btn-close-qmdj-time-modal">✕</button>
            </div>

            <!-- Hướng dẫn ngắn -->
            <div class="qmdj-time-modal-desc">
              Chọn thời điểm diễn ra cuộc gặp, phỏng vấn, đàm phán hoặc xuất hành để tính toán phương vị Kỳ Môn chiến lược trên La Kinh.
            </div>

            <!-- Khối 1: Chọn Ngày -->
            <div class="qmdj-time-section">
              <div class="qmdj-time-section-title">📅 1. CHỌN NGÀY THỰC HIỆN</div>
              <div class="qmdj-time-quick-days">
                <button type="button" class="qmdj-quick-btn" id="btn-qmdj-quick-today">Hôm nay</button>
                <button type="button" class="qmdj-quick-btn" id="btn-qmdj-quick-tomorrow">Ngày mai</button>
                <button type="button" class="qmdj-quick-btn" id="btn-qmdj-quick-in2days">+2 ngày</button>
                <button type="button" class="qmdj-quick-btn" id="btn-qmdj-quick-now">↺ Giờ Hiện Tại</button>
              </div>
              <div class="qmdj-time-input-row" style="margin-top: 8px;">
                <label for="qmdj-time-picker-date">Ngày Dương lịch:</label>
                <input type="date" id="qmdj-time-picker-date" class="qmdj-native-datetime-input" value="${formatYMD(tempDate)}" />
              </div>
            </div>

            <!-- Khối 2: Chọn 12 Giờ Can Chi Kỳ Môn -->
            <div class="qmdj-time-section">
              <div class="qmdj-time-section-title">⏱️ 2. CHỌN GIỜ KỲ MÔN (12 THỜI THẦN)</div>
              <div class="qmdj-12-hours-grid">
                ${CAN_CHI_HOURS.map(ch => {
                  const isSel = (ch.chi === activeChi);
                  return `
                    <button type="button" class="qmdj-hour-card ${isSel ? 'active' : ''}" data-hour="${ch.h}" data-min="${ch.m}">
                      <span class="hour-icon">${ch.icon}</span>
                      <span class="hour-chi">Giờ ${ch.chi}</span>
                      <span class="hour-range">${ch.range}</span>
                    </button>
                  `;
                }).join('')}
              </div>
              <div class="qmdj-time-input-row" style="margin-top: 8px;">
                <label for="qmdj-time-picker-exact">Giờ : Phút cụ thể:</label>
                <input type="time" id="qmdj-time-picker-exact" class="qmdj-native-datetime-input" value="${formatHM(tempDate)}" />
              </div>
            </div>

            <!-- Khối 3: Thẻ Xem Trước Trạng Thái Kỳ Môn -->
            <div class="qmdj-time-preview-card">
              <div class="preview-title">🔮 BÀN CỜ DỰ KIẾN ÁP DỤNG:</div>
              <div class="preview-time-str">
                ${pad(tempDate.getHours())}:${pad(tempDate.getMinutes())} — Ngày ${pad(tempDate.getDate())}/${pad(tempDate.getMonth() + 1)}/${tempDate.getFullYear()}
              </div>
              <div class="preview-canchi">
                <span>Trụ Ngày: <strong>${canChiDayStr || '---'}</strong></span>
                <span>•</span>
                <span>Trụ Giờ: <strong>${canChiHourStr || '---'}</strong></span>
                ${solarTermStr ? `<span>• Tiết: <strong>${solarTermStr}</strong></span>` : ''}
              </div>
              ${isDisharmony ? `
                <div class="preview-alert warning">
                  ⚠️ <strong>Cảnh Báo:</strong> Giờ này phạm <em>Ngũ Bất Ngộ Thời</em> (Can Ngày khắc Can Giờ). Hãy thận trọng khi xuất hành hoặc ký kết đại sự!
                </div>
              ` : `
                <div class="preview-alert success">
                  ✅ Khí trường thông thuận, phù hợp cho việc triển khai tác chiến Kỳ Môn!
                </div>
              `}
            </div>

            <!-- Nút Hành Động -->
            <div class="qmdj-time-modal-actions">
              <button type="button" class="lakinh-action-btn secondary" id="btn-cancel-qmdj-time">Đóng</button>
              <button type="button" class="lakinh-action-btn success" id="btn-apply-qmdj-time">🎯 Áp Dụng Lên La Kinh</button>
            </div>
          </div>
        </div>
      `;

      bindModalEvents();
    }

    function bindModalEvents() {
      const overlay = document.getElementById('modal-qmdj-time-overlay');
      const btnClose = document.getElementById('btn-close-qmdj-time-modal');
      const btnCancel = document.getElementById('btn-cancel-qmdj-time');
      const btnApply = document.getElementById('btn-apply-qmdj-time');
      const dateInput = document.getElementById('qmdj-time-picker-date');
      const timeInput = document.getElementById('qmdj-time-picker-exact');

      const closeMe = () => { if (overlay) overlay.remove(); };
      if (btnClose) btnClose.onclick = closeMe;
      if (btnCancel) btnCancel.onclick = closeMe;

      // Quick buttons
      const btnToday = document.getElementById('btn-qmdj-quick-today');
      const btnTomorrow = document.getElementById('btn-qmdj-quick-tomorrow');
      const btnIn2Days = document.getElementById('btn-qmdj-quick-in2days');
      const btnNow = document.getElementById('btn-qmdj-quick-now');

      if (btnToday) {
        btnToday.onclick = () => {
          const now = new Date();
          tempDate.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
          renderModalContent();
        };
      }
      if (btnTomorrow) {
        btnTomorrow.onclick = () => {
          const now = new Date();
          now.setDate(now.getDate() + 1);
          tempDate.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
          renderModalContent();
        };
      }
      if (btnIn2Days) {
        btnIn2Days.onclick = () => {
          const now = new Date();
          now.setDate(now.getDate() + 2);
          tempDate.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
          renderModalContent();
        };
      }
      if (btnNow) {
        btnNow.onclick = () => {
          tempDate = new Date();
          renderModalContent();
        };
      }

      // Date input change
      if (dateInput) {
        dateInput.onchange = () => {
          const val = dateInput.value;
          if (val) {
            const parts = val.split('-');
            if (parts.length === 3) {
              tempDate.setFullYear(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
              renderModalContent();
            }
          }
        };
      }

      // Time input change
      if (timeInput) {
        timeInput.onchange = () => {
          const val = timeInput.value;
          if (val) {
            const parts = val.split(':');
            if (parts.length >= 2) {
              tempDate.setHours(parseInt(parts[0]), parseInt(parts[1]), 0);
              renderModalContent();
            }
          }
        };
      }

      // Hour card clicks
      document.querySelectorAll('.qmdj-hour-card').forEach(btn => {
        btn.onclick = () => {
          const h = parseInt(btn.getAttribute('data-hour') || '0');
          const m = parseInt(btn.getAttribute('data-min') || '0');
          tempDate.setHours(h, m, 0);
          renderModalContent();
        };
      });

      // Apply button
      if (btnApply) {
        btnApply.onclick = () => {
          state.qmdjStratDate = new Date(tempDate);
          closeMe();
          updateQmdjStrategicLayer();
          if (typeof showLaKinhToast === 'function') {
            const pad = n => String(n).padStart(2, '0');
            const str = `${pad(tempDate.getHours())}:${pad(tempDate.getMinutes())} ngày ${pad(tempDate.getDate())}/${pad(tempDate.getMonth() + 1)}`;
            showLaKinhToast(`✅ Đã áp dụng Kỳ Môn cho lúc ${str}`);
          }
        };
      }
    }

    renderModalContent();
  }

  function openQmdjGuideModal() {
    const modalBox = document.getElementById('lakinh-modal-container');
    if (!modalBox) return;

    closeBottomSheet();

    modalBox.innerHTML = `
      <div class="lakinh-modal-overlay" id="modal-qmdj-guide-overlay">
        <div class="lakinh-glass-panel lakinh-modal-dialog qmdj-guide-modal-dialog">
          <div class="lakinh-modal-header">
            <div class="lakinh-modal-title">
              ⚔️ CẨM NANG KỲ MÔN CHIẾN LƯỢC JOEY YAP
            </div>
            <button class="lakinh-modal-close" onclick="document.getElementById('modal-qmdj-guide-overlay').remove()">✕</button>
          </div>

          <div class="qmdj-guide-scroll-body">
            <p style="font-size: 0.78rem; line-height: 1.5; color: #cbd5e1; margin-bottom: 12px;">
              Kỳ Môn Chiến Lược (Strategic Qi Men) của Joey Yap là nghệ thuật kiểm soát không gian, khí trường và tâm lý học hành vi trong đàm phán, kinh doanh và xuất hành thực địa:
            </p>

            <!-- Mục 1: Tọa Lưng -->
            <div class="qmdj-guide-item green">
              <div class="guide-item-header">
                <span class="guide-icon">🟢</span>
                <span class="guide-name">TỌA LƯNG ĐẮC THẮNG (Presenter Back-Facing)</span>
              </div>
              <div class="guide-item-content">
                <strong>Ý nghĩa:</strong> Đây là phương vị có <em>Trực Phù (Thần thủ lĩnh tối cao)</em> ngự trị.<br>
                <strong>Cách thực hiện:</strong> Khi vào phòng họp, quán cafe hay bàn đàm phán, hãy <strong>chủ động chọn vị trí ngồi sao cho LƯNG QUAY VỀ HƯỚNG NÀY</strong> (mặt nhìn ra hướng đối diện). Khí trường từ sau lưng sẽ tạo thế vững chãi như tựa núi, giúp tâm trí điềm tĩnh, lời nói có trọng lượng và tự nhiên áp đảo uy thế đối phương.
              </div>
            </div>

            <!-- Mục 2: Ép Đối Tác -->
            <div class="qmdj-guide-item purple">
              <div class="guide-item-header">
                <span class="guide-icon">🎯</span>
                <span class="guide-name">ÉP ĐỐI TÁC (Audience Placement)</span>
              </div>
              <div class="guide-item-content">
                <strong>Ý nghĩa:</strong> Phương vị rơi vào <em>Tử Môn</em> (bế tắc, nặng nề) hoặc <em>Kinh Môn</em> (nghi ngờ, dao động).<br>
                <strong>Cách thực hiện:</strong> Hãy khéo léo <strong>mời hoặc xếp ghế cho đối thủ/đối tác ngồi quay lưng về hướng này</strong> (hoặc ta ngồi nhìn thẳng vào họ ở hướng này). Áp lực vô hình sẽ khiến họ dễ mất kiên nhẫn, thiếu quyết đoán, phòng thủ sơ hở và nhanh chóng nhượng bộ các điều khoản có lợi cho ta.
              </div>
            </div>

            <!-- Mục 3: Thiên Mã -->
            <div class="qmdj-guide-item gold">
              <div class="guide-item-header">
                <span class="guide-icon">🟡</span>
                <span class="guide-name">THÁI TRÙNG THIÊN MÃ (Sky Horse Escape)</span>
              </div>
              <div class="guide-item-content">
                <strong>Ý nghĩa:</strong> Thần mã cứu viện, phương vị dịch chuyển và giải vây thần tốc.<br>
                <strong>Cách thực hiện:</strong> Khi gặp bế tắc, tranh cãi gay gắt, nguy cơ xung đột hoặc thế trận bất lợi, hãy <strong>rời vị trí, đi dạo hoặc xuất hành di chuyển theo hướng này</strong>. Bạn sẽ dễ dàng gặp quý nhân hỗ trợ, tìm thấy lối thoát an toàn và xoay chuyển cục diện.
              </div>
            </div>

            <!-- Mục 4: Bất Kích -->
            <div class="qmdj-guide-item red">
              <div class="guide-item-header">
                <span class="guide-icon">🚫</span>
                <span class="guide-name">VÙNG BẤT KÍCH (Non-Striking Sector)</span>
              </div>
              <div class="guide-item-content">
                <strong>Ý nghĩa:</strong> Phương vị phạm sát khí hoặc đối xung nguy hiểm.<br>
                <strong>Cách thực hiện:</strong> <strong>TUYỆT ĐỐI TRÁNH:</strong> Không ngồi quay lưng vào đây, không tổ chức ký kết hợp đồng và không phát động tấn công đối phương từ hướng này để tránh thất bại bất ngờ.
              </div>
            </div>

            <!-- Mục 5: Thu Tài -->
            <div class="qmdj-guide-item amber">
              <div class="guide-item-header">
                <span class="guide-icon">💰</span>
                <span class="guide-name">THU TÀI CHIÊU LỘC (Sinh Môn)</span>
              </div>
              <div class="guide-item-content">
                <strong>Ý nghĩa:</strong> Cung vị nạp tài khí mạnh nhất của bàn cờ (khi kích hoạt mục tiêu <em>Cầu Tài</em>).<br>
                <strong>Cách thực hiện:</strong> Hướng đón tiếp khách hàng lớn, bàn giao tiền bạc, đặt quầy thu ngân hoặc hướng đặt bút ký kết các thương vụ kinh doanh mang lại dòng tiền lớn.
              </div>
            </div>

            <!-- Mục 6: Đổi Giờ Thực Hiện -->
            <div class="qmdj-guide-item blue" style="border-left-color: #38bdf8;">
              <div class="guide-item-header">
                <span class="guide-icon">🕒</span>
                <span class="guide-name">CÁCH ĐỔI GIỜ TÁC CHIẾN KẾ HOẠCH</span>
              </div>
              <div class="guide-item-content">
                Để lập kế hoạch trước cho một cuộc gặp trong tương lai (không phải giờ hiện tại), bạn chỉ cần <strong>bấm vào ô giờ [ 🕒 Giờ ✏️ ] trên thanh chiến lược</strong> hoặc mở menu <strong>[ Công Cụ ] &gt; [ Đổi Ngày &amp; Giờ Kế Hoạch ]</strong> để chọn bất kỳ ngày nào và 12 Giờ Can Chi mong muốn!
              </div>
            </div>
          </div>

          <div style="margin-top: 14px; text-align: center;">
            <button type="button" class="lakinh-action-btn success" style="width: 100%;" onclick="document.getElementById('modal-qmdj-guide-overlay').remove()">
              Đã Hiểu, Quay Lại La Kinh
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ================= 10. MODAL THẨM ĐỊNH PHONG THỦY TAM HỢP PHÁI (31 BÀI GIẢNG) =================
  function openTamHopModal(defaultHuongDeg = null) {
    const modalBox = document.getElementById('lakinh-modal-container');
    if (!modalBox || !global.TamHopEngine) {
      if (typeof showLaKinhToast === 'function') {
        showLaKinhToast('⚠️ Chưa nạp được Động Cơ Tam Hợp Phái');
      }
      return;
    }

    closeBottomSheet();
    const hudCard = document.getElementById('lakinh-hud-detail-card');
    if (hudCard) {
      hudCard.style.display = 'none';
      state.isHudDetailOpen = false;
      const hudArrow = document.getElementById('hud-pill-arrow');
      if (hudArrow) hudArrow.textContent = '▾';
    }

    let curHuongDeg = (typeof defaultHuongDeg === 'number') ? defaultHuongDeg : state.rotation;
    let curThuyKhauDeg = (state.rayAngle !== null && state.rayAngle !== undefined) ? state.rayAngle : state.tamHopThuyKhauDeg;
    let curDongChay = state.tamHopDongChay || 'ta_dao_huu';
    let curCanChu = state.tamHopCanChu || 'Giáp';
    let curChiChu = state.tamHopChiChu || 'Tý';
    let curNamChi = state.tamHopNamChi || 'Thìn';
    let curMoTaSa = state.tamHopMoTaSa || '';

    const STEMS = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
    const BRANCHES = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

    function renderModal() {
      curHuongDeg = ((curHuongDeg % 360) + 360) % 360;
      curThuyKhauDeg = ((curThuyKhauDeg % 360) + 360) % 360;

      const thuyPhap = global.TamHopEngine.evaluate_trach_thuy_phap(curHuongDeg, curThuyKhauDeg, curDongChay);
      const huongSon = thuyPhap.huong_nha.son_name;
      const toaDeg = (curHuongDeg + 180) % 360;
      const toaInfo = global.TamHopEngine.get_son_from_degree(toaDeg, 'dia_ban');
      const toaSon = toaInfo.son_name;

      const tamSat = global.TamHopEngine.kiem_tra_tam_sat(curNamChi, huongSon);
      const thaiTue = global.TamHopEngine.kiem_tra_thai_tue_tue_pha(curNamChi, huongSon);
      const hoangTuyen = global.TamHopEngine.kiem_tra_hoang_tuyen(huongSon, thuyPhap.thuy_khau.son_name);
      const batSat = global.TamHopEngine.kiem_tra_bat_sat_cung(toaSon, thuyPhap.thuy_khau.son_name);
      const pk120 = global.TamHopEngine.get_120_phan_kim(curHuongDeg);
      const tamCat = global.TamHopEngine.get_quy_nhan_loc_ma(curCanChu, curChiChu);
      const maHinhThe = global.TamHopEngine.phan_tich_hinh_the_ma(curChiChu, tamCat.dich_ma, curMoTaSa || 'ngọn đồi hình yên ngựa');
      const xuyenSon72 = global.TamHopEngine.get_72_xuyen_son_long(curHuongDeg);
      const vongTS = global.TamHopEngine.get_vong_truong_sinh(thuyPhap.cuc_name, thuyPhap.chieu_quay);

      const nhanBan = global.TamHopEngine.get_son_from_degree(curHuongDeg, 'nhan_ban');
      const tu28 = global.TamHopEngine.nhi_thap_bat_tu_nhan_ban(curHuongDeg);

      const saPhanLoai = curMoTaSa ? global.TamHopEngine.phan_loai_hinh_the_sa(curMoTaSa) : null;
      const saTieu = saPhanLoai ? global.TamHopEngine.tieu_sa_ngu_hanh(thuyPhap.huong_nha.ngu_hanh, saPhanLoai.ngu_hanh) : null;

      const isHopCach = pk120.duoc_phep_lay && !tamSat.pham_tam_sat && !thaiTue.pham_tue_pha && !batSat.pham_bat_sat && (!hoangTuyen.pham_sat || hoangTuyen.loai_sat.includes('CỨU BẦN'));

      modalBox.innerHTML = `
        <div class="lakinh-modal-overlay" id="modal-tamhop-overlay">
          <div class="lakinh-glass-panel lakinh-modal-dialog tamhop-modal-dialog">
            <div class="lakinh-modal-header" style="border-bottom: 1.5px solid rgba(16, 185, 129, 0.4); padding-bottom: 8px; margin-bottom: 10px;">
              <div>
                <div class="lakinh-modal-title" style="color: #34d399; font-size: 1.05rem; display: flex; align-items: center; gap: 6px;">
                  🌊 THẨM ĐỊNH PHONG THỦY TAM HỢP PHÁI
                </div>
                <div style="font-size: 0.68rem; color: #94a3b8; margin-top: 2px;">
                  Hệ Thống Phương Pháp Luận Phong Thủy Tam Hợp Phái Toàn Thư
                </div>
              </div>
              <button class="lakinh-modal-close" id="btn-close-tamhop-modal">✕</button>
            </div>

            <!-- THẺ ĐÁNH GIÁ TỔNG QUÁT -->
            <div class="tamhop-hero-card" style="border-left: 4px solid ${isHopCach ? '#22c55e' : (tamSat.pham_tam_sat || thaiTue.pham_tue_pha || batSat.pham_bat_sat ? '#ef4444' : '#f59e0b')};">
              <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 6px; margin-bottom: 6px;">
                <span class="tamhop-badge ${isHopCach ? 'green' : (tamSat.pham_tam_sat || thaiTue.pham_tue_pha || batSat.pham_bat_sat ? 'red' : 'gold')}">
                  ${isHopCach ? '✅ HỢP CÁCH TAM HỢP PHÁI' : '⚠️ CẦN TINH CHỈNH PHÂN KIM / CỬA CỔNG'}
                </span>
                <span style="font-size: 0.72rem; color: #cbd5e1; font-weight: 700;">
                  ${thuyPhap.cuc_name} • ${thuyPhap.the_cuc.split('(')[0]}
                </span>
              </div>
              <div style="font-size: 0.76rem; color: #f8fafc; line-height: 1.45; margin-top: 4px;">
                ${isHopCach 
                  ? 'Trạch đất đắc cách Thủy Pháp & Phân Kim thuần khiết. Đinh tài lưỡng vượng, nạp khí đại cát, gia đạo hưng long trường thọ.' 
                  : 'Phát hiện yếu tố xung sát hoặc tuyến phân kim suy khí. Cần vi chỉnh hướng cửa, điều hướng thủy khẩu hoặc xoay bàn thờ/bếp theo hướng dẫn bên dưới.'}
              </div>
            </div>

            <!-- PHẦN 1: THIẾT LẬP THAM SỐ KHẢO SÁT -->
            <div class="tamhop-section-title" style="display: flex; justify-content: space-between; align-items: center;">
              <span>📐 1. Thiết Lập Tọa Hướng & Thủy Khẩu Thực Địa</span>
              <button type="button" id="th-btn-modal-scan-dem" style="background: rgba(56,189,248,0.18); border: 1px solid #38bdf8; color: #38bdf8; font-size: 0.65rem; font-weight: 700; padding: 2px 7px; border-radius: 6px; cursor: pointer;">
                🛰️ Quét DEM Vệ Tinh
              </button>
            </div>
            <div class="tamhop-field-group">
              <!-- Bộ Chọn 3 Cấp Đường Cục: Tiểu Cục / Trung Cục / Đại Cục -->
              <div style="margin-bottom: 8px;">
                <div style="font-size: 0.70rem; color: #94a3b8; font-weight: 700; margin-bottom: 4px;">CẤP BẬC ĐƯỜNG CỤC THỦY PHÁP:</div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px;">
                  <button type="button" class="tamhop-duongcuc-btn ${state.tamHopDuongCuc === 'tieu_cuc' ? 'active' : ''}" data-modal-duongcuc="tieu_cuc">
                    🏠 Tiểu Cục (40m)
                    <small style="display:block; font-size: 0.58rem; opacity: 0.85;">Cống ngầm / Hố ga</small>
                  </button>
                  <button type="button" class="tamhop-duongcuc-btn ${state.tamHopDuongCuc === 'trung_cuc' ? 'active' : ''}" data-modal-duongcuc="trung_cuc">
                    🏘️ Trung Cục (350m)
                    <small style="display:block; font-size: 0.58rem; opacity: 0.85;">Ngã ba phố / Kênh</small>
                  </button>
                  <button type="button" class="tamhop-duongcuc-btn ${state.tamHopDuongCuc === 'dai_cuc' ? 'active' : ''}" data-modal-duongcuc="dai_cuc">
                    ⛰️ Đại Cục (2000m)
                    <small style="display:block; font-size: 0.58rem; opacity: 0.85;">Sông cái / Cửa biển</small>
                  </button>
                </div>
              </div>
              <!-- Hướng nhà (Địa Bàn) -->
              <div class="tamhop-input-row">
                <span style="color: #cbd5e1; font-weight: 600;">Hướng Nhà (Địa Bàn):</span>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <input type="number" id="th-input-huong" class="tamhop-input" style="width: 72px; text-align: right;" value="${curHuongDeg.toFixed(1)}" step="0.5" min="0" max="359.9" />
                  <span style="color: #f5b041; font-weight: 700;">°</span>
                  <button type="button" class="tamhop-tag-btn" id="th-btn-sync-lakinh" title="Lấy theo độ số La Kinh hiện tại">↺ La Kinh (${state.rotation.toFixed(1)}°)</button>
                </div>
              </div>
              <input type="range" id="th-slider-huong" class="lakinh-slider" min="0" max="359.9" step="0.5" value="${curHuongDeg.toFixed(1)}" style="margin-bottom: 6px;" />
              <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: #94a3b8; margin-bottom: 8px;">
                <span>Tọa: <b style="color: #f5b041;">${toaSon}</b> • Hướng: <b style="color: #38bdf8;">${huongSon}</b> (${thuyPhap.huong_nha.cung_bat_quai})</span>
                <span style="color: ${thuyPhap.huong_nha.is_pure_center ? '#4ade80' : '#f87171'};">${thuyPhap.huong_nha.sub_zone}</span>
              </div>

              <!-- Thủy Khẩu (Thiên Bàn) -->
              <div class="tamhop-input-row" style="border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 6px;">
                <span style="color: #cbd5e1; font-weight: 600;">Thủy Khẩu (Thiên Bàn):</span>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <input type="number" id="th-input-thuykhau" class="tamhop-input" style="width: 72px; text-align: right;" value="${curThuyKhauDeg.toFixed(1)}" step="0.5" min="0" max="359.9" />
                  <span style="color: #a78bfa; font-weight: 700;">°</span>
                  <button type="button" class="tamhop-tag-btn" id="th-btn-sync-ray" title="Lấy theo tia ngắm hiện tại">🎯 Tia Ngắm</button>
                </div>
              </div>
              <input type="range" id="th-slider-thuykhau" class="lakinh-slider" min="0" max="359.9" step="0.5" value="${curThuyKhauDeg.toFixed(1)}" style="margin-bottom: 6px;" />
              <div style="font-size: 0.7rem; color: #a78bfa; margin-bottom: 4px;">
                Thủy Khẩu Thiên Bàn: <b>Sơn ${thuyPhap.thuy_khau.son_name}</b> (Song Sơn <b>${thuyPhap.thuy_khau.son_name}</b> thuộc <b>${thuyPhap.cuc_name}</b>)
              </div>
              <div class="tamhop-quick-tags">
                <span style="font-size: 0.68rem; color: #94a3b8; align-self: center;">Mộ khố Thủy Khẩu:</span>
                <button type="button" class="tamhop-tag-btn ${Math.abs(curThuyKhauDeg - 115) < 8 ? 'active' : ''}" data-tk="115">Thìn (Thủy Cục)</button>
                <button type="button" class="tamhop-tag-btn ${Math.abs(curThuyKhauDeg - 295) < 8 ? 'active' : ''}" data-tk="295">Tuất (Hỏa Cục)</button>
                <button type="button" class="tamhop-tag-btn ${Math.abs(curThuyKhauDeg - 25) < 8 ? 'active' : ''}" data-tk="25">Sửu (Kim Cục)</button>
                <button type="button" class="tamhop-tag-btn ${Math.abs(curThuyKhauDeg - 205) < 8 ? 'active' : ''}" data-tk="205">Mùi (Mộc Cục)</button>
                <button type="button" class="tamhop-tag-btn ${Math.abs(curThuyKhauDeg - 225) < 8 ? 'active' : ''}" data-tk="225">Khôn</button>
                <button type="button" class="tamhop-tag-btn ${Math.abs(curThuyKhauDeg - 135) < 8 ? 'active' : ''}" data-tk="135">Tốn</button>
                <button type="button" class="tamhop-tag-btn ${Math.abs(curThuyKhauDeg - 45) < 8 ? 'active' : ''}" data-tk="45">Cấn</button>
                <button type="button" class="tamhop-tag-btn ${Math.abs(curThuyKhauDeg - 315) < 8 ? 'active' : ''}" data-tk="315">Càn</button>
              </div>

              <!-- Dòng chảy Thủy Pháp -->
              <div class="tamhop-input-row" style="margin-top: 8px;">
                <span style="color: #cbd5e1; font-weight: 600;">Dòng Chảy Thủy Pháp:</span>
                <div style="display: flex; gap: 4px;">
                  <button type="button" class="tamhop-tag-btn ${curDongChay === 'ta_dao_huu' ? 'active' : ''}" id="th-btn-ta-dao-huu">Tả Thủy Đảo Hữu (Thuận)</button>
                  <button type="button" class="tamhop-tag-btn ${curDongChay === 'huu_dao_ta' ? 'active' : ''}" id="th-btn-huu-dao-ta">Hữu Thủy Đảo Tả (Nghịch)</button>
                </div>
              </div>

              <!-- Tuổi Gia Chủ & Năm Khảo Sát -->
              <div class="tamhop-input-row" style="margin-top: 8px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 6px;">
                <span style="color: #cbd5e1; font-weight: 600;">Tuổi Gia Chủ (Can Chi):</span>
                <div style="display: flex; gap: 4px;">
                  <select id="th-select-can" class="tamhop-select">
                    ${STEMS.map(s => `<option value="${s}" ${s === curCanChu ? 'selected' : ''}>${s}</option>`).join('')}
                  </select>
                  <select id="th-select-chi" class="tamhop-select">
                    ${BRANCHES.map(b => `<option value="${b}" ${b === curChiChu ? 'selected' : ''}>${b}</option>`).join('')}
                  </select>
                </div>
              </div>
              <div class="tamhop-input-row">
                <span style="color: #cbd5e1; font-weight: 600;">Năm Động Thổ / Khảo Sát:</span>
                <select id="th-select-namchi" class="tamhop-select">
                  ${BRANCHES.map(b => `<option value="${b}" ${b === curNamChi ? 'selected' : ''}>Năm ${b}</option>`).join('')}
                </select>
              </div>

              <!-- Mô tả Sa Sơn -->
              <div style="margin-top: 8px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 6px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span style="color: #cbd5e1; font-weight: 600; font-size: 0.78rem;">Hình Thể Gò Đồi / Sa Sơn (Nhân Bàn):</span>
                </div>
                <input type="text" id="th-input-mota-sa" class="tamhop-input" style="width: 100%; box-sizing: border-box;" placeholder="VD: Gò đồi hình yên ngựa, ngọn đồi tròn bát úp, tháp nhọn..." value="${curMoTaSa}" />
                <div class="tamhop-quick-tags" style="margin-top: 4px;">
                  <button type="button" class="tamhop-tag-btn" data-sa="ngọn đồi tròn bát úp">⛰️ Đồi Tròn (Kim Sa)</button>
                  <button type="button" class="tamhop-tag-btn" data-sa="ngọn đồi hình yên ngựa">🐎 Đồi Yên Ngựa (Mã Quý)</button>
                  <button type="button" class="tamhop-tag-btn" data-sa="tháp nhọn hoắt">🗼 Tháp Nhọn (Hỏa Sa)</button>
                  <button type="button" class="tamhop-tag-btn" data-sa="sóng lượn nhấp nhô">🌊 Lượn Sóng (Thủy Sa)</button>
                  <button type="button" class="tamhop-tag-btn" data-sa="đỉnh bằng phẳng vuông vức">⏹️ Đỉnh Vuông (Thổ Sa)</button>
                </div>
              </div>
            </div>

            <!-- PHẦN 2: THỦY PHÁP & VÒNG TRƯỜNG SINH 12 CUNG -->
            <div class="tamhop-section-title">
              <span>🌊 2. Thủy Pháp & Vòng Trường Sinh 12 Cung</span>
            </div>
            <div class="tamhop-field-group">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.76rem;">
                <span style="color: #94a3b8;">Cục Đất:</span>
                <strong style="color: #38bdf8;">${thuyPhap.cuc_name} (Hành ${thuyPhap.thuy_khau.ngu_hanh || 'Thủy'})</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.76rem;">
                <span style="color: #94a3b8;">Cung Nạp Hướng Nhà:</span>
                <strong style="color: #4ade80;">Cung ${thuyPhap.cung_nap_huong}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.76rem;">
                <span style="color: #94a3b8;">Thế Cục Thủy Pháp:</span>
                <strong style="color: #facc15;">${thuyPhap.the_cuc}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.76rem;">
                <span style="color: #94a3b8;">Đánh Giá Thủy Pháp:</span>
                <strong style="color: ${thuyPhap.danh_gia.includes('ĐẠI CÁT') ? '#4ade80' : (thuyPhap.danh_gia.includes('ĐẠI HUNG') ? '#f87171' : '#facc15')};">${thuyPhap.danh_gia}</strong>
              </div>
              <div style="font-size: 0.72rem; color: #cbd5e1; line-height: 1.4; margin-top: 4px; font-style: italic;">
                ${thuyPhap.khuyen_nghi || 'Tiêu nạp thủy pháp bình hòa, hợp quy chuẩn địa thế.'}
              </div>

              <!-- Lưới 12 Cung Trường Sinh -->
              <div style="font-size: 0.72rem; color: #34d399; font-weight: 700; margin-top: 8px;">
                Bảng 12 Cung Trường Sinh (${thuyPhap.chieu_quay === 'thuan' ? 'Dương Thuận' : 'Âm Nghịch'}):
              </div>
              <div class="tamhop-ts-grid">
                ${vongTS.map(item => {
                  const isHuong = (item.song_son === thuyPhap.huong_song_son);
                  const isCat = ['Trường Sinh', 'Quan Đới', 'Lâm Quan', 'Đế Vượng'].includes(item.cung_truong_sinh);
                  const isKhu = ['Mộ', 'Tuyệt', 'Tử', 'Bệnh'].includes(item.cung_truong_sinh);
                  const cls = isCat ? 'cat' : (isKhu ? 'khu' : '');
                  return `
                    <div class="tamhop-ts-card ${cls}" style="${isHuong ? 'box-shadow: 0 0 8px rgba(56, 189, 248, 0.6); border: 1.5px solid #38bdf8;' : ''}">
                      <div style="display: flex; justify-content: space-between;">
                        <b style="color: ${isHuong ? '#facc15' : '#f8fafc'};">${item.song_son}</b>
                        ${isHuong ? '<span style="font-size:0.65rem; color:#facc15;">[Hướng]</span>' : ''}
                      </div>
                      <div style="color: ${isCat ? '#4ade80' : (isKhu ? '#38bdf8' : '#cbd5e1')}; font-weight: 700;">
                        ${item.cung_truong_sinh}
                      </div>
                      <div style="font-size: 0.65rem; color: #94a3b8;">${item.tinh_chat.split('(')[0]}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- PHẦN 3: HOÀNG TUYỀN & BÁT SÁT -->
            <div class="tamhop-section-title">
              <span>⚠️ 3. Bát Lộ Hoàng Tuyền & Bát Sát Tiêu Vong</span>
            </div>
            <div class="tamhop-field-group">
              <!-- Hoàng Tuyền -->
              <div style="margin-bottom: 6px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem;">
                  <span style="color: #94a3b8;">Hoàng Tuyền Sát:</span>
                  <span class="tamhop-badge ${hoangTuyen.loai_sat.includes('CỨU BẦN') ? 'green' : (hoangTuyen.pham_sat ? 'red' : 'green')}">
                    ${hoangTuyen.loai_sat}
                  </span>
                </div>
                <div style="font-size: 0.72rem; color: #cbd5e1; margin-top: 2px;">
                  ${hoangTuyen.mo_ta}
                </div>
              </div>

              <!-- Bát Sát -->
              <div style="border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 6px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.76rem;">
                  <span style="color: #94a3b8;">Bát Sát Tiêu Vong:</span>
                  <span class="tamhop-badge ${batSat.pham_bat_sat ? 'red' : 'green'}">
                    ${batSat.pham_bat_sat ? 'ĐẠI HUNG (Phạm Bát Sát)' : 'BÌNH AN (Không Phạm)'}
                  </span>
                </div>
                <div style="font-size: 0.72rem; color: #cbd5e1; margin-top: 2px;">
                  ${batSat.mo_ta}
                </div>
              </div>
            </div>

            <!-- PHẦN 4: TAM SÁT & THÁI TUẾ -->
            <div class="tamhop-section-title">
              <span>🛡️ 4. Tam Sát & Thái Tuế Trong Năm ${curNamChi}</span>
            </div>
            <div class="tamhop-field-group">
              <div style="display: flex; justify-content: space-between; font-size: 0.76rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Tam Sát Năm ${curNamChi}:</span>
                <strong style="color: ${tamSat.pham_tam_sat ? '#f87171' : '#4ade80'};">
                  Phương ${tamSat.tam_sat_phuong} (${tamSat.cac_son_sat.join(', ')}) • ${tamSat.pham_tam_sat ? 'PHẠM TAM SÁT' : 'An Toàn'}
                </strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.76rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Thái Tuế & Tuế Phá:</span>
                <strong style="color: ${thaiTue.pham_tue_pha ? '#f87171' : (thaiTue.pham_thai_tue ? '#facc15' : '#4ade80')};">
                  ${thaiTue.danh_gia}
                </strong>
              </div>
              <div style="font-size: 0.7rem; color: #94a3b8; font-style: italic;">
                Nguyên lý kinh điển: "Tam Sát khả tọa bất khả hướng", Thái Tuế khả tọa bất khả hướng, Tuế Phá nghiêm cấm cả tọa lẫn hướng.
              </div>
            </div>

            <!-- PHẦN 5: 120 PHÂN KIM VI MÔ -->
            <div class="tamhop-section-title">
              <span>💎 5. 120 Phân Kim Vi Mô</span>
            </div>
            <div class="tamhop-field-group">
              <div style="display: flex; justify-content: space-between; font-size: 0.76rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Vị Trí Phân Kim (${curHuongDeg.toFixed(1)}°):</span>
                <strong style="color: #38bdf8;">${pk120.phan_kim_type}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.76rem; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Tính Chất Khí Tuyến:</span>
                <span class="tamhop-badge ${pk120.duoc_phep_lay ? 'green' : 'red'}">
                  ${pk120.tinh_chat}
                </span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.76rem;">
                <span style="color: #94a3b8;">72 Xuyên Sơn Long:</span>
                <span style="color: ${xuyenSon72.is_quy_giap_khong_vong ? '#f87171' : '#4ade80'}; font-weight: 700;">
                  Long thứ ${xuyenSon72.long_index_72} • ${xuyenSon72.danh_gia.split('(')[0]}
                </span>
              </div>
            </div>

            <!-- PHẦN 6: TAM CÁT THẦN TRỢ & TIÊU SA -->
            <div class="tamhop-section-title">
              <span>🐎 6. Tam Cát Thần Trợ & Tiêu Sa</span>
            </div>
            <div class="tamhop-field-group">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 0.76rem; margin-bottom: 6px;">
                <div style="background: rgba(15,23,42,0.6); padding: 6px 8px; border-radius: 6px; border-left: 3px solid #38bdf8;">
                  <span style="color: #94a3b8;">Thiên Ất Quý Nhân:</span><br/>
                  <b style="color: #38bdf8;">Dương Quý: ${tamCat.duong_quy_nhan} • Âm Quý: ${tamCat.am_quy_nhan}</b>
                </div>
                <div style="background: rgba(15,23,42,0.6); padding: 6px 8px; border-radius: 6px; border-left: 3px solid #facc15;">
                  <span style="color: #94a3b8;">Thiên Lộc (Tài Khí):</span><br/>
                  <b style="color: #facc15;">Sơn ${tamCat.thien_loc}</b>
                </div>
              </div>
              <div style="background: rgba(15,23,42,0.6); padding: 6px 8px; border-radius: 6px; border-left: 3px solid #4ade80; font-size: 0.76rem; margin-bottom: 6px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #94a3b8;">Dịch Mã (Thăng Quan):</span>
                  <b style="color: #4ade80;">Phương ${tamCat.dich_ma}</b>
                </div>
                <div style="font-size: 0.72rem; color: #cbd5e1; margin-top: 2px;">
                  ${maHinhThe.danh_gia}
                </div>
              </div>

              <!-- Tiêu Sa Lại Công & 28 Tú -->
              <div style="font-size: 0.74rem; color: #94a3b8; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 6px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                  <span>Nhân Bàn Trung Châm: <b>Sơn ${nhanBan.son_name} (${nhanBan.calc_degree.toFixed(1)}°)</b></span>
                  <span>28 Tú: <b style="color: #38bdf8;">Sao ${tu28.tinh_tu_name} (${tu28.tinh_chat})</b></span>
                </div>
                ${saPhanLoai ? `
                  <div style="margin-top: 4px; color: #f8fafc;">
                    Sa Sơn: <b>${saPhanLoai.loai_sa} (${saPhanLoai.hinh_thai})</b> ➔ Ngũ Sa: <b style="color: ${saTieu.danh_gia.includes('Cát') ? '#4ade80' : '#f87171'};">${saTieu.phan_loai_sa} (${saTieu.danh_gia})</b>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- NÚT TÁC VỤ CUỐI MODAL -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 14px;">
              <button type="button" class="lakinh-action-btn success" id="th-btn-apply-compass">
                🎯 Đặt La Kinh Về ${curHuongDeg.toFixed(1)}°
              </button>
              <button type="button" class="lakinh-action-btn purple" id="th-btn-aim-ray">
                🎯 Bật Tia Ngắm Thủy Khẩu (${curThuyKhauDeg.toFixed(1)}°)
              </button>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
              <button type="button" class="lakinh-action-btn gold" id="th-btn-copy-report">
                📋 Sao Chép Báo Cáo
              </button>
              <button type="button" class="lakinh-action-btn secondary" id="th-btn-close-bottom">
                ✕ Đóng
              </button>
            </div>
          </div>
        </div>
      `;

      // Gán sự kiện cho các thành phần điều khiển
      const closeFn = () => {
        const overlay = document.getElementById('modal-tamhop-overlay');
        if (overlay) overlay.remove();
      };

      const btnCloseTop = document.getElementById('btn-close-tamhop-modal');
      const btnCloseBottom = document.getElementById('th-btn-close-bottom');
      if (btnCloseTop) btnCloseTop.addEventListener('click', closeFn);
      if (btnCloseBottom) btnCloseBottom.addEventListener('click', closeFn);

      // Slider & Input Hướng Nhà
      const inHuong = document.getElementById('th-input-huong');
      const slHuong = document.getElementById('th-slider-huong');
      if (inHuong) {
        inHuong.addEventListener('change', (e) => {
          curHuongDeg = parseFloat(e.target.value) || 0;
          renderModal();
        });
      }
      if (slHuong) {
        slHuong.addEventListener('input', (e) => {
          curHuongDeg = parseFloat(e.target.value) || 0;
          renderModal();
        });
      }

      // Slider & Input Thủy Khẩu
      const inTK = document.getElementById('th-input-thuykhau');
      const slTK = document.getElementById('th-slider-thuykhau');
      if (inTK) {
        inTK.addEventListener('change', (e) => {
          curThuyKhauDeg = parseFloat(e.target.value) || 0;
          state.tamHopThuyKhauDeg = curThuyKhauDeg;
          renderModal();
        });
      }
      if (slTK) {
        slTK.addEventListener('input', (e) => {
          curThuyKhauDeg = parseFloat(e.target.value) || 0;
          state.tamHopThuyKhauDeg = curThuyKhauDeg;
          renderModal();
        });
      }

      // Nút đồng bộ La Kinh & Tia Ngắm
      const btnSyncLK = document.getElementById('th-btn-sync-lakinh');
      if (btnSyncLK) {
        btnSyncLK.addEventListener('click', () => {
          curHuongDeg = state.rotation;
          renderModal();
        });
      }
      const btnSyncRay = document.getElementById('th-btn-sync-ray');
      if (btnSyncRay) {
        btnSyncRay.addEventListener('click', () => {
          if (state.rayAngle !== null && state.rayAngle !== undefined) {
            curThuyKhauDeg = state.rayAngle;
            state.tamHopThuyKhauDeg = curThuyKhauDeg;
            renderModal();
          } else {
            showLaKinhToast('ℹ️ Hãy xoay tia ngắm phân kim trên bản đồ trước');
          }
        });
      }

      // Thủy khẩu quick tags
      modalBox.querySelectorAll('.tamhop-tag-btn[data-tk]').forEach(btn => {
        btn.addEventListener('click', () => {
          curThuyKhauDeg = parseFloat(btn.getAttribute('data-tk'));
          state.tamHopThuyKhauDeg = curThuyKhauDeg;
          renderModal();
        });
      });

      // Dòng chảy
      const btnTa = document.getElementById('th-btn-ta-dao-huu');
      const btnHuu = document.getElementById('th-btn-huu-dao-ta');
      if (btnTa) {
        btnTa.addEventListener('click', () => {
          curDongChay = 'ta_dao_huu';
          state.tamHopDongChay = curDongChay;
          renderModal();
        });
      }
      if (btnHuu) {
        btnHuu.addEventListener('click', () => {
          curDongChay = 'huu_dao_ta';
          state.tamHopDongChay = curDongChay;
          renderModal();
        });
      }

      // Can Chi & Năm Chi
      const selCan = document.getElementById('th-select-can');
      const selChi = document.getElementById('th-select-chi');
      const selNam = document.getElementById('th-select-namchi');
      if (selCan) {
        selCan.addEventListener('change', (e) => {
          curCanChu = e.target.value;
          state.tamHopCanChu = curCanChu;
          renderModal();
        });
      }
      if (selChi) {
        selChi.addEventListener('change', (e) => {
          curChiChu = e.target.value;
          state.tamHopChiChu = curChiChu;
          renderModal();
        });
      }
      if (selNam) {
        selNam.addEventListener('change', (e) => {
          curNamChi = e.target.value;
          state.tamHopNamChi = curNamChi;
          renderModal();
        });
      }

      // Mô tả Sa
      const inSa = document.getElementById('th-input-mota-sa');
      if (inSa) {
        inSa.addEventListener('change', (e) => {
          curMoTaSa = e.target.value;
          state.tamHopMoTaSa = curMoTaSa;
          renderModal();
        });
      }
      modalBox.querySelectorAll('.tamhop-tag-btn[data-sa]').forEach(btn => {
        btn.addEventListener('click', () => {
          curMoTaSa = btn.getAttribute('data-sa');
          state.tamHopMoTaSa = curMoTaSa;
          renderModal();
        });
      });

      // Sự kiện chọn Đường Cục trong Modal
      modalBox.querySelectorAll('.tamhop-duongcuc-btn[data-modal-duongcuc]').forEach(btn => {
        btn.addEventListener('click', () => {
          const cKey = btn.getAttribute('data-modal-duongcuc');
          if (cKey && state.tamHopCucData[cKey]) {
            state.tamHopDuongCuc = cKey;
            curThuyKhauDeg = state.tamHopCucData[cKey].deg;
            state.tamHopThuyKhauDeg = curThuyKhauDeg;
            renderModal();
          }
        });
      });

      const btnModalScanDem = document.getElementById('th-btn-modal-scan-dem');
      if (btnModalScanDem) {
        btnModalScanDem.addEventListener('click', async () => {
          closeFn();
          await scanElevationAndTiers();
          setTimeout(() => openTamHopModal(), 600);
        });
      }

      // Nút áp dụng vào La Kinh
      const btnApplyCompass = document.getElementById('th-btn-apply-compass');
      if (btnApplyCompass) {
        btnApplyCompass.addEventListener('click', () => {
          state.isTamHopActive = true;
          updateTamHopLayer();
          updateRotationDisplay(curHuongDeg);
          closeFn();
          showLaKinhToast(`🎯 Đã xoay La Kinh về hướng ${curHuongDeg.toFixed(1)}° (${huongSon}) và kích hoạt lớp Tam Hợp`);
        });
      }

      // Nút bật tia ngắm Thủy Khẩu
      const btnAimRay = document.getElementById('th-btn-aim-ray');
      if (btnAimRay) {
        btnAimRay.addEventListener('click', () => {
          state.isRayActive = true;
          setRayAngle(curThuyKhauDeg);
          const rayContainer = document.getElementById('lakinh-ray-container');
          if (rayContainer) rayContainer.style.display = '';
          updateSightingRay();
          closeFn();
          showLaKinhToast(`🎯 Đã ngắm tia Thủy Khẩu tại ${curThuyKhauDeg.toFixed(1)}° (${thuyPhap.thuy_khau.son_name})`);
        });
      }

      // Nút sao chép báo cáo
      const btnCopyReport = document.getElementById('th-btn-copy-report');
      if (btnCopyReport) {
        btnCopyReport.addEventListener('click', () => {
          const reportText = `=== HỒ SƠ THẨM ĐỊNH PHONG THỦY TAM HỢP PHÁI (THẦY HẠNH NHẬT TẤN) ===
1. TỌA HƯỚNG NHÀ:
- Tọa: ${toaSon} (${toaDeg.toFixed(1)}°) • Hướng: ${huongSon} (${curHuongDeg.toFixed(1)}° - Cung ${thuyPhap.huong_nha.cung_bat_quai})
- Mép biên: ${thuyPhap.huong_nha.sub_zone}
- 120 Phân Kim: ${pk120.phan_kim_type} ➔ ${pk120.tinh_chat}
- 72 Xuyên Sơn Long: Long thứ ${xuyenSon72.long_index_72} (${xuyenSon72.danh_gia})

2. THỦY PHÁP TỨ ĐẠI CỤC:
- Thủy Khẩu: Sơn ${thuyPhap.thuy_khau.son_name} (${curThuyKhauDeg.toFixed(1)}°) thuộc ${thuyPhap.cuc_name}
- Dòng chảy: ${curDongChay === 'ta_dao_huu' ? 'Tả Thủy Đảo Hữu (Dương Thuận)' : 'Hữu Thủy Đảo Tả (Âm Nghịch)'}
- Cung nạp Hướng: Cung ${thuyPhap.cung_nap_huong}
- Thế Cục: ${thuyPhap.the_cuc}
- Đánh giá: ${thuyPhap.danh_gia} (${thuyPhap.khuyen_nghi})

3. SÁT KHÍ & THẦN SÁT:
- Bát Lộ Hoàng Tuyền: ${hoangTuyen.loai_sat} (${hoangTuyen.mo_ta})
- Bát Sát Tiêu Vong: ${batSat.danh_gia} (${batSat.mo_ta})
- Tam Sát năm ${curNamChi}: Phương ${tamSat.tam_sat_phuong} (${tamSat.pham_tam_sat ? 'PHẠM TAM SÁT' : 'Không Phạm'})
- Thái Tuế / Tuế Phá: ${thaiTue.danh_gia}

4. TAM CÁT THẦN TRỢ (TUỔI ${curCanChu} ${curChiChu}):
- Quý Nhân: Dương Quý tại ${tamCat.duong_quy_nhan}, Âm Quý tại ${tamCat.am_quy_nhan}
- Thiên Lộc: Sơn ${tamCat.thien_loc}
- Dịch Mã: Phương ${tamCat.dich_ma} (${maHinhThe.danh_gia})
- Nhân Bàn Tiêu Sa: Sơn ${nhanBan.son_name} (${tu28.tinh_tu_name} Tú - ${tu28.tinh_chat})

5. KẾT LUẬN TỔNG THỂ:
${isHopCach ? 'HỢP CÁCH PHONG THỦY TAM HỢP PHÁI - ĐINH TÀI LƯỠNG VƯỢNG' : 'CẦN TINH CHỈNH PHÂN KIM HOẶC XOAY CỬA CỔNG HẠN CHẾ SÁT KHÍ'}`;

          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(reportText).then(() => {
              showLaKinhToast('📋 Đã sao chép báo cáo Phong Thủy Tam Hợp vào bộ nhớ tạm!');
            }).catch(() => {
              showLaKinhToast('📋 Không thể sao chép tự động, vui lòng chọn văn bản.');
            });
          }
        });
      }
    }

    renderModal();
  }

  function bindQmdjStratEvents() {
    const btnQuick = document.getElementById('lakinh-btn-qmdj-strat');
    const btnClose = document.getElementById('btn-qmdj-hud-close');
    const btnCollapse = document.getElementById('btn-qmdj-hud-collapse');
    const btnSheetToggle = document.getElementById('sheet-btn-qmdj-strat-toggle');
    const btnViewDetail = document.getElementById('btn-qmdj-hud-view-detail');
    const btnSheetViewLink = document.getElementById('sheet-btn-qmdj-view-link');

    const btnTimePicker = document.getElementById('btn-qmdj-hud-time-picker');
    const btnResetNow = document.getElementById('btn-qmdj-reset-now');
    const btnOpenTimeFooter = document.getElementById('btn-qmdj-hud-open-time');
    const btnGuide = document.getElementById('btn-qmdj-hud-guide');

    const btnSheetChangeTime = document.getElementById('sheet-btn-qmdj-change-time');
    const btnSheetResetTime = document.getElementById('sheet-btn-qmdj-reset-time');
    const btnSheetGuide = document.getElementById('sheet-btn-qmdj-guide');

    if (btnQuick) btnQuick.addEventListener('click', () => toggleQmdjStrategicLayer());
    if (btnSheetToggle) btnSheetToggle.addEventListener('click', () => toggleQmdjStrategicLayer());
    if (btnClose) btnClose.addEventListener('click', () => toggleQmdjStrategicLayer(false));

    if (btnCollapse) {
      btnCollapse.addEventListener('click', () => {
        state.isQmdjStratHudCollapsed = !state.isQmdjStratHudCollapsed;
        const hud = document.getElementById('lakinh-qmdj-floating-hud');
        if (hud) hud.classList.toggle('is-collapsed', state.isQmdjStratHudCollapsed);
        const hudBody = document.getElementById('qmdj-hud-body');
        const hudPills = document.querySelector('.qmdj-hud-pills');
        const hudFooter = document.querySelector('.qmdj-hud-footer');
        const hudCompact = document.getElementById('qmdj-hud-compact-summary');
        if (hudBody) hudBody.style.display = state.isQmdjStratHudCollapsed ? 'none' : 'grid';
        if (hudPills) hudPills.style.display = state.isQmdjStratHudCollapsed ? 'none' : 'flex';
        if (hudFooter) hudFooter.style.display = state.isQmdjStratHudCollapsed ? 'none' : 'block';
        if (hudCompact) hudCompact.style.display = state.isQmdjStratHudCollapsed ? 'flex' : 'none';
        btnCollapse.textContent = state.isQmdjStratHudCollapsed ? '+ Mở rộng' : '– Thu gọn';
      });
    }

    if (btnTimePicker) btnTimePicker.addEventListener('click', () => openQmdjTimeModal());
    if (btnOpenTimeFooter) btnOpenTimeFooter.addEventListener('click', () => openQmdjTimeModal());
    if (btnGuide) btnGuide.addEventListener('click', () => openQmdjGuideModal());
    if (btnSheetChangeTime) btnSheetChangeTime.addEventListener('click', () => openQmdjTimeModal());
    if (btnSheetGuide) btnSheetGuide.addEventListener('click', () => openQmdjGuideModal());

    const resetToNow = () => {
      state.qmdjStratDate = null;
      updateQmdjStrategicLayer();
      if (typeof showLaKinhToast === 'function') {
        showLaKinhToast('↺ Đã quay về giờ hiện tại thực tế');
      }
    };

    if (btnResetNow) btnResetNow.addEventListener('click', resetToNow);
    if (btnSheetResetTime) btnSheetResetTime.addEventListener('click', resetToNow);

    // Goal buttons
    document.querySelectorAll('.qmdj-hud-pill-btn, .sheet-qmdj-goal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const g = btn.getAttribute('data-goal');
        if (g && g !== state.qmdjStratGoal) {
          state.qmdjStratGoal = g;
          updateQmdjStrategicLayer();
        }
      });
    });

    const switchToQmdjBoard = () => {
      if (typeof window.switchAppMode === 'function') {
        window.switchAppMode('qmdj');
      }
      setTimeout(() => {
        if (global.NetaQMDJView && typeof global.NetaQMDJView.setMode === 'function') {
          global.NetaQMDJView.setMode('chienluoc');
        }
      }, 150);
    };

    if (btnViewDetail) btnViewDetail.addEventListener('click', switchToQmdjBoard);
    if (btnSheetViewLink) btnSheetViewLink.addEventListener('click', switchToQmdjBoard);
  }

  // Public module API
  const NetaLaKinhView = {
    init: initLaKinhView,
    render: renderLaKinh,
    jumpTo: jumpToLocation,
    loadProject: loadProject,
    deleteProject: deleteProject,
    openBottomSheet: openBottomSheet,
    closeBottomSheet: closeBottomSheet,
    openHuyenKhongModal: openHuyenKhongModal,
    openHKDQModal: openHKDQModal,
    openTamHopModal: openTamHopModal,
    updateRotation: updateRotationDisplay,
    setRayAngle: setRayAngle,
    updateSightingRay: updateSightingRay,
    toggleQmdjStrategicLayer: toggleQmdjStrategicLayer,
    updateQmdjStrategicLayer: updateQmdjStrategicLayer,
    toggleTamHopLayer: toggleTamHopLayer,
    updateTamHopLayer: updateTamHopLayer,
    loadFloorPlanFile: loadFloorPlanFile,
    setFloorPlanFromDataUrl: setFloorPlanFromDataUrl,
    removeFloorPlan: removeFloorPlan,
    togglePlanPanMode: togglePlanPanMode,
    updateFloorPlanTransform: updateFloorPlanTransform
  };

  global.NetaLaKinhView = NetaLaKinhView;

})(typeof window !== 'undefined' ? window : this);
