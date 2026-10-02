/**
 * engines/qmdj_fengshui.js
 * BỘ ĐỘNG CƠ PHONG THỦY KỲ MÔN ĐỘN GIÁP TOÀN DIỆN (DƯƠNG TRẠCH & ÂM TRẠCH)
 * ==============================================================================
 * Phiên bản: 3.0.0 (Production Benchmark Edition)
 * Nền tảng học thuật:
 * - Ngự Định Kỳ Môn Độn Giáp, Joey Yap Compendium, Bạch Hạc Minh La Kinh Toàn Thư.
 * - Nguyễn Tấn Công (Kết Nối Vũ Trụ).
 * 
 * Tính năng cốt lõi:
 * 1. 24 Sơn Hướng La Kinh & Quy đổi tọa độ La Bàn (0 - 360°).
 * 2. Bộ lọc Tuyến Số Không Vong La Kinh: Đại Không Vong (±1.5°) & Tiểu Không Vong (±1.0°).
 * 3. Động cơ Vận 9 Tam Nguyên (2024 - 2043): Chính Thần (Ly 9) ưa Núi vs Linh Thần (Khảm 1) ưa Thủy.
 * 4. Động cơ Thủy Pháp Kích Hoạt Tài Lộc (Qi Men Water Dragon Activator): Quét tìm điểm vàng vượng tài.
 * 5. Thẩm định Dương Trạch: Quét 13 dạng vi phạm nghiêm trọng (Hỏa Thiêu Thiên Môn, Uế Khí Trung Cung, v.v.).
 * 6. Thẩm định Âm Trạch: Chẩn đoán thấu suốt lòng đất 8 bệnh mồ mả, Niên Mệnh Vong Linh, Phát Phúc 6 Chi.
 * 7. Động cơ Trạch Cát Kỳ Môn: Động thổ, Cất nóc, Nhập trạch, Hạ huyệt, Cải táng, Khai trương, Mở nước.
 * 8. Trình sinh Báo cáo Học thuật Toàn diện (Academic Essay Generator - Markdown 8 tầng / 9 tầng).
 */

