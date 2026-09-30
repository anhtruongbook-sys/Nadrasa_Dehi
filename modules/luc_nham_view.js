/**
 * NETA LIGHT - LỤC NHÂM ĐẠI ĐỘN VIEW MODULE (luc_nham_view.js)
 * Giao diện trực quan hoá Bàn Quẻ Lục Nhâm Thần Khóa 8 Lớp Thông Tin
 * Đồng nhất 100% với phong cách Tử Vi & Bát Tự (Unified Control Card, Light/Dark theme, Không tràn nút, Vuốt dọc mượt mà).
 */

(function (global) {
  'use strict';

  let currentChart = null;
  let currentDate = new Date();
  let currentViewMode = 'classic'; // 'classic' (8 lớp) | 'touch' (1-chạm)
  let selectedBox = 'Tỵ';           // Địa bàn đang chọn
  let isLunarMode = false;
  let currentIsMale = true;
  let customDaytime = null;        // null: auto, true: đán, false: mộ
  let customNguyetTuong = '';      // rỗng: auto theo tiết khí

  // Thứ tự 12 vị trí trên ma trận 4x4 theo Địa Bàn cổ truyền (Khớp hoàn toàn với Excel)
  const DIAL_4x4_LAYOUT = [
    'Tỵ', 'Ngọ', 'Mùi', 'Thân',
    'Thìn', null, null, 'Dậu',
    'Mão', null, null, 'Tuất',
    'Dần', 'Sửu', 'Tý', 'Hợi'
  ];

  const NGU_HANH_COLORS = {
    'Kim': { bg: 'rgba(234, 179, 8, 0.15)', text: '#fde047', border: '#eab308' },
    'Mộc': { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80', border: '#22c55e' },
    'Thủy': { bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8', border: '#0284c7' },
    'Hỏa': { bg: 'rgba(244, 63, 94, 0.15)', text: '#fb7185', border: '#f43f5e' },
    'Thổ': { bg: 'rgba(217, 119, 6, 0.15)', text: '#fbbf24', border: '#d97706' }
  };

  const THIEN_TUONG_DESC = {
    "Quý nhân": "Thần tối tôn, đứng đầu 12 tướng. Chủ về quý nhân phù trợ, quan chức, thi cử, việc trọng đại hanh thông.",
    "Đằng xà": "Hỏa thần, chủ về sự quái dị, kinh sợ, ác mộng, trói buộc, nghi ngờ, thị phi, tai ương bất ngờ.",
    "Chu tước": "Hỏa thần, chủ về văn thư, thư tín, kiện tụng, khẩu thiệt thị phi, hỏa hoạn, tin tức nhanh chóng.",
    "Thiên hợp": "Mộc thần (Lục Hợp), chủ về hôn nhân, giao dịch, mai mối, hòa hợp, bạn bè tụ họp, việc mưu kín đáo.",
    "Câu trận": "Thổ thần, chủ về tranh chấp, chần chừ, lao tù, trì trệ, việc quan lại phiền nhiễu, điền trạch xích mích.",
    "Thanh long": "Mộc thần, đại cát tướng. Chủ về tài lộc, hỷ sự, thăng tiến, quý nhân giúp đỡ, đi xa gặp may.",
    "Thiên không": "Thổ thần, chủ về sự hư dối, trống rỗng, gian xảo, hòa thượng đạo sĩ, giấy tờ giả dối, bất thành.",
    "Bạch hổ": "Kim thần hung dữ. Chủ về đao binh, tang tóc, tai nạn xe cộ, bệnh tật nguy cấp, huyết quang hung bạo.",
    "Thái thường": "Thổ thần, chủ về yến tiệc, ăn uống, áo quần, quà cáp, thăng quan, chức vị bổng lộc hanh thông.",
    "Huyền vũ": "Thủy thần, chủ về trộm cắp, trốn tránh, mờ ám, dâm tà, tiểu nhân ngầm hãm hại, tổn hao tài sản.",
    "Thái âm": "Kim thần, chủ về âm thầm giúp đỡ, sự kín đáo, phụ nữ, mưu tính trong bóng tối, tiền bạc tích lũy.",
    "Thiên hậu": "Thủy thần cát lợi, chủ về ân đức, mẹ, vợ, cung nữ, việc gia đình bình yên, gặp dữ hóa lành."
  };

  function ensureStyles() {
    if (document.getElementById('lucnham-scoped-styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'lucnham-scoped-styles';
    styleEl.textContent = `
      .lucnham-view-wrap {
        width: 100%;
        max-width: 480px;
        margin: 0 auto;
        padding: 4px 6px calc(var(--safe-bottom, 20px) + 90px);
        box-sizing: border-box;
        color: var(--text-primary, #f8fafc);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }

      /* Hero Section: Tam Truyền */
      .lucnham-hero-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
        text-align: center;
      }
      .lucnham-truyen-box {
        background: rgba(20, 2, 5, 0.85);
        border: 1px solid rgba(245, 176, 65, 0.25);
        border-radius: 8px;
        padding: 8px 4px;
        position: relative;
        transition: all 0.15s ease;
      }
      body.theme-light .lucnham-truyen-box {
        background: #fdfaf3 !important;
        border-color: #e5e7eb !important;
      }
      .lucnham-truyen-box:hover {
        border-color: #f5b041;
      }
      .lucnham-truyen-tag {
        position: absolute;
        top: 3px;
        left: 6px;
        font-size: 9px;
        font-weight: 800;
        color: var(--gold-primary, #f5b041);
      }
      body.theme-light .lucnham-truyen-tag {
        color: #b45309;
      }
      .lucnham-truyen-chi {
        font-size: 22px;
        font-weight: 900;
        line-height: 1.1;
        margin: 4px 0 2px;
      }

      /* Tứ Khóa Grid */
      .lucnham-tukhoa-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 4px;
        text-align: center;
      }
      .lucnham-khoa-col {
        background: rgba(20, 2, 5, 0.85);
        border: 1px solid rgba(245, 176, 65, 0.2);
        border-radius: 6px;
        padding: 5px 2px;
      }
      body.theme-light .lucnham-khoa-col {
        background: #fdfaf3 !important;
        border-color: #e5e7eb !important;
      }
      .lucnham-khoa-thu {
        font-size: 14px;
        font-weight: 800;
        line-height: 1.3;
      }
      .lucnham-khoa-ha {
        font-size: 14px;
        font-weight: 800;
        line-height: 1.3;
        color: #ffffff;
      }
      body.theme-light .lucnham-khoa-ha {
        color: #1e293b !important;
      }
      body.theme-light .lucnham-cell-sub {
        color: #4b5563 !important;
      }
      body.theme-light .lucnham-cell-muted {
        color: #6b7280 !important;
      }
      body.theme-light .lucnham-cell-diaban {
        color: #1e293b !important;
      }
      .lucnham-khoa-tag {
        font-size: 8.5px;
        padding: 1px 4px;
        border-radius: 3px;
        display: inline-block;
        margin-top: 3px;
        font-weight: 700;
      }
      .tag-tac { background: rgba(239, 68, 68, 0.25); color: #fca5a5; }
      body.theme-light .tag-tac { background: #fee2e2; color: #b91c1c; }
      .tag-khac { background: rgba(245, 158, 11, 0.25); color: #fde68a; }
      body.theme-light .tag-khac { background: #fef3c7; color: #b45309; }
      .tag-sinh { background: rgba(34, 197, 94, 0.25); color: #86efac; }
      body.theme-light .tag-sinh { background: #dcfce7; color: #15803d; }
      .tag-ty { background: rgba(56, 189, 248, 0.25); color: #7dd3fc; }
      body.theme-light .tag-ty { background: #e0f2fe; color: #0369a1; }

      /* Bàn Cờ 12 Cung Dial 4x4 */
      .lucnham-dial-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: repeat(4, minmax(64px, auto));
        gap: 3px;
        background: rgba(20, 2, 5, 0.95);
        border: 1px solid rgba(245, 176, 65, 0.35);
        border-radius: 8px;
        padding: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      }
      body.theme-light .lucnham-dial-grid {
        background: #fdfaf3 !important;
        border-color: #e0d5c1 !important;
        box-shadow: 0 2px 8px rgba(160, 120, 60, 0.1) !important;
      }

      .lucnham-cung-cell {
        background: rgba(30, 6, 12, 0.9);
        border: 1px solid rgba(245, 176, 65, 0.2);
        border-radius: 5px;
        padding: 3px 4px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        cursor: pointer;
        position: relative;
        transition: all 0.15s ease;
        overflow: hidden;
      }
      body.theme-light .lucnham-cung-cell {
        background: #ffffff !important;
        border-color: #e5e7eb !important;
      }

      .lucnham-cung-cell:hover, .lucnham-cung-cell.lucnham-cung-active {
        background: rgba(245, 176, 65, 0.22) !important;
        outline: 1.5px solid #f5b041;
      }
      body.theme-light .lucnham-cung-cell:hover, body.theme-light .lucnham-cung-cell.lucnham-cung-active {
        background: rgba(217, 119, 6, 0.15) !important;
        outline: 1.5px solid #d97706;
      }

      /* Trung Cung HUD 2x2 trong Bàn Lục Nhâm */
      .lucnham-center-hud {
        grid-column: 2 / span 2;
        grid-row: 2 / span 2;
        background: rgba(14, 1, 4, 0.98);
        border: 1px solid rgba(245, 176, 65, 0.35);
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        padding: 4px;
      }
      body.theme-light .lucnham-center-hud {
        background: #ffffff !important;
        border-color: #d1d5db !important;
      }

      /* Drawer Tương Tác Chi Tiết 12 Cung */
      .lucnham-drawer-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 998;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
      }
      .lucnham-drawer-overlay.open {
        opacity: 1;
        pointer-events: auto;
      }
      .lucnham-drawer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        max-width: 480px;
        margin: 0 auto;
        background: rgba(20, 2, 5, 0.98);
        border-top: 2px solid #f5b041;
        border-radius: 14px 14px 0 0;
        padding: 14px 14px calc(var(--safe-bottom, 20px) + 20px);
        box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.8);
        transform: translateY(100%);
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 999;
        max-height: 75vh;
        overflow-y: auto;
      }
      body.theme-light .lucnham-drawer {
        background: #ffffff !important;
        border-top-color: #d97706 !important;
        box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.2) !important;
        color: #1f2937 !important;
      }
      .lucnham-drawer.open {
        transform: translateY(0);
      }
    `;
    document.head.appendChild(styleEl);
  }

  function computeChart() {
    let canNgay = "Tân", chiNgay = "Mão", chiGio = "Sửu", chiNam = "Sửu", chiThang = "Tuất";
    let tietKhi = "Thu phân";
    let isDaytime = customDaytime;

    // Tích hợp trực tiếp với NetaCalendarEngine
    if (global.NetaCalendarEngine && typeof global.NetaCalendarEngine.getFullDayInfo === 'function') {
      try {
        const cal = global.NetaCalendarEngine.getFullDayInfo(currentDate);
        if (cal && cal.canChi) {
          const dayParts = (cal.canChi.day || "").split(" ");
          const hourParts = (cal.canChi.hour || "").split(" ");
          const yearParts = (cal.canChi.year || "").split(" ");
          const monthParts = (cal.canChi.month || "").split(" ");

          if (dayParts.length >= 2) { canNgay = dayParts[0]; chiNgay = dayParts[1]; }
          if (hourParts.length >= 2) { chiGio = hourParts[1]; }
          if (yearParts.length >= 2) { chiNam = yearParts[1]; }
          if (monthParts.length >= 2) { chiThang = monthParts[1]; }

          if (cal.solarTerm) {
            tietKhi = (typeof cal.solarTerm === 'string') ? cal.solarTerm : (cal.solarTerm.name || "Thu phân");
          }
        }
      } catch (e) {
        console.warn('Lục Nhâm: Không thể lấy dữ liệu từ Calendar Engine:', e);
      }
    }

    if (isDaytime === null) {
      isDaytime = ["Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân"].includes(chiGio);
    }

    let nguyetTuong = customNguyetTuong;
    if (!nguyetTuong && global.LucNhamEngine) {
      const map = global.LucNhamEngine.SOLAR_TERM_TO_NGUYET_TUONG;
      const tkClean = (tietKhi || "").trim();
      nguyetTuong = map[tkClean] || map[tkClean.toLowerCase()] || map["Thu phân"] || "Thìn";
      if (!nguyetTuong) {
        for (const [k, v] of Object.entries(map)) {
          if (k.toLowerCase() === tkClean.toLowerCase()) {
            nguyetTuong = v;
            break;
          }
        }
      }
    }
    if (!nguyetTuong) nguyetTuong = "Thìn";

    const currentYear = currentDate.getFullYear();
    const birthYear = currentYear - 45; // Mặc định hoặc tính theo đương số

    if (global.LucNhamEngine) {
      currentChart = global.LucNhamEngine.lapQue({
        canNgay,
        chiNgay,
        chiGio,
        nguyetTuong,
        isDaytime,
        tietKhi,
        chiNam,
        birthYear,
        currentYear,
        gioiTinh: currentIsMale ? 'Nam' : 'Nữ',
        chiThang
      });
    }
  }

  function initLucNhamView(target) {
    const container = target || document.getElementById('view-lucnham');
    if (!container) return;
    ensureStyles();
    renderLucNham(container);
  }

  function renderLucNham(targetContainer) {
    const container = targetContainer || document.getElementById('view-lucnham');
    if (!container) return;
    ensureStyles();
    computeChart();

    if (!currentChart) {
      container.innerHTML = `
        <div class="module-placeholder">
          <div class="placeholder-icon">六壬</div>
          <h2 class="placeholder-title">LỖI KHỞI TẠO LỤC NHÂM</h2>
          <p class="placeholder-desc">Không thể tính toán quẻ Lục Nhâm cho thời điểm này. Vui lòng thử lại.</p>
        </div>
      `;
      return;
    }

    const c = currentChart;
    const isDay = c.isDaytime;
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

    container.innerHTML = `
      <div class="lucnham-view-wrap">
        <!-- 1. Unified Control Card (Chuẩn Tử Vi & Bát Tự) -->
        <div class="unified-ctrl-card">
          <!-- Row 1: Calendar switch & Date Box -->
          <div class="ucc-row ucc-row-date">
            <div class="ucc-pill-cal">
              <button type="button" class="ucc-pill-btn ${!isLunarMode ? 'active' : ''}" id="lucnham-btn-solar">☀️ Dương</button>
              <button type="button" class="ucc-pill-btn ${isLunarMode ? 'active' : ''}" id="lucnham-btn-lunar">🌙 Âm</button>
            </div>
            <div class="ucc-date-box" id="lucnham-ucc-date-box" title="Nhập ngày tháng hoặc chạm nút lịch để chọn">
              <input type="number" id="lucnham-input-day" class="num-box num-day" min="1" max="31" value="${displayDay}" placeholder="Ngày">
              <span class="num-slash">/</span>
              <input type="number" id="lucnham-input-month" class="num-box num-month" min="1" max="12" value="${displayMonth}" placeholder="Tháng">
              <span class="num-slash">/</span>
              <input type="number" id="lucnham-input-year" class="num-box num-year" min="1900" max="2100" value="${displayYear}" placeholder="Năm">
              <button type="button" class="ucc-btn-year" id="lucnham-btn-quick-year" title="Chọn Thập niên & Năm siêu tốc">⚡Năm</button>
              <label class="btn-picker-cal" id="lucnham-btn-native-cal" title="Mở bảng chọn Ngày & Giờ">
                📅
                <input type="datetime-local" id="lucnham-date-picker" value="${dStr}T${pad(sHour)}:${pad(sMin)}" class="native-hidden-date">
              </label>
            </div>
          </div>

          <!-- Row 2: Can Chi Giờ + Giờ : Phút + Giới Tính -->
          <div class="ucc-row ucc-row-time">
            <div class="ucc-time-box">
              <select id="lucnham-select-canchi" class="select-canchi">
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
              <input type="number" id="lucnham-input-hour" class="num-box num-hour" min="0" max="23" value="${pad(sHour)}" placeholder="Giờ">
              <span class="num-colon">:</span>
              <input type="number" id="lucnham-input-minute" class="num-box num-min" min="0" max="59" value="${pad(sMin)}" placeholder="Phút">
            </div>
            <div class="ucc-pill-gender">
              <button type="button" class="ucc-gender-btn ${currentIsMale ? 'active male' : ''}" id="lucnham-btn-male">♂ Nam</button>
              <button type="button" class="ucc-gender-btn ${!currentIsMale ? 'active female' : ''}" id="lucnham-btn-female">♀ Nữ</button>
            </div>
          </div>

          <!-- Row 3: Actions + Chế Độ Xem Bàn Cờ -->
          <div class="ucc-row ucc-row-actions">
            <button class="ucc-btn-now" id="lucnham-btn-now" title="Về thời điểm hiện tại">
              ⚡ Giờ thực
            </button>
            <div class="ucc-pill-view">
              <button class="ucc-view-btn ${currentViewMode === 'classic' ? 'active' : ''}" id="btn-lucnham-mode-classic" title="Bàn cờ 8 lớp đầy đủ">
                🗂️ 8 Lớp
              </button>
              <button class="ucc-view-btn ${currentViewMode === 'touch' ? 'active' : ''}" id="btn-lucnham-mode-touch" title="Bàn cảm ứng tối giản 1-chạm">
                📱 1 Chạm
              </button>
            </div>
            <button class="ucc-btn-submit" id="lucnham-btn-submit" title="Lập quẻ Lục Nhâm">
              🔮 Lập Quẻ
            </button>
          </div>
        </div>

        <!-- 2. Master Overview Ribbon (Lục Nhâm Master Strip) -->
        <div class="lucnham-master-strip">
          <div><span>Ngày:</span> <strong class="tms-val-gold">${c.canNgay} ${c.chiNgay}</strong></div>
          <span>•</span>
          <div><span>Giờ:</span> <strong>${c.chiGio}</strong></div>
          <span>•</span>
          <div><span>${isDay ? '☀️ Đán Quý' : '🌙 Mộ Quý'}</span></div>
          <span>•</span>
          <div><span>Tướng:</span> <strong>${c.nguyetTuong}</strong></div>
          <span>•</span>
          <div><span>Quý nhân:</span> <strong>${c.quyNhanCung}</strong> (${c.quyNhanChieu})</div>
        </div>

        <!-- 3. Tam Truyền Hero Card -->
        <div class="neta-custom-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 11px; font-weight: 800; color: var(--gold-primary, #f5b041); text-transform: uppercase;">Tam Truyền</span>
            </div>
            <span style="font-size: 10px; background: rgba(245, 176, 65, 0.15); color: var(--gold-primary, #f5b041); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(245, 176, 65, 0.3); font-weight: 700;">
              ${c.tamTruyenTenTong}
            </span>
          </div>

          <div class="lucnham-hero-grid">
            <!-- Sơ Truyền -->
            <div class="lucnham-truyen-box" style="border-color: ${NGU_HANH_COLORS[c.soTruyen.nguHanh].border};">
              <span class="lucnham-truyen-tag">SƠ</span>
              <div style="font-size: 10px; font-weight: 700; color: #f43f5e; margin-top: 10px;">${c.soTruyen.thienTuong}</div>
              <div class="lucnham-truyen-chi" style="color: ${NGU_HANH_COLORS[c.soTruyen.nguHanh].text};">${c.soTruyen.chi}</div>
              <div style="font-size: 10px; font-weight: 600; color: var(--text-secondary, #cbd5e1);">${c.soTruyen.lucThan}</div>
              <div style="font-size: 8.5px; opacity: 0.75; border-top: 1px solid rgba(245, 176, 65, 0.2); margin-top: 4px; padding-top: 2px;">
                ${c.soTruyen.nguHanh} · Sơ phát
              </div>
            </div>

            <!-- Trung Truyền -->
            <div class="lucnham-truyen-box" style="border-color: ${NGU_HANH_COLORS[c.trungTruyen.nguHanh].border};">
              <span class="lucnham-truyen-tag">TRUNG</span>
              <div style="font-size: 10px; font-weight: 700; color: #818cf8; margin-top: 10px;">${c.trungTruyen.thienTuong}</div>
              <div class="lucnham-truyen-chi" style="color: ${NGU_HANH_COLORS[c.trungTruyen.nguHanh].text};">${c.trungTruyen.chi}</div>
              <div style="font-size: 10px; font-weight: 600; color: var(--text-secondary, #cbd5e1);">${c.trungTruyen.lucThan}</div>
              <div style="font-size: 8.5px; opacity: 0.75; border-top: 1px solid rgba(245, 176, 65, 0.2); margin-top: 4px; padding-top: 2px;">
                ${c.trungTruyen.nguHanh} · Trung di
              </div>
            </div>

            <!-- Mạt Truyền -->
            <div class="lucnham-truyen-box" style="border-color: ${NGU_HANH_COLORS[c.matTruyen.nguHanh].border};">
              <span class="lucnham-truyen-tag">MẠT</span>
              <div style="font-size: 10px; font-weight: 700; color: #34d399; margin-top: 10px;">${c.matTruyen.thienTuong}</div>
              <div class="lucnham-truyen-chi" style="color: ${NGU_HANH_COLORS[c.matTruyen.nguHanh].text};">${c.matTruyen.chi}</div>
              <div style="font-size: 10px; font-weight: 600; color: var(--text-secondary, #cbd5e1);">${c.matTruyen.lucThan}</div>
              <div style="font-size: 8.5px; opacity: 0.75; border-top: 1px solid rgba(245, 176, 65, 0.2); margin-top: 4px; padding-top: 2px;">
                ${c.matTruyen.nguHanh} · Mạt túc
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Tứ Khóa Card -->
        <div class="neta-custom-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 800; color: var(--gold-primary, #f5b041); text-transform: uppercase;">
              Tứ Khóa (Can Chi Tương Phối)
            </span>
            <span style="font-size: 9px; color: #94a3b8;">IV ← III ← II ← I</span>
          </div>

          <div class="lucnham-tukhoa-grid">
            <!-- Khóa 4: Chi Âm -->
            <div class="lucnham-khoa-col">
              <div style="font-size: 8.5px; color: #94a3b8;">IV</div>
              <div class="lucnham-khoa-thu" style="color: #fde047;">${c.tuKhoa[3]?.thuong || ''}</div>
              <div class="lucnham-khoa-ha">${c.tuKhoa[3]?.ha || ''}</div>
              <div class="lucnham-khoa-tag ${getTagClass(c.tuKhoa[3]?.quanHe)}">${c.tuKhoa[3]?.quanHe || '---'}</div>
            </div>

            <!-- Khóa 3: Chi Dương -->
            <div class="lucnham-khoa-col">
              <div style="font-size: 8.5px; color: #94a3b8;">III</div>
              <div class="lucnham-khoa-thu" style="color: #fde047;">${c.tuKhoa[2]?.thuong || ''}</div>
              <div class="lucnham-khoa-ha">${c.tuKhoa[2]?.ha || ''}</div>
              <div class="lucnham-khoa-tag ${getTagClass(c.tuKhoa[2]?.quanHe)}">${c.tuKhoa[2]?.quanHe || '---'}</div>
            </div>

            <!-- Khóa 2: Can Âm -->
            <div class="lucnham-khoa-col">
              <div style="font-size: 8.5px; color: #94a3b8;">II</div>
              <div class="lucnham-khoa-thu" style="color: #fde047;">${c.tuKhoa[1]?.thuong || ''}</div>
              <div class="lucnham-khoa-ha">${c.tuKhoa[1]?.ha || ''}</div>
              <div class="lucnham-khoa-tag ${getTagClass(c.tuKhoa[1]?.quanHe)}">${c.tuKhoa[1]?.quanHe || '---'}</div>
            </div>

            <!-- Khóa 1: Can Dương -->
            <div class="lucnham-khoa-col">
              <div style="font-size: 8.5px; color: #94a3b8;">I</div>
              <div class="lucnham-khoa-thu" style="color: #fde047;">${c.tuKhoa[0]?.thuong || ''}</div>
              <div class="lucnham-khoa-ha">${c.tuKhoa[0]?.ha || ''}</div>
              <div class="lucnham-khoa-tag ${getTagClass(c.tuKhoa[0]?.quanHe)}">${c.tuKhoa[0]?.quanHe || '---'}</div>
            </div>
          </div>
        </div>

        <!-- 5. Bàn Cờ 12 Cung 4x4 (Dial Matrix) -->
        <div class="neta-custom-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 800; color: var(--gold-primary, #f5b041); text-transform: uppercase;">
              ${currentViewMode === 'classic' ? 'Bàn Cờ 8 Lớp Thông Tin' : 'Bàn Cảm Ứng 1-Chạm'}
            </span>
            <span style="font-size: 9px; color: #94a3b8;">Chạm cung để xem luận giải</span>
          </div>

          <div class="lucnham-dial-grid">
            ${DIAL_4x4_LAYOUT.map(d => {
              if (!d) return '';
              if (d === 'Thìn') {
                const bThin = c.cung12['Thìn'];
                const bDau = c.cung12['Dậu'];
                return `
                  ${renderSingleCell(bThin, selectedBox === 'Thìn')}
                  <div class="lucnham-center-hud">
                    <span style="font-size: 9px; font-weight: 800; color: var(--gold-primary, #f5b041); text-transform: uppercase;">LỤC NHÂM ĐẠI ĐỘN</span>
                    <div style="font-size: 13px; font-weight: 900; margin: 2px 0;">${c.canNgay} ${c.chiNgay}</div>
                    <div style="font-size: 9px; color: #34d399;">Trạch: ${c.trachThan} · Mộ: ${c.moThan}</div>
                    <div style="font-size: 9px; color: #fde047; margin-top: 1px;">Hành niên: ${c.hanhNienChi} (${c.tuoiAm}T)</div>
                  </div>
                  ${renderSingleCell(bDau, selectedBox === 'Dậu')}
                `;
              }
              if (d === 'Dậu' || d === 'Mão' || d === 'Tuất') {
                if (d === 'Dậu') return '';
                if (d === 'Mão') {
                  const bMao = c.cung12['Mão'];
                  const bTuat = c.cung12['Tuất'];
                  return `
                    ${renderSingleCell(bMao, selectedBox === 'Mão')}
                    ${renderSingleCell(bTuat, selectedBox === 'Tuất')}
                  `;
                }
                if (d === 'Tuất') return '';
              }
              const b = c.cung12[d];
              return renderSingleCell(b, selectedBox === d);
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Drawer Tra Cứu Chi Tiết 1 Cung -->
      <div id="lucnham-drawer-overlay" class="lucnham-drawer-overlay" onclick="window.LucNhamView.closeDrawer()"></div>
      <div id="lucnham-drawer" class="lucnham-drawer">
        <div id="lucnham-drawer-content"></div>
      </div>
    `;

    bindLucNhamEvents();
  }

  function getTagClass(mq) {
    if (mq === 'Tặc') return 'tag-tac';
    if (mq === 'Khắc') return 'tag-khac';
    if (mq === 'Sinh') return 'tag-sinh';
    if (mq === 'Tỷ') return 'tag-ty';
    return '';
  }

  function renderSingleCell(b, isActive) {
    if (!b) return '';
    const tags = [];
    if (b.tagHanhNien) tags.push(`<span style="color: #f59e0b; font-weight: 800;">${b.tagHanhNien}</span>`);
    if (b.tagTrachMo) tags.push(`<span style="color: #34d399; font-weight: 800;">${b.tagTrachMo}</span>`);
    if (b.tagCanChiNgay) tags.push(`<span style="color: #f43f5e; font-weight: 800;">${b.tagCanChiNgay}</span>`);
    const tagHtml = tags.join(' ');

    if (currentViewMode === 'touch') {
      return `
        <div class="lucnham-cung-cell ${isActive ? 'lucnham-cung-active' : ''}" onclick="window.LucNhamView.selectPalace('${b.diaBan}')">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; font-size: 9px;">
            <span style="font-weight: 800; color: #94a3b8;">${b.diaBan}</span>
            <span style="font-size: 8px; font-weight: 700; color: #f59e0b; max-width: 46px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${b.thienTuong}
            </span>
          </div>
          <div style="text-align: center; font-size: 15px; font-weight: 900; color: #fde047; margin: 2px 0;">
            ${b.thienBan}
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 8px; color: #94a3b8;">
            <span>${b.lucThan.split(' ')[0]}</span>
            <span>${tagHtml}</span>
          </div>
        </div>
      `;
    }

    const satStr = (b.thanSatPhu && b.thanSatPhu.length) ? b.thanSatPhu.join(',') : '';
    return `
      <div class="lucnham-cung-cell ${isActive ? 'lucnham-cung-active' : ''}" onclick="window.LucNhamView.selectPalace('${b.diaBan}')">
        <!-- Dòng 1: Thiên bàn & Tags -->
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; border-bottom: 1px solid rgba(245, 176, 65, 0.2); padding-bottom: 1px;">
          <span style="font-weight: 900; color: #fde047;">${b.thienBan}</span>
          <div style="font-size: 8px; line-height: 1;">${tagHtml}</div>
        </div>
        <!-- Dòng 2: Thiên tướng -->
        <div style="font-size: 8.5px; font-weight: 800; color: #38bdf8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${b.thienTuong}
        </div>
        <!-- Dòng 3: Sao Thái Tuế -->
        <div class="lucnham-cell-sub" style="font-size: 7.5px; color: #cbd5e1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${b.saoThaiTue || '---'}
        </div>
        <!-- Dòng 4: Vòng Kiến Trừ -->
        <div class="lucnham-cell-sub" style="font-size: 7.5px; color: #94a3b8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${b.saoKienTru || '---'}
        </div>
        <!-- Dòng 5: Thần Sát Phụ -->
        <div style="font-size: 7px; color: #f43f5e; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${satStr || '---'}
        </div>
        <!-- Dòng 6: Thần Cung & Địa Bàn -->
        <div style="display: flex; justify-content: space-between; font-size: 8.5px; border-top: 1px solid rgba(245, 176, 65, 0.15); margin-top: 1px; padding-top: 1px;">
          <span class="lucnham-cell-muted" style="color: #64748b; font-weight: 700;">${b.tenNguyetTuong || b.lucThan?.split(' ')[0] || ''}</span>
          <span class="lucnham-cell-diaban" style="font-weight: 800;">${b.diaBan}</span>
        </div>
      </div>
    `;
  }

  function bindLucNhamEvents() {
    const pad = n => String(n).padStart(2, '0');

    // Mode Switches
    const btnClassic = document.getElementById('btn-lucnham-mode-classic');
    const btnTouch = document.getElementById('btn-lucnham-mode-touch');
    if (btnClassic) {
      btnClassic.onclick = () => {
        currentViewMode = 'classic';
        renderLucNham();
      };
    }
    if (btnTouch) {
      btnTouch.onclick = () => {
        currentViewMode = 'touch';
        renderLucNham();
      };
    }

    // Calendar Toggle
    const btnSolar = document.getElementById('lucnham-btn-solar');
    const btnLunar = document.getElementById('lucnham-btn-lunar');
    if (btnSolar) {
      btnSolar.onclick = () => {
        if (isLunarMode) {
          isLunarMode = false;
          renderLucNham();
        }
      };
    }
    if (btnLunar) {
      btnLunar.onclick = () => {
        if (!isLunarMode) {
          isLunarMode = true;
          renderLucNham();
        }
      };
    }

    // Gender Toggle
    const btnMale = document.getElementById('lucnham-btn-male');
    const btnFemale = document.getElementById('lucnham-btn-female');
    if (btnMale) {
      btnMale.onclick = () => {
        if (!currentIsMale) {
          currentIsMale = true;
          renderLucNham();
        }
      };
    }
    if (btnFemale) {
      btnFemale.onclick = () => {
        if (currentIsMale) {
          currentIsMale = false;
          renderLucNham();
        }
      };
    }

    // Now button
    const btnNow = document.getElementById('lucnham-btn-now');
    if (btnNow) {
      btnNow.onclick = () => {
        isLunarMode = false;
        currentDate = new Date();
        renderLucNham();
      };
    }

    // Submit button
    const btnSubmit = document.getElementById('lucnham-btn-submit');
    const inputDay = document.getElementById('lucnham-input-day');
    const inputMonth = document.getElementById('lucnham-input-month');
    const inputYear = document.getElementById('lucnham-input-year');
    const inputHour = document.getElementById('lucnham-input-hour');
    const inputMin = document.getElementById('lucnham-input-minute');
    const selectCanChi = document.getElementById('lucnham-select-canchi');
    const datePicker = document.getElementById('lucnham-date-picker');

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
        renderLucNham();
      };
    }

    // Quick Year Modal (NetaSmartPicker)
    const btnQuickYear = document.getElementById('lucnham-btn-quick-year');
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

    // Auto Advance & Native Date Picker
    if (global.NetaSmartPicker) {
      global.NetaSmartPicker.setupAutoAdvance({
        dayInput: inputDay,
        monthInput: inputMonth,
        yearInput: inputYear,
        hourInput: inputHour,
        minuteInput: inputMin,
        onSubmit: () => { if (btnSubmit) btnSubmit.click(); }
      });

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
          renderLucNham();
        });

        const pickerLabel = document.getElementById('lucnham-btn-native-cal');
        const dateBox = document.getElementById('lucnham-ucc-date-box');

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

  function selectPalace(diaBan) {
    selectedBox = diaBan;
    renderLucNham();
    openDrawer(diaBan);
  }

  function openDrawer(diaBan) {
    if (!currentChart) return;
    const b = currentChart.cung12[diaBan];
    if (!b) return;

    const drawer = document.getElementById('lucnham-drawer');
    const overlay = document.getElementById('lucnham-drawer-overlay');
    const content = document.getElementById('lucnham-drawer-content');
    if (!drawer || !content) return;

    const tuongDesc = THIEN_TUONG_DESC[b.thienTuong] || "Thần tướng Lục Nhâm.";
    const satStr = (b.thanSatPhu && b.thanSatPhu.length) ? b.thanSatPhu.join(", ") : "Không có";

    content.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; border-bottom: 1px solid rgba(245, 176, 65, 0.25); padding-bottom: 6px;">
        <div>
          <div style="font-size: 14px; font-weight: 800; color: var(--gold-primary, #f5b041);">
            CUNG [${b.diaBan}] · THIÊN BÀN [${b.thienBan}]
          </div>
          <div style="font-size: 10px; color: #94a3b8;">
            Lục Thân: <strong style="color: #ffffff;">${b.lucThan}</strong> · Bát Môn: <strong style="color: #38bdf8;">${b.batMon}</strong>
          </div>
        </div>
        <button onclick="window.LucNhamView.closeDrawer()" style="background: none; border: none; color: #94a3b8; font-size: 18px; cursor: pointer;">✕</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; line-height: 1.4;">
        <div style="background: rgba(245, 176, 65, 0.1); border-left: 3px solid #f5b041; padding: 6px 8px; border-radius: 0 4px 4px 0;">
          <div style="font-weight: 800; color: var(--gold-primary, #f5b041); margin-bottom: 2px;">
            Thần Tướng: ${b.thienTuong}
          </div>
          <div>${tuongDesc}</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
          <div style="background: rgba(20, 2, 5, 0.6); padding: 6px 8px; border-radius: 6px; border: 1px solid rgba(245, 176, 65, 0.15);">
            <div style="color: #94a3b8; font-size: 9px;">Vòng Thái Tuế (Thiên Bàn)</div>
            <div style="font-weight: 700; color: #cbd5e1;">${b.saoThaiTue}</div>
          </div>
          <div style="background: rgba(20, 2, 5, 0.6); padding: 6px 8px; border-radius: 6px; border: 1px solid rgba(245, 176, 65, 0.15);">
            <div style="color: #94a3b8; font-size: 9px;">Vòng Kiến Trừ (Địa Bàn)</div>
            <div style="font-weight: 700; color: #38bdf8;">${b.kienTru}</div>
          </div>
        </div>

        <div style="background: rgba(20, 2, 5, 0.6); padding: 6px 8px; border-radius: 6px; border: 1px solid rgba(245, 176, 65, 0.15);">
          <div style="color: #94a3b8; font-size: 9px;">Thần Sát Phụ Tại Cung</div>
          <div style="font-weight: 700; color: #f43f5e;">${satStr}</div>
        </div>

        ${b.tagCanChiNgay ? `
          <div style="background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.3); padding: 6px 8px; border-radius: 6px; color: #fecdd3;">
            📌 <strong>Can Ký / Chi Ngày:</strong> ${b.tagCanChiNgay} tại cung này.
          </div>
        ` : ''}

        ${(b.tagHanhNien || b.tagTrachMo) ? `
          <div style="background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3); padding: 6px 8px; border-radius: 6px; color: #bbf7d0;">
            🎯 <strong>Đặc Điểm Đương Số:</strong> ${b.tagHanhNien ? 'Hành niên (' + b.tagHanhNien + ') ' : ''} ${b.tagTrachMo ? '· ' + b.tagTrachMo : ''}
          </div>
        ` : ''}
      </div>
    `;

    drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
  }

  function closeDrawer() {
    const drawer = document.getElementById('lucnham-drawer');
    const overlay = document.getElementById('lucnham-drawer-overlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
  }

  // Export API
  global.LucNhamView = {
    init: initLucNhamView,
    render: (target) => {
      if (!currentChart) {
        initLucNhamView(target);
      } else {
        renderLucNham(target);
      }
    },
    setDate: (d, isMale = currentIsMale) => {
      currentDate = new Date(d);
      currentIsMale = isMale;
      renderLucNham();
    },
    selectPalace: selectPalace,
    closeDrawer: closeDrawer
  };
  global.NetaLucNhamView = global.LucNhamView;

})(typeof window !== 'undefined' ? window : this);
