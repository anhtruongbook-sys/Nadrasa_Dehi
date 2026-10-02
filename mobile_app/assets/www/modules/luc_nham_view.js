/**
 * NETA LIGHT - LỤC NHÂM ĐẠI ĐỘN VIEW MODULE (luc_nham_view.js)
 * Giao diện trực quan hoá Bàn Quẻ Lục Nhâm Thần Khóa 8 Lớp Thông Tin
 * Đồng nhất 100% với phong cách Tử Vi & Bát Tự (Unified Control Card, Light/Dark theme, Không tràn nút, Vuốt dọc mượt mà).
 */

(function (global) {
  'use strict';

  let currentChart = null;
  let currentDate = new Date();
  let currentMainTab = 'chart'; // 'chart' (🏛️ Bàn Quẻ) | 'analysis' (📜 Luận Giải)
  let currentReportMode = 'standard'; // 'standard' (📜 Bản Gốc) | 'ai' (✨ Bản AI)
  let currentViewMode = 'classic'; // 'classic' (8 lớp) | 'touch' (1-chạm)
  let selectedBox = 'Tỵ';           // Địa bàn đang chọn
  let isLunarMode = false;
  let currentIsMale = true;
  let currentQuerentBirthYear = 1990; // Năm sinh mặc định của đương số
  let customDaytime = null;        // null: auto, true: đán, false: mộ
  let customNguyetTuong = '';      // rỗng: auto theo tiết khí

  // Trạng thái Giờ Chân Thái Dương (True Apparent Solar Time & EOT)
  let useTrueSolarTime = false;
  let selectedCityKey = 'HaNoi';
  let customLongitude = 105.85;

  try {
    const savedSolar = localStorage.getItem('neta_lucnham_solartime');
    if (savedSolar) {
      const parsed = JSON.parse(savedSolar);
      useTrueSolarTime = !!parsed.enabled;
      if (parsed.city) selectedCityKey = parsed.city;
      if (parsed.lng && !isNaN(parsed.lng)) customLongitude = Number(parsed.lng);
    }
  } catch (e) {}

  // Trạng thái Chẩn đoán Không gian Phong Thủy (Dương Trạch / Âm Trạch)
  let currentDwellingType = 'DUONG_TRACH'; // 'DUONG_TRACH' | 'AM_TRACH'
  let fsReportMode = 'standard'; // 'standard' | 'ai'
  let fsAiPolishedText = null;
  let isFsAiPolishing = false;
  let fsAiErrorMessage = null;
  let isEssayModalOpen = false;
  let isTrachCatModalOpen = false;
  let trachCatSelectedChi = 'Tý';

  // Trạng thái Phân hệ Luận Giải Chuyên Sâu Lục Nhâm 7 Tầng
  let currentLuanFilter = 'all'; // 'all', 'tatphap', 'timeline', 'chuyende', 'suvu'
  let isAiPolishing = false;
  let aiPolishedText = null;
  let aiErrorMessage = null;
  let collapsedSections = {};


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

      /* Unified Master Card: Thông Tin Thần Khóa & Chế Độ Xem (8 Lớp / 1 Chạm) */
      .lucnham-master-card {
        background: rgba(26, 3, 7, 0.95);
        border: 1px solid rgba(245, 176, 65, 0.35);
        border-radius: 8px;
        padding: 6px 8px;
        margin: 4px 0 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
        box-sizing: border-box;
        width: 100%;
      }
      body.theme-light .lucnham-master-card {
        background: #ffffff !important;
        border: 1.5px solid #cbd5e1 !important;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06) !important;
      }

      .lucnham-master-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 5px;
        margin-bottom: 5px;
        border-bottom: 1px dashed rgba(245, 176, 65, 0.22);
      }
      body.theme-light .lucnham-master-header {
        border-bottom-color: #e2e8f0;
      }

      .lucnham-master-title {
        font-size: 0.72rem;
        font-weight: 800;
        color: var(--gold-primary, #f5b041);
        display: flex;
        align-items: center;
        gap: 5px;
        letter-spacing: 0.2px;
        text-transform: uppercase;
      }
      body.theme-light .lucnham-master-title {
        color: #b45309;
      }

      .lucnham-mode-pill {
        width: 156px !important;
        height: 24px !important;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(245, 176, 65, 0.3);
        border-radius: 6px;
        padding: 1px;
        gap: 2px;
        display: flex;
        box-sizing: border-box;
      }
      body.theme-light .lucnham-mode-pill {
        background: #f1f5f9;
        border-color: #cbd5e1;
      }
      .lucnham-mode-pill .ucc-view-btn {
        flex: 1 1 0;
        height: 20px;
        font-size: 0.68rem;
        font-weight: 700;
        padding: 0 4px;
        border-radius: 4px;
        border: none;
        background: transparent;
        color: var(--text-muted, #94a3b8);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
      }
      body.theme-light .lucnham-mode-pill .ucc-view-btn {
        color: #64748b;
      }
      .lucnham-mode-pill .ucc-view-btn.active {
        background: rgba(245, 176, 65, 0.25);
        color: #f5b041;
        font-weight: 900;
      }
      body.theme-light .lucnham-mode-pill .ucc-view-btn.active {
        background: #ffffff;
        color: #b45309;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      /* Ma Trận 2 Hàng x 3 Cột Cân Đối Hoàn Hảo */
      .lucnham-stat-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 4px 2px;
        text-align: center;
      }
      .lucnham-stat-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2px 1px;
        min-width: 0;
      }
      .lucnham-stat-cell:not(:nth-child(3n)) {
        border-right: 1px solid rgba(245, 176, 65, 0.15);
      }
      body.theme-light .lucnham-stat-cell:not(:nth-child(3n)) {
        border-right-color: #e2e8f0;
      }
      .lucnham-stat-lbl {
        font-size: 0.62rem;
        font-weight: 700;
        color: #94a3b8;
        letter-spacing: 0.2px;
        margin-bottom: 2px;
        white-space: nowrap;
        text-transform: uppercase;
      }
      body.theme-light .lucnham-stat-lbl {
        color: #64748b !important;
      }
      .lucnham-stat-val {
        font-size: 0.78rem;
        font-weight: 800;
        color: #f1f5f9;
        white-space: nowrap;
        line-height: 1.2;
      }
      body.theme-light .lucnham-stat-val {
        color: #0f172a !important;
      }
      .lucnham-stat-val.tms-val-gold {
        color: #f5b041;
      }
      body.theme-light .lucnham-stat-val.tms-val-gold {
        color: #b45309 !important;
      }
      .lucnham-stat-val.val-danmo {
        color: #f59e0b;
      }
      body.theme-light .lucnham-stat-val.val-danmo {
        color: #d97706 !important;
      }
      .lucnham-stat-val.val-tuong {
        color: #38bdf8;
      }
      body.theme-light .lucnham-stat-val.val-tuong {
        color: #0284c7 !important;
      }
      .lucnham-stat-val.val-menh {
        color: #c084fc;
      }
      body.theme-light .lucnham-stat-val.val-menh {
        color: #7e22ce !important;
      }
      .lucnham-stat-val.val-hanhnien {
        color: #34d399;
      }
      body.theme-light .lucnham-stat-val.val-hanhnien {
        color: #15803d !important;
      }
      .val-sub {
        font-size: 0.68rem;
        font-weight: normal;
        opacity: 0.85;
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
        font-size: 11px;
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
        font-size: 15px;
        font-weight: 800;
        line-height: 1.3;
        color: var(--gold-primary, #f5b041);
      }
      body.theme-light .lucnham-khoa-thu {
        color: #92400e !important;
        font-weight: 800 !important;
      }
      .lucnham-truyen-chi.truyen-nguhanh-kim { color: #fde047; }
      .lucnham-truyen-chi.truyen-nguhanh-moc { color: #4ade80; }
      .lucnham-truyen-chi.truyen-nguhanh-thuy { color: #38bdf8; }
      .lucnham-truyen-chi.truyen-nguhanh-hoa { color: #fb7185; }
      .lucnham-truyen-chi.truyen-nguhanh-tho { color: #fbbf24; }

      body.theme-light .lucnham-truyen-chi.truyen-nguhanh-kim { color: #854d0e !important; }
      body.theme-light .lucnham-truyen-chi.truyen-nguhanh-moc { color: #15803d !important; }
      body.theme-light .lucnham-truyen-chi.truyen-nguhanh-thuy { color: #0284c7 !important; }
      body.theme-light .lucnham-truyen-chi.truyen-nguhanh-hoa { color: #b91c1c !important; }
      body.theme-light .lucnham-truyen-chi.truyen-nguhanh-tho { color: #92400e !important; }

      .lucnham-cell-thienban {
        color: #fde047;
      }
      body.theme-light .lucnham-cell-thienban {
        color: #0f172a !important;
        font-weight: 900 !important;
      }
      .lucnham-cell-thientuong {
        color: #38bdf8;
      }
      body.theme-light .lucnham-cell-thientuong {
        color: #0284c7 !important;
        font-weight: 800 !important;
      }
      .tag-banmenh { color: #c084fc; font-weight: 800; }
      body.theme-light .tag-banmenh { color: #7e22ce !important; font-weight: 800 !important; }
      .tag-hanhnien { color: #f59e0b; font-weight: 800; }
      body.theme-light .tag-hanhnien { color: #b45309 !important; font-weight: 800 !important; }
      .tag-trachmo { color: #34d399; font-weight: 800; }
      body.theme-light .tag-trachmo { color: #15803d !important; font-weight: 800 !important; }
      .tag-canchingay { color: #f43f5e; font-weight: 800; }
      body.theme-light .tag-canchingay { color: #b91c1c !important; font-weight: 800 !important; }

      .lucnham-khoa-ha {
        font-size: 15px;
        font-weight: 800;
        line-height: 1.3;
        color: #ffffff;
      }
      body.theme-light .lucnham-khoa-ha {
        color: #0f172a !important;
        font-weight: 800 !important;
      }
      body.theme-light .lucnham-cell-sub {
        color: #1e293b !important;
        font-weight: 700 !important;
      }
      body.theme-light .lucnham-cell-muted {
        color: #334155 !important;
        font-weight: 600 !important;
      }
      body.theme-light .lucnham-cell-diaban {
        color: #0f172a !important;
        font-weight: 800 !important;
      }
      .lucnham-khoa-tag {
        font-size: 10px;
        padding: 2px 5px;
        border-radius: 4px;
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
      .lucnham-btn-drawer-close {
        background: rgba(245, 176, 65, 0.15);
        border: 1px solid rgba(245, 176, 65, 0.35);
        color: #f5b041;
        font-size: 20px;
        font-weight: 800;
        width: 44px;
        height: 44px;
        min-width: 44px;
        min-height: 44px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        touch-action: manipulation;
        transition: all 0.15s ease;
        user-select: none;
      }
      .lucnham-btn-drawer-close:hover, .lucnham-btn-drawer-close:active {
        background: rgba(245, 176, 65, 0.35);
        transform: scale(0.95);
      }
      body.theme-light .lucnham-btn-drawer-close {
        background: #f1f5f9 !important;
        border-color: #cbd5e1 !important;
        color: #334155 !important;
      }

      /* Light Theme High Contrast Overrides */
      body.theme-light .lucnham-center-hud .hud-title { color: #b45309 !important; font-weight: 800 !important; }
      body.theme-light .lucnham-center-hud .hud-main { color: #0f172a !important; font-weight: 900 !important; }
      body.theme-light .lucnham-center-hud .hud-trachmo { color: #15803d !important; font-weight: 700 !important; }
      body.theme-light .lucnham-center-hud .hud-hanhnien { color: #854d0e !important; font-weight: 700 !important; }

      body.theme-light .lucnham-truyen-box [style*="color: var(--text-secondary"] {
        color: #1e293b !important;
        font-weight: 700 !important;
      }
      body.theme-light .lucnham-truyen-box [style*="opacity: 0.75"] {
        opacity: 1 !important;
        color: #475569 !important;
        border-top-color: #cbd5e1 !important;
      }

      body.theme-light .lucnham-drawer strong[style*="color: var(--text-primary"] {
        color: #0f172a !important;
      }
      body.theme-light .lucnham-drawer [style*="color: #fecdd3"] {
        color: #991b1b !important;
      }
      body.theme-light .lucnham-drawer [style*="background: rgba(244, 63, 94"] {
        background: #fee2e2 !important;
        border-color: #fca5a5 !important;
        color: #991b1b !important;
      }
      body.theme-light .lucnham-drawer [style*="background: rgba(34, 197, 94"] {
        background: #dcfce7 !important;
        border-color: #86efac !important;
        color: #166534 !important;
      }
      body.theme-light .lucnham-drawer [style*="color: #38bdf8"] {
        color: #0284c7 !important;
      }
      body.theme-light .lucnham-drawer [style*="color: #94a3b8"] {
        color: #475569 !important;
      }
      body.theme-light .lucnham-drawer [style*="background: rgba(20, 2, 5"] {
        background: #f8fafc !important;
        border-color: #e2e8f0 !important;
        color: #1e293b !important;
      }
      body.theme-light .lucnham-drawer [style*="color: #cbd5e1"] {
        color: #1e293b !important;
      }
      body.theme-light .lucnham-drawer [style*="color: var(--gold-primary"] {
        color: #b45309 !important;
      }

      /* Solar Time Row in UCC */
      .ucc-row-solartime {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        margin-top: 4px;
      }
      .solartime-toggle-wrap {
        flex: 0 0 auto;
      }
      .solartime-toggle-btn {
        height: 28px;
        padding: 0 8px;
        font-size: 11px;
        font-weight: 700;
        border-radius: 6px;
        border: 1px solid rgba(245, 176, 65, 0.3);
        background: rgba(26, 4, 8, 0.7);
        color: var(--text-secondary, #94a3b8);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: all 0.2s ease;
      }
      .solartime-toggle-btn.active {
        background: linear-gradient(135deg, rgba(245, 176, 65, 0.25), rgba(217, 119, 6, 0.35)) !important;
        border-color: var(--gold-primary, #f5b041) !important;
        color: var(--gold-primary, #f5b041) !important;
      }
      body.theme-light .solartime-toggle-btn {
        background: #f8fafc;
        border-color: #cbd5e1;
        color: #475569;
      }
      body.theme-light .solartime-toggle-btn.active {
        background: #fef3c7 !important;
        border-color: #d97706 !important;
        color: #b45309 !important;
      }
      .solartime-city-wrap {
        display: flex;
        align-items: center;
        gap: 4px;
        flex: 1;
        min-width: 0;
      }
      .select-city {
        flex: 1;
        height: 28px;
        font-size: 11px;
        font-weight: 600;
        background: rgba(26, 4, 8, 0.7);
        border: 1px solid rgba(245, 176, 65, 0.25);
        border-radius: 6px;
        color: var(--text-primary, #f8fafc);
        padding: 0 4px;
        outline: none;
        cursor: pointer;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }
      body.theme-light .select-city {
        background: #ffffff;
        border-color: #cbd5e1;
        color: #0f172a;
      }
      .ucc-btn-gps {
        height: 28px;
        width: 28px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        background: rgba(26, 4, 8, 0.7);
        border: 1px solid rgba(245, 176, 65, 0.25);
        border-radius: 6px;
        cursor: pointer;
        color: var(--gold-primary, #f5b041);
        transition: all 0.2s ease;
      }
      .ucc-btn-gps:hover {
        border-color: var(--gold-primary, #f5b041);
        background: rgba(245, 176, 65, 0.15);
      }
      body.theme-light .ucc-btn-gps {
        background: #f8fafc;
        border-color: #cbd5e1;
      }
      .solartime-info-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 4px;
        padding: 3px 8px;
        margin-top: 3px;
        background: rgba(245, 176, 65, 0.08);
        border: 1px dashed rgba(245, 176, 65, 0.3);
        border-radius: 5px;
        font-size: 10.5px;
        color: var(--text-secondary, #cbd5e1);
        line-height: 1.3;
      }
      body.theme-light .solartime-info-bar {
        background: #fffbeb;
        border-color: #fde68a;
        color: #78350f;
      }
      .solartime-info-bar strong {
        color: var(--gold-primary, #f5b041);
      }
      body.theme-light .solartime-info-bar strong {
        color: #b45309;
      }
      .val-solar-active {
        color: #38bdf8 !important;
      }

      /* Querent Row in UCC */
      .ucc-row-querent {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        margin-top: 4px;
      }
      .ucc-querent-box {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(26, 4, 8, 0.7);
        border: 1px solid rgba(245, 176, 65, 0.25);
        border-radius: 6px;
        padding: 2px 8px;
        flex: 1;
        height: 28px;
        box-sizing: border-box;
      }
      body.theme-light .ucc-querent-box {
        background: #ffffff !important;
        border-color: #cbd5e1 !important;
      }
      .ucc-querent-label {
        font-size: 11px;
        font-weight: 700;
        color: var(--text-secondary, #94a3b8);
        white-space: nowrap;
      }
      body.theme-light .ucc-querent-label {
        color: #475569 !important;
      }
      .num-birthyear {
        width: 54px;
        font-size: 12px;
        font-weight: 700;
        text-align: center;
        background: transparent;
        border: 1px solid rgba(245, 176, 65, 0.25);
        border-radius: 4px;
        color: var(--gold-primary, #f5b041);
        padding: 1px 3px;
        outline: none;
      }
      body.theme-light .num-birthyear {
        color: #0f172a !important;
        border-color: #cbd5e1 !important;
        background: #f8fafc !important;
      }
      .ucc-querent-badge {
        font-size: 11px;
        font-weight: 800;
        color: #38bdf8;
        white-space: nowrap;
        background: rgba(56, 189, 248, 0.12);
        padding: 2px 6px;
        border-radius: 4px;
        border: 1px solid rgba(56, 189, 248, 0.25);
      }
      body.theme-light .ucc-querent-badge {
        background: #e0f2fe !important;
        color: #0369a1 !important;
        border-color: #bae6fd !important;
      }

      /* Quý Nhân Đán / Mộ Toggle */
      .ucc-pill-danmo {
        display: flex;
        background: rgba(26, 4, 8, 0.8);
        border: 1px solid rgba(245, 176, 65, 0.3);
        border-radius: 6px;
        overflow: hidden;
        height: 28px;
      }
      body.theme-light .ucc-pill-danmo {
        background: #f1f5f9;
        border-color: #cbd5e1;
      }
      .ucc-danmo-btn {
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 11px;
        font-weight: 700;
        padding: 0 8px;
        cursor: pointer;
        transition: all 0.15s ease;
        white-space: nowrap;
      }
      body.theme-light .ucc-danmo-btn {
        color: #64748b;
      }
      .ucc-danmo-btn.active.dan {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #ffffff !important;
      }
      .ucc-danmo-btn.active.mo {
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        color: #ffffff !important;
      }

      /* Luận Giải Chuyên Sâu Lục Nhâm 7 Tầng */
      .lucnham-luan-banner {
        margin: 6px 0 8px;
        width: 100%;
      }
      .lucnham-btn-luan-giai {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 9px 12px;
        border-radius: 8px;
        font-weight: 700;
        font-size: 13px;
        cursor: pointer;
        border: 1px solid rgba(245, 176, 65, 0.4);
        background: linear-gradient(135deg, rgba(245, 176, 65, 0.25), rgba(180, 83, 9, 0.35));
        color: #fef08a;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        transition: all 0.2s ease;
      }
      body.theme-light .lucnham-btn-luan-giai {
        background: linear-gradient(135deg, #fef3c7, #fed7aa) !important;
        border-color: #d97706 !important;
        color: #92400e !important;
        box-shadow: 0 2px 6px rgba(217, 119, 6, 0.15) !important;
      }
      .lucnham-btn-luan-giai:active { transform: scale(0.99); }
      .lucnham-luan-btn-left {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .lucnham-luan-icon { font-size: 16px; }
      .lucnham-luan-title-wrap { display: flex; flex-direction: column; text-align: left; }
      .lucnham-luan-main-title { font-size: 12.5px; font-weight: 800; }
      .lucnham-luan-sub-title { font-size: 9.5px; opacity: 0.85; font-weight: normal; }
      .lucnham-luan-btn-right {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .lucnham-luan-badge {
        font-size: 10px;
        background: rgba(245, 176, 65, 0.2);
        padding: 2px 6px;
        border-radius: 4px;
        color: #fef08a;
        font-weight: 700;
      }
      body.theme-light .lucnham-luan-badge {
        background: #fde68a !important;
        color: #78350f !important;
      }
      .lucnham-luan-arrow { font-size: 12px; opacity: 0.8; }

      /* Inline Report Wrap & Meta Bar (Bát Tự Uniform) */
      .lucnham-analysis-wrap {
        width: 100%;
        margin-top: 6px;
      }
      .lucnham-report-meta-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        margin: 6px 0 10px;
        padding: 8px 10px;
        background: rgba(20, 2, 5, 0.85);
        border-radius: 8px;
        border: 1px solid rgba(245, 176, 65, 0.25);
      }
      body.theme-light .lucnham-report-meta-bar {
        background: #f8fafc !important;
        border-color: #cbd5e1 !important;
      }
      body.theme-light .lucnham-report-meta-bar > div:first-child {
        color: #92400e !important;
      }
      .neta-report-mode-toggle {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .neta-mode-pill {
        background: rgba(26, 4, 8, 0.8);
        border: 1px solid rgba(245, 176, 65, 0.3);
        border-radius: 6px;
        padding: 4px 9px;
        font-size: 11px;
        font-weight: 700;
        color: #94a3b8;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      body.theme-light .neta-mode-pill {
        background: #f1f5f9;
        border-color: #cbd5e1;
        color: #475569;
      }
      .neta-mode-pill.active {
        background: #f5b041 !important;
        border-color: #f5b041 !important;
        color: #0f0205 !important;
      }
      body.theme-light .neta-mode-pill.active {
        background: #d97706 !important;
        border-color: #d97706 !important;
        color: #ffffff !important;
      }
      .neta-polished-status-bar {
        background: rgba(34, 197, 94, 0.12);
        border: 1px solid rgba(34, 197, 94, 0.3);
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 11.5px;
        font-weight: 700;
        color: #22c55e;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }
      body.theme-light .neta-polished-status-bar {
        background: #dcfce7;
        border-color: #86efac;
        color: #15803d;
      }
      .neta-btn-inline-back {
        background: rgba(245, 176, 65, 0.15);
        color: #f5b041;
        border: 1px solid rgba(245, 176, 65, 0.3);
        border-radius: 4px;
        padding: 3px 8px;
        font-size: 10.5px;
        font-weight: 700;
        cursor: pointer;
      }
      body.theme-light .neta-btn-inline-back {
        background: #fef3c7;
        color: #92400e;
        border-color: #fde68a;
      }
      .neta-inline-ai-loading {
        background: rgba(245, 176, 65, 0.08);
        border: 1px dashed rgba(245, 176, 65, 0.35);
        border-radius: 8px;
        padding: 24px 16px;
        text-align: center;
        margin: 16px 0;
      }
      body.theme-light .neta-inline-ai-loading {
        background: #fefce8;
        border-color: #fcd34d;
      }
      /* Dashboard Metrics */
      .lucnham-dashboard-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
        margin-bottom: 8px;
      }
      .lucnham-metric-card {
        background: rgba(26, 4, 8, 0.85);
        border: 1px solid rgba(245, 176, 65, 0.25);
        border-radius: 8px;
        padding: 6px;
        text-align: center;
      }
      body.theme-light .lucnham-metric-card {
        background: #f8fafc !important;
        border-color: #e2e8f0 !important;
      }
      .lucnham-metric-num {
        font-size: 16px;
        font-weight: 900;
        margin-bottom: 2px;
      }
      .lucnham-metric-lbl {
        font-size: 12px;
        font-weight: 700;
        color: #94a3b8;
      }
      body.theme-light .lucnham-metric-lbl { color: #64748b; }

      /* Subbar */
      .lucnham-subbar {
        background: rgba(20, 2, 5, 0.9);
        border: 1px solid rgba(245, 176, 65, 0.2);
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 13px;
        line-height: 1.6;
        margin-bottom: 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      body.theme-light .lucnham-subbar {
        background: #f8fafc !important;
        border-color: #e2e8f0 !important;
        color: #334155 !important;
      }

      /* Filter Pills */
      .lucnham-pill-tabs {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding-bottom: 6px;
        margin-bottom: 8px;
        scrollbar-width: none;
        scroll-margin-top: 65px;
      }
      .lucnham-pill-btn {
        white-space: nowrap;
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 12.5px;
        font-weight: 700;
        cursor: pointer;
        background: rgba(26, 4, 8, 0.8);
        border: 1px solid rgba(245, 176, 65, 0.2);
        color: #94a3b8;
        transition: all 0.15s ease;
      }
      body.theme-light .lucnham-pill-btn {
        background: #f1f5f9 !important;
        border-color: #cbd5e1 !important;
        color: #475569 !important;
      }
      .lucnham-pill-btn.active {
        background: #f5b041 !important;
        color: #000000 !important;
        border-color: #f5b041 !important;
      }
      body.theme-light .lucnham-pill-btn.active {
        background: #d97706 !important;
        color: #ffffff !important;
        border-color: #d97706 !important;
      }

      /* Accordion Cards */
      .lucnham-accordion-card {
        background: rgba(20, 2, 5, 0.95);
        border: 1px solid rgba(245, 176, 65, 0.25);
        border-radius: 8px;
        margin-bottom: 8px;
        overflow: hidden;
        scroll-margin-top: 65px;
      }
      body.theme-light .lucnham-accordion-card {
        background: #ffffff !important;
        border-color: #e2e8f0 !important;
      }
      .lucnham-accordion-hdr {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 12px;
        font-size: 14.5px;
        font-weight: 800;
        color: #f5b041;
        cursor: pointer;
        background: rgba(26, 4, 8, 0.85);
        border-bottom: 1px solid transparent;
      }
      body.theme-light .lucnham-accordion-hdr {
        background: #f8fafc !important;
        color: #b45309 !important;
      }
      .lucnham-accordion-card:not(.collapsed) .lucnham-accordion-hdr {
        border-bottom-color: rgba(245, 176, 65, 0.2);
      }
      body.theme-light .lucnham-accordion-card:not(.collapsed) .lucnham-accordion-hdr {
        border-bottom-color: #e2e8f0 !important;
      }
      .lucnham-accordion-body {
        padding: 10px 12px;
        font-size: 13.5px;
        line-height: 1.65;
        color: var(--text-primary, #f8fafc);
      }
      body.theme-light .lucnham-accordion-body {
        color: #334155 !important;
      }
      .lucnham-accordion-card.collapsed .lucnham-accordion-body {
        display: none;
      }
      .lucnham-accordion-hdr .hdr-arrow {
        transition: transform 0.2s ease;
        font-size: 12px;
      }
      .lucnham-accordion-card.collapsed .hdr-arrow {
        transform: rotate(180deg);
      }

      /* Light Theme Content Overrides */
      body.theme-light .lucnham-accordion-card [style*="rgba(26, 4, 8"],
      body.theme-light .lucnham-accordion-card [style*="rgba(20, 2, 5"] {
        background: #f8fafc !important;
        border-color: #e2e8f0 !important;
        color: #334155 !important;
      }
      body.theme-light .lucnham-accordion-card [style*="color: #cbd5e1"] {
        color: #475569 !important;
      }
      body.theme-light .lucnham-accordion-card [style*="color: #e2e8f0"] {
        color: #334155 !important;
      }
      body.theme-light .lucnham-accordion-card [style*="color: #fef08a"] {
        color: #854d0e !important;
      }
      body.theme-light .lucnham-accordion-card [style*="rgba(245, 176, 65, 0.1"] {
        background: #fef3c7 !important;
        color: #92400e !important;
      }
      body.theme-light .lucnham-accordion-card em {
        color: #64748b !important;
      }

      /* AI Box & Spin */
      .lucnham-ai-box {
        background: rgba(245, 176, 65, 0.08);
        border: 1px solid rgba(245, 176, 65, 0.35);
        border-radius: 8px;
        padding: 10px;
        margin-bottom: 8px;
        line-height: 1.6;
        font-size: 11.5px;
      }
      body.theme-light .lucnham-ai-box {
        background: #fffbeb !important;
        border-color: #fde68a !important;
        color: #1e293b !important;
      }
      .lucnham-spin {
        display: inline-block;
        animation: spin 1s linear infinite;
      }
      @keyframes spin { 100% { transform: rotate(360deg); } }

      /* Feng Shui Tab Styles */
      .lucnham-fengshui-wrap {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 4px;
      }
      .fs-subnav-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        background: rgba(26, 4, 8, 0.7);
        border: 1px solid rgba(245, 176, 65, 0.3);
        border-radius: 8px;
        padding: 4px 6px;
        box-sizing: border-box;
      }
      body.theme-light .fs-subnav-bar {
        background: #ffffff;
        border-color: #cbd5e1;
      }
      .fs-subnav-pill {
        display: flex;
        gap: 4px;
        flex: 1;
      }
      .fs-subnav-btn {
        flex: 1;
        height: 28px;
        font-size: 11px;
        font-weight: 700;
        border-radius: 6px;
        border: 1px solid rgba(245, 176, 65, 0.25);
        background: rgba(0, 0, 0, 0.35);
        color: var(--text-secondary, #94a3b8);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        transition: all 0.2s ease;
      }
      .fs-subnav-btn.active {
        background: linear-gradient(135deg, rgba(245, 176, 65, 0.28), rgba(217, 119, 6, 0.42)) !important;
        border-color: var(--gold-primary, #f5b041) !important;
        color: var(--gold-primary, #f5b041) !important;
      }
      body.theme-light .fs-subnav-btn {
        background: #f1f5f9;
        border-color: #cbd5e1;
        color: #475569;
      }
      body.theme-light .fs-subnav-btn.active {
        background: #fef3c7 !important;
        border-color: #d97706 !important;
        color: #b45309 !important;
      }
      .fs-card {
        background: rgba(26, 3, 7, 0.95);
        border: 1px solid rgba(245, 176, 65, 0.3);
        border-radius: 8px;
        padding: 8px 10px;
        box-sizing: border-box;
      }
      body.theme-light .fs-card {
        background: #ffffff !important;
        border-color: #cbd5e1 !important;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }
      .fs-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px dashed rgba(245, 176, 65, 0.25);
        padding-bottom: 5px;
        margin-bottom: 6px;
      }
      body.theme-light .fs-card-header {
        border-bottom-color: #e2e8f0;
      }
      .fs-card-title {
        font-size: 0.76rem;
        font-weight: 800;
        color: var(--gold-primary, #f5b041);
        text-transform: uppercase;
        letter-spacing: 0.2px;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      body.theme-light .fs-card-title {
        color: #b45309;
      }
      .fs-badge {
        font-size: 10px;
        font-weight: 800;
        padding: 2px 6px;
        border-radius: 4px;
        white-space: nowrap;
        display: inline-block;
      }
      .fs-badge-great { background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid #22c55e; }
      .fs-badge-good { background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid #0284c7; }
      .fs-badge-normal { background: rgba(148, 163, 184, 0.2); color: #cbd5e1; border: 1px solid #64748b; }
      .fs-badge-warn { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid #f59e0b; }
      .fs-badge-severe { background: rgba(249, 115, 22, 0.2); color: #fb923c; border: 1px solid #f97316; }
      .fs-badge-critical { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #ef4444; }
      .fs-badge-void { background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid #a855f7; }
      
      .fs-spatial-item {
        background: rgba(20, 2, 5, 0.6);
        border: 1px solid rgba(245, 176, 65, 0.18);
        border-radius: 6px;
        padding: 6px 8px;
        margin-bottom: 6px;
      }
      body.theme-light .fs-spatial-item {
        background: #f8fafc;
        border-color: #e2e8f0;
      }
      .fs-spatial-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
      }
      .fs-spatial-dir {
        font-weight: 800;
        font-size: 11.5px;
        color: var(--text-primary, #ffffff);
      }
      body.theme-light .fs-spatial-dir {
        color: #0f172a;
      }
      .fs-action-step {
        margin: 3px 0;
        padding-left: 12px;
        position: relative;
        font-size: 11px;
        color: var(--text-secondary, #cbd5e1);
        line-height: 1.35;
      }
      body.theme-light .fs-action-step {
        color: #334155;
      }
      .fs-action-step::before {
        content: "•";
        position: absolute;
        left: 2px;
        color: var(--gold-primary, #f5b041);
      }

      /* Feng Shui Light Theme Overrides */
      body.theme-light .fs-badge-great { background: #dcfce7 !important; color: #15803d !important; border-color: #86efac !important; }
      body.theme-light .fs-badge-good { background: #e0f2fe !important; color: #0369a1 !important; border-color: #bae6fd !important; }
      body.theme-light .fs-badge-normal { background: #f1f5f9 !important; color: #334155 !important; border-color: #cbd5e1 !important; }
      body.theme-light .fs-badge-warn { background: #fef3c7 !important; color: #92400e !important; border-color: #fde68a !important; }
      body.theme-light .fs-badge-severe { background: #ffedd5 !important; color: #c2410c !important; border-color: #fed7aa !important; }
      body.theme-light .fs-badge-critical { background: #fee2e2 !important; color: #991b1b !important; border-color: #fca5a5 !important; }
      body.theme-light .fs-badge-void { background: #f3e8ff !important; color: #6b21a8 !important; border-color: #d8b4fe !important; }

      body.theme-light .fs-card [style*="background: rgba(20, 2, 5"] {
        background: #f8fafc !important;
        border-color: #e2e8f0 !important;
      }
      body.theme-light .fs-card [style*="background: rgba(0, 0, 0"] {
        background: #f1f5f9 !important;
        border-color: #cbd5e1 !important;
      }
      body.theme-light .fs-card strong[style*="color: var(--text-primary"] {
        color: #0f172a !important;
      }
      body.theme-light .fs-card div[style*="color: var(--text-primary"] {
        color: #1e293b !important;
      }
      .ucc-row-actions .ucc-pill-view {
        display: flex !important;
        flex: 1 1 auto !important;
        min-width: 0 !important;
      }
      .ucc-row-actions .ucc-pill-view .ucc-view-btn {
        flex: 1 1 0 !important;
        padding: 0 2px !important;
        font-size: 0.62rem !important;
        letter-spacing: -0.2px !important;
        min-width: 0 !important;
        white-space: nowrap !important;
      }
      @media (max-width: 440px) {
        .ucc-pill-view .ucc-txt-long { display: none !important; }
        .ucc-pill-view .ucc-txt-short { display: inline !important; }
      }
      body.theme-light .lucnham-view-wrap {
        color: #1e293b !important;
      }
      body.theme-light .fs-card {
        background: #ffffff !important;
        border-color: #cbd5e1 !important;
        color: #1e293b !important;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06) !important;
      }
      body.theme-light .fs-card strong {
        color: #0f172a !important;
      }
      body.theme-light .fs-card .fs-card-title {
        color: #b45309 !important;
      }
      body.theme-light .fs-card [style*="color: var(--text-secondary"] {
        color: #64748b !important;
      }
      body.theme-light .fs-card [style*="color: var(--text-primary"] {
        color: #1e293b !important;
      }
      body.theme-light .fs-card div[style*="background: rgba(0, 0, 0"] {
        background: #f1f5f9 !important;
        border-color: #cbd5e1 !important;
      }
      body.theme-light .fs-card div[style*="background: rgba(20, 2, 5"] {
        background: #f8fafc !important;
        border-color: #e2e8f0 !important;
      }
      body.theme-light .fs-spatial-item {
        background: #f8fafc !important;
        border-color: #e2e8f0 !important;
        color: #1e293b !important;
      }
      body.theme-light .fs-spatial-dir {
        color: #0f172a !important;
      }
      body.theme-light .fs-action-step {
        color: #334155 !important;
      }
      body.theme-light .fs-card [style*="color: #67e8f9"] {
        color: #0369a1 !important;
      }
      body.theme-light .fs-card [style*="background: rgba(239, 68, 68"] {
        background: #fee2e2 !important;
        border-color: #fca5a5 !important;
        color: #991b1b !important;
      }
      body.theme-light .fs-card [style*="color: #fca5a5"] {
        color: #991b1b !important;
      }

      /* Feng Shui Actions Bar */
      .fs-actions-bar {
        display: flex;
        gap: 5px;
        overflow-x: auto;
        padding: 2px 0 4px;
        scrollbar-width: none;
      }
      .fs-actions-bar::-webkit-scrollbar { display: none; }

      /* Modals (Essay Reader & Trach Cat) */
      .lucnham-fs-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(2px);
        z-index: 1000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.25s ease;
      }
      .lucnham-fs-modal-overlay.open {
        opacity: 1;
        pointer-events: auto;
      }
      .lucnham-fs-modal {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        max-width: 520px;
        margin: 0 auto;
        background: rgba(20, 2, 5, 0.98);
        border-top: 2px solid #f5b041;
        border-radius: 14px 14px 0 0;
        box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.85);
        transform: translateY(100%);
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 1001;
        max-height: 82vh;
        display: flex;
        flex-direction: column;
      }
      body.theme-light .lucnham-fs-modal {
        background: #ffffff !important;
        border-top-color: #d97706 !important;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2) !important;
        color: #1f2937 !important;
      }
      .lucnham-fs-modal.open {
        transform: translateY(0);
      }
      .lucnham-fs-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 14px;
        border-bottom: 1px solid rgba(245, 176, 65, 0.25);
        background: rgba(26, 4, 8, 0.95);
        border-radius: 14px 14px 0 0;
        flex-shrink: 0;
      }
      body.theme-light .lucnham-fs-modal-header {
        background: #f8fafc !important;
        border-bottom-color: #e2e8f0 !important;
      }
      .lucnham-fs-modal-title {
        font-size: 12.5px;
        font-weight: 800;
        color: var(--gold-primary, #f5b041);
        display: flex;
        align-items: center;
        gap: 6px;
      }
      body.theme-light .lucnham-fs-modal-title {
        color: #b45309 !important;
      }
      .lucnham-fs-modal-body {
        padding: 12px 14px calc(var(--safe-bottom, 20px) + 20px);
        overflow-y: auto;
        flex: 1;
        -webkit-overflow-scrolling: touch;
      }
      .lucnham-trachcat-chip-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 4px;
        margin-bottom: 10px;
      }
      .lucnham-trachcat-chip {
        background: rgba(26, 4, 8, 0.7);
        border: 1px solid rgba(245, 176, 65, 0.25);
        border-radius: 6px;
        padding: 5px 2px;
        text-align: center;
        font-size: 11px;
        font-weight: 700;
        color: var(--text-secondary, #94a3b8);
        cursor: pointer;
        transition: all 0.15s ease;
      }
      body.theme-light .lucnham-trachcat-chip {
        background: #f1f5f9;
        border-color: #cbd5e1;
        color: #475569;
      }
      .lucnham-trachcat-chip.active {
        background: linear-gradient(135deg, rgba(245, 176, 65, 0.35), rgba(217, 119, 6, 0.5)) !important;
        border-color: var(--gold-primary, #f5b041) !important;
        color: var(--gold-primary, #f5b041) !important;
        font-weight: 900;
      }
      body.theme-light .lucnham-trachcat-chip.active {
        background: #fef3c7 !important;
        border-color: #d97706 !important;
        color: #b45309 !important;
      }
      /* Essay modal typography */
      .fs-essay-content h1 { font-size: 14.5px; color: #f5b041; border-bottom: 1px solid rgba(245, 176, 65, 0.3); padding-bottom: 4px; margin: 12px 0 6px; line-height: 1.4; }
      .fs-essay-content h2 { font-size: 13px; color: #38bdf8; margin: 10px 0 4px; }
      .fs-essay-content h3 { font-size: 12px; color: #fde047; margin: 8px 0 3px; }
      .fs-essay-content p { font-size: 11px; line-height: 1.6; margin: 5px 0; }
      .fs-essay-content ul { padding-left: 18px; margin: 5px 0; font-size: 11px; line-height: 1.5; }
      .fs-essay-content blockquote { border-left: 3px solid #f5b041; padding: 4px 8px; margin: 6px 0; background: rgba(245, 176, 65, 0.08); font-size: 11px; }
      .fs-essay-content table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 10.5px; }
      .fs-essay-content th, .fs-essay-content td { border: 1px solid rgba(245, 176, 65, 0.25); padding: 4px 6px; text-align: left; }
      .fs-essay-content th { background: rgba(245, 176, 65, 0.15); color: #f5b041; font-weight: 800; }
      body.theme-light .fs-essay-content h1 { color: #b45309 !important; border-bottom-color: #cbd5e1 !important; }
      body.theme-light .fs-essay-content h2 { color: #0284c7 !important; }
      body.theme-light .fs-essay-content h3 { color: #78350f !important; }
      body.theme-light .fs-essay-content p, body.theme-light .fs-essay-content ul { color: #1e293b !important; }
      body.theme-light .fs-essay-content blockquote { background: #fffbeb !important; border-left-color: #d97706 !important; color: #78350f !important; }
      body.theme-light .fs-essay-content th, body.theme-light .fs-essay-content td { border-color: #cbd5e1 !important; }
      body.theme-light .fs-essay-content th { background: #f8fafc !important; color: #b45309 !important; }

    `;
    document.head.appendChild(styleEl);
  }

  function computeChart() {
    let canNgay = "Tân", chiNgay = "Mão", chiGio = "Sửu", chiNam = "Sửu", chiThang = "Tuất";
    let tietKhi = "Thu phân";
    let isDaytime = customDaytime;

    let targetLng = customLongitude || 105.85;
    if (global.LucNhamEngine && global.LucNhamEngine.CITY_LONGITUDES && global.LucNhamEngine.CITY_LONGITUDES[selectedCityKey]) {
      targetLng = global.LucNhamEngine.CITY_LONGITUDES[selectedCityKey].lng;
    }

    let effectiveDate = currentDate;
    let solarTimeInfo = null;

    if (useTrueSolarTime && global.LucNhamEngine && typeof global.LucNhamEngine.getChiGioChanThaiDuong === 'function') {
      solarTimeInfo = global.LucNhamEngine.getChiGioChanThaiDuong(currentDate, targetLng, 7);
      effectiveDate = solarTimeInfo.trueSolarDate;
    }

    // Tích hợp trực tiếp với NetaCalendarEngine
    if (global.NetaCalendarEngine && typeof global.NetaCalendarEngine.getFullDayInfo === 'function') {
      try {
        const cal = global.NetaCalendarEngine.getFullDayInfo(effectiveDate);
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

    if (useTrueSolarTime && solarTimeInfo) {
      chiGio = solarTimeInfo.chiGio;
      if (isDaytime === null) {
        isDaytime = solarTimeInfo.isDaytime;
      }
    } else {
      if (isDaytime === null) {
        isDaytime = ["Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân"].includes(chiGio);
      }
    }

    let nguyetTuong = customNguyetTuong;
    if (!nguyetTuong && global.LucNhamEngine) {
      if (typeof global.LucNhamEngine.getNguyetTuong === 'function') {
        nguyetTuong = global.LucNhamEngine.getNguyetTuong(tietKhi);
      } else {
        const map = global.LucNhamEngine.SOLAR_TERM_TO_NGUYET_TUONG;
        const tkClean = (tietKhi || "").trim();
        nguyetTuong = map[tkClean] || map[tkClean.toLowerCase()] || map["Thu phân"] || "Thìn";
      }
    }
    if (!nguyetTuong) nguyetTuong = "Thìn";

    const currentYear = currentDate.getFullYear();
    const birthYear = currentQuerentBirthYear || (currentYear - 36);

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
        chiThang,
        date: currentDate,
        useTrueSolarTime,
        longitude: targetLng,
        city: selectedCityKey
      });
      if (currentChart && solarTimeInfo) {
        currentChart.solarTimeInfo = solarTimeInfo;
      }
    }
  }

  function renderCityOptionsHTML() {
    const cities = (global.LucNhamEngine && global.LucNhamEngine.CITY_LONGITUDES) ? global.LucNhamEngine.CITY_LONGITUDES : {};
    let html = '';
    for (const [key, info] of Object.entries(cities)) {
      const isSel = (key === selectedCityKey);
      html += `<option value="${key}" ${isSel ? 'selected' : ''}>${info.name} (${info.lng}°E)</option>`;
    }
    return html;
  }

  function initLucNhamView(target) {
    const container = target || document.getElementById('view-lucnham');
    if (!container) return;
    ensureStyles();
    renderLucNham(container);
  }

  function renderLucNham(targetContainer, preserveScroll = false) {
    const container = targetContainer || document.getElementById('view-lucnham');
    if (!container) return;
    const scrollEl = container.querySelector('.lucnham-view-wrap');
    const prevScrollY = preserveScroll ? (scrollEl ? scrollEl.scrollTop : (window.scrollY || document.documentElement.scrollTop)) : null;
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

          <!-- Row 2: Can Chi Giờ + Giờ : Phút + Quý Nhân Đán / Mộ -->
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
            <div class="ucc-pill-danmo" title="Chọn Quý Nhân Đán (ngày) hoặc Mộ (đêm)">
              <button type="button" class="ucc-danmo-btn ${isDay ? 'active dan' : ''}" id="lucnham-btn-dan">☀️ Đán</button>
              <button type="button" class="ucc-danmo-btn ${!isDay ? 'active mo' : ''}" id="lucnham-btn-mo">🌙 Mộ</button>
            </div>
          </div>

          <!-- Row 2.5: Giờ Chân Thái Dương (True Apparent Solar Time) -->
          <div class="ucc-row ucc-row-solartime" id="lucnham-ucc-solartime">
            <div class="solartime-toggle-wrap">
              <button type="button" class="solartime-toggle-btn ${useTrueSolarTime ? 'active' : ''}" id="lucnham-btn-toggle-solartime" title="Bật/Tắt hiệu chỉnh Giờ Chân Thái Dương (EOT + Kinh độ thực tế)">
                ☀️ Chân Thái Dương: ${useTrueSolarTime ? 'BẬT' : 'TẮT'}
              </button>
            </div>
            <div class="solartime-city-wrap">
              <select id="lucnham-select-city" class="select-city" ${!useTrueSolarTime ? 'disabled style="opacity: 0.55;"' : ''} title="Chọn địa phương để lấy kinh độ thực tế">
                ${renderCityOptionsHTML()}
              </select>
              <button type="button" class="ucc-btn-gps" id="lucnham-btn-gps" title="Lấy kinh độ GPS thực tế từ thiết bị" ${!useTrueSolarTime ? 'disabled style="opacity: 0.55;"' : ''}>📍</button>
            </div>
          </div>
          ${useTrueSolarTime && c.solarTimeInfo ? `
            <div class="solartime-info-bar">
              <span>⚡ Hiệu chỉnh: <strong>${c.solarTimeInfo.totalOffsetMinutes >= 0 ? '+' : ''}${c.solarTimeInfo.totalOffsetMinutes} ph</strong></span>
              <span>(EOT: ${c.solarTimeInfo.eotMinutes >= 0 ? '+' : ''}${c.solarTimeInfo.eotMinutes}m • Kinh độ: ${c.solarTimeInfo.longitudeOffsetMinutes >= 0 ? '+' : ''}${c.solarTimeInfo.longitudeOffsetMinutes}m)</span>
              <span>🕒 <strong>${c.solarTimeInfo.trueSolarDatetime.split(' ')[1]}</strong> (${c.solarTimeInfo.chiGio})</span>
            </div>
          ` : ''}

          <!-- Row 3: Năm Sinh Đương Số + Can Chi / Tuổi Âm + Giới Tính -->
          <div class="ucc-row ucc-row-querent">
            <div class="ucc-querent-box" title="Nhập năm sinh đương số để tính Bản Mệnh & Hành Niên">
              <span class="ucc-querent-label">👤 Đương số:</span>
              <input type="number" id="lucnham-input-birthyear" class="num-birthyear" min="1900" max="2100" value="${currentQuerentBirthYear}" placeholder="Năm">
              <span class="ucc-querent-badge" id="lucnham-badge-canchi-tuoi">${c.canChiNamSinh || ''} • ${c.tuoiAm}T</span>
            </div>
            <div class="ucc-pill-gender">
              <button type="button" class="ucc-gender-btn ${currentIsMale ? 'active male' : ''}" id="lucnham-btn-male">♂ Nam</button>
              <button type="button" class="ucc-gender-btn ${!currentIsMale ? 'active female' : ''}" id="lucnham-btn-female">♀ Nữ</button>
            </div>
          </div>

          <!-- Row 4: Actions + Switch View Bàn Quẻ vs Luận Giải (Bát Tự Uniform) -->
          <div class="ucc-row ucc-row-actions">
            <button class="ucc-btn-now" id="lucnham-btn-now" title="Về thời điểm hiện tại">
              ⚡ Giờ thực
            </button>
            <div class="ucc-pill-view">
              <button type="button" class="ucc-view-btn ${currentMainTab === 'chart' ? 'active' : ''}" id="btn-lucnham-tab-chart" title="Bàn Quẻ Lục Nhâm">
                <span class="ucc-txt-long">🏛️ Bàn Quẻ</span>
                <span class="ucc-txt-short">🏛️ Quẻ</span>
              </button>
              <button type="button" class="ucc-view-btn ${currentMainTab === 'analysis' ? 'active' : ''}" id="btn-lucnham-tab-analysis" title="Bản Luận Giải Chuyên Sâu">
                <span class="ucc-txt-long">📜 Luận Giải</span>
                <span class="ucc-txt-short">📜 Luận</span>
              </button>
              <button type="button" class="ucc-view-btn ${currentMainTab === 'fengshui' ? 'active' : ''}" id="btn-lucnham-tab-fengshui" title="Chẩn Đoán Phong Thủy Không Gian 8 Hướng">
                <span class="ucc-txt-long">🏡 Phong Thủy</span>
                <span class="ucc-txt-short">🏡 P.Thủy</span>
              </button>
            </div>
            <button class="ucc-btn-submit" id="lucnham-btn-submit" title="Lập quẻ Lục Nhâm">
              🔮 Lập Quẻ
            </button>
          </div>
        </div>

        ${currentMainTab === 'analysis' ? renderLucNhamAnalysisHTML(c) : (currentMainTab === 'fengshui' ? renderLucNhamFengShuiHTML(c) : `
          <!-- Unified Master Card: Thông Tin Thần Khóa & Chế Độ Xem (8 Lớp / 1 Chạm) -->
          <div class="lucnham-master-card">
            <div class="lucnham-master-header">
              <div class="lucnham-master-title">
                <span style="font-size: 13px;">📜</span>
                <span>THÔNG TIN THẦN KHÓA</span>
              </div>
              <div class="ucc-pill-view lucnham-mode-pill">
                <button class="ucc-view-btn ${currentViewMode === 'classic' ? 'active' : ''}" id="btn-lucnham-mode-classic" title="Bàn cờ 8 lớp đầy đủ">🗂️ 8 Lớp</button>
                <button class="ucc-view-btn ${currentViewMode === 'touch' ? 'active' : ''}" id="btn-lucnham-mode-touch" title="Bàn cảm ứng tối giản 1-chạm">📱 1 Chạm</button>
              </div>
            </div>

            <!-- Ma trận 2 hàng x 3 cột cân đối tuyệt đối -->
            <div class="lucnham-stat-grid">
              <div class="lucnham-stat-cell">
                <div class="lucnham-stat-lbl">NGÀY</div>
                <div class="lucnham-stat-val tms-val-gold">${c.canNgay} ${c.chiNgay}</div>
              </div>
              <div class="lucnham-stat-cell">
                <div class="lucnham-stat-lbl">GIỜ</div>
                <div class="lucnham-stat-val ${c.solarTimeInfo ? 'val-solar-active' : ''}">${c.chiGio} ${c.solarTimeInfo ? '<span class="val-sub" style="color: #38bdf8;">(Thái Dương)</span>' : ''}</div>
              </div>
              <div class="lucnham-stat-cell">
                <div class="lucnham-stat-lbl">QUÝ NHÂN</div>
                <div class="lucnham-stat-val val-danmo">${isDay ? '☀️ Đán Quý' : '🌙 Mộ Quý'}</div>
              </div>
              <div class="lucnham-stat-cell">
                <div class="lucnham-stat-lbl">NGUYỆT TƯỚNG</div>
                <div class="lucnham-stat-val val-tuong">${c.nguyetTuong} <span class="val-sub">(${c.tietKhi})</span></div>
              </div>
              <div class="lucnham-stat-cell">
                <div class="lucnham-stat-lbl">BẢN MỆNH</div>
                <div class="lucnham-stat-val val-menh">${c.banMenhChi || '---'}</div>
              </div>
              <div class="lucnham-stat-cell">
                <div class="lucnham-stat-lbl">HÀNH NIÊN</div>
                <div class="lucnham-stat-val val-hanhnien">${c.hanhNienChi} <span class="val-sub">(${c.tuoiAm}T)</span></div>
              </div>
            </div>
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
                <div class="lucnham-truyen-chi truyen-nguhanh-${c.soTruyen.nguHanh.toLowerCase()}">${c.soTruyen.chi}</div>
                <div style="font-size: 10px; font-weight: 600; color: var(--text-secondary, #cbd5e1);">${c.soTruyen.lucThan}</div>
                <div style="font-size: 8.5px; opacity: 0.75; border-top: 1px solid rgba(245, 176, 65, 0.2); margin-top: 4px; padding-top: 2px;">
                  ${c.soTruyen.nguHanh} · Sơ phát
                </div>
              </div>

              <!-- Trung Truyền -->
              <div class="lucnham-truyen-box" style="border-color: ${NGU_HANH_COLORS[c.trungTruyen.nguHanh].border};">
                <span class="lucnham-truyen-tag">TRUNG</span>
                <div style="font-size: 10px; font-weight: 700; color: #818cf8; margin-top: 10px;">${c.trungTruyen.thienTuong}</div>
                <div class="lucnham-truyen-chi truyen-nguhanh-${c.trungTruyen.nguHanh.toLowerCase()}">${c.trungTruyen.chi}</div>
                <div style="font-size: 10px; font-weight: 600; color: var(--text-secondary, #cbd5e1);">${c.trungTruyen.lucThan}</div>
                <div style="font-size: 8.5px; opacity: 0.75; border-top: 1px solid rgba(245, 176, 65, 0.2); margin-top: 4px; padding-top: 2px;">
                  ${c.trungTruyen.nguHanh} · Trung di
                </div>
              </div>

              <!-- Mạt Truyền -->
              <div class="lucnham-truyen-box" style="border-color: ${NGU_HANH_COLORS[c.matTruyen.nguHanh].border};">
                <span class="lucnham-truyen-tag">MẠT</span>
                <div style="font-size: 10px; font-weight: 700; color: #34d399; margin-top: 10px;">${c.matTruyen.thienTuong}</div>
                <div class="lucnham-truyen-chi truyen-nguhanh-${c.matTruyen.nguHanh.toLowerCase()}">${c.matTruyen.chi}</div>
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
                <div class="lucnham-khoa-thu">${c.tuKhoa[3]?.thuong || ''}</div>
                <div class="lucnham-khoa-ha">${c.tuKhoa[3]?.ha || ''}</div>
                <div class="lucnham-khoa-tag ${getTagClass(c.tuKhoa[3]?.quanHe)}">${c.tuKhoa[3]?.quanHe || '---'}</div>
              </div>

              <!-- Khóa 3: Chi Dương -->
              <div class="lucnham-khoa-col">
                <div style="font-size: 8.5px; color: #94a3b8;">III</div>
                <div class="lucnham-khoa-thu">${c.tuKhoa[2]?.thuong || ''}</div>
                <div class="lucnham-khoa-ha">${c.tuKhoa[2]?.ha || ''}</div>
                <div class="lucnham-khoa-tag ${getTagClass(c.tuKhoa[2]?.quanHe)}">${c.tuKhoa[2]?.quanHe || '---'}</div>
              </div>

              <!-- Khóa 2: Can Âm -->
              <div class="lucnham-khoa-col">
                <div style="font-size: 8.5px; color: #94a3b8;">II</div>
                <div class="lucnham-khoa-thu">${c.tuKhoa[1]?.thuong || ''}</div>
                <div class="lucnham-khoa-ha">${c.tuKhoa[1]?.ha || ''}</div>
                <div class="lucnham-khoa-tag ${getTagClass(c.tuKhoa[1]?.quanHe)}">${c.tuKhoa[1]?.quanHe || '---'}</div>
              </div>

              <!-- Khóa 1: Can Dương -->
              <div class="lucnham-khoa-col">
                <div style="font-size: 8.5px; color: #94a3b8;">I</div>
                <div class="lucnham-khoa-thu">${c.tuKhoa[0]?.thuong || ''}</div>
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
              <div class="ucc-pill-view lucnham-mode-pill" style="width: 140px !important;">
                <button class="ucc-view-btn ${currentViewMode === 'classic' ? 'active' : ''}" id="btn-lucnham-mode-classic-bottom" title="Bàn cờ 8 lớp đầy đủ">🗂️ 8 Lớp</button>
                <button class="ucc-view-btn ${currentViewMode === 'touch' ? 'active' : ''}" id="btn-lucnham-mode-touch-bottom" title="Bàn cảm ứng tối giản 1-chạm">📱 1 Chạm</button>
              </div>
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
                      <span class="hud-title" style="font-size: 9px; font-weight: 800; color: var(--gold-primary, #f5b041); text-transform: uppercase;">LỤC NHÂM ĐẠI ĐỘN</span>
                      <div class="hud-main" style="font-size: 13px; font-weight: 900; margin: 2px 0;">${c.canNgay} ${c.chiNgay}</div>
                      <div class="hud-trachmo" style="font-size: 9px; color: #34d399;">Trạch: ${c.trachThan} · Mộ: ${c.moThan}</div>
                      <div class="hud-hanhnien" style="font-size: 9px; color: #fde047; margin-top: 1px;">Mệnh: ${c.banMenhChi || '---'} · H.Niên: ${c.hanhNienChi} (${c.tuoiAm}T)</div>
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
        `)}
      </div>

      <!-- Drawer Tra Cứu Chi Tiết 1 Cung -->
      <div id="lucnham-drawer-overlay" class="lucnham-drawer-overlay" onclick="window.LucNhamView.closeDrawer()"></div>
      <div id="lucnham-drawer" class="lucnham-drawer">
        <div id="lucnham-drawer-content"></div>
      </div>

      <!-- Modal Bài Luận Phong Thủy 8 Tầng -->
      <div id="lucnham-fs-essay-overlay" class="lucnham-fs-modal-overlay ${isEssayModalOpen ? 'open' : ''}" onclick="window.LucNhamView.closeFsEssayModal()"></div>
      <div id="lucnham-fs-essay-modal" class="lucnham-fs-modal ${isEssayModalOpen ? 'open' : ''}">
        <div class="lucnham-fs-modal-header">
          <div>
            <div class="lucnham-fs-modal-title">
              <span>📜</span> BÀI LUẬN PHONG THỦY ${currentDwellingType === 'AM_TRACH' ? '(ÂM TRẠCH)' : '(DƯƠNG TRẠCH)'}
            </div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 1px;">
              Quẻ ${c.canNgay} ${c.chiNgay} · Tiết khí: ${c.tietKhi}
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 5px;">
            <button type="button" class="neta-mode-pill ${fsReportMode === 'standard' ? 'active' : ''}" id="btn-fs-essay-mode-standard" style="padding: 2px 7px; font-size: 10px; height: 26px;">Bản Gốc</button>
            <button type="button" class="neta-mode-pill ${fsReportMode === 'ai' ? 'active' : ''}" id="btn-fs-essay-mode-ai" style="padding: 2px 7px; font-size: 10px; height: 26px;">${isFsAiPolishing ? '⏳' : '✨ AI'}</button>
            <button type="button" class="neta-mode-pill" id="lucnham-btn-download-fs-modal" style="padding: 2px 6px; font-size: 10.5px; height: 26px;" title="Tải .md">💾</button>
            <button type="button" class="lucnham-btn-drawer-close" id="lucnham-fs-essay-close" style="width: 28px; height: 28px; min-width: 28px; min-height: 28px; font-size: 15px;">✕</button>
          </div>
        </div>
        <div class="lucnham-fs-modal-body fs-essay-content" id="lucnham-fs-essay-body"></div>
      </div>

      <!-- Modal Tra Cứu Trạch Cát -->
      <div id="lucnham-fs-trachcat-overlay" class="lucnham-fs-modal-overlay ${isTrachCatModalOpen ? 'open' : ''}" onclick="window.LucNhamView.closeFsTrachCatModal()"></div>
      <div id="lucnham-fs-trachcat-modal" class="lucnham-fs-modal ${isTrachCatModalOpen ? 'open' : ''}">
        <div class="lucnham-fs-modal-header">
          <div>
            <div class="lucnham-fs-modal-title">
              <span>⏳</span> TRA CỨU TRẠCH CÁT & CẤM KỴ
            </div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 1px;">
              Năm ${c.chiNam || 'Ngọ'} · Tam Sát, Tuế Phá & Cát Thần
            </div>
          </div>
          <button type="button" class="lucnham-btn-drawer-close" id="lucnham-fs-trachcat-close" style="width: 28px; height: 28px; min-width: 28px; min-height: 28px; font-size: 15px;">✕</button>
        </div>
        <div class="lucnham-fs-modal-body" id="lucnham-fs-trachcat-body"></div>
      </div>
    `;

    bindLucNhamEvents();

    if (isEssayModalOpen) {
      renderFsEssayBody();
      updateFsEssayPills();
    }
    if (isTrachCatModalOpen) {
      renderFsTrachCatBody();
    }

    if (prevScrollY !== null) {
      requestAnimationFrame(() => {
        const sc = container.querySelector('.lucnham-view-wrap');
        if (sc) {
          sc.scrollTop = prevScrollY;
        } else {
          window.scrollTo({ top: prevScrollY, behavior: 'instant' });
        }
      });
    }
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
    if (b.tagBanMenh) tags.push(`<span class="tag-banmenh">${b.tagBanMenh}</span>`);
    if (b.tagHanhNien) tags.push(`<span class="tag-hanhnien">${b.tagHanhNien}</span>`);
    if (b.tagTrachMo) tags.push(`<span class="tag-trachmo">${b.tagTrachMo}</span>`);
    if (b.tagCanChiNgay) tags.push(`<span class="tag-canchingay">${b.tagCanChiNgay}</span>`);
    const tagHtml = tags.join(' ');

    if (currentViewMode === 'touch') {
      return `
        <div class="lucnham-cung-cell ${isActive ? 'lucnham-cung-active' : ''}" onclick="window.LucNhamView.selectPalace('${b.diaBan}')">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; font-size: 9px;">
            <span style="font-weight: 800; color: #94a3b8;">${b.diaBan}</span>
            <span class="lucnham-cell-thientuong" style="font-size: 8px; font-weight: 700; max-width: 46px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${b.thienTuong}
            </span>
          </div>
          <div class="lucnham-cell-thienban" style="text-align: center; font-size: 15px; font-weight: 900; margin: 2px 0;">
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
          <span class="lucnham-cell-thienban" style="font-weight: 900;">${b.thienBan}</span>
          <div style="font-size: 8px; line-height: 1;">${tagHtml}</div>
        </div>
        <!-- Dòng 2: Thiên tướng -->
        <div class="lucnham-cell-thientuong" style="font-size: 8.5px; font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
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
    bindLuanAnalysisEvents();
    const pad = n => String(n).padStart(2, '0');

    // UCC View Switcher: Bàn Quẻ vs Luận Giải vs Phong Thủy
    const btnTabChart = document.getElementById('btn-lucnham-tab-chart');
    const btnTabAnalysis = document.getElementById('btn-lucnham-tab-analysis');
    const btnTabFengShui = document.getElementById('btn-lucnham-tab-fengshui');
    const btnOpenLuan = document.getElementById('lucnham-btn-open-luan');

    if (btnTabChart) {
      btnTabChart.onclick = () => {
        currentMainTab = 'chart';
        renderLucNham(null, true);
      };
    }
    if (btnTabAnalysis) {
      btnTabAnalysis.onclick = () => {
        currentMainTab = 'analysis';
        renderLucNham(null, true);
      };
    }
    if (btnTabFengShui) {
      btnTabFengShui.onclick = () => {
        currentMainTab = 'fengshui';
        renderLucNham(null, true);
      };
    }
    if (btnOpenLuan) {
      btnOpenLuan.onclick = () => {
        currentMainTab = 'analysis';
        renderLucNham(null, true);
      };
    }

    // Sub-nav for Feng Shui: Dương Trạch vs Âm Trạch + Action Bar
    const btnFsDuong = document.getElementById('btn-fs-mode-duong');
    const btnFsAm = document.getElementById('btn-fs-mode-am');
    const btnOpenEssay = document.getElementById('lucnham-btn-open-essay');
    const btnOpenTrachCat = document.getElementById('lucnham-btn-open-trachcat');
    const btnDownloadFs = document.getElementById('lucnham-btn-download-fs');
    const btnAiPolishFs = document.getElementById('lucnham-btn-ai-polish-fs');
    const btnCopyFs = document.getElementById('lucnham-btn-copy-fengshui');

    if (btnFsDuong) {
      btnFsDuong.onclick = () => {
        currentDwellingType = 'DUONG_TRACH';
        fsAiPolishedText = null;
        renderLucNham(null, true);
      };
    }
    if (btnFsAm) {
      btnFsAm.onclick = () => {
        currentDwellingType = 'AM_TRACH';
        fsAiPolishedText = null;
        renderLucNham(null, true);
      };
    }
    if (btnOpenEssay) {
      btnOpenEssay.onclick = () => {
        openFsEssayModal();
      };
    }
    if (btnOpenTrachCat) {
      btnOpenTrachCat.onclick = () => {
        openFsTrachCatModal();
      };
    }
    if (btnDownloadFs) {
      btnDownloadFs.onclick = () => {
        downloadFsReport();
      };
    }
    if (btnAiPolishFs) {
      btnAiPolishFs.onclick = () => {
        triggerFsAiPolish();
      };
    }
    if (btnCopyFs) {
      btnCopyFs.onclick = () => {
        if (!currentChart || !global.LucNhamFengShui) return;
        const fsRep = global.LucNhamFengShui.evaluate(currentChart, {
          dwellingType: currentDwellingType,
          siteName: currentDwellingType === 'AM_TRACH' ? 'Mộ Phần Tiên Tổ' : 'Gia Trạch Cư Trú'
        });
        if (fsRep && fsRep.markdownEssay) {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(fsRep.markdownEssay).then(() => {
              showToast('Đã sao chép toàn văn bài luận Phong Thủy vào Clipboard!');
            }).catch(() => {
              fallbackCopyText(fsRep.markdownEssay);
            });
          } else {
            fallbackCopyText(fsRep.markdownEssay);
          }
        }
      };
    }

    // Modal Events: Essay Reader
    const btnCloseEssay = document.getElementById('lucnham-fs-essay-close');
    const btnEssayStd = document.getElementById('btn-fs-essay-mode-standard');
    const btnEssayAi = document.getElementById('btn-fs-essay-mode-ai');
    const btnDownloadFsModal = document.getElementById('lucnham-btn-download-fs-modal');
    if (btnCloseEssay) btnCloseEssay.onclick = () => closeFsEssayModal();
    if (btnDownloadFsModal) btnDownloadFsModal.onclick = () => downloadFsReport();
    if (btnEssayStd) {
      btnEssayStd.onclick = () => {
        fsReportMode = 'standard';
        renderFsEssayBody();
        updateFsEssayPills();
      };
    }
    if (btnEssayAi) {
      btnEssayAi.onclick = () => {
        fsReportMode = 'ai';
        if (!fsAiPolishedText && !isFsAiPolishing) {
          triggerFsAiPolish();
        } else {
          renderFsEssayBody();
          updateFsEssayPills();
        }
      };
    }

    // Modal Events: Trạch Cát
    const btnCloseTrachCat = document.getElementById('lucnham-fs-trachcat-close');
    if (btnCloseTrachCat) btnCloseTrachCat.onclick = () => closeFsTrachCatModal();

    // Mode Switches (8 Lớp vs 1 Chạm: Đồng bộ cả Top Master Card và Bottom Bàn Cờ)
    const bindModeBtn = (btnId, mode) => {
      const el = document.getElementById(btnId);
      if (el) {
        el.onclick = () => {
          currentViewMode = mode;
          renderLucNham();
        };
      }
    };
    bindModeBtn('btn-lucnham-mode-classic', 'classic');
    bindModeBtn('btn-lucnham-mode-touch', 'touch');
    bindModeBtn('btn-lucnham-mode-classic-bottom', 'classic');
    bindModeBtn('btn-lucnham-mode-touch-bottom', 'touch');

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

    // Quý Nhân Đán / Mộ Toggle
    const btnDan = document.getElementById('lucnham-btn-dan');
    const btnMo = document.getElementById('lucnham-btn-mo');
    if (btnDan) {
      btnDan.onclick = () => {
        customDaytime = true;
        renderLucNham();
      };
    }
    if (btnMo) {
      btnMo.onclick = () => {
        customDaytime = false;
        renderLucNham();
      };
    }

    // Toggle True Solar Time
    const btnToggleSolar = document.getElementById('lucnham-btn-toggle-solartime');
    if (btnToggleSolar) {
      btnToggleSolar.onclick = () => {
        useTrueSolarTime = !useTrueSolarTime;
        try {
          localStorage.setItem('neta_lucnham_solartime', JSON.stringify({
            enabled: useTrueSolarTime,
            city: selectedCityKey,
            lng: customLongitude
          }));
        } catch (e) {}
        renderLucNham(null, true);
        showToast(useTrueSolarTime ? `Đã kích hoạt Giờ Chân Thái Dương (${selectedCityKey})` : 'Đã tắt Giờ Chân Thái Dương (Dùng giờ đồng hồ)');
      };
    }

    // Select City
    const selectCity = document.getElementById('lucnham-select-city');
    if (selectCity) {
      selectCity.onchange = () => {
        selectedCityKey = selectCity.value;
        const cityData = (global.LucNhamEngine && global.LucNhamEngine.CITY_LONGITUDES) ? global.LucNhamEngine.CITY_LONGITUDES[selectedCityKey] : null;
        if (cityData) {
          customLongitude = cityData.lng;
        }
        try {
          localStorage.setItem('neta_lucnham_solartime', JSON.stringify({
            enabled: useTrueSolarTime,
            city: selectedCityKey,
            lng: customLongitude
          }));
        } catch (e) {}
        renderLucNham(null, true);
        showToast(`Đã chuyển tọa độ: ${cityData ? cityData.name : selectedCityKey} (${customLongitude}°E)`);
      };
    }

    // GPS Button
    const btnGps = document.getElementById('lucnham-btn-gps');
    if (btnGps) {
      btnGps.onclick = () => {
        if (!navigator.geolocation) {
          showToast('Thiết bị không hỗ trợ định vị Geolocation');
          return;
        }
        showToast('Đang định vị GPS...');
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lng = Math.round(pos.coords.longitude * 100) / 100;
            customLongitude = lng;
            if (global.LucNhamEngine && global.LucNhamEngine.CITY_LONGITUDES) {
              let minDist = 999999;
              for (const [k, v] of Object.entries(global.LucNhamEngine.CITY_LONGITUDES)) {
                const dist = Math.abs(v.lng - lng);
                if (dist < minDist) {
                  minDist = dist;
                  selectedCityKey = k;
                }
              }
            }
            try {
              localStorage.setItem('neta_lucnham_solartime', JSON.stringify({
                enabled: useTrueSolarTime,
                city: selectedCityKey,
                lng: customLongitude
              }));
            } catch (e) {}
            renderLucNham(null, true);
            showToast(`GPS thành công: ${lng}°E (Gần ${selectedCityKey})`);
          },
          (err) => {
            showToast('Không lấy được GPS: ' + (err.message || 'Lỗi quyền truy cập'));
          },
          { timeout: 8000 }
        );
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

    // Querent Birth Year Input & Live Tag Calculation
    const inputBirthYear = document.getElementById('lucnham-input-birthyear');
    if (inputBirthYear) {
      inputBirthYear.addEventListener('input', () => {
        const val = parseInt(inputBirthYear.value, 10);
        if (!isNaN(val) && val >= 1900 && val <= 2100) {
          currentQuerentBirthYear = val;
          const CHI_YEAR = ["Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi"];
          const CAN_YEAR = ["Canh", "Tân", "Nhâm", "Quý", "Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ"];
          const bm = CHI_YEAR[((val % 12) + 12) % 12];
          const cn = CAN_YEAR[((val % 10) + 10) % 10];
          const curY = currentDate ? currentDate.getFullYear() : new Date().getFullYear();
          const tuoi = curY - val + 1;
          const badge = document.getElementById('lucnham-badge-canchi-tuoi');
          if (badge) badge.textContent = `${cn} ${bm} • ${tuoi}T`;
        }
      });
      inputBirthYear.addEventListener('change', () => {
        const val = parseInt(inputBirthYear.value, 10);
        if (!isNaN(val) && val >= 1900 && val <= 2100) {
          currentQuerentBirthYear = val;
          renderLucNham();
        }
      });
    }

    // Drawer Overlay Dismiss (Click & Touch)
    const drawerOverlay = document.getElementById('lucnham-drawer-overlay');
    if (drawerOverlay) {
      drawerOverlay.onclick = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        closeDrawer();
      };
      drawerOverlay.ontouchend = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        closeDrawer();
      };
    }

    // Now button
    const btnNow = document.getElementById('lucnham-btn-now');
    if (btnNow) {
      btnNow.onclick = () => {
        isLunarMode = false;
        customDaytime = null;
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

        if (inputBirthYear) {
          const by = parseInt(inputBirthYear.value, 10);
          if (!isNaN(by) && by >= 1900 && by <= 2100) {
            currentQuerentBirthYear = by;
          }
        }

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
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid rgba(245, 176, 65, 0.25); padding-bottom: 8px;">
        <div>
          <div style="font-size: 14px; font-weight: 800; color: var(--gold-primary, #f5b041);">
            CUNG [${b.diaBan}] · THIÊN BÀN [${b.thienBan}]
          </div>
          <div style="font-size: 10px; color: #94a3b8;">
            Lục Thân: <strong style="color: var(--text-primary, #ffffff);">${b.lucThan || '---'}</strong> · Thần Cung: <strong style="color: #38bdf8;">${b.tenNguyetTuong || '---'}</strong>
          </div>
        </div>
        <button type="button" id="lucnham-btn-drawer-close" class="lucnham-btn-drawer-close" title="Đóng bảng tra cứu">✕</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; line-height: 1.4;">
        <div style="background: rgba(245, 176, 65, 0.1); border-left: 3px solid #f5b041; padding: 6px 8px; border-radius: 0 4px 4px 0;">
          <div style="font-weight: 800; color: var(--gold-primary, #f5b041); margin-bottom: 2px;">
            Thần Tướng: ${b.thienTuong || '---'}
          </div>
          <div>${tuongDesc}</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
          <div style="background: rgba(20, 2, 5, 0.6); padding: 6px 8px; border-radius: 6px; border: 1px solid rgba(245, 176, 65, 0.15);">
            <div style="color: #94a3b8; font-size: 9px;">Vòng Thái Tuế (Thiên Bàn)</div>
            <div style="font-weight: 700; color: #cbd5e1;">${b.saoThaiTue || '---'}</div>
          </div>
          <div style="background: rgba(20, 2, 5, 0.6); padding: 6px 8px; border-radius: 6px; border: 1px solid rgba(245, 176, 65, 0.15);">
            <div style="color: #94a3b8; font-size: 9px;">Vòng Kiến Trừ (Địa Bàn)</div>
            <div style="font-weight: 700; color: #38bdf8;">${b.saoKienTru || '---'}</div>
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

        ${(b.tagBanMenh || b.tagHanhNien || b.tagTrachMo) ? `
          <div style="background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3); padding: 6px 8px; border-radius: 6px; color: #bbf7d0;">
            🎯 <strong>Đặc Điểm Đương Số:</strong> ${b.tagBanMenh ? 'Bản Mệnh (' + b.tagBanMenh + ') ' : ''}${b.tagHanhNien ? '· Hành niên (' + b.tagHanhNien + ') ' : ''}${b.tagTrachMo ? '· ' + b.tagTrachMo : ''}
          </div>
        ` : ''}
      </div>
    `;

    const btnClose = document.getElementById('lucnham-btn-drawer-close');
    if (btnClose) {
      btnClose.onclick = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        closeDrawer();
      };
      btnClose.ontouchend = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        closeDrawer();
      };
    }

    drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
  }

  function closeDrawer() {
    const drawer = document.getElementById('lucnham-drawer');
    const overlay = document.getElementById('lucnham-drawer-overlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
  }

  
  // =========================================================================
  // PHÂN HỆ LUẬN GIẢI CHUYÊN SÂU LỤC NHÂM (RENDER MODAL & EVENTS)
  // =========================================================================
  function getRiskBadgeText(chart) {
    try {
      const interp = (global.NetaLucNhamInterpreter || global.LucNhamMobileEngine)
        ? (global.NetaLucNhamInterpreter || global.LucNhamMobileEngine).interpretChart(chart)
        : null;
      if (!interp) return "7 Tầng Luận Giải";
      if (interp.riskScore <= 2) return `Rủi ro: Thấp (${interp.riskScore}/5★)`;
      if (interp.riskScore === 3) return `Rủi ro: Vừa (${interp.riskScore}/5★)`;
      return `Rủi ro: Cao (${interp.riskScore}/5★)`;
    } catch (e) {
      return "7 Tầng Luận Giải";
    }
  }

  // =========================================================================
  // BỘ TIỆN ÍCH BIÊN TẬP HỌC THUẬT & TRÌNH XUẤT BẢN MARKDOWN (PHASE 3)
  // =========================================================================
  function formatMarkdownInline(text) {
    if (!text) return '';
    let s = text;
    const boldMatches = s.match(/\*\*/g);
    if (boldMatches && boldMatches.length % 2 !== 0) s += '**';
    const starMatches = s.replace(/\*\*/g, '').match(/\*/g);
    if (starMatches && starMatches.length % 2 !== 0) s += '*';
    return s
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
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

  function renderMarkdownToHTML(str) {
    if (!str) return '';
    const lines = str.split('\n');
    let html = '';
    let inList = false;
    let inTable = false;
    let tableHeaders = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) {
        if (inList) { html += '</ul>'; inList = false; }
        if (inTable) { html += '</tbody></table></div>'; inTable = false; tableHeaders = []; }
        continue;
      }

      if (/^\+[=+\-\|]+\+$/.test(line)) continue;
      if (/^\|[\s\|]+$/.test(line)) continue;

      if (line.startsWith('---') || line.startsWith('***')) {
        if (inList) { html += '</ul>'; inList = false; }
        if (inTable) { html += '</tbody></table></div>'; inTable = false; }
        html += '<hr style="border: 0; border-top: 1px dashed rgba(245, 176, 65, 0.3); margin: 12px 0;">';
        continue;
      }

      if (line.startsWith('> ')) {
        if (inList) { html += '</ul>'; inList = false; }
        const quoteText = line.substring(2).trim();
        html += '<blockquote>' + formatMarkdownInline(quoteText) + '</blockquote>';
        continue;
      }

      if (line.startsWith('|') && line.endsWith('|')) {
        if (inList) { html += '</ul>'; inList = false; }
        if (/^\|[\s\-:]+(\|[\s\-:]+)+\|$/.test(line)) continue;

        const cells = line.split('|').slice(1, -1).map(c => c.trim());
        if (cells.every(c => !c)) continue;

        if (!inTable) {
          inTable = true;
          tableHeaders = cells.map(c => c.replace(/\*\*/g, '').replace(/\*/g, '').trim());
          html += '<div style="overflow-x: auto; margin: 8px 0;"><table><thead><tr>';
          cells.forEach(cell => {
            html += `<th>${formatMarkdownInline(cell)}</th>`;
          });
          html += '</tr></thead><tbody>';
        } else {
          html += '<tr>';
          cells.forEach(cell => {
            html += `<td>${formatMarkdownInline(cell)}</td>`;
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
        html += `<h1>${formatMarkdownInline(line.substring(2).trim())}</h1>`;
        continue;
      }
      if (line.startsWith('## ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h2>${formatMarkdownInline(line.substring(3).trim())}</h2>`;
        continue;
      }
      if (line.startsWith('### ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h3>${formatMarkdownInline(line.substring(4).trim())}</h3>`;
        continue;
      }
      if (line.startsWith('#### ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h4>${formatMarkdownInline(line.substring(5).trim())}</h4>`;
        continue;
      }

      if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('+ ')) {
        if (!inList) { html += '<ul>'; inList = true; }
        html += `<li>${formatMarkdownInline(line.substring(2).trim())}</li>`;
        continue;
      }

      const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        if (!inList) { html += '<ul>'; inList = true; }
        html += `<li><strong>${numMatch[1]}.</strong> ${formatMarkdownInline(numMatch[2])}</li>`;
        continue;
      }

      if (inList) { html += '</ul>'; inList = false; }
      html += `<p>${formatMarkdownInline(line)}</p>`;
    }

    if (inList) html += '</ul>';
    if (inTable) html += '</tbody></table></div>';
    return html;
  }

  function downloadMarkdownFile(content, filename) {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'Bao_cao_Phong_thuy.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Đã tải về tệp báo cáo phong thủy .md!');
  }

  function downloadFsReport() {
    if (!currentChart || !global.LucNhamFengShui) return;
    const fsRep = global.LucNhamFengShui.evaluate(currentChart, {
      dwellingType: currentDwellingType,
      siteName: currentDwellingType === 'AM_TRACH' ? 'Mộ Phần Tiên Tổ' : 'Gia Trạch Cư Trú'
    });
    if (!fsRep || !fsRep.markdownEssay) {
      showToast('Không có dữ liệu bài luận để tải về.');
      return;
    }
    const pad = n => String(n).padStart(2, '0');
    const curD = currentDate || new Date();
    const dateStr = `${curD.getFullYear()}${pad(curD.getMonth() + 1)}${pad(curD.getDate())}_${pad(curD.getHours())}${pad(curD.getMinutes())}`;
    const typeStr = (currentDwellingType === 'AM_TRACH') ? 'Am_Trach_Chiem_Mo' : 'Duong_Trach_Cu_Tru';
    const filename = `Bao_cao_Phong_thuy_${typeStr}_${dateStr}.md`;

    const contentToDownload = (fsReportMode === 'ai' && fsAiPolishedText) ? fsAiPolishedText : fsRep.markdownEssay;
    downloadMarkdownFile(contentToDownload, filename);
  }

  function openFsEssayModal() {
    isEssayModalOpen = true;
    const modal = document.getElementById('lucnham-fs-essay-modal');
    const overlay = document.getElementById('lucnham-fs-essay-overlay');
    if (modal) modal.classList.add('open');
    if (overlay) overlay.classList.add('open');
    renderFsEssayBody();
    updateFsEssayPills();
  }

  function closeFsEssayModal() {
    isEssayModalOpen = false;
    const modal = document.getElementById('lucnham-fs-essay-modal');
    const overlay = document.getElementById('lucnham-fs-essay-overlay');
    if (modal) modal.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
  }

  function updateFsEssayPills() {
    const btnStd = document.getElementById('btn-fs-essay-mode-standard');
    const btnAi = document.getElementById('btn-fs-essay-mode-ai');
    if (btnStd) btnStd.classList.toggle('active', fsReportMode === 'standard');
    if (btnAi) btnAi.classList.toggle('active', fsReportMode === 'ai');
  }

  function renderFsEssayBody() {
    const el = document.getElementById('lucnham-fs-essay-body');
    if (!el || !currentChart || !global.LucNhamFengShui) return;
    const fsRep = global.LucNhamFengShui.evaluate(currentChart, {
      dwellingType: currentDwellingType,
      siteName: currentDwellingType === 'AM_TRACH' ? 'Mộ Phần Tiên Tổ' : 'Gia Trạch Cư Trú'
    });
    if (!fsRep) return;

    if (fsReportMode === 'ai') {
      if (isFsAiPolishing) {
        el.innerHTML = `
          <div style="text-align: center; padding: 30px 12px; color: var(--gold-primary, #f5b041);">
            <div class="lucnham-spin" style="font-size: 24px; margin-bottom: 8px;">✨</div>
            <div style="font-weight: 800; font-size: 13px;">Đang kết nối Gemini AI trau chuốt cấu trúc học thuật bài luận...</div>
            <div style="font-size: 11px; opacity: 0.8; margin-top: 4px;">Bảo toàn 100% kết quả tính toán 8 Tầng Địa Lý và Trạch Mộ.</div>
          </div>
        `;
        return;
      }
      if (fsAiErrorMessage) {
        el.innerHTML = `
          <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid #ef4444; border-radius: 8px; padding: 12px; color: #ef4444; font-size: 11.5px; line-height: 1.5;">
            <div><strong>⚠️ Lỗi AI:</strong> ${escapeHTML(fsAiErrorMessage)}</div>
            <div style="margin-top: 8px; display: flex; gap: 8px;">
              <button type="button" class="neta-mode-pill active" id="btn-fs-retry-ai">🔄 Thử Lại</button>
              <button type="button" class="neta-mode-pill" id="btn-fs-fallback-standard">↩️ Xem Bản Thuật Toán</button>
            </div>
          </div>
        `;
        const btnRetry = document.getElementById('btn-fs-retry-ai');
        const btnFallback = document.getElementById('btn-fs-fallback-standard');
        if (btnRetry) btnRetry.onclick = () => triggerFsAiPolish();
        if (btnFallback) btnFallback.onclick = () => { fsReportMode = 'standard'; renderFsEssayBody(); updateFsEssayPills(); };
        return;
      }
      if (fsAiPolishedText) {
        el.innerHTML = `
          <div class="neta-polished-status-bar" style="margin-bottom: 8px;">
            <span>✨ Bản Luận Giải Đã Được Trau Chuốt Học Thuật Bởi Gemini AI</span>
            <button type="button" class="neta-btn-inline-back" id="btn-fs-back-standard-from-ai">↩️ Bản Thuật Toán</button>
          </div>
          <div style="white-space: normal; line-height: 1.65;">
            ${renderMarkdownToHTML(fsAiPolishedText)}
          </div>
        `;
        const btnBack = document.getElementById('btn-fs-back-standard-from-ai');
        if (btnBack) btnBack.onclick = () => { fsReportMode = 'standard'; renderFsEssayBody(); updateFsEssayPills(); };
        return;
      }
      // Not yet polished
      el.innerHTML = `
        <div style="text-align: center; padding: 30px 12px; background: rgba(20, 2, 5, 0.5); border-radius: 8px; border: 1px dashed rgba(245, 176, 65, 0.25);">
          <div style="font-size: 20px; margin-bottom: 6px;">✨</div>
          <p style="font-size: 12px; color: var(--text-secondary, #94a3b8); margin-bottom: 12px;">Chưa khởi tạo bản trau chuốt văn phong Gemini AI cho báo cáo phong thủy này.</p>
          <button type="button" class="neta-mode-pill active" id="btn-fs-start-ai" style="padding: 6px 14px; font-weight: 800; font-size: 12px;">
            ✨ Khởi Tạo Bản Trau Chuốt AI
          </button>
        </div>
      `;
      const btnStart = document.getElementById('btn-fs-start-ai');
      if (btnStart) btnStart.onclick = () => triggerFsAiPolish();
      return;
    }

    // Standard mode (100% offline algorithmic)
    el.innerHTML = renderMarkdownToHTML(fsRep.markdownEssay);
  }

  function openFsTrachCatModal() {
    isTrachCatModalOpen = true;
    const modal = document.getElementById('lucnham-fs-trachcat-modal');
    const overlay = document.getElementById('lucnham-fs-trachcat-overlay');
    if (modal) modal.classList.add('open');
    if (overlay) overlay.classList.add('open');
    renderFsTrachCatBody();
  }

  function closeFsTrachCatModal() {
    isTrachCatModalOpen = false;
    const modal = document.getElementById('lucnham-fs-trachcat-modal');
    const overlay = document.getElementById('lucnham-fs-trachcat-overlay');
    if (modal) modal.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
  }

  function renderFsTrachCatBody() {
    const el = document.getElementById('lucnham-fs-trachcat-body');
    if (!el || !currentChart || !global.LucNhamFengShui) return;

    const tc = global.LucNhamFengShui.evaluateTrachCat(currentChart, trachCatSelectedChi, {
      actionType: currentDwellingType === 'AM_TRACH' ? 'an_tang' : 'dong_tho'
    });

    const CHI_LIST = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
    const chiNam = (currentChart && currentChart.chiNam) || (currentChart && currentChart.currentYear ? ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'][(currentChart.currentYear - 4) % 12] : 'Ngọ');

    let scoreBadgeClass = 'fs-badge-normal';
    let scoreTitle = 'BÌNH HÒA';
    if (tc.safetyScore <= 20) { scoreBadgeClass = 'fs-badge-critical'; scoreTitle = 'ĐẠI KỴ THI CÔNG'; }
    else if (tc.safetyScore <= 50) { scoreBadgeClass = 'fs-badge-warn'; scoreTitle = 'CẢNH BÁO RỦI RO'; }
    else if (tc.safetyScore <= 75) { scoreBadgeClass = 'fs-badge-normal'; scoreTitle = 'BÌNH HÒA CÂN BẰNG'; }
    else { scoreBadgeClass = 'fs-badge-great'; scoreTitle = 'CÁT LÀNH AN TOÀN'; }

    el.innerHTML = `
      <div style="font-size: 11px; margin-bottom: 8px; color: var(--text-secondary, #cbd5e1);">
        Chọn cung vị / phương vị cần thi công, động thổ hoặc an táng (Năm <strong>${chiNam}</strong>):
      </div>

      <!-- 12 Cung Chips Grid -->
      <div class="lucnham-trachcat-chip-grid">
        ${CHI_LIST.map(chi => `
          <div class="lucnham-trachcat-chip ${chi === trachCatSelectedChi ? 'active' : ''}" data-chi="${chi}">
            ${chi}
          </div>
        `).join('')}
      </div>

      <!-- Result Card -->
      <div style="background: rgba(26, 4, 8, 0.7); border: 1px solid rgba(245, 176, 65, 0.3); border-radius: 8px; padding: 10px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px dashed rgba(245, 176, 65, 0.2); padding-bottom: 6px;">
          <div style="font-weight: 800; font-size: 12.5px; color: var(--gold-primary, #f5b041);">
            Phương Vị: ${tc.huong} (Cung ${tc.targetChi})
          </div>
          <span class="fs-badge ${scoreBadgeClass}">${scoreTitle} (${tc.safetyScore}/100)</span>
        </div>

        <!-- Warnings -->
        ${tc.warnings && tc.warnings.length ? `
          <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px;">
            ${tc.warnings.map(w => `
              <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); border-left: 3px solid #ef4444; border-radius: 4px; padding: 5px 8px; font-size: 11px; line-height: 1.4; color: #fca5a5;">
                ⚠️ <strong>Cấm kỵ:</strong> ${w}
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Blessings -->
        ${tc.blessings && tc.blessings.length ? `
          <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px;">
            ${tc.blessings.map(b => `
              <div style="background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.3); border-left: 3px solid #22c55e; border-radius: 4px; padding: 5px 8px; font-size: 11px; line-height: 1.4; color: #86efac;">
                ✨ <strong>Cát Thần:</strong> ${b}
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Recommendation -->
        <div style="background: rgba(0, 0, 0, 0.3); border-radius: 6px; padding: 6px 8px; font-size: 11px; line-height: 1.45; border: 1px solid rgba(245, 176, 65, 0.2);">
          <div style="color: #67e8f9; font-weight: 700; margin-bottom: 2px;">🧭 Khuyến Nghị Khởi Sự & Tiết Hóa:</div>
          <div style="color: var(--text-primary, #f1f5f9);">${tc.recommendedTiming}</div>
        </div>
      </div>
    `;

    const chips = el.querySelectorAll('.lucnham-trachcat-chip');
    chips.forEach(chip => {
      chip.onclick = (e) => {
        e.preventDefault();
        const chi = chip.getAttribute('data-chi');
        if (chi) {
          trachCatSelectedChi = chi;
          renderFsTrachCatBody();
        }
      };
    });
  }

  async function triggerFsAiPolish() {
    if (isFsAiPolishing) return;
    if (!currentChart || !global.LucNhamFengShui) return;
    const fsRep = global.LucNhamFengShui.evaluate(currentChart, {
      dwellingType: currentDwellingType,
      siteName: currentDwellingType === 'AM_TRACH' ? 'Mộ Phần Tiên Tổ' : 'Gia Trạch Cư Trú'
    });
    if (!fsRep) return;

    isFsAiPolishing = true;
    fsAiErrorMessage = null;
    fsReportMode = 'ai';
    if (isEssayModalOpen) {
      renderFsEssayBody();
      updateFsEssayPills();
    } else {
      renderLucNham(null, true);
    }

    try {
      const prompt = global.LucNhamFengShui.buildAIPromptForFengShui(fsRep);
      const gemini = global.NetaGeminiService || global.GeminiService;
      if (gemini) {
        const apiKey = (gemini.getActiveKey && gemini.getActiveKey()) || '';
        if (!apiKey) {
          throw new Error("Chưa cài đặt Gemini API Key. Bạn có thể cài đặt trong mục Cài Đặt.");
        }
        let result = null;
        if (typeof gemini.callGeminiCascade === 'function') {
          result = await gemini.callGeminiCascade(prompt, apiKey, {
            systemInstruction: "Bạn là Viện Trưởng Viện Nghiên Cứu Địa Lý Phong Thủy & Đại Lục Nhâm Thần Khóa. Luận giải phong thủy học thuật, bảo toàn 100% kết quả thuật toán, trung thực, khách quan, không dùng từ sáo rỗng cảm tính theo Rule 9 và Rule 12.",
            temperature: 0.25
          });
        } else if (typeof gemini.generateContent === 'function') {
          result = await gemini.generateContent(prompt);
        }
        if (result && result.text) {
          fsAiPolishedText = result.text;
          fsAiErrorMessage = null;
          showToast("Gemini AI biên tập bài luận phong thủy thành công!");
        } else {
          throw new Error((result && result.error) || "Không nhận được văn bản từ Gemini AI.");
        }
      } else {
        // Fallback offline
        fsAiPolishedText = fsRep.markdownEssay;
        showToast("Đã kích hoạt chế độ bài luận chuyên sâu (Offline).");
      }
    } catch (err) {
      console.error("Lỗi AI Polish Phong Thủy:", err);
      fsAiErrorMessage = "Không thể kết nối AI: " + (err.message || "Vui lòng kiểm tra API Key.");
    } finally {
      isFsAiPolishing = false;
      if (isEssayModalOpen) {
        renderFsEssayBody();
        updateFsEssayPills();
      } else {
        renderLucNham(null, true);
      }
    }
  }

  // =========================================================================
  // PHÂN HỆ CHẨN ĐOÁN PHONG THỦY KHÔNG GIAN 8 HƯỚNG (DƯƠNG TRẠCH & ÂM TRẠCH)
  // =========================================================================
  function renderLucNhamFengShuiHTML(chart) {
    if (!global.LucNhamFengShui) {
      return `
        <div class="lucnham-fengshui-wrap">
          <div class="fs-card" style="text-align: center; padding: 24px 12px;">
            <p style="color: #f87171; font-weight: 700;">Hệ thống Phong Thủy Engine chưa sẵn sàng. Vui lòng tải lại trang.</p>
          </div>
        </div>
      `;
    }

    const fsReport = global.LucNhamFengShui.evaluate(chart, {
      dwellingType: currentDwellingType,
      siteName: currentDwellingType === 'AM_TRACH' ? 'Mộ Phần Tiên Tổ' : 'Gia Trạch Cư Trú'
    });

    const isDuong = (currentDwellingType === 'DUONG_TRACH');

    const score = fsReport.nhanTrachScore || 65;
    let ratingBadgeClass = 'fs-badge-normal';
    let ratingText = 'BÌNH HÒA';
    if (score >= 85) { ratingBadgeClass = 'fs-badge-great'; ratingText = 'CÁT LÀNH (ĐẮC VẬN)'; }
    else if (score >= 70) { ratingBadgeClass = 'fs-badge-good'; ratingText = 'KHÁ TỐT (BÌNH ỔN)'; }
    else if (score >= 50) { ratingBadgeClass = 'fs-badge-warn'; ratingText = 'TRUNG BÌNH (CẦN ĐIỀU TIẾT)'; }
    else { ratingBadgeClass = 'fs-badge-critical'; ratingText = 'HUNG HIỂM (CẦN HÓA GIẢI)'; }

    // Helper for status badge of spatial directions
    const getDirBadge = (diag) => {
      if (diag.statusLevel.includes('CỰC HUNG')) return `<span class="fs-badge fs-badge-critical">${diag.statusLevel}</span>`;
      if (diag.statusLevel.includes('HUNG')) return `<span class="fs-badge fs-badge-warn">${diag.statusLevel}</span>`;
      if (diag.statusLevel.includes('ĐẮC CÁT') || diag.statusLevel.includes('CÁT')) return `<span class="fs-badge fs-badge-great">${diag.statusLevel}</span>`;
      if (diag.statusLevel.includes('TIẾT') || diag.statusLevel.includes('KHẮC')) return `<span class="fs-badge fs-badge-severe">${diag.statusLevel}</span>`;
      return `<span class="fs-badge fs-badge-normal">${diag.statusLevel}</span>`;
    };

    return `
      <div class="lucnham-fengshui-wrap">
        <!-- Sub-nav: Dương Trạch vs Âm Trạch -->
        <div class="fs-subnav-bar">
          <div class="fs-subnav-pill">
            <button type="button" class="fs-subnav-btn ${isDuong ? 'active' : ''}" id="btn-fs-mode-duong" title="Chẩn đoán nhà ở, văn phòng, căn hộ">
              🏠 Dương Trạch
            </button>
            <button type="button" class="fs-subnav-btn ${!isDuong ? 'active' : ''}" id="btn-fs-mode-am" title="Chiêm mộ pháp, âm phần, lăng mộ gia tộc">
              🪦 Âm Trạch (Chiêm Mộ)
            </button>
          </div>
        </div>

        <!-- Action Bar: Bài Luận 8 Tầng, Trạch Cát, Tải .md, AI, Sao Chép -->
        <div class="fs-actions-bar">
          <button type="button" class="neta-mode-pill" id="lucnham-btn-open-essay" style="white-space: nowrap; height: 28px; padding: 0 8px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px;" title="Xem bài luận chuyên sâu 8 tầng">
            📜 Bài Luận 8 Tầng
          </button>
          <button type="button" class="neta-mode-pill" id="lucnham-btn-open-trachcat" style="white-space: nowrap; height: 28px; padding: 0 8px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px;" title="Tra cứu Trạch Cát thi công & cấm kỵ Tam Sát">
            ⏳ Trạch Cát
          </button>
          <button type="button" class="neta-mode-pill" id="lucnham-btn-download-fs" style="white-space: nowrap; height: 28px; padding: 0 8px; font-size: 11px; display: inline-flex; align-items: center; gap: 4px;" title="Tải tệp báo cáo phong thủy .md">
            💾 Tải .md
          </button>
          <button type="button" class="neta-mode-pill" id="lucnham-btn-ai-polish-fs" style="white-space: nowrap; height: 28px; padding: 0 8px; font-size: 11px; display: inline-flex; align-items: center; gap: 4px;" title="Biên tập học thuật qua Gemini AI">
            ${isFsAiPolishing ? '⏳ Đang Xử Lý...' : '✨ Biên Tập AI'}
          </button>
          <button type="button" class="neta-mode-pill" id="lucnham-btn-copy-fengshui" style="white-space: nowrap; height: 28px; padding: 0 8px; font-size: 11px; display: inline-flex; align-items: center; gap: 4px;" title="Sao chép báo cáo phong thủy">
            📋 Sao chép
          </button>
        </div>

        <!-- Card 1: Tổng Quan Điểm Số & Tương Quan Nhân - Trạch -->
        <div class="fs-card">
          <div class="fs-card-header">
            <div class="fs-card-title">
              <span>⚖️ TỔNG QUAN TƯƠNG QUAN NHÂN - TRẠCH</span>
            </div>
            <span class="fs-badge ${ratingBadgeClass}">${ratingText} (${score}/100)</span>
          </div>

          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <div style="width: 50px; height: 50px; min-width: 50px; border-radius: 50%; border: 2.5px solid var(--gold-primary, #f5b041); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 900; color: var(--gold-primary, #f5b041); background: rgba(245, 176, 65, 0.1);">
              ${score}
            </div>
            <div style="flex: 1; font-size: 11.5px; line-height: 1.4;">
              <div><strong>Tương quan Tứ Khóa:</strong> <span style="color: var(--gold-primary, #f5b041); font-weight: 800;">${fsReport.nhanTrachType}</span></div>
              <div style="color: var(--text-secondary, #94a3b8); font-size: 11px;">(Ngày ${fsReport.canChiNgay} · Nguyệt tướng: ${fsReport.nguyetTuong})</div>
              <div style="margin-top: 2px;">${fsReport.nhanTrachSummary}</div>
            </div>
          </div>

          <div style="font-size: 11px; line-height: 1.45; border-top: 1px dashed rgba(245, 176, 65, 0.2); padding-top: 6px; display: flex; flex-direction: column; gap: 4px;">
            <div>
              <strong>🌐 Cục Diện Khí Trường:</strong> ${fsReport.cucDienTrach}
            </div>
            <div>
              <strong>🗝️ Trạch Mộ Đóng Khí:</strong> Cung ${fsReport.trachMo.cung} (${fsReport.trachMo.huong}) · Lâm Thần <strong>${fsReport.trachMo.thienTuong}</strong> · <span style="color: ${fsReport.trachMo.nature.includes('TÀI') ? '#22c55e' : (fsReport.trachMo.nature.includes('SÁT') ? '#ef4444' : '#38bdf8')}; font-weight: 700;">${fsReport.trachMo.nature}</span>
              <div style="color: var(--text-secondary, #cbd5e1); font-size: 10.5px; margin-top: 1px;">${fsReport.trachMo.yNghia}</div>
            </div>
            <div>
              <strong>🌌 Tuần Không Chiếm Hướng:</strong> 
              ${fsReport.tuanKhong.length ? fsReport.tuanKhong.map(tk => `<span class="fs-badge fs-badge-void" style="margin-right: 4px;">${tk}</span>`).join('') + '<span style="color: var(--text-secondary, #94a3b8); font-size: 10.5px;">(Khí trường hư hao, cần gia cố điểm tựa ánh sáng / linh vật trấn định)</span>' : 'Không có cung Tuần Không.'}
            </div>
          </div>
        </div>

        <!-- Card 2: Bảng Ma Trận Chẩn Đoán 8 Hướng La Kinh (0° - 360°) -->
        <div class="fs-card">
          <div class="fs-card-header">
            <div class="fs-card-title">
              <span>🧭 MA TRẬN 8 HƯỚNG LA KINH & SÁT KHÍ</span>
            </div>
            <span style="font-size: 10px; color: var(--text-secondary, #94a3b8);">Quét 12 Cung</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${fsReport.spatialDirections.map(d => `
              <div class="fs-spatial-item" style="border-left: 3px solid ${d.statusLevel.includes('CỰC HUNG') ? '#ef4444' : (d.statusLevel.includes('HUNG') ? '#f59e0b' : (d.statusLevel.includes('CÁT') ? '#22c55e' : 'rgba(245, 176, 65, 0.4)'))};">
                <div class="fs-spatial-head">
                  <div class="fs-spatial-dir">
                    ${d.huong} (${d.batQuai} - ${d.hanhDiaBan}) [${d.goc}]
                  </div>
                  <div>
                    ${d.isTuanKhong ? '<span class="fs-badge fs-badge-void" style="margin-right: 3px;">TUẦN KHÔNG</span>' : ''}
                    ${getDirBadge(d)}
                  </div>
                </div>

                <div style="font-size: 11px; margin-bottom: 3px; display: flex; flex-wrap: wrap; gap: 6px; color: var(--text-secondary, #94a3b8);">
                  <span>Địa bàn: <strong style="color: var(--text-primary, #ffffff);">${d.diaBan}</strong></span>
                  <span>Thiên bàn: <strong style="color: #38bdf8;">${d.thienBan} (${d.hanhThienBan})</strong></span>
                  <span>Thần tướng: <strong style="color: var(--gold-primary, #f5b041);">${d.thienTuong}</strong></span>
                </div>

                ${d.shaTitle ? `
                  <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 4px; padding: 4px 6px; margin: 4px 0; font-size: 11px; color: #fca5a5;">
                    ⚠️ <strong>Cảnh Báo:</strong> ${d.shaTitle}
                  </div>
                ` : ''}

                ${(d.loanDauDauHieu && d.loanDauDauHieu.length) ? `
                  <div style="font-size: 10.5px; color: var(--text-secondary, #cbd5e1); margin: 3px 0;">
                    <strong>Dấu hiệu thực địa Loan Đầu:</strong>
                    ${d.loanDauDauHieu.map(ld => `<div class="fs-action-step">${ld}</div>`).join('')}
                  </div>
                ` : ''}

                <div style="font-size: 10.5px; margin-top: 4px; background: rgba(0, 0, 0, 0.25); padding: 4px 6px; border-radius: 4px;">
                  <div style="color: #67e8f9; font-weight: 700;">💡 Chiến Lược Tiết Hóa:</div>
                  <div style="color: var(--text-primary, #f1f5f9);">${d.remediationStrategy}</div>
                  ${(d.practicalActions && d.practicalActions.length) ? `
                    <div style="margin-top: 2px;">
                      ${d.practicalActions.map(act => `<div class="fs-action-step">${act}</div>`).join('')}
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Card 3: Trọng Điểm Chức Năng (Dương Trạch) / Chiêm Mộ Đáy Kim Tĩnh (Âm Trạch) -->
        <div class="fs-card">
          <div class="fs-card-header">
            <div class="fs-card-title">
              <span>${isDuong ? '🚪 CÁC NÚT ĐIỂM CHỨC NĂNG DƯƠNG TRẠCH' : '🪦 CHUYÊN KHẢO ĐÁY KIM TĨNH & MINH ĐƯỜNG (ÂM TRẠCH)'}</span>
            </div>
          </div>

          ${isDuong ? `
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${fsReport.functionalNodes.map(fn => `
                <div style="background: rgba(20, 2, 5, 0.6); border: 1px solid rgba(245, 176, 65, 0.18); border-radius: 6px; padding: 6px 8px; font-size: 11px; line-height: 1.4;">
                  <div style="font-weight: 800; color: var(--gold-primary, #f5b041); margin-bottom: 2px;">
                    📍 ${fn.name} ${fn.cung ? `(Cung ${fn.cung} - ${fn.huong})` : ''}
                  </div>
                  <div style="color: var(--text-primary, #f1f5f9);">${fn.assessment}</div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <!-- Long mạch minh đường -->
              <div style="background: rgba(20, 2, 5, 0.6); border: 1px solid rgba(245, 176, 65, 0.18); border-radius: 6px; padding: 6px 8px; font-size: 11px; line-height: 1.4;">
                <div style="font-weight: 800; color: #38bdf8; margin-bottom: 2px;">
                  ⛰️ Thế Đất, Gò Đồi & Minh Đường Bên Ngoài:
                </div>
                <div style="color: var(--text-primary, #f1f5f9);">${fsReport.graveDiagnostics.longMachMinhDuong}</div>
              </div>

              <!-- Hài cốt & Kim tĩnh cảnh báo -->
              ${fsReport.graveDiagnostics.graveWarnings.map(gw => `
                <div style="background: rgba(20, 2, 5, 0.6); border: 1px solid ${gw.type.includes('AN LÀNH') ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}; border-left: 3px solid ${gw.type.includes('AN LÀNH') ? '#22c55e' : '#ef4444'}; border-radius: 6px; padding: 6px 8px; font-size: 11px; line-height: 1.4;">
                  <div style="font-weight: 800; color: ${gw.type.includes('AN LÀNH') ? '#4ade80' : '#f87171'}; margin-bottom: 2px;">
                    ⚡ ${gw.type}
                  </div>
                  <div style="color: var(--text-primary, #f1f5f9);">${gw.detail}</div>
                  ${(gw.actions && gw.actions.length) ? `
                    <div style="margin-top: 4px; padding-top: 3px; border-top: 1px dashed rgba(245, 176, 65, 0.15);">
                      <strong style="color: #67e8f9; font-size: 10.5px;">Phương án xử lý:</strong>
                      ${gw.actions.map(act => `<div class="fs-action-step">${act}</div>`).join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}

              <!-- Hậu nhân -->
              ${fsReport.functionalNodes.map(fn => `
                <div style="background: rgba(20, 2, 5, 0.6); border: 1px solid rgba(245, 176, 65, 0.18); border-radius: 6px; padding: 6px 8px; font-size: 11px; line-height: 1.4;">
                  <div style="font-weight: 800; color: var(--gold-primary, #f5b041); margin-bottom: 2px;">
                    👥 ${fn.name}
                  </div>
                  <div style="color: var(--text-primary, #f1f5f9);">${fn.assessment}</div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Card 4: Tiến Trình Tam Truyền Khởi - Trung - Mạt Đối Với Trạch Vận -->
        <div class="fs-card">
          <div class="fs-card-header">
            <div class="fs-card-title">
              <span>⏳ TIẾN TRÌNH TAM TRUYỀN ĐỐI VỚI TRẠCH VẬN</span>
            </div>
          </div>
          <div style="font-size: 11px; line-height: 1.45;">
            <div style="display: flex; justify-content: space-around; background: rgba(0, 0, 0, 0.3); border-radius: 6px; padding: 6px; margin-bottom: 6px; border: 1px solid rgba(245, 176, 65, 0.2);">
              <div style="text-align: center;">
                <div style="color: #94a3b8; font-size: 10px;">SƠ TRUYỀN (Ban Đầu)</div>
                <div style="font-weight: 900; color: #f5b041; font-size: 13px;">${fsReport.tamTruyen?.soTruyen?.chi || '---'}</div>
                <div style="font-size: 10px; color: #38bdf8;">${fsReport.tamTruyen?.soTruyen?.tuong || ''}</div>
              </div>
              <div style="color: var(--gold-primary, #f5b041); font-size: 16px; align-self: center;">➔</div>
              <div style="text-align: center;">
                <div style="color: #94a3b8; font-size: 10px;">TRUNG TRUYỀN (Quá Trình)</div>
                <div style="font-weight: 900; color: #f5b041; font-size: 13px;">${fsReport.tamTruyen?.trungTruyen?.chi || '---'}</div>
                <div style="font-size: 10px; color: #38bdf8;">${fsReport.tamTruyen?.trungTruyen?.tuong || ''}</div>
              </div>
              <div style="color: var(--gold-primary, #f5b041); font-size: 16px; align-self: center;">➔</div>
              <div style="text-align: center;">
                <div style="color: #94a3b8; font-size: 10px;">MẠT TRUYỀN (Hậu Vận)</div>
                <div style="font-weight: 900; color: #f5b041; font-size: 13px;">${fsReport.tamTruyen?.matTruyen?.chi || '---'}</div>
                <div style="font-size: 10px; color: #38bdf8;">${fsReport.tamTruyen?.matTruyen?.tuong || ''}</div>
              </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px; font-size: 10.5px; color: var(--text-primary, #f1f5f9);">
              <div>• <strong>Sơ Truyền:</strong> ${fsReport.tamTruyen?.soTruyen?.yNghia || ''}</div>
              <div>• <strong>Trung Truyền:</strong> ${fsReport.tamTruyen?.trungTruyen?.yNghia || ''}</div>
              <div>• <strong>Mạt Truyền:</strong> ${fsReport.tamTruyen?.matTruyen?.yNghia || ''}</div>
            </div>
          </div>
        </div>

        <!-- Card 5: Thứ Tự Ưu Tiên Hóa Giải & Tiết Hóa Thực Thi -->
        <div class="fs-card">
          <div class="fs-card-header">
            <div class="fs-card-title">
              <span>🛠️ KẾ HOẠCH HÓA GIẢI THEO MỨC ĐỘ KHẨN CẤP</span>
            </div>
            <span style="font-size: 10px; color: var(--text-secondary, #94a3b8);">${fsReport.remediationPriorities.length} Điểm Lưu Ý</span>
          </div>

          ${fsReport.remediationPriorities.length === 0 ? `
            <div style="text-align: center; padding: 12px; color: #4ade80; font-size: 11.5px; font-weight: 700;">
              ✅ Không phát hiện phương vị có xung sát nặng. Trạch khí cơ bản bình hòa, tiếp tục duy trì thông thoáng.
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${fsReport.remediationPriorities.map((item, idx) => `
                <div style="background: rgba(20, 2, 5, 0.6); border: 1px solid rgba(245, 176, 65, 0.2); border-left: 3px solid ${item.urgency === 1 ? '#ef4444' : (item.urgency === 2 ? '#f59e0b' : '#38bdf8')}; border-radius: 6px; padding: 6px 8px; font-size: 11px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                    <div style="font-weight: 800; color: var(--text-primary, #ffffff);">
                      #${idx + 1}. ${item.huong} (Cung ${item.diaBan})
                    </div>
                    <span class="fs-badge ${item.urgency === 1 ? 'fs-badge-critical' : (item.urgency === 2 ? 'fs-badge-warn' : 'fs-badge-good')}">
                      ${item.urgency === 1 ? 'CẤP 1 (KHẨN CẤP)' : (item.urgency === 2 ? 'CẤP 2 (ĐIỀU TIẾT)' : 'CẤP 3 (BẢO DƯỠNG)')}
                    </span>
                  </div>
                  ${item.shaTitle ? `<div style="color: #fca5a5; font-size: 10.5px; margin-bottom: 2px;"><strong>Cảnh báo:</strong> ${item.shaTitle}</div>` : ''}
                  <div style="color: #67e8f9; font-weight: 600; font-size: 10.5px;">Biện pháp tiết hóa: ${item.strategy}</div>
                  ${(item.actions && item.actions.length) ? `
                    <div style="margin-top: 3px;">
                      ${item.actions.map(act => `<div class="fs-action-step">${act}</div>`).join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  }

  function renderLucNhamAnalysisHTML(chart) {
    const interp = (global.NetaLucNhamInterpreter || global.LucNhamMobileEngine)
      ? (global.NetaLucNhamInterpreter || global.LucNhamMobileEngine).interpretChart(chart)
      : null;

    if (!interp) {
      return `
        <div class="lucnham-analysis-wrap" style="padding: 24px; text-align: center; color: var(--text-muted);">
          <p>Đang chuẩn bị dữ liệu luận giải Lục Nhâm 7 Tầng...</p>
        </div>
      `;
    }

    // Dashboard metrics
    const riskColor = interp.riskScore <= 2 ? '#22c55e' : (interp.riskScore === 3 ? '#f59e0b' : '#ef4444');
    const riskLabel = interp.riskScore <= 2 ? 'Cát Lành / An Toàn' : (interp.riskScore === 3 ? 'Cân Bằng / Bình Hòa' : 'Cẩn Trọng Rủi Ro');
    const theDungBrief = interp.theDung.canChiRel.split('(')[0].trim();
    const strategyBrief = interp.riskScore >= 4 ? 'PHÒNG THỦ' : (interp.theDung.canChiRel.includes('sinh') ? 'TIẾN CÔNG' : 'TÙY CƠ');

    // Filter logic
    const f = currentLuanFilter;
    const isVisibleSec = (secKey) => {
      if (f === 'all') return true;
      if (f === 'tatphap') return secKey === 'sec_tatphap';
      if (f === 'timeline') return secKey === 'sec_timeline';
      if (f === 'chuyende') return secKey === 'sec_chuyende';
      if (f === 'suvu') return secKey === 'sec_suvu';
      return true;
    };
    const getSecStyle = (secKey) => isVisibleSec(secKey) ? '' : 'display: none;';

    // Accordion helper
    const isCol = key => (collapsedSections[key] ? 'collapsed' : '');

    return `
      <div class="lucnham-analysis-wrap">
        <!-- Header / Meta Bar (Bát Tự Uniform) -->
        <div class="lucnham-report-meta-bar">
          <div style="font-weight: 800; font-size: 0.92rem; color: var(--gold-glow, #f5b041); display: flex; align-items: center; gap: 6px;">
            <span>📜</span> LUẬN GIẢI CHUYÊN SÂU LỤC NHÂM · ${interp.canNgay} ${interp.chiNgay}
          </div>
          <div class="neta-report-mode-toggle">
            <button type="button" class="neta-mode-pill ${currentReportMode === 'standard' ? 'active' : ''}" id="btn-lucnham-mode-standard" title="Bản tính toán toán học 100% offline">
              📜 Bản Gốc
            </button>
            <button type="button" class="neta-mode-pill ${currentReportMode === 'ai' ? 'active' : ''}" id="btn-lucnham-mode-ai" title="Bản trau chuốt học thuật bởi Gemini AI">
              ${isAiPolishing ? '⏳ Đang Trau Chuốt...' : '✨ Bản AI'}
            </button>
            <button type="button" class="neta-mode-pill" id="lucnham-btn-copy-luan" title="Sao chép toàn văn">
              📋 Sao chép
            </button>
          </div>
        </div>

        ${currentReportMode === 'ai' ? `
          <!-- Chế độ Trau Chuốt AI -->
          ${isAiPolishing ? `
            <div class="neta-inline-ai-loading">
              <div style="font-size: 1.5rem; margin-bottom: 8px;">✨</div>
              <div style="font-weight: 700; color: var(--gold-primary, #f5b041); font-size: 13px;">
                Đang tiến hành kết nối Gemini AI trau chuốt cấu trúc câu và từ ngữ học thuật Lục Nhâm...
              </div>
              <div style="font-size: 11px; opacity: 0.75; margin-top: 4px;">
                Bảo toàn 100% kết quả tính toán 7 Tầng Huyền Cơ và 100 Cục Tất Pháp.
              </div>
            </div>
          ` : ''}

          ${aiErrorMessage ? `
            <div style="background: rgba(239, 68, 68, 0.12); border: 1.5px solid #ef4444; border-radius: 8px; padding: 12px; margin: 12px 0; color: #dc2626; font-size: 12px; line-height: 1.5;">
              <div><strong>⚠️ Lỗi kết nối AI:</strong> ${aiErrorMessage}</div>
              <div style="margin-top: 8px; display: flex; gap: 8px;">
                <button type="button" class="neta-mode-pill active" id="btn-lucnham-retry-ai">🔄 Thử Lại</button>
                <button type="button" class="neta-mode-pill" id="btn-lucnham-back-standard-from-err">↩️ Về Bản Gốc</button>
              </div>
            </div>
          ` : ''}

          ${aiPolishedText ? `
            <div class="neta-polished-status-bar">
              <span>✨ Bản Luận Giải Đã Được Trau Chuốt Học Thuật Bởi Gemini AI</span>
              <button type="button" class="neta-btn-inline-back" id="btn-lucnham-back-standard">↩️ Xem Bản Gốc</button>
            </div>
            <div class="lucnham-full-report-content neta-drop-cap" style="font-size: 0.88rem; line-height: 1.75; color: var(--text-color, #f8fafc); background: rgba(20, 2, 5, 0.7); border: 1px solid rgba(245, 176, 65, 0.25); border-radius: 8px; padding: 14px; white-space: pre-wrap;">
              ${aiPolishedText}
            </div>
          ` : (!isAiPolishing && !aiErrorMessage ? `
            <div style="text-align: center; padding: 36px 16px; color: var(--text-muted); background: rgba(20, 2, 5, 0.5); border-radius: 8px; border: 1px dashed rgba(245, 176, 65, 0.25); margin: 12px 0;">
              <p style="margin-bottom: 12px; font-size: 13px;">Chưa kích hoạt trau chuốt văn phong AI cho quẻ Lục Nhâm này.</p>
              <button type="button" class="neta-mode-pill active" id="btn-lucnham-inline-trigger-ai" style="padding: 8px 16px; font-size: 13px; font-weight: 800;">
                ✨ Bắt Đầu Trau Chuốt Văn Phong (AI)
              </button>
            </div>
          ` : '')}
        ` : `
          <!-- Chế độ Tiêu Chuẩn / Gốc (Offline 100%) -->
          <!-- 1. Dashboard 3 chỉ số -->
          <div class="lucnham-dashboard-grid">
            <div class="lucnham-metric-card">
              <div class="lucnham-metric-num" style="color: ${riskColor};">${interp.riskScore}/5 ★</div>
              <div class="lucnham-metric-lbl">${riskLabel}</div>
            </div>
            <div class="lucnham-metric-card">
              <div class="lucnham-metric-num" style="color: #38bdf8; font-size: 12px; margin-top: 2px;">${theDungBrief}</div>
              <div class="lucnham-metric-lbl">Trục Thể - Dụng</div>
            </div>
            <div class="lucnham-metric-card">
              <div class="lucnham-metric-num" style="color: #f5b041; font-size: 13px;">${strategyBrief}</div>
              <div class="lucnham-metric-lbl">Sách Lược Hành Sự</div>
            </div>
          </div>

          <!-- 2. Subbar Phương Vị & Ứng Kỳ -->
          <div class="lucnham-subbar">
            <div>🧭 <strong>Phương vị Cát Tường:</strong> <span style="color: #34d399;">${interp.sachLuoc.phuongViTot}</span></div>
            <div>⏱️ <strong>Ứng kỳ:</strong> <span style="color: #f5b041;">${interp.sachLuoc.ungKy}</span></div>
          </div>

          <!-- 3. Filter Pills -->
          <div class="lucnham-pill-tabs">
            <button class="lucnham-pill-btn ${f === 'all' ? 'active' : ''}" data-filter="all">Tất cả (7 Tầng)</button>
            <button class="lucnham-pill-btn ${f === 'tatphap' ? 'active' : ''}" data-filter="tatphap">Tất Pháp Phú (${interp.biFaFuDetected.length})</button>
            <button class="lucnham-pill-btn ${f === 'timeline' ? 'active' : ''}" data-filter="timeline">Timeline 3 Giai Đoạn</button>
            <button class="lucnham-pill-btn ${f === 'chuyende' ? 'active' : ''}" data-filter="chuyende">7 Chuyên Đề</button>
            <button class="lucnham-pill-btn ${f === 'suvu' ? 'active' : ''}" data-filter="suvu">8 Sự Vụ Đời Sống</button>
          </div>

          <!-- ACCORDIONS -->

            <!-- [I. TRỤC THỂ - DỤNG & NĂNG LƯỢNG TỨ THỜI] -->
            <div class="lucnham-accordion-card ${isCol('sec_thedung')}" data-sec="sec_thedung" id="lucnham-sec-sec_thedung" style="${getSecStyle('sec_thedung')}">
              <div class="lucnham-accordion-hdr">
                <span>[I. TRỤC THỂ - DỤNG & NĂNG LƯỢNG TỨ THỜI]</span>
                <span class="hdr-arrow">▲</span>
              </div>
              <div class="lucnham-accordion-body">
                <div style="margin-bottom: 6px;">
                  <strong style="color: #38bdf8;">• Quan hệ Thể - Dụng:</strong> ${interp.theDung.canChiRel}
                </div>
                <div style="background: rgba(245, 176, 65, 0.1); border-left: 3px solid #f5b041; padding: 4px 6px; border-radius: 0 4px 4px 0; margin-bottom: 8px;">
                  ${interp.theDung.canChiAdvice}
                </div>
                <div>
                  <strong style="color: #f5b041;">• Năng lượng Tứ Thời:</strong> Mùa <strong>${interp.tuThoi.season}</strong> (Khí của Can Ngày: <span style="color: #34d399;">${interp.tuThoi.canKhi}</span>).
                </div>
                <div style="font-size: 12px; opacity: 0.85; margin-top: 4px;">
                  Trường sinh Can Ngày: Sơ truyền ở đất <strong>${interp.tamTruyenProcess.soTruyen.van}</strong>, Mạt truyền ở đất <strong>${interp.tamTruyenProcess.matTruyen.van}</strong>.
                </div>
              </div>
            </div>

            <!-- [II. TIẾN TRÌNH TAM TRUYỀN & ĐẮC HÃM QUÝ THẦN] -->
            <div class="lucnham-accordion-card ${isCol('sec_tamtruyen')}" data-sec="sec_tamtruyen" id="lucnham-sec-sec_tamtruyen" style="${getSecStyle('sec_tamtruyen')}">
              <div class="lucnham-accordion-hdr">
                <span>[II. TIẾN TRÌNH TAM TRUYỀN & QUÝ THẦN]</span>
                <span class="hdr-arrow">▲</span>
              </div>
              <div class="lucnham-accordion-body">
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <div style="background: rgba(26, 4, 8, 0.6); padding: 8px; border-radius: 6px; border: 1px solid rgba(244, 63, 94, 0.3);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                      <strong style="color: #f43f5e; font-size: 14px;">1. Sơ Truyền: ${interp.tamTruyenProcess.soTruyen.chi} · ${interp.tamTruyenProcess.soTruyen.tuong}</strong>
                      <span style="font-size: 12px; color: #94a3b8;">${interp.tamTruyenProcess.soTruyen.than}</span>
                    </div>
                    <div>${interp.tamTruyenProcess.soTruyen.phanTich}</div>
                  </div>

                  <div style="background: rgba(26, 4, 8, 0.6); padding: 8px; border-radius: 6px; border: 1px solid rgba(129, 140, 248, 0.3);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                      <strong style="color: #818cf8; font-size: 14px;">2. Trung Truyền: ${interp.tamTruyenProcess.trungTruyen.chi} · ${interp.tamTruyenProcess.trungTruyen.tuong}</strong>
                      <span style="font-size: 12px; color: #94a3b8;">${interp.tamTruyenProcess.trungTruyen.than}</span>
                    </div>
                    <div>${interp.tamTruyenProcess.trungTruyen.phanTich}</div>
                  </div>

                  <div style="background: rgba(26, 4, 8, 0.6); padding: 8px; border-radius: 6px; border: 1px solid rgba(52, 211, 153, 0.3);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                      <strong style="color: #34d399; font-size: 14px;">3. Mạt Truyền: ${interp.tamTruyenProcess.matTruyen.chi} · ${interp.tamTruyenProcess.matTruyen.tuong}</strong>
                      <span style="font-size: 12px; color: #94a3b8;">${interp.tamTruyenProcess.matTruyen.than}</span>
                    </div>
                    <div>${interp.tamTruyenProcess.matTruyen.phanTich}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- [III. CÁCH CỤC TẤT PHÁP PHÚ (THIỆU NGẠN HÒA)] -->
            <div class="lucnham-accordion-card ${isCol('sec_tatphap')}" data-sec="sec_tatphap" id="lucnham-sec-sec_tatphap" style="${getSecStyle('sec_tatphap')}">
              <div class="lucnham-accordion-hdr">
                <span>[III. CÁCH CỤC TẤT PHÁP PHÚ (THIỆU NGẠN HÒA)]</span>
                <span class="hdr-arrow">▲</span>
              </div>
              <div class="lucnham-accordion-body">
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${interp.biFaFuDetected.map((bf, idx) => `
                    <div style="background: rgba(26, 4, 8, 0.65); border: 1px solid rgba(245, 176, 65, 0.25); border-radius: 6px; padding: 8px 10px;">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
                        <strong style="color: #f5b041; font-size: 14px;">${idx + 1}. ${bf.ten}</strong>
                        <span style="font-family: serif; color: #cbd5e1; font-size: 13px;">${bf.han_tu || ''}</span>
                      </div>
                      <div style="color: #cbd5e1; margin-bottom: 4px;">• <em>Ý nghĩa:</em> ${bf.y_nghia}</div>
                      <div style="background: rgba(245, 176, 65, 0.1); border-left: 3px solid #f5b041; padding: 4px 8px; color: #fef08a;">
                        👉 <strong>Chỉ dẫn:</strong> ${bf.chi_dan}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- [IV. DÒNG THỜI GIAN 3 GIAI ĐOẠN (TIMELINE)] -->
            <div class="lucnham-accordion-card ${isCol('sec_timeline')}" data-sec="sec_timeline" id="lucnham-sec-sec_timeline" style="${getSecStyle('sec_timeline')}">
              <div class="lucnham-accordion-hdr">
                <span>[IV. DÒNG THỜI GIAN 3 GIAI ĐOẠN]</span>
                <span class="hdr-arrow">▲</span>
              </div>
              <div class="lucnham-accordion-body">
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <div style="border-left: 3px solid #f59e0b; padding-left: 10px;">
                    <strong style="color: #f59e0b; font-size: 14px;">${interp.timeline.giaiDoan1_KhoiDau.thoiGian}</strong>
                    <div style="font-size: 12px; color: #94a3b8;">${interp.timeline.giaiDoan1_KhoiDau.trangThai}</div>
                    <div>${interp.timeline.giaiDoan1_KhoiDau.trongTam}</div>
                  </div>
                  <div style="border-left: 3px solid #38bdf8; padding-left: 10px;">
                    <strong style="color: #38bdf8; font-size: 14px;">${interp.timeline.giaiDoan2_BienChuyen.thoiGian}</strong>
                    <div style="font-size: 12px; color: #94a3b8;">${interp.timeline.giaiDoan2_BienChuyen.trangThai}</div>
                    <div>${interp.timeline.giaiDoan2_BienChuyen.trongTam}</div>
                  </div>
                  <div style="border-left: 3px solid #34d399; padding-left: 10px;">
                    <strong style="color: #34d399; font-size: 14px;">${interp.timeline.giaiDoan3_KetCuc.thoiGian}</strong>
                    <div style="font-size: 12px; color: #94a3b8;">${interp.timeline.giaiDoan3_KetCuc.trangThai}</div>
                    <div>${interp.timeline.giaiDoan3_KetCuc.trongTam}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- [V. MA TRẬN 7 CHUYÊN ĐỀ ĐỜI SỐNG & KINH DOANH] -->
            <div class="lucnham-accordion-card ${isCol('sec_chuyende')}" data-sec="sec_chuyende" id="lucnham-sec-sec_chuyende" style="${getSecStyle('sec_chuyende')}">
              <div class="lucnham-accordion-hdr">
                <span>[V. MA TRẬN 7 CHUYÊN ĐỀ SỰ VỤ]</span>
                <span class="hdr-arrow">▲</span>
              </div>
              <div class="lucnham-accordion-body">
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${Object.values(interp.chuyenDe7).map(cd => `
                    <div style="background: rgba(26, 4, 8, 0.65); border: 1px solid rgba(245, 176, 65, 0.2); border-radius: 6px; padding: 8px 10px;">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <strong style="color: #f5b041; font-size: 14px;">${cd.tieu_de}</strong>
                        <span style="font-size: 11.5px; background: rgba(245, 176, 65, 0.15); color: #fef08a; padding: 2px 7px; border-radius: 4px; font-weight: 700;">${cd.danh_gia}</span>
                      </div>
                      <div style="color: #cbd5e1; margin-bottom: 3px;">• <em>Hiện trạng:</em> ${cd.hien_trang || cd.noi_dung}</div>
                      ${cd.dong_luc_bien_chuyen ? `<div style="color: #38bdf8; margin-bottom: 3px;">• <em>Xu thế:</em> ${cd.dong_luc_bien_chuyen}</div>` : ''}
                      ${cd.canh_bao_rui_ro ? `<div style="color: #f87171; margin-bottom: 3px;">⚠️ <em>Cảnh báo:</em> ${cd.canh_bao_rui_ro}</div>` : ''}
                      ${cd.sach_luoc_khuyen_nghi ? `<div style="color: #34d399;">👉 <em>Sách lược:</em> ${cd.sach_luoc_khuyen_nghi}</div>` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- [VI. CẨM NANG 8 SỰ VỤ THỰC TẾ HÀNG NGÀY] -->
            <div class="lucnham-accordion-card ${isCol('sec_suvu')}" data-sec="sec_suvu" id="lucnham-sec-sec_suvu" style="${getSecStyle('sec_suvu')}">
              <div class="lucnham-accordion-hdr">
                <span>[VI. CẨM NANG 8 SỰ VỤ ĐỜI SỐNG HÀNG NGÀY]</span>
                <span class="hdr-arrow">▲</span>
              </div>
              <div class="lucnham-accordion-body">
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${Object.values(interp.dailyLifeCases).map(dl => `
                    <div style="background: rgba(26, 4, 8, 0.65); border: 1px solid rgba(245, 176, 65, 0.2); border-radius: 6px; padding: 8px 10px;">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <strong style="color: #38bdf8; font-size: 14px;">${dl.tieu_de}</strong>
                        <span style="font-size: 11.5px; font-weight: 700; color: #f5b041;">${dl.danh_gia}</span>
                      </div>
                      ${dl.dung_than ? `<div style="font-size: 12px; color: #94a3b8; margin-bottom: 2px;">Dụng thần: ${dl.dung_than}</div>` : ''}
                      ${dl.khau_quyet ? `<div style="font-size: 12.5px; font-style: italic; color: #e2e8f0; margin-bottom: 3px;">"${dl.khau_quyet}"</div>` : ''}
                      <div style="color: #34d399;">👉 <strong>Lời khuyên:</strong> ${dl.loi_khuyen}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- [VII. SÁCH LƯỢC HÀNH ĐỘNG & ỨNG KỲ] -->
            <div class="lucnham-accordion-card ${isCol('sec_sachluoc')}" data-sec="sec_sachluoc" id="lucnham-sec-sec_sachluoc" style="${getSecStyle('sec_sachluoc')}">
              <div class="lucnham-accordion-hdr">
                <span>[VII. SÁCH LƯỢC HÀNH ĐỘNG & ỨNG KỲ]</span>
                <span class="hdr-arrow">▲</span>
              </div>
              <div class="lucnham-accordion-body">
                <div style="background: rgba(245, 176, 65, 0.12); border-left: 3px solid #f5b041; padding: 6px 8px; border-radius: 0 4px 4px 0; margin-bottom: 6px;">
                  <strong>Lời khuyên cốt lõi:</strong> ${interp.sachLuoc.loiKhuyen}
                </div>
                <div>🧭 <strong>Phương vị thuận lợi nhất:</strong> ${interp.sachLuoc.phuongViTot}</div>
                <div>⏱️ <strong>Ứng kỳ chi tiết:</strong> ${interp.sachLuoc.ungKy}</div>
              </div>
          </div>
        `}
      </div>
    `;
  }

  function bindLuanAnalysisEvents() {
    // Mode toggles (Bát Tự Uniform)
    const btnModeStandard = document.getElementById('btn-lucnham-mode-standard');
    const btnModeAi = document.getElementById('btn-lucnham-mode-ai');
    const btnBackStandard = document.getElementById('btn-lucnham-back-standard');
    const btnBackStandardFromErr = document.getElementById('btn-lucnham-back-standard-from-err');
    const btnTriggerAi = document.getElementById('btn-lucnham-inline-trigger-ai');
    const btnRetryAi = document.getElementById('btn-lucnham-retry-ai');
    const btnCopy = document.getElementById('lucnham-btn-copy-luan');

    if (btnModeStandard) {
      btnModeStandard.onclick = (e) => {
        e.preventDefault();
        currentReportMode = 'standard';
        renderLucNham(null, true);
      };
    }
    if (btnModeAi) {
      btnModeAi.onclick = (e) => {
        e.preventDefault();
        currentReportMode = 'ai';
        if (!aiPolishedText && !isAiPolishing) {
          triggerAiPolish();
        } else {
          renderLucNham(null, true);
        }
      };
    }
    if (btnBackStandard) {
      btnBackStandard.onclick = (e) => {
        e.preventDefault();
        currentReportMode = 'standard';
        renderLucNham(null, true);
      };
    }
    if (btnBackStandardFromErr) {
      btnBackStandardFromErr.onclick = (e) => {
        e.preventDefault();
        currentReportMode = 'standard';
        renderLucNham(null, true);
      };
    }
    if (btnTriggerAi) {
      btnTriggerAi.onclick = (e) => {
        e.preventDefault();
        currentReportMode = 'ai';
        triggerAiPolish();
      };
    }
    if (btnRetryAi) {
      btnRetryAi.onclick = (e) => {
        e.preventDefault();
        currentReportMode = 'ai';
        triggerAiPolish();
      };
    }
    if (btnCopy) {
      btnCopy.onclick = (e) => {
        e.preventDefault();
        copyLuanReport();
      };
    }

    // Filter pills - In-Place DOM Toggle & Smooth Scroll (Zero Jump)
    const pillBtns = document.querySelectorAll('.lucnham-pill-btn');
    pillBtns.forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const filter = btn.getAttribute('data-filter') || 'all';
        currentLuanFilter = filter;

        // Toggle active class on pills
        pillBtns.forEach(p => p.classList.toggle('active', (p.getAttribute('data-filter') || 'all') === filter));

        // In-place toggle cards display
        const cards = document.querySelectorAll('.lucnham-accordion-card[data-sec]');
        const targetSecMap = {
          'all': null,
          'tatphap': 'sec_tatphap',
          'timeline': 'sec_timeline',
          'chuyende': 'sec_chuyende',
          'suvu': 'sec_suvu'
        };
        const targetSec = targetSecMap[filter];

        cards.forEach(card => {
          const sec = card.getAttribute('data-sec');
          if (filter === 'all') {
            card.style.display = '';
          } else {
            card.style.display = (sec === targetSec) ? '' : 'none';
          }
        });

        // Smooth scroll directly to target section or pills
        const scrollTarget = targetSec
          ? (document.querySelector(`.lucnham-accordion-card[data-sec="${targetSec}"]`) || btn.closest('.lucnham-pill-tabs'))
          : btn.closest('.lucnham-pill-tabs');

        if (scrollTarget) {
          scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
    });

    // Accordions toggle - In-Place DOM Toggle (Zero Jump)
    const hdrBtns = document.querySelectorAll('.lucnham-accordion-hdr');
    hdrBtns.forEach(hdr => {
      hdr.onclick = (e) => {
        e.preventDefault();
        const card = hdr.closest('.lucnham-accordion-card');
        if (card) {
          const sec = card.getAttribute('data-sec');
          if (sec) {
            collapsedSections[sec] = !collapsedSections[sec];
            card.classList.toggle('collapsed', !!collapsedSections[sec]);
            const arrow = card.querySelector('.hdr-arrow');
            if (arrow) arrow.textContent = collapsedSections[sec] ? '▼' : '▲';
          }
        }
      };
    });
  }

  function setLuanFilter(filter) {
    currentLuanFilter = filter;
    renderLucNham(null, true);
  }

  function toggleSection(secKey) {
    if (!secKey) return;
    collapsedSections[secKey] = !collapsedSections[secKey];
    const card = document.querySelector(`.lucnham-accordion-card[data-sec="${secKey}"]`);
    if (card) {
      card.classList.toggle('collapsed', !!collapsedSections[secKey]);
      const arrow = card.querySelector('.hdr-arrow');
      if (arrow) arrow.textContent = collapsedSections[secKey] ? '▼' : '▲';
    }
  }

  function copyLuanReport() {
    if (!currentChart) return;
    const interp = (global.NetaLucNhamInterpreter || global.LucNhamMobileEngine)
      ? (global.NetaLucNhamInterpreter || global.LucNhamMobileEngine).interpretChart(currentChart)
      : null;
    if (!interp) return;

    let textToCopy = "";
    if (currentReportMode === 'ai' && aiPolishedText) {
      textToCopy = aiPolishedText;
    } else if (global.NetaLucNhamInterpreter && global.NetaLucNhamInterpreter.formatTextReport) {
      textToCopy = global.NetaLucNhamInterpreter.formatTextReport(interp);
    } else {
      textToCopy = `BÁO CÁO LUẬN GIẢI LỤC NHÂM\nNgày ${interp.canNgay} ${interp.chiNgay}\nĐiểm Rủi Ro: ${interp.riskScore}/5 Sao\nSách lược: ${interp.sachLuoc.loiKhuyen}`;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast("Đã sao chép toàn văn Luận giải Lục Nhâm vào bộ nhớ tạm!");
      }).catch(() => {
        fallbackCopyText(textToCopy);
      });
    } else {
      fallbackCopyText(textToCopy);
    }
  }

  function fallbackCopyText(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      showToast("Đã sao chép toàn văn Luận giải Lục Nhâm!");
    } catch (e) {
      alert("Không thể sao chép tự động. Vui lòng thử lại.");
    }
    document.body.removeChild(ta);
  }

  function showToast(msg) {
    const t = document.getElementById("toast");
    if (!t) {
      alert(msg);
      return;
    }
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => {
      t.classList.remove("show");
    }, 2800);
  }

  async function triggerAiPolish() {
    if (isAiPolishing) return;
    if (!currentChart) return;
    const interp = (global.NetaLucNhamInterpreter || global.LucNhamMobileEngine)
      ? (global.NetaLucNhamInterpreter || global.LucNhamMobileEngine).interpretChart(currentChart)
      : null;
    if (!interp) return;

    isAiPolishing = true;
    aiErrorMessage = null;
    renderLucNham();

    try {
      const prompt = (global.NetaLucNhamInterpreter && global.NetaLucNhamInterpreter.buildAIPrompt)
        ? global.NetaLucNhamInterpreter.buildAIPrompt(interp)
        : `Hãy luận giải quẻ Lục Nhâm ngày ${interp.canNgay} ${interp.chiNgay}.`;

      const gemini = global.NetaGeminiService || global.GeminiService;
      if (gemini) {
        const apiKey = (gemini.getActiveKey && gemini.getActiveKey()) || '';
        if (!apiKey) {
          throw new Error("Chưa cài đặt Gemini API Key. Bạn có thể cài đặt trong mục Cài Đặt.");
        }
        let result = null;
        if (typeof gemini.callGeminiCascade === 'function') {
          result = await gemini.callGeminiCascade(prompt, apiKey, {
            systemInstruction: "Bạn là Tổng Biên Tập Học Thuật kiêm Chuyên Gia Luận Giải Tối Cao về Đại Lục Nhâm Thần Khóa. Bảo toàn 100% cấu trúc 7 tầng, giữ nguyên số liệu, tuân thủ Rule 9 và Rule 12.",
            temperature: 0.3
          });
        } else if (typeof gemini.generateContent === 'function') {
          result = await gemini.generateContent(prompt);
        }
        if (result && result.text) {
          aiPolishedText = result.text;
          currentReportMode = 'ai';
          aiErrorMessage = null;
          showToast("Gemini AI biên tập luận giải thành công!");
        } else {
          throw new Error((result && result.error) || "Không nhận được văn bản từ Gemini AI.");
        }
      } else {
        // Mô phỏng fallback offline khi chưa cấu hình API Key
        aiPolishedText = (global.NetaLucNhamInterpreter && global.NetaLucNhamInterpreter.formatTextReport)
          ? global.NetaLucNhamInterpreter.formatTextReport(interp)
          : "Bản luận giải đã sẵn sàng ở chế độ Offline.";
        currentReportMode = 'ai';
        showToast("Đã hiển thị bản phân tích chuyên sâu (Offline).");
      }
    } catch (err) {
      console.error("Lỗi AI Polish:", err);
      currentReportMode = 'ai';
      aiErrorMessage = "Không thể kết nối AI: " + (err.message || "Vui lòng kiểm tra API Key.");
    } finally {
      isAiPolishing = false;
      renderLucNham();
    }
  }

  function dismissAiError() {
    aiErrorMessage = null;
    renderLucNham();
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
    setBirthYear: (y) => {
      currentQuerentBirthYear = y;
      renderLucNham();
    },
    setDaytime: (isDay) => {
      customDaytime = isDay;
      renderLucNham();
    },
    selectPalace: selectPalace,
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
    openLuanModal: () => { currentMainTab = 'analysis'; renderLucNham(); },
    closeLuanModal: () => { currentMainTab = 'chart'; renderLucNham(); },
    setLuanFilter: setLuanFilter,
    toggleSection: toggleSection,
    copyLuanReport: copyLuanReport,
    triggerAiPolish: triggerAiPolish,
    dismissAiError: dismissAiError,
    setDwellingType: (t) => { currentDwellingType = t; renderLucNham(); },
    setMainTab: (tab) => { currentMainTab = tab; renderLucNham(); },
    openFsEssayModal: openFsEssayModal,
    closeFsEssayModal: closeFsEssayModal,
    openFsTrachCatModal: openFsTrachCatModal,
    closeFsTrachCatModal: closeFsTrachCatModal,
    downloadFsReport: downloadFsReport,
    triggerFsAiPolish: triggerFsAiPolish
  };
  global.NetaLucNhamView = global.LucNhamView;

})(typeof window !== 'undefined' ? window : this);
