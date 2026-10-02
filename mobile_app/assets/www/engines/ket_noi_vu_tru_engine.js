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

  function runOmniForecast(domainKey, chartData, querentOptions = {}) {
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

    // 1. Xác định Cung Chủ Thể (Người Hỏi)
    let subjP = 1;
    let querentLabel = "";
    const querentMode = querentOptions.mode || 'hour'; // 'hour' | 'birth_year'

    if (querentMode === 'birth_year') {
      let stem = querentOptions.stem;
      if (!stem && querentOptions.year) {
        stem = getStemChiFromYear(querentOptions.year).stem;
      }
      stem = stem || 'Giáp';
      const gStr = querentOptions.gender ? (querentOptions.gender === 'nam' ? 'Nam ♂' : 'Nữ ♀') : '';
      querentLabel = `Can Năm Sinh: ${stem}${querentOptions.year ? ` (${querentOptions.year}${gStr ? ' ' + gStr : ''})` : (gStr ? ` (${gStr})` : '')}`;

      // Giáp trong Kỳ Môn ẩn dưới Lục Nghi (mặc định Giáp Tý ẩn Mậu hoặc Cung Trực Phù)
      if (stem === 'Giáp') {
        subjP = findPalaceWith('deity', 'Trực Phù') || findPalaceWith('heaven_stem', 'Mậu');
      } else {
        subjP = findPalaceWith('heaven_stem', stem);
        if (!subjP || subjP === 1) {
          subjP = findPalaceWith('earth_stem', stem) || 1;
        }
      }
    } else {
      // Mặc định: Nhật Can (Can Ngày) hoặc Cung 1
      const dayCan = chartData.day_can || '';
      if (dayCan) {
        subjP = (dayCan === 'Giáp')
          ? (findPalaceWith('deity', 'Trực Phù') || findPalaceWith('heaven_stem', 'Mậu'))
          : findPalaceWith('heaven_stem', dayCan);
        querentLabel = `Nhật Can (Can Ngày): ${dayCan}`;
      } else {
        subjP = chartData.day_palace || 1;
        querentLabel = `Chủ Thể Can Giờ / Ngày`;
      }
    }

    // 2. Xác định Cung Dụng Thần (Sự Việc) theo 12 Lĩnh Vực
    let objP = 1;
    let targetLabel = "";
    let domainName = "";

    switch (domainKey) {
      case 'wealth':
        domainName = "Đầu Tư & Tài Chính";
        objP = findPalaceWith('door', 'Sinh Môn');
        targetLabel = "Lợi Nhuận (Sinh Môn) & Vốn Liếng (Mậu)";
        break;
      case 'marriage':
        domainName = "Hôn Nhân & Tình Duyên";
        if (querentOptions.gender === 'nam') {
          objP = findPalaceWith('heaven_stem', 'Ất') || findPalaceWith('deity', 'Lục Hợp');
          targetLabel = "Người Nữ / Bạn Đời (Thiên Can Ất) • Đồng Thuận (Lục Hợp)";
        } else if (querentOptions.gender === 'nu') {
          objP = findPalaceWith('heaven_stem', 'Canh') || findPalaceWith('deity', 'Lục Hợp');
          targetLabel = "Người Nam / Bạn Đời (Thiên Can Canh) • Đồng Thuận (Lục Hợp)";
        } else {
          objP = findPalaceWith('deity', 'Lục Hợp');
          targetLabel = "Hôn Phối (Lục Hợp) • Đối tác (Ất/Canh)";
        }
        break;
      case 'career':
        domainName = "Công Danh & Sự Nghiệp";
        objP = findPalaceWith('door', 'Khai Môn');
        targetLabel = "Cơ Quan / Công Việc (Khai Môn)";
        break;
      case 'contract':
        domainName = "Ký Hợp Đồng & Đàm Phán";
        objP = findPalaceWith('door', 'Cảnh Môn');
        targetLabel = "Văn Bản Hợp Đồng (Cảnh Môn) • Đồng thuận (Lục Hợp)";
        break;
      case 'real_estate':
        domainName = "Mua Bán Nhà Đất & BĐS";
        objP = findPalaceWith('door', 'Sinh Môn');
        targetLabel = "Nhà Cửa BĐS (Sinh Môn) • Đất Đai (Tử Môn)";
        break;
      case 'debt':
        domainName = "Đòi Nợ & Thu Hồi Vốn";
        objP = findPalaceWith('door', 'Thương Môn');
        targetLabel = "Người Đòi Nợ (Thương Môn) • Tiền Vốn (Mậu)";
        break;
      case 'exam':
        domainName = "Thi Cử & Học Vấn";
        objP = findPalaceWith('star', 'Thiên Phụ');
        targetLabel = "Hội Đồng / Trường Thi (Thiên Phụ) • Bài Thi (Cảnh Môn)";
        break;
      case 'medical':
        domainName = "Sức Khỏe & Bệnh Tật";
        objP = findPalaceWith('star', 'Thiên Nhuế');
        targetLabel = "Mầm Bệnh (Thiên Nhuế) • Thầy Thuốc (Thiên Tâm / Ất)";
        break;
      case 'lawsuit':
        domainName = "Kiện Tụng & Tòa Án";
        objP = findPalaceWith('door', 'Kinh Môn');
        targetLabel = "Khẩu Thiệt Tranh Tụng (Kinh Môn) • Tòa Án (Trực Phù)";
        break;
      case 'lost_item':
        domainName = "Tìm Đồ Vật Thất Lạc";
        objP = chartData.hour_palace || findPalaceWith('deity', 'Huyền Vũ');
        targetLabel = "Vật Mất (Thời Can) • Kẻ Gian (Huyền Vũ)";
        break;
      case 'missing_user':
        domainName = "Xuất Ngoại & Đi Xa";
        objP = findPalaceWith('deity', 'Cửu Thiên');
        targetLabel = "Phương Xa (Cửu Thiên) • Di Chuyển (Dịch Mã)";
        break;
      case 'childbirth':
        domainName = "Sinh Nở & Con Cái";
        if (querentOptions.gender === 'nu') {
          objP = findPalaceWith('door', 'Sinh Môn');
          targetLabel = "Thai Nhi & Sinh Nở (Sinh Môn) • Sản Phụ (Cung Bản Mệnh)";
        } else {
          objP = 2; // Cung Khôn 2
          targetLabel = "Sản Phụ / Người Mẹ (Cung Khôn 2) • Thai Nhi (Sinh Môn)";
        }
        break;
      default:
        domainName = "Vạn Sự Chiêm Đoán";
        objP = chartData.hour_palace || 9;
        targetLabel = "Sự Việc Khách Thể (Thời Can)";
        break;
    }

    const pSubj = palaces[subjP] || {};
    const pObj = palaces[objP] || {};

    // 3. Phân tích Ngũ Hành Sinh Khắc Chủ - Khách
    const rel = evaluate5Relationship(subjP, objP);
    let baseScore = 50 + rel.scoreDelta;

    // 4. Bóc tách chi tiết 4 Trụ Cột tại Cung Sự Việc
    const doorInfo = DOOR_ROLES[pObj.door] || { nature: pObj.door || 'Bình Môn', role: 'Năng lượng bình ổn.', delta: 0 };
    const starInfo = STAR_ROLES[pObj.star] || { nature: pObj.star || 'Bình Tinh', desc: 'Thiên thời trung tính.', delta: 0 };
    const deityInfo = DEITY_ROLES[pObj.deity] || { nature: pObj.deity || 'Bình Thần', desc: 'Thần trợ mức trung bình.', delta: 0 };

    const stemPair = `${pObj.heaven_stem || ''}+${pObj.earth_stem || ''}`;
    const patternInfo = STEM_PATTERN_LOOKUP[stemPair] || null;

    baseScore += (doorInfo.delta || 0);
    baseScore += (starInfo.delta || 0);
    baseScore += (deityInfo.delta || 0);
    if (patternInfo) {
      baseScore += (patternInfo.delta || 0);
    }

    // 5. Kiểm tra Không Vong & Dịch Mã
    const objIsKW = !!pObj.is_kong_wang;
    const subjIsKW = !!pSubj.is_kong_wang;
    const hasHorse = !!pObj.is_sky_horse;

    if (objIsKW) baseScore -= 25;
    if (subjIsKW) baseScore -= 15;
    if (hasHorse) baseScore += 5;

    // 6. Tổng hợp Luận Giải Đa Tầng (Multi-Layer Synthesis)
    // Tầng 1: Chủ - Khách
    let hostGuestText = "";
    if (rel.type === 'sinh_nhap') {
      hostGuestText = `Thế sự đại thuận! Cung Sự việc (${PALACE_DETAILS[objP]?.name} - ${PALACE_WUXING[objP]}) SINH NHẬP cho Cung Bản mệnh (${PALACE_DETAILS[subjP]?.name} - ${PALACE_WUXING[subjP]}). Mọi sự tự tìm đến, được quý nhân chủ động đưa cơ hội và tài lộc tới tay, không nhọc công tranh đấu.`;
    } else if (rel.type === 'sinh_xuat') {
      hostGuestText = `Cung Bản mệnh (${PALACE_DETAILS[subjP]?.name} - ${PALACE_WUXING[subjP]}) SINH XUẤT cho Cung Sự việc (${PALACE_DETAILS[objP]?.name} - ${PALACE_WUXING[objP]}). Bản thân phải đầu tư nhiều công sức, tiền bạc và tâm huyết ra gầy dựng ban đầu. Có kết quả nhưng hao tổn sinh lực, cần lượng sức.`;
    } else if (rel.type === 'khac_xuat') {
      hostGuestText = `Cung Bản mệnh KHẮC XUẤT Cung Sự việc. Thế trận nằm trong tầm kiểm soát của bạn, nhưng phải nỗ lực vượt qua nhiều chông gai, tranh đấu quyết liệt mới giành được thắng lợi cuối cùng.`;
    } else if (rel.type === 'khac_nhap') {
      hostGuestText = `Cảnh báo bất lợi nghiêm trọng! Cung Sự việc KHẮC NHẬP Cung Bản mệnh. Bạn đang ở thế yếu, dễ bị đối phương hoặc hoàn cảnh chèn ép, nguy cơ thua thiệt và hao tài tốn của rất cao. Tuyệt đối không nên đối đầu trực diện.`;
    } else {
      hostGuestText = `Cung Bản mệnh và Cung Sự việc TỶ HÒA đồng khí (${PALACE_WUXING[subjP]}). Thế trận cân bằng, hòa hợp, thích hợp đàm phán hợp tác đôi bên cùng có lợi.`;
    }

    // Tầng 2: Tứ Trụ Cột (Môn - Tinh - Thần - Can)
    const doorDetail = `🚪 Bát Môn [${pObj.door || 'Chưa định'}]: ${doorInfo.nature}. ${doorInfo.role}`;
    const starDetail = `⭐ Cửu Tinh [${pObj.star || 'Chưa định'}]: ${starInfo.nature}. ${starInfo.desc}`;
    const deityDetail = `🔮 Thần Trợ [${pObj.deity || 'Chưa định'}]: ${deityInfo.nature}. ${deityInfo.desc}`;
    let stemPatternDetail = `⚡ Thập Can [${stemPair}]: Can Thiên ${pObj.heaven_stem} phối Can Địa ${pObj.earth_stem}.`;
    if (patternInfo) {
      stemPatternDetail += ` Đắc Cách: <strong>${patternInfo.name}</strong> (${patternInfo.note})`;
    } else {
      stemPatternDetail += ` Khí trường bình ổn, không xung sát nghiêm trọng.`;
    }

    // Tầng 3: Không Vong & Dịch Mã
    let specialText = "";
    if (objIsKW) {
      specialText += `⚠️ Cung Dụng Thần lâm <strong>TUẦN KHÔNG (Không Vong)</strong>: Khí số suy giảm 70-80%, sự việc còn lơ lửng, lời hứa hẹn dễ thành "bánh vẽ", hợp đồng có nguy cơ bị hoãn hoặc hủy. Cần đợi tuần xung Không để mọi sự rõ ràng. `;
    }
    if (subjIsKW) {
      specialText += `⚠️ Cung Người Hỏi lâm <strong>TUẦN KHÔNG</strong>: Tâm lý người hỏi còn hoang mang, năng lực hoặc tài chính chưa chuẩn bị chu tất, chớ vội vàng quyết định lớn. `;
    }
    if (hasHorse) {
      specialText += `🐎 Cung ngộ <strong>DỊCH MÃ</strong>: Biến chuyển cực kỳ mau lẹ! Có sự di chuyển vị trí, thay đổi nhân sự hoặc công tác xa, cần chớp thời cơ dứt khoát.`;
    }
    if (!specialText) {
      specialText = "Cung vị vững vàng, không ngộ Tuần Không, trường năng lượng tập trung ổn định.";
    }

    // Tầng 4: Sách Lược Hành Động & Ứng Kỳ
    let strategyText = "";
    let timingText = `Dự báo ứng nghiệm vào các ngày / tháng có Địa Chi: <strong>${PALACE_DETAILS[objP]?.branches || 'Tùy Cung'}</strong> hoặc khi Trực Sử lâm vị.`;
    let directionText = `Phương vị đón Cát Khí hành động: <strong>${PALACE_DETAILS[objP]?.direction || 'Xem bàn cờ'}</strong> (Cung ${objP}) hoặc Cung có Trực Phù / Khai Môn.`;

    if (baseScore >= 70) {
      strategyText = `🎯 SÁCH LƯỢC TẤN CÔNG: Thời cơ chín muồi, nên chủ động ký kết, mở rộng đầu tư, xuất hành đàm phán. Tận dụng tối đa sự ủng hộ của quý nhân để chốt việc dứt khoát.`;
    } else if (baseScore >= 50) {
      strategyText = `🎯 SÁCH LƯỢC BẢO TOÀN: Giữ vững thế trận, làm rõ từng điều khoản hợp đồng/pháp lý, tiến từng bước chắc chắn. Không nên vay mượn quá đà hoặc mạo hiểm vào lĩnh vực mới.`;
    } else {
      strategyText = `🎯 SÁCH LƯỢC PHÒNG THỦ: Tạm hoãn các kế hoạch mở rộng, kiểm toán lại dòng tiền và bảo mật thông tin. Chuyển sang thế thủ, tích lũy nội lực, chờ thời vận chuyển biến mới hành động.`;
    }

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
      objectPalace: objP,
      objectInfo: {
        palaceId: objP,
        name: PALACE_DETAILS[objP]?.name || `Cung ${objP}`,
        direction: PALACE_DETAILS[objP]?.direction || '',
        element: PALACE_WUXING[objP] || 'Thổ',
        targetLabel: targetLabel,
        door: pObj.door || '',
        star: pObj.star || '',
        deity: pObj.deity || '',
        heavenStem: pObj.heaven_stem || '',
        earthStem: pObj.earth_stem || '',
        isKongWang: objIsKW,
        isSkyHorse: hasHorse
      },
      relationship: rel.relation,
      score: finalScore,
      verdict: verdict,
      badgeClass: badgeClass,
      layers: {
        hostGuest: hostGuestText,
        doorDetail: doorDetail,
        starDetail: starDetail,
        deityDetail: deityDetail,
        stemPatternDetail: stemPatternDetail,
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
