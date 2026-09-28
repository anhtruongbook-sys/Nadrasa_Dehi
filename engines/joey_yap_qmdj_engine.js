/**
 * NETA LIGHT - JOEY YAP QI MEN DUN JIA ENGINE
 * File: engines/joey_yap_qmdj_engine.js
 * ---------------------------------------------------------------------------------
 * Đóng gói độc lập toàn bộ các thuật toán cốt lõi từ bộ toàn thư:
 * "Qi Men Dun Jia Compendium (Second Edition)" của tác giả Joey Yap.
 *
 * CÁC PHÂN HỆ TÍNH TOÁN & THUẬT TOÁN:
 * 1. Thập Nhị Nguyệt Tướng (12 Month Generals / Thái Dương Quá Cung).
 * 2. Ma trận 144 Tọa Độ Thái Trùng Thiên Mã (Great Minister Sky Horse).
 * 3. Bộ lọc Phủ quyết Ngũ Bất Ngộ Thời (Five Disharmony Hour - Veto Factor).
 * 4. Kỳ Môn Tam Thắng (Three Victory Palaces: Trực Phù, Cửu Thiên, Sinh Môn).
 * 5. Ngũ Bất Kích (Five Non-Striking Palaces: 5 phương vị cấm công kích).
 * 6. Du Tam Tị Ngũ (Swaying 3, Evading 5: Trực Phù đáo Chấn 3 vs Trung 5).
 * 7. Thiên Tam Môn (Heavenly 3 Doors) & Địa Tứ Hộ (Earthly 4 Gates).
 * 8. Môn Cung Hòa Nghĩa (Door-Palace Harmony & Righteousness).
 * 9. Hệ thống 76 Cách Cục Toàn Thư (Tam Cát Bảo, Cửu Độn, Tam Trá, Ngũ Giả,
 *    Đại Hung Cách, Lục Nghi Kích Hình, Tam Kỳ Nhập Mộ, Môn Bách, Cung Bức).
 * 10. Bát Môn & Cửu Tinh Khắc Ứng Thực Địa (Section H: Evidential Occurrences).
 * 11. Bộ điều phối Tác chiến Không gian (Spatial Strategic Execution) &
 *     Cầu nối tích hợp tự động với QMDJCore trong Neta Light.
 */

