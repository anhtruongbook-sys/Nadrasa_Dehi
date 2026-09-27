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
      enable_16_criteria: true
    },
    results: null
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

  function initTrachCatView() {
    const container = document.getElementById('view-trachcat');
    if (!container) return;

    // Tự động nhận diện năm sinh từ Bát Tự / Tử Vi nếu có lưu trong localStorage
    try {
      const savedYear = localStorage.getItem('neta_user_birth_year');
      if (savedYear && /^\d{4}$/.test(savedYear)) {
        state.personYear = parseInt(savedYear, 10);
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

          <!-- Phân loại mục việc -->
          <div class="tc-cat-chips">
            ${CATEGORIES.map(cat => `
              <div class="tc-cat-chip ${state.category === cat ? 'active' : ''}" data-cat="${cat}">${cat}</div>
            `).join('')}
          </div>

          <!-- Thanh tìm kiếm & Dropdown 83 việc -->
          <div class="tc-task-selector-row">
            <input type="text" id="tc-search-task" class="tc-search-input" placeholder="🔍 Tìm mục việc (VD: Động thổ, Cưới gả, Nhập trạch...)" value="${state.searchTerm}">
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
                <input type="number" id="tc-input-year" class="tc-input" min="1920" max="2050" value="${state.personYear}">
                <button type="button" class="tc-badge tc-badge-info" style="cursor: pointer;" id="tc-btn-quick-year">Canh Ngọ (1990)</button>
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
            </div>

            <!-- Tọa Sơn Nhà (Tùy chọn) -->
            <div class="tc-field">
              <label class="tc-label">Tọa Sơn Nhà (0° - 359° hoặc 24 Sơn vị - Tùy chọn)</label>
              <div class="tc-input-row">
                <input type="number" id="tc-input-deg" class="tc-input" min="0" max="359" placeholder="VD: 0° (Tọa Tý), 180° (Tọa Ngọ)..." value="${state.mountainSittingDeg != null ? state.mountainSittingDeg : ''}">
                <button type="button" class="tc-badge tc-badge-warn" id="tc-btn-clear-deg" style="cursor: pointer;" title="Bỏ chọn tọa sơn">✕ Xóa</button>
              </div>
              <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 4px;">
                ${state.mountainSittingDeg != null ? `Đang phối hợp kiểm tra Trực Xung Tọa Sơn & Tam Sát tại ${state.mountainSittingDeg}°` : 'Để trống nếu xem việc cá nhân (Cưới hỏi, Khai trương, Đi xa...)'}
              </div>
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
            <div style="font-size: 0.73rem; color: #94a3b8; display: flex; flex-wrap: wrap; gap: 10px;">
              <span>🧭 Hỷ Thần: <strong style="color: #facc15;">${d.tc16.huong_xuat_hanh.hy_than}</strong></span>
              <span>💰 Tài Thần: <strong style="color: #4ade80;">${d.tc16.huong_xuat_hanh.tai_than}</strong></span>
              ${d.tc16.banh_to_ky ? `<span>📜 Bành Tổ: <em>${d.tc16.banh_to_ky}</em></span>` : ''}
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
            <div style="background: rgba(2, 132, 199, 0.1); border-left: 3px solid #38bdf8; border-radius: 4px; padding: 7px 10px; font-size: 0.74rem;">
              <div style="font-weight: 700; color: #38bdf8; margin-bottom: 2px;">
                🏡 PHỐI HỢP TỌA SƠN: Sơn ${d.house_sitting.son} (${d.house_sitting.direction} • ${d.house_sitting.deg}°)
              </div>
              <div style="color: #cbd5e1;">
                ${d.house_sitting.notes.length > 0 ? d.house_sitting.notes.join('<br>') : '✓ Tọa sơn bình hòa, không phạm Trực Xung hay Tam Sát.'}
              </div>
            </div>
          ` : ''}

          <!-- Bảng 6 Giờ Hoàng Đạo Xếp Hạng 9 Bậc -->
          <div class="tc-hours-section">
            <div class="tc-hours-title">
              <span>✨ 6 GIỜ HOÀNG ĐẠO (XẾP HẠNG THEO BẢN MỆNH)</span>
              <span style="font-size: 0.68rem; color: #cbd5e1;">Ưu tiên Bậc 1 (Lộc Tinh) & Bậc 2 (Quý Nhân)</span>
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
      inputYear.onchange = (e) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val >= 1920 && val <= 2050) {
          state.personYear = val;
          try { localStorage.setItem('neta_user_birth_year', String(val)); } catch (_) {}
          runEvaluation();
          render();
        }
      };
    }

    // Quick Year Button
    const btnQuickYear = document.getElementById('tc-btn-quick-year');
    if (btnQuickYear) {
      btnQuickYear.onclick = () => {
        state.personYear = 1990;
        try { localStorage.setItem('neta_user_birth_year', '1990'); } catch (_) {}
        runEvaluation();
        render();
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

    // Checkboxes
    const chkTrinh = document.getElementById('tc-chk-trinh');
    if (chkTrinh) chkTrinh.onchange = (e) => { state.schools.enable_trinh = e.target.checked; };
    const chkDc = document.getElementById('tc-chk-dongcong');
    if (chkDc) chkDc.onchange = (e) => { state.schools.enable_dong_cong = e.target.checked; };
    const chkFolk = document.getElementById('tc-chk-folk');
    if (chkFolk) chkFolk.onchange = (e) => { state.schools.enable_folk_filter = e.target.checked; };
    const chkTc16 = document.getElementById('tc-chk-tc16');
    if (chkTc16) chkTc16.onchange = (e) => { state.schools.enable_16_criteria = e.target.checked; };

    // Search button
    const btnRun = document.getElementById('tc-btn-run');
    if (btnRun) {
      btnRun.onclick = () => {
        runEvaluation();
        render();
        if (global.showToast) global.showToast('✨ Đã cập nhật bảng ngày Đại Cát!');
      };
    }

    // Action buttons inside Day Cards
    document.querySelectorAll('.tc-btn-action').forEach(btn => {
      btn.onclick = () => {
        const action = btn.getAttribute('data-action');
        const dateStr = btn.getAttribute('data-date'); // "DD/MM/YYYY"

        if (action === 'cal') {
          // Mở Lịch Âm Dương
          if (typeof global.switchAppMode === 'function') {
            global.switchAppMode('calendar');
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
    }
    state.taskId = 'MUC_05'; // Động thổ / Nhập trạch
    if (typeof global.switchAppMode === 'function') {
      global.switchAppMode('trachcat');
    }
    runEvaluation();
    render();
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
