/**
 * NETA LIGHT - TRẠCH CÁT VIEW MODULE (modules/trachcat_view.js)
 * Giao diện Xem Ngày Cát Lành Toàn Diện:
 * 1. Bách Trạch Thông Thư - Trạng Trình Nguyễn Bỉnh Khiêm (83 Mục việc, Thang 5 Bậc)
 * 2. Đổng Công Tuyển Trạch Yếu Dụng (12 Tháng, 423 Ngày)
 * 3. 16 Tiêu Chí Cát Thần (Tam Đại Cát Tinh, Lục Nhâm, Khổng Minh, Bành Tổ, Hỷ/Tài Thần)
 * 4. Kỳ Môn Dữ Trạch Cát (12 Giờ Hoàng Đạo xếp hạng 9 bậc cho Bản Mệnh, Cửu Tinh Khắc Ứng)
 * 5. Tọa Sơn La Kinh (Đồng Khí Vận 9, Tránh Xung Tọa Sơn & Tam Sát)
 */

(function (global) {
  'use strict';

  const pad = (n) => String(n).padStart(2, '0');

  const state = {
    viewMode: 'month', // 'month' (Tìm ngày tốt trong tháng - mặc định) | 'specific' (Thẩm định ngày giờ cụ thể)
    isLunarMode: false, // Thẩm định ngày giờ cụ thể: false (Dương lịch) | true (Âm lịch)
    monthIsLunar: false, // Tìm ngày tốt trong tháng: false (Tháng Dương) | true (Tháng Âm)
    taskId: 'CHUNG', // Việc Chung mặc định
    category: 'Tất cả',
    searchTerm: '',
    personYear: 1979,
    personCanChi: 'Kỷ Mùi',
    isMale: true,
    isDeathLunarMode: false, // Mặc định theo Dương lịch giống các module khác
    deathDate: new Date(),
    deathHour: 11,
    deathMinute: 30,
    deathHourChi: 'Ngọ',
    deathYear: (new Date()).getFullYear(),
    deathMonthLunar: 8,
    deathDayLunar: 15,
    selectedMonth: (new Date()).getMonth() + 1,
    selectedYear: (new Date()).getFullYear(),
    specificDate: new Date(),
    specificDateStr: '',
    specificHourChi: '',
    mountainSittingDeg: null,
    schools: {
      enable_trinh: true,
      enable_dong_cong: true,
      enable_folk_filter: true,
      enable_16_criteria: true,
      enable_xkdg: false,
      enable_qimen: false
    },
    results: null,
    specificResult: null
  };

  const CHI_HOURS = [
    { chi: 'Tý', label: 'Tý (23h - 01h)' },
    { chi: 'Sửu', label: 'Sửu (01h - 03h)' },
    { chi: 'Dần', label: 'Dần (03h - 05h)' },
    { chi: 'Mão', label: 'Mão (05h - 07h)' },
    { chi: 'Thìn', label: 'Thìn (07h - 09h)' },
    { chi: 'Tị', label: 'Tị (09h - 11h)' },
    { chi: 'Ngọ', label: 'Ngọ (11h - 13h)' },
    { chi: 'Mùi', label: 'Mùi (13h - 15h)' },
    { chi: 'Thân', label: 'Thân (15h - 17h)' },
    { chi: 'Dậu', label: 'Dậu (17h - 19h)' },
    { chi: 'Tuất', label: 'Tuất (19h - 21h)' },
    { chi: 'Hợi', label: 'Hợi (21h - 23h)' }
  ];

  function getChiFromHour(h) {
    const CHI_HOURS_MAP = ['Tý', 'Sửu', 'Sửu', 'Dần', 'Dần', 'Mão', 'Mão', 'Thìn', 'Thìn', 'Tị', 'Tị', 'Ngọ', 'Ngọ', 'Mùi', 'Mùi', 'Thân', 'Thân', 'Dậu', 'Dậu', 'Tuất', 'Tuất', 'Hợi', 'Hợi', 'Tý'];
    return CHI_HOURS_MAP[h] || 'Tý';
  }

  function syncDeathFromSolar() {
    const d = state.deathDate || new Date();
    if (global.NetaCalendarEngine && global.NetaCalendarEngine.solar2Lunar) {
      const lun = global.NetaCalendarEngine.solar2Lunar(d.getDate(), d.getMonth() + 1, d.getFullYear(), 7);
      if (lun) {
        state.deathDayLunar = lun.day;
        state.deathMonthLunar = lun.month;
        state.deathYear = lun.year;
      }
    } else {
      state.deathYear = d.getFullYear();
    }
    if (typeof state.deathHour === 'number') {
      state.deathHourChi = getChiFromHour(state.deathHour);
    }
  }

  function syncDeathFromLunar() {
    if (global.NetaCalendarEngine && global.NetaCalendarEngine.lunar2Solar) {
      const sol = global.NetaCalendarEngine.lunar2Solar(
        state.deathDayLunar || 1,
        state.deathMonthLunar || 1,
        state.deathYear || (new Date()).getFullYear(),
        false,
        7
      );
      if (sol) {
        state.deathDate = new Date(sol.year, sol.month - 1, sol.day, state.deathHour || 12, state.deathMinute || 0, 0);
      }
    }
    if (typeof state.deathHour === 'number') {
      state.deathHourChi = getChiFromHour(state.deathHour);
    }
  }


  const CORE_TASKS = [
    { id: 'CHUNG', name: 'Việc Chung', icon: '🌟', category: 'Tổng Quát', desc: 'Xem ngày giờ tốt cho mọi việc nói chung' },
    { id: 'MUC_05', name: 'Động Thổ', icon: '🏗️', category: 'Xây dựng', desc: 'Động đất, ban nền, đặt móng' },
    { id: 'MUC_04', name: 'Cất Nóc', icon: '🏠', category: 'Xây dựng', desc: 'Lợp nhà, che mái, làm nóc, đổ trần' },
    { id: 'MUC_15', name: 'Nhập Trạch', icon: '🏡', category: 'Nhà ở', desc: 'Về nhà mới, chuyển chỗ ở, an cư' },
    { id: 'MUC_37', name: 'Khai Trương', icon: '🏪', category: 'Giao thương', desc: 'Mở cửa hàng, khai trương, mở kho' },
    { id: 'MUC_22', name: 'Cưới Hỏi', icon: '💍', category: 'Hôn nhân', desc: 'Cưới gả, kết hôn, nạp thái' },
    { id: 'MUC_31', name: 'Xuất Hành', icon: '🚗', category: 'Đi lại', desc: 'Xuất hành, đi xa, đi buôn' },
    { id: 'MUC_28', name: 'An Táng', icon: '⚰️', category: 'Tang lễ', desc: 'An táng, chôn cất, hạ táng' }
  ];

  const SON_24_LIST = [
    { name: "Tý", deg: 0, dir: "Chính Bắc" },
    { name: "Quý", deg: 15, dir: "Bắc" },
    { name: "Sửu", deg: 30, dir: "Đông Bắc" },
    { name: "Cấn", deg: 45, dir: "Đông Bắc" },
    { name: "Dần", deg: 60, dir: "Đông Bắc" },
    { name: "Giáp", deg: 75, dir: "Đông" },
    { name: "Mão", deg: 90, dir: "Chính Đông" },
    { name: "Ất", deg: 105, dir: "Đông" },
    { name: "Thìn", deg: 120, dir: "Đông Nam" },
    { name: "Tốn", deg: 135, dir: "Đông Nam" },
    { name: "Tị", deg: 150, dir: "Đông Nam" },
    { name: "Bính", deg: 165, dir: "Nam" },
    { name: "Ngọ", deg: 180, dir: "Chính Nam" },
    { name: "Đinh", deg: 195, dir: "Nam" },
    { name: "Mùi", deg: 210, dir: "Tây Nam" },
    { name: "Khôn", deg: 225, dir: "Tây Nam" },
    { name: "Thân", deg: 240, dir: "Tây Nam" },
    { name: "Canh", deg: 255, dir: "Tây" },
    { name: "Dậu", deg: 270, dir: "Chính Tây" },
    { name: "Tân", deg: 285, dir: "Tây" },
    { name: "Tuất", deg: 300, dir: "Tây Bắc" },
    { name: "Càn", deg: 315, dir: "Tây Bắc" },
    { name: "Hợi", deg: 330, dir: "Tây Bắc" },
    { name: "Nhâm", deg: 345, dir: "Bắc" }
  ];

  function getLaKinhSittingDeg() {
    let heading = null;
    if (global.lakinhState) {
      heading = (global.lakinhState.rayAngle !== null && global.lakinhState.rayAngle !== undefined)
        ? global.lakinhState.rayAngle
        : (global.lakinhState.rotation || 0);
    } else {
      const saved = localStorage.getItem('neta_lakinh_sitting');
      if (saved) return parseFloat(saved);
    }
    if (heading != null) {
      return Math.round((((heading + 180) % 360 + 360) % 360) * 10) / 10;
    }
    return 0;
  }

  function renderTaskGuideHTML(taskId) {
    let title = '';
    let items = [];
    if (taskId === 'MUC_05') {
      title = 'Nguyên tắc Động Thổ';
      items = [
        'Chọn ngày có trực Thành, Khai; tránh trực Phá, Bế, Nguy.',
        'Hệ thống tự động lọc bỏ 3 ngày đại kỵ: Quý Mùi, Ất Mùi, Mậu Ngọ.',
        'Tránh động thổ phương vị Thái Tuế và Tam Sát.',
        'Phối hợp Tọa Sơn nhà qua nút "Lấy Tọa Từ La Kinh" để kiểm tra trực xung.'
      ];
    } else if (taskId === 'MUC_04') {
      title = 'Nguyên tắc Cất Nóc';
      items = [
        'Kỵ ngày Ngọ theo Bành Tổ ("Ngọ bất thiêm cái, ốc chủ cánh trương").',
        'Ưu tiên Trực Định, Thành, Khai; tránh sao Tinh, Quỷ, Liễu, Ngưu.',
        'Tránh ngày trực xung với Tọa Sơn ngôi nhà.'
      ];
    } else if (taskId === 'MUC_15') {
      title = 'Nguyên tắc Nhập Trạch';
      items = [
        'Ưu tiên ngày Trực Thành, Khai; tránh ngày trực xung bản mệnh gia chủ.',
        'Cung Sinh Môn Kỳ Môn không phạm Tuần Không, không khắc Can Ngày.'
      ];
    } else if (taskId === 'MUC_28') {
      title = 'Nguyên tắc An Táng';
      items = [
        'Tính theo tuổi Người Mất, tránh ngày trực xung Địa Chi bản mệnh.',
        'Tránh ngày Trùng Tang, Tam Tang, Sát Chủ Âm Phần.',
        'Hạn Kim Lâu và Hoang Ốc không áp dụng cho tang lễ.'
      ];
    } else if (taskId === 'MUC_22') {
      title = 'Nguyên tắc Cưới Hỏi';
      items = [
        'Tính Kim Lâu theo tuổi mụ Cô dâu (chọn Nữ).',
        'Ưu tiên ngày Bất Tương, Thiên Hỷ; tránh Tam Nương, Nguyệt Kỵ.'
      ];
    }
    if (!title) return '';

    return `
      <details class="tc-guide-collapse">
        <summary class="tc-guide-summary">
          <span>ℹ️ ${title}</span>
          <span class="tc-guide-arrow">▾</span>
        </summary>
        <ul class="tc-guide-list">
          ${items.map(it => `<li>${it}</li>`).join('')}
        </ul>
      </details>
    `;
  }

  const NAP_AM_MAP = {
    'Giáp Tý': 'Hải Trung Kim', 'Ất Sửu': 'Hải Trung Kim',
    'Bính Dần': 'Lư Trung Hỏa', 'Đinh Mão': 'Lư Trung Hỏa',
    'Mậu Thìn': 'Đại Lâm Mộc', 'Kỷ Tị': 'Đại Lâm Mộc',
    'Canh Ngọ': 'Lộ Bàng Thổ', 'Tân Mùi': 'Lộ Bàng Thổ',
    'Nhâm Thân': 'Kiếm Phong Kim', 'Quý Dậu': 'Kiếm Phong Kim',
    'Giáp Tuất': 'Sơn Đầu Hỏa', 'Ất Hợi': 'Sơn Đầu Hỏa',
    'Bính Tý': 'Giản Hạ Thủy', 'Đinh Sửu': 'Giản Hạ Thủy',
    'Mậu Dần': 'Thành Đầu Thổ', 'Kỷ Mão': 'Thành Đầu Thổ',
    'Canh Thìn': 'Bạch Lạp Kim', 'Tân Tị': 'Bạch Lạp Kim',
    'Nhâm Ngọ': 'Dương Liễu Mộc', 'Quý Mùi': 'Dương Liễu Mộc',
    'Giáp Thân': 'Tuyền Trung Thủy', 'Ất Dậu': 'Tuyền Trung Thủy',
    'Bính Tuất': 'Ốc Thượng Thổ', 'Đinh Hợi': 'Ốc Thượng Thổ',
    'Mậu Tý': 'Tích Lịch Hỏa', 'Kỷ Sửu': 'Tích Lịch Hỏa',
    'Canh Dần': 'Tùng Bách Mộc', 'Tân Mão': 'Tùng Bách Mộc',
    'Nhâm Thìn': 'Trường Lưu Thủy', 'Quý Tị': 'Trường Lưu Thủy',
    'Giáp Ngọ': 'Sa Trung Kim', 'Ất Mùi': 'Sa Trung Kim',
    'Bính Thân': 'Sơn Hạ Hỏa', 'Đinh Dậu': 'Sơn Hạ Hỏa',
    'Mậu Tuất': 'Bình Địa Mộc', 'Kỷ Hợi': 'Bình Địa Mộc',
    'Canh Tý': 'Bích Thượng Thổ', 'Tân Sửu': 'Bích Thượng Thổ',
    'Nhâm Dần': 'Kim Bạch Kim', 'Quý Mão': 'Kim Bạch Kim',
    'Giáp Thìn': 'Phúc Đăng Hỏa', 'Ất Tị': 'Phúc Đăng Hỏa',
    'Bính Ngọ': 'Thiên Hà Thủy', 'Đinh Mùi': 'Thiên Hà Thủy',
    'Mậu Thân': 'Đại Trạch Thổ', 'Kỷ Dậu': 'Đại Trạch Thổ',
    'Canh Tuất': 'Thoa Xuyến Kim', 'Tân Hợi': 'Thoa Xuyến Kim',
    'Nhâm Tý': 'Tang Đố Mộc', 'Quý Sửu': 'Tang Đố Mộc',
    'Giáp Dần': 'Đại Khê Thủy', 'Ất Mão': 'Đại Khê Thủy',
    'Bính Thìn': 'Sa Trung Thổ', 'Đinh Tị': 'Sa Trung Thổ',
    'Mậu Ngọ': 'Thiên Thượng Hỏa', 'Kỷ Mùi': 'Thiên Thượng Hỏa',
    'Canh Thân': 'Thạch Lựu Mộc', 'Tân Dậu': 'Thạch Lựu Mộc',
    'Nhâm Tuất': 'Đại Hải Thủy', 'Quý Hợi': 'Đại Hải Thủy'
  };

  const CATEGORIES = [
    'Tất cả',
    'Nhà ở',
    'Xây dựng',
    'Sửa chữa',
    'Hôn nhân',
    'Giao thương',
    'Đi lại',
    'Sự nghiệp',
    'Học vấn',
    'Tâm linh',
    'Tang lễ',
    'Y tế',
    'Nông nghiệp',
    'Chăn nuôi'
  ];

  function getEngine() {
    return global.NetaTrachNhatEngine || null;
  }

  function renderTrungTangSection() {
    const eng = getEngine();
    if (!eng || !eng.calculateTrungTang) return '';

    // Đảm bảo đồng bộ ngày âm/dương ban đầu
    if (!state.deathDayLunar || !state.deathMonthLunar || !state.deathYear) {
      syncDeathFromSolar();
    }

    const solDate = state.deathDate || new Date();
    const solY = solDate.getFullYear();
    const solM = solDate.getMonth() + 1;
    const solD = solDate.getDate();

    const curHourVal = typeof state.deathHour === 'number' ? state.deathHour : 12;
    const curMinVal = typeof state.deathMinute === 'number' ? state.deathMinute : 0;

    let displayDay = solD;
    let displayMonth = solM;
    let displayYear = solY;

    if (state.isDeathLunarMode) {
      displayDay = state.deathDayLunar || 15;
      displayMonth = state.deathMonthLunar || 8;
      displayYear = state.deathYear || solY;
    }

    const ttRes = eng.calculateTrungTang({
      birthYear: state.personYear,
      deathYear: state.deathYear || solY,
      deathMonthLunar: state.deathMonthLunar || 8,
      deathDayLunar: state.deathDayLunar || 15,
      deathHourChi: state.deathHourChi || 'Ngọ',
      isMale: state.isMale
    });

    if (!ttRes || !ttRes.is_applicable) {
      return `
        <div class="tc-trungtang-box">
          <div class="tc-trungtang-header">
            <div class="tc-trungtang-title">
              <span>⚰️ TRA CỨU TRÙNG TANG - NHẬP MỘ - THIÊN DI</span>
            </div>
          </div>
          <div style="font-size: 0.8rem; color: #94a3b8; padding: 10px;">
            ${ttRes ? ttRes.message : 'Dữ liệu tuổi không áp dụng (tuổi thọ tối thiểu từ 10 tuổi trở lên).'}
          </div>
        </div>
      `;
    }

    const { summary, pillars, counts, tuoi_tho, gender_text } = ttRes;

    let summaryStatusClass = 'tc-tt-summary-neutral';
    let summaryIcon = '☁️';
    if (summary.has_nhap_mo) {
      summaryStatusClass = 'tc-tt-summary-good';
      summaryIcon = '🌸';
    } else if (summary.is_severe) {
      summaryStatusClass = 'tc-tt-summary-severe';
      summaryIcon = '⚠️';
    } else if (counts.trung_tang > 0) {
      summaryStatusClass = 'tc-tt-summary-warn';
      summaryIcon = '⚠️';
    }

    return `
      <div class="tc-trungtang-box">
        <div class="tc-trungtang-header">
          <div class="tc-trungtang-title">
            <span>🕯️ TRA CỨU TRÙNG TANG - NHẬP MỘ - THIÊN DI (ÂM TRẠCH)</span>
          </div>
          <span class="tc-trungtang-sub">
            Căn cứ tuổi người mất (${gender_text}, sinh năm ${state.personYear}, hưởng thọ ${tuoi_tho} tuổi) &amp; 4 trụ thời điểm lâm chung.<br>
            <span style="display:inline-block; margin-top:4px; font-weight:600; color:var(--text-accent, #38bdf8);">
              ☀️ Dương: ${pad(solD)}/${pad(solM)}/${solY} ${pad(curHourVal)}:${pad(curMinVal)} ⇄ 🌙 Âm: Ngày ${pad(state.deathDayLunar)}/${pad(state.deathMonthLunar)}/${state.deathYear} (Giờ ${state.deathHourChi})
            </span>
          </span>
        </div>

        <!-- Bộ Chọn Ngày Giờ Mất Chuẩn Unified Control Card (Đồng bộ Kỳ Môn / Bát Tự) -->
        <div class="unified-ctrl-card" style="margin: 8px 0 12px 0;">
          <!-- Row 1: Calendar switch (Dương / Âm) + Date Box + ⚡Năm + 📅 Picker -->
          <div class="ucc-row ucc-row-date">
            <div class="ucc-pill-cal">
              <button type="button" class="ucc-pill-btn ${!state.isDeathLunarMode ? 'active' : ''}" id="btn-tt-solar" title="Xem theo Dương lịch">☀️ Dương</button>
              <button type="button" class="ucc-pill-btn ${state.isDeathLunarMode ? 'active' : ''}" id="btn-tt-lunar" title="Xem theo Âm lịch">🌙 Âm</button>
            </div>
            <div class="ucc-date-box" id="tt-ucc-date-box" title="Nhập ngày tháng mất hoặc chạm nút lịch để chọn">
              <input type="number" id="tt-input-day" class="num-box num-day" min="1" max="31" value="${displayDay}" placeholder="Ngày">
              <span class="num-slash">/</span>
              <input type="number" id="tt-input-month" class="num-box num-month" min="1" max="12" value="${displayMonth}" placeholder="Tháng">
              <span class="num-slash">/</span>
              <input type="number" id="tt-input-year" class="num-box num-year" min="1900" max="2100" value="${displayYear}" placeholder="Năm">
              <button type="button" class="ucc-btn-year" id="btn-tt-year-jumper" title="Chọn Thập niên & Năm siêu tốc">⚡Năm</button>
              <label class="btn-picker-cal" id="tt-btn-native-cal" title="Mở bảng chọn Ngày & Giờ">
                📅
                <input type="datetime-local" id="tt-date-picker" value="${solY}-${pad(solM)}-${pad(solD)}T${pad(curHourVal)}:${pad(curMinVal)}" class="native-hidden-date">
              </label>
            </div>
          </div>

          <!-- Row 2: Can Chi Giờ + Numeric Hour:Minute + ◀ 2h / 2h ▶ Step Buttons -->
          <div class="ucc-row ucc-row-time">
            <div class="ucc-time-box">
              <select id="tt-select-canchi" class="select-canchi">
                <option value="0" ${state.deathHourChi === 'Tý' ? 'selected' : ''}>Tý (23-01h)</option>
                <option value="2" ${state.deathHourChi === 'Sửu' ? 'selected' : ''}>Sửu (01-03h)</option>
                <option value="4" ${state.deathHourChi === 'Dần' ? 'selected' : ''}>Dần (03-05h)</option>
                <option value="6" ${state.deathHourChi === 'Mão' ? 'selected' : ''}>Mão (05-07h)</option>
                <option value="8" ${state.deathHourChi === 'Thìn' ? 'selected' : ''}>Thìn (07-09h)</option>
                <option value="10" ${['Tị', 'Tỵ'].includes(state.deathHourChi) ? 'selected' : ''}>Tị (09-11h)</option>
                <option value="12" ${state.deathHourChi === 'Ngọ' ? 'selected' : ''}>Ngọ (11-13h)</option>
                <option value="14" ${state.deathHourChi === 'Mùi' ? 'selected' : ''}>Mùi (13-15h)</option>
                <option value="16" ${state.deathHourChi === 'Thân' ? 'selected' : ''}>Thân (15-17h)</option>
                <option value="18" ${state.deathHourChi === 'Dậu' ? 'selected' : ''}>Dậu (17-19h)</option>
                <option value="20" ${state.deathHourChi === 'Tuất' ? 'selected' : ''}>Tuất (19-21h)</option>
                <option value="22" ${state.deathHourChi === 'Hợi' ? 'selected' : ''}>Hợi (21-23h)</option>
              </select>
              <div class="numeric-time-group" style="display:inline-flex; align-items:center;">
                <input type="number" id="tt-input-hour" class="num-box num-hour" min="0" max="23" value="${pad(curHourVal)}" placeholder="Giờ">
                <span class="num-colon">:</span>
                <input type="number" id="tt-input-minute" class="num-box num-min" min="0" max="59" value="${pad(curMinVal)}" placeholder="Phút">
              </div>
            </div>
            <div class="ucc-step-group">
              <button type="button" class="ucc-step-btn" id="btn-tt-prev-hour" title="Lùi 2 giờ (1 Canh)">◀ 2h</button>
              <button type="button" class="ucc-step-btn" id="btn-tt-next-hour" title="Tiến 2 giờ (1 Canh)">2h ▶</button>
            </div>
          </div>
        </div>

        <!-- Kết quả 4 Trụ: Năm - Tháng - Ngày - Giờ -->
        <div class="tc-tt-pillars-grid">
          ${[
            { key: 'nam', label: 'Trụ Năm', data: pillars.nam },
            { key: 'thang', label: 'Trụ Tháng', data: pillars.thang },
            { key: 'ngay', label: 'Trụ Ngày', data: pillars.ngay },
            { key: 'gio', label: 'Trụ Giờ', data: pillars.gio }
          ].map(p => `
            <div class="tc-tt-pillar-card ${p.data.nature}">
              <div class="tc-tt-pillar-head">
                <span class="tc-tt-pillar-label">${p.label}</span>
                <span class="tc-tt-pillar-chi">Cung ${p.data.chi}</span>
              </div>
              <div class="tc-tt-pillar-status ${p.data.badge_class}">
                <span>${p.data.icon}</span>
                <span>${p.data.type}</span>
              </div>
              <div class="tc-tt-pillar-meaning">${p.data.meaning}</div>
            </div>
          `).join('')}
        </div>

        <!-- Bảng Tổng Kết & Luận Giải Hóa Giải -->
        <div class="tc-tt-summary-card ${summaryStatusClass}">
          <div class="tc-tt-summary-head">
            <div class="tc-tt-summary-badge">
              <span class="tc-tt-sum-icon">${summaryIcon}</span>
              <span class="tc-tt-sum-title">${summary.title}</span>
            </div>
            <div class="tc-tt-counts-chips">
              <span class="tc-badge tc-badge-good">🌸 Nhập Mộ: ${counts.nhap_mo}</span>
              <span class="tc-badge tc-badge-info">☁️ Thiên Di: ${counts.thien_di}</span>
              <span class="tc-badge ${counts.trung_tang > 0 ? 'tc-badge-bad' : 'tc-badge-good'}">⚠️ Trùng Tang: ${counts.trung_tang}</span>
            </div>
          </div>

          <div class="tc-tt-summary-body">
            ${summary.desc}
          </div>

          <div class="tc-tt-rules-footer">
            <div class="tc-tt-rules-line">
              ⚖️ <strong>Quy luật bấm tay cổ nhân:</strong>
              ${gender_text === 'Nam' ? 'Nam khởi 10 tuổi tại Dần (đếm thuận chiều kim đồng hồ)' : 'Nữ khởi 10 tuổi tại Thân (đếm nghịch chiều kim đồng hồ)'} → Cung Năm → tiếp cung sau tính Tháng 1 → tiếp cung sau tính Ngày 1 → tiếp cung sau tính Giờ Tý.
            </div>
            <div class="tc-tt-rules-line">
              ✨ <strong>Khẩu quyết phong thủy:</strong> Tứ Sinh (Dần - Thân - Tị - Hợi) là <strong>Trùng Tang</strong> | Tứ Mộ (Thìn - Tuất - Sửu - Mùi) là <strong>Nhập Mộ</strong> (đại cát) | Tứ Chính (Tý - Ngọ - Mão - Dậu) là <strong>Thiên Di</strong> (bình hòa).
              <em>"Nhập Mộ thắng Trùng Tang"</em> — chỉ cần có 1 Nhập Mộ là vong linh an nghỉ, mồ yên mả đẹp.
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function initTrachCatView() {
    const container = document.getElementById('view-trachcat');
    if (!container) return;

    // Tự động nhận diện năm sinh và giới tính nếu có lưu trong localStorage (Mặc định 1979 Kỷ Mùi)
    try {
      const savedYear = localStorage.getItem('neta_user_birth_year');
      if (savedYear && /^\d{4}$/.test(savedYear) && savedYear !== '1990') {
        state.personYear = parseInt(savedYear, 10);
      } else {
        state.personYear = 1979;
        try { localStorage.setItem('neta_user_birth_year', '1979'); } catch (_) {}
      }
      const savedGender = localStorage.getItem('neta_user_gender');
      if (savedGender === 'female' || savedGender === '0' || savedGender === 'false') {
        state.isMale = false;
      } else if (savedGender === 'male' || savedGender === '1' || savedGender === 'true') {
        state.isMale = true;
      }
      const savedSitting = localStorage.getItem('neta_lakinh_sitting');
      if (savedSitting && !isNaN(parseFloat(savedSitting))) {
        state.mountainSittingDeg = parseFloat(savedSitting);
      }
    } catch (_) {}

    const now = new Date();
    state.specificDate = now;
    state.specificDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const curH = now.getHours();
    const CHI_HOURS_MAP = ['Tý', 'Sửu', 'Sửu', 'Dần', 'Dần', 'Mão', 'Mão', 'Thìn', 'Thìn', 'Tị', 'Tị', 'Ngọ', 'Ngọ', 'Mùi', 'Mùi', 'Thân', 'Thân', 'Dậu', 'Dậu', 'Tuất', 'Tuất', 'Hợi', 'Hợi', 'Tý'];
    state.specificHourChi = CHI_HOURS_MAP[curH] || 'Thìn';

    updatePersonInfo();
    runSpecificEvaluation();
    runEvaluation();
    render();
  }

  function updatePersonInfo() {
    const eng = getEngine();
    if (!eng) return;
    const pData = eng.resolvePersonCanChi(state.personYear);
    state.personCanChi = pData.canChi;
  }

  function runSpecificEvaluation() {
    const eng = getEngine();
    if (!eng || typeof eng.evaluateSpecificDateTime !== 'function') return;

    updatePersonInfo();

    let targetDate = state.specificDate || new Date();
    if (state.specificDateStr) {
      const parts = state.specificDateStr.split('-');
      if (parts.length === 3) {
        targetDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 12, 0, 0);
      }
    }

    state.specificResult = eng.evaluateSpecificDateTime({
      taskId: state.taskId,
      personYear: state.personYear,
      personCanChi: state.personCanChi,
      isMale: state.isMale,
      date: targetDate,
      hourChi: state.specificHourChi || null,
      mountainDeg: state.mountainSittingDeg,
      schoolConfig: {
        enable_trinh: state.schools.enable_trinh,
        enable_dong_cong: state.schools.enable_dong_cong,
        enable_folk_filter: state.schools.enable_folk_filter,
        enable_16_criteria: state.schools.enable_16_criteria,
        enable_xkdg: state.schools.enable_xkdg,
        enable_qimen: state.schools.enable_qimen,
        mountain_sitting_deg: state.mountainSittingDeg
      }
    });
  }

  function runEvaluation() {
    const eng = getEngine();
    if (!eng) return;

    updatePersonInfo();

    const y = state.selectedYear;
    const m = state.selectedMonth; // 1-12
    let startDate, endDate;

    if (state.monthIsLunar && global.NetaCalendarEngine && global.NetaCalendarEngine.lunar2Solar) {
      const s1 = global.NetaCalendarEngine.lunar2Solar(1, m, y, false, 7);
      const s2 = global.NetaCalendarEngine.lunar2Solar(30, m, y, false, 7) || global.NetaCalendarEngine.lunar2Solar(29, m, y, false, 7);
      if (s1 && s2) {
        startDate = new Date(s1.year, s1.month - 1, s1.day, 0, 0, 0);
        endDate = new Date(s2.year, s2.month - 1, s2.day, 23, 59, 59);
      } else {
        const daysInMonth = new Date(y, m, 0).getDate();
        startDate = new Date(y, m - 1, 1);
        endDate = new Date(y, m - 1, daysInMonth);
      }
    } else {
      const daysInMonth = new Date(y, m, 0).getDate();
      startDate = new Date(y, m - 1, 1);
      endDate = new Date(y, m - 1, daysInMonth);
    }

    state.results = eng.evaluatePeriod({
      taskId: state.taskId,
      personYear: state.personYear,
      personCanChi: state.personCanChi,
      isMale: state.isMale,
      startDate: startDate,
      endDate: endDate,
      schoolConfig: {
        enable_trinh: state.schools.enable_trinh,
        enable_dong_cong: state.schools.enable_dong_cong,
        enable_folk_filter: state.schools.enable_folk_filter,
        enable_16_criteria: state.schools.enable_16_criteria,
        enable_xkdg: state.schools.enable_xkdg,
        enable_qimen: state.schools.enable_qimen,
        mountain_sitting_deg: state.mountainSittingDeg
      }
    });
  }

  function renderGiaChuStripHTML(isFuneral, isMarriage, isBuilding, isGeneral, yearSuit, cungPhi, napAm) {
    const personLabel = isFuneral ? 'Vong' : (isMarriage ? 'Tuổi dâu' : 'Gia chủ');
    const ageNum = yearSuit ? yearSuit.age_lunar : '';
    const ageText = ageNum ? `${ageNum}t` : '';

    return `
      <div class="tc-gc-compact-strip">
        <div class="tc-gc-row-top">
          <div class="tc-gc-left">
            <span class="tc-gc-label">${personLabel}:</span>
            <input type="number" id="tc-input-year" class="tc-gc-input-year" min="1920" max="2050" value="${state.personYear}">
            <span class="tc-gc-tag tc-tag-canchi">${state.personCanChi}${ageText ? ` (${ageText})` : ''}</span>
          </div>
          <div class="ucc-pill-gender tc-mini-gender">
            <button type="button" class="ucc-gender-btn ${state.isMale ? 'active male' : ''}" id="tc-btn-male">Nam</button>
            <button type="button" class="ucc-gender-btn ${!state.isMale ? 'active female' : ''}" id="tc-btn-female">Nữ</button>
          </div>
        </div>
        <div class="tc-gc-row-meta">
          ${napAm ? `<span class="tc-gc-tag tc-tag-napam">${napAm}</span>` : ''}
          ${cungPhi ? `<span class="tc-gc-tag tc-tag-cung">${cungPhi.symbol || ''} Cung ${cungPhi.name} (${cungPhi.group})</span>` : ''}
          ${isBuilding && yearSuit && yearSuit.tam_tai.is_tam_tai ? `<span class="tc-gc-tag tc-tag-bad">Tam Tai</span>` : ''}
          ${isBuilding && yearSuit && yearSuit.kim_lau.is_kim_lau ? `<span class="tc-gc-tag tc-tag-bad">Kim Lâu</span>` : ''}
        </div>
      </div>
    `;
  }

  function renderSpecificModeHTML() {
    const eng = getEngine();
    if (!eng) return '';

    const tasks = eng.tasks || [];
    const filteredTasks = tasks.filter(t => {
      const matchCat = (state.category === 'Tất cả') || (t.category === state.category);
      const matchSearch = (!state.searchTerm) || (t.name.toLowerCase().includes(state.searchTerm.toLowerCase()) || String(t.number).includes(state.searchTerm));
      return matchCat && matchSearch;
    });

    const isGeneral = (state.taskId === 'CHUNG');
    const task = isGeneral ? { id: 'CHUNG', name: 'Việc Chung / Bách Sự', category: 'Tổng Quát' } : (tasks.find(t => t.id === state.taskId) || tasks[0]);
    const taskCat = (task && task.category) || state.category || '';
    const isFuneral = taskCat === 'Tang lễ' || ['MUC_28', 'MUC_29', 'MUC_30'].includes(state.taskId);
    const isMarriage = taskCat === 'Hôn nhân' || ['MUC_22', 'MUC_23'].includes(state.taskId);
    const isBuilding = ['Xây dựng', 'Nhà ở', 'Sửa chữa'].includes(taskCat) || ['MUC_04', 'MUC_05', 'MUC_15'].includes(state.taskId);

    const yearSuit = eng.evaluateYearSuitability(state.personYear, (new Date()).getFullYear(), null, state.isMale, isMarriage);
    const cungPhi = (yearSuit && yearSuit.cung_phi) || (eng.calculateCungPhi ? eng.calculateCungPhi(state.personYear, state.isMale) : null);
    const napAm = NAP_AM_MAP[state.personCanChi] || '';
    const batTrach = (state.mountainSittingDeg != null && eng.calculateBatTrach && cungPhi)
      ? eng.calculateBatTrach(cungPhi.number, state.mountainSittingDeg)
      : null;

    let targetDate = state.specificDate || new Date();
    if (state.specificDateStr) {
      const parts = state.specificDateStr.split('-');
      if (parts.length === 3) {
        targetDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 12, 0, 0);
      }
    }
    const curYear = targetDate.getFullYear();
    const curMonth = targetDate.getMonth() + 1;
    const curDay = targetDate.getDate();

    let displayDay = curDay;
    let displayMonth = curMonth;
    let displayYear = curYear;

    if (state.isLunarMode && global.NetaCalendarEngine && global.NetaCalendarEngine.solar2Lunar) {
      const lunar = global.NetaCalendarEngine.solar2Lunar(curDay, curMonth, curYear);
      if (lunar) {
        displayDay = lunar.day;
        displayMonth = lunar.month;
        displayYear = lunar.year;
      }
    }

    const curDateStr = `${curYear}-${pad(curMonth)}-${pad(curDay)}`;
    const curH = targetDate.getHours() || 12;

    return `
      <!-- PHẦN 1: BỘ TIÊU CHÍ VÀ CẤU HÌNH (SETUP PANEL Ở TRÊN CÙNG) -->
      <div class="tc-panel tc-compact-panel tc-setup-box">
        <!-- 1. Hàng chọn việc nhanh -->
        <div class="tc-quick-tasks-section">
          <div class="tc-quick-tasks-bar">
            ${CORE_TASKS.map(ct => `
              <div class="tc-quick-pill ${state.taskId === ct.id ? 'active' : ''}" data-task-id="${ct.id}" data-cat="${ct.category}" title="${ct.desc}">
                <span class="tc-quick-pill-icon">${ct.icon}</span>
                <span>${ct.name}</span>
              </div>
            `).join('')}
            <div class="tc-quick-pill ${!CORE_TASKS.some(ct => ct.id === state.taskId) ? 'active' : ''}" data-action="all-tasks" title="Xem toàn bộ 83 mục việc Trạng Trình">
              <span class="tc-quick-pill-icon">📜</span>
              <span>83 Việc...</span>
            </div>
          </div>
        </div>

        <!-- Hướng dẫn mục việc (Rút gọn) -->
        ${renderTaskGuideHTML(state.taskId)}

        <!-- Thanh tìm kiếm 83 việc (Chỉ hiện khi tìm 83 việc) -->
        <div class="tc-task-selector-row" style="${state.taskId === 'CHUNG' ? 'display:none;' : ''}">
          <input type="text" id="tc-search-task-spec" class="tc-search-input" placeholder="🔍 Tìm mục việc (VD: Động thổ, Cất nóc...)" value="${state.searchTerm}">
          <select id="tc-select-task-spec" class="tc-select">
            <option value="CHUNG" ${state.taskId === 'CHUNG' ? 'selected' : ''}>[🌟] Việc Chung / Bách Sự</option>
            ${filteredTasks.map(t => `
              <option value="${t.id}" ${state.taskId === t.id ? 'selected' : ''}>[${t.number}] ${t.name} (${t.category})</option>
            `).join('')}
          </select>
        </div>

        <!-- 2. Chọn Ngày và Khung Giờ Cụ Thể (Chuẩn Unified Control Card của App) -->
        <div class="unified-ctrl-card">
          <!-- Row 1: Lịch Dương/Âm + Ô nhập Ngày / Tháng / Năm + ⚡Năm + 📅 Picker -->
          <div class="ucc-row ucc-row-date">
            <div class="ucc-pill-cal">
              <button type="button" class="ucc-pill-btn ${!state.isLunarMode ? 'active' : ''}" id="tc-btn-solar" title="Xem theo Dương lịch">☀️ Dương</button>
              <button type="button" class="ucc-pill-btn ${state.isLunarMode ? 'active' : ''}" id="tc-btn-lunar" title="Xem theo Âm lịch">🌙 Âm</button>
            </div>
            <div class="ucc-date-box" id="tc-ucc-date-box" title="Nhập ngày tháng hoặc chạm nút lịch để chọn">
              <input type="number" id="tc-input-day" class="num-box num-day" min="1" max="31" value="${displayDay}" placeholder="Ngày">
              <span class="num-slash">/</span>
              <input type="number" id="tc-input-month" class="num-box num-month" min="1" max="12" value="${displayMonth}" placeholder="Tháng">
              <span class="num-slash">/</span>
              <input type="number" id="tc-input-year-date" class="num-box num-year" min="1900" max="2100" value="${displayYear}" placeholder="Năm">
              <button type="button" class="ucc-btn-year" id="tc-btn-quick-year" title="Chọn Thập niên & Năm siêu tốc">⚡Năm</button>
              <label class="btn-picker-cal" id="tc-btn-native-cal" title="Mở bảng chọn Ngày & Giờ">
                📅
                <input type="datetime-local" id="tc-date-picker" value="${curDateStr}T${pad(curH)}:00" class="native-hidden-date">
              </label>
            </div>
          </div>

          <!-- Row 2: Can Chi Giờ + Quick Chips (Nay, Mai, Giờ này) -->
          <div class="ucc-row ucc-row-time">
            <div class="ucc-time-box" style="flex: 1 1 auto; min-width: 0;">
              <select id="tc-select-specific-hour" class="select-canchi" style="width: 100%; border: none; background: transparent; outline: none; font-size: 0.78rem; font-weight: 700; cursor: pointer;">
                <option value="">-- Tự chọn Giờ Hoàng Đạo tốt nhất --</option>
                ${CHI_HOURS.map(h => `
                  <option value="${h.chi}" ${state.specificHourChi === h.chi ? 'selected' : ''}>
                    Giờ ${h.label}
                  </option>
                `).join('')}
              </select>
            </div>
            <div class="tc-dt-chips" style="flex-shrink: 0; display: flex; gap: 3px;">
              <button type="button" class="tc-micro-chip" id="tc-btn-today" title="Hôm nay">Nay</button>
              <button type="button" class="tc-micro-chip" id="tc-btn-tomorrow" title="Ngày mai">Mai</button>
              <button type="button" class="tc-micro-chip" id="tc-btn-cur-hour" title="Khung giờ hiện tại">Giờ này</button>
            </div>
          </div>
        </div>

        <!-- 3. Khung Thông Tin Gia Chủ (Đúng 2 dòng chuẩn chỉ) -->
        ${renderGiaChuStripHTML(isFuneral, isMarriage, isBuilding, isGeneral, yearSuit, cungPhi, napAm)}

        <!-- 4. Tiêu chí nâng cao (Gấp gọn trong Drawer) -->
        <details class="tc-advanced-drawer">
          <summary class="tc-advanced-summary">
            <span>⚙️ Tiêu chí nâng cao (Tọa Sơn, 6 Trường Phái)</span>
            <span class="tc-advanced-arrow">▾</span>
          </summary>
          <div class="tc-advanced-body">
            <!-- Tọa Sơn Nhà & Liên kết La Kinh -->
            <div class="tc-field" style="margin-bottom: 8px;">
              <label class="tc-label">${isFuneral ? 'Tọa Sơn Mộ Phần' : (isBuilding ? 'Tọa Sơn Nhà / Công Trình' : 'Tọa Sơn Hướng Vị')}</label>
              <div class="tc-lakinh-bridge-row">
                <button type="button" class="tc-btn-get-lakinh" id="tc-btn-get-lakinh" title="Đọc độ số Tọa Sơn từ đĩa La Kinh Vệ Tinh">
                  🧭 Lấy Tọa Từ La Kinh
                </button>
                <select id="tc-select-24son" class="tc-select-24son">
                  <option value="">-- Chọn 24 Sơn Vị --</option>
                  ${SON_24_LIST.map(s => `
                    <option value="${s.deg}" ${state.mountainSittingDeg != null && Math.abs(state.mountainSittingDeg - s.deg) < 7.5 ? 'selected' : ''}>
                      Sơn ${s.name} (${s.deg}° - ${s.dir})
                    </option>
                  `).join('')}
                </select>
              </div>
              <div class="tc-input-row" style="margin-top: 4px;">
                <input type="number" id="tc-input-deg" class="tc-input" min="0" max="359.9" step="0.1" placeholder="Nhập độ số (0° - 359°)..." value="${state.mountainSittingDeg != null ? state.mountainSittingDeg : ''}">
                <button type="button" class="tc-badge tc-badge-warn" id="tc-btn-clear-deg" style="cursor: pointer;">✕ Xóa</button>
              </div>
            </div>
            <!-- Toggles 6 trường phái -->
            <div class="tc-toggles-row">
              <label class="tc-toggle-label">
                <input type="checkbox" id="tc-chk-trinh" ${state.schools.enable_trinh ? 'checked' : ''}> Trạng Trình (83 việc)
              </label>
              <label class="tc-toggle-label">
                <input type="checkbox" id="tc-chk-dongcong" ${state.schools.enable_dong_cong ? 'checked' : ''}> Đổng Công Tuyển Trạch
              </label>
              <label class="tc-toggle-label">
                <input type="checkbox" id="tc-chk-folk" ${state.schools.enable_folk_filter ? 'checked' : ''}> Lọc Sát Dân Gian
              </label>
              <label class="tc-toggle-label">
                <input type="checkbox" id="tc-chk-tc16" ${state.schools.enable_16_criteria ? 'checked' : ''}> 16 Tiêu Chí Cát Thần
              </label>
              <label class="tc-toggle-label">
                <input type="checkbox" id="tc-chk-xkdg" ${state.schools.enable_xkdg ? 'checked' : ''}> ☯ Huyền Không Đại Quái
              </label>
              <label class="tc-toggle-label">
                <input type="checkbox" id="tc-chk-qimen" ${state.schools.enable_qimen ? 'checked' : ''}> 🔮 Kỳ Môn Chiến Lược
              </label>
            </div>
          </div>
        </details>

        <!-- Trùng Tang (nếu có) -->
        ${isFuneral ? renderTrungTangSection() : ''}

        <!-- Nút Tra Cứu Thẩm Định Tinh Gọn -->
        <div class="tc-search-btn-wrap">
          <button type="button" id="tc-btn-run-specific" class="tc-btn-search">
            <span class="tc-btn-icon">⚡</span>
            <span>Thẩm Định Ngày Giờ Này</span>
          </button>
        </div>
      </div>

      <!-- PHẦN 2: KHU VỰC KẾT QUẢ THẨM ĐỊNH (HOÀN TOÀN Ở PHÍA DƯỚI) -->
      <div class="tc-results-section">
        ${renderSpecificResultHTML()}
      </div>
    `;
  }

  function renderSpecificResultHTML() {
    const res = state.specificResult;
    if (!res) {
      return `
        <div class="tc-panel tc-empty">
          <div class="tc-empty-icon">🔍</div>
          <h3>Chưa có dữ liệu thẩm định</h3>
          <p>Chọn ngày, giờ và mục việc, sau đó nhấn "Thẩm Định Ngày Giờ Này".</p>
        </div>
      `;
    }

    const curHour = res.selected_hour;

    return `
      <!-- Thẻ Kết Luận Hero -->
      <div class="tc-spec-hero ${res.verdict_badge}">
        <div class="tc-spec-hero-header">
          <div class="tc-spec-hero-top-row">
            <div class="tc-spec-hero-title">${res.verdict_title}</div>
            <div class="tc-spec-score-badge">${res.score}/100đ</div>
          </div>
          <div class="tc-spec-hero-meta">
            📅 Ngày ${res.solar_date} (Âm: ${res.lunar_date} - ${res.can_chi_day}) • ⏰ Giờ ${curHour ? curHour.hour_chi + ' (' + curHour.solar_time_range + ')' : 'Hoàng Đạo'} • 🎯 Việc: <strong>${res.task.name}</strong>
          </div>
        </div>

        <div class="tc-spec-desc">
          💡 <strong>Kết luận:</strong> ${res.verdict_desc}
        </div>

        ${res.warnings && res.warnings.length > 0 ? `
          <div class="tc-spec-warnings">
            ${res.warnings.map(w => `<span class="tc-spec-warning-chip">⚠️ ${w}</span>`).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Bảng Đối Soát 2 Cột: Cát Hung Ngày vs Giờ -->
      <div class="tc-spec-breakdown">
        <!-- Cột Ngày -->
        <div class="tc-diag-card">
          <div class="tc-diag-header">
            <span>📅 CÁT HUNG CỦA NGÀY</span>
            <span class="tc-badge tc-badge-info">${res.can_chi_day}</span>
          </div>
          <div class="tc-diag-list">
            <div class="tc-diag-item">
              <span class="tc-diag-item-lbl">Dương lịch:</span>
              <span class="tc-diag-item-val">${res.solar_date}</span>
            </div>
            <div class="tc-diag-item">
              <span class="tc-diag-item-lbl">Âm lịch:</span>
              <span class="tc-diag-item-val">${res.lunar_date}</span>
            </div>
            <div class="tc-diag-item">
              <span class="tc-diag-item-lbl">Thập Nhị Trực:</span>
              <span class="tc-diag-item-val">Trực ${res.truc_name}</span>
            </div>
            <div class="tc-diag-item">
              <span class="tc-diag-item-lbl">Nhị Thập Bát Tú:</span>
              <span class="tc-diag-item-val">Sao ${res.sao_name}</span>
            </div>
            <div class="tc-diag-item">
              <span class="tc-diag-item-lbl">Tiết khí:</span>
              <span class="tc-diag-item-val">${res.tiet_khi || 'Bình thường'}</span>
            </div>
            <div class="tc-diag-item">
              <span class="tc-diag-item-lbl">Đổng Công:</span>
              <span class="tc-diag-item-val ${res.dong_cong && (res.dong_cong.rating === 'Đại Kiết' || res.dong_cong.rating === 'Thứ Kiết') ? 'tc-val-good' : (res.dong_cong && res.dong_cong.rating === 'Đại Hung' ? 'tc-val-bad' : 'tc-val-warn')}">
                ${res.dong_cong ? res.dong_cong.rating : 'Bình'}
              </span>
            </div>
            <div class="tc-diag-item">
              <span class="tc-diag-item-lbl">Lục Nhâm:</span>
              <span class="tc-diag-item-val">${res.tc16 && res.tc16.luc_nham ? res.tc16.luc_nham.cung : 'Bình'}</span>
            </div>
            <div class="tc-diag-item">
              <span class="tc-diag-item-lbl">Khổng Minh:</span>
              <span class="tc-diag-item-val">${res.tc16 && res.tc16.khong_minh ? res.tc16.khong_minh.name : 'Bình'}</span>
            </div>
            ${res.tc16 && res.tc16.banh_to_ky ? `
              <div class="tc-diag-item">
                <span class="tc-diag-item-lbl">Bành Tổ:</span>
                <span class="tc-diag-item-val tc-val-bad" style="font-size: 0.74rem;">${res.tc16.banh_to_ky}</span>
              </div>
            ` : ''}
            <div class="tc-diag-item">
              <span class="tc-diag-item-lbl">Hỷ Thần / Tài Thần:</span>
              <span class="tc-diag-item-val">Hỷ: ${res.tc16 ? res.tc16.huong_xuat_hanh.hy_than : ''} • Tài: ${res.tc16 ? res.tc16.huong_xuat_hanh.tai_than : ''}</span>
            </div>
          </div>
        </div>

        <!-- Cột Giờ -->
        <div class="tc-diag-card">
          <div class="tc-diag-header">
            <span>⏰ CÁT HUNG CỦA GIỜ</span>
            <span class="tc-badge ${curHour && curHour.is_hoang_dao ? 'tc-badge-good' : 'tc-badge-warn'}">
              ${curHour ? (curHour.is_hoang_dao ? '🌟 Hoàng Đạo' : '⚠️ Hắc Đạo') : ''}
            </span>
          </div>
          <div class="tc-diag-list">
            <div class="tc-diag-item">
              <span class="tc-diag-item-lbl">Khung giờ:</span>
              <span class="tc-diag-item-val">${curHour ? curHour.solar_time_range : ''}</span>
            </div>
            <div class="tc-diag-item">
              <span class="tc-diag-item-lbl">Can Chi giờ:</span>
              <span class="tc-diag-item-val">${curHour ? curHour.hour_can_chi : ''}</span>
            </div>
            <div class="tc-diag-item">
              <span class="tc-diag-item-lbl">Thần sát:</span>
              <span class="tc-diag-item-val">${curHour ? curHour.spirit_name + ' (' + curHour.spirit_nature + ')' : ''}</span>
            </div>
            <div class="tc-diag-item">
              <span class="tc-diag-item-lbl">Ý nghĩa thần sát:</span>
              <span class="tc-diag-item-val" style="font-size: 0.74rem;">${curHour ? curHour.spirit_meaning : ''}</span>
            </div>
            <div class="tc-diag-item">
              <span class="tc-diag-item-lbl">9 Bậc Trạng Trình:</span>
              <span class="tc-diag-item-val ${curHour && curHour.rank <= 2 ? 'tc-val-good' : (curHour && curHour.rank >= 7 ? 'tc-val-bad' : 'tc-val-warn')}">
                ${curHour ? curHour.recommendation : ''}
              </span>
            </div>
            <div class="tc-diag-item">
              <span class="tc-diag-item-lbl">Ngũ Bất Ngộ Thời:</span>
              <span class="tc-diag-item-val ${curHour && curHour.is_five_disharmony ? 'tc-val-bad' : 'tc-val-good'}">
                ${curHour && curHour.is_five_disharmony ? '⚠️ Phạm Thất Sát' : '✓ Không phạm'}
              </span>
            </div>
            <div class="tc-diag-item">
              <span class="tc-diag-item-lbl">Xung tuổi gia chủ:</span>
              <span class="tc-diag-item-val" style="color: ${curHour && curHour.is_xung_person_chi ? '#ef4444' : '#10b981'};">
                ${curHour && curHour.is_xung_person_chi ? '⚠️ Trực xung chi tuổi' : '✓ Hợp tuổi'}
              </span>
            </div>
            ${curHour && curHour.star_khac_ung ? `
              <div class="tc-diag-item">
                <span class="tc-diag-item-lbl">Cửu Tinh Khắc Ứng:</span>
                <span class="tc-diag-item-val" style="font-size: 0.73rem;">${curHour.star_khac_ung.sign}</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Thẻ Điểm Cộng & Điểm Trừ -->
      <div class="tc-pros-cons-grid">
        <div class="tc-pros-card">
          <div class="tc-pc-title">🟢 YẾU TỐ CÁT LỢI (${res.pros.length})</div>
          <ul class="tc-pc-list">
            ${res.pros.length > 0 ? res.pros.map(p => `<li>${p}</li>`).join('') : '<li>Không có yếu tố cát tinh nổi trội.</li>'}
          </ul>
        </div>
        <div class="tc-cons-card">
          <div class="tc-pc-title">🔴 HẠN KỴ &amp; XUNG SÁT (${res.cons.length})</div>
          <ul class="tc-pc-list">
            ${res.cons.length > 0 ? res.cons.map(c => `<li>${c}</li>`).join('') : '<li>✓ Không phạm hạn kỵ nghiêm trọng.</li>'}
          </ul>
        </div>
      </div>

      <!-- Đổng Công Toàn Văn Thuyết Minh -->
      ${res.dong_cong ? `
        <div class="tc-dongcong-box" style="margin-top: 10px;">
          <div class="tc-dongcong-header">
            <span>📜 ĐỔNG CÔNG TUYỂN TRẠCH: ${res.dong_cong.rating}</span>
            <span>${res.dong_cong.summary || res.dong_cong.nghi_ki || ''}</span>
          </div>
          <div>${res.dong_cong.evaluation}</div>
        </div>
      ` : ''}

      <!-- Giờ Hoàng Đạo Tốt Nhất Trong Ngày -->
      <div class="tc-hours-section" style="margin-top: 10px;">
        <div class="tc-hours-title">
          <span>✨ CÁC KHUNG GIỜ HOÀNG ĐẠO TỐT NHẤT TRONG NGÀY ${res.solar_date}</span>
          <span class="tc-hours-subtitle">Ưu tiên Bậc 1 (Lộc Tinh) & Bậc 2 (Quý Nhân)</span>
        </div>
        <div class="tc-alt-grid">
          ${(res.all_12_hours || []).filter(h => h.is_hoang_dao).map(h => `
            <div class="tc-alt-card ${curHour && curHour.hour_chi === h.hour_chi ? 'selected' : ''}">
              <div class="tc-alt-name">Giờ ${h.hour_chi}</div>
              <div class="tc-alt-time">${h.solar_time_range}</div>
              <div class="tc-alt-rank">Bậc ${h.rank} • ${h.spirit_name}</div>
              ${curHour && curHour.hour_chi === h.hour_chi ? `
                <span class="tc-badge tc-badge-good" style="margin-top: 4px; font-size: 0.68rem;">✓ Đang chọn</span>
              ` : `
                <button type="button" class="tc-btn-choose-hour" data-hour="${h.hour_chi}">Chọn Giờ Này</button>
              `}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Gợi ý Ngày Cát Gần Nhất (nếu ngày hiện tại điểm thấp < 65) -->
      ${res.nearby_better_days && res.nearby_better_days.length > 0 ? `
        <div class="tc-panel tc-nearby-panel" style="margin-top: 10px;">
          <div class="tc-panel-title tc-nearby-title">
            <span>💡 GỢI Ý NGÀY ĐẠI CÁT GẦN NHẤT THAY THẾ</span>
          </div>
          <div class="tc-nearby-sub">
            Vì ngày ${res.solar_date} chưa đạt chuẩn tối ưu (${res.score}đ), bạn có thể cân nhắc đổi sang các ngày tốt tiếp theo sau:
          </div>
          <div class="tc-nearby-grid">
            ${res.nearby_better_days.map(nb => `
              <div class="tc-nearby-card">
                <div class="tc-nearby-info">
                  <span class="tc-nearby-date">📅 ${nb.solar_date} (${nb.total_score}đ)</span>
                  <span class="tc-nearby-canchi">Âm: ${nb.lunar_date} • ${nb.can_chi_day} (Trực ${nb.truc_name})</span>
                  <span class="tc-nearby-best-hour">Giờ tốt: Giờ ${nb.best_hour ? nb.best_hour.hour_chi : 'Hoàng Đạo'}</span>
                </div>
                <button type="button" class="tc-btn-switch-day" data-date="${nb.solar_date}">
                  Chuyển Sang
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Nút hành động liên kết -->
      <div class="tc-card-actions" style="margin-top: 12px;">
        <button type="button" class="tc-btn-action tc-btn-cal" data-action="cal" data-date="${res.solar_date}">
          📅 Xem Lịch Ngày Này
        </button>
        <button type="button" class="tc-btn-action tc-btn-qmdj" data-action="qmdj" data-date="${res.solar_date}" data-hour="${curHour ? curHour.hour_chi : 'Tý'}">
          🔮 Lập Kỳ Môn Giờ ${curHour ? curHour.hour_chi : 'Này'}
        </button>
      </div>
    `;
  }

  function renderMonthModeHTML() {
    const eng = getEngine();
    if (!eng) return '';

    const tasks = eng.tasks || [];
    const filteredTasks = tasks.filter(t => {
      const matchCat = (state.category === 'Tất cả') || (t.category === state.category);
      const matchSearch = (!state.searchTerm) || (t.name.toLowerCase().includes(state.searchTerm.toLowerCase()) || String(t.number).includes(state.searchTerm));
      return matchCat && matchSearch;
    });

    const isGeneral = (state.taskId === 'CHUNG');
    const task = isGeneral ? { id: 'CHUNG', name: 'Việc Chung / Bách Sự', category: 'Tổng Quát' } : (tasks.find(t => t.id === state.taskId) || tasks[0]);
    const taskCat = (task && task.category) || state.category || '';
    const isFuneral = taskCat === 'Tang lễ' || ['MUC_28', 'MUC_29', 'MUC_30'].includes(state.taskId);
    const isMarriage = taskCat === 'Hôn nhân' || ['MUC_22', 'MUC_23'].includes(state.taskId);
    const isBuilding = ['Xây dựng', 'Nhà ở', 'Sửa chữa'].includes(taskCat) || ['MUC_04', 'MUC_05', 'MUC_15'].includes(state.taskId);

    const yearSuit = state.results ? state.results.year_suitability : eng.evaluateYearSuitability(state.personYear, state.selectedYear, null, state.isMale, isMarriage);
    const cungPhi = (yearSuit && yearSuit.cung_phi) || (eng.calculateCungPhi ? eng.calculateCungPhi(state.personYear, state.isMale) : null);
    const napAm = NAP_AM_MAP[state.personCanChi] || '';
    const batTrach = (state.mountainSittingDeg != null && eng.calculateBatTrach && cungPhi)
      ? eng.calculateBatTrach(cungPhi.number, state.mountainSittingDeg)
      : null;

    const ageText = isFuneral
      ? `Tuổi: ${state.personCanChi} (Hưởng thọ ${yearSuit ? yearSuit.age_lunar : ''} tuổi)`
      : `Tuổi: ${state.personCanChi} (${yearSuit ? yearSuit.age_lunar : ''} tuổi mụ)`;

    const personChi = (state.personCanChi.split(' ')[1]) || '';

    return `
      <!-- 1. Bộ lọc công việc & Gia chủ gọn gàng, tinh tế -->
      <div class="tc-panel tc-compact-panel">
        <!-- Hàng chọn việc nhanh (Horizontal Scrollable) -->
        <div class="tc-quick-tasks-section">
          <div class="tc-quick-tasks-bar">
            ${CORE_TASKS.map(ct => `
              <div class="tc-quick-pill ${state.taskId === ct.id ? 'active' : ''}" data-task-id="${ct.id}" data-cat="${ct.category}" title="${ct.desc}">
                <span class="tc-quick-pill-icon">${ct.icon}</span>
                <span>${ct.name}</span>
              </div>
            `).join('')}
            <div class="tc-quick-pill ${!CORE_TASKS.some(ct => ct.id === state.taskId) ? 'active' : ''}" data-action="all-tasks" title="Xem toàn bộ 83 mục việc Trạng Trình">
              <span class="tc-quick-pill-icon">📜</span>
              <span>83 Việc...</span>
            </div>
          </div>
        </div>

        <!-- Hướng dẫn mục việc (Rút gọn) -->
        ${renderTaskGuideHTML(state.taskId)}

        <!-- Thanh tìm kiếm 83 việc (ẩn khi là Việc Chung) -->
        <div class="tc-task-selector-row" style="${state.taskId === 'CHUNG' ? 'display:none;' : ''}">
          <input type="text" id="tc-search-task" class="tc-search-input" placeholder="🔍 Tìm nhanh 83 mục việc..." value="${state.searchTerm}">
          <select id="tc-select-task" class="tc-select">
            <option value="CHUNG" ${state.taskId === 'CHUNG' ? 'selected' : ''}>[🌟] Việc Chung / Bách Sự</option>
            ${filteredTasks.map(t => `
              <option value="${t.id}" ${state.taskId === t.id ? 'selected' : ''}>[${t.number}] ${t.name} (${t.category})</option>
            `).join('')}
          </select>
        </div>

        <!-- 2. Khung Gia Chủ Tinh Gọn (Đúng 2 dòng chuẩn chỉ) -->
        ${renderGiaChuStripHTML(isFuneral, isMarriage, isBuilding, isGeneral, yearSuit, cungPhi, napAm)}

        <!-- 3. Thanh điều hướng tháng sang trọng (Luxury Month Navigator) -->
        <div class="tc-month-navigator">
          <button type="button" class="tc-month-nav-btn" id="tc-btn-prev-month" title="Tháng trước">◀</button>
          <div class="tc-month-nav-center">
            <div class="tc-month-nav-label">Tháng ${state.selectedMonth}${state.monthIsLunar ? ' (Âm lịch)' : ''} / ${state.selectedYear}</div>
            <div class="tc-month-nav-sub">${state.results && state.results.days ? state.results.days.length : 0} ngày đại cát tuyển chọn</div>
          </div>
          <button type="button" class="tc-month-nav-btn" id="tc-btn-next-month" title="Tháng sau">▶</button>
          <div class="ucc-pill-cal tc-month-cal-pill" style="margin-left: 6px;">
            <button type="button" class="ucc-pill-btn ${!state.monthIsLunar ? 'active' : ''}" id="tc-btn-month-solar" title="Xem theo tháng Dương lịch">☀️ DL</button>
            <button type="button" class="ucc-pill-btn ${state.monthIsLunar ? 'active' : ''}" id="tc-btn-month-lunar" title="Xem theo tháng Âm lịch">🌙 ÂL</button>
          </div>
        </div>

        <!-- 4. Tiêu chí nâng cao (Gấp gọn trong Drawer) -->
        <details class="tc-advanced-drawer">
          <summary class="tc-advanced-summary">
            <span>⚙️ Tiêu chí nâng cao (Tọa Sơn, 6 Trường Phái)</span>
            <span class="tc-advanced-arrow">▾</span>
          </summary>
          <div class="tc-advanced-body">
            <!-- Tọa Sơn Nhà & Liên kết La Kinh -->
            <div class="tc-field" style="margin-bottom: 8px;">
              <label class="tc-label">${isFuneral ? 'Tọa Sơn Mộ Phần (Âm Trạch)' : (isBuilding ? 'Tọa Sơn Nhà / Công Trình (Dương Trạch)' : 'Tọa Sơn Hướng Vị')}</label>
              <div class="tc-lakinh-bridge-row">
                <button type="button" class="tc-btn-get-lakinh" id="tc-btn-get-lakinh" title="Đọc độ số Tọa Sơn từ đĩa La Kinh Vệ Tinh">
                  🧭 Lấy Tọa Từ La Kinh
                </button>
                <select id="tc-select-24son" class="tc-select-24son" title="Chọn nhanh 24 Sơn Vị phong thủy">
                  <option value="">-- Chọn 24 Sơn Vị --</option>
                  ${SON_24_LIST.map(s => `
                    <option value="${s.deg}" ${state.mountainSittingDeg != null && Math.abs(state.mountainSittingDeg - s.deg) < 7.5 ? 'selected' : ''}>
                      Sơn ${s.name} (${s.deg}° - ${s.dir})
                    </option>
                  `).join('')}
                </select>
              </div>
              <div class="tc-input-row" style="margin-top: 4px;">
                <input type="number" id="tc-input-deg" class="tc-input" min="0" max="359.9" step="0.1" placeholder="Nhập độ số (0° - 359°)..." value="${state.mountainSittingDeg != null ? state.mountainSittingDeg : ''}">
                <button type="button" class="tc-badge tc-badge-warn" id="tc-btn-clear-deg" style="cursor: pointer;" title="Bỏ chọn tọa sơn">✕ Xóa</button>
              </div>
            </div>

            <!-- Toggles Trường Phái -->
            <div class="tc-toggles-row">
              <label class="tc-toggle-label">
                <input type="checkbox" id="tc-chk-trinh" ${state.schools.enable_trinh ? 'checked' : ''}> Trạng Trình (83 việc)
              </label>
              <label class="tc-toggle-label">
                <input type="checkbox" id="tc-chk-dongcong" ${state.schools.enable_dong_cong ? 'checked' : ''}> Đổng Công Tuyển Trạch
              </label>
              <label class="tc-toggle-label">
                <input type="checkbox" id="tc-chk-folk" ${state.schools.enable_folk_filter ? 'checked' : ''}> Lọc Sát Dân Gian (Tam Nương, Thọ Tử, Nguyệt Kỵ)
              </label>
              <label class="tc-toggle-label">
                <input type="checkbox" id="tc-chk-tc16" ${state.schools.enable_16_criteria ? 'checked' : ''}> 16 Tiêu Chí Cát Thần
              </label>
              <label class="tc-toggle-label" title="Huyền Không Đại Quái 64 Quẻ: Quái Khí, Quái Vận, Hợp Thập, Hà Đồ & Tọa Sơn">
                <input type="checkbox" id="tc-chk-xkdg" ${state.schools.enable_xkdg ? 'checked' : ''}> ☯ Huyền Không Đại Quái (64 Quẻ)
              </label>
              <label class="tc-toggle-label" title="Kỳ Môn Chiến Lược: 5 Quy Tắc Vàng & 76 Cách Cục, Tam Thắng, Thiên Mã">
                <input type="checkbox" id="tc-chk-qimen" ${state.schools.enable_qimen ? 'checked' : ''}> 🔮 Kỳ Môn Chiến Lược &amp; Tác Quyết
              </label>
            </div>
          </div>
        </details>

        <!-- Trùng Tang / Nhập Mộ / Thiên Di (Khi chọn mục việc Tang lễ / An táng) -->
        ${isFuneral ? renderTrungTangSection() : ''}
      </div>

      <!-- PHẦN 2: TOÀN BỘ KẾT QUẢ ĐẠI CÁT TÁCH BIỆT RÕ RÀNG Ở DƯỚI -->
      <div class="tc-results-section">
        ${renderResultsHTML()}
      </div>
    `;
  }

  function render(preserveScroll = false) {
    const container = document.getElementById('view-trachcat');
    if (!container) return;
    const scrollEl = container.querySelector('.tc-container');
    const prevScrollY = preserveScroll ? (scrollEl ? scrollEl.scrollTop : (window.scrollY || document.documentElement.scrollTop)) : null;

    const eng = getEngine();
    if (!eng) {
      container.innerHTML = `<div class="tc-container"><div class="tc-panel tc-empty"><p>Đang nạp cơ sở dữ liệu Trạch Cát...</p></div></div>`;
      return;
    }

    container.innerHTML = `
      <div class="tc-container">
        <!-- Bộ chuyển đổi chế độ (Mode Switcher) -->
        <div class="tc-view-modes">
          <button type="button" class="tc-view-mode-btn ${state.viewMode === 'month' ? 'active' : ''}" data-vmode="month">
            <span>✨ Tìm Ngày Tốt</span>
          </button>
          <button type="button" class="tc-view-mode-btn ${state.viewMode === 'specific' ? 'active' : ''}" data-vmode="specific">
            <span>🔍 Thẩm Định 1 Ngày</span>
          </button>
        </div>

        ${state.viewMode === 'month' ? renderMonthModeHTML() : renderSpecificModeHTML()}
      </div>
    `;

    bindEvents();

    if (prevScrollY !== null) {
      requestAnimationFrame(() => {
        const sc = container.querySelector('.tc-container');
        if (sc) {
          sc.scrollTop = prevScrollY;
        } else {
          window.scrollTo({ top: prevScrollY, behavior: 'instant' });
        }
      });
    }
  }

  function renderResultsHTML() {
    if (!state.results || !state.results.days) {
      return `
        <div class="tc-panel tc-empty">
          <div class="tc-empty-icon">📅</div>
          <h3>Chưa có dữ liệu tra cứu</h3>
          <p>Nhấn nút "Tra Cứu Ngày Đại Cát" để hiển thị danh sách ngày tốt.</p>
        </div>
      `;
    }

    const res = state.results;
    const days = res.days;

    if (days.length === 0) {
      return `
        <div class="tc-panel tc-empty">
          <div class="tc-empty-icon">⚠️</div>
          <h3>Không tìm thấy ngày phù hợp</h3>
          <p>Trong tháng này không có ngày đạt chuẩn tối ưu cho mục việc <strong>${res.task.name}</strong> với các bộ lọc đã chọn. Hãy thử nới lỏng bộ lọc hoặc chuyển sang tháng kế tiếp.</p>
        </div>
      `;
    }

    return `
      <!-- Banner tổng quan -->
      <div class="tc-summary-banner">
        <div class="tc-summary-title">
          ✨ Tìm thấy ${days.length} ngày Cát Lành cho việc "${res.task.name}" trong Tháng ${state.selectedMonth}/${state.selectedYear}
        </div>
        <div class="tc-summary-stats">
          <span class="tc-badge tc-badge-good">Điểm cao nhất: ${days[0].total_score}đ</span>
          <span class="tc-badge tc-badge-info">Gia chủ: ${state.personCanChi}</span>
        </div>
      </div>

      <!-- Danh sách ngày tốt -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${days.map((d, idx) => renderDayCardHTML(d, idx)).join('')}
      </div>
    `;
  }

  function renderDayCardHTML(d, idx) {
    const isTop = (idx === 0);
    const scoreClass = d.total_score >= 8 ? '' : (d.total_score >= 6 ? 'medium' : 'low');

    return `
      <div class="tc-day-card ${isTop ? 'top-rank' : ''}">
        <!-- Header -->
        <div class="tc-card-header">
          <div class="tc-card-date-col">
            <span class="tc-card-solar">📅 ${d.solar_date}</span>
            <span class="tc-card-lunar">(Âm: ${d.lunar_date})</span>
            <span class="tc-card-canchi">${d.can_chi_day}</span>
          </div>
          <div class="tc-card-badges-col">
            <span class="tc-score-pill ${scoreClass}">🌟 ${d.total_score}đ • ${d.total_score >= 8 ? 'Đại Cát' : 'Cát'}</span>
            <span class="tc-badge tc-badge-warn">Đổng Công: ${d.dong_cong_rating || (d.dong_cong && (d.dong_cong.rating || d.dong_cong.kiet_hung)) || 'Bình'}</span>
          </div>
        </div>

        <!-- Body -->
        <div class="tc-card-body">
          <!-- Hàng tiêu chí -->
          <div class="tc-details-row">
            <span class="tc-meta-tag">🌿 Trực: ${d.truc_name}</span>
            <span class="tc-meta-tag">⭐ Sao: ${d.sao_name}</span>
            <span class="tc-meta-tag">⛅ Tiết khí: ${d.tiet_khi}</span>
            ${d.tc16 && d.tc16.tam_dai_cat_tinh ? `
              <span class="tc-badge tc-badge-good">✨ ${d.tc16.tam_dai_cat_tinh.name} (Đại Cát Tinh)</span>
            ` : ''}
            ${d.tc16 && d.tc16.luc_nham ? `
              <span class="tc-meta-tag">Lục Nhâm: <strong>${d.tc16.luc_nham.cung}</strong></span>
            ` : ''}
            ${d.tc16 && d.tc16.khong_minh ? `
              <span class="tc-meta-tag">Khổng Minh: <strong>${d.tc16.khong_minh.name}</strong></span>
            ` : ''}
          </div>

          <!-- Bành Tổ Bách Kỵ & Hướng xuất hành -->
          ${d.tc16 ? `
            <div class="tc-god-row">
              <span>🧭 Hỷ Thần: <strong class="tc-god-hy">${d.tc16.huong_xuat_hanh.hy_than}</strong></span>
              <span>💰 Tài Thần: <strong class="tc-god-tai">${d.tc16.huong_xuat_hanh.tai_than}</strong></span>
              ${d.tc16.banh_to_ky ? `<span>📜 Bành Tổ: <em class="tc-banh-to">${d.tc16.banh_to_ky}</em></span>` : ''}
            </div>
          ` : ''}

          <!-- Lời bình Đổng Công -->
          ${d.dong_cong ? `
            <div class="tc-dongcong-box">
              <div class="tc-dongcong-header">
                <span>📜 ĐỔNG CÔNG TUYỂN TRẠCH: ${d.dong_cong.rating}</span>
                <span>${d.dong_cong.summary || ''}</span>
              </div>
              <div>${d.dong_cong.evaluation}</div>
            </div>
          ` : ''}

          <!-- Tọa Sơn Nhà Compatibility (nếu có) -->
          ${d.house_sitting ? `
            <div class="tc-house-sitting-box">
              <div class="tc-house-sitting-title">
                🏡 PHỐI HỢP TỌA SƠN: Sơn ${d.house_sitting.son} (${d.house_sitting.direction} • ${d.house_sitting.deg}°)
              </div>
              <div class="tc-house-sitting-desc">
                ${d.house_sitting.notes.length > 0 ? d.house_sitting.notes.join('<br>') : '✓ Tọa sơn bình hòa, không phạm Trực Xung hay Tam Sát.'}
              </div>
            </div>
          ` : ''}

          <!-- Huyền Không Đại Quái Box (nếu bật) -->
          ${d.xkdg ? `
            <div class="tc-xkdg-box">
              <div class="tc-xkdg-header">
                <span class="tc-xkdg-title">☯ HUYỀN KHÔNG ĐẠI QUÁI: ${d.xkdg.rating} (${d.xkdg.score > 0 ? '+' : ''}${d.xkdg.score}đ)</span>
                <span class="tc-badge ${d.xkdg.is_disqualified ? 'tc-badge-warn' : 'tc-badge-good'}">
                  ${d.xkdg.is_disqualified ? 'Phạm Khắc Nhập' : 'Cát Khí'}
                </span>
              </div>
              <div class="tc-xkdg-body">
                <div class="tc-xkdg-meta">
                  <span>Quẻ Ngày: <strong>${d.xkdg.day_gua.name}</strong> [Khí ${d.xkdg.day_gua.qi} • Vận ${d.xkdg.day_gua.yun}]</span>
                  ${d.xkdg.hour_gua ? `<span>Quẻ Giờ: <strong>${d.xkdg.hour_gua.name}</strong> [Khí ${d.xkdg.hour_gua.qi} • Vận ${d.xkdg.hour_gua.yun}]</span>` : ''}
                  ${d.xkdg.mountain_gua ? `<span>Tọa Sơn: <strong>${d.xkdg.mountain_gua.name}</strong> [Khí ${d.xkdg.mountain_gua.qi} • Vận ${d.xkdg.mountain_gua.yun}]</span>` : ''}
                </div>
                ${d.xkdg.details && d.xkdg.details.length > 0 ? `
                  <div class="tc-xkdg-details">
                    ${d.xkdg.details.map(dt => `<div>• ${dt}</div>`).join('')}
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}

          <!-- Kỳ Môn Chiến Lược (Joey Yap & Trương Chí Xuân) Box (nếu bật) -->
          ${d.qimen ? `
            <div class="tc-qimen-box">
              <div class="tc-qimen-header">
                <span class="tc-qimen-title">🔮 KỲ MÔN CHIẾN LƯỢC: ${d.qimen.rating} (${d.qimen.score > 0 ? '+' : ''}${d.qimen.score}đ)</span>
                <div class="tc-qimen-badges">
                  ${d.qimen.is_disqualified ? '<span class="tc-badge tc-badge-warn">Đại Hung Bị Loại</span>' : ''}
                  ${d.qimen.joey_strategy && d.qimen.joey_strategy.is_vetoed ? '<span class="tc-badge tc-badge-warn">⚠️ Ngũ Bất Ngộ Thời</span>' : ''}
                  ${!d.qimen.is_disqualified && d.qimen.score >= 25 ? '<span class="tc-badge tc-badge-good">👑 Đại Cát Cách</span>' : ''}
                  ${!d.qimen.is_disqualified && d.qimen.score < 25 && d.qimen.score >= 8 ? '<span class="tc-badge tc-badge-good">Đắc Cách</span>' : ''}
                </div>
              </div>
              <div class="tc-qimen-body">
                <div class="tc-qimen-meta">
                  <span>Bàn: <strong>${d.qimen.cuc_name || 'Thời Gia Kỳ Môn'}</strong></span>
                  ${d.qimen.sinh_mon_palace ? `<span>Sinh Môn: <strong>Cung ${d.qimen.sinh_mon_palace}</strong></span>` : ''}
                  ${d.qimen.mountain_palace ? `<span>Tọa Sơn: <strong>Cung ${d.qimen.mountain_palace} (${d.qimen.mountain_god || ''})</strong></span>` : ''}
                  ${d.qimen.joey_strategy && d.qimen.joey_strategy.month_general ? `<span>Nguyệt Tướng: <strong>${d.qimen.joey_strategy.month_general.name_vn} (${d.qimen.joey_strategy.month_general.branch})</strong></span>` : ''}
                </div>

                <!-- Thước Ngắm Chiến Lược Không Gian Joey Yap -->
                ${d.qimen.joey_strategy && d.qimen.joey_strategy.spatial_strategy ? `
                  <div class="tc-joey-spatial">
                    <div class="tc-spatial-header">🧭 THƯỚC NGẮM CHIẾN LƯỢC KHÔNG GIAN</div>
                    <div class="tc-spatial-grid">
                      <div class="tc-spatial-item victory">
                        <span class="tc-spatial-label">🟢 Tọa Lưng Đắc Thắng:</span>
                        <span class="tc-spatial-val">${d.qimen.joey_strategy.spatial_strategy.presenter_back_facing}</span>
                        <small class="tc-spatial-tip">Ngồi quay lưng hướng này khi đàm phán, chốt hợp đồng</small>
                      </div>
                      <div class="tc-spatial-item horse">
                        <span class="tc-spatial-label">🟡 Thái Trùng Thiên Mã:</span>
                        <span class="tc-spatial-val">${d.qimen.joey_strategy.spatial_strategy.emergency_escape_vector}</span>
                        <small class="tc-spatial-tip">Phương vị xuất hành thoát hiểm, giải vây cấp tốc</small>
                      </div>
                      <div class="tc-spatial-item restrict">
                        <span class="tc-spatial-label">🔴 Vùng Bất Kích:</span>
                        <span class="tc-spatial-val">${d.qimen.joey_strategy.spatial_strategy.five_no_attacks.join(' • ')}</span>
                        <small class="tc-spatial-tip">Cấm hướng mặt hoặc đối đầu trực diện</small>
                      </div>
                      <div class="tc-spatial-item target">
                        <span class="tc-spatial-label">🎯 Bố Trí Đối Tác:</span>
                        <span class="tc-spatial-val">${d.qimen.joey_strategy.spatial_strategy.target_placement_sectors.join(' • ')}</span>
                        <small class="tc-spatial-tip">Hướng đối tác ngồi vào cung yếu để chiếm ưu thế</small>
                      </div>
                    </div>

                    <!-- Cách Cục Nhận Diện Được -->
                    ${d.qimen.joey_strategy.detected_formations && d.qimen.joey_strategy.detected_formations.length > 0 ? `
                      <div class="tc-formations-section">
                        <span class="tc-formations-title">⚡ 76 Cách Cục Nhận Diện Được:</span>
                        <div class="tc-formations-tags">
                          ${d.qimen.joey_strategy.detected_formations.map(f => `
                            <span class="tc-formation-tag ${f.score > 0 ? 'good' : 'bad'}" title="${f.desc}">
                              ${f.score > 0 ? '🟢' : '🔴'} [${f.code}] ${f.name_vn} (${f.direction}): ${f.score > 0 ? '+' : ''}${f.score}đ
                            </span>
                          `).join('')}
                        </div>
                      </div>
                    ` : ''}

                    <!-- Khắc Ứng Thực Địa (Section H) -->
                    ${d.qimen.joey_strategy.evidential_omens ? `
                      <div class="tc-omen-box">
                        <div class="tc-omen-title">👁️ KHẮC ỨNG THỰC ĐỊA (30 PHÚT ĐẦU):</div>
                        <div class="tc-omen-body">
                          <div>• <strong>Hiện tượng chính (${d.qimen.joey_strategy.evidential_omens.door_omen.door_name}):</strong> ${d.qimen.joey_strategy.evidential_omens.door_omen.prime_phenomenon}</div>
                          <div>• <strong>Tín hiệu nhận biết:</strong> ${d.qimen.joey_strategy.evidential_omens.door_omen.signals.join(' • ')}</div>
                          <div class="tc-omen-sub">• <em>Quy tắc: Khi xuất hành hoặc khởi sự trong vòng 30 phút, gặp ít nhất 1 điềm báo trên là trường năng lượng đã kích hoạt thành công.</em></div>
                        </div>
                      </div>
                    ` : ''}
                  </div>
                ` : ''}

                ${d.qimen.details && d.qimen.details.length > 0 ? `
                  <div class="tc-qimen-details">
                    ${d.qimen.details.map(dt => `<div>• ${dt}</div>`).join('')}
                  </div>
                ` : ''}
                ${d.qimen.weather_warnings && d.qimen.weather_warnings.length > 0 ? `
                  <div class="tc-qimen-weather">
                    ⚠️ <em>Khí tượng: ${d.qimen.weather_warnings.join('; ')}</em>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}

          <!-- Bảng 6 Giờ Hoàng Đạo Xếp Hạng 9 Bậc -->
          <div class="tc-hours-section">
            <div class="tc-hours-title">
              <span>✨ 6 GIỜ HOÀNG ĐẠO (XẾP HẠNG THEO BẢN MỆNH)</span>
              <span class="tc-hours-subtitle">Ưu tiên Bậc 1 (Lộc Tinh) & Bậc 2 (Quý Nhân)</span>
            </div>
            <div class="tc-hours-grid">
              ${(d.ranked_hours || []).map(h => `
                <div class="tc-hour-card ${h.rank <= 2 ? 'rank-top' : ''} ${h.is_five_disharmony ? 'disharmony-hour' : ''}">
                  <div class="tc-hour-name">
                    Giờ ${h.hour_chi}
                    ${h.is_five_disharmony ? '<span class="tc-hour-veto" title="Phạm Ngũ Bất Ngộ Thời (Thất Sát)">⚠️ Veto</span>' : ''}
                  </div>
                  <div class="tc-hour-time">${h.solar_time_range}</div>
                  <div class="tc-hour-rank">${h.is_five_disharmony ? 'Ngũ Bất Ngộ' : 'Bậc ' + h.rank}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Khắc Ứng Cửu Tinh Giờ Tốt Nhất -->
          ${d.star_khac_ung && d.best_hour ? `
            <div class="tc-khacung-box">
              <div class="tc-khacung-title">🔮 ĐIỀM BÁO KHẮC ỨNG CỬU TINH (GIỜ ${d.best_hour.hour_chi.toUpperCase()} - ${d.best_hour.solar_time_range})</div>
              <div><strong>Điềm ứng:</strong> ${d.star_khac_ung.sign}</div>
              <div><strong>Ứng nghiệm:</strong> ${d.star_khac_ung.response}</div>
            </div>
          ` : ''}

          <!-- Nút hành động liên kết -->
          <div class="tc-card-actions">
            <button type="button" class="tc-btn-action tc-btn-cal" data-action="cal" data-date="${d.solar_date}">
              📅 Xem Lịch Ngày Này
            </button>
            <button type="button" class="tc-btn-action tc-btn-qmdj" data-action="qmdj" data-date="${d.solar_date}" data-hour="${d.best_hour ? d.best_hour.hour_chi : 'Tý'}">
              🔮 Lập Kỳ Môn Giờ ${d.best_hour ? d.best_hour.hour_chi : 'Tốt'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function bindEvents() {
    // Mode Switcher Tabs
    document.querySelectorAll('.tc-view-mode-btn').forEach(btn => {
      btn.onclick = () => {
        const vmode = btn.getAttribute('data-vmode');
        if (vmode && vmode !== state.viewMode) {
          state.viewMode = vmode;
          if (vmode === 'specific' && !state.specificResult) {
            runSpecificEvaluation();
          } else if (vmode === 'month' && !state.results) {
            runEvaluation();
          }
          render();
        }
      };
    });

    // Solar / Lunar Mode Switch Buttons
    const btnSolar = document.getElementById('tc-btn-solar');
    const btnLunar = document.getElementById('tc-btn-lunar');
    if (btnSolar) {
      btnSolar.onclick = () => {
        if (state.isLunarMode) {
          state.isLunarMode = false;
          render(true);
        }
      };
    }
    if (btnLunar) {
      btnLunar.onclick = () => {
        if (!state.isLunarMode) {
          state.isLunarMode = true;
          render(true);
        }
      };
    }

    // Date inputs (Day, Month, Year)
    const inputDay = document.getElementById('tc-input-day');
    const inputMonth = document.getElementById('tc-input-month');
    const inputYearDate = document.getElementById('tc-input-year-date');

    const handleDateInputsChange = () => {
      if (!inputDay || !inputMonth || !inputYearDate) return;
      const d = Math.min(31, Math.max(1, parseInt(inputDay.value, 10) || 1));
      const m = Math.min(12, Math.max(1, parseInt(inputMonth.value, 10) || 1));
      let y = parseInt(inputYearDate.value, 10) || 2026;
      if (global.NetaSmartPicker && y < 100) {
        y = global.NetaSmartPicker.parseSmartYear(y);
        inputYearDate.value = y;
      }
      y = Math.min(2100, Math.max(1900, y));

      if (state.isLunarMode && global.NetaCalendarEngine && global.NetaCalendarEngine.lunar2Solar) {
        const solar = global.NetaCalendarEngine.lunar2Solar(d, m, y, false, 7);
        if (solar) {
          state.specificDate = new Date(solar.year, solar.month - 1, solar.day, 12, 0, 0);
          state.specificDateStr = `${solar.year}-${pad(solar.month)}-${pad(solar.day)}`;
        }
      } else {
        state.specificDate = new Date(y, m - 1, d, 12, 0, 0);
        state.specificDateStr = `${y}-${pad(m)}-${pad(d)}`;
      }
      runSpecificEvaluation();
      render(true);
    };

    [inputDay, inputMonth, inputYearDate].forEach(inp => {
      if (inp) {
        inp.addEventListener('change', handleDateInputsChange);
      }
    });

    // Auto-advance with NetaSmartPicker
    if (global.NetaSmartPicker && inputDay && inputMonth && inputYearDate) {
      global.NetaSmartPicker.setupAutoAdvance({
        dayInput: inputDay,
        monthInput: inputMonth,
        yearInput: inputYearDate,
        onSubmit: () => { handleDateInputsChange(); }
      });
    }

    // Quick Year Jumper Modal (⚡Năm)
    const btnQuickYear = document.getElementById('tc-btn-quick-year');
    if (btnQuickYear && inputYearDate) {
      btnQuickYear.onclick = (e) => {
        e.preventDefault();
        if (global.NetaSmartPicker) {
          global.NetaSmartPicker.openYearJumperModal(inputYearDate.value, (newYear) => {
            inputYearDate.value = newYear;
            handleDateInputsChange();
          });
        }
      };
    }

    // Native Date Picker (📅)
    const nativePicker = document.getElementById('tc-date-picker');
    if (nativePicker) {
      nativePicker.addEventListener('change', () => {
        if (!nativePicker.value) return;
        const [dPart, tPart] = nativePicker.value.split('T');
        const [y, m, d] = dPart.split('-').map(Number);
        state.isLunarMode = false;
        state.specificDate = new Date(y, m - 1, d, 12, 0, 0);
        state.specificDateStr = `${y}-${pad(m)}-${pad(d)}`;
        if (tPart) {
          const [h] = tPart.split(':').map(Number);
          const CHI_HOURS_MAP = ['Tý', 'Sửu', 'Sửu', 'Dần', 'Dần', 'Mão', 'Mão', 'Thìn', 'Thìn', 'Tị', 'Tị', 'Ngọ', 'Ngọ', 'Mùi', 'Mùi', 'Thân', 'Thân', 'Dậu', 'Dậu', 'Tuất', 'Tuất', 'Hợi', 'Hợi', 'Tý'];
          state.specificHourChi = CHI_HOURS_MAP[h] || state.specificHourChi;
        }
        runSpecificEvaluation();
        render(true);
      });

      const pickerLabel = document.getElementById('tc-btn-native-cal');
      const dateBox = document.getElementById('tc-ucc-date-box');
      const triggerWheelPicker = (e) => {
        if (e && e.target === nativePicker) return;
        if (e) e.preventDefault();
        const curD = state.specificDate || new Date();
        nativePicker.value = `${curD.getFullYear()}-${pad(curD.getMonth() + 1)}-${pad(curD.getDate())}T12:00`;
        if (typeof nativePicker.showPicker === 'function') {
          nativePicker.showPicker();
        } else {
          nativePicker.click();
        }
      };
      if (pickerLabel) {
        pickerLabel.onclick = triggerWheelPicker;
      }
      if (dateBox) {
        dateBox.addEventListener('click', (e) => {
          if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
            triggerWheelPicker(e);
          }
        });
      }
    }

    // Quick Date Buttons
    const btnToday = document.getElementById('tc-btn-today');
    if (btnToday) {
      btnToday.onclick = () => {
        const now = new Date();
        state.specificDate = now;
        state.specificDateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        runSpecificEvaluation();
        render(true);
      };
    }

    const btnTomorrow = document.getElementById('tc-btn-tomorrow');
    if (btnTomorrow) {
      btnTomorrow.onclick = () => {
        const tom = new Date(Date.now() + 86400000);
        state.specificDate = tom;
        state.specificDateStr = `${tom.getFullYear()}-${pad(tom.getMonth() + 1)}-${pad(tom.getDate())}`;
        runSpecificEvaluation();
        render(true);
      };
    }

    // Specific Hour Select
    const selectSpecHour = document.getElementById('tc-select-specific-hour');
    if (selectSpecHour) {
      selectSpecHour.onchange = (e) => {
        state.specificHourChi = e.target.value;
        runSpecificEvaluation();
        render(true);
      };
    }

    // Current Hour Button
    const btnCurHour = document.getElementById('tc-btn-cur-hour');
    if (btnCurHour) {
      btnCurHour.onclick = () => {
        const curH = (new Date()).getHours();
        const CHI_HOURS_MAP = ['Tý', 'Sửu', 'Sửu', 'Dần', 'Dần', 'Mão', 'Mão', 'Thìn', 'Thìn', 'Tị', 'Tị', 'Ngọ', 'Ngọ', 'Mùi', 'Mùi', 'Thân', 'Thân', 'Dậu', 'Dậu', 'Tuất', 'Tuất', 'Hợi', 'Hợi', 'Tý'];
        state.specificHourChi = CHI_HOURS_MAP[curH] || 'Thìn';
        runSpecificEvaluation();
        render(true);
        if (global.showToast) global.showToast(`🕒 Đã chọn Giờ ${state.specificHourChi}!`);
      };
    }

    // Search task in specific mode
    const searchTaskSpec = document.getElementById('tc-search-task-spec');
    if (searchTaskSpec) {
      searchTaskSpec.oninput = (e) => {
        state.searchTerm = e.target.value;
        render(true);
      };
    }

    const selectTaskSpec = document.getElementById('tc-select-task-spec');
    if (selectTaskSpec) {
      selectTaskSpec.onchange = (e) => {
        state.taskId = e.target.value;
        const eng = getEngine();
        if (eng && eng.tasks) {
          const tFound = eng.tasks.find(x => x.id === state.taskId);
          if (tFound && tFound.category) {
            state.category = tFound.category;
          }
        }
        runSpecificEvaluation();
        render(true);
      };
    }

    // Run Specific Evaluation Button
    const btnRunSpecific = document.getElementById('tc-btn-run-specific');
    if (btnRunSpecific) {
      btnRunSpecific.onclick = () => {
        runSpecificEvaluation();
        render();
        setTimeout(() => {
          const hero = document.querySelector('.tc-spec-hero');
          if (hero) {
            hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 50);
        if (global.showToast) global.showToast('✨ Đã hoàn tất thẩm định ngày giờ!');
      };
    }

    // Choose Hour from Alternative Hours
    document.querySelectorAll('.tc-btn-choose-hour').forEach(btn => {
      btn.onclick = () => {
        const hChi = btn.getAttribute('data-hour');
        if (hChi) {
          state.specificHourChi = hChi;
          runSpecificEvaluation();
          render(true);
          if (global.showToast) global.showToast(`✨ Đã đổi sang Giờ ${hChi}!`);
        }
      };
    });

    // Switch Day from Nearby Days
    document.querySelectorAll('.tc-btn-switch-day').forEach(btn => {
      btn.onclick = () => {
        const dateStr = btn.getAttribute('data-date'); // "DD/MM/YYYY"
        if (dateStr) {
          const parts = dateStr.split('/');
          const d = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          const y = parseInt(parts[2], 10);
          state.specificDate = new Date(y, m - 1, d);
          state.specificDateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          runSpecificEvaluation();
          render();
          setTimeout(() => {
            const hero = document.querySelector('.tc-spec-hero');
            if (hero) hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 50);
          if (global.showToast) global.showToast(`📅 Đã chuyển sang ngày ${dateStr}!`);
        }
      };
    });

    // Quick task pills (Đại Sự Trọng Điểm)
    document.querySelectorAll('.tc-quick-pill').forEach(el => {
      el.onclick = () => {
        const action = el.getAttribute('data-action');
        if (action === 'all-tasks') {
          const searchInput = document.getElementById('tc-search-task') || document.getElementById('tc-search-task-spec');
          if (searchInput) {
            searchInput.focus();
            searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return;
        }
        const taskId = el.getAttribute('data-task-id');
        if (taskId) {
          state.taskId = taskId;
          const eng = getEngine();
          if (eng && eng.tasks) {
            const tFound = eng.tasks.find(x => x.id === taskId);
            if (tFound && tFound.category) {
              state.category = tFound.category;
            }
          }
          state.searchTerm = '';
          runSpecificEvaluation();
          runEvaluation();
          render();
        }
      };
    });

    // Lấy tọa từ La Kinh
    const btnGetLaKinh = document.getElementById('tc-btn-get-lakinh');
    if (btnGetLaKinh) {
      btnGetLaKinh.onclick = () => {
        const deg = getLaKinhSittingDeg();
        state.mountainSittingDeg = deg;
        try { localStorage.setItem('neta_lakinh_sitting', String(deg)); } catch (_) {}
        runSpecificEvaluation();
        runEvaluation();
        render();
        if (global.showToast) global.showToast(`🧭 Đã nạp Tọa Sơn ${deg}° từ La Kinh!`);
      };
    }

    // Dropdown chọn nhanh 24 Sơn Vị
    const sel24Son = document.getElementById('tc-select-24son');
    if (sel24Son) {
      sel24Son.onchange = (e) => {
        const val = e.target.value;
        if (val !== '') {
          const deg = parseFloat(val);
          state.mountainSittingDeg = deg;
          try { localStorage.setItem('neta_lakinh_sitting', String(deg)); } catch (_) {}
          runSpecificEvaluation();
          runEvaluation();
          render();
          if (global.showToast) global.showToast(`🧭 Đã khóa Tọa Sơn ${deg}°!`);
        }
      };
    }

    // Category chips
    document.querySelectorAll('.tc-cat-chip').forEach(el => {
      el.onclick = () => {
        state.category = el.getAttribute('data-cat');
        // Tự động chọn task đầu tiên trong category
        const eng = getEngine();
        if (eng && eng.tasks) {
          const tMatch = eng.tasks.find(t => (state.category === 'Tất cả' || t.category === state.category));
          if (tMatch) state.taskId = tMatch.id;
        }
        runSpecificEvaluation();
        runEvaluation();
        render();
      };
    });

    // Search task input
    const searchTaskInput = document.getElementById('tc-search-task');
    if (searchTaskInput) {
      searchTaskInput.oninput = (e) => {
        state.searchTerm = e.target.value.trim();
        // Cập nhật lại options của select mà không re-render toàn bộ để giữ focus
        const eng = getEngine();
        if (eng && eng.tasks) {
          const sel = document.getElementById('tc-select-task');
          if (sel) {
            const filtered = eng.tasks.filter(t => {
              const matchCat = (state.category === 'Tất cả') || (t.category === state.category);
              const matchSearch = (!state.searchTerm) || (t.name.toLowerCase().includes(state.searchTerm.toLowerCase()) || String(t.number).includes(state.searchTerm));
              return matchCat && matchSearch;
            });
            sel.innerHTML = filtered.map(t => `<option value="${t.id}">[${t.number}] ${t.name} (${t.category})</option>`).join('');
            if (filtered.length > 0) {
              state.taskId = filtered[0].id;
              sel.value = state.taskId;
            }
          }
        }
      };
    }

    // Task select
    const selectTask = document.getElementById('tc-select-task');
    if (selectTask) {
      selectTask.onchange = (e) => {
        state.taskId = e.target.value;
        runSpecificEvaluation();
        runEvaluation();
        render();
      };
    }

    // Year input
    const inputYear = document.getElementById('tc-input-year');
    if (inputYear) {
      const applyYear = (valStr) => {
        const val = parseInt(valStr, 10);
        if (!isNaN(val) && val >= 1920 && val <= 2050 && val !== state.personYear) {
          state.personYear = val;
          try { localStorage.setItem('neta_user_birth_year', String(val)); } catch (_) {}
          runSpecificEvaluation();
          runEvaluation();
          render();
        }
      };
      inputYear.addEventListener('input', (e) => {
        if (e.target.value.length === 4) {
          applyYear(e.target.value);
        }
      });
      inputYear.addEventListener('change', (e) => {
        applyYear(e.target.value);
      });
    }

    // Gender toggle buttons
    const btnMale = document.getElementById('tc-btn-male');
    const btnFemale = document.getElementById('tc-btn-female');
    if (btnMale) {
      btnMale.onclick = () => {
        if (!state.isMale) {
          state.isMale = true;
          try { localStorage.setItem('neta_user_gender', 'male'); } catch (_) {}
          runSpecificEvaluation();
          runEvaluation();
          render();
        }
      };
    }
    if (btnFemale) {
      btnFemale.onclick = () => {
        if (state.isMale) {
          state.isMale = false;
          try { localStorage.setItem('neta_user_gender', 'female'); } catch (_) {}
          runSpecificEvaluation();
          runEvaluation();
          render();
        }
      };
    }

    // Mountain degree input
    const inputDeg = document.getElementById('tc-input-deg');
    if (inputDeg) {
      inputDeg.onchange = (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
          state.mountainSittingDeg = ((val % 360) + 360) % 360;
        } else {
          state.mountainSittingDeg = null;
        }
        runSpecificEvaluation();
        runEvaluation();
        render();
      };
    }

    // Clear degree button
    const btnClearDeg = document.getElementById('tc-btn-clear-deg');
    if (btnClearDeg) {
      btnClearDeg.onclick = () => {
        state.mountainSittingDeg = null;
        runSpecificEvaluation();
        runEvaluation();
        render();
      };
    }

    // Trùng Tang events (Bộ chọn Ngày Giờ Mất chuẩn Unified Control Card)
    const btnTTSolar = document.getElementById('btn-tt-solar');
    const btnTTLunar = document.getElementById('btn-tt-lunar');
    if (btnTTSolar) {
      btnTTSolar.onclick = () => {
        if (state.isDeathLunarMode) {
          state.isDeathLunarMode = false;
          render(true);
        }
      };
    }
    if (btnTTLunar) {
      btnTTLunar.onclick = () => {
        if (!state.isDeathLunarMode) {
          state.isDeathLunarMode = true;
          render(true);
        }
      };
    }

    const inputTTDay = document.getElementById('tt-input-day');
    const inputTTMonth = document.getElementById('tt-input-month');
    const inputTTYear = document.getElementById('tt-input-year');
    const inputTTHour = document.getElementById('tt-input-hour');
    const inputTTMin = document.getElementById('tt-input-minute');
    const selectTTCanChi = document.getElementById('tt-select-canchi');

    const handleTTDateChange = () => {
      if (!inputTTDay || !inputTTMonth || !inputTTYear) return;
      let d = parseInt(inputTTDay.value, 10) || 1;
      let m = parseInt(inputTTMonth.value, 10) || 1;
      let y = parseInt(inputTTYear.value, 10) || (new Date()).getFullYear();

      if (global.NetaSmartPicker && y < 100) {
        y = global.NetaSmartPicker.parseSmartYear(y);
        inputTTYear.value = y;
      }
      y = Math.min(2100, Math.max(1900, y));

      if (state.isDeathLunarMode) {
        state.deathDayLunar = Math.min(30, Math.max(1, d));
        state.deathMonthLunar = Math.min(12, Math.max(1, m));
        state.deathYear = y;
        syncDeathFromLunar();
      } else {
        d = Math.min(31, Math.max(1, d));
        m = Math.min(12, Math.max(1, m));
        state.deathDate = new Date(y, m - 1, d, state.deathHour || 12, state.deathMinute || 0, 0);
        syncDeathFromSolar();
      }
      render(true);
    };

    [inputTTDay, inputTTMonth, inputTTYear].forEach(inp => {
      if (inp) {
        inp.addEventListener('change', handleTTDateChange);
      }
    });

    if (global.NetaSmartPicker && inputTTDay && inputTTMonth && inputTTYear) {
      global.NetaSmartPicker.setupAutoAdvance({
        dayInput: inputTTDay,
        monthInput: inputTTMonth,
        yearInput: inputTTYear,
        hourInput: inputTTHour,
        minInput: inputTTMin
      }, handleTTDateChange);
    }

    const btnTTYearJumper = document.getElementById('btn-tt-year-jumper');
    if (btnTTYearJumper && inputTTYear) {
      btnTTYearJumper.onclick = (e) => {
        e.preventDefault();
        if (global.NetaSmartPicker) {
          global.NetaSmartPicker.openYearJumperModal(inputTTYear.value, (newYear) => {
            inputTTYear.value = newYear;
            handleTTDateChange();
          });
        }
      };
    }

    const ttDatePicker = document.getElementById('tt-date-picker');
    if (ttDatePicker) {
      ttDatePicker.addEventListener('change', () => {
        if (!ttDatePicker.value) return;
        const [dPart, tPart] = ttDatePicker.value.split('T');
        const [y, m, d] = dPart.split('-').map(Number);
        state.isDeathLunarMode = false;
        let h = state.deathHour || 12;
        let min = state.deathMinute || 0;
        if (tPart) {
          const parts = tPart.split(':').map(Number);
          h = parts[0] || 0;
          min = parts[1] || 0;
        }
        state.deathHour = h;
        state.deathMinute = min;
        state.deathHourChi = getChiFromHour(h);
        state.deathDate = new Date(y, m - 1, d, h, min, 0);
        syncDeathFromSolar();
        render(true);
      });

      const pickerLabel = document.getElementById('tt-btn-native-cal');
      const dateBox = document.getElementById('tt-ucc-date-box');
      const triggerTTWheelPicker = (e) => {
        if (e && e.target === ttDatePicker) return;
        if (e) e.preventDefault();
        const curD = state.deathDate || new Date();
        ttDatePicker.value = `${curD.getFullYear()}-${pad(curD.getMonth() + 1)}-${pad(curD.getDate())}T${pad(state.deathHour)}:${pad(state.deathMinute)}`;
        if (typeof ttDatePicker.showPicker === 'function') {
          ttDatePicker.showPicker();
        } else {
          ttDatePicker.click();
        }
      };
      if (pickerLabel) pickerLabel.onclick = triggerTTWheelPicker;
      if (dateBox) {
        dateBox.addEventListener('click', (e) => {
          if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
            triggerTTWheelPicker(e);
          }
        });
      }
    }

    if (selectTTCanChi) {
      selectTTCanChi.addEventListener('change', () => {
        const val = parseInt(selectTTCanChi.value, 10);
        state.deathHour = val;
        state.deathHourChi = getChiFromHour(val);
        if (inputTTHour) inputTTHour.value = pad(val);
        render(true);
      });
    }

    if (inputTTHour) {
      inputTTHour.addEventListener('change', () => {
        const h = Math.min(23, Math.max(0, parseInt(inputTTHour.value, 10) || 0));
        state.deathHour = h;
        state.deathHourChi = getChiFromHour(h);
        if (selectTTCanChi) {
          const opt = Array.from(selectTTCanChi.options).find(o => o.text.startsWith(state.deathHourChi));
          if (opt) selectTTCanChi.value = opt.value;
        }
        render(true);
      });
    }

    if (inputTTMin) {
      inputTTMin.addEventListener('change', () => {
        const min = Math.min(59, Math.max(0, parseInt(inputTTMin.value, 10) || 0));
        state.deathMinute = min;
      });
    }

    const btnTTPrevHour = document.getElementById('btn-tt-prev-hour');
    const btnTTNextHour = document.getElementById('btn-tt-next-hour');
    if (btnTTPrevHour) {
      btnTTPrevHour.onclick = () => {
        state.deathHour = (state.deathHour - 2 + 24) % 24;
        state.deathHourChi = getChiFromHour(state.deathHour);
        render(true);
      };
    }
    if (btnTTNextHour) {
      btnTTNextHour.onclick = () => {
        state.deathHour = (state.deathHour + 2) % 24;
        state.deathHourChi = getChiFromHour(state.deathHour);
        render(true);
      };
    }

    // Month Navigator (◀ / ▶)
    const btnPrevMonth = document.getElementById('tc-btn-prev-month');
    if (btnPrevMonth) {
      btnPrevMonth.onclick = () => {
        if (state.selectedMonth === 1) {
          state.selectedMonth = 12;
          state.selectedYear -= 1;
        } else {
          state.selectedMonth -= 1;
        }
        runEvaluation();
        render(true);
      };
    }

    const btnNextMonth = document.getElementById('tc-btn-next-month');
    if (btnNextMonth) {
      btnNextMonth.onclick = () => {
        if (state.selectedMonth === 12) {
          state.selectedMonth = 1;
          state.selectedYear += 1;
        } else {
          state.selectedMonth += 1;
        }
        runEvaluation();
        render(true);
      };
    }

    // Month Lunar / Solar Mode Switch Buttons
    const btnMonthSolar = document.getElementById('tc-btn-month-solar');
    const btnMonthLunar = document.getElementById('tc-btn-month-lunar');
    if (btnMonthSolar) {
      btnMonthSolar.onclick = () => {
        if (state.monthIsLunar) {
          state.monthIsLunar = false;
          runEvaluation();
          render(true);
        }
      };
    }
    if (btnMonthLunar) {
      btnMonthLunar.onclick = () => {
        if (!state.monthIsLunar) {
          state.monthIsLunar = true;
          runEvaluation();
          render(true);
        }
      };
    }

    // Month pills (nếu có)
    document.querySelectorAll('.tc-month-pill').forEach(el => {
      el.onclick = () => {
        const m = parseInt(el.getAttribute('data-month'), 10);
        if (!isNaN(m)) {
          state.selectedMonth = m;
          runEvaluation();
          render(true);
        }
      };
    });

    // Checkboxes Trường Phái
    const bindToggle = (id, key) => {
      const el = document.getElementById(id);
      if (el) {
        el.onchange = (e) => {
          state.schools[key] = e.target.checked;
          runEvaluation();
          render(true);
        };
      }
    };
    bindToggle('tc-chk-trinh', 'enable_trinh');
    bindToggle('tc-chk-dongcong', 'enable_dong_cong');
    bindToggle('tc-chk-folk', 'enable_folk_filter');
    bindToggle('tc-chk-tc16', 'enable_16_criteria');
    bindToggle('tc-chk-xkdg', 'enable_xkdg');
    bindToggle('tc-chk-qimen', 'enable_qimen');

    // Search button
    const btnRun = document.getElementById('tc-btn-run');
    if (btnRun) {
      btnRun.onclick = () => {
        runEvaluation();
        render();
        setTimeout(() => {
          const banner = document.querySelector('.tc-summary-banner');
          if (banner) {
            banner.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 50);
        if (global.showToast) global.showToast('✨ Đã cập nhật bảng ngày Đại Cát!');
      };
    }

    // Action buttons inside Day Cards
    document.querySelectorAll('.tc-btn-action').forEach(btn => {
      btn.onclick = () => {
        const action = btn.getAttribute('data-action');
        const dateStr = btn.getAttribute('data-date'); // "DD/MM/YYYY"

        if (action === 'cal') {
          // Mở Lịch Âm Dương đúng ngày này
          const parts = dateStr.split('/');
          const d = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          const y = parseInt(parts[2], 10);
          const targetDate = new Date(y, m, d, 12, 0, 0);

          if (global.NetaCalendarView && typeof global.NetaCalendarView.setDate === 'function') {
            global.NetaCalendarView.setDate(targetDate, 'day');
          }
          if (typeof global.switchAppMode === 'function') {
            global.switchAppMode('calendar');
          }
          setTimeout(() => {
            if (global.NetaCalendarView && typeof global.NetaCalendarView.setDate === 'function') {
              global.NetaCalendarView.setDate(targetDate, 'day');
            }
          }, 50);
          if (global.showToast) {
            global.showToast(`📅 Đã mở Lịch ngày ${dateStr}!`);
          }
        } else if (action === 'qmdj') {
          // Mở Kỳ Môn Độn Giáp tại ngày giờ này
          const hourChi = btn.getAttribute('data-hour') || 'Tý';
          const parts = dateStr.split('/');
          const d = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          const y = parseInt(parts[2], 10);

          const HOUR_TO_H = {
            'Tý': 0, 'Sửu': 2, 'Dần': 4, 'Mão': 6,
            'Thìn': 8, 'Tị': 10, 'Ngọ': 12, 'Mùi': 14,
            'Thân': 16, 'Dậu': 18, 'Tuất': 20, 'Hợi': 22
          };
          const h = HOUR_TO_H[hourChi] != null ? HOUR_TO_H[hourChi] : 12;
          const targetDate = new Date(y, m, d, h, 0, 0);

          if (global.NetaQMDJView && typeof global.NetaQMDJView.setDate === 'function') {
            global.NetaQMDJView.setDate(targetDate);
          }
          if (typeof global.switchAppMode === 'function') {
            global.switchAppMode('qmdj');
          }
          if (global.showToast) global.showToast(`🔮 Đã mở bàn Kỳ Môn ngày ${dateStr} giờ ${hourChi}!`);
        }
      };
    });
  }

  // Global methods for deep interlinking
  function openTrachCatForSitting(sittingDeg, facingDeg) {
    if (sittingDeg != null) {
      state.mountainSittingDeg = parseFloat(sittingDeg);
      try { localStorage.setItem('neta_lakinh_sitting', String(sittingDeg)); } catch (_) {}
    }
    state.taskId = 'MUC_05'; // Động thổ / Nhập trạch
    if (typeof global.switchAppMode === 'function') {
      global.switchAppMode('trachcat');
    }
    runEvaluation();
    render();
    setTimeout(() => {
      const el = document.getElementById('view-trachcat');
      if (el) el.scrollTop = 0;
    }, 50);
    if (global.showToast) {
      global.showToast(`🎯 Đã nạp Tọa Sơn ${state.mountainSittingDeg}° vào Trạch Cát!`);
    }
  }

  function openTrachCatForDate(date) {
    if (date instanceof Date) {
      state.selectedMonth = date.getMonth() + 1;
      state.selectedYear = date.getFullYear();
    }
    if (typeof global.switchAppMode === 'function') {
      global.switchAppMode('trachcat');
    }
    runEvaluation();
    render();
  }

  const TrachCatView = {
    init: initTrachCatView,
    render: render,
    runEvaluation: runEvaluation,
    openForSitting: openTrachCatForSitting,
    openForDate: openTrachCatForDate,
    getState: () => state
  };

  global.NetaTrachCatView = TrachCatView;
  global.TrachCatView = TrachCatView;
  global.openTrachCatForSitting = openTrachCatForSitting;
  global.openTrachCatForDate = openTrachCatForDate;

})(typeof window !== 'undefined' ? window : globalThis);
