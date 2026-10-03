/**
 * engines/thai_at_fengshui.js
 * ==============================================================================
 * BỘ ĐỘNG CƠ PHONG THỦY THÁI ẤT THẦN KINH TOÀN DIỆN (DƯƠNG TRẠCH & ÂM TRẠCH)
 * TAIYI FENG SHUI SPATIAL ENGINE & ARCHITECTURAL PLANNING SYSTEM
 * ==============================================================================
 * Nền tảng học thuật:
 * - Thái Ất Thần Kinh (16 Thần Vị Địa Bàn & 72 Cục).
 * - La Kinh Vi Phân (120 Phân Kim 3.0° & 72 Xuyên Sơn Long 5.0°).
 * - Ma trận Chồng Lớp Đa Trường Phái: Bát Trạch Minh Cảnh & Huyền Không Vận 9 (2024 - 2043).
 * - Vật lý Kiến trúc, Khí động học Vi khí hậu & Địa kỹ thuật Móng quách (Rule 9 & Rule 12).
 * 
 * Tính năng cốt lõi:
 * 1. 24 Sơn Hướng La Kinh & Đồng Cấu Ánh Xạ 16 Cung Thái Ất (360°).
 * 2. Đạo Chủ - Khách trong Địa lý: Tọa Sơn (Bên Chủ) vs Hướng Nhà (Bên Khách).
 * 3. Định Vị Cát Phương (Thái Ất, Ngũ Phúc, Văn Xương, Thần Hợp) & Đại Sát Phương (Thủy Kích, Kế Thần, Xích Kỳ, Hắc Kỳ).
 * 4. Dương Trạch (Yang Dwellings): 8 Phân khu công năng kiến trúc & 5 Kỹ thuật Vi khí hậu.
 * 5. Âm Trạch (Yin Dwellings): Tứ Thú Sa Bàn, 120 Phân Kim, 72 Xuyên Sơn Long, Chẩn đoán 5 Biến chứng Âm phần & 4 Giải pháp Địa kỹ thuật.
 * 6. Chồng Lớp Đa Trường Phái: Cung Phi Bát Trạch & Huyền Không Phi Tinh Vận 9.
 * 7. Trạch Cát Thái Ất: 12 Thời thần cho 7 sự vụ phong thủy đại sự.
 * 8. Trình Sinh Báo Cáo Học Thuật Toàn Diện (Academic Essay Generator: 8 Tầng Dương Trạch & 9 Tầng Âm Trạch).
 */

