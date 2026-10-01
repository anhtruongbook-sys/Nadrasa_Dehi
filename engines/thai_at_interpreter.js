/**
 * NETA LIGHT - THÁI ẤT THẦN KINH EXPERT INTERPRETER ENGINE
 * File: engines/thai_at_interpreter.js
 * 
 * Hệ Chuyên Gia Luận Giải Thái Ất Thần Kinh Toàn Diện 100% Offline.
 * Chuyển thể từ C:\Books\Common Study\Luan_giai_thai_at (thai_at_interpreter.py & thai_at_ai_refiner.py).
 * 
 * 15 PHÂN HỆ THUẬT TOÁN ĐẠI TOÀN:
 * 1. Dashboard Chỉ Số Định Lượng (Threat & Success Index 0-100, Tỷ lệ Thắng Chủ - Khách).
 * 2. Vận Khí Cung Thái Ất (8 Cung Lạc Thư).
 * 3. Khí Tượng Bát Phong (8 Loại gió cổ điển & Dự báo môi trường).
 * 4. Kiểm Định Biến Dị Tam Vô (Vô Thiên - Vô Địa - Vô Nhân).
 * 5. Toán Pháp & Đạo Chủ - Khách (Trường, Đoản, Vô, Trùng Dương/Âm/Tạp).
 * 6. Ma Trận Giao Tranh Tứ Tướng (The 4 Generals Clash Engine).
 * 7. Nhận Diện 10 Đại Cách Cục Thái Ất (Bách, Yểm, Quan Cách, Kích, Tù, Tướng Nhập Mộ, Tam Môn...).
 * 8. Bố Cục 12 Cung Chức Năng (Thái Ất Mệnh Bàn Thập Nhị Cung).
 * 9. Tam Cơ Thần (Quân Cơ - Thần Cơ - Dân Cơ).
 * 10. Hệ Thống 30+ Thần Sát Kinh Điển.
 * 11. Ma Trận Hóa Khí, Nhị Hợp & Lục Xung Địa Bàn 16 Cung.
 * 12. Phước Đức, Cửu Tinh Trực Phù & Thần Quý Chiếu Mệnh.
 * 13. Bảng Dự Báo Cát Hung 12 Thời Thần Trong Ngày (Hourly Volatility & Momentum).
 * 14. 6 Phân Hệ Hành Động Tác Chiến Đa Ngành (Doanh nghiệp, Tài chính M&A, Pháp lý, BĐS, Marketing, Sức khỏe).
 * 15. Nhật Dụng Sự Vụ (7 Trọng Điểm Đời Sống Hàng Ngày).
 * 
 * Kèm Rào Chắn 4 Lớp Chống Ảo Giác và Bộ Kiểm Toán Cấu Trúc FactualStructureAuditor.
 * Chuẩn mực Kỷ luật Hành chính - Kỹ thuật theo Rule 9 & Rule 12.
 */

