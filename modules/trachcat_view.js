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
    taskId: 'MUC_15', // Nhập trạch mặc định
    category: 'Tất cả',
    searchTerm: '',
    personYear: 1990,
    personCanChi: 'Canh Ngọ',
    selectedMonth: (new Date()).getMonth() + 1,
    selectedYear: (new Date()).getFullYear(),
    mountainSittingDeg: null,
    schools: {
      enable_trinh: true,
      enable_dong_cong: true,
      enable_folk_filter: true,
      enable_16_criteria: true,
      enable_xkdg: false,
      enable_qimen: false
    },
    results: null
  };

  const CORE_TASKS = [
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
    if (taskId === 'MUC_05') {
      return `
        <div class="tc-task-guide-box">
          <div class="tc-task-guide-title">🏗️ NGUYÊN TẮC TRẠCH NHẬT ĐỘNG THỔ (KHỞI CÔNG BAN NỀN, ĐẶT MÓNG)</div>
          <ul class="tc-task-guide-list">
            <li><strong>15 Ngày cát căn bản:</strong> Giáp Tý, Giáp Dần, Giáp Thìn, Giáp Thân, Bính Tý, Bính Thân, Mậu Dần, Mậu Thìn, Kỷ Sửu, Kỷ Mùi, Canh Dần, Canh Thân, Tân Hợi, Quý Sửu, Quý Mùi.</li>
            <li><strong>⚠️ 3 Ngày đại kỵ động thổ:</strong> Quý Mùi, Ất Mùi, Mậu Ngọ (Hệ thống đã tự động lọc bỏ).</li>
            <li><strong>Cấm kỵ phương vị:</strong> Tuyệt đối không động thổ trên phương vị Thái Tuế của năm và phương Tam Sát.</li>
            <li><strong>Tọa Sơn nhà:</strong> Bắt buộc bấm <em>"🧭 Lấy Tọa Từ La Kinh"</em> bên dưới để tự động kiểm tra Trực Xung Tọa Sơn và Tam Sát.</li>
            <li><strong>Hạn gia chủ:</strong> Nếu phạm Tam Tai, Kim Lâu, Hoang Ốc xấu thì nên làm thủ tục <em>mượn tuổi</em> người thân hợp tuổi khởi sự.</li>
          </ul>
        </div>
      `;
    } else if (taskId === 'MUC_04') {
      return `
        <div class="tc-task-guide-box">
          <div class="tc-task-guide-title">🏠 NGUYÊN TẮC TRẠCH NHẬT CẤT NÓC (LÀM NÓC, GÁC ĐÒN DÔNG, ĐỔ MÁI, LỢP NHÀ)</div>
          <ul class="tc-task-guide-list">
            <li><strong>Bành Tổ Bách Kỵ:</strong> Ngày Ngọ kỵ lợp nhà, làm nóc (<em>"Ngọ bất thiêm cái, ốc chủ cánh trương"</em>).</li>
            <li><strong>Trực & Sao cát:</strong> Ưu tiên Trực Định, Thành, Khai; kỵ các sao hung: Tinh, Quỷ, Liễu, Ngưu.</li>
            <li><strong>Tọa Sơn:</strong> Ngày cất nóc tuyệt đối không được xung khắc với phương vị Tọa của ngôi nhà.</li>
          </ul>
        </div>
      `;
    } else if (taskId === 'MUC_15') {
      return `
        <div class="tc-task-guide-box">
          <div class="tc-task-guide-title">🏡 NGUYÊN TẮC TRẠCH NHẬT NHẬP TRẠCH (VỀ NHÀ MỚI, CHUYỂN CHỖ Ở, AN CƯ)</div>
          <ul class="tc-task-guide-list">
            <li><strong>21 Ngày cát căn bản:</strong> Chọn các ngày có trực Thành, Khai; tránh trực Phá, Bế, Nguy.</li>
            <li><strong>Trực xung Tọa Sơn & Tuổi:</strong> Tránh ngày xung với tuổi gia chủ và trực xung Tọa Sơn La Kinh.</li>
            <li><strong>Kỳ Môn Độn Giáp:</strong> Cung Sinh Môn không được lâm Tuần Không, không khắc Can Ngày.</li>
          </ul>
        </div>
      `;
    }
    return '';
  }

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

  function initTrachCatView() {
    const container = document.getElementById('view-trachcat');
    if (!container) return;

    // Tự động nhận diện năm sinh từ Bát Tự / Tử Vi nếu có lưu trong localStorage
    try {
      const savedYear = localStorage.getItem('neta_user_birth_year');
      if (savedYear && /^\d{4}$/.test(savedYear)) {
        state.personYear = parseInt(savedYear, 10);
      }
      const savedSitting = localStorage.getItem('neta_lakinh_sitting');
      if (savedSitting && !isNaN(parseFloat(savedSitting))) {
        state.mountainSittingDeg = parseFloat(savedSitting);
      }
    } catch (_) {}

    updatePersonInfo();
    runEvaluation();
    render();
  }

  function updatePersonInfo() {
    const eng = getEngine();
    if (!eng) return;
    const pData = eng.resolvePersonCanChi(state.personYear);
    state.personCanChi = pData.canChi;
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

  function render() {
    const container = document.getElementById('view-trachcat');
    if (!container) return;

    const eng = getEngine();
    if (!eng) {
      container.innerHTML = `<div class="tc-container"><div class="tc-panel tc-empty"><p>Đang nạp cơ sở dữ liệu Trạch Cát...</p></div></div>`;
      return;
    }

    const tasks = eng.tasks || [];
    const filteredTasks = tasks.filter(t => {
      const matchCat = (state.category === 'Tất cả') || (t.category === state.category);
      const matchSearch = (!state.searchTerm) || (t.name.toLowerCase().includes(state.searchTerm.toLowerCase()) || String(t.number).includes(state.searchTerm));
      return matchCat && matchSearch;
    });

    const yearSuit = state.results ? state.results.year_suitability : eng.evaluateYearSuitability(state.personYear, state.selectedYear);

    container.innerHTML = `
      <div class="tc-container">
        <!-- 1. Bộ lọc công việc & Gia chủ -->
        <div class="tc-panel">
          <div class="tc-panel-title">
            <span>🧭 TRẠCH CÁT (XEM NGÀY ĐẠI CÁT)</span>
          </div>

          <!-- Đại Sự Trọng Điểm (Quick Shortcuts) -->
          <div class="tc-quick-tasks-section">
            <div class="tc-quick-tasks-label">
              <span>⚡ ĐẠI SỰ TRỌNG ĐIỂM (CHỌN NHANH)</span>
            </div>
            <div class="tc-quick-tasks-grid">
              ${CORE_TASKS.map(ct => `
                <div class="tc-quick-pill ${state.taskId === ct.id ? 'active' : ''}" data-task-id="${ct.id}" data-cat="${ct.category}" title="${ct.desc}">
                  <span class="tc-quick-pill-icon">${ct.icon}</span>
                  <span>${ct.name}</span>
                </div>
              `).join('')}
              <div class="tc-quick-pill ${!CORE_TASKS.some(ct => ct.id === state.taskId) ? 'active' : ''}" data-action="all-tasks" title="Xem toàn bộ 83 mục việc Trạng Trình">
                <span class="tc-quick-pill-icon">📜</span>
                <span>83 Việc Khác...</span>
              </div>
            </div>
          </div>

          <!-- Thuyết minh nguyên tắc Trạch Nhật khi chọn việc xây dựng / nhà ở -->
          ${renderTaskGuideHTML(state.taskId)}

          <!-- Phân loại mục việc -->
          <div class="tc-cat-chips">
            ${CATEGORIES.map(cat => `
              <div class="tc-cat-chip ${state.category === cat ? 'active' : ''}" data-cat="${cat}">${cat}</div>
            `).join('')}
          </div>

          <!-- Thanh tìm kiếm & Dropdown 83 việc -->
          <div class="tc-task-selector-row">
            <input type="text" id="tc-search-task" class="tc-search-input" placeholder="🔍 Tìm mục việc (VD: Động thổ, Cất nóc, Nhập trạch, Cưới gả...)" value="${state.searchTerm}">
            <select id="tc-select-task" class="tc-select">
              ${filteredTasks.map(t => `
                <option value="${t.id}" ${state.taskId === t.id ? 'selected' : ''}>[${t.number}] ${t.name} (${t.category})</option>
              `).join('')}
            </select>
          </div>

          <!-- Thông tin gia chủ & Năm tuổi -->
          <div class="tc-grid-2">
            <div class="tc-field">
              <label class="tc-label">Năm sinh gia chủ (Dương lịch)</label>
              <div class="tc-input-row">
                <input type="number" id="tc-input-year" class="tc-input" min="1920" max="2050" value="${state.personYear}" placeholder="Nhập năm sinh (VD: 1979)...">
              </div>
              <div class="tc-person-badges">
                <span class="tc-badge tc-badge-info">Tuổi: ${state.personCanChi} (${yearSuit ? yearSuit.age_lunar : ''} tuổi mụ)</span>
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
              </div>
              ${yearSuit && (!yearSuit.overall_good_for_building) ? `
                <div style="font-size: 0.72rem; color: #f59e0b; margin-top: 4px; line-height: 1.35;">
                  💡 <em>Lưu ý: Gia chủ có phạm hạn trong năm (Tam Tai/Kim Lâu/Hoang Ốc). Nếu làm nhà / động thổ nên mượn tuổi người thân hợp tuổi đứng tên khởi sự.</em>
                </div>
              ` : ''}
            </div>

            <!-- Tọa Sơn Nhà & Liên kết La Kinh -->
            <div class="tc-field">
              <label class="tc-label">Tọa Sơn Nhà / Công Trình (Phối Hợp La Kinh)</label>
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
                  🏡 <strong>Tọa Sơn Đang Khóa: ${state.mountainSittingDeg}°</strong> • Tự động lọc bỏ các ngày Trực Xung Tọa Sơn & Tam Sát phương vị.
                </div>
              ` : `
                <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 4px;">
                  💡 <em>Bấm "Lấy Tọa Từ La Kinh" để nạp ngay hướng nhà đang đo trên bản đồ.</em>
                </div>
              `}
            </div>
          </div>

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
            <label class="tc-toggle-label highlight-xkdg" title="Huyền Không Đại Quái 64 Quẻ: Quái Khí, Quái Vận, Hợp Thập, Hà Đồ & Tọa Sơn">
              <input type="checkbox" id="tc-chk-xkdg" ${state.schools.enable_xkdg ? 'checked' : ''}> ☯ Huyền Không Đại Quái (64 Quẻ)
            </label>
            <label class="tc-toggle-label highlight-qimen" title="Kỳ Môn Tam Nguyên: 5 Quy Tắc Vàng Trương Chí Xuân & Khắc Ứng Cửu Tinh">
              <input type="checkbox" id="tc-chk-qimen" ${state.schools.enable_qimen ? 'checked' : ''}> 🔮 Kỳ Môn Tam Nguyên (Trương Chí Xuân)
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
      </div>
    `;

    bindEvents();
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

          <!-- Kỳ Môn Tam Nguyên Trương Chí Xuân Box (nếu bật) -->
          ${d.qimen ? `
            <div class="tc-qimen-box">
              <div class="tc-qimen-header">
                <span class="tc-qimen-title">🔮 KỲ MÔN TAM NGUYÊN (TRƯƠNG CHÍ XUÂN): ${d.qimen.rating} (${d.qimen.score > 0 ? '+' : ''}${d.qimen.score}đ)</span>
                <span class="tc-badge ${d.qimen.is_disqualified ? 'tc-badge-warn' : 'tc-badge-good'}">
                  ${d.qimen.is_disqualified ? 'Đại Hung Bị Loại' : 'Đắc Cách'}
                </span>
              </div>
              <div class="tc-qimen-body">
                <div class="tc-qimen-meta">
                  <span>Bàn: <strong>${d.qimen.cuc_name || 'Thời Gia Kỳ Môn'}</strong></span>
                  ${d.qimen.sinh_mon_palace ? `<span>Sinh Môn: <strong>Cung ${d.qimen.sinh_mon_palace}</strong></span>` : ''}
                  ${d.qimen.mountain_palace ? `<span>Tọa Sơn: <strong>Cung ${d.qimen.mountain_palace} (${d.qimen.mountain_god || ''})</strong></span>` : ''}
                </div>
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
                <div class="tc-hour-card ${h.rank <= 2 ? 'rank-top' : ''}">
                  <div class="tc-hour-name">Giờ ${h.hour_chi}</div>
                  <div class="tc-hour-time">${h.solar_time_range}</div>
                  <div class="tc-hour-rank">Bậc ${h.rank}</div>
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
    // Quick task pills (Đại Sự Trọng Điểm)
    document.querySelectorAll('.tc-quick-pill').forEach(el => {
      el.onclick = () => {
        const action = el.getAttribute('data-action');
        if (action === 'all-tasks') {
          const searchInput = document.getElementById('tc-search-task');
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
        runEvaluation();
        render();
      };
    }

    // Clear degree button
    const btnClearDeg = document.getElementById('tc-btn-clear-deg');
    if (btnClearDeg) {
      btnClearDeg.onclick = () => {
        state.mountainSittingDeg = null;
        runEvaluation();
        render();
      };
    }

    // Month pills
    document.querySelectorAll('.tc-month-pill').forEach(el => {
      el.onclick = () => {
        const m = parseInt(el.getAttribute('data-month'), 10);
        if (!isNaN(m)) {
          state.selectedMonth = m;
          runEvaluation();
          render();
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
          render();
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