(function (global) {
  'use strict';

  // ==============================================================================
  // 1. DỮ LIỆU 24 SƠN HƯỚNG LA KINH & ÁNH XẠ 16 CUNG THÁI ẤT
  // ==============================================================================
  const TWENTY_FOUR_MOUNTAINS = [
    { id: 1,  name: "Nhâm", cung_bat_quai: "Khảm", hanh: "Thủy", deg_min: 337.5, deg_max: 352.5, deg_center: 345.0, thai_at_pos: "Tý",   direction: "Chính Bắc",  polarity: "Dương" },
    { id: 2,  name: "Tý",   cung_bat_quai: "Khảm", hanh: "Thủy", deg_min: 352.5, deg_max: 7.5,   deg_center: 0.0,   thai_at_pos: "Tý",   direction: "Chính Bắc",  polarity: "Âm" },
    { id: 3,  name: "Quý",  cung_bat_quai: "Khảm", hanh: "Thủy", deg_min: 7.5,   deg_max: 22.5,  deg_center: 15.0,  thai_at_pos: "Tý",   direction: "Chính Bắc",  polarity: "Âm" },

    { id: 4,  name: "Sửu",  cung_bat_quai: "Cấn",  hanh: "Thổ",  deg_min: 22.5,  deg_max: 37.5,  deg_center: 30.0,  thai_at_pos: "Sửu",  direction: "Đông Bắc",   polarity: "Âm" },
    { id: 5,  name: "Cấn",  cung_bat_quai: "Cấn",  hanh: "Thổ",  deg_min: 37.5,  deg_max: 52.5,  deg_center: 45.0,  thai_at_pos: "Cấn",  direction: "Đông Bắc",   polarity: "Dương" },
    { id: 6,  name: "Dần",  cung_bat_quai: "Cấn",  hanh: "Mộc",  deg_min: 52.5,  deg_max: 67.5,  deg_center: 60.0,  thai_at_pos: "Dần",  direction: "Đông Bắc",   polarity: "Dương" },

    { id: 7,  name: "Giáp", cung_bat_quai: "Chấn", hanh: "Mộc",  deg_min: 67.5,  deg_max: 82.5,  deg_center: 75.0,  thai_at_pos: "Mão",  direction: "Chính Đông", polarity: "Dương" },
    { id: 8,  name: "Mão",  cung_bat_quai: "Chấn", hanh: "Mộc",  deg_min: 82.5,  deg_max: 97.5,  deg_center: 90.0,  thai_at_pos: "Mão",  direction: "Chính Đông", polarity: "Âm" },
    { id: 9,  name: "Ất",   cung_bat_quai: "Chấn", hanh: "Mộc",  deg_min: 97.5,  deg_max: 112.5, deg_center: 105.0, thai_at_pos: "Mão",  direction: "Chính Đông", polarity: "Âm" },

    { id: 10, name: "Thìn", cung_bat_quai: "Tốn",  hanh: "Thổ",  deg_min: 112.5, deg_max: 127.5, deg_center: 120.0, thai_at_pos: "Thìn", direction: "Đông Nam",   polarity: "Âm" },
    { id: 11, name: "Tốn",  cung_bat_quai: "Tốn",  hanh: "Mộc",  deg_min: 127.5, deg_max: 142.5, deg_center: 135.0, thai_at_pos: "Tốn",  direction: "Đông Nam",   polarity: "Dương" },
    { id: 12, name: "Tỵ",   cung_bat_quai: "Tốn",  hanh: "Hỏa",  deg_min: 142.5, deg_max: 157.5, deg_center: 150.0, thai_at_pos: "Tỵ",   direction: "Đông Nam",   polarity: "Dương" },

    { id: 13, name: "Bính", cung_bat_quai: "Ly",   hanh: "Hỏa",  deg_min: 157.5, deg_max: 172.5, deg_center: 165.0, thai_at_pos: "Ngọ",  direction: "Chính Nam",  polarity: "Dương" },
    { id: 14, name: "Ngọ",  cung_bat_quai: "Ly",   hanh: "Hỏa",  deg_min: 172.5, deg_max: 187.5, deg_center: 180.0, thai_at_pos: "Ngọ",  direction: "Chính Nam",  polarity: "Âm" },
    { id: 15, name: "Đinh", cung_bat_quai: "Ly",   hanh: "Hỏa",  deg_min: 187.5, deg_max: 202.5, deg_center: 195.0, thai_at_pos: "Ngọ",  direction: "Chính Nam",  polarity: "Âm" },

    { id: 16, name: "Mùi",  cung_bat_quai: "Khôn", hanh: "Thổ",  deg_min: 202.5, deg_max: 217.5, deg_center: 210.0, thai_at_pos: "Mùi",  direction: "Tây Nam",    polarity: "Âm" },
    { id: 17, name: "Khôn", cung_bat_quai: "Khôn", hanh: "Thổ",  deg_min: 217.5, deg_max: 232.5, deg_center: 225.0, thai_at_pos: "Khôn", direction: "Tây Nam",    polarity: "Dương" },
    { id: 18, name: "Thân", cung_bat_quai: "Khôn", hanh: "Kim",  deg_min: 232.5, deg_max: 247.5, deg_center: 240.0, thai_at_pos: "Thân", direction: "Tây Nam",    polarity: "Dương" },

    { id: 19, name: "Canh", cung_bat_quai: "Đoài", hanh: "Kim",  deg_min: 247.5, deg_max: 262.5, deg_center: 255.0, thai_at_pos: "Dậu",  direction: "Chính Tây",  polarity: "Dương" },
    { id: 20, name: "Dậu",  cung_bat_quai: "Đoài", hanh: "Kim",  deg_min: 262.5, deg_max: 277.5, deg_center: 270.0, thai_at_pos: "Dậu",  direction: "Chính Tây",  polarity: "Âm" },
    { id: 21, name: "Tân",  cung_bat_quai: "Đoài", hanh: "Kim",  deg_min: 277.5, deg_max: 292.5, deg_center: 285.0, thai_at_pos: "Dậu",  direction: "Chính Tây",  polarity: "Âm" },

    { id: 22, name: "Tuất", cung_bat_quai: "Kiền", hanh: "Thổ",  deg_min: 292.5, deg_max: 307.5, deg_center: 300.0, thai_at_pos: "Tuất", direction: "Tây Bắc",   polarity: "Âm" },
    { id: 23, name: "Kiền", cung_bat_quai: "Kiền", hanh: "Kim",  deg_min: 307.5, deg_max: 322.5, deg_center: 315.0, thai_at_pos: "Kiền", direction: "Tây Bắc",   polarity: "Dương" },
    { id: 24, name: "Hợi",  cung_bat_quai: "Kiền", hanh: "Thủy", deg_min: 322.5, deg_max: 337.5, deg_center: 330.0, thai_at_pos: "Hợi",  direction: "Tây Bắc",   polarity: "Dương" }
  ];

  // 16 Thần vị Thái Ất và bản thể tính chất không gian
  const THAP_LUC_FENGSHUI_NATURE = {
    "Tý":   { huong: "Chính Bắc", lac_thu: 1, hanh: "Thủy", dac_tinh: "Khảm Thủy - Nguồn sinh khí ngầm, bể nước, hướng lạnh, trữ tài" },
    "Sửu":  { huong: "Bắc Đông Bắc", lac_thu: 8, hanh: "Thổ", dac_tinh: "Cấn Thổ sơ khởi - Kho bãi, phòng chứa đồ, độ ổn định" },
    "Cấn":  { huong: "Chính Đông Bắc", lac_thu: 8, hanh: "Thổ", dac_tinh: "Quỷ Môn phong thủy - Vững như núi, thích hợp điểm tựa, kỵ u ám" },
    "Dần":  { huong: "Đông Đông Bắc", lac_thu: 8, hanh: "Mộc", dac_tinh: "Cấn Mộc chuyển tiếp - Sinh khí phát xuất, vườn cây, đón ánh dương" },
    "Mão":  { huong: "Chính Đông", lac_thu: 3, hanh: "Mộc", dac_tinh: "Chấn Lôi - Cửa sổ đón nắng sớm, phòng con trưởng, năng lượng vươn lên" },
    "Thìn": { huong: "Đông Đông Nam", lac_thu: 4, hanh: "Thổ", dac_tinh: "Tốn Thổ - Hồ cảnh quan, giao lưu buôn bán, sự mở rộng" },
    "Tốn":  { huong: "Chính Đông Nam", lac_thu: 4, hanh: "Mộc", dac_tinh: "Phong Môn - Gió mát lành, đón tài lộc thông thương, mở ban công" },
    "Tỵ":   { huong: "Nam Đông Nam", lac_thu: 4, hanh: "Hỏa", dac_tinh: "Tốn Hỏa - Năng lượng nhiệt, bếp nấu phụ, ánh sáng chan hòa" },
    "Ngọ":  { huong: "Chính Nam", lac_thu: 9, hanh: "Hỏa", dac_tinh: "Ly Hỏa - Danh tiếng, sáng sủa, phòng khách, phòng truyền thống" },
    "Mùi":  { huong: "Nam Tây Nam", lac_thu: 2, hanh: "Thổ", dac_tinh: "Khôn Thổ khởi đầu - Ấm cúng, phòng ăn, nơi tụ họp gia đình" },
    "Khôn": { huong: "Chính Tây Nam", lac_thu: 2, hanh: "Thổ", dac_tinh: "Địa Hộ - Mẹ hiền, sự bao dung, phòng ngủ gia chủ nữ, sự tĩnh lặng" },
    "Thân": { huong: "Tây Tây Nam", lac_thu: 2, hanh: "Kim", dac_tinh: "Khôn Kim - Kim loại, trang thiết bị điện tử, sự chuyển dịch" },
    "Dậu":  { huong: "Chính Tây", lac_thu: 7, hanh: "Kim", dac_tinh: "Đoài Khẩu - Cửa đón gió tây, phòng ăn uống tiệc tùng, thu hoạch tài chính" },
    "Tuất": { huong: "Tây Tây Bắc", lac_thu: 6, hanh: "Thổ", dac_tinh: "Kiền Thổ - Bảo vệ, tường rào, an ninh, gara để xe" },
    "Kiền": { huong: "Chính Tây Bắc", lac_thu: 6, hanh: "Kim", dac_tinh: "Thiên Môn - Người cha, uy quyền nguyên thủ, phòng làm việc lãnh đạo" },
    "Hợi":  { huong: "Bắc Tây Bắc", lac_thu: 6, hanh: "Thủy", dac_tinh: "Kiền Thủy - Trí tuệ sâu sắc, phòng đọc sách yên tĩnh, nghiên cứu" }
  };

  const TWENTY_FOUR_MOUNTAINS_ORDER = [
    "Tý", "Quý", "Sửu", "Cấn", "Dần", "Giáp",
    "Mão", "Ất", "Thìn", "Tốn", "Tỵ", "Bính",
    "Ngọ", "Đinh", "Mùi", "Khôn", "Thân", "Canh",
    "Dậu", "Tân", "Tuất", "Kiền", "Hợi", "Nhâm"
  ];

  // 120 Phân Kim Quality Database
  const PHAN_KIM_QUALITY = [
    {
      loai: "Cô Hư (Hung)",
      nguyen_ly: "Khí sơ khai giáp ranh sơn trước, âm dương chưa thuần, khí mạch suy kiệt.",
      danh_gia: "Kỵ đặt tiểu quách; con cháu dễ cô độc, tài sản hư hao."
    },
    {
      loai: "Châu Bảo (Đại Cát)",
      nguyen_ly: "Tiếp nạp Bính/Đinh hỏa khí thông minh, vượng tướng thuần khiết, đắc chân khí mạch sơn.",
      danh_gia: "Đại Cát tuyến độ; phát phúc nhanh chóng, hậu duệ đỗ đạt khoa bảng, gia đạo hưng long."
    },
    {
      loai: "Hỏa Khanh (Đại Hung)",
      nguyen_ly: "Phạm can Mậu/Kỷ thổ sát (Hố lửa ngầm), khí trường trống rỗng, tụ sát khí ngầm ẩm mốc.",
      danh_gia: "Đại Kỵ Tuyệt Đối; dễ gặp biến chứng sụt lún quách, con cháu suy đồi phá sản."
    },
    {
      loai: "Châu Bảo (Đại Cát)",
      nguyen_ly: "Tiếp nạp Canh/Tân kim khí chính trực, vượng khí vững bền, âm đức kết tụ thiên niên.",
      danh_gia: "Đại Cát tuyến độ; vượng tài vượng đinh, con cháu giữ gìn cơ nghiệp bền vững."
    },
    {
      loai: "Sai Thố (Hung)",
      nguyen_ly: "Khí tạp cận kề ranh giới sơn tiếp theo, phạm xuất quẻ lệch hướng.",
      danh_gia: "Không nên dùng; khí mạch lai tạp, con cháu bất hòa, tâm lý bất an."
    }
  ];

  // 72 Xuyên Sơn Long Quality Database
  const XUYEN_SON_LONG_QUALITY = [
    {
      tinh_chat: "Cô Hư Long",
      danh_gia: "Mạch long vào mép sườn sơn, tụ khí yếu, cần đắp thêm sa bàn che chắn."
    },
    {
      tinh_chat: "Châu Bảo Long (Chính Long)",
      danh_gia: "Đắc trung tâm chân mạch của bản sơn; địa khí thấu tủy ấm áp khô ráo, phát phúc trường cửu."
    },
    {
      tinh_chat: "Sai Thố Long",
      danh_gia: "Mạch long bị phân tán sang sơn lân cận, dòng khí không thuần, cần nắn dòng thoát nước."
    }
  ];

  // Ranh giới Đại Không Vong (Bát quái chia 8 góc)
  const DAI_KHONG_VONG_ANGLES = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];

  // ==============================================================================
  // 2. CÔNG CỤ CHUYỂN ĐỔI TỌA ĐỘ LA BÀN & VI PHÂN LA KINH
  // ==============================================================================
  function degreeToMountain(deg) {
    const normDeg = ((deg % 360) + 360) % 360;
    for (let i = 0; i < TWENTY_FOUR_MOUNTAINS.length; i++) {
      const m = TWENTY_FOUR_MOUNTAINS[i];
      const dMin = m.deg_min;
      const dMax = m.deg_max;
      if (dMin > dMax) { // Sơn Tý (352.5° đến 7.5°)
        if (normDeg >= dMin || normDeg < dMax) return m;
      } else {
        if (normDeg >= dMin && normDeg < dMax) return m;
      }
    }
    return TWENTY_FOUR_MOUNTAINS[1]; // Mặc định Tý
  }

  function analyzeDegreeMicro(degree) {
    const deg = ((degree % 360) + 360) % 360;

    // Sơn Tý bắt đầu từ 352.5° đến 7.5°
    const normDeg = (deg + 7.5) % 360.0;
    const mountainIdx = Math.floor(normDeg / 15.0);
    const mountainName = TWENTY_FOUR_MOUNTAINS_ORDER[mountainIdx % 24];

    // Góc tương đối bên trong Sơn (0.0° đến 14.999°)
    const offsetInMountain = normDeg - (mountainIdx * 15.0);

    // 1. Tính toán 120 Phân Kim (3.0° mỗi phân kim)
    const pkSubIdx = Math.min(4, Math.floor(offsetInMountain / 3.0));
    const pkInfo = PHAN_KIM_QUALITY[pkSubIdx];

    const globalPkIdx = Math.floor(deg / 3.0) + 1;
    const pkStart = (globalPkIdx - 1) * 3.0;
    const pkEnd = globalPkIdx * 3.0;
    const pkCenter = pkStart + 1.5;

    const phanKim = {
      index: globalPkIdx,
      degreeStart: pkStart,
      degreeEnd: pkEnd,
      centerDeg: pkCenter,
      canChi: `${mountainName} - Phân kim #${pkSubIdx + 1}`,
      son24: mountainName,
      phanLoai: pkInfo.loai,
      nguyenLy: pkInfo.nguyen_ly,
      danhGiaAmTrach: pkInfo.danh_gia
    };

    // 2. Tính toán 72 Xuyên Sơn Long (5.0° mỗi long)
    const xslSubIdx = Math.min(2, Math.floor(offsetInMountain / 5.0));
    const xslInfo = XUYEN_SON_LONG_QUALITY[xslSubIdx];

    const globalXslIdx = Math.floor(deg / 5.0) + 1;
    const xslStart = (globalXslIdx - 1) * 5.0;
    const xslEnd = globalXslIdx * 5.0;
    const xslCenter = xslStart + 2.5;

    const xuyenSonLong = {
      index: globalXslIdx,
      degreeStart: xslStart,
      degreeEnd: xslEnd,
      centerDeg: xslCenter,
      canChi: `${mountainName} - Long #${xslSubIdx + 1}`,
      son24: mountainName,
      tinhChatLong: xslInfo.tinh_chat,
      nguHanhNapAm: "Thổ Tụ Khí",
      danhGiaThauDia: xslInfo.danh_gia
    };

    // 3. Kiểm tra ranh giới Không Vong (Đại & Tiểu Không Vong)
    const boundaryDistMountain = Math.min(offsetInMountain, 15.0 - offsetInMountain);
    let isDaiKhongVong = false;
    let isTieuKhongVong = false;
    let warningMsg = "Tuyến độ thuần khí an lành, không phạm đường Không Vong.";

    for (let i = 0; i < DAI_KHONG_VONG_ANGLES.length; i++) {
      const b = DAI_KHONG_VONG_ANGLES[i];
      if (Math.abs(deg - b) <= 0.8) {
        isDaiKhongVong = true;
        warningMsg = `CẢNH BÁO ĐẠI KHÔNG VONG: Góc ${deg.toFixed(1)}° nằm quá sát ranh giới quẻ (${b}°). Khí trường biến động dữ dội, âm dương hỗn tạp, tuyệt đối kỵ an táng hạ quách.`;
        break;
      }
    }

    if (!isDaiKhongVong && boundaryDistMountain <= 0.5) {
      isTieuKhongVong = true;
      warningMsg = `CẢNH BÁO TIỂU KHÔNG VONG: Góc ${deg.toFixed(1)}° nằm sát ranh giới 2 sơn liền kề. Dễ sinh hiện tượng xuất quẻ lệch hướng, con cháu dễ nảy sinh phân tâm.`;
    }

    const microDiagnostic = {
      mountain: mountainName,
      offsetInMountain: Math.round(offsetInMountain * 100) / 100,
      isDaiKhongVong: isDaiKhongVong,
      isTieuKhongVong: isTieuKhongVong,
      warning: warningMsg,
      recommendation: (!isDaiKhongVong && !isTieuKhongVong && !phanKim.phanLoai.includes("Hỏa Khanh"))
        ? "Chấp thuận tuyến độ; tiến hành định vị phân kim."
        : `Khuyến nghị vi chỉnh kim la bàn sang khoảng giữa ${(pkStart + 3.0).toFixed(1)}° - ${(pkStart + 6.0).toFixed(1)}° để đón nhận phân kim Châu Bảo.`
    };

    return { phanKim, xuyenSonLong, microDiagnostic };
  }

  // ==============================================================================
  // 3. MA TRẬN CHỒNG LỚP ĐA TRƯỜNG PHÁI: BÁT TRẠCH & HUYỀN KHÔNG VẬN 9
  // ==============================================================================
  const CUNG_PHI_INFO = {
    1: { cung: "Khảm", nhom: "Đông Tứ Mệnh", hanh: "Thủy" },
    2: { cung: "Khôn", nhom: "Tây Tứ Mệnh", hanh: "Thổ" },
    3: { cung: "Chấn", nhom: "Đông Tứ Mệnh", hanh: "Mộc" },
    4: { cung: "Tốn", nhom: "Đông Tứ Mệnh", hanh: "Mộc" },
    6: { cung: "Càn", nhom: "Tây Tứ Mệnh", hanh: "Kim" },
    7: { cung: "Đoài", nhom: "Tây Tứ Mệnh", hanh: "Kim" },
    8: { cung: "Cấn", nhom: "Tây Tứ Mệnh", hanh: "Thổ" },
    9: { cung: "Ly", nhom: "Đông Tứ Mệnh", hanh: "Hỏa" }
  };

  const BAT_TRACH_DU_NIEN = {
    "Khảm": { "Khảm": "Phục Vị", "Chấn": "Thiên Y", "Tốn": "Sinh Khí", "Ly": "Diên Niên", "Càn": "Lục Sát", "Khôn": "Tuyệt Mệnh", "Cấn": "Ngũ Quỷ", "Đoài": "Họa Hại" },
    "Ly":   { "Ly": "Phục Vị", "Chấn": "Sinh Khí", "Tốn": "Thiên Y", "Khảm": "Diên Niên", "Càn": "Tuyệt Mệnh", "Khôn": "Lục Sát", "Cấn": "Họa Hại", "Đoài": "Ngũ Quỷ" },
    "Chấn": { "Chấn": "Phục Vị", "Ly": "Sinh Khí", "Khảm": "Thiên Y", "Tốn": "Diên Niên", "Càn": "Ngũ Quỷ", "Khôn": "Họa Hại", "Cấn": "Lục Sát", "Đoài": "Tuyệt Mệnh" },
    "Tốn":  { "Tốn": "Phục Vị", "Khảm": "Sinh Khí", "Ly": "Thiên Y", "Chấn": "Diên Niên", "Càn": "Họa Hại", "Khôn": "Ngũ Quỷ", "Cấn": "Tuyệt Mệnh", "Đoài": "Lục Sát" },
    "Càn":  { "Càn": "Phục Vị", "Đoài": "Sinh Khí", "Cấn": "Thiên Y", "Khôn": "Diên Niên", "Khảm": "Lục Sát", "Ly": "Tuyệt Mệnh", "Chấn": "Ngũ Quỷ", "Tốn": "Họa Hại" },
    "Khôn": { "Khôn": "Phục Vị", "Cấn": "Sinh Khí", "Càn": "Diên Niên", "Đoài": "Thiên Y", "Khảm": "Tuyệt Mệnh", "Ly": "Lục Sát", "Chấn": "Họa Hại", "Tốn": "Ngũ Quỷ" },
    "Cấn":  { "Cấn": "Phục Vị", "Khôn": "Sinh Khí", "Đoài": "Diên Niên", "Càn": "Thiên Y", "Khảm": "Ngũ Quỷ", "Ly": "Họa Hại", "Chấn": "Lục Sát", "Tốn": "Tuyệt Mệnh" },
    "Đoài": { "Đoài": "Phục Vị", "Càn": "Sinh Khí", "Cấn": "Diên Niên", "Khôn": "Thiên Y", "Khảm": "Họa Hại", "Ly": "Ngũ Quỷ", "Chấn": "Tuyệt Mệnh", "Tốn": "Lục Sát" }
  };

  const VAN_9_BASE_STARS = {
    "Khảm": { van: 5, tinh_chat: "Ngũ Hoàng Đại Sát", note: "Cung Khảm trong Vận 9 gặp sao Ngũ Hoàng nhập; kỵ động thổ lớn, kỵ mở cửa chính nếu không có hóa giải." },
    "Khôn": { van: 6, tinh_chat: "Lục Bạch Vũ Khúc", note: "Sao quyền uy, hành Kim; thuận lợi cho quan vận, quản lý." },
    "Chấn": { van: 7, tinh_chat: "Thất Xích Phá Quân", note: "Sao thoái khí; đề phòng tranh chấp khẩu thiệt hoặc mất mát nhỏ." },
    "Tốn":  { van: 8, tinh_chat: "Bát Bạch Tả Phù", note: "Sao vừa qua vận; tụ tài ổn định nhưng chậm dần." },
    "Trung": { van: 9, tinh_chat: "Cửu Tử Đương Lệnh", note: "Trung tâm điều phối vượng khí Hỏa của Vận 9." },
    "Càn":  { van: 1, tinh_chat: "Nhất Bạch Tiến Khí", note: "Sinh khí tương lai (Vận 1), đại cát cho văn chương trí tuệ, cơ hội mới." },
    "Đoài": { van: 2, tinh_chat: "Nhị Hắc Bệnh Phù", note: "Hung sát chủ bệnh tật; cần giữ thông thoáng, tránh để nước tù đọng ẩm mốc." },
    "Cấn":  { van: 3, tinh_chat: "Tam Bích Thị Phi", note: "Sao thị phi khẩu thiệt hành Mộc; cần bình hòa ánh sáng." },
    "Ly":   { van: 4, tinh_chat: "Tứ Lục Văn Khúc", note: "Sao học hành, nghệ thuật; có lợi cho sáng tạo và danh tiếng." }
  };

  function calculateBatTrach(birthYear, gender, facingBagua) {
    let year = parseInt(birthYear, 10);
    if (isNaN(year) || year < 1900 || year > 2100) year = 1990;

    const yearStr = String(year);
    let sumDigits = 0;
    for (let i = 0; i < yearStr.length; i++) sumDigits += parseInt(yearStr[i], 10);
    let rem = sumDigits % 9;
    if (rem === 0) rem = 9;

    const isMale = String(gender).toLowerCase().includes("nam");
    let val = 1;
    if (isMale) {
      val = (11 - rem) % 9;
      if (val === 0) val = 9;
      if (val === 5) val = 2; // Nam 5 -> Khôn
    } else {
      val = (rem + 4) % 9;
      if (val === 0) val = 9;
      if (val === 5) val = 8; // Nữ 5 -> Cấn
    }

    const profile = CUNG_PHI_INFO[val] || CUNG_PHI_INFO[1];
    const cungMenh = profile.cung;
    const nhom = profile.nhom;
    const hanh = profile.hanh;

    let fb = facingBagua;
    if (fb === "Kiền") fb = "Càn";
    if (!BAT_TRACH_DU_NIEN[cungMenh]) fb = "Ly";

    const duNien = BAT_TRACH_DU_NIEN[cungMenh][fb] || "Phục Vị";

    const allDirs = BAT_TRACH_DU_NIEN[cungMenh];
    const catDirs = [];
    const hungDirs = [];
    for (const k in allDirs) {
      const dn = allDirs[k];
      if (["Sinh Khí", "Thiên Y", "Diên Niên", "Phục Vị"].includes(dn)) catDirs.push(`${k} (${dn})`);
      else hungDirs.push(`${k} (${dn})`);
    }

    const scoreMap = {
      "Sinh Khí": 95, "Diên Niên": 90, "Thiên Y": 88, "Phục Vị": 80,
      "Họa Hại": 55, "Lục Sát": 45, "Ngũ Quỷ": 35, "Tuyệt Mệnh": 25
    };
    const score = scoreMap[duNien] || 70;

    let danhGia = "";
    if (score >= 80) {
      danhGia = `Gia chủ mệnh ${cungMenh} (${nhom}) hợp hướng nhà ${fb} (Đắc ${duNien} - Cát Trạch Đại Lợi).`;
    } else {
      danhGia = `Gia chủ mệnh ${cungMenh} (${nhom}) nghịch hướng nhà ${fb} (Phạm ${duNien} - Cần áp dụng Bếp và Cửa phụ để thông quan).`;
    }

    return {
      birthYear: year,
      gender: isMale ? "Nam" : "Nữ",
      cungMenh: cungMenh,
      nhomMenh: nhom,
      nguHanhMenh: hanh,
      bonHuongCat: catDirs,
      bonHuongHung: hungDirs,
      duNienHuongNha: duNien,
      danhGiaHoaHop: danhGia,
      diemHoaHopMenh: score
    };
  }

  function fuseWithTaiyi(taiyiCungMap, facingDeg, birthYear, gender) {
    const mountain = degreeToMountain(facingDeg);
    let baguaFacing = mountain.cung_bat_quai;
    if (baguaFacing === "Kiền") baguaFacing = "Càn";

    let batTrachProf = null;
    if (birthYear && gender) {
      batTrachProf = calculateBatTrach(birthYear, gender, baguaFacing);
    }

    const hkPalaces = {};
    for (const bg in VAN_9_BASE_STARS) {
      if (bg === "Trung") continue;
      const info = VAN_9_BASE_STARS[bg];
      hkPalaces[bg] = {
        cungName: bg,
        saoVan: info.van,
        saoToaSon: 9,
        saoHuongTinh: info.van,
        tinhChatVan9: info.tinh_chat,
        khuyenNghiKienTruc: info.note
      };
    }

    const interactions = [];
    const taPos = taiyiCungMap.thai_at || "";
    const tkPos = taiyiCungMap.thuy_kich || "";

    if (["Càn", "Kiền", "Ly"].includes(taPos)) {
      interactions.push({
        hangMuc: `Thái Ất Vương Khí tại Cung ${taPos}`,
        tuongTac: "SONG CÁT TRÙNG PHÙNG: Vương khí Thái Ất hội ngộ sao Đương Lệnh/Tiến Khí của Vận 9 (Cửu Tử / Nhất Bạch). Năng lượng phát triển rực rỡ, thích hợp bố trí phòng khách hoặc sảnh chính."
      });
    } else {
      interactions.push({
        hangMuc: `Thái Ất Vương Khí tại Cung ${taPos}`,
        tuongTac: `Vương khí Thái Ất ngự phương ${taPos}; phối hợp với sao Vận tạo khí trường ổn định tích cực.`
      });
    }

    if (tkPos === "Khảm") {
      interactions.push({
        hangMuc: `Thủy Kích Đại Sát tại Cung ${tkPos}`,
        tuongTac: "CỰC KỲ NGUY HIỂM (ĐẠI SÁT KÉP): Cung Khảm đồng thời phạm Thủy Kích Thái Ất và sao Ngũ Hoàng Đại Sát của Vận 9. Tuyệt đối không trổ cửa, không đặt ban thờ; nên dùng làm khu phụ uế khí hoặc đặt tường ngăn kiên cố."
      });
    } else if (tkPos === "Đoài") {
      interactions.push({
        hangMuc: `Thủy Kích Đại Sát tại Cung ${tkPos}`,
        tuongTac: "CẢNH BÁO BỆNH PHÙ SÁT: Cung Đoài gặp Thủy Kích trùng phùng sao Nhị Hắc Bệnh Phù. Cần giữ không gian khô ráo, tránh ẩm thấp gây bệnh về đường hô hấp."
      });
    } else {
      interactions.push({
        hangMuc: `Thủy Kích Đại Sát tại Cung ${tkPos}`,
        tuongTac: `Phương ${tkPos} gặp Thủy Kích sát khí; cần áp dụng nguyên lý 'Dĩ độc trị độc' hoặc trồng mảng xanh che chắn.`
      });
    }

    const conclusions = [];
    conclusions.push("Hạ Nguyên Vận 9 (2024 - 2043) đề cao phương Nam (Ly - Cửu Tử) và phương Bắc/Tây Bắc (Càn - Nhất Bạch).");
    if (batTrachProf) {
      conclusions.push(`Về Nhân Khí: Gia chủ mệnh ${batTrachProf.cungMenh} (${batTrachProf.duNienHuongNha}) đạt ${batTrachProf.diemHoaHopMenh}/100 điểm hòa hợp với ngôi nhà.`);
    }
    conclusions.push("Sự kết hợp đồng quy giữa Thái Ất - Huyền Không Vận 9 - Bát Trạch tạo nên giải pháp bố cục toàn diện, dung hòa giữa Thiên Thời, Địa Lợi và Nhân Hòa.");

    return {
      vanHuyenKhong: "Hạ Nguyên Vận 9 (2024 - 2043) - Cửu Tử Hỏa Tinh Nhập Trung Cung",
      batTrach: batTrachProf,
      huyenKhongZoning: hkPalaces,
      tuongTacThaiAtHuyenKhong: interactions,
      ketLuanDaTruongPhai: conclusions.join(" ")
    };
  }

  // ==============================================================================
  // 4. ĐỘNG CƠ DƯƠNG TRẠCH (YANG DWELLINGS ENGINE)
  // ==============================================================================
  function assessDuongTrach(chart, sittingDeg, propertyType, targetKe, birthYear, gender) {
    const pType = propertyType || "Nhà phố";
    const keMode = targetKe || "Kể Giờ";
    const ke = (keMode === "Kể Giờ" && chart && chart.ke_gio) ? chart.ke_gio : (chart ? chart.ke_nam : null);

    const sDeg = ((sittingDeg % 360) + 360) % 360;
    const fDeg = (sDeg + 180.0) % 360.0;

    const sittingM = degreeToMountain(sDeg);
    const facingM = degreeToMountain(fDeg);

    const sCung = sittingM.thai_at_pos;
    const fCung = facingM.thai_at_pos;

    // Trích xuất thần sát và toán
    let schu = 24;
    let skhach = 22;
    let taPos = "Ngọ";
    let vxPos = "Mão";
    let tkPos = "Tý";
    let ktPos = "Dần";
    let npPos = "Dậu";
    let thPos = "Sửu";

    if (ke) {
      schu = ke.toan_chu || 20;
      skhach = ke.toan_khach || 20;
      taPos = ke.thai_at_pos || "Ngọ";
      vxPos = ke.van_xuong_pos || "Mão";
      tkPos = ke.thuy_kich_pos || "Tý";
      ktPos = ke.ke_than_pos || "Dần";
      if (ke.stars) {
        npPos = ke.stars["Ngũ Phúc"] || "Dậu";
        thPos = ke.stars["Thần Hợp"] || "Sửu";
      }
    }

    const healthScore = Math.min(98, Math.max(20, Math.floor(schu * 2.8)));
    const wealthScore = Math.min(98, Math.max(20, Math.floor(skhach * 2.4)));

    let theTran = "";
    let luanDoan = "";
    let baseTotal = 62;

    if (schu >= 20 && skhach >= 20) {
      theTran = "TỌA HƯỚNG ĐỒNG CƯỜNG (Nhân Khang Vật Thịnh)";
      luanDoan = "Gia đạo vững chắc như bàn thạch, người trong nhà khỏe mạnh trường thọ; kinh doanh buôn bán đón sinh khí cực thịnh, dòng tiền luân chuyển dồi dào.";
      baseTotal = 90;
    } else if (schu >= 20 && skhach < 10) {
      theTran = "TỌA CƯỜNG HƯỚNG NHƯỢC (Gia Đạo Yên Vui, Chậm Dòng Tiền)";
      luanDoan = "Nền tảng sức khỏe và sự gắn kết gia đình rất tốt, con cháu ngoan ngoãn; tuy nhiên cơ hội làm ăn từ ngoài vào chưa thông suốt, cần mở rộng cửa chính hoặc làm hồ nước minh đường để hút tài.";
      baseTotal = 74;
    } else if (skhach >= 20 && schu < 10) {
      theTran = "HƯỚNG CƯỜNG TỌA NHƯỢC (Tài Lộc Dồi Dào, Lao Lực Thân Thể)";
      luanDoan = "Cơ hội kinh doanh kiếm tiền rất tốt, giao thiệp rộng; tuy nhiên gia chủ hay phải bôn ba lao lực, lưng nhà cần gia cố chắc chắn để bảo vệ sức khỏe và giấc ngủ.";
      baseTotal = 70;
    } else {
      theTran = "TỌA HƯỚNG BÌNH HÒA";
      luanDoan = "Khí trường bình ổn, không xung đột lớn; nên chú trọng vào việc bố trí nội thất khoa học để kích hoạt thêm sinh khí.";
      baseTotal = 62;
    }

    if (sCung === tkPos) {
      baseTotal -= 20;
      luanDoan += " [CẢNH BÁO: Tọa sơn bị Thủy Kích chiếu trực diện, cần dùng giải pháp trấn thạch cản sát lưng nhà!]";
    }
    if (fCung === tkPos) {
      baseTotal -= 15;
      luanDoan += " [CẢNH BÁO: Cửa chính gặp Thủy Kích, đề phòng tranh chấp khẩu thiệt bên ngoài!]";
    }

    const totalScore = Math.max(20, Math.min(98, baseTotal));

    // 8 Phân khu công năng kiến trúc chuyên biệt theo từng loại hình bất động sản
    const zoningList = [];

    const congCung = (taPos !== tkPos) ? taPos : ((npPos !== tkPos) ? npPos : "Ngọ");
    const thoCung = ("Kiền" !== tkPos) ? "Kiền" : ((taPos !== tkPos) ? taPos : "Cấn");
    const bepCung = ("Tỵ" !== tkPos) ? "Tỵ" : (("Mùi" !== tkPos) ? "Mùi" : "Dần");
    const nguCung = (thPos !== tkPos) ? thPos : ((npPos !== tkPos) ? npPos : "Khôn");
    const ketCung = (npPos !== tkPos) ? npPos : (("Dậu" !== tkPos) ? "Dậu" : "Thìn");
    const hocCung = (vxPos !== tkPos) ? vxPos : (("Mão" !== tkPos) ? "Mão" : "Hợi");
    const thangCung = ("Tốn" !== tkPos) ? "Tốn" : (("Cấn" !== tkPos) ? "Cấn" : "Thìn");
    const wcCung = tkPos;

    if (pType === "Căn hộ chung cư") {
      zoningList.push({
        tenKhuVuc: "1. Cửa Đi Chính & Sảnh Đệm Căn Hộ (Khí Khẩu Nạp Khí Độc Lập)",
        cungThaiAt: congCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[congCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[congCung].hanh,
        trangThaiKhi: "Đại Cát (Khí Khẩu Căn Hộ)",
        nguyenLyDichHoc: "Đón nhận vương khí Thái Ất hoặc Ngũ Phúc từ hành lang tòa nhà vào căn hộ, tạo khoảng đệm thanh lọc trước khi vào phòng khách.",
        chucNangPhuHop: "Cửa đi chính căn hộ, Sảnh đệm Huyền quan (Foyer), Tủ để giày dép khử khuẩn",
        giaiPhapKienTruc: "Cửa chính chống cháy cách âm tốt; khoảng đệm sảnh ốp đá sạch sẽ, đèn rọi ấm áp; bố trí vách đệm nhẹ hoặc tủ trang trí để tránh cửa chính nhìn xuyên suốt ra ban công (xuyên đường sát)."
      });
      zoningList.push({
        tenKhuVuc: "2. Bàn Thờ Gia Tiên Căn Hộ (Tâm Linh Trang Nghiêm)",
        cungThaiAt: thoCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[thoCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[thoCung].hanh,
        trangThaiKhi: "Đại Cát (Tôn Nghiêm)",
        nguyenLyDichHoc: "Tọa tại Thiên Môn (Kiền) hoặc phương vị vương khí để tích tụ phúc ấm gia đình; tránh tạp khí ô uế.",
        chucNangPhuHop: "Bàn thờ treo tường trang trọng hoặc Tủ thờ vách ngăn CNC phòng khách",
        giaiPhapKienTruc: "Bố trí tại không gian phòng khách trang trọng; tựa lưng tường đặc vững chãi, KHÔNG tựa vách buồng tắm vệ sinh; gắn tấm chắn khói mica hoặc gỗ CNC hoa văn ngăn khói hương ám ố trần thạch cao; đèn hắt ánh sáng vàng ấm."
      });
      zoningList.push({
        tenKhuVuc: "3. Bếp Nấu & Logia Thoát Khí Căn Hộ (Hỏa Khí Dưỡng Sinh)",
        cungThaiAt: bepCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[bepCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[bepCung].hanh,
        trangThaiKhi: "Cát (Tọa Hung Hướng Cát)",
        nguyenLyDichHoc: "Hỏa lò thiêu đốt tạp khí, dưỡng sinh dưỡng khí cho cả gia đình; kiêng đặt tại phương Thủy Kích sát.",
        chucNangPhuHop: "Bếp từ / Bếp điện âm, Máy hút mùi, Tủ bếp chữ I/L, Cửa thông ra logia phụ",
        giaiPhapKienTruc: "Trang bị máy hút mùi công suất lớn (>= 750 m³/h) dẫn ống xả thẳng ra logia ngoài trời; giữ khoảng cách giữa bếp và bồn rửa tối thiểu 60cm; tránh bếp nhìn thẳng cửa chính căn hộ."
      });
      zoningList.push({
        tenKhuVuc: "4. Phòng Ngủ Master Căn Hộ (Tái Tạo Năng Lượng & Gia Đạo)",
        cungThaiAt: nguCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[nguCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[nguCung].hanh,
        trangThaiKhi: "Hòa Hợp Đại Cát",
        nguyenLyDichHoc: "Thần Hợp và Ngũ Phúc bảo trợ giúp tinh thần tĩnh tại, giấc ngủ sâu, vợ chồng thắm thiết thuận hòa.",
        chucNangPhuHop: "Phòng ngủ Master chủ hộ, Giường đôi bọc đệm êm ái",
        giaiPhapKienTruc: "Đầu giường tựa sát tường gạch đặc, không kê giường áp sát vách phòng tắm master; cửa sổ dùng kính hộp Low-E 2 lớp cách âm chống ồn đô thị; rèm cản sáng 2 lớp."
      });
      zoningList.push({
        tenKhuVuc: "5. Két Sắt & Tủ Tài Liệu Căn Hộ (Tụ Tài Bảo Bồn)",
        cungThaiAt: ketCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[ketCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[ketCung].hanh,
        trangThaiKhi: "Vượng Tài Lộc",
        nguyenLyDichHoc: "Ngũ Phúc tụ tài, tích lũy tài chính căn hộ vững bền, phòng ngừa hao tổn thất thoát.",
        chucNangPhuHop: "Két sắt gia đình, Tủ cất giữ giấy tờ sổ hồng căn hộ và tài sản quý",
        giaiPhapKienTruc: "Đặt ở góc kín đáo tụ khí trong tủ quần áo âm tường phòng Master; tránh gió lùa trực diện từ cửa sổ hoặc cửa ban công."
      });
      zoningList.push({
        tenKhuVuc: "6. Góc Làm Việc & Bàn Học Căn Hộ (Văn Xương Tri Thức WFH)",
        cungThaiAt: hocCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[hocCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[hocCung].hanh,
        trangThaiKhi: "Cát Vị Văn Tinh",
        nguyenLyDichHoc: "Văn Xương Thiên Mục chủ về tư duy mẫn tiệp, học hành thông tuệ, làm việc từ xa (WFH) thăng tiến.",
        chucNangPhuHop: "Bàn làm việc WFH, Bàn học con cái, Giá sách treo tường thông minh",
        giaiPhapKienTruc: "Tận dụng ánh sáng tự nhiên dịu mát gần cửa sổ phòng ngủ phụ; sau lưng có vách tường tựa vững chắc; tránh hướng gió lạnh điều hòa phả thẳng vào gáy."
      });
      zoningList.push({
        tenKhuVuc: "7. Ban Công & Logia Phòng Khách (Trục Đối Lưu & Sinh Khí Căn Hộ)",
        cungThaiAt: thangCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[thangCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[thangCung].hanh,
        trangThaiKhi: "Bình Hòa Khí Động",
        nguyenLyDichHoc: "Khí đạo nạp quang minh và dưỡng khí trời đất chủ lực cho toàn bộ mặt sàn căn hộ.",
        chucNangPhuHop: "Ban công phòng khách, Logia đón gió, Tiểu cảnh cây xanh, Cửa trượt kính",
        giaiPhapKienTruc: "Cửa lùa kính khổ lớn tối ưu đối lưu gió tươi; trồng chậu cây xanh lọc bụi (lưỡi hổ, trúc mây); lắp lưới an toàn tàng hình bảo vệ ban công đạt chuẩn; phễu thoát sàn chống nghẹt lá cây."
      });
      zoningList.push({
        tenKhuVuc: "8. Nhà Vệ Sinh Căn Hộ & Hộp Gen Kỹ Thuật (Ép Chế Khí Hung & Chống Mùi Tòa Nhà)",
        cungThaiAt: wcCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[wcCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[wcCung].hanh,
        trangThaiKhi: "Cần Ép Chế (Dĩ Độc Trị Độc)",
        nguyenLyDichHoc: "'Dĩ độc trị độc' - Đặt công trình phụ tại cung có Thủy Kích hung sát để đè nén tạp uế, bảo vệ các cung cát lợi của căn hộ.",
        chucNangPhuHop: "Phòng tắm, WC master, WC chung căn hộ, Trục đứng hộp gen kỹ thuật tòa nhà",
        giaiPhapKienTruc: "Lắp phễu thu sàn có xi-phông bẫy nước ngăn tuyệt đối mùi hôi và khí trào ngược từ trục kỹ thuật tòa nhà; quạt hút mùi âm trần van 1 chiều thổi ra hộp gen; chống thấm kỹ chân tường và cổ ống thoát sàn."
      });
    } else if (pType === "Văn phòng công ty") {
      zoningList.push({
        tenKhuVuc: "1. Cửa Đi Chính & Sảnh Lễ Tân (Khí Khẩu Tiếp Khách & Bộ Mặt Công Ty)",
        cungThaiAt: congCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[congCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[congCung].hanh,
        trangThaiKhi: "Đại Cát (Khí Khẩu Doanh Nghiệp)",
        nguyenLyDichHoc: "Đón nhận vương khí Thái Ất hoặc Ngũ Phúc, gia tăng uy tín thương hiệu, thu hút đối tác và hợp đồng lớn.",
        chucNangPhuHop: "Cửa kính tự động, Quầy lễ tân, Backdrop logo công ty, Khu tiếp khách nhanh",
        giaiPhapKienTruc: "Sảnh đón rộng thoáng sáng sủa; không gian lối vào không bị chướng ngại vật; thảm đón khách màu trang nhã; đèn chiếu sáng ánh sáng ấm sang trọng."
      });
      zoningList.push({
        tenKhuVuc: "2. Bàn Thờ Thần Tài - Thổ Địa Văn Phòng (Chiêu Tài Vượng Khí Doanh Nghiệp)",
        cungThaiAt: thoCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[thoCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[thoCung].hanh,
        trangThaiKhi: "Đại Cát (Chiêu Tài Tụ Khí)",
        nguyenLyDichHoc: "Tọa tại cung vị cát lợi, hướng ra luồng khách và luồng giao dịch để kích hoạt tài lộc buôn may bán đắt.",
        chucNangPhuHop: "Bàn thờ Thần Tài - Thổ Địa tại sảnh lễ tân hoặc tầng trệt văn phòng",
        giaiPhapKienTruc: "Đặt áp sát vách tường kiên cố, hướng nhìn chéo ra cửa chính văn phòng; luôn thắp đèn sáng ấm cúng, giữ gìn sạch sẽ tinh tươm; tuyệt đối không đặt cạnh lối đi vào WC văn phòng."
      });
      zoningList.push({
        tenKhuVuc: "3. Khu Pantry & Bếp Nghỉ Nhân Viên (Khu Năng Lượng Đời Sống Doanh Nghiệp)",
        cungThaiAt: bepCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[bepCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[bepCung].hanh,
        trangThaiKhi: "Cát (Dưỡng Khí Nội Bộ)",
        nguyenLyDichHoc: "Hỏa khí dưỡng sinh duy trì năng lượng tích cực và sự gắn kết thân thiện giữa các bộ phận nhân sự công ty.",
        chucNangPhuHop: "Khu pha chế cà phê, Máy nước nóng lạnh, Lò vi sóng, Bàn ăn nhẹ, Bồn rửa ly tách",
        giaiPhapKienTruc: "Bố trí gọn gàng, tủ kệ chống ẩm; bồn rửa có bẫy mỡ cục bộ; quạt hút thông gió riêng chống mùi thức ăn lan sang không gian làm việc; thùng rác phân loại có nắp đậy kín."
      });
      zoningList.push({
        tenKhuVuc: "4. Phòng Lãnh Đạo & Bàn Chủ Tịch / Giám Đốc (Bộ Chỉ Huy Chiến Lược Doanh Nghiệp)",
        cungThaiAt: nguCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[nguCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[nguCung].hanh,
        trangThaiKhi: "Quý Nhân Hội Tụ Đại Cát",
        nguyenLyDichHoc: "Thần Hợp và quý tinh bảo trợ tâm trí quyết đoán, lãnh đạo sáng suốt, củng cố quyền uy và thu phục nhân tâm.",
        chucNangPhuHop: "Bàn làm việc Chủ tịch HĐQT / Tổng Giám đốc, Phòng tiếp khách VIP",
        giaiPhapKienTruc: "Bàn làm việc ngồi tựa lưng vào tường đặc vững chãi, không ngồi quay lưng ra cửa sổ hoặc cửa vào; không bị dầm xà ngang đè lên đầu bàn; bố trí ghế khách đối diện lịch sự."
      });
      zoningList.push({
        tenKhuVuc: "5. Phòng Kế Toán & Két Sắt Tài Chính (Tụ Tài Thủ Khố Công Ty)",
        cungThaiAt: ketCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[ketCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[ketCung].hanh,
        trangThaiKhi: "Vượng Tài Thủ Khố",
        nguyenLyDichHoc: "Ngũ Phúc tụ tài, kiểm soát chặt chẽ dòng tiền lưu thông, bảo vệ ngân quỹ doanh nghiệp vững bền.",
        chucNangPhuHop: "Phòng Kế toán trưởng, Thủ quỹ, Két sắt lưu trữ ngân quỹ và con dấu công ty",
        giaiPhapKienTruc: "Phòng kín đáo, tường cách âm bảo mật thông tin; két sắt đặt tại góc khuất tài vị; kiểm soát cửa ra vào bằng khóa thẻ từ / vân tay và camera an ninh độc lập."
      });
      zoningList.push({
        tenKhuVuc: "6. Không Gian Làm Việc Mở & Phòng Họp R&D (Trí Tuệ & Sáng Tạo Đột Phá)",
        cungThaiAt: hocCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[hocCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[hocCung].hanh,
        trangThaiKhi: "Cát Vị Văn Tinh",
        nguyenLyDichHoc: "Cung Văn Xương Thiên Mục chủ về tư duy đột phá, sáng tạo chiến lược kinh doanh mới, phối hợp nhóm hiệu quả cao.",
        chucNangPhuHop: "Khu bàn làm việc nhân viên, Phòng họp Brainstorming, Phòng nghiên cứu phát triển (R&D)",
        giaiPhapKienTruc: "Tối ưu ánh sáng tự nhiên với hệ vách kính lớn; vách kính viết bảng tương tác; tiêu âm chống vang vọng âm thanh; trang bị bàn ghế công thái học bảo vệ sức khỏe nhân viên."
      });
      zoningList.push({
        tenKhuVuc: "7. Trục Thang Máy, Hành Lang & Thoát Nạn PCCC (Huyết Mạch Giao Thông Văn Phòng)",
        cungThaiAt: thangCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[thangCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[thangCung].hanh,
        trangThaiKhi: "Bình Hòa Khí Động",
        nguyenLyDichHoc: "Động tuyến lưu chuyển sinh khí xuyên suốt các tầng công ty; giữ thông suốt để vận hành hanh thông.",
        chucNangPhuHop: "Sảnh thang máy, Thang bộ thoát hiểm PCCC, Hành lang giao thông trục chính",
        giaiPhapKienTruc: "Cửa thoát hiểm chống cháy có thanh đẩy panic đạt chuẩn PCCC; hành lang rộng tối thiểu 1.4m không để thùng hàng che chắn lối đi; đèn Exit chỉ dẫn thoát nạn chiếu sáng sự cố 24/7."
      });
      zoningList.push({
        tenKhuVuc: "8. Cụm Nhà Vệ Sinh & Phòng Kỹ Thuật Server (Ép Chế Khí Uế & An Ninh Hạ Tầng)",
        cungThaiAt: wcCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[wcCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[wcCung].hanh,
        trangThaiKhi: "Cần Ép Chế (Dĩ Độc Trị Độc)",
        nguyenLyDichHoc: "'Dĩ độc trị độc' - Đặt cụm WC và hệ thống kỹ thuật tỏa nhiệt server tại cung Thủy Kích để triệt tiêu năng lượng hung sát.",
        chucNangPhuHop: "Cụm WC văn phòng nam/nữ riêng biệt, Phòng máy chủ server, Kho kỹ thuật IT",
        giaiPhapKienTruc: "Khu WC có quạt hút mùi công nghiệp hoạt động 24/7; cửa tự đóng chống tràn tạp khí; phòng Server có điều hòa nhiệt độ thấp độc lập và hệ thống chữa cháy khí sạch FM200/Novec1230."
      });
    } else if (pType === "Nhà xưởng sản xuất") {
      zoningList.push({
        tenKhuVuc: "1. Cổng Chính & Khu Nhập Xuất Hàng (Cổng Khí Khẩu & Dock Vận Tải Nhà Máy)",
        cungThaiAt: congCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[congCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[congCung].hanh,
        trangThaiKhi: "Đại Cát (Khí Khẩu Sản Xuất)",
        nguyenLyDichHoc: "Khí khẩu nạp năng lượng công nghiệp và đón dòng hàng hóa lưu thông tấp nập, đắc Thái Ất vương thịnh.",
        chucNangPhuHop: "Cổng xe container, Bến dock xuất nhập hàng, Trạm cân xe tải, Phòng bảo vệ an ninh",
        giaiPhapKienTruc: "Bán kính quay xe tải rộng rãi (>= 12m); mái che bến dock chống mưa bão; mặt đường bê tông cốt thép chịu tải trọng nặng; đèn cao áp chiếu sáng an ninh ban đêm."
      });
      zoningList.push({
        tenKhuVuc: "2. Bàn Thờ Tiền Chủ & Thần Tài Nhà Xưởng (Trấn Trạch Bình An & Tụ Phúc Công Nghiệp)",
        cungThaiAt: thoCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[thoCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[thoCung].hanh,
        trangThaiKhi: "Đại Cát (Trấn Trạch An Ninh)",
        nguyenLyDichHoc: "Giữ gìn an ninh trật tự tâm linh, cầu mong sản xuất thuận buồm xuôi gió, không xảy ra tai nạn lao động hay hỏa hoạn.",
        chucNangPhuHop: "Bàn thờ Thần Tài / Ban thờ Thổ Công nhà xưởng đặt tại khối văn phòng điều hành xưởng",
        giaiPhapKienTruc: "Đặt ở nơi cao ráo sạch sẽ của khối văn phòng nhà xưởng; tránh xa khu vực máy móc phát ra tiếng ồn rung lắc lớn hoặc khói bụi sản xuất."
      });
      zoningList.push({
        tenKhuVuc: "3. Bếp Ăn & Căng-tin Nhà Máy (Hỏa Khí Nuôi Dưỡng Thể Lực Lao Động)",
        cungThaiAt: bepCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[bepCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[bepCung].hanh,
        trangThaiKhi: "Cát (Dưỡng Thể Tái Tạo)",
        nguyenLyDichHoc: "Hỏa khí ấm no, duy trì sức lao động bền bỉ cho toàn thể kỹ sư và công nhân viên nhà máy.",
        chucNangPhuHop: "Nhà ăn tập thể công nhân, Bếp nấu công nghiệp một chiều, Kho thực phẩm lạnh",
        giaiPhapKienTruc: "Bố trí theo quy trình bếp ăn công nghiệp 1 chiều đạt chuẩn VSATTP; chụp hút khói inox công nghiệp dẫn ống cao qua mái xưởng; rãnh thoát nước có hố bẫy mỡ tự động; sàn chống trơn trượt."
      });
      zoningList.push({
        tenKhuVuc: "4. Văn Phòng Điều Hành & Bàn Làm Việc Quản Đốc (Trung Tâm Kiểm Soát Sản Xuất)",
        cungThaiAt: nguCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[nguCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[nguCung].hanh,
        trangThaiKhi: "Quý Nhân Chỉ Huy Đại Cát",
        nguyenLyDichHoc: "Quý tinh hội tụ giúp chỉ huy quyết đoán, kiểm soát chặt chẽ tiến độ đơn hàng và kỷ luật phân xưởng.",
        chucNangPhuHop: "Phòng Giám đốc nhà máy, Bàn làm việc Quản đốc phân xưởng, Màn hình giám sát SCADA",
        giaiPhapKienTruc: "Vách kính cường lực cách âm chống ồn công nghiệp, tạo góc nhìn bao quát toàn bộ dây chuyền sản xuất bên dưới; bàn quản đốc tựa lưng vách vững chắc, điều hòa nhiệt độ thoải mái."
      });
      zoningList.push({
        tenKhuVuc: "5. Kho Thành Phẩm & Thủ Quỹ Phân Xưởng (Kho Tụ Tài & Hàng Hóa Giá Trị)",
        cungThaiAt: ketCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[ketCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[ketCung].hanh,
        trangThaiKhi: "Vượng Tài Thủ Kho",
        nguyenLyDichHoc: "Ngũ Phúc tụ tài, tích lũy giá trị thặng dư sau quy trình sản xuất, chống hao hụt thất thoát hàng hóa.",
        chucNangPhuHop: "Kho chứa hàng thành phẩm chuẩn bị xuất xưởng, Phòng thủ quỹ thanh toán tạm ứng",
        giaiPhapKienTruc: "Hệ thống giá kệ pallet nhiều tầng vững chắc; sàn xoa nền tăng cứng hardener chịu mài mòn; camera an ninh bao quát; hệ thống chữa cháy tự động Sprinkler theo tiêu chuẩn TCVN."
      });
      zoningList.push({
        tenKhuVuc: "6. Phòng Thí Nghiệm, KCS & Kiểm Soát Chất Lượng (Khoa Bảng Kỹ Thuật Đạt Chuẩn)",
        cungThaiAt: hocCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[hocCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[hocCung].hanh,
        trangThaiKhi: "Cát Vị Văn Tinh",
        nguyenLyDichHoc: "Cung Văn Xương Thiên Mục thúc đẩy độ chính xác kỹ thuật, nghiên cứu cải tiến năng suất chất lượng sản phẩm.",
        chucNangPhuHop: "Phòng KCS (Quality Control), Phòng thí nghiệm thử nghiệm mẫu (Lab), Phòng R&D kỹ thuật",
        giaiPhapKienTruc: "Hệ thống điều hòa nhiệt độ và kiểm soát độ ẩm nghiêm ngặt; bệ đặt thiết bị đo lường chính xác chống rung cơ học; chiếu sáng cục bộ độ rọi cao (>= 500 Lux)."
      });
      zoningList.push({
        tenKhuVuc: "7. Cửa Trời Thông Gió Mái & Cửa Thoát Hiểm PCCC (Trục Đối Lưu Nhiệt & Khí Thải Xưởng)",
        cungThaiAt: thangCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[thangCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[thangCung].hanh,
        trangThaiKhi: "Bình Hòa Khí Động",
        nguyenLyDichHoc: "Trục lưu chuyển dòng khí đối lưu tự nhiên, giải phóng nhiệt lượng từ máy móc và thải khí tù đọng.",
        chucNangPhuHop: "Cửa trời thông gió đỉnh mái (Ridge vent), Quạt hút công nghiệp sườn tường, Cửa thoát nạn PCCC",
        giaiPhapKienTruc: "Lam gió Louver đón gió tươi ngang hông xưởng kết hợp cửa trời nóc mái đẩy khí nóng lên cao theo hiệu ứng ống khói; cửa thoát hiểm gắn thanh đẩy Panic, mở ra lối thoát ngoài trời an toàn."
      });
      zoningList.push({
        tenKhuVuc: "8. Trạm Xử Lý Nước Thải & Khu Chứa Rác Nguy Hại (Khu Ép Chế Tiêu Hao Khí Hung)",
        cungThaiAt: wcCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[wcCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[wcCung].hanh,
        trangThaiKhi: "Cần Ép Chế (Dĩ Độc Trị Độc)",
        nguyenLyDichHoc: "'Dĩ độc trị độc' - Thu gom toàn bộ chất thải và nước xả bẩn vào cung Thủy Kích hung sát để triệt hạ tạp uế.",
        chucNangPhuHop: "Trạm xử lý nước thải công nghiệp, Cụm WC công nhân, Kho lưu giữ chất thải nguy hại",
        giaiPhapKienTruc: "Bể xử lý nước thải đạt chuẩn xả thải môi trường, nắp kín ngăn mùi hôi; kho chất thải nguy hại có gờ ngăn tràn hóa chất và tường chống cháy; WC công nhân thông thoáng dễ cọ rửa."
      });
    } else if (pType === "Biệt thự") {
      zoningList.push({
        tenKhuVuc: "1. Đại Môn, Tiền Sảnh & Sân Vườn Cảnh Quan (Minh Đường Tụ Khí & Đại Khí Khẩu)",
        cungThaiAt: congCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[congCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[congCung].hanh,
        trangThaiKhi: "Đại Cát (Đại Khí Khẩu)",
        nguyenLyDichHoc: "Minh đường rộng rãi sáng sủa tụ vương khí Thái Ất, gia tăng phúc lộc hiển vinh cho gia tộc.",
        chucNangPhuHop: "Cổng nhôm đúc bề thế, Tiền sảnh đón khách vòm cao, Hồ cá Koi cảnh quan, Lối dạo sân vườn",
        giaiPhapKienTruc: "Cổng chính tỷ lệ bề thế, khoảng đệm sảnh ốp đá cẩm thạch sang trọng; hồ cá Koi nước chảy sinh động; đèn sân vườn lung linh ấm áp ban đêm; cây xanh bóng mát cắt tỉa gọn gàng."
      });
      zoningList.push({
        tenKhuVuc: "2. Gian Thờ Gia Tiên Riêng Tầng Thượng (Không Gian Tâm Linh Trang Nghiêm)",
        cungThaiAt: thoCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[thoCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[thoCung].hanh,
        trangThaiKhi: "Đại Cát (Tôn Nghiêm)",
        nguyenLyDichHoc: "Tọa tại Thiên Môn trang nghiêm, tách biệt hoàn toàn tiếng ồn sinh hoạt gia đình, nạp chân khí phúc đức trường cửu.",
        chucNangPhuHop: "Phòng thờ gia tiên riêng biệt tại tầng tum / tầng thượng biệt thự",
        giaiPhapKienTruc: "Nội thất gỗ tự nhiên; tựa lưng tường gạch đặc vững chãi; cửa sổ thông gió thoát khói hương ra sân thượng trời; trang bị cảm biến khói nhiệt kết nối báo cháy an toàn."
      });
      zoningList.push({
        tenKhuVuc: "3. Bếp Chính & Bếp Ướt Sân Vườn (Hỏa Khí Gia Đạo Thượng Lưu)",
        cungThaiAt: bepCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[bepCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[bepCung].hanh,
        trangThaiKhi: "Cát (Tọa Hung Hướng Cát)",
        nguyenLyDichHoc: "Giữ lửa tài lộc và sự thịnh vượng sung túc của gia đạo gia chủ.",
        chucNangPhuHop: "Bếp khô kết hợp đảo bếp sang trọng trong nhà và Bếp ướt sơ chế ngoài trời",
        giaiPhapKienTruc: "Đảo bếp ốp đá cao cấp; hút mùi âm bàn hoặc treo trần công suất cực đại; khoảng cách bếp nấu và chậu rửa lớn hơn 80cm; khu bếp ướt bên ngoài xử lý các món tanh nồng tiện lợi."
      });
      zoningList.push({
        tenKhuVuc: "4. Phòng Ngủ Master Suite Biệt Thự (Nghỉ Dưỡng Sang Trọng & Sinh Khí Gia Đạo)",
        cungThaiAt: nguCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[nguCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[nguCung].hanh,
        trangThaiKhi: "Hòa Hợp Đại Cát",
        nguyenLyDichHoc: "Thần Hợp và Ngũ Phúc bảo trợ vượng khí nhân đinh, tinh thần tĩnh tại, giấc ngủ sâu an lành.",
        chucNangPhuHop: "Giường Master King-size, Phòng thay đồ Walk-in closet, Ban công view vườn riêng",
        giaiPhapKienTruc: "Tường đầu giường ốp gỗ hoặc da cao cấp; cửa ban công mở rộng view vườn xanh mát; kính Low-E cản nhiệt tuyệt đối; rèm điện tự động êm ái."
      });
      zoningList.push({
        tenKhuVuc: "5. Mật Thất Két Sắt & Phòng Sưu Tập Giá Trị (Tụ Tài Bảo Bồn Biệt Thự)",
        cungThaiAt: ketCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[ketCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[ketCung].hanh,
        trangThaiKhi: "Vượng Tài Bảo Bồn",
        nguyenLyDichHoc: "Cung Ngũ Phúc tụ tài, tích lũy tài sản lớn bền vững qua các thế hệ.",
        chucNangPhuHop: "Két sắt bảo mật vân tay, Tủ trưng bày rượu quý / đồng hồ / nữ trang giá trị cao",
        giaiPhapKienTruc: "Thiết kế ẩn sau vách trang trí sang trọng kín đáo; khóa cửa sinh trắc học và cảm biến chuyển động hồng ngoại kết nối báo động an ninh."
      });
      zoningList.push({
        tenKhuVuc: "6. Thư Viện Gia Đình & Phòng Làm Việc Tư Gia (Khoa Bảng Trí Tuệ Thượng Lưu)",
        cungThaiAt: hocCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[hocCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[hocCung].hanh,
        trangThaiKhi: "Cát Vị Văn Tinh",
        nguyenLyDichHoc: "Văn Xương Thiên Mục chủ về trí tuệ sáng láng, danh tiếng vẻ vang, con cháu học hành đỗ đạt cao.",
        chucNangPhuHop: "Phòng làm việc gia chủ, Bàn đọc sách, Tủ sách danh gia vọng tộc",
        giaiPhapKienTruc: "Cửa sổ mở rộng nhìn ra tiểu cảnh cây xanh thư thái; hệ thống tiêu âm gỗ đục lỗ chống vang vọng; ánh sáng tự nhiên chan hòa không lóa mắt."
      });
      zoningList.push({
        tenKhuVuc: "7. Thang Máy Kính & Đại Sảnh Thông Tầng (Khí Đạo Giao Thông & Đối Lưu Tráng Lệ)",
        cungThaiAt: thangCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[thangCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[thangCung].hanh,
        trangThaiKhi: "Bình Hòa Khí Động",
        nguyenLyDichHoc: "Trục khí đạo lưu thông sinh khí thẳng đứng xuyên suốt toàn bộ ngôi biệt thự.",
        chucNangPhuHop: "Thang máy quan sát kính, Cầu thang bộ uốn lượn nghệ thuật, Giếng trời sảnh thông tầng",
        giaiPhapKienTruc: "Thang máy cabin kính trong suốt êm ái; vòm kính lấy sáng mái đóng mở cảm biến mưa thông minh; đèn chùm pha lê thả trần nghệ thuật."
      });
      zoningList.push({
        tenKhuVuc: "8. Phòng Tắm Suite & Hệ Thống Bể Tự Hoại Khép Kín (Công Trình Phụ Cao Cấp Ép Chế)",
        cungThaiAt: wcCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[wcCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[wcCung].hanh,
        trangThaiKhi: "Cần Ép Chế (Dĩ Độc Trị Độc)",
        nguyenLyDichHoc: "'Dĩ độc trị độc' - Ép toàn bộ chất thải và nước xả xuống cung Thủy Kích để giữ thanh sạch toàn bộ các cung cát.",
        chucNangPhuHop: "Phòng tắm Master bồn sục Jacuzzi, Cụm vệ sinh các phòng, Bể tự hoại thông minh ngoài nhà",
        giaiPhapKienTruc: "Bể tự hoại composite/bê tông đúc sẵn 3 ngăn vi sinh kín khít bố trí ngoài sân vườn; ống thông khí khử mùi than hoạt tính vươn cao; phòng tắm lát đá tự nhiên chống trơn trượt."
      });
    } else {
      // Mặc định: Nhà phố liền kề / Nhà ống nhiều tầng
      zoningList.push({
        tenKhuVuc: "1. Cổng & Cửa Đi Chính Mặt Phố (Khí Khẩu Nạp Khí Đô Thị)",
        cungThaiAt: congCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[congCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[congCung].hanh,
        trangThaiKhi: "Đại Cát",
        nguyenLyDichHoc: "Nạp luồng sinh khí đô thị dồi dào từ trục phố chính vào nhà ống.",
        chucNangPhuHop: "Cửa cuốn an toàn ngoài + Cửa kính trong, Gara xe tầng trệt / Phòng khách mặt tiền",
        giaiPhapKienTruc: "Thiết kế cửa 2 lớp đảm bảo an ninh; cốt nền cao hơn mặt đường phố chống ngập úng mùa mưa; bố trí tiểu cảnh cây xanh sảnh trước để lọc bụi đường phố."
      });
      zoningList.push({
        tenKhuVuc: "2. Gian Thờ Gia Tiên Tầng Tum (Tâm Linh Trang Nghiêm Tầng Cao)",
        cungThaiAt: thoCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[thoCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[thoCung].hanh,
        trangThaiKhi: "Đại Cát (Tôn Nghiêm)",
        nguyenLyDichHoc: "Đặt ở nơi cao nhất ngôi nhà để hấp thụ linh khí đất trời, tránh bị các không gian sinh hoạt khác giẫm đạp bên trên.",
        chucNangPhuHop: "Phòng thờ tổ tiên tại tầng tum / sân thượng cao nhất của ngôi nhà phố",
        giaiPhapKienTruc: "Tựa lưng tường gạch đặc vững chãi, không tựa lưng bồn nước inox trên mái; cửa mở ra khoảng sân thượng thoáng đãng, thoát khói hương thuận lợi."
      });
      zoningList.push({
        tenKhuVuc: "3. Bếp Nấu & Phòng Ăn Gia Đình (Hỏa Khí Giữ Lửa Hạnh Phúc)",
        cungThaiAt: bepCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[bepCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[bepCung].hanh,
        trangThaiKhi: "Cát (Tọa Hung Hướng Cát)",
        nguyenLyDichHoc: "Hỏa lò thiêu đốt tạp khí nhà ống, giữ gìn hòa khí và sức khỏe các thành viên.",
        chucNangPhuHop: "Khu bếp chữ L / chữ I, Tủ bếp gỗ công nghiệp chống ẩm, Bàn ăn gia đình",
        giaiPhapKienTruc: "Lắp đặt máy hút mùi dẫn ống thoát thẳng ra giếng trời hoặc ống đứng mặt sau; khoảng cách bếp nấu và chậu rửa bát tối thiểu 60cm; tránh bếp nhìn thẳng ra cửa chính."
      });
      zoningList.push({
        tenKhuVuc: "4. Phòng Ngủ Master Nhà Phố (Tái Tạo Sức Lao Động & Hạnh Phúc Gia Đình)",
        cungThaiAt: nguCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[nguCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[nguCung].hanh,
        trangThaiKhi: "Hòa Hợp Đại Cát",
        nguyenLyDichHoc: "Thần Hợp bảo trợ tinh thần thư thái, giấc ngủ sâu giữa không gian đô thị ồn ào.",
        chucNangPhuHop: "Giường ngủ đôi Master tầng 2/3, Tủ quần áo, Bàn trang điểm",
        giaiPhapKienTruc: "Đầu giường tựa sát tường đặc, không tựa vách nhà vệ sinh; cửa sổ ban công dùng cửa nhôm kính hộp cách âm chống ồn còi xe; rèm vải cản sáng tốt."
      });
      zoningList.push({
        tenKhuVuc: "5. Két Sắt Tài Chính Gia Đình (Tụ Tài Bảo Bồn)",
        cungThaiAt: ketCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[ketCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[ketCung].hanh,
        trangThaiKhi: "Vượng Tài Lộc",
        nguyenLyDichHoc: "Ngũ Phúc tụ tài, giúp gia chủ làm ăn tích lũy của cải sinh sôi nảy nở.",
        chucNangPhuHop: "Két sắt gia đình, Tủ cất giữ giấy tờ nhà đất và tài sản tích lũy",
        giaiPhapKienTruc: "Bố trí kín đáo trong hộc tủ áo âm tường hoặc góc kín phòng ngủ master; tránh hướng nhìn trực diện từ cửa phòng hoặc cửa ban công."
      });
      zoningList.push({
        tenKhuVuc: "6. Bàn Học & Bàn Làm Việc (Văn Xương Tri Thức)",
        cungThaiAt: hocCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[hocCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[hocCung].hanh,
        trangThaiKhi: "Cát Vị Văn Tinh",
        nguyenLyDichHoc: "Văn Xương Thiên Mục chủ về đầu óc minh mẫn, học tập tấn tới, thi cử đỗ đạt.",
        chucNangPhuHop: "Bàn học tập con trẻ, Bàn làm việc tại gia, Giá sách",
        giaiPhapKienTruc: "Đặt cạnh giếng trời lấy sáng tự nhiên hoặc cạnh ban công; ghế ngồi có tường tựa lưng chắc chắn, trước mặt thoáng đãng."
      });
      zoningList.push({
        tenKhuVuc: "7. Cầu Thang Bộ & Giếng Trời Giữa Nhà (Trục Xương Sống Đối Lưu Không Khí Nhà Ống)",
        cungThaiAt: thangCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[thangCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[thangCung].hanh,
        trangThaiKhi: "Bình Hòa Khí Động",
        nguyenLyDichHoc: "Trục giao thông khí đạo lưu chuyển sinh khí xuyên suốt các tầng từ dưới lên trên.",
        chucNangPhuHop: "Cầu thang bộ thông tầng, Giếng trời trung tâm lấy sáng và đón gió tươi",
        giaiPhapKienTruc: "Cầu thang bậc kín không hở để tránh thoát khí; giếng trời mái kính mở thoát khí nóng theo hiệu ứng ống khói (Stack effect); không bố trí cầu thang đâm thẳng ra cửa chính."
      });
      zoningList.push({
        tenKhuVuc: "8. Nhà Vệ Sinh Các Tầng & Bể Phốt Ngầm (Ép Chế Khí Uế & Hạ Tầng Ngầm)",
        cungThaiAt: wcCung,
        huongDiaLy: THAP_LUC_FENGSHUI_NATURE[wcCung].huong,
        nguHanhKhuVuc: THAP_LUC_FENGSHUI_NATURE[wcCung].hanh,
        trangThaiKhi: "Cần Ép Chế (Dĩ Độc Trị Độc)",
        nguyenLyDichHoc: "'Dĩ độc trị độc' - Đặt công trình phụ tại phương Thủy Kích để đè nén tạp uế, bảo vệ các cung cát lợi.",
        chucNangPhuHop: "Khu vệ sinh các tầng, Bể phốt ngầm dưới sàn tầng trệt, Hố ga kỹ thuật",
        giaiPhapKienTruc: "Bể tự hoại xử lý chống thấm ngược kỹ lưỡng; quạt hút mùi âm trần dẫn ống thoát ra hộp kỹ thuật; ống thoát khí bể phốt vươn cao vượt qua mái tum."
      });
    }

    // 5 Giải pháp vật lý kiến trúc & vi khí hậu chuyên biệt theo loại hình bất động sản
    let architecturalRemedies = [];
    if (pType === "Căn hộ chung cư") {
      architecturalRemedies = [
        {
          hangMuc: "Thông gió vi khí hậu căn hộ cao tầng (Cross-ventilation)",
          giaiPhap: "Mở hé cửa sổ phòng ngủ kết hợp cửa lùa logia phòng khách để tạo luồng đối lưu gió mát xuyên phòng, hạ nhiệt tự nhiên 2-3°C không phụ thuộc máy lạnh."
        },
        {
          hangMuc: "Cách nhiệt & Che chắn bức xạ kính ban công (Thermal Protection)",
          giaiPhap: "Vách kính ban công hướng Tây hoặc Tây Nam lắp dán phim cách nhiệt nano gốm hoặc kính hộp Low-E 2 lớp, cản 90% tia UV và giảm bức xạ nhiệt phòng khách."
        },
        {
          hangMuc: "Chắn sát khí bằng chậu cây xanh ban công (Green Buffer)",
          giaiPhap: `Tại ban công/cửa sổ phương ${THAP_LUC_FENGSHUI_NATURE[tkPos].huong} (Cung ${tkPos}) bố trí chậu cây xanh chịu nắng (trúc mây, lưỡi hổ, ngũ gia bì) để lọc bụi mịn đô thị và tán xạ xung sát.`
        },
        {
          hangMuc: "Xử lý ngăn mùi và chống trào ngược trục kỹ thuật (Sanitary Seal)",
          giaiPhap: "Lắp phễu thu sàn bẫy nước xi-phông chống trôi ngược mùi hôi từ hộp gen kỹ thuật tòa nhà; van 1 chiều cho toàn bộ quạt hút âm trần."
        },
        {
          hangMuc: "Vật liệu hoàn thiện nội thất ấm cúng (Material Synergy)",
          giaiPhap: "Sử dụng sàn gỗ công nghiệp chống ẩm cao cấp kết hợp trần thạch cao giật cấp ánh sáng vàng dịu nhẹ, cân bằng ngũ hành Mộc Hỏa cho căn hộ."
        }
      ];
    } else if (pType === "Văn phòng công ty") {
      architecturalRemedies = [
        {
          hangMuc: "Hệ thống cấp khí tươi văn phòng (HVAC Fresh Air Circulation)",
          giaiPhap: "Đảm bảo lưu lượng cấp khí tươi đạt chuẩn 25-30 m³/h/người, lọc bụi sơ cấp G4 và túi F7, duy trì nồng độ CO2 dưới 800ppm giúp nhân sự tỉnh táo làm việc."
        },
        {
          hangMuc: "Kiểm soát bức xạ nhiệt mặt dựng kính tòa nhà (Solar Glare Control)",
          giaiPhap: "Mặt kính văn phòng hướng nắng Tây trang bị hệ rèm cuốn chống chói hoặc phim cách nhiệt quang học phản xạ bức xạ mặt trời, bảo vệ thị lực và giảm tải điện chiller."
        },
        {
          hangMuc: "Mảng xanh văn phòng tán xạ tạp khí (Office Biophilic Buffer)",
          giaiPhap: `Bố trí chậu cây nội thất lọc khí (kim tiền, trầu bà đế vương, lan ý) tại phương ${THAP_LUC_FENGSHUI_NATURE[tkPos].huong} (Cung ${tkPos}) để hấp thụ bức xạ màn hình máy tính và triệt tiêu tạp khí.`
        },
        {
          hangMuc: "Cách âm tiêu âm phòng họp & phòng lãnh đạo (Acoustic Comfort)",
          giaiPhap: "Vách thạch cao 2 lớp nhồi bông khoáng tỷ trọng 40 kg/m³ và tấm ốp tiêu âm đục lỗ gỗ, đạt ngưỡng cách âm STC >= 45dB, bảo mật tuyệt đối các cuộc họp chiến lược."
        },
        {
          hangMuc: "Chiếu sáng công thái học bảo vệ thị lực (Ergonomic Lighting)",
          giaiPhap: "Hệ thống đèn LED panel nhiệt độ màu 4000K (trắng trung tính), chỉ số hoàn màu CRI >= 85, độ rọi đồng đều 400-500 Lux khắp khu làm việc."
        }
      ];
    } else if (pType === "Nhà xưởng sản xuất") {
      architecturalRemedies = [
        {
          hangMuc: "Thông gió đối lưu tự nhiên đỉnh mái xưởng (Natural Stack Ventilation)",
          giaiPhap: "Bố trí cửa trời thông gió tự nhiên (Ridge monitor/vent) trên đỉnh nóc kết hợp lam gió Louver chân tường, đẩy toàn bộ khí nóng và khí phát thải máy móc lên cao."
        },
        {
          hangMuc: "Chống nóng và cách nhiệt mái tôn công nghiệp (Industrial Roof Insulation)",
          giaiPhap: "Mái tôn lợp panel EPS/PU hoặc rải túi khí cách nhiệt 2 mặt bạc kết hợp lưới kẽm đỡ bông thủy tinh tỷ trọng cao, giảm 8-10°C bức xạ nhiệt nhà xưởng."
        },
        {
          hangMuc: "Vành đai cây xanh cách ly khói bụi và tiếng ồn (Green Industrial Belt)",
          giaiPhap: `Phương ${THAP_LUC_FENGSHUI_NATURE[tkPos].huong} (Cung ${tkPos}) trồng dải cây xanh lá dày rậm rạp (keo tai tượng, cau vua, sao đen) làm đệm che chắn tiếng ồn và ngăn phát tán bụi ra môi trường xung quanh.`
        },
        {
          hangMuc: "Lấy sáng tự nhiên mái xưởng tiết kiệm năng lượng (Daylighting Panels)",
          giaiPhap: "Bố trí 8-12% diện tích mái bằng tấm tôn lấy sáng Polycarbonate chống tia cực tím, cung cấp ánh sáng ban ngày tự nhiên đồng đều khắp dây chuyền sản xuất."
        },
        {
          hangMuc: "Sơn sàn Epoxy tăng cứng chịu tải trọng nặng (Heavy Duty Flooring)",
          giaiPhap: "Sàn bê tông cốt thép dày 200mm hoàn thiện sơn phủ Epoxy tự phẳng 3 lớp hoặc rải sika tăng cứng, chịu tải trọng xe nâng và chống bám dính hóa chất, dầu mỡ."
        }
      ];
    } else if (pType === "Biệt thự") {
      architecturalRemedies = [
        {
          hangMuc: "Thông gió vi khí hậu thông tầng và sân trong (Courtyard Cross-ventilation)",
          giaiPhap: "Kết hợp sảnh thông tầng cao và giếng trời kính thông minh cảm biến tự động, luân chuyển dòng gió mát từ sân vườn vào khắp các không gian biệt thự."
        },
        {
          hangMuc: "Lam chắn nắng nghệ thuật & Kính Low-E cao cấp (Architectural Sunshade)",
          giaiPhap: "Mặt tiền hướng Tây và Tây Nam bố trí hệ lam xoay nhôm vân gỗ/gỗ Teak tự nhiên kết hợp kính hộp cách âm cách nhiệt Low-E 24mm, giữ nhiệt độ mát mẻ quanh năm."
        },
        {
          hangMuc: "Cảnh quan cây xanh phong thủy che chắn sát khí (Landscape Shielding)",
          giaiPhap: `Tại phương ${THAP_LUC_FENGSHUI_NATURE[tkPos].huong} (Cung ${tkPos}) bố trí đồi cỏ tiểu cảnh, hồ cá Koi lọc tuần hoàn hoặc tường rào phủ dây leo xanh mát để thanh lọc không khí và hóa giải hung sát.`
        },
        {
          hangMuc: "Cân bằng ánh sáng tự nhiên và thông tầng nghệ thuật (Atrium Daylight Synergy)",
          giaiPhap: "Mái kính sảnh thông tầng sử dụng kính dán an toàn phủ film cản nhiệt, truyền ánh sáng tự nhiên mềm mại xuống lòng sảnh mà không gây nóng rát."
        },
        {
          hangMuc: "Hoàn thiện ngũ hành bằng đá cẩm thạch và gỗ quý (Luxury Material Balance)",
          giaiPhap: "Ốp đá tự nhiên Marble/Granite dày dặn tại các cung vị vững chãi kết hợp sàn gỗ gõ đỏ/óc chó ấm áp, tạo dựng trường khí quý phái trường tồn."
        }
      ];
    } else {
      architecturalRemedies = [
        {
          hangMuc: "Thông gió vi khí hậu (Cross-ventilation)",
          giaiPhap: "Tạo cửa mở đối xứng giữa cung đón gió mát (Tốn/Ly) và cung thoát gió (Càn/Cấn), hạ nhiệt tự nhiên 2-3 độ C mùa hè."
        },
        {
          hangMuc: "Cách nhiệt & Che chắn bức xạ (Thermal Protection)",
          giaiPhap: "Mặt tiền hướng Tây (Dậu) hoặc Tây Nam (Khôn) bố trí lam chắn nắng di động hoặc kính hộp Low-E cản nhiệt, giảm tải điện máy lạnh."
        },
        {
          hangMuc: "Chắn sát khí Thủy Kích bằng mảng xanh (Green Buffer)",
          giaiPhap: `Tại phương ${THAP_LUC_FENGSHUI_NATURE[tkPos].huong} (Cung ${tkPos}) trồng hàng rào cây xanh rậm rạp (như trúc quân tử, cau cảnh) để lọc bụi, cản tiếng ồn và tán xạ sát khí.`
        },
        {
          hangMuc: "Cân bằng ánh sáng tự nhiên (Daylight Balance)",
          giaiPhap: "Khu vực Kế Thần u uất bổ sung giếng trời lấy sáng mái; khu vực Thái Ất vương khí mở rộng cửa sổ kính cường lực."
        },
        {
          hangMuc: "Ngũ hành thông quan vật liệu hoàn thiện (Material Synergy)",
          giaiPhap: "Tọa sơn yếu bổ sung mảng tường đá tự nhiên dày dặn (Thổ sinh Kim); phòng ngủ dùng sàn gỗ tự nhiên ấm áp (Mộc dưỡng Hỏa)."
        }
      ];
    }

    // Lọc giờ hoàng kim
    const goldenHours = [];
    let hourly = [];
    if (ke && ke.thoi_than_12_gio) {
      hourly = ke.thoi_than_12_gio;
    } else if (global.NetaThaiAtInterpreter && typeof global.NetaThaiAtInterpreter.forecastTwelveHours === 'function') {
      hourly = global.NetaThaiAtInterpreter.forecastTwelveHours(ke || {});
    }

    if (Array.isArray(hourly)) {
      hourly.forEach(h => {
        const tt = String(h.trang_thai || h.trangThai || "").toUpperCase();
        if (tt.includes("ĐẠI CÁT") || tt.includes("CÁT")) {
          goldenHours.push({
            gio: h.gio || "",
            trangThai: h.trang_thai || h.trangThai || "Cát",
            khuyenNghi: "Thời điểm vàng để đặt viên đá móng đầu tiên, cất nóc hoặc bê bếp lửa nhập trạch."
          });
        }
      });
    }

    // Chồng lớp đa trường phái
    const fusionReport = fuseWithTaiyi(
      { thai_at: taPos, ngu_phuc: npPos, thuy_kich: tkPos, ke_than: ktPos },
      fDeg,
      birthYear,
      gender
    );

    return {
      propertyType: pType,
      chartDateStr: chart ? (chart.solar_date_str || chart.dateStr || "Hiện tại") : "Hiện tại",
      sittingDeg: sDeg,
      facingDeg: fDeg,
      sittingMountain: sittingM.name,
      facingMountain: facingM.name,
      sittingCung: sCung,
      facingCung: fCung,
      diemNhanDinhSucKhoe: healthScore,
      diemTaiLocNgoaiGiao: wealthScore,
      diemPhongThuyTongThe: totalScore,
      theTranChuKhach: theTran,
      luanDoanTongThe: luanDoan,
      cungThaiAt: taPos,
      cungNguPhuc: npPos,
      cungVanXuong: vxPos,
      cungThanHop: thPos,
      cungThuyKich: tkPos,
      cungKeThan: ktPos,
      zoningList: zoningList,
      architecturalRemedies: architecturalRemedies,
      multiSchoolFusion: fusionReport,
      goldenHours: goldenHours
    };
  }

  // ==============================================================================
  // 5. ĐỘNG CƠ ÂM TRẠCH (YIN DWELLINGS ENGINE)
  // ==============================================================================
  function assessAmTrach(chart, tombSittingDeg, laiLongDeg, thuyKhauDeg, targetKe) {
    const keMode = targetKe || "Kể Giờ";
    const ke = (keMode === "Kể Giờ" && chart && chart.ke_gio) ? chart.ke_gio : (chart ? chart.ke_nam : null);

    const sDeg = ((tombSittingDeg % 360) + 360) % 360;
    const fDeg = (sDeg + 180.0) % 360.0;

    const sittingM = degreeToMountain(sDeg);
    const facingM = degreeToMountain(fDeg);

    const sCung = sittingM.thai_at_pos;
    const fCung = facingM.thai_at_pos;

    let schu = 24;
    let skhach = 22;
    let taPos = "Ngọ";
    let vxPos = "Mão";
    let tkPos = "Tý";
    let ktPos = "Dần";
    let npPos = "Dậu";
    let thPos = "Sửu";
    let tlPos = "Dần";
    let xkPos = "";
    let hkPos = "";

    if (ke) {
      schu = ke.toan_chu || 20;
      skhach = ke.toan_khach || 20;
      taPos = ke.thai_at_pos || "Ngọ";
      vxPos = ke.van_xuong_pos || "Mão";
      tkPos = ke.thuy_kich_pos || "Tý";
      ktPos = ke.ke_than_pos || "Dần";
      if (ke.stars) {
        npPos = ke.stars["Ngũ Phúc"] || "Dậu";
        thPos = ke.stars["Thần Hợp"] || "Sửu";
        tlPos = ke.stars["Thanh Long"] || "Dần";
        xkPos = ke.stars["Xích Kỳ"] || "";
        hkPos = ke.stars["Hắc Kỳ"] || "";
      }
    }

    // Điểm số định lượng Âm Trạch
    let phucKhi = Math.min(98, Math.max(15, Math.floor(schu * 2.7)));
    if (sCung === npPos || sCung === taPos) phucKhi = Math.min(98, phucKhi + 20);

    let khoaBang = Math.min(98, Math.max(15, Math.floor(skhach * 2.3)));
    if (fCung === vxPos || fCung === taPos) khoaBang = Math.min(98, khoaBang + 20);

    // Vi phân La Kinh: 120 Phân Kim & 72 Xuyên Sơn Long
    const { phanKim, xuyenSonLong, microDiagnostic } = analyzeDegreeMicro(sDeg);

    // An lành hài cốt
    let anLanh = 85;
    if (sCung === tkPos) anLanh -= 40;
    if (sCung === ktPos) anLanh -= 25;
    if (sCung === hkPos) anLanh -= 30;
    if (sCung === xkPos) anLanh -= 20;

    if (microDiagnostic.isDaiKhongVong) anLanh -= 30;
    else if (phanKim.phanLoai.includes("Hỏa Khanh")) anLanh -= 15;
    else if (phanKim.phanLoai.includes("Châu Bảo")) anLanh = Math.min(98, anLanh + 10);

    anLanh = Math.max(10, Math.min(98, anLanh));

    const totalAmTrach = Math.floor((phucKhi * 0.4) + (khoaBang * 0.3) + (anLanh * 0.3));

    let evalLong = "";
    if (totalAmTrach >= 80) evalLong = "ĐẠI CÁT ĐỊA HUYỆT (Tụ Khí Tàng Phong - Phát Phúc Thiên Niên)";
    else if (totalAmTrach >= 60) evalLong = "TRUNG CÁT ĐỊA (Khí Trường Ổn Định, Cần Tôn Tạo Cảnh Quan Che Chắn)";
    else evalLong = "HUNG ĐỊA PHẠM SÁT (Khí Tán Thấu Cốt - Cần Khẩn Cấp Thoát Nước & Đắp Sa)";

    // Tứ Thú Sa Bàn
    const leftDeg = (sDeg + 90.0) % 360.0;
    const rightDeg = ((sDeg - 90.0) % 360.0 + 360.0) % 360.0;

    const leftM = degreeToMountain(leftDeg);
    const rightM = degreeToMountain(rightDeg);

    const tuThu = {
      huyenVuToaHau: `Sơn ${sittingM.name} (Cung ${sCung} - ${THAP_LUC_FENGSHUI_NATURE[sCung].huong})`,
      chuTuocMinhDuong: `Sơn ${facingM.name} (Cung ${fCung} - ${THAP_LUC_FENGSHUI_NATURE[fCung].huong})`,
      thanhLongTa: `Sơn ${leftM.name} (Cung ${leftM.thai_at_pos} - ${THAP_LUC_FENGSHUI_NATURE[leftM.thai_at_pos].huong})`,
      bachHoHuu: `Sơn ${rightM.name} (Cung ${rightM.thai_at_pos} - ${THAP_LUC_FENGSHUI_NATURE[rightM.thai_at_pos].huong})`
    };

    // Chẩn đoán 5 Biến chứng Âm phần
    const pathologies = [];

    // 1. Thủy Kích Sát
    if (sCung === tkPos || fCung === tkPos) {
      pathologies.push({
        tenBenhTrach: "HUYẾT QUANG ĐẠI SÁT (Thủy Kích Trực Chiếu)",
        mucDoNguyHiem: "Đại Hung Cấp Tính",
        dauHieuThucTe: `Huyệt mộ nằm trùng phương vị Thủy Kích (${THAP_LUC_FENGSHUI_NATURE[tkPos].huong}). Đất quanh mộ dễ sụt lún, nước ngầm ngấm mạnh.`,
        anhHuongConChau: "Con cháu trong dòng họ dễ gặp tai nạn bất ngờ liên quan đến xe cộ, dao kéo, mổ xẻ, bệnh về máu huyết hoặc kiện tụng tù ngục.",
        bienPhapKyThuat: "Xây rãnh thoát nước ngầm sâu hơn đáy quách 40cm bao quanh mộ; đắp bờ kè đá vững chắc chắn hướng xói lở; trồng thảm cỏ giữ đất."
      });
    }

    // 2. Thủy Âm Xâm Quách (Hắc Kỳ)
    if (sCung === hkPos || (sCung === "Tý" && ke && ke.stars && ke.stars["Hắc Kỳ"] === "Tý")) {
      pathologies.push({
        tenBenhTrach: "THỦY NGẬP ÚNG QUÁCH (Hắc Kỳ Thủy Tai)",
        mucDoNguyHiem: "Nguy Hiểm Tiềm Ẩn",
        dauHieuThucTe: "Cung Tọa ngộ Hắc Kỳ: Đáy huyệt nằm trên túi nước ngầm hoặc đất sét bí nước, nước tù đọng không thoát được quanh năm.",
        anhHuongConChau: "Hậu duệ hay bị các chứng bệnh về thận, bàng quang, phù thũng, thoái hóa khớp; gia tộc tiêu tán tài sản vì ốm đau triền miên.",
        bienPhapKyThuat: "Đào hào tiêu nước ngầm hạ mực nước tĩnh xung quanh; lớp lót đáy huyệt rải sỏi cuội sạch và cát vàng dày 20cm trước khi đặt quách."
      });
    }

    // 3. Rễ Cây & Mối Mọt (Kế Thần)
    if (sCung === ktPos) {
      pathologies.push({
        tenBenhTrach: "MỐI MỌT & RỄ CÂY ĐÂM XUYÊN (Kế Thần Ám Muội)",
        mucDoNguyHiem: "Nguy Hiểm Tiềm Ẩn",
        dauHieuThucTe: `Kế Thần ngự tại Cung ${ktPos}: Khu vực xung quanh có cây rễ cọc lớn hoặc tổ mối ngầm sinh sống gần vị trí áo quan.`,
        anhHuongConChau: "Người trong tộc tinh thần bất an, hay gặp ác mộng, nội bộ họ hàng nghi kỵ bất hòa, dễ bị tiểu nhân lừa gạt mất của.",
        bienPhapKyThuat: "Chặt bỏ các cây thân gỗ lớn trong bán kính 5m quanh huyệt; đào rãnh kiểm tra xử lý triệt để tổ mối; xây quách bảo vệ bằng bê tông cốt thép đúc liền khối."
      });
    }

    // 4. Hỏa Thiêu Cốt Tủy (Xích Kỳ)
    if (sCung === xkPos) {
      pathologies.push({
        tenBenhTrach: "HỎA SÁT THIÊU CỐT (Xích Kỳ Hỏa Khí)",
        mucDoNguyHiem: "Cần Theo Dõi",
        dauHieuThucTe: `Xích Kỳ ngự tại Cung ${xkPos}: Đất đồi trọc khô cằn nứt nẻ, nắng rọi gay gắt thiêu đốt mặt mộ, đất biến thành màu đỏ gạch khô khốc.`,
        anhHuongConChau: "Gia tộc tính khí nóng nảy, anh em bất hòa chia rẽ, con cháu hay mắc bệnh về tim mạch, huyết áp cao, đột quỵ.",
        bienPhapKyThuat: "Phủ đất màu phì nhiêu (đất thịt vàng); trồng cỏ thảm xanh mướt giữ ẩm; tạo bồn cây xanh che chắn bớt nắng gắt buổi trưa."
      });
    }

    // 4 Kế Sách Địa Kỹ Thuật & Tôn Tạo
    const civilRemediationPlans = [
      {
        hangMuc: "Gia cố Huyền Vũ (Lưng Huyệt Mộ)",
        giaiPhap: `Đắp mô đất hình mai rùa cao hơn mặt huyệt 30-50cm tại phương ${tuThu.huyenVuToaHau} để chắn gió bấc lạnh thấu xương, tạo điểm tựa vĩnh cửu.`
      },
      {
        hangMuc: "Quy hoạch Thoát Nước Ngầm & Thủy Khẩu",
        giaiPhap: "Bố trí rãnh thu nước ngầm hình móng ngựa phía sau và hai bên sườn mộ, dẫn nước thoát ra ngoài theo cung vị bình hòa (tránh phương Thủy Kích)."
      },
      {
        hangMuc: "Vật liệu Xây Dựng & Ốp Lát Trường Tồn",
        giaiPhap: "Sử dụng đá xanh tự nhiên nguyên khối hoặc đá granite xám hạt mịn; mạch ghép vữa xi măng mác cao chống thấm nước mưa ngấm vào lòng mộ."
      },
      {
        hangMuc: "Cảnh quan Sinh Thái Che Chắn Gió Sát",
        giaiPhap: "Trồng cỏ chỉ hoặc cỏ nhật trên toàn bộ bề mặt khuôn viên; hai bên Thanh Long - Bạch Hổ trồng dải cây thấp (tùng la hán hoặc ngũ gia bì) để tụ khí tàng phong."
      }
    ];

    // Lọc giờ hoàng kim an táng / cải táng
    const burialHours = [];
    let hourly = [];
    if (ke && ke.thoi_than_12_gio) {
      hourly = ke.thoi_than_12_gio;
    } else if (global.NetaThaiAtInterpreter && typeof global.NetaThaiAtInterpreter.forecastTwelveHours === 'function') {
      hourly = global.NetaThaiAtInterpreter.forecastTwelveHours(ke || {});
    }

    if (Array.isArray(hourly)) {
      hourly.forEach(h => {
        const tt = String(h.trang_thai || h.trangThai || "").toUpperCase();
        if (tt.includes("ĐẠI CÁT") || tt.includes("CÁT")) {
          burialHours.push({
            gio: h.gio || "",
            trangThai: h.trang_thai || h.trangThai || "Cát",
            khuyenNghi: "Thời khắc hoàng kim để hạ huyệt, phân kim định vị tiểu quách, lấp đất hoặc khánh thành tạ mộ."
          });
        }
      });
    }

    return {
      chartDateStr: chart ? (chart.solar_date_str || chart.dateStr || "Hiện tại") : "Hiện tại",
      tombSittingDeg: sDeg,
      tombFacingDeg: fDeg,
      sittingMountain: sittingM.name,
      facingMountain: facingM.name,
      sittingCung: sCung,
      facingCung: fCung,
      laiLongDeg: laiLongDeg,
      thuyKhauDeg: thuyKhauDeg,
      diemAmDucPhucKhi: phucKhi,
      diemHauDueKhoaBang: khoaBang,
      diemAnLanhHaiCot: anLanh,
      tongDiemAmTrach: totalAmTrach,
      danhGiaLongHuyet: evalLong,
      cungThaiAt: taPos,
      cungNguPhuc: npPos,
      cungThuyKich: tkPos,
      cungVanXuong: vxPos,
      cungThanHop: thPos,
      cungKeThan: ktPos,
      tuThu: tuThu,
      pathologies: pathologies,
      civilRemediationPlans: civilRemediationPlans,
      phanKim: phanKim,
      xuyenSonLong: xuyenSonLong,
      microDiagnostic: microDiagnostic,
      goldenHoursBurial: burialHours
    };
  }

  // ==============================================================================
  // 6. ĐỘNG CƠ TRẠCH CÁT THÁI ẤT (FENG SHUI TIMING)
  // ==============================================================================
  function evaluateFengShuiTiming(ke, taskType) {
    const type = taskType || "dong_tho";
    let hourly = [];
    if (ke && ke.thoi_than_12_gio) {
      hourly = ke.thoi_than_12_gio;
    } else if (global.NetaThaiAtInterpreter && typeof global.NetaThaiAtInterpreter.forecastTwelveHours === 'function') {
      hourly = global.NetaThaiAtInterpreter.forecastTwelveHours(ke || {});
    }

    const taskTitles = {
      dong_tho: "Động Thổ & Khởi Công Móng",
      cat_noc: "Cất Nóc & Thượng Lương",
      nhap_trach: "Nhập Trạch & Dọn Vào Nhà Mới",
      ha_huyet: "Hạ Huyệt & Cải Táng Mộ Phần",
      ta_mo: "Tạ Mộ & Khánh Thành Lăng Tẩm",
      khai_truong: "Khai Trương & Khởi Mở Kinh Doanh",
      mo_nuoc: "Mở Nước, Khoan Giếng & Thông Thủy"
    };

    const taskGuides = {
      dong_tho: "Ưu tiên giờ có Thanh Long hoặc Đại Cát giáng lâm để cuốc nhát đầu tiên, giúp công trình an toàn vững chãi.",
      cat_noc: "Ưu tiên giờ có Thái Ất vương khí để đặt đòn dông chính, biểu trưng cho sự thăng hoa uy quyền của gia trạch.",
      nhap_trach: "Ưu tiên giờ Thần Hợp hoặc Ngũ Phúc để bê bếp lửa vào nhà mới, tạo hòa khí sum vầy và tụ tài ấm cúng.",
      ha_huyet: "Ưu tiên giờ có Ngũ Phúc hộ mệnh hoặc Thanh Long để hạ huyệt và phân kim, bảo đảm an lành cho cốt tủy.",
      ta_mo: "Ưu tiên giờ Thần Hợp hoặc Cát tinh hòa giải để làm lễ tạ mộ khánh thành, lưu truyền phúc ấm con cháu.",
      khai_truong: "Ưu tiên giờ Khách vượng và Thái Ất lâm môn để đón khách hàng tấp nập, tài lộc hanh thông.",
      mo_nuoc: "Ưu tiên giờ Thanh Long và Ngũ Phúc để khai thông mạch nước, nạp sinh khí dồi dào."
    };

    const evaluatedHours = [];
    hourly.forEach(h => {
      const chi = h.chi || (h.gio ? h.gio.split(" ")[1] : "");
      const tt = String(h.trang_thai || h.trangThai || "").toUpperCase();
      let suitLevel = "Bình Thường";
      let suitBadge = "fs-badge-normal";
      let note = "";

      if (tt.includes("ĐẠI CÁT")) {
        suitLevel = "Đại Cát (Thời Khắc Vàng)";
        suitBadge = "fs-badge-great";
        note = `Rất thích hợp cho sự vụ ${taskTitles[type]}. Trường khí đại vượng, cát thần hộ trì toàn diện.`;
      } else if (tt.includes("CÁT")) {
        suitLevel = "Cát Lợi";
        suitBadge = "fs-badge-good";
        note = `Thuận lợi cho ${taskTitles[type]}. Khí trường êm dịu, công việc hanh thông.`;
      } else if (tt.includes("HUNG") || tt.includes("SÁT")) {
        suitLevel = "Hung Kỵ";
        suitBadge = "fs-badge-critical";
        note = `Không nên tiến hành ${taskTitles[type]} trong khung giờ này do phạm hung thần xung sát.`;
      } else {
        suitLevel = "Thứ Cát / Bình Hòa";
        suitBadge = "fs-badge-normal";
        note = `Khung giờ trung tính, có thể tiến hành nếu đã chuẩn bị kỹ lưỡng về kỹ thuật.`;
      }

      evaluatedHours.push({
        gio: h.gio || `Giờ ${chi}`,
        chi: chi,
        trangThai: h.trang_thai || h.trangThai || "Bình hòa",
        suitLevel: suitLevel,
        suitBadge: suitBadge,
        note: note,
        stars: h.than_sat || h.stars || []
      });
    });

    return {
      taskType: type,
      taskTitle: taskTitles[type] || "Việc Phong Thủy",
      taskGuide: taskGuides[type] || "",
      evaluatedHours: evaluatedHours
    };
  }

  // ==============================================================================
  // 7. TRÌNH SINH BÁO CÁO HỌC THUẬT TOÀN DIỆN (ACADEMIC ESSAY GENERATOR)
  // ==============================================================================
  function generateTaiyiFengShuiEssay(asm, mode) {
    const isDuong = (mode !== 'am_trach');
    if (isDuong) {
      return generateDuongTrachEssay(asm);
    } else {
      return generateAmTrachEssay(asm);
    }
  }

  function generateDuongTrachEssay(asm) {
    const fus = asm.multiSchoolFusion || {};
    const bt = fus.batTrach;

    return `# BÁO CÁO THẨM TRA PHONG THỦY DƯƠNG TRẠCH THÁI ẤT THẦN KINH
**Dự án / Loại hình**: ${asm.propertyType.toUpperCase()}  
**Thời điểm khảo sát**: ${asm.chartDateStr}  
**Quy chuẩn thẩm định**: Thái Ất Thần Kinh, Bát Trạch Minh Cảnh & Huyền Không Vận 9 (2024 - 2043)  
**Tiêu chuẩn văn bản**: Nghị định 30/2020/NĐ-CP & Kỷ luật Hành chính - Kỹ thuật

---

### TẦNG 1: THÔNG SỐ KHÔNG GIAN ĐỊA LÝ & TƯƠNG QUAN CHỦ - KHÁCH
* **Tọa Sơn (Lưng Nhà - Đại diện Bên Chủ)**: Góc ${asm.sittingDeg.toFixed(1)}° | Sơn ${asm.sittingMountain} | Cung Thái Ất: **${asm.sittingCung}** (${THAP_LUC_FENGSHUI_NATURE[asm.sittingCung].huong})
* **Hướng Nhà (Mặt Tiền - Đại diện Bên Khách)**: Góc ${asm.facingDeg.toFixed(1)}° | Sơn ${asm.facingMountain} | Cung Thái Ất: **${asm.facingCung}** (${THAP_LUC_FENGSHUI_NATURE[asm.facingCung].huong})
* **Thế Trận Đại Cục**: **${asm.theTranChuKhach}**
* **Điểm Phong Thủy Tổng Thể**: **${asm.diemPhongThuyTongThe}/100** Điểm
  - *Sức Khỏe & Nhân Đinh (Bên Chủ)*: ${asm.diemNhanDinhSucKhoe}/100 Điểm
  - *Tài Lộc & Ngoại Giao (Bên Khách)*: ${asm.diemTaiLocNgoaiGiao}/100 Điểm
* **Luận Đoán Khí Trường**: ${asm.luanDoanTongThe}

---

### TẦNG 2: ĐỊNH VỊ CÁT PHƯƠNG & ĐẠI SÁT PHƯƠNG THÁI ẤT
1. **Thái Ất Vương Khí**: Cung **${asm.cungThaiAt}** (${THAP_LUC_FENGSHUI_NATURE[asm.cungThaiAt].huong}). Nơi nạp vương khí tối cao của vũ trụ, thích hợp bố trí Cửa đi chính, Sảnh đón hoặc Tọa vị Ban thờ trang nghiêm.
2. **Ngũ Phúc Tài Vị**: Cung **${asm.cungNguPhuc}** (${THAP_LUC_FENGSHUI_NATURE[asm.cungNguPhuc].huong}). Cát thần chủ về tích lũy của cải, bảo an tài chính, thích hợp đặt Két sắt, Phòng kế toán hoặc Phòng ngủ Master / Phòng Giám đốc.
3. **Văn Xương Khoa Bảng**: Cung **${asm.cungVanXuong}** (${THAP_LUC_FENGSHUI_NATURE[asm.cungVanXuong].huong}). Khí mộc vươn lên, chủ về trí tuệ học vấn, thích hợp làm Góc làm việc, Bàn học con cái, Phòng R&D / KCS.
4. **Thần Hợp Nhân Duyên**: Cung **${asm.cungThanHop}** (${THAP_LUC_FENGSHUI_NATURE[asm.cungThanHop].huong}). Năng lượng kết nối hòa khí gia đạo và quan hệ đối tác bền vững.
5. **Thủy Kích Đại Sát**: Cung **${asm.cungThuyKich}** (${THAP_LUC_FENGSHUI_NATURE[asm.cungThuyKich].huong}). Phương vị hung sát, tuyệt đối kỵ đặt Cửa chính, Bếp lò hoặc Giường ngủ / Bàn làm việc lãnh đạo. Áp dụng chiến lược "Dĩ độc trị độc" bố trí ${asm.propertyType === 'Căn hộ chung cư' ? 'nhà vệ sinh & trục hộp gen kỹ thuật căn hộ' : (asm.propertyType === 'Văn phòng công ty' ? 'cụm WC văn phòng & phòng server kỹ thuật' : (asm.propertyType === 'Nhà xưởng sản xuất' ? 'trạm xử lý nước thải & khu rác nguy hại' : 'khu vệ sinh / bể tự hoại khép kín'))}.
6. **Kế Thần Ám Muội**: Cung **${asm.cungKeThan}** (${THAP_LUC_FENGSHUI_NATURE[asm.cungKeThan].huong}). Đề phòng ẩm mốc, thiếu ánh sáng và tiểu nhân gièm pha.

---

### TẦNG 3: QUY HOẠCH CHI TIẾT 8 PHÂN KHU CÔNG NĂNG KIẾN TRÚC (ZONING)
${asm.zoningList.map((z, idx) => `
#### ${z.tenKhuVuc} [${z.trangThaiKhi}]
* **Cung Vị**: Cung ${z.cungThaiAt} (${z.huongDiaLy} - Hành ${z.nguHanhKhuVuc})
* **Nguyên Lý**: ${z.nguyenLyDichHoc}
* **Bố Trí Tối Ưu**: ${z.chucNangPhuHop}
* **Giải Pháp Kỹ Thuật**: ${z.giaiPhapKienTruc}
`).join("\n")}

---

### TẦNG 4: NGUYÊN LÝ KHÍ ĐỘNG & 5 GIẢI PHÁP VẬT LÝ KIẾN TRÚC (RULE 9 & RULE 12)
Hệ thống loại bỏ hoàn toàn các quan niệm dị đoan bùa chú, tập trung 100% vào kỹ thuật vật lý kiến trúc:
${asm.architecturalRemedies.map((r, idx) => `
${idx + 1}. **${r.hangMuc}**:
   - *Giải pháp*: ${r.giaiPhap}
`).join("\n")}

---

### TẦNG 5: CHỒNG LỚP ĐA TRƯỜNG PHÁI: BÁT TRẠCH & HUYỀN KHÔNG VẬN 9 (2024 - 2043)
* **Thời Vận Địa Lý**: ${fus.vanHuyenKhong || "Hạ Nguyên Vận 9 (2024 - 2043)"}
${bt ? `
* **Cung Phi Gia Chủ**: Sinh năm ${bt.birthYear} (${bt.gender}) => Mệnh **${bt.cungMenh}** (${bt.nhomMenh} - Hành ${bt.nguHanhMenh})
* **Du Niên Hướng Nhà**: Đắc **${bt.duNienHuongNha.toUpperCase()}** (${bt.diemHoaHopMenh}/100 Điểm)
  - *Bốn Hướng Cát Lợi*: ${bt.bonHuongCat.join(", ")}
  - *Bốn Hướng Hung Sát*: ${bt.bonHuongHung.join(", ")}
  - *Đánh Giá Hòa Hợp*: ${bt.danhGiaHoaHop}
` : '* **Bát Trạch**: Chưa nhập năm sinh gia chủ để tính toán cung phi cụ thể.'}

* **Tương Tác Thái Ất - Huyền Không Vận 9**:
${(fus.tuongTacThaiAtHuyenKhong || []).map(item => `  - *${item.hangMuc}*: ${item.tuongTac}`).join("\n")}

* **Kết Luận Đa Trường Phái**: ${fus.ketLuanDaTruongPhai || "Khí trường địa lý và thiên văn đạt độ đồng pha ổn định."}

---

### TẦNG 6: TRẠCH CÁT THỜI GIAN - GIỜ HOÀNG KIM KHỞI CÔNG & NHẬP TRẠCH
Danh mục khung giờ đại cát trong ngày hỗ trợ động thổ, cất nóc, nhập trạch:
${asm.goldenHours.map(g => `* **Giờ ${g.gio}** [${g.trangThai.toUpperCase()}]: ${g.khuyenNghi}`).join("\n")}

---

### TẦNG 7: MA TRẬN RỦI RO & PHƯƠNG ÁN KIỂM SOÁT KỸ THUẬT
| Hạng Mục Rủi Ro | Mức Độ | Cung Vị | Biện Pháp Kiểm Soát Vật Lý |
| :--- | :---: | :---: | :--- |
| Thủy Kích Hung Sát | Đại Hung | Cung ${asm.cungThuyKich} | ${asm.propertyType === 'Căn hộ chung cư' ? 'Lắp phễu bẫy nước xi-phông chống trào ngược mùi hộp gen, quạt hút van 1 chiều' : (asm.propertyType === 'Văn phòng công ty' ? 'Ép chế cụm WC & phòng server kỹ thuật, quạt hút thông gió âm trần 24/7' : (asm.propertyType === 'Nhà xưởng sản xuất' ? 'Bể xử lý nước thải nắp kín, kho chất thải nguy hại có gờ ngăn tràn hóa chất' : 'Ép chế công trình phụ (WC/Bể phốt), dựng rào cây xanh tán xạ hung sát'))} |
| Kế Thần Ám Muội | Trung Bình | Cung ${asm.cungKeThan} | Mở giếng trời / tăng cường đèn LED lấy sáng tự nhiên, quạt hút gió cưỡng bức |
| Hướng Nhà Nghịch Mệnh | Biến Đổi | Cửa Chính | Bố trí huyền quan ngăn gió lùa trực diện, dùng Bếp thông quan điều hòa khí |
| Hỏa Nhiệt Hướng Tây/Nam | Cần Lưu Ý | Cung Ngọ / Dậu | Dùng lam chắn nắng, dán phim nano cản nhiệt hoặc kính hộp Low-E giảm tải điều hòa |

---

### TẦNG 8: KẾT LUẬN & KIẾN NGHỊ THẨM ĐỊNH DƯƠNG TRẠCH
Hồ sơ thẩm định phong thủy Dương Trạch Thái Ất Thần Kinh đã lượng hóa đầy đủ các yếu tố Tọa Sơn (Bên Chủ) và Hướng Nhà (Bên Khách), cung cấp sơ đồ phân khu công năng và giải pháp vật lý kiến trúc minh bạch. Đề nghị chủ đầu tư và đơn vị tư vấn thiết kế bám sát các thông số trên để triển khai bản vẽ thi công hoàn chỉnh.
`;
  }

  function generateAmTrachEssay(asm) {
    const pk = asm.phanKim || {};
    const xsl = asm.xuyenSonLong || {};
    const diag = asm.microDiagnostic || {};

    return `# BÁO CÁO THẨM TRA PHONG THỦY ÂM TRẠCH THÁI ẤT THẦN KINH
**Đối tượng khảo sát**: KHUÔN VIÊN HUYỆT MỘ & AN NGHỈ TIÊN TỔ GIA TỘC  
**Thời điểm khảo sát**: ${asm.chartDateStr}  
**Quy chuẩn áp dụng**: Thái Ất Thần Kinh, Vi Phân La Kinh 120 Phân Kim, 72 Xuyên Sơn Long & Địa Kỹ Thuật Bền Vững  
**Kỷ luật văn phong**: Nghị định 30/2020/NĐ-CP, Rule 9 & Rule 12

---

### TẦNG 1: TỌA ĐỘ ĐỊA LÝ & TỔNG ĐIỂM ĐỊNH LƯỢNG ÂM TRẠCH
* **Tọa Huyệt (Lưng Mộ)**: Góc **${asm.tombSittingDeg.toFixed(1)}°** | Sơn **${asm.sittingMountain}** | Cung Thái Ất: **${asm.sittingCung}** (${THAP_LUC_FENGSHUI_NATURE[asm.sittingCung].huong})
* **Hướng Mộ (Bia Mộ)**: Góc **${asm.tombFacingDeg.toFixed(1)}°** | Sơn **${asm.facingMountain}** | Cung Thái Ất: **${asm.facingCung}** (${THAP_LUC_FENGSHUI_NATURE[asm.facingCung].huong})
* **Tổng Điểm Âm Trạch**: **${asm.tongDiemAmTrach}/100** Điểm => **[${asm.danhGiaLongHuyet.toUpperCase()}]**
  - *Phúc Khí Âm Đức*: ${asm.diemAmDucPhucKhi}/100 Điểm (Tụ khí huyết mạch nhiều đời)
  - *Hậu Duệ Khoa Bảng*: ${asm.diemHauDueKhoaBang}/100 Điểm (Tác động công danh đỗ đạt con cháu)
  - *An Lành Cốt Tủy*: ${asm.diemAnLanhHaiCot}/100 Điểm (Độ khô ráo, tĩnh tại trường tồn)

---

### TẦNG 2: TỨ THÚ SA BÀN BẢO VỆ HUYỆT MỘ
* **Huyền Vũ (Tọa Hậu - Điểm Tựa Lưng)**: ${asm.tuThu.huyenVuToaHau}. Đồi gò thoai thoải, đầy đặn vững chãi, che chắn gió bấc lạnh buốt phía sau.
* **Chu Tước (Minh Đường - Trước Mặt)**: ${asm.tuThu.chuTuocMinhDuong}. Thoáng đãng, có án sơn/triều sơn bao bọc, giữ khí tụ không tán.
* **Thanh Long (Bên Tả - Nam Đinh & Trưởng Chi)**: ${asm.tuThu.thanhLongTa}. Dải đất bên trái ôm bọc che chở, vượng cho con cháu ngành trưởng, nam nhân thành đạt.
* **Bạch Hổ (Bên Hữu - Nữ Đinh & Tài Lộc)**: ${asm.tuThu.bachHoHuu}. Dải đất bên phải thoai thoải thấp hơn Thanh Long một chút, vượng cho nữ giới và tích lũy điền sản.

---

### TẦNG 3: VI PHÂN LA KINH: 120 PHÂN KIM (3.0°) & 72 XUYÊN SƠN LONG (5.0°)
* **120 Phân Kim Tọa Huyệt**: Phân kim #${pk.index || 1} [${(pk.degreeStart || 0).toFixed(1)}° - ${(pk.degreeEnd || 0).toFixed(1)}°] | ${pk.canChi || ""}
  - *Phân Loại Tuyến Độ*: **[${(pk.phanLoai || "").toUpperCase()}]**
  - *Nguyên Lý Khí Học*: ${pk.nguyenLy || ""}
  - *Thẩm Định Âm Trạch*: ${pk.danhGiaAmTrach || ""}
* **72 Xuyên Sơn Long (Thấu Địa Long)**: Long #${xsl.index || 1} [${(xsl.degreeStart || 0).toFixed(1)}° - ${(xsl.degreeEnd || 0).toFixed(1)}°] | ${xsl.canChi || ""}
  - *Tính Chất Mạch Long*: **[${(xsl.tinhChatLong || "").toUpperCase()}]**
  - *Thẩm Định Mạch Khí*: ${xsl.danhGiaThauDia || ""}
* **Kiểm Định Tuyến Không Vong**: ${diag.warning || "Tuyến độ thuần khí an lành, không phạm đường Không Vong."}
* **Khuyến Nghị Vi Chỉnh Kim**: ${diag.recommendation || "Chấp thuận tuyến độ định vị."}

---

### TẦNG 4: VỊ TRÍ THẦN SÁT THÁI ẤT ĐỐI CHIẾU ÂM TRẠCH
* ★ **Thái Ất Ngự Trị**: Cung **${asm.cungThaiAt}** (${THAP_LUC_FENGSHUI_NATURE[asm.cungThaiAt].huong}) - Đế vương quý khí, nguồn sinh khí vô tận của vũ trụ.
* ★ **Ngũ Phúc Hộ Huyệt**: Cung **${asm.cungNguPhuc}** (${THAP_LUC_FENGSHUI_NATURE[asm.cungNguPhuc].huong}) - Phúc thần bao dung, hóa giải mọi biến chứng hiểm họa.
* ★ **Văn Xương Triều Sơn**: Cung **${asm.cungVanXuong}** (${THAP_LUC_FENGSHUI_NATURE[asm.cungVanXuong].huong}) - Cát khí khoa bảng, phát tiết thông minh cho hậu duệ.
* ▲ **Thủy Kích Sát Phương**: Cung **${asm.cungThuyKich}** (${THAP_LUC_FENGSHUI_NATURE[asm.cungThuyKich].huong}) - Tuyệt đối tránh hướng xói lở của dòng chảy ngầm và nước mưa xối thẳng vào huyệt.
* ▲ **Kế Thần Ám Muội**: Cung **${asm.cungKeThan}** (${THAP_LUC_FENGSHUI_NATURE[asm.cungKeThan].huong}) - Đề phòng rễ cây và tổ mối ngầm xâm lấn.

---

### TẦNG 5: CHẨN ĐOÁN CÁC BIẾN CHỨNG ÂM PHẦN (TOMB PATHOLOGY)
${asm.pathologies.length > 0 ? asm.pathologies.map(p => `
#### ▲ ${p.tenBenhTrach} [${p.mucDoNguyHiem.toUpperCase()}]
* **Dấu Hiệu Thực Tế**: ${p.dauHieuThucTe}
* **Tác Động Đến Hậu Duệ**: ${p.anhHuongConChau}
* **Biện Pháp Kỹ Thuật Khắc Phục**: ${p.bienPhapKyThuat}
`).join("\n") : '★ **CỐT TỦY BÌNH AN**: Huyệt mộ không phạm Thủy Kích, Hắc Kỳ hay Kế Thần; địa khí khô ráo, tĩnh tại và vững bền.'}

---

### TẦNG 6: 4 KẾ SÁCH ĐỊA KỸ THUẬT & THI CÔNG BỀN VỮNG (KHÔNG BÙA CHÚ)
${asm.civilRemediationPlans.map((plan, idx) => `
${idx + 1}. **${plan.hangMuc}**:
   - *Kỹ thuật thi công*: ${plan.giaiPhap}
`).join("\n")}

---

### TẦNG 7: TRẠCH CÁT THỜI GIAN - GIỜ HOÀNG KIM AN TÁNG & CẢI TÁNG
Danh mục thời khắc hoàng kim cho sự vụ hạ huyệt, phân kim định vị hoặc tạ mộ:
${asm.goldenHoursBurial.map(g => `* **Giờ ${g.gio}** [${g.trangThai.toUpperCase()}]: ${g.khuyenNghi}`).join("\n")}

---

### TẦNG 8: QUY TRÌNH THI CÔNG & GIÁM SÁT HẠ KIM
1. **Khảo sát địa chất & Dò mực nước ngầm**: Đào hố thăm dò sâu hơn đáy huyệt dự kiến 0.5m để kiểm tra dòng chảy ngầm và tính chất đất nền.
2. **Định vị La Kinh cao cấp**: Sử dụng la bàn đo góc điện tử hoặc ống ngắm quang học, căn chỉnh sai số kim trong phạm vi $\\le 0.5^\\circ$, kiên quyết tránh các vạch Đại / Tiểu Không Vong.
3. **Thi công hệ thống tiêu thoát nước ngầm**: Lắp đặt ống thoát nước bọc vải địa kỹ thuật trước khi hạ quách.
4. **Hạ quách và lấp đất phong thủy**: Sử dụng đất ngũ sắc hoặc đất thịt vàng đầm chặt từng lớp, tránh tạo hốc rỗng khiến nước mưa đọng lại.

---

### TẦNG 9: KẾT LUẬN & KIẾN NGHỊ THẨM ĐỊNH ÂM TRẠCH
Hồ sơ thẩm định phong thủy Âm Trạch Thái Ất Thần Kinh đã làm rõ toàn diện tương quan địa thế Tứ Thú, vi phân 120 Phân Kim, 72 Xuyên Sơn Long và chẩn đoán biến chứng mồ mả. Đề nghị dòng tộc triển khai đúng các giải pháp địa kỹ thuật công trình để đảm bảo chân linh tiên tổ an nghỉ nghìn năm, phúc ấm trường cửu cho muôn đời con cháu.
`;
  }

  // ==============================================================================
  // 8. XUẤT RA TOÀN CỤC (GLOBAL EXPORT)
  // ==============================================================================
  const NetaThaiAtFengShuiEngine = {
    TWENTY_FOUR_MOUNTAINS: TWENTY_FOUR_MOUNTAINS,
    TWENTY_FOUR_MOUNTAINS_ORDER: TWENTY_FOUR_MOUNTAINS_ORDER,
    THAP_LUC_FENGSHUI_NATURE: THAP_LUC_FENGSHUI_NATURE,
    PHAN_KIM_QUALITY: PHAN_KIM_QUALITY,
    XUYEN_SON_LONG_QUALITY: XUYEN_SON_LONG_QUALITY,
    DAI_KHONG_VONG_ANGLES: DAI_KHONG_VONG_ANGLES,
    VAN_9_BASE_STARS: VAN_9_BASE_STARS,
    CUNG_PHI_INFO: CUNG_PHI_INFO,
    BAT_TRACH_DU_NIEN: BAT_TRACH_DU_NIEN,

    degreeToMountain: degreeToMountain,
    analyzeDegreeMicro: analyzeDegreeMicro,
    calculateBatTrach: calculateBatTrach,
    fuseWithTaiyi: fuseWithTaiyi,
    assessDuongTrach: assessDuongTrach,
    assessAmTrach: assessAmTrach,
    evaluateFengShuiTiming: evaluateFengShuiTiming,
    generateTaiyiFengShuiEssay: generateTaiyiFengShuiEssay
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = NetaThaiAtFengShuiEngine;
  }
  global.NetaThaiAtFengShuiEngine = NetaThaiAtFengShuiEngine;

})(typeof window !== 'undefined' ? window : global);
