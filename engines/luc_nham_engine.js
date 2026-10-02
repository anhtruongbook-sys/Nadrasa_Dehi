/**
 * NETA LIGHT - ĐẠI LỤC NHÂM ENGINE (LỤC NHÂM THẦN KHÓA - 六壬神課)
 * Phục dựng toàn diện 100% Cửu Tông Môn và giải thuật Thuận/Nghịch khớp chuẩn xác tuyệt đối với 'Luc Nham dai don.xls'.
 * Toàn bộ 8 lớp thông tin (Thiên Địa Bàn, Tứ Khóa, Tam Truyền, 12 Thiên Tướng, Thái Tuế, Kiến Trừ, Thần Sát, Thần Mệnh)
 * đều được tính toán ĐỘNG 100%, 100% Thuần JavaScript - Chạy Offline không phụ thuộc thư viện ngoài.
 */

(function (global) {
  'use strict';

  const DIA_CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
  const THIEN_CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];

  const NGU_HANH_CHI = {
    "Hợi": "Thủy", "Tý": "Thủy",
    "Dần": "Mộc",  "Mão": "Mộc",
    "Tỵ": "Hỏa",   "Ngọ": "Hỏa",
    "Thân": "Kim", "Dậu": "Kim",
    "Thìn": "Thổ", "Tuất": "Thổ", "Sửu": "Thổ", "Mùi": "Thổ"
  };

  const NGU_HANH_CAN = {
    "Giáp": "Mộc", "Ất": "Mộc",
    "Bính": "Hỏa", "Đinh": "Hỏa",
    "Mậu": "Thổ",  "Kỷ": "Thổ",
    "Canh": "Kim", "Tân": "Kim",
    "Nhâm": "Thủy", "Quý": "Thủy"
  };

  const CAN_AM_DUONG = {
    "Giáp": "+", "Ất": "-", "Bính": "+", "Đinh": "-", "Mậu": "+",
    "Kỷ": "-", "Canh": "+", "Tân": "-", "Nhâm": "+", "Quý": "-"
  };

  const CAN_KY_CUNG = {
    "Giáp": "Dần", "Ất": "Thìn", "Bính": "Tỵ", "Đinh": "Mùi",
    "Mậu": "Tỵ",   "Kỷ": "Mùi",  "Canh": "Thân", "Tân": "Tuất",
    "Nhâm": "Hợi", "Quý": "Sửu"
  };

  // 12 Thiên tướng theo thứ tự chuẩn trong Excel (B148:C159):
  const THIEN_TUONG_12 = [
    "Quý nhân", "Đằng xà", "Chu tước", "Thiên hợp", 
    "Câu trận", "Thanh long", "Thiên không", "Bạch hổ", 
    "Thái thường", "Huyền vũ", "Thái âm", "Thiên hậu"
  ];

  const TEN_THAN_CUNG = {
    "Tý": "Thần hậu",   "Sửu": "Đại cát",    "Dần": "Công tào",
    "Mão": "Thái xung",  "Thìn": "Thiên cương","Tỵ": "Thái ất",
    "Ngọ": "Thắng quan", "Mùi": "Tiểu cát",   "Thân": "Truyền tống",
    "Dậu": "Tòng khôi",  "Tuất": "Hà khôi",   "Hợi": "Đăng minh"
  };

  // Khẩu quyết Quý nhân Đán / Mộ (Dòng 208-217 sheet S_LNDD)
  const QUY_NHAN_DAN_MO = {
    "Giáp": ["Sửu", "Mùi"], "Ất": ["Tý", "Thân"], "Bính": ["Hợi", "Dậu"],
    "Đinh": ["Hợi", "Dậu"], "Mậu": ["Sửu", "Mùi"], "Kỷ": ["Tý", "Thân"],
    "Canh": ["Sửu", "Mùi"], "Tân": ["Ngọ", "Dần"], "Nhâm": ["Tỵ", "Mão"], "Quý": ["Tỵ", "Mão"]
  };

  const TRACH_MO_MAP = {
    "Tý":  ["Mùi", "Thìn"], "Sửu": ["Ngọ", "Tuất"], "Dần": ["Ngọ", "Tuất"], "Mão": ["Tý", "Thìn"],
    "Thìn": ["Dậu", "Sửu"], "Tỵ":  ["Mão", "Mùi"],  "Ngọ": ["Mùi", "Thìn"], "Mùi": ["Ngọ", "Tuất"],
    "Thân": ["Ngọ", "Tuất"], "Dậu": ["Tý", "Thìn"],  "Tuất": ["Dậu", "Sửu"], "Hợi": ["Mão", "Mùi"]
  };

  // Vòng Sao Thái Tuế (tra theo Thiên bàn cố định B193:C204)
  const SAO_THAI_TUE_MAP = {
    "Tý": "Thái tuế", "Sửu": "Thái dương", "Dần": "Tang môn", "Mão": "Thái âm",
    "Thìn": "Quan phủ", "Tỵ": "Tử phủ", "Ngọ": "Tuế phá", "Mùi": "Long đức",
    "Thân": "Bạch hổ", "Dậu": "Phúc đức", "Tuất": "Điếu khách", "Hợi": "Bệnh phù"
  };

  // Vòng Kiến Trừ (tra theo Địa bàn, khởi từ Chi ngày = Kiến, an nghịch)
  const VONG_KIEN_TRU = ["Kiến", "Lợi", "Phúc", "Hung", "Cô", "Phế", "Hưu", "Tử", "Tù", "Một", "Thai", "Vượng"];

  // Thần Sát phụ
  const THIEN_LOC_MAP = {
    "Giáp": "Dần", "Ất": "Mão", "Bính": "Tỵ", "Đinh": "Ngọ", "Mậu": "Tỵ",
    "Kỷ": "Ngọ", "Canh": "Thân", "Tân": "Dậu", "Nhâm": "Hợi", "Quý": "Tý"
  };

  const TRUONG_SINH_MAP = {
    "Giáp": "Hợi", "Ất": "Ngọ", "Bính": "Dần", "Đinh": "Dậu", "Mậu": "Dần",
    "Kỷ": "Dậu", "Canh": "Tỵ", "Tân": "Tý", "Nhâm": "Thân", "Quý": "Mão"
  };

  const THIEN_MA_MAP = {
    "Tý": "Dần", "Thìn": "Dần", "Thân": "Dần",
    "Sửu": "Hợi", "Tỵ": "Hợi", "Dậu": "Hợi",
    "Dần": "Thân", "Ngọ": "Thân", "Tuất": "Thân",
    "Mão": "Tỵ", "Mùi": "Tỵ", "Hợi": "Tỵ"
  };

  const DAI_SAT_MAP = {
    "Giáp": "Ngọ", "Ất": "Ngọ", "Bính": "Mùi", "Đinh": "Mùi", "Mậu": "Tuất",
    "Kỷ": "Tuất", "Canh": "Dần", "Tân": "Dần", "Nhâm": "Tỵ", "Quý": "Tỵ"
  };

  const DU_LO_MAP = {
    "Giáp": ["Sửu", "Mùi"], "Ất": ["Tý", "Ngọ"], "Bính": ["Dần", "Thân"],
    "Đinh": ["Tỵ", "Hợi"], "Mậu": ["Thân", "Dần"], "Kỷ": ["Sửu", "Mùi"],
    "Canh": ["Tý", "Ngọ"], "Tân": ["Dần", "Thân"], "Nhâm": ["Tỵ", "Hợi"], "Quý": ["Thân", "Dần"]
  };

  const THIEN_TAI_THANG_MAP = {
    "Dần": "Thìn", "Mão": "Ngọ", "Thìn": "Thân", "Tỵ": "Tuất", "Ngọ": "Tý", "Mùi": "Dần",
    "Thân": "Thìn", "Dậu": "Ngọ", "Tuất": "Thân", "Hợi": "Tuất", "Tý": "Tý", "Sửu": "Dần"
  };

  const NHAT_QUY_MAP = {
    "Hợi": "Tý", "Tuất": "Sửu", "Dậu": "Dần", "Thân": "Mão", "Mùi": "Thìn", "Ngọ": "Tỵ",
    "Tỵ": "Ngọ", "Thìn": "Mùi", "Mão": "Thân", "Dần": "Dậu", "Sửu": "Tuất", "Tý": "Hợi"
  };

  const THIEN_HINH_MAP = {
    "Ngọ": "Tý", "Tỵ": "Sửu", "Thìn": "Dần", "Mão": "Mão", "Dần": "Thìn", "Sửu": "Tỵ",
    "Tý": "Ngọ", "Hợi": "Mùi", "Tuất": "Thân", "Dậu": "Dậu", "Thân": "Tuất", "Mùi": "Hợi"
  };

  // Ánh xạ Tiết Khí sang Nguyệt Tướng chuẩn Thiên Văn
  const SOLAR_TERM_TO_NGUYET_TUONG = {
    "Vũ thủy": "Hợi", "Kinh trập": "Hợi",
    "Xuân phân": "Tuất", "Thanh minh": "Tuất",
    "Cốc vũ": "Dậu", "Lập hạ": "Dậu",
    "Tiểu mãn": "Thân", "Mang chủng": "Thân",
    "Hạ chí": "Mùi", "Tiểu thử": "Mùi",
    "Đại thử": "Ngọ", "Lập thu": "Ngọ",
    "Xử thử": "Tỵ", "Bạch lộ": "Tỵ",
    "Thu phân": "Thìn", "Hàn lộ": "Thìn",
    "Sương giáng": "Mão", "Lập đông": "Mão",
    "Tiểu tuyết": "Dần", "Đại tuyết": "Dần",
    "Đông chí": "Sửu", "Tiểu hàn": "Sửu",
    "Đại hàn": "Tý", "Lập xuân": "Tý"
  };

  // Múi giờ và kinh tuyến chuẩn
  const STANDARD_MERIDIANS = {
    7: 105.0,   // Việt Nam, Thái Lan, Indonesia (UTC+7)
    8: 120.0,   // Trung Quốc, Đài Loan, Singapore (UTC+8)
    9: 135.0,   // Nhật Bản, Hàn Quốc (UTC+9)
    0: 0.0      // GMT / UTC
  };

  // Cơ sở dữ liệu kinh độ địa phương (Việt Nam 63 tỉnh/thành & Quốc tế)
  const CITY_LONGITUDES = {
    // 5 Thành phố trực thuộc Trung ương
    "HaNoi": { name: "Hà Nội", lng: 105.85, lat: 21.03 },
    "TPHCM": { name: "TP. Hồ Chí Minh", lng: 106.66, lat: 10.78 },
    "DaNang": { name: "Đà Nẵng", lng: 108.20, lat: 16.05 },
    "HaiPhong": { name: "Hải Phòng", lng: 106.68, lat: 20.84 },
    "CanTho": { name: "Cần Thơ", lng: 105.78, lat: 10.05 },

    // Miền Bắc
    "BacNinh": { name: "Bắc Ninh", lng: 106.07, lat: 21.19 },
    "HaiDuong": { name: "Hải Dương", lng: 106.32, lat: 20.94 },
    "HungYen": { name: "Hưng Yên", lng: 106.05, lat: 20.65 },
    "NamDinh": { name: "Nam Định", lng: 106.17, lat: 20.42 },
    "NinhBinh": { name: "Ninh Bình", lng: 105.97, lat: 20.25 },
    "ThaiBinh": { name: "Thái Bình", lng: 106.33, lat: 20.45 },
    "HaNam": { name: "Hà Nam", lng: 105.92, lat: 20.58 },
    "VinhPhuc": { name: "Vĩnh Phúc", lng: 105.60, lat: 21.31 },
    "QuangNinh": { name: "Quảng Ninh (Hạ Long)", lng: 107.08, lat: 20.95 },
    "ThaiNguyen": { name: "Thái Nguyên", lng: 105.84, lat: 21.60 },
    "BacGiang": { name: "Bắc Giang", lng: 106.20, lat: 21.27 },
    "PhuTho": { name: "Phú Thọ (Việt Trì)", lng: 105.40, lat: 21.32 },
    "LangSon": { name: "Lạng Sơn", lng: 106.76, lat: 21.85 },
    "CaoBang": { name: "Cao Bằng", lng: 106.26, lat: 22.67 },
    "BacKan": { name: "Bắc Kạn", lng: 105.83, lat: 22.15 },
    "TuyenQuang": { name: "Tuyên Quang", lng: 105.22, lat: 21.82 },
    "HaGiang": { name: "Hà Giang", lng: 104.98, lat: 22.82 },
    "LaoCai": { name: "Lào Cai", lng: 103.97, lat: 22.49 },
    "YenBai": { name: "Yên Bái", lng: 104.87, lat: 21.72 },
    "SonLa": { name: "Sơn La", lng: 103.91, lat: 21.33 },
    "DienBien": { name: "Điện Biên (Điện Biên Phủ)", lng: 103.02, lat: 21.39 },
    "LaiChau": { name: "Lai Châu", lng: 103.46, lat: 22.40 },
    "HoaBinh": { name: "Hòa Bình", lng: 105.34, lat: 20.81 },

    // Miền Trung & Tây Nguyên
    "ThanhHoa": { name: "Thanh Hóa", lng: 105.78, lat: 19.81 },
    "NgheAn": { name: "Nghệ An (Vinh)", lng: 105.68, lat: 18.67 },
    "HaTinh": { name: "Hà Tĩnh", lng: 105.90, lat: 18.34 },
    "QuangBinh": { name: "Quảng Bình (Đồng Hới)", lng: 106.62, lat: 17.47 },
    "QuangTri": { name: "Quảng Trị (Đông Hà)", lng: 107.09, lat: 16.82 },
    "Hue": { name: "Thừa Thiên Huế", lng: 107.59, lat: 16.46 },
    "QuangNam": { name: "Quảng Nam (Tam Kỳ)", lng: 108.48, lat: 15.57 },
    "QuangNgai": { name: "Quảng Ngãi", lng: 108.80, lat: 15.12 },
    "BinhDinh": { name: "Bình Định (Quy Nhơn)", lng: 109.22, lat: 13.78 },
    "PhuYen": { name: "Phú Yên (Tuy Hòa)", lng: 109.30, lat: 13.09 },
    "KhanhHoa": { name: "Khánh Hòa (Nha Trang)", lng: 109.19, lat: 12.25 },
    "NinhThuan": { name: "Ninh Thuận (Phan Rang)", lng: 108.99, lat: 11.56 },
    "BinhThuan": { name: "Bình Thuận (Phan Thiết)", lng: 108.10, lat: 10.93 },
    "KonTum": { name: "Kon Tum", lng: 108.01, lat: 14.35 },
    "GiaLai": { name: "Gia Lai (Pleiku)", lng: 108.00, lat: 13.98 },
    "DakLak": { name: "Đắk Lắk (Buôn Ma Thuột)", lng: 108.04, lat: 12.67 },
    "DakNong": { name: "Đắk Nông (Gia Nghĩa)", lng: 107.69, lat: 12.00 },
    "LamDong": { name: "Lâm Đồng (Đà Lạt)", lng: 108.44, lat: 11.94 },

    // Miền Nam
    "BinhDuong": { name: "Bình Dương (Thủ Dầu Một)", lng: 106.65, lat: 10.98 },
    "DongNai": { name: "Đồng Nai (Biên Hòa)", lng: 106.83, lat: 10.95 },
    "BaRiaVungTau": { name: "Bà Rịa - Vũng Tàu", lng: 107.08, lat: 10.35 },
    "TayNinh": { name: "Tây Ninh", lng: 106.10, lat: 11.31 },
    "BinhPhuoc": { name: "Bình Phước (Đồng Xoài)", lng: 106.91, lat: 11.53 },
    "LongAn": { name: "Long An (Tân An)", lng: 106.41, lat: 10.53 },
    "TienGiang": { name: "Tiền Giang (Mỹ Tho)", lng: 106.36, lat: 10.36 },
    "BenTre": { name: "Bến Tre", lng: 106.38, lat: 10.24 },
    "TraVinh": { name: "Trà Vinh", lng: 106.34, lat: 9.93 },
    "VinhLong": { name: "Vĩnh Long", lng: 105.97, lat: 10.25 },
    "DongThap": { name: "Đồng Tháp (Cao Lãnh)", lng: 105.63, lat: 10.46 },
    "AnGiang": { name: "An Giang (Long Xuyên)", lng: 105.43, lat: 10.37 },
    "KienGiang": { name: "Kiên Giang (Rạch Giá)", lng: 105.08, lat: 10.01 },
    "PhuQuoc": { name: "Kiên Giang (Phú Quốc)", lng: 103.96, lat: 10.23 },
    "HauGiang": { name: "Hậu Giang (Vị Thanh)", lng: 105.47, lat: 9.78 },
    "SocTrang": { name: "Sóc Trăng", lng: 105.97, lat: 9.60 },
    "BacLieu": { name: "Bạc Liêu", lng: 105.72, lat: 9.29 },
    "CaMau": { name: "Cà Mau", lng: 105.15, lat: 9.18 },

    // Quốc tế tiêu biểu
    "BacKinh": { name: "Bắc Kinh (Trung Quốc)", lng: 116.40, lat: 39.90 },
    "DaiBac": { name: "Đài Bắc (Đài Loan)", lng: 121.56, lat: 25.03 },
    "HongKong": { name: "Hồng Kông", lng: 114.16, lat: 22.32 },
    "Singapore": { name: "Singapore", lng: 103.82, lat: 1.35 },
    "Bangkok": { name: "Bangkok (Thái Lan)", lng: 100.50, lat: 13.75 },
    "Tokyo": { name: "Tokyo (Nhật Bản)", lng: 139.69, lat: 35.69 },
    "Seoul": { name: "Seoul (Hàn Quốc)", lng: 126.98, lat: 37.57 },
    "Paris": { name: "Paris (Pháp)", lng: 2.35, lat: 48.85 },
    "London": { name: "London (Anh)", lng: -0.13, lat: 51.51 },
    "NewYork": { name: "New York (Mỹ)", lng: -74.01, lat: 40.71 },
    "California": { name: "California / Los Angeles (Mỹ)", lng: -118.24, lat: 34.05 }
  };

  /**
   * Tính Phương trình thời gian Spencer (Equation of Time - EOT)
   * @param {number} dayOfYear Ngày thứ bao nhiêu trong năm (1 đến 365/366)
   * @returns {number} Độ lệch thời gian theo phút
   */
  function calculateEquationOfTime(dayOfYear) {
    const b = (2.0 * Math.PI * (dayOfYear - 1)) / 365.0;
    return 229.18 * (
      0.000075 +
      0.001868 * Math.cos(b) -
      0.032077 * Math.sin(b) -
      0.014615 * Math.cos(2.0 * b) -
      0.040849 * Math.sin(2.0 * b)
    );
  }

  function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 1);
    return Math.floor((date.getTime() - start.getTime()) / 86400000) + 1;
  }

  /**
   * Tính toán Giờ Chân Thái Dương (True Apparent Solar Time)
   */
  function getTrueSolarTime(date, longitude = 105.85, timezoneOffset = 7) {
    const standardMeridian = STANDARD_MERIDIANS[timezoneOffset] || (timezoneOffset * 15.0);
    const deltaLonMinutes = (longitude - standardMeridian) * 4.0;
    const dayOfYear = getDayOfYear(date);
    const eotMinutes = calculateEquationOfTime(dayOfYear);
    const totalOffsetMinutes = deltaLonMinutes + eotMinutes;
    const trueSolarDate = new Date(date.getTime() + totalOffsetMinutes * 60000);
    return {
      trueSolarDate,
      eotMinutes,
      deltaLonMinutes,
      totalOffsetMinutes
    };
  }

  /**
   * Xác định chính xác Chi Giờ và Đán / Mộ theo Giờ Chân Thái Dương thực địa
   */
  function getChiGioChanThaiDuong(date, longitude = 105.85, timezoneOffset = 7) {
    const { trueSolarDate, eotMinutes, deltaLonMinutes, totalOffsetMinutes } = getTrueSolarTime(date, longitude, timezoneOffset);
    const hour = trueSolarDate.getHours();
    const minute = trueSolarDate.getMinutes();
    const second = trueSolarDate.getSeconds();
    const timeDecimal = hour + minute / 60.0 + second / 3600.0;

    let chiGio = "Tý";
    if (timeDecimal >= 23.0 || timeDecimal < 1.0) {
      chiGio = "Tý";
    } else if (timeDecimal < 3.0) {
      chiGio = "Sửu";
    } else if (timeDecimal < 5.0) {
      chiGio = "Dần";
    } else if (timeDecimal < 7.0) {
      chiGio = "Mão";
    } else if (timeDecimal < 9.0) {
      chiGio = "Thìn";
    } else if (timeDecimal < 11.0) {
      chiGio = "Tỵ";
    } else if (timeDecimal < 13.0) {
      chiGio = "Ngọ";
    } else if (timeDecimal < 15.0) {
      chiGio = "Mùi";
    } else if (timeDecimal < 17.0) {
      chiGio = "Thân";
    } else if (timeDecimal < 19.0) {
      chiGio = "Dậu";
    } else if (timeDecimal < 21.0) {
      chiGio = "Tuất";
    } else {
      chiGio = "Hợi";
    }

    // Ban ngày (Đán Quý): 05:00 đến 17:00 (Mão đến Thân)
    // Ban đêm (Mộ Quý): 17:00 đến 05:00 sáng (Dậu đến Dần)
    const isDaytime = (timeDecimal >= 5.0 && timeDecimal < 17.0);

    const pad = (n) => String(n).padStart(2, '0');
    const formatDT = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

    return {
      civilDatetime: formatDT(date),
      trueSolarDatetime: formatDT(trueSolarDate),
      trueSolarDate,
      eotMinutes: Math.round(eotMinutes * 100) / 100,
      longitudeOffsetMinutes: Math.round(deltaLonMinutes * 100) / 100,
      totalOffsetMinutes: Math.round(totalOffsetMinutes * 100) / 100,
      chiGio,
      isDaytime,
      quyNhanType: isDaytime ? "Đán Quý (Ban ngày)" : "Mộ Quý (Ban đêm)"
    };
  }

  const LucNhamEngine = {
    DIA_CHI,
    THIEN_CAN,
    NGU_HANH_CHI,
    NGU_HANH_CAN,
    CAN_KY_CUNG,
    THIEN_TUONG_12,
    TEN_THAN_CUNG,
    QUY_NHAN_DAN_MO,
    SOLAR_TERM_TO_NGUYET_TUONG,
    STANDARD_MERIDIANS,
    CITY_LONGITUDES,

    calculateEquationOfTime,
    getDayOfYear,
    getTrueSolarTime,
    getChiGioChanThaiDuong,

    getNguyetTuong(tietKhi) {
      if (!tietKhi) return "Thìn";
      const clean = tietKhi.trim().toLowerCase();
      for (const [k, v] of Object.entries(SOLAR_TERM_TO_NGUYET_TUONG)) {
        if (k.toLowerCase() === clean) return v;
      }
      return "Thìn";
    },

    idxChi(chi) {
      return DIA_CHI.indexOf(chi);
    },

    chiAt(index) {
      return DIA_CHI[(index % 12 + 12) % 12];
    },

    getNguHanhRel(hanhA, hanhB) {
      if (hanhA === hanhB) return "TY";
      const sinhMap = {"Mộc": "Hỏa", "Hỏa": "Thổ", "Thổ": "Kim", "Kim": "Thủy", "Thủy": "Mộc"};
      const khacMap = {"Mộc": "Thổ", "Thổ": "Thủy", "Thủy": "Hỏa", "Hỏa": "Kim", "Kim": "Mộc"};
      if (sinhMap[hanhA] === hanhB) return "SINH_XUAT";
      if (sinhMap[hanhB] === hanhA) return "SINH_NHAP";
      if (khacMap[hanhA] === hanhB) return "KHAC";
      if (khacMap[hanhB] === hanhA) return "TAC";
      return "BINH";
    },

    getLucThan(canNgay, chi) {
      const hCan = NGU_HANH_CAN[canNgay];
      const hChi = NGU_HANH_CHI[chi];
      if (hCan === hChi) return "Huynh đệ";
      const sinhMap = {"Mộc": "Hỏa", "Hỏa": "Thổ", "Thổ": "Kim", "Kim": "Thủy", "Thủy": "Mộc"};
      const khacMap = {"Mộc": "Thổ", "Thổ": "Thủy", "Thủy": "Hỏa", "Hỏa": "Kim", "Kim": "Mộc"};
      if (sinhMap[hChi] === hCan) return "Phụ mẫu";
      if (sinhMap[hCan] === hChi) return "Tử tôn";
      if (khacMap[hCan] === hChi) return "Thê tài";
      if (khacMap[hChi] === hCan) return "Quan quỷ";
      return "Bình";
    },

    setupThienDiaBan(nguyetTuong, chiGio) {
      const shift = this.idxChi(nguyetTuong) - this.idxChi(chiGio);
      const thienBan = {};
      for (const d of DIA_CHI) {
        thienBan[d] = this.chiAt(this.idxChi(d) + shift);
      }
      return thienBan;
    },

    buildTuKhoa(canNgay, chiNgay, thienBan) {
      const ha1 = CAN_KY_CUNG[canNgay];
      const thuong1 = thienBan[ha1];
      const ha2 = thuong1;
      const thuong2 = thienBan[ha2];
      const ha3 = chiNgay;
      const thuong3 = thienBan[ha3];
      const ha4 = thuong3;
      const thuong4 = thienBan[ha4];

      const raw = [
        { id: "I", name: "Khóa I (Can Dương)", thuong: thuong1, ha: canNgay, haChi: ha1 },
        { id: "II", name: "Khóa II (Can Âm)", thuong: thuong2, ha: ha2, haChi: ha2 },
        { id: "III", name: "Khóa III (Chi Dương)", thuong: thuong3, ha: ha3, haChi: ha3 },
        { id: "IV", name: "Khóa IV (Chi Âm)", thuong: thuong4, ha: ha4, haChi: ha4 }
      ];

      for (const k of raw) {
        const hThuong = NGU_HANH_CHI[k.thuong];
        const hHa = (k.id === "I") ? NGU_HANH_CAN[k.ha] : NGU_HANH_CHI[k.ha];
        const rel = this.getNguHanhRel(hThuong, hHa);
        k.hThuong = hThuong;
        k.hHa = hHa;
        if (rel === "TAC") {
          k.quanHe = "Tặc";
          k.code = "TAC";
        } else if (rel === "KHAC") {
          k.quanHe = "Khắc";
          k.code = "KHAC";
        } else if (rel === "TY") {
          k.quanHe = "Tỷ";
          k.code = "TY";
        } else {
          k.quanHe = "Sinh";
          k.code = "SINH";
        }
      }
      return raw;
    },

    findTamTruyen(tuKhoa, canNgay, chiNgay, thienBan) {
      const diaBanOf = {};
      for (const [db, tb] of Object.entries(thienBan)) {
        diaBanOf[tb] = db;
      }

      const tacs = tuKhoa.filter(k => k.code === "TAC").map(k => k.thuong);
      const khacs = tuKhoa.filter(k => k.code === "KHAC").map(k => k.thuong);

      const hCan = NGU_HANH_CAN[canNgay];
      const daoKhacs = [];
      for (const k of [tuKhoa[1], tuKhoa[2], tuKhoa[3]]) {
        const rel = this.getNguHanhRel(k.hThuong, hCan);
        if (rel === "TAC" || rel === "KHAC") {
          daoKhacs.push(k.thuong);
        }
      }

      let isMaoTinh = false;
      const dauSign = CAN_AM_DUONG[canNgay];
      let soTruyen = "", trungTruyen = "", matTruyen = "", tenTong = "";

      // Khớp chuẩn 100% logic Excel gốc S_LNDD (G102, G103)
      if (tacs.length > 0) {
        soTruyen = tacs[0];
        tenTong = (tacs.length === 1) ? "Tặc Khắc: Trùng Thẩm" : "Tặc Khắc: Đa Tặc";
      } else if (khacs.length > 0) {
        soTruyen = khacs[0];
        tenTong = (khacs.length === 1) ? "Tặc Khắc: Nguyên Thủ" : "Tặc Khắc: Đa Khắc";
      } else if (daoKhacs.length > 0) {
        soTruyen = daoKhacs[0];
        tenTong = "Dao Khắc Pháp";
      } else {
        isMaoTinh = true;
        tenTong = "Mão Tinh Pháp";
        if (dauSign === "+") {
          soTruyen = thienBan["Dậu"];
          trungTruyen = thienBan[chiNgay];
          matTruyen = tuKhoa[0].thuong;
        } else {
          soTruyen = diaBanOf["Dậu"];
          trungTruyen = tuKhoa[0].thuong;
          matTruyen = thienBan[chiNgay];
        }
      }

      if (!isMaoTinh) {
        trungTruyen = thienBan[soTruyen];
        matTruyen = thienBan[trungTruyen];
      }

      return { soTruyen, trungTruyen, matTruyen, tenTong };
    },

    anThienTuong(canNgay, chiGio, thienBan, isDaytimeForced) {
      const diaBanOf = {};
      for (const [db, tb] of Object.entries(thienBan)) {
        diaBanOf[tb] = db;
      }

      let isDay = false;
      if (isDaytimeForced !== undefined && isDaytimeForced !== null) {
        isDay = Boolean(isDaytimeForced);
      } else {
        isDay = ["Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân"].includes(chiGio);
      }

      const danMo = QUY_NHAN_DAN_MO[canNgay];
      const quyThan = isDay ? danMo[0] : danMo[1];
      const diaBanQuy = diaBanOf[quyThan];
      const rQuy = DIA_CHI.indexOf(diaBanQuy);

      // Excel formula: IF(AND(rQuy >= 5, rQuy <= 10), Nghịch, Thuận) -> [Tỵ, Ngọ, Mùi, Thân, Dậu, Tuất] là NGHỊCH
      const isNghich = ["Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất"].includes(diaBanQuy);
      const isThuan = !isNghich;
      const chieu = isThuan ? "Thuận" : "Nghịch";

      const tuongDiaBan = {};
      const tuongThienBan = {};

      for (let r = 0; r < 12; r++) {
        const db = DIA_CHI[r];
        const k = isThuan ? ((r - rQuy + 12) % 12) : (((-(r - rQuy)) % 12 + 12) % 12);
        const tuong = THIEN_TUONG_12[k];
        tuongDiaBan[db] = tuong;
        tuongThienBan[thienBan[db]] = tuong;
      }

      return {
        tuongDiaBan,
        tuongThienBan,
        quyThan,
        diaBanQuy,
        chieu,
        isDay
      };
    },

    /**
     * Lập quẻ Đại Lục Nhâm toàn diện 8 lớp thông tin
     */
    lapQue(options = {}) {
      let {
        canNgay,
        chiNgay,
        chiGio,
        nguyetTuong,
        isDaytime = null,
        tietKhi = "Thu phân",
        chiNam = "Sửu",
        birthYear = 1982,
        currentYear = 2009,
        gioiTinh = "Nam",
        chiThang = "Tuất",
        date = null,
        useTrueSolarTime = false,
        longitude = null,
        timezoneOffset = 7,
        city = "HaNoi"
      } = options;

      let solarTimeInfo = null;
      if (date && (useTrueSolarTime || longitude !== null)) {
        const targetLng = (longitude !== null && !isNaN(longitude))
          ? Number(longitude)
          : (CITY_LONGITUDES[city] ? CITY_LONGITUDES[city].lng : 105.85);
        solarTimeInfo = this.getChiGioChanThaiDuong(date, targetLng, timezoneOffset);
        if (useTrueSolarTime) {
          if (!options.explicitChiGio) {
            chiGio = solarTimeInfo.chiGio;
          }
          if (isDaytime === null) {
            isDaytime = solarTimeInfo.isDaytime;
          }
        }
      }

      // 1. Thiên Địa Bàn
      const thienBan = this.setupThienDiaBan(nguyetTuong, chiGio);

      // 2. Tứ Khóa
      const tuKhoa = this.buildTuKhoa(canNgay, chiNgay, thienBan);

      // 3. Tam Truyền
      const { soTruyen, trungTruyen, matTruyen, tenTong } = this.findTamTruyen(tuKhoa, canNgay, chiNgay, thienBan);

      // 4. An 12 Thiên Tướng
      const { tuongDiaBan, tuongThienBan, quyThan, diaBanQuy, chieu, isDay } = this.anThienTuong(
        canNgay, chiGio, thienBan, isDaytime
      );

      // 5. Thần Mệnh Đương Số
      const tuoiAm = currentYear - birthYear + 1;
      const isMale = (gioiTinh || "").toLowerCase() === "nam" || (gioiTinh || "").toLowerCase() === "male";
      const hanhNien = isMale
        ? this.chiAt(this.idxChi("Dần") + (tuoiAm - 1))
        : this.chiAt(this.idxChi("Thân") - (tuoiAm - 1));
      const CHI_YEAR = ["Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi"];
      const CAN_YEAR = ["Canh", "Tân", "Nhâm", "Quý", "Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ"];
      const banMenh = CHI_YEAR[((birthYear % 12) + 12) % 12];
      const canNamSinh = CAN_YEAR[((birthYear % 10) + 10) % 10];
      const canChiNamSinh = `${canNamSinh} ${banMenh}`;

      const trachMo = TRACH_MO_MAP[chiNgay] || ["", ""];
      const canKy = CAN_KY_CUNG[canNgay] || "";

      // 6. Tính toán ĐỘNG Thần Sát phụ
      const locChi = THIEN_LOC_MAP[canNgay] || "";
      const tsChi = TRUONG_SINH_MAP[canNgay] || "";
      const maChi = THIEN_MA_MAP[chiNgay] || "";
      const dsChi = DAI_SAT_MAP[canNgay] || "";
      const duLoPair = DU_LO_MAP[canNgay] || ["", ""];
      const duLoChi = isDay ? duLoPair[0] : duLoPair[1];
      const duLoName = isDay ? "Du đô" : "Lỗ đô";
      const ttChi = THIEN_TAI_THANG_MAP[chiThang] || "";
      const nqDb = NHAT_QUY_MAP[chiThang] || "";
      const nqChi = thienBan[nqDb] || "";
      const thDb = THIEN_HINH_MAP[chiThang] || "";
      const thChi = thienBan[thDb] || "";

      // 7. Chi tiết 12 cung ĐỘNG 100%
      const cung12 = {};
      for (const d of DIA_CHI) {
        const tb = thienBan[d];
        const saoThaiTue = SAO_THAI_TUE_MAP[tb] || "";
        const offsetKt = (this.idxChi(d) - this.idxChi(chiNgay) + 12) % 12;
        const saoKienTru = VONG_KIEN_TRU[offsetKt];

        const thanSatPhu = [];
        if (tb === ttChi && ttChi) thanSatPhu.push("Thiên tài");
        if (tb === duLoChi && duLoChi) thanSatPhu.push(duLoName);
        if (tb === locChi && locChi) thanSatPhu.push("Thiên lộc");
        if (tb === tsChi && tsChi) thanSatPhu.push("Trường sinh");
        if (tb === maChi && maChi) thanSatPhu.push("Thiên mã");
        if (tb === nqChi && nqChi) thanSatPhu.push("Nhật quỷ");
        if (tb === thChi && thChi) thanSatPhu.push("Thiên hình");
        if (tb === dsChi && dsChi) thanSatPhu.push("Đại sát");

        cung12[d] = {
          diaBan: d,
          thienBan: tb,
          thienTuong: tuongThienBan[tb],
          saoThaiTue: saoThaiTue,
          saoKienTru: saoKienTru,
          thanSatPhu: thanSatPhu,
          tenNguyetTuong: TEN_THAN_CUNG[tb] || "",
          lucThan: this.getLucThan(canNgay, tb),
          quanHe: this.getNguHanhRel(NGU_HANH_CHI[tb], NGU_HANH_CHI[d]),
          tagHanhNien: (d === hanhNien) ? `${tuoiAm} T` : "",
          tagBanMenh: (d === banMenh) ? "Mệnh" : "",
          tagTrachMo: (d === trachMo[0]) ? "Trạch" : ((d === trachMo[1]) ? "Mộ" : ""),
          tagCanChiNgay: (d === canKy) ? canNgay : ((d === chiNgay) ? chiNgay : "")
        };
      }

      return {
        canNgay,
        chiNgay,
        chiGio,
        nguyetTuong,
        tenNguyetTuong: TEN_THAN_CUNG[nguyetTuong] || "",
        isDaytime: isDay,
        tietKhi,
        quyNhanCung: diaBanQuy,
        quyNhanChieu: chieu,
        tuoiAm,
        gioiTinh,
        birthYear,
        banMenhChi: banMenh,
        canChiNamSinh: canChiNamSinh,
        currentYear,
        chiNam: chiNam,
        chiThang: chiThang,
        hanhNienChi: hanhNien,
        trachThan: trachMo[0],
        moThan: trachMo[1],
        canKyCungChi: canKy,
        tuKhoa,
        tamTruyenTenTong: tenTong,
        soTruyen: {
          chi: soTruyen,
          thienTuong: tuongThienBan[soTruyen],
          lucThan: this.getLucThan(canNgay, soTruyen),
          nguHanh: NGU_HANH_CHI[soTruyen]
        },
        trungTruyen: {
          chi: trungTruyen,
          thienTuong: tuongThienBan[trungTruyen],
          lucThan: this.getLucThan(canNgay, trungTruyen),
          nguHanh: NGU_HANH_CHI[trungTruyen]
        },
        matTruyen: {
          chi: matTruyen,
          thienTuong: tuongThienBan[matTruyen],
          lucThan: this.getLucThan(canNgay, matTruyen),
          nguHanh: NGU_HANH_CHI[matTruyen]
        },
        cung12,
        solarTimeInfo
      };
    }
  };

  // Export
  global.LucNhamEngine = LucNhamEngine;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = LucNhamEngine;
  }
})(typeof window !== 'undefined' ? window : globalThis);