(function (global) {
  'use strict';

  // ==============================================================================
  // 1. DỮ LIỆU 24 SƠN HƯỚNG LA KINH
  // ==============================================================================
  const TWENTY_FOUR_MOUNTAINS = [
    { id: 1, name: "Nhâm", degree_start: 337.5, degree_end: 352.5, degree_center: 345.0, palace_id: 1, palace_name: "Khảm", direction: "Chính Bắc", wuxing: "Thủy", polarity: "Dương", group: "Địa Nguyên Long" },
    { id: 2, name: "Tý", degree_start: 352.5, degree_end: 7.5, degree_center: 0.0, palace_id: 1, palace_name: "Khảm", direction: "Chính Bắc", wuxing: "Thủy", polarity: "Âm", group: "Thiên Nguyên Long" },
    { id: 3, name: "Quý", degree_start: 7.5, degree_end: 22.5, degree_center: 15.0, palace_id: 1, palace_name: "Khảm", direction: "Chính Bắc", wuxing: "Thủy", polarity: "Âm", group: "Nhân Nguyên Long" },
    { id: 4, name: "Sửu", degree_start: 22.5, degree_end: 37.5, degree_center: 30.0, palace_id: 8, palace_name: "Cấn", direction: "Đông Bắc", wuxing: "Thổ", polarity: "Âm", group: "Địa Nguyên Long" },
    { id: 5, name: "Cấn", degree_start: 37.5, degree_end: 52.5, degree_center: 45.0, palace_id: 8, palace_name: "Cấn", direction: "Đông Bắc", wuxing: "Thổ", polarity: "Dương", group: "Thiên Nguyên Long" },
    { id: 6, name: "Dần", degree_start: 52.5, degree_end: 67.5, degree_center: 60.0, palace_id: 8, palace_name: "Cấn", direction: "Đông Bắc", wuxing: "Mộc", polarity: "Dương", group: "Nhân Nguyên Long" },
    { id: 7, name: "Giáp", degree_start: 67.5, degree_end: 82.5, degree_center: 75.0, palace_id: 3, palace_name: "Chấn", direction: "Chính Đông", wuxing: "Mộc", polarity: "Dương", group: "Địa Nguyên Long" },
    { id: 8, name: "Mão", degree_start: 82.5, degree_end: 97.5, degree_center: 90.0, palace_id: 3, palace_name: "Chấn", direction: "Chính Đông", wuxing: "Mộc", polarity: "Âm", group: "Thiên Nguyên Long" },
    { id: 9, name: "Ất", degree_start: 97.5, degree_end: 112.5, degree_center: 105.0, palace_id: 3, palace_name: "Chấn", direction: "Chính Đông", wuxing: "Mộc", polarity: "Âm", group: "Nhân Nguyên Long" },
    { id: 10, name: "Thìn", degree_start: 112.5, degree_end: 127.5, degree_center: 120.0, palace_id: 4, palace_name: "Tốn", direction: "Đông Nam", wuxing: "Thổ", polarity: "Âm", group: "Địa Nguyên Long" },
    { id: 11, name: "Tốn", degree_start: 127.5, degree_end: 142.5, degree_center: 135.0, palace_id: 4, palace_name: "Tốn", direction: "Đông Nam", wuxing: "Mộc", polarity: "Dương", group: "Thiên Nguyên Long" },
    { id: 12, name: "Tỵ", degree_start: 142.5, degree_end: 157.5, degree_center: 150.0, palace_id: 4, palace_name: "Tốn", direction: "Đông Nam", wuxing: "Hỏa", polarity: "Dương", group: "Nhân Nguyên Long" },
    { id: 13, name: "Bính", degree_start: 157.5, degree_end: 172.5, degree_center: 165.0, palace_id: 9, palace_name: "Ly", direction: "Chính Nam", wuxing: "Hỏa", polarity: "Dương", group: "Địa Nguyên Long" },
    { id: 14, name: "Ngọ", degree_start: 172.5, degree_end: 187.5, degree_center: 180.0, palace_id: 9, palace_name: "Ly", direction: "Chính Nam", wuxing: "Hỏa", polarity: "Âm", group: "Thiên Nguyên Long" },
    { id: 15, name: "Đinh", degree_start: 187.5, degree_end: 202.5, degree_center: 195.0, palace_id: 9, palace_name: "Ly", direction: "Chính Nam", wuxing: "Hỏa", polarity: "Âm", group: "Nhân Nguyên Long" },
    { id: 16, name: "Mùi", degree_start: 202.5, degree_end: 217.5, degree_center: 210.0, palace_id: 2, palace_name: "Khôn", direction: "Tây Nam", wuxing: "Thổ", polarity: "Âm", group: "Địa Nguyên Long" },
    { id: 17, name: "Khôn", degree_start: 217.5, degree_end: 232.5, degree_center: 225.0, palace_id: 2, palace_name: "Khôn", direction: "Tây Nam", wuxing: "Thổ", polarity: "Dương", group: "Thiên Nguyên Long" },
    { id: 18, name: "Thân", degree_start: 232.5, degree_end: 247.5, degree_center: 240.0, palace_id: 2, palace_name: "Khôn", direction: "Tây Nam", wuxing: "Kim", polarity: "Dương", group: "Nhân Nguyên Long" },
    { id: 19, name: "Canh", degree_start: 247.5, degree_end: 262.5, degree_center: 255.0, palace_id: 7, palace_name: "Đoài", direction: "Chính Tây", wuxing: "Kim", polarity: "Dương", group: "Địa Nguyên Long" },
    { id: 20, name: "Dậu", degree_start: 262.5, degree_end: 277.5, degree_center: 270.0, palace_id: 7, palace_name: "Đoài", direction: "Chính Tây", wuxing: "Kim", polarity: "Âm", group: "Thiên Nguyên Long" },
    { id: 21, name: "Tân", degree_start: 277.5, degree_end: 292.5, degree_center: 285.0, palace_id: 7, palace_name: "Đoài", direction: "Chính Tây", wuxing: "Kim", polarity: "Âm", group: "Nhân Nguyên Long" },
    { id: 22, name: "Tuất", degree_start: 292.5, degree_end: 307.5, degree_center: 300.0, palace_id: 6, palace_name: "Càn", direction: "Tây Bắc", wuxing: "Thổ", polarity: "Âm", group: "Địa Nguyên Long" },
    { id: 23, name: "Càn", degree_start: 307.5, degree_end: 322.5, degree_center: 315.0, palace_id: 6, palace_name: "Càn", direction: "Tây Bắc", wuxing: "Kim", polarity: "Dương", group: "Thiên Nguyên Long" },
    { id: 24, name: "Hợi", degree_start: 322.5, degree_end: 337.5, degree_center: 330.0, palace_id: 6, palace_name: "Càn", direction: "Tây Bắc", wuxing: "Thủy", polarity: "Dương", group: "Nhân Nguyên Long" }
  ];

  // Ranh giới Đại Không Vong (Giao giới giữa 8 Cung Lạc Thư - mỗi Cung 45 độ)
  const DAI_KHONG_VONG_ANGLES = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];

  // Ranh giới Tiểu Không Vong (Giao giới giữa các Sơn trong cùng 1 Cung - mỗi Sơn 15 độ)
  const TIEU_KHONG_VONG_ANGLES = [
    7.5, 37.5, 52.5, 82.5, 97.5, 127.5, 142.5, 172.5,
    187.5, 217.5, 232.5, 262.5, 277.5, 307.5, 322.5, 352.5
  ];

  const PALACE_WUXING = {
    1: "Thủy", 2: "Thổ", 3: "Mộc", 4: "Mộc",
    5: "Thổ", 6: "Kim", 7: "Kim", 8: "Thổ", 9: "Hỏa"
  };

  const CAN_WUXING = {
    "Giáp": "Mộc", "Ất": "Mộc",
    "Bính": "Hỏa", "Đinh": "Hỏa",
    "Mậu": "Thổ", "Kỷ": "Thổ",
    "Canh": "Kim", "Tân": "Kim",
    "Nhâm": "Thủy", "Quý": "Thủy"
  };

  const DOOR_EVALUATIONS = {
    "Khai Môn": { type: "CÁT", score: 95, desc: "Cực cát, công danh thăng tiến, quan hệ rộng mở." },
    "Hưu Môn": { type: "CÁT", score: 90, desc: "Rất cát, gia đạo êm ấm, sức khỏe phục hồi, quý nhân trợ lực." },
    "Sinh Môn": { type: "CÁT", score: 100, desc: "Đại cát, sinh sôi nảy nở, tài lộc dồi dào, kinh doanh phát đạt." },
    "Cảnh Môn": { type: "BÌNH", score: 60, desc: "Bình hòa, chủ văn thư bằng cấp, giấy tờ pháp lý rõ ràng." },
    "Đỗ Môn": { type: "BÌNH", score: 50, desc: "Kín đáo, bế tắc nhẹ, thích hợp làm việc nghiên cứu mật." },
    "Thương Môn": { type: "HUNG", score: 25, desc: "Hung, dễ xô xát, thương tích, chi tiêu đột ngột." },
    "Kinh Môn": { type: "HUNG", score: 20, desc: "Hung, kiện tụng, thị phi khẩu thiệt, nghi kỵ lo âu." },
    "Tử Môn": { type: "ĐẠI HUNG", score: 10, desc: "Đại hung, khí tù đọng, bế tắc hoàn toàn, suy vi sinh lực." }
  };

  const STAR_EVALUATIONS = {
    "Thiên Tâm": { type: "CÁT", score: 90, desc: "Trí tuệ, kế sách chu toàn, lương y cứu người." },
    "Thiên Phụ": { type: "CÁT", score: 90, desc: "Văn hóa, giáo dục, thi cử đỗ đạt cao." },
    "Thiên Nhậm": { type: "CÁT", score: 85, desc: "Bất động sản vững chắc, kiên trì tích lũy." },
    "Thiên Cầm": { type: "CÁT", score: 95, desc: "Trung hòa, quý hiển, giải cứu mọi ách nạn." },
    "Thiên Xung": { type: "BÌNH", score: 55, desc: "Hành động nhanh, xông xáo nhưng dễ nóng vội." },
    "Thiên Anh": { type: "BÌNH", score: 60, desc: "Hào nhoáng, danh tiếng nhưng dễ hư danh." },
    "Thiên Bồng": { type: "HUNG", score: 25, desc: "Đạo tặc, phá sản, phiêu lưu rủi ro cao." },
    "Thiên Nhuế": { type: "HUNG", score: 20, desc: "Bệnh tật, mầm mống hư hoại, u uất." },
    "Thiên Trụ": { type: "HUNG", score: 30, desc: "Phá hoại, tranh cãi, tai nạn gãy đổ." }
  };

  const CRITICAL_VIOLATIONS_DB = [
    {
      code: "HOA_THIEU_THIEN_MON",
      name: "Hỏa Thiêu Thiên Môn",
      severity: "CRITICAL",
      trigger: { room_type: "kitchen", palace_id: 6 },
      impact: "Bếp (Hỏa) đặt tại Cung Càn 6 (Kim) thiêu rụi cửa trời. Người cha, người trụ cột nam dễ mắc bệnh huyết áp, đột quỵ, công danh suy sụp, con cái ngỗ nghịch.",
      remediation: {
        strategy: "THÔNG QUAN (Hỏa -> Thổ -> Kim) [Ưu tiên Cấp 1]",
        wuxing_cure: "Thổ",
        preferred_tier: 1,
        tier1_thong_quan: {
          title: "Cấp 1: Thông Quan (Hòa Giải Tương Sinh - Tối Ưu Nhất)",
          element: "Thổ",
          items: ["Bình gốm sứ Bát Tràng lớn men vàng đất", "Quả cầu thạch anh vàng tự nhiên", "Gạch ốp tường bếp màu vàng kem/nâu đất"],
          placement: "Đặt tại góc Tây Bắc của khu vực bếp để làm cầu nối: Hỏa sinh Thổ -> Thổ sinh Càn Kim.",
          activation_timing: "Giờ Thìn (07h-09h) hoặc giờ Tuất (19h-21h) - thời khắc Thổ khí vượng thuần."
        },
        tier2_tiet_khi: {
          title: "Cấp 2: Tiết Khí (Hao Mòn Hỏa Sát)",
          element: "Thổ ẩm & Thạch khoáng",
          items: ["Hũ muối biển đặt góc bếp", "Khối đá mắt hổ tự nhiên"],
          placement: "Đặt ngay cạnh bếp nấu để hấp thụ nhiệt hỏa dư thừa.",
          activation_timing: "Giờ Mùi (13h-15h)."
        },
        tier3_che_sat: {
          title: "Cấp 3: Chế Sát (Trấn Áp Bằng Kim Dày)",
          element: "Kim nguyên khối",
          items: ["Tượng kỳ lân đồng", "Xâu tiền cổ lục đế"],
          placement: "Treo trên trần bếp hướng Tây Bắc.",
          activation_timing: "Giờ Thân (15h-17h)."
        },
        action_advice: "Đặt vật phẩm hành Thổ tại góc Tây Bắc của khu vực bếp để làm cầu nối: Hỏa sinh Thổ, Thổ sinh Kim. Nếu được, ưu tiên đổi bếp sang phía Đông/Đông Nam."
      }
    },
    {
      code: "HOA_THIEU_THIEU_NU",
      name: "Hỏa Thiêu Thiếu Nữ",
      severity: "WARNING",
      trigger: { room_type: "kitchen", palace_id: 7 },
      impact: "Bếp Hỏa thiêu Cung Đoài Kim. Con gái nhỏ hoặc phụ nữ trẻ hay ốm đau, bệnh răng miệng, phế quản, thị phi khẩu thiệt.",
      remediation: {
        strategy: "THÔNG QUAN (Hỏa -> Thổ -> Kim) [Ưu tiên Cấp 1]",
        wuxing_cure: "Thổ",
        preferred_tier: 1,
        tier1_thong_quan: {
          title: "Cấp 1: Thông Quan (Hòa Giải)",
          element: "Thổ",
          items: ["Bát gốm đựng muối biển", "Trang trí tông màu nâu vàng", "Chậu gốm đất nung"],
          placement: "Đặt tại góc Chính Tây của bếp để Thổ sinh Đoài Kim.",
          activation_timing: "Giờ Sửu (01h-03h) hoặc Sửu/Mùi."
        },
        tier2_tiet_khi: {
          title: "Cấp 2: Tiết Khí",
          element: "Thổ khoáng",
          items: ["Đá thạch anh vàng", "Bình hoa gốm màu hoàng thổ"],
          placement: "Bố trí trên mặt bàn bếp hướng Tây.",
          activation_timing: "Giờ Thìn (07h-09h)."
        },
        tier3_che_sat: {
          title: "Cấp 3: Chế Sát",
          element: "Thủy nhẹ",
          items: ["Bình nước lọc tinh khiết"],
          placement: "Cách ly bếp nấu tối thiểu 1.2m.",
          activation_timing: "Giờ Hợi (21h-23h)."
        },
        action_advice: "Dùng hành Thổ hóa giải bớt Hỏa khí thiêu đốt Đoài Kim, giữ không gian bếp thông thoáng."
      }
    },
    {
      code: "UE_KHI_TRUNG_CUNG",
      name: "Uế Khí Trung Cung",
      severity: "CRITICAL",
      trigger: { room_type: "toilet", palace_id: 5 },
      impact: "Nhà vệ sinh đặt tại Trung Cung (Hoàng Cực). Uế khí và ẩm thấp lan tỏa khắp 8 cung, làm hư hại toàn bộ sinh khí của ngôi nhà, gia đình bệnh tật quanh năm.",
      remediation: {
        strategy: "TIẾT KHÍ & DƯƠNG HÓA [Ưu tiên Cấp 2]",
        wuxing_cure: "Dương Hỏa & Mộc",
        preferred_tier: 2,
        tier1_thong_quan: {
          title: "Cấp 1: Thông Quan Khí Trường",
          element: "Mộc & Hỏa",
          items: ["Hệ thống thông gió áp suất âm", "Đèn đá muối xông tinh dầu quế liên tục"],
          placement: "Lắp đặt tại vị trí cao nhất của phòng vệ sinh.",
          activation_timing: "Bật quạt chạy 24/7."
        },
        tier2_tiet_khi: {
          title: "Cấp 2: Tiết Khí & Hút Ẩm (Khuyến Nghị Cao)",
          element: "Mộc sinh học",
          items: ["Chậu cây lưỡi hổ", "Cây trầu bà leo tường", "Hũ than tre hoạt tính lớn"],
          placement: "Đặt ở 4 góc phòng vệ sinh để hấp thụ triệt để uế khí ẩm mốc.",
          activation_timing: "Thay than tre định kỳ 30 ngày/lần."
        },
        tier3_che_sat: {
          title: "Cấp 3: Trấn Sát Tẩy Uế",
          element: "Hỏa Quang Minh",
          items: ["Đèn sưởi halogen ánh sáng vàng ấm 2700K", "Gương bát quái phẳng trấn trên cửa ngoài"],
          placement: "Chiếu sáng liên tục, giữ sàn nhà vệ sinh luôn khô ráo 100%.",
          activation_timing: "Giờ Ngọ (11h-13h)."
        },
        action_advice: "Lắp quạt thông gió công suất cao chạy liên tục, đặt nhiều cây trầu bà/lưỡi hổ hút khí độc, giữ sàn nhà vệ sinh luôn khô ráo 100%."
      }
    },
    {
      code: "UE_O_SINH_MON",
      name: "Ô Uế Tài Khí Sinh Môn",
      severity: "WARNING",
      trigger: { room_type: "toilet", check_door: "Sinh Môn" },
      impact: "Nhà vệ sinh đặt tại Cung có Sinh Môn. Làm ô uế phương vị sinh tài lộc, tiền bạc làm ra bao nhiêu hao tán bấy nhiêu, khó giữ của.",
      remediation: {
        strategy: "THANH LỌC TÀI KHÍ & BẢO TOÀN SINH MÔN",
        wuxing_cure: "Kim & Thủy sạch",
        preferred_tier: 1,
        tier1_thong_quan: {
          title: "Cấp 1: Thông Quan & Hút Uế",
          element: "Kim",
          items: ["Hồ lô đồng hút uế khí", "Quả cầu thạch anh trắng", "Hũ muối hạt tinh khiết"],
          placement: "Treo hồ lô đồng trước cửa nhà vệ sinh, đặt bát muối biển trong góc.",
          activation_timing: "Giờ Thân (15h-17h)."
        },
        tier2_tiet_khi: {
          title: "Cấp 2: Tiết Khí Ẩm",
          element: "Kim sinh Thủy sạch",
          items: ["Hộp hút ẩm tinh chất than hoa", "Rèm che màu trắng bạc"],
          placement: "Treo rèm che cửa nhà vệ sinh.",
          activation_timing: "Giờ Dậu (17h-19h)."
        },
        tier3_che_sat: {
          title: "Cấp 3: Chế Sát Trực Diện",
          element: "Kim chế",
          items: ["Chuông gió kim loại 6 ống"],
          placement: "Treo trước ngưỡng cửa.",
          activation_timing: "Giờ Tỵ (09h-11h)."
        },
        action_advice: "Đóng cửa nhà vệ sinh thường xuyên, đặt hũ muối biển hoặc chậu đá thạch anh trắng hút ẩm."
      }
    },
    {
      code: "UE_O_TRUC_PHU",
      name: "Ô Uế Quý Nhân Trực Phù",
      severity: "WARNING",
      trigger: { room_type: "toilet", check_deity: "Trực Phù" },
      impact: "Nhà vệ sinh đặt tại Cung có Thần Trực Phù bảo trợ. Xua đuổi quý nhân, lãnh đạo không ủng hộ, tiểu nhân lộng hành quấy nhiễu.",
      remediation: {
        strategy: "TRẤN UẾ AN THẦN [Ưu tiên Cấp 1]",
        wuxing_cure: "Kim",
        preferred_tier: 1,
        tier1_thong_quan: {
          title: "Cấp 1: Trấn Uế An Thần",
          element: "Kim",
          items: ["Chuông gió đồng 6 ống", "Thảm trải sàn màu trắng bạc", "Bình xịt tinh dầu sả chanh"],
          placement: "Treo chuông gió ngoài cửa vệ sinh, đặt thảm màu sáng.",
          activation_timing: "Giờ Thìn (07h-09h) - giờ Thiên Cương xuất hiện."
        },
        tier2_tiet_khi: {
          title: "Cấp 2: Tiết Uế Dương Khí",
          element: "Hỏa thanh tịnh",
          items: ["Đèn tinh dầu xông quế"],
          placement: "Xông phòng mỗi chiều tối.",
          activation_timing: "Giờ Thân (15h-17h)."
        },
        tier3_che_sat: {
          title: "Cấp 3: Chế Ngự Uế Khí",
          element: "Kim khối",
          items: ["Tượng linh quy đồng"],
          placement: "Đặt trên bậu cửa.",
          activation_timing: "Giờ Dậu (17h-19h)."
        },
        action_advice: "Giữ gìn không gian nhà vệ sinh tuyệt đối sạch sẽ thơm tho, ngăn uế khí phát tán sang phòng khách."
      }
    },
    {
      code: "CUA_CHINH_TU_MON",
      name: "Cửa Chính Ngộ Tử Môn",
      severity: "WARNING",
      trigger: { room_type: "main_door", check_door: "Tử Môn" },
      impact: "Cửa chính nạp khí mở vào Cung Tử Môn. Sinh khí suy bại, người trong nhà dễ mắc bệnh mãn tính, uể oải, mất nhiệt huyết làm việc.",
      remediation: {
        strategy: "KÍCH HOẠT DƯƠNG KHÍ & CHUYỂN HÓA TỬ MÔN",
        wuxing_cure: "Dương Hỏa & Kim Sáng",
        preferred_tier: 1,
        tier1_thong_quan: {
          title: "Cấp 1: Chuyển Hóa Khí Trường Nạp Khí",
          element: "Hỏa Quang Minh",
          items: ["Đèn chùm pha lê rực rỡ ngoài tiền sảnh", "Thảm đỏ đón khách tươi tắn", "Cây hồng môn hoặc hoa tươi đỏ"],
          placement: "Bố trí tại sảnh trước cửa chính để nạp dương khí mạnh mẽ.",
          activation_timing: "Giờ Ngọ (11h-13h) hoặc giờ Tỵ (09h-11h)."
        },
        tier2_tiet_khi: {
          title: "Cấp 2: Hấp Thụ Âm Khí",
          element: "Mộc sinh trưởng",
          items: ["Cặp chậu cau cảnh hoặc kim tiền lớn hai bên cửa"],
          placement: "Đặt cân đối hai bên cánh cửa chính.",
          activation_timing: "Giờ Mão (05h-07h)."
        },
        tier3_che_sat: {
          title: "Cấp 3: Phản Xạ Sát Khí",
          element: "Kim sáng",
          items: ["Gương đồng lồi quang minh"],
          placement: "Treo phía trên biển số nhà.",
          activation_timing: "Giờ Thân (15h-17h)."
        },
        action_advice: "Bố trí đèn sáng rực rỡ ngoài cửa, đặt thảm màu tươi sáng, hoặc mở cửa phụ hướng cát tường để chia sẻ lưu lượng nạp khí."
      }
    },
    {
      code: "CUA_CHINH_KHONG_VONG",
      name: "Cửa Chính Phạm Không Vong",
      severity: "CRITICAL",
      trigger: { room_type: "main_door", check_kong_wang: true },
      impact: "Cửa chính rơi vào Cung Không Vong. Nạp khí hư ảo, gia chủ làm ăn gặp nhiều dự án ảo, tiền tài khó tích tụ, hay bị lừa dối.",
      remediation: {
        strategy: "ĐIỀN THỰC KHÔNG VONG & TRẤN ĐỊNH ĐỊA KHÍ",
        wuxing_cure: "Thổ kiên cố",
        preferred_tier: 1,
        tier1_thong_quan: {
          title: "Cấp 1: Điền Thực Bản Cung (Khuyến Nghị Hàng Đầu)",
          element: "Thổ & Kim nặng",
          items: ["Cặp kỳ lân đá tự nhiên nặng", "Bậc tam cấp bằng đá granite nguyên khối", "Xâu tiền ngũ đế đồng cổ chôn dưới ngưỡng cửa"],
          placement: "Đặt cặp lân đá trấn trạch hai bên thềm cửa, gia cố ngưỡng cửa dày dặn.",
          activation_timing: "Giờ Thìn / Tuất (thời điểm Thổ xung mở kho điền thực)."
        },
        tier2_tiet_khi: {
          title: "Cấp 2: Tụ Khí Ngoại Vi",
          element: "Thổ nung",
          items: ["Bình phong gốm sứ nghệ thuật chắn gió"],
          placement: "Đặt bên trong sảnh cách cửa 1.5m.",
          activation_timing: "Giờ Mùi (13h-15h)."
        },
        tier3_che_sat: {
          title: "Cấp 3: Trấn Trạch Thần Khí",
          element: "Kim đặc",
          items: ["Chuông đồng đại hồng chung mini"],
          placement: "Treo góc hiên đón gió.",
          activation_timing: "Giờ Dậu (17h-19h)."
        },
        action_advice: "Gia cố bậc tam cấp kiên cố, đặt tảng đá lớn trấn định địa khí trước thềm cửa, tránh mở toang cửa trong giờ giao thời."
      }
    },
    {
      code: "GIUONG_THIEN_NHUE",
      name: "Giường Ngủ Ngộ Thiên Nhuế Tinh",
      severity: "WARNING",
      trigger: { room_type: "master_bed", check_star: "Thiên Nhuế" },
      impact: "Giường ngủ đặt tại Cung có sao Thiên Nhuế (bệnh tật). Người ngủ hay ốm đau vặt, lâu ngày tích tụ mầm mống u nang, viêm nhiễm mãn tính.",
      remediation: {
        strategy: "HÓA GIẢI BỆNH PHÙ BẰNG KIM NGUYÊN CHẤT",
        wuxing_cure: "Kim",
        preferred_tier: 1,
        tier1_thong_quan: {
          title: "Cấp 1: Hóa Giải Bệnh Phù (Thiên Nhuế Thổ -> Kim)",
          element: "Kim đồng thau",
          items: ["2 quả hồ lô đồng nguyên chất có nắp mở", "Xâu tiền hoa mai đồng cổ mạ vàng"],
          placement: "Treo 2 quả hồ lô đồng ở hai bên đầu giường ngủ ngang tầm đầu nằm.",
          activation_timing: "Giờ Dậu (17h-19h) hoặc giờ Thân (15h-17h) - Kim vượng tiết Thổ bệnh phù."
        },
        tier2_tiet_khi: {
          title: "Cấp 2: Tiết Bệnh Khí",
          element: "Kim mềm & Đá trắng",
          items: ["Gối hoặc drap giường màu trắng / ghi xám", "Đá thạch anh trắng vụn"],
          placement: "Rải một lớp đá thạch anh trắng mỏng dưới gầm giường.",
          activation_timing: "Giờ Thân (15h-17h)."
        },
        tier3_che_sat: {
          title: "Cấp 3: Chế Ngự Khẩn Cấp",
          element: "Di dời giường",
          items: ["Dịch chuyển vị trí kê giường lệch 1m"],
          placement: "Di dời sang Cung có Thiên Tâm Tinh (Lương Y) hoặc Cát Tinh lân cận.",
          activation_timing: "Giờ Mão (05h-07h)."
        },
        action_advice: "Treo 2 quả hồ lô đồng ở đầu giường ngủ để hút khí bệnh tật của Thiên Nhuế Tinh, vệ sinh nệm gối thường xuyên."
      }
    },
    {
      code: "GIUONG_BACH_HO",
      name: "Giường Ngủ Ngộ Bạch Hổ",
      severity: "WARNING",
      trigger: { room_type: "master_bed", check_deity: "Bạch Hổ" },
      impact: "Giường ngủ có Thần Bạch Hổ hung hãn. Dễ xảy ra tranh cãi nảy lửa giữa vợ chồng, người nằm ngủ hay bị ác mộng, tai nạn đổ máu, mổ xẻ.",
      remediation: {
        strategy: "AN TĨNH HOÀ HỢP & NHU THỦY TIẾT KIM",
        wuxing_cure: "Thủy mềm mại",
        preferred_tier: 1,
        tier1_thong_quan: {
          title: "Cấp 1: Nhu Thủy Hóa Kim Hung",
          element: "Thủy an tĩnh",
          items: ["Tranh phong cảnh hồ nước phẳng lặng êm đềm", "Ga trải giường màu xanh nước biển hoặc xanh lam", "Bình hoa cúc trắng nước trong"],
          placement: "Treo tranh trên tường đối diện giường ngủ, thay ga giường tông xanh dịu mát.",
          activation_timing: "Giờ Hợi (21h-23h) hoặc giờ Tý (23h-01h)."
        },
        tier2_tiet_khi: {
          title: "Cấp 2: Tiết Kim Khí",
          element: "Thủy tự nhiên",
          items: ["Chén nước an nhẫn (nước muối biển sạch)"],
          placement: "Đặt ở góc khuất cạnh đầu giường.",
          activation_timing: "Giờ Tý (23h-01h)."
        },
        tier3_che_sat: {
          title: "Cấp 3: Chế Ngự Bạch Hổ",
          element: "Hỏa ấm",
          items: ["Đèn ngủ ánh sáng hồng đào dịu ấm"],
          placement: "Bật đèn ngủ mờ suốt đêm.",
          activation_timing: "Giờ Tuất (19h-21h)."
        },
        action_advice: "Dùng hành Thủy mềm mại hóa giải bớt tính hung bạo của Bạch Hổ Kim, tránh để vật sắc nhọn kim loại trong phòng ngủ."
      }
    },
    {
      code: "GIUONG_DANG_XA",
      name: "Giường Ngủ Ngộ Đằng Xà",
      severity: "WARNING",
      trigger: { room_type: "master_bed", check_deity: "Đằng Xà" },
      impact: "Giường ngủ ngộ Đằng Xà. Người ngủ hay bị bóng đè, mê man, thần kinh căng thẳng, cảm giác có người vô hình theo dõi.",
      remediation: {
        strategy: "TẨY UẾ TRẤN TÂM & QUANG MINH ĐỊNH THẦN",
        wuxing_cure: "Dương Hỏa & Thạch khoáng thanh tịnh",
        preferred_tier: 1,
        tier1_thong_quan: {
          title: "Cấp 1: Tẩy Uế Trấn Tâm",
          element: "Dương Hỏa quang minh",
          items: ["Đèn đá muối Himalaya màu cam đỏ xông tinh dầu quế/trầm", "Khối đá thạch anh tím tự nhiên"],
          placement: "Đặt khối đá thạch anh tím ở tab đầu giường, xông trầm hương nhẹ nhàng trước khi ngủ.",
          activation_timing: "Giờ Dậu (17h-19h) trước khi màn đêm buông xuống."
        },
        tier2_tiet_khi: {
          title: "Cấp 2: Ổn Định Từ Trường",
          element: "Kim an thần",
          items: ["Hồ lô đồng có khắc Chú Dược Sư"],
          placement: "Treo đầu giường.",
          activation_timing: "Giờ Thân (15h-17h)."
        },
        tier3_che_sat: {
          title: "Cấp 3: Chế Hỏa Xà",
          element: "Thủy thanh tịnh",
          items: ["Ly nước lọc tinh khiết thay mới mỗi sáng"],
          placement: "Đặt đầu giường.",
          activation_timing: "Giờ Thìn (07h-09h)."
        },
        action_advice: "Xông trầm hương định kỳ hàng tuần, đặt đá thạch anh tím dưới chân giường để ổn định từ trường."
      }
    },
    {
      code: "BAN_THO_TUA_TOILET",
      name: "Ban Thờ Tựa Vách Nhà Vệ Sinh",
      severity: "CRITICAL",
      trigger: { room_type: "altar", adjacent_room: "toilet" },
      impact: "Ban thờ tựa lưng hoặc đối diện nhà vệ sinh. Bất kính với Tiên tổ và Thần linh, âm phúc suy giảm, con cháu sa sút học hành.",
      remediation: {
        strategy: "DI DỜI KHẨN CẤP HOẶC CÁCH LY TUYỆT ĐỐI",
        wuxing_cure: "Mộc thuần khiết & Không khí cách ly",
        preferred_tier: 1,
        tier1_thong_quan: {
          title: "Cấp 1: Cách Ly Vật Lý & Tạo Khoảng Đệm",
          element: "Mộc & Khoảng Không Khí",
          items: ["Vách ngăn gỗ thịt tự nhiên (gỗ mít/gỗ gõ)", "Tấm xốp cách âm chống ẩm lót sau vách", "Tấm ốp alu vàng ngăn khí"],
          placement: "Lắp vách gỗ cách ly tường vệ sinh tối thiểu 10cm - 15cm; ban thờ tựa vào vách gỗ độc lập.",
          activation_timing: "Giờ Mão (05h-07h) hoặc giờ Thìn (07h-09h) ngày Hoàng Đạo."
        },
        tier2_tiet_khi: {
          title: "Cấp 2: Hút Ẩm Toàn Diện",
          element: "Thảo mộc thanh tẩy",
          items: ["Túi thơm trầm thảo mộc treo sau vách", "Hộp than hoạt tính"],
          placement: "Bố trí trong khe đệm cách ly.",
          activation_timing: "Thay mới định kỳ mỗi tháng."
        },
        tier3_che_sat: {
          title: "Cấp 3: Biện Pháp Triệt Để Nhất",
          element: "Di dời công năng",
          items: ["Di dời ban thờ sang phòng khách hoặc tầng thượng trang nghiêm"],
          placement: "Chọn vị trí tọa cát hướng cát.",
          activation_timing: "Xem giờ Trạch Cát Nhập Trạch / An Vị Ban Thờ."
        },
        action_advice: "Bắt buộc phải di dời ban thờ sang cung vị thanh tịnh; nếu chưa dời được thì đặt vách ngăn cách ly vách tường tối thiểu 10cm."
      }
    },
    {
      code: "MON_BACH_KHAI_MON",
      name: "Khai Môn Bị Bách (Kim Khắc Mộc)",
      severity: "WARNING",
      trigger: { door_name: "Khai Môn", palaces: [3, 4] },
      impact: "Khai Môn (Kim) đóng tại Cung Chấn/Tốn (Mộc). Kim khắc Mộc gây tổn hại gan mật, thần kinh, quan hệ đối tác dễ đứt gãy giữa chừng.",
      remediation: {
        strategy: "THÔNG QUAN (Kim -> Thủy -> Mộc) [Ưu tiên Cấp 1]",
        wuxing_cure: "Thủy",
        preferred_tier: 1,
        tier1_thong_quan: {
          title: "Cấp 1: Thông Quan (Kim sinh Thủy -> Thủy sinh Mộc)",
          element: "Thủy lưu động",
          items: ["Phong thủy luân mini lưu chuyển nước", "Bình hoa thủy tinh cắm hoa tươi", "Thảm trải sàn màu xanh lam/đen"],
          placement: "Bố trí tại góc phương vị có Khai Môn (Đông hoặc Đông Nam).",
          activation_timing: "Giờ Hợi (21h-23h) hoặc giờ Tý (23h-01h)."
        },
        tier2_tiet_khi: {
          title: "Cấp 2: Tiết Kim Khí",
          element: "Thủy dưỡng Mộc",
          items: ["Cây thủy sinh phát lộc"],
          placement: "Đặt gần cửa sổ hoặc bàn làm việc.",
          activation_timing: "Giờ Dần (03h-05h)."
        },
        tier3_che_sat: {
          title: "Cấp 3: Hỏa Chế Kim",
          element: "Hỏa nhẹ",
          items: ["Đèn chiếu màu vàng ấm"],
          placement: "Chiếu sáng khu vực lối đi.",
          activation_timing: "Giờ Tỵ (09h-11h)."
        },
        action_advice: "Dùng hành Thủy làm cầu nối: Kim sinh Thủy, Thủy sinh Mộc, biến sự xung sát bách khắc thành quan hệ tương sinh thịnh vượng."
      }
    },
    {
      code: "MON_BACH_THUONG_MON",
      name: "Thương Môn Bị Bách (Mộc Khắc Thổ)",
      severity: "WARNING",
      trigger: { door_name: "Thương Môn", palaces: [2, 8] },
      impact: "Thương Môn (Mộc) đóng tại Cung Khôn/Cấn (Thổ). Mộc khắc Thổ gây bệnh dạ dày, tỳ vị suy yếu, dễ hao tổn tài sản do rủi ro pháp lý.",
      remediation: {
        strategy: "THÔNG QUAN (Mộc -> Hỏa -> Thổ) [Ưu tiên Cấp 1]",
        wuxing_cure: "Hỏa",
        preferred_tier: 1,
        tier1_thong_quan: {
          title: "Cấp 1: Thông Quan (Mộc sinh Hỏa -> Hỏa sinh Thổ)",
          element: "Hỏa",
          items: ["Đèn ngủ ánh sáng đỏ ấm hoặc cam", "Tranh phong cảnh mặt trời mọc / ngựa phi đường xa", "Thảm trải sàn màu đỏ thẫm / hồng cánh sen"],
          placement: "Đặt tại Cung Khôn (Tây Nam) hoặc Cung Cấn (Đông Bắc).",
          activation_timing: "Giờ Ngọ (11h-13h) hoặc giờ Tỵ (09h-11h)."
        },
        tier2_tiet_khi: {
          title: "Cấp 2: Tiết Khí Mộc Sát",
          element: "Hỏa nung",
          items: ["Đèn đá muối tự nhiên"],
          placement: "Đặt ở góc phòng.",
          activation_timing: "Giờ Tỵ (09h-11h)."
        },
        tier3_che_sat: {
          title: "Cấp 3: Kim Chế Mộc",
          element: "Kim",
          items: ["Chuông gió kim loại 6 ống"],
          placement: "Treo cửa sổ.",
          activation_timing: "Giờ Thân (15h-17h)."
        },
        action_advice: "Bổ sung hành Hỏa làm trung gian hóa giải: Mộc sinh Hỏa, Hỏa sinh Thổ, hóa hung thành cát, ổn định tỳ vị gia đình."
      }
    }
  ];

  const GRAVE_ANOMALIES_DB = [
    {
      code: "MO_THUY_NGAP_UNG",
      name: "Mộ Phần Bị Ngập Úng Nước Ngầm",
      severity: "CRITICAL",
      symptom: "Nước ngầm dâng cao tràn vào ván tài, hài cốt bị ngâm trong bùn nước lạnh giá, xương cốt bị đen mục.",
      descendant_impact: "Con cháu đời sau dễ bị bệnh thận, phù thũng, tai nạn sông nước, sa ngã nghiện ngập, làm ăn thất thoát phá sản.",
      solution: "Cần khai thông rãnh thoát nước ngầm xung quanh mộ hoặc bốc mộ cải táng sang đồi cao ráo, tụ khí."
    },
    {
      code: "MOC_CAN_XUYEN_COT",
      name: "Rễ Cây Xuyên Thấu Hài Cốt",
      severity: "CRITICAL",
      symptom: "Rễ cây cổ thụ hoặc bụi rậm gần mộ đâm thủng áo quan, rễ quấn chặt quanh xương sọ hoặc cột sống hài cốt.",
      descendant_impact: "Con cháu đau nhức xương khớp dữ dội, bị tê liệt, thoái hóa cột sống sớm, tâm thần bất an, gia đình hay lục đục.",
      solution: "Chặt bỏ gốc cây cổ thụ gần mộ, làm lễ xin đào bới mở nắp mộ cắt tỉa toàn bộ rễ cây bao quanh."
    },
    {
      code: "TRUNG_NGHI_XAM_THAU",
      name: "Côn Trùng Kiến Mối Đục Khoét",
      severity: "WARNING",
      symptom: "Kiến lửa, mối đất làm tổ bên trong mộ, ăn mòn ván tài và làm tổ quanh hài cốt.",
      descendant_impact: "Con cháu hay mắc các chứng bệnh ngoài da, lở loét ngứa ngáy, dị ứng không rõ nguyên nhân, nội bộ tranh chấp đất đai.",
      solution: "Phun thuốc diệt mối sinh học, đào bới loại bỏ tổ mối, đắp lại đất phù sa sạch sẽ."
    },
    {
      code: "THACH_TRE_BUC_BACH",
      name: "Tảng Đá Chấn Ép / Sạt Lở Vách Mộ",
      severity: "CRITICAL",
      symptom: "Đá ngầm sụt lún chấn gãy nắp quan tài, vách huyệt bị nứt vỡ đè ép hài cốt.",
      descendant_impact: "Con cháu bị tai nạn giao thông gãy xương, mổ xẻ, dính án tù tội, tranh chấp bạo lực.",
      solution: "Tu sửa kè chắn xung quanh mộ, dỡ bỏ khối đá chấn ép, gia cố phần móng mồ mả kiên cố."
    },
    {
      code: "PHONG_XUY_DOAN_HAU",
      name: "Gió Bấc Lùa Hậu Chẩm (Thiếu Tựa)",
      severity: "WARNING",
      symptom: "Phía sau bia mộ trống trải, không có gò tựa, gió bấc thổi lùa trực tiếp vào sau lưng mộ.",
      descendant_impact: "Con cháu hiếm muộn, tuyệt tự con trai, người trong nhà đoản thọ, chết trẻ không rõ nguyên cớ.",
      solution: "Xây tường hoa bình phong che chắn sau bia mộ, đắp gò đất mai rùa cản gió lạnh."
    },
    {
      code: "HU_HUYET_TUYET_MACH",
      name: "Hư Huyệt Tuyệt Khí (Không Vong)",
      severity: "CRITICAL",
      symptom: "Huyệt mộ rơi vào Cung Không Vong, đất cát xốp rỗng, mạch khí đã chuyển dời đi nơi khác.",
      descendant_impact: "Dòng họ phân tán tha hương cầu thực, làm ăn thất bát, không ai thành danh, con cháu ly tán.",
      solution: "Bắt buộc phải tìm kiếm long mạch mới để dời mộ (Cải táng) về nơi tụ khí bền vững."
    },
    {
      code: "QUY_TA_XAM_CHIEM",
      name: "Âm Tà Quấy Nhiễu Mộ Phần",
      severity: "WARNING",
      symptom: "Mộ phần bị chôn cạnh bãi tha ma vô chủ hoặc dưới gốc cây có âm khí nặng, vong linh bị quấy quả.",
      descendant_impact: "Người trong nhà hay mơ thấy ác mộng, tâm thần bất an, tính tình thay đổi thất thường, trầm cảm kinh niên.",
      solution: "Lập đàn cầu siêu trang trọng, cúng tạ thổ thần và thỉnh bùa trấn trạch âm phần."
    },
    {
      code: "HUYET_KET_PHAT_QUANG",
      name: "Huyệt Kết Chân Long Phát Phúc",
      severity: "AUSPICIOUS",
      symptom: "Huyệt kết tơ vàng ngũ sắc, đất ấm áp hồng hào, tụ khí trác tuyệt.",
      descendant_impact: "Con cháu dòng họ đời sau xuất hiện nhân tài kiệt xuất, đỗ đạt cử nhân tiến sĩ, đại phú đại quý bền vững 3 đời.",
      solution: "TUYỆT ĐỐI GIỮ NGUYÊN HIỆN TRẠNG, không được đào bới di dời, chỉ cần hương khói chu đáo hàng năm."
    }
  ];

  const DESCENDANT_BRANCHES_MAPPING = {
    "3": { branch_name: "Trưởng Nam (Con trai cả)", palace_name: "Chấn 3", wuxing: "Mộc" },
    "1": { branch_name: "Thứ Nam (Con trai thứ 2)", palace_name: "Khảm 1", wuxing: "Thủy" },
    "8": { branch_name: "Út Nam (Con trai út)", palace_name: "Cấn 8", wuxing: "Thổ" },
    "4": { branch_name: "Trưởng Nữ (Con gái cả)", palace_name: "Tốn 4", wuxing: "Mộc" },
    "9": { branch_name: "Thứ Nữ (Con gái thứ 2)", palace_name: "Ly 9", wuxing: "Hỏa" },
    "7": { branch_name: "Út Nữ (Con gái út)", palace_name: "Đoài 7", wuxing: "Kim" }
  };

  // ==============================================================================
  // 2. CÁC HÀM QUY ĐỔI TỌA ĐỘ & BỘ LỌC TUYẾN SỐ KHÔNG VONG
  // ==============================================================================

  /**
   * Quy đổi số độ La Bàn (0 - 360°) sang 24 Sơn Hướng và Cung Lạc Thư
   */
  function degreeToMountain(degree) {
    const deg = ((Number(degree) || 0) % 360 + 360) % 360;
    for (const m of TWENTY_FOUR_MOUNTAINS) {
      if (m.degree_start > m.degree_end) { // Qua ranh giới 360° (Sơn Tý từ 352.5° đến 7.5°)
        if (deg >= m.degree_start || deg < m.degree_end) return m;
      } else {
        if (deg >= m.degree_start && deg < m.degree_end) return m;
      }
    }
    return TWENTY_FOUR_MOUNTAINS[1]; // Default Tý Sơn
  }

  /**
   * Phát hiện Tuyến Số Không Vong La Kinh (Đại / Tiểu Không Vong)
   */
  function detectCompassVoidLines(degree, tolerance = 1.5) {
    const deg = ((Number(degree) || 0) % 360 + 360) % 360;

    // 1. Quét Đại Không Vong (Dung sai ± 1.5°)
    for (const boundary of DAI_KHONG_VONG_ANGLES) {
      const diff = Math.min(Math.abs(deg - boundary), 360 - Math.abs(deg - boundary));
      if (diff <= tolerance) {
        return {
          has_void_line: true,
          type: "ĐẠI KHÔNG VONG TUYẾN (Major Void Line)",
          boundary_angle: boundary,
          measured_angle: Number(deg.toFixed(1)),
          deviation: Number(diff.toFixed(2)),
          severity: "CRITICAL",
          impact: "Tọa hướng nhà nằm đè lên đường phân giới giữa 2 Quẻ Cung Lạc Thư. Khí trường hỗn loạn, âm dương bất phân, gia đạo dễ phân liệt, tâm thần bất an, tổn hại tài vận.",
          remediation: `Cần điều chỉnh góc mở cửa chính lệch sang trái hoặc phải ít nhất 3.0° để thoát khỏi ranh giới ${boundary.toFixed(1)}°.`
        };
      }
    }

    // 2. Quét Tiểu Không Vong (Dung sai ± 1.0°)
    for (const boundary of TIEU_KHONG_VONG_ANGLES) {
      const diff = Math.min(Math.abs(deg - boundary), 360 - Math.abs(deg - boundary));
      if (diff <= 1.0) {
        return {
          has_void_line: true,
          type: "TIỂU KHÔNG VONG TUYẾN (Minor Void Line)",
          boundary_angle: boundary,
          measured_angle: Number(deg.toFixed(1)),
          deviation: Number(diff.toFixed(2)),
          severity: "WARNING",
          impact: "Tọa hướng nhà đè lên đường ranh giới giữa 2 Sơn trong cùng một Cung. Công việc trắc trở, nội bộ gia đình bất đồng quan điểm, khó tích lũy tài sản lớn.",
          remediation: `Nên chỉnh khuôn cửa hoặc đổi tay nắm cửa lệch khỏi góc ${boundary.toFixed(1)}° khoảng 2.0° để nạp thuần khí một Sơn.`
        };
      }
    }

    return {
      has_void_line: false,
      type: "CHÍNH TUYẾN THUẦN KHÍ (Pure Directional Line)",
      measured_angle: Number(deg.toFixed(1)),
      status: "Cát tường, khí trường ổn định vững chãi."
    };
  }

  // ==============================================================================
  // 3. ĐỘNG CƠ HẠ NGUYÊN VẬN 9 (2024 - 2043)
  // ==============================================================================

  /**
   * Đánh giá tương thích Hạ Nguyên Vận 9 (Chính Thần Cung 9 vs Linh Thần Cung 1)
   */
  function evaluatePeriod9Synergy(houseDegree, chartPalaces = {}, roomAllocations = {}) {
    const period9Notes = [];
    let p9BonusScore = 0;

    const mainDoorP = Number(roomAllocations.main_door || 0);
    const toiletP = Number(roomAllocations.toilet || 0);
    const livingP = Number(roomAllocations.living_room || 0);

    // Cửa chính hoặc phòng khách tại Cung Khảm 1 (Linh Thần Đắc Thủy)
    if (mainDoorP === 1 || livingP === 1) {
      period9Notes.push("Cửa chính / Phòng khách tại Cung Khảm 1: Đắc thế 'Linh Thần Khẩu' trong Vận 9, đại cát cho tài lộc công nghệ, AI, sáng tạo số.");
      p9BonusScore += 20;
    } else if (mainDoorP === 9) {
      period9Notes.push("Cửa chính đặt tại Cung Ly 9: Phạm thế 'Chính Thần Hạ Thủy' nhẹ trong Vận 9 nếu có đường nước chảy xiết trước nhà.");
      p9BonusScore -= 10;
    }

    // Nhà vệ sinh tại Cung Khảm 1 (Làm ô uế Linh Thần)
    if (toiletP === 1) {
      period9Notes.push("Cảnh báo: Nhà vệ sinh đặt tại Cung Khảm 1 làm ô uế phương vị Linh Thần của Vận 9, cần tăng cường hóa giải.");
      p9BonusScore -= 20;
    }

    // Tọa Sơn Cung Ly 9
    const sittingMountain = degreeToMountain((houseDegree + 180) % 360);
    if (sittingMountain.palace_id === 9) {
      period9Notes.push("Tọa Sơn tại Cung Ly 9: Đắc thế 'Chính Thần Đắc Vị', tọa kiên cố sinh nhân đinh quý hiển trong Vận 9.");
      p9BonusScore += 15;
    }

    if (period9Notes.length === 0) {
      period9Notes.push("Cấu trúc nhà cân bằng bình hòa trong chu kỳ Hạ Nguyên Vận 9 (2024 - 2043).");
    }

    return {
      current_period: "VẬN 9 HẠ NGUYÊN (2024 - 2043)",
      period_element: "Cửu Tử Hỏa (Ly 9)",
      zheng_shen_palace: "Cung Ly 9 (Chính Nam) - Ưa Tĩnh / Núi / Tọa sơn kiên cố",
      ling_shen_palace: "Cung Khảm 1 (Chính Bắc) - Ưa Động / Nước / Hướng nạp tài",
      period_9_bonus_score: p9BonusScore,
      insights: period9Notes
    };
  }

  // ==============================================================================
  // 4. ĐỘNG CƠ THỦY PHÁP KÍCH HOẠT TÀI LỘC (QI MEN WATER DRAGON ACTIVATOR)
  // ==============================================================================

  /**
   * Quét tìm vị trí vàng trong 8 Cung để đặt hồ cá phong thủy hoặc thác nước phong thủy luân
   */
  function findOptimalWaterActivation(chartPalaces = {}, roomAllocations = {}) {
    const candidates = [];
    const toiletP = Number(roomAllocations.toilet || -1);

    for (const pid of [1, 2, 3, 4, 6, 7, 8, 9]) {
      if (pid === toiletP) continue; // Bỏ qua cung có nhà vệ sinh

      const p = chartPalaces[pid] || {};
      const door = p.door || "";
      const star = p.star || "";
      const deity = p.deity || p.divinity || "";
      const hStem = Array.isArray(p.heaven_stem) ? p.heaven_stem[0] : (p.heaven_stem || p.hcs || "");

      let score = 0;
      const reasons = [];

      if (door === "Sinh Môn") {
        score += 40;
        reasons.push("Đắc Sinh Môn (Đại cát cho lợi nhuận, dòng tiền)");
      } else if (door === "Khai Môn" || door === "Hưu Môn") {
        score += 30;
        reasons.push(`Đắc ${door} (Cát lợi công danh)`);
      }

      if (["Trực Phù", "Lục Hợp", "Cửu Thiên"].includes(deity)) {
        score += 25;
        reasons.push(`Đắc Cát Thần (${deity})`);
      }

      if (["Ất", "Bính", "Đinh"].some(stem => hStem && hStem.includes(stem))) {
        score += 20;
        reasons.push(`Đắc Tam Kỳ (${hStem})`);
      }

      if (pid === 1 || pid === 7) { // Phương vị Linh Thần vượng Thủy của Vận 9
        score += 15;
        reasons.push("Phương vị vượng Thủy Vận 9");
      }

      if (score >= 45) {
        candidates.push({
          palace_id: pid,
          palace_name: `Cung ${pid} (${p.name || ''})`,
          door: door,
          star: star,
          deity: deity,
          heaven_stem: hStem,
          activation_score: score,
          positive_factors: reasons
        });
      }
    }

    candidates.sort((a, b) => b.activation_score - a.activation_score);
    const bestCandidate = candidates[0] || null;

    let activationProtocol = null;
    if (bestCandidate) {
      activationProtocol = {
        target_palace: bestCandidate.palace_name,
        water_feature_type: "Thác nước phong thủy luân lưu động hoặc Hồ cá thủy sinh (30 - 80 lít nước)",
        activation_timing: "Nên kích hoạt trong giờ có Sinh Môn hoặc giờ Thìn / Thân / Tý để Thủy khí phát quang",
        expected_outcome: "Kích hoạt dòng tiền kinh doanh và cơ hội ký kết hợp đồng trong vòng 14 đến 49 ngày."
      };
    }

    return {
      status: "SUCCESS",
      best_water_location: bestCandidate,
      all_eligible_palaces: candidates,
      activation_protocol: activationProtocol
    };
  }

  // ==============================================================================
  // 5. ĐỘNG CƠ ĐÁNH GIÁ DƯƠNG TRẠCH PHONG THỦY TOÀN DIỆN
  // ==============================================================================

  /**
   * Đánh giá chi tiết 6 không gian nội khí & quét 13 vi phạm nghiêm trọng
   */
  function evaluateYangHouse(houseDegree, chartPalaces = {}, roomAllocations = {}, ownerBirthCan = "Bính", kongWangPalaces = []) {
    const facingMountain = degreeToMountain(houseDegree);
    const facingPalaceId = facingMountain.palace_id;

    const sittingDegree = (Number(houseDegree) + 180.0) % 360.0;
    const sittingMountain = degreeToMountain(sittingDegree);
    const sittingPalaceId = sittingMountain.palace_id;

    const kwPalaces = Array.isArray(kongWangPalaces) ? kongWangPalaces : [];
    const criticalViolations = [];
    const roomReports = {};
    let totalScore = 0;
    let roomCount = 0;

    const rooms = Object.keys(roomAllocations).length > 0 ? roomAllocations : {
      main_door: facingPalaceId,
      kitchen: 6,
      master_bed: 2,
      altar: 8,
      toilet: 1,
      living_room: 3
    };

    for (const [roomType, rawPId] of Object.entries(rooms)) {
      const palaceId = Number(rawPId);
      const palaceInfo = chartPalaces[palaceId] || {};
      const doorName = palaceInfo.door || "-";
      const starName = palaceInfo.star || "-";
      const deityName = palaceInfo.deity || palaceInfo.divinity || "-";
      const hStem = Array.isArray(palaceInfo.heaven_stem) ? palaceInfo.heaven_stem.join('/') : (palaceInfo.heaven_stem || palaceInfo.hcs || "-");
      const eStem = Array.isArray(palaceInfo.earth_stem) ? palaceInfo.earth_stem.join('/') : (palaceInfo.earth_stem || palaceInfo.ecs || "-");
      const isKw = kwPalaces.includes(palaceId) || !!palaceInfo.is_kong_wang || !!palaceInfo.de;

      const dEval = DOOR_EVALUATIONS[doorName] || { type: "BÌNH", score: 50, desc: "" };
      const sEval = STAR_EVALUATIONS[starName] || { type: "BÌNH", score: 50, desc: "" };
      let currentRoomScore = Math.round((dEval.score * 0.6) + (sEval.score * 0.4));

      const roomDetectedViolations = [];

      // 1. Bếp tại Càn 6 (Hỏa Thiêu Thiên Môn)
      if (roomType === "kitchen" && palaceId === 6) {
        roomDetectedViolations.push(CRITICAL_VIOLATIONS_DB[0]);
        currentRoomScore -= 40;
      }
      // 2. Bếp tại Đoài 7 (Hỏa Thiêu Thiếu Nữ)
      if (roomType === "kitchen" && palaceId === 7) {
        roomDetectedViolations.push(CRITICAL_VIOLATIONS_DB[1]);
        currentRoomScore -= 25;
      }
      // 3. Nhà vệ sinh tại Trung Cung 5 (Uế Khí Trung Cung)
      if (roomType === "toilet" && palaceId === 5) {
        roomDetectedViolations.push(CRITICAL_VIOLATIONS_DB[2]);
        currentRoomScore -= 45;
      }
      // 4. Nhà vệ sinh ngộ Sinh Môn
      if (roomType === "toilet" && doorName === "Sinh Môn") {
        roomDetectedViolations.push(CRITICAL_VIOLATIONS_DB[3]);
        currentRoomScore -= 30;
      }
      // 5. Nhà vệ sinh ngộ Trực Phù
      if (roomType === "toilet" && deityName === "Trực Phù") {
        roomDetectedViolations.push(CRITICAL_VIOLATIONS_DB[4]);
        currentRoomScore -= 30;
      }
      // 6. Cửa chính ngộ Tử Môn
      if (roomType === "main_door" && doorName === "Tử Môn") {
        roomDetectedViolations.push(CRITICAL_VIOLATIONS_DB[5]);
        currentRoomScore -= 35;
      }
      // 7. Cửa chính ngộ Không Vong
      if (roomType === "main_door" && isKw) {
        roomDetectedViolations.push(CRITICAL_VIOLATIONS_DB[6]);
        currentRoomScore -= 35;
      }
      // 8. Giường ngủ ngộ Thiên Nhuế
      if ((roomType === "master_bed" || roomType === "bedroom") && starName === "Thiên Nhuế") {
        roomDetectedViolations.push(CRITICAL_VIOLATIONS_DB[7]);
        currentRoomScore -= 25;
      }
      // 9. Giường ngủ ngộ Bạch Hổ
      if ((roomType === "master_bed" || roomType === "bedroom") && deityName === "Bạch Hổ") {
        roomDetectedViolations.push(CRITICAL_VIOLATIONS_DB[8]);
        currentRoomScore -= 25;
      }
      // 10. Giường ngủ ngộ Đằng Xà
      if ((roomType === "master_bed" || roomType === "bedroom") && deityName === "Đằng Xà") {
        roomDetectedViolations.push(CRITICAL_VIOLATIONS_DB[9]);
        currentRoomScore -= 20;
      }
      // 11. Ban thờ tựa Toilet (cùng cung)
      if (roomType === "altar" && rooms.toilet === palaceId) {
        roomDetectedViolations.push(CRITICAL_VIOLATIONS_DB[10]);
        currentRoomScore -= 40;
      }
      // 12. Môn Bách Khai Môn (tại Chấn 3, Tốn 4)
      if (doorName === "Khai Môn" && [3, 4].includes(palaceId)) {
        roomDetectedViolations.push(CRITICAL_VIOLATIONS_DB[11]);
        currentRoomScore -= 20;
      }
      // 13. Môn Bách Thương Môn (tại Khôn 2, Cấn 8)
      if (doorName === "Thương Môn" && [2, 8].includes(palaceId)) {
        roomDetectedViolations.push(CRITICAL_VIOLATIONS_DB[12]);
        currentRoomScore -= 25;
      }

      for (const v of roomDetectedViolations) {
        criticalViolations.push({
          room: roomType,
          palace_id: palaceId,
          violation_code: v.code,
          name: v.name,
          severity: v.severity,
          impact: v.impact,
          remediation: v.remediation
        });
      }

      currentRoomScore = Math.max(5, Math.min(100, currentRoomScore));
      totalScore += currentRoomScore;
      roomCount++;

      roomReports[roomType] = {
        palace_id: palaceId,
        door: doorName,
        star: starName,
        deity: deityName,
        heaven_stem: hStem,
        earth_stem: eStem,
        is_kong_wang: isKw,
        score: currentRoomScore,
        quality: currentRoomScore >= 70 ? "CÁT TƯỜNG" : (currentRoomScore >= 50 ? "BÌNH HÒA" : "HUNG SÁT"),
        violations: roomDetectedViolations.map(v => v.name)
      };
    }

    const overallHouseScore = Math.round(totalScore / Math.max(1, roomCount));
    const overallStatus = (
      overallHouseScore >= 80 ? "ĐẠI CÁT" :
      (overallHouseScore >= 65 ? "CÁT" :
      (overallHouseScore >= 45 ? "TRUNG BÌNH" : "HUNG TRẠCH CẦN CẢI TẠO"))
    );

    return {
      status: "SUCCESS",
      house_metrics: {
        house_degree: Number(Number(houseDegree).toFixed(1)),
        facing_mountain: `${facingMountain.name} Sơn (${facingMountain.degree_center.toFixed(1)}°)`,
        facing_palace: `Cung ${facingPalaceId} (${facingMountain.palace_name} - ${facingMountain.direction})`,
        sitting_mountain: `${sittingMountain.name} Sơn (${sittingMountain.degree_center.toFixed(1)}°)`,
        sitting_palace: `Cung ${sittingPalaceId} (${sittingMountain.palace_name} - ${sittingMountain.direction})`,
        overall_vitality_score: overallHouseScore,
        verdict: overallStatus
      },
      critical_violations: criticalViolations,
      room_detailed_audit: roomReports
    };
  }

  // ==============================================================================
  // 6. ĐỘNG CƠ ĐÁNH GIÁ ÂM TRẠCH PHONG THỦY TOÀN DIỆN
  // ==============================================================================

  /**
   * Đánh giá tương quan Ngũ Hành giữa Mộ Phần và Vong Linh / Con Cháu
   */
  function evaluateWuxingRelation(sourceElement, targetElement) {
    const s = sourceElement;
    const t = targetElement;
    if (s === t) return "TỶ HÒA (Đồng khí tương cầu - Bình an)";

    const gen = { "Mộc": "Hỏa", "Hỏa": "Thổ", "Thổ": "Kim", "Kim": "Thủy", "Thủy": "Mộc" };
    if (gen[s] === t) return "SINH XUẤT (Mộ sinh người - Đại Cát phát phúc dồi dào)";
    if (gen[t] === s) return "SINH NHẬP (Người sinh Mộ - Yên ổn, cần chăm lo hương khói)";

    const clash = { "Mộc": "Thổ", "Thổ": "Thủy", "Thủy": "Hỏa", "Hỏa": "Kim", "Kim": "Mộc" };
    if (clash[s] === t) return "KHẮC XUẤT (Mộ khắc người - Đại Hung tổn hại nhân đinh)";
    if (clash[t] === s) return "KHẮC NHẬP (Người khắc Mộ - Bất an, mộ phần bị động)";

    return "BÌNH HÒA";
  }

  /**
   * Đánh giá toàn diện phong thủy Âm trạch (8 bệnh mồ mả, Niên Mệnh, Phát Phúc 6 Chi)
   */
  function evaluateYinHouse(chartPalaces = {}, deceasedBirthCan = "Ất", gravePalaceId = null, kongWangPalaces = []) {
    const kwPalaces = Array.isArray(kongWangPalaces) ? kongWangPalaces : [];

    // Tìm Cung Tử Môn nếu không chỉ định gravePalaceId
    let targetPalaceId = Number(gravePalaceId) || 0;
    if (!targetPalaceId) {
      for (const [pid, pdata] of Object.entries(chartPalaces)) {
        if (pdata.door === "Tử Môn") {
          targetPalaceId = Number(pid);
          break;
        }
      }
    }
    if (!targetPalaceId) targetPalaceId = 2; // Default Khôn 2

    const gravePalace = chartPalaces[targetPalaceId] || {};
    const graveStar = gravePalace.star || "-";
    const graveDeity = gravePalace.deity || gravePalace.divinity || "-";
    const graveHStem = Array.isArray(gravePalace.heaven_stem) ? gravePalace.heaven_stem.join('/') : (gravePalace.heaven_stem || gravePalace.hcs || "-");
    const graveEStem = Array.isArray(gravePalace.earth_stem) ? gravePalace.earth_stem.join('/') : (gravePalace.earth_stem || gravePalace.ecs || "-");
    const graveWuxing = PALACE_WUXING[targetPalaceId] || "Thổ";
    const isKw = kwPalaces.includes(targetPalaceId) || !!gravePalace.is_kong_wang || !!gravePalace.de;

    const detectedAnomalies = [];

    // 1. Mộ ngập nước
    if (graveStar === "Thiên Bồng" || graveDeity === "Huyền Vũ" || ["Nhâm", "Quý"].some(c => graveHStem.includes(c))) {
      detectedAnomalies.push(GRAVE_ANOMALIES_DB[0]);
    }
    // 2. Rễ cây đâm xuyên
    if ((graveDeity === "Lục Hợp" || graveHStem.includes("Ất")) && [3, 4].includes(targetPalaceId)) {
      detectedAnomalies.push(GRAVE_ANOMALIES_DB[1]);
    }
    // 3. Côn trùng kiến mối
    if (graveDeity === "Đằng Xà" || ["Đinh", "Kỷ"].some(c => graveHStem.includes(c))) {
      detectedAnomalies.push(GRAVE_ANOMALIES_DB[2]);
    }
    // 4. Tảng đá chấn ép
    if ((graveStar === "Thiên Trụ" || graveDeity === "Bạch Hổ") && ["Canh", "Tân"].some(c => graveHStem.includes(c))) {
      detectedAnomalies.push(GRAVE_ANOMALIES_DB[3]);
    }
    // 5. Gió bấc lùa hậu chẩm
    if (graveStar === "Thiên Xung" && targetPalaceId === 1) {
      detectedAnomalies.push(GRAVE_ANOMALIES_DB[4]);
    }
    // 6. Hư huyệt tuyệt khí (Không Vong)
    if (isKw) {
      detectedAnomalies.push(GRAVE_ANOMALIES_DB[5]);
    }
    // 7. Âm tà quấy nhiễu
    if (graveDeity === "Đằng Xà" && graveStar === "Thiên Nhuế" && [2, 8].includes(targetPalaceId)) {
      detectedAnomalies.push(GRAVE_ANOMALIES_DB[6]);
    }
    // 8. Cát tướng: Huyệt kết chân long
    if (["Cửu Địa", "Trực Phù"].includes(graveDeity) && ["Ất", "Bính", "Đinh"].some(c => graveHStem.includes(c))) {
      detectedAnomalies.push(GRAVE_ANOMALIES_DB[7]);
    }

    // Thẩm định Niên Mệnh Vong Linh
    const deceasedWuxing = CAN_WUXING[deceasedBirthCan] || "Mộc";
    const vongLinhRelation = evaluateWuxingRelation(graveWuxing, deceasedWuxing);
    const spiritualPeace = (vongLinhRelation.includes("SINH") || vongLinhRelation.includes("TỶ HÒA"))
      ? "YÊN ỔN SIÊU THOÁT"
      : "BẤT AN CẦN CHỈNH TRANG";

    // Thẩm định 6 Chi Con Cháu
    const descendantsReport = {};
    for (const [pidStr, binfo] of Object.entries(DESCENDANT_BRANCHES_MAPPING)) {
      const branchWuxing = binfo.wuxing;
      const rel = evaluateWuxingRelation(graveWuxing, branchWuxing);
      const isBenefited = rel.includes("SINH XUẤT") || rel.includes("TỶ HÒA");
      descendantsReport[binfo.branch_name] = {
        palace: binfo.palace_name,
        wuxing: branchWuxing,
        relation_with_grave: rel,
        status: isBenefited ? "PHÁT PHÚC TÀI QUAN" : (rel.includes("KHẮC XUẤT") ? "BẤT LỢI CẦN HÓA GIẢI" : "BÌNH HÒA")
      };
    }

    return {
      status: "SUCCESS",
      grave_metrics: {
        grave_palace_id: targetPalaceId,
        grave_palace_name: `Cung ${targetPalaceId} (${graveWuxing})`,
        grave_door: "Tử Môn (Huyệt Mộ)",
        grave_star: graveStar,
        grave_deity: graveDeity,
        grave_heaven_stem: graveHStem,
        grave_earth_stem: graveEStem,
        is_kong_wang: isKw
      },
      vong_linh_evaluation: {
        deceased_can: deceasedBirthCan,
        deceased_wuxing: deceasedWuxing,
        relation: vongLinhRelation,
        spiritual_peace: spiritualPeace
      },
      detected_anomalies: detectedAnomalies,
      descendants_impact_audit: descendantsReport
    };
  }

  // ==============================================================================
  // 7. TRẠCH CÁT KỲ MÔN (AUSPICIOUS TIMING SELECTOR)
  // ==============================================================================

  /**
   * Đánh giá Trạch Cát 12 Thời Thần trong ngày cho Phong Thủy
   */
  function evaluateFengShuiTiming(actionType = 'dong_tho') {
    const BRANCHES = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
    const results = [];

    // Tiêu chí Trạch Cát theo Loại việc
    const actionNames = {
      'dong_tho': 'Động Thổ Khởi Công',
      'cat_noc': 'Cất Nóc Đổ Mái',
      'nhap_trach': 'Nhập Trạch Dọn Nhà',
      'ha_huyet': 'Hạ Huyệt An Táng',
      'cai_tang': 'Cải Táng Bốc Mộ',
      'thuy_phap': 'Mở Nước Kích Hoạt Tài Lộc',
      'khai_truong': 'Khai Trương Cửa Hàng'
    };

    const actionTitle = actionNames[actionType] || 'Trạch Cát Kỳ Môn';

    BRANCHES.forEach((chi, idx) => {
      let score = 60;
      const reasons = [];

      // Giờ Thìn / Thân / Tý vượng Thủy (tốt cho Thủy Pháp)
      if (['Thân', 'Tý', 'Thìn'].includes(chi)) {
        if (actionType === 'thuy_phap') {
          score += 35;
          reasons.push("Tam hợp Thủy cục (Thân - Tý - Thìn), kích hoạt tài lộc tức thì");
        } else {
          score += 10;
          reasons.push("Đắc thời hòa hợp");
        }
      }

      // Giờ Mão / Dần vượng Mộc (tốt cho Khởi công / Động thổ)
      if (['Dần', 'Mão'].includes(chi)) {
        if (actionType === 'dong_tho' || actionType === 'cat_noc') {
          score += 30;
          reasons.push("Mộc khí xuân sinh, trợ lực sinh trưởng công trình vững chắc");
        }
      }

      // Giờ Tỵ / Ngọ vượng Hỏa (tốt cho Nhập trạch)
      if (['Tỵ', 'Ngọ'].includes(chi)) {
        if (actionType === 'nhap_trach') {
          score += 30;
          reasons.push("Dương hỏa quang minh, gia đạo ấm cúng tài lộc khởi sắc");
        }
      }

      // Giờ Sửu / Mùi thuộc Thổ tĩnh (tốt cho Hạ huyệt, Cải táng)
      if (['Sửu', 'Mùi', 'Tuất'].includes(chi)) {
        if (actionType === 'ha_huyet' || actionType === 'cai_tang') {
          score += 30;
          reasons.push("Thổ khí thuần hậu, an ổn chân linh bền vững thiên thu");
        }
      }

      // Tránh giờ xung sát
      if (chi === 'Ngọ' && actionType === 'dong_tho') {
        score -= 20;
        reasons.push("Chính Ngọ thiên đỉnh, dương cực sinh âm, tránh động thổ xới đất");
      }

      score = Math.max(10, Math.min(100, score));
      const quality = score >= 80 ? "ĐẠI CÁT" : (score >= 65 ? "CÁT" : (score >= 50 ? "BÌNH HÒA" : "HUNG"));

      results.push({
        branch: chi,
        hour_range: `${(idx * 2 + 23) % 24}h - ${(idx * 2 + 1) % 24}h`,
        score: score,
        quality: quality,
        reasons: reasons
      });
    });

    results.sort((a, b) => b.score - a.score);

    return {
      action_type: actionType,
      action_title: actionTitle,
      best_hours: results.filter(r => r.score >= 70),
      all_hours: results
    };
  }

  // ==============================================================================
  // 7.5. ĐỒNG BỘ BẢN MỆNH GIA CHỦ & TRẠCH KHÍ (DESTINY & HOUSE HARMONY)
  // ==============================================================================

  const CUNG_PHI_INFO = {
    1: { cung: "Khảm", nhom: "Đông Tứ Mệnh", hanh: "Thủy", bagua_id: 1 },
    2: { cung: "Khôn", nhom: "Tây Tứ Mệnh", hanh: "Thổ", bagua_id: 2 },
    3: { cung: "Chấn", nhom: "Đông Tứ Mệnh", hanh: "Mộc", bagua_id: 3 },
    4: { cung: "Tốn", nhom: "Đông Tứ Mệnh", hanh: "Mộc", bagua_id: 4 },
    6: { cung: "Càn", nhom: "Tây Tứ Mệnh", hanh: "Kim", bagua_id: 6 },
    7: { cung: "Đoài", nhom: "Tây Tứ Mệnh", hanh: "Kim", bagua_id: 7 },
    8: { cung: "Cấn", nhom: "Tây Tứ Mệnh", hanh: "Thổ", bagua_id: 8 },
    9: { cung: "Ly", nhom: "Đông Tứ Mệnh", hanh: "Hỏa", bagua_id: 9 }
  };

  const BAT_TRACH_DU_NIEN = {
    "Khảm": { "Khảm": "Phục Vị", "Chấn": "Thiên Y", "Tốn": "Sinh Khí", "Ly": "Diên Niên", "Khôn": "Tuyệt Mệnh", "Đoài": "Họa Hại", "Càn": "Lục Sát", "Cấn": "Ngũ Quỷ" },
    "Khôn": { "Khôn": "Phục Vị", "Cấn": "Sinh Khí", "Càn": "Diên Niên", "Đoài": "Thiên Y", "Khảm": "Tuyệt Mệnh", "Chấn": "Họa Hại", "Tốn": "Ngũ Quỷ", "Ly": "Lục Sát" },
    "Chấn": { "Chấn": "Phục Vị", "Khảm": "Thiên Y", "Ly": "Sinh Khí", "Tốn": "Diên Niên", "Đoài": "Tuyệt Mệnh", "Càn": "Ngũ Quỷ", "Khôn": "Họa Hại", "Cấn": "Lục Sát" },
    "Tốn":  { "Tốn": "Phục Vị", "Khảm": "Sinh Khí", "Chấn": "Diên Niên", "Ly": "Thiên Y", "Cấn": "Tuyệt Mệnh", "Khôn": "Ngũ Quỷ", "Càn": "Họa Hại", "Đoài": "Lục Sát" },
    "Càn":  { "Càn": "Phục Vị", "Đoài": "Sinh Khí", "Cấn": "Thiên Y", "Khôn": "Diên Niên", "Ly": "Tuyệt Mệnh", "Chấn": "Ngũ Quỷ", "Tốn": "Họa Hại", "Khảm": "Lục Sát" },
    "Đoài": { "Đoài": "Phục Vị", "Càn": "Sinh Khí", "Khôn": "Thiên Y", "Cấn": "Diên Niên", "Chấn": "Tuyệt Mệnh", "Ly": "Ngũ Quỷ", "Khảm": "Họa Hại", "Tốn": "Lục Sát" },
    "Cấn":  { "Cấn": "Phục Vị", "Khôn": "Sinh Khí", "Đoài": "Diên Niên", "Càn": "Thiên Y", "Tốn": "Tuyệt Mệnh", "Khảm": "Ngũ Quỷ", "Ly": "Họa Hại", "Chấn": "Lục Sát" },
    "Ly":   { "Ly": "Phục Vị", "Chấn": "Sinh Khí", "Tốn": "Thiên Y", "Khảm": "Diên Niên", "Càn": "Tuyệt Mệnh", "Đoài": "Ngũ Quỷ", "Cấn": "Họa Hại", "Khôn": "Lục Sát" }
  };

  /**
   * Tính Cung Phi Bát Trạch & Tương Phối Bản Mệnh Kỳ Môn với Trạch Khí
   */
  function evaluateDestinyHouseHarmony(birthYear = 1990, isMale = true, querentStem = "Canh", houseDegree = 182.0, chartPalaces = {}) {
    let year = parseInt(birthYear, 10);
    if (isNaN(year) || year < 1900 || year > 2100) year = 1990;

    // 1. Tính Cung Phi Bát Trạch
    const yearStr = String(year);
    let sumDigits = 0;
    for (let i = 0; i < yearStr.length; i++) sumDigits += parseInt(yearStr[i], 10);
    let rem = sumDigits % 9;
    if (rem === 0) rem = 9;

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

    const kuaProfile = CUNG_PHI_INFO[val] || CUNG_PHI_INFO[1];
    const cungMenh = kuaProfile.cung;
    const nhomMenh = kuaProfile.nhom;
    const hanhMenh = kuaProfile.hanh;

    // Hướng nhà
    const facingMountain = degreeToMountain(houseDegree);
    const facingPalaceName = facingMountain.palace_name;
    let fb = facingPalaceName;
    if (fb === "Kiền") fb = "Càn";
    if (!BAT_TRACH_DU_NIEN[cungMenh]) fb = "Ly";

    const duNien = BAT_TRACH_DU_NIEN[cungMenh][fb] || "Phục Vị";
    const duNienScores = {
      "Sinh Khí": 95, "Diên Niên": 90, "Thiên Y": 88, "Phục Vị": 80,
      "Họa Hại": 55, "Lục Sát": 45, "Ngũ Quỷ": 35, "Tuyệt Mệnh": 25
    };
    const batTrachScore = duNienScores[duNien] || 60;

    // 2. Tìm Cung Bản Mệnh Kỳ Môn (Cung có Thiên Can Năm Sinh trên Thiên Bàn)
    let qmdjDestinyPalaceId = null;
    let qmdjDestinyPalaceData = null;
    for (const [pidStr, pdata] of Object.entries(chartPalaces)) {
      const pid = Number(pidStr);
      const hStem = Array.isArray(pdata.heaven_stem) ? pdata.heaven_stem.join('') : (pdata.heaven_stem || pdata.hcs || '');
      if (hStem && hStem.includes(querentStem)) {
        qmdjDestinyPalaceId = pid;
        qmdjDestinyPalaceData = pdata;
        break;
      }
    }

    if (!qmdjDestinyPalaceId) {
      // Fallback lấy theo Kua Palace
      qmdjDestinyPalaceId = kuaProfile.bagua_id;
      qmdjDestinyPalaceData = chartPalaces[qmdjDestinyPalaceId] || {};
    }

    const destinyPalaceWuxing = PALACE_WUXING[qmdjDestinyPalaceId] || "Thổ";
    const facingPalaceWuxing = PALACE_WUXING[facingMountain.palace_id] || "Hỏa";

    // Tương quan Ngũ Hành giữa Cung Hướng Nhà và Cung Bản Mệnh
    const wuxingRel = evaluateWuxingRelation(facingPalaceWuxing, destinyPalaceWuxing);

    // Cát Môn, Tinh, Thần tại Cung Bản Mệnh Kỳ Môn
    const dDoor = qmdjDestinyPalaceData.door || "-";
    const dStar = qmdjDestinyPalaceData.star || "-";
    const dDeity = qmdjDestinyPalaceData.deity || qmdjDestinyPalaceData.divinity || "-";

    let qmdjScore = 70;
    if (["Sinh Môn", "Khai Môn", "Hưu Môn"].includes(dDoor)) qmdjScore += 15;
    else if (["Tử Môn", "Kinh Môn", "Thương Môn"].includes(dDoor)) qmdjScore -= 15;

    if (["Trực Phù", "Cửu Thiên", "Lục Hợp", "Thái Âm"].includes(dDeity)) qmdjScore += 10;
    else if (["Bạch Hổ", "Đằng Xà", "Thiên Bồng"].includes(dDeity)) qmdjScore -= 10;

    qmdjScore = Math.max(20, Math.min(100, qmdjScore));

    const totalHarmonyScore = Math.round((batTrachScore * 0.6) + (qmdjScore * 0.4));
    const harmonyVerdict = totalHarmonyScore >= 80 ? "ĐẠI CÁT ĐỒNG PHA" : (totalHarmonyScore >= 65 ? "CÁT TƯỜNG HÒA HỢP" : (totalHarmonyScore >= 50 ? "BÌNH HÒA CẦN HÓA GIẢI" : "NGHỊCH KHÍ CẦN ĐIỀU CHỈNH"));

    return {
      birth_year: year,
      gender: isMale ? "Nam" : "Nữ",
      querent_stem: querentStem,
      kua_profile: {
        cung: cungMenh,
        nhom: nhomMenh,
        hanh: hanhMenh,
        du_nien: duNien,
        score: batTrachScore
      },
      qmdj_destiny: {
        palace_id: qmdjDestinyPalaceId,
        palace_name: `Cung ${qmdjDestinyPalaceId} (${destinyPalaceWuxing})`,
        door: dDoor,
        star: dStar,
        deity: dDeity,
        score: qmdjScore
      },
      house_facing: {
        degree: houseDegree,
        mountain: facingMountain.name,
        palace: facingPalaceName,
        wuxing: facingPalaceWuxing
      },
      wuxing_interaction: wuxingRel,
      overall_harmony_score: totalHarmonyScore,
      verdict: harmonyVerdict,
      strategic_advice: totalHarmonyScore >= 75
        ? `Gia chủ mệnh ${cungMenh} (${nhomMenh}) đắc ${duNien} tại hướng ${fb}. Cung Bản Mệnh Kỳ Môn (${dDoor} • ${dDeity}) bảo trợ vững chắc, đại lợi cho phát triển sự nghiệp và gia đạo an khang.`
        : `Gia chủ mệnh ${cungMenh} gặp du niên ${duNien} hướng ${fb}. Cần tối ưu hóa Bếp nấu tại phương vị cát của bản mệnh và kê Bàn làm việc/Giường ngủ tại Cung có ${dDoor === 'Sinh Môn' ? 'Khai Môn' : 'Sinh Môn'} để bổ trợ sinh khí.`
    };
  }

  // ==============================================================================
  // 7.6. ĐỘNG CƠ PHÂN TÍCH TIỂU THÁI CỰC (MICRO-COSMOS ROOM ANALYZER)
  // ==============================================================================

  /**
   * Phân tích Tiểu Thái Cực cho phòng riêng (Phòng Làm Việc, Phòng Ngủ, Phòng Học)
   */
  function evaluateMicroCosmosRoom(params = {}) {
    const roomType = params.room_type || 'office'; // 'office' | 'bedroom' | 'study'
    const deskPalace = Number(params.desk_palace || 3); // Cung đặt bàn
    const sittingPalace = Number(params.sitting_palace || 8); // Cung tựa lưng
    const facingPalace = Number(params.facing_palace || 9); // Cung nhìn ra
    const chartPalaces = params.chart_palaces || {};
    const kongWangPalaces = Array.isArray(params.kong_wang_palaces) ? params.kong_wang_palaces : [];

    const deskInfo = chartPalaces[deskPalace] || {};
    const sittingInfo = chartPalaces[sittingPalace] || {};
    const facingInfo = chartPalaces[facingPalace] || {};

    const deskDoor = deskInfo.door || "-";
    const deskStar = deskInfo.star || "-";
    const deskDeity = deskInfo.deity || deskInfo.divinity || "-";
    const isDeskWang = kongWangPalaces.includes(deskPalace) || !!deskInfo.is_kong_wang;

    const sittingDeity = sittingInfo.deity || sittingInfo.divinity || "-";
    const sittingStar = sittingInfo.star || "-";
    const isSittingWang = kongWangPalaces.includes(sittingPalace);

    let score = 70;
    const advantages = [];
    const warnings = [];
    const remedies = [];

    if (roomType === 'office') {
      // 1. Đánh giá vị trí Bàn làm việc
      if (deskDoor === "Khai Môn") {
        score += 25;
        advantages.push("Bàn làm việc đắc Khai Môn: Công danh hanh thông, đối tác mở rộng, quyết sách sáng suốt.");
      } else if (deskDoor === "Sinh Môn") {
        score += 25;
        advantages.push("Bàn làm việc đắc Sinh Môn: Dòng tiền kinh doanh dồi dào, sinh sôi lợi nhuận.");
      } else if (deskDoor === "Hưu Môn") {
        score += 15;
        advantages.push("Bàn làm việc đắc Hưu Môn: Tinh thần minh mẫn thư thái, có quý nhân phò trợ.");
      } else if (deskDoor === "Tử Môn") {
        score -= 30;
        warnings.push("Bàn làm việc ngộ Tử Môn: Khí trường trì trệ, ý tưởng bế tắc, năng suất sụt giảm.");
        remedies.push("Di chuyển bàn làm việc sang Cung có Khai Môn hoặc Sinh Môn; bố trí thêm đèn bàn ánh sáng vàng 3000K để kích dương khí.");
      } else if (deskDoor === "Thương Môn" || deskDoor === "Kinh Môn") {
        score -= 20;
        warnings.push(`Bàn làm việc ngộ ${deskDoor}: Dễ phát sinh tranh chấp hợp đồng, áp lực căng thẳng.`);
        remedies.push("Đặt quả cầu thạch anh hồng hoặc tháp văn xương thủy tinh để giảm bớt sát khí khẩu thiệt.");
      }

      // 2. Đánh giá Tọa vị Tựa lưng
      if (["Trực Phù", "Cửu Thiên", "Cửu Địa"].includes(sittingDeity)) {
        score += 20;
        advantages.push(`Tựa lưng Cát Thần (${sittingDeity}): Vị thế kiên cố, quyền lực lãnh đạo vững vàng, cấp dưới phục tùng.`);
      } else if (isSittingWang) {
        score -= 20;
        warnings.push("Tựa lưng Cung Không Vong: Thiếu điểm tựa, dự án dễ bị hụt hẫng giữa chừng.");
        remedies.push("Gia cố tường phía sau bằng kệ sách gỗ lớn hoặc treo tranh núi Thái Sơn kiên cố.");
      }

      // 3. Sao quản chiếu
      if (["Thiên Tâm", "Thiên Phụ", "Thiên Nhậm"].includes(deskStar)) {
        score += 15;
        advantages.push(`Đắc Cát Tinh (${deskStar}): Đầu óc mưu lược, tài chính bền vững.`);
      } else if (deskStar === "Thiên Nhuế") {
        score -= 20;
        warnings.push("Bàn làm việc gặp sao Thiên Nhuế: Làm việc nhanh mệt mỏi, dễ mắc bệnh cột sống/mắt.");
        remedies.push("Đặt hồ lô đồng nhỏ trên bàn làm việc để hóa giải bệnh phù khí.");
      }

    } else if (roomType === 'study') {
      // Phòng Học / Thư Phòng
      if (deskStar === "Thiên Phụ" || deskDoor === "Cảnh Môn") {
        score += 30;
        advantages.push("Bàn học đắc Thiên Phụ / Cảnh Môn (Văn Xương Tinh): Trí tuệ sáng láng, thi cử đỗ đạt, tiếp thu bài vở vượt bậc.");
      }
      if (deskDoor === "Khai Môn") {
        score += 20;
        advantages.push("Bàn học đắc Khai Môn: Tư duy logic rộng mở.");
      }
    } else {
      // Phòng Ngủ Master
      if (deskDoor === "Hưu Môn") {
        score += 30;
        advantages.push("Giường ngủ đắc Hưu Môn: Giấc ngủ sâu, tái tạo sinh lực nhanh chóng, gia đạo êm ấm.");
      } else if (deskDoor === "Tử Môn") {
        score -= 30;
        warnings.push("Giường ngủ ngộ Tử Môn: Hay mất ngủ, ác mộng, khí huyết suy nhược.");
        remedies.push("Dịch chuyển giường ngủ sang cung vị bình hòa hơn, trải thảm màu sáng.");
      }
      if (["Bạch Hổ", "Đằng Xà"].includes(deskDeity)) {
        score -= 25;
        warnings.push(`Giường ngủ gặp ${deskDeity}: Dễ bị bóng đè, bất hòa vợ chồng.`);
        remedies.push("Treo hồ lô đồng hoặc xông trầm hương thanh tẩy.");
      }
    }

    score = Math.max(10, Math.min(100, score));
    const quality = score >= 80 ? "ĐẠI CÁT ĐẮC THẾ" : (score >= 65 ? "CÁT LỢI THUẬN TIỆN" : (score >= 50 ? "TRUNG BÌNH" : "HUNG CẦN ĐIỀU CHỈNH"));

    return {
      status: "SUCCESS",
      room_type: roomType,
      desk_palace_id: deskPalace,
      desk_door: deskDoor,
      desk_star: deskStar,
      desk_deity: deskDeity,
      sitting_deity: sittingDeity,
      score: score,
      verdict: quality,
      advantages: advantages,
      warnings: warnings,
      remedies: remedies
    };
  }

  // ==============================================================================
  // 7.7. TRÌNH SINH LỊCH NHẮC HẸN MỞ NƯỚC THỦY PHÁP (.ICS)
  // ==============================================================================

  /**
   * Sinh nội dung tệp iCalendar (.ics chuẩn RFC 5545) để người dùng lưu vào Google/Apple Calendar
   */
  function generateWaterDragonIcsContent(bestWaterLocation, activationProtocol) {
    if (!bestWaterLocation) return null;

    const now = new Date();
    // Đặt lịch vào 09:00 ngày mai hoặc thời điểm gần nhất
    const eventStart = new Date(now.getTime() + 24 * 3600 * 1000);
    eventStart.setHours(9, 15, 0, 0);
    const eventEnd = new Date(eventStart.getTime() + 2 * 3600 * 1000);

    const pad = n => String(n).padStart(2, '0');
    const formatIcsDate = d => `${d.getUTCFullYear()}${pad(d.getUTCMonth()+1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

    const dtStart = formatIcsDate(eventStart);
    const dtEnd = formatIcsDate(eventEnd);
    const dtStamp = formatIcsDate(now);

    const pName = bestWaterLocation.palace_name || "Cung Cát Tường";
    const waterType = activationProtocol ? activationProtocol.water_feature_type : "Thác nước phong thủy luân / Hồ cá thủy sinh";
    const timing = activationProtocol ? activationProtocol.activation_timing : "Giờ Sinh Môn / Giờ Thìn, Thân, Tý";

    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Neta Light//Qi Men Water Dragon//VI",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:qmdj-water-${Date.now()}@netalight.app`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:💧 Kích Hoạt Thủy Pháp Kỳ Môn - ${pName}`,
      `DESCRIPTION:Kích hoạt thác nước/hồ cá tại ${pName} (${bestWaterLocation.door} • ${bestWaterLocation.deity}).\\nQuy cách: ${waterType}.\\nThời khắc: ${timing}.\\nMục tiêu: Kích hoạt dòng tiền tài lộc trong 14-49 ngày.`,
      `LOCATION:${pName}`,
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "TRIGGER:-PT15M",
      "ACTION:DISPLAY",
      "DESCRIPTION:Nhắc nhở chuẩn bị mở nước kích hoạt Thủy Pháp Kỳ Môn trong 15 phút tới!",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
  }

  // ==============================================================================
  // 8. BỘ ĐIỀU PHỐI TỔNG THỂ (MASTER AUDIT ORCHESTRATOR)
  // ==============================================================================

  /**
   * Chạy thẩm định phong thủy toàn diện (Dương Trạch + Âm Trạch + Tuyến Không Vong + Vận 9 + Thủy Pháp + Bản Mệnh)
   */
  function runComprehensiveFengShuiAudit(params = {}) {
    const mode = params.mode || 'both'; // 'yang', 'yin', 'both'
    const houseDegree = Number(params.house_degree !== undefined ? params.house_degree : 182.0);
    const roomAllocations = params.room_allocations || {};
    const ownerBirthCan = params.owner_birth_can || 'Bính';
    const ownerBirthYear = Number(params.owner_birth_year || 1990);
    const ownerIsMale = params.owner_is_male !== undefined ? !!params.owner_is_male : true;
    const deceasedBirthCan = params.deceased_birth_can || 'Ất';
    const gravePalaceId = params.grave_palace_id || null;
    const chartPalaces = params.chart_palaces || {};
    const kongWangPalaces = params.kong_wang_palaces || [];

    // 1. Quét Tuyến Không Vong
    const voidLineAudit = detectCompassVoidLines(houseDegree);

    // 2. Quét Vận 9 Tam Nguyên
    const period9Audit = evaluatePeriod9Synergy(houseDegree, chartPalaces, roomAllocations);

    // 3. Động cơ Thủy Pháp
    const waterActivationAudit = findOptimalWaterActivation(chartPalaces, roomAllocations);

    // 4. Thẩm định Dương Trạch
    let yangReport = null;
    if (mode === 'yang' || mode === 'both' || mode === 'duong_trach') {
      yangReport = evaluateYangHouse(houseDegree, chartPalaces, roomAllocations, ownerBirthCan, kongWangPalaces);
    }

    // 5. Thẩm định Âm Trạch
    let yinReport = null;
    if (mode === 'yin' || mode === 'both' || mode === 'am_trach') {
      yinReport = evaluateYinHouse(chartPalaces, deceasedBirthCan, gravePalaceId, kongWangPalaces);
    }

    // 6. Đồng Bộ Bản Mệnh Gia Chủ & Trạch Khí
    const destinyHarmony = evaluateDestinyHouseHarmony(ownerBirthYear, ownerIsMale, ownerBirthCan, houseDegree, chartPalaces);

    return {
      status: "SUCCESS",
      audit_mode: mode,
      compass_void_line_audit: voidLineAudit,
      period_9_san_yuan_audit: period9Audit,
      qi_men_water_activation: waterActivationAudit,
      yang_house_analysis: yangReport,
      yin_house_analysis: yinReport,
      destiny_house_harmony: destinyHarmony
    };
  }

  // ==============================================================================
  // 9. TRÌNH SINH BÀI LUẬN HỌC THUẬT (ACADEMIC ESSAY GENERATOR)
  // ==============================================================================

  /**
   * Sinh bài luận văn khoa học chuẩn Markdown 8 tầng (Dương Trạch) hoặc 9 tầng (Âm Trạch)
   * Tuân thủ kỷ luật hành chính - kỹ thuật, trung tính, không cảm tính (Rule 9 & Rule 12).
   */
  function generateQmdjFengShuiEssay(auditData, mode = 'duong_trach') {
    if (!auditData) return "Chưa có dữ liệu thẩm định phong thủy.";

    const vl = auditData.compass_void_line_audit || {};
    const p9 = auditData.period_9_san_yuan_audit || {};
    const wa = auditData.qi_men_water_activation || {};
    const yang = auditData.yang_house_analysis || {};
    const yin = auditData.yin_house_analysis || {};
    const dest = auditData.destiny_house_harmony || {};

    if (mode === 'am_trach' || mode === 'yin') {
      // BÀI LUẬN 9 TẦNG ÂM TRẠCH KỲ MÔN
      const gm = yin.grave_metrics || {};
      const ve = yin.vong_linh_evaluation || {};
      const anom = yin.detected_anomalies || [];
      const desc = yin.descendants_impact_audit || {};

      return `# BÁO CÁO THẨM ĐỊNH KHOA HỌC: KỲ MÔN ĐỘN GIÁP ÂM TRẠCH TOÀN THƯ
## CHẨN ĐOÁN THẤU SUỐT LÒNG ĐẤT, HUYỆT MỘ & PHÁT PHÚC DÒNG HỌ
**Mã hồ sơ:** \`QMDJ-AT-REPORT-2026\` | **Phân hệ:** Âm Trạch Gia Tộc | **Hệ chuẩn:** Ngự Định Kỳ Môn

---

### TẦNG 1: TỔNG QUAN TỌA ĐỘ VÀ CĂN NGUYÊN HUYỆT VỊ
- **Cung Vị Huyệt Mộ:** ${gm.grave_palace_name || 'Cung Tử Môn'}
- **Bát Môn lâm vị:** ${gm.grave_door || 'Tử Môn (Huyệt Mộ)'}
- **Cửu Tinh quản tọa:** ${gm.grave_star || '-'}
- **Bát Thần hộ vệ:** ${gm.grave_deity || '-'}
- **Thiên Bàn / Địa Bàn:** ${gm.grave_heaven_stem || '-'} / ${gm.grave_earth_stem || '-'}
- **Trạng thái Không Vong:** ${gm.is_kong_wang ? '⭕ PHẠM KHÔNG VONG (Khí hư suy)' : '✅ ĐẮC ĐỊA THUẦN KHÍ'}

---

### TẦNG 2: THẨM ĐỊNH NIÊN MỆNH VONG LINH VS NGŨ HÀNH CUNG MỘ
- **Can Năm Sinh Vong Linh:** ${ve.deceased_can || 'Ất'} (Hành ${ve.deceased_wuxing || 'Mộc'})
- **Tương Quan Sinh Khắc:** ${ve.relation || 'TỶ HÒA'}
- **Hiện Trạng Siêu Thoát:** **${ve.spiritual_peace || 'YÊN ỔN SIÊU THOÁT'}**
- **Đánh Giá Khoa Học:** Tương quan giữa ngũ hành bản cung của huyệt mộ và niên mệnh người mất xác lập tần số cộng hưởng năng lượng sinh học. Khi đắc tương sinh hoặc tỷ hòa, trường năng lượng của vong linh được bảo bọc, nuôi dưỡng chân khí yên ổn.

---

### TẦNG 3: CHẨN ĐOÁN 8 BỆNH MỒ MẢ THẤU SUỐT LÒNG ĐẤT
${anom.length === 0 ? `
- **Kết Quả Khảo Sát:** Không phát hiện dấu hiệu bất thường nghiêm trọng.
- **Trạng Thái Địa Tầng:** Huyệt mộ ổn định, đất ấm tụ khí, không bị nước ngầm xói lở hay rễ cây đâm xuyên.
` : anom.map((a, idx) => `
#### 3.${idx + 1}. ${a.name} [Mức độ: ${a.severity}]
- **Hiện Trạng Lòng Đất:** ${a.symptom}
- **Tác Động Dòng Họ:** ${a.descendant_impact}
- **Biện Pháp Xử Lý:** ${a.solution}
`).join('\n')}

---

### TẦNG 4: LƯỢNG HÓA TÁC ĐỘNG ĐẾN 6 CHI CON CHÁU
Bảng đối soát tác động phát phúc hoặc suy vi dựa trên tương quan ngũ hành cung vị 6 chi:

| Chi Thứ | Cung Vị | Ngũ Hành | Tương Quan Huyệt Mộ | Trạng Thái Phát Phúc |
| :--- | :---: | :---: | :--- | :--- |
${Object.entries(desc).map(([bName, bInfo]) => `| **${bName}** | ${bInfo.palace} | ${bInfo.wuxing} | ${bInfo.relation_with_grave.split('(')[0].trim()} | **${bInfo.status}** |`).join('\n')}

---

### TẦNG 5: QUY TRÌNH TRẠCH CÁT KỲ MÔN TÁNG PHÁP
- **Hạ Huyệt / Cải Táng:** Ưu tiên chọn giờ có Cát Thần (Trực Phù, Cửu Địa, Thái Âm) hội tụ Tam Kỳ (Ất, Bính, Đinh).
- **Tránh Hung Thần:** Tuyệt đối tránh giờ có Thương Môn bị bách hoặc giờ phạm Bạch Hổ xung sát huyệt vị.
- **Tiêu Chí An Vị:** Thổ khí phải thuần hậu, đón được long mạch dẫn khí từ hậu chẩm tới huyệt tiền.

---

### TẦNG 6: BẢO MẬT & KẾT LUẬN GIÁM ĐỊNH
1. Toàn bộ thông số mồ mả và niên mệnh đã được đối chiếu chặt chẽ theo nguyên bản Ngự Định Kỳ Môn Độn Giáp.
2. Gia đình cần thực hiện các biện pháp tu sửa hoặc chỉnh trang theo đúng lộ trình ngũ hành đã hướng dẫn.
`;
    }

    // BÀI LUẬN 8 TẦNG DƯƠNG TRẠCH KỲ MÔN
    const hm = yang.house_metrics || {};
    const viol = yang.critical_violations || [];
    const rooms = yang.room_detailed_audit || {};
    const bWater = wa.best_water_location || {};
    const aProt = wa.activation_protocol || {};

    return `# BÁO CÁO THẨM ĐỊNH KHOA HỌC: KỲ MÔN ĐỘN GIÁP DƯƠNG TRẠCH TOÀN THƯ
## KHẢO SÁT 24 SƠN HƯỚNG, NỘI KHÍ 6 PHÒNG & THỦY PHÁP KÍCH HOẠT TÀI LỘC
**Mã hồ sơ:** \`QMDJ-DT-REPORT-2026\` | **Hệ chuẩn:** Joey Yap Compendium & Bạch Hạc Minh La Kinh

---

### TẦNG 1: TỌA HƯỚNG LA KINH & ĐỊNH VỊ 24 SƠN HƯỚNG
- **Góc Phương Vị Đo Đạc:** ${hm.house_degree !== undefined ? hm.house_degree : '182.0'}°
- **Hướng Nhà (Facing):** ${hm.facing_mountain || 'Ngọ Sơn'} (${hm.facing_palace || 'Cung 9 Ly'})
- **Tọa Nhà (Sitting):** ${hm.sitting_mountain || 'Tý Sơn'} (${hm.sitting_palace || 'Cung 1 Khảm'})
- **Trạng Thái Tuyến Số:** **${vl.type || 'CHÍNH TUYẾN THUẦN KHÍ'}**
${vl.has_void_line ? `  - *Cảnh báo:* Độ lệch ${vl.deviation}° so với ranh giới ${vl.boundary_angle}°. ${vl.impact}
  - *Giải pháp:* ${vl.remediation}` : '  - *Kết luận:* Tọa hướng nạp thuần khí một Sơn, khí trường ổn định vững chãi, không phạm Không Vong phân liệt.'}

---

### TẦNG 2: TƯƠNG THÍCH HẠ NGUYÊN VẬN 9 (2024 - 2043)
- **Chu Kỳ Năng Lượng:** ${p9.current_period || 'VẬN 9 HẠ NGUYÊN (2024 - 2043)'}
- **Chính Thần (Ly 9 - Nam):** ${p9.zheng_shen_palace}
- **Linh Thần (Khảm 1 - Bắc):** ${p9.ling_shen_palace}
- **Điểm Thưởng / Phạt Vận 9:** ${p9.period_9_bonus_score >= 0 ? `+${p9.period_9_bonus_score}` : p9.period_9_bonus_score} điểm
- **Ghi Nhận Kỹ Thuật:**
${(p9.insights || []).map(ins => `  - ${ins}`).join('\n')}

---

### TẦNG 3: TƯƠNG PHỐI BẢN MỆNH GIA CHỦ & TRẠCH KHÍ
- **Gia Chủ:** Sinh năm ${dest.birth_year || 1990} (${dest.gender || 'Nam'}) - Can Năm ${dest.querent_stem || 'Canh'}
- **Cung Phi Bát Trạch:** Mệnh **${dest.kua_profile?.cung || 'Khảm'}** (${dest.kua_profile?.nhom || 'Đông Tứ Mệnh'} - Hành ${dest.kua_profile?.hanh || 'Thủy'})
- **Du Niên Hướng Nhà:** Đắc **${dest.kua_profile?.du_nien || 'Phục Vị'}** (${dest.kua_profile?.score || 80}/100 Điểm)
- **Cung Bản Mệnh Kỳ Môn:** ${dest.qmdj_destiny?.palace_name || 'Cung 3'} (${dest.qmdj_destiny?.door || 'Khai Môn'} • ${dest.qmdj_destiny?.deity || 'Trực Phù'})
- **Hòa Hợp Tổng Thể:** **${dest.overall_harmony_score || 80} / 100 Điểm (${dest.verdict || 'CÁT TƯỜNG'})**
- **Chiến Lược Hóa Giải / Bổ Trợ:** ${dest.strategic_advice || 'Khí trường nhà và bản mệnh gia chủ đạt mức độ tương dung tốt.'}

---

### TẦNG 4: ĐIỂM SINH KHÍ CĂN NHÀ & ĐÁNH GIÁ TỔNG QUAN
- **Điểm Sinh Khí Tổng Hợp:** **${hm.overall_vitality_score || 78} / 100 Điểm**
- **Đánh Giá Khí Vận:** **${hm.verdict || 'CÁT TƯỜNG'}**
- **Cơ Chế Tính Toán:** Kết hợp trọng số Bát Môn đáo Cung (60%) và Cửu Tinh quản chiếu (40%), trừ điểm phạt theo danh mục 13 dạng vi phạm nghiêm trọng.

---

### TẦNG 5: KHẢO SÁT NỘI KHÍ 6 PHÒNG CHỨC NĂNG (LỤC SỰ)
| Không Gian | Cung Vị | Bát Môn | Cửu Tinh | Bát Thần | Điểm Số | Phân Loại |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
${Object.entries(rooms).map(([rKey, rInfo]) => {
  const rLabels = {
    main_door: "Cửa Chính", kitchen: "Bếp Nấu", master_bed: "Phòng Ngủ",
    altar: "Ban Thờ", toilet: "Nhà Vệ Sinh", living_room: "Phòng Khách"
  };
  return `| **${rLabels[rKey] || rKey}** | Cung ${rInfo.palace_id} | ${rInfo.door} | ${rInfo.star} | ${rInfo.deity} | ${rInfo.score}/100 | **${rInfo.quality}** |`;
}).join('\n')}

---

### TẦNG 6: MA TRẬN HÓA GIẢI NGŨ HÀNH 3 CẤP ĐỘ
${viol.length === 0 ? `
- **Trạng Thái An Toàn:** Không phát hiện vi phạm đại sát trong bố trí nội khí 6 phòng.
` : viol.map((v, idx) => {
  const rem = v.remediation || {};
  const t1 = rem.tier1_thong_quan;
  const t2 = rem.tier2_tiet_khi;
  const t3 = rem.tier3_che_sat;
  return `
#### 6.${idx + 1}. [${v.severity}] ${v.name} (Tại Cung ${v.palace_id})
- **Tác Động Thực Tế:** ${v.impact}
- **Chiến Lược Hóa Giải:** ${rem.strategy}
${t1 ? `  * **${t1.title}**: Vật phẩm [${t1.items.join(', ')}]. ${t1.placement}. Kích hoạt: ${t1.activation_timing}` : ''}
${t2 ? `  * **${t2.title}**: Vật phẩm [${t2.items.join(', ')}]. ${t2.placement}. Kích hoạt: ${t2.activation_timing}` : ''}
${t3 ? `  * **${t3.title}**: Vật phẩm [${t3.items.join(', ')}]. ${t3.placement}. Kích hoạt: ${t3.activation_timing}` : ''}
- **Chỉ Dẫn Thực Hiện:** ${rem.action_advice}
`;
}).join('\n')}

---

### TẦNG 7: ĐỘNG CƠ THỦY PHÁP KÍCH HOẠT TÀI LỘC (WATER DRAGON)
${bWater.palace_id ? `
- **Điểm Vàng Nạp Khí:** **${bWater.palace_name}** (Điểm kích hoạt: ${bWater.activation_score}/100)
- **Cấu Trúc Tọa Cung:** ${bWater.door} • ${bWater.star} • ${bWater.deity} • Thiên Can ${bWater.heaven_stem}
- **Yếu Tố Cát Tường:** ${bWater.positive_factors.join('; ')}
- **Quy Cách Thiết Bị:** ${aProt.water_feature_type || 'Thác nước luân hồi hoặc hồ cá'}
- **Thời Khắc Mở Nước:** ${aProt.activation_timing || 'Giờ Sinh Môn / Giờ Thìn, Thân, Tý'}
- **Hiệu Quả Dự Kiến:** ${aProt.expected_outcome || 'Kích hoạt dòng tiền trong 14 đến 49 ngày.'}
` : `
- Hiện tại chưa xác định được vị trí đặt nước hội tụ đủ Tam Cát Môn và Cát Thần mà không phạm uế khí.
`}

---

### TẦNG 8: CƠ CHẾ THÁI CỰC KÉP & KẾT LUẬN THỰC THI
1. **Đại Thái Cực (Macro House):** Khảo sát toàn thể ranh giới lô đất để bố trí Khí Khẩu (Cửa chính), Táo Vị (Bếp) và An Thần Vị (Phòng ngủ).
2. **Tiểu Thái Cực (Micro Room):** 
   - Đặt bàn làm việc tại Cung có Sinh Môn hoặc Khai Môn của căn phòng.
   - Ngồi làm việc tựa lưng về hướng có Thần Trực Phù hoặc Cửu Thiên để củng cố quyền uy lãnh đạo và sự nghiệp hanh thông.
3. Hồ sơ thẩm định phong thủy Kỳ Môn hoàn tất việc lượng hóa toàn bộ các yếu tố địa lý, thời gian và khí trường. Đề nghị chủ công trình bám sát hướng dẫn hóa giải ngũ hành và kích hoạt đúng thời điểm để đạt hiệu quả tối ưu.
`;
  }

  // ==============================================================================
  // 10. XUẤT RA TOÀN CỤC (GLOBAL EXPORT)
  // ==============================================================================
  const NetaQmdjFengShuiEngine = {
    TWENTY_FOUR_MOUNTAINS: TWENTY_FOUR_MOUNTAINS,
    DAI_KHONG_VONG_ANGLES: DAI_KHONG_VONG_ANGLES,
    TIEU_KHONG_VONG_ANGLES: TIEU_KHONG_VONG_ANGLES,
    CRITICAL_VIOLATIONS_DB: CRITICAL_VIOLATIONS_DB,
    GRAVE_ANOMALIES_DB: GRAVE_ANOMALIES_DB,
    DESCENDANT_BRANCHES_MAPPING: DESCENDANT_BRANCHES_MAPPING,
    CUNG_PHI_INFO: CUNG_PHI_INFO,
    BAT_TRACH_DU_NIEN: BAT_TRACH_DU_NIEN,
    degreeToMountain: degreeToMountain,
    detectCompassVoidLines: detectCompassVoidLines,
    evaluatePeriod9Synergy: evaluatePeriod9Synergy,
    findOptimalWaterActivation: findOptimalWaterActivation,
    evaluateYangHouse: evaluateYangHouse,
    evaluateYinHouse: evaluateYinHouse,
    evaluateFengShuiTiming: evaluateFengShuiTiming,
    evaluateDestinyHouseHarmony: evaluateDestinyHouseHarmony,
    evaluateMicroCosmosRoom: evaluateMicroCosmosRoom,
    generateWaterDragonIcsContent: generateWaterDragonIcsContent,
    runComprehensiveFengShuiAudit: runComprehensiveFengShuiAudit,
    generateQmdjFengShuiEssay: generateQmdjFengShuiEssay
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = NetaQmdjFengShuiEngine;
  }
  global.NetaQmdjFengShuiEngine = NetaQmdjFengShuiEngine;

})(typeof window !== 'undefined' ? window : global);
