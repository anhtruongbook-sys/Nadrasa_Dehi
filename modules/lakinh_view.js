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
    rayAngle: 0.0, // Góc độ số của tia ngắm (0.0° - 359.9°)
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
    activeLayerName: 'googleSat'
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

        <!-- Nút Nổi Bật/Tắt Tia Ngắm Trực Tiếp Trên Màn Hình (Sighting Ray FAB - Siêu Gọn Tròn 38px, Đặt Dưới) -->
        <button id="lakinh-btn-ray-float" title="Bật/Tắt Tia Ngắm Phong Thủy" aria-label="Tia ngắm">
          <span style="font-size: 1.15rem; line-height: 1;">🎯</span>
        </button>

        <!-- Đĩa La Kinh / Thước Lập Cực 36 Tầng Xuyên Thấu Siêu Nét -->
        <div id="lakinh-overlay-container" style="width: ${state.size}px; height: ${state.size}px;">
          <div id="lakinh-backdrop-circle" style="opacity: ${state.bgOpacity};"></div>
          <img id="lakinh-disc" src="${getPlateSrc(state.activePlate)}" alt="Thước Lập Cực 36 Tầng" style="opacity: ${state.discOpacity};" />
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

        <!-- Floating Ray HUD Card trên màn hình (Đầy đủ thông tin Quẻ & Hào theo tia) -->
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
            <!-- 1. Sơn Hướng -->
            <div class="ray-hud-item">
              <span class="lbl">Sơn Hướng:</span>
              <strong id="ray-hud-son" style="color: #38bdf8;">Sơn Tý (Khảm • Thủy)</strong>
            </div>

            <!-- 2. Quẻ Đại Quái (64 Quẻ) -->
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

            <!-- 3. Hào Vi Phân (384 Hào) -->
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

            <!-- 4. Lời khuyên Phong Thủy & Lục Thân Vận 9 -->
            <div id="ray-hud-advice-box" style="background: rgba(2, 132, 199, 0.12); border-left: 2px solid #38bdf8; padding: 4px 6px; border-radius: 4px; font-size: 0.68rem; color: #e2e8f0; line-height: 1.35; margin-top: 3px;">
              <div id="ray-hud-advice-van9" style="color: #facc15; font-weight: 600;">Linh Thần Vận 9</div>
              <div id="ray-hud-advice-text" style="color: #cbd5e1; margin-top: 1px;">Cần ĐỘNG KHÍ, mở Cửa, Cổng, nạp Thủy chiêu tài.</div>
            </div>

            <!-- 5. So Hướng Nhà & Nút Xem 384 Hào -->
            <div class="ray-hud-item" style="border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 4px; margin-top: 4px;">
              <span class="lbl">So Hướng Nhà:</span>
              <span id="ray-hud-diff" style="color: #f43f5e; font-weight: 700;">Trùng Chính Hướng</span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px; padding-top: 3px; border-top: 1px solid rgba(255,255,255,0.08);">
              <span id="ray-hud-ung-ky" style="color: #94a3b8; font-size: 0.63rem;"></span>
              <button type="button" id="btn-ray-hud-open-hkdq" style="background: rgba(245, 176, 65, 0.15); border: 1px solid rgba(245, 176, 65, 0.45); color: #facc15; font-size: 0.68rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; cursor: pointer;">
                🔱 Xem Đủ 6 Hào
              </button>
            </div>
          </div>
        </div>

        <!-- Mini Card Thu Gọn Của Ray HUD - Đầy Đủ 100% Thông Tin Quẻ, Khí Vận, Lục Thân, Linh/Chính Thần (Chuẩn Mực Đối Xứng Hướng Nhà) -->
        <div id="lakinh-ray-mini-pill" class="lakinh-ray-mini-card" style="display: none;">
          <!-- Hàng 1: Độ Số & Sơn Của Tia Ngắm + Các Nút Điều Khiển -->
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

          <!-- Hàng 2: Huyền Không Đại Quái Của Tia Ngắm (Tên Quẻ, Khí Vận, Hào + Lục Thân, Linh/Chính Thần) -->
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

        <!-- Banner Hướng Dẫn Kéo Dịch Tâm Mặt Bằng -->
        <div id="lakinh-plan-pan-banner" class="lakinh-floating-helper-banner" style="display: none;">
          <span>✋ Đang kéo dịch tâm mặt bằng. Hãy đưa tim nhà về chữ thập đỏ La Kinh.</span>
          <button type="button" id="btn-plan-pan-done">✓ Xong</button>
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
                <input type="range" class="lakinh-slider" id="sheet-slider-plan-scale" min="20" max="400" value="${Math.round(state.planScale * 100)}" step="5">
                <div class="lakinh-btn-row" style="margin-top: 4px;">
                  <button class="lakinh-step-btn" id="btn-scale-50">50%</button>
                  <button class="lakinh-step-btn" id="btn-scale-100">100%</button>
                  <button class="lakinh-step-btn" id="btn-scale-150">150%</button>
                  <button class="lakinh-step-btn" id="btn-scale-200">200%</button>
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
              <span class="val" id="sheet-val-ray-deg">${state.rayAngle.toFixed(1)}°</span>
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
                <span class="val" id="sheet-val-ray-deg-sub">${state.rayAngle.toFixed(1)}°</span>
              </div>
              <input type="range" class="lakinh-slider" id="sheet-slider-ray-deg" min="0" max="359.9" value="${state.rayAngle.toFixed(1)}" step="0.1">

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
      } else {
        if (mapInstance) {
          mapInstance.invalidateSize();
          setTimeout(() => { if (mapInstance) mapInstance.invalidateSize(); }, 150);
          setTimeout(() => { if (mapInstance) mapInstance.invalidateSize(); }, 400);
        } else {
          initLeafletMap();
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
    }

    if (state.isRayActive) {
      renderSurveyRay();
    }
  }

  // ================= 3.1. QUẢN LÝ MẶT BẰNG BẢN VẼ KIẾN TRÚC DƯỚI LA KINH =================
  function updateFloorPlanTransform() {
    const wrapper = document.getElementById('lakinh-floorplan-wrapper');
    const img = document.getElementById('lakinh-floorplan-img');
    if (!wrapper || !img) return;

    if (!state.planImageSrc) {
      img.style.display = 'none';
      const planWrap = document.getElementById('lakinh-plan-controls-wrap');
      if (planWrap) planWrap.style.display = 'none';
      const statusVal = document.getElementById('sheet-val-plan-status');
      if (statusVal) statusVal.textContent = 'Chưa nạp ảnh';
      const btnRemove = document.getElementById('btn-plan-remove');
      if (btnRemove) btnRemove.style.display = 'none';
      return;
    }

    img.src = state.planImageSrc;
    img.style.display = 'block';
    wrapper.style.transform = `translate(${state.planOffsetX}px, ${state.planOffsetY}px) rotate(${state.planRotation}deg) scale(${state.planScale})`;
    wrapper.style.opacity = state.planOpacity;

    // Cập nhật giá trị hiển thị trên bảng điều khiển
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
      // Tự động căn chỉnh kích thước ban đầu vừa vặn màn hình
      const vw = window.innerWidth || 360;
      const nw = img.naturalWidth || 800;
      const targetW = Math.min(vw * 0.92, 500);
      state.planScale = Math.max(0.2, Math.min(Math.round((targetW / nw) * 100) / 100, 2.5));
      state.planOffsetX = 0;
      state.planOffsetY = 0;
      state.planRotation = 0.0;
      state.planOpacity = 0.85;

      // Cập nhật DOM của Bottom Sheet nếu đang mở
      if (statusVal) statusVal.textContent = 'Đã nạp bản vẽ';
      if (controlsWrap) controlsWrap.style.display = 'block';
      if (btnRemove) btnRemove.style.display = 'block';

      // Tự động chuyển La Kinh sang Mica Trong Suốt và nền trong để thấy rõ mặt bằng bên dưới
      if (state.bgOpacity > 0.2) {
        setBgOpacity(0.15);
      }
      if (state.activePlate !== 'thuoc_trans') {
        switchPlate('thuoc_trans');
      }

      updateFloorPlanTransform();
      saveFloorPlanState();
      showLaKinhToast('✅ Đã nạp mặt bằng. Tâm ảnh trùng khớp 100% tâm La Kinh.');
    };

    if (img) {
      img.onload = onImageLoaded;
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
    const banner = document.getElementById('lakinh-plan-pan-banner');
    if (btn) {
      btn.classList.toggle('active', state.isPlanPanActive);
      btn.innerHTML = state.isPlanPanActive ? '✋ Đang Kéo Tâm (Xong)' : '✋ Kéo Dịch Tâm';
    }
    if (banner) {
      banner.style.display = state.isPlanPanActive ? 'flex' : 'none';
    }
    showLaKinhToast(state.isPlanPanActive
      ? '✋ Hãy kéo trên màn hình để đưa tim nhà trùng chữ thập đỏ La Kinh'
      : '✅ Đã cố định vị trí mặt bằng');
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
      if (data.scale) state.planScale = data.scale;
      if (data.rotation !== undefined) state.planRotation = data.rotation;
      if (data.opacity) state.planOpacity = data.opacity;
      if (data.offsetX !== undefined) state.planOffsetX = data.offsetX;
      if (data.offsetY !== undefined) state.planOffsetY = data.offsetY;
      if (data.imageSrc) {
        state.planImageSrc = data.imageSrc;
        const img = document.getElementById('lakinh-floorplan-img');
        if (img) {
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

    // Góc 0° tại 12h (thẳng đứng lên), tăng theo chiều kim đồng hồ
    const deg = ((Math.atan2(dx, -dy) * 180 / Math.PI) % 360 + 360) % 360;
    state.rayAngle = Math.round(deg * 10) / 10;
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
    const btnFloatRay = document.getElementById('lakinh-btn-ray-float');

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
      if (btnFloatRay) {
        btnFloatRay.classList.remove('active');
        btnFloatRay.title = 'Bật Tia Ngắm Phong Thủy';
      }
      if (surveyRayLayerGroup) surveyRayLayerGroup.clearLayers();
      return;
    }

    if (rayContainer) rayContainer.style.display = 'block';
    if (rayWrap) rayWrap.style.display = 'block';
    if (btnRay) {
      btnRay.classList.add('success');
      btnRay.innerHTML = '🎯 Đang Bật Tia Ngắm (Tắt)';
    }
    if (btnQuickRay) btnQuickRay.classList.add('active');
    if (btnFloatRay) {
      btnFloatRay.classList.add('active');
      btnFloatRay.title = 'Đang Bật Tia Ngắm (Chạm để tắt)';
    }

    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;

    const deg = ((state.rayAngle % 360) + 360) % 360;
    const rad = deg * Math.PI / 180;

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

    // Đồng bộ lên Leaflet map
    if (mapInstance && surveyRayLayerGroup) {
      surveyRayLayerGroup.clearLayers();
      const center = mapInstance.getCenter();
      if (global.NetaLaKinhEngine) {
        const target = global.NetaLaKinhEngine.getDestinationPoint(center.lat, center.lng, 2500, deg);
        const polyline = L.polyline([[center.lat, center.lng], [target.lat, target.lng]], {
          color: '#06b6d4',
          weight: 2.5,
          dashArray: '6, 6',
          opacity: 0.95
        });
        polyline.addTo(surveyRayLayerGroup);
      }
    }
  }

  function renderSurveyRay() {
    updateSightingRay();
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
              <span style="color:#38bdf8;font-size:11px;font-weight:800;white-space:nowrap;margin-left:3px;background:none;text-shadow:-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 1px 4px #000;">💧 ${t.name.split(' ')[0]} (${a.son})</span>
            </div>`,
            iconSize: [85, 32],
            iconAnchor: [12, 32],
            popupAnchor: [0, -32]
          })
        }).bindPopup(`<div style="font-weight:700;font-size:12px;color:#0f172a;padding:4px 6px;">💧 Thủy Khẩu ${t.name} (${a.son} • ${a.songSon})<br>Tam Hợp: ${a.cuc}<br>Cao độ: ${t.thuyKhau.elevation.toFixed(1)}m</div>`).addTo(elevationLayerGroup);
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
            • <strong>Thủy Khẩu (Thiên Bàn Phùng Châm):</strong> Sơn <span style="color:#f5b041; font-weight:700;">${a.son}</span> (${a.bearing}°) • Song Sơn <span style="color:#f5b041; font-weight:700;">${a.songSon}</span><br>
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
    }
  }

  function closeBottomSheet() {
    const sheet = document.getElementById('lakinh-bottom-sheet');
    const dockTools = document.getElementById('lakinh-dock-tools');
    if (sheet) {
      sheet.classList.remove('open');
      state.isSheetOpen = false;
      if (dockTools) dockTools.classList.remove('active');
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

    // Hàm chống bấm nhầm khi vuốt màn hình (Swipe-Safe Tap Detector):
    // Chỉ kích hoạt khi chạm dứt khoát tại chỗ (movement <= 7px), bỏ qua hoàn toàn khi đang vuốt lướt bản đồ hoặc xoay đĩa
    const attachSwipeSafeClick = (element, handler) => {
      if (!element) return;
      let startX = 0;
      let startY = 0;
      let isSwipe = false;
      let startTime = 0;

      element.addEventListener('pointerdown', (e) => {
        startX = e.clientX;
        startY = e.clientY;
        isSwipe = false;
        startTime = Date.now();
      }, { passive: true });

      element.addEventListener('pointermove', (e) => {
        const dx = Math.abs(e.clientX - startX);
        const dy = Math.abs(e.clientY - startY);
        if (dx > 7 || dy > 7) {
          isSwipe = true;
        }
      }, { passive: true });

      element.addEventListener('click', (e) => {
        if (isSwipe || (Date.now() - startTime > 450)) {
          e.preventDefault();
          e.stopPropagation();
          isSwipe = false;
          return false;
        }
        handler(e);
      });
    };

    // 2. Nút Bay Về Vị Trí Hiện Tại (Floating FAB & Bottom Dock) - Chống chạm nhầm khi vuốt
    const btnMyLocation = document.getElementById('lakinh-btn-my-location');
    if (btnMyLocation) {
      attachSwipeSafeClick(btnMyLocation, () => getCurrentGPS(false));
    }

    const dockSensor = document.getElementById('lakinh-dock-sensor');
    if (dockSensor) attachSwipeSafeClick(dockSensor, toggleCompassSensor);

    const dockGps = document.getElementById('lakinh-dock-gps');
    if (dockGps) {
      attachSwipeSafeClick(dockGps, () => getCurrentGPS(false));
    }

    const dockDem = document.getElementById('lakinh-dock-dem');
    if (dockDem) attachSwipeSafeClick(dockDem, scanElevationAndTiers);

    const dockHkdq = document.getElementById('lakinh-dock-hkdq');
    if (dockHkdq) attachSwipeSafeClick(dockHkdq, openHKDQModal);

    const quickHkdq = document.getElementById('lakinh-hkdq-quick-strip');
    if (quickHkdq) {
      quickHkdq.addEventListener('click', (e) => {
        e.stopPropagation();
        openHKDQModal();
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
    if (dockTools) attachSwipeSafeClick(dockTools, toggleBottomSheet);

    // 3. Quản lý Bảng Điều Khiển La Kinh: Chống bấm nhầm triệt để khi thao tác vuốt lên trên / xuống dưới
    const sheet = document.getElementById('lakinh-bottom-sheet');
    if (sheet) {
      let sheetTouchStartY = 0;
      let sheetTouchStartX = 0;
      let isSheetScrolling = false;
      let lastSheetScrollTime = 0;

      sheet.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) {
          sheetTouchStartY = e.touches[0].clientY;
          sheetTouchStartX = e.touches[0].clientX;
          isSheetScrolling = false;
        }
      }, { passive: true });

      sheet.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
          const dy = Math.abs(e.touches[0].clientY - sheetTouchStartY);
          const dx = Math.abs(e.touches[0].clientX - sheetTouchStartX);
          if (dy > 6 || dx > 6) {
            isSheetScrolling = true;
            lastSheetScrollTime = Date.now();
          }
        }
      }, { passive: true });

      sheet.addEventListener('scroll', () => {
        isSheetScrolling = true;
        lastSheetScrollTime = Date.now();
      }, { passive: true });

      // Lớp chắn Capture chặn hoàn toàn việc click nhầm vào các nút khi người dùng đang vuốt cuộn bảng điều khiển
      sheet.addEventListener('click', (e) => {
        if (isSheetScrolling || (Date.now() - lastSheetScrollTime < 240)) {
          e.stopPropagation();
          e.preventDefault();
          isSheetScrolling = false;
          return false;
        }
      }, true); // useCapture: true

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

    if (btnPlanPanDone) {
      btnPlanPanDone.addEventListener('click', () => togglePlanPanMode(false));
    }

    const sPlanScale = document.getElementById('sheet-slider-plan-scale');
    if (sPlanScale) {
      sPlanScale.addEventListener('input', (e) => {
        state.planScale = Math.max(0.2, Math.min(5.0, parseFloat(e.target.value) / 100.0));
        updateFloorPlanTransform();
        saveFloorPlanState();
      });
    }

    [
      { id: 'btn-scale-50', scale: 0.5 },
      { id: 'btn-scale-100', scale: 1.0 },
      { id: 'btn-scale-150', scale: 1.5 },
      { id: 'btn-scale-200', scale: 2.0 }
    ].forEach(item => {
      const btn = document.getElementById(item.id);
      if (btn) {
        btn.addEventListener('click', () => {
          state.planScale = item.scale;
          updateFloorPlanTransform();
          saveFloorPlanState();
          ['btn-scale-50', 'btn-scale-100', 'btn-scale-150', 'btn-scale-200'].forEach(id => {
            const b = document.getElementById(id);
            if (b) b.classList.toggle('active', id === item.id);
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

    // Kéo rê màn hình khi ở chế độ Kéo Dịch Tâm Mặt Bằng
    const lkContainer = document.getElementById('view-lakinh');
    let isPlanDragging = false;
    let planDragStartX = 0;
    let planDragStartY = 0;
    let planDragInitOx = 0;
    let planDragInitOy = 0;

    if (lkContainer) {
      lkContainer.addEventListener('pointerdown', (e) => {
        if (!state.isPlanPanActive) return;
        if (e.target.closest('#lakinh-bottom-sheet, #lakinh-bottom-dock, #lakinh-top-panel, #lakinh-plan-pan-banner, button')) return;
        isPlanDragging = true;
        planDragStartX = e.clientX;
        planDragStartY = e.clientY;
        planDragInitOx = state.planOffsetX;
        planDragInitOy = state.planOffsetY;
        try { lkContainer.setPointerCapture(e.pointerId); } catch (_) {}
        e.stopPropagation();
      });

      window.addEventListener('pointermove', (e) => {
        if (!isPlanDragging || !state.isPlanPanActive) return;
        const dx = e.clientX - planDragStartX;
        const dy = e.clientY - planDragStartY;
        state.planOffsetX = Math.round(planDragInitOx + dx);
        state.planOffsetY = Math.round(planDragInitOy + dy);
        updateFloorPlanTransform();
        e.stopPropagation();
      });

      const endPlanDrag = (e) => {
        if (isPlanDragging) {
          isPlanDragging = false;
          try { lkContainer.releasePointerCapture(e.pointerId); } catch (_) {}
          saveFloorPlanState();
        }
      };
      window.addEventListener('pointerup', endPlanDrag);
      window.addEventListener('pointercancel', endPlanDrag);
    }

    // ================= 3.2. SỰ KIỆN TIA NGẮM PHONG THỦY =================
    const btnRay = document.getElementById('sheet-btn-ray');
    const btnQuickRay = document.getElementById('lakinh-btn-ray-quick');
    const btnRayHudClose = document.getElementById('btn-ray-hud-close');

    const toggleSightingRay = () => {
      state.isRayActive = !state.isRayActive;
      if (state.isRayActive) {
        state.isRayHudCollapsed = false;
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

    const btnFloatRay = document.getElementById('lakinh-btn-ray-float');
    if (btnFloatRay) {
      attachSwipeSafeClick(btnFloatRay, toggleSightingRay);
    }

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
        openHKDQModal(state.rayAngle);
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
          setRayAngle(state.rayAngle + delta);
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

      targetHandle.addEventListener('pointermove', (e) => {
        if (!isTargetDragging) return;
        e.stopPropagation();
        e.preventDefault();
        onAimRayAtPoint(e.clientX, e.clientY);
      });

      const endTargetDrag = (e) => {
        if (isTargetDragging) {
          isTargetDragging = false;
          setRayHudTransparency(false);
          try { targetHandle.releasePointerCapture(e.pointerId); } catch (_) {}
        }
      };
      targetHandle.addEventListener('pointerup', endTargetDrag);
      targetHandle.addEventListener('pointercancel', endTargetDrag);
    }

    // Chạm vào màn hình để đặt tia ngắm đi qua điểm chạm
    if (lkContainer) {
      lkContainer.addEventListener('click', (e) => {
        if (e.target.closest('#lakinh-bottom-sheet, #lakinh-bottom-dock, #lakinh-top-panel, #lakinh-hud-detail-card, #lakinh-btn-ray-float, #lakinh-btn-my-location, #lakinh-ray-target-handle, #lakinh-ray-floating-hud, #lakinh-ray-mini-pill, #lakinh-plan-pan-banner, .lakinh-float-btn, .sheet-control-group, input, button')) {
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
    updateRotation: updateRotationDisplay,
    setRayAngle: setRayAngle,
    updateSightingRay: updateSightingRay,
    loadFloorPlanFile: loadFloorPlanFile,
    setFloorPlanFromDataUrl: setFloorPlanFromDataUrl,
    removeFloorPlan: removeFloorPlan,
    togglePlanPanMode: togglePlanPanMode,
    updateFloorPlanTransform: updateFloorPlanTransform
  };

  global.NetaLaKinhView = NetaLaKinhView;

})(typeof window !== 'undefined' ? window : this);
