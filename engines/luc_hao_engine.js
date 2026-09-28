/**
 * luc_hao_engine.js
 * ĐỘNG CƠ GIẢI TOÁN & LUẬN QUẺ KINH DỊCH LỤC HÀO THUẦN QUY TẮC (100% OFFLINE & ZERO-AI)
 * Phương Pháp Luận: Nguyễn Tuấn Cường (Nam Việt Phong Thủy)
 * Cổ thư chuẩn mực: Bốc Phệ Chính Tông (Vương Hồng Tự) & Tăng San Bốc Dịch (Dã Hạc Lão Nhân)
 * Hỗ trợ UMD (Node.js & Trình duyệt Web / Flutter WebView)
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LucHaoEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ==========================================
  // 1. HỆ THỐNG DỮ LIỆU CƠ BẢN (BÁT QUÁI & CAN CHI)
  // ==========================================

  const TRIGRAM_DEFS = {
    1: { id: 'Can', name: 'Càn', nature: 'Thiên', bits: [1, 1, 1], element: 'Kim', cung_element: 'Kim' },
    2: { id: 'Doai', name: 'Đoài', nature: 'Trạch', bits: [1, 1, 0], element: 'Kim', cung_element: 'Kim' },
    3: { id: 'Ly', name: 'Ly', nature: 'Hỏa', bits: [1, 0, 1], element: 'Hỏa', cung_element: 'Hỏa' },
    4: { id: 'Chan', name: 'Chấn', nature: 'Lôi', bits: [1, 0, 0], element: 'Mộc', cung_element: 'Mộc' },
    5: { id: 'Ton', name: 'Tốn', nature: 'Phong', bits: [0, 1, 1], element: 'Mộc', cung_element: 'Mộc' },
    6: { id: 'Kham', name: 'Khảm', nature: 'Thủy', bits: [0, 1, 0], element: 'Thủy', cung_element: 'Thủy' },
    7: { id: 'Can_M', name: 'Cấn', nature: 'Sơn', bits: [0, 0, 1], element: 'Thổ', cung_element: 'Thổ' },
    8: { id: 'Khon', name: 'Khôn', nature: 'Địa', bits: [0, 0, 0], element: 'Thổ', cung_element: 'Thổ' }
  };

  const BITS_TO_TRIGRAM_NUM = {};
  const NAME_TO_TRIGRAM_NUM = {};
  for (const [k, v] of Object.entries(TRIGRAM_DEFS)) {
    const key = v.bits.join('');
    BITS_TO_TRIGRAM_NUM[key] = parseInt(k, 10);
    NAME_TO_TRIGRAM_NUM[v.name] = parseInt(k, 10);
  }

  const HEXAGRAM_NAMES = {
    '1,1': "Thuần Càn", '1,2': "Thiên Trạch Lý", '1,3': "Thiên Hỏa Đồng Nhân", '1,4': "Thiên Lôi Vô Vọng",
    '1,5': "Thiên Phong Cấu", '1,6': "Thiên Thủy Tụng", '1,7': "Thiên Sơn Độn", '1,8': "Thiên Địa Bỉ",
    '2,1': "Trạch Thiên Quải", '2,2': "Thuần Đoài", '2,3': "Trạch Hỏa Cách", '2,4': "Trạch Lôi Tùy",
    '2,5': "Trạch Phong Đại Quá", '2,6': "Trạch Thủy Khốn", '2,7': "Trạch Sơn Hàm", '2,8': "Trạch Địa Tụy",
    '3,1': "Hỏa Thiên Đại Hữu", '3,2': "Hỏa Trạch Khuê", '3,3': "Thuần Ly", '3,4': "Hỏa Lôi Phệ Hạp",
    '3,5': "Hỏa Phong Đỉnh", '3,6': "Hỏa Thủy Vị Tế", '3,7': "Hỏa Sơn Lữ", '3,8': "Hỏa Địa Tấn",
    '4,1': "Lôi Thiên Đại Tráng", '4,2': "Lôi Trạch Quy Muội", '4,3': "Lôi Hỏa Phong", '4,4': "Thuần Chấn",
    '4,5': "Lôi Phong Hằng", '4,6': "Lôi Thủy Giải", '4,7': "Lôi Sơn Tiểu Quá", '4,8': "Lôi Địa Dự",
    '5,1': "Phong Thiên Tiểu Súc", '5,2': "Phong Trạch Trung Phu", '5,3': "Phong Hỏa Gia Nhân", '5,4': "Phong Lôi Ích",
    '5,5': "Thuần Tốn", '5,6': "Phong Thủy Hoán", '5,7': "Phong Sơn Tiệm", '5,8': "Phong Địa Quán",
    '6,1': "Thủy Thiên Nhu", '6,2': "Thủy Trạch Tiết", '6,3': "Thủy Hỏa Ký Tế", '6,4': "Thủy Lôi Truân",
    '6,5': "Thủy Phong Tỉnh", '6,6': "Thuần Khảm", '6,7': "Thủy Sơn Kiển", '6,8': "Thủy Địa Tỷ",
    '7,1': "Sơn Thiên Đại Súc", '7,2': "Sơn Trạch Tổn", '7,3': "Sơn Hỏa Bí", '7,4': "Sơn Lôi Di",
    '7,5': "Sơn Phong Cổ", '7,6': "Sơn Thủy Mông", '7,7': "Thuần Cấn", '7,8': "Sơn Địa Bác",
    '8,1': "Địa Thiên Thái", '8,2': "Địa Trạch Lâm", '8,3': "Địa Hỏa Minh Di", '8,4': "Địa Lôi Phục",
    '8,5': "Địa Phong Thăng", '8,6': "Địa Thủy Sư", '8,7': "Địa Sơn Khiêm", '8,8': "Thuần Khôn"
  };

  const BRANCH_DATA = {
    'Tý': { element: 'Thủy', polarity: 'Dương', order: 1 },
    'Sửu': { element: 'Thổ', polarity: 'Âm', order: 2 },
    'Dần': { element: 'Mộc', polarity: 'Dương', order: 3 },
    'Mão': { element: 'Mộc', polarity: 'Âm', order: 4 },
    'Thìn': { element: 'Thổ', polarity: 'Dương', order: 5 },
    'Tỵ': { element: 'Hỏa', polarity: 'Âm', order: 6 },
    'Ngọ': { element: 'Hỏa', polarity: 'Dương', order: 7 },
    'Mùi': { element: 'Thổ', polarity: 'Âm', order: 8 },
    'Thân': { element: 'Kim', polarity: 'Dương', order: 9 },
    'Dậu': { element: 'Kim', polarity: 'Âm', order: 10 },
    'Tuất': { element: 'Thổ', polarity: 'Dương', order: 11 },
    'Hợi': { element: 'Thủy', polarity: 'Âm', order: 12 }
  };

  const ELEMENT_RELATIONS = {
    sinh: { 'Mộc': 'Hỏa', 'Hỏa': 'Thổ', 'Thổ': 'Kim', 'Kim': 'Thủy', 'Thủy': 'Mộc' },
    khac: { 'Mộc': 'Thổ', 'Thổ': 'Thủy', 'Thủy': 'Hỏa', 'Hỏa': 'Kim', 'Kim': 'Mộc' }
  };

  const NAP_CHI_TABLE = {
    1: { ha: ['Tý', 'Dần', 'Thìn'], thuong: ['Ngọ', 'Thân', 'Tuất'] }, // Càn
    2: { ha: ['Tỵ', 'Mão', 'Sửu'], thuong: ['Hợi', 'Dậu', 'Mùi'] },   // Đoài
    3: { ha: ['Mão', 'Sửu', 'Hợi'], thuong: ['Dậu', 'Mùi', 'Tỵ'] },   // Ly
    4: { ha: ['Tý', 'Dần', 'Thìn'], thuong: ['Ngọ', 'Thân', 'Tuất'] }, // Chấn
    5: { ha: ['Sửu', 'Hợi', 'Dậu'], thuong: ['Mùi', 'Tỵ', 'Mão'] },   // Tốn
    6: { ha: ['Dần', 'Thìn', 'Ngọ'], thuong: ['Thân', 'Tuất', 'Tý'] }, // Khảm
    7: { ha: ['Thìn', 'Ngọ', 'Thân'], thuong: ['Tuất', 'Tý', 'Dần'] }, // Cấn
    8: { ha: ['Mùi', 'Tỵ', 'Mão'], thuong: ['Sửu', 'Hợi', 'Dậu'] }    // Khôn
  };

  const LUC_THU_MAP = {
    'Giáp': ['Thanh Long', 'Chu Tước', 'Câu Trận', 'Đằng Xà', 'Bạch Hổ', 'Huyền Vũ'],
    'Ất': ['Thanh Long', 'Chu Tước', 'Câu Trận', 'Đằng Xà', 'Bạch Hổ', 'Huyền Vũ'],
    'Bính': ['Chu Tước', 'Câu Trận', 'Đằng Xà', 'Bạch Hổ', 'Huyền Vũ', 'Thanh Long'],
    'Đinh': ['Chu Tước', 'Câu Trận', 'Đằng Xà', 'Bạch Hổ', 'Huyền Vũ', 'Thanh Long'],
    'Mậu': ['Câu Trận', 'Đằng Xà', 'Bạch Hổ', 'Huyền Vũ', 'Thanh Long', 'Chu Tước'],
    'Kỷ': ['Đằng Xà', 'Bạch Hổ', 'Huyền Vũ', 'Thanh Long', 'Chu Tước', 'Câu Trận'],
    'Canh': ['Bạch Hổ', 'Huyền Vũ', 'Thanh Long', 'Chu Tước', 'Câu Trận', 'Đằng Xà'],
    'Tân': ['Bạch Hổ', 'Huyền Vũ', 'Thanh Long', 'Chu Tước', 'Câu Trận', 'Đằng Xà'],
    'Nhâm': ['Huyền Vũ', 'Thanh Long', 'Chu Tước', 'Câu Trận', 'Đằng Xà', 'Bạch Hổ'],
    'Quý': ['Huyền Vũ', 'Thanh Long', 'Chu Tước', 'Câu Trận', 'Đằng Xà', 'Bạch Hổ']
  };

  const TUAN_KHONG_TABLE = {
    'Giáp Tý': ['Tuất', 'Hợi'],
    'Giáp Tuất': ['Thân', 'Dậu'],
    'Giáp Thân': ['Ngọ', 'Mùi'],
    'Giáp Ngọ': ['Thìn', 'Tỵ'],
    'Giáp Thìn': ['Dần', 'Mão'],
    'Giáp Dần': ['Tý', 'Sửu']
  };

  const NHI_HOP = {
    'Tý': 'Sửu', 'Sửu': 'Tý', 'Dần': 'Hợi', 'Hợi': 'Dần',
    'Mão': 'Tuất', 'Tuất': 'Mão', 'Thìn': 'Dậu', 'Dậu': 'Thìn',
    'Tỵ': 'Thân', 'Thân': 'Tỵ', 'Ngọ': 'Mùi', 'Mùi': 'Ngọ'
  };

  const LUC_XUNG = {
    'Tý': 'Ngọ', 'Ngọ': 'Tý', 'Sửu': 'Mùi', 'Mùi': 'Sửu',
    'Dần': 'Thân', 'Thân': 'Dần', 'Mão': 'Dậu', 'Dậu': 'Mão',
    'Thìn': 'Tuất', 'Tuất': 'Thìn', 'Tỵ': 'Hợi', 'Hợi': 'Tỵ'
  };

  const LUC_HAI = {
    'Tý': 'Mùi', 'Mùi': 'Tý', 'Sửu': 'Ngọ', 'Ngọ': 'Sửu',
    'Dần': 'Tỵ', 'Tỵ': 'Dần', 'Mão': 'Thìn', 'Thìn': 'Mão',
    'Thân': 'Hợi', 'Hợi': 'Thân', 'Dậu': 'Tuất', 'Tuất': 'Dậu'
  };

  const TAM_HOP_DEFS = {
    'Thủy': ['Thân', 'Tý', 'Thìn'],
    'Mộc': ['Hợi', 'Mão', 'Mùi'],
    'Hỏa': ['Dần', 'Ngọ', 'Tuất'],
    'Kim': ['Tỵ', 'Dậu', 'Sửu']
  };

  const TAM_HINH_DEFS = [
    { branches: ['Dần', 'Tỵ', 'Thân'], desc: "Vô Ân Chi Hình (Dần - Tỵ - Thân)" },
    { branches: ['Sửu', 'Mùi', 'Tuất'], desc: "Trì Thế Chi Hình (Sửu - Mùi - Tuất)" },
    { branches: ['Tý', 'Mão'], desc: "Vô Lễ Chi Hình (Tý - Mão)" }
  ];

  const TU_HINH = ['Thìn', 'Ngọ', 'Dậu', 'Hợi'];

  const MO_KHO = {
    'Kim': 'Sửu', 'Mộc': 'Mùi', 'Hỏa': 'Tuất', 'Thủy': 'Thìn', 'Thổ': 'Thìn'
  };

  const TRUONG_SINH_TABLE = {
    'Mộc': ['Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất'],
    'Hỏa': ['Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu'],
    'Kim': ['Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn'],
    'Thủy': ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'],
    'Thổ': ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi']
  };

  const TRUONG_SINH_STAGES = [
    'Trường Sinh', 'Mộc Dục', 'Quan Đới', 'Lâm Quan', 'Đế Vượng', 'Suy',
    'Bệnh', 'Tử', 'Mộ', 'Tuyệt', 'Thai', 'Dưỡng'
  ];

  const THIEN_AT_QUY_NHAN = {
    'Giáp': ['Sửu', 'Mùi'], 'Mậu': ['Sửu', 'Mùi'], 'Canh': ['Sửu', 'Mùi'],
    'Ất': ['Tý', 'Thân'], 'Kỷ': ['Tý', 'Thân'],
    'Bính': ['Hợi', 'Dậu'], 'Đinh': ['Hợi', 'Dậu'],
    'Tân': ['Ngọ', 'Dần'],
    'Nhâm': ['Tỵ', 'Mão'], 'Quý': ['Tỵ', 'Mão']
  };

  const DICH_MA = {
    'Thân': 'Dần', 'Tý': 'Dần', 'Thìn': 'Dần',
    'Dần': 'Thân', 'Ngọ': 'Thân', 'Tuất': 'Thân',
    'Tỵ': 'Hợi', 'Dậu': 'Hợi', 'Sửu': 'Hợi',
    'Hợi': 'Tỵ', 'Mão': 'Tỵ', 'Mùi': 'Tỵ'
  };

  const DAO_HOA = {
    'Thân': 'Dậu', 'Tý': 'Dậu', 'Thìn': 'Dậu',
    'Dần': 'Mão', 'Ngọ': 'Mão', 'Tuất': 'Mão',
    'Tỵ': 'Ngọ', 'Dậu': 'Ngọ', 'Sửu': 'Ngọ',
    'Hợi': 'Tý', 'Mão': 'Tý', 'Mùi': 'Tý'
  };

  const HOA_CAI = {
    'Thân': 'Thìn', 'Tý': 'Thìn', 'Thìn': 'Thìn',
    'Dần': 'Tuất', 'Ngọ': 'Tuất', 'Tuất': 'Tuất',
    'Tỵ': 'Sửu', 'Dậu': 'Sửu', 'Sửu': 'Sửu',
    'Hợi': 'Mùi', 'Mão': 'Mùi', 'Mùi': 'Mùi'
  };

  const LOC_THAN = {
    'Giáp': 'Dần', 'Ất': 'Mão', 'Bính': 'Tỵ', 'Mậu': 'Tỵ',
    'Đinh': 'Ngọ', 'Kỷ': 'Ngọ', 'Canh': 'Thân', 'Tân': 'Dậu',
    'Nhâm': 'Hợi', 'Quý': 'Tý'
  };

  const KIEP_SAT = {
    'Thân': 'Tỵ', 'Tý': 'Tỵ', 'Thìn': 'Tỵ',
    'Dần': 'Hợi', 'Ngọ': 'Hợi', 'Tuất': 'Hợi',
    'Tỵ': 'Dần', 'Dậu': 'Dần', 'Sửu': 'Dần',
    'Hợi': 'Thân', 'Mão': 'Thân', 'Mùi': 'Thân'
  };

  const TAI_SAT = {
    'Thân': 'Ngọ', 'Tý': 'Ngọ', 'Thìn': 'Ngọ',
    'Dần': 'Tý', 'Ngọ': 'Tý', 'Tuất': 'Tý',
    'Tỵ': 'Mão', 'Dậu': 'Mão', 'Sửu': 'Mão',
    'Hợi': 'Dậu', 'Mão': 'Dậu', 'Mùi': 'Dậu'
  };

  const THIEN_Y = {
    'Tý': 'Hợi', 'Sửu': 'Tý', 'Dần': 'Sửu', 'Mão': 'Dần',
    'Thìn': 'Mão', 'Tỵ': 'Thìn', 'Ngọ': 'Tỵ', 'Mùi': 'Ngọ',
    'Thân': 'Mùi', 'Dậu': 'Thân', 'Tuất': 'Dậu', 'Hợi': 'Tuất'
  };

  const LUC_HOP_HEXAGRAM_PAIRS = new Set([
    '8,1', '1,8', '8,4', '4,8', '7,3', '3,7', '6,2', '2,6'
  ]);

  const LUC_XUNG_HEXAGRAM_PAIRS = new Set([
    '1,1', '2,2', '3,3', '4,4', '5,5', '6,6', '7,7', '8,8', '1,4', '4,1'
  ]);

  const LUC_THAN_RELATIONS = {
    "Phụ Mẫu": { sinh: "Huynh Đệ", khac: "Tử Tôn", bi_sinh: "Quan Quỷ", bi_khac: "Thê Tài" },
    "Huynh Đệ": { sinh: "Tử Tôn", khac: "Thê Tài", bi_sinh: "Phụ Mẫu", bi_khac: "Quan Quỷ" },
    "Tử Tôn": { sinh: "Thê Tài", khac: "Quan Quỷ", bi_sinh: "Huynh Đệ", bi_khac: "Phụ Mẫu" },
    "Thê Tài": { sinh: "Quan Quỷ", khac: "Phụ Mẫu", bi_sinh: "Tử Tôn", bi_khac: "Huynh Đệ" },
    "Quan Quỷ": { sinh: "Phụ Mẫu", khac: "Huynh Đệ", bi_sinh: "Thê Tài", bi_khac: "Tử Tôn" }
  };

  const HEXAGRAM_POETRY = {
    '1,1': "Khốn long đắc thủy - Rồng gặp thời vận, đại nghiệp hanh thông",
    '1,2': "Hổ bĩ sào huyệt - Cẩn trọng từng bước, chớ khinh suất",
    '1,3': "Càn khôn hòa hiệp - Đồng tâm hiệp lực, quang minh hiển hách",
    '1,4': "Vô vọng chi tai - Thuận theo tự nhiên, chớ khởi tà tâm",
    '1,5': "Tha hương ngộ hữu - Gặp gỡ nhân duyên, quý nhân tương trợ",
    '1,6': "Châm phong tương đối - Kiện tụng bất lợi, dĩ hòa vi quý",
    '1,7': "Bạt sơn triệt tích - Ẩn nhẫn chờ thời, tích lũy nội lực",
    '1,8': "Hổ lạc bình dương - Vận thế bế tắc, cần kiên trì",
    '2,1': "Du du tự đắc - Quyết đoán hành động, nắm bắt thời cơ",
    '2,2': "Lưỡng trạch tương tư - Vui vẻ hòa hợp, bằng hữu tề tựu",
    '2,3': "Cải cựu nghênh tân - Đổi mới tiến bộ, loại bỏ hủ tục",
    '2,4': "Khởi tử hồi sinh - Tùy thời ứng biến, chuyển họa thành phúc",
    '2,5': "Dạ mộng kim ngân - Gánh nặng quá tải, thực tế cầu thị",
    '2,6': "Thoát lãng trùu đê - Vượt qua gian khổ, công thành danh toại",
    '2,7': "Mông phong thụ hạ - Cảm ứng giao hòa, nhân duyên tốt đẹp",
    '2,8': "Ngư ông đắc lợi - Tụ họp đông vui, thâu tóm cơ hội",
    '3,1': "Bảo kiếm xuất hạp - Đại cát hiển hách, tài năng phát lộ",
    '3,2': "Độc mộc nan chu - Bất đồng tương tranh, cần hòa giải",
    '3,3': "Phi long tại thiên - Quang minh chính đại, văn minh rực rỡ",
    '3,4': "Cơ nhân đắc thực - Diệt trừ trở ngại, giải tỏa cơn khát",
    '3,5': "Nghiệp đắc kỳ tài - Canh tân đổi mới, kiến tạo đỉnh cao",
    '3,6': "Thuyền trầm đáy hải - Chưa được vẹn toàn, cần cẩn trọng",
    '3,7': "Cá độ viễn hành - Đơn độc lữ hành, giữ vững đạo tâm",
    '3,8': "Nhật xuất cao sơn - Thăng tiến rực rỡ, tiền đồ xán lạn",
    '4,1': "Phục long đắc vũ - Sức mạnh sung mãn, thanh thế lẫy lừng",
    '4,2': "Tương tự tương kính - Quy cách đổi thay, thận trọng lời nói",
    '4,3': "Cổ kính trùng minh - Phong thịnh hiển đạt, gương vỡ lại lành",
    '4,4': "Lôi chấn bách lý - Kinh động thức tỉnh, chấn chỉnh kỷ cương",
    '4,5': "Bách chiết bất nạo - Kiên trì bền lâu, trường cửu hanh thông",
    '4,6': "Vũ quá thiên tình - Giải thoát nguy nan, mây tan trăng tỏ",
    '4,7': "Hành tẩu độc mộc - Vượt mức quá độ, chớ nên mạo hiểm",
    '4,8': "Thu đắc hoàng kim - Vui mừng hưng phấn, gặt hái thành quả",
    '5,1': "Mật vân bất vũ - Tích lũy chờ thời, mây dầy chưa mưa",
    '5,2': "Hạc minh cửu cao - Thành tín cảm thông, tiếng vang muôn dặm",
    '5,3': "Cốt nhục tương thân - Tề gia êm ấm, nội trợ đắc lực",
    '5,4': "Phong lôi ích trí - Tăng thêm lợi ích, giúp dân ích nước",
    '5,5': "Thuận phong hành thuyền - Khiêm nhường thuận lợi, cánh buồm xuôi gió",
    '5,6': "Phong hành thủy thượng - Tiêu tán ách tắc, lan tỏa muôn phương",
    '5,7': "Hạc lập kê quần - Từng bước tiến lên, hiển lộ tài ba",
    '5,8': "Phong hành đại địa - Quan sát chu toàn, cảm hóa lòng người",
    '6,1': "Minh châu xuất thổ - Chờ đợi thời cơ, ngọc sáng trần ai",
    '6,2': "Trạch thượng hữu thủy - Tiết chế chừng mực, gìn giữ phép tắc",
    '6,3': "Thủy hỏa tương tế - Công thành danh toại, vẹn tròn chu tất",
    '6,4': "Khởi bộ gian nan - Vạn sự khởi đầu nan, kiên trì đắc thắng",
    '6,5': "Mộc nhập tỉnh trung - Giếng nước nuôi người, giếng trong không vơi",
    '6,6': "Thủy để lao nguyệt - Trùng trùng hiểm trở, mò trăng đáy nước",
    '6,7': "Hành bộ nan tiến - Gian nan trắc trở, cẩn tắc vô ưu",
    '6,8': "Thủy quy đại hải - Gắn kết tương thân, muôn dòng tụ hội",
    '7,1': "Tích kim tích ngọc - Tích lũy đại nghiệp, ngăn ngừa lòng tham",
    '7,2': "Tổn kỷ lợi nhân - Bớt giận ngăn dục, dâng hiến đắc lộc",
    '7,3': "Dạ chiếu hoa đăng - Trang sức rực rỡ, văn hoa sáng sủa",
    '7,4': "Dưỡng sinh tu dưỡng - Tự lực cánh sinh, dưỡng nuôi hiền tài",
    '7,5': "Phong nhập sơn cốc - Cải biến mục nát, chấn hưng cơ đồ",
    '7,6': "Dương xuất phong môn - Mông muội cần khai, cầu học mở mang",
    '7,7': "Sơn thượng hữu sơn - Dừng lại đúng lúc, an tĩnh như núi",
    '7,8': "Bạch nhạn hàm thư - Hao mòn suy thoái, ẩn nhẫn đợi thời",
    '8,1': "Địa thiên giao thái - Vạn vật hanh thông, thái bình thịnh trị",
    '8,2': "Đại địa bồi chi - Đến lúc tiến lên, mở rộng thế lực",
    '8,3': "Nhật trầm địa hạ - Ánh sáng bị che, giấu tài ẩn nhẫn",
    '8,4': "Đông chí dương sinh - Quay về nguồn cội, phục hưng thịnh vượng",
    '8,5': "Mộc sinh ư thổ - Tiến lên từng bước, ngày càng thăng hoa",
    '8,6': "Địa trung hữu thủy - Dấy binh quản chúng, lãnh tụ uy nghiêm",
    '8,7': "Địa trung hữu sơn - Khiêm tốn hưởng phúc, khiêm nhường đắc lợi",
    '8,8': "Hậu đức tải vật - Nhu thuận bao dung, đất dày chở vật"
  };

  // ==========================================
  // 2. CÁC HÀM TÍNH TOÁN BỔ TRỢ
  // ==========================================

  function getHexagramStructureType(upperNum, lowerNum) {
    if (upperNum === lowerNum) return "Bát Thuần";
    const lowerBits = TRIGRAM_DEFS[lowerNum].bits.slice();
    const upperBits = TRIGRAM_DEFS[upperNum].bits.slice();
    const bits = lowerBits.concat(upperBits);
    const cur = bits.slice();
    for (let i = 0; i < 5; i++) {
      cur[i] ^= 1;
      if (cur.slice(0, 3).join('') === cur.slice(3, 6).join('')) {
        return `Thế Hào ${i + 1}`;
      }
    }
    cur[3] ^= 1;
    if (cur.slice(0, 3).join('') === cur.slice(3, 6).join('')) {
      return "Du Hồn";
    }
    return "Quy Hồn";
  }

  function getHexagramPalaceAndTheUng(upperNum, lowerNum) {
    if (upperNum === lowerNum) {
      const palace = TRIGRAM_DEFS[upperNum].name;
      const element = TRIGRAM_DEFS[upperNum].cung_element;
      return { palace, element, theIdx: 6, ungIdx: 3 };
    }

    const lowerBits = TRIGRAM_DEFS[lowerNum].bits.slice();
    const upperBits = TRIGRAM_DEFS[upperNum].bits.slice();
    const bits = lowerBits.concat(upperBits);
    const cur = bits.slice();

    for (let i = 0; i < 5; i++) {
      cur[i] ^= 1;
      if (cur.slice(0, 3).join('') === cur.slice(3, 6).join('')) {
        const topTrigramNum = BITS_TO_TRIGRAM_NUM[cur.slice(3, 6).join('')];
        const palace = TRIGRAM_DEFS[topTrigramNum].name;
        const element = TRIGRAM_DEFS[topTrigramNum].cung_element;
        const theIdx = i + 1;
        const ungIdx = (theIdx + 3 > 6) ? theIdx - 3 : theIdx + 3;
        return { palace, element, theIdx, ungIdx };
      }
    }

    // Du hồn (biến hào 4 ngược lại)
    cur[3] ^= 1;
    if (cur.slice(0, 3).join('') === cur.slice(3, 6).join('')) {
      const topTrigramNum = BITS_TO_TRIGRAM_NUM[cur.slice(3, 6).join('')];
      const palace = TRIGRAM_DEFS[topTrigramNum].name;
      const element = TRIGRAM_DEFS[topTrigramNum].cung_element;
      return { palace, element, theIdx: 4, ungIdx: 1 };
    }

    // Quy hồn (biến hạ quái)
    const palace = TRIGRAM_DEFS[lowerNum].name;
    const element = TRIGRAM_DEFS[lowerNum].cung_element;
    return { palace, element, theIdx: 3, ungIdx: 6 };
  }

  function getLucThan(palaceElement, branchElement) {
    if (palaceElement === branchElement) return "Huynh Đệ";
    if (ELEMENT_RELATIONS.sinh[palaceElement] === branchElement) return "Tử Tôn";
    if (ELEMENT_RELATIONS.sinh[branchElement] === palaceElement) return "Phụ Mẫu";
    if (ELEMENT_RELATIONS.khac[palaceElement] === branchElement) return "Thê Tài";
    if (ELEMENT_RELATIONS.khac[branchElement] === palaceElement) return "Quan Quỷ";
    return "Huynh Đệ";
  }

  function calculateTuanKhong(dayCan, dayChi) {
    const canList = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
    const chiList = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
    const canIdx = canList.indexOf(dayCan);
    const chiIdx = chiList.indexOf(dayChi);
    if (canIdx === -1 || chiIdx === -1) return [];
    const giapChiIdx = (chiIdx - canIdx + 12) % 12;
    return TUAN_KHONG_TABLE[`Giáp ${chiList[giapChiIdx]}`] || [];
  }

  // ==========================================
  // 3. CLASS HÀO & ENGINE LỤC HÀO
  // ==========================================

  class Hao {
    constructor(position, bit, branch, lucThan, lucThu, isThe, isUng, isDong) {
      this.position = position; // 1..6
      this.bit = bit; // 0 = Âm, 1 = Dương
      this.branch = branch;
      this.element = BRANCH_DATA[branch].element;
      this.lucThan = lucThan;
      this.lucThu = lucThu;
      this.isThe = isThe;
      this.isUng = isUng;
      this.isDong = isDong;

      this.bienBranch = null;
      this.bienElement = null;
      this.bienLucThan = null;
      this.hoaType = null;

      this.phucThanBranch = null;
      this.phucThanElement = null;
      this.phucThanLucThan = null;
      this.phucThanStatus = null;

      this.truongSinhStage = null;
      this.thanSat = [];

      this.isAmDong = false;
      this.isNhatPha = false;
      this.isChanKhong = false;
      this.isGiaKhong = false;

      this.powerScore = 0.0;
      this.powerStatus = "Bình hòa";
      this.notes = [];
    }
  }

  class HexagramEngine {
    constructor(upperNum, lowerNum, dongHaos = [], dayCan = "Giáp", dayChi = "Tý", monthChi = "Tý", yearChi = "Tý") {
      this.upperNum = upperNum;
      this.lowerNum = lowerNum;
      this.dongHaos = (dongHaos || []).filter(d => d >= 1 && d <= 6);
      this.dayCan = dayCan;
      this.dayChi = dayChi;
      this.monthChi = monthChi;
      this.yearChi = yearChi;

      this.hexName = HEXAGRAM_NAMES[`${upperNum},${lowerNum}`] || "Quẻ Không Xác Định";
      const palaceInfo = getHexagramPalaceAndTheUng(upperNum, lowerNum);
      this.palaceName = palaceInfo.palace;
      this.palaceElement = palaceInfo.element;
      this.theIdx = palaceInfo.theIdx;
      this.ungIdx = palaceInfo.ungIdx;
      this.palaceTrigramNum = NAME_TO_TRIGRAM_NUM[this.palaceName];

      this.structureType = getHexagramStructureType(upperNum, lowerNum);
      this.isBatThuan = (upperNum === lowerNum);
      this.isLucXung = LUC_XUNG_HEXAGRAM_PAIRS.has(`${upperNum},${lowerNum}`);
      this.isLucHop = LUC_HOP_HEXAGRAM_PAIRS.has(`${upperNum},${lowerNum}`);
      this.isDuHon = (this.structureType === "Du Hồn");
      this.isQuyHon = (this.structureType === "Quy Hồn");
      this.poetry = HEXAGRAM_POETRY[`${upperNum},${lowerNum}`] || "";

      this.tuanKhong = calculateTuanKhong(dayCan, dayChi);
      this.lucThuList = LUC_THU_MAP[dayCan] || LUC_THU_MAP['Giáp'];

      const bienInfo = this._computeBienHexagram();
      this.bienUpperNum = bienInfo.upper;
      this.bienLowerNum = bienInfo.lower;
      this.bienHexName = bienInfo.name;

      this.haos = this._setupHaos();
      this._mapPhucThan();
      this._applyTruongSinhAndThanSat();

      const phanPhuc = this._checkPhanPhucNgam();
      this.phanNgam = phanPhuc.phan;
      this.phucNgam = phanPhuc.phuc;

      this.tamHopCuc = this._detectTamHopCuc();
      const hinhHai = this._detectHinhHai();
      this.tamHinhList = hinhHai.hinh;
      this.lucHaiList = hinhHai.hai;

      this.gianHaos = this._getGianHaos();
      this.thaiHao = this._getThaiHao();

      this._evaluateCanLuc();
    }

    _computeBienHexagram() {
      if (!this.dongHaos || this.dongHaos.length === 0) {
        return { upper: this.upperNum, lower: this.lowerNum, name: this.hexName };
      }
      const allBits = TRIGRAM_DEFS[this.lowerNum].bits.concat(TRIGRAM_DEFS[this.upperNum].bits);
      for (const d of this.dongHaos) {
        allBits[d - 1] ^= 1;
      }
      const bLow = BITS_TO_TRIGRAM_NUM[allBits.slice(0, 3).join('')];
      const bUp = BITS_TO_TRIGRAM_NUM[allBits.slice(3, 6).join('')];
      return { upper: bUp, lower: bLow, name: HEXAGRAM_NAMES[`${bUp},${bLow}`] || "Quẻ Biến" };
    }

    _setupHaos() {
      const haos = [];
      const allBits = TRIGRAM_DEFS[this.lowerNum].bits.concat(TRIGRAM_DEFS[this.upperNum].bits);
      const allChis = NAP_CHI_TABLE[this.lowerNum].ha.concat(NAP_CHI_TABLE[this.upperNum].thuong);
      const allBienChis = NAP_CHI_TABLE[this.bienLowerNum].ha.concat(NAP_CHI_TABLE[this.bienUpperNum].thuong);

      for (let i = 0; i < 6; i++) {
        const pos = i + 1;
        const chi = allChis[i];
        const lt = getLucThan(this.palaceElement, BRANCH_DATA[chi].element);
        const h = new Hao(
          pos,
          allBits[i],
          chi,
          lt,
          this.lucThuList[i],
          (pos === this.theIdx),
          (pos === this.ungIdx),
          this.dongHaos.includes(pos)
        );

        if (h.isDong) {
          const bChi = allBienChis[i];
          const bElem = BRANCH_DATA[bChi].element;
          h.bienBranch = bChi;
          h.bienElement = bElem;
          h.bienLucThan = getLucThan(this.palaceElement, bElem);

          // 9 Dạng Hóa Biến (Bài 7)
          if (ELEMENT_RELATIONS.sinh[bElem] === h.element) {
            h.hoaType = "Hóa Hồi Đầu Sinh";
          } else if (ELEMENT_RELATIONS.khac[bElem] === h.element) {
            h.hoaType = "Hóa Hồi Đầu Khắc";
          } else if (bChi === NHI_HOP[h.branch]) {
            h.hoaType = "Hóa Hợp";
          } else if (bChi === LUC_XUNG[h.branch]) {
            h.hoaType = "Hóa Xung";
          } else if (bChi === MO_KHO[h.element]) {
            h.hoaType = "Hóa Mộ";
          } else if (this.tuanKhong.includes(bChi)) {
            h.hoaType = "Hóa Không Vong";
          } else if (h.element === bElem && BRANCH_DATA[bChi].order > BRANCH_DATA[h.branch].order) {
            h.hoaType = "Hóa Tiến Thần";
          } else if (h.element === bElem && BRANCH_DATA[bChi].order < BRANCH_DATA[h.branch].order) {
            h.hoaType = "Hóa Thoái Thần";
          } else {
            h.hoaType = `Hóa ${bChi}`;
          }
        }
        haos.push(h);
      }
      return haos;
    }

    _mapPhucThan() {
      const pureChis = NAP_CHI_TABLE[this.palaceTrigramNum].ha.concat(NAP_CHI_TABLE[this.palaceTrigramNum].thuong);
      const presentLts = new Set(this.haos.map(h => h.lucThan));

      for (let i = 0; i < 6; i++) {
        const pureChi = pureChis[i];
        const pureElem = BRANCH_DATA[pureChi].element;
        const pureLt = getLucThan(this.palaceElement, pureElem);

        const h = this.haos[i];
        h.phucThanBranch = pureChi;
        h.phucThanElement = pureElem;
        h.phucThanLucThan = pureLt;

        if (!presentLts.has(pureLt)) {
          const phiElem = h.element;
          if (ELEMENT_RELATIONS.sinh[phiElem] === pureElem) {
            h.phucThanStatus = "Phi sinh Phục (Đắc tràng sinh, dễ xuất lộ)";
          } else if (ELEMENT_RELATIONS.khac[pureElem] === phiElem) {
            h.phucThanStatus = "Phục khắc Phi (Đoạt thế xuất đầu)";
          } else if (ELEMENT_RELATIONS.khac[phiElem] === pureElem) {
            h.phucThanStatus = "Phi khắc Phục (Bị đè nén tổn thương, khó xuất đầu)";
          } else if (this.tuanKhong.includes(pureChi)) {
            h.phucThanStatus = "Phục Thần ngộ Tuần Không (Chưa thể xuất hiện)";
          } else {
            h.phucThanStatus = "Bình hòa (Chờ ngày xung Phi thần hoặc lâm Phục thần)";
          }
        }
      }
    }

    _applyTruongSinhAndThanSat() {
      const quyNhanChis = THIEN_AT_QUY_NHAN[this.dayCan] || [];
      const maChi = DICH_MA[this.dayChi];
      const daoHoaChi = DAO_HOA[this.dayChi];
      const hoaCaiChi = HOA_CAI[this.dayChi];
      const locChi = LOC_THAN[this.dayCan];
      const kiepChi = KIEP_SAT[this.dayChi];
      const taiChi = TAI_SAT[this.dayChi];
      const thienYChi = THIEN_Y[this.monthChi];

      for (const h of this.haos) {
        const stages = TRUONG_SINH_TABLE[h.element];
        if (stages) {
          const idx = stages.indexOf(h.branch);
          if (idx !== -1) {
            h.truongSinhStage = TRUONG_SINH_STAGES[idx];
          }
        }

        if (quyNhanChis.includes(h.branch)) h.thanSat.push("Quý Nhân");
        if (h.branch === maChi) h.thanSat.push("Dịch Mã");
        if (h.branch === daoHoaChi) h.thanSat.push("Đào Hoa");
        if (h.branch === hoaCaiChi) h.thanSat.push("Hoa Cái");
        if (h.branch === locChi) h.thanSat.push("Lộc Thần");
        if (h.branch === kiepChi) h.thanSat.push("Kiếp Sát");
        if (h.branch === taiChi) h.thanSat.push("Tai Sát");
        if (h.branch === thienYChi) h.thanSat.push("Thiên Y");
      }
    }

    _checkPhanPhucNgam() {
      if (!this.dongHaos || this.dongHaos.length === 0) return { phan: false, phuc: false };
      let isPhan = true;
      let isPhuc = true;
      for (const h of this.haos) {
        if (h.isDong) {
          if (h.bienBranch !== LUC_XUNG[h.branch]) isPhan = false;
          if (h.bienBranch !== h.branch) isPhuc = false;
        } else {
          isPhan = false;
          isPhuc = false;
        }
      }
      return { phan: isPhan, phuc: isPhuc };
    }

    _detectTamHopCuc() {
      const activeChis = this.haos.filter(h => h.isDong).map(h => h.branch);
      this.haos.filter(h => h.isDong && h.bienBranch).forEach(h => activeChis.push(h.bienBranch));
      const allPool = new Set([...activeChis, this.dayChi, this.monthChi, this.yearChi]);

      for (const [elem, triple] of Object.entries(TAM_HOP_DEFS)) {
        if (triple.every(c => allPool.has(c))) {
          return {
            element: elem,
            branches: triple,
            description: `Hợp thành Tam Hợp ${elem} cục (${triple.join(', ')})`
          };
        }
      }
      return null;
    }

    _detectHinhHai() {
      const hinhList = [];
      const haiList = [];
      const allChis = this.haos.map(h => h.branch).concat([this.dayChi, this.monthChi]);
      const chiSet = new Set(allChis);

      for (const item of TAM_HINH_DEFS) {
        if (item.branches.every(c => chiSet.has(c))) {
          hinhList.push(item.desc);
        }
      }

      for (const h of this.haos) {
        if (TU_HINH.includes(h.branch)) {
          const count = allChis.filter(c => c === h.branch).length;
          if (count >= 2) {
            const desc = `Tự Hình (${h.branch} - ${h.branch})`;
            if (!hinhList.includes(desc)) hinhList.push(desc);
          }
        }

        if (LUC_HAI[h.branch] === this.dayChi) {
          haiList.push(`Hào ${h.position} (${h.branch}) tương hại với Ngày (${this.dayChi})`);
        }
        if (LUC_HAI[h.branch] === this.monthChi) {
          haiList.push(`Hào ${h.position} (${h.branch}) tương hại với Tháng (${this.monthChi})`);
        }
      }
      return { hinh: hinhList, hai: haiList };
    }

    _getGianHaos() {
      const low = Math.min(this.theIdx, this.ungIdx);
      const high = Math.max(this.theIdx, this.ungIdx);
      const res = [];
      for (let pos = low + 1; pos < high; pos++) {
        res.push(this.haos[pos - 1]);
      }
      return res;
    }

    _getThaiHao() {
      const tuTonHaos = this.haos.filter(h => h.lucThan === "Tử Tôn");
      if (!tuTonHaos || tuTonHaos.length === 0) return null;
      const elem = tuTonHaos[0].element;
      const stages = TRUONG_SINH_TABLE[elem];
      if (!stages) return null;
      const thaiChi = stages[10]; // Vị trí Thai là index 10
      return this.haos.find(h => h.branch === thaiChi) || null;
    }

    _evaluateCanLuc() {
      const mElem = BRANCH_DATA[this.monthChi].element;
      const dElem = BRANCH_DATA[this.dayChi].element;

      for (const h of this.haos) {
        let score = 0.0;

        // 1. Nguyệt Kiến
        if (h.branch === this.monthChi) {
          score += 4.0;
          h.notes.push("Lâm Nguyệt Kiến (Cực Vượng)");
        } else if (ELEMENT_RELATIONS.sinh[mElem] === h.element) {
          score += 2.5;
          h.notes.push("Được Tháng sinh (Vượng)");
        } else if (mElem === h.element) {
          score += 2.0;
          h.notes.push("Đồng khí với Tháng (Vượng)");
        } else if (h.branch === LUC_XUNG[this.monthChi]) {
          score -= 4.0;
          h.notes.push("Nguyệt Phá (Đại Hung)");
        } else if (ELEMENT_RELATIONS.khac[mElem] === h.element) {
          score -= 2.0;
          h.notes.push("Bị Tháng khắc (Hưu Tù)");
        }

        // 2. Nhật Kiến
        if (h.branch === this.dayChi) {
          score += 3.5;
          h.notes.push("Lâm Nhật Kiến (Rất Vượng)");
        } else if (ELEMENT_RELATIONS.sinh[dElem] === h.element) {
          score += 2.0;
          h.notes.push("Được Ngày sinh (Vững mạnh)");
        } else if (h.branch === NHI_HOP[this.dayChi]) {
          score += 2.0;
          h.notes.push("Nhật Hợp (Được che chở/ràng buộc)");
        } else if (h.branch === LUC_XUNG[this.dayChi]) {
          if (score >= 1.5) {
            h.isAmDong = true;
            score += 2.0;
            h.notes.push("Ám Động (Hào vượng ngầm phát lực)");
          } else {
            h.isNhatPha = true;
            score -= 3.0;
            h.notes.push("Nhật Phá (Hào suy bị xung tan)");
          }
        } else if (ELEMENT_RELATIONS.khac[dElem] === h.element) {
          score -= 1.5;
          h.notes.push("Bị Ngày khắc");
        }

        // 3. Tuần Không
        if (this.tuanKhong.includes(h.branch)) {
          if (score >= 2.0) {
            h.isGiaKhong = true;
            h.notes.push("Giả Không (Lánh mặt, xuất không sẽ phát lực)");
          } else {
            h.isChanKhong = true;
            score -= 3.0;
            h.notes.push("Chân Không (Mất lực)");
          }
        }

        // 4. Hào Động & Hóa Biến
        if (h.isDong) {
          score += 1.5;
          if (h.hoaType === "Hóa Hồi Đầu Sinh") {
            score += 3.5;
            h.notes.push("Hóa Hồi Đầu Sinh (Cực Cát)");
          } else if (h.hoaType === "Hóa Hồi Đầu Khắc") {
            score -= 4.5;
            h.notes.push("Hóa Hồi Đầu Khắc (Hung)");
          } else if (h.hoaType === "Hóa Tiến Thần") {
            score += 2.5;
            h.notes.push("Hóa Tiến Thần");
          } else if (h.hoaType === "Hóa Thoái Thần") {
            score -= 2.5;
            h.notes.push("Hóa Thoái Thần");
          } else if (h.hoaType === "Hóa Mộ") {
            score -= 3.0;
            h.notes.push("Hóa Mộ (Bế tắc)");
          } else if (h.hoaType === "Hóa Không Vong") {
            score -= 2.5;
            h.notes.push("Hóa Không Vong");
          }
        }

        // 5. Thần sát gia tăng
        if (h.thanSat.includes("Quý Nhân")) {
          score += 1.0;
          h.notes.push("Lâm Quý Nhân");
        }
        if (h.thanSat.includes("Lộc Thần")) {
          score += 1.5;
          h.notes.push("Lâm Lộc Thần (Tài lộc sung mãn)");
        }
        if (h.thanSat.includes("Thiên Y")) {
          score += 1.0;
          h.notes.push("Lâm Thiên Y (Có phúc thần che chở)");
        }
        if (h.thanSat.includes("Kiếp Sát")) {
          score -= 1.0;
          h.notes.push("Lâm Kiếp Sát (Phòng cản trở, tranh chấp)");
        }

        h.powerScore = Math.round(score * 10) / 10;
        if (score >= 4.0) {
          h.powerStatus = "Cực Vượng";
        } else if (score >= 1.5) {
          h.powerStatus = "Vượng";
        } else if (score > -1.5) {
          h.powerStatus = "Bình hòa";
        } else if (score > -4.0) {
          h.powerStatus = "Suy yếu";
        } else {
          h.powerStatus = "Tuyệt Suy / Phá";
        }
      }
    }

    // ==========================================
    // 4. THỰC THI QUY TRÌNH 8 BƯỚC LUẬN ĐOÁN
    // ==========================================

    evaluate8Steps(targetTopic = "Tài vận", forcedDungThan = null) {
      const topicMap = {
        "Tài vận": "Thê Tài", "Cầu tài": "Thê Tài", "Kinh doanh": "Thê Tài",
        "Công danh": "Quan Quỷ", "Thăng chức": "Quan Quỷ", "Việc làm": "Quan Quỷ",
        "Thi cử": "Phụ Mẫu", "Học hành": "Phụ Mẫu", "Bằng cấp": "Phụ Mẫu",
        "Hôn nhân nam": "Thê Tài", "Hôn nhân nữ": "Quan Quỷ", "Tình cảm": "Thê Tài",
        "Con cái": "Tử Tôn", "Thai sản": "Tử Tôn",
        "Bệnh tật": "Quan Quỷ", "Kiện tụng": "Quan Quỷ"
      };

      const dungThanName = forcedDungThan || topicMap[targetTopic] || "Thê Tài";
      const dtCandidates = this.haos.filter(h => h.lucThan === dungThanName);
      let chosenDt = null;
      let dtReason = "";
      let isPhuc = false;
      let phucThanInfo = null;

      // Bước 1: Chọn Dụng Thần & Xử lý Phục Thần (Bài 8 & 11)
      if (dtCandidates.length === 1) {
        chosenDt = dtCandidates[0];
        dtReason = `Chọn hào ${chosenDt.position} mang ${dungThanName}.`;
      } else if (dtCandidates.length > 1) {
        const dongC = dtCandidates.filter(h => h.isDong);
        if (dongC.length > 0) {
          chosenDt = dongC[0];
          dtReason = `Dụng Thần Lưỡng Hiện: Chọn hào ${chosenDt.position} vì là Hào Động.`;
        } else {
          const nn = dtCandidates.filter(h => [this.monthChi, this.dayChi].includes(h.branch));
          if (nn.length > 0) {
            chosenDt = nn[0];
            dtReason = `Dụng Thần Lưỡng Hiện: Chọn hào ${chosenDt.position} vì Lâm Nhật/Nguyệt Kiến.`;
          } else {
            const theC = dtCandidates.filter(h => h.isThe);
            chosenDt = theC.length > 0 ? theC[0] : dtCandidates[0];
            dtReason = `Dụng Thần Lưỡng Hiện: Chọn hào ${chosenDt.position} theo thứ tự quẻ/Thế.`;
          }
        }
      } else {
        // Phục thần
        isPhuc = true;
        const matchingPhuc = this.haos.filter(h => h.phucThanLucThan === dungThanName);
        if (matchingPhuc.length > 0) {
          const hostHao = matchingPhuc[0];
          dtReason = `Dụng Thần ${dungThanName} Phục Dưới Hào ${hostHao.position} (${hostHao.branch} - Phi Thần).`;
          chosenDt = hostHao;
          phucThanInfo = {
            phuc_branch: hostHao.phucThanBranch,
            phuc_element: hostHao.phucThanElement,
            phi_hao: hostHao.position,
            status: hostHao.phucThanStatus
          };
        } else {
          chosenDt = this.haos[this.theIdx - 1];
          dtReason = `Dụng Thần ${dungThanName} ẩn sâu không lộ.`;
        }
      }

      const theHao = this.haos[this.theIdx - 1];

      // Bước 2: Xét Trì Thế
      let triTheText = "";
      let triTheScore = 0;
      if (theHao.lucThan === dungThanName) {
        triTheText = `Đắc địa: ${dungThanName} Trì Thế (Thân và việc hòa làm một).`;
        triTheScore = 3;
      } else if (ELEMENT_RELATIONS.sinh[theHao.element] === chosenDt.element) {
        triTheText = "Thế sinh Dụng Thần (Tâm huyết dồn lực nhưng vất vả).";
        triTheScore = 1;
      } else if (ELEMENT_RELATIONS.sinh[chosenDt.element] === theHao.element) {
        triTheText = "Dụng Thần sinh Thế (Tài lộc may mắn tự tìm đến).";
        triTheScore = 3;
      } else if (ELEMENT_RELATIONS.khac[theHao.element] === chosenDt.element) {
        triTheText = "Thế khắc Dụng Thần (Kiểm soát được tình thế).";
        triTheScore = 2;
      } else {
        triTheText = "Dụng Thần khắc Thế (Bị động, áp lực lớn).";
        triTheScore = -2;
      }

      // Bước 5: Xét Hào Động & Ám Động & Tam Hợp
      const dongEffects = [];
      if (this.tamHopCuc) {
        const cucElem = this.tamHopCuc.element;
        if (ELEMENT_RELATIONS.sinh[cucElem] === chosenDt.element) {
          dongEffects.push(`Tam Hợp ${cucElem} Cục Sinh Dụng Thần (Nguồn lực hỗ trợ cực đại).`);
        } else if (ELEMENT_RELATIONS.khac[cucElem] === chosenDt.element) {
          dongEffects.push(`Tam Hợp ${cucElem} Cục Khắc Phá Dụng Thần (Áp lực cản trở khổng lồ).`);
        }
      }

      for (const h of this.haos) {
        if (h.isDong && h.position !== chosenDt.position) {
          if (ELEMENT_RELATIONS.sinh[h.element] === chosenDt.element) {
            dongEffects.push(`Hào ${h.position} (${h.lucThan}) động sinh Dụng Thần (Quý nhân giúp đỡ).`);
          } else if (ELEMENT_RELATIONS.khac[h.element] === chosenDt.element) {
            dongEffects.push(`Hào ${h.position} (${h.lucThan}) động khắc phá Dụng Thần (Kỵ Thần phát động).`);
          }
        } else if (h.isAmDong && h.position !== chosenDt.position) {
          if (ELEMENT_RELATIONS.sinh[h.element] === chosenDt.element) {
            dongEffects.push(`Hào ${h.position} (${h.lucThan}) ÁM ĐỘNG sinh Dụng Thần (Nguồn lực ngầm trợ lực).`);
          } else if (ELEMENT_RELATIONS.khac[h.element] === chosenDt.element) {
            dongEffects.push(`Hào ${h.position} (${h.lucThan}) ÁM ĐỘNG khắc Dụng Thần (Phòng đối thủ ngầm đánh lén).`);
          }
        }
      }

      // Cảnh báo cấu trúc quẻ đặc thù
      const structuralWarnings = [];
      if (this.isBatThuan) structuralWarnings.push("Quẻ Bát Thuần: Khí thuần khiết một hướng, biến chuyển nhanh chóng.");
      if (this.isLucXung) structuralWarnings.push("Quẻ Lục Xung: Khởi sự chớp nhoáng nhưng dễ tan rã, bất lợi việc lâu dài.");
      if (this.isLucHop) structuralWarnings.push("Quẻ Lục Hợp: Vạn sự hòa hiệp, hợp tác bền chặt, mưu cầu lâu dài đại cát.");
      if (this.isDuHon) structuralWarnings.push("Quẻ Du Hồn: Tâm thần bất định, tha hương phiêu bạt, sự việc hay trôi nổi.");
      if (this.isQuyHon) structuralWarnings.push("Quẻ Quy Hồn: Thu về cội nguồn, muốn rút lui an cư, công việc sắp kết thúc chu kỳ.");
      if (this.phanNgam) structuralWarnings.push("Quẻ Phản Ngâm: Biến động dữ dội, lật lọng, đi rồi lại về.");
      if (this.phucNgam) structuralWarnings.push("Quẻ Phục Ngâm: Bế tắc trầm trọng, tiến thoái lưỡng nan.");

      // Tứ Thần Luận
      const ltRel = LUC_THAN_RELATIONS[dungThanName] || {};
      const nguyenThanName = ltRel.bi_sinh || "";
      const kyThanName = ltRel.bi_khac || "";
      const cuuThanName = (LUC_THAN_RELATIONS[kyThanName] && LUC_THAN_RELATIONS[kyThanName].bi_sinh) || "";
      const tietThanName = ltRel.sinh || "";

      const nguyenThanHaos = this.haos.filter(h => h.lucThan === nguyenThanName);
      const kyThanHaos = this.haos.filter(h => h.lucThan === kyThanName);
      const cuuThanHaos = this.haos.filter(h => h.lucThan === cuuThanName);
      const tietThanHaos = this.haos.filter(h => h.lucThan === tietThanName);

      const tuThanNotes = [];
      let tuThanScoreMod = 0.0;
      for (const nt of nguyenThanHaos) {
        if (nt.isDong) {
          if (nt.powerScore >= 1.0) {
            tuThanScoreMod += 2.0;
            tuThanNotes.push(`Nguyên Thần (${nt.lucThan} Hào ${nt.position}) động vượng sinh Dụng Thần (Nguồn lực, tài lộc dồi dào tiếp ứng liên tục).`);
          } else if (["Hóa Hồi Đầu Khắc", "Hóa Thoái Thần", "Hóa Mộ"].includes(nt.hoaType)) {
            tuThanScoreMod -= 1.0;
            tuThanNotes.push(`Nguyên Thần (${nt.lucThan} Hào ${nt.position}) động nhưng ${nt.hoaType} (Hậu thuẫn ban đầu tốt nhưng suy giảm về sau).`);
          }
        } else if (nt.powerScore >= 1.5) {
          tuThanNotes.push(`Nguyên Thần (${nt.lucThan} Hào ${nt.position}) vượng tướng âm thầm bồi đắp.`);
        }
      }

      for (const kt of kyThanHaos) {
        if (kt.isDong) {
          if (["Hóa Hồi Đầu Khắc", "Hóa Thoái Thần", "Hóa Mộ", "Hóa Tuyệt"].includes(kt.hoaType)) {
            tuThanScoreMod += 1.0;
            tuThanNotes.push(`Kỵ Thần (${kt.lucThan} Hào ${kt.position}) phát động nhưng ${kt.hoaType} (Kẻ hại tự chuốc thất bại, tai qua nạn khỏi).`);
          } else if (kt.powerScore >= 1.0) {
            tuThanScoreMod -= 3.0;
            tuThanNotes.push(`Kỵ Thần (${kt.lucThan} Hào ${kt.position}) phát động thế mạnh khắc phá Dụng Thần (Nguy cơ phá sản, cản trở quyết liệt).`);
          }
        } else if (kt.powerScore >= 2.0) {
          tuThanNotes.push(`Kỵ Thần (${kt.lucThan} Hào ${kt.position}) vượng tướng ẩn phục, cần đề phòng trở ngại.`);
        }
      }

      // Bước 6: Kết Luận Nhị Phân
      let totalScore = chosenDt.powerScore + theHao.powerScore + triTheScore + tuThanScoreMod;
      if (this.isLucHop) totalScore += 1.0;
      if (this.isLucXung && targetTopic !== "Bệnh tật") totalScore -= 1.0;

      let conclusion = "";
      let isSuccess = null;
      if (chosenDt.powerScore >= 1.5 && theHao.powerScore >= 0.0 && !isPhuc) {
        conclusion = "THÀNH CÔNG / ĐẠT KẾT QUẢ CÁT TƯỜNG (Dụng vượng, Thế vững).";
        isSuccess = true;
      } else if (chosenDt.powerScore < -1.5 || theHao.powerScore < -2.0 || (isPhuc && phucThanInfo && phucThanInfo.status && phucThanInfo.status.includes("khó"))) {
        conclusion = "BẤT LỢI / KHÔNG THÀNH (Dụng thần suy hoặc Thế suy hoặc Phục thần bị khắc).";
        isSuccess = false;
      } else {
        conclusion = "DÂY DƯA / TRẮC TRỞ (Cần nỗ lực vượt qua khó khăn, kết quả phụ thuộc ứng kỳ).";
        isSuccess = null;
      }

      // Bước 7: Ứng Kỳ Đa Chiều
      const ungKy = [];
      const dtBranch = isPhuc ? chosenDt.phucThanBranch : chosenDt.branch;
      if (this.tuanKhong.includes(dtBranch)) {
        ungKy.push(`Ứng kỳ vào ngày/tháng ${dtBranch} (Xuất Không) hoặc ngày xung ${LUC_XUNG[dtBranch] || ''} (Xung Không xung khởi).`);
      } else if (chosenDt.truongSinhStage === "Mộ" || dtBranch === MO_KHO[chosenDt.element]) {
        const moXung = LUC_XUNG[dtBranch] || "";
        ungKy.push(`Dụng Thần nhập Mộ: Ứng kỳ vào ngày ${moXung} để Xung Khai Mộ Khố, giải phóng năng lực.`);
      } else if (dtBranch === NHI_HOP[this.dayChi]) {
        ungKy.push(`Dụng Thần bị Nhật Hợp trói buộc: Ứng kỳ vào ngày xung ${LUC_XUNG[dtBranch] || ''} để Xung Khai.`);
      } else if (chosenDt.isDong) {
        ungKy.push(`Dụng Thần động: Ứng kỳ vào ngày hợp (${NHI_HOP[dtBranch] || ''}) hoặc ngày trực (${dtBranch}).`);
      } else {
        ungKy.push(`Ứng kỳ khi địa chi ${dtBranch} đến ngày trực hoặc ngày tam hợp cục thành tựu.`);
      }

      // Bước 8: Thông Tin Bổ Trợ
      const extraInfo = [
        `Thế hào ngự Lục Thú '${theHao.lucThu}' - Thần sát: ${theHao.thanSat.length > 0 ? theHao.thanSat.join(', ') : 'Không'}.`,
        `Dụng Thần ngự Lục Thú '${chosenDt.lucThu}' - Vòng Trường Sinh: ${chosenDt.truongSinhStage || 'Bình'}.`
      ];
      if (this.gianHaos && this.gianHaos.length > 0) {
        extraInfo.push(`Gián Hào (${this.gianHaos.map(g => `Hào ${g.position} ${g.lucThan}`).join(', ')}): Đại diện bên thứ ba, hòa giải hoặc môi giới.`);
      }

      return {
        topic: targetTopic,
        hexagram_structure: {
          type: this.structureType,
          is_bat_thuan: this.isBatThuan,
          is_luc_xung: this.isLucXung,
          is_luc_hop: this.isLucHop,
          is_du_hon: this.isDuHon,
          is_quy_hon: this.isQuyHon,
          poetry: this.poetry
        },
        step_1_dung_than: {
          name: dungThanName,
          chosen_hao: chosenDt.position,
          branch: dtBranch,
          is_phuc_than: isPhuc,
          phuc_than_info: phucThanInfo,
          reason: dtReason
        },
        step_1b_tu_than: {
          nguyen_than: { name: nguyenThanName, haos: nguyenThanHaos.map(h => h.position) },
          ky_than: { name: kyThanName, haos: kyThanHaos.map(h => h.position) },
          cuu_than: { name: cuuThanName, haos: cuuThanHaos.map(h => h.position) },
          tiet_than: { name: tietThanName, haos: tietThanHaos.map(h => h.position) },
          notes: tuThanNotes,
          score_mod: tuThanScoreMod
        },
        step_2_tri_the: {
          the_hao: theHao.position,
          the_luc_than: theHao.lucThan,
          analysis: triTheText
        },
        step_3_vuong_suy_dung_than: {
          score: chosenDt.powerScore,
          status: chosenDt.powerStatus,
          notes: chosenDt.notes
        },
        step_4_vuong_suy_the: {
          score: theHao.powerScore,
          status: theHao.powerStatus,
          notes: theHao.notes
        },
        step_5_hao_dong: dongEffects.length > 0 ? dongEffects : ["Không có hào động cản trở."],
        structural_warnings: structuralWarnings,
        step_6_ket_luan: {
          total_score: Math.round(totalScore * 10) / 10,
          is_success: isSuccess,
          judgment: conclusion
        },
        step_7_ung_ky: ungKy,
        step_8_thong_tin_bo_tro: extraInfo
      };
    }

    // ==========================================
    // 5. CHẨN ĐOÁN PHONG THỦY GIA TRẠCH 6 HÀO
    // ==========================================

    analyzeFengshui6Haos() {
      const spaceMapping = {
        1: "Nền móng, lòng đất ngầm, giếng nước, mương rãnh, vật nuôi",
        2: "Bếp núc, phòng ngủ chính, bàn ăn, tình trạng người phụ nữ/vợ",
        3: "Cửa ngách, giường ngủ, cầu thang, ban công phụ",
        4: "Cửa chính ra vào, cổng ngõ lớn, huyền quan, phòng khách",
        5: "Con đường phía trước, hành lang giao thông, trụ cột gia đình (chủ nhà)",
        6: "Mái nhà, trần nhà, ban thờ gia tiên, trời, không gian tâm linh"
      };

      const diagnoses = [];
      const remedies = [];

      for (const h of this.haos) {
        const pos = h.position;
        const space = spaceMapping[pos];
        const note = `Hào ${pos} (${h.lucThan} - ${h.branch} ${h.element} ngự ${h.lucThu}): ${space}.`;

        const issues = [];
        if (h.lucThan === "Quan Quỷ") {
          issues.push("Có sát khí/tà khí hoặc mầm bệnh trú ngụ");
          if (pos === 6) issues.push("Ban thờ gia tiên có vong linh hoặc bị động");
          else if (pos === 2) issues.push("Bếp phạm sát khí, dễ gây hỏa hoạn hoặc đau ốm");
        }
        if (h.lucThu === "Bạch Hổ") {
          issues.push("Khí trường hung bạo, phòng va đập, tai nạn chảy máu");
        } else if (h.lucThu === "Đằng Xà") {
          issues.push("Có sự ám ảnh, ác mộng, khí âm u uất");
        } else if (h.lucThu === "Huyền Vũ" && h.lucThan === "Huynh Đệ") {
          issues.push("Có nguy cơ rò rỉ nước, ẩm mốc, thoát tài ngầm");
        }

        if (h.isDong) {
          issues.push(`Hào Động (${h.hoaType}): Vị trí này đang có sự sửa chữa, thay đổi hoặc chấn động mạnh`);
        }

        let remedy = null;
        if (issues.length > 0) {
          if (h.element === "Hỏa") remedy = `Hóa giải Hào ${pos}: Đặt phong thủy luân hoặc bể cá (Thủy khắc Hỏa) để hạ nhiệt.`;
          else if (h.element === "Mộc") remedy = `Hóa giải Hào ${pos}: Dùng vật phẩm kim loại hoặc chuông gió (Kim khắc Mộc).`;
          else if (h.element === "Kim") remedy = `Hóa giải Hào ${pos}: Dùng đèn chiếu sáng hoặc tranh gam màu ấm (Hỏa khắc Kim).`;
          else if (h.element === "Thổ") remedy = `Hóa giải Hào ${pos}: Trồng thêm chậu cây xanh tươi (Mộc khắc Thổ).`;
          else if (h.element === "Thủy") remedy = `Hóa giải Hào ${pos}: Đặt đá thạch anh hoặc đồ gốm sứ (Thổ khắc Thủy).`;
        }

        diagnoses.push({
          position: pos,
          spatial_area: space,
          current_status: note,
          issues_detected: issues.length > 0 ? issues : ["Khí trường bình ổn, an lành."],
          remedy_suggestion: remedy
        });
        if (remedy) remedies.push(remedy);
      }

      const isHouseProsper = ELEMENT_RELATIONS.sinh[this.haos[1].element] === this.haos[4].element;
      return {
        hexagram_name: this.hexName,
        palace: `Cung ${this.palaceName} (${this.palaceElement})`,
        house_person_relation: isHouseProsper
          ? "Hào 2 (Trạch/Nhà) tương sinh Hào 5 (Nhân/Người): Nhà vượng người."
          : "Cần cân bằng trường khí giữa Trạch và Nhân.",
        detailed_levels: diagnoses,
        overall_remedies: remedies
      };
    }
  }

  // ==========================================
  // 6. BỘ SINH BÁO CÁO TỰ NHIÊN THUẦN QUY TẮC
  // ==========================================

  class RuleBasedReportGenerator {
    static generateFullReading(engine, topic = "Cầu tài", question = "") {
      const res = engine.evaluate8Steps(topic);
      const fengshui = engine.analyzeFengshui6Haos();

      const struct = res.hexagram_structure;
      const dt = res.step_1_dung_than;
      const tuThan = res.step_1b_tu_than;
      const the = res.step_2_tri_the;
      const dtVs = res.step_3_vuong_suy_dung_than;
      const theVs = res.step_4_vuong_suy_the;
      const hd = res.step_5_hao_dong;
      const kl = res.step_6_ket_luan;
      const uk = res.step_7_ung_ky;
      const bt = res.step_8_thong_tin_bo_tro;

      const lines = [];
      lines.push("================================================================================");
      lines.push("           BẢN LUẬN GIẢI KINH DỊCH LỤC HÀO CHUYÊN SÂU");
      lines.push("  Phương pháp luận: Nguyễn Tuấn Cường (Nam Việt Phong Thủy)");
      lines.push("  Chuẩn mực học thuật: Bốc Phệ Chính Tông & Tăng San Bốc Dịch");
      if (question) {
        lines.push(`  Câu hỏi đương số: "${question}" | Chủ đề: ${topic}`);
      }
      lines.push("================================================================================");
      lines.push("");

      // 1. TỔNG QUAN BÀN QUẺ
      lines.push("I. THÔNG SỐ BÀN QUẺ & TRỤC TỌA ĐỘ THỜI GIAN");
      lines.push(`- Quẻ Chính: ${engine.hexName.toUpperCase()} (Thuộc Cung ${engine.palaceName} - Ngũ hành ${engine.palaceElement}).`);
      if (struct.poetry) {
        lines.push(`  * Quẻ Tượng Thi Ca: "${struct.poetry}".`);
      }

      let structDesc = `Hình thái Bát Cung: [${struct.type}]`;
      if (struct.is_luc_hop) structDesc += " - [QUẺ LỤC HỢP: Vạn sự hòa hiệp, hợp tác bền chặt]";
      else if (struct.is_luc_xung) structDesc += " - [QUẺ LỤC XUNG: Biến động chớp nhoáng, trước hợp sau tan]";
      else if (struct.is_du_hon) structDesc += " - [QUẺ DU HỒN: Tâm thần trôi nổi, bất định, tha hương]";
      else if (struct.is_quy_hon) structDesc += " - [QUẺ QUY HỒN: Quy tụ về cội nguồn, thoái lui, kết thúc chu kỳ]";
      lines.push(`- ${structDesc}.`);

      if (engine.dongHaos && engine.dongHaos.length > 0) {
        lines.push(`- Quẻ Biến: ${engine.bienHexName.toUpperCase()} (Biến đổi do Hào ${engine.dongHaos.join(', ')} phát động).`);
      } else {
        lines.push("- Quẻ Tĩnh: Sáu hào an định, không có hào phát động.");
      }

      lines.push(`- Thời gian chiêm quẻ: Ngày ${engine.dayCan} ${engine.dayChi}, Tháng ${engine.monthChi}, Năm ${engine.yearChi}.`);
      lines.push(`- Tuần Không (Không Vong): Chi [${engine.tuanKhong.join(', ')}] ngộ Không.`);

      if (engine.phanNgam) {
        lines.push("- CẢNH BÁO PHẢN NGÂM: Toàn quẻ biến Lục Xung, tượng việc lật lọng, đi rồi lại về, trắc trở đảo lộn.");
      } else if (engine.phucNgam) {
        lines.push("- CẢNH BÁO PHỤC NGÂM: Toàn quẻ biến đồng chi, tượng bế tắc, đau khổ rên rỉ bên trong.");
      }
      if (engine.tamHopCuc) {
        lines.push(`- ĐẶC BIỆT TAM HỢP: ${engine.tamHopCuc.description}.`);
      }
      if (engine.tamHinhList && engine.tamHinhList.length > 0) {
        lines.push(`- CẢNH BÁO TAM HÌNH: ${engine.tamHinhList.join(', ')}.`);
      }
      if (engine.lucHaiList && engine.lucHaiList.length > 0) {
        lines.push(`- LỤC HẠI LIÊN ĐỚI: ${engine.lucHaiList.join(', ')}.`);
      }
      lines.push("");

      // 2. PHÂN TÍCH QUY TRÌNH 8 BƯỚC
      lines.push("II. PHÂN TÍCH DỊCH LÝ 8 BƯỚC QUY CHUẨN");

      // Bước 1: Dụng Thần
      lines.push("1. Xác Định Dụng Thần Cốt Lõi:");
      lines.push(`   - Chiêm đoán chủ đề '${topic}': Dụng Thần thủ ngôi Lục Thân [${dt.name}].`);
      lines.push(`   - ${dt.reason}`);
      if (dt.is_phuc_than && dt.phuc_than_info) {
        const pt = dt.phuc_than_info;
        lines.push(`   - ĐÁNH GIÁ PHỤC THẦN: Phục Thần [${pt.phuc_branch} - ${pt.phuc_element}] ẩn phục dưới Hào Phi ${pt.phi_hao}.`);
        lines.push(`     Trạng thái Phi - Phục: ${pt.status}.`);
      }
      lines.push("");

      // Bước 1b: Tứ Thần Luận
      lines.push("2. Khảo Sát Tứ Thần (Nguyên Thần - Kỵ Thần - Cừu Thần - Tiết Thần):");
      const ntHaos = tuThan.nguyen_than.haos.join(', ') || 'Phục';
      const ktHaos = tuThan.ky_than.haos.join(', ') || 'Phục';
      const ctHaos = tuThan.cuu_than.haos.join(', ') || 'Phục';
      const ttHaos = tuThan.tiet_than.haos.join(', ') || 'Phục';

      lines.push(`   - Nguyên Thần (Sinh Dụng Thần): [${tuThan.nguyen_than.name}] ngự Hào [${ntHaos}] (Cội nguồn tài phúc, người nâng đỡ).`);
      lines.push(`   - Kỵ Thần (Khắc Dụng Thần): [${tuThan.ky_than.name}] ngự Hào [${ktHaos}] (Rủi ro, kẻ thù, trở ngại cản trở).`);
      lines.push(`   - Cừu Thần (Sinh Kỵ Khắc Nguyên): [${tuThan.cuu_than.name}] ngự Hào [${ctHaos}].`);
      lines.push(`   - Tiết Thần (Hao khí Dụng Thần): [${tuThan.tiet_than.name}] ngự Hào [${ttHaos}].`);
      if (tuThan.notes && tuThan.notes.length > 0) {
        for (const note of tuThan.notes) {
          lines.push(`   * Đánh giá vận động: ${note}`);
        }
      }
      lines.push("");

      // Bước 2: Trì Thế
      lines.push("3. Xét Tương Quan Hào Thế (Bản Thân Đương Số):");
      lines.push(`   - Hào Thế ngự tại Hào ${the.the_hao}, mang Lục Thân [${the.the_luc_than}].`);
      lines.push(`   - Phân tích tương quan: ${the.analysis}`);
      lines.push("");

      // Bước 3 & 4: Vượng suy Dụng và Thế
      lines.push("4. Khí Số Cân Lực Dụng Thần & Hào Thế:");
      lines.push(`   - Dụng Thần [${dt.name}]: Đạt ${dtVs.score} điểm -> Trạng thái [${dtVs.status}].`);
      if (dtVs.notes && dtVs.notes.length > 0) {
        lines.push(`     Chi tiết: ${dtVs.notes.join('; ')}.`);
      }
      lines.push(`   - Hào Thế [${the.the_luc_than}]: Đạt ${theVs.score} điểm -> Trạng thái [${theVs.status}].`);
      if (theVs.notes && theVs.notes.length > 0) {
        lines.push(`     Chi tiết: ${theVs.notes.join('; ')}.`);
      }
      lines.push("");

      // Bước 5: Hào Động
      lines.push("5. Tác Động Của Hào Động & Biến Khí:");
      for (const eff of hd) {
        lines.push(`   - ${eff}`);
      }
      lines.push("");

      // Bước 6: Phán Quyết Nhị Phân
      lines.push("6. PHÁN QUYẾT TỔNG THỂ:");
      lines.push(`   >>> KẾT QUẢ: ${kl.judgment.toUpperCase()}`);
      lines.push(`   >>> TỔNG ĐIỂM QUẺ: ${kl.total_score} điểm (Thang chuẩn: >= +3.0 là Cát / < -2.0 là Hung).`);
      lines.push("");

      // Bước 7: Ứng Kỳ
      lines.push("7. Dự Trắc Ứng Kỳ (Thời Điểm Xảy Ra):");
      for (const u of uk) {
        lines.push(`   - ${u}`);
      }
      lines.push("");

      // Bước 8: Bổ Trợ
      lines.push("8. Yếu Tố Bổ Trợ & Thần Sát:");
      for (const b of bt) {
        lines.push(`   - ${b}`);
      }
      lines.push("");

      // 3. CHẨN ĐOÁN PHONG THỦY GIA TRẠCH 6 HÀO
      lines.push("III. KHẢO SÁT TRƯỜNG KHÍ PHONG THỦY GIA TRẠCH (6 BẬC HÀO)");
      lines.push(`- Đánh giá tổng quan: ${fengshui.house_person_relation}`);
      for (const lvl of fengshui.detailed_levels) {
        lines.push(`  + Hào ${lvl.position} [${lvl.spatial_area}]: ${lvl.current_status}`);
        if (lvl.issues_detected && lvl.issues_detected.length > 0) {
          lines.push(`    Khí trường: ${lvl.issues_detected.join('; ')}.`);
        }
        if (lvl.remedy_suggestion) {
          lines.push(`    Biện pháp: ${lvl.remedy_suggestion}`);
        }
      }
      if (fengshui.overall_remedies && fengshui.overall_remedies.length > 0) {
        lines.push("- TỔNG HỢP BIỆN PHÁP HÓA GIẢI NGŨ HÀNH:");
        for (const rem of fengshui.overall_remedies) {
          lines.push(`  * ${rem}`);
        }
      }
      lines.push("");
      lines.push("================================================================================");
      return lines.join("\n");
    }
  }

  // ==========================================
  // 7. CÁC HÀM TIỆN ÍCH LẬP QUẺ THEO THẦY CƯỜNG
  // ==========================================

  const THEMATIC_TOPICS = {
    tai_van: { name: 'Tài vận & Làm ăn', dung_than: 'Thê Tài', desc: 'Cầu tài, đầu tư, mở cửa hàng, doanh thu, lợi nhuận, dòng tiền' },
    cong_danh: { name: 'Công danh & Sự nghiệp', dung_than: 'Quan Quỷ', desc: 'Thăng chức, thi tuyển công chức, xin việc làm, dự án chính quyền' },
    hon_nhan: { name: 'Hôn nhân & Tình cảm', dung_than: 'Thê Tài / Quan Quỷ', desc: 'Tình duyên, cưới hỏi, hòa hợp vợ chồng, người thứ ba' },
    thi_cu: { name: 'Thi cử & Học vấn', dung_than: 'Phụ Mẫu', desc: 'Bằng cấp, thi đại học, chứng chỉ chuyên môn, đỗ đạt' },
    benh_tat: { name: 'Bệnh tật & Sức khỏe', dung_than: 'Hào Thế / Tử Tôn', desc: 'Chẩn đoán bệnh hiểm nghèo, tìm bác sĩ dùng thuốc, thọ yểu' },
    xuat_hanh: { name: 'Xuất hành & Di chuyển', dung_than: 'Hào Thế / Dịch Mã', desc: 'Đi xa, du học, xuất ngoại, định cư, bình an trên đường' },
    kien_tung: { name: 'Kiện tụng & Tranh chấp', dung_than: 'Quan Quỷ', desc: 'Thưa kiện, tòa án, tranh chấp đất đai hợp đồng, thắng bại' },
    nha_cua: { name: 'Nhà cửa & Đất đai', dung_than: 'Phụ Mẫu', desc: 'Mua bán nhà đất, động thổ, quy hoạch, phong thủy cư gia' },
    mua_ban: { name: 'Mua bán & Giao dịch', dung_than: 'Thê Tài', desc: 'Ký kết hợp đồng kinh tế, giá cả lên xuống, thương lượng' },
    cau_con: { name: 'Cầu con & Tử tức', dung_than: 'Tử Tôn', desc: 'Sinh con đẻ cái, thai sản, nuôi dưỡng con cái hiếu thuận' },
    mat_cua: { name: 'Mất của & Tìm đồ', dung_than: 'Thê Tài', desc: 'Mất tiền vàng, trộm cắp, bỏ quên đồ đạc, có tìm lại được không' },
    phong_thuy: { name: 'Phong thủy gia trạch', dung_than: 'Hào 2 (Trạch) / Phụ Mẫu', desc: 'Vượng suy nhà ở, mồ mả tổ tiên, trường khí đất đai' },
    hop_tac: { name: 'Hợp tác làm ăn', dung_than: 'Hào Thế & Ứng', desc: 'Góp vốn liên kết, độ tin cậy của đối tác, chia sẻ quyền lợi' },
    vay_muon: { name: 'Vay mượn & Nợ nần', dung_than: 'Thê Tài', desc: 'Vay ngân hàng, đòi nợ, thu hồi vốn, khả năng chi trả' },
    thoi_tiet: { name: 'Thời tiết mưa nắng', dung_than: 'Phụ Mẫu / Thê Tài', desc: 'Dự báo mưa bão, hạn hán, thời tiết phục vụ sự kiện ngoài trời' }
  };

  const CAN_LIST = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  const CHI_LIST = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

  function extractDateInfo(dateInput) {
    const dObj = dateInput ? new Date(dateInput) : new Date();
    const d = dObj.getDate();
    const m = dObj.getMonth() + 1;
    const y = dObj.getFullYear();
    const h = dObj.getHours();
    const min = dObj.getMinutes();

    // 1. Kiểm tra nếu có NetaCalendar toàn cục
    const cal = (typeof window !== 'undefined' && window.NetaCalendar) || (typeof global !== 'undefined' && global.NetaCalendar);
    if (cal && typeof cal.getSolarTermCanChi === 'function') {
      try {
        const cci = cal.getSolarTermCanChi(d, m, y, h, min);
        const dayParts = (cci.day || 'Giáp Tý').split(' ');
        const monthParts = (cci.month || 'Bính Tý').split(' ');
        const yearParts = (cci.year || 'Bính Ngọ').split(' ');
        const hourParts = (cci.hour || 'Giáp Tý').split(' ');

        const dayCan = dayParts[0] || 'Giáp';
        const dayChi = dayParts[1] || 'Tý';
        const monthChi = monthParts[1] || 'Tý';
        const yearChi = yearParts[1] || 'Tý';
        const hourChi = hourParts[1] || 'Tý';

        return {
          day_can: dayCan,
          day_branch: dayChi,
          month_branch: monthChi,
          year_branch: yearChi,
          hour_branch: hourChi,
          tiet_khi: cci.tietKhi || 'Bình thường',
          tuan_khong: calculateTuanKhong(dayCan, dayChi),
          than_sat: {
            loc: LOC_THAN[dayCan] || '',
            dich_ma: DICH_MA[dayChi] || '',
            dao_hoa: DAO_HOA[dayChi] || '',
            quy_nhan: THIEN_AT_QUY_NHAN[dayCan] || []
          }
        };
      } catch (e) {}
    }

    // 2. Thuật toán Fallback tính toán Can Chi bằng Julian Day
    const a = Math.floor((14 - m) / 12);
    const y2 = y + 4800 - a;
    const m2 = m + 12 * a - 3;
    const jd = d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 + Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;

    const dayCanIdx = (jd + 9) % 10;
    const dayChiIdx = (jd + 1) % 12;
    const dayCan = CAN_LIST[dayCanIdx];
    const dayChi = CHI_LIST[dayChiIdx];

    const hourChiIdx = Math.floor((h + 1) / 2) % 12;
    const hourChi = CHI_LIST[hourChiIdx];

    const yearChiIdx = (y - 4) % 12;
    const yearChi = CHI_LIST[yearChiIdx >= 0 ? yearChiIdx : yearChiIdx + 12];

    const monthChiIdx = (m + 1) % 12;
    const monthChi = CHI_LIST[monthChiIdx];

    return {
      day_can: dayCan,
      day_branch: dayChi,
      month_branch: monthChi,
      year_branch: yearChi,
      hour_branch: hourChi,
      tiet_khi: 'Chân Thái Dương',
      tuan_khong: calculateTuanKhong(dayCan, dayChi),
      than_sat: {
        loc: LOC_THAN[dayCan] || '',
        dich_ma: DICH_MA[dayChi] || '',
        dao_hoa: DAO_HOA[dayChi] || '',
        quy_nhan: THIEN_AT_QUY_NHAN[dayCan] || []
      }
    };
  }

  function buildFullResult(upper, lower, dongHaos, dateInput, topicKey = 'tai_van', question = '') {
    const dateInfo = extractDateInfo(dateInput);
    const topicMeta = THEMATIC_TOPICS[topicKey] || THEMATIC_TOPICS.tai_van;
    const topicName = topicMeta.name;

    const engine = new HexagramEngine(
      upper,
      lower,
      dongHaos,
      dateInfo.day_can,
      dateInfo.day_branch,
      dateInfo.month_branch,
      dateInfo.year_branch
    );

    const thematicAnalysis = engine.evaluate8Steps(topicName);
    const fengshuiAnalysis = engine.analyzeFengshui6Haos();

    // Chuẩn bị Quẻ Gốc
    const gocHaos = engine.haos.map((h) => ({
      hao_index: h.position,
      is_yang: h.isYang,
      stem: '',
      branch: h.branch,
      element: h.element,
      luc_than: h.lucThan,
      is_dong: h.isDong,
      is_tuan_khong: engine.tuanKhong.includes(h.branch)
    }));

    const gocPhucThan = engine.haos.map((h) => ({
      hao_index: h.position,
      luc_than: h.phucThanLucThan,
      branch: h.phucThanBranch,
      element: h.phucThanElement,
      status: h.phucThanStatus
    }));

    // Chuẩn bị Quẻ Biến (nếu có động)
    let bienObj = null;
    if (dongHaos && dongHaos.length > 0) {
      const bienBits = engine.haos.map(h => (h.isDong ? 1 - h.isYang : h.isYang));
      const bLowerBits = bienBits.slice(0, 3).join('');
      const bUpperBits = bienBits.slice(3, 6).join('');
      const bLowerNum = BITS_TO_TRIGRAM_NUM[bLowerBits] || 1;
      const bUpperNum = BITS_TO_TRIGRAM_NUM[bUpperBits] || 1;
      const bName = HEXAGRAM_NAMES[`${bUpperNum},${bLowerNum}`] || 'Quẻ Biến';
      const bPalaceInfo = getHexagramPalaceAndTheUng(bUpperNum, bLowerNum);

      const bHaos = engine.haos.map((h, i) => {
        const isYangB = bienBits[i] === 1;
        const bBranch = h.bienBranch || h.branch;
        const bElem = h.bienElement || h.element;
        const bLt = h.bienLucThan || h.lucThan;
        return {
          hao_index: h.position,
          is_yang: isYangB,
          stem: '',
          branch: bBranch,
          element: bElem,
          luc_than: bLt,
          is_dong: false
        };
      });

      bienObj = {
        name: bName,
        cung: bPalaceInfo.palace,
        cung_element: bPalaceInfo.element,
        is_luc_hop: LUC_HOP_HEXAGRAM_PAIRS.has(`${bUpperNum},${bLowerNum}`),
        is_luc_xung: LUC_XUNG_HEXAGRAM_PAIRS.has(`${bUpperNum},${bLowerNum}`),
        haos: bHaos
      };
    }

    // Điểm Cân Lực 6 Hào
    const canLuc = engine.haos.map((h) => ({
      hao_index: h.position,
      luc_than: h.lucThan,
      branch: h.branch,
      element: h.element,
      diem_tong_hop: h.powerScore,
      trang_thai_vuong_suy: h.powerStatus,
      quan_he_nguyet: BRANCH_DATA[h.branch].sinh_by === dateInfo.month_branch ? 'Được Nguyệt Sinh' : (h.branch === dateInfo.month_branch ? 'Nguyệt Kiến' : 'Bình hòa'),
      quan_he_nhat: BRANCH_DATA[h.branch].sinh_by === dateInfo.day_branch ? 'Được Nhật Sinh' : (h.branch === dateInfo.day_branch ? 'Nhật Trực' : 'Bình hòa'),
      is_am_dong: h.isAmDong,
      is_nhat_pha: h.isNhatPha
    }));

    // Đóng gói 8 bước nhị phân cho UI
    const s1 = thematicAnalysis.step_1_dung_than;
    const s2 = thematicAnalysis.step_2_tri_the;
    const s3 = thematicAnalysis.step_3_vuong_suy_dung_than;
    const s4 = thematicAnalysis.step_4_vuong_suy_the;
    const s5 = thematicAnalysis.step_5_hao_dong;
    const s6 = thematicAnalysis.step_6_ket_luan;
    const s7 = thematicAnalysis.step_7_ung_ky;
    const s8 = thematicAnalysis.step_8_thong_tin_bo_tro;

    const eightStepsUI = {
      step_1_dinh_tam_dong: {
        detail: `Động tâm chuyên đề '${topicName}'. Dụng Thần được chỉ định là ngôi Lục Thân [${s1.name}]. ${s1.reason}`,
        status: 'ok'
      },
      step_2_tim_dung_than: {
        detail: s1.is_phuc_than
          ? `Dụng Thần [${s1.name}] Phục Thần tại Hào ${s1.chosen_hao}. ${s1.phuc_than_info || ''}`
          : `Dụng Thần [${s1.name}] hiện rõ tại Hào ${s1.chosen_hao} (Chi: ${s1.branch}).`,
        status: s1.is_phuc_than ? 'fail' : 'ok',
        score: s3.score
      },
      step_3_can_luc_nhat_nguyet: {
        detail: `Dụng Thần đạt điểm cân lực: ${s3.score > 0 ? '+' : ''}${s3.score} (${s3.status}). Nhật Nguyệt hỗ trợ: ${s3.notes.join('; ')}`,
        status: s3.score >= 0 ? 'ok' : 'fail',
        score: s3.score
      },
      step_4_khao_sat_dong_hao: {
        detail: Array.isArray(s5) ? s5.join('; ') : String(s5),
        status: engine.dongHaos.length > 0 ? 'ok' : 'ok'
      },
      step_5_kiem_tra_the_ung: {
        detail: `Hào Thế ngự Hào ${s2.the_hao} (${s2.the_luc_than}): ${s2.analysis}. Điểm hào Thế: ${s4.score > 0 ? '+' : ''}${s4.score} (${s4.status}).`,
        status: s4.score >= 0 ? 'ok' : 'fail',
        score: s4.score
      },
      step_6_thanh_bai_nhi_phan: {
        detail: s6.judgment,
        status: s6.is_success ? 'ok' : 'fail'
      },
      step_7_xac_dinh_ung_ky: {
        detail: Array.isArray(s7) ? s7.join('; ') : String(s7),
        status: 'ok'
      },
      step_8_bien_phap_hoa_giai: {
        detail: Array.isArray(s8) ? s8.join('; ') : String(s8),
        status: 'ok',
        hoa_giai: fengshuiAnalysis.overall_remedies.length > 0 ? fengshuiAnalysis.overall_remedies.join('; ') : 'Vạn sự hanh thông, không cần hóa giải đặc biệt.'
      }
    };

    // Đóng gói Phong Thủy
    const fengshuiUI = {
      haos: fengshuiAnalysis.detailed_levels.map((dl) => {
        const hg = engine.haos[dl.position - 1];
        const isKhuyet = dl.issues_detected.some(issue => !issue.includes('Khí trường bình ổn'));
        return {
          hao_index: dl.position,
          vi_tri_khong_gian: dl.spatial_area,
          vat_the_tuong_ung: dl.current_status,
          luc_thu: hg.lucThu,
          luc_than: hg.lucThan,
          element: hg.element,
          is_khuyet_ham: isKhuyet,
          y_nghia_hien_trang: dl.issues_detected.join('; '),
          bien_phap_hoa_giai: dl.remedy_suggestion || 'Khí trường an định, giữ sạch sẽ gọn gàng.'
        };
      })
    };

    const finalRes = {
      upper: upper,
      lower: lower,
      dongHaos: dongHaos,
      date_info: dateInfo,
      goc: {
        name: engine.hexName,
        cung: engine.palaceName,
        cung_element: engine.palaceElement,
        the_hao: engine.theIdx,
        ung_hao: engine.ungIdx,
        is_luc_hop: engine.isLucHop,
        is_luc_xung: engine.isLucXung,
        is_du_hon: engine.isDuHon,
        is_quy_hon: engine.isQuyHon,
        is_thuan: engine.isBatThuan,
        haos: gocHaos,
        phuc_than: gocPhucThan
      },
      bien: bienObj,
      has_dong: engine.dongHaos.length > 0,
      dong_indices: engine.dongHaos,
      luc_thu: engine.lucThuList,
      can_luc: canLuc,
      thematic_analysis: {
        topic_name: topicName,
        dung_than: topicMeta.dung_than,
        eight_steps: eightStepsUI,
        ket_luan_chung: {
          thanh_bai: s6.is_success,
          ket_luan_ngan: s6.is_success ? 'THÀNH CÔNG • ĐẠI CÁT' : 'BẤT LỢI • CẦN CẨN TRỌNG',
          chi_tiet: s6.judgment
        },
        ung_ky: {
          thoi_gian_du_kien: (s7 && s7[0]) ? s7[0] : 'Đến ngày trực hoặc xuất Không',
          ly_do: 'Căn cứ theo Tuần Không, Mộ Khố và tương tác Động Hào',
          phuong_phap: 'Bốc Phệ Chính Tông & Thầy Nguyễn Tuấn Cường V2'
        }
      },
      fengshui: fengshuiUI,
      raw_engine: engine
    };

    return finalRes;
  }

  function castByDongTamHour(arg1, arg2, arg3, arg4) {
    // Hỗ trợ cả 2 chữ ký:
    // 1. (yearChi, monthLunar, dayLunar, hourChi)
    // 2. (date, topicKey, question)
    if (typeof arg2 === 'number' && typeof arg3 === 'number') {
      const yearChi = arg1;
      const monthLunar = arg2;
      const dayLunar = arg3;
      const hourChi = arg4;

      const chiOrder = {
        'Tý': 1, 'Sửu': 2, 'Dần': 3, 'Mão': 4, 'Thìn': 5, 'Tỵ': 6,
        'Ngọ': 7, 'Mùi': 8, 'Thân': 9, 'Dậu': 10, 'Tuất': 11, 'Hợi': 12
      };
      const yNum = chiOrder[yearChi] || 1;
      const hNum = chiOrder[hourChi] || 1;

      const sumUpper = yNum + monthLunar + dayLunar;
      const upper = sumUpper % 8 || 8;
      const sumLower = sumUpper + hNum;
      const lower = sumLower % 8 || 8;
      const dong = sumLower % 6 || 6;
      return { upper, lower, dongHaos: [dong] };
    }

    const d = (arg1 instanceof Date) ? arg1 : new Date(arg1 || Date.now());
    const dateInfo = extractDateInfo(d);
    const chiOrder = {
      'Tý': 1, 'Sửu': 2, 'Dần': 3, 'Mão': 4, 'Thìn': 5, 'Tỵ': 6,
      'Ngọ': 7, 'Mùi': 8, 'Thân': 9, 'Dậu': 10, 'Tuất': 11, 'Hợi': 12
    };
    const yNum = chiOrder[dateInfo.year_branch] || 1;
    const hNum = chiOrder[dateInfo.hour_branch] || 1;
    const mNum = d.getMonth() + 1;
    const dNum = d.getDate();

    const sumUpper = yNum + mNum + dNum;
    const upper = sumUpper % 8 || 8;
    const sumLower = sumUpper + hNum;
    const lower = sumLower % 8 || 8;
    const dong = sumLower % 6 || 6;

    const topicKey = arg2 || 'tai_van';
    const question = arg3 || '';
    return buildFullResult(upper, lower, [dong], d, topicKey, question);
  }

  function castByCoins(coinResults, dateInput = new Date(), topicKey = 'tai_van', question = '') {
    const bits = [];
    const dongHaos = [];

    coinResults.forEach((val, idx) => {
      const pos = idx + 1;
      if (val === 0) { // Lão Âm
        bits.push(0);
        dongHaos.push(pos);
      } else if (val === 1) { // Thiếu Dương
        bits.push(1);
      } else if (val === 2) { // Thiếu Âm
        bits.push(0);
      } else if (val === 3) { // Lão Dương
        bits.push(1);
        dongHaos.push(pos);
      } else if (val === 'lao_am') {
        bits.push(0);
        dongHaos.push(pos);
      } else if (val === 'thieu_duong') {
        bits.push(1);
      } else if (val === 'thieu_am') {
        bits.push(0);
      } else if (val === 'lao_duong') {
        bits.push(1);
        dongHaos.push(pos);
      }
    });

    const lowerBits = bits.slice(0, 3).join('');
    const upperBits = bits.slice(3, 6).join('');
    const lowerNum = BITS_TO_TRIGRAM_NUM[lowerBits] || 1;
    const upperNum = BITS_TO_TRIGRAM_NUM[upperBits] || 1;

    if (dateInput) {
      return buildFullResult(upperNum, lowerNum, dongHaos, dateInput, topicKey, question);
    }
    return { upper: upperNum, lower: lowerNum, dongHaos };
  }

  function castBySerial(numberStr, dateInput = new Date(), topicKey = 'tai_van', question = '') {
    const cleanDigits = (numberStr || '').replace(/\D/g, '');
    let upper = 1, lower = 1, dong = 1;

    if (cleanDigits.length < 2) {
      upper = 1; lower = 1; dong = 1;
    } else {
      const mid = Math.floor(cleanDigits.length / 2);
      const s1 = cleanDigits.slice(0, mid);
      const s2 = cleanDigits.slice(mid);

      let sum1 = 0;
      for (const ch of s1) sum1 += parseInt(ch, 10);
      let sum2 = 0;
      for (const ch of s2) sum2 += parseInt(ch, 10);

      upper = sum1 % 8 || 8;
      lower = sum2 % 8 || 8;
      dong = (sum1 + sum2) % 6 || 6;
    }

    if (dateInput) {
      return buildFullResult(upper, lower, [dong], dateInput, topicKey, question);
    }
    return { upper, lower, dongHaos: [dong] };
  }

  // Bổ sung method static generateFullReport cho RuleBasedReportGenerator
  RuleBasedReportGenerator.generateFullReport = function(resOrEngine, topic, question) {
    if (resOrEngine && resOrEngine.raw_engine) {
      return RuleBasedReportGenerator.generateFullReading(
        resOrEngine.raw_engine,
        resOrEngine.thematic_analysis ? resOrEngine.thematic_analysis.topic_name : (topic || 'Tài vận'),
        question || ''
      );
    }
    if (resOrEngine instanceof HexagramEngine) {
      return RuleBasedReportGenerator.generateFullReading(resOrEngine, topic, question);
    }
    return 'Dữ liệu quẻ không hợp lệ.';
  };

  // Export API
  return {
    THEMATIC_TOPICS,
    TRIGRAM_DEFS,
    BITS_TO_TRIGRAM_NUM,
    NAME_TO_TRIGRAM_NUM,
    HEXAGRAM_NAMES,
    BRANCH_DATA,
    ELEMENT_RELATIONS,
    NAP_CHI_TABLE,
    LUC_THU_MAP,
    TUAN_KHONG_TABLE,
    NHI_HOP,
    LUC_XUNG,
    LUC_HAI,
    TAM_HOP_DEFS,
    TAM_HINH_DEFS,
    TU_HINH,
    MO_KHO,
    TRUONG_SINH_TABLE,
    TRUONG_SINH_STAGES,
    THIEN_AT_QUY_NHAN,
    DICH_MA,
    DAO_HOA,
    HOA_CAI,
    LOC_THAN,
    KIEP_SAT,
    TAI_SAT,
    THIEN_Y,
    LUC_HOP_HEXAGRAM_PAIRS,
    LUC_XUNG_HEXAGRAM_PAIRS,
    LUC_THAN_RELATIONS,
    HEXAGRAM_POETRY,
    Hao,
    HexagramEngine,
    RuleBasedReportGenerator,
    castByDongTamHour,
    castByCoins,
    castBySerial,
    buildFullResult,
    extractDateInfo,
    getHexagramStructureType,
    getHexagramPalaceAndTheUng,
    getLucThan,
    calculateTuanKhong
  };
}));
