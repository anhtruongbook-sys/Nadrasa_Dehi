/**
 * NETA LIGHT - LỤC NHÂM ĐẠI ĐỘN VIEW MODULE (luc_nham_view.js)
 * Giao diện trực quan hoá Bàn Quẻ Lục Nhâm Thần Khóa 8 Lớp Thông Tin
 * 
 * Tính năng:
 * 1. Banner Thời Khắc & Trạng Thái Đán Quý (Ngày) / Mộ Quý (Đêm).
 * 2. Hero Section: Tam Truyền (Sơ - Trung - Mạt) với Ngũ hành màu sắc, Thiên Tướng, Lục Thân.
 * 3. Tứ Khóa (Can Dương, Can Âm, Chi Dương, Chi Âm) hiển thị Tặc, Khắc, Tỷ, Sinh.
 * 4. Ma trận 12 Cung 4x4 (Dial Matrix) theo Địa Bàn cổ truyền & Trung Cung HUD.
 * 5. Chuyển đổi View: Bàn cờ 8 Lớp Chi Tiết & Bàn Cờ Cảm Ứng Tối Giản.
 * 6. Drawer Tra Cứu Tương Tác 12 Cung với luận giải chuyên sâu.
 * 7. Modal Đổi Quẻ & Tùy biến thời khắc, kết nối trực tiếp với NetaCalendarEngine.
 */