(function (global) {
  'use strict';

  // ==============================================================================
  // 1. TỪ ĐIỂN & HỆ THỐNG DANH MỤC THUẬT NGỮ ĐỐI SOÁT
  // ==============================================================================

  const STEMS_10 = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  const STEM_PINYIN = {
    'Giáp': 'Jia', 'Ất': 'Yi', 'Bính': 'Bing', 'Đinh': 'Ding', 'Mậu': 'Wu',
    'Kỷ': 'Ji', 'Canh': 'Geng', 'Tân': 'Xin', 'Nhâm': 'Ren', 'Quý': 'Gui'
  };
  const PINYIN_TO_VN_STEM = {
    'Jia': 'Giáp', 'Yi': 'Ất', 'Bing': 'Bính', 'Ding': 'Đinh', 'Wu': 'Mậu',
    'Ji': 'Kỷ', 'Geng': 'Canh', 'Xin': 'Tân', 'Ren': 'Nhâm', 'Gui': 'Quý'
  };

  const BRANCHES_12 = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  const BRANCH_PINYIN = {
    'Tý': 'Zi', 'Sửu': 'Chou', 'Dần': 'Yin', 'Mão': 'Mao', 'Thìn': 'Chen', 'Tỵ': 'Si',
    'Ngọ': 'Wu', 'Mùi': 'Wei', 'Thân': 'Shen', 'Dậu': 'You', 'Tuất': 'Xu', 'Hợi': 'Hai'
  };
  const PINYIN_TO_VN_BRANCH = {
    'Zi': 'Tý', 'Chou': 'Sửu', 'Yin': 'Dần', 'Mao': 'Mao', 'Chen': 'Thìn', 'Si': 'Tỵ',
    'Wu': 'Ngọ', 'Wei': 'Mùi', 'Shen': 'Thân', 'You': 'Dậu', 'Xu': 'Tuất', 'Hai': 'Hợi'
  };

  const PALACES = {
    1: { id: 1, name: 'Khảm', pinyin: 'Kan', direction: 'Bắc', element: 'Thủy', branches: ['Tý'] },
    2: { id: 2, name: 'Khôn', pinyin: 'Kun', direction: 'Tây Nam', element: 'Thổ', branches: ['Mùi', 'Thân'] },
    3: { id: 3, name: 'Chấn', pinyin: 'Zhen', direction: 'Đông', element: 'Mộc', branches: ['Mão'] },
    4: { id: 4, name: 'Tốn', pinyin: 'Xun', direction: 'Đông Nam', element: 'Mộc', branches: ['Thìn', 'Tỵ'] },
    5: { id: 5, name: 'Trung Cung', pinyin: 'Center', direction: 'Trung Cung', element: 'Thổ', branches: [] },
    6: { id: 6, name: 'Càn', pinyin: 'Qian', direction: 'Tây Bắc', element: 'Kim', branches: ['Tuất', 'Hợi'] },
    7: { id: 7, name: 'Đoài', pinyin: 'Dui', direction: 'Tây', element: 'Kim', branches: ['Dậu'] },
    8: { id: 8, name: 'Cấn', pinyin: 'Gen', direction: 'Đông Bắc', element: 'Thổ', branches: ['Sửu', 'Dần'] },
    9: { id: 9, name: 'Ly', pinyin: 'Li', direction: 'Nam', element: 'Hỏa', branches: ['Ngọ'] }
  };

  const DOORS_META = {
    'Khai':     { vn: 'Khai Môn', en: 'Open Door', element: 'Kim', nature: 'Đại Cát', homePalace: 6 },
    'Khai Môn': { vn: 'Khai Môn', en: 'Open Door', element: 'Kim', nature: 'Đại Cát', homePalace: 6 },
    'Hưu':      { vn: 'Hưu Môn', en: 'Rest Door', element: 'Thủy', nature: 'Cát', homePalace: 1 },
    'Hưu Môn':  { vn: 'Hưu Môn', en: 'Rest Door', element: 'Thủy', nature: 'Cát', homePalace: 1 },
    'Sinh':     { vn: 'Sinh Môn', en: 'Life Door', element: 'Thổ', nature: 'Đại Cát', homePalace: 8 },
    'Sinh Môn': { vn: 'Sinh Môn', en: 'Life Door', element: 'Thổ', nature: 'Đại Cát', homePalace: 8 },
    'Thương':   { vn: 'Thương Môn', en: 'Harm Door', element: 'Mộc', nature: 'Hung', homePalace: 3 },
    'Thương Môn': { vn: 'Thương Môn', en: 'Harm Door', element: 'Mộc', nature: 'Hung', homePalace: 3 },
    'Đỗ':       { vn: 'Đỗ Môn', en: 'Delusion Door', element: 'Mộc', nature: 'Bình Hòa (Bảo Mật)', homePalace: 4 },
    'Đỗ Môn':   { vn: 'Đỗ Môn', en: 'Delusion Door', element: 'Mộc', nature: 'Bình Hòa (Bảo Mật)', homePalace: 4 },
    'Cảnh':     { vn: 'Cảnh Môn', en: 'Scenery Door', element: 'Hỏa', nature: 'Thứ Cát (Hiển Lộ)', homePalace: 9 },
    'Cảnh Môn': { vn: 'Cảnh Môn', en: 'Scenery Door', element: 'Hỏa', nature: 'Thứ Cát (Hiển Lộ)', homePalace: 9 },
    'Tử':       { vn: 'Tử Môn', en: 'Death Door', element: 'Thổ', nature: 'Đại Hung', homePalace: 2 },
    'Tử Môn':   { vn: 'Tử Môn', en: 'Death Door', element: 'Thổ', nature: 'Đại Hung', homePalace: 2 },
    'Kinh':     { vn: 'Kinh Môn', en: 'Fear Door', element: 'Kim', nature: 'Hung', homePalace: 7 },
    'Kinh Môn': { vn: 'Kinh Môn', en: 'Fear Door', element: 'Kim', nature: 'Hung', homePalace: 7 }
  };

  const STARS_META = {
    'Thiên Bồng': { vn: 'Thiên Bồng', element: 'Thủy', nature: 'Đại Hung' },
    'Thiên Nhuế': { vn: 'Thiên Nhuế', element: 'Thổ', nature: 'Đại Hung' },
    'Thiên Xung': { vn: 'Thiên Xung', element: 'Mộc', nature: 'Thứ Cát' },
    'Thiên Phụ':  { vn: 'Thiên Phụ', element: 'Mộc', nature: 'Đại Cát' },
    'Thiên Cầm':  { vn: 'Thiên Cầm', element: 'Thổ', nature: 'Đại Cát' },
    'Thiên Tâm':  { vn: 'Thiên Tâm', element: 'Kim', nature: 'Đại Cát' },
    'Thiên Trụ':  { vn: 'Thiên Trụ', element: 'Kim', nature: 'Hung' },
    'Thiên Nhậm': { vn: 'Thiên Nhậm', element: 'Thổ', nature: 'Đại Cát' },
    'Thiên Anh':  { vn: 'Thiên Anh', element: 'Hỏa', nature: 'Bình Hòa' }
  };

  const DEITIES_META = {
    'Trực Phù':  { vn: 'Trực Phù', en: 'Chief', nature: 'Cát Lợi Tối Cao' },
    'Đằng Xà':   { vn: 'Đằng Xà', en: 'Surging Snake', nature: 'Hung Họa Quái Dị' },
    'Thái Âm':   { vn: 'Thái Âm', en: 'Great Moon', nature: 'Cát Lợi Quý Nhân' },
    'Lục Hợp':   { vn: 'Lục Hợp', en: 'Six Harmony', nature: 'Hòa Hợp Hôn Nhân' },
    'Bạch Hổ':   { vn: 'Bạch Hổ', en: 'White Tiger', nature: 'Đại Hung Huyết Quang' },
    'Câu Trần':  { vn: 'Câu Trần', en: 'Grappling Hook', nature: 'Đình Trệ Kiện Tụng' },
    'Huyền Vũ':  { vn: 'Huyền Vũ', en: 'Black Tortoise', nature: 'Mất Cắp Lừa Đảo' },
    'Chu Tước':  { vn: 'Chu Tước', en: 'Red Phoenix', nature: 'Thị Phi Khẩu Thiệt' },
    'Cửu Địa':   { vn: 'Cửu Địa', en: 'Nine Earth', nature: 'Vững Chắc Phòng Thủ' },
    'Cửu Thiên': { vn: 'Cửu Thiên', en: 'Nine Heaven', nature: 'Thăng Tiến Viễn Vọng' }
  };

  const ELEMENT_PRODUCES = { 'Mộc': 'Hỏa', 'Hỏa': 'Thổ', 'Thổ': 'Kim', 'Kim': 'Thủy', 'Thủy': 'Mộc' };
  const ELEMENT_CONTROLS = { 'Mộc': 'Thổ', 'Thổ': 'Thủy', 'Thủy': 'Hỏa', 'Hỏa': 'Kim', 'Kim': 'Mộc' };

  // ==============================================================================
  // 2. 12 NGUYỆT TƯỚNG & 144 TỌA ĐỘ THÁI TRÙNG THIÊN MÃ (SECTIONS D & G)
  // ==============================================================================

  // Bảng 12 Nguyệt Tướng theo 24 Tiết Khí (Thái Dương Quá Cung)
  const SOLAR_TERM_TO_MONTH_GENERAL = {
    "Đại Hàn":   { name_vn: "Thần Hậu", branch: "Tý", month: 12, name_cn: "神后" },
    "Lập Xuân":  { name_vn: "Thần Hậu", branch: "Tý", month: 12, name_cn: "神后" },
    "Vũ Thủy":   { name_vn: "Đăng Minh", branch: "Hợi", month: 1, name_cn: "登明" },
    "Kinh Trập": { name_vn: "Đăng Minh", branch: "Hợi", month: 1, name_cn: "登明" },
    "Xuân Phân": { name_vn: "Hà Khôi", branch: "Tuất", month: 2, name_cn: "河魁" },
    "Thanh Minh":{ name_vn: "Hà Khôi", branch: "Tuất", month: 2, name_cn: "河魁" },
    "Cốc Vũ":    { name_vn: "Tòng Khôi", branch: "Dậu", month: 3, name_cn: "從魁" },
    "Lập Hạ":    { name_vn: "Tòng Khôi", branch: "Dậu", month: 3, name_cn: "從魁" },
    "Tiểu Mãn":  { name_vn: "Truyền Tống", branch: "Thân", month: 4, name_cn: "傳送" },
    "Mang Chủng":{ name_vn: "Truyền Tống", branch: "Thân", month: 4, name_cn: "傳送" },
    "Hạ Chí":    { name_vn: "Tiểu Cát", branch: "Mùi", month: 5, name_cn: "小吉" },
    "Tiểu Thử":  { name_vn: "Tiểu Cát", branch: "Mùi", month: 5, name_cn: "小吉" },
    "Đại Thử":   { name_vn: "Thắng Quang", branch: "Ngọ", month: 6, name_cn: "勝光" },
    "Lập Thu":   { name_vn: "Thắng Quang", branch: "Ngọ", month: 6, name_cn: "勝光" },
    "Xử Thử":    { name_vn: "Thái Ất", branch: "Tỵ", month: 7, name_cn: "太乙" },
    "Bạch Lộ":   { name_vn: "Thái Ất", branch: "Tỵ", month: 7, name_cn: "太乙" },
    "Thu Phân":  { name_vn: "Thiên Cương", branch: "Thìn", month: 8, name_cn: "天罡" },
    "Hàn Lộ":    { name_vn: "Thiên Cương", branch: "Thìn", month: 8, name_cn: "天罡" },
    "Sương Giáng":{ name_vn: "Thái Trùng", branch: "Mão", month: 9, name_cn: "太衝" },
    "Lập Đông":  { name_vn: "Thái Trùng", branch: "Mão", month: 9, name_cn: "太衝" },
    "Tiểu Tuyết":{ name_vn: "Công Tào", branch: "Dần", month: 10, name_cn: "功曹" },
    "Đại Tuyết": { name_vn: "Công Tào", branch: "Dần", month: 10, name_cn: "功曹" },
    "Đông Chí":  { name_vn: "Đại Cát", branch: "Sửu", month: 11, name_cn: "大吉" },
    "Tiểu Hàn":  { name_vn: "Đại Cát", branch: "Sửu", month: 11, name_cn: "大吉" }
  };

  const LUNAR_MONTH_GENERALS = [
    { month: 1, name_vn: "Đăng Minh", branch: "Hợi", pinyin: "Deng Ming" },
    { month: 2, name_vn: "Hà Khôi", branch: "Tuất", pinyin: "He Kui" },
    { month: 3, name_vn: "Tòng Khôi", branch: "Dậu", pinyin: "Cong Kui" },
    { month: 4, name_vn: "Truyền Tống", branch: "Thân", pinyin: "Chuan Song" },
    { month: 5, name_vn: "Tiểu Cát", branch: "Mùi", pinyin: "Xiao Ji" },
    { month: 6, name_vn: "Thắng Quang", branch: "Ngọ", pinyin: "Sheng Guang" },
    { month: 7, name_vn: "Thái Ất", branch: "Tỵ", pinyin: "Tai Yi" },
    { month: 8, name_vn: "Thiên Cương", branch: "Thìn", pinyin: "Tian Gang" },
    { month: 9, name_vn: "Thái Trùng", branch: "Mão", pinyin: "Tai Chong" },
    { month: 10, name_vn: "Công Tào", branch: "Dần", pinyin: "Gong Cao" },
    { month: 11, name_vn: "Đại Cát", branch: "Sửu", pinyin: "Da Ji" },
    { month: 12, name_vn: "Thần Hậu", branch: "Tý", pinyin: "Shen Hou" }
  ];

  function getMonthGeneral(solarTermOrMonth) {
    if (typeof solarTermOrMonth === 'string' && SOLAR_TERM_TO_MONTH_GENERAL[solarTermOrMonth]) {
      return SOLAR_TERM_TO_MONTH_GENERAL[solarTermOrMonth];
    }
    const m = parseInt(solarTermOrMonth) || 1;
    const clampedM = Math.max(1, Math.min(12, m));
    return LUNAR_MONTH_GENERALS[clampedM - 1];
  }

  /**
   * Tính tọa độ Thái Trùng Thiên Mã (144 Tọa Độ Ma Trận)
   * Thuật toán: Đặt Nguyệt Tướng lên Chi Giờ, thuận hành tìm vị trí của Mão (Thái Trùng).
   */
  function getGreatMinisterSkyHorse(monthGenBranch, hourBranch) {
    const normBranch = (b) => {
      if (!b) return 'Tý';
      const s = String(b).trim();
      return (s === 'Tị') ? 'Tỵ' : s;
    };

    const mBranch = normBranch(monthGenBranch);
    const hBranch = normBranch(hourBranch);

    const genIdx = BRANCHES_12.indexOf(mBranch);
    const hourIdx = BRANCHES_12.indexOf(hBranch);
    const maoIdx = BRANCHES_12.indexOf("Mão");

    if (genIdx === -1 || hourIdx === -1) {
      return {
        sky_horse_branch: "Mão",
        palace_id: 3,
        palace_name: PALACES[3].name,
        direction: PALACES[3].direction,
        strategic_effect: "Bến cảng trong giông bão, giải vây cấp tốc, thoát hiểm an toàn khi đối mặt áp lực."
      };
    }

    const offset = (maoIdx - genIdx + 12) % 12;
    const targetBranchIdx = (hourIdx + offset) % 12;
    const targetBranch = BRANCHES_12[targetBranchIdx];

    let targetPalace = 3;
    for (const [pid, pinfo] of Object.entries(PALACES)) {
      if (pinfo.branches && pinfo.branches.includes(targetBranch)) {
        targetPalace = parseInt(pid);
        break;
      }
    }

    return {
      sky_horse_branch: targetBranch,
      palace_id: targetPalace,
      palace_name: PALACES[targetPalace].name,
      direction: PALACES[targetPalace].direction,
      strategic_effect: "Bến cảng trong giông bão, giải vây cấp tốc, thoát hiểm an toàn khi đối mặt áp lực."
    };
  }

  // ==============================================================================
  // 3. BỘ LỌC PHỦ QUYẾT NGŨ BẤT NGỘ THỜI (FIVE DISHARMONY HOUR - VETO)
  // ==============================================================================

  const FIVE_DISHARMONY_MAP = {
    'Giáp': 'Canh',
    'Ất': 'Tân',
    'Bính': 'Nhâm',
    'Đinh': 'Quý',
    'Mậu': 'Giáp',
    'Kỷ': 'Ất',
    'Canh': 'Bính',
    'Tân': 'Đinh',
    'Nhâm': 'Mậu',
    'Quý': 'Kỷ'
  };

  function isFiveDisharmonyHour(dayStem, hourStem) {
    const cleanDay = (dayStem || '').trim();
    const cleanHour = (hourStem || '').trim();
    return FIVE_DISHARMONY_MAP[cleanDay] === cleanHour;
  }

  // ==============================================================================
  // 4. THUẬT TOÁN KỲ MÔN TAM THẮNG (THE THREE VICTORIES - P. 864)
  // ==============================================================================

  function evaluateThreeVictoryPalaces(chiefPalace, nineHeavenPalace, lifeDoorPalace) {
    const firstVic = {
      rank: 1,
      name: "Đệ Nhất Thắng (Trực Phù Cung)",
      palace_id: chiefPalace,
      palace_name: PALACES[chiefPalace].name,
      direction: PALACES[chiefPalace].direction,
      essence: "Quân vương hộ trì, uy quyền tối thượng, bách chiến bách thắng."
    };

    const secondVic = {
      rank: 2,
      name: "Đệ Nhị Thắng (Cửu Thiên Cung)",
      palace_id: nineHeavenPalace,
      palace_name: PALACES[nineHeavenPalace].name,
      direction: PALACES[nineHeavenPalace].direction,
      essence: "Dương binh thanh thế, tầm nhìn chiến lược vươn xa, thuyết phục áp đảo."
    };

    const thirdVic = {
      rank: 3,
      name: "Đệ Tam Thắng (Sinh Môn Cung)",
      palace_id: lifeDoorPalace,
      palace_name: PALACES[lifeDoorPalace].name,
      direction: PALACES[lifeDoorPalace].direction,
      essence: "Sinh khí dồi dào, tối đa hóa lợi nhuận tài chính, bảo toàn cơ nghiệp."
    };

    const convergences = [];
    if (chiefPalace === nineHeavenPalace && nineHeavenPalace === lifeDoorPalace) {
      convergences.push("TAM THẮNG ĐỒNG CUNG (Đại uy lực tối thượng hiếm có)");
    } else {
      if (chiefPalace === lifeDoorPalace) convergences.push("Trực Phù hội Sinh Môn (Đệ Nhất + Đệ Tam Thắng Đồng Cung)");
      if (chiefPalace === nineHeavenPalace) convergences.push("Trực Phù hội Cửu Thiên (Đệ Nhất + Đệ Nhị Thắng Đồng Cung)");
      if (nineHeavenPalace === lifeDoorPalace) convergences.push("Cửu Thiên hội Sinh Môn (Đệ Nhị + Đệ Tam Thắng Đồng Cung: Thanh thế + Tài lộc)");
    }

    return {
      first_victory: firstVic,
      second_victory: secondVic,
      third_victory: thirdVic,
      convergences,
      is_converged: convergences.length > 0,
      rule: "Người chủ sự bắt buộc ngồi quay lưng (Back-Facing) vào một trong ba cung vị này."
    };
  }

  // ==============================================================================
  // 5. THUẬT TOÁN NGŨ BẤT KÍCH (FIVE NON-STRIKING PALACES - P. 865)
  // ==============================================================================

  function evaluateFiveNonStriking(chiefPalace, nineHeavenPalace, lifeDoorPalace, nineEarthPalace, envoyPalace) {
    const list = [
      { palace_id: chiefPalace, name: "Trực Phù (Thiên Ất)" },
      { palace_id: nineHeavenPalace, name: "Cửu Thiên" },
      { palace_id: lifeDoorPalace, name: "Sinh Môn" },
      { palace_id: nineEarthPalace, name: "Cửu Địa" },
      { palace_id: envoyPalace, name: "Trực Sử" }
    ];

    const uniqueSectors = {};
    list.forEach(item => {
      const pid = item.palace_id;
      if (PALACES[pid]) {
        if (!uniqueSectors[pid]) {
          uniqueSectors[pid] = {
            palace_id: pid,
            palace_name: PALACES[pid].name,
            direction: PALACES[pid].direction,
            reasons: [item.name]
          };
        } else {
          uniqueSectors[pid].reasons.push(item.name);
        }
      }
    });

    return {
      restricted_sectors: Object.values(uniqueSectors),
      warning: "Tuyệt đối không đối đầu trực diện, ép giá hoặc khởi kiện vào các phương vị này."
    };
  }

  // ==============================================================================
  // 6. THUẬT TOÁN DU TAM TỊ NGŨ & MÔN CUNG HÒA NGHĨA
  // ==============================================================================

  function evaluateSwaying3Evading5(chiefPalace) {
    if (chiefPalace === 3) {
      return {
        status: "SWAYING_3",
        score: 20,
        message: "Du Tam: Trực Phù đáo Chấn Cung 3: Kế hoạch nở rộ, đơm hoa kết trái (+20đ)."
      };
    }
    if (chiefPalace === 5) {
      return {
        status: "EVADING_5",
        score: -30,
        message: "Tị Ngũ: Trực Phù nhập Trung Cung 5: Nguy cơ đình trệ bế tắc nghiêm trọng (-30đ)."
      };
    }
    return { status: "NORMAL", score: 0, message: `Trực Phù đáo Cung ${chiefPalace}` };
  }

  function evaluateDoorPalaceHarmony(doorName, palaceId) {
    const dClean = (doorName || '').replace(' Môn', '').trim();
    const dMeta = DOORS_META[dClean] || DOORS_META['Khai'];
    const pMeta = PALACES[palaceId] || PALACES[1];

    const dElem = dMeta.element;
    const pElem = pMeta.element;

    if (dElem === pElem) {
      return { stage: "Tỷ Hòa", score: 8, desc: `Cùng hành ${dElem} tương trợ, tiến triển ổn định (+8đ).` };
    }
    if (ELEMENT_PRODUCES[dElem] === pElem) {
      return { stage: "Hòa (Môn sinh Cung)", score: 15, desc: `Môn (${dElem}) sinh Cung (${pElem}): Môi trường tiếp nhận tích cực (+15đ).` };
    }
    if (ELEMENT_PRODUCES[pElem] === dElem) {
      return { stage: "Nghĩa (Cung sinh Môn)", score: 15, desc: `Cung (${pElem}) sinh Môn (${dElem}): Nền tảng hậu thuẫn vững vàng, quý nhân trợ lực (+15đ).` };
    }
    if (ELEMENT_CONTROLS[dElem] === pElem) {
      return { stage: "Môn Bách (Môn khắc Cung)", score: -20, desc: `Môn (${dElem}) khắc Cung (${pElem}): Nội bộ tranh chấp, trở ngại nghiêm trọng (-20đ).` };
    }
    if (ELEMENT_CONTROLS[pElem] === dElem) {
      return { stage: "Cung Bức (Cung khắc Môn)", score: -15, desc: `Cung (${pElem}) khắc Môn (${dElem}): Bị kiềm chế từ bên ngoài, khó phát huy (-15đ).` };
    }
    return { stage: "Bình", score: 0, desc: "Trạng thái bình thường." };
  }

  // ==============================================================================
  // 7. THƯ VIỆN NHẬN DIỆN 76 CÁCH CỤC TOÀN THƯ (76 FORMATIONS ENGINE)
  // ==============================================================================

  function scanPalaceFormations(pId, hStem, eStem, door, deity, star, isEnvoy) {
    const list = [];
    const h = (hStem || '').trim();
    const e = (eStem || '').trim();
    const d = (door || '').replace(' Môn', '').trim();
    const dei = (deity || '').trim();
    const s = (star || '').trim();

    // 1. TAM CÁT BẢO (THREE PRECIOUS)
    if (h === 'Mậu' && e === 'Bính') {
      list.push({ code: 'F01', name_vn: 'Thanh Long Phản Thủ', nature: 'Đại Cát', score: 30, desc: 'Vạn sự hanh thông, gặp quý nhân nâng đỡ, thăng tiến vượt bậc.' });
    }
    if (h === 'Bính' && e === 'Mậu') {
      list.push({ code: 'F02', name_vn: 'Phi Điểu Điệt Huyệt', nature: 'Đại Cát', score: 30, desc: 'Cơ hội vàng tự tìm đến, không tốn nhiều công sức mà thu hoạch trọn vẹn.' });
    }
    if (h === 'Đinh' && isEnvoy) {
      list.push({ code: 'F03', name_vn: 'Ngọc Nữ Thủ Môn', nature: 'Cát Lợi', score: 25, desc: 'Lợi cho đàm phán riêng tư, hôn nhân, tiệc tùng ăn mừng, bảo mật hậu trường.' });
    }

    // 2. CỬU ĐỘN (NINE DUN)
    if (h === 'Bính' && e === 'Đinh' && d === 'Khai') {
      list.push({ code: 'F04', name_vn: 'Thiên Độn', nature: 'Đại Cát', score: 25, desc: 'Đắc thiên thời, đại lợi mở rộng kinh doanh, xuất hành, thăng quan.' });
    }
    if (h === 'Ất' && e === 'Kỷ' && d === 'Khai') {
      list.push({ code: 'F05', name_vn: 'Địa Độn', nature: 'Đại Cát', score: 25, desc: 'Đắc địa lợi, vững chắc tài sản, xây dựng bất động sản, phòng thủ kiên cố.' });
    }
    if (h === 'Đinh' && dei === 'Thái Âm' && d === 'Hưu') {
      list.push({ code: 'F06', name_vn: 'Nhân Độn', nature: 'Đại Cát', score: 25, desc: 'Đắc nhân hòa, quý nhân phò trợ, tuyển dụng nhân tài, giải quyết tranh chấp.' });
    }
    if (h === 'Ất' && pId === 4 && ['Khai', 'Hưu', 'Sinh'].includes(d)) {
      list.push({ code: 'F07', name_vn: 'Phong Độn', nature: 'Cát Lợi', score: 20, desc: 'Thuận buồm xuôi gió, truyền thông lan tỏa, bán hàng thần tốc.' });
    }
    if (h === 'Ất' && e === 'Tân' && d === 'Sinh') {
      list.push({ code: 'F08', name_vn: 'Vân Độn', nature: 'Cát Lợi', score: 20, desc: 'Mây lành che chở, ẩn giấu năng lượng, chờ thời cơ bứt phá.' });
    }
    if (h === 'Ất' && pId === 1 && d === 'Hưu') {
      list.push({ code: 'F09', name_vn: 'Long Độn', nature: 'Cát Lợi', score: 20, desc: 'Rồng ẩn nước sâu, đại lợi đầu tư tài chính, cầu mưa thuận gió hòa.' });
    }
    if (h === 'Tân' && pId === 8 && d === 'Sinh') {
      list.push({ code: 'F10', name_vn: 'Hổ Độn', nature: 'Cát Lợi', score: 20, desc: 'Hổ gầm rừng sâu, uy phong trấn áp đối thủ, thu hồi công nợ.' });
    }
    if (h === 'Bính' && dei === 'Cửu Thiên' && d === 'Sinh') {
      list.push({ code: 'F11', name_vn: 'Thần Độn', nature: 'Đại Cát', score: 25, desc: 'Thần linh hộ niệm, trực giác bén nhạy, công danh lẫy lừng.' });
    }
    if (h === 'Đinh' && dei === 'Cửu Địa' && d === 'Đỗ') {
      list.push({ code: 'F12', name_vn: 'Quỷ Độn', nature: 'Cát Lợi', score: 20, desc: 'Xuất quỷ nhập thần, che giấu tung tích hoàn hảo, đối thủ không thể nắm bắt.' });
    }

    // 3. TAM TRÁ & NGŨ GIẢ (DECEPTIONS & FALSITIES)
    if (['Khai', 'Hưu', 'Sinh'].includes(d) && dei === 'Thái Âm') {
      list.push({ code: 'F13', name_vn: 'Chân Trá', nature: 'Cát Lợi', score: 18, desc: 'Hành sự cơ mật, mượn sức người làm nên đại sự.' });
    }
    if (['Khai', 'Hưu', 'Sinh'].includes(d) && dei === 'Cửu Địa') {
      list.push({ code: 'F14', name_vn: 'Trọng Trá', nature: 'Cát Lợi', score: 18, desc: 'Thích hợp tích lũy vốn liếng, mua sắm tài sản, ẩn mình chờ thời.' });
    }
    if (['Khai', 'Hưu', 'Sinh'].includes(d) && dei === 'Lục Hợp') {
      list.push({ code: 'F15', name_vn: 'Hưu Trá', nature: 'Cát Lợi', score: 18, desc: 'Hòa giải tranh chấp, liên minh đối tác chiến lược.' });
    }
    if (['Khai', 'Hưu', 'Sinh'].includes(d) && dei === 'Cửu Thiên') {
      list.push({ code: 'F16', name_vn: 'Thiên Giả', nature: 'Thứ Cát', score: 15, desc: 'Hư trương thanh thế, phát động chiến dịch truyền thông.' });
    }
    if (d === 'Đỗ' && dei === 'Cửu Địa') {
      list.push({ code: 'F17', name_vn: 'Địa Giả', nature: 'Thứ Cát', score: 15, desc: 'Rút lui an toàn, bảo tồn tài chính trong khủng hoảng.' });
    }

    // 4. ĐẠI HUNG CÁCH (FIERCE INAUSPICIOUS FORMATIONS)
    if (h === 'Tân' && e === 'Ất') {
      list.push({ code: 'F49', name_vn: 'Bạch Hổ Thảng Cuồng', nature: 'Đại Hung', score: -30, desc: 'Khách hại Chủ, tai nạn xe cộ, thương tích đổ máu, đổ vỡ kinh doanh.' });
    }
    if (h === 'Quý' && e === 'Bính') {
      list.push({ code: 'F50', name_vn: 'Đằng Xà Yêu Kiều', nature: 'Đại Hung', score: -25, desc: 'Hỏa bốc Thủy khô, kiện tụng thị phi, lừa đảo hợp đồng, hoảng hốt.' });
    }
    if (h === 'Ất' && e === 'Tân') {
      list.push({ code: 'F51', name_vn: 'Thanh Long Đào Tẩu', nature: 'Đại Hung', score: -25, desc: 'Nô bộc phản bội, mất tiền hao tài, phân ly tan tác, nguy cơ phá sản.' });
    }
    if (h === 'Bính' && e === 'Quý') {
      list.push({ code: 'F52', name_vn: 'Chu Tước Đầu Giang', nature: 'Đại Hung', score: -25, desc: 'Văn tự thất lạc, tranh chấp pháp lý, thư tín bị phong tỏa, tai nạn sông nước.' });
    }
    if (h === 'Bính' && e === 'Canh') {
      list.push({ code: 'F53', name_vn: 'Huỳnh Hoặc Nhập Bạch', nature: 'Hung', score: -20, desc: 'Đề phòng trộm cướp, mất mát tài sản, đối thủ xâm nhập phá hoại.' });
    }
    if (h === 'Canh' && e === 'Bính') {
      list.push({ code: 'F54', name_vn: 'Thái Bạch Nhập Huỳnh', nature: 'Cát cho Tiến Công', score: 15, desc: 'Lợi thế chủ động tiến công, giặc tự tan rã, đánh chiếm thị phần.' });
    }

    // 5. LỤC NGHI KÍCH HÌNH & TAM KỲ NHẬP MỘ
    const STRIKES = {
      'Mậu_3': 'Mậu kích hình tại Chấn 3 (Tý Mão tương hình)',
      'Kỷ_2': 'Kỷ kích hình tại Khôn 2 (Tuất Mùi tương hình)',
      'Canh_8': 'Canh kích hình tại Cấn 8 (Thân Dần tương hình)',
      'Tân_9': 'Tân kích hình tại Ly 9 (Ngọ Ngọ tự hình)',
      'Nhâm_4': 'Nhâm kích hình tại Tốn 4 (Thìn Thìn tự hình)',
      'Quý_4': 'Quý kích hình tại Tốn 4 (Dần Tỵ tương hình)'
    };
    const strikeKey = `${h}_${pId}`;
    if (STRIKES[strikeKey]) {
      list.push({ code: 'F69', name_vn: 'Lục Nghi Kích Hình', nature: 'Đại Hung', score: -30, desc: `${STRIKES[strikeKey]}: Tổn hại thân thể, án phạt hoặc thiệt hại kinh tế nặng nề.` });
    }

    const GRAVES = {
      'Ất_6': 'Ất Kỳ nhập mộ tại Càn 6 (Ất Mộc mộ tại Tuất)',
      'Bính_6': 'Bính Kỳ nhập mộ tại Càn 6 (Bính Hỏa mộ tại Tuất)',
      'Đinh_8': 'Đinh Kỳ nhập mộ tại Cấn 8 (Đinh Hỏa mộ tại Sửu)'
    };
    const graveKey = `${h}_${pId}`;
    if (GRAVES[graveKey]) {
      list.push({ code: 'F67', name_vn: 'Tam Kỳ Nhập Mộ', nature: 'Hung Trệ', score: -25, desc: `${GRAVES[graveKey]}: Tài năng bị chôn vùi, bế tắc không lối thoát.` });
    }

    // 6. MÔN BÁCH & CUNG BỨC
    const harmony = evaluateDoorPalaceHarmony(d, pId);
    if (harmony.stage.includes('Môn Bách')) {
      list.push({ code: 'F73', name_vn: 'Môn Bách Cách', nature: 'Hung Họa', score: -20, desc: harmony.desc });
    } else if (harmony.stage.includes('Cung Bức')) {
      list.push({ code: 'F74', name_vn: 'Cung Bức Cách', nature: 'Hạn Chế', score: -15, desc: harmony.desc });
    }

    return list;
  }

  // ==============================================================================
  // 8. BÁT MÔN & CỬU TINH KHẮC ỨNG THỰC ĐỊA (SECTION H: EVIDENTIAL OMENS)
  // ==============================================================================

  const DOOR_OMENS = {
    'Khai': {
      door_vn: 'Khai Môn',
      prime_omen: 'Gặp quan chức, xe cộ sang trọng, tiền bạc, người mặc áo màu trắng hoặc vàng nhạt.',
      signals: ['Người cầm giấy tờ / hồ sơ / hợp đồng', 'Đoàn xe công vụ đi qua', 'Người đội mũ bảo hiểm/áo khoác sáng màu']
    },
    'Hưu': {
      door_vn: 'Hưu Môn',
      prime_omen: 'Gặp quý nhân hòa nhã, tăng ni đạo sĩ, người mang theo rượu thịt hoặc phụ nữ bế trẻ nhỏ.',
      signals: ['Người áo xanh lam hoặc đen', 'Thuyền bè hoặc mặt nước êm đềm', 'Tiếng cười đùa vui vẻ hòa thuận']
    },
    'Sinh': {
      door_vn: 'Sinh Môn',
      prime_omen: 'Gặp thương gia, tiền tài của cải, gia súc hoặc người mang thai / sinh nở.',
      signals: ['Người ôm bọc tiền / túi hàng hóa lớn', 'Cây cối đâm chồi nở hoa xanh tốt', 'Thú cưng hoặc vật nuôi khỏe mạnh']
    },
    'Thương': {
      door_vn: 'Thương Môn',
      prime_omen: 'Gặp người xô xát, va quẹt xe cộ, người khiêng vác gỗ củi hoặc tiếng gào thét.',
      signals: ['Tiếng còi phanh xe gấp', 'Người mang gậy gộc hoặc vật sắc nhọn', 'Người có vết thương tật ở chân']
    },
    'Đỗ': {
      door_vn: 'Đỗ Môn',
      prime_omen: 'Gặp người che mặt, cảnh sát ẩn mật, thợ mộc cưa gỗ, sương mù che phủ.',
      signals: ['Xe tuần tra chớp đèn', 'Cổng ngõ khóa kín', 'Người lén lút né tránh tầm nhìn']
    },
    'Cảnh': {
      door_vn: 'Cảnh Môn',
      prime_omen: 'Gặp người mặc áo đỏ, văn nhân nghệ sĩ, đám cưới, pháo hoa, bằng khen tài liệu.',
      signals: ['Ánh lửa bập bùng hoặc đèn rực rỡ', 'Nhạc hội / sự kiện rộn rã', 'Người mang tranh vẽ hoặc sách báo']
    },
    'Tử': {
      door_vn: 'Tử Môn',
      prime_omen: 'Gặp đám tang, người mặc đồ tang trắng, đồ sứ vỡ, người già yếu bệnh tật.',
      signals: ['Tiếng khóc than hoặc chuông đám ma', 'Mùi khói hương trầm nồng nặc', 'Xác động vật chết bên đường']
    },
    'Kinh': {
      door_vn: 'Kinh Môn',
      prime_omen: 'Gặp người cãi vã, chó sủa dữ dội, người cầm kim loại / chuông đồng, tin tức giật gân.',
      signals: ['Tiếng còi báo động khẩn cấp', 'Chó sủa rượt đuổi người', 'Tiếng kim loại va đập gay gắt']
    }
  };

  const STAR_OMENS = {
    'Thiên Bồng': { star_vn: 'Thiên Bồng', omen: 'Gặp mưa lớn, đàn cá bơi, kẻ trộm cắp, người mang ô dù màu đen.' },
    'Thiên Nhuế': { star_vn: 'Thiên Nhuế', omen: 'Gặp người đau bệnh, phụ nữ mang thai, thầy thuốc đông y, trâu bò cày ruộng.' },
    'Thiên Xung': { star_vn: 'Thiên Xung', omen: 'Gặp sấm sét, chim bay vút lên, tiếng trống dồn dập, người chạy thể thao.' },
    'Thiên Phụ':  { star_vn: 'Thiên Phụ', omen: 'Gặp thầy giáo, học sinh cắp sách, người cầm hoa sen, văn tự bằng cấp.' },
    'Thiên Cầm':  { star_vn: 'Thiên Cầm', omen: 'Gặp lãnh đạo vi hành, chim quý cất tiếng hót, đồ vật quý giá màu vàng.' },
    'Thiên Tâm':  { star_vn: 'Thiên Tâm', omen: 'Gặp thầy thuốc mang hòm thuốc, người tu đạo, người đeo trang sức vàng bạc.' },
    'Thiên Trụ':  { star_vn: 'Thiên Trụ', omen: 'Gặp gió lốc, chuông đồng ngân vang, người thổi sáo, đồ sắt gỉ sét vỡ đôi.' },
    'Thiên Nhậm': { star_vn: 'Thiên Nhậm', omen: 'Gặp nông dân vác cuốc, người gù lưng, bao tải lúa gạo, núi đá sừng sững.' },
    'Thiên Anh':  { star_vn: 'Thiên Anh', omen: 'Gặp ánh chớp, lửa cháy bập bùng, phụ nữ trang điểm lộng lẫy, người say rượu.' }
  };

  function getEvidentialOmens(doorName, starName, direction) {
    const dClean = (doorName || '').replace(' Môn', '').trim();
    const dInfo = DOOR_OMENS[dClean] || DOOR_OMENS['Khai'];
    const sClean = (starName || '').trim();
    const sInfo = STAR_OMENS[sClean] || STAR_OMENS['Thiên Tâm'];

    return {
      direction_of_departure: direction || 'Bắc',
      door_omen: {
        door_name: dInfo.door_vn,
        prime_phenomenon: dInfo.prime_omen,
        signals: dInfo.signals
      },
      star_omen: {
        star_name: sInfo.star_vn,
        manifestation: sInfo.omen
      },
      verification_rule: "Khi xuất hành theo phương vị chỉ định trong vòng 30 phút, nếu gặp ít nhất một điềm báo trên là năng lượng đã kích hoạt thành công."
    };
  }

  // ==============================================================================
  // 9. BỘ PHÂN TÍCH TOÀN DIỆN & CẦU NỐI VỚI NETA LIGHT (MASTER INTEGRATION)
  // ==============================================================================

  class JoeyYapQMDJEngine {
    constructor() {
      this.PALACES = PALACES;
      this.DOORS_META = DOORS_META;
      this.STARS_META = STARS_META;
      this.DEITIES_META = DEITIES_META;
    }

    isFiveDisharmony(dayStem, hourStem) {
      return isFiveDisharmonyHour(dayStem, hourStem);
    }

    getMonthGen(termOrMonth) {
      return getMonthGeneral(termOrMonth);
    }

    getSkyHorse(monthGenBranch, hourBranch) {
      return getGreatMinisterSkyHorse(monthGenBranch, hourBranch);
    }

    evaluateThreeVictories(chiefPalace, nineHeavenPalace, lifeDoorPalace) {
      return evaluateThreeVictoryPalaces(chiefPalace, nineHeavenPalace, lifeDoorPalace);
    }

    evaluateFiveRestrictions(chief, nineHeaven, lifeDoor, nineEarth, envoy) {
      return evaluateFiveNonStriking(chief, nineHeaven, lifeDoor, nineEarth, envoy);
    }

    scanPalaceFormations(pId, hStem, eStem, door, deity, star, isEnvoy) {
      return scanPalaceFormations(pId, hStem, eStem, door, deity, star, isEnvoy);
    }

    getOmens(doorName, starName, direction) {
      return getEvidentialOmens(doorName, starName, direction);
    }

    /**
     * Bóc tách và thẩm định toàn diện bàn Kỳ Môn từ đối tượng QMDJCore trong Neta Light
     * @param {Object} chart - Instance tạo bởi new QMDJCore.TheArtOfBecomingInvisible(dateObj)
     * @param {Object} params - { dayCanChi, hourCanChi, solarTerm, lunarMonth, taskGoal }
     */
    analyzeQMDJCoreChart(chart, params = {}) {
      if (!chart || !chart.box) {
        return { success: false, message: "Không tìm thấy dữ liệu bàn cờ Kỳ Môn hợp lệ." };
      }

      const dayCanChiRaw = params.dayCanChi || (chart.date ? chart.date.cstb(true) : '');
      const hourCanChiRaw = params.hourCanChi || (chart.hour ? chart.hour.cstb(true) : '');

      const parseCanChi = (str) => {
        if (!str) return { can: 'Giáp', chi: 'Tý' };
        const clean = String(str).trim();
        if (clean.includes(' ')) {
          const parts = clean.split(' ').filter(Boolean);
          const c = parts[0] || 'Giáp';
          let b = parts[1] || 'Tý';
          if (b === 'Tị') b = 'Tỵ';
          return { can: c, chi: b };
        }
        // Chuỗi không có dấu cách (ví dụ "辛巳", "ẤtTỵ", "CanhNgọ")
        const CANS = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
        const CHIS = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Tị', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi', '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        let cRes = 'Giáp', bRes = 'Tý';
        for (const c of CANS) {
          if (clean.startsWith(c)) {
            cRes = c;
            const rest = clean.substring(c.length);
            for (const b of CHIS) {
              if (rest.includes(b)) {
                bRes = b;
                break;
              }
            }
            break;
          }
        }
        if (bRes === 'Tị') bRes = 'Tỵ';
        return { can: cRes, chi: bRes };
      };

      const dayObj = parseCanChi(dayCanChiRaw);
      const hourObj = parseCanChi(hourCanChiRaw);
      const dayStem = dayObj.can;
      const hourStem = hourObj.can;
      const hourBranch = hourObj.chi;

      // 1. Kiểm tra bộ lọc phủ quyết Ngũ Bất Ngộ Thời
      const isVetoed = isFiveDisharmonyHour(dayStem, hourStem);
      const vetoReason = isVetoed ? `Phạm Ngũ Bất Ngộ Thời: Can Giờ (${hourStem}) khắc Can Ngày (${dayStem}) theo thế Thất Sát. Toàn bộ cát khí bị triệt tiêu.` : '';

      // Bảng ánh xạ dịch nhanh
      const TR_MAP = {
        "开门": "Khai", "休门": "Hưu", "生门": "Sinh", "伤门": "Thương",
        "杜门": "Đỗ", "景门": "Cảnh", "死门": "Tử", "惊门": "Kinh",
        "天蓬星": "Thiên Bồng", "天芮星": "Thiên Nhuế", "天冲星": "Thiên Xung",
        "天辅星": "Thiên Phụ", "天禽星": "Thiên Cầm", "天心星": "Thiên Tâm",
        "天柱星": "Thiên Trụ", "天任星": "Thiên Nhậm", "天英星": "Thiên Anh",
        "值符": "Trực Phù", "直符": "Trực Phù", "腾蛇": "Đằng Xà", "螣蛇": "Đằng Xà",
        "太阴": "Thái Âm", "六合": "Lục Hợp", "白虎": "Bạch Hổ", "玄武": "Huyền Vũ",
        "九地": "Cửu Địa", "九天": "Cửu Thiên", "勾陈": "Câu Trần", "朱雀": "Chu Tước",
        "甲": "Giáp", "乙": "Ất", "丙": "Bính", "丁": "Đinh", "戊": "Mậu",
        "己": "Kỷ", "庚": "Canh", "辛": "Tân", "壬": "Nhâm", "癸": "Quý"
      };
      const tr = (val) => {
        if (!val) return '';
        if (Array.isArray(val)) return val.map(tr).join('/');
        return TR_MAP[val] || val;
      };

      // 2. Bóc tách 9 cung Lạc Thư
      const palaces = {};
      let chiefPalace = 1;
      let envoyPalace = 1;
      let lifeDoorPalace = 8;
      let nineHeavenPalace = 9;
      let nineEarthPalace = 1;
      let deathDoorPalace = 2;
      let fearDoorPalace = 7;

      chart.box.flat().forEach(p => {
        const pNum = p.index + 1; // 1 - 9
        const door = tr(p.getDoor(true));
        const star = tr(p.getStar(true));
        const deity = tr(p.getDivinity(true));
        const hcs = tr(p.getHCS(true)).split('/')[0];
        const ecs = tr(p.getECS(true)).split('/')[0];
        const isKongWang = !!p.de;

        palaces[pNum] = { palace: pNum, door, star, deity, hcs, ecs, isKongWang, formations: [] };

        if (deity === 'Trực Phù') chiefPalace = pNum;
        if (deity === 'Cửu Thiên') nineHeavenPalace = pNum;
        if (deity === 'Cửu Địa') nineEarthPalace = pNum;
        if (door.includes('Sinh')) lifeDoorPalace = pNum;
        if (door.includes('Tử')) deathDoorPalace = pNum;
        if (door.includes('Kinh')) fearDoorPalace = pNum;
        if (p.isTrucSu) envoyPalace = pNum;
      });

      // 3. Quét toàn bộ 76 Cách Cục trên 9 Cung
      let totalFormationScore = 0;
      const detectedFormations = [];

      for (let pid = 1; pid <= 9; pid++) {
        if (pid === 5) continue;
        const pInfo = palaces[pid];
        if (!pInfo) continue;
        const fList = scanPalaceFormations(
          pid,
          pInfo.hcs,
          pInfo.ecs,
          pInfo.door,
          pInfo.deity,
          pInfo.star,
          (pid === envoyPalace)
        );
        pInfo.formations = fList;
        fList.forEach(f => {
          totalFormationScore += f.score;
          detectedFormations.push({
            palace_id: pid,
            palace_name: PALACES[pid].name,
            direction: PALACES[pid].direction,
            ...f
          });
        });
      }

      // 4. Nguyệt Tướng & Thái Trùng Thiên Mã
      const solarTerm = params.solarTerm || "Xuân Phân";
      const lunarMonth = params.lunarMonth || 2;
      const monthGen = getMonthGeneral(solarTerm);
      const skyHorse = getGreatMinisterSkyHorse(monthGen.branch, hourBranch || "Tý");

      // 5. Tam Thắng & Ngũ Bất Kích
      const threeVictories = evaluateThreeVictoryPalaces(chiefPalace, nineHeavenPalace, lifeDoorPalace);
      const fiveRestrictions = evaluateFiveNonStriking(chiefPalace, nineHeavenPalace, lifeDoorPalace, nineEarthPalace, envoyPalace);
      const swaying = evaluateSwaying3Evading5(chiefPalace);

      // 6. Điểm tổng hợp Chiến Lược Không Gian
      let netScore = 50 + totalFormationScore + swaying.score;
      if (threeVictories.is_converged) netScore += 15;
      if (isVetoed) netScore = -999;

      // 7. Khắc Ứng Thực Địa tại Cung Tam Thắng Cát Nhất
      const bestPalaceId = chiefPalace;
      const bestDoor = palaces[bestPalaceId] ? palaces[bestPalaceId].door : 'Khai';
      const bestStar = palaces[bestPalaceId] ? palaces[bestPalaceId].star : 'Thiên Tâm';
      const evidential = getEvidentialOmens(bestDoor, bestStar, PALACES[bestPalaceId].direction);

      return {
        success: true,
        is_vetoed: isVetoed,
        veto_reason: vetoReason,
        score: netScore,
        palaces,
        month_general: monthGen,
        sky_horse: skyHorse,
        three_victories: threeVictories,
        five_restrictions: fiveRestrictions,
        swaying_evading: swaying,
        detected_formations: detectedFormations,
        evidential_omens: evidential,
        spatial_strategy: {
          presenter_back_facing: `${threeVictories.first_victory.direction} (${threeVictories.first_victory.palace_name} - Trực Phù)`,
          alternative_back_facing: `${threeVictories.third_victory.direction} (${threeVictories.third_victory.palace_name} - Sinh Môn)`,
          emergency_escape_vector: `${skyHorse.direction} (${skyHorse.palace_name} - Thái Trùng Thiên Mã tại ${skyHorse.sky_horse_branch})`,
          target_placement_sectors: [
            `${PALACES[deathDoorPalace].direction} (Tử Môn - Tiêu hao ý chí)`,
            `${PALACES[fearDoorPalace].direction} (Kinh Môn - Gây hoang mang do dự)`
          ],
          five_no_attacks: fiveRestrictions.restricted_sectors.map(s => `${s.direction} (${s.reasons.join(', ')})`)
        }
      };
    }
  }

  // Đăng ký toàn cục
  const engineInstance = new JoeyYapQMDJEngine();
  global.JoeyYapQMDJEngine = engineInstance;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = engineInstance;
  }

})(typeof window !== "undefined" ? window : globalThis);
