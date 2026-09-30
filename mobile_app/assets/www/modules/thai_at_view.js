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

  // Trạng thái Phân hệ Luận Giải Chuyên Sâu 15 Phân Hệ
  let isLuanModalOpen = false;
  let currentLuanFilter = 'all'; // 'all' | 'daicuc' | 'cachcuc' | 'tacthien' | 'nhatdung' | 'canhgio'
  let currentLuanViewMode = 'math'; // 'math' | 'ai'
  let isAiPolishing = false;
  let aiPolishedText = null;
  let aiErrorMessage = null;
  let aiLoadingStepText = '';
  let collapsedSections = {};

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

      /* Ribbon Strip Items with Clean Wrapping & Contrast */
      .thaiat-strip-item,
      .lucnham-strip-item {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
      }
      .thaiat-strip-item:not(:last-child)::after,
      .lucnham-strip-item:not(:last-child)::after {
        content: "•";
        margin-left: 8px;
        opacity: 0.5;
        color: currentColor;
      }
      body.theme-light .thaiat-master-strip strong {
        color: #0f172a !important;
        font-weight: 800 !important;
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

      /* Full-Screen Luận Giải Modal */
      .thaiat-luan-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(4px);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: flex-end;
      }
      .thaiat-luan-modal-sheet {
        width: 100%;
        max-width: 500px;
        height: 94vh;
        max-height: 94vh;
        background: #120306;
        border-top: 2px solid #f5b041;
        border-radius: 16px 16px 0 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.6);
      }
      body.theme-light .thaiat-luan-modal-sheet {
        background: #ffffff !important;
        border-top-color: #d97706 !important;
        color: #1e293b !important;
        box-shadow: 0 -6px 20px rgba(0, 0, 0, 0.15) !important;
      }
      .thaiat-luan-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 14px;
        background: rgba(26, 4, 8, 0.95);
        border-bottom: 1px solid rgba(245, 176, 65, 0.25);
      }
      body.theme-light .thaiat-luan-modal-header {
        background: #fefce8 !important;
        border-bottom-color: #e5e7eb !important;
      }
      .thaiat-luan-modal-title {
        font-size: 12.5px;
        font-weight: 800;
        color: #f5b041;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      body.theme-light .thaiat-luan-modal-title { color: #92400e; }
      .thaiat-luan-modal-actions {
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .luan-act-btn {
        background: rgba(245, 176, 65, 0.15);
        color: #fef08a;
        border: 1px solid rgba(245, 176, 65, 0.3);
        border-radius: 6px;
        padding: 4px 8px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      body.theme-light .luan-act-btn {
        background: #fef3c7 !important;
        color: #92400e !important;
        border-color: #fcd34d !important;
      }
      .luan-act-btn.btn-close {
        font-size: 14px;
        padding: 3px 8px;
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
        border-color: rgba(239, 68, 68, 0.4);
      }
      body.theme-light .luan-act-btn.btn-close {
        background: #fee2e2 !important;
        color: #dc2626 !important;
        border-color: #fca5a5 !important;
      }
      .thaiat-luan-modal-body {
        flex: 1;
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch;
        touch-action: pan-y !important;
        padding: 10px 12px calc(var(--safe-bottom, 20px) + 30px);
      }
      /* Dashboard Metrics */
      .luan-dashboard-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
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
        font-size: 9px;
        color: #94a3b8;
        margin-top: 2px;
      }
      body.theme-light .luan-metric-label { color: #64748b; }
      /* Force Balance Progress */
      .luan-force-bar-wrap {
        background: rgba(26, 4, 8, 0.85);
        border: 1px solid rgba(245, 176, 65, 0.25);
        border-radius: 8px;
        padding: 6px 10px;
        margin-bottom: 10px;
      }
      body.theme-light .luan-force-bar-wrap {
        background: #f8fafc !important;
        border-color: #e2e8f0 !important;
      }
      .luan-force-labels {
        display: flex;
        justify-content: space-between;
        font-size: 10.5px;
        font-weight: 700;
        margin-bottom: 4px;
      }
      .force-lbl-chu { color: #38bdf8; }
      body.theme-light .force-lbl-chu { color: #0284c7; }
      .force-lbl-khach { color: #fb7185; }
      body.theme-light .force-lbl-khach { color: #e11d48; }
      .luan-force-bar-track {
        height: 8px;
        background: #be123c;
        border-radius: 4px;
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
        gap: 4px;
        overflow-x: auto;
        padding-bottom: 6px;
        margin-bottom: 10px;
        scrollbar-width: none;
      }
      .luan-pills-bar::-webkit-scrollbar { display: none; }
      .luan-pill-btn {
        background: rgba(26, 4, 8, 0.8);
        border: 1px solid rgba(245, 176, 65, 0.25);
        border-radius: 14px;
        padding: 4px 10px;
        font-size: 10.5px;
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
      }
      body.theme-light .luan-section-card {
        background: #ffffff !important;
        border-color: #e2e8f0 !important;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }
      .luan-section-header {
        padding: 8px 10px;
        background: rgba(30, 6, 12, 0.9);
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        font-size: 11.5px;
        font-weight: 800;
        color: #f5b041;
        border-bottom: 1px solid rgba(245, 176, 65, 0.15);
      }
      body.theme-light .luan-section-header {
        background: #f8fafc !important;
        border-bottom-color: #f1f5f9 !important;
        color: #b45309 !important;
      }
      .luan-section-toggle { font-size: 11px; opacity: 0.7; }
      .luan-section-body {
        padding: 8px 10px;
        font-size: 11px;
        line-height: 1.5;
        color: var(--text-primary, #f8fafc);
      }
      body.theme-light .luan-section-body {
        color: #1e293b !important;
      }
      .luan-sub-item {
        margin-bottom: 6px;
      }
      .luan-sub-item:last-child { margin-bottom: 0; }
      .luan-sub-title {
        font-weight: 700;
        color: #38bdf8;
        margin-bottom: 2px;
      }
      body.theme-light .luan-sub-title { color: #0284c7; }
      .luan-badge-hung {
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
        border: 1px solid #ef4444;
        padding: 1px 4px;
        border-radius: 3px;
        font-size: 8.5px;
        font-weight: 800;
      }
      .luan-badge-cat {
        background: rgba(16, 185, 129, 0.2);
        color: #6ee7b7;
        border: 1px solid #10b981;
        padding: 1px 4px;
        border-radius: 3px;
        font-size: 8.5px;
        font-weight: 800;
      }
      .luan-hours-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 10px;
      }
      .luan-hours-table th, .luan-hours-table td {
        padding: 4px 6px;
        border: 1px solid rgba(245, 176, 65, 0.15);
      }
      body.theme-light .luan-hours-table th, body.theme-light .luan-hours-table td {
        border-color: #e2e8f0;
      }
      .luan-hours-table th {
        background: rgba(245, 176, 65, 0.15);
        color: #f5b041;
        font-weight: 800;
      }
      body.theme-light .luan-hours-table th {
        background: #f1f5f9;
        color: #475569;
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
        border-radius: 6px;
        padding: 4px 12px;
        font-size: 11px;
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

    let luanQuickBadge = '15 Phân Hệ';
    let luanData = null;
    if (global.NetaThaiAtInterpreter && keData) {
      try {
        luanData = global.NetaThaiAtInterpreter.luanGiaiKe(keData, currentChart);
        if (luanData && luanData.chi_so_dinh_luong) {
          luanQuickBadge = `${luanData.chi_so_dinh_luong.diem_cat_khanh}đ Cát • ${luanData.dao_chu_khach.ket_luan.split('(')[0].trim()}`;
        }
      } catch (e) {
        console.warn('Lỗi tính luận giải Thái Ất:', e);
      }
    }

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
          <div class="thaiat-strip-item"><span>Độn:</span> <strong class="tms-val-gold">${keData.donType}</strong></div>
          <div class="thaiat-strip-item"><span>Cục:</span> <strong>Cục ${keData.cuc}</strong></div>
          <div class="thaiat-strip-item"><span>Nguyên:</span> <strong>Nguyên ${keData.nguyen}</strong></div>
          <div class="thaiat-strip-item"><span>Kỷ Dư:</span> <strong>${keData.kyDu}</strong></div>
          <div class="thaiat-strip-item"><span>Tiết khí:</span> <strong>${currentChart.tietKhi}</strong></div>
        </div>

        <!-- Nút Kích Hoạt Luận Giải Chuyên Sâu 15 Phân Hệ -->
        <div class="thaiat-luan-banner">
          <button type="button" class="thaiat-btn-luan-giai" id="thaiat-btn-open-luan" title="Mở bảng Luận Giải 15 Phân Hệ">
            <span class="luan-btn-left">
              <span class="luan-btn-icon">📖</span>
              <span class="luan-btn-text">Luận Giải Chuyên Sâu</span>
            </span>
            <span class="luan-btn-right">
              <span class="luan-btn-badge">${luanQuickBadge}</span>
              <span class="luan-btn-arrow">❯</span>
            </span>
          </button>
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

        <!-- 6. Full-Screen Luận Giải Chuyên Sâu Modal -->
        ${isLuanModalOpen ? renderLuanModalHTML(keData, currentChart, luanData) : ''}
      </div>
    `;

    bindThaiAtEvents();
    if (isLuanModalOpen) {
      bindLuanModalEvents(keData, currentChart, luanData);
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

  function renderLuanModalHTML(keData, chart, luan) {
    if (!luan) return '';
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

    let modalContentHTML = '';

    if (currentLuanViewMode === 'ai') {
      if (isAiPolishing) {
        modalContentHTML = `
          <div style="text-align: center; padding: 40px 10px;">
            <div class="luan-loading-spinner" style="width: 28px; height: 28px; border-width: 3px;"></div>
            <div style="margin-top: 14px; font-weight: 700; color: #f5b041; font-size: 13px;">${aiLoadingStepText || 'Đang biên tập văn phong Thái Ất qua AI...'}</div>
            <div style="margin-top: 6px; font-size: 11px; opacity: 0.75;">Áp dụng Rào chắn 4 lớp bảo toàn số liệu & cấu trúc 15 phân hệ.</div>
          </div>
        `;
      } else if (aiPolishedText) {
        modalContentHTML = `
          <div class="luan-ai-result-wrap">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 11px; color: #38bdf8; font-weight: 700;">✨ Bản trau chuốt học thuật qua AI:</span>
              <span class="luan-badge-cat">Đã kiểm toán đạt</span>
            </div>
            <div style="background: rgba(26,4,8,0.7); border: 1px solid rgba(245,176,65,0.25); border-radius: 8px; padding: 10px; font-size: 11.5px; line-height: 1.6;">
              ${formatMarkdownToHTML(aiPolishedText)}
            </div>
          </div>
        `;
      } else if (aiErrorMessage) {
        modalContentHTML = `
          <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; border-radius: 8px; padding: 12px; margin-bottom: 10px; color: #fca5a5; font-size: 11.5px;">
            <strong>⚠️ Thông báo AI:</strong> ${aiErrorMessage}
          </div>
          <div style="text-align: center; margin-top: 10px;">
            <button class="luan-pill-btn active" onclick="window.NetaThaiAtView.setLuanMode('math')">Quay lại Bản Toán Học Gốc</button>
          </div>
        `;
      }
    } else {
      let cards = '';

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
        let hourRows = luan.thoi_than_12_gio.map(h => `
          <tr>
            <td><strong>${h.gio}</strong></td>
            <td>${h.ngu_hanh}</td>
            <td><span class="${h.trang_thai.includes('Cát') ? 'luan-badge-cat' : (h.trang_thai.includes('Hung') ? 'luan-badge-hung' : '')}">${h.trang_thai}</span></td>
            <td>${h.loi_khuyen}</td>
          </tr>
        `).join('');
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
                    <tr><th>Giờ</th><th>Hành</th><th>Trạng thái</th><th>Lời khuyên</th></tr>
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

      modalContentHTML = cards;
    }

    return `
      <div class="thaiat-luan-modal-overlay" id="thaiat-luan-modal-overlay">
        <div class="thaiat-luan-modal-sheet" id="thaiat-luan-modal-sheet">
          <!-- Header -->
          <div class="thaiat-luan-modal-header">
            <div class="thaiat-luan-modal-title">
              <span>📖</span>
              <span>LUẬN GIẢI THÁI ẤT • ${(keData.keName || '').toUpperCase()}</span>
            </div>
            <div class="thaiat-luan-modal-actions">
              <button type="button" class="luan-act-btn" id="thaiat-btn-copy-luan" title="Sao chép toàn bộ văn bản">
                📋 Sao chép
              </button>
              <button type="button" class="luan-act-btn" id="thaiat-btn-ai-luan" title="Trau chuốt văn phong qua Gemini AI">
                ✨ AI
              </button>
              <button type="button" class="luan-act-btn btn-close" id="thaiat-btn-close-luan" title="Đóng bảng luận giải">
                ✕
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="thaiat-luan-modal-body">
            <!-- Mode Switch (Math vs AI) -->
            ${aiPolishedText ? `
              <div class="luan-view-mode-bar">
                <button class="luan-mode-tab ${currentLuanViewMode === 'math' ? 'active' : ''}" data-mode="math">📐 Bản Toán Học Gốc</button>
                <button class="luan-mode-tab ${currentLuanViewMode === 'ai' ? 'active' : ''}" data-mode="ai">✨ Bản AI Biên Tập</button>
              </div>
            ` : ''}

            <!-- 1. Quantitative Dashboard -->
            <div class="luan-dashboard-grid">
              <div class="luan-metric-card">
                <div class="luan-metric-num" style="color: ${idx.diem_cat_khanh >= 70 ? '#10b981' : (idx.diem_cat_khanh >= 50 ? '#f5b041' : '#f43f5e')};">${idx.diem_cat_khanh}</div>
                <div class="luan-metric-label">Điểm Cát Khánh</div>
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
              <button class="luan-pill-btn ${currentLuanFilter === 'all' ? 'active' : ''}" data-filter="all">Tất cả (15)</button>
              <button class="luan-pill-btn ${currentLuanFilter === 'daicuc' ? 'active' : ''}" data-filter="daicuc">Đại Cục & Toán</button>
              <button class="luan-pill-btn ${currentLuanFilter === 'cachcuc' ? 'active' : ''}" data-filter="cachcuc">Cách Cục & Sao</button>
              <button class="luan-pill-btn ${currentLuanFilter === 'tacthien' ? 'active' : ''}" data-filter="tacthien">6 Ngành Tác Chiến</button>
              <button class="luan-pill-btn ${currentLuanFilter === 'nhatdung' ? 'active' : ''}" data-filter="nhatdung">7 Sự Vụ Đời Sống</button>
              <button class="luan-pill-btn ${currentLuanFilter === 'canhgio' ? 'active' : ''}" data-filter="canhgio">12 Canh Giờ</button>
            </div>

            <!-- 3. Cards / Accordion Content -->
            <div class="luan-content-cards">
              ${modalContentHTML}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function bindLuanModalEvents(keData, chart, luan) {
    const overlay = document.getElementById('thaiat-luan-modal-overlay');
    const btnClose = document.getElementById('thaiat-btn-close-luan');
    const btnCopy = document.getElementById('thaiat-btn-copy-luan');
    const btnAi = document.getElementById('thaiat-btn-ai-luan');

    if (btnClose) {
      btnClose.onclick = () => {
        isLuanModalOpen = false;
        renderThaiAt();
      };
    }
    if (overlay) {
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          isLuanModalOpen = false;
          renderThaiAt();
        }
      };
    }

    // Filter pills
    document.querySelectorAll('.luan-pill-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        currentLuanFilter = btn.getAttribute('data-filter') || 'all';
        currentLuanViewMode = 'math';
        renderThaiAt();
      };
    });

    // Mode tabs
    document.querySelectorAll('.luan-mode-tab').forEach(tab => {
      tab.onclick = (e) => {
        e.stopPropagation();
        currentLuanViewMode = tab.getAttribute('data-mode') || 'math';
        renderThaiAt();
      };
    });

    // Copy report
    if (btnCopy) {
      btnCopy.onclick = (e) => {
        e.stopPropagation();
        const textToCopy = (currentLuanViewMode === 'ai' && aiPolishedText)
          ? aiPolishedText
          : (global.NetaThaiAtInterpreter.generateFullReportText(chart, currentKeType));
        copyLuanReport(textToCopy);
      };
    }

    // AI Refiner
    if (btnAi) {
      btnAi.onclick = (e) => {
        e.stopPropagation();
        triggerAiPolish(chart, keData);
      };
    }
  }

  function toggleSection(secId) {
    collapsedSections[secId] = !collapsedSections[secId];
    renderThaiAt();
  }

  function setLuanMode(mode) {
    currentLuanViewMode = mode;
    renderThaiAt();
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
      alert('Dịch vụ AI chưa sẵn sàng trên ứng dụng.');
      return;
    }
    const apiKey = (gemini.getActiveKey && gemini.getActiveKey()) || '';
    if (!apiKey) {
      alert('Chưa cài đặt Google Gemini API Key. Bạn có thể cài đặt trong mục Trải Bài Tarot hoặc Cài Đặt.');
      return;
    }

    isAiPolishing = true;
    currentLuanViewMode = 'ai';
    aiErrorMessage = null;
    aiLoadingStepText = 'Đang trích xuất toàn văn bản thảo 15 phân hệ...';
    renderThaiAt();

    const rawReport = global.NetaThaiAtInterpreter.generateFullReportText(chart, currentKeType);
    const prompt = global.NetaThaiAtInterpreter.buildAIPrompt(rawReport);

    aiLoadingStepText = 'Đang gửi bản thảo sang Gemini AI biên tập...';
    renderThaiAt();

    gemini.callGeminiCascade(prompt, {
      systemInstruction: "Bạn là Tổng Biên Tập Học Thuật kiêm Chuyên Gia Luận Giải Tối Cao về Thái Ất Thần Kinh. Bảo toàn 100% cấu trúc 15 phân mục [I.] đến [XV.], giữ nguyên số liệu, tuân thủ Rule 9 và Rule 12.",
      temperature: 0.3
    }).then(res => {
      isAiPolishing = false;
      const text = (res && res.text) ? res.text : (typeof res === 'string' ? res : '');
      const audit = global.NetaThaiAtInterpreter.validateFactualStructure(text);
      if (audit.isValid) {
        aiPolishedText = text;
        aiErrorMessage = null;
      } else {
        aiPolishedText = null;
        aiErrorMessage = `AI không đạt chuẩn kiểm toán cấu trúc: ${audit.reason}. Đã tự động giữ bản gốc để tránh sai lệch dữ liệu.`;
      }
      renderThaiAt();
    }).catch(err => {
      isAiPolishing = false;
      aiErrorMessage = 'Lỗi kết nối AI: ' + (err.message || 'Không thể trau chuốt');
      renderThaiAt();
    });
  }

  function bindThaiAtEvents() {
    const pad = n => String(n).padStart(2, '0');

    // Nút mở Luận Giải Chuyên Sâu
    const btnOpenLuan = document.getElementById('thaiat-btn-open-luan');
    if (btnOpenLuan) {
      btnOpenLuan.onclick = () => {
        isLuanModalOpen = true;
        renderThaiAt();
      };
    }

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
    inspectPalace: inspectPalace,
    toggleSection: toggleSection,
    setLuanMode: setLuanMode
  };

})(typeof window !== 'undefined' ? window : this);
