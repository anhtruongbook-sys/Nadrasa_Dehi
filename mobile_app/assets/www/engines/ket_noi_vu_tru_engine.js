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

  if (KET_NOI_VU_TRU_10_DEITIES['Câu Trận'] && !KET_NOI_VU_TRU_10_DEITIES['Câu Trần']) {
    KET_NOI_VU_TRU_10_DEITIES['Câu Trần'] = KET_NOI_VU_TRU_10_DEITIES['Câu Trận'];
  }

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

  // ==============================================================================
  // 4. ĐỘNG CƠ CHIÊM ĐOÁN VẠN SỰ 12 LĨNH VỰC (OMNI-FORECAST ENGINE ĐA TẦNG)
  // ==============================================================================
  const PALACE_DETAILS = {
    1: { name: 'Khảm 1', direction: 'Chính Bắc', element: 'Thủy', branches: 'Tý' },
    2: { name: 'Khôn 2', direction: 'Tây Nam', element: 'Thổ', branches: 'Mùi, Thân' },
    3: { name: 'Chấn 3', direction: 'Chính Đông', element: 'Mộc', branches: 'Mão' },
    4: { name: 'Tốn 4', direction: 'Đông Nam', element: 'Mộc', branches: 'Thìn, Tị' },
    5: { name: 'Trung 5', direction: 'Trung Cung', element: 'Thổ', branches: 'Thổ Vị' },
    6: { name: 'Càn 6', direction: 'Tây Bắc', element: 'Kim', branches: 'Tuất, Hợi' },
    7: { name: 'Đoài 7', direction: 'Chính Tây', element: 'Kim', branches: 'Dậu' },
    8: { name: 'Cấn 8', direction: 'Đông Bắc', element: 'Thổ', branches: 'Sửu, Dần' },
    9: { name: 'Ly 9', direction: 'Chính Nam', element: 'Hỏa', branches: 'Ngọ' }
  };

  const DOOR_ROLES = {
    'Khai Môn': { nature: 'Cát Môn (Kim)', role: 'Khai mở, lập nghiệp, thăng chức, hanh thông, việc công, xuất hành.', delta: 20 },
    'Hưu Môn':  { nature: 'Cát Môn (Thủy)', role: 'Nghỉ ngơi, hòa giải, yến tiệc, quý nhân nâng đỡ, gia đạo an bình.', delta: 18 },
    'Sinh Môn': { nature: 'Đại Cát Môn (Thổ)', role: 'Sinh sôi tài lộc, kinh doanh bất động sản, sinh con, nguồn vốn tăng trưởng.', delta: 25 },
    'Thương Môn': { nature: 'Hung Môn (Mộc)', role: 'Va chạm, tổn thương, đòi nợ gấp, xích mích, tai nạn, hao tài.', delta: -22 },
    'Đỗ Môn':   { nature: 'Bình Môn (Mộc)', role: 'Bế tắc, che giấu bí mật, phòng thủ, chờ đợi thời cơ, việc nội bộ khó công khai.', delta: -5 },
    'Cảnh Môn': { nature: 'Trung Cát (Hỏa)', role: 'Văn thư, hợp đồng, bằng cấp, danh tiếng rực rỡ, tiệc tùng; cần cẩn trọng pháp lý.', delta: 10 },
    'Tử Môn':   { nature: 'Đại Hung Môn (Thổ)', role: 'Đóng băng, đình trệ, đất đai mồ mả, điềm gở, thất bại, bế tắc cùng cực.', delta: -30 },
    'Kinh Môn': { nature: 'Hung Môn (Kim)', role: 'Lo âu kinh sợ, nghi ngờ, khẩu thiệt tranh tụng, tin dữ, kiện cáo bất an.', delta: -25 }
  };

  const STAR_ROLES = {
    'Thiên Bồng': { nature: 'Hung tinh (Thủy)', desc: 'Rủi ro lớn, đầu cơ, mạo hiểm, trộm cắp, cạm bẫy khó lường.', delta: -15 },
    'Thiên Nhuế': { nature: 'Hung tinh (Thổ)', desc: 'Mầm bệnh, sai phạm tích tụ, cản trở, bạn bè hẹp hòi.', delta: -18 },
    'Thiên Xung': { nature: 'Bình tinh (Mộc)', desc: 'Xung đột, bộc phát nhanh, dũng cảm, sự việc biến chuyển đột ngột.', delta: 2 },
    'Thiên Phụ': { nature: 'Cát tinh (Mộc)', desc: 'Văn khúc, học vấn, thi cử, danh tiếng, quý nhân chỉ dạy.', delta: 15 },
    'Thiên Cầm': { nature: 'Đại Cát tinh (Thổ)', desc: 'Uy quyền trung ương, trung thực, trăm việc hanh thông.', delta: 20 },
    'Thiên Tâm': { nature: 'Đại Cát tinh (Kim)', desc: 'Trí tuệ lãnh đạo, chiến lược gia, đại phẫu thuật, thầy thuốc giỏi.', delta: 18 },
    'Thiên Trụ': { nature: 'Hung tinh (Kim)', desc: 'Phá hoại, tổn thương, thị phi, đổ vỡ, hào nhoáng nhưng rỗng ruột.', delta: -15 },
    'Thiên Nhậm': { nature: 'Cát tinh (Thổ)', desc: 'Kiên nhẫn, điền sản, trung hậu, làm việc chăm chỉ có tích lũy.', delta: 15 },
    'Thiên Anh': { nature: 'Bình tinh (Hỏa)', desc: 'Danh tiếng bề ngoài, rực rỡ nhưng dễ nóng giận, chóng tàn.', delta: 5 }
  };

  const DEITY_ROLES = {
    'Trực Phù': { nature: 'Đại Cát Thần', desc: 'Thủ lĩnh chư thần, bảo trợ tâm linh, quý nhân cấp cao nâng đỡ, trăm sự bình an.', delta: 20 },
    'Đằng Xà':  { nature: 'Hung Thần', desc: 'Dối trá, lo âu, ác mộng, biến cố quái dị, tiểu nhân đổi trắng thay đen.', delta: -18 },
    'Thái Âm':  { nature: 'Cát Thần', desc: 'Mưu lược ngầm, quý nhân nữ giới, bảo vệ kín đáo, nghiên cứu thâm sâu.', delta: 15 },
    'Lục Hợp':  { nature: 'Đại Cát Thần', desc: 'Hôn phối, đồng thuận, môi giới, hợp đồng, bạn bè đối tác hòa hợp.', delta: 20 },
    'Bạch Hổ':  { nature: 'Đại Hung Thần', desc: 'Xung đột bạo lực, tai nạn, đổ máu, kiện tụng gắt gao, hao tổn lớn.', delta: -25 },
    'Câu Trận':  { nature: 'Hung Thần', desc: 'Trở lực, ngáng đường, tranh chấp đất đai, dây dưa không dứt.', delta: -18 },
    'Huyền Vũ': { nature: 'Hung Thần', desc: 'Trộm cắp, gian lận, khẩu thiệt, lừa đảo tài chính, tiểu nhân ném đá giấu tay.', delta: -22 },
    'Chu Tước': { nature: 'Hung Thần', desc: 'Thị phi khẩu nghiệp, tranh cãi ồn ào, văn thư khiếu nại, tin đồn thất thiệt.', delta: -18 },
    'Cửu Địa':  { nature: 'Cát Thần', desc: 'Bền vững, trầm tĩnh, phòng thủ kiên cố, tích lũy đất đai, chậm mà chắc.', delta: 15 },
    'Cửu Thiên': { nature: 'Cát Thần', desc: 'Thăng hoa, bứt phá ngoạn mục, danh tiếng vang xa, xuất hành đi xa cát lợi.', delta: 18 }
  };

  const STEM_PATTERN_LOOKUP = {
    'Mậu+Bính': { name: 'Thanh Long Phản Thủ (Rồng Xanh Quay Đầu)', grade: 'dai_cat', note: 'Đại Cát! Tiền tài tự đến, mưu sự đại thành, đầu tư kinh doanh phát đạt vượt bậc.', delta: 20 },
    'Bính+Mậu': { name: 'Phi Điểu Điệt Huyệt (Chim Bay Vào Tổ)', grade: 'dai_cat', note: 'Đại Cát! Không nhọc công sức mà hưởng trọn thành quả, quý nhân đem lại cơ hội lớn.', delta: 20 },
    'Ất+Bính':  { name: 'Kỳ Thuận Điểm Huyệt', grade: 'dai_cat', note: 'Đại Cát! Công danh hiển hách, thi cử đỗ đạt, sự nghiệp thăng hoa.', delta: 18 },
    'Ất+Đinh':  { name: 'Kỳ Hóa Phong Vân', grade: 'cat', note: 'Cát Lợi! Danh tiếng vang xa, được đề bạt thăng chức, quý nhân hỗ trợ.', delta: 15 },
    'Đinh+Ất':  { name: 'Ngọc Nữ Thừa Phong', grade: 'cat', note: 'Cát Lợi! Hôn nhân hòa hợp, tài lộc bất ngờ, việc liên quan phụ nữ thuận lợi.', delta: 15 },
    'Đinh+Bính': { name: 'Tinh Kỳ Nghênh Khách', grade: 'cat', note: 'Cát Lợi! Ký kết hợp đồng thành công, quang minh chính đại.', delta: 15 },
    'Canh+Bính': { name: 'Thái Bạch Nhập Huỳnh (Sao Kim Vào Lửa)', grade: 'dai_hung', note: 'Đại Hung! Kẻ gian hãm hại, trộm cắp thất thoát, đề phòng mất mát tài sản lớn.', delta: -25 },
    'Bính+Canh': { name: 'Huỳnh Nhập Thái Bạch (Lửa Vào Sao Kim)', grade: 'hung', note: 'Hung! Tiền của hao tán, gia đạo xích mích, đối tác trở mặt.', delta: -20 },
    'Canh+Quý':  { name: 'Đại Cách', grade: 'hung', note: 'Hung! Đi lại trắc trở, xe cộ hư hỏng, công việc gãy gánh giữa đường.', delta: -18 },
    'Canh+Nhâm': { name: 'Tiểu Cách / Thượng Cách', grade: 'hung', note: 'Hung! Thay đổi nơi ở, xa xứ tha hương, biến cố đột ngột.', delta: -16 },
    'Canh+Canh': { name: 'Chiến Cách', grade: 'dai_hung', note: 'Rất Hung! Huynh đệ tương tàn, kiện cáo kéo dài, tự tổn thương lẫn nhau.', delta: -25 },
    'Tân+Ất':   { name: 'Bạch Hổ Xương Cuồng', grade: 'dai_hung', note: 'Đại Hung! Gia đạo bất an, tai nạn thân thể, kiện tụng thua thiệt.', delta: -25 },
    'Ất+Tân':   { name: 'Thanh Long Đào Tẩu', grade: 'hung', note: 'Hung! Đối tác bỏ đi, tiền bạc thất thoát, người dưới trướng phản trắc.', delta: -20 },
    'Quý+Quý':  { name: 'Thiên Võng Tứ Trương', grade: 'dai_hung', note: 'Đại Hung! Lưới trời bủa vây bốn bề, bế tắc, tuyệt đối không được manh động.', delta: -25 },
    'Nhâm+Nhâm': { name: 'Xà Nhập Địa Võng', grade: 'hung', note: 'Hung! Mắc kẹt trong khó khăn, việc dây dưa không có lối thoát.', delta: -18 },
    'Kỷ+Kỷ':    { name: 'Địa Hộ Phùng Quỷ', grade: 'hung', note: 'Hung! Mưu sự khó thành, mầm bệnh âm ỉ, đề phòng tiểu nhân giấu mặt.', delta: -18 },
    'Mậu+Canh': { name: 'Trực Phù Phi Cung', grade: 'hung', note: 'Hung! Chức vụ lung lay, mất đi chỗ dựa, phải thay đổi nơi làm việc.', delta: -18 }
  };

  function getStemChiFromYear(y) {
    const year = parseInt(y, 10) || 1990;
    const yOffset = year - 4;
    const ganIdx = ((yOffset % 10) + 10) % 10;
    const zhiIdx = ((yOffset % 12) + 12) % 12;
    return {
      stem: CAN_VN[ganIdx],
      branch: CHI_VN[zhiIdx],
      canChi: `${CAN_VN[ganIdx]} ${CHI_VN[zhiIdx]}`
    };
  }

  const FORECAST_DOMAINS = [
    { key: 'wealth', name: '💰 Đầu Tư & Tài Chính' },
    { key: 'career', name: '👔 Công Danh & Sự Nghiệp' },
    { key: 'marriage', name: '💍 Hôn Nhân & Tình Duyên' },
    { key: 'contract', name: '📝 Ký Hợp Đồng & Đàm Phán' },
    { key: 'real_estate', name: '🏡 Mua Bán Nhà Đất & BĐS' },
    { key: 'debt', name: '💵 Đòi Nợ & Thu Hồi Vốn' },
    { key: 'exam', name: '🎓 Thi Cử & Học Vấn' },
    { key: 'medical', name: '🩺 Sức Khỏe & Bệnh Tật' },
    { key: 'lawsuit', name: '⚖️ Kiện Tụng & Tòa Án' },
    { key: 'lost_item', name: '🔍 Tìm Đồ Vật Thất Lạc' },
    { key: 'missing_user', name: '✈️ Xuất Ngoại & Đi Xa' },
    { key: 'childbirth', name: '👶 Sinh Nở & Con Cái' }
  ];

  const GIAP_LEADER_MAP = {
    'Tý': 'Mậu', 'Tuất': 'Kỷ', 'Thân': 'Canh',
    'Ngọ': 'Tân', 'Thìn': 'Nhâm', 'Dần': 'Quý'
  };

  function getLeaderStem(stem, branch) {
    if (stem !== 'Giáp') return stem;
    if (!branch) return 'Mậu';
    return GIAP_LEADER_MAP[branch] || 'Mậu';
  }

  function runOmniForecast(domainKey, chartData, querentOptions = {}) {
    if (!chartData || !chartData.palaces) return null;
    const palaces = chartData.palaces;

    const findPalaceWith = (field, val) => {
      if (!val) return null;
      for (const [pId, pInfo] of Object.entries(palaces)) {
        if (!pInfo) continue;
        const targetVal = pInfo[field];
        if (targetVal === val) return Number(pId);
        if (Array.isArray(targetVal) && targetVal.includes(val)) return Number(pId);
        if (typeof targetVal === 'string') {
          const parts = targetVal.split(/[\s,/+]+/).filter(Boolean);
          if (parts.includes(val)) return Number(pId);
        }
        if (field === 'heaven_stem' && Array.isArray(pInfo.heaven_stems) && pInfo.heaven_stems.includes(val)) {
          return Number(pId);
        }
        if (field === 'earth_stem' && Array.isArray(pInfo.earth_stems) && pInfo.earth_stems.includes(val)) {
          return Number(pId);
        }
        if (field === 'star' && Array.isArray(pInfo.stars) && pInfo.stars.includes(val)) {
          return Number(pId);
        }
      }
      return null;
    };

    // 1. Xác định Cung Chủ Thể (Người Hỏi)
    let subjP = 1;
    let querentLabel = "";
    const querentMode = querentOptions.mode || 'hour'; // 'hour' | 'birth_year'

    if (querentMode === 'birth_year') {
      let stem = querentOptions.stem;
      let branch = querentOptions.branch;
      if (!stem && querentOptions.year) {
        const sc = getStemChiFromYear(querentOptions.year);
        stem = sc.stem;
        branch = sc.branch;
      }
      stem = stem || 'Giáp';
      const gStr = querentOptions.gender ? (querentOptions.gender === 'nam' ? 'Nam ♂' : 'Nữ ♀') : '';
      querentLabel = `Can Năm Sinh: ${stem}${querentOptions.year ? ` (${querentOptions.year}${gStr ? ' ' + gStr : ''})` : (gStr ? ` (${gStr})` : '')}`;

      // BẮT BUỘC 100% LẤY THEO THIÊN BÀN (THIÊN THỜI / ĐỘNG THÁI HIỆN TẠI):
      if (stem === 'Giáp') {
        const leaderStem = getLeaderStem('Giáp', branch);
        const pFound = findPalaceWith('heaven_stem', leaderStem);
        subjP = (pFound !== null) ? pFound : (findPalaceWith('deity', 'Trực Phù') || 1);
      } else {
        // Can khác: Tìm chính xác trên Can Thiên Bàn
        const pFound = findPalaceWith('heaven_stem', stem);
        if (pFound !== null) {
          subjP = pFound;
        } else {
          subjP = findPalaceWith('deity', 'Trực Phù') || 1;
        }
      }
    } else {
      // Mặc định: Nhật Can (Can Ngày)
      const dayCan = chartData.day_can || '';
      const dayChi = chartData.day_chi || '';
      if (dayCan) {
        if (dayCan === 'Giáp') {
          const leaderStem = getLeaderStem('Giáp', dayChi);
          const pFound = findPalaceWith('heaven_stem', leaderStem);
          subjP = (pFound !== null) ? pFound : (findPalaceWith('deity', 'Trực Phù') || chartData.day_palace || 1);
        } else {
          const pFound = findPalaceWith('heaven_stem', dayCan);
          subjP = (pFound !== null) ? pFound : (chartData.day_palace || 1);
        }
        querentLabel = `Nhật Can (Can Ngày): ${dayCan}`;
      } else {
        subjP = chartData.day_palace || 1;
        querentLabel = `Chủ Thể Can Giờ / Ngày`;
      }
    }

    // 2. Xác định Cung Dụng Thần (Sự Việc) theo 12 Lĩnh Vực - HỖ TRỢ ĐA DỤNG THẦN (CẶP DỤNG THẦN ĐỐI TRỌNG)
    let domainName = "";
    let t1P = 1;
    let t1Role = "";
    let t1Label = "";
    let t2P = null;
    let t2Role = "";
    let t2Label = "";

    switch (domainKey) {
      case 'medical':
        domainName = "Sức Khỏe & Bệnh Tật";
        t1P = findPalaceWith('star', 'Thiên Nhuế') || 2;
        t1Role = "Mầm Bệnh (Thiên Nhuế)";
        t1Label = "Mầm Bệnh (Thiên Nhuế)";

        t2P = findPalaceWith('star', 'Thiên Tâm');
        const atP = findPalaceWith('heaven_stem', 'Ất');
        if (t2P === t1P && atP) {
          t2P = atP;
        }
        if (!t2P) t2P = atP || 6;
        t2Role = "Thầy Thuốc & Y Dược (Thiên Tâm / Ất)";
        t2Label = "Thầy Thuốc (Thiên Tâm) & Y Dược (Ất)";
        break;

      case 'marriage':
        domainName = "Hôn Nhân & Tình Duyên";
        if (querentOptions.gender === 'nam') {
          t1P = findPalaceWith('heaven_stem', 'Ất') || 8;
          t1Role = "Bạn Đời / Người Nữ (Can Ất)";
          t1Label = "Người Nữ / Bạn Đời (Thiên Can Ất)";
        } else if (querentOptions.gender === 'nu') {
          t1P = findPalaceWith('heaven_stem', 'Canh') || 7;
          t1Role = "Bạn Đời / Người Nam (Can Canh)";
          t1Label = "Người Nam / Bạn Đời (Thiên Can Canh)";
        } else {
          t1P = findPalaceWith('heaven_stem', 'Ất') || findPalaceWith('heaven_stem', 'Canh') || 8;
          t1Role = "Đối Tác Tình Cảm (Can Ất/Canh)";
          t1Label = "Đối Tác Tình Cảm (Ất/Canh)";
        }
        t2P = findPalaceWith('deity', 'Lục Hợp') || 3;
        t2Role = "Hôn Phối & Đồng Thuận (Lục Hợp)";
        t2Label = "Hôn Phối & Đồng Thuận (Lục Hợp)";
        break;

      case 'wealth':
        domainName = "Đầu Tư & Tài Chính";
        t1P = findPalaceWith('door', 'Sinh Môn') || 8;
        t1Role = "Lợi Nhuận & Lời Lãi (Sinh Môn)";
        t1Label = "Lợi Nhuận (Sinh Môn)";

        t2P = findPalaceWith('heaven_stem', 'Mậu') || 5;
        t2Role = "Tiền Vốn & Thanh Khoản (Can Mậu)";
        t2Label = "Tiền Vốn (Can Mậu)";
        break;

      case 'real_estate':
        domainName = "Mua Bán Nhà Đất & BĐS";
        t1P = findPalaceWith('door', 'Sinh Môn') || 8;
        t1Role = "Nhà Cửa & Trạch Xá (Sinh Môn)";
        t1Label = "Nhà Cửa BĐS (Sinh Môn)";

        t2P = findPalaceWith('door', 'Tử Môn') || findPalaceWith('deity', 'Cửu Địa') || 2;
        t2Role = "Đất Đai & Địa Cơ (Tử Môn / Cửu Địa)";
        t2Label = "Đất Đai (Tử Môn / Cửu Địa)";
        break;

      case 'debt':
        domainName = "Đòi Nợ & Thu Hồi Vốn";
        t1P = findPalaceWith('door', 'Thương Môn') || 3;
        t1Role = "Lực Lượng Đòi Nợ (Thương Môn)";
        t1Label = "Người Đòi Nợ (Thương Môn)";

        t2P = chartData.hour_palace || findPalaceWith('heaven_stem', 'Mậu') || 7;
        t2Role = "Con Nợ & Tiền Nợ (Can Giờ / Mậu)";
        t2Label = "Con Nợ & Tiền Nợ (Can Giờ / Mậu)";
        break;

      case 'lawsuit':
        domainName = "Kiện Tụng & Tòa Án";
        t1P = findPalaceWith('door', 'Kinh Môn') || 7;
        t1Role = "Khẩu Thiệt & Tranh Tụng (Kinh Môn)";
        t1Label = "Khẩu Thiệt Tranh Tụng (Kinh Môn)";

        t2P = findPalaceWith('deity', 'Trực Phù') || findPalaceWith('door', 'Khai Môn') || 6;
        t2Role = "Quan Tòa & Trọng Tài (Trực Phù / Khai Môn)";
        t2Label = "Quan Tòa & Trọng Tài (Trực Phù)";
        break;

      case 'exam':
        domainName = "Thi Cử & Học Vấn";
        t1P = findPalaceWith('door', 'Cảnh Môn') || 9;
        t1Role = "Bài Thi & Điểm Số (Cảnh Môn)";
        t1Label = "Bài Thi (Cảnh Môn)";

        t2P = findPalaceWith('star', 'Thiên Phụ') || 4;
        t2Role = "Giám Khảo & Trường Thi (Thiên Phụ)";
        t2Label = "Giám Khảo (Thiên Phụ)";
        break;

      case 'career':
        domainName = "Công Danh & Sự Nghiệp";
        t1P = findPalaceWith('door', 'Khai Môn') || 6;
        t1Role = "Cơ Quan & Chức Vụ (Khai Môn)";
        t1Label = "Cơ Quan / Công Việc (Khai Môn)";

        t2P = findPalaceWith('deity', 'Trực Phù') || 5;
        t2Role = "Cấp Trên & Quý Nhân (Trực Phù)";
        t2Label = "Cấp Trên / Quý Nhân (Trực Phù)";
        break;

      case 'contract':
        domainName = "Ký Hợp Đồng & Đàm Phán";
        t1P = findPalaceWith('door', 'Cảnh Môn') || 9;
        t1Role = "Văn Bản Hợp Đồng (Cảnh Môn)";
        t1Label = "Văn Bản Hợp Đồng (Cảnh Môn)";

        t2P = findPalaceWith('deity', 'Lục Hợp') || 3;
        t2Role = "Đối Tác Đàm Phán & Đồng Thuận (Lục Hợp)";
        t2Label = "Đối Tác Ký Kết (Lục Hợp)";
        break;

      case 'lost_item':
        domainName = "Tìm Đồ Vật Thất Lạc";
        t1P = chartData.hour_palace || 9;
        t1Role = "Đồ Vật Thất Lạc (Can Giờ)";
        t1Label = "Vật Mất (Thời Can)";

        t2P = findPalaceWith('deity', 'Huyền Vũ') || 1;
        t2Role = "Kẻ Gian & Nghi Can (Huyền Vũ)";
        t2Label = "Kẻ Gian (Huyền Vũ)";
        break;

      case 'missing_user':
        domainName = "Xuất Ngoại & Đi Xa";
        t1P = findPalaceWith('deity', 'Cửu Thiên') || 9;
        t1Role = "Phương Xa & Bến Bờ (Cửu Thiên)";
        t1Label = "Phương Xa (Cửu Thiên)";

        t2P = findPalaceWith('door', 'Khai Môn') || 6;
        t2Role = "Cửa Ngõ Xuất Hành / Dịch Mã (Khai Môn)";
        t2Label = "Cửa Ngõ Xuất Ngoại (Khai Môn)";
        break;

      case 'childbirth':
        domainName = "Sinh Nở & Con Cái";
        t1P = findPalaceWith('door', 'Sinh Môn') || 8;
        t1Role = "Thai Nhi & Sinh Nở (Sinh Môn)";
        t1Label = "Thai Nhi & Sinh Nở (Sinh Môn)";

        t2P = 2; // Cung Khôn 2
        t2Role = "Sản Phụ & Người Mẹ (Cung Khôn 2)";
        t2Label = "Sản Phụ / Người Mẹ (Cung Khôn 2)";
        break;

      default:
        domainName = "Vạn Sự Chiêm Đoán";
        t1P = chartData.hour_palace || 9;
        t1Role = "Sự Việc Khách Thể (Thời Can)";
        t1Label = "Sự Việc Khách Thể (Thời Can)";
        t2P = null;
        break;
    }

    const pSubj = palaces[subjP] || {};
    const pT1 = palaces[t1P] || {};
    const pT2 = t2P ? (palaces[t2P] || {}) : null;

    // Helper kiểm tra quan hệ tương sinh tương khắc giữa 2 cung
    const getRelationType = (elemA, elemB) => {
      if (!elemA || !elemB || elemA === elemB) return 'equal';
      if (WUXING_RELATIONS[elemA]?.generates === elemB) return 'generates'; // A sinh B
      if (WUXING_RELATIONS[elemB]?.generates === elemA) return 'generated_by'; // B sinh A (A được B sinh)
      if (WUXING_RELATIONS[elemA]?.destroys === elemB) return 'destroys'; // A khắc B
      if (WUXING_RELATIONS[elemB]?.destroys === elemA) return 'destroyed_by'; // B khắc A (A bị B khắc)
      return 'neutral';
    };

    const sElem = PALACE_WUXING[subjP] || 'Thổ';
    const t1Elem = PALACE_WUXING[t1P] || 'Thổ';
    const t2Elem = t2P ? (PALACE_WUXING[t2P] || 'Thổ') : null;

    // Helper bóc tách Tứ Trụ Cột tại một cung
    const getPillarDetails = (pId) => {
      const p = palaces[pId] || {};
      const doorInfo = DOOR_ROLES[p.door] || { nature: p.door || 'Bình Môn', role: 'Năng lượng bình ổn.', delta: 0 };
      const starInfo = STAR_ROLES[p.star] || { nature: p.star || 'Bình Tinh', desc: 'Thiên thời trung tính.', delta: 0 };
      const deityInfo = DEITY_ROLES[p.deity] || { nature: p.deity || 'Bình Thần', desc: 'Thần trợ mức trung bình.', delta: 0 };
      const stemPair = `${p.heaven_stem || ''}+${p.earth_stem || ''}`;
      const patternInfo = STEM_PATTERN_LOOKUP[stemPair] || null;

      const doorDetail = `🚪 Bát Môn [${p.door || 'Chưa định'}]: ${doorInfo.nature}. ${doorInfo.role}`;
      const starDetail = `⭐ Cửu Tinh [${p.star || 'Chưa định'}]: ${starInfo.nature}. ${starInfo.desc}`;
      const deityDetail = `🔮 Thần Trợ [${p.deity || 'Chưa định'}]: ${deityInfo.nature}. ${deityInfo.desc}`;
      let stemPatternDetail = `⚡ Thập Can [${stemPair}]: Can Thiên ${p.heaven_stem || '—'} phối Can Địa ${p.earth_stem || '—'}.`;
      if (patternInfo) {
        stemPatternDetail += ` Đắc Cách: <strong>${patternInfo.name}</strong> (${patternInfo.note})`;
      } else {
        stemPatternDetail += ` Khí trường bình ổn, không xung sát nghiêm trọng.`;
      }

      return {
        door: doorDetail,
        star: starDetail,
        deity: deityDetail,
        stemPattern: stemPatternDetail,
        doorDelta: doorInfo.delta || 0,
        starDelta: starInfo.delta || 0,
        deityDelta: deityInfo.delta || 0,
        patternDelta: patternInfo?.delta || 0
      };
    };

    const t1Pillars = getPillarDetails(t1P);
    const t2Pillars = t2P ? getPillarDetails(t2P) : null;

    let baseScore = 50;
    baseScore += (t1Pillars.doorDelta + t1Pillars.starDelta + t1Pillars.deityDelta + t1Pillars.patternDelta);
    if (t2Pillars) {
      baseScore += Math.round((t2Pillars.doorDelta + t2Pillars.starDelta + t2Pillars.deityDelta + t2Pillars.patternDelta) * 0.5);
    }

    // Luận giải Sinh Khắc & Sách Lược Chuyên Biệt Theo Domain
    let hostGuestText = "";
    let relSummary = "";
    let specialText = "";
    let strategyText = "";

    const t1Rel = getRelationType(t1Elem, sElem); // t1 tác động vào sElem: 'generates' nghĩa là t1 sinh sElem; 'destroys' nghĩa là t1 khắc sElem

    if (domainKey === 'medical') {
      // 🩺 SỨC KHỎE & BỆNH TẬT:
      // Mầm Bệnh (Thiên Nhuế) vs Chủ Thể:
      // Bệnh sinh Người = Bệnh Nhập Thân (Xấu, mãn tính, dai dẳng)
      // Bệnh khắc Người = Nguy hiểm tính mạng (Cực xấu)
      // Người khắc Bệnh = Chính khí thắng tà khí, người thắng bệnh (Rất tốt!)
      // Người sinh Bệnh = Nuôi bệnh, hao tổn sinh lực
      // Thầy Thuốc (Thiên Tâm/Ất) khắc Bệnh (Thiên Nhuế) = Thuốc hay thầy giỏi tiêu diệt bệnh (Đại cát!)
      const diseaseRel = getRelationType(t1Elem, sElem);
      let diseasePart = "";
      if (diseaseRel === 'generates') {
        diseasePart = `⚠️ <strong>MẦM BỆNH SINH BẢN MỆNH (BỆNH NHẬP THÂN)</strong>: Cung Mầm Bệnh (${PALACE_DETAILS[t1P]?.name} - ${t1Elem}) SINH Cung Bản Mệnh (${PALACE_DETAILS[subjP]?.name} - ${sElem}). Trong Kỳ Môn chiêm bệnh, đây là thế Bệnh Nhập Thân: mầm bệnh bám dính sâu vào phủ tạng cơ thể, bệnh chuyển mãn tính dai dẳng khó dứt, tuyệt đối không nên chủ quan coi thường.`;
        baseScore -= 25;
        relSummary = `Bệnh sinh Bản Mệnh (Bệnh Nhập Thân - Bất Lợi)`;
      } else if (diseaseRel === 'destroys') {
        diseasePart = `🚨 <strong>MẦM BỆNH KHẮC BẢN MỆNH (NGUY HIỂM CẤP TÍNH)</strong>: Cung Mầm Bệnh (${PALACE_DETAILS[t1P]?.name} - ${t1Elem}) KHẮC Cung Bản Mệnh (${PALACE_DETAILS[subjP]?.name} - ${sElem}). Mầm bệnh hung hiểm, biến chứng cấp tính và xung sát dữ dội, nguy hại trực tiếp nguyên khí sinh mệnh, cần cấp cứu hoặc can thiệp y tế khẩn cấp!`;
        baseScore -= 35;
        relSummary = `Bệnh khắc Bản Mệnh (Nguy Hiểm Cấp Tính - Đại Hung)`;
      } else if (diseaseRel === 'destroyed_by') {
        diseasePart = `🌟 <strong>CHÍNH KHÍ THẮNG TÀ KHÍ (NGƯỜI THẮNG BỆNH)</strong>: Cung Bản Mệnh (${PALACE_DETAILS[subjP]?.name} - ${sElem}) KHẮC Cung Mầm Bệnh (${PALACE_DETAILS[t1P]?.name} - ${t1Elem}). Sức đề kháng và nguyên khí của người bệnh rất mạnh mẽ, cơ thể tự đào thải và chế ngự được mầm bệnh, chắc chắn tai qua nạn khỏi, sớm bình phục hoàn toàn!`;
        baseScore += 30;
        relSummary = `Bản Mệnh khắc Bệnh (Người Thắng Bệnh - Đại Cát)`;
      } else if (diseaseRel === 'generated_by') {
        diseasePart = `⚠️ <strong>NGƯỜI NUÔI BỆNH (TIÊU HAO NGUYÊN KHÍ)</strong>: Cung Bản Mệnh (${PALACE_DETAILS[subjP]?.name} - ${sElem}) SINH Cung Mầm Bệnh (${PALACE_DETAILS[t1P]?.name} - ${t1Elem}). Cơ thể suy nhược vì nuôi mầm bệnh, khí huyết tiêu hao nhiều, cần nghỉ ngơi bồi bổ nâng cao thể trạng.`;
        baseScore -= 15;
        relSummary = `Bản Mệnh sinh Bệnh (Nuôi Bệnh - Hao Tổn)`;
      } else {
        diseasePart = `⚖️ <strong>BỆNH VÀ THỂ TRẠNG CẦM CỰ</strong>: Cung Mầm Bệnh và Cung Bản Mệnh đồng khí (${sElem}). Bệnh tật và sức đề kháng đang ở thế giằng co, bệnh tình ổn định nhưng cần kiên trì điều trị đúng phác đồ.`;
        baseScore += 5;
        relSummary = `Bệnh & Bản Mệnh Đồng Khí (Cầm Cự)`;
      }

      // Thầy Thuốc vs Mầm Bệnh
      let doctorPart = "";
      if (t2P) {
        const docVsDis = getRelationType(t2Elem, t1Elem);
        if (docVsDis === 'destroys') {
          doctorPart = `🩺 <strong>DƯỢC ĐÁO BỆNH TRỪ (THẦY THUỐC KHẮC MẦM BỆNH)</strong>: Cung Thầy Thuốc & Y Dược (${PALACE_DETAILS[t2P]?.name} - ${t2Elem}) KHẮC Cung Mầm Bệnh (${PALACE_DETAILS[t1P]?.name} - ${t1Elem}). Y sư đắc lực, dược liệu và phác đồ điều trị đánh trúng căn nguyên, khống chế và tiêu diệt mầm bệnh triệt để, đại cát!`;
          baseScore += 30;
        } else if (docVsDis === 'destroyed_by') {
          doctorPart = `⚠️ <strong>BỆNH KHÁNG THUỐC</strong>: Cung Mầm Bệnh KHẮC Cung Thầy Thuốc. Bệnh trơ lì, kháng thuốc hoặc phác đồ hiện tại chưa đủ lực áp chế, cần xin ý kiến hội chẩn chuyên sâu hoặc đổi thuốc.`;
          baseScore -= 20;
        } else if (docVsDis === 'generates') {
          doctorPart = `🚨 <strong>DÙNG SAI THUỐC / TRỢ BỆNH</strong>: Cung Thầy Thuốc SINH Cung Mầm Bệnh. Uống nhầm thuốc hoặc bồi bổ sai cách làm mầm bệnh phát triển mạnh hơn, cần rà soát lại đơn thuốc và chế độ ăn uống ngay.`;
          baseScore -= 25;
        } else if (t2P === subjP) {
          doctorPart = `✨ <strong>THẦY THUỐC LÂM CUNG BẢN MỆNH</strong>: Cung Thầy Thuốc (${PALACE_DETAILS[t2P]?.name}) ngự ngay tại Cung Bản Mệnh! Bản thân gặp được danh y chuyên khoa tài đức, có quý nhân y tế tận tâm cứu giúp.`;
          baseScore += 20;
        } else {
          doctorPart = `🩺 <strong>PHỐI HỢP ĐIỀU TRỊ</strong>: Cung Thầy Thuốc (${PALACE_DETAILS[t2P]?.name} - ${t2Elem}) làm dịu triệu chứng của mầm bệnh (${t1Elem}), cần thời gian phục hồi từng bước.`;
          baseScore += 10;
        }
      }

      hostGuestText = `${diseasePart}<br><br>${doctorPart}`;

      // Không Vong trong Bệnh Tật: Thiên Nhuế ngộ Không = Đại Cát (Bệnh suy tàn / Bệnh giả)
      const t1KW = !!pT1.is_kong_wang;
      const t2KW = !!pT2?.is_kong_wang;
      const subjKW = !!pSubj.is_kong_wang;
      if (t1KW) {
        specialText += `✨ <strong>ĐIỂM SÁNG: Cung Mầm Bệnh ngộ TUẦN KHÔNG (Không Vong)</strong>: Trong Kỳ Môn chiêm bệnh, sao Thiên Nhuế lâm Không Vong là mầm bệnh đã suy tàn, hư hao, hoặc bệnh giả (chẩn đoán nhầm), không đáng lo ngại, tà khí sẽ sớm tự tiêu tán, người bệnh sớm bình phục! `;
        baseScore += 25;
      }
      if (t2KW) {
        specialText += `⚠️ Cung Thầy Thuốc ngộ TUẦN KHÔNG: Chưa gặp đúng thầy giỏi, bệnh viện hoặc phương thuốc hiện tại chưa phát huy tác dụng. `;
        baseScore -= 20;
      }
      if (subjKW) {
        specialText += `⚠️ Cung Bản Mệnh ngộ TUẦN KHÔNG: Tâm lý người bệnh lo âu thái quá, thần sắc bất an, chớ nên hoang mang. `;
        baseScore -= 10;
      }
      if (pT1.is_sky_horse || pSubj.is_sky_horse) {
        specialText += `🐎 Cung ngộ DỊCH MÃ: Bệnh biến chuyển nhanh, nên chủ động đi khám hoặc chuyển viện tuyến trên kịp thời để đón đầu thời cơ.`;
      }
      if (!specialText) {
        specialText = "Cung vị vững vàng, không ngộ Tuần Không, trường năng lượng sức khỏe tập trung ổn định.";
      }

      strategyText = `🎯 SÁCH LƯỢC Y TẾ & ĐIỀU DƯỠNG: Yên tâm tĩnh dưỡng, tuân thủ nghiêm ngặt phác đồ điều trị của bác sĩ chuyên khoa. Tránh tự ý dùng thuốc ngoài luồng; giữ tinh thần lạc quan, kiêng khem đúng mực sẽ nhanh chóng bình phục.`;

    } else if (domainKey === 'marriage') {
      // 💍 HÔN NHÂN & TÌNH DUYÊN
      const spouseRel = getRelationType(t1Elem, sElem);
      if (spouseRel === 'generates') {
        hostGuestText = `💖 <strong>ĐỐI PHƯƠNG SINH BẢN MỆNH (TÌNH SÂU NGHĨA NẶNG)</strong>: Cung Bạn Đời (${PALACE_DETAILS[t1P]?.name} - ${t1Elem}) SINH Cung Bản Mệnh (${PALACE_DETAILS[subjP]?.name} - ${sElem}). Đối phương hết lòng quan tâm, yêu thương, che chở và vun vén cho hạnh phúc lứa đôi.`;
        baseScore += 30;
        relSummary = `Bạn Đời sinh Bản Mệnh (Rất Thuận Lợi)`;
      } else if (spouseRel === 'destroys') {
        hostGuestText = `⚠️ <strong>ĐỐI PHƯƠNG KHẮC BẢN MỆNH (BẤT HÒA KHẮC KHẨU)</strong>: Cung Bạn Đời (${PALACE_DETAILS[t1P]?.name} - ${t1Elem}) KHẮC Cung Bản Mệnh (${PALACE_DETAILS[subjP]?.name} - ${sElem}). Đôi bên dễ nảy sinh bất đồng, đối phương lấn lướt, áp đặt hoặc tạo áp lực tâm lý.`;
        baseScore -= 25;
        relSummary = `Bạn Đời khắc Bản Mệnh (Bất Hòa)`;
      } else if (spouseRel === 'destroyed_by') {
        hostGuestText = `⚖️ <strong>BẢN MỆNH KHẮC ĐỐI PHƯƠNG (CẦN BAO DUNG)</strong>: Cung Bản Mệnh KHẮC Cung Bạn Đời. Bản thân có phần khắt khe, hay áp đặt suy nghĩ lên đối phương, cần lắng nghe và hạ bớt cái tôi.`;
        baseScore -= 10;
        relSummary = `Bản Mệnh khắc Bạn Đời (Cần Bao Dung)`;
      } else if (spouseRel === 'generated_by') {
        hostGuestText = `💖 <strong>BẢN MỆNH SINH ĐỐI PHƯƠNG (TỰ NGUYỆN HY SINH)</strong>: Cung Bản Mệnh SINH Cung Bạn Đời. Bản thân dành trọn tình cảm, chăm sóc và hy sinh vì đối phương, tình cảm sâu đậm.`;
        baseScore += 20;
        relSummary = `Bản Mệnh sinh Bạn Đời (Quan Tâm Sâu Sắc)`;
      } else {
        hostGuestText = `💑 <strong>TỶ HÒA ĐỒNG KHÍ (TƯƠNG KÍNH NHƯ TÂN)</strong>: Hai cung đồng khí (${sElem}), bình đẳng, tôn trọng và thấu hiểu lẫn nhau.`;
        baseScore += 25;
        relSummary = `Đồng Khí Hòa Hợp (Đại Cát)`;
      }

      if (t2P && pT2?.is_kong_wang) {
        specialText += `⚠️ Cung Lục Hợp (Hôn Phối) lâm TUẦN KHÔNG: Duyên phận dở dang, lời hứa hẹn suông, dễ xảy ra hiểu lầm hoặc rạn nứt tạm thời. `;
        baseScore -= 30;
      }
      strategyText = `🎯 SÁCH LƯỢC TÌNH DUYÊN: Chân thành chia sẻ, đặt mình vào vị trí đối phương để hóa giải khúc mắc. Lấy bao dung làm gốc để giữ gìn mái ấm gia đình.`;

    } else if (domainKey === 'wealth') {
      // 💰 ĐẦU TƯ & TÀI CHÍNH
      const wealthRel = getRelationType(t1Elem, sElem);
      if (wealthRel === 'generates') {
        hostGuestText = `💰 <strong>SINH MÔN SINH BẢN MỆNH (TIỀN BẠC TỰ TÌM ĐẾN)</strong>: Cung Lợi Nhuận (${PALACE_DETAILS[t1P]?.name} - ${t1Elem}) SINH Cung Bản Mệnh (${PALACE_DETAILS[subjP]?.name} - ${sElem}). Đại cát đại lợi! Cơ hội kinh doanh phát đạt, dòng tiền tự động chảy về túi, đầu tư sinh lời vượt kỳ vọng.`;
        baseScore += 30;
        relSummary = `Lợi Nhuận sinh Bản Mệnh (Đại Phú)`;
      } else if (wealthRel === 'destroys') {
        hostGuestText = `🚨 <strong>SINH MÔN KHẮC BẢN MỆNH (NGUY CƠ THUA LỖ)</strong>: Cung Lợi Nhuận KHẮC Cung Bản Mệnh. Đầu tư chịu rủi ro cực lớn, nguy cơ chôn vốn, thua lỗ và gánh nặng nợ nần đè nặng, tuyệt đối không nên vay mượn liều lĩnh.`;
        baseScore -= 30;
        relSummary = `Lợi Nhuận khắc Bản Mệnh (Thua Lỗ)`;
      } else if (wealthRel === 'destroyed_by') {
        hostGuestText = `💼 <strong>BẢN MỆNH KHẮC SINH MÔN (LAO TÂM CẦU TÀI)</strong>: Cung Bản Mệnh KHẮC Cung Lợi Nhuận. Có thể kiếm được tiền nhưng phải tranh đấu quyết liệt, bôn ba cật lực mới giữ được lợi nhuận.`;
        baseScore += 15;
        relSummary = `Bản Mệnh khắc Lợi Nhuận (Lao Lực Cầu Tài)`;
      } else {
        hostGuestText = `💵 <strong>ĐỒNG KHÍ TỤ TÀI</strong>: Cung Lợi Nhuận và Bản Mệnh cân bằng, kinh doanh giữ vững nhịp độ, an toàn vốn.`;
        baseScore += 15;
        relSummary = `Đồng Khí Hòa Hợp (Bình Ổn)`;
      }

      if (t2P && palaces[t2P]?.is_kong_wang) {
        specialText += `⚠️ Cung Tiền Vốn (Can Mậu) lâm TUẦN KHÔNG: Cạn kiệt dòng tiền mặt, thiếu hụt ngân sách, dễ bị gãy dòng tiền giữa chừng. `;
        baseScore -= 25;
      }
      if (pT1.is_kong_wang) {
        specialText += `⚠️ Cung Sinh Môn lâm TUẦN KHÔNG: Dự án lợi nhuận ảo, coi chừng "bánh vẽ", không nên xuống tiền. `;
        baseScore -= 25;
      }
      strategyText = `🎯 SÁCH LƯỢC TÀI CHÍNH: Quản trị rủi ro dòng tiền chặt chẽ, chốt lời từng phần, không dồn toàn bộ trứng vào một giỏ.`;

    } else if (domainKey === 'real_estate') {
      // 🏡 MUA BÁN NHÀ ĐẤT & BĐS
      const reRel = getRelationType(t1Elem, sElem);
      if (reRel === 'generates') {
        hostGuestText = `🏡 <strong>BẤT ĐỘNG SẢN VƯỢNG KHÍ</strong>: Cung Nhà Đất (${PALACE_DETAILS[t1P]?.name} - ${t1Elem}) SINH Cung Bản Mệnh. Phong thủy đắc địa, mua bán sinh đại lợi, tài sản gia tăng giá trị vượt trội.`;
        baseScore += 30;
        relSummary = `Nhà Đất sinh Bản Mệnh (Đại Cát)`;
      } else if (reRel === 'destroys') {
        hostGuestText = `⚠️ <strong>NHÀ ĐẤT KHẮC BẢN MỆNH</strong>: BĐS phạm lỗi phong thủy hoặc thế sát, mua vào hao tài tốnของ, bất an gia đạo.`;
        baseScore -= 25;
        relSummary = `Nhà Đất khắc Bản Mệnh (Bất Lợi)`;
      } else {
        hostGuestText = `🏡 <strong>GIAO DỊCH NHÀ ĐẤT BÌNH ỔN</strong>: Giao dịch diễn ra theo đúng quy trình, thích hợp an cư lạc nghiệp.`;
        baseScore += 15;
        relSummary = `Nhà Đất Hòa Hợp (Bình Ổn)`;
      }

      if (pT1.is_kong_wang || (t2P && palaces[t2P]?.is_kong_wang)) {
        specialText += `⚠️ Cung Nhà Đất lâm TUẦN KHÔNG: Vướng quy hoạch treo, pháp lý sổ đỏ chưa minh bạch, cẩn trọng tranh chấp. `;
        baseScore -= 25;
      }
      strategyText = `🎯 SÁCH LƯỢC BĐS: Thẩm tra kỹ pháp lý trích lục bản đồ địa chính, kiểm tra quy hoạch và thế đất trước khi đặt cọc.`;

    } else if (domainKey === 'debt') {
      // 💵 ĐÒI NỢ & THU HỒI VỐN
      const debtRel = getRelationType(t1Elem, t2Elem);
      if (debtRel === 'destroys') {
        hostGuestText = `💵 <strong>ĐÒI ĐƯỢC NỢ (THƯƠNG MÔN KHẮC CON NỢ)</strong>: Lực lượng đòi nợ (${PALACE_DETAILS[t1P]?.name}) KHẮC Cung Con Nợ (${PALACE_DETAILS[t2P]?.name}). Người đòi nắm đằng chuôi, tạo áp lực pháp lý ráo riết sẽ thu hồi được vốn.`;
        baseScore += 30;
        relSummary = `Thương Môn khắc Con Nợ (Thu Hồi Được)`;
      } else if (debtRel === 'destroyed_by') {
        hostGuestText = `⚠️ <strong>CON NỢ CHÂY Ì, THÁCH THỨC</strong>: Con Nợ KHẮC lại Thương Môn. Con nợ ngoan cố, trốn tránh, không chịu hợp tác hoàn trả.`;
        baseScore -= 30;
        relSummary = `Con Nợ khắc Thương Môn (Khó Đòi)`;
      } else {
        hostGuestText = `💵 <strong>CON NỢ CÓ THIỆN CHÍ ĐÀM PHÁN</strong>: Có thể thu hồi nợ từng phần nếu có phương án giãn nợ hợp lý.`;
        baseScore += 15;
        relSummary = `Đàm Phán Thu Hồi Nợ`;
      }

      if (t2P && palaces[t2P]?.is_kong_wang) {
        specialText += `⚠️ Cung Con Nợ lâm TUẦN KHÔNG: Con nợ đã bỏ trốn hoặc phá sản cạn kiệt, rất khó thu hồi tiền mặt. `;
        baseScore -= 30;
      }
      strategyText = `🎯 SÁCH LƯỢC THU HỒI NỢ: Dùng đòn bẩy pháp lý hoặc nhờ trung gian uy tín gây sức ép, chốt thỏa thuận trả dần.`;

    } else if (domainKey === 'lawsuit') {
      // ⚖️ KIỆN TỤNG & TÒA ÁN
      const courtRel = t2P ? getRelationType(t2Elem, sElem) : 'equal';
      if (courtRel === 'generates') {
        hostGuestText = `⚖️ <strong>QUAN TÒA ỦNG HỘ (NẮM CHẮC PHẦN THẮNG)</strong>: Cung Quan Tòa (${PALACE_DETAILS[t2P]?.name}) SINH Cung Bản Mệnh. Pháp luật và trọng tài đứng về phía lẽ phải, phán quyết có lợi, minh oan thắng kiện!`;
        baseScore += 35;
        relSummary = `Quan Tòa sinh Bản Mệnh (Thắng Kiện)`;
      } else if (courtRel === 'destroys') {
        hostGuestText = `🚨 <strong>QUAN TÒA KHẮC BẢN MỆNH (NGUY CƠ BỊ PHẠT)</strong>: Cung Quan Tòa KHẮC Cung Bản Mệnh. Phán quyết bất lợi, nguy cơ thua kiện hoặc bị xử phạt nặng nề, nên hòa giải sớm.`;
        baseScore -= 35;
        relSummary = `Quan Tòa khắc Bản Mệnh (Bất Lợi Lớn)`;
      } else {
        hostGuestText = `⚖️ <strong>VỤ ÁN GIẰNG CO</strong>: Tranh chấp phức tạp, cần bổ sung thêm chứng cứ sắc bén để giành ưu thế.`;
        baseScore += 10;
        relSummary = `Vụ Án Cân Bằng (Hòa Giải)`;
      }

      if (t2P && palaces[t2P]?.is_kong_wang) {
        specialText += `⚠️ Cung Quan Tòa lâm TUẦN KHÔNG: Phiên tòa bị hoãn, hồ sơ đình trệ, vụ kiện kéo dài dai dẳng. `;
        baseScore -= 15;
      }
      strategyText = `🎯 SÁCH LƯỢC TRANH TỤNG: Nhờ luật sư giàu kinh nghiệm, củng cố chứng cứ thành văn bản pháp lý chặt chẽ.`;

    } else if (domainKey === 'exam') {
      // 🎓 THI CỬ & HỌC VẤN
      const examRel = getRelationType(t1Elem, sElem);
      if (examRel === 'generates') {
        hostGuestText = `🎓 <strong>BẢNG VÀNG DANH DỰ (THỦ KHOA ĐỖ ĐẠT)</strong>: Cung Bài Thi (${PALACE_DETAILS[t1P]?.name}) SINH Cung Bản Mệnh. Làm bài trúng tủ, đề thi phát huy đúng sở trường, kết quả đỗ đạt cao ngoài mong đợi!`;
        baseScore += 35;
        relSummary = `Bài Thi sinh Bản Mệnh (Đỗ Đạt Cao)`;
      } else if (examRel === 'destroys') {
        hostGuestText = `⚠️ <strong>ĐỀ THI HÓC BÚA</strong>: Cung Bài Thi KHẮC Cung Bản Mệnh. Đề thi khó, dễ phạm sai sót ngoài ý muốn, điểm số không như ý.`;
        baseScore -= 20;
        relSummary = `Bài Thi khắc Bản Mệnh (Khó Khăn)`;
      } else {
        hostGuestText = `🎓 <strong>KẾT QUẢ THI CỬ BÌNH ỔN</strong>: Điểm số phản ánh đúng học lực, vừa đủ chỉ tiêu đậu.`;
        baseScore += 15;
        relSummary = `Thi Cử Đạt Yêu Cầu`;
      }

      if (pT1.is_kong_wang) {
        specialText += `⚠️ Cung Bài Thi lâm TUẦN KHÔNG: Dễ sai sót kỹ thuật tô nhầm mã đề, mất bài hoặc trượt oan. `;
        baseScore -= 25;
      }
      strategyText = `🎯 SÁCH LƯỢC ÔN LUYỆN: Ôn tập có hệ thống theo sơ đồ tư duy, kiểm tra kỹ lại bài làm trước khi nộp.`;

    } else if (domainKey === 'career') {
      // 👔 CÔNG DANH & SỰ NGHIỆP
      const careerRel = getRelationType(t1Elem, sElem);
      if (careerRel === 'generates') {
        hostGuestText = `👔 <strong>QUAN LỘ THÊNH THANG (THĂNG CHỨC ĐỀ BẠT)</strong>: Cung Cơ Quan (${PALACE_DETAILS[t1P]?.name}) SINH Cung Bản Mệnh. Được lãnh đạo tin cậy trao trọng trách, công danh thăng tiến rực rỡ!`;
        baseScore += 35;
        relSummary = `Cơ Quan sinh Bản Mệnh (Thăng Quan)`;
      } else if (careerRel === 'destroys') {
        hostGuestText = `⚠️ <strong>ÁP LỰC CÔNG VIỆC ĐÈ NẶNG</strong>: Cơ quan đào thải khốc liệt, sếp khắt khe, công việc nhiều trở ngại.`;
        baseScore -= 25;
        relSummary = `Cơ Quan khắc Bản Mệnh (Áp Lực)`;
      } else {
        hostGuestText = `👔 <strong>CÔNG DANH VỮNG VÀNG</strong>: Công việc ổn định, hoàn thành tốt nhiệm vụ được giao.`;
        baseScore += 15;
        relSummary = `Công Danh Ổn Định`;
      }

      if (pT1.is_kong_wang) {
        specialText += `⚠️ Cung Khai Môn lâm TUẦN KHÔNG: Dự án bị đóng băng, cơ quan tinh giản biên chế, vị trí bấp bênh. `;
        baseScore -= 25;
      }
      strategyText = `🎯 SÁCH LƯỢC SỰ NGHIỆP: Nâng cao năng lực chuyên môn, giữ thái độ chuẩn mực và xây dựng liên minh đồng nghiệp vững chắc.`;

    } else if (domainKey === 'contract') {
      // 📝 KÝ HỢP ĐỒNG & ĐÀM PHÁN
      const conRel = getRelationType(t1Elem, sElem);
      if (conRel === 'generates') {
        hostGuestText = `📝 <strong>ĐÀM PHÁN ĐẠI THÀNH (HỢP ĐỒNG ĐẮC LỢI)</strong>: Cung Hợp Đồng (${PALACE_DETAILS[t1P]?.name}) SINH Cung Bản Mệnh. Điều khoản ký kết vô cùng thuận lợi, đối tác hào hứng hợp tác, ký kết thành công rực rỡ!`;
        baseScore += 35;
        relSummary = `Hợp Đồng sinh Bản Mệnh (Đại Cát)`;
      } else if (conRel === 'destroys') {
        hostGuestText = `🚨 <strong>HỢP ĐỒNG CÓ BẪY PHÁP LÝ</strong>: Cung Hợp Đồng KHẮC Cung Bản Mệnh. Điều khoản gài bẫy bất lợi, nguy cơ đền bù hợp đồng cao, tuyệt đối không được ký vội vàng.`;
        baseScore -= 30;
        relSummary = `Hợp Đồng khắc Bản Mệnh (Bẫy Pháp Lý)`;
      } else {
        hostGuestText = `📝 <strong>ĐÀM PHÁN ĐÔI BÊN CÙNG CÓ LỢI</strong>: Hợp đồng cân bằng quyền lợi hai bên, có thể tiến hành ký kết.`;
        baseScore += 15;
        relSummary = `Hợp Đồng Cân Bằng (Ký Kết Tốt)`;
      }

      if (t2P && palaces[t2P]?.is_kong_wang) {
        specialText += `⚠️ Cung Lục Hợp lâm TUẦN KHÔNG: Đối tác lật lọng, hủy hẹn đàm phán phút chót, hợp đồng đổ bể. `;
        baseScore -= 30;
      }
      strategyText = `🎯 SÁCH LƯỢC ĐÀM PHÁN: Rà soát từng câu chữ hợp đồng với bộ phận pháp chế, ràng buộc rõ cơ chế giải quyết tranh chấp.`;

    } else if (domainKey === 'lost_item') {
      // 🔍 TÌM ĐỒ VẬT THẤT LẠC
      const itemRel = getRelationType(t1Elem, sElem);
      if (itemRel === 'generates') {
        hostGuestText = `🔍 <strong>ĐỒ VẬT TỰ QUAY VỀ (SỚM TÌM THẤY)</strong>: Cung Đồ Vật (${PALACE_DETAILS[t1P]?.name}) SINH Cung Bản Mệnh. Đồ vật còn nguyên vẹn, dễ dàng tìm lại được trong thời gian ngắn!`;
        baseScore += 30;
        relSummary = `Vật Mất sinh Bản Mệnh (Dễ Tìm Thấy)`;
      } else if (itemRel === 'destroys') {
        hostGuestText = `⚠️ <strong>ĐỒ VẬT THẤT LẠC RA XA</strong>: Đồ vật đã bị mang đi xa hoặc rơi vào vị trí khó tiếp cận, khó lòng tìm lại.`;
        baseScore -= 20;
        relSummary = `Vật Mất khắc Bản Mệnh (Khó Tìm)`;
      } else {
        hostGuestText = `🔍 <strong>ĐỒ VẬT Ở GẦN ĐÂU ĐÂY</strong>: Cần tìm kiếm kỹ tại các vị trí kín đáo trong nhà hoặc cơ quan.`;
        baseScore += 15;
        relSummary = `Vật Mất Ở Gần`;
      }

      if (t2P && palaces[t2P]?.is_kong_wang) {
        specialText += `✨ Cung Huyền Vũ (Kẻ Gian) lâm TUẦN KHÔNG: Không phải bị trộm cắp, mà do chính mình để quên hoặc cất kỹ trong nhà! `;
        baseScore += 25;
      }
      strategyText = `🎯 SÁCH LƯỢC TÌM KIẾM: Tìm kiếm theo phương vị của Cung ${PALACE_DETAILS[t1P]?.name} (${PALACE_DETAILS[t1P]?.direction}) hoặc hỏi những người trong cung mạng liên quan.`;

    } else if (domainKey === 'missing_user') {
      // ✈️ XUẤT NGOẠI & ĐI XA
      const travelRel = getRelationType(t1Elem, sElem);
      if (travelRel === 'generates') {
        hostGuestText = `✈️ <strong>XUẤT NGOẠI ĐẠI CÁT (QUÝ NHÂN ĐÓN RƯỚC)</strong>: Cung Phương Xa (${PALACE_DETAILS[t1P]?.name}) SINH Cung Bản Mệnh. Xuất ngoại thuận buồm xuôi gió, đi xa gặp may mắn, công việc thăng hoa!`;
        baseScore += 30;
        relSummary = `Phương Xa sinh Bản Mệnh (Đại Cát)`;
      } else if (travelRel === 'destroys') {
        hostGuestText = `⚠️ <strong>TRẮC TRỞ HÀNH TRÌNH</strong>: Cung Phương Xa KHẮC Cung Bản Mệnh. Đi lại gặp trở ngại, hoãn chuyến bay hoặc trục trặc giấy tờ visa.`;
        baseScore -= 25;
        relSummary = `Phương Xa khắc Bản Mệnh (Trắc Trở)`;
      } else {
        hostGuestText = `✈️ <strong>CHUYẾN ĐI BÌNH AN</strong>: Hành trình diễn ra an toàn, thuận lợi theo đúng lịch trình.`;
        baseScore += 15;
        relSummary = `Hành Trình Bình An`;
      }

      if (t2P && palaces[t2P]?.is_kong_wang) {
        specialText += `⚠️ Cung Khai Môn lâm TUẦN KHÔNG: Kẹt hồ sơ xuất cảnh, hoãn hủy chuyến đi hoặc trục trặc cửa khẩu. `;
        baseScore -= 25;
      }
      if (pT1.is_sky_horse || (t2P && palaces[t2P]?.is_sky_horse)) {
        specialText += `🐎 Cung ngộ DỊCH MÃ: Lên đường gấp gáp, hành trình biến chuyển cực kỳ mau lẹ!`;
        baseScore += 10;
      }
      strategyText = `🎯 SÁCH LƯỢC ĐI XA: Chuẩn bị giấy tờ tùy thân kỹ lưỡng, kiểm tra visa và phương tiện di chuyển trước giờ khởi hành.`;

    } else if (domainKey === 'childbirth') {
      // 👶 SINH NỞ & CON CÁI
      const birthRel = getRelationType(t1Elem, sElem);
      if (birthRel === 'generates') {
        hostGuestText = `👶 <strong>MẸ TRÒN CON VUÔNG (SINH NỞ ĐẠI PHÚC)</strong>: Cung Thai Nhi (${PALACE_DETAILS[t1P]?.name}) SINH Cung Sản Phụ. Thai kỳ khỏe mạnh, sinh nở thuận lợi, em bé chào đời bình an, phúc khí tràn trề!`;
        baseScore += 35;
        relSummary = `Thai Nhi sinh Sản Phụ (Mẹ Tròn Con Vuông)`;
      } else if (birthRel === 'destroys') {
        hostGuestText = `⚠️ <strong>SINH KHÓ (CẦN THEO DÕI Y TẾ KỸ)</strong>: Cung Thai Nhi KHẮC Cung Sản Phụ. Chuyển dạ phức tạp hoặc sinh khó, cần có sự can thiệp và theo dõi sát sao của bác sĩ sản khoa.`;
        baseScore -= 25;
        relSummary = `Thai Nhi khắc Sản Phụ (Cần Theo Dõi Kỹ)`;
      } else {
        hostGuestText = `👶 <strong>THAI KỲ BÌNH ỔN</strong>: Mẹ và bé đều ổn định, tiếp tục duy trì chế độ dinh dưỡng nghỉ ngơi khoa học.`;
        baseScore += 20;
        relSummary = `Thai Kỳ Bình Ổn`;
      }

      if (pT1.is_kong_wang) {
        specialText += `⚠️ Cung Sinh Môn lâm TUẦN KHÔNG: Thai kỳ cần đặc biệt giữ gìn, phòng ngừa dọa sẩy hoặc sinh non. `;
        baseScore -= 25;
      }
      strategyText = `🎯 SÁCH LƯỢC SẢN KHOA: Khám thai định kỳ đúng hẹn, chuẩn bị sẵn sàng hồ sơ sinh và ekip y tế tại bệnh viện uy tín.`;

    } else {
      // Vạn Sự
      const genRel = evaluate5Relationship(subjP, t1P);
      baseScore += genRel.scoreDelta;
      hostGuestText = genRel.type === 'sinh_nhap'
        ? `Thế sự đại thuận! Cung Sự việc SINH NHẬP cho Cung Bản mệnh.`
        : (genRel.type === 'khac_nhap' ? `Cung Sự việc KHẮC NHẬP Bản Mệnh.` : `Cung Sự việc và Bản Mệnh bình hòa.`);
      relSummary = genRel.relation;
      strategyText = `🎯 SÁCH LƯỢC VẠN SỰ: Tùy cơ ứng biến, thuận theo thời thế.`;
    }

    // Đóng gói thông tin Target 1 và Target 2
    const buildTargetInfo = (pId, roleName, targetLabel) => {
      const p = palaces[pId] || {};
      return {
        palaceId: pId,
        name: PALACE_DETAILS[pId]?.name || `Cung ${pId}`,
        direction: PALACE_DETAILS[pId]?.direction || '',
        element: PALACE_WUXING[pId] || 'Thổ',
        roleName: roleName,
        targetLabel: targetLabel,
        door: p.door || '',
        star: p.star || '',
        deity: p.deity || '',
        heavenStem: p.heaven_stem || '',
        earthStem: p.earth_stem || '',
        isKongWang: !!p.is_kong_wang,
        isSkyHorse: !!p.is_sky_horse
      };
    };

    const primaryTargetInfo = buildTargetInfo(t1P, t1Role, t1Label);
    const secondaryTargetInfo = t2P ? buildTargetInfo(t2P, t2Role, t2Label) : null;

    let timingText = `Dự báo ứng nghiệm vào các ngày / tháng có Địa Chi: <strong>${PALACE_DETAILS[t1P]?.branches || 'Tùy Cung'}</strong> hoặc khi Trực Sử lâm vị.`;
    let directionText = `Phương vị đón Cát Khí: <strong>${PALACE_DETAILS[t1P]?.direction || 'Xem bàn cờ'}</strong> (${PALACE_DETAILS[t1P]?.name || ''}) hoặc Cung có Trực Phù / Khai Môn.`;

    const finalScore = Math.max(5, Math.min(98, Math.round(baseScore)));
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
      domainKey: domainKey,
      domainName: domainName,
      subjectPalace: subjP,
      subjectInfo: {
        palaceId: subjP,
        name: PALACE_DETAILS[subjP]?.name || `Cung ${subjP}`,
        direction: PALACE_DETAILS[subjP]?.direction || '',
        element: PALACE_WUXING[subjP] || 'Thổ',
        querentLabel: querentLabel,
        door: pSubj.door || '',
        star: pSubj.star || '',
        deity: pSubj.deity || '',
        heavenStem: pSubj.heaven_stem || '',
        earthStem: pSubj.earth_stem || ''
      },
      // Tương thích ngược:
      objectPalace: t1P,
      objectInfo: primaryTargetInfo,
      // Cặp Dụng Thần Mới:
      primaryTargetInfo: primaryTargetInfo,
      secondaryTargetInfo: secondaryTargetInfo,
      relationship: relSummary,
      score: finalScore,
      verdict: verdict,
      badgeClass: badgeClass,
      layers: {
        hostGuest: hostGuestText,
        doorDetail: t1Pillars.door,
        starDetail: t1Pillars.star,
        deityDetail: t1Pillars.deity,
        stemPatternDetail: t1Pillars.stemPattern,
        target1Pillars: t1Pillars,
        target2Pillars: t2Pillars,
        specialStates: specialText,
        strategy: strategyText,
        direction: directionText,
        timing: timingText
      },
      advice: `${hostGuestText} ${strategyText}`
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
    getStemChiFromYear: getStemChiFromYear,
    runOmniForecast: runOmniForecast,
    evaluate5Relationship: evaluate5Relationship,
    degreeToMountain: degreeToMountain,
    evaluateHouseFengShuiSafety: evaluateHouseFengShuiSafety
  };

  global.KetNoiVuTruEngine = KetNoiVuTruEngine;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = KetNoiVuTruEngine;
  }

})(typeof window !== 'undefined' ? window : globalThis);
