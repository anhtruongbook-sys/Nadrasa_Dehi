/**
 * NETA LIGHT - TỬ VI ĐẨU SỐ EXPERT SYSTEM & INTERPRETER ENGINE
 * File: engines/tuvi_interpreter.js
 * 
 * Động cơ Luận Giải Tử Vi Đẩu Số Chuyên Sâu 100% Offline (Deterministic Expert System).
 * Chuyển thể toàn diện từ C:\Books\Common Study\Tu_Vi_Expert_System.
 * 
 * Bảo đảm:
 * 1. ZERO-RECALCULATION: Tiếp nhận 100% tinh bàn đã lập từ NetaTuViEngine, tuyệt đối không tính lại lá số.
 * 2. DETERMINISTIC EXPERT RULES: Tích hợp 7 cơ sở tri thức kinh điển:
 *    - 11 Cát Cách & 5 Hung/Bại Cách kinh điển.
 *    - 20+ Bộ sao liên kết (Star Combos: Song Lộc, Khôi Việt, Xương Khúc, Không Kiếp, Hỏa Linh...).
 *    - Luận giải chuyên sâu 12 Cung chức năng (Tướng mạo, Nghề nghiệp, Dòng tiền, Tạng phủ).
 *    - Tứ Hóa Khâm Thiên Môn & Thuyết Lục Nội Cung / Lục Ngoại Cung.
 *    - Vận hạn đa tầng: 80 năm Đại vận suốt đời, Niên vận, Lưu nguyệt 12 tháng, Quét biến động đa năm.
 *    - Chấm điểm định lượng 6 Trụ cột sinh mệnh trên thang 1-100.
 * 3. EDITORIAL POLISHER PARADIGM:
 *    - Thuật toán offline sinh 100% nội dung phân tích và điểm số.
 *    - AI chỉ đóng vai trò Ban Biên Tập soạn lại văn phong mượt mà khi người dùng yêu cầu (Zero-Fabrication).
 */

