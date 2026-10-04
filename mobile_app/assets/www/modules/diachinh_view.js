/**
 * NETA LIGHT - MODULE ĐỊA CHÍNH & SỔ ĐỎ (VN-2000 TO LA KINH & GOOGLE EARTH)
 * Bóc tách tọa độ VN-2000, tính diện tích ranh đất, phương vị 24 Sơn Vị
 * 1-Click chuyển giao tim thửa đất & mặt bằng vào La Kinh Vệ Tinh (36 Tầng)
 */

(function (global) {
  'use strict';

  let containerEl = null;

  const state = {
    provinceKey: 'Hà Nội',
    parcelName: '',
    coordText: '',
    currentParcel: null,
    isInitialized: false,
    viewMode: 'map', // 'map' or 'svg'
    currentLayerKey: 'googleSat', // 'googleSat', 'esriSat', 'googleRoad'
    isPointsLocked: true, // Mặc định khóa điểm để di chuyển bản đồ tự do, mở khóa để kéo mốc
    isNumbersVisible: true // Ẩn / Hiện số thứ tự mốc, kích thước cạnh và diện tích ranh đất
  };

  let dcMapInstance = null;
  let dcCurrentLayer = null;
  let dcLayers = {};
  let dcPolygonLayer = null;
  let dcMarkersGroup = null;
  let dcMidpointGroup = null;

  // Helper escape
  function escapeHTML(str) {
    if (typeof str !== 'string') return str == null ? '' : String(str);
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Khởi tạo giao diện sạch (không nạp mẫu thử)
  function init(container) {
    containerEl = container || document.getElementById('view-diachinh');
    if (!containerEl) return;

    if (!state.isInitialized || !containerEl.querySelector('.dc-container')) {
      render();
      state.isInitialized = true;
    } else {
      if (dcMapInstance) {
        setTimeout(() => { dcMapInstance.invalidateSize(); }, 100);
      }
    }
  }

  // Render toàn bộ View giao diện Địa chính
  function render() {
    if (!containerEl) {
      containerEl = document.getElementById('view-diachinh');
      if (!containerEl) return;
    }

    const engine = global.NetaDiaChinhEngine;
    if (!engine) {
      containerEl.innerHTML = '<div style="padding:20px;color:#ef4444;">Chưa tải được NetaDiaChinhEngine</div>';
      return;
    }

    const provList = engine.getAllProvinces();
    const curProv = engine.getProvince(state.provinceKey) || { name: 'Hà Nội', ktt: 105.0 };

    // Tự động phân tích thửa đất nếu đã có dữ liệu người dùng nhập
    if (!state.currentParcel && state.coordText) {
      try {
        state.currentParcel = engine.processParcel(state.coordText, state.provinceKey, state.parcelName);
      } catch (e) {
        console.warn('Lỗi phân tích ranh đất ban đầu:', e);
      }
    }

    // HTML Template
    let html = `
      <div class="dc-container">
        <!-- Panel 1: Thiết lập & Nhập Tọa Độ Sổ Đỏ -->
        <div class="dc-panel">
          <div class="dc-panel-title">
            <div class="title-left">
              <span>📐</span>
              <span>Tọa Độ Sổ Đỏ &amp; Ranh Thửa Đất (VN-2000)</span>
            </div>
            <div class="dc-badge-ktt" id="dc-badge-ktt-display">KTT: ${curProv.ktt}°00' (3°)</div>
          </div>

          <!-- Tỉnh/Thành & Tên Thửa -->
          <div class="dc-row">
            <div class="dc-col" style="flex: 1.2;">
              <label class="dc-label" for="dc-select-province">Tỉnh / Thành Phố (KTT)</label>
              <select id="dc-select-province" class="dc-select">
                ${provList.map(p => `
                  <option value="${p.id}" ${p.id === state.provinceKey ? 'selected' : ''}>
                    ${escapeHTML(p.name)} (${p.ktt}° - ${p.zone3 ? 'Múi 3°' : 'Múi 6°'})
                  </option>
                `).join('')}
              </select>
            </div>
            <div class="dc-col" style="flex: 1;">
              <label class="dc-label" for="dc-input-parcel-name">Tên Thửa / Ký Hiệu</label>
              <input type="text" id="dc-input-parcel-name" class="dc-input" value="${escapeHTML(state.parcelName)}" placeholder="Nhập tên thửa, số tờ, số thửa (VD: Thửa 12, Tờ 5)">
            </div>
          </div>

          <!-- Khung Textarea Nhập Tọa độ X Y -->
          <div class="dc-col" style="margin-bottom: 8px;">
            <label class="dc-label" for="dc-textarea-coords">Bảng Liệt Kê Tọa Độ Góc Ranh (X - Y hoặc Đỉnh X Y)</label>
            <div class="dc-textarea-container">
              <textarea id="dc-textarea-coords" class="dc-textarea" placeholder="Dán hoặc nhập danh sách tọa độ VN-2000 từ sổ đỏ (X, Y hoặc Đỉnh X Y):
1   2320145.20   587632.10
2   2320180.50   587655.40
3   2320160.20   587702.80
...">${escapeHTML(state.coordText)}</textarea>
            </div>
            <div class="dc-textarea-tools">
              <button type="button" class="dc-tool-btn" id="dc-btn-paste">📋 Dán Tọa Độ</button>
              <button type="button" class="dc-tool-btn" id="dc-btn-clear">🗑️ Xóa</button>
              <button type="button" class="dc-tool-btn" id="dc-btn-upload">📁 Nạp File (Excel, CSV, TXT)</button>
              <input type="file" id="dc-file-input" accept=".xlsx,.xls,.csv,.txt" style="display:none;">
            </div>
          </div>

          <!-- Nhóm Nút Xuất Tệp & Bản Đồ Ngoài -->
          <div class="dc-action-group">
            <div class="dc-btn-grid">
              <button type="button" class="dc-btn-secondary" id="dc-btn-export-kml">
                <span>📥</span>
                <span>KML Earth</span>
              </button>
              <button type="button" class="dc-btn-secondary" id="dc-btn-export-csv">
                <span>📊</span>
                <span>Bảng CSV</span>
              </button>
              <button type="button" class="dc-btn-secondary" id="dc-btn-open-gmaps">
                <span>📍</span>
                <span>Google Maps</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Panel 2: Kết Quả Đo Đạc, Diện Tích & 24 Sơn Vị Ranh Đất -->
        <div id="dc-results-area">
          ${renderResultsHTML(state.currentParcel)}
        </div>
      </div>
    `;

    containerEl.innerHTML = html;
    bindEvents();
    bindResultsEvents();
    initOrUpdateDcMap();
  }

  // Render phần thống kê và bảng biểu kết quả
  function renderResultsHTML(parcel) {
    if (!parcel || !parcel.vertices || parcel.vertices.length < 3) {
      return `
        <div class="dc-panel" style="text-align:center;padding:30px 16px;">
          <div style="font-size:2.2rem;margin-bottom:8px;">📐</div>
          <div style="font-size:0.95rem;font-weight:700;" class="dc-empty-title">Chưa Có Dữ Liệu Tọa Độ Thửa Đất</div>
          <div style="font-size:0.8rem;margin-top:6px;line-height:1.5;" class="dc-empty-desc">
            Vui lòng dán hoặc nhập tối thiểu 3 điểm mốc tọa độ VN-2000 (X - Y) từ Giấy chứng nhận quyền sử dụng đất (Sổ đỏ) hoặc nạp từ tệp.
          </div>
        </div>
      `;
    }

    const c = parcel.centroid;
    const prov = parcel.province;
    const formattedArea = parcel.areaM2.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
    const formattedPerimeter = parcel.perimeterM.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 2 });

    // SVG shape calculation
    const svgContent = renderSvgPreview(parcel.vertices, parcel.centroid);

    return `
      <!-- Hero Card Thống Kê Thửa Đất -->
      <div class="dc-hero-card">
        <div class="dc-hero-top">
          <div>
            <div class="dc-hero-name">${escapeHTML(parcel.parcelName || 'Thửa Đất')}</div>
            <div class="dc-hero-location">📍 ${escapeHTML(prov.name)} • Kinh tuyến trục ${prov.ktt}°00' (Múi 3°)</div>
          </div>
          <div class="dc-hero-area-badge">
            <div class="dc-hero-area-val">${formattedArea}</div>
            <div class="dc-hero-area-unit">m² (${parcel.areaSao ? parcel.areaSao + ' sào' : 'mét vuông'})</div>
          </div>
        </div>

        <div class="dc-hero-stats-grid">
          <div class="dc-stat-box">
            <span class="dc-stat-label">Số Đỉnh Góc</span>
            <span class="dc-stat-val">${parcel.vertexCount} mốc ranh</span>
          </div>
          <div class="dc-stat-box">
            <span class="dc-stat-label">Chu Vi Thửa</span>
            <span class="dc-stat-val">${formattedPerimeter} m</span>
          </div>
          <div class="dc-stat-box">
            <span class="dc-stat-label">Vĩ Độ Tim (WGS84)</span>
            <span class="dc-stat-val" title="${c.lat}">${c.lat.toFixed(6)}°</span>
          </div>
          <div class="dc-stat-box">
            <span class="dc-stat-label">Kinh Độ Tim (WGS84)</span>
            <span class="dc-stat-val" title="${c.lng}">${c.lng.toFixed(6)}°</span>
          </div>
        </div>
      </div>

      <!-- Preview Hình Học Đa Giác Ranh Đất & Bản Đồ Vệ Tinh 3 Chế Độ -->
      <div class="dc-panel" style="margin-top:12px;">
        <div class="dc-panel-title">
          <div class="title-left">
            <span>🛰️</span>
            <span>Bản Đồ Vệ Tinh &amp; Ranh Thửa Đất</span>
          </div>
          <div class="title-right">
            <!-- Chuyển đổi Vệ Tinh / Sơ Đồ Hình Học SVG -->
            <button type="button" class="dc-tool-btn" id="dc-btn-toggle-viewmode" title="Chuyển giữa Bản đồ vệ tinh và Sơ đồ hình học SVG">
              <span id="dc-viewmode-icon">${state.viewMode === 'svg' ? '🛰️' : '📐'}</span>
              <span id="dc-viewmode-text">${state.viewMode === 'svg' ? 'Xem Vệ Tinh' : 'Xem Sơ Đồ'}</span>
            </button>
          </div>
        </div>

        <!-- Thanh công cụ bản đồ: Khóa mốc & 3 Chế độ bản đồ vệ tinh -->
        <div class="dc-map-toolbar-row">
          <div style="display:flex;align-items:center;gap:4px;">
            <!-- Nút Khóa / Mở Khóa Điểm -->
            <button type="button" class="dc-tool-btn dc-btn-lock ${state.isPointsLocked ? '' : 'is-unlocked'}" id="dc-btn-toggle-lock" title="Chạm để mở khóa di chuyển mốc tọa độ trên bản đồ">
              <span class="lock-icon" id="dc-lock-icon">${state.isPointsLocked ? '🔒' : '🔓'}</span>
              <span class="lock-text" id="dc-lock-text">${state.isPointsLocked ? 'Khóa Điểm' : 'Mở Khóa (Di Điểm)'}</span>
            </button>
            <!-- Nút Ẩn / Hiện Số Thứ Tự Mốc & Kích Thước -->
            <button type="button" class="dc-btn-toggle-nums ${state.isNumbersVisible !== false ? 'active' : 'is-off'}" id="dc-btn-toggle-nums" title="Ẩn / Hiện số thứ tự mốc và kích thước cạnh">
              <span id="dc-nums-icon">${state.isNumbersVisible !== false ? '🏷️' : '🙈'}</span>
              <span id="dc-nums-text">${state.isNumbersVisible !== false ? 'Số' : 'Ẩn'}</span>
            </button>
          </div>
          <!-- 3 Chế Độ Bản Đồ Vệ Tinh -->
          <div class="dc-map-layer-switcher" id="dc-map-layer-switcher">
            <button type="button" class="dc-layer-btn ${state.currentLayerKey === 'googleSat' ? 'active' : ''}" data-layer="googleSat" title="Ảnh vệ tinh Google Hybrid">Vệ Tinh</button>
            <button type="button" class="dc-layer-btn ${state.currentLayerKey === 'esriSat' ? 'active' : ''}" data-layer="esriSat" title="Ảnh vệ tinh Esri Clarity">Esri</button>
            <button type="button" class="dc-layer-btn ${state.currentLayerKey === 'googleRoad' ? 'active' : ''}" data-layer="googleRoad" title="Bản đồ giao thông Google">Giao Thông</button>
          </div>
        </div>

        <!-- Khung Bản Đồ Leaflet -->
        <div id="dc-map-container" class="dc-map-container" style="${state.viewMode === 'svg' ? 'display:none;' : 'display:block;'}">
          <div id="dc-leaflet-map" class="${state.isNumbersVisible === false ? 'hide-parcel-numbers' : ''}"></div>
          <div id="dc-drag-hint" class="dc-map-drag-hint" style="${state.isPointsLocked ? 'display:none;' : 'display:block;'}">
            💡 Đang mở khóa: Chạm và kéo các mốc ranh để tinh chỉnh tọa độ trực tiếp trên bản đồ
          </div>
        </div>

        <!-- Khung Sơ Đồ Hình Học SVG (Tỉ lệ 1:1) -->
        <div id="dc-svg-container" class="dc-preview-container ${state.isNumbersVisible === false ? 'hide-parcel-numbers' : ''}" style="${state.viewMode === 'svg' ? 'display:flex;' : 'display:none;'}">
          ${svgContent}
        </div>

        <!-- Nút Đưa Vào La Kinh Lập Cực & Tầm Long Điểm Huyệt -->
        <div class="dc-map-action-wrap" style="margin-top: 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <button type="button" class="dc-btn-primary-lakinh" id="dc-btn-go-lakinh" title="Đưa ranh thửa đất vào La Kinh Vệ Tinh để lập cực phong thủy">
            <span>🧭</span>
            <span>La Kinh Lập Cực</span>
          </button>
          <button type="button" class="dc-btn-primary-tamlong" id="dc-btn-go-tamlong" style="background: linear-gradient(135deg, #b45309 0%, #d97706 100%); color: #ffffff; border: 1px solid rgba(251, 191, 36, 0.4); border-radius: 8px; padding: 10px 12px; font-weight: 700; font-size: 0.82rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 3px 10px rgba(180, 83, 9, 0.35);" title="Lấy tim khu đất chuyển sang Tab Tầm Long Điểm Huyệt để phân tích Loan Đầu, Tứ Tượng và DEM">
            <span>🏔️</span>
            <span>Tầm Long Điểm Huyệt</span>
          </button>
        </div>
      </div>

      <!-- Bảng Phương Vị 24 Sơn Vị Các Cạnh Ranh -->
      <div class="dc-panel" style="margin-top:12px;">
        <div class="dc-panel-title">
          <div class="title-left">
            <span>🧭</span>
            <span>Phương Vị 24 Sơn Vị &amp; Chiều Dài Các Cạnh</span>
          </div>
          <div class="dc-badge-ktt">${parcel.edges.length} đoạn ranh</div>
        </div>
        <div class="dc-table-wrapper">
          <table class="dc-edges-table">
            <thead>
              <tr>
                <th>Đoạn Ranh</th>
                <th>Chiều Dài</th>
                <th>Góc Phương Vị</th>
                <th>24 Sơn Vị</th>
                <th>Bát Quái &amp; Hành</th>
              </tr>
            </thead>
            <tbody>
              ${parcel.edges.map(e => {
                const son = e.sonVi;
                const sonClass = son ? getElementBadgeClass(son.nguHanh) : '';
                return `
                  <tr>
                    <td><span class="dc-edge-badge">${e.from} ➔ ${e.to}</span></td>
                    <td style="font-weight:700;">${e.lengthM.toFixed(2)} m</td>
                    <td style="font-family:ui-monospace,Menlo,Consolas,monospace;">${e.bearingDeg.toFixed(1)}°</td>
                    <td>
                      <span class="dc-son-badge ${sonClass}">
                        ${son ? son.name : e.huong} (${son ? son.cung : ''})
                      </span>
                    </td>
                    <td>
                      <span style="font-size:0.75rem;color:#94a3b8;">
                        ${son ? `${son.cung} • Hành ${son.nguHanh}` : ''}
                      </span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Bảng Tọa Độ VN-2000 Chuyển Đổi Sang WGS84 -->
      <div class="dc-panel" style="margin-top:12px;">
        <div class="dc-panel-title">
          <div class="title-left">
            <span>📍</span>
            <span>Bảng Tọa Độ Chi Tiết (VN-2000 &amp; WGS-84)</span>
          </div>
          <div class="dc-badge-ktt">WGS-84 GPS</div>
        </div>
        <div class="dc-table-wrapper">
          <table class="dc-vertices-table">
            <thead>
              <tr>
                <th>Mốc</th>
                <th>X (Bắc - m)</th>
                <th>Y (Đông - m)</th>
                <th>Vĩ Độ (Lat)</th>
                <th>Kinh Độ (Lng)</th>
              </tr>
            </thead>
            <tbody>
              ${parcel.vertices.map(v => `
                <tr>
                  <td style="font-weight:700;color:#facc15;">${v.id}</td>
                  <td>${v.x.toFixed(2)}</td>
                  <td>${v.y.toFixed(2)}</td>
                  <td>${v.lat.toFixed(7)}°</td>
                  <td>${v.lng.toFixed(7)}°</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function getElementBadgeClass(element) {
    switch (element) {
      case 'Kim': return 'dc-son-kim';
      case 'Mộc': return 'dc-son-moc';
      case 'Thủy': return 'dc-son-thuy';
      case 'Hỏa': return 'dc-son-hoa';
      case 'Thổ': return 'dc-son-tho';
      default: return 'dc-son-kim';
    }
  }

  // Tạo mã SVG vẽ đa giác ranh đất chuẩn tỉ lệ 1:1
  function renderSvgPreview(vertices, centroid) {
    if (!vertices || vertices.length < 3) return '';

    // Tìm bounding box theo tọa độ VN-2000:
    // X = Northing (Up), Y = Easting (Right)
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    vertices.forEach(v => {
      if (v.x < minX) minX = v.x;
      if (v.x > maxX) maxX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.y > maxY) maxY = v.y;
    });

    const spanX = Math.max(maxX - minX, 1.0);
    const spanY = Math.max(maxY - minY, 1.0);

    const viewW = 340;
    const viewH = 190;
    const pad = 28;

    const availW = viewW - pad * 2;
    const availH = viewH - pad * 2;

    // Giữ tỉ lệ 1:1 thực địa
    const scale = Math.min(availW / spanY, availH / spanX);

    const offsetX = (viewW - spanY * scale) / 2;
    const offsetY = (viewH - spanX * scale) / 2;

    function toSvg(x, y) {
      // Easting y -> SVG x
      const svgX = offsetX + (y - minY) * scale;
      // Northing x -> SVG y (đảo ngược vì trục Y của SVG hướng xuống)
      const svgY = viewH - (offsetY + (x - minX) * scale);
      return { x: svgX, y: svgY };
    }

    const pts = vertices.map(v => {
      const p = toSvg(v.x, v.y);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(' ');

    // Tính tâm đồ họa SVG
    const centerSvg = toSvg(centroid.x, centroid.y);

    // Điểm mốc vẽ nhãn
    const vertexSvgs = vertices.map(v => {
      const p = toSvg(v.x, v.y);
      return { id: v.id, x: p.x, y: p.y };
    });

    return `
      <svg class="dc-svg-shape" viewBox="0 0 ${viewW} ${viewH}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="dc-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <!-- Thân thửa đất -->
        <polygon points="${pts}" fill="rgba(245, 176, 65, 0.22)" stroke="#f59e0b" stroke-width="2.5" stroke-linejoin="round" filter="url(#dc-glow)"/>

        <!-- Trục La Kinh Thập Tự tại tâm -->
        <line x1="${centerSvg.x - 14}" y1="${centerSvg.y}" x2="${centerSvg.x + 14}" y2="${centerSvg.y}" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="2,2"/>
        <line x1="${centerSvg.x}" y1="${centerSvg.y - 14}" x2="${centerSvg.x}" y2="${centerSvg.y + 14}" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="2,2"/>
        <circle cx="${centerSvg.x}" cy="${centerSvg.y}" r="4" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/>
        <text x="${centerSvg.x + 6}" y="${centerSvg.y - 6}" font-size="10" font-weight="bold" fill="#ef4444">🎯 Tim Đất</text>

        <!-- Các mốc ranh -->
        ${vertexSvgs.map(v => `
          <g>
            <circle cx="${v.x}" cy="${v.y}" r="4.5" fill="#ffffff" stroke="#f59e0b" stroke-width="2"/>
            <text x="${v.x + 5}" y="${v.y - 5}" font-size="9" font-weight="bold" fill="#38bdf8" text-anchor="start">${v.id}</text>
          </g>
        `).join('')}

        <!-- Kim chỉ Bắc -->
        <g transform="translate(24, 28)">
          <line x1="0" y1="12" x2="0" y2="-12" stroke="#ef4444" stroke-width="2"/>
          <polygon points="0,-16 -4,-8 4,-8" fill="#ef4444"/>
          <text x="0" y="-19" font-size="9" font-weight="bold" fill="#ef4444" text-anchor="middle">B</text>
        </g>
      </svg>
    `;
  }

  // Gắn các sự kiện tương tác
  function bindEvents() {
    const selProvince = document.getElementById('dc-select-province');
    const inputParcelName = document.getElementById('dc-input-parcel-name');
    const textareaCoords = document.getElementById('dc-textarea-coords');
    const btnPaste = document.getElementById('dc-btn-paste');
    const btnClear = document.getElementById('dc-btn-clear');
    const fileInput = document.getElementById('dc-file-input');
    const btnGoLaKinh = document.getElementById('dc-btn-go-lakinh');
    const btnExportKml = document.getElementById('dc-btn-export-kml');
    const btnExportCsv = document.getElementById('dc-btn-export-csv');
    const btnOpenGmaps = document.getElementById('dc-btn-open-gmaps');

    // Chọn tỉnh thành
    if (selProvince) {
      selProvince.addEventListener('change', () => {
        state.provinceKey = selProvince.value;
        const curProv = global.NetaDiaChinhEngine.getProvince(state.provinceKey);
        const badge = document.getElementById('dc-badge-ktt-display');
        if (badge && curProv) {
          badge.textContent = `KTT: ${curProv.ktt}°00' (${curProv.zone3 ? '3°' : '6°'})`;
        }
        reprocessAndRefresh();
      });
    }

    // Tên thửa đất
    if (inputParcelName) {
      inputParcelName.addEventListener('input', () => {
        state.parcelName = inputParcelName.value.trim();
        if (state.currentParcel) {
          state.currentParcel.parcelName = state.parcelName;
          const heroName = document.querySelector('.dc-hero-name');
          if (heroName) heroName.textContent = state.parcelName || 'Thửa Đất';
        }
      });
    }

    // Nhập tọa độ
    if (textareaCoords) {
      textareaCoords.addEventListener('input', () => {
        state.coordText = textareaCoords.value;
        reprocessAndRefresh();
      });
    }

    // Nút Dán tọa độ
    if (btnPaste) {
      btnPaste.addEventListener('click', async () => {
        try {
          if (navigator.clipboard && navigator.clipboard.readText) {
            const text = await navigator.clipboard.readText();
            if (text && textareaCoords) {
              textareaCoords.value = text;
              state.coordText = text;
              reprocessAndRefresh();
              showToast('Đã dán tọa độ từ Clipboard');
            }
          } else {
            showToast('Trình duyệt không hỗ trợ đọc clipboard tự động, hãy nhấn Ctrl+V');
          }
        } catch (e) {
          showToast('Hãy nhấn phím Ctrl+V để dán');
        }
      });
    }

    const btnUpload = document.getElementById('dc-btn-upload');

    // Nút Xóa
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        if (textareaCoords) textareaCoords.value = '';
        state.coordText = '';
        state.currentParcel = null;
        reprocessAndRefresh();
      });
    }

    // Nạp file (Excel .xlsx, .xls, .csv, .txt)
    if (btnUpload) {
      btnUpload.addEventListener('click', () => {
        // Kiểm tra nếu chạy trên Android Flutter WebView có NativeBridge
        if (window.NativeBridge && typeof window.NativeBridge.postMessage === 'function') {
          try {
            window.NativeBridge.postMessage(JSON.stringify({ action: 'pickDataFile' }));
            return;
          } catch (e) {
            console.warn('NativeBridge pickDataFile failed, falling back to file input:', e);
          }
        }
        if (fileInput) {
          fileInput.value = '';
          fileInput.click();
        }
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        handleIncomingFile(file);
      });
    }

    // 1-Click: ĐƯA VÀO LA KINH LẬP CỰC
    if (btnGoLaKinh) {
      btnGoLaKinh.addEventListener('click', () => {
        importToLaKinh();
      });
    }

    // Tải KML
    if (btnExportKml) {
      btnExportKml.addEventListener('click', () => {
        exportKML();
      });
    }

    // Xuất CSV
    if (btnExportCsv) {
      btnExportCsv.addEventListener('click', () => {
        exportCSV();
      });
    }

    // Mở Google Maps
    if (btnOpenGmaps) {
      btnOpenGmaps.addEventListener('click', () => {
        openGoogleMaps();
      });
    }
  }

  // Xử lý nạp tệp từ Web File Input hoặc kéo thả
  function handleIncomingFile(file) {
    if (!file) return;
    const name = file.name || 'tap_tin_toa_do';
    const lower = name.toLowerCase();

    if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const buffer = evt.target.result;
          applyParsedExcel(buffer, name);
        } catch (err) {
          showToast('⚠️ Lỗi đọc tệp Excel: ' + (err.message || String(err)));
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // .csv, .txt
      const reader = new FileReader();
      reader.onload = (evt) => {
        const content = evt.target.result;
        applyParsedText(content, name);
      };
      reader.readAsText(file, 'utf-8');
    }
  }

  // Áp dụng kết quả bóc tách từ Excel
  function applyParsedExcel(dataOrBase64, filename) {
    const engine = global.NetaDiaChinhEngine;
    if (!engine || typeof engine.parseExcelData !== 'function') {
      showToast('⚠️ Chưa sẵn sàng module phân tích Excel.');
      return;
    }
    const res = engine.parseExcelData(dataOrBase64, filename);
    if (!res.success) {
      showToast('⚠️ ' + (res.error || 'Không đọc được dữ liệu từ tệp Excel'));
      return;
    }

    if (res.provinceKey) {
      state.provinceKey = res.provinceKey;
      const selProvince = document.getElementById('dc-select-province');
      if (selProvince) selProvince.value = res.provinceKey;
      const curProv = engine.getProvince(state.provinceKey);
      const badge = document.getElementById('dc-badge-ktt-display');
      if (badge && curProv) {
        badge.textContent = `KTT: ${curProv.ktt}°00' (${curProv.zone3 ? '3°' : '6°'})`;
      }
    }

    if (res.parcelName) {
      state.parcelName = res.parcelName;
      const inputParcelName = document.getElementById('dc-input-parcel-name');
      if (inputParcelName) inputParcelName.value = res.parcelName;
    }

    const textareaCoords = document.getElementById('dc-textarea-coords');
    if (textareaCoords) textareaCoords.value = res.coordText;
    state.coordText = res.coordText;

    reprocessAndRefresh();
    showToast(`✅ Đã nạp thành công ${res.pointCount} mốc từ Excel: ${filename}`);
  }

  // Áp dụng nội dung văn bản thuần (.txt, .csv)
  function applyParsedText(content, filename) {
    const textareaCoords = document.getElementById('dc-textarea-coords');
    if (textareaCoords) textareaCoords.value = content;
    state.coordText = content;
    if (!state.parcelName && filename) {
      state.parcelName = filename.replace(/\.(txt|csv)$/i, '').replace(/[_-]/g, ' ').trim();
      const inputParcelName = document.getElementById('dc-input-parcel-name');
      if (inputParcelName) inputParcelName.value = state.parcelName;
    }
    reprocessAndRefresh();
    showToast(`✅ Đã nạp dữ liệu từ: ${filename}`);
  }

  // Nhận dữ liệu từ Native Android App qua Channel pickDataFile
  window._onNativeDataFileReceived = function(data) {
    if (!data) return;
    try {
      const fileData = typeof data === 'string' ? JSON.parse(data) : data;
      const fileName = fileData.filename || 'tap_tin_toa_do.xlsx';
      const base64Str = fileData.base64 || '';
      if (!base64Str) return;

      const lower = fileName.toLowerCase();
      if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || !lower.includes('.')) {
        applyParsedExcel(base64Str, fileName);
      } else {
        const binaryString = atob(base64Str);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const text = new TextDecoder('utf-8').decode(bytes);
        applyParsedText(text, fileName);
      }
    } catch (e) {
      showToast('⚠️ Lỗi nạp tệp từ thiết bị: ' + (e.message || String(e)));
    }
  };

  // Tải mẫu thửa đất
  function loadSample(sampleKey) {
    const engine = global.NetaDiaChinhEngine;
    if (!engine || !engine.SAMPLE_PARCELS) return;

    const sample = engine.SAMPLE_PARCELS[sampleKey];
    if (!sample) return;

    state.provinceKey = sample.provinceKey;
    state.parcelName = sample.name;
    state.coordText = sample.text;

    const selProv = document.getElementById('dc-select-province');
    if (selProv) selProv.value = sample.provinceKey;

    const inputName = document.getElementById('dc-input-parcel-name');
    if (inputName) inputName.value = sample.name;

    const txtCoords = document.getElementById('dc-textarea-coords');
    if (txtCoords) txtCoords.value = sample.text;

    const badge = document.getElementById('dc-badge-ktt-display');
    const curProv = engine.getProvince(state.provinceKey);
    if (badge && curProv) {
      badge.textContent = `KTT: ${curProv.ktt}°00' (${curProv.zone3 ? '3°' : '6°'})`;
    }

    reprocessAndRefresh();
    showToast(`Đã nạp mẫu: ${sample.name}`);
  }

  // Khởi tạo hoặc cập nhật bản đồ vệ tinh trong Địa Chính
  function initOrUpdateDcMap() {
    const mapEl = document.getElementById('dc-leaflet-map');
    if (!mapEl || !state.currentParcel || !state.currentParcel.vertices || state.currentParcel.vertices.length < 3) {
      if (dcMapInstance) {
        try { dcMapInstance.remove(); } catch (e) {}
        dcMapInstance = null;
      }
      return;
    }

    if (typeof L === 'undefined') {
      setTimeout(initOrUpdateDcMap, 200);
      return;
    }

    // Nếu DOM container đã bị thay mới bởi renderResultsHTML hoặc dcMapInstance chưa có
    if (dcMapInstance) {
      const curContainer = dcMapInstance.getContainer ? dcMapInstance.getContainer() : null;
      if (!curContainer || !document.body.contains(curContainer) || curContainer !== mapEl) {
        try { dcMapInstance.remove(); } catch (e) {}
        dcMapInstance = null;
      }
    }

    if (mapEl) {
      mapEl.classList.toggle('hide-parcel-numbers', state.isNumbersVisible === false);
    }

    if (!dcMapInstance) {
      const p = state.currentParcel;
      const initialCenter = (p && p.centroid) ? [p.centroid.lat, p.centroid.lng] : [21.0285, 105.854];

      dcMapInstance = L.map(mapEl, {
        center: initialCenter,
        zoom: 18,
        maxZoom: 22,
        zoomControl: false,
        attributionControl: false
      });

      dcLayers = {
        googleSat: L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
          maxZoom: 22,
          subdomains: '0123',
          crossOrigin: true
        }),
        esriSat: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19,
          crossOrigin: true
        }),
        googleRoad: L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
          maxZoom: 22,
          subdomains: '0123',
          crossOrigin: true
        })
      };

      const activeKey = state.currentLayerKey || 'googleSat';
      dcCurrentLayer = dcLayers[activeKey] || dcLayers.googleSat;
      dcCurrentLayer.addTo(dcMapInstance);

      dcPolygonLayer = L.polygon([], {
        color: '#f59e0b',
        weight: 3,
        fillColor: '#f59e0b',
        fillOpacity: 0.22
      }).addTo(dcMapInstance);

      dcMarkersGroup = L.layerGroup().addTo(dcMapInstance);
      dcMidpointGroup = L.layerGroup().addTo(dcMapInstance);
    }

    renderDcMapLayers(true);
  }

  // Vẽ các lớp mốc ranh, cạnh ranh, tim đất lên bản đồ vệ tinh
  function renderDcMapLayers(shouldFitBounds = false) {
    if (!dcMapInstance || !state.currentParcel || !state.currentParcel.vertices) return;

    const p = state.currentParcel;
    const latLngs = p.vertices.map(v => [v.lat, v.lng]);

    // 1. Cập nhật đa giác ranh đất
    if (dcPolygonLayer) {
      dcPolygonLayer.setLatLngs(latLngs);
    }

    // 2. Cập nhật các mốc ranh với tính năng kéo rê (di điểm tinh chỉnh)
    if (dcMarkersGroup) {
      dcMarkersGroup.clearLayers();
      const isLocked = state.isPointsLocked !== false;

      p.vertices.forEach(v => {
        const bg = isLocked ? '#0f172a' : '#d97706';
        const border = isLocked ? '#f59e0b' : '#fde047';
        const shadow = isLocked ? '0 2px 6px rgba(0,0,0,0.8)' : '0 0 10px rgba(245,158,11,0.95)';
        const cursor = isLocked ? 'pointer' : 'grab';

        const marker = L.marker([v.lat, v.lng], {
          icon: L.divIcon({
            className: 'dc-point-divicon',
            html: `<div style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:${bg};border:2px solid ${border};color:#ffffff;font-size:11px;font-weight:800;box-shadow:${shadow};cursor:${cursor};transition:all 0.2s ease;">${v.id}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          }),
          draggable: !isLocked
        });

        marker.bindPopup(`
          <div style="font-size:12px;color:#0f172a;padding:2px;">
            <b>Mốc ${v.id}</b><br>
            X: ${v.x.toFixed(2)} m<br>
            Y: ${v.y.toFixed(2)} m<br>
            WGS84: ${v.lat.toFixed(6)}°, ${v.lng.toFixed(6)}°
            ${!isLocked ? '<br><span style="color:#d97706;font-weight:700;">✋ Kéo rê để tinh chỉnh</span>' : ''}
          </div>
        `);

        // Xử lý kéo mốc tinh chỉnh trực tiếp
        marker.on('drag', (e) => {
          const pos = e.target.getLatLng();
          v.lat = pos.lat;
          v.lng = pos.lng;
          v.lon = pos.lng;
          const updatedLatLngs = p.vertices.map(pt => [pt.lat, pt.lng]);
          if (dcPolygonLayer) dcPolygonLayer.setLatLngs(updatedLatLngs);
        });

        marker.on('dragend', (e) => {
          const newPos = e.target.getLatLng();
          v.lat = newPos.lat;
          v.lng = newPos.lng;
          v.lon = newPos.lng;

          const engine = global.NetaDiaChinhEngine;
          if (engine) {
            const curProv = engine.getProvince(state.provinceKey) || { name: 'Hà Nội', ktt: 105.0, cm: 105.0, zone3: true, k0: 0.9999 };
            // Chuẩn trắc địa Việt Nam (Thông tư 25/2014/TT-BTNMT): Sổ đỏ luôn dùng múi chiếu 3° (k0 = 0.9999)
            const k0 = (curProv && curProv.k0) ? curProv.k0 : 0.9999;
            const cm = (curProv && (curProv.cm || curProv.ktt)) ? (curProv.cm || curProv.ktt) : 105.0;
            const vn = engine.wgs84ToVn2000(v.lat, v.lng, cm, k0);
            v.x = Math.round(vn.x * 100) / 100;
            v.y = Math.round(vn.y * 100) / 100;

            p.areaM2 = engine.calculatePolygonArea(p.vertices);
            p.perimeterM = engine.calculateEdges(p.vertices).reduce((sum, ed) => sum + ed.lengthM, 0);
            p.centroid = engine.calculateCentroid(p.vertices);
            p.edges = engine.calculateEdges(p.vertices);
            p.vertexCount = p.vertices.length;
            if (p.areaM2) p.areaSao = (p.areaM2 / 360).toFixed(1);

            state.coordText = p.vertices.map(pt => `${pt.id}  ${pt.x.toFixed(2)}  ${pt.y.toFixed(2)}`).join('\n');
            const txtCoords = document.getElementById('dc-textarea-coords');
            if (txtCoords) txtCoords.value = state.coordText;

            // Đồng bộ sang La Kinh nếu đang có liên kết
            if (global.lakinhState && global.lakinhState.importedParcel) {
              global.lakinhState.importedParcel = p;
              global.lakinhState.polygonPoints = p.vertices.map(pt => [pt.lat, pt.lng]);
            }

            updateDcStatsAndTables();
            renderDcMapLayers(false);
            showToast(`📍 Đã tinh chỉnh Mốc ${v.id}: X=${v.x.toFixed(2)}, Y=${v.y.toFixed(2)}`);
          }
        });

        marker.addTo(dcMarkersGroup);
      });
    }

    // 3. Cập nhật trung điểm các cạnh và 24 Sơn Vị
    if (dcMidpointGroup) {
      dcMidpointGroup.clearLayers();
      if (p.edges && p.edges.length > 0) {
        p.edges.forEach(e => {
          const vFrom = p.vertices.find(v => String(v.id) === String(e.from));
          const vTo = p.vertices.find(v => String(v.id) === String(e.to));
          if (vFrom && vTo) {
            const midLat = (vFrom.lat + vTo.lat) / 2;
            const midLng = (vFrom.lng + vTo.lng) / 2;
            const sonName = e.sonVi ? e.sonVi.name : e.huong;

            L.marker([midLat, midLng], {
              icon: L.divIcon({
                className: 'dc-edge-divicon',
                html: `<div style="background:rgba(15,10,25,0.85);border:1px solid #f59e0b;border-radius:4px;padding:1px 5px;color:#f8fafc;font-size:10px;font-weight:700;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.6);text-align:center;">
                  <span style="color:#38bdf8;">${e.lengthM.toFixed(1)}m</span> • <span style="color:#facc15;">${sonName} (${e.bearingDeg.toFixed(0)}°)</span>
                </div>`,
                iconAnchor: [45, 10]
              })
            }).addTo(dcMidpointGroup);
          }
        });
      }

      // 4. Centroid (Tim Đất)
      if (p.centroid) {
        const areaFmt = p.areaM2.toLocaleString('vi-VN', { maximumFractionDigits: 1 });
        L.marker([p.centroid.lat, p.centroid.lng], {
          icon: L.divIcon({
            className: 'dc-centroid-divicon',
            html: `<div style="display:inline-flex;align-items:center;background:none;border:none;">
              <span style="font-size:18px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.9));">🎯</span>
              <span style="color:#ef4444;font-size:10px;font-weight:900;white-space:nowrap;margin-left:3px;background:rgba(0,0,0,0.75);padding:1px 4px;border-radius:3px;text-shadow:0 1px 2px #000;">${areaFmt} m²</span>
            </div>`,
            iconSize: [75, 22],
            iconAnchor: [9, 11]
          })
        }).addTo(dcMidpointGroup);
      }
    }

    if (shouldFitBounds && dcPolygonLayer && dcPolygonLayer.getBounds().isValid()) {
      dcMapInstance.fitBounds(dcPolygonLayer.getBounds(), { padding: [35, 35] });
    }

    setTimeout(() => {
      if (dcMapInstance) dcMapInstance.invalidateSize();
    }, 150);
  }

  // Cập nhật số liệu thống kê và bảng biểu khi kéo mốc tinh chỉnh
  function updateDcStatsAndTables() {
    if (!state.currentParcel) return;
    const p = state.currentParcel;
    const c = p.centroid;
    const formattedArea = p.areaM2.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
    const formattedPerimeter = p.perimeterM.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 2 });

    const areaValEl = document.querySelector('.dc-hero-area-val');
    const areaUnitEl = document.querySelector('.dc-hero-area-unit');
    if (areaValEl) areaValEl.textContent = formattedArea;
    if (areaUnitEl) areaUnitEl.textContent = `m² (${p.areaSao ? p.areaSao + ' sào' : 'mét vuông'})`;

    const statVals = document.querySelectorAll('.dc-stat-val');
    if (statVals && statVals.length >= 4) {
      statVals[0].textContent = `${p.vertexCount} mốc ranh`;
      statVals[1].textContent = `${formattedPerimeter} m`;
      statVals[2].textContent = `${c.lat.toFixed(6)}°`;
      statVals[3].textContent = `${c.lng.toFixed(6)}°`;
    }

    // Bảng 24 Sơn Vị
    const tbodyEdges = document.querySelector('.dc-edges-table tbody');
    if (tbodyEdges && p.edges) {
      tbodyEdges.innerHTML = p.edges.map(e => {
        const son = e.sonVi;
        const sonClass = son ? getElementBadgeClass(son.nguHanh) : '';
        return `
          <tr>
            <td><span class="dc-edge-badge">${e.from} ➔ ${e.to}</span></td>
            <td style="font-weight:700;">${e.lengthM.toFixed(2)} m</td>
            <td style="font-family:ui-monospace,Menlo,Consolas,monospace;">${e.bearingDeg.toFixed(1)}°</td>
            <td>
              <span class="dc-son-badge ${sonClass}">
                ${son ? son.name : e.huong} (${son ? son.cung : ''})
              </span>
            </td>
            <td>
              <span style="font-size:0.75rem;color:#94a3b8;">
                ${son ? `${son.cung} • Hành ${son.nguHanh}` : ''}
              </span>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Bảng tọa độ chi tiết
    const tbodyVerts = document.querySelector('.dc-vertices-table tbody');
    if (tbodyVerts && p.vertices) {
      tbodyVerts.innerHTML = p.vertices.map(v => `
        <tr>
          <td style="font-weight:700;color:#facc15;">${v.id}</td>
          <td>${v.x.toFixed(2)}</td>
          <td>${v.y.toFixed(2)}</td>
          <td>${v.lat.toFixed(7)}°</td>
          <td>${v.lng.toFixed(7)}°</td>
        </tr>
      `).join('');
    }

    // Sơ đồ SVG
    const svgCont = document.getElementById('dc-svg-container');
    if (svgCont) {
      svgCont.innerHTML = renderSvgPreview(p.vertices, p.centroid);
    }
  }

  // Gắn sự kiện cho các điều khiển trong vùng kết quả (Bản đồ, Khóa, Lớp vệ tinh)
  function bindResultsEvents() {
    const btnLock = document.getElementById('dc-btn-toggle-lock');
    const btnViewMode = document.getElementById('dc-btn-toggle-viewmode');
    const layerBtns = document.querySelectorAll('#dc-map-layer-switcher .dc-layer-btn');

    if (btnLock) {
      btnLock.onclick = () => {
        state.isPointsLocked = !state.isPointsLocked;
        btnLock.classList.toggle('is-unlocked', !state.isPointsLocked);
        const lockIcon = document.getElementById('dc-lock-icon');
        const lockText = document.getElementById('dc-lock-text');
        const dragHint = document.getElementById('dc-drag-hint');
        if (lockIcon) lockIcon.textContent = state.isPointsLocked ? '🔒' : '🔓';
        if (lockText) lockText.textContent = state.isPointsLocked ? 'Khóa Điểm' : 'Mở Khóa (Di Điểm)';
        if (dragHint) dragHint.style.display = state.isPointsLocked ? 'none' : 'block';

        renderDcMapLayers(false);
        showToast(state.isPointsLocked ? '🔒 Đã khóa mốc tọa độ' : '🔓 Đã mở khóa: Bạn có thể chạm và kéo rê mốc ranh để tinh chỉnh!');
      };
    }

    const btnToggleNums = document.getElementById('dc-btn-toggle-nums');
    if (btnToggleNums) {
      btnToggleNums.onclick = () => {
        state.isNumbersVisible = !state.isNumbersVisible;
        const dcMap = document.getElementById('dc-leaflet-map');
        const dcSvg = document.getElementById('dc-svg-container');
        const icon = document.getElementById('dc-nums-icon');
        const text = document.getElementById('dc-nums-text');
        if (dcMap) {
          dcMap.classList.toggle('hide-parcel-numbers', !state.isNumbersVisible);
        }
        if (dcSvg) {
          dcSvg.classList.toggle('hide-parcel-numbers', !state.isNumbersVisible);
        }
        btnToggleNums.classList.toggle('active', state.isNumbersVisible);
        btnToggleNums.classList.toggle('is-off', !state.isNumbersVisible);
        if (icon) icon.textContent = state.isNumbersVisible ? '🏷️' : '🙈';
        if (text) text.textContent = state.isNumbersVisible ? 'Số' : 'Ẩn';
        showToast(state.isNumbersVisible ? '🏷️ Đã hiển thị số mốc và kích thước' : '🙈 Đã ẩn các số (chỉ giữ ranh đất)');
      };
    }

    if (btnViewMode) {
      btnViewMode.onclick = () => {
        state.viewMode = state.viewMode === 'map' ? 'svg' : 'map';
        const mapCont = document.getElementById('dc-map-container');
        const svgCont = document.getElementById('dc-svg-container');
        const vmIcon = document.getElementById('dc-viewmode-icon');
        const vmText = document.getElementById('dc-viewmode-text');
        if (mapCont) mapCont.style.display = state.viewMode === 'map' ? 'block' : 'none';
        if (svgCont) svgCont.style.display = state.viewMode === 'svg' ? 'flex' : 'none';
        if (vmIcon) vmIcon.textContent = state.viewMode === 'svg' ? '🛰️' : '📐';
        if (vmText) vmText.textContent = state.viewMode === 'svg' ? 'Xem Vệ Tinh' : 'Xem Sơ Đồ';

        if (state.viewMode === 'map' && dcMapInstance) {
          setTimeout(() => { dcMapInstance.invalidateSize(); }, 100);
        }
      };
    }

    if (layerBtns) {
      layerBtns.forEach(btn => {
        btn.onclick = () => {
          const lKey = btn.getAttribute('data-layer');
          if (!lKey || !dcLayers[lKey] || !dcMapInstance) return;

          layerBtns.forEach(b => b.classList.toggle('active', b === btn));
          state.currentLayerKey = lKey;

          if (dcCurrentLayer) {
            dcMapInstance.removeLayer(dcCurrentLayer);
          }
          dcCurrentLayer = dcLayers[lKey];
          dcCurrentLayer.addTo(dcMapInstance);
        };
      });
    }

    const btnGoLaKinh = document.getElementById('dc-btn-go-lakinh');
    if (btnGoLaKinh) {
      btnGoLaKinh.onclick = () => {
        importToLaKinh();
      };
    }

    const btnGoTamLong = document.getElementById('dc-btn-go-tamlong');
    if (btnGoTamLong) {
      btnGoTamLong.onclick = () => {
        importToTamLong();
      };
    }
  }

  // Tái phân tích và cập nhật khu vực kết quả
  function reprocessAndRefresh() {
    const engine = global.NetaDiaChinhEngine;
    if (!engine) return;

    try {
      state.currentParcel = engine.processParcel(state.coordText, state.provinceKey, state.parcelName);
    } catch (e) {
      state.currentParcel = null;
    }

    const resultsArea = document.getElementById('dc-results-area');
    if (resultsArea) {
      resultsArea.innerHTML = renderResultsHTML(state.currentParcel);
      bindResultsEvents();
      initOrUpdateDcMap();
    }
  }

  // Đưa ranh thửa đất vào La Kinh Vệ Tinh (Lập Cực Phong Thủy)
  function importToLaKinh() {
    if (!state.currentParcel || !state.currentParcel.vertices || state.currentParcel.vertices.length < 3) {
      const textarea = document.getElementById('dc-textarea-coords');
      if (textarea && textarea.value.trim()) {
        state.coordText = textarea.value.trim();
        reprocessAndRefresh();
      }
    }

    if (!state.currentParcel || !state.currentParcel.vertices || state.currentParcel.vertices.length < 3) {
      showToast('Vui lòng nhập tối thiểu 3 mốc tọa độ để tạo thửa đất');
      return;
    }

    if (!global.NetaLaKinhView || typeof global.NetaLaKinhView.importParcelFromVN2000 !== 'function') {
      showToast('Chưa khởi tạo module La Kinh Vệ Tinh');
      return;
    }

    // 1. Gán trực tiếp vào lakinhState để dữ liệu thửa đất được bảo toàn vĩnh viễn
    if (global.lakinhState) {
      global.lakinhState.importedParcel = state.currentParcel;
      global.lakinhState.polygonPoints = state.currentParcel.vertices.map(v => [v.lat, v.lng]);
      global.lakinhState.isPlanGeoAnchored = true;
    }

    // 2. Chuyển sang La Kinh để container được hiển thị và có kích thước thực
    if (typeof window.switchAppMode === 'function') {
      window.switchAppMode('lakinh');
    }

    // 3. Nạp ngay và đặt timeout an toàn sau khi chu trình render kép của switchAppMode hoàn tất
    if (global.NetaLaKinhView && typeof global.NetaLaKinhView.importParcelFromVN2000 === 'function') {
      global.NetaLaKinhView.importParcelFromVN2000(state.currentParcel);
    }
    setTimeout(() => {
      if (global.NetaLaKinhView && typeof global.NetaLaKinhView.importParcelFromVN2000 === 'function') {
        global.NetaLaKinhView.importParcelFromVN2000(state.currentParcel);
      }
      showToast(`Đã đưa thửa đất vào La Kinh: ${state.currentParcel.parcelName || 'VN-2000'}`);
    }, 400);
  }

  // Đưa tim khu đất vào Tab Tầm Long Điểm Huyệt (Khảo sát vi địa mạo, Tứ Tượng, Loan Đầu)
  function importToTamLong() {
    if (!state.currentParcel || !state.currentParcel.vertices || state.currentParcel.vertices.length < 3) {
      const textarea = document.getElementById('dc-textarea-coords');
      if (textarea && textarea.value.trim()) {
        state.coordText = textarea.value.trim();
        reprocessAndRefresh();
      }
    }

    if (!state.currentParcel || !state.currentParcel.centroid) {
      showToast('Vui lòng nhập tọa độ mốc ranh để tính tim khu đất');
      return;
    }

    const c = state.currentParcel.centroid;
    const parcelName = state.currentParcel.parcelName || 'Thửa Đất';

    // 1. Lưu thửa đất vào lakinhState để mọi module dùng chung
    if (global.lakinhState) {
      global.lakinhState.importedParcel = state.currentParcel;
      global.lakinhState.polygonPoints = state.currentParcel.vertices.map(v => [v.lat, v.lng]);
      global.lakinhState.centerCoords = [c.lat, c.lng];
      global.lakinhState.userLocation = [c.lat, c.lng];
      global.lakinhState.isPlanGeoAnchored = true;
    }

    // 2. Chuyển sang module Địa Lý (Tab Tầm Long)
    if (typeof window.switchAppMode === 'function') {
      window.switchAppMode('dialy');
    }

    // 3. Nạp tọa độ tim đất vào DiaLyView
    setTimeout(() => {
      if (global.NetaDiaLyView && typeof global.NetaDiaLyView.setGpsCoordinates === 'function') {
        global.NetaDiaLyView.setGpsCoordinates(c.lat, c.lng, `${c.lat.toFixed(6)}, ${c.lng.toFixed(6)}`);
      }
      showToast(`🏔️ Đã nạp tâm khu đất (${c.lat.toFixed(5)}°, ${c.lng.toFixed(5)}°) vào Tầm Long`);
    }, 300);
  }

  // Xuất file KML cho Google Earth
  function exportKML() {
    if (!state.currentParcel || !state.currentParcel.vertices) {
      showToast('Chưa có dữ liệu ranh thửa đất');
      return;
    }

    const engine = global.NetaDiaChinhEngine;
    if (!engine) return;

    const kmlContent = engine.generateKML(state.currentParcel);
    const filename = `${sanitizeFilename(state.currentParcel.parcelName || 'thua_dat')}_VN2000.kml`;

    downloadBlob(kmlContent, 'application/vnd.google-earth.kml+xml;charset=utf-8', filename);
    showToast(`Đã tải file: ${filename}`);
  }

  // Xuất file CSV
  function exportCSV() {
    if (!state.currentParcel || !state.currentParcel.vertices) {
      showToast('Chưa có dữ liệu ranh thửa đất');
      return;
    }

    const p = state.currentParcel;
    let csv = '\uFEFF'; // BOM UTF-8 for Excel
    csv += `NETA LIGHT - BANG TOA DO THUA DAT VN-2000\n`;
    csv += `Ten thua:,"${p.parcelName}"\n`;
    csv += `Tinh thanh:,"${p.province.name}"\n`;
    csv += `Kinh tuyen truc:,"${p.province.ktt} do"\n`;
    csv += `Dien tich:,"${p.areaM2.toFixed(2)} m2"\n`;
    csv += `Chu vi:,"${p.perimeterM.toFixed(2)} m"\n`;
    csv += `Tim thua (Lat, Lng):,"${p.centroid.lat.toFixed(7)}, ${p.centroid.lng.toFixed(7)}"\n\n`;

    csv += `BANG TOA DO MOC RANH\n`;
    csv += `Moc,X_VN2000 (m),Y_VN2000 (m),WGS84_Lat,WGS84_Lng\n`;
    p.vertices.forEach(v => {
      csv += `${v.id},${v.x.toFixed(2)},${v.y.toFixed(2)},${v.lat.toFixed(7)},${v.lng.toFixed(7)}\n`;
    });

    csv += `\nBANG PHUONG VI 24 SON VI CAC CANH RANH\n`;
    csv += `Doan ranh,Chieu dai (m),Goc phuong vi (do),24 Son vi,Cung,Hanh\n`;
    p.edges.forEach(e => {
      const s = e.sonVi;
      csv += `"${e.from} -> ${e.to}",${e.lengthM.toFixed(2)},${e.bearingDeg.toFixed(1)},"${s ? s.name : ''}","${s ? s.cung : ''}","${s ? s.nguHanh : ''}"\n`;
    });

    const filename = `${sanitizeFilename(p.parcelName || 'thua_dat')}_VN2000.csv`;
    downloadBlob(csv, 'text/csv;charset=utf-8;', filename);
    showToast(`Đã xuất bảng tính: ${filename}`);
  }

  // Mở Google Maps tại tọa độ tim đất
  function openGoogleMaps() {
    if (!state.currentParcel || !state.currentParcel.centroid) {
      showToast('Chưa có dữ liệu tọa độ tim đất');
      return;
    }
    const c = state.currentParcel.centroid;
    const url = `https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`;
    window.open(url, '_blank');
  }

  function downloadBlob(content, mimeType, filename) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  }

  function sanitizeFilename(name) {
    return (name || 'file')
      .replace(/[^a-zA-Z0-9_\-\u00C0-\u1EF9]/g, '_')
      .replace(/_+/g, '_');
  }

  function showToast(msg) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg);
    } else {
      const toastEl = document.getElementById('toast');
      if (toastEl) {
        toastEl.textContent = msg;
        toastEl.className = 'toast-notification show';
        setTimeout(() => {
          toastEl.className = 'toast-notification';
        }, 2500);
      }
    }
  }

  // Public Module API
  const NetaDiaChinhView = {
    init: init,
    render: render,
    loadSample: loadSample,
    importToLaKinh: importToLaKinh,
    exportKML: exportKML,
    exportCSV: exportCSV,
    openGoogleMaps: openGoogleMaps,
    getState: () => state
  };

  global.NetaDiaChinhView = NetaDiaChinhView;

})(typeof window !== 'undefined' ? window : this);