(function (global) {
  'use strict';

  let currentChart = null;
  let currentDate = new Date();
  let currentViewMode = 'classic'; // 'classic' (8 lớp) | 'touch' (tối giản)
  let selectedBox = 'Tỵ';           // Địa bàn đang chọn
  let customDaytime = null;        // null: auto, true: đán, false: mộ
  let customNguyetTuong = '';      // rỗng: auto theo tiết khí
  let birthYear = 1982;
  let gender = 'Nam';

  // Thứ tự 12 vị trí trên ma trận 4x4 theo Địa Bàn cổ truyền (Khớp hoàn toàn với Excel)
  // Hàng 1: Tỵ, Ngọ, Mùi, Thân
  // Hàng 2: Thìn, null, null, Dậu
  // Hàng 3: Mão, null, null, Tuất
  // Hàng 4: Dần, Sửu, Tý, Hợi
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
        max-width: 520px;
        margin: 0 auto;
        padding: 8px 10px 80px;
        box-sizing: border-box;
        color: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .lucnham-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 8px;
        border-bottom: 1px solid #1e293b;
        margin-bottom: 8px;
      }
      .lucnham-title {
        font-size: 15px;
        font-weight: 800;
        color: #f59e0b;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .lucnham-badge {
        font-size: 10px;
        font-weight: 600;
        padding: 2px 7px;
        border-radius: 9999px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .lucnham-badge-day {
        background: rgba(245, 158, 11, 0.15);
        color: #fde68a;
        border: 1px solid rgba(245, 158, 11, 0.4);
      }
      .lucnham-badge-night {
        background: rgba(99, 102, 241, 0.15);
        color: #c7d2fe;
        border: 1px solid rgba(99, 102, 241, 0.4);
      }
      .lucnham-card {
        background: #0f172a;
        border: 1px solid #1e293b;
        border-radius: 12px;
        padding: 10px;
        margin-bottom: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
      }
      .lucnham-hero-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
        text-align: center;
      }
      .lucnham-truyen-box {
        background: #020617;
        border: 1px solid #1e293b;
        border-radius: 10px;
        padding: 8px 4px;
        position: relative;
        transition: all 0.2s ease;
      }
      .lucnham-truyen-box:hover {
        border-color: #f59e0b;
      }
      .lucnham-truyen-tag {
        position: absolute;
        top: 3px;
        left: 6px;
        font-size: 9px;
        font-weight: 800;
        color: #94a3b8;
      }
      .lucnham-truyen-chi {
        font-size: 22px;
        font-weight: 900;
        line-height: 1.1;
        margin: 4px 0 2px;
      }
      .lucnham-tukhoa-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
        text-align: center;
      }
      .lucnham-khoa-box {
        background: #020617;
        border: 1px solid #1e293b;
        border-radius: 10px;
        padding: 6px 2px;
      }
      .lucnham-dial-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 4px;
      }
      .lucnham-cung-cell {
        background: #020617;
        border: 1px solid #1e293b;
        border-radius: 8px;
        padding: 4px;
        min-height: 82px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        cursor: pointer;
        transition: all 0.15s ease;
        position: relative;
        overflow: hidden;
      }
      .lucnham-cung-cell:hover {
        border-color: #f59e0b;
      }
      .lucnham-cung-active {
        border-color: #f59e0b !important;
        background: rgba(245, 158, 11, 0.1) !important;
        box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
      }
      .lucnham-center-hud {
        grid-column: span 2;
        grid-row: span 2;
        background: radial-gradient(circle at center, #1e293b, #0f172a);
        border: 1px solid #334155;
        border-radius: 10px;
        padding: 8px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
      }
      .lucnham-btn {
        background: #1e293b;
        color: #e2e8f0;
        border: 1px solid #334155;
        border-radius: 6px;
        padding: 4px 8px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        transition: all 0.15s;
      }
      .lucnham-btn:hover {
        background: #334155;
      }
      .lucnham-btn-primary {
        background: rgba(245, 158, 11, 0.2);
        color: #fde68a;
        border-color: rgba(245, 158, 11, 0.5);
      }
      .lucnham-drawer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        max-width: 520px;
        margin: 0 auto;
        background: #0f172a;
        border-top: 2px solid #f59e0b;
        border-radius: 16px 16px 0 0;
        box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.6);
        padding: 12px 14px 24px;
        transform: translateY(105%);
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 999;
      }
      .lucnham-drawer.open {
        transform: translateY(0);
      }
      .lucnham-drawer-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
        z-index: 998;
      }
      .lucnham-drawer-overlay.open {
        opacity: 1;
        pointer-events: auto;
      }
      .lucnham-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.95);
        width: 90%;
        max-width: 440px;
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 14px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.7);
        padding: 16px;
        z-index: 1000;
        opacity: 0;
        pointer-events: none;
        transition: all 0.2s ease;
      }
      .lucnham-modal.open {
        opacity: 1;
        pointer-events: auto;
        transform: translate(-50%, -50%) scale(1);
      }
    `;
    document.head.appendChild(styleEl);
  }

  // Khởi tạo và nạp quẻ
  function computeChart() {
    let canNgay = "Tân", chiNgay = "Mão", chiGio = "Sửu", chiNam = "Sửu", chiThang = "Tuất";
    let tietKhi = "Thu phân";
    let isDaytime = customDaytime;

    // Tích hợp trực tiếp với NetaCalendarEngine nếu có sẵn
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
        console.warn('Lục Nhâm: Không thể lấy dữ liệu từ Calendar Engine, dùng mặc định:', e);
      }
    }

    // Tự động phân định Đán/Mộ nếu chưa ép buộc
    if (isDaytime === null) {
      isDaytime = ["Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân"].includes(chiGio);
    }

    // Xác định Nguyệt Tướng (hỗ trợ cả chữ hoa và chữ thường)
    let nguyetTuong = customNguyetTuong;
    if (!nguyetTuong && global.LucNhamEngine) {
      const map = global.LucNhamEngine.SOLAR_TERM_TO_NGUYET_TUONG;
      const tkClean = (tietKhi || "").trim();
      nguyetTuong = map[tkClean] || map[tkClean.toLowerCase()] || map["Thu phân"] || "Thìn";
      // Tìm dạng Title Case nếu chưa khớp
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
        gioiTinh: gender,
        chiThang
      });
    }
  }

  function renderView(container) {
    if (!container) return;
    ensureStyles();
    computeChart();

    if (!currentChart) {
      container.innerHTML = `<div class="p-4 text-center text-amber-400">Đang khởi tạo Lục Nhâm Engine...</div>`;
      return;
    }

    const c = currentChart;
    const isDay = c.isDaytime;

    // Render HTML toàn diện
    container.innerHTML = `
      <div class="lucnham-view-wrap">
        <!-- 1. Header Top Bar -->
        <div class="lucnham-header">
          <div class="lucnham-title">
            <span>六壬</span>
            <span>LỤC NHÂM ĐẠI ĐỘN</span>
          </div>
          <div style="display: flex; gap: 6px; align-items: center;">
            <button class="lucnham-btn" onclick="window.LucNhamView.toggleViewMode()" title="Chuyển chế độ xem">
              ${currentViewMode === 'classic' ? '🗂️ 8 Lớp' : '📱 Chạm'}
            </button>
            <button class="lucnham-btn lucnham-btn-primary" onclick="window.LucNhamView.openModal()">
              ⚙️ Đổi Quẻ
            </button>
          </div>
        </div>

        <!-- 2. Status Banner -->
        <div class="lucnham-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
            <div>
              <span style="font-size: 9px; text-transform: uppercase; color: #94a3b8; font-weight: 700;">Thời Khắc Chiêm Nghiệm</span>
              <div style="font-size: 14px; font-weight: 800; color: #ffffff; margin-top: 2px;">
                Ngày <span style="color: #fde047;">${c.canNgay} ${c.chiNgay}</span> · Giờ <span style="color: #f59e0b;">${c.chiGio}</span>
              </div>
            </div>
            <span class="lucnham-badge ${isDay ? 'lucnham-badge-day' : 'lucnham-badge-night'}">
              ${isDay ? '☀️ Đán Quý (Ngày)' : '🌙 Mộ Quý (Đêm)'}
            </span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px;">
            <div style="background: rgba(2, 6, 23, 0.6); padding: 5px 8px; border-radius: 6px; border: 1px solid #1e293b;">
              <span style="color: #94a3b8; font-size: 9px; display: block;">Nguyệt tướng / Tiết lệnh</span>
              <span style="font-weight: 700; color: #fde047;">${c.nguyetTuong} (${c.tenNguyetTuong})</span> · ${c.tietKhi}
            </div>
            <div style="background: rgba(2, 6, 23, 0.6); padding: 5px 8px; border-radius: 6px; border: 1px solid #1e293b;">
              <span style="color: #94a3b8; font-size: 9px; display: block;">Quý nhân giáng lâm</span>
              <span style="font-weight: 700; color: #34d399;">Cung ${c.quyNhanCung}</span> (${c.quyNhanChieu} hành)
            </div>
            <div style="background: rgba(2, 6, 23, 0.6); padding: 5px 8px; border-radius: 6px; border: 1px solid #1e293b;">
              <span style="color: #94a3b8; font-size: 9px; display: block;">Đương số (${c.gioiTinh})</span>
              <span style="font-weight: 600; color: #cbd5e1;">Tuổi âm: <b style="color: #f59e0b;">${c.tuoiAm}T</b> (Sinh ${c.birthYear})</span>
            </div>
            <div style="background: rgba(2, 6, 23, 0.6); padding: 5px 8px; border-radius: 6px; border: 1px solid #1e293b;">
              <span style="color: #94a3b8; font-size: 9px; display: block;">Hành niên & Trạch / Mộ</span>
              <span style="font-weight: 600; color: #cbd5e1;">Niên: <b style="color: #f59e0b;">${c.hanhNienChi}</b> · Trạch: <b style="color: #34d399;">${c.trachThan}</b> · Mộ: <b style="color: #38bdf8;">${c.moThan}</b></span>
            </div>
          </div>
        </div>

        <!-- 3. Tam Truyền Hero Card -->
        <div class="lucnham-card" style="border-color: rgba(245, 158, 11, 0.3);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #f59e0b; display: inline-block;"></span>
              <span style="font-size: 11px; font-weight: 800; color: #f59e0b; text-transform: uppercase;">Tam Truyền (Cửu Tông Môn)</span>
            </div>
            <span style="font-size: 10px; background: rgba(245, 158, 11, 0.15); color: #fde047; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(245, 158, 11, 0.3);">
              ${c.tamTruyenTenTong}
            </span>
          </div>

          <div class="lucnham-hero-grid">
            <!-- Sơ Truyền -->
            <div class="lucnham-truyen-box" style="border-color: ${NGU_HANH_COLORS[c.soTruyen.nguHanh].border};">
              <span class="lucnham-truyen-tag" style="color: #f59e0b;">SƠ</span>
              <div style="font-size: 10px; font-weight: 700; color: #f43f5e; margin-top: 10px;">${c.soTruyen.thienTuong}</div>
              <div class="lucnham-truyen-chi" style="color: ${NGU_HANH_COLORS[c.soTruyen.nguHanh].text};">${c.soTruyen.chi}</div>
              <div style="font-size: 10px; font-weight: 600; color: #cbd5e1;">${c.soTruyen.lucThan}</div>
              <div style="font-size: 8px; color: #94a3b8; border-top: 1px solid #1e293b; margin-top: 4px; padding-top: 2px;">
                ${c.soTruyen.nguHanh} · Sơ phát
              </div>
            </div>

            <!-- Trung Truyền -->
            <div class="lucnham-truyen-box">
              <span class="lucnham-truyen-tag">TRUNG</span>
              <div style="font-size: 10px; font-weight: 700; color: #818cf8; margin-top: 10px;">${c.trungTruyen.thienTuong}</div>
              <div class="lucnham-truyen-chi" style="color: ${NGU_HANH_COLORS[c.trungTruyen.nguHanh].text};">${c.trungTruyen.chi}</div>
              <div style="font-size: 10px; font-weight: 600; color: #cbd5e1;">${c.trungTruyen.lucThan}</div>
              <div style="font-size: 8px; color: #94a3b8; border-top: 1px solid #1e293b; margin-top: 4px; padding-top: 2px;">
                ${c.trungTruyen.nguHanh} · Trung di
              </div>
            </div>

            <!-- Mạt Truyền -->
            <div class="lucnham-truyen-box">
              <span class="lucnham-truyen-tag">MẠT</span>
              <div style="font-size: 10px; font-weight: 700; color: #fb7185; margin-top: 10px;">${c.matTruyen.thienTuong}</div>
              <div class="lucnham-truyen-chi" style="color: ${NGU_HANH_COLORS[c.matTruyen.nguHanh].text};">${c.matTruyen.chi}</div>
              <div style="font-size: 10px; font-weight: 600; color: #cbd5e1;">${c.matTruyen.lucThan}</div>
              <div style="font-size: 8px; color: #94a3b8; border-top: 1px solid #1e293b; margin-top: 4px; padding-top: 2px;">
                ${c.matTruyen.nguHanh} · Mạt túc
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Tứ Khóa Card -->
        <div class="lucnham-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">Tứ Khóa (Can Chi Tương Phối)</span>
            <span style="font-size: 9px; color: #64748b;">IV ← III ← II ← I</span>
          </div>

          <div class="lucnham-tukhoa-grid">
            ${[...c.tuKhoa].reverse().map(k => {
              let badgeBg = '#1e293b', badgeColor = '#94a3b8';
              if (k.code === 'TAC') { badgeBg = 'rgba(244, 63, 94, 0.2)'; badgeColor = '#fda4af'; }
              else if (k.code === 'KHAC') { badgeBg = 'rgba(245, 158, 11, 0.2)'; badgeColor = '#fde68a'; }
              else if (k.code === 'SINH') { badgeBg = 'rgba(34, 197, 94, 0.2)'; badgeColor = '#86efac'; }

              return `
                <div class="lucnham-khoa-box">
                  <span style="font-size: 9px; font-weight: 800; color: #64748b;">${k.id}</span>
                  <div style="font-size: 14px; font-weight: 800; color: #fde047; margin: 2px 0;">${k.thuong}</div>
                  <div style="border-top: 1px solid #1e293b; margin: 2px 6px;"></div>
                  <div style="font-size: 14px; font-weight: 800; color: #ffffff; margin: 2px 0;">${k.ha}</div>
                  <span style="font-size: 8px; font-weight: 600; padding: 1px 4px; border-radius: 3px; background: ${badgeBg}; color: ${badgeColor}; display: inline-block;">
                    ${k.quanHe}
                  </span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 5. Ma Trận 12 Cung (Dial Matrix 4x4) -->
        <div class="lucnham-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 800; color: #f59e0b; text-transform: uppercase;">
              ${currentViewMode === 'classic' ? 'Bàn Cờ 8 Lớp Thông Tin' : 'Bàn Cảm Ứng 1-Chạm'}
            </span>
            <span style="font-size: 9px; color: #64748b;">Chạm cung để xem luận giải</span>
          </div>

          <div class="lucnham-dial-grid">
            ${DIAL_4x4_LAYOUT.map(d => {
              if (!d) return ''; // Null slots gom vào trung cung
              if (d === 'Thìn') {
                // Render ô Thìn rồi render Trung Cung HUD
                const bThin = c.cung12['Thìn'];
                const bDau = c.cung12['Dậu'];
                const isActiveThin = selectedBox === 'Thìn';
                return `
                  ${renderSingleCell(bThin, isActiveThin)}
                  <div class="lucnham-center-hud">
                    <span style="font-size: 9px; font-weight: 800; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.5px;">TAM THỨC KINH ĐIỂN</span>
                    <div style="font-size: 13px; font-weight: 900; color: #ffffff; margin: 3px 0;">LỤC NHÂM ĐẠI ĐỘN</div>
                    <div style="font-size: 9px; color: #34d399;">Trạch: ${c.trachThan} · Mộ: ${c.moThan}</div>
                    <div style="font-size: 9px; color: #fde047; margin-top: 2px;">Hành niên: ${c.hanhNienChi} (${c.tuoiAm}T)</div>
                  </div>
                  ${renderSingleCell(bDau, selectedBox === 'Dậu')}
                `;
              }
              if (d === 'Dậu' || d === 'Mão' || d === 'Tuất') {
                if (d === 'Dậu') return ''; // Đã render ở block Thìn
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
              const isActive = selectedBox === d;
              return renderSingleCell(b, isActive);
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Drawer Tra Cứu Chi Tiết 1 Cung -->
      <div id="lucnham-drawer-overlay" class="lucnham-drawer-overlay" onclick="window.LucNhamView.closeDrawer()"></div>
      <div id="lucnham-drawer" class="lucnham-drawer">
        <div id="lucnham-drawer-content"></div>
      </div>

      <!-- Modal Đổi Quẻ -->
      <div id="lucnham-modal" class="lucnham-modal">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
          <h3 style="margin: 0; font-size: 14px; font-weight: 800; color: #f59e0b;">⚙️ Đổi Quẻ & Tùy Biến Thời Khắc</h3>
          <button onclick="window.LucNhamView.closeModal()" style="background: none; border: none; color: #94a3b8; font-size: 16px; cursor: pointer;">✕</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12px;">
          <div>
            <label style="color: #94a3b8; display: block; margin-bottom: 2px;">Chọn ngày giờ xem:</label>
            <input type="datetime-local" id="lucnham-input-datetime" style="width: 100%; background: #020617; border: 1px solid #334155; color: #fff; padding: 6px; border-radius: 6px;">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <div>
              <label style="color: #94a3b8; display: block; margin-bottom: 2px;">Ban ngày / Ban đêm:</label>
              <select id="lucnham-select-daytime" style="width: 100%; background: #020617; border: 1px solid #334155; color: #fff; padding: 6px; border-radius: 6px;">
                <option value="auto">Tự động theo giờ</option>
                <option value="day">☀️ Đán Quý (Ngày)</option>
                <option value="night">🌙 Mộ Quý (Đêm)</option>
              </select>
            </div>
            <div>
              <label style="color: #94a3b8; display: block; margin-bottom: 2px;">Nguyệt tướng:</label>
              <select id="lucnham-select-nguyettuong" style="width: 100%; background: #020617; border: 1px solid #334155; color: #fff; padding: 6px; border-radius: 6px;">
                <option value="auto">Tự động theo Tiết khí</option>
                ${global.LucNhamEngine.DIA_CHI.map(chi => `<option value="${chi}">${chi} (${global.LucNhamEngine.TEN_THAN_CUNG[chi]})</option>`).join('')}
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <div>
              <label style="color: #94a3b8; display: block; margin-bottom: 2px;">Năm sinh đương số:</label>
              <input type="number" id="lucnham-input-birth" value="${birthYear}" style="width: 100%; background: #020617; border: 1px solid #334155; color: #fff; padding: 6px; border-radius: 6px;">
            </div>
            <div>
              <label style="color: #94a3b8; display: block; margin-bottom: 2px;">Giới tính:</label>
              <select id="lucnham-select-gender" style="width: 100%; background: #020617; border: 1px solid #334155; color: #fff; padding: 6px; border-radius: 6px;">
                <option value="Nam" ${gender === 'Nam' ? 'selected' : ''}>Nam</option>
                <option value="Nữ" ${gender === 'Nữ' ? 'selected' : ''}>Nữ</option>
              </select>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 6px; margin-top: 8px;">
            <button class="lucnham-btn" onclick="window.LucNhamView.resetToNow()">Về Hiện Tại</button>
            <button class="lucnham-btn lucnham-btn-primary" onclick="window.LucNhamView.applyModal()">Áp Dụng</button>
          </div>
        </div>
      </div>
    `;
  }

  // Render từng cell trong bàn cờ 4x4
  function renderSingleCell(b, isActive) {
    if (!b) return '';
    const tags = [];
    if (b.tagHanhNien) tags.push(`<span style="color: #f59e0b; font-weight: 800;">${b.tagHanhNien}</span>`);
    if (b.tagTrachMo) tags.push(`<span style="color: #34d399; font-weight: 800;">${b.tagTrachMo}</span>`);
    if (b.tagCanChiNgay) tags.push(`<span style="color: #f43f5e; font-weight: 800;">${b.tagCanChiNgay}</span>`);
    const tagHtml = tags.join(' ');

    if (currentViewMode === 'touch') {
      // Chế độ tối giản 1-chạm
      return `
        <div class="lucnham-cung-cell ${isActive ? 'lucnham-cung-active' : ''}" onclick="window.LucNhamView.selectPalace('${b.diaBan}')">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; font-size: 9px;">
            <span style="font-weight: 800; color: #64748b;">${b.diaBan}</span>
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

    // Chế độ 8 Lớp truyền thống
    const satStr = (b.thanSatPhu && b.thanSatPhu.length) ? b.thanSatPhu.join(',') : '';
    return `
      <div class="lucnham-cung-cell ${isActive ? 'lucnham-cung-active' : ''}" onclick="window.LucNhamView.selectPalace('${b.diaBan}')">
        <!-- Dòng 1: Thiên bàn & Tags -->
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; border-bottom: 1px solid #1e293b; padding-bottom: 1px;">
          <span style="font-weight: 900; color: #fde047;">${b.thienBan}</span>
          <div style="font-size: 8px; line-height: 1;">${tagHtml}</div>
        </div>
        <!-- Dòng 2: Thiên tướng -->
        <div style="font-size: 8px; font-weight: 800; color: #38bdf8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${b.thienTuong}
        </div>
        <!-- Dòng 3: Sao Thái Tuế -->
        <div style="font-size: 7.5px; color: #cbd5e1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${b.saoThaiTue}
        </div>
        <!-- Dòng 4: Kiến Trừ & Thần Sát Phụ -->
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 7.5px;">
          <span style="color: #f59e0b; font-weight: 600;">${b.saoKienTru}</span>
          <span style="color: #fb7185; font-size: 7px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 42px;">${satStr}</span>
        </div>
        <!-- Dòng 5: Tên Nguyệt Tướng -->
        <div style="font-size: 7px; color: #64748b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${b.tenNguyetTuong}
        </div>
        <!-- Dòng 6: Chi Địa Bàn -->
        <div style="font-size: 9px; font-weight: 800; color: #64748b; text-align: right; border-top: 1px solid #1e293b; padding-top: 1px;">
          ${b.diaBan}
        </div>
      </div>
    `;
  }

  // Mở Drawer chi tiết khi bấm vào cung
  function selectPalace(db) {
    selectedBox = db;
    const c = currentChart;
    if (!c || !c.cung12[db]) return;
    const b = c.cung12[db];

    const drawer = document.getElementById('lucnham-drawer');
    const overlay = document.getElementById('lucnham-drawer-overlay');
    const content = document.getElementById('lucnham-drawer-content');
    if (!drawer || !overlay || !content) return;

    let relText = "";
    if (b.quanHe === "TAC") relText = "Hạ Tặc Thượng (Dưới khắc trên)";
    else if (b.quanHe === "KHAC") relText = "Thượng Khắc Hạ (Trên khắc dưới)";
    else if (b.quanHe === "TY") relText = "Tỷ Hòa (Cùng hành)";
    else relText = "Sinh Hóa Tương Sinh";

    content.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 8px; margin-bottom: 10px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 18px; font-weight: 900; color: #fde047;">CUNG ${b.thienBan}</span>
          <span style="font-size: 11px; color: #94a3b8;">(Lâm Địa bàn: <b style="color: #ffffff;">${b.diaBan}</b>)</span>
        </div>
        <button onclick="window.LucNhamView.closeDrawer()" style="background: none; border: none; color: #94a3b8; font-size: 16px; cursor: pointer;">✕</button>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; margin-bottom: 10px;">
        <div style="background: #020617; padding: 6px 8px; border-radius: 6px; border: 1px solid #1e293b;">
          <span style="color: #94a3b8; font-size: 9px; display: block;">Thiên Tướng cai quản:</span>
          <b style="color: #38bdf8; font-size: 13px;">${b.thienTuong}</b>
        </div>
        <div style="background: #020617; padding: 6px 8px; border-radius: 6px; border: 1px solid #1e293b;">
          <span style="color: #94a3b8; font-size: 9px; display: block;">Lục thân đối với Can ngày:</span>
          <b style="color: #fde047; font-size: 13px;">${b.lucThan}</b>
        </div>
        <div style="background: #020617; padding: 6px 8px; border-radius: 6px; border: 1px solid #1e293b;">
          <span style="color: #94a3b8; font-size: 9px; display: block;">Sao Thái Tuế & Kiến Trừ:</span>
          <span style="color: #ffffff;">${b.saoThaiTue} · <b>Trực ${b.saoKienTru}</b></span>
        </div>
        <div style="background: #020617; padding: 6px 8px; border-radius: 6px; border: 1px solid #1e293b;">
          <span style="color: #94a3b8; font-size: 9px; display: block;">Ngũ hành Thiên / Địa:</span>
          <span style="color: #cbd5e1;">${relText}</span>
        </div>
      </div>

      <div style="background: #020617; padding: 8px; border-radius: 8px; border: 1px solid #1e293b; font-size: 11px; margin-bottom: 8px;">
        <b style="color: #f59e0b; display: block; margin-bottom: 3px;">📖 Luận Giải Thần Tướng [${b.thienTuong}]:</b>
        <span style="color: #cbd5e1; line-height: 1.4;">${THIEN_TUONG_DESC[b.thienTuong] || "Cát hung tự tại tâm."}</span>
      </div>

      ${b.thanSatPhu && b.thanSatPhu.length ? `
        <div style="font-size: 11px; color: #fb7185; margin-top: 4px;">
          ⭐ <b>Thần sát lâm cung:</b> ${b.thanSatPhu.join(', ')}
        </div>
      ` : ''}
    `;

    drawer.classList.add('open');
    overlay.classList.add('open');
  }

  function closeDrawer() {
    const drawer = document.getElementById('lucnham-drawer');
    const overlay = document.getElementById('lucnham-drawer-overlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
  }

  function toggleViewMode() {
    currentViewMode = (currentViewMode === 'classic') ? 'touch' : 'classic';
    const container = document.getElementById('lucnham-container') || document.querySelector('.lucnham-view-wrap')?.parentElement;
    if (container) renderView(container);
  }

  function openModal() {
    const modal = document.getElementById('lucnham-modal');
    if (!modal) return;
    const dtInput = document.getElementById('lucnham-input-datetime');
    if (dtInput) {
      const pad = n => String(n).padStart(2, '0');
      const y = currentDate.getFullYear();
      const m = pad(currentDate.getMonth() + 1);
      const d = pad(currentDate.getDate());
      const h = pad(currentDate.getHours());
      const mi = pad(currentDate.getMinutes());
      dtInput.value = `${y}-${m}-${d}T${h}:${mi}`;
    }
    modal.classList.add('open');
  }

  function closeModal() {
    const modal = document.getElementById('lucnham-modal');
    if (modal) modal.classList.remove('open');
  }

  function applyModal() {
    const dtInput = document.getElementById('lucnham-input-datetime');
    const daytimeSelect = document.getElementById('lucnham-select-daytime');
    const ntSelect = document.getElementById('lucnham-select-nguyettuong');
    const birthInput = document.getElementById('lucnham-input-birth');
    const genderSelect = document.getElementById('lucnham-select-gender');

    if (dtInput && dtInput.value) {
      currentDate = new Date(dtInput.value);
    }
    if (daytimeSelect) {
      const val = daytimeSelect.value;
      customDaytime = (val === 'day') ? true : ((val === 'night') ? false : null);
    }
    if (ntSelect) {
      const val = ntSelect.value;
      customNguyetTuong = (val === 'auto') ? '' : val;
    }
    if (birthInput && birthInput.value) {
      birthYear = parseInt(birthInput.value, 10) || 1982;
    }
    if (genderSelect) {
      gender = genderSelect.value;
    }

    closeModal();
    const container = document.getElementById('lucnham-container') || document.querySelector('.lucnham-view-wrap')?.parentElement;
    if (container) renderView(container);
  }

  function resetToNow() {
    currentDate = new Date();
    customDaytime = null;
    customNguyetTuong = '';
    closeModal();
    const container = document.getElementById('lucnham-container') || document.querySelector('.lucnham-view-wrap')?.parentElement;
    if (container) renderView(container);
  }

  const LucNhamView = {
    render: renderView,
    selectPalace,
    closeDrawer,
    toggleViewMode,
    openModal,
    closeModal,
    applyModal,
    resetToNow
  };

  global.LucNhamView = LucNhamView;
})(typeof window !== 'undefined' ? window : globalThis);