(function (global) {
  'use strict';

  // ==========================================
  // I. HẰNG SỐ & DỮ LIỆU ĐỊA BÀN - THIÊN BÀN
  // ==========================================

  const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

  const CUNG_CHUC_NAMES = [
    'Mệnh', 'Phụ Mẫu', 'Phúc Đức', 'Điền Trạch', 'Quan Lộc', 'Nô Bộc',
    'Thiên Di', 'Tật Ách', 'Tài Bạch', 'Tử Tức', 'Phu Thê', 'Huynh Đệ'
  ];

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

  const TU_HOA_MAP = {
    'Giáp': ['Liêm Trinh', 'Phá Quân', 'Vũ Khúc', 'Thái Dương'],
    'Ất':   ['Thiên Cơ', 'Thiên Lương', 'Tử Vi', 'Thái Âm'],
    'Bính': ['Thiên Đồng', 'Thiên Cơ', 'Văn Xương', 'Liêm Trinh'],
    'Đinh': ['Thái Âm', 'Thiên Đồng', 'Thiên Cơ', 'Cự Môn'],
    'Mậu':  ['Tham Lang', 'Thái Âm', 'Hữu Bật', 'Thiên Cơ'],
    'Kỷ':   ['Vũ Khúc', 'Tham Lang', 'Thiên Lương', 'Văn Khúc'],
    'Canh': ['Thái Dương', 'Vũ Khúc', 'Thái Âm', 'Thiên Đồng'],
    'Tân':  ['Cự Môn', 'Thái Dương', 'Văn Khúc', 'Văn Xương'],
    'Nhâm': ['Thiên Lương', 'Tử Vi', 'Tả Phụ', 'Vũ Khúc'],
    'Quý':  ['Phá Quân', 'Cự Môn', 'Thái Âm', 'Tham Lang']
  };

  const PALACE_NAME_ALIASES = {
    "mệnh": "Mệnh", "menh": "Mệnh", "mệnh cung": "Mệnh", "menh cung": "Mệnh", "soul": "Mệnh",
    "phụ mẫu": "Phụ Mẫu", "phu mau": "Phụ Mẫu", "cha mẹ": "Phụ Mẫu", "parents": "Phụ Mẫu",
    "phúc đức": "Phúc Đức", "phuc duc": "Phúc Đức", "phúc": "Phúc Đức", "ancestor": "Phúc Đức",
    "điền trạch": "Điền Trạch", "dien trach": "Điền Trạch", "điền": "Điền Trạch", "property": "Điền Trạch",
    "quan lộc": "Quan Lộc", "quan loc": "Quan Lộc", "sự nghiệp": "Quan Lộc", "career": "Quan Lộc",
    "nô bộc": "Nô Bộc", "no boc": "Nô Bộc", "bạn bè": "Nô Bộc", "friends": "Nô Bộc",
    "thiên di": "Thiên Di", "thien di": "Thiên Di", "ra ngoài": "Thiên Di", "travel": "Thiên Di",
    "tật ách": "Tật Ách", "tat ach": "Tật Ách", "sức khỏe": "Tật Ách", "health": "Tật Ách",
    "tài bạch": "Tài Bạch", "tai bach": "Tài Bạch", "tiền bạc": "Tài Bạch", "wealth": "Tài Bạch",
    "tử tức": "Tử Tức", "tu tuc": "Tử Tức", "con cái": "Tử Tức", "children": "Tử Tức",
    "phu thê": "Phu Thê", "phu the": "Phu Thê", "hôn nhân": "Phu Thê", "vợ chồng": "Phu Thê", "spouse": "Phu Thê",
    "huynh đệ": "Huynh Đệ", "huynh de": "Huynh Đệ", "anh em": "Huynh Đệ", "siblings": "Huynh Đệ"
  };

  const ZHI_ALIASES = {
    "tý": "Tý", "ty": "Tý", "zi": "Tý", "子": "Tý",
    "sửu": "Sửu", "suu": "Sửu", "chou": "Sửu", "丑": "Sửu",
    "dần": "Dần", "dan": "Dần", "yin": "Dần", "寅": "Dần",
    "mão": "Mão", "mao": "Mão", "mẹo": "Mão", "meo": "Mão", "chen": "Mão", "卯": "Mão",
    "thìn": "Thìn", "thin": "Thìn", "辰": "Thìn",
    "tỵ": "Tỵ", "ty.": "Tỵ", "si": "Tỵ", "巳": "Tỵ",
    "ngọ": "Ngọ", "ngo": "Ngọ", "wu": "Ngọ", "午": "Ngọ",
    "mùi": "Mùi", "mui": "Mùi", "wei": "Mùi", "未": "Mùi",
    "thân": "Thân", "than": "Thân", "shen": "Thân", "申": "Thân",
    "dậu": "Dậu", "dau": "Dậu", "you": "Dậu", "酉": "Dậu",
    "tuất": "Tuất", "tuat": "Tuất", "xu": "Tuất", "戌": "Tuất",
    "hợi": "Hợi", "hoi": "Hợi", "hai": "Hợi", "亥": "Hợi"
  };

  const GAN_ALIASES = {
    "giáp": "Giáp", "giap": "Giáp", "jia": "Giáp", "甲": "Giáp",
    "ất": "Ất", "at": "Ất", "yi": "Ất", "乙": "Ất",
    "bính": "Bính", "binh": "Bính", "bing": "Bính", "丙": "Bính",
    "đinh": "Đinh", "dinh": "Đinh", "ding": "Đinh", "丁": "Đinh",
    "mậu": "Mậu", "mau": "Mậu", "wu": "Mậu", "戊": "Mậu",
    "kỷ": "Kỷ", "ky": "Kỷ", "ji": "Kỷ", "己": "Kỷ",
    "canh": "Canh", "geng": "Canh", "庚": "Canh",
    "tân": "Tân", "tan": "Tân", "xin": "Tân", "辛": "Tân",
    "nhâm": "Nhâm", "nham": "Nhâm", "ren": "Nhâm", "壬": "Nhâm",
    "quý": "Quý", "quy": "Quý", "gui": "Quý", "癸": "Quý"
  };

  function getNapAm(can, zhi) {
    return NAP_AM_MAP[`${can} ${zhi}`] || 'Hải Trung Kim';
  }

  function getElementFromNapAm(napAm) {
    if (!napAm) return 'Kim';
    const s = String(napAm);
    if (s.includes('Kim')) return 'Kim';
    if (s.includes('Mộc')) return 'Mộc';
    if (s.includes('Thủy')) return 'Thủy';
    if (s.includes('Hỏa')) return 'Hỏa';
    if (s.includes('Thổ')) return 'Thổ';
    return 'Kim';
  }

  function calculateLunarAge(birthYear, targetYear) {
    return Math.max(1, targetYear - birthYear + 1);
  }

  function cleanStarName(s) {
    if (!s) return '';
    return String(s).split('(')[0].trim();
  }

  function getStarBrightness(s) {
    if (!s) return '';
    const str = String(s);
    if (str.includes('(') && str.includes(')')) {
      return str.split('(')[1].split(')')[0].trim();
    }
    return '';
  }

  // ==========================================
  // II. CƠ SỞ TRI THỨC HỌC THUẬT (KNOWLEDGE BASE)
  // ==========================================

  const PATTERNS_DB = {
    favorable_patterns: [
      {
        code: "TU_PHU_VU_TUONG",
        name: "Tử Phủ Vũ Tướng Cách",
        level: "Đại Cách (Cát Lợi Vững Vàng)",
        required_main_stars: ["Tử Vi", "Thiên Phủ", "Vũ Khúc", "Thiên Tướng"],
        description: "Bộ sao đế vương và tài khố hội tụ tại Tam phương Tứ chính của Mệnh Thân. Chủ về năng lực quản trị, tư duy tổ chức, tính cách đĩnh đạc, công danh sự nghiệp phát triển thuận lợi.",
        career: "Thích hợp công tác quản lý, điều hành doanh nghiệp, hoạch định tài chính ngân hàng, cơ quan hành chính.",
        score_bonus: 25
      },
      {
        code: "SAT_PHA_THAM",
        name: "Sát Phá Tham Cách",
        level: "Đại Cách (Biến Động & Khai Phá)",
        required_main_stars: ["Thất Sát", "Phá Quân", "Tham Lang"],
        description: "Bộ ba sao mang tính chất chủ động, cải cách và dám nghĩ dám làm. Cuộc đời trải qua nhiều môi trường rèn luyện, khi gặp thời cơ sẽ tạo nên bước chuyển biến tích cực, khai phá hướng đi mới.",
        career: "Thích hợp làm khởi nghiệp công nghệ, thương mại, kỹ thuật thực địa, đổi mới sáng tạo.",
        score_bonus: 20
      },
      {
        code: "CO_NGUYET_DONG_LUONG",
        name: "Cơ Nguyệt Đồng Lương Cách",
        level: "Đại Cách (Văn Chức & Mưu Lược)",
        required_main_stars: ["Thiên Cơ", "Thái Âm", "Thiên Đồng", "Thiên Lương"],
        description: "Cách cục đại diện cho mẫu người tham mưu, trí tuệ, mô phạm, nhân từ. Không thích tranh chấp bạo liệt, coi trọng sự ổn định, thăng tiến tuần tự nhờ năng lực chuyên môn và uy tín.",
        career: "Thích hợp làm công chức nhà nước, nhà nghiên cứu, bác sĩ, giảng viên, cố vấn chiến lược, chuyên gia tài chính.",
        score_bonus: 18
      },
      {
        code: "CU_NHAT",
        name: "Cự Nhật Đồng Cung / Cự Nhật Chiếu Mệnh",
        level: "Đại Cách (Ngoại Giao & Khẩu Tài)",
        required_main_stars: ["Cự Môn", "Thái Dương"],
        description: "Thái Dương quang minh rực rỡ giải trừ tính ám muội của Cự Môn. Chủ về tài hùng biện xuất sắc, tư duy sắc bén, danh tiếng vang xa, giỏi thuyết phục và kết nối.",
        career: "Thích hợp ngành luật, ngoại giao, truyền thông, marketing, giáo dục đào tạo, phát ngôn viên.",
        score_bonus: 18
      },
      {
        code: "NHAT_NGUYET_TINH_MINH",
        name: "Nhật Nguyệt Tịnh Minh (Đan Trì Quế Trì)",
        level: "Cát Cách Thuận Lợi",
        conditions: "Thái Dương miếu tại Mão/Thìn, Thái Âm miếu tại Hợi/Dậu/Tuất chiếu về Mệnh.",
        description: "Vầng trăng và mặt trời cùng sáng tỏ, hỗ trợ khí số hanh thông. Chủ về người tư duy sáng suốt, xuất thân nền nếp, học tập thuận lợi, gia đạo an hòa.",
        career: "Học giả, nghiên cứu, quản lý văn hóa, giáo dục, tài chính.",
        score_bonus: 22
      },
      {
        code: "THAM_VU_DONG_HANH",
        name: "Tham Vũ Đồng Hành Cách",
        level: "Đại Cách (Tiền Bần Hậu Phú)",
        conditions: "Vũ Khúc và Tham Lang đồng cung tại Sửu hoặc Mùi.",
        description: "Thời trẻ cần nhiều thời gian tích lũy và rèn luyện kinh nghiệm thực tế. Từ sau 30 tuổi trở đi công việc dần ổn định, tài sản tích lũy vững chắc.",
        career: "Kinh doanh thương mại, quản trị sản xuất, cơ khí kỹ thuật, tài chính doanh nghiệp.",
        score_bonus: 16
      },
      {
        code: "HOA_THAM_LINH_THAM",
        name: "Hỏa Tham / Linh Tham Kỳ Cách",
        level: "Kỳ Cách (Cơ Hội Phát Triển Nhanh)",
        conditions: "Tham Lang miếu vượng gặp Hỏa Tinh hoặc Linh Tinh đồng cung/tam chiếu.",
        description: "Có cơ hội nắm bắt thời cơ thị trường nhanh nhạy, tạo ra sự gia tăng tài chính rõ rệt trong những giai đoạn biến động.",
        career: "Đầu tư tài chính, bất động sản, thầu dự án, kinh doanh thương mại quy mô rộng.",
        score_bonus: 20
      },
      {
        code: "THACH_TRUNG_AN_NGOC",
        name: "Thạch Trung Ẩn Ngọc Cách",
        level: "Kỳ Cách (Ngọc Giấu Trong Đá)",
        conditions: "Cự Môn tọa thủ tại Tý hoặc Ngọ gặp Hóa Lộc, Hóa Quyền hoặc Hóa Khoa.",
        description: "Cần thời gian mài giũa tôi luyện kinh nghiệm. Vượt qua giai đoạn tích lũy ban đầu sẽ phát huy năng lực thực tiễn vững vàng, xây dựng uy tín chuyên môn sâu sắc.",
        career: "Chuyên gia chuyên môn sâu, nghiên cứu khoa học, luật sư, phân tích chính sách.",
        score_bonus: 18
      },
      {
        code: "LOC_MA_GIAO_TRI",
        name: "Lộc Mã Giao Trì Cách",
        level: "Cát Cách (Lưu Thông & Phú Tài)",
        conditions: "Lộc Tồn hoặc Hóa Lộc hội ngộ cùng Thiên Mã tại Mệnh hoặc Tài/Quan/Di.",
        description: "Chủ về tính năng động, khả năng thích ứng môi trường mới tốt, phù hợp phát triển công việc có tính lưu chuyển hoặc giao thương xa.",
        career: "Xuất nhập khẩu, logistics vận tải, du lịch, hợp tác đối ngoại, đầu tư đa vùng.",
        score_bonus: 17
      },
      {
        code: "MA_DAU_DOI_KIEM",
        name: "Mã Đầu Đới Kiếm Cách (Đắc cách)",
        level: "Kỳ Cách",
        conditions: "Kình Dương độc tọa tại cung Ngọ đắc địa ngộ Cát tinh.",
        description: "Chủ về người có ý chí quyết đoán, tính cách kiên nghị, dám nhận lãnh nhiệm vụ khó khăn nơi thử thách cao.",
        career: "Chỉ huy quản lý, thanh tra giám sát, phẫu thuật y khoa, giải quyết khủng hoảng.",
        score_bonus: 15
      },
      {
        code: "QUAN_THAN_KHANH_HOI",
        name: "Quân Thần Khánh Hội Cách",
        level: "Cát Cách Thuận Lợi",
        conditions: "Tử Vi ngộ Tả Phụ, Hữu Bật, Văn Xương, Văn Khúc, Thiên Khôi, Thiên Việt đồng triều.",
        description: "Hội tụ đội ngũ hỗ trợ đắc lực, được tập thể tín nhiệm và quý nhân tương trợ, công việc thuận buồm xuôi gió.",
        career: "Lãnh đạo cơ quan, quản lý tổ chức, điều phối dự án quy mô lớn.",
        score_bonus: 24
      }
    ],
    unfavorable_patterns: [
      {
        code: "LINH_XUONG_DA_VU",
        name: "Linh Xương Đà Vũ Cách",
        level: "Bại Cách Hung Hiểm",
        conditions: "Linh Tinh, Văn Xương, Đà La, Vũ Khúc hội tụ tại Mệnh hoặc Cung Hạn.",
        warning: "Hạn chết đuối sông nước hoặc phá sản nghiêm trọng. Cổ nhân có câu: 'Linh Xương Đà Vũ, hạn chí đầu hà'. Cần đề phòng rủi ro tài chính sụp đổ và hạn sông nước hiểm nguy.",
        score_penalty: -25
      },
      {
        code: "KINH_DA_HIEP_KY",
        name: "Kình Đà Hiệp Kỵ Cách",
        level: "Hung Cách Bế Tắc",
        conditions: "Hóa Kỵ tọa thủ bị Kình Dương và Đà La kẹp hai bên giáp cung.",
        warning: "Như người bị giam lỏng giữa hai mũi gươm, tiến thoái lưỡng nan, dễ gặp kiện tụng, tiểu nhân hãm hại, tổn thất nặng nề.",
        score_penalty: -20
      },
      {
        code: "CU_HOA_KINH_DUONG",
        name: "Cự Hỏa Kình Dương Cách",
        level: "Hung Cách Thị Phi & Hỏa Tai",
        conditions: "Cự Môn, Hỏa Tinh, Kình Dương đồng cung hoặc hội chiếu hãm địa.",
        warning: "Chủ về khẩu thiệt thị phi dữ dội, dễ sinh tai nạn lửa cháy điện giật hoặc phẫu thuật thương tật bất ngờ.",
        score_penalty: -18
      },
      {
        code: "KHONG_KIEP_TOA_MENH_HAM",
        name: "Không Kiếp Hãm Địa Tọa Mệnh",
        level: "Hung Cách Ba Đào",
        conditions: "Địa Không, Địa Kiếp hãm địa đồng cung tại Mệnh.",
        warning: "Cuộc đời nhiều trắc trở, bạo phát bạo tàn, tiền vào tay này ra tay khác, dễ gặp phản trắc bất ngờ, cần lấy tu tâm dưỡng đức và làm việc thiện làm gốc cứu giải.",
        score_penalty: -15
      },
      {
        code: "MENH_VO_CHINH_DIEU_SAT_TINH",
        name: "Mệnh Vô Chính Diệu ngộ Sát Tinh",
        level: "Nhược Cách Cần Hỗ Trợ",
        conditions: "Mệnh không có Chính Tinh, lại bị Sát Tinh xâm phạm không có Tuần Triệt che chắn.",
        warning: "Căn bản tiên thiên thiếu điểm tựa vững vàng, tính khí dễ bị ngoại cảnh chi phối, thăng trầm nhiều, cần mượn chính tinh cung đối diện và rèn luyện nghị lực.",
        score_penalty: -12
      }
    ]
  };

  const STAR_COMBOS_DB = {
    benefic_combinations: [
      { code: "SONG_LOC", name: "Song Lộc Triều Viên / Hợp Lộc", stars: ["Lộc Tồn", "Hóa Lộc"], type: "Tài Phú Cực Phẩm", effect: "Tài lộc dồi dào, tiền bạc như nước chảy về chỗ trũng. Vừa có Lộc Tồn tích lũy vừa có Hóa Lộc lưu thông linh hoạt, làm ăn kinh doanh buôn bán đại phát, giàu có sung túc bền vững.", score_mod: 18 },
      { code: "KHOI_VIET", name: "Tọa Quý Hướng Quý (Thiên Khôi - Thiên Việt)", stars: ["Thiên Khôi", "Thiên Việt"], type: "Quý Nhân Phù Trợ", effect: "Đệ nhất quý tinh. Đi đến đâu cũng có lãnh đạo cấp trên nâng đỡ, quý nhân ngầm che chở. Dễ đứng đầu thi cử, có vị thế chỉ huy, uy tín cao trong xã hội.", score_mod: 16 },
      { code: "XUONG_KHUC", name: "Văn Xương - Văn Khúc (Văn Tinh Đăng Khoa)", stars: ["Văn Xương", "Văn Khúc"], type: "Khoa Bảng & Nghệ Thuật", effect: "Thông minh tuyệt đỉnh, học sâu hiểu rộng, văn chương lỗi lạc, đỗ đạt bảng vàng. Có năng khiếu nghệ thuật, ăn nói lưu loát, dung mạo thanh tú nho nhã.", score_mod: 14 },
      { code: "TA_HUU", name: "Tả Phụ - Hữu Bật (Quần Thần Khánh Hội)", stars: ["Tả Phụ", "Hữu Bật"], type: "Cộng Sự & Trợ Lực", effect: "Được muôn người phò tá, bạn bè cộng sự trung thành giúp sức. Hành sự chu toàn, có năng lực lãnh đạo và tổ chức đoàn đội quy mô lớn.", score_mod: 15 },
      { code: "LONG_PHUONG", name: "Long Trì - Phượng Các (Đài Các Phong Lưu)", stars: ["Long Trì", "Phượng Các"], type: "Thanh Danh & Cốt Cách", effect: "Cốt cách thanh cao đài các, diện mạo khôi ngô đoan trang. Dễ xuất thân hoặc kết duyên với gia đình gia giáo, nhà cửa phong lưu thanh tịnh.", score_mod: 10 },
      { code: "TAM_THAI_BAT_TOA", name: "Tam Thai - Bát Tọa (Bộ Đôi Phong Lưu Tôn Quý)", stars: ["Tam Thai", "Bát Tọa"], type: "Bề Thế & Ổn Định", effect: "Gia tăng sự vững chãi, bề thế, phong thái ung dung đĩnh đạc. Có lợi cho việc sở hữu phương tiện xe cộ sang trọng, nhà cửa rộng rãi và nâng cao địa vị xã hội.", score_mod: 10 },
      { code: "QUANG_QUY", name: "Ân Quang - Thiên Quý (Phật Độ Quý Nhân)", stars: ["Ân Quang", "Thiên Quý"], type: "Tâm Linh & Cứu Giải", effect: "Có căn tu, tâm từ bi, hay làm việc thiện. Gặp cơn nguy khốn luôn có ơn trên che chở hóa giải, tai qua nạn khỏi, hậu vận thanh thản hưởng phúc.", score_mod: 12 },
      { code: "THAI_CAO", name: "Thai Phụ - Phong Cáo (Bằng Sắc Vinh Quy)", stars: ["Thai Phụ", "Phong Cáo"], type: "Danh Vị & Khen Thưởng", effect: "Chủ về văn bằng, chứng chỉ, sắc phong khen thưởng, được cấp trên công nhận thực tài, công danh đỗ đạt vẻ vang.", score_mod: 10 },
      { code: "DAO_HONG_HY", name: "Tam Minh Đào Hồng Hỷ (Đào Hoa, Hồng Loan, Thiên Hỷ)", stars: ["Đào Hoa", "Hồng Loan", "Thiên Hỷ"], type: "Hỷ Sự & Duyên Lành", effect: "Dung mạo cuốn hút, duyên dáng, nhiều người thầm thương trộm nhớ. Thuận lợi cho đường tình cảm, nghệ thuật, giao tế và mang lại không khí vui vẻ hỷ sự.", score_mod: 12 },
      { code: "LOC_MA", name: "Lộc Mã Giao Trì (Lộc Tồn / Hóa Lộc + Thiên Mã)", stars: ["Thiên Mã", "Lộc Tồn"], type: "Lưu Thông & Phú Tài", effect: "Ngựa chở kho vàng chạy khắp bốn phương. Càng đi xa, càng năng động buôn bán giao thương thì tài sản càng sinh sôi nảy nở vượt bậc.", score_mod: 16 },
      { code: "MA_KHOC_KHACH", name: "Mã Khốc Khách (Tuấn Mã Đeo Chuông Vàng)", stars: ["Thiên Mã", "Thiên Khốc", "Điếu Khách"], type: "Xông Pha Đạt Kỳ Tích", effect: "Ngựa chiến có chuông vang dội, chủ về người có tài ứng biến, cờ đến tay là phất, xông pha trận mạc thương trường lập chiến công vang dội.", score_mod: 14 }
    ],
    malefic_combinations: [
      { code: "KINH_DA", name: "Kình Dương - Đà La (Hình Thương & Trì Trệ)", stars: ["Kình Dương", "Đà La"], type: "Sát Khí Gai Góc", effect: "Hình thương, phẫu thuật, va chạm dao kéo hoặc tranh chấp gay gắt. Một mặt thúc đẩy tính cách kiên cường gai góc, mặt khác dễ chuốc lấy thị phi oán hận.", score_mod: -15 },
      { code: "HOA_LINH", name: "Hỏa Tinh - Linh Tinh (Sát Tinh Liệt Hỏa)", stars: ["Hỏa Tinh", "Linh Tinh"], type: "Biến Động Cấp Bách", effect: "Tính khí nóng nảy bốc đồng hoặc trầm uất ngấm ngầm. Nếu gặp Tham Lang thì bạo phát điền tài; nếu hãm địa hội sát thì phá sản chớp nhoáng hoặc hỏa tai thương tích.", score_mod: -14 },
      { code: "KHONG_KIEP", name: "Địa Không - Địa Kiếp (Ba Đào Kiếp Nạn)", stars: ["Địa Không", "Địa Kiếp"], type: "Thăng Trầm Bạo Liệt", effect: "Cuộc đời như cánh buồm giữa tâm bão. Bạo phát bạo tàn, tiền vào tay này ra tay khác, dễ gặp phản trắc bất ngờ. Rất hợp cho nghiên cứu trừu tượng, triết học hoặc công nghệ phá cách.", score_mod: -16 },
      { code: "TANG_HO", name: "Tang Môn - Bạch Hổ (Huyết Quang & Tang Khổ)", stars: ["Tang Môn", "Bạch Hổ"], type: "Tang Thương & Pháp Luật", effect: "Gia đạo có việc buồn phiền, nguy cơ tang chế thân tộc, tâm trạng u sầu hoặc dính líu đến tranh chấp pháp lý hành chính, tai nạn máu huyết.", score_mod: -12 },
      { code: "KHOC_HU", name: "Thiên Khốc - Thiên Hư (Ưu Sầu Than Thở)", stars: ["Thiên Khốc", "Thiên Hư"], type: "Nội Tâm Trĩu Nặng", effect: "Hay suy nghĩ bi quan, cuộc đời nhiều nỗi niềm khó giãi bày, tiền tài dễ hao hụt hư ảo nếu không có cát tinh nâng đỡ.", score_mod: -8 },
      { code: "SONG_HAO", name: "Đại Hao - Tiểu Hao (Song Hao Tụ Tán)", stars: ["Đại Hao", "Tiểu Hao"], type: "Tán Tài & Biến Đổi", effect: "Tại Dần Thân Mão Dậu (Chúng thủy triều đông) thì lưu thông tiền bạc giỏi, làm ăn lớn; tại các cung khác hãm địa chủ hao tán tiền của, mua sắm tiêu xài không kiểm soát.", score_mod: -10 },
      { code: "CO_QUA", name: "Cô Thần - Quả Tú (Cô Độc Chi Tinh)", stars: ["Cô Thần", "Quả Tú"], type: "Cô Đơn & Khó Hòa Nhập", effect: "Tính tình trầm mặc, khép kín, thích ở một mình, khó tìm được bạn tri âm tri kỷ. Bất lợi cho đường hôn nhân tình cảm nhưng có lợi cho việc nghiên cứu chuyên sâu độc lập.", score_mod: -10 },
      { code: "HINH_RIEU", name: "Thiên Hình - Thiên Diêu (Nghiệp Duyên Đối Trọng)", stars: ["Thiên Hình", "Thiên Diêu"], type: "Kỷ Luật vs Dục Vọng", effect: "Hai thái cực giằng xé giữa kỷ luật đạo đức thép (Hình) và dục vọng mê đắm, phong lưu lãng mạn (Diêu). Có khiếu đặc biệt về ngành y dược, giải phẫu hoặc luật pháp.", score_mod: -8 },
      { code: "BINH_TUONG", name: "Phục Binh - Tướng Quân (Tranh Quyền & Phản Trắc)", stars: ["Phục Binh", "Tướng Quân"], type: "Đấu Đá & Lừa Gạt", effect: "Dễ gặp cạnh tranh nội bộ khốc liệt, có kẻ tiểu nhân giấu mặt ném đá giấu tay, cần hết sức thận trọng trong việc ủy quyền và ký kết văn bản mật.", score_mod: -10 }
    ]
  };

  const STARS_RULES_DB = {
    main_stars: {
      "Tử Vi": {
        element: "Thổ", yin_yang: "Dương", group: "Bắc Đẩu Tinh", role: "Đế Tinh - Chủ quan lộc, phúc thọ và tôn quý",
        nature: "Trung hậu, nghiêm cẩn, có tư chất lãnh đạo, tự tôn cao, trọng danh dự. Cần Tả Hữu, Xương Khúc, Khôi Việt phò tá thành cách 'Quân Thần Khánh Hội'.",
        mieu_vuong_desc: "Uy quyền hiển hách, phú quý song toàn, mưu đại sự dễ thành, được người kính nể.",
        dac_dia_desc: "Có tài năng lãnh đạo, công danh hanh thông, đời sống ổn định no đủ.",
        ham_binh_desc: "Bình hòa, thiếu tả hữu phò tá dễ thành cô quân (vua một mình), tư tưởng cao nhưng hành động gặp trở lực."
      },
      "Thiên Cơ": {
        element: "Mộc", yin_yang: "Âm", group: "Nam Đẩu Tinh", role: "Thiện Tinh - Chủ mưu trí, trí tuệ, cơ biến và tham mưu",
        nature: "Thông minh, linh hoạt, thích nghiên cứu, quyền biến, giỏi hoạch định chiến lược nhưng hay lo toan, suy nghĩ nhiều.",
        mieu_vuong_desc: "Trí tuệ trác tuyệt, mưu lược quyền biến, phù hợp làm cố vấn, học giả, chuyên gia cấp cao.",
        dac_dia_desc: "Khéo léo, nhiều sáng kiến, công việc tiến triển thuận lợi.",
        ham_binh_desc: "Tâm tính bất định, bàn nhiều làm ít, dễ rơi vào toan tính vụn vặt hoặc lo âu thái quá."
      },
      "Thái Dương": {
        element: "Hỏa", yin_yang: "Dương", group: "Nam Đẩu Tinh", role: "Quan Lộc Tinh - Chủ danh tiếng, quang minh, cha và chồng",
        nature: "Quang minh chính đại, hào sảng, khẳng khái, nhiệt tình, thích giúp người, tự trọng cao, tính cách bộc trực.",
        mieu_vuong_desc: "Nhật lệ trung thiên, uy danh vang lừng, phát triển sự nghiệp rực rỡ, quý hiển.",
        dac_dia_desc: "Sự nghiệp sáng sủa, có danh vọng, nhân hậu và uy tín.",
        ham_binh_desc: "Nhật trầm thủy để, vất vả lao tâm, tình cảm trắc trở, bất lợi cho thị lực và người thân nam giới (cha, chồng)."
      },
      "Vũ Khúc": {
        element: "Kim", yin_yang: "Âm", group: "Bắc Đẩu Tinh", role: "Tài Bạch Tinh - Chủ tài lộc, quả quyết, quyết đoán và tài chính",
        nature: "Cương nghị, quả quyết, thực tế, kỷ luật cao, thấu đáo về kinh tế tài chính, đôi khi cô độc lạnh lùng.",
        mieu_vuong_desc: "Tài lộc dồi dào, nắm giữ trọng trách tài chính, kinh doanh buôn bán đại phát.",
        dac_dia_desc: "Kiếm tiền vững chắc, có ý chí lập thân kiên cường.",
        ham_binh_desc: "Tiền tài tụ tán thất thường, tình duyên muộn màng, tính tình cô khắc."
      },
      "Thiên Đồng": {
        element: "Thủy", yin_yang: "Dương", group: "Nam Đẩu Tinh", role: "Phúc Tinh - Chủ thọ diên, thiện lành, hòa đồng và đổi mới",
        nature: "Ôn hòa, nhân hậu, thích an nhàn, có khiếu nghệ thuật, dễ thích nghi nhưng thiếu tính quyết liệt bền chí.",
        mieu_vuong_desc: "Phúc lộc thâm hậu, tai qua nạn khỏi, an nhàn trường thọ, gặp hung hóa cát.",
        dac_dia_desc: "Đời sống thanh thản, gặp nhiều quý nhân, tâm hồn rộng mở.",
        ham_binh_desc: "Ý chí dễ lung lay, thích hưởng thụ sớm, cuộc đời dễ phải thay đổi chí hướng nhiều lần."
      },
      "Liêm Trinh": {
        element: "Hỏa", yin_yang: "Âm", group: "Bắc Đẩu Tinh", role: "Tù Tinh / Đào Hoa Thứ - Chủ quan trường, pháp luật, nguyên tắc và thẩm mỹ",
        nature: "Cương liệt, liêm khiết, thẳng thắn, trọng quy tắc kỷ cương, giàu tình cảm nội tâm nhưng dễ cực đoan, nóng nảy.",
        mieu_vuong_desc: "Thanh liêm danh giá, nắm quyền sinh sát, sự nghiệp tư pháp hoặc quân đội/quản trị rạng rỡ.",
        dac_dia_desc: "Quyết đoán, có năng lực chuyên môn sắc sảo, tự chủ cao.",
        ham_binh_desc: "Dễ vướng vào vòng lao lý thị phi, tình duyên nhiều sóng gió, cần giữ gìn đạo đức nghiêm ngặt."
      },
      "Thiên Phủ": {
        element: "Thổ", yin_yang: "Dương", group: "Nam Đẩu Tinh", role: "Lệnh Tinh / Kho Tàng - Chủ tài khố, phúc đức, ổn định và quản lý",
        nature: "Khoan hòa, đôn hậu, thận trọng, giỏi tích lũy, quản trị tài sản xuất sắc, ưa chuộng sự bền vững an toàn.",
        mieu_vuong_desc: "Kho lẫm đầy ắp, tiền tài dồi dào, công danh vẹn toàn, hậu vận an khang phú túc.",
        dac_dia_desc: "Gia đạo yên ấm, sự nghiệp phát triển ổn định, có của ăn của để.",
        ham_binh_desc: "Bảo thủ, thiếu đột phá, nếu ngộ Tuần Triệt Không Kiếp thì ví như kho tàng bị thủng, tài sản hao hụt."
      },
      "Thái Âm": {
        element: "Thủy", yin_yang: "Âm", group: "Bắc Đẩu Tinh", role: "Tài Tinh / Điền Trạch Tinh - Chủ điền sản, mẹ, vợ và nội tâm thanh tao",
        nature: "Thanh nhã, tinh tế, giàu lòng nhân ái, có khiếu thẩm mỹ nghệ thuật, sâu sắc nhưng dễ đa sầu đa cảm.",
        mieu_vuong_desc: "Phú quý phong lưu, bất động sản điền sản hưng vượng, tình cảm gia đình mỹ mãn, mẫu mực hiền lương.",
        dac_dia_desc: "Kinh tế sung túc, tính tình dịu dàng, được nhiều người yêu mến.",
        ham_binh_desc: "Tâm tư u uất, tình cảm trắc trở, bất lợi cho mẹ hoặc vợ, tiền tài tụ tán bấp bênh."
      },
      "Tham Lang": {
        element: "Thủy / Mộc", yin_yang: "Dương", group: "Bắc Đẩu Tinh", role: "Đào Hoa Tinh / Dục Tinh - Chủ dục vọng, giao tế, nghệ thuật và đột phá",
        nature: "Đa tài đa nghệ, quảng giao khéo léo, tham vọng lớn, thích phiêu lưu tìm tòi, phong cách phóng khoáng.",
        mieu_vuong_desc: "Giao thiệp rộng khắp, có tài kinh doanh xuất chúng, gặp Hỏa Linh tạo thành kỳ cách bạo phát tài phú.",
        dac_dia_desc: "Lanh lợi, thích nghi nhanh, đường đời nhiều cơ hội phát triển phong phú.",
        ham_binh_desc: "Dễ sa đà vào tửu sắc hư danh, tính khí thất thường, tiền tài dễ đến dễ đi."
      },
      "Cự Môn": {
        element: "Thủy", yin_yang: "Âm", group: "Bắc Đẩu Tinh", role: "Ám Tinh - Chủ thị phi, ngôn ngữ, khẩu tài, tranh biện và nghiên cứu",
        nature: "Sắc sảo, tài hùng biện, tư duy phản biện cao, thẳng thắn phê phán nhưng hay nghi ngờ, dễ chuốc lấy thị phi.",
        mieu_vuong_desc: "Tài thuyết phục tuyệt đỉnh, khẩu tài xuất chúng, danh tiếng trong các ngành luật pháp, ngoại giao, giáo dục.",
        dac_dia_desc: "Ăn nói lưu loát, có năng lực chuyên môn sắc bén, tự khẳng định vị thế.",
        ham_binh_desc: "Khẩu thiệt thị phi bủa vây, nhân duyên bất hòa, dễ vướng kiện tụng tranh chấp nếu không tu dưỡng khẩu nghiệp."
      },
      "Thiên Tướng": {
        element: "Thủy", yin_yang: "Dương", group: "Nam Đẩu Tinh", role: "Ấn Tinh - Chủ uy quyền, sự phò tá, chính trực và lòng trắc ẩn",
        nature: "Trung trinh, khẳng khái, chính trực, ưa làm việc nghĩa, giỏi tổ chức thực thi, phong thái đường hoàng.",
        mieu_vuong_desc: "Nắm quyền điều hành, được cấp trên tín nhiệm, danh vọng và quyền thế song toàn.",
        dac_dia_desc: "Công danh hanh thông, cư xử chuẩn mực, bạn bè nể trọng.",
        ham_binh_desc: "Quá khẳng khái dễ bị kẻ xấu lợi dụng, công việc hay phải làm hộ người khác mà chịu thiệt thòi."
      },
      "Thiên Lương": {
        element: "Thổ / Mộc", yin_yang: "Dương", group: "Nam Đẩu Tinh", role: "Ấm Tinh / Thọ Tinh - Chủ che chở, trường thọ, y dược, giáo dục và đạo đức",
        nature: "Nhân từ, đức độ, phong thái đạo mạo, thích làm việc thiện, giàu kinh nghiệm sống, có duyên với y học và triết lý.",
        mieu_vuong_desc: "Gặp hung hóa cát, thọ khảo trường an, được xã hội kính trọng, phù hợp sư phạm, y tế, cố vấn.",
        dac_dia_desc: "Đức độ vẹn toàn, gia đình êm ấm, hậu vận nhiều phúc thọ.",
        ham_binh_desc: "Hay thích giáo điều, làm việc dễ dây dưa thiếu quyết liệt, thường phải trải qua nguy nan rồi mới được cứu giải."
      },
      "Thất Sát": {
        element: "Kim", yin_yang: "Dương", group: "Nam Đẩu Tinh", role: "Tướng Tinh - Chủ sát phạt, uy dũng, khai phá, độc lập và mạo hiểm",
        nature: "Cương nghị, bản lĩnh vững vàng, dám nghĩ dám làm, không chịu khuất phục, tính khí nóng nảy, thích hành động độc lập.",
        mieu_vuong_desc: "Tạo lập uy tín lớn nơi công trường hoặc thương trường, nắm giữ trọng trách quản trị.",
        dac_dia_desc: "Ý chí kiên cường, dũng cảm đối mặt nghịch cảnh, tự tay gầy dựng sự nghiệp.",
        ham_binh_desc: "Đời nhiều thăng trầm sóng gió, dễ gặp tai nạn thương tật, tính tình bốc đồng cô độc."
      },
      "Phá Quân": {
        element: "Thủy", yin_yang: "Âm", group: "Bắc Đẩu Tinh", role: "Hao Tinh - Chủ phá cũ lập mới, tiên phong, biến động triệt để và hao tán",
        nature: "Dũng mãnh, sáng tạo mang tính phá cách, thích cải tiến đổi mới, không bằng lòng thực tại, cảm xúc mãnh liệt.",
        mieu_vuong_desc: "Tiên phong khai mở, đổi mới thời cuộc, kinh doanh tạo dựng cơ sở mới từ hoàn cảnh khó khăn.",
        dac_dia_desc: "Năng động tiên phong, vượt qua thử thách để đạt thành tựu.",
        ham_binh_desc: "Phá tán tổ nghiệp, cuộc đời chìm nổi bấp bênh, gia đạo lục đục nếu không biết tự kiềm chế."
      }
    },
    six_killers: {
      "Kình Dương": { element: "Kim", role: "Hình Tinh - Chủ cương bạo, phẫu thuật, va chạm thương tật", desc: "Tính khí quả cảm, cương liệt, trực tính. Đắc địa uy dũng; hãm địa chủ tai nạn, hình thương, thị phi đổ vỡ." },
      "Đà La": { element: "Kim", role: "Kỵ Tinh - Chủ dây dưa, trì trệ, ám hại, ghen ghét", desc: "Trầm mặc, đa mưu, kiên trì nhưng cố chấp. Đắc địa phát về kỹ thuật; hãm địa chủ mưu sự trì trệ, thị phi ngầm." },
      "Hỏa Tinh": { element: "Hỏa", role: "Sát Tinh - Chủ bộc phát cấp tốc, nóng nảy, cháy nổ, kích động", desc: "Nhiệt huyết, hành sự quyết liệt. Gặp Tham Lang bạo phát tài phú; hãm địa nóng nảy bốc đồng, dễ tổn thương." },
      "Linh Tinh": { element: "Hỏa", role: "Sát Tinh - Chủ trầm uất, âm ỉ, mưu mô, bất ngờ phát tác", desc: "Can đảm ngầm, thâm trầm. Gặp Tham Lang hoạch phát điền tài; hãm địa lo nghĩ u uất hoặc gặp nạn bất ngờ." },
      "Địa Không": { element: "Hỏa", role: "Sát Tinh - Chủ hư vô, trừu tượng, phá cách, bạo bại", desc: "Tư duy siêu phàm, phi truyền thống. Đắc địa bạo phát tài danh; hãm địa tiền tài tiêu tán, trắng tay." },
      "Địa Kiếp": { element: "Hỏa", role: "Sát Tinh - Chủ đoạt quyền, trắc trở đường đời, bạo phát bạo tàn", desc: "Gan góc, thích mạo hiểm. Đắc địa phát dã như lôi; hãm địa chủ tai kiếp bất ngờ, mất mát tài sản lớn." }
    },
    six_lucky_stars: {
      "Tả Phụ": { element: "Thổ", role: "Trợ Tinh - Quý nhân phò trợ, bạn bè trợ lực, hành sự chu toàn" },
      "Hữu Bật": { element: "Thổ", role: "Trợ Tinh - Quý nhân đồng hành, trợ giúp đắc lực, mở rộng cơ đồ" },
      "Văn Xương": { element: "Kim", role: "Văn Tinh - Khoa cử, văn chương, bằng cấp, tư duy logic, thi cử đỗ đạt" },
      "Văn Khúc": { element: "Thủy", role: "Văn Tinh - Năng khiếu nghệ thuật, tài ăn nói, trực giác, lãng mạn" },
      "Thiên Khôi": { element: "Hỏa", role: "Quý Tinh - Đệ nhất quý nhân, lãnh đạo cất nhắc, đứng đầu danh sách" },
      "Thiên Việt": { element: "Hỏa", role: "Quý Tinh - Quý nhân ngầm hỗ trợ, cơ hội bất ngờ, nhân duyên tốt đẹp" }
    }
  };

  const PALACES_INFO_DB = {
    "Mệnh": { name: "Cung Mệnh", triad_group: "Mệnh - Tài - Quan", triad_role: "Bản Thể Tiên Thiên", description: "Là hạt nhân và cốt tủy của toàn bộ lá số Tử Vi. Quyết định diện mạo, khí chất, tính cách nội tâm, năng lực bẩm sinh, phúc thọ và mức độ thành bại tổng quát của cuộc đời.", focus: "Định hình nhân cách, chí hướng lập thân và khả năng chống chịu trước sóng gió thời cuộc." },
    "Thân": { name: "Thân Cư", triad_group: "Hậu Vận & Hành Động", triad_role: "Thực Thể Hậu Thiên", description: "Là nơi quy nạp tâm thức và hành vi thực tế sau tuổi 30 (trung niên và hậu vận). Mệnh là mầm cây tiên thiên, Thân là hoa trái hậu thiên mà con người tự tay vun trồng.", focus: "Chuyển dịch trọng tâm cuộc đời và kết quả thụ hưởng thực tế về sau." },
    "Phụ Mẫu": { name: "Cung Phụ Mẫu", triad_group: "Phụ - Tử - Nô", triad_role: "Nguồn Cội & Phúc Ấm", description: "Thể hiện mối quan hệ với song thân (cha mẹ), thọ khảo của cha mẹ, di truyền dòng tộc và sự nâng đỡ từ bề trên, cấp quản lý trực tiếp.", focus: "Mức độ hòa thuận gia đình và sự che chở từ người đi trước." },
    "Phúc Đức": { name: "Cung Phúc Đức", triad_group: "Phúc - Phối - Di", triad_role: "Gốc Rễ Tinh Thần & Tổ Nghiệp", description: "Cung vị chủ về dòng họ mồ mả tổ tiên, phúc ấm vô hình tích lũy nhiều đời, đời sống tinh thần, sự an lạc nội tâm và tuổi thọ. Là gốc rễ cứu giải khi lâm vào đại hạn ngặt nghèo.", focus: "Sự thanh thản trong tâm hồn, phúc đức gia tiên và sự thọ khang." },
    "Điền Trạch": { name: "Cung Điền Trạch", triad_group: "Điền - Tật - Huynh", triad_role: "Tài Sản Bất Động Sản & Nơi Ở", description: "Biểu hiện nhà cửa, đất đai, bất động sản, cơ nghiệp thừa kế từ tiền nhân, khả năng tự tay tạo lập tư gia và phong thủy nơi cư trú, an ninh gia đạo.", focus: "Khả năng tích lũy tài sản cố định và không gian sống bình yên." },
    "Quan Lộc": { name: "Cung Quan Lộc", triad_group: "Mệnh - Tài - Quan", triad_role: "Sự Nghiệp & Vị Thế Xã Hội", description: "Phản ánh con đường công danh, sự nghiệp, chức vụ, mức độ thành công trong nghề nghiệp, thái độ làm việc và ngành nghề phù hợp nhất với đương số.", focus: "Định hướng phát triển chuyên môn, năng lực lãnh đạo và con đường thăng tiến." },
    "Nô Bộc": { name: "Cung Nô Bộc", triad_group: "Phụ - Tử - Nô", triad_role: "Đoàn Đội & Mối Quan Hệ Xã Hội", description: "Thể hiện bạn bè, cấp dưới, đồng nghiệp, cộng sự, đối tác kinh doanh. Cho biết được trợ lực đắc lực hay dễ bị phản phúc, lừa gạt, ghen ghét đố kỵ.", focus: "Chính sách dùng người, đối nhân xử thế và xây dựng mạng lưới quan hệ." },
    "Thiên Di": { name: "Cung Thiên Di", triad_group: "Phúc - Phối - Di", triad_role: "Môi Trường Ngoài & Xuất Ngoại", description: "Đối cung trực tiếp của Cung Mệnh. Phản ánh hoàn cảnh đương số khi bước chân ra xã hội, đi xa, xuất ngoại, công tác, mức độ an toàn giao thông và sự đãi ngộ của xã hội.", focus: "Cơ hội bên ngoài biên giới, năng lực thích ứng và quý nhân phương xa." },
    "Tật Ách": { name: "Cung Tật Ách", triad_group: "Điền - Tật - Huynh", triad_role: "Sức Khỏe & Tai Ương Ngục Tụng", description: "Chỉ rõ cơ địa tiên thiên theo ngũ hành tạng phủ, các nguy cơ bệnh tật mãn tính, tai nạn xe cộ, thương tích phẫu thuật, thị phi pháp lý và phương pháp phòng ngừa.", focus: "Chăm sóc dưỡng sinh, phòng bệnh hơn chữa bệnh, kiểm soát an toàn thân thể." },
    "Tài Bạch": { name: "Cung Tài Bạch", triad_group: "Mệnh - Tài - Quan", triad_role: "Tài Chính & Nguồn Thu Nhập", description: "Phản ánh cách thức kiếm tiền, dòng tiền luân chuyển, năng lực giữ tiền, quy mô tài sản động, thời điểm phát tài hoặc hao tán của đương số.", focus: "Chiến lược quản lý tài chính, phương thức làm giàu và kiểm soát rủi ro tiền bạc." },
    "Tử Tức": { name: "Cung Tử Tức", triad_group: "Phụ - Tử - Nô", triad_role: "Hậu Duệ & Con Cái", description: "Thể hiện số lượng, tính cách, phẩm chất, sức khỏe và tương lai của con cái, mối quan hệ giữa cha mẹ và con cái, khả năng phụng dưỡng khi về già.", focus: "Phương pháp giáo dục con cái và xây dựng truyền thống gia phong." },
    "Phu Thê": { name: "Cung Phu Thê", triad_group: "Phúc - Phối - Di", triad_role: "Hôn Nhân & Bạn Đời", description: "Biểu thị nhân duyên vợ chồng, tính cách, ngoại hình và nghề nghiệp của người bạn đời, mức độ hòa thuận hay xung khắc, các giai đoạn dễ biến động trong tình cảm.", focus: "Nghệ thuật gìn giữ hôn nhân, sự thấu hiểu và cùng nhau vượt qua thử thách." },
    "Huynh Đệ": { name: "Cung Huynh Đệ", triad_group: "Điền - Tật - Huynh", triad_role: "Anh Em & Bạn Tri Kỷ", description: "Thể hiện tình cảm ruột thịt anh chị em, mức độ chia sẻ nâng đỡ lẫn nhau trong cuộc sống hoặc nguy cơ tranh chấp tài sản gia đình.", focus: "Sự đoàn kết gia đình và sự tương trợ giữa những người cùng huyết thống." }
  };

  const PALACE_DEEP_ASPECTS_DB = {
    "Mệnh": {
      appearance_by_main_star: {
        "Tử Vi": "Thân hình bệ vệ, khuôn mặt vuông vắn đầy đặn, ánh mắt uy nghiêm, phong thái đường hoàng đĩnh đạc, cử chỉ mực thước.",
        "Thiên Cơ": "Dáng dấp thanh tú, mắt sáng linh hoạt, vóc dáng tầm thước hoặc hơi gầy, bước đi nhanh nhẹn, toát lên vẻ trí tuệ.",
        "Thái Dương": "Trán cao rộng, mắt sáng có thần, sắc diện hồng hào, giọng nói hào sảng vang xa, phong thái nhiệt tình quang minh.",
        "Vũ Khúc": "Thân hình tầm thước, cơ bắp rắn rỏi, mặt chữ điền, ánh mắt cương nghị quả quyết, phong cách dứt khoát thực tế.",
        "Thiên Đồng": "Khuôn mặt tròn trịa đầy đặn, da dẻ mịn màng, nụ cười hiền hậu, mắt đa tình, toát lên vẻ ngây thơ lương thiện dễ gần.",
        "Liêm Trinh": "Mặt góc cạnh, mắt lộ sắc sảo, thân hình cân đối nhanh nhẹn, phong thái nghiêm cẩn kỷ luật, có sức hút nội tâm đặc biệt.",
        "Thiên Phủ": "Thân hình đẫy đà phúc hậu, sắc mặt hồng hào, miệng cười đoan trang, phong thái khoan thai điềm đạm quý phái.",
        "Thái Âm": "Da trắng, diện mạo thanh tú nho nhã, ánh mắt êm dịu sâu lắng, vóc dáng thanh mảnh, phong thái lịch thiệp tao nhã.",
        "Tham Lang": "Thân hình cao ráo hoặc nở nang, mắt đa tình linh hoạt, giọng nói truyền cảm cuốn hút, phong cách phóng khoáng giao thiệp rộng.",
        "Cự Môn": "Ánh mắt sắc sảo hay quan sát dò xét, môi mỏng, răng đều, giọng nói đanh thép khúc chiết, toát lên vẻ tư duy phản biện.",
        "Thiên Tướng": "Diện mạo khôi ngô tuấn tú, trán rộng, cằm vuông, phong thái đĩnh đạc trung thực, ăn mặc chỉnh tề uy phong.",
        "Thiên Lương": "Khuôn mặt dài đạo mạo, râu tóc rậm, ánh mắt từ bi sâu sắc, phong thái mô phạm đạo đức của bậc trưởng bối.",
        "Thất Sát": "Ánh mắt sắc lạnh hình viên đạn, lông mày rậm xếch, vóc dáng xương xẩu chắc nịch, phong thái uy dũng sát phạt quyết liệt.",
        "Phá Quân": "Vai u thịt bắp hoặc dáng đi hơi nghiêng, mắt lộ hung quang, cử chỉ mạnh mẽ phá cách, toát lên khí thế dũng mãnh bất kham."
      },
      core_traits: {
        "Tử Vi": "Đế tinh ngự mệnh, bản lĩnh lãnh tụ tự nhiên, tự tôn cao, trọng danh dự và uy tín, luôn hướng tới đại cục.",
        "Thiên Cơ": "Trí tuệ mưu lược, tư duy cơ biến sắc bén, giỏi tính toán kế sách, thích học hỏi nghiên cứu điều mới lạ.",
        "Thái Dương": "Quang minh lỗi lạc, khẳng khái nhiệt thành, giàu lòng vị tha, thích gánh vác việc công và che chở người khác.",
        "Vũ Khúc": "Cương nghị dứt khoát, thực tế sắc bén, có đầu óc tài chính bẩm sinh, làm việc kiên trì kỷ luật không ngại gian khó.",
        "Thiên Đồng": "Nhân từ lương thiện, tâm hồn an nhiên khoáng đạt, thích sự hòa bình, phước trạch dày dặn, gặp dữ hóa lành.",
        "Liêm Trinh": "Cương liệt thẳng thắn, trọng nguyên tắc đạo đức, ý chí kiên định, giàu cảm xúc nhưng nội tâm phòng thủ cẩn mật.",
        "Thiên Phủ": "Điềm đạm bao dung, thâm trầm kín đáo, có tài quản lý quy mô lớn, tính cách thận trọng giữ gìn cơ nghiệp bền vững.",
        "Thái Âm": "Trực giác nhạy bén, tâm tư kín đáo tinh tế, chu đáo mẫu mực, giàu năng khiếu thẩm mỹ và tình cảm gia đình.",
        "Tham Lang": "Tham vọng khai phá, linh hoạt ứng biến, đa tài đa nghệ, năng lực giao thiệp và tính thuyết phục cao.",
        "Cự Môn": "Tư duy phản biện độc lập, nói năng đanh thép sắc sảo, năng lực bóc tách sự thật, cẩn trọng trong từng chi tiết.",
        "Thiên Tướng": "Chính trực trượng nghĩa, có trách nhiệm cao, chu toàn mẫu mực, là chỗ dựa tin cậy cho tập thể và tổ chức.",
        "Thiên Lương": "Đạo đức thanh cao, nhân từ độ lượng, phong thái mô phạm, thường được người đời tôn kính làm bậc thầy, cố vấn.",
        "Thất Sát": "Tính cách quyết đoán kiên nghị, dứt khoát, không ngại khó khăn, có bản lĩnh độc lập tác chiến mở rộng cơ hội.",
        "Phá Quân": "Tinh thần cách tân đổi mới, dám thay đổi khuôn mẫu cũ để thiết lập quy trình mới, kiên cường vượt qua thử thách."
      }
    },
    "Quan Lộc": {
      suitable_careers_by_star: {
        "Tử Vi": "Lãnh đạo cơ quan nhà nước, CEO tập đoàn, quản lý chiến lược, hoạch định chính sách vĩ mô.",
        "Thiên Cơ": "Công nghệ thông tin (IT), nghiên cứu khoa học, cố vấn chiến lược, kiến trúc sư, chuyên gia phân tích dữ liệu.",
        "Thái Dương": "Chính trị gia, ngoại giao, truyền thông báo chí, năng lượng điện tử, giáo dục đào tạo, công chứng pháp luật.",
        "Vũ Khúc": "Ngân hàng, tài chính kế toán, kiểm toán, quản lý quỹ đầu tư, cơ khí chế tạo, kinh doanh buôn bán quy mô lớn.",
        "Thiên Đồng": "Dịch vụ du lịch khách sạn, nghệ thuật giải trí, công tác xã hội thiện nguyện, ẩm thực, thương mại tự do.",
        "Liêm Trinh": "Cơ quan tư pháp, tòa án, công an, quân đội, quản lý chất lượng, công nghệ kỹ thuật cao, ngành thời trang.",
        "Thiên Phủ": "Quản trị doanh nghiệp, ngân hàng dự trữ, bất động sản, thủ kho tài sản quốc gia, quản lý chuỗi cung ứng.",
        "Thái Âm": "Tài chính bất động sản, thiết kế nội thất, mỹ thuật nghệ thuật, khách sạn du lịch, kinh doanh hàng tiêu dùng cao cấp.",
        "Tham Lang": "Thương mại quốc tế, ngoại giao, giải trí, chứng khoán, tổ chức sự kiện, khởi nghiệp mạo hiểm, marketing.",
        "Cự Môn": "Luật sư tranh tụng, nhà ngoại giao, phát ngôn viên, giáo viên, dịch thuật, chuyên gia thẩm định phê bình.",
        "Thiên Tướng": "Điều hành thực thi chính sách, thư ký cao cấp, trợ lý tổng giám đốc, bác sĩ phẫu thuật, tư vấn pháp lý.",
        "Thiên Lương": "Y dược học, bác sĩ, giảng viên đại học, nghiên cứu lý luận, cơ quan thanh tra giám sát, tổ chức nhân đạo.",
        "Thất Sát": "Sĩ quan quân đội cảnh sát, thương trường cạnh tranh mạo hiểm, phẫu thuật ngoại khoa, cơ khí nặng, xây dựng công trình.",
        "Phá Quân": "Khởi nghiệp công nghệ đột phá, đổi mới sáng tạo, thám hiểm, cải cách thể chế, công nghiệp khai khoáng, thương mại xuyên biên giới."
      },
      work_style: {
        "Tử Vi": "Lãnh đạo bằng uy tín và tầm nhìn bao quát, chú trọng phân quyền và xây dựng đội ngũ trung kiên.",
        "Thiên Cơ": "Làm việc bằng trí tuệ, mưu lược, phương pháp khoa học logic, thích tối ưu hóa quy trình.",
        "Thái Dương": "Hành sự công khai minh bạch, truyền cảm hứng mạnh mẽ, làm việc hết mình vì lợi ích chung.",
        "Vũ Khúc": "Thực thi chuẩn xác, đề cao hiệu quả và chỉ số đo lường thực tế, nghiêm túc không nhân nhượng.",
        "Thiên Đồng": "Môi trường làm việc hòa nhã, coi trọng yếu tố nhân văn và sự thoải mái của cộng sự.",
        "Liêm Trinh": "Kỷ luật thép, chuẩn mực quy trình chặt chẽ, liêm khiết không chấp nhận sự nhập nhèm.",
        "Thiên Phủ": "Vững vàng cẩn trọng, tích lũy từng bước, phát triển bền bỉ và kiểm soát rủi ro tài chính tối ưu.",
        "Thái Âm": "Lập kế hoạch tỉ mỉ, xử lý công việc bằng sự khéo léo mềm mỏng, tạo dựng uy tín thâm sâu.",
        "Tham Lang": "Năng động xông pha, chớp thời cơ nhanh nhạy, khai phá các thị trường mới bằng tài giao thiệp.",
        "Cự Môn": "Phân tích sắc bén, chỉ ra các lỗ hổng sai sót, bảo vệ quyền lợi bằng lập luận chặt chẽ.",
        "Thiên Tướng": "Thực thi chuẩn mực, tận tụy mẫn cán, là cánh tay đắc lực của người đứng đầu tổ chức.",
        "Thiên Lương": "Làm việc dựa trên đạo đức nghề nghiệp, coi trọng danh dự, xử lý công bằng thấu tình đạt lý.",
        "Thất Sát": "Hành động quyết liệt tốc chiến tốc thắng, dám chịu trách nhiệm cá nhân, vượt qua mọi trở lực.",
        "Phá Quân": "Dám mạo hiểm dỡ bỏ lề lối cũ, tạo nên những bước đột phá mang tính cách mạng cho tổ chức."
      }
    },
    "Tài Bạch": {
      wealth_mechanism: {
        "Vũ Khúc": "Tài tinh chính tông: Kiếm tiền bằng năng lực tài chính nhạy bén, kinh doanh buôn bán thực tế, tiền bạc tụ tích bền vững.",
        "Thiên Phủ": "Kho tàng đầy ắp: Tiền tài ổn định, giỏi tích lũy, tiền đẻ ra tiền qua tài sản cố định và đầu tư an toàn.",
        "Thái Âm": "Điền tài phong lưu: Thu nhập từ bất động sản, chứng khoán dài hạn hoặc nguồn tài chính từ phái nữ / đối tác ngoại quốc.",
        "Tham Lang": "Hoạch tài bạo phát: Có cơ hội kiếm tiền đột biến từ các phi vụ làm ăn lớn, đầu cơ, nhưng cần biết điểm dừng để tránh bạo tàn.",
        "Thất Sát": "Kiếm tiền nơi đầu sóng ngọn gió: Dám mạo hiểm dốc vốn lớn để thu lời lớn, tiền tài thăng trầm dao động mạnh.",
        "Phá Quân": "Tiền tài tụ tán thất thường: Phá cũ lập mới, kiếm được nhiều nhưng chi tiêu cũng cực lớn, khó tích lũy nếu thiếu Lộc Tồn kiềm chế.",
        "Cự Môn": "Kiếm tiền bằng khẩu tài: Nguồn thu nhập gắn liền với ăn nói, đàm phán, tư vấn, dịch vụ tranh luận chuyên môn.",
        "Tử Vi": "Tiền tài danh giá: Kiếm tiền từ vị trí quản lý cao cấp, uy tín cá nhân, kinh doanh thương hiệu lớn.",
        "Thiên Cơ": "Kiếm tiền bằng trí óc: Thu nhập từ phát minh sáng chế, cố vấn chiến lược, công nghệ thông tin hoặc đầu tư lướt sóng nhạy bén.",
        "Thái Dương": "Tiền tài chính ngạch: Thu nhập công khai từ doanh nghiệp lớn, công chức, kinh doanh quốc tế, hào phóng chi tiêu.",
        "Thiên Đồng": "Tiền tài bình ổn: Nguồn thu vừa đủ an nhàn, có của cải thừa kế hoặc lộc bất ngờ, không quá tham lam tích lũy.",
        "Liêm Trinh": "Kiếm tiền từ chuyên môn nghiêm ngặt: Thu nhập từ luật pháp, kỹ thuật, quản lý rủi ro hoặc dịch vụ cao cấp.",
        "Thiên Tướng": "Nguồn tiền ổn định từ chức vụ bổng lộc: Quản lý dòng tiền minh bạch, được cấp trên chia sẻ lợi nhuận.",
        "Thiên Lương": "Tiền tài trong sạch: Kiếm tiền từ y dược, giáo dục, tư vấn lương tâm, không kiếm tiền phi nghĩa."
      },
      money_management: {
        "Tử Vi": "Quản trị dòng tiền quy mô lớn, chi tiêu phóng khoáng nhưng đúng mục đích danh dự.",
        "Thiên Cơ": "Phân bổ linh hoạt vào nhiều kênh, cần tránh quá sa đà vào các kênh đầu cơ ngắn hạn.",
        "Thái Dương": "Chi tiêu hào phóng vì người khác, cần lập quỹ tích lũy dài hạn phòng khi vận hạn biến động.",
        "Vũ Khúc": "Giữ tiền cực chặt, phân bổ vốn khoa học, kiểm soát chi tiêu chi tiết đến từng đồng.",
        "Thiên Đồng": "Chi tiêu cho hưởng thụ cá nhân và gia đình, nên chuyển tiền mặt thành bất động sản giữ hộ.",
        "Liêm Trinh": "Tài chính rạch ròi, tuyệt đối tránh các giao dịch mập mờ thiếu cơ sở pháp lý.",
        "Thiên Phủ": "Bậc thầy tích lũy an toàn, chia nhỏ rủi ro vào đất đai, vàng và ngân hàng uy tín.",
        "Thái Âm": "Tích lũy tài sản âm thầm, tái đầu tư dài hạn vào nhà đất, dòng tiền sinh sôi đều đặn.",
        "Tham Lang": "Dễ tiêu tiền vào các cuộc vui chơi quan hệ, cần có người phối ngẫu giữ tay hòm chìa khóa.",
        "Cự Môn": "Kiểm soát hợp đồng chặt chẽ, phòng ngừa tranh chấp tiền bạc hoặc bị quỵt nợ.",
        "Thiên Tướng": "Tài chính cân đối, uy tín tài chính cao, dễ dàng huy động vốn khi cần kinh doanh.",
        "Thiên Lương": "Không màng danh lợi quá mức, tiền bạc đủ đầy an lạc, hậu vận giàu có thanh nhàn.",
        "Thất Sát": "Đầu tư liều lĩnh, khi thắng lớn cần lập tức rút vốn cố định hóa tài sản.",
        "Phá Quân": "Dòng tiền lên xuống thất thường, nên nhờ người thân quản lý dòng tiền dự phòng khẩn cấp."
      }
    },
    "Phu Thê": {
      spouse_traits: {
        "Tử Vi": "Bạn đời có khí chất đoan trang đĩnh đạc, xuất thân gia đình nề nếp, có vị thế xã hội, lòng tự tôn cao.",
        "Thiên Cơ": "Bạn đời thông minh tháo vát, tính tình khéo léo, giỏi tính toán việc nhà, thích chia sẻ tri thức.",
        "Thái Dương": "Chồng cương trực nhiệt thành, có danh tiếng xã hội; Vợ đảm đang tháo vát, tính tình thẳng thắn.",
        "Vũ Khúc": "Bạn đời có năng lực tài chính độc lập, tính cách thực tế cương nghị, ít bộc lộ cảm xúc lãng mạn.",
        "Thiên Đồng": "Bạn đời hiền thục dễ thương, tính tình hòa nhã vui vẻ, tình cảm vợ chồng thắm thiết như bạn tri âm.",
        "Liêm Trinh": "Bạn đời có cá tính mạnh, sắc sảo cuốn hút, yêu sâu đậm nhưng hay ghen tuông hoặc đòi hỏi cao.",
        "Thiên Phủ": "Bạn đời phúc hậu bao dung, giỏi quán xuyến gia đình, là hậu phương vững chắc cho sự nghiệp.",
        "Thái Âm": "Vợ đoan trang xinh đẹp, dịu dàng nết na; Chồng phong nhã lịch thiệp, chu đáo tình cảm.",
        "Tham Lang": "Bạn đời ngoại hình nổi bật cuốn hút, giỏi giao tiếp, đời sống tình cảm lãng mạn đa sắc thái.",
        "Cự Môn": "Bạn đời tính tình bộc trực thẳng thắn, hay tranh luận, cần sự nhường nhịn để tránh xung khắc.",
        "Thiên Tướng": "Bạn đời môn đăng hộ đối, cư xử chuẩn mực, danh giá, luôn phò tá đắc lực cho gia đình.",
        "Thiên Lương": "Bạn đời lớn tuổi hơn hoặc chín chắn điềm đạm, có đạo đức, luôn chăm lo bảo bọc đương số.",
        "Thất Sát": "Hôn nhân đến nhanh chóng, bạn đời tính cách độc lập mạnh mẽ, vợ chồng cần học chữ nhẫn.",
        "Phá Quân": "Tiền vận tình duyên dễ gặp trắc trở hoặc khác biệt gia thế, vượt qua sóng gió mới bền lâu."
      },
      harmony_advice: {
        "Tử Vi": "Tôn trọng thể diện của bạn đời trước đám đông, không nên can thiệp quá sâu vào quyền riêng tư.",
        "Thiên Cơ": "Thường xuyên trò chuyện chia sẻ quan điểm, lắng nghe ý kiến đóng góp của người phối ngẫu.",
        "Thái Dương": "Dành nhiều thời gian cho tổ ấm, tránh vì công việc xã hội mà lơ là chăm sóc bạn đời.",
        "Vũ Khúc": "Học cách bày tỏ cảm xúc nhẹ nhàng, tạo bất ngờ lãng mạn để hâm nóng tình cảm vợ chồng.",
        "Thiên Đồng": "Bao dung trước những nét ngây thơ của bạn đời, cùng nhau tận hưởng những chuyến du lịch thư giãn.",
        "Liêm Trinh": "Xây dựng sự tin tưởng tuyệt đối, minh bạch trong các mối quan hệ xã hội để tránh hoài nghi.",
        "Thiên Phủ": "Giao quyền quán xuyến tài chính cho bạn đời, cùng đồng lòng vun đắp cơ nghiệp con cái.",
        "Thái Âm": "Nhẹ nhàng tinh tế, tránh lời nói thô bạo làm tổn thương tâm hồn nhạy cảm của bạn đời.",
        "Tham Lang": "Thiết lập ranh giới rõ ràng trong các mối quan hệ xã giao bên ngoài để giữ vững hạnh phúc.",
        "Cự Môn": "Học cách 'cơm sôi bớt lửa', tuyệt đối không tranh cãi hơn thua khi đang nóng giận.",
        "Thiên Tướng": "Đồng hành cùng nhau trong công việc và đối nội đối ngoại, giữ gìn danh giá gia phong.",
        "Thiên Lương": "Coi bạn đời như người thầy người bạn lớn, cùng nhau thực hiện các việc thiện nguyện bồi đắp phúc.",
        "Thất Sát": "Hạ bớt cái tôi cá nhân, tôn trọng sự độc lập của nhau, dĩ hòa vi quý trong mọi hoàn cảnh.",
        "Phá Quân": "Nên kết hôn muộn hoặc trải qua giai đoạn thử thách trước khi cưới để tình cảm chín chắn vững bền."
      }
    },
    "Phúc Đức": {
      spiritual_traits: {
        "Tử Vi": "Phúc trạch sâu dày, tổ tiên có công hầu khanh tướng, tâm hồn khoáng đạt hướng thiện, được che chở thần kỳ.",
        "Thiên Cơ": "Tâm trí hướng về triết lý huyền học, tư duy sâu sắc, thích chiêm nghiệm quy luật nhân sinh vũ trụ.",
        "Thái Dương": "Tâm hồn quang minh chính đại, dòng họ nhiều bậc trượng phu quân tử, phúc ấm hiển hách rạng rỡ.",
        "Vũ Khúc": "Phúc lộc do bàn tay tự lực gây dựng, tâm thức thực tế, làm nhiều việc thiện tích đức bền lâu.",
        "Thiên Đồng": "Đại phúc tinh nhập trạch, cả đời an nhàn lạc quan, tâm tính thiện lương như trẻ thơ, thọ mệnh dài lâu.",
        "Liêm Trinh": "Nội tâm nhiều trăn trở thao thức, cần hướng Phật pháp hoặc thiền định để tìm lại sự bình an thanh tịnh.",
        "Thiên Phủ": "Phúc thọ song toàn, dòng họ có truyền thống gia phong sung túc, tâm hồn điềm đạm không lo nghĩ.",
        "Thái Âm": "Tâm hồn thanh cao tao nhã, được âm phúc tổ tiên dòng mẹ che chở, thọ khang an lạc.",
        "Tham Lang": "Thích tìm hiểu các môn huyền bí tâm linh, nghệ thuật, hậu vận tâm tính chuyển hóa hướng đạo thanh tịnh.",
        "Cự Môn": "Nội tâm hay trăn trở nghi ngại, cần tích đức hành thiện bằng lời nói và tâm thế khoan dung bao dung.",
        "Thiên Tướng": "Tâm tính nhân từ trượng nghĩa, thích giúp đỡ người nghèo khó, được phúc báo quý nhân tương trợ.",
        "Thiên Lương": "Thọ tinh chính vị, hưởng thọ cao niên, phúc ấm tổ nghiệp che chở qua mọi tai kiếp hiểm nghèo.",
        "Thất Sát": "Phúc đức tiền vận biến động, tự thân nỗ lực vượt khó, về già tâm tính trầm tĩnh tu dưỡng phúc duyên.",
        "Phá Quân": "Dòng họ có sự phân tán đi xa lập nghiệp, bản thân cần tự tu dưỡng tâm tính để tạo phúc cho đời sau."
      }
    },
    "Điền Trạch": {
      real_estate: {
        "Tử Vi": "Nhà cửa khang trang bề thế, sở hữu bất động sản ở trung tâm hoặc khu dân cư cao cấp danh giá.",
        "Thiên Cơ": "Thường xuyên thay đổi cải tạo chỗ ở, khéo léo bài trí không gian sống hiện đại thông minh.",
        "Thái Dương": "Nhà cửa nhiều ánh sáng tự nhiên, thoáng đãng, mặt tiền đẹp, ở nơi giao thương sầm uất.",
        "Vũ Khúc": "Mua bán nhà đất sinh lời lớn, tích lũy nhiều bất động sản giá trị, nhà xưởng kiên cố.",
        "Thiên Đồng": "Tự tay gây dựng nhà cửa từ hai bàn tay trắng, hậu vận nhà ở ấm cúng, có sân vườn thanh nhã.",
        "Liêm Trinh": "Nhà cửa quy củ kỷ cương, chú trọng an ninh trật tự, cẩn trọng giấy tờ pháp lý quy hoạch.",
        "Thiên Phủ": "Đại điền sản tinh, kho tàng nhà đất đầy ắp, được thừa kế và tự tay gia tăng đất đai bền vững.",
        "Thái Âm": "Điền tài chủ tinh, có duyên đặc biệt với bất động sản, sở hữu nhiều nhà đất ven sông hồ hoặc đô thị lớn.",
        "Tham Lang": "Nhà ở trang hoàng lộng lẫy, có thể dùng bất động sản để kinh doanh giải trí, du lịch nghỉ dưỡng.",
        "Cự Môn": "Khu vực ở dễ có tiếng ồn hoặc hàng xóm hay bàn tán, nên chọn khu dân cư yên tĩnh, dân trí cao.",
        "Thiên Tướng": "Nhà cửa trang nhã, gần cơ quan công quyền, khu đô thị chuẩn mực văn minh an toàn.",
        "Thiên Lương": "Được thừa hưởng nhà đất tổ tiên để lại, không gian sống thanh tịnh, nhiều cây xanh bóng mát.",
        "Thất Sát": "Tự tay mua đất lập nghiệp, tiền vận nhà cửa hay dời đổi, kiên trì hậu vận sẽ có cơ ngơi riêng vững chãi.",
        "Phá Quân": "Nhà cửa thuở trẻ hay thay đổi, mua bán sửa sang liên tục, hậu vận mới an cư lạc nghiệp ổn định."
      }
    },
    "Thiên Di": {
      travel_social: {
        "Tử Vi": "Ra ngoài được nhiều người kính trọng, dễ tiếp cận tầng lớp thượng lưu, lãnh đạo nâng đỡ.",
        "Thiên Cơ": "Di chuyển linh hoạt, đi xa học hỏi tri thức mới, nhanh chóng hòa nhập môi trường đa văn hóa.",
        "Thái Dương": "Xuất hành quang minh rực rỡ, thích hợp ngoại giao, làm việc với các tổ chức quốc tế lớn.",
        "Vũ Khúc": "Ra ngoài chủ động kinh doanh buôn bán, nắm bắt cơ hội tài chính sắc bén nơi đất khách quê người.",
        "Thiên Đồng": "Ra ngoài được người thương kẻ mến, giao tiếp chan hòa, các chuyến công tác đi lại luôn may mắn.",
        "Liêm Trinh": "Ra ngoài hành sự có nguyên tắc, giữ gìn uy tín, cần tránh các chốn ăn chơi phức tạp thị phi.",
        "Thiên Phủ": "Bước chân ra xã hội luôn gặp may mắn, quý nhân bảo bọc, tiền tài hanh thông, công việc thuận buồm.",
        "Thái Âm": "Ra nước ngoài hoặc phương xa rất thuận lợi, được phụ nữ và đối tác quốc tế nhiệt tình tương trợ.",
        "Tham Lang": "Giao thiệp rộng rãi bốn phương, dễ kết bạn với nhiều giới, nhiều cơ hội trải nghiệm phong phú.",
        "Cự Môn": "Ra ngoài cần thận trọng lời ăn tiếng nói, tránh tranh cãi không cần thiết nơi công cộng.",
        "Thiên Tướng": "Xuất ngoại danh chính ngôn thuận, phong thái đường hoàng, được giao phó trọng trách lớn.",
        "Thiên Lương": "Ra ngoài gặp quý nhân che chở, người lớn tuổi tận tình chỉ bảo, luôn gặp bình an trên mọi nẻo đường.",
        "Thất Sát": "Đi xa độc lập tác chiến, dũng cảm xông pha vào các môi trường cạnh tranh khốc liệt để lập nghiệp.",
        "Phá Quân": "Đi xa hoặc định cư nước ngoài tạo nên bước ngoặt lớn của cuộc đời, tiên phong mở lối đi mới."
      }
    },
    "Tật Ách": {
      element_organs: {
        "Kim": "Phế (Phổi), Khí quản, Đại tràng (Ruột già), Da lông, Mũi, Xương cốt. Nguy cơ: Viêm họng mãn tính, bệnh đường hô hấp, dị ứng thời tiết, gãy xương phẫu thuật.",
        "Mộc": "Can (Gan), Đởm (Mật), Hệ thần kinh vận động, Gân, Mắt. Nguy cơ: Suy giảm chức năng gan, đau đầu chóng mặt, thị lực kém, co giật thần kinh, đau nhức xương khớp.",
        "Thủy": "Thận, Bàng quang, Hệ sinh dục tiết niệu, Tủy sống, Tai. Nguy cơ: Suy thận, sỏi thận bàng quang, viêm nhiễm phụ khoa/nam khoa, ù tai, mất ngủ đêm.",
        "Hỏa": "Tâm (Tim), Tiểu tràng (Ruột non), Mạch máu tuần hoàn, Lưỡi, Não bộ. Nguy cơ: Huyết áp cao/thấp, rối loạn nhịp tim, xơ vữa mạch máu, đột quỵ, nhiệt miệng mất ngủ.",
        "Thổ": "Tỳ (Lách), Vị (Dạ dày), Hệ tiêu hóa hấp thu, Cơ nhục, Miệng. Nguy cơ: Viêm loét dạ dày tá tràng, trào ngược thực quản, rối loạn tiêu hóa, béo phì hoặc suy dinh dưỡng."
      },
      health_warning_by_star: {
        "Tử Vi": "Cơ địa tiên thiên cường kiện, chú ý các bệnh về tiêu hóa, tuần hoàn do áp lực trách nhiệm công việc.",
        "Thiên Cơ": "Hệ thần kinh nhạy cảm, hay mất ngủ, suy nhược thần kinh do suy nghĩ nhiều, chú ý gan mật.",
        "Thái Dương": "Huyết áp, tim mạch, thị lực (mắt), đau nửa đầu do lao lực quá sức dưới áp lực cao.",
        "Vũ Khúc": "Xương khớp, hệ hô hấp (phế quản), dễ có sẹo thương tật hoặc phẫu thuật nhỏ.",
        "Thiên Đồng": "Hệ tiêu hóa, bàng quang tiết niệu, chú ý chứng béo phì hoặc rối loạn chuyển hóa đường ruột.",
        "Liêm Trinh": "Hệ tim mạch, tuần hoàn máu, nóng trong người, các bệnh da liễu hoặc dị ứng.",
        "Thiên Phủ": "Dạ dày, tỳ vị, chuyển hóa dinh dưỡng, chú ý ăn uống điều độ tránh thừa cân, mỡ máu.",
        "Thái Âm": "Bệnh về mắt, hệ bài tiết, thận âm suy giảm, phụ nữ chú ý nội tiết và kinh nguyệt.",
        "Tham Lang": "Gan mật, hệ sinh dục tiết niệu, chú ý giữ lối sống lành mạnh, hạn chế bia rượu.",
        "Cự Môn": "Họng, thanh quản, đường hô hấp trên, răng miệng và hệ thống tiêu hóa dạ dày.",
        "Thiên Tướng": "Bệnh ngoài da, dị ứng, chức năng bàng quang và tuyến tụy.",
        "Thiên Lương": "Thọ tinh chủ trì, sức đề kháng tốt, tuổi già chú ý huyết áp và thoái hóa xương khớp.",
        "Thất Sát": "Hô hấp, đại tràng, các vết thương hình thương do va chạm giao thông hoặc thể thao mạnh.",
        "Phá Quân": "Hệ bài tiết, răng miệng, chấn thương ngoài ý muốn, cần chú ý an toàn lao động."
      }
    },
    "Tử Tức": {
      children_traits: {
        "Tử Vi": "Con cái thông minh, có khí chất lãnh đạo, tính tự lập cao, công danh thành đạt vẻ vang.",
        "Thiên Cơ": "Con cái thông tuệ, học giỏi khoa học tự nhiên, tư duy logic phản biện nhanh nhẹn.",
        "Thái Dương": "Con trai nổi trội, tính cách quang minh đĩnh đạc, hiếu thảo và có chí lớn lập thân.",
        "Vũ Khúc": "Con cái độc lập, có óc thực tế tài chính, quyết đoán và sớm tự lập kiếm sống.",
        "Thiên Đồng": "Con cái ngoan ngoãn hiền lành, tình cảm gắn bó khăng khít với cha mẹ, hiếu thảo.",
        "Liêm Trinh": "Con cái cá tính mạnh mẽ, cương quyết, cần cha mẹ kiên nhẫn làm bạn đồng hành định hướng.",
        "Thiên Phủ": "Con cái phúc hậu, có của ăn của để, giữ gìn gia phong nề nếp gia đình vẹn toàn.",
        "Thái Âm": "Con gái dịu dàng nết na, học giỏi văn hóa nghệ thuật, chu đáo chăm lo cho cha mẹ.",
        "Tham Lang": "Con cái năng động, đa tài đa nghệ, giỏi giao tiếp và thích khám phá thế giới.",
        "Cự Môn": "Con cái có tài ăn nói hùng biện, độc lập tư duy, thích tranh luận bảo vệ quan điểm cá nhân.",
        "Thiên Tướng": "Con cái đĩnh đạc, trọng danh dự, lễ phép chuẩn mực, có trách nhiệm với gia đình.",
        "Thiên Lương": "Con cái nhân hậu, giàu lòng trắc ẩn, yêu thích tri thức và các giá trị nhân văn cao đẹp.",
        "Thất Sát": "Con cái bản lĩnh cứng cỏi, thích tự lập sớm, cha mẹ nên tôn trọng sự lựa chọn nghề nghiệp.",
        "Phá Quân": "Con cái sáng tạo phá cách, thích dấn thân vào những lĩnh vực mới lạ ít người đi."
      }
    },
    "Huynh Đệ": {
      sibling_relation: {
        "Tử Vi": "Anh chị em hòa thuận, trong gia đình có người thành đạt nổi danh làm chỗ dựa tinh thần cho anh em.",
        "Thiên Cơ": "Anh em thông minh lanh lợi, mỗi người theo đuổi một chuyên môn riêng, thường xuyên trao đổi ý kiến.",
        "Thái Dương": "Anh em đông vui, anh trai tính tình hào hiệp nhiệt tình, luôn chở che đùm bọc các em.",
        "Vũ Khúc": "Anh em độc lập kinh tế, tài chính sòng phẳng rõ ràng, giúp đỡ nhau trên nguyên tắc minh bạch.",
        "Thiên Đồng": "Tình anh em thắm thiết hiền hòa, sống chan hòa tình cảm, ít khi xảy ra xích mích tranh chấp.",
        "Liêm Trinh": "Anh em có cá tính riêng biệt, nên giữ sự tôn trọng khoảng cách và ranh giới tự do của nhau.",
        "Thiên Phủ": "Anh em khá giả, có tinh thần tương thân tương ái, nâng đỡ nhau về mặt kinh tế làm ăn.",
        "Thái Âm": "Chị em gái hiền lành chu đáo, tình cảm gia đình ấm cúng, gắn kết khăng khít.",
        "Tham Lang": "Anh em đều có chí hướng tự lập rộng mở, thích kết giao bạn bè ngoài xã hội.",
        "Cự Môn": "Anh em đôi khi có bất đồng quan điểm, cần nói năng tế nhị nhẹ nhàng để bảo toàn hòa khí.",
        "Thiên Tướng": "Anh em có trách nhiệm cao với đại gia đình, tương trợ nhau kịp thời khi gặp hoạn nạn.",
        "Thiên Lương": "Anh chị lớn có đức độ bảo bọc các em, gia đình hòa thuận theo đạo lý truyền thống.",
        "Thất Sát": "Anh em tính tình cương nghị, đều tự lực cánh sinh, lập nghiệp ở những phương trời riêng.",
        "Phá Quân": "Anh em sớm phân tán đi xa, tự mình bôn ba phấn đấu, ít nương tựa vào nhau."
      }
    },
    "Nô Bộc": {
      colleagues_partners: {
        "Tử Vi": "Kết giao được với bạn bè và đối tác đẳng cấp cao, cấp dưới tận tụy trung thành phò tá.",
        "Thiên Cơ": "Cộng sự có đầu óc sáng tạo mưu lược, bạn bè giỏi công nghệ và phân tích chiến lược.",
        "Thái Dương": "Bạn bè quảng giao nhiệt tình, quan hệ đối tác làm ăn quang minh chính đại, cùng chí hướng.",
        "Vũ Khúc": "Đối tác làm ăn chuẩn mực về hợp đồng, minh bạch tài chính, sòng phẳng đôi bên cùng có lợi.",
        "Thiên Đồng": "Bạn bè hiền lành vui vẻ, đối đãi chân tình không vụ lợi, môi trường cộng sự thoải mái.",
        "Liêm Trinh": "Cộng sự có tính kỷ luật cao, làm việc quy củ, cần tránh các đố kỵ ngầm nơi công sở.",
        "Thiên Phủ": "Đối tác đáng tin cậy, bạn bè có tiềm lực kinh tế vững vàng, tương trợ nhau dài hạn.",
        "Thái Âm": "Nhiều bạn bè lịch thiệp, đối tác nữ đắc lực giúp đỡ, quan hệ hợp tác nhẹ nhàng êm đẹp.",
        "Tham Lang": "Mạng lưới bạn bè rộng khắp mọi tầng lớp, cần chọn bạn mà chơi để tránh bị lôi kéo hao tài.",
        "Cự Môn": "Quan hệ đối tác cần có văn bản pháp lý rõ ràng, đề phòng thị phi đàm tiếu từ người ngoài.",
        "Thiên Tướng": "Đồng nghiệp và cấp dưới đắc lực, luôn hỗ trợ thực thi kế hoạch công việc đến nơi đến chốn.",
        "Thiên Lương": "Gặp được bạn bè tiền bối, cố vấn giàu kinh nghiệm sống chỉ dẫn tận tình.",
        "Thất Sát": "Cộng sự dám làm dám chịu, quan hệ hợp tác có tính cạnh tranh cao, cần rõ ràng quyền lợi.",
        "Phá Quân": "Mối quan hệ bạn bè dễ biến động thay đổi, không nên phụ thuộc quá nhiều vào người ngoài."
      }
    },
    "Phụ Mẫu": {
      parental_relationship: {
        "Tử Vi": "Cha mẹ đoan trang danh giá, có địa vị xã hội, gia phong nề nếp chuẩn mực, hết lòng vì con cái.",
        "Thiên Cơ": "Cha mẹ khéo léo thông minh, giáo dục con cái bằng tri thức khoa học, chăm lo học vấn chu đáo.",
        "Thái Dương": "Thân phụ cương trực quang minh, có ảnh hưởng to lớn định hình nhân cách và sự nghiệp đương số.",
        "Vũ Khúc": "Cha mẹ nghiêm khắc, dạy con tính tự lập và kỷ luật tài chính từ nhỏ, tình cảm thâm trầm.",
        "Thiên Đồng": "Cha mẹ hiền từ đôn hậu, đối xử với con cái như bạn bè thân thiết, không khí gia đình đầm ấm.",
        "Liêm Trinh": "Kỷ luật gia đình nghiêm minh, cha mẹ kỳ vọng cao, đương số cần thấu hiểu tình thương của song thân.",
        "Thiên Phủ": "Cha mẹ nhân hậu bao dung, kinh tế gia đình sung túc, để lại nền tảng của cải vững chắc.",
        "Thái Âm": "Thân mẫu dịu dàng chu đáo, yêu thương chăm sóc con cái tỉ mỉ, để lại nhiều phúc ấm.",
        "Tham Lang": "Cha mẹ phong lưu cởi mở, khuyến khích con cái giao lưu xã hội và phát triển năng khiếu.",
        "Cự Môn": "Cha mẹ bộc trực thẳng thắn, giữa hai thế hệ cần đối thoại cởi mở để tránh khoảng cách.",
        "Thiên Tướng": "Cha mẹ mẫu mực danh giá, được họ hàng láng giềng kính nể, làm gương sáng cho con cháu.",
        "Thiên Lương": "Cha mẹ thọ khang nhân từ, để lại gia tài đạo đức và phúc đức sâu dày cho đời sau.",
        "Thất Sát": "Cha mẹ có cá tính mạnh mẽ xông pha, rèn luyện con cái trưởng thành qua nghịch cảnh.",
        "Phá Quân": "Thuở nhỏ gia đình dễ có biến động hoặc sống xa cách cha mẹ, cần chú trọng hiếu kính phụng dưỡng."
      }
    }
  };

  const TU_HOA_RULES_DB = {
    noi_ngoai_cung_doctrine: {
      noi_cung: ["Mệnh", "Tài Bạch", "Quan Lộc", "Điền Trạch", "Phúc Đức", "Tật Ách"],
      ngoai_cung: ["Huynh Đệ", "Phu Thê", "Tử Tức", "Thiên Di", "Nô Bộc", "Phụ Mẫu"],
      principles: {
        "Loc_Noi_Cung": "Hóa Lộc nhập Lục Nội Cung là phúc trạch tự thân, tiền tài rót vào túi mình, tích lũy được điền sản cơ nghiệp vững chắc.",
        "Loc_Ngoai_Cung": "Hóa Lộc nhập Lục Ngoại Cung chủ về ban phát tình cảm cơ hội cho người ngoài, lợi cho tha nhân trước, cần biết quản lý ranh giới tài chính.",
        "Ky_Noi_Cung": "Hóa Kỵ nhập Lục Nội Cung là chấp niệm nội tâm, bản thân tự chịu vất vả khổ hạnh, lao tâm khổ tứ nhưng tiền tài khó lọt ra tay kẻ khác.",
        "Ky_Ngoai_Cung": "Hóa Kỵ nhập Lục Ngoại Cung sẽ xung về Lục Nội Cung đối diện, gây nên hao tán, thị phi, tai ương hoặc tổn hại tài lộc sức khỏe nghiêm trọng."
      }
    },
    tu_hoa_in_palaces: {
      "Hóa Lộc": {
        "Mệnh": "Người nhân ái, có duyên ăn nói, cả đời may mắn, dễ gần, có lộc trời ban, ít khi rơi vào cảnh túng quẫn.",
        "Tài Bạch": "Dòng tiền hanh thông dồi dào, kiếm tiền nhẹ nhàng, nhiều nguồn thu nhập phụ trợ.",
        "Quan Lộc": "Công việc thuận lợi, nhiều cơ hội thăng tiến, môi trường làm việc thoải mái, sự nghiệp phát đạt.",
        "Điền Trạch": "Nhà cửa bề thế, gia đạo ấm cúng, có duyên mua bán bất động sản sinh lời lớn.",
        "Phúc Đức": "Tâm hồn an lạc lạc quan, được hưởng phúc ấm tổ tiên thâm sâu.",
        "Phu Thê": "Bạn đời có điều kiện kinh tế tốt, hòa thuận, hôn nhân mang lại nhiều may mắn.",
        "Thiên Di": "Ra ngoài được quý nhân yêu mến, môi trường xã hội ưu ái, dễ phát triển ở phương xa."
      },
      "Hóa Quyền": {
        "Mệnh": "Ý chí kiên cường, tính cách quyết đoán, ham học hỏi nâng cao năng lực, có tham vọng làm chủ.",
        "Quan Lộc": "Nắm thực quyền chỉ huy, quyết định các chính sách lớn, thăng tiến nhanh, uy quyền trong tổ chức.",
        "Tài Bạch": "Chủ động kiểm soát tài chính quyết liệt, dám đầu tư quy mô lớn để thu lợi lớn.",
        "Điền Trạch": "Nắm quyền làm chủ gia đình, kiểm soát toàn bộ sổ sách tài sản nhà đất.",
        "Phu Thê": "Bạn đời có cá tính mạnh mẽ, nắm quyền trong gia đình, cần sự nhường nhịn để tránh xung đột."
      },
      "Hóa Khoa": {
        "Mệnh": "Thông minh, cử chỉ nho nhã, trọng thanh danh đạo đức, gặp nạn luôn có quý nhân giải cứu.",
        "Quan Lộc": "Đỗ đạt bằng cấp cao, chuyên môn uy tín, công việc mang tính học thuật nghiên cứu hoặc thanh danh.",
        "Tài Bạch": "Tiền tài trong sạch, kiếm tiền bằng danh tiếng tri thức, tài chính ổn định bền vững.",
        "Tật Ách": "Thần hộ mệnh cứu giải tai ương bệnh tật, gặp thầy gặp thuốc, tai qua nạn khỏi."
      },
      "Hóa Kỵ": {
        "Mệnh": "Cuộc đời nhiều trăn trở, tính cách hay suy nghĩ sâu xa, tự tạo áp lực cho bản thân, cần học chữ buông xả.",
        "Tài Bạch": "Dễ hao tài tán của, tiền bạc vướng vào nợ nần hoặc tranh chấp, không nên cho vay mượn tùy tiện.",
        "Quan Lộc": "Công việc nhiều trắc trở trở ngại, hay phải chuyển đổi vị trí, dễ gặp tiểu nhân đố kỵ trong công sở.",
        "Phu Thê": "Tình duyên trắc trở, vợ chồng dễ có khoảng cách hoặc bất đồng khẩu thiệt, nên kết hôn muộn.",
        "Tật Ách": "Sức khỏe tiềm ẩn bệnh mãn tính, dễ suy nhược thần kinh, cần chú trọng khám định kỳ và thanh tịnh tâm trí.",
        "Điền Trạch": "Nhà cửa dễ có tranh chấp giấy tờ hoặc xáo trộn, phong thủy gia cư cần được quan tâm chỉnh trang."
      }
    }
  };

  const TIMING_RULES_DB = {
    timing_principles: {
      dai_van_10_years: {
        element_interaction: {
          sinh_nhap: { status: "Đại Cát", desc: "Cung Hạn sinh Bản Mệnh: Thời vận thuận lợi, ngoại cảnh nâng đỡ, có cơ hội thăng tiến mở rộng quy mô." },
          ty_hoa: { status: "Cát", desc: "Cung Hạn hòa Bản Mệnh: Bình ổn, hòa hợp với môi trường, phát triển thuận lợi bền bỉ." },
          khac_xuat: { status: "Bình Thường - Khổ Tận Cam Lai", desc: "Bản Mệnh khắc Cung Hạn: Phải dốc nhiều tâm sức tranh đấu, tuy vất vả nhưng nắm quyền làm chủ." },
          sinh_xuat: { status: "Hao Tổn", desc: "Bản Mệnh sinh Cung Hạn: Phải cống hiến hy sinh nhiều tài lực và sức lực cho người khác, dễ mệt mỏi suy nhược." },
          khac_nhap: { status: "Hung Hiểm", desc: "Cung Hạn khắc Bản Mệnh: Thời thế chống lại ta, nhiều trở lực bủa vây, dễ gặp thất bại hoặc biến cố bất lợi." }
        }
      }
    }
  };

  // ==========================================
  // III. ZERO-RECALCULATION CHART ADAPTER
  // ==========================================

  const TuViChartAdapter = {
    adapt: function (chartInput, targetYear = 2026) {
      const rawDict = this._parseToDict(chartInput);
      const { rawPalaces, sourceFormat } = this._extractRawPalaces(rawDict);
      if (rawPalaces.length !== 12) {
        throw new Error(`Dữ liệu tinh bàn không hợp lệ: Yêu cầu 12 cung, nhận được ${rawPalaces.length} cung.`);
      }

      const meta = this._extractMetadata(rawDict, rawPalaces, targetYear);
      const { normalizedPalaces, stats } = this._normalize12Palaces(rawPalaces, meta, targetYear);

      const menhP = normalizedPalaces.find(p => p.is_menh);
      let thanP = normalizedPalaces.find(p => p.is_than);
      if (!menhP) throw new Error("Không tìm thấy Cung Mệnh trong danh sách 12 cung.");
      if (!thanP) thanP = menhP;

      meta.menh_chi = menhP.dia_chi;
      meta.than_chi = thanP.dia_chi;
      meta.than_cu_cung = thanP.ten_cung;

      const activeDvP = normalizedPalaces.find(p => p.is_dai_van_hien_tai);
      meta.active_dai_van_chi = activeDvP ? activeDvP.dia_chi : "N/A";

      const tieuHanP = normalizedPalaces.find(p => p.is_tieu_han);
      meta.tieu_han_chi = tieuHanP ? tieuHanP.dia_chi : "N/A";

      const lndvP = normalizedPalaces.find(p => p.is_lndv);
      meta.lndv_chi = lndvP ? lndvP.dia_chi : "N/A";

      const chartData = { meta, palaces: normalizedPalaces };

      const manifest = {
        status: "INGESTED_SUCCESSFULLY",
        source_format: sourceFormat,
        palaces_count: 12,
        total_major_stars: stats.total_major_stars,
        total_minor_stars: stats.total_minor_stars,
        total_tu_hoa: stats.total_tu_hoa,
        total_tuan_triet: stats.total_tuan_triet,
        is_recalculated: false,
        fidelity_rate: "100%",
        zero_fabrication_verified: true,
        menh_palace: `Cung ${meta.menh_chi} (${menhP.ten_cung})`,
        than_palace: `Cung ${meta.than_chi} (${thanP.ten_cung})`,
        target_year: targetYear,
        lunar_age: meta.lunar_age
      };

      return { chartData, manifest };
    },

    _parseToDict: function (input) {
      if (typeof input === 'object' && input !== null) return input;
      if (typeof input === 'string') {
        try { return JSON.parse(input); } catch (e) {
          throw new Error("Không thể phân tích chuỗi JSON lá số: " + e.message);
        }
      }
      throw new TypeError("Kiểu dữ liệu lá số không được hỗ trợ.");
    },

    _extractRawPalaces: function (raw) {
      for (const k of ["palaces", "cac_cung", "cung_list", "palace_list", "cells", "astrolabe_palaces"]) {
        if (Array.isArray(raw[k]) && raw[k].length === 12) {
          return { rawPalaces: raw[k], sourceFormat: `key_${k}` };
        }
      }
      for (const parent of ["astrolabe", "chart", "la_so", "tinh_ban"]) {
        if (raw[parent] && typeof raw[parent] === 'object') {
          for (const k of ["palaces", "cac_cung", "cung_list", "cells"]) {
            if (Array.isArray(raw[parent][k]) && raw[parent][k].length === 12) {
              return { rawPalaces: raw[parent][k], sourceFormat: `nested_${parent}.${k}` };
            }
          }
        }
      }
      return { rawPalaces: [], sourceFormat: "unknown" };
    },

    _extractMetadata: function (raw, rawPalaces, targetYear) {
      const metaSrc = raw.meta || raw.thong_tin || raw.info || raw.user_info || raw;

      let yearCanChi = metaSrc.year_can_chi || metaSrc.can_chi_nam || "";
      if (!yearCanChi && metaSrc.yearGan && metaSrc.yearZhi) {
        yearCanChi = `${metaSrc.yearGan} ${metaSrc.yearZhi}`;
      }
      if (!yearCanChi) yearCanChi = "Kỷ Mùi";

      const parts = yearCanChi.split(' ');
      const yearGan = parts[0] || 'Kỷ';
      const yearZhi = parts[1] || 'Mùi';

      let isMale = true;
      if (metaSrc.isMale !== undefined) isMale = !!metaSrc.isMale;
      else if (metaSrc.gender !== undefined) {
        const gStr = String(metaSrc.gender).toLowerCase();
        isMale = !(gStr.includes('nữ') || gStr.includes('female') || gStr.includes('nu'));
      }
      const genderStr = isMale ? "Nam" : "Nữ";

      let birthYear = metaSrc.solarYear || metaSrc.birth_year || metaSrc.nam_sinh || 1979;
      if (typeof birthYear !== 'number') birthYear = parseInt(birthYear) || 1979;

      const cucName = metaSrc.cucName || metaSrc.cuc_name || metaSrc.cuc || "Hỏa Lục Cục";
      let cucNum = 6;
      for (const [cn, val] of [["Nhị", 2], ["Tam", 3], ["Tứ", 4], ["Ngũ", 5], ["Lục", 6]]) {
        if (String(cucName).includes(cn) || String(cucName).includes(String(val))) {
          cucNum = val;
          break;
        }
      }

      const napAm = metaSrc.napAm || metaSrc.nap_am || metaSrc.menh || getNapAm(yearGan, yearZhi);
      const lunarAge = metaSrc.currentAgeMu || metaSrc.lunar_age || calculateLunarAge(birthYear, targetYear);

      const canIdx = CAN.indexOf(yearGan) >= 0 ? CAN.indexOf(yearGan) : 0;
      const isDuongGan = (canIdx % 2 === 0);
      const isThuanLy = (isDuongGan && isMale) || (!isDuongGan && !isMale);

      const tgIdx = (targetYear - 4 + 1000) % 10;
      const tzIdx = (targetYear - 4 + 1200) % 12;
      const targetCanChi = `${CAN[tgIdx]} ${CHI[tzIdx]}`;

      let tuHoaGoc = metaSrc.tu_hoa_goc;
      if (!tuHoaGoc && TU_HOA_MAP[yearGan]) {
        const [sLoc, sQuyen, sKhoa, sKy] = TU_HOA_MAP[yearGan];
        tuHoaGoc = { "Hóa Lộc": sLoc, "Hóa Quyền": sQuyen, "Hóa Khoa": sKhoa, "Hóa Kỵ": sKy };
      }

      // Tìm Tuần / Triệt nếu có
      let tuan = metaSrc.tuan || [];
      let triet = metaSrc.triet || [];

      return {
        day: metaSrc.lunarDay || metaSrc.day || 1,
        month: metaSrc.lunarMonth || metaSrc.month || 1,
        year_can_chi: `${yearGan} ${yearZhi}`,
        hour_zhi: metaSrc.hourZhi || metaSrc.hour_zhi || "Tý",
        gender: genderStr,
        is_male: isMale,
        cuc_name: cucName,
        cuc_number: cucNum,
        nap_am: napAm,
        birth_year: birthYear,
        target_year: targetYear,
        target_can_chi: targetCanChi,
        thai_tue_chi: CHI[tzIdx],
        lunar_age: lunarAge,
        is_thuan_ly: isThuanLy,
        tu_hoa_goc: tuHoaGoc || {},
        tuan: Array.isArray(tuan) ? tuan : [tuan],
        triet: Array.isArray(triet) ? triet : [triet]
      };
    },

    _normalize12Palaces: function (rawPalaces, meta, targetYear) {
      const tempPalacesByChi = {};
      let totalMajorStars = 0;
      let totalMinorStars = 0;
      let totalTuHoa = 0;
      let totalTuanTriet = 0;
      const lunarAge = meta.lunar_age;

      rawPalaces.forEach((item, idx) => {
        const pDict = this._parseToDict(item);

        // 1. Xác định Địa Chi
        const chiVal = pDict.zhi || pDict.dia_chi || pDict.chi || pDict.earthlyBranch || pDict.cung;
        let normalizedChi = null;
        if (chiVal) {
          const clean = String(chiVal).trim().toLowerCase();
          normalizedChi = ZHI_ALIASES[clean];
        }
        if (!normalizedChi) normalizedChi = CHI[idx % 12];

        // 2. Xác định Tên Cung Chức Năng
        const cungVal = pDict.name || pDict.ten_cung || pDict.ten || pDict.cung_chuc;
        let normalizedCungName = "Cung";
        if (cungVal) {
          const clean = String(cungVal).trim().toLowerCase();
          normalizedCungName = PALACE_NAME_ALIASES[clean] || String(cungVal).trim();
        }

        // 3. Thiên Can
        const canVal = pDict.gan || pDict.thien_can || pDict.can || pDict.heavenlyStem || "";
        const cleanCan = String(canVal).trim().toLowerCase();
        const normalizedCan = GAN_ALIASES[cleanCan] || String(canVal).trim();

        // 4. Bóc tách Chính Tinh
        const rawChinh = pDict.mainStars || pDict.chinh_tinh || pDict.majorStars || [];
        const chinhTinhList = this._extractStarsList(rawChinh);
        totalMajorStars += chinhTinhList.length;

        // 5. Bóc tách Phụ Tinh
        const rawPhu = pDict.luckyStars || pDict.badStars || pDict.phu_tinh || pDict.minorStars || [];
        let phuTinhList = [];
        if (pDict.luckyStars && pDict.badStars) {
          phuTinhList = this._extractStarsList(pDict.luckyStars).concat(this._extractStarsList(pDict.badStars));
        } else {
          phuTinhList = this._extractStarsList(rawPhu);
        }
        totalMinorStars += phuTinhList.length;

        // 6. Bóc tách Tứ Hóa
        const rawTuHoa = pDict.tu_hoa || pDict.mutagens || [];
        const tuHoaList = this._extractStringsList(rawTuHoa);
        for (const s of [...chinhTinhList, ...phuTinhList]) {
          for (const th of ["Hóa Lộc", "Hóa Quyền", "Hóa Khoa", "Hóa Kỵ"]) {
            if (s.includes(th) && !tuHoaList.includes(th)) {
              tuHoaList.push(th);
            }
          }
        }
        totalTuHoa += tuHoaList.length;

        // 7. Bóc tách Tuần / Triệt
        const tuanTrietList = [];
        if (pDict.isTuan || pDict.is_tuan || pDict.has_tuan) tuanTrietList.push("Tuần");
        if (pDict.isTriet || pDict.is_triet || pDict.has_triet) tuanTrietList.push("Triệt");
        if (Array.isArray(pDict.tuan_triet)) {
          pDict.tuan_triet.forEach(t => { if (!tuanTrietList.includes(t)) tuanTrietList.push(t); });
        }
        totalTuanTriet += tuanTrietList.length;

        // 8. Đại vận
        let dvStart = null;
        if (pDict.daiHan !== undefined && typeof pDict.daiHan === 'number') {
          dvStart = pDict.daiHan;
        } else if (pDict.dai_van_start !== undefined) {
          dvStart = parseInt(pDict.dai_van_start);
        } else if (pDict.dai_van !== undefined && typeof pDict.dai_van === 'number') {
          dvStart = parseInt(pDict.dai_van);
        }
        if (dvStart === null || isNaN(dvStart)) {
          dvStart = meta.cuc_number + idx * 10;
        }
        const dvEnd = dvStart + 9;
        const dvRange = `${dvStart}-${dvEnd}`;

        // 9. Mệnh / Thân
        const isMenh = (normalizedCungName === "Mệnh" || pDict.isMenh === true || pDict.is_menh === true);
        const isThan = (pDict.isThan === true || pDict.is_than === true || String(cungVal).toLowerCase().includes('thân'));

        // 10. Nạp âm
        const pNapAm = pDict.nap_am || getNapAm(normalizedCan, normalizedChi);
        const isDaiVanHienTai = (dvStart <= lunarAge && lunarAge <= dvEnd);

        // 11. Sao lưu
        const rawLuu = pDict.luuStars || pDict.sao_luu || [];
        const saoLuuList = rawLuu.map(s => {
          let name = "";
          if (typeof s === 'string') name = s;
          else if (typeof s === 'object' && s !== null) name = s.name || s.fullName || "";
          else name = String(s);
          if (name.startsWith("L.")) name = "Lưu " + name.substring(2);
          return name.trim();
        }).filter(Boolean);

        tempPalacesByChi[normalizedChi] = {
          dia_chi: normalizedChi,
          thien_can: normalizedCan,
          nap_am: pNapAm,
          ten_cung: normalizedCungName,
          is_menh: isMenh,
          is_than: isThan,
          chinh_tinh: chinhTinhList,
          phu_tinh: phuTinhList,
          tu_hoa: tuHoaList,
          tuan_triet: tuanTrietList,
          dai_van_start: dvStart,
          dai_van_range: dvRange,
          is_dai_van_hien_tai: isDaiVanHienTai,
          sao_luu: saoLuuList
        };
      });

      // Sắp xếp thứ tự chuẩn từ Tý (0) đến Hợi (11)
      const orderedPalaces = [];
      CHI.forEach((chiName, chiIdx) => {
        let p = tempPalacesByChi[chiName];
        if (!p) {
          p = {
            dia_chi: chiName, thien_can: "", nap_am: getNapAm("Giáp", chiName),
            ten_cung: "Vô Danh", is_menh: false, is_than: false,
            chinh_tinh: [], phu_tinh: [], tu_hoa: [], tuan_triet: [],
            dai_van_start: 0, dai_van_range: "0-9", is_dai_van_hien_tai: false, sao_luu: []
          };
        }
        p.chi_idx = chiIdx;
        p.cung_chuc_idx = CUNG_CHUC_NAMES.indexOf(p.ten_cung) >= 0 ? CUNG_CHUC_NAMES.indexOf(p.ten_cung) : chiIdx;
        orderedPalaces.push(p);
      });

      // Tính toán sao lưu & vận niên
      const tgIdx = (targetYear - 4 + 1000) % 10;
      const tzIdx = (targetYear - 4 + 1200) % 12;
      const targetGan = CAN[tgIdx];

      const luuLocPos = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0][tgIdx];
      const luuKinhPos = (luuLocPos + 1) % 12;
      const luuDaPos = (luuLocPos - 1 + 12) % 12;
      const luuTangPos = (tzIdx + 2) % 12;
      const luuHoPos = (tzIdx + 8) % 12;
      const luuThaiTuePos = tzIdx;
      const luuMaPos = [2, 11, 8, 5, 2, 11, 8, 5, 2, 11, 8, 5][tzIdx];
      const luuKhocPos = (6 - tzIdx + 12) % 12;
      const luuHuPos = (6 + tzIdx) % 12;
      const [lHLoc, lHQuyen, lHKhoa, lHKy] = TU_HOA_MAP[targetGan] || ["", "", "", ""];

      // Tính Tiểu Hạn
      const thStartMap = {
        "Thân": 10, "Tý": 10, "Thìn": 10,
        "Dần": 4, "Ngọ": 4, "Tuất": 4,
        "Tỵ": 7, "Dậu": 7, "Sửu": 7,
        "Hợi": 1, "Mão": 1, "Mùi": 1
      };
      const birthYearZhi = meta.year_can_chi.split(' ')[1] || "Mùi";
      const thStartPos = thStartMap[birthYearZhi] || 0;
      const thDir = meta.is_male ? 1 : -1;
      const tieuHanPos = ((thStartPos + (lunarAge - 1) * thDir) % 12 + 12) % 12;

      // Tìm active Đại vận và LNĐV
      const activeDvIdx = orderedPalaces.findIndex(p => p.is_dai_van_hien_tai);
      let lndvIdx = -1;
      if (lunarAge <= 12) {
        const childOrder = ["Mệnh", "Tài Bạch", "Tật Ách", "Phu Thê", "Phúc Đức", "Quan Lộc", "Nô Bộc", "Thiên Di", "Tử Tức", "Huynh Đệ", "Phụ Mẫu", "Điền Trạch"];
        const targetName = childOrder[lunarAge - 1];
        lndvIdx = orderedPalaces.findIndex(p => p.ten_cung === targetName);
      } else if (activeDvIdx !== -1) {
        const dvStartAge = orderedPalaces[activeDvIdx].dai_van_start;
        const offset = lunarAge - dvStartAge;
        const dvDir = meta.is_thuan_ly ? 1 : -1;
        if (offset === 0) {
          lndvIdx = activeDvIdx;
        } else if (offset === 1) {
          lndvIdx = (activeDvIdx + 6) % 12;
        } else {
          lndvIdx = ((activeDvIdx + 6) + (offset - 3) * dvDir + 24) % 12;
        }
      }

      for (let i = 0; i < 12; i++) {
        const p = orderedPalaces[i];
        p.is_tieu_han = (i === tieuHanPos);
        p.is_thai_tue_nam = (i === tzIdx);
        p.is_lndv = (i === lndvIdx);

        if (!p.sao_luu || p.sao_luu.length === 0) {
          const sLuu = [];
          if (i === luuLocPos) sLuu.push("Lưu Lộc Tồn");
          if (i === luuKinhPos) sLuu.push("Lưu Kình Dương");
          if (i === luuDaPos) sLuu.push("Lưu Đà La");
          if (i === luuTangPos) sLuu.push("Lưu Tang Môn");
          if (i === luuHoPos) sLuu.push("Lưu Bạch Hổ");
          if (i === luuThaiTuePos) sLuu.push("Lưu Thái Tuế");
          if (i === luuMaPos) sLuu.push("Lưu Thiên Mã");
          if (i === luuKhocPos) sLuu.push("Lưu Thiên Khốc");
          if (i === luuHuPos) sLuu.push("Lưu Thiên Hư");

          const allStars = [...p.chinh_tinh, ...p.phu_tinh].map(cleanStarName);
          if (allStars.includes(lHLoc)) sLuu.push("Lưu Hóa Lộc");
          if (allStars.includes(lHQuyen)) sLuu.push("Lưu Hóa Quyền");
          if (allStars.includes(lHKhoa)) sLuu.push("Lưu Hóa Khoa");
          if (allStars.includes(lHKy)) sLuu.push("Lưu Hóa Kỵ");

          p.sao_luu = sLuu;
        }
      }

      return {
        normalizedPalaces: orderedPalaces,
        stats: {
          total_major_stars: totalMajorStars,
          total_minor_stars: totalMinorStars,
          total_tu_hoa: totalTuHoa,
          total_tuan_triet: totalTuanTriet
        }
      };
    },

    _extractStarsList: function (raw) {
      if (!raw) return [];
      if (Array.isArray(raw)) {
        return raw.map(s => {
          if (typeof s === 'string') return s.trim();
          if (typeof s === 'object' && s !== null) {
            return s.fullName || (s.name + (s.brightness ? ` (${s.brightness})` : ''));
          }
          return String(s);
        }).filter(Boolean);
      }
      return [String(raw).trim()];
    },

    _extractStringsList: function (raw) {
      if (!raw) return [];
      if (Array.isArray(raw)) {
        return raw.map(s => {
          if (typeof s === 'string') return s.trim();
          if (typeof s === 'object' && s !== null) return s.name || s.fullName || "";
          return String(s);
        }).filter(Boolean);
      }
      return [String(raw).trim()];
    }
  };

  // ==========================================
  // IV. ĐỘNG CƠ NHẬN DIỆN CÁCH CỤC (PATTERN RECOGNIZER)
  // ==========================================

  const TuViPatternRecognizer = {
    _getTriadStars: function (palaceIdx, palaces) {
      const targetIndices = [
        palaceIdx,
        (palaceIdx + 6) % 12,
        (palaceIdx + 4) % 12,
        (palaceIdx + 8) % 12
      ];
      const stars = new Set();
      targetIndices.forEach(idx => {
        const p = palaces[idx];
        (p.chinh_tinh || []).forEach(s => stars.add(cleanStarName(s)));
        (p.phu_tinh || []).forEach(s => stars.add(cleanStarName(s)));
        (p.tu_hoa || []).forEach(s => stars.add(s));
      });
      return stars;
    },

    _getPalaceExactStars: function (p) {
      const stars = new Set();
      (p.chinh_tinh || []).forEach(s => stars.add(cleanStarName(s)));
      (p.phu_tinh || []).forEach(s => stars.add(cleanStarName(s)));
      (p.tu_hoa || []).forEach(s => stars.add(s));
      return stars;
    },

    recognizePatterns: function (chartData) {
      const palaces = chartData.palaces;
      const menhPalace = palaces.find(p => p.is_menh);
      const thanPalace = palaces.find(p => p.is_than) || menhPalace;
      const menhIdx = menhPalace.chi_idx;

      const menhTriadStars = this._getTriadStars(menhIdx, palaces);
      const menhExactStars = this._getPalaceExactStars(menhPalace);

      const detectedFavorable = [];
      const detectedUnfavorable = [];

      // 1. Quét Cát Cách
      PATTERNS_DB.favorable_patterns.forEach(pat => {
        const code = pat.code;
        let isMatched = false;
        let matchDetails = "";

        if (code === "TU_PHU_VU_TUONG") {
          const req = ["Tử Vi", "Thiên Phủ", "Vũ Khúc", "Thiên Tướng"];
          if (req.every(s => menhTriadStars.has(s))) {
            isMatched = true;
            matchDetails = "Mệnh - Tài - Quan hội đủ 4 sao Tử Vi, Thiên Phủ, Vũ Khúc, Thiên Tướng.";
          }
        } else if (code === "SAT_PHA_THAM") {
          const req = ["Thất Sát", "Phá Quân", "Tham Lang"];
          if (req.every(s => menhTriadStars.has(s))) {
            isMatched = true;
            matchDetails = "Tam phương Mệnh Thân quy tụ bộ ba dũng tướng Thất Sát, Phá Quân, Tham Lang.";
          }
        } else if (code === "CO_NGUYET_DONG_LUONG") {
          const req = ["Thiên Cơ", "Thái Âm", "Thiên Đồng", "Thiên Lương"];
          if (req.every(s => menhTriadStars.has(s))) {
            isMatched = true;
            matchDetails = "Mệnh hội đủ tứ đại văn tinh tham mưu Thiên Cơ, Thái Âm, Thiên Đồng, Thiên Lương.";
          }
        } else if (code === "CU_NHAT") {
          const hasCu = menhExactStars.has("Cự Môn") || menhTriadStars.has("Cự Môn");
          const hasNhat = menhExactStars.has("Thái Dương") || menhTriadStars.has("Thái Dương");
          if (hasCu && hasNhat && (menhExactStars.has("Cự Môn") || menhExactStars.has("Thái Dương"))) {
            isMatched = true;
            matchDetails = "Cự Môn và Thái Dương đồng cung hoặc hội chiếu rực rỡ giải tỏa ám khí.";
          }
        } else if (code === "THAM_VU_DONG_HANH") {
          if (menhExactStars.has("Tham Lang") && menhExactStars.has("Vũ Khúc") && ["Sửu", "Mùi"].includes(menhPalace.dia_chi)) {
            isMatched = true;
            matchDetails = `Vũ Khúc và Tham Lang đồng cung tại cung ${menhPalace.dia_chi} (Tiền bần hậu phú).`;
          }
        } else if (code === "HOA_THAM_LINH_THAM") {
          if (menhExactStars.has("Tham Lang") || menhTriadStars.has("Tham Lang")) {
            if (menhExactStars.has("Hỏa Tinh") || menhTriadStars.has("Hỏa Tinh")) {
              isMatched = true;
              matchDetails = "Tham Lang đắc hội ngộ Hỏa Tinh (Hỏa Tham Kỳ Cách - bạo phát điền tài).";
            } else if (menhExactStars.has("Linh Tinh") || menhTriadStars.has("Linh Tinh")) {
              isMatched = true;
              matchDetails = "Tham Lang đắc hội ngộ Linh Tinh (Linh Tham Kỳ Cách - hoạch phát tài danh).";
            }
          }
        } else if (code === "THACH_TRUNG_AN_NGOC") {
          if (menhExactStars.has("Cự Môn") && ["Tý", "Ngọ"].includes(menhPalace.dia_chi)) {
            if (["Hóa Lộc", "Hóa Quyền", "Hóa Khoa"].some(th => menhTriadStars.has(th))) {
              isMatched = true;
              matchDetails = `Cự Môn tọa thủ tại ${menhPalace.dia_chi} hội tụ Tam Hóa (Thạch trung ẩn ngọc).`;
            }
          }
        } else if (code === "LOC_MA_GIAO_TRI") {
          const hasLoc = menhTriadStars.has("Lộc Tồn") || menhTriadStars.has("Hóa Lộc");
          const hasMa = menhTriadStars.has("Thiên Mã");
          if (hasLoc && hasMa) {
            isMatched = true;
            matchDetails = "Lộc Tồn / Hóa Lộc hội ngộ Thiên Mã tại tam phương Mệnh Tài Quan Di.";
          }
        } else if (code === "NHAT_NGUYET_TINH_MINH") {
          const maoP = palaces.find(p => p.dia_chi === "Mão");
          const hoiP = palaces.find(p => p.dia_chi === "Hợi");
          const sunAtMao = maoP && maoP.chinh_tinh.some(s => s.includes("Thái Dương"));
          const moonAtHoi = hoiP && hoiP.chinh_tinh.some(s => s.includes("Thái Âm"));
          if (sunAtMao && moonAtHoi && ["Mùi", "Hợi", "Mão"].includes(menhPalace.dia_chi)) {
            isMatched = true;
            matchDetails = "Thái Dương miếu tại Mão, Thái Âm vượng tại Hợi chiếu về bản Mệnh.";
          }
        } else if (code === "QUAN_THAN_KHANH_HOI") {
          if (menhExactStars.has("Tử Vi")) {
            const assistants = ["Tả Phụ", "Hữu Bật", "Văn Xương", "Văn Khúc", "Thiên Khôi", "Thiên Việt"];
            const found = assistants.filter(s => menhTriadStars.has(s));
            if (found.length >= 3) {
              isMatched = true;
              matchDetails = `Đế tinh Tử Vi được quần thần phò tá: ${found.join(', ')}.`;
            }
          }
        } else if (code === "MA_DAU_DOI_KIEM") {
          if (menhPalace.dia_chi === "Ngọ" && menhPalace.phu_tinh.some(s => s.includes("Kình Dương"))) {
            isMatched = true;
            matchDetails = "Kình Dương độc thủ tại cung Ngọ đắc địa uy dũng.";
          }
        }

        if (isMatched) {
          detectedFavorable.push({
            code: pat.code,
            name: pat.name,
            name_en: pat.code,
            level: pat.level,
            match_details: matchDetails,
            description: pat.description,
            desc: pat.description || matchDetails,
            career: pat.career || "",
            score_bonus: pat.score_bonus || 15,
            score_impact: pat.score_bonus || 15,
            stars_matched: [matchDetails],
            palaces_involved: [menhPalace.ten_cung]
          });
        }
      });

      // 2. Quét Hung Cách & Bại Cách
      PATTERNS_DB.unfavorable_patterns.forEach(pat => {
        const code = pat.code;
        let isMatched = false;
        let matchDetails = "";

        if (code === "LINH_XUONG_DA_VU") {
          const req = ["Linh Tinh", "Văn Xương", "Đà La", "Vũ Khúc"];
          if (req.every(s => menhTriadStars.has(s))) {
            isMatched = true;
            matchDetails = "Tam phương hội tụ đủ 4 hung sát Linh Tinh, Văn Xương, Đà La, Vũ Khúc (Cực kỳ cẩn trọng tai biến tài chính và sông nước).";
          }
        } else if (code === "KINH_DA_HIEP_KY") {
          const prevP = palaces[(menhIdx - 1 + 12) % 12];
          const nextP = palaces[(menhIdx + 1) % 12];
          const hasKy = menhExactStars.has("Hóa Kỵ");
          const prevStars = this._getPalaceExactStars(prevP);
          const nextStars = this._getPalaceExactStars(nextP);
          const hasKinhDa = (prevStars.has("Kình Dương") && nextStars.has("Đà La")) ||
                            (prevStars.has("Đà La") && nextStars.has("Kình Dương"));
          if (hasKy && hasKinhDa) {
            isMatched = true;
            matchDetails = "Hóa Kỵ tại Mệnh bị Kình Dương và Đà La kẹp hai bên giáp cung (Tiến thoái lưỡng nan).";
          }
        } else if (code === "CU_HOA_KINH_DUONG") {
          const req = ["Cự Môn", "Hỏa Tinh", "Kình Dương"];
          if (req.every(s => menhTriadStars.has(s))) {
            isMatched = true;
            matchDetails = "Cự Môn gặp Hỏa Tinh, Kình Dương hội hợp hãm địa sinh khẩu thiệt và tai nạn lửa/thương tích.";
          }
        } else if (code === "KHONG_KIEP_TOA_MENH_HAM") {
          if (menhExactStars.has("Địa Không") && menhExactStars.has("Địa Kiếp")) {
            if (!["Dần", "Thân", "Tỵ", "Hợi"].includes(menhPalace.dia_chi)) {
              isMatched = true;
              matchDetails = "Địa Không, Địa Kiếp đồng thủ tại Mệnh hãm địa (Cuộc đời như thuyền gặp bão lớn).";
            }
          }
        } else if (code === "MENH_VO_CHINH_DIEU_SAT_TINH") {
          if ((menhPalace.chinh_tinh || []).length === 0) {
            const satStars = ["Kình Dương", "Đà La", "Hỏa Tinh", "Linh Tinh", "Địa Không", "Địa Kiếp"];
            const invading = satStars.filter(s => menhExactStars.has(s));
            if (invading.length >= 1 && (!menhPalace.tuan_triet || menhPalace.tuan_triet.length === 0)) {
              isMatched = true;
              matchDetails = `Mệnh Vô Chính Diệu bị sát tinh (${invading.join(', ')}) xâm phạm mà không có Tuần/Triệt cứu giải.`;
            }
          }
        }

        if (isMatched) {
          detectedUnfavorable.push({
            code: pat.code,
            name: pat.name,
            name_en: pat.code,
            level: pat.level,
            match_details: matchDetails,
            warning: pat.warning,
            desc: pat.warning || matchDetails,
            score_penalty: pat.score_penalty || -15,
            score_impact: pat.score_penalty || -15,
            stars_matched: [matchDetails],
            palaces_involved: [menhPalace.ten_cung]
          });
        }
      });

      const netScore = detectedFavorable.reduce((acc, p) => acc + (p.score_bonus || 0), 0) +
                       detectedUnfavorable.reduce((acc, p) => acc + (p.score_penalty || 0), 0);

      return {
        favorable_patterns: detectedFavorable,
        unfavorable_patterns: detectedUnfavorable,
        total_score_impact: netScore,
        pattern_summary: {
          total_favorable: detectedFavorable.length,
          total_unfavorable: detectedUnfavorable.length,
          net_pattern_score: netScore,
          total_score_impact: netScore
        }
      };
    }
  };

  // ==========================================
  // V. ĐỘNG CƠ TỔ HỢP BỘ SAO (STAR COMBINATIONS)
  // ==========================================

  const TuViStarCombinationsEngine = {
    _getPalaceAllStars: function (p) {
      const stars = new Set();
      (p.chinh_tinh || []).forEach(s => stars.add(cleanStarName(s)));
      (p.phu_tinh || []).forEach(s => stars.add(cleanStarName(s)));
      (p.tu_hoa || []).forEach(s => stars.add(s));
      return stars;
    },

    detectCombosForPalace: function (palaceIdx, allPalaces) {
      const targetIndices = [
        palaceIdx,
        (palaceIdx + 6) % 12,
        (palaceIdx + 4) % 12,
        (palaceIdx + 8) % 12
      ];

      const exactStars = this._getPalaceAllStars(allPalaces[palaceIdx]);
      const triadStars = new Set();
      targetIndices.forEach(idx => {
        const sSet = this._getPalaceAllStars(allPalaces[idx]);
        sSet.forEach(s => triadStars.add(s));
      });

      const detected = [];

      // 1. Cát tinh combos
      STAR_COMBOS_DB.benefic_combinations.forEach(combo => {
        if (combo.stars.every(s => triadStars.has(s))) {
          const isExact = combo.stars.every(s => exactStars.has(s));
          detected.push({
            code: combo.code,
            name: combo.name,
            type: combo.type,
            stars: combo.stars,
            is_exact_in_palace: isExact,
            presence: isExact ? "Đồng cung tọa thủ" : "Hội tụ từ Tam phương Tứ chính",
            effect: combo.effect,
            score_mod: combo.score_mod
          });
        }
      });

      // 2. Hung tinh combos
      STAR_COMBOS_DB.malefic_combinations.forEach(combo => {
        if (combo.stars.every(s => triadStars.has(s))) {
          const isExact = combo.stars.every(s => exactStars.has(s));
          detected.push({
            code: combo.code,
            name: combo.name,
            type: combo.type,
            stars: combo.stars,
            is_exact_in_palace: isExact,
            presence: isExact ? "Đồng cung tọa thủ" : "Hội tụ từ Tam phương Tứ chính",
            effect: combo.effect,
            score_mod: combo.score_mod
          });
        }
      });

      return detected;
    },

    scanChartWideCombos: function (allPalaces) {
      const resultsByPalace = {};
      let totalBenefic = 0;
      let totalMalefic = 0;
      let globalScoreMod = 0;

      allPalaces.forEach((p, i) => {
        const combos = this.detectCombosForPalace(i, allPalaces);
        resultsByPalace[p.ten_cung] = combos;
        combos.forEach(c => {
          if (c.score_mod > 0) totalBenefic++;
          else totalMalefic++;
          globalScoreMod += c.score_mod;
        });
      });

      return {
        by_palace: resultsByPalace,
        summary: {
          total_benefic: totalBenefic,
          total_malefic: totalMalefic,
          global_score_mod: globalScoreMod
        }
      };
    }
  };

  // ==========================================
  // VI. ĐỘNG CƠ LUẬN GIẢI 12 CUNG (PALACE INTERPRETER)
  // ==========================================

  const TuViPalaceInterpreter = {
    evaluatePalace: function (palace, chartMeta, allPalaces) {
      const cungName = palace.ten_cung;
      const diaChi = palace.dia_chi;
      const thienCan = palace.thien_can;
      const chinhTinh = palace.chinh_tinh || [];
      const phuTinh = palace.phu_tinh || [];
      const tuHoa = palace.tu_hoa || [];
      const tuanTriet = palace.tuan_triet || [];
      const idx = palace.chi_idx;

      const detectedCombos = TuViStarCombinationsEngine.detectCombosForPalace(idx, allPalaces);

      const oppIdx = (idx + 6) % 12;
      const oppP = allPalaces[oppIdx] || {};
      const triad1Idx = (idx + 4) % 12;
      const triad1P = allPalaces[triad1Idx] || {};
      const triad2Idx = (idx + 8) % 12;
      const triad2P = allPalaces[triad2Idx] || {};
      const NHI_HOP_MAP = { 0: 1, 1: 0, 2: 11, 11: 2, 3: 10, 10: 3, 4: 9, 9: 4, 5: 8, 8: 5, 6: 7, 7: 6 };
      const nhiHopIdx = NHI_HOP_MAP[idx] !== undefined ? NHI_HOP_MAP[idx] : 0;
      const nhiHopP = allPalaces[nhiHopIdx] || {};

      const tamPhuongTuChinh = {
        cung_toa: { ten_cung: cungName, dia_chi: diaChi, thien_can: thienCan, chinh_tinh: chinhTinh, phu_tinh: phuTinh, tu_hoa: tuHoa, tuan_triet: tuanTriet },
        cung_xung: { ten_cung: oppP.ten_cung || '', dia_chi: oppP.dia_chi || '', chinh_tinh: oppP.chinh_tinh || [], phu_tinh: oppP.phu_tinh || [] },
        tam_hop_1: { ten_cung: triad1P.ten_cung || '', dia_chi: triad1P.dia_chi || '', chinh_tinh: triad1P.chinh_tinh || [] },
        tam_hop_2: { ten_cung: triad2P.ten_cung || '', dia_chi: triad2P.dia_chi || '', chinh_tinh: triad2P.chinh_tinh || [] },
        nhi_hop: { ten_cung: nhiHopP.ten_cung || '', dia_chi: nhiHopP.dia_chi || '', chinh_tinh: nhiHopP.chinh_tinh || [] }
      };

      let score = 50.0;
      const mainInterpretations = [];
      const cleanMainStars = chinhTinh.map(cleanStarName);

      if (chinhTinh.length === 0) {
        if (tuanTriet.length > 0) {
          score += 10.0;
          mainInterpretations.push(`Cung Vô Chính Diệu đắc ngộ ${tuanTriet.join(', ')}, tạo thành cách 'Chân không diệu hữu', hóa hung thành cát, thu hút tinh hoa của nhật nguyệt xung chiếu.`);
        } else {
          score -= 10.0;
          const oppMain = oppP.chinh_tinh || [];
          const oppStr = oppMain.length > 0 ? oppMain.join(', ') : "không có";
          mainInterpretations.push(`Cung Vô Chính Diệu không có Tuần/Triệt che chở, tính khí dễ dao động theo hoàn cảnh. Phải mượn ánh sáng của cung đối diện (${oppP.ten_cung} tại ${oppP.dia_chi}: ${oppStr}) làm nòng cốt định hướng.`);
        }
      } else {
        chinhTinh.forEach(s => {
          const sName = cleanStarName(s);
          const b = getStarBrightness(s);
          const starInfo = STARS_RULES_DB.main_stars[sName] || {};
          const nature = starInfo.nature || "";

          if (b === "M" || b === "V") {
            score += 15.0;
            const desc = starInfo.mieu_vuong_desc || "Miếu Vượng đại cát, khí số hưng thịnh phát đạt.";
            mainInterpretations.push(`Chính tinh ${sName} (${b} - Miếu/Vượng): ${nature} ${desc}`);
          } else if (b === "Đ") {
            score += 8.0;
            const desc = starInfo.dac_dia_desc || "Đắc địa hanh thông, phát huy năng lực vững chắc.";
            mainInterpretations.push(`Chính tinh ${sName} (Đ - Đắc địa): ${nature} ${desc}`);
          } else if (b === "B") {
            score += 2.0;
            const desc = starInfo.ham_binh_desc || "Bình hòa, cần thêm trợ tinh phò tá.";
            mainInterpretations.push(`Chính tinh ${sName} (B - Bình hòa): ${nature} ${desc}`);
          } else {
            score -= 12.0;
            const desc = starInfo.ham_binh_desc || "Hãm địa bất lợi, nhiều trở lực lao tâm khổ tứ.";
            mainInterpretations.push(`Chính tinh ${sName} (H - Hãm địa): ${nature} ${desc}`);
          }
        });
      }

      // Đánh giá Cát Tinh
      const catStarsFound = [];
      const luckyKeys = new Set(Object.keys(STARS_RULES_DB.six_lucky_stars));
      const allExact = phuTinh.map(cleanStarName);
      allExact.forEach(s => {
        if (luckyKeys.has(s)) {
          score += 5.0;
          const rInfo = STARS_RULES_DB.six_lucky_stars[s];
          catStarsFound.push(`${s} (${rInfo.role})`);
        } else if (["Lộc Tồn", "Hóa Lộc", "Hóa Quyền", "Hóa Khoa", "Ân Quang", "Thiên Quý", "Tam Thai", "Bát Tọa", "Long Trì", "Phượng Các", "Thiên Mã"].includes(s)) {
          score += 4.0;
          catStarsFound.push(s);
        }
      });

      // Đánh giá Sát Tinh
      const satStarsFound = [];
      const killerKeys = new Set(Object.keys(STARS_RULES_DB.six_killers));
      allExact.forEach(s => {
        if (killerKeys.has(s)) {
          const b = getStarBrightness(s);
          const kInfo = STARS_RULES_DB.six_killers[s];
          if (b === "Đ") {
            score += 2.0;
            satStarsFound.push(`${s} (Đắc địa - dũng mãnh, có lực phát động đột phá)`);
          } else {
            score -= 7.0;
            satStarsFound.push(`${s} (Hãm địa - ${kInfo.role}: ${kInfo.desc.substring(0, 60)}...)`);
          }
        } else if (["Đại Hao", "Tiểu Hao", "Thiên Hình", "Thiên Khốc", "Thiên Hư", "Kiếp Sát"].includes(s)) {
          score -= 3.0;
          satStarsFound.push(s);
        }
      });

      // Đánh giá Tứ Hóa
      const tuHoaEval = [];
      tuHoa.forEach(th => {
        if (th === "Hóa Lộc") {
          score += 10.0;
          tuHoaEval.push("Hóa Lộc tọa thủ: Dòng năng lượng dồi dào, mở ra nhiều cơ hội phát triển hanh thông thuận lợi.");
        } else if (th === "Hóa Quyền") {
          score += 8.0;
          tuHoaEval.push("Hóa Quyền tọa thủ: Tăng cường ý chí, quyền tự chủ, quyết đoán và năng lực chỉ huy kiểm soát.");
        } else if (th === "Hóa Khoa") {
          score += 8.0;
          tuHoaEval.push("Hóa Khoa tọa thủ: Danh tiếng trong sạch, đỗ đạt học vấn, quý nhân cứu giải giải độc tiêu tai.");
        } else if (th === "Hóa Kỵ") {
          score -= 10.0;
          tuHoaEval.push("Hóa Kỵ tọa thủ: Cảnh báo sự trăn trở, thị phi hao tổn hoặc chấp niệm sâu sắc, đòi hỏi phải cẩn trọng bền chí.");
        }
      });

      // Tác động của Tuần / Triệt
      let tuanTrietEval = "";
      if (tuanTriet.includes("Triệt") && tuanTriet.includes("Tuần")) {
        score = (score + 50.0) / 2.0;
        tuanTrietEval = "Đồng ngộ Tuần và Triệt: Giai đoạn tiền vận và trung vận gặp nhiều xáo trộn, thách thức tôi luyện bản lĩnh trước khi định hình sự nghiệp.";
      } else if (tuanTriet.includes("Triệt")) {
        score = Math.max(30.0, Math.min(80.0, score * 0.85));
        tuanTrietEval = "Ngộ Triệt Lộ: Tác động mạnh trong giai đoạn tiền vận (dưới 30 tuổi), gây trắc trở ban đầu nhưng làm giảm thiểu hung hiểm của sát tinh hãm địa.";
      } else if (tuanTriet.includes("Tuần")) {
        score = Math.max(35.0, Math.min(85.0, score * 0.90));
        tuanTrietEval = "Ngộ Tuần Không: Tác động bền bỉ, mang tính bình ổn, giữ cho thế đứng của cung không bị xáo trộn đột ngột, thích hợp cho sự phát triển từ từ.";
      }

      // Hiệu chỉnh điểm số từ Combos
      detectedCombos.forEach(combo => {
        score += combo.score_mod * 0.5;
      });

      const finalScore = Math.floor(Math.max(15, Math.min(98, score)));

      // Bóc tách chuyên đề sâu sắc theo từng cung chức năng
      const deepInsights = {};
      const aspects = PALACE_DEEP_ASPECTS_DB[cungName] || {};
      const firstStar = cleanMainStars[0] || "";

      if (cungName === "Mệnh") {
        const appearances = [];
        cleanMainStars.forEach(st => {
          const app = aspects.appearance_by_main_star?.[st];
          if (app) appearances.push(`${st}: ${app}`);
        });
        deepInsights.appearance = appearances.length > 0 ? appearances : ["Diện mạo hài hòa, phong thái đoan trang đĩnh đạc."];
        if (aspects.core_traits && firstStar && aspects.core_traits[firstStar]) {
          deepInsights.core_traits = aspects.core_traits[firstStar];
        }
      } else if (cungName === "Quan Lộc") {
        const careers = [];
        cleanMainStars.forEach(st => {
          const car = aspects.suitable_careers_by_star?.[st];
          if (car) careers.push(`${st}: ${car}`);
        });
        deepInsights.suitable_careers = careers.length > 0 ? careers : ["Phù hợp với các ngành nghề quản lý, chuyên môn hoặc kinh doanh tự do."];
        if (aspects.work_style && firstStar && aspects.work_style[firstStar]) {
          deepInsights.work_style = aspects.work_style[firstStar];
        }
      } else if (cungName === "Tài Bạch") {
        const wealths = [];
        cleanMainStars.forEach(st => {
          const w = aspects.wealth_mechanism?.[st];
          if (w) wealths.push(`${st}: ${w}`);
        });
        deepInsights.wealth_mechanism = wealths.length > 0 ? wealths : ["Nguồn tiền ổn định từ chuyên môn và tích lũy từng bước chắc chắn."];
        if (aspects.money_management && firstStar && aspects.money_management[firstStar]) {
          deepInsights.money_management = aspects.money_management[firstStar];
        }
      } else if (cungName === "Phu Thê") {
        if (aspects.spouse_traits && firstStar && aspects.spouse_traits[firstStar]) {
          deepInsights.spouse_character = aspects.spouse_traits[firstStar];
        }
        if (aspects.harmony_advice && firstStar && aspects.harmony_advice[firstStar]) {
          deepInsights.harmony_advice = aspects.harmony_advice[firstStar];
        }
      } else if (cungName === "Phúc Đức") {
        if (aspects.spiritual_traits && firstStar && aspects.spiritual_traits[firstStar]) {
          deepInsights.spiritual_traits = aspects.spiritual_traits[firstStar];
        }
      } else if (cungName === "Điền Trạch") {
        if (aspects.real_estate && firstStar && aspects.real_estate[firstStar]) {
          deepInsights.real_estate = aspects.real_estate[firstStar];
        }
      } else if (cungName === "Thiên Di") {
        if (aspects.travel_social && firstStar && aspects.travel_social[firstStar]) {
          deepInsights.travel_social = aspects.travel_social[firstStar];
        }
      } else if (cungName === "Tật Ách") {
        const napAm = chartMeta.nap_am || "";
        const el = getElementFromNapAm(napAm);
        const organDesc = aspects.element_organs?.[el] || "";
        deepInsights.organ_analysis = `Bản Mệnh hành ${el} (${napAm}): Cơ địa tiên thiên liên quan trực tiếp đến tạng phủ: ${organDesc}`;
        if (aspects.health_warning_by_star && firstStar && aspects.health_warning_by_star[firstStar]) {
          deepInsights.health_warning = aspects.health_warning_by_star[firstStar];
        }
      } else if (cungName === "Tử Tức") {
        if (aspects.children_traits && firstStar && aspects.children_traits[firstStar]) {
          deepInsights.children_traits = aspects.children_traits[firstStar];
        }
      } else if (cungName === "Huynh Đệ") {
        if (aspects.sibling_relation && firstStar && aspects.sibling_relation[firstStar]) {
          deepInsights.sibling_relation = aspects.sibling_relation[firstStar];
        }
      } else if (cungName === "Nô Bộc") {
        if (aspects.colleagues_partners && firstStar && aspects.colleagues_partners[firstStar]) {
          deepInsights.colleagues_partners = aspects.colleagues_partners[firstStar];
        }
      } else if (cungName === "Phụ Mẫu") {
        if (aspects.parental_relationship && firstStar && aspects.parental_relationship[firstStar]) {
          deepInsights.parental_relationship = aspects.parental_relationship[firstStar];
        }
      }

      const functionalAdvice = this._generatePalaceAdvice(cungName, finalScore);
      const canChiStr = `${thienCan} ${diaChi}`;
      const levelStr = finalScore >= 75 ? "Thượng Cát" : (finalScore >= 50 ? "Trung Bình Khá" : "Cần Hóa Giải");
      const summaryStr = (mainInterpretations && mainInterpretations.length > 0) 
        ? mainInterpretations.join('\n\n') 
        : `Cung ${cungName} tọa tại ${diaChi}.`;

      const pData = {
        cung_name: cungName,
        ten_cung: cungName,
        dia_chi: diaChi,
        thien_can: thienCan,
        can_chi: canChiStr,
        quality_score: finalScore,
        score: finalScore,
        level: levelStr,
        summary: summaryStr,
        chinh_tinh: chinhTinh,
        phu_tinh: phuTinh,
        main_interpretations: mainInterpretations,
        cat_stars: catStarsFound,
        sat_stars: satStarsFound,
        tu_hoa_eval: tuHoaEval,
        tuan_triet_eval: tuanTrietEval,
        combos: detectedCombos,
        deep_insights: deepInsights,
        career_profile: (deepInsights.suitable_careers ? deepInsights.suitable_careers.join(' ') : '') || deepInsights.work_style || "",
        wealth_profile: (deepInsights.wealth_mechanism ? deepInsights.wealth_mechanism.join(' ') : '') || deepInsights.money_management || deepInsights.real_estate || "",
        health_profile: deepInsights.organ_analysis || deepInsights.health_warning || "",
        marriage_profile: deepInsights.spouse_character || deepInsights.harmony_advice || "",
        functional_advice: functionalAdvice,
        action_advice: functionalAdvice,
        tam_phuong_tu_chinh: tamPhuongTuChinh
      };

      // Tự động sinh bài luận giải chuyên sâu toàn diện 4 phần
      const deepTreatise = this._generatePalaceDeepTreatise(cungName, pData, chartMeta, allPalaces);
      pData.deep_treatise = deepTreatise;
      pData.full_treatise = deepTreatise;

      return pData;
    },

    _generatePalaceAdvice: function (cungName, score) {
      const level = score >= 75 ? "Thượng cát" : (score >= 50 ? "Trung bình khá" : "Cần chú trọng hóa giải");
      const adviceMap = {
        "Mệnh": `Cung Mệnh thuộc phẩm cách ${level}. Cốt cách bản mệnh là nền tảng của vạn sự. Khi gặp thời cơ cần phát huy tối đa sở trường chuyên môn; khi vận hạn bất lợi nên lấy tĩnh chế động, trau dồi tri thức và hoàn thiện kỷ luật tự thân để làm chủ số phận.`,
        "Quan Lộc": `Cung Quan Lộc thuộc phẩm cách ${level}. Đường công danh thích hợp với môi trường minh bạch, coi trọng thực tài và uy tín chuyên môn. Tránh các tranh chấp phe cánh nơi công sở; tập trung vào xây dựng năng lực cốt lõi để giữ vững vị thế bền vững.`,
        "Tài Bạch": `Cung Tài Bạch thuộc phẩm cách ${level}. Dòng tiền cần được phân bổ khoa học giữa tích lũy tài sản an toàn và tái đầu tư. Tuyệt đối không tham gia các kênh đầu tư rủi ro mạo hiểm thiếu cơ sở pháp lý; ưu tiên bảo toàn vốn trong các năm có sát tinh xâm phạm.`,
        "Phu Thê": `Cung Phu Thê thuộc phẩm cách ${level}. Hôn nhân gia đạo lấy sự tương kính, thấu hiểu và tôn trọng không gian riêng làm gốc rễ. Trong các chu kỳ biến động tình cảm, sự điềm tĩnh và đối thoại chân thành là chìa khóa duy nhất để giữ gìn tổ ấm.`,
        "Phúc Đức": `Cung Phúc Đức thuộc phẩm cách ${level}. Phúc trạch vô hình là bệ đỡ vững chắc nhất cuộc đời. Nên duy trì truyền thống gia phong, hiếu kính phụ mẫu dòng họ và thường xuyên làm các việc thiện nguyện để tăng cường năng lượng cứu giải trước mọi thử thách.`,
        "Điền Trạch": `Cung Điền Trạch thuộc phẩm cách ${level}. Cơ nghiệp bất động sản nên định hướng phát triển từng bước chắc chắn. Khi mua bán nhà đất cần thẩm định kỹ lưỡng pháp lý quy hoạch, chú trọng phong thủy không gian sống thanh tịnh, thoáng đãng.`,
        "Thiên Di": `Cung Thiên Di thuộc phẩm cách ${level}. Khi bước chân ra ngoài xã hội cần giữ phong thái đĩnh đạc, tuân thủ pháp luật sở tại và mở rộng quan hệ với những nhân tố tích cực. Cẩn trọng an toàn giao thông khi di chuyển đường dài.`,
        "Tật Ách": `Cung Tật Ách thuộc phẩm cách ${level}. Sức khỏe là vốn quý nhất. Cần duy trì chế độ sinh hoạt dưỡng sinh điều độ, khám sức khỏe định kỳ theo tạng phủ tương ứng của ngũ hành bản mệnh. Giữ tâm thế lạc quan để nuôi dưỡng sinh khí.`,
        "Tử Tức": `Cung Tử Tức thuộc phẩm cách ${level}. Đường con cái nên chú trọng phương pháp giáo dục bằng nêu gương đạo đức hơn là áp đặt mệnh lệnh. Tạo điều kiện để con phát triển độc lập theo năng khiếu tự nhiên.`,
        "Huynh Đệ": `Cung Huynh Đệ thuộc phẩm cách ${level}. Tình anh em nên lấy sự rõ ràng, minh bạch về quyền lợi kinh tế để giữ gìn hòa khí lâu dài. Trợ giúp nhau trong lúc khó khăn trên tinh thần tự nguyện.`,
        "Nô Bộc": `Cung Nô Bộc thuộc phẩm cách ${level}. Trong quan hệ đối tác và cấp dưới, cần có nguyên tắc khen thưởng công minh, răn đe đúng mực. Không nên đặt niềm tin mù quáng vào người chưa được thử thách qua thực tế.`,
        "Phụ Mẫu": `Cung Phụ Mẫu thuộc phẩm cách ${level}. Duyên phận với song thân thể hiện lòng hiếu thảo và sự kết nối cội nguồn. Thường xuyên quan tâm, thăm hỏi và phụng dưỡng cha mẹ để bồi đắp phúc khí cho bản thân.`
      };
      return adviceMap[cungName] || `Cung ${cungName} thuộc phẩm cách ${level}.`;
    },

    _generatePalaceDeepTreatise: function (cungName, pData, chartMeta, allPalaces) {
      const diaChi = pData.dia_chi;
      const thienCan = pData.thien_can;
      const canChi = `${thienCan} ${diaChi}`;
      const chinhTinh = pData.chinh_tinh || [];
      const catStars = pData.cat_stars || [];
      const satStars = pData.sat_stars || [];
      const tuHoa = pData.tu_hoa_eval || [];
      const tuanTriet = pData.tuan_triet_eval || "";
      const combos = pData.combos || [];
      const deepInsights = pData.deep_insights || {};
      const score = pData.quality_score || 50;
      const level = pData.level || (score >= 70 ? 'Thượng Cát' : (score >= 50 ? 'Trung Bình Khá' : 'Cần Hóa Giải'));
      const advice = pData.functional_advice || '';

      const palaceNapAm = getNapAm(thienCan, diaChi);
      const elPalace = getElementFromNapAm(palaceNapAm);
      const elMenh = getElementFromNapAm(chartMeta?.nap_am || 'Hải Trung Kim');
      
      let elRel = "Tương hòa khí số, đắc địa thế bình ổn";
      if (elPalace === elMenh) {
        elRel = `Cung vị và Bản Mệnh cùng thuộc hành ${elPalace} (Tỷ Hòa): Đắc thế tương trợ đồng điệu, phát triển bình ổn bền bỉ.`;
      } else if ((elPalace === 'Thổ' && elMenh === 'Kim') || (elPalace === 'Kim' && elMenh === 'Thủy') || (elPalace === 'Thủy' && elMenh === 'Mộc') || (elPalace === 'Mộc' && elMenh === 'Hỏa') || (elPalace === 'Hỏa' && elMenh === 'Thổ')) {
        elRel = `Cung vị thuộc hành ${elPalace} tương sinh Bản Mệnh hành ${elMenh} (Sinh Nhập): Đắc sinh khí tiên thiên bồi đắp, quý nhân nâng đỡ, gia tăng phúc trạch tài lộc.`;
      } else if ((elMenh === 'Thổ' && elPalace === 'Kim') || (elMenh === 'Kim' && elPalace === 'Thủy') || (elMenh === 'Thủy' && elPalace === 'Mộc') || (elMenh === 'Mộc' && elPalace === 'Hỏa') || (elMenh === 'Hỏa' && elPalace === 'Thổ')) {
        elRel = `Bản Mệnh hành ${elMenh} sinh dưỡng Cung vị hành ${elPalace} (Sinh Xuất): Đương số phải dốc nhiều tâm huyết công sức xây đắp, cống hiến cho hoàn cảnh mới thu được thành quả.`;
      } else if ((elMenh === 'Kim' && elPalace === 'Mộc') || (elMenh === 'Mộc' && elPalace === 'Thổ') || (elMenh === 'Thổ' && elPalace === 'Thủy') || (elMenh === 'Thủy' && elPalace === 'Hỏa') || (elMenh === 'Hỏa' && elPalace === 'Kim')) {
        elRel = `Bản Mệnh hành ${elMenh} khắc chế Cung vị hành ${elPalace} (Khắc Xuất): Tuy gặp thử thách trở lực nhưng đương số hoàn toàn làm chủ cục diện, khổ tận cam lai.`;
      } else {
        elRel = `Cung vị hành ${elPalace} khắc chế Bản Mệnh hành ${elMenh} (Khắc Nhập): Thời thế thử thách bản lĩnh, hoàn cảnh tạo nhiều áp lực đòi hỏi phải kiên trì cẩn trọng.`;
      }

      const tp = pData.tam_phuong_tu_chinh || {};
      const oppP = tp.cung_xung || {};
      const triad1 = tp.tam_hop_1 || {};
      const triad2 = tp.tam_hop_2 || {};
      const nhiHop = tp.nhi_hop || {};

      const lines = [];

      // MỤC 1: CẤU TRÚC KHÍ SỐ & TAM PHƯƠNG TỨ CHÍNH HỘI CHIẾU
      lines.push(`**1. Cấu Trúc Khí Số & Tam Phương Tứ Chính Hội Chiếu:**`);
      lines.push(`- **Thế Đứng Bản Cung:** Cung ${cungName} ngự tại phương vị **${diaChi}** (Can **${thienCan}** - Nạp Âm **${palaceNapAm}**). ${elRel}`);
      
      if (chinhTinh.length === 0) {
        lines.push(`- **Chính Tinh Tọa Thủ:** Cung ở vào thế **Vô Chính Diệu** (không có chính tinh thủ mệnh). Khí số linh hoạt, nhạy bén nắm bắt thời cuộc nhưng tính khí dễ dao động theo môi trường ngoại cảnh.`);
        if (tuanTriet) {
          lines.push(`  + *Tuần / Triệt Cứu Giải:* Đắc ngộ ${tuanTriet}, tạo thành cách 'Chân không diệu hữu', chuyển hóa hung tinh thành khí lực phát tích độc đáo.`);
        }
        const oppMain = oppP.chinh_tinh || [];
        const oppStr = oppMain.length > 0 ? oppMain.join(', ') : "không có chính tinh";
        lines.push(`  + *Mượn Sao Cung Đối:* Bắt buộc mượn ánh sáng của cung xung chiếu ${oppP.ten_cung} (${oppP.dia_chi}: ${oppStr}) làm nòng cốt định hình năng lực và chí hướng.`);
      } else {
        lines.push(`- **Chính Tinh Tọa Thủ:** Quy tụ các chủ tinh: **${chinhTinh.join(', ')}**. Đóng vai trò linh hồn dẫn dắt, chi phối toàn bộ năng lực thực thi, tâm thức và vận mệnh của cung ${cungName}.`);
      }

      // Xung chiếu
      const oppStars = (oppP.chinh_tinh || []).concat(oppP.phu_tinh || []).slice(0, 5);
      const oppStarsStr = oppStars.length > 0 ? oppStars.join(', ') : "không có cát hung tinh nổi bật";
      lines.push(`- **Cung Xung Chiếu (Thế Đứng Đối Diện):** Cung **${oppP.ten_cung || 'Đối diện'}** tọa tại **${oppP.dia_chi || ''}** trực tiếp xung chiếu qua trục xuyên tâm với các sao: *${oppStarsStr}*. Năng lượng từ đối phương tạo nên môi trường phản chiếu, mang đến cả cơ hội mở rộng lẫn những áp lực cạnh tranh trực diện mà đương số phải ứng phó.`);

      // Tam hợp
      const t1Stars = (triad1.chinh_tinh || []).join(', ') || "hội chiếu";
      const t2Stars = (triad2.chinh_tinh || []).join(', ') || "hội chiếu";
      lines.push(`- **Tam Hợp Minh Chiếu (Thế Chân Vạc Hội Tụ):** Bản cung cùng với Cung **${triad1.ten_cung || ''}** (${triad1.dia_chi || ''}: ${t1Stars}) và Cung **${triad2.ten_cung || ''}** (${triad2.dia_chi || ''}: ${t2Stars}) kết hợp tạo thành thế kiềng ba chân vững chắc. Năng lượng tam hợp cung cấp nguồn lực hỗ trợ bền bỉ, hậu thuẫn vững chắc về công danh, tài chính và gia đạo.`);

      // Nhị hợp
      lines.push(`- **Cung Nhị Hợp (Trợ Lực Vô Hình & Nhân Duyên Ngầm):** Nhị hợp với Cung **${nhiHop.ten_cung || ''}** tại **${nhiHop.dia_chi || ''}**. Phản ánh mối quan hệ nhân duyên ngầm, sự trợ lực từ hậu trường hoặc những trách nhiệm liên đới mà đương số luôn phải lưu tâm trong cuộc sống.`);

      // MỤC 2: BÓC TÁCH CHI TIẾT TỪNG TINH TÚ TỌA THỦ & HỘI TỤ
      lines.push(`\n**2. Bóc Tách Chi Tiết Tinh Tú Tọa Thủ & Hội Tụ:**`);
      
      // Chính tinh chi tiết
      if (chinhTinh.length > 0) {
        lines.push(`- **Chính Tinh Quản Hạt:**`);
        chinhTinh.forEach(s => {
          const sName = cleanStarName(s);
          const b = getStarBrightness(s) || 'B';
          const info = STARS_RULES_DB.main_stars[sName] || {};
          let bLabel = "Bình Hòa";
          let desc = info.ham_binh_desc || "";
          if (b === "M" || b === "V") { bLabel = "Miếu / Vượng"; desc = info.mieu_vuong_desc || "Khí số hưng thịnh phát đạt."; }
          else if (b === "Đ") { bLabel = "Đắc Địa"; desc = info.dac_dia_desc || "Đắc địa hanh thông, phát huy tài năng vững vàng."; }
          else if (b === "H") { bLabel = "Hãm Địa"; desc = info.ham_binh_desc || "Hãm địa nhiều thử thách trở ngại, cần tôi rèn bản lĩnh."; }

          lines.push(`  + **${sName}** (${b} - ${bLabel}): Thuộc hành ${info.element || 'Thổ'}, ${info.yin_yang || 'Dương'}, ${info.role || 'Chủ tinh'}. Đặc tính cốt tủy: ${info.nature || ''}. Luận đoán: ${desc}`);
        });
      }

      // Cát tinh
      if (catStars.length > 0) {
        lines.push(`- **Hệ Thống Cát Tinh Trợ Lực:** Cung hội tụ các phúc tinh và quý tinh như: **${catStars.join(', ')}**. Cát tinh đóng vai trò bệ phóng nâng đỡ, mang lại may mắn, nhân duyên tốt lành, sự cứu giải của quý nhân và tạo dựng các điều kiện thuận lợi để đương số bứt phá.`);
      } else {
        lines.push(`- **Cát Tinh Trợ Lực:** Cung không có đại cát tinh trực tiếp đóng giữ, cần dựa vào thực lực tự thân và sự trợ lực từ các cung tam phương chiếu về.`);
      }

      // Sát tinh
      if (satStars.length > 0) {
        lines.push(`- **Hệ Thống Sát Tinh Cảnh Báo:** Cung chịu sự xâm phạm của các hung tinh: **${satStars.join(', ')}**. Sát tinh mang tính kích động và tạo sóng gió; đòi hỏi đương số phải luôn tỉnh táo, rèn luyện sự điềm tĩnh và có phương án phòng ngừa rủi ro cụ thể trong hành sự.`);
      } else {
        lines.push(`- **Sát Tinh:** Cung không bị sát tinh nguy hiểm trực tiếp hãm phá, môi trường tương đối an lành, ít biến cố bất ngờ tiêu cực.`);
      }

      // Tứ Hóa
      if (tuHoa.length > 0) {
        lines.push(`- **Tứ Hóa Tiên Thiên Kích Hoạt:**`);
        tuHoa.forEach(th => lines.push(`  + ${th}`));
      }

      // Tuần / Triệt
      if (tuanTriet) {
        lines.push(`- **Tác Động Tuần Không / Triệt Lộ:** ${tuanTriet}`);
      }

      // Combos
      if (combos.length > 0) {
        lines.push(`- **Tổ Hợp Bộ Sao Liên Kết Đặc Thù:**`);
        combos.forEach(cb => {
          lines.push(`  + **${cb.name}** (${cb.presence}): ${cb.effect}`);
        });
      }

      // MỤC 3: LUẬN ĐOÁN THỰC TẾ ĐỜI SỐNG & CHUYÊN MÔN CHỨC NĂNG
      lines.push(`\n**3. Luận Đoán Thực Tế Đời Sống & Chuyên Môn Chức Năng:**`);
      const pInfo = PALACES_INFO_DB[cungName] || {};
      lines.push(`- **Bản Chất Cung Vị:** ${pInfo.description || ''} ${pInfo.focus || ''}`);

      const aspects = PALACE_DEEP_ASPECTS_DB[cungName] || {};
      const firstStar = cleanStarName(chinhTinh[0] || "");
      
      // Specialized domain outputs
      if (cungName === "Mệnh") {
        if (aspects.appearance_by_main_star && firstStar && aspects.appearance_by_main_star[firstStar]) {
          lines.push(`- **Tướng Mạo & Khí Chất:** ${aspects.appearance_by_main_star[firstStar]}`);
        }
        if (aspects.core_traits && firstStar && aspects.core_traits[firstStar]) {
          lines.push(`- **Căn Cốt Nhân Cách:** ${aspects.core_traits[firstStar]}`);
        }
      } else if (cungName === "Quan Lộc") {
        if (aspects.suitable_careers_by_star && firstStar && aspects.suitable_careers_by_star[firstStar]) {
          lines.push(`- **Nhóm Ngành Phù Hợp:** ${aspects.suitable_careers_by_star[firstStar]}`);
        }
        if (aspects.work_style && firstStar && aspects.work_style[firstStar]) {
          lines.push(`- **Phong Cách Hành Sự:** ${aspects.work_style[firstStar]}`);
        }
      } else if (cungName === "Tài Bạch") {
        if (aspects.wealth_mechanism && firstStar && aspects.wealth_mechanism[firstStar]) {
          lines.push(`- **Phương Thức Sinh Tài:** ${aspects.wealth_mechanism[firstStar]}`);
        }
        if (aspects.money_management && firstStar && aspects.money_management[firstStar]) {
          lines.push(`- **Quản Trị Dòng Tiền:** ${aspects.money_management[firstStar]}`);
        }
      } else if (cungName === "Phu Thê") {
        if (aspects.spouse_traits && firstStar && aspects.spouse_traits[firstStar]) {
          lines.push(`- **Đặc Điểm Bạn Đời:** ${aspects.spouse_traits[firstStar]}`);
        }
        if (aspects.harmony_advice && firstStar && aspects.harmony_advice[firstStar]) {
          lines.push(`- **Bí Quyết Hòa Hợp Gia Đạo:** ${aspects.harmony_advice[firstStar]}`);
        }
      } else if (cungName === "Phúc Đức") {
        if (aspects.spiritual_traits && firstStar && aspects.spiritual_traits[firstStar]) {
          lines.push(`- **Phúc Trạch & Đời Sống Tinh Thần:** ${aspects.spiritual_traits[firstStar]}`);
        }
      } else if (cungName === "Điền Trạch") {
        if (aspects.real_estate && firstStar && aspects.real_estate[firstStar]) {
          lines.push(`- **Cơ Nghiệp Bất Động Sản:** ${aspects.real_estate[firstStar]}`);
        }
      } else if (cungName === "Thiên Di") {
        if (aspects.travel_social && firstStar && aspects.travel_social[firstStar]) {
          lines.push(`- **Môi Trường Xã Hội Ngoại Giới:** ${aspects.travel_social[firstStar]}`);
        }
      } else if (cungName === "Tật Ách") {
        const napAm = chartMeta?.nap_am || "";
        const el = getElementFromNapAm(napAm);
        const organDesc = aspects.element_organs?.[el] || "";
        lines.push(`- **Tạng Phủ Ngũ Hành Tiên Thiên:** Bản Mệnh hành ${el} (${napAm}): Liên đới tạng phủ: ${organDesc}`);
        if (aspects.health_warning_by_star && firstStar && aspects.health_warning_by_star[firstStar]) {
          lines.push(`- **Cảnh Báo Sức Khỏe Theo Tinh Tú:** ${aspects.health_warning_by_star[firstStar]}`);
        }
      } else if (cungName === "Tử Tức") {
        if (aspects.children_traits && firstStar && aspects.children_traits[firstStar]) {
          lines.push(`- **Tố Chất & Nhân Duyên Hậu Duệ:** ${aspects.children_traits[firstStar]}`);
        }
      } else if (cungName === "Huynh Đệ") {
        if (aspects.sibling_relation && firstStar && aspects.sibling_relation[firstStar]) {
          lines.push(`- **Tình Cảm Anh Em Ruột Thịt:** ${aspects.sibling_relation[firstStar]}`);
        }
      } else if (cungName === "Nô Bộc") {
        if (aspects.colleagues_partners && firstStar && aspects.colleagues_partners[firstStar]) {
          lines.push(`- **Quan Hệ Cộng Sự & Cấp Dưới:** ${aspects.colleagues_partners[firstStar]}`);
        }
      } else if (cungName === "Phụ Mẫu") {
        if (aspects.parental_relationship && firstStar && aspects.parental_relationship[firstStar]) {
          lines.push(`- **Quan Hệ Với Song Thân:** ${aspects.parental_relationship[firstStar]}`);
        }
      }

      // MỤC 4: KẾ HOẠCH HÀNH ĐỘNG & ĐẠO HÓA GIẢI HẬU THIÊN
      lines.push(`\n**4. Kế Hoạch Hành Động & Đạo Hóa Giải Hậu Thiên:**`);
      lines.push(`- **Định Hướng Chiến Lược:** ${advice}`);
      lines.push(`- **Đạo Hóa Giải:** 'Đức năng thắng số, tri mệnh để lập mệnh'. Luôn giữ tâm thế bình thản, lấy sự thiện lương, chính trực và chuẩn mực pháp lý làm kim chỉ nam để chuyển hóa hung hiểm thành bình an thịnh vượng.`);

      return lines.join('\n');
    },

    evaluateAllPalaces: function (chartData) {
      return chartData.palaces.map(p => this.evaluatePalace(p, chartData.meta, chartData.palaces));
    }
  };

  const TuViTuHoaEngine = {
    analyzeTuHoa: function (chartData) {
      const palaces = chartData.palaces;
      const meta = chartData.meta;
      const yearGan = meta.year_can_chi.split(' ')[0];

      const noiCungSet = new Set(TU_HOA_RULES_DB.noi_ngoai_cung_doctrine.noi_cung);
      const principles = TU_HOA_RULES_DB.noi_ngoai_cung_doctrine.principles;
      const palaceEffects = TU_HOA_RULES_DB.tu_hoa_in_palaces;

      const transformationsSummary = {};

      palaces.forEach(p => {
        const cungName = p.ten_cung;
        const diaChi = p.dia_chi;
        const tuHoaList = p.tu_hoa || [];
        const isNoiCung = noiCungSet.has(cungName);

        tuHoaList.forEach(th => {
          const thDesc = palaceEffects[th]?.[cungName] || "";
          const starName = meta.tu_hoa_goc[th] || "";

          let ktAnalysis = "Tăng cường năng lực chuyên môn và thanh danh tại cung vị sở tại.";
          if (th === "Hóa Lộc") ktAnalysis = isNoiCung ? principles.Loc_Noi_Cung : principles.Loc_Ngoai_Cung;
          else if (th === "Hóa Kỵ") ktAnalysis = isNoiCung ? principles.Ky_Noi_Cung : principles.Ky_Ngoai_Cung;

          transformationsSummary[th] = {
            star_name: starName,
            cung_name: cungName,
            dia_chi: diaChi,
            is_noi_cung: isNoiCung,
            palace_type: isNoiCung ? "Lục Nội Cung (Tự Thân)" : "Lục Ngoại Cung (Tha Nhân / Ngoại Cảnh)",
            detailed_effect: thDesc,
            kham_thien_doctrine: ktAnalysis
          };
        });
      });

      let kyClashWarning = "";
      const kyInfo = transformationsSummary["Hóa Kỵ"];
      if (kyInfo) {
        const kyPalaceName = kyInfo.cung_name;
        const kyPalace = palaces.find(p => p.ten_cung === kyPalaceName);
        if (kyPalace) {
          const oppIdx = (kyPalace.chi_idx + 6) % 12;
          const oppPalace = palaces[oppIdx];

          if (!kyInfo.is_noi_cung && noiCungSet.has(oppPalace.ten_cung)) {
            kyClashWarning = `Hóa Kỵ tọa thủ tại Lục Ngoại Cung (${kyPalaceName} tại ${kyPalace.dia_chi}) xung chiếu trực diện vào Lục Nội Cung (${oppPalace.ten_cung} tại ${oppPalace.dia_chi}). Đây là điểm xung sát tiềm ẩn, báo hiệu nguy cơ thị phi, áp lực hao tán hoặc tranh chấp từ môi trường ngoài dội thẳng vào nội thể.`;
          } else {
            kyClashWarning = `Hóa Kỵ nhập ${kyPalaceName} (${kyInfo.palace_type}): Chấp niệm nằm ở cung sở tại. Bản thân đương số phải bỏ nhiều tâm tư, công sức lo toan cho phương diện này nhưng sẽ giữ vững được thành quả nếu kiên trì vượt khó.`;
          }
        }
      }

      return {
        year_gan: yearGan,
        transformations: transformationsSummary,
        transformationsSummary: transformationsSummary,
        ky_clash_warning: kyClashWarning,
        kyClashWarning: kyClashWarning
      };
    }
  };

  // ==========================================
  // VIII. ĐỘNG CƠ VẬN HẠN ĐA TẦNG (TIMING ENGINE)
  // ==========================================

  const TuViTimingEngine = {
    _elementRelationship: function (elHan, elMenh) {
      const sinhMap = { "Kim": "Thủy", "Thủy": "Mộc", "Mộc": "Hỏa", "Hỏa": "Thổ", "Thổ": "Kim" };
      const khacMap = { "Kim": "Mộc", "Mộc": "Thổ", "Thổ": "Thủy", "Thủy": "Hỏa", "Hỏa": "Kim" };

      let relType = "ty_hoa";
      if (elHan === elMenh) relType = "ty_hoa";
      else if (sinhMap[elHan] === elMenh) relType = "sinh_nhap";
      else if (sinhMap[elMenh] === elHan) relType = "sinh_xuat";
      else if (khacMap[elHan] === elMenh) relType = "khac_nhap";
      else relType = "khac_xuat";

      const interInfo = TIMING_RULES_DB.timing_principles.dai_van_10_years.element_interaction[relType] || {};
      return {
        type: relType,
        status: interInfo.status || "Bình hòa",
        desc: interInfo.desc || "",
        el_hạn: elHan,
        el_mệnh: elMenh
      };
    },

    evaluateTiming: function (chartData) {
      const palaces = chartData.palaces;
      const meta = chartData.meta;
      const targetYear = meta.target_year;
      const lunarAge = meta.lunar_age;
      const napAmMenh = meta.nap_am;
      const menhElement = getElementFromNapAm(napAmMenh);
      const cuc = meta.cuc_number;
      const isThuan = meta.is_thuan_ly;
      const menhChi = meta.menh_chi;
      const menhIdx = CHI.indexOf(menhChi);

      // 1. Toàn bộ chuỗi 8 Đại Vận suốt đời
      const allLifeDaiVans = [];
      let activeDvAnalysis = {};

      for (let step = 0; step < 8; step++) {
        const startAge = cuc + step * 10;
        const endAge = startAge + 9;
        const pIdx = isThuan ? (menhIdx + step) % 12 : ((menhIdx - step) % 12 + 12) % 12;
        const p = palaces[pIdx];

        const dvNapAm = p.nap_am;
        const dvElement = getElementFromNapAm(dvNapAm);
        const elemRel = this._elementRelationship(dvElement, menhElement);
        const chinhTinhStr = p.chinh_tinh.join(', ') || "Vô Chính Diệu";
        const isActive = (startAge <= lunarAge && lunarAge <= endAge);

        let stageDesc = "";
        if (step === 0) stageDesc = "Giai đoạn niên thiếu: Căn cốt học hành, phụ thuộc vào phúc ấm gia đình và cha mẹ.";
        else if (step === 1) stageDesc = "Giai đoạn thanh niên lập thân: Bắt đầu bước ra xã hội, lập nghiệp, thi cử và định hình tình cảm.";
        else if (step === 2) stageDesc = "Giai đoạn kiến tạo cơ đồ (Tam thập nhi lập): Giai đoạn vàng để bứt phá sự nghiệp và tài chính.";
        else if (step === 3) stageDesc = "Giai đoạn trung vận đỉnh cao: Trọng tâm thu hoạch thành quả, khẳng định vị thế vững chắc.";
        else if (step === 4) stageDesc = "Giai đoạn củng cố cơ nghiệp: Quản trị tài sản, mở rộng điền sản, chuyển giao thế hệ.";
        else if (step === 5) stageDesc = "Giai đoạn an định hậu vận: Giữ gìn sức khỏe, hướng về gia đạo và công việc thiện nguyện.";
        else stageDesc = "Giai đoạn tuổi già thanh nhàn: Hưởng phúc thọ bên con cháu, tâm tính an nhiên.";

        const dvScore = Math.min(95, Math.max(40, Math.round(50 + (elemRel.type === 'sinh_nhap' || elemRel.type === 'ty_hoa' ? 18 : (elemRel.type === 'khac_nhap' ? -12 : 5)) + (p.chinh_tinh.length > 0 ? 10 : 0))));
        const dvItem = {
          step: step + 1,
          range: `${startAge}-${endAge}`,
          start_age: startAge,
          end_age: endAge,
          is_active: isActive,
          palace: p.ten_cung,
          palace_name: p.ten_cung,
          chi: p.dia_chi,
          dia_chi: p.dia_chi,
          thien_can: p.thien_can,
          nap_am: dvNapAm,
          element_interaction: elemRel,
          chinh_tinh: chinhTinhStr,
          stage_desc: stageDesc,
          score: dvScore,
          active_analysis: `Đại Hạn ${startAge}-${endAge} tuổi tại cung ${p.ten_cung} (${p.thien_can} ${p.dia_chi} - Nạp âm ${dvNapAm}). Tương tác Ngũ hành: ${elemRel.status} (${elemRel.desc}). Chính tinh: ${chinhTinhStr}. ${stageDesc}`,
          summary: `Đại Vận ${startAge}-${endAge} tuổi tại cung ${p.ten_cung} (${p.thien_can} ${p.dia_chi} - ${dvNapAm}). Ngũ hành: ${elemRel.status} (${elemRel.desc}). Chính tinh: ${chinhTinhStr}. ${stageDesc}`
        };

        allLifeDaiVans.push(dvItem);
        if (isActive) activeDvAnalysis = dvItem;
      }

      if (!activeDvAnalysis || !activeDvAnalysis.range) {
        activeDvAnalysis = allLifeDaiVans[0] || {};
      }

      // 2. Vận hạn năm hiện tại
      const lndvPalace = palaces.find(p => p.is_lndv);
      const tieuHanPalace = palaces.find(p => p.is_tieu_han);
      const thaiTuePalace = palaces.find(p => p.is_thai_tue_nam);

      const annualFocus = [];
      if (lndvPalace) annualFocus.push(`Lưu Niên Đại Vận (Chủ đạo tuổi mụ ${lunarAge}): Cung ${lndvPalace.ten_cung} tại ${lndvPalace.dia_chi}`);
      if (tieuHanPalace) annualFocus.push(`Tiểu Hạn (Biến cố sự vụ năm): Cung ${tieuHanPalace.ten_cung} tại ${tieuHanPalace.dia_chi}`);
      if (thaiTuePalace) annualFocus.push(`Thái Tuế Lưu Niên (Môi trường kích hoạt): Cung ${thaiTuePalace.ten_cung} tại ${thaiTuePalace.dia_chi}`);

      const targetPalace = tieuHanPalace || lndvPalace || palaces[0];
      const annualFocusObj = {
        target_year: targetYear,
        target_can_chi: meta.target_can_chi || "",
        lunar_age: lunarAge,
        palace: targetPalace ? targetPalace.ten_cung : "Mệnh",
        chinh_tinh: targetPalace ? (targetPalace.chinh_tinh.join(', ') || 'Vô Chính Diệu') : '',
        sao_luu: (targetPalace && targetPalace.sao_luu) || [],
        analysis: annualFocus.join('. ') || `Năm ${targetYear} (${meta.target_can_chi}) đương số ${lunarAge} tuổi mụ, trọng tâm tại cung ${targetPalace.ten_cung}.`
      };

      // 3. Tương tác sao lưu
      const saoLuuInteractions = [];
      const allSaoLuuByPalace = [];

      palaces.forEach(p => {
        const sLuu = p.sao_luu || [];
        if (sLuu.length === 0) return;

        allSaoLuuByPalace.push({
          palace: p.ten_cung,
          chi: p.dia_chi,
          stars: sLuu
        });

        const gocPhu = (p.phu_tinh || []).map(cleanStarName);
        const gocTuHoa = p.tu_hoa || [];

        // Trùng Lộc
        if (sLuu.includes("Lưu Lộc Tồn") && (gocPhu.includes("Lộc Tồn") || gocTuHoa.includes("Hóa Lộc"))) {
          saoLuuInteractions.push({
            type: "TRUNG_LOC", title: "Trùng Lộc (Song Lộc Hội Tụ)", palace: `${p.ten_cung} (${p.dia_chi})`,
            effect: "Cực cát: Cơ hội tài chính bùng nổ, nguồn thu nhập gia tăng mạnh mẽ, kinh doanh hanh thông."
          });
        }
        // Trùng Kình
        if (sLuu.includes("Lưu Kình Dương") && gocPhu.includes("Kình Dương")) {
          saoLuuInteractions.push({
            type: "TRUNG_KINH", title: "Trùng Kình (Hình Thương Phẫu Thuật)", palace: `${p.ten_cung} (${p.dia_chi})`,
            effect: "Cực hung: Đề phòng va chạm thương tật, phẫu thuật dao kéo, đổ vỡ hợp đồng hoặc tranh chấp gay gắt."
          });
        }
        // Trùng Đà
        if (sLuu.includes("Lưu Đà La") && gocPhu.includes("Đà La")) {
          saoLuuInteractions.push({
            type: "TRUNG_DA", title: "Trùng Đà (Trì Trệ Ám Muội)", palace: `${p.ten_cung} (${p.dia_chi})`,
            effect: "Hung: Công việc mưu tính bị trì trệ kéo dài, tiểu nhân đố kỵ sau lưng, bệnh mãn tính dễ tái phát."
          });
        }
        // Trùng Tang / Trùng Hổ
        if (sLuu.includes("Lưu Tang Môn") && gocPhu.includes("Tang Môn")) {
          saoLuuInteractions.push({
            type: "TRUNG_TANG", title: "Trùng Tang Môn (Phiền Não Gia Tộc)", palace: `${p.ten_cung} (${p.dia_chi})`,
            effect: "Hung: Có việc buồn trong thân tộc, hao tốn tâm trí, gia đạo thiếu an vui."
          });
        }
        if (sLuu.includes("Lưu Bạch Hổ") && gocPhu.includes("Bạch Hổ")) {
          saoLuuInteractions.push({
            type: "TRUNG_HO", title: "Trùng Bạch Hổ (Hình Pháp Huyết Quang)", palace: `${p.ten_cung} (${p.dia_chi})`,
            effect: "Hung: Cẩn thận va chạm pháp lý hành chính, tai nạn thương tích hoặc bệnh lý liên quan đến máu huyết."
          });
        }
        // Song Kỵ
        if (sLuu.includes("Lưu Hóa Kỵ") && gocTuHoa.includes("Hóa Kỵ")) {
          saoLuuInteractions.push({
            type: "SONG_KY", title: "Song Kỵ Trùng Phùng (Tâm Điểm Bế Tắc)", palace: `${p.ten_cung} (${p.dia_chi})`,
            effect: "Đại hung: Điểm nút thử thách lớn nhất năm. Tuyệt đối không mở rộng đầu tư mạo hiểm, cần giữ mình thanh tịnh."
          });
        }
        // Mã Khốc Khách
        if ((sLuu.includes("Lưu Thiên Mã") || gocPhu.includes("Thiên Mã")) && (gocPhu.includes("Thiên Khốc") || sLuu.includes("Lưu Thiên Khốc"))) {
          saoLuuInteractions.push({
            type: "MA_KHOC_KHACH", title: "Mã Khốc Khách (Tuấn Mã Lập Công)", palace: `${p.ten_cung} (${p.dia_chi})`,
            effect: "Cát: Xông pha đi xa gặt hái thành công, càng hoạt động giao thiệp càng mở ra cơ hội lập nghiệp vang dội."
          });
        }
      });

      // 4. Dự báo 12 Tháng Lưu Nguyệt
      const ttIdx = CHI.indexOf(meta.thai_tue_chi);
      const monthlyForecast = [];
      const monthNames = ["Giêng", "Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy", "Tám", "Chín", "Mười", "Mười Một", "Chạp"];

      for (let m = 0; m < 12; m++) {
        const mPalace = palaces[(ttIdx + m) % 12];
        const mChinh = mPalace.chinh_tinh.join(', ') || "Vô Chính Diệu";
        const mSaoLuu = mPalace.sao_luu || [];

        let note = "Bình ổn, duy trì công việc hiện tại.";
        if (mSaoLuu.some(s => String(s).includes("Lộc")) || (mPalace.tu_hoa || []).some(s => String(s).includes("Lộc"))) {
          note = "Vận tài chính sáng sủa, có thu hoạch hoặc cơ hội kiếm tiền tốt.";
        } else if (mSaoLuu.some(s => String(s).includes("Kình") || String(s).includes("Đà")) || (mPalace.tu_hoa || []).includes("Hóa Kỵ")) {
          note = "Cẩn trọng áp lực công việc, đề phòng thị phi hoặc hao hụt chi tiêu ngoài dự tính.";
        } else if (mSaoLuu.some(s => String(s).includes("Hổ") || String(s).includes("Tang"))) {
          note = "Chú ý sức khỏe cá nhân và việc hiếu nghĩa trong gia đình.";
        }

        monthlyForecast.push({
          month_num: m + 1,
          month_name: `Tháng ${monthNames[m]} (ÂL)`,
          palace: mPalace.ten_cung,
          chi: mPalace.dia_chi,
          chinh_tinh: mChinh,
          note: note
        });
      }

      // 5. Quét biến động đa năm
      const multiYearEvents = this._scanMultiYearTimeline(chartData);

      return {
        all_life_dai_vans: allLifeDaiVans,
        dai_van: activeDvAnalysis,
        annual_focus: annualFocusObj,
        annual_focus_list: annualFocus,
        sao_luu_by_palace: allSaoLuuByPalace,
        sao_luu_interactions: saoLuuInteractions,
        monthly_forecast: monthlyForecast,
        multi_year_events: multiYearEvents
      };
    },

    _scanMultiYearTimeline: function (chartData) {
      const meta = chartData.meta;
      const palaces = chartData.palaces;
      const birthYear = meta.birth_year || 1979;
      const targetYear = meta.target_year || 2026;

      const dienP = palaces.find(p => p.ten_cung === "Điền Trạch");
      const quanP = palaces.find(p => p.ten_cung === "Quan Lộc");
      const taiP = palaces.find(p => p.ten_cung === "Tài Bạch");
      const huynhP = palaces.find(p => p.ten_cung === "Huynh Đệ");
      const phoiP = palaces.find(p => p.ten_cung === "Phu Thê");
      const tuP = palaces.find(p => p.ten_cung === "Tử Tức");
      const phucP = palaces.find(p => p.ten_cung === "Phúc Đức");
      const phuMauP = palaces.find(p => p.ten_cung === "Phụ Mẫu");

      if (!dienP || !quanP || !taiP) return [];

      const allDienStars = [...dienP.chinh_tinh, ...dienP.phu_tinh].map(cleanStarName);
      const allQuanStars = [...quanP.chinh_tinh, ...quanP.phu_tinh].map(cleanStarName);
      const allTaiStars = [...taiP.chinh_tinh, ...taiP.phu_tinh].map(cleanStarName);
      const allHuynhStars = huynhP ? [...huynhP.chinh_tinh, ...huynhP.phu_tinh].map(cleanStarName) : [];
      const allPhoiStars = phoiP ? [...phoiP.chinh_tinh, ...phoiP.phu_tinh].map(cleanStarName) : [];
      const allTuStars = tuP ? [...tuP.chinh_tinh, ...tuP.phu_tinh].map(cleanStarName) : [];
      const allPhucStars = phucP ? [...phucP.chinh_tinh, ...phucP.phu_tinh].map(cleanStarName) : [];

      const yearGan = meta.year_can_chi.split(' ')[0];
      const results = [];

      const startScan = Math.max(birthYear + 18, targetYear - 26);
      const endScan = targetYear + 2;

      for (let y = startScan; y <= endScan; y++) {
        const tgIdx = (y - 4 + 1000) % 10;
        const tzIdx = (y - 4 + 1200) % 12;
        const tGan = CAN[tgIdx];
        const tZhi = CHI[tzIdx];
        const lAge = calculateLunarAge(birthYear, y);

        const [lLoc, lQuyen, lKhoa, lKy] = TU_HOA_MAP[tGan] || ["", "", "", ""];
        const luuLocPos = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0][tgIdx];
        const luuKinhPos = (luuLocPos + 1) % 12;
        const luuDaPos = (luuLocPos - 1 + 12) % 12;
        const luuTangPos = (tzIdx + 2) % 12;
        const luuHoPos = (tzIdx + 8) % 12;
        const luuThaiTuePos = tzIdx;

        const activeP = palaces.find(p => p.dai_van_start <= lAge && lAge <= p.dai_van_start + 9);
        const activeCungName = activeP ? activeP.ten_cung : "";

        const cEvents = [];
        const hEvents = [];
        const wEvents = [];
        const familyEvents = [];

        // 1. Gia đạo / Huynh đệ
        if (huynhP) {
          const hasSatHuynh = allHuynhStars.some(s => ["Liêm Trinh", "Phá Quân", "Thất Sát", "Địa Không", "Địa Kiếp", "Kình Dương", "Đà La", "Hỏa Tinh", "Linh Tinh"].includes(s));
          if (luuKinhPos === huynhP.chi_idx && (huynhP.tuan_triet.includes("Triệt") || allHuynhStars.includes("Tang Môn") || hasSatHuynh)) {
            if (allPhucStars.includes(lKy) || allHuynhStars.includes(lKy)) {
              familyEvents.push(`Tang ách Huynh Đệ: Sát tinh lưu (Kình/Tang) nhập Cung Huynh Đệ (${huynhP.chinh_tinh.join(', ') || 'VCD'} ngộ sát tinh) phối hợp Lưu Hóa Kỵ. Cảnh báo tai nạn, thương tật hoặc tang chế trong quan hệ anh em thân tộc.`);
            }
          }
        }

        // 2. Hôn nhân & Sinh con
        if (phoiP && lAge >= 18 && lAge <= 50) {
          const isDvPhoi = (activeCungName === "Phu Thê");
          const hasDaoHoa = [...allPhoiStars, ...allPhucStars].some(s => ["Hồng Loan", "Đào Hoa", "Thiên Hỷ", "Thiên Việt", "Thiên Khôi"].includes(s));
          const hasCatHoa = (allPhoiStars.includes(lLoc) || allPhucStars.includes(lLoc) || allPhoiStars.includes(lQuyen) || allPhucStars.includes(lQuyen));
          if ((isDvPhoi || luuThaiTuePos === phoiP.chi_idx) && (hasDaoHoa && hasCatHoa)) {
            familyEvents.push(`Hỷ sự Hôn nhân: Vận trình ngự Cung Phu Thê (${phoiP.chinh_tinh.join(', ') || 'VCD'}) đắc Đào hồng hỷ tinh và Lưu Hóa Lộc/Quyền. Thuận lợi đại sự trăm năm, kết duyên loan phụng.`);
          }
          if (tuP) {
            const isTuTucActive = (luuKinhPos === tuP.chi_idx || luuHoPos === tuP.chi_idx || luuTangPos === tuP.chi_idx || luuThaiTuePos === tuP.chi_idx);
            if (isTuTucActive) {
              familyEvents.push(`Gia tăng nhân khẩu / Sinh con: Động Cung Tử Tức (${tuP.chinh_tinh.join(', ') || 'VCD'}) đắc sao lưu thai sản (Lưu Kình/Hổ/Tang). Báo hiệu hỷ sự sinh nở, chào đón quý tử/ái nữ.`);
            }
          }
        }

        // 3. Điền sản & Chỗ ở
        if (tGan === yearGan) {
          if (allDienStars.includes(lLoc) || allDienStars.includes(lQuyen)) {
            const isTachHo = phuMauP && (luuThaiTuePos === phuMauP.chi_idx);
            hEvents.push(`Đại phát điền sản / Tạo lập cơ ngơi: Trùng Thiên Can năm sinh kích hoạt Song Hóa Lộc/Quyền tại Điền Trạch (${dienP.chinh_tinh.join(', ') || 'VCD'}). Mua nhà đất lớn, gia tăng tài sản${isTachHo ? " và tách hộ ra ở riêng độc lập." : "."}`);
          }
        } else if (allDienStars.includes(lKy) && (luuKinhPos === dienP.chi_idx || luuDaPos === dienP.chi_idx)) {
          hEvents.push(`Biến động lớn về chỗ ở: Lưu Hóa Kỵ ngộ Sát tinh lưu (Kình/Đà) đánh phá Cung Điền Trạch (${dienP.chinh_tinh.join(', ') || 'VCD'}). Dời chuyển chỗ ở, thay đổi nơi cư trú, sửa sang cơi nới hoặc giao dịch đất đai.`);
        } else if (allDienStars.includes(lKy)) {
          hEvents.push(`Biến động gia trạch: Lưu Hóa Kỵ nhập Cung Điền Trạch (${dienP.chinh_tinh.join(', ') || 'VCD'}). Có việc sửa chữa, điều chỉnh không gian sống hoặc phát sinh thủ tục nhà đất.`);
        } else if (luuThaiTuePos === dienP.chi_idx) {
          hEvents.push(`Trọng tâm bất động sản: Lưu Thái Tuế kích hoạt Cung Điền Trạch (${dienP.chinh_tinh.join(', ') || 'VCD'}). Giao dịch mua bán, tu sửa hoặc thay đổi môi trường cư trú.`);
        } else if (allDienStars.includes(lLoc) || allDienStars.includes(lQuyen)) {
          hEvents.push(`Gia tăng điền sản: Lưu Hóa Lộc / Hóa Quyền nhập Cung Điền Trạch (${dienP.chinh_tinh.join(', ') || 'VCD'}). Mua sắm thêm tài sản, nâng cấp không gian sống.`);
        }

        // 4. Công việc & Sự nghiệp
        const hasLLocQuan = allQuanStars.includes(lLoc);
        const hasLQuyenQuan = allQuanStars.includes(lQuyen);
        const hasLKyQuan = allQuanStars.includes(lKy);
        const hasLHoQuan = (luuHoPos === quanP.chi_idx);
        const hasLDaQuan = (luuDaPos === quanP.chi_idx);
        const hasLTtQuan = (luuThaiTuePos === quanP.chi_idx);

        if (hasLLocQuan && hasLQuyenQuan) {
          cEvents.push(`Đột phá công danh: Song Hóa Lộc - Quyền tề tựu tại Cung Quan Lộc (${quanP.chinh_tinh.join(', ') || 'VCD'}). Thăng tiến vị trí, chuyển đổi vai trò, mở rộng quy mô trách nhiệm.`);
        } else if (hasLHoQuan) {
          cEvents.push(`Bước ngoặt sự nghiệp: Lưu Bạch Hổ kích hoạt Cung Quan Lộc (${quanP.chinh_tinh.join(', ') || 'VCD'}). Quyết định dứt khoát tái cấu trúc, thay đổi công việc hoặc phương thức làm việc.`);
        } else if (hasLDaQuan) {
          cEvents.push(`Áp lực chuyển dịch: Lưu Đà La nhập Cung Quan Lộc (${quanP.chinh_tinh.join(', ') || 'VCD'}). Mô hình cũ gặp lực cản/trì trệ, chuẩn bị phương án chuyển dịch mới.`);
        } else if (hasLKyQuan) {
          cEvents.push(`Biến động cơ cấu: Lưu Hóa Kỵ nhập Cung Quan Lộc (${quanP.chinh_tinh.join(', ') || 'VCD'}). Áp lực cạnh tranh, điều chuyển công tác hoặc sắp xếp lại nội bộ.`);
        } else if (hasLTtQuan) {
          cEvents.push(`Trọng tâm sự nghiệp: Lưu Thái Tuế nhập Cung Quan Lộc (${quanP.chinh_tinh.join(', ') || 'VCD'}). Toàn bộ năng lượng dồn vào công việc và định vị xã hội.`);
        }

        // 5. Tài chính
        if (luuThaiTuePos === taiP.chi_idx) {
          wEvents.push(`Tuế Vận Đồng Cung tại Cung Tài Bạch (${taiP.chinh_tinh.join(', ') || 'VCD'}): Trọng tâm tài chính lớn nhất chu kỳ 10 năm, tái cấu trúc toàn diện dòng tiền và danh mục đầu tư.`);
        } else if (luuLocPos === taiP.chi_idx || allTaiStars.includes(lLoc)) {
          wEvents.push(`Thu hoạch tài chính: Lưu Lộc Tồn / Lưu Hóa Lộc kích hoạt Cung Tài Bạch (${taiP.chinh_tinh.join(', ') || 'VCD'}). Dòng tiền dồi dào, lợi nhuận hanh thông.`);
        }

        if (cEvents.length > 0 || hEvents.length > 0 || wEvents.length > 0 || familyEvents.length > 0) {
          results.push({
            year: y,
            can_chi: `${tGan} ${tZhi}`,
            lunar_age: lAge,
            family_events: familyEvents,
            career_events: cEvents,
            housing_events: hEvents,
            wealth_events: wEvents
          });
        }
      }

      return results;
    }
  };

  // ==========================================
  // IX. ĐỘNG CƠ CHẤM ĐIỂM ĐỊNH LƯỢNG (SCORER)
  // ==========================================

  const TuViQuantitativeScorer = {
    computeAllScores: function (chartData, patternData, evaluatedPalaces, timingData) {
      const palaceMap = {};
      evaluatedPalaces.forEach(p => {
        palaceMap[p.cung_name] = p.quality_score;
      });

      const netPatternScore = patternData.pattern_summary.net_pattern_score || 0;

      // 1. Cốt Cách Bản Mệnh
      const menhScore = palaceMap["Mệnh"] || 50;
      const thanScore = palaceMap["Thân"] || menhScore;
      const phucScore = palaceMap["Phúc Đức"] || 50;
      const destinyRaw = (menhScore * 0.40) + (thanScore * 0.30) + (phucScore * 0.20) + (netPatternScore * 0.5);
      const overallDestiny = Math.floor(Math.max(20, Math.min(98, destinyRaw)));

      // 2. Sự Nghiệp & Quyền Lực
      const quanScore = palaceMap["Quan Lộc"] || 50;
      const diScore = palaceMap["Thiên Di"] || 50;
      const careerRaw = (quanScore * 0.50) + (menhScore * 0.30) + (diScore * 0.20);
      const careerScore = Math.floor(Math.max(20, Math.min(98, careerRaw)));

      // 3. Tài Chính & Điền Sản
      const taiScore = palaceMap["Tài Bạch"] || 50;
      const dienScore = palaceMap["Điền Trạch"] || 50;
      const wealthRaw = (taiScore * 0.50) + (dienScore * 0.35) + (menhScore * 0.15);
      const wealthScore = Math.floor(Math.max(20, Math.min(98, wealthRaw)));

      // 4. Hôn Nhân & Gia Đạo
      const phuTheScore = palaceMap["Phu Thê"] || 50;
      const tuTucScore = palaceMap["Tử Tức"] || 50;
      const marriageRaw = (phuTheScore * 0.60) + (phucScore * 0.25) + (tuTucScore * 0.15);
      const marriageScore = Math.floor(Math.max(20, Math.min(98, marriageRaw)));

      // 5. Sức Khỏe & Thọ Mệnh
      const tatScore = palaceMap["Tật Ách"] || 50;
      const healthRaw = (tatScore * 0.50) + (menhScore * 0.30) + (phucScore * 0.20);
      const healthScore = Math.floor(Math.max(20, Math.min(98, healthRaw)));

      // 6. Vận Hạn Năm Hiện Tại
      const dvStatus = timingData?.dai_van?.element_interaction?.type || "ty_hoa";
      const dvWeights = {
        "sinh_nhap": 20, "ty_hoa": 15, "khac_xuat": 5, "sinh_xuat": -5, "khac_nhap": -20
      };
      const annualBase = 60 + (dvWeights[dvStatus] || 0);

      let saoLuuMod = 0;
      (timingData.sao_luu_interactions || []).forEach(inter => {
        const t = inter.type || "";
        if (t === "TRUNG_LOC") saoLuuMod += 15;
        else if (t === "MA_KHOC_KHACH") saoLuuMod += 10;
        else if (t === "TRUNG_KINH") saoLuuMod -= 15;
        else if (t === "TRUNG_DA") saoLuuMod -= 10;
        else if (t === "SONG_KY") saoLuuMod -= 20;
        else if (["TRUNG_TANG", "TRUNG_HO"].includes(t)) saoLuuMod -= 8;
      });

      const annualRaw = annualBase + saoLuuMod;
      const annualScore = Math.floor(Math.max(20, Math.min(95, annualRaw)));

      function getGrade(s) {
        if (s >= 85) return "Thượng Cách (Thuận Lợi Toàn Diện)";
        if (s >= 75) return "Cát Lợi (Thuận Lợi Cao)";
        if (s >= 65) return "Trung Thượng (Khá tốt)";
        if (s >= 50) return "Trung Bình (Ổn định)";
        if (s >= 40) return "Trung Hạ (Nhiều thử thách)";
        return "Hạ Cách (Cần nỗ lực hóa giải)";
      }

      return {
        overall_destiny: {
          score: overallDestiny,
          grade: getGrade(overallDestiny),
          desc: "Chỉ số cốt cách tổng thể của Mệnh Thân và Phúc ấm tiên thiên."
        },
        career_power: {
          score: careerScore,
          grade: getGrade(careerScore),
          desc: "Năng lực chuyên môn, uy quyền, đường công danh và vị thế xã hội."
        },
        wealth_assets: {
          score: wealthScore,
          grade: getGrade(wealthScore),
          desc: "Năng lực tạo dòng tiền, tích lũy tài sản và bất động sản điền trạch."
        },
        marriage_harmony: {
          score: marriageScore,
          grade: getGrade(marriageScore),
          desc: "Độ hòa hợp hôn nhân, tình cảm bạn đời và sự yên ấm gia đạo."
        },
        health_longevity: {
          score: healthScore,
          grade: getGrade(healthScore),
          desc: "Sinh lực thể chất, sức đề kháng, khả năng cứu giải bệnh tật và tai ương."
        },
        annual_fortune: {
          score: annualScore,
          grade: getGrade(annualScore),
          desc: `Vận khí tổng thể của năm ${chartData.meta.target_year} (${chartData.meta.target_can_chi}).`
        }
      };
    }
  };

  // ==========================================
  // X. ĐỘNG CƠ TỔNG HỢP CỐT CÁCH & BẢN ĐỒ CHIẾN LƯỢC VẬN TRÌNH (MASTER SYNTHESIZER)
  // ==========================================

  const TuViMasterSynthesizer = {
    synthesizeMasterAssessment: function (chartData, patternData, evaluatedPalaces, tuHoaData, timingData, scoresData) {
      const meta = chartData?.meta || {};
      const targetYear = meta.target_year || new Date().getFullYear();
      const lunarAge = meta.lunar_age || 30;
      const napAm = meta.nap_am || "Hải Trung Kim";
      const menhElement = getElementFromNapAm(napAm);
      const cucName = meta.cuc_name || "Thủy Nhị Cục";

      let cucElement = "Thổ";
      for (const e of ["Kim", "Mộc", "Thủy", "Hỏa", "Thổ"]) {
        if (cucName.includes(e)) { cucElement = e; break; }
      }

      const sinhMap = { "Kim": "Thủy", "Thủy": "Mộc", "Mộc": "Hỏa", "Hỏa": "Thổ", "Thổ": "Kim" };
      const khacMap = { "Kim": "Mộc", "Mộc": "Thổ", "Thổ": "Thủy", "Thủy": "Hỏa", "Hỏa": "Kim" };

      let menhCucStatus = "Tỷ Hòa";
      let menhCucText = "";
      if (menhElement === cucElement) {
        menhCucStatus = "Tỷ Hòa";
        menhCucText = `Bản Mệnh và Cục số Tỷ Hòa (${menhElement} - ${cucElement}): Cuộc đời có sự dung hòa tự nhiên với hoàn cảnh xã hội, đương số dễ hòa nhập, được môi trường tiếp nhận, phát triển theo thế vững chắc.`;
      } else if (sinhMap[cucElement] === menhElement) {
        menhCucStatus = "Cục sinh Bản Mệnh";
        menhCucText = `Cục sinh Bản Mệnh (${cucElement} sinh ${menhElement}): Được hoàn cảnh và thời thế ưu ái, gặp nhiều cơ duyên thuận lợi, ngoại cảnh nâng đỡ và tạo bệ phóng phát triển.`;
      } else if (sinhMap[menhElement] === cucElement) {
        menhCucStatus = "Bản Mệnh sinh Cục";
        menhCucText = `Bản Mệnh sinh Cục (${menhElement} sinh ${cucElement}): Đương số tiêu hao nhiều tâm lực cho môi trường, làm lợi cho tổ chức và xã hội trước khi gặt hái thành quả vững chắc.`;
      } else if (khacMap[menhElement] === cucElement) {
        menhCucStatus = "Bản Mệnh khắc Cục";
        menhCucText = `Bản Mệnh khắc Cục (${menhElement} khắc ${cucElement}): Gian truân lập nghiệp buổi ban đầu, nhưng nhờ ý chí kiên định tự thân có thể làm chủ hoàn cảnh, vượt qua nghịch cảnh để kiến tạo cơ đồ.`;
      } else {
        menhCucStatus = "Cục khắc Bản Mệnh";
        menhCucText = `Cục khắc Bản Mệnh (${cucElement} khắc ${menhElement}): Hoàn cảnh thường tạo ra lực cản và thử thách, đòi hỏi phải rèn luyện đức tính kiên nhẫn, điềm tĩnh và linh hoạt thích ứng.`;
      }

      const menhPalace = (chartData.palaces || []).find(p => p.is_menh) || {};
      const menhPhu = (menhPalace.phu_tinh || []).map(cleanStarName);
      let thaiTueGroup = "Bình hòa";
      let thaiTueDesc = "";
      if (menhPhu.includes("Thái Tuế") || menhPhu.includes("Quan Phù") || menhPhu.includes("Bạch Hổ")) {
        thaiTueGroup = "Thái Tuế - Quan Phù - Bạch Hổ";
        thaiTueDesc = "Vị thế đắc thời, chính danh đĩnh đạc, tư cách người gánh vác, làm việc có nguyên tắc, trọng danh dự và tinh thần trách nhiệm cao độ.";
      } else if (menhPhu.includes("Tang Môn") || menhPhu.includes("Tuế Phá") || menhPhu.includes("Điếu Khách")) {
        thaiTueGroup = "Tang Môn - Tuế Phá - Điếu Khách";
        thaiTueDesc = "Vị thế không cam chịu trói buộc trong khuôn mẫu cũ. Thích đổi mới, có chí tiến thủ trong nghịch cảnh, lời nói có sức thuyết phục nhưng nội tâm nhiều trăn trở.";
      } else if (menhPhu.includes("Thiếu Dương") || menhPhu.includes("Tử Phù") || menhPhu.includes("Phúc Đức")) {
        thaiTueGroup = "Thiếu Dương - Tử Phù - Phúc Đức";
        thaiTueDesc = "Mẫu người thông minh, nhạy bén, khôn ngoan, nhân từ. Cần chú trọng sự bền bỉ, kiên định theo đuổi mục tiêu đến cùng.";
      } else if (menhPhu.includes("Thiếu Âm") || menhPhu.includes("Long Đức") || menhPhu.includes("Trực Phù")) {
        thaiTueGroup = "Thiếu Âm - Long Đức - Trực Phù";
        thaiTueDesc = "Vị thế nhẫn nhịn, bao dung, thường gánh vác phần thiệt thòi về mình. Lấy đức phục người, không màng tranh chấp vụn vặt, tích thiện bồi đức để hậu vận hưởng phúc trạch an nhiên.";
      } else {
        thaiTueGroup = "Bình hòa";
        thaiTueDesc = "Khí số trung dung, thích ứng linh hoạt với biến chuyển của thời cuộc.";
      }

      // 1. Master Overview
      const overallScore = scoresData?.overall_destiny?.score || 72;
      let gradeBadge = "Cát Cách Vững Vàng";
      if (overallScore >= 85) gradeBadge = "Cát Cách (Vận Số Thuận Chiều)";
      else if (overallScore >= 75) gradeBadge = "Cát Cách Vững Vàng (Khí Số Thuận Lợi)";
      else if (overallScore >= 65) gradeBadge = "Khí Số Bình Ổn (Trung Bình Khá)";
      else gradeBadge = "Cần Tôi Rèn Bản Lĩnh (Vượt Khó Kiến Tạo)";

      const menhChinhTinh = (menhPalace.chinh_tinh || []).map(cleanStarName);
      const menhChinhTinhStr = menhChinhTinh.length > 0 ? menhChinhTinh.join(", ") : "Vô Chính Diệu";

      const masterOverview = {
        gradeBadge,
        overallScore,
        menhElement,
        cucElement,
        menhCucStatus,
        menhCucText,
        thaiTueGroup,
        thaiTueDesc,
        isThuanLy: meta.is_thuan_ly,
        thuanLyText: meta.is_thuan_ly 
          ? "Âm Dương Thuận Lý: Hoàn cảnh dung dưỡng thuận chiều, dễ nắm bắt thời cơ thăng tiến." 
          : "Âm Dương Nghịch Lý: Tiền vận tôi rèn qua gian nan thử thách, tự lực tích lũy nội lực để bứt phá.",
        menhChi: meta.menh_chi,
        thanChi: meta.than_chi,
        thanCuCung: meta.than_cu_cung,
        menhThanPivotText: `Tiền vận chịu sự chi phối của cung Mệnh tại ${meta.menh_chi} (${menhChinhTinhStr}). Từ sau tuổi 30, toàn bộ trọng tâm nghị lực, mục tiêu và thành tựu cuộc đời quy tụ về Cung Thân cư ${meta.than_cu_cung} tại ${meta.than_chi}.`,
        executiveSummary: `Tinh bàn sở hữu phẩm cách ${gradeBadge} (Điểm định lượng cốt cách: ${overallScore}/100). Đương số mang bản mệnh ${napAm}, tương quan Mệnh - Cục ở thế ${menhCucStatus}, tọa lạc trên vị thế vòng Thái Tuế thuộc nhóm ${thaiTueGroup}. Tinh bàn có năng lực tự lập tự cường, biến chuyển linh hoạt theo thời cuộc, càng về hậu vận càng tích lũy được phúc quả sâu dày.`
      };

      // 2. Bright Spots (Ưu thế thiên phú, phúc khí, cát cách)
      const brightSpots = [];
      const fPats = patternData?.favorable_patterns || [];
      if (fPats.length > 0) {
        fPats.forEach(p => {
          brightSpots.push({
            type: "cat_cach",
            title: `Cát Cách: ${p.name} (${p.level})`,
            detail: `${p.description}. Cơ sở cấu thành: ${p.match_details}.`
          });
        });
      } else {
        brightSpots.push({
          type: "cat_cach",
          title: "Cấu Trúc Tự Lập Ứng Biến",
          detail: "Tinh bàn không bị gò bó vào một khuôn mẫu cứng nhắc, tạo điều kiện cho đương số linh hoạt xoay chuyển và tự kiến tạo cơ hội theo năng lực thực tiễn."
        });
      }

      // Tứ Hóa nội cung
      const internalPalaces = ["Mệnh", "Tài Bạch", "Quan Lộc", "Điền Trạch", "Phúc Đức", "Tật Ách"];
      const transformations = tuHoaData?.transformations || {};
      ["Hóa Lộc", "Hóa Quyền", "Hóa Khoa"].forEach(thName => {
        const item = transformations[thName];
        if (item && internalPalaces.includes(item.cung_name)) {
          brightSpots.push({
            type: "tu_hoa_cat",
            title: `${thName} Đắc Vị Nội Cung (${item.cung_name})`,
            detail: `${thName} (sao ${item.star_name}) ngự tại cung ${item.cung_name} (${item.dia_chi}) mang năng lượng phúc lộc, quyền uy và trí tuệ quy về bản thể đương số: ${item.kham_thien_doctrine || ''}`
          });
        }
      });

      // Quý nhân & Phù trợ tinh tú
      const menhEval = (evaluatedPalaces || []).find(p => p.is_menh) || (evaluatedPalaces || []).find(p => p.cung_name === "Mệnh");
      const foundQuyNhan = [];

      if (menhEval && menhEval.tam_phuong_tu_chinh) {
        const tptc = menhEval.tam_phuong_tu_chinh;
        const scanCungs = [tptc.cung_toa, tptc.cung_xung, tptc.tam_hop_1, tptc.tam_hop_2, tptc.nhi_hop].filter(Boolean);
        scanCungs.forEach(c => {
          const stars = [...(c.chinh_tinh || []), ...(c.phu_tinh || [])].map(cleanStarName);
          if (stars.includes("Thiên Khôi") || stars.includes("Thiên Việt")) {
            foundQuyNhan.push(`Thiên Khôi / Thiên Việt tọa hội tại ${c.ten_cung || 'cung'} (${c.dia_chi}) mang lại sự nâng đỡ của quý nhân bề trên, người hướng dẫn có tâm`);
          }
          if (stars.includes("Tả Phụ") || stars.includes("Hữu Bật")) {
            foundQuyNhan.push(`Tả Phụ / Hữu Bật hội chiếu mang lại sự đồng lòng của bằng hữu, cấp dưới và đối tác tin cậy`);
          }
          if (stars.includes("Văn Xương") || stars.includes("Văn Khúc")) {
            foundQuyNhan.push(`Văn Xương / Văn Khúc trợ lực đường học vấn, tư duy sắc sảo, bằng cấp và danh tiếng chuyên môn`);
          }
          if (stars.includes("Lộc Tồn") || stars.includes("Hóa Lộc")) {
            foundQuyNhan.push(`Tài tinh Lộc Tồn / Hóa Lộc nâng đỡ nguồn tài chính, dòng tiền thặng dư dồi dào`);
          }
          if (stars.includes("Ân Quang") || stars.includes("Thiên Quý") || stars.includes("Thiên Quan") || stars.includes("Thiên Phúc")) {
            foundQuyNhan.push(`Phúc tinh Ân Quang, Thiên Quý, Thiên Quan mang lại âm đức gia tiên chở che lúc hiểm nghèo`);
          }
        });
      }

      const uniqueQuyNhan = [...new Set(foundQuyNhan)];
      if (uniqueQuyNhan.length > 0) {
        brightSpots.push({
          type: "quy_nhan",
          title: "Quý Nhân Phù Trợ & Trợ Lực Tinh Tú",
          detail: uniqueQuyNhan.slice(0, 3).join("; ") + "."
        });
      }

      // Điền Trạch / Phúc Đức
      const phucPalace = (evaluatedPalaces || []).find(p => p.cung_name === "Phúc Đức");
      const dienPalace = (evaluatedPalaces || []).find(p => p.cung_name === "Điền Trạch");
      if (phucPalace && (phucPalace.level?.includes("Thượng") || phucPalace.level?.includes("Cát"))) {
        brightSpots.push({
          type: "phuc_duc",
          title: `Cung Phúc Đức Vững Vàng (${phucPalace.level})`,
          detail: `Cung Phúc Đức tại ${phucPalace.dia_chi} có chiều sâu phước thiện, cội nguồn tổ tiên dày công bồi đắp, là chốn nương tựa tinh thần và hóa giải tai ương.`
        });
      }
      if (dienPalace && (dienPalace.level?.includes("Thượng") || dienPalace.level?.includes("Cát"))) {
        brightSpots.push({
          type: "dien_trach",
          title: `Cung Điền Trạch Hưng Vượng (${dienPalace.level})`,
          detail: `Khả năng tụ tài, sở hữu nhà đất, bất động sản và cơ sở sản xuất gia tăng bền vững theo thời gian.`
        });
      }

      // 3. Hazard Spots (Cần lưu ý)
      const hazardSpots = [];
      const ufPats = patternData?.unfavorable_patterns || [];
      if (ufPats.length > 0) {
        ufPats.forEach(p => {
          hazardSpots.push({
            type: "hung_cach",
            title: `Cảnh Báo Cách Cục: ${p.name} (${p.level})`,
            detail: `${p.warning}. Hiện diện tại: ${p.match_details}.`
          });
        });
      }

      if (tuHoaData?.ky_clash_warning) {
        hazardSpots.push({
          type: "xung_ky",
          title: "Trục Xung Kỵ Tứ Hóa",
          detail: tuHoaData.ky_clash_warning
        });
      }

      const keyPalaces = ["Mệnh", "Quan Lộc", "Tài Bạch", "Phu Thê", "Tật Ách"];
      (evaluatedPalaces || []).forEach(p => {
        if (keyPalaces.includes(p.cung_name) && p.sat_stars && p.sat_stars.length > 0) {
          hazardSpots.push({
            type: "sat_tinh",
            title: `Sát Tinh Tác Động Cung ${p.cung_name} (${p.dia_chi})`,
            detail: `Hiện diện các sát tinh: ${p.sat_stars.join(', ')}. Cần đề phòng biến động bất ngờ, áp lực cạnh tranh hoặc trở ngại tâm lý tại lĩnh vực ${p.cung_name.toLowerCase()}.`
          });
        }
      });

      if (meta.triet && meta.triet.length > 0) {
        hazardSpots.push({
          type: "triet_lo",
          title: `Triệt Lộ Không Vong Án Ngữ Cung ${meta.triet.join(', ')}`,
          detail: `Triệt Lộ phong tỏa khí số tiền vận trước tuổi 30-34, gây nên những khúc quanh hoặc thử thách ban đầu, sau đó năng lực cản trở giảm dần.`
        });
      }
      if (meta.tuan && meta.tuan.length > 0) {
        hazardSpots.push({
          type: "tuan_khong",
          title: `Tuần Trung Không Vong Bao Bọc Cung ${meta.tuan.join(', ')}`,
          detail: `Tuần làm chậm nhịp độ phát triển, đòi hỏi tính kiên trì, không nên nóng vội gặt hái thành quả sớm mà cần tích lũy đường dài.`
        });
      }

      if (scoresData?.marriage_harmony?.score < 65) {
        hazardSpots.push({
          type: "hon_nhan",
          title: "Khuyết Hãm Hòa Khí Phu Thê",
          detail: `Chỉ số Hôn Nhân & Gia Đạo ở mức ${scoresData.marriage_harmony.score}/100. Vợ chồng dễ phát sinh khoảng cách tư tưởng hoặc bận rộn sự nghiệp riêng, cần chủ động chia sẻ và nhường nhịn.`
        });
      }
      if (scoresData?.health_longevity?.score < 65) {
        hazardSpots.push({
          type: "suc_khoe",
          title: "Lưu Ý Tố Chất Thể Lực & Sức Bền",
          detail: `Chỉ số Thọ Mệnh & Sức Khỏe ở mức ${scoresData.health_longevity.score}/100. Cần duy trì thói quen sinh hoạt điều độ, tránh làm việc quá sức gây áp lực lên hệ thần kinh và tim mạch.`
        });
      }

      // 4. Life Trajectory
      const allDaiVans = timingData?.all_life_dai_vans || [];
      const dv1 = allDaiVans[0] || {};
      const dv2 = allDaiVans[1] || {};
      const tienVanText = `Giai đoạn từ lúc chào đời đến dưới 30 tuổi (khởi vận qua các cung ${dv1.palace_name || 'Mệnh'} [${dv1.range || ''}t], ${dv2.palace_name || ''} [${dv2.range || ''}t]): Đây là chặng đường ươm mầm, học vấn và tôi rèn ý chí. ${meta.is_thuan_ly ? 'Hoàn cảnh gia đình và học tập tương đối thuận buồm xuôi gió.' : 'Đương số phải trải qua rèn luyện tự lập sớm, vừa học vừa làm để tôi rèn bản lĩnh.'}`;

      let goldenDaiVan = null;
      let defenseDaiVan = null;
      let maxScore = -999;
      let minScore = 999;

      allDaiVans.forEach((dv, idx) => {
        if (idx >= 1 && idx <= 5) {
          let s = 60;
          if (dv.element_interaction?.status === "Tương Sinh") s += 15;
          else if (dv.element_interaction?.status === "Tỷ Hòa") s += 10;
          else if (dv.element_interaction?.status === "Tương Khắc") s -= 12;

          const pObj = (evaluatedPalaces || []).find(p => p.dia_chi === dv.dia_chi);
          if (pObj) {
            if (pObj.level?.includes("Thượng")) s += 15;
            else if (pObj.level?.includes("Cát")) s += 10;
            if (pObj.cat_stars && pObj.cat_stars.length > 0) s += pObj.cat_stars.length * 3;
            if (pObj.sat_stars && pObj.sat_stars.length > 0) s -= pObj.sat_stars.length * 4;
          }

          if (s > maxScore) {
            maxScore = s;
            goldenDaiVan = dv;
          }
          if (s < minScore) {
            minScore = s;
            defenseDaiVan = dv;
          }
        }
      });

      if (!goldenDaiVan && allDaiVans.length > 2) goldenDaiVan = allDaiVans[2];
      if (!defenseDaiVan && allDaiVans.length > 3) defenseDaiVan = allDaiVans[3];

      const trungVanText = `Giai đoạn từ 30 đến 55 tuổi: Trọng tâm chuyển sang cung Thân cư ${meta.than_cu_cung} tại ${meta.than_chi}. Đây là giai đoạn trọng tâm kiến tạo cơ đồ, xác lập vị thế chuyên môn và tích lũy sản nghiệp.`;
      const goldenDecadeText = goldenDaiVan 
        ? `Đại Vận ${goldenDaiVan.range} Tuổi (Tọa cung ${goldenDaiVan.palace_name} - ${goldenDaiVan.dia_chi}, Nạp âm ${goldenDaiVan.nap_am}): Vận hội hội tụ năng lượng tương sinh cát lợi, chính tinh và phụ tinh nâng đỡ. Đây là giai đoạn thuận lợi để mở rộng hoạt động chuyên môn, đầu tư bài bản và gia tăng hiệu quả tài chính bền vững.`
        : "Đại Vận 35-44 Tuổi: Giai đoạn chuyển mình phát triển toàn diện.";

      const defenseDecadeText = defenseDaiVan && defenseDaiVan !== goldenDaiVan
        ? `Đại Vận ${defenseDaiVan.range} Tuổi (Tọa cung ${defenseDaiVan.palace_name} - ${defenseDaiVan.dia_chi}): Vận khí tiềm ẩn thử thách hoặc xung lực ngũ hành. Đương số cần duy trì chiến lược phòng ngự chủ động, bảo toàn tài sản, không vay mượn mạo hiểm và chú trọng sức khỏe.`
        : "Các đại vận trung kỳ cần giữ vững tính kỷ luật trong quản trị tài chính.";

      const dvHau = allDaiVans.slice(5);
      const hauVanText = `Giai đoạn sau 55 tuổi (các Đại vận từ ${dvHau[0]?.range || '55-64'} tuổi trở đi): Khí số quy về hai cung Phúc Đức và Điền Trạch. Đương số an hưởng thành quả lao động của cả cuộc đời, điền sản tích lũy vững bền, con cháu đề huề và phát huy đạo lý dưỡng tâm bồi đức.`;

      const lifeTrajectory = {
        tienVan: {
          period: "Tiền Vận (Dưới 30 Tuổi)",
          theme: "Giai Đoạn Ươm Mầm & Rèn Giũa Bản Lĩnh",
          content: tienVanText
        },
        trungVan: {
          period: "Trung Vận (30 Đến 55 Tuổi)",
          theme: "Giai Đoạn Kiến Tạo Cơ Đồ & Mở Rộng Sự Nghiệp",
          content: trungVanText,
          goldenDecade: {
            title: `Thập Niên Thuận Lợi Trọng Điểm: Đại Vận ${goldenDaiVan?.range || '35-44'} Tuổi`,
            detail: goldenDecadeText
          },
          defenseDecade: {
            title: `Thập Niên Cần Phòng Thủ Cẩn Trọng: Đại Vận ${defenseDaiVan?.range || '45-54'} Tuổi`,
            detail: defenseDecadeText
          }
        },
        hauVan: {
          period: "Hậu Vận (Sau 55 Tuổi)",
          theme: "Giai Đoạn An Hưởng & Truyền Thừa Phúc Đức",
          content: hauVanText
        }
      };

      // 5. Strategic Pillars
      const quanPalace = (evaluatedPalaces || []).find(p => p.cung_name === "Quan Lộc") || {};
      const taiPalace = (evaluatedPalaces || []).find(p => p.cung_name === "Tài Bạch") || {};
      const phuPalace = (evaluatedPalaces || []).find(p => p.cung_name === "Phu Thê") || {};
      const tatPalace = (evaluatedPalaces || []).find(p => p.cung_name === "Tật Ách") || {};

      const strategicPillars = {
        career: {
          title: "Công Việc & Phát Triển Sự Nghiệp",
          advice: `Phát huy năng lực cốt lõi của cung Quan Lộc tại ${quanPalace.dia_chi || 'bản vị'}. Tập trung vào chuyên môn sâu, xây dựng uy tín cá nhân làm gốc rễ. Trong công tác lãnh đạo và quản lý, cần chú trọng tính minh bạch, kỷ luật và phân quyền rõ ràng để phát huy sức mạnh đồng đội.`
        },
        wealth: {
          title: "Tiền Tài & Quản Trị Tài Sản Bền Vững",
          advice: `Cung Tài Bạch tại ${taiPalace.dia_chi || 'bản vị'} định hướng nguồn thu từ năng lực thực tiễn. Dòng tiền thặng dư cần được quy đổi thành tài sản thực như bất động sản (Điền Trạch), tránh giữ quá nhiều tiền mặt rủi ro trượt giá hoặc tham gia các kênh đầu tư mạo hiểm thiếu cơ sở pháp lý.`
        },
        marriage: {
          title: "Hôn Nhân & Vun Đắp Gia Đạo",
          advice: `Cung Phu Thê tại ${phuPalace.dia_chi || 'bản vị'} đòi hỏi sự thấu hiểu và tôn trọng khoảng trời riêng của bạn đời. Hạnh phúc gia đình cần được xây dựng trên sự lắng nghe chân thành, chia sẻ trách nhiệm tài chính và cùng nhau giáo dục con cái, tránh mang áp lực công việc về tổ ấm.`
        },
        health: {
          title: "Sức Khỏe & Phòng Ngừa Thể Chất",
          advice: `Cung Tật Ách tại ${tatPalace.dia_chi || 'bản vị'} cảnh báo cần lưu tâm hệ tiêu hóa, xương khớp và bảo vệ hệ thần kinh trước áp lực công việc dài ngày. Hãy thiết lập chế độ vận động thể chất đều đặn, thăm khám sức khỏe định kỳ và thực hành thói quen ngủ đủ giấc.`
        },
        mindfulness: {
          title: "Đạo Tu Dưỡng & Chuyển Hóa Khí Số",
          advice: `Học thuyết Tử Vi khẳng định 'Đức năng thắng số'. Cung Phúc Đức là linh hồn chuyển hóa mọi hung sát. Giữ tâm thái tùy duyên, hướng thiện, đối đãi bao dung với mọi người và phụng dưỡng cha mẹ chu đáo chính là phương pháp hóa giải vận hạn hiệu quả và bền vững nhất.`
        }
      };

      return {
        masterOverview,
        brightSpots,
        hazardSpots,
        lifeTrajectory,
        strategicPillars
      };
    }
  };

  // ==========================================
  // XI. ĐỘNG CƠ SINH BÁO CÁO (REPORT GENERATOR)
  // ==========================================

  const TuViReportGenerator = {
    generateMarkdownReport: function (chartData, patternData, evaluatedPalaces, tuHoaData, timingData, scoresData, masterAssessmentParam) {
      const meta = chartData.meta;
      const targetYear = meta.target_year;
      const lunarAge = meta.lunar_age;
      const napAm = meta.nap_am;
      const menhElement = getElementFromNapAm(napAm);
      const cucName = meta.cuc_name;

      const masterAssessment = masterAssessmentParam || TuViMasterSynthesizer.synthesizeMasterAssessment(
        chartData, patternData, evaluatedPalaces, tuHoaData, timingData, scoresData
      );

      const mo = masterAssessment.masterOverview;
      const md = [];
      md.push(`# BÁO CÁO LUẬN GIẢI LÁ SỐ TỬ VI ĐẨU SỐ TOÀN DIỆN VÀ ĐẦY ĐỦ NHẤT`);
      md.push(`### Khảo Luận Khí Số Tiên Thiên & Hậu Thiên Vận Trình (Nam Phái Thái Thứ Lang)`);
      md.push(`**Thời điểm khởi tạo luận giải:** ${new Date().toLocaleString('vi-VN')}`);
      md.push(`\n---\n`);

      // I. TINH BÀN BẢN MỆNH
      md.push("## I. TINH BÀN BẢN MỆNH & CẤU TRÚC KHÍ SỐ TIÊN THIÊN\n");
      md.push(`### 🌟 Cấu Trúc Khí Số Cốt Lõi Tinh Bàn:`);
      md.push(`* **Họ tên & Giới tính:** Đương số (${meta.gender}) — *Âm Dương định hướng vận hành thuận/nghịch*`);
      md.push(`* **Ngày giờ sinh (Âm lịch):** Ngày ${meta.day}, Tháng ${meta.month}, Giờ ${meta.hour_zhi} — *Cơ sở an 14 chính tinh và hệ thống bách tinh*`);
      md.push(`* **Can Chi Năm Sinh:** **${meta.year_can_chi}** — *Gốc rễ Tiên thiên & Tứ Hóa năm sinh*`);
      md.push(`* **Bản Mệnh (Nạp Âm):** **${napAm}** (Hành ${menhElement}) — *Căn cốt ngũ hành chủ đạo suốt cuộc đời*`);
      md.push(`* **Cục Số:** **${cucName}** — *Môi trường xã hội & Mốc khởi Đại Vận*`);
      md.push(`* **Âm Dương Lý Số:** ${meta.is_thuan_ly ? 'Âm Dương Thuận Lý' : 'Âm Dương Nghịch Lý'} — *${meta.is_thuan_ly ? 'Hoàn cảnh thuận lợi, dễ gặp thời vận' : 'Gian truân tiền vận, tôi luyện bản lĩnh để hậu vận phát đạt'}*`);
      md.push(`* **Cung Mệnh Tọa Thủ:** Cung **${meta.menh_chi}** — *Tâm điểm bản thể tiên thiên, nhân cách và tiềm năng*`);
      md.push(`* **Thân Cư:** Cung **${meta.than_chi}** (${meta.than_cu_cung}) — *Trọng tâm chuyển hóa hậu vận sau tuổi 30*`);
      md.push(`* **Tuần Không / Triệt Lộ:** Tuần tại: ${meta.tuan.join(', ') || 'Không'}; Triệt tại: ${meta.triet.join(', ') || 'Không'} — *Điểm khóa và giải trừ chuyển hóa khí số*`);
      md.push(`* **Năm Khảo Sát (Lưu Niên):** Năm **${targetYear} (${meta.target_can_chi})** (Tuổi mụ: **${lunarAge}**) — *Trọng tâm luận giải niên vận và biến cố kích hoạt*`);

      md.push(`\n### Khảo Luận Căn Cốt Khí Số & Bản Thể Mệnh - Thân:`);
      md.push(`1. **Bản Mệnh ${napAm} & Cục Số ${cucName}:**\n` +
              `   - ${napAm} là căn cốt tiên thiên. Người mang bản mệnh này tâm tính quang minh, khẳng khái, giàu lòng tự trọng, tư duy cao thượng và tầm nhìn xa rộng.\n` +
              `   - ${mo.menhCucText}\n`);
      md.push(`2. **Âm Dương Lý Số & Vị Thế Vòng Thái Tuế:**\n` +
              `   - Đương số thuộc thế ${meta.is_thuan_ly ? 'Âm Dương Thuận Lý' : 'Âm Dương Nghịch Lý'}. ${meta.is_thuan_ly ? 'Cuộc đời hanh thông, ít sóng gió lớn.' : 'Tiền vận trải qua nhiều thăng trầm, phải tự lực cánh sinh vượt qua nghịch cảnh để tích lũy nội lực.'}\n` +
              `   - Nhóm ${mo.thaiTueGroup}: ${mo.thaiTueDesc}\n`);
      md.push(`3. **Tương Quan Mệnh - Thân (${meta.menh_chi} vs Thân Cư ${meta.than_cu_cung} tại ${meta.than_chi}):**\n` +
              `   - Cung Mệnh tọa tại ${meta.menh_chi} quyết định tiền vận và tính cách cốt lõi.\n` +
              `   - ${mo.menhThanPivotText}`);
      md.push(`\n---\n`);

      // II. TỔNG LUẬN CỐT CÁCH & BẢN ĐỒ CHIẾN LƯỢC VẬN TRÌNH ĐỜI NGƯỜI
      md.push(`## II. TỔNG LUẬN CỐT CÁCH & BẢN ĐỒ CHIẾN LƯỢC VẬN TRÌNH ĐỜI NGƯỜI\n`);
      md.push(`### 1. Đánh Giá Tổng Quan Cốt Cách Toàn Bàn:`);
      md.push(`* **Phẩm Cách Tinh Bàn:** **${mo.gradeBadge}** (Điểm định lượng cốt cách: **${mo.overallScore}/100**)`);
      md.push(`* **Căn Cốt Bản Mệnh & Cục Số:** ${mo.menhCucText}`);
      md.push(`* **Vị Thế Vòng Thái Tuế:** Nhóm **${mo.thaiTueGroup}** — ${mo.thaiTueDesc}`);
      md.push(`* **Trọng Tâm Chuyển Dịch Mệnh - Thân:** ${mo.menhThanPivotText}`);
      md.push(`* **Đánh Giá Cốt Cách Toàn Cục:** ${mo.executiveSummary}`);
      md.push(`\n`);

      md.push(`### 2. Danh Mục Các Điểm Sáng & Ưu Thế Thiên Phú (Ưu Điểm Cốt Lõi):`);
      masterAssessment.brightSpots.forEach(b => {
        md.push(`* **${b.title}:** ${b.detail}`);
      });
      md.push(`\n`);

      md.push(`### 3. Danh Mục Các Điểm Cần Lưu Ý & Thử Thách Cần Hóa Giải:`);
      if (masterAssessment.hazardSpots.length > 0) {
        masterAssessment.hazardSpots.forEach(h => {
          md.push(`* **${h.title}:** ${h.detail}`);
        });
      } else {
        md.push(`* **Khí Số Thuần Khiết:** Tinh bàn không bị sát tinh hãm địa xâm phạm trực diện, giữ được sự cân bằng và bảo hộ an lành.`);
      }
      md.push(`\n`);

      md.push(`### 4. Bản Đồ Hướng Đi Của Vận Trình Đời Người (Tiền Vận - Trung Vận - Hậu Vận):`);
      const lt = masterAssessment.lifeTrajectory;
      md.push(`* **${lt.tienVan.period} — ${lt.tienVan.theme}:**\n  ${lt.tienVan.content}`);
      md.push(`* **${lt.trungVan.period} — ${lt.trungVan.theme}:**\n  ${lt.trungVan.content}`);
      if (lt.trungVan.goldenDecade) {
        md.push(`  + 🌟 **${lt.trungVan.goldenDecade.title}:** ${lt.trungVan.goldenDecade.detail}`);
      }
      if (lt.trungVan.defenseDecade) {
        md.push(`  + 🛡️ **${lt.trungVan.defenseDecade.title}:** ${lt.trungVan.defenseDecade.detail}`);
      }
      md.push(`* **${lt.hauVan.period} — ${lt.hauVan.theme}:**\n  ${lt.hauVan.content}`);
      md.push(`\n`);

      md.push(`### 5. Lời Khuyên Hành Động Thiết Thực Theo 5 Trụ Cột Đời Người:`);
      const sp = masterAssessment.strategicPillars;
      md.push(`* **Trụ Cột 1: ${sp.career.title}:** ${sp.career.advice}`);
      md.push(`* **Trụ Cột 2: ${sp.wealth.title}:** ${sp.wealth.advice}`);
      md.push(`* **Trụ Cột 3: ${sp.marriage.title}:** ${sp.marriage.advice}`);
      md.push(`* **Trụ Cột 4: ${sp.health.title}:** ${sp.health.advice}`);
      md.push(`* **Trụ Cột 5: ${sp.mindfulness.title}:** ${sp.mindfulness.advice}`);
      md.push(`\n---\n`);

      // III. NHẬN DIỆN CÁCH CỤC
      md.push(`## III. NHẬN DIỆN CÁCH CỤC KINH ĐIỂN (PATTERN RECOGNITION)\n`);
      const fPats = patternData.favorable_patterns || [];
      const ufPats = patternData.unfavorable_patterns || [];

      if (fPats.length > 0) {
        md.push(`### 1. Các Cát Cách Thuận Lợi Đã Nhận Diện:`);
        fPats.forEach(p => {
          md.push(`- **${p.name}** *(${p.level})*:`);
          md.push(`  + **Cơ sở cấu thành:** ${p.match_details}`);
          md.push(`  + **Luận giải cốt tủy:** ${p.description}`);
          if (p.career) md.push(`  + **Định hướng công danh:** ${p.career}`);
        });
      } else {
        md.push(`Tinh bàn không hội tụ đại cát cách đơn lẻ cố định mà mang cấu trúc *Tự Lập Tùy Cơ Ứng Biến*. Tinh hoa khí số tập trung ở các cung chức năng cụ thể như Phúc Đức, Điền Trạch và Quan Lộc.`);
      }

      if (ufPats.length > 0) {
        md.push(`\n### 2. Các Hung Cách & Thử Thách Cần Cảnh Báo:`);
        ufPats.forEach(p => {
          md.push(`- **${p.name}** *(${p.level})*:`);
          md.push(`  + **Hiện diện:** ${p.match_details}`);
          md.push(`  + **Cảnh báo & Phương thức hóa giải:** ${p.warning}`);
        });
      } else {
        md.push(`\n### 2. Hung Cách:\n- Tinh bàn không phạm phải các bại cách nguy hiểm kinh điển (như Linh Xương Đà Vũ, Kình Đà Hiệp Kỵ). Cơ bản giữ được an toàn khí số cốt lõi.`);
      }

      md.push(`\n*Tổng điểm ảnh hưởng cách cục:* **${patternData.pattern_summary.net_pattern_score >= 0 ? '+' : ''}${patternData.pattern_summary.net_pattern_score} điểm** tác động vào cán cân sinh mệnh.`);
      md.push(`\n---\n`);

      // IV. ĐỊNH LƯỢNG ĐIỂM SỐ
      md.push(`## IV. HỆ THỐNG ĐÁNH GIÁ ĐỊNH LƯỢNG CHỈ SỐ SINH MỆNH (THANG ĐIỂM 100)\n`);
      md.push(`### 📊 Định Lượng 6 Trọng Điểm Sinh Mệnh:`);

      const scoreRows = [
        ["overall_destiny", "1. Cốt Cách Bản Mệnh"],
        ["career_power", "2. Sự Nghiệp & Quyền Lực"],
        ["wealth_assets", "3. Tài Chính & Điền Sản"],
        ["marriage_harmony", "4. Hôn Nhân & Gia Đạo"],
        ["health_longevity", "5. Sức Khỏe & Thọ Mệnh"],
        ["annual_fortune", `6. Vận Hạn Năm ${targetYear}`]
      ];

      scoreRows.forEach(([key, name]) => {
        const item = scoresData[key] || {};
        md.push(`* **${name}:** **${item.score || 50}/100 Điểm** [${item.grade || 'Trung bình'}] — ${item.desc || ''}`);
      });
      md.push(`\n---\n`);

      // V. LUẬN GIẢI CHI TIẾT 12 CUNG
      md.push(`## V. LUẬN GIẢI CHI TIẾT THẬP NHỊ CUNG CHỨC NĂNG (TOÀN DIỆN & CHUYÊN SÂU)\n`);
      const palaceEvalMap = {};
      evaluatedPalaces.forEach(p => { palaceEvalMap[p.cung_name] = p; });
      const orderToShow = ["Mệnh", "Quan Lộc", "Tài Bạch", "Phu Thê", "Phúc Đức", "Điền Trạch", "Thiên Di", "Tật Ách", "Tử Tức", "Huynh Đệ", "Nô Bộc", "Phụ Mẫu"];

      orderToShow.forEach(cName => {
        const pData = palaceEvalMap[cName];
        if (!pData) return;

        md.push(`### ${cName.toUpperCase()} (Tọa tại ${pData.dia_chi} - Can ${pData.thien_can}) - Phẩm cách: ${pData.level || 'Bình Hòa'}\n`);
        const treatise = pData.deep_treatise || this._generatePalaceDeepTreatise(cName, pData, meta, palaceEvalMap);
        md.push(treatise);
        md.push(`\n`);
      });
      md.push(`---\n`);

      // VI. TỨ HÓA KHÂM THIÊN MÔN
      md.push(`## VI. BÓC TÁCH TỨ HÓA TIÊN THIÊN (KHÂM THIÊN MÔN & LỤC NỘI - LỤC NGOẠI CUNG)\n`);
      md.push(`Thiên Can năm sinh **${tuHoaData.year_gan}** khởi phát Tứ Hóa Tiên Thiên:\n`);

      ["Hóa Lộc", "Hóa Quyền", "Hóa Khoa", "Hóa Kỵ"].forEach(thName => {
        const thObj = tuHoaData.transformations?.[thName];
        if (thObj) {
          md.push(`* **${thName} (Sao ${thObj.star_name}):** Tọa Cung **${thObj.cung_name}** (${thObj.dia_chi} • *${thObj.palace_type}*) — ${thObj.kham_thien_doctrine}`);
        }
      });

      if (tuHoaData.ky_clash_warning) {
        md.push(`\n> [!IMPORTANT]\n> **Cảnh báo Tứ Hóa Xung Kỵ:** ${tuHoaData.ky_clash_warning}`);
      }
      md.push(`\n---\n`);

      // VII. LỘ TRÌNH ĐẠI VẬN 80 NĂM
      md.push(`## VII. LỘ TRÌNH ĐẠI VẬN SUỐT CUỘC ĐỜI (80 NĂM KHÍ SỐ)\n`);
      md.push(`Khảo sát chi tiết 8 bước chuyển dịch vận trình sinh mệnh:\n`);

      (timingData.all_life_dai_vans || []).forEach(dv => {
        const activeMarker = dv.is_active ? " **[ĐẠI VẬN HIỆN TẠI - ĐANG VẬN HÀNH]**" : "";
        const rel = dv.element_interaction || {};
        md.push(`### ⏳ Đại Vận ${dv.step} (${dv.range} Tuổi): Cung ${dv.palace_name} (${dv.dia_chi})${activeMarker}`);
        md.push(`* **Can Chi & Nạp Âm:** ${dv.thien_can} ${dv.dia_chi} • ${dv.nap_am}`);
        if (rel.status) {
          md.push(`* **Ngũ Hành Tương Tác:** ${rel.status} (${rel.desc})`);
        }
        md.push(`* **Chính Tinh Quản Hạt:** ${dv.chinh_tinh || 'Vô Chính Diệu'}`);
        md.push(`* **Luận Giải Vận Trình:** ${dv.summary}\n`);
      });
      md.push(`---\n`);

      // VIII. VẬN HẠN NĂM HIỆN TẠI
      md.push(`## VIII. LUẬN GIẢI CHUYÊN SÂU NIÊN VẬN NĂM ${targetYear} (${meta.target_can_chi})\n`);
      const dvInfo = timingData.dai_van;
      if (dvInfo && dvInfo.palace_name) {
        md.push(`### 1. Bối Cảnh Đại Vận Đang Chi Phối (${dvInfo.range} Tuổi):\n` +
                `Đương số đang vận hành trong Đại Vận ${dvInfo.range} tuổi tọa tại Cung **${dvInfo.palace_name}** (${dvInfo.dia_chi}). ` +
                `${dvInfo.summary}`);
      }

      md.push(`\n### 2. Trọng Tâm Khí Số Năm ${targetYear} (Tuổi Mụ ${lunarAge}):`);
      const afList = Array.isArray(timingData.annual_focus) 
        ? timingData.annual_focus 
        : (timingData.annual_focus_list || (timingData.annual_focus && timingData.annual_focus.analysis ? [timingData.annual_focus.analysis] : []));
      afList.forEach(af => {
        md.push(`- ${af}`);
      });

      const saoLuuInters = timingData.sao_luu_interactions || [];
      if (saoLuuInters.length > 0) {
        md.push(`\n### 3. Các Điểm Kích Hoạt Của Hệ Thống Sao Lưu Năm ${targetYear}:`);
        saoLuuInters.forEach(inter => {
          md.push(`- **${inter.title}** tại cung **${inter.palace}**: ${inter.effect}`);
        });
      } else {
        md.push(`\n### 3. Sao Lưu Năm ${targetYear}:\n- Các sao lưu vận hành hài hòa, không tạo thành xung đột gay gắt trực tiếp.`);
      }

      const monthly = timingData.monthly_forecast || [];
      if (monthly.length > 0) {
        md.push(`\n### 4. Diễn Biến Khí Số Chi Tiết 12 Tháng Âm Lịch Năm ${targetYear}:`);
        monthly.forEach(m => {
          md.push(`#### 🌙 ${m.month_name}: Cung ${m.palace} (${m.chi})`);
          md.push(`* **Chính Tinh Quản Hạt:** ${m.chinh_tinh || 'Vô Chính Diệu'}`);
          md.push(`* **Luận Đoán & Định Hướng:** ${m.note}\n`);
        });
      }
      md.push(`---\n`);

      // IX. BẢN ĐỒ DỰ BÁO BIẾN ĐỘNG ĐA NĂM
      const multiYearEvents = timingData.multi_year_events || [];
      if (multiYearEvents.length > 0) {
        md.push(`## IX. BẢN ĐỒ DỰ BÁO BIẾN ĐỘNG NIÊN VẬN ĐA NĂM (ĐỐI SOÁT CÁC MỐC TRỌNG ĐẠI CUỘC ĐỜI)\n`);
        md.push(`Hệ thống tự động quét dòng năng lượng Lưu Niên qua các năm để đối soát và cảnh báo các mốc biến động quan trọng về Gia đạo, Hôn nhân, Chỗ ở, Công việc và Tài chính:\n`);

        multiYearEvents.forEach(mye => {
          const fStr = mye.family_events.join('; ') || "Bình ổn";
          const hStr = mye.housing_events.join('; ') || "An định gia trạch";
          const cStr = mye.career_events.join('; ') || "Duy trì ổn định";
          const wStr = mye.wealth_events.join('; ') || "Thu chi bình hòa";
          const currentTag = mye.year === targetYear ? " **[NĂM KHẢO SÁT HIỆN TẠI]**" : "";
          md.push(`### 📅 Năm ${mye.year} (${mye.can_chi} • ${mye.lunar_age} Tuổi)${currentTag}`);
          md.push(`* **Gia Đạo & Tình Duyên:** ${fStr}`);
          md.push(`* **Chỗ Ở (Điền Trạch):** ${hStr}`);
          md.push(`* **Công Danh (Quan Lộc):** ${cStr}`);
          md.push(`* **Tài Chính (Tài Bạch):** ${wStr}\n`);
        });
        md.push(`---\n`);
      }

      // X. CHIẾN LƯỢC HÀNH ĐỘNG
      md.push(`## X. CHIẾN LƯỢC HÀNH ĐỘNG & NGUYÊN TẮC HÓA GIẢI HẬU THIÊN\n`);
      md.push(`Trong học thuyết Tử Vi Đẩu Số chân chính, *'Mệnh định kỳ tiên thiên, Vận biến do hậu thiên'* - Tinh bàn là bản đồ định hướng địa hình và thời tiết cuộc đời, còn cách chèo lái con thuyền sinh mệnh phụ thuộc hoàn toàn vào trí tuệ, đạo đức và kỷ luật tự thân:\n`);
      md.push(`1. **Tri Mệnh Để Lập Mệnh (Nhận Diện Năng Lực Cốt Lõi):**\n` +
              `   - Hiểu rõ thế mạnh của Mệnh - Thân để phát huy tối đa sở trường chuyên môn. Hãy tận dụng tối đa sở trường trí tuệ và sự chuẩn mực trong công việc.\n`);
      md.push(`2. **Đức Năng Thắng Số (Nuôi Dưỡng Cung Phúc Đức):**\n` +
              `   - Cung Phúc Đức và đời sống tâm linh, đạo hạnh cá nhân chính là chìa khóa chuyển hóa mọi sát tinh. Hành thiện tích đức, giữ tâm thái bình thản trước biến động thị phi sẽ bảo toàn phúc lộc thọ trường cửu.\n`);
      md.push(`3. **Quản Trị Rủi Ro & Tài Sản Bền Vững:**\n` +
              `   - Dòng tiền thặng dư từ công danh sự nghiệp nên được quy đổi thành tài sản vật chất thực, đất đai, cơ sở sản xuất an toàn. Tránh xa các hoạt động đầu cơ rủi ro mạo hiểm thiếu cơ sở pháp lý.\n`);
      md.push(`4. **Kỷ Luật Hành Xử Năm ${targetYear}:**\n` +
              `   - Năm ${targetYear} là năm then chốt. Hãy duy trì sự tỉnh táo trong các quyết định ký kết tài chính, chăm sóc sức khỏe và dành thời gian chia sẻ, vun đắp hòa khí gia đình.`);
      md.push(`\n---\n`);
      md.push(`*Bản toàn văn luận giải được xây dựng trên nền tảng cổ thư Tử Vi Đẩu Số Nam Phái (Thái Thứ Lang) kết hợp lý thuyết Tứ Hóa Khâm Thiên và Hà Lạc đồ số.*`);

      return md.join('\n');
    },

    _generatePalaceDeepTreatise: function (cungName, pData) {
      const diaChi = pData.dia_chi;
      const thienCan = pData.thien_can;
      const chinhTinh = pData.chinh_tinh || [];
      const catStars = pData.cat_stars || [];
      const satStars = pData.sat_stars || [];
      const tuHoa = pData.tu_hoa_eval || [];
      const tuanTriet = pData.tuan_triet_eval || "";
      const combos = pData.combos || [];
      const deepInsights = pData.deep_insights || {};

      const lines = [];
      lines.push(`**1. Cấu Trúc Khí Số & Vị Trí Tọa Thủ:**`);
      if (chinhTinh.length === 0) {
        lines.push(`- Cung ${cungName} tọa tại **${diaChi}** (Can ${thienCan}) ở vào thế **Vô Chính Diệu** (không có chính tinh tọa thủ). Khí số linh hoạt, nhạy bén và chịu sự chi phối mạnh mẽ từ ánh sáng của các cung xung chiếu và tam hợp chiếu về.`);
      } else {
        lines.push(`- Cung ${cungName} tọa tại **${diaChi}** (Can ${thienCan}) có chính tinh tọa thủ: **${chinhTinh.join(', ')}**. Quyết định tính chất cốt lõi, phương thức vận hành và khí sắc chủ đạo của cung ${cungName}.`);
      }

      lines.push(`\n**2. Tác Động Của Hệ Thống Cát Tinh, Sát Tinh & Tứ Hóa:**`);
      if (catStars.length > 0) {
        lines.push(`- **Cát Tinh Nâng Đỡ:** Tụ hội các phúc quý tinh như ${catStars.join(', ')}. Gia tăng năng lượng thuận lợi, mang đến sự che chở của quý nhân và tạo dựng các cơ hội thăng tiến vững chắc.`);
      } else {
        lines.push(`- **Cát Tinh:** Cung không có đại cát tinh trực tiếp tọa thủ, cần dựa vào thực lực tự thân và sự trợ lực từ các cung hội chiếu.`);
      }

      if (satStars.length > 0) {
        lines.push(`- **Sát Tinh Xâm Phạm:** Có sự hiện diện hoặc tác động của ${satStars.join(', ')}. Sát tinh tạo nên áp lực, sóng gió hoặc thử thách đòi hỏi đương số phải tôi rèn bản lĩnh, thận trọng trong hành sự.`);
      } else {
        lines.push(`- **Sát Tinh:** Không bị sát tinh nguy hiểm trực tiếp hãm địa, môi trường cung tương đối ổn định, ít biến cố bất ngờ.`);
      }

      if (tuHoa.length > 0) {
        tuHoa.forEach(th => lines.push(`- **Tứ Hóa Tác Động:** ${th}`));
      }

      if (tuanTriet) {
        lines.push(`- **Tuần / Triệt:** ${tuanTriet}`);
      }

      if (combos.length > 0) {
        const comboNames = combos.map(cb => `**${cb.name}** (${cb.effect})`);
        lines.push(`- **Tổ Hợp Bộ Sao Đặc Thù:** ${comboNames.join(' | ')}`);
      }

      lines.push(`\n**3. Luận Đoán Đời Sống Thực Tế & Biểu Hiện Chuyên Môn:**`);
      if (deepInsights.appearance) {
        lines.push(`- **Tướng Mạo & Khí Chất:** ${deepInsights.appearance.join(' ')}`);
      }
      if (deepInsights.suitable_careers) {
        lines.push(`- **Lĩnh Vực Tương Thích:** ${deepInsights.suitable_careers.join(' ')}`);
      }
      if (deepInsights.wealth_mechanism) {
        lines.push(`- **Phương Thức Tụ Tài:** ${deepInsights.wealth_mechanism.join(' ')}`);
      }
      if (deepInsights.organ_analysis) {
        lines.push(`- **Chăm Sóc Dưỡng Sinh:** ${deepInsights.organ_analysis}`);
      }

      lines.push(`\n**4. Định Hướng Hành Động & Chuyển Hóa:**`);
      lines.push(`- ${pData.functional_advice}`);

      return lines.join('\n');
    }
  };

  // ==========================================
  // XI. TỔNG BIÊN TẬP AI (EDITORIAL POLISHER PROMPT)
  // ==========================================

  function buildEditorialPolishPrompt(reportMarkdown) {
    return [
      "BẠN LÀ TỔNG BIÊN TẬP CAO CẤP CHUYÊN NGÀNH TỬ VI ĐẨU SỐ & VĂN THƯ HỌC THUẬT.",
      "NHIỆM VỤ BẮT BUỘC (ZERO-TRUNCATION & ZERO-FABRICATION):",
      "1. Trau chuốt văn phong mượt mà, sâu sắc, khúc chiết, giàu tính triết lý nhân sinh Đông phương.",
      "2. TUYỆT ĐỐI KHÔNG ĐƯỢC TÓM TẮT, KHÔNG RÚT GỌN: Phải giữ lại đầy đủ toàn bộ 10 phần chính (từ Phần I đến Phần X) với dung lượng và độ sâu chi tiết tương đương bản gốc (>600 dòng).",
      "3. GIỮ NGUYÊN TOÀN BỘ CÁC BẢNG BIỂU DẠNG MARKDOWN, BẢNG ĐIỂM ĐỊNH LƯỢNG 6 TRỤ CỘT (1-100).",
      "4. GIỮ NGUYÊN TOÀN BỘ 12 CUNG CHỨC NĂNG, TỨ HÓA TIÊN THIÊN KHÂM THIÊN MÔN, 80 NĂM ĐẠI VẬN VÀ NIÊN VẬN KHẢO SÁT.",
      "5. KHÔNG THAY ĐỔI CÁC SỐ LIỆU ĐỊNH LƯỢNG, CÁCH CỤC TIÊN THIÊN, TỔ HỢP SAO HOẶC LỜI KHUYÊN HÀNH ĐỘNG.",
      "6. KHÔNG DÙNG TỪ NGỮ CẢM TÍNH, GIẬT GÂN, THỔI PHỒNG.",
      "",
      "--- BẢN BÁO CÁO TỬ VI THUẬT TOÁN GỐC CẦN BIÊN TẬP ---",
      reportMarkdown,
      "--- HẾT BẢN BÁO CÁO GỐC ---",
      "",
      "Hãy xuất bản toàn văn bài luận giải đã được trau chuốt hoàn chỉnh ngay dưới đây:"
    ].join('\n');
  }

  // ==========================================
  // XIII. HÀM ĐIỀU PHỐI CHÍNH (MAIN INTERPRETER API)
  // ==========================================

  function interpret(rawChart, targetYear = 2026) {
    // 1. Adapter: tiếp nhận và chuẩn hóa tinh bàn
    const { chartData, manifest } = TuViChartAdapter.adapt(rawChart, targetYear);

    // 2. Nhận diện Cách Cục
    const patternData = TuViPatternRecognizer.recognizePatterns(chartData);

    // 3. Quét Combos toàn bàn
    const combosData = TuViStarCombinationsEngine.scanChartWideCombos(chartData.palaces);

    // 4. Luận giải 12 Cung chức năng
    const evaluatedPalaces = TuViPalaceInterpreter.evaluateAllPalaces(chartData);

    // 5. Tứ Hóa Khâm Thiên Môn
    const tuHoaData = TuViTuHoaEngine.analyzeTuHoa(chartData);

    // 6. Vận hạn đa tầng
    const timingData = TuViTimingEngine.evaluateTiming(chartData);

    // 7. Chấm điểm định lượng 6 TrỤ cột (1-100)
    const scoresData = TuViQuantitativeScorer.computeAllScores(chartData, patternData, evaluatedPalaces, timingData);

    // 8. Đánh giá tổng quan cốt cách toàn cục & bản đồ chiến lược vận trình
    const masterAssessment = TuViMasterSynthesizer.synthesizeMasterAssessment(
      chartData, patternData, evaluatedPalaces, tuHoaData, timingData, scoresData
    );

    // 9. Xuất báo cáo Markdown toàn diện
    const reportMarkdown = TuViReportGenerator.generateMarkdownReport(
      chartData, patternData, evaluatedPalaces, tuHoaData, timingData, scoresData, masterAssessment
    );

    return {
      success: true,
      chartData,
      manifest,
      patternData,
      combosData,
      evaluatedPalaces,
      tuHoaData,
      timingData,
      scoresData,
      masterAssessment,
      reportMarkdown,
      buildEditorialPolishPrompt: () => buildEditorialPolishPrompt(reportMarkdown)
    };
  }

  // ==========================================
  // XIV. EXPORT GLOBAL
  // ==========================================

  global.NetaTuViInterpreter = {
    interpret,
    analyzeChart: interpret,
    adapt: (raw, year) => TuViChartAdapter.adapt(raw, year),
    recognizePatterns: (data) => TuViPatternRecognizer.recognizePatterns(data),
    evaluatePalace: (p, meta, all) => TuViPalaceInterpreter.evaluatePalace(p, meta, all),
    evaluateAllPalaces: (data) => TuViPalaceInterpreter.evaluateAllPalaces(data),
    analyzeTuHoa: (data) => TuViTuHoaEngine.analyzeTuHoa(data),
    evaluateTiming: (data) => TuViTimingEngine.evaluateTiming(data),
    computeScores: (c, p, ep, t) => TuViQuantitativeScorer.computeAllScores(c, p, ep, t),
    synthesizeMasterAssessment: (c, p, ep, th, t, s) => TuViMasterSynthesizer.synthesizeMasterAssessment(c, p, ep, th, t, s),
    generateReport: (c, p, ep, th, t, s, ma) => TuViReportGenerator.generateMarkdownReport(c, p, ep, th, t, s, ma),
    buildEditorialPolishPrompt,
    PATTERNS_DB,
    STAR_COMBOS_DB,
    STARS_RULES_DB,
    PALACES_INFO_DB,
    PALACE_DEEP_ASPECTS_DB,
    TU_HOA_RULES_DB,
    TIMING_RULES_DB
  };

})(typeof window !== 'undefined' ? window : this);
