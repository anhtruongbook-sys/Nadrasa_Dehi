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

  const state = {
    viewMode: 'specific', // 'specific' (Thẩm định ngày giờ cụ thể) | 'month' (Tìm ngày tốt trong tháng)
    taskId: 'CHUNG', // Việc Chung mặc định
    category: 'Tất cả',
    searchTerm: '',
    personYear: 1990,
    personCanChi: 'Canh Ngọ',
    isMale: true,
    deathYear: (new Date()).getFullYear(),
    deathMonthLunar: 8,
    deathDayLunar: 15,
    deathHourChi: 'Ngọ',
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

    const ttRes = eng.calculateTrungTang({
      birthYear: state.personYear,
      deathYear: state.deathYear || state.selectedYear,
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
            Căn cứ tuổi người mất (${gender_text}, sinh năm ${state.personYear}, hưởng thọ ${tuoi_tho} tuổi) &amp; 4 trụ thời điểm lâm chung (Âm lịch)
          </span>
        </div>

        <!-- Các ô nhập Ngày Giờ Mất (Âm lịch) -->
        <div class="tc-tt-inputs-grid">
          <div class="tc-field">
            <label class="tc-label">Năm mất (DL / ÂL)</label>
            <input type="number" id="tc-tt-death-year" class="tc-input" min="1920" max="2050" value="${state.deathYear || state.selectedYear}">
          </div>
          <div class="tc-field">
            <label class="tc-label">Tháng mất (Âm lịch)</label>
            <select id="tc-tt-death-month" class="tc-select">
              ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => `
                <option value="${m}" ${(state.deathMonthLunar || 8) === m ? 'selected' : ''}>Tháng ${m} ÂL</option>
              `).join('')}
            </select>
          </div>
          <div class="tc-field">
            <label class="tc-label">Ngày mất (Âm lịch)</label>
            <input type="number" id="tc-tt-death-day" class="tc-input" min="1" max="30" value="${state.deathDayLunar || 15}" placeholder="1 - 30">
          </div>
          <div class="tc-field">
            <label class="tc-label">Giờ mất (Chi)</label>
            <select id="tc-tt-death-hour" class="tc-select">
              ${CHI_HOURS.map(h => `
                <option value="${h.chi}" ${(state.deathHourChi || 'Ngọ') === h.chi ? 'selected' : ''}>Giờ ${h.label}</option>
              `).join('')}
            </select>
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

    // Tự động nhận diện năm sinh và giới tính nếu có lưu trong localStorage
    try {
      const savedYear = localStorage.getItem('neta_user_birth_year');
      if (savedYear && /^\d{4}$/.test(savedYear)) {
        state.personYear = parseInt(savedYear, 10);
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
    const daysInMonth = new Date(y, m, 0).getDate();

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m - 1, daysInMonth);

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

    let personLabel = 'Năm sinh gia chủ (Dương lịch)';
    if (isFuneral) {
      personLabel = 'Năm sinh Người Mất / Âm trạch (Dương lịch)';
    } else if (isMarriage) {
      personLabel = 'Năm sinh Cô dâu / Hôn nhân (Dương lịch)';
    } else if (!isBuilding && !isGeneral) {
      personLabel = 'Năm sinh Chủ sự / Người thực hiện (Dương lịch)';
    }

    const ageText = isFuneral
      ? `Tuổi: ${state.personCanChi} (Hưởng thọ ${yearSuit ? yearSuit.age_lunar : ''} tuổi)`
      : `Tuổi: ${state.personCanChi} (${yearSuit ? yearSuit.age_lunar : ''} tuổi mụ)`;

    const personChi = (state.personCanChi.split(' ')[1]) || '';
    const curDateStr = state.specificDateStr || (state.specificDate ? `${state.specificDate.getFullYear()}-${String(state.specificDate.getMonth() + 1).padStart(2, '0')}-${String(state.specificDate.getDate()).padStart(2, '0')}` : '');

    return `
      <!-- 1. Panel Nhập Thông Tin Thẩm Định -->
      <div class="tc-panel">
        <!-- Sự vụ (Chọn Nhanh) -->
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

        <!-- Thuyết minh nguyên tắc Trạch Nhật (Collapsible) -->
        ${renderTaskGuideHTML(state.taskId)}

        <!-- Phân loại mục việc (Chỉ hiện khi tìm 83 việc) -->
        <div class="tc-cat-chips" style="${state.taskId === 'CHUNG' ? 'display:none;' : ''}">
          ${CATEGORIES.map(cat => `
            <div class="tc-cat-chip ${state.category === cat ? 'active' : ''}" data-cat="${cat}">${cat}</div>
          `).join('')}
        </div>

        <!-- Thanh tìm kiếm & Dropdown 83 việc -->
        <div class="tc-task-selector-row" style="${state.taskId === 'CHUNG' ? 'display:none;' : ''}">
          <input type="text" id="tc-search-task-spec" class="tc-search-input" placeholder="🔍 Tìm mục việc (VD: Động thổ, Cất nóc, Nhập trạch, Cưới gả...)" value="${state.searchTerm}">
          <select id="tc-select-task-spec" class="tc-select">
            <option value="CHUNG" ${state.taskId === 'CHUNG' ? 'selected' : ''}>[🌟] Việc Chung / Bách Sự</option>
            ${filteredTasks.map(t => `
              <option value="${t.id}" ${state.taskId === t.id ? 'selected' : ''}>[${t.number}] ${t.name} (${t.category})</option>
            `).join('')}
          </select>
        </div>

        <!-- Chọn Ngày và Khung Giờ Cụ Thể -->
        <div class="tc-datetime-grid">
          <!-- Chọn Ngày -->
          <div class="tc-field">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
              <label class="tc-label" style="margin-bottom: 0;">📅 Chọn Ngày Khởi Sự (Dương Lịch)</label>
              <div style="display: flex; gap: 4px;">
                <button type="button" class="tc-quick-btn" id="tc-btn-today">Hôm nay</button>
                <button type="button" class="tc-quick-btn" id="tc-btn-tomorrow">Ngày mai</button>
              </div>
            </div>
            <div class="tc-date-input-wrap">
              <input type="date" id="tc-input-specific-date" class="tc-input-date" value="${curDateStr}">
            </div>
          </div>

          <!-- Chọn Giờ -->
          <div class="tc-field">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
              <label class="tc-label" style="margin-bottom: 0;">⏰ Chọn Khung Giờ Can Chi</label>
              <button type="button" class="tc-quick-btn" id="tc-btn-cur-hour">🕒 Giờ Hiện Tại</button>
            </div>
            <div>
              <select id="tc-select-specific-hour" class="tc-select-hour">
                <option value="">-- Tự động chọn Giờ Hoàng Đạo tốt nhất --</option>
                ${CHI_HOURS.map(h => `
                  <option value="${h.chi}" ${state.specificHourChi === h.chi ? 'selected' : ''}>
                    Giờ ${h.label}
                  </option>
                `).join('')}
              </select>
            </div>
          </div>
        </div>

        <!-- Thông tin gia chủ & Năm tuổi -->
        <div class="tc-grid-2" style="margin-top: 10px;">
          <div class="tc-field">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
              <label class="tc-label" style="margin-bottom: 0;">${personLabel}</label>
              <div class="ucc-pill-gender" style="height: 26px; padding: 2px;">
                <button type="button" class="ucc-gender-btn ${state.isMale ? 'active male' : ''}" id="tc-btn-male" style="height: 22px; padding: 0 8px; font-size: 0.72rem;">♂ Nam</button>
                <button type="button" class="ucc-gender-btn ${!state.isMale ? 'active female' : ''}" id="tc-btn-female" style="height: 22px; padding: 0 8px; font-size: 0.72rem;">♀ Nữ</button>
              </div>
            </div>
            <div class="tc-input-row">
              <input type="number" id="tc-input-year" class="tc-input" min="1920" max="2050" value="${state.personYear}" placeholder="Nhập năm sinh (VD: 1990)...">
            </div>
            <div class="tc-person-badges">
              <span class="tc-badge tc-badge-info">${ageText}</span>
              ${napAm ? `
                <span class="tc-badge" style="background: rgba(168, 85, 247, 0.15); color: #9333ea; border: 1px solid rgba(168, 85, 247, 0.35); font-weight: 700;">
                  Mệnh: ${napAm}
                </span>
              ` : ''}
              ${cungPhi ? `
                <span class="tc-badge" style="background: rgba(14, 165, 233, 0.15); color: #0284c7; border: 1px solid rgba(14, 165, 233, 0.35); font-weight: 700;">
                  ${cungPhi.symbol} Cung ${cungPhi.name} (${cungPhi.element} • ${cungPhi.group})
                </span>
              ` : ''}
              ${isBuilding ? `
                ${yearSuit ? `
                  <span class="tc-badge ${yearSuit.tam_tai.is_tam_tai ? 'tc-badge-bad' : 'tc-badge-good'}">
                    ${yearSuit.tam_tai.is_tam_tai ? '⚠️ Phạm Tam Tai' : '✓ Không Tam Tai'}
                  </span>
                  <span class="tc-badge ${yearSuit.kim_lau.is_kim_lau ? 'tc-badge-bad' : 'tc-badge-good'}">
                    ${yearSuit.kim_lau.is_kim_lau ? `⚠️ Kim Lâu (${yearSuit.kim_lau.type})` : '✓ Không Kim Lâu'}
                  </span>
                  <span class="tc-badge ${yearSuit.hoang_oc.is_good ? 'tc-badge-good' : 'tc-badge-bad'}">
                    ${yearSuit.hoang_oc.cung_name} (${yearSuit.hoang_oc.is_good ? 'Tốt' : 'Xấu'})
                  </span>
                ` : ''}
              ` : ''}
            </div>
          </div>

          <!-- Tọa Sơn Nhà & Liên kết La Kinh -->
          <div class="tc-field">
            <label class="tc-label">${isFuneral ? 'Tọa Sơn Mộ Phần / Huyệt Mộ (Phối La Kinh)' : (isBuilding ? 'Tọa Sơn Nhà / Công Trình (Phối La Kinh)' : 'Tọa Sơn Hướng Vị (Phối Hợp La Kinh)')}</label>
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
            ${state.mountainSittingDeg != null ? `
              <div class="tc-mountain-active-card">
                <div>🏡 <strong>${isFuneral ? 'Tọa Mộ' : 'Tọa Sơn'}: ${state.mountainSittingDeg}°</strong> ${batTrach ? `• <strong>${isFuneral ? 'Hướng Mộ' : 'Hướng Nhà'}: ${batTrach.facing_deg}° (${batTrach.facing_name})</strong>` : ''}</div>
                ${batTrach && cungPhi ? `
                  <div style="margin-top: 4px; font-size: 0.75rem;">
                    Bát Trạch (${state.isMale ? 'Nam' : 'Nữ'} ${cungPhi.name} • ${cungPhi.group}): 
                    <span style="font-weight: 800; color: ${batTrach.is_good ? '#10b981' : '#ef4444'};">
                      ${batTrach.is_good ? '✓' : '⚠️'} Cung ${batTrach.du_nien} (${batTrach.rating})
                    </span>
                  </div>
                ` : ''}
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Trùng Tang / Nhập Mộ / Thiên Di (Khi chọn mục việc Tang lễ / An táng) -->
        ${isFuneral ? renderTrungTangSection() : ''}

        <!-- Nút Tra Cứu Thẩm Định -->
        <div style="margin-top: 14px;">
          <button type="button" id="tc-btn-run-specific" class="tc-btn-search">
            ⚡ THẨM ĐỊNH NGÀY GIỜ NÀY
          </button>
        </div>
      </div>

      <!-- 2. Kết Quả Thẩm Định Cụ Thể -->
      ${renderSpecificResultHTML()}
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
          <div class="tc-spec-hero-title-wrap">
            <div class="tc-spec-hero-title">${res.verdict_title}</div>
            <div class="tc-spec-hero-meta">
              📅 Ngày ${res.solar_date} (Âm: ${res.lunar_date} - ${res.can_chi_day}) • ⏰ Giờ ${curHour ? curHour.hour_chi + ' (' + curHour.solar_time_range + ')' : 'Hoàng Đạo'} • 🎯 Việc: <strong>${res.task.name}</strong>
            </div>
          </div>
          <div class="tc-spec-score-box">
            <div class="tc-spec-score-badge">${res.score}/100đ</div>
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
              <span class="tc-diag-item-val" style="color: ${res.dong_cong && (res.dong_cong.rating === 'Đại Kiết' || res.dong_cong.rating === 'Thứ Kiết') ? '#10b981' : (res.dong_cong && res.dong_cong.rating === 'Đại Hung' ? '#ef4444' : '#f59e0b')}; font-weight: 700;">
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
                <span class="tc-diag-item-val" style="color: #ef4444; font-size: 0.74rem;">${res.tc16.banh_to_ky}</span>
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
              <span class="tc-diag-item-val" style="color: ${curHour && curHour.rank <= 2 ? '#10b981' : (curHour && curHour.rank >= 7 ? '#ef4444' : '#f59e0b')}; font-weight: 700;">
                ${curHour ? curHour.recommendation : ''}
              </span>
            </div>
            <div class="tc-diag-item">
              <span class="tc-diag-item-lbl">Ngũ Bất Ngộ Thời:</span>
              <span class="tc-diag-item-val" style="color: ${curHour && curHour.is_five_disharmony ? '#ef4444' : '#10b981'};">
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
        <div class="tc-panel" style="margin-top: 10px; border-color: rgba(52, 211, 153, 0.35);">
          <div class="tc-panel-title" style="color: #34d399;">
            <span>💡 GỢI Ý NGÀY ĐẠI CÁT GẦN NHẤT THAY THẾ</span>
          </div>
          <div style="font-size: 0.78rem; color: #94a3b8; margin-bottom: 8px;">
            Vì ngày ${res.solar_date} chưa đạt chuẩn tối ưu (${res.score}đ), bạn có thể cân nhắc đổi sang các ngày tốt tiếp theo sau:
          </div>
          <div class="tc-nearby-grid">
            ${res.nearby_better_days.map(nb => `
              <div class="tc-nearby-card">
                <div class="tc-nearby-info">
                  <span class="tc-nearby-date">📅 ${nb.solar_date} (${nb.total_score}đ)</span>
                  <span class="tc-nearby-canchi">Âm: ${nb.lunar_date} • ${nb.can_chi_day} (Trực ${nb.truc_name})</span>
                  <span style="font-size: 0.72rem; color: #f59e0b;">Giờ tốt: Giờ ${nb.best_hour ? nb.best_hour.hour_chi : 'Hoàng Đạo'}</span>
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

    let personLabel = 'Năm sinh gia chủ (Dương lịch)';
    if (isFuneral) {
      personLabel = 'Năm sinh Người Mất / Âm trạch (Dương lịch)';
    } else if (isMarriage) {
      personLabel = 'Năm sinh Cô dâu / Hôn nhân (Dương lịch)';
    } else if (!isBuilding && !isGeneral) {
      personLabel = 'Năm sinh Chủ sự / Người thực hiện (Dương lịch)';
    }

    const ageText = isFuneral
      ? `Tuổi: ${state.personCanChi} (Hưởng thọ ${yearSuit ? yearSuit.age_lunar : ''} tuổi)`
      : `Tuổi: ${state.personCanChi} (${yearSuit ? yearSuit.age_lunar : ''} tuổi mụ)`;

    const personChi = (state.personCanChi.split(' ')[1]) || '';

    return `
      <!-- 1. Bộ lọc công việc & Gia chủ -->
      <div class="tc-panel">
        <!-- Sự vụ (Chọn Nhanh) -->
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

        <!-- Thuyết minh nguyên tắc Trạch Nhật (Collapsible) -->
        ${renderTaskGuideHTML(state.taskId)}

        <!-- Phân loại mục việc -->
        <div class="tc-cat-chips" style="${state.taskId === 'CHUNG' ? 'display:none;' : ''}">
          ${CATEGORIES.map(cat => `
            <div class="tc-cat-chip ${state.category === cat ? 'active' : ''}" data-cat="${cat}">${cat}</div>
          `).join('')}
        </div>

        <!-- Thanh tìm kiếm & Dropdown 83 việc -->
        <div class="tc-task-selector-row" style="${state.taskId === 'CHUNG' ? 'display:none;' : ''}">
          <input type="text" id="tc-search-task" class="tc-search-input" placeholder="🔍 Tìm mục việc (VD: Động thổ, Cất nóc, Nhập trạch, Cưới gả...)" value="${state.searchTerm}">
          <select id="tc-select-task" class="tc-select">
            <option value="CHUNG" ${state.taskId === 'CHUNG' ? 'selected' : ''}>[🌟] Việc Chung / Bách Sự</option>
            ${filteredTasks.map(t => `
              <option value="${t.id}" ${state.taskId === t.id ? 'selected' : ''}>[${t.number}] ${t.name} (${t.category})</option>
            `).join('')}
          </select>
        </div>

        <!-- Thông tin gia chủ & Năm tuổi -->
        <div class="tc-grid-2">
          <div class="tc-field">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
              <label class="tc-label" style="margin-bottom: 0;">${personLabel}</label>
              <div class="ucc-pill-gender" style="height: 26px; padding: 2px;">
                <button type="button" class="ucc-gender-btn ${state.isMale ? 'active male' : ''}" id="tc-btn-male" style="height: 22px; padding: 0 8px; font-size: 0.72rem;">♂ Nam</button>
                <button type="button" class="ucc-gender-btn ${!state.isMale ? 'active female' : ''}" id="tc-btn-female" style="height: 22px; padding: 0 8px; font-size: 0.72rem;">♀ Nữ</button>
              </div>
            </div>
            <div class="tc-input-row">
              <input type="number" id="tc-input-year" class="tc-input" min="1920" max="2050" value="${state.personYear}" placeholder="Nhập năm sinh (VD: 1944)...">
            </div>
            <div class="tc-person-badges">
              <span class="tc-badge tc-badge-info">${ageText}</span>
              ${napAm ? `
                <span class="tc-badge" style="background: rgba(168, 85, 247, 0.15); color: #9333ea; border: 1px solid rgba(168, 85, 247, 0.35); font-weight: 700;">
                  Mệnh: ${napAm}
                </span>
              ` : ''}
              ${cungPhi ? `
                <span class="tc-badge" style="background: rgba(14, 165, 233, 0.15); color: #0284c7; border: 1px solid rgba(14, 165, 233, 0.35); font-weight: 700;">
                  ${cungPhi.symbol} Cung ${cungPhi.name} (${cungPhi.element} • ${cungPhi.group})
                </span>
              ` : ''}

              ${isFuneral ? `
                <span class="tc-badge tc-badge-good" title="Tang lễ không tính hạn làm nhà">✓ Tang lễ không tính Kim Lâu / Hoang Ốc</span>
                <span class="tc-badge tc-badge-warn">Kỵ ngày trực xung ${personChi}</span>
              ` : (isMarriage ? `
                <span class="tc-badge ${yearSuit && yearSuit.tam_tai.is_tam_tai ? 'tc-badge-bad' : 'tc-badge-good'}">
                  ${yearSuit && yearSuit.tam_tai.is_tam_tai ? '⚠️ Phạm Tam Tai' : '✓ Không Tam Tai'}
                </span>
                ${yearSuit ? `
                  <span class="tc-badge ${yearSuit.kim_lau.is_kim_lau ? 'tc-badge-bad' : 'tc-badge-good'}">
                    ${yearSuit.kim_lau.is_kim_lau ? `⚠️ Kim Lâu (${yearSuit.kim_lau.type})` : '✓ Không Kim Lâu'}
                  </span>
                ` : ''}
              ` : (isBuilding ? `
                ${yearSuit ? `
                  <span class="tc-badge ${yearSuit.tam_tai.is_tam_tai ? 'tc-badge-bad' : 'tc-badge-good'}">
                    ${yearSuit.tam_tai.is_tam_tai ? '⚠️ Phạm Tam Tai' : '✓ Không Tam Tai'}
                  </span>
                  <span class="tc-badge ${yearSuit.kim_lau.is_kim_lau ? 'tc-badge-bad' : 'tc-badge-good'}">
                    ${yearSuit.kim_lau.is_kim_lau ? `⚠️ Kim Lâu (${yearSuit.kim_lau.type})` : '✓ Không Kim Lâu'}
                  </span>
                  <span class="tc-badge ${yearSuit.hoang_oc.is_good ? 'tc-badge-good' : 'tc-badge-bad'}">
                    ${yearSuit.hoang_oc.cung_name} (${yearSuit.hoang_oc.is_good ? 'Tốt' : 'Xấu'})
                  </span>
                ` : ''}
              ` : `
                ${yearSuit ? `
                  <span class="tc-badge ${yearSuit.tam_tai.is_tam_tai ? 'tc-badge-bad' : 'tc-badge-good'}">
                    ${yearSuit.tam_tai.is_tam_tai ? '⚠️ Phạm Tam Tai' : '✓ Không Tam Tai'}
                  </span>
                ` : ''}
              `))}
            </div>

            ${isFuneral ? `
              <div style="font-size: 0.72rem; color: #0284c7; margin-top: 5px; line-height: 1.4; background: rgba(14, 165, 233, 0.08); padding: 6px 10px; border-radius: 6px; border: 1px dashed rgba(14, 165, 233, 0.35);">
                ⚰️ <strong>Phép xem ngày Tang lễ / An táng theo phong thủy Âm trạch:</strong>
                <div style="margin-top: 2px;">• <strong>Căn cứ số 1:</strong> Tuổi &amp; Bản mệnh của <strong>Người đã khuất</strong> để chọn ngày không Trực Xung Địa Chi (${personChi}), tránh ngày xung ngũ hành, kiêng ngày Trùng Tang, Tam Tang, Thập Ác Đại Bại, Sát Chủ Âm Phần.</div>
                <div style="margin-top: 1px;">• <strong>Bất biến:</strong> Tang lễ tuyệt đối <em>không tính hạn Kim Lâu và Hoang Ốc</em>.</div>
              </div>
            ` : (isMarriage ? `
              <div style="font-size: 0.72rem; color: #9333ea; margin-top: 5px; line-height: 1.4; background: rgba(168, 85, 247, 0.08); padding: 6px 10px; border-radius: 6px; border: 1px dashed rgba(168, 85, 247, 0.35);">
                💍 <strong>Phép xem ngày Cưới hỏi / Hôn nhân:</strong>
                <div style="margin-top: 2px;">• Cổ nhân định lệ <em>"Lấy vợ xem tuổi đàn bà"</em> — Hạn Kim Lâu cưới gả tính theo tuổi mụ của <strong>Cô dâu</strong> (vui lòng chọn "♀ Nữ").</div>
                <div style="margin-top: 1px;">• Kiêng ngày Tam Nương, Nguyệt Kỵ, Cô Thần, Quả Tú. Hôn nhân <em>không tính hạn Hoang Ốc</em>.</div>
              </div>
            ` : (isBuilding && yearSuit && (!yearSuit.overall_good_for_building) ? `
              <div style="font-size: 0.72rem; color: #f59e0b; margin-top: 4px; line-height: 1.35;">
                💡 <em>Lưu ý: Gia chủ phạm hạn làm nhà trong năm (Tam Tai/Kim Lâu/Hoang Ốc). Nếu làm nhà / động thổ nên mượn tuổi người thân hợp tuổi đứng tên khởi sự.</em>
              </div>
            ` : ''))}
          </div>

          <!-- Tọa Sơn Nhà & Liên kết La Kinh -->
          <div class="tc-field">
            <label class="tc-label">${isFuneral ? 'Tọa Sơn Mộ Phần / Huyệt Mộ (Âm Trạch - Phối La Kinh)' : (isBuilding ? 'Tọa Sơn Nhà / Công Trình (Dương Trạch - Phối La Kinh)' : 'Tọa Sơn Hướng Vị (Phối Hợp La Kinh)')}</label>
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
            ${state.mountainSittingDeg != null ? `
              <div class="tc-mountain-active-card">
                <div>🏡 <strong>${isFuneral ? 'Tọa Mộ' : 'Tọa Sơn'}: ${state.mountainSittingDeg}°</strong> ${batTrach ? `• <strong>${isFuneral ? 'Hướng Mộ' : 'Hướng Nhà'}: ${batTrach.facing_deg}° (${batTrach.facing_name})</strong>` : ''}</div>
                ${batTrach && cungPhi ? `
                  <div style="margin-top: 4px; font-size: 0.75rem;">
                    Bát Trạch ${isFuneral ? 'mộ phần' : 'gia chủ'} (${state.isMale ? 'Nam' : 'Nữ'} ${cungPhi.name} • ${cungPhi.group}): 
                    <span style="font-weight: 800; color: ${batTrach.is_good ? '#10b981' : '#ef4444'};">
                      ${batTrach.is_good ? '✓' : '⚠️'} Cung ${batTrach.du_nien} (${batTrach.rating})
                    </span>
                  </div>
                ` : ''}
              </div>
            ` : `
              <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 4px;">
                💡 <em>Bấm "Lấy Tọa Từ La Kinh" để nạp ngay hướng ${isFuneral ? 'mộ phần' : 'nhà'} đang đo trên bản đồ.</em>
              </div>
            `}
          </div>
        </div>

        <!-- Trùng Tang / Nhập Mộ / Thiên Di (Khi chọn mục việc Tang lễ / An táng) -->
        ${isFuneral ? renderTrungTangSection() : ''}

        <!-- Lựa chọn tháng -->
        <div style="margin-top: 10px;">
          <label class="tc-label">Chọn Tháng Dương Lịch (Năm ${state.selectedYear})</label>
          <div class="tc-months-grid">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => `
              <div class="tc-month-pill ${state.selectedMonth === m ? 'active' : ''}" data-month="${m}">Tháng ${m}</div>
            `).join('')}
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

        <!-- Nút tra cứu -->
        <div style="margin-top: 14px;">
          <button type="button" id="tc-btn-run" class="tc-btn-search">
            ⚡ TRA CỨU NGÀY ĐẠI CÁT
          </button>
        </div>
      </div>

      <!-- 2. Kết quả tra cứu -->
      ${renderResultsHTML()}
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
          <button type="button" class="tc-view-mode-btn ${state.viewMode === 'specific' ? 'active' : ''}" data-vmode="specific">
            <span>🔍 Thẩm Định 1 Ngày</span>
          </button>
          <button type="button" class="tc-view-mode-btn ${state.viewMode === 'month' ? 'active' : ''}" data-vmode="month">
            <span>📅 Tìm Trong Tháng</span>
          </button>
        </div>

        ${state.viewMode === 'specific' ? renderSpecificModeHTML() : renderMonthModeHTML()}
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

    // Specific Date Input
    const inputSpecDate = document.getElementById('tc-input-specific-date');
    if (inputSpecDate) {
      inputSpecDate.onchange = (e) => {
        state.specificDateStr = e.target.value;
        runSpecificEvaluation();
        render(true);
      };
    }

    // Quick Date Buttons
    const btnToday = document.getElementById('tc-btn-today');
    if (btnToday) {
      btnToday.onclick = () => {
        const now = new Date();
        state.specificDate = now;
        state.specificDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        runSpecificEvaluation();
        render(true);
      };
    }

    const btnTomorrow = document.getElementById('tc-btn-tomorrow');
    if (btnTomorrow) {
      btnTomorrow.onclick = () => {
        const tom = new Date(Date.now() + 86400000);
        state.specificDate = tom;
        state.specificDateStr = `${tom.getFullYear()}-${String(tom.getMonth() + 1).padStart(2, '0')}-${String(tom.getDate()).padStart(2, '0')}`;
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

    // Trùng Tang events (Khi xem mục việc tang lễ / an táng)
    const inputTTDeathYear = document.getElementById('tc-tt-death-year');
    if (inputTTDeathYear) {
      inputTTDeathYear.onchange = (e) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val >= 1920 && val <= 2050) {
          state.deathYear = val;
          render();
        }
      };
    }

    const selTTDeathMonth = document.getElementById('tc-tt-death-month');
    if (selTTDeathMonth) {
      selTTDeathMonth.onchange = (e) => {
        state.deathMonthLunar = parseInt(e.target.value, 10);
        render();
      };
    }

    const inputTTDeathDay = document.getElementById('tc-tt-death-day');
    if (inputTTDeathDay) {
      inputTTDeathDay.onchange = (e) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val >= 1 && val <= 30) {
          state.deathDayLunar = val;
          render();
        }
      };
    }

    const selTTDeathHour = document.getElementById('tc-tt-death-hour');
    if (selTTDeathHour) {
      selTTDeathHour.onchange = (e) => {
        state.deathHourChi = e.target.value;
        render(true);
      };
    }

    // Month pills
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
