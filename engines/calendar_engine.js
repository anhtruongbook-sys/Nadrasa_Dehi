/**
 * NETA LIGHT - CALENDAR ENGINE (ĐỘNG CƠ LỊCH ÂM DƯƠNG THIÊN VĂN)
 * Thuật toán thiên văn Hồ Ngọc Đức (Múi giờ GMT+7) kết hợp:
 * - Chuyển đổi Dương lịch <-> Âm lịch chuẩn xác
 * - Can Chi Năm, Tháng, Ngày, Giờ & Nạp Âm 60 Hoa Giáp
 * - 24 Tiết Khí theo kinh độ Mặt Trời thực tế
 * - Nhị Thập Bát Tú (28 Sao) & Cầm Tinh
 * - Thập Nhị Kiến Trừ (12 Trực) & Việc Nên Làm / Kiêng Kỵ
 * - Ngày & Giờ Hoàng Đạo / Hắc Đạo
 * 100% Thuần JavaScript - Chạy Offline không phụ thuộc thư viện ngoài.
 */

(function (global) {
  'use strict';

  const PI = Math.PI;

  function INT(d) {
    return Math.floor(d);
  }

  // --- 1. JULIAN DAY & HỒ NGỌC ĐỨC CORE ---
  function jdFromDate(dd, mm, yy) {
    let a, y, m, jd;
    a = INT((14 - mm) / 12);
    y = yy + 4800 - a;
    m = mm + 12 * a - 3;
    jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
    if (jd < 2299161) {
      jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
    }
    return jd;
  }

  function jdToDate(jd) {
    let a, b, c, d, e, m, day, month, year;
    if (jd > 2299160) {
      a = jd + 32044;
      b = INT((4 * a + 3) / 146097);
      c = a - INT((b * 146097) / 4);
    } else {
      b = 0;
      c = jd + 32082;
    }
    d = INT((4 * c + 3) / 1461);
    e = c - INT((1461 * d) / 4);
    m = INT((5 * e + 2) / 153);
    day = e - INT((153 * m + 2) / 5) + 1;
    month = m + 3 - 12 * INT(m / 10);
    year = b * 100 + d - 4800 + INT(m / 10);
    return [day, month, year];
  }

  function jdToDateTime(jd, tz = 7) {
    let localJd = jd + 0.5 + tz / 24;
    let Z = Math.floor(localJd);
    let F = localJd - Z;
    let a, b, c, d, e, m, day, month, year;
    if (Z > 2299160) {
      let alpha = Math.floor((Z - 1867216.25) / 36524.25);
      a = Z + 1 + alpha - Math.floor(alpha / 4);
    } else {
      a = Z;
    }
    b = a + 1524;
    c = Math.floor((b - 122.1) / 365.25);
    d = Math.floor(365.25 * c);
    e = Math.floor((b - d) / 30.6001);
    day = b - d - Math.floor(30.6001 * e);
    month = e < 14 ? e - 1 : e - 13;
    year = month > 2 ? c - 4716 : c - 4715;

    let totalSeconds = Math.round(F * 86400);
    let hours = Math.floor(totalSeconds / 3600);
    let rem = totalSeconds % 3600;
    let minutes = Math.floor(rem / 60);
    let seconds = rem % 60;
    if (hours >= 24) {
      hours -= 24;
      day += 1;
    }
    const pad = (n) => String(n).padStart(2, '0');
    return {
      day, month, year, hours, minutes, seconds,
      dateStr: `${pad(day)}/${pad(month)}/${year}`,
      timeStr: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
      formatted: `${pad(day)}/${pad(month)}/${year} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
      shortStr: `${pad(day)}/${pad(month)} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    };
  }

  function NewMoon(k) {
    let T, T2, T3, dr, Jd1, M, Mpr, F, C1, JdNew;
    T = k / 1236.85;
    T2 = T * T;
    T3 = T2 * T;
    dr = PI / 180;
    Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
    M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
    C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
    C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
    C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
    C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
    C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
    C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
    C1 = C1 + 0.001 * Math.sin(dr * (2 * M - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + F));
    JdNew = Jd1 + C1;
    return JdNew;
  }

  function SunLongitude(jdn) {
    let T, T2, dr, L0, M, C, L, L_true;
    T = (jdn - 2451545.0) / 36525;
    T2 = T * T;
    dr = PI / 180;
    L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T2;
    M = 357.52911 + 35999.05029 * T - 0.0001537 * T2;
    C = (1.914602 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
    C = C + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M);
    C = C + 0.000289 * Math.sin(dr * 3 * M);
    L = L0 + C;
    L_true = L * dr;
    L_true = L_true - PI * 2 * INT(L_true / (PI * 2));
    return L_true;
  }

  function getSunLongitude(dayNumber, timeZone = 7) {
    return SunLongitude(dayNumber - 0.5 - timeZone / 24);
  }

  function getNewMoonDay(k, timeZone = 7) {
    return INT(NewMoon(k) + 0.5 + timeZone / 24);
  }

  function getLunarMonth11(yy, timeZone = 7) {
    let k, off, nm, sunLong;
    off = jdFromDate(31, 12, yy) - 2415021;
    k = INT(off / 29.530588853);
    nm = getNewMoonDay(k, timeZone);
    sunLong = getSunLongitude(nm, timeZone);
    if (sunLong >= PI * 3 / 2) {
      nm = getNewMoonDay(k - 1, timeZone);
    }
    return nm;
  }

  function getLeapMonthOffset(a11, timeZone = 7) {
    let k, last, i, arc, a;
    k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    last = 0;
    i = 1;
    arc = INT(getSunLongitude(getNewMoonDay(k, timeZone), timeZone) / (PI / 6));
    do {
      last = arc;
      a = getNewMoonDay(k + i, timeZone);
      arc = INT(getSunLongitude(a, timeZone) / (PI / 6));
      i = i + 1;
    } while (arc != last && i < 14);
    return i - 1;
  }

  function convertSolar2Lunar(dd, mm, yy, timeZone = 7) {
    let k, dayNumber, monthStart, a11, b11, lunarDay, lunarMonth;
    let lunarYear, lunarLeap, diff, leapMonthDiff;
    dayNumber = jdFromDate(dd, mm, yy);
    k = INT((dayNumber - 2415021.076998695) / 29.530588853);
    monthStart = getNewMoonDay(k + 1, timeZone);
    if (monthStart > dayNumber) {
      monthStart = getNewMoonDay(k, timeZone);
    }
    a11 = getLunarMonth11(yy, timeZone);
    b11 = a11;
    if (a11 >= monthStart) {
      lunarYear = yy;
      a11 = getLunarMonth11(yy - 1, timeZone);
    } else {
      lunarYear = yy + 1;
      b11 = getLunarMonth11(yy + 1, timeZone);
    }
    lunarDay = dayNumber - monthStart + 1;
    diff = INT((monthStart - a11) / 29);
    lunarLeap = 0;
    lunarMonth = diff + 11;
    if (b11 - a11 > 365) {
      leapMonthDiff = getLeapMonthOffset(a11, timeZone);
      if (diff >= leapMonthDiff) {
        lunarMonth = diff + 10;
        if (diff === leapMonthDiff) {
          lunarLeap = 1;
        }
      }
    }
    if (lunarMonth > 12) {
      lunarMonth = lunarMonth - 12;
    }
    if (lunarMonth >= 11 && diff < 4) {
      lunarYear -= 1;
    }
    return {
      day: lunarDay,
      month: lunarMonth,
      year: lunarYear,
      isLeap: lunarLeap === 1
    };
  }

  function convertLunar2Solar(lunarDay, lunarMonth, lunarYear, lunarLeap = 0, timeZone = 7) {
    let k, a11, b11, off, leapOff, leapMonth, monthStart;
    if (lunarMonth < 11) {
      a11 = getLunarMonth11(lunarYear - 1, timeZone);
      b11 = getLunarMonth11(lunarYear, timeZone);
    } else {
      a11 = getLunarMonth11(lunarYear, timeZone);
      b11 = getLunarMonth11(lunarYear + 1, timeZone);
    }
    k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
    off = lunarMonth - 11;
    if (off < 0) off += 12;
    if (b11 - a11 > 365) {
      leapOff = getLeapMonthOffset(a11, timeZone);
      leapMonth = leapOff - 2;
      if (leapMonth < 0) leapMonth += 12;
      if (lunarLeap !== 0 && lunarMonth !== leapMonth) {
        return null;
      } else if (lunarLeap !== 0 || off >= leapOff) {
        off += 1;
      }
    }
    monthStart = getNewMoonDay(k + off, timeZone);
    const [solarDay, solarMonth, solarYear] = jdToDate(monthStart + lunarDay - 1);
    return {
      day: solarDay,
      month: solarMonth,
      year: solarYear
    };
  }

  // --- 2. CAN CHI, NẠP ÂM & TIẾT KHÍ CONSTANTS ---
  const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

  const NAP_AM_MAP = {
    'Giáp Tý': 'Hải Trung Kim', 'Ất Sửu': 'Hải Trung Kim',
    'Bính Dần': 'Lư Trung Hỏa', 'Đinh Mão': 'Lư Trung Hỏa',
    'Mậu Thìn': 'Đại Lâm Mộc', 'Kỷ Tỵ': 'Đại Lâm Mộc',
    'Canh Ngọ': 'Lộ Bàng Thổ', 'Tân Mùi': 'Lộ Bàng Thổ',
    'Nhâm Thân': 'Kiếm Phong Kim', 'Quý Dậu': 'Kiếm Phong Kim',
    'Giáp Tuất': 'Sơn Đầu Hỏa', 'Ất Hợi': 'Sơn Đầu Hỏa',
    'Bính Tý': 'Giản Hạ Thủy', 'Đinh Sửu': 'Giản Hạ Thủy',
    'Mậu Dần': 'Thành Đầu Thổ', 'Kỷ Mão': 'Thành Đầu Thổ',
    'Canh Thìn': 'Bạch Lạp Kim', 'Tân Tỵ': 'Bạch Lạp Kim',
    'Nhâm Ngọ': 'Dương Liễu Mộc', 'Quý Mùi': 'Dương Liễu Mộc',
    'Giáp Thân': 'Tuyền Trung Thủy', 'Ất Dậu': 'Tuyền Trung Thủy',
    'Bính Tuất': 'Ốc Thượng Thổ', 'Đinh Hợi': 'Ốc Thượng Thổ',
    'Mậu Tý': 'Tích Lịch Hỏa', 'Kỷ Sửu': 'Tích Lịch Hỏa',
    'Canh Dần': 'Tùng Bách Mộc', 'Tân Mão': 'Tùng Bách Mộc',
    'Nhâm Thìn': 'Trường Lưu Thủy', 'Quý Tỵ': 'Trường Lưu Thủy',
    'Giáp Ngọ': 'Sa Trung Kim', 'Ất Mùi': 'Sa Trung Kim',
    'Bính Thân': 'Sơn Hạ Hỏa', 'Đinh Dậu': 'Sơn Hạ Hỏa',
    'Mậu Tuất': 'Bình Địa Mộc', 'Kỷ Hợi': 'Bình Địa Mộc',
    'Canh Tý': 'Bích Thượng Thổ', 'Tân Sửu': 'Bích Thượng Thổ',
    'Nhâm Dần': 'Kim Bạch Kim', 'Quý Mão': 'Kim Bạch Kim',
    'Giáp Thìn': 'Phúc Đăng Hỏa', 'Ất Tỵ': 'Phúc Đăng Hỏa',
    'Bính Ngọ': 'Thiên Hà Thủy', 'Đinh Mùi': 'Thiên Hà Thủy',
    'Mậu Thân': 'Đại Trạch Thổ', 'Kỷ Dậu': 'Đại Trạch Thổ',
    'Canh Tuất': 'Thoa Xuyến Kim', 'Tân Hợi': 'Thoa Xuyến Kim',
    'Nhâm Tý': 'Tang Đố Mộc', 'Quý Sửu': 'Tang Đố Mộc',
    'Giáp Dần': 'Đại Khê Thủy', 'Ất Mão': 'Đại Khê Thủy',
    'Bính Thìn': 'Sa Trung Thổ', 'Đinh Tỵ': 'Sa Trung Thổ',
    'Mậu Ngọ': 'Thiên Thượng Hỏa', 'Kỷ Mùi': 'Thiên Thượng Hỏa',
    'Canh Thân': 'Thạch Lựu Mộc', 'Tân Dậu': 'Thạch Lựu Mộc',
    'Nhâm Tuất': 'Đại Hải Thủy', 'Quý Hợi': 'Đại Hải Thủy'
  };

  const SOLAR_TERMS = [
    { name: "Xuân Phân", angle: 0 },
    { name: "Thanh Minh", angle: 15 },
    { name: "Cốc Vũ", angle: 30 },
    { name: "Lập Hạ", angle: 45 },
    { name: "Tiểu Mãn", angle: 60 },
    { name: "Mang Chủng", angle: 75 },
    { name: "Hạ Chí", angle: 90 },
    { name: "Tiểu Thử", angle: 105 },
    { name: "Đại Thử", angle: 120 },
    { name: "Lập Thu", angle: 135 },
    { name: "Xử Thử", angle: 150 },
    { name: "Bạch Lộ", angle: 165 },
    { name: "Thu Phân", angle: 180 },
    { name: "Hàn Lộ", angle: 195 },
    { name: "Sương Giáng", angle: 210 },
    { name: "Lập Đông", angle: 225 },
    { name: "Tiểu Tuyết", angle: 240 },
    { name: "Đại Tuyết", angle: 255 },
    { name: "Đông Chí", angle: 270 },
    { name: "Tiểu Hàn", angle: 285 },
    { name: "Đại Hàn", angle: 300 },
    { name: "Lập Xuân", angle: 315 },
    { name: "Vũ Thủy", angle: 330 },
    { name: "Kinh Trập", angle: 345 }
  ];

  // 28 Tú
  const MANSIONS_28 = [
    { name: "Giác", animal: "Mộc Giao (Cá sấu)", element: "Mộc", group: "Đông (Thanh Long)", type: "cat", desc: "Chủ về công danh, khoa bảng, khởi sự đại cát." },
    { name: "Cang", animal: "Kim Long (Rồng)", element: "Kim", group: "Đông (Thanh Long)", type: "hung", desc: "Chủ về tranh chấp kiện tụng, nên cẩn trọng lời nói." },
    { name: "Đê", animal: "Thổ Lạc (Cầy)", element: "Thổ", group: "Đông (Thanh Long)", type: "hung", desc: "Chủ về bất trắc, đề phòng tiểu nhân quấy phá." },
    { name: "Phòng", animal: "Nhật Thỏ (Thỏ)", element: "Hỏa", group: "Đông (Thanh Long)", type: "cat", desc: "Đại cát thần, tài lộc dồi dào, hôn sự thuận hòa." },
    { name: "Tâm", animal: "Nguyệt Hồ (Cáo)", element: "Hỏa", group: "Đông (Thanh Long)", type: "hung", desc: "Chủ về thị phi, tránh khởi đại sự." },
    { name: "Vĩ", animal: "Hỏa Hổ (Cọp)", element: "Hỏa", group: "Đông (Thanh Long)", type: "cat", desc: "Hậu vận hanh thông, xây dựng, kết hôn đại cát." },
    { name: "Cơ", animal: "Thủy Báo (Báo)", element: "Thủy", group: "Đông (Thanh Long)", type: "cat", desc: "Kinh doanh phát tài, buôn bán đắc lộc." },
    { name: "Đẩu", animal: "Mộc Giải (Cua)", element: "Mộc", group: "Bắc (Huyền Vũ)", type: "cat", desc: "Chủ về học vấn, đỗ đạt, công danh sáng lạng." },
    { name: "Ngưu", animal: "Kim Ngưu (Trâu)", element: "Kim", group: "Bắc (Huyền Vũ)", type: "hung", desc: "Lao lực hao tài, tránh đầu tư mạo hiểm." },
    { name: "Nữ", animal: "Thổ Phúc (Dơi)", element: "Thổ", group: "Bắc (Huyền Vũ)", type: "hung", desc: "Dễ hao tổn tài chính, nên tiết chế chi tiêu." },
    { name: "Hư", animal: "Nhật Thử (Chuột)", element: "Hỏa", group: "Bắc (Huyền Vũ)", type: "hung", desc: "Hư ảo bất định, không nên nhẹ dạ cả tin." },
    { name: "Nguy", animal: "Nguyệt Yến (Chim én)", element: "Hỏa", group: "Bắc (Huyền Vũ)", type: "hung", desc: "Nguy hiểm rình rập, cần giữ tâm an định." },
    { name: "Thất", animal: "Hỏa Trư (Heo)", element: "Hỏa", group: "Bắc (Huyền Vũ)", type: "cat", desc: "Quy hoạch xây dựng, mưu sự đại thành." },
    { name: "Bích", animal: "Thủy Du (Nhím)", element: "Thủy", group: "Bắc (Huyền Vũ)", type: "cat", desc: "Văn chương xán lạn, tin vui phương xa gửi về." },
    { name: "Khuê", animal: "Mộc Lang (Sói)", element: "Mộc", group: "Tây (Bạch Hổ)", type: "hung", desc: "Phòng ngừa trộm cắp, tránh tranh chấp tiền nong." },
    { name: "Lâu", animal: "Kim Cẩu (Chó)", element: "Kim", group: "Tây (Bạch Hổ)", type: "cat", desc: "Thu hoạch mùa màng, bội thu từ công sức cũ." },
    { name: "Vị", animal: "Thổ Trĩ (Chim trĩ)", element: "Thổ", group: "Tây (Bạch Hổ)", type: "cat", desc: "Lộc ăn uống dồi dào, hội họp thân tình vui vẻ." },
    { name: "Mão", animal: "Nhật Kê (Gà)", element: "Hỏa", group: "Tây (Bạch Hổ)", type: "hung", desc: "Gia đạo bất an, tránh đôi co tranh cãi." },
    { name: "Tất", animal: "Nguyệt Ô (Quạ)", element: "Hỏa", group: "Tây (Bạch Hổ)", type: "cat", desc: "Thu hoạch kết quả, gia đạo êm ấm bình an." },
    { name: "Chủy", animal: "Hỏa Hầu (Khỉ)", element: "Hỏa", group: "Tây (Bạch Hổ)", type: "hung", desc: "Cẩn thận lừa dối, kỵ ký giao ước mới." },
    { name: "Sâm", animal: "Thủy Viên (Vượn)", element: "Thủy", group: "Tây (Bạch Hổ)", type: "hung", desc: "Thân tâm mệt mỏi, nên tĩnh dưỡng thiền định." },
    { name: "Tỉnh", animal: "Mộc Ngạn (Rái cá)", element: "Mộc", group: "Nam (Chu Tước)", type: "cat", desc: "Thi ân bố đức, gieo duyên lành đón phúc báo." },
    { name: "Quỷ", animal: "Kim Dương (Dê)", element: "Kim", group: "Nam (Chu Tước)", type: "hung", desc: "Âm tà thị phi, giữ mình ngay thẳng tránh họa." },
    { name: "Liễu", animal: "Thổ Chương (Hươu)", element: "Thổ", group: "Nam (Chu Tước)", type: "hung", desc: "Dễ hao tổn danh tiếng, kỵ xuất hành xa." },
    { name: "Tinh", animal: "Nhật Mã (Ngựa)", element: "Hỏa", group: "Nam (Chu Tước)", type: "cat", desc: "Tin vui mau lẹ, hành động đột phá chuyển biến." },
    { name: "Trương", animal: "Nguyệt Lộc (Hươu hoa)", element: "Hỏa", group: "Nam (Chu Tước)", type: "cat", desc: "Lộc trời ban tặng, gặp may mắn bất ngờ." },
    { name: "Dực", animal: "Hỏa Xà (Rắn)", element: "Hỏa", group: "Nam (Chu Tước)", type: "hung", desc: "Hư danh ngoài mặt, cần chú trọng thực chất." },
    { name: "Chẩn", animal: "Thủy Dẫn (Giun)", element: "Thủy", group: "Nam (Chu Tước)", type: "cat", desc: "Khiêm nhường tích lũy, tiến chậm nhưng vững vàng." }
  ];

  // 12 Trực
  const TRUC_12 = [
    { name: "Kiến", type: "cat", good: "Xuất hành, ký kết, cầu tài", bad: "Động thổ, an táng" },
    { name: "Trừ", type: "cat", good: "Trị bệnh, quét dọn, giải trừ oán kết", bad: "Cưới hỏi, xuất tiền lớn" },
    { name: "Mãn", type: "cat", good: "Khai trương, nhập trạch, cầu phúc", bad: "Kiện tụng, chữa bệnh" },
    { name: "Bình", type: "binh", good: "Tu sửa, may mặc, gặp gỡ giao lưu", bad: "Đi thuyền, mạo hiểm" },
    { name: "Định", type: "cat", good: "Ký hợp đồng, đính hôn, lập kế hoạch", bad: "Kiện cáo, xuất quân" },
    { name: "Chấp", type: "binh", good: "Gieo trồng, bắt đầu giữ gìn", bad: "Di dời, mở kho" },
    { name: "Phá", type: "hung", good: "Phá dỡ nhà cũ, trừ mối mọt", bad: "Mọi việc lớn (đặc biệt kỵ kết hôn, khai trương)" },
    { name: "Nguy", type: "hung", good: "Lễ bái, cầu an, cúng tế", bad: "Trèo cao, đi xa, mưu việc lớn" },
    { name: "Thành", type: "cat", good: "Mọi sự đều tốt: Khai trương, cưới hỏi, nhập học", bad: "Kiện tụng, tranh chấp" },
    { name: "Thâu", type: "cat", good: "Thu nợ, thu hoạch, tích lũy", bad: "Cho vay, an táng" },
    { name: "Khai", type: "cat", good: "Khai trương, bắt đầu dự án, kết hôn", bad: "Động thổ, chôn cất" },
    { name: "Bế", type: "hung", good: "Đắp đê, ngăn nước, bế môn dưỡng khí", bad: "Mở mắt, chữa bệnh, xuất hành" }
  ];

  // Giờ Hoàng Đạo theo Chi Ngày
  const GIO_HOANG_DAO_TABLE = {
    'Tý': ['Tý', 'Sửu', 'Mão', 'Ngọ', 'Thân', 'Dậu'],
    'Ngọ': ['Tý', 'Sửu', 'Mão', 'Ngọ', 'Thân', 'Dậu'],
    'Sửu': ['Dần', 'Mão', 'Tỵ', 'Thân', 'Tuất', 'Hợi'],
    'Mùi': ['Dần', 'Mão', 'Tỵ', 'Thân', 'Tuất', 'Hợi'],
    'Dần': ['Tý', 'Sửu', 'Thìn', 'Tỵ', 'Mùi', 'Tuất'],
    'Thân': ['Tý', 'Sửu', 'Thìn', 'Tỵ', 'Mùi', 'Tuất'],
    'Mão': ['Tý', 'Dần', 'Mão', 'Ngọ', 'Mùi', 'Dậu'],
    'Dậu': ['Tý', 'Dần', 'Mão', 'Ngọ', 'Mùi', 'Dậu'],
    'Thìn': ['Dần', 'Thìn', 'Tỵ', 'Thân', 'Dậu', 'Hợi'],
    'Tuất': ['Dần', 'Thìn', 'Tỵ', 'Thân', 'Dậu', 'Hợi'],
    'Tỵ': ['Sửu', 'Thìn', 'Ngọ', 'Mùi', 'Tuất', 'Hợi'],
    'Hợi': ['Sửu', 'Thìn', 'Ngọ', 'Mùi', 'Tuất', 'Hợi']
  };

  // Ngày Hoàng Đạo theo Chi Tháng Âm Lịch (Tháng 1-12)
  // 1: Dần, 2: Mão, 3: Thìn, 4: Tỵ, 5: Ngọ, 6: Mùi, 7: Thân, 8: Dậu, 9: Tuất, 10: Hợi, 11: Tý, 12: Sửu
  const HOANG_DAO_MONTH_START = {
    1: 'Tý', 2: 'Dần', 3: 'Thìn', 4: 'Ngọ', 5: 'Thân', 6: 'Tuất',
    7: 'Tý', 8: 'Dần', 9: 'Thìn', 10: 'Ngọ', 11: 'Thân', 12: 'Tuất'
  };

  const TWELVE_SPIRITS = [
    { name: "Thanh Long", isHoangDao: true },
    { name: "Minh Đường", isHoangDao: true },
    { name: "Thiên Hình", isHoangDao: false },
    { name: "Chu Tước", isHoangDao: false },
    { name: "Kim Quỹ", isHoangDao: true },
    { name: "Thiên Đức", isHoangDao: true },
    { name: "Bạch Hổ", isHoangDao: false },
    { name: "Ngọc Đường", isHoangDao: true },
    { name: "Thiên Lao", isHoangDao: false },
    { name: "Huyền Vũ", isHoangDao: false },
    { name: "Tư Mệnh", isHoangDao: true },
    { name: "Câu Trần", isHoangDao: false }
  ];

  // --- 3. PUBLIC CALENDAR API ---
  const NetaCalendarEngine = {
    // Chuyển đổi Dương lịch -> Âm lịch
    solar2Lunar(d, m, y, tz = 7) {
      return convertSolar2Lunar(d, m, y, tz);
    },

    // Chuyển đổi Âm lịch -> Dương lịch
    lunar2Solar(d, m, y, isLeap = 0, tz = 7) {
      return convertLunar2Solar(d, m, y, isLeap ? 1 : 0, tz);
    },

    // Lấy thông tin Julian Day
    getJulianDay(d, m, y) {
      return jdFromDate(d, m, y);
    },

    // Lấy Tiết Khí hiện tại theo kinh độ Mặt trời
    getSolarTerm(d, m, y, hour = 12, minute = 0, tz = 7) {
      const jd = jdFromDate(d, m, y);
      const dayFraction = (hour + minute / 60) / 24;
      const sunRad = SunLongitude(jd + dayFraction - 0.5 - tz / 24);
      const sunDeg = ((sunRad * 180 / PI) % 360 + 360) % 360;
      // Tìm tiết khí gần nhất
      const termIdx = Math.floor(sunDeg / 15);
      return SOLAR_TERMS[termIdx] ? SOLAR_TERMS[termIdx].name : "Xuân Phân";
    },

    // Lấy chi tiết Tiết Khí và thời điểm chuyển tiết khí chính xác từng giây
    getSolarTermDetails(d, m, y, hour = 12, minute = 0, tz = 7) {
      // 1. Ưu tiên sử dụng động cơ thiên văn VSOP87D chuẩn xác đến từng giây từ QMDJCore nếu có
      if (global.QMDJCore && global.QMDJCore.TheArtOfBecomingInvisible) {
        try {
          const dateObj = new Date(y, m - 1, d, hour, minute, 0);
          const tao = new global.QMDJCore.TheArtOfBecomingInvisible(dateObj);
          const idx = tao.solarTerms;
          const curDate = tao.during[idx];
          const nextIdx = (idx + 1) % 24;
          const nextDate = tao.during[nextIdx];
          const pad = n => String(n).padStart(2, '0');
          const toDetail = (dt) => {
            const day = dt.getDate();
            const month = dt.getMonth() + 1;
            const year = dt.getFullYear();
            const hours = dt.getHours();
            const minutes = dt.getMinutes();
            const seconds = dt.getSeconds();
            return {
              day, month, year, hours, minutes, seconds,
              dateStr: `${pad(day)}/${pad(month)}/${year}`,
              timeStr: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
              formatted: `${pad(day)}/${pad(month)}/${year} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
              shortStr: `${pad(day)}/${pad(month)} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
            };
          };
          const curTrans = toDetail(curDate);
          const nextTrans = toDetail(nextDate);
          const SOLAR_TERMS_24 = [
            'Tiểu Hàn', 'Đại Hàn', 'Lập Xuân', 'Vũ Thủy', 'Kinh Trập', 'Xuân Phân',
            'Thanh Minh', 'Cốc Vũ', 'Lập Hạ', 'Tiểu Mãn', 'Mang Chủng', 'Hạ Chí',
            'Tiểu Thử', 'Đại Thử', 'Lập Thu', 'Xử Thử', 'Bạch Lộ', 'Thu Phân',
            'Hàn Lộ', 'Sương Giáng', 'Lập Đông', 'Tiểu Tuyết', 'Đại Tuyết', 'Đông Chí'
          ];
          const termName = SOLAR_TERMS_24[idx] || (SOLAR_TERMS[idx] ? SOLAR_TERMS[idx].name : '');
          const nextTermName = SOLAR_TERMS_24[nextIdx] || (SOLAR_TERMS[nextIdx] ? SOLAR_TERMS[nextIdx].name : '');
          return {
            term: termName,
            index: idx,
            transition: curTrans,
            nextTerm: nextTermName,
            nextTransition: nextTrans,
            displayStr: `${termName} (Chuyển: ${curTrans.shortStr})`,
            fullDisplayStr: `${termName} (Chuyển: ${curTrans.formatted})`
          };
        } catch (e) {
          // Fallback sang giải thuật giải tích
        }
      }

      // 2. Thuật toán giải tích (Fallback độc lập chuẩn xác đến từng giây)
      const jd = jdFromDate(d, m, y);
      const dayFraction = (hour + minute / 60) / 24;
      const jdNow = jd + dayFraction - 0.5 - tz / 24;
      const sunRad = SunLongitude(jdNow);
      const sunDeg = ((sunRad * 180 / PI) % 360 + 360) % 360;

      const termIdx = Math.floor(sunDeg / 15);
      const currentTerm = SOLAR_TERMS[termIdx] || { name: 'Xuân Phân', angle: 0 };
      const nextIdx = (termIdx + 1) % 24;
      const nextTerm = SOLAR_TERMS[nextIdx] || { name: 'Thanh Minh', angle: 15 };

      function solveAngle(targetAngle, searchStart, searchEnd) {
        function getDiff(j) {
          const rad = SunLongitude(j);
          const deg = ((rad * 180 / PI) % 360 + 360) % 360;
          let diff = deg - targetAngle;
          while (diff > 180) diff -= 360;
          while (diff < -180) diff += 360;
          return diff;
        }
        let low = searchStart;
        let high = searchEnd;
        for (let i = 0; i < 40; i++) {
          const mid = (low + high) / 2;
          const dMid = getDiff(mid);
          if (dMid < 0) low = mid;
          else high = mid;
        }
        return (low + high) / 2;
      }

      const curJd = solveAngle(currentTerm.angle, jdNow - 18, jdNow);
      const nextJd = solveAngle(nextTerm.angle, jdNow, jdNow + 18);

      const curTrans = jdToDateTime(curJd, tz);
      const nextTrans = jdToDateTime(nextJd, tz);

      return {
        term: currentTerm.name,
        angle: currentTerm.angle,
        currentDeg: parseFloat(sunDeg.toFixed(2)),
        transition: curTrans,
        nextTerm: nextTerm.name,
        nextTransition: nextTrans,
        displayStr: `${currentTerm.name} (Chuyển: ${curTrans.shortStr})`,
        fullDisplayStr: `${currentTerm.name} (Chuyển: ${curTrans.formatted})`
      };
    },

    // Lấy Can Chi Tứ Trụ chuẩn xác theo LỊCH TIẾT KHÍ (Bát Tự Tứ Trụ & Kỳ Môn)
    getSolarTermCanChi(d, m, y, hour = 12, minute = 0, tz = 7) {
      const jd = jdFromDate(d, m, y);
      const dayFraction = (hour + minute / 60) / 24;
      const sunRad = SunLongitude(jd + dayFraction - 0.5 - tz / 24);
      const sunDeg = ((sunRad * 180 / PI) % 360 + 360) % 360;

      // 1. Tiết khí & thời điểm chuyển tiết khí
      const solarTermDetails = this.getSolarTermDetails(d, m, y, hour, minute, tz);
      const solarTerm = solarTermDetails.term;

      // 2. Can Chi Năm (theo Lập Xuân 315 độ)
      let baziYear = y;
      if (m === 1 || (m === 2 && sunDeg < 315)) {
        baziYear = y - 1;
      }
      const yOffset = baziYear - 4;
      const yearGanIdx = ((yOffset % 10) + 10) % 10;
      const yearZhiIdx = ((yOffset % 12) + 12) % 12;
      const yearCanChi = `${CAN[yearGanIdx]} ${CHI[yearZhiIdx]}`;
      const yearNapAm = NAP_AM_MAP[yearCanChi] || '';

      // 3. Can Chi Tháng (theo 12 Tiết Lệnh từ Lập Xuân 315 độ)
      const monthStep = Math.floor(((sunDeg - 315 + 360) % 360) / 30); // 0=Dần .. 11=Sửu
      const monthZhiIdx = (2 + monthStep) % 12;
      const startMonthStemIdx = ((yearGanIdx % 5) * 2 + 2) % 10;
      const monthGanIdx = (startMonthStemIdx + monthStep) % 10;
      const monthCanChi = `${CAN[monthGanIdx]} ${CHI[monthZhiIdx]}`;
      const monthNapAm = NAP_AM_MAP[monthCanChi] || '';

      // 4. Can Chi Ngày (chuẩn Julian Day)
      const dayOffset = Math.floor(jd + 0.5);
      const dayGanIdx = (dayOffset + 9) % 10;
      const dayZhiIdx = (dayOffset + 1) % 12;
      const dayCanChi = `${CAN[dayGanIdx]} ${CHI[dayZhiIdx]}`;
      const dayNapAm = NAP_AM_MAP[dayCanChi] || '';

      // 5. Can Chi Giờ (Ngũ Thử Độn)
      const hourZhiIdx = Math.floor((hour + 1) / 2) % 12;
      const hourStartStemIdx = ((dayGanIdx % 5) * 2) % 10;
      const hourGanIdx = (hourStartStemIdx + hourZhiIdx) % 10;
      const hourCanChi = `${CAN[hourGanIdx]} ${CHI[hourZhiIdx]}`;

      // 6. Mệnh Cung Bát Tự Chuẩn
      const mengGongZhiIdx = ((13 - (monthStep + 1) + hourZhiIdx) % 12 + 12) % 12;
      const mengGongStep = ((mengGongZhiIdx - 2) % 12 + 12) % 12;
      const mengGongGanIdx = (startMonthStemIdx + mengGongStep) % 10;
      const mengGongCanChi = `${CAN[mengGongGanIdx]} ${CHI[mengGongZhiIdx]}`;

      return {
        year: yearCanChi,
        yearNapAm,
        month: monthCanChi,
        monthNapAm,
        day: dayCanChi,
        dayNapAm,
        hour: hourCanChi,
        solarTerm,
        solarTermDetails,
        solarTermStr: solarTermDetails.displayStr,
        solarTermFullStr: solarTermDetails.fullDisplayStr,
        sunDeg,
        baziYear,
        monthStep,
        mengGong: mengGongCanChi,
        mengGongZhi: CHI[mengGongZhiIdx]
      };
    },

    // Lấy Can Chi Tứ Trụ cho 1 ngày giờ bất kỳ
    getCanChi(d, m, y, hour = 12) {
      const jd = jdFromDate(d, m, y);
      const lunar = convertSolar2Lunar(d, m, y, 7);

      // Can Chi Năm (theo Năm Âm Lịch)
      const lYear = lunar.year;
      const yearGanIdx = ((lYear - 4) % 10 + 10) % 10;
      const yearZhiIdx = ((lYear - 4) % 12 + 12) % 12;
      const yearCanChi = `${CAN[yearGanIdx]} ${CHI[yearZhiIdx]}`;
      const yearNapAm = NAP_AM_MAP[yearCanChi] || '';

      // Can Chi Tháng
      // Tháng 11 Âm lịch luôn là Tý (idx 0), Tháng 1 là Dần (idx 2)
      const monthZhiIdx = (lunar.month + 1) % 12;
      const monthStartStemIdx = ((yearGanIdx % 5) * 2 + 2) % 10;
      const monthGanIdx = (monthStartStemIdx + (lunar.month - 1) + 10) % 10;
      const monthCanChi = `${CAN[monthGanIdx]} ${CHI[monthZhiIdx]}`;
      const monthNapAm = NAP_AM_MAP[monthCanChi] || '';

      // Can Chi Ngày (Công thức chuẩn Julian Day: JD 2451545.0 = Canh Thìn)
      const dayOffset = Math.floor(jd + 0.5);
      const dayGanIdx = (dayOffset + 9) % 10;
      const dayZhiIdx = (dayOffset + 1) % 12;
      const dayCanChi = `${CAN[dayGanIdx]} ${CHI[dayZhiIdx]}`;
      const dayNapAm = NAP_AM_MAP[dayCanChi] || '';

      // Can Chi Giờ
      // Giờ Tý bắt đầu từ 23h hôm trước đến 0h59
      let hourZhiIdx = Math.floor((hour + 1) / 2) % 12;
      const hourStartStemIdx = ((dayGanIdx % 5) * 2) % 10;
      const hourGanIdx = (hourStartStemIdx + hourZhiIdx) % 10;
      const hourCanChi = `${CAN[hourGanIdx]} ${CHI[hourZhiIdx]}`;

      return {
        year: yearCanChi,
        yearNapAm: yearNapAm,
        month: monthCanChi,
        monthNapAm: monthNapAm,
        day: dayCanChi,
        dayNapAm: dayNapAm,
        dayZhi: CHI[dayZhiIdx],
        hour: hourCanChi,
        lunarYear: lYear
      };
    },

    // Lấy Nhị Thập Bát Tú
    getMansion(d, m, y) {
      const jd = jdFromDate(d, m, y);
      const diff = jd - 2449718.5; // Mốc 01/01/1995 là Hư (index 10)
      const index = Math.floor((10 + diff) % 28 + 28) % 28;
      return MANSIONS_28[index];
    },

    // Lấy 12 Trực (Thập Nhị Kiến Trừ)
    getTruc(d, m, y) {
      const lunar = convertSolar2Lunar(d, m, y, 7);
      const canChi = this.getCanChi(d, m, y);
      const dayZhiIdx = CHI.indexOf(canChi.dayZhi);
      // Chi tháng: Tháng 1 là Dần (2), Tháng 2 Mão (3)...
      const monthZhiIdx = (lunar.month + 1) % 12;
      // Trực Kiến bắt đầu khi DayZhi == MonthZhi
      const trucIdx = (dayZhiIdx - monthZhiIdx + 12) % 12;
      return TRUC_12[trucIdx];
    },

    // Kiểm tra Ngày Hoàng Đạo / Hắc Đạo
    getDayHoangDao(d, m, y) {
      const lunar = convertSolar2Lunar(d, m, y, 7);
      const canChi = this.getCanChi(d, m, y);
      const startZhi = HOANG_DAO_MONTH_START[lunar.month] || 'Tý';
      const startIdx = CHI.indexOf(startZhi);
      const dayZhiIdx = CHI.indexOf(canChi.dayZhi);
      const spiritIdx = (dayZhiIdx - startIdx + 12) % 12;
      const spirit = TWELVE_SPIRITS[spiritIdx];
      return {
        spiritName: spirit.name,
        isHoangDao: spirit.isHoangDao,
        label: spirit.isHoangDao ? "Hoàng Đạo" : "Hắc Đạo"
      };
    },

    // Lấy danh sách Giờ Hoàng Đạo trong ngày
    getGoodHours(dayZhi) {
      const goodZhis = GIO_HOANG_DAO_TABLE[dayZhi] || GIO_HOANG_DAO_TABLE['Tý'];
      const hourRanges = {
        'Tý': '23h-01h', 'Sửu': '01h-03h', 'Dần': '03h-05h', 'Mão': '05h-07h',
        'Thìn': '07h-09h', 'Tỵ': '09h-11h', 'Ngọ': '11h-13h', 'Mùi': '13h-15h',
        'Thân': '15h-17h', 'Dậu': '17h-19h', 'Tuất': '19h-21h', 'Hợi': '21h-23h'
      };
      return goodZhis.map(z => ({ zhi: z, range: hourRanges[z] }));
    },

    // Lấy toàn bộ thông tin chi tiết cho 1 ngày (dành cho Lịch Ngày Bloc)
    getFullDayInfo(date = new Date()) {
      const d = date.getDate();
      const m = date.getMonth() + 1;
      const y = date.getFullYear();
      const hour = date.getHours();
      const minute = date.getMinutes();

      const lunar = this.solar2Lunar(d, m, y);
      const canChi = this.getCanChi(d, m, y, hour);
      const solarTermDetails = this.getSolarTermDetails(d, m, y, hour, minute);
      const solarTerm = solarTermDetails.term;
      const mansion = this.getMansion(d, m, y);
      const truc = this.getTruc(d, m, y);
      const dayHD = this.getDayHoangDao(d, m, y);
      const goodHours = this.getGoodHours(canChi.dayZhi);

      const dayOfWeekNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayOfWeek = dayOfWeekNames[date.getDay()];

      return {
        solar: {
          day: d,
          month: m,
          year: y,
          dayOfWeek: dayOfWeek,
          dateStr: `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
        },
        lunar: {
          day: lunar.day,
          month: lunar.month,
          year: lunar.year,
          isLeap: lunar.isLeap,
          dateStr: `Ngày ${lunar.day} tháng ${lunar.month}${lunar.isLeap ? ' (Nhuận)' : ''} năm ${canChi.year}`
        },
        canChi: canChi,
        solarTerm: solarTerm,
        solarTermDetails: solarTermDetails,
        solarTermStr: solarTermDetails.displayStr,
        solarTermFullStr: solarTermDetails.fullDisplayStr,
        mansion: mansion,
        truc: truc,
        hoangDao: dayHD,
        goodHours: goodHours
      };
    },

    // Lấy ma trận dữ liệu tháng (dành cho Lịch Tháng 7xN)
    getMonthMatrix(year, month) {
      // month is 1-indexed (1-12)
      const daysInMonth = new Date(year, month, 0).getDate();
      const firstDayOfWeek = (new Date(year, month - 1, 1).getDay() + 6) % 7; // 0 = Thứ 2, 6 = Chủ Nhật

      const matrix = [];
      let currentWeek = [];

      // Ô trống trước ngày mùng 1
      for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push(null);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const lunar = this.solar2Lunar(day, month, year);
        const canChi = this.getCanChi(day, month, year);
        const dayHD = this.getDayHoangDao(day, month, year);
        const isRam = lunar.day === 15;
        const isMung1 = lunar.day === 1;

        currentWeek.push({
          solarDay: day,
          solarMonth: month,
          solarYear: year,
          lunarDay: lunar.day,
          lunarMonth: lunar.month,
          isLeap: lunar.isLeap,
          canChiDay: canChi.day,
          isHoangDao: dayHD.isHoangDao,
          isSpecial: isMung1 || isRam
        });

        if (currentWeek.length === 7) {
          matrix.push(currentWeek);
          currentWeek = [];
        }
      }

      // Ô trống sau ngày cuối tháng
      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        matrix.push(currentWeek);
      }

      return matrix;
    }
  };

  // Export to global window
  global.NetaCalendarEngine = NetaCalendarEngine;

})(typeof window !== 'undefined' ? window : this);
