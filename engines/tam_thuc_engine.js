/**
 * NETA LIGHT - ĐỘNG CƠ CHIÊM ĐOÁN XUYÊN TAM THỨC
 * (Cross-System Tam Thuc Divination Engine: Thái Ất - Kỳ Môn - Lục Nhâm)
 * File: engines/tam_thuc_engine.js
 * 
 * Mô hình toán học tổng hợp Đa Tầng Tam Tài (Thiên - Địa - Nhân):
 * 1. Thái Ất Thần Kinh (Thiên Thời - Vĩ mô, Toán số, Chu kỳ đại vận)
 * 2. Kỳ Môn Độn Giáp (Địa Lợi - Không gian, Bát môn, Cửu tinh, Bát thần)
 * 3. Lục Nhâm Đại Độn (Nhân Sự - Vi mô, Tứ khóa, Tam truyền, Thần sát)
 * 
 * 12 Miền Cốt Lõi (D01 - D12), Ma Trận Trọng Số Tam Tài, Chỉ Số Đồng Thuận C_3T,
 * 5 Hình Thái Tương Tác, và Báo Cáo Chiến Lược Hành Động 5 Tầng.
 * 
 * Thuần JavaScript 100% - Hoạt động Offline độc lập trên Web & Mobile Client.
 */

