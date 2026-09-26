/**
 * NETA LIGHT - KỲ MÔN ĐỘN GIÁP VIEW MODULE
 * Hỗ trợ 3 Chế Độ Toàn Diện:
 * 1. 🔮 Dương Bàn (Thời Gia Kỳ Môn theo Chân Thái Dương Thời & Tiết Khí)
 * 2. 🌙 Âm Bàn (Đạo Gia Âm Bàn Kỳ Môn - 1 giờ 1 cục, linh hoạt theo Lịch Âm)
 * 3. 🏡 Phong Thủy Nhà (Kỳ Môn Cửu Cung Phong Thủy - Bát Vi Thần & Lục Sự)
 */

(function (global) {
  'use strict';

  let currentQmdjMode = 'duongban'; // 'duongban' | 'amban' | 'phongthuy'
  let currentQmdjDate = new Date();
  let currentChart = null;
  let currentPatterns = [];
  let isQmdjLunarMode = false;

  // State for Phong Thủy mode
  let ptState = {
    van: 9,           // Vận 9 (2024 - 2043) default, or 8, 7
    huongPalace: 6,   // Càn 6 (Tây Bắc) default
    sonCua: 'Thìn'    // 24 Sơn vị cửa (Thìn default)
  };

  const VI_DICT = {
    "天蓬星": "Thiên Bồng", "天任星": "Thiên Nhậm", "天冲星": "Thiên Xung",
    "天辅星": "Thiên Phụ", "天英星": "Thiên Anh", "天芮星": "Thiên Nhuế",
    "天柱星": "Thiên Trụ", "天心星": "Thiên Tâm", "天禽星": "Thiên Cầm",
    "休门": "Hưu Môn", "生门": "Sinh Môn", "伤门": "Thương Môn",
    "杜门": "Đỗ Môn", "景门": "Cảnh Môn", "死门": "Tử Môn",
    "惊门": "Kinh Môn", "开门": "Khai Môn",
    "直符": "Trực Phù", "值符": "Trực Phù", "腾蛇": "Đằng Xà", "太阴": "Thái Âm", "六合": "Lục Hợp",
    "白虎": "Bạch Hổ", "玄武": "Huyền Vũ", "九地": "Cửu Địa", "九天": "Cửu Thiên",
    "勾陈": "Câu Trần", "朱雀": "Chu Tước", "螣蛇": "Đằng Xà",
    "甲": "Giáp", "乙": "Ất", "丙": "Bính", "丁": "Đinh", "戊": "Mậu",
    "己": "Kỷ", "庚": "Canh", "辛": "Tân", "壬": "Nhâm", "癸": "Quý",
    "子": "Tý", "丑": "Sửu", "寅": "Dần", "卯": "Mão", "辰": "Thìn", "巳": "Tỵ",
    "午": "Ngọ", "未": "Mùi", "申": "Thân", "酉": "Dậu", "戌": "Tuất", "亥": "Hợi",
    "坎": "Khảm (1)", "坤": "Khôn (2)", "震": "Chấn (3)", "巽": "Tốn (4)",
    "中": "Trung (5)", "乾": "Càn (6)", "兑": "Đoài (7)", "艮": "Cấn (8)", "离": "Ly (9)",
    "马": "Mã"
  };

  const PALACE_NAMES = {
    0: "Khảm 1",
    1: "Khôn 2",
    2: "Chấn 3",
    3: "Tốn 4",
    4: "Trung 5",
    5: "Càn 6",
    6: "Đoài 7",
    7: "Cấn 8",
    8: "Ly 9"
  };

  const PALACE_DIRECTIONS = {
    1: "Bắc",
    2: "Tây Nam",
    3: "Đông",
    4: "Đông Nam",
    5: "Trung Cung",
    6: "Tây Bắc",
    7: "Tây",
    8: "Đông Bắc",
    9: "Nam"
  };

  // Clockwise order of 8 palaces around center (NW -> N -> NE -> E -> SE -> S -> SW -> W)
  const CLOCKWISE_8 = [6, 1, 8, 3, 4, 9, 2, 7];

  const STEM_SEQ = ['Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý', 'Đinh', 'Bính', 'Ất'];

  const DOOR_24_SON = {
    'Nhâm': 'Mậu', 'Tý': 'Mậu', 'Quý': 'Mậu', 'Sửu': 'Mậu',
    'Cấn': 'Quý', 'Dần': 'Quý', 'Càn': 'Quý', 'Hợi': 'Quý',
    'Giáp': 'Kỷ', 'Mão': 'Kỷ', 'Tân': 'Kỷ', 'Tuất': 'Kỷ',
    'Ất': 'Nhâm', 'Thìn': 'Nhâm', 'Canh': 'Nhâm', 'Dậu': 'Nhâm',
    'Tốn': 'Canh', 'Tị': 'Canh', 'Khôn': 'Canh', 'Thân': 'Canh',
    'Bính': 'Tân', 'Ngọ': 'Tân', 'Đinh': 'Tân', 'Mùi': 'Tân'
  };

  const ORIGINAL_STARS = {
    1: 'Thiên Bồng', 8: 'Thiên Nhậm', 3: 'Thiên Xung', 4: 'Thiên Phụ',
    9: 'Thiên Anh', 2: 'Thiên Nhuế', 7: 'Thiên Trụ', 6: 'Thiên Tâm'
  };

  const ORIGINAL_DOORS = {
    1: 'Hưu Môn', 8: 'Sinh Môn', 3: 'Thương Môn', 4: 'Đỗ Môn',
    9: 'Cảnh Môn', 2: 'Tử Môn', 7: 'Kinh Môn', 6: 'Khai Môn'
  };

  const STAR_RING = ['Thiên Xung', 'Thiên Phụ', 'Thiên Anh', 'Thiên Nhuế', 'Thiên Trụ', 'Thiên Tâm', 'Thiên Bồng', 'Thiên Nhậm'];
  const DIVINITY_RING = ['Trực Phù', 'Đằng Xà', 'Thái Âm', 'Lục Hợp', 'Câu Trần', 'Chu Tước', 'Cửu Địa', 'Cửu Thiên'];
  const DOOR_RING = ['Hưu Môn', 'Sinh Môn', 'Thương Môn', 'Đỗ Môn', 'Cảnh Môn', 'Tử Môn', 'Kinh Môn', 'Khai Môn'];

  // Ma trận vị trí Cung Trực Sử (A5) từ A2 Phù Thủ và A2 Hướng Nhà (trang 30 KMDJ_BVS.pdf)
  const TRUC_SU_MATRIX = {
    'Giáp': {3: 3, 4: 4, 9: 9, 2: 2, 7: 7, 6: 6, 1: 1, 8: 8},
    'Ất':   {3: 4, 4: 2, 9: 1, 2: 3, 7: 8, 6: 7, 1: 2, 8: 9},
    'Bính': {3: 2, 4: 6, 9: 2, 2: 4, 7: 9, 6: 8, 1: 3, 8: 1},
    'Đinh': {3: 6, 4: 7, 9: 3, 2: 2, 7: 1, 6: 9, 1: 4, 8: 2},
    'Mậu':  {3: 7, 4: 8, 9: 4, 2: 6, 7: 2, 6: 1, 1: 2, 8: 3},
    'Kỷ':   {3: 8, 4: 9, 9: 2, 2: 7, 7: 3, 6: 2, 1: 6, 8: 4},
    'Canh': {3: 9, 4: 1, 9: 6, 2: 8, 7: 4, 6: 3, 1: 7, 8: 2},
    'Tân':  {3: 1, 4: 2, 9: 7, 2: 9, 7: 2, 6: 4, 1: 8, 8: 6},
    'Nhâm': {3: 2, 4: 3, 9: 8, 2: 1, 7: 6, 6: 2, 1: 9, 8: 7},
    'Quý':  {3: 3, 4: 4, 9: 9, 2: 2, 7: 7, 6: 6, 1: 1, 8: 8}
  };

  const CAT_BINH = ["Cảnh Môn", "Đỗ Môn", "Thiên Anh", "Thiên Xung", "Chu Tước", "Câu Trần", "Đằng Xà"];
  const CAT_CAT = ["Hưu Môn", "Sinh Môn", "Khai Môn", "Thiên Phụ", "Thiên Nhậm", "Thiên Tâm", "Thiên Cầm", "Trực Phù", "Thái Âm", "Lục Hợp", "Cửu Thiên", "Cửu Địa", "Giáp", "Ất", "Bính", "Đinh", "Mậu"];
  const CAT_HUNG = ["Thương Môn", "Tử Môn", "Kinh Môn", "Thiên Bồng", "Thiên Nhuế", "Thiên Trụ", "Huyền Vũ", "Bạch Hổ", "Canh", "Tân", "Nhâm", "Quý", "Kỷ"];

  function translate(text) {
    if (!text) return "";
    let res = String(text);
    const keys = Object.keys(VI_DICT).sort((a, b) => b.length - a.length);
    keys.forEach(k => { res = res.split(k).join(VI_DICT[k]); });
    return res;
  }

  function getCatClass(text) {
    const t = (text || "").trim();
    if (CAT_CAT.some(c => t.includes(c) || c === t)) return "cat-good";
    if (CAT_HUNG.some(c => t.includes(c) || c === t)) return "cat-bad";
    if (CAT_BINH.some(c => t.includes(c) || c === t)) return "cat-mid";
    return "";
  }

  function initQmdjView() {
    const container = document.getElementById('view-qmdj');
    if (!container) return;
    renderQmdj();
  }

  /**
   * Tính Cục Số Đạo Gia Âm Bàn
   */
  function computeYinPanRound(date) {
    let lunarYearChi = 7;
    let lunarMonth = 8;
    let lunarDay = 16;
    let hourChi = 12;

    if (global.NetaCalendarEngine && typeof global.NetaCalendarEngine.getFullDayInfo === 'function') {
      const info = global.NetaCalendarEngine.getFullDayInfo(date);
      const chiNames = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
      const yChiStr = (info.canChi.year || '').split(' ')[1] || 'Ngọ';
      const fIdx = chiNames.indexOf(yChiStr);
      if (fIdx !== -1) lunarYearChi = fIdx + 1;
      lunarMonth = info.lunar.month || (date.getMonth() + 1);
      lunarDay = info.lunar.day || date.getDate();
      const h = date.getHours();
      hourChi = (Math.floor((h + 1) / 2) % 12) + 1;
    } else {
      lunarMonth = date.getMonth() + 1;
      lunarDay = date.getDate();
      hourChi = (Math.floor((date.getHours() + 1) / 2) % 12) + 1;
    }

    const sum = lunarYearChi + lunarMonth + lunarDay + hourChi;
    let cuc = sum % 9;
    if (cuc === 0) cuc = 9;

    let isYangDun = true;
    if (global.NetaCalendarEngine && typeof global.NetaCalendarEngine.getSolarTerm === 'function') {
      const term = global.NetaCalendarEngine.getSolarTerm(date.getDate(), date.getMonth() + 1, date.getFullYear());
      const YANG_TERMS = ["Đông Chí", "Tiểu Hàn", "Đại Hàn", "Lập Xuân", "Vũ Thủy", "Kinh Trập", "Xuân Phân", "Thanh Minh", "Cốc Vũ", "Lập Hạ", "Tiểu Mãn", "Mang Chủng"];
      isYangDun = YANG_TERMS.includes(term);
    } else {
      const m = date.getMonth() + 1;
      isYangDun = (m < 6 || m === 12);
    }

    return isYangDun ? cuc : -cuc;
  }

  /**
   * Tính Bàn Kỳ Môn Phong Thủy Nhà Cố Định (KMDJ_BVS.pdf)
   */
  function computeFengShuiQMDJ(van, huongPalace, sonCua) {
    // 1. Địa bàn A2: Mậu tại cung van, đi thuận số Lạc Thư
    const a2 = {};
    for (let i = 0; i < STEM_SEQ.length; i++) {
      const p = (van - 1 + i) % 9 + 1;
      if (p !== 5) {
        a2[p] = STEM_SEQ[i];
      }
    }
    // Cung 5 ký gửi Cung 2 (Khôn)
    const p5Stem = STEM_SEQ[(5 - van + 9) % 9];
    a2[2] = a2[2] ? `${a2[2]}/${p5Stem}` : p5Stem;

    // 2. Phù Thủ A1 từ 24 Sơn vị Cửa
    const phuThu = DOOR_24_SON[sonCua] || 'Mậu';

    // 3. Can A2 ở Hướng Nhà
    const huongCanRaw = a2[huongPalace] || 'Mậu';
    const huongCan = huongCanRaw.split('/')[0];

    // 4. Tìm cung của Can Phù Thủ ở Địa Bàn A2
    let a2PhuThuPalace = 8;
    for (const [p, stem] of Object.entries(a2)) {
      if (stem.includes(phuThu)) {
        a2PhuThuPalace = parseInt(p);
        break;
      }
    }

    // 5. Vòng 8 cung theo chiều kim đồng hồ bắt đầu từ Hướng Nhà
    const hIdx = CLOCKWISE_8.indexOf(huongPalace);
    const clockwiseFromHuong = CLOCKWISE_8.slice(hIdx).concat(CLOCKWISE_8.slice(0, hIdx));

    // Vòng A2 bắt đầu từ Hướng Nhà
    const a2Ring = clockwiseFromHuong.map(p => a2[p]);

    // Vòng A1 bắt đầu từ Hướng Nhà: can Phù Thủ đặt ở Hướng Nhà, các can sau đi theo thứ tự vòng A2
    let ptIdx = a2Ring.findIndex(stem => stem.includes(phuThu));
    if (ptIdx === -1) ptIdx = 0;
    const a1Ring = a2Ring.slice(ptIdx).concat(a2Ring.slice(0, ptIdx));

    // 6. Cửu Tinh A3: Sao gốc của cung A2 Phù Thủ đặt ở Hướng Nhà, xoay thuận kim đồng hồ
    const rootStar = ORIGINAL_STARS[a2PhuThuPalace] || 'Thiên Nhậm';
    const sIdx = STAR_RING.indexOf(rootStar);
    const a3Ring = STAR_RING.slice(sIdx).concat(STAR_RING.slice(0, sIdx));

    // 7. Bát Thần A4: Trực Phù đặt ở Hướng Nhà, xoay thuận kim đồng hồ
    const a4Ring = [...DIVINITY_RING];

    // 8. Bát Môn A5 & Trực Sử:
    const rootDoor = ORIGINAL_DOORS[a2PhuThuPalace] || 'Sinh Môn';
    const rowObj = TRUC_SU_MATRIX[huongCan] || TRUC_SU_MATRIX['Giáp'];
    const trucSuPalace = rowObj[a2PhuThuPalace] || 2;

    const tsIdx = CLOCKWISE_8.indexOf(trucSuPalace);
    const clockwiseFromTs = CLOCKWISE_8.slice(tsIdx).concat(CLOCKWISE_8.slice(0, tsIdx));
    const dIdx = DOOR_RING.indexOf(rootDoor);
    const a5Doors = DOOR_RING.slice(dIdx).concat(DOOR_RING.slice(0, dIdx));

    const a5ByPalace = {};
    clockwiseFromTs.forEach((p, idx) => {
      a5ByPalace[p] = a5Doors[idx];
    });

    const a5Ring = clockwiseFromHuong.map(p => a5ByPalace[p]);

    // Tạo cấu trúc 8 cung + 1 trung cung chuẩn cho hiển thị bàn 9 cung
    const palacesData = {};
    clockwiseFromHuong.forEach((p, idx) => {
      palacesData[p] = {
        index: p - 1, // 0..8
        palaceNumber: p,
        door: a5Ring[idx],
        star: a3Ring[idx],
        divinity: a4Ring[idx],
        hcs: [a1Ring[idx]],
        ecs: [a2Ring[idx]],
        de: false,
        hs: false
      };
    });

    // Trung cung 5
    palacesData[5] = {
      index: 4,
      palaceNumber: 5,
      door: "",
      star: "Thiên Cầm",
      divinity: "",
      hcs: [p5Stem],
      ecs: [p5Stem],
      de: false,
      hs: false
    };

    // Ma trận hiển thị 3x3 Lạc Thư:
    // Hàng 1: Tốn 4, Ly 9, Khôn 2
    // Hàng 2: Chấn 3, Trung 5, Đoài 7
    // Hàng 3: Cấn 8, Khảm 1, Càn 6
    const layout = [
      [4, 9, 2],
      [3, 5, 7],
      [8, 1, 6]
    ];

    const box = layout.map(row => row.map(pNum => {
      const p = palacesData[pNum];
      return {
        index: p.index,
        palaceNumber: p.palaceNumber,
        getDoor: () => p.door,
        getStar: () => p.star,
        getDivinity: () => p.divinity,
        getHCS: () => p.hcs,
        getECS: () => p.ecs,
        de: p.de,
        hs: p.hs
      };
    }));

    return {
      isFengShui: true,
      van,
      huongPalace,
      huongName: `${PALACE_NAMES[huongPalace - 1]} (${PALACE_DIRECTIONS[huongPalace]})`,
      sonCua,
      phuThu,
      trucSuPalace,
      trucSuPalaceName: `${PALACE_NAMES[trucSuPalace - 1]} (${PALACE_DIRECTIONS[trucSuPalace]})`,
      rootDoor,
      rootStar,
      box,
      palacesData
    };
  }

  function computeQmdjChart(date = currentQmdjDate) {
    if (currentQmdjMode === 'phongthuy') {
      const ptChart = computeFengShuiQMDJ(ptState.van, ptState.huongPalace, ptState.sonCua);
      currentChart = ptChart;
      currentPatterns = [];
      return { chart: ptChart, patterns: [] };
    }

    if (!global.QMDJCore || !global.QMDJCore.TheArtOfBecomingInvisible) {
      console.error("QMDJCore engine not found!");
      return null;
    }

    try {
      let roundArg = undefined;
      if (currentQmdjMode === 'amban') {
        roundArg = computeYinPanRound(date);
      }

      const chart = new global.QMDJCore.TheArtOfBecomingInvisible(date, roundArg);
      const patterns = global.QMDJCore.getChartPatterns ? global.QMDJCore.getChartPatterns(chart) : [];
      currentChart = chart;
      currentPatterns = patterns;
      return { chart, patterns };
    } catch (e) {
      console.error("Error computing QMDJ chart:", e);
      return null;
    }
  }

  function renderQmdj() {
    const container = document.getElementById('view-qmdj');
    if (!container) return;

    const data = computeQmdjChart(currentQmdjDate);
    if (!data || !data.chart) {
      container.innerHTML = `
        <div class="module-placeholder">
          <div class="placeholder-icon">🔮</div>
          <h2 class="placeholder-title">LỖI KHỞI TẠO BÀN KỲ MÔN</h2>
          <p class="placeholder-desc">Không thể tính toán bàn cờ cho thời điểm này. Vui lòng thử lại.</p>
        </div>
      `;
      return;
    }

    const { chart, patterns } = data;
    const isPt = currentQmdjMode === 'phongthuy';

    // Render Sub-Tabs (3 chế độ)
    let modeTabsHtml = `
      <div class="qmdj-mode-tabs">
        <button type="button" class="qmdj-tab-btn ${currentQmdjMode === 'duongban' ? 'active' : ''}" data-mode="duongban">
          🔮 Dương Bàn
        </button>
        <button type="button" class="qmdj-tab-btn ${currentQmdjMode === 'amban' ? 'active' : ''}" data-mode="amban">
          🌙 Âm Bàn
        </button>
        <button type="button" class="qmdj-tab-btn ${currentQmdjMode === 'phongthuy' ? 'active' : ''}" data-mode="phongthuy">
          🏡 Phong Thủy
        </button>
      </div>
    `;

    if (isPt) {
      renderPhongThuyMode(container, modeTabsHtml, chart);
    } else {
      renderTimeMode(container, modeTabsHtml, chart, patterns);
    }
  }

  /**
   * Render Chế Độ Thời Gian (Dương Bàn hoặc Âm Bàn)
   */
  function renderTimeMode(container, modeTabsHtml, chart, patterns) {
    const isAmBan = currentQmdjMode === 'amban';
    const roundVal = chart.round || 1;
    const roundText = isAmBan
      ? `Âm Bàn • ${roundVal > 0 ? 'Dương ' + roundVal : 'Âm ' + Math.abs(roundVal)} Cục`
      : (roundVal > 0 ? `Dương ${roundVal} Cục` : `Âm ${Math.abs(roundVal)} Cục`);

    const pillars = {
      year: chart.year ? translate(chart.year.cstb(true)) : '',
      month: chart.month ? translate(chart.month.cstb(true)) : '',
      day: chart.date ? translate(chart.date.cstb(true)) : '',
      hour: chart.hour ? translate(chart.hour.cstb(true)) : ''
    };

    const d = currentQmdjDate;
    const pad = n => String(n).padStart(2, '0');
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())} - ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

    // Get 24 Solar term
    let solarTerm = "Xuân Phân";
    let solarTermStr = "Xuân Phân";
    let solarTermFullStr = "";
    let std = null;
    if (global.NetaCalendarEngine) {
      if (typeof global.NetaCalendarEngine.getSolarTermDetails === 'function') {
        std = global.NetaCalendarEngine.getSolarTermDetails(d.getDate(), d.getMonth() + 1, d.getFullYear(), d.getHours(), d.getMinutes());
        solarTerm = std.term;
        solarTermStr = std.displayStr;
        solarTermFullStr = std.fullDisplayStr;
      } else {
        solarTerm = global.NetaCalendarEngine.getSolarTerm(d.getDate(), d.getMonth() + 1, d.getFullYear());
        solarTermStr = solarTerm;
      }
    }

    let dayVal = d.getDate();
    let monthVal = d.getMonth() + 1;
    let yearVal = d.getFullYear();
    if (isQmdjLunarMode && global.NetaCalendarEngine) {
      const lInfo = global.NetaCalendarEngine.getFullDayInfo(d);
      dayVal = lInfo.lunar.day;
      monthVal = lInfo.lunar.month;
      yearVal = lInfo.lunar.year;
    }

    container.innerHTML = `
      <div class="qmdj-view-container">
        ${modeTabsHtml}

        <!-- Unified Control Card -->
        <div class="unified-ctrl-card">
          <!-- Row 1: Calendar switch & Date Box -->
          <div class="ucc-row ucc-row-date">
            <div class="ucc-pill-cal">
              <button type="button" class="ucc-pill-btn ${!isQmdjLunarMode ? 'active' : ''}" id="btn-qmdj-solar">☀️ Dương</button>
              <button type="button" class="ucc-pill-btn ${isQmdjLunarMode ? 'active' : ''}" id="btn-qmdj-lunar">🌙 Âm</button>
            </div>
            <div class="ucc-date-box" id="qmdj-ucc-date-box" title="Nhập ngày tháng hoặc chạm vào dấu gạch/nút lịch để mở bảng chọn">
              <input type="number" id="qmdj-input-day" class="num-box num-day" min="1" max="31" value="${dayVal}" placeholder="Ngày">
              <span class="num-slash">/</span>
              <input type="number" id="qmdj-input-month" class="num-box num-month" min="1" max="12" value="${monthVal}" placeholder="Tháng">
              <span class="num-slash">/</span>
              <input type="number" id="qmdj-input-year" class="num-box num-year" min="1900" max="2100" value="${yearVal}" placeholder="Năm">
              <button type="button" class="ucc-btn-year" id="btn-qmdj-year-jumper" title="Chọn nhanh thập niên & năm">⚡Năm</button>
              <label class="btn-picker-cal" id="qmdj-btn-native-cal" title="Mở bảng chọn Ngày & Giờ">
                📅
                <input type="datetime-local" id="qmdj-date-picker" value="${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}" class="native-hidden-date">
              </label>
            </div>
          </div>

          <!-- Row 2: Can Chi + Numeric Time & Hour Stepping -->
          <div class="ucc-row ucc-row-time">
            <div class="ucc-time-box">
              <select id="qmdj-select-canchi" class="select-canchi">
                <option value="0" ${[23, 0].includes(d.getHours()) ? 'selected' : ''}>Tý (23-01h)</option>
                <option value="2" ${[1, 2].includes(d.getHours()) ? 'selected' : ''}>Sửu (01-03h)</option>
                <option value="4" ${[3, 4].includes(d.getHours()) ? 'selected' : ''}>Dần (03-05h)</option>
                <option value="6" ${[5, 6].includes(d.getHours()) ? 'selected' : ''}>Mão (05-07h)</option>
                <option value="8" ${[7, 8].includes(d.getHours()) ? 'selected' : ''}>Thìn (07-09h)</option>
                <option value="10" ${[9, 10].includes(d.getHours()) ? 'selected' : ''}>Tỵ (09-11h)</option>
                <option value="12" ${[11, 12].includes(d.getHours()) ? 'selected' : ''}>Ngọ (11-13h)</option>
                <option value="14" ${[13, 14].includes(d.getHours()) ? 'selected' : ''}>Mùi (13-15h)</option>
                <option value="16" ${[15, 16].includes(d.getHours()) ? 'selected' : ''}>Thân (15-17h)</option>
                <option value="18" ${[17, 18].includes(d.getHours()) ? 'selected' : ''}>Dậu (17-19h)</option>
                <option value="20" ${[19, 20].includes(d.getHours()) ? 'selected' : ''}>Tuất (19-21h)</option>
                <option value="22" ${[21, 22].includes(d.getHours()) ? 'selected' : ''}>Hợi (21-23h)</option>
              </select>
              <input type="number" id="qmdj-input-hour" class="num-box num-hour" min="0" max="23" value="${pad(d.getHours())}" placeholder="Giờ">
              <span class="num-colon">:</span>
              <input type="number" id="qmdj-input-minute" class="num-box num-min" min="0" max="59" value="${pad(d.getMinutes())}" placeholder="Phút">
            </div>
            <div class="ucc-step-group">
              <button class="ucc-step-btn" id="btn-qmdj-prev-hour" title="Lùi 1 Giờ (2 tiếng)">◀ 2h</button>
              <button class="ucc-step-btn" id="btn-qmdj-next-hour" title="Tiến 1 Giờ (2 tiếng)">2h ▶</button>
            </div>
          </div>

          <!-- Row 3: Actions -->
          <div class="ucc-row ucc-row-actions">
            <button class="ucc-btn-now" id="btn-qmdj-now" title="Đặt lại về thời điểm hiện tại">⚡ Giờ thực</button>
            <div class="qmdj-cuc-badge" title="Cục số và Tiết khí: ${solarTermFullStr || solarTermStr}">
              <span>${roundText}</span>
              <span class="cuc-dot">•</span>
              <span>${solarTerm}</span>
            </div>
            <button class="ucc-btn-submit" id="btn-qmdj-submit" title="Lập bàn Kỳ Môn">🔮 Lập Bàn</button>
          </div>
        </div>

        <!-- Solar Term Info Strip -->
        <div class="qmdj-term-strip">
          <span>${isAmBan ? '🌙 Đạo Gia Âm Bàn' : '🌿 Tiết'}: <strong>${solarTerm}</strong></span>
          <span class="term-sep">•</span>
          <span>Chuyển tiết: <strong class="tk-exact-time">${std ? std.transition.formatted : (solarTermFullStr.includes('Chuyển: ') ? solarTermFullStr.split('Chuyển: ')[1].replace(')', '') : '')}</strong></span>
        </div>

        <!-- 4 Pillars Summary Header -->
        <div class="qmdj-pillars-strip">
          <div class="q-pillar"><span class="q-lbl">NĂM</span><strong class="q-val">${pillars.year}</strong></div>
          <div class="q-pillar"><span class="q-lbl">THÁNG</span><strong class="q-val">${pillars.month}</strong></div>
          <div class="q-pillar"><span class="q-lbl">NGÀY</span><strong class="q-val">${pillars.day}</strong></div>
          <div class="q-pillar highlight-hour"><span class="q-lbl">GIỜ</span><strong class="q-val">${pillars.hour}</strong></div>
        </div>

        <!-- 9-Palace Matrix (Lưới 3x3 Lạc Thư Chuẩn) -->
        <div class="qmdj-matrix-grid">
          ${renderPalacesHTML(chart, patterns, pillars, timeStr)}
        </div>

        <!-- Patterns (Cát/Hung Cách Cục) List Accordion -->
        <div class="qmdj-patterns-box">
          <div class="patterns-header">
            <span>✨ CÁT / HUNG CÁCH CỤC (${patterns.length})</span>
            <span class="patterns-hint">Chạm cung để xem chi tiết</span>
          </div>
          <div class="patterns-chips">
            ${patterns.slice(0, 8).map(p => `
              <span class="pattern-chip ${p.type === 'cat' ? 'chip-cat' : 'chip-hung'}" title="${p.desc || ''}">
                ${p.name}
              </span>
            `).join('')}
            ${patterns.length > 8 ? `<span class="pattern-chip chip-more">+${patterns.length - 8} cách cục</span>` : ''}
          </div>
        </div>
      </div>

      <!-- Palace Detail Modal -->
      <div class="modal-overlay" id="qmdj-palace-modal" style="display: none;">
        <div class="modal-dialog qmdj-palace-dialog">
          <div class="guide-header">
            <h2 id="qmdj-modal-title">🏰 Chi Tiết Cung Kỳ Môn</h2>
            <button class="modal-close" id="qmdj-modal-close" aria-label="Đóng">&times;</button>
          </div>
          <div class="qmdj-modal-body" id="qmdj-modal-body">
            <!-- Dynamically populated -->
          </div>
        </div>
      </div>
    `;

    bindQmdjTimeEvents(chart, patterns);
    bindModeTabsEvents();
  }

  /**
   * Render Chế Độ Phong Thủy Nhà Cố Định
   */
  function renderPhongThuyMode(container, modeTabsHtml, chart) {
    const SƠN_LIST = Object.keys(DOOR_24_SON);

    container.innerHTML = `
      <div class="qmdj-view-container">
        ${modeTabsHtml}

        <!-- Phong Thuy Control Card -->
        <div class="unified-ctrl-card pt-ctrl-card">
          <!-- Row 1: Vận Nhà & Hướng Nhà -->
          <div class="ucc-row pt-row-params">
            <div class="pt-field-group">
              <label class="pt-field-lbl" for="pt-select-van">🏛️ VẬN:</label>
              <select id="pt-select-van" class="pt-select">
                <option value="9" ${ptState.van === 9 ? 'selected' : ''}>Vận 9 (2024-2043) ★</option>
                <option value="8" ${ptState.van === 8 ? 'selected' : ''}>Vận 8 (2004-2023)</option>
                <option value="7" ${ptState.van === 7 ? 'selected' : ''}>Vận 7 (1984-2003)</option>
                <option value="1" ${ptState.van === 1 ? 'selected' : ''}>Vận 1 (1864-1883)</option>
                <option value="2" ${ptState.van === 2 ? 'selected' : ''}>Vận 2 (1884-1903)</option>
                <option value="3" ${ptState.van === 3 ? 'selected' : ''}>Vận 3 (1904-1923)</option>
                <option value="4" ${ptState.van === 4 ? 'selected' : ''}>Vận 4 (1924-1943)</option>
                <option value="5" ${ptState.van === 5 ? 'selected' : ''}>Vận 5 (1944-1963)</option>
                <option value="6" ${ptState.van === 6 ? 'selected' : ''}>Vận 6 (1964-1983)</option>
              </select>
            </div>

            <div class="pt-field-group">
              <label class="pt-field-lbl" for="pt-select-huong">🧭 HƯỚNG NHÀ:</label>
              <select id="pt-select-huong" class="pt-select">
                <option value="6" ${ptState.huongPalace === 6 ? 'selected' : ''}>Càn 6 (Tây Bắc)</option>
                <option value="1" ${ptState.huongPalace === 1 ? 'selected' : ''}>Khảm 1 (Bắc)</option>
                <option value="8" ${ptState.huongPalace === 8 ? 'selected' : ''}>Cấn 8 (Đông Bắc)</option>
                <option value="3" ${ptState.huongPalace === 3 ? 'selected' : ''}>Chấn 3 (Đông)</option>
                <option value="4" ${ptState.huongPalace === 4 ? 'selected' : ''}>Tốn 4 (Đông Nam)</option>
                <option value="9" ${ptState.huongPalace === 9 ? 'selected' : ''}>Ly 9 (Nam)</option>
                <option value="2" ${ptState.huongPalace === 2 ? 'selected' : ''}>Khôn 2 (Tây Nam)</option>
                <option value="7" ${ptState.huongPalace === 7 ? 'selected' : ''}>Đoài 7 (Tây)</option>
              </select>
            </div>
          </div>

          <!-- Row 2: Vị Cửa 24 Sơn & Lập Bàn -->
          <div class="ucc-row pt-row-cua">
            <div class="pt-field-group" style="flex: 1.4;">
              <label class="pt-field-lbl" for="pt-select-cua">🚪 VỊ CỬA (24 SƠN):</label>
              <select id="pt-select-cua" class="pt-select">
                ${SƠN_LIST.map(son => `
                  <option value="${son}" ${ptState.sonCua === son ? 'selected' : ''}>Sơn ${son} (Phù: ${DOOR_24_SON[son]})</option>
                `).join('')}
              </select>
            </div>
            <button type="button" class="ucc-btn-submit pt-btn-submit" id="btn-pt-submit" title="Lập Bàn Kỳ Môn Phong Thủy">
              🔮 Lập Bàn
            </button>
          </div>
        </div>

        <!-- Phong Thủy Info Strip -->
        <div class="qmdj-term-strip">
          <span>🏡 <strong>Kỳ Môn Cửu Cung Phong Thủy</strong></span>
          <span class="term-sep">•</span>
          <span>Vận: <strong>${chart.van}</strong></span>
          <span class="term-sep">•</span>
          <span>Phù Thủ: <strong class="tk-exact-time">${chart.phuThu}</strong></span>
          <span class="term-sep">•</span>
          <span>Trực Sử: <strong class="tk-exact-time">${chart.trucSuPalaceName}</strong></span>
        </div>

        <!-- Parameters Summary Header -->
        <div class="qmdj-pillars-strip pt-summary-strip">
          <div class="q-pillar"><span class="q-lbl">VẬN NHÀ</span><strong class="q-val">Vận ${chart.van}</strong></div>
          <div class="q-pillar"><span class="q-lbl">HƯỚNG NHÀ</span><strong class="q-val">${PALACE_DIRECTIONS[chart.huongPalace]}</strong></div>
          <div class="q-pillar"><span class="q-lbl">VỊ CỬA</span><strong class="q-val">Sơn ${chart.sonCua}</strong></div>
          <div class="q-pillar highlight-hour"><span class="q-lbl">TRỰC PHÙ</span><strong class="q-val">${chart.rootStar}</strong></div>
        </div>

        <!-- 9-Palace Matrix -->
        <div class="qmdj-matrix-grid">
          ${renderPalacesHTML(chart, [], {}, `VẬN ${chart.van} • ${chart.huongName}`)}
        </div>

        <!-- Dương Trạch Lục Sự Recommendations -->
        <div class="pt-luc-su-box">
          <div class="pt-ls-header">
            <span>✨ BỐ TRÍ DƯƠNG TRẠCH LỤC SỰ (KỲ MÔN NHÀ)</span>
            <span class="pt-ls-sub">Cố vấn: Sách Kỳ Môn Phong Thủy</span>
          </div>
          <div class="pt-ls-grid">
            ${renderLucSuItems(chart)}
          </div>
        </div>
      </div>

      <!-- Palace Detail Modal -->
      <div class="modal-overlay" id="qmdj-palace-modal" style="display: none;">
        <div class="modal-dialog qmdj-palace-dialog">
          <div class="guide-header">
            <h2 id="qmdj-modal-title">🏰 Chi Tiết Cung Phong Thủy</h2>
            <button class="modal-close" id="qmdj-modal-close" aria-label="Đóng">&times;</button>
          </div>
          <div class="qmdj-modal-body" id="qmdj-modal-body">
            <!-- Dynamically populated -->
          </div>
        </div>
      </div>
    `;

    bindPhongThuyEvents(chart);
    bindModeTabsEvents();
  }

  function renderLucSuItems(chart) {
    const pData = chart.palacesData || {};
    // Find palaces by Door
    let doMonP = null, canhMonP = null, huuMonP = null, sinhMonP = null, khaiMonP = null, trucPhuP = null;

    Object.values(pData).forEach(p => {
      if (p.door === 'Đỗ Môn') doMonP = p;
      if (p.door === 'Cảnh Môn') canhMonP = p;
      if (p.door === 'Hưu Môn') huuMonP = p;
      if (p.door === 'Sinh Môn') sinhMonP = p;
      if (p.door === 'Khai Môn') khaiMonP = p;
      if (p.divinity === 'Trực Phù') trucPhuP = p;
    });

    const getPName = (p) => p ? `${PALACE_NAMES[p.palaceNumber - 1]} (${PALACE_DIRECTIONS[p.palaceNumber]})` : 'Chưa định';

    return `
      <div class="pt-ls-card card-tho">
        <div class="ls-icon">🕊️</div>
        <div class="ls-info">
          <div class="ls-title">BÀN THỜ / PHÒNG THỜ</div>
          <div class="ls-loc">Bố trí tại: <strong>${getPName(doMonP)} (Đỗ Môn)</strong></div>
          <div class="ls-note">Bàn thờ quay ra ngoài, khi vái lạy lưng quay về <strong>${getPName(trucPhuP)}</strong> (Trực Phù phù trợ cao quý nhất).</div>
        </div>
      </div>

      <div class="pt-ls-card card-khach">
        <div class="ls-icon">🛋️</div>
        <div class="ls-info">
          <div class="ls-title">PHÒNG KHÁCH & BẾP</div>
          <div class="ls-loc">Bố trí tại: <strong>${getPName(canhMonP)} (Cảnh Môn)</strong></div>
          <div class="ls-note">Nơi sinh hoạt vui tươi, hội tụ hỏa khí quang minh và giao tế nồng ấm.</div>
        </div>
      </div>

      <div class="pt-ls-card card-ngu">
        <div class="ls-icon">🛏️</div>
        <div class="ls-info">
          <div class="ls-title">PHÒNG NGỦ / NGHỈ NGƠI</div>
          <div class="ls-loc">Bố trí tại: <strong>${getPName(huuMonP)} (Hưu Môn)</strong></div>
          <div class="ls-note">Cung khí an tĩnh, tàng phong tụ khí, giúp giấc ngủ sâu và tái tạo năng lượng.</div>
        </div>
      </div>

      <div class="pt-ls-card card-bancong">
        <div class="ls-icon">🌿</div>
        <div class="ls-info">
          <div class="ls-title">BAN CÔNG / MINH ĐƯỜNG</div>
          <div class="ls-loc">Bố trí tại: <strong>${getPName(sinhMonP)} (Sinh Môn)</strong></div>
          <div class="ls-note">Cửa đón dương khí và tài lộc mạnh nhất cho cả ngôi nhà.</div>
        </div>
      </div>

      <div class="pt-ls-card card-viec">
        <div class="ls-icon">💼</div>
        <div class="ls-info">
          <div class="ls-title">PHÒNG / BÀN LÀM VIỆC</div>
          <div class="ls-loc">Bố trí tại: <strong>${getPName(sinhMonP)}</strong> hoặc <strong>${getPName(khaiMonP)}</strong></div>
          <div class="ls-note">Sinh Môn sinh tài lợi, Khai Môn mở rộng quan lộ và cơ hội sự nghiệp.</div>
        </div>
      </div>

      <div class="pt-ls-card card-ky">
        <div class="ls-icon">⚠️</div>
        <div class="ls-info">
          <div class="ls-title">LƯU Ý TRÁNH ĐẶT BÀN LÀM VIỆC</div>
          <div class="ls-loc">Tránh các cung: <strong>Thương, Kinh, Tử Môn</strong></div>
          <div class="ls-note">Thương & Kinh dễ gây bất an, hao tài, tranh cãi. Tử Môn công việc dễ bế tắc.</div>
        </div>
      </div>
    `;
  }

  function renderPalacesHTML(chart, patterns, pillars, timeStr) {
    const box = chart.box;
    let html = '';

    box.forEach((row) => {
      row.forEach((palace) => {
        const isCenter = palace.index === 4;
        const pIndex = palace.index; // 0-8
        const door = translate(palace.getDoor(true));
        const stars = Array.isArray(palace.getStar(true)) ? palace.getStar(true).map(translate) : [translate(palace.getStar(true))];
        const divinity = translate(palace.getDivinity(true));
        const hcs = Array.isArray(palace.getHCS(true)) ? palace.getHCS(true).map(translate) : [translate(palace.getHCS(true))];
        const ecs = Array.isArray(palace.getECS(true)) ? palace.getECS(true).map(translate) : [translate(palace.getECS(true))];
        const isVoid = palace.de;
        const isHorse = palace.hs;

        const palPatterns = patterns.filter(p => parseInt(p.palaceIndex) === pIndex);

        if (isCenter) {
          html += `
            <div class="qmdj-palace-cell center-palace" data-palace-index="${pIndex}">
              <div class="center-content">
                <div class="center-symbol">☯</div>
                <div class="center-title">TRUNG CUNG (5)</div>
                <div class="center-time">${timeStr}</div>
                <div class="center-ecs-stems">${chart.isFengShui ? 'Ký Cung 2 (Khôn)' : 'Thiên Cầm: ' + hcs.join(' ')}</div>
              </div>
            </div>
          `;
        } else {
          const palaceName = PALACE_NAMES[pIndex] || `Cung ${pIndex + 1}`;
          html += `
            <div class="qmdj-palace-cell" data-palace-index="${pIndex}">
              <!-- Top Row: Thần & Số Cung -->
              <div class="p-top">
                <span class="p-divinity ${getCatClass(divinity)}">${divinity}</span>
                <div class="p-top-right">
                  ${isVoid ? '<span class="p-void-mark" title="Tuần Không">〇</span>' : ''}
                  <span class="p-num">${pIndex + 1}</span>
                </div>
              </div>

              <!-- Mid Row: Cửa & Sao (trái), Can Thiên Bàn (phải) -->
              <div class="p-mid">
                <div class="p-door-star">
                  <div class="p-door ${getCatClass(door)}">${door}</div>
                  <div class="p-stars">
                    ${stars.map(s => `<span class="${getCatClass(s)}">${s}</span>`).join(' ')}
                  </div>
                </div>
                <div class="p-stems-right">
                  ${hcs.map(stem => `<span class="p-hcs ${getCatClass(stem)}">${stem}</span>`).join('')}
                </div>
              </div>

              <!-- Bottom Row: Tên Cung & Can Địa Bàn -->
              <div class="p-bot">
                <div class="p-bot-left">
                  <span class="p-cung-name">${palaceName}</span>
                  ${isHorse ? '<span class="p-horse" title="Mã Tinh">🐎</span>' : ''}
                </div>
                <div class="p-ecs">
                  ${ecs.map(stem => `<span class="p-ecs-stem ${getCatClass(stem)}">${stem}</span>`).join(' ')}
                </div>
              </div>

              ${palPatterns.length > 0 ? `
                <div class="p-indicator-dot ${palPatterns.some(p => p.type === 'cat') ? 'dot-cat' : 'dot-hung'}"></div>
              ` : ''}
            </div>
          `;
        }
      });
    });

    return html;
  }

  function bindModeTabsEvents() {
    const tabBtns = document.querySelectorAll('.qmdj-tab-btn');
    tabBtns.forEach(btn => {
      btn.onclick = () => {
        const mode = btn.getAttribute('data-mode');
        if (mode && mode !== currentQmdjMode) {
          currentQmdjMode = mode;
          renderQmdj();
        }
      };
    });
  }

  function bindTimeCellClickEvents(chart, patterns) {
    const cells = document.querySelectorAll('.qmdj-palace-cell');
    cells.forEach(cell => {
      cell.onclick = () => {
        const pIndex = parseInt(cell.getAttribute('data-palace-index'));
        openPalaceDetailModal(chart, patterns, pIndex);
      };
    });

    const modalClose = document.getElementById('qmdj-modal-close');
    const modalOverlay = document.getElementById('qmdj-palace-modal');
    if (modalClose && modalOverlay) {
      modalClose.onclick = () => { modalOverlay.style.display = 'none'; };
      modalOverlay.onclick = (e) => {
        if (e.target === modalOverlay) modalOverlay.style.display = 'none';
      };
    }
  }

  function bindQmdjTimeEvents(chart, patterns) {
    const pad = n => String(n).padStart(2, '0');

    const inputDay = document.getElementById('qmdj-input-day');
    const inputMonth = document.getElementById('qmdj-input-month');
    const inputYear = document.getElementById('qmdj-input-year');
    const datePicker = document.getElementById('qmdj-date-picker');
    const selectCanChi = document.getElementById('qmdj-select-canchi');
    const inputHour = document.getElementById('qmdj-input-hour');
    const inputMin = document.getElementById('qmdj-input-minute');
    const btnSolar = document.getElementById('btn-qmdj-solar');
    const btnLunar = document.getElementById('btn-qmdj-lunar');

    if (btnSolar) {
      btnSolar.onclick = () => {
        if (isQmdjLunarMode) {
          isQmdjLunarMode = false;
          renderQmdj();
        }
      };
    }
    if (btnLunar) {
      btnLunar.onclick = () => {
        if (!isQmdjLunarMode) {
          isQmdjLunarMode = true;
          renderQmdj();
        }
      };
    }

    if (datePicker) {
      datePicker.addEventListener('change', () => {
        if (!datePicker.value) return;
        const [datePart, timePart] = datePicker.value.split('T');
        const [y, m, d] = datePart.split('-').map(Number);
        let h = 12, min = 0;
        if (timePart) {
          [h, min] = timePart.split(':').map(Number);
        }
        isQmdjLunarMode = false;
        if (inputDay) inputDay.value = d;
        if (inputMonth) inputMonth.value = m;
        if (inputYear) inputYear.value = y;
        if (inputHour) inputHour.value = pad(h);
        if (inputMin) inputMin.value = pad(min);

        if (selectCanChi) {
          const CAN_CHI_MAP = [
            { val: 0, match: [23, 0] }, { val: 2, match: [1, 2] },
            { val: 4, match: [3, 4] }, { val: 6, match: [5, 6] },
            { val: 8, match: [7, 8] }, { val: 10, match: [9, 10] },
            { val: 12, match: [11, 12] }, { val: 14, match: [13, 14] },
            { val: 16, match: [15, 16] }, { val: 18, match: [17, 18] },
            { val: 20, match: [19, 20] }, { val: 22, match: [21, 22] }
          ];
          const found = CAN_CHI_MAP.find(c => c.match.includes(h));
          if (found) selectCanChi.value = String(found.val);
        }

        currentQmdjDate = new Date(y, m - 1, d, h, min, 0);
        renderQmdj();
      });

      const pickerLabel = document.getElementById('qmdj-btn-native-cal');
      const dateBox = document.getElementById('qmdj-ucc-date-box');

      const triggerWheelPicker = (e) => {
        if (e && e.target === datePicker) return;
        if (e) e.preventDefault();
        const curD = currentQmdjDate;
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

    const btnYearJumper = document.getElementById('btn-qmdj-year-jumper');
    if (global.NetaSmartPicker) {
      global.NetaSmartPicker.setupAutoAdvance({
        dayInput: inputDay,
        monthInput: inputMonth,
        yearInput: inputYear,
        hourInput: inputHour,
        minuteInput: inputMin,
        onSubmit: () => {
          if (btnSubmit) btnSubmit.click();
        }
      });

      if (btnYearJumper && inputYear) {
        btnYearJumper.onclick = () => {
          const curY = parseInt(inputYear.value) || currentQmdjDate.getFullYear();
          global.NetaSmartPicker.openYearJumperModal(curY, (selectedYear) => {
            inputYear.value = selectedYear;
            syncDateBoxesToPicker();
          });
        };
      }
    }

    function syncDateBoxesToPicker() {
      if (!inputDay || !inputMonth || !inputYear || !datePicker) return;
      const d = parseInt(inputDay.value) || 1;
      const m = parseInt(inputMonth.value) || 1;
      const y = parseInt(inputYear.value) || 2026;
      const h = parseInt(inputHour ? inputHour.value : 12) || 12;
      const min = parseInt(inputMin ? inputMin.value : 0) || 0;
      datePicker.value = `${y}-${pad(m)}-${pad(d)}T${pad(h)}:${pad(min)}`;
    }
    if (inputDay) inputDay.addEventListener('input', syncDateBoxesToPicker);
    if (inputMonth) inputMonth.addEventListener('input', syncDateBoxesToPicker);
    if (inputYear) inputYear.addEventListener('input', syncDateBoxesToPicker);
    if (inputHour) inputHour.addEventListener('input', syncDateBoxesToPicker);
    if (inputMin) inputMin.addEventListener('input', syncDateBoxesToPicker);

    if (selectCanChi) {
      selectCanChi.addEventListener('change', () => {
        if (inputHour) inputHour.value = pad(selectCanChi.value);
      });
    }

    if (inputHour) {
      inputHour.addEventListener('input', () => {
        const h = parseInt(inputHour.value);
        if (isNaN(h)) return;
        const CAN_CHI_MAP = [
          { val: 0, match: [23, 0] }, { val: 2, match: [1, 2] },
          { val: 4, match: [3, 4] }, { val: 6, match: [5, 6] },
          { val: 8, match: [7, 8] }, { val: 10, match: [9, 10] },
          { val: 12, match: [11, 12] }, { val: 14, match: [13, 14] },
          { val: 16, match: [15, 16] }, { val: 18, match: [17, 18] },
          { val: 20, match: [19, 20] }, { val: 22, match: [21, 22] }
        ];
        const found = CAN_CHI_MAP.find(c => c.match.includes(h));
        if (found && selectCanChi) selectCanChi.value = String(found.val);
      });
    }

    const btnSubmit = document.getElementById('btn-qmdj-submit');
    if (btnSubmit) {
      btnSubmit.onclick = () => {
        let d = Math.min(31, Math.max(1, parseInt(inputDay ? inputDay.value : 1) || 1));
        let m = Math.min(12, Math.max(1, parseInt(inputMonth ? inputMonth.value : 1) || 1));
        let rawYear = parseInt(inputYear ? inputYear.value : 2026) || 2026;
        if (global.NetaSmartPicker && rawYear < 100) {
          rawYear = global.NetaSmartPicker.parseSmartYear(rawYear);
          if (inputYear) inputYear.value = rawYear;
        }
        let y = Math.min(2100, Math.max(1900, rawYear));
        const h = Math.min(23, Math.max(0, parseInt(inputHour ? inputHour.value : 12) || 12));
        const min = Math.min(59, Math.max(0, parseInt(inputMin ? inputMin.value : 0) || 0));

        if (isQmdjLunarMode && global.NetaCalendarEngine && global.NetaCalendarEngine.lunar2Solar) {
          const solar = global.NetaCalendarEngine.lunar2Solar(d, m, y, false, 7);
          d = solar.day;
          m = solar.month;
          y = solar.year;
        }

        currentQmdjDate = new Date(y, m - 1, d, h, min, 0);
        renderQmdj();
      };
    }

    const btnPrev = document.getElementById('btn-qmdj-prev-hour');
    const btnNext = document.getElementById('btn-qmdj-next-hour');
    const btnNow = document.getElementById('btn-qmdj-now');

    if (btnPrev) {
      btnPrev.onclick = () => {
        currentQmdjDate = new Date(currentQmdjDate.getTime() - 2 * 3600000);
        renderQmdj();
      };
    }
    if (btnNext) {
      btnNext.onclick = () => {
        currentQmdjDate = new Date(currentQmdjDate.getTime() + 2 * 3600000);
        renderQmdj();
      };
    }
    if (btnNow) {
      btnNow.onclick = () => {
        currentQmdjDate = new Date();
        renderQmdj();
      };
    }

    bindTimeCellClickEvents(chart, patterns);
  }

  function bindPhongThuyEvents(chart) {
    const selVan = document.getElementById('pt-select-van');
    const selHuong = document.getElementById('pt-select-huong');
    const selCua = document.getElementById('pt-select-cua');
    const btnSubmit = document.getElementById('btn-pt-submit');

    if (btnSubmit) {
      btnSubmit.onclick = () => {
        if (selVan) ptState.van = parseInt(selVan.value) || 9;
        if (selHuong) ptState.huongPalace = parseInt(selHuong.value) || 6;
        if (selCua) ptState.sonCua = selCua.value || 'Thìn';
        renderQmdj();
      };
    }

    bindTimeCellClickEvents(chart, []);
  }

  function openPalaceDetailModal(chart, patterns, pIndex) {
    const modal = document.getElementById('qmdj-palace-modal');
    const titleEl = document.getElementById('qmdj-modal-title');
    const bodyEl = document.getElementById('qmdj-modal-body');
    if (!modal || !bodyEl) return;

    const palace = chart.box.flat().find(p => p.index === pIndex);
    if (!palace) return;

    const palaceName = PALACE_NAMES[pIndex] || `Cung ${pIndex + 1}`;
    titleEl.textContent = `🏰 CUNG ${palaceName.toUpperCase()}`;

    const door = translate(palace.getDoor(true));
    const stars = Array.isArray(palace.getStar(true)) ? palace.getStar(true).map(translate) : [translate(palace.getStar(true))];
    const divinity = translate(palace.getDivinity(true));
    const hcs = Array.isArray(palace.getHCS(true)) ? palace.getHCS(true).map(translate) : [translate(palace.getHCS(true))];
    const ecs = Array.isArray(palace.getECS(true)) ? palace.getECS(true).map(translate) : [translate(palace.getECS(true))];

    if (chart.isFengShui) {
      // Feng Shui detail
      const pNum = pIndex + 1;
      const isHuong = pNum === chart.huongPalace;
      const isTrucSu = pNum === chart.trucSuPalace;

      bodyEl.innerHTML = `
        <div class="palace-modal-content">
          <div class="pm-badges-row">
            <div class="pm-badge"><strong>Bát Thần:</strong> ${divinity || 'Trực Phù'}</div>
            <div class="pm-badge"><strong>Cửu Tinh:</strong> ${stars.join(', ')}</div>
            <div class="pm-badge"><strong>Bát Môn:</strong> ${door}</div>
          </div>

          <div class="pm-stems-box">
            <div><small>Thiên Can Thiên Bàn (A1):</small> <strong>${hcs.join(' ')}</strong></div>
            <div><small>Thiên Can Địa Bàn (A2):</small> <strong>${ecs.join(' ')}</strong></div>
            <div><small>Vị trí trong nhà:</small> <strong>${PALACE_DIRECTIONS[pNum]}</strong> ${isHuong ? '<span class="text-cat">(HƯỚNG NHÀ ★)</span>' : ''} ${isTrucSu ? '<span class="text-cat">(CUNG TRỰC SỬ 🔑)</span>' : ''}</div>
          </div>

          <div class="pm-patterns-section">
            <h4 class="pm-sec-title">🏡 KHẢO SÁT & BỐ TRÍ PHONG THỦY CUNG NÀY</h4>
            <div class="pt-modal-advice">
              ${getFengShuiAdviceForPalace(door, divinity, pNum, chart)}
            </div>
          </div>
        </div>
      `;
    } else {
      // Time-based QMDJ detail
      const palPatterns = patterns.filter(p => parseInt(p.palaceIndex) === pIndex);

      bodyEl.innerHTML = `
        <div class="palace-modal-content">
          <div class="pm-badges-row">
            <div class="pm-badge"><strong>Bát Thần:</strong> ${divinity}</div>
            <div class="pm-badge"><strong>Cửu Tinh:</strong> ${stars.join(', ')}</div>
            <div class="pm-badge"><strong>Bát Môn:</strong> ${door}</div>
          </div>

          <div class="pm-stems-box">
            <div><small>Thiên Can Thiên Bàn:</small> <strong>${hcs.join(' ')}</strong></div>
            <div><small>Thiên Can Địa Bàn:</small> <strong>${ecs.join(' ')}</strong></div>
            <div><small>Trạng thái:</small> ${palace.de ? '<span class="text-hung">Tuần Không (〇)</span>' : '<span class="text-cat">Bình hòa</span>'} ${palace.hs ? '<span class="text-cat">• Có Mã Tinh (🐎)</span>' : ''}</div>
          </div>

          <div class="pm-patterns-section">
            <h4 class="pm-sec-title">⚔️ CÁC CÁCH CỤC TẠI CUNG NÀY (${palPatterns.length})</h4>
            ${palPatterns.length === 0 ? '<p class="pm-empty">Không có cách cục đặc biệt tại cung này.</p>' : `
              <div class="pm-patterns-list">
                ${palPatterns.map(p => `
                  <div class="pm-pattern-item ${p.type === 'cat' ? 'border-cat' : 'border-hung'}">
                    <div class="pm-p-name ${p.type === 'cat' ? 'text-cat' : 'text-hung'}">${p.name.toUpperCase()}</div>
                    <div class="pm-p-desc">${p.desc || 'Không có mô tả'}</div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
      `;
    }

    modal.style.display = 'flex';
  }

  function getFengShuiAdviceForPalace(door, divinity, pNum, chart) {
    let advice = '';
    if (door.includes('Đỗ')) {
      advice = `
        <p><strong>🕊️ Vị trí đắc cách cho: BÀN THỜ / PHÒNG THỜ, PHÒNG YÊN TĨNH / PHÒNG THIỀN.</strong></p>
        <p>Đỗ Môn mang tính chất thanh tịnh, bảo mật, trang nghiêm. Đặt bàn thờ tại cung này hướng ra ngoài nhà, khi khấn vái lưng quay về phương vị của <strong>Trực Phù (${PALACE_DIRECTIONS[chart.huongPalace]})</strong> là đại cát, được thần Trực Phù gia trì tối thượng.</p>
      `;
    } else if (door.includes('Cảnh')) {
      advice = `
        <p><strong>🛋️ Vị trí đắc cách cho: PHÒNG KHÁCH, NHÀ BẾP, KHÔNG GIAN SINH HOẠT CHUNG.</strong></p>
        <p>Cảnh Môn đại diện cho ánh sáng, lửa ấm, văn minh, niềm vui và sự gặp gỡ giao tế. Đặt bếp hoặc phòng khách ở đây tạo sinh khí ấm cúng, tinh thần rạng rỡ.</p>
      `;
    } else if (door.includes('Hưu')) {
      advice = `
        <p><strong>🛏️ Vị trí đắc cách cho: PHÒNG NGỦ, NƠI NGHỈ DƯỠNG, PHÒNG ĐỌC SÁCH.</strong></p>
        <p>Hưu Môn thuộc Thủy, chủ về nghỉ ngơi, phục hồi sức khỏe, an tâm định thần. Người sống trong phòng này ngủ ngon, ít âu lo, gia đạo hòa hợp.</p>
      `;
    } else if (door.includes('Sinh')) {
      advice = `
        <p><strong>🌿 Vị trí đắc cách cho: BAN CÔNG, CỬA SỔ LỚN, PHÒNG LÀM VIỆC / TÀI VỊ.</strong></p>
        <p>Sinh Môn là cát môn số một về tài lộc, sự phát triển và cơ hội kinh doanh. Cung có Sinh Môn nên để thoáng đãng, đón gió, đón sáng để kích hoạt dòng tiền.</p>
      `;
    } else if (door.includes('Khai')) {
      advice = `
        <p><strong>💼 Vị trí đắc cách cho: PHÒNG LÀM VIỆC, CỬA CHÍNH, VĂN PHÒNG KINH DOANH.</strong></p>
        <p>Khai Môn chủ về khởi đầu hanh thông, công danh thăng tiến, quý nhân trợ lực. Đặt bàn làm việc tại đây giúp đầu óc minh mẫn, quyết sách sáng suốt.</p>
      `;
    } else if (door.includes('Thương')) {
      advice = `
        <p><strong>⚠️ CUNG THƯƠNG MÔN: KỴ ĐẶT PHÒNG NGỦ HOẶC BÀN LÀM VIỆC LÂU DÀI.</strong></p>
        <p>Thương Môn chủ về tổn hao, chấn thương, xe cộ, tranh cãi. Chỉ thích hợp làm nhà kho, gara xe, phòng tập thể dục, tránh ngồi làm việc lâu.</p>
      `;
    } else if (door.includes('Kinh')) {
      advice = `
        <p><strong>⚠️ CUNG KINH MÔN: KỴ ĐẶT BÀN LÀM VIỆC VÀ PHÒNG NGỦ.</strong></p>
        <p>Kinh Môn chủ về sự lo lắng, bất an, nghi ngờ, thị phi và áp lực công việc. Cung này nên bố trí nhà vệ sinh hoặc khu vực phụ trợ.</p>
      `;
    } else if (door.includes('Tử')) {
      advice = `
        <p><strong>⚠️ CUNG TỬ MÔN: KHÔNG GIAN BẾ TẮC, TRẦM TRỆ.</strong></p>
        <p>Tử Môn chủ về sự ngưng trệ, mệt mỏi, khó thăng tiến. Thích hợp làm kho chứa đồ cũ, phòng phơi đồ, không nên làm phòng ngủ hay bàn làm việc.</p>
      `;
    } else {
      advice = `<p>Cung bình hòa. Tùy thuộc vào tổng thể căn nhà để bố trí linh hoạt.</p>`;
    }
    return advice;
  }

  function setDateAndRender(date) {
    currentQmdjDate = new Date(date);
    renderQmdj();
  }

  // Export to global
  global.NetaQMDJView = {
    init: initQmdjView,
    render: renderQmdj,
    setDate: setDateAndRender,
    setMode: (m) => {
      currentQmdjMode = m;
      renderQmdj();
    }
  };

})(typeof window !== 'undefined' ? window : this);
