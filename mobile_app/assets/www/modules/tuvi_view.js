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
        viewYear: currentViewYear
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

    const displayDay = isLunarMode ? meta.lunarDay : meta.solarDay;
    const displayMonth = isLunarMode ? meta.lunarMonth : meta.solarMonth;
    const displayYear = isLunarMode ? meta.lunarYear : meta.solarYear;

    container.innerHTML = `
      <div class="tuvi-view-container">
        <!-- Unified Control Card (Native Wheel Picker, Gender & Viewing Year) -->
        <div class="unified-ctrl-card">
          <!-- Row 1: Birth Date display & Quick Native Picker -->
          <div class="ucc-row" style="justify-content: space-between; flex-wrap: wrap; gap: 6px;">
            <div class="ucc-date-display-badge" id="btn-tuvi-badge" title="Chạm để mở vòng quay chọn ngày giờ sinh">
              <span>👶</span>
              <span class="solar-highlight">${pad(meta.solarDay)}/${pad(meta.solarMonth)}/${meta.solarYear} ${pad(meta.solarHour)}:${pad(currentTuViDate.getMinutes())}</span>
              <span class="lunar-sub">(${meta.lunarDay}/${meta.lunarMonth} ÂL)</span>
            </div>
            <div style="display: flex; gap: 4px; align-items: center; flex-shrink: 0;">
              <button type="button" class="ucc-btn-now" id="btn-tuvi-now" title="Về thời điểm hiện tại">🕒 Hiện Tại</button>
              <button type="button" class="ucc-btn-picker" id="btn-tuvi-picker" title="Chọn ngày giờ sinh">📅 Giờ Sinh</button>
              <input type="datetime-local" id="tuvi-hidden-datetime" style="position:fixed; top:-1000px; left:-1000px; opacity:0; pointer-events:none;" />
            </div>
          </div>

          <!-- Row 2: Gender & Năm Xem Vận Hạn -->
          <div class="ucc-row ucc-row-view-year" style="justify-content: space-between; align-items: center;">
            <div class="ucc-pill-gender">
              <button type="button" class="ucc-gender-btn ${currentIsMale ? 'active male' : ''}" id="tuvi-btn-male">♂ Nam</button>
              <button type="button" class="ucc-gender-btn ${!currentIsMale ? 'active female' : ''}" id="tuvi-btn-female">♀ Nữ</button>
            </div>
            <div class="ucc-view-year-box">
              <span class="ucc-lbl-view-year">🎯 Năm xem:</span>
              <button type="button" class="ucc-btn-year-step" id="btn-view-year-prev" title="Lùi 1 năm">◀</button>
              <input type="number" id="tuvi-input-view-year" class="num-box num-view-year" min="1900" max="2100" value="${currentViewYear}" title="Nhập Năm xem hạn">
              <button type="button" class="ucc-btn-year-step" id="btn-view-year-next" title="Tiến 1 năm">▶</button>
              <span class="ucc-tag-canchi-year" id="tuvi-tag-canchi-year">(${meta.viewYearCanChi})</span>
              <button type="button" class="ucc-btn-year-now" id="btn-view-year-now" title="Về năm nay">⚡</button>
            </div>
          </div>

          <!-- Row 3: Action row (4x4 / 12 Cung, Lập Lá Số) -->
          <div class="ucc-row ucc-row-actions" style="justify-content: space-between; align-items: center;">
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
                  <span class="tc-daihan-val">${p.daiHan}</span>
                  ${p.isTieuHanYear ? `<span class="tc-tieuhan-badge" title="Tiểu Hạn năm ${meta.viewYear} (${meta.viewYearCanChi})">HẠN</span>` : ''}
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

    const pickerBtn = document.getElementById('btn-tuvi-picker');
    const badgeBtn = document.getElementById('btn-tuvi-badge');
    const hiddenInput = document.getElementById('tuvi-hidden-datetime');

    const openPicker = () => {
      if (!hiddenInput) return;
      const d = currentTuViDate;
      hiddenInput.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      if (typeof hiddenInput.showPicker === 'function') {
        hiddenInput.showPicker();
      } else {
        hiddenInput.click();
      }
    };

    if (pickerBtn) pickerBtn.onclick = openPicker;
    if (badgeBtn) badgeBtn.onclick = openPicker;

    if (hiddenInput) {
      hiddenInput.onchange = (e) => {
        if (e.target.value) {
          isLunarMode = false;
          currentTuViDate = new Date(e.target.value);
          renderTuVi();
        }
      };
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
    const btnSubmit = document.getElementById('btn-tuvi-submit');
    if (btnSubmit) {
      btnSubmit.onclick = () => {
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
