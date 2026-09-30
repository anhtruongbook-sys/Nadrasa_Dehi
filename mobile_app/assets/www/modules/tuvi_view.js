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
  let currentViewMode = 'grid'; // 'grid' (4x4), 'list', or 'analysis'
  let currentChartData = null;
  let currentViewYear = new Date().getFullYear(); // Mặc định năm xem hạn là năm hiện tại
  let cachedAnalysisResult = null;
  let cachedAnalysisKey = '';
  let aiPolishedText = '';
  let isAiPolishing = false;
  let aiErrorMessage = '';
  let aiLoadingStepText = 'Đang tiến hành biên tập, trau chuốt cấu trúc câu và từ ngữ học thuật Tử Vi...';
  let currentReportMode = 'standard'; // 'standard' | 'ai'
  let currentAnalysisSubTab = 'dashboard'; // 'dashboard' or 'full-report'

  function resetTuViAiState() {
    aiPolishedText = '';
    isAiPolishing = false;
    aiErrorMessage = '';
    aiLoadingStepText = 'Đang tiến hành biên tập, trau chuốt cấu trúc câu và từ ngữ học thuật Tử Vi...';
    currentReportMode = 'standard';
    cachedAnalysisResult = null;
    cachedAnalysisKey = '';
  }
  let currentPalaceFilter = 'ALL'; // 'ALL' or specific palace name

  function showTuViToast(msg) {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2500);
    } else if (global.showToast) {
      global.showToast(msg);
    }
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

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
    resetTuViAiState();
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
              <button class="ucc-view-btn ${currentViewMode === 'analysis' ? 'active' : ''}" id="btn-tuvi-mode-analysis" title="Bản luận giải chuyên sâu hệ chuyên gia">
                📖 Luận Giải
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
        ${currentViewMode === 'grid' 
          ? renderGrid4x4HTML(meta, palaces) 
          : (currentViewMode === 'list' 
              ? renderListModeHTML(meta, palaces) 
              : renderAnalysisModeHTML(chart))}
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
          <div class="tuvi-center-box" style="grid-row: 2 / span 2; grid-column: 2 / span 2; height: 100%;">
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
                      <span class="star-sec lucky ${getColorClass(s.hanh)}">${s.fullName || s.name}</span>
                    `).join('')}
                    ${p.luckyStars.length > 5 ? `<span class="star-more">+${p.luckyStars.length - 5}</span>` : ''}
                  </div>
                  <div class="tc-col-bad">
                    ${p.badStars.slice(0, 5).map(s => `
                      <span class="star-sec bad ${getColorClass(s.hanh)}">${s.fullName || s.name}</span>
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
                      <span class="tlc-sec-chip lucky ${getColorClass(s.hanh)}">${s.fullName || s.name}</span>
                    `).join('')}
                  </div>
                </div>
                <div class="tlc-sec-col">
                  <span class="tlc-sec-lbl">Sát tinh:</span>
                  <div class="tlc-sec-chips">
                    ${p.badStars.map(s => `
                      <span class="tlc-sec-chip bad ${getColorClass(s.hanh)}">${s.fullName || s.name}</span>
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

  function getOrRunAnalysis(chart) {
    if (!global.NetaTuViInterpreter) return null;
    const meta = chart.meta;
    const targetYear = currentViewYear || meta.viewYear || new Date().getFullYear();
    const key = `${meta.solarDay}_${meta.solarMonth}_${meta.solarYear}_${meta.hour}_${currentIsMale ? 'M' : 'F'}_${targetYear}`;

    if (cachedAnalysisResult && cachedAnalysisKey === key) {
      return cachedAnalysisResult;
    }

    try {
      const res = global.NetaTuViInterpreter.interpret(chart, targetYear);
      cachedAnalysisResult = res;
      cachedAnalysisKey = key;
      return res;
    } catch (e) {
      console.error('[TuViView] Analysis execution error:', e);
      return null;
    }
  }

  function downloadReportFile(content, filename) {
    try {
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'Bao_Cao_Luan_Giai_Tu_Vi.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showTuViToast('Đã tải tệp báo cáo markdown thành công!');
    } catch (e) {
      console.error('Download error:', e);
      showTuViToast('Không thể tải file, vui lòng sao chép văn bản.');
    }
  }

  function splitTuViReportIntoChunks(markdown) {
    if (!markdown) return [];
    
    // Tách thành 3 phân đoạn độc lập để không bao giờ vượt ngưỡng token của LLM
    const idxIV = markdown.search(/\n(?=##\s+IV\.)/i);
    const idxV = markdown.search(/\n(?=##\s+V\.)/i);

    if (idxIV !== -1 && idxV !== -1) {
      return [
        {
          title: "Phần 1/3: Cốt Cách Bản Mệnh, Cấu Trúc Cách Cục & 6 Trụ Cột Đời Người",
          content: markdown.substring(0, idxIV).trim()
        },
        {
          title: "Phần 2/3: Luận Giải Chi Tiết Thập Nhị Cung Chức Năng (12 Cung)",
          content: markdown.substring(idxIV, idxV).trim()
        },
        {
          title: "Phần 3/3: Tứ Hóa Khâm Thiên Môn, 80 Năm Đại Vận, Niên Vận & Đạo Hóa Giải",
          content: markdown.substring(idxV).trim()
        }
      ];
    }

    return [{ title: "Toàn Văn Luận Giải Tử Vi Đẩu Số", content: markdown }];
  }

  async function triggerAiPolish(analysisResult) {
    if (!analysisResult) return;
    if (isAiPolishing) return;

    currentReportMode = 'ai';
    currentAnalysisSubTab = 'full-report';
    isAiPolishing = true;
    aiErrorMessage = '';
    aiLoadingStepText = 'Đang chuẩn bị phân đoạn biên tập học thuật Tử Vi...';
    renderTuVi();

    try {
      const geminiService = global.NetaGeminiService;
      if (!geminiService) {
        throw new Error('Dịch vụ Gemini AI chưa sẵn sàng. Vui lòng kiểm tra lại kết nối mạng hoặc cấu hình hệ thống.');
      }

      const apiKey = (geminiService.getActiveKey && geminiService.getActiveKey()) || (geminiService.getApiKey && geminiService.getApiKey()) || '';
      if (!apiKey) {
        throw new Error('Chưa cài đặt Google Gemini API Key. Bạn có thể cài đặt khóa tại mục Cài Đặt hoặc trong Trải Bài Tarot để sử dụng chung cho toàn bộ ứng dụng.');
      }

      const reportMarkdown = analysisResult.reportMarkdown || '';
      const chunks = splitTuViReportIntoChunks(reportMarkdown);

      const onProgress = (currentPart, totalParts, partTitle) => {
        aiLoadingStepText = `Đang trau chuốt ${partTitle}...`;
        renderTuVi();
      };

      let responseText = '';
      if (typeof geminiService.polishReportInChunks === 'function') {
        responseText = await geminiService.polishReportInChunks(chunks, {
          onProgress,
          temperature: 0.3,
          maxOutputTokens: 8192
        });
      } else if (typeof geminiService.polishReport === 'function') {
        responseText = await geminiService.polishReport(reportMarkdown, {
          temperature: 0.3,
          maxOutputTokens: 8192
        });
      }

      if (responseText) {
        aiPolishedText = responseText;
      } else {
        throw new Error('Không nhận được văn bản phản hồi từ máy chủ Gemini.');
      }
    } catch (err) {
      console.error('[TuVi AI Polish Error]', err);
      aiErrorMessage = err.message || 'Có lỗi xảy ra trong quá trình kết nối với Gemini AI.';
    } finally {
      isAiPolishing = false;
      renderTuVi();
    }
  }

  function formatMarkdownInline(str) {
    if (!str) return '';
    let s = str;
    // Tự động đóng thẻ in đậm nếu dở dang
    const boldMatches = s.match(/\*\*/g);
    if (boldMatches && boldMatches.length % 2 !== 0) {
      s += '**';
    }
    // Tự động đóng thẻ in nghiêng nếu dở dang
    const starMatches = s.replace(/\*\*/g, '').match(/\*/g);
    if (starMatches && starMatches.length % 2 !== 0) {
      s += '*';
    }
    return s
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^\*\n]+?)\*/g, '<em>$1</em>')
      .replace(/`([^`\n]+?)`/g, '<code class="tuvi-inline-code">$1</code>');
  }

  function renderMarkdownToHTML(str) {
    if (!str) return '';
    const lines = str.split('\n');
    let html = '';
    let inList = false;
    let inTable = false;
    let tableHeaders = [];

    for (let i = 0; i < lines.length; i++) {
      let rawLine = lines[i];
      let line = rawLine.trim();

      if (!line) {
        if (inList) { html += '</ul>'; inList = false; }
        if (inTable) { html += '</tbody></table></div>'; inTable = false; tableHeaders = []; }
        continue;
      }

      // Loại bỏ hoàn toàn các ký tự vẽ khung ASCII thô (+-----+ hoặc +====+)
      if (/^\+[=+\-\|]+\+$/.test(line)) {
        continue;
      }

      // Loại bỏ các dòng bảng rỗng (|   |   |)
      if (/^\|[\s\|]+$/.test(line)) {
        continue;
      }

      // Chuyển hóa thanh tiến trình ASCII dạng [Mục] ====> 52/100 thành badge chuẩn
      const mScore = line.match(/^(\[[^\]]+\]|[A-Za-z0-9\.\s&À-ỹ]+)\s*[-=]{3,}>\s*(.*)$/);
      if (mScore) {
        if (inList) { html += '</ul>'; inList = false; }
        if (inTable) { html += '</tbody></table></div>'; inTable = false; }
        const name = mScore[1].replace(/[\[\]]/g, '').trim();
        const val = mScore[2].trim();
        html += `<div class="neta-score-bar-line"><span class="neta-score-name">${formatMarkdownInline(name)}</span><span class="neta-score-val">${formatMarkdownInline(val)}</span></div>`;
        continue;
      }

      if (line === '---' || line === '***' || line === '___') {
        if (inList) { html += '</ul>'; inList = false; }
        if (inTable) { html += '</tbody></table></div>'; inTable = false; }
        html += '<hr class="tuvi-report-divider">';
        continue;
      }

      if (line.startsWith('>')) {
        if (inList) { html += '</ul>'; inList = false; }
        if (inTable) { html += '</tbody></table></div>'; inTable = false; }
        const quoteText = line.replace(/^>\s*/, '');
        if (quoteText.startsWith('[!IMPORTANT]')) {
          html += '<div class="tuvi-callout-box important"><strong>⚠️ Cảnh Báo Trọng Yếu:</strong> ' + formatMarkdownInline(quoteText.replace('[!IMPORTANT]', '').trim()) + '</div>';
        } else if (quoteText.startsWith('[!NOTE]')) {
          html += '<div class="tuvi-callout-box note"><strong>📌 Lưu Ý:</strong> ' + formatMarkdownInline(quoteText.replace('[!NOTE]', '').trim()) + '</div>';
        } else {
          html += '<blockquote class="tuvi-report-quote">' + formatMarkdownInline(quoteText) + '</blockquote>';
        }
        continue;
      }

      if (line.startsWith('|') && line.endsWith('|')) {
        if (inList) { html += '</ul>'; inList = false; }
        if (/^\|[\s\-:]+(\|[\s\-:]+)+\|$/.test(line)) {
          continue;
        }

        const cells = line.split('|').slice(1, -1).map(c => c.trim());
        if (cells.every(c => !c)) {
          continue;
        }
        if (!inTable) {
          inTable = true;
          tableHeaders = cells.map(c => c.replace(/\*\*/g, '').replace(/\*/g, '').trim());
          html += '<div class="tuvi-table-wrap"><table class="tuvi-report-table"><thead><tr>';
          cells.forEach(cell => {
            html += `<th>${formatMarkdownInline(cell)}</th>`;
          });
          html += '</tr></thead><tbody>';
        } else {
          html += '<tr>';
          cells.forEach((cell, colIdx) => {
            const label = tableHeaders[colIdx] || '';
            html += `<td data-label="${escapeHTML(label)}"><span class="table-cell-val">${formatMarkdownInline(cell)}</span></td>`;
          });
          html += '</tr>';
        }
        continue;
      } else if (inTable) {
        html += '</tbody></table></div>';
        inTable = false;
        tableHeaders = [];
      }

      if (line.startsWith('# ')) {
        if (inList) { html += '</ul>'; inList = false; }
        const text = line.substring(2).trim();
        html += `<h1 class="tuvi-report-h1">${formatMarkdownInline(text)}</h1>`;
        continue;
      }
      if (line.startsWith('## ')) {
        if (inList) { html += '</ul>'; inList = false; }
        const text = line.substring(3).trim();
        const secId = 'sec-' + text.split('.')[0].trim().replace(/[^a-zA-Z0-9]/g, '');
        html += `<h2 class="tuvi-report-h2" id="${secId}">${formatMarkdownInline(text)}</h2>`;
        continue;
      }
      if (line.startsWith('### ')) {
        if (inList) { html += '</ul>'; inList = false; }
        const text = line.substring(4).trim();
        html += `<h3 class="tuvi-report-h3">${formatMarkdownInline(text)}</h3>`;
        continue;
      }
      if (line.startsWith('#### ')) {
        if (inList) { html += '</ul>'; inList = false; }
        const text = line.substring(5).trim();
        html += `<h4 class="tuvi-report-h4">${formatMarkdownInline(text)}</h4>`;
        continue;
      }

      if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('+ ')) {
        if (!inList) { html += '<ul class="tuvi-report-list">'; inList = true; }
        const itemText = line.substring(2).trim();
        html += `<li>${formatMarkdownInline(itemText)}</li>`;
        continue;
      }

      const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<div class="tuvi-report-num-item"><span class="tuvi-num-badge">${numMatch[1]}.</span> <div>${formatMarkdownInline(numMatch[2])}</div></div>`;
        continue;
      }

      if (inList) { html += '</ul>'; inList = false; }
      html += `<p class="tuvi-report-p">${formatMarkdownInline(line)}</p>`;
    }

    if (inList) html += '</ul>';
    if (inTable) html += '</tbody></table></div>';
    return html;
  }

  function renderAnalysisModeHTML(chart) {
    const analysis = getOrRunAnalysis(chart);
    if (!analysis) {
      return `
        <div class="tuvi-analysis-container">
          <div class="tuvi-analysis-card" style="text-align: center; padding: 30px;">
            <p style="color: var(--text-muted); font-size: 0.9rem;">
              ⏳ Đang nạp Động cơ Hệ Chuyên Gia Tử Vi Đẩu Số...
            </p>
          </div>
        </div>
      `;
    }

    const { chartData, patternData, evaluatedPalaces, tuHoaData, timingData, scoresData, masterAssessment, reportMarkdown } = analysis;
    const ma = masterAssessment || (global.NetaTuViInterpreter?.synthesizeMasterAssessment ? global.NetaTuViInterpreter.synthesizeMasterAssessment(chartData, patternData, evaluatedPalaces, tuHoaData, timingData, scoresData) : null);
    const meta = chartData.meta;
    const targetYear = meta.target_year;

    // Helper: Map score to bar color gradient
    const getScoreGradient = (sc) => {
      if (sc >= 85) return 'linear-gradient(90deg, #27ae60, #2ecc71)';
      if (sc >= 70) return 'linear-gradient(90deg, #2980b9, #3498db)';
      if (sc >= 55) return 'linear-gradient(90deg, #f39c12, #f1c40f)';
      if (sc >= 40) return 'linear-gradient(90deg, #d35400, #e67e22)';
      return 'linear-gradient(90deg, #c0392b, #e74c3c)';
    };

    const getGradeLabel = (g) => {
      if (!g) return 'Bình Hòa';
      if (typeof g === 'object') return g.label || g.grade || 'Bình Hòa';
      return String(g);
    };

    const getGradeClass = (gradeKey) => {
      const g = String(getGradeLabel(gradeKey)).toLowerCase();
      if (g.includes('excellent') || g.includes('thượng') || g.includes('xuất sắc')) return 'grade-excellent';
      if (g.includes('good') || g.includes('cát') || g.includes('khá')) return 'grade-good';
      if (g.includes('fair') || g.includes('bình') || g.includes('trung')) return 'grade-fair';
      if (g.includes('warning') || g.includes('thử thách') || g.includes('trung hạ')) return 'grade-warning';
      return 'grade-danger';
    };

    const lineCount = (reportMarkdown || '').split('\n').length;
    const charCount = (reportMarkdown || '').length;

    // Filter palaces for Card 6
    const displayedPalaces = (currentPalaceFilter === 'ALL')
      ? (evaluatedPalaces || [])
      : (evaluatedPalaces || []).filter(ep => (ep.ten_cung || ep.cung_name) === currentPalaceFilter);

    const PALACE_PILL_LIST = ['Mệnh', 'Quan Lộc', 'Tài Bạch', 'Phu Thê', 'Phúc Đức', 'Điền Trạch', 'Thiên Di', 'Tật Ách', 'Tử Tức', 'Huynh Đệ', 'Nô Bộc', 'Phụ Mẫu'];

    return `
      <div class="tuvi-analysis-container">
        <!-- Thanh Công Cụ Chuẩn Hóa Neta -->
        <div class="neta-action-toolbar">
          <div class="neta-module-badge">
            <span>🌌</span>
            <span>Tử Vi Đẩu Số • Nam Phái Học Thuật</span>
          </div>
          <div class="neta-toolbar-actions">
            <button class="neta-btn-action" id="btn-tuvi-copy-report" title="Sao chép toàn bộ bài luận giải vào bộ nhớ tạm">
              📋 Sao Chép Luận Giải
            </button>
            <button class="neta-btn-action" id="btn-tuvi-download-report" title="Tải xuống bài luận giải dạng Markdown">
              💾 Tải File (.MD)
            </button>
            <button class="neta-btn-polish-ai" id="btn-tuvi-polish-ai" title="Trau chuốt văn phong toàn diện bằng AI">
              ${isAiPolishing ? '⏳ Đang Trau Chuốt...' : '✨ Trau Chuốt Văn Phong'}
            </button>
          </div>
        </div>

        <!-- Sub-Tab Navigation -->
        <div class="tuvi-analysis-subnav">
          <button class="tuvi-subnav-btn ${currentAnalysisSubTab === 'dashboard' ? 'active' : ''}" id="btn-tuvi-tab-dashboard">
            📊 Bảng Phân Tích Tổng Hợp (7 Cột Trụ & 12 Cung)
          </button>
          <button class="tuvi-subnav-btn ${currentAnalysisSubTab === 'full-report' ? 'active' : ''}" id="btn-tuvi-tab-full-report">
            📜 Toàn Văn Báo Cáo Chuyên Sâu
          </button>
        </div>

        <!-- 3. Nội dung hiển thị theo Sub-Tab -->
        ${currentAnalysisSubTab === 'full-report' ? `
          <!-- Full Report Reader Container -->
          <div class="tuvi-full-report-wrap">
            <div class="tuvi-report-meta-bar">
              <div style="font-weight: 800; font-size: 0.95rem; color: var(--gold-glow); display: flex; align-items: center; gap: 8px;">
                <span>📜</span> BẢN TOÀN VĂN LUẬN GIẢI TỬ VI ĐẨU SỐ
              </div>
              <div class="neta-report-mode-toggle">
                <button type="button" class="neta-mode-pill ${currentReportMode === 'standard' ? 'active' : ''}" id="btn-tuvi-mode-standard">
                  📜 Bản Tiêu Chuẩn
                </button>
                <button type="button" class="neta-mode-pill ${currentReportMode === 'ai' ? 'active' : ''}" id="btn-tuvi-mode-ai">
                  ${isAiPolishing ? '⏳ Đang Trau Chuốt...' : '✨ Bản Trau Chuốt (AI)'}
                </button>
              </div>
            </div>

            ${currentReportMode === 'ai' ? `
              <!-- Chế độ Trau Chuốt AI (Hiển thị ngay trong lòng báo cáo, không bật ô to đùng) -->
              ${isAiPolishing ? `
                <div class="neta-inline-ai-loading">
                  <div class="neta-ai-loading-step">
                    <span class="neta-ai-sparkle-icon">✨</span>
                    <span>${aiLoadingStepText || 'Đang tiến hành biên tập, trau chuốt cấu trúc câu và từ ngữ học thuật Tử Vi...'}</span>
                  </div>
                  <div class="neta-ai-shimmer-track"><div class="neta-ai-shimmer-thumb"></div></div>
                </div>
              ` : ''}

              ${aiErrorMessage ? `
                <div style="color: #e74c3c; font-weight: 600; font-size: 0.85rem; line-height: 1.6; background: rgba(231,76,60,0.12); padding: 14px; border-radius: 8px; border: 1px solid rgba(231,76,60,0.3); margin: 16px 0;">
                  <div>⚠️ ${escapeHTML(aiErrorMessage)}</div>
                  <div style="margin-top: 10px;">
                    <button type="button" class="neta-btn-action" id="btn-tuvi-open-key-modal" style="background: var(--gold-primary); color: #000; font-weight: 700; border-color: var(--gold-glow);">
                      ⚙️ Cài Đặt Khóa Gemini API Dùng Chung
                    </button>
                  </div>
                </div>
              ` : ''}

              ${aiPolishedText ? `
                <div class="neta-polished-status-bar">
                  <span>✨ Bản Luận Giải Đã Được Trau Chuốt Học Thuật Bởi Gemini AI</span>
                  <button type="button" class="neta-btn-inline-back" id="btn-tuvi-back-standard">↩️ Xem Bản Tiêu Chuẩn</button>
                </div>
                <div class="tuvi-full-report-content neta-drop-cap" style="font-size: 0.88rem; line-height: 1.75; color: var(--text-color);">
                  ${renderMarkdownToHTML(aiPolishedText)}
                </div>
              ` : (!isAiPolishing && !aiErrorMessage ? `
                <div style="text-align: center; padding: 36px 16px; color: var(--text-muted);">
                  <p style="margin-bottom: 12px;">Chưa kích hoạt trau chuốt văn phong cho lá số này.</p>
                  <button type="button" class="neta-btn-polish-ai" id="btn-tuvi-inline-trigger-ai">
                    ✨ Bắt Đầu Trau Chuốt Văn Phong
                  </button>
                </div>
              ` : '')}
            ` : `
              <!-- Chế độ Tiêu Chuẩn (Offline 100%) -->
              <div class="tuvi-report-stats-badge" style="margin-bottom: 12px; display: inline-block;">
                📅 Niên Vận Khảo Sát: Năm ${targetYear}${meta.viewYearCanChi ? ` (${meta.viewYearCanChi})` : ''} • Toàn Bộ 12 Cung Vị
              </div>

              <!-- Table of Contents -->
              <div class="tuvi-report-toc">
                <span style="font-weight: 700; font-size: 0.72rem; color: var(--gold-primary); align-self: center; margin-right: 4px;">Mục lục nhanh:</span>
                <a class="tuvi-report-toc-pill" href="#sec-I">I. Cốt Lõi Tinh Bàn</a>
                <a class="tuvi-report-toc-pill" href="#sec-II">II. Tổng Luận Vận Trình</a>
                <a class="tuvi-report-toc-pill" href="#sec-III">III. Cách Cục</a>
                <a class="tuvi-report-toc-pill" href="#sec-IV">IV. 6 Trụ Cột</a>
                <a class="tuvi-report-toc-pill" href="#sec-V">V. 12 Cung Chức Năng</a>
                <a class="tuvi-report-toc-pill" href="#sec-VI">VI. Tứ Hóa Khâm Thiên</a>
                <a class="tuvi-report-toc-pill" href="#sec-VII">VII. Đại Vận 80 Năm</a>
                <a class="tuvi-report-toc-pill" href="#sec-VIII">VIII. Niên Vận ${targetYear}</a>
                <a class="tuvi-report-toc-pill" href="#sec-IX">IX. Đa Năm</a>
                <a class="tuvi-report-toc-pill" href="#sec-X">X. Đạo Hóa Giải</a>
              </div>

              <div class="tuvi-full-report-content" style="font-size: 0.85rem; line-height: 1.7; color: var(--text-color);">
                ${renderMarkdownToHTML(reportMarkdown)}
              </div>
            `}

            <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid rgba(245, 176, 65, 0.3); display: flex; justify-content: flex-end; gap: 8px;">
              <button class="tuvi-btn-action-sm" id="btn-tuvi-copy-report-bottom">
                📋 Sao Chép Toàn Bộ Báo Cáo
              </button>
              <button class="tuvi-btn-action-sm" id="btn-tuvi-download-report-bottom">
                💾 Tải File Báo Cáo (.MD)
              </button>
            </div>
          </div>
        ` : `
          <!-- Card 0: TỔNG QUAN CỐT CÁCH & BẢN ĐỒ CHIẾN LƯỢC VẬN TRÌNH ĐỜI NGƯỜI -->
          ${ma ? `
          <div class="tuvi-analysis-card" id="tuvi-card-master-assessment" style="margin-bottom: 14px;">
            <div class="tuvi-card-header">
              <div class="tuvi-card-title">
                <span>🧭</span> TỔNG QUAN CỐT CÁCH & BẢN ĐỒ CHIẾN LƯỢC VẬN TRÌNH
              </div>
              <span class="tuvi-grade-badge grade-excellent" style="font-size: 0.74rem;">${escapeHTML(ma.masterOverview?.gradeBadge || 'Thượng Cách')}</span>
            </div>

            <!-- 1. Executive Overview -->
            <div class="tuvi-master-meta-box">
              <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                <span class="tuvi-master-pill-tag">
                  🧬 <strong>Bản Mệnh:</strong>&nbsp;${escapeHTML(meta.nap_am)} (${escapeHTML(ma.masterOverview?.menhElement)})
                </span>
                <span class="tuvi-master-pill-tag">
                  🏛️ <strong>Cục Số:</strong>&nbsp;${escapeHTML(meta.cuc_name)}
                </span>
                <span class="tuvi-master-pill-tag" style="color: #2ecc71;">
                  ⚖️ ${escapeHTML(ma.masterOverview?.menhCucStatus)}
                </span>
                <span class="tuvi-master-pill-tag" style="color: #3498db;">
                  👑 Vòng Thái Tuế: ${escapeHTML(ma.masterOverview?.thaiTueGroup)}
                </span>
              </div>
              <div style="font-size: 0.84rem; line-height: 1.6; color: var(--text-color); margin-bottom: 8px;">
                ${escapeHTML(ma.masterOverview?.executiveSummary)}
              </div>
              <div style="font-size: 0.79rem; line-height: 1.5; color: var(--text-color); border-top: 1px dashed rgba(245, 176, 65, 0.25); padding-top: 6px;">
                🔄 <strong>Bước ngoặt Mệnh - Thân:</strong> ${escapeHTML(ma.masterOverview?.menhThanPivotText)}
              </div>
            </div>

            <!-- 2. Bảng Tổng Hợp: Điểm Sáng vs Điểm Cần Lưu Ý -->
            <div class="tuvi-master-spots-grid">
              <!-- Cột Điểm Sáng -->
              <div class="tuvi-master-bright-col">
                <div style="font-size: 0.82rem; font-weight: 700; color: #2ecc71; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; text-transform: uppercase;">
                  <span>✨</span> Danh Mục Điểm Sáng & Ưu Thế Thiên Phú
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${(ma.brightSpots || []).map(b => `
                    <div class="tuvi-master-spot-item bright">
                      <div style="font-weight: 700; color: #27ae60; margin-bottom: 2px;">${escapeHTML(b.title)}</div>
                      <div>${escapeHTML(b.detail)}</div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Cột Điểm Cần Lưu Ý -->
              <div class="tuvi-master-hazard-col">
                <div style="font-size: 0.82rem; font-weight: 700; color: #e74c3c; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; text-transform: uppercase;">
                  <span>⚠️</span> Danh Mục Điểm Cần Lưu Ý & Hóa Giải
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${(ma.hazardSpots || []).length > 0 ? (ma.hazardSpots || []).map(h => `
                    <div class="tuvi-master-spot-item hazard">
                      <div style="font-weight: 700; color: #c0392b; margin-bottom: 2px;">${escapeHTML(h.title)}</div>
                      <div>${escapeHTML(h.detail)}</div>
                    </div>
                  `).join('') : `
                    <div style="font-size: 0.78rem; color: var(--text-muted); padding: 8px;">
                      Tinh bàn không bị sát tinh hãm địa xâm phạm trực diện, giữ được trạng thái cân bằng.
                    </div>
                  `}
                </div>
              </div>
            </div>

            <!-- 3. Hướng Đi Vận Trình Đời Người (Tiền Vận, Trung Vận, Hậu Vận) -->
            <div class="tuvi-master-trajectory-box">
              <div class="tuvi-master-sec-title">
                <span>🗺️</span> BẢN ĐỒ HƯỚNG ĐI VẬN TRÌNH ĐỜI NGƯỜI
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.8rem; line-height: 1.55;">
                <!-- Tiền vận -->
                <div class="tuvi-master-trajectory-step">
                  <div class="tuvi-master-step-title">🌱 ${escapeHTML(ma.lifeTrajectory?.tienVan?.period)}: ${escapeHTML(ma.lifeTrajectory?.tienVan?.theme)}</div>
                  <div style="color: var(--text-color); margin-top: 3px;">${escapeHTML(ma.lifeTrajectory?.tienVan?.content)}</div>
                </div>
                <!-- Trung vận -->
                <div class="tuvi-master-trajectory-step">
                  <div class="tuvi-master-step-title">⚡ ${escapeHTML(ma.lifeTrajectory?.trungVan?.period)}: ${escapeHTML(ma.lifeTrajectory?.trungVan?.theme)}</div>
                  <div style="color: var(--text-color); margin-top: 3px;">${escapeHTML(ma.lifeTrajectory?.trungVan?.content)}</div>
                  ${ma.lifeTrajectory?.trungVan?.goldenDecade ? `
                    <div class="tuvi-master-golden-banner">
                      <span style="font-weight: 700; color: var(--gold-glow);">🌟 ${escapeHTML(ma.lifeTrajectory?.trungVan?.goldenDecade?.title)}:</span>
                      <span style="color: var(--text-color);"> ${escapeHTML(ma.lifeTrajectory?.trungVan?.goldenDecade?.detail)}</span>
                    </div>
                  ` : ''}
                  ${ma.lifeTrajectory?.trungVan?.defenseDecade ? `
                    <div class="tuvi-master-defense-banner">
                      <span style="font-weight: 700; color: #e67e22;">🛡️ ${escapeHTML(ma.lifeTrajectory?.trungVan?.defenseDecade?.title)}:</span>
                      <span style="color: var(--text-color);"> ${escapeHTML(ma.lifeTrajectory?.trungVan?.defenseDecade?.detail)}</span>
                    </div>
                  ` : ''}
                </div>
                <!-- Hậu vận -->
                <div class="tuvi-master-trajectory-step">
                  <div class="tuvi-master-step-title">🌾 ${escapeHTML(ma.lifeTrajectory?.hauVan?.period)}: ${escapeHTML(ma.lifeTrajectory?.hauVan?.theme)}</div>
                  <div style="color: var(--text-color); margin-top: 3px;">${escapeHTML(ma.lifeTrajectory?.hauVan?.content)}</div>
                </div>
              </div>
            </div>

            <!-- 4. Lời Khuyên Hành Động Thiết Thực Theo 5 Trụ Cột -->
            <div>
              <div class="tuvi-master-sec-title">
                <span>💡</span> 5 TRỤ CỘT LỜI KHUYÊN HÀNH ĐỘNG CHIẾN LƯỢC
              </div>
              <div class="tuvi-master-pillars-grid">
                <div class="tuvi-master-pillar-card">
                  <div class="tuvi-master-pillar-title">💼 Công Việc & Sự Nghiệp</div>
                  <div style="font-size: 0.76rem; line-height: 1.5; color: var(--text-color);">${escapeHTML(ma.strategicPillars?.career?.advice)}</div>
                </div>
                <div class="tuvi-master-pillar-card">
                  <div class="tuvi-master-pillar-title">💰 Tiền Tài & Quản Trị Tài Sản</div>
                  <div style="font-size: 0.76rem; line-height: 1.5; color: var(--text-color);">${escapeHTML(ma.strategicPillars?.wealth?.advice)}</div>
                </div>
                <div class="tuvi-master-pillar-card">
                  <div class="tuvi-master-pillar-title">🏡 Gia Đạo & Hôn Nhân</div>
                  <div style="font-size: 0.76rem; line-height: 1.5; color: var(--text-color);">${escapeHTML(ma.strategicPillars?.marriage?.advice)}</div>
                </div>
                <div class="tuvi-master-pillar-card">
                  <div class="tuvi-master-pillar-title">🌿 Sức Khỏe & Phòng Ngừa</div>
                  <div style="font-size: 0.76rem; line-height: 1.5; color: var(--text-color);">${escapeHTML(ma.strategicPillars?.health?.advice)}</div>
                </div>
                <div class="tuvi-master-pillar-card">
                  <div class="tuvi-master-pillar-title">🕊️ Đạo Tu Dưỡng Hóa Giải</div>
                  <div style="font-size: 0.76rem; line-height: 1.5; color: var(--text-color);">${escapeHTML(ma.strategicPillars?.mindfulness?.advice)}</div>
                </div>
              </div>
            </div>
          </div>
          ` : ''}

          <!-- 3. Card 1: BẢNG ĐIỂM ĐỊNH LƯỢNG 6 TRỤ CỘT CUỘC ĐỜI (1 - 100) -->
        <div class="tuvi-analysis-card">
          <div class="tuvi-card-header">
            <div class="tuvi-card-title">
              <span>📊</span> BẢNG ĐIỂM ĐỊNH LƯỢNG 6 TRỤ CỘT CUỘC ĐỜI (1 - 100)
            </div>
            <span style="font-size: 0.72rem; color: var(--text-muted);">Mô hình chấm điểm đa biến 40 chỉ số</span>
          </div>

          <div class="tuvi-scores-grid">
            <!-- 1. Vận Mạng Căn Cốt -->
            <div class="tuvi-score-item">
              <div class="tuvi-score-head">
                <span class="tuvi-score-label">1. Cốt Cách Bản Mệnh</span>
                <span class="tuvi-score-num">${scoresData.overall_destiny.score}<small style="font-size: 0.65rem; color: var(--text-muted);">/100</small></span>
              </div>
              <div class="tuvi-score-bar-bg">
                <div class="tuvi-score-bar-fill" style="width: ${scoresData.overall_destiny.score}%; background: ${getScoreGradient(scoresData.overall_destiny.score)};"></div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                <span class="tuvi-grade-badge ${getGradeClass(scoresData.overall_destiny.grade)}">${getGradeLabel(scoresData.overall_destiny.grade)}</span>
                <span class="tuvi-score-desc">${scoresData.overall_destiny.desc}</span>
              </div>
            </div>

            <!-- 2. Sự Nghiệp & Quyền Lực -->
            <div class="tuvi-score-item">
              <div class="tuvi-score-head">
                <span class="tuvi-score-label">2. Sự Nghiệp & Quyền Lực</span>
                <span class="tuvi-score-num">${scoresData.career_power.score}<small style="font-size: 0.65rem; color: var(--text-muted);">/100</small></span>
              </div>
              <div class="tuvi-score-bar-bg">
                <div class="tuvi-score-bar-fill" style="width: ${scoresData.career_power.score}%; background: ${getScoreGradient(scoresData.career_power.score)};"></div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                <span class="tuvi-grade-badge ${getGradeClass(scoresData.career_power.grade)}">${getGradeLabel(scoresData.career_power.grade)}</span>
                <span class="tuvi-score-desc">${scoresData.career_power.desc}</span>
              </div>
            </div>

            <!-- 3. Tài Chính & Điền Sản -->
            <div class="tuvi-score-item">
              <div class="tuvi-score-head">
                <span class="tuvi-score-label">3. Tài Chính & Điền Sản</span>
                <span class="tuvi-score-num">${scoresData.wealth_assets.score}<small style="font-size: 0.65rem; color: var(--text-muted);">/100</small></span>
              </div>
              <div class="tuvi-score-bar-bg">
                <div class="tuvi-score-bar-fill" style="width: ${scoresData.wealth_assets.score}%; background: ${getScoreGradient(scoresData.wealth_assets.score)};"></div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                <span class="tuvi-grade-badge ${getGradeClass(scoresData.wealth_assets.grade)}">${getGradeLabel(scoresData.wealth_assets.grade)}</span>
                <span class="tuvi-score-desc">${scoresData.wealth_assets.desc}</span>
              </div>
            </div>

            <!-- 4. Hôn Nhân & Gia Đạo -->
            <div class="tuvi-score-item">
              <div class="tuvi-score-head">
                <span class="tuvi-score-label">4. Hôn Nhân & Gia Đạo</span>
                <span class="tuvi-score-num">${scoresData.marriage_harmony.score}<small style="font-size: 0.65rem; color: var(--text-muted);">/100</small></span>
              </div>
              <div class="tuvi-score-bar-bg">
                <div class="tuvi-score-bar-fill" style="width: ${scoresData.marriage_harmony.score}%; background: ${getScoreGradient(scoresData.marriage_harmony.score)};"></div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                <span class="tuvi-grade-badge ${getGradeClass(scoresData.marriage_harmony.grade)}">${getGradeLabel(scoresData.marriage_harmony.grade)}</span>
                <span class="tuvi-score-desc">${scoresData.marriage_harmony.desc}</span>
              </div>
            </div>

            <!-- 5. Sức Khỏe & Thọ Mệnh -->
            <div class="tuvi-score-item">
              <div class="tuvi-score-head">
                <span class="tuvi-score-label">5. Sức Khỏe & Thọ Mệnh</span>
                <span class="tuvi-score-num">${scoresData.health_longevity.score}<small style="font-size: 0.65rem; color: var(--text-muted);">/100</small></span>
              </div>
              <div class="tuvi-score-bar-bg">
                <div class="tuvi-score-bar-fill" style="width: ${scoresData.health_longevity.score}%; background: ${getScoreGradient(scoresData.health_longevity.score)};"></div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                <span class="tuvi-grade-badge ${getGradeClass(scoresData.health_longevity.grade)}">${getGradeLabel(scoresData.health_longevity.grade)}</span>
                <span class="tuvi-score-desc">${scoresData.health_longevity.desc}</span>
              </div>
            </div>

            <!-- 6. Vận Hạn Năm Hiện Tại -->
            <div class="tuvi-score-item">
              <div class="tuvi-score-head">
                <span class="tuvi-score-label">6. Vận Hạn Năm ${targetYear}</span>
                <span class="tuvi-score-num">${scoresData.annual_fortune.score}<small style="font-size: 0.65rem; color: var(--text-muted);">/100</small></span>
              </div>
              <div class="tuvi-score-bar-bg">
                <div class="tuvi-score-bar-fill" style="width: ${scoresData.annual_fortune.score}%; background: ${getScoreGradient(scoresData.annual_fortune.score)};"></div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                <span class="tuvi-grade-badge ${getGradeClass(scoresData.annual_fortune.grade)}">${getGradeLabel(scoresData.annual_fortune.grade)}</span>
                <span class="tuvi-score-desc">${scoresData.annual_fortune.desc}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Card 2: NHẬN DIỆN CÁCH CỤC TIÊN THIÊN & BỘ SAO -->
        <div class="tuvi-analysis-card">
          <div class="tuvi-card-header">
            <div class="tuvi-card-title">
              <span>🏛️</span> CÁCH CỤC TIÊN THIÊN & TỔ HỢP TINH TÚ
            </div>
            <span style="font-size: 0.72rem; color: var(--gold-glow);">Bộ quy tắc 16 đại cách</span>
          </div>

          <div class="tuvi-patterns-wrap">
            ${patternData.favorable && patternData.favorable.length > 0 ? `
              <div style="margin-bottom: 12px;">
                <div style="font-size: 0.75rem; color: #2ecc71; font-weight: 700; margin-bottom: 6px; text-transform: uppercase;">
                  🌟 Cát Cách Thuận Lợi Nhận Diện Được:
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${patternData.favorable.map(pat => `
                    <div class="tuvi-pattern-badge favorable">
                      <div class="tuvi-pat-name">✨ ${pat.name} <span style="font-size: 0.72rem; color: var(--gold-glow);">(${pat.level})</span></div>
                      <div class="tuvi-pat-desc">${pat.description}</div>
                      ${pat.career ? `<div style="margin-top: 4px; font-size: 0.74rem; color: var(--text-color);">🎯 <strong>Khuyên dùng chức nghiệp:</strong> ${pat.career}</div>` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : `
              <p style="font-size: 0.78rem; color: var(--text-muted); margin: 0 0 10px 0;">
                Mệnh Thân bình hòa, cách cục không rơi vào thế thiên lệch, thành bại do sự kiên trì và tích lũy tự thân.
              </p>
            `}

            ${patternData.unfavorable && patternData.unfavorable.length > 0 ? `
              <div>
                <div style="font-size: 0.75rem; color: #e74c3c; font-weight: 700; margin-bottom: 6px; text-transform: uppercase;">
                  ⚠️ Bại Cách Cần Chú Ý Hóa Giải:
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${patternData.unfavorable.map(pat => `
                    <div class="tuvi-pattern-badge unfavorable">
                      <div class="tuvi-pat-name">⚡ ${pat.name} <span style="font-size: 0.72rem; color: #f1948a;">(${pat.level})</span></div>
                      <div class="tuvi-pat-desc">${pat.description}</div>
                      ${pat.warning ? `<div style="margin-top: 4px; font-size: 0.74rem; color: #f5b7b1;">🛡️ <strong>Hóa giải:</strong> ${pat.warning}</div>` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- 5. Card 3: TỨ HÓA TIÊN THIÊN KHÂM THIÊN MÔN -->
        <div class="tuvi-analysis-card">
          <div class="tuvi-card-header">
            <div class="tuvi-card-title">
              <span>⚡</span> TỨ HÓA TIÊN THIÊN (KHÂM THIÊN MÔN & LỤC NỘI / NGOẠI)
            </div>
            <span style="font-size: 0.72rem; color: var(--text-muted);">Khởi từ Can ${tuHoaData.year_gan}</span>
          </div>

          <div class="tuvi-tuhoa-grid">
            ${['Hóa Lộc', 'Hóa Quyền', 'Hóa Khoa', 'Hóa Kỵ'].map(thName => {
              const thObj = (tuHoaData.transformationsSummary && tuHoaData.transformationsSummary[thName]) || 
                            (tuHoaData.transformations && tuHoaData.transformations[thName]) || 
                            {};
              const isNoi = thObj.palace_type === 'Nội Cung';
              return `
                <div class="tuvi-tuhoa-card ${thName === 'Hóa Kỵ' ? 'ky' : (thName === 'Hóa Lộc' ? 'loc' : 'common')}">
                  <div class="tuvi-tuhoa-title">
                    <span style="font-weight: 800;">${thName}</span>
                    <span style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; background: ${isNoi ? 'rgba(46,204,113,0.2)' : 'rgba(230,126,34,0.2)'}; color: ${isNoi ? '#2ecc71' : '#e67e22'};">
                      ${thObj.palace_type || 'Nội Cung'}
                    </span>
                  </div>
                  <div style="font-size: 0.78rem; font-weight: 700; color: var(--gold-glow); margin: 4px 0;">
                    ${thObj.star_name || ''} ➔ Cung ${thObj.cung_name || ''} (${thObj.dia_chi || ''})
                  </div>
                  <div style="font-size: 0.74rem; color: var(--text-color); line-height: 1.45;">
                    ${thObj.kham_thien_doctrine || thObj.doctrine || 'Dòng năng lượng vận hành tiên thiên.'}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          ${tuHoaData.ky_clash_warning ? `
            <div style="margin-top: 10px; background: rgba(231,76,60,0.12); border-left: 3px solid #e74c3c; padding: 8px 12px; border-radius: 4px; font-size: 0.76rem; color: #f1948a;">
              <strong>Cảnh báo Xung Kỵ:</strong> ${tuHoaData.ky_clash_warning}
            </div>
          ` : ''}
        </div>

        <!-- 6. Card 4: LỘ TRÌNH VẬN HẠN ĐA TẦNG (80 NĂM ĐẠI VẬN) -->
        <div class="tuvi-analysis-card">
          <div class="tuvi-card-header">
            <div class="tuvi-card-title">
              <span>⏳</span> LỘ TRÌNH ĐẠI VẬN SUỐT CUỘC ĐỜI (80 NĂM KHÍ SỐ)
            </div>
            <span style="font-size: 0.72rem; color: var(--gold-glow);">8 bước chuyển dịch vận mệnh</span>
          </div>

          <div class="tuvi-daivan-timeline">
            ${(timingData.all_life_dai_vans || []).map(dv => {
              const rel = dv.element_interaction || {};
              return `
                <div class="tuvi-daivan-step ${dv.is_active ? 'active' : ''}">
                  <div class="tuvi-dv-head">
                    <span class="tuvi-dv-range">${dv.range} Tuổi</span>
                    <span class="tuvi-dv-cung">${dv.palace_name} (${dv.dia_chi})</span>
                  </div>
                  <div style="font-size: 0.72rem; color: var(--gold-glow); margin: 3px 0;">
                    Can Chi: ${dv.thien_can} ${dv.dia_chi} • ${dv.nap_am}
                  </div>
                  <div class="tuvi-dv-desc">${dv.summary}</div>
                  <div style="font-size: 0.7rem; color: #2ecc71; margin-top: 3px;">
                    ${rel.status ? `Tương tác: ${rel.status}` : ''}
                  </div>
                  ${dv.is_active ? '<div class="tuvi-active-pill">Đang Vận Hành</div>' : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 7. Card 5: VẬN HẠN LƯU NIÊN NĂM ${targetYear} & 12 THÁNG -->
        <div class="tuvi-analysis-card">
          <div class="tuvi-card-header">
            <div class="tuvi-card-title">
              <span>📅</span> NIÊN VẬN NĂM ${targetYear} (${meta.viewYearCanChi}) & KHÍ SỐ 12 THÁNG
            </div>
            <span style="font-size: 0.72rem; color: var(--text-muted);">Tuổi mụ ${meta.lunar_age || meta.currentAgeMu} tuổi</span>
          </div>

          <div style="margin-bottom: 12px; font-size: 0.8rem; line-height: 1.6; color: var(--text-color);">
            <div style="font-weight: 700; color: var(--gold-primary); margin-bottom: 4px;">
              🎯 Trọng Tâm Cần Chú Ý Trong Năm:
            </div>
            <ul style="margin: 0; padding-left: 18px; color: var(--text-color);">
              ${(Array.isArray(timingData.annual_focus) 
                  ? timingData.annual_focus 
                  : (timingData.annual_focus_list || (timingData.annual_focus && timingData.annual_focus.analysis ? [timingData.annual_focus.analysis] : []))
                ).map(af => `<li style="margin-bottom: 4px;">${af}</li>`).join('')}
            </ul>
          </div>

          <div style="font-size: 0.76rem; font-weight: 700; color: var(--gold-primary); margin-bottom: 6px;">
            🌙 Diễn Biến Khí Số Chi Tiết 12 Tháng Âm Lịch:
          </div>

          <div class="tuvi-months-grid">
            ${(timingData.monthly_forecast || []).map(m => `
              <div class="tuvi-month-card">
                <div class="tuvi-m-head">
                  <span class="tuvi-m-name">${m.month_name}</span>
                  <span class="tuvi-m-cung">${m.palace} (${m.chi})</span>
                </div>
                <div class="tuvi-m-stars">Sao: ${m.chinh_tinh}</div>
                <div class="tuvi-m-note">${m.note}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 8. Card 6: TOÀN DIỆN LUẬN GIẢI 12 CUNG CHỨC NĂNG -->
        <div class="tuvi-analysis-card">
          <div class="tuvi-card-header">
            <div class="tuvi-card-title">
              <span>📜</span> TOÀN DIỆN LUẬN GIẢI 12 CUNG CHỨC NĂNG (TOÀN VĂN HỌC THUẬT)
            </div>
            <span style="font-size: 0.72rem; color: var(--gold-glow);">Khảo luận 12 cung chức năng</span>
          </div>

          <!-- Palace Quick Filter Bar -->
          <div class="tuvi-palace-filter-bar">
            <button class="tuvi-palace-pill ${currentPalaceFilter === 'ALL' ? 'active' : ''}" data-palace-filter="ALL">🏰 Tất Cả 12 Cung</button>
            ${PALACE_PILL_LIST.map(c => `
              <button class="tuvi-palace-pill ${currentPalaceFilter === c ? 'active' : ''}" data-palace-filter="${c}">
                ${c}
              </button>
            `).join('')}
          </div>

          <div class="tuvi-palaces-treatise-list">
            ${displayedPalaces.map(ep => {
              const cungName = ep.ten_cung || ep.cung_name || 'Cung';
              const canChi = ep.can_chi || `${ep.thien_can || ''} ${ep.dia_chi || ''}`.trim();
              const score = ep.score != null ? ep.score : (ep.quality_score != null ? ep.quality_score : 50);
              const level = ep.level || (score >= 70 ? 'Thượng Cát' : (score >= 50 ? 'Trung Bình Khá' : 'Cần Hóa Giải'));
              const isMenh = cungName === 'Mệnh';
              const treatiseContent = ep.deep_treatise || ep.summary || '';
              const deepTreatiseHTML = renderMarkdownToHTML(treatiseContent);

              return `
                <div class="tuvi-palace-treatise-card" id="palace-card-${cungName}">
                  <div class="tuvi-treatise-head">
                    <span class="tuvi-treatise-name">
                      🏰 CUNG ${String(cungName).toUpperCase()} ${canChi ? `(${canChi})` : ''}
                      ${isMenh ? '<span style="color: var(--gold-glow); font-size: 0.72rem; margin-left: 6px;">[MỆNH CHỦ]</span>' : ''}
                    </span>
                    <span class="tuvi-grade-badge ${getGradeClass(level)}">
                      Phẩm cách: ${level}
                    </span>
                  </div>

                  <div class="tuvi-treatise-body" style="font-size: 0.8rem; line-height: 1.65;">
                    ${deepTreatiseHTML}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 9. Card 7: CHIẾN LƯỢC QUẢN TRỊ VẬN MỆNH & ĐẠO HÓA GIẢI -->
        <div class="tuvi-analysis-card">
          <div class="tuvi-card-header">
            <div class="tuvi-card-title">
              <span>🛡️</span> CHIẾN LƯỢC QUẢN TRỊ VẬN MỆNH & ĐẠO HÓA GIẢI
            </div>
            <span style="font-size: 0.72rem; color: var(--gold-glow);">Tâm niệm cổ thư</span>
          </div>

          <div style="font-size: 0.8rem; line-height: 1.65; color: var(--text-color);">
            <p style="margin: 0 0 10px 0;">
              Tử Vi Đẩu Số không phải là công cụ định kiến số phận bất biến mà là <strong>tấm bản đồ dự báo khí số thời gian</strong> giúp đương số hiểu rõ điểm mạnh tiên thiên để phát huy, nhận diện điểm khuyết hãm để hóa giải và nắm bắt đúng nhịp điệu của vận thế.
            </p>
            <ul style="margin: 0; padding-left: 18px; color: var(--text-color);">
              <li style="margin-bottom: 6px;"><strong style="color: var(--gold-primary);">Đắc Thời Tận Lực:</strong> Khi vào đại hạn hoặc lưu niên cát lợi (Cát tinh, Hóa Lộc, Hóa Quyền hội tụ), cần chủ động dấn thân, mở rộng quy mô và quyết đoán nắm bắt cơ hội.</li>
              <li style="margin-bottom: 6px;"><strong style="color: var(--gold-primary);">Thất Thời Tu Thân:</strong> Khi gặp đại hạn nghịch cảnh hoặc năm có sát tinh, Hóa Kỵ xung phá, cần thu hẹp biên độ rủi ro, quản trị tiền mặt, đầu tư vào tri thức, giữ gìn sức khỏe và hòa khí gia đình.</li>
              <li style="margin-bottom: 6px;"><strong style="color: var(--gold-primary);">Đức Năng Thắng Số:</strong> Lấy đức hạnh, sự chân thành và tu dưỡng nội tâm làm gốc rễ cứu giải mọi hung tinh, biến hiểm nguy thành cơ hội rèn luyện bản lĩnh.</li>
            </ul>
          </div>
        </div>
      `}
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
    const btnAnalysis = document.getElementById('btn-tuvi-mode-analysis');
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
    if (btnAnalysis) {
      btnAnalysis.onclick = () => {
        currentViewMode = 'analysis';
        renderTuVi();
      };
    }

    // Analysis mode actions
    const btnCopyReport = document.getElementById('btn-tuvi-copy-report');
    if (btnCopyReport) {
      btnCopyReport.onclick = () => {
        const analysis = getOrRunAnalysis(chart);
        if (analysis && analysis.reportMarkdown) {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(analysis.reportMarkdown).then(() => {
              showTuViToast('Đã sao chép toàn bộ bài luận giải vào bộ nhớ tạm!');
            }).catch(() => {
              showTuViToast('Không thể sao chép tự động.');
            });
          } else {
            showTuViToast('Trình duyệt không hỗ trợ tự động chép.');
          }
        }
      };
    }

    const btnDownloadReport = document.getElementById('btn-tuvi-download-report');
    if (btnDownloadReport) {
      btnDownloadReport.onclick = () => {
        const analysis = getOrRunAnalysis(chart);
        if (analysis && analysis.reportMarkdown) {
          const fn = `Bao_Cao_Tu_Vi_${chart.meta.solarDay}_${chart.meta.solarMonth}_${chart.meta.solarYear}_Nam_${chart.meta.viewYear}.md`;
          downloadReportFile(analysis.reportMarkdown, fn);
        }
      };
    }

    const btnPolishAi = document.getElementById('btn-tuvi-polish-ai');
    if (btnPolishAi) {
      btnPolishAi.onclick = () => {
        currentAnalysisSubTab = 'full-report';
        currentReportMode = 'ai';
        const analysis = getOrRunAnalysis(chart);
        if (analysis && !aiPolishedText && !isAiPolishing) {
          triggerAiPolish(analysis);
        } else {
          renderTuVi();
        }
      };
    }

    // Toggle chế độ Báo cáo Tiêu Chuẩn vs Trau Chuốt AI (Nhúng mượt mà trong báo cáo)
    const btnModeStandard = document.getElementById('btn-tuvi-mode-standard');
    const btnBackStandard = document.getElementById('btn-tuvi-back-standard');
    const btnModeAi = document.getElementById('btn-tuvi-mode-ai');
    const btnInlineTriggerAi = document.getElementById('btn-tuvi-inline-trigger-ai');

    if (btnModeStandard) {
      btnModeStandard.onclick = () => {
        currentReportMode = 'standard';
        renderTuVi();
      };
    }
    if (btnBackStandard) {
      btnBackStandard.onclick = () => {
        currentReportMode = 'standard';
        renderTuVi();
      };
    }
    if (btnModeAi) {
      btnModeAi.onclick = () => {
        currentReportMode = 'ai';
        const analysis = getOrRunAnalysis(chart);
        if (analysis && !aiPolishedText && !isAiPolishing) {
          triggerAiPolish(analysis);
        } else {
          renderTuVi();
        }
      };
    }
    if (btnInlineTriggerAi) {
      btnInlineTriggerAi.onclick = () => {
        const analysis = getOrRunAnalysis(chart);
        if (analysis) triggerAiPolish(analysis);
      };
    }

    const btnTuViOpenKey = document.getElementById('btn-tuvi-open-key-modal');
    if (btnTuViOpenKey) {
      btnTuViOpenKey.onclick = () => {
        if (global.NetaGeminiService && typeof global.NetaGeminiService.openConfigModal === 'function') {
          global.NetaGeminiService.openConfigModal();
        } else if (global.NetaTarotView && typeof global.NetaTarotView.openKeyConfigModal === 'function') {
          global.NetaTarotView.openKeyConfigModal();
        }
      };
    }

    // Analysis Sub-Tab Navigation
    const btnTabDash = document.getElementById('btn-tuvi-tab-dashboard');
    if (btnTabDash) {
      btnTabDash.onclick = () => {
        currentAnalysisSubTab = 'dashboard';
        renderTuVi();
      };
    }
    const btnTabFull = document.getElementById('btn-tuvi-tab-full-report');
    if (btnTabFull) {
      btnTabFull.onclick = () => {
        currentAnalysisSubTab = 'full-report';
        renderTuVi();
      };
    }

    // Palace Filter Pills
    document.querySelectorAll('.tuvi-palace-pill').forEach(pill => {
      pill.onclick = () => {
        const val = pill.getAttribute('data-palace-filter');
        currentPalaceFilter = val || 'ALL';
        renderTuVi();
      };
    });

    // Bottom Action Buttons
    const btnCopyBottom = document.getElementById('btn-tuvi-copy-report-bottom');
    if (btnCopyBottom) {
      btnCopyBottom.onclick = () => {
        const analysis = getOrRunAnalysis(chart);
        if (analysis && analysis.reportMarkdown) {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(analysis.reportMarkdown).then(() => {
              showTuViToast('Đã sao chép toàn bộ bài luận giải vào bộ nhớ tạm!');
            });
          }
        }
      };
    }

    const btnDownloadBottom = document.getElementById('btn-tuvi-download-report-bottom');
    if (btnDownloadBottom) {
      btnDownloadBottom.onclick = () => {
        const analysis = getOrRunAnalysis(chart);
        if (analysis && analysis.reportMarkdown) {
          const fn = `Bao_Cao_Tu_Vi_${chart.meta.solarDay}_${chart.meta.solarMonth}_${chart.meta.solarYear}_Nam_${chart.meta.viewYear}.md`;
          downloadReportFile(analysis.reportMarkdown, fn);
        }
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
          resetTuViAiState();
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
        resetTuViAiState();
        renderTuVi();
      };
    }
    if (btnYearNext) {
      btnYearNext.onclick = () => {
        currentViewYear++;
        resetTuViAiState();
        renderTuVi();
      };
    }
    if (btnYearNow) {
      btnYearNow.onclick = () => {
        currentViewYear = new Date().getFullYear();
        resetTuViAiState();
        renderTuVi();
      };
    }
    if (inputViewYear) {
      inputViewYear.onchange = () => {
        const vy = parseInt(inputViewYear.value, 10);
        if (!isNaN(vy) && vy >= 1900 && vy <= 2100) {
          currentViewYear = vy;
          resetTuViAiState();
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
          resetTuViAiState();
          renderTuVi();
        }
      };
    }
    if (btnFemale) {
      btnFemale.onclick = () => {
        if (currentIsMale) {
          currentIsMale = false;
          resetTuViAiState();
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
        resetTuViAiState();
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
              <span class="tm-chip lucky ${getColorClass(s.hanh)}">${s.fullName || s.name}</span>
            `).join('')}
          </div>
        </div>

        <div class="tm-section">
          <h4>⚡ HUNG TINH / SÁT TINH (${p.badStars.length})</h4>
          <div class="tm-chips-wrap">
            ${p.badStars.map(s => `
              <span class="tm-chip bad ${getColorClass(s.hanh)}">${s.fullName || s.name}</span>
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
