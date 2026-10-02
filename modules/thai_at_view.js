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

  // Trạng thái Chủ Sự & Bản Mệnh người hỏi
  let querentRole = 'chu';     // 'chu' (🛡️ Phe Chủ) | 'khach' (⚔️ Phe Khách)
  let querentBirthYear = 1990; // Năm sinh người hỏi để đối chiếu thần vị ngự cung tuổi

  const CAN_NAMES = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
  const CHI_NAMES = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

  function getCanChiYear(year) {
    let y = parseInt(year, 10);
    if (isNaN(y) || y < 1900 || y > 2100) y = 1990;
    const can = CAN_NAMES[(y + 6) % 10];
    const chi = CHI_NAMES[(y + 8) % 12];
    return { can, chi, canChi: `${can} ${chi}` };
  }

  // Trạng thái Phân hệ Luận Giải Chuyên Sâu 15 Phân Hệ
  let currentMainTab = 'chart'; // 'chart' (🏛️ Trận Đồ) | 'analysis' (📜 Luận Giải)
  let currentReportMode = 'standard'; // 'standard' (📜 Bản Gốc) | 'ai' (✨ Bản AI)
  let currentLuanFilter = 'all'; // 'all' | 'daicuc' | 'cachcuc' | 'tacthien' | 'nhatdung' | 'canhgio'
  let isAiPolishing = false;
  let aiPolishedText = null;
  let aiErrorMessage = null;
  let aiLoadingStepText = '';
  let collapsedSections = {};

  // Trạng thái Phong Thủy Thái Ất Thần Kinh (Dương Trạch & Âm Trạch)
  let currentFsSubMode = 'duong_trach'; // 'duong_trach' | 'am_trach'
  let currentFsSittingDeg = 0.0;        // Tọa Sơn / Tọa Huyệt (0 - 360°)
  let currentFsPropertyType = 'Biệt thự'; // Loại BĐS Dương trạch
  let currentFsLaiLongDeg = 175.0;      // Hướng Lai Long Âm trạch
  let currentFsThuyKhauDeg = 45.0;      // Hướng Thủy Khẩu Âm trạch
  let currentFsTimingTask = 'dong_tho'; // 'dong_tho' | 'cat_noc' | 'nhap_trach' | 'ha_huyet' | 'ta_mo' | 'khai_truong' | 'mo_nuoc'
  let isFsAiPolishing = false;
  let fsAiPolishedText = null;
  let fsAiErrorMessage = null;

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
        color: #78350f !important;
        font-weight: 900 !important;
      }
      .thaiat-cell-weight {
        font-size: 9px;
        color: #94a3b8;
        background: rgba(0, 0, 0, 0.4);
        padding: 1px 4px;
        border-radius: 3px;
        font-weight: 800;
      }
      body.theme-light .thaiat-cell-weight {
        background: #e2e8f0 !important;
        color: #0f172a !important;
        font-weight: 900 !important;
        border: 1px solid #cbd5e1 !important;
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
        color: #0f172a !important;
        background: #e2e8f0 !important;
        border: 1px solid #cbd5e1 !important;
        font-weight: 700 !important;
      }
      .star-thaiat { background: rgba(234, 179, 8, 0.3); color: #fde047; }
      body.theme-light .star-thaiat { background: #fef08a !important; color: #78350f !important; border: 1px solid #fde047 !important; font-weight: 800 !important; }
      .star-chu { background: rgba(56, 189, 248, 0.3); color: #7dd3fc; }
      body.theme-light .star-chu { background: #e0f2fe !important; color: #0369a1 !important; border: 1px solid #bae6fd !important; font-weight: 800 !important; }
      .star-khach { background: rgba(244, 63, 94, 0.3); color: #fb7185; }
      body.theme-light .star-khach { background: #fee2e2 !important; color: #9f1239 !important; border: 1px solid #fecdd3 !important; font-weight: 800 !important; }
      .star-dinh { background: rgba(192, 132, 252, 0.3); color: #d8b4fe; }
      body.theme-light .star-dinh { background: #f3e8ff !important; color: #6b21a8 !important; border: 1px solid #e9d5ff !important; font-weight: 800 !important; }
      .star-cat { background: rgba(52, 211, 153, 0.3); color: #6ee7b7; }
      body.theme-light .star-cat { background: #dcfce7 !important; color: #166534 !important; border: 1px solid #bbf7d0 !important; font-weight: 800 !important; }
      .star-hung { background: rgba(251, 146, 60, 0.3); color: #fdba74; }
      body.theme-light .star-hung { background: #ffedd5 !important; color: #9a3412 !important; border: 1px solid #fed7aa !important; font-weight: 800 !important; }

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
        border: 1.5px solid #cbd5e1 !important;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05) !important;
      }
      .thaiat-hud-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(245, 176, 65, 0.2);
        padding-bottom: 3px;
      }
      body.theme-light .thaiat-hud-header {
        border-color: #e2e8f0 !important;
        color: #0f172a !important;
        font-weight: 700 !important;
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
        background: #fef3c7 !important;
        color: #92400e !important;
        border: 1px solid #fde68a !important;
        font-weight: 800 !important;
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
        background: #f8fafc !important;
        border: 1.5px solid #cbd5e1 !important;
      }
      .thaiat-toan-title { font-size: 9px; color: #94a3b8; margin-bottom: 1px; }
      body.theme-light .thaiat-toan-title { color: #334155 !important; font-weight: 700 !important; }
      .thaiat-toan-num { font-size: 14px; font-weight: 800; line-height: 1; }
      .toan-c-chu { color: #38bdf8; }
      body.theme-light .toan-c-chu { color: #0369a1 !important; font-weight: 900 !important; }
      .toan-c-khach { color: #f43f5e; }
      body.theme-light .toan-c-khach { color: #be123c !important; font-weight: 900 !important; }
      .toan-c-dinh { color: #c084fc; }
      body.theme-light .toan-c-dinh { color: #7e22ce !important; font-weight: 900 !important; }

      .thaiat-generals-box {
        font-size: 10px;
        line-height: 1.3;
        background: rgba(26, 3, 7, 0.7);
        padding: 3px 5px;
        border-radius: 4px;
        margin: 2px 0;
      }
      body.theme-light .thaiat-generals-box {
        background: #f8fafc !important;
        color: #0f172a !important;
        border: 1px solid #cbd5e1 !important;
        font-weight: 600 !important;
      }
      .gen-chu-lbl { color: #38bdf8; font-weight: 800; }
      .gen-khach-lbl { color: #fb7185; font-weight: 800; }
      body.theme-light .gen-chu-lbl { color: #0284c7 !important; font-weight: 900 !important; }
      body.theme-light .gen-khach-lbl { color: #e11d48 !important; font-weight: 900 !important; }

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
        background: #e0f2fe !important;
        color: #0369a1 !important;
        border: 1.5px solid #7dd3fc !important;
        font-weight: 800 !important;
      }

      /* Master Strip: 5 Cột Phân Bổ Đều, Không Díu Chữ, Rõ Ràng & Thoáng Đãng */
      .thaiat-master-strip {
        display: grid !important;
        grid-template-columns: repeat(5, 1fr) !important;
        gap: 2px !important;
        background: rgba(26, 3, 7, 0.95);
        border: 1px solid rgba(245, 176, 65, 0.35);
        border-radius: 8px;
        padding: 6px 3px;
        margin: 4px 0 6px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
        box-sizing: border-box;
        width: 100%;
        text-align: center;
      }
      body.theme-light .thaiat-master-strip {
        background: #ffffff !important;
        border: 1.5px solid #cbd5e1 !important;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06) !important;
      }
      .thaiat-stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0 1px;
        min-width: 0;
      }
      .thaiat-stat-item:not(:last-child) {
        border-right: 1px solid rgba(245, 176, 65, 0.18);
      }
      body.theme-light .thaiat-stat-item:not(:last-child) {
        border-right-color: #e2e8f0;
      }
      .thaiat-stat-lbl {
        font-size: 0.65rem;
        font-weight: 700;
        color: #94a3b8;
        letter-spacing: 0.2px;
        margin-bottom: 2px;
        white-space: nowrap;
        text-transform: uppercase;
      }
      body.theme-light .thaiat-stat-lbl {
        color: #64748b !important;
      }
      .thaiat-stat-val {
        font-size: 0.78rem;
        font-weight: 800;
        color: #f1f5f9;
        white-space: nowrap;
        line-height: 1.2;
      }
      .thaiat-stat-val.tms-val-gold {
        color: #f5b041;
      }
      body.theme-light .thaiat-stat-val {
        color: #0f172a !important;
      }
      body.theme-light .thaiat-stat-val.tms-val-gold {
        color: #b45309 !important;
      }

      /* Thanh Tứ Kể: 5 Nút Trải Đều 100% Theo Phương Ngang */
      .thaiat-ke-bar {
        display: flex;
        width: 100%;
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(245, 176, 65, 0.3);
        border-radius: 8px;
        padding: 2px;
        box-sizing: border-box;
        margin: 0 0 6px 0;
        gap: 2px;
      }
      body.theme-light .thaiat-ke-bar {
        background: #f1f5f9;
        border-color: #cbd5e1;
      }
      .thaiat-ke-bar .ucc-view-btn {
        flex: 1 1 0;
        min-width: 0;
        text-align: center;
        justify-content: center;
        height: 28px;
        font-size: 0.74rem;
        font-weight: 700;
        border-radius: 6px;
        color: var(--text-muted, #94a3b8);
        padding: 0;
        margin: 0;
      }
      body.theme-light .thaiat-ke-bar .ucc-view-btn {
        color: #64748b;
      }
      .thaiat-ke-bar .ucc-view-btn.active {
        background: rgba(245, 176, 65, 0.25);
        color: #f5b041;
        font-weight: 900;
      }
      body.theme-light .thaiat-ke-bar .ucc-view-btn.active {
        background: #ffffff;
        color: #b45309;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

      /* Nút Kích Hoạt Luận Giải Chuyên Sâu */
      .thaiat-luan-banner {
        margin: 6px 0 8px;
        width: 100%;
      }
      .thaiat-btn-luan-giai {
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
      body.theme-light .thaiat-btn-luan-giai {
        background: linear-gradient(135deg, #fef3c7, #fed7aa) !important;
        border-color: #d97706 !important;
        color: #92400e !important;
        box-shadow: 0 2px 6px rgba(217, 119, 6, 0.15) !important;
      }
      .thaiat-btn-luan-giai:active { transform: scale(0.99); }
      .luan-btn-left {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .luan-btn-icon { font-size: 16px; }
      .luan-btn-text { font-size: 12.5px; font-weight: 800; }
      .luan-btn-right {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .luan-btn-badge {
        font-size: 10px;
        background: rgba(245, 176, 65, 0.2);
        padding: 2px 6px;
        border-radius: 4px;
        color: #fef08a;
        font-weight: 700;
      }
      body.theme-light .luan-btn-badge {
        background: #fde68a !important;
        color: #78350f !important;
      }
      .luan-btn-arrow { font-size: 11px; opacity: 0.8; }

      /* Inline Report Wrap & Meta Bar (Bát Tự Uniform) */
      .thaiat-analysis-wrap {
        width: 100%;
        margin-top: 6px;
      }
      .thaiat-report-meta-bar {
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
      body.theme-light .thaiat-report-meta-bar {
        background: #f8fafc !important;
        border-color: #cbd5e1 !important;
      }
      body.theme-light .thaiat-report-meta-bar > div:first-child {
        color: #92400e !important;
      }
      .luan-loading-spinner {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 2px solid rgba(245, 176, 65, 0.3);
        border-radius: 50%;
        border-top-color: #f5b041;
        animation: thaiat-spin 0.8s linear infinite;
      }
      @keyframes thaiat-spin {
        to { transform: rotate(360deg); }
      }
      /* Dashboard Metrics */
      .luan-dashboard-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 6px;
        margin-bottom: 8px;
      }
      .luan-metric-card {
        background: rgba(26, 4, 8, 0.85);
        border: 1px solid rgba(245, 176, 65, 0.25);
        border-radius: 8px;
        padding: 6px;
        text-align: center;
      }
      body.theme-light .luan-metric-card {
        background: #f8fafc !important;
        border-color: #e2e8f0 !important;
      }
      .luan-metric-num {
        font-size: 16px;
        font-weight: 900;
        line-height: 1.1;
      }
      .luan-metric-label {
        font-size: 12px;
        font-weight: 700;
        color: #94a3b8;
        margin-top: 2px;
      }
      body.theme-light .luan-metric-label { color: #64748b; }
      /* Force Balance Progress */
      .luan-force-bar-wrap {
        background: rgba(26, 4, 8, 0.85);
        border: 1px solid rgba(245, 176, 65, 0.25);
        border-radius: 8px;
        padding: 8px 12px;
        margin-bottom: 10px;
      }
      body.theme-light .luan-force-bar-wrap {
        background: #f8fafc !important;
        border-color: #e2e8f0 !important;
      }
      .luan-force-labels {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        font-weight: 700;
        margin-bottom: 6px;
      }
      .force-lbl-chu { color: #38bdf8; }
      body.theme-light .force-lbl-chu { color: #0284c7; }
      .force-lbl-khach { color: #fb7185; }
      body.theme-light .force-lbl-khach { color: #e11d48; }
      .luan-force-bar-track {
        height: 10px;
        background: #be123c;
        border-radius: 5px;
        overflow: hidden;
      }
      .luan-force-bar-fill {
        height: 100%;
        background: #0284c7;
        transition: width 0.3s ease;
      }
      /* Pill Filter Tabs */
      .luan-pills-bar {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding-bottom: 6px;
        margin-bottom: 10px;
        scrollbar-width: none;
        scroll-margin-top: 65px;
      }
      .luan-pills-bar::-webkit-scrollbar { display: none; }
      .luan-pill-btn {
        background: rgba(26, 4, 8, 0.8);
        border: 1px solid rgba(245, 176, 65, 0.25);
        border-radius: 8px;
        padding: 6px 12px;
        font-size: 12.5px;
        font-weight: 700;
        white-space: nowrap;
        color: #94a3b8;
        cursor: pointer;
      }
      body.theme-light .luan-pill-btn {
        background: #f1f5f9;
        border-color: #cbd5e1;
        color: #475569;
      }
      .luan-pill-btn.active {
        background: #f5b041 !important;
        border-color: #f5b041 !important;
        color: #0f0205 !important;
      }
      body.theme-light .luan-pill-btn.active {
        background: #d97706 !important;
        border-color: #d97706 !important;
        color: #ffffff !important;
      }
      /* Accordion Section Cards */
      .luan-section-card {
        background: rgba(20, 2, 5, 0.95);
        border: 1px solid rgba(245, 176, 65, 0.25);
        border-radius: 8px;
        margin-bottom: 8px;
        overflow: hidden;
        scroll-margin-top: 65px;
      }
      body.theme-light .luan-section-card {
        background: #ffffff !important;
        border-color: #e2e8f0 !important;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }
      .luan-section-header {
        padding: 10px 12px;
        background: rgba(30, 6, 12, 0.9);
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        font-size: 14.5px;
        font-weight: 800;
        color: #f5b041;
        border-bottom: 1px solid rgba(245, 176, 65, 0.15);
      }
      body.theme-light .luan-section-header {
        background: #f8fafc !important;
        border-bottom-color: #f1f5f9 !important;
        color: #b45309 !important;
      }
      .luan-section-toggle { font-size: 12px; opacity: 0.7; }
      .luan-section-body {
        padding: 10px 12px;
        font-size: 13.5px;
        line-height: 1.65;
        color: var(--text-primary, #f8fafc);
      }
      body.theme-light .luan-section-body {
        color: #1e293b !important;
      }
      .luan-sub-item {
        margin-bottom: 8px;
      }
      .luan-sub-item:last-child { margin-bottom: 0; }
      .luan-sub-title {
        font-weight: 800;
        font-size: 13.5px;
        color: #38bdf8;
        margin-bottom: 3px;
      }
      body.theme-light .luan-sub-title { color: #0284c7; }
      .luan-badge-hung {
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
        border: 1px solid #ef4444;
        padding: 2px 6px !important;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 800;
        white-space: nowrap !important;
        display: inline-block !important;
        text-align: center !important;
      }
      .luan-badge-cat {
        background: rgba(16, 185, 129, 0.2);
        color: #6ee7b7;
        border: 1px solid #10b981;
        padding: 2px 6px !important;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 800;
        white-space: nowrap !important;
        display: inline-block !important;
        text-align: center !important;
      }
      .luan-badge-binh {
        background: rgba(148, 163, 184, 0.2);
        color: #cbd5e1;
        border: 1px solid #94a3b8;
        padding: 2px 6px !important;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 800;
        white-space: nowrap !important;
        display: inline-block !important;
        text-align: center !important;
      }
      body.theme-light .luan-badge-binh {
        background: #f1f5f9;
        color: #475569;
        border-color: #cbd5e1;
      }
      .luan-hours-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
      }
      .luan-hours-table th, .luan-hours-table td {
        padding: 5px 6px;
        border: 1px solid rgba(245, 176, 65, 0.15);
      }
      body.theme-light .luan-hours-table th, body.theme-light .luan-hours-table td {
        border-color: #e2e8f0;
      }
      .luan-hours-table th {
        background: rgba(245, 176, 65, 0.15);
        color: #f5b041;
        font-weight: 800;
        font-size: 11.5px;
      }
      body.theme-light .luan-hours-table th {
        background: #f1f5f9;
        color: #475569;
      }
      .col-trangthai {
        text-align: center;
        white-space: nowrap !important;
        vertical-align: middle;
      }
      .col-gio {
        vertical-align: middle;
      }
      .hour-name {
        font-weight: 800;
        color: var(--gold-primary, #f5b041);
        font-size: 11.5px;
      }
      body.theme-light .hour-name {
        color: #b45309;
      }
      .hour-time {
        font-size: 9.5px;
        color: var(--text-muted, #94a3b8);
        font-weight: normal;
      }
      body.theme-light .hour-time {
        color: #64748b;
      }
      .hour-hanh {
        font-size: 9.5px;
        color: #38bdf8;
        font-weight: 600;
      }
      body.theme-light .hour-hanh {
        color: #0284c7;
      }
      .col-loikhuyen {
        font-size: 11.5px;
        line-height: 1.35;
      }
      .luan-role-note {
        font-size: 11px;
        color: var(--text-muted, #94a3b8);
        line-height: 1.35;
        margin-bottom: 6px;
        background: rgba(0, 0, 0, 0.25);
        padding: 4px 6px;
        border-radius: 4px;
        border-left: 2px solid #f5b041;
      }
      body.theme-light .luan-role-note {
        background: #f8fafc;
        color: #475569;
        border-left-color: #d97706;
      }
      .luan-loading-spinner {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 2px solid rgba(245, 176, 65, 0.3);
        border-radius: 50%;
        border-top-color: #f5b041;
        animation: thaiat-spin 0.8s linear infinite;
      }
      @keyframes thaiat-spin {
        to { transform: rotate(360deg); }
      }
      .luan-view-mode-bar {
        display: flex;
        justify-content: center;
        gap: 6px;
        margin-bottom: 8px;
      }
      .luan-mode-tab {
        background: rgba(26, 4, 8, 0.85);
        border: 1px solid rgba(245, 176, 65, 0.3);
        border-radius: 8px;
        padding: 6px 14px;
        font-size: 12.5px;
        font-weight: 700;
        color: #94a3b8;
        cursor: pointer;
      }
      body.theme-light .luan-mode-tab {
        background: #f1f5f9;
        border-color: #cbd5e1;
        color: #475569;
      }
      .luan-mode-tab.active {
        background: #f5b041;
        border-color: #f5b041;
        color: #0f0205;
      }
      body.theme-light .luan-mode-tab.active {
        background: #d97706;
        border-color: #d97706;
        color: #ffffff;
      }

      /* Context Header & Querent Controls */
      .thaiat-context-header {
        display: flex;
        flex-direction: column;
        gap: 6px;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(245, 176, 65, 0.22);
        border-radius: 8px;
        padding: 6px 8px;
        margin-bottom: 8px;
      }
      body.theme-light .thaiat-context-header {
        background: #f8fafc;
        border-color: #cbd5e1;
      }
      .thaiat-context-title-wrap {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .thaiat-context-icon {
        font-size: 1.15rem;
        line-height: 1;
      }
      .thaiat-context-texts {
        display: flex;
        flex-direction: column;
        min-width: 0;
        flex: 1;
      }
      .thaiat-context-title {
        font-size: 0.76rem;
        font-weight: 800;
        color: var(--gold-primary, #f5b041);
        letter-spacing: 0.2px;
      }
      body.theme-light .thaiat-context-title {
        color: #b45309;
      }
      .thaiat-context-desc {
        font-size: 0.65rem;
        color: var(--text-muted, #94a3b8);
        line-height: 1.25;
      }
      body.theme-light .thaiat-context-desc {
        color: #64748b;
      }

      .thaiat-querent-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding-top: 5px;
        border-top: 1px dashed rgba(245, 176, 65, 0.2);
      }
      body.theme-light .thaiat-querent-bar {
        border-top-color: #e2e8f0;
      }

      .thaiat-role-toggle {
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .thaiat-role-lbl, .thaiat-birth-lbl {
        font-size: 0.68rem;
        font-weight: 700;
        color: var(--text-muted, #94a3b8);
        white-space: nowrap;
      }
      body.theme-light .thaiat-role-lbl, body.theme-light .thaiat-birth-lbl {
        color: #64748b;
      }

      .thaiat-role-pill {
        display: flex;
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(245, 176, 65, 0.25);
        border-radius: 6px;
        padding: 2px;
        gap: 2px;
      }
      body.theme-light .thaiat-role-pill {
        background: #e2e8f0;
        border-color: #cbd5e1;
      }

      .thaiat-role-btn {
        background: transparent;
        border: none;
        border-radius: 4px;
        padding: 2.5px 7px;
        font-size: 0.7rem;
        font-weight: 700;
        color: var(--text-muted, #94a3b8);
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.15s ease;
      }
      body.theme-light .thaiat-role-btn {
        color: #64748b;
      }
      .thaiat-role-btn.active-chu {
        background: linear-gradient(135deg, #10b981, #059669);
        color: #ffffff;
        font-weight: 800;
        box-shadow: 0 1px 4px rgba(16, 185, 129, 0.3);
      }
      .thaiat-role-btn.active-khach {
        background: linear-gradient(135deg, #0284c7, #0369a1);
        color: #ffffff;
        font-weight: 800;
        box-shadow: 0 1px 4px rgba(2, 132, 199, 0.3);
      }

      .thaiat-birth-box {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .num-qyear {
        width: 58px;
        height: 24px;
        text-align: center;
        font-size: 0.75rem;
        font-weight: 800;
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(245, 176, 65, 0.3);
        border-radius: 4px;
        color: var(--text-primary, #f8fafc);
      }
      body.theme-light .num-qyear {
        background: #ffffff;
        border-color: #cbd5e1;
        color: #0f172a;
      }
      .thaiat-qyear-badge {
        background: rgba(245, 176, 65, 0.15);
        border: 1px solid rgba(245, 176, 65, 0.3);
        color: var(--gold-primary, #f5b041);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.68rem;
        font-weight: 800;
        white-space: nowrap;
      }
      body.theme-light .thaiat-qyear-badge {
        background: #fef3c7;
        border-color: #fde68a;
        color: #b45309;
      }

      /* Personalized Strategy Strip */
      .thaiat-personal-strip {
        background: rgba(20, 2, 5, 0.9);
        border: 1px solid rgba(245, 176, 65, 0.35);
        border-radius: 8px;
        padding: 6px 8px;
        margin-bottom: 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }
      body.theme-light .thaiat-personal-strip {
        background: #ffffff;
        border-color: #cbd5e1;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
      }
      .thaiat-personal-strip.role-chu-border {
        border-left: 3.5px solid #10b981;
      }
      .thaiat-personal-strip.role-khach-border {
        border-left: 3.5px solid #0284c7;
      }

      .tps-row {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }
      .tps-role-tag {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        background: rgba(245, 176, 65, 0.15);
        border: 1px solid rgba(245, 176, 65, 0.3);
        padding: 1px 6px;
        border-radius: 4px;
        font-size: 0.68rem;
        font-weight: 800;
        color: var(--gold-primary, #f5b041);
      }
      body.theme-light .tps-role-tag {
        background: #fef3c7;
        color: #b45309;
      }
      .tps-verdict {
        font-size: 0.74rem;
        font-weight: 800;
        color: #f8fafc;
        flex: 1;
        min-width: 140px;
      }
      body.theme-light .tps-verdict {
        color: #0f172a;
      }

      .tps-birth-row {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 0.68rem;
        flex-wrap: wrap;
        border-top: 1px dashed rgba(245, 176, 65, 0.15);
        padding-top: 3px;
      }
      body.theme-light .tps-birth-row {
        border-top-color: #e2e8f0;
      }
      .tps-birth-label {
        color: var(--text-muted, #94a3b8);
        font-weight: 700;
      }
      body.theme-light .tps-birth-label {
        color: #64748b;
      }
      .tps-birth-stars.tps-stars-cat {
        color: #10b981;
        font-weight: 800;
      }
      .tps-birth-stars.tps-stars-hung {
        color: #ef4444;
        font-weight: 800;
      }

      .luan-badge-khach {
        background: rgba(2, 132, 199, 0.18);
        border: 1px solid #0284c7;
        color: #38bdf8;
        padding: 1px 6px;
        border-radius: 4px;
        font-size: 9.5px;
        font-weight: 800;
      }
      body.theme-light .luan-badge-khach {
        background: #e0f2fe;
        color: #0369a1;
      }

      /* ===================================================================== */
      /* THÁI ẤT PHONG THỦY (FENG SHUI SPATIAL STYLES)                          */
      /* ===================================================================== */
      .thaiat-fengshui-wrap {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 4px;
        padding-bottom: 24px;
      }
      .fs-subnav-bar {
        display: flex;
        justify-content: center;
        margin-bottom: 4px;
      }
      .fs-subnav-pill {
        display: flex;
        background: rgba(20, 2, 5, 0.95);
        border: 1px solid rgba(245, 176, 65, 0.4);
        border-radius: 8px;
        padding: 2px;
        width: 100%;
        max-width: 440px;
        gap: 4px;
      }
      body.theme-light .fs-subnav-pill {
        background: #fdfaf3 !important;
        border-color: #d97706 !important;
      }
      .fs-subnav-btn {
        flex: 1;
        padding: 7px 10px;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: #94a3b8;
        font-size: 11px;
        font-weight: 800;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        transition: all 0.2s ease;
      }
      .fs-subnav-btn.active {
        background: linear-gradient(135deg, rgba(245, 176, 65, 0.35), rgba(180, 83, 9, 0.35));
        color: #fef08a;
        box-shadow: 0 1px 4px rgba(0,0,0,0.4);
      }
      body.theme-light .fs-subnav-btn {
        color: #64748b !important;
      }
      body.theme-light .fs-subnav-btn.active {
        background: #d97706 !important;
        color: #ffffff !important;
      }
      .fs-actions-bar {
        display: flex;
        gap: 5px;
        overflow-x: auto;
        padding: 2px 0 4px;
        scrollbar-width: none;
      }
      .fs-actions-bar::-webkit-scrollbar { display: none; }
      .fs-action-btn {
        flex: 1;
        min-width: 72px;
        padding: 6px 8px;
        background: rgba(25, 3, 7, 0.85);
        border: 1px solid rgba(245, 176, 65, 0.35);
        border-radius: 6px;
        color: #e2e8f0;
        font-size: 10.5px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        white-space: nowrap;
        transition: all 0.15s ease;
      }
      .fs-action-btn:hover {
        background: rgba(245, 176, 65, 0.2);
        border-color: #f5b041;
        color: #fef08a;
      }
      body.theme-light .fs-action-btn {
        background: #ffffff !important;
        border-color: #cbd5e1 !important;
        color: #1e293b !important;
      }
      body.theme-light .fs-action-btn:hover {
        background: #f8fafc !important;
        border-color: #d97706 !important;
        color: #b45309 !important;
      }
      .fs-card {
        background: rgba(20, 2, 5, 0.95);
        border: 1px solid rgba(245, 176, 65, 0.3);
        border-radius: 8px;
        padding: 10px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      body.theme-light .fs-card {
        background: #ffffff !important;
        border-color: #e2e8f0 !important;
        box-shadow: 0 1px 4px rgba(0,0,0,0.06) !important;
      }
      .fs-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(245, 176, 65, 0.2);
        padding-bottom: 5px;
      }
      body.theme-light .fs-card-header {
        border-bottom-color: #f1f5f9 !important;
      }
      .fs-card-title {
        font-size: 11.5px;
        font-weight: 800;
        color: var(--gold-primary, #f5b041);
        display: flex;
        align-items: center;
        gap: 5px;
      }
      body.theme-light .fs-card-title {
        color: #92400e !important;
      }
      .fs-badge {
        font-size: 9px;
        font-weight: 800;
        padding: 2px 6px;
        border-radius: 4px;
      }
      .fs-badge-great { background: rgba(34, 197, 94, 0.25); color: #86efac; border: 1px solid #16a34a; }
      .fs-badge-good { background: rgba(56, 189, 248, 0.25); color: #7dd3fc; border: 1px solid #0284c7; }
      .fs-badge-warn { background: rgba(245, 158, 11, 0.25); color: #fde047; border: 1px solid #d97706; }
      .fs-badge-critical { background: rgba(239, 68, 68, 0.25); color: #fca5a5; border: 1px solid #dc2626; animation: fs-pulse-red 2s infinite; }
      .fs-badge-normal { background: rgba(148, 163, 184, 0.2); color: #cbd5e1; border: 1px solid #64748b; }

      @keyframes fs-pulse-red {
        0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
        50% { box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.15); }
      }
      body.theme-light .fs-badge-great { background: #dcfce7 !important; color: #15803d !important; border-color: #86efac !important; }
      body.theme-light .fs-badge-good { background: #e0f2fe !important; color: #0369a1 !important; border-color: #7dd3fc !important; }
      body.theme-light .fs-badge-warn { background: #fef3c7 !important; color: #b45309 !important; border-color: #fcd34d !important; }
      body.theme-light .fs-badge-critical { background: #fee2e2 !important; color: #b91c1c !important; border-color: #fca5a5 !important; }
      body.theme-light .fs-badge-normal { background: #f1f5f9 !important; color: #475569 !important; border-color: #cbd5e1 !important; }

      .fs-compass-ctrl {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .fs-slider-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .fs-slider {
        flex: 1;
        accent-color: #f5b041;
        cursor: pointer;
      }
      .fs-deg-input {
        width: 64px;
        background: rgba(10, 1, 3, 0.9);
        border: 1px solid rgba(245, 176, 65, 0.4);
        border-radius: 4px;
        color: #fef08a;
        font-weight: 800;
        font-size: 11px;
        text-align: center;
        padding: 3px 2px;
      }
      body.theme-light .fs-deg-input {
        background: #f8fafc !important;
        border-color: #cbd5e1 !important;
        color: #0f172a !important;
      }
      .fs-readout-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 6px;
        background: rgba(30, 6, 12, 0.8);
        border-radius: 6px;
        padding: 6px 8px;
        border: 1px solid rgba(245, 176, 65, 0.2);
      }
      body.theme-light .fs-readout-row {
        background: #f8fafc !important;
        border-color: #e2e8f0 !important;
      }
      .fs-readout-item {
        display: flex;
        flex-direction: column;
        gap: 1px;
      }
      .fs-readout-lbl {
        font-size: 9px;
        color: #94a3b8;
        font-weight: 700;
      }
      body.theme-light .fs-readout-lbl { color: #64748b !important; }
      .fs-readout-val {
        font-size: 11px;
        font-weight: 800;
        color: #f8fafc;
      }
      body.theme-light .fs-readout-val { color: #0f172a !important; }

      .fs-master-score {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 4px 0;
      }
      .fs-score-circle {
        width: 58px;
        height: 58px;
        border-radius: 50%;
        border: 3px solid #f5b041;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(245, 176, 65, 0.15);
        flex-shrink: 0;
      }
      body.theme-light .fs-score-circle {
        border-color: #d97706 !important;
        background: #fef3c7 !important;
      }
      .fs-score-num {
        font-size: 18px;
        font-weight: 900;
        color: #fef08a;
        line-height: 1;
      }
      body.theme-light .fs-score-num { color: #92400e !important; }
      .fs-score-unit {
        font-size: 8px;
        color: #94a3b8;
        font-weight: 700;
      }
      body.theme-light .fs-score-unit { color: #78350f !important; }
      .fs-master-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .fs-master-thetran {
        font-size: 11px;
        font-weight: 800;
        color: #f8fafc;
      }
      body.theme-light .fs-master-thetran { color: #1e293b !important; }
      .fs-master-bars {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .fs-bar-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 9.5px;
      }
      .fs-bar-lbl {
        width: 80px;
        color: #94a3b8;
        font-weight: 700;
      }
      body.theme-light .fs-bar-lbl { color: #475569 !important; }
      .fs-bar-track {
        flex: 1;
        height: 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        overflow: hidden;
      }
      body.theme-light .fs-bar-track { background: #e2e8f0 !important; }
      .fs-bar-fill {
        height: 100%;
        border-radius: 3px;
      }
      .fs-bar-fill-chu { background: linear-gradient(90deg, #10b981, #059669); }
      .fs-bar-fill-khach { background: linear-gradient(90deg, #38bdf8, #0284c7); }
      .fs-bar-fill-phuc { background: linear-gradient(90deg, #f59e0b, #d97706); }
      .fs-bar-fill-an { background: linear-gradient(90deg, #a855f7, #7c3aed); }
      .fs-bar-val {
        width: 24px;
        text-align: right;
        font-weight: 800;
        color: #e2e8f0;
      }
      body.theme-light .fs-bar-val { color: #0f172a !important; }

      .fs-chips-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 4px;
      }
      .fs-chip {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 4px 6px;
        background: rgba(30, 6, 12, 0.85);
        border: 1px solid rgba(245, 176, 65, 0.25);
        border-radius: 5px;
        font-size: 9.5px;
      }
      body.theme-light .fs-chip {
        background: #f8fafc !important;
        border-color: #cbd5e1 !important;
      }
      .fs-chip-icon { font-size: 11px; }
      .fs-chip-name { font-weight: 700; color: #94a3b8; }
      body.theme-light .fs-chip-name { color: #64748b !important; }
      .fs-chip-val { font-weight: 800; color: #fef08a; margin-left: auto; }
      body.theme-light .fs-chip-val { color: #92400e !important; }

      .fs-zoning-item {
        background: rgba(30, 6, 12, 0.8);
        border: 1px solid rgba(245, 176, 65, 0.2);
        border-radius: 6px;
        padding: 7px 9px;
        display: flex;
        flex-direction: column;
        gap: 3px;
        font-size: 10px;
      }
      body.theme-light .fs-zoning-item {
        background: #f8fafc !important;
        border-color: #e2e8f0 !important;
      }
      .fs-zoning-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .fs-zoning-title { font-weight: 800; color: #fef08a; font-size: 10.5px; }
      body.theme-light .fs-zoning-title { color: #92400e !important; }
      .fs-zoning-desc { color: #cbd5e1; line-height: 1.35; }
      body.theme-light .fs-zoning-desc { color: #334155 !important; }
      .fs-zoning-remedy { color: #86efac; font-weight: 700; }
      body.theme-light .fs-zoning-remedy { color: #15803d !important; }

      .fs-remedy-item {
        background: rgba(30, 6, 12, 0.8);
        border-left: 3px solid #f5b041;
        padding: 6px 8px;
        border-radius: 0 5px 5px 0;
        font-size: 10px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      body.theme-light .fs-remedy-item {
        background: #f8fafc !important;
        border-left-color: #d97706 !important;
      }
      .fs-remedy-head { font-weight: 800; color: #f8fafc; }
      body.theme-light .fs-remedy-head { color: #0f172a !important; }
      .fs-remedy-body { color: #94a3b8; line-height: 1.35; }
      body.theme-light .fs-remedy-body { color: #475569 !important; }

      .fs-path-item {
        background: rgba(35, 7, 10, 0.9);
        border-left: 3px solid #ef4444;
        padding: 6px 8px;
        border-radius: 0 5px 5px 0;
        font-size: 10px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      body.theme-light .fs-path-item {
        background: #fef2f2 !important;
        border-left-color: #dc2626 !important;
      }
      .fs-path-title { font-weight: 800; color: #fca5a5; display: flex; justify-content: space-between; }
      body.theme-light .fs-path-title { color: #991b1b !important; }
      .fs-path-body { color: #cbd5e1; line-height: 1.35; }
      body.theme-light .fs-path-body { color: #334155 !important; }

      /* Modals */
      .thaiat-fs-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(2px);
        z-index: 1000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.25s ease;
      }
      .thaiat-fs-modal-overlay.open {
        opacity: 1;
        pointer-events: auto;
      }
      .thaiat-fs-modal {
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
        max-height: 84vh;
        display: flex;
        flex-direction: column;
      }
      body.theme-light .thaiat-fs-modal {
        background: #ffffff !important;
        border-top-color: #d97706 !important;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2) !important;
        color: #1f2937 !important;
      }
      .thaiat-fs-modal.open,
      .thaiat-fs-modal-overlay.open .thaiat-fs-modal { transform: translateY(0) !important; }
      .thaiat-fs-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 14px;
        border-bottom: 1px solid rgba(245, 176, 65, 0.25);
      }
      body.theme-light .thaiat-fs-modal-header {
        border-bottom-color: #e5e7eb !important;
      }
      .thaiat-fs-modal-title {
        font-weight: 800;
        font-size: 13px;
        color: #f5b041;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      body.theme-light .thaiat-fs-modal-title { color: #92400e !important; }
      .thaiat-fs-modal-close {
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 18px;
        cursor: pointer;
        padding: 0 4px;
      }
      .thaiat-fs-modal-body {
        padding: 12px 14px;
        overflow-y: auto;
        flex: 1;
        font-size: 11px;
        line-height: 1.6;
        color: #e2e8f0;
        font-family: inherit;
        white-space: pre-wrap;
      }
      body.theme-light .thaiat-fs-modal-body {
        color: #1e293b !important;
      }
      .thaiat-fs-modal-footer {
        padding: 8px 14px 12px;
        border-top: 1px solid rgba(245, 176, 65, 0.2);
        display: flex;
        gap: 8px;
      }
      body.theme-light .thaiat-fs-modal-footer {
        border-top-color: #e5e7eb !important;
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

  function renderThaiAt(preserveScroll = false) {
    const container = document.getElementById('view-thaiat');
    if (!container) return;
    const wrap = container.querySelector('.thaiat-view-wrap');
    const prevScrollY = preserveScroll ? ((wrap && wrap.scrollTop !== undefined) ? wrap.scrollTop : (container.scrollTop || (window.scrollY || document.documentElement.scrollTop))) : null;
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

    const qCanChi = getCanChiYear(querentBirthYear);
    const userContext = {
      querentRole: querentRole,
      querentBirthYear: querentBirthYear,
      querentBirthBranch: qCanChi.chi,
      querentCanChi: qCanChi.canChi
    };

    let luanQuickBadge = '15 Phân Hệ';
    let luanData = null;
    if (global.NetaThaiAtInterpreter && keData) {
      try {
        luanData = global.NetaThaiAtInterpreter.luanGiaiKe(keData, currentChart, userContext);
        if (luanData && luanData.chi_so_dinh_luong) {
          luanQuickBadge = `${luanData.chi_so_dinh_luong.diem_cat_khanh}đ Cát • ${luanData.dao_chu_khach.ket_luan.split('(')[0].trim()}`;
        }
      } catch (e) {
        console.warn('Lỗi tính luận giải Thái Ất:', e);
      }
    }

    const starsAtBirth = [];
    if (keData && keData.stars && qCanChi.chi) {
      for (let s in keData.stars) {
        if (keData.stars[s] === qCanChi.chi) starsAtBirth.push(s);
      }
    }
    const starStatusText = starsAtBirth.length > 0 
      ? starsAtBirth.join(', ')
      : 'Bình hòa (Không phạm sát)';
    const isHungStar = starsAtBirth.some(s => ['Thủy Kích', 'Kế Thần', 'Cờ Đen', 'Cờ Đỏ', 'Hắc Kỳ', 'Xích Kỳ', 'Âm Cả'].includes(s));

    container.innerHTML = `
      <div class="thaiat-view-wrap">
        <!-- 1. Unified Control Card (Chuẩn Tử Vi / Bát Tự) -->
        <div class="unified-ctrl-card">
          <!-- Row 0: Contextual Header & Querent Controls -->
          <div class="thaiat-context-header">
            <div class="thaiat-context-title-wrap">
              <span class="thaiat-context-icon">${currentKeType === 'menh' ? '🎂' : '⏱️'}</span>
              <div class="thaiat-context-texts">
                <strong class="thaiat-context-title">
                  ${currentKeType === 'menh'
                    ? 'LÁ SỐ NHÂN MỆNH THÁI ẤT (12 CUNG)'
                    : `THỜI ĐIỂM CHIÊM SỰ • ${currentKeType === 'gio' ? 'KỂ GIỜ' : currentKeType === 'ngay' ? 'KỂ NGÀY' : currentKeType === 'thang' ? 'KỂ THÁNG' : 'KỂ NĂM'}`
                  }
                </strong>
                <span class="thaiat-context-desc">
                  ${currentKeType === 'menh'
                    ? 'Nhập ngày giờ sinh để an cung Mệnh, Thân, Vận hạn đời người'
                    : 'Thời điểm khởi tâm chiêm vấn / phát sinh sự việc'
                  }
                </span>
              </div>
            </div>

            ${currentKeType !== 'menh' ? `
              <!-- Controls chọn vai vế Chủ / Khách & Năm sinh đương số -->
              <div class="thaiat-querent-bar">
                <div class="thaiat-role-toggle" title="Chọn vai vế đương số trong sự việc để xác định thế thắng bại">
                  <span class="thaiat-role-lbl">Vai vế:</span>
                  <div class="thaiat-role-pill">
                    <button type="button" class="thaiat-role-btn ${querentRole === 'chu' ? 'active-chu' : ''}" id="thaiat-btn-role-chu" title="Phe Chủ: Tại vị, phòng thủ, gia chủ, tuyển dụng, chủ nợ, bị kiện">🛡️ Chủ</button>
                    <button type="button" class="thaiat-role-btn ${querentRole === 'khach' ? 'active-khach' : ''}" id="thaiat-btn-role-khach" title="Phe Khách: Tiến công, xuất hành, ứng viên, đi vay, khởi kiện">⚔️ Khách</button>
                  </div>
                </div>

                <div class="thaiat-birth-box" title="Năm sinh đương số để đối chiếu thần vị ngự cung tuổi">
                  <span class="thaiat-birth-lbl">Tuổi:</span>
                  <input type="number" id="thaiat-input-querent-year" class="num-box num-qyear" min="1920" max="2040" value="${querentBirthYear}" placeholder="Năm">
                  <span class="thaiat-qyear-badge" id="thaiat-qyear-badge">${qCanChi.canChi}</span>
                </div>
              </div>
            ` : ''}
          </div>

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

          <!-- Row 3: Actions + Switch View Trận Đồ vs Luận Giải (Bát Tự Uniform) -->
          <div class="ucc-row ucc-row-actions">
            <button class="ucc-btn-now" id="thaiat-btn-now" title="Về thời điểm hiện tại">
              ⚡ Giờ thực
            </button>
            <div class="ucc-pill-view">
              <button type="button" class="ucc-view-btn ${currentMainTab === 'chart' ? 'active' : ''}" id="btn-thaiat-tab-chart" title="Trận Đồ Thái Ất">
                🏛️ Trận Đồ
              </button>
              <button type="button" class="ucc-view-btn ${currentMainTab === 'analysis' ? 'active' : ''}" id="btn-thaiat-tab-analysis" title="Bản Luận Giải Chuyên Sâu">
                📜 Luận Giải
              </button>
              <button type="button" class="ucc-view-btn ${currentMainTab === 'fengshui' ? 'active' : ''}" id="btn-thaiat-tab-fengshui" title="Phong Thủy Không Gian 16 Thần Vị">
                🏡 Phong Thủy
              </button>
              <button type="button" class="ucc-view-btn btn-cross-tamthuc" id="btn-thaiat-cross-tamthuc" title="Đối chiếu tổng hợp Tam Thức (Thái Ất - Kỳ Môn - Lục Nhâm)">
                ⚡ Tam Thức
              </button>
            </div>
            <button class="ucc-btn-submit" id="thaiat-btn-submit" title="Lập quẻ Thái Ất">
              🔮 Lập Quẻ
            </button>
          </div>
        </div>

        ${currentMainTab === 'analysis' ? renderThaiAtAnalysisHTML(keData, currentChart, luanData) : (currentMainTab === 'fengshui' ? renderThaiAtFengShuiHTML(keData, currentChart) : `
          <!-- 1. Master Overview Ribbon (Thái Ất Master Strip - Đưa lên trên) -->
          <div class="thaiat-master-strip">
            <div class="thaiat-stat-item">
              <span class="thaiat-stat-lbl">Độn</span>
              <strong class="thaiat-stat-val tms-val-gold">${keData.donType}</strong>
            </div>
            <div class="thaiat-stat-item">
              <span class="thaiat-stat-lbl">Cục</span>
              <strong class="thaiat-stat-val">Cục ${keData.cuc}</strong>
            </div>
            <div class="thaiat-stat-item">
              <span class="thaiat-stat-lbl">Nguyên</span>
              <strong class="thaiat-stat-val">Nguyên ${keData.nguyen}</strong>
            </div>
            <div class="thaiat-stat-item">
              <span class="thaiat-stat-lbl">Kỷ Dư</span>
              <strong class="thaiat-stat-val">${keData.kyDu}</strong>
            </div>
            <div class="thaiat-stat-item">
              <span class="thaiat-stat-lbl">Tiết khí</span>
              <strong class="thaiat-stat-val">${currentChart.tietKhi}</strong>
            </div>
          </div>

          <!-- 2. Sub-bar Tứ Kể khi xem Trận Đồ (Đưa xuống dưới, bố trí đều 100% theo phương ngang) -->
          <div class="thaiat-ke-bar">
            <button type="button" class="ucc-view-btn ${currentKeType === 'gio' ? 'active' : ''}" data-ke="gio">Giờ</button>
            <button type="button" class="ucc-view-btn ${currentKeType === 'ngay' ? 'active' : ''}" data-ke="ngay">Ngày</button>
            <button type="button" class="ucc-view-btn ${currentKeType === 'thang' ? 'active' : ''}" data-ke="thang">Tháng</button>
            <button type="button" class="ucc-view-btn ${currentKeType === 'nam' ? 'active' : ''}" data-ke="nam">Năm</button>
            <button type="button" class="ucc-view-btn ${currentKeType === 'menh' ? 'active' : ''}" data-ke="menh">Mệnh</button>
          </div>

          <!-- 3. Personalized Strategic Strip (Thế Cờ & Bản Mệnh Riêng Của Đương Số) -->
          ${currentKeType !== 'menh' ? `
            <div class="thaiat-personal-strip ${querentRole === 'chu' ? 'role-chu-border' : 'role-khach-border'}">
              <div class="tps-row">
                <div class="tps-role-tag">
                  <span class="tps-tag-icon">${querentRole === 'chu' ? '🛡️' : '⚔️'}</span>
                  <strong>${querentRole === 'chu' ? 'Phe Chủ' : 'Phe Khách'}</strong>
                </div>
                <div class="tps-verdict">
                  ${luanData?.vai_ve_duong_so?.ketLuan || keData.tinhThe}
                </div>
              </div>
              <div class="tps-birth-row">
                <span class="tps-birth-label">🎯 Bản Mệnh [${qCanChi.canChi} - Cung ${qCanChi.chi}]:</span>
                <span class="tps-birth-stars ${isHungStar ? 'tps-stars-hung' : 'tps-stars-cat'}">
                  ${starStatusText}
                </span>
              </div>
            </div>
          ` : ''}

          <!-- 4. Bộ lọc 5 tầng thông tin (Grid 5 cột cân đối, không cuộn ngang) -->
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
        `)}
      </div>
    `;

    bindThaiAtEvents(keData, currentChart, luanData);

    if (prevScrollY !== null) {
      requestAnimationFrame(() => {
        const sc = container ? container.querySelector('.thaiat-view-wrap') : null;
        if (sc) {
          sc.scrollTop = prevScrollY;
        }
        if (container) {
          container.scrollTop = prevScrollY;
        }
        window.scrollTo({ top: prevScrollY, behavior: 'instant' });
      });
    }
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
    const qCanChi = getCanChiYear(querentBirthYear);
    const isQuerentPalace = (pos === qCanChi.chi);

    let advice = '💡 <strong>Chiến lược hành sự:</strong> Cung bình hòa, tiến thoái thuận theo thời cơ.';
    if (starsHere.includes('Thái Ất')) {
      advice = '👑 <strong>Chiến lược Thái Ất:</strong> Chúa tể ngự cung! Đại cát lợi, là trung tâm sinh khí và quyền lực tối cao.';
    } else if (starsHere.includes('Ngũ Phúc')) {
      advice = '✨ <strong>Chiến lược Ngũ Phúc:</strong> Đệ nhất cát thần chiếu rọi, giải trừ mọi hung hiểm, thích hợp mở đầu đại sự.';
    } else if (starsHere.includes('Chủ Đại Tướng')) {
      advice = '🛡️ <strong>Chiến lược Chủ Tướng:</strong> Lực lượng phòng thủ nội bộ vững chắc, thuận cho củng cố tổ chức và căn cơ.';
    } else if (starsHere.includes('Khách Đại Tướng')) {
      advice = '⚔️ <strong>Chiến lược Khách Tướng:</strong> Lực lượng tiến công sắc bén, thuận xuất chinh, mở rộng thị trường và đàm phán.';
    } else if (starsHere.includes('Thủy Kích')) {
      advice = '⚠️ <strong>Cảnh báo Thủy Kích:</strong> Cung vị bị sát thần kích phá, đề phòng va chạm giao thông hoặc bị đối thủ đánh úp.';
    } else if (starsHere.includes('Kế Thần')) {
      advice = '⚠️ <strong>Cảnh báo Kế Thần:</strong> Khí u ám bưng bít, cần đề phòng thông tin thất thiệt hoặc bất đồng ngầm.';
    } else if (starsHere.includes('Cờ Đỏ') || starsHere.includes('Cờ Đen')) {
      advice = '⚠️ <strong>Cảnh báo Kỳ Thần:</strong> Khí tượng biến động, dễ phát sinh tranh chấp hoặc trắc trở, cần đề phòng bất trắc.';
    }

    if (isQuerentPalace) {
      advice = `<div style="color:#f5b041; font-weight:800; margin-bottom:4px;">🎯 CUNG BẢN MỆNH CỦA BẠN (Tuổi ${qCanChi.canChi})</div>` + advice;
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
          <div><strong class="gen-chu-lbl">Chủ Tướng:</strong> Đại [${keData.generals.daiChu}] - Tham [${keData.generals.thamChu}]</div>
          <div><strong class="gen-khach-lbl">Khách Tướng:</strong> Đại [${keData.generals.daiKhach}] - Tham [${keData.generals.thamKhach}]</div>
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

  // ==========================================
  // LUẬN GIẢI CHUYÊN SÂU 15 PHÂN HỆ MODAL
  // ==========================================

  function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function formatInlineTags(str) {
    if (!str) return '';
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/★/g, '<span style="color:#f5b041;">★</span>')
      .replace(/▲/g, '<span style="color:#fb7185;">▲</span>')
      .replace(/⚔/g, '<span style="color:#38bdf8;">⚔</span>')
      .replace(/👑/g, '<span style="color:#f5b041;">👑</span>')
      .replace(/⚠️/g, '<span style="color:#ef4444;">⚠️</span>');
  }

  function formatMarkdownToHTML(md) {
    if (!md) return '';
    let html = '';
    const lines = md.split('\n');
    let inList = false;
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let trimmed = line.trim();
      if (!trimmed) {
        if (inList) { html += '</ul>'; inList = false; }
        continue;
      }
      if (trimmed.startsWith('===') || trimmed.startsWith('---')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += '<hr style="border:0; border-top:1px dashed rgba(245,176,65,0.25); margin:8px 0;">';
        continue;
      }
      if (trimmed.startsWith('[') && trimmed.includes(']') && /\[[IVXLCDM]+\./.test(trimmed)) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h4 style="color:#f5b041; margin:12px 0 4px; font-weight:800; font-size:12px;">${escapeHTML(trimmed)}</h4>`;
        continue;
      }
      if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        if (!inList) { html += '<ul style="margin:2px 0 6px 16px; padding:0; list-style-type:disc;">'; inList = true; }
        let content = trimmed.replace(/^[•\-\*]\s*/, '');
        html += `<li style="margin-bottom:3px;">${formatInlineTags(content)}</li>`;
        continue;
      }
      if (/^\d+\.\s+/.test(trimmed)) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<div style="font-weight:700; color:#38bdf8; margin:6px 0 2px;">${formatInlineTags(trimmed)}</div>`;
        continue;
      }
      if (inList) { html += '</ul>'; inList = false; }
      html += `<p style="margin:2px 0 4px;">${formatInlineTags(trimmed)}</p>`;
    }
    if (inList) html += '</ul>';
    return html;
  }

  function renderThaiAtAnalysisHTML(keData, chart, luan) {
    if (!luan) {
      return `
        <div class="thaiat-analysis-wrap" style="padding: 24px; text-align: center; color: var(--text-muted);">
          <p>Đang chuẩn bị dữ liệu luận giải Thái Ất 15 Phân Hệ...</p>
        </div>
      `;
    }
    const cungNature = (global.NetaThaiAtInterpreter && global.NetaThaiAtInterpreter.CUNG_NATURE) || {};
    const idx = luan.chi_so_dinh_luong || { diem_cat_khanh: 50, nguy_co_xung_dot: 30, nguy_co_thien_tai: 25, ty_le_chu: 50, ty_le_khach: 50 };

    const shouldShow = (cat) => {
      if (currentLuanFilter === 'all') return true;
      if (currentLuanFilter === 'daicuc' && ['daicuc'].includes(cat)) return true;
      if (currentLuanFilter === 'cachcuc' && ['cachcuc'].includes(cat)) return true;
      if (currentLuanFilter === 'tacthien' && ['tacthien'].includes(cat)) return true;
      if (currentLuanFilter === 'nhatdung' && ['nhatdung'].includes(cat)) return true;
      if (currentLuanFilter === 'canhgio' && ['canhgio'].includes(cat)) return true;
      return false;
    };

    let cards = '';

    // Card 0: [🎯 ĐỐI CHIẾU VAI VẾ & BẢN MỆNH NGƯỜI HỎI]
    if (luan.vai_ve_duong_so && (currentLuanFilter === 'all' || currentLuanFilter === 'daicuc')) {
      let isCol = collapsedSections['sec-0'];
      let vv = luan.vai_ve_duong_so;
      let bm = luan.doi_chieu_ban_menh;
      cards += `
        <div class="luan-section-card luan-card-personal" data-cat="daicuc">
          <div class="luan-section-header" onclick="window.NetaThaiAtView.toggleSection('sec-0')" style="background: rgba(245, 176, 65, 0.12);">
            <span style="color: #f5b041; font-weight: 800; font-size: 12px;">[🎯 ĐỐI CHIẾU VAI VẾ & BẢN MỆNH NGƯỜI HỎI]</span>
            <span class="luan-section-toggle">${isCol ? '▼' : '▲'}</span>
          </div>
          ${!isCol ? `
            <div class="luan-section-body">
              <div class="luan-sub-item">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
                  <div style="display:flex; align-items:center; gap:6px;">
                    <strong>Vai vế:</strong>
                    <span class="${vv.role === 'chu' ? 'luan-badge-cat' : 'luan-badge-khach'}">
                      ${vv.role === 'chu' ? '🛡️ Phe Chủ' : '⚔️ Phe Khách'}
                    </span>
                  </div>
                  <div style="font-size: 11.5px; font-weight: 800; color: ${vv.diemLoiThe >= 60 ? '#10b981' : (vv.diemLoiThe >= 40 ? '#f5b041' : '#f43f5e')};">
                    ${vv.diemLoiThe}/100 Lợi thế
                  </div>
                </div>
                <div class="luan-role-note">
                  <strong>Đặc trưng:</strong> ${vv.role === 'chu' ? 'Bên tại vị, phòng thủ, gia chủ, nhà tuyển dụng, bên cho vay, bị đơn' : 'Bên tiến công, xuất hành, ứng viên tuyển dụng, người đi vay, khởi kiện'}
                </div>
                <div style="font-size: 12.5px; font-weight: 700; color: #38bdf8; margin: 6px 0 4px;">★ ${vv.ketLuan}</div>
                <div style="margin: 4px 0 6px;">💡 <strong>Lời khuyên cốt tử:</strong> ${vv.loiKhuyen}</div>
                ${bm ? `
                  <div style="border-top: 1px dashed rgba(245,176,65,0.25); padding-top: 6px; margin-top: 6px;">
                    <div>• <strong>Bản Mệnh Đương Số:</strong> Tuổi ${bm.canChi} (Cung ${bm.cungDiaChi})</div>
                    <div>• <strong>Thần Vị Lâm Cung:</strong> <strong style="color: ${bm.mucDo.includes('Cát') ? '#10b981' : (bm.mucDo.includes('Hung') ? '#ef4444' : '#f5b041')};">${bm.stars.join(', ') || 'Bình hòa'}</strong> (${bm.mucDo})</div>
                    <div style="margin-top: 2px;">• <strong>Chiêm đoán:</strong> ${bm.danhGia}</div>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }

      // Card 1: [I. VẬN KHÍ THIÊN MỆNH - THÁI ẤT CHỦ TINH]
      if (shouldShow('daicuc')) {
        let ta = luan.cung_thai_at;
        let isCol = collapsedSections['sec-1'];
        cards += `
          <div class="luan-section-card" data-cat="daicuc">
            <div class="luan-section-header" onclick="window.NetaThaiAtView.toggleSection('sec-1')">
              <span>[I. VẬN KHÍ THIÊN MỆNH - THÁI ẤT CHỦ TINH]</span>
              <span class="luan-section-toggle">${isCol ? '▼' : '▲'}</span>
            </div>
            ${!isCol ? `
              <div class="luan-section-body">
                <div class="luan-sub-item">
                  <div class="luan-sub-title">Cung Ngự Trị: Cung ${ta.name} (Quẻ ${ta.que} - Hành ${ta.hanh} - Hướng ${ta.huong})</div>
                  <div>• <strong>Bản Thể Tượng:</strong> ${ta.tuong}</div>
                  <div>• <strong>Khí Vận:</strong> ${ta.khi_van}</div>
                  <div>• <strong>Cảnh Báo Sát:</strong> ${ta.hung_hoa}</div>
                </div>
              </div>
            ` : ''}
          </div>
        `;
      }

      // Card 2: [II. DỰ BÁO KHÍ TƯỢNG - ĐỊA HỌC BÁT PHONG]
      if (shouldShow('daicuc')) {
        let wf = luan.khi_tuong_bat_phong;
        let isCol = collapsedSections['sec-2'];
        cards += `
          <div class="luan-section-card" data-cat="daicuc">
            <div class="luan-section-header" onclick="window.NetaThaiAtView.toggleSection('sec-2')">
              <span>[II. DỰ BÁO KHÍ TƯỢNG - ĐỊA HỌC BÁT PHONG]</span>
              <span class="luan-section-toggle">${isCol ? '▼' : '▲'}</span>
            </div>
            ${!isCol ? `
              <div class="luan-section-body">
                <div class="luan-sub-item">
                  <div class="luan-sub-title">${wf.ten} (Hướng ${wf.huong})</div>
                  <div>• <strong>Diễn biến thời tiết:</strong> ${wf.khi_hau}</div>
                  <div>• <strong>Cảnh báo môi trường:</strong> ${wf.tai_bien}</div>
                </div>
              </div>
            ` : ''}
          </div>
        `;
      }

      // Card 3: [III. KIỂM ĐỊNH BIẾN DỊ THIÊN ĐỊA - TAM VÔ BIẾN TRẠNG]
      if (shouldShow('daicuc')) {
        let isCol = collapsedSections['sec-3'];
        let tamVoHtml = '';
        if (luan.tam_vo && luan.tam_vo.length > 0) {
          tamVoHtml = luan.tam_vo.map(v => `
            <div class="luan-sub-item" style="border-left: 2px solid #ef4444; padding-left: 6px; margin-bottom: 6px;">
              <div><span class="luan-badge-hung">${v.muc_do.toUpperCase()}</span> <strong>${v.ten}</strong></div>
              <div>- Cơ chế: ${v.hien_tuong}</div>
              <div>- Ứng nghiệm: ${v.canh_bao}</div>
            </div>
          `).join('');
        } else {
          tamVoHtml = '<div>✨ Bầu trời và mặt đất bình ổn, không xuất hiện biến dị Tam Vô (Khí số tuần hoàn thuận hòa).</div>';
        }

        cards += `
          <div class="luan-section-card" data-cat="daicuc">
            <div class="luan-section-header" onclick="window.NetaThaiAtView.toggleSection('sec-3')">
              <span>[III. KIỂM ĐỊNH BIẾN DỊ THIÊN ĐỊA - TAM VÔ BIẾN TRẠNG]</span>
              <span class="luan-section-toggle">${isCol ? '▼' : '▲'}</span>
            </div>
            ${!isCol ? `<div class="luan-section-body">${tamVoHtml}</div>` : ''}
          </div>
        `;
      }

      // Card 4: [IV. TOÁN PHÁP THÁI ẤT & ĐẠO CHỦ - KHÁCH CHIẾN LƯỢC]
      if (shouldShow('daicuc')) {
        let isCol = collapsedSections['sec-4'];
        let tt = luan.tam_toan;
        let ck = luan.dao_chu_khach;
        cards += `
          <div class="luan-section-card" data-cat="daicuc">
            <div class="luan-section-header" onclick="window.NetaThaiAtView.toggleSection('sec-4')">
              <span>[IV. TOÁN PHÁP THÁI ẤT & ĐẠO CHỦ - KHÁCH CHIẾN LƯỢC]</span>
              <span class="luan-section-toggle">${isCol ? '▼' : '▲'}</span>
            </div>
            ${!isCol ? `
              <div class="luan-section-body">
                <div class="thaiat-toan-grid" style="margin-bottom: 8px;">
                  <div class="thaiat-toan-box">
                    <div class="thaiat-toan-title">Toán Chủ</div>
                    <div class="thaiat-toan-num toan-c-chu">${tt.chu_toan.gia_tri}</div>
                    <div style="font-size: 8.5px; opacity: 0.8;">${tt.chu_toan.do_dai}</div>
                  </div>
                  <div class="thaiat-toan-box">
                    <div class="thaiat-toan-title">Toán Khách</div>
                    <div class="thaiat-toan-num toan-c-khach">${tt.khach_toan.gia_tri}</div>
                    <div style="font-size: 8.5px; opacity: 0.8;">${tt.khach_toan.do_dai}</div>
                  </div>
                  <div class="thaiat-toan-box">
                    <div class="thaiat-toan-title">Toán Định</div>
                    <div class="thaiat-toan-num toan-c-dinh">${tt.dinh_toan.gia_tri}</div>
                    <div style="font-size: 8.5px; opacity: 0.8;">${tt.dinh_toan.do_dai}</div>
                  </div>
                </div>
                <div>• <strong>Tương quan lực lượng:</strong> <strong style="color: #f5b041;">${ck.ket_luan}</strong></div>
                <div style="margin-top: 4px;">• <strong>Kế sách hành động:</strong> ${ck.chien_luoc}</div>
              </div>
            ` : ''}
          </div>
        `;
      }

      // Card 5: [V. MA TRẬN GIAO TRANH TỨ TƯỚNG]
      if (shouldShow('daicuc')) {
        let isCol = collapsedSections['sec-5'];
        let gt = luan.giao_tranh_tu_tuong;
        cards += `
          <div class="luan-section-card" data-cat="daicuc">
            <div class="luan-section-header" onclick="window.NetaThaiAtView.toggleSection('sec-5')">
              <span>[V. MA TRẬN GIAO TRANH TỨ TƯỚNG (GENERALS CLASH)]</span>
              <span class="luan-section-toggle">${isCol ? '▼' : '▲'}</span>
            </div>
            ${!isCol ? `
              <div class="luan-section-body">
                <div>• <strong>Chủ Tướng (${keData.generals.daiChu} - ${gt.hanh_chu}) vs Khách Tướng (${keData.generals.daiKhach} - ${gt.hanh_khach}):</strong></div>
                <div style="color: #38bdf8; margin: 2px 0 6px 10px;">=> ${gt.tuong_tac_chinh}</div>
                <div>• <strong>Nội bộ Bên Chủ:</strong> ${gt.noi_bo_chu}</div>
                <div>• <strong>Nội bộ Bên Khách:</strong> ${gt.noi_bo_khach}</div>
              </div>
            ` : ''}
          </div>
        `;
      }

      // Card 6: [VI. MA TRẬN NHẬN DIỆN CÁCH CỤC THÁI ẤT]
      if (shouldShow('cachcuc')) {
        let isCol = collapsedSections['sec-6'];
        let ccHtml = '';
        if (luan.cach_cuc_dac_biet && luan.cach_cuc_dac_biet.length > 0) {
          ccHtml = luan.cach_cuc_dac_biet.map((cc, i) => `
            <div class="luan-sub-item">
              <div style="font-weight: 700;">${i + 1}. <span class="${cc.loai.includes('Cát') ? 'luan-badge-cat' : 'luan-badge-hung'}">${cc.loai.toUpperCase()}</span> ${cc.ten}</div>
              <div style="margin-left: 10px; font-size: 10.5px;">- Dấu hiệu: ${cc.hien_tuong}</div>
              <div style="margin-left: 10px; font-size: 10.5px;">- Ý nghĩa: ${cc.anh_huong}</div>
            </div>
          `).join('');
        } else {
          ccHtml = '<div>(Bàn cờ không phạm các đại hung cách; thế trận diễn tiến bình ổn, không có đột biến xấu).</div>';
        }
        cards += `
          <div class="luan-section-card" data-cat="cachcuc">
            <div class="luan-section-header" onclick="window.NetaThaiAtView.toggleSection('sec-6')">
              <span>[VI. MA TRẬN NHẬN DIỆN CÁCH CỤC THÁI ẤT]</span>
              <span class="luan-section-toggle">${isCol ? '▼' : '▲'}</span>
            </div>
            ${!isCol ? `<div class="luan-section-body">${ccHtml}</div>` : ''}
          </div>
        `;
      }

      // Card 7: [VII. BỐ CỤC 12 CUNG CHỨC NĂNG]
      if (shouldShow('cachcuc')) {
        let isCol = collapsedSections['sec-7'];
        let pList = '';
        for (let cName in luan.thap_nhi_cung) {
          let cVal = luan.thap_nhi_cung[cName];
          pList += `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed rgba(245,176,65,0.15); padding: 3px 0;">
              <strong>${cName}:</strong>
              <span>Cung ${cVal.cung}</span>
            </div>
            <div style="font-size: 10px; color: #94a3b8; margin-bottom: 4px;">${cVal.y_nghia}</div>
          `;
        }
        cards += `
          <div class="luan-section-card" data-cat="cachcuc">
            <div class="luan-section-header" onclick="window.NetaThaiAtView.toggleSection('sec-7')">
              <span>[VII. BỐ CỤC 12 CUNG CHỨC NĂNG (THÁI ẤT MỆNH BÀN)]</span>
              <span class="luan-section-toggle">${isCol ? '▼' : '▲'}</span>
            </div>
            ${!isCol ? `<div class="luan-section-body">${pList}</div>` : ''}
          </div>
        `;
      }

      // Card 8: [VIII. TAM CƠ THẦN]
      if (shouldShow('cachcuc')) {
        let isCol = collapsedSections['sec-8'];
        let qc = keData.stars["Quân Cơ"] || "Kiền";
        let tc = keData.stars["Thần Cơ"] || "Cấn";
        let dan = keData.stars["Dân Cơ"] || "Khôn";
        cards += `
          <div class="luan-section-card" data-cat="cachcuc">
            <div class="luan-section-header" onclick="window.NetaThaiAtView.toggleSection('sec-8')">
              <span>[VIII. TAM CƠ THẦN (QUÂN CƠ - THẦN CƠ - DÂN CƠ)]</span>
              <span class="luan-section-toggle">${isCol ? '▼' : '▲'}</span>
            </div>
            ${!isCol ? `
              <div class="luan-section-body">
                <div>• <strong>Quân Cơ (Ban Lãnh Đạo Tối Cao):</strong> Cung ${qc} (${(cungNature[qc] && cungNature[qc].hanh) || 'Thổ'})</div>
                <div>• <strong>Thần Cơ (Bộ Máy Điều Hành):</strong> Cung ${tc} (${(cungNature[tc] && cungNature[tc].hanh) || 'Thổ'})</div>
                <div>• <strong>Dân Cơ (Quần Chúng / Khách Hàng):</strong> Cung ${dan} (${(cungNature[dan] && cungNature[dan].hanh) || 'Thổ'})</div>
              </div>
            ` : ''}
          </div>
        `;
      }

      // Card 9: [IX. KHẢO SÁT HỆ THỐNG THẦN SÁT KINH ĐIỂN]
      if (shouldShow('cachcuc')) {
        let isCol = collapsedSections['sec-9'];
        let starRows = '';
        for (let sName in luan.toan_bo_than_sat) {
          starRows += `<div style="margin-bottom: 4px;">• ${luan.toan_bo_than_sat[sName].y_nghia}</div>`;
        }
        cards += `
          <div class="luan-section-card" data-cat="cachcuc">
            <div class="luan-section-header" onclick="window.NetaThaiAtView.toggleSection('sec-9')">
              <span>[IX. KHẢO SÁT HỆ THỐNG THẦN SÁT KINH ĐIỂN]</span>
              <span class="luan-section-toggle">${isCol ? '▼' : '▲'}</span>
            </div>
            ${!isCol ? `<div class="luan-section-body">${starRows}</div>` : ''}
          </div>
        `;
      }

      // Card 10: [X. MA TRẬN HÓA KHÍ, NHỊ HỢP & LỤC XUNG]
      if (shouldShow('cachcuc')) {
        let isCol = collapsedSections['sec-10'];
        let trHtml = luan.ma_tran_hoa_khi.map(tr => `<div style="margin-bottom: 3px;">${tr}</div>`).join('');
        cards += `
          <div class="luan-section-card" data-cat="cachcuc">
            <div class="luan-section-header" onclick="window.NetaThaiAtView.toggleSection('sec-10')">
              <span>[X. MA TRẬN HÓA KHÍ, NHỊ HỢP & LỤC XUNG ĐỊA BÀN]</span>
              <span class="luan-section-toggle">${isCol ? '▼' : '▲'}</span>
            </div>
            ${!isCol ? `<div class="luan-section-body">${trHtml}</div>` : ''}
          </div>
        `;
      }

      // Card 11: [XI. PHƯỚC ĐỨC, CỬU TINH & THẦN QUÝ]
      if (shouldShow('cachcuc')) {
        let isCol = collapsedSections['sec-11'];
        cards += `
          <div class="luan-section-card" data-cat="cachcuc">
            <div class="luan-section-header" onclick="window.NetaThaiAtView.toggleSection('sec-11')">
              <span>[XI. PHƯỚC ĐỨC, CỬU TINH & THẦN QUÝ CHIẾU MỆNH]</span>
              <span class="luan-section-toggle">${isCol ? '▼' : '▲'}</span>
            </div>
            ${!isCol ? `
              <div class="luan-section-body">
                <div>• <strong>Cung Ngũ Phúc:</strong> Cung ${luan.ngu_phuc_cung} (Phúc thần giải trừ tai ách, tụ tài tụ đức)</div>
                <div style="margin-top: 4px;">• <strong>9 Sao Trực Phù:</strong> <strong style="color: #f5b041;">${luan.sao_truc_phu.ten}</strong> - ${luan.sao_truc_phu.luan_giai}</div>
                <div style="margin-top: 4px;">• <strong>Thần Quý Giáng Lâm:</strong> <strong style="color: #38bdf8;">${luan.than_quy.ten}</strong> - ${luan.than_quy.luan_giai}</div>
              </div>
            ` : ''}
          </div>
        `;
      }

      // Card 12: [XII. DỰ BÁO ỨNG KỲ & PHƯƠNG VỊ]
      if (shouldShow('cachcuc')) {
        let isCol = collapsedSections['sec-12'];
        let ub = luan.du_bao_ung_ky;
        cards += `
          <div class="luan-section-card" data-cat="cachcuc">
            <div class="luan-section-header" onclick="window.NetaThaiAtView.toggleSection('sec-12')">
              <span>[XII. DỰ BÁO ỨNG KỲ & PHƯƠNG VỊ KÍCH HOẠT]</span>
              <span class="luan-section-toggle">${isCol ? '▼' : '▲'}</span>
            </div>
            ${!isCol ? `
              <div class="luan-section-body">
                <div>• ${ub.phuong_cat_loi}</div>
                <div>• ${ub.phuong_xung_sat}</div>
                <div>• ${ub.thoi_diem_ung_nghiem}</div>
              </div>
            ` : ''}
          </div>
        `;
      }

      // Card 13: [XIII. BẢNG DỰ BÁO CÁT HUNG 12 THỜI THẦN]
      if (shouldShow('canhgio')) {
        let isCol = collapsedSections['sec-13'];
        let hourRows = luan.thoi_than_12_gio.map(h => {
          let badgeCls = 'luan-badge-binh';
          if (h.trang_thai.includes('Cát')) badgeCls = 'luan-badge-cat';
          else if (h.trang_thai.includes('Hung')) badgeCls = 'luan-badge-hung';

          let parts = h.gio.split(' ');
          let name = parts[0];
          let timeRange = parts.slice(1).join(' ').replace(/[()]/g, '');

          return `
            <tr>
              <td class="col-gio">
                <div class="hour-name">${name} <span class="hour-time">(${timeRange})</span></div>
                <div class="hour-hanh">Hành ${h.ngu_hanh}</div>
              </td>
              <td class="col-trangthai">
                <span class="${badgeCls}">${h.trang_thai}</span>
              </td>
              <td class="col-loikhuyen">${h.loi_khuyen}</td>
            </tr>
          `;
        }).join('');
        cards += `
          <div class="luan-section-card" data-cat="canhgio">
            <div class="luan-section-header" onclick="window.NetaThaiAtView.toggleSection('sec-13')">
              <span>[XIII. BẢNG DỰ BÁO CÁT HUNG 12 THỜI THẦN TRONG NGÀY]</span>
              <span class="luan-section-toggle">${isCol ? '▼' : '▲'}</span>
            </div>
            ${!isCol ? `
              <div class="luan-section-body" style="padding: 4px;">
                <table class="luan-hours-table">
                  <thead>
                    <tr>
                      <th style="width: 32%;">Thời Thần</th>
                      <th style="width: 22%;">Trạng thái</th>
                      <th style="width: 46%;">Chiến lược hành động</th>
                    </tr>
                  </thead>
                  <tbody>${hourRows}</tbody>
                </table>
              </div>
            ` : ''}
          </div>
        `;
      }

      // Card 14: [XIV. HƯỚNG DẪN TÁC CHIẾN CHUYÊN BIỆT 6 PHÂN HỆ ĐA NGÀNH]
      if (shouldShow('tacthien')) {
        let isCol = collapsedSections['sec-14'];
        let sc = luan.sau_phan_he_hanh_dong;
        cards += `
          <div class="luan-section-card" data-cat="tacthien">
            <div class="luan-section-header" onclick="window.NetaThaiAtView.toggleSection('sec-14')">
              <span>[XIV. HƯỚNG DẪN TÁC CHIẾN 6 PHÂN HỆ ĐA NGÀNH]</span>
              <span class="luan-section-toggle">${isCol ? '▼' : '▲'}</span>
            </div>
            ${!isCol ? `
              <div class="luan-section-body">
                <div class="luan-sub-item">
                  <div class="luan-sub-title">1. Quản Trị Doanh Nghiệp & Lãnh Đạo:</div>
                  <div>- Định hướng CEO: ${sc.doanh_nghiep.dinh_huong_ceo}</div>
                  <div>- Nhân sự & Bộ máy: ${sc.doanh_nghiep.van_hanh_nhan_su}</div>
                  <div>- Quản trị Rủi ro: ${sc.doanh_nghiep.kiem_soat_rui_ro}</div>
                </div>
                <div class="luan-sub-item">
                  <div class="luan-sub-title">2. Tài Chính, Chứng Khoán & M&A:</div>
                  <div>- Dòng tiền: ${sc.tai_chinh.chien_luoc_dong_tien}</div>
                  <div>- Chiến lược M&A: ${sc.tai_chinh.thao_tung_ma}</div>
                  <div>- Đầu tư: ${sc.tai_chinh.dau_tu_chung_khoan}</div>
                </div>
                <div class="luan-sub-item">
                  <div class="luan-sub-title">3. Pháp Lý, Tố Tụng & Tranh Chấp:</div>
                  <div>- Vị thế: ${sc.phap_ly.vi_the_to_tung}</div>
                  <div>- Giải pháp: ${sc.phap_ly.giai_phap_toi_uu}</div>
                  <div>- Phòng ngừa: ${sc.phap_ly.phong_ngua_phap_ly}</div>
                </div>
                <div class="luan-sub-item">
                  <div class="luan-sub-title">4. Dự Án, Xây Dựng & Bất Động Sản:</div>
                  <div>- Động thổ/Cất nóc: ${sc.bat_dong_san.dong_tho_cat_noc}</div>
                  <div>- Tiến độ: ${sc.bat_dong_san.tien_do_cong_trinh}</div>
                  <div>- Thanh khoản: ${sc.bat_dong_san.giao_dich_dia_oc}</div>
                </div>
                <div class="luan-sub-item">
                  <div class="luan-sub-title">5. Tiếp Thị & Launch Sản Phẩm Mới:</div>
                  <div>- Thời điểm launch: ${sc.marketing.thoi_diem_launch}</div>
                  <div>- Thông điệp: ${sc.marketing.thong_diep_truyen_thong}</div>
                  <div>- Kênh tiếp cận: ${sc.marketing.kenh_tiep_can}</div>
                </div>
                <div class="luan-sub-item">
                  <div class="luan-sub-title">6. Y Tế, Sức Khỏe & An Dưỡng:</div>
                  <div>- Cảnh báo: ${sc.y_te.canh_bao_suc_khoe}</div>
                  <div>- Phòng ngừa dịch bệnh: ${sc.y_te.phong_ngua_dich_benh}</div>
                  <div>- Tinh thần: ${sc.y_te.an_duong_tinh_than}</div>
                </div>
              </div>
            ` : ''}
          </div>
        `;
      }

      // Card 15: [XV. HƯỚNG DẪN CHI TIẾT 7 SỰ VỤ ĐỜI SỐNG HÀNG NGÀY]
      if (shouldShow('nhatdung')) {
        let isCol = collapsedSections['sec-15'];
        let ds = luan.doi_song_hang_ngay;
        let dsItems = Object.keys(ds).map((k, idx2) => {
          let item = ds[k];
          return `
            <div class="luan-sub-item" style="border-bottom: 1px dashed rgba(245,176,65,0.15); padding-bottom: 6px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <span class="luan-sub-title">${idx2 + 1}. ${item.tieu_de}</span>
                <span class="${item.trang_thai.includes('Cát') ? 'luan-badge-cat' : 'luan-badge-hung'}">${item.xac_suat_thanh_cong}%</span>
              </div>
              <div>• <strong>Dụng thần:</strong> ${item.dung_than}</div>
              <div>• <strong>Trạng thái:</strong> [${item.trang_thai}]</div>
              <div>• <strong>Phân tích:</strong> ${item.danh_gia_chuyen_sau}</div>
              <div>• <strong>Hành động:</strong> ${item.huong_dan_hanh_dong}</div>
              <div>• <strong>Giờ vàng:</strong> <strong style="color: #f5b041;">${item.khung_gio_hoang_kim}</strong></div>
            </div>
          `;
        }).join('');

        cards += `
          <div class="luan-section-card" data-cat="nhatdung">
            <div class="luan-section-header" onclick="window.NetaThaiAtView.toggleSection('sec-15')">
              <span>[XV. HƯỚNG DẪN 7 SỰ VỤ ĐỜI SỐNG (NHẬT DỤNG)]</span>
              <span class="luan-section-toggle">${isCol ? '▼' : '▲'}</span>
            </div>
            ${!isCol ? `<div class="luan-section-body">${dsItems}</div>` : ''}
          </div>
        `;
      }
    return `
      <div class="thaiat-analysis-wrap">
        <!-- Header / Meta Bar (Bát Tự Uniform) -->
        <div class="thaiat-report-meta-bar">
          <div style="font-weight: 800; font-size: 0.92rem; color: var(--gold-glow, #f5b041); display: flex; align-items: center; gap: 6px;">
            <span>📜</span> LUẬN GIẢI CHUYÊN SÂU THÁI ẤT · ${(keData?.keName || '').toUpperCase()}
          </div>
          <div class="neta-report-mode-toggle">
            <button type="button" class="neta-mode-pill ${currentReportMode === 'standard' ? 'active' : ''}" id="btn-thaiat-mode-standard" title="Bản tính toán toán học 100% offline">
              📜 Bản Gốc
            </button>
            <button type="button" class="neta-mode-pill ${currentReportMode === 'ai' ? 'active' : ''}" id="btn-thaiat-mode-ai" title="Bản trau chuốt học thuật bởi Gemini AI">
              ${isAiPolishing ? '⏳ Đang Trau Chuốt...' : '✨ Bản AI'}
            </button>
            <button type="button" class="neta-mode-pill" id="thaiat-btn-copy-luan" title="Sao chép toàn bộ văn bản">
              📋 Sao chép
            </button>
          </div>
        </div>

        ${currentReportMode === 'ai' ? `
          <!-- Chế độ Trau Chuốt AI -->
          ${isAiPolishing ? `
            <div class="neta-inline-ai-loading">
              <div class="luan-loading-spinner" style="width: 28px; height: 28px; border-width: 3px; margin: 0 auto 12px;"></div>
              <div style="font-weight: 700; color: var(--gold-primary, #f5b041); font-size: 13px;">
                ${aiLoadingStepText || 'Đang tiến hành kết nối Gemini AI trau chuốt văn phong Thái Ất...'}
              </div>
              <div style="font-size: 11px; opacity: 0.75; margin-top: 4px;">
                Áp dụng Rào chắn 4 lớp bảo toàn số liệu & cấu trúc 15 phân hệ.
              </div>
            </div>
          ` : ''}

          ${aiErrorMessage ? `
            <div style="background: rgba(239, 68, 68, 0.12); border: 1.5px solid #ef4444; border-radius: 8px; padding: 12px; margin: 12px 0; color: #dc2626; font-size: 12px; line-height: 1.5;">
              <div><strong>⚠️ Lỗi kết nối AI:</strong> ${aiErrorMessage}</div>
              <div style="margin-top: 8px; display: flex; gap: 8px;">
                <button type="button" class="neta-mode-pill active" id="btn-thaiat-retry-ai">🔄 Thử Lại</button>
                <button type="button" class="neta-mode-pill" id="btn-thaiat-back-standard-from-err">↩️ Về Bản Gốc</button>
              </div>
            </div>
          ` : ''}

          ${aiPolishedText ? `
            <div class="neta-polished-status-bar">
              <span>✨ Bản Luận Giải Đã Được Trau Chuốt Học Thuật Bởi Gemini AI</span>
              <button type="button" class="neta-btn-inline-back" id="btn-thaiat-back-standard">↩️ Xem Bản Gốc</button>
            </div>
            <div class="thaiat-full-report-content neta-drop-cap" style="font-size: 0.88rem; line-height: 1.75; color: var(--text-color, #f8fafc); background: rgba(20, 2, 5, 0.7); border: 1px solid rgba(245, 176, 65, 0.25); border-radius: 8px; padding: 14px; white-space: pre-wrap;">
              ${formatMarkdownToHTML(aiPolishedText)}
            </div>
          ` : (!isAiPolishing && !aiErrorMessage ? `
            <div style="text-align: center; padding: 36px 16px; color: var(--text-muted); background: rgba(20, 2, 5, 0.5); border-radius: 8px; border: 1px dashed rgba(245, 176, 65, 0.25); margin: 12px 0;">
              <p style="margin-bottom: 12px; font-size: 13px;">Chưa kích hoạt trau chuốt văn phong AI cho quẻ Thái Ất này.</p>
              <button type="button" class="neta-mode-pill active" id="btn-thaiat-trigger-ai" style="padding: 6px 16px; font-size: 12px;">
                ✨ Bắt đầu Trau Chuốt Học Thuật (AI)
              </button>
            </div>
          ` : '')}
        ` : `
          <!-- Chế độ Bản Gốc (Toán Học & Quy Chuẩn 15 Phân Hệ) -->
          <!-- 1. Quantitative Dashboard -->
          <div class="luan-dashboard-grid">
            <div class="luan-metric-card">
              <div class="luan-metric-num" style="color: ${idx.diem_cat_khanh >= 70 ? '#10b981' : (idx.diem_cat_khanh >= 50 ? '#f5b041' : '#f43f5e')};">${idx.diem_cat_khanh}</div>
              <div class="luan-metric-label">Điểm Cát Khánh</div>
            </div>
            <div class="luan-metric-card">
              <div class="luan-metric-num" style="color: ${idx.ty_le_chu >= idx.ty_le_khach ? '#10b981' : '#f43f5e'};">${idx.ty_le_chu}% : ${idx.ty_le_khach}%</div>
              <div class="luan-metric-label">Tương Quan Lực Lượng</div>
            </div>
            <div class="luan-metric-card">
              <div class="luan-metric-num" style="color: ${idx.nguy_co_xung_dot >= 70 ? '#ef4444' : '#38bdf8'};">${idx.nguy_co_xung_dot}</div>
              <div class="luan-metric-label">Nguy Cơ Xung Đột</div>
            </div>
            <div class="luan-metric-card">
              <div class="luan-metric-num" style="color: ${idx.nguy_co_thien_tai >= 70 ? '#ef4444' : '#c084fc'};">${idx.nguy_co_thien_tai}</div>
              <div class="luan-metric-label">Nguy Cơ Môi Trường</div>
            </div>
          </div>

          <!-- Force Balance Progress -->
          <div class="luan-force-bar-wrap">
            <div class="luan-force-labels">
              <span class="force-lbl-chu">Bên Chủ: ${idx.ty_le_chu}%</span>
              <span class="force-lbl-khach">Bên Khách: ${idx.ty_le_khach}%</span>
            </div>
            <div class="luan-force-bar-track">
              <div class="luan-force-bar-fill" style="width: ${idx.ty_le_chu}%;"></div>
            </div>
          </div>

          <!-- 2. Fast Filter Pills -->
          <div class="luan-pills-bar">
            <button type="button" class="luan-pill-btn ${currentLuanFilter === 'all' ? 'active' : ''}" data-filter="all">Tất cả (15)</button>
            <button type="button" class="luan-pill-btn ${currentLuanFilter === 'daicuc' ? 'active' : ''}" data-filter="daicuc">Đại Cục & Toán</button>
            <button type="button" class="luan-pill-btn ${currentLuanFilter === 'cachcuc' ? 'active' : ''}" data-filter="cachcuc">Cách Cục & Sao</button>
            <button type="button" class="luan-pill-btn ${currentLuanFilter === 'tacthien' ? 'active' : ''}" data-filter="tacthien">6 Ngành Tác Chiến</button>
            <button type="button" class="luan-pill-btn ${currentLuanFilter === 'nhatdung' ? 'active' : ''}" data-filter="nhatdung">7 Sự Vụ Đời Sống</button>
            <button type="button" class="luan-pill-btn ${currentLuanFilter === 'canhgio' ? 'active' : ''}" data-filter="canhgio">12 Canh Giờ</button>
          </div>

          <!-- 3. Cards / Accordion Content -->
          <div class="luan-content-cards">
            ${cards}
          </div>
        `}
      </div>
    `;
  }

  function toggleSection(secId) {
    collapsedSections[secId] = !collapsedSections[secId];
    renderThaiAt(true);
  }

  function setLuanMode(mode) {
    currentReportMode = mode;
    renderThaiAt(true);
  }

  function copyLuanReport(text) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Đã sao chép toàn bộ báo cáo Thái Ất vào bộ nhớ tạm!');
      }).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Đã sao chép báo cáo vào bộ nhớ tạm!');
    } catch (e) {
      alert('Không thể sao chép văn bản tự động.');
    }
  }

  function showToast(msg) {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2500);
    } else {
      alert(msg);
    }
  }

  function triggerAiPolish(chart, keData) {
    const gemini = global.NetaGeminiService;
    if (!gemini) {
      isAiPolishing = false;
      currentReportMode = 'ai';
      aiErrorMessage = 'Dịch vụ AI chưa sẵn sàng trên ứng dụng.';
      renderThaiAt();
      return;
    }
    const apiKey = (gemini.getActiveKey && gemini.getActiveKey()) || '';
    if (!apiKey) {
      isAiPolishing = false;
      currentReportMode = 'ai';
      aiErrorMessage = 'Chưa cài đặt Gemini API Key. Bạn có thể cài đặt trong mục Trải Bài Tarot hoặc Cài Đặt.';
      renderThaiAt();
      return;
    }

    isAiPolishing = true;
    currentReportMode = 'ai';
    aiErrorMessage = null;
    aiLoadingStepText = 'Đang trích xuất toàn văn bản thảo 15 phân hệ...';
    renderThaiAt();

    const rawReport = global.NetaThaiAtInterpreter.generateFullReportText(chart, currentKeType);
    const prompt = global.NetaThaiAtInterpreter.buildAIPrompt(rawReport);

    aiLoadingStepText = 'Đang gửi bản thảo sang Gemini AI biên tập...';
    renderThaiAt();

    gemini.callGeminiCascade(prompt, apiKey, {
      systemInstruction: "Bạn là Tổng Biên Tập Học Thuật kiêm Chuyên Gia Luận Giải Tối Cao về Thái Ất Thần Kinh. Bảo toàn 100% cấu trúc 15 phân mục [I.] đến [XV.], giữ nguyên số liệu, tuân thủ Rule 9 và Rule 12.",
      temperature: 0.3
    }).then(res => {
      isAiPolishing = false;
      const text = (res && res.text) ? res.text : (typeof res === 'string' ? res : '');
      if (text) {
        const audit = global.NetaThaiAtInterpreter.validateFactualStructure(text);
        if (audit.isValid) {
          aiPolishedText = text;
          currentReportMode = 'ai';
          aiErrorMessage = null;
        } else {
          aiPolishedText = null;
          currentReportMode = 'standard';
          aiErrorMessage = `AI không đạt chuẩn kiểm toán cấu trúc: ${audit.reason}. Đã tự động giữ bản gốc để bảo toàn dữ liệu.`;
        }
      } else {
        aiPolishedText = null;
        currentReportMode = 'standard';
        aiErrorMessage = (res && res.error) || 'Không nhận được văn bản phản hồi từ máy chủ Gemini.';
      }
      renderThaiAt();
    }).catch(err => {
      isAiPolishing = false;
      currentReportMode = 'standard';
      aiErrorMessage = 'Lỗi kết nối AI: ' + (err.message || 'Không thể trau chuốt');
      renderThaiAt();
    });
  }

  function dismissAiError() {
    aiErrorMessage = null;
    renderThaiAt();
  }

  // ==============================================================================
  // CÁC HÀM RENDER & EVENT BINDING CHO PHONG THỦY THÁI ẤT THẦN KINH
  // ==============================================================================
  function renderTrachCatTimingContent(keData, taskType) {
    if (!global.NetaThaiAtFengShuiEngine) return '';
    const res = global.NetaThaiAtFengShuiEngine.evaluateFengShuiTiming(keData, taskType);
    return `
      <div style="margin-bottom: 8px; background: rgba(245, 176, 65, 0.1); border-left: 3px solid #f5b041; padding: 6px 8px; border-radius: 0 4px 4px 0; font-size: 10.5px;">
        <strong style="color: #fef08a;">Nguyên tắc trạch cát:</strong>
        <p style="margin: 2px 0 0; color: #cbd5e1; line-height: 1.35;">${res.taskGuide}</p>
      </div>
      <div style="display: flex; flex-direction: column; gap: 5px;">
        ${res.evaluatedHours.map(h => `
          <div class="thaiat-tc-hour-card" style="background: rgba(30, 6, 12, 0.85); border: 1px solid rgba(245, 176, 65, 0.2); border-radius: 5px; padding: 6px 8px; display: flex; flex-direction: column; gap: 2px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong style="color: #fef08a; font-size: 11px;">${h.gio}</strong>
              <span class="fs-badge ${h.suitBadge}">${h.suitLevel}</span>
            </div>
            <div style="color: #cbd5e1; font-size: 10px; line-height: 1.35;">${h.note}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderThaiAtFengShuiHTML(keData, chart) {
    if (!global.NetaThaiAtFengShuiEngine) {
      return `
        <div class="thaiat-fengshui-wrap">
          <div class="fs-card" style="text-align: center; padding: 24px 12px;">
            <p style="color: #ef4444; font-weight: 800;">Hệ thống Thái Ất Phong Thủy Engine chưa sẵn sàng. Vui lòng tải lại trang.</p>
          </div>
        </div>
      `;
    }

    const fsEngine = global.NetaThaiAtFengShuiEngine;
    const isDuong = (currentFsSubMode === 'duong_trach');

    let asm = null;
    if (isDuong) {
      asm = fsEngine.assessDuongTrach(
        chart,
        currentFsSittingDeg,
        currentFsPropertyType,
        (currentKeType === 'gio' ? 'Kể Giờ' : 'Kể Năm'),
        querentBirthYear,
        (currentIsMale ? 'Nam' : 'Nữ')
      );
    } else {
      asm = fsEngine.assessAmTrach(
        chart,
        currentFsSittingDeg,
        currentFsLaiLongDeg,
        currentFsThuyKhauDeg,
        (currentKeType === 'gio' ? 'Kể Giờ' : 'Kể Năm')
      );
    }

    const micro = fsEngine.analyzeDegreeMicro(currentFsSittingDeg);
    const pk = micro.phanKim;
    const xsl = micro.xuyenSonLong;
    const diag = micro.microDiagnostic;

    let voidBadgeClass = 'fs-badge-great';
    let voidBadgeText = '✅ CHÍNH TUYẾN THUẦN KHÍ';
    if (diag.isDaiKhongVong) {
      voidBadgeClass = 'fs-badge-critical';
      voidBadgeText = '🚨 ĐẠI KHÔNG VONG (Cực Hung)';
    } else if (diag.isTieuKhongVong) {
      voidBadgeClass = 'fs-badge-warn';
      voidBadgeText = '⚠️ TIỂU KHÔNG VONG (Lệch Khí)';
    }

    const score = isDuong ? asm.diemPhongThuyTongThe : asm.tongDiemAmTrach;
    let scoreBadgeClass = 'fs-badge-normal';
    let scoreBadgeText = 'BÌNH HÒA';
    if (score >= 85) { scoreBadgeClass = 'fs-badge-great'; scoreBadgeText = 'ĐẠI CÁT ĐẮC VẬN'; }
    else if (score >= 70) { scoreBadgeClass = 'fs-badge-good'; scoreBadgeText = 'KHÁ TỐT BÌNH AN'; }
    else if (score >= 50) { scoreBadgeClass = 'fs-badge-warn'; scoreBadgeText = 'TRUNG BÌNH CẦN TIẾT CHẾ'; }
    else { scoreBadgeClass = 'fs-badge-critical'; scoreBadgeText = 'HUNG HIỂM CẦN HÓA GIẢI'; }

    return `
      <div class="thaiat-fengshui-wrap">
        <!-- Sub-nav bar: Dương Trạch vs Âm Trạch -->
        <div class="fs-subnav-bar">
          <div class="fs-subnav-pill">
            <button type="button" class="fs-subnav-btn ${isDuong ? 'active' : ''}" id="btn-thaiat-fs-mode-duong" title="Khảo sát Nhà ở, Biệt thự, Căn hộ, Văn phòng, Nhà xưởng">
              🏡 Dương Trạch
            </button>
            <button type="button" class="fs-subnav-btn ${!isDuong ? 'active' : ''}" id="btn-thaiat-fs-mode-am" title="Khảo sát Huyệt mộ, Khu lăng mộ, Nghĩa trang tổ tộc">
              🪦 Âm Trạch (Mộ Phần)
            </button>
          </div>
        </div>

        <!-- 5-Action Buttons Bar -->
        <div class="fs-actions-bar">
          <button type="button" class="fs-action-btn" id="btn-thaiat-fs-essay" title="Xem Báo Cáo Học Thuật Toàn Diện">
            📜 Báo Cáo ${isDuong ? '8 Tầng' : '9 Tầng'}
          </button>
          <button type="button" class="fs-action-btn" id="btn-thaiat-fs-trachcat" title="Trạch Cát 12 Thời Thần">
            ⏳ Trạch Cát
          </button>
          <button type="button" class="fs-action-btn" id="btn-thaiat-fs-download" title="Tải File Báo Cáo .md">
            💾 Tải .md
          </button>
          <button type="button" class="fs-action-btn" id="btn-thaiat-fs-ai" title="AI Trau Chuốt & Tinh Chỉnh">
            ✨ Biên Tập AI
          </button>
          <button type="button" class="fs-action-btn" id="btn-thaiat-fs-copy" title="Sao Chép Toàn Bộ Nội Dung">
            📋 Sao Chép
          </button>
        </div>

        <!-- Compass & Parameters Control Card -->
        <div class="fs-card">
          <div class="fs-card-header">
            <div class="fs-card-title">
              <span>🧭</span>
              <span>ĐỊNH VỊ TỌA HƯỚNG LA KINH THÁI ẤT</span>
            </div>
            <div class="fs-badge ${voidBadgeClass}">${voidBadgeText}</div>
          </div>

          <div class="fs-compass-ctrl">
            <div class="fs-slider-row">
              <span style="font-size: 10px; font-weight: 700; color: #94a3b8; width: 62px;">${isDuong ? 'TỌA SƠN' : 'TỌA HUYỆT'}:</span>
              <input type="range" class="fs-slider" id="thaiat-fs-deg-slider" min="0" max="359.5" step="0.5" value="${currentFsSittingDeg}">
              <input type="number" class="fs-deg-input" id="thaiat-fs-deg-input" min="0" max="359.9" step="0.1" value="${currentFsSittingDeg.toFixed(1)}">
              <span style="font-size: 11px; font-weight: 800; color: #fef08a;">°</span>
            </div>

            <div class="fs-readout-row">
              <div class="fs-readout-item">
                <span class="fs-readout-lbl">${isDuong ? 'LƯNG NHÀ (TỌA SƠN)' : 'LƯNG MỘ (TỌA HUYỆT)'}</span>
                <span class="fs-readout-val">Sơn ${asm.sittingMountain || asm.sitting_mountain} (${asm.sittingCung || asm.sitting_cung})</span>
              </div>
              <div class="fs-readout-item">
                <span class="fs-readout-lbl">${isDuong ? 'MẶT TIỀN (HƯỚNG NHÀ)' : 'BIA MỘ (HƯỚNG MỘ)'}</span>
                <span class="fs-readout-val">Sơn ${asm.facingMountain || asm.facing_mountain} (${asm.facingCung || asm.facing_cung})</span>
              </div>
            </div>

            ${isDuong ? `
              <div style="display: flex; gap: 8px; align-items: center; margin-top: 2px;">
                <span style="font-size: 10px; font-weight: 700; color: #94a3b8; white-space: nowrap;">LOẠI BĐS:</span>
                <select id="thaiat-fs-property-type" style="flex: 1; background: rgba(10, 1, 3, 0.9); border: 1px solid rgba(245, 176, 65, 0.4); border-radius: 4px; color: #fef08a; padding: 4px 6px; font-size: 10.5px; font-weight: 700;">
                  <option value="Biệt thự" ${currentFsPropertyType === 'Biệt thự' ? 'selected' : ''}>Biệt thự nhà vườn</option>
                  <option value="Nhà phố" ${currentFsPropertyType === 'Nhà phố' ? 'selected' : ''}>Nhà phố liền kề</option>
                  <option value="Căn hộ chung cư" ${currentFsPropertyType === 'Căn hộ chung cư' ? 'selected' : ''}>Căn hộ chung cư</option>
                  <option value="Văn phòng công ty" ${currentFsPropertyType === 'Văn phòng công ty' ? 'selected' : ''}>Văn phòng điều hành</option>
                  <option value="Nhà xưởng sản xuất" ${currentFsPropertyType === 'Nhà xưởng sản xuất' ? 'selected' : ''}>Nhà xưởng công nghiệp</option>
                </select>
              </div>
            ` : `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 2px;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span style="font-size: 9.5px; font-weight: 700; color: #94a3b8;">LAI LONG:</span>
                  <input type="number" id="thaiat-fs-lailong-input" min="0" max="360" value="${currentFsLaiLongDeg}" style="width: 50px; background: rgba(10, 1, 3, 0.9); border: 1px solid rgba(245, 176, 65, 0.4); border-radius: 4px; color: #fef08a; font-size: 10px; text-align: center; padding: 2px;">
                  <span style="font-size: 10px; color: #fef08a;">°</span>
                </div>
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span style="font-size: 9.5px; font-weight: 700; color: #94a3b8;">THỦY KHẨU:</span>
                  <input type="number" id="thaiat-fs-thuykhau-input" min="0" max="360" value="${currentFsThuyKhauDeg}" style="width: 50px; background: rgba(10, 1, 3, 0.9); border: 1px solid rgba(245, 176, 65, 0.4); border-radius: 4px; color: #fef08a; font-size: 10px; text-align: center; padding: 2px;">
                  <span style="font-size: 10px; color: #fef08a;">°</span>
                </div>
              </div>
            `}

            <!-- Vi Phân 120 Phân Kim & 72 Xuyên Sơn Long Badge -->
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; background: rgba(255, 255, 255, 0.04); border-radius: 4px; padding: 4px 6px;">
              <span style="color: #cbd5e1;">Phân kim #${pk.index}: <strong style="color: #fef08a;">${pk.canChi}</strong> [${pk.phanLoai}]</span>
              <span style="color: #94a3b8;">Long #${xsl.index}: ${xsl.tinhChatLong}</span>
            </div>
          </div>
        </div>

        <!-- Master Score & Balance Matrix Card -->
        <div class="fs-card">
          <div class="fs-card-header">
            <div class="fs-card-title">
              <span>📊</span>
              <span>${isDuong ? 'TỔNG QUAN KHÍ TRƯỜNG DƯƠNG TRẠCH' : 'TỔNG QUAN PHÚC ĐỨC ÂM PHẦN'}</span>
            </div>
            <div class="fs-badge ${scoreBadgeClass}">${scoreBadgeText}</div>
          </div>

          <div class="fs-master-score">
            <div class="fs-score-circle">
              <span class="fs-score-num">${score}</span>
              <span class="fs-score-unit">/ 100 ĐIỂM</span>
            </div>
            <div class="fs-master-details">
              <div class="fs-master-thetran">${isDuong ? asm.theTranChuKhach : asm.danhGiaLongHuyet}</div>
              <div class="fs-master-bars">
                ${isDuong ? `
                  <div class="fs-bar-row">
                    <span class="fs-bar-lbl">🛡️ Nhân Đinh (Chủ):</span>
                    <div class="fs-bar-track"><div class="fs-bar-fill fs-bar-fill-chu" style="width: ${asm.diemNhanDinhSucKhoe}%;"></div></div>
                    <span class="fs-bar-val">${asm.diemNhanDinhSucKhoe}</span>
                  </div>
                  <div class="fs-bar-row">
                    <span class="fs-bar-lbl">⚔️ Tài Lộc (Khách):</span>
                    <div class="fs-bar-track"><div class="fs-bar-fill fs-bar-fill-khach" style="width: ${asm.diemTaiLocNgoaiGiao}%;"></div></div>
                    <span class="fs-bar-val">${asm.diemTaiLocNgoaiGiao}</span>
                  </div>
                ` : `
                  <div class="fs-bar-row">
                    <span class="fs-bar-lbl">✨ Phúc Khí Âm Đức:</span>
                    <div class="fs-bar-track"><div class="fs-bar-fill fs-bar-fill-phuc" style="width: ${asm.diemAmDucPhucKhi}%;"></div></div>
                    <span class="fs-bar-val">${asm.diemAmDucPhucKhi}</span>
                  </div>
                  <div class="fs-bar-row">
                    <span class="fs-bar-lbl">📜 Hậu Duệ Khoa Bảng:</span>
                    <div class="fs-bar-track"><div class="fs-bar-fill fs-bar-fill-khach" style="width: ${asm.diemHauDueKhoaBang}%;"></div></div>
                    <span class="fs-bar-val">${asm.diemHauDueKhoaBang}</span>
                  </div>
                  <div class="fs-bar-row">
                    <span class="fs-bar-lbl">🪦 An Lành Cốt Tủy:</span>
                    <div class="fs-bar-track"><div class="fs-bar-fill fs-bar-fill-an" style="width: ${asm.diemAnLanhHaiCot}%;"></div></div>
                    <span class="fs-bar-val">${asm.diemAnLanhHaiCot}</span>
                  </div>
                `}
              </div>
            </div>
          </div>
          <div style="font-size: 10px; color: #cbd5e1; line-height: 1.4; border-top: 1px dashed rgba(245, 176, 65, 0.2); padding-top: 5px;">
            ${isDuong ? asm.luanDoanTongThe : `Địa thế huyệt mộ kết hợp mạch khí Lai Long và dòng chảy Thủy Khẩu tạo nên trường khí ${score >= 70 ? 'tụ khí tàng phong ấm áp khô ráo' : 'cần được kè chắn và tiêu thoát nước ngầm kỹ lưỡng'}.`}
          </div>
        </div>

        <!-- Key Cung Positions Grid -->
        <div class="fs-chips-grid">
          <div class="fs-chip">
            <span class="fs-chip-icon">★</span>
            <span class="fs-chip-name">Thái Ất:</span>
            <span class="fs-chip-val">Cung ${asm.cungThaiAt}</span>
          </div>
          <div class="fs-chip">
            <span class="fs-chip-icon">★</span>
            <span class="fs-chip-name">Ngũ Phúc:</span>
            <span class="fs-chip-val">Cung ${asm.cungNguPhuc}</span>
          </div>
          <div class="fs-chip">
            <span class="fs-chip-icon">★</span>
            <span class="fs-chip-name">Văn Xương:</span>
            <span class="fs-chip-val">Cung ${asm.cungVanXuong}</span>
          </div>
          <div class="fs-chip">
            <span class="fs-chip-icon">★</span>
            <span class="fs-chip-name">Thần Hợp:</span>
            <span class="fs-chip-val">Cung ${asm.cungThanHop}</span>
          </div>
          <div class="fs-chip" style="border-color: rgba(239, 68, 68, 0.4);">
            <span class="fs-chip-icon" style="color: #ef4444;">▲</span>
            <span class="fs-chip-name" style="color: #fca5a5;">Thủy Kích:</span>
            <span class="fs-chip-val" style="color: #ef4444;">Cung ${asm.cungThuyKich}</span>
          </div>
          <div class="fs-chip" style="border-color: rgba(245, 158, 11, 0.4);">
            <span class="fs-chip-icon" style="color: #f59e0b;">▲</span>
            <span class="fs-chip-name" style="color: #fde047;">Kế Thần:</span>
            <span class="fs-chip-val" style="color: #f59e0b;">Cung ${asm.cungKeThan}</span>
          </div>
        </div>

        ${isDuong ? `
          <!-- CARD: 8 Phân Khu Công Năng Kiến Trúc -->
          <div class="fs-card">
            <div class="fs-card-header">
              <div class="fs-card-title">
                <span>🏛️</span>
                <span>QUY HOẠCH 8 PHÂN KHU CÔNG NĂNG KIẾN TRÚC</span>
              </div>
              <span style="font-size: 9.5px; color: #94a3b8;">Zoning Architecture</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${asm.zoningList.map(z => `
                <div class="fs-zoning-item">
                  <div class="fs-zoning-top">
                    <span class="fs-zoning-title">${z.tenKhuVuc}</span>
                    <span class="fs-badge ${z.trangThaiKhi.includes('Đại Cát') ? 'fs-badge-great' : (z.trangThaiKhi.includes('Ép Chế') ? 'fs-badge-critical' : 'fs-badge-good')}">${z.trangThaiKhi}</span>
                  </div>
                  <div class="fs-zoning-desc"><strong>Vị trí:</strong> Cung ${z.cungThaiAt} (${z.huongDiaLy} - Hành ${z.nguHanhKhuVuc})</div>
                  <div class="fs-zoning-desc"><strong>Bố trí:</strong> ${z.chucNangPhuHop}</div>
                  <div class="fs-zoning-remedy">💡 <strong>Giải pháp:</strong> ${z.giaiPhapKienTruc}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- CARD: 5 Kỹ Thuật Vật Lý Kiến Trúc & Vi Khí Hậu -->
          <div class="fs-card">
            <div class="fs-card-header">
              <div class="fs-card-title">
                <span>🌿</span>
                <span>VẬT LÝ KIẾN TRÚC & VI KHÍ HẬU (KHÔNG MÊ TÍN)</span>
              </div>
              <span style="font-size: 9.5px; color: #86efac; font-weight: 700;">Rule 9 & Rule 12</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${asm.architecturalRemedies.map((r, idx) => `
                <div class="fs-remedy-item">
                  <span class="fs-remedy-head">${idx + 1}. ${r.hangMuc}</span>
                  <span class="fs-remedy-body">${r.giaiPhap}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- CARD: Chồng Lớp Đa Trường Phái -->
          <div class="fs-card">
            <div class="fs-card-header">
              <div class="fs-card-title">
                <span>🔄</span>
                <span>CHỒNG LỚP ĐA TRƯỜNG PHÁI: BÁT TRẠCH & VẬN 9</span>
              </div>
              <span style="font-size: 9.5px; color: #f5b041;">2024 - 2043</span>
            </div>
            ${asm.multiSchoolFusion && asm.multiSchoolFusion.batTrach ? `
              <div style="background: rgba(30, 6, 12, 0.85); border-radius: 6px; padding: 6px 8px; font-size: 10px; display: flex; flex-direction: column; gap: 3px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>Gia chủ sinh năm <strong>${asm.multiSchoolFusion.batTrach.birthYear} (${asm.multiSchoolFusion.batTrach.gender})</strong>:</span>
                  <span style="color: #fef08a; font-weight: 800;">Mệnh ${asm.multiSchoolFusion.batTrach.cungMenh} (${asm.multiSchoolFusion.batTrach.nhomMenh})</span>
                </div>
                <div>Hướng nhà gặp: <strong style="color: ${asm.multiSchoolFusion.batTrach.diemHoaHopMenh >= 80 ? '#86efac' : '#fca5a5'};">${asm.multiSchoolFusion.batTrach.duNienHuongNha.toUpperCase()}</strong> (${asm.multiSchoolFusion.batTrach.diemHoaHopMenh}/100 Điểm)</div>
                <div style="color: #94a3b8; line-height: 1.35;">${asm.multiSchoolFusion.batTrach.danhGiaHoaHop}</div>
              </div>
            ` : ''}
            <div style="display: flex; flex-direction: column; gap: 4px; font-size: 10px;">
              ${(asm.multiSchoolFusion && asm.multiSchoolFusion.tuongTacThaiAtHuyenKhong || []).map(t => `
                <div style="border-left: 2px solid #38bdf8; padding-left: 6px; color: #cbd5e1;">
                  <strong style="color: #7dd3fc;">${t.hangMuc}:</strong> ${t.tuongTac}
                </div>
              `).join('')}
            </div>
          </div>
        ` : `
          <!-- CARD: Tứ Thú Sa Bàn Bảo Vệ Huyệt Mộ -->
          <div class="fs-card">
            <div class="fs-card-header">
              <div class="fs-card-title">
                <span>🛡️</span>
                <span>TỨ THÚ SA BÀN BẢO VỆ HUYỆT MỘ</span>
              </div>
              <span style="font-size: 9.5px; color: #94a3b8;">Long Sa Huyệt Thủy</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 10px;">
              <div style="background: rgba(30, 6, 12, 0.8); padding: 6px 8px; border-radius: 5px; border: 1px solid rgba(245, 176, 65, 0.2);">
                <span style="color: #94a3b8; font-size: 9px; font-weight: 700;">🐢 HUYỀN VŨ (TỌA HẬU):</span>
                <div style="color: #fef08a; font-weight: 800; margin-top: 2px;">${asm.tuThu.huyenVuToaHau}</div>
              </div>
              <div style="background: rgba(30, 6, 12, 0.8); padding: 6px 8px; border-radius: 5px; border: 1px solid rgba(245, 176, 65, 0.2);">
                <span style="color: #94a3b8; font-size: 9px; font-weight: 700;">🦚 CHU TƯỚC (MINH ĐƯỜNG):</span>
                <div style="color: #fef08a; font-weight: 800; margin-top: 2px;">${asm.tuThu.chuTuocMinhDuong}</div>
              </div>
              <div style="background: rgba(30, 6, 12, 0.8); padding: 6px 8px; border-radius: 5px; border: 1px solid rgba(245, 176, 65, 0.2);">
                <span style="color: #94a3b8; font-size: 9px; font-weight: 700;">🐉 THANH LONG (TẢ - NAM ĐINH):</span>
                <div style="color: #86efac; font-weight: 800; margin-top: 2px;">${asm.tuThu.thanhLongTa}</div>
              </div>
              <div style="background: rgba(30, 6, 12, 0.8); padding: 6px 8px; border-radius: 5px; border: 1px solid rgba(245, 176, 65, 0.2);">
                <span style="color: #94a3b8; font-size: 9px; font-weight: 700;">🐅 BẠCH HỔ (HỮU - NỮ ĐINH):</span>
                <div style="color: #7dd3fc; font-weight: 800; margin-top: 2px;">${asm.tuThu.bachHoHuu}</div>
              </div>
            </div>
          </div>

          <!-- CARD: Chẩn Đoán 5 Biến Chứng Âm Phần -->
          <div class="fs-card">
            <div class="fs-card-header">
              <div class="fs-card-title">
                <span>⚠️</span>
                <span>CHẨN ĐOÁN BIẾN CHỨNG ÂM PHẦN (TOMB PATHOLOGY)</span>
              </div>
              <span style="font-size: 9.5px; color: ${asm.pathologies.length > 0 ? '#ef4444' : '#86efac'}; font-weight: 800;">
                ${asm.pathologies.length > 0 ? `Phát hiện ${asm.pathologies.length} nguy cơ` : 'Cốt tủy bình an'}
              </span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${asm.pathologies.length > 0 ? asm.pathologies.map(p => `
                <div class="fs-path-item">
                  <div class="fs-path-title">
                    <span>${p.tenBenhTrach}</span>
                    <span class="fs-badge fs-badge-critical">${p.mucDoNguyHiem}</span>
                  </div>
                  <div class="fs-path-body"><strong>Dấu hiệu:</strong> ${p.dauHieuThucTe}</div>
                  <div class="fs-path-body"><strong>Tác động:</strong> ${p.anhHuongConChau}</div>
                  <div class="fs-path-body" style="color: #86efac;">🛠️ <strong>Xử lý kỹ thuật:</strong> ${p.bienPhapKyThuat}</div>
                </div>
              `).join('') : `
                <div style="text-align: center; padding: 12px; color: #86efac; font-weight: 700; font-size: 10.5px;">
                  ✨ Không phát hiện biến chứng nguy hiểm. Địa khí khô ráo, tĩnh tại và vững bền.
                </div>
              `}
            </div>
          </div>

          <!-- CARD: 4 Kế Sách Địa Kỹ Thuật & Tôn Tạo -->
          <div class="fs-card">
            <div class="fs-card-header">
              <div class="fs-card-title">
                <span>🏗️</span>
                <span>KẾ SÁCH ĐỊA KỸ THUẬT & TÔN TẠO HUYỆT MỘ</span>
              </div>
              <span style="font-size: 9.5px; color: #86efac; font-weight: 700;">Không Bùa Chú</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${asm.civilRemediationPlans.map((plan, idx) => `
                <div class="fs-remedy-item">
                  <span class="fs-remedy-head">${idx + 1}. ${plan.hangMuc}</span>
                  <span class="fs-remedy-body">${plan.giaiPhap}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `}

        <!-- CARD: Giờ Hoàng Kim Khởi Công / Nhập Trạch / An Táng -->
        <div class="fs-card">
          <div class="fs-card-header">
            <div class="fs-card-title">
              <span>⏳</span>
              <span>GIỜ HOÀNG KIM ${isDuong ? 'KHỞI CÔNG & NHẬP TRẠCH' : 'AN TÁNG & TẠ MỘ'}</span>
            </div>
            <span style="font-size: 9.5px; color: #f5b041;">12 Thời Thần</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 10px;">
            ${(isDuong ? asm.goldenHours : asm.goldenHoursBurial).map(g => `
              <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.03); padding: 4px 6px; border-radius: 4px;">
                <span style="color: #fef08a; font-weight: 800;">Giờ ${g.gio}</span>
                <span class="fs-badge fs-badge-great">${g.trangThai}</span>
                <span style="color: #cbd5e1; flex: 1; margin-left: 8px; text-align: right; font-size: 9.5px;">${g.khuyenNghi}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- MODAL: BÁO CÁO HỌC THUẬT TOÀN DIỆN -->
        <div class="thaiat-fs-modal-overlay" id="thaiat-fs-essay-modal-overlay">
          <div class="thaiat-fs-modal" id="thaiat-fs-essay-modal">
            <div class="thaiat-fs-modal-header">
              <div class="thaiat-fs-modal-title">
                <span>📜</span>
                <span>BÁO CÁO THẨM TRA ${isDuong ? 'DƯƠNG TRẠCH 8 TẦNG' : 'ÂM TRẠCH 9 TẦNG'}</span>
              </div>
              <button type="button" class="thaiat-fs-modal-close" id="btn-close-thaiat-essay-modal">&times;</button>
            </div>
            <div class="thaiat-fs-modal-body" id="thaiat-fs-essay-modal-body">
              ${fsAiPolishedText || fsEngine.generateTaiyiFengShuiEssay(asm, currentFsSubMode)}
            </div>
            <div class="thaiat-fs-modal-footer">
              <button type="button" class="ucc-btn-submit" id="btn-copy-thaiat-essay" style="flex: 1;">📋 Sao Chép Báo Cáo</button>
              <button type="button" class="ucc-btn-now" id="btn-download-thaiat-essay" style="width: auto;">💾 Tải .md</button>
            </div>
          </div>
        </div>

        <!-- MODAL: TRẠCH CÁT 12 THỜI THẦN -->
        <div class="thaiat-fs-modal-overlay" id="thaiat-fs-trachcat-modal-overlay">
          <div class="thaiat-fs-modal" id="thaiat-fs-trachcat-modal">
            <div class="thaiat-fs-modal-header">
              <div class="thaiat-fs-modal-title">
                <span>⏳</span>
                <span>TRẠCH CÁT 12 THỜI THẦN THÁI ẤT</span>
              </div>
              <button type="button" class="thaiat-fs-modal-close" id="btn-close-thaiat-trachcat-modal">&times;</button>
            </div>
            <div style="padding: 8px 14px 4px; border-bottom: 1px solid rgba(245, 176, 65, 0.2);">
              <label style="font-size: 10px; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 4px;">CHỌN SỰ VỤ PHONG THỦY:</label>
              <select id="thaiat-fs-timing-task" style="width: 100%; background: rgba(10, 1, 3, 0.9); border: 1px solid rgba(245, 176, 65, 0.4); border-radius: 4px; color: #fef08a; padding: 5px 8px; font-size: 11px; font-weight: 700;">
                <option value="dong_tho" ${currentFsTimingTask === 'dong_tho' ? 'selected' : ''}>1. Động Thổ & Khởi Công Móng</option>
                <option value="cat_noc" ${currentFsTimingTask === 'cat_noc' ? 'selected' : ''}>2. Cất Nóc & Thượng Lương</option>
                <option value="nhap_trach" ${currentFsTimingTask === 'nhap_trach' ? 'selected' : ''}>3. Nhập Trạch & Dọn Vào Nhà Mới</option>
                <option value="ha_huyet" ${currentFsTimingTask === 'ha_huyet' ? 'selected' : ''}>4. Hạ Huyệt & Cải Táng Mộ Phần</option>
                <option value="ta_mo" ${currentFsTimingTask === 'ta_mo' ? 'selected' : ''}>5. Tạ Mộ & Khánh Thành Lăng Tẩm</option>
                <option value="khai_truong" ${currentFsTimingTask === 'khai_truong' ? 'selected' : ''}>6. Khai Trương & Mở Cửa Kinh Doanh</option>
                <option value="mo_nuoc" ${currentFsTimingTask === 'mo_nuoc' ? 'selected' : ''}>7. Mở Nước, Khoan Giếng & Thông Thủy</option>
              </select>
            </div>
            <div class="thaiat-fs-modal-body" id="thaiat-fs-trachcat-modal-body" style="white-space: normal;">
              ${renderTrachCatTimingContent(keData, currentFsTimingTask)}
            </div>
            <div class="thaiat-fs-modal-footer">
              <button type="button" class="ucc-btn-now" id="btn-close-thaiat-trachcat-footer" style="flex: 1;">Đóng Cửa Sổ</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function bindThaiAtFengShuiEvents(keData, chart) {
    const fsEngine = global.NetaThaiAtFengShuiEngine;
    if (!fsEngine) return;

    // Sub-mode switch
    const btnDuong = document.getElementById('btn-thaiat-fs-mode-duong');
    const btnAm = document.getElementById('btn-thaiat-fs-mode-am');
    if (btnDuong) {
      btnDuong.onclick = () => {
        currentFsSubMode = 'duong_trach';
        renderThaiAt(true);
      };
    }
    if (btnAm) {
      btnAm.onclick = () => {
        currentFsSubMode = 'am_trach';
        renderThaiAt(true);
      };
    }

    // Degree controls
    const slider = document.getElementById('thaiat-fs-deg-slider');
    const numInput = document.getElementById('thaiat-fs-deg-input');
    if (slider) {
      slider.oninput = (e) => {
        const val = parseFloat(e.target.value) || 0;
        currentFsSittingDeg = val;
        if (numInput) numInput.value = val.toFixed(1);
        renderThaiAt(true);
      };
    }
    if (numInput) {
      numInput.onchange = (e) => {
        const val = parseFloat(e.target.value) || 0;
        currentFsSittingDeg = ((val % 360) + 360) % 360;
        if (slider) slider.value = currentFsSittingDeg;
        renderThaiAt(true);
      };
    }

    // Property Type
    const propSel = document.getElementById('thaiat-fs-property-type');
    if (propSel) {
      propSel.onchange = (e) => {
        currentFsPropertyType = e.target.value;
        renderThaiAt(true);
      };
    }

    // Lai Long & Thủy Khẩu
    const laiLongInp = document.getElementById('thaiat-fs-lailong-input');
    if (laiLongInp) {
      laiLongInp.onchange = (e) => {
        currentFsLaiLongDeg = parseFloat(e.target.value) || 0;
        renderThaiAt(true);
      };
    }
    const thuyKhauInp = document.getElementById('thaiat-fs-thuykhau-input');
    if (thuyKhauInp) {
      thuyKhauInp.onchange = (e) => {
        currentFsThuyKhauDeg = parseFloat(e.target.value) || 0;
        renderThaiAt(true);
      };
    }

    // Modals
    const essayOverlay = document.getElementById('thaiat-fs-essay-modal-overlay');
    const trachcatOverlay = document.getElementById('thaiat-fs-trachcat-modal-overlay');

    const btnEssay = document.getElementById('btn-thaiat-fs-essay');
    if (btnEssay && essayOverlay) {
      btnEssay.onclick = () => {
        essayOverlay.classList.add('open');
      };
    }
    const btnCloseEssay = document.getElementById('btn-close-thaiat-essay-modal');
    if (btnCloseEssay && essayOverlay) {
      btnCloseEssay.onclick = () => {
        essayOverlay.classList.remove('open');
      };
    }
    if (essayOverlay) {
      essayOverlay.onclick = (e) => {
        if (e.target === essayOverlay) essayOverlay.classList.remove('open');
      };
    }

    const btnTrachcat = document.getElementById('btn-thaiat-fs-trachcat');
    if (btnTrachcat && trachcatOverlay) {
      btnTrachcat.onclick = () => {
        trachcatOverlay.classList.add('open');
      };
    }
    const btnCloseTrachcat = document.getElementById('btn-close-thaiat-trachcat-modal');
    const btnCloseTrachcatFooter = document.getElementById('btn-close-thaiat-trachcat-footer');
    if (btnCloseTrachcat && trachcatOverlay) {
      btnCloseTrachcat.onclick = () => {
        trachcatOverlay.classList.remove('open');
      };
    }
    if (btnCloseTrachcatFooter && trachcatOverlay) {
      btnCloseTrachcatFooter.onclick = () => {
        trachcatOverlay.classList.remove('open');
      };
    }
    if (trachcatOverlay) {
      trachcatOverlay.onclick = (e) => {
        if (e.target === trachcatOverlay) trachcatOverlay.classList.remove('open');
      };
    }

    // Task select in Trạch Cát
    const timingTaskSel = document.getElementById('thaiat-fs-timing-task');
    if (timingTaskSel) {
      timingTaskSel.onchange = (e) => {
        currentFsTimingTask = e.target.value;
        const bodyEl = document.getElementById('thaiat-fs-trachcat-modal-body');
        if (bodyEl) bodyEl.innerHTML = renderTrachCatTimingContent(keData, currentFsTimingTask);
      };
    }

    // Download .md
    const getEssayText = () => {
      const isD = (currentFsSubMode === 'duong_trach');
      const assessment = isD
        ? fsEngine.assessDuongTrach(chart, currentFsSittingDeg, currentFsPropertyType, (currentKeType === 'gio' ? 'Kể Giờ' : 'Kể Năm'), querentBirthYear, (currentIsMale ? 'Nam' : 'Nữ'))
        : fsEngine.assessAmTrach(chart, currentFsSittingDeg, currentFsLaiLongDeg, currentFsThuyKhauDeg, (currentKeType === 'gio' ? 'Kể Giờ' : 'Kể Năm'));
      return fsAiPolishedText || fsEngine.generateTaiyiFengShuiEssay(assessment, currentFsSubMode);
    };

    const downloadMd = () => {
      const text = getEssayText();
      const filename = `ThaiAt_PhongThuy_${currentFsSubMode}_${new Date().toISOString().slice(0, 10)}.md`;
      const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const copyEssay = () => {
      const text = getEssayText();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          alert('Đã sao chép toàn văn Báo Cáo Phong Thủy Thái Ất vào Clipboard!');
        }).catch(() => {
          prompt('Sao chép thủ công:', text);
        });
      } else {
        prompt('Sao chép thủ công:', text);
      }
    };

    const btnDownload = document.getElementById('btn-thaiat-fs-download');
    if (btnDownload) btnDownload.onclick = downloadMd;
    const btnDownloadModal = document.getElementById('btn-download-thaiat-essay');
    if (btnDownloadModal) btnDownloadModal.onclick = downloadMd;

    const btnCopy = document.getElementById('btn-thaiat-fs-copy');
    if (btnCopy) btnCopy.onclick = copyEssay;
    const btnCopyModal = document.getElementById('btn-copy-thaiat-essay');
    if (btnCopyModal) btnCopyModal.onclick = copyEssay;

    // AI Polish
    const btnAi = document.getElementById('btn-thaiat-fs-ai');
    if (btnAi) {
      btnAi.onclick = () => {
        if (!global.NetaGeminiService || typeof global.NetaGeminiService.polishFengShuiEssay !== 'function') {
          alert('Dịch vụ Gemini AI chưa sẵn sàng. Bạn có thể sử dụng bản luận giải gốc chất lượng cao.');
          return;
        }
        btnAi.textContent = '⏳ Đang trau chuốt...';
        btnAi.disabled = true;
        const rawText = getEssayText();
        global.NetaGeminiService.polishFengShuiEssay(rawText, 'thái_ất').then(res => {
          btnAi.textContent = '✨ Biên Tập AI';
          btnAi.disabled = false;
          if (res && res.text) {
            fsAiPolishedText = res.text;
            if (essayOverlay) {
              const body = document.getElementById('thaiat-fs-essay-modal-body');
              if (body) body.textContent = fsAiPolishedText;
              essayOverlay.classList.add('open');
            }
          }
        }).catch(err => {
          btnAi.textContent = '✨ Biên Tập AI';
          btnAi.disabled = false;
          alert('Không thể kết nối AI: ' + (err.message || 'Lỗi mạng'));
        });
      };
    }
  }

  function bindThaiAtEvents(keData, chart, luan) {
    const pad = n => String(n).padStart(2, '0');

    // UCC View Switcher: Trận Đồ vs Luận Giải
    const btnTabChart = document.getElementById('btn-thaiat-tab-chart');
    const btnTabAnalysis = document.getElementById('btn-thaiat-tab-analysis');
    const btnOpenLuan = document.getElementById('thaiat-btn-open-luan');

    if (btnTabChart) {
      btnTabChart.onclick = () => {
        currentMainTab = 'chart';
        renderThaiAt(true);
      };
    }
    if (btnTabAnalysis) {
      btnTabAnalysis.onclick = () => {
        currentMainTab = 'analysis';
        renderThaiAt(true);
      };
    }
    if (btnOpenLuan) {
      btnOpenLuan.onclick = () => {
        currentMainTab = 'analysis';
        renderThaiAt(true);
      };
    }
    const btnTabFengshui = document.getElementById('btn-thaiat-tab-fengshui');
    if (btnTabFengshui) {
      btnTabFengshui.onclick = () => {
        currentMainTab = 'fengshui';
        renderThaiAt(true);
      };
    }
    const btnCross = document.getElementById('btn-thaiat-cross-tamthuc');
    if (btnCross) {
      btnCross.onclick = () => {
        if (window.NetaTamThucView && typeof window.NetaTamThucView.setDate === 'function') {
          window.NetaTamThucView.setDate(currentDate);
        }
        if (typeof window.switchAppMode === 'function') {
          window.switchAppMode('tamthuc');
        }
      };
    }

    // Report Mode Switcher: Bản Gốc vs Bản AI
    const btnModeStandard = document.getElementById('btn-thaiat-mode-standard');
    const btnModeAi = document.getElementById('btn-thaiat-mode-ai');
    const btnBackStandard = document.getElementById('btn-thaiat-back-standard');
    const btnBackStandardErr = document.getElementById('btn-thaiat-back-standard-from-err');
    const btnRetryAi = document.getElementById('btn-thaiat-retry-ai');
    const btnTriggerAi = document.getElementById('btn-thaiat-trigger-ai');
    const btnCopyLuan = document.getElementById('thaiat-btn-copy-luan');

    if (btnModeStandard) {
      btnModeStandard.onclick = () => {
        currentReportMode = 'standard';
        renderThaiAt(true);
      };
    }
    if (btnBackStandard) {
      btnBackStandard.onclick = () => {
        currentReportMode = 'standard';
        renderThaiAt(true);
      };
    }
    if (btnBackStandardErr) {
      btnBackStandardErr.onclick = () => {
        currentReportMode = 'standard';
        renderThaiAt(true);
      };
    }
    if (btnModeAi) {
      btnModeAi.onclick = () => {
        currentReportMode = 'ai';
        if (!aiPolishedText && !isAiPolishing) {
          triggerAiPolish(chart, keData);
        } else {
          renderThaiAt(true);
        }
      };
    }
    if (btnRetryAi) {
      btnRetryAi.onclick = () => {
        triggerAiPolish(chart, keData);
      };
    }
    if (btnTriggerAi) {
      btnTriggerAi.onclick = () => {
        triggerAiPolish(chart, keData);
      };
    }
    if (btnCopyLuan) {
      btnCopyLuan.onclick = () => {
        const userCtx = {
          querentRole: querentRole,
          querentBirthYear: querentBirthYear,
          querentBirthBranch: getCanChiYear(querentBirthYear).chi,
          querentCanChi: getCanChiYear(querentBirthYear).canChi
        };
        const textToCopy = (currentReportMode === 'ai' && aiPolishedText)
          ? aiPolishedText
          : (global.NetaThaiAtInterpreter.generateFullReportText(chart, currentKeType, userCtx));
        copyLuanReport(textToCopy);
      };
    }

    // Role Switcher: Phe Chủ vs Phe Khách
    const btnRoleChu = document.getElementById('thaiat-btn-role-chu');
    const btnRoleKhach = document.getElementById('thaiat-btn-role-khach');
    if (btnRoleChu) {
      btnRoleChu.onclick = () => {
        if (querentRole !== 'chu') {
          querentRole = 'chu';
          renderThaiAt(true);
        }
      };
    }
    if (btnRoleKhach) {
      btnRoleKhach.onclick = () => {
        if (querentRole !== 'khach') {
          querentRole = 'khach';
          renderThaiAt(true);
        }
      };
    }

    // Querent Birth Year Input
    const inputQYear = document.getElementById('thaiat-input-querent-year');
    if (inputQYear) {
      inputQYear.addEventListener('change', () => {
        let y = parseInt(inputQYear.value, 10);
        if (!isNaN(y) && y >= 1920 && y <= 2040) {
          querentBirthYear = y;
          renderThaiAt(true);
        }
      });
      inputQYear.addEventListener('input', () => {
        let y = parseInt(inputQYear.value, 10);
        if (!isNaN(y) && y >= 1920 && y <= 2040) {
          const badge = document.getElementById('thaiat-qyear-badge');
          if (badge) {
            badge.textContent = getCanChiYear(y).canChi;
          }
        }
      });
    }

    // Filter pills
    document.querySelectorAll('.luan-pill-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        currentLuanFilter = btn.getAttribute('data-filter') || 'all';
        renderThaiAt(true);
      };
    });

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

    if (currentMainTab === 'fengshui') {
      bindThaiAtFengShuiEvents(keData, chart);
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
    inspectPalace: inspectPalace,
    toggleSection: toggleSection,
    setLuanMode: setLuanMode,
    dismissAiError: dismissAiError,
    setMainTab: (tab) => {
      currentMainTab = tab;
      renderThaiAt(true);
    },
    setFsSubMode: (mode) => {
      currentFsSubMode = mode;
      renderThaiAt(true);
    },
    setFsDegree: (deg) => {
      currentFsSittingDeg = ((deg % 360) + 360) % 360;
      renderThaiAt(true);
    },
    getFsState: () => ({
      mainTab: currentMainTab,
      subMode: currentFsSubMode,
      sittingDeg: currentFsSittingDeg,
      propertyType: currentFsPropertyType,
      laiLongDeg: currentFsLaiLongDeg,
      thuyKhauDeg: currentFsThuyKhauDeg
    })
  };

})(typeof window !== 'undefined' ? window : this);
