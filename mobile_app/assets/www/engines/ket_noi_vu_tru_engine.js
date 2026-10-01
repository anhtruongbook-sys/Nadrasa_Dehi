/**
 * NETA LIGHT - KỲ MÔN ĐỘN GIÁP KẾT NỐI VŨ TRỤ ENGINE
 * File: engines/ket_noi_vu_tru_engine.js
 * ---------------------------------------------------------------------------------
 * Đóng gói độc lập toàn bộ các thuật toán cốt lõi từ ấn phẩm:
 * "Kỳ Môn Độn Giáp - Kết Nối Vũ Trụ" (Tác giả: Nguyễn Tấn Công, 334 trang).
 *
 * CÁC PHÂN HỆ CỐT LÕI:
 * 1. Hệ thống Thập Thần (10 Deities) với hồ sơ tiềm thức & năng lượng vũ trụ.
 * 2. Thuật toán phân bổ Thập Thần Âm/Dương (Câu Trận & Chu Tước vs Bạch Hổ & Huyền Vũ).
 * 3. Động cơ định Cục TRÍ NHUẬN PHÁP (Zhi Run Method, p. 307) & so sánh Sách Bổ.
 * 4. Động cơ Chiêm Đoán Vạn Sự (Omni-Forecast) 12 Lĩnh Vực & 5 Mối Quan Hệ (0 - 100đ).
 * 5. Động cơ Kỳ Môn Phong Thủy 24 Sơn Hướng & Bộ kiểm định Cấm Kỵ 5 Phòng Ốc.
 * 6. Quy trình 5 Bước Hạ Sóng Não Alpha (7-14 Hz) & Tọa Lưng Thần Hộ Mệnh.
 */

