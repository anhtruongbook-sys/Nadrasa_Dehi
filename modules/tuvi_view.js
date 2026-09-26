/**
 * NETA LIGHT - TỬ VI ĐẨU SỐ VIEW MODULE
 * Hiển thị Lá Số Tử Vi 12 Cung chuẩn Nam Phái (Thái Thứ Lang)
 * Hỗ trợ 2 chế độ:
 * 1. Bàn 4x4 Truyền Thống (Thiên Bàn & Địa Bàn)
 * 2. Danh Sách 12 Cung Thẻ Bài (Cards List Mode)
 * Popup xem chi tiết Cung và Tam Phương Tứ Chính hội chiếu.
 */

(function (global) {
  'use strict';

  let currentTuViDate = new Date();
  let currentIsMale = true;
  let isLunarMode = false; // Chuyển đổi Dương Lịch <-> Âm Lịch
  let currentViewMode = 'grid'; // 'grid' (4x4) or 'list'
  let currentChartData = null;
  let currentViewYear = new Date().getFullYear(); // Mặc định năm xem hạn là năm hiện tại

  // Grid row & col mappings for 12 Chi in 4x4 grid (1-based for CSS Grid)
  // Row 1: Tỵ(5), Ngọ(6), Mùi(7), Thân(8)
  // Row 2: Thìn(4), Center, Dậu(9)
  // Row 3: Mão(3), Center, Tuất(10)
  // Row 4: Dần(2), Sửu(1), Tý(0), Hợi(11)
  const GRID_POSITIONS = {
    5: { row: 1, col: 1 }, // Tỵ
    6: { row: 1, col: 2 }, // Ngọ
    7: { row: 1, col: 3 }, // Mùi
    8: { row: 1, col: 4 }, // Thân
    4: { row: 2, col: 1 }, // Thìn
    9: { row: 2, col: 4 }, // Dậu
    3: { row: 3, col: 1 }, // Mão
    10: { row: 3, col: 4 }, // Tuất
    2: { row: 4, col: 1 }, // Dần
    1: { row: 4, col: 2 }, // Sửu
    0: { row: 4, col: 3 }, // Tý
    11: { row: 4, col: 4 }  // Hợi
  };

  function initTuViView() {
    const container = document.getElementById('view-tuvi');
    if (!container) return;
    renderTuVi();
  }

  function setDateAndRender(date, isMale = currentIsMale, viewYear = currentViewYear) {
    currentTuViDate = new Date(date);
    currentIsMale = isMale;
    currentViewYear = viewYear;
    renderTuVi();
  }

  let lastChartKey = '';
  let cachedChartData = null;

  function computeTuViChart() {
    if (!global.NetaTuViEngine) {
      console.error("NetaTuViEngine not found!");
      return null;
    }
    try {
      const d = currentTuViDate.getDate();
      const m = currentTuViDate.getMonth() + 1;
      const y = currentTuViDate.getFullYear();
      const h = currentTuViDate.getHours();
      const chartKey = `${d}_${m}_${y}_${h}_${currentIsMale}_${currentViewYear}`;
      if (chartKey === lastChartKey && cachedChartData) {
        return cachedChartData;
      }
      const chart = global.NetaTuViEngine.generateTuViChart({
        day: d, month: m, year: y, hour: h,
        isMale: currentIsMale,
        viewYear: currentViewYear
      });
      lastChartKey = chartKey;
      cachedChartData = chart;
      currentChartData = chart;
      return chart;
    } catch (e) {
      console.error("Error computing Tu Vi chart:", e);
      return null;
    }
  }

  function renderTuVi() {
    const container = document.getElementById('view-tuvi');
    if (!container) return;

    const chart = computeTuViChart();
    if (!chart) {
      container.innerHTML = `
        <div class="module-placeholder">
          <div class="placeholder-icon">🌌</div>
          <h2 class="placeholder-title">LỖI KHỞI TẠO TỬ VI</h2>
          <p class="placeholder-desc">Không thể tính toán lá số cho thời điểm này. Vui lòng thử lại.</p>
        </div>
      `;
      return;
    }

    const { meta, palaces } = chart;
    const pad = n => String(n).padStart(2, '0');
    const dStr = `${meta.solarYear}-${pad(meta.solarMonth)}-${pad(meta.solarDay)}`;

    const displayDay = isLunarMode ? meta.lunarDay : meta.solarDay;
    const displayMonth = isLunarMode ? meta.lunarMonth : meta.solarMonth;
    const displayYear = isLunarMode ? meta.lunarYear : meta.solarYear;

    container.innerHTML = `
      <div class="tuvi-view-container">
        <!-- Unified Control Card -->
        <div class="unified-ctrl-card">
          <!-- Row 1: Calendar switch & Date Box -->
          <div class="ucc-row ucc-row-date">
            <div class="ucc-pill-cal">
              <button type="button" class="ucc-pill-btn ${!isLunarMode ? 'active' : ''}" id="tuvi-btn-solar">☀️ Dương</button>
              <button type="button" class="ucc-pill-btn ${isLunarMode ? 'active' : ''}" id="tuvi-btn-lunar">🌙 Âm</button>
            </div>
            <div class="ucc-date-box" id="tuvi-ucc-date-box" title="Nhập ngày tháng hoặc chạm vào dấu gạch/nút lịch để mở bảng chọn">
              <input type="number" id="tuvi-input-day" class="num-box num-day" min="1" max="31" value="${displayDay}" placeholder="Ngày" title="Nhập Ngày (1-31)">
              <span class="num-slash">/</span>
              <input type="number" id="tuvi-input-month" class="num-box num-month" min="1" max="12" value="${displayMonth}" placeholder="Tháng" title="Nhập Tháng (1-12)">
              <span class="num-slash">/</span>
              <input type="number" id="tuvi-input-year" class="num-box num-year" min="1900" max="2100" value="${displayYear}" placeholder="Năm" title="Nhập Năm (gõ 2 số: 79 -> 1979)">
              <button type="button" class="ucc-btn-year" id="tuvi-btn-quick-year" title="Bảng chọn Thập niên & Năm siêu tốc">⚡Năm</button>
              <label class="btn-picker-cal" id="tuvi-btn-native-cal" title="Mở bảng chọn Ngày & Giờ (Hình 3)">
                📅
                <input type="datetime-local" id="tuvi-date-picker" value="${dStr}T${pad(meta.solarHour)}:${pad(currentTuViDate.getMinutes())}" class="native-hidden-date">
              </label>
            </div>
          </div>

          <!-- Row 2: Can Chi + Numeric Time & Gender -->
          <div class="ucc-row ucc-row-time">
            <div class="ucc-time-box">
              <select id="tuvi-select-canchi" class="select-canchi">
                <option value="0" ${[23, 0].includes(meta.solarHour) ? 'selected' : ''}>Tý (23-01h)</option>
                <option value="2" ${[1, 2].includes(meta.solarHour) ? 'selected' : ''}>Sửu (01-03h)</option>
                <option value="4" ${[3, 4].includes(meta.solarHour) ? 'selected' : ''}>Dần (03-05h)</option>
                <option value="6" ${[5, 6].includes(meta.solarHour) ? 'selected' : ''}>Mão (05-07h)</option>
                <option value="8" ${[7, 8].includes(meta.solarHour) ? 'selected' : ''}>Thìn (07-09h)</option>
                <option value="10" ${[9, 10].includes(meta.solarHour) ? 'selected' : ''}>Tỵ (09-11h)</option>
                <option value="12" ${[11, 12].includes(meta.solarHour) ? 'selected' : ''}>Ngọ (11-13h)</option>
                <option value="14" ${[13, 14].includes(meta.solarHour) ? 'selected' : ''}>Mùi (13-15h)</option>
                <option value="16" ${[15, 16].includes(meta.solarHour) ? 'selected' : ''}>Thân (15-17h)</option>
                <option value="18" ${[17, 18].includes(meta.solarHour) ? 'selected' : ''}>Dậu (17-19h)</option>
                <option value="20" ${[19, 20].includes(meta.solarHour) ? 'selected' : ''}>Tuất (19-21h)</option>
                <option value="22" ${[21, 22].includes(meta.solarHour) ? 'selected' : ''}>Hợi (21-23h)</option>
              </select>
              <input type="number" id="tuvi-input-hour" class="num-box num-hour" min="0" max="23" value="${pad(meta.solarHour)}" placeholder="Giờ" title="Nhập Giờ (0-23)">
              <span class="num-colon">:</span>
              <input type="number" id="tuvi-input-minute" class="num-box num-min" min="0" max="59" value="${pad(currentTuViDate.getMinutes())}" placeholder="Phút" title="Nhập Phút (0-59)">
            </div>
            <div class="ucc-pill-gender">
              <button type="button" class="ucc-gender-btn ${currentIsMale ? 'active male' : ''}" id="tuvi-btn-male">♂ Nam</button>
              <button type="button" class="ucc-gender-btn ${!currentIsMale ? 'active female' : ''}" id="tuvi-btn-female">♀ Nữ</button>
            </div>
          </div>

          <!-- Row 3: Năm Xem Vận Hạn & Sao Lưu -->
          <div class="ucc-row ucc-row-view-year">
            <div class="ucc-view-year-box">
              <span class="ucc-lbl-view-year">🎯 Năm xem:</span>
              <button type="button" class="ucc-btn-year-step" id="btn-view-year-prev" title="Lùi 1 năm">◀</button>
              <input type="number" id="tuvi-input-view-year" class="num-box num-view-year" min="1900" max="2100" value="${currentViewYear}" title="Nhập Năm xem hạn">
              <button type="button" class="ucc-btn-year-step" id="btn-view-year-next" title="Tiến 1 năm">▶</button>
              <span class="ucc-tag-canchi-year" id="tuvi-tag-canchi-year">(${meta.viewYearCanChi})</span>
            </div>
            <button type="button" class="ucc-btn-year-now" id="btn-view-year-now" title="Về năm hiện tại (${new Date().getFullYear()})">⚡ Năm nay</button>
          </div>

          <!-- Row 4: Action row (Giờ thực, 4x4 / 12 Cung, Lập Lá Số) -->
          <div class="ucc-row ucc-row-actions">
            <button class="ucc-btn-now" id="btn-tuvi-now" title="Về thời điểm hiện tại">
              ⚡ Giờ thực
            </button>
            <div class="ucc-pill-view">
              <button class="ucc-view-btn ${currentViewMode === 'grid' ? 'active' : ''}" id="btn-tuvi-mode-grid" title="Bàn 4x4 truyền thống">
                🏛️ 4x4
              </button>
              <button class="ucc-view-btn ${currentViewMode === 'list' ? 'active' : ''}" id="btn-tuvi-mode-list" title="Danh sách 12 cung">
                📜 12 Cung
              </button>
            </div>
            <button class="ucc-btn-submit" id="btn-tuvi-submit" title="Lập lại lá số">
              🔮 Lập Lá Số
            </button>
          </div>
        </div>

        <!-- Master Overview Strip (1 High-End Sleek Ribbon) -->
        <div class="tuvi-master-strip">
          <div class="tms-item"><span class="tms-lbl">Đương số:</span> <strong class="tms-val">${meta.amDuongNamNu || (currentIsMale ? 'Dương Nam' : 'Âm Nữ')}</strong></div>
          <span class="tms-sep">•</span>
          <div class="tms-item"><span class="tms-lbl">Mệnh:</span> <strong class="tms-val text-menh-gold">${meta.napAm}</strong></div>
          <span class="tms-sep">•</span>
          <div class="tms-item"><span class="tms-lbl">Cục:</span> <strong class="tms-val">${meta.cucName}</strong></div>
          <span class="tms-sep">•</span>
          <div class="tms-item"><span class="tms-lbl">Thân:</span> <strong class="tms-val text-menh-gold">${palaces[meta.thanIdx].name}</strong></div>
          <span class="tms-sep">•</span>
          <div class="tms-item"><span class="tms-lbl">Hạn:</span> <strong class="tms-val text-view-year">${meta.viewYear} (${meta.viewYearCanChi}) - ${meta.currentAgeMu}t</strong></div>
        </div>

        <!-- Main Chart Display -->
        ${currentViewMode === 'grid' ? renderGrid4x4HTML(meta, palaces) : renderListModeHTML(meta, palaces)}
      </div>

      <!-- Palace Detail Modal -->
      <div class="modal-overlay" id="tuvi-palace-modal" style="display: none;">
        <div class="modal-dialog tuvi-modal-dialog">
          <div class="guide-header">
            <h2 id="tuvi-modal-title">🏰 Chi Tiết Cung</h2>
            <button class="modal-close" id="tuvi-modal-close" aria-label="Đóng">&times;</button>
          </div>
          <div class="tuvi-modal-body" id="tuvi-modal-body">
            <!-- Dynamically populated -->
          </div>
        </div>
      </div>
    `;

    bindTuViEvents(chart);
  }

  function renderGrid4x4HTML(meta, palaces) {
    const getColorClass = global.NetaTuViEngine.getStarColorClass;
    const pad = n => String(n).padStart(2, '0');

    return `
      <div class="tuvi-grid-wrapper">
        <div class="tuvi-grid-4x4">
          <!-- Thiên Bàn Center (Modern Flat Masterpiece) -->
          <div class="tuvi-center-box">
            <div class="tc-inner-border">
              <div class="tc-header">
                <div class="tc-title">LÁ SỐ TỬ VI</div>
                <div class="tc-sub">${meta.amDuongNamNu || (currentIsMale ? 'Dương Nam' : 'Âm Nữ')} • Năm ${meta.yearGan} ${meta.yearZhi} (${meta.solarYear})</div>
              </div>

              <div class="tc-content">
                <!-- Hàng 1: Dương lịch & Giờ phút -->
                <div class="tc-row-full">
                  <span class="tc-lbl">Dương lịch:</span>
                  <span class="tc-val">${pad(meta.solarDay)}/${pad(meta.solarMonth)}/${meta.solarYear} (${pad(meta.solarHour)}:${pad(currentTuViDate.getMinutes())})</span>
                </div>

                <!-- Hàng 2: Âm lịch & Can Chi Năm -->
                <div class="tc-row-full">
                  <span class="tc-lbl">Âm lịch:</span>
                  <span class="tc-val">${pad(meta.lunarDay)}/${pad(meta.lunarMonth)} năm ${meta.yearGan} ${meta.yearZhi}</span>
                </div>

                <!-- Hàng 3: Giờ sinh -->
                <div class="tc-row-full">
                  <span class="tc-lbl">Giờ sinh:</span>
                  <span class="tc-val">Giờ ${meta.hourZhi} (${pad(meta.solarHour)}h)</span>
                </div>

                <!-- Hàng 4: Năm xem hạn & Tuổi mụ (Nổi bật) -->
                <div class="tc-row-full tc-row-view-highlight">
                  <span class="tc-lbl">Năm xem:</span>
                  <strong class="tc-val tc-val-view-year">${meta.viewYear} (${meta.viewYearCanChi}) • ${meta.currentAgeMu} tuổi</strong>
                </div>

                <div class="tc-divider-h"></div>

                <!-- Hàng 5: Bản Mệnh Nạp Âm Hoàng Gia -->
                <div class="tc-row-full tc-row-menh">
                  <span class="tc-lbl">Bản Mệnh:</span>
                  <strong class="tc-val tc-val-gold">${meta.napAm}</strong>
                </div>

                <!-- Hàng 6: Cục Số -->
                <div class="tc-row-full">
                  <span class="tc-lbl">Cục số:</span>
                  <strong class="tc-val">${meta.cucName}</strong>
                </div>

                <!-- Hàng 7: Mệnh Cung & Thân Cư -->
                <div class="tc-row-full tc-row-split">
                  <span class="tc-pair"><span class="tc-lbl">Mệnh tại:</span> <strong class="tc-val">${palaces[meta.menhIdx].canChi}</strong></span>
                  <span class="tc-pair"><span class="tc-lbl">Thân cư:</span> <strong class="tc-val tc-val-than">${palaces[meta.thanIdx].name}</strong></span>
                </div>
              </div>

              <!-- Khối Chủ Tinh -->
              <div class="tc-footer-stars">
                <span>Chủ Mệnh: <strong>${meta.chuMenh || 'Tham Lang'}</strong></span>
                <span>Chủ Thân: <strong>${meta.chuThan || 'Linh Tinh'}</strong></span>
              </div>
            </div>
          </div>

          <!-- 12 Cung xung quanh viền -->
          ${palaces.map(p => {
            const pos = GRID_POSITIONS[p.index];
            const style = `grid-row: ${pos.row}; grid-column: ${pos.col};`;
            return `
              <div class="tuvi-cell ${p.isMenh ? 'cell-menh' : ''}" style="${style}" data-palace-idx="${p.index}">
                <!-- Cell Header -->
                <div class="tc-cell-header">
                  <span class="tc-cung-name-royal ${p.isMenh ? 'text-menh' : ''}">${p.name}</span>
                  <div class="tc-badges-wrap">
                    ${p.isThan ? '<span class="badge-than-royal">THÂN</span>' : ''}
                    ${p.isTriet ? '<span class="badge-triet-royal">TRIỆT</span>' : ''}
                    ${p.isTuan ? '<span class="badge-tuan-royal">TUẦN</span>' : ''}
                  </div>
                </div>

                <!-- Main Stars -->
                <div class="tc-main-stars-box">
                  ${p.mainStars.length === 0 ? '<span class="tc-vcd-tag">Vô Chính Diệu</span>' : `
                    ${p.mainStars.map(s => `
                      <div class="tc-main-star-row ${getColorClass(s.hanh)}">
                        <span class="star-name">${s.name}</span>
                        ${s.brightness ? `<span class="star-bright">(${s.brightness})</span>` : ''}
                      </div>
                    `).join('')}
                  `}
                </div>

                <!-- Secondary Stars (2 Cột Đối Xứng) -->
                <div class="tc-sec-stars-grid">
                  <div class="tc-col-lucky">
                    ${p.luckyStars.slice(0, 5).map(s => `
                      <span class="star-sec lucky ${getColorClass(s.hanh)}">${s.name}</span>
                    `).join('')}
                    ${p.luckyStars.length > 5 ? `<span class="star-more">+${p.luckyStars.length - 5}</span>` : ''}
                  </div>
                  <div class="tc-col-bad">
                    ${p.badStars.slice(0, 5).map(s => `
                      <span class="star-sec bad ${getColorClass(s.hanh)}">${s.name}</span>
                    `).join('')}
                    ${p.badStars.length > 5 ? `<span class="star-more">+${p.badStars.length - 5}</span>` : ''}
                  </div>
                </div>

                <!-- Sao Lưu Hàng Năm (Theo Năm Xem) -->
                ${p.luuStars && p.luuStars.length > 0 ? `
                  <div class="tc-luu-stars-box">
                    ${p.luuStars.map(s => `
                      <span class="star-luu ${s.type} ${getColorClass(s.hanh)}" title="Sao Lưu năm ${meta.viewYear} (${meta.viewYearCanChi})">${s.name}</span>
                    `).join('')}
                  </div>
                ` : ''}

                <!-- Cell Footer -->
                <div class="tc-cell-footer">
                  <span class="tc-canchi-val">${p.canChi}</span>
                  <span class="tc-trangsinh-val">${p.trangSinh}</span>
                  <div class="tc-footer-right">
                    <span class="tc-daihan-val">${p.daiHan}</span>
                    ${p.isTieuHanYear ? `<span class="tc-tieuhan-badge" title="Tiểu Hạn năm ${meta.viewYear} (${meta.viewYearCanChi})">HẠN</span>` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderListModeHTML(meta, palaces) {
    const getColorClass = global.NetaTuViEngine.getStarColorClass;

    return `
      <div class="tuvi-list-wrapper">
        ${palaces.map(p => `
          <div class="tuvi-list-card ${p.isMenh ? 'cell-menh' : ''}" data-palace-idx="${p.index}">
            <div class="tlc-header">
              <div class="tlc-left">
                <span class="tlc-cung-name ${p.isMenh ? 'text-menh' : ''}">${p.name}</span>
                <span class="tlc-canchi">(${p.canChi})</span>
                ${p.isThan ? '<span class="tc-badge-than">THÂN CƯ</span>' : ''}
                ${p.isTieuHanYear ? `<span class="tc-tieuhan-badge" title="Tiểu Hạn năm ${meta.viewYear}">HẠN ${meta.viewYear}</span>` : ''}
              </div>
              <div class="tlc-right">
                ${p.isTriet ? '<span class="tc-badge-triet">TRIỆT</span>' : ''}
                ${p.isTuan ? '<span class="tc-badge-tuan">TUẦN</span>' : ''}
                <span class="tlc-ts">${p.trangSinh}</span>
                <span class="tlc-dh">Đại hạn: ${p.daiHan}</span>
              </div>
            </div>

            <div class="tlc-body">
              <div class="tlc-main-stars">
                <strong>Chính tinh:</strong>
                ${p.mainStars.length === 0 ? '<span class="tc-no-main">Vô Chính Diệu</span>' : `
                  ${p.mainStars.map(s => `
                    <span class="tlc-main-star ${getColorClass(s.hanh)}">${s.fullName}</span>
                  `).join(' • ')}
                `}
              </div>

              <div class="tlc-sec-row">
                <div class="tlc-sec-col">
                  <span class="tlc-sec-lbl">Cát tinh:</span>
                  <div class="tlc-sec-chips">
                    ${p.luckyStars.map(s => `
                      <span class="tlc-sec-chip lucky ${getColorClass(s.hanh)}">${s.name}</span>
                    `).join('')}
                  </div>
                </div>
                <div class="tlc-sec-col">
                  <span class="tlc-sec-lbl">Sát tinh:</span>
                  <div class="tlc-sec-chips">
                    ${p.badStars.map(s => `
                      <span class="tlc-sec-chip bad ${getColorClass(s.hanh)}">${s.name}</span>
                    `).join('')}
                  </div>
                </div>
              </div>

              ${p.luuStars && p.luuStars.length > 0 ? `
                <div class="tlc-luu-row">
                  <span class="tlc-sec-lbl">Sao Lưu (${meta.viewYear} ${meta.viewYearCanChi}):</span>
                  <div class="tlc-sec-chips">
                    ${p.luuStars.map(s => `
                      <span class="tlc-sec-chip star-luu ${s.type} ${getColorClass(s.hanh)}">${s.name}</span>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function generateHourOptions(selectedHour) {
    const CHI_HOURS = [
      { name: 'Tý (23h - 01h)', hour: 0 },
      { name: 'Sửu (01h - 03h)', hour: 2 },
      { name: 'Dần (03h - 05h)', hour: 4 },
      { name: 'Mão (05h - 07h)', hour: 6 },
      { name: 'Thìn (07h - 09h)', hour: 8 },
      { name: 'Tỵ (09h - 11h)', hour: 10 },
      { name: 'Ngọ (11h - 13h)', hour: 12 },
      { name: 'Mùi (13h - 15h)', hour: 14 },
      { name: 'Thân (15h - 17h)', hour: 16 },
      { name: 'Dậu (17h - 19h)', hour: 18 },
      { name: 'Tuất (19h - 21h)', hour: 20 },
      { name: 'Hợi (21h - 23h)', hour: 22 }
    ];

    return CHI_HOURS.map(ch => {
      let isSel = false;
      if (ch.hour === 0) {
        isSel = selectedHour === 23 || selectedHour === 0;
      } else {
        isSel = selectedHour >= (ch.hour - 1) && selectedHour < (ch.hour + 1);
      }
      return `<option value="${ch.hour}" ${isSel ? 'selected' : ''}>${ch.name}</option>`;
    }).join('');
  }

  function bindTuViEvents(chart) {
    // Mode toggles
    const btnGrid = document.getElementById('btn-tuvi-mode-grid');
    const btnList = document.getElementById('btn-tuvi-mode-list');
    if (btnGrid) {
      btnGrid.onclick = () => {
        currentViewMode = 'grid';
        renderTuVi();
      };
    }
    if (btnList) {
      btnList.onclick = () => {
        currentViewMode = 'list';
        renderTuVi();
      };
    }

    const pad = n => String(n).padStart(2, '0');

    // Sync elements
    const inputDay = document.getElementById('tuvi-input-day');
    const inputMonth = document.getElementById('tuvi-input-month');
    const inputYear = document.getElementById('tuvi-input-year');
    const datePicker = document.getElementById('tuvi-date-picker');
    const selectCanChi = document.getElementById('tuvi-select-canchi');
    const inputHour = document.getElementById('tuvi-input-hour');
    const inputMin = document.getElementById('tuvi-input-minute');
    const btnSubmit = document.getElementById('btn-tuvi-submit');

    // Chuyển đổi Dương Lịch <-> Âm Lịch
    const btnSolar = document.getElementById('tuvi-btn-solar');
    const btnLunar = document.getElementById('tuvi-btn-lunar');
    if (btnSolar) {
      btnSolar.onclick = () => {
        if (isLunarMode) {
          isLunarMode = false;
          renderTuVi();
        }
      };
    }
    if (btnLunar) {
      btnLunar.onclick = () => {
        if (!isLunarMode) {
          isLunarMode = true;
          renderTuVi();
        }
      };
    }

    // Nút Chọn Năm Siêu Tốc (Decade & Year Jumper)
    const btnQuickYear = document.getElementById('tuvi-btn-quick-year');
    if (btnQuickYear && inputYear) {
      btnQuickYear.onclick = (e) => {
        e.preventDefault();
        if (global.NetaSmartPicker) {
          global.NetaSmartPicker.openYearJumperModal(inputYear.value, (newYear) => {
            inputYear.value = newYear;
            if (btnSubmit) btnSubmit.click();
          });
        }
      };
    }

    // Tự động nhảy ô thông minh (Auto-advance) & Nhận diện năm 2 chữ số (79 -> 1979)
    if (global.NetaSmartPicker) {
      global.NetaSmartPicker.setupAutoAdvance({
        dayInput: inputDay,
        monthInput: inputMonth,
        yearInput: inputYear,
        hourInput: inputHour,
        minuteInput: inputMin,
        onSubmit: () => { if (btnSubmit) btnSubmit.click(); }
      });
      // Kết nối Date Picker gốc của hệ điều hành di động (datetime-local Hình 3)
      if (datePicker) {
        datePicker.addEventListener('change', () => {
          if (!datePicker.value) return;
          const [dPart, tPart] = datePicker.value.split('T');
          const [y, m, d] = dPart.split('-').map(Number);
          let h = 12, min = 0;
          if (tPart) {
            [h, min] = tPart.split(':').map(Number);
          }
          isLunarMode = false;
          if (inputDay) inputDay.value = d;
          if (inputMonth) inputMonth.value = m;
          if (inputYear) inputYear.value = y;
          if (inputHour) inputHour.value = pad(h);
          if (inputMin) inputMin.value = pad(min);

          if (selectCanChi && global.NetaSmartPicker) {
            const zhiObj = global.NetaSmartPicker.getZhiByHour(h);
            if (zhiObj) selectCanChi.value = String(zhiObj.val);
          }

          currentTuViDate = new Date(y, m - 1, d, h, min, 0);
          renderTuVi();
        });

        const pickerLabel = document.getElementById('tuvi-btn-native-cal');
        const dateBox = document.getElementById('tuvi-ucc-date-box');

        const triggerWheelPicker = (e) => {
          if (e && e.target === datePicker) return;
          if (e) e.preventDefault();
          const curD = currentTuViDate;
          datePicker.value = `${curD.getFullYear()}-${pad(curD.getMonth() + 1)}-${pad(curD.getDate())}T${pad(curD.getHours())}:${pad(curD.getMinutes())}`;
          if (typeof datePicker.showPicker === 'function') {
            datePicker.showPicker();
          } else {
            datePicker.click();
          }
        };

        if (pickerLabel) {
          pickerLabel.onclick = triggerWheelPicker;
        }
        if (dateBox) {
          dateBox.addEventListener('click', (e) => {
            // Bấm vào khoảng trống/dấu slash '/' thì mở bảng chọn ngày giờ như hình 3
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
              triggerWheelPicker(e);
            }
          });
        }
      }
    }

    // Sync Can Chi hour -> numeric hour box
    if (selectCanChi) {
      selectCanChi.addEventListener('change', () => {
        if (inputHour) inputHour.value = pad(selectCanChi.value);
      });
    }

    // Sync numeric hour box -> Can Chi select
    if (inputHour) {
      inputHour.addEventListener('input', () => {
        const h = parseInt(inputHour.value);
        if (isNaN(h)) return;
        if (global.NetaSmartPicker) {
          const zhiObj = global.NetaSmartPicker.getZhiByHour(h);
          if (zhiObj && selectCanChi) selectCanChi.value = String(zhiObj.val);
        }
      });
    }

    // Điều khiển Năm Xem Vận Hạn & Sao Lưu
    const btnYearPrev = document.getElementById('btn-view-year-prev');
    const btnYearNext = document.getElementById('btn-view-year-next');
    const btnYearNow = document.getElementById('btn-view-year-now');
    const inputViewYear = document.getElementById('tuvi-input-view-year');

    if (btnYearPrev) {
      btnYearPrev.onclick = () => {
        currentViewYear--;
        renderTuVi();
      };
    }
    if (btnYearNext) {
      btnYearNext.onclick = () => {
        currentViewYear++;
        renderTuVi();
      };
    }
    if (btnYearNow) {
      btnYearNow.onclick = () => {
        currentViewYear = new Date().getFullYear();
        renderTuVi();
      };
    }
    if (inputViewYear) {
      inputViewYear.onchange = () => {
        const vy = parseInt(inputViewYear.value, 10);
        if (!isNaN(vy) && vy >= 1900 && vy <= 2100) {
          currentViewYear = vy;
          renderTuVi();
        }
      };
      inputViewYear.onkeydown = (e) => {
        if (e.key === 'Enter') {
          inputViewYear.blur();
        }
      };
    }

    // Gender toggle
    const btnMale = document.getElementById('tuvi-btn-male');
    const btnFemale = document.getElementById('tuvi-btn-female');
    if (btnMale) {
      btnMale.onclick = () => {
        if (!currentIsMale) {
          currentIsMale = true;
          renderTuVi();
        }
      };
    }
    if (btnFemale) {
      btnFemale.onclick = () => {
        if (currentIsMale) {
          currentIsMale = false;
          renderTuVi();
        }
      };
    }

    // Now button
    const btnNow = document.getElementById('btn-tuvi-now');
    if (btnNow) {
      btnNow.onclick = () => {
        isLunarMode = false;
        currentTuViDate = new Date();
        currentViewYear = new Date().getFullYear();
        renderTuVi();
      };
    }

    // Submit button
    if (btnSubmit) {
      btnSubmit.onclick = () => {
        let d = parseInt(inputDay ? inputDay.value : 1) || 1;
        let m = parseInt(inputMonth ? inputMonth.value : 1) || 1;
        let y = parseInt(inputYear ? inputYear.value : 2026) || 2026;
        if (inputYear && inputYear.value.length === 2 && global.NetaSmartPicker) {
          y = global.NetaSmartPicker.parseSmartYear(inputYear.value);
          inputYear.value = y;
        }
        if (inputViewYear) {
          const vy = parseInt(inputViewYear.value, 10);
          if (!isNaN(vy) && vy >= 1900 && vy <= 2100) currentViewYear = vy;
        }
        const h = Math.min(23, Math.max(0, parseInt(inputHour ? inputHour.value : 12) || 12));
        const min = Math.min(59, Math.max(0, parseInt(inputMin ? inputMin.value : 0) || 0));

        // Nếu người dùng nhập ngày Âm lịch, tự động quy đổi sang Dương lịch
        if (isLunarMode && global.NetaCalendarEngine) {
          const solar = global.NetaCalendarEngine.lunar2Solar(d, m, y);
          if (solar) {
            d = solar.day;
            m = solar.month;
            y = solar.year;
          }
        }

        currentTuViDate = new Date(y, m - 1, d, h, min, 0);
        renderTuVi();
      };
    }

    // Palace click modal
    const cells = document.querySelectorAll('[data-palace-idx]');
    cells.forEach(cell => {
      cell.onclick = () => {
        const idx = parseInt(cell.getAttribute('data-palace-idx'), 10);
        openPalaceModal(chart, idx);
      };
    });

    // Close modal
    const modalClose = document.getElementById('tuvi-modal-close');
    const modal = document.getElementById('tuvi-palace-modal');
    if (modalClose && modal) {
      modalClose.onclick = () => { modal.style.display = 'none'; };
      modal.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
      };
    }
  }

  function openPalaceModal(chart, idx) {
    const modal = document.getElementById('tuvi-palace-modal');
    const titleEl = document.getElementById('tuvi-modal-title');
    const bodyEl = document.getElementById('tuvi-modal-body');
    if (!modal || !bodyEl || !chart) return;

    const p = chart.palaces[idx];
    if (!p) return;

    const getColorClass = global.NetaTuViEngine.getStarColorClass;

    // Relatives
    const xChieu = chart.palaces[p.relatives.xungChieu];
    const tHop1 = chart.palaces[p.relatives.tamHop1];
    const tHop2 = chart.palaces[p.relatives.tamHop2];

    titleEl.textContent = `🏰 CUNG ${p.name.toUpperCase()} (${p.canChi})`;

    bodyEl.innerHTML = `
      <div class="tuvi-modal-content">
        <div class="tm-top-badges">
          <div class="tm-badge"><strong>Cung Chức:</strong> ${p.name}</div>
          <div class="tm-badge"><strong>Can Chi:</strong> ${p.canChi}</div>
          <div class="tm-badge"><strong>Tràng Sinh:</strong> ${p.trangSinh}</div>
          <div class="tm-badge"><strong>Đại Hạn:</strong> ${p.daiHan} tuổi</div>
          <div class="tm-badge"><strong>Tiểu Hạn:</strong> ${p.tieuHan} ${p.isTieuHanYear ? '(Hạn Năm Nay)' : ''}</div>
          ${p.isThan ? '<div class="tm-badge badge-than">THÂN CƯ</div>' : ''}
          ${p.isTriet ? '<div class="tm-badge badge-triet">TRIỆT</div>' : ''}
          ${p.isTuan ? '<div class="tm-badge badge-tuan">TUẦN</div>' : ''}
        </div>

        ${p.luuStars && p.luuStars.length > 0 ? `
          <div class="tm-section">
            <h4>🎯 SAO LƯU NĂM ${chart.meta.viewYear} (${chart.meta.viewYearCanChi})</h4>
            <div class="tm-chips-wrap">
              ${p.luuStars.map(s => `
                <span class="tm-chip star-luu ${s.type} ${getColorClass(s.hanh)}">${s.name} - Hành ${s.hanh}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="tm-section">
          <h4>🌟 CHÍNH TINH TỌA THỦ (${p.mainStars.length})</h4>
          <div class="tm-stars-list">
            ${p.mainStars.length === 0 ? '<span class="text-muted">Cung Vô Chính Diệu (Không có chính tinh đóng)</span>' : `
              ${p.mainStars.map(s => `
                <div class="tm-star-item main ${getColorClass(s.hanh)}">
                  <strong>${s.name}</strong> ${s.brightness ? `(${s.brightness})` : ''} - Hành ${s.hanh}
                </div>
              `).join('')}
            `}
          </div>
        </div>

        <div class="tm-section">
          <h4>✨ CÁT TINH (${p.luckyStars.length})</h4>
          <div class="tm-chips-wrap">
            ${p.luckyStars.map(s => `
              <span class="tm-chip lucky ${getColorClass(s.hanh)}">${s.name}</span>
            `).join('')}
          </div>
        </div>

        <div class="tm-section">
          <h4>⚡ HUNG TINH / SÁT TINH (${p.badStars.length})</h4>
          <div class="tm-chips-wrap">
            ${p.badStars.map(s => `
              <span class="tm-chip bad ${getColorClass(s.hanh)}">${s.name}</span>
            `).join('')}
          </div>
        </div>

        <div class="tm-section relatives-section">
          <h4>🎯 TAM PHƯƠNG TỨ CHÍNH HỘI CHIẾU</h4>
          <div class="tm-relatives-list">
            <div class="tm-rel-item">
              <span class="rel-tag">Xung Chiếu:</span>
              <strong>Cung ${xChieu.name} (${xChieu.canChi}):</strong>
              <span>${xChieu.mainStars.map(s => s.fullName).join(', ') || 'VCD'}</span>
            </div>
            <div class="tm-rel-item">
              <span class="rel-tag">Tam Hợp 1:</span>
              <strong>Cung ${tHop1.name} (${tHop1.canChi}):</strong>
              <span>${tHop1.mainStars.map(s => s.fullName).join(', ') || 'VCD'}</span>
            </div>
            <div class="tm-rel-item">
              <span class="rel-tag">Tam Hợp 2:</span>
              <strong>Cung ${tHop2.name} (${tHop2.canChi}):</strong>
              <span>${tHop2.mainStars.map(s => s.fullName).join(', ') || 'VCD'}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  }

  // Export to global
  global.NetaTuViView = {
    init: initTuViView,
    render: renderTuVi,
    setDate: setDateAndRender
  };

})(typeof window !== 'undefined' ? window : this);
