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
    isRayActive: false,
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
        <div id="lakinh-crosshair"></div>

        <!-- Nút Nổi Bay Về Vị Trí Hiện Tại (My Location FAB) -->
        <button id="lakinh-btn-my-location" title="Bay về vị trí GPS thực tế hiện tại của bạn">
          <span style="font-size: 1.15rem; line-height: 1;">🎯</span>
          <span>Về Vị Trí Hiện Tại</span>
        </button>

        <!-- Đĩa La Kinh / Thước Lập Cực 36 Tầng Xuyên Thấu Siêu Nét -->
        <div id="lakinh-overlay-container" style="width: ${state.size}px; height: ${state.size}px;">
          <div id="lakinh-backdrop-circle" style="opacity: ${state.bgOpacity};"></div>
          <img id="lakinh-disc" src="${state.activePlate === 'gold' ? 'assets/lakinh/thuoc_lap_cuc_gold.png' : (state.activePlate === 'thuoc_lap_cuc' ? 'assets/lakinh/thuoc_lap_cuc.png' : 'assets/lakinh/thuoc_lap_cuc_trans.png')}" alt="Thước Lập Cực 36 Tầng" style="opacity: ${state.discOpacity};">
          <div id="lakinh-target-pointer"></div>
        </div>

        <!-- 1. Thanh Tiện Ích & HUD Siêu Mỏng Trên Cùng -->
        <div id="lakinh-top-strip">
          <button class="lakinh-float-btn icon-only" id="lakinh-btn-search" title="Tìm địa chỉ / tọa độ">
            🔍
          </button>

          <!-- HUD Pill Căn Giữa -->
          <div id="lakinh-hud-pill" title="Chạm để xem thông số chi tiết">
            <span class="hud-pill-deg" id="hud-pill-deg">0.0°</span>
            <span class="hud-pill-son" id="hud-pill-son">Sơn Tý (Khảm)</span>
            <span class="hud-pill-arrow" id="hud-pill-arrow">▾</span>
          </div>

          <div style="display: flex; gap: 4px;">
            <button class="lakinh-float-btn" id="lakinh-btn-layer" title="Chuyển lớp bản đồ">
              🛰️ Vệ Tinh
            </button>
            <button class="lakinh-float-btn icon-only" id="lakinh-btn-projects" title="Hồ sơ khảo sát">
              📁
            </button>
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
          <div class="hud-card-row" style="margin-top: 6px;">
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
            🎯 Vị Trí
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
              <span>Kích thước La Kinh</span>
              <span class="val" id="sheet-val-size">${state.size} px</span>
            </div>
            <input type="range" class="lakinh-slider" id="sheet-slider-size" min="260" max="1400" value="${state.size}" step="10">
          </div>

          <!-- Xoay góc hướng nhà & Vi chỉnh -->
          <div class="sheet-control-group">
            <div class="sheet-control-label">
              <span>Góc hướng nhà</span>
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

          <!-- Tùy chọn la bàn & Cảm biến -->
          <div class="sheet-control-group">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <button id="sheet-btn-lock" class="lakinh-action-btn secondary">
                🔓 Khóa Góc Hiện Tại
              </button>
              <button id="sheet-btn-ray" class="lakinh-action-btn secondary">
                🎯 Bật Tia Ngắm Viễn Thám
              </button>
            </div>
            <label style="font-size: 0.7rem; display: flex; align-items: center; gap: 6px; cursor: pointer; color: #94a3b8; margin-top: 8px;">
              <input type="checkbox" id="lakinh-chk-autodec" checked style="accent-color: #38bdf8;">
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
        attribution: 'Google Satellite'
      }),
      esriSat: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Esri World Imagery'
      }),
      osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
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
    }

    if (state.isRayActive) {
      renderSurveyRay();
    }
  }

  // Tia ngắm viễn thám
  function renderSurveyRay() {
    if (!mapInstance || !surveyRayLayerGroup) return;
    surveyRayLayerGroup.clearLayers();
    if (!state.isRayActive) return;

    const center = mapInstance.getCenter();
    if (!global.NetaLaKinhEngine) return;

    const target = global.NetaLaKinhEngine.getDestinationPoint(center.lat, center.lng, 2500, state.rotation);
    const polyline = L.polyline([[center.lat, center.lng], [target.lat, target.lng]], {
      color: '#ef4444',
      weight: 2.5,
      dashArray: '6, 6',
      opacity: 0.95
    });
    polyline.addTo(surveyRayLayerGroup);
  }

  // ================= 4. ĐỊNH VỊ GPS VỆ TINH 2 TẦNG (HIGH ACCURACY + FALLBACK) =================
  function getCurrentGPS(silent = false) {
    if (!navigator.geolocation) {
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

    const btn = document.getElementById('lakinh-dock-gps');
    const fab = document.getElementById('lakinh-btn-my-location');
    if (btn) btn.classList.add('pulse-radar-active');
    if (fab) fab.classList.add('pulse-radar-active');

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
      if (btn) btn.innerHTML = '🌍 Esri Sat';
      showLaKinhToast('Chuyển sang: Ảnh Vệ Tinh Esri');
    } else if (currentLayer === layers.esriSat) {
      mapInstance.removeLayer(layers.esriSat);
      currentLayer = layers.osm;
      currentLayer.addTo(mapInstance);
      if (btn) btn.innerHTML = '🗺️ Bản Đồ Phố';
      showLaKinhToast('Chuyển sang: Bản Đồ Đường Phố');
    } else {
      mapInstance.removeLayer(layers.osm);
      currentLayer = layers.googleSat;
      currentLayer.addTo(mapInstance);
      if (btn) btn.innerHTML = '🛰️ Vệ Tinh';
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

        // Đánh dấu Thủy Khẩu điểm trũng nhất (Thiên Bàn Phùng Châm)
        const a = t.thuyKhau.analysis;
        L.marker([t.thuyKhau.lat, t.thuyKhau.lng], {
          icon: L.divIcon({
            className: 'custom-watermouth-marker',
            html: `<div style="background:#0284c7;color:#fff;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;white-space:nowrap;box-shadow:0 0 8px rgba(0,0,0,0.8);">💧 Thủy Khẩu ${t.name.split(' ')[0]} (${a.son} • ${a.songSon})</div>`,
            iconSize: [110, 20],
            iconAnchor: [55, 10]
          })
        }).addTo(elevationLayerGroup);
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

  // Mở Modal Huyền Không Phi Tinh Vận 9
  function openHuyenKhongModal() {
    const modalBox = document.getElementById('lakinh-modal-container');
    if (!modalBox || !global.NetaLaKinhEngine) return;

    closeBottomSheet();
    const hk = global.NetaLaKinhEngine.generateHuyenKhongMatrix(state.rotation, 9);

    let cellsHtml = '';
    hk.grid.forEach(cell => {
      cellsHtml += `
        <div class="lakinh-palace-cell ${cell.isCenter ? 'center' : ''}">
          <div class="lakinh-palace-name">${cell.name}</div>
          <div class="lakinh-palace-stars">
            <span class="lakinh-star-mountain" title="Tọa Tinh">${cell.mountainStar}</span>
            <span class="lakinh-star-facing" title="Hướng Tinh">${cell.facingStar}</span>
          </div>
          <div class="lakinh-star-period" title="Vận Tinh">${cell.vanStar}</div>
        </div>
      `;
    });

    modalBox.innerHTML = `
      <div class="lakinh-modal-overlay" id="modal-hk-overlay">
        <div class="lakinh-glass-panel lakinh-modal-dialog">
          <div class="lakinh-modal-header">
            <div class="lakinh-modal-title">☯️ HUYỀN KHÔNG PHI TINH (VẬN 9)</div>
            <button class="lakinh-modal-close" onclick="document.getElementById('modal-hk-overlay').remove()">✕</button>
          </div>
          <div style="font-size: 0.72rem; color: #cbd5e1; margin-bottom: 8px;">
            Tọa ${hk.sonToa.name} Hướng ${hk.sonFacing.name} (${hk.facingDeg.toFixed(1)}°) • Hạ Nguyên Vận 9 (2024-2043)
          </div>
          <div class="lakinh-nine-grid">
            ${cellsHtml}
          </div>
          <div style="font-size: 0.68rem; color: #94a3b8; line-height: 1.4; margin-bottom: 12px;">
            * Chú giải: Số bên trái (xanh lam) là <strong>Tọa Tinh</strong>; Số bên phải (đỏ) là <strong>Hướng Tinh</strong>; Số ở dưới là <strong>Vận Tinh</strong>.
          </div>
          <button class="lakinh-action-btn" onclick="document.getElementById('modal-hk-overlay').remove()">Đóng</button>
        </div>
      </div>
    `;
  }

  // Quản lý Bottom Sheet
  function openBottomSheet() {
    const sheet = document.getElementById('lakinh-bottom-sheet');
    if (sheet) {
      sheet.classList.add('open');
      state.isSheetOpen = true;
    }
  }

  function closeBottomSheet() {
    const sheet = document.getElementById('lakinh-bottom-sheet');
    if (sheet) {
      sheet.classList.remove('open');
      state.isSheetOpen = false;
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

    hasReceivedAbsoluteEvent = false;

    // 1. Luồng tuyệt đối True North / Magnetic chuẩn (Android Chrome / Chromium)
    const onAbsolute = (e) => {
      if (!state.isSensorActive || state.isLocked) return;
      hasReceivedAbsoluteEvent = true;
      processSensorHeading(e, true);
    };

    // 2. Luồng thông thường (iOS Safari webkitCompassHeading hoặc Android fallback)
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

    // A. iOS Safari: webkitCompassHeading (0-360 chuẩn, đã được CoreMotion bù nghiêng phần cứng)
    if (typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading)) {
      heading = e.webkitCompassHeading;
    } 
    // B. Android / Chromium: alpha, beta, gamma
    else if (typeof e.alpha === 'number' && !isNaN(e.alpha)) {
      const alpha = e.alpha;
      const beta = e.beta;
      const gamma = e.gamma;

      // Áp dụng thuật toán bù góc nghiêng 3D Euler (3D Tilt Compensation)
      if (typeof beta === 'number' && typeof gamma === 'number') {
        const degToRad = Math.PI / 180;
        const b = beta * degToRad;

        // Khi điện thoại cầm nghiêng bình thường (beta < 75 độ):
        let h = (360 - alpha) % 360;
        // Bù góc xoay cổ tay roll (gamma) để triệt tiêu dao động khi nghiêng lắc tay
        if (Math.abs(gamma) > 2) {
          h = (h - gamma * Math.sin(b) + 360) % 360;
        }
        heading = h;
      } else {
        heading = (360 - alpha) % 360;
      }

      // Bù hướng xoay màn hình (Screen orientation angle)
      const screenAngle = (window.screen && window.screen.orientation && typeof window.screen.orientation.angle === 'number')
        ? window.screen.orientation.angle
        : (typeof window.orientation === 'number' ? window.orientation : 0);

      heading = (heading + screenAngle + 360) % 360;
    }

    if (heading == null || isNaN(heading)) return;

    // Tùy chọn bù từ thiên WMM
    const chkAutoDec = document.getElementById('lakinh-chk-autodec');
    if (chkAutoDec && chkAutoDec.checked && !isAbsolute) {
      heading = (heading + state.declination + 360) % 360;
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
    updateRotationDisplay(smoothed);
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
              html: `<div style="background:#ef4444;color:#fff;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;white-space:nowrap;box-shadow:0 0 8px #000;">🎯 Tim Đất (${centroid.areaM2} m²)</div>`,
              iconSize: [80, 20],
              iconAnchor: [40, 10]
            })
          }).addTo(polygonLayerGroup);

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
          className: 'custom-search-marker',
          html: `<div style="background:#0284c7;color:#fff;padding:3px 8px;border-radius:12px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 0 10px rgba(0,0,0,0.8);border:1px solid #38bdf8;">📍 ${name}</div>`,
          iconSize: [120, 24],
          iconAnchor: [60, 24]
        })
      }).addTo(searchMarkerLayerGroup);
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
  function promptSearchLocation(isGpsBlocked = false) {
    const modalBox = document.getElementById('lakinh-modal-container');
    if (!modalBox) return;

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
    if (isGpsBlocked) {
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

    // 2. Nút Bay Về Vị Trí Hiện Tại (Floating FAB & Bottom Dock)
    const btnMyLocation = document.getElementById('lakinh-btn-my-location');
    if (btnMyLocation) {
      btnMyLocation.addEventListener('click', () => getCurrentGPS(false));
    }

    const dockSensor = document.getElementById('lakinh-dock-sensor');
    if (dockSensor) dockSensor.addEventListener('click', toggleCompassSensor);

    const dockGps = document.getElementById('lakinh-dock-gps');
    if (dockGps) {
      dockGps.addEventListener('click', () => getCurrentGPS(false));
    }

    const dockDem = document.getElementById('lakinh-dock-dem');
    if (dockDem) dockDem.addEventListener('click', scanElevationAndTiers);

    const dockTools = document.getElementById('lakinh-dock-tools');
    if (dockTools) dockTools.addEventListener('click', openBottomSheet);

    // 3. Bottom Sheet controls
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
        if (type === 'thuoc_lap_cuc') {
          disc.src = 'assets/lakinh/thuoc_lap_cuc.png';
          showLaKinhToast('📄 Đã đổi sang: Bản Giấy Trắng Cổ Điển');
        } else if (type === 'gold') {
          disc.src = 'assets/lakinh/thuoc_lap_cuc_gold.png';
          showLaKinhToast('✨ Đã đổi sang: Thước Lập Cực Dạ Quang Vàng Kim (Chuyên Vệ Tinh)');
        } else {
          disc.src = 'assets/lakinh/thuoc_lap_cuc_trans.png';
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
    if (sSize) {
      sSize.addEventListener('input', (e) => {
        state.size = parseInt(e.target.value, 10);
        if (container) {
          container.style.width = `${state.size}px`;
          container.style.height = `${state.size}px`;
        }
        if (valSize) valSize.textContent = `${state.size} px`;
      });
    }

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

    const btnRay = document.getElementById('sheet-btn-ray');
    if (btnRay) {
      btnRay.addEventListener('click', () => {
        state.isRayActive = !state.isRayActive;
        btnRay.classList.toggle('success', state.isRayActive);
        btnRay.innerHTML = state.isRayActive ? '🎯 Đang Bật Tia Ngắm' : '🎯 Bật Tia Ngắm Viễn Thám';
        renderSurveyRay();
      });
    }

    const btnScanElev = document.getElementById('sheet-btn-scan-elev');
    if (btnScanElev) btnScanElev.addEventListener('click', scanElevationAndTiers);

    const btnHK = document.getElementById('sheet-btn-huyenkhong');
    if (btnHK) btnHK.addEventListener('click', openHuyenKhongModal);

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
    loadProject: loadProject,
    deleteProject: deleteProject,
    openBottomSheet: openBottomSheet,
    closeBottomSheet: closeBottomSheet
  };

  global.NetaLaKinhView = NetaLaKinhView;

})(typeof window !== 'undefined' ? window : this);
