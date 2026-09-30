/**
 * NETA LIGHT - THÁI ẤT THẦN KINH VIEW MODULE (thai_at_view.js)
 * Giao diện trực quan hoá Trận Đồ 16 Thần Vị & Thái Ất Mệnh Pháp 12 Cung.
 * Đồng nhất 100% với phong cách Tử Vi & Bát Tự (Unified Control Card, Light/Dark theme, Không tràn nút, Vuốt dọc mượt mà).
 */

(function (global) {
  'use strict';

  let currentKeType = 'gio';   // 'gio' | 'ngay' | 'thang' | 'nam' | 'menh'
  let currentLayer = 'all';    // 'all' | 'combat' | 'cat' | 'weather' | 'stars9'
  let currentDate = new Date();
  let currentChart = null;
  let selectedPalace = 'Tý';
  let isLunarMode = false;
  let currentIsMale = true;

  // 16 Cung theo chu vi Grid 5x5 (Thuận chiều kim đồng hồ từ Tốn)
  const GRID_CELLS_16 = [
    { pos: "Tốn", row: 1, col: 1, weight: 9 },
    { pos: "Tỵ",  row: 1, col: 2, weight: 0 },
    { pos: "Ngọ", row: 1, col: 3, weight: 2 },
    { pos: "Mùi", row: 1, col: 4, weight: 0 },
    { pos: "Khôn", row: 1, col: 5, weight: 7 },
    { pos: "Thân", row: 2, col: 5, weight: 0 },
    { pos: "Dậu",  row: 3, col: 5, weight: 6 },
    { pos: "Tuất", row: 4, col: 5, weight: 0 },
    { pos: "Kiền", row: 5, col: 5, weight: 1 },
    { pos: "Hợi",  row: 5, col: 4, weight: 0 },
    { pos: "Tý",   row: 5, col: 3, weight: 8 },
    { pos: "Sửu",  row: 5, col: 2, weight: 0 },
    { pos: "Cấn",  row: 5, col: 1, weight: 3 },
    { pos: "Dần",  row: 4, col: 1, weight: 0 },
    { pos: "Mão",  row: 3, col: 1, weight: 4 },
    { pos: "Thìn", row: 2, col: 1, weight: 0 }
  ];

  const PALACE_DESCRIPTIONS = {
    "Tý": "Cung Khảm (Số 8) - Phương Bắc. Chủ về trí tuệ, dòng chảy, đêm tối, nơi phát tích nguyên khí.",
    "Sửu": "Phương Đông Bắc phụ. Điểm chuyển giao âm cực sinh dương, tích lũy nền tảng.",
    "Cấn": "Cung Cấn (Số 3) - Phương Đông Bắc. Cửa Quỷ môn / Núi non, biểu trưng sự tĩnh lặng, chặn đứng nguy nan.",
    "Dần": "Phương Đông Bắc phụ. Cửa mở mùa xuân, sinh khí bừng nở, thời điểm xuất quân thuận lợi.",
    "Mão": "Cung Chấn (Số 4) - Phương Đông. Sấm sét, chấn động, sự trỗi dậy và bộc lộ mâu thuẫn.",
    "Thìn": "Phương Đông Nam phụ. Nơi tích tụ năng lượng, biến hóa khôn lường.",
    "Tốn": "Cung Tốn (Số 9) - Phương Đông Nam. Cơn gió lớn, sự linh hoạt, truyền bá thông điệp.",
    "Tỵ": "Phương Đông Nam phụ. Giai đoạn tăng tốc, dương khí thịnh vượng.",
    "Ngọ": "Cung Ly (Số 2) - Phương Nam. Ánh sáng rực rỡ, hiển lộ rõ ràng, minh bạch thị phi.",
    "Mùi": "Phương Tây Nam phụ. Đất phì nhiêu, thời điểm gặt hái thành quả.",
    "Khôn": "Cung Khôn (Số 7) - Phương Tây Nam. Cửa Nhân môn, đất mẹ nhu thuận, bao dung và dưỡng dục.",
    "Thân": "Phương Tây Nam phụ. Khởi sinh kim khí, bước chuyển giao sang thu hoạch.",
    "Dậu": "Cung Đoài (Số 6) - Phương Tây. Đầm nước, vui vẻ, vũ khí sắc bén, đàm phán thương lượng.",
    "Tuất": "Phương Tây Bắc phụ. Khí hậu bắt đầu khô lạnh, sự kiên định phòng thủ.",
    "Kiền": "Cung Kiền (Số 1) - Phương Tây Bắc. Cửa Thiên môn / Vua chúa, quyền uy cao nhất, cương trực sáng suốt.",
    "Hợi": "Phương Tây Bắc phụ. Nước thâm sâu, giai đoạn ẩn giấu tiềm lực chuẩn bị cho chu kỳ mới."
  };

  // Inject Scoped CSS đồng bộ với Neta Light
  function ensureStyles() {
    if (document.getElementById('thaiat-scoped-styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'thaiat-scoped-styles';
    styleEl.textContent = `
      .thaiat-view-wrap {
        width: 100%;
        max-width: 480px;
        margin: 0 auto;
        padding: 4px 6px calc(var(--safe-bottom, 20px) + 90px);
        box-sizing: border-box;
        color: var(--text-primary, #f8fafc);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      
      /* Grid 5x5 Matrix Trận Đồ */
      .thaiat-grid-5x5 {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        grid-template-rows: repeat(5, minmax(68px, 1fr));
        gap: 3px;
        background: rgba(20, 2, 5, 0.95);
        border: 1px solid rgba(245, 176, 65, 0.35);
        border-radius: 8px;
        padding: 3px;
        margin-bottom: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      }
      body.theme-light .thaiat-grid-5x5 {
        background: #fdfaf3 !important;
        border-color: #e0d5c1 !important;
        box-shadow: 0 2px 8px rgba(160, 120, 60, 0.1) !important;
      }

      .thaiat-cell {
        background: rgba(30, 6, 12, 0.9);
        border: 1px solid rgba(245, 176, 65, 0.2);
        border-radius: 4px;
        padding: 3px 4px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: all 0.15s ease;
      }
      body.theme-light .thaiat-cell {
        background: #ffffff !important;
        border-color: #e5e7eb !important;
      }

      .thaiat-cell:hover, .thaiat-cell.active-cell {
        background: rgba(245, 176, 65, 0.22) !important;
        outline: 1.5px solid #f5b041;
      }
      body.theme-light .thaiat-cell:hover, body.theme-light .thaiat-cell.active-cell {
        background: rgba(217, 119, 6, 0.15) !important;
        outline: 1.5px solid #d97706;
      }

      .thaiat-cell-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2px;
      }
      .thaiat-cell-name {
        font-weight: 800;
        font-size: 11px;
        color: var(--gold-primary, #f5b041);
      }
      body.theme-light .thaiat-cell-name {
        color: #8b6508;
      }
      .thaiat-cell-weight {
        font-size: 9px;
        color: #94a3b8;
        background: rgba(0, 0, 0, 0.4);
        padding: 1px 3px;
        border-radius: 3px;
      }
      body.theme-light .thaiat-cell-weight {
        background: #f3f4f6;
        color: #6b7280;
      }

      .thaiat-star-list {
        display: flex;
        flex-direction: column;
        gap: 2px;
        font-size: 9px;
        overflow-y: auto;
        max-height: 48px;
        scrollbar-width: none;
      }
      .thaiat-star-tag {
        padding: 1px 3px;
        border-radius: 3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-weight: 700;
        line-height: 1.2;
        color: #f8fafc;
        background: rgba(245, 176, 65, 0.15);
      }
      body.theme-light .thaiat-star-tag {
        color: #1e293b !important;
        background: #f1f5f9 !important;
      }
      .star-thaiat { background: rgba(234, 179, 8, 0.3); color: #fde047; }
      body.theme-light .star-thaiat { background: #fef08a; color: #854d0e; }
      .star-chu { background: rgba(56, 189, 248, 0.3); color: #7dd3fc; }
      body.theme-light .star-chu { background: #bae6fd; color: #0369a1; }
      .star-khach { background: rgba(244, 63, 94, 0.3); color: #fb7185; }
      body.theme-light .star-khach { background: #fecdd3; color: #be123c; }
      .star-dinh { background: rgba(192, 132, 252, 0.3); color: #d8b4fe; }
      body.theme-light .star-dinh { background: #e9d5ff; color: #6b21a8; }
      .star-cat { background: rgba(52, 211, 153, 0.3); color: #6ee7b7; }
      body.theme-light .star-cat { background: #a7f3d0; color: #047857; }
      .star-hung { background: rgba(251, 146, 60, 0.3); color: #fdba74; }
      body.theme-light .star-hung { background: #fed7aa; color: #c2410c; }

      /* Trung Cung HUD 3x3 */
      .thaiat-hud-center {
        grid-column: 2 / span 3;
        grid-row: 2 / span 3;
        background: rgba(14, 1, 4, 0.98);
        border: 1px solid rgba(245, 176, 65, 0.4);
        border-radius: 6px;
        padding: 5px 6px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      body.theme-light .thaiat-hud-center {
        background: #ffffff !important;
        border-color: #d1d5db !important;
      }
      .thaiat-hud-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(245, 176, 65, 0.2);
        padding-bottom: 3px;
      }
      body.theme-light .thaiat-hud-header {
        border-color: #e5e7eb;
      }
      .thaiat-badge-don {
        background: rgba(245, 176, 65, 0.15);
        color: #f5b041;
        font-weight: 800;
        font-size: 10px;
        padding: 2px 5px;
        border-radius: 4px;
      }
      body.theme-light .thaiat-badge-don {
        background: #fef3c7;
        color: #92400e;
      }
      .thaiat-toan-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 3px;
        margin: 3px 0;
        text-align: center;
      }
      .thaiat-toan-box {
        background: rgba(26, 3, 7, 0.9);
        padding: 3px 2px;
        border-radius: 4px;
        border: 1px solid rgba(245, 176, 65, 0.2);
      }
      body.theme-light .thaiat-toan-box {
        background: #f9fafb;
        border-color: #e5e7eb;
      }
      .thaiat-toan-title { font-size: 9px; color: #94a3b8; margin-bottom: 1px; }
      body.theme-light .thaiat-toan-title { color: #6b7280; }
      .thaiat-toan-num { font-size: 14px; font-weight: 800; line-height: 1; }
      .toan-c-chu { color: #38bdf8; }
      .toan-c-khach { color: #f43f5e; }
      .toan-c-dinh { color: #c084fc; }

      .thaiat-generals-box {
        font-size: 10px;
        line-height: 1.3;
        background: rgba(26, 3, 7, 0.7);
        padding: 3px 5px;
        border-radius: 4px;
        margin: 2px 0;
      }
      body.theme-light .thaiat-generals-box {
        background: #f3f4f6;
        color: #374151;
      }
      .thaiat-the-tran {
        font-size: 10px;
        font-weight: 800;
        color: #38bdf8;
        text-align: center;
        background: rgba(56, 189, 248, 0.15);
        padding: 3px 4px;
        border-radius: 4px;
      }
      body.theme-light .thaiat-the-tran {
        background: #e0f2fe;
        color: #0369a1;
      }
      .thaiat-badges-anomalies {
        display: flex;
        gap: 3px;
        justify-content: center;
        margin-top: 2px;
      }
      .badge-anomaly {
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
        border: 1px solid #ef4444;
        font-size: 8.5px;
        padding: 1px 4px;
        border-radius: 3px;
        font-weight: 700;
      }

      /* Lá số Nhân Mệnh 12 Cung */
      .thaiat-menh-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 5px;
        margin-bottom: 8px;
      }
      .thaiat-menh-cell {
        background: rgba(20, 2, 5, 0.95);
        border: 1px solid rgba(245, 176, 65, 0.3);
        border-radius: 6px;
        padding: 5px;
        font-size: 11px;
        cursor: pointer;
      }
      body.theme-light .thaiat-menh-cell {
        background: #ffffff;
        border-color: #e5e7eb;
      }
      .thaiat-menh-name {
        font-weight: 800;
        color: #f5b041;
        display: flex;
        justify-content: space-between;
        margin-bottom: 2px;
      }
      body.theme-light .thaiat-menh-name {
        color: #b45309;
      }
      .thaiat-menh-locma {
        font-size: 9px;
        color: #94a3b8;
      }
      body.theme-light .thaiat-menh-locma {
        color: #6b7280;
      }

      /* Drawer Tra Cứu Chi Tiết */
      .thaiat-drawer {
        background: rgba(20, 2, 5, 0.95);
        border: 1px solid rgba(245, 176, 65, 0.35);
        border-radius: 8px;
        padding: 8px 10px;
        margin-bottom: 8px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
      }
      body.theme-light .thaiat-drawer {
        background: #ffffff;
        border-color: #e0d5c1;
        box-shadow: 0 1px 4px rgba(160, 120, 60, 0.1);
      }
      .thaiat-drawer-title {
        font-weight: 800;
        color: #f5b041;
        font-size: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(245, 176, 65, 0.2);
        padding-bottom: 4px;
        margin-bottom: 4px;
      }
      body.theme-light .thaiat-drawer-title {
        color: #b45309;
        border-color: #f3f4f6;
      }
      .thaiat-drawer-desc {
        font-size: 11px;
        line-height: 1.4;
        color: var(--text-secondary, #cbd5e1);
        margin-bottom: 4px;
      }
      body.theme-light .thaiat-drawer-desc {
        color: #374151;
      }
      .thaiat-drawer-advice {
        font-size: 11px;
        line-height: 1.4;
        background: rgba(245, 176, 65, 0.1);
        border-left: 3px solid #f5b041;
        padding: 4px 6px;
        border-radius: 0 4px 4px 0;
        color: var(--text-primary, #f8fafc);
      }
      body.theme-light .thaiat-drawer-advice {
        background: #fef3c7;
        border-left-color: #d97706;
        color: #78350f;
      }
    `;
    document.head.appendChild(styleEl);
  }

  function initThaiAtView() {
    const container = document.getElementById('view-thaiat');
    if (!container) return;
    ensureStyles();
    renderThaiAt();
  }

  function setDateAndRender(dateObj, isMale = currentIsMale) {
    currentDate = new Date(dateObj);
    currentIsMale = isMale;
    renderThaiAt();
  }

  function renderThaiAt() {
    const container = document.getElementById('view-thaiat');
    if (!container) return;
    ensureStyles();

    if (global.NetaThaiAtEngine) {
      currentChart = global.NetaThaiAtEngine.buildThaiAtChart(currentDate);
    }

    if (!currentChart) {
      container.innerHTML = `
        <div class="module-placeholder">
          <div class="placeholder-icon">☀️</div>
          <h2 class="placeholder-title">LỖI KHỞI TẠO THÁI ẤT</h2>
          <p class="placeholder-desc">Không thể tính toán trận đồ cho thời điểm này. Vui lòng thử lại.</p>
        </div>
      `;
      return;
    }

    const pad = n => String(n).padStart(2, '0');
    const sYear = currentDate.getFullYear();
    const sMonth = currentDate.getMonth() + 1;
    const sDay = currentDate.getDate();
    const sHour = currentDate.getHours();
    const sMin = currentDate.getMinutes();
    const dStr = `${sYear}-${pad(sMonth)}-${pad(sDay)}`;

    let lunarObj = null;
    if (global.NetaCalendarEngine && typeof global.NetaCalendarEngine.solar2Lunar === 'function') {
      lunarObj = global.NetaCalendarEngine.solar2Lunar(sDay, sMonth, sYear);
    }
    const displayDay = (isLunarMode && lunarObj) ? lunarObj.day : sDay;
    const displayMonth = (isLunarMode && lunarObj) ? lunarObj.month : sMonth;
    const displayYear = (isLunarMode && lunarObj) ? lunarObj.year : sYear;

    let keData;
    if (currentKeType === 'gio') keData = currentChart.keGio;
    else if (currentKeType === 'ngay') keData = currentChart.keNgay;
    else if (currentKeType === 'thang') keData = currentChart.keThang;
    else keData = currentChart.keNam;

    container.innerHTML = `
      <div class="thaiat-view-wrap">
        <!-- 1. Unified Control Card (Chuẩn Tử Vi / Bát Tự) -->
        <div class="unified-ctrl-card">
          <!-- Row 1: Calendar switch & Date Box -->
          <div class="ucc-row ucc-row-date">
            <div class="ucc-pill-cal">
              <button type="button" class="ucc-pill-btn ${!isLunarMode ? 'active' : ''}" id="thaiat-btn-solar">☀️ Dương</button>
              <button type="button" class="ucc-pill-btn ${isLunarMode ? 'active' : ''}" id="thaiat-btn-lunar">🌙 Âm</button>
            </div>
            <div class="ucc-date-box" id="thaiat-ucc-date-box" title="Nhập ngày tháng hoặc chạm vào nút lịch để chọn">
              <input type="number" id="thaiat-input-day" class="num-box num-day" min="1" max="31" value="${displayDay}" placeholder="Ngày">
              <span class="num-slash">/</span>
              <input type="number" id="thaiat-input-month" class="num-box num-month" min="1" max="12" value="${displayMonth}" placeholder="Tháng">
              <span class="num-slash">/</span>
              <input type="number" id="thaiat-input-year" class="num-box num-year" min="1900" max="2100" value="${displayYear}" placeholder="Năm">
              <button type="button" class="ucc-btn-year" id="thaiat-btn-quick-year" title="Chọn Thập niên & Năm siêu tốc">⚡Năm</button>
              <label class="btn-picker-cal" id="thaiat-btn-native-cal" title="Mở bảng chọn Ngày & Giờ">
                📅
                <input type="datetime-local" id="thaiat-date-picker" value="${dStr}T${pad(sHour)}:${pad(sMin)}" class="native-hidden-date">
              </label>
            </div>
          </div>

          <!-- Row 2: Can Chi + Numeric Time & Gender -->
          <div class="ucc-row ucc-row-time">
            <div class="ucc-time-box">
              <select id="thaiat-select-canchi" class="select-canchi">
                <option value="0" ${[23, 0].includes(sHour) ? 'selected' : ''}>Tý (23-01h)</option>
                <option value="2" ${[1, 2].includes(sHour) ? 'selected' : ''}>Sửu (01-03h)</option>
                <option value="4" ${[3, 4].includes(sHour) ? 'selected' : ''}>Dần (03-05h)</option>
                <option value="6" ${[5, 6].includes(sHour) ? 'selected' : ''}>Mão (05-07h)</option>
                <option value="8" ${[7, 8].includes(sHour) ? 'selected' : ''}>Thìn (07-09h)</option>
                <option value="10" ${[9, 10].includes(sHour) ? 'selected' : ''}>Tỵ (09-11h)</option>
                <option value="12" ${[11, 12].includes(sHour) ? 'selected' : ''}>Ngọ (11-13h)</option>
                <option value="14" ${[13, 14].includes(sHour) ? 'selected' : ''}>Mùi (13-15h)</option>
                <option value="16" ${[15, 16].includes(sHour) ? 'selected' : ''}>Thân (15-17h)</option>
                <option value="18" ${[17, 18].includes(sHour) ? 'selected' : ''}>Dậu (17-19h)</option>
                <option value="20" ${[19, 20].includes(sHour) ? 'selected' : ''}>Tuất (19-21h)</option>
                <option value="22" ${[21, 22].includes(sHour) ? 'selected' : ''}>Hợi (21-23h)</option>
              </select>
              <input type="number" id="thaiat-input-hour" class="num-box num-hour" min="0" max="23" value="${pad(sHour)}" placeholder="Giờ">
              <span class="num-colon">:</span>
              <input type="number" id="thaiat-input-minute" class="num-box num-min" min="0" max="59" value="${pad(sMin)}" placeholder="Phút">
            </div>
            <div class="ucc-pill-gender">
              <button type="button" class="ucc-gender-btn ${currentIsMale ? 'active male' : ''}" id="thaiat-btn-male">♂ Nam</button>
              <button type="button" class="ucc-gender-btn ${!currentIsMale ? 'active female' : ''}" id="thaiat-btn-female">♀ Nữ</button>
            </div>
          </div>

          <!-- Row 3: Actions + Tứ Kể Mode Switch -->
          <div class="ucc-row ucc-row-actions">
            <button class="ucc-btn-now" id="thaiat-btn-now" title="Về thời điểm hiện tại">
              ⚡ Giờ thực
            </button>
            <div class="ucc-pill-view">
              <button class="ucc-view-btn ${currentKeType === 'gio' ? 'active' : ''}" data-ke="gio">Giờ</button>
              <button class="ucc-view-btn ${currentKeType === 'ngay' ? 'active' : ''}" data-ke="ngay">Ngày</button>
              <button class="ucc-view-btn ${currentKeType === 'thang' ? 'active' : ''}" data-ke="thang">Tháng</button>
              <button class="ucc-view-btn ${currentKeType === 'nam' ? 'active' : ''}" data-ke="nam">Năm</button>
              <button class="ucc-view-btn ${currentKeType === 'menh' ? 'active' : ''}" data-ke="menh">Mệnh</button>
            </div>
            <button class="ucc-btn-submit" id="thaiat-btn-submit" title="Lập quẻ Thái Ất">
              🔮 Lập Quẻ
            </button>
          </div>
        </div>

        <!-- 2. Master Overview Ribbon (Thái Ất Master Strip) -->
        <div class="thaiat-master-strip">
          <div><span>Độn:</span> <strong class="tms-val-gold">${keData.donType}</strong></div>
          <span>•</span>
          <div><span>Cục:</span> <strong>Cục ${keData.cuc}</strong></div>
          <span>•</span>
          <div><span>Nguyên:</span> <strong>Nguyên ${keData.nguyen}</strong></div>
          <span>•</span>
          <div><span>Kỷ Dư:</span> <strong>${keData.kyDu}</strong></div>
          <span>•</span>
          <div><span>Tiết khí:</span> <strong>${currentChart.tietKhi}</strong></div>
        </div>

        <!-- 3. Bộ lọc 5 tầng thông tin (Grid 5 cột cân đối, không cuộn ngang) -->
        ${currentKeType !== 'menh' ? `
          <div class="thaiat-filters-bar">
            <button class="thaiat-filter-btn ${currentLayer === 'all' ? 'active' : ''}" data-layer="all">Tất cả</button>
            <button class="thaiat-filter-btn ${currentLayer === 'combat' ? 'active' : ''}" data-layer="combat">⚔️ Tướng</button>
            <button class="thaiat-filter-btn ${currentLayer === 'cat' ? 'active' : ''}" data-layer="cat">✨ Cát</button>
            <button class="thaiat-filter-btn ${currentLayer === 'weather' ? 'active' : ''}" data-layer="weather">🌪️ Khí</button>
            <button class="thaiat-filter-btn ${currentLayer === 'stars9' ? 'active' : ''}" data-layer="stars9">🌌 Cửu Tinh</button>
          </div>
        ` : ''}

        <!-- 4. Vùng Trận Đồ Bát Quái 5x5 hoặc Lá Số Nhân Mệnh -->
        ${currentKeType === 'menh' ? renderMenhViewHTML() : renderMatrix16ViewHTML(keData)}

        <!-- 5. Drawer Tra Cứu Tương Tác 16 Cung -->
        <div class="thaiat-drawer" id="thaiat-drawer">
          <div class="thaiat-drawer-title">
            <span id="thaiat-drawer-name">CHI TIẾT CUNG [${selectedPalace.toUpperCase()}]</span>
            <span id="thaiat-drawer-weight" style="font-size: 10px; opacity: 0.85;">Trọng số: ${(global.NetaThaiAtEngine && global.NetaThaiAtEngine.QUAI_WEIGHTS[selectedPalace]) || 0}</span>
          </div>
          <div class="thaiat-drawer-desc" id="thaiat-drawer-desc">
            ${PALACE_DESCRIPTIONS[selectedPalace] || "Phương vị địa bàn Thái Ất."}
          </div>
          <div class="thaiat-drawer-advice" id="thaiat-drawer-advice">
            ${getPalaceAdviceHTML(selectedPalace, keData)}
          </div>
        </div>
      </div>
    `;

    bindThaiAtEvents();
  }

  function shouldDisplayStar(starName, layer) {
    if (layer === 'all') return true;
    if (layer === 'combat') {
      return ['Thái Ất', 'Văn Xương', 'Thủy Kích', 'Kế Thần', 'Chủ Đại Tướng', 'Khách Đại Tướng', 'Chủ Tham Tướng', 'Khách Tham Tướng'].includes(starName);
    }
    if (layer === 'cat') {
      return ['Ngũ Phúc', 'Thiên Ất', 'Tứ Thần', 'Thanh Long', 'Rồng Xanh', 'Thần Quý'].includes(starName);
    }
    if (layer === 'weather') {
      return ['Xích Kỳ', 'Cờ Đỏ', 'Hắc Kỳ', 'Cờ Đen', '3 Gió', '5 Gió', '8 Gió', 'Âm Cả'].includes(starName);
    }
    if (layer === 'stars9') {
      return starName.startsWith('9 Sao') || starName.startsWith('[Sao]') || ['Thần Quý', 'Trực Phù'].includes(starName);
    }
    return true;
  }

  function getStarCssClass(starName) {
    if (starName === 'Thái Ất') return 'star-thaiat';
    if (['Văn Xương', 'Chủ Đại Tướng', 'Chủ Tham Tướng'].includes(starName)) return 'star-chu';
    if (['Thủy Kích', 'Khách Đại Tướng', 'Khách Tham Tướng'].includes(starName)) return 'star-khach';
    if (['Kế Thần', 'Kể Định'].includes(starName)) return 'star-dinh';
    if (['Ngũ Phúc', 'Thiên Ất', 'Tứ Thần', 'Rồng Xanh', 'Thanh Long'].includes(starName)) return 'star-cat';
    if (['Xích Kỳ', 'Cờ Đỏ', 'Hắc Kỳ', 'Cờ Đen', 'Âm Cả'].includes(starName)) return 'star-hung';
    return '';
  }

  function getPalaceAdviceHTML(pos, keData) {
    const starsHere = [];
    if (keData && keData.stars) {
      for (let s in keData.stars) {
        if (keData.stars[s] === pos) starsHere.push(s);
      }
    }
    let advice = '💡 <strong>Chiến lược hành sự:</strong> Cung bình hòa, tiến thoái thuận theo thời cơ.';
    if (starsHere.includes('Thái Ất')) {
      advice = '👑 <strong>Chiến lược Thái Ất:</strong> Chúa tể ngự cung! Đại cát lợi, là trung tâm sinh khí và quyền lực tối cao.';
    } else if (starsHere.includes('Ngũ Phúc')) {
      advice = '✨ <strong>Chiến lược Ngũ Phúc:</strong> Đệ nhất cát thần chiếu rọi, giải trừ mọi hung hiểm, thích hợp mở đầu đại sự.';
    } else if (starsHere.includes('Chủ Đại Tướng')) {
      advice = '🛡️ <strong>Chiến lược Chủ Tướng:</strong> Lực lượng phòng thủ nội bộ vững chắc, thuận cho củng cố tổ chức và căn cơ.';
    } else if (starsHere.includes('Khách Đại Tướng')) {
      advice = '⚔️ <strong>Chiến lược Khách Tướng:</strong> Lực lượng tiến công sắc bén, thuận xuất chinh, mở rộng thị trường và đàm phán.';
    } else if (starsHere.includes('Cờ Đỏ') || starsHere.includes('Cờ Đen')) {
      advice = '⚠️ <strong>Cảnh báo Kỳ Thần:</strong> Khí tượng biến động, dễ phát sinh tranh chấp hoặc trắc trở, cần đề phòng bất trắc.';
    }
    return advice;
  }

  function renderMatrix16ViewHTML(keData) {
    let cellsHtml = '';
    GRID_CELLS_16.forEach(c => {
      const stars = [];
      for (let sName in keData.stars) {
        if (keData.stars[sName] === c.pos && shouldDisplayStar(sName, currentLayer)) {
          stars.push(sName);
        }
      }

      const starTags = stars.map(s => {
        const cls = getStarCssClass(s);
        return `<span class="thaiat-star-tag ${cls}" title="${s}">${s}</span>`;
      }).join('');

      const isActive = (c.pos === selectedPalace) ? 'active-cell' : '';
      const style = `grid-row: ${c.row}; grid-column: ${c.col};`;

      cellsHtml += `
        <div class="thaiat-cell ${isActive}" style="${style}" onclick="window.NetaThaiAtView.inspectPalace('${c.pos}')">
          <div class="thaiat-cell-top">
            <span class="thaiat-cell-name">${c.pos}</span>
            <span class="thaiat-cell-weight">${c.weight}</span>
          </div>
          <div class="thaiat-star-list">${starTags}</div>
        </div>
      `;
    });

    let anomaliesHtml = '';
    if (keData.isVoThien) anomaliesHtml += `<span class="badge-anomaly">⚠️ Vô Thiên</span>`;
    if (keData.isVoDia) anomaliesHtml += `<span class="badge-anomaly">⚠️ Vô Địa</span>`;
    if (keData.isVoNhan) anomaliesHtml += `<span class="badge-anomaly">⚠️ Vô Nhân</span>`;

    const hudHtml = `
      <div class="thaiat-hud-center">
        <div class="thaiat-hud-header">
          <span style="font-size: 10px; opacity: 0.85;">${keData.keName}</span>
          <span class="thaiat-badge-don">Kỷ dư: ${keData.kyDu}</span>
        </div>

        <div class="thaiat-toan-grid">
          <div class="thaiat-toan-box">
            <div class="thaiat-toan-title">Toán Chủ</div>
            <div class="thaiat-toan-num toan-c-chu">${keData.toanChu}</div>
          </div>
          <div class="thaiat-toan-box">
            <div class="thaiat-toan-title">Toán Khách</div>
            <div class="thaiat-toan-num toan-c-khach">${keData.toanKhach}</div>
          </div>
          <div class="thaiat-toan-box">
            <div class="thaiat-toan-title">Toán Định</div>
            <div class="thaiat-toan-num toan-c-dinh">${keData.toanDinh}</div>
          </div>
        </div>

        <div class="thaiat-generals-box">
          <div><strong style="color: #38bdf8;">Chủ Tướng:</strong> Đại [${keData.generals.daiChu}] - Tham [${keData.generals.thamChu}]</div>
          <div><strong style="color: #f43f5e;">Khách Tướng:</strong> Đại [${keData.generals.daiKhach}] - Tham [${keData.generals.thamKhach}]</div>
        </div>

        <div class="thaiat-the-tran">${keData.tinhThe}</div>
        ${anomaliesHtml ? `<div class="thaiat-badges-anomalies">${anomaliesHtml}</div>` : ''}
      </div>
    `;

    return `<div class="thaiat-grid-5x5">${cellsHtml + hudHtml}</div>`;
  }

  function renderMenhViewHTML() {
    if (!currentChart || !currentChart.laSoMenh) {
      return '<div class="neta-custom-card text-center p-3">Đang cập nhật Lá Số Nhân Mệnh...</div>';
    }
    let cells = '';
    for (let cungKey in currentChart.laSoMenh) {
      const p = currentChart.laSoMenh[cungKey];
      const starTags = p.stars.map(s => {
        const cls = getStarCssClass(s);
        return `<span class="thaiat-star-tag ${cls}">${s}</span>`;
      }).join('');

      cells += `
        <div class="thaiat-menh-cell" onclick="window.NetaThaiAtView.inspectPalace('${p.branch}')">
          <div class="thaiat-menh-name">
            <span>${p.cungName}</span>
            <span style="font-size: 10px; opacity: 0.75;">[${p.branch}]</span>
          </div>
          <div class="thaiat-menh-locma">Lộc: ${p.locVal} • Mã: ${p.maVal} • Đ.Hạn: ${p.daiHanTuoi}t</div>
          <div class="thaiat-star-list" style="margin-top: 4px;">${starTags || '<span style="color:#64748b; font-size:9px;">---</span>'}</div>
        </div>
      `;
    }
    return `<div class="thaiat-menh-grid">${cells}</div>`;
  }

  function bindThaiAtEvents() {
    const pad = n => String(n).padStart(2, '0');

    // Calendar Toggle
    const btnSolar = document.getElementById('thaiat-btn-solar');
    const btnLunar = document.getElementById('thaiat-btn-lunar');
    if (btnSolar) {
      btnSolar.onclick = () => {
        if (isLunarMode) {
          isLunarMode = false;
          renderThaiAt();
        }
      };
    }
    if (btnLunar) {
      btnLunar.onclick = () => {
        if (!isLunarMode) {
          isLunarMode = true;
          renderThaiAt();
        }
      };
    }

    // Gender Toggle
    const btnMale = document.getElementById('thaiat-btn-male');
    const btnFemale = document.getElementById('thaiat-btn-female');
    if (btnMale) {
      btnMale.onclick = () => {
        if (!currentIsMale) {
          currentIsMale = true;
          renderThaiAt();
        }
      };
    }
    if (btnFemale) {
      btnFemale.onclick = () => {
        if (currentIsMale) {
          currentIsMale = false;
          renderThaiAt();
        }
      };
    }

    // Now button
    const btnNow = document.getElementById('thaiat-btn-now');
    if (btnNow) {
      btnNow.onclick = () => {
        isLunarMode = false;
        currentDate = new Date();
        renderThaiAt();
      };
    }

    // Submit button
    const btnSubmit = document.getElementById('thaiat-btn-submit');
    const inputDay = document.getElementById('thaiat-input-day');
    const inputMonth = document.getElementById('thaiat-input-month');
    const inputYear = document.getElementById('thaiat-input-year');
    const inputHour = document.getElementById('thaiat-input-hour');
    const inputMin = document.getElementById('thaiat-input-minute');
    const selectCanChi = document.getElementById('thaiat-select-canchi');
    const datePicker = document.getElementById('thaiat-date-picker');

    if (btnSubmit) {
      btnSubmit.onclick = () => {
        let d = parseInt(inputDay.value, 10);
        let m = parseInt(inputMonth.value, 10);
        let y = parseInt(inputYear.value, 10);
        let h = parseInt(inputHour.value, 10);
        let min = parseInt(inputMin.value, 10);

        if (isNaN(d) || d < 1 || d > 31) d = currentDate.getDate();
        if (isNaN(m) || m < 1 || m > 12) m = currentDate.getMonth() + 1;
        if (isNaN(y) || y < 1900 || y > 2100) y = currentDate.getFullYear();
        if (isNaN(h) || h < 0 || h > 23) h = currentDate.getHours();
        if (isNaN(min) || min < 0 || min > 59) min = 0;

        if (isLunarMode && global.NetaCalendarEngine && typeof global.NetaCalendarEngine.lunar2Solar === 'function') {
          const sol = global.NetaCalendarEngine.lunar2Solar(d, m, y);
          if (sol) {
            d = sol.day;
            m = sol.month;
            y = sol.year;
          }
        }

        currentDate = new Date(y, m - 1, d, h, min, 0);
        renderThaiAt();
      };
    }

    // Tứ Kể Mode Buttons
    document.querySelectorAll('.ucc-view-btn[data-ke]').forEach(btn => {
      btn.onclick = () => {
        currentKeType = btn.getAttribute('data-ke');
        renderThaiAt();
      };
    });

    // Layer Filter Buttons
    document.querySelectorAll('.thaiat-filter-btn').forEach(btn => {
      btn.onclick = () => {
        currentLayer = btn.getAttribute('data-layer');
        renderThaiAt();
      };
    });

    // Quick Year Modal (NetaSmartPicker)
    const btnQuickYear = document.getElementById('thaiat-btn-quick-year');
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

    // Auto Advance & 2-digit Year Parser
    if (global.NetaSmartPicker) {
      global.NetaSmartPicker.setupAutoAdvance({
        dayInput: inputDay,
        monthInput: inputMonth,
        yearInput: inputYear,
        hourInput: inputHour,
        minuteInput: inputMin,
        onSubmit: () => { if (btnSubmit) btnSubmit.click(); }
      });

      // Native Date Picker sync
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

          currentDate = new Date(y, m - 1, d, h, min, 0);
          renderThaiAt();
        });

        const pickerLabel = document.getElementById('thaiat-btn-native-cal');
        const dateBox = document.getElementById('thaiat-ucc-date-box');

        const triggerWheelPicker = (e) => {
          if (e && e.target === datePicker) return;
          if (e) e.preventDefault();
          const curD = currentDate;
          datePicker.value = `${curD.getFullYear()}-${pad(curD.getMonth() + 1)}-${pad(curD.getDate())}T${pad(curD.getHours())}:${pad(curD.getMinutes())}`;
          if (typeof datePicker.showPicker === 'function') {
            datePicker.showPicker();
          } else {
            datePicker.click();
          }
        };

        if (pickerLabel) pickerLabel.onclick = triggerWheelPicker;
        if (dateBox) {
          dateBox.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
              triggerWheelPicker(e);
            }
          });
        }
      }

      // Can Chi hour select sync
      if (selectCanChi) {
        selectCanChi.addEventListener('change', () => {
          if (inputHour) inputHour.value = pad(selectCanChi.value);
        });
      }
      if (inputHour) {
        inputHour.addEventListener('input', () => {
          const h = parseInt(inputHour.value, 10);
          if (isNaN(h)) return;
          if (global.NetaSmartPicker) {
            const zhiObj = global.NetaSmartPicker.getZhiByHour(h);
            if (zhiObj && selectCanChi) selectCanChi.value = String(zhiObj.val);
          }
        });
      }
    }
  }

  function inspectPalace(pos) {
    selectedPalace = pos;
    const nameEl = document.getElementById('thaiat-drawer-name');
    const weightEl = document.getElementById('thaiat-drawer-weight');
    const descEl = document.getElementById('thaiat-drawer-desc');
    const adviceEl = document.getElementById('thaiat-drawer-advice');

    if (!nameEl || !currentChart) return;

    let keData = (currentKeType === 'gio') ? currentChart.keGio : currentChart.keNgay;
    const starsHere = [];
    if (keData && keData.stars) {
      for (let s in keData.stars) {
        if (keData.stars[s] === pos) starsHere.push(s);
      }
    }

    const w = (global.NetaThaiAtEngine && global.NetaThaiAtEngine.QUAI_WEIGHTS[pos]) || 0;
    nameEl.textContent = `CUNG [${pos.toUpperCase()}] • ${starsHere.join(', ') || 'Không có sao chính'}`;
    weightEl.textContent = `Trọng số Lạc Thư: ${w}`;
    descEl.textContent = PALACE_DESCRIPTIONS[pos] || "Phương vị địa bàn Thái Ất.";
    adviceEl.innerHTML = getPalaceAdviceHTML(pos, keData);

    document.querySelectorAll('.thaiat-cell').forEach(el => el.classList.remove('active-cell'));
    const activeEl = document.querySelector(`.thaiat-cell[onclick*="'${pos}'"]`);
    if (activeEl) activeEl.classList.add('active-cell');
  }

  global.NetaThaiAtView = {
    init: initThaiAtView,
    render: () => {
      if (!currentChart) {
        initThaiAtView();
      } else {
        renderThaiAt();
      }
    },
    setDate: setDateAndRender,
    inspectPalace: inspectPalace
  };

})(typeof window !== 'undefined' ? window : this);
