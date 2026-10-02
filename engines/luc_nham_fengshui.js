/**
 * NETA LIGHT - LỤC NHÂM ĐẠI ĐỘN PHONG THỦY ENGINE (luc_nham_fengshui.js)
 * Động Cơ Toán Học Hóa Chẩn Đoán Không Gian Phong Thủy Địa Lý 8 Hướng (Dương Trạch & Âm Trạch)
 * Dựa trên cổ thư 'Ngự Định Lục Nhâm Trực Chỉ', 'Đại Lục Nhâm Chỉ Mông' & Nghiên cứu mới.
 * 100% Thuần JavaScript - Chạy Offline không phụ thuộc thư viện ngoài.
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

  // 1. Ánh xạ 12 Địa Chi sang 8 Hướng La Kinh và Bát Quái
  const SPATIAL_8_DIRECTIONS = {
    "Tý":   { huong: "Chính Bắc",     quai: "Khảm", hanh: "Thủy", goc: "345° - 15°",  azimuth: 0,   shortHuong: "Bắc" },
    "Sửu":  { huong: "Đông Bắc (Bắc)", quai: "Cấn",  hanh: "Thổ",  goc: "15° - 45°",   azimuth: 30,  shortHuong: "Đông Bắc" },
    "Dần":  { huong: "Đông Bắc (Đông)",quai: "Cấn",  hanh: "Thổ",  goc: "45° - 75°",   azimuth: 60,  shortHuong: "Đông Bắc" },
    "Mão":  { huong: "Chính Đông",    quai: "Chấn", hanh: "Mộc",  goc: "75° - 105°",  azimuth: 90,  shortHuong: "Đông" },
    "Thìn": { huong: "Đông Nam (Đông)",quai: "Tốn",  hanh: "Mộc",  goc: "105° - 135°", azimuth: 120, shortHuong: "Đông Nam" },
    "Tỵ":   { huong: "Đông Nam (Nam)", quai: "Tốn",  hanh: "Hỏa",  goc: "135° - 165°", azimuth: 150, shortHuong: "Đông Nam" },
    "Ngọ":  { huong: "Chính Nam",     quai: "Ly",   hanh: "Hỏa",  goc: "165° - 195°", azimuth: 180, shortHuong: "Nam" },
    "Mùi":  { huong: "Tây Nam (Nam)",  quai: "Khôn", hanh: "Thổ",  goc: "195° - 225°", azimuth: 210, shortHuong: "Tây Nam" },
    "Thân": { huong: "Tây Nam (Tây)",  quai: "Khôn", hanh: "Kim",  goc: "225° - 255°", azimuth: 240, shortHuong: "Tây Nam" },
    "Dậu":  { huong: "Chính Tây",     quai: "Đoài", hanh: "Kim",  goc: "255° - 285°", azimuth: 270, shortHuong: "Tây" },
    "Tuất": { huong: "Tây Bắc (Tây)",  quai: "Càn",  hanh: "Kim",  goc: "285° - 315°", azimuth: 300, shortHuong: "Tây Bắc" },
    "Hợi":  { huong: "Tây Bắc (Bắc)",  quai: "Càn",  hanh: "Thủy", goc: "315° - 345°", azimuth: 330, shortHuong: "Tây Bắc" }
  };

  // 2. Cung Trạch Mộ (Vị trí đóng khí ngầm của Chi ngày)
  const TRACH_MO_MAP = {
    "Hợi": "Thìn", "Tý": "Thìn",
    "Dần": "Mùi",  "Mão": "Mùi",
    "Tỵ": "Tuất",   "Ngọ": "Tuất",
    "Thân": "Sửu", "Dậu": "Sửu",
    "Thìn": "Thìn", "Tuất": "Tuất", "Sửu": "Sửu", "Mùi": "Mùi"
  };

  // 3. Hàm tính Tuần Không theo Can Chi ngày
  function tinhTuanKhong(can, chi) {
    const canIdx = THIEN_CAN.indexOf(can);
    const chiIdx = DIA_CHI.indexOf(chi);
    if (canIdx === -1 || chiIdx === -1) return [];
    const tuanDauChiIdx = ((chiIdx - canIdx) % 12 + 12) % 12;
    const khong1 = DIA_CHI[((tuanDauChiIdx - 2) % 12 + 12) % 12];
    const khong2 = DIA_CHI[((tuanDauChiIdx - 1) % 12 + 12) % 12];
    return [khong1, khong2];
  }

  // 4. Hàm đánh giá tương tác Ngũ Hành chuẩn hóa f_SH
  function evalResonance(hSource, hTarget) {
    const sinhDict = { "Thủy": "Mộc", "Mộc": "Hỏa", "Hỏa": "Thổ", "Thổ": "Kim", "Kim": "Thủy" };
    const khacDict = { "Thủy": "Hỏa", "Hỏa": "Kim", "Kim": "Mộc", "Mộc": "Thổ", "Thổ": "Thủy" };

    if (sinhDict[hSource] === hTarget) return 1.0;   // Nguồn sinh Đích (Hỗ trợ)
    if (hSource === hTarget) return 0.5;            // Tỷ hòa (Đồng khí)
    if (sinhDict[hTarget] === hSource) return -0.3;  // Đích sinh Nguồn (Tiết hao)
    if (khacDict[hTarget] === hSource) return -0.6;  // Đích khắc Nguồn (Chế ngự)
    if (khacDict[hSource] === hTarget) return -1.0;  // Nguồn khắc Đích (Xung sát tổn thương)
    return 0.0;
  }

  // 5. Chẩn đoán 1 Cung / Phương vị không gian
  function diagnoseSingleDirection(dia, spInfo, thien, hThien, tuong, isTk) {
    const hDia = spInfo.hanh;
    let status = "BÌNH";
    let score = 65;
    let shaTitle = null;
    let loanDau = [];
    let strategy = "Giữ gìn không gian sạch sẽ, thông thoáng tự nhiên.";
    let actions = ["Duy trì vệ sinh định kỳ, ánh sáng hài hòa."];

    if (tuong.includes("Bạch hổ")) {
      status = "CẦN HÓA GIẢI (CẤP 1)";
      score = 25;
      shaTitle = "Xung Sát Cơ Học & Góc Nhọn Kim Loại (Bạch Hổ)";
      loanDau = [
        "Góc nhọn công trình đối diện hướng thẳng vào mặt tiền (Phi đao sát)",
        "Đường lộ thẳng tắp đối diện cửa hoặc tường nhà (Thương sát)",
        "Cửa kim loại lâu ngày, đống sắt phế liệu hoặc khu vực phát sinh tiếng ồn cơ khí"
      ];
      strategy = "DÙNG THỦY TIẾT KIM (Hóa giải bằng dòng nước an tĩnh, tuyệt đối không dùng Hỏa đối kháng làm kích động khí trường).";
      actions = [
        "Đặt bình gốm miệng rộng chứa nước an tĩnh hoặc phong thủy luân tại cung vị.",
        "Sử dụng rèm cửa hoặc sơn điểm nhấn tông màu xanh lam đậm / đen để hấp thụ xung lực.",
        "Trồng hàng cây xanh lá tròn dày bên ngoài để phân tán trực xung của góc nhọn/con đường."
      ];
    } else if (tuong.includes("Đằng xà")) {
      status = "CẦN ĐIỀU TIẾT (CẤP 2)";
      score = 40;
      shaTitle = "Nhiễu Loạn Từ Trường & Dây Dẫn Rối (Đằng Xà)";
      loanDau = [
        "Hệ thống dây điện, cáp viễn thông chằng chịt trước tầm nhìn",
        "Đường ống dẫn khí/nước gấp khúc uốn lượn quanh khu vực",
        "Góc tối thiếu dương quang tự nhiên, góc chết tồn đọng bụi bặm"
      ];
      strategy = "DÙNG THỔ TIẾT HỎA & BỔ SUNG QUANG MINH DƯƠNG KHÍ.";
      actions = [
        "Bố trí vật phẩm gốm sứ dày, khối đá tự nhiên hoặc thạch anh vàng để ổn định trường năng lượng.",
        "Lắp thêm đèn chiếu sáng ánh sáng ấm (3000K), bật định kỳ để tăng cường dương khí.",
        "Rà soát lại toàn bộ hệ thống dây điện, gom vào ống gen bảo vệ gọn gàng."
      ];
    } else if (tuong.includes("Huyền vũ")) {
      status = "CẦN ĐIỀU TIẾT (CẤP 2)";
      score = 40;
      shaTitle = "Độ Ẩm Chân Tường & Thoát Nước Ngầm (Huyền Vũ)";
      loanDau = [
        "Cống rãnh hoặc đường thoát nước ngầm có dấu hiệu rò rỉ ẩm",
        "Góc chân tường bị ngấm ẩm, thiếu thông thoáng gió",
        "Cửa ngách, cửa sau bản lề chưa thật sự kín khít"
      ];
      strategy = "DÙNG MỘC HÚT THỦY & THÔNG GIÓ TỰ NHIÊN.";
      actions = [
        "Đặt các loại cây cảnh hút ẩm tốt và thanh lọc không khí: Cây Lưỡi Hổ, Trầu Bà Cột hoặc Lan Ý.",
        "Xử lý chống thấm chân tường và kiểm tra bảo dưỡng hệ thống thoát nước ngầm.",
        "Gia cố khóa chốt an toàn và kiểm tra gioăng cách âm, chắn bụi tại cửa sau."
      ];
    } else if (tuong.includes("Chu tước")) {
      status = "CẦN LƯU Ý (CẤP 3)";
      score = 45;
      shaTitle = "Bức Xạ Nhiệt & Tiếng Ồn Đối Diện (Chu Tước)";
      loanDau = [
        "Cột điện, trạm biến áp hoặc thiết bị tỏa nhiệt lớn ở tầm nhìn đối diện",
        "Khu vực tiếp giáp ngã ba, đường giao thông có tiếng còi xe thường xuyên",
        "Màu sơn tường quá chói chang kích động thị giác"
      ];
      strategy = "DÙNG THỔ TIẾT HỎA & NƯỚC AN TĨNH LÀM DỊU.";
      actions = [
        "Bố trí chậu gốm đá sa thạch kết hợp trồng cây thủy sinh lá to để cân bằng trường nhiệt.",
        "Lắp đặt cửa kính cách âm giảm chấn đối với hướng nhìn ra đường lớn/trạm điện.",
        "Điều chỉnh tông màu sơn tại khu vực này sang gam màu vàng kem nhạt dịu mắt."
      ];
    } else if (tuong.includes("Câu trận")) {
      status = "CẦN LƯU Ý (CẤP 3)";
      score = 50;
      shaTitle = "Ứ Trệ Dòng Khí & Kết Cấu Bề Mặt (Câu Trận)";
      loanDau = [
        "Bề mặt bờ tường có vết nứt chân chim do co ngót vật liệu",
        "Khu vực có vật liệu xây dựng hoặc đồ đạc ít sử dụng xếp đọng",
        "Nền đất hoặc chân móng có dấu hiệu lắng đọng cục bộ"
      ];
      strategy = "DÙNG KIM TIẾT THỔ & KHAI THÔNG KHÍ TRƯỜNG.";
      actions = [
        "Treo chuông gió đồng 6 ống rỗng phát âm thanh kim khí để tạo chuyển động không khí.",
        "Trám trét vết nứt chân chim trên tường và sơn mới đồng bộ bề mặt.",
        "Dọn dẹp vật dụng tồn đọng quanh chân móng để dòng khí lưu chuyển thông suốt."
      ];
    } else if (tuong.includes("Quý nhân")) {
      status = "ĐẠI CÁT";
      score = 95;
      strategy = "TÔN KÍNH TỤ KHÍ & KÍCH HOẠT QUÝ KHÍ.";
      actions = [
        "Thích hợp nhất để đặt bàn làm việc gia chủ, phòng khách hoặc bàn thờ Thần Phật/Gia tiên.",
        "Giữ gìn không gian tại đây luôn sạch sẽ, thoáng đãng, thơm tho.",
        "Trang trí tranh ảnh phong cảnh danh sơn hoặc biểu tượng trang trọng."
      ];
    } else if (tuong.includes("Thanh long")) {
      status = "ĐẠI CÁT";
      score = 95;
      strategy = "KÍCH HOẠT TÀI VỊ SINH KHÍ.";
      actions = [
        "Đặt két sắt, bàn thu ngân hoặc mở cửa sổ/cửa chính đón luồng khí tài lộc.",
        "Đặt cây cảnh phong thủy chiêu tài: Cây Kim Ngân, Kim Tiền phát triển tươi tốt.",
        "Bố trí đèn trang trí chiếu sáng rực rỡ vào buổi tối để kích tài."
      ];
    } else if (tuong.includes("Thái thường")) {
      status = "CÁT";
      score = 85;
      strategy = "DUY TRÌ GIA ĐẠO HỶ KHÁNH & ẤM CÚNG.";
      actions = [
        "Bố trí phòng ăn gia đình, bàn trà tiếp khách thân mật.",
        "Dự trữ lương thực, thực phẩm chất lượng cao, giữ không khí gia đình vui vẻ."
      ];
    } else if (tuong.includes("Thiên hợp") || tuong.includes("Lục hợp")) {
      status = "CÁT";
      score = 85;
      strategy = "GIA TĂNG KẾT NỐI HÔN NHÂN & CỬA NẺO THÔNG THOÁNG.";
      actions = [
        "Thích hợp làm phòng ngủ vợ chồng, cửa thông phòng chính.",
        "Bảo dưỡng bản lề, khóa cửa luôn trơn tru không phát ra tiếng cọt kẹt."
      ];
    }

    if (isTk) {
      status = "HẪNG HỤT KHÍ (TUẦN KHÔNG)";
      score = Math.min(score, 40);
      strategy = `BỔ KHUYẾT NGŨ HÀNH BẢN CUNG (${hDia}).`;
      actions.push(`Cung bị Không vong khiến năng lượng bị hụt; cần bổ sung vật phẩm thuộc hành ${hDia} hoặc thắp đèn định kỳ để tụ khí.`);
    }

    return {
      diaBan: dia,
      huong: spInfo.huong,
      shortHuong: spInfo.shortHuong,
      quai: spInfo.quai,
      batQuai: spInfo.quai,
      goc: spInfo.goc,
      azimuth: spInfo.azimuth,
      hanhCung: hDia,
      hanhDiaBan: hDia,
      thienBan: thien,
      hanhThienBan: hThien,
      thienTuong: tuong,
      isTuanKhong: isTk,
      statusLevel: status,
      score,
      shaTitle,
      loanDauSigns: loanDau,
      loanDauDauHieu: loanDau,
      remediationStrategy: strategy,
      practicalActions: actions
    };
  }

  // ==========================================================================
  // ĐỘNG CƠ ĐÁNH GIÁ PHONG THỦY TOÀN DIỆN
  // ==========================================================================
  const LucNhamFengShui = {
    SPATIAL_8_DIRECTIONS,
    TRACH_MO_MAP,
    tinhTuanKhong,
    evalResonance,

    /**
     * Phân tích & Luận đoán Phong Thủy Không Gian từ quẻ Lục Nhâm
     * @param {Object} chart Kết quả quẻ từ LucNhamEngine.lapQue
     * @param {Object} options { dwellingType: 'DUONG_TRACH'|'AM_TRACH', siteName: string, ownerName: string }
     */
    evaluate(chart, options = {}) {
      if (!chart) return null;
      const dwellingType = (options.dwellingType || "DUONG_TRACH").toUpperCase();
      const siteName = options.siteName || (dwellingType === "AM_TRACH" ? "Mộ Phần Tiên Tổ" : "Gia Trạch Cư Trú");
      const ownerName = options.ownerName || "Gia Chủ";

      const canNgay = chart.canNgay;
      const chiNgay = chart.chiNgay;
      const canHanh = NGU_HANH_CAN[canNgay] || "Thổ";
      const chiHanh = NGU_HANH_CHI[chiNgay] || "Thổ";

      // 1. Tứ Khóa
      const tuKhoa = chart.tuKhoa || [];
      const k1 = tuKhoa[0] || { thuong: "", ha: canNgay, quanHe: "" };
      const k2 = tuKhoa[1] || { thuong: "", ha: "", quanHe: "" };
      const k3 = tuKhoa[2] || { thuong: "", ha: chiNgay, quanHe: "" };
      const k4 = tuKhoa[3] || { thuong: "", ha: "", quanHe: "" };

      const k1Thuong = k1.thuong;
      const k3Thuong = k3.thuong;
      const k2Thuong = k2.thuong;
      const k4Thuong = k4.thuong;

      const k1ThuongHanh = NGU_HANH_CHI[k1Thuong] || "Thổ";
      const k3ThuongHanh = NGU_HANH_CHI[k3Thuong] || "Thổ";
      const k2ThuongHanh = NGU_HANH_CHI[k2Thuong] || "Thổ";
      const k4ThuongHanh = NGU_HANH_CHI[k4Thuong] || "Thổ";

      // 2. Chấm điểm tương thích Nhân - Trạch S_res [10, 100]
      const fBase = evalResonance(chiHanh, canHanh);
      const fTh13 = evalResonance(k3ThuongHanh, k1ThuongHanh);
      const fTh24 = evalResonance(k4ThuongHanh, k2ThuongHanh);

      const rawScore = 50 + (25 * fBase) + (15 * fTh13) + (10 * fTh24);
      const nhanTrachScore = Math.max(10, Math.min(100, Math.round(rawScore)));

      let nhanTrachType = "";
      let nhanTrachSummary = "";

      if (nhanTrachScore >= 85) {
        nhanTrachType = "TRẠCH SINH NHÂN";
        nhanTrachSummary = (dwellingType === "AM_TRACH")
          ? "Mạch đất sinh con cháu; tiên tổ phù hộ chở che, long mạch kết tụ dồi dào, con cháu đời sau xuất nhân tài đỗ đạt, gia đạo vinh hiển."
          : "Ngôi nhà tương sinh gia chủ; trạch vận vượng thịnh, bồi đắp sinh khí dồi dào, gia đạo bình an, xuất nhân tài tài lộc.";
      } else if (nhanTrachScore >= 70) {
        nhanTrachType = "NHÂN TRẠCH ĐỒNG KHÍ";
        nhanTrachSummary = (dwellingType === "AM_TRACH")
          ? "Phúc âm và con cháu đồng điệu, hài cốt yên ổn tĩnh tại; dòng họ thuận hòa, vận thế bình an vững chãi."
          : "Người và nhà tương hòa, khí trường ổn định; công việc làm ăn duy trì đều đặn, gia đình thuận hòa.";
      } else if (nhanTrachScore >= 55) {
        nhanTrachType = "NHÂN SINH TRẠCH";
        nhanTrachSummary = (dwellingType === "AM_TRACH")
          ? "Con cháu phải hao tâm tổn lực nhiều cho việc chăm sóc tôn tạo mộ phần; cần duy trì hương hỏa chu đáo."
          : "Gia chủ tiết hao sinh khí cho ngôi nhà; dễ phát sinh chi phí tôn tạo sửa chữa lớn hoặc bất động sản bị đọng vốn.";
      } else if (nhanTrachScore >= 40) {
        nhanTrachType = "NHÂN KHẮC TRẠCH";
        nhanTrachSummary = (dwellingType === "AM_TRACH")
          ? "Mộ địa có sự biến động xung quanh hoặc khó giữ nguyên hiện trạng lâu dài; cần gia cố cẩn trọng."
          : "Gia chủ áp chế được nhà nhưng trạch khí hay biến động, khó ở lâu bền, dễ thay đổi nơi cư trú.";
      } else {
        nhanTrachType = "TRẠCH KHẮC NHÂN";
        nhanTrachSummary = (dwellingType === "AM_TRACH")
          ? "Mạch đất nghịch khí đè nén con cháu; dưới huyệt có dấu hiệu xung sát hoặc ngập úng, con cháu dễ gặp trắc trở tai ách."
          : "Trạch đất nghịch khí đè nén gia chủ; người sống hay mắc bệnh lạ, tinh thần bất an, tổn hại nhân đinh và tài lộc.";
      }

      // 3. Tuần Không
      const tuanKhong = tinhTuanKhong(canNgay, chiNgay);

      // 4. Trạch Mộ & Lưỡng Tính
      const cung12 = chart.cung12 || {};
      const trachMoChi = TRACH_MO_MAP[chiNgay] || "Thìn";
      const cungMoDetail = cung12[trachMoChi] || {};
      const tuongMo = cungMoDetail.thienTuong || "Không";

      let moNature = "";
      let moDesc = "";
      if (["Thanh long", "Quý nhân", "Thái thường", "Lục hợp", "Thiên hợp"].some(c => tuongMo.includes(c))) {
        moNature = "TÀI KHỐ (Kho Tụ Khí Sinh Tài)";
        moDesc = `Cung Mộ ${trachMoChi} (${SPATIAL_8_DIRECTIONS[trachMoChi].huong}) đắc Cát tướng (${tuongMo}), là kho kín đáo tích trữ của cải, đất tụ khí lành, tài lộc bền vững.`;
      } else if (["Bạch hổ", "Huyền vũ", "Đằng xà", "Câu trận"].some(h => tuongMo.includes(h))) {
        moNature = "SÁT KHỐ (Ổ Uế Khí Ẩm Thấp)";
        moDesc = `Cung Mộ ${trachMoChi} (${SPATIAL_8_DIRECTIONS[trachMoChi].huong}) lâm Hung sát (${tuongMo}), là nơi tích tụ uế khí, ẩm mốc hoặc rác rưởi ngầm, cần xử lý dọn dẹp và chống thấm khẩn cấp.`;
      } else {
        moNature = "TĨNH KHỐ (Kho Lưu Trữ Tĩnh Khí)";
        moDesc = `Cung Mộ ${trachMoChi} (${SPATIAL_8_DIRECTIONS[trachMoChi].huong}) bình hòa, thích hợp bố trí phòng chứa đồ hoặc không gian tĩnh dưỡng.`;
      }

      const trachMoInfo = {
        cung: trachMoChi,
        huong: SPATIAL_8_DIRECTIONS[trachMoChi].huong,
        thienTuong: tuongMo,
        nature: moNature,
        yNghia: moDesc
      };

      // 5. Quét 12 cung / 8 Hướng
      const spatialDirections = [];
      const remediationPriorities = [];

      for (const dia of DIA_CHI) {
        const cung = cung12[dia] || {};
        const spInfo = SPATIAL_8_DIRECTIONS[dia];
        const thien = cung.thienBan || dia;
        const tuong = cung.thienTuong || "";
        const hThien = NGU_HANH_CHI[thien] || "Thổ";
        const isTk = tuanKhong.includes(dia);

        const diag = diagnoseSingleDirection(dia, spInfo, thien, hThien, tuong, isTk);
        spatialDirections.push(diag);

        if (diag.statusLevel.includes("HUNG") || diag.isTuanKhong) {
          remediationPriorities.push({
            huong: diag.huong,
            shortHuong: diag.shortHuong,
            diaBan: diag.diaBan,
            statusLevel: diag.statusLevel,
            shaTitle: diag.shaTitle,
            strategy: diag.remediationStrategy,
            actions: diag.practicalActions,
            urgency: diag.statusLevel.includes("CỰC HUNG") ? 1 : (diag.statusLevel.includes("HUNG") ? 2 : 3)
          });
        }
      }

      remediationPriorities.sort((a, b) => a.urgency - b.urgency);

      // 6. Cục Diện Toàn Thể
      const isPhucNgam = DIA_CHI.every(d => (cung12[d] ? cung12[d].thienBan === d : true));
      const isPhanNgam = DIA_CHI.every(d => {
        if (!cung12[d]) return false;
        const tbIdx = DIA_CHI.indexOf(cung12[d].thienBan);
        const dbIdx = DIA_CHI.indexOf(d);
        return ((tbIdx - dbIdx) % 12 + 12) % 12 === 6;
      });

      let cucDienTrach = "CHÍNH CỤC (Tuần Hoàn Bình Ổn): Khí trường lưu chuyển tương đối tự nhiên theo tiết lệnh.";
      if (isPhucNgam) {
        cucDienTrach = "PHỤC NGÂM TRẠCH (Bế Khí Trì Trệ): Khí trường toàn ngôi nhà bị đóng băng, ứ đọng; cần mở trục thông gió đối lưu (Cross-ventilation), lắp giếng trời hoặc quạt hút gió tươi.";
      } else if (isPhanNgam) {
        cucDienTrach = "PHẢN NGÂM TRẠCH (Xung Tán Động Động): Khí trường đối xung 180° dữ dội; tương ứng với thế xuyên tâm sát, gió thổi thốc phá tài; cần đặt bình phong và tiểu cảnh nước làm chậm dòng khí.";
      }

      // 7. Chẩn đoán chuyên sâu theo Loại Hình (Dương Trạch vs Âm Trạch)
      let functionalNodes = [];
      let graveDiagnostics = null;

      const tuongK3 = cung12[k3.ha]?.thienTuong || (cung12[chiNgay]?.thienTuong || "");
      const tuongK4 = cung12[k4.ha]?.thienTuong || "";
      const cungLucHop = spatialDirections.find(c => c.thienTuong.includes("Thiên hợp") || c.thienTuong.includes("Lục hợp"));
      const cungThanhLong = spatialDirections.find(c => c.thienTuong.includes("Thanh long"));

      if (dwellingType === "AM_TRACH") {
        // Chiêm Mộ Pháp (Ngự Định Lục Nhâm Trực Chỉ)
        const graveWarnings = [];
        const graveActions = [];

        if (k4ThuongHanh === "Thủy" || tuongK4.includes("Huyền vũ") || tuongK4.includes("Thiên hậu")) {
          graveWarnings.push({
            type: "THỦY SÁT XÂM HUYỆT (Nước Ngập Hài Cốt)",
            detail: `Khóa IV mang hành Thủy (${k4Thuong}) và lâm Thần ${tuongK4 || 'Thủy uế'}. Dấu hiệu dưới đáy kim tĩnh có mạch nước ngầm rò rỉ hoặc nước mưa ứ đọng quanh quan quách, khiến xương cốt bị ngâm lạnh, con cháu hay mắc bệnh thận, phù nề, hoặc hao tài tán của.`,
            actions: [
              "Đào rãnh thoát nước ngầm hình chữ U quanh khuôn viên lăng mộ để chuyển hướng dòng nước mặt và nước ngầm.",
              "Nâng cao nền minh đường phía trước mộ và đắp đất sét xỉ than cách ẩm quanh thành mộ."
            ]
          });
        }

        if (k4ThuongHanh === "Mộc" || tuongK4.includes("Đằng xà")) {
          graveWarnings.push({
            type: "MỘC SÁT ĐÂM HUYỆT (Rễ Cây Xuyên Cốt)",
            detail: `Khóa IV mang Thần ${tuongK4 || 'Đằng xà'} hoặc Mộc khí (${k4Thuong}). Dấu hiệu có rễ cây cổ thụ hoặc cây rễ cọc gần đó đang ăn luồn xuyên vào lòng đất đâm vào mộ; con cháu dễ bị các chứng bệnh về xương khớp mãn tính, tê liệt thần kinh co giật.`,
            actions: [
              "Tiến hành đào hào cách ly rễ cây (Root barrier) sâu 1.2m quanh tường bao lăng mộ và chặt rễ lớn.",
              "Thay thế các loại cây lấy bóng mát rễ cọc bằng thảm cỏ lá lạc hoặc cây rễ chùm nông."
            ]
          });
        }

        if (tuongK4.includes("Bạch hổ") || k4ThuongHanh === "Kim") {
          graveWarnings.push({
            type: "KIM SÁT TỔN HÀI CỐT (Bạch Hổ Đè Huyệt)",
            detail: `Khóa IV gặp Kim sát (${k4Thuong}) hoặc Bạch Hổ. Dấu hiệu trong lòng đất có đá ngầm sắc nhọn đè lên quan hoặc đất bị chấn động cơ khí, con cháu dễ gặp tai nạn xe cộ, thương tật huyết quang.`,
            actions: [
              "Đặt bình gốm chứa nước an tĩnh tại phương vị để tiết giảm Kim sát ('Dĩ Thủy Tiết Kim')."
            ]
          });
        }

        if (graveWarnings.length === 0) {
          graveWarnings.push({
            type: "ĐÁY HUYỆT AN LÀNH (Đắc Địa Tụ Khí)",
            detail: `Khóa IV (${k4Thuong} gia ${k4.ha} - Tướng ${tuongK4 || 'Bình ổn'}) bình hòa, lòng đất khô ráo, không bị rễ cây hay mạch nước lạnh xâm lấn, xương cốt được ấm áp bảo bọc.`,
            actions: ["Duy trì cảnh quan tôn nghiêm, thắp hương và dọn dẹp khuôn viên định kỳ."]
          });
        }

        graveDiagnostics = {
          graveWarnings,
          graveActions,
          longMachMinhDuong: `Khóa III (${k3Thuong} gia ${k3.ha} - Tướng ${tuongK3 || '---'}): Biểu thị hình thế bia mộ, gò đồi, bao trần và minh đường bên ngoài.`
        };

        functionalNodes = [
          {
            name: "Hậu Nhân & Dòng Họ (Khóa I & II)",
            assessment: `Khóa I (${k1Thuong}/${k1.ha}) biểu thị vận mạng của người Trưởng tộc/Đích tôn; Khóa II (${k2Thuong}/${k2.ha}) biểu thị các chi thứ và gia quyến.`
          },
          {
            name: "Bia Mộ & Gò Đồi (Khóa III)",
            assessment: `Hình thế nấm mộ, bia đá và long mạch vây quanh huyệt: ${k3Thuong} gia ${k3.ha} (${k3.quanHe}).`
          },
          {
            name: "Đáy Kim Tĩnh (Khóa IV)",
            assessment: graveWarnings.map(w => `${w.type}: ${w.detail}`).join(" ")
          },
          {
            name: "Trạch Mộ Âm Phần",
            assessment: `${trachMoInfo.yNghia} (${trachMoInfo.nature}).`
          }
        ];
      } else {
        // Dương Trạch
        functionalNodes = [
          {
            name: "Môn Hộ (Cửa Chính - Khí Khẩu)",
            assessment: `Cửa chính đón khí chịu sự chi phối của Khóa III (${k3Thuong}/${k3.ha}) và Thần Lục Hợp tại cung ${cungLucHop ? cungLucHop.diaBan : 'Trung'}. ${cungLucHop && !cungLucHop.statusLevel.includes('HUNG') ? 'Lục Hợp đắc vị giúp cửa nẻo thông thoáng, đón nhận khách quý và hòa khí.' : 'Cửa chính đối diện luồng khí bất lợi, cần đặt bình phong hoặc rèm che.'}`
          },
          {
            name: "Tài Vị & Phòng Làm Việc (Tụ Tiền Tài)",
            assessment: `Vị trí vượng khí nhất là cung ${cungThanhLong ? cungThanhLong.diaBan : 'Dần'} (Hướng ${cungThanhLong ? cungThanhLong.huong : 'Đông Bắc'}) tọa thủ Thanh Long. Đây là điểm tụ tài đắc lực, kiến nghị đặt két sắt, bàn làm việc hoặc phong thủy luân kích hoạt tài khí.`
          },
          {
            name: "Trạch Mộ (Góc Khuất & Âm Khí)",
            assessment: `${trachMoInfo.yNghia} Cung Mộ mang tính chất: ${trachMoInfo.nature}.`
          }
        ];
      }

      const result = {
        dwellingType,
        siteName,
        ownerName,
        canChiNgay: `${canNgay} ${chiNgay}`,
        chiGio: chart.chiGio,
        nguyetTuong: chart.nguyetTuong,
        isDaytime: chart.isDaytime,
        nhanTrachType,
        nhanTrachScore,
        nhanTrachSummary,
        cucDienTrach,
        tuanKhong,
        trachMo: trachMoInfo,
        spatialDirections,
        remediationPriorities,
        functionalNodes,
        graveDiagnostics,
        tamTruyen: {
          soTruyen: {
            chi: chart.soTruyen?.chi || "",
            tuong: chart.soTruyen?.thienTuong || "",
            yNghia: (dwellingType === "AM_TRACH")
              ? "Gốc rễ phần mộ: Thời điểm táng/cải táng tiên tổ, nguồn gốc đất nghĩa trang."
              : "Gốc rễ trạch vận: Khởi đầu lúc mua/xây, nguyên nhân cốt lõi phát sinh hiện trạng."
          },
          trungTruyen: {
            chi: chart.trungTruyen?.chi || "",
            tuong: chart.trungTruyen?.thienTuong || "",
            yNghia: (dwellingType === "AM_TRACH")
              ? "Diễn tiến khí trường: Sự tương tác giữa mạch đất với đời con cháu hiện thời."
              : "Diễn biến thực tế: Sự tương tác giữa các thành viên và ngôi nhà trong giai đoạn hiện tại."
          },
          matTruyen: {
            chi: chart.matTruyen?.chi || "",
            tuong: chart.matTruyen?.thienTuong || "",
            yNghia: (dwellingType === "AM_TRACH")
              ? "Phúc ấm trường tồn: Tác động sâu xa của mộ địa đối với các thế hệ tương lai."
              : "Hậu vận lâu dài: Tác động bền vững của trạch đất đối với đời con cháu."
          }
        }
      };

      result.markdownSummary = formatMarkdownReport(result);
      result.markdownEssay = export8LayerEssay(result, options);
      return result;
    },
    formatMarkdownReport: formatMarkdownReport,
    export8LayerEssay: export8LayerEssay,
    evaluateTrachCat: evaluateTrachCat,
    buildAIPromptForFengShui: buildAIPromptForFengShui
  };

  const TAM_SAT_MAP = {
    "Thân": ["Tỵ", "Ngọ", "Mùi"], "Tý": ["Tỵ", "Ngọ", "Mùi"], "Thìn": ["Tỵ", "Ngọ", "Mùi"],
    "Dần": ["Hợi", "Tý", "Sửu"], "Ngọ": ["Hợi", "Tý", "Sửu"], "Tuất": ["Hợi", "Tý", "Sửu"],
    "Hợi": ["Thân", "Dậu", "Tuất"], "Mão": ["Thân", "Dậu", "Tuất"], "Mùi": ["Thân", "Dậu", "Tuất"],
    "Tỵ": ["Dần", "Mão", "Thìn"], "Dậu": ["Dần", "Mão", "Thìn"], "Sửu": ["Dần", "Mão", "Thìn"]
  };

  const LUC_XUNG_MAP = {
    "Tý": "Ngọ", "Sửu": "Mùi", "Dần": "Thân", "Mão": "Dậu", "Thìn": "Tuất", "Tỵ": "Hợi",
    "Ngọ": "Tý", "Mùi": "Sửu", "Thân": "Dần", "Dậu": "Mão", "Tuất": "Thìn", "Hợi": "Tỵ"
  };

  function evaluateTrachCat(chart, targetChi, options = {}) {
    if (!chart) return null;
    const chiNam = options.chiNam || chart.chiNam || "Ngọ";
    const thaiTue = chiNam;
    const tuePha = LUC_XUNG_MAP[thaiTue] || "Tý";
    const tamSatList = TAM_SAT_MAP[chiNam] || [];

    const cung12 = chart.cung12 || {};
    const cungTarget = cung12[targetChi] || {};
    const thienTuong = cungTarget.thienTuong || "";
    const thienBan = cungTarget.thienBan || targetChi;

    const warnings = [];
    const blessings = [];
    let safetyScore = 80;

    // Kiểm tra Tam Sát
    if (tamSatList.includes(targetChi)) {
      warnings.push(`Phương vị ${targetChi} (${SPATIAL_8_DIRECTIONS[targetChi]?.huong}) phạm TAM SÁT của năm ${chiNam}. Cực kỳ kiêng kỵ động thổ, phá dỡ hoặc khoan đục tường tại cung này.`);
      safetyScore -= 35;
    }

    // Kiểm tra Thái Tuế & Tuế Phá
    if (targetChi === thaiTue) {
      warnings.push(`Cung ${targetChi} là vị trí THÁI TUẾ của năm ${chiNam}. "Đầu Thái Tuế không thể động thổ", chỉ nên tĩnh, không nên xáo trộn kết cấu.`);
      safetyScore -= 20;
    } else if (targetChi === tuePha) {
      warnings.push(`Cung ${targetChi} là vị trí TUẾ PHÁ (Xung Thái Tuế). Khí trường đối xung dữ dội, tuyệt đối không được động thổ hay cải táng vào năm này.`);
      safetyScore -= 30;
    }

    // Kiểm tra Bạch Hổ trong quẻ
    if (thienTuong.includes("Bạch hổ")) {
      warnings.push(`Phương vị này trong quẻ lâm BẠCH HỔ (Kim hung sát). Không được dùng nhiệt/đốt lửa hay đóng đinh cơ học bừa bãi, dễ gây thương tật huyết quang.`);
      safetyScore -= 25;
    } else if (thienTuong.includes("Đằng xà")) {
      warnings.push(`Phương vị này lâm ĐẰNG XÀ (Dây dưa, hoảng sợ). Cần dọn dẹp dây điện gọn gàng trước khi bài trí.`);
      safetyScore -= 10;
    }

    // Kiểm tra Cát Thần
    if (thienTuong.includes("Thanh long")) {
      blessings.push(`Đắc THANH LONG cát thần tọa thủ: Rất tốt cho việc an vị bàn làm việc, két sắt, hoặc kích hoạt tài vị.`);
      safetyScore += 15;
    }
    if (thienTuong.includes("Quý nhân")) {
      blessings.push(`Đắc QUÝ NHÂN quý thần tọa thủ: Mang lại hòa khí, có người nâng đỡ, thích hợp an vị bàn thờ hoặc không gian tĩnh.`);
      safetyScore += 15;
    }
    if (chart.nguyetTuong === thienBan) {
      blessings.push(`Đắc THÁI DƯƠNG (Nguyệt tướng ${chart.nguyetTuong}) quang minh chiếu rọi: Có khả năng chế ngự và hóa giải các hung sát nhỏ.`);
      safetyScore += 20;
    }
    if (thienTuong.includes("Lục hợp") || thienTuong.includes("Thiên hợp")) {
      blessings.push(`Đắc LỤC HỢP cát tướng: Hài hòa các mối quan hệ, thích hợp tu sửa cửa phòng, giao kết hòa hảo.`);
      safetyScore += 10;
    }

    safetyScore = Math.max(10, Math.min(100, safetyScore));

    const isSafe = (safetyScore >= 60 && !warnings.some(w => w.includes("TUẾ PHÁ") || w.includes("TAM SÁT")));

    return {
      targetChi,
      huong: SPATIAL_8_DIRECTIONS[targetChi]?.huong || targetChi,
      chiNam,
      thaiTue,
      tuePha,
      tamSatList,
      thienTuong,
      thienBan,
      isSafe,
      safetyScore,
      warnings,
      blessings,
      recommendedTiming: isSafe
        ? `Phương vị an toàn để tiến hành an vị vật phẩm hoặc chỉnh sửa nhỏ. Nên chọn ngày có Địa Chi sinh hợp với cung ${targetChi} hoặc giờ có Thanh Long/Quý Nhân.`
        : `Phương vị đang phạm hung sát nặng (Tam Sát / Tuế Phá / Bạch Hổ). Kiến nghị CHỜ THỜI ĐIỂM KHÁC hoặc chỉ áp dụng biện pháp tiết hóa tĩnh (như đặt bình nước an tĩnh dĩ Thủy tiết Kim), tuyệt đối không đập phá hay đào bới kết cấu.`
    };
  }

  function export8LayerEssay(rep, options = {}) {
    const isAm = (rep.dwellingType === "AM_TRACH");
    const siteName = rep.siteName || (isAm ? "Mộ Phần Tiên Tổ" : "Gia Trạch Cư Trú");
    const ownerName = rep.ownerName || "Gia Chủ";
    const dtypeTitle = isAm ? "ÂM TRẠCH (MỘ PHẦN TIÊN TỔ)" : "DƯƠNG TRẠCH (NHÀ Ở / CƯ TRÚ)";

    const md = [];
    md.push(`# BẢN LUẬN GIẢI CHUYÊN SÂU PHONG THỦY ĐỊA LÝ: ${dtypeTitle}`);
    md.push(`**Đối tượng thụ hưởng:** ${ownerName} | **Công trình:** ${siteName}`);
    md.push(`**Thời khắc chiêm nghiệm:** Ngày ${rep.canChiNgay} (Giờ ${rep.chiGio}) | **Nguyệt tướng:** ${rep.nguyetTuong} | **Chế độ:** ${rep.isDaytime ? 'Đán Quý (Ban ngày)' : 'Mộ Quý (Ban đêm)'}`);
    md.push(`\n---\n`);

    md.push(`## I. Tổng Quan Khởi Quẻ & Khí Vận Không Gian`);
    if (isAm) {
      md.push(`Khảo sát và Luận giải Âm trạch phong thủy cho phần mộ/lăng tẩm '${siteName}' thuộc dòng họ của ${ownerName}. Thời điểm chiêm nghiệm vào ngày ${rep.canChiNgay}, giờ ${rep.chiGio}, thừa hưởng sinh khí từ Nguyệt tướng ${rep.nguyetTuong}. Trong đạo Âm trạch, 'Khí thừa phong tắc tán, giới thủy tắc chỉ'; bàn quẻ Lục Nhâm vi mô hóa trọn vẹn từ long mạch gò đồi bên trên đến tình trạng hài cốt dưới đáy kim tĩnh.\n`);
    } else {
      md.push(`Chiêm nghiệm Dương trạch cho ${ownerName} tại công trình '${siteName}'. Thời khắc lập quẻ vào ngày ${rep.canChiNgay}, giờ ${rep.chiGio}, tiết lệnh thụ hưởng Nguyệt tướng ${rep.nguyetTuong}. Bàn quẻ xác lập mối tương quan giữa sinh khí con người đang cư ngụ và trường năng lượng không gian kiến trúc.\n`);
    }

    md.push(`## II. Tương Quan Bản Thể: Nhân - Trạch Tương Cầu`);
    if (isAm) {
      md.push(`Xét tương quan Phúc Ấm Hậu Duệ & Mộ Địa: Nhật Can đại diện cho Con cháu hậu duệ đang sống trên dương thế (đặc biệt là trưởng chi); Nhật Chi đại diện cho Phần mộ, thi hài và nơi yên nghỉ của tiên tổ. Tương quan đạt trạng thái: **${rep.nhanTrachType}** (Chỉ số bồi đắp phúc khí: **${rep.nhanTrachScore}/100** điểm). ${rep.nhanTrachSummary}\n`);
    } else {
      md.push(`Xét bản thể Nhân - Trạch: Nhật Can làm Bản thể Gia chủ; Nhật Chi làm Thực thể Ngôi nhà. Kết quả phân tích đạt trạng thái: **${rep.nhanTrachType}** với chỉ số tương thích sinh khí đạt **${rep.nhanTrachScore}/100** điểm. ${rep.nhanTrachSummary}\n`);
    }

    md.push(`## III. Bóc Tách Chi Tiết Tứ Khóa (Hiện Trạng Bề Mặt & Thế Giới Ngầm)`);
    if (isAm) {
      md.push(`Giải mã Tứ Khóa Âm Trạch:`);
      md.push(`- **Khóa I & II (Hậu Nhân):** Biểu thị vận mạng của người Trưởng tộc/Đích tôn và gia quyến các chi thứ.`);
      md.push(`- **Khóa III (Bia Mộ & Gò Đồi):** ${rep.graveDiagnostics ? rep.graveDiagnostics.longMachMinhDuong : 'Hình thế nấm mộ và minh đường bên ngoài.'}`);
      if (rep.graveDiagnostics && rep.graveDiagnostics.graveWarnings) {
        md.push(`- **Khóa IV (Đáy Kim Tĩnh):**`);
        for (const gw of rep.graveDiagnostics.graveWarnings) {
          md.push(`  + *${gw.type}*: ${gw.detail}`);
        }
      }
    } else {
      md.push(`Bóc tách Tứ Khóa kiến trúc:`);
      md.push(`- **Khóa I & II (Gia Đạo):** Khóa I phản ánh thần sắc, tinh thần của ${ownerName}; Khóa II phản ánh hòa khí gia quyến nội bộ.`);
      md.push(`- **Khóa III (Ngoại Cảnh & Cửa Chính):** Phản ánh trực diện mặt tiền, cửa chính và ngoại cảnh xung quanh ngôi nhà.`);
      md.push(`- **Khóa IV (Móng Ngầm & Ẩn Khí):** Phản ánh phần móng ngầm, góc khuất và các nguy cơ ẩm thấp ẩn tàng bên trong kết cấu.`);
    }
    md.push(`\n`);

    md.push(`## IV. Tiến Trình Vận Khí Theo Tam Truyền`);
    md.push(`- **Sơ truyền (${rep.tamTruyen.soTruyen.chi} - ${rep.tamTruyen.soTruyen.tuong}):** ${rep.tamTruyen.soTruyen.yNghia}`);
    md.push(`- **Trung truyền (${rep.tamTruyen.trungTruyen.chi} - ${rep.tamTruyen.trungTruyen.tuong}):** ${rep.tamTruyen.trungTruyen.yNghia}`);
    md.push(`- **Mạt truyền (${rep.tamTruyen.matTruyen.chi} - ${rep.tamTruyen.matTruyen.tuong}):** ${rep.tamTruyen.matTruyen.yNghia}\n`);

    md.push(`## V. Chẩn Đoán Trọng Điểm Công Trình & Điểm Nút Năng Lượng`);
    for (const node of rep.functionalNodes) {
      md.push(`### • ${node.name}`);
      md.push(`${node.assessment}\n`);
    }

    md.push(`## VI. Bản Đồ Năng Lượng Không Gian 8 Phương Vị (Cân Bằng Âm Dương)`);
    const vitality = rep.spatialDirections.filter(s => s.statusLevel.includes("CÁT"));
    const mitigation = rep.spatialDirections.filter(s => !s.statusLevel.includes("CÁT"));

    md.push(`### VI.1. Các Phương Vị Đắc Sinh Khí & Tụ Vượng Tài Lộc`);
    if (!vitality.length) {
      md.push(`> Các điểm cát tinh phân bổ đồng đều tại các khu vực phụ trợ.\n`);
    } else {
      md.push(`| Phương Vị | Cung Địa Bàn | Quẻ Bát Quái | Thiên Tướng Tọa Thủ | Cấp Độ | Điểm Sinh Khí |`);
      md.push(`| :--- | :---: | :---: | :---: | :---: | :---: |`);
      for (const v of vitality) {
        md.push(`| **${v.huong}** | ${v.diaBan} | ${v.batQuai} | **${v.thienTuong}** | \`${v.statusLevel}\` | ${v.score}/100 |`);
      }
      md.push(`\n`);
      for (const v of vitality) {
        md.push(`- **Phương vị ${v.huong} (Cung ${v.diaBan} - ${v.thienTuong}):**`);
        md.push(`  + *Ý nghĩa sinh khí*: ${v.remediationStrategy}`);
        if (v.practicalActions && v.practicalActions.length) {
          md.push(`  + *Phương án kích hoạt*: ${v.practicalActions.join('; ')}`);
        }
      }
      md.push(`\n`);
    }

    md.push(`### VI.2. Các Phương Vị Cần Lưu Ý Điều Tiết Kiến Trúc`);
    if (!mitigation.length) {
      md.push(`> Không phát hiện điểm xung sát đáng kể trên toàn bộ 8 phương vị.\n`);
    } else {
      for (const s of mitigation) {
        if (!s.statusLevel.includes("BÌNH")) {
          md.push(`#### • Phương Vị ${s.huong} (Cung ${s.diaBan} - Quẻ ${s.batQuai}) - Phân Loại: \`${s.statusLevel}\``);
          if (s.shaTitle) md.push(`- **Đặc điểm kiến trúc:** *${s.shaTitle}*`);
          md.push(`- **Nguyên lý chuyển hóa:** \`${s.remediationStrategy}\``);
          if (s.practicalActions && s.practicalActions.length) {
            md.push(`- **Giải pháp xử lý tiết hóa:**`);
            for (const act of s.practicalActions) {
              md.push(`  + ${act}`);
            }
          }
          md.push(`\n`);
        }
      }
    }

    md.push(`## VII. Đánh Giá Cục Diện Vĩ Mô`);
    md.push(`${rep.cucDienTrach}\n`);

    md.push(`## VIII. Kế Hoạch Hóa Giải Hành Động Toàn Diện (Actionable Blueprint)`);
    md.push(`1. **Nguyên tắc cốt lõi**: Kiên quyết tuân thủ nguyên lý **'Dĩ Tiết Vi Trọng, Hóa Sát Vi Quyền'**, chuyển hóa dòng năng lượng hung hãn thành sinh khí, tuyệt đối không dùng bạo lực đối xung ngũ hành.`);
    md.push(`2. **Thứ tự ưu tiên thi công**: Ưu tiên xử lý triệt để các cung vị mang cấp độ \`CỰC HUNG\` và \`HUNG\` trước (tiêu biểu như Bạch Hổ, Huyền Vũ ẩm thấp, rễ cây đâm mộ hoặc nước ngập kim tĩnh), sau đó mới tiến hành kích hoạt các cung tụ tài như Thanh Long, Quý Nhân.`);
    md.push(`3. **Kiểm tra nghiệm thu định kỳ**: Sau khi hoàn thành cải tạo/bài trí vật phẩm phong thủy trong 30 đến 45 ngày làm việc, cần kiểm tra lại đối lưu không khí, độ ẩm chân tường hoặc sự an tĩnh của mộ phần để bảo đảm kết quả bền vững.`);

    if (isAm && rep.graveDiagnostics && rep.graveDiagnostics.graveActions) {
      md.push(`\n## IX. Biện Pháp Kỹ Thuật Gia Cố & Tôn Tạo Mộ Phần Tiên Tổ`);
      for (const act of rep.graveDiagnostics.graveActions) {
        md.push(`- [ ] **Biện pháp khẩn cấp**: ${act}`);
      }
      md.push(`> **Lưu ý Trạch Cát khi thi công Âm Trạch**: Khi tiến hành đào đất, sửa bia hoặc cải táng, bắt buộc phải chọn ngày giờ có quẻ Lục Nhâm mang **Thái Dương, Thanh Long, Quý Nhân** bay đến tọa hướng mộ, và tuyệt đối tránh ngày giờ phạm **Thái Tuế, Tuế Phá, Tam Sát, Bạch Hổ**.`);
    }

    return md.join('\n');
  }

  function buildAIPromptForFengShui(narrativeData) {
    const essay = (narrativeData && narrativeData.markdownEssay) ? narrativeData.markdownEssay : "";
    return `Bạn là Tổng Biên Tập Học Thuật kiêm Chuyên Gia Cao Cấp về Phong Thủy Địa Lý và Đại Lục Nhâm Thần Khóa.
Dưới đây là Dữ Liệu Chẩn Đoán Phong Thủy Không Gian 8 Hướng được tính toán tất định theo phương pháp cổ truyền:

${essay}

HÃY THỰC HIỆN BIÊN TẬP VÀ HOÀN THIỆN BÀI LUẬN NÀY THEO CÁC NGUYÊN TẮC:
1. TUÂN THỦ NGHIÊM NGẶT RULE 9: Văn phong hành chính - kỹ thuật chuẩn mực, khách quan, định lượng, bám sát chứng cứ. TUYỆT ĐỐI NGHIÊM CẤM từ ngữ cảm tính, phóng đại, giật gân, quảng cáo.
2. TUÂN THỦ NGHIÊM NGẶT RULE 12 (ZERO-FABRICATION): Bảo toàn 100% các số liệu điểm số, phương vị, cung địa bàn, thiên tướng và chiến lược tiết hóa trong dữ liệu gốc. Tuyệt đối không tự bịa thêm sát khí hay đổi ngược kết luận cát/hung.
3. CẤU TRÚC 8 TẦNG HOÀN CHỈNH: Giữ nguyên cấu trúc các đề mục I đến VIII (và IX nếu là Âm Trạch). Trình bày mạch lạc, sâu sắc, định hướng kiến trúc bền vững, hài hòa thiên nhiên và khoa học không gian.`;
  }

  function formatMarkdownReport(rep) {
    const isAm = (rep.dwellingType === "AM_TRACH");
    const lines = [];
    lines.push(`# BÁO CÁO CHẨN ĐOÁN PHONG THỦY ĐẠI LỤC NHÂM (${isAm ? 'ÂM TRẠCH CHIÊM MỘ' : 'DƯƠNG TRẠCH CƯ TRÚ'})`);
    lines.push(`**Thời điểm lập quẻ:** Ngày ${rep.canChiNgay} · Giờ ${rep.chiGio} · Nguyệt tướng: ${rep.nguyetTuong}`);
    lines.push(`**Điểm số dung lượng khí trường:** ${rep.nhanTrachScore}/100`);
    lines.push(`\n## 1. TỔNG QUAN TƯƠNG QUAN NHÂN - TRẠCH`);
    lines.push(`- **Thể loại tương tác:** ${rep.nhanTrachType}`);
    lines.push(`- **Luận đoán:** ${rep.nhanTrachSummary}`);
    lines.push(`- **Cục diện trạch khí:** ${rep.cucDienTrach}`);
    lines.push(`- **Trạch Mộ:** Cung ${rep.trachMo.cung} (${rep.trachMo.huong}) · Lâm ${rep.trachMo.thienTuong} (${rep.trachMo.nature}) - ${rep.trachMo.yNghia}`);
    lines.push(`- **Tuần Không:** ${rep.tuanKhong.join(', ') || 'Không có'}`);

    lines.push(`\n## 2. MA TRẬN 8 HƯỚNG LA KINH`);
    for (const d of rep.spatialDirections) {
      lines.push(`### 🧭 ${d.huong} (${d.batQuai} - ${d.hanhDiaBan}) [${d.goc}] - ${d.statusLevel}`);
      lines.push(`- Địa bàn ${d.diaBan} · Thiên bàn ${d.thienBan} (${d.hanhThienBan}) · Thần tướng: ${d.thienTuong}${d.isTuanKhong ? ' [TUẦN KHÔNG]' : ''}`);
      if (d.shaTitle) lines.push(`- **Cảnh báo sát khí:** ${d.shaTitle}`);
      if (d.loanDauDauHieu && d.loanDauDauHieu.length) {
        lines.push(`- **Dấu hiệu thực địa:** ${d.loanDauDauHieu.join('; ')}`);
      }
      lines.push(`- **Biện pháp tiết hóa:** ${d.remediationStrategy}`);
      if (d.practicalActions && d.practicalActions.length) {
        lines.push(`- **Hành động thực thi:** ${d.practicalActions.join('; ')}`);
      }
    }

    if (isAm && rep.graveDiagnostics) {
      lines.push(`\n## 3. CHẨN ĐOÁN CHIÊM MỘ & ĐÁY KIM TĨNH`);
      lines.push(`- **Thế đất & Minh đường:** ${rep.graveDiagnostics.longMachMinhDuong}`);
      for (const w of rep.graveDiagnostics.graveWarnings) {
        lines.push(`- **${w.type}:** ${w.detail}`);
        if (w.actions && w.actions.length) lines.push(`  + Xử lý: ${w.actions.join('; ')}`);
      }
    } else {
      lines.push(`\n## 3. CÁC NÚT ĐIỂM CHỨC NĂNG DƯƠNG TRẠCH`);
      for (const fn of rep.functionalNodes) {
        lines.push(`- **${fn.name}:** ${fn.assessment}`);
      }
    }

    lines.push(`\n## 4. TIẾN TRÌNH TAM TRUYỀN`);
    lines.push(`- **Sơ truyền (${rep.tamTruyen.soTruyen.chi} - ${rep.tamTruyen.soTruyen.tuong}):** ${rep.tamTruyen.soTruyen.yNghia}`);
    lines.push(`- **Trung truyền (${rep.tamTruyen.trungTruyen.chi} - ${rep.tamTruyen.trungTruyen.tuong}):** ${rep.tamTruyen.trungTruyen.yNghia}`);
    lines.push(`- **Mạt truyền (${rep.tamTruyen.matTruyen.chi} - ${rep.tamTruyen.matTruyen.tuong}):** ${rep.tamTruyen.matTruyen.yNghia}`);

    lines.push(`\n## 5. DANH MỤC ƯU TIÊN TIẾT HÓA THỰC THI`);
    for (const [idx, item] of rep.remediationPriorities.entries()) {
      lines.push(`**#${idx + 1}. ${item.huong} (Cung ${item.diaBan}) - Cấp độ ${item.urgency}:**`);
      if (item.shaTitle) lines.push(`- Sát khí: ${item.shaTitle}`);
      lines.push(`- Chiến lược: ${item.strategy}`);
      if (item.actions && item.actions.length) lines.push(`- Thao tác: ${item.actions.join('; ')}`);
    }

    return lines.join('\n');
  }

  // Export
  global.LucNhamFengShui = LucNhamFengShui;
  if (global.LucNhamEngine) {
    global.LucNhamEngine.FengShui = LucNhamFengShui;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = LucNhamFengShui;
  }
})(typeof window !== 'undefined' ? window : globalThis);
