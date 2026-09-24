/**
 * NETA LIGHT - LAKINH SATELLITE VIEW MODULE
 * Giao diện La Kinh Vệ Tinh 36 Tầng Tích Hợp Leaflet WebGIS & Viễn Thám
 */

(function (global) {
  'use strict';

  let mapInstance = null;
  let currentLayer = null;
  let layers = {};
  let elevationLayerGroup = null;
  let surveyRayLayerGroup = null;
  let polygonLayerGroup = null;

  // Trạng thái hoạt động của La Kinh
  let state = {
    opacity: 0.70,
    size: 520,
    rotation: 0.0,
    targetRotation: 0.0,
    isSensorActive: false,
    isLocked: false,
    isRayActive: false,
    isTracingPlot: false,
    polygonPoints: [],
    declination: -1.34,
    centerElevation: 19.0,
    centerCoords: [21.028511, 105.854167], // Mặc định Hà Nội
    isDrawerCollapsed: false
  };

  function initLaKinhView() {
    const container = document.getElementById('view-lakinh');
    if (!container) return;
    renderLaKinh();
  }

  function renderLaKinh() {
    const container = document.getElementById('view-lakinh');
    if (!container) return;

    if (!container.querySelector('#lakinh-map')) {
      container.innerHTML = `
        <div id="lakinh-map"></div>
        <div id="lakinh-crosshair"></div>

        <!-- Đĩa La Kinh 36 Tầng Xuyên Thấu -->
        <div id="lakinh-overlay-container" style="width: ${state.size}px; height: ${state.size}px;">
          <img id="lakinh-disc" src="assets/lakinh/la_kinh_36_tang_vector.svg" alt="La Kinh 36 Tầng" style="opacity: ${state.opacity};">
        </div>

        <!-- Top Bar: Tìm kiếm & Tiện ích bản đồ -->
        <div id="lakinh-top-bar" class="lakinh-glass">
          <div class="lakinh-search-box">
            <span style="color: #ef4444; font-size: 0.8rem;">📍</span>
            <input type="text" id="lakinh-search-input" placeholder="Nhập địa chỉ hoặc tọa độ..." value="Hồ Hoàn Kiếm, Hà Nội">
            <button class="lakinh-btn-icon" id="lakinh-btn-search" title="Tìm kiếm">🔍</button>
          </div>
          <button class="lakinh-btn-header" id="lakinh-btn-layer" title="Chuyển lớp vệ tinh">
            🗺️ Vệ Tinh
          </button>
          <button class="lakinh-btn-header" id="lakinh-btn-gps" title="Vị trí GPS của tôi">
            🎯 GPS
          </button>
          <button class="lakinh-btn-header" id="lakinh-btn-projects" title="Hồ sơ khảo sát">
            📁 Hồ Sơ
          </button>
        </div>

        <!-- HUD: Thông số góc và Sơn vị thời gian thực -->
        <div id="lakinh-hud" class="lakinh-glass">
          <div class="lakinh-hud-title">ĐỘ SỐ HƯỚNG NHÀ</div>
          <div class="lakinh-hud-degree" id="lakinh-disp-degree">0.0°</div>
          <div class="lakinh-hud-son" id="lakinh-disp-son">Sơn Tý (Chính Bắc)</div>
          <div class="lakinh-hud-detail" id="lakinh-disp-detail">
            Cung: Khảm • Hành: Thủy<br>
            Tọa Ngọ Hướng Tý (Bắc 0.0°)
          </div>
          <div class="lakinh-badge-row">
            <div class="lakinh-badge" id="lakinh-disp-declination">
              🧭 Từ thiên: -1.34° (Tây)
            </div>
            <div class="lakinh-badge green" id="lakinh-disp-elev">
              ⛰️ Cao độ: 19.0 m
            </div>
          </div>
        </div>

        <!-- Drawer: Bảng điều khiển công cụ -->
        <div id="lakinh-drawer" class="lakinh-glass">
          <div class="lakinh-drawer-header" id="lakinh-drawer-toggle-btn">
            <div class="lakinh-drawer-title">
              <span>⚙️ BẢNG ĐIỀU KHIỂN LA KINH</span>
            </div>
            <span class="lakinh-drawer-toggle" id="lakinh-drawer-toggle-txt">Thu gọn ▾</span>
          </div>

          <div id="lakinh-drawer-body">
            <!-- Độ trong suốt & Kích thước -->
            <div class="lakinh-control-group">
              <div class="lakinh-control-label">
                <span>Độ trong suốt</span>
                <span class="val" id="lakinh-val-opacity">70%</span>
              </div>
              <input type="range" class="lakinh-slider" id="lakinh-slider-opacity" min="5" max="100" value="70">
            </div>

            <div class="lakinh-control-group">
              <div class="lakinh-control-label">
                <span>Kích thước La Kinh</span>
                <span class="val" id="lakinh-val-size">520 px</span>
              </div>
              <input type="range" class="lakinh-slider" id="lakinh-slider-size" min="260" max="950" value="520" step="10">
            </div>

            <!-- Xoay góc hướng nhà -->
            <div class="lakinh-control-group">
              <div class="lakinh-control-label">
                <span>Góc hướng nhà</span>
                <span class="val" id="lakinh-val-rotation">0.0°</span>
              </div>
              <input type="range" class="lakinh-slider" id="lakinh-slider-rotation" min="0" max="360" value="0" step="0.5">
              <div class="lakinh-btn-row">
                <button class="lakinh-step-btn" id="btn-rot-m5">-5°</button>
                <button class="lakinh-step-btn" id="btn-rot-m1">-1°</button>
                <button class="lakinh-step-btn" id="btn-rot-p1">+1°</button>
                <button class="lakinh-step-btn" id="btn-rot-p5">+5°</button>
              </div>
            </div>

            <!-- Cảm biến La Bàn & Khóa Góc -->
            <div class="lakinh-control-group">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                <button id="lakinh-btn-sensor" class="lakinh-action-btn">
                  🧭 La Bàn Live
                </button>
                <button id="lakinh-btn-lock" class="lakinh-action-btn secondary">
                  🔓 Khóa Góc
                </button>
              </div>
              <label style="font-size: 0.68rem; display: flex; align-items: center; gap: 6px; cursor: pointer; color: #94a3b8; margin-top: 6px;">
                <input type="checkbox" id="lakinh-chk-autodec" checked style="accent-color: #38bdf8;">
                <span>Tự động bù từ thiên WMM cho cảm biến</span>
              </label>
            </div>

            <!-- Thủy Khẩu & Auto Zoom Cấp Cục -->
            <div class="lakinh-control-group">
              <div class="lakinh-control-label">
                <span>Auto Zoom Cấp Cục Minh Đường</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; margin-bottom: 6px;">
                <button class="lakinh-step-btn" id="btn-zoom-tieu">🔍 Tiểu (40m)</button>
                <button class="lakinh-step-btn" id="btn-zoom-trung">🔍 Trung (350m)</button>
                <button class="lakinh-step-btn" id="btn-zoom-dai">🔍 Đại (2km)</button>
              </div>

              <button id="lakinh-btn-scan-elev" class="lakinh-action-btn warning">
                🌊 Quét Cao Độ DEM & Định Tứ Đại Cục
              </button>
              <button id="lakinh-btn-ray" class="lakinh-action-btn">
                🎯 Bật Tia Ngắm Viễn Thám
              </button>
              <button id="lakinh-btn-huyenkhong" class="lakinh-action-btn purple">
                ☯️ Lập Tinh Bàn Huyền Không Vận 9
              </button>
              <button id="lakinh-btn-centroid" class="lakinh-action-btn secondary">
                📐 Vẽ Ranh Đất / Tìm Tim Nhà
              </button>
            </div>

            <!-- Lưu & Xuất file -->
            <div class="lakinh-control-group" style="margin-bottom: 0;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                <button id="lakinh-btn-save" class="lakinh-action-btn success">
                  💾 Lưu Hồ Sơ
                </button>
                <button id="lakinh-btn-kml" class="lakinh-action-btn secondary">
                  📄 Tải file KML
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Modals -->
        <div id="lakinh-modal-container"></div>
      `;

      initLeafletMap();
      bindLaKinhEvents();
    } else {
      if (mapInstance) {
        setTimeout(() => mapInstance.invalidateSize(), 100);
      }
    }
  }

  // Khởi tạo bản đồ Leaflet
  function initLeafletMap() {
    if (typeof L === 'undefined') {
      console.warn('Leaflet thư viện chưa tải xong.');
      return;
    }

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

    L.control.zoom({ position: 'topright' }).addTo(mapInstance);

    layers = {
      googleSat: L.tileLayer('https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        maxZoom: 22,
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

    // Sự kiện khi bản đồ di chuyển
    mapInstance.on('move', onMapMove);
    mapInstance.on('moveend', onMapMoveEnd);
    mapInstance.on('click', onMapClick);

    // Cập nhật WMM và HUD ban đầu
    updateLocationHUD(state.centerCoords[0], state.centerCoords[1]);
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

    const decEl = document.getElementById('lakinh-disp-declination');
    if (decEl) {
      decEl.innerHTML = `🧭 Từ thiên (WMM): ${wmm.text}`;
    }
  }

  // Cập nhật hiển thị HUD và xoay La Kinh
  function updateRotationDisplay(deg) {
    state.rotation = ((deg % 360) + 360) % 360;
    const rounded = Math.round(state.rotation * 10) / 10;

    const disc = document.getElementById('lakinh-disc');
    if (disc) {
      disc.style.transform = `rotate(${rounded}deg)`;
    }

    const dispDeg = document.getElementById('lakinh-disp-degree');
    const dispSon = document.getElementById('lakinh-disp-son');
    const dispDetail = document.getElementById('lakinh-disp-detail');
    const valRot = document.getElementById('lakinh-val-rotation');
    const sliderRot = document.getElementById('lakinh-slider-rotation');

    if (dispDeg) dispDeg.textContent = `${rounded.toFixed(1)}°`;
    if (valRot) valRot.textContent = `${rounded.toFixed(1)}°`;
    if (sliderRot && parseFloat(sliderRot.value) !== rounded) {
      sliderRot.value = rounded;
    }

    if (global.NetaLaKinhEngine) {
      const son = global.NetaLaKinhEngine.getSonInfo(rounded);
      const toa = global.NetaLaKinhEngine.getSonInfo((rounded + 180) % 360);
      if (dispSon) {
        dispSon.textContent = `Sơn ${son.name} (${son.cung})`;
      }
      if (dispDetail) {
        dispDetail.innerHTML = `
          Cung: ${son.cung} • Hành: ${son.hanh}<br>
          Tọa ${toa.name} Hướng ${son.name} (${rounded.toFixed(1)}°)
        `;
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

  // Thao tác vẽ ranh đất / tìm tim nhà
  function onMapClick(e) {
    if (!state.isTracingPlot) return;
    state.polygonPoints.push(e.latlng);

    polygonLayerGroup.clearLayers();

    // Vẽ các đỉnh và đường bao
    state.polygonPoints.forEach((pt, idx) => {
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
              html: `<div style="background:#ef4444;color:#fff;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:700;white-space:nowrap;box-shadow:0 0 8px #000;">🎯 Tim Đất (${centroid.areaM2} m²)</div>`,
              iconSize: [80, 20],
              iconAnchor: [40, 10]
            })
          }).addTo(polygonLayerGroup);

          // Tự động căn tâm bản đồ vào tim thửa đất
          mapInstance.panTo([centroid.lat, centroid.lng]);
        }
      }
    }
  }

  // Quét Cao Độ & Minh Đường Cục
  async function scanElevationAndTiers() {
    if (!mapInstance || !global.NetaLaKinhEngine) return;
    const center = mapInstance.getCenter();

    showLaKinhToast('⏳ Đang quét cao độ số DEM 3 cấp cự ly...');
    elevationLayerGroup.clearLayers();

    try {
      const result = await global.NetaLaKinhEngine.analyzeMinhDuongCuc(center.lat, center.lng);
      state.centerElevation = result.center.elevation;

      const elevEl = document.getElementById('lakinh-disp-elev');
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

        // Đánh dấu Thủy Khẩu điểm trũng nhất
        L.marker([t.thuyKhau.lat, t.thuyKhau.lng], {
          icon: L.divIcon({
            className: 'custom-watermouth-marker',
            html: `<div style="background:#0284c7;color:#fff;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:700;white-space:nowrap;box-shadow:0 0 6px #000;">💧 Thủy Khẩu ${t.name.split(' ')[0]} (${t.thuyKhau.son})</div>`,
            iconSize: [90, 20],
            iconAnchor: [45, 10]
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
        <div style="background: rgba(30,41,59,0.7); border: 1px solid ${t.color}; border-radius: 8px; padding: 10px; margin-bottom: 10px;">
          <div style="font-weight: 700; font-size: 0.8rem; color: ${t.color}; margin-bottom: 6px;">
            ${t.name} (Bán kính ${t.radiusM}m)
          </div>
          <div style="font-size: 0.72rem; line-height: 1.45; color: #e2e8f0;">
            • <strong>Thủy Khẩu (Điểm trũng nhất):</strong> Sơn ${tk.son} (${tk.bearing.toFixed(1)}°) • Cao độ: ${tk.elevation.toFixed(1)}m (Chênh ${tk.deltaElev >= 0 ? '+' : ''}${tk.deltaElev.toFixed(1)}m)<br>
            • <strong>Tam Hợp Thủy Pháp:</strong> <span style="color: #38bdf8; font-weight: 700;">${a.cuc}</span> (${a.tamHop})<br>
            • <strong>Cung vị:</strong> ${a.viTriTruongSinh} • <strong>Đánh giá:</strong> ${a.danhGia}<br>
            • <strong>Lai Long (Gốc cao nhất):</strong> Sơn ${ll.son} (${ll.bearing.toFixed(1)}°) • Cao độ: ${ll.elevation.toFixed(1)}m (Chênh +${ll.deltaElev.toFixed(1)}m)<br>
            <div style="margin-top: 6px;">
              <a href="${a.googleMapsUrl}" target="_blank" style="color: #f5b041; text-decoration: underline; font-size: 0.68rem;">📍 Mở vị trí Thủy Khẩu trên Google Maps</a>
            </div>
          </div>
        </div>
      `;
    }

    modalBox.innerHTML = `
      <div class="lakinh-modal-overlay" id="modal-minhduong-overlay">
        <div class="lakinh-glass lakinh-modal-dialog">
          <div class="lakinh-modal-header">
            <div class="lakinh-modal-title">🌊 KHẢO SÁT CAO ĐỘ MINH ĐƯỜNG CỤC</div>
            <button class="lakinh-modal-close" onclick="document.getElementById('modal-minhduong-overlay').remove()">✕</button>
          </div>
          <div style="font-size: 0.72rem; color: #94a3b8; margin-bottom: 10px;">
            Tâm trạch: ${data.center.lat.toFixed(6)}, ${data.center.lng.toFixed(6)} • Cao độ gốc: ${data.center.elevation.toFixed(1)}m
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
        <div class="lakinh-glass lakinh-modal-dialog">
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
          <div style="font-size: 0.65rem; color: #94a3b8; line-height: 1.35; margin-bottom: 10px;">
            * Chú giải: Số bên trái (xanh lam) là <strong>Tọa Tinh</strong>; Số bên phải (đỏ) là <strong>Hướng Tinh</strong>; Số ở dưới là <strong>Vận Tinh</strong>.
          </div>
          <button class="lakinh-action-btn" onclick="document.getElementById('modal-hk-overlay').remove()">Đóng</button>
        </div>
      </div>
    `;
  }

  // Quản lý Hồ sơ Khảo sát (LocalStorage)
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
        <div class="lakinh-glass lakinh-modal-dialog">
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

  // Xuất file KML Google Earth
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

  // Cảm biến La Bàn con quay hồi chuyển & Bộ lọc thông thấp
  function toggleCompassSensor() {
    const btn = document.getElementById('lakinh-btn-sensor');
    if (!state.isSensorActive) {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(resp => {
          if (resp === 'granted') startSensorListening(btn);
          else showLaKinhToast('Cần cấp quyền cảm biến la bàn');
        }).catch(err => {
          showLaKinhToast('Thiết bị không hỗ trợ quyền cảm biến');
        });
      } else {
        startSensorListening(btn);
      }
    } else {
      stopSensorListening(btn);
    }
  }

  function startSensorListening(btn) {
    state.isSensorActive = true;
    if (btn) {
      btn.style.background = '#16a34a';
      btn.innerHTML = '🧭 Đang Đọc La Bàn';
    }
    window.addEventListener('deviceorientationabsolute', handleOrientationEvent, true);
    window.addEventListener('deviceorientation', handleOrientationEvent, true);
    showLaKinhToast('Đã kích hoạt cảm biến la bàn thực địa');
  }

  function stopSensorListening(btn) {
    state.isSensorActive = false;
    if (btn) {
      btn.style.background = '#0284c7';
      btn.innerHTML = '🧭 La Bàn Live';
    }
    window.removeEventListener('deviceorientationabsolute', handleOrientationEvent, true);
    window.removeEventListener('deviceorientation', handleOrientationEvent, true);
    showLaKinhToast('Đã dừng cảm biến la bàn');
  }

  function handleOrientationEvent(e) {
    if (!state.isSensorActive || state.isLocked) return;

    let heading = 0;
    if (e.webkitCompassHeading != null) {
      // Thiết bị iOS Safari
      heading = e.webkitCompassHeading;
    } else if (e.alpha != null) {
      // Android
      heading = 360 - e.alpha;
    }

    const chkAutoDec = document.getElementById('lakinh-chk-autodec');
    if (chkAutoDec && chkAutoDec.checked) {
      heading = (heading + state.declination + 360) % 360;
    }

    // Bộ lọc thông thấp chống rung (Low-pass smoothing: alpha = 0.18)
    const alpha = 0.18;
    let diff = heading - state.rotation;
    while (diff < -180) diff += 360;
    while (diff > 180) diff -= 360;

    const smoothed = state.rotation + alpha * diff;
    updateRotationDisplay(smoothed);
  }

  function toggleLockHeading() {
    state.isLocked = !state.isLocked;
    const btn = document.getElementById('lakinh-btn-lock');
    if (btn) {
      if (state.isLocked) {
        btn.style.background = '#dc2626';
        btn.innerHTML = '🔒 Đã Khóa';
        showLaKinhToast('🔒 Đã khóa góc hướng nhà');
      } else {
        btn.style.background = '#334155';
        btn.innerHTML = '🔓 Khóa Góc';
        showLaKinhToast('🔓 Đã mở khóa góc');
      }
    }
  }

  // Tìm kiếm địa chỉ qua Nominatim OpenStreetMap
  async function searchLocation() {
    const input = document.getElementById('lakinh-search-input');
    if (!input || !input.value.trim()) return;
    const q = input.value.trim();

    // Kiểm tra nếu là tọa độ Lat, Lng
    const coordMatch = q.match(/^([-+]?[0-9]*\.?[0-9]+)[\s,]+([-+]?[0-9]*\.?[0-9]+)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (mapInstance) {
        mapInstance.setView([lat, lng], 19);
        showLaKinhToast(`Đã bay đến tọa độ: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
      return;
    }

    showLaKinhToast('🔍 Đang tìm kiếm...');
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=vn&limit=1`;
      const resp = await fetch(url, { headers: { 'User-Agent': 'NetaLight/1.5' } });
      const data = await resp.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        if (mapInstance) {
          mapInstance.setView([lat, lon], 19);
          showLaKinhToast(`📍 ${data[0].display_name.split(',')[0]}`);
        }
      } else {
        showLaKinhToast('Không tìm thấy địa điểm');
      }
    } catch (e) {
      showLaKinhToast('Lỗi kết nối tìm kiếm');
    }
  }

  function getCurrentGPS() {
    if (!navigator.geolocation) {
      showLaKinhToast('Thiết bị không hỗ trợ GPS');
      return;
    }
    showLaKinhToast('🛰️ Đang lấy tọa độ GPS...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (mapInstance) {
          mapInstance.setView([lat, lng], 20);
          showLaKinhToast(`Đã định vị: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
      },
      (err) => {
        showLaKinhToast('Không lấy được vị trí GPS');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function switchMapLayer() {
    if (!mapInstance) return;
    const btn = document.getElementById('lakinh-btn-layer');
    if (currentLayer === layers.googleSat) {
      mapInstance.removeLayer(layers.googleSat);
      currentLayer = layers.esriSat;
      currentLayer.addTo(mapInstance);
      if (btn) btn.innerHTML = '🗺️ Esri Sat';
    } else if (currentLayer === layers.esriSat) {
      mapInstance.removeLayer(layers.esriSat);
      currentLayer = layers.osm;
      currentLayer.addTo(mapInstance);
      if (btn) btn.innerHTML = '🗺️ Bản Đồ Phố';
    } else {
      mapInstance.removeLayer(layers.osm);
      currentLayer = layers.googleSat;
      currentLayer.addTo(mapInstance);
      if (btn) btn.innerHTML = '🗺️ Vệ Tinh';
    }
  }

  function showLaKinhToast(msg) {
    if (typeof global.showToast === 'function') {
      global.showToast(msg);
    } else {
      console.log(msg);
    }
  }

  // Gán sự kiện điều khiển
  function bindLaKinhEvents() {
    // Drawer thu gọn / mở rộng
    const drawerToggleBtn = document.getElementById('lakinh-drawer-toggle-btn');
    const drawer = document.getElementById('lakinh-drawer');
    const drawerTxt = document.getElementById('lakinh-drawer-toggle-txt');
    if (drawerToggleBtn && drawer) {
      drawerToggleBtn.addEventListener('click', () => {
        state.isDrawerCollapsed = !state.isDrawerCollapsed;
        drawer.classList.toggle('collapsed', state.isDrawerCollapsed);
        if (drawerTxt) {
          drawerTxt.textContent = state.isDrawerCollapsed ? 'Mở rộng ▴' : 'Thu gọn ▾';
        }
      });
    }

    // Sliders
    const sOpacity = document.getElementById('lakinh-slider-opacity');
    const valOpacity = document.getElementById('lakinh-val-opacity');
    const disc = document.getElementById('lakinh-disc');
    if (sOpacity) {
      sOpacity.addEventListener('input', (e) => {
        state.opacity = e.target.value / 100.0;
        if (disc) disc.style.opacity = state.opacity;
        if (valOpacity) valOpacity.textContent = `${e.target.value}%`;
      });
    }

    const sSize = document.getElementById('lakinh-slider-size');
    const valSize = document.getElementById('lakinh-val-size');
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

    const sRot = document.getElementById('lakinh-slider-rotation');
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
    bindStep('btn-rot-m5', -5);
    bindStep('btn-rot-m1', -1);
    bindStep('btn-rot-p1', 1);
    bindStep('btn-rot-p5', 5);

    // Zoom buttons
    const btnZoomTieu = document.getElementById('btn-zoom-tieu');
    if (btnZoomTieu) btnZoomTieu.addEventListener('click', () => mapInstance && mapInstance.setZoom(20));

    const btnZoomTrung = document.getElementById('btn-zoom-trung');
    if (btnZoomTrung) btnZoomTrung.addEventListener('click', () => mapInstance && mapInstance.setZoom(17));

    const btnZoomDai = document.getElementById('btn-zoom-dai');
    if (btnZoomDai) btnZoomDai.addEventListener('click', () => mapInstance && mapInstance.setZoom(14));

    // Live Sensor & Lock
    const btnSensor = document.getElementById('lakinh-btn-sensor');
    if (btnSensor) btnSensor.addEventListener('click', toggleCompassSensor);

    const btnLock = document.getElementById('lakinh-btn-lock');
    if (btnLock) btnLock.addEventListener('click', toggleLockHeading);

    // Actions
    const btnScanElev = document.getElementById('lakinh-btn-scan-elev');
    if (btnScanElev) btnScanElev.addEventListener('click', scanElevationAndTiers);

    const btnRay = document.getElementById('lakinh-btn-ray');
    if (btnRay) {
      btnRay.addEventListener('click', () => {
        state.isRayActive = !state.isRayActive;
        btnRay.classList.toggle('success', state.isRayActive);
        btnRay.innerHTML = state.isRayActive ? '🎯 Đang Bật Tia Ngắm' : '🎯 Bật Tia Ngắm Viễn Thám';
        renderSurveyRay();
      });
    }

    const btnHK = document.getElementById('lakinh-btn-huyenkhong');
    if (btnHK) btnHK.addEventListener('click', openHuyenKhongModal);

    const btnCentroid = document.getElementById('lakinh-btn-centroid');
    if (btnCentroid) {
      btnCentroid.addEventListener('click', () => {
        state.isTracingPlot = !state.isTracingPlot;
        if (state.isTracingPlot) {
          state.polygonPoints = [];
          if (polygonLayerGroup) polygonLayerGroup.clearLayers();
          btnCentroid.style.background = '#eab308';
          btnCentroid.innerHTML = '📐 Chạm các góc ranh đất...';
          showLaKinhToast('Chạm vào các đỉnh góc của thửa đất trên ảnh vệ tinh');
        } else {
          btnCentroid.style.background = '#334155';
          btnCentroid.innerHTML = '📐 Vẽ Ranh Đất / Tìm Tim Nhà';
        }
      });
    }

    const btnSave = document.getElementById('lakinh-btn-save');
    if (btnSave) btnSave.addEventListener('click', saveCurrentProject);

    const btnKML = document.getElementById('lakinh-btn-kml');
    if (btnKML) btnKML.addEventListener('click', exportKML);

    // Top Bar Buttons
    const btnSearch = document.getElementById('lakinh-btn-search');
    if (btnSearch) btnSearch.addEventListener('click', searchLocation);

    const inputSearch = document.getElementById('lakinh-search-input');
    if (inputSearch) {
      inputSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') searchLocation();
      });
    }

    const btnLayer = document.getElementById('lakinh-btn-layer');
    if (btnLayer) btnLayer.addEventListener('click', switchMapLayer);

    const btnGPS = document.getElementById('lakinh-btn-gps');
    if (btnGPS) btnGPS.addEventListener('click', getCurrentGPS);

    const btnProjects = document.getElementById('lakinh-btn-projects');
    if (btnProjects) btnProjects.addEventListener('click', openProjectsModal);
  }

  // Public module API
  const NetaLaKinhView = {
    init: initLaKinhView,
    render: renderLaKinh,
    loadProject: loadProject,
    deleteProject: deleteProject
  };

  global.NetaLaKinhView = NetaLaKinhView;

})(typeof window !== 'undefined' ? window : this);