(function (global) {
  'use strict';

  // ==============================================================================
  // 1. TỪ ĐIỂN 12 LĨNH VỰC THEN CHỐT & MA TRẬN TRỌNG SỐ (DOMAINS_12)
  // ==============================================================================
  const DOMAINS_12 = {
    "D01": {
      code: "D01",
      name: "Sự Nghiệp & Quan Lộ",
      description: "Thăng chức, bổ nhiệm, thi tuyển, công danh, giữ vị trí lãnh đạo, quyền lực chính trị.",
      keywords: ["thăng chức", "bổ nhiệm", "quan chức", "sự nghiệp", "lãnh đạo", "chính trị", "xin việc", "công danh", "chức vụ", "biên chế", "cơ quan", "cấp trên", "chuyển công tác", "luân chuyển", "phỏng vấn", "thi công chức", "trúng cử", "ghế lãnh đạo", "việc làm", "đi làm"],
      weight_thai_at: 0.35,
      weight_ky_mon: 0.35,
      weight_luc_nham: 0.30,
      key_dung_than_thai_at: "Thái Ất cung vị + Chủ Đại Tướng (Cơ cấu quyền lực tối cao)",
      key_dung_than_ky_mon: "Khai Môn + Trực Phù + Thiên Tâm Tinh (Bộ máy cơ quan & cấp trên)",
      key_dung_than_luc_nham: "Quan Quỷ + Quý Nhân + Khóa I (Uy quyền & sự tín nhiệm)",
      guidance: "Thái Ất xét thời thế chính sách; Kỳ Môn xét cơ hội thăng tiến tại đơn vị; Lục Nhâm xét sự tín nhiệm của cấp trên và đồng sự."
    },
    "D02": {
      code: "D02",
      name: "Tài Chính & Đầu Tư",
      description: "Kinh doanh, chứng khoán, bất động sản, tiền tệ, đầu tư mạo hiểm, thâu tóm sáp nhập.",
      keywords: ["tài chính", "đầu tư", "tiền bạc", "chứng khoán", "kinh doanh", "lợi nhuận", "bất động sản", "vốn", "giải ngân", "mua đất", "cổ phiếu", "tiền tệ", "lãi suất", "sinh lời", "vay vốn", "thế chấp", "thua lỗ", "thu hồi vốn", "góp vốn", "giao dịch", "mở cửa hàng", "buôn bán", "kiếm tiền", "giá vàng"],
      weight_thai_at: 0.40,
      weight_ky_mon: 0.35,
      weight_luc_nham: 0.25,
      key_dung_than_thai_at: "Toán Chủ/Khách vượng suy + Ngũ Phúc Cát Tinh (Chu kỳ dòng tiền vĩ mô)",
      key_dung_than_ky_mon: "Sinh Môn + Mậu (Tiền vốn) + Vũ Khúc/Thiên Nhậm (Sinh lời thực tế)",
      key_dung_than_luc_nham: "Thê Tài + Thanh Long + Khóa III (Dòng tiền mặt & đối tác kinh doanh)",
      guidance: "Thái Ất quyết định chu kỳ vĩ mô có bơm tiền hay thắt chặt; Kỳ Môn chỉ phương vị và kênh sinh lời; Lục Nhâm xét giao dịch tiền bạc vi mô."
    },
    "D03": {
      code: "D03",
      name: "Hôn Nhân & Gia Đạo",
      description: "Tình cảm, kết hôn, ly hợp, hòa khí gia đình, tình duyên đôi lứa, đào hoa.",
      keywords: ["hôn nhân", "tình cảm", "vợ chồng", "ly hôn", "kết hôn", "người yêu", "gia đạo", "duyên nợ", "gia đình", "tình duyên", "hẹn hò", "bạn gái", "bạn trai", "cưới xin", "bồ bịch", "ngoại tình", "mẹ chồng", "con cái"],
      weight_thai_at: 0.10,
      weight_ky_mon: 0.30,
      weight_luc_nham: 0.60,
      key_dung_than_thai_at: "Hòa/Bất Hòa của Khí số Niên Can",
      key_dung_than_ky_mon: "Ất (Nữ) + Canh (Nam) + Lục Hợp (Hôn nhân môi giới)",
      key_dung_than_luc_nham: "Tứ Khóa (Can dương/Can âm phối Chi dương/Chi âm) + Thiên Hậu/Thái Thường",
      guidance: "Lục Nhâm nắm quyền quyết định vì tâm tư tình cảm con người là cốt lõi; Kỳ Môn xét rào cản ngoại cảnh; Thái Ất chỉ mang tính tham khảo hòa khí."
    },
    "D04": {
      code: "D04",
      name: "Sức Khỏe & Bệnh Tật",
      description: "Chẩn trị y tế, nguy cơ bệnh lý hiểm nghèo, phẫu thuật, ngũ tạng suy thoái, thọ yểu.",
      keywords: ["sức khỏe", "bệnh tật", "thuốc", "bác sĩ", "phẫu thuật", "ốm đau", "tai nạn", "sinh mệnh", "khối u", "điều trị", "mổ", "nhập viện", "ung thư", "chữa bệnh", "khám bệnh", "đau ốm", "tai ương", "bệnh viện"],
      weight_thai_at: 0.20,
      weight_ky_mon: 0.40,
      weight_luc_nham: 0.40,
      key_dung_than_thai_at: "Dân Cơ Cung + Tứ Trụ Khí Hóa (Dịch bệnh diện rộng & thiên khí)",
      key_dung_than_ky_mon: "Thiên Nhuế (Bệnh phù) + Tử Môn (Ổ bệnh) + Thiên Tâm (Bác sĩ/Thuốc)",
      key_dung_than_luc_nham: "Khóa I (Bản thể thân xác) + Bạch Hổ/Bệnh Phù + Quan Quỷ khắc Thân",
      guidance: "Kỳ Môn chẩn đoán vị trí ổ bệnh và tìm hướng bác sĩ giỏi; Lục Nhâm chẩn đoán gốc rễ căn nguyên bệnh; Thái Ất xét yếu tố thời tiết dịch tễ."
    },
    "D05": {
      code: "D05",
      name: "Phong Thủy & Điền Trạch",
      description: "Dương trạch nhà ở, Âm trạch mồ mả, mua bán nhà đất, quy hoạch, khởi công, nhập trạch.",
      keywords: ["phong thủy", "nhà đất", "mảnh đất", "thửa đất", "lô đất", "bất động sản", "mua đất", "bán đất", "mua nhà", "bán nhà", "thuê nhà", "thuê đất", "căn hộ", "chung cư", "địa ốc", "đất đai", "đất cát", "mộ phần", "mồ mả", "dương trạch", "âm trạch", "xây nhà", "sửa nhà", "nhập trạch", "động thổ", "trụ sở", "sổ đỏ", "sổ hồng", "quy hoạch", "thổ cư", "khởi công", "mặt bằng", "đất"],
      weight_thai_at: 0.15,
      weight_ky_mon: 0.45,
      weight_luc_nham: 0.40,
      key_dung_than_thai_at: "Bát Phong Thái Ất (Hướng đón gió & vận đất theo thời kỳ)",
      key_dung_than_ky_mon: "Sinh Môn (Nhà) + Cửu Địa (Đất đai) + Tử Môn (Mộ phần) + 24 Sơn hướng",
      key_dung_than_luc_nham: "Chi vi Trạch (Khóa III) + Khóa IV (Kim tĩnh/Móng ngầm) + Trạch Mộ",
      guidance: "Kỳ Môn định vị tọa hướng và cách cục không gian 9 cung; Lục Nhâm chẩn đoán chi tiết mạch ngầm dưới đáy huyệt/móng nhà; Thái Ất định đại vận đất."
    },
    "D06": {
      code: "D06",
      name: "Pháp Lý & Kiện Tụng",
      description: "Tranh chấp dân sự/hình sự, điều tra, ký kết hợp đồng, tòa án phán quyết, thị phi pháp luật.",
      keywords: ["kiện tụng", "tòa án", "tranh chấp", "pháp luật", "hợp đồng", "công an", "thị phi", "luật sư", "khởi kiện", "thắng kiện", "bồi thường", "bắt bớ", "tạm giam", "thanh tra", "khiếu nại", "tố cáo", "hầu tòa"],
      weight_thai_at: 0.25,
      weight_ky_mon: 0.40,
      weight_luc_nham: 0.35,
      key_dung_than_thai_at: "Toán Khách/Chủ (Ai chiếm thế thượng phong công lý)",
      key_dung_than_ky_mon: "Kinh Môn (Khẩu thiệt/Tranh tụng) + Khai Môn (Thẩm phán) + Trực Phù",
      key_dung_than_luc_nham: "Chu Tước (Đơn từ kiện cáo) + Câu Trận (Bắt bớ/Trì hoãn) + Quan Quỷ",
      guidance: "Kỳ Môn cho biết cơ hội thắng kiện tại tòa; Lục Nhâm lột trần động cơ nhân chứng và bằng chứng giả; Thái Ất xác định cán cân công lý thời đại."
    },
    "D07": {
      code: "D07",
      name: "Đàm Phán & Hợp Tác",
      description: "Thương thảo hợp đồng kinh tế, lập liên minh, nhượng bộ, thuyết phục đối tác kinh doanh.",
      keywords: ["đàm phán", "thương thảo", "hợp tác", "ký kết", "thuyết phục", "đối tác", "liên minh", "nhượng bộ", "sáp nhập", "m&a", "thỏa thuận", "liên doanh", "hợp đồng kinh tế", "gặp đối tác"],
      weight_thai_at: 0.20,
      weight_ky_mon: 0.45,
      weight_luc_nham: 0.35,
      key_dung_than_thai_at: "Khách Chủ Tương Thôi (Ai chủ động, ai nắm quyền ra giá)",
      key_dung_than_ky_mon: "Cảnh Môn (Điều khoản hợp đồng) + Khai Môn + Thiên Phụ (Trí tuệ đàm phán)",
      key_dung_than_luc_nham: "Lục Hợp (Thần hòa giải) + Tỷ Hòa Tứ Khóa + Huynh Đệ",
      guidance: "Kỳ Môn xác lập chiến thuật thương lượng và vị trí ngồi đàm phán; Lục Nhâm nhận diện đối phương thật lòng hay giấu bài; Thái Ất định vị thế quyền lực."
    },
    "D08": {
      code: "D08",
      name: "Thi Cử & Học Vấn",
      description: "Khoa bảng, thi tuyển sinh, lấy chứng chỉ quốc tế, du học, nghiên cứu khoa học, xuất bản.",
      keywords: ["thi cử", "học vấn", "bằng cấp", "du học", "khoa cử", "nghiên cứu", "điểm thi", "đỗ đạt", "luận án", "tiến sĩ", "thi đỗ", "kết quả thi", "đại học", "học bổng", "thạc sĩ", "thi chuyển cấp"],
      weight_thai_at: 0.20,
      weight_ky_mon: 0.40,
      weight_luc_nham: 0.40,
      key_dung_than_thai_at: "Văn Xương Thiên Mục (Tinh thần minh triết khoa cử)",
      key_dung_than_ky_mon: "Cảnh Môn (Bài thi/Đề thi) + Đinh Kỳ (Văn tinh) + Thiên Phụ Tinh",
      key_dung_than_luc_nham: "Chu Tước (Bảng vàng) + Phụ Mẫu (Giấy báo điểm) + Thanh Long",
      guidance: "Kỳ Môn cho biết trạng thái phòng thi và khả năng phát huy; Lục Nhâm phản ánh kết quả bài làm thực tế; Thái Ất định quy chế thi cử."
    },
    "D09": {
      code: "D09",
      name: "Xuất Hành & Di Chuyển",
      description: "Đi công tác xa, du lịch nước ngoài, định cư, di dời trụ sở, an toàn giao thông lộ trình.",
      keywords: ["xuất hành", "du lịch", "định cư", "di chuyển", "đi xa", "máy bay", "an toàn", "giao thông", "lộ trình", "công tác", "đi nước ngoài", "visa", "tàu xe", "đi đường"],
      weight_thai_at: 0.20,
      weight_ky_mon: 0.50,
      weight_luc_nham: 0.30,
      key_dung_than_thai_at: "Bát Phong Động Tĩnh (Thời tiết khí tượng đường dài)",
      key_dung_than_ky_mon: "Dịch Mã + Khai/Sinh Môn (Cửa xuất hành) + Cửu Địa (Bình an mặt đất)",
      key_dung_than_luc_nham: "Thiên Mã + Đinh Mã + Khóa III (Ngoại cảnh lộ trình) + Bạch Hổ sát",
      guidance: "Kỳ Môn chọn giờ và hướng xuất phát tối ưu nhất; Lục Nhâm cảnh báo rủi ro va chạm dọc đường; Thái Ất báo trước thiên tai bão lũ."
    },
    "D10": {
      code: "D10",
      name: "Mất Mát & Tìm Kiếm",
      description: "Tìm người thân mất liên lạc, tìm đồ vật đánh rơi, điều tra thủ phạm trộm cắp, truy vết.",
      keywords: ["tìm đồ", "mất trộm", "thất lạc", "tìm người", "manh mối", "dấu vết", "mất tích", "đánh rơi", "trộm cắp", "kẻ gian", "đồ bị mất", "tìm kiếm"],
      weight_thai_at: 0.10,
      weight_ky_mon: 0.45,
      weight_luc_nham: 0.45,
      key_dung_than_thai_at: "Kế Thần (Ẩn nặc & che giấu thông tin)",
      key_dung_than_ky_mon: "Huyền Vũ (Kẻ trộm) + Đỗ Môn (Nơi giấu đồ) + Bát Quái Cung vị",
      key_dung_than_luc_nham: "Huyền Vũ (Trộm cắp) + Thiên Không (Mất hút) + Tuần Không + Lục Thân",
      guidance: "Kỳ Môn định vị chính xác phương hướng và vật che chắn; Lục Nhâm cho biết đồ vật còn nguyên vẹn hay đã bị tẩu tán và chân dung kẻ lấy."
    },
    "D11": {
      code: "D11",
      name: "Quản Trị & Nhân Sự",
      description: "Tuyển mộ nhân sự chủ chốt, phòng ngừa phản trắc nội bộ, phân quyền, dùng người, triệt tiêu phe cánh.",
      keywords: ["nhân sự", "tuyển dụng", "phản trắc", "cộng sự", "dùng người", "quản trị", "nội bộ", "phe cánh", "tái cấu trúc", "luân chuyển", "sa thải", "bổ nhiệm nhân sự", "nhân viên", "trung thành"],
      weight_thai_at: 0.25,
      weight_ky_mon: 0.35,
      weight_luc_nham: 0.40,
      key_dung_than_thai_at: "Quân Cơ vs Dân Cơ (Mối quan hệ thượng tầng và cấp dưới)",
      key_dung_than_ky_mon: "Trực Sử (Bộ máy thừa hành) + Đỗ Môn (Bí mật nội bộ) + Bạch Hổ",
      key_dung_than_luc_nham: "Khóa II (Can Âm Thần - Bè bạn/Cộng sự) + Huynh Đệ khắc Thê Tài",
      guidance: "Lục Nhâm soi thấu lòng dạ và mưu mô ngầm của cấp dưới; Kỳ Môn định vị phe phái trong cơ cấu tổ chức; Thái Ất xét sự ổn định của vương triều."
    },
    "D12": {
      code: "D12",
      name: "Chiến Lược & Vận Thế",
      description: "Đại cuộc dài hạn, bước ngoặt cuộc đời, chu kỳ kinh tế vĩ mô, phòng ngừa rủi ro thời đại.",
      keywords: ["chiến lược", "vận thế", "đại cuộc", "tương lai", "chu kỳ", "bước ngoặt", "thời đại", "vĩ mô", "chuyển đổi số", "dài hạn", "vận mệnh", "số phận", "thời vận", "đại vận"],
      weight_thai_at: 0.50,
      weight_ky_mon: 0.30,
      weight_luc_nham: 0.20,
      key_dung_than_thai_at: "Đại Du + Ngũ Phúc + Hòa/Bất Hòa của 72 Cục (Thiên mệnh thời đại)",
      key_dung_than_ky_mon: "Cung Trực Phù + Bát Thần bảo hộ + Cửa thời đại",
      key_dung_than_luc_nham: "Mạt Truyền (Kết cục trường cửu) + Đức Thần/Hành Niên",
      guidance: "Thái Ất giữ quyền tối cao vì vận mệnh vĩ mô quyết định tất cả; Kỳ Môn mở lối chiến lược địa bàn; Lục Nhâm giữ vai trò mắt xích vi mô."
    }
  };

  function getDomainConfig(code) {
    if (!code) return DOMAINS_12["D01"];
    const c = String(code).toUpperCase().trim();
    return DOMAINS_12[c] || DOMAINS_12["D01"];
  }

  function listAllDomains() {
    return Object.values(DOMAINS_12);
  }

  function removeVietnameseTones(str) {
    if (!str || typeof str !== 'string') return '';
    return str.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toLowerCase();
  }

  function detectDomainFromQuery(query) {
    if (!query || typeof query !== 'string') return DOMAINS_12["D01"];
    const qRaw = query.toLowerCase().trim();
    const qClean = removeVietnameseTones(qRaw);
    let bestDomain = DOMAINS_12["D01"];
    let maxScore = 0;

    for (const key of Object.keys(DOMAINS_12)) {
      const d = DOMAINS_12[key];
      let score = 0;
      for (const kw of d.keywords) {
        const kwLower = kw.toLowerCase();
        const kwClean = removeVietnameseTones(kwLower);

        if (qRaw.includes(kwLower)) {
          score += kwLower.length >= 8 ? 6 : (kwLower.length >= 5 ? 4 : 2);
        } else if (qClean.includes(kwClean)) {
          score += kwClean.length >= 8 ? 4 : (kwClean.length >= 5 ? 2 : 1);
        }
      }
      if (score > maxScore) {
        maxScore = score;
        bestDomain = d;
      }
    }
    return bestDomain;
  }

  // ==============================================================================
  // 2. HẰNG SỐ TIẾT KHÍ, NGUYỆT TƯỚNG & KỲ MÔN
  // ==============================================================================
  const SOLAR_TERM_TO_NGUYET_TUONG = {
    "Lập Xuân": "Tý", "Vũ Thủy": "Hợi", "Kinh Trập": "Hợi",
    "Xuân Phân": "Tuất", "Thanh Minh": "Tuất", "Cốc Vũ": "Dậu",
    "Lập Hạ": "Dậu", "Tiểu Mãn": "Thân", "Mang Chủng": "Thân",
    "Hạ Chí": "Mùi", "Tiểu Thử": "Mùi", "Đại Thử": "Ngọ",
    "Lập Thu": "Ngọ", "Xử Thử": "Tỵ", "Bạch Lộ": "Tỵ",
    "Thu Phân": "Thìn", "Hàn Lộ": "Thìn", "Sương Giáng": "Mão",
    "Lập Đông": "Mão", "Tiểu Tuyết": "Dần", "Đại Tuyết": "Dần",
    "Đông Chí": "Sửu", "Tiểu Hàn": "Sửu", "Đại Hàn": "Tý"
  };

  const SOLAR_TERM_TO_CHI_THANG = {
    "Lập Xuân": "Dần", "Vũ Thủy": "Dần", "Kinh Trập": "Mão", "Xuân Phân": "Mão",
    "Thanh Minh": "Thìn", "Cốc Vũ": "Thìn", "Lập Hạ": "Tỵ", "Tiểu Mãn": "Tỵ",
    "Mang Chủng": "Ngọ", "Hạ Chí": "Ngọ", "Tiểu Thử": "Mùi", "Đại Thử": "Mùi",
    "Lập Thu": "Thân", "Xử Thử": "Thân", "Bạch Lộ": "Dậu", "Thu Phân": "Dậu",
    "Hàn Lộ": "Tuất", "Sương Giáng": "Tuất", "Lập Đông": "Hợi", "Tiểu Tuyết": "Hợi",
    "Đại Tuyết": "Tý", "Đông Chí": "Tý", "Tiểu Hàn": "Sửu", "Đại Hàn": "Sửu"
  };

  const LAC_THU_PALACES = [1, 8, 3, 4, 9, 2, 7, 6];
  const DIA_CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
  const THIEN_CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
  const SAN_QI_LIU_YI_VN = ["Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý", "Đinh", "Bính", "Ất"];
  const PALACE_ORDER_CLOCKWISE = [1, 8, 3, 4, 9, 2, 7, 6];

  const STAR_ORIGIN_PALACE = {
    1: "Thiên Bồng", 2: "Thiên Nhuế", 3: "Thiên Xung", 4: "Thiên Phụ",
    5: "Thiên Cầm", 6: "Thiên Tâm", 7: "Thiên Trụ", 8: "Thiên Nhậm", 9: "Thiên Anh"
  };

  const DOOR_ORIGIN_PALACE = {
    1: "Hưu Môn", 2: "Tử Môn", 3: "Thương Môn", 4: "Đỗ Môn",
    6: "Khai Môn", 7: "Kinh Môn", 8: "Sinh Môn", 9: "Cảnh Môn"
  };

  const DEITIES_YANG_ORDER = [
    "Trực Phù", "Đằng Xà", "Thái Âm", "Lục Hợp", "Câu Trận", "Chu Tước", "Cửu Địa", "Cửu Thiên"
  ];
  const DEITIES_YIN_ORDER = [
    "Trực Phù", "Cửu Thiên", "Cửu Địa", "Huyền Vũ", "Bạch Hổ", "Lục Hợp", "Thái Âm", "Đằng Xà"
  ];

  const XUN_SHOU_MAP = {
    "Giáp Tý": ["Mậu", "Tý", ["Tuất", "Hợi"]], "Ất Sửu": ["Mậu", "Tý", ["Tuất", "Hợi"]],
    "Bính Dần": ["Mậu", "Tý", ["Tuất", "Hợi"]], "Đinh Mão": ["Mậu", "Tý", ["Tuất", "Hợi"]],
    "Mậu Thìn": ["Mậu", "Tý", ["Tuất", "Hợi"]], "Kỷ Tỵ": ["Mậu", "Tý", ["Tuất", "Hợi"]],
    "Canh Ngọ": ["Mậu", "Tý", ["Tuất", "Hợi"]], "Tân Mùi": ["Mậu", "Tý", ["Tuất", "Hợi"]],
    "Nhâm Thân": ["Mậu", "Tý", ["Tuất", "Hợi"]], "Quý Dậu": ["Mậu", "Tý", ["Tuất", "Hợi"]],
    "Giáp Tuất": ["Kỷ", "Tuất", ["Thân", "Dậu"]], "Ất Hợi": ["Kỷ", "Tuất", ["Thân", "Dậu"]],
    "Bính Tý": ["Kỷ", "Tuất", ["Thân", "Dậu"]], "Đinh Sửu": ["Kỷ", "Tuất", ["Thân", "Dậu"]],
    "Mậu Dần": ["Kỷ", "Tuất", ["Thân", "Dậu"]], "Kỷ Mão": ["Kỷ", "Tuất", ["Thân", "Dậu"]],
    "Canh Thìn": ["Kỷ", "Tuất", ["Thân", "Dậu"]], "Tân Tỵ": ["Kỷ", "Tuất", ["Thân", "Dậu"]],
    "Nhâm Ngọ": ["Kỷ", "Tuất", ["Thân", "Dậu"]], "Quý Mùi": ["Kỷ", "Tuất", ["Thân", "Dậu"]],
    "Giáp Thân": ["Canh", "Thân", ["Ngọ", "Mùi"]], "Ất Dậu": ["Canh", "Thân", ["Ngọ", "Mùi"]],
    "Bính Tuất": ["Canh", "Thân", ["Ngọ", "Mùi"]], "Đinh Hợi": ["Canh", "Thân", ["Ngọ", "Mùi"]],
    "Mậu Tý": ["Canh", "Thân", ["Ngọ", "Mùi"]], "Kỷ Sửu": ["Canh", "Thân", ["Ngọ", "Mùi"]],
    "Canh Dần": ["Canh", "Thân", ["Ngọ", "Mùi"]], "Tân Mão": ["Canh", "Thân", ["Ngọ", "Mùi"]],
    "Nhâm Thìn": ["Canh", "Thân", ["Ngọ", "Mùi"]], "Quý Tỵ": ["Canh", "Thân", ["Ngọ", "Mùi"]],
    "Giáp Ngọ": ["Tân", "Ngọ", ["Thìn", "Tỵ"]], "Ất Mùi": ["Tân", "Ngọ", ["Thìn", "Tỵ"]],
    "Bính Thân": ["Tân", "Ngọ", ["Thìn", "Tỵ"]], "Đinh Dậu": ["Tân", "Ngọ", ["Thìn", "Tỵ"]],
    "Mậu Tuất": ["Tân", "Ngọ", ["Thìn", "Tỵ"]], "Kỷ Hợi": ["Tân", "Ngọ", ["Thìn", "Tỵ"]],
    "Canh Tý": ["Tân", "Ngọ", ["Thìn", "Tỵ"]], "Tân Sửu": ["Tân", "Ngọ", ["Thìn", "Tỵ"]],
    "Nhâm Dần": ["Tân", "Ngọ", ["Thìn", "Tỵ"]], "Quý Mão": ["Tân", "Ngọ", ["Thìn", "Tỵ"]],
    "Giáp Thìn": ["Nhâm", "Thìn", ["Dần", "Mão"]], "Ất Tỵ": ["Nhâm", "Thìn", ["Dần", "Mão"]],
    "Bính Ngọ": ["Nhâm", "Thìn", ["Dần", "Mão"]], "Đinh Mùi": ["Nhâm", "Thìn", ["Dần", "Mão"]],
    "Mậu Thân": ["Nhâm", "Thìn", ["Dần", "Mão"]], "Kỷ Dậu": ["Nhâm", "Thìn", ["Dần", "Mão"]],
    "Canh Tuất": ["Nhâm", "Thìn", ["Dần", "Mão"]], "Tân Hợi": ["Nhâm", "Thìn", ["Dần", "Mão"]],
    "Nhâm Tý": ["Nhâm", "Thìn", ["Dần", "Mão"]], "Quý Sửu": ["Nhâm", "Thìn", ["Dần", "Mão"]],
    "Giáp Dần": ["Quý", "Dần", ["Tý", "Sửu"]], "Ất Mão": ["Quý", "Dần", ["Tý", "Sửu"]],
    "Bính Thìn": ["Quý", "Dần", ["Tý", "Sửu"]], "Đinh Tỵ": ["Quý", "Dần", ["Tý", "Sửu"]],
    "Mậu Ngọ": ["Quý", "Dần", ["Tý", "Sửu"]], "Kỷ Mùi": ["Quý", "Dần", ["Tý", "Sửu"]],
    "Canh Thân": ["Quý", "Dần", ["Tý", "Sửu"]], "Tân Dậu": ["Quý", "Dần", ["Tý", "Sửu"]],
    "Nhâm Tuất": ["Quý", "Dần", ["Tý", "Sửu"]], "Quý Hợi": ["Quý", "Dần", ["Tý", "Sửu"]]
  };

  const ZHI_RUN_JU_TABLE = {
    "Đông Chí": { dun: "Dương Độn", ju: [1, 7, 4] }, "Tiểu Hàn": { dun: "Dương Độn", ju: [2, 8, 5] },
    "Đại Hàn":  { dun: "Dương Độn", ju: [3, 9, 6] }, "Lập Xuân": { dun: "Dương Độn", ju: [8, 5, 2] },
    "Vũ Thủy":  { dun: "Dương Độn", ju: [9, 6, 3] }, "Kinh Trập":{ dun: "Dương Độn", ju: [1, 7, 4] },
    "Xuân Phân":{ dun: "Dương Độn", ju: [3, 9, 6] }, "Thanh Minh":{ dun: "Dương Độn", ju: [4, 1, 7] },
    "Cốc Vũ":   { dun: "Dương Độn", ju: [5, 2, 8] }, "Lập Hạ":   { dun: "Dương Độn", ju: [4, 1, 7] },
    "Tiểu Mãn": { dun: "Dương Độn", ju: [5, 2, 8] }, "Mang Chủng":{ dun: "Dương Độn", ju: [6, 3, 9] },
    "Hạ Chí":     { dun: "Âm Độn", ju: [9, 3, 6] }, "Tiểu Thử":   { dun: "Âm Độn", ju: [8, 2, 5] },
    "Đại Thử":    { dun: "Âm Độn", ju: [7, 1, 4] }, "Lập Thu":    { dun: "Âm Độn", ju: [2, 5, 8] },
    "Xử Thử":     { dun: "Âm Độn", ju: [1, 4, 7] }, "Bạch Lộ":    { dun: "Âm Độn", ju: [9, 3, 6] },
    "Thu Phân":   { dun: "Âm Độn", ju: [7, 1, 4] }, "Hàn Lộ":     { dun: "Âm Độn", ju: [6, 9, 3] },
    "Sương Giáng":{ dun: "Âm Độn", ju: [5, 8, 2] }, "Lập Đông":   { dun: "Âm Độn", ju: [6, 9, 3] },
    "Tiểu Tuyết": { dun: "Âm Độn", ju: [5, 8, 2] }, "Đại Tuyết":  { dun: "Âm Độn", ju: [4, 7, 1] }
  };

  const THAP_LUC_THAN = [
    { pos: 0, name: "Tý (Khảm)", cung: 8 },
    { pos: 1, name: "Sửu", cung: 3 },
    { pos: 2, name: "Cấn", cung: 3 },
    { pos: 3, name: "Dần", cung: 3 },
    { pos: 4, name: "Mão (Chấn)", cung: 4 },
    { pos: 5, name: "Thìn", cung: 9 },
    { pos: 6, name: "Tốn", cung: 9 },
    { pos: 7, name: "Tỵ", cung: 9 },
    { pos: 8, name: "Ngọ (Ly)", cung: 2 },
    { pos: 9, name: "Mùi", cung: 7 },
    { pos: 10, name: "Khôn", cung: 7 },
    { pos: 11, name: "Thân", cung: 7 },
    { pos: 12, name: "Dậu (Đoài)", cung: 6 },
    { pos: 13, name: "Tuất", cung: 1 },
    { pos: 14, name: "Càn", cung: 1 },
    { pos: 15, name: "Hợi", cung: 1 }
  ];

  // ==============================================================================
  // 3. THUẬT TOÁN KỲ MÔN, THÁI ẤT & LỤC NHÂM
  // ==============================================================================

  // --- 3.1. THÁI ẤT THẦN KINH CORE ---
  function computeThaiAtCore(year, yearChi = "Ngọ") {
    const delta_year = ((year - 1984) % 360 + 360) % 360;
    const cuc_hoan_chu = (delta_year % 72) + 1;
    const ky_so = Math.floor(delta_year / 72) + 1;

    let don_phap, cuc_so;
    if (cuc_hoan_chu <= 36) {
      don_phap = "Dương Độn";
      cuc_so = cuc_hoan_chu;
    } else {
      don_phap = "Âm Độn";
      cuc_so = cuc_hoan_chu - 36;
    }

    const idx = Math.floor((cuc_so - 1) / 3) % 8;
    const cung_thai_at = LAC_THU_PALACES[idx];

    let cung_van_xuong;
    if (don_phap === "Dương Độn") {
      cung_van_xuong = (10 + (cuc_so - 1)) % 16;
    } else {
      cung_van_xuong = ((2 - (cuc_so - 1)) % 16 + 16) % 16;
    }

    const chi_idx = DIA_CHI.indexOf(yearChi) >= 0 ? DIA_CHI.indexOf(yearChi) : 6;
    const cung_ke_than = ((3 - chi_idx) % 16 + 16) % 16;
    const cung_thuy_kich = (cung_ke_than + 8) % 16;

    function calculateSoToan(start_pos_16, target_palace, don) {
      let start_cung = THAP_LUC_THAN[start_pos_16].cung;
      if (!LAC_THU_PALACES.includes(start_cung)) {
        start_cung = (don === "Dương Độn") ? 2 : 8;
      }
      const start_idx = LAC_THU_PALACES.indexOf(start_cung);
      let cung_di_qua = [];
      let curr_idx = start_idx;
      let total_val = 0;

      if (start_cung === target_palace) {
        return { gia_tri: 0, cung_di_qua: [start_cung] };
      }
      while (true) {
        const palace = LAC_THU_PALACES[curr_idx];
        if (palace === target_palace) break;
        cung_di_qua.push(palace);
        total_val += palace;
        curr_idx = (curr_idx + 1) % LAC_THU_PALACES.length;
        if (cung_di_qua.length >= 8) break;
      }
      return { gia_tri: total_val, cung_di_qua };
    }

    const chu_toan = calculateSoToan(cung_van_xuong, cung_thai_at, don_phap);
    const khach_toan = calculateSoToan(cung_thuy_kich, cung_thai_at, don_phap);

    return {
      year,
      don_phap,
      cuc_so,
      cuc_hoan_chu,
      ky_so,
      cung_thai_at,
      chu_toan: chu_toan.gia_tri,
      khach_toan: khach_toan.gia_tri,
      danh_sach_cach_cuc: []
    };
  }

  // --- 3.2. KỲ MÔN ĐỘN GIÁP CORE (Zhi Run Native) ---
  function findFuTou(dayCan, dayChi) {
    const cIdx = THIEN_CAN.indexOf(dayCan);
    const zIdx = DIA_CHI.indexOf(dayChi);
    const dist = (cIdx % 5);
    const ftCanIdx = (cIdx - dist + 10) % 10;
    const ftChiIdx = (zIdx - dist + 12) % 12;
    return `${THIEN_CAN[ftCanIdx]} ${DIA_CHI[ftChiIdx]}`;
  }

  function computeZhiRunJu(solarTerm, dayCan, dayChi) {
    const ft = findFuTou(dayCan, dayChi);
    const ftChi = ft.split(' ')[1];
    let yuanIdx = 0;
    if (["Tý", "Ngọ", "Mão", "Dậu"].includes(ftChi)) yuanIdx = 0;
    else if (["Dần", "Thân", "Tỵ", "Hợi"].includes(ftChi)) yuanIdx = 1;
    else yuanIdx = 2;

    const termMeta = ZHI_RUN_JU_TABLE[solarTerm] || ZHI_RUN_JU_TABLE["Đông Chí"];
    return {
      dun_type: termMeta.dun,
      ju_number: termMeta.ju[yuanIdx]
    };
  }

  function plotFullChartKetNoiVuTru(solarTerm, dayCan, dayChi, hourCan, hourChi, deitySchool = "8thần") {
    const cucInfo = computeZhiRunJu(solarTerm, dayCan, dayChi);
    const dun = cucInfo.dun_type;
    const ju = cucInfo.ju_number;

    const earthPlate = {};
    let curr = ju;
    for (const stem of SAN_QI_LIU_YI_VN) {
      earthPlate[curr] = stem;
      if (dun === "Dương Độn") {
        curr = (curr % 9) + 1;
      } else {
        curr = (curr === 1) ? 9 : curr - 1;
      }
    }

    const pair = `${hourCan} ${hourChi}`;
    const xunInfo = XUN_SHOU_MAP[pair] || ["Mậu", "Tý", ["Tuất", "Hợi"]];
    const hourStemLeader = xunInfo[0];
    const hourXunBranch = xunInfo[1];
    const kongWang = xunInfo[2] || [];

    let leadPalace = 2;
    for (const pid of Object.keys(earthPlate)) {
      if (earthPlate[pid] === hourStemLeader) {
        leadPalace = parseInt(pid, 10);
        break;
      }
    }
    if (leadPalace === 5) leadPalace = 2;

    const leadStar = STAR_ORIGIN_PALACE[leadPalace] || "Thiên Tâm";
    const envoyDoor = DOOR_ORIGIN_PALACE[leadPalace] || "Khai Môn";

    const searchCan = (hourCan === "Giáp") ? hourStemLeader : hourCan;
    let targetHourPalace = 2;
    for (const pid of Object.keys(earthPlate)) {
      if (earthPlate[pid] === searchCan) {
        targetHourPalace = parseInt(pid, 10);
        break;
      }
    }
    if (targetHourPalace === 5) targetHourPalace = 2;

    const idxOrig = PALACE_ORDER_CLOCKWISE.indexOf(leadPalace);
    const idxDest = PALACE_ORDER_CLOCKWISE.indexOf(targetHourPalace);
    const shiftStars = ((idxDest - idxOrig) % 8 + 8) % 8;

    const starsInPalaces = {};
    const heavenStemsInPalaces = {};
    for (let i = 0; i < PALACE_ORDER_CLOCKWISE.length; i++) {
      const pOrig = PALACE_ORDER_CLOCKWISE[i];
      const pDest = PALACE_ORDER_CLOCKWISE[(i + shiftStars) % 8];
      const star = STAR_ORIGIN_PALACE[pOrig];
      starsInPalaces[pDest] = star;

      const hStem = earthPlate[pOrig];
      const stems = [hStem];
      if (star === "Thiên Nhuế" && earthPlate[5]) {
        stems.push(earthPlate[5]);
      }
      heavenStemsInPalaces[pDest] = stems;
    }

    const hourStep = ((DIA_CHI.indexOf(hourChi) - DIA_CHI.indexOf(hourXunBranch)) % 12 + 12) % 12;
    let destDoorPalace;
    if (dun === "Dương Độn") {
      destDoorPalace = ((leadPalace - 1 + hourStep) % 9) + 1;
    } else {
      destDoorPalace = ((leadPalace - 1 - hourStep) % 9 + 9) % 9 + 1;
    }
    if (destDoorPalace === 5) destDoorPalace = 2;

    const idxDoorOrig = PALACE_ORDER_CLOCKWISE.indexOf(leadPalace);
    const idxDoorDest = PALACE_ORDER_CLOCKWISE.indexOf(destDoorPalace);
    const shiftDoors = ((idxDoorDest - idxDoorOrig) % 8 + 8) % 8;

    const doorsInPalaces = {};
    for (let i = 0; i < PALACE_ORDER_CLOCKWISE.length; i++) {
      const pOrig = PALACE_ORDER_CLOCKWISE[i];
      const pDest = PALACE_ORDER_CLOCKWISE[(i + shiftDoors) % 8];
      doorsInPalaces[pDest] = DOOR_ORIGIN_PALACE[pOrig];
    }

    // Phân bổ Thần (Hỗ trợ 10 Thần Nguyễn Tấn Công và 8 Thần cổ điển)
    let deitiesInPalaces = {};
    const knEngine = global.KetNoiVuTruEngine || (typeof require !== 'undefined' ? (function() { try { return require('./ket_noi_vu_tru_engine'); } catch(e){ return null; } })() : null);

    if (deitySchool === '10thần' && knEngine && typeof knEngine.allocate10Deities === 'function') {
      deitiesInPalaces = knEngine.allocate10Deities(dun, targetHourPalace) || {};
    } else {
      const deityList = (dun === "Dương Độn") ? DEITIES_YANG_ORDER : DEITIES_YIN_ORDER;
      const startDeityIdx = PALACE_ORDER_CLOCKWISE.indexOf(targetHourPalace);
      for (let i = 0; i < deityList.length; i++) {
        const pId = PALACE_ORDER_CLOCKWISE[(startDeityIdx + i) % 8];
        deitiesInPalaces[pId] = deityList[i];
      }
    }

    const PALACE_BRANCHES = {
      1: ['Tý'], 2: ['Mùi', 'Thân'], 3: ['Mão'], 4: ['Thìn', 'Tỵ'],
      6: ['Tuất', 'Hợi'], 7: ['Dậu'], 8: ['Sửu', 'Dần'], 9: ['Ngọ']
    };

    let horseBranch = 'Thân';
    if (['Thân', 'Tý', 'Thìn'].includes(hourChi)) horseBranch = 'Dần';
    else if (['Dần', 'Ngọ', 'Tuất'].includes(hourChi)) horseBranch = 'Thân';
    else if (['Tỵ', 'Dậu', 'Sửu'].includes(hourChi)) horseBranch = 'Hợi';
    else if (['Hợi', 'Mão', 'Mùi'].includes(hourChi)) horseBranch = 'Tỵ';

    const palaceNames = {
      1: "Khảm (Chính Bắc)", 2: "Khôn (Tây Nam)", 3: "Chấn (Chính Đông)", 4: "Tốn (Đông Nam)",
      5: "Trung Cung", 6: "Càn (Tây Bắc)", 7: "Đoài (Chính Tây)", 8: "Cấn (Đông Bắc)", 9: "Ly (Chính Nam)"
    };

    const palaces = {};
    let dayPalace = 1;
    let hourPalace = targetHourPalace;

    for (let pid = 1; pid <= 9; pid++) {
      if (pid === 5) {
        palaces[pid] = {
          name: palaceNames[5],
          door: "-",
          star: "Thiên Cầm",
          stars: ["Thiên Cầm"],
          deity: "-",
          heaven_stem: earthPlate[5] || "Mậu",
          heaven_stems: [earthPlate[5] || "Mậu"],
          earth_stem: earthPlate[5] || "Mậu",
          earth_stems: [earthPlate[5] || "Mậu"],
          is_kong_wang: false,
          is_sky_horse: false
        };
        continue;
      }
      const branches = PALACE_BRANCHES[pid] || [];
      const isKW = Array.isArray(kongWang) && kongWang.some(b => branches.includes(b));
      const isHorse = branches.includes(horseBranch);
      const hStems = heavenStemsInPalaces[pid] || [earthPlate[pid]];
      const starName = starsInPalaces[pid] || "-";

      palaces[pid] = {
        name: palaceNames[pid],
        door: doorsInPalaces[pid] || "-",
        star: starName,
        stars: [starName],
        deity: deitiesInPalaces[pid] || "-",
        heaven_stem: hStems.join('/'),
        heaven_stems: hStems,
        earth_stem: earthPlate[pid] || "-",
        earth_stems: [earthPlate[pid] || "-"],
        is_kong_wang: isKW,
        is_sky_horse: isHorse
      };

      if (hStems.includes(dayCan)) {
        dayPalace = pid;
      }
    }

    if (dayCan === "Giáp") {
      const dayPair = `${dayCan} ${dayChi}`;
      const dayXun = XUN_SHOU_MAP[dayPair] || ["Mậu", "Tý", []];
      for (let pid = 1; pid <= 9; pid++) {
        if (palaces[pid].heaven_stems && palaces[pid].heaven_stems.includes(dayXun[0])) {
          dayPalace = pid;
          break;
        }
      }
    }

    return {
      cuc: `${dun} ${ju} Cục (${solarTerm})`,
      dun_type: dun,
      ju_number: ju,
      lead_star: leadStar,
      envoy_door: envoyDoor,
      lead_palace: leadPalace,
      chief_palace: targetHourPalace,
      kong_wang: kongWang,
      day_can: dayCan,
      day_chi: dayChi,
      hour_can: hourCan,
      hour_chi: hourChi,
      day_palace: dayPalace,
      hour_palace: hourPalace,
      deity_school: deitySchool,
      palaces
    };
  }

  // --- 3.3. ĐÁNH GIÁ ĐIỂM SỐ THÁI ẤT (S_T) ---
  function evaluateThaiAt(taData, role = "Chủ", domainCode = "D01") {
    const chu_val = taData.chu_toan;
    const khach_val = taData.khach_toan;
    const cung_ta = taData.cung_thai_at;

    let score = 50.0;
    const notes = [];

    const target_val = (role === "Chủ") ? chu_val : khach_val;
    const opp_val = (role === "Chủ") ? khach_val : chu_val;

    if (target_val >= 20) {
      score += 18.0;
      notes.push(`Toán ${role} = ${target_val} là Trường Toán (Dài, thế lực bền vững, hậu thuẫn sâu).`);
    } else if (target_val >= 10) {
      score += 8.0;
      notes.push(`Toán ${role} = ${target_val} là Trung Toán (Đầy đủ, vận hành bình hòa).`);
    } else {
      score -= 15.0;
      notes.push(`Toán ${role} = ${target_val} là Đoản Toán (Ngắn, nội lực mỏng, dễ hụt hơi).`);
    }

    let the_co = "";
    if (target_val > opp_val) {
      const diff = Math.min(20, target_val - opp_val);
      score += diff * 0.8;
      the_co = `Thế cờ nghiêng về ${role} (Toán ${target_val} > Đối phương ${opp_val}). Chiếm quyền chủ động.`;
    } else if (target_val < opp_val) {
      const diff = Math.min(20, opp_val - target_val);
      score -= diff * 0.8;
      the_co = `Đối phương chiếm ưu thế (Toán đối phương ${opp_val} > ${role} ${target_val}). Nên phòng thủ giữ thế.`;
    } else {
      the_co = `Toán Hòa (${target_val} = ${opp_val}). Cần tìm điểm đột phá từ nhân hòa và địa lợi.`;
    }

    let cung_desc = "";
    if ([1, 3, 7, 9].includes(cung_ta)) {
      score += 5.0;
      cung_desc = `Cung ${cung_ta} (Dương khí hiển lộ, biến động ngoại hướng).`;
    } else {
      cung_desc = `Cung ${cung_ta} (Âm khí tiềm tàng, tích lũy nội lực).`;
    }

    const cach_cuc_names = (taData.danh_sach_cach_cuc || []).map(c => typeof c === 'string' ? c : c.ten_cach_cuc);
    for (const c_name of cach_cuc_names) {
      if (c_name.includes("Bách") || c_name.includes("Tuyệt") || c_name.includes("Tù")) {
        score -= 10.0;
        notes.push(`Gặp cách cục trở ngại: ${c_name}.`);
      } else if (c_name.includes("Hòa") || c_name.includes("Phúc") || c_name.includes("Đại Tướng Đắc Lệnh")) {
        score += 10.0;
        notes.push(`Gặp cách cục cát tường: ${c_name}.`);
      }
    }

    score = Math.max(10.0, Math.min(95.0, score));

    return {
      score: Math.round(score * 10) / 10,
      details: {
        cung_thai_at: `Cung ${cung_ta} - ${cung_desc}`,
        chu_toan: chu_val,
        khach_toan: khach_val,
        the_co: the_co,
        cach_cuc: cach_cuc_names,
        key_finding: `Toán ${role} ${target_val} vs Đối phương ${opp_val}. ${the_co}`,
        detailed_analysis: notes.join(" ")
      }
    };
  }

  // --- 3.4. ĐÁNH GIÁ ĐIỂM SỐ KỲ MÔN (S_K) - HỖ TRỢ ĐA DỤNG THẦN & 10 THẦN ---
  function evaluateKyMon(kmData, role = "Chủ", domainCode = "D01", solarTerm = "Thu Phân", options = {}) {
    const knEngine = global.KetNoiVuTruEngine || (typeof require !== 'undefined' ? (function() { try { return require('./ket_noi_vu_tru_engine'); } catch(e){ return null; } })() : null);

    const DOMAIN_MAP = {
      D01: 'career', D02: 'wealth', D03: 'marriage', D04: 'medical',
      D05: 'real_estate', D06: 'lawsuit', D07: 'contract', D08: 'exam',
      D09: 'career', D10: 'debt', D11: 'lost_item', D12: 'missing_user'
    };
    const omniKey = DOMAIN_MAP[domainCode] || 'career';
    const querentOptions = {
      mode: options.querentMode || 'hour',
      year: options.birthYear || 1985,
      stem: options.querentStem,
      branch: options.querentBranch,
      gender: options.gender || 'nam'
    };

    let omniRes = null;
    if (knEngine && typeof knEngine.runOmniForecast === 'function') {
      try {
        omniRes = knEngine.runOmniForecast(omniKey, kmData, querentOptions);
      } catch (e) {
        console.warn("TamThuc: KetNoiVuTruEngine runOmniForecast warning:", e);
      }
    }

    if (omniRes) {
      const t1 = omniRes.primaryTargetInfo || {};
      const t2 = omniRes.secondaryTargetInfo || null;
      const subj = omniRes.subjectInfo || {};

      let formationText = `Môn [${t1.door || ''}] + Tinh [${t1.star || ''}] + Thần [${t1.deity || ''}]`;
      if (t2) {
        formationText += ` | Đối trọng [${t2.roleName || t2.targetLabel}]: ${t2.door} + ${t2.star} + ${t2.deity}`;
      }

      let palaceDesc = `${t1.name} [${t1.roleName || t1.targetLabel || 'Dụng Thần'}]`;
      if (t2) {
        palaceDesc += ` & ${t2.name} [${t2.roleName || t2.targetLabel}]`;
      }

      const stripHtml = (s) => (s ? String(s).replace(/<[^>]*>/g, '').trim() : '');

      let detailedNotes = [];
      if (omniRes.layers?.hostGuest) {
        detailedNotes.push(stripHtml(omniRes.layers.hostGuest));
      }
      if (omniRes.layers?.specialStates) {
        detailedNotes.push(stripHtml(omniRes.layers.specialStates));
      }
      if (omniRes.layers?.strategy) {
        detailedNotes.push(stripHtml(omniRes.layers.strategy));
      }

      return {
        score: omniRes.score,
        details: {
          cuc: kmData.cuc || `Kỳ Môn (${solarTerm})`,
          deity_school: kmData.deity_school === '10thần' ? '10 Thần (Nguyễn Tấn Công)' : '8 Thần',
          truc_phu: kmData.lead_star || kmData.truc_phu || "",
          truc_su: kmData.envoy_door || kmData.truc_su || "",
          palace_name: palaceDesc,
          target1: t1,
          target2: t2,
          subject: subj,
          omniForecast: omniRes,
          formation: formationText,
          auspicious_directions: omniRes.layers?.direction ? stripHtml(omniRes.layers.direction) : `Phương vị cung ${t1.name} và hướng Trực Phù.`,
          key_finding: `${omniRes.domainName}: ${omniRes.relationship} (${omniRes.verdict})`,
          detailed_analysis: detailedNotes.join("\n\n")
        }
      };
    }

    // Fallback nếu không có KetNoiVuTruEngine
    let target_door = "Sinh Môn";
    if (["D01", "D09", "D06"].includes(domainCode)) {
      target_door = "Khai Môn";
    } else if (["D03", "D07"].includes(domainCode)) {
      target_door = "Hưu Môn";
    } else if (["D08", "D11"].includes(domainCode)) {
      target_door = "Kinh Môn";
    }

    const palaces = kmData.palaces || {};
    let targetPalace = null;
    let targetPalaceName = "";

    for (const pKey of Object.keys(palaces)) {
      const p = palaces[pKey];
      if (p.door && p.door.includes(target_door)) {
        targetPalace = p;
        targetPalaceName = p.name || pKey;
        break;
      }
    }

    if (!targetPalace && Object.keys(palaces).length > 0) {
      const firstKey = Object.keys(palaces)[0];
      targetPalace = palaces[firstKey];
      targetPalaceName = targetPalace.name || firstKey;
    }

    let score = 50.0;
    const notes = [];

    const door = targetPalace ? (targetPalace.door || "") : "";
    const star = targetPalace ? (targetPalace.star || "") : "";
    const god = targetPalace ? (targetPalace.deity || targetPalace.god || "") : "";

    const cat_mon = ["Sinh Môn", "Hưu Môn", "Khai Môn"];
    const hung_mon = ["Tử Môn", "Kinh Môn", "Thương Môn"];
    if (cat_mon.some(m => door.includes(m))) {
      score += 18.0;
      notes.push(`Gặp Tam Cát Môn (${door}) tại cung dụng thần.`);
    } else if (hung_mon.some(m => door.includes(m))) {
      score -= 15.0;
      notes.push(`Gặp Hung Môn (${door}) cản trở, cần thận trọng va chạm.`);
    } else {
      score += 4.0;
      notes.push(`Gặp Trung Môn (${door}), thế cờ ổn định.`);
    }

    const cat_tinh = ["Thiên Phụ", "Thiên Câm", "Thiên Tâm", "Thiên Nhậm", "Thiên Cầm"];
    const hung_tinh = ["Thiên Bồng", "Thiên Nhuế", "Thiên Trụ"];
    if (cat_tinh.some(t => star.includes(t))) {
      score += 12.0;
      notes.push(`Được Cát Tinh (${star}) tương trợ tăng cường năng lực mưu lược.`);
    } else if (hung_tinh.some(t => star.includes(t))) {
      score -= 10.0;
      notes.push(`Phạm Hung Tinh (${star}), dễ hao tổn hoặc sinh tật bệnh/nghi hoặc.`);
    }

    const cat_than = ["Trực Phù", "Thái Âm", "Lục Hợp", "Cửu Địa", "Cửu Thiên"];
    if (cat_than.some(g => god.includes(g))) {
      score += 10.0;
      notes.push(`Đắc Cát Thần (${god}) che chở, có quý nhân phù trợ.`);
    } else if (god.includes("Đằng Xà") || god.includes("Bạch Hổ")) {
      score -= 8.0;
      notes.push(`Lâm Hung Thần (${god}), đề phòng thị phi, trở ngại bất ngờ.`);
    }

    const isVoid = !!(targetPalace && targetPalace.is_kong_wang);
    if (isVoid) {
      score *= 0.7;
      notes.push("Cung vị lâm Tuần Không, mưu sự dễ gặp hư ảo hoặc chậm tiến độ.");
    }

    score = Math.max(10.0, Math.min(95.0, score));

    return {
      score: Math.round(score * 10) / 10,
      details: {
        cuc: kmData.cuc || `Kỳ Môn (${solarTerm})`,
        deity_school: kmData.deity_school === '10thần' ? '10 Thần (Nguyễn Tấn Công)' : '8 Thần',
        truc_phu: kmData.lead_star || kmData.truc_phu || "",
        truc_su: kmData.envoy_door || kmData.truc_su || "",
        palace_name: targetPalaceName,
        formation: `Môn [${door}] + Tinh [${star}] + Thần [${god}]`,
        auspicious_directions: `Phương vị cung ${targetPalaceName} và hướng Trực Phù.`,
        key_finding: `Cung Dụng Thần ${targetPalaceName}: Bát Môn ${door}, Cửu Tinh ${star}, Thần ${god}.`,
        detailed_analysis: notes.join(" ")
      }
    };
  }

  // --- 3.5. ĐÁNH GIÁ ĐIỂM SỐ LỤC NHÂM (S_L) ---
  function evaluateLucNham(lnData, role = "Chủ", domainCode = "D01") {
    let score = 50.0;
    const notes = [];

    const cach_cuc_name = lnData.tamTruyenTenTong || lnData.cach_cuc || "";
    const so_truyen = lnData.soTruyen || (lnData.tam_truyen && lnData.tam_truyen.so_truyen) || {};
    const trung_truyen = lnData.trungTruyen || (lnData.tam_truyen && lnData.tam_truyen.trung_truyen) || {};
    const mat_truyen = lnData.matTruyen || (lnData.tam_truyen && lnData.tam_truyen.mat_truyen) || {};
    const tu_khoa = lnData.tuKhoa || lnData.tu_khoa || [];

    if (cach_cuc_name.includes("Tặc Khắc")) {
      score += 6.0;
      notes.push("Cách Tặc Khắc: Khí thế chủ động, sự việc có động lực khởi phát rõ ràng.");
    } else if (cach_cuc_name.includes("Tỷ Dụng") || cach_cuc_name.includes("Thiệp Hại")) {
      score += 2.0;
      notes.push("Cách Tỷ Dụng / Thiệp Hại: Cần lựa chọn cân nhắc kỹ, vượt qua thử thách ban đầu.");
    } else if (cach_cuc_name.includes("Dao Khắc") || cach_cuc_name.includes("Mão Tinh")) {
      score -= 5.0;
      notes.push("Cách Dao Khắc / Mão Tinh: Thế cờ động mà chưa định hướng, xa xôi trắc trở.");
    } else if (cach_cuc_name.includes("Bát Chuyên") || cach_cuc_name.includes("Phục Ngâm")) {
      score -= 8.0;
      notes.push("Cách Bát Chuyên / Phục Ngâm: Trì trệ, nội bộ tự mâu thuẫn hoặc dậm chân tại chỗ.");
    } else if (cach_cuc_name.includes("Phản Ngâm")) {
      score -= 10.0;
      notes.push("Cách Phản Ngâm: Biến động lật ngược qua lại, khó giữ vững trạng thái ban đầu.");
    }

    const so_tuong = (so_truyen.thienTuong || so_truyen.thien_tuong || "").toLowerCase();
    const so_than = (so_truyen.lucThan || so_truyen.luc_than || "").toLowerCase();
    const mat_tuong = (mat_truyen.thienTuong || mat_truyen.thien_tuong || "").toLowerCase();
    const mat_than = (mat_truyen.lucThan || mat_truyen.luc_than || "").toLowerCase();

    const cat_tuong = ["quý nhân", "thanh long", "lục hợp", "thái thường"];
    const hung_tuong = ["bạch hổ", "đằng xà", "huyền vũ", "chu tước"];

    if (cat_tuong.some(t => so_tuong.includes(t))) {
      score += 10.0;
      notes.push(`Sơ Truyền đắc Cát Tướng (${so_truyen.thienTuong || so_truyen.thien_tuong}): Khởi sự thuận lợi, có thế lực nâng đỡ.`);
    } else if (hung_tuong.some(t => so_tuong.includes(t))) {
      score -= 8.0;
      notes.push(`Sơ Truyền lâm Hung Tướng (${so_truyen.thienTuong || so_truyen.thien_tuong}): Ban đầu có lo âu, thị phi hoặc áp lực.`);
    }

    if (cat_tuong.some(t => mat_tuong.includes(t))) {
      score += 14.0;
      notes.push(`Mạt Truyền đắc Cát Tướng (${mat_truyen.thienTuong || mat_truyen.thien_tuong}): Hậu vận viên mãn, kết quả đắc thắng.`);
    } else if (hung_tuong.some(t => mat_tuong.includes(t))) {
      score -= 12.0;
      notes.push(`Mạt Truyền lâm Hung Tướng (${mat_truyen.thienTuong || mat_truyen.thien_tuong}): Đề phòng tổn thất ở chặng cuối.`);
    }

    if (["D02", "D05"].includes(domainCode)) {
      if (so_than.includes("thê tài") || mat_than.includes("thê tài")) {
        score += 10.0;
        notes.push("Tam Truyền xuất hiện Thê Tài: Dòng tiền và nguồn lợi hữu hình thông suốt.");
      } else if (so_than.includes("huynh đệ") || mat_than.includes("huynh đệ")) {
        score -= 8.0;
        notes.push("Tam Truyền xuất hiện Huynh Đệ (Kiếp Tài): Đề phòng hao tài hoặc đối tác chia phần.");
      }
    } else if (["D01", "D09"].includes(domainCode)) {
      if ((so_than.includes("quan quỷ") || mat_than.includes("quan quỷ")) &&
          cat_tuong.some(t => so_tuong.includes(t) || mat_tuong.includes(t))) {
        score += 10.0;
        notes.push("Quan Quỷ hóa Quyền: Thăng tiến nắm giữ thực quyền và trọng trách mới.");
      } else if (so_than.includes("phụ mẫu") || mat_than.includes("phụ mẫu")) {
        score += 8.0;
        notes.push("Tam Truyền đắc Phụ Mẫu: Văn bằng, giấy phép, công văn phê chuẩn thuận lợi.");
      }
    }

    // Đếm số khóa sinh/khắc (Chỉ tính chính xác 'Sinh' và 'Khắc' theo chuẩn Python)
    const sinh_count = tu_khoa.filter(k => (k.quanHe || k.quan_he) === "Sinh").length;
    const khac_count = tu_khoa.filter(k => (k.quanHe || k.quan_he) === "Khắc").length;

    let tu_khoa_status = "";
    if (sinh_count >= 2) {
      score += 6.0;
      tu_khoa_status = `Tứ Khóa đa sinh (${sinh_count} Khóa Sinh): Khí huyết hòa hợp, đôi bên có thiện chí.`;
    } else if (khac_count >= 2) {
      score -= 6.0;
      tu_khoa_status = `Tứ Khóa đa khắc (${khac_count} Khóa Khắc): Mâu thuẫn tiềm ẩn, cạnh tranh gay gắt.`;
    } else {
      tu_khoa_status = "Tứ Khóa cân bằng sinh khắc: Tương tác khách quan, phụ thuộc thực lực.";
    }

    score = Math.max(10.0, Math.min(95.0, score));

    function fmtStep(s) {
      const c = s.chi || "";
      const lt = s.lucThan || s.luc_than || "";
      const tt = s.thienTuong || s.thien_tuong || "";
      return `${c} (${lt} - ${tt})`;
    }

    return {
      score: Math.round(score * 10) / 10,
      details: {
        nguyet_tuong: `${lnData.nguyetTuong || lnData.nguyet_tuong || ""} (${lnData.tenNguyetTuong || lnData.ten_nguyet_tuong || ""})`,
        cach_cuc: cach_cuc_name,
        so_truyen: fmtStep(so_truyen),
        trung_truyen: fmtStep(trung_truyen),
        mat_truyen: fmtStep(mat_truyen),
        tu_khoa_status: tu_khoa_status,
        than_tuong_analysis: `Sơ: ${so_truyen.thienTuong || so_truyen.thien_tuong || ""} | Mạt: ${mat_truyen.thienTuong || mat_truyen.thien_tuong || ""}`,
        key_finding: `Tam Truyền ${fmtStep(so_truyen)} -> ${fmtStep(mat_truyen)}. ${tu_khoa_status}`,
        detailed_analysis: notes.join(" ")
      }
    };
  }

  // ==============================================================================
  // 4. SUY LUẬN CHUYÊN SÂU 12 MIỀN NGHIỆP VỤ (LAYER 5 ACTION PLAN)
  // ==============================================================================
  function deepAnalyzeDomain(domainCode, role, ta, km, ln) {
    const code = String(domainCode || "D01").toUpperCase().trim();
    const chu_toan = ta.chu_toan || 0;
    const khach_toan = ta.khach_toan || 0;

    switch (code) {
      case "D01":
        return {
          domain_code: "D01",
          primary_dung_than: "Khai Môn + Quan Quỷ + Thái Ất Cung",
          deep_reasoning: [
            `Thế trận Quan lộ: Thái Ất ghi nhận Toán Chủ ${chu_toan} so với Toán Khách ${khach_toan}. ` +
            (chu_toan > khach_toan ? "Cơ hội thăng tiến thuộc về nội bộ cơ quan (Chủ vị đắc thế)." : "Có sự cạnh tranh gay gắt từ bên ngoài hoặc ứng viên luân chuyển từ nơi khác tới."),
            "Kỳ Môn Độn Giáp: Cung vị công danh hội tụ khí tức qua hệ thống cửa quyền, vị trí lãnh đạo cần chú trọng sự minh bạch.",
            "Lục Nhâm Đại Độn: Diễn tiến Tam Truyền phản ánh tiến trình bổ nhiệm qua 3 giai đoạn xét duyệt, từ đề xuất sơ khởi đến quyết định cuối cùng."
          ],
          specific_risks: [
            "Đề phòng tin đồn thất thiệt (thị phi khẩu thiệt) từ đối thủ cạnh tranh ngầm.",
            "Tránh việc nóng vội công khai kế hoạch trước khi có văn bản chính thức của cấp có thẩm quyền."
          ],
          concrete_actions: [
            "Củng cố hồ sơ thành tích, văn bằng chứng chỉ và báo cáo kết quả công tác minh bạch.",
            "Thiết lập kênh liên lạc chuẩn mực, tôn trọng cấp trên và tạo sự đồng thuận trong tập thể."
          ],
          timing_windows: [
            "Thời điểm khởi động tiếp cận: Đầu tháng âm lịch hoặc tiết khí mới.",
            "Thời điểm chốt quyết định: Khi nguyệt lệnh tương sinh với bản mệnh."
          ]
        };

      case "D02":
        return {
          domain_code: "D02",
          primary_dung_than: "Sinh Môn + Mậu + Thê Tài",
          deep_reasoning: [
            "Chu kỳ dòng tiền vĩ mô (Thái Ất): Đang trong giai đoạn phân hóa dòng vốn; các tài sản mang tính đầu cơ cao chịu áp lực điều chỉnh.",
            "Kênh sinh lời (Kỳ Môn): Vị trí Sinh Môn cho thấy cơ hội ở các lĩnh vực hạ tầng, sản xuất thực, hoặc bất động sản có dòng tiền vận hành.",
            "Dòng tiền vi mô (Lục Nhâm): Thê Tài xuất hiện trong Tam Truyền phản ánh tính thanh khoản thực tế của thương vụ."
          ],
          specific_risks: [
            "Rủi ro đòn bẩy tài chính quá mức khi chu kỳ lãi suất vĩ mô biến động.",
            "Nguy cơ đối tác chậm giải ngân hoặc phát sinh chi phí ẩn ngoài dự toán."
          ],
          concrete_actions: [
            "Ưu tiên giữ tỷ trọng tiền mặt và tài sản có tính thanh khoản cao tối thiểu 30%.",
            "Thực hiện thẩm định pháp lý (Due Diligence) tài sản trước khi đặt cọc hoặc ký kết giải ngân."
          ],
          timing_windows: [
            "Giai đoạn giải ngân an toàn: Sau khi thị trường kiểm định lại vùng hỗ trợ vĩ mô.",
            "Thời điểm chốt lời từng phần: Khi đạt mục tiêu lợi nhuận kỳ vọng ban đầu."
          ]
        };

      case "D03":
        return {
          domain_code: "D03",
          primary_dung_than: "Lục Hợp + Tứ Khóa Can Chi + Thiên Hậu",
          deep_reasoning: [
            "Khí số hôn nhân gia đạo phụ thuộc 60% vào Lục Nhâm (tâm tư tình cảm và giao tiếp nội bộ).",
            "Tứ Khóa phản ánh rõ nét sự tương thích giữa hai bên: Sự nhường nhịn hay cái tôi chi phối.",
            "Kỳ Môn xét phương diện ngoại cảnh: Sự can thiệp của gia đình hai bên hoặc khoảng cách địa lý."
          ],
          specific_risks: [
            "Mâu thuẫn nảy sinh từ việc thiếu lắng nghe và suy diễn cảm tính.",
            "Tác động ngoại cảnh từ người thứ ba hoặc gánh nặng kinh tế gia đình."
          ],
          concrete_actions: [
            "Thiết lập cuộc đối thoại thẳng thắn trên tinh thần xây dựng và tôn trọng lẫn nhau.",
            "Tạo không gian riêng tư để giải tỏa các ức chế tâm lý tích tụ lâu ngày."
          ],
          timing_windows: [
            "Thời điểm hóa giải xung đột: Chọn ngày có can chi tương sinh, tránh các ngày Trực Phá, Xung."
          ]
        };

      case "D04":
        return {
          domain_code: "D04",
          primary_dung_than: "Thiên Nhuế + Thiên Tâm + Quan Quỷ",
          deep_reasoning: [
            "Kỳ Môn Độn Giáp chẩn đoán vị trí ổ bệnh qua Thiên Nhuế Tinh và Tử Môn; tìm phương hướng bác sĩ giỏi qua Thiên Tâm Tinh.",
            "Lục Nhâm Đại Độn phân tích gốc rễ ngũ tạng: Can (Khóa I), Chi (Khóa III) và Quan Quỷ khắc Thân.",
            "Thái Ất Thần Kinh theo dõi yếu tố thời tiết dịch tễ và khí hậu tác động lên thể trạng."
          ],
          specific_risks: [
            "Chủ quan trước các triệu chứng ban đầu dẫn đến việc bệnh tiến triển âm ỉ.",
            "Dùng thuốc không đúng chỉ định hoặc chậm trễ can thiệp y tế chuyên khoa."
          ],
          concrete_actions: [
            "Đi khám tổng quát tại bệnh viện tuyến trên, đặc biệt tầm soát tại các chuyên khoa liên quan.",
            "Điều chỉnh chế độ dinh dưỡng, nghỉ ngơi và luyện tập thể chất phù hợp với ngũ hành bản mệnh."
          ],
          timing_windows: [
            "Thời điểm phẫu thuật/điều trị tối ưu: Chọn phương vị Thiên Y, Thiên Tâm và tránh ngày Thụ Tử, Sát Chủ."
          ]
        };

      case "D05":
        return {
          domain_code: "D05",
          primary_dung_than: "Sinh Môn + Cửu Địa + Chi vi Trạch",
          deep_reasoning: [
            "Kỳ Môn định vị tọa hướng công trình qua 24 sơn hướng, Bát Môn và Cửu Tinh tương ứng với địa hình thực địa.",
            "Lục Nhâm Đại Độn soi xét mạch ngầm: Khóa III (Chi vi Trạch), Khóa IV (Kim tĩnh/Móng ngầm) và Trạch Mộ.",
            "Thái Ất đánh giá đại vận vùng đất theo Bát Phong và chu kỳ nguyên vận dài hạn."
          ],
          specific_risks: [
            "Phạm xuyên tâm sát, góc nhọn công trình lân cận chiếu thẳng vào cửa chính.",
            "Mạch nước ngầm hoặc cấu trúc địa chất bên dưới móng nhà có hiện tượng rỗng, lún cục bộ."
          ],
          concrete_actions: [
            "Bố trí lại trục giao thông và huyền quan để dẫn vượng khí vào trung cung ngôi nhà.",
            "Khảo sát địa chất công trình kỹ lưỡng trước khi đào móng hoặc tôn tạo mồ mả gia tộc."
          ],
          timing_windows: [
            "Thời điểm khởi công/động thổ: Chọn giờ Hoàng Đạo, hợp tuổi gia chủ, tránh hướng Thái Tuế sát."
          ]
        };

      case "D06":
        return {
          domain_code: "D06",
          primary_dung_than: "Kinh Môn + Khai Môn + Chu Tước",
          deep_reasoning: [
            "Toán Chủ và Toán Khách của Thái Ất phân định ai là người nắm giữ bằng chứng thép trước tòa.",
            "Kỳ Môn: Kinh Môn đại diện cho bên nguyên/bên bị tranh cãi; Khai Môn đại diện cho cơ quan tố tụng.",
            "Lục Nhâm: Chu Tước chủ về khẩu thiệt thị phi và giấy tờ pháp lý; Quan Quỷ chủ về phán quyết."
          ],
          specific_risks: [
            "Sơ hở trong điều khoản hợp đồng bị đối phương khai thác để bắt bẻ pháp lý.",
            "Chứng cứ thu thập không đúng trình tự luật định dẫn đến việc bị bác bỏ tại tòa."
          ],
          concrete_actions: [
            "Mời luật sư có kinh nghiệm tham gia tranh tụng ngay từ giai đoạn hòa giải cơ sở.",
            "Rà soát lại toàn bộ nhật ký giao dịch, văn bản trao đổi và biên bản đối chiếu công nợ."
          ],
          timing_windows: [
            "Thời điểm nộp đơn/đàm phán: Chọn lúc khí số thuộc về phe mình (Toán phe mình chiếm thế thượng phong)."
          ]
        };

      case "D07":
        return {
          domain_code: "D07",
          primary_dung_than: "Cảnh Môn + Lục Hợp + Khách Chủ Toán",
          deep_reasoning: [
            `Thương thảo & Đàm phán: Thái Ất ghi nhận Toán Chủ ${chu_toan} vs Toán Khách ${khach_toan}. ` +
            (chu_toan > khach_toan ? "Bên Chủ nắm quyền ra giá và áp đặt điều khoản chính yếu." : "Bên đối tác (Khách) có thế mạnh đàm phán, cần có chiến thuật nhượng bộ linh hoạt."),
            "Kỳ Môn: Cảnh Môn (điều khoản văn bản thỏa thuận) và Khai Môn (cơ quan phê duyệt / quyết định chính thức).",
            "Lục Nhâm: Lục Hợp xuất hiện chủ về sự hòa hợp, đối tác có thiện chí muốn tiến tới hợp đồng lâu dài."
          ],
          specific_risks: [
            "Đối tác giấu bài hoặc cố tình kéo dài thời gian thương lượng để gây sức ép tài chính.",
            "Điều khoản bảo lãnh, thanh toán hoặc phạt vi phạm không rõ ràng."
          ],
          concrete_actions: [
            "Xác lập trước các giới hạn đỏ (walk-away point) không thể nhượng bộ trước khi bước vào phòng đàm phán.",
            "Soạn thảo phụ lục hợp đồng chi tiết, quy định rõ cơ chế giải quyết tranh chấp."
          ],
          timing_windows: [
            "Khung giờ đàm phán tối ưu: Giờ đắc Cát Môn (Khai Môn hoặc Hưu Môn) và Thiên Phụ Tinh."
          ]
        };

      case "D08":
        return {
          domain_code: "D08",
          primary_dung_than: "Cảnh Môn + Thiên Phụ + Phụ Mẫu",
          deep_reasoning: [
            "Kỳ Môn: Cảnh Môn đại diện cho đề thi, văn chương; Thiên Phụ Tinh đại diện cho hội đồng thi, người chấm.",
            "Lục Nhâm: Phụ Mẫu hào đại diện cho bảng điểm, văn bằng, kết quả phê chuẩn; Chu Tước đại diện cho bảng vàng đề danh.",
            "Thái Ất: Văn Xương và Phúc Thần trợ vận cho trí tuệ sáng suốt."
          ],
          specific_risks: [
            "Học lệch tủ hoặc tâm lý phòng thi căng thẳng dẫn đến sai sót ở các câu hỏi cơ bản.",
            "Sơ suất trong việc chuẩn bị hồ sơ hoặc mang nhầm quy chế thi cử."
          ],
          concrete_actions: [
            "Lập đề cương ôn tập tổng thể, giải đề thi thử bấm giờ nghiêm túc.",
            "Giữ tâm lý bình tĩnh, ngủ đủ giấc trước ngày thi chính thức."
          ],
          timing_windows: [
            "Khung giờ ôn luyện và làm bài hiệu quả cao: Giờ đắc Văn Xương hoặc Thiên Phụ Tinh."
          ]
        };

      case "D09":
        return {
          domain_code: "D09",
          primary_dung_than: "Dịch Mã + Cửu Thiên + Hưu/Sinh Môn",
          deep_reasoning: [
            "Kỳ Môn Độn Giáp là môn cốt lõi để chọn phương hướng xuất hành (Kỳ Môn Độn Giáp Xuất Hành Quyết).",
            "Tìm hướng có Sinh Môn, Hưu Môn hoặc Khai Môn kết hợp với Cửu Thiên (thông suốt bay cao, hành trình suôn sẻ).",
            "Lục Nhâm xét Dịch Mã và Thiên Mã để xác định phương tiện di chuyển có gặp trở ngại dọc đường hay không."
          ],
          specific_risks: [
            "Xuất hành về phương vị phạm Tuyệt Mạng, Ngũ Quỷ hoặc gặp Kinh Môn, Thương Môn gây trễ chuyến, hỏng hóc phương tiện."
          ],
          concrete_actions: [
            "Xuất phát đúng hướng cát khí đã tính toán; kiểm tra kỹ lưỡng phương tiện và giấy tờ tùy thân trước khi khởi hành."
          ],
          timing_windows: [
            "Giờ xuất hành: Chọn giờ có Trực Phù hoặc Cát Tinh đăng lâm phương vị cần đi."
          ]
        };

      case "D10":
        return {
          domain_code: "D10",
          primary_dung_than: "Huyền Vũ + Đỗ Môn + Tuần Không",
          deep_reasoning: [
            "Kỳ Môn: Huyền Vũ là kẻ lấy trộm; Đỗ Môn là nơi cất giấu; Bát Quái Cung vị chỉ rõ phương hướng và tính chất địa điểm (trong nhà, ngoài trời, gần nước hay trên gác).",
            "Lục Nhâm: Thiên Không chủ về mất hẳn; Tuần Không chủ về đồ vật vẫn còn quanh quẩn chưa đi xa.",
            "Thái Ất: Kế Thần xét sự ẩn nặc thông tin."
          ],
          specific_risks: [
            "Chậm trễ trong việc rà soát hiện trường dẫn đến việc dấu vết bị xóa bỏ."
          ],
          concrete_actions: [
            "Tập trung tìm kiếm theo phương vị của cung chứa Đỗ Môn và nơi có đặc tính ngũ hành tương ứng.",
            "Trích xuất camera an ninh và rà soát người qua lại trong khung thời gian nghi vấn."
          ],
          timing_windows: [
            "Thời điểm vàng truy tìm: Trong vòng 24 giờ kể từ thời điểm phát hiện thất lạc."
          ]
        };

      case "D11":
        return {
          domain_code: "D11",
          primary_dung_than: "Quân Cơ/Dân Cơ + Khóa II + Trực Sử",
          deep_reasoning: [
            "Thái Ất: Tương quan Quân Cơ (Lãnh đạo) và Dân Cơ (Cấp dưới/Đội ngũ) phản ánh sự gắn kết nội bộ.",
            "Lục Nhâm: Khóa II (Can Âm Thần) và Lục Thân Huynh Đệ soi thấu tâm lý bè phái, sự trung thành.",
            "Kỳ Môn: Trực Sử đại diện cho bộ máy thừa hành; Đỗ Môn đại diện cho những toan tính ngầm."
          ],
          specific_risks: [
            "Hình thành các nhóm lợi ích cục bộ làm suy yếu kỷ luật và hiệu suất chung của tổ chức.",
            "Bổ nhiệm nhân sự không tương xứng với năng lực thực tế hoặc có động cơ cá nhân."
          ],
          concrete_actions: [
            "Thiết lập cơ chế đánh giá KPI định lượng, minh bạch và luân chuyển vị trí định kỳ.",
            "Tăng cường đối thoại cởi mở giữa các cấp quản lý và nhân viên trực tiếp."
          ],
          timing_windows: [
            "Thời điểm cơ cấu lại bộ máy: Đầu năm tài chính hoặc khi hoàn thành dự án lớn."
          ]
        };

      case "D12":
        return {
          domain_code: "D12",
          primary_dung_than: "Đại Du + 72 Cục Thái Ất + Mạt Truyền",
          deep_reasoning: [
            "Thái Ất Thần Kinh nắm quyền tối cao trong định hướng chiến lược dài hạn 5 - 10 năm.",
            "Vận hội 72 Cục Thái Ất kết hợp với vòng quay Đại Du chỉ ra chu kỳ thịnh suy của thời cuộc.",
            "Kỳ Môn mở lối đột phá chiến lược không gian; Lục Nhâm xác định các mắt xích nhân sự cốt lõi."
          ],
          specific_risks: [
            "Bơi ngược dòng chảy của thời đại công nghệ và thay đổi thể chế pháp lý.",
            "Quá tự mãn với thành công ngắn hạn mà bỏ qua các tín hiệu cảnh báo chuyển dịch chu kỳ."
          ],
          concrete_actions: [
            "Xây dựng chiến lược dài hạn linh hoạt (Agile Strategy), chủ động thích ứng với biến số vĩ mô.",
            "Đầu tư vào năng lực cốt lõi, công nghệ mới và đào tạo đội ngũ kế cận."
          ],
          timing_windows: [
            "Thời điểm chuyển đổi mô hình: Khi hoàn tất chu kỳ tích lũy nội lực."
          ]
        };

      default:
        return {
          domain_code: code,
          primary_dung_than: "Tam Tài Đồng Quy",
          deep_reasoning: ["Phân tích tổng hợp dựa trên nguyên lý cân bằng Thiên - Địa - Nhân."],
          specific_risks: ["Đề phòng biến số ngoại cảnh bất ngờ."],
          concrete_actions: ["Kiểm soát chặt chẽ kế hoạch hành động theo từng mốc."],
          timing_windows: ["Triển khai trong khung giờ hoàng đạo cát lợi."]
        };
    }
  }

  // ==============================================================================
  // 4.5. LUẬN GIẢI CHUYÊN BIỆT THEO CÂU HỎI NGƯỜI DÙNG (QUESTION INTENT RESOLUTION)
  // ==============================================================================
  function analyzeSpecificQuery(query, domainCode, role, taDetails, kmDetails, lnDetails, weightedScore, consensus) {
    if (!query || typeof query !== 'string' || !query.trim()) {
      return null;
    }
    const q = query.trim();
    const qClean = removeVietnameseTones(q.toLowerCase());

    // 1. Phân loại loại câu hỏi (Question Intent)
    const isYesNo = qClean.includes("co nen") || qClean.includes("nen hay khong") || qClean.includes("duoc khong") || qClean.includes("duoc chang") || qClean.includes("nen mua") || qClean.includes("co the");
    const isTiming = qClean.includes("khi nao") || qClean.includes("bao gio") || qClean.includes("thoi diem") || qClean.includes("thang may") || qClean.includes("ngay nao");
    const isSpatial = qClean.includes("o dau") || qClean.includes("huong nao") || qClean.includes("phuong vi");

    // 2. Nhận diện thực thể địa lý (Geographical Entities)
    let geoEntity = "";
    let geoPalace = "";
    if (qClean.includes("thai binh")) {
      geoEntity = "Thái Bình (Đồng bằng châu thổ sông Hồng - Đông Nam / Đông)";
      geoPalace = "Cung Tốn (Đông Nam) & Cung Chấn (Chính Đông)";
    } else if (qClean.includes("ha noi")) {
      geoEntity = "Hà Nội (Khu vực trung tâm đồng bằng Bắc Bộ)";
      geoPalace = "Trung Cung & Cung Cấn/Khảm";
    } else if (qClean.includes("hai phong")) {
      geoEntity = "Hải Phòng (Vùng duyên hải Đông Bắc - Chính Đông / Đông Nam)";
      geoPalace = "Cung Chấn (Chính Đông) & Cung Tốn (Đông Nam)";
    } else if (qClean.includes("nam dinh")) {
      geoEntity = "Nam Định (Vùng ven biển đồng bằng sông Hồng - Nam / Đông Nam)";
      geoPalace = "Cung Tốn & Cung Ly";
    } else if (qClean.includes("da nang") || qClean.includes("quang nam")) {
      geoEntity = "Đà Nẵng / Miền Trung (Duyên hải miền Trung)";
      geoPalace = "Cung Ly & Cung Chấn";
    } else if (qClean.includes("sai gon") || qClean.includes("tphcm") || qClean.includes("ho chi minh")) {
      geoEntity = "TP. Hồ Chí Minh / Miền Nam (Phương Nam châu thổ Cửu Long)";
      geoPalace = "Cung Ly (Chính Nam) & Cung Khôn (Tây Nam)";
    }

    // 3. Nhận diện chủ đề sự việc
    let topicName = "Chiêm đoán sự vụ";
    let isLandOrProperty = false;
    let isCareer = false;
    let isFinance = false;
    let isLaw = false;
    let isMarriage = false;
    let isHealth = false;

    if (qClean.includes("dat") || qClean.includes("nha") || qClean.includes("bat dong san") || qClean.includes("can ho") || qClean.includes("chung cu") || domainCode === "D05") {
      isLandOrProperty = true;
      topicName = "Giao dịch Đất đai / Bất động sản / Nhà ở";
    } else if (qClean.includes("thang chuc") || qClean.includes("bo nhiem") || qClean.includes("xin viec") || qClean.includes("cong danh") || domainCode === "D01") {
      isCareer = true;
      topicName = "Công danh / Sự nghiệp / Quan lộ";
    } else if (qClean.includes("dau tu") || qClean.includes("tien") || qClean.includes("chung khoan") || qClean.includes("kinh doanh") || domainCode === "D02") {
      isFinance = true;
      topicName = "Tài chính / Đầu tư / Kinh doanh";
    } else if (qClean.includes("kien") || qClean.includes("toa") || qClean.includes("hop dong") || qClean.includes("tranh chap") || domainCode === "D06") {
      isLaw = true;
      topicName = "Pháp lý / Hợp đồng / Tranh tụng";
    } else if (qClean.includes("cuoi") || qClean.includes("ket hon") || qClean.includes("ly hon") || qClean.includes("yeu") || domainCode === "D03") {
      isMarriage = true;
      topicName = "Hôn nhân / Tình cảm / Gia đạo";
    } else if (qClean.includes("benh") || qClean.includes("mo") || qClean.includes("suc khoe") || qClean.includes("phau thuat") || domainCode === "D04") {
      isHealth = true;
      topicName = "Sức khỏe / Y tế / Điều trị";
    }

    // 4. Quyết nghị trực tiếp (Decisive Verdict)
    let verdictLevel = "caution";
    let verdictTitle = "";
    let verdictRationale = "";

    if (weightedScore >= 62) {
      verdictLevel = "positive";
      if (isLandOrProperty) {
        verdictTitle = "QUYẾT NGHỊ: NÊN TIẾN HÀNH MUA (ĐẮC ĐỊA LỢI & KHÍ VẬN)";
        verdictRationale = `Tổng điểm chiến lược Tam Tài đạt ${weightedScore.toFixed(1)}/100 (Hạng Cát). Mảnh đất đón được trường khí thuận lợi, dòng tiền tích lũy và an cư bền vững.`;
      } else if (isCareer) {
        verdictTitle = "QUYẾT NGHỊ: NÊN CHỦ ĐỘNG TIẾN CỬ / NHẬN NHIỆM VỤ";
        verdictRationale = `Thế trận thiên thời và nhân hòa tương trợ, cơ hội thăng tiến rộng mở, uy quyền được củng cố vững chắc.`;
      } else if (isFinance) {
        verdictTitle = "QUYẾT NGHỊ: NÊN GIẢI NGÂN / MỞ RỘNG ĐẦU TƯ";
        verdictRationale = `Dòng tiền sinh lời đắc cách, chu kỳ tài chính đang ở pha tích lũy tăng trưởng, tỷ lệ rủi ro thấp.`;
      } else if (isHealth) {
        verdictTitle = "QUYẾT NGHỊ: CÁT TƯỜNG - GẶP THẦY GẶP THUỐC, BỆNH TẬT MAU KHỎI";
        verdictRationale = `Tam Thức đồng thuận cao (${weightedScore.toFixed(1)}/100). Điềm báo thân tâm an lạc, gặp đúng thầy đúng thuốc, tà khí suy vi chính khí hồi phục.`;
      } else {
        verdictTitle = "QUYẾT NGHỊ: NÊN THỰC HIỆN KẾ HOẠCH";
        verdictRationale = `Tam Tài tương hợp, mức độ đồng thuận cao (${consensus.toFixed(1)}%), ngoại cảnh và nội lực đều thuận lợi.`;
      }
    } else if (weightedScore >= 48) {
      verdictLevel = "caution";
      if (isLandOrProperty) {
        verdictTitle = "QUYẾT NGHỊ: THẬN TRỌNG ĐÀM PHÁN - CHƯA NÊN ĐẶT CỌC VỘI";
        verdictRationale = `Tổng điểm ở mức bình hòa (${weightedScore.toFixed(1)}/100). Đất có tiềm năng nhưng bên bán đang giữ giá hoặc còn tồn tại điểm mập mờ về quy hoạch/ranh giới cần kiểm chứng.`;
      } else if (isCareer) {
        verdictTitle = "QUYẾT NGHỊ: GIỮ THẾ ỔN ĐỊNH - CHƯA NÊN NÓNG VỘI TRANH ĐOẠT";
        verdictRationale = `Thời cơ chưa chín muồi, cần bồi đắp thêm sự ủng hộ của cấp trên và cộng sự trước khi hành động.`;
      } else if (isFinance) {
        verdictTitle = "QUYẾT NGHỊ: THẬN TRỌNG GIỮ TIỀN - KHÔNG VAY NỢ ĐÒN BẨY";
        verdictRationale = `Thị trường có dấu hiệu phân kỳ, chỉ nên giải ngân từng phần nhỏ để thăm dò, không nên tất tay.`;
      } else if (isHealth) {
        verdictTitle = "QUYẾT NGHỊ: CẦN KIÊN TRÌ ĐIỀU TRỊ - THEO DÕI SÁT DIỄN BIẾN";
        verdictRationale = `Tổng điểm ở mức bình hòa (${weightedScore.toFixed(1)}/100). Bệnh và thuốc đang trong thế cầm cự hoặc mầm bệnh tiềm ẩn, cần tuân thủ nghiêm ngặt phác đồ và tái khám định kỳ.`;
      } else {
        verdictTitle = "QUYẾT NGHỊ: CẦN THẬN TRỌNG - CHỜ THỜI CƠ RÕ RÀNG";
        verdictRationale = `Các hệ thống có độ phân kỳ, các yếu tố ngoại cảnh còn biến động khó lường.`;
      }
    } else {
      verdictLevel = "negative";
      if (isLandOrProperty) {
        verdictTitle = "QUYẾT NGHỊ: TẠM HOÃN - KHÔNG NÊN MUA VÀO LÚC NÀY";
        verdictRationale = `Điểm số Tam Tài suy vi (${weightedScore.toFixed(1)}/100). Cảnh báo nguy cơ chôn vốn, đất phạm sát khí hoặc đối tác/chủ đất thiếu trung thực.`;
      } else if (isCareer) {
        verdictTitle = "QUYẾT NGHỊ: PHÒNG THỦ - ĐỀ PHÒNG TIỂU NHÂN THỊ PHI";
        verdictRationale = `Thế trận bất lợi, đối thủ cạnh tranh chiếm ưu thế hoặc cơ cấu nội bộ chưa thuận lợi cho bạn.`;
      } else if (isFinance) {
        verdictTitle = "QUYẾT NGHỊ: ĐÌNH CHỈ GIẢI NGÂN - BẢO TOÀN VỐN";
        verdictRationale = `Nguy cơ thua lỗ hoặc đọng vốn kéo dài rất cao, áp lực dòng tiền vĩ mô đang siết chặt.`;
      } else if (isHealth) {
        verdictTitle = "QUYẾT NGHỊ: CẢNH BÁO BỆNH TRỌNG - CẦN ĐỔI THẦY ĐỔI PHÁC ĐỒ";
        verdictRationale = `Khí số suy vi (${weightedScore.toFixed(1)}/100). Mầm bệnh khắc chế bản mệnh hoặc tà khí nhập thân dai dẳng, cần tham vấn ý kiến chuyên gia tuyến trên.`;
      } else {
        verdictTitle = "QUYẾT NGHỊ: TẠM DỪNG / THAY ĐỔI PHƯƠNG ÁN";
        verdictRationale = `Khí số nghịch chuyển, hành động lúc này dễ dẫn đến hao tổn tài lực và tinh thần.`;
      }
    }

    // 5. Ba trụ cột bóc tách chuyên sâu theo câu hỏi
    const chuToan = taDetails.chu_toan || 0;
    const khachToan = taDetails.khach_toan || 0;
    let p1Title = "💰 Về Vị Thế & Đàm Phán (Thái Ất)";
    let p1Desc = "";
    if (chuToan >= khachToan) {
      p1Desc = `Toán Chủ (${chuToan}) thắng Toán Khách (${khachToan}). Bạn ở thế chủ động nắm đằng chuôi. Trong sự việc '${q}', bạn hoàn toàn có thể mặc cả, ra điều kiện thanh toán hoặc kéo giãn tiến độ có lợi nhất cho mình.`;
    } else {
      p1Desc = `Toán Khách (${khachToan}) lớn hơn Toán Chủ (${chuToan}). Đối phương hoặc bên bán đang ở thế áp đảo giữ giá. Bạn không nên để lộ sự nóng vội kẻo bị ép giá hoặc rơi vào thế bị động.`;
    }

    let p2Title = isHealth ? "🧭 Về Phương Vị Chữa Bệnh & Trận Đồ Y Dược (Kỳ Môn)" : "🧭 Về Địa Thế, Phong Thủy & Không Gian (Kỳ Môn)";
    let p2Desc = "";
    if (isHealth && kmDetails.target1 && kmDetails.target2) {
      const t1 = kmDetails.target1;
      const t2 = kmDetails.target2;
      const subj = kmDetails.subject;
      p2Desc = `Dụng Thần Kép: ${t1.roleName || 'Mầm Bệnh'} ngự tại ${t1.name} [${t1.direction || ''}] (${t1.element || ''}) gặp Môn [${t1.door}], Tinh [${t1.star}], Thần [${t1.deity}]${t1.isKongWang ? ' (Lâm Tuần Không: điềm báo bệnh suy tàn/bệnh giả mau lành)' : ''}. ` +
               `Đối trọng ${t2.roleName || 'Thầy Thuốc & Y Dược'} tại ${t2.name} [${t2.direction || ''}] (${t2.element || ''}) gặp Môn [${t2.door}], Tinh [${t2.star}], Thần [${t2.deity}]${t2.isKongWang ? ' (Lâm Tuần Không)' : ''}. ` +
               (subj ? `Cung Bản Mệnh người hỏi tại ${subj.name} [${subj.direction || ''}] (${subj.element || ''}). ` : '') +
               (kmDetails.detailed_analysis ? `${kmDetails.detailed_analysis.split('\n')[0]} ` : '') +
               `Phương vị tìm kiếm thầy thuốc và dưỡng bệnh tối ưu: ${kmDetails.auspicious_directions}.`;
    } else if (isLandOrProperty) {
      p2Desc = `Dụng thần Bất động sản (Sinh Môn) và Thổ trạch (Cửu Địa) kết hợp tại ${kmDetails.palace_name} với cách cục '${kmDetails.formation}'. Phương vị đón sinh khí: ${kmDetails.auspicious_directions}. ` +
               (geoEntity ? `Đối chiếu địa bàn ${geoEntity} ứng hợp với ${geoPalace}, cho thấy vị trí này đang hưởng nguồn sinh khí tương hỗ.` : `Cần đối chiếu hướng đất với phương vị cát lợi để nạp khí.`);
    } else if (kmDetails.target1) {
      const t1 = kmDetails.target1;
      const t2 = kmDetails.target2;
      const subj = kmDetails.subject;
      p2Desc = `Trận đồ 9 cung Kỳ Môn ghi nhận Dụng thần [${t1.roleName || t1.targetLabel || 'Chính'}] tại ${t1.name} [${t1.direction || ''}] (${t1.door} + ${t1.star} + ${t1.deity}${t1.isKongWang ? ' - Tuần Không' : ''})` +
               (t2 ? `, Đối trọng [${t2.roleName || t2.targetLabel}] tại ${t2.name} [${t2.direction || ''}] (${t2.door} + ${t2.star} + ${t2.deity}${t2.isKongWang ? ' - Tuần Không' : ''})` : '') +
               (subj ? `. Cung Bản Mệnh tại ${subj.name} [${subj.direction || ''}]` : '') +
               `. Phương vị cát lợi hành động: ${kmDetails.auspicious_directions}.`;
    } else {
      p2Desc = `Trận đồ 9 cung Kỳ Môn ghi nhận Trực Phù tại ${kmDetails.truc_phu}, Trực Sử tại ${kmDetails.truc_su}. Không gian triển khai tối ưu nhất là hướng ${kmDetails.auspicious_directions}.`;
    }

    let p3Title = "📜 Về Pháp Lý, Lòng Người & Minh Bạch (Lục Nhâm)";
    let p3Desc = "";
    if (isLandOrProperty) {
      p3Desc = `Khóa III (Chi vi Trạch - hiện trạng khu đất) và Khóa IV (Kim tĩnh/móng ngầm) đi qua Tam Truyền '${lnDetails.cach_cuc}'. ` +
               (lnDetails.tu_khoa_status.includes("Hòa") ?
                `Tứ Khóa hòa hợp, bên bán thiện chí, sổ đỏ rõ ràng, ít nguy cơ tranh chấp nội bộ gia tộc.` :
                `Tứ Khóa có khắc trở, cần cẩn trọng rà soát xem đất có tranh chấp lối đi, tường chung, thừa kế chưa phân chia hoặc quy hoạch mở đường hay không.`);
    } else {
      p3Desc = `Tam Truyền '${lnDetails.cach_cuc}' phản ánh tiến trình sự việc qua 3 chặng: Khởi đầu (${lnDetails.so_truyen}) ➔ Phát triển (${lnDetails.trung_truyen}) ➔ Kết cục (${lnDetails.mat_truyen}). ` +
               (lnDetails.tu_khoa_status.includes("Hòa") ? "Nhân sự ủng hộ, đối tác trung thực." : "Có sự bất hòa ngầm hoặc lời nói không đi đôi với việc làm.");
    }

    // 6. Các bước hành động trực tiếp
    const actionSteps = [];
    if (isLandOrProperty) {
      actionSteps.push("Kiểm tra trích lục bản đồ địa chính và thông tin quy hoạch mới nhất tại cơ quan chức năng địa phương trước khi đặt cọc.");
      actionSteps.push("Khảo sát thực địa quanh khu đất bán kính 200m vào nhiều thời điểm (sáng, trưa, tối) để đánh giá hạ tầng, dân cư và phong thủy thực tế.");
      actionSteps.push("Yêu cầu các bên có tên trong sổ hộ khẩu/thừa kế ký cam kết đồng thuận bán để triệt tiêu rủi ro tranh chấp dân sự về sau.");
    } else if (isCareer) {
      actionSteps.push("Chuẩn bị hồ sơ năng lực và thành tích cụ thể, có số liệu minh chứng thuyết phục.");
      actionSteps.push("Tham vấn ý kiến của người đỡ đầu hoặc cấp trên trực tiếp trước khi công khai nguyện vọng.");
      actionSteps.push("Giữ kín thông tin cho đến khi có quyết định chính thức.");
    } else if (isHealth) {
      actionSteps.push("Tham khảo ý kiến chuyên gia y tế, tuân thủ đúng phác đồ điều trị và toa thuốc của bác sĩ chuyên khoa.");
      actionSteps.push("Nghỉ ngơi điều dưỡng, có thể ưu tiên tìm kiếm bệnh viện/phòng khám hoặc thầy thuốc ở phương vị cát lợi (ví dụ: Tây Bắc / Đông Nam) để gia tăng hiệu quả điều trị.");
      actionSteps.push("Giữ tâm lý lạc quan, điều hòa chế độ dinh dưỡng dưỡng sinh; tái khám đúng hẹn để theo dõi mầm bệnh.");
    } else {
      actionSteps.push("Kiểm soát chặt chẽ các cam kết bằng văn bản có giá trị pháp lý rõ ràng.");
      actionSteps.push("Phân bổ ngân sách theo từng cột mốc nghiệm thu, không giải ngân một lần.");
      actionSteps.push("Giữ tâm thế chủ động, sẵn sàng phương án dự phòng (Plan B).");
    }

    return {
      raw_query: q,
      topic_name: topicName,
      geographical_entity: geoEntity,
      verdict_level: verdictLevel,
      verdict_title: verdictTitle,
      verdict_rationale: verdictRationale,
      pillars: {
        price_and_position: { title: p1Title, content: p1Desc },
        spatial_and_fengshui: { title: p2Title, content: p2Desc },
        legal_and_trust: { title: p3Title, content: p3Desc }
      },
      action_steps: actionSteps,
      optimal_window: `Nên chọn khung giờ Hoàng Đạo cát lợi, hướng đón sinh khí ${kmDetails.auspicious_directions} để tiến hành giao dịch hoặc gặp gỡ đối tác.`
    };
  }

  // ==============================================================================
  // 4.6. BỘ QUÉT NGÀY GIỜ HOÀNG KIM TAM TÀI (OPTIMAL TIMING SCANNER)
  // ==============================================================================

  function parseTimeWindowFromQuery(query, baseDate = new Date()) {
    const q = String(query || '').trim();
    const qClean = removeVietnameseTones(q.toLowerCase());

    const timingKeywords = [
      'khi nao', 'bao gio', 'ngay nao', 'gio nao', 'thoi diem nao', 'luc nao', 
      'thang may', 'ngay tot', 'gio tot', 'chon ngay', 'xem ngay', 'thoi gian nao', 
      'ngay dep', 'gio dep', 'ngay nao tot', 'gio nao tot', 'ngay nao nen',
      'luc nao nen', 'thoi diem nao nen', 'ngay gio nao'
    ];
    const isTimingQuery = timingKeywords.some(kw => qClean.includes(kw));

    if (!isTimingQuery) {
      return { isTimingQuery: false };
    }

    let startDate = new Date(baseDate.getTime());
    let endDate = new Date(baseDate.getTime());
    let label = '';
    let isSingleDay = false;

    // 1. Dải ngày cụ thể: "từ ngày X đến ngày Y", "từ X/M đến Y/M"
    const rangeMatch = qClean.match(/tu\s+(?:ngay\s+)?(\d{1,2})(?:\/(\d{1,2}))?\s+den\s+(?:ngay\s+)?(\d{1,2})(?:\/(\d{1,2}))?/);
    if (rangeMatch) {
      const d1 = parseInt(rangeMatch[1], 10);
      const m1 = rangeMatch[2] ? parseInt(rangeMatch[2], 10) - 1 : baseDate.getMonth();
      const d2 = parseInt(rangeMatch[3], 10);
      const m2 = rangeMatch[4] ? parseInt(rangeMatch[4], 10) - 1 : m1;
      startDate = new Date(baseDate.getFullYear(), m1, d1, 6, 0, 0);
      endDate = new Date(baseDate.getFullYear(), m2, d2, 22, 0, 0);
      if (endDate < startDate) endDate.setFullYear(endDate.getFullYear() + 1);
      const pad = n => String(n).padStart(2, '0');
      label = `${pad(d1)}/${pad(m1 + 1)} đến ${pad(d2)}/${pad(m2 + 1)}`;
    } else if (qClean.includes('hom nay')) {
      startDate.setHours(baseDate.getHours(), 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      label = `Hôm nay (${startDate.getDate()}/${startDate.getMonth() + 1})`;
      isSingleDay = true;
    } else if (qClean.includes('ngay mai')) {
      startDate.setDate(startDate.getDate() + 1);
      startDate.setHours(6, 0, 0, 0);
      endDate = new Date(startDate.getTime());
      endDate.setHours(22, 0, 0, 0);
      label = `Ngày mai (${startDate.getDate()}/${startDate.getMonth() + 1})`;
      isSingleDay = true;
    } else if (qClean.includes('cuoi tuan')) {
      const day = baseDate.getDay();
      const diffToSat = (6 - day + 7) % 7 || 7;
      startDate.setDate(baseDate.getDate() + diffToSat);
      startDate.setHours(6, 0, 0, 0);
      endDate = new Date(startDate.getTime() + 24 * 3600 * 1000);
      endDate.setHours(22, 0, 0, 0);
      label = 'Cuối tuần này';
    } else if (qClean.includes('tuan toi') || qClean.includes('tuan sau')) {
      startDate.setDate(baseDate.getDate() + (7 - baseDate.getDay() + 1));
      startDate.setHours(6, 0, 0, 0);
      endDate = new Date(startDate.getTime() + 6 * 24 * 3600 * 1000);
      endDate.setHours(22, 0, 0, 0);
      label = 'Tuần tới';
    } else {
      const monthMatch = qClean.match(/thang\s+(\d{1,2})/);
      if (monthMatch) {
        const targetMonth = parseInt(monthMatch[1], 10) - 1;
        let targetYear = baseDate.getFullYear();
        if (targetMonth < baseDate.getMonth()) targetYear++;
        startDate = new Date(targetYear, targetMonth, 1, 6, 0, 0);
        endDate = new Date(targetYear, targetMonth + 1, 0, 22, 0, 0);
        label = `Tháng ${targetMonth + 1}/${targetYear}`;
      } else {
        const nDaysMatch = qClean.match(/(\d{1,2})\s+ngay\s+toi/);
        const days = nDaysMatch ? parseInt(nDaysMatch[1], 10) : 14;
        startDate.setHours(6, 0, 0, 0);
        endDate.setDate(baseDate.getDate() + days);
        endDate.setHours(22, 0, 0, 0);
        label = `${days} ngày tới`;
      }
    }

    return { isTimingQuery: true, startDate, endDate, label, isSingleDay };
  }

  function scanOptimalTamThucTimings(query, domainCode = "D01", role = "Chủ", baseDate = new Date(), options = {}) {
    const tw = parseTimeWindowFromQuery(query, baseDate);
    if (!tw.isTimingQuery) return null;

    const hoursList = tw.isSingleDay ? [
      { h: 1, label: 'Sửu (01:00 - 03:00)' },
      { h: 3, label: 'Dần (03:00 - 05:00)' },
      { h: 5, label: 'Mão (05:00 - 07:00)' },
      { h: 7, label: 'Thìn (07:00 - 09:00)' },
      { h: 9, label: 'Tỵ (09:00 - 11:00)' },
      { h: 11, label: 'Ngọ (11:00 - 13:00)' },
      { h: 13, label: 'Mùi (13:00 - 15:00)' },
      { h: 15, label: 'Thân (15:00 - 17:00)' },
      { h: 17, label: 'Dậu (17:00 - 19:00)' },
      { h: 19, label: 'Tuất (19:00 - 21:00)' },
      { h: 21, label: 'Hợi (21:00 - 23:00)' }
    ] : [
      { h: 7, label: 'Thìn (07:00 - 09:00)' },
      { h: 9, label: 'Tỵ (09:00 - 11:00)' },
      { h: 11, label: 'Ngọ (11:00 - 13:00)' },
      { h: 13, label: 'Mùi (13:00 - 15:00)' },
      { h: 15, label: 'Thân (15:00 - 17:00)' },
      { h: 17, label: 'Dậu (17:00 - 19:00)' },
      { h: 19, label: 'Tuất (19:00 - 21:00)' }
    ];

    const pad = n => String(n).padStart(2, '0');
    const candidates = [];
    const startDayTime = new Date(tw.startDate.getFullYear(), tw.startDate.getMonth(), tw.startDate.getDate()).getTime();
    const endDayTime = new Date(tw.endDate.getFullYear(), tw.endDate.getMonth(), tw.endDate.getDate()).getTime();
    const dayStep = 24 * 3600 * 1000;

    for (let t = startDayTime; t <= endDayTime; t += dayStep) {
      const curDay = new Date(t);
      for (const hr of hoursList) {
        const dt = new Date(curDay.getFullYear(), curDay.getMonth(), curDay.getDate(), hr.h, 30, 0);
        if (dt < tw.startDate || dt > tw.endDate) continue;

        const res = synthesizeTamThuc(dt, domainCode, role, { query: query, skipTimingScan: true });
        const sb = res.score_breakdown;
        const harmonic = sb.weighted_total_score * (1 + sb.consensus_index / 200);

        const taHighlight = res.layer2_thai_at.key_finding ? res.layer2_thai_at.key_finding.split('.')[0] : 'Thái Ất Thiên Thời';
        const kmHighlight = res.layer3_ky_mon.key_finding ? res.layer3_ky_mon.key_finding.split('.')[0] : 'Kỳ Môn Địa Lợi';
        const lnHighlight = res.layer4_luc_nham.key_finding ? res.layer4_luc_nham.key_finding.split('.')[0] : 'Lục Nhâm Nhân Sự';

        const solarStr = `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`;
        const dateIso = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;

        candidates.push({
          date: dt,
          date_str: dateIso,
          solar_date_display: solarStr,
          can_chi_hour: `Giờ ${hr.label}`,
          can_chi_day: res.four_pillars ? res.four_pillars.split(' - ')[2] : '',
          score: sb.weighted_total_score,
          consensus: sb.consensus_index,
          harmonic: harmonic,
          classification: sb.classification.split(' ')[0],
          classification_full: sb.classification,
          pillars_summary: {
            thai_at: taHighlight,
            ky_mon: kmHighlight,
            luc_nham: lnHighlight
          }
        });
      }
    }

    candidates.sort((a, b) => b.harmonic - a.harmonic);

    const selected = [];
    const dayCount = {};

    for (const c of candidates) {
      const dayKey = c.solar_date_display;
      if (!tw.isSingleDay && dayCount[dayKey] >= 2) continue;

      dayCount[dayKey] = (dayCount[dayKey] || 0) + 1;
      selected.push(c);
      c.rank = selected.length;
      if (selected.length >= 5) break;
    }

    return {
      is_timing_query: true,
      time_window_label: tw.label,
      total_slots_scanned: candidates.length,
      recommendations: selected
    };
  }

  function generateTamThucIcsContent(rec, query) {
    if (!rec || !rec.date) return null;

    const start = new Date(rec.date);
    const end = new Date(start.getTime() + 2 * 3600 * 1000);
    const now = new Date();

    const pad = n => String(n).padStart(2, '0');
    const formatIcsDate = d => `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

    const dtStart = formatIcsDate(start);
    const dtEnd = formatIcsDate(end);
    const dtStamp = formatIcsDate(now);

    const title = query ? `Khung Giờ Hoàng Kim Tam Thức: ${query}` : `Khung Giờ Hoàng Kim Tam Thức - ${rec.can_chi_hour}`;
    const desc = `Khung giờ: ${rec.can_chi_hour} (${rec.solar_date_display}, ${rec.can_chi_day}).\\nĐiểm số: ${rec.score}đ (Đồng thuận ${rec.consensus.toFixed(1)}% - ${rec.classification_full}).\\n- Thiên Thời: ${rec.pillars_summary.thai_at}.\\n- Địa Lợi: ${rec.pillars_summary.ky_mon}.\\n- Nhân Sự: ${rec.pillars_summary.luc_nham}.\\nHệ thống Neta Light - Tam Thức Chiêm Đoán.`;

    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Neta Light//Tam Thuc Optimal Timing//VI",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:tamthuc-time-${Date.now()}@netalight.app`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:🌟 ${title}`,
      `DESCRIPTION:${desc}`,
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "TRIGGER:-PT30M",
      "ACTION:DISPLAY",
      "DESCRIPTION:Nhắc nhở: Sắp đến khung giờ Hoàng Kim Tam Thức trong 30 phút tới!",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
  }

  // ==============================================================================
  // 5. BỘ TỔNG HỢP TOÀN DIỆN XUYÊN TAM THỨC (SYNTHESIZER)
  // ==============================================================================
  function synthesizeTamThuc(dateInput, queryOrDomain = "D01", role = "Chủ", options = {}) {
    const dt = (dateInput instanceof Date) ? dateInput : new Date(dateInput);

    // 1. Nhận diện Lĩnh vực & Trích xuất câu hỏi
    let domainCfg;
    let userQuery = "";
    if (typeof options === 'object' && options && options.query) {
      userQuery = String(options.query).trim();
    }

    if (DOMAINS_12[queryOrDomain]) {
      domainCfg = DOMAINS_12[queryOrDomain];
    } else {
      userQuery = userQuery || String(queryOrDomain).trim();
      domainCfg = detectDomainFromQuery(queryOrDomain);
    }
    const domainCode = domainCfg.code;

    // 2. Đồng bộ Tứ Trụ & Tiết Khí
    let solarTerm = options.solarTerm || "Thu Phân";
    let fourPillars = { year: "Bính Ngọ", month: "Mậu Tuất", day: "Giáp Tý", hour: "Bính Tý", dayCan: "Giáp", dayChi: "Tý", hourChi: "Tý" };

    if (global.NetaCalendarEngine && typeof global.NetaCalendarEngine.getFullDayInfo === 'function') {
      try {
        const full = global.NetaCalendarEngine.getFullDayInfo(dt);
        if (full) {
          if (!options.solarTerm && full.solarTerm) {
            solarTerm = full.solarTerm;
          }
          if (full.canChi) {
            fourPillars.year = full.canChi.year || fourPillars.year;
            fourPillars.month = full.canChi.month || fourPillars.month;
            fourPillars.day = full.canChi.day || fourPillars.day;
            fourPillars.hour = full.canChi.hour || fourPillars.hour;

            const dayParts = fourPillars.day.split(' ');
            if (dayParts.length >= 2) {
              fourPillars.dayCan = dayParts[0];
              fourPillars.dayChi = dayParts[1];
            }
            const hourParts = fourPillars.hour.split(' ');
            if (hourParts.length >= 2) {
              fourPillars.hourCan = hourParts[0];
              fourPillars.hourChi = hourParts[1];
            }
          }
        }
      } catch (e) {
        console.warn("TamThuc: getFullDayInfo warning:", e);
      }
    }

    // Đặc biệt kiểm tra Tiết Khí theo mốc ngày truyền thống nếu chưa được override
    if (!options.solarTerm) {
      const mm = dt.getMonth() + 1;
      const dd = dt.getDate();
      if (mm === 6 && (dd === 21 || dd === 22)) {
        solarTerm = "Hạ Chí";
      } else if (mm === 12 && (dd === 21 || dd === 22)) {
        solarTerm = "Đông Chí";
      }
    }

    const yearChi = fourPillars.year.split(' ').pop() || "Ngọ";

    // 3. Kích hoạt Thái Ất
    const taCore = computeThaiAtCore(dt.getFullYear(), yearChi);
    const evalTa = evaluateThaiAt(taCore, role, domainCode);

    // 4. Kích hoạt Kỳ Môn (Native Zhi Run Plotter - Chuẩn Kết Nối Vũ Trụ)
    const deitySchool = options.deitySchool || "10thần";
    const querentOptions = {
      querentRole: role,
      birthYearCan: options.birthYearCan || options.querentYearCan || "",
      birthYear: options.birthYear || 1985,
      gender: options.querentGender || options.gender || "nam",
      querentMode: options.querentMode || "hour"
    };
    const kmCore = plotFullChartKetNoiVuTru(
      solarTerm,
      fourPillars.dayCan,
      fourPillars.dayChi,
      fourPillars.hourCan || "Giáp",
      fourPillars.hourChi || "Tý",
      deitySchool
    );
    const evalKm = evaluateKyMon(kmCore, role, domainCode, solarTerm, querentOptions);

    // 5. Kích hoạt Lục Nhâm
    const nguyetTuong = SOLAR_TERM_TO_NGUYET_TUONG[solarTerm] || "Thìn";
    const chiThang = SOLAR_TERM_TO_CHI_THANG[solarTerm] || "Dần";
    const isDaytime = dt.getHours() >= 5 && dt.getHours() < 17;

    let lnCore = {
      nguyetTuong: nguyetTuong,
      tenNguyetTuong: "",
      tamTruyenTenTong: "Tặc Khắc: Trùng Thẩm",
      soTruyen: { chi: "Tuất", thienTuong: "Chu tước", lucThan: "Thê tài" },
      trungTruyen: { chi: "Thìn", thienTuong: "Thái thường", lucThan: "Thê tài" },
      matTruyen: { chi: "Tuất", thienTuong: "Chu tước", lucThan: "Thê tài" },
      tuKhoa: []
    };

    if (global.LucNhamEngine && typeof global.LucNhamEngine.lapQue === 'function') {
      try {
        const lnRes = global.LucNhamEngine.lapQue({
          canNgay: fourPillars.dayCan,
          chiNgay: fourPillars.dayChi,
          chiGio: fourPillars.hourChi,
          nguyetTuong: nguyetTuong,
          isDaytime: isDaytime,
          tietKhi: solarTerm,
          chiNam: yearChi,
          chiThang: chiThang,
          birthYear: options.birthYear || 1985,
          currentYear: dt.getFullYear(),
          gioiTinh: options.gender || "Nam"
        });
        if (lnRes) lnCore = lnRes;
      } catch (e) {
        console.warn("TamThuc: LucNhamEngine invocation warning:", e);
      }
    }
    const evalLn = evaluateLucNham(lnCore, role, domainCode);

    // 6. Tính toán Ma Trận Điểm & Độ Phân Kỳ
    const s_ta = evalTa.score;
    const s_km = evalKm.score;
    const s_ln = evalLn.score;

    const w_ta = domainCfg.weight_thai_at;
    const w_km = domainCfg.weight_ky_mon;
    const w_ln = domainCfg.weight_luc_nham;

    const weightedScore = (s_ta * w_ta) + (s_km * w_km) + (s_ln * w_ln);
    const meanScore = (s_ta + s_km + s_ln) / 3.0;
    const variance = ((s_ta - meanScore) ** 2 + (s_km - meanScore) ** 2 + (s_ln - meanScore) ** 2) / 3.0;
    const stdDev = Math.sqrt(variance);

    // Chỉ số Đồng Thuận C_3T
    const consensus = Math.max(0.0, Math.min(100.0, 100.0 - (stdDev * 2.2)));

    // 7. Nhận diện Hình Thái Tương Tác
    let pattern = "";
    if (consensus >= 80) {
      if (weightedScore >= 70) {
        pattern = "Tam Tài Tương Hợp - Đại Cát Toàn Diện (Thiên - Địa - Nhân đồng quy thuận cảnh).";
      } else if (weightedScore <= 42) {
        pattern = "Tam Tài Đồng Triệt - Đại Hung Toàn Diện (Khí số nghịch chuyển, nên đình chỉ kế hoạch).";
      } else {
        pattern = "Tam Tài Bình Ổn - Tiến Thoái Rõ Ràng (Vận hành theo trật tự tự nhiên).";
      }
    } else if (s_ta >= 65 && s_ln <= 45) {
      pattern = "Thiên Cát Nhân Hung (Thời thế vĩ mô thuận lợi nhưng nội bộ phân hóa, con người mắc sai lầm).";
    } else if (s_ln >= 65 && s_ta <= 45) {
      pattern = "Nhân Cát Thiên Hung (Con người nỗ lực kiên cường nhưng nghịch thiên thời, vận số chưa mở).";
    } else if (s_km >= 72 && s_ta < 55 && s_ln < 55) {
      pattern = "Địa Lợi Hóa Giải (Dù thời cơ và nhân sự bất lợi nhưng đắc phương vị phong thủy/chiến lược cứu nguy).";
    } else {
      pattern = "Đa Chiều Phân Kỳ (Ba hệ thống đưa ra xung lực trái ngược, môi trường biến động phức tạp).";
    }

    // Phân hạng dự báo
    let classification = "";
    if (weightedScore >= 78) {
      classification = "ĐẠI CÁT (Thắng Lợi Vượt Trội)";
    } else if (weightedScore >= 62) {
      classification = "TRUNG CÁT (Thuận Lợi - Có Thể Mở Rộng)";
    } else if (weightedScore >= 48) {
      classification = "BÌNH HÒA (Giữ Thế Cân Bằng - Chờ Thời)";
    } else if (weightedScore >= 35) {
      classification = "TIỂU HUNG (Trở Ngại - Cần Phòng Bị)";
    } else {
      classification = "ĐẠI HUNG (Nguy Cấp - Tránh Hành Động Nóng Vội)";
    }

    const scoreBreakdown = {
      score_thai_at: Math.round(s_ta * 10) / 10,
      score_ky_mon: Math.round(s_km * 10) / 10,
      score_luc_nham: Math.round(s_ln * 10) / 10,
      weighted_total_score: Math.round(weightedScore * 10) / 10,
      consensus_index: Math.round(consensus * 10) / 10,
      std_deviation: Math.round(stdDev * 100) / 100,
      classification: classification,
      interaction_pattern: pattern
    };

    // 8. Tầng 5: Chiến Lược Tối Ưu
    const insight = deepAnalyzeDomain(domainCode, role, evalTa.details, evalKm.details, evalLn.details);

    let timing = "";
    if (s_ta >= 60) {
      timing = "Thời thế vĩ mô đang mở ra chu kỳ thuận lợi. Nên nắm bắt ngay trong quý hiện tại; không nên chần chừ kéo dài qua tiết khí sau.";
    } else {
      timing = "Thiên thời vĩ mô đang chịu sức ép hoặc suy vi. Cần hoãn các động thái đầu tư/mở rộng lớn, chờ khi thời cục chuyển đổi.";
    }

    const spatial = `Khai thác triệt để ${evalKm.details.auspicious_directions || 'Phương vị cát lợi'}. Bố trí phòng làm việc, đàm phán hợp đồng hoặc mở chi nhánh tại cung vị này để thu hút sinh khí.`;

    let personnel = "";
    if (s_ln >= 60) {
      personnel = `Nội bộ đoàn kết, đối tác có thiện chí rõ rệt (${evalLn.details.tu_khoa_status || ''}). Giai đoạn cuối (${evalLn.details.mat_truyen || ''}) rất vững chãi, hãy trao quyền và đẩy nhanh cam kết.`;
    } else {
      personnel = "Nội bộ có nguy cơ phân tâm hoặc đối tác mang tâm lý hoài nghi. Cần rà soát chặt chẽ điều khoản giao kết, tránh tin tưởng mù quáng.";
    }

    const mitigation = [];
    if (stdDev >= 15.0) {
      mitigation.push("Hiện tượng 'Phân kỳ Tam Tài' đòi hỏi không được 'tất tay' (all-in). Phải phân bổ vốn và nguồn lực theo từng giai đoạn nghiệm thu.");
    }
    if (s_ta < 50) {
      mitigation.push("Bảo vệ tính thanh khoản và dự phòng pháp lý trước biến động chính sách vĩ mô.");
    }
    if (s_ln < 50) {
      mitigation.push("Kiểm soát chặt chẽ hợp đồng và giám sát nhân sự then chốt để ngăn ngừa rò rỉ thông tin hoặc sai sót tác nghiệp.");
    }
    if (mitigation.length === 0) {
      mitigation.push("Duy trì tốc độ triển khai theo kế hoạch, kiểm toán định kỳ để bảo toàn thành quả.");
    }

    const layer5 = {
      primary_dung_than: insight.primary_dung_than,
      timing_strategy: timing,
      timing_windows: insight.timing_windows,
      spatial_strategy: spatial,
      personnel_strategy: personnel,
      concrete_actions: insight.concrete_actions,
      specific_risks: insight.specific_risks,
      mitigation_strategy: mitigation.join(" ")
    };

    const specificResolution = userQuery ? analyzeSpecificQuery(
      userQuery,
      domainCode,
      role,
      evalTa.details,
      evalKm.details,
      evalLn.details,
      weightedScore,
      consensus
    ) : null;

    let optimalTimings = null;
    if (!options.skipTimingScan && userQuery) {
      try {
        optimalTimings = scanOptimalTamThucTimings(userQuery, domainCode, role, dt, options);
      } catch (e) {
        console.warn("TamThuc: scanOptimalTamThucTimings warning:", e);
      }
    }

    let summaryText = `Đối với vấn đề ${domainCfg.name} của vị thế ${role}: Kết quả đạt mức ${classification}. Chỉ số đồng thuận đạt ${consensus.toFixed(1)}%. ${pattern}`;
    if (specificResolution) {
      summaryText = `[Giải đáp: "${userQuery}"]: ${specificResolution.verdict_title}. ${specificResolution.verdict_rationale}`;
    }

    const layer1 = {
      summary: summaryText,
      w_ta: w_ta,
      w_km: w_km,
      w_ln: w_ln
    };

    // Đóng gói Report
    const report = {
      datetime: dt.toISOString(),
      solar_term: solarTerm,
      four_pillars: `${fourPillars.year} - ${fourPillars.month} - ${fourPillars.day} - ${fourPillars.hour}`,
      domain_code: domainCode,
      domain_name: domainCfg.name,
      user_query: userQuery,
      query_resolution: specificResolution,
      optimal_timings: optimalTimings,
      role: role,
      score_breakdown: scoreBreakdown,
      layer1_overview: layer1,
      layer2_thai_at: evalTa.details,
      layer3_ky_mon: evalKm.details,
      layer4_luc_nham: evalLn.details,
      layer5_action_strategy: layer5,

      // Dữ liệu hỗ trợ Render UI & Radar SVG
      chart_data: {
        labels: ["Thái Ất (Thiên Thời)", "Kỳ Môn (Địa Lợi)", "Lục Nhâm (Nhân Sự)"],
        scores: [s_ta, s_km, s_ln],
        weights: [w_ta, w_km, w_ln],
        totalScore: weightedScore,
        consensusIndex: consensus
      },

      toMarkdown: function () {
        const md = [];
        md.push("# BÁO CÁO CHIÊM ĐOÁN TAM THỨC");
        md.push(`**Lĩnh Vực:** [${domainCode}] ${domainCfg.name} | **Vị Thế:** ${role}\n`);
        
        if (optimalTimings && optimalTimings.is_timing_query && optimalTimings.recommendations && optimalTimings.recommendations.length > 0) {
          md.push("## 🗓️ KHUNG GIỜ HOÀNG KIM TAM TÀI (TOP LỰA CHỌN ĐẮC LỢI)");
          md.push(`> **Khoảng thời gian khảo sát:** *${optimalTimings.time_window_label}* (Đã quét ${optimalTimings.total_slots_scanned} khung giờ)\n`);
          md.push("| Hạng | Khung Giờ Can Chi | Dương Lịch | Điểm Số | Đồng Thuận C_3T | Đánh Giá Tam Tài |");
          md.push("| :---: | :--- | :---: | :---: | :---: | :--- |");
          for (const r of optimalTimings.recommendations) {
            md.push(`| **#${r.rank}** | **${r.can_chi_hour}** (${r.can_chi_day}) | ${r.solar_date_display} | \`${r.score.toFixed(1)}đ\` | \`${r.consensus.toFixed(1)}%\` | **${r.classification}** (Thiên: ${r.pillars_summary.thai_at} • Địa: ${r.pillars_summary.ky_mon} • Nhân: ${r.pillars_summary.luc_nham}) |`);
          }
          md.push("");
        }

        if (specificResolution) {
          md.push("## QUYẾT NGHỊ CHIÊM ĐOÁN THEO CÂU HỎI");
          md.push(`> **Câu hỏi người dùng:** *"${specificResolution.raw_query}"*`);
          md.push(`> **Quyết nghị trực tiếp:** **${specificResolution.verdict_title}**`);
          md.push(`> **Cơ sở luận giải:** ${specificResolution.verdict_rationale}\n`);
          md.push("### Phân Tích Chuyên Sâu 3 Trụ Cột Cho Câu Hỏi:");
          md.push(`- **${specificResolution.pillars.price_and_position.title}:** ${specificResolution.pillars.price_and_position.content}`);
          md.push(`- **${specificResolution.pillars.spatial_and_fengshui.title}:** ${specificResolution.pillars.spatial_and_fengshui.content}`);
          md.push(`- **${specificResolution.pillars.legal_and_trust.title}:** ${specificResolution.pillars.legal_and_trust.content}\n`);
          md.push("### Khuyến Nghị Hành Động Trọng Tâm:");
          for (const st of specificResolution.action_steps || []) {
            md.push(`1. ${st}`);
          }
          md.push(`\n**Khung thời gian tối ưu:** ${specificResolution.optimal_window}\n`);
        }

        md.push("## TẦNG 1: ĐÁNH GIÁ TỔNG QUAN & CHỈ SỐ TAM TÀI");
        md.push(`- **Tổng Điểm Chiến Lược (Weighted Score):** \`${scoreBreakdown.weighted_total_score.toFixed(1)} / 100\``);
        md.push(`- **Chỉ Số Đồng Thuận Tam Thức (Consensus Index C_3T):** \`${scoreBreakdown.consensus_index.toFixed(1)}%\``);
        md.push(`- **Độ Phân Kỳ Giữa Các Hệ Thống (Std Dev σ):** \`${scoreBreakdown.std_deviation.toFixed(2)}\``);
        md.push(`- **Phân Hạng Dự Báo:** **${scoreBreakdown.classification}**`);
        md.push(`- **Hình Thái Tương Tác Tam Tài:** ${scoreBreakdown.interaction_pattern}`);
        md.push(`- **Tóm Tắt Chiến Lược:** ${layer1.summary}\n`);

        md.push("### BẢNG ĐIỂM CHI TIẾT TAM TÀI");
        md.push("| Hệ Thống | Trụ Cột | Trọng Số | Điểm Thành Phần | Nhận Định Trọng Yếu |");
        md.push("| :--- | :--- | :---: | :---: | :--- |");
        md.push(`| **Thái Ất Thần Kinh** | Thiên Thời (Vĩ mô) | ${(w_ta * 100).toFixed(0)}% | \`${scoreBreakdown.score_thai_at.toFixed(1)}\` | ${evalTa.details.key_finding} |`);
        md.push(`| **Kỳ Môn Độn Giáp** | Địa Lợi (Không gian) | ${(w_km * 100).toFixed(0)}% | \`${scoreBreakdown.score_ky_mon.toFixed(1)}\` | ${evalKm.details.key_finding} |`);
        md.push(`| **Lục Nhâm Đại Độn** | Nhân Sự (Vi mô) | ${(w_ln * 100).toFixed(0)}% | \`${scoreBreakdown.score_luc_nham.toFixed(1)}\` | ${evalLn.details.key_finding} |\n`);

        md.push("## TẦNG 2: LUẬN GIẢI THIÊN THỜI - THÁI ẤT THẦN KINH");
        md.push(`- **Cung Vị Thái Ất:** ${evalTa.details.cung_thai_at}`);
        md.push(`- **Toán Chủ / Toán Khách:** Chủ = ${evalTa.details.chu_toan} | Khách = ${evalTa.details.khach_toan}`);
        md.push(`- **Đánh Giá Thế Cờ (Chủ vs Khách):** ${evalTa.details.the_co}`);
        md.push(`- **Các Cách Cục Ghi Nhận:** ${evalTa.details.cach_cuc && evalTa.details.cach_cuc.length > 0 ? evalTa.details.cach_cuc.join(', ') : 'Không phạm đại hung cách'}`);
        md.push(`- **Ý Nghĩa Vĩ Mô:** ${evalTa.details.detailed_analysis}\n`);

        md.push("## TẦNG 3: LUẬN GIẢI ĐỊA LỢI - KỲ MÔN ĐỘN GIÁP");
        md.push(`- **Cục Số & Tiết Khí:** ${evalKm.details.cuc}`);
        md.push(`- **Trực Phù & Trực Sử:** Trực Phù = ${evalKm.details.truc_phu} | Trực Sử = ${evalKm.details.truc_su}`);
        md.push(`- **Cung Vị Dụng Thần Then Chốt:** ${evalKm.details.palace_name}`);
        md.push(`- **Phối Hợp Tinh - Môn - Thần:** ${evalKm.details.formation}`);
        md.push(`- **Phương Vị Cát Lợi:** ${evalKm.details.auspicious_directions}`);
        md.push(`- **Ý Nghĩa Chiến Lược:** ${evalKm.details.detailed_analysis}\n`);

        md.push("## TẦNG 4: LUẬN GIẢI NHÂN SỰ & DIỄN BIẾN - LỤC NHÂM ĐẠI ĐỘN");
        md.push(`- **Nguyệt Tướng & Tiết Khí:** ${evalLn.details.nguyet_tuong}`);
        md.push(`- **Tên Cách Cục Tam Truyền:** ${evalLn.details.cach_cuc}`);
        md.push(`- **Tam Truyền Diễn Tiến:** Sơ Truyền (${evalLn.details.so_truyen}) -> Trung Truyền (${evalLn.details.trung_truyen}) -> Mạt Truyền (${evalLn.details.mat_truyen})`);
        md.push(`- **Tình Trạng Tứ Khóa (Can Chi Tương Phối):** ${evalLn.details.tu_khoa_status}`);
        md.push(`- **Thần Sát / Thiên Tướng Trợ Mệnh:** ${evalLn.details.than_tuong_analysis}`);
        md.push(`- **Ý Nghĩa Vi Mô:** ${evalLn.details.detailed_analysis}\n`);

        md.push("## TẦNG 5: CHIẾN LƯỢC HÀNH ĐỘNG TỐI ƯU HÓA (ACTION PLAN)");
        md.push(`**Dụng Thần Cốt Lõi Lĩnh Vực:** \`${layer5.primary_dung_than}\`\n`);
        
        md.push("### 1. Thời Điểm Khởi Sự / Kích Hoạt (Timing Windows)");
        md.push(`- **Khuyến nghị thời vận:** ${layer5.timing_strategy}`);
        for (const tw of layer5.timing_windows || []) {
          md.push(`- ${tw}`);
        }
        md.push("");

        md.push("### 2. Định Vị Không Gian & Kênh Triển Khai (Spatial Strategy)");
        md.push(`${layer5.spatial_strategy}\n`);

        md.push("### 3. Biện Pháp Tác Nghiệp Cụ Thể (Concrete Actions)");
        for (const act of layer5.concrete_actions || []) {
          md.push(`- ${act}`);
        }
        md.push(`- **Ứng xử nhân sự:** ${layer5.personnel_strategy}\n`);

        md.push("### 4. Kiểm Soát Rủi Ro & Hóa Giải Xung Khắc (Risk Control)");
        for (const rk of layer5.specific_risks || []) {
          md.push(`- [CẢNH BÁO] ${rk}`);
        }
        md.push(`- **Nguyên tắc phòng vệ:** ${layer5.mitigation_strategy}\n`);

        return md.join("\n");
      }
    };

    return report;
  }

  // ==============================================================================
  // 6. EXPORT MODULE
  // ==============================================================================
  const NetaTamThucEngine = {
    DOMAINS_12,
    getDomainConfig,
    listAllDomains,
    removeVietnameseTones,
    detectDomainFromQuery,
    analyzeSpecificQuery,
    parseTimeWindowFromQuery,
    scanOptimalTamThucTimings,
    generateTamThucIcsContent,
    computeThaiAtCore,
    plotFullChartKetNoiVuTru,
    evaluateThaiAt,
    evaluateKyMon,
    evaluateLucNham,
    deepAnalyzeDomain,
    synthesizeTamThuc
  };

  global.NetaTamThucEngine = NetaTamThucEngine;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = NetaTamThucEngine;
  }

})(typeof window !== 'undefined' ? window : globalThis);