(function (global) {
  'use strict';

  // ==============================================================================
  // 1. TỪ ĐIỂN 10 THẦN HỘ MỆNH (THẬP THẦN KẾT NỐI VŨ TRỤ)
  // ==============================================================================
  const KET_NOI_VU_TRU_10_DEITIES = {
    'Trực Phù': {
      name: 'Trực Phù',
      alias: 'Thần Đèn (Chief)',
      pages: [92, 148],
      nature: 'Dương Thần',
      element: 'Thổ',
      role: 'Thủ lĩnh của chư thần, biểu tượng của sự che chở tâm linh và hào quang cao nhất.',
      traits: 'Hào phóng, uy nghi, chính trực, có năng lực biến mọi ước nguyện thiện lành thành hiện thực.',
      suitable_actions: 'Yêu cầu sự bảo trợ tối cao, giải trừ hạn ách, thu hút quý nhân cấp cao, lãnh đạo quy tụ lòng người.',
      caution: 'Chỉ dùng cho mục đích chân chính thiện lành; tâm tà ắt mất kết nối.',
      color: '#f59e0b',
      energy: 'Hào quang vàng kim chói lọi',
      affirmation: 'Tôi kết nối với Bậc Đạo Sư & Tâm Thức Tối Cao, tâm sáng dẫn lối, sở nguyện thiện lành đều được hồi đáp.',
      meditation_guide: 'Ngồi thẳng lưng, lưng quay chuẩn về phương vị Trực Phù. Nhắm mắt hít sâu, cảm nhận hào quang vàng kim ấm áp từ sau gáy rót qua cột sống, phát khởi ý niệm bảo trợ.'
    },
    'Thái Âm': {
      name: 'Thái Âm',
      alias: 'Thần Trí Tuệ (Moon)',
      pages: [94, 151],
      nature: 'Âm Thần',
      element: 'Kim',
      role: 'Bảo trợ trí tuệ, mưu lược thâm sâu, kế hoạch bí mật và sự thấu suốt cội nguồn.',
      traits: 'Trầm tĩnh, tỉ mỉ, bao dung, nhìn thấy rõ những điều ẩn giấu sau bức màn vô hình.',
      suitable_actions: 'Nghiên cứu học thuật chuyên sâu, lập kế hoạch chiến lược ngầm, tha thứ, chữa lành tâm lý.',
      caution: 'Tránh đa sầu đa cảm hoặc suy diễn quá mức gây trì trệ hành động.',
      color: '#38bdf8',
      energy: 'Ánh trăng bạc thanh lương',
      affirmation: 'Trí huệ như ánh trăng vằng vặc, tĩnh lặng soi sáng, thấu tỏ cội nguồn, tâm an trí sáng.',
      meditation_guide: 'Lưng quay về hướng Thái Âm. Quán tưởng ánh trăng bạc mát dịu thẩm thấu từ đỉnh đầu xuống đan điền, quét sạch mọi căng thẳng lo âu, tâm trí phẳng lặng như mặt hồ thu.'
    },
    'Cửu Thiên': {
      name: 'Cửu Thiên',
      alias: 'Thần Tầm Nhìn (Nine Heaven)',
      pages: [95, 153],
      nature: 'Dương Thần',
      element: 'Kim',
      role: 'Khả năng nhìn thấu tương lai, tầm nhìn vĩ mô đột phá và sự thăng tiến vượt bậc.',
      traits: 'Năng động, hướng ngoại, khát vọng lớn, bay bổng, có khả năng hình dung hiện thực hóa mục tiêu xuất sắc.',
      suitable_actions: 'Mở rộng thị trường, mở chi nhánh mới, truyền cảm hứng, du lịch, quảng bá thương hiệu toàn cầu.',
      caution: 'Tránh ảo tưởng xa vời rời rạc khỏi nền tảng thực tế.',
      color: '#a855f7',
      energy: 'Tử khí đông lai tím rực rỡ',
      affirmation: 'Tầm nhìn không giới hạn, năng lượng đột phá, tôi vươn tới những đỉnh cao mới với sự tự tin tuyệt đối.',
      meditation_guide: 'Lưng quay về hướng Cửu Thiên. Hít sâu vào lồng ngực trên, cảm nhận luồng sinh khí mạnh mẽ tiếp thêm dũng khí và lòng tin vào bản thân.'
    },
    'Cửu Địa': {
      name: 'Cửu Địa',
      alias: 'Thần Thổ Địa (Nine Earth)',
      pages: [96, 155],
      nature: 'Âm Thần',
      element: 'Thổ',
      role: 'Bảo tồn tài sản, năng lượng đất mẹ, sự kiên nhẫn, điềm tĩnh và tích lũy bền vững.',
      traits: 'Chậm rãi, kín đáo, chắc chắn, giàu có về tài nguyên và năng lực bất động sản.',
      suitable_actions: 'Đầu tư bất động sản, tích lũy tài sản dài hạn, phòng thủ, giữ bí mật, duy trì hòa khí gia đạo.',
      caution: 'Tránh bảo thủ, quá chậm chạp làm vuột mất thời cơ thị trường.',
      color: '#10b981',
      energy: 'Năng lượng xanh ngọc bích vững chãi',
      affirmation: 'Tôi vững vàng như núi đá, gốc rễ bám sâu vào đất mẹ, tài sản sinh sôi bền vững từng ngày.',
      meditation_guide: 'Lưng quay về hướng Cửu Địa. Cảm nhận từ trường dày đặc vững chãi từ lòng đất truyền lên lưng, đan điền ấm dần, hơi thở trở nên sâu, chậm và êm ái.'
    },
    'Lục Hợp': {
      name: 'Lục Hợp',
      alias: 'Thần Kết Nối (Six Harmony)',
      pages: [97, 157],
      nature: 'Âm Thần',
      element: 'Mộc',
      role: 'Bảo trợ các mối quan hệ nhân duyên, hôn nhân, tình bạn và liên minh kinh doanh.',
      traits: 'Hòa đồng, duyên dáng, khả năng thuyết phục, kết nối con người với con người kỳ diệu.',
      suitable_actions: 'Ký kết hợp đồng, hàn gắn tình cảm, mai mối hôn nhân, đàm phán thương mại, mở rộng mạng lưới.',
      caution: 'Tránh cả nể, không dứt khoát trước những mối quan hệ độc hại.',
      color: '#ec4899',
      energy: 'Ánh sáng hồng ngọc ấm áp',
      affirmation: 'Tâm từ tỏa rạng, gieo duyên thiện lành, vạn vật tương hợp, đón nhận sự đồng thuận và yêu thương.',
      meditation_guide: 'Lưng quay về hướng Lục Hợp. Quán tưởng ánh sáng hồng bao bọc lấy trái tim, khởi tâm từ bi và tha thứ cho mọi khúc mắc, lan tỏa bình an đến đối tác.'
    },
    'Đằng Xà': {
      name: 'Đằng Xà',
      alias: 'Thầy Phù Thủy Đương Đại (Surging Snake)',
      pages: [98, 158],
      nature: 'Âm Thần',
      element: 'Hỏa',
      role: 'Chủ về linh cảm giác quan thứ 6, tâm linh biến ảo và khả năng thao túng năng lượng vô hình.',
      traits: 'Sắc sảo, trực giác cực nhạy, khó lường, đọc vị cảm xúc đối phương trong nháy mắt.',
      suitable_actions: 'Phát triển trực giác tâm linh, phòng vệ trước năng lượng tiêu cực, tạo bất ngờ chiến lược cho đối thủ.',
      caution: 'Tránh đa nghi, lo âu thái quá dẫn đến mất ngủ hoặc suy nhược thần kinh.',
      color: '#ef4444',
      energy: 'Ngọn lửa biến ảo linh hoạt',
      affirmation: 'Lắng nghe trực giác tĩnh lặng, nhìn thấu chuyển động vô hình, làm chủ năng lượng chuyển hóa.',
      meditation_guide: 'Lưng quay về hướng Đằng Xà. Thả lỏng toàn bộ các cơ mặt, lắng nghe nhịp tim và trực giác sâu kín nhất trỗi dậy mà không phán xét.'
    },
    'Câu Trận': {
      name: 'Câu Trận',
      alias: 'Bậc Thầy Tâm Linh (Grappling Hook)',
      pages: [99, 160],
      nature: 'Dương Thần',
      element: 'Thổ',
      role: 'Đối diện và giải phóng nỗi đau nội tâm, nợ nghiệp và giải quyết các trở ngại gốc rễ.',
      traits: 'Chịu đựng gian khổ, ký ức sâu sắc, khả năng chuyển hóa đau thương thành sức mạnh tinh thần bất khuất.',
      suitable_actions: 'Giải tỏa ám ảnh quá khứ, giải trừ nợ nần khó đòi, rèn luyện ý chí thép trước nghịch cảnh.',
      caution: 'Tránh ôm giữ hận thù, cố chấp làm tổn thương chính bản thân mình.',
      color: '#ca8a04',
      energy: 'Khối hoàng thổ kiên cố',
      affirmation: 'Mọi thử thách là bài học tiến hóa, tôi buông bỏ gánh nặng quá khứ, tôi tự do và mạnh mẽ.',
      meditation_guide: 'Lưng quay về hướng Câu Trận. Đối diện thẳng thắn với nỗi sợ hoặc ký ức chưa trọn vẹn, hít thở sâu và quán tưởng buông bỏ hoàn toàn vào hư không.'
    },
    'Bạch Hổ': {
      name: 'Bạch Hổ',
      alias: 'Sức Mạnh Của Năng Lượng (White Tiger)',
      pages: [100, 162],
      nature: 'Dương Thần',
      element: 'Kim',
      role: 'Nguồn thể lực dồi dào, sự can đảm, đột phá và khả năng vượt qua áp lực cực đại.',
      traits: 'Hùng dũng, quyết đoán, tràn đầy năng lượng hành động, không lùi bước trước thử thách.',
      suitable_actions: 'Thi đấu thể thao, đòi hỏi sức bền thể lực, phá vỡ bế tắc dự án, vượt qua khủng hoảng khốc liệt.',
      caution: 'Cần kiểm soát sự nóng giận, kiềm chế xung đột tay chân hoặc lời nói cay nghiệt.',
      color: '#e2e8f0',
      energy: 'Luồng kình phong trắng bạc dũng mãnh',
      affirmation: 'Dũng khí kiên định như kim cương, sức mạnh dồi dào, bứt phá mọi rào cản và chướng ngại.',
      meditation_guide: 'Lưng quay về hướng Bạch Hổ. Tập trung vào huyệt Đan Điền dưới rốn, cảm nhận luồng nhiệt năng cuồn cuộn tiếp sức cho toàn bộ cơ bắp và ý chí.'
    },
    'Chu Tước': {
      name: 'Chu Tước',
      alias: 'Sức Mạnh Của Lời Nói (Red Phoenix)',
      pages: [101, 163],
      nature: 'Dương Thần',
      element: 'Hỏa',
      role: 'Bảo trợ cho lời ăn tiếng nói, khả năng hùng biện, truyền thông đại chúng và danh tiếng vang xa.',
      traits: 'Sôi nổi, hoạt ngôn, có sức lôi cuốn bằng âm thanh, truyền cảm hứng mạnh mẽ.',
      suitable_actions: 'Thuyết trình trước đám đông, marketing, livestream bán hàng, xử lý khủng hoảng truyền thông.',
      caution: 'Cẩn trọng họa từ miệng mà ra, tránh nói quá sự thật hoặc vướng vào thị phi đàm tiếu.',
      color: '#f97316',
      energy: 'Lửa thiêng Phượng Hoàng đỏ rực',
      affirmation: 'Lời nói của tôi mang năng lượng tình thương, chân lý và cảm hứng, lan tỏa giá trị tốt đẹp đến muôn người.',
      meditation_guide: 'Lưng quay về hướng Chu Tước. Tập trung vào luân xa cổ họng, hít vào hơi ấm quang minh và thở ra lời cầu chúc bình an cho vạn vật.'
    },
    'Huyền Vũ': {
      name: 'Huyền Vũ',
      alias: 'Nhà Ngoại Cảm (Black Tortoise)',
      pages: [102, 165],
      nature: 'Âm Thần',
      element: 'Thủy',
      role: 'Đọc vị tâm lý người khác, ngoại cảm, thương vụ ngầm và thấu suốt cảm xúc ẩn kín.',
      traits: 'Huyền bí, mưu trí, hiểu thấu tâm lý đám đông, nhìn thấu các dòng tiền và giao dịch ngầm.',
      suitable_actions: 'Nghiên cứu hành vi người tiêu dùng, đàm phán kín, giải mã ngôn ngữ cơ thể, marketing tâm lý.',
      caution: 'Tránh mưu mô trục lợi bất chính hoặc tham gia vào các hành vi lừa gạt, trộm cắp ngầm.',
      color: '#1e293b',
      energy: 'Dòng nước sâu thẳm tĩnh lặng',
      affirmation: 'Tâm trí tôi thấu suốt mọi ngóc ngách, phân biệt rõ thực ảo, dùng trí tuệ bảo vệ chân lý và sự thật.',
      meditation_guide: 'Lưng quay về hướng Huyền Vũ. Quán tưởng mình như đáy biển sâu thẳm tĩnh lặng tuyệt đối, mọi làn sóng cảm xúc bên ngoài đều không thể lay chuyển.'
    }
  };

  // ==============================================================================
  // 2. PHÂN BỔ THẬP THẦN ÂM / DƯƠNG ĐỘN (Trang 322)
  // ==============================================================================
  const YANG_DEITY_RING = ['Trực Phù', 'Đằng Xà', 'Thái Âm', 'Lục Hợp', 'Câu Trận', 'Chu Tước', 'Cửu Địa', 'Cửu Thiên'];
  const YIN_DEITY_RING  = ['Trực Phù', 'Cửu Thiên', 'Cửu Địa', 'Huyền Vũ', 'Bạch Hổ', 'Lục Hợp', 'Thái Âm', 'Đằng Xà'];
  const CLOCKWISE_8_PALACES = [6, 1, 8, 3, 4, 9, 2, 7]; // Càn, Khảm, Cấn, Chấn, Tốn, Ly, Khôn, Đoài

  function allocate10Deities(dunType, chiefPalaceId) {
    const isYang = (dunType || '').includes('Dương');
    const ring = isYang ? YANG_DEITY_RING : YIN_DEITY_RING;
    const startIdx = CLOCKWISE_8_PALACES.indexOf(Number(chiefPalaceId));
    if (startIdx === -1) return {};

    const palaceDeityMap = {};
    for (let i = 0; i < 8; i++) {
      let targetPalace;
      if (isYang) {
        // Dương độn: đi thuận kim đồng hồ
        targetPalace = CLOCKWISE_8_PALACES[(startIdx + i) % 8];
      } else {
        // Âm độn: đi nghịch kim đồng hồ
        targetPalace = CLOCKWISE_8_PALACES[(startIdx - i + 8) % 8];
      }
      palaceDeityMap[targetPalace] = ring[i];
    }
    return palaceDeityMap;
  }

  // ==============================================================================
  // 3. ĐỘNG CƠ ĐỊNH CỤC TRÍ NHUẬN PHÁP (Zhi Run Method, Trang 307-313)
  // ==============================================================================
  const CAN_VN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
  const CHI_VN = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

  const ZHI_RUN_JU_TABLE = {
    // Dương Độn
    "Đông Chí":   { dun: "Dương Độn", ju: [1, 7, 4] },
    "Tiểu Hàn":   { dun: "Dương Độn", ju: [2, 8, 5] },
    "Đại Hàn":    { dun: "Dương Độn", ju: [3, 9, 6] },
    "Lập Xuân":   { dun: "Dương Độn", ju: [8, 5, 2] },
    "Vũ Thủy":    { dun: "Dương Độn", ju: [9, 6, 3] },
    "Kinh Trập":  { dun: "Dương Độn", ju: [1, 7, 4] },
    "Xuân Phân":  { dun: "Dương Độn", ju: [3, 9, 6] },
    "Thanh Minh": { dun: "Dương Độn", ju: [4, 1, 7] },
    "Cốc Vũ":     { dun: "Dương Độn", ju: [5, 2, 8] },
    "Lập Hạ":     { dun: "Dương Độn", ju: [4, 1, 7] },
    "Tiểu Mãn":   { dun: "Dương Độn", ju: [5, 2, 8] },
    "Mang Chủng": { dun: "Dương Độn", ju: [6, 3, 9] },
    // Âm Độn
    "Hạ Chí":     { dun: "Âm Độn", ju: [9, 3, 6] },
    "Tiểu Thử":   { dun: "Âm Độn", ju: [8, 2, 5] },
    "Đại Thử":    { dun: "Âm Độn", ju: [7, 1, 4] },
    "Lập Thu":    { dun: "Âm Độn", ju: [2, 5, 8] },
    "Xử Thử":     { dun: "Âm Độn", ju: [1, 4, 7] },
    "Bạch Lộ":    { dun: "Âm Độn", ju: [9, 3, 6] },
    "Thu Phân":   { dun: "Âm Độn", ju: [7, 1, 4] },
    "Hàn Lộ":     { dun: "Âm Độn", ju: [6, 9, 3] },
    "Sương Giáng":{ dun: "Âm Độn", ju: [5, 8, 2] },
    "Lập Đông":   { dun: "Âm Độn", ju: [6, 9, 3] },
    "Tiểu Tuyết": { dun: "Âm Độn", ju: [5, 8, 2] },
    "Đại Tuyết":  { dun: "Âm Độn", ju: [4, 7, 1] }
  };

  function findFuTou(dayCan, dayChi) {
    const cIdx = CAN_VN.indexOf(dayCan);
    const chIdx = CHI_VN.indexOf(dayChi);
    if (cIdx === -1 || chIdx === -1) return { fuTouName: 'Giáp Tý', yuanName: 'Thượng Nguyên', yuanIdx: 0 };

    const offset = cIdx % 5;
    const fuCanIdx = cIdx - offset;
    const fuChiIdx = (chIdx - offset + 12) % 12;

    const fuCan = CAN_VN[fuCanIdx];
    const fuChi = CHI_VN[fuChiIdx];
    const fuTouName = `${fuCan} ${fuChi}`;

    let yuanIdx = 0; // 0: Thượng, 1: Trung, 2: Hạ
    if (['Tý', 'Ngọ', 'Mão', 'Dậu'].includes(fuChi)) {
      yuanIdx = 0;
    } else if (['Dần', 'Thân', 'Tỵ', 'Hợi'].includes(fuChi)) {
      yuanIdx = 1;
    } else {
      yuanIdx = 2;
    }

    const yuanNames = ['Thượng Nguyên', 'Trung Nguyên', 'Hạ Nguyên'];
    return { fuTouName, yuanName: yuanNames[yuanIdx], yuanIdx };
  }

  function calculateZhiRunJu(solarTerm, dayCan, dayChi, daysSinceTerm = 0) {
    const termInfo = ZHI_RUN_JU_TABLE[solarTerm] || ZHI_RUN_JU_TABLE["Xuân Phân"];
    const { fuTouName, yuanName, yuanIdx } = findFuTou(dayCan, dayChi);

    let juNumber = termInfo.ju[yuanIdx];
    let isRun = false;
    let chaoShenStatus = "Chính Thụ (Đúng tiết)";

    // Quy tắc Nhuận Cục Trí Nhuận (trang 307):
    // Khi Phù Đầu đến trước Tiết Khí vượt quá 9 ngày (Siêu Thần > 9 ngày)
    // Tại tiết Mang Chủng (Dương Độn) hoặc Đại Tuyết (Âm Độn) thì Nhuận 15 ngày
    if (daysSinceTerm > 9 && (solarTerm === "Mang Chủng" || solarTerm === "Đại Tuyết")) {
      isRun = true;
      chaoShenStatus = "Nhuận Cục (Siêu Thần quá 9 ngày)";
    } else if (daysSinceTerm > 0) {
      chaoShenStatus = `Siêu Thần (${daysSinceTerm} ngày)`;
    } else if (daysSinceTerm < 0) {
      chaoShenStatus = `Tiếp Khí (${Math.abs(daysSinceTerm)} ngày)`;
    }

    return {
      method: "Trí Nhuận Pháp (Zhi Run)",
      solarTerm: solarTerm,
      dunType: termInfo.dun,
      juNumber: juNumber,
      fuTou: fuTouName,
      yuanName: yuanName,
      isRun: isRun,
      chaoShenStatus: chaoShenStatus
    };
  }

  // ==============================================================================
  // 4. ĐỘNG CƠ CHIÊM ĐOÁN VẠN SỰ 12 LĨNH VỰC (OMNI-FORECAST ENGINE)
  // ==============================================================================
  const PALACE_WUXING = {
    1: 'Thủy', 8: 'Thổ', 3: 'Mộc', 4: 'Mộc',
    9: 'Hỏa', 2: 'Thổ', 7: 'Kim', 6: 'Kim', 5: 'Thổ'
  };

  const WUXING_RELATIONS = {
    'Thủy': { generates: 'Mộc', destroys: 'Hỏa' },
    'Mộc':  { generates: 'Hỏa', destroys: 'Thổ' },
    'Hỏa':  { generates: 'Thổ', destroys: 'Kim' },
    'Thổ':  { generates: 'Kim', destroys: 'Thủy' },
    'Kim':  { generates: 'Thủy', destroys: 'Mộc' }
  };

  function evaluate5Relationship(subjPalace, objPalace) {
    const sElem = PALACE_WUXING[subjPalace] || 'Thổ';
    const oElem = PALACE_WUXING[objPalace] || 'Thổ';

    if (subjPalace === objPalace || sElem === oElem) {
      return { relation: 'Tỷ Hòa (Đồng khí)', scoreDelta: 10, type: 'equal' };
    }
    if (WUXING_RELATIONS[oElem]?.generates === sElem) {
      return { relation: 'Sinh Nhập (Đối tượng sinh Chủ thể - Rất Tốt)', scoreDelta: 25, type: 'sinh_nhap' };
    }
    if (WUXING_RELATIONS[sElem]?.generates === oElem) {
      return { relation: 'Sinh Xuất (Chủ thể sinh Đối tượng - Hao tổn)', scoreDelta: 5, type: 'sinh_xuat' };
    }
    if (WUXING_RELATIONS[oElem]?.destroys === sElem) {
      return { relation: 'Khắc Nhập (Đối tượng khắc Chủ thể - Đại Hung)', scoreDelta: -30, type: 'khac_nhap' };
    }
    if (WUXING_RELATIONS[sElem]?.destroys === oElem) {
      return { relation: 'Khắc Xuất (Chủ thể khắc Đối tượng - Chế ngự được)', scoreDelta: 5, type: 'khac_xuat' };
    }
    return { relation: 'Bình Hòa', scoreDelta: 0, type: 'neutral' };
  }

  const FORECAST_DOMAINS = [
    { key: 'wealth',       name: '💰 Đầu Tư & Tài Chính',    desc: 'Vốn Mậu <-> Lợi nhuận Sinh Môn <-> Nhà đầu tư Trực Phù' },
    { key: 'marriage',     name: '💍 Hôn Nhân & Tình Duyên',  desc: 'Vợ Ất <-> Chồng Canh <-> Hôn nhân Lục Hợp' },
    { key: 'career',       name: '💼 Công Danh & Xin Việc',   desc: 'Công việc Khai Môn <-> Người hỏi Nhật Can <-> Sếp Trực Phù' },
    { key: 'contract',     name: '📝 Ký Hợp Đồng & Đàm Phán', desc: 'Văn bản Cảnh Môn <-> Đồng thuận Lục Hợp <-> Thời Can' },
    { key: 'real_estate',  name: '🏡 Mua Bán Nhà Đất',        desc: 'Bất động sản Sinh Môn <-> Đất đai Tử Môn <-> Nhật/Thời Can' },
    { key: 'debt',         name: '⚖️ Đòi Nợ & Thu Hồi Vốn',   desc: 'Người đòi Thương Môn <-> Con nợ Thiên Ất <-> Tiền vốn Mậu' },
    { key: 'exam',         name: '🎓 Thi Cử & Học Vấn',       desc: 'Hội đồng Thiên Phụ <-> Bài thi Cảnh Môn <-> Thí sinh' },
    { key: 'medical',      name: '🩺 Sức Khỏe & Bệnh Tật',    desc: 'Mầm bệnh Thiên Nhuế <-> Bác sĩ Ất Kỳ/Thiên Tâm <-> Bệnh nhân' },
    { key: 'lawsuit',      name: '🏛️ Kiện Tụng & Tòa Án',     desc: 'Tranh cãi Kinh Môn <-> Chứng cứ Cảnh Môn <-> Thẩm phán' },
    { key: 'lost_item',    name: '🔍 Tìm Đồ Vật Thất Lạc',    desc: 'Vật mất Thời Can <-> Kẻ trộm Huyền Vũ <-> Nội/Ngoại bàn' },
    { key: 'missing_user', name: '✈️ Xuất Ngoại & Đi Xa',     desc: 'Phương vị Cửu Thiên <-> Dịch Mã <-> Bình an Lục Hợp' },
    { key: 'childbirth',   name: '👶 Sinh Nở & Con Cái',      desc: 'Sản phụ Cung Khôn/Thiên Nhuế <-> Thai nhi Sinh Môn' }
  ];

  function runOmniForecast(domainKey, chartData) {
    if (!chartData || !chartData.palaces) return null;
    const palaces = chartData.palaces;

    const findPalaceWith = (field, val) => {
      for (const [pId, pInfo] of Object.entries(palaces)) {
        if (pInfo[field] === val || (Array.isArray(pInfo[field]) && pInfo[field].includes(val))) {
          return Number(pId);
        }
      }
      return 1;
    };

    let subjP = 1;
    let objP = 1;
    let detailNote = "";
    let baseScore = 50;

    switch (domainKey) {
      case 'wealth': {
        subjP = findPalaceWith('heaven_stem', 'Mậu');
        objP = findPalaceWith('door', 'Sinh Môn');
        const pObj = palaces[objP] || {};
        const isKW = pObj.is_kong_wang;
        const rel = evaluate5Relationship(subjP, objP);
        let score = baseScore + rel.scoreDelta;
        if (isKW) {
          score -= 35;
          detailNote = "Cung Sinh Môn ngộ Không Vong: Nguy cơ hao tổn vốn, cần thận trọng trước các cam kết lợi nhuận cao bất thường.";
        } else if (rel.type === 'sinh_nhap') {
          score += 20;
          detailNote = "Sinh Môn sinh Cung Vốn Mậu: Dòng tiền sinh sôi gấp bội, đầu tư thuận lợi, lợi nhuận về đều đặn.";
        } else {
          detailNote = `Quan hệ ngũ hành giữa Vốn và Lợi nhuận là ${rel.relation}. Cần quản trị chi phí chặt chẽ.`;
        }
        return formatForecastResult('Đầu Tư & Tài Chính', subjP, objP, rel, score, detailNote);
      }

      case 'marriage': {
        subjP = findPalaceWith('heaven_stem', 'Ất'); // Vợ
        objP = findPalaceWith('heaven_stem', 'Canh'); // Chồng
        const lhPalace = findPalaceWith('deity', 'Lục Hợp');
        const rel = evaluate5Relationship(subjP, objP);
        let score = baseScore + rel.scoreDelta;
        if (palaces[lhPalace]?.is_kong_wang) {
          score -= 25;
          detailNote = "Lục Hợp ngộ Không Vong: Cuộc hôn nhân thiếu vắng sự kết nối cảm xúc sâu sắc hoặc có sự ngăn cách địa lý.";
        } else if (rel.type === 'equal' || rel.type === 'sinh_nhap' || rel.type === 'sinh_xuat') {
          score += 15;
          detailNote = "Vợ chồng tương sinh hoặc tỷ hòa: Gia đạo êm ấm, tôn trọng và nâng đỡ nhau cùng phát triển.";
        } else {
          detailNote = "Ất Canh tương khắc: Đôi bên dễ nảy sinh bất đồng quan điểm, cần lắng nghe và thấu cảm nhiều hơn.";
        }
        return formatForecastResult('Hôn Nhân & Tình Duyên', subjP, objP, rel, score, detailNote);
      }

      case 'medical': {
        subjP = findPalaceWith('star', 'Thiên Nhuế'); // Bệnh tật
        objP = findPalaceWith('heaven_stem', 'Ất');   // Y dược / Thầy thuốc
        const rel = evaluate5Relationship(objP, subjP); // Thầy thuốc có khắc chế được bệnh không
        let score = baseScore;
        if (rel.type === 'khac_xuat') {
          score += 35;
          detailNote = "Cung Y Dược (Ất Kỳ) khắc Cung Bệnh (Thiên Nhuế): Gặp đúng thầy đúng thuốc, phác đồ điều trị phát huy hiệu quả nhanh chóng.";
        } else if (rel.type === 'khac_nhap') {
          score -= 30;
          detailNote = "Cung Bệnh khắc Cung Y Dược: Bệnh tật kháng thuốc hoặc triệu chứng phức tạp, cần tham vấn thêm chuyên gia tuyến đầu.";
        } else {
          score += 10;
          detailNote = "Bệnh ở mức kiểm soát được, cần chú trọng chế độ sinh hoạt và kiên trì theo dõi.";
        }
        return formatForecastResult('Sức Khỏe & Bệnh Tật', subjP, objP, rel, score, detailNote);
      }

      case 'career': {
        subjP = chartData.day_palace || findPalaceWith('door', 'Khai Môn');
        objP = findPalaceWith('door', 'Khai Môn');
        const rel = evaluate5Relationship(subjP, objP);
        let score = baseScore + rel.scoreDelta;
        if (rel.type === 'sinh_nhap') {
          score += 20;
          detailNote = "Cơ quan/Công việc sinh người hỏi: Dễ trúng tuyển, công việc phù hợp năng lực, cấp trên quý mến nâng đỡ.";
        } else if (rel.type === 'khac_nhap') {
          score -= 20;
          detailNote = "Công việc khắc bản thân: Áp lực công việc lớn, cạnh tranh nội bộ gay gắt.";
        } else {
          detailNote = "Công việc bình ổn, muốn thăng tiến cần chủ động trau dồi chuyên môn.";
        }
        return formatForecastResult('Công Danh & Sự Nghiệp', subjP, objP, rel, score, detailNote);
      }

      default: {
        subjP = chartData.day_palace || 1;
        objP = chartData.hour_palace || 9;
        const rel = evaluate5Relationship(subjP, objP);
        const score = Math.max(10, Math.min(95, baseScore + rel.scoreDelta));
        detailNote = `Sự việc đối soát ngũ hành: ${rel.relation}. Hành sự theo lẽ tự nhiên, thuận thời đạt cát.`;
        const matched = FORECAST_DOMAINS.find(d => d.key === domainKey);
        return formatForecastResult(matched ? matched.name : 'Vạn Sự Chiêm Đoán', subjP, objP, rel, score, detailNote);
      }
    }
  }

  function formatForecastResult(name, subjP, objP, rel, score, note) {
    const finalScore = Math.max(10, Math.min(98, Math.round(score)));
    let verdict = "BÌNH HÒA";
    let badgeClass = "badge-neutral";
    if (finalScore >= 80) {
      verdict = "ĐẠI CÁT";
      badgeClass = "badge-great";
    } else if (finalScore >= 65) {
      verdict = "CÁT LỢI";
      badgeClass = "badge-good";
    } else if (finalScore <= 35) {
      verdict = "ĐẠI HUNG";
      badgeClass = "badge-danger";
    } else if (finalScore <= 45) {
      verdict = "BẤT LỢI";
      badgeClass = "badge-warning";
    }

    return {
      domainName: name,
      subjectPalace: subjP,
      objectPalace: objP,
      relationship: rel.relation,
      score: finalScore,
      verdict: verdict,
      badgeClass: badgeClass,
      advice: note
    };
  }

  // ==============================================================================
  // 5. ĐỘNG CƠ KỲ MÔN PHONG THỦY 24 SƠN HƯỚNG & CẤM KỴ 5 PHÒNG (Trang 227-264)
  // ==============================================================================
  const TWENTY_FOUR_MOUNTAINS = [
    { name: "Nhâm", palace: 1, start: 337.5, end: 352.5, palaceName: "Khảm (Bắc)" },
    { name: "Tý",   palace: 1, start: 352.5, end: 7.5,   palaceName: "Khảm (Bắc)" },
    { name: "Quý",  palace: 1, start: 7.5,   end: 22.5,  palaceName: "Khảm (Bắc)" },
    { name: "Sửu",  palace: 8, start: 22.5,  end: 37.5,  palaceName: "Cấn (Đông Bắc)" },
    { name: "Cấn",  palace: 8, start: 37.5,  end: 52.5,  palaceName: "Cấn (Đông Bắc)" },
    { name: "Dần",  palace: 8, start: 52.5,  end: 67.5,  palaceName: "Cấn (Đông Bắc)" },
    { name: "Giáp", palace: 3, start: 67.5,  end: 82.5,  palaceName: "Chấn (Đông)" },
    { name: "Mão",  palace: 3, start: 82.5,  end: 97.5,  palaceName: "Chấn (Đông)" },
    { name: "Ất",   palace: 3, start: 97.5,  end: 112.5, palaceName: "Chấn (Đông)" },
    { name: "Thìn", palace: 4, start: 112.5, end: 127.5, palaceName: "Tốn (Đông Nam)" },
    { name: "Tốn",  palace: 4, start: 127.5, end: 142.5, palaceName: "Tốn (Đông Nam)" },
    { name: "Tị",   palace: 4, start: 142.5, end: 157.5, palaceName: "Tốn (Đông Nam)" },
    { name: "Bính", palace: 9, start: 157.5, end: 172.5, palaceName: "Ly (Nam)" },
    { name: "Ngọ",  palace: 9, start: 172.5, end: 187.5, palaceName: "Ly (Nam)" },
    { name: "Đinh", palace: 9, start: 187.5, end: 202.5, palaceName: "Ly (Nam)" },
    { name: "Mùi",  palace: 2, start: 202.5, end: 217.5, palaceName: "Khôn (Tây Nam)" },
    { name: "Khôn", palace: 2, start: 217.5, end: 232.5, palaceName: "Khôn (Tây Nam)" },
    { name: "Thân", palace: 2, start: 232.5, end: 247.5, palaceName: "Khôn (Tây Nam)" },
    { name: "Canh", palace: 7, start: 247.5, end: 262.5, palaceName: "Đoài (Tây)" },
    { name: "Dậu",  palace: 7, start: 262.5, end: 277.5, palaceName: "Đoài (Tây)" },
    { name: "Tân",  palace: 7, start: 277.5, end: 292.5, palaceName: "Đoài (Tây)" },
    { name: "Tuất", palace: 6, start: 292.5, end: 307.5, palaceName: "Càn (Tây Bắc)" },
    { name: "Càn",  palace: 6, start: 307.5, end: 322.5, palaceName: "Càn (Tây Bắc)" },
    { name: "Hợi",  palace: 6, start: 322.5, end: 337.5, palaceName: "Càn (Tây Bắc)" }
  ];

  function degreeToMountain(deg) {
    const d = (deg % 360 + 360) % 360;
    for (const m of TWENTY_FOUR_MOUNTAINS) {
      if (m.name === 'Tý') {
        if (d >= 352.5 || d < 7.5) return m;
      } else {
        if (d >= m.start && d < m.end) return m;
      }
    }
    return TWENTY_FOUR_MOUNTAINS[1]; // Default Tý
  }

  function evaluateHouseFengShuiSafety(degree, chartData, roomAllocations = {}) {
    const mountain = degreeToMountain(degree);
    const facingPalaceId = mountain.palace;
    const palaces = chartData?.palaces || {};

    const doorInfo = palaces[facingPalaceId] || {};
    const doorName = doorInfo.door || 'Khai Môn';
    const isKW = !!doorInfo.is_kong_wang;
    const isGoodDoor = ['Khai Môn', 'Hưu Môn', 'Sinh Môn'].includes(doorName);

    const doorVerdict = (isGoodDoor && !isKW)
      ? "Cửa Chính đắc Tam Cát Môn, nạp vượng khí cát tường."
      : (isKW ? "Cửa Chính ngộ Không Vong: Khí khẩu suy yếu, dòng khí bất định, nên hóa giải bằng bình phong."
              : `Cửa Chính gặp ${doorName}: Cần bố trí vật phẩm hành khí thông quan.`);

    const alerts = [];
    const rooms = {};

    // Khảo sát 5 phòng chức năng
    for (const [rKey, pId] of Object.entries(roomAllocations)) {
      const pInfo = palaces[pId] || {};
      const rDoor = pInfo.door || '-';
      const rDeity = pInfo.deity || '-';
      let status = "Hợp cách";
      let note = "";

      if (rKey === 'kitchen') {
        if (Number(pId) === 6) {
          status = "ĐẠI SÁT: HỎA THIÊU THIÊN MÔN";
          note = "Bếp (Hỏa) đặt tại Cung Càn 6 (Kim) phạm Hỏa Thiêu Thiên Môn, tổn hại trực tiếp đến sức khỏe người cha/chủ nhà và hao tài. Hóa giải: Dùng đá phong thủy/màu vàng thuộc Thổ để thông quan.";
          alerts.push({ level: 'CRITICAL', text: note });
        } else {
          note = `Bếp tại Cung ${pId} (${pInfo.name || ''}), đắc ${rDoor}.`;
        }
      } else if (rKey === 'toilet') {
        if (rDoor === 'Sinh Môn') {
          status = "ĐẠI SÁT: Ô UẾ TÀI VẬN";
          note = "Nhà vệ sinh đặt tại Cung Sinh Môn làm ô uế nguồn sinh khí tài lộc của gia đình! Hóa giải: Luôn đóng kín cửa, bật quạt thông gió và đặt chậu cây xanh thanh lọc.";
          alerts.push({ level: 'CRITICAL', text: note });
        } else if (rDeity === 'Trực Phù') {
          status = "ĐẠI SÁT: Ô UẾ QUÝ NHÂN";
          note = "Nhà vệ sinh đặt tại Cung Trực Phù làm tổn hại năng lượng tâm linh và quý nhân bảo hộ.";
          alerts.push({ level: 'WARNING', text: note });
        } else {
          note = "Vị trí thoát uế khí an toàn.";
        }
      } else if (rKey === 'bedroom') {
        if (['Sinh Môn', 'Hưu Môn', 'Khai Môn'].includes(rDoor)) {
          note = "Phòng ngủ đắc Cát Môn, giấc ngủ sâu, tái tạo sinh lực hoàn hảo.";
        } else if (['Tử Môn', 'Kinh Môn'].includes(rDoor)) {
          note = `Phòng ngủ ngộ ${rDoor}, dễ mộng mị, bất hòa. Nên treo hồ lô đồng hóa giải.`;
          alerts.push({ level: 'INFO', text: note });
        }
      }

      rooms[rKey] = {
        palaceId: pId,
        palaceName: pInfo.name || `Cung ${pId}`,
        door: rDoor,
        deity: rDeity,
        status: status,
        note: note
      };
    }

    return {
      degree: degree,
      facingMountain: `${mountain.name} Sơn (${mountain.palaceName})`,
      facingPalace: facingPalaceId,
      doorAssessment: {
        door: doorName,
        isKongWang: isKW,
        verdict: doorVerdict
      },
      rooms: rooms,
      criticalAlerts: alerts
    };
  }

  // ==============================================================================
  // EXPORT TO GLOBAL
  // ==============================================================================
  const KetNoiVuTruEngine = {
    DEITIES: KET_NOI_VU_TRU_10_DEITIES,
    allocate10Deities: allocate10Deities,
    findFuTou: findFuTou,
    calculateZhiRunJu: calculateZhiRunJu,
    FORECAST_DOMAINS: FORECAST_DOMAINS,
    runOmniForecast: runOmniForecast,
    evaluate5Relationship: evaluate5Relationship,
    degreeToMountain: degreeToMountain,
    evaluateHouseFengShuiSafety: evaluateHouseFengShuiSafety
  };

  global.KetNoiVuTruEngine = KetNoiVuTruEngine;

})(typeof window !== 'undefined' ? window : this);
