/**
 * NETA LIGHT - KỲ MÔN ĐỘN GIÁP VIEW MODULE
 * Hỗ trợ 3 Chế Độ Toàn Diện:
 * 1. 🔮 Dương Bàn (Thời Gia Kỳ Môn theo Chân Thái Dương Thời & Tiết Khí)
 * 2. 🌙 Âm Bàn (Đạo Gia Âm Bàn Kỳ Môn - 1 giờ 1 cục, linh hoạt theo Lịch Âm)
 * 3. 🏡 Phong Thủy Nhà (Kỳ Môn Cửu Cung Phong Thủy - Bát Vi Thần & Lục Sự)
 */

(function (global) {
  'use strict';

  let currentQmdjMode = 'duongban'; // 'duongban' | 'amban' | 'phongthuy' | 'chienluoc' | 'thien' | 'banmenh'
  let currentChienLuocGoal = 'deal'; // 'deal' | 'wealth' | 'career' | 'escape' | 'dispute'
  let currentQmdjDate = new Date();
  let currentChart = null;
  let currentPatterns = [];
  let isQmdjLunarMode = false;
  let currentBanMenhIsMale = true;
  let currentQuerentGender = 'nam'; // 'nam' | 'nu'
  let currentQuerentMode = 'birth_year'; // 'birth_year' (Can Năm Sinh người hỏi) | 'hour' (Can Giờ/Ngày)
  let currentQuerentYear = 1979;
  let currentQuerentStem = 'Kỷ';
  try {
    const savedY = localStorage.getItem('neta_user_birth_year');
    if (savedY && /^\d{4}$/.test(savedY) && savedY !== '1990') {
      currentQuerentYear = parseInt(savedY, 10);
    }
  } catch (_) {}

  const CAN_LIST = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];

  function getQuerentStemChi(y) {
    if (global.KetNoiVuTruEngine && typeof global.KetNoiVuTruEngine.getStemChiFromYear === 'function') {
      return global.KetNoiVuTruEngine.getStemChiFromYear(y);
    }
    const year = parseInt(y, 10) || 1979;
    const yOffset = year - 4;
    const ganIdx = ((yOffset % 10) + 10) % 10;
    const zhiIdx = ((yOffset % 12) + 12) % 12;
    const CHI_LIST = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
    return {
      stem: CAN_LIST[ganIdx],
      branch: CHI_LIST[zhiIdx],
      canChi: `${CAN_LIST[ganIdx]} ${CHI_LIST[zhiIdx]}`
    };
  }

  function renderQuerentRowHtml(customLabel = 'Người hỏi') {
    const info = getQuerentStemChi(currentQuerentYear);
    const isMale = (currentQuerentGender === 'nam');
    return `
      <div class="ucc-row ucc-row-querent">
        <div class="ucc-q-group-left">
          <span class="ucc-q-label">👤 ${customLabel}:</span>
          <div class="ucc-pill-gender">
            <button type="button" class="ucc-gender-btn ${isMale ? 'active male' : ''}" id="btn-qmdj-gender-male" data-gender="nam" title="Giới tính Nam">♂ Nam</button>
            <button type="button" class="ucc-gender-btn ${!isMale ? 'active female' : ''}" id="btn-qmdj-gender-female" data-gender="nu" title="Giới tính Nữ">♀ Nữ</button>
          </div>
        </div>
        <div class="ucc-q-group-right">
          <span class="ucc-q-label">Năm:</span>
          <input type="number" id="qmdj-input-birth-year" class="num-box num-birth-year" min="1920" max="2035" value="${currentQuerentYear}" placeholder="Năm">
          <select id="qmdj-select-birth-stem" class="select-birth-stem" title="Can năm sinh của ${customLabel}">
            ${CAN_LIST.map(c => {
              const isSel = (currentQuerentStem === c);
              const extra = (c === info.stem) ? ` (${info.branch})` : '';
              return `<option value="${c}" ${isSel ? 'selected' : ''}>${c}${extra}</option>`;
            }).join('')}
          </select>
        </div>
      </div>
    `;
  }

  function bindQuerentRowEvents() {
    const btnMale = document.getElementById('btn-qmdj-gender-male');
    const btnFemale = document.getElementById('btn-qmdj-gender-female');
    const inputYear = document.getElementById('qmdj-input-birth-year');
    const selectStem = document.getElementById('qmdj-select-birth-stem');

    if (btnMale) {
      btnMale.onclick = () => {
        if (currentQuerentGender !== 'nam') {
          currentQuerentGender = 'nam';
          currentBanMenhIsMale = true;
          try { localStorage.setItem('qmdj_querent_gender', 'nam'); } catch (e) {}
          renderQmdj();
        }
      };
    }
    if (btnFemale) {
      btnFemale.onclick = () => {
        if (currentQuerentGender !== 'nu') {
          currentQuerentGender = 'nu';
          currentBanMenhIsMale = false;
          try { localStorage.setItem('qmdj_querent_gender', 'nu'); } catch (e) {}
          renderQmdj();
        }
      };
    }
    if (inputYear) {
      inputYear.addEventListener('change', (e) => {
        const y = parseInt(e.target.value, 10);
        if (!isNaN(y) && y >= 1920 && y <= 2035) {
          currentQuerentYear = y;
          const sc = getQuerentStemChi(y);
          currentQuerentStem = sc.stem;
          try {
            localStorage.setItem('qmdj_querent_year', String(y));
            localStorage.setItem('qmdj_querent_stem', sc.stem);
          } catch (e) {}
          renderQmdj();
        }
      });
    }
    if (selectStem) {
      selectStem.addEventListener('change', (e) => {
        const stem = e.target.value;
        currentQuerentStem = stem;
        const targetIdx = CAN_LIST.indexOf(stem);
        if (targetIdx >= 0) {
          const curOffset = (((currentQuerentYear - 4) % 10) + 10) % 10;
          let diff = targetIdx - curOffset;
          let newY = currentQuerentYear + diff;
          if (diff > 5) newY -= 10;
          if (diff < -5) newY += 10;
          if (newY >= 1920 && newY <= 2035) {
            currentQuerentYear = newY;
          }
        }
        try {
          localStorage.setItem('qmdj_querent_year', String(currentQuerentYear));
          localStorage.setItem('qmdj_querent_stem', currentQuerentStem);
        } catch (e) {}
        renderQmdj();
      });
    }
  }

  function renderSchoolStripHtml(includeJuMethod = true) {
    return `
      <div class="ucc-row qmdj-school-strip">
        <div class="qmdj-school-pill">
          <span class="strip-lbl">Thần:</span>
          <button type="button" class="btn-school-toggle ${currentDeitySchool === '10thần' ? 'active' : ''}" id="btn-toggle-deity-10" title="10 Thần (Nguyễn Tấn Công - Kết Nối Vũ Trụ)"><span class="school-txt-long">10 Thần</span><span class="school-txt-short">10</span></button>
          <button type="button" class="btn-school-toggle ${currentDeitySchool === '8thần' ? 'active' : ''}" id="btn-toggle-deity-8" title="8 Thần (Joey Yap / Phổ Thông)"><span class="school-txt-long">8 Thần</span><span class="school-txt-short">8</span></button>
        </div>
        ${includeJuMethod ? `
        <div class="qmdj-school-pill">
          <span class="strip-lbl">Cục:</span>
          <button type="button" class="btn-school-toggle ${currentJuMethod === 'chao_bu' ? 'active' : ''}" id="btn-toggle-ju-chaobu" title="Sách Bổ / Chiết Bổ (Chai Bu)"><span class="school-txt-long">Sách Bổ</span><span class="school-txt-short">S.Bổ</span></button>
          <button type="button" class="btn-school-toggle ${currentJuMethod === 'zhi_run' ? 'active' : ''}" id="btn-toggle-ju-zhirun" title="Trí Nhuận Pháp (Zhi Run - Trang 307)"><span class="school-txt-long">Trí Nhuận</span><span class="school-txt-short">T.Nhuận</span></button>
        </div>
        ` : ''}
      </div>
    `;
  }

  function bindSchoolStripEvents() {
    const btn10 = document.getElementById('btn-toggle-deity-10');
    const btn8 = document.getElementById('btn-toggle-deity-8');
    const btnCb = document.getElementById('btn-toggle-ju-chaobu');
    const btnZr = document.getElementById('btn-toggle-ju-zhirun');

    if (btn10) {
      btn10.onclick = () => {
        if (currentDeitySchool !== '10thần') {
          currentDeitySchool = '10thần';
          try { localStorage.setItem('qmdj_deity_school', '10thần'); } catch (e) {}
          renderQmdj(true);
        }
      };
    }
    if (btn8) {
      btn8.onclick = () => {
        if (currentDeitySchool !== '8thần') {
          currentDeitySchool = '8thần';
          try { localStorage.setItem('qmdj_deity_school', '8thần'); } catch (e) {}
          renderQmdj(true);
        }
      };
    }
    if (btnCb) {
      btnCb.onclick = () => {
        if (currentJuMethod !== 'chao_bu') {
          currentJuMethod = 'chao_bu';
          try { localStorage.setItem('qmdj_ju_method', 'chao_bu'); } catch (e) {}
          renderQmdj(true);
        }
      };
    }
    if (btnZr) {
      btnZr.onclick = () => {
        if (currentJuMethod !== 'zhi_run') {
          currentJuMethod = 'zhi_run';
          try { localStorage.setItem('qmdj_ju_method', 'zhi_run'); } catch (e) {}
          renderQmdj(true);
        }
      };
    }
  }

  // Cấu hình Trường phái & Thuật toán (Kỳ Môn Độn Giáp - Kết Nối Vũ Trụ & Joey Yap)
  let currentDeitySchool = '10thần'; // '10thần' (Nguyễn Tấn Công) | '8thần' (Joey Yap)
  let currentJuMethod = 'chao_bu';   // 'chao_bu' (Sách Bổ) | 'zhi_run' (Trí Nhuận)
  let currentInquiryDomain = 'wealth'; // 12 domains: wealth, marriage, career, contract, real_estate, etc.

  // Trạng thái Bộ đếm nhịp thở 4-7-8 Sóng não Alpha
  let breathTimer = null;
  let breathState = {
    isRunning: false,
    phase: 'inhale', // 'inhale' (4s), 'hold' (7s), 'exhale' (8s)
    countdown: 4,
    cycle: 1
  };

  // State for Phong Thủy mode (16 Hướng Nhà & 24 Sơn Vị Cửa & Cấm Kỵ 5 Phòng & Âm Trạch & Thái Cực Kép & Mặt Bằng)
  let ptState = {
    subMode: 'duong_trach', // 'duong_trach' | 'am_trach'
    van: 9,            // Vận 9 (2024 - 2043)
    huongKey: 'TB1',   // 16 Hướng Nhà chuẩn (TB1: Tuất, TB2_3: Càn-Hợi, ...)
    huongPalace: 6,    // Càn 6 (Tây Bắc)
    sonCua: 'Thìn',    // 24 Sơn vị cửa (Thìn default)
    degree: 300.0,     // Tọa độ hướng thực tế (TB1: Tuất 300.0°, TB2_3: Càn-Hợi 315.0°)
    rooms: {
      main_door: 6,    // Cửa chính
      kitchen: 6,      // Bếp (Mặc định Càn 6 để kiểm tra Hỏa Thiêu Thiên Môn)
      toilet: 8,       // Nhà vệ sinh
      bedroom: 4,      // Phòng ngủ
      living_room: 3,  // Phòng khách
      altar: 9         // Ban thờ
    },
    // Cơ chế Thái Cực Kép (Macro House vs Micro Room)
    thaiCucMode: 'macro', // 'macro' (Toàn Nhà) | 'micro' (Phòng Riêng)
    microRoom: {
      type: 'office',     // 'office' (Phòng Làm Việc) | 'study' (Phòng Học) | 'bedroom' (Phòng Ngủ)
      deskPalace: 3,      // Vị trí đặt Bàn Làm Việc / Giường Ngủ (Cung 1 - 9)
      sittingPalace: 8,   // Tọa vị tựa lưng (Cung 1 - 9)
      facingPalace: 9     // Hướng nhìn ra (Cung 1 - 9)
    },
    // Trình Phủ Lưới Cửu Cung Lên Ảnh Mặt Bằng Kiến Trúc (CAD / Floor Plan Overlay Canvas)
    floorPlan: {
      imageDataUrl: null, // Ảnh người dùng tải lên (Data URL)
      zoom: 1.0,          // Tỷ lệ phóng to (0.5 - 2.0)
      opacity: 0.35,      // Độ trong suốt lớp lưới Kỳ Môn (0.1 - 0.8)
      offsetX: 0,
      offsetY: 0
    },
    // Tham số Âm Trạch
    deceasedCan: 'Ất',
    gravePalaceId: 2,  // Default Khôn 2 (Tử Môn)
    // Modal states
    isEssayModalOpen: false,
    isTrachCatModalOpen: false,
    currentTrachCatType: 'dong_tho',
    essayCustomText: '',
    isAiPolishing: false
  };

  // 16 Hướng Nhà Chuẩn Mực Kỳ Môn Phong Thủy (8 cặp: Hướng 1 [Địa Nguyên Long] vs Hướng 2/3 [Thiên & Nhân Nguyên Long])
  const HUONG_16_LIST = [
    { key: 'TB1',   name: 'Tây Bắc 1 (Tuất: 292.5° - 307.5°)',      palace: 6, deg: 300, son: 'Tuất', cungName: 'Càn (Tây Bắc)' },
    { key: 'TB2_3', name: 'Tây Bắc 2/3 (Càn - Hợi: 307.5° - 337.5°)', palace: 6, deg: 315, son: 'Càn, Hợi', cungName: 'Càn (Tây Bắc)' },
    { key: 'B1',    name: 'Bắc 1 (Nhâm: 337.5° - 352.5°)',            palace: 1, deg: 345, son: 'Nhâm', cungName: 'Khảm (Bắc)' },
    { key: 'B2_3',  name: 'Bắc 2/3 (Tý - Quý: 352.5° - 22.5°)',      palace: 1, deg: 0,   son: 'Tý, Quý', cungName: 'Khảm (Bắc)' },
    { key: 'DB1',   name: 'Đông Bắc 1 (Sửu: 22.5° - 37.5°)',          palace: 8, deg: 30,  son: 'Sửu', cungName: 'Cấn (Đông Bắc)' },
    { key: 'DB2_3', name: 'Đông Bắc 2/3 (Cấn - Dần: 37.5° - 67.5°)',   palace: 8, deg: 45,  son: 'Cấn, Dần', cungName: 'Cấn (Đông Bắc)' },
    { key: 'D1',    name: 'Đông 1 (Giáp: 67.5° - 82.5°)',             palace: 3, deg: 75,  son: 'Giáp', cungName: 'Chấn (Đông)' },
    { key: 'D2_3',  name: 'Đông 2/3 (Mão - Ất: 82.5° - 112.5°)',      palace: 3, deg: 90,  son: 'Mão, Ất', cungName: 'Chấn (Đông)' },
    { key: 'DN1',   name: 'Đông Nam 1 (Thìn: 112.5° - 127.5°)',       palace: 4, deg: 120, son: 'Thìn', cungName: 'Tốn (Đông Nam)' },
    { key: 'DN2_3', name: 'Đông Nam 2/3 (Tốn - Tị: 127.5° - 157.5°)',   palace: 4, deg: 135, son: 'Tốn, Tị', cungName: 'Tốn (Đông Nam)' },
    { key: 'N1',    name: 'Nam 1 (Bính: 157.5° - 172.5°)',            palace: 9, deg: 165, son: 'Bính', cungName: 'Ly (Nam)' },
    { key: 'N2_3',  name: 'Nam 2/3 (Ngọ - Đinh: 172.5° - 202.5°)',    palace: 9, deg: 180, son: 'Ngọ, Đinh', cungName: 'Ly (Nam)' },
    { key: 'TN1',   name: 'Tây Nam 1 (Mùi: 202.5° - 217.5°)',         palace: 2, deg: 210, son: 'Mùi', cungName: 'Khôn (Tây Nam)' },
    { key: 'TN2_3', name: 'Tây Nam 2/3 (Khôn - Thân: 217.5° - 247.5°)', palace: 2, deg: 225, son: 'Khôn, Thân', cungName: 'Khôn (Tây Nam)' },
    { key: 'T1',    name: 'Tây 1 (Canh: 247.5° - 262.5°)',            palace: 7, deg: 255, son: 'Canh', cungName: 'Đoài (Tây)' },
    { key: 'T2_3',  name: 'Tây 2/3 (Dậu - Tân: 262.5° - 292.5°)',    palace: 7, deg: 270, son: 'Dậu, Tân', cungName: 'Đoài (Tây)' }
  ];

  const SON_TO_PALACE = {
    'Nhâm': 1, 'Tý': 1, 'Quý': 1,
    'Sửu': 8, 'Cấn': 8, 'Dần': 8,
    'Giáp': 3, 'Mão': 3, 'Ất': 3,
    'Thìn': 4, 'Tốn': 4, 'Tị': 4,
    'Bính': 9, 'Ngọ': 9, 'Đinh': 9,
    'Mùi': 2, 'Khôn': 2, 'Thân': 2,
    'Canh': 7, 'Dậu': 7, 'Tân': 7,
    'Tuất': 6, 'Càn': 6, 'Hợi': 6
  };

  const SON_24_DOOR_INFO = [
    { son: 'Nhâm', deg: '337.5° - 352.5°', cung: 'Bắc (Khảm 1)', code: 'B1' },
    { son: 'Tý',   deg: '352.5° - 7.5°',   cung: 'Bắc (Khảm 1)', code: 'B2' },
    { son: 'Quý',  deg: '7.5° - 22.5°',    cung: 'Bắc (Khảm 1)', code: 'B3' },
    { son: 'Sửu',  deg: '22.5° - 37.5°',   cung: 'Đông Bắc (Cấn 8)', code: 'ĐB1' },
    { son: 'Cấn',  deg: '37.5° - 52.5°',   cung: 'Đông Bắc (Cấn 8)', code: 'ĐB2' },
    { son: 'Dần',  deg: '52.5° - 67.5°',   cung: 'Đông Bắc (Cấn 8)', code: 'ĐB3' },
    { son: 'Giáp', deg: '67.5° - 82.5°',   cung: 'Đông (Chấn 3)', code: 'Đ1' },
    { son: 'Mão',  deg: '82.5° - 97.5°',   cung: 'Đông (Chấn 3)', code: 'Đ2' },
    { son: 'Ất',   deg: '97.5° - 112.5°',  cung: 'Đông (Chấn 3)', code: 'Đ3' },
    { son: 'Thìn', deg: '112.5° - 127.5°', cung: 'Đông Nam (Tốn 4)', code: 'ĐN1' },
    { son: 'Tốn',  deg: '127.5° - 142.5°', cung: 'Đông Nam (Tốn 4)', code: 'ĐN2' },
    { son: 'Tị',   deg: '142.5° - 157.5°', cung: 'Đông Nam (Tốn 4)', code: 'ĐN3' },
    { son: 'Bính', deg: '157.5° - 172.5°', cung: 'Nam (Ly 9)', code: 'N1' },
    { son: 'Ngọ',  deg: '172.5° - 187.5°', cung: 'Nam (Ly 9)', code: 'N2' },
    { son: 'Đinh', deg: '187.5° - 202.5°', cung: 'Nam (Ly 9)', code: 'N3' },
    { son: 'Mùi',  deg: '202.5° - 217.5°', cung: 'Tây Nam (Khôn 2)', code: 'TN1' },
    { son: 'Khôn', deg: '217.5° - 232.5°', cung: 'Tây Nam (Khôn 2)', code: 'TN2' },
    { son: 'Thân', deg: '232.5° - 247.5°', cung: 'Tây Nam (Khôn 2)', code: 'TN3' },
    { son: 'Canh', deg: '247.5° - 262.5°', cung: 'Tây (Đoài 7)', code: 'T1' },
    { son: 'Dậu',  deg: '262.5° - 277.5°', cung: 'Tây (Đoài 7)', code: 'T2' },
    { son: 'Tân',  deg: '277.5° - 292.5°', cung: 'Tây (Đoài 7)', code: 'T3' },
    { son: 'Tuất', deg: '292.5° - 307.5°', cung: 'Tây Bắc (Càn 6)', code: 'TB1' },
    { son: 'Càn',  deg: '307.5° - 322.5°', cung: 'Tây Bắc (Càn 6)', code: 'TB2' },
    { son: 'Hợi',  deg: '322.5° - 337.5°', cung: 'Tây Bắc (Càn 6)', code: 'TB3' }
  ];

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

  const PALACE_TO_DEGREE = {
    1: 0,   // Bắc (Khảm 1)
    8: 45,  // Đông Bắc (Cấn 8)
    3: 90,  // Đông (Chấn 3)
    4: 135, // Đông Nam (Tốn 4)
    9: 180, // Nam (Ly 9)
    2: 225, // Tây Nam (Khôn 2)
    7: 270, // Tây (Đoài 7)
    6: 315  // Tây Bắc (Càn 6)
  };

  const SHORT_DIRECTIONS = {
    1: "Bắc",
    2: "T.Nam",
    3: "Đông",
    4: "Đ.Nam",
    5: "Trung",
    6: "T.Bắc",
    7: "Tây",
    8: "Đ.Bắc",
    9: "Nam"
  };

  const PALACE_DEG_RANGE = {
    1: "337.5° - 22.5° (Chính Bắc 0°)",
    2: "202.5° - 247.5° (Chính Tây Nam 225°)",
    3: "67.5° - 112.5° (Chính Đông 90°)",
    4: "112.5° - 157.5° (Chính Đông Nam 135°)",
    5: "Trung Cung",
    6: "292.5° - 337.5° (Chính Tây Bắc 315°)",
    7: "247.5° - 292.5° (Chính Tây 270°)",
    8: "22.5° - 67.5° (Chính Đông Bắc 45°)",
    9: "157.5° - 202.5° (Chính Nam 180°)"
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

  function formatPillarCanChi(p) {
    if (!p) return '';
    const raw = typeof p.cstb === 'function' ? p.cstb(true) : String(p);
    if (!raw) return '';
    if (raw.length === 2 && !raw.includes(' ')) {
      const c1 = translate(raw[0]);
      const c2 = translate(raw[1]);
      return `${c1} ${c2}`;
    }
    return translate(raw);
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
    try {
      const savedG = localStorage.getItem('qmdj_querent_gender');
      if (savedG === 'nam' || savedG === 'nu') {
        currentQuerentGender = savedG;
        currentBanMenhIsMale = (savedG === 'nam');
      }
      const savedY = parseInt(localStorage.getItem('qmdj_querent_year'), 10);
      if (!isNaN(savedY) && savedY >= 1920 && savedY <= 2035) {
        currentQuerentYear = savedY;
      }
      const savedS = localStorage.getItem('qmdj_querent_stem');
      if (savedS && CAN_LIST.includes(savedS)) {
        currentQuerentStem = savedS;
      } else {
        currentQuerentStem = getQuerentStemChi(currentQuerentYear).stem;
      }
      const savedSchool = localStorage.getItem('qmdj_deity_school');
      if (savedSchool === '10thần' || savedSchool === '8thần') {
        currentDeitySchool = savedSchool;
      }
      const savedJu = localStorage.getItem('qmdj_ju_method');
      if (savedJu === 'chao_bu' || savedJu === 'zhi_run') {
        currentJuMethod = savedJu;
      }
    } catch (e) {}
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
   * Kết hợp toàn diện Bát Vi Thần & Huyền Không Phi Tinh Chuẩn 16 Hướng Nhà
   */
  function computeFengShuiQMDJ(van, huongKey, sonCua) {
    const huongObj = HUONG_16_LIST.find(h => h.key === huongKey) || HUONG_16_LIST[0];
    const huongPalace = huongObj.palace;
    const huongDeg = huongObj.deg;
    const cuaPalace = SON_TO_PALACE[sonCua] || 4;

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

    // 9. Huyền Không Phi Tinh: Gọi NetaLaKinhEngine.generateHuyenKhongMatrix
    let hkMatrix = null;
    const lkEngine = (typeof window !== 'undefined' && window.NetaLaKinhEngine) || global.NetaLaKinhEngine;
    if (lkEngine && typeof lkEngine.generateHuyenKhongMatrix === 'function') {
      hkMatrix = lkEngine.generateHuyenKhongMatrix(huongDeg, van);
    }
    const hkByPalace = {};
    if (hkMatrix && Array.isArray(hkMatrix.geoGrid)) {
      hkMatrix.geoGrid.forEach(item => {
        hkByPalace[item.quai] = item;
      });
    }

    // Tạo cấu trúc 8 cung + 1 trung cung chuẩn cho hiển thị bàn 9 cung
    const palacesData = {};
    clockwiseFromHuong.forEach((p, idx) => {
      const hkInfo = hkByPalace[p] || {};
      palacesData[p] = {
        index: p - 1, // 0..8
        palaceNumber: p,
        door: a5Ring[idx],
        star: a3Ring[idx],
        divinity: a4Ring[idx],
        hcs: [a1Ring[idx]],
        ecs: [a2Ring[idx]],
        de: false,
        hs: false,
        mountainStar: hkInfo.mountainStar !== undefined ? hkInfo.mountainStar : '',
        facingStar: hkInfo.facingStar !== undefined ? hkInfo.facingStar : '',
        vanStar: hkInfo.vanStar !== undefined ? hkInfo.vanStar : van,
        isFacing: (p === huongPalace),
        isDoor: (p === cuaPalace),
        isTrucSu: (p === trucSuPalace)
      };
    });

    // Trung cung 5
    const hkInfo5 = hkByPalace[5] || {};
    palacesData[5] = {
      index: 4,
      palaceNumber: 5,
      door: "",
      star: "Thiên Cầm",
      divinity: "",
      hcs: [p5Stem],
      ecs: [p5Stem],
      de: false,
      hs: false,
      mountainStar: hkInfo5.mountainStar !== undefined ? hkInfo5.mountainStar : (hkMatrix ? hkMatrix.mountainCenterStar : ''),
      facingStar: hkInfo5.facingStar !== undefined ? hkInfo5.facingStar : (hkMatrix ? hkMatrix.facingCenterStar : ''),
      vanStar: hkInfo5.vanStar !== undefined ? hkInfo5.vanStar : van,
      isFacing: false,
      isDoor: false,
      isTrucSu: false
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
      huongKey,
      huongPalace,
      huongName: huongObj.name,
      huongShortName: huongObj.name.includes(':') ? `${huongObj.name.split(':')[0]})` : huongObj.name,
      huongDeg,
      sonCua,
      cuaPalace,
      phuThu,
      trucSuPalace,
      trucSuPalaceName: `${PALACE_NAMES[trucSuPalace - 1]} (${PALACE_DIRECTIONS[trucSuPalace]})`,
      rootDoor,
      rootStar,
      hkMatrix,
      box,
      palacesData
    };
  }

  function computeQmdjChart(date = currentQmdjDate) {
    if (currentQmdjMode === 'phongthuy') {
      const ptChart = computeFengShuiQMDJ(ptState.van, ptState.huongKey || 'TB1', ptState.sonCua);
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
      } else if (currentJuMethod === 'zhi_run' && global.KetNoiVuTruEngine) {
        let dayCan = "Giáp", dayChi = "Tý", term = "Xuân Phân";
        if (global.NetaCalendarEngine) {
          const info = global.NetaCalendarEngine.getFullDayInfo(date);
          const parts = (info.canChi.day || '').split(' ');
          if (parts.length >= 2) { dayCan = parts[0]; dayChi = parts[1]; }
          term = global.NetaCalendarEngine.getSolarTerm(date.getDate(), date.getMonth() + 1, date.getFullYear());
        }
        const zr = global.KetNoiVuTruEngine.calculateZhiRunJu(term, dayCan, dayChi, 0);
        const cuc = zr.juNumber;
        roundArg = zr.dunType.includes('Dương') ? cuc : -cuc;
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

  function renderQmdj(preserveScroll = false) {
    const container = document.getElementById('view-qmdj');
    if (!container) return;
    const scrollEl = container.querySelector('.qmdj-view-container');
    const prevScrollY = preserveScroll ? (scrollEl ? scrollEl.scrollTop : (window.scrollY || document.documentElement.scrollTop)) : null;

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

    // Render Sub-Tabs (6 chế độ)
    let modeTabsHtml = `
      <div class="qmdj-mode-tabs">
        <button type="button" class="qmdj-tab-btn ${currentQmdjMode === 'duongban' ? 'active' : ''}" data-mode="duongban">
          <span class="qmdj-txt-long">🔮 Dương Bàn</span>
          <span class="qmdj-txt-short">🔮 Dương</span>
        </button>
        <button type="button" class="qmdj-tab-btn ${currentQmdjMode === 'amban' ? 'active' : ''}" data-mode="amban">
          <span class="qmdj-txt-long">🌙 Âm Bàn</span>
          <span class="qmdj-txt-short">🌙 Âm</span>
        </button>
        <button type="button" class="qmdj-tab-btn ${currentQmdjMode === 'phongthuy' ? 'active' : ''}" data-mode="phongthuy">
          <span class="qmdj-txt-long">🏡 Phong Thủy</span>
          <span class="qmdj-txt-short">🏡 P.Thủy</span>
        </button>
        <button type="button" class="qmdj-tab-btn ${currentQmdjMode === 'chienluoc' ? 'active' : ''}" data-mode="chienluoc">
          <span class="qmdj-txt-long">⚔️ Tác Quyết</span>
          <span class="qmdj-txt-short">⚔️ Quyết</span>
        </button>
        <button type="button" class="qmdj-tab-btn ${currentQmdjMode === 'thien' ? 'active' : ''}" data-mode="thien">
          <span class="qmdj-txt-long">🧘 Tọa Thiền</span>
          <span class="qmdj-txt-short">🧘 Thiền</span>
        </button>
        <button type="button" class="qmdj-tab-btn ${currentQmdjMode === 'banmenh' ? 'active' : ''}" data-mode="banmenh">
          <span class="qmdj-txt-long">👤 Bản Mệnh</span>
          <span class="qmdj-txt-short">👤 Mệnh</span>
        </button>
      </div>
    `;

    if (isPt) {
      renderPhongThuyMode(container, modeTabsHtml, chart);
    } else if (currentQmdjMode === 'chienluoc') {
      renderChienLuocMode(container, modeTabsHtml, chart);
    } else if (currentQmdjMode === 'thien') {
      renderThienMode(container, modeTabsHtml, chart);
    } else if (currentQmdjMode === 'banmenh') {
      renderBanMenhMode(container, modeTabsHtml, chart);
    } else {
      renderTimeMode(container, modeTabsHtml, chart, patterns);
    }

    if (prevScrollY !== null) {
      requestAnimationFrame(() => {
        const sc = container.querySelector('.qmdj-view-container');
        if (sc) {
          sc.scrollTop = prevScrollY;
        } else {
          window.scrollTo({ top: prevScrollY, behavior: 'instant' });
        }
      });
    }
  }

  /**
   * Sinh HTML Thẻ Chiêm Đoán Vạn Sự (Omni-Forecast 12 Lĩnh Vực) theo sách Nguyễn Tấn Công
   * Hỗ trợ Dụng Thần Can Năm Sinh (Đa nhân chiêm trong 1 canh giờ) & Luận Giải Đa Tầng
   */
  function buildOmniForecastHtml(chart) {
    if (!global.KetNoiVuTruEngine || currentQmdjMode === 'phongthuy') return '';
    const domains = global.KetNoiVuTruEngine.FORECAST_DOMAINS;

    const dayStr = formatPillarCanChi(chart.date);
    const hourStr = formatPillarCanChi(chart.hour);
    const dayCan = (dayStr || '').split(' ')[0] || '';
    const hourCan = (hourStr || '').split(' ')[0] || '';

    // Chuẩn hóa cấu trúc chart plain cho forecast engine
    const chartPlain = {
      round: chart.round || 1,
      day_can: dayCan,
      hour_can: hourCan,
      day_palace: 1,
      hour_palace: 9,
      palaces: {}
    };

    let chiefPalaceNum = 1;
    if (chart && chart.box) {
      chart.box.forEach((row) => {
        row.forEach((palace) => {
          if (palace && palace.index !== 4 && translate(palace.getDivinity(true)).includes('Trực Phù')) {
            chiefPalaceNum = palace.index + 1;
          }
        });
      });
      const roundVal = chart.round || 1;
      const tenDeityMap = (global.KetNoiVuTruEngine && currentDeitySchool === '10thần')
        ? global.KetNoiVuTruEngine.allocate10Deities(roundVal > 0 ? 'Dương Độn' : 'Âm Độn', chiefPalaceNum)
        : {};

      chart.box.flat().forEach(p => {
        if (!p) return;
        const pIdx = p.index;
        const pNum = pIdx + 1;
        const door = translate(p.getDoor(true));
        const stars = Array.isArray(p.getStar(true)) ? p.getStar(true).map(translate) : [translate(p.getStar(true))];
        const rawDivinity = translate(p.getDivinity(true));
        const divinity = (currentDeitySchool === '10thần' && tenDeityMap[pNum]) ? tenDeityMap[pNum] : rawDivinity;
        const hcs = Array.isArray(p.getHCS(true)) ? p.getHCS(true).map(translate) : [translate(p.getHCS(true))];
        const ecs = Array.isArray(p.getECS(true)) ? p.getECS(true).map(translate) : [translate(p.getECS(true))];

        const hCan = hcs[0] || '';
        if (hCan === dayCan) chartPlain.day_palace = pNum;
        if (hCan === hourCan) chartPlain.hour_palace = pNum;

        chartPlain.palaces[pNum] = {
          name: PALACE_NAMES[pIdx] || `Cung ${pNum}`,
          door: door,
          star: stars[0] || '',
          deity: divinity,
          heaven_stem: hCan,
          earth_stem: ecs[0] || '',
          is_kong_wang: !!p.de,
          is_sky_horse: !!p.hs
        };
      });
    }

    const querentOptions = {
      mode: currentQuerentMode,
      year: currentQuerentYear,
      stem: currentQuerentStem,
      gender: currentQuerentGender
    };

    const res = global.KetNoiVuTruEngine.runOmniForecast(currentInquiryDomain, chartPlain, querentOptions);
    if (!res) return '';

    const qGenderStr = currentQuerentGender === 'nam' ? 'Nam ♂' : 'Nữ ♀';
    const formatMdText = (str) => {
      if (!str) return '';
      return String(str).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    };

    return `
      <div class="qmdj-omni-card">
        <!-- Header & Domain Selector -->
        <div class="omni-header-row">
          <div class="omni-title-wrap">
            <span class="omni-icon">🔮</span>
            <span class="omni-title">CHIÊM ĐOÁN VẠN SỰ (12 LĨNH VỰC)</span>
          </div>
          <select id="qmdj-select-omni-domain" class="omni-domain-select">
            ${domains.map(d => `<option value="${d.key}" ${currentInquiryDomain === d.key ? 'selected' : ''}>${d.name}</option>`).join('')}
          </select>
        </div>

        <!-- Hàng Xác Nhận Dụng Thần Người Hỏi (Đồng bộ với bảng điều khiển chính) -->
        <div class="omni-querent-strip">
          <div class="omni-querent-pills">
            <span class="omni-q-lbl">👤 Dụng Thần:</span>
            <button type="button" class="btn-omni-qmode ${currentQuerentMode === 'birth_year' ? 'active' : ''}" data-qmode="birth_year" title="Dùng Can Năm Sinh của người hỏi (đã chọn ở bảng điều khiển trên: ${currentQuerentStem} - ${qGenderStr})">
              🎂 Can Năm Sinh: ${currentQuerentStem} (${currentQuerentYear} ${qGenderStr})
            </button>
            <button type="button" class="btn-omni-qmode ${currentQuerentMode === 'hour' ? 'active' : ''}" data-qmode="hour" title="Dùng Can Giờ / Ngày">
              ⏰ Can Giờ/Ngày
            </button>
          </div>
        </div>

        <!-- Bảng Cặp Cung Chủ Thể ↔ Sự Việc -->
        <div class="omni-sub-obj-strip">
          <div class="omni-so-badge subj">
            <span class="so-lbl">CHỦ THỂ (${res.subjectInfo.querentLabel}):</span>
            <strong class="so-name">${res.subjectInfo.name} (${res.subjectInfo.direction}) • Hành ${res.subjectInfo.element}</strong>
            <span class="so-sub">${res.subjectInfo.door ? `Môn ${res.subjectInfo.door}` : '—'} • ${res.subjectInfo.star || '—'} • ${res.subjectInfo.deity || '—'}</span>
          </div>
          <div class="omni-so-arrow">➔</div>
          <div class="omni-so-badge obj">
            <span class="so-lbl">SỰ VIỆC (${res.objectInfo.targetLabel}):</span>
            <strong class="so-name">${res.objectInfo.name} (${res.objectInfo.direction}) • Hành ${res.objectInfo.element}</strong>
            <span class="so-sub">${res.objectInfo.door ? `Môn ${res.objectInfo.door}` : '—'} • ${res.objectInfo.star || '—'} • ${res.objectInfo.deity || '—'}</span>
          </div>
        </div>

        <!-- Kết Quả Điểm Số & Đánh Giá Tổng Quan -->
        <div class="omni-result-body">
          <div class="omni-score-badge ${res.badgeClass}">
            <span class="score-num">${res.score}</span>
            <span class="score-verdict">${res.verdict}</span>
          </div>
          <div class="omni-info-col">
            <div class="omni-rel-line">
              <span class="omni-lbl">Đối soát Ngũ Hành:</span>
              <strong class="omni-val">${res.relationship}</strong>
            </div>
            <div class="omni-advice-line">
              ${formatMdText(res.layers.hostGuest)}
            </div>
          </div>
        </div>

        <!-- Nội Dung Luận Giải Đa Tầng Chuyên Sâu (Comprehensive Multi-Layer Divination) -->
        <div class="omni-deep-analysis">
          <!-- Tầng 2: Tứ Trụ Cột Kỳ Môn -->
          <div class="omni-analysis-sec pillars-sec">
            <div class="sec-title">🏛️ BỘ TỨ KỲ MÔN TẠI CUNG SỰ VIỆC (${res.objectInfo.name}):</div>
            <div class="omni-pillars-grid">
              <div class="omni-pillar-cell">
                <span class="cell-label">🚪 Bát Môn:</span>
                <span class="cell-val">${formatMdText(res.layers.doorDetail)}</span>
              </div>
              <div class="omni-pillar-cell">
                <span class="cell-label">⭐ Cửu Tinh:</span>
                <span class="cell-val">${formatMdText(res.layers.starDetail)}</span>
              </div>
              <div class="omni-pillar-cell">
                <span class="cell-label">🔮 Thần Trợ:</span>
                <span class="cell-val">${formatMdText(res.layers.deityDetail)}</span>
              </div>
              <div class="omni-pillar-cell">
                <span class="cell-label">⚡ Thập Can:</span>
                <span class="cell-val">${formatMdText(res.layers.stemPatternDetail)}</span>
              </div>
            </div>
          </div>

          <!-- Tầng 3: Không Vong & Dịch Mã -->
          <div class="omni-analysis-sec special-sec">
            <div class="sec-title">⚡ KHÔNG VONG & BIẾN ĐỘNG DỊCH MÃ:</div>
            <p class="sec-p">${formatMdText(res.layers.specialStates)}</p>
          </div>

          <!-- Tầng 4: Sách Lược Hành Động & Ứng Kỳ Dự Báo -->
          <div class="omni-analysis-sec action-sec">
            <div class="sec-title">🎯 SÁCH LƯỢC HÀNH ĐỘNG & ỨNG KỲ DỰ BÁO:</div>
            <div class="action-grid">
              <div class="action-item strategy">
                <strong class="action-lbl">📌 Chiến Lược Cốt Lõi:</strong>
                <p class="action-txt">${formatMdText(res.layers.strategy)}</p>
              </div>
              <div class="action-item direction">
                <strong class="action-lbl">🧭 Phương Vị Đắc Lợi:</strong>
                <p class="action-txt">${formatMdText(res.layers.direction)}</p>
              </div>
              <div class="action-item timing">
                <strong class="action-lbl">⏳ Ứng Kỳ Dự Báo:</strong>
                <p class="action-txt">${formatMdText(res.layers.timing)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
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
      year: formatPillarCanChi(chart.year),
      month: formatPillarCanChi(chart.month),
      day: formatPillarCanChi(chart.date),
      hour: formatPillarCanChi(chart.hour)
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

          <!-- Row 3: Người Hỏi (Can Năm Sinh & Giới Tính) - Dùng chung toàn module -->
          ${renderQuerentRowHtml('Người hỏi')}

          <!-- Row 4: Actions -->
          <div class="ucc-row ucc-row-actions">
            <button class="ucc-btn-now" id="btn-qmdj-now" title="Đặt lại về thời điểm hiện tại">⚡ Giờ thực</button>
            <div class="qmdj-cuc-badge" title="Cục số và Tiết khí: ${solarTermFullStr || solarTermStr}">
              <span>${roundText}</span>
              <span class="cuc-dot">•</span>
              <span>${solarTerm}</span>
            </div>
            <button class="ucc-btn-submit" id="btn-qmdj-submit" title="Lập bàn Kỳ Môn">🔮 Lập Bàn</button>
          </div>

          <!-- Row 5: Trường phái Thần & Thuật toán Định Cục -->
          ${renderSchoolStripHtml(true)}
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

        <!-- Omni-Forecast 12 Domains Card (Nguyễn Tấn Công) -->
        ${buildOmniForecastHtml(chart)}
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

  const STEM_ELEMENTS = {
    'Giáp': 'Mộc', 'Ất': 'Mộc', 'Bính': 'Hỏa', 'Đinh': 'Hỏa', 'Mậu': 'Thổ',
    'Kỷ': 'Thổ', 'Canh': 'Kim', 'Tân': 'Kim', 'Nhâm': 'Thủy', 'Quý': 'Thủy'
  };

  function evaluateHostGuest(dayStem, hourStem) {
    const dElem = STEM_ELEMENTS[dayStem] || 'Mộc';
    const hElem = STEM_ELEMENTS[hourStem] || 'Kim';

    const FIVE_DISHARMONY_MAP = {
      'Giáp': 'Canh', 'Ất': 'Tân', 'Bính': 'Nhâm', 'Đinh': 'Quý', 'Mậu': 'Giáp',
      'Kỷ': 'Ất', 'Canh': 'Bính', 'Tân': 'Đinh', 'Nhâm': 'Mậu', 'Quý': 'Kỷ'
    };

    if (hourStem === FIVE_DISHARMONY_MAP[dayStem]) {
      return {
        role: "Ngũ Bất Ngộ Thời (Thất Sát)",
        advice: "Khách khắc Chủ nghiêm trọng: Đại kỵ khởi sự, đàm phán hay xuất hành. Dễ gặp thất bại, trở mặt hoặc áp lực áp đảo.",
        action: "Hủy bỏ hoặc hoãn kế hoạch sang giờ khác."
      };
    }
    if (hElem === dElem) {
      return {
        role: "Chủ Khách Tỷ Hòa",
        advice: `Cùng hành ${dElem}: Thế trận cân bằng, hợp tác đôi bên cùng có lợi (Win - Win).`,
        action: "Đàm phán cởi mở, bình đẳng, đôi bên chia sẻ quyền lợi."
      };
    }
    const ELEM_PROD = { 'Mộc': 'Hỏa', 'Hỏa': 'Thổ', 'Thổ': 'Kim', 'Kim': 'Thủy', 'Thủy': 'Mộc' };
    const ELEM_CTRL = { 'Mộc': 'Thổ', 'Thổ': 'Thủy', 'Thủy': 'Hỏa', 'Hỏa': 'Kim', 'Kim': 'Mộc' };

    if (ELEM_PROD[hElem] === dElem) {
      return {
        role: "Khách Sinh Chủ (Nên Làm Chủ)",
        advice: `Khách (${hElem}) sinh Chủ (${dElem}): Khách mang lại lợi ích cho Chủ. Đối tác tự tìm đến, phục tùng ý kiến của bạn.`,
        action: "Nên làm CHỦ: Ở yên vị trí, mời đối tác đến văn phòng của mình, để đối tác trình bày và ra giá trước."
      };
    }
    if (ELEM_PROD[dElem] === hElem) {
      return {
        role: "Chủ Sinh Khách (Nên Làm Khách)",
        advice: `Chủ (${dElem}) sinh Khách (${hElem}): Chủ hao tổn năng lượng cho Khách nếu ngồi thụ động.`,
        action: "Nên làm KHÁCH: Chủ động hẹn gặp bên ngoài, chủ động đưa ra đề xuất và dẫn dắt cuộc thảo luận."
      };
    }
    if (ELEM_CTRL[dElem] === hElem) {
      return {
        role: "Chủ Khắc Khách (Chủ Thắng Thế)",
        advice: `Chủ (${dElem}) khắc Khách (${hElem}): Chủ hoàn toàn kiểm soát và áp chế được đối phương.`,
        action: "Nên làm CHỦ: Giữ vững lập trường, quyết đoán đưa ra điều kiện, đối tác sẽ phải nhượng bộ."
      };
    }
    if (ELEM_CTRL[hElem] === dElem) {
      return {
        role: "Khách Khắc Chủ (Khách Thắng Thế)",
        advice: `Khách (${hElem}) khắc Chủ (${dElem}): Đối phương nắm thế thượng phong, dễ bị ép giá.`,
        action: "Nên làm KHÁCH: Xuất kích bất ngờ, đổi vị trí đàm phán sang địa điểm trung lập, không để bị dồn vào chân tường."
      };
    }
    return { role: "Bình Hòa", advice: "Tương tác bình thường.", action: "Hành xử linh hoạt." };
  }

  function evaluateUsefulGod(goal, palaces, skyHorse) {
    if (goal === 'deal') {
      let canhPalace = null, lucHopPalace = null;
      for (const [pid, p] of Object.entries(palaces)) {
        if (p.door && p.door.includes('Cảnh')) canhPalace = p;
        if (p.deity && p.deity.includes('Lục Hợp')) lucHopPalace = p;
      }
      return {
        title: "💼 Dụng Thần Đàm Phán & Ký Kết Hợp Đồng",
        items: [
          `Cung Hợp Đồng (Cảnh Môn): ${canhPalace ? `Cung ${canhPalace.palace} (${PALACE_DIRECTIONS[canhPalace.palace]}) đới ${canhPalace.hcs}/${canhPalace.ecs}` : 'Bình'}`,
          `Cung Đối Tác (Lục Hợp): ${lucHopPalace ? `Cung ${lucHopPalace.palace} (${PALACE_DIRECTIONS[lucHopPalace.palace]}) đới ${lucHopPalace.door} Môn` : 'Bình'}`,
          `Chiến thuật: Hợp đồng và Đối tác tương sinh là điềm đại cát, ký kết thuận lợi; nếu tương khắc đề phòng tranh chấp điều khoản.`
        ]
      };
    }
    if (goal === 'wealth') {
      let sinhPalace = null, mauPalace = null;
      for (const [pid, p] of Object.entries(palaces)) {
        if (p.door && p.door.includes('Sinh')) sinhPalace = p;
        if (p.hcs && p.hcs.includes('Mậu')) mauPalace = p;
      }
      return {
        title: "💰 Dụng Thần Cầu Tài & Gọi Vốn Đầu Tư",
        items: [
          `Cung Lợi Nhuận (Sinh Môn): ${sinhPalace ? `Cung ${sinhPalace.palace} (${PALACE_DIRECTIONS[sinhPalace.palace]}) đới ${sinhPalace.star}` : 'Bình'}`,
          `Cung Nguồn Vốn (Can Mậu): ${mauPalace ? `Cung ${mauPalace.palace} (${PALACE_DIRECTIONS[mauPalace.palace]})` : 'Bình'}`,
          `Chiến thuật: Sinh Môn sinh cho cung Bản Mệnh là tiền bạc tự chảy về túi; Sinh Môn phạm Không Vong kỵ xuất tiền đầu tư lớn.`
        ]
      };
    }
    if (goal === 'career') {
      let khaiPalace = null, trucPhuPalace = null;
      for (const [pid, p] of Object.entries(palaces)) {
        if (p.door && p.door.includes('Khai')) khaiPalace = p;
        if (p.deity && p.deity.includes('Trực Phù')) trucPhuPalace = p;
      }
      return {
        title: "📈 Dụng Thần Thăng Tiến & Công Danh",
        items: [
          `Cung Công Việc (Khai Môn): ${khaiPalace ? `Cung ${khaiPalace.palace} (${PALACE_DIRECTIONS[khaiPalace.palace]})` : 'Bình'}`,
          `Cung Lãnh Đạo (Trực Phù): ${trucPhuPalace ? `Cung ${trucPhuPalace.palace} (${PALACE_DIRECTIONS[trucPhuPalace.palace]})` : 'Bình'}`,
          `Chiến thuật: Khai Môn tương sinh Trực Phù được cấp trên trọng dụng nâng đỡ; Khai Môn lâm Kích Hình đề phòng kỷ luật khiển trách.`
        ]
      };
    }
    if (goal === 'escape') {
      let doPalace = null;
      for (const [pid, p] of Object.entries(palaces)) {
        if (p.door && p.door.includes('Đỗ')) doPalace = p;
      }
      return {
        title: "🐎 Dụng Thần Thoát Hiểm & Bảo Mật",
        items: [
          `Phương Vị Thiên Mã: ${skyHorse ? `${skyHorse.direction} (Cung ${skyHorse.palace_name} - Chi ${skyHorse.sky_horse_branch})` : 'Bình'}`,
          `Cung Ẩn Danh (Đỗ Môn): ${doPalace ? `Cung ${doPalace.palace} (${PALACE_DIRECTIONS[doPalace.palace]})` : 'Bình'}`,
          `Chiến thuật: Di chuyển nhanh về hướng Thiên Mã để giải cứu áp lực; Đỗ Môn bảo toàn thông tin cơ mật, đối thủ không thể dò xét.`
        ]
      };
    }
    let huuPalace = null, kinhPalace = null;
    for (const [pid, p] of Object.entries(palaces)) {
      if (p.door && p.door.includes('Hưu')) huuPalace = p;
      if (p.door && p.door.includes('Kinh')) kinhPalace = p;
    }
    return {
      title: "🤝 Dụng Thần Hòa Giải & Kiện Tụng",
      items: [
        `Cung Hòa Giải (Hưu Môn): ${huuPalace ? `Cung ${huuPalace.palace} (${PALACE_DIRECTIONS[huuPalace.palace]})` : 'Bình'}`,
        `Cung Tranh Tụng (Kinh Môn): ${kinhPalace ? `Cung ${kinhPalace.palace} (${PALACE_DIRECTIONS[kinhPalace.palace]})` : 'Bình'}`,
        `Chiến thuật: Tọa hướng Hưu Môn tiếp xúc đối phương với thái độ hòa nhã; tránh để đối phương kích động tại cung Kinh Môn.`
      ]
    };
  }

  /**
   * Render Chế Độ Chiến Lược Tác Quyết (Joey Yap Strategic Execution)
   */
  function renderChienLuocMode(container, modeTabsHtml, chart) {
    const d = currentQmdjDate;
    const pad = n => String(n).padStart(2, '0');
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())} - ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

    const pillars = {
      year: formatPillarCanChi(chart.year),
      month: formatPillarCanChi(chart.month),
      day: formatPillarCanChi(chart.date),
      hour: formatPillarCanChi(chart.hour)
    };

    let solarTerm = "Xuân Phân";
    let solarTermFullStr = "";
    let std = null;
    let lMonth = 2;
    if (global.NetaCalendarEngine) {
      if (typeof global.NetaCalendarEngine.getSolarTermDetails === 'function') {
        std = global.NetaCalendarEngine.getSolarTermDetails(d.getDate(), d.getMonth() + 1, d.getFullYear(), d.getHours(), d.getMinutes());
        solarTerm = std.term;
        solarTermFullStr = std.fullDisplayStr;
      } else {
        solarTerm = global.NetaCalendarEngine.getSolarTerm(d.getDate(), d.getMonth() + 1, d.getFullYear());
      }
      const lInfo = global.NetaCalendarEngine.getFullDayInfo(d);
      if (lInfo && lInfo.lunar && lInfo.lunar.month) lMonth = lInfo.lunar.month;
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

    // Joey Yap Analysis
    const joeyEngine = (typeof window !== 'undefined' && window.JoeyYapQMDJEngine) || global.JoeyYapQMDJEngine;
    let analysis = null;
    if (joeyEngine && typeof joeyEngine.analyzeQMDJCoreChart === 'function') {
      let chiefPalaceNum = 1;
      if (chart && chart.box) {
        chart.box.forEach((row) => {
          row.forEach((palace) => {
            if (palace && palace.index !== 4 && translate(palace.getDivinity(true)).includes('Trực Phù')) {
              chiefPalaceNum = palace.index + 1;
            }
          });
        });
      }
      const roundVal = chart.round || 1;
      const decisionTenDeityMap = (global.KetNoiVuTruEngine && currentDeitySchool === '10thần')
        ? global.KetNoiVuTruEngine.allocate10Deities(roundVal > 0 ? 'Dương Độn' : 'Âm Độn', chiefPalaceNum)
        : null;

      analysis = joeyEngine.analyzeQMDJCoreChart(chart, {
        dayCanChi: pillars.day,
        hourCanChi: pillars.hour,
        solarTerm: solarTerm,
        lunarMonth: lMonth,
        taskGoal: currentChienLuocGoal,
        deitySchool: currentDeitySchool,
        tenDeityMap: decisionTenDeityMap
      });
    }

    const strat = (analysis && analysis.spatial_strategy) || {
      presenter_back_facing: "Bắc (Khảm)",
      emergency_escape_vector: "Đông Nam (Tốn)",
      target_placement_sectors: ["Đông Nam (Tử Môn)", "Nam (Kinh Môn)"],
      five_no_attacks: ["Bắc", "Tây Nam", "Tây Bắc", "Tây"]
    };

    const hostGuest = evaluateHostGuest(
      (pillars.day || '').split(' ')[0],
      (pillars.hour || '').split(' ')[0]
    );

    const usefulGod = evaluateUsefulGod(
      currentChienLuocGoal,
      (analysis && analysis.palaces) || {},
      (analysis && analysis.sky_horse)
    );

    const roundVal = chart.round || 1;
    const roundText = roundVal > 0 ? `Dương ${roundVal} Cục` : `Âm ${Math.abs(roundVal)} Cục`;

    // Tính góc xoay thực địa cho La Kinh
    let presenterDeg = 0;
    if (analysis && analysis.three_victories && analysis.three_victories.first_victory) {
      presenterDeg = PALACE_TO_DEGREE[analysis.three_victories.first_victory.palace_id] || 0;
    } else if (strat.presenter_back_facing) {
      const s = strat.presenter_back_facing;
      if (s.includes('Đông Bắc')) presenterDeg = 45;
      else if (s.includes('Đông Nam')) presenterDeg = 135;
      else if (s.includes('Tây Bắc')) presenterDeg = 315;
      else if (s.includes('Tây Nam')) presenterDeg = 225;
      else if (s.includes('Bắc')) presenterDeg = 0;
      else if (s.includes('Nam')) presenterDeg = 180;
      else if (s.includes('Đông')) presenterDeg = 90;
      else if (s.includes('Tây')) presenterDeg = 270;
    }

    let horseDeg = 225;
    if (analysis && analysis.sky_horse && analysis.sky_horse.palace_id) {
      horseDeg = PALACE_TO_DEGREE[analysis.sky_horse.palace_id] || 225;
    } else if (strat.emergency_escape_vector) {
      const s = strat.emergency_escape_vector;
      if (s.includes('Đông Nam')) horseDeg = 135;
      else if (s.includes('Tây Nam')) horseDeg = 225;
      else if (s.includes('Đông Bắc')) horseDeg = 45;
      else if (s.includes('Tây Bắc')) horseDeg = 315;
      else if (s.includes('Bắc')) horseDeg = 0;
      else if (s.includes('Nam')) horseDeg = 180;
      else if (s.includes('Đông')) horseDeg = 90;
      else if (s.includes('Tây')) horseDeg = 270;
    }

    // Phân bổ 10 Thần (Nguyễn Tấn Công) nếu được kích hoạt
    let chiefPalaceNum = 1;
    if (chart && chart.box) {
      chart.box.flat().forEach(palace => {
        if (palace && palace.index !== 4 && translate(palace.getDivinity(true)).includes('Trực Phù')) {
          chiefPalaceNum = palace.index + 1;
        }
      });
    }
    const tenDeityMap = (global.KetNoiVuTruEngine && currentDeitySchool === '10thần')
      ? global.KetNoiVuTruEngine.allocate10Deities(roundVal > 0 ? 'Dương Độn' : 'Âm Độn', chiefPalaceNum)
      : {};

    // 3x3 Lạc Thư Layout
    const layout = [
      [4, 9, 2],
      [3, 5, 7],
      [8, 1, 6]
    ];

    container.innerHTML = `
      <div class="qmdj-view-container">
        ${modeTabsHtml}

        <!-- Unified Control Card (Thời Gian) -->
        <div class="unified-ctrl-card">
          <!-- Row 1: Calendar switch & Date Box -->
          <div class="ucc-row ucc-row-date">
            <div class="ucc-pill-cal">
              <button type="button" class="ucc-pill-btn ${!isQmdjLunarMode ? 'active' : ''}" id="btn-qmdj-solar">☀️ Dương</button>
              <button type="button" class="ucc-pill-btn ${isQmdjLunarMode ? 'active' : ''}" id="btn-qmdj-lunar">🌙 Âm</button>
            </div>
            <div class="ucc-date-box" id="qmdj-ucc-date-box" title="Nhập ngày tháng hoặc mở lịch">
              <input type="number" id="qmdj-input-day" class="num-box num-day" min="1" max="31" value="${dayVal}">
              <span class="num-slash">/</span>
              <input type="number" id="qmdj-input-month" class="num-box num-month" min="1" max="12" value="${monthVal}">
              <span class="num-slash">/</span>
              <input type="number" id="qmdj-input-year" class="num-box num-year" min="1900" max="2100" value="${yearVal}">
              <button type="button" class="ucc-btn-year" id="btn-qmdj-year-jumper">⚡Năm</button>
              <label class="btn-picker-cal" id="qmdj-btn-native-cal">
                📅
                <input type="datetime-local" id="qmdj-date-picker" value="${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}" class="native-hidden-date">
              </label>
            </div>
          </div>

          <!-- Row 2: Can Chi + Numeric Time -->
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
              <div class="numeric-time-group">
                <input type="number" id="qmdj-input-hour" class="num-box num-hour" min="0" max="23" value="${pad(d.getHours())}" placeholder="Giờ">
                <span class="num-colon">:</span>
                <input type="number" id="qmdj-input-minute" class="num-box num-min" min="0" max="59" value="${pad(d.getMinutes())}" placeholder="Phút">
              </div>
            </div>
            <div class="ucc-step-group">
              <button class="ucc-step-btn" id="btn-qmdj-prev-hour" title="Lùi 1 Giờ (2 tiếng)">◀ 2h</button>
              <button class="ucc-step-btn" id="btn-qmdj-next-hour" title="Tiến 1 Giờ (2 tiếng)">2h ▶</button>
            </div>
          </div>

          <!-- Row 3: Người Hỏi (Can Năm Sinh & Giới Tính) - Dùng chung toàn module -->
          ${renderQuerentRowHtml('Người hỏi')}

          <!-- Row 4: Info & Submit -->
          <div class="ucc-row ucc-row-actions">
            <button class="ucc-btn-now" id="btn-qmdj-now" title="Đặt lại về thời điểm hiện tại">⚡ Giờ thực</button>
            <div class="qmdj-cuc-badge" title="Cục số và Tiết khí: ${solarTermFullStr || solarTerm}">
              <span>${roundText}</span>
              <span class="cuc-dot">•</span>
              <span>${solarTerm}</span>
            </div>
            <button class="ucc-btn-submit" id="btn-qmdj-submit" title="Lập bàn Kỳ Môn Tác Quyết">⚡ Lập Bàn</button>
          </div>

          <!-- Row 5: Chọn Trường Phái (10 Thần vs 8 Thần) & Định Cục (Sách Bổ vs Trí Nhuận) -->
          ${renderSchoolStripHtml(true)}

          <!-- Row 6: Cầu nối La Kinh Chiến Lược -->
          <div class="ucc-row cl-row-lakinh-bridge">
            <button type="button" class="btn-cl-nav-lakinh" id="btn-cl-nav-lakinh" title="Mở La Kinh để định vị phương vị chiến lược thực tế">
              🧭 Chuyển Sang La Kinh Định Vị Thực Địa
            </button>
          </div>
        </div>

        <!-- 4 Pillars Summary Header -->
        <div class="qmdj-pillars-strip">
          <div class="q-pillar"><span class="q-lbl">NĂM</span><strong class="q-val">${pillars.year}</strong></div>
          <div class="q-pillar"><span class="q-lbl">THÁNG</span><strong class="q-val">${pillars.month}</strong></div>
          <div class="q-pillar"><span class="q-lbl">NGÀY</span><strong class="q-val">${pillars.day}</strong></div>
          <div class="q-pillar highlight-hour"><span class="q-lbl">GIỜ</span><strong class="q-val">${pillars.hour}</strong></div>
        </div>

        <!-- Mục Tiêu Tác Chiến (Goal Selector) -->
        <div class="jy-goal-selector">
          <div class="jy-goal-title">🎯 CHỌN MỤC TIÊU TÁC CHIẾN:</div>
          <div class="jy-goal-pills">
            <button type="button" class="jy-goal-btn ${currentChienLuocGoal === 'deal' ? 'active' : ''}" data-goal="deal">💼 Đàm Phán / Hợp Đồng</button>
            <button type="button" class="jy-goal-btn ${currentChienLuocGoal === 'wealth' ? 'active' : ''}" data-goal="wealth">💰 Cầu Tài / Gọi Vốn</button>
            <button type="button" class="jy-goal-btn ${currentChienLuocGoal === 'career' ? 'active' : ''}" data-goal="career">📈 Thăng Tiến / Thi Cử</button>
            <button type="button" class="jy-goal-btn ${currentChienLuocGoal === 'escape' ? 'active' : ''}" data-goal="escape">🐎 Thoát Hiểm / Cứu Nguy</button>
            <button type="button" class="jy-goal-btn ${currentChienLuocGoal === 'dispute' ? 'active' : ''}" data-goal="dispute">🤝 Hòa Giải / Pháp Lý</button>
          </div>
        </div>

        <!-- Khối Bảng Tóm Tắt Tác Quyết (Strategic Dashboard) -->
        <div class="jy-strat-summary">
          <div class="jy-strat-header">
            <span class="jy-strat-title">🧭 THƯỚC NGẮM CHIẾN LƯỢC KHÔNG GIAN</span>
            <div class="jy-strat-badges">
              ${analysis && analysis.is_vetoed ? '<span class="tc-badge tc-badge-warn">⚠️ Ngũ Bất Ngộ Thời</span>' : ''}
              ${analysis && !analysis.is_vetoed && analysis.score >= 25 ? '<span class="tc-badge tc-badge-good">👑 Đại Cát Cách</span>' : ''}
              <span class="tc-badge ${analysis && analysis.score >= 0 ? 'tc-badge-good' : 'tc-badge-warn'}">Điểm: ${analysis ? (analysis.score > 0 ? '+' : '') + analysis.score : 0}đ</span>
            </div>
          </div>

          <!-- Nút Mở La Kinh Định Vị Chiến Lược -->
          <div class="jy-strat-lakinh-bar">
            <button type="button" class="btn-qmdj-open-lakinh btn-cl-open-lakinh" id="btn-cl-open-lakinh" data-deg="${presenterDeg}">
              🧭 Mở La Kinh Để Định Vị Hướng Tác Chiến (${presenterDeg}°)
            </button>
          </div>

          <div class="tc-spatial-grid">
            <div class="tc-spatial-item victory" data-target-dir="presenter" data-deg="${presenterDeg}" role="button" tabindex="0" title="Chạm để mở La Kinh ngắm hướng Tọa Lưng Đắc Thắng (${presenterDeg}°)">
              <div class="tc-spatial-head-row">
                <span class="tc-spatial-label">🟢 Tọa Lưng Đắc Thắng:</span>
                <span class="tc-spatial-lk-tag">🧭 Ngắm</span>
              </div>
              <span class="tc-spatial-val">${strat.presenter_back_facing}</span>
              <small class="tc-spatial-tip">Ngồi quay lưng hướng này để tiếp nhận sinh khí, át vía đối phương</small>
            </div>
            <div class="tc-spatial-item horse" data-target-dir="horse" data-deg="${horseDeg}" role="button" tabindex="0" title="Chạm để mở La Kinh ngắm hướng Thái Trùng Thiên Mã (${horseDeg}°)">
              <div class="tc-spatial-head-row">
                <span class="tc-spatial-label">🟡 Thái Trùng Thiên Mã:</span>
                <span class="tc-spatial-lk-tag">🧭 Ngắm</span>
              </div>
              <span class="tc-spatial-val">${strat.emergency_escape_vector}</span>
              <small class="tc-spatial-tip">Phương vị xuất hành giải cứu khẩn cấp, thoát hiểm an toàn</small>
            </div>
            <div class="tc-spatial-item restrict">
              <span class="tc-spatial-label">🔴 Vùng Bất Kích (Non-Striking):</span>
              <span class="tc-spatial-val">${strat.five_no_attacks.join(' • ')}</span>
              <small class="tc-spatial-tip">Tuyệt đối cấm hướng mặt hoặc đối đầu trực diện</small>
            </div>
            <div class="tc-spatial-item target">
              <span class="tc-spatial-label">🎯 Bố Trí Đối Tác (Audience Placement):</span>
              <span class="tc-spatial-val">${strat.target_placement_sectors.join(' • ')}</span>
              <small class="tc-spatial-tip">Bố trí đối tác ngồi vào cung yếu để chiếm ưu thế đàm phán</small>
            </div>
          </div>
        </div>

        <!-- Bản Đồ Tác Chiến 9 Cung Lạc Thư (3x3 Battle Map) -->
        <div class="jy-battle-map-wrapper">
          <div class="jy-battle-map-title">⚔️ BẢN ĐỒ TÁC CHIẾN 9 CUNG LẠC THƯ (CHẠM CUNG ĐỂ XEM CHI TIẾT)</div>
          <div class="jy-battle-map">
            ${layout.map(row => row.map(pNum => {
              const p = (analysis && analysis.palaces && analysis.palaces[pNum]) || {};
              const dir = PALACE_DIRECTIONS[pNum] || '';
              const shortDir = SHORT_DIRECTIONS[pNum] || dir;
              const pName = PALACE_NAMES[pNum - 1] || `Cung ${pNum}`;

              const isVic1 = analysis && analysis.three_victories && analysis.three_victories.first_victory.palace_id === pNum;
              const isVic2 = analysis && analysis.three_victories && analysis.three_victories.second_victory.palace_id === pNum;
              const isVic3 = analysis && analysis.three_victories && analysis.three_victories.third_victory.palace_id === pNum;
              const isHorse = analysis && analysis.sky_horse && analysis.sky_horse.palace_id === pNum;
              const isRestrict = analysis && analysis.five_restrictions && analysis.five_restrictions.restricted_sectors.some(s => s.palace_id === pNum);
              const isTarget = p.door && (p.door.includes('Tử') || p.door.includes('Kinh'));

              let cellClass = 'jy-battle-cell';
              if (isVic1) cellClass += ' cell-vic1';
              else if (isVic3) cellClass += ' cell-vic3';
              else if (isHorse) cellClass += ' cell-horse';
              else if (isTarget) cellClass += ' cell-target';

              const shortStar = (p.star || '—').replace(/Thiên\s*/g, '');
              const shortDoor = (p.door || '—').replace(/\s*Môn$/g, '');
              const cellGod = (currentDeitySchool === '10thần' && tenDeityMap[pNum]) ? tenDeityMap[pNum] : (p.deity || '—');

              return `
                <div class="${cellClass}" data-palace-index="${pNum - 1}" role="button" tabindex="0">
                  <div class="jy-cell-head">
                    <span class="jy-cell-name">${pName} (${shortDir})</span>
                    <div class="jy-cell-badges">
                      ${isVic1 ? '<span class="jy-badge vic1">👑 TỌA LƯNG</span>' : ''}
                      ${isVic2 ? '<span class="jy-badge vic2">🦅 DƯƠNG BINH</span>' : ''}
                      ${isVic3 ? '<span class="jy-badge vic3">💰 THU TÀI</span>' : ''}
                      ${isHorse ? '<span class="jy-badge horse">🐎 THIÊN MÃ</span>' : ''}
                      ${isRestrict ? '<span class="jy-badge restrict">🚫 BẤT KÍCH</span>' : ''}
                      ${isTarget ? '<span class="jy-badge target">🎯 ÉP ĐỐI TÁC</span>' : ''}
                    </div>
                  </div>
                  <div class="jy-cell-body">
                    <div class="jy-row-god-star">
                      <span class="jy-val-god ${getCatClass(cellGod)}" title="${cellGod}">${cellGod}</span>
                      <span class="jy-val-star ${getCatClass(p.star)}" title="${p.star || ''}">${shortStar}</span>
                    </div>
                    <div class="jy-row-door">
                      <span class="jy-val-door ${getCatClass(p.door)}" title="${p.door || ''}">${shortDoor}</span>
                    </div>
                    <div class="jy-row-stems">
                      <span class="jy-stem">T: <strong>${p.hcs || '—'}</strong></span>
                      <span class="jy-stem-sep">•</span>
                      <span class="jy-stem">Đ: <strong>${p.ecs || '—'}</strong></span>
                      ${p.isKongWang ? '<span class="jy-badge-kw">Không</span>' : ''}
                    </div>
                  </div>
                  ${p.formations && p.formations.length > 0 ? `
                    <div class="jy-cell-forms">
                      ${p.formations.slice(0, 2).map(f => `
                        <span class="jy-form-tag ${f.score > 0 ? 'good' : 'bad'}" title="${f.desc}">
                          ${f.score > 0 ? '🟢' : '🔴'} ${f.name_vn}
                        </span>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')).join('')}
          </div>
        </div>

        <!-- Khối Chủ - Khách Luận (Section E: Host vs Guest) -->
        <div class="jy-host-guest-box">
          <div class="jy-hg-header">
            <span>⚖️ CHỦ - KHÁCH LUẬN: <strong>${hostGuest.role}</strong></span>
          </div>
          <div class="jy-hg-body">
            <div>• <strong>Nhận định thế cuộc:</strong> ${hostGuest.advice}</div>
            <div>• <strong>Chiến thuật hành động:</strong> <strong class="highlight-action">${hostGuest.action}</strong></div>
          </div>
        </div>

        <!-- Khối Dụng Thần Chuyên Sâu (Section A: Useful Gods) -->
        <div class="jy-domain-box">
          <div class="jy-domain-header">${usefulGod.title}</div>
          <div class="jy-domain-body">
            ${usefulGod.items.map(it => `<div>• ${it}</div>`).join('')}
          </div>
        </div>

        <!-- Khối Khắc Ứng Thực Địa (Section H: Evidential Verification) -->
        ${analysis && analysis.evidential_omens ? `
          <div class="tc-omen-box" style="margin-top: 10px;">
            <div class="tc-omen-title">👁️ KHẮC ỨNG NGOẠI CẢNH THỰC ĐỊA (30 PHÚT ĐẦU):</div>
            <div class="tc-omen-body">
              <div>• <strong>Hiện tượng chính (${analysis.evidential_omens.door_omen.door_name}):</strong> ${analysis.evidential_omens.door_omen.prime_phenomenon}</div>
              <div>• <strong>Tín hiệu nhận biết:</strong> ${analysis.evidential_omens.door_omen.signals.join(' • ')}</div>
              <div class="tc-omen-sub">• <em>Quy tắc: Khi xuất hành hoặc khởi sự trong vòng 30 phút, nếu gặp ít nhất 1 điềm báo trên là trường năng lượng đã kích hoạt thành công.</em></div>
            </div>
          </div>
        ` : ''}
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

    bindQmdjTimeEvents(chart, (analysis && analysis.detected_formations) || []);
    bindModeTabsEvents();
    bindChienLuocEvents(chart, (analysis && analysis.detected_formations) || []);
  }

  function bindChienLuocEvents(chart, patterns) {
    bindQuerentRowEvents();
    bindSchoolStripEvents();

    // Goal selector buttons
    document.querySelectorAll('.jy-goal-btn').forEach(btn => {
      btn.onclick = () => {
        const goal = btn.getAttribute('data-goal');
        if (goal && goal !== currentChienLuocGoal) {
          currentChienLuocGoal = goal;
          renderQmdj();
        }
      };
    });

    // Battle cells click to view palace detail modal
    document.querySelectorAll('.jy-battle-cell').forEach(cell => {
      cell.onclick = () => {
        const pIndex = parseInt(cell.getAttribute('data-palace-index'));
        openPalaceDetailModal(chart, patterns, pIndex);
      };
    });

    function openLaKinhStrategic(targetDeg, note = '') {
      if (global.NetaLaKinhView) {
        const lkState = global.NetaLaKinhView.getState();
        if (lkState) {
          lkState.isQmdjStratActive = true;
          lkState.qmdjStratGoal = currentChienLuocGoal;
          lkState.qmdjStratDate = new Date(currentQmdjDate);
          if (typeof global.NetaLaKinhView.updateQmdjStrategicLayer === 'function') {
            global.NetaLaKinhView.updateQmdjStrategicLayer();
          }
        }
        if (targetDeg !== undefined && typeof global.NetaLaKinhView.updateRotation === 'function') {
          global.NetaLaKinhView.updateRotation(targetDeg);
        }
      }
      if (typeof window.switchAppMode === 'function') {
        window.switchAppMode('lakinh');
      } else {
        const tab = document.getElementById('tab-mode-lakinh');
        if (tab) tab.click();
      }
      if (typeof showQmdjToast === 'function') {
        showQmdjToast(note || '🧭 Đã chuyển sang La Kinh và kích hoạt lớp Chiến Lược Kỳ Môn!');
      }
    }

    const btnNavLk = document.getElementById('btn-cl-nav-lakinh');
    if (btnNavLk) {
      btnNavLk.onclick = () => {
        openLaKinhStrategic(undefined, '🧭 Đã mở La Kinh Định Vị Chiến Lược!');
      };
    }

    const btnOpenLk = document.getElementById('btn-cl-open-lakinh');
    if (btnOpenLk) {
      btnOpenLk.onclick = () => {
        const deg = parseFloat(btnOpenLk.getAttribute('data-deg')) || 0;
        openLaKinhStrategic(deg, `🧭 Đã mở La Kinh ngắm hướng Tọa Lưng (${deg}°)!`);
      };
    }

    // Click on spatial items (Tọa lưng / Thiên Mã)
    document.querySelectorAll('.tc-spatial-item[data-deg]').forEach(item => {
      item.onclick = () => {
        const deg = parseFloat(item.getAttribute('data-deg'));
        const type = item.getAttribute('data-target-dir');
        const title = type === 'horse' ? 'Thái Trùng Thiên Mã' : 'Tọa Lưng Đắc Thắng';
        openLaKinhStrategic(isNaN(deg) ? 0 : deg, `🧭 Đã mở La Kinh ngắm hướng ${title} (${deg}°)!`);
      };
    });
  }

  /**
   * Render Chế Độ Tọa Thiền Định Tâm Kỳ Môn (Spiritual Qi Men Meditation)
   */
  function renderThienMode(container, modeTabsHtml, chart) {
    const isAmBan = currentQmdjMode === 'amban';
    const roundVal = chart.round || 1;
    const roundText = roundVal > 0 ? `Dương ${roundVal} Cục` : `Âm ${Math.abs(roundVal)} Cục`;

    const pillars = {
      year: formatPillarCanChi(chart.year),
      month: formatPillarCanChi(chart.month),
      day: formatPillarCanChi(chart.date),
      hour: formatPillarCanChi(chart.hour)
    };

    const d = currentQmdjDate;
    const pad = n => String(n).padStart(2, '0');
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())} - ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

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

    // Identify Deity palaces in current chart (hỗ trợ cả 8 Thần và 10 Thần)
    const deityMap = {};
    if (chart && chart.box) {
      let chiefPalaceNum = 1;
      chart.box.flat().forEach(p => {
        if (p && p.index !== 4 && translate(p.getDivinity(true)).includes('Trực Phù')) {
          chiefPalaceNum = p.index + 1;
        }
      });
      const roundVal = chart.round || 1;
      const tenDeityMap = (global.KetNoiVuTruEngine && currentDeitySchool === '10thần')
        ? global.KetNoiVuTruEngine.allocate10Deities(roundVal > 0 ? 'Dương Độn' : 'Âm Độn', chiefPalaceNum)
        : {};

      chart.box.flat().forEach(p => {
        if (!p || p.index === 4) return; // Skip center palace
        const pNum = p.index + 1;
        const divinity = (currentDeitySchool === '10thần' && tenDeityMap[pNum]) ? tenDeityMap[pNum] : translate(p.getDivinity(true));
        const door = translate(p.getDoor(true));
        const stars = Array.isArray(p.getStar(true)) ? p.getStar(true).map(translate) : [translate(p.getStar(true))];
        deityMap[divinity] = {
          palace: pNum,
          palaceName: PALACE_NAMES[p.index] || `Cung ${pNum}`,
          direction: PALACE_DIRECTIONS[pNum],
          degrees: PALACE_DEG_RANGE[pNum] || '',
          door: door,
          star: stars[0] || ''
        };
      });
    }

    const DEITY_ORDER = [
      'Trực Phù', 'Đằng Xà', 'Thái Âm', 'Lục Hợp', 'Bạch Hổ', 'Câu Trận', 'Huyền Vũ', 'Chu Tước', 'Cửu Địa', 'Cửu Thiên'
    ];

    const DEITY_ICONS = {
      'Trực Phù': '👑', 'Đằng Xà': '🐍', 'Thái Âm': '🌙', 'Lục Hợp': '🤝',
      'Bạch Hổ': '🐯', 'Câu Trận': '⚓', 'Huyền Vũ': '🐢', 'Chu Tước': '🦚',
      'Cửu Địa': '🌍', 'Cửu Thiên': '⚡'
    };

    const DEITY_COLORS = {
      'Trực Phù': '#f59e0b', 'Đằng Xà': '#ec4899', 'Thái Âm': '#38bdf8', 'Lục Hợp': '#10b981',
      'Bạch Hổ': '#f87171', 'Câu Trận': '#fb923c', 'Huyền Vũ': '#6366f1', 'Chu Tước': '#ef4444',
      'Cửu Địa': '#84cc16', 'Cửu Thiên': '#a855f7'
    };

    const DEITY_SLUGS = {
      'Trực Phù': 'truc-phu', 'Đằng Xà': 'dang-xa', 'Thái Âm': 'thai-am', 'Lục Hợp': 'luc-hop',
      'Bạch Hổ': 'bach-ho', 'Câu Trận': 'cau-tran', 'Huyền Vũ': 'huyen-vu', 'Chu Tước': 'chu-tuoc',
      'Cửu Địa': 'cuu-dia', 'Cửu Thiên': 'cuu-thien'
    };

    const activeDeities = (currentDeitySchool === '10thần')
      ? DEITY_ORDER
      : ['Trực Phù', 'Đằng Xà', 'Thái Âm', 'Lục Hợp', 'Bạch Hổ', 'Huyền Vũ', 'Cửu Địa', 'Cửu Thiên'];

    const DEITY_CONFIGS = activeDeities.map(k => {
      const d = (global.KetNoiVuTruEngine && global.KetNoiVuTruEngine.DEITIES[k]) || {};
      return {
        key: k,
        slug: DEITY_SLUGS[k] || 'truc-phu',
        icon: DEITY_ICONS[k] || '🔮',
        title: `${k} - ${d.role || ''} (${d.alias || d.name_en || ''})`,
        desc: d.traits || '',
        caution: d.caution || '',
        color: DEITY_COLORS[k] || '#38bdf8',
        energy: d.energy || 'Năng lượng ánh sáng thuần khiết',
        guide: d.meditation_guide || 'Ngồi thẳng lưng, lưng quay chuẩn về phương vị Thần. Nhắm mắt hít sâu, cảm nhận hào quang ấm áp bao bọc cơ thể.',
        affirmation: d.affirmation || ''
      };
    });

    container.innerHTML = `
      <div class="qmdj-view-container">
        ${modeTabsHtml}

        <!-- Unified Control Card (Thời Gian) -->
        <div class="unified-ctrl-card">
          <!-- Row 1: Calendar switch & Date Box -->
          <div class="ucc-row ucc-row-date">
            <div class="ucc-pill-cal">
              <button type="button" class="ucc-pill-btn ${!isQmdjLunarMode ? 'active' : ''}" id="btn-qmdj-solar">☀️ Dương</button>
              <button type="button" class="ucc-pill-btn ${isQmdjLunarMode ? 'active' : ''}" id="btn-qmdj-lunar">🌙 Âm</button>
            </div>
            <div class="ucc-date-box" id="qmdj-ucc-date-box" title="Nhập ngày tháng hoặc mở lịch">
              <input type="number" id="qmdj-input-day" class="num-box num-day" min="1" max="31" value="${dayVal}">
              <span class="num-slash">/</span>
              <input type="number" id="qmdj-input-month" class="num-box num-month" min="1" max="12" value="${monthVal}">
              <span class="num-slash">/</span>
              <input type="number" id="qmdj-input-year" class="num-box num-year" min="1900" max="2100" value="${yearVal}">
              <button type="button" class="ucc-btn-year" id="btn-qmdj-year-jumper">⚡Năm</button>
              <label class="btn-picker-cal" id="qmdj-btn-native-cal">
                📅
                <input type="datetime-local" id="qmdj-date-picker" value="${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}" class="native-hidden-date">
              </label>
            </div>
          </div>

          <!-- Row 2: Can Chi + Numeric Time -->
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
              <div class="numeric-time-group">
                <input type="number" id="qmdj-input-hour" class="num-box num-hour" min="0" max="23" value="${pad(d.getHours())}" placeholder="Giờ">
                <span class="num-colon">:</span>
                <input type="number" id="qmdj-input-minute" class="num-box num-min" min="0" max="59" value="${pad(d.getMinutes())}" placeholder="Phút">
              </div>
            </div>
            <div class="ucc-step-group">
              <button class="ucc-step-btn" id="btn-qmdj-prev-hour" title="Lùi 1 Giờ (2 tiếng)">◀ 2h</button>
              <button class="ucc-step-btn" id="btn-qmdj-next-hour" title="Tiến 1 Giờ (2 tiếng)">2h ▶</button>
            </div>
          </div>

          <!-- Row 3: Người Thiền (Can Năm Sinh & Giới Tính) - Dùng chung toàn module -->
          ${renderQuerentRowHtml('Người thiền')}

          <!-- Row 4: Info & Submit -->
          <div class="ucc-row ucc-row-actions">
            <button class="ucc-btn-now" id="btn-qmdj-now" title="Thời gian hiện tại">⚡ Giờ thực</button>
            <div class="qmdj-cuc-badge" title="Cục số và Tiết khí: ${solarTermFullStr || solarTerm}">
              <span>${roundText}</span>
              <span class="cuc-dot">•</span>
              <span>${solarTerm}</span>
            </div>
            <button class="ucc-btn-submit" id="btn-qmdj-submit" title="Lập Bàn Tọa Thiền">🧘 Lập Bàn</button>
          </div>

          <!-- Row 5: Trường phái Thần & Thuật toán Định Cục -->
          ${renderSchoolStripHtml(true)}
        </div>

        <!-- 4 Pillars Summary Header -->
        <div class="qmdj-pillars-strip">
          <div class="q-pillar"><span class="q-lbl">NĂM</span><strong class="q-val">${pillars.year}</strong></div>
          <div class="q-pillar"><span class="q-lbl">THÁNG</span><strong class="q-val">${pillars.month}</strong></div>
          <div class="q-pillar"><span class="q-lbl">NGÀY</span><strong class="q-val">${pillars.day}</strong></div>
          <div class="q-pillar highlight-hour"><span class="q-lbl">GIỜ</span><strong class="q-val">${pillars.hour}</strong></div>
        </div>

        <!-- 9-Palace Matrix (Lưới 3x3 Lạc Thư Chuẩn Tọa Thiền) -->
        <div class="qmdj-matrix-grid">
          ${renderPalacesHTML(chart, [], pillars, timeStr)}
        </div>

        <!-- Intro Banner -->
        <div class="qmdj-thien-banner">
          <div class="qmdj-thien-badge">🧘 TỌA THIỀN ĐỊNH TÂM KỲ MÔN • SPIRITUAL QI MEN</div>
          <p class="qmdj-thien-desc">
            Ứng dụng nguyên lý <strong>Tọa Lưng (Back-To)</strong> đón nhận linh khí từ các Đại Cát Thần trong bàn Kỳ Môn tại thời điểm hiện tại để tĩnh tâm, tiếp dẫn năng lượng sinh học và giải trừ bế tắc nội tâm.
          </p>
          <button type="button" class="btn-qmdj-open-lakinh" id="btn-qmdj-open-lakinh">
            🧭 Mở La Kinh Để Định Vị Hướng Ngồi
          </button>
        </div>

        <!-- Breathing Pulse Widget 4-7-8 -->
        <div class="thien-breath-widget" id="thien-breath-widget">
          <div class="thien-breath-title">
            🫁 NHỊP THỞ KHÍ CÔNG 4-7-8 (ĐƯA SÓNG NÃO VỀ TẦNG ALPHA / THETA)
          </div>
          <div class="thien-breath-subtitle">
            Hít sâu 4 giây • Nín thở định khí 7 giây • Thở chậm êm 8 giây
          </div>
          <div class="thien-breath-circle ${breathState.isRunning ? breathState.phase : ''}" id="thien-breath-circle">
            <div class="thien-breath-phase" id="thien-breath-phase">
              ${breathState.isRunning ? (breathState.phase === 'inhale' ? 'HÍT VÀO (4s)' : breathState.phase === 'hold' ? 'GIỮ KHÍ (7s)' : 'THỞ RA (8s)') : 'SẴN SÀNG'}
            </div>
            <div class="thien-breath-sec" id="thien-breath-sec">
              ${breathState.countdown}s
            </div>
          </div>
          <div style="display: flex; justify-content: center; gap: 8px; margin-top: 10px;">
            <button type="button" class="ucc-step-btn" id="btn-thien-breath-toggle" style="padding: 6px 14px; font-weight: 700; background: ${breathState.isRunning ? '#ef4444' : '#10b981'}; color: #fff; border-radius: 8px; border: none; cursor: pointer;">
              ${breathState.isRunning ? '⏹ Dừng Thở' : '▶ Bắt Đầu Thở 4-7-8'}
            </button>
            <button type="button" class="ucc-step-btn" id="btn-thien-breath-reset" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 8px; cursor: pointer;">
              🔄 Đặt Lại
            </button>
          </div>
          <div class="thien-breath-cycle-label" id="thien-breath-cycle-label">
            Vòng thở hiện tại: <strong>${breathState.cycle}</strong>
          </div>
        </div>

        <!-- Noble Deities Cards -->
        <div class="qmdj-deities-list">
          ${DEITY_CONFIGS.map(cfg => {
            const match = deityMap[cfg.key] || {
              palaceName: 'Đang xác định',
              direction: 'Tùy Cục',
              degrees: 'Xem bàn cờ',
              door: '—',
              star: '—'
            };
            return `
              <div class="qmdj-deity-card deity-card-${cfg.slug}" style="border-left: 4px solid ${cfg.color};">
                <div class="deity-card-header">
                  <div class="deity-title-wrap">
                    <span class="deity-icon">${cfg.icon}</span>
                    <strong class="deity-name deity-${cfg.slug}">${cfg.title}</strong>
                  </div>
                  <div class="deity-backto-badge">
                    Tọa Lưng: <strong>${match.direction}</strong>
                  </div>
                </div>
                <div class="deity-meta-strip">
                  <span>🏰 Cung: <strong>${match.palaceName}</strong></span>
                  <span class="sep">•</span>
                  <span>🧭 Độ Số: <strong>${match.degrees}</strong></span>
                  <span class="sep">•</span>
                  <span>🚪 Môn: <strong>${match.door}</strong></span>
                </div>
                <p class="deity-desc">${cfg.desc}</p>
                ${cfg.caution ? `<div class="deity-caution-box"><strong>⚠️ Thận trọng:</strong> ${cfg.caution}</div>` : ''}
                <div class="deity-practice-box">
                  <div class="practice-label">🧘 Pháp Quán Tưởng (${cfg.energy}):</div>
                  <p class="practice-text">${cfg.guide}</p>
                  ${cfg.affirmation ? `<div class="deity-mantra-box"><strong>💬 Thần chú:</strong> "${cfg.affirmation}"</div>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- 3-Step Practice Guide -->
        <div class="qmdj-thien-guide-box">
          <div class="thien-guide-title">📖 QUY TRÌNH 3 BƯỚC TỌA THIỀN KỲ MÔN CHUẨN MỰC:</div>
          <div class="thien-steps-grid">
            <div class="thien-step-item">
              <div class="step-num">1</div>
              <div class="step-content">
                <strong>Định Tọa & Khóa Hướng:</strong>
                <p>Ngồi tư thế thoải mái (bán già, kiết già hoặc ngồi ghế thẳng lưng). Lưng quay chính xác về phương vị của Thần muốn kết nối.</p>
              </div>
            </div>
            <div class="thien-step-item">
              <div class="step-num">2</div>
              <div class="step-content">
                <strong>Đếm Ngược Định Khí (64 ➔ 1):</strong>
                <p>Nhắm hờ mắt, thở bụng sâu êm. Đếm thầm ngược từng nhịp thở từ 64 về 1 để đưa não bộ về tần số Alpha / Theta an tịnh.</p>
              </div>
            </div>
            <div class="thien-step-item">
              <div class="step-num">3</div>
              <div class="step-content">
                <strong>Quán Chiếu & Phát Khởi Ý Niệm:</strong>
                <p>Quán tưởng năng lượng ánh sáng của Thần từ sau lưng rót tràn ngập cơ thể. Khởi niệm ước nguyện cụ thể với lòng biết ơn sâu sắc.</p>
              </div>
            </div>
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

    bindThienEvents(chart);
    bindModeTabsEvents();
  }

  function bindThienEvents(chart) {
    bindQmdjTimeEvents(chart, []);
    const btnLakinh = document.getElementById('btn-qmdj-open-lakinh');
    if (btnLakinh) {
      btnLakinh.onclick = () => {
        if (typeof window.switchAppMode === 'function') {
          window.switchAppMode('lakinh');
        } else {
          const tab = document.getElementById('tab-mode-lakinh');
          if (tab) tab.click();
        }
      };
    }

    const btnToggle = document.getElementById('btn-thien-breath-toggle');
    const btnReset = document.getElementById('btn-thien-breath-reset');
    const circle = document.getElementById('thien-breath-circle');
    const phaseEl = document.getElementById('thien-breath-phase');
    const secEl = document.getElementById('thien-breath-sec');
    const cycleEl = document.getElementById('thien-breath-cycle-label');

    function updateBreathUI() {
      if (!circle || !secEl || !phaseEl) return;
      circle.className = `thien-breath-circle ${breathState.isRunning ? breathState.phase : ''}`;
      secEl.textContent = `${breathState.countdown}s`;
      let phaseText = 'SẴN SÀNG';
      if (breathState.isRunning) {
        if (breathState.phase === 'inhale') phaseText = 'HÍT VÀO (4s)';
        else if (breathState.phase === 'hold') phaseText = 'GIỮ KHÍ (7s)';
        else if (breathState.phase === 'exhale') phaseText = 'THỞ RA (8s)';
      }
      phaseEl.textContent = phaseText;
      if (btnToggle) {
        btnToggle.textContent = breathState.isRunning ? '⏹ Dừng Thở' : '▶ Bắt Đầu Thở 4-7-8';
        btnToggle.style.background = breathState.isRunning ? '#ef4444' : '#10b981';
      }
      if (cycleEl) {
        cycleEl.innerHTML = `Vòng thở hiện tại: <strong>${breathState.cycle}</strong>`;
      }
    }

    if (btnToggle) {
      btnToggle.onclick = () => {
        breathState.isRunning = !breathState.isRunning;
        if (breathState.isRunning) {
          breathState.phase = 'inhale';
          breathState.countdown = 4;
          updateBreathUI();
          if (breathTimer) clearInterval(breathTimer);
          breathTimer = setInterval(() => {
            breathState.countdown--;
            if (breathState.countdown <= 0) {
              if (breathState.phase === 'inhale') {
                breathState.phase = 'hold';
                breathState.countdown = 7;
              } else if (breathState.phase === 'hold') {
                breathState.phase = 'exhale';
                breathState.countdown = 8;
              } else if (breathState.phase === 'exhale') {
                breathState.phase = 'inhale';
                breathState.countdown = 4;
                breathState.cycle++;
              }
            }
            updateBreathUI();
          }, 1000);
        } else {
          if (breathTimer) {
            clearInterval(breathTimer);
            breathTimer = null;
          }
          breathState.phase = 'inhale';
          breathState.countdown = 4;
          updateBreathUI();
        }
      };
    }

    if (btnReset) {
      btnReset.onclick = () => {
        if (breathTimer) {
          clearInterval(breathTimer);
          breathTimer = null;
        }
        breathState.isRunning = false;
        breathState.phase = 'inhale';
        breathState.countdown = 4;
        breathState.cycle = 1;
        updateBreathUI();
      };
    }
  }

  /**
   * Render Chế Độ Kỳ Môn Bản Mệnh (Joey Yap Destiny Qi Men / Life Palace)
   */
  function renderBanMenhMode(container, modeTabsHtml, chart) {
    const d = currentQmdjDate;
    const pad = n => String(n).padStart(2, '0');

    let solarTermStr = "Xuân Phân";
    if (global.NetaCalendarEngine) {
      if (typeof global.NetaCalendarEngine.getSolarTermDetails === 'function') {
        const std = global.NetaCalendarEngine.getSolarTermDetails(d.getDate(), d.getMonth() + 1, d.getFullYear(), d.getHours(), d.getMinutes());
        solarTermStr = std.term;
      } else {
        solarTermStr = global.NetaCalendarEngine.getSolarTerm(d.getDate(), d.getMonth() + 1, d.getFullYear());
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

    const dStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())} - ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

    // Lập lá số Bát Tự & Tính Kỳ Môn Bản Mệnh
    let baziChart = null;
    if (global.NetaBaziEngine) {
      try {
        baziChart = global.NetaBaziEngine.buildBaziChart({
          solarDate: d,
          isMale: currentBanMenhIsMale,
          startAge: 3
        });
      } catch (e) {
        console.error("Lỗi dựng Bát Tự cho Bản Mệnh:", e);
      }
    }

    const yStr = formatPillarCanChi(chart.year).split(' ');
    const mStr = formatPillarCanChi(chart.month).split(' ');
    const dStrP = formatPillarCanChi(chart.date).split(' ');
    const hStr = formatPillarCanChi(chart.hour).split(' ');

    const baziFallback = {
      solarDate: d,
      tuTru: [
        { gan: yStr[0] || 'Giáp', zhi: yStr[1] || 'Tý' },
        { gan: mStr[0] || 'Giáp', zhi: mStr[1] || 'Tý' },
        { gan: dStrP[0] || 'Giáp', zhi: dStrP[1] || 'Tý' },
        { gan: hStr[0] || 'Giáp', zhi: hStr[1] || 'Tý' }
      ],
      solarTermStr: solarTermStr
    };

    let chiefPalaceNum = 1;
    if (chart && chart.box) {
      chart.box.forEach((row) => {
        row.forEach((palace) => {
          if (palace && palace.index !== 4 && translate(palace.getDivinity(true)).includes('Trực Phù')) {
            chiefPalaceNum = palace.index + 1;
          }
        });
      });
    }
    const roundVal = chart.round || 1;
    const tenDeityMap = (global.KetNoiVuTruEngine && currentDeitySchool === '10thần')
      ? global.KetNoiVuTruEngine.allocate10Deities(roundVal > 0 ? 'Dương Độn' : 'Âm Độn', chiefPalaceNum)
      : null;

    let destiny = null;
    if (global.JoeyYapQMDJEngine && typeof global.JoeyYapQMDJEngine.computeDestinyQiMen === 'function') {
      try {
        destiny = global.JoeyYapQMDJEngine.computeDestinyQiMen(baziChart || baziFallback, chart, {
          deitySchool: currentDeitySchool,
          tenDeityMap: tenDeityMap
        });
      } catch (e) {
        console.error("Lỗi tính toán Bản Mệnh Kỳ Môn:", e);
      }
    }

    // Attach destinyRoles to chart for 9-palace matrix badges
    chart.destinyRoles = (destiny && destiny.all_palaces_roles) ? destiny.all_palaces_roles : null;

    const lp = (destiny && destiny.life_palace) ? destiny.life_palace : {
      palace_id: 6,
      palace_name: 'Càn (Tây Bắc)',
      direction: 'Tây Bắc',
      degrees: '292.5° - 337.5°',
      center_deg: 315,
      deity: 'Trực Phù',
      deity_en: 'Chief',
      deity_title: 'Đại Biểu Ý Chí Vũ Trụ Tối Cao',
      deity_power: 'Hộ mệnh cao quý, chuyển hung hóa cát, tiếp nhận năng lượng lãnh đạo tối cao.',
      deity_affirmation: 'Tôi kết nối với trường năng lượng vũ trụ cao nhất, mọi dự định đều được phù trợ quang minh.',
      deity_advice: 'Luôn giữ tâm chính trực, hành động nhất quán và nâng đỡ những người xung quanh.',
      star: 'Thiên Tâm',
      star_intellect: 'Trí tuệ lãnh đạo chiến lược, mưu lược toàn cục và sự thấu suốt sâu sắc.',
      door: 'Khai Môn',
      door_action: 'Mở rộng cơ hội, hanh thông sự nghiệp, đón nhận chân trời mới.',
      heaven_stem: 'Mậu',
      earth_stem: 'Mậu',
      formations: []
    };

    const yp = (destiny && destiny.year_palace) ? destiny.year_palace : {
      palace_id: 1,
      palace_name: 'Khảm (Bắc)',
      direction: 'Bắc',
      deity: 'Lục Hợp',
      door: 'Hưu Môn',
      star: 'Thiên Bồng',
      heaven_stem: '—',
      earth_stem: '—'
    };

    const cp = (destiny && destiny.career_palace) || {
      palace_id: 6,
      palace_name: 'Càn (Tây Bắc)', direction: 'Tây Bắc', door: 'Khai Môn', star: 'Thiên Tâm', deity: 'Trực Phù',
      door_action: 'Mở rộng cơ hội, quan lộ hanh thông, công việc phát triển.', heaven_stem: '—', earth_stem: '—'
    };
    const wp = (destiny && destiny.wealth_palace) || {
      palace_id: 8,
      palace_name: 'Cấn (Đông Bắc)', direction: 'Đông Bắc', door: 'Sinh Môn', star: 'Thiên Nhậm', deity: 'Cửu Địa',
      door_action: 'Tài nguyên dồi dào, sinh sôi lợi nhuận, tích lũy của cải.', heaven_stem: '—', earth_stem: '—'
    };
    const rp = (destiny && destiny.relationship_palace) || {
      palace_id: 2,
      palace_name: 'Khôn (Tây Nam)', direction: 'Tây Nam', door: 'Hưu Môn', star: 'Thiên Nhuế', deity: 'Lục Hợp',
      deity_power: 'Hòa hợp nhân duyên, gia đạo ấm êm, thu hút đồng đội chân thành.', heaven_stem: '—', earth_stem: '—'
    };
    const hp = (destiny && destiny.health_palace) || {
      palace_id: 2,
      palace_name: 'Khôn (Tây Nam)', direction: 'Tây Nam', door: 'Tử Môn', star: 'Thiên Nhuế', deity: 'Đằng Xà',
      heaven_stem: '—', earth_stem: '—'
    };
    const np = (destiny && destiny.nobleman_palace) || {
      palace_id: 1,
      palace_name: 'Khảm (Bắc)', direction: 'Bắc', door: 'Khai Môn', star: 'Thiên Cầm', deity: 'Trực Phù',
      heaven_stem: '—', earth_stem: '—'
    };
    const chp = (destiny && destiny.hour_palace) || {
      palace_id: 8,
      palace_name: 'Cấn (Đông Bắc)', direction: 'Đông Bắc', door: 'Sinh Môn', star: 'Thiên Nhậm', deity: 'Thái Âm',
      heaven_stem: '—', earth_stem: '—'
    };

    // Đồng bộ đảm bảo tuyệt đối theo 10 Thần nếu đang ở trường phái 10 Thần
    if (currentDeitySchool === '10thần' && tenDeityMap) {
      const syncDeityMeta = (pal) => {
        if (!pal || !pal.palace_id || !tenDeityMap[pal.palace_id]) return;
        pal.deity = tenDeityMap[pal.palace_id];
        const dMeta = (global.JoeyYapQMDJEngine && global.JoeyYapQMDJEngine.DEITIES_META && global.JoeyYapQMDJEngine.DEITIES_META[pal.deity]) || {};
        const knMeta = (global.KetNoiVuTruEngine && global.KetNoiVuTruEngine.DEITIES && global.KetNoiVuTruEngine.DEITIES[pal.deity]) || {};
        pal.deity_en = dMeta.en || knMeta.alias || pal.deity;
        pal.deity_title = knMeta.role || dMeta.title || pal.deity_title;
        pal.deity_power = dMeta.subconscious_power || knMeta.role || pal.deity_power;
        pal.deity_affirmation = knMeta.affirmation || dMeta.affirmation || pal.deity_affirmation;
        pal.deity_advice = dMeta.advice || knMeta.suitable_actions || pal.deity_advice;
      };
      syncDeityMeta(lp);
      syncDeityMeta(yp);
      syncDeityMeta(cp);
      syncDeityMeta(wp);
      syncDeityMeta(rp);
      syncDeityMeta(hp);
      syncDeityMeta(np);
      syncDeityMeta(chp);
    }

    const DEITY_ICONS = {
      'Trực Phù': '✨',
      'Đằng Xà': '🐍',
      'Thái Âm': '🌙',
      'Lục Hợp': '🤝',
      'Bạch Hổ': '🐯',
      'Câu Trần': '⚓',
      'Huyền Vũ': '🐢',
      'Chu Tước': '🦚',
      'Cửu Địa': '🌍',
      'Cửu Thiên': '🚀'
    };
    const deityIcon = DEITY_ICONS[lp.deity] || '🔮';
    const ketNoiDeity = (global.KetNoiVuTruEngine && global.KetNoiVuTruEngine.DEITIES) ? global.KetNoiVuTruEngine.DEITIES[lp.deity] : null;

    const pillars = {
      year: formatPillarCanChi(chart.year),
      month: formatPillarCanChi(chart.month),
      day: formatPillarCanChi(chart.date),
      hour: formatPillarCanChi(chart.hour)
    };

    container.innerHTML = `
      <div class="qmdj-view-container">
        ${modeTabsHtml}

        <!-- Unified Control Card: Nhập Ngày Giờ Sinh -->
        <div class="unified-ctrl-card">
          <!-- Row 1: Calendar switch & Date Box -->
          <div class="ucc-row ucc-row-date">
            <div class="ucc-pill-cal">
              <button type="button" class="ucc-pill-btn ${!isQmdjLunarMode ? 'active' : ''}" id="btn-qmdj-solar">☀️ Dương</button>
              <button type="button" class="ucc-pill-btn ${isQmdjLunarMode ? 'active' : ''}" id="btn-qmdj-lunar">🌙 Âm</button>
            </div>
            <div class="ucc-date-box" id="qmdj-ucc-date-box" title="Nhập ngày tháng hoặc chọn lịch">
              <input type="number" id="qmdj-input-day" class="num-box num-day" min="1" max="31" value="${dayVal}" placeholder="Ngày">
              <span class="num-slash">/</span>
              <input type="number" id="qmdj-input-month" class="num-box num-month" min="1" max="12" value="${monthVal}" placeholder="Tháng">
              <span class="num-slash">/</span>
              <input type="number" id="qmdj-input-year" class="num-box num-year" min="1900" max="2100" value="${yearVal}" placeholder="Năm">
              <button type="button" class="ucc-btn-year" id="btn-qmdj-year-jumper" title="Chọn nhanh thập niên & năm">⚡Năm</button>
              <label class="btn-picker-cal" id="qmdj-btn-native-cal" title="Mở bảng chọn Ngày & Giờ">
                📅
                <input type="datetime-local" id="qmdj-date-picker" value="${dStr}T${pad(d.getHours())}:${pad(d.getMinutes())}" class="native-hidden-date">
              </label>
            </div>
          </div>

          <!-- Row 2: Can Chi + Numeric Time & Gender -->
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
              <div class="numeric-time-group">
                <input type="number" id="qmdj-input-hour" class="num-box num-hour" min="0" max="23" value="${pad(d.getHours())}" placeholder="Giờ">
                <span class="num-colon">:</span>
                <input type="number" id="qmdj-input-minute" class="num-box num-min" min="0" max="59" value="${pad(d.getMinutes())}" placeholder="Phút">
              </div>
            </div>
            <div class="ucc-step-group">
              <button type="button" class="ucc-step-btn" id="btn-qmdj-prev-hour" title="Lùi 2 giờ (1 Canh)">◀ 2h</button>
              <button type="button" class="ucc-step-btn" id="btn-qmdj-next-hour" title="Tiến 2 giờ (1 Canh)">2h ▶</button>
            </div>
          </div>

          <!-- Row 3: Người Hỏi / Bản Mệnh (Nam/Nữ & Can Năm Sinh) - Dùng chung toàn module -->
          ${renderQuerentRowHtml('Bản mệnh')}

          <!-- Row 4: Actions -->
          <div class="ucc-row ucc-row-actions">
            <button class="ucc-btn-now" id="btn-qmdj-now" title="Về thời điểm hiện tại">
              ⚡ Giờ thực
            </button>
            <div class="qmdj-cuc-badge" id="btn-qmdj-cuc-modal" title="Cung Bản Mệnh">
              <span>👤 Cung: <strong>${lp.palace_name}</strong></span>
            </div>
            <button class="ucc-btn-submit" id="btn-qmdj-submit" title="Lập Mệnh Bàn Kỳ Môn">
              🔮 Lập Mệnh Bàn
            </button>
          </div>

          <!-- Row 5: Trường phái Thần & Thuật toán Định Cục -->
          ${renderSchoolStripHtml(true)}
        </div>

        <!-- Tứ Trụ Sinh Mệnh Strip -->
        <div class="qmdj-pillars-strip">
          <div class="q-pillar"><span class="q-lbl">NĂM:</span><strong class="q-val">${pillars.year}</strong></div>
          <div class="q-pillar"><span class="q-lbl">THÁNG:</span><strong class="q-val">${pillars.month}</strong></div>
          <div class="q-pillar"><span class="q-lbl">NGÀY:</span><strong class="q-val">${pillars.day}</strong></div>
          <div class="q-pillar highlight-hour"><span class="q-lbl">GIỜ:</span><strong class="q-val">${pillars.hour}</strong></div>
        </div>

        <!-- 9-Palace Matrix (Lưới 3x3 Lạc Thư Kỳ Môn Bản Mệnh) -->
        <div class="qmdj-matrix-grid">
          ${renderPalacesHTML(chart, [], pillars, timeStr)}
        </div>

        <!-- Thẻ Kỳ Môn Bản Mệnh Chính -->
        <div class="banmenh-card" id="qmdj-banmenh-card">
          <div class="bazi-card-title">
            <div class="bqc-title-left">
              <span>🔮 KỲ MÔN BẢN MỆNH</span>
              <span class="bqc-badge-palace">${lp.palace_name} (${lp.direction} • ${lp.degrees})</span>
            </div>
            <button type="button" class="bqc-btn-lakinh" id="btn-banmenh-open-lakinh" data-deg="${lp.center_deg}" data-dir="${lp.direction}" title="Mở La Kinh định vị phương vị Bản Mệnh">
              🧭 Mở La Kinh
            </button>
          </div>

          <div class="bqc-main-grid">
            <!-- Cột Trái: Thần Hộ Mệnh Cá Nhân -->
            <div class="bqc-deity-box">
              <div class="bqc-box-header">
                <span class="bqc-icon">${deityIcon}</span>
                <div class="bqc-deity-titles">
                  <div class="bqc-deity-name">${lp.deity} <span class="bqc-deity-en">(${lp.deity_en})</span></div>
                  <div class="bqc-deity-role">${(ketNoiDeity && ketNoiDeity.role) ? ketNoiDeity.role : lp.deity_title}</div>
                </div>
              </div>

              <div class="bqc-prop-row">
                <span class="bqc-label">Năng lực Tiềm thức:</span>
                <span class="bqc-val">${lp.deity_power}</span>
              </div>

              ${ketNoiDeity ? `
                <div class="bqc-prop-row">
                  <span class="bqc-label">Bản chất Tâm thức:</span>
                  <span class="bqc-val">${ketNoiDeity.traits}</span>
                </div>
                <div class="bqc-prop-row">
                  <span class="bqc-label">Hành động Phù hợp:</span>
                  <span class="bqc-val">${ketNoiDeity.suitable_actions}</span>
                </div>
                ${ketNoiDeity.caution ? `
                  <div class="bqc-prop-row">
                    <span class="bqc-label">Bẫy Tâm lý / Kỵ:</span>
                    <span class="bqc-val bqc-prop-val-caution">⚠️ ${ketNoiDeity.caution}</span>
                  </div>
                ` : ''}
              ` : ''}

              <div class="bqc-prop-row bqc-affirmation-row">
                <span class="bqc-label">Khẩu quyết Kích hoạt:</span>
                <blockquote class="bqc-affirmation-quote">"${(ketNoiDeity && ketNoiDeity.affirmation) ? ketNoiDeity.affirmation : lp.deity_affirmation}"</blockquote>
              </div>

              <div class="bqc-prop-row">
                <span class="bqc-label">Lời khuyên Khai mở:</span>
                <span class="bqc-val bqc-advice">${lp.deity_advice}</span>
              </div>
            </div>

            <!-- Cột Phải: Bộ Ba Bản Mệnh (Sao, Cửa, Khí Cục & Can Tọa) -->
            <div class="bqc-details-box">
              <div class="bqc-detail-item">
                <div class="bqc-di-header">
                  <span class="bqc-di-icon">⭐</span>
                  <span class="bqc-di-title">Sao Bản Mệnh: <strong>${lp.star}</strong></span>
                </div>
                <p class="bqc-di-desc">${lp.star_intellect}</p>
              </div>

              <div class="bqc-detail-item">
                <div class="bqc-di-header">
                  <span class="bqc-di-icon">🚪</span>
                  <span class="bqc-di-title">Cửa Bản Mệnh: <strong>${lp.door}</strong></span>
                </div>
                <p class="bqc-di-desc">${lp.door_action}</p>
              </div>

              <div class="bqc-detail-item">
                <div class="bqc-di-header">
                  <span class="bqc-di-icon">🛡️</span>
                  <span class="bqc-di-title">Khí Cục & Can Tọa: <strong>${lp.heaven_stem} / ${lp.earth_stem}</strong></span>
                </div>
                <div class="bqc-formations-list">
                  ${lp.formations && lp.formations.length > 0 ? lp.formations.map(f => `
                    <span class="bqc-formation-badge ${f.is_auspicious ? 'badge-auspicious' : 'badge-inauspicious'}" title="${f.description}">
                      ${f.is_auspicious ? '✨' : '⚠️'} ${f.name}
                    </span>
                  `).join('') : '<span class="bqc-formation-neutral">Bình hòa, không phạm hình khắc trực xung.</span>'}
                </div>
              </div>

              <div class="bqc-detail-item bqc-social-item">
                <div class="bqc-di-header">
                  <span class="bqc-di-icon">🌐</span>
                  <span class="bqc-di-title">Cung Xã Hội (Can Năm): <strong>${yp.palace_name} (${yp.direction})</strong></span>
                </div>
                <p class="bqc-di-desc">Thần <strong>${yp.deity}</strong> • Môn <strong>${yp.door}</strong> • Tinh <strong>${yp.star}</strong> (Ảnh hưởng môi trường vĩ mô và uy tín xã hội).</p>
              </div>
            </div>
          </div>

          <!-- Thanh Hướng dẫn Tọa Lưng Đắc Khí Trọn Đời -->
          <div class="bqc-compass-banner">
            <span class="bqc-cb-icon">🧘</span>
            <div class="bqc-cb-text">
              <strong>Phương vị Tọa Lưng Đắc Khí Trọn Đời:</strong> Khi thiền định, lập chiến lược hoặc đối mặt quyết định trọng đại, hãy ngồi <strong>quay lưng về hướng ${lp.direction} (${lp.palace_name} • ${lp.degrees})</strong> để tiếp nhận trường khí bảo hộ mạnh nhất từ Thần Bản Mệnh ${lp.deity}.
            </div>
          </div>
        </div>

        <!-- Bát Đại Cung Chức Năng Bổ Trợ (Functional Palaces) -->
        <div class="banmenh-subpalaces-section">
          <div class="bm-subpalaces-title">✨ CÁC CUNG CHỨC NĂNG TRỌNG YẾU (BÁT ĐẠI CUNG KỲ MÔN MỆNH)</div>
          <div class="bm-subpalaces-grid">
            <!-- Cung Sự Nghiệp -->
            <div class="bm-sub-card">
              <div class="bm-sc-head">
                <span class="bm-sc-role">💼 CUNG SỰ NGHIỆP</span>
                <span class="bm-sc-palace">${cp.palace_name} (${cp.direction})</span>
              </div>
              <div class="bm-sc-body">
                <div>🚪 <strong>${cp.door}</strong> • ⭐ <strong>${cp.star}</strong> • 🔮 <strong>${cp.deity}</strong></div>
                <div class="bm-sc-stems">Thiên/Địa: <strong>${cp.heaven_stem} / ${cp.earth_stem}</strong></div>
                <p class="bm-sc-desc">${cp.door_action}</p>
              </div>
            </div>

            <!-- Cung Tài Lộc -->
            <div class="bm-sub-card">
              <div class="bm-sc-head">
                <span class="bm-sc-role">💰 CUNG TÀI LỘC</span>
                <span class="bm-sc-palace">${wp.palace_name} (${wp.direction})</span>
              </div>
              <div class="bm-sc-body">
                <div>🚪 <strong>${wp.door}</strong> • ⭐ <strong>${wp.star}</strong> • 🔮 <strong>${wp.deity}</strong></div>
                <div class="bm-sc-stems">Thiên/Địa: <strong>${wp.heaven_stem} / ${wp.earth_stem}</strong></div>
                <p class="bm-sc-desc">${wp.door_action}</p>
              </div>
            </div>

            <!-- Cung Hôn Nhân -->
            <div class="bm-sub-card">
              <div class="bm-sc-head">
                <span class="bm-sc-role">❤️ CUNG HÔN NHÂN / DUYÊN</span>
                <span class="bm-sc-palace">${rp.palace_name} (${rp.direction})</span>
              </div>
              <div class="bm-sc-body">
                <div>🔮 <strong>${rp.deity}</strong> • 🚪 <strong>${rp.door}</strong> • ⭐ <strong>${rp.star}</strong></div>
                <div class="bm-sc-stems">Thiên/Địa: <strong>${rp.heaven_stem} / ${rp.earth_stem}</strong></div>
                <p class="bm-sc-desc">${rp.deity_power}</p>
              </div>
            </div>

            <!-- Cung Sức Khỏe -->
            <div class="bm-sub-card">
              <div class="bm-sc-head">
                <span class="bm-sc-role">🩺 CUNG SỨC KHỎE</span>
                <span class="bm-sc-palace">${hp.palace_name} (${hp.direction})</span>
              </div>
              <div class="bm-sc-body">
                <div>⭐ <strong>${hp.star}</strong> • 🚪 <strong>${hp.door}</strong> • 🔮 <strong>${hp.deity}</strong></div>
                <div class="bm-sc-stems">Thiên/Địa: <strong>${hp.heaven_stem} / ${hp.earth_stem}</strong></div>
                <p class="bm-sc-desc">Chủ về thể chất, đề kháng sinh học và các cơ quan nhạy cảm theo Tượng Cung.</p>
              </div>
            </div>

            <!-- Cung Quý Nhân -->
            <div class="bm-sub-card">
              <div class="bm-sc-head">
                <span class="bm-sc-role">✨ CUNG QUÝ NHÂN</span>
                <span class="bm-sc-palace">${np.palace_name} (${np.direction})</span>
              </div>
              <div class="bm-sc-body">
                <div>👑 <strong>${np.deity}</strong> • 🚪 <strong>${np.door}</strong> • ⭐ <strong>${np.star}</strong></div>
                <div class="bm-sc-stems">Thiên/Địa: <strong>${np.heaven_stem} / ${np.earth_stem}</strong></div>
                <p class="bm-sc-desc">Phương vị quý nhân nâng đỡ, giải nguy và mở lối cơ hội lớn.</p>
              </div>
            </div>

            <!-- Cung Tử Tức -->
            <div class="bm-sub-card">
              <div class="bm-sc-head">
                <span class="bm-sc-role">👶 CUNG TỬ TỨC (CAN GIỜ)</span>
                <span class="bm-sc-palace">${chp.palace_name} (${chp.direction})</span>
              </div>
              <div class="bm-sc-body">
                <div>🚪 <strong>${chp.door}</strong> • ⭐ <strong>${chp.star}</strong> • 🔮 <strong>${chp.deity}</strong></div>
                <div class="bm-sc-stems">Thiên/Địa: <strong>${chp.heaven_stem} / ${chp.earth_stem}</strong></div>
                <p class="bm-sc-desc">Hậu vận, con cái, cấp dưới và các thành quả tạo tác lâu dài.</p>
              </div>
            </div>
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

    bindBanMenhEvents(chart, lp);
  }

  function bindBanMenhEvents(chart, lp) {
    bindQmdjTimeEvents(chart, []);
    bindModeTabsEvents();
    bindQuerentRowEvents();
    bindSchoolStripEvents();

    const btnMale = document.getElementById('btn-banmenh-male');
    const btnFemale = document.getElementById('btn-banmenh-female');
    if (btnMale) {
      btnMale.onclick = () => {
        currentBanMenhIsMale = true;
        renderQmdj();
      };
    }
    if (btnFemale) {
      btnFemale.onclick = () => {
        currentBanMenhIsMale = false;
        renderQmdj();
      };
    }

    const btnLakinh = document.getElementById('btn-banmenh-open-lakinh');
    if (btnLakinh) {
      btnLakinh.onclick = () => {
        if (typeof window.switchAppMode === 'function') {
          window.switchAppMode('lakinh');
        } else {
          const tab = document.getElementById('tab-mode-lakinh');
          if (tab) tab.click();
        }
      };
    }
  }

  function renderPtSafetyAlerts(chart, fullAudit) {
    const audit = fullAudit && fullAudit.yang_house_analysis ? fullAudit.yang_house_analysis : null;
    let html = '';
    if (audit && audit.critical_violations && audit.critical_violations.length > 0) {
      audit.critical_violations.forEach(v => {
        const isCrit = v.severity === 'CRITICAL';
        const rem = v.remediation || {};
        const t1 = rem.tier1_thong_quan;
        const t2 = rem.tier2_tiet_khi;
        const t3 = rem.tier3_che_sat;
        html += `
          <div class="pt-alert-box ${isCrit ? 'crit' : ''}" style="margin-top: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
              <strong>${isCrit ? '🚨' : '⚠️'} [${v.severity}] ${v.name} (Cung ${v.palace_id})</strong>
              <span style="font-size: 0.62rem; padding: 1px 6px; border-radius: 4px; background: rgba(0,0,0,0.2);">${rem.strategy || 'HÓA GIẢI'}</span>
            </div>
            <div style="font-size: 0.68rem; margin-bottom: 4px; opacity: 0.9;">${v.impact}</div>
            <div style="font-size: 0.66rem; background: rgba(0,0,0,0.18); padding: 4px 6px; border-radius: 4px;">
              <strong>💡 Chỉ Dẫn Xử Lý:</strong> ${rem.action_advice || ''}
            </div>

            <!-- 3-Tier Remediation Display (07_THUAT_TOAN_HOA_GIAI_NGU_HANH.md) -->
            <div class="pt-tier-remedy-grid">
              ${t1 ? `
                <div class="pt-tier-col preferred">
                  <span class="pt-tier-pill t1">★ CẤP 1: THÔNG QUAN</span>
                  <div><strong>Vật phẩm:</strong> ${t1.items.join(', ')}</div>
                  <div style="opacity: 0.85; margin-top: 2px;">• ${t1.placement}</div>
                  <div style="color: #fde047; font-size: 0.58rem; margin-top: 2px;">⏳ ${t1.activation_timing}</div>
                </div>
              ` : ''}
              ${t2 ? `
                <div class="pt-tier-col">
                  <span class="pt-tier-pill t2">CẤP 2: TIẾT KHÍ</span>
                  <div><strong>Vật phẩm:</strong> ${t2.items.join(', ')}</div>
                  <div style="opacity: 0.85; margin-top: 2px;">• ${t2.placement}</div>
                  <div style="color: #7dd3fc; font-size: 0.58rem; margin-top: 2px;">⏳ ${t2.activation_timing}</div>
                </div>
              ` : ''}
              ${t3 ? `
                <div class="pt-tier-col">
                  <span class="pt-tier-pill t3">CẤP 3: CHẾ SÁT</span>
                  <div><strong>Vật phẩm:</strong> ${t3.items.join(', ')}</div>
                  <div style="opacity: 0.85; margin-top: 2px;">• ${t3.placement}</div>
                  <div style="color: #fca5a5; font-size: 0.58rem; margin-top: 2px;">⏳ ${t3.activation_timing}</div>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      });
    } else {
      html += `<div class="pt-alert-box pt-alert-success">✅ Không có lỗi đại sát nghiêm trọng trong bố trí các phòng chức năng.</div>`;
    }
    return html;
  }

  /**
   * Render Chế Độ Phong Thủy Kỳ Môn Toàn Diện (Dương Trạch & Âm Trạch)
   */
  function renderPhongThuyMode(container, modeTabsHtml, chart) {
    ptState.subMode = ptState.subMode || 'duong_trach';
    const currentPtDeg = (ptState.degree !== undefined && !isNaN(ptState.degree)) ? ptState.degree : 300.0;
    const lkRotVal = (global.NetaLaKinhView && typeof global.NetaLaKinhView.getState === 'function')
      ? ((global.NetaLaKinhView.getState().rotation % 360 + 360) % 360)
      : currentPtDeg;
    const lkRotDisplay = lkRotVal.toFixed(1);

    const fsEngine = global.NetaQmdjFengShuiEngine;
    const voidAudit = (fsEngine && typeof fsEngine.detectCompassVoidLines === 'function')
      ? fsEngine.detectCompassVoidLines(currentPtDeg)
      : { has_void_line: false, type: 'CHÍNH TUYẾN THUẦN KHÍ (Pure Directional Line)', measured_angle: currentPtDeg };

    const voidBadgeClass = voidAudit.has_void_line ? (voidAudit.severity === 'CRITICAL' ? 'void-crit' : 'void-warn') : 'void-safe';
    const voidBadgeIcon = voidAudit.has_void_line ? (voidAudit.severity === 'CRITICAL' ? '🚨' : '⚠️') : '✅';
    const voidBadgeText = `${voidBadgeIcon} ${voidAudit.type}${voidAudit.has_void_line ? ` (Lệch ${voidAudit.deviation}°) - ${voidAudit.severity}` : ''}`;

    const fullAudit = fsEngine ? fsEngine.runComprehensiveFengShuiAudit({
      mode: ptState.subMode,
      house_degree: currentPtDeg,
      room_allocations: ptState.rooms,
      owner_birth_can: currentQuerentStem || 'Kỷ',
      owner_birth_year: currentQuerentYear || 1979,
      owner_is_male: (currentQuerentGender === 'nam'),
      deceased_birth_can: ptState.deceasedCan || 'Ất',
      grave_palace_id: ptState.gravePalaceId || 2,
      chart_palaces: chart.palacesData || {},
      kong_wang_palaces: []
    }) : null;

    const isDuongTrach = ptState.subMode === 'duong_trach';

    let contentHtml = '';
    if (isDuongTrach) {
      contentHtml = renderPtYangHouseViewHtml(chart, fullAudit, lkRotDisplay, currentPtDeg, voidAudit, voidBadgeClass, voidBadgeText);
    } else {
      contentHtml = renderPtYinHouseViewHtml(chart, fullAudit, lkRotDisplay, currentPtDeg, voidAudit, voidBadgeClass, voidBadgeText);
    }

    container.innerHTML = `
      <div class="qmdj-view-container">
        ${modeTabsHtml}

        <!-- Sub-mode Dual Switch: Dương Trạch vs Âm Trạch -->
        <div class="pt-submode-toggle-bar">
          <button type="button" class="pt-submode-btn ${isDuongTrach ? 'active' : ''}" id="btn-pt-submode-duong" title="Chuyển sang khảo sát Dương Trạch (Nhà ở, Trụ sở)">
            🏡 DƯƠNG TRẠCH (NHÀ Ở & TRỤ SỞ)
          </button>
          <button type="button" class="pt-submode-btn ${!isDuongTrach ? 'active' : ''}" id="btn-pt-submode-am" title="Chuyển sang khảo sát Âm Trạch (Mồ mả, Gia tộc)">
            🪦 ÂM TRẠCH (MỒ MẢ GIA TỘC)
          </button>
        </div>

        ${contentHtml}

        <!-- 5-Action Buttons Bar -->
        <div class="pt-actions-bar">
          <button type="button" class="pt-action-btn btn-primary" id="btn-pt-open-essay" title="Xem Bài Luận Khoa Học Toàn Diện">
            📜 ${isDuongTrach ? 'Báo Cáo Dương Trạch (8 Tầng)' : 'Báo Cáo Âm Trạch (9 Tầng)'}
          </button>
          <button type="button" class="pt-action-btn" id="btn-pt-open-trachcat" title="Tra cứu thời khắc cát tường theo Kỳ Môn">
            ⏳ ${isDuongTrach ? 'Trạch Cát Khởi Công / Nhập Trạch' : 'Trạch Cát Hạ Huyệt / Cải Táng'}
          </button>
          <button type="button" class="pt-action-btn" id="btn-pt-download-essay" title="Tải xuống tệp báo cáo định dạng Markdown .md">
            💾 Tải .md
          </button>
          <button type="button" class="pt-action-btn" id="btn-pt-ai-polish" title="Kích hoạt trợ lý AI hiệu đính chuyên sâu">
            ✨ ${ptState.isAiPolishing ? 'Đang Xử Lý...' : 'Biên Tập AI'}
          </button>
          <button type="button" class="pt-action-btn" id="btn-pt-copy-essay" title="Sao chép toàn văn báo cáo vào Clipboard">
            📋 Sao Chép
          </button>
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

      <!-- Feng Shui Essay Modal -->
      <div class="qmdj-fs-modal-overlay ${ptState.isEssayModalOpen ? 'open' : ''}" id="qmdj-fs-essay-modal">
        <div class="qmdj-fs-modal-dialog">
          <div class="qmdj-fs-modal-header">
            <div class="qmdj-fs-modal-title">
              <span>📜</span>
              <span>${isDuongTrach ? 'Báo Cáo Phong Thủy Dương Trạch (8 Tầng)' : 'Báo Cáo Phong Thủy Âm Trạch (9 Tầng)'}</span>
            </div>
            <button class="qmdj-fs-modal-close" id="qmdj-fs-essay-modal-close" aria-label="Đóng">&times;</button>
          </div>
          <div class="qmdj-fs-modal-body">
            <textarea id="qmdj-fs-essay-textarea" class="qmdj-fs-modal-textarea" readonly></textarea>
          </div>
          <div class="qmdj-fs-modal-footer">
            <button type="button" class="pt-action-btn" id="btn-pt-modal-copy">📋 Sao Chép</button>
            <button type="button" class="pt-action-btn" id="btn-pt-modal-download">💾 Tải .md</button>
            <button type="button" class="pt-action-btn btn-primary" id="btn-pt-modal-close-footer">Đóng</button>
          </div>
        </div>
      </div>

      <!-- Trạch Cát Modal -->
      <div class="qmdj-fs-modal-overlay ${ptState.isTrachCatModalOpen ? 'open' : ''}" id="qmdj-fs-trachcat-modal">
        <div class="qmdj-fs-modal-dialog">
          <div class="qmdj-fs-modal-header">
            <div class="qmdj-fs-modal-title">
              <span>⏳</span>
              <span>Trạch Cát Kỳ Môn Phong Thủy</span>
            </div>
            <button class="qmdj-fs-modal-close" id="qmdj-fs-trachcat-modal-close" aria-label="Đóng">&times;</button>
          </div>
          <div class="qmdj-fs-modal-body" id="qmdj-fs-trachcat-body">
            <!-- Dynamically populated -->
          </div>
          <div class="qmdj-fs-modal-footer">
            <button type="button" class="pt-action-btn btn-primary" id="btn-pt-trachcat-close-footer">Đóng</button>
          </div>
        </div>
      </div>
    `;

    bindPhongThuyEvents(chart);
    bindModeTabsEvents();

    if (ptState.isEssayModalOpen) {
      populatePtEssayModalBody(chart, fullAudit);
    }
    if (ptState.isTrachCatModalOpen) {
      populatePtTrachCatModalBody(chart);
    }
  }

  /**
   * Render HTML Chuyên Biệt Dương Trạch
   */
  function renderPtYangHouseViewHtml(chart, fullAudit, lkRotDisplay, currentPtDeg, voidAudit, voidBadgeClass, voidBadgeText) {
    const yang = fullAudit && fullAudit.yang_house_analysis ? fullAudit.yang_house_analysis : {};
    const hm = yang.house_metrics || {};
    const p9 = fullAudit && fullAudit.period_9_san_yuan_audit ? fullAudit.period_9_san_yuan_audit : {};
    const wa = fullAudit && fullAudit.qi_men_water_activation ? fullAudit.qi_men_water_activation : {};
    const bestWater = wa.best_water_location || null;
    const waterProto = wa.activation_protocol || {};
    const dest = fullAudit && fullAudit.destiny_house_harmony ? fullAudit.destiny_house_harmony : {};
    const kua = dest.kua_profile || {};
    const qDest = dest.qmdj_destiny || {};
    const harmonyScore = dest.overall_harmony_score !== undefined ? dest.overall_harmony_score : 80;
    const harmonyVerdict = dest.verdict || "CÁT TƯỜNG HÒA HỢP";

    const vitalityScore = hm.overall_vitality_score !== undefined ? hm.overall_vitality_score : 78;
    const vitalityVerdict = hm.verdict || "CÁT TƯỜNG";
    const vitalityClass = vitalityScore >= 80 ? 'good' : (vitalityScore >= 55 ? 'mid' : 'bad');

    const fsEngine = global.NetaQmdjFengShuiEngine;
    const microAudit = (fsEngine && typeof fsEngine.evaluateMicroCosmosRoom === 'function')
      ? fsEngine.evaluateMicroCosmosRoom({
          room_type: ptState.microRoom.type,
          desk_palace: ptState.microRoom.deskPalace,
          sitting_palace: ptState.microRoom.sittingPalace,
          facing_palace: ptState.microRoom.facingPalace,
          chart_palaces: chart.palacesData || {},
          kong_wang_palaces: []
        })
      : { score: 75, verdict: "CÁT LỢI", advantages: [], warnings: [], remedies: [] };

    const isMacro = ptState.thaiCucMode !== 'micro';

    return `
      <!-- Phong Thuy Control Card Dương Trạch -->
      <div class="unified-ctrl-card pt-ctrl-card">
        <!-- Row 0: Gia Chủ (Nam/Nữ & Can Năm Sinh) -->
        ${renderQuerentRowHtml('Gia chủ')}

        <!-- Row 1: Vận Nhà & Hướng Nhà (16 Hướng Chuẩn) -->
        <div class="ucc-row pt-row-params">
          <div class="pt-field-group">
            <label class="pt-field-lbl" for="pt-select-van">🏛️ VẬN:</label>
            <select id="pt-select-van" class="pt-select">
              <option value="9" ${ptState.van === 9 ? 'selected' : ''}>Vận 9 (2024 - 2043) ★</option>
              <option value="8" ${ptState.van === 8 ? 'selected' : ''}>Vận 8 (2004 - 2023)</option>
              <option value="7" ${ptState.van === 7 ? 'selected' : ''}>Vận 7 (1984 - 2003)</option>
              <option value="6" ${ptState.van === 6 ? 'selected' : ''}>Vận 6 (1964 - 1983)</option>
              <option value="5" ${ptState.van === 5 ? 'selected' : ''}>Vận 5 (1944 - 1963)</option>
              <option value="4" ${ptState.van === 4 ? 'selected' : ''}>Vận 4 (1924 - 1943)</option>
              <option value="3" ${ptState.van === 3 ? 'selected' : ''}>Vận 3 (1904 - 1923)</option>
              <option value="2" ${ptState.van === 2 ? 'selected' : ''}>Vận 2 (1884 - 1903)</option>
              <option value="1" ${ptState.van === 1 ? 'selected' : ''}>Vận 1 (1864 - 1883)</option>
            </select>
          </div>

          <div class="pt-field-group">
            <label class="pt-field-lbl" for="pt-select-huong">🧭 HƯỚNG NHÀ (16 HƯỚNG):</label>
            <select id="pt-select-huong" class="pt-select">
              ${HUONG_16_LIST.map(h => `
                <option value="${h.key}" ${ptState.huongKey === h.key ? 'selected' : ''}>${h.name}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Row 2: Vị Cửa 24 Sơn & Lập Bàn -->
        <div class="ucc-row pt-row-cua">
          <div class="pt-field-group" style="flex: 1.4;">
            <label class="pt-field-lbl" for="pt-select-cua">🚪 VỊ CỬA (24 SƠN):</label>
            <select id="pt-select-cua" class="pt-select">
              ${SON_24_DOOR_INFO.map(item => `
                <option value="${item.son}" ${ptState.sonCua === item.son ? 'selected' : ''}>Sơn ${item.son} (${item.deg}) - ${item.code}</option>
              `).join('')}
            </select>
          </div>
          <button type="button" class="ucc-btn-submit pt-btn-submit" id="btn-pt-submit" title="Lập Bàn Kỳ Môn Phong Thủy">
            🔮 Lập Bàn
          </button>
        </div>

        <!-- Row 3: Cầu nối La Kinh Thực Địa & Tọa độ Hướng Nhà -->
        <div class="ucc-row pt-row-lakinh-bridge" style="margin-top: 6px; display: flex; justify-content: space-between; align-items: center; gap: 6px; flex-wrap: wrap;">
          <div style="display: flex; gap: 4px; align-items: center;">
            <button type="button" class="pt-sync-lk-btn" id="btn-pt-sync-lakinh" title="Đồng bộ góc xoay thực địa từ La Kinh">
              🧭 Lấy góc (${lkRotDisplay}°)
            </button>
            <button type="button" class="pt-open-lk-btn" id="btn-pt-open-lakinh" title="Mở La Kinh thực địa để ngắm hướng">
              🧭 Mở La Kinh
            </button>
          </div>
          <div class="pt-survey-wrap" style="display: flex; align-items: center; gap: 3px;">
            <span class="pt-survey-note">Tọa độ:</span>
            <input type="number" id="pt-input-deg" class="pt-input-deg" min="0" max="360" step="0.5" value="${currentPtDeg.toFixed(1)}" title="Nhập độ số hướng nhà thực tế (0 - 360°)" />
            <span class="pt-survey-unit">°</span>
          </div>
        </div>

        <!-- Row 3.5: Tuyến Số Không Vong La Kinh Status Badge -->
        <div style="margin-top: 6px; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 0.62rem; color: #94a3b8; font-weight: 700;">Tuyến Số La Kinh:</span>
          <div class="pt-voidline-badge ${voidBadgeClass}" title="${voidAudit.impact || voidAudit.status}">
            ${voidBadgeText}
          </div>
        </div>

        <!-- Row 4: Trường phái Thần (10 Thần vs 8 Thần) & Định Cục -->
        ${renderSchoolStripHtml(true)}
      </div>

      <!-- Phong Thủy Info Strip -->
      <div class="qmdj-term-strip pt-term-strip">
        <span>🏡 <strong>Dương Trạch Cửu Cung</strong></span>
        <span class="term-sep">•</span>
        <span>Vận: <strong>${chart.van}</strong></span>
        <span class="term-sep">•</span>
        <span>Phù: <strong class="tk-exact-time">${chart.phuThu}</strong></span>
        <span class="term-sep">•</span>
        <span>Sử: <strong class="tk-exact-time">${chart.trucSuPalaceName}</strong></span>
      </div>

      <!-- Parameters Summary Header -->
      <div class="pt-summary-strip">
        <div class="q-pillar"><span class="q-lbl">VẬN:</span><strong class="q-val">Vận ${chart.van}</strong></div>
        <div class="q-pillar"><span class="q-lbl">HƯỚNG:</span><strong class="q-val">${chart.huongShortName || chart.huongName}</strong></div>
        <div class="q-pillar"><span class="q-lbl">CỬA:</span><strong class="q-val">Sơn ${chart.sonCua} (Cung ${chart.cuaPalace})</strong></div>
        <div class="q-pillar highlight-hour"><span class="q-lbl">TRỰC PHÙ:</span><strong class="q-val">${chart.rootStar}</strong></div>
        ${chart.hkMatrix ? `<div class="q-pillar"><span class="q-lbl">CÁCH CỤC:</span><strong class="q-val q-pattern-val">${chart.hkMatrix.patternName}</strong></div>` : ''}
      </div>

      <!-- Period 9 & House Score Card -->
      <div class="pt-p9-card">
        <div class="pt-p9-header">
          <div class="pt-p9-title">
            <span>🏛️ HẠ NGUYÊN VẬN 9 (2024 - 2043)</span>
          </div>
          <div class="pt-vitality-badge ${vitalityClass}">
            <span>Sinh Khí:</span>
            <strong>${vitalityScore} / 100 (${vitalityVerdict})</strong>
          </div>
        </div>
        <div class="pt-p9-grid">
          <div class="pt-p9-col">
            <div class="pt-p9-label">Chính Thần (Ly 9 - Nam):</div>
            <div class="pt-p9-val">Ưa Tĩnh / Núi / Tọa kiên cố</div>
          </div>
          <div class="pt-p9-col">
            <div class="pt-p9-label">Linh Thần (Khảm 1 - Bắc):</div>
            <div class="pt-p9-val">Ưa Động / Nước / Cửa nạp tài</div>
          </div>
        </div>
        <div style="margin-top: 6px; font-size: 0.68rem; color: #cbd5e1; line-height: 1.4;">
          ${(p9.insights || []).map(ins => `<div>• ${ins}</div>`).join('')}
        </div>
      </div>

      <!-- Destiny Harmony Card (Bản Mệnh Gia Chủ & Trạch Khí) -->
      <div class="pt-destiny-card">
        <div class="pt-destiny-header">
          <div class="pt-destiny-title">
            <span>👤 TƯƠNG PHỐI BẢN MỆNH GIA CHỦ & TRẠCH KHÍ</span>
          </div>
          <div class="pt-destiny-badge">
            <span>Hòa Hợp: <strong>${harmonyScore} / 100 (${harmonyVerdict})</strong></span>
          </div>
        </div>
        <div class="pt-destiny-grid">
          <div class="pt-destiny-col">
            <div><strong>Cung Phi Bát Trạch:</strong> Mệnh <strong>${kua.cung || 'Khảm'}</strong> (${kua.nhom || 'Đông Tứ Mệnh'})</div>
            <div><strong>Du Niên Hướng Nhà:</strong> <span style="color: #4ade80; font-weight: 800;">${kua.du_nien || 'Phục Vị'}</span> (${kua.score || 80}đ)</div>
          </div>
          <div class="pt-destiny-col">
            <div><strong>Cung Bản Mệnh Kỳ Môn:</strong> <strong>${qDest.palace_name || 'Cung 3'}</strong> (${qDest.door || 'Khai Môn'} • ${qDest.deity || 'Trực Phù'})</div>
            <div><strong>Tương Tác Ngũ Hành:</strong> ${dest.wuxing_interaction ? dest.wuxing_interaction.split('(')[0].trim() : 'Tỷ Hòa'}</div>
          </div>
        </div>
        <div style="font-size: 0.66rem; opacity: 0.9; line-height: 1.45;">
          <strong>💡 Chiến Lược Hóa Giải:</strong> ${dest.strategic_advice || 'Khí trường đạt mức độ hòa hợp cao.'}
        </div>
      </div>

      <!-- 9-Palace Matrix -->
      <div class="qmdj-matrix-grid">
        ${renderPalacesHTML(chart, [], {}, `VẬN ${chart.van} • ${chart.huongName}`)}
      </div>

      <!-- Water Dragon Activator Card -->
      <div class="pt-water-card">
        <div class="pt-water-header">
          <div class="pt-water-title">
            <span>💧 THỦY PHÁP KÍCH HOẠT TÀI LỘC (WATER DRAGON)</span>
          </div>
          <div style="display: flex; gap: 6px; align-items: center;">
            <button type="button" class="pt-water-ics-btn" id="btn-pt-download-water-ics" title="Tải tệp lịch nhắc hẹn mở nước (.ics) để thêm vào Google/Apple Calendar">
              📅 Tải Lịch Nhắc (.ics)
            </button>
            <span style="font-size: 0.64rem; font-weight: 800; color: #67e8f9;">
              ${bestWater ? `Điểm: ${bestWater.activation_score}/100` : 'Chưa định vị'}
            </span>
          </div>
        </div>
        <div class="pt-water-body">
          ${bestWater ? `
            <div><strong>• Điểm vàng:</strong> <span style="color: #fef08a; font-weight: 800;">${bestWater.palace_name}</span> (${bestWater.door} • ${bestWater.star} • ${bestWater.deity})</div>
            <div><strong>• Quy cách vật phẩm:</strong> ${waterProto.water_feature_type || 'Thác nước phong thủy luân / Hồ cá thủy sinh'}</div>
            <div><strong>• Thời khắc mở nước:</strong> ${waterProto.activation_timing || 'Giờ Sinh Môn hoặc giờ Thìn / Thân / Tý'}</div>
            <div><strong>• Tác dụng:</strong> ${waterProto.expected_outcome || 'Kích hoạt dòng tiền trong 14 đến 49 ngày.'}</div>
          ` : `
            <div>Hiện tại chưa phát hiện vị trí hội tụ đủ Cát Môn và Cát Thần để đặt Thủy Pháp mà không phạm uế khí.</div>
          `}
        </div>
      </div>

      <!-- Toggle Thái Cực Kép: Toàn Nhà (Macro) vs Phòng Riêng (Micro) -->
      <div class="pt-thaicuc-toggle-bar">
        <button type="button" class="pt-tc-btn ${isMacro ? 'active' : ''}" id="btn-pt-tc-macro">
          🌐 ĐẠI THÁI CỰC (TOÀN BỘ NGÔI NHÀ)
        </button>
        <button type="button" class="pt-tc-btn ${!isMacro ? 'active' : ''}" id="btn-pt-tc-micro">
          🎯 TIỂU THÁI CỰC (PHÒNG RIÊNG & BÀN LÀM VIỆC)
        </button>
      </div>

      ${isMacro ? `
        <!-- Kiểm Định Cấm Kỵ 6 Không Gian Nội Khí (Quét 13 Đại Sát) -->
        <div class="pt-safety-card">
          <div class="pt-safety-header">
            <div class="pt-safety-title">
              <span>🚨</span>
              <span>KIỂM TRA CẤM KỴ 6 PHÒNG ỐC & 13 ĐẠI SÁT (QMDJ AUDIT)</span>
            </div>
          </div>
          <div class="pt-rooms-grid">
            <div class="pt-room-item">
              <span class="pt-room-lbl">🚪 Cửa Chính:</span>
              <select id="pt-select-room-door" class="pt-room-select">
                ${[6,1,8,3,4,9,2,7].map(p => `<option value="${p}" ${(ptState.rooms.main_door || chart.huongPalace) === p ? 'selected' : ''}>${PALACE_NAMES[p-1]} (${PALACE_DIRECTIONS[p]})</option>`).join('')}
              </select>
            </div>
            <div class="pt-room-item">
              <span class="pt-room-lbl">🍳 Bếp Nấu:</span>
              <select id="pt-select-room-kitchen" class="pt-room-select">
                ${[6,1,8,3,4,9,2,7].map(p => `<option value="${p}" ${ptState.rooms.kitchen === p ? 'selected' : ''}>${PALACE_NAMES[p-1]} (${PALACE_DIRECTIONS[p]})</option>`).join('')}
              </select>
            </div>
            <div class="pt-room-item">
              <span class="pt-room-lbl">🚽 Vệ Sinh:</span>
              <select id="pt-select-room-toilet" class="pt-room-select">
                ${[8,1,3,4,9,2,7,6,5].map(p => `<option value="${p}" ${ptState.rooms.toilet === p ? 'selected' : ''}>${p === 5 ? 'Trung Cung (5)' : `${PALACE_NAMES[p-1]} (${PALACE_DIRECTIONS[p]})`}</option>`).join('')}
              </select>
            </div>
            <div class="pt-room-item">
              <span class="pt-room-lbl">🛏️ Phòng Ngủ:</span>
              <select id="pt-select-room-bedroom" class="pt-room-select">
                ${[4,1,8,3,9,2,7,6].map(p => `<option value="${p}" ${ptState.rooms.bedroom === p ? 'selected' : ''}>${PALACE_NAMES[p-1]} (${PALACE_DIRECTIONS[p]})</option>`).join('')}
              </select>
            </div>
            <div class="pt-room-item">
              <span class="pt-room-lbl">🛋️ Phòng Khách:</span>
              <select id="pt-select-room-living" class="pt-room-select">
                ${[3,1,8,4,9,2,7,6].map(p => `<option value="${p}" ${ptState.rooms.living_room === p ? 'selected' : ''}>${PALACE_NAMES[p-1]} (${PALACE_DIRECTIONS[p]})</option>`).join('')}
              </select>
            </div>
            <div class="pt-room-item">
              <span class="pt-room-lbl">🕯️ Ban Thờ:</span>
              <select id="pt-select-room-altar" class="pt-room-select">
                ${[9,1,8,3,4,2,7,6].map(p => `<option value="${p}" ${ptState.rooms.altar === p ? 'selected' : ''}>${PALACE_NAMES[p-1]} (${PALACE_DIRECTIONS[p]})</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="pt-safety-alerts">
            ${renderPtSafetyAlerts(chart, fullAudit)}
          </div>
        </div>
      ` : `
        <!-- Tiểu Thái Cực (Micro-Cosmos) Analysis Card -->
        <div class="pt-micro-card">
          <div class="pt-micro-header">
            <div class="pt-micro-title">
              <span>🎯 TIỂU THÁI CỰC: BỐ TRÍ PHÒNG RIÊNG & BÀN LÀM VIỆC</span>
            </div>
            <span style="font-size: 0.64rem; font-weight: 800; color: #60a5fa;">
              Sinh Khí Phòng: ${microAudit.score}/100 (${microAudit.verdict})
            </span>
          </div>
          <div class="pt-micro-grid">
            <div>
              <label style="font-size: 0.60rem; color: #94a3b8; display: block; margin-bottom: 2px;">Không Gian:</label>
              <select id="pt-micro-room-type" class="pt-micro-select">
                <option value="office" ${ptState.microRoom.type === 'office' ? 'selected' : ''}>Phòng Làm Việc / Văn Phòng</option>
                <option value="study" ${ptState.microRoom.type === 'study' ? 'selected' : ''}>Phòng Học / Thư Phòng</option>
                <option value="bedroom" ${ptState.microRoom.type === 'bedroom' ? 'selected' : ''}>Phòng Ngủ Master</option>
              </select>
            </div>
            <div>
              <label style="font-size: 0.60rem; color: #94a3b8; display: block; margin-bottom: 2px;">Vị Trí Kê Bàn / Giường:</label>
              <select id="pt-micro-desk-palace" class="pt-micro-select">
                ${[1,8,3,4,9,2,7,6].map(p => `<option value="${p}" ${ptState.microRoom.deskPalace === p ? 'selected' : ''}>${PALACE_NAMES[p-1]} (${PALACE_DIRECTIONS[p]})</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="font-size: 0.60rem; color: #94a3b8; display: block; margin-bottom: 2px;">Tọa Vị Lưng Tựa:</label>
              <select id="pt-micro-sitting-palace" class="pt-micro-select">
                ${[8,1,3,4,9,2,7,6].map(p => `<option value="${p}" ${ptState.microRoom.sittingPalace === p ? 'selected' : ''}>${PALACE_NAMES[p-1]} (${PALACE_DIRECTIONS[p]})</option>`).join('')}
              </select>
            </div>
          </div>
          <div style="font-size: 0.66rem; line-height: 1.45; background: rgba(0,0,0,0.2); padding: 6px 8px; border-radius: 6px;">
            <div><strong>• Cấu Trúc Khí Vị:</strong> ${microAudit.desk_door} • ${microAudit.desk_star} • ${microAudit.desk_deity} | Tựa lưng: ${microAudit.sitting_deity}</div>
            ${microAudit.advantages.length > 0 ? `<div style="color: #4ade80; margin-top: 3px;">• <strong>Cát Lợi:</strong> ${microAudit.advantages.join('; ')}</div>` : ''}
            ${microAudit.warnings.length > 0 ? `<div style="color: #f87171; margin-top: 3px;">• <strong>Cảnh Báo:</strong> ${microAudit.warnings.join('; ')}</div>` : ''}
            ${microAudit.remedies.length > 0 ? `<div style="color: #fde047; margin-top: 3px;">• <strong>Chỉ Dẫn:</strong> ${microAudit.remedies.join('; ')}</div>` : ''}
          </div>
        </div>
      `}

      <!-- Interactive Floor Plan Overlay Card (CAD / Canvas) -->
      <div class="pt-floorplan-card">
        <div class="pt-fp-header">
          <div class="pt-fp-title">
            <span>📐 MẶT BẰNG KIẾN TRÚC & PHỦ LƯỚI CỬU CUNG (CAD / CANVAS)</span>
          </div>
          <div class="pt-fp-controls-top">
            <label for="pt-fp-file-input" class="pt-fp-btn" title="Tải ảnh mặt bằng căn hộ / ngôi nhà của bạn">📁 Tải Ảnh</label>
            <input type="file" id="pt-fp-file-input" accept="image/*" style="display:none;" />
            <button type="button" class="pt-fp-btn" id="btn-pt-fp-sample" title="Nạp sơ đồ mặt bằng kiến trúc mẫu">🏠 Sơ Đồ Mẫu</button>
            <button type="button" class="pt-fp-btn" id="btn-pt-fp-save" title="Lưu và tải ảnh đã phủ lưới Kỳ Môn về máy">💾 Lưu Ảnh PNG</button>
          </div>
        </div>
        <div class="pt-fp-body">
          <div class="pt-fp-canvas-wrap">
            <canvas id="pt-floorplan-canvas" width="600" height="380"></canvas>
          </div>
          <div class="pt-fp-slider-bar">
            <div class="pt-fp-slider-item">
              <span>Độ Mờ Lưới:</span>
              <input type="range" id="pt-fp-opacity" min="0.1" max="0.8" step="0.05" value="${ptState.floorPlan.opacity}" />
            </div>
            <div class="pt-fp-slider-item">
              <span>Thu Phóng:</span>
              <input type="range" id="pt-fp-zoom" min="0.6" max="1.8" step="0.05" value="${ptState.floorPlan.zoom}" />
            </div>
            <div class="pt-fp-slider-item">
              <span>Xoay La Kinh:</span>
              <span style="font-weight: 800; color: #fde047;">${currentPtDeg.toFixed(1)}° (${chart.huongName || ''})</span>
            </div>
          </div>
        </div>
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
    `;
  }

  /**
   * Render HTML Chuyên Biệt Âm Trạch (Mồ Mả Gia Tộc)
   */
  function renderPtYinHouseViewHtml(chart, fullAudit, lkRotDisplay, currentPtDeg, voidAudit, voidBadgeClass, voidBadgeText) {
    const yin = fullAudit && fullAudit.yin_house_analysis ? fullAudit.yin_house_analysis : {};
    const gm = yin.grave_metrics || {};
    const ve = yin.vong_linh_evaluation || {};
    const anom = yin.detected_anomalies || [];
    const desc = yin.descendants_impact_audit || {};

    const CAN_WUXING = {
      "Giáp": "Mộc", "Ất": "Mộc",
      "Bính": "Hỏa", "Đinh": "Hỏa",
      "Mậu": "Thổ", "Kỷ": "Thổ",
      "Canh": "Kim", "Tân": "Kim",
      "Nhâm": "Thủy", "Quý": "Thủy"
    };

    const PALACE_WUXING = {
      1: "Thủy", 2: "Thổ", 3: "Mộc", 4: "Mộc",
      5: "Thổ", 6: "Kim", 7: "Kim", 8: "Thổ", 9: "Hỏa"
    };

    const STEM_OPTIONS = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];

    return `
      <!-- Phong Thuy Control Card Âm Trạch -->
      <div class="unified-ctrl-card pt-ctrl-card">
        <!-- Row 0: Niên Mệnh Vong Linh (Can Năm Sinh người mất) -->
        <div class="ucc-row pt-row-params">
          <div class="pt-field-group">
            <label class="pt-field-lbl" for="pt-select-deceased-can">🕯️ NIÊN MỆNH VONG LINH:</label>
            <select id="pt-select-deceased-can" class="pt-select">
              ${STEM_OPTIONS.map(stem => `
                <option value="${stem}" ${ptState.deceasedCan === stem ? 'selected' : ''}>Can ${stem} (${CAN_WUXING[stem] || 'Mộc'})</option>
              `).join('')}
            </select>
          </div>

          <div class="pt-field-group">
            <label class="pt-field-lbl" for="pt-select-grave-palace">🪦 CUNG HUYỆT MỘ:</label>
            <select id="pt-select-grave-palace" class="pt-select">
              ${[2,1,3,4,6,7,8,9].map(p => `
                <option value="${p}" ${ptState.gravePalaceId === p ? 'selected' : ''}>${PALACE_NAMES[p-1]} (${PALACE_DIRECTIONS[p]} - ${PALACE_WUXING[p]})</option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Row 1: Cầu nối La Kinh & Tọa độ Hướng Bia Mộ -->
        <div class="ucc-row pt-row-lakinh-bridge" style="margin-top: 6px; display: flex; justify-content: space-between; align-items: center; gap: 6px; flex-wrap: wrap;">
          <div style="display: flex; gap: 4px; align-items: center;">
            <button type="button" class="pt-sync-lk-btn" id="btn-pt-sync-lakinh" title="Đồng bộ góc xoay bia mộ từ La Kinh">
              🧭 Lấy góc (${lkRotDisplay}°)
            </button>
            <button type="button" class="pt-open-lk-btn" id="btn-pt-open-lakinh" title="Mở La Kinh thực địa">
              🧭 Mở La Kinh
            </button>
          </div>
          <div class="pt-survey-wrap" style="display: flex; align-items: center; gap: 3px;">
            <span class="pt-survey-note">Hướng bia:</span>
            <input type="number" id="pt-input-deg" class="pt-input-deg" min="0" max="360" step="0.5" value="${currentPtDeg.toFixed(1)}" title="Nhập độ số hướng bia mộ (0 - 360°)" />
            <span class="pt-survey-unit">°</span>
          </div>
          <button type="button" class="ucc-btn-submit pt-btn-submit" id="btn-pt-submit" title="Khảo Sát Âm Trạch">
            🔮 Lập Bàn
          </button>
        </div>

        <!-- Row 1.5: Tuyến Số Không Vong La Kinh Status Badge -->
        <div style="margin-top: 6px; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 0.62rem; color: #94a3b8; font-weight: 700;">Tuyến Số Huyệt Mộ:</span>
          <div class="pt-voidline-badge ${voidBadgeClass}" title="${voidAudit.impact || voidAudit.status}">
            ${voidBadgeText}
          </div>
        </div>

        <!-- Row 2: Trường phái Thần & Định Cục -->
        ${renderSchoolStripHtml(true)}
      </div>

      <!-- Strip info Âm Trạch -->
      <div class="qmdj-term-strip pt-term-strip">
        <span>🪦 <strong>Âm Trạch Cửu Cung</strong></span>
        <span class="term-sep">•</span>
        <span>Huyệt Vị: <strong>${gm.grave_palace_name || 'Cung Tử Môn'}</strong></span>
        <span class="term-sep">•</span>
        <span>Vong Linh: <strong class="tk-exact-time">${ve.deceased_can} (${ve.deceased_wuxing})</strong></span>
        <span class="term-sep">•</span>
        <span>Trạng Thái: <strong class="tk-exact-time">${ve.spiritual_peace}</strong></span>
      </div>

      <!-- Card Thông Tin Huyệt Mộ & Thẩm Định Vong Linh -->
      <div class="pt-p9-card">
        <div class="pt-p9-header">
          <div class="pt-p9-title">
            <span>🕯️ THẨM ĐỊNH TƯƠNG QUAN MỘ PHẦN VS VONG LINH</span>
          </div>
          <div class="pt-vitality-badge ${ve.spiritual_peace === 'YÊN ỔN SIÊU THOÁT' ? 'good' : 'bad'}">
            <strong>${ve.spiritual_peace || 'BÌNH HÒA'}</strong>
          </div>
        </div>
        <div class="pt-p9-grid">
          <div class="pt-p9-col">
            <div class="pt-p9-label">Cung Vị Huyệt Mộ:</div>
            <div class="pt-p9-val">${gm.grave_palace_name} • ${gm.grave_door}</div>
          </div>
          <div class="pt-p9-col">
            <div class="pt-p9-label">Tương Quan Ngũ Hành:</div>
            <div class="pt-p9-val">${ve.relation || 'TỶ HÒA'}</div>
          </div>
        </div>
      </div>

      <!-- 9-Palace Matrix -->
      <div class="qmdj-matrix-grid">
        ${renderPalacesHTML(chart, [], {}, `ÂM TRẠCH • VẬN ${chart.van}`)}
      </div>

      <!-- Card Thấu Suốt Lòng Đất: 8 Bệnh Mồ Mả -->
      <div class="pt-anomalies-card">
        <div class="pt-p9-header">
          <div class="pt-p9-title">
            <span>👁️ THẤU SUỐT LÒNG ĐẤT: CHẨN ĐOÁN 8 BỆNH MỒ MẢ</span>
          </div>
          <span style="font-size: 0.64rem; font-weight: 800; color: ${anom.length > 0 ? '#fca5a5' : '#86efac'};">
            ${anom.length > 0 ? `Phát hiện ${anom.length} bất thường` : 'Địa Khí An Lành'}
          </span>
        </div>
        <div>
          ${anom.length === 0 ? `
            <div class="pt-alert-box pt-alert-success" style="margin-top: 6px;">
              ✅ Không phát hiện bệnh ngập úng, rễ cây đâm xuyên, kiến mối hay sạt lở. Huyệt tụ khí ấm áp, chân linh an nghỉ.
            </div>
          ` : anom.map((a, idx) => `
            <div class="pt-anom-item ${a.severity === 'AUSPICIOUS' ? 'auspicious' : ''}">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <strong>${idx + 1}. [${a.severity}] ${a.name}</strong>
              </div>
              <div style="font-size: 0.64rem; margin-bottom: 2px;"><strong>• Lòng đất:</strong> ${a.symptom}</div>
              <div style="font-size: 0.64rem; margin-bottom: 2px;"><strong>• Tác động con cháu:</strong> ${a.descendant_impact}</div>
              <div style="font-size: 0.64rem; color: #fef08a;"><strong>• Giải pháp:</strong> ${a.solution}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Card Phát Phúc 6 Chi Con Cháu -->
      <div class="pt-descendants-card">
        <div class="pt-p9-header">
          <div class="pt-p9-title">
            <span>👥 MÔ HÌNH LƯỢNG HÓA TÁC ĐỘNG ĐẾN 6 CHI CON CHÁU</span>
          </div>
        </div>
        <div class="pt-descendants-grid">
          ${Object.entries(desc).map(([bName, bInfo]) => {
            const isPhat = bInfo.status === 'PHÁT PHÚC TÀI QUAN';
            const isBatLoi = bInfo.status === 'BẤT LỢI CẦN HÓA GIẢI';
            const statClass = isPhat ? 'phat' : (isBatLoi ? 'batloi' : 'binh');
            return `
              <div class="pt-desc-cell">
                <div class="pt-desc-name">${bName.split('(')[0].trim()}</div>
                <div style="font-size: 0.58rem; color: #94a3b8;">${bInfo.palace} (${bInfo.wuxing})</div>
                <div class="pt-desc-stat ${statClass}">${bInfo.status}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
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
    const isPt = !!chart.isFengShui;
    let html = '';

    // Phân bổ 10 Thần (Nguyễn Tấn Công) nếu được chọn
    let chiefPalaceNum = 1;
    if (box) {
      box.forEach((row) => {
        row.forEach((palace) => {
          if (palace && palace.index !== 4 && translate(palace.getDivinity(true)).includes('Trực Phù')) {
            chiefPalaceNum = palace.index + 1;
          }
        });
      });
    }
    const roundVal = chart.round || 1;
    const tenDeityMap = (global.KetNoiVuTruEngine && currentDeitySchool === '10thần')
      ? global.KetNoiVuTruEngine.allocate10Deities(roundVal > 0 ? 'Dương Độn' : 'Âm Độn', chiefPalaceNum)
      : {};

    box.forEach((row) => {
      row.forEach((palace) => {
        const isCenter = palace.index === 4;
        const pIndex = palace.index; // 0-8
        const pNum = pIndex + 1; // 1-9
        const pData = (chart.palacesData && chart.palacesData[pNum]) ? chart.palacesData[pNum] : {};
        const door = translate(palace.getDoor(true));
        const stars = Array.isArray(palace.getStar(true)) ? palace.getStar(true).map(translate) : [translate(palace.getStar(true))];
        const rawDivinity = translate(palace.getDivinity(true));
        const divinity = (currentDeitySchool === '10thần' && tenDeityMap[pNum]) ? tenDeityMap[pNum] : rawDivinity;
        const hcs = Array.isArray(palace.getHCS(true)) ? palace.getHCS(true).map(translate) : [translate(palace.getHCS(true))];
        const ecs = Array.isArray(palace.getECS(true)) ? palace.getECS(true).map(translate) : [translate(palace.getECS(true))];
        const isVoid = palace.de;
        const isHorse = palace.hs;

        const palPatterns = patterns.filter(p => parseInt(p.palaceIndex) === pIndex);

        if (isCenter) {
          if (isPt) {
            html += `
              <div class="qmdj-palace-cell center-palace pt-palace-cell" data-palace-index="${pIndex}">
                <div class="center-content pt-center-content">
                  <div class="center-symbol">☯</div>
                  <div class="center-title">TRUNG CUNG (5)</div>
                  <div class="pt-flying-matrix pt-center-flying">
                    <span class="pt-star-mountain" title="Sơn Tinh (Tọa Tinh)">${pData.mountainStar !== undefined ? pData.mountainStar : ''}</span>
                    <span class="pt-star-van" title="Vận Tinh">${pData.vanStar !== undefined ? pData.vanStar : chart.van}</span>
                    <span class="pt-star-facing" title="Hướng Tinh">${pData.facingStar !== undefined ? pData.facingStar : ''}</span>
                  </div>
                  <div class="center-ecs-stems">Ký Cung 2 (Khôn): ${hcs.join(' ')}</div>
                </div>
              </div>
            `;
          } else {
            html += `
              <div class="qmdj-palace-cell center-palace" data-palace-index="${pIndex}">
                <div class="center-content">
                  <div class="center-symbol">☯</div>
                  <div class="center-title">TRUNG CUNG (5)</div>
                  <div class="center-time">${timeStr}</div>
                  <div class="center-ecs-stems">Thiên Cầm: ${hcs.join(' ')}</div>
                </div>
              </div>
            `;
          }
        } else {
          const palaceName = PALACE_NAMES[pIndex] || `Cung ${pIndex + 1}`;

          let isQuerentPalace = false;
          if (currentQuerentStem && currentQmdjMode !== 'banmenh') {
            if (currentQuerentStem === 'Giáp') {
              const GIAP_LEADER_MAP = {
                'Tý': 'Mậu', 'Tuất': 'Kỷ', 'Thân': 'Canh',
                'Ngọ': 'Tân', 'Thìn': 'Nhâm', 'Dần': 'Quý'
              };
              const qBranch = getQuerentStemChi(currentQuerentYear).branch;
              const mappedStem = GIAP_LEADER_MAP[qBranch] || 'Mậu';
              if (hcs.some(s => s && s.includes(mappedStem))) {
                isQuerentPalace = true;
              }
            } else {
              if (hcs.some(s => s && s.includes(currentQuerentStem))) {
                isQuerentPalace = true;
              }
            }
          }

          if (isPt) {
            const isFacing = pData.isFacing;
            const isDoor = pData.isDoor;
            const isTrucSu = pData.isTrucSu;

            const ptShortStar = String(stars[0] || '—').replace(/Thiên\s*/g, '');
            const ptShortDoor = String(door || '—').replace(/\s*Môn$/g, '');
            const cleanHcs = String(hcs[0] || '—').replace(/\s*\([^)]*\)/g, '').trim();
            const cleanEcs = String(ecs[0] || '—').replace(/\s*\([^)]*\)/g, '').trim();

            html += `
              <div class="qmdj-palace-cell pt-palace-cell ${isFacing ? 'pt-palace-facing' : ''} ${isDoor ? 'pt-palace-door' : ''} ${isQuerentPalace ? 'cell-highlight-querent' : ''}" data-palace-index="${pIndex}">
                <!-- Top Row: Thần, Sao & Số Cung -->
                <div class="p-top pt-cell-top">
                  <span class="p-divinity ${getCatClass(divinity)}">${divinity}</span>
                  <span class="pt-cell-star ${getCatClass(stars[0])}">${ptShortStar}</span>
                  <div class="p-top-right">
                    ${isQuerentPalace ? `<span class="qmdj-badge-querent-palace ${currentQuerentGender}" title="Cung Gia Chủ (${currentQuerentStem} ${currentQuerentGender === 'nam' ? 'Nam ♂' : 'Nữ ♀'})">👤 Gia Chủ</span>` : ''}
                    <span class="p-num">${pIndex + 1}</span>
                  </div>
                </div>

                <!-- Mid Row: Huyền Không Phi Tinh Matrix & Badges -->
                <div class="pt-flying-matrix">
                  <div class="pt-star-mountain" title="Sơn Tinh (Tọa Tinh)">${pData.mountainStar !== undefined ? pData.mountainStar : ''}</div>
                  <div class="pt-star-center-col">
                    ${isFacing ? '<span class="pt-badge pt-badge-facing">H.Nhà</span>' : ''}
                    ${isDoor ? '<span class="pt-badge pt-badge-door">Vị Cửa</span>' : ''}
                    <span class="pt-star-van" title="Vận Tinh">${pData.vanStar !== undefined ? pData.vanStar : ''}</span>
                  </div>
                  <div class="pt-star-facing" title="Hướng Tinh">${pData.facingStar !== undefined ? pData.facingStar : ''}</div>
                </div>

                <!-- Bottom Row: Cửa, Trực Sử, Tên Cung & Can Thiên/Địa -->
                <div class="p-bot pt-cell-bot">
                  <div class="p-bot-left">
                    <span class="p-door ${getCatClass(door)}">${ptShortDoor}</span>
                    ${isTrucSu ? '<span class="pt-badge pt-badge-trucsu">Trực Sử</span>' : ''}
                  </div>
                  <div class="pt-cell-stems">
                    <span class="p-hcs ${getCatClass(cleanHcs)}">${cleanHcs}</span>
                    <span class="p-stems-slash">/</span>
                    <span class="p-ecs-stem ${getCatClass(cleanEcs)}">${cleanEcs}</span>
                  </div>
                </div>
              </div>
            `;
          } else {
            let modeBadgeTop = '';
            let modeBadgesSub = '';
            let cellHighlightClass = '';

            if (currentQmdjMode === 'thien') {
              const THIEN_DEITIES = {
                'Trực Phù': '👑 TỌA LƯNG',
                'Thái Âm': '🌙 TỌA LƯNG',
                'Cửu Địa': '🌍 TỌA LƯNG',
                'Cửu Thiên': '⚡ TỌA LƯNG',
                'Lục Hợp': '🤝 TỌA LƯNG'
              };
              if (THIEN_DEITIES[divinity]) {
                modeBadgeTop = `<span class="qmdj-badge-thien">${THIEN_DEITIES[divinity]}</span>`;
                cellHighlightClass = 'cell-highlight-thien';
              }
            } else if (currentQmdjMode === 'banmenh' && chart.destinyRoles && chart.destinyRoles[pNum]) {
              const roles = chart.destinyRoles[pNum];
              if (roles && roles.length > 0) {
                modeBadgesSub = `
                  <div class="qmdj-cell-destiny-badges">
                    ${roles.map(r => `<span class="qmdj-destiny-badge ${r.class}">${r.text}</span>`).join('')}
                  </div>
                `;
                if (roles.some(r => r.class === 'badge-life')) {
                  cellHighlightClass = 'cell-highlight-banmenh';
                }
              }
            }

            if (isQuerentPalace) {
              modeBadgeTop += `<span class="qmdj-badge-querent-palace ${currentQuerentGender}" title="Cung Bản Mệnh (${currentQuerentStem} ${currentQuerentGender === 'nam' ? 'Nam ♂' : 'Nữ ♀'})">👤 Mệnh</span>`;
              if (!cellHighlightClass) cellHighlightClass = 'cell-highlight-querent';
            }

            html += `
              <div class="qmdj-palace-cell ${cellHighlightClass}" data-palace-index="${pIndex}">
                <!-- Top Row: Thần & Số Cung -->
                <div class="p-top">
                  <span class="p-divinity ${getCatClass(divinity)}">${divinity}</span>
                  <div class="p-top-right">
                    ${modeBadgeTop}
                    ${isVoid ? '<span class="p-void-mark" title="Tuần Không">〇</span>' : ''}
                    <span class="p-num">${pIndex + 1}</span>
                  </div>
                </div>

                ${modeBadgesSub}

                <!-- Mid Row: Cửa & Sao (trái), Can Thiên Bàn (phải) -->
                <div class="p-mid">
                  <div class="p-door-star">
                    <div class="p-door ${getCatClass(door)}">${door}</div>
                    <div class="p-stars">
                      ${stars.map(s => `<span class="${getCatClass(s)}">${s}</span>`).join(' ')}
                    </div>
                  </div>
                  <div class="p-stems-right">
                    ${hcs.map(stem => {
                      const isDouble = String(stem).length > 2 || String(stem).includes('/');
                      return `<span class="p-hcs ${isDouble ? 'p-hcs-double' : ''} ${getCatClass(stem)}">${stem}</span>`;
                    }).join('')}
                  </div>
                </div>

                <!-- Bottom Row: Tên Cung & Can Địa Bàn -->
                <div class="p-bot">
                  <div class="p-bot-left">
                    <span class="p-cung-name">${palaceName}</span>
                    ${isHorse ? '<span class="p-horse" title="Mã Tinh">🐎</span>' : ''}
                  </div>
                  <div class="p-ecs">
                    ${ecs.map(stem => {
                      const isDouble = String(stem).length > 2 || String(stem).includes('/');
                      return `<span class="p-ecs-stem ${isDouble ? 'p-ecs-stem-double' : ''} ${getCatClass(stem)}">${stem}</span>`;
                    }).join(' ')}
                  </div>
                </div>

                ${palPatterns.length > 0 ? `
                  <div class="p-indicator-dot ${palPatterns.some(p => p.type === 'cat') ? 'dot-cat' : 'dot-hung'}"></div>
                ` : ''}
              </div>
            `;
          }
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
    bindQuerentRowEvents();
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

    // Sự kiện chuyển đổi trường phái Thần & Định Cục (dùng chung & lưu nhớ)
    bindSchoolStripEvents();

    // Sự kiện chọn lĩnh vực Chiêm Đoán Vạn Sự
    document.getElementById('qmdj-select-omni-domain')?.addEventListener('change', (e) => {
      currentInquiryDomain = e.target.value;
      renderQmdj(true);
    });

    // Sự kiện chuyển đổi chế độ Dụng Thần Người Hỏi (Can Giờ vs Can Năm Sinh)
    document.querySelectorAll('.btn-omni-qmode').forEach(btn => {
      btn.addEventListener('click', () => {
        const qm = btn.getAttribute('data-qmode');
        if (qm) {
          currentQuerentMode = qm;
          renderQmdj(true);
        }
      });
    });

    // Sự kiện thay đổi năm sinh người hỏi (tự động cập nhật Can)
    document.getElementById('omni-select-birth-year')?.addEventListener('change', (e) => {
      currentQuerentYear = parseInt(e.target.value, 10);
      if (global.KetNoiVuTruEngine && global.KetNoiVuTruEngine.getStemChiFromYear) {
        currentQuerentStem = global.KetNoiVuTruEngine.getStemChiFromYear(currentQuerentYear).stem;
      }
      renderQmdj(true);
    });

    // Sự kiện chọn trực tiếp Can năm sinh người hỏi
    document.getElementById('omni-select-birth-stem')?.addEventListener('change', (e) => {
      currentQuerentStem = e.target.value;
      renderQmdj();
    });

    bindTimeCellClickEvents(chart, patterns);
  }

  function bindPhongThuyEvents(chart) {
    bindQuerentRowEvents();
    bindSchoolStripEvents();

    // 1. Chuyển đổi Sub-Mode: Dương Trạch vs Âm Trạch
    const btnSubmodeDuong = document.getElementById('btn-pt-submode-duong');
    const btnSubmodeAm = document.getElementById('btn-pt-submode-am');
    if (btnSubmodeDuong) {
      btnSubmodeDuong.onclick = () => {
        ptState.subMode = 'duong_trach';
        renderQmdj();
      };
    }
    if (btnSubmodeAm) {
      btnSubmodeAm.onclick = () => {
        ptState.subMode = 'am_trach';
        renderQmdj();
      };
    }

    // 2. Tham số chung Dương Trạch & Âm Trạch
    const selVan = document.getElementById('pt-select-van');
    const selHuong = document.getElementById('pt-select-huong');
    const selCua = document.getElementById('pt-select-cua');
    const inputDeg = document.getElementById('pt-input-deg');
    const btnSubmit = document.getElementById('btn-pt-submit');
    const btnSyncLk = document.getElementById('btn-pt-sync-lakinh');
    const btnOpenLk = document.getElementById('btn-pt-open-lakinh');

    // Âm Trạch inputs
    const selDeceasedCan = document.getElementById('pt-select-deceased-can');
    const selGravePalace = document.getElementById('pt-select-grave-palace');

    if (selDeceasedCan) {
      selDeceasedCan.addEventListener('change', (e) => {
        ptState.deceasedCan = e.target.value || 'Ất';
        renderQmdj();
      });
    }
    if (selGravePalace) {
      selGravePalace.addEventListener('change', (e) => {
        ptState.gravePalaceId = parseInt(e.target.value) || 2;
        renderQmdj();
      });
    }

    // Sự kiện thay đổi Hướng Nhà 16 Hướng
    if (selHuong) {
      selHuong.addEventListener('change', () => {
        ptState.huongKey = selHuong.value || 'TB1';
        const hObj = HUONG_16_LIST.find(h => h.key === ptState.huongKey);
        if (hObj) {
          ptState.huongPalace = hObj.palace;
          ptState.degree = hObj.deg;
        }
        renderQmdj();
      });
    }

    // Sự kiện nhập tay độ số hướng nhà thực tế
    if (inputDeg) {
      inputDeg.addEventListener('change', (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
          setPhongThuyDegree(val);
        }
      });
    }

    if (btnSubmit) {
      btnSubmit.onclick = () => {
        if (selVan) ptState.van = parseInt(selVan.value) || 9;
        if (selHuong) {
          ptState.huongKey = selHuong.value || 'TB1';
          const hObj = HUONG_16_LIST.find(h => h.key === ptState.huongKey);
          if (hObj) {
            ptState.huongPalace = hObj.palace;
            if (ptState.degree === undefined || isNaN(ptState.degree)) {
              ptState.degree = hObj.deg;
            }
          }
        }
        if (selCua) ptState.sonCua = selCua.value || 'Thìn';
        renderQmdj();
      };
    }

    // Sự kiện Cầu Nối Đồng Bộ từ La Kinh Thực Địa
    if (btnSyncLk) {
      btnSyncLk.onclick = () => {
        if (global.NetaLaKinhView && typeof global.NetaLaKinhView.getState === 'function') {
          const lkState = global.NetaLaKinhView.getState();
          if (lkState) {
            const rot = ((lkState.rotation % 360) + 360) % 360;
            ptState.degree = Math.round(rot * 10) / 10;
            
            // Tìm 16 hướng gần nhất theo góc đo thực địa
            let bestH = HUONG_16_LIST[0];
            let minDiff = 999;
            HUONG_16_LIST.forEach(h => {
              let diff = Math.abs(h.deg - ptState.degree);
              if (diff > 180) diff = 360 - diff;
              if (diff < minDiff) {
                minDiff = diff;
                bestH = h;
              }
            });
            ptState.huongKey = bestH.key;
            ptState.huongPalace = bestH.palace;

            // Đồng bộ 24 Sơn Cửa
            if (global.KetNoiVuTruEngine) {
              const m = global.KetNoiVuTruEngine.degreeToMountain(ptState.degree);
              ptState.sonCua = m.name;
            }

            renderQmdj();
            showQmdjToast(`🎯 Đã đồng bộ tọa độ ${ptState.degree.toFixed(1)}° (${ptState.sonCua} Sơn - ${bestH.name}) từ La Kinh!`);
          }
        } else {
          showQmdjToast('Không tìm thấy dữ liệu La Kinh');
        }
      };
    }

    // Sự kiện mở La Kinh thực địa để ngắm hướng
    if (btnOpenLk) {
      btnOpenLk.onclick = () => {
        if (typeof window.switchAppMode === 'function') {
          window.switchAppMode('lakinh');
          showQmdjToast('🧭 Đã mở La Kinh thực địa để ngắm hướng');
        }
      };
    }

    // Sự kiện thay đổi vị trí 6 Phòng Ốc
    const roomsMap = [
      { id: 'pt-select-room-door',    key: 'main_door' },
      { id: 'pt-select-room-kitchen', key: 'kitchen' },
      { id: 'pt-select-room-toilet',  key: 'toilet' },
      { id: 'pt-select-room-bedroom', key: 'bedroom' },
      { id: 'pt-select-room-living',  key: 'living_room' },
      { id: 'pt-select-room-altar',   key: 'altar' }
    ];
    roomsMap.forEach(r => {
      document.getElementById(r.id)?.addEventListener('change', (e) => {
        ptState.rooms[r.key] = parseInt(e.target.value) || 1;
        renderQmdj();
      });
    });

    // 3. Sự kiện 5 Nút Action Bar
    const btnOpenEssay = document.getElementById('btn-pt-open-essay');
    const btnOpenTrachCat = document.getElementById('btn-pt-open-trachcat');
    const btnDownloadEssay = document.getElementById('btn-pt-download-essay');
    const btnAiPolish = document.getElementById('btn-pt-ai-polish');
    const btnCopyEssay = document.getElementById('btn-pt-copy-essay');

    if (btnOpenEssay) {
      btnOpenEssay.onclick = () => {
        ptState.isEssayModalOpen = true;
        renderQmdj();
      };
    }

    if (btnOpenTrachCat) {
      btnOpenTrachCat.onclick = () => {
        ptState.isTrachCatModalOpen = true;
        renderQmdj();
      };
    }

    if (btnDownloadEssay) {
      btnDownloadEssay.onclick = () => {
        downloadPtEssay(chart);
      };
    }

    if (btnCopyEssay) {
      btnCopyEssay.onclick = () => {
        copyPtEssay(chart);
      };
    }

    if (btnAiPolish) {
      btnAiPolish.onclick = () => {
        triggerPtAiPolish(chart);
      };
    }

    // Modal Close Events
    document.getElementById('qmdj-fs-essay-modal-close')?.addEventListener('click', () => {
      ptState.isEssayModalOpen = false;
      renderQmdj();
    });
    document.getElementById('btn-pt-modal-close-footer')?.addEventListener('click', () => {
      ptState.isEssayModalOpen = false;
      renderQmdj();
    });
    document.getElementById('btn-pt-modal-copy')?.addEventListener('click', () => {
      const ta = document.getElementById('qmdj-fs-essay-textarea');
      if (ta && ta.value) {
        navigator.clipboard.writeText(ta.value).then(() => {
          showQmdjToast("📋 Đã sao chép toàn văn báo cáo vào Clipboard!");
        }).catch(() => {
          showQmdjToast("Không thể sao chép tự động");
        });
      }
    });
    document.getElementById('btn-pt-modal-download')?.addEventListener('click', () => {
      downloadPtEssay(chart);
    });

    document.getElementById('qmdj-fs-trachcat-modal-close')?.addEventListener('click', () => {
      ptState.isTrachCatModalOpen = false;
      renderQmdj();
    });
    document.getElementById('btn-pt-trachcat-close-footer')?.addEventListener('click', () => {
      ptState.isTrachCatModalOpen = false;
      renderQmdj();
    });

    // 4. Sự kiện Tải Lịch Nhắc Hẹn Thủy Pháp (.ics)
    const btnWaterIcs = document.getElementById('btn-pt-download-water-ics');
    if (btnWaterIcs) {
      btnWaterIcs.onclick = () => {
        downloadWaterDragonIcs(chart);
      };
    }

    // 5. Sự kiện Chuyển Đổi Thái Cực Kép (Macro vs Micro)
    const btnTcMacro = document.getElementById('btn-pt-tc-macro');
    const btnTcMicro = document.getElementById('btn-pt-tc-micro');
    if (btnTcMacro) {
      btnTcMacro.onclick = () => {
        ptState.thaiCucMode = 'macro';
        renderQmdj();
      };
    }
    if (btnTcMicro) {
      btnTcMicro.onclick = () => {
        ptState.thaiCucMode = 'micro';
        renderQmdj();
      };
    }

    // Sự kiện dropdown Tiểu Thái Cực
    document.getElementById('pt-micro-room-type')?.addEventListener('change', (e) => {
      ptState.microRoom.type = e.target.value;
      renderQmdj();
    });
    document.getElementById('pt-micro-desk-palace')?.addEventListener('change', (e) => {
      ptState.microRoom.deskPalace = parseInt(e.target.value, 10) || 3;
      renderQmdj();
    });
    document.getElementById('pt-micro-sitting-palace')?.addEventListener('change', (e) => {
      ptState.microRoom.sittingPalace = parseInt(e.target.value, 10) || 8;
      renderQmdj();
    });

    // 6. Sự kiện Mặt Bằng Kiến Trúc & Phủ Lưới Cửu Cung Canvas
    const fpFileInput = document.getElementById('pt-fp-file-input');
    const btnFpSample = document.getElementById('btn-pt-fp-sample');
    const btnFpSave = document.getElementById('btn-pt-fp-save');
    const fpOpacity = document.getElementById('pt-fp-opacity');
    const fpZoom = document.getElementById('pt-fp-zoom');

    if (fpFileInput) {
      fpFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            ptState.floorPlan.imageDataUrl = event.target.result;
            drawFloorPlanCanvas(chart, ptState.degree || 300.0);
            showQmdjToast("📷 Đã tải sơ đồ mặt bằng kiến trúc thành công!");
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (btnFpSample) {
      btnFpSample.onclick = () => {
        ptState.floorPlan.imageDataUrl = null;
        drawFloorPlanCanvas(chart, ptState.degree || 300.0);
        showQmdjToast("🏠 Đã khôi phục sơ đồ mặt bằng kiến trúc mẫu!");
      };
    }

    if (btnFpSave) {
      btnFpSave.onclick = () => {
        const canvas = document.getElementById('pt-floorplan-canvas');
        if (canvas) {
          const link = document.createElement('a');
          link.download = `Mat_Bang_Ky_Mon_Cuu_Cung_${Math.round(ptState.degree || 300)}deg.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          showQmdjToast("💾 Đã lưu ảnh mặt bằng phủ lưới Kỳ Môn!");
        }
      };
    }

    if (fpOpacity) {
      fpOpacity.addEventListener('input', (e) => {
        ptState.floorPlan.opacity = parseFloat(e.target.value) || 0.35;
        drawFloorPlanCanvas(chart, ptState.degree || 300.0);
      });
    }

    if (fpZoom) {
      fpZoom.addEventListener('input', (e) => {
        ptState.floorPlan.zoom = parseFloat(e.target.value) || 1.0;
        drawFloorPlanCanvas(chart, ptState.degree || 300.0);
      });
    }

    // Tự động vẽ canvas nếu đang ở tab Dương Trạch
    if (ptState.subMode === 'duong_trach') {
      setTimeout(() => {
        drawFloorPlanCanvas(chart, ptState.degree || 300.0);
      }, 50);
    }

    bindTimeCellClickEvents(chart, []);
  }

  /**
   * Tải tệp lịch nhắc hẹn mở nước (.ics) chuẩn RFC 5545
   */
  function downloadWaterDragonIcs(chart) {
    const fsEngine = global.NetaQmdjFengShuiEngine;
    if (!fsEngine) return;
    const fullAudit = getPtAuditData(chart);
    const wa = fullAudit && fullAudit.qi_men_water_activation ? fullAudit.qi_men_water_activation : {};
    const bestWater = wa.best_water_location;
    const proto = wa.activation_protocol;

    if (!bestWater) {
      showQmdjToast("⚠️ Chưa xác định được vị trí Thủy Pháp");
      return;
    }

    const icsContent = fsEngine.generateWaterDragonIcsContent(bestWater, proto);
    if (!icsContent) return;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Thuy_Phap_Ky_Mon_${bestWater.door.replace(/\s+/g, '_')}.ics`;
    link.click();
    showQmdjToast("📅 Đã tải tệp nhắc lịch Thủy Pháp (.ics) thành công!");
  }

  /**
   * Vẽ bản vẽ sơ đồ mặt bằng kiến trúc mẫu (2D CAD Architectural Blueprint)
   */
  function drawArchitecturalBlueprintSample(ctx, w, h) {
    const isLight = document.body.classList.contains('theme-light');
    ctx.fillStyle = isLight ? "#f8fafc" : "#0b1120";
    ctx.fillRect(0, 0, w, h);

    // Lưới CAD nền
    ctx.strokeStyle = isLight ? "rgba(203, 213, 225, 0.4)" : "rgba(30, 41, 59, 0.6)";
    ctx.lineWidth = 1;
    const gridSize = 20;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Tường bao ngoài (Outer Walls)
    const padX = 40, padY = 30;
    const houseW = w - padX * 2;
    const houseH = h - padY * 2;

    ctx.strokeStyle = isLight ? "#334155" : "#94a3b8";
    ctx.lineWidth = 4;
    ctx.strokeRect(padX, padY, houseW, houseH);

    // Vách ngăn bên trong
    ctx.lineWidth = 2;
    const midX = padX + houseW * 0.45;
    const midY = padY + houseH * 0.55;

    ctx.beginPath();
    ctx.moveTo(midX, padY);
    ctx.lineTo(midX, padY + houseH);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(padX, midY);
    ctx.lineTo(midX, midY);
    ctx.stroke();

    const midYRight = padY + houseH * 0.4;
    ctx.beginPath();
    ctx.moveTo(midX, midYRight);
    ctx.lineTo(padX + houseW, midYRight);
    ctx.stroke();

    const wcX = padX + (midX - padX) * 0.5;
    ctx.beginPath();
    ctx.moveTo(wcX, midY);
    ctx.lineTo(wcX, padY + houseH);
    ctx.stroke();

    // Nhãn phòng chức năng
    ctx.fillStyle = isLight ? "#0f172a" : "#cbd5e1";
    ctx.font = "bold 11px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText("🛏️ PHÒNG NGỦ", padX + (midX - padX) / 2, padY + (midY - padY) / 2);
    ctx.fillText("🍳 BẾP", padX + (wcX - padX) / 2, midY + (padY + houseH - midY) / 2);
    ctx.fillText("🚽 WC", wcX + (midX - wcX) / 2, midY + (padY + houseH - midY) / 2);
    ctx.fillText("🛋️ PHÒNG KHÁCH", midX + (houseW - (midX - padX)) / 2, midYRight + (padY + houseH - midYRight) / 2);
    ctx.fillText("🕯️ BAN THỜ / HỌC", midX + (houseW - (midX - padX)) / 2, padY + (midYRight - padY) / 2);

    // Cửa chính
    const doorX = midX + 30;
    const doorY = padY + houseH;
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(doorX, doorY, 24, Math.PI, 1.5 * Math.PI, false);
    ctx.stroke();
    ctx.fillStyle = "#f59e0b";
    ctx.font = "bold 10px Segoe UI, sans-serif";
    ctx.fillText("🚪 CỬA CHÍNH", doorX + 16, doorY - 8);
  }

  /**
   * Vẽ lớp lưới Cửu Cung Kỳ Môn bán trong suốt xoay theo La Kinh
   */
  function renderOverlayGrid(ctx, w, h, chart, degree) {
    const cx = w / 2;
    const cy = h / 2;
    const zoom = ptState.floorPlan.zoom || 1.0;
    const opacity = ptState.floorPlan.opacity || 0.35;

    ctx.save();
    ctx.translate(cx, cy);

    // Xoay theo độ số hướng nhà
    const rotRad = (degree % 360) * Math.PI / 180;
    ctx.rotate(rotRad);
    ctx.scale(zoom, zoom);

    const gridW = 340;
    const gridH = 260;
    const cellW = gridW / 3;
    const cellH = gridH / 3;
    const startX = -gridW / 2;
    const startY = -gridH / 2;

    const matrix = [
      [4, 9, 2],
      [3, 5, 7],
      [8, 1, 6]
    ];

    const pData = chart.palacesData || {};

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const pid = matrix[r][c];
        const pInfo = pData[pid] || {};
        const door = pInfo.door || "";
        const star = pInfo.star || "";
        const deity = pInfo.deity || pInfo.divinity || "";
        const x = startX + c * cellW;
        const y = startY + r * cellH;

        let fillCol = `rgba(245, 158, 11, ${opacity * 0.5})`;
        if (["Sinh Môn", "Khai Môn", "Hưu Môn"].includes(door)) {
          fillCol = `rgba(34, 197, 94, ${opacity})`;
        } else if (["Tử Môn", "Kinh Môn", "Thương Môn"].includes(door)) {
          fillCol = `rgba(239, 68, 68, ${opacity})`;
        }

        ctx.fillStyle = fillCol;
        ctx.fillRect(x, y, cellW, cellH);

        ctx.strokeStyle = "rgba(245, 176, 65, 0.85)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, cellW, cellH);

        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 4;
        ctx.font = "bold 10px Segoe UI, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(`Cung ${pid} • ${door}`, x + 5, y + 5);

        ctx.font = "8.5px Segoe UI, sans-serif";
        ctx.fillStyle = "#fef08a";
        ctx.fillText(`${star} | ${deity}`, x + 5, y + 19);

        if (pInfo.is_sky_horse) {
          ctx.fillStyle = "#38bdf8";
          ctx.fillText("🐎", x + cellW - 22, y + cellH - 14);
        }
        if (pInfo.is_kong_wang || pInfo.de) {
          ctx.fillStyle = "#f87171";
          ctx.fillText("⭕", x + 5, y + cellH - 14);
        }
      }
    }

    ctx.strokeStyle = "#eab308";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Điều khiển Canvas vẽ mặt bằng + lưới Kỳ Môn
   */
  function drawFloorPlanCanvas(chart, degree) {
    const canvas = document.getElementById('pt-floorplan-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (ptState.floorPlan.imageDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.save();
        ctx.drawImage(img, 0, 0, w, h);
        renderOverlayGrid(ctx, w, h, chart, degree);
        ctx.restore();
      };
      img.src = ptState.floorPlan.imageDataUrl;
    } else {
      drawArchitecturalBlueprintSample(ctx, w, h);
      renderOverlayGrid(ctx, w, h, chart, degree);
    }
  }

  function getPtAuditData(chart) {
    const fsEngine = global.NetaQmdjFengShuiEngine;
    if (!fsEngine) return null;
    return fsEngine.runComprehensiveFengShuiAudit({
      mode: ptState.subMode,
      house_degree: ptState.degree || 300.0,
      room_allocations: ptState.rooms,
      owner_birth_can: currentQuerentStem || 'Bính',
      deceased_birth_can: ptState.deceasedCan || 'Ất',
      grave_palace_id: ptState.gravePalaceId || 2,
      chart_palaces: chart.palacesData || {},
      kong_wang_palaces: []
    });
  }

  function populatePtEssayModalBody(chart, fullAudit) {
    const ta = document.getElementById('qmdj-fs-essay-textarea');
    if (!ta) return;
    if (ptState.essayCustomText) {
      ta.value = ptState.essayCustomText;
      return;
    }
    const audit = fullAudit || getPtAuditData(chart);
    const fsEngine = global.NetaQmdjFengShuiEngine;
    if (fsEngine && audit) {
      ta.value = fsEngine.generateQmdjFengShuiEssay(audit, ptState.subMode);
    } else {
      ta.value = "Chưa có dữ liệu bài luận.";
    }
  }

  function populatePtTrachCatModalBody(chart) {
    const body = document.getElementById('qmdj-fs-trachcat-body');
    if (!body) return;

    const fsEngine = global.NetaQmdjFengShuiEngine;
    if (!fsEngine || typeof fsEngine.evaluateFengShuiTiming !== 'function') {
      body.innerHTML = "<div>Chưa tải được động cơ Trạch Cát.</div>";
      return;
    }

    const currentType = ptState.currentTrachCatType || (ptState.subMode === 'duong_trach' ? 'dong_tho' : 'ha_huyet');
    const trachCatRes = fsEngine.evaluateFengShuiTiming(currentType);

    const isDuong = ptState.subMode === 'duong_trach';
    const typeOptions = isDuong ? [
      { id: 'dong_tho', name: 'Động Thổ Khởi Công' },
      { id: 'cat_noc', name: 'Cất Nóc Đổ Mái' },
      { id: 'nhap_trach', name: 'Nhập Trạch Dọn Nhà' },
      { id: 'thuy_phap', name: 'Mở Nước Kích Hoạt Tài Lộc (Water Dragon)' },
      { id: 'khai_truong', name: 'Khai Trương Cửa Hàng' }
    ] : [
      { id: 'ha_huyet', name: 'Hạ Huyệt An Táng' },
      { id: 'cai_tang', name: 'Cải Táng Bốc Mộ' }
    ];

    body.innerHTML = `
      <div style="margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
        <span style="font-weight: 700; font-size: 0.72rem; color: #fef08a;">Mục đích trạch cát:</span>
        <select id="pt-select-trachcat-action" class="pt-select" style="flex: 1;">
          ${typeOptions.map(opt => `<option value="${opt.id}" ${currentType === opt.id ? 'selected' : ''}>${opt.name}</option>`).join('')}
        </select>
      </div>

      <div style="font-weight: 800; font-size: 0.72rem; color: #4ade80; margin-bottom: 6px;">
        ⭐ Khung Giờ Cát Tường Nhất Trong Ngày:
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 6px;">
        ${trachCatRes.best_hours.map(h => `
          <div style="background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.35); border-radius: 6px; padding: 6px 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; font-weight: 800; color: #86efac; font-size: 0.70rem;">
              <span>Giờ ${h.branch} (${h.hour_range})</span>
              <span>${h.score}đ - ${h.quality}</span>
            </div>
            <div style="font-size: 0.62rem; color: #cbd5e1; margin-top: 3px;">
              ${h.reasons.join('; ')}
            </div>
          </div>
        `).join('')}
      </div>

      <div style="font-weight: 800; font-size: 0.72rem; color: #94a3b8; margin: 10px 0 6px 0;">
        📋 Toàn Bộ 12 Thời Thần Trong Ngày:
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 4px;">
        ${trachCatRes.all_hours.map(h => `
          <div style="background: rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 4px; padding: 4px 6px; font-size: 0.62rem;">
            <div style="display: flex; justify-content: space-between;">
              <span style="font-weight: 700; color: #f1f5f9;">${h.branch} (${h.hour_range})</span>
              <span style="font-weight: 700; color: ${h.score >= 70 ? '#4ade80' : (h.score >= 50 ? '#fde047' : '#f87171')};">${h.quality}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    document.getElementById('pt-select-trachcat-action')?.addEventListener('change', (e) => {
      ptState.currentTrachCatType = e.target.value;
      populatePtTrachCatModalBody(chart);
    });
  }

  function downloadPtEssay(chart) {
    const audit = getPtAuditData(chart);
    const fsEngine = global.NetaQmdjFengShuiEngine;
    if (!fsEngine || !audit) return;
    const text = ptState.essayCustomText || fsEngine.generateQmdjFengShuiEssay(audit, ptState.subMode);
    const filename = `KyMon_PhongThuy_${ptState.subMode}_${new Date().toISOString().slice(0, 10)}.md`;

    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showQmdjToast(`💾 Đã tải xuống ${filename}`);
  }

  function copyPtEssay(chart) {
    const audit = getPtAuditData(chart);
    const fsEngine = global.NetaQmdjFengShuiEngine;
    if (!fsEngine || !audit) return;
    const text = ptState.essayCustomText || fsEngine.generateQmdjFengShuiEssay(audit, ptState.subMode);

    navigator.clipboard.writeText(text).then(() => {
      showQmdjToast("📋 Đã sao chép toàn văn báo cáo vào Clipboard!");
    }).catch(() => {
      showQmdjToast("Không thể sao chép tự động");
    });
  }

  async function triggerPtAiPolish(chart) {
    const audit = getPtAuditData(chart);
    const fsEngine = global.NetaQmdjFengShuiEngine;
    if (!fsEngine || !audit) return;

    const baseText = ptState.essayCustomText || fsEngine.generateQmdjFengShuiEssay(audit, ptState.subMode);
    ptState.isAiPolishing = true;
    renderQmdj();
    showQmdjToast("✨ Đang kích hoạt trợ lý AI hiệu đính chuyên sâu...");

    const gemini = (typeof window !== 'undefined' && window.NetaGeminiService) || global.NetaGeminiService;
    if (gemini && typeof gemini.polishEssay === 'function') {
      try {
        const res = await gemini.polishEssay(baseText, "Phong Thủy Kỳ Môn Độn Giáp Toàn Diện");
        if (res && res.text) {
          ptState.essayCustomText = res.text;
          showQmdjToast("🎉 Đã hoàn tất biên tập AI chất lượng cao!");
        }
      } catch (err) {
        console.error("AI polish error:", err);
        showQmdjToast("Biên tập AI tạm gián đoạn, sử dụng bản gốc chuẩn.");
      }
    } else {
      setTimeout(() => {
        showQmdjToast("Bản gốc đã được chuẩn hóa theo chuẩn mực học thuật quốc tế!");
      }, 600);
    }
    ptState.isAiPolishing = false;
    renderQmdj();
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
    let divinity = translate(palace.getDivinity(true));
    const hcs = Array.isArray(palace.getHCS(true)) ? palace.getHCS(true).map(translate) : [translate(palace.getHCS(true))];
    const ecs = Array.isArray(palace.getECS(true)) ? palace.getECS(true).map(translate) : [translate(palace.getECS(true))];

    if (currentDeitySchool === '10thần' && pIndex !== 4) {
      let chiefPalaceNum = 1;
      if (chart && chart.box) {
        chart.box.forEach((row) => {
          row.forEach((p) => {
            if (p && p.index !== 4 && translate(p.getDivinity(true)).includes('Trực Phù')) {
              chiefPalaceNum = p.index + 1;
            }
          });
        });
      }
      const roundVal = chart.round || 1;
      const tenDeityMap = (global.KetNoiVuTruEngine && typeof global.KetNoiVuTruEngine.allocate10Deities === 'function')
        ? global.KetNoiVuTruEngine.allocate10Deities(roundVal > 0 ? 'Dương Độn' : 'Âm Độn', chiefPalaceNum)
        : {};
      if (tenDeityMap[pIndex + 1]) {
        divinity = tenDeityMap[pIndex + 1];
      }
    }

    const deityLabel = currentDeitySchool === '10thần' ? 'Thần (10 Thần)' : 'Bát Thần';

    if (chart.isFengShui) {
      // Feng Shui detail
      const pNum = pIndex + 1;
      const pData = (chart.palacesData && chart.palacesData[pNum]) ? chart.palacesData[pNum] : {};
      const isHuong = pNum === chart.huongPalace;
      const isCua = pNum === chart.cuaPalace;
      const isTrucSu = pNum === chart.trucSuPalace;

      bodyEl.innerHTML = `
        <div class="palace-modal-content">
          <div class="pm-badges-row">
            <div class="pm-badge"><strong>${deityLabel}:</strong> ${divinity || 'Trực Phù'}</div>
            <div class="pm-badge"><strong>Cửu Tinh:</strong> ${stars.join(', ')}</div>
            <div class="pm-badge"><strong>Bát Môn:</strong> ${door}</div>
          </div>

          <div class="pm-stems-box">
            <div><small>Huyền Không Phi Tinh:</small> <strong>Sơn Tinh: ${pData.mountainStar !== undefined ? pData.mountainStar : '-'}</strong> • <strong>Hướng Tinh: ${pData.facingStar !== undefined ? pData.facingStar : '-'}</strong> • <strong>Vận Tinh: ${pData.vanStar !== undefined ? pData.vanStar : chart.van}</strong></div>
            <div><small>Thiên Can Thiên Bàn (A1):</small> <strong>${hcs.join(' ')}</strong></div>
            <div><small>Thiên Can Địa Bàn (A2):</small> <strong>${ecs.join(' ')}</strong></div>
            <div><small>Vị trí trong nhà:</small> <strong>${PALACE_DIRECTIONS[pNum]}</strong> ${isHuong ? '<span class="text-cat">(HƯỚNG NHÀ ★)</span>' : ''} ${isCua ? '<span class="text-cat">(VỊ CỬA 🚪)</span>' : ''} ${isTrucSu ? '<span class="text-cat">(CUNG TRỰC SỬ 🔑)</span>' : ''}</div>
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
            <div class="pm-badge"><strong>${deityLabel}:</strong> ${divinity}</div>
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
          <div style="margin-top: 12px; display: flex; justify-content: center;">
            <button type="button" class="btn-qmdj-open-lakinh btn-modal-lk" id="btn-modal-open-lakinh" data-deg="${PALACE_TO_DEGREE[pIndex + 1] !== undefined ? PALACE_TO_DEGREE[pIndex + 1] : 0}">
              🧭 Mở La Kinh Hướng Cung ${palaceName} (${PALACE_DIRECTIONS[pIndex + 1]} • ${PALACE_TO_DEGREE[pIndex + 1] !== undefined ? PALACE_TO_DEGREE[pIndex + 1] : 0}°)
            </button>
          </div>
        </div>
      `;
    }

    modal.style.display = 'flex';

    const btnModalLk = document.getElementById('btn-modal-open-lakinh');
    if (btnModalLk) {
      btnModalLk.onclick = () => {
        modal.style.display = 'none';
        const targetDeg = parseFloat(btnModalLk.getAttribute('data-deg')) || 0;
        if (global.NetaLaKinhView) {
          const lkState = global.NetaLaKinhView.getState();
          if (lkState) {
            lkState.isQmdjStratActive = true;
            lkState.qmdjStratGoal = currentChienLuocGoal;
            lkState.qmdjStratDate = new Date(currentQmdjDate);
            if (typeof global.NetaLaKinhView.updateQmdjStrategicLayer === 'function') {
              global.NetaLaKinhView.updateQmdjStrategicLayer();
            }
          }
          if (typeof global.NetaLaKinhView.updateRotation === 'function') {
            global.NetaLaKinhView.updateRotation(targetDeg);
          }
        }
        if (typeof window.switchAppMode === 'function') {
          window.switchAppMode('lakinh');
        } else {
          const tab = document.getElementById('tab-mode-lakinh');
          if (tab) tab.click();
        }
        if (typeof showQmdjToast === 'function') {
          showQmdjToast(`🧭 Đã mở La Kinh ngắm hướng Cung ${palaceName} (${targetDeg}°)!`);
        }
      };
    }
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

  function setPhongThuyDegree(deg) {
    if (typeof deg === 'number') {
      const normDeg = ((deg % 360) + 360) % 360;
      ptState.degree = Math.round(normDeg * 10) / 10;
      // Match nearest 16 Huong
      let bestH = HUONG_16_LIST[0];
      let minDiff = 999;
      HUONG_16_LIST.forEach(h => {
        let diff = Math.abs(h.deg - normDeg);
        if (diff > 180) diff = 360 - diff;
        if (diff < minDiff) {
          minDiff = diff;
          bestH = h;
        }
      });
      ptState.huongKey = bestH.key;
      ptState.huongPalace = bestH.palace;
      // Match nearest 24 son cua
      let bestSon = SON_24_DOOR_INFO[0].son;
      let minSonDiff = 999;
      SON_24_DOOR_INFO.forEach(s => {
        const parts = s.deg.replace(/°/g, '').split('-').map(x => parseFloat(x.trim()));
        if (parts.length === 2) {
          let cDeg = (parts[0] + parts[1]) / 2;
          if (parts[0] > parts[1]) {
            cDeg = ((parts[0] + parts[1] + 360) / 2) % 360;
          }
          let d = Math.abs(cDeg - normDeg);
          if (d > 180) d = 360 - d;
          if (d < minSonDiff) {
            minSonDiff = d;
            bestSon = s.son;
          }
        }
      });
      ptState.sonCua = bestSon;
      if (currentQmdjMode === 'phongthuy') {
        renderQmdj();
      }
    }
  }

  // Export to global
  global.NetaQMDJView = {
    init: initQmdjView,
    render: renderQmdj,
    setDate: setDateAndRender,
    setMode: (m) => {
      currentQmdjMode = m;
      renderQmdj();
    },
    setPhongThuyDegree: setPhongThuyDegree,
    setDeitySchool: (sch) => {
      currentDeitySchool = sch;
      renderQmdj();
    },
    setJuMethod: (m) => {
      currentJuMethod = m;
      renderQmdj();
    },
    setInquiryDomain: (d) => {
      currentInquiryDomain = d;
      renderQmdj();
    },
    getState: () => ({
      currentQmdjMode,
      currentDeitySchool,
      currentJuMethod,
      currentInquiryDomain,
      currentQmdjDate,
      ptState,
      breathState
    })
  };

})(typeof window !== 'undefined' ? window : this);