(function (global) {
  'use strict';

  // ==========================================
  // I. HẰNG SỐ & BẢNG TRA CỨU TRI THỨC
  // ==========================================

  const CUNG_NATURE = {
    "Kiền": {
      que: "Càn", hanh: "Kim", huong: "Tây Bắc",
      tuong: "Trời cao, nguyên thủ, kỷ cương nghiêm minh, cương kiện, quyền lực tối thượng.",
      khi_van: "Chính lệnh hanh thông, cấp trên có uy lực, cần giữ gìn đạo chính, tránh độc đoán kiêu ngạo.",
      hung_hoa: "Nếu gặp hung sát: Đề phòng biến động nơi cung đình hoặc ban lãnh đạo cao nhất, kiện tụng quan sai."
    },
    "Ngọ": {
      que: "Ly", hanh: "Hỏa", huong: "Chính Nam",
      tuong: "Lửa sáng, văn minh, công nghệ cao, truyền thông, nhiệt lượng cực thịnh.",
      khi_van: "Thời cơ rực rỡ cho truyền thông, thương hiệu, danh tiếng và công nghệ đột phá.",
      hung_hoa: "Nếu gặp hung sát: Cực thịnh tất suy, dễ xảy ra hỏa hoạn, hạn hán, cháy nổ, tranh cãi nóng nảy gay gắt."
    },
    "Cấn": {
      que: "Cấn", hanh: "Thổ", huong: "Đông Bắc",
      tuong: "Núi non, ngưng nghỉ, tái cấu trúc nền tảng, kiên cố vững chãi.",
      khi_van: "Giai đoạn tích lũy nội lực, tái cơ cấu hệ thống, củng cố nền tảng, dừng lại để quan sát.",
      hung_hoa: "Nếu gặp hung sát: Bế tắc đường lối, đình trệ phát triển, sạt lở hoặc khủng hoảng đất đai bất động sản."
    },
    "Mão": {
      que: "Chấn", hanh: "Mộc", huong: "Chính Đông",
      tuong: "Sấm sét, khởi động, công nghiệp sản xuất, chấn hưng, mùa xuân sinh sôi.",
      khi_van: "Khí thế bùng nổ, thích hợp khởi động dự án mới, sáng tạo công nghệ, xung phong đi đầu.",
      hung_hoa: "Nếu gặp hung sát: Đề phòng biến động quân sự phía Đông, tai nạn sấm sét giông bão, dao động tâm lý."
    },
    "Dậu": {
      que: "Đoài", hanh: "Kim", huong: "Chính Tây",
      tuong: "Đầm lầy, tài chính tiền tệ, khẩu thiệt, tiếng nói, phán xét pháp luật, đao kiếm.",
      khi_van: "Lĩnh vực ngân hàng, dòng tiền tệ và thương mại kim hoàn hoạt động sôi nổi; đàm phán sắc bén.",
      hung_hoa: "Nếu gặp hung sát: Khẩu thiệt thị phi, tranh chấp kiện cáo ra tòa, đổ vỡ tài chính, thương tật vũ khí."
    },
    "Khôn": {
      que: "Khôn", hanh: "Thổ", huong: "Tây Nam",
      tuong: "Đất mẹ, dung dưỡng, an sinh xã hội, nhu thuận, đại chúng bình dân, nông nghiệp.",
      khi_van: "Được lòng dân chúng, phát triển an sinh xã hội, nông sản dồi dào, kinh doanh hàng tiêu dùng đại trà đại lợi.",
      hung_hoa: "Nếu gặp hung sát: Thời tiết âm u ẩm thấp, dịch bệnh gia súc, tham ô ngấm ngầm làm rỗng ruột tổ chức."
    },
    "Tý": {
      que: "Khảm", hanh: "Thủy", huong: "Chính Bắc",
      tuong: "Vực sâu hiểm trở, tích lũy tiềm tàng, mùa đông giá lạnh, trí tuệ mưu lược.",
      khi_van: "Thời điểm dưỡng quân cất trữ lương thảo, nghiên cứu bí mật, mưu lược sâu xa, chuẩn bị cho tương lai.",
      hung_hoa: "Nếu gặp hung sát: Lũ lụt ngập úng nghiêm trọng, hàn dịch lây lan qua đường nước, sa vào cạm bẫy đối phương."
    },
    "Tốn": {
      que: "Tốn", hanh: "Mộc", huong: "Đông Nam",
      tuong: "Gió bão lan tỏa, lưu thông hàng hải, ngoại giao, thương mại quốc tế.",
      khi_van: "Thời kỳ mở rộng bang giao, xuất nhập khẩu hàng hải nhộn nhịp, thông tin mạng lưới lan truyền chóng mặt.",
      hung_hoa: "Nếu gặp hung sát: Bão tố nhiệt đới tàn phá vùng ven biển, dịch bệnh lây lan qua không khí, hợp đồng ngoại thương bị hủy."
    },
    "Cung giữa": {
      que: "Thái Cực", hanh: "Thổ", huong: "Trung ương",
      tuong: "Trung tâm điều phối quyền lực, nút thắt then chốt.",
      khi_van: "Thời điểm quy tụ nguồn lực về đầu não chỉ huy.",
      hung_hoa: "Nếu tướng tinh rơi vào trung cung thì bị vây hãm, khó thi triển tài năng trực tiếp."
    }
  };

  const NGU_HANH_SINH_KHAC = {
    "Kim_Kim": "Tỷ hòa (Đồng khí tương cầu, thế trận giằng co)",
    "Kim_Mộc": "Kim khắc Mộc (Chủ động phạt gãy, áp chế đối phương)",
    "Kim_Thủy": "Kim sinh Thủy (Tiêu hao nội lực để sinh dưỡng, nuôi nấng đối phương)",
    "Kim_Hỏa": "Kim bị Hỏa khắc (Chịu áp lực nặng nề, bị thiêu đốt áp đảo)",
    "Kim_Thổ": "Kim được Thổ sinh (Được nâng đỡ hậu phương, sinh khí dồi dào)",
    "Mộc_Mộc": "Tỷ hòa (Thế trận đồng đều, phát triển song song)",
    "Mộc_Thổ": "Mộc khắc Thổ (Chiếm lĩnh địa bàn, kiểm soát tài nguyên)",
    "Mộc_Hỏa": "Mộc sinh Hỏa (Dốc sức phát tiết ra ngoài, sáng tỏ nhưng hao tổn)",
    "Mộc_Kim": "Mộc bị Kim khắc (Bị tổn thương khí giới, tuyến đầu bị bẻ gãy)",
    "Mộc_Thủy": "Mộc được Thủy sinh (Được quý nhân trợ lực, phát triển vững chắc)",
    "Thủy_Thủy": "Tỷ hòa (Nước dâng mênh mông, khó bề kiềm tỏa)",
    "Thủy_Hỏa": "Thủy khắc Hỏa (Dập tắt xung kích, kiểm soát nhiệt độ chiến trường)",
    "Thủy_Mộc": "Thủy sinh Mộc (Trợ lực cho bên ngoài vươn lên)",
    "Thủy_Thổ": "Thủy bị Thổ khắc (Bị ngăn đê vây hãm, dòng tiền tắc nghẽn)",
    "Thủy_Kim": "Thủy được Kim sinh (Nguồn cội dồi dào, trí mưu vô tận)",
    "Hỏa_Hỏa": "Tỷ hòa (Lửa bốc rực cháy, nóng nảy xung đột cao)",
    "Hỏa_Kim": "Hỏa khắc Kim (Thiêu đốt phá hủy công sự, tấn công áp đảo)",
    "Hỏa_Thổ": "Hỏa sinh Thổ (Chuyển hóa tro bụi sinh dưỡng đất mẹ)",
    "Hỏa_Thủy": "Hỏa bị Thủy khắc (Bị dập tắt đột ngột, nhiệt huyết tiêu tan)",
    "Hỏa_Mộc": "Hỏa được Mộc sinh (Khí thế bùng cháy mạnh mẽ, thanh danh vang dội)",
    "Thổ_Thổ": "Tỷ hòa (Đất đai dày dặn, ổn định trì trệ)",
    "Thổ_Thủy": "Thổ khắc Thủy (Chặn đứng âm mưu ngầm, đắp đê trị thủy)",
    "Thổ_Kim": "Thổ sinh Kim (Đầu tư sinh lợi nhuận, tích lũy tài sản)",
    "Thổ_Mộc": "Thổ bị Mộc khắc (Bị chia cắt đất đai, nền tảng bị lung lay)",
    "Thổ_Hỏa": "Thổ được Hỏa sinh (Được hơi ấm nuôi dưỡng, tái sinh thuận lợi)"
  };

  const CUU_TINH_INTERPRETATION = {
    "Thiên Bồng": "Sao Thủy đại hung sát: Chủ về biến động mạo hiểm, lừa dối, trộm cắp, thủy tai; nhưng thuận cho trinh sát ngầm.",
    "Thiên Nhuế": "Sao Thổ hung tinh: Chủ về bệnh tật, trì trệ; nhưng có lợi cho việc thụ giáo học hỏi, nghiên cứu y dược.",
    "Thiên Xung": "Sao Mộc cát tinh: Chủ về dũng cảm xung phong, tốc chiến tốc thắng; kỵ sự chậm trễ nhu nhược.",
    "Thiên Phụ": "Sao Mộc đại cát tinh: Chủ về văn chương, thi cử, giáo dục, quý nhân tương trợ, công việc thuận buồm xuôi gió.",
    "Thiên Cầm": "Sao Thổ trung ương cát tinh: Chủ về quyền uy vững chãi, quy tụ nhân tâm, thích hợp lập móng vững bền.",
    "Thiên Tâm": "Sao Kim đại cát tinh: Chủ về mưu lược thượng thừa, y đạo chữa lành, lãnh đạo sáng suốt, mở mang cơ đồ.",
    "Thiên Trụ": "Sao Kim hung tinh: Chủ về tiếng vang lớn, tranh cãi, phá vỡ hiện trạng; tốt cho luật sư biện hộ, kiểm toán.",
    "Thiên Nhậm": "Sao Thổ cát tinh: Chủ về kiên nhẫn, gánh vác trọng trách lớn, xây dựng thành trì kiên cố, uy tín vàng.",
    "Thiên Anh": "Sao Hỏa tiểu cát/bình: Chủ về rực rỡ bên ngoài, truyền thông PR tốt; nhưng đề phòng hữu danh vô thực, cháy nổ."
  };

  const THAN_QUY_MAP = {
    "Thái nhất": "Thần Quý Đệ Nhất (Đại Cát): Tượng trưng cho ý chí tối cao, quyền lực đế vương, mọi việc mưu cầu đều được đại thuận.",
    "Thiên hoàng": "Thần Quý Đệ Nhị (Đại Cát): Quyền uy thống soái, quý nhân giáng lâm nâng đỡ, uy chấn tứ phương.",
    "Thái âm": "Thần Quý Đệ Tam (Cát Tinh): Mưu lược sâu kín, tài lộc sinh sôi trong thầm lặng, phụ nữ hoặc cộng sự âm thầm tương trợ.",
    "Hàm trì": "Thần Quý Đệ Tứ (Hung Sát): Đào hoa sát, tửu sắc làm mờ mắt, tiêu hao tài chính vào những cuộc vui phù phiếm, thị phi tình cảm.",
    "Thanh long": "Thần Quý Đệ Ngũ (Đại Cát): Đại hỷ lâm môn, thăng quan tiến chức, danh tiếng vang dội, kinh doanh đại phát.",
    "Thiên phù": "Thần Quý Đệ Lục (Cát Tinh): Lệnh bài triều đình, con dấu pháp lý hanh thông, ký kết hợp đồng lớn với cơ quan quản lý.",
    "Chiêu dao": "Thần Quý Đệ Thất (Hung Sát): Biến động đường sá bất ngờ, tranh chấp dọc đường, khẩu thiệt quan sai, cần cẩn trọng đi lại.",
    "Hiên viên": "Thần Quý Đệ Bát (Hung Sát): Đao kiếm sát thương, phẫu thuật dao kéo, tranh chấp đổ máu, tai nạn cơ khí kim loại.",
    "Nhiếp đề": "Thần Quý Đệ Cửu (Hung Tinh): Trì trệ đình đốn, bệnh tật kéo dài, tang chế hiếu sự, cần án binh dưỡng sức."
  };

  const BAT_PHONG_WEATHER = {
    "Tý": {
      ten: "Khảm Phong (Hàn Phong)", huong: "Chính Bắc",
      khi_hau: "Khí lạnh giá buốt, rét đậm rét hại trên diện rộng; nguy cơ ngập úng lũ lụt miền đồng bằng.",
      tai_bien: "Dịch bệnh đường ruột, bệnh cảm hàn; tắc nghẽn giao thông đường thủy hoặc vùng băng giá."
    },
    "Cấn": {
      ten: "Cấn Phong (Viêm Lương Phong)", huong: "Chính Đông Bắc",
      khi_hau: "Thời tiết khô lạnh kèm sương muối, mưa đá mùa xuân hoặc rét hại mùa đông.",
      tai_bien: "Tổn hại hoa màu vụ đông xuân; sạt lở núi đồi, nứt nẻ công trình vùng cao."
    },
    "Mão": {
      ten: "Chấn Phong (Thao Thao Phong)", huong: "Chính Đông",
      khi_hau: "Mưa giông sấm chớp dữ dội, thời tiết chuyển biến mau lẹ; gió bão kèm sấm sét.",
      tai_bien: "Nguy cơ sét đánh công trình cao tầng, chập cháy lưới điện diện rộng, nông sản sinh trưởng nhanh."
    },
    "Tốn": {
      ten: "Tốn Phong (Huân Phong)", huong: "Chính Đông Nam",
      khi_hau: "Độ ẩm cao, bão nhiệt đới từ biển Đông đổ bộ; mưa dầm gió lốc tàn phá vùng ven biển.",
      tai_bien: "Nguy cơ vỡ đê kè biển, lốc xoáy vùng duyên hải; dịch bệnh lây truyền qua giọt bắn đường hô hấp."
    },
    "Ngọ": {
      ten: "Ly Phong (Cự Phong)", huong: "Chính Nam",
      khi_hau: "Nắng nóng gay gắt, hạn hán khốc liệt kéo dài; nhiệt độ cao kỷ lục.",
      tai_bien: "Cháy rừng quy mô lớn, thiếu hụt nước mặt và thủy điện; dịch sốt phát ban, đột quỵ nhiệt."
    },
    "Khôn": {
      ten: "Khôn Phong (Thê Phong)", huong: "Chính Tây Nam",
      khi_hau: "Thời tiết u uất, nồm ẩm, sương mù dày đặc làm giảm tầm nhìn.",
      tai_bien: "Mốc meo tài liệu kho tàng, dịch tả lợn và sâu bệnh hại lúa bùng phát diện rộng."
    },
    "Dậu": {
      ten: "Đoài Phong (Lệ Phong)", huong: "Chính Tây",
      khi_hau: "Gió heo may hanh hao, hanh khô gắt gao; khí trời lành lạnh nhưng khô khốc.",
      tai_bien: "Bệnh hô hấp người già trẻ nhỏ; cảnh báo vũ khí sát thương hoặc tai nạn va chạm kim loại."
    },
    "Kiền": {
      ten: "Càn Phong (Bất Chu Phong)", huong: "Chính Tây Bắc",
      khi_hau: "Gió mùa cực bắc rít mạnh, thời tiết rét buốt khắc nghiệt xé da xé thịt.",
      tai_bien: "Chết rét đại gia súc; nguyên thủ và ban lãnh đạo lo âu trước biến động biên cương."
    }
  };

  const THAP_LUC = [
    "Thân", "Dậu", "Tuất", "Kiền", "Hợi", "Tý", "Sửu", "Cấn",
    "Dần", "Mão", "Thìn", "Tốn", "Tỵ", "Ngọ", "Mùi", "Khôn"
  ];

  // ==========================================
  // II. THUẬT TOÁN ĐỊNH LƯỢNG & PHÂN HỆ LUẬN GIẢI
  // ==========================================

  function analyzeSoToan(toanVal, label) {
    let doDai = "Trường Toán";
    let danhGia = "Khí số sung túc, sinh khí dồi dào, hậu phương vững mạnh, chiến lược trường kỳ tất thắng.";
    let score = 90;

    if (toanVal >= 20) {
      doDai = "Trường Toán";
      danhGia = "Khí số sung túc, sinh khí dồi dào, hậu phương vững mạnh, chiến lược trường kỳ tất thắng.";
      score = 90;
    } else if (toanVal >= 10) {
      doDai = "Đoản Toán";
      danhGia = "Lực lượng tầm trung, chỉ nên tốc chiến tốc quyết, đánh nhanh thắng nhanh, không thể kéo dài.";
      score = 60;
    } else if (toanVal === 1 || toanVal === 10) {
      doDai = "Vô Toán";
      danhGia = "Khí số bế tắc, sinh khí cạn kiệt, mưu sự ắt sa lầy, xuất kích tất chuốc lấy thương vong thảm hại.";
      score = 20;
    } else {
      doDai = "Cực Đoản";
      danhGia = "Khí thế yếu ớt, dễ bị đối phương bao vây phong tỏa.";
      score = 35;
    }

    let chuc = Math.floor(toanVal / 10);
    let donVi = toanVal % 10;
    let amDuong = "";

    if (chuc === 0) {
      amDuong = (donVi % 2 !== 0) ? "Đơn Dương (Chủ động, bộc phát)" : "Đơn Âm (Ẩn nhẫn, trầm tĩnh)";
    } else {
      if ((chuc % 2 !== 0) && (donVi % 2 !== 0)) {
        amDuong = "Trùng Dương (Khí quá cương liệt, dễ bùng nổ xung đột lớn hoặc gãy đổ đột ngột)";
      } else if ((chuc % 2 === 0) && (donVi % 2 === 0)) {
        amDuong = "Trùng Âm (Khí quá u uất, dễ xảy ra nghi kỵ nội bộ, âm mưu ngấm ngầm bế tắc)";
      } else {
        amDuong = "Tạp Trùng (Cương nhu tương tế, biến hóa linh hoạt theo thời cuộc)";
      }
    }

    return {
      label,
      gia_tri: toanVal,
      do_dai: doDai,
      am_duong: amDuong,
      danh_gia: danhGia,
      score
    };
  }

  function evaluateGeneralsClash(daiChuPos, daiKhachPos, thamChuPos, thamKhachPos) {
    let hanhChu = (CUNG_NATURE[daiChuPos] && CUNG_NATURE[daiChuPos].hanh) || "Thổ";
    let hanhKhach = (CUNG_NATURE[daiKhachPos] && CUNG_NATURE[daiKhachPos].hanh) || "Thổ";
    let hanhTChu = (CUNG_NATURE[thamChuPos] && CUNG_NATURE[thamChuPos].hanh) || "Thổ";
    let hanhTKhach = (CUNG_NATURE[thamKhachPos] && CUNG_NATURE[thamKhachPos].hanh) || "Thổ";

    let clashMain = NGU_HANH_SINH_KHAC[`${hanhChu}_${hanhKhach}`] || "Bình hòa tương tác";
    let clashChuInt = NGU_HANH_SINH_KHAC[`${hanhTChu}_${hanhChu}`] || "Hòa hợp";
    let clashKhachInt = NGU_HANH_SINH_KHAC[`${hanhTKhach}_${hanhKhach}`] || "Hòa hợp";

    return {
      hanh_chu: hanhChu,
      hanh_khach: hanhKhach,
      tuong_tac_chinh: clashMain,
      noi_bo_chu: `Tham Chủ (${thamChuPos} - ${hanhTChu}) đối với Đại Chủ (${daiChuPos} - ${hanhChu}): ${clashChuInt}`,
      noi_bo_khach: `Tham Khách (${thamKhachPos} - ${hanhTKhach}) đối với Đại Khách (${daiKhachPos} - ${hanhKhach}): ${clashKhachInt}`
    };
  }

  function detectTenGreatFormations(ke) {
    let formations = [];
    let taPos = ke.thaiAtPos;
    let vxPos = ke.vanXuongPos;
    let tkPos = ke.thuyKichPos;
    let ktPos = ke.keThanPos;
    let dcPos = ke.generals.daiChu;
    let dkPos = ke.generals.daiKhach;
    let sChu = ke.toanChu;
    let sKhach = ke.toanKhach;
    let npPos = ke.stars["Ngũ Phúc"] || "";

    // 1. Thái Ất Bách
    if (vxPos === taPos || tkPos === taPos) {
      formations.append = formations.push({
        ten: "THÁI ẤT BÁCH (Bức Bách Thần Vị)",
        loai: "Đại Hung Cách",
        hien_tuong: "Thiên Mục hoặc Thủy Kích đồng cung trực tiếp với Thái Ất.",
        anh_huong: "Người đứng đầu bị áp lực từ hai phía; chính sách nghẽn tắc, cấp dưới lộng quyền, mâu thuẫn trực diện."
      });
    }

    // 2. Thái Ất Yểm
    if (ktPos === taPos) {
      formations.push({
        ten: "THÁI ẤT YỂM (Gian Thần Bưng Bít)",
        loai: "Hung Cách",
        hien_tuong: "Kế Thần đóng cùng cung với Thái Ất.",
        anh_huong: "Thông tin bị bóp méo, nội bộ u ám, dịch bệnh âm ỉ phát tác, lòng người nghi kỵ."
      });
    }

    // 3. Quan Cách
    let vxIdx = THAP_LUC.indexOf(vxPos);
    let tkIdx = THAP_LUC.indexOf(tkPos);
    if (vxIdx !== -1 && tkIdx !== -1 && Math.abs(vxIdx - tkIdx) === 8) {
      formations.push({
        ten: "QUAN CÁCH (Cửa Ải Bế Tắc Đối Xung)",
        loai: "Đại Hung Cách",
        hien_tuong: "Thiên Mục và Thủy Kích đối xứng 180 độ qua tâm địa bàn.",
        anh_huong: "Ngoại giao đóng băng, đối đầu quân sự cực độ, cửa khẩu đình chỉ thông quan, đàm phán tan vỡ."
      });
    }

    // 4. Thái Ất Kích
    if (tkPos === taPos || tkPos === dcPos) {
      formations.push({
        ten: "THÁI ẤT KÍCH (Đột Kích Bất Ngờ)",
        loai: "Hung Cách",
        hien_tuong: "Thủy Kích lâm vào cung Thái Ất hoặc cung Chủ Đại Tướng.",
        anh_huong: "Nguy cơ bị đối phương đánh úp bất ngờ, tấn công mạng, khủng hoảng truyền thông đột xuất."
      });
    }

    // 5. Thái Ất Tù
    if (["Tý", "Kiền"].includes(taPos) && ([1, 10].includes(sChu) || [1, 10].includes(sKhach))) {
      formations.push({
        ten: "THÁI ẤT TÙ (Khí Số Tê Liệt)",
        loai: "Hung Cách",
        hien_tuong: "Thái Ất ngự cung hiểm gặp thế số Vô Toán.",
        anh_huong: "Lãnh đạo bị giam hãm hoặc mất quyền kiểm soát; bộ máy hoạt động trong trạng thái tê liệt."
      });
    }

    // 6. Tướng Nhập Mộ
    if (dcPos === "Cung giữa") {
      formations.push({
        ten: "CHỦ ĐẠI TƯỚNG NHẬP TRUNG CUNG (Vây Hãm Sa Lầy)",
        loai: "Hung Cách",
        hien_tuong: "Chủ Đại Tướng rơi vào Trung Cung số 5.",
        anh_huong: "Bộ chỉ huy bên Chủ bị đối phương siết chặt vòng vây, khó lòng thi triển sách lược."
      });
    }
    if (dkPos === "Cung giữa") {
      formations.push({
        ten: "KHÁCH ĐẠI TƯỚNG NHẬP TRUNG CUNG (Tiên Phong Tử Địa)",
        loai: "Hung Cách",
        hien_tuong: "Khách Đại Tướng rơi vào Trung Cung số 5.",
        anh_huong: "Mũi tiến công của bên Khách sa vào đầm lầy, tiến thoái lưỡng nan, nguy cơ bị bao vây tiêu diệt."
      });
    }

    // 7. Tam Môn Cụ Khánh
    let hasHung = formations.some(f => f.loai && f.loai.includes("Hung"));
    if (sChu >= 20 && !["Tý", "Dậu"].includes(taPos) && !hasHung) {
      formations.push({
        ten: "TAM MÔN CỤ KHÁNH (Quang Minh Thái Bình)",
        loai: "Đại Cát Cách",
        hien_tuong: "Thái Ất đắc địa, Chủ toán trường sinh khí dồi dào, không phạm bách yểm kích.",
        anh_huong: "Vận nước hưng thịnh, doanh nghiệp phát triển vượt bậc, thiên thời địa lợi nhân hòa tề tụ."
      });
    }

    // 8. Ngũ Phúc Giáng Lâm
    if (npPos && (npPos === taPos || npPos === dcPos)) {
      formations.push({
        ten: "NGŨ PHÚC GIÁNG LÂM (Hóa Giải Mọi Tai Ương)",
        loai: "Đại Cát Cách",
        hien_tuong: `Ngũ Phúc đóng cùng cung với Thái Ất hoặc Chủ Đại Tướng (${npPos}).`,
        anh_huong: "Gặp nguy hóa an, tài chính phục hồi tích cực, mọi ách nạn hiểm nguy đều được giải trừ."
      });
    }

    return formations;
  }

  function mapTwelveHumanPalaces(ke) {
    let taPos = ke.thaiAtPos;
    let vxPos = ke.vanXuongPos;
    let tkPos = ke.thuyKichPos;
    let npPos = ke.stars["Ngũ Phúc"] || "Cung giữa";
    let dcPos = ke.generals.daiChu;
    let dkPos = ke.generals.daiKhach;
    let qcPos = ke.stars["Quân Cơ"] || "Kiền";
    let tcPos = ke.stars["Thần Cơ"] || "Cấn";
    let danPos = ke.stars["Dân Cơ"] || "Khôn";

    return {
      "Mệnh Cung (Thiên Mệnh / Cốt Lõi)": {
        cung: taPos,
        y_nghia: `Ngự tại cung ${taPos}: Quyết định sứ mệnh cốt lõi, bản lĩnh trung tâm và tiềm năng bứt phá.`
      },
      "Huynh Đệ (Liên Minh / Đối Tác)": {
        cung: vxPos,
        y_nghia: `Văn Xương ngự tại ${vxPos}: Đối tác chiến lược có trí tuệ sâu rộng, hỗ trợ mưu lược đắc lực.`
      },
      "Phu Thê (Đồng Hành / Bền Vững)": {
        cung: ke.stars["Thần Hợp"] || "Sửu",
        y_nghia: `Thần Hợp ngự tại ${ke.stars["Thần Hợp"] || "Sửu"}: Mối quan hệ gắn kết hòa hợp, gia đạo an khang.`
      },
      "Tử Tức (Kế Cận / Sản Phẩm Mới)": {
        cung: "Mão",
        y_nghia: "Cung Mão (Mộc chấn sinh sôi): Thế hệ kế cận năng động, dự án phái sinh giàu sức sống."
      },
      "Tài Bạch (Tài Chính / Dòng Tiền)": {
        cung: "Kiền",
        y_nghia: "Kim ngân tiền tệ, năng lực thanh khoản, quy mô vốn luân chuyển lớn nhưng cần kiểm soát rủi ro."
      },
      "Tật Ách (Rủi Ro / Bệnh Tật)": {
        cung: tkPos,
        y_nghia: `Thủy Kích đóng tại ${tkPos}: Nơi dễ phát sinh tổn thương, tranh chấp, bệnh tật hoặc cạm bẫy pháp lý.`
      },
      "Thiên Di (Đối Ngoại / Mở Rộng)": {
        cung: dkPos,
        y_nghia: `Khách Đại Tướng ngự tại ${dkPos}: Năng lực vươn xa, thị trường xuất khẩu, đối tác phương xa dồi dào.`
      },
      "Nô Bộc (Nhân Viên / Khách Hàng)": {
        cung: danPos,
        y_nghia: `Dân Cơ ngự tại ${danPos}: Sự gắn kết của đội ngũ nhân sự, thị hiếu và niềm tin người tiêu dùng.`
      },
      "Quan Lộc (Sự Nghiệp / Quyền Lực)": {
        cung: qcPos,
        y_nghia: `Quân Cơ ngự tại ${qcPos}: Phản ánh chức vụ, danh vọng, quan hệ với cơ quan quản lý và lãnh đạo.`
      },
      "Điền Trạch (Hạ Tầng / Bất Động Sản)": {
        cung: "Cấn",
        y_nghia: "Nhà xưởng, trụ sở làm việc, đất đai cơ đồ, độ vững chắc của hạ tầng công nghệ."
      },
      "Phúc Đức (May Mắn / Hóa Giải)": {
        cung: npPos,
        y_nghia: `Ngũ Phúc ngự tại ${npPos}: Nguồn năng lượng bình an, quý nhân phù trợ lúc cam go hiểm nghèo.`
      },
      "Phụ Mẫu (Bề Trên / Bảo Trợ)": {
        cung: ke.stars["Thiên Ất"] || "Mão",
        y_nghia: `Thiên Ất ngự tại ${ke.stars["Thiên Ất"] || "Mão"}: Được sự bảo trợ của cấp trên và các chính sách vĩ mô.`
      }
    };
  }

  function calculateQuantitativeIndices(ke, formations) {
    let sChu = ke.toanChu;
    let sKhach = ke.toanKhach;

    let baseCat = 50;
    if (sChu >= 20) baseCat += 20;
    if (sKhach >= 20) baseCat += 10;
    if (ke.stars["Ngũ Phúc"] === ke.thaiAtPos) baseCat += 20;
    formations.forEach(f => {
      if (f.loai && f.loai.includes("Cát")) baseCat += 15;
      if (f.loai && f.loai.includes("Hung")) baseCat -= 15;
    });
    let catIndex = Math.max(10, Math.min(98, baseCat));

    let conflictBase = 30;
    if (Math.abs(sChu - sKhach) < 5) conflictBase += 30;
    if (ke.isVoNhan) conflictBase += 25;
    formations.forEach(f => {
      if (f.ten && (f.ten.includes("Bách") || f.ten.includes("Cách") || f.ten.includes("Kích"))) {
        conflictBase += 20;
      }
    });
    let conflictIndex = Math.max(15, Math.min(95, conflictBase));

    let disasterBase = 25;
    if (ke.isVoThien) disasterBase += 35;
    if (ke.isVoDia) disasterBase += 30;
    if (["Tý", "Tốn", "Ngọ"].includes(ke.thaiAtPos)) disasterBase += 10;
    let disasterIndex = Math.max(10, Math.min(99, disasterBase));

    let totalP = sChu + sKhach;
    let rateChu = totalP > 0 ? Math.round((sChu / totalP) * 1000) / 10 : 50.0;
    let rateKhach = totalP > 0 ? Math.round((sKhach / totalP) * 1000) / 10 : 50.0;

    return {
      diem_cat_khanh: catIndex,
      nguy_co_xung_dot: conflictIndex,
      nguy_co_thien_tai: disasterIndex,
      ty_le_chu: rateChu,
      ty_le_khach: rateKhach
    };
  }

  function forecastTimingAndDirection(ke) {
    let tkPos = ke.thuyKichPos;
    let taPos = ke.thaiAtPos;

    let phuongVi = (CUNG_NATURE[taPos] && CUNG_NATURE[taPos].huong) || "Chính Bắc";
    let phuongXungDot = (CUNG_NATURE[tkPos] && CUNG_NATURE[tkPos].huong) || "Đông Bắc";

    return {
      phuong_cat_loi: `Hướng ${phuongVi} (Cung ${taPos} đắc Thái Ất giáng hạ): Phương vị mở rộng, phát triển danh tiếng.`,
      phuong_xung_sat: `Hướng ${phuongXungDot} (Cung ${tkPos} gặp Thủy Kích): Cần gia cố an ninh, đề phòng tai ương.`,
      thoi_diem_ung_nghiem: `Sự vụ dễ kích hoạt rõ rệt vào các tháng có Tiết Lệnh tương hòa với cung ${taPos} hoặc tuần trăng trực xung với cung ${tkPos}.`
    };
  }

  function analyzeAllStars(stars) {
    let res = {};
    let starMeanings = {
      "Thanh Long": "Cát tinh đại hỷ, đem lại tài lộc, sự thăng tiến, mở rộng thị phần và danh tiếng vẻ vang.",
      "Rồng Xanh": "Cát tinh đại hỷ, đem lại tài lộc, sự thăng tiến, mở rộng thị phần và danh tiếng vẻ vang.",
      "Xích Kỳ": "Cờ đỏ lệnh tiễn: Cảnh báo hỏa hoạn, quân lệnh khẩn cấp, xung đột trực diện, tranh chấp nóng.",
      "Cờ Đỏ": "Cờ đỏ lệnh tiễn: Cảnh báo hỏa hoạn, quân lệnh khẩn cấp, xung đột trực diện, tranh chấp nóng.",
      "Hắc Kỳ": "Cờ đen ám muội: Cảnh báo thủy tai, âm mưu ngấm ngầm, chiến tranh mạng, lừa đảo hoặc dịch tễ.",
      "Cờ Đen": "Cờ đen ám muội: Cảnh báo thủy tai, âm mưu ngấm ngầm, chiến tranh mạng, lừa đảo hoặc dịch tễ.",
      "Tứ Thần": "Thần giám sát luật lệ, kiểm toán nội bộ, phán quyết tư pháp nghiêm minh, giữ gìn kỷ cương.",
      "Thiên Ất": "Cát thần trợ Chủ: Bảo vệ người đứng đầu, nâng đỡ vị thế, mở mang đường lối chiến lược.",
      "Địa Ất": "Cát thần trợ Khách: Củng cố nền tảng cơ sở, cứu trợ đất đai, tiếp viện cho cánh quân viễn chinh.",
      "Trực Phù": "Sao chấp pháp tối cao của thời lệnh: Nơi Trực Phù giáng hạ sẽ là điểm nóng phát sinh sự kiện then chốt.",
      "Tuế Cả": "Thái Tuế đương niên: Uy lực tối thượng, phương vị này kỵ động thổ, phá dỡ hoặc khiêu chiến trực diện.",
      "Thần Hợp": "Thần liên minh, hòa giải: Rất thuận lợi cho việc ký kết hợp đồng, sáp nhập liên doanh, hôn sự hòa bình."
    };

    for (let sName in stars) {
      if (starMeanings[sName]) {
        let sPos = stars[sName];
        let cHanh = (CUNG_NATURE[sPos] && CUNG_NATURE[sPos].hanh) || "Thổ";
        res[sName] = {
          cung: sPos,
          hanh: cHanh,
          y_nghia: `${sName} ngự Cung ${sPos} (${cHanh}): ${starMeanings[sName]}`
        };
      }
    }
    return res;
  }

  function analyzeTransformationsAndClashes(stars) {
    let events = [];
    let posList = {};
    for (let s in stars) {
      let p = stars[s];
      if (p) {
        if (!posList[p]) posList[p] = [];
        posList[p].push(s);
      }
    }

    let nhiHop = [
      ["Tý", "Sửu", "Hóa Thổ (Vững chãi, tích lũy đất đai)"],
      ["Dần", "Hợi", "Hóa Mộc (Tăng trưởng sinh sôi)"],
      ["Mão", "Tuất", "Hóa Hỏa (Bùng nổ truyền thông, nhiệt huyết)"],
      ["Thìn", "Dậu", "Hóa Kim (Thu tài tụ lộc, đàm phán sắc bén)"],
      ["Tỵ", "Thân", "Hóa Thủy (Lưu thông dòng tiền, trí tuệ)"],
      ["Ngọ", "Mùi", "Hóa Thái Dương / Thái Âm (Quang minh)"]
    ];

    nhiHop.forEach(([p1, p2, desc]) => {
      if (posList[p1] && posList[p2]) {
        events.push(`• Cung ${p1} (${posList[p1].join(', ')}) NHỊ HỢP Cung ${p2} (${posList[p2].join(', ')}) => ${desc}`);
      }
    });

    let lucXung = [
      ["Tý", "Ngọ", "Trực xung Thủy - Hỏa (Biến động tài chính, đối đầu gay gắt)"],
      ["Mão", "Dậu", "Trực xung Kim - Mộc (Tranh cãi đao kiếm, kiểm toán rà soát)"],
      ["Dần", "Thân", "Trực xung Dần - Thân (Biến động nhân sự, chuyển dời trụ sở)"],
      ["Tỵ", "Hợi", "Trực xung Tỵ - Hợi (Bão gió biển khơi, cẩn trọng đi lại)"],
      ["Thìn", "Tuất", "Trực xung Thìn - Tuất (Động thổ sụt lở, pháp lý đất đai)"],
      ["Sửu", "Mùi", "Trực xung Sửu - Mùi (Trì trệ bế tắc, nghi kỵ nội bộ)"]
    ];

    lucXung.forEach(([p1, p2, desc]) => {
      if (posList[p1] && posList[p2]) {
        events.push(`• CẢNH BÁO LỤC XUNG: Cung ${p1} (${posList[p1].join(', ')}) TRỰC XUNG Cung ${p2} (${posList[p2].join(', ')}) => ${desc}`);
      }
    });

    return events.length > 0 ? events : ["Các cung vị thần sát phối hợp bình hòa, không phạm đại xung."];
  }

  function forecastTwelveHours() {
    return [
      { gio: "Tý (23:00 - 01:00)", ngu_hanh: "Thủy", trang_thai: "Bình", loi_khuyen: "Tích lũy năng lượng, nghiên cứu bí mật, kỵ xuất quân ồn ào." },
      { gio: "Sửu (01:00 - 03:00)", ngu_hanh: "Thổ", trang_thai: "Cát", loi_khuyen: "Thần Hợp tương trợ, thích hợp hoàn thiện tài liệu, củng cố quy trình." },
      { gio: "Dần (03:00 - 05:00)", ngu_hanh: "Mộc", trang_thai: "Đại Cát", loi_khuyen: "Thanh Long giáng lâm, khí xuân khởi phát, giờ vàng để xuất phát hoặc công bố dự án." },
      { gio: "Mão (05:00 - 07:00)", ngu_hanh: "Mộc", trang_thai: "Cát", loi_khuyen: "Thiên Ất hộ trì, thuận lợi cho giao dịch buổi sáng, đàm phán hợp đồng." },
      { gio: "Thìn (07:00 - 09:00)", ngu_hanh: "Thổ", trang_thai: "Bình", loi_khuyen: "Khí thế tăng dần, nên giải quyết các thủ tục hành chính, pháp lý." },
      { gio: "Tỵ (09:00 - 11:00)", ngu_hanh: "Hỏa", trang_thai: "Cát", loi_khuyen: "Hỏa vượng trợ lực, tốt cho việc tiếp thị, gặp gỡ đối tác lớn." },
      { gio: "Ngọ (11:00 - 13:00)", ngu_hanh: "Hỏa", trang_thai: "Tiểu Hung", loi_khuyen: "Cực thịnh tất biến, đề phòng tranh cãi nóng nảy giờ trưa, nên nghỉ ngơi." },
      { gio: "Mùi (13:00 - 15:00)", ngu_hanh: "Thổ", trang_thai: "Bình", loi_khuyen: "Xử lý việc nội bộ, kiểm tra sổ sách kế toán, rà soát chi phí." },
      { gio: "Thân (15:00 - 17:00)", ngu_hanh: "Kim", trang_thai: "Hung", loi_khuyen: "Xích Kỳ, Hắc Kỳ giao hội, cẩn trọng va chạm giao thông hoặc thị phi đối tác." },
      { gio: "Dậu (17:00 - 19:00)", ngu_hanh: "Kim", trang_thai: "Đại Cát", loi_khuyen: "Thái Ất lâm môn, thu tiền về tài khoản, chốt giao dịch lớn, mở tiệc chúc mừng." },
      { gio: "Tuất (19:00 - 21:00)", ngu_hanh: "Thổ", trang_thai: "Bình", loi_khuyen: "Củng cố an ninh, sao lưu dữ liệu, bảo mật công nghệ." },
      { gio: "Hợi (21:00 - 23:00)", ngu_hanh: "Thủy", trang_thai: "Tiểu Cát", loi_khuyen: "Tứ Thần tuần thú, thích hợp quy hoạch chiến lược cho ngày mới." }
    ];
  }

  function generateSixActionScenarios(luan) {
    let ck = luan.dao_chu_khach.ket_luan;
    let isChu = ck.includes("CHỦ");
    let isDraw = ck.includes("LƯỠNG");
    let taCung = luan.cung_thai_at.name;

    return {
      doanh_nghiep: {
        dinh_huong_ceo: isChu
          ? "Ban Lãnh đạo nên tập trung vào tái cấu trúc quy trình, củng cố sự đoàn kết nội bộ và tối ưu hóa chi phí."
          : "CEO nên chỉ đạo chủ động mở rộng quy mô, cấp ngân sách cho các sáng kiến đổi mới then chốt.",
        van_hanh_nhan_su: "Duy trì kỷ cương nghiêm ngặt, rà soát hiệu suất (KPI) và nâng cao năng lực đội ngũ cốt cán.",
        kiem_soat_rui_ro: "Tránh các cam kết pháp lý vượt quá năng lực thực tế; bảo mật an toàn các bí mật kinh doanh."
      },
      tai_chinh: {
        chien_luoc_dong_tien: (isDraw || isChu)
          ? "Ưu tiên nắm giữ tiền mặt và các tài sản có thanh khoản cao; kiểm soát chặt chẽ tỷ lệ nợ vay."
          : "Tận dụng đòn bẩy tài chính hợp lý để nắm bắt cơ hội tài sản giá tốt hoặc mở vị thế đầu tư mới.",
        thao_tung_ma: "Nếu tham gia M&A: Đàm phán theo thế liên minh chia sẻ quyền kiểm soát (Win-Win), không nên thâu tóm thù địch.",
        dau_tu_chung_khoan: "Tập trung vào các cổ phiếu ngành ngân hàng, công nghệ và giáo dục (được Thái Ất Đoài Kim và Thiên Phụ trợ lực)."
      },
      phap_ly: {
        vi_the_to_tung: isChu
          ? "Bên Bị đơn (Chủ) nắm chắc chứng cứ hồ sơ gốc."
          : "Bên Nguyên đơn (Khách) chiếm ưu thế về lý lẽ và thời điểm khởi kiện.",
        giai_phap_toi_uu: "Ưu tiên thương lượng hòa giải tại Trung tâm Trọng tài hoặc hòa giải ngoài tòa để giảm thiểu chi phí và thời gian.",
        phong_ngua_phap_ly: "Rà soát lại toàn bộ hợp đồng xuất nhập khẩu và các điều khoản bảo lãnh ngân hàng (do lưu ý Quan Cách)."
      },
      bat_dong_san: {
        dong_tho_cat_noc: "Tránh động thổ tại phương Tây Bắc (Cung Kiền gặp Thủy Kích); ưu tiên khởi công hướng Chính Tây hoặc Đông Bắc.",
        tien_do_cong_trinh: "Tập trung hoàn thiện các hạng mục ngầm và kết cấu trước mùa mưa bão; gia cố hệ thống an toàn lao động.",
        giao_dich_dia_oc: "Phân khúc bất động sản công nghiệp và hạ tầng kho bãi logistics có thanh khoản tốt."
      },
      marketing: {
        thoi_diem_launch: "Thời cơ thuận lợi để tổ chức họp báo, công bố sản phẩm công nghệ / giáo dục mới (được sao Thiên Phụ bảo trợ).",
        thong_diep_truyen_thong: "Nhấn mạnh vào tính minh bạch, chuẩn mực chất lượng và giá trị phụng sự cộng đồng.",
        kenh_tiep_can: "Tập trung vào truyền thông số, mạng xã hội và các hội thảo chuyên đề học thuật."
      },
      y_te: {
        canh_bao_suc_khoe: `Thái Ất cư Cung ${taCung} gặp Đoài Phong: Cần chú ý bảo vệ hệ hô hấp, phổi, thanh quản và các bệnh về xương khớp.`,
        phong_ngua_dich_benh: "Giữ ấm cơ thể vào buổi sớm và đêm muộn; tăng cường uống nước ấm để cân bằng độ ẩm cơ thể.",
        an_duong_tinh_than: "Duy trì lối sống điều độ, tránh làm việc quá sức gây kiệt quệ sinh lực."
      }
    };
  }

  function interpretDailyLifeAffairs(ke, luan) {
    let vxPos = ke.vanXuongPos;
    let tkPos = ke.thuyKichPos;
    let ktPos = ke.keThanPos;
    let npPos = ke.stars["Ngũ Phúc"] || "";
    let thPos = ke.stars["Thần Hợp"] || "";
    let ttPos = ke.stars["Tứ Thần"] || "";
    let sChu = ke.toanChu;
    let sKhach = ke.toanKhach;
    let ckStatus = luan.dao_chu_khach.ket_luan || "";
    let isChuWin = ckStatus.includes("CHỦ");
    let isKhachWin = ckStatus.includes("KHÁCH");
    let catScore = luan.chi_so_dinh_luong.diem_cat_khanh || 50;
    let trucPhu = ke.stars["9 Sao Trực Phù"] || "";
    let thanQuy = ke.stars["Thần Quý"] || "";
    let hasHamTri = thanQuy.includes("Hàm trì") || thanQuy.includes("Đao sát");

    let catDir = luan.du_bao_ung_ky.phuong_cat_loi.split('(')[0].replace('Hướng', '').trim();
    let satDir = luan.du_bao_ung_ky.phuong_xung_sat.split('(')[0].replace('Hướng', '').trim();

    let gioMap = {
      dai_cat: "Giờ Dần (03:00 - 05:00)",
      cat_som: "Giờ Mão (05:00 - 07:00)",
      cat_trua: "Giờ Tỵ (09:00 - 11:00)",
      cat_chieu: "Giờ Dậu (17:00 - 19:00)",
      cat_dem: "Giờ Hợi (21:00 - 23:00)"
    };

    luan.thoi_than_12_gio.forEach(h => {
      let st = (h.trang_thai || '').toUpperCase();
      let gn = h.gio || '';
      if (st.includes("ĐẠI CÁT")) gioMap.dai_cat = `Giờ ${gn}`;
      else if (st.includes("CÁT") && !st.includes("TIỂU")) {
        if (gn.includes("05:") || gn.includes("07:")) gioMap.cat_som = `Giờ ${gn}`;
        else if (gn.includes("09:") || gn.includes("11:")) gioMap.cat_trua = `Giờ ${gn}`;
        else if (gn.includes("17:") || gn.includes("19:")) gioMap.cat_chieu = `Giờ ${gn}`;
        else if (gn.includes("21:") || gn.includes("01:")) gioMap.cat_dem = `Giờ ${gn}`;
      }
    });

    // 1. Hôn nhân
    let hnTt, hnProb, hnEval, hnAction;
    if (["Sửu", "Dần", "Mão", "Thìn"].includes(thPos) && !hasHamTri) {
      hnTt = "Đại Cát (Nhân Duyên Tương Hợp)";
      hnProb = 88;
      hnEval = `Thần Hợp ngự tại cung ${thPos}, sinh khí dồi dào, âm dương tương phối, gia đạo an vui thuận hòa.`;
      hnAction = "Rất thuận lợi để dạm ngõ, ăn hỏi, tổ chức hôn lễ hoặc làm lành sau bất đồng; vợ chồng đồng lòng tề gia.";
    } else if (hasHamTri) {
      hnTt = "Cảnh Báo Đào Hoa Sát / Khẩu Thiệt";
      hnProb = 45;
      hnEval = `Gặp Thần Quý ${thanQuy}: Dễ nảy sinh hiểu lầm, cám dỗ tửu sắc bên ngoài, nghi kỵ tình cảm.`;
      hnAction = "Cần giữ khoảng cách minh bạch trong các mối quan hệ xã giao; thẳng thắn trò chuyện để thấu hiểu.";
    } else {
      hnTt = "Bình Hòa Ổn Định";
      hnProb = 68;
      hnEval = "Gia đạo bình ổn, tình duyên êm ả, không có biến động tiêu cực lớn.";
      hnAction = "Dành thời gian chăm sóc gia đình, cùng nhau ăn bữa cơm ấm cúng, chia sẻ công việc nhà.";
    }

    // 2. Thi cử
    let tcTt, tcProb, tcEval, tcAction;
    if (sChu >= 20 && vxPos !== tkPos && vxPos !== "Tý") {
      tcTt = "Thượng Cát (Khoa Bảng Rạng Danh)";
      tcProb = 92;
      tcEval = `Văn Xương đóng tại ${vxPos}, Toán Chủ trường tồn ${sChu} điểm: Tư duy sắc bén, trí tuệ mẫn tiệp, thi cử phỏng vấn thuận buồm xuôi gió.`;
      tcAction = "Tự tin bước vào phòng thi hoặc phỏng vấn; trình bày ý tưởng mạch lạc, có luận cứ số liệu rõ ràng sẽ thuyết phục hội đồng.";
    } else if (sChu < 10) {
      tcTt = "Thử Thách / Cần Chuẩn Bị Kỹ Lưỡng";
      tcProb = 52;
      tcEval = `Toán Chủ đoản (${sChu} điểm): Áp lực tâm lý lớn, dễ hồi hộp dẫn đến sót ý hoặc đọc nhầm đề thi.`;
      tcAction = "Đọc kỹ đề thi ít nhất 2 lần trước khi làm; rà soát hồ sơ cẩn thận; giữ tinh thần điềm tĩnh.";
    } else {
      tcTt = "Trung Bình Khá";
      tcProb = 70;
      tcEval = "Năng lực đạt mức khá, cần thêm sự cẩn trọng và quyết đoán để bứt phá đạt điểm số cao.";
      tcAction = "Ôn tập theo đề cương trọng tâm, luyện tập trả lời phỏng vấn trước gương, đến điểm thi sớm 20 phút.";
    }

    // 3. Cầu tài
    let ctTt, ctProb, ctEval, ctAction;
    if (isChuWin) {
      ctTt = "Đại Lợi Cho Bên Chủ (Thu Tiền, Giữ Vốn Tốt)";
      ctProb = 85;
      ctEval = "Bên Chủ nắm giữ ưu thế lớn; tiền bạc tụ lại, giao dịch kinh doanh nắm đằng chuôi.";
      ctAction = "Nếu đi thu nợ: Mang đầy đủ hồ sơ đối soát sang gặp đối tác vào giờ hoàng đạo, kiên quyết dứt khoát; nếu khai trương thì khách quen ủng hộ.";
    } else if (isKhachWin) {
      ctTt = "Khách Hàng Nắm Quyền Chủ Động (Khai Trương Mở Thị Trường Rất Tốt)";
      ctProb = 78;
      ctEval = "Bên Khách có xung lực đột phá; sức mua thị trường lớn nhưng thu nợ cũ lại cần kiên trì đàm phán.";
      ctAction = "Nếu bán hàng/khai trương: Đẩy mạnh quảng bá, tung ưu đãi để hút khách mới; nếu thu nợ: Nên mềm mỏng thương lượng chia nhỏ kỳ thanh toán.";
    } else {
      ctTt = "Cân Bằng / Tránh Rủi Ro Đầu Cơ";
      ctProb = 60;
      ctEval = "Thị trường giằng co, dòng tiền luân chuyển vừa phải, không nên tất tay vào các thương vụ mạo hiểm.";
      ctAction = "Bán đúng giá niêm yết, kiểm kê tồn kho chặt chẽ; thu hồi công nợ bằng hình thức chuyển khoản qua ngân hàng.";
    }

    // 4. Xuất hành
    let xhTt, xhProb, xhEval, xhAction;
    if (catScore >= 60) {
      xhTt = "Cát Lợi Bình An (Thuận Buồm Xuôi Gió)";
      xhProb = 86;
      xhEval = `Đại cục đắc cát khí, xuất hành theo hướng ${catDir} gặp nhiều may mắn, quý nhân đón rước.`;
      xhAction = "Bước chân ra ngõ ưu tiên hướng về phương Cát; nếu chuyển nhà / nhập trạch nên đem bếp đun và chiếu chăn vào trước.";
    } else {
      xhTt = "Cẩn Trọng Tàu Xe / Kiểm Tra Hành Trang";
      xhProb = 58;
      xhEval = `Lưu ý phương ${satDir} gặp hung sát Thủy Kích; thời tiết hoặc giao thông có thể biến động bất thường.`;
      xhAction = "Kiểm tra kỹ xe cộ và giấy tờ tùy thân trước khi khởi hành; tránh xuất phát vào các giờ xung sát; bảo quản cẩn thận hành lý.";
    }

    // 5. Bệnh tật
    let skTt, skProb, skEval, skAction;
    if (trucPhu.includes("Thiên Tâm") || ["Kiền", "Cấn", "Khôn"].includes(npPos)) {
      skTt = "Gặp Thầy Gặp Thuốc (Hóa Nguy Thành An)";
      skProb = 89;
      skEval = "Được sao Thiên Tâm hoặc Ngũ Phúc hộ trì, bệnh nan y cũng tìm được danh y chữa khỏi, thuốc thang hiệu nghiệm.";
      skAction = "Nên đi khám sớm tại các bệnh viện tuyến đầu; tuân thủ đúng phác đồ điều trị của bác sĩ.";
    } else {
      skTt = "Cần Chăm Sóc Đúng Cách & Kiên Trì";
      skProb = 62;
      skEval = `Cung Tật Ách gặp Thủy Kích tại ${tkPos}: Cần chú ý tạng phủ liên quan đến hành của cung này.`;
      skAction = "Ăn uống thanh đạm, tránh rượu bia chất kích thích; không tự ý dùng thuốc truyền miệng; nếu có triệu chứng nên tái khám chuyên khoa.";
    }

    // 6. Tìm đồ
    let tdTt, tdProb, tdEval, tdAction;
    if (sChu >= 15) {
      tdTt = "Khả Năng Tìm Thấy Rất Cao (Đồ Quanh Quẩn Trong Khu Vực Gần)";
      tdProb = 82;
      tdEval = `Tứ Thần đóng tại ${ttPos}, Toán Chủ vững vàng: Đồ vật chưa bị đưa đi xa, còn nằm ở nơi quen thuộc.`;
      tdAction = `Tìm kiếm ở phương vị cung ${ttPos} hoặc nơi cất giữ đồ cũ, kẽ tủ, ngăn kéo, cốp xe; giữ bình tĩnh, rà soát từng tầng.`;
    } else {
      tdTt = "Dễ Rơi Ở Xa Hoặc Bị Che Khuất";
      tdProb = 40;
      tdEval = "Đồ vật có thể đã bị dịch chuyển ra khỏi vị trí ban đầu hoặc rơi ở nơi công cộng đông người.";
      tdAction = "Hỏi thăm bảo vệ, kiểm tra camera an ninh khu vực; đăng tin tìm kiếm trên nhóm cộng đồng vào các giờ Cát.";
    }

    // 7. Hòa giải
    let hgTt, hgProb, hgEval, hgAction;
    let hasQuanCach = luan.cach_cuc_dac_biet.some(c => c.ten && c.ten.includes("Quan Cách"));
    if (hasQuanCach) {
      hgTt = "Căng Thẳng Khẩu Thiệt (Cần Bình Tĩnh Hòa Giải)";
      hgProb = 48;
      hgEval = "Phạm Quan Cách: Các bên đều giữ cái tôi lớn, dễ biến chuyện nhỏ thành to, tranh cãi kéo dài.";
      hgAction = "Tuyệt đối không to tiếng thách thức; nhờ người có uy tín (tổ trưởng dân phố, người cao tuổi) đứng ra làm cầu nối phân xử.";
    } else {
      hgTt = "Dễ Dàng Hóa Giải Dĩ Hòa Vi Quý";
      hgProb = 80;
      hgEval = "Không có xung đột sâu sắc, chỉ là hiểu lầm nhỏ trong sinh hoạt hàng ngày.";
      hgAction = "Chủ động gửi lời chào hỏi hoặc tặng món quà nhỏ để giải tỏa khúc mắc; thẳng thắn chia sẻ trên tinh thần thiện chí.";
    }

    return {
      hon_nhan_gia_dao: {
        tieu_de: "Hôn Nhân, Tình Cảm & Gia Đạo",
        dung_than: `Thần Hợp (${thPos}), Phu Thê Cung, Thần Quý (${thanQuy})`,
        trang_thai: hnTt,
        xac_suat_thanh_cong: hnProb,
        danh_gia_chuyen_sau: hnEval,
        huong_dan_hanh_dong: hnAction,
        khung_gio_hoang_kim: gioMap.cat_chieu || gioMap.dai_cat
      },
      thi_cu_thang_tien: {
        tieu_de: "Thi Cử, Học Tập, Phỏng Vấn & Thăng Tiến",
        dung_than: `Văn Xương (${vxPos}), Quân Cơ (${ke.stars["Quân Cơ"] || ''}), Trực Phù (${trucPhu})`,
        trang_thai: tcTt,
        xac_suat_thanh_cong: tcProb,
        danh_gia_chuyen_sau: tcEval,
        huong_dan_hanh_dong: tcAction,
        khung_gio_hoang_kim: gioMap.cat_som || gioMap.dai_cat
      },
      cau_tai_buon_ban: {
        tieu_de: "Cầu Tài, Buôn Bán, Khai Trương & Thu Hồi Nợ",
        dung_than: `Tài Bạch, Ngũ Phúc (${npPos}), Tương Quan Chủ (${sChu}) vs Khách (${sKhach})`,
        trang_thai: ctTt,
        xac_suat_thanh_cong: ctProb,
        danh_gia_chuyen_sau: ctEval,
        huong_dan_hanh_dong: ctAction,
        khung_gio_hoang_kim: gioMap.cat_chieu || gioMap.dai_cat
      },
      xuat_hanh_di_doi: {
        tieu_de: "Xuất Hành, Du Lịch, Chuyển Nhà & Nhập Trạch",
        dung_than: `Thiên Di Cung, Phương Cát (${catDir}), Phương Hung (${satDir})`,
        trang_thai: xhTt,
        xac_suat_thanh_cong: xhProb,
        danh_gia_chuyen_sau: xhEval,
        huong_dan_hanh_dong: xhAction,
        khung_gio_hoang_kim: gioMap.dai_cat
      },
      benh_tat_y_te: {
        tieu_de: "Sức Khỏe, Khám Chữa Bệnh & Tìm Thầy Thuốc",
        dung_than: `Tật Ách Cung (${tkPos}), Thiên Tâm (${trucPhu}), Ngũ Phúc (${npPos})`,
        trang_thai: skTt,
        xac_suat_thanh_cong: skProb,
        danh_gia_chuyen_sau: skEval,
        huong_dan_hanh_dong: skAction,
        khung_gio_hoang_kim: gioMap.cat_trua || gioMap.cat_som
      },
      tim_do_that_lac: {
        tieu_de: "Tìm Đồ Vật Thất Lạc & Tìm Người Thân",
        dung_than: `Tứ Thần (${ttPos}), Kế Thần (${ktPos}), Toán Chủ (${sChu})`,
        trang_thai: tdTt,
        xac_suat_thanh_cong: tdProb,
        danh_gia_chuyen_sau: tdEval,
        huong_dan_hanh_dong: tdAction,
        khung_gio_hoang_kim: gioMap.cat_dem || gioMap.dai_cat
      },
      hoa_giai_thi_phi: {
        tieu_de: "Hóa Giải Mâu Thuẫn Xóm Giềng & Thị Phi Dân Sự",
        dung_than: `Đoài Cung, Thần Hợp (${thPos}), Kế Thần (${ktPos})`,
        trang_thai: hgTt,
        xac_suat_thanh_cong: hgProb,
        danh_gia_chuyen_sau: hgEval,
        huong_dan_hanh_dong: hgAction,
        khung_gio_hoang_kim: gioMap.cat_trua || gioMap.dai_cat
      }
    };
  }

  // ==========================================
  // III. HÀM TỔNG HỢP LUẬN GIẢI 1 KỂ
  // ==========================================

  function luanGiaiKe(ke, chartContext, userContext = {}) {
    if (!ke) return null;

    let cungTaName = ke.thaiAtPos || "Kiền";
    let cungTaInfo = CUNG_NATURE[cungTaName] || CUNG_NATURE["Kiền"];
    let weatherInfo = BAT_PHONG_WEATHER[cungTaName] || BAT_PHONG_WEATHER["Tý"];

    let analysisChu = analyzeSoToan(ke.toanChu, "Toán Chủ");
    let analysisKhach = analyzeSoToan(ke.toanKhach, "Toán Khách");
    let analysisDinh = analyzeSoToan(ke.toanDinh, "Toán Định");

    let clashData = evaluateGeneralsClash(
      ke.generals.daiChu, ke.generals.daiKhach,
      ke.generals.thamChu, ke.generals.thamKhach
    );

    let formations = detectTenGreatFormations(ke);
    let twelvePalaces = mapTwelveHumanPalaces(ke);
    let indices = calculateQuantitativeIndices(ke, formations);
    let timingForecast = forecastTimingAndDirection(ke);

    let allStarsAnalyzed = analyzeAllStars(ke.stars);
    let transformations = analyzeTransformationsAndClashes(ke.stars);
    let hourlyForecast = forecastTwelveHours(ke);

    let sChu = ke.toanChu;
    let sKhach = ke.toanKhach;
    let chuKhachState, chuKhachChienLuoc, loiKhuyenKd, loiKhuyenPl;

    if (sChu >= 20 && sKhach < 10) {
      chuKhachState = "CHỦ TOÀN THẮNG";
      chuKhachChienLuoc = "Bên Chủ nắm giữ thiên thời và sinh khí áp đảo. Kế sách tối ưu: 'Dĩ dật đãi lao' - đóng chặt cửa thành, giữ vững hệ thống hiện hữu, không manh động trước khiêu khích. Bên Khách dấy binh tiến công tất sẽ tự hao kiệt và chuốc lấy thất bại.";
      loiKhuyenKd = "Tối ưu hóa nội trị, giữ chắc thị phần, cắt giảm chi phí lãng phí, kiên quyết phòng thủ.";
      loiKhuyenPl = "Bên Bị đơn nắm giữ chứng cứ cốt tử, chiếm ưu thế rõ ràng trước tòa.";
    } else if (sKhach >= 20 && sChu < 10) {
      chuKhachState = "KHÁCH TOÀN THẮNG";
      chuKhachChienLuoc = "Bên Khách có xung lực đột phá mạnh mẽ, được thời cơ cải cách đổi mới. Kế sách tối ưu: Tiến công chủ động - dốc toàn lực thâm nhập thị trường, hành động dứt khoát, áp đặt vị thế mới. Bên Chủ bảo thủ cố chấp tất bị đào thải.";
      loiKhuyenKd = "Tung sản phẩm mới, ký kết hợp đồng, mở rộng thị phần, không chần chừ.";
      loiKhuyenPl = "Bên Khởi kiện chiếm thượng phong, nhanh chóng áp đặt các yêu cầu pháp lý.";
    } else if (sChu >= 20 && sKhach >= 20) {
      chuKhachState = "LƯỠNG LONG TRANH CHÂU (GIẰNG CO KHỐC LIỆT)";
      chuKhachChienLuoc = "Cả hai bên đều mạnh, tranh đấu chỉ dẫn đến tiêu hao sinh lực đôi bên. Kế sách tối ưu: Ngoại giao liên minh, chia sẻ thị phần, đôi bên cùng có lợi (Win-Win).";
      loiKhuyenKd = "Không nên đối đầu trong cuộc chiến giá cả; liên doanh liên kết là thượng sách.";
      loiKhuyenPl = "Hòa giải ngoài tố tụng là con đường tối ưu nhất.";
    } else {
      chuKhachState = "LƯỠNG BẠI CÂU THƯƠNG / SUY VI";
      chuKhachChienLuoc = "Cả hai đều suy yếu, mưu sự bất thành. Nên án binh bất động, bảo toàn dòng tiền.";
      loiKhuyenKd = "Giữ tiền mặt, đình chỉ các dự án đầu tư rủi ro.";
      loiKhuyenPl = "Chứng cứ chưa đủ mạnh, kiện tụng dễ kéo dài không có hồi kết.";
    }

    let tamVoAlerts = [];
    if (ke.isVoThien) {
      tamVoAlerts.push({
        ten: "VÔ THIÊN (Thiên Mệnh Trở Ngại)",
        muc_do: "Cực kỳ nghiêm trọng",
        hien_tuong: "Toán Chủ và Toán Khách đều dưới 10 hoặc phạm số tuyệt 1, 7.",
        canh_bao: "Khí hậu cực đoan, giông lốc sấm sét, hạn hán hoặc bão từ. Quyết sách cấp cao dễ bị vô hiệu hóa."
      });
    }
    if (ke.isVoDia) {
      tamVoAlerts.push({
        ten: "VÔ ĐỊA (Địa Tầng Biến Động)",
        muc_do: "Nghiêm trọng",
        hien_tuong: "Chữ số hàng đơn vị của Toán phạm vào số hãm địa 1, 2, 7.",
        canh_bao: "Đề phòng biến động đất đai, sạt lở, sụt lún công trình; bất động sản đóng băng hoặc tranh chấp quyền sử dụng đất."
      });
    }
    if (ke.isVoNhan) {
      tamVoAlerts.push({
        ten: "VÔ NHÂN (Nhân Tâm Phân Rã)",
        muc_do: "Đáng chú ý",
        hien_tuong: "Toán Định rơi vào số cùng tận hoặc thế cờ bị giằng co bế tắc.",
        canh_bao: "Lòng người ly tán, biến động sa thải nhân sự; dịch bệnh truyền nhiễm lây lan hoặc nảy sinh chia rẽ nội bộ."
      });
    }

    let luanRes = {
      ke_name: ke.keName,
      cuc_so: ke.cuc,
      don_type: ke.donType,
      nguyen: ke.nguyen,
      ky_du: ke.kyDu,
      cung_thai_at: {
        name: cungTaName,
        que: cungTaInfo.que,
        hanh: cungTaInfo.hanh,
        huong: cungTaInfo.huong,
        tuong: cungTaInfo.tuong,
        khi_van: cungTaInfo.khi_van,
        hung_hoa: cungTaInfo.hung_hoa
      },
      khi_tuong_bat_phong: weatherInfo,
      tam_toan: {
        chu_toan: analysisChu,
        khach_toan: analysisKhach,
        dinh_toan: analysisDinh
      },
      giao_tranh_tu_tuong: clashData,
      tu_tuong: {
        dai_chu: { cung: ke.generals.daiChu, ban_chat: (CUNG_NATURE[ke.generals.daiChu] && CUNG_NATURE[ke.generals.daiChu].tuong) || "" },
        dai_khach: { cung: ke.generals.daiKhach, ban_chat: (CUNG_NATURE[ke.generals.daiKhach] && CUNG_NATURE[ke.generals.daiKhach].tuong) || "" },
        tham_chu: ke.generals.thamChu,
        tham_khach: ke.generals.thamKhach
      },
      tam_co: {
        quan_co: { cung: ke.stars["Quân Cơ"] || "Kiền", y_nghia: `Quân Cơ đóng tại ${ke.stars["Quân Cơ"] || "Kiền"}` },
        than_co: { cung: ke.stars["Thần Cơ"] || "Cấn", y_nghia: `Thần Cơ đóng tại ${ke.stars["Thần Cơ"] || "Cấn"}` },
        dan_co: { cung: ke.stars["Dân Cơ"] || "Khôn", y_nghia: `Dân Cơ đóng tại ${ke.stars["Dân Cơ"] || "Khôn"}` }
      },
      toan_bo_than_sat: allStarsAnalyzed,
      ma_tran_hoa_khi: transformations,
      thoi_than_12_gio: hourlyForecast,
      dao_chu_khach: {
        ket_luan: chuKhachState,
        chien_luoc: chuKhachChienLuoc,
        kinh_doanh: loiKhuyenKd,
        phap_ly: loiKhuyenPl
      },
      cach_cuc_dac_biet: formations,
      thap_nhi_cung: twelvePalaces,
      tam_vo: tamVoAlerts,
      chi_so_dinh_luong: indices,
      du_bao_ung_ky: timingForecast,
      ngu_phuc_cung: ke.stars["Ngũ Phúc"] || "Cung giữa",
      sao_truc_phu: {
        ten: ke.stars["9 Sao Trực Phù"] || "Thiên Bồng",
        luan_giai: CUU_TINH_INTERPRETATION[ke.stars["9 Sao Trực Phù"] || "Thiên Bồng"] || ""
      },
      than_quy: {
        ten: ke.stars["Thần Quý"] || "Thái nhất",
        luan_giai: THAN_QUY_MAP[ke.stars["Thần Quý"] || "Thái nhất"] || "Thần quý bảo trợ."
      }
    };

    // Phân tích vai vế người hỏi (Phe Chủ vs Phe Khách)
    const querentRole = userContext.querentRole || 'chu';
    const isRoleChu = (querentRole === 'chu');
    let ketLuanVaiVe = '';
    let loiKhuyenVaiVe = '';
    let diemLoiThe = 50;

    if (isRoleChu) {
      if (sChu >= 20 && sKhach < 10) {
        ketLuanVaiVe = '🛡️ Phe Chủ (Của Bạn) Đại Đắc Thắng - Chiếm Trọn Thiên Thời & Địa Lợi';
        loiKhuyenVaiVe = 'Bạn đang nắm giữ thế chủ động hoàn toàn. Chiến lược tối ưu: "Dĩ dật đãi lao" - kiên định tại vị, bảo vệ thành quả, không cần vội vã. Mọi áp lực từ đối phương sẽ tự thoái lui.';
        diemLoiThe = 95;
      } else if (sKhach >= 20 && sChu < 10) {
        ketLuanVaiVe = '🛡️ Phe Chủ (Của Bạn) Gặp Bất Lợi - Đối Phương Tiến Công Rất Mạnh';
        loiKhuyenVaiVe = 'Bên Khách có xung lực áp đảo. Bạn không nên đối đầu trực diện hoặc bảo thủ cứng nhắc. Hãy chủ động phòng thủ kiên cố, rà soát lại hợp đồng/nội bộ và kéo dài thời gian để đối phương hạ nhiệt.';
        diemLoiThe = 30;
      } else if (sChu >= 20 && sKhach >= 20) {
        ketLuanVaiVe = '🛡️ Phe Chủ (Của Bạn) Ở Thế Giằng Co - Lưỡng Long Tranh Châu';
        loiKhuyenVaiVe = 'Cả hai bên đều có thực lực hùng hậu. Tranh đoạt chỉ dẫn đến hao tổn tài lực. Giải pháp tối ưu cho bạn là đàm phán hợp tác chia sẻ lợi ích (Win-Win).';
        diemLoiThe = 65;
      } else {
        ketLuanVaiVe = '🛡️ Phe Chủ (Của Bạn) Cần Án Binh Bất Động - Bảo Toàn Thực Lực';
        loiKhuyenVaiVe = 'Khí số cả hai bên đều trầm lắng. Không nên mở rộng thêm cam kết mới; tập trung giữ tiền mặt và ổn định nội bộ.';
        diemLoiThe = 45;
      }
    } else {
      if (sKhach >= 20 && sChu < 10) {
        ketLuanVaiVe = '⚔️ Phe Khách (Của Bạn) Đại Toàn Thắng - Xung Lực Đột Phá Mạnh Mẽ';
        loiKhuyenVaiVe = 'Thời cơ vàng để bạn tiến công! Dù là xuất hành, đi thi, phỏng vấn, nộp hồ sơ dự thầu hay mở thị trường, bạn đều chiếm thượng phong. Hãy hành động quyết đoán, chớp lấy thời cơ.';
        diemLoiThe = 95;
      } else if (sChu >= 20 && sKhach < 10) {
        ketLuanVaiVe = '⚔️ Phe Khách (Của Bạn) Khó Lòng Đột Phá - Thành Trì Đối Phương Kiên Cố';
        loiKhuyenVaiVe = 'Phe Chủ đang nắm giữ ưu thế phòng thủ áp đảo. Bạn xuất kích lúc này dễ gặp cản trở, tốn kém chi phí mà hiệu quả thấp. Nên tạm hoãn hoặc chuyển hướng mục tiêu.';
        diemLoiThe = 28;
      } else if (sChu >= 20 && sKhach >= 20) {
        ketLuanVaiVe = '⚔️ Phe Khách (Của Bạn) Thế Trận Đối Đầu Cân Não';
        loiKhuyenVaiVe = 'Đối phương cũng có nguồn lực rất mạnh. Đừng cố gắng thâu tóm hay ép giá cực đoan. Hãy dùng mưu lược khôn khéo và đề xuất phương án đôi bên cùng có lợi.';
        diemLoiThe = 65;
      } else {
        ketLuanVaiVe = '⚔️ Phe Khách (Của Bạn) Chưa Đủ Xung Lực Tiến Công';
        loiKhuyenVaiVe = 'Khí thế còn non yếu. Tạm thời hoãn xuất hành hoặc ký kết mạo hiểm; tiếp tục tích lũy tài nguyên và chuẩn bị kỹ lưỡng hơn.';
        diemLoiThe = 40;
      }
    }

    luanRes.vai_ve_duong_so = {
      role: querentRole,
      roleName: isRoleChu ? 'Phe Chủ (Tại vị / Phòng thủ / Bị đơn / Chủ nợ / Tuyển dụng)' : 'Phe Khách (Tiến công / Xuất hành / Khởi kiện / Đi vay / Ứng viên)',
      ketLuan: ketLuanVaiVe,
      loiKhuyen: loiKhuyenVaiVe,
      diemLoiThe: diemLoiThe
    };

    // Đối chiếu thần vị lâm cung tuổi đương số
    const querentBirthBranch = userContext.querentBirthBranch;
    const querentBirthYear = userContext.querentBirthYear;
    const querentCanChi = userContext.querentCanChi;

    if (querentBirthBranch) {
      const branchStars = [];
      for (let s in ke.stars) {
        if (ke.stars[s] === querentBirthBranch) {
          branchStars.push(s);
        }
      }
      let danhGiaMenh = 'Cung bản mệnh bình hòa, không bị hung sát trực chiếu, tâm lý ổn định, tiến thoái thuận theo thời cuộc.';
      let mucDo = 'Bình Hòa';
      if (branchStars.includes('Thái Ất')) {
        danhGiaMenh = '👑 Đại Cát Tối Cao: Thái Ất Thần Kinh giáng ngự trực tiếp vào cung tuổi của bạn! Đây là điềm đại cát đại hỷ, nguyên khí tràn đầy, uy quyền và quý khí nâng đỡ.';
        mucDo = 'Đại Cát';
      } else if (branchStars.includes('Ngũ Phúc')) {
        danhGiaMenh = '✨ Đại Cát Quý Nhân: Cung tuổi đắc Ngũ Phúc Thần Tinh giáng hạ! Giải trừ mọi tai ương hoạn nạn, biến hung thành cát, tài lộc hanh thông.';
        mucDo = 'Đại Cát';
      } else if (branchStars.includes('Văn Xương')) {
        danhGiaMenh = '📜 Thượng Cát Khoa Bảng: Văn Xương giáng ngự cung tuổi! Trí tuệ sáng suốt, mưu lược sâu sắc, đắc lợi cho việc học, thi cử, ký kết và hoạch định.';
        mucDo = 'Thượng Cát';
      } else if (branchStars.includes('Thủy Kích')) {
        danhGiaMenh = '⚠️ Cảnh Báo Xung Kích: Cung tuổi bị sao Thủy Kích chiếu trực diện! Cần đề phòng va chạm giao thông, tổn thương thân thể, bị đối thủ đánh úp hoặc tranh chấp pháp lý.';
        mucDo = 'Hung Sát';
      } else if (branchStars.includes('Kế Thần')) {
        danhGiaMenh = '⚠️ Cảnh Báo Ám Muội: Cung tuổi gặp Kế Thần giáng hạ! Cần đề phòng tiểu nhân bưng bít, thông tin sai lệch, bệnh tật ngầm hoặc hiểu lầm nội bộ.';
        mucDo = 'Hung';
      } else if (branchStars.includes('Cờ Đen') || branchStars.includes('Hắc Kỳ')) {
        danhGiaMenh = '⚠️ Cảnh Báo Hắc Kỳ: Thần cờ đen ám muội ngự cung tuổi! Cảnh giác với các chiêu trò lừa đảo, rủi ro sông nước hoặc thất thoát dữ liệu mạng.';
        mucDo = 'Tiểu Hung';
      } else if (branchStars.includes('Cờ Đỏ') || branchStars.includes('Xích Kỳ')) {
        danhGiaMenh = '⚠️ Cảnh Báo Xích Kỳ: Cờ đỏ quân lệnh ngự cung tuổi! Đề phòng xung đột tranh cãi nóng nảy, nguy cơ cháy nổ hỏa hoạn hoặc thủ tục hành chính gắt gao.';
        mucDo = 'Tiểu Hung';
      } else if (branchStars.includes('Chủ Đại Tướng') || branchStars.includes('Khách Đại Tướng')) {
        danhGiaMenh = '🛡️⚔️ Tướng Tinh Chiếu Mệnh: Cung tuổi đắc Đại Tướng ngự trị! Bạn có quyền lực điều phối thực tế, được giao phó trọng trách tiên phong trong sự vụ.';
        mucDo = 'Cát Tinh';
      }

      luanRes.doi_chieu_ban_menh = {
        namSinh: querentBirthYear,
        canChi: querentCanChi || '',
        cungDiaChi: querentBirthBranch,
        stars: branchStars,
        mucDo: mucDo,
        danhGia: danhGiaMenh
      };
    }

    luanRes.sau_phan_he_hanh_dong = generateSixActionScenarios(luanRes);
    luanRes.doi_song_hang_ngay = interpretDailyLifeAffairs(ke, luanRes);

    return luanRes;
  }

  // ==========================================
  // IV. XUẤT TOÀN VĂN BÁO CÁO 15 PHÂN HỆ ([I.] -> [XV.])
  // ==========================================

  function generateFullReportText(chart, targetKe = "gio", userContext = {}) {
    let ke = (targetKe === 'nam') ? chart.keNam :
             (targetKe === 'thang') ? chart.keThang :
             (targetKe === 'ngay') ? chart.keNgay : chart.keGio;

    let luan = luanGiaiKe(ke, chart, userContext);
    if (!luan) return "";

    let lines = [];
    lines.push("=".repeat(84));
    lines.push(`     BÁO CÁO LUẬN GIẢI CHUYÊN SÂU THÁI ẤT THẦN KINH ĐẠI TOÀN - ${(luan.ke_name || '').toUpperCase()}`);
    lines.push("=".repeat(84));
    lines.push(`• Thời Điểm Khảo Sát : ${chart.solarStr || ''} (Dương Lịch)`);
    lines.push(`• Tiết Khí Hiện Tại  : ${chart.tietKhi || ''}`);
    lines.push(`• Tứ Trụ Can Chi     : Năm ${chart.canChi.nam} - Tháng ${chart.canChi.thang} - Ngày ${chart.canChi.ngay} - Giờ ${chart.canChi.gio}`);
    lines.push(`• Cục Số Bàn Cờ      : ${ke.donType} | Cục thứ ${ke.cuc} / 72 | Nguyên ${ke.nguyen} | Vòng Kỷ Dư: ${ke.kyDu}`);

    let idx = luan.chi_so_dinh_luong;
    lines.push("-".repeat(84));
    lines.push(`[BẢNG CHỈ SỐ ĐỊNH LƯỢNG ĐẠI CỤC]`);
    lines.push(`  ★ Điểm Cát Khánh Toàn Phần : ${idx.diem_cat_khanh}/100`);
    lines.push(`  ▲ Nguy Cơ Xung Đột Đối Kháng: ${idx.nguy_co_xung_dot}/100`);
    lines.push(`  ▲ Nguy Cơ Thiên Tai Môi Trường: ${idx.nguy_co_thien_tai}/100`);
    lines.push(`  ⚔ Tương Quan Lực Lượng      : Bên Chủ ${idx.ty_le_chu}% vs Bên Khách ${idx.ty_le_khach}%`);
    lines.push("-".repeat(84));

    if (luan.vai_ve_duong_so) {
      lines.push(`[ĐỐI CHIẾU VAI VẾ & BẢN MỆNH NGƯỜI HỎI]`);
      lines.push(`• Vai Vế Đương Số    : ${luan.vai_ve_duong_so.roleName}`);
      lines.push(`  ★ Nhận Định Thế Trận : ${luan.vai_ve_duong_so.ketLuan}`);
      lines.push(`  💡 Lời Khuyên Cốt Tử : ${luan.vai_ve_duong_so.loiKhuyen}`);
      if (luan.doi_chieu_ban_menh) {
        lines.push(`• Bản Mệnh Đương Số  : Tuổi ${luan.doi_chieu_ban_menh.canChi} (Cung Địa Chi: [${luan.doi_chieu_ban_menh.cungDiaChi}])`);
        lines.push(`  ★ Thần Sát Lâm Cung  : ${luan.doi_chieu_ban_menh.stars.join(', ') || 'Bình hòa'} (${luan.doi_chieu_ban_menh.mucDo})`);
        lines.push(`  🎯 Tác Động Bản Mệnh : ${luan.doi_chieu_ban_menh.danhGia}`);
      }
      lines.push("-".repeat(84));
    }

    // [I. VẬN KHÍ THIÊN MỆNH - THÁI ẤT CHỦ TINH]
    let ta = luan.cung_thai_at;
    lines.push(`\n[I. VẬN KHÍ THIÊN MỆNH - THÁI ẤT CHỦ TINH]`);
    lines.push(`• Cung Ngự Trị : Cung ${ta.name} (Quẻ ${ta.que} - Hành ${ta.hanh} - Hướng ${ta.huong})`);
    lines.push(`• Bản Thể Tượng: ${ta.tuong}`);
    lines.push(`• Khí Vận      : ${ta.khi_van}`);
    lines.push(`• Cảnh Báo Sát : ${ta.hung_hoa}`);

    // [II. DỰ BÁO KHÍ TƯỢNG - ĐỊA HỌC BÁT PHONG]
    let wf = luan.khi_tuong_bat_phong;
    lines.push(`\n[II. DỰ BÁO KHÍ TƯỢNG - ĐỊA HỌC BÁT PHONG]`);
    lines.push(`• Khí Phong Chủ Điểm: ${wf.ten} (Hướng ${wf.huong})`);
    lines.push(`  - Diễn biến thời tiết : ${wf.khi_hau}`);
    lines.push(`  - Cảnh báo rủi ro     : ${wf.tai_bien}`);

    // [III. KIỂM ĐỊNH BIẾN DỊ THIÊN ĐỊA - TAM VÔ BIẾN TRẠNG]
    lines.push(`\n[III. KIỂM ĐỊNH BIẾN DỊ THIÊN ĐỊA - TAM VÔ BIẾN TRẠNG]`);
    if (luan.tam_vo && luan.tam_vo.length > 0) {
      luan.tam_vo.forEach(v => {
        lines.push(`  * CẢNH BÁO NGUY CƠ: [${v.muc_do.toUpperCase()}] ${v.ten}`);
        lines.push(`    - Cơ chế kích hoạt: ${v.hien_tuong}`);
        lines.push(`    - Ứng nghiệm thực tế: ${v.canh_bao}`);
      });
    } else {
      lines.push("  * Bầu trời và mặt đất bình ổn, không xuất hiện biến dị Tam Vô (Khí số tuần hoàn thuận hòa).");
    }

    // [IV. TOÁN PHÁP THÁI ẤT & ĐẠO CHỦ - KHÁCH CHIẾN LƯỢC]
    let tt = luan.tam_toan;
    lines.push(`\n[IV. TOÁN PHÁP THÁI ẤT & ĐẠO CHỦ - KHÁCH CHIẾN LƯỢC]`);
    lines.push(`1. TOÁN CHỦ  : ${String(tt.chu_toan.gia_tri).padStart(2, '0')} điểm | ${tt.chu_toan.do_dai} | ${tt.chu_toan.am_duong}`);
    lines.push(`   => Đánh giá: ${tt.chu_toan.danh_gia}`);
    lines.push(`2. TOÁN KHÁCH: ${String(tt.khach_toan.gia_tri).padStart(2, '0')} điểm | ${tt.khach_toan.do_dai} | ${tt.khach_toan.am_duong}`);
    lines.push(`   => Đánh giá: ${tt.khach_toan.danh_gia}`);
    lines.push(`3. TOÁN ĐỊNH : ${String(tt.dinh_toan.gia_tri).padStart(2, '0')} điểm | ${tt.dinh_toan.do_dai} | ${tt.dinh_toan.am_duong}`);

    let ck = luan.dao_chu_khach;
    lines.push(`\n• TƯƠNG QUAN LỰC LƯỢNG : ${ck.ket_luan}`);
    lines.push(`• KẾ SÁCH HÀNH ĐỘNG    : ${ck.chien_luoc}`);

    // [V. MA TRẬN GIAO TRANH TỨ TƯỚNG (GENERALS CLASH ENGINE)]
    let gt = luan.giao_tranh_tu_tuong;
    lines.push(`\n[V. MA TRẬN GIAO TRANH TỨ TƯỚNG (GENERALS CLASH ENGINE)]`);
    lines.push(`• Chủ Đại Tướng (${ke.generals.daiChu} - ${gt.hanh_chu}) vs Khách Đại Tướng (${ke.generals.daiKhach} - ${gt.hanh_khach}):`);
    lines.push(`  => ${gt.tuong_tac_chinh}`);
    lines.push(`• Tương tác Nội bộ Bên Chủ  : ${gt.noi_bo_chu}`);
    lines.push(`• Tương tác Nội bộ Bên Khách: ${gt.noi_bo_khach}`);

    // [VI. MA TRẬN NHẬN DIỆN CÁCH CỤC THÁI ẤT]
    lines.push(`\n[VI. MA TRẬN NHẬN DIỆN CÁCH CỤC THÁI ẤT]`);
    if (luan.cach_cuc_dac_biet && luan.cach_cuc_dac_biet.length > 0) {
      luan.cach_cuc_dac_biet.forEach((cc, i) => {
        lines.push(`  ${i + 1}. [${cc.loai.toUpperCase()}] ${cc.ten}`);
        lines.push(`     • Dấu hiệu: ${cc.hien_tuong}`);
        lines.push(`     • Ý nghĩa : ${cc.anh_huong}`);
      });
    } else {
      lines.push("  (Bàn cờ không phạm các đại hung cách; thế trận diễn tiến bình ổn, không có đột biến xấu).");
    }

    // [VII. BỐ CỤC 12 CUNG CHỨC NĂNG (THÁI ẤT MỆNH BÀN)]
    lines.push(`\n[VII. BỐ CỤC 12 CUNG CHỨC NĂNG (THÁI ẤT MỆNH BÀN)]`);
    for (let cName in luan.thap_nhi_cung) {
      let cVal = luan.thap_nhi_cung[cName];
      lines.push(`  • ${cName.padEnd(38, ' ')}: Cung ${cVal.cung.padEnd(6, ' ')} | ${cVal.y_nghia}`);
    }

    // [VIII. TAM CƠ THẦN (QUÂN CƠ - THẦN CƠ - DÂN CƠ)]
    let qc = ke.stars["Quân Cơ"] || "Kiền";
    let tc = ke.stars["Thần Cơ"] || "Cấn";
    let dan = ke.stars["Dân Cơ"] || "Khôn";
    lines.push(`\n[VIII. TAM CƠ THẦN (QUÂN CƠ - THẦN CƠ - DÂN CƠ)]`);
    lines.push(`  • Quân Cơ (Ban Lãnh Đạo Tối Cao / Nguyên Thủ) : Cung ${qc} (${(CUNG_NATURE[qc] && CUNG_NATURE[qc].hanh) || 'Thổ'})`);
    lines.push(`  • Thần Cơ (Bộ Máy Điều Hành / Tướng Lĩnh)     : Cung ${tc} (${(CUNG_NATURE[tc] && CUNG_NATURE[tc].hanh) || 'Thổ'})`);
    lines.push(`  • Dân Cơ (Quần Chúng Nhân Dân / Thị Trường)   : Cung ${dan} (${(CUNG_NATURE[dan] && CUNG_NATURE[dan].hanh) || 'Thổ'})`);

    // [IX. KHẢO SÁT HỆ THỐNG THẦN SÁT KINH ĐIỂN]
    lines.push(`\n[IX. KHẢO SÁT HỆ THỐNG THẦN SÁT KINH ĐIỂN]`);
    for (let sName in luan.toan_bo_than_sat) {
      lines.push(`  • ${luan.toan_bo_than_sat[sName].y_nghia}`);
    }

    // [X. MA TRẬN HÓA KHÍ, NHỊ HỢP & LỤC XUNG ĐỊA BÀN]
    lines.push(`\n[X. MA TRẬN HÓA KHÍ, NHỊ HỢP & LỤC XUNG ĐỊA BÀN]`);
    luan.ma_tran_hoa_khi.forEach(tr => lines.push(`  ${tr}`));

    // [XI. PHƯỚC ĐỨC, CỬU TINH & THẦN QUÝ CHIẾU MỆNH]
    lines.push(`\n[XI. PHƯỚC ĐỨC, CỬU TINH & THẦN QUÝ CHIẾU MỆNH]`);
    lines.push(`• Cung Ngũ Phúc       : Cung ${luan.ngu_phuc_cung} (Phúc thần giải trừ tai ách, tụ tài tụ đức)`);
    lines.push(`• 9 Sao Trực Phù      : ${luan.sao_truc_phu.ten}`);
    lines.push(`  - Ý nghĩa Cửu Tinh  : ${luan.sao_truc_phu.luan_giai}`);
    lines.push(`• Thần Quý Giáng Lâm  : ${luan.than_quy.ten}`);
    lines.push(`  - Ý nghĩa Thần Quý  : ${luan.than_quy.luan_giai}`);

    // [XII. DỰ BÁO ỨNG KỲ & PHƯƠNG VỊ KÍCH HOẠT]
    lines.push(`\n[XII. DỰ BÁO ỨNG KỲ & PHƯƠNG VỊ KÍCH HOẠT]`);
    lines.push(`• ${luan.du_bao_ung_ky.phuong_cat_loi}`);
    lines.push(`• ${luan.du_bao_ung_ky.phuong_xung_sat}`);
    lines.push(`• ${luan.du_bao_ung_ky.thoi_diem_ung_nghiem}`);

    // [XIII. BẢNG DỰ BÁO CÁT HUNG 12 THỜI THẦN TRONG NGÀY]
    lines.push(`\n[XIII. BẢNG DỰ BÁO CÁT HUNG 12 THỜI THẦN TRONG NGÀY]`);
    luan.thoi_than_12_gio.forEach(h => {
      lines.push(`  * Giờ ${h.gio.padEnd(20, ' ')} (Hành ${h.ngu_hanh.padEnd(4, ' ')}) [${h.trang_thai.toUpperCase().padEnd(9, ' ')}] => ${h.loi_khuyen}`);
    });

    // [XIV. HƯỚNG DẪN TÁC CHIẾN CHUYÊN BIỆT 6 PHÂN HỆ ĐA NGÀNH]
    lines.push(`\n[XIV. HƯỚNG DẪN TÁC CHIẾN CHUYÊN BIỆT 6 PHÂN HỆ ĐA NGÀNH]`);
    let sc = luan.sau_phan_he_hanh_dong;

    lines.push("  1. QUẢN TRỊ DOANH NGHIỆP & LÃNH ĐẠO:");
    lines.push(`     - Định hướng CEO : ${sc.doanh_nghiep.dinh_huong_ceo}`);
    lines.push(`     - Nhân sự & Bộ máy: ${sc.doanh_nghiep.van_hanh_nhan_su}`);
    lines.push(`     - Quản trị Rủi ro : ${sc.doanh_nghiep.kiem_soat_rui_ro}`);

    lines.push("  2. TÀI CHÍNH, CHỨNG KHOÁN & M&A:");
    lines.push(`     - Quản trị Dòng tiền : ${sc.tai_chinh.chien_luoc_dong_tien}`);
    lines.push(`     - Chiến lược M&A     : ${sc.tai_chinh.thao_tung_ma}`);
    lines.push(`     - Đầu tư Thị trường  : ${sc.tai_chinh.dau_tu_chung_khoan}`);

    lines.push("  3. PHÁP LÝ, TỐ TỤNG & TRANH CHẤP:");
    lines.push(`     - Vị thế Bên tham gia: ${sc.phap_ly.vi_the_to_tung}`);
    lines.push(`     - Lộ trình Giải quyết : ${sc.phap_ly.giai_phap_toi_uu}`);
    lines.push(`     - Phòng ngừa Rủi ro   : ${sc.phap_ly.phong_ngua_phap_ly}`);

    lines.push("  4. DỰ ÁN, XÂY DỰNG & BẤT ĐỘNG SẢN:");
    lines.push(`     - Động thổ / Cất nóc : ${sc.bat_dong_san.dong_tho_cat_noc}`);
    lines.push(`     - Quản trị Dự án     : ${sc.bat_dong_san.tien_do_cong_trinh}`);
    lines.push(`     - Thanh khoản Địa ốc : ${sc.bat_dong_san.giao_dich_dia_oc}`);

    lines.push("  5. TIẾP THỊ, TRUYỀN THÔNG & RA MẮT SẢN PHẨM:");
    lines.push(`     - Thời điểm Launch   : ${sc.marketing.thoi_diem_launch}`);
    lines.push(`     - Thông điệp Cốt lõi : ${sc.marketing.thong_diep_truyen_thong}`);
    lines.push(`     - Kênh Tiếp cận      : ${sc.marketing.kenh_tiep_can}`);

    lines.push("  6. Y TẾ, SỨC KHỎE & AN DƯỠNG:");
    lines.push(`     - Cảnh báo Cơ thể    : ${sc.y_te.canh_bao_suc_khoe}`);
    lines.push(`     - Dự phòng Dịch bệnh : ${sc.y_te.phong_ngua_dich_benh}`);
    lines.push(`     - An dưỡng Tinh thần : ${sc.y_te.an_duong_tinh_than}`);

    // [XV. HƯỚNG DẪN CHI TIẾT XEM QUẺ TRONG ĐỜI SỐNG HÀNG NGÀY (NHẬT DỤNG SỰ VỤ)]
    lines.push(`\n[XV. HƯỚNG DẪN CHI TIẾT XEM QUẺ TRONG ĐỜI SỐNG HÀNG NGÀY (NHẬT DỤNG SỰ VỤ)]`);
    let ds = luan.doi_song_hang_ngay;
    let stt = 1;
    for (let k in ds) {
      let item = ds[k];
      lines.push(`  ${stt}. ${item.tieu_de.toUpperCase()} (Xác suất thuận lợi: ${item.xac_suat_thanh_cong}%)`);
      lines.push(`     • Dụng Thần Xem Xét : ${item.dung_than}`);
      lines.push(`     • Trạng Thái Quẻ   : [${item.trang_thai.toUpperCase()}]`);
      lines.push(`     • Phân Tích Cốt Lõi: ${item.danh_gia_chuyen_sau}`);
      lines.push(`     • Chỉ Dẫn Hành Động: ${item.huong_dan_hanh_dong}`);
      lines.push(`     • Giờ Vàng Ưu Tiên : ${item.khung_gio_hoang_kim}`);
      stt++;
    }

    lines.push("=".repeat(84));
    return lines.join("\n");
  }

  // ==========================================
  // V. RÀO CHẮN AI GEMINI & BỘ KIỂM TOÁN CẤU TRÚC
  // ==========================================

  const REQUIRED_SECTIONS = [
    "[I. VẬN KHÍ THIÊN MỆNH",
    "[II. DỰ BÁO KHÍ TƯỢNG",
    "[III. KIỂM ĐỊNH BIẾN DỊ THIÊN ĐỊA",
    "[IV. TOÁN PHÁP THÁI ẤT",
    "[V. MA TRẬN GIAO TRANH TỨ TƯỚNG",
    "[VI. MA TRẬN NHẬN DIỆN CÁCH CỤC",
    "[VII. BỐ CỤC 12 CUNG CHỨC NĂNG",
    "[VIII. TAM CƠ THẦN",
    "[IX. KHẢO SÁT HỆ THỐNG THẦN SÁT",
    "[X. MA TRẬN HÓA KHÍ",
    "[XI. PHƯỚC ĐỨC, CỬU TINH",
    "[XII. DỰ BÁO ỨNG KỲ",
    "[XIII. BẢNG DỰ BÁO CÁT HUNG 12 THỜI THẦN",
    "[XIV. HƯỚNG DẪN TÁC CHIẾN CHUYÊN BIỆT",
    "[XV. HƯỚNG DẪN CHI TIẾT XEM QUẺ TRONG ĐỜI SỐNG HÀNG NGÀY"
  ];

  function buildAIPrompt(rawReport) {
    return `Bạn là Tổng Biên Tập Học Thuật kiêm Chuyên Gia Luận Giải Tối Cao về Thái Ất Thần Kinh (Taiyi Shenshu Technical Editor).
Nhiệm vụ của bạn là tiếp nhận bản thảo luận giải kỹ thuật được tính toán chính xác 100% từ Động Cơ Toán Học Cổ Điển và tiến hành BIÊN TẬP, TRAU CHUỐT VĂN PHONG, NÂNG CAO ĐỘ MẠCH LẠC VÀ CHIỀU SÂU HÀNH ĐỘNG.

BẠN BẮT BUỘC PHẢI TUÂN THỦ NGHIÊM NGẶT 4 NGUYÊN TẮC BẤT BIẾN:
1. BẢO TOÀN 100% CẤU TRÚC 15 PHÂN MỤC: Bắt buộc giữ nguyên vẹn toàn bộ 15 tiêu đề [I.] đến [XV.], đúng thứ tự, không được bỏ sót bất kỳ mục nào.
2. BẢO TOÀN TUYỆT ĐỐI SỐ LIỆU: Giữ nguyên vẹn 100% các giá trị Cục số, Kỷ dư, Toán Chủ, Toán Khách, Toán Định, Điểm Cát Khánh, Nguy cơ Xung đột, Tọa độ Thần Sát. Tuyệt đối không tự ý bịa thêm sao, thần sát hay cách cục không có trong bản thảo gốc.
3. KỶ LUẬT VĂN PHONG HÀNH CHÍNH - HỌC THUẬT: Nghiêm cấm dùng các từ ngữ cảm tính, quảng cáo, giật gân (như: "đột phá", "thần tốc", "triệt tiêu 100% rủi ro", "tuyệt đối hoàn hảo", "kim chỉ nam", "khổng lồ", "siêu tính toán"). Dùng ngôn từ trang nhã, khách quan, định lượng.
4. QUY CÁCH ĐẦU RA: Xuất bản trực tiếp toàn văn báo cáo hoàn chỉnh từ dòng đầu tiên đến dòng cuối cùng. Tuyệt đối không thêm lời chào hỏi hay giải thích ngoài lề.

--- BẢN THẢO GỐC CẦN BIÊN TẬP ---
${rawReport}
--- HẾT BẢN THẢO GỐC ---

HÃY BẮT ĐẦU XUẤT TOÀN VĂN BÁO CÁO ĐÃ BIÊN TẬP NGAY BÊN DƯỚI:`;
  }

  function validateFactualStructure(aiText) {
    if (!aiText || typeof aiText !== 'string' || aiText.trim().length < 200) {
      return { isValid: false, reason: "Phản hồi AI quá ngắn hoặc rỗng." };
    }
    let lower = aiText.toLowerCase();
    let missing = [];
    REQUIRED_SECTIONS.forEach((sec, idx) => {
      let rawTag = sec.split(' ')[0].toLowerCase().replace('[', ''); // "i."
      let bracketTag = '[' + rawTag; // "[i."
      let titleKeyword = sec.substring(sec.indexOf(' ')).trim().toLowerCase(); // e.g. "vận khí thiên mệnh"
      
      let found = lower.includes(bracketTag) || 
                  lower.includes(rawTag) || 
                  lower.includes('## ' + rawTag) || 
                  lower.includes('# ' + rawTag) ||
                  (titleKeyword && lower.includes(titleKeyword));

      if (!found) missing.push(sec);
    });

    if (missing.length > 5) {
      return {
        isValid: false,
        reason: `AI đã làm mất một số phân mục: ${missing.slice(0, 3).join(', ')}...`
      };
    }
    return { isValid: true };
  }

  // ==========================================
  // VI. EXPORT MODULE GLOBAL
  // ==========================================

  global.NetaThaiAtInterpreter = {
    CUNG_NATURE,
    BAT_PHONG_WEATHER,
    CUU_TINH_INTERPRETATION,
    THAN_QUY_MAP,
    analyzeSoToan,
    evaluateGeneralsClash,
    detectTenGreatFormations,
    mapTwelveHumanPalaces,
    calculateQuantitativeIndices,
    forecastTimingAndDirection,
    analyzeAllStars,
    analyzeTransformationsAndClashes,
    forecastTwelveHours,
    generateSixActionScenarios,
    interpretDailyLifeAffairs,
    luanGiaiKe,
    generateFullReportText,
    buildAIPrompt,
    validateFactualStructure
  };

})(typeof window !== 'undefined' ? window : this);
