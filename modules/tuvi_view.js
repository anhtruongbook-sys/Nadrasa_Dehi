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
  let currentViewMode = 'grid'; // 'grid' (4x4) or 'list'
  let currentChartData = null;

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

  function setDateAndRender(date, isMale = currentIsMale) {
    currentTuViDate = new Date(date);
    currentIsMale = isMale;
    renderTuVi();
  }

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
      const chart = global.NetaTuViEngine.generateTuViChart({
        day: d, month: m, year: y, hour: h,
        isMale: currentIsMale,
        viewYear: y
      });
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

    container.innerHTML = `
      <div class="tuvi-view-container">
        <!-- Tu Vi Ultra-Compact Control Bar -->
        <div class="tuvi-ctrl-bar">
          <div class="tuvi-inputs-row">
            <!-- Direct Numeric Date -->
            <div class="numeric-date-row">
              <input type="number" id="tuvi-input-day" class="num-box num-day" min="1" max="31" value="${meta.solarDay}" placeholder="Ngày" title="Nhập Ngày (1-31)">
              <span class="num-slash">/</span>
              <input type="number" id="tuvi-input-month" class="num-box num-month" min="1" max="12" value="${meta.solarMonth}" placeholder="Tháng" title="Nhập Tháng (1-12)">
              <span class="num-slash">/</span>
              <input type="number" id="tuvi-input-year" class="num-box num-year" min="1900" max="2100" value="${meta.solarYear}" placeholder="Năm" title="Nhập Năm">
              <label class="btn-picker-cal" title="Chọn ngày trên lịch">
                📅
                <input type="date" id="tuvi-date-picker" value="${dStr}" class="native-hidden-date">
              </label>
            </div>

            <!-- Time: Can Chi Select + Direct Numeric Hour & Minute -->
            <div class="numeric-time-row">
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

            <!-- Gender Toggle -->
            <button class="tuvi-btn-gender ${currentIsMale ? 'gender-male' : 'gender-female'}" id="tuvi-btn-gender" title="Chạm để đổi giới tính">
              ${currentIsMale ? '♂ Nam' : '♀ Nữ'}
            </button>
          </div>

          <div class="tuvi-actions-row">
            <div class="tuvi-view-toggle">
              <button class="tuvi-tab-btn ${currentViewMode === 'grid' ? 'active' : ''}" id="btn-tuvi-mode-grid" title="Xem dạng bàn 4x4">
                🏛️ 4x4
              </button>
              <button class="tuvi-tab-btn ${currentViewMode === 'list' ? 'active' : ''}" id="btn-tuvi-mode-list" title="Xem dạng danh sách 12 cung">
                📜 12 Cung
              </button>
            </div>
            <div class="tuvi-action-buttons">
              <button class="tuvi-btn-action tuvi-btn-now" id="btn-tuvi-now" title="Về thời điểm hiện tại">
                ⚡ Giờ thực
              </button>
              <button class="tuvi-btn-action tuvi-btn-submit" id="btn-tuvi-submit" title="Lập lại lá số">
                🔮 Lập Lá Số
              </button>
            </div>
          </div>
        </div>

        <!-- Master Overview Strip (Single Sleek Row) -->
        <div class="tuvi-master-strip">
          <div class="tms-item"><span class="tms-lbl">Đương số:</span> <strong class="tms-val">${meta.amDuongNamNu || (currentIsMale ? 'Dương Nam' : 'Âm Nữ')}</strong></div>
          <span class="tms-sep">•</span>
          <div class="tms-item"><span class="tms-lbl">Mệnh:</span> <strong class="tms-val text-gold">${meta.napAm}</strong></div>
          <span class="tms-sep">•</span>
          <div class="tms-item"><span class="tms-lbl">Cục:</span> <strong class="tms-val">${meta.cucName}</strong></div>
          <span class="tms-sep">•</span>
          <div class="tms-item"><span class="tms-lbl">Mệnh/Thân:</span> <strong class="tms-val">${meta.menhCanChi} (Thân cư ${palaces[meta.thanIdx].name})</strong></div>
        </div>

        <!-- Main Chart Display -->
        ${currentViewMode === 'grid' ? renderGrid4x4HTML(meta, palaces) : renderListModeHTML(palaces)}
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

    return `
      <div class="tuvi-grid-wrapper">
        <div class="tuvi-grid-4x4">
          <!-- Thiên Bàn Center -->
          <div class="tuvi-center-box">
            <div class="tc-title">TỬ VI ĐẨU SỐ</div>
            <div class="tc-sub">NAM PHÁI • THÁI THỨ LANG</div>
            
            <div class="tc-info-block">
              <div class="tc-row">
                <span>Dương lịch:</span>
                <strong>${meta.solarDay}/${meta.solarMonth}/${meta.solarYear} (${meta.solarHour}h)</strong>
              </div>
              <div class="tc-row">
                <span>Âm lịch:</span>
                <strong>${meta.lunarDay}/${meta.lunarMonth} năm ${meta.yearGan} ${meta.yearZhi}</strong>
              </div>
              <div class="tc-row">
                <span>Giờ sinh:</span>
                <strong>${meta.hourZhi} • ${meta.amDuongNamNu || (currentIsMale ? 'Nam' : 'Nữ')} (Tuổi mụ: ${meta.currentAgeMu})</strong>
              </div>
              <div class="tc-divider"></div>
              <div class="tc-row highlight-gold">
                <span>Bản Mệnh:</span>
                <strong>${meta.napAm}</strong>
              </div>
              <div class="tc-row">
                <span>Cục:</span>
                <strong>${meta.cucName}</strong>
              </div>
              <div class="tc-row">
                <span>Cung Mệnh:</span>
                <strong>${palaces[meta.menhIdx].canChi}</strong>
              </div>
              <div class="tc-row">
                <span>Thân cư:</span>
                <strong>${palaces[meta.thanIdx].name} (${palaces[meta.thanIdx].canChi})</strong>
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
                  <div class="tc-header-left">
                    <span class="tc-cung-name ${p.isMenh ? 'text-menh' : ''}">${p.name}</span>
                    ${p.isThan ? '<span class="tc-badge-than">THÂN</span>' : ''}
                  </div>
                  <div class="tc-header-right">
                    ${p.isTriet ? '<span class="tc-badge-triet">TRIỆT</span>' : ''}
                    ${p.isTuan ? '<span class="tc-badge-tuan">TUẦN</span>' : ''}
                  </div>
                </div>

                <!-- Main Stars -->
                <div class="tc-main-stars">
                  ${p.mainStars.length === 0 ? '<span class="tc-no-main">Vô Chính Diệu</span>' : `
                    ${p.mainStars.map(s => `
                      <div class="tc-main-star ${getColorClass(s.hanh)}">
                        <span class="ms-name">${s.name}</span>
                        ${s.brightness ? `<span class="ms-b">(${s.brightness})</span>` : ''}
                      </div>
                    `).join('')}
                  `}
                </div>

                <!-- Secondary Stars (Cát & Hung) -->
                <div class="tc-secondary-stars">
                  <div class="tc-lucky-col">
                    ${p.luckyStars.slice(0, 4).map(s => `
                      <span class="tc-sec-star lucky ${getColorClass(s.hanh)}">${s.name}</span>
                    `).join('')}
                    ${p.luckyStars.length > 4 ? `<span class="tc-sec-more">+${p.luckyStars.length - 4}</span>` : ''}
                  </div>
                  <div class="tc-bad-col">
                    ${p.badStars.slice(0, 4).map(s => `
                      <span class="tc-sec-star bad ${getColorClass(s.hanh)}">${s.name}</span>
                    `).join('')}
                    ${p.badStars.length > 4 ? `<span class="tc-sec-more">+${p.badStars.length - 4}</span>` : ''}
                  </div>
                </div>

                <!-- Cell Footer -->
                <div class="tc-cell-footer">
                  <span class="tc-chi">${p.canChi}</span>
                  <span class="tc-ts">${p.trangSinh}</span>
                  <span class="tc-dh">${p.daiHan}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderListModeHTML(palaces) {
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

    // Sync native datepicker -> numeric boxes
    if (datePicker) {
      datePicker.addEventListener('change', () => {
        if (!datePicker.value) return;
        const [y, m, d] = datePicker.value.split('-').map(Number);
        if (inputDay) inputDay.value = d;
        if (inputMonth) inputMonth.value = m;
        if (inputYear) inputYear.value = y;
      });
    }

    // Sync numeric boxes -> native datepicker
    function syncDateBoxesToPicker() {
      if (!inputDay || !inputMonth || !inputYear || !datePicker) return;
      const d = parseInt(inputDay.value) || 1;
      const m = parseInt(inputMonth.value) || 1;
      const y = parseInt(inputYear.value) || 2026;
      datePicker.value = `${y}-${pad(m)}-${pad(d)}`;
    }
    if (inputDay) inputDay.addEventListener('input', syncDateBoxesToPicker);
    if (inputMonth) inputMonth.addEventListener('input', syncDateBoxesToPicker);
    if (inputYear) inputYear.addEventListener('input', syncDateBoxesToPicker);

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
        const CAN_CHI_MAP = [
          { val: 0, match: [23, 0] }, { val: 2, match: [1, 2] },
          { val: 4, match: [3, 4] }, { val: 6, match: [5, 6] },
          { val: 8, match: [7, 8] }, { val: 10, match: [9, 10] },
          { val: 12, match: [11, 12] }, { val: 14, match: [13, 14] },
          { val: 16, match: [15, 16] }, { val: 18, match: [17, 18] },
          { val: 20, match: [19, 20] }, { val: 22, match: [21, 22] }
        ];
        const found = CAN_CHI_MAP.find(c => c.match.includes(h));
        if (found && selectCanChi) selectCanChi.value = String(found.val);
      });
    }

    // Gender toggle
    const btnGender = document.getElementById('tuvi-btn-gender');
    if (btnGender) {
      btnGender.onclick = () => {
        currentIsMale = !currentIsMale;
        renderTuVi();
      };
    }

    // Now button
    const btnNow = document.getElementById('btn-tuvi-now');
    if (btnNow) {
      btnNow.onclick = () => {
        currentTuViDate = new Date();
        renderTuVi();
      };
    }

    // Submit button
    const btnSubmit = document.getElementById('btn-tuvi-submit');
    if (btnSubmit) {
      btnSubmit.onclick = () => {
        const d = Math.min(31, Math.max(1, parseInt(inputDay ? inputDay.value : 1) || 1));
        const m = Math.min(12, Math.max(1, parseInt(inputMonth ? inputMonth.value : 1) || 1));
        const y = Math.min(2100, Math.max(1900, parseInt(inputYear ? inputYear.value : 2026) || 2026));
        const h = Math.min(23, Math.max(0, parseInt(inputHour ? inputHour.value : 12) || 12));
        const min = Math.min(59, Math.max(0, parseInt(inputMin ? inputMin.value : 0) || 0));

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
          <div class="tm-badge"><strong>Tiểu Hạn:</strong> ${p.tieuHan}</div>
          ${p.isThan ? '<div class="tm-badge badge-than">THÂN CƯ</div>' : ''}
          ${p.isTriet ? '<div class="tm-badge badge-triet">TRIỆT</div>' : ''}
          ${p.isTuan ? '<div class="tm-badge badge-tuan">TUẦN</div>' : ''}
        </div>

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
