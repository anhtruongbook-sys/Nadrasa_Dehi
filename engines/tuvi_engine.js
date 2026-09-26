/**
 * NETA LIGHT - TỬ VI ĐẨU SỐ ENGINE (NAM PHÁI - THÁI THỨ LANG)
 * An 14 Chính tinh, phân cấp Miếu/Vượng/Đắc/Hãm, Tứ Hóa, Lục Cát, Lục Sát,
 * Vòng Tràng Sinh, Vòng Thái Tuế, Vòng Bác Sĩ, Tuần Triệt, Đại Hạn, Tiểu Hạn,
 * và Ma trận Tam Phương Tứ Chính hội chiếu.
 * Hoàn toàn chạy Client-Side độc lập 100%.
 */

(function (global) {
  'use strict';

  const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

  // Độ sáng 14 Chính Tinh tại 12 Cung (Tý -> Hợi) theo Thái Thứ Lang
  // M: Miếu, V: Vượng, Đ: Đắc, H: Hãm, B: Bình hòa
  const BRIGHTNESS = {
    "Tử Vi":      ["B", "Đ", "M", "B", "V", "M", "M", "Đ", "M", "B", "V", "B"],
    "Liêm Trinh": ["V", "H", "Đ", "H", "M", "H", "V", "H", "Đ", "H", "M", "H"],
    "Thiên Đồng": ["V", "H", "M", "Đ", "B", "B", "H", "H", "B", "H", "B", "B"],
    "Vũ Khúc":    ["V", "M", "V", "H", "M", "Đ", "V", "M", "V", "H", "M", "Đ"],
    "Thái Dương": ["H", "Đ", "V", "M", "M", "M", "M", "Đ", "Đ", "H", "H", "H"],
    "Thiên Cơ":   ["Đ", "H", "B", "H", "M", "V", "Đ", "H", "B", "H", "M", "V"],
    "Thiên Phủ":  ["M", "Đ", "M", "B", "V", "Đ", "M", "Đ", "M", "B", "V", "Đ"],
    "Thái Âm":    ["V", "V", "H", "H", "H", "H", "H", "H", "Đ", "M", "M", "M"],
    "Tham Lang":  ["V", "M", "B", "H", "Đ", "H", "V", "M", "B", "H", "Đ", "H"],
    "Cự Môn":     ["V", "H", "V", "M", "H", "H", "V", "H", "V", "M", "H", "V"],
    "Thiên Tướng":["M", "V", "M", "H", "Đ", "V", "M", "V", "M", "H", "Đ", "V"],
    "Thiên Lương":["V", "Đ", "V", "V", "M", "H", "M", "Đ", "V", "H", "M", "H"],
    "Thất Sát":   ["M", "H", "Đ", "H", "M", "V", "M", "H", "Đ", "H", "M", "V"],
    "Phá Quân":   ["M", "V", "Đ", "H", "V", "H", "M", "V", "Đ", "H", "V", "H"]
  };

  // Độ sáng Phụ Tinh & Sát Tinh tại 12 Cung (Tý -> Hợi) chuẩn Thái Thứ Lang & Nam Phái
  const BRIGHTNESS_SECONDARY = {
    "Kình Dương": ["H", "Đ", "H", "H", "Đ", "H", "H", "Đ", "H", "H", "Đ", "H"],
    "Đà La":      ["H", "Đ", "H", "H", "Đ", "H", "H", "Đ", "H", "H", "Đ", "H"],
    "Địa Không":  ["H", "H", "Đ", "H", "H", "Đ", "H", "H", "Đ", "H", "H", "Đ"],
    "Địa Kiếp":   ["H", "H", "Đ", "H", "H", "Đ", "H", "H", "Đ", "H", "H", "Đ"],
    "Hỏa Tinh":   ["H", "H", "Đ", "H", "Đ", "Đ", "Đ", "Đ", "H", "H", "Đ", "H"],
    "Linh Tinh":  ["H", "H", "Đ", "H", "Đ", "Đ", "Đ", "Đ", "H", "H", "Đ", "H"],
    "Văn Xương":  ["B", "Đ", "H", "B", "Đ", "Đ", "B", "Đ", "H", "B", "Đ", "Đ"],
    "Văn Khúc":   ["B", "Đ", "H", "B", "Đ", "Đ", "B", "Đ", "H", "B", "Đ", "Đ"],
    "Thiên Khốc": ["Đ", "H", "H", "Đ", "H", "H", "Đ", "H", "H", "Đ", "H", "H"],
    "Thiên Hư":   ["Đ", "H", "H", "Đ", "H", "H", "Đ", "H", "H", "Đ", "H", "H"],
    "Thiên Hình": ["H", "H", "Đ", "Đ", "H", "H", "H", "H", "Đ", "Đ", "H", "H"],
    "Thiên Diêu": ["H", "H", "H", "Đ", "H", "H", "H", "H", "H", "Đ", "Đ", "H"],
    "Đại Hao":    ["H", "H", "Đ", "Đ", "H", "H", "H", "H", "Đ", "Đ", "H", "H"],
    "Tiểu Hao":   ["H", "H", "Đ", "Đ", "H", "H", "H", "H", "Đ", "Đ", "H", "H"],
    "Thiên Mã":   ["H", "H", "Đ", "H", "H", "H", "H", "H", "Đ", "H", "H", "H"],
    "Hóa Kỵ":     ["H", "Đ", "H", "H", "Đ", "H", "H", "Đ", "H", "H", "Đ", "H"]
  };

  const STAR_INFO = {
    // 14 Chính Tinh
    "Tử Vi": { hanh: "Thổ", type: "main" }, "Liêm Trinh": { hanh: "Hỏa", type: "main" },
    "Thiên Đồng": { hanh: "Thủy", type: "main" }, "Vũ Khúc": { hanh: "Kim", type: "main" },
    "Thái Dương": { hanh: "Hỏa", type: "main" }, "Thiên Cơ": { hanh: "Mộc", type: "main" },
    "Thiên Phủ": { hanh: "Thổ", type: "main" }, "Thái Âm": { hanh: "Thủy", type: "main" },
    "Tham Lang": { hanh: "Thủy", type: "main" }, "Cự Môn": { hanh: "Thủy", type: "main" },
    "Thiên Tướng": { hanh: "Thủy", type: "main" }, "Thiên Lương": { hanh: "Mộc", type: "main" },
    "Thất Sát": { hanh: "Kim", type: "main" }, "Phá Quân": { hanh: "Thủy", type: "main" },

    // Cát Tinh
    "Tả Phụ": { hanh: "Thổ", type: "lucky" }, "Hữu Bật": { hanh: "Thủy", type: "lucky" },
    "Văn Xương": { hanh: "Kim", type: "lucky" }, "Văn Khúc": { hanh: "Thủy", type: "lucky" },
    "Thiên Khôi": { hanh: "Hỏa", type: "lucky" }, "Thiên Việt": { hanh: "Hỏa", type: "lucky" },
    "Lộc Tồn": { hanh: "Thổ", type: "lucky" }, "Hóa Lộc": { hanh: "Mộc", type: "lucky" },
    "Hóa Quyền": { hanh: "Thủy", type: "lucky" }, "Hóa Khoa": { hanh: "Mộc", type: "lucky" },
    "Thanh Long": { hanh: "Thủy", type: "lucky" }, "Thiên Hỷ": { hanh: "Thủy", type: "lucky" },
    "Hỷ Thần": { hanh: "Hỏa", type: "lucky" }, "Đào Hoa": { hanh: "Mộc", type: "lucky" },
    "Thiên Mã": { hanh: "Hỏa", type: "lucky" }, "Thiên Giải": { hanh: "Hỏa", type: "lucky" },
    "Địa Giải": { hanh: "Thổ", type: "lucky" }, "Quốc Ấn": { hanh: "Thổ", type: "lucky" },
    "Đường Phù": { hanh: "Mộc", type: "lucky" }, "Tam Thai": { hanh: "Thổ", type: "lucky" },
    "Bát Tọa": { hanh: "Thổ", type: "lucky" }, "Long Trì": { hanh: "Thủy", type: "lucky" },
    "Phượng Các": { hanh: "Thổ", type: "lucky" }, "Thiên Đức": { hanh: "Hỏa", type: "lucky" },
    "Nguyệt Đức": { hanh: "Hỏa", type: "lucky" }, "Ân Quang": { hanh: "Mộc", type: "lucky" },
    "Thiên Quý": { hanh: "Thổ", type: "lucky" }, "Hồng Loan": { hanh: "Thủy", type: "lucky" },
    "Giải Thần": { hanh: "Mộc", type: "lucky" }, "Nguyệt Giải": { hanh: "Hỏa", type: "lucky" },
    "Thiên Y": { hanh: "Thổ", type: "lucky" }, "Bác Sĩ": { hanh: "Thủy", type: "lucky" },
    "Lực Sĩ": { hanh: "Hỏa", type: "lucky" }, "Tướng Quân": { hanh: "Mộc", type: "lucky" },
    "Tấu Thư": { hanh: "Kim", type: "lucky" }, "Thiếu Dương": { hanh: "Hỏa", type: "lucky" },
    "Thiếu Âm": { hanh: "Thủy", type: "lucky" }, "Long Đức": { hanh: "Thủy", type: "lucky" },
    "Phúc Đức": { hanh: "Thổ", type: "lucky" }, "Thiên Quan": { hanh: "Hỏa", type: "lucky" },
    "Thiên Phúc": { hanh: "Thổ", type: "lucky" }, "Thiên Trù": { hanh: "Thổ", type: "lucky" },
    "Thiên Tài": { hanh: "Hỏa", type: "lucky" }, "Thiên Thọ": { hanh: "Thổ", type: "lucky" },
    "Hoa Cái": { hanh: "Kim", type: "lucky" }, "Thai Phụ": { hanh: "Kim", type: "lucky" },
    "Phong Cáo": { hanh: "Thổ", type: "lucky" }, "Văn Tinh": { hanh: "Hỏa", type: "lucky" },

    // Hung Tinh / Sát Tinh
    "Kình Dương": { hanh: "Kim", type: "bad" }, "Đà La": { hanh: "Kim", type: "bad" },
    "Địa Không": { hanh: "Hỏa", type: "bad" }, "Địa Kiếp": { hanh: "Hỏa", type: "bad" },
    "Hỏa Tinh": { hanh: "Hỏa", type: "bad" }, "Linh Tinh": { hanh: "Hỏa", type: "bad" },
    "Hóa Kỵ": { hanh: "Thủy", type: "bad" }, "Thiên Hình": { hanh: "Hỏa", type: "bad" },
    "Thiên Khốc": { hanh: "Thủy", type: "bad" }, "Thiên Hư": { hanh: "Thủy", type: "bad" },
    "Tiểu Hao": { hanh: "Hỏa", type: "bad" }, "Đại Hao": { hanh: "Hỏa", type: "bad" },
    "Tang Môn": { hanh: "Mộc", type: "bad" }, "Bạch Hổ": { hanh: "Kim", type: "bad" },
    "Phục Binh": { hanh: "Hỏa", type: "bad" }, "Quan Phủ": { hanh: "Hỏa", type: "bad" },
    "Quan Phù": { hanh: "Hỏa", type: "bad" }, "Thái Tuế": { hanh: "Hỏa", type: "bad" },
    "Thiên Diêu": { hanh: "Thủy", type: "bad" }, "Thiên La": { hanh: "Thổ", type: "bad" },
    "Địa Võng": { hanh: "Thổ", type: "bad" }, "Cô Thần": { hanh: "Thổ", type: "bad" },
    "Quả Tú": { hanh: "Thổ", type: "bad" }, "Phi Liêm": { hanh: "Hỏa", type: "bad" },
    "Bệnh Phù": { hanh: "Thổ", type: "bad" }, "Tử Phù": { hanh: "Kim", type: "bad" },
    "Tuế Phá": { hanh: "Hỏa", type: "bad" }, "Điếu Khách": { hanh: "Hỏa", type: "bad" },
    "Trực Phù": { hanh: "Kim", type: "bad" }, "Lưu Hà": { hanh: "Thủy", type: "bad" },
    "Phá Toái": { hanh: "Hỏa", type: "bad" }, "Đẩu Quân": { hanh: "Hỏa", type: "bad" },
    "Kiếp Sát": { hanh: "Hỏa", type: "bad" }, "Thiên Không": { hanh: "Hỏa", type: "bad" },
    "Thiên Thương": { hanh: "Thổ", type: "bad" }, "Thiên Sứ": { hanh: "Thủy", type: "bad" }
  };

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
    'Giáp Thìn': 'Phú Đăng Hỏa', 'Ất Tỵ': 'Phú Đăng Hỏa',
    'Bính Ngọ': 'Thiên Hà Thủy', 'Đinh Mùi': 'Thiên Hà Thủy',
    'Mậu Thân': 'Đại Dịch Thổ', 'Kỷ Dậu': 'Đại Dịch Thổ',
    'Canh Tuất': 'Thoa Xuyến Kim', 'Tân Hợi': 'Thoa Xuyến Kim',
    'Nhâm Tý': 'Tang Đố Mộc', 'Quý Sửu': 'Tang Đố Mộc',
    'Giáp Dần': 'Đại Khê Thủy', 'Ất Mão': 'Đại Khê Thủy',
    'Bính Thìn': 'Sa Trung Thổ', 'Đinh Tỵ': 'Sa Trung Thổ',
    'Mậu Ngọ': 'Thiên Thượng Hỏa', 'Kỷ Mùi': 'Thiên Thượng Hỏa',
    'Canh Thân': 'Thạch Lựu Mộc', 'Tân Dậu': 'Thạch Lựu Mộc',
    'Nhâm Tuất': 'Đại Hải Thủy', 'Quý Hợi': 'Đại Hải Thủy'
  };

  const getIdx = (arr, val) => arr.indexOf(val);
  const mod12 = (n) => ((n % 12) + 12) % 12;

  // Lập lá số Tử Vi
  function generateTuViChart({
    day = 24, month = 9, year = 2026, hour = 11,
    isMale = true,
    viewYear = 2026
  }) {
    let lunarDay = day, lunarMonth = month, lunarYear = year;
    let yearGan = 'Bính', yearZhi = 'Ngọ', hourZhi = 'Ngọ';
    let canChiData = null;

    if (global.NetaCalendarEngine) {
      const lunar = global.NetaCalendarEngine.solar2Lunar(day, month, year);
      lunarDay = lunar.day;
      lunarMonth = lunar.month;
      lunarYear = lunar.year;
      canChiData = global.NetaCalendarEngine.getCanChi(day, month, year, hour);
      const yParts = canChiData.year.split(' ');
      yearGan = yParts[0];
      yearZhi = yParts[1];
      hourZhi = canChiData.hour.split(' ')[1] || 'Ngọ';
    }

    const yGanIdx = getIdx(CAN, yearGan);
    const yZhiIdx = getIdx(CHI, yearZhi);
    const hourIdx = getIdx(CHI, hourZhi);

    // 1. Tìm Mệnh, Thân
    // Mệnh = (Dần + Month - 1 - Hour)
    const menhIdx = mod12(2 + (lunarMonth - 1) - hourIdx);
    // Thân = (Dần + Month - 1 + Hour)
    const thanIdx = mod12(2 + (lunarMonth - 1) + hourIdx);

    // 2. 12 Cung Chức Năng
    const CUNG_NAMES = [
      "Mệnh", "Phụ Mẫu", "Phúc Đức", "Điền Trạch",
      "Quan Lộc", "Nô Bộc", "Thiên Di", "Tật Ách",
      "Tài Bạch", "Tử Tức", "Phu Thê", "Huynh Đệ"
    ];

    // 3. Tính Cục (Theo Ngũ Hổ Độn tính Can Chi Cung Mệnh)
    const nguHoDon = {
      'Giáp': 2, 'Kỷ': 2, 'Ất': 4, 'Canh': 4, 'Bính': 6,
      'Tân': 6, 'Đinh': 8, 'Nhâm': 8, 'Mậu': 0, 'Quý': 0
    };
    const startGanIdx = nguHoDon[yearGan];
    const menhStepFromDan = mod12(menhIdx - 2);
    const menhGanIdx = (startGanIdx + menhStepFromDan) % 10;
    const menhGan = CAN[menhGanIdx];
    const menhZhi = CHI[menhIdx];

    const canVal = { 'Giáp': 1, 'Ất': 1, 'Bính': 2, 'Đinh': 2, 'Mậu': 3, 'Kỷ': 3, 'Canh': 4, 'Tân': 4, 'Nhâm': 5, 'Quý': 5 };
    const zhiVal = { 'Tý': 1, 'Sửu': 1, 'Ngọ': 1, 'Mùi': 1, 'Dần': 2, 'Mão': 2, 'Thân': 2, 'Dậu': 2, 'Thìn': 3, 'Tỵ': 3, 'Tuất': 3, 'Hợi': 3 };
    let val = (canVal[menhGan] || 0) + (zhiVal[menhZhi] || 0);
    if (val > 5) val -= 5;
    const cucMapping = { 1: 3, 2: 4, 3: 2, 4: 6, 5: 5 };
    const cuc = cucMapping[val] || 2;
    const cucName = { 2: "Thủy Nhị Cục", 3: "Mộc Tam Cục", 4: "Kim Tứ Cục", 5: "Thổ Ngũ Cục", 6: "Hỏa Lục Cục" }[cuc];

    // Bản Mệnh (Nạp Âm)
    const napAmName = NAP_AM_MAP[`${yearGan} ${yearZhi}`] || 'Bản Mệnh';

    // 4. An sao Tử Vi
    const x = Math.ceil(lunarDay / cuc);
    const remainder = (cuc * x) - lunarDay;
    let tuViPos = 0;
    if (remainder % 2 === 0) {
      tuViPos = mod12(2 + x - 1 + remainder);
    } else {
      tuViPos = mod12(2 + x - 1 - remainder);
    }

    // 5. An 14 Chính Tinh
    const starsByPos = Array.from({ length: 12 }, () => ({ main: [], lucky: [], bad: [] }));

    // Hệ Tử Vi (Đi nghịch)
    starsByPos[tuViPos].main.push("Tử Vi");
    starsByPos[mod12(tuViPos - 1)].main.push("Thiên Cơ");
    starsByPos[mod12(tuViPos - 3)].main.push("Thái Dương");
    starsByPos[mod12(tuViPos - 4)].main.push("Vũ Khúc");
    starsByPos[mod12(tuViPos - 5)].main.push("Thiên Đồng");
    starsByPos[mod12(tuViPos - 8)].main.push("Liêm Trinh");

    // Hệ Thiên Phủ (Đi thuận đối xứng qua trục Dần-Thân)
    const phuPos = mod12(4 - tuViPos);
    starsByPos[phuPos].main.push("Thiên Phủ");
    starsByPos[mod12(phuPos + 1)].main.push("Thái Âm");
    starsByPos[mod12(phuPos + 2)].main.push("Tham Lang");
    starsByPos[mod12(phuPos + 3)].main.push("Cự Môn");
    starsByPos[mod12(phuPos + 4)].main.push("Thiên Tướng");
    starsByPos[mod12(phuPos + 5)].main.push("Thiên Lương");
    starsByPos[mod12(phuPos + 6)].main.push("Thất Sát");
    starsByPos[mod12(phuPos + 10)].main.push("Phá Quân");

    // 6. Lộc Tồn, Kình Dương, Đà La
    const locTonMap = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0];
    const locTonPos = locTonMap[yGanIdx];
    starsByPos[locTonPos].lucky.push("Lộc Tồn");
    starsByPos[mod12(locTonPos + 1)].bad.push("Kình Dương");
    starsByPos[mod12(locTonPos - 1)].bad.push("Đà La");

    // 7. Tứ Hóa
    const tuHoaMap = [
      ["Liêm Trinh", "Phá Quân", "Vũ Khúc", "Thái Dương"],   // Giáp
      ["Thiên Cơ", "Thiên Lương", "Tử Vi", "Thái Âm"],       // Ất
      ["Thiên Đồng", "Thiên Cơ", "Văn Xương", "Liêm Trinh"], // Bính
      ["Thái Âm", "Thiên Đồng", "Thiên Cơ", "Cự Môn"],       // Đinh
      ["Tham Lang", "Thái Âm", "Hữu Bật", "Thiên Cơ"],       // Mậu
      ["Vũ Khúc", "Tham Lang", "Thiên Lương", "Văn Khúc"],   // Kỷ
      ["Thái Dương", "Vũ Khúc", "Thái Âm", "Thiên Đồng"],    // Canh
      ["Cự Môn", "Thái Dương", "Văn Khúc", "Văn Xương"],     // Tân
      ["Thiên Lương", "Tử Vi", "Tả Phụ", "Vũ Khúc"],         // Nhâm
      ["Phá Quân", "Cự Môn", "Thái Âm", "Tham Lang"]         // Quý
    ];
    const [hLoc, hQuyen, hKhoa, hKy] = tuHoaMap[yGanIdx];

    const addTuHoa = (targetStar, type, isBad = false) => {
      for (let i = 0; i < 12; i++) {
        if (starsByPos[i].main.includes(targetStar) || starsByPos[i].lucky.includes(targetStar) || starsByPos[i].bad.includes(targetStar)) {
          if (isBad) starsByPos[i].bad.push(`Hóa ${type}`);
          else starsByPos[i].lucky.push(`Hóa ${type}`);
        }
      }
    };

    // 8. Vòng Tràng Sinh
    const trangSinhStartMap = { 2: 8, 3: 11, 4: 5, 5: 8, 6: 2 };
    const tsStart = trangSinhStartMap[cuc];
    const tsNames = ["Tràng Sinh", "Mộc Dục", "Quan Đới", "Lâm Quan", "Đế Vượng", "Suy", "Bệnh", "Tử", "Mộ", "Tuyệt", "Thai", "Dưỡng"];
    const isYangYear = yGanIdx % 2 === 0;
    const isForward = (isMale && isYangYear) || (!isMale && !isYangYear);
    const tsDir = isForward ? 1 : -1;
    const amDuongNamNu = isYangYear ? (isMale ? 'Dương Nam' : 'Dương Nữ') : (isMale ? 'Âm Nam' : 'Âm Nữ');
    const trangSinhByPos = {};
    for (let i = 0; i < 12; i++) {
      const pos = mod12(tsStart + i * tsDir);
      trangSinhByPos[pos] = tsNames[i];
    }

    // 9. Vòng Thái Tuế
    const ttNames = ["Thái Tuế", "Thiếu Dương", "Tang Môn", "Thiếu Âm", "Quan Phù", "Tử Phù", "Tuế Phá", "Long Đức", "Bạch Hổ", "Phúc Đức", "Điếu Khách", "Trực Phù"];
    for (let i = 0; i < 12; i++) {
      const pos = mod12(yZhiIdx + i);
      const sName = ttNames[i];
      if (['Tang Môn', 'Bạch Hổ', 'Tuế Phá', 'Điếu Khách', 'Tử Phù', 'Quan Phù', 'Thái Tuế'].includes(sName)) {
        starsByPos[pos].bad.push(sName);
      } else {
        starsByPos[pos].lucky.push(sName);
      }
    }

    // 10. Tả Hữu, Xương Khúc
    const taPhuPos = mod12(4 + (lunarMonth - 1));
    starsByPos[taPhuPos].lucky.push("Tả Phụ");
    const huuBatPos = mod12(10 - (lunarMonth - 1));
    starsByPos[huuBatPos].lucky.push("Hữu Bật");

    const vanKhucPos = mod12(4 + hourIdx);
    starsByPos[vanKhucPos].lucky.push("Văn Khúc");
    const vanXuongPos = mod12(10 - hourIdx);
    starsByPos[vanXuongPos].lucky.push("Văn Xương");

    // Lục Sát: Không, Kiếp, Hỏa, Linh
    const diaKiepPos = mod12(11 + hourIdx);
    starsByPos[diaKiepPos].bad.push("Địa Kiếp");
    const diaKhongPos = mod12(11 - hourIdx);
    starsByPos[diaKhongPos].bad.push("Địa Không");

    // Hỏa Linh
    const zhiGroupMap = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3];
    const grZhi = zhiGroupMap[yZhiIdx];
    const hoaStartMap = { 2: 1, 0: 2, 1: 3, 3: 9 };
    const linhStartMap = { 2: 3, 0: 10, 1: 10, 3: 10 };
    const hoaStart = hoaStartMap[grZhi];
    const linhStart = linhStartMap[grZhi];
    const hoaDir = isForward ? 1 : -1;
    const linhDir = isForward ? -1 : 1;
    const hoaPos = mod12(hoaStart + hourIdx * hoaDir);
    const linhPos = mod12(linhStart + hourIdx * linhDir);
    starsByPos[hoaPos].bad.push("Hỏa Tinh");
    starsByPos[linhPos].bad.push("Linh Tinh");

    // Khôi Việt
    const khoiMap = { 0: 1, 1: 0, 2: 11, 3: 11, 4: 1, 5: 0, 6: 1, 7: 6, 8: 3, 9: 3 };
    const vietMap = { 0: 7, 1: 8, 2: 9, 3: 9, 4: 7, 5: 8, 6: 7, 7: 2, 8: 5, 9: 5 };
    starsByPos[khoiMap[yGanIdx]].lucky.push("Thiên Khôi");
    starsByPos[vietMap[yGanIdx]].lucky.push("Thiên Việt");

    // Vòng Bác Sĩ
    const bsNames = ["Bác Sĩ", "Lực Sĩ", "Thanh Long", "Tiểu Hao", "Tướng Quân", "Tấu Thư", "Phi Liêm", "Hỷ Thần", "Bệnh Phù", "Đại Hao", "Phục Binh", "Quan Phủ"];
    const bsDir = isForward ? 1 : -1;
    for (let i = 0; i < 12; i++) {
      const p = mod12(locTonPos + i * bsDir);
      const s = bsNames[i];
      if (['Tiểu Hao', 'Đại Hao', 'Bệnh Phù', 'Phục Binh', 'Quan Phủ', 'Phi Liêm'].includes(s)) {
        starsByPos[p].bad.push(s);
      } else {
        starsByPos[p].lucky.push(s);
      }
    }

    // Sao bổ trợ khác
    const longTriPos = mod12(4 + yZhiIdx);
    const phuongCacPos = mod12(10 - yZhiIdx);
    starsByPos[longTriPos].lucky.push("Long Trì");
    starsByPos[phuongCacPos].lucky.push("Phượng Các");
    starsByPos[phuongCacPos].lucky.push("Giải Thần");

    const thienDucPos = mod12(9 + yZhiIdx);
    const nguyetDucPos = mod12(5 + yZhiIdx);
    starsByPos[thienDucPos].lucky.push("Thiên Đức");
    starsByPos[nguyetDucPos].lucky.push("Nguyệt Đức");

    const khocPos = mod12(6 - yZhiIdx);
    const huPos = mod12(6 + yZhiIdx);
    starsByPos[khocPos].bad.push("Thiên Khốc");
    starsByPos[huPos].bad.push("Thiên Hư");

    const hinhPos = mod12(9 + lunarMonth - 1);
    const dieuPos = mod12(1 + lunarMonth - 1);
    starsByPos[hinhPos].bad.push("Thiên Hình");
    starsByPos[dieuPos].bad.push("Thiên Diêu");
    starsByPos[dieuPos].lucky.push("Thiên Y");

    const daoMap = [9, 6, 3, 0, 9, 6, 3, 0, 9, 6, 3, 0];
    starsByPos[daoMap[yZhiIdx]].lucky.push("Đào Hoa");
    const hongPos = mod12(3 - yZhiIdx);
    starsByPos[hongPos].lucky.push("Hồng Loan");
    starsByPos[mod12(hongPos + 6)].lucky.push("Thiên Hỷ");

    const maRealMap = [2, 11, 8, 5, 2, 11, 8, 5, 2, 11, 8, 5];
    starsByPos[maRealMap[yZhiIdx]].lucky.push("Thiên Mã");

    // Thiên La, Địa Võng
    starsByPos[4].bad.push("Thiên La");
    starsByPos[10].bad.push("Địa Võng");

    // 1. Tam Thai, Bát Tọa (khởi từ Tả Phụ / Hữu Bật theo ngày sinh âm lịch)
    const tamThaiPos = mod12(taPhuPos + (lunarDay - 1));
    const batToaPos = mod12(huuBatPos - (lunarDay - 1));
    starsByPos[tamThaiPos].lucky.push("Tam Thai");
    starsByPos[batToaPos].lucky.push("Bát Tọa");

    // 2. Ân Quang, Thiên Quý (khởi từ Văn Xương / Văn Khúc theo ngày sinh âm lịch)
    const anQuangPos = mod12(vanXuongPos + lunarDay - 2);
    const thienQuyPos = mod12(2 - anQuangPos);
    starsByPos[anQuangPos].lucky.push("Ân Quang");
    starsByPos[thienQuyPos].lucky.push("Thiên Quý");

    // 3. Thai Phụ, Phong Cáo (theo Văn Khúc)
    const thaiPhuPos = mod12(vanKhucPos + 2);
    const phongCaoPos = mod12(vanKhucPos - 2);
    starsByPos[thaiPhuPos].lucky.push("Thai Phụ");
    starsByPos[phongCaoPos].lucky.push("Phong Cáo");

    // 4. Thiên Quan, Thiên Phúc (theo Can năm sinh)
    const thienQuanMap = [7, 4, 5, 2, 3, 9, 11, 9, 10, 6];
    const thienPhucMap = [9, 8, 0, 11, 3, 2, 6, 5, 6, 5];
    starsByPos[thienQuanMap[yGanIdx]].lucky.push("Thiên Quan");
    starsByPos[thienPhucMap[yGanIdx]].lucky.push("Thiên Phúc");

    // 5. Thiên Trù, Lưu Hà (theo Can năm sinh)
    const thienTruMap = [5, 6, 0, 5, 6, 8, 2, 6, 9, 10];
    const luuHaMap = [9, 10, 7, 4, 5, 6, 8, 3, 11, 2];
    starsByPos[thienTruMap[yGanIdx]].lucky.push("Thiên Trù");
    starsByPos[luuHaMap[yGanIdx]].bad.push("Lưu Hà");

    // 6. Quốc Ấn, Đường Phù (theo Lộc Tồn)
    const quocAnPos = mod12(locTonPos + 8);
    const duongPhuPos = mod12(locTonPos + 5);
    starsByPos[quocAnPos].lucky.push("Quốc Ấn");
    starsByPos[duongPhuPos].lucky.push("Đường Phù");

    // 7. Cô Thần, Quả Tú (theo Chi năm sinh)
    const coThanMap = [2, 2, 5, 5, 5, 8, 8, 8, 11, 11, 11, 2];
    const quaTuMap = [10, 10, 1, 1, 1, 4, 4, 4, 7, 7, 7, 10];
    starsByPos[coThanMap[yZhiIdx]].bad.push("Cô Thần");
    starsByPos[quaTuMap[yZhiIdx]].bad.push("Quả Tú");

    // 8. Kiếp Sát, Hoa Cái (theo Chi năm sinh)
    const kiepSatMap = [5, 2, 11, 8, 5, 2, 11, 8, 5, 2, 11, 8];
    const hoaCaiMap = [4, 1, 10, 7, 4, 1, 10, 7, 4, 1, 10, 7];
    starsByPos[kiepSatMap[yZhiIdx]].bad.push("Kiếp Sát");
    starsByPos[hoaCaiMap[yZhiIdx]].lucky.push("Hoa Cái");

    // 9. Phá Toái, Đẩu Quân
    const phaToaiMap = [9, 1, 5, 9, 1, 5, 9, 1, 5, 9, 1, 5];
    starsByPos[phaToaiMap[yZhiIdx]].bad.push("Phá Toái");
    const dauQuanPos = mod12(yZhiIdx - (lunarMonth - 1) + hourIdx);
    starsByPos[dauQuanPos].bad.push("Đẩu Quân");

    // 10. Thiên Tài, Thiên Thọ (theo Mệnh, Thân và Chi năm)
    const thienTaiPos = mod12(menhIdx + yZhiIdx);
    const thienThoPos = mod12(thanIdx + yZhiIdx);
    starsByPos[thienTaiPos].lucky.push("Thiên Tài");
    starsByPos[thienThoPos].lucky.push("Thiên Thọ");

    // 11. Thiên Thương, Thiên Sứ (theo Mệnh: Nô Bộc và Tật Ách)
    const thienThuongPos = mod12(menhIdx + 5);
    const thienSuPos = mod12(menhIdx + 7);
    starsByPos[thienThuongPos].bad.push("Thiên Thương");
    starsByPos[thienSuPos].bad.push("Thiên Sứ");

    // 12. Thiên Giải, Địa Giải
    const thienGiaiPos = mod12(8 + 2 * (lunarMonth - 1));
    const diaGiaiPos = mod12(taPhuPos + 3);
    starsByPos[thienGiaiPos].lucky.push("Thiên Giải");
    starsByPos[diaGiaiPos].lucky.push("Địa Giải");

    // 13. Thiên Không (kế tiếp sau Thái Tuế)
    const thienKhongPos = mod12(yZhiIdx + 1);
    starsByPos[thienKhongPos].bad.push("Thiên Không");

    // 14. Văn Tinh (sau Kình Dương 2 cung thuận)
    const vanTinhPos = mod12(locTonPos + 1 + 2);
    starsByPos[vanTinhPos].lucky.push("Văn Tinh");

    // An Tứ Hóa
    addTuHoa(hLoc, "Lộc", false);
    addTuHoa(hQuyen, "Quyền", false);
    addTuHoa(hKhoa, "Khoa", false);
    addTuHoa(hKy, "Kỵ", true);

    // Tuần & Triệt
    const tuanPos1 = mod12(yZhiIdx - yGanIdx + 10);
    const tuanPos2 = mod12(yZhiIdx - yGanIdx + 11);
    const trietBase = mod12(8 - (yGanIdx % 5) * 2);
    const trietPos1 = trietBase;
    const trietPos2 = mod12(trietBase + 1);

    // Tiểu Hạn
    const startTieuHanMap = {
      0: 10, 4: 10, 8: 10,
      2: 4, 6: 4, 10: 4,
      5: 7, 9: 7, 1: 7,
      11: 1, 3: 1, 7: 1
    };
    const startTHPos = startTieuHanMap[yZhiIdx];
    const thDir = isMale ? 1 : -1;
    const tieuHanByPos = {};
    for (let i = 0; i < 12; i++) {
      const pos = mod12(startTHPos + (i * thDir));
      tieuHanByPos[pos] = CHI[mod12(yZhiIdx + i)];
    }

    // 10b. An Các Sao Lưu Theo Năm Xem (viewYear)
    const viewGanIdx = (((viewYear - 4) % 10) + 10) % 10;
    const viewZhiIdx = (((viewYear - 4) % 12) + 12) % 12;
    const viewYearGan = CAN[viewGanIdx];
    const viewYearZhi = CHI[viewZhiIdx];
    const viewYearCanChi = `${viewYearGan} ${viewYearZhi}`;

    // 1. Lưu Thái Tuế: tại cung có Địa Chi = viewYearZhi
    const luuThaiTuePos = viewZhiIdx;

    // 2. Lưu Tang Môn: cách Lưu Thái Tuế 2 cung theo chiều thuận (tiến 2 cung)
    const luuTangMonPos = mod12(luuThaiTuePos + 2);

    // 3. Lưu Bạch Hổ: đối cung Lưu Tang Môn
    const luuBachHoPos = mod12(luuTangMonPos + 6);

    // 4. Lưu Thiên Khốc: Khởi Ngọ (6) tính nghịch đến Chi năm xem
    const luuThienKhocPos = mod12(6 - viewZhiIdx);

    // 5. Lưu Thiên Hư: Khởi Ngọ (6) tính thuận đến Chi năm xem
    const luuThienHuPos = mod12(6 + viewZhiIdx);

    // 6. Lưu Lộc Tồn: theo Thiên Can năm xem
    const luuLocTonMap = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0];
    const luuLocTonPos = luuLocTonMap[viewGanIdx];

    // 7. Lưu Kình Dương: trước Lộc Tồn 1 cung (+1)
    const luuKinhDuongPos = mod12(luuLocTonPos + 1);

    // 8. Lưu Đà La: sau Lộc Tồn 1 cung (-1)
    const luuDaLaPos = mod12(luuLocTonPos - 1);

    // 9. Lưu Thiên Mã: theo Tam Hợp Chi năm xem
    const luuMaMap = [2, 11, 8, 5, 2, 11, 8, 5, 2, 11, 8, 5];
    const luuThienMaPos = luuMaMap[viewZhiIdx];

    // Gom sao lưu theo vị trí cung (0..11)
    const luuStarsByPos = Array.from({ length: 12 }, () => []);
    luuStarsByPos[luuThaiTuePos].push({ name: "L.Thái Tuế", hanh: "Hỏa", type: "bad" });
    luuStarsByPos[luuTangMonPos].push({ name: "L.Tang Môn", hanh: "Mộc", type: "bad" });
    luuStarsByPos[luuBachHoPos].push({ name: "L.Bạch Hổ", hanh: "Kim", type: "bad" });
    luuStarsByPos[luuThienKhocPos].push({ name: "L.Thiên Khốc", hanh: "Thủy", type: "bad" });
    luuStarsByPos[luuThienHuPos].push({ name: "L.Thiên Hư", hanh: "Thủy", type: "bad" });
    luuStarsByPos[luuLocTonPos].push({ name: "L.Lộc Tồn", hanh: "Thổ", type: "lucky" });
    luuStarsByPos[luuKinhDuongPos].push({ name: "L.Kình Dương", hanh: "Kim", type: "bad" });
    luuStarsByPos[luuDaLaPos].push({ name: "L.Đà La", hanh: "Kim", type: "bad" });
    luuStarsByPos[luuThienMaPos].push({ name: "L.Thiên Mã", hanh: "Hỏa", type: "lucky" });

    // 11. Gom dữ liệu 12 Cung (0 to 11 tương ứng Tý to Hợi)
    const dvDir = tsDir;
    const palaces = [];

    for (let i = 0; i < 12; i++) {
      // 12 Cung Chức Năng: LUÔN AN THUẬN CHIỀU KIM ĐỒNG HỒ TỪ CUNG MỆNH (cho mọi đương số không phân biệt âm dương nam nữ)
      // Mệnh -> Phụ Mẫu -> Phúc Đức -> Điền Trạch -> Quan Lộc -> Nô Bộc -> Thiên Di -> Tật Ách -> Tài Bạch -> Tử Tức -> Phu Thê -> Huynh Đệ
      const cungOffset = mod12(i - menhIdx);
      const cungName = CUNG_NAMES[cungOffset];

      // Đại Hạn: Vòng số đại hạn theo chiều âm dương nam nữ độc lập
      const stepForward = mod12(i - menhIdx);
      const stepBackward = mod12(menhIdx - i);
      const dvStep = (dvDir === 1) ? stepForward : stepBackward;
      const dvAge = cuc + dvStep * 10;

      const mainStarsFormatted = starsByPos[i].main.map(s => {
        const b = (BRIGHTNESS[s] && BRIGHTNESS[s][i]) ? BRIGHTNESS[s][i] : "";
        return {
          name: s,
          brightness: b,
          fullName: b ? `${s} (${b})` : s,
          hanh: (STAR_INFO[s] && STAR_INFO[s].hanh) || 'Thổ'
        };
      });

      const luckyStarsFormatted = starsByPos[i].lucky.map(s => {
        const b = (BRIGHTNESS_SECONDARY[s] && BRIGHTNESS_SECONDARY[s][i]) ? BRIGHTNESS_SECONDARY[s][i] : "";
        return {
          name: s,
          brightness: b,
          fullName: b ? `${s} (${b})` : s,
          hanh: (STAR_INFO[s] && STAR_INFO[s].hanh) || 'Mộc'
        };
      });

      const badStarsFormatted = starsByPos[i].bad.map(s => {
        const b = (BRIGHTNESS_SECONDARY[s] && BRIGHTNESS_SECONDARY[s][i]) ? BRIGHTNESS_SECONDARY[s][i] : "";
        return {
          name: s,
          brightness: b,
          fullName: b ? `${s} (${b})` : s,
          hanh: (STAR_INFO[s] && STAR_INFO[s].hanh) || 'Hỏa'
        };
      });

      const isTuan = (i === tuanPos1 || i === tuanPos2);
      const isTriet = (i === trietPos1 || i === trietPos2);
      const stepFromDan = mod12(i - 2);
      const thienCan = CAN[(startGanIdx + stepFromDan) % 10];

      // Tam Phương Tứ Chính:
      // Xung chiếu: đối cung (i + 6)
      // Tam hợp: (i + 4) và (i + 8)
      // Nhị hợp: đối xứng qua trục Tý-Ngọ hoặc chuẩn Địa chi lục hợp
      const xungChieuIdx = mod12(i + 6);
      const tamHop1Idx = mod12(i + 4);
      const tamHop2Idx = mod12(i + 8);

      palaces.push({
        index: i,
        zhi: CHI[i],
        gan: thienCan,
        canChi: `${thienCan} ${CHI[i]}`,
        name: cungName,
        isMenh: i === menhIdx,
        isThan: i === thanIdx,
        isTuan,
        isTriet,
        trangSinh: trangSinhByPos[i] || '',
        daiHan: dvAge,
        tieuHan: tieuHanByPos[i] || '',
        isTieuHanYear: (tieuHanByPos[i] === viewYearZhi),
        mainStars: mainStarsFormatted,
        luckyStars: luckyStarsFormatted,
        badStars: badStarsFormatted,
        luuStars: luuStarsByPos[i] || [],
        relatives: {
          xungChieu: xungChieuIdx,
          tamHop1: tamHop1Idx,
          tamHop2: tamHop2Idx
        }
      });
    }

    // Tuổi mụ (theo Năm xem)
    const birthYearRef = lunarYear || year;
    const currentAgeMu = Math.max(1, viewYear - birthYearRef + 1);

    // Chủ Mệnh & Chủ Thân theo Thái Thứ Lang
    const CHU_MENH_MAP = {
      'Tý': 'Tham Lang', 'Sửu': 'Cự Môn', 'Dần': 'Lộc Tồn', 'Mão': 'Văn Khúc',
      'Thìn': 'Liêm Trinh', 'Tỵ': 'Vũ Khúc', 'Ngọ': 'Phá Quân', 'Mùi': 'Vũ Khúc',
      'Thân': 'Liêm Trinh', 'Dậu': 'Văn Khúc', 'Tuất': 'Lộc Tồn', 'Hợi': 'Cự Môn'
    };
    const CHU_THAN_MAP = {
      'Tý': 'Hỏa Tinh', 'Sửu': 'Thiên Tướng', 'Dần': 'Thiên Lương', 'Mão': 'Thiên Đồng',
      'Thìn': 'Văn Xương', 'Tỵ': 'Thiên Cơ', 'Ngọ': 'Hỏa Tinh', 'Mùi': 'Thiên Tướng',
      'Thân': 'Thiên Lương', 'Dậu': 'Thiên Đồng', 'Tuất': 'Văn Xương', 'Hợi': 'Thiên Cơ'
    };
    const chuMenh = CHU_MENH_MAP[yearZhi] || 'Tham Lang';
    const chuThan = CHU_THAN_MAP[yearZhi] || 'Thiên Cơ';

    return {
      meta: {
        solarDay: day,
        solarMonth: month,
        solarYear: year,
        solarHour: hour,
        lunarDay,
        lunarMonth,
        lunarYear,
        yearGan,
        yearZhi,
        hourZhi,
        isMale,
        amDuongNamNu,
        cuc,
        cucName,
        napAm: napAmName,
        menhCanChi: `${menhGan} ${menhZhi}`,
        menhIdx,
        thanIdx,
        tuViPos,
        chuMenh,
        chuThan,
        currentAgeMu,
        viewYear,
        viewYearCanChi,
        viewYearGan,
        viewYearZhi
      },
      palaces
    };
  }

  // Helper màu hành
  function getStarColorClass(hanh) {
    if (!hanh) return '';
    const h = String(hanh).toLowerCase();
    if (h.includes('mộc')) return 'wx-wood';
    if (h.includes('hỏa')) return 'wx-fire';
    if (h.includes('thổ')) return 'wx-earth';
    if (h.includes('kim')) return 'wx-metal';
    if (h.includes('thủy')) return 'wx-water';
    return '';
  }

  // Export
  global.NetaTuViEngine = {
    generateTuViChart,
    getStarColorClass,
    BRIGHTNESS,
    BRIGHTNESS_SECONDARY,
    STAR_INFO,
    CAN,
    CHI
  };

})(typeof window !== 'undefined' ? window : this);
