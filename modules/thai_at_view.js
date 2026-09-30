/**
 * NETA LIGHT - THÁI ẤT THẦN KINH VIEW MODULE (thai_at_view.js)
 * Giao diện trực quan hoá Trận Đồ 16 Thần Vị & Thái Ất Mệnh Pháp 12 Cung.
 * 
 * Tính năng:
 * 1. Trận đồ Bát Quái 16 Thần Vị (CSS Grid 5x5 viền 16 cung + Trung Cung HUD).
 * 2. Chuyển đổi linh hoạt Tứ Kể: Kể Giờ, Kể Ngày, Kể Tháng, Kể Năm.
 * 3. Chuyển đổi sang Lá Số Thái Ất Nhân Mệnh 12 Cung (Mệnh, Phụ, Tướng, Phúc...).
 * 4. Bộ lọc 5 tầng thông tin (Tất cả, Tứ Tướng / Chiến sự, Nhân Mệnh, Khí Tượng & Kỳ, Cửu Tinh).
 * 5. Drawer tra cứu tương tác chi tiết từng cung và khuyến nghị hành sự.
 */

(function (global) {
  'use strict';

  let currentKeType = 'gio';   // 'gio' | 'ngay' | 'thang' | 'nam' | 'menh'
  let currentLayer = 'all';    // 'all' | 'combat' | 'menh' | 'weather' | 'stars9'
  let isGridView = true;
  let currentDate = new Date();
  let currentChart = null;
  let selectedPalace = 'Tý';

  // 16 Cung theo chu vi Grid 5x5 (Thuận chiều kim đồng hồ từ Tốn)
  // Row 1: Tốn, Tỵ, Ngọ, Mùi, Khôn
  // Right Col: Thân, Dậu, Tuất
  // Bottom Row: Kiền, Hợi, Tý, Sửu, Cấn (nghịch)
  // Left Col: Dần, Mão, Thìn (ngược lên)
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

  // Inject Scoped CSS
  function ensureStyles() {
    if (document.getElementById('thaiat-scoped-styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'thaiat-scoped-styles';
    styleEl.textContent = `
      .thaiat-view-wrap {
        width: 100%;
        max-width: 520px;
        margin: 0 auto;
        padding: 8px 10px 80px;
        box-sizing: border-box;
        color: var(--text-primary, #f8fafc);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .thaiat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--border-color, #24344d);
        margin-bottom: 8px;
      }
      .thaiat-title {
        font-size: 15px;
        font-weight: 800;
        color: #eab308;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .thaiat-ctrl-card {
        background: var(--bg-card, #131d2e);
        border: 1px solid var(--border-color, #24344d);
        border-radius: 8px;
        padding: 8px;
        margin-bottom: 8px;
      }
      .thaiat-ctrl-row {
        display: flex;
        gap: 6px;
        align-items: center;
        margin-bottom: 6px;
      }
      .thaiat-ctrl-row:last-child {
        margin-bottom: 0;
      }
      .thaiat-input {
        flex: 1;
        background: var(--bg-secondary, #090d16);
        border: 1px solid var(--border-color, #24344d);
        color: var(--text-primary, #f8fafc);
        padding: 6px 8px;
        border-radius: 6px;
        font-size: 12px;
      }
      .thaiat-btn-sm {
        background: var(--bg-secondary, #090d16);
        border: 1px solid var(--border-color, #24344d);
        color: var(--text-primary, #f8fafc);
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      }
      .thaiat-btn-sm:hover, .thaiat-btn-sm.active {
        background: #eab308;
        color: #090d16;
        border-color: #eab308;
      }
      .thaiat-tabs-row {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 4px;
        margin-bottom: 8px;
      }
      .thaiat-tab-btn {
        background: var(--bg-card, #131d2e);
        border: 1px solid var(--border-color, #24344d);
        color: var(--text-secondary, #94a3b8);
        padding: 6px 2px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        text-align: center;
        cursor: pointer;
      }
      .thaiat-tab-btn.active {
        background: rgba(234, 179, 8, 0.15);
        color: #eab308;
        border-color: #eab308;
      }
      .thaiat-layer-scroll {
        display: flex;
        gap: 4px;
        overflow-x: auto;
        padding-bottom: 6px;
        margin-bottom: 8px;
        scrollbar-width: none;
      }
      .thaiat-layer-scroll::-webkit-scrollbar { display: none; }
      .thaiat-pill-filter {
        background: var(--bg-card, #131d2e);
        border: 1px solid var(--border-color, #24344d);
        color: var(--text-secondary, #94a3b8);
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 10.5px;
        white-space: nowrap;
        cursor: pointer;
      }
      .thaiat-pill-filter.active {
        background: rgba(56, 189, 248, 0.2);
        color: #38bdf8;
        border-color: #38bdf8;
      }

      /* Grid 5x5 Matrix */
      .thaiat-grid-5x5 {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        grid-template-rows: repeat(5, minmax(68px, 1fr));
        gap: 3px;
        background: var(--border-color, #1e293b);
        border: 1px solid var(--border-color, #24344d);
        border-radius: 8px;
        padding: 3px;
        margin-bottom: 8px;
      }
      .thaiat-cell {
        background: var(--bg-card, #131d2e);
        border-radius: 4px;
        padding: 3px 4px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: background 0.15s;
      }
      .thaiat-cell:hover, .thaiat-cell.active-cell {
        background: rgba(234, 179, 8, 0.12);
        outline: 1px solid #eab308;
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
        color: #f8fafc;
      }
      .thaiat-cell-weight {
        font-size: 9px;
        color: #94a3b8;
        background: rgba(0, 0, 0, 0.4);
        padding: 1px 4px;
        border-radius: 3px;
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
      }
      .star-thaiat { background: rgba(234, 179, 8, 0.25); color: #fde047; }
      .star-chu { background: rgba(56, 189, 248, 0.25); color: #7dd3fc; }
      .star-khach { background: rgba(244, 63, 94, 0.25); color: #fb7185; }
      .star-dinh { background: rgba(192, 132, 252, 0.25); color: #d8b4fe; }
      .star-cat { background: rgba(52, 211, 153, 0.25); color: #6ee7b7; }
      .star-hung { background: rgba(251, 146, 60, 0.25); color: #fdba74; }

      /* Trung Cung HUD 3x3 */
      .thaiat-hud-center {
        grid-column: 2 / span 3;
        grid-row: 2 / span 3;
        background: var(--bg-primary, #090d16);
        border: 1px solid rgba(234, 179, 8, 0.3);
        border-radius: 6px;
        padding: 6px 8px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .thaiat-hud-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border-color, #1e293b);
        padding-bottom: 4px;
      }
      .thaiat-badge-don {
        background: rgba(234, 179, 8, 0.2);
        color: #eab308;
        font-weight: 800;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
      }
      .thaiat-toan-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 4px;
        margin: 4px 0;
        text-align: center;
      }
      .thaiat-toan-box {
        background: var(--bg-card, #131d2e);
        padding: 4px 2px;
        border-radius: 4px;
        border: 1px solid var(--border-color, #24344d);
      }
      .thaiat-toan-title { font-size: 9px; color: #94a3b8; margin-bottom: 1px; }
      .thaiat-toan-num { font-size: 14px; font-weight: 800; line-height: 1; }
      .toan-c-chu { color: #38bdf8; }
      .toan-c-khach { color: #f43f5e; }
      .toan-c-dinh { color: #c084fc; }
      .thaiat-generals-box {
        font-size: 9.5px;
        line-height: 1.3;
        background: rgba(0, 0, 0, 0.25);
        padding: 3px 6px;
        border-radius: 4px;
        margin-bottom: 4px;
      }
      .thaiat-the-tran {
        font-size: 10px;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 4px;
        text-align: center;
        background: rgba(56, 189, 248, 0.15);
        color: #38bdf8;
      }
      .thaiat-badges-anomalies {
        display: flex;
        gap: 3px;
        margin-top: 3px;
      }
      .badge-anomaly {
        font-size: 8.5px;
        font-weight: 700;
        padding: 1px 4px;
        border-radius: 3px;
        background: rgba(244, 63, 94, 0.2);
        color: #fb7185;
      }

      /* Lá số Mệnh 12 Cung */
      .thaiat-menh-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 4px;
        margin-bottom: 8px;
      }
      .thaiat-menh-cell {
        background: var(--bg-card, #131d2e);
        border: 1px solid var(--border-color, #24344d);
        border-radius: 6px;
        padding: 6px;
        cursor: pointer;
      }
      .thaiat-menh-name {
        font-weight: 800;
        font-size: 11px;
        color: #fb923c;
        display: flex;
        justify-content: space-between;
      }
      .thaiat-menh-locma {
        font-size: 9px;
        color: #4ade80;
        margin-top: 2px;
      }

      /* Drawer chi tiết */
      .thaiat-drawer {
        background: var(--bg-card, #131d2e);
        border: 1px solid var(--border-color, #24344d);
        border-radius: 8px;
        padding: 8px 10px;
      }
      .thaiat-drawer-title {
        font-weight: 800;
        font-size: 12px;
        color: #eab308;
        margin-bottom: 4px;
        display: flex;
        justify-content: space-between;
      }
      .thaiat-drawer-desc {
        font-size: 11.5px;
        color: var(--text-secondary, #94a3b8);
        line-height: 1.4;
        margin-bottom: 6px;
      }
      .thaiat-drawer-advice {
        background: rgba(234, 179, 8, 0.12);
        border-left: 3px solid #eab308;
        padding: 4px 8px;
        font-size: 11px;
        border-radius: 0 4px 4px 0;
      }
    `;
    document.head.appendChild(styleEl);
  }

  // Khởi tạo HTML khung của Module
  function initThaiAtView() {
    const container = document.getElementById('view-thaiat');
    if (!container) return;
    ensureStyles();

    container.innerHTML = `
      <div class="thaiat-view-wrap">
        <!-- Header -->
        <div class="thaiat-header">
          <div class="thaiat-title">
            <span>☀️</span>
            <span>THÁI ẤT THẦN KINH</span>
          </div>
          <div id="thaiat-badge-epoch" class="thaiat-badge-don">Đang tính...</div>
        </div>

        <!-- Controls Card -->
        <div class="thaiat-ctrl-card">
          <div class="thaiat-ctrl-row">
            <input type="datetime-local" id="thaiat-datetime-input" class="thaiat-input" />
            <button class="thaiat-btn-sm active" id="btn-thaiat-now">Bây giờ</button>
            <button class="thaiat-btn-sm" id="btn-thaiat-calc">Lập quẻ</button>
          </div>
          <div class="thaiat-ctrl-row" style="font-size: 11px; color: var(--text-secondary, #94a3b8);">
            <span id="thaiat-canchi-str">Can Chi: Đang tính...</span>
          </div>
        </div>

        <!-- Tabs Tứ Kể & Mệnh -->
        <div class="thaiat-tabs-row">
          <button class="thaiat-tab-btn active" data-ke="gio">Kể Giờ</button>
          <button class="thaiat-tab-btn" data-ke="ngay">Kể Ngày</button>
          <button class="thaiat-tab-btn" data-ke="thang">Kể Tháng</button>
          <button class="thaiat-tab-btn" data-ke="nam">Kể Năm</button>
          <button class="thaiat-tab-btn" data-ke="menh">Nhân Mệnh</button>
        </div>

        <!-- Layer Filters -->
        <div class="thaiat-layer-scroll" id="thaiat-layer-row">
          <button class="thaiat-pill-filter active" data-layer="all">Tất cả</button>
          <button class="thaiat-pill-filter" data-layer="combat">⚔️ Tứ Tướng</button>
          <button class="thaiat-pill-filter" data-layer="cat">✨ Cát Thần</button>
          <button class="thaiat-pill-filter" data-layer="weather">🌪️ Kỳ & Gió</button>
          <button class="thaiat-pill-filter" data-layer="stars9">🌌 Cửu Tinh</button>
        </div>

        <!-- Vùng Trận Đồ Bát Quái 5x5 -->
        <div id="thaiat-matrix-area">
          <div class="thaiat-grid-5x5" id="thaiat-grid-5x5">
            <!-- 16 Cung sẽ được render tự động -->
          </div>
        </div>

        <!-- Vùng Lá Số 12 Cung Nhân Mệnh (Ẩn mặc định) -->
        <div id="thaiat-menh-area" style="display: none;">
          <div class="thaiat-menh-grid" id="thaiat-menh-grid"></div>
        </div>

        <!-- Bottom Inspection Drawer -->
        <div class="thaiat-drawer" id="thaiat-drawer">
          <div class="thaiat-drawer-title">
            <span id="thaiat-drawer-name">CHI TIẾT CUNG [TÝ]</span>
            <span id="thaiat-drawer-weight" style="color: #94a3b8; font-size: 10px;">Trọng số: 8</span>
          </div>
          <div class="thaiat-drawer-desc" id="thaiat-drawer-desc">
            Chạm vào bất kỳ ô cung nào để đọc toàn văn phân tích Thần Sát và ý nghĩa cát hung.
          </div>
          <div class="thaiat-drawer-advice" id="thaiat-drawer-advice">
            💡 <strong>Chiến lược hành sự:</strong> Đang phân tích...
          </div>
        </div>
      </div>
    `;

    bindEvents();
    setDateAndRender(new Date());
  }

  // Gắn sự kiện tương tác
  function bindEvents() {
    const btnNow = document.getElementById('btn-thaiat-now');
    const btnCalc = document.getElementById('btn-thaiat-calc');
    const dtInput = document.getElementById('thaiat-datetime-input');

    if (btnNow) {
      btnNow.addEventListener('click', () => {
        setDateAndRender(new Date());
      });
    }

    if (btnCalc && dtInput) {
      btnCalc.addEventListener('click', () => {
        if (dtInput.value) {
          setDateAndRender(new Date(dtInput.value));
        }
      });
    }

    // Tabs Kể
    const tabBtns = document.querySelectorAll('.thaiat-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        tabBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentKeType = e.currentTarget.dataset.ke;
        renderCurrentView();
      });
    });

    // Layer Filter Pills
    const layerPills = document.querySelectorAll('.thaiat-pill-filter');
    layerPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        layerPills.forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentLayer = e.currentTarget.dataset.layer;
        renderCurrentView();
      });
    });
  }

  function setDateAndRender(dateObj) {
    currentDate = dateObj;
    const dtInput = document.getElementById('thaiat-datetime-input');
    if (dtInput) {
      const pad = (n) => String(n).padStart(2, '0');
      const str = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}T${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;
      dtInput.value = str;
    }

    if (global.NetaThaiAtEngine) {
      currentChart = global.NetaThaiAtEngine.buildThaiAtChart(dateObj);
      renderCurrentView();
    }
  }

  // Lọc hiển thị sao theo layer
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

  // Render giao diện theo chế độ hiện tại
  function renderCurrentView() {
    if (!currentChart) return;

    // Cập nhật thông tin tiêu đề Can Chi
    const canChiEl = document.getElementById('thaiat-canchi-str');
    if (canChiEl) {
      canChiEl.textContent = `Năm ${currentChart.canChi.nam} • Tháng ${currentChart.canChi.thang} • Ngày ${currentChart.canChi.ngay} • Giờ ${currentChart.canChi.gio} (${currentChart.tietKhi})`;
    }

    const matrixArea = document.getElementById('thaiat-matrix-area');
    const menhArea = document.getElementById('thaiat-menh-area');
    const layerRow = document.getElementById('thaiat-layer-row');

    if (currentKeType === 'menh') {
      if (matrixArea) matrixArea.style.display = 'none';
      if (layerRow) layerRow.style.display = 'none';
      if (menhArea) menhArea.style.display = 'block';
      renderMenhView();
    } else {
      if (matrixArea) matrixArea.style.display = 'block';
      if (layerRow) layerRow.style.display = 'flex';
      if (menhArea) menhArea.style.display = 'none';
      renderMatrix16View();
    }

    inspectPalace(selectedPalace);
  }

  // Render Bàn Trận 16 Cung Bát Quái
  function renderMatrix16View() {
    const gridEl = document.getElementById('thaiat-grid-5x5');
    if (!gridEl) return;

    let keData;
    if (currentKeType === 'gio') keData = currentChart.keGio;
    else if (currentKeType === 'ngay') keData = currentChart.keNgay;
    else if (currentKeType === 'thang') keData = currentChart.keThang;
    else keData = currentChart.keNam;

    const epochBadge = document.getElementById('thaiat-badge-epoch');
    if (epochBadge) {
      epochBadge.textContent = `${keData.donType} • Cục ${keData.cuc} • Nguyên ${keData.nguyen}`;
    }

    // Xây dựng các cell 16 cung
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
        <div class="thaiat-cell ${isActive}" style="${style}" onclick="NetaThaiAtView.inspectPalace('${c.pos}')">
          <div class="thaiat-cell-top">
            <span class="thaiat-cell-name">${c.pos}</span>
            <span class="thaiat-cell-weight">${c.weight}</span>
          </div>
          <div class="thaiat-star-list">${starTags}</div>
        </div>
      `;
    });

    // Trung Cung HUD (3x3 ở tâm)
    let anomaliesHtml = '';
    if (keData.isVoThien) anomaliesHtml += `<span class="badge-anomaly">⚠️ Vô Thiên</span>`;
    if (keData.isVoDia) anomaliesHtml += `<span class="badge-anomaly">⚠️ Vô Địa</span>`;
    if (keData.isVoNhan) anomaliesHtml += `<span class="badge-anomaly">⚠️ Vô Nhân</span>`;

    const hudHtml = `
      <div class="thaiat-hud-center">
        <div class="thaiat-hud-header">
          <span style="font-size: 10px; color: #94a3b8;">${keData.keName}</span>
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

    gridEl.innerHTML = cellsHtml + hudHtml;
  }

  // Render Lá Số Thái Ất Nhân Mệnh 12 Cung
  function renderMenhView() {
    const menhGrid = document.getElementById('thaiat-menh-grid');
    if (!menhGrid || !currentChart.laSoMenh) return;

    let html = '';
    for (let cungKey in currentChart.laSoMenh) {
      const p = currentChart.laSoMenh[cungKey];
      const starTags = p.stars.map(s => {
        const cls = getStarCssClass(s);
        return `<span class="thaiat-star-tag ${cls}">${s}</span>`;
      }).join('');

      html += `
        <div class="thaiat-menh-cell" onclick="NetaThaiAtView.inspectPalace('${p.branch}')">
          <div class="thaiat-menh-name">
            <span>${p.cungName}</span>
            <span style="color: #94a3b8; font-size: 10px;">[${p.branch}]</span>
          </div>
          <div class="thaiat-menh-locma">Lộc: ${p.locVal} • Mã: ${p.maVal} • Đ.Hạn: ${p.daiHanTuoi}t</div>
          <div class="thaiat-star-list" style="margin-top: 4px;">${starTags || '<span style="color:#64748b; font-size:9px;">---</span>'}</div>
        </div>
      `;
    }
    menhGrid.innerHTML = html;
  }

  // Thanh tra chi tiết cung khi chạm
  function inspectPalace(pos) {
    selectedPalace = pos;
    const nameEl = document.getElementById('thaiat-drawer-name');
    const weightEl = document.getElementById('thaiat-drawer-weight');
    const descEl = document.getElementById('thaiat-drawer-desc');
    const adviceEl = document.getElementById('thaiat-drawer-advice');

    if (!nameEl || !currentChart) return;

    let keData = (currentKeType === 'gio') ? currentChart.keGio : currentChart.keNgay;
    const starsHere = [];
    for (let s in keData.stars) {
      if (keData.stars[s] === pos) starsHere.push(s);
    }

    const w = (global.NetaThaiAtEngine && global.NetaThaiAtEngine.QUAI_WEIGHTS[pos]) || 0;
    nameEl.textContent = `CUNG [${pos.toUpperCase()}] • ${starsHere.join(', ') || 'Không có sao chính'}`;
    weightEl.textContent = `Lạc Thư: ${w} điểm`;

    const baseDesc = PALACE_DESCRIPTIONS[pos] || "Phương vị địa bàn Thái Ất.";
    descEl.textContent = baseDesc;

    // Luận giải chiến lược hành sự
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
    adviceEl.innerHTML = advice;

    // Highlight cell
    document.querySelectorAll('.thaiat-cell').forEach(el => el.classList.remove('active-cell'));
    const activeEl = document.querySelector(`.thaiat-cell[onclick*="'${pos}'"]`);
    if (activeEl) activeEl.classList.add('active-cell');
  }

  // Export API ra window
  global.NetaThaiAtView = {
    init: initThaiAtView,
    render: () => {
      if (!currentChart) {
        initThaiAtView();
      } else {
        renderCurrentView();
      }
    },
    setDate: setDateAndRender,
    inspectPalace: inspectPalace
  };

})(typeof window !== 'undefined' ? window : this);
