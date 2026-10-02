/**
 * lucnham_mobile_engine.js
 * ĐỘNG CƠ LUẬN GIẢI CHUYÊN SÂU LỤC NHÂM ĐẠI ĐỘN - BẢN DI ĐỘNG 100% OFFLINE
 * Không phụ thuộc thư viện ngoài (Zero Dependency), chạy mượt trên mọi WebView di động, trình duyệt và Flutter Asset.
 * Tích hợp trọn vẹn 7 Tầng Luận Giải Kinh Điển & 100 Câu Tất Pháp Phú (Thiệu Ngạn Hòa).
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LucNhamMobileEngine = factory(); root.NetaLucNhamInterpreter = root.LucNhamMobileEngine;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // =========================================================================
  // 1. HẰNG SỐ NGUYÊN TẮC CỔ ĐIỂN
  // =========================================================================
  const DIA_CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
  const THIEN_CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];

  const NGU_HANH_CAN = {
    "Giáp": "Mộc", "Ất": "Mộc",
    "Bính": "Hỏa", "Đinh": "Hỏa",
    "Mậu": "Thổ", "Kỷ": "Thổ",
    "Canh": "Kim", "Tân": "Kim",
    "Nhâm": "Thủy", "Quý": "Thủy"
  };

  const NGU_HANH_CHI = {
    "Hợi": "Thủy", "Tý": "Thủy",
    "Dần": "Mộc", "Mão": "Mộc",
    "Tỵ": "Hỏa", "Ngọ": "Hỏa",
    "Thân": "Kim", "Dậu": "Kim",
    "Thìn": "Thổ", "Tuất": "Thổ", "Sửu": "Thổ", "Mùi": "Thổ"
  };

  const NGU_HANH_SINH = { "Mộc": "Hỏa", "Hỏa": "Thổ", "Thổ": "Kim", "Kim": "Thủy", "Thủy": "Mộc" };
  const NGU_HANH_KHAC = { "Mộc": "Thổ", "Thổ": "Thủy", "Thủy": "Hỏa", "Hỏa": "Kim", "Kim": "Mộc" };

  const TRUONG_SINH_12 = [
    "Trường sinh", "Mộc dục", "Quan đới", "Lâm quan",
    "Đế vượng", "Suy", "Bệnh", "Tử",
    "Mộ", "Tuyệt", "Thai", "Dưỡng"
  ];

  const TRUONG_SINH_START = {
    "Mộc": "Hợi",
    "Hỏa": "Dần",
    "Thổ": "Thân",
    "Kim": "Tỵ",
    "Thủy": "Thân"
  };

  const VUONG_SUY_TU_THOI = {
    "Xuân": { "Mộc": "Vượng", "Hỏa": "Tướng", "Thủy": "Hưu", "Kim": "Tù", "Thổ": "Tử" },
    "Hạ":   { "Hỏa": "Vượng", "Thổ": "Tướng", "Mộc": "Hưu", "Thủy": "Tù", "Kim": "Tử" },
    "Thu":  { "Kim": "Vượng", "Thủy": "Tướng", "Thổ": "Hưu", "Hỏa": "Tù", "Mộc": "Tử" },
    "Đông": { "Thủy": "Vượng", "Mộc": "Tướng", "Kim": "Hưu", "Thổ": "Tù", "Hỏa": "Tử" },
    "Tứ Quý": { "Thổ": "Vượng", "Kim": "Tướng", "Hỏa": "Hưu", "Mộc": "Tù", "Thủy": "Tử" }
  };

  const THIEN_TUONG_DAC_HAM = {
    "Quý Nhân": { dac: ["Sửu", "Mùi", "Hợi", "Tý"], ham: ["Thìn", "Tuất", "Ngọ", "Tỵ"], desc_dac: "Minh đức hiển hách, quan trợ phúc dày", desc_ham: "Quý nhân thất thế hoặc bị che mờ" },
    "Thanh Long": { dac: ["Dần", "Mão", "Thìn", "Tý"], ham: ["Thân", "Dậu", "Tuất"], desc_dac: "Tài lộc hưng vượng, hỷ khí ngập tràn", desc_ham: "Rồng sa nước cạn, hao tài thất thoát" },
    "Bạch Hổ": { dac: ["Thân", "Dậu", "Tuất"], ham: ["Dần", "Mão", "Tỵ", "Ngọ"], desc_dac: "Hổ gầm uy dũng, nắm quyền sát phạt", desc_ham: "Hung bạo thương vong, họa huyết quang lao lý" },
    "Huyền Vũ": { dac: ["Hợi", "Tý", "Sửu"], ham: ["Tỵ", "Ngọ", "Thìn", "Tuất"], desc_dac: "Mưu trí sâu xa, tình báo kín kẽ", desc_ham: "Đạo tặc lừa gạt, thất thoát ngầm" },
    "Chu Tước": { dac: ["Tỵ", "Ngọ", "Dần"], ham: ["Hợi", "Tý", "Thân", "Dậu"], desc_dac: "Văn thư minh bạch, thi cử bảng vàng", desc_ham: "Khẩu thiệt thị phi, công văn bức bách" },
    "Lục Hợp": { dac: ["Mão", "Dần", "Hợi"], ham: ["Thân", "Dậu", "Tỵ"], desc_dac: "Giao kết hòa hợp, hôn nhân thành toàn", desc_ham: "Hợp mà sinh oán, dây dưa không dứt" },
    "Đằng Xà": { dac: ["Tỵ", "Ngọ"], ham: ["Hợi", "Tý", "Thân", "Dậu"], desc_dac: "Biến hóa thần tốc, ứng phó linh hoạt", desc_ham: "Kinh sợ quái dị, ác mộng bất an" },
    "Thái Thường": { dac: ["Mùi", "Sửu", "Ngọ"], ham: ["Tý", "Hợi", "Dần"], desc_dac: "Yến tiệc thăng quan, áo gấm về làng", desc_ham: "Tửu sắc hao tài, quan hệ hình thức" },
    "Câu Trận": { dac: ["Thìn", "Tuất", "Sửu", "Mùi"], ham: ["Dần", "Mão"], desc_dac: "Trấn thủ kiên cố, đất đai vững vàng", desc_ham: "Trì trệ bế tắc, tranh chấp điền sản" },
    "Thiên Không": { dac: ["Tuất", "Hợi"], ham: ["Tỵ", "Ngọ", "Thìn"], desc_dac: "Thoát tục ngộ đạo, thanh cao hư tĩnh", desc_ham: "Hư dối giả tạo, lời hứa gió bay" }
  };

  // =========================================================================
  // 2. BỘ 100 ĐIỆU TẤT PHÁP PHÚ (TỪ ĐIỂN CHUẨN THIỆU NGẠN HÒA)
  // =========================================================================
  const TAT_PHAP_PHU_100 = [
    {
        "index": 1,
        "han_tu": "前后引从升迁位",
        "phien_am": "Tiền hậu dẫn tòng thăng thiên vị",
        "y_nghia": "Can hoặc Chi được hai thần cát trước sau nâng đỡ dẫn lối (ví dụ Quý nhân dẫn trước, Thanh Long theo sau).",
        "chi_dan": "Điềm báo thăng quan tiến chức, đổi việc lên chức vị cao hơn, được cấp trên và quý nhân nâng đỡ toàn diện."
    },
    {
        "index": 2,
        "han_tu": "首尾相向事益佳",
        "phien_am": "Thủ vĩ tương hướng sự ích giai",
        "y_nghia": "Sơ truyền và Mạt truyền tương sinh hoặc tương hợp ăn ý chặt chẽ.",
        "chi_dan": "Đầu đuôi tương ứng, việc trước việc sau kết hợp hài hòa, khởi đầu thuận lợi và kết thúc viên mãn."
    },
    {
        "index": 3,
        "han_tu": "两贵相伴捧使称",
        "phien_am": "Lưỡng quý tương ban bổng sứ xưng",
        "y_nghia": "Trong bàn quẻ cả Trú Quý và Dạ Quý cùng chiếu về Can Chi hoặc Tam Truyền.",
        "chi_dan": "Được hai tầng quý nhân phò trợ, việc khó hóa dễ, ra ngoài gặp may mắn, công danh hanh thông."
    },
    {
        "index": 4,
        "han_tu": "贵则官灾贱则病",
        "phien_am": "Quý tắc quan tai tiện tắc bệnh",
        "y_nghia": "Quan Quỷ phát động tại Sơ truyền lại đới Bạch Hổ hoặc Chu Tước khắc Can ngày.",
        "chi_dan": "Kẻ quyền quý thì mắc tai họa quan trường, thanh tra kỷ luật; người bình dân thì lâm trọng bệnh, hao tán."
    },
    {
        "index": 5,
        "han_tu": "冲刑煞害战难定",
        "phien_am": "Xung hình sát hại chiến nan định",
        "y_nghia": "Tam truyền và Tứ khóa giao nhau toàn là tương xung, tương hình, tương hại dồn dập.",
        "chi_dan": "Nội bộ phân tranh quyết liệt, đối thủ tranh đoạt gay gắt, tình thế chao đảo chưa thể phân định thắng bại."
    },
    {
        "index": 6,
        "han_tu": "败虚刑克风多漏",
        "phien_am": "Bại hư hình khắc phong đa lậu",
        "y_nghia": "Chi ngày và Trạch thần gặp đất Bại địa, Tử Tuyệt hoặc rơi vào Tuần Không.",
        "chi_dan": "Gia trạch hao tài tốn của, nội bộ lục đục, tiền bạc thất thoát như gió lọt qua khe cửa trống."
    },
    {
        "index": 7,
        "han_tu": "坐宝朝拔百事安",
        "phien_am": "Tọa bảo triêu bạt bách sự an",
        "y_nghia": "Can lâm Thiên Lộc, Chi lâm Quý Nhân, Tam truyền tương sinh hộ mệnh.",
        "chi_dan": "Vững vàng như kiềng ba chân, tài sản tích lũy an ổn, trăm việc mưu cầu đều có chỗ dựa vững chắc."
    },
    {
        "index": 8,
        "han_tu": "八专恋妻禄他人",
        "phien_am": "Bát chuyên luyến thê lộc tha nhân",
        "y_nghia": "Quẻ Bát Chuyên, Can Chi đồng cung, âm dương quấn quýt hỗn tạp.",
        "chi_dan": "Đắm đuối trong tư tình hoặc ham vui hưởng lạc mà bỏ bê sự nghiệp, tài lộc dễ rơi vào tay người khác."
    },
    {
        "index": 9,
        "han_tu": "伏吟自刑事阻隔",
        "phien_am": "Phục ngâm tự hình sự trở cách",
        "y_nghia": "Quẻ Phục Ngâm, Thiên Địa Bàn trùng vị, các hào tự hình nhau.",
        "chi_dan": "Bế tắc nội bộ, tự mình ràng buộc chính mình, tiến thoái lưỡng nan, dĩ tĩnh chế động mới an toàn."
    },
    {
        "index": 10,
        "han_tu": "反吟反复事难圆",
        "phien_am": "Phản ngâm phản phúc sự nan viên",
        "y_nghia": "Quẻ Phản Ngâm, Thiên Địa Bàn đối xung 180 độ.",
        "chi_dan": "Sự việc biến động đảo lộn dồn dập, đi rồi lại về điểm xuất phát, việc khó thành toàn trọn vẹn."
    },
    {
        "index": 11,
        "han_tu": "进退连茹吉凶殊",
        "phien_am": "Tiến thoái liên châu cát hung thù",
        "y_nghia": "Tam truyền liên tiếp bước tới (Tiến liên châu) hoặc lùi bước (Thoái liên châu).",
        "chi_dan": "Tiến liên châu thì chủ động mở mang phát triển; Thoái liên châu thì nên biết đủ mà dừng lại giữ mình."
    },
    {
        "index": 12,
        "han_tu": "网罗密布难解脱",
        "phien_am": "Võng la mật bố nan giải thoát",
        "y_nghia": "Thìn (Thiên La) hoặc Tuất (Địa Võng) lâm vào Can thượng hoặc Sơ truyền.",
        "chi_dan": "Rơi vào lưới vây hãm, vướng mắc pháp lý, bị hợp đồng hoặc tình thế trói buộc chặt chẽ khó thoát."
    },
    {
        "index": 13,
        "han_tu": "鬼临身发祸非浅",
        "phien_am": "Quỷ lâm thân phát họa phi thiển",
        "y_nghia": "Quan Quỷ phát động tại Sơ truyền khắc thẳng vào Can ngày.",
        "chi_dan": "Tai họa giáng xuống đầu, áp lực công việc hoặc bệnh tật dồn dập, đối thủ tấn công trực diện."
    },
    {
        "index": 14,
        "han_tu": "空亡陷入事无成",
        "phien_am": "Không vong hãm nhập sự vô thành",
        "y_nghia": "Sơ truyền hoặc Mạt truyền rơi đúng vào Tuần Không.",
        "chi_dan": "Đầu voi đuôi chuột, bánh vẽ hảo huyền, mưu cầu uổng phí tâm cơ, có tiếng không có miếng."
    },
    {
        "index": 15,
        "han_tu": "虎衔刀剑杀气腾",
        "phien_am": "Hổ hàm đao kiếm sát khí đằng",
        "y_nghia": "Bạch Hổ đồng cung với Kình Dương tại Sơ truyền hoặc Can thượng.",
        "chi_dan": "Sát khí tột bậc, đề phòng tai nạn huyết quang, giải phẫu dao kéo, xô xát bạo lực hoặc án phạt."
    },
    {
        "index": 16,
        "han_tu": "禄马交驰发万金",
        "phien_am": "Lộc mã giao trì phát vạn kim",
        "y_nghia": "Thiên Lộc đồng hội cùng Dịch Mã tại Can thượng hoặc Tam truyền.",
        "chi_dan": "Càng di chuyển, xuất ngoại hoặc công tác xa càng phát tài lớn; lợi nhuận kinh doanh tăng vọt."
    },
    {
        "index": 17,
        "han_tu": "福德临身解万灾",
        "phien_am": "Phúc đức lâm thân giải vạn tai",
        "y_nghia": "Can Thượng Thần là Tử Tôn hào của Can Ngày.",
        "chi_dan": "Có phúc tinh che chở, gặp dữ hóa lành, người đau ốm gặp thầy thuốc giỏi, tiêu trừ tai ách."
    },
    {
        "index": 18,
        "han_tu": "官转生印印生身",
        "phien_am": "Quan chuyển sinh ấn ấn sinh thân",
        "y_nghia": "Sơ truyền là Quan Quỷ, Trung truyền là Phụ Mẫu (Ấn) hóa sát sinh Thân.",
        "chi_dan": "Áp lực chuyển hóa thành quyền lực, thăng quan tiến chức, vượt qua thử thách nhận quyết định khen thưởng."
    },
    {
        "index": 19,
        "han_tu": "干乘墓顶志难伸",
        "phien_am": "Can thừa mộ đính chí nan thân",
        "y_nghia": "Can Thượng Thần là Mộ Khố của Can Ngày.",
        "chi_dan": "Đương số đầu óc mê muội, tự giam hãm mình, thiếu sáng suốt, cần nghỉ ngơi tĩnh dưỡng tránh quyết định lớn."
    },
    {
        "index": 20,
        "han_tu": "龙归大海任翻腾",
        "phien_am": "Long quy đại hải nhiệm phiên đằng",
        "y_nghia": "Thanh Long ngụ cung Thủy (Hợi, Tý) được tương sinh tương dưỡng.",
        "chi_dan": "Rồng gặp nước, tài năng được thỏa sức thi thố, làm ăn đại phát đạt, thi cử đỗ đầu danh bảng."
    },
    {
        "index": 21,
        "han_tu": "支乘吉神家道昌",
        "phien_am": "Chi thừa cát thần gia đạo xương",
        "y_nghia": "Chi Ngày ngụ Cát thần (Thanh Long, Quý Nhân, Lục Hợp, Thái Thường).",
        "chi_dan": "Gia đạo an khang thịnh vượng, nội bộ thuận hòa, công ty doanh nghiệp có nền tảng tài chính vững chắc."
    },
    {
        "index": 22,
        "han_tu": "鬼贼相侵祸患缠",
        "phien_am": "Quỷ tặc tương xâm họa hoạn triền",
        "y_nghia": "Tứ khóa dồn dập có nhiều thần khắc Can và Chi đồng thời phát tác.",
        "chi_dan": "Họa vô đơn chí, áp lực từ nhiều phía dồn nén, đối thủ ngoài sáng trong tối cùng gây sức ép."
    },
    {
        "index": 23,
        "han_tu": "传克俱空虚喜悲",
        "phien_am": "Truyền khắc câu không hư hỷ bi",
        "y_nghia": "Tam truyền có tương khắc nhưng các thần khắc đều rơi vào Tuần Không.",
        "chi_dan": "Mối lo sợ tưởng chừng kinh hoàng sau hóa thành bọt nước, mừng hụt hoặc sợ hãi vô căn cứ."
    },
    {
        "index": 24,
        "han_tu": "三合会局力无穷",
        "phien_am": "Tam hợp hội cục lực vô cùng",
        "y_nghia": "Tam truyền tề tựu đủ Tam Hợp Cục (Thân Tý Thìn, Hợi Mão Mùi, Dần Ngọ Tuất, Tỵ Dậu Sửu).",
        "chi_dan": "Sức mạnh liên minh quy tụ đông đảo, nhiều người chung tay tạo nên sự nghiệp lớn hoặc bè phái kết nối."
    },
    {
        "index": 25,
        "han_tu": "魁罡相加起风波",
        "phien_am": "Khôi Cương tương gia khởi phong ba",
        "y_nghia": "Thiên Cương (Thìn) gia Hà Khôi (Tuất) hoặc ngược lại.",
        "chi_dan": "Sóng gió nổi lên bất ngờ, tranh chấp pháp lý quyết liệt, việc công việc tư đều dễ có xung đột mạnh."
    },
    {
        "index": 26,
        "han_tu": "斩关断桥莫远行",
        "phien_am": "Trảm quan đoạn kiều mạc viễn hành",
        "y_nghia": "Khôi Cương lâm Sơ truyền gặp môn quan trở cách hoặc Tuần Không.",
        "chi_dan": "Cầu gãy cửa đóng, tuyệt đối không nên xuất hành đi xa, đề phòng tai nạn phương tiện trên đường."
    },
    {
        "index": 27,
        "han_tu": "闭口无言事暗藏",
        "phien_am": "Bế khẩu vô ngôn sự ám tàng",
        "y_nghia": "Tuần Vĩ (cuối tuần Giáp) gia vào Tuần Đầu hoặc Thiên Không ngậm miệng.",
        "chi_dan": "Có chuyện khuất tất giấu kín không thể nói ra, sự việc âm thầm diễn ra trong bóng tối."
    },
    {
        "index": 28,
        "han_tu": "夫妇同心家自兴",
        "phien_am": "Phu phụ đồng tâm gia tự hưng",
        "y_nghia": "Can Chi tương sinh, Thê Tài và Quan Quỷ hòa hợp có Thiên Hậu, Lục Hợp.",
        "chi_dan": "Vợ chồng đồng lòng tát biển Đông cũng cạn, hôn nhân sắt son, việc làm ăn gia đình thịnh vượng."
    },
    {
        "index": 29,
        "han_tu": "间传虚诈不可信",
        "phien_am": "Gian truyền hư trá bất khả tín",
        "y_nghia": "Tam truyền cách vị không liền kề, lại đới Thiên Không, Huyền Vũ.",
        "chi_dan": "Lời nói dối trá, đối tác có mưu đồ lừa lọc gian manh, không nên ký kết thỏa thuận qua loa."
    },
    {
        "index": 30,
        "han_tu": "游子出门心不定",
        "phien_am": "Du tử xuất môn tâm bất định",
        "y_nghia": "Dịch Mã phát động lâm Thiên Bàn hành thủy hoặc hỏa trôi dạt.",
        "chi_dan": "Tâm trạng bồn chồn muốn thay đổi, đứng núi này trông núi nọ, người đi xa chưa có chốn dừng chân."
    },
    {
        "index": 31,
        "han_tu": "富贵亨通得天时",
        "phien_am": "Phú quý hanh thông đắc thiên thời",
        "y_nghia": "Can Chi vượng tướng theo mùa, cát thần triều bái.",
        "chi_dan": "Gặp đúng thiên thời địa lợi, làm ăn một vốn bốn lời, công danh sự nghiệp tiến như diều gặp gió."
    },
    {
        "index": 32,
        "han_tu": "鬼墓同缠疾难瘳",
        "phien_am": "Quỷ mộ đồng triền tật nan sầu",
        "y_nghia": "Quan Quỷ đồng cung với Mộ Khố lâm vào Can hoặc Sơ truyền.",
        "chi_dan": "Bệnh tật mãn tính trầm trọng khó qua khỏi, người bệnh u mê li bì, cần cẩn trọng hộ lý."
    },
    {
        "index": 33,
        "han_tu": "蛇化青龙喜气新",
        "phien_am": "Xà hóa Thanh Long hỷ khí tân",
        "y_nghia": "Đằng Xà ngụ cung Thủy Mộc hoặc lâm vào cung vượng chuyển thành cát khí.",
        "chi_dan": "Từ trong lo âu kinh sợ bỗng đón nhận tin mừng bất ngờ, hoạn nạn qua đi đón điềm lành mới."
    },
    {
        "index": 34,
        "han_tu": "雀入江波口舌消",
        "phien_am": "Tước nhập giang ba khẩu thiệt tiêu",
        "y_nghia": "Chu Tước (Hỏa) lâm cung Thủy (Hợi, Tý) bị dập tắt sát khí.",
        "chi_dan": "Khẩu thiệt thị phi tự động tiêu tan, đơn kiện cáo bị đình chỉ, tranh luận lắng xuống."
    },
    {
        "index": 35,
        "han_tu": "勾陈得地争竞平",
        "phien_am": "Câu Trận đắc địa tranh cánh bình",
        "y_nghia": "Câu Trận ngụ cung Thổ bản vị được điều hòa.",
        "chi_dan": "Vụ việc tranh chấp đất đai, ranh giới được các bên thương lượng dàn xếp êm đẹp."
    },
    {
        "index": 36,
        "han_tu": "天空落陷谋不成",
        "phien_am": "Thiên Không lạc hãm mưu bất thành",
        "y_nghia": "Thiên Không lâm cung suy bại, mưu cầu sự việc viển vông.",
        "chi_dan": "Bàn bạc rôm rả nhưng toàn là kế hoạch rỗng, không có kinh phí thực tế để triển khai."
    },
    {
        "index": 37,
        "han_tu": "太阴匿影事阴私",
        "phien_am": "Thái Âm nặc ảnh sự âm tư",
        "y_nghia": "Thái Âm đắc địa lâm cung Kim Thủy che chở.",
        "chi_dan": "Có quý nhân âm thầm giúp đỡ sau lưng, mưu tính kín kẽ được giữ bí mật tuyệt đối."
    },
    {
        "index": 38,
        "han_tu": "玄武乘波贼盗狂",
        "phien_am": "Huyền Vũ thừa ba tặc đạo cuồng",
        "y_nghia": "Huyền Vũ lâm cung Hợi Tý đắc thế thủy khí.",
        "chi_dan": "Kẻ trộm cắp lừa đảo lộng hành tinh vi, cẩn thận bảo mật tài khoản ngân hàng và tài sản có giá trị."
    },
    {
        "index": 39,
        "han_tu": "太常受职有爵禄",
        "phien_am": "Thái Thường thụ chức hữu tước lộc",
        "y_nghia": "Thái Thường lâm Can thượng hoặc Sơ truyền sinh Can.",
        "chi_dan": "Được ban thưởng sắc phong, nhận quyết định bổ nhiệm, tham gia yến tiệc kỷ niệm trang trọng."
    },
    {
        "index": 40,
        "han_tu": "天后柔顺妇人喜",
        "phien_am": "Thiên Hậu nhu thuận phụ nhân hỷ",
        "y_nghia": "Thiên Hậu đắc vị sinh hòa Can Chi.",
        "chi_dan": "Gia đạo êm ấm, phụ nữ trong nhà mang lại may mắn lớn, việc cưới hỏi cầu con cái đại cát."
    },
    {
        "index": 41,
        "han_tu": "贵人落难求无应",
        "phien_am": "Quý Nhân lạc nạn cầu vô ứng",
        "y_nghia": "Quý Nhân lâm Thìn Tuất (ngục thất) hoặc rơi vào Tuần Không.",
        "chi_dan": "Nhờ vả cửa quyền không thành, cấp trên cũng đang gặp rắc rối không thể đứng ra bảo lãnh."
    },
    {
        "index": 42,
        "han_tu": "互换相生彼此利",
        "phien_am": "Hỗ hoán tương sinh bỉ thử lợi",
        "y_nghia": "Can Thượng sinh Chi Thượng, Chi Thượng sinh Can Thượng.",
        "chi_dan": "Đôi bên cùng có lợi (Win - Win), hợp tác kinh doanh bền vững, đối tác chân thành."
    },
    {
        "index": 43,
        "han_tu": "交互相克两相伤",
        "phien_am": "Giao hỗ tương khắc lưỡng tương thương",
        "y_nghia": "Can Thượng khắc Chi Thượng, Chi Thượng khắc Can Thượng.",
        "chi_dan": "Đôi bên triệt hạ lẫn nhau, hại địch một ngàn tự tổn tám trăm, cuối cùng cả hai cùng bại."
    },
    {
        "index": 44,
        "han_tu": "日禄临支主益客",
        "phien_am": "Nhật lộc lâm chi chủ ích khách",
        "y_nghia": "Thiên Lộc của Can ngày đóng trên Chi ngày.",
        "chi_dan": "Chủ nhà hoặc bên mời chịu thiệt nhường phần lợi cho khách/đối tác; ta được hưởng lợi khi làm khách."
    },
    {
        "index": 45,
        "han_tu": "支辰克日婢欺主",
        "phien_am": "Chi thần khắc nhật tỳ khi chủ",
        "y_nghia": "Chi ngày (hoặc Chi thượng thần) khắc thẳng Can ngày.",
        "chi_dan": "Cấp dưới coi thường cấp trên, người làm phản chủ, trong nhà gia nhân quấy đảo lộng hành."
    },
    {
        "index": 46,
        "han_tu": "兵权在握威权显",
        "phien_am": "Binh quyền tại ác uy quyền hiển",
        "y_nghia": "Quan Quỷ vượng tướng đới Bạch Hổ, Thanh Long củng chiếu.",
        "chi_dan": "Nắm giữ chức vụ quyền lực lớn, chỉ huy điều hành quân đội, công an hoặc doanh nghiệp quy mô lớn."
    },
    {
        "index": 47,
        "han_tu": "文星拱照举业崇",
        "phien_am": "Văn tinh củng chiếu cử nghiệp sùng",
        "y_nghia": "Chu Tước, Thanh Long, Thiên Lộc chiếu rọi cung học vấn.",
        "chi_dan": "Thi cử đỗ thủ khoa, công bố bài báo khoa học xuất sắc, danh tiếng học thuật lẫy lừng."
    },
    {
        "index": 48,
        "han_tu": "损益相形事莫量",
        "phien_am": "Tổn ích tương hình sự mạc lượng",
        "y_nghia": "Quẻ có sự pha trộn giữa sinh và khắc đan xen phức tạp.",
        "chi_dan": "Trong cái mất có cái được, trong họa có phúc, cần nhìn nhận đại cục dài hạn không nên vội mừng hay lo."
    },
    {
        "index": 49,
        "han_tu": "天地回向事圆满",
        "phien_am": "Thiên địa hồi hướng sự viên mãn",
        "y_nghia": "Thiên Bàn và Địa Bàn có sự tương sinh tuần hoàn tương hội.",
        "chi_dan": "Mọi việc xoay chuyển rồi lại trở về quỹ đạo tốt lành, đại đoàn viên hạnh phúc."
    },
    {
        "index": 50,
        "han_tu": "鬼动生忧终得解",
        "phien_am": "Quỷ động sinh ưu chung đắc giải",
        "y_nghia": "Sơ truyền Quan Quỷ phát động nhưng Mạt truyền là Tử Tôn hóa giải.",
        "chi_dan": "Ban đầu lo âu kinh hoàng nhưng đến hồi kết sẽ có quý nhân và giải pháp tháo gỡ triệt để."
    },
    {
        "index": 51,
        "han_tu": "病符临身防染患",
        "phien_am": "Bệnh phù lâm thân phòng nhiễm hoạn",
        "y_nghia": "Bệnh Phù sát tinh lâm vào Can Thượng hoặc Chi Thượng.",
        "chi_dan": "Đề phòng ốm đau truyền nhiễm, mệt mỏi thể xác, cần đi khám sàng lọc kịp thời."
    },
    {
        "index": 52,
        "han_tu": "丧吊临门悲泣声",
        "phien_am": "Tang điếu lâm môn bi khấp thanh",
        "y_nghia": "Tang Môn, Điếu Khách hội tụ chiếu vào Trạch thần.",
        "chi_dan": "Đề phòng trong họ hàng nội ngoại có tang sự hoặc tin buồn từ phương xa đưa tới."
    },
    {
        "index": 53,
        "han_tu": "岁破动迁宅不安",
        "phien_am": "Tuế phá động thiên trạch bất an",
        "y_nghia": "Tuế Phá phát động tại Chi hoặc Sơ truyền.",
        "chi_dan": "Nơi ở bị xáo trộn, sửa chữa nhà cửa gặp trắc trở, cơ quan chuyển văn phòng gây bất an."
    },
    {
        "index": 54,
        "han_tu": "大耗损财防暗耗",
        "phien_am": "Đại hao tổn tài phòng ám hao",
        "y_nghia": "Đại Hao thần sát lâm Tài hào hoặc Can thượng.",
        "chi_dan": "Thất thoát tài chính nghiêm trọng do chi tiêu bất ngờ hoặc bị phạt, đầu tư lỗ vốn."
    },
    {
        "index": 55,
        "han_tu": "桃花重见多私情",
        "phien_am": "Đào hoa trùng kiến đa tư tình",
        "y_nghia": "Đào Hoa (Hàm Trì) xuất hiện tại Tứ khóa và Tam truyền.",
        "chi_dan": "Đắm đuối sắc dục, tư tình vụng trộm, cẩn thận vướng vào rắc rối tình ái làm hoen ố danh dự."
    },
    {
        "index": 56,
        "han_tu": "天医救疗疾即愈",
        "phien_am": "Thiên y cứu liệu tật tức dũ",
        "y_nghia": "Thiên Y thần sát lâm vào hào Tử Tôn hoặc Mạt truyền.",
        "chi_dan": "Gặp được danh y thuốc tốt, bệnh nặng được cứu chữa kịp thời, thể chất nhanh chóng phục hồi."
    },
    {
        "index": 57,
        "han_tu": "月德临门吉事添",
        "phien_am": "Nguyệt đức lâm môn cát sự thiêm",
        "y_nghia": "Nguyệt Đức cát tinh chiếu rọi vào Chi ngày.",
        "chi_dan": "Nhà có hỷ sự, quý nhân ghé thăm, gia đạo đón thêm niềm vui con cái hoặc nhà đất."
    },
    {
        "index": 58,
        "han_tu": "驿马奔驰千里去",
        "phien_am": "Dịch mã bôn trì thiên lý khứ",
        "y_nghia": "Dịch Mã đắc lực lâm Sơ truyền vượng tướng.",
        "chi_dan": "Chuyến đi xa vạn dặm diễn ra thuận buồm xuôi gió, công tác nước ngoài gặt hái thành công lớn."
    },
    {
        "index": 59,
        "han_tu": "华盖孤高学业精",
        "phien_am": "Hoa cái cô cao học nghiệp tinh",
        "y_nghia": "Hoa Cái lâm Can thượng hoặc Sơ truyền.",
        "chi_dan": "Tư chất thông tuệ xuất chúng nhưng tính cách cô độc, thích nghiên cứu học thuật triết lý tôn giáo."
    },
    {
        "index": 60,
        "han_tu": "金匮藏金富贵全",
        "phien_am": "Kim quỹ tàng kim phú quý toàn",
        "y_nghia": "Kim Quỹ cát tinh lâm đất Tài lộc.",
        "chi_dan": "Tài sản được cất giữ an toàn trong két sắt, tích lũy dồi dào, hậu vận giàu sang phú quý."
    },
    {
        "index": 61,
        "han_tu": "劫煞交加防夺掳",
        "phien_am": "Kiếp sát giao gia phòng đoạt lỗ",
        "y_nghia": "Kiếp Sát phát động tại Sơ truyền đới hung thần.",
        "chi_dan": "Đề phòng bị cướp đoạt công sức, tranh chấp trắng trợn tài sản, bị đối thủ chèn ép cướp khách hàng."
    },
    {
        "index": 62,
        "han_tu": "灾煞临头灾自起",
        "phien_am": "Tai sát lâm đầu tai tự khởi",
        "y_nghia": "Tai Sát đóng tại Can thượng thần.",
        "chi_dan": "Tai bay vạ gió tự nhiên ập đến từ lỗi lầm sơ suất của bản thân, cần nghiêm cẩn rà soát công việc."
    },
    {
        "index": 63,
        "han_tu": "天喜降临喜事重",
        "phien_am": "Thiên hỷ giáng lâm hỷ sự trùng",
        "y_nghia": "Thiên Hỷ cát tinh lâm Sơ truyền hoặc Mạt truyền.",
        "chi_dan": "Niềm vui nối tiếp niềm vui, cưới hỏi thi cử thăng tiến đều đắc ý trọn vẹn."
    },
    {
        "index": 64,
        "han_tu": "官符缠身争讼起",
        "phien_am": "Quan phù triền thân tranh tụng khởi",
        "y_nghia": "Quan Phù sát tinh lâm vào hào Quan Quỷ.",
        "chi_dan": "Tranh chấp hợp đồng kéo nhau ra tòa án, nhận giấy triệu tập hoặc văn bản xử phạt hành chính."
    },
    {
        "index": 65,
        "han_tu": "天赦解厄罪即销",
        "phien_am": "Thiên xá giải ách tội tức tiêu",
        "y_nghia": "Thiên Xá cát tinh lâm quẻ cứu giải.",
        "chi_dan": "Được tha bổng, giảm nhẹ hình phạt, xóa bỏ kỷ luật, được cấp trên ân xá bỏ qua lỗi lầm."
    },
    {
        "index": 66,
        "han_tu": "血支血忌防金刃",
        "phien_am": "Huyết chi huyết kỵ phòng kim nhẫn",
        "y_nghia": "Huyết Chi, Huyết Kỵ đồng cung đới Bạch Hổ.",
        "chi_dan": "Cực kỳ cẩn trọng khi cầm dao kéo, máy móc kim loại, phẫu thuật, phòng ngừa chảy máu thương tật."
    },
    {
        "index": 67,
        "han_tu": "死气缠绵生机断",
        "phien_am": "Tử khí triền miên sinh cơ đoạn",
        "y_nghia": "Tử Khí thần sát lâm Can thượng hoặc Mạt truyền.",
        "chi_dan": "Dự án lâm vào ngõ cụt, đối tác bỏ cuộc, nguồn lực cạn kiệt khó lòng cứu vãn."
    },
    {
        "index": 68,
        "han_tu": "生气逢春发万物",
        "phien_am": "Sinh khí phùng xuân phát vạn vật",
        "y_nghia": "Sinh Khí thần sát lâm cung vượng Mộc Hỏa.",
        "chi_dan": "Sức sống mới trỗi dậy mạnh mẽ, doanh nghiệp tái khởi động phát triển rực rỡ."
    },
    {
        "index": 69,
        "han_tu": "勾陈带斗事迟延",
        "phien_am": "Câu Trận đái đẩu sự trì diên",
        "y_nghia": "Câu Trận gặp Thìn Tuất giằng co.",
        "chi_dan": "Sự việc dây dưa kéo dài nhiều tháng nhiều năm, không thể giải quyết dứt điểm một sớm một chiều."
    },
    {
        "index": 70,
        "han_tu": "朱雀乘风口舌疾",
        "phien_am": "Chu Tước thừa phong khẩu thiệt tật",
        "y_nghia": "Chu Tước lâm Tỵ Ngọ phát hỏa.",
        "chi_dan": "Tin đồn thất thiệt lan truyền chóng mặt, khẩu thiệt thị phi bùng phát dữ dội cần giữ mồm giữ miệng."
    },
    {
        "index": 71,
        "han_tu": "玄武入水踪迹没",
        "phien_am": "Huyền Vũ nhập thủy tung tích một",
        "y_nghia": "Huyền Vũ lâm Hợi Tý ẩn tàng.",
        "chi_dan": "Kẻ gian lẩn trốn mất hút không để lại dấu vết, hồ sơ tài liệu thất lạc khó lòng tìm ra."
    },
    {
        "index": 72,
        "han_tu": "白虎凌空凶暴肆",
        "phien_am": "Bạch Hổ lăng không hung bạo tứ",
        "y_nghia": "Bạch Hổ phát động lâm vào thiên bàn không bị chế ngự.",
        "chi_dan": "Kẻ xấu lộng hành bạo ngược, hiểm nguy rình rập, cần tìm nơi ẩn náu an toàn tránh đối đầu."
    },
    {
        "index": 73,
        "han_tu": "青龙腾空名利扬",
        "phien_am": "Thanh Long đằng không danh lợi dương",
        "y_nghia": "Thanh Long lâm Dần Mão phát động.",
        "chi_dan": "Danh tiếng vang xa khắp bốn phương, tiếng tăm lẫy lừng, mang lại lợi ích tài chính khổng lồ."
    },
    {
        "index": 74,
        "han_tu": "贵人登殿恩泽敷",
        "phien_am": "Quý Nhân đăng điện ân trạch phu",
        "y_nghia": "Quý Nhân lâm cung Tỵ đắc vị Đăng Thiên Môn.",
        "chi_dan": "Gặp được nhân vật quyền lực cao nhất giúp đỡ, nhận được ân huệ đặc cách to lớn."
    },
    {
        "index": 75,
        "han_tu": "太常列爵荣禄重",
        "phien_am": "Thái Thường liệt tước vinh lộc trọng",
        "y_nghia": "Thái Thường đắc thế sinh Can ngày.",
        "chi_dan": "Được thăng thưởng cấp bậc quân hàm, giữ vị trí then chốt, bổng lộc vinh hiển đời đời."
    },
    {
        "index": 76,
        "han_tu": "太阴隐密私盟遂",
        "phien_am": "Thái Âm ẩn mật tư minh toại",
        "y_nghia": "Thái Âm tương trợ trong giao kết ngầm.",
        "chi_dan": "Ký kết hợp đồng bảo mật thành công, đàm phán kín mang lại lợi ích vượt ngoài mong đợi."
    },
    {
        "index": 77,
        "han_tu": "六合联姻子孙繁",
        "phien_am": "Lục Hợp liên nhân tử tôn phồn",
        "y_nghia": "Lục Hợp lâm Khóa III, Khóa IV hòa hợp.",
        "chi_dan": "Hai họ kết thân bền chặt, cưới gả thuận lợi, sinh con đẻ cái thông minh phương trưởng."
    },
    {
        "index": 78,
        "han_tu": "天空失实诈谋彰",
        "phien_am": "Thiên Không thất thực trá mưu chương",
        "y_nghia": "Thiên Không phát động đối xung.",
        "chi_dan": "Mưu mô lừa gạt bị vạch trần, sự thật sáng tỏ trước công chúng."
    },
    {
        "index": 79,
        "han_tu": "蛇入火乡自受焚",
        "phien_am": "Xà nhập hỏa hương tự thụ phần",
        "y_nghia": "Đằng Xà lâm Ngọ Hỏa cực vượng.",
        "chi_dan": "Kẻ tiểu nhân mưu hại người khác cuối cùng tự rước lấy tai họa thiêu cháy chính mình."
    },
    {
        "index": 80,
        "han_tu": "虎落陷坑威势绝",
        "phien_am": "Hổ lạc hãm khanh uy thế tuyệt",
        "y_nghia": "Bạch Hổ lâm Tý Thủy hoặc Mộ địa.",
        "chi_dan": "Kẻ hung ác bị sa lưới pháp luật, mối đe dọa bị dập tắt hoàn toàn, thế gian thái bình."
    },
    {
        "index": 81,
        "han_tu": "日乘破碎防缺漏",
        "phien_am": "Nhật thừa phá toái phòng khuyết lậu",
        "y_nghia": "Can Thượng lâm Phá Toái sát tinh.",
        "chi_dan": "Hàng hóa dễ bị sứt mẻ rơi vỡ, hợp đồng sót điều khoản quan trọng, cần kiểm tra tỉ mỉ."
    },
    {
        "index": 82,
        "han_tu": "支临绝地迁居吉",
        "phien_am": "Chi lâm tuyệt địa thiên cư cát",
        "y_nghia": "Chi Ngày ngụ Tuyệt địa cần thay đổi.",
        "chi_dan": "Ở chỗ cũ thì bế tắc suy tàn, dọn chuyển nhà mới hoặc đổi mặt bằng kinh doanh thì đại cát."
    },
    {
        "index": 83,
        "han_tu": "干克初传先难后",
        "phien_am": "Can khắc sơ truyền tiên nan hậu",
        "y_nghia": "Can ngày khắc Thượng thần Sơ truyền.",
        "chi_dan": "Ban đầu phải vất vả nỗ lực chinh phục rào cản, nhưng về sau sẽ làm chủ tình thế thu kết quả tốt."
    },
    {
        "index": 84,
        "han_tu": "初克日干始祸来",
        "phien_am": "Sơ khắc nhật can thủy họa lai",
        "y_nghia": "Sơ truyền khắc Can ngày.",
        "chi_dan": "Tai họa phát sinh ngay từ bước đầu tiên do sơ suất chủ quan, cần lập tức chấn chỉnh quy trình."
    },
    {
        "index": 85,
        "han_tu": "中克末传事有阻",
        "phien_am": "Trung khắc mạt truyền sự hữu trở",
        "y_nghia": "Trung truyền khắc Mạt truyền.",
        "chi_dan": "Đang trên đà thuận lợi thì đến chặng cuối gặp rào cản ngăn chặn, phải tìm phương án thay thế."
    },
    {
        "index": 86,
        "han_tu": "末生初传源流长",
        "phien_am": "Mạt sinh sơ truyền nguyên lưu trường",
        "y_nghia": "Mạt truyền quay lại sinh Sơ truyền.",
        "chi_dan": "Tuần hoàn sinh hóa không dứt, việc làm ăn lâu dài bền vững, nguồn vốn xoay vòng dồi dào."
    },
    {
        "index": 87,
        "han_tu": "内外相合远近亲",
        "phien_am": "Nội ngoại tương hợp viễn cận thân",
        "y_nghia": "Can và Chi cùng tương sinh tương hợp với Tam truyền.",
        "chi_dan": "Trong ngoài đồng lòng, xa gần đều ủng hộ giúp đỡ, tiếng thơm lan tỏa khắp nơi."
    },
    {
        "index": 88,
        "han_tu": "彼此刑冲终背叛",
        "phien_am": "Bỉ thử hình xung chung bối bạn",
        "y_nghia": "Các hào hình xung liên tục giữa Chủ và Khách.",
        "chi_dan": "Đối tác trở mặt phản bội, bạn bè quay lưng vì tranh chấp lợi ích cá nhân."
    },
    {
        "index": 89,
        "han_tu": "天乙当权讼自息",
        "phien_am": "Thiên Ất đương quyền tụng tự tức",
        "y_nghia": "Quý Nhân (Thiên Ất) xuất hiện chủ trì công lý.",
        "chi_dan": "Quan tòa liêm chính phân xử công minh, vụ án được giải quyết thỏa đáng, kiện tụng chấm dứt."
    },
    {
        "index": 90,
        "han_tu": "青龙折足谋利空",
        "phien_am": "Thanh Long chiết túc mưu lợi không",
        "y_nghia": "Thanh Long lâm Thân Dậu bị Kim phạt gãy chân.",
        "chi_dan": "Đầu tư tài chính thất bại, mưu cầu lợi nhuận lớn nhưng cuối cùng tay trắng hoàn tay trắng."
    },
    {
        "index": 91,
        "han_tu": "玄武披枷盗即擒",
        "phien_am": "Huyền Vũ phi gia đạo tức cầm",
        "y_nghia": "Huyền Vũ lâm cung Thổ bị khắc chế hoàn toàn.",
        "chi_dan": "Kẻ trộm bị bắt giữ mang gông cùm, kẻ biển thủ công quỹ phải hoàn trả toàn bộ số tiền."
    },
    {
        "index": 92,
        "han_tu": "朱雀开口舌剑利",
        "phien_am": "Chu Tước khai khẩu thiệt kiếm lợi",
        "y_nghia": "Chu Tước phát động lâm cung vượng.",
        "chi_dan": "Lời nói sắc bén như gươm giáo, tranh biện hùng hồn thắng lợi nhưng dễ gây oán hận thù hằn."
    },
    {
        "index": 93,
        "han_tu": "白虎当道行人阻",
        "phien_am": "Bạch Hổ đương đạo hành nhân trở",
        "y_nghia": "Bạch Hổ chắn ngang cung Dịch Mã.",
        "chi_dan": "Đường đi bị phong tỏa ngăn cấm, giao thông tắc nghẽn, chuyến đi gặp trở ngại lớn phải hoãn lại."
    },
    {
        "index": 94,
        "han_tu": "勾陈滞足事迟留",
        "phien_am": "Câu Trận trệ túc sự trì lưu",
        "y_nghia": "Câu Trận quấn chân tại Sơ truyền.",
        "chi_dan": "Thủ tục hành chính bị ngâm hồ sơ, giấy tờ phê duyệt chậm trễ, việc kéo dài chưa xong."
    },
    {
        "index": 95,
        "han_tu": "太常筵宴宾客欢",
        "phien_am": "Thái Thường diên yến tân khách hoan",
        "y_nghia": "Thái Thường lâm Chi ngày tương sinh.",
        "chi_dan": "Nhà mở tiệc đãi khách tưng bừng, bạn bè thân hữu sum vầy chia vui chén rượu ân tình."
    },
    {
        "index": 96,
        "han_tu": "太阴照户闺阃安",
        "phien_am": "Thái Âm chiếu hộ khuê khổn an",
        "y_nghia": "Thái Âm chiếu vào cửa phòng gia trạch.",
        "chi_dan": "Phụ nữ trong nhà hiền thục nết na, gia đình yên ấm không có sóng gió, việc ngầm êm thấm."
    },
    {
        "index": 97,
        "han_tu": "天空空言虚无应",
        "phien_am": "Thiên Không không ngôn hư vô ứng",
        "y_nghia": "Thiên Không lâm Mạt truyền quy túc.",
        "chi_dan": "Những lời hứa hẹn cuối cùng chỉ là gió thoảng mây bay, không có bất kỳ hành động thực tế nào."
    },
    {
        "index": 98,
        "han_tu": "六合联和契约立",
        "phien_am": "Lục Hợp liên hòa khế ước lập",
        "y_nghia": "Lục Hợp lâm Mạt truyền kết cục.",
        "chi_dan": "Hợp đồng kinh tế được ký kết chính thức, văn bản pháp lý chặt chẽ bảo đảm quyền lợi lâu dài."
    },
    {
        "index": 99,
        "han_tu": "蛇缠病体命难延",
        "phien_am": "Xà triền bệnh thể mệnh nan diên",
        "y_nghia": "Đằng Xà quấn chặt vào bản mệnh đương số.",
        "chi_dan": "Tà khí ám thân, bệnh tật quái ác khó tìm ra nguyên nhân, cần cầu an và thay đổi môi trường sống."
    },
    {
        "index": 100,
        "han_tu": "神机妙算终归正",
        "phien_am": "Thần cơ diệu toán chung quy chính",
        "y_nghia": "Quẻ Lục Nhâm biến hóa khôn lường cuối cùng quy về Đạo Đức chính đạo.",
        "chi_dan": "Mọi toan tính mưu sâu kế độc đều không qua được luật nhân quả; giữ tâm chính trực thì hung hóa cát."
    }
];


  // =========================================================================
  // 3. THUẬT TOÁN GIỜ CHÂN THÁI DƯƠNG (TRUE SOLAR TIME)
  // =========================================================================
  function calculateTrueSolarTime(date, longitude) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((date - startOfYear) / (24 * 3600 * 1000)) + 1;
    const B = (360 / 365) * (dayOfYear - 81) * (Math.PI / 180);

    // Phương trình thời gian EoT (phút)
    const eotMinutes = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

    // Hiệu chỉnh kinh độ so với kinh tuyến múi giờ GMT+7 (105 độ Đông)
    const standardMeridian = 105.0;
    const lon = (longitude !== undefined && longitude !== null) ? longitude : 105.8542; // Mặc định Hà Nội
    const lonDiffMinutes = (lon - standardMeridian) * 4.0;

    const totalOffsetMinutes = eotMinutes + lonDiffMinutes;
    const trueSolarDate = new Date(date.getTime() + totalOffsetMinutes * 60 * 1000);

    return {
      standardTime: date,
      trueSolarTime: trueSolarDate,
      eotMinutes: Math.round(eotMinutes * 100) / 100,
      lonDiffMinutes: Math.round(lonDiffMinutes * 100) / 100,
      totalOffsetMinutes: Math.round(totalOffsetMinutes * 100) / 100
    };
  }

  // =========================================================================
  // 4. CÁC HÀM TIỆN ÍCH QUAN HỆ & LỤC THÂN
  // =========================================================================
  function idxChi(chi) { return DIA_CHI.indexOf(chi); }

  function getLucThan(canNgay, chiTarget) {
    const hCan = NGU_HANH_CAN[canNgay];
    const hChi = NGU_HANH_CHI[chiTarget];
    if (hCan === hChi) return "Huynh đệ";
    if (NGU_HANH_SINH[hChi] === hCan) return "Phụ mẫu";
    if (NGU_HANH_SINH[hCan] === hChi) return "Tử tôn";
    if (NGU_HANH_KHAC[hCan] === hChi) return "Thê tài";
    if (NGU_HANH_KHAC[hChi] === hCan) return "Quan quỷ";
    return "Bình";
  }

  function getTruongSinhStage(canNgay, chiTarget) {
    const hCan = NGU_HANH_CAN[canNgay];
    const startChi = TRUONG_SINH_START[hCan] || "Hợi";
    const startIdx = idxChi(startChi);
    const targetIdx = idxChi(chiTarget);
    const offset = (targetIdx - startIdx + 12) % 12;
    return TRUONG_SINH_12[offset];
  }

  function getSeasonFromTietKhi(tietKhi) {
    if (!tietKhi) return "Thu";
    const tk = tietKhi.toLowerCase();
    if (tk.includes("lập xuân") || tk.includes("vũ thủy") || tk.includes("kinh trập") || tk.includes("xuân phân") || tk.includes("thanh minh") || tk.includes("cốc vũ")) return "Xuân";
    if (tk.includes("lập hạ") || tk.includes("tiểu mãn") || tk.includes("mang chủng") || tk.includes("hạ chí") || tk.includes("tiểu thử") || tk.includes("đại thử")) return "Hạ";
    if (tk.includes("lập thu") || tk.includes("xử thử") || tk.includes("bạch lộ") || tk.includes("thu phân") || tk.includes("hàn lộ") || tk.includes("sương giáng")) return "Thu";
    if (tk.includes("lập đông") || tk.includes("tiểu tuyết") || tk.includes("đại tuyết") || tk.includes("đông chí") || tk.includes("tiểu hàn") || tk.includes("đại hàn")) return "Đông";
    return "Thu";
  }

  // =========================================================================
  // 5. ĐỘNG CƠ LUẬN GIẢI 7 TẦNG (CHÍNH)
  // =========================================================================
  
  // =========================================================================
  // 4.5. BỘ ĐIỀU HỢP CHUẨN HÓA DỮ LIỆU ĐẦU VÀO (ADAPTER & NORMALIZER)
  // Giải quyết triệt để 3 điểm bất biến:
  // 1. Chuẩn hóa tên Thiên Tướng hoa/thường (Casing Invariant)
  // 2. Chuẩn hóa trường dữ liệu: tamTruyenTenTong, thienTuong, lucThan, cung12
  // 3. Chuẩn hóa nhận diện Tiết khí & Mùa tứ thời (tietKhi vs tenNguyetTuong)
  // =========================================================================
  function normalizeThienTuong(name) {
    if (!name) return "";
    const s = String(name).trim();
    const map = {
      "quý nhân": "Quý Nhân", "quy nhan": "Quý Nhân", "quý": "Quý Nhân",
      "đằng xà": "Đằng Xà", "dang xa": "Đằng Xà", "xà": "Đằng Xà",
      "chu tước": "Chu Tước", "chu tuoc": "Chu Tước", "tước": "Chu Tước",
      "thiên hợp": "Lục Hợp", "lục hợp": "Lục Hợp", "luc hop": "Lục Hợp", "hợp": "Lục Hợp",
      "câu trận": "Câu Trận", "cau tran": "Câu Trận", "trận": "Câu Trận",
      "thanh long": "Thanh Long", "long": "Thanh Long",
      "thiên không": "Thiên Không", "thien khong": "Thiên Không", "không": "Thiên Không",
      "bạch hổ": "Bạch Hổ", "bach ho": "Bạch Hổ", "hổ": "Bạch Hổ",
      "thái thường": "Thái Thường", "thai thuong": "Thái Thường", "thường": "Thái Thường",
      "huyền vũ": "Huyền Vũ", "huyen vu": "Huyền Vũ", "vũ": "Huyền Vũ",
      "thái âm": "Thái Âm", "thai am": "Thái Âm", "âm": "Thái Âm",
      "thiên hậu": "Thiên Hậu", "thien hau": "Thiên Hậu", "hậu": "Thiên Hậu"
    };
    return map[s.toLowerCase()] || s;
  }

  function adaptChartData(chartData) {
    if (!chartData) return {};
    const canNgay = chartData.canNgay || "";
    const chiNgay = chartData.chiNgay || "";
    const chiGio = chartData.chiGio || "";
    const nguyetTuong = chartData.nguyetTuong || "";
    const isDaytime = (chartData.isDaytime !== undefined) ? chartData.isDaytime : true;
    const tenTong = chartData.tenTong || chartData.tamTruyenTenTong || "Cửu Tông Môn";
    const tietKhi = chartData.tietKhi || chartData.tenNguyetTuong || "Thu phân";

    const soRaw = chartData.soTruyen || {};
    const trungRaw = chartData.trungTruyen || {};
    const matRaw = chartData.matTruyen || {};

    const soTruyen = {
      chi: typeof soRaw === "string" ? soRaw : (soRaw.chi || ""),
      tuong: normalizeThienTuong(soRaw.tuong || soRaw.thienTuong || ""),
      than: soRaw.than || soRaw.lucThan || ""
    };
    const trungTruyen = {
      chi: typeof trungRaw === "string" ? trungRaw : (trungRaw.chi || ""),
      tuong: normalizeThienTuong(trungRaw.tuong || trungRaw.thienTuong || ""),
      than: trungRaw.than || trungRaw.lucThan || ""
    };
    const matTruyen = {
      chi: typeof matRaw === "string" ? matRaw : (matRaw.chi || ""),
      tuong: normalizeThienTuong(matRaw.tuong || matRaw.thienTuong || ""),
      than: matRaw.than || matRaw.lucThan || ""
    };

    if (!soTruyen.than && canNgay && soTruyen.chi) soTruyen.than = getLucThan(canNgay, soTruyen.chi);
    if (!trungTruyen.than && canNgay && trungTruyen.chi) trungTruyen.than = getLucThan(canNgay, trungTruyen.chi);
    if (!matTruyen.than && canNgay && matTruyen.chi) matTruyen.than = getLucThan(canNgay, matTruyen.chi);

    return {
      ...chartData,
      canNgay, chiNgay, chiGio, nguyetTuong, isDaytime,
      tenTong, tietKhi,
      soTruyen, trungTruyen, matTruyen,
      tuKhoa: chartData.tuKhoa || [],
      boxes: chartData.boxes || chartData.cung12 || {}
    };
  }

  function interpretChart(rawChartData) {
    const chartData = adaptChartData(rawChartData);
    const {
      canNgay, chiNgay, chiGio, nguyetTuong, isDaytime,
      tuKhoa, soTruyen, trungTruyen, matTruyen, boxes, tenTong
    } = chartData;

    const hCan = NGU_HANH_CAN[canNgay] || "Kim";
    const hChi = NGU_HANH_CHI[chiNgay] || "Mộc";

    const soChi = soTruyen.chi;
    const trungChi = trungTruyen.chi;
    const matChi = matTruyen.chi;

    const hSo = NGU_HANH_CHI[soChi];
    const hTrung = NGU_HANH_CHI[trungChi];
    const hMat = NGU_HANH_CHI[matChi];

    const soTuong = soTruyen.tuong || "";
    const trungTuong = trungTruyen.tuong || "";
    const matTuong = matTruyen.tuong || "";

    const ltSo = soTruyen.than || getLucThan(canNgay, soChi);
    const ltTrung = trungTruyen.than || getLucThan(canNgay, trungChi);
    const ltMat = matTruyen.than || getLucThan(canNgay, matChi);

    // Tầng 1: Thể Dụng Can Chi
    let canChiRel = "Tỷ hòa";
    let canChiAdvice = "Hai bên ngang tài ngang sức, nên thương lượng minh bạch.";
    if (NGU_HANH_SINH[hChi] === hCan) {
      canChiRel = "Chi sinh Can (Địa sinh Thiên - ĐẠI CÁT)";
      canChiAdvice = "Môi trường và đối tác nhiệt tình phò trợ, gia đạo êm ấm, chủ động nắm bắt cơ hội vàng.";
    } else if (NGU_HANH_SINH[hCan] === hChi) {
      canChiRel = "Can sinh Chi (Thiên sinh Địa - Tiêu hao)";
      canChiAdvice = "Ta phải dốc sức chi tiền của, gánh vác cho đối phương; cần quản trị ngân sách.";
    } else if (NGU_HANH_KHAC[hCan] === hChi) {
      canChiRel = "Can khắc Chi (Thiên khắc Địa - Làm chủ)";
      canChiAdvice = "Ta nắm thế chủ động chi phối cục diện; nên dùng ân đức thu phục lòng người.";
    } else if (NGU_HANH_KHAC[hChi] === hCan) {
      canChiRel = "Chi khắc Can (Địa khắc Thiên - Bức bách)";
      canChiAdvice = "Ngoại cảnh và thủ tục chèn ép dữ dội; nên phòng thủ cẩn mật, tránh xuất tiền mạo hiểm.";
    }

    // Tầng 2: Năng lượng Tứ Thời & Trường Sinh
    const season = getSeasonFromTietKhi(chartData.tietKhi || chartData.tenNguyetTuong || "Thu phân");
    const vuongTable = VUONG_SUY_TU_THOI[season] || VUONG_SUY_TU_THOI["Thu"];
    const tsCanSo = getTruongSinhStage(canNgay, soChi);
    const tsCanMat = getTruongSinhStage(canNgay, matChi);

    // Tầng 3: Tiến trình Tam Truyền
    const truyenProcess = {
      soTruyen: {
        chi: soChi, tuong: soTuong, than: ltSo, van: tsCanSo,
        khi: vuongTable[hSo] || "Bình",
        vaiTro: "Sơ Phát (Động Cơ Ban Đầu)",
        phanTich: `Khởi đầu sự việc do ${ltSo} tác động, mang khí ${vuongTable[hSo] || 'Bình'} ở vận ${tsCanSo}.`
      },
      trungTruyen: {
        chi: trungChi, tuong: trungTuong, than: ltTrung,
        khi: vuongTable[hTrung] || "Bình",
        vaiTro: "Trung Di (Quá Trình Biến Hóa)",
        phanTich: `Giai đoạn chuyển tiếp biến đổi qua ${ltTrung}, tướng ${trungTuong}.`
      },
      matTruyen: {
        chi: matChi, tuong: matTuong, than: ltMat, van: tsCanMat,
        khi: vuongTable[hMat] || "Bình",
        vaiTro: "Mạt Túc (Kết Quả Cuối Cùng)",
        phanTich: `Chốt lại ở ${ltMat}, đại diện bởi ${matTuong}, quy về đất ${tsCanMat}.`
      }
    };

    // Tầng 4: Nhận diện Tất Pháp Phú
    const detectedBiFa = [];
    // 1. Tiến Liên Châu
    if ((idxChi(trungChi) - idxChi(soChi) + 12) % 12 === 1 && (idxChi(matChi) - idxChi(trungChi) + 12) % 12 === 1) {
      detectedBiFa.push({
        ten: "Tiến Liên Châu (Tấn Lại Cục)",
        han_tu: "前后引从升迁位",
        y_nghia: "Tam truyền thuận chiều liên tiếp (Dần - Mão - Thìn...).",
        chi_dan: "Vận thế tiến lên không ngừng, thăng quan tiến chức, công danh rực rỡ."
      });
    }
    // 2. Đầu Đuôi Tương Sinh
    if (NGU_HANH_SINH[hSo] === hMat || NGU_HANH_SINH[hMat] === hSo) {
      detectedBiFa.push({
        ten: "Thủ Vĩ Tương Hướng",
        han_tu: "首尾相向事益佳",
        y_nghia: "Sơ truyền và Mạt truyền ngũ hành tương sinh ăn ý.",
        chi_dan: "Khởi đầu thuận lợi, kết thúc viên mãn, trước sau hòa hợp."
      });
    }
    // 3. Quan Ấn Tương Sinh
    if (ltSo === "Quan quỷ" && ltTrung === "Phụ mẫu") {
      detectedBiFa.push({
        ten: "Quan Ấn Tương Sinh",
        han_tu: "官转生印印生身",
        y_nghia: "Sơ truyền Quan Quỷ sinh Phụ Mẫu Trung truyền, Ấn sinh Thân Can.",
        chi_dan: "Chuyển áp lực thành quyền lực, thăng quan, đắc văn bằng, biến nguy thành an."
      });
    }
    // 4. Can Thừa Mộ Đỉnh
    const moCanMap = { "Giáp": "Mùi", "Ất": "Tuất", "Bính": "Tuất", "Đinh": "Sửu", "Mậu": "Tuất", "Kỷ": "Sửu", "Canh": "Sửu", "Tân": "Thìn", "Nhâm": "Thìn", "Quý": "Mùi" };
    const t1Chi = (tuKhoa && tuKhoa[0]) ? tuKhoa[0].thuong : "";
    if (t1Chi === moCanMap[canNgay]) {
      detectedBiFa.push({
        ten: "Can Thừa Mộ Đỉnh",
        han_tu: "干乘墓顶志难伸",
        y_nghia: `Can thượng thần (${t1Chi}) là Mộ Khố của Can Ngày (${canNgay}).`,
        chi_dan: "Chí lớn khó mở mang, đầu óc bế tắc, nên dĩ tĩnh chế động."
      });
    }

    // Nếu chưa khớp quy tắc động, nạp mặc định câu cốt lõi của Tông Môn
    if (detectedBiFa.length === 0) {
      const defBf = TAT_PHAP_PHU_100[1] || {};
      detectedBiFa.push({
        ten: defBf.phien_am || "Thủ Vĩ Tương Hướng",
        han_tu: defBf.han_tu || "首尾相向事益佳",
        y_nghia: defBf.y_nghia || "Sơ truyền và Mạt truyền tương sinh hoặc tương hợp ăn ý chặt chẽ.",
        chi_dan: defBf.chi_dan || "Đầu đuôi tương ứng, việc trước việc sau kết hợp hài hòa, khởi đầu thuận lợi và kết thúc viên mãn."
      });
    }

    // Tầng 5: Ma trận 7 Chuyên đề Sự vụ Đa Chiều
    const chuyenDe7 = {
      quan_van: {
        tieu_de: "Công Danh, Sự Nghiệp & Thi Cử",
        danh_gia: (ltSo === "Quan quỷ" || soTuong === "Quý Nhân" || soTuong === "Thanh Long") ? "ĐẮC THẾ THĂNG TIẾN" : "BÌNH ỔN / TÍCH LŨY",
        hien_trang: `Quan tinh: ${ltSo} tại Sơ truyền, ${ltMat} tại Mạt truyền. Thần chủ trì phát đoan là ${soTuong}.`,
        dong_luc_bien_chuyen: (ltSo === "Quan quỷ" || soTuong === "Quý Nhân") ? "Tiến trình công danh có quý nhân phò trợ, được giao trọng trách." : "Quan tinh ẩn phục, giai đoạn này thích hợp trau dồi chuyên môn.",
        canh_bao_rui_ro: (ltSo === "Quan quỷ" && soTuong === "Bạch Hổ") ? "Cảnh báo nguy cơ thanh tra kỷ luật, áp lực pháp lý gắt gao!" : "Cần cẩn thận chậm trễ thủ tục phê duyệt.",
        sach_luoc_khuyen_nghi: "Làm việc theo đúng quy chuẩn, chủ động báo cáo minh bạch tiến độ với lãnh đạo.",
        noi_dung: `Sơ truyền mang ${ltSo} đới ${soTuong}. ` + ((soTuong === "Quý Nhân" || soTuong === "Thanh Long") ? "Được cấp trên coi trọng nâng đỡ, có điềm thăng chức hoặc dự án lớn." : "Nên trau dồi chuyên môn, xử lý công việc chuẩn chỉ.")
      },
      tai_van: {
        tieu_de: "Tài Vận, Đầu Tư & Kinh Doanh",
        danh_gia: (ltSo === "Thê tài" || ltMat === "Thê tài" || soTuong === "Thanh Long") ? "TÀI LỘC HƯNG VƯỢNG" : (soTuong === "Huyền Vũ" ? "CẢNH BÁO HAO TÀI" : "TÀI VẬN TRUNG BÌNH"),
        hien_trang: `Thần tài lộc (Thê Tài): Sơ ${ltSo}, Mạt ${ltMat}. Đới tướng Sơ ${soTuong}.`,
        dong_luc_bien_chuyen: (ltMat === "Thê tài") ? "Dòng tiền dịch chuyển về cuối kỳ, có kết quả thu hồi tích lũy tốt." : "Tài chính xoay vòng ổn định, thu chi cân đối.",
        canh_bao_rui_ro: (soTuong === "Huyền Vũ") ? "Cẩn trọng bị lừa đảo ngầm hoặc ký hợp đồng mập mờ; tuyệt đối không cho vay tiền mạo hiểm!" : "Tránh bội chi vượt định mức dự toán.",
        sach_luoc_khuyen_nghi: "Tập trung thu hồi nợ cũ, thắt chặt điều khoản nghiệm thu thanh toán theo từng giai đoạn.",
        noi_dung: (soTuong === "Huyền Vũ") ? "Cẩn trọng bị lừa đảo ngầm hoặc ký hợp đồng mập mờ; tuyệt đối không cho vay tiền." : "Nguồn tiền quay vòng ổn định, có cơ hội gia tăng lợi nhuận nếu đầu tư bài bản."
      },
      hon_nhan: {
        tieu_de: "Hôn Nhân, Tình Duyên & Gia Đạo",
        danh_gia: (canChiRel.includes("sinh") || soTuong === "Lục Hợp") ? "GIA ĐẠO HÒA HỢP" : (canChiRel.includes("khắc") ? "CẦN NHƯỜNG NHỊN" : "TRUNG HÒA"),
        hien_trang: `Tương tác Can Chi: ${canChiRel}. Thần phát đoan đới ${soTuong}.`,
        dong_luc_bien_chuyen: canChiRel.includes("sinh") ? "Đôi bên tương trợ đầm ấm, cùng đồng lòng chia sẻ gánh nặng." : "Thế giằng co ý kiến, bên nào cũng giữ cái tôi riêng.",
        canh_bao_rui_ro: "Tránh để bất đồng tài chính hoặc áp lực bên ngoài ảnh hưởng vào hạnh phúc lứa đôi.",
        sach_luoc_khuyen_nghi: "Lắng nghe chân thành, cùng bàn bạc tháo gỡ khó khăn, nhường nhịn để giữ hòa khí.",
        noi_dung: `Tương tác Can Chi: ${canChiRel}. ` + ((soTuong === "Lục Hợp") ? "Đào hoa khởi sắc, gia đình đầm ấm, mâu thuẫn được tháo gỡ." : "Cần lắng nghe thấu hiểu đối phương để tránh khẩu thiệt.")
      },
      suc_khoe: {
        tieu_de: "Sức Khỏe & An Nguy Thể Chất",
        danh_gia: (soTuong === "Bạch Hổ" || matTuong === "Bạch Hổ") ? "ĐỀ PHÒNG TAI NẠN / BỆNH CẤP" : "THỂ TRẠNG BÌNH AN",
        hien_trang: `Can ngày ngự vận Trường sinh tại Sơ truyền. Tướng Sơ truyền là ${soTuong}.`,
        dong_luc_bien_chuyen: "Khí huyết lưu thông theo quy luật mùa, cần bồi bổ đúng tạng phủ suy giảm.",
        canh_bao_rui_ro: (soTuong === "Bạch Hổ" || matTuong === "Bạch Hổ") ? "Bạch Hổ đới sát: Đề phòng té ngã, tai nạn giao thông, thương tích kim loại hoặc viêm nhiễm cấp tính!" : "Chú ý các chứng bệnh về tiêu hóa và giấc ngủ.",
        sach_luoc_khuyen_nghi: "Duy trì lối sống điều độ, khám sức khỏe tổng quát và tuân thủ an toàn lao động.",
        noi_dung: (soTuong === "Bạch Hổ" || matTuong === "Bạch Hổ") ? "Chú ý huyết áp, xe cộ và thương tật tay chân; nên đi khám kiểm tra định kỳ." : "Khí huyết lưu thông tốt, tinh thần thư thái."
      },
      kien_tung: {
        tieu_de: "Pháp Lý & Tranh Chấp Hợp Đồng",
        danh_gia: (soTuong === "Chu Tước" || soTuong === "Câu Trận") ? "CÓ THỊ PHI CÔNG VĂN" : "HÒA GIẢI ÊM THẤM",
        hien_trang: `Thần tranh chấp: ${soTuong} tại Sơ truyền. Can Chi quan hệ: ${canChiRel}.`,
        dong_luc_bien_chuyen: "Cục diện rõ ràng, các căn cứ văn bản có tính pháp lý đầy đủ.",
        canh_bao_rui_ro: "Cẩn trọng câu từ thiếu chặt chẽ trong biên bản hoặc thỏa thuận miệng.",
        sach_luoc_khuyen_nghi: "Giải quyết bằng đàm phán thương lượng, lấy văn bản chứng cứ làm trọng tâm.",
        noi_dung: (soTuong === "Chu Tước" || soTuong === "Câu Trận") ? "Văn bản hợp đồng cần rà soát kỹ từng điều khoản; tránh đối đầu gay gắt tại tòa." : "Không có vướng mắc kiện tụng lớn, thủ tục pháp lý thông suốt."
      },
      xuat_hanh: {
        tieu_de: "Xuất Hành & Di Chuyển Đi Xa",
        danh_gia: (soChi === "Dần" || soChi === "Thân" || soChi === "Tỵ" || soChi === "Hợi") ? "DỊCH MÃ PHÁT ĐỘNG - NÊN ĐI" : "THÍCH HỢP TĨNH TẠI",
        hien_trang: `Sơ truyền: ${soChi} đới ${soTuong}. Động lực: ${(soChi === "Dần" || soChi === "Thân" || soChi === "Tỵ" || soChi === "Hợi") ? "Tứ Sinh động mã" : "Tĩnh địa"}.`,
        dong_luc_bien_chuyen: "Đi lại phục vụ công vụ hoặc ký kết hợp đồng, nơi đến mang lại kết nối tích cực.",
        canh_bao_rui_ro: "Tránh đi đêm trên các cung đường hiểm trở, chuẩn bị đầy đủ giấy tờ phương tiện.",
        sach_luoc_khuyen_nghi: "Chọn ngày giờ xuất hành hợp hướng Quý Nhân hoặc Thanh Long.",
        noi_dung: (soChi === "Dần" || soChi === "Thân" || soChi === "Tỵ" || soChi === "Hợi") ? "Đi xa gặp cơ hội mới, đổi văn phòng hoặc công tác mang lại hiệu quả cao." : "Đi lại gần, không nên đi xa trong thời điểm này."
      },
      muu_su: {
        tieu_de: "Mưu Cầu & Hợp Tác Liên Doanh",
        danh_gia: (canChiRel.includes("sinh") || ltMat === "Tử tôn") ? "MƯU SỰ TẤT THÀNH" : "VẠN SỰ KHỞI ĐẦU NAN",
        hien_trang: `Trục Thể Dụng: ${canChiRel}. Tam truyền: ${soChi} -> ${trungChi} -> ${matChi}.`,
        dong_luc_bien_chuyen: "Quá trình liên kết có tính hệ thống, các bên cùng chia sẻ trách nhiệm.",
        canh_bao_rui_ro: "Giai đoạn khởi đầu nhiều thủ tục phức tạp, dễ nản chí nếu thiếu kiên nhẫn.",
        sach_luoc_khuyen_nghi: "Phân chia vai trò rõ ràng, cam kết bằng văn bản có pháp nhân bảo đảm.",
        noi_dung: "Giai đoạn đầu cần kiên nhẫn vượt qua thử thách, kết cục về sau sẽ gặt hái kết quả xứng đáng."
      }
    };

    // Tầng 6: Timeline 3 giai đoạn & Thang điểm rủi ro
    let riskScore = 2; // Thang 1-5
    if (soTuong === "Bạch Hổ" || soTuong === "Huyền Vũ" || canChiRel.includes("Địa khắc Thiên")) riskScore += 1.5;
    if (soTuong === "Quý Nhân" || soTuong === "Thanh Long" || canChiRel.includes("Địa sinh Thiên")) riskScore -= 1;
    riskScore = Math.max(1, Math.min(5, Math.round(riskScore)));

    const timeline = {
      giaiDoan1_KhoiDau: {
        thoiGian: "Giai đoạn 1: Sơ phát (1 - 30 ngày đầu)",
        trangThai: `${truyenProcess.soTruyen.chi} (${soTuong}) · ${ltSo}`,
        trongTam: "Khởi sự, giải quyết thủ tục giấy tờ, định hình kế hoạch",
        danhGia: truyenProcess.soTruyen.phanTich
      },
      giaiDoan2_BienChuyen: {
        thoiGian: "Giai đoạn 2: Biến chuyển (30 - 90 ngày tiếp theo)",
        trangThai: `${truyenProcess.trungTruyen.chi} (${trungTuong}) · ${ltTrung}`,
        trongTam: "Triển khai cao điểm, phát sinh biến động, điều chỉnh sách lược",
        danhGia: truyenProcess.trungTruyen.phanTich
      },
      giaiDoan3_KetCuc: {
        thoiGian: "Giai đoạn 3: Hồi kết (90 - 180 ngày sau)",
        trangThai: `${truyenProcess.matTruyen.chi} (${matTuong}) · ${ltMat}`,
        trongTam: "Nghiệm thu, hoàn tất hợp đồng, thu hồi kết quả cuối cùng",
        danhGia: truyenProcess.matTruyen.phanTich
      }
    };

    // Tầng 7: Sách lược & Ứng kỳ
    const phuongViTot = {
      "Thủy": "Phương Bắc (Tý - Hợi)",
      "Mộc": "Phương Đông (Dần - Mão)",
      "Hỏa": "Phương Nam (Tỵ - Ngọ)",
      "Kim": "Phương Tây (Thân - Dậu)",
      "Thổ": "Trung cung / Bốn góc (Thìn Tuất Sửu Mùi)"
    }[hSo] || "Phương Bắc";

    // Hướng Dẫn Luận Đoán 10 Tình Huống Đời Sống Hàng Ngày
    const dailyLifeCases = {
      nha_dat: {
        tieu_de: "Mua Bán Nhà Đất, Thuê Nhà, Sửa Nhà & Bất Động Sản",
        dung_than: "Chi Ngày (Trạch), Khóa III (Chi Thượng Thần), Câu Trận, Thanh Long",
        khau_quyet: "Can vi nhân hề Chi vi trạch, Chi sinh Can hề gia trạch hưng",
        danh_gia: canChiRel.includes("Chi khắc Can") ? "TRẠCH KHẮC BẢN THÂN - CẨN TRỌNG" : (canChiRel.includes("Chi sinh Can") ? "ĐẠI CÁT - ĐẤT SINH LỢI" : "BÌNH HÒA"),
        loi_khuyen: canChiRel.includes("Chi khắc Can") ? "Kiểm tra kỹ quy hoạch, phong thủy và pháp lý trước khi cọc tiền." : "Thuận lợi để ký hợp đồng thuê hoặc mua bán bất động sản."
      },
      hop_dong: {
        tieu_de: "Ký Kết Hợp Đồng, Đàm Phán Thương Mại & Giao Dịch Làm Ăn",
        dung_than: "Khóa I (Bản thân), Khóa III (Đối tác), Chu Tước (Văn bản), Thê Tài",
        khau_quyet: "Can Chi tương sinh sự tất thành, Huyền Vũ lâm truyền phòng tráo trở",
        danh_gia: soTuong === "Huyền Vũ" ? "CẢNH BÁO CẠM BẪY HỢP ĐỒNG" : (ltMat === "Thê tài" ? "KÝ KẾT ĐẠI CÁT" : "CẦN ĐÀM PHÁN THÊM"),
        loi_khuyen: soTuong === "Huyền Vũ" ? "Rà soát kỹ phụ lục hợp đồng, không giải ngân khi chưa có bảo lãnh." : "Quyết đoán chốt hợp đồng và tiến hành theo kế hoạch."
      },
      xin_viec: {
        tieu_de: "Xin Việc, Phỏng Vấn, Thi Cử, Nâng Lương & Thăng Chức",
        dung_than: "Quan Quỷ (Chức vụ), Phụ Mẫu (Hồ sơ), Quý Nhân (Lãnh đạo)",
        khau_quyet: "Quan tinh đắc địa danh hiển đạt, Phụ mẫu hưng long bảng hữu danh",
        danh_gia: (soTuong === "Quý Nhân" || ltSo === "Quan quỷ") ? "TRÚNG TUYỂN / THĂNG TIẾN" : "CẦN TÍCH LŨY THÊM",
        loi_khuyen: (soTuong === "Quý Nhân" || ltSo === "Quan quỷ") ? "Tự tin thể hiện năng lực chuyên môn tại buổi phỏng vấn." : "Trau dồi thêm kỹ năng và kiên nhẫn chờ thời cơ tiếp theo."
      },
      vay_von: {
        tieu_de: "Vay Ngân Hàng, Mượn Tiền, Huy Động Vốn & Đòi Nợ",
        dung_than: "Chi Ngày (Bên cho vay), Thê Tài (Dòng tiền), Huynh Đệ (Trở ngại)",
        khau_quyet: "Chi sinh Can hề cầu tài dịch, Huynh đệ lâm truyền tiền tài phân",
        danh_gia: (ltSo === "Huynh đệ" || soTuong === "Huyền Vũ") ? "NGUY CƠ BẾ TẮC / NỢ KHÓ ĐÒI" : "GIẢI NGÂN THUẬN LỢI",
        loi_khuyen: (ltSo === "Huynh đệ" || soTuong === "Huyền Vũ") ? "Không cho vay mượn mạo hiểm; quản lý chặt chẽ dòng tiền." : "Hoàn tất thủ tục chứng từ để sớm giải ngân vốn."
      },
      giao_te: {
        tieu_de: "Gặp Gỡ Đối Tác, Tiếp Khách, Tiệc Tùng & Kết Giao Mới",
        dung_than: "Thái Thường (Yến tiệc), Lục Hợp (Hòa hợp), Huynh Đệ (Bằng hữu)",
        khau_quyet: "Thái Thường đắc vị tân bằng hỷ, Chu Tước hàm đao tiệc biến tranh",
        danh_gia: soTuong === "Chu Tước" ? "CẢNH BÁO BẤT HÒA TRÊN BÀN TIỆC" : "GIAO LƯU THÂN TÌNH",
        loi_khuyen: soTuong === "Chu Tước" ? "Kiểm soát lượng rượu bia, giữ hòa khí, tránh tranh cãi gay gắt." : "Duy trì phong thái lịch thiệp, mở rộng mạng lưới quan hệ."
      },
      kham_benh: {
        tieu_de: "Đi Khám Bệnh, Chọn Bác Sĩ, Phẫu Thuật & Chữa Trị Sức Khỏe",
        dung_than: "Can Ngày (Bệnh nhân), Quan Quỷ (Căn bệnh), Tử Tôn (Thầy thuốc), Bạch Hổ",
        khau_quyet: "Tử tôn phát động quỷ tặc tàng, Bạch Hổ lâm thân huyết quang thương",
        danh_gia: soTuong === "Bạch Hổ" ? "CẢNH BÁO BỆNH CẤP / PHẪU THUẬT" : "BÌNH AN / MAU PHỤC HỒI",
        loi_khuyen: soTuong === "Bạch Hổ" ? "Đi khám chuyên khoa tuyến trên ngay, không tự ý dùng thuốc tại nhà." : "Nghỉ ngơi điều độ, bồi dưỡng dinh dưỡng theo mùa."
      },
      tinh_cam: {
        tieu_de: "Tỏ Tình, Kết Hôn, Tình Cảm Lứa Đôi & Hóa Giải Mâu Thuẫn",
        dung_than: "Can Ngày (Nam), Chi Ngày (Nữ), Lục Hợp (Hôn nhân), Thiên Hậu",
        khau_quyet: "Can sinh Chi hề phu luyến phụ, Lục Hợp tương phùng giai ngẫu định",
        danh_gia: canChiRel.includes("khắc") ? "BẤT ĐỒNG - CẦN NHƯỜNG NHỊN" : "TÌNH CẢM NỒNG THẮM",
        loi_khuyen: canChiRel.includes("khắc") ? "Lắng nghe chân thành, hạ bớt cái tôi để tháo gỡ hiểu lầm." : "Thời điểm tốt để bàn tính chuyện tương lai lứa đôi."
      },
      that_vat: {
        tieu_de: "Mất Đồ, Rơi Ví, Thất Lạc Giấy Tờ & Nghi Bị Trộm Cắp",
        dung_than: "Huyền Vũ (Kẻ trộm), Cung Địa bàn Huyền Vũ lâm, Tuần Không",
        khau_quyet: "Huyền Vũ nhập mộ vật do tại, Lạc nhập không vong mạc vọng tầm",
        danh_gia: (soTuong === "Huyền Vũ" && ["Thìn", "Tuất", "Sửu", "Mùi"].includes(soChi)) ? "ĐỒ CÒN Ở GẦN - DỄ TÌM LẠI" : "CẦN TÌM KỸ LẠI LỘ TRÌNH",
        loi_khuyen: "Tìm kiếm kỹ tại các góc khuất, ẩm ướt hoặc đồ đạc che lấp trong 3 ngày đầu."
      },
      xuat_hanh: {
        tieu_de: "Đi Công Tác, Du Lịch, Mua Vé Tàu Xe & An Toàn Di Chuyển",
        dung_than: "Dịch Mã, Tứ Sinh (Dần Thân Tỵ Hợi), Bạch Hổ (Tai nạn)",
        khau_quyet: "Mã động hành nhân tại đạo trung, Bạch Hổ đương đầu thiết mạc hành",
        danh_gia: soTuong === "Bạch Hổ" ? "CẢNH BÁO TAI NẠN XE / NÊN HOÃN" : "XUẤT HÀNH ĐẠI LỢI",
        loi_khuyen: soTuong === "Bạch Hổ" ? "Bảo dưỡng xe cộ, tránh đi đêm trên cung đường nguy hiểm." : "Khởi hành đúng giờ hoàng đạo, chọn phương vị Quý Nhân."
      },
      khieu_nai: {
        tieu_de: "Tranh Chấp Hàng Xóm, Va Quẹt Giao Thông & Khiếu Nại Hành Chính",
        dung_than: "Chu Tước (Khẩu thiệt), Câu Trận (Dây dưa), Quý Nhân (Người hòa giải)",
        khau_quyet: "Chu Tước thiêu tâm khẩu thiệt khởi, Quý Nhân giáng lâm giải ân cừu",
        danh_gia: (soTuong === "Chu Tước" || soTuong === "Câu Trận") ? "DỄ DÂY DƯA TRANH CHẤP" : "HÒA GIẢI ÊM THẤM",
        loi_khuyen: (soTuong === "Chu Tước" || soTuong === "Câu Trận") ? "Thu thập chứng cứ khách quan, ưu tiên hòa giải ngoài tòa án." : "Giải thích nhã nhặn, tôn trọng quy tắc chung."
      }
    };

    return {
      canNgay, chiNgay, chiGio, nguyetTuong, isDaytime, tenTong,
      solarTimeInfo: chartData.solarTimeInfo,
      theDung: { canChiRel, canChiAdvice },
      tuThoi: { season, vuongTable, canKhi: vuongTable[hCan] || "Bình" },
      tamTruyenProcess: truyenProcess,
      biFaFuDetected: detectedBiFa,
      chuyenDe7,
      dailyLifeCases,
      timeline,
      riskScore,
      sachLuoc: {
        loiKhuyen: (riskScore >= 4) ? "Thời thế bất lợi, nên giữ mình thận trọng, dĩ hòa vi quý, không nên khuếch trương quy mô." : "Khí thế hưng vượng, nên quyết đoán nắm bắt thời cơ, mở rộng quan hệ.",
        phuongViTot,
        ungKy: `Ứng kỳ vào ngày hoặc tháng có Địa chi: ${soChi} hoặc ${matChi}.`
      }
    };
  }

  // Xuất API công khai
  
  // =========================================================================
  // 6. TIỆN ÍCH XUẤT BÁO CÁO & RÀO CHẮN AI (ZERO-HALLUCINATION GUARD)
  // =========================================================================
  function formatTextReport(interp) {
    if (!interp) return "";
    let lines = [];
    lines.push("=== BÁO CÁO LUẬN GIẢI CHUYÊN SÂU LỤC NHÂM ĐẠI ĐỘN ===");
    lines.push(`Thời khắc: Ngày ${interp.canNgay} ${interp.chiNgay} · Giờ ${interp.chiGio} · Nguyệt Tướng ${interp.nguyetTuong}`);
    if (interp.solarTimeInfo) {
      lines.push(`Hiệu chỉnh Giờ Chân Thái Dương: ${interp.solarTimeInfo.trueSolarDatetime} (Độ lệch: ${interp.solarTimeInfo.totalOffsetMinutes >= 0 ? '+' : ''}${interp.solarTimeInfo.totalOffsetMinutes} phút, EOT: ${interp.solarTimeInfo.eotMinutes >= 0 ? '+' : ''}${interp.solarTimeInfo.eotMinutes}m, Kinh độ: ${interp.solarTimeInfo.longitudeOffsetMinutes >= 0 ? '+' : ''}${interp.solarTimeInfo.longitudeOffsetMinutes}m)`);
    }
    lines.push(`Tông Môn: ${interp.tenTong} · Mùa: ${interp.tuThoi.season} (${interp.tuThoi.canKhi})`);
    lines.push(`Trục Thể Dụng: ${interp.theDung.canChiRel}`);
    lines.push(`Lời khuyên Thể Dụng: ${interp.theDung.canChiAdvice}`);
    lines.push(`Đánh giá rủi ro: ${interp.riskScore}/5 Sao · Sách lược: ${interp.sachLuoc.loiKhuyen}`);
    lines.push(`Phương vị cát tường: ${interp.sachLuoc.phuongViTot}`);
    lines.push(`Ứng kỳ: ${interp.sachLuoc.ungKy}`);
    lines.push("");

    lines.push("--- TIẾN TRÌNH TAM TRUYỀN ---");
    lines.push(`1. Sơ Truyền: ${interp.tamTruyenProcess.soTruyen.chi} (${interp.tamTruyenProcess.soTruyen.tuong}) · ${interp.tamTruyenProcess.soTruyen.than} [Vận: ${interp.tamTruyenProcess.soTruyen.van}] - ${interp.tamTruyenProcess.soTruyen.phanTich}`);
    lines.push(`2. Trung Truyền: ${interp.tamTruyenProcess.trungTruyen.chi} (${interp.tamTruyenProcess.trungTruyen.tuong}) · ${interp.tamTruyenProcess.trungTruyen.than} - ${interp.tamTruyenProcess.trungTruyen.phanTich}`);
    lines.push(`3. Mạt Truyền: ${interp.tamTruyenProcess.matTruyen.chi} (${interp.tamTruyenProcess.matTruyen.tuong}) · ${interp.tamTruyenProcess.matTruyen.than} [Vận: ${interp.tamTruyenProcess.matTruyen.van}] - ${interp.tamTruyenProcess.matTruyen.phanTich}`);
    lines.push("");

    if (interp.biFaFuDetected && interp.biFaFuDetected.length > 0) {
      lines.push("--- CÁCH CỤC TẤT PHÁP PHÚ (THIỆU NGẠN HÒA) ---");
      interp.biFaFuDetected.forEach((bf, i) => {
        lines.push(`${i + 1}. [${bf.ten}] (${bf.han_tu || ''}): ${bf.y_nghia || ''} -> Lời khuyên: ${bf.chi_dan}`);
      });
      lines.push("");
    }

    lines.push("--- DÒNG THỜI GIAN 3 GIAI ĐOẠN ---");
    lines.push(`• ${interp.timeline.giaiDoan1_KhoiDau.thoiGian}: ${interp.timeline.giaiDoan1_KhoiDau.trangThai} | ${interp.timeline.giaiDoan1_KhoiDau.trongTam}`);
    lines.push(`• ${interp.timeline.giaiDoan2_BienChuyen.thoiGian}: ${interp.timeline.giaiDoan2_BienChuyen.trangThai} | ${interp.timeline.giaiDoan2_BienChuyen.trongTam}`);
    lines.push(`• ${interp.timeline.giaiDoan3_KetCuc.thoiGian}: ${interp.timeline.giaiDoan3_KetCuc.trangThai} | ${interp.timeline.giaiDoan3_KetCuc.trongTam}`);
    lines.push("");

    lines.push("--- 7 CHUYÊN ĐỀ SỰ VỤ QUAN TRỌNG ---");
    Object.values(interp.chuyenDe7).forEach(cd => {
      lines.push(`▶ ${cd.tieu_de} [${cd.danh_gia}]:`);
      lines.push(`   - Hiện trạng: ${cd.hien_trang || cd.noi_dung}`);
      if (cd.dong_luc_bien_chuyen) lines.push(`   - Xu thế: ${cd.dong_luc_bien_chuyen}`);
      if (cd.canh_bao_rui_ro) lines.push(`   - Cảnh báo: ${cd.canh_bao_rui_ro}`);
      if (cd.sach_luoc_khuyen_nghi) lines.push(`   - Sách lược: ${cd.sach_luoc_khuyen_nghi}`);
    });
    lines.push("");

    if (interp.dailyLifeCases) {
      lines.push("--- 8 TÌNH HUỐNG SỰ VỤ THỰC TẾ HÀNG NGÀY ---");
      Object.values(interp.dailyLifeCases).forEach(dl => {
        lines.push(`• ${dl.tieu_de}: [${dl.danh_gia}] - ${dl.loi_khuyen}`);
      });
    }

    return lines.join("\n");
  }

  function buildAIPrompt(interp, customQuestion) {
    return `Bạn là một Bậc thầy Túc Nho & Chuyên Gia Đại Lục Nhâm Thần Khóa (六壬神課) uyên bác, đĩnh đạc và chuẩn mực.
Nhiệm vụ của bạn là dựa trên Bản Kê Chân Lý Toán Học Xác Định (Ground-Truth Anchor) của quẻ Lục Nhâm dưới đây để biên tập, trau chuốt câu từ và đưa ra phân tích sắc bén, sâu sắc, giàu giá trị thực tiễn.

QUY TẮC BẤT BIẾN NGHIÊM NGẶT (ZERO-HALLUCINATION INVARIANT):
1. GIỮ NGUYÊN 100% CÁC SỐ LIỆU VÀ CÁC THỰC THỂ GỐC: Can Ngày (${interp.canNgay}), Chi Ngày (${interp.chiNgay}), Giờ (${interp.chiGio}), Nguyệt Tướng (${interp.nguyetTuong}), Tông Môn (${interp.tenTong}), Tam Truyền Sơ (${interp.tamTruyenProcess.soTruyen.chi} - ${interp.tamTruyenProcess.soTruyen.tuong}) -> Trung (${interp.tamTruyenProcess.trungTruyen.chi} - ${interp.tamTruyenProcess.trungTruyen.tuong}) -> Mạt (${interp.tamTruyenProcess.matTruyen.chi} - ${interp.tamTruyenProcess.matTruyen.tuong}).
2. TUYỆT ĐỐI KHÔNG tự ý thay đổi ngũ hành, không đổi tên Thiên Tướng, không đảo lộn cát hung hay điểm rủi ro (${interp.riskScore}/5 Sao).
3. Văn phong hành chính - kỹ thuật học thuật, khúc chiết, đĩnh đạc, không sáo rỗng, không phóng đại.

DỮ LIỆU BÀN QUẺ GỐC (GROUND TRUTH):
${formatTextReport(interp)}

${customQuestion ? "CÂU HỎI TƯ VẤN CỤ THỂ CỦA ĐƯƠNG SỐ:\n" + customQuestion : "HÃY BIÊN TẬP VÀ ĐƯA RA LỜI BÌNH CHUYÊN SÂU TOÀN DIỆN CHO QUẺ NÀY."}
`;
  }

  function validateFactualStructure(aiText, interp) {
    if (!aiText || typeof aiText !== "string") return false;
    // Kiểm tra bảo toàn các từ khóa cốt lõi
    const hasCan = aiText.includes(interp.canNgay);
    const hasChi = aiText.includes(interp.chiNgay);
    const hasSoChi = aiText.includes(interp.tamTruyenProcess.soTruyen.chi);
    return (hasCan && hasChi && hasSoChi);
  }

  return {
    DIA_CHI, THIEN_CAN,
    NGU_HANH_CAN, NGU_HANH_CHI,
    TAT_PHAP_PHU_100,
    calculateTrueSolarTime,
    getLucThan,
    getTruongSinhStage,
    interpretChart,
    normalizeThienTuong,
    adaptChartData,
    formatTextReport,
    buildAIPrompt,
    validateFactualStructure
  };
}));
