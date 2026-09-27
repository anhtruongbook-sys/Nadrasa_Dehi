/**
 * NETA LIGHT - CLASSICAL TAROT INTERPRETER ENGINE (V2.0 ADVANCED)
 * 
 * Dựa trên hệ thống biểu tượng Rider-Waite-Smith (RWS) & Thuật toán Golden Dawn Elemental Dignities.
 * Tích hợp 3 Thuật toán Luận giải Chuyên sâu Offline (Zero-AI):
 * 1. The Quintessence Card (Lá Bài Cốt Tủy - Paul Foster Case & Mary K. Greer)
 * 2. Archetypal Pattern Matching (Mẫu hình Hoàng gia, Đơn sắc, Cặp bài đối ngẫu)
 * 3. Dialectical Narrative Synthesis (Mạch truyện nhân quả biện chứng xâu chuỗi 3 thì)
 */

(function (global) {
  'use strict';

  // 1. CƠ SỞ TRI THỨC 78 LÁ BÀI TAROT
  const TAROT_DATABASE = {
  "Major_00_Fool": {
    "id": "Major_00_Fool",
    "name_en": "The Fool",
    "name_vi": "Kẻ Khờ",
    "arcana": "Major",
    "element": "Air",
    "number": 0,
    "file": "Major_00_Fool.png",
    "keywords_up": "Khởi đầu mới, tự do, ngây thơ, tiềm năng vô hạn, niềm tin thuần khiết",
    "keywords_rev": "Liều lĩnh mù quáng, ngây thơ thái quá, do dự, sợ rủi ro",
    "meanings": {
      "general": "Một hành trình mới bắt đầu với lòng dũng cảm và niềm tin thuần khiết.",
      "career": "Khởi nghiệp, thử sức lĩnh vực mới mẻ, đổi ngành nghề, cơ hội bất ngờ.",
      "love": "Mối quan hệ mới mẻ, tự do, vui vẻ không ràng buộc hoặc tình cảm ngây thơ."
    },
    "advice": "Hãy dũng cảm đón nhận bước ngoặt mới, nhưng nhớ để mắt tới bờ vực dưới chân."
  },
  "Major_01_Magician": {
    "id": "Major_01_Magician",
    "name_en": "The Magician",
    "name_vi": "Ảo Thuật Gia",
    "arcana": "Major",
    "element": "Air",
    "number": 1,
    "file": "Major_01_Magician.png",
    "keywords_up": "Hiện thực hóa, chủ động, tài năng, tập trung ý chí, nguồn lực sẵn có",
    "keywords_rev": "Thao túng, lừa dối, tài năng chưa dùng, ảo tưởng sức mạnh",
    "meanings": {
      "general": "Bạn hội tụ đủ mọi nguồn lực cần thiết để biến ý tưởng thành hiện thực.",
      "career": "Kỹ năng chuyên môn xuất sắc, thuyết phục khách hàng, làm chủ dự án.",
      "love": "Sự chủ động quyến rũ, kết nối ăn ý, giao tiếp cởi mở và chân thành."
    },
    "advice": "Bạn đã có đủ mọi công cụ trong tay; hãy hành động ngay và tập trung 100% ý chí."
  },
  "Major_02_High_Priestess": {
    "id": "Major_02_High_Priestess",
    "name_en": "The High Priestess",
    "name_vi": "Nữ Tư Tế",
    "arcana": "Major",
    "element": "Water",
    "number": 2,
    "file": "Major_02_High_Priestess.png",
    "keywords_up": "Trực giác, bí ẩn, tiềm thức, tĩnh lặng, tri thức nội tâm",
    "keywords_rev": "Bí mật bị giấu kín, phớt lờ trực giác, nghi ngờ bản thân",
    "meanings": {
      "general": "Lắng nghe tiếng nói bên trong; giữ im lặng quan sát là lựa chọn khôn ngoan nhất.",
      "career": "Nghiên cứu chuyên sâu, công việc bảo mật, chờ thời cơ thích hợp trước khi ký kết.",
      "love": "Tình cảm sâu sắc nhưng kín đáo, thấu hiểu không cần lời nói; mối quan hệ thầm kín."
    },
    "advice": "Hãy tĩnh tâm và tin vào giác quan thứ sáu; câu trả lời đã nằm sẵn trong tiềm thức bạn."
  },
  "Major_03_Empress": {
    "id": "Major_03_Empress",
    "name_en": "The Empress",
    "name_vi": "Nữ Hoàng",
    "arcana": "Major",
    "element": "Earth",
    "number": 3,
    "file": "Major_03_Empress.png",
    "keywords_up": "Sinh sôi, trù phú, nuôi dưỡng, tình mẫu tử, vẻ đẹp, nghệ thuật",
    "keywords_rev": "Kiệt quệ sáng tạo, bảo bọc thái quá, phụ thuộc cảm xúc",
    "meanings": {
      "general": "Thời kỳ đơm hoa kết trái, sự dồi dào về cả vật chất lẫn tinh thần.",
      "career": "Dự án phát triển mạnh mẽ, ý tưởng sáng tạo dồi dào, sinh lời tốt.",
      "love": "Tình yêu nồng nàn, chăm sóc chu đáo, khả năng kết hôn hoặc có tin vui con cái."
    },
    "advice": "Hãy kết nối với thiên nhiên, chăm sóc bản thân và kiên nhẫn nuôi dưỡng dự án của mình."
  },
  "Major_04_Emperor": {
    "id": "Major_04_Emperor",
    "name_en": "The Emperor",
    "name_vi": "Hoàng Đế",
    "arcana": "Major",
    "element": "Fire",
    "number": 4,
    "file": "Major_04_Emperor.png",
    "keywords_up": "Quyền lực, cấu trúc, kỷ luật, trật tự, lãnh đạo, bảo vệ vững chắc",
    "keywords_rev": "Độc đoán, kiểm soát ngột ngạt, lạm quyền, thiếu kỷ luật",
    "meanings": {
      "general": "Thiết lập trật tự, tính kỷ luật cao và ranh giới rõ ràng để kiểm soát hoàn cảnh.",
      "career": "Vị trí lãnh đạo, xây dựng quy trình bài bản, pháp lý rõ ràng, vị thế vững chắc.",
      "love": "Mối quan hệ nghiêm túc, cam kết lâu dài, chỗ dựa vững vàng nhưng cần tránh áp đặt."
    },
    "advice": "Hãy làm việc có kế hoạch bài bản và kỷ luật thép thay vì cảm tính nhất thời."
  },
  "Major_05_Hierophant": {
    "id": "Major_05_Hierophant",
    "name_en": "The Hierophant",
    "name_vi": "Đại Giáo Hoàng",
    "arcana": "Major",
    "element": "Earth",
    "number": 5,
    "file": "Major_05_Hierophant.png",
    "keywords_up": "Truyền thống, đạo lý, giáo dục, người thầy, niềm tin tâm linh, tổ chức",
    "keywords_rev": "Giáo điều bảo thủ, xung đột hệ giá trị, nổi loạn mù quáng",
    "meanings": {
      "general": "Tìm kiếm sự chỉ dẫn từ chuyên gia/tiền bối hoặc đi theo quy chuẩn truyền thống.",
      "career": "Làm việc trong tổ chức lớn, tuân thủ nội quy, học thêm chứng chỉ, tìm được mentor giỏi.",
      "love": "Tình cảm truyền thống, hướng tới hôn nhân gia đình được dòng họ ủng hộ."
    },
    "advice": "Hãy tôn trọng luật lệ, học hỏi từ người đi trước và giữ vững chuẩn mực đạo đức."
  },
  "Major_06_Lovers": {
    "id": "Major_06_Lovers",
    "name_en": "The Lovers",
    "name_vi": "Đôi Tình Nhân",
    "arcana": "Major",
    "element": "Air",
    "number": 6,
    "file": "Major_06_Lovers.png",
    "keywords_up": "Tình yêu đích thực, hòa hợp, lựa chọn giá trị sống, gắn kết linh hồn",
    "keywords_rev": "Bất đồng giá trị, lựa chọn sai lầm, xung đột nội tâm, rạn nứt niềm tin",
    "meanings": {
      "general": "Sự hòa hợp trọn vẹn và một lựa chọn quan trọng dựa trên hệ giá trị cốt lõi.",
      "career": "Hợp tác kinh doanh đôi bên cùng có lợi, tìm được đối tác ăn ý cùng tầm nhìn.",
      "love": "Tình yêu sâu đậm, thấu hiểu, gắn bó bền chặt và đồng điệu tâm hồn."
    },
    "advice": "Hãy đưa ra quyết định dựa trên tiếng gọi của tình yêu và sự trung thực với chính mình."
  },
  "Major_07_Chariot": {
    "id": "Major_07_Chariot",
    "name_en": "The Chariot",
    "name_vi": "Cỗ Xe Chiến Thắng",
    "arcana": "Major",
    "element": "Water",
    "number": 7,
    "file": "Major_07_Chariot.png",
    "keywords_up": "Ý chí kiên định, chiến thắng, vượt chướng ngại, định hướng, kiểm soát",
    "keywords_rev": "Mất kiểm soát, hung hăng, mất phương hướng, kiệt sức",
    "meanings": {
      "general": "Dùng sức mạnh ý chí kiên định để chế ngự mọi xung đột và tiến thẳng về đích.",
      "career": "Thăng tiến vượt bậc, hoàn thành dự án khó khăn, đi công tác xa thành công.",
      "love": "Cùng nhau vượt qua thử thách bên ngoài để bảo vệ tình yêu; kiềm chế cái tôi cá nhân."
    },
    "advice": "Hãy tập trung 100% vào mục tiêu phía trước, làm chủ cảm xúc và kiên quyết không lùi bước."
  },
  "Major_08_Strength": {
    "id": "Major_08_Strength",
    "name_en": "Strength",
    "name_vi": "Sức Mạnh",
    "arcana": "Major",
    "element": "Fire",
    "number": 8,
    "file": "Major_08_Strength.png",
    "keywords_up": "Lòng dũng cảm, kiên nhẫn, nhu thắng cương, từ bi, kiểm soát bản năng",
    "keywords_rev": "Nghi ngờ bản thân, yếu đuối, tức giận mất kiểm soát, tự ti",
    "meanings": {
      "general": "Sức mạnh thực sự nằm ở lòng nhân ái, sự mềm mỏng và khả năng thuần hóa cơn giận.",
      "career": "Xử lý khủng hoảng bằng sự điềm đạm, ngoại giao khéo léo, kiên trì theo đuổi mục tiêu.",
      "love": "Sự thấu hiểu dịu dàng hóa giải cái tôi đối phương, tình cảm bao dung bền bỉ."
    },
    "advice": "Hãy dùng sự mềm mỏng, kiên nhẫn và lòng trắc ẩn để vượt qua nghịch cảnh thay vì đối đầu thô bạo."
  },
  "Major_09_Hermit": {
    "id": "Major_09_Hermit",
    "name_en": "The Hermit",
    "name_vi": "Ẩn Sĩ",
    "arcana": "Major",
    "element": "Earth",
    "number": 9,
    "file": "Major_09_Hermit.png",
    "keywords_up": "Tự vấn nội tâm, tìm kiếm chân lý, đơn độc, soi sáng, chiêm nghiệm",
    "keywords_rev": "Cô lập tiêu cực, trốn tránh thực tế, từ chối lời khuyên đúng đắn",
    "meanings": {
      "general": "Rút lui khỏi sự ồn ào bên ngoài để tự soi rọi nội tâm và tìm câu trả lời cho chính mình.",
      "career": "Nghiên cứu độc lập, chuyên gia tư vấn, tự đánh giá lại định hướng sự nghiệp.",
      "love": "Cần không gian riêng để suy nghĩ; giai đoạn độc thân có giá trị để hoàn thiện bản thân."
    },
    "advice": "Hãy dành thời gian tĩnh lặng một mình; ngọn đèn trí tuệ bên trong bạn sẽ soi sáng lối đi."
  },
  "Major_10_Wheel_of_Fortune": {
    "id": "Major_10_Wheel_of_Fortune",
    "name_en": "Wheel of Fortune",
    "name_vi": "Bánh Xe Số Phận",
    "arcana": "Major",
    "element": "Fire",
    "number": 10,
    "file": "Major_10_Wheel_of_Fortune.png",
    "keywords_up": "Vận may, bước ngoặt, chu kỳ cuộc sống, nhân duyên, thay đổi tất yếu",
    "keywords_rev": "Vận xui tạm thời, kháng cự thay đổi, chu kỳ lặp lại bế tắc",
    "meanings": {
      "general": "Bánh xe cuộc đời xoay chuyển; khó khăn sắp qua nhường chỗ cho vận may và cơ hội mới.",
      "career": "Cơ hội bất ngờ, đổi vận trong kinh doanh, trúng thầu hoặc gặp quý nhân phù trợ.",
      "love": "Gặp gỡ định mệnh, mối duyên tiền định, bước ngoặt lớn làm thay đổi tình trạng quan hệ."
    },
    "advice": "Hãy thích nghi với dòng chảy thay đổi; điều duy nhất bất biến chính là sự đổi thay."
  },
  "Major_11_Justice": {
    "id": "Major_11_Justice",
    "name_en": "Justice",
    "name_vi": "Công Lý",
    "arcana": "Major",
    "element": "Air",
    "number": 11,
    "file": "Major_11_Justice.png",
    "keywords_up": "Công bằng, sự thật, luật nhân quả, minh bạch, quyết định lý trí",
    "keywords_rev": "Bất công, dối trá, thiên vị, trốn tránh trách nhiệm, kiện tụng bất lợi",
    "meanings": {
      "general": "Mọi sự thật sẽ được phơi bày rõ ràng; quyết định phải dựa trên đạo lý và sự công tâm.",
      "career": "Ký kết hợp đồng, giải quyết tranh chấp pháp lý minh bạch, đánh giá công bằng.",
      "love": "Cần sự thẳng thắn, công bằng giữa cho và nhận, rõ ràng trong các cam kết."
    },
    "advice": "Hãy trung thực tuyệt đối; cân nhắc mọi quyết định bằng cái đầu lạnh và lương tâm trong sạch."
  },
  "Major_12_Hanged_Man": {
    "id": "Major_12_Hanged_Man",
    "name_en": "The Hanged Man",
    "name_vi": "Người Treo Ngược",
    "arcana": "Major",
    "element": "Water",
    "number": 12,
    "file": "Major_12_Hanged_Man.png",
    "keywords_up": "Hy sinh tạm thời, góc nhìn mới, buông bỏ kiểm soát, chấp nhận dừng lại",
    "keywords_rev": "Trì trệ vô ích, ngoan cố, hy sinh mù quáng vô nghĩa, kháng cự thực tế",
    "meanings": {
      "general": "Dừng mọi hành động lại để nhìn thế giới theo góc nhìn đảo ngược; buông bỏ để giác ngộ.",
      "career": "Dự án tạm ngưng, thời điểm tái cơ cấu, không nên thúc ép tiến độ.",
      "love": "Chấp nhận nhường nhịn để giữ hòa khí, hoặc lùi lại để nhìn nhận rõ cảm xúc thật."
    },
    "advice": "Hãy thả lỏng và ngừng vùng vẫy; khi bạn đổi góc nhìn, cục diện bế tắc sẽ tự có lối thoát."
  },
  "Major_13_Death": {
    "id": "Major_13_Death",
    "name_en": "Death",
    "name_vi": "Cái Chết / Tái Sinh",
    "arcana": "Major",
    "element": "Water",
    "number": 13,
    "file": "Major_13_Death.png",
    "keywords_up": "Kết thúc chu kỳ cũ, tái sinh, chuyển hóa sâu sắc, buông bỏ dĩ vãng",
    "keywords_rev": "Sợ hãi thay đổi, níu kéo quá khứ mục nát, trì hoãn điều tất yếu",
    "meanings": {
      "general": "Kết thúc dứt khoát một giai đoạn cũ để mở đường cho bình minh mới tái sinh rực rỡ.",
      "career": "Rời bỏ công việc cũ, chấm dứt dự án kém hiệu quả, bước sang trang mới sự nghiệp.",
      "love": "Chấm dứt mối quan hệ không còn phù hợp, hoặc cùng nhau rũ bỏ cách ứng xử cũ để làm lại."
    },
    "advice": "Đừng sợ hãi kết thúc; lá vàng phải rụng thì mầm non mới có thể đâm chồi."
  },
  "Major_14_Temperance": {
    "id": "Major_14_Temperance",
    "name_en": "Temperance",
    "name_vi": "Tiết Độ / Cân Bằng",
    "arcana": "Major",
    "element": "Fire",
    "number": 14,
    "file": "Major_14_Temperance.png",
    "keywords_up": "Điều hòa, kiên nhẫn, chữa lành, dung hòa đối lập, chừng mực, an yên",
    "keywords_rev": "Mất cân bằng, thái quá, xung đột, thiếu kiên nhẫn, cực đoan",
    "meanings": {
      "general": "Phối hợp hài hòa, kiên nhẫn tìm điểm cân bằng vàng giữa các luồng năng lượng trái ngược.",
      "career": "Dung hòa các phe phái trong tập thể, tiến độ ổn định, đàm phán êm đẹp.",
      "love": "Mối quan hệ êm đềm, tôn trọng sự khác biệt của nhau, cùng chữa lành vết thương lòng."
    },
    "advice": "Hãy giữ thái độ điềm đạm, dung hòa mọi mâu thuẫn bằng sự kiên nhẫn và chừng mực."
  },
  "Major_15_Devil": {
    "id": "Major_15_Devil",
    "name_en": "The Devil",
    "name_vi": "Ác Quỷ",
    "arcana": "Major",
    "element": "Earth",
    "number": 15,
    "file": "Major_15_Devil.png",
    "keywords_up": "Cám dỗ, ràng buộc, thói quen độc hại, vật chất hóa, ảo tưởng giam cầm",
    "keywords_rev": "Thức tỉnh, bẻ gãy xiềng xích, thoát khỏi thao túng, giải phóng tự do",
    "meanings": {
      "general": "Vạch trần những ham muốn mù quáng, sự phụ thuộc vào thói quen xấu do chính mình tự giam mình.",
      "career": "Môi trường công sở độc hại, bẫy tài chính, hợp đồng trói buộc ngặt nghèo, tham lam ngắn hạn.",
      "love": "Tình yêu độc hại, ghen tuông mù quáng, ám ảnh dục vọng, mối quan hệ thao túng tâm lý."
    },
    "advice": "Hãy nhìn thẳng vào phần bóng tối của bạn; sợi xích đó do bạn tự đeo, bạn hoàn toàn có thể tự tháo."
  },
  "Major_16_Tower": {
    "id": "Major_16_Tower",
    "name_en": "The Tower",
    "name_vi": "Tòa Tháp Sụp Đổ",
    "arcana": "Major",
    "element": "Fire",
    "number": 16,
    "file": "Major_16_Tower.png",
    "keywords_up": "Biến cố bất ngờ, sụp đổ ảo tưởng, giải phóng chấn động, tái lập nền móng",
    "keywords_rev": "Tránh được thảm họa trong gang tấc, trì hoãn đổ vỡ tất yếu",
    "meanings": {
      "general": "Sự kiện đột ngột phá hủy những nền tảng dối trá, ảo tưởng để bạn nhìn thẳng vào sự thật trần trụi.",
      "career": "Phá sản dự án yếu kém, mất việc đột ngột, khủng hoảng truyền thông vạch trần sai phạm.",
      "love": "Chia tay bất ngờ vì lộ sự thật, tranh cãi dữ dội phá vỡ vỏ bọc hòa bình giả tạo."
    },
    "advice": "Đừng cố cứu vãn nền móng mục rỗng; hãy để thứ sai trái sụp đổ để xây lại từ đầu bằng sự thật."
  },
  "Major_17_Star": {
    "id": "Major_17_Star",
    "name_en": "The Star",
    "name_vi": "Ngôi Sao Hy Vọng",
    "arcana": "Major",
    "element": "Air",
    "number": 17,
    "file": "Major_17_Star.png",
    "keywords_up": "Hy vọng, niềm tin, cảm hứng, chữa lành, bình an, tương lai tươi sáng",
    "keywords_rev": "Tuyệt vọng, mất niềm tin, bi quan, thiếu cảm hứng, nghi ngờ tương lai",
    "meanings": {
      "general": "Nguồn ánh sáng xoa dịu tâm hồn; hy vọng hồi sinh, bình an trở lại, vũ trụ đang chúc phúc cho bạn.",
      "career": "Triển vọng nghề nghiệp rộng mở, tìm lại cảm hứng sáng tạo, danh tiếng lan tỏa.",
      "love": "Tình yêu lý tưởng, tâm hồn kết nối trong sáng, chữa lành hoàn toàn vết thương quá khứ."
    },
    "advice": "Hãy giữ vững niềm tin và hy vọng; bóng đêm đã qua, ánh sáng may mắn đang dẫn đường."
  },
  "Major_18_Moon": {
    "id": "Major_18_Moon",
    "name_en": "The Moon",
    "name_vi": "Mặt Trăng",
    "arcana": "Major",
    "element": "Water",
    "number": 18,
    "file": "Major_18_Moon.png",
    "keywords_up": "Ảo ảnh, sợ hãi vô thức, mơ hồ, bất an, lừa dối, trực giác huyền bí",
    "keywords_rev": "Sự thật sáng tỏ, xua tan sương mù, vượt qua nỗi sợ, giải tỏa âu lo",
    "meanings": {
      "general": "Những nỗi sợ vô hình từ tiềm thức trỗi dậy; cẩn thận kẻo bị lừa dối hoặc tự huyễn hoặc chính mình.",
      "career": "Thông tin mập mờ, thiếu minh bạch, đối thủ ngấm ngầm cạnh tranh, cẩn trọng khi ký giấy tờ.",
      "love": "Bất an, nghi ngờ đối phương lừa dối, cảm xúc trập trùng bất ổn, nhiều điều giấu kín."
    },
    "advice": "Đừng vội tin vào những gì mắt thấy tai nghe lúc này; hãy chờ cho ánh sáng ban ngày soi rõ sự thật."
  },
  "Major_19_Sun": {
    "id": "Major_19_Sun",
    "name_en": "The Sun",
    "name_vi": "Mặt Trời",
    "arcana": "Major",
    "element": "Fire",
    "number": 19,
    "file": "Major_19_Sun.png",
    "keywords_up": "Hạnh phúc tột cùng, thành công rực rỡ, năng lượng tích cực, sự thật rõ ràng",
    "keywords_rev": "Niềm vui bị trì hoãn, quá lạc quan thiếu thực tế, kiêu ngạo",
    "meanings": {
      "general": "Lá bài may mắn nhất; thành công vang dội, niềm vui thuần khiết, mọi sự hanh thông viên mãn.",
      "career": "Đạt thành tựu lớn, khen thưởng, thăng chức, dự án đại thắng, danh tiếng vang xa.",
      "love": "Tình yêu ấm áp, hạnh phúc viên mãn, đám cưới như mơ, sự gắn kết ngập tràn tiếng cười."
    },
    "advice": "Hãy mỉm cười và tỏa sáng hết mình; bạn xứng đáng đón nhận niềm vui trọn vẹn này."
  },
  "Major_20_Judgement": {
    "id": "Major_20_Judgement",
    "name_en": "Judgement",
    "name_vi": "Phán Xét / Thức Tỉnh",
    "arcana": "Major",
    "element": "Fire",
    "number": 20,
    "file": "Major_20_Judgement.png",
    "keywords_up": "Thức tỉnh tâm thức, tiếng gọi sứ mệnh, tha thứ, phán quyết cuối cùng, tái sinh",
    "keywords_rev": "Tự phán xét bản thân cay nghiệt, trốn tránh tiếng gọi con tim, hối tiếc",
    "meanings": {
      "general": "Nhìn nhận lại toàn bộ cuộc đời, tha thứ cho lỗi lầm cũ và bước lên tầm nhận thức mới.",
      "career": "Đánh giá quan trọng, nhận định đúng năng lực, tìm thấy công việc đúng đam mê thật sự.",
      "love": "Quyết định dứt khoát về tương lai mối quan hệ, tha thứ cho nhau để làm lại hoặc chia tay êm đẹp."
    },
    "advice": "Hãy lắng nghe tiếng gọi từ sâu thẳm tâm can; đây là cơ hội làm lại cuộc đời một cách quang minh chính đại."
  },
  "Major_21_World": {
    "id": "Major_21_World",
    "name_en": "The World",
    "name_vi": "Thế Giới / Viên Mãn",
    "arcana": "Major",
    "element": "Earth",
    "number": 21,
    "file": "Major_21_World.png",
    "keywords_up": "Hoàn thành trọn vẹn, viên mãn, thành tựu lớn, kết thúc chu kỳ thành công",
    "keywords_rev": "Thiếu bước cuối cùng để về đích, việc dở dang, trì hoãn kết thúc",
    "meanings": {
      "general": "Khép lại một chặng đường dài trong vinh quang; đạt tới đỉnh cao của sự hòa hợp và trọn vẹn.",
      "career": "Hoàn thành xuất sắc dự án lớn, vươn tầm quốc tế, mở rộng kinh doanh toàn cầu, thành quả rực rỡ.",
      "love": "Cái kết viên mãn cho tình yêu (kết hôn), cùng đi du lịch vòng quanh thế giới, thấu hiểu trọn vẹn."
    },
    "advice": "Hãy tận hưởng thành quả của chu kỳ này và sẵn sàng cho một tầm cao mới."
  },
  "Cups_01_Ace": {
    "id": "Cups_01_Ace",
    "name_en": "Ace of Cups",
    "name_vi": "Át Cốc",
    "arcana": "Minor",
    "element": "Water",
    "number": 1,
    "file": "Cups_01_Ace.png",
    "keywords_up": "Khởi đầu mới, tiềm năng dồi dào trong tình cảm, trực giác, mối quan hệ",
    "keywords_rev": "Bỏ lỡ cơ hội, năng lượng tắc nghẽn trong tình cảm, trực giác, mối quan hệ",
    "meanings": {
      "general": "Biểu hiện của năng lượng Water (tình cảm, trực giác, mối quan hệ) ở cấp độ Ace.",
      "career": "Tác động thực tế đến công việc liên quan đến tình cảm, trực giác, mối quan hệ.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tình cảm, trực giác, mối quan hệ."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Water để giải quyết vấn đề."
  },
  "Cups_02_Two": {
    "id": "Cups_02_Two",
    "name_en": "Two of Cups",
    "name_vi": "Hai Cốc",
    "arcana": "Minor",
    "element": "Water",
    "number": 2,
    "file": "Cups_02_Two.png",
    "keywords_up": "Cân bằng, lựa chọn, đối tác trong tình cảm, trực giác, mối quan hệ",
    "keywords_rev": "Mất cân bằng, do dự, phân vân trong tình cảm, trực giác, mối quan hệ",
    "meanings": {
      "general": "Biểu hiện của năng lượng Water (tình cảm, trực giác, mối quan hệ) ở cấp độ Two.",
      "career": "Tác động thực tế đến công việc liên quan đến tình cảm, trực giác, mối quan hệ.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tình cảm, trực giác, mối quan hệ."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Water để giải quyết vấn đề."
  },
  "Cups_03_Three": {
    "id": "Cups_03_Three",
    "name_en": "Three of Cups",
    "name_vi": "Ba Cốc",
    "arcana": "Minor",
    "element": "Water",
    "number": 3,
    "file": "Cups_03_Three.png",
    "keywords_up": "Phát triển, hợp tác, kết quả bước đầu trong tình cảm, trực giác, mối quan hệ",
    "keywords_rev": "Trì trệ, bất đồng nội bộ trong tình cảm, trực giác, mối quan hệ",
    "meanings": {
      "general": "Biểu hiện của năng lượng Water (tình cảm, trực giác, mối quan hệ) ở cấp độ Three.",
      "career": "Tác động thực tế đến công việc liên quan đến tình cảm, trực giác, mối quan hệ.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tình cảm, trực giác, mối quan hệ."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Water để giải quyết vấn đề."
  },
  "Cups_04_Four": {
    "id": "Cups_04_Four",
    "name_en": "Four of Cups",
    "name_vi": "Bốn Cốc",
    "arcana": "Minor",
    "element": "Water",
    "number": 4,
    "file": "Cups_04_Four.png",
    "keywords_up": "Ổn định, củng cố, vùng an toàn trong tình cảm, trực giác, mối quan hệ",
    "keywords_rev": "Bảo thủ, ngột ngạt, buông thả trong tình cảm, trực giác, mối quan hệ",
    "meanings": {
      "general": "Biểu hiện của năng lượng Water (tình cảm, trực giác, mối quan hệ) ở cấp độ Four.",
      "career": "Tác động thực tế đến công việc liên quan đến tình cảm, trực giác, mối quan hệ.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tình cảm, trực giác, mối quan hệ."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Water để giải quyết vấn đề."
  },
  "Cups_05_Five": {
    "id": "Cups_05_Five",
    "name_en": "Five of Cups",
    "name_vi": "Năm Cốc",
    "arcana": "Minor",
    "element": "Water",
    "number": 5,
    "file": "Cups_05_Five.png",
    "keywords_up": "Thử thách, xung đột, mất mát tạm thời trong tình cảm, trực giác, mối quan hệ",
    "keywords_rev": "Hồi phục, tìm thấy giải pháp hòa giải trong tình cảm, trực giác, mối quan hệ",
    "meanings": {
      "general": "Biểu hiện của năng lượng Water (tình cảm, trực giác, mối quan hệ) ở cấp độ Five.",
      "career": "Tác động thực tế đến công việc liên quan đến tình cảm, trực giác, mối quan hệ.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tình cảm, trực giác, mối quan hệ."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Water để giải quyết vấn đề."
  },
  "Cups_06_Six": {
    "id": "Cups_06_Six",
    "name_en": "Six of Cups",
    "name_vi": "Sáu Cốc",
    "arcana": "Minor",
    "element": "Water",
    "number": 6,
    "file": "Cups_06_Six.png",
    "keywords_up": "Hài hòa, chia sẻ, vượt qua sóng gió trong tình cảm, trực giác, mối quan hệ",
    "keywords_rev": "Mắc kẹt, bất công, phụ thuộc trong tình cảm, trực giác, mối quan hệ",
    "meanings": {
      "general": "Biểu hiện của năng lượng Water (tình cảm, trực giác, mối quan hệ) ở cấp độ Six.",
      "career": "Tác động thực tế đến công việc liên quan đến tình cảm, trực giác, mối quan hệ.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tình cảm, trực giác, mối quan hệ."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Water để giải quyết vấn đề."
  },
  "Cups_07_Seven": {
    "id": "Cups_07_Seven",
    "name_en": "Seven of Cups",
    "name_vi": "Bảy Cốc",
    "arcana": "Minor",
    "element": "Water",
    "number": 7,
    "file": "Cups_07_Seven.png",
    "keywords_up": "Chiến lược, tự vấn, kiên nhẫn, đánh giá trong tình cảm, trực giác, mối quan hệ",
    "keywords_rev": "Nóng vội, mưu mẹo sai lầm, ảo tưởng trong tình cảm, trực giác, mối quan hệ",
    "meanings": {
      "general": "Biểu hiện của năng lượng Water (tình cảm, trực giác, mối quan hệ) ở cấp độ Seven.",
      "career": "Tác động thực tế đến công việc liên quan đến tình cảm, trực giác, mối quan hệ.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tình cảm, trực giác, mối quan hệ."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Water để giải quyết vấn đề."
  },
  "Cups_08_Eight": {
    "id": "Cups_08_Eight",
    "name_en": "Eight of Cups",
    "name_vi": "Tám Cốc",
    "arcana": "Minor",
    "element": "Water",
    "number": 8,
    "file": "Cups_08_Eight.png",
    "keywords_up": "Tăng tốc, rèn luyện kỹ năng, tiến triển nhanh trong tình cảm, trực giác, mối quan hệ",
    "keywords_rev": "Trì hoãn, kiệt sức, làm việc cẩu thả trong tình cảm, trực giác, mối quan hệ",
    "meanings": {
      "general": "Biểu hiện của năng lượng Water (tình cảm, trực giác, mối quan hệ) ở cấp độ Eight.",
      "career": "Tác động thực tế đến công việc liên quan đến tình cảm, trực giác, mối quan hệ.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tình cảm, trực giác, mối quan hệ."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Water để giải quyết vấn đề."
  },
  "Cups_09_Nine": {
    "id": "Cups_09_Nine",
    "name_en": "Nine of Cups",
    "name_vi": "Chín Cốc",
    "arcana": "Minor",
    "element": "Water",
    "number": 9,
    "file": "Cups_09_Nine.png",
    "keywords_up": "Gần về đích, kiên cường, thành tựu cá nhân trong tình cảm, trực giác, mối quan hệ",
    "keywords_rev": "Mệt mỏi, phòng thủ thái quá, buông xuôi trong tình cảm, trực giác, mối quan hệ",
    "meanings": {
      "general": "Biểu hiện của năng lượng Water (tình cảm, trực giác, mối quan hệ) ở cấp độ Nine.",
      "career": "Tác động thực tế đến công việc liên quan đến tình cảm, trực giác, mối quan hệ.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tình cảm, trực giác, mối quan hệ."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Water để giải quyết vấn đề."
  },
  "Cups_10_Ten": {
    "id": "Cups_10_Ten",
    "name_en": "Ten of Cups",
    "name_vi": "Mười Cốc",
    "arcana": "Minor",
    "element": "Water",
    "number": 10,
    "file": "Cups_10_Ten.png",
    "keywords_up": "Hoàn thành chu kỳ, trọn vẹn hoặc quá tải trong tình cảm, trực giác, mối quan hệ",
    "keywords_rev": "Gánh nặng được giải phóng, làm lại từ đầu trong tình cảm, trực giác, mối quan hệ",
    "meanings": {
      "general": "Biểu hiện của năng lượng Water (tình cảm, trực giác, mối quan hệ) ở cấp độ Ten.",
      "career": "Tác động thực tế đến công việc liên quan đến tình cảm, trực giác, mối quan hệ.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tình cảm, trực giác, mối quan hệ."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Water để giải quyết vấn đề."
  },
  "Cups_11_Page": {
    "id": "Cups_11_Page",
    "name_en": "Page of Cups",
    "name_vi": "Thị Vệ Cốc",
    "arcana": "Minor",
    "element": "Water",
    "number": 11,
    "file": "Cups_11_Page.png",
    "keywords_up": "Tin tức mới, học hỏi, nhiệt huyết trẻ trung trong tình cảm, trực giác, mối quan hệ",
    "keywords_rev": "Bốc đồng, tin đồn thất thiệt, thiếu kinh nghiệm trong tình cảm, trực giác, mối quan hệ",
    "meanings": {
      "general": "Biểu hiện của năng lượng Water (tình cảm, trực giác, mối quan hệ) ở cấp độ Page.",
      "career": "Tác động thực tế đến công việc liên quan đến tình cảm, trực giác, mối quan hệ.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tình cảm, trực giác, mối quan hệ."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Water để giải quyết vấn đề."
  },
  "Cups_12_Knight": {
    "id": "Cups_12_Knight",
    "name_en": "Knight of Cups",
    "name_vi": "Hiệp Sĩ Cốc",
    "arcana": "Minor",
    "element": "Water",
    "number": 12,
    "file": "Cups_12_Knight.png",
    "keywords_up": "Hành động quyết liệt, xông xáo, theo đuổi mục tiêu trong tình cảm, trực giác, mối quan hệ",
    "keywords_rev": "Hung hăng, nóng nảy, cả thèm chóng chán trong tình cảm, trực giác, mối quan hệ",
    "meanings": {
      "general": "Biểu hiện của năng lượng Water (tình cảm, trực giác, mối quan hệ) ở cấp độ Knight.",
      "career": "Tác động thực tế đến công việc liên quan đến tình cảm, trực giác, mối quan hệ.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tình cảm, trực giác, mối quan hệ."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Water để giải quyết vấn đề."
  },
  "Cups_13_Queen": {
    "id": "Cups_13_Queen",
    "name_en": "Queen of Cups",
    "name_vi": "Hoàng Hậu Cốc",
    "arcana": "Minor",
    "element": "Water",
    "number": 13,
    "file": "Cups_13_Queen.png",
    "keywords_up": "Nuôi dưỡng, trực giác, làm chủ thế giới nội tâm trong tình cảm, trực giác, mối quan hệ",
    "keywords_rev": "Thao túng cảm xúc, độc đoán, tự ti trong tình cảm, trực giác, mối quan hệ",
    "meanings": {
      "general": "Biểu hiện của năng lượng Water (tình cảm, trực giác, mối quan hệ) ở cấp độ Queen.",
      "career": "Tác động thực tế đến công việc liên quan đến tình cảm, trực giác, mối quan hệ.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tình cảm, trực giác, mối quan hệ."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Water để giải quyết vấn đề."
  },
  "Cups_14_King": {
    "id": "Cups_14_King",
    "name_en": "King of Cups",
    "name_vi": "Vua Cốc",
    "arcana": "Minor",
    "element": "Water",
    "number": 14,
    "file": "Cups_14_King.png",
    "keywords_up": "Làm chủ, lãnh đạo, quyền lực, đỉnh cao kiểm soát trong tình cảm, trực giác, mối quan hệ",
    "keywords_rev": "Độc tài, lạm quyền, tàn nhẫn, áp đặt trong tình cảm, trực giác, mối quan hệ",
    "meanings": {
      "general": "Biểu hiện của năng lượng Water (tình cảm, trực giác, mối quan hệ) ở cấp độ King.",
      "career": "Tác động thực tế đến công việc liên quan đến tình cảm, trực giác, mối quan hệ.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tình cảm, trực giác, mối quan hệ."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Water để giải quyết vấn đề."
  },
  "Pentacles_01_Ace": {
    "id": "Pentacles_01_Ace",
    "name_en": "Ace of Pentacles",
    "name_vi": "Át Tiền",
    "arcana": "Minor",
    "element": "Earth",
    "number": 1,
    "file": "Pentacles_01_Ace.png",
    "keywords_up": "Khởi đầu mới, tiềm năng dồi dào trong tài chính, sự nghiệp, vật chất thực tế",
    "keywords_rev": "Bỏ lỡ cơ hội, năng lượng tắc nghẽn trong tài chính, sự nghiệp, vật chất thực tế",
    "meanings": {
      "general": "Biểu hiện của năng lượng Earth (tài chính, sự nghiệp, vật chất thực tế) ở cấp độ Ace.",
      "career": "Tác động thực tế đến công việc liên quan đến tài chính, sự nghiệp, vật chất thực tế.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tài chính, sự nghiệp, vật chất thực tế."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Earth để giải quyết vấn đề."
  },
  "Pentacles_02_Two": {
    "id": "Pentacles_02_Two",
    "name_en": "Two of Pentacles",
    "name_vi": "Hai Tiền",
    "arcana": "Minor",
    "element": "Earth",
    "number": 2,
    "file": "Pentacles_02_Two.png",
    "keywords_up": "Cân bằng, lựa chọn, đối tác trong tài chính, sự nghiệp, vật chất thực tế",
    "keywords_rev": "Mất cân bằng, do dự, phân vân trong tài chính, sự nghiệp, vật chất thực tế",
    "meanings": {
      "general": "Biểu hiện của năng lượng Earth (tài chính, sự nghiệp, vật chất thực tế) ở cấp độ Two.",
      "career": "Tác động thực tế đến công việc liên quan đến tài chính, sự nghiệp, vật chất thực tế.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tài chính, sự nghiệp, vật chất thực tế."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Earth để giải quyết vấn đề."
  },
  "Pentacles_03_Three": {
    "id": "Pentacles_03_Three",
    "name_en": "Three of Pentacles",
    "name_vi": "Ba Tiền",
    "arcana": "Minor",
    "element": "Earth",
    "number": 3,
    "file": "Pentacles_03_Three.png",
    "keywords_up": "Phát triển, hợp tác, kết quả bước đầu trong tài chính, sự nghiệp, vật chất thực tế",
    "keywords_rev": "Trì trệ, bất đồng nội bộ trong tài chính, sự nghiệp, vật chất thực tế",
    "meanings": {
      "general": "Biểu hiện của năng lượng Earth (tài chính, sự nghiệp, vật chất thực tế) ở cấp độ Three.",
      "career": "Tác động thực tế đến công việc liên quan đến tài chính, sự nghiệp, vật chất thực tế.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tài chính, sự nghiệp, vật chất thực tế."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Earth để giải quyết vấn đề."
  },
  "Pentacles_04_Four": {
    "id": "Pentacles_04_Four",
    "name_en": "Four of Pentacles",
    "name_vi": "Bốn Tiền",
    "arcana": "Minor",
    "element": "Earth",
    "number": 4,
    "file": "Pentacles_04_Four.png",
    "keywords_up": "Ổn định, củng cố, vùng an toàn trong tài chính, sự nghiệp, vật chất thực tế",
    "keywords_rev": "Bảo thủ, ngột ngạt, buông thả trong tài chính, sự nghiệp, vật chất thực tế",
    "meanings": {
      "general": "Biểu hiện của năng lượng Earth (tài chính, sự nghiệp, vật chất thực tế) ở cấp độ Four.",
      "career": "Tác động thực tế đến công việc liên quan đến tài chính, sự nghiệp, vật chất thực tế.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tài chính, sự nghiệp, vật chất thực tế."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Earth để giải quyết vấn đề."
  },
  "Pentacles_05_Five": {
    "id": "Pentacles_05_Five",
    "name_en": "Five of Pentacles",
    "name_vi": "Năm Tiền",
    "arcana": "Minor",
    "element": "Earth",
    "number": 5,
    "file": "Pentacles_05_Five.png",
    "keywords_up": "Thử thách, xung đột, mất mát tạm thời trong tài chính, sự nghiệp, vật chất thực tế",
    "keywords_rev": "Hồi phục, tìm thấy giải pháp hòa giải trong tài chính, sự nghiệp, vật chất thực tế",
    "meanings": {
      "general": "Biểu hiện của năng lượng Earth (tài chính, sự nghiệp, vật chất thực tế) ở cấp độ Five.",
      "career": "Tác động thực tế đến công việc liên quan đến tài chính, sự nghiệp, vật chất thực tế.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tài chính, sự nghiệp, vật chất thực tế."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Earth để giải quyết vấn đề."
  },
  "Pentacles_06_Six": {
    "id": "Pentacles_06_Six",
    "name_en": "Six of Pentacles",
    "name_vi": "Sáu Tiền",
    "arcana": "Minor",
    "element": "Earth",
    "number": 6,
    "file": "Pentacles_06_Six.png",
    "keywords_up": "Hài hòa, chia sẻ, vượt qua sóng gió trong tài chính, sự nghiệp, vật chất thực tế",
    "keywords_rev": "Mắc kẹt, bất công, phụ thuộc trong tài chính, sự nghiệp, vật chất thực tế",
    "meanings": {
      "general": "Biểu hiện của năng lượng Earth (tài chính, sự nghiệp, vật chất thực tế) ở cấp độ Six.",
      "career": "Tác động thực tế đến công việc liên quan đến tài chính, sự nghiệp, vật chất thực tế.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tài chính, sự nghiệp, vật chất thực tế."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Earth để giải quyết vấn đề."
  },
  "Pentacles_07_Seven": {
    "id": "Pentacles_07_Seven",
    "name_en": "Seven of Pentacles",
    "name_vi": "Bảy Tiền",
    "arcana": "Minor",
    "element": "Earth",
    "number": 7,
    "file": "Pentacles_07_Seven.png",
    "keywords_up": "Chiến lược, tự vấn, kiên nhẫn, đánh giá trong tài chính, sự nghiệp, vật chất thực tế",
    "keywords_rev": "Nóng vội, mưu mẹo sai lầm, ảo tưởng trong tài chính, sự nghiệp, vật chất thực tế",
    "meanings": {
      "general": "Biểu hiện của năng lượng Earth (tài chính, sự nghiệp, vật chất thực tế) ở cấp độ Seven.",
      "career": "Tác động thực tế đến công việc liên quan đến tài chính, sự nghiệp, vật chất thực tế.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tài chính, sự nghiệp, vật chất thực tế."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Earth để giải quyết vấn đề."
  },
  "Pentacles_08_Eight": {
    "id": "Pentacles_08_Eight",
    "name_en": "Eight of Pentacles",
    "name_vi": "Tám Tiền",
    "arcana": "Minor",
    "element": "Earth",
    "number": 8,
    "file": "Pentacles_08_Eight.png",
    "keywords_up": "Tăng tốc, rèn luyện kỹ năng, tiến triển nhanh trong tài chính, sự nghiệp, vật chất thực tế",
    "keywords_rev": "Trì hoãn, kiệt sức, làm việc cẩu thả trong tài chính, sự nghiệp, vật chất thực tế",
    "meanings": {
      "general": "Biểu hiện của năng lượng Earth (tài chính, sự nghiệp, vật chất thực tế) ở cấp độ Eight.",
      "career": "Tác động thực tế đến công việc liên quan đến tài chính, sự nghiệp, vật chất thực tế.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tài chính, sự nghiệp, vật chất thực tế."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Earth để giải quyết vấn đề."
  },
  "Pentacles_09_Nine": {
    "id": "Pentacles_09_Nine",
    "name_en": "Nine of Pentacles",
    "name_vi": "Chín Tiền",
    "arcana": "Minor",
    "element": "Earth",
    "number": 9,
    "file": "Pentacles_09_Nine.png",
    "keywords_up": "Gần về đích, kiên cường, thành tựu cá nhân trong tài chính, sự nghiệp, vật chất thực tế",
    "keywords_rev": "Mệt mỏi, phòng thủ thái quá, buông xuôi trong tài chính, sự nghiệp, vật chất thực tế",
    "meanings": {
      "general": "Biểu hiện của năng lượng Earth (tài chính, sự nghiệp, vật chất thực tế) ở cấp độ Nine.",
      "career": "Tác động thực tế đến công việc liên quan đến tài chính, sự nghiệp, vật chất thực tế.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tài chính, sự nghiệp, vật chất thực tế."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Earth để giải quyết vấn đề."
  },
  "Pentacles_10_Ten": {
    "id": "Pentacles_10_Ten",
    "name_en": "Ten of Pentacles",
    "name_vi": "Mười Tiền",
    "arcana": "Minor",
    "element": "Earth",
    "number": 10,
    "file": "Pentacles_10_Ten.png",
    "keywords_up": "Hoàn thành chu kỳ, trọn vẹn hoặc quá tải trong tài chính, sự nghiệp, vật chất thực tế",
    "keywords_rev": "Gánh nặng được giải phóng, làm lại từ đầu trong tài chính, sự nghiệp, vật chất thực tế",
    "meanings": {
      "general": "Biểu hiện của năng lượng Earth (tài chính, sự nghiệp, vật chất thực tế) ở cấp độ Ten.",
      "career": "Tác động thực tế đến công việc liên quan đến tài chính, sự nghiệp, vật chất thực tế.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tài chính, sự nghiệp, vật chất thực tế."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Earth để giải quyết vấn đề."
  },
  "Pentacles_11_Page": {
    "id": "Pentacles_11_Page",
    "name_en": "Page of Pentacles",
    "name_vi": "Thị Vệ Tiền",
    "arcana": "Minor",
    "element": "Earth",
    "number": 11,
    "file": "Pentacles_11_Page.png",
    "keywords_up": "Tin tức mới, học hỏi, nhiệt huyết trẻ trung trong tài chính, sự nghiệp, vật chất thực tế",
    "keywords_rev": "Bốc đồng, tin đồn thất thiệt, thiếu kinh nghiệm trong tài chính, sự nghiệp, vật chất thực tế",
    "meanings": {
      "general": "Biểu hiện của năng lượng Earth (tài chính, sự nghiệp, vật chất thực tế) ở cấp độ Page.",
      "career": "Tác động thực tế đến công việc liên quan đến tài chính, sự nghiệp, vật chất thực tế.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tài chính, sự nghiệp, vật chất thực tế."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Earth để giải quyết vấn đề."
  },
  "Pentacles_12_Knight": {
    "id": "Pentacles_12_Knight",
    "name_en": "Knight of Pentacles",
    "name_vi": "Hiệp Sĩ Tiền",
    "arcana": "Minor",
    "element": "Earth",
    "number": 12,
    "file": "Pentacles_12_Knight.png",
    "keywords_up": "Hành động quyết liệt, xông xáo, theo đuổi mục tiêu trong tài chính, sự nghiệp, vật chất thực tế",
    "keywords_rev": "Hung hăng, nóng nảy, cả thèm chóng chán trong tài chính, sự nghiệp, vật chất thực tế",
    "meanings": {
      "general": "Biểu hiện của năng lượng Earth (tài chính, sự nghiệp, vật chất thực tế) ở cấp độ Knight.",
      "career": "Tác động thực tế đến công việc liên quan đến tài chính, sự nghiệp, vật chất thực tế.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tài chính, sự nghiệp, vật chất thực tế."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Earth để giải quyết vấn đề."
  },
  "Pentacles_13_Queen": {
    "id": "Pentacles_13_Queen",
    "name_en": "Queen of Pentacles",
    "name_vi": "Hoàng Hậu Tiền",
    "arcana": "Minor",
    "element": "Earth",
    "number": 13,
    "file": "Pentacles_13_Queen.png",
    "keywords_up": "Nuôi dưỡng, trực giác, làm chủ thế giới nội tâm trong tài chính, sự nghiệp, vật chất thực tế",
    "keywords_rev": "Thao túng cảm xúc, độc đoán, tự ti trong tài chính, sự nghiệp, vật chất thực tế",
    "meanings": {
      "general": "Biểu hiện của năng lượng Earth (tài chính, sự nghiệp, vật chất thực tế) ở cấp độ Queen.",
      "career": "Tác động thực tế đến công việc liên quan đến tài chính, sự nghiệp, vật chất thực tế.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tài chính, sự nghiệp, vật chất thực tế."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Earth để giải quyết vấn đề."
  },
  "Pentacles_14_King": {
    "id": "Pentacles_14_King",
    "name_en": "King of Pentacles",
    "name_vi": "Vua Tiền",
    "arcana": "Minor",
    "element": "Earth",
    "number": 14,
    "file": "Pentacles_14_King.png",
    "keywords_up": "Làm chủ, lãnh đạo, quyền lực, đỉnh cao kiểm soát trong tài chính, sự nghiệp, vật chất thực tế",
    "keywords_rev": "Độc tài, lạm quyền, tàn nhẫn, áp đặt trong tài chính, sự nghiệp, vật chất thực tế",
    "meanings": {
      "general": "Biểu hiện của năng lượng Earth (tài chính, sự nghiệp, vật chất thực tế) ở cấp độ King.",
      "career": "Tác động thực tế đến công việc liên quan đến tài chính, sự nghiệp, vật chất thực tế.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến tài chính, sự nghiệp, vật chất thực tế."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Earth để giải quyết vấn đề."
  },
  "Swords_01_Ace": {
    "id": "Swords_01_Ace",
    "name_en": "Ace of Swords",
    "name_vi": "Át Kiếm",
    "arcana": "Minor",
    "element": "Air",
    "number": 1,
    "file": "Swords_01_Ace.png",
    "keywords_up": "Khởi đầu mới, tiềm năng dồi dào trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "keywords_rev": "Bỏ lỡ cơ hội, năng lượng tắc nghẽn trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "meanings": {
      "general": "Biểu hiện của năng lượng Air (lý trí, trí tuệ, sự thật, thử thách tư duy) ở cấp độ Ace.",
      "career": "Tác động thực tế đến công việc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Air để giải quyết vấn đề."
  },
  "Swords_02_Two": {
    "id": "Swords_02_Two",
    "name_en": "Two of Swords",
    "name_vi": "Hai Kiếm",
    "arcana": "Minor",
    "element": "Air",
    "number": 2,
    "file": "Swords_02_Two.png",
    "keywords_up": "Cân bằng, lựa chọn, đối tác trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "keywords_rev": "Mất cân bằng, do dự, phân vân trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "meanings": {
      "general": "Biểu hiện của năng lượng Air (lý trí, trí tuệ, sự thật, thử thách tư duy) ở cấp độ Two.",
      "career": "Tác động thực tế đến công việc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Air để giải quyết vấn đề."
  },
  "Swords_03_Three": {
    "id": "Swords_03_Three",
    "name_en": "Three of Swords",
    "name_vi": "Ba Kiếm",
    "arcana": "Minor",
    "element": "Air",
    "number": 3,
    "file": "Swords_03_Three.png",
    "keywords_up": "Phát triển, hợp tác, kết quả bước đầu trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "keywords_rev": "Trì trệ, bất đồng nội bộ trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "meanings": {
      "general": "Biểu hiện của năng lượng Air (lý trí, trí tuệ, sự thật, thử thách tư duy) ở cấp độ Three.",
      "career": "Tác động thực tế đến công việc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Air để giải quyết vấn đề."
  },
  "Swords_04_Four": {
    "id": "Swords_04_Four",
    "name_en": "Four of Swords",
    "name_vi": "Bốn Kiếm",
    "arcana": "Minor",
    "element": "Air",
    "number": 4,
    "file": "Swords_04_Four.png",
    "keywords_up": "Ổn định, củng cố, vùng an toàn trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "keywords_rev": "Bảo thủ, ngột ngạt, buông thả trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "meanings": {
      "general": "Biểu hiện của năng lượng Air (lý trí, trí tuệ, sự thật, thử thách tư duy) ở cấp độ Four.",
      "career": "Tác động thực tế đến công việc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Air để giải quyết vấn đề."
  },
  "Swords_05_Five": {
    "id": "Swords_05_Five",
    "name_en": "Five of Swords",
    "name_vi": "Năm Kiếm",
    "arcana": "Minor",
    "element": "Air",
    "number": 5,
    "file": "Swords_05_Five.png",
    "keywords_up": "Thử thách, xung đột, mất mát tạm thời trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "keywords_rev": "Hồi phục, tìm thấy giải pháp hòa giải trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "meanings": {
      "general": "Biểu hiện của năng lượng Air (lý trí, trí tuệ, sự thật, thử thách tư duy) ở cấp độ Five.",
      "career": "Tác động thực tế đến công việc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Air để giải quyết vấn đề."
  },
  "Swords_06_Six": {
    "id": "Swords_06_Six",
    "name_en": "Six of Swords",
    "name_vi": "Sáu Kiếm",
    "arcana": "Minor",
    "element": "Air",
    "number": 6,
    "file": "Swords_06_Six.png",
    "keywords_up": "Hài hòa, chia sẻ, vượt qua sóng gió trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "keywords_rev": "Mắc kẹt, bất công, phụ thuộc trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "meanings": {
      "general": "Biểu hiện của năng lượng Air (lý trí, trí tuệ, sự thật, thử thách tư duy) ở cấp độ Six.",
      "career": "Tác động thực tế đến công việc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Air để giải quyết vấn đề."
  },
  "Swords_07_Seven": {
    "id": "Swords_07_Seven",
    "name_en": "Seven of Swords",
    "name_vi": "Bảy Kiếm",
    "arcana": "Minor",
    "element": "Air",
    "number": 7,
    "file": "Swords_07_Seven.png",
    "keywords_up": "Chiến lược, tự vấn, kiên nhẫn, đánh giá trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "keywords_rev": "Nóng vội, mưu mẹo sai lầm, ảo tưởng trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "meanings": {
      "general": "Biểu hiện của năng lượng Air (lý trí, trí tuệ, sự thật, thử thách tư duy) ở cấp độ Seven.",
      "career": "Tác động thực tế đến công việc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Air để giải quyết vấn đề."
  },
  "Swords_08_Eight": {
    "id": "Swords_08_Eight",
    "name_en": "Eight of Swords",
    "name_vi": "Tám Kiếm",
    "arcana": "Minor",
    "element": "Air",
    "number": 8,
    "file": "Swords_08_Eight.png",
    "keywords_up": "Tăng tốc, rèn luyện kỹ năng, tiến triển nhanh trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "keywords_rev": "Trì hoãn, kiệt sức, làm việc cẩu thả trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "meanings": {
      "general": "Biểu hiện của năng lượng Air (lý trí, trí tuệ, sự thật, thử thách tư duy) ở cấp độ Eight.",
      "career": "Tác động thực tế đến công việc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Air để giải quyết vấn đề."
  },
  "Swords_09_Nine": {
    "id": "Swords_09_Nine",
    "name_en": "Nine of Swords",
    "name_vi": "Chín Kiếm",
    "arcana": "Minor",
    "element": "Air",
    "number": 9,
    "file": "Swords_09_Nine.png",
    "keywords_up": "Gần về đích, kiên cường, thành tựu cá nhân trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "keywords_rev": "Mệt mỏi, phòng thủ thái quá, buông xuôi trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "meanings": {
      "general": "Biểu hiện của năng lượng Air (lý trí, trí tuệ, sự thật, thử thách tư duy) ở cấp độ Nine.",
      "career": "Tác động thực tế đến công việc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Air để giải quyết vấn đề."
  },
  "Swords_10_Ten": {
    "id": "Swords_10_Ten",
    "name_en": "Ten of Swords",
    "name_vi": "Mười Kiếm",
    "arcana": "Minor",
    "element": "Air",
    "number": 10,
    "file": "Swords_10_Ten.png",
    "keywords_up": "Hoàn thành chu kỳ, trọn vẹn hoặc quá tải trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "keywords_rev": "Gánh nặng được giải phóng, làm lại từ đầu trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "meanings": {
      "general": "Biểu hiện của năng lượng Air (lý trí, trí tuệ, sự thật, thử thách tư duy) ở cấp độ Ten.",
      "career": "Tác động thực tế đến công việc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Air để giải quyết vấn đề."
  },
  "Swords_11_Page": {
    "id": "Swords_11_Page",
    "name_en": "Page of Swords",
    "name_vi": "Thị Vệ Kiếm",
    "arcana": "Minor",
    "element": "Air",
    "number": 11,
    "file": "Swords_11_Page.png",
    "keywords_up": "Tin tức mới, học hỏi, nhiệt huyết trẻ trung trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "keywords_rev": "Bốc đồng, tin đồn thất thiệt, thiếu kinh nghiệm trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "meanings": {
      "general": "Biểu hiện của năng lượng Air (lý trí, trí tuệ, sự thật, thử thách tư duy) ở cấp độ Page.",
      "career": "Tác động thực tế đến công việc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Air để giải quyết vấn đề."
  },
  "Swords_12_Knight": {
    "id": "Swords_12_Knight",
    "name_en": "Knight of Swords",
    "name_vi": "Hiệp Sĩ Kiếm",
    "arcana": "Minor",
    "element": "Air",
    "number": 12,
    "file": "Swords_12_Knight.png",
    "keywords_up": "Hành động quyết liệt, xông xáo, theo đuổi mục tiêu trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "keywords_rev": "Hung hăng, nóng nảy, cả thèm chóng chán trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "meanings": {
      "general": "Biểu hiện của năng lượng Air (lý trí, trí tuệ, sự thật, thử thách tư duy) ở cấp độ Knight.",
      "career": "Tác động thực tế đến công việc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Air để giải quyết vấn đề."
  },
  "Swords_13_Queen": {
    "id": "Swords_13_Queen",
    "name_en": "Queen of Swords",
    "name_vi": "Hoàng Hậu Kiếm",
    "arcana": "Minor",
    "element": "Air",
    "number": 13,
    "file": "Swords_13_Queen.png",
    "keywords_up": "Nuôi dưỡng, trực giác, làm chủ thế giới nội tâm trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "keywords_rev": "Thao túng cảm xúc, độc đoán, tự ti trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "meanings": {
      "general": "Biểu hiện của năng lượng Air (lý trí, trí tuệ, sự thật, thử thách tư duy) ở cấp độ Queen.",
      "career": "Tác động thực tế đến công việc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Air để giải quyết vấn đề."
  },
  "Swords_14_King": {
    "id": "Swords_14_King",
    "name_en": "King of Swords",
    "name_vi": "Vua Kiếm",
    "arcana": "Minor",
    "element": "Air",
    "number": 14,
    "file": "Swords_14_King.png",
    "keywords_up": "Làm chủ, lãnh đạo, quyền lực, đỉnh cao kiểm soát trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "keywords_rev": "Độc tài, lạm quyền, tàn nhẫn, áp đặt trong lý trí, trí tuệ, sự thật, thử thách tư duy",
    "meanings": {
      "general": "Biểu hiện của năng lượng Air (lý trí, trí tuệ, sự thật, thử thách tư duy) ở cấp độ King.",
      "career": "Tác động thực tế đến công việc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến lý trí, trí tuệ, sự thật, thử thách tư duy."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Air để giải quyết vấn đề."
  },
  "Wands_01_Ace": {
    "id": "Wands_01_Ace",
    "name_en": "Ace of Wands",
    "name_vi": "Át Gậy",
    "arcana": "Minor",
    "element": "Fire",
    "number": 1,
    "file": "Wands_01_Ace.png",
    "keywords_up": "Khởi đầu mới, tiềm năng dồi dào trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "keywords_rev": "Bỏ lỡ cơ hội, năng lượng tắc nghẽn trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "meanings": {
      "general": "Biểu hiện của năng lượng Fire (đam mê, ý chí, hành động, hoài bão sáng tạo) ở cấp độ Ace.",
      "career": "Tác động thực tế đến công việc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Fire để giải quyết vấn đề."
  },
  "Wands_02_Two": {
    "id": "Wands_02_Two",
    "name_en": "Two of Wands",
    "name_vi": "Hai Gậy",
    "arcana": "Minor",
    "element": "Fire",
    "number": 2,
    "file": "Wands_02_Two.png",
    "keywords_up": "Cân bằng, lựa chọn, đối tác trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "keywords_rev": "Mất cân bằng, do dự, phân vân trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "meanings": {
      "general": "Biểu hiện của năng lượng Fire (đam mê, ý chí, hành động, hoài bão sáng tạo) ở cấp độ Two.",
      "career": "Tác động thực tế đến công việc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Fire để giải quyết vấn đề."
  },
  "Wands_03_Three": {
    "id": "Wands_03_Three",
    "name_en": "Three of Wands",
    "name_vi": "Ba Gậy",
    "arcana": "Minor",
    "element": "Fire",
    "number": 3,
    "file": "Wands_03_Three.png",
    "keywords_up": "Phát triển, hợp tác, kết quả bước đầu trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "keywords_rev": "Trì trệ, bất đồng nội bộ trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "meanings": {
      "general": "Biểu hiện của năng lượng Fire (đam mê, ý chí, hành động, hoài bão sáng tạo) ở cấp độ Three.",
      "career": "Tác động thực tế đến công việc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Fire để giải quyết vấn đề."
  },
  "Wands_04_Four": {
    "id": "Wands_04_Four",
    "name_en": "Four of Wands",
    "name_vi": "Bốn Gậy",
    "arcana": "Minor",
    "element": "Fire",
    "number": 4,
    "file": "Wands_04_Four.png",
    "keywords_up": "Ổn định, củng cố, vùng an toàn trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "keywords_rev": "Bảo thủ, ngột ngạt, buông thả trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "meanings": {
      "general": "Biểu hiện của năng lượng Fire (đam mê, ý chí, hành động, hoài bão sáng tạo) ở cấp độ Four.",
      "career": "Tác động thực tế đến công việc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Fire để giải quyết vấn đề."
  },
  "Wands_05_Five": {
    "id": "Wands_05_Five",
    "name_en": "Five of Wands",
    "name_vi": "Năm Gậy",
    "arcana": "Minor",
    "element": "Fire",
    "number": 5,
    "file": "Wands_05_Five.png",
    "keywords_up": "Thử thách, xung đột, mất mát tạm thời trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "keywords_rev": "Hồi phục, tìm thấy giải pháp hòa giải trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "meanings": {
      "general": "Biểu hiện của năng lượng Fire (đam mê, ý chí, hành động, hoài bão sáng tạo) ở cấp độ Five.",
      "career": "Tác động thực tế đến công việc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Fire để giải quyết vấn đề."
  },
  "Wands_06_Six": {
    "id": "Wands_06_Six",
    "name_en": "Six of Wands",
    "name_vi": "Sáu Gậy",
    "arcana": "Minor",
    "element": "Fire",
    "number": 6,
    "file": "Wands_06_Six.png",
    "keywords_up": "Hài hòa, chia sẻ, vượt qua sóng gió trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "keywords_rev": "Mắc kẹt, bất công, phụ thuộc trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "meanings": {
      "general": "Biểu hiện của năng lượng Fire (đam mê, ý chí, hành động, hoài bão sáng tạo) ở cấp độ Six.",
      "career": "Tác động thực tế đến công việc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Fire để giải quyết vấn đề."
  },
  "Wands_07_Seven": {
    "id": "Wands_07_Seven",
    "name_en": "Seven of Wands",
    "name_vi": "Bảy Gậy",
    "arcana": "Minor",
    "element": "Fire",
    "number": 7,
    "file": "Wands_07_Seven.png",
    "keywords_up": "Chiến lược, tự vấn, kiên nhẫn, đánh giá trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "keywords_rev": "Nóng vội, mưu mẹo sai lầm, ảo tưởng trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "meanings": {
      "general": "Biểu hiện của năng lượng Fire (đam mê, ý chí, hành động, hoài bão sáng tạo) ở cấp độ Seven.",
      "career": "Tác động thực tế đến công việc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Fire để giải quyết vấn đề."
  },
  "Wands_08_Eight": {
    "id": "Wands_08_Eight",
    "name_en": "Eight of Wands",
    "name_vi": "Tám Gậy",
    "arcana": "Minor",
    "element": "Fire",
    "number": 8,
    "file": "Wands_08_Eight.png",
    "keywords_up": "Tăng tốc, rèn luyện kỹ năng, tiến triển nhanh trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "keywords_rev": "Trì hoãn, kiệt sức, làm việc cẩu thả trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "meanings": {
      "general": "Biểu hiện của năng lượng Fire (đam mê, ý chí, hành động, hoài bão sáng tạo) ở cấp độ Eight.",
      "career": "Tác động thực tế đến công việc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Fire để giải quyết vấn đề."
  },
  "Wands_09_Nine": {
    "id": "Wands_09_Nine",
    "name_en": "Nine of Wands",
    "name_vi": "Chín Gậy",
    "arcana": "Minor",
    "element": "Fire",
    "number": 9,
    "file": "Wands_09_Nine.png",
    "keywords_up": "Gần về đích, kiên cường, thành tựu cá nhân trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "keywords_rev": "Mệt mỏi, phòng thủ thái quá, buông xuôi trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "meanings": {
      "general": "Biểu hiện của năng lượng Fire (đam mê, ý chí, hành động, hoài bão sáng tạo) ở cấp độ Nine.",
      "career": "Tác động thực tế đến công việc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Fire để giải quyết vấn đề."
  },
  "Wands_10_Ten": {
    "id": "Wands_10_Ten",
    "name_en": "Ten of Wands",
    "name_vi": "Mười Gậy",
    "arcana": "Minor",
    "element": "Fire",
    "number": 10,
    "file": "Wands_10_Ten.png",
    "keywords_up": "Hoàn thành chu kỳ, trọn vẹn hoặc quá tải trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "keywords_rev": "Gánh nặng được giải phóng, làm lại từ đầu trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "meanings": {
      "general": "Biểu hiện của năng lượng Fire (đam mê, ý chí, hành động, hoài bão sáng tạo) ở cấp độ Ten.",
      "career": "Tác động thực tế đến công việc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Fire để giải quyết vấn đề."
  },
  "Wands_11_Page": {
    "id": "Wands_11_Page",
    "name_en": "Page of Wands",
    "name_vi": "Thị Vệ Gậy",
    "arcana": "Minor",
    "element": "Fire",
    "number": 11,
    "file": "Wands_11_Page.png",
    "keywords_up": "Tin tức mới, học hỏi, nhiệt huyết trẻ trung trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "keywords_rev": "Bốc đồng, tin đồn thất thiệt, thiếu kinh nghiệm trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "meanings": {
      "general": "Biểu hiện của năng lượng Fire (đam mê, ý chí, hành động, hoài bão sáng tạo) ở cấp độ Page.",
      "career": "Tác động thực tế đến công việc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Fire để giải quyết vấn đề."
  },
  "Wands_12_Knight": {
    "id": "Wands_12_Knight",
    "name_en": "Knight of Wands",
    "name_vi": "Hiệp Sĩ Gậy",
    "arcana": "Minor",
    "element": "Fire",
    "number": 12,
    "file": "Wands_12_Knight.png",
    "keywords_up": "Hành động quyết liệt, xông xáo, theo đuổi mục tiêu trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "keywords_rev": "Hung hăng, nóng nảy, cả thèm chóng chán trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "meanings": {
      "general": "Biểu hiện của năng lượng Fire (đam mê, ý chí, hành động, hoài bão sáng tạo) ở cấp độ Knight.",
      "career": "Tác động thực tế đến công việc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Fire để giải quyết vấn đề."
  },
  "Wands_13_Queen": {
    "id": "Wands_13_Queen",
    "name_en": "Queen of Wands",
    "name_vi": "Hoàng Hậu Gậy",
    "arcana": "Minor",
    "element": "Fire",
    "number": 13,
    "file": "Wands_13_Queen.png",
    "keywords_up": "Nuôi dưỡng, trực giác, làm chủ thế giới nội tâm trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "keywords_rev": "Thao túng cảm xúc, độc đoán, tự ti trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "meanings": {
      "general": "Biểu hiện của năng lượng Fire (đam mê, ý chí, hành động, hoài bão sáng tạo) ở cấp độ Queen.",
      "career": "Tác động thực tế đến công việc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Fire để giải quyết vấn đề."
  },
  "Wands_14_King": {
    "id": "Wands_14_King",
    "name_en": "King of Wands",
    "name_vi": "Vua Gậy",
    "arcana": "Minor",
    "element": "Fire",
    "number": 14,
    "file": "Wands_14_King.png",
    "keywords_up": "Làm chủ, lãnh đạo, quyền lực, đỉnh cao kiểm soát trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "keywords_rev": "Độc tài, lạm quyền, tàn nhẫn, áp đặt trong đam mê, ý chí, hành động, hoài bão sáng tạo",
    "meanings": {
      "general": "Biểu hiện của năng lượng Fire (đam mê, ý chí, hành động, hoài bão sáng tạo) ở cấp độ King.",
      "career": "Tác động thực tế đến công việc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo.",
      "love": "Trạng thái tình cảm và cảm xúc liên quan đến đam mê, ý chí, hành động, hoài bão sáng tạo."
    },
    "advice": "Hãy vận dụng phẩm chất tích cực của nguyên tố Fire để giải quyết vấn đề."
  }
};

  // 2. MA TRẬN TƯƠNG TÁC NGUYÊN TỐ (GOLDEN DAWN ELEMENTAL DIGNITIES)
  const ELEMENTAL_RELATIONS = {
  "Fire_Air": {
    "type": "Tương sinh",
    "score": 1.5,
    "desc": "Khí thổi bùng Lửa: Ý tưởng lý trí thúc đẩy hành động mạnh mẽ."
  },
  "Air_Fire": {
    "type": "Tương sinh",
    "score": 1.5,
    "desc": "Lửa tiếp nhiệt cho Khí: Đam mê biến kế hoạch thành hiện thực."
  },
  "Water_Earth": {
    "type": "Tương sinh",
    "score": 1.5,
    "desc": "Nước tưới Đất: Cảm xúc chân thành nuôi dưỡng vật chất và nền tảng ổn định."
  },
  "Earth_Water": {
    "type": "Tương sinh",
    "score": 1.5,
    "desc": "Đất chứa Nước: Sự vững chãi bảo vệ và định hình cho dòng chảy cảm xúc."
  },
  "Fire_Fire": {
    "type": "Đồng dạng",
    "score": 1.0,
    "desc": "Song Lửa: Nhiệt huyết nhân đôi, tiến triển thần tốc nhưng cần kiềm chế nóng nảy."
  },
  "Water_Water": {
    "type": "Đồng dạng",
    "score": 1.0,
    "desc": "Song Nước: Cảm xúc dâng trào sâu sắc, trực giác cực nhạy nhưng dễ mủi lòng."
  },
  "Air_Air": {
    "type": "Đồng dạng",
    "score": 1.0,
    "desc": "Song Khí: Tư duy sắc bén vượt trội, nhiều ý tưởng nhưng suy nghĩ quá độ."
  },
  "Earth_Earth": {
    "type": "Đồng dạng",
    "score": 1.0,
    "desc": "Song Đất: Nền tảng vật chất vững như bàn thạch nhưng dễ chậm chạp bảo thủ."
  },
  "Fire_Water": {
    "type": "Tương khắc",
    "score": -1.0,
    "desc": "Nước dập tắt Lửa: Cảm xúc bất an làm nguội lạnh ngọn lửa nhiệt huyết."
  },
  "Water_Fire": {
    "type": "Tương khắc",
    "score": -1.0,
    "desc": "Lửa đun sôi Nước: Sự bốc đồng nóng vội làm bốc hơi sự bình yên cảm xúc."
  },
  "Air_Earth": {
    "type": "Tương khắc",
    "score": -1.0,
    "desc": "Khí và Đất nghẽn: Kế hoạch lý thuyết xa rời thực tế, khó khả thi."
  },
  "Earth_Air": {
    "type": "Tương khắc",
    "score": -1.0,
    "desc": "Đất đè Khí: Sự thực dụng cứng nhắc kìm hãm tư duy sáng tạo."
  },
  "Fire_Earth": {
    "type": "Trung tính",
    "score": 0.5,
    "desc": "Lửa tôi luyện Đất: Hành động quyết liệt tạo ra giá trị vật chất thực tế."
  },
  "Earth_Fire": {
    "type": "Trung tính",
    "score": 0.5,
    "desc": "Đất nuôi Lửa: Nguồn lực vật chất sẵn có làm bệ phóng cho hoài bão."
  },
  "Water_Air": {
    "type": "Trung tính",
    "score": 0.5,
    "desc": "Nước và Khí hòa quyện: Cảm xúc và lý trí cần học cách dung hòa lẫn nhau."
  },
  "Air_Water": {
    "type": "Trung tính",
    "score": 0.5,
    "desc": "Khí lướt trên Nước: Dùng lý trí dẫn dắt cảm xúc, tránh để bi lụy."
  }
};

  const ELEMENT_DESCRIPTIONS = {
    Fire: 'Nhiệt huyết, ý chí hành động và ngọn lửa đam mê',
    Water: 'Cảm xúc, tình cảm, sự thấu cảm và trực giác nội tâm',
    Air: 'Lý trí, sự thật khách quan, phân tích logic và giải tỏa áp lực',
    Earth: 'Tính thực tế, kế hoạch tài chính cụ thể và nền tảng vật chất vững vàng'
  };

  const SPREAD_DEFINITIONS = {
    'single': {
      id: 'single',
      name: '1 lá: Thông điệp Trọng tâm (Daily Card)',
      count: 1,
      positions: ['Trọng tâm thông điệp hiện tại']
    },
    'past_present_future': {
      id: 'past_present_future',
      name: '3 lá: Dòng thời gian (Quá khứ - Hiện tại - Tương lai)',
      count: 3,
      positions: [
        'Quá khứ / Căn nguyên gốc rễ',
        'Hiện tại / Thử thách cốt lõi',
        'Xu hướng Tương lai / Kết quả tiềm năng'
      ]
    },
    'problem_solution': {
      id: 'problem_solution',
      name: '3 lá: Vấn đề & Giải pháp',
      count: 3,
      positions: [
        'Thực trạng vấn đề',
        'Nguyên nhân ẩn giấu',
        'Giải pháp hành động đề xuất'
      ]
    },
    'relationship': {
      id: 'relationship',
      name: '3 lá: Mối quan hệ & Tương tác đôi bên',
      count: 3,
      positions: [
        'Năng lượng & Tâm thế của bạn',
        'Năng lượng & Mong cầu của đối phương',
        'Giao thoa & Hướng phát triển của mối quan hệ'
      ]
    },
    'decision': {
      id: 'decision',
      name: '3 lá: So sánh & Lựa chọn ngã rẽ',
      count: 3,
      positions: [
        'Con đường / Lựa chọn A',
        'Con đường / Lựa chọn B',
        'Yếu tố then chốt quyết định'
      ]
    }
  };

  const QUINTESSENCE_LESSONS = {
    0: 'Tái sinh qua niềm tin thuần khiết: Hãy dám bước vào khoảng trống vô định với sự can đảm của đứa trẻ; giải phóng mọi định kiến cũ kỹ.',
    1: 'Hiện thực hóa ý chí: Bạn đã có đầy đủ nguồn lực và công cụ, vấn đề then chốt là tập trung 100% ý chí để biến ý niệm thành hành động thực tế.',
    2: 'Lắng nghe trực giác & tĩnh lặng: Câu trả lời không nằm ở thế giới ồn ào bên ngoài; hãy kiên nhẫn quan sát, giữ bí mật và tin vào tiếng nói nội tâm.',
    3: 'Nuôi dưỡng & Sinh sôi trù phú: Dự án và tâm tư cần thời gian đơm hoa kết trái tự nhiên; hãy dùng tình yêu thương và sự kiên nhẫn thay vì thúc ép.',
    4: 'Thiết lập trật tự & kỷ luật thép: Cần xây dựng quy trình, ranh giới rõ ràng và kiểm soát hoàn cảnh bằng lý trí vững vàng.',
    5: 'Tôn trọng quy chuẩn & tìm kiếm chỉ dẫn: Học hỏi từ tiền nhân, tuân thủ các nguyên tắc đạo lý hoặc tìm kiếm lời khuyên từ bậc thầy nhiều kinh nghiệm.',
    6: 'Lựa chọn của con tim & cam kết hệ giá trị: Đứng trước ngã rẽ quan trọng, hãy chọn con đường hòa hợp với tiếng gọi đích thực của tâm hồn.',
    7: 'Tập trung ý chí & kiểm soát xung đột: Điều phối các luồng năng lượng đối lập bên trong bạn để lao về phía trước với quyết tâm kiên định.',
    8: 'Sức mạnh của sự nhu hòa: Dùng lòng từ tâm, sự nhẫn nại và thấu cảm để thuần hóa những con thú hoang giận dữ hay lo âu bên trong.',
    9: 'Tự vấn nội tâm & soi sáng chân lý: Rút lui khỏi ồn ào thế sự để tìm lại chính mình; câu trả lời đang chờ đợi bạn trong khoảnh khắc cô độc thông tuệ.',
    10: 'Thích ứng với bánh xe luân chuyển: Vận mệnh luôn vận động không ngừng; điều quan trọng là đứng ở tâm trục bánh xe để giữ thăng bằng dù thăng hay trầm.',
    11: 'Minh bạch & Cân bằng nhân quả: Hành động công tâm, nhìn nhận sự thật khách quan và nhận trách nhiệm về mọi lựa chọn của bản thân.',
    12: 'Buông bỏ để nhìn đời từ góc độ mới: Đôi khi dừng lại, hi sinh cái tôi nhất thời chính là chìa khóa để khai mở sự giác ngộ sâu sắc nhất.',
    13: 'Đoạn tuyệt chu kỳ cũ để tái sinh: Cái gì đã mục ruỗng cần phải ra đi để nhường chỗ cho sự sống mới bắt đầu; đừng cố níu giữ dĩ vãng.',
    14: 'Tiết chế & Nghệ thuật dung hòa: Trộn lẫn các thái cực bằng sự nhịp nhàng, kiên định và điều độ; tránh mọi biểu hiện cực đoan.',
    15: 'Nhận diện xiềng xích ảo tưởng: Đối diện với những cám dỗ, nỗi sợ hãi hoặc thói quen trói buộc để tự giải phóng bản thân khỏi ngục tù tâm lý.',
    16: 'Giải phóng qua sự sụp đổ của ảo vọng: Bão giông phá hủy những tòa thành giả tạo để bạn được xây dựng lại cuộc đời trên nền móng chân thật vững bền.',
    17: 'Hy vọng & Niềm tin dẫn lối: Sau giông bão là bầu trời sao thanh bình; hãy mở lòng đón nhận nguồn cảm hứng chữa lành và định hướng tương lai.',
    18: 'Vượt qua ảo ảnh & bóng tối tiềm thức: Cẩn trọng trước những hoang mang, nghi kỵ; hãy để trực giác dẫn đường qua màn sương mù mờ ảo.',
    19: 'Rạng rỡ ánh sáng & thành tựu viên mãn: Sự thật được phơi bày rõ ràng, niềm vui thuần khiết và năng lượng sống tích cực tràn đầy.',
    20: 'Tiếng gọi thức tỉnh & Tái định giá cuộc đời: Thời khắc tha thứ cho quá khứ, nghe theo tiếng gọi thiên mệnh để bước lên một tầm thức mới.',
    21: 'Viên mãn & Hợp nhất toàn diện: Hoàn tất một đại chu kỳ thành công, đạt tới sự hòa hợp trọn vẹn giữa bản thân và vũ trụ.'
  };

  // 3. ĐỘNG CƠ THUẬT TOÁN TAROT ENGINE
  const NetaTarotEngine = {
    getDatabase: function () {
      return TAROT_DATABASE;
    },

    getSpreadDefinitions: function () {
      return SPREAD_DEFINITIONS;
    },

    getCard: function (cardId) {
      return TAROT_DATABASE[cardId] || null;
    },

    getAllCardsList: function () {
      return Object.values(TAROT_DATABASE);
    },

    drawRandom: function (count = 3, allowReversed = true) {
      const keys = Object.keys(TAROT_DATABASE);
      const shuffled = keys.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, count);
      
      return selected.map(id => {
        const isUpright = allowReversed ? (Math.random() > 0.25) : true;
        return {
          cardId: id,
          isUpright: isUpright
        };
      });
    },

    detectDomainFromQuestion: function (questionText) {
      if (!questionText || typeof questionText !== 'string') return 'general';
      const q = questionText.toLowerCase();
      
      const loveKeywords = ['yêu', 'tình', 'người yêu', 'crush', 'chia tay', 'kết hôn', 'cưới', 'bạn gái', 'bạn trai', 'tình cảm', 'hẹn hò', 'chồng', 'vợ'];
      const careerKeywords = ['việc', 'công việc', 'tiền', 'lương', 'sếp', 'đồng nghiệp', 'kinh doanh', 'đầu tư', 'học tập', 'thi cử', 'thăng chức', 'dự án', 'nghề'];

      if (loveKeywords.some(kw => q.includes(kw))) return 'love';
      if (careerKeywords.some(kw => q.includes(kw))) return 'career';
      return 'general';
    },

    /**
     * THUẬT TOÁN 1: TÍNH LÁ BÀI CỐT TỦY (THE QUINTESSENCE CARD)
     * Paul Foster Case & Mary K. Greer
     */
    computeQuintessence: function (cardObjects) {
      let totalSum = 0;
      cardObjects.forEach(c => {
        let num = c.number !== undefined ? c.number : 0;
        if (c.arcana === 'Minor') {
          if (c.id.includes('_01_') || c.id.includes('_Ace')) num = 1;
          else if (c.id.includes('_11_') || c.id.includes('_Page')) num = 11;
          else if (c.id.includes('_12_') || c.id.includes('_Knight')) num = 12;
          else if (c.id.includes('_13_') || c.id.includes('_Queen')) num = 13;
          else if (c.id.includes('_14_') || c.id.includes('_King')) num = 14;
        }
        totalSum += num;
      });

      let reduced = totalSum;
      while (reduced > 22) {
        const digits = String(reduced).split('').map(Number);
        reduced = digits.reduce((acc, d) => acc + d, 0);
      }

      const majorIdMap = {
        0: 'Major_00_Fool', 22: 'Major_00_Fool',
        1: 'Major_01_Magician', 2: 'Major_02_High_Priestess', 3: 'Major_03_Empress',
        4: 'Major_04_Emperor', 5: 'Major_05_Hierophant', 6: 'Major_06_Lovers',
        7: 'Major_07_Chariot', 8: 'Major_08_Strength', 9: 'Major_09_Hermit',
        10: 'Major_10_Wheel_of_Fortune', 11: 'Major_11_Justice', 12: 'Major_12_Hanged_Man',
        13: 'Major_13_Death', 14: 'Major_14_Temperance', 15: 'Major_15_Devil',
        16: 'Major_16_Tower', 17: 'Major_17_Star', 18: 'Major_18_Moon',
        19: 'Major_19_Sun', 20: 'Major_20_Judgement', 21: 'Major_21_World'
      };

      const quintCardId = majorIdMap[reduced] || 'Major_00_Fool';
      const quintCard = TAROT_DATABASE[quintCardId];

      return {
        rawSum: totalSum,
        reducedNumber: reduced,
        cardId: quintCardId,
        nameVi: quintCard ? quintCard.name_vi : 'Kẻ Khờ',
        nameEn: quintCard ? quintCard.name_en : 'The Fool',
        imageWebp: quintCardId + '.webp',
        lesson: QUINTESSENCE_LESSONS[reduced] || QUINTESSENCE_LESSONS[0]
      };
    },

    /**
     * THUẬT TOÁN 2: NHẬN DIỆN MẪU HÌNH CỔ MẪU (ARCHETYPAL PATTERN MATCHING)
     */
    detectArchetypalPatterns: function (cardObjects) {
      const patterns = [];

      // A. Mẫu Court Cards (Hoàng Gia)
      const courtCards = cardObjects.filter(c => 
        c.id.includes('_11_') || c.id.includes('_Page') ||
        c.id.includes('_12_') || c.id.includes('_Knight') ||
        c.id.includes('_13_') || c.id.includes('_Queen') ||
        c.id.includes('_14_') || c.id.includes('_King')
      );
      if (courtCards.length >= 2) {
        patterns.push({
          type: 'court_dominance',
          title: 'Mẫu Hình Hoàng Gia (Tác Động Từ Con Người Bên Ngoài)',
          badge: '👥 Ảnh hưởng từ các nhân vật ngoại cảnh',
          desc: `Trải bài xuất hiện ${courtCards.length} nhân vật Hoàng gia (${courtCards.map(c => c.name_vi).join(', ')}). Báo hiệu tình huống không thuần túy là nội tâm cá nhân, mà đang bị chi phối mạnh mẽ bởi các nhân vật ngoại cảnh (cấp trên, đối tác, người thân hoặc đối thủ). Cần chú ý phong cách giao tiếp và ranh giới với những người này.`
        });
      }

      // B. Mẫu Suit Extremity (Bộ Đơn Sắc)
      const suitCounts = { Cups: 0, Pentacles: 0, Swords: 0, Wands: 0 };
      cardObjects.forEach(c => {
        if (c.id.startsWith('Cups')) suitCounts.Cups++;
        else if (c.id.startsWith('Pentacles')) suitCounts.Pentacles++;
        else if (c.id.startsWith('Swords')) suitCounts.Swords++;
        else if (c.id.startsWith('Wands')) suitCounts.Wands++;
      });

      for (const suit in suitCounts) {
        if (suitCounts[suit] >= 2) {
          const suitDescs = {
            Swords: {
              title: 'Cơn Bão Lý Trí & Áp Lực Tinh Thần (Swords Dominant)',
              badge: '⚔️ Bộ Kiếm chiếm ưu thế',
              desc: 'Tập trung dày đặc của năng lượng Kiếm. Bạn đang suy nghĩ, phân tích quá mức hoặc trải qua căng thẳng tâm lý, lo âu và xung đột quan điểm. Cần học cách hạ bớt sự ám ảnh của lý thuyết để cho tâm trí được nghỉ ngơi.'
            },
            Cups: {
              title: 'Dòng Lũ Cảm Xúc & Trực Giác Nhạy Cảm (Cups Dominant)',
              badge: '🏆 Bộ Cốc chiếm ưu thế',
              desc: 'Cảm xúc và trái tim đang chi phối gần như toàn bộ tình huống. Bạn nhạy cảm, thấu cảm sâu sắc nhưng cũng dễ bị tổn thương hoặc để tình cảm làm mờ mắt trước những dữ kiện khách quan. Hãy dùng một chút lý trí để định hình dòng chảy.'
            },
            Pentacles: {
              title: 'Nền Móng Vật Chất & Tiến Độ Thực Tế (Pentacles Dominant)',
              badge: '🪙 Bộ Tiền chiếm ưu thế',
              desc: 'Tình huống xoay quanh tài chính, sự nghiệp, tiến độ công việc hoặc nền tảng vật chất cụ thể. Tiến độ có thể chậm rãi nhưng vững chắc. Lời khuyên là hãy bám sát dữ liệu thực tế thay vì suy đoán mơ hồ.'
            },
            Wands: {
              title: 'Ngọn Lửa Hành Động & Tiến Trình Khẩn Trương (Wands Dominant)',
              badge: '🪄 Bộ Gậy chiếm ưu thế',
              desc: 'Năng lượng hành động, đam mê và nhiệt huyết đang bùng nổ. Sự việc tiến triển với tốc độ nhanh, nhiều ý tưởng hoặc chuyển dịch cùng lúc. Hãy duy trì sự tập trung cao độ để ngọn lửa không bị phân tán hoặc thiêu rụi sức lực.'
            }
          };
          patterns.push(suitDescs[suit]);
        }
      }

      // C. Mẫu Aces (Hạt giống khởi đầu)
      const aces = cardObjects.filter(c => c.id.includes('_01_') || c.id.includes('_Ace'));
      if (aces.length >= 2) {
        patterns.push({
          type: 'multiple_aces',
          title: 'Khởi Đầu Dồn Dập & Hạt Giống Cơ Hội Mới (Multiple Aces)',
          badge: '🌱 Chu kỳ mới mở ra',
          desc: `Sự hội tụ của ${aces.length} lá Át (${aces.map(c => c.name_vi).join(', ')}) báo hiệu một cánh cửa số mệnh mới đang mở toang. Bạn đang đứng trước thời cơ khởi sắc hiếm có trên nhiều phương diện. Hãy nhanh chóng nắm bắt hạt giống này.`
        });
      }

      // D. Mẫu Cặp Đối Ngẫu Huyền Bí
      const cardIds = cardObjects.map(c => c.id);
      const checkPair = (id1, id2) => cardIds.includes(id1) && cardIds.includes(id2);

      if (checkPair('Major_16_Tower', 'Major_17_Star')) {
        patterns.push({
          type: 'tower_star',
          title: 'Tái Sinh Qua Giông Bão: Ánh Sao Sau Sự Đổ Vỡ',
          badge: '⚡ Cặp bài Chuyển hóa lớn',
          desc: 'Sự xuất hiện đồng thời của The Tower và The Star là dấu hiệu kinh điển cho thấy: Mọi sự đổ vỡ hay biến cố vừa qua thực chất là sự thanh tẩy cần thiết để dọn đường cho niềm hy vọng và sự tái sinh chân chính nhất của bạn.'
        });
      }
      if (checkPair('Major_13_Death', 'Major_19_Sun')) {
        patterns.push({
          type: 'death_sun',
          title: 'Đoạn Tuyệt Bóng Tối & Đón Bình Minh Rực Rỡ',
          badge: '☀️ Cặp bài Tái sinh viên mãn',
          desc: 'Sự kết hợp giữa Death và The Sun mang ý nghĩa một chu kỳ u tối, đau thương đã hoàn toàn khép lại. Bình minh đang hé rạng với năng lượng rạng ngời và thành công vượt bậc.'
        });
      }
      if (checkPair('Major_06_Lovers', 'Major_15_Devil')) {
        patterns.push({
          type: 'lovers_devil',
          title: 'Sự Giằng Xé Giữa Tình Yêu Thuần Khiết & Cám Dỗ Trói Buộc',
          badge: '⛓️ Xung đột nội tâm sâu sắc',
          desc: 'The Lovers và The Devil cùng xuất hiện phản ánh một sự giằng xé dữ dội giữa lý tưởng thanh cao và những ham muốn, ràng buộc độc hại. Đây là bài kiểm tra đạo đức và sự tự do đích thực của bạn.'
        });
      }

      return patterns;
    },

    /**
     * THUẬT TOÁN 3: TỔNG HỢP MẠCH TRUYỆN BIỆN CHỨNG (DIALECTICAL NARRATIVE SYNTHESIS)
     * Xâu chuỗi nhân - quả qua 3 thì (Past - Present - Future) thành một cốt truyện hoàn chỉnh
     */
    synthesizeDialecticalNarrative: function (cardObjects, domain, pairAnalysis, quintessence, spreadType) {
      const k = cardObjects.length;
      if (k === 1) {
        const c = cardObjects[0];
        const orient = c.is_upright ? 'thuận dòng năng lượng' : 'gặp điểm nghẽn cản trở';
        return `Thông điệp hiện tại tập trung toàn diện vào lá **${c.name_vi} (${c.name_en})** trong trạng thái ${orient}. Bài học cốt lõi là ${c.advice}`;
      }

      if (k === 3 && spreadType === 'past_present_future') {
        const [c1, c2, c3] = cardObjects;
        const p1 = pairAnalysis[0] || { relation: 'Trung tính', score: 0 };
        const p2 = pairAnalysis[1] || { relation: 'Trung tính', score: 0 };

        // Giai đoạn 1: Quá khứ -> Hiện tại
        let bridge1 = '';
        if (p1.score > 0.5) {
          bridge1 = `Chính nền tảng và bài học từ **${c1.name_vi}** trong quá khứ (${c1.keywords_up.split(',')[0]}) đã tạo bước đệm tự nhiên, đưa bạn tiến thẳng vào thử thách cốt lõi ở hiện tại: **${c2.name_vi}**.`;
        } else if (p1.score < 0) {
          bridge1 = `Tuy nhiên, những dư chấn hoặc xung đột năng lượng chưa được giải quyết từ **${c1.name_vi}** (${c1.is_upright ? c1.keywords_up : c1.keywords_rev}) đang tạo thành điểm nghẽn, đẩy bạn vào trạng thái đầy trăn trở của **${c2.name_vi}** ở hiện tại.`;
        } else {
          bridge1 = `Tiến trình chuyển dịch từ **${c1.name_vi}** ở quá khứ sang **${c2.name_vi}** ở hiện tại diễn ra theo quy luật tự nhiên, phản ánh đúng giai đoạn trưởng thành trong nhận thức của bạn.`;
        }

        // Giai đoạn 2: Hiện tại -> Tương lai
        let bridge2 = '';
        if (p2.score > 0.5) {
          bridge2 = `Nếu tại thời điểm này, bạn làm chủ được bài học của **${c2.name_vi}** (${c2.advice}), dòng chảy năng lượng sẽ tương sinh mạnh mẽ, mở đường cho quả ngọt viên mãn ở tương lai với **${c3.name_vi}** (${c3.is_upright ? c3.keywords_up : c3.keywords_rev}).`;
        } else if (p2.score < 0) {
          bridge2 = `Đáng lưu ý, tương lai với **${c3.name_vi}** đang có sự xung đột năng lượng với hiện tại. Điều này cảnh báo: Nếu không chấn chỉnh kịp thời điểm nghẽn của **${c2.name_vi}**, bạn có nguy cơ rơi vào thế giằng co hoặc áp lực không đáng có khi bước sang giai đoạn tiếp theo.`;
        } else {
          bridge2 = `Tương lai phía trước mang đậm sắc thái của **${c3.name_vi}**, mở ra cơ hội để bạn hiện thực hóa những gì đang ấp ủ, miễn là bạn giữ được tâm thế vững vàng từ hiện tại.`;
        }

        // Kết luận cốt tủy
        const quintSummary = quintessence ? `Sợi chỉ đỏ xuyên suốt toàn bộ tiến trình này chính là bài học linh hồn của lá Cốt Tủy **${quintessence.nameVi}**: *"${quintessence.lesson}"*` : '';

        return `${bridge1} ${bridge2} ${quintSummary}`;
      }

      // Mặc định cho các spread 3 lá khác
      return `Dòng chảy của trải bài liên kết chặt chẽ giữa các vị trí. Khi thấu suốt bài học của từng giai đoạn, bức tranh toàn cảnh sẽ dẫn lối tới sự chuyển hóa của lá Cốt Tủy **${quintessence ? quintessence.nameVi : ''}**.`;
    },

    /**
     * Thuật toán Luận giải Trải bài Toàn diện (V2.0)
     */
    evaluateSpread: function (drawnCards, spreadType = 'past_present_future', domain = 'general', question = '') {
      const k = drawnCards.length;
      const cardObjects = [];
      
      for (const item of drawnCards) {
        const base = TAROT_DATABASE[item.cardId];
        if (!base) continue;
        cardObjects.push({
          ...base,
          is_upright: item.isUpright !== false,
          image_webp: item.cardId + '.webp'
        });
      }

      // --- BƯỚC 1: PHÂN TÍCH ĐỊNH LƯỢNG VĨ MÔ (MACRO SCAN) ---
      const majorsCount = cardObjects.filter(c => c.arcana === 'Major').length;
      const majorRatio = k > 0 ? (majorsCount / k) : 0;
      
      const uprightCount = cardObjects.filter(c => c.is_upright).length;
      const reversedCount = k - uprightCount;

      const elementCounts = { Fire: 0, Water: 0, Air: 0, Earth: 0 };
      cardObjects.forEach(c => {
        if (elementCounts[c.element] !== undefined) {
          elementCounts[c.element]++;
        }
      });

      let dominantElement = 'Fire';
      let maxCount = -1;
      for (const el in elementCounts) {
        if (elementCounts[el] > maxCount) {
          maxCount = elementCounts[el];
          dominantElement = el;
        }
      }

      const missingElements = Object.keys(elementCounts).filter(el => elementCounts[el] === 0);

      // Đánh giá Fate vs Free-will
      let fateVerdict = '';
      if (majorRatio >= 0.6) {
        fateVerdict = 'ĐỊNH MỆNH CHI PHỐI CHỦ ĐẠO (Biến chuyển lớn, bài học nghiệp quả ngoài tầm kiểm soát trực tiếp)';
      } else if (majorRatio >= 0.3) {
        fateVerdict = 'CÂN BẰNG GIỮA THỜI THẾ VÀ Ý CHÍ (Có cơ duyên đưa đẩy nhưng quyền quyết định then chốt nằm ở bạn)';
      } else {
        fateVerdict = 'HÀNH ĐỘNG CÁ NHÂN QUYẾT ĐỊNH (Sự việc cụ thể hàng ngày, kết quả phụ thuộc 100% vào nỗ lực thực tế)';
      }

      // --- BƯỚC 2: MA TRẬN TƯƠNG TÁC NGUYÊN TỐ (ELEMENTAL DIGNITIES) ---
      const pairAnalysis = [];
      let totalAffinityScore = 0;

      for (let i = 0; i < k - 1; i++) {
        const c1 = cardObjects[i];
        const c2 = cardObjects[i + 1];
        const pairKey = `${c1.element}_${c2.element}`;
        const rel = ELEMENTAL_RELATIONS[pairKey] || { type: 'Trung tính', score: 0.5, desc: 'Năng lượng dung hòa bình thường.' };
        totalAffinityScore += rel.score;
        pairAnalysis.push({
          fromCard: c1.name_vi,
          toCard: c2.name_vi,
          pair: `${c1.element} -> ${c2.element}`,
          relation: rel.type,
          score: rel.score,
          explanation: rel.desc
        });
      }

      // --- BƯỚC 3: THUẬT TOÁN QUINTESSENCE & ARCHETYPAL PATTERNS ---
      const quintessence = this.computeQuintessence(cardObjects);
      const archetypalPatterns = this.detectArchetypalPatterns(cardObjects);

      // --- BƯỚC 4: TỔNG HỢP MẠCH TRUYỆN BIỆN CHỨNG (NARRATIVE SYNTHESIS) ---
      const synthesizedStory = this.synthesizeDialecticalNarrative(cardObjects, domain, pairAnalysis, quintessence, spreadType);

      // --- BƯỚC 5: ÁNH XẠ VỊ TRÍ TRẢI BÀI (SLOT BINDING) ---
      const spreadDef = SPREAD_DEFINITIONS[spreadType] || SPREAD_DEFINITIONS['past_present_future'];
      const positionLabels = spreadDef.positions || [];

      const cardReadings = cardObjects.map((c, i) => {
        const posName = positionLabels[i] || `Vị trí ${i + 1}`;
        const orientationStr = c.is_upright ? 'Xuôi (Upright)' : 'Ngược (Reversed)';
        const kw = c.is_upright ? c.keywords_up : c.keywords_rev;
        let meaning = (c.meanings && c.meanings[domain]) ? c.meanings[domain] : (c.meanings ? c.meanings.general : '');
        if (!c.is_upright) {
          meaning = `[Năng lượng ngược / cản trở] ${meaning} Đang có điểm nghẽn hoặc biểu hiện thái quá/thiếu hụt cần chấn chỉnh.`;
        }

        return {
          slotIndex: i,
          position: posName,
          cardId: c.id,
          cardName: `${c.name_vi} (${c.name_en})`,
          nameVi: c.name_vi,
          nameEn: c.name_en,
          imageWebp: c.image_webp,
          isUpright: c.is_upright,
          orientation: orientationStr,
          arcana: c.arcana,
          element: c.element,
          keywords: kw,
          detailMeaning: meaning,
          advice: c.advice
        };
      });

      // --- BƯỚC 6: TỔNG HỢP DÒNG CHẢY NĂNG LƯỢNG & LỜI KHUYÊN ---
      const dominantDesc = ELEMENT_DESCRIPTIONS[dominantElement] || dominantElement;
      const missingDesc = missingElements.length > 0
        ? missingElements.map(e => `${e} (${ELEMENT_DESCRIPTIONS[e]})`).join(', ')
        : 'Không thiếu nguyên tố nào (Trạng thái cân bằng tốt)';

      let flowVerdict = '';
      if (totalAffinityScore > 1.0) {
        flowVerdict = 'DÒNG CHẢY NĂNG LƯỢNG THUẬN LỢI (Các giai đoạn tương sinh hỗ trợ nhau rất nhịp nhàng)';
      } else if (totalAffinityScore < -0.5) {
        flowVerdict = 'DÒNG CHẢY CÓ XUNG ĐỘT (Có sự bất đồng giữa các giai đoạn, cần giải quyết mâu thuẫn nội tại trước)';
      } else {
        flowVerdict = 'DÒNG CHẢY ỔN ĐỊNH BÌNH THƯỜNG (Tiến triển theo quy luật tự nhiên, không có biến động cực đoan)';
      }

      let finalAdvice = `Tập trung phát huy nguồn năng lượng của ${dominantDesc}. `;
      if (missingElements.length > 0) {
        finalAdvice += `Đồng thời đặc biệt bổ sung phần đang thiếu hụt: ${missingDesc}. `;
      }
      if (quintessence) {
        finalAdvice += `Lời khuyên cốt tủy từ lá ${quintessence.nameVi || quintessence.name_vi}: ${quintessence.lesson}`;
      }

      const now = new Date();
      const timestamp = now.toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });

      return {
        timestamp: timestamp,
        spreadType: spreadType,
        spreadName: spreadDef.name,
        question: question || 'Tổng quan vận thế',
        domain: domain,
        fateVerdict: fateVerdict,
        majorRatio: `${majorsCount}/${k} lá (${Math.round(majorRatio * 100)}%)`,
        uprightCount: uprightCount,
        reversedCount: reversedCount,
        orientationStat: `${uprightCount} Xuôi / ${reversedCount} Ngược`,
        dominantElement: `${dominantElement} (${dominantDesc})`,
        missingElementsDesc: missingDesc,
        flowVerdict: flowVerdict,
        totalAffinityScore: totalAffinityScore,
        pairAnalysis: pairAnalysis,
        quintessence: quintessence,
        archetypalPatterns: archetypalPatterns,
        synthesizedStory: synthesizedStory,
        cardReadings: cardReadings,
        finalAdvice: finalAdvice
      };
    },

    /**
     * Xuất báo cáo dạng Markdown chuyên nghiệp
     */
    formatMarkdownReport: function (report) {
      const md = [];
      md.push('# BÁO CÁO LUẬN GIẢI TAROT THEO THUẬT TOÁN CỔ ĐIỂN CHUYÊN SÂU');
      md.push(`*Thời gian:* \`${report.timestamp}\` | *Chủ đề:* \`${report.domain.toUpperCase()}\` | *Trải bài:* \`${report.spreadName}\``);
      if (report.question) {
        md.push(`*Câu hỏi / Chủ đích:* **${report.question}**\n`);
      }
      md.push('---');
      
      // I. CỐT TỦY & TỔNG LUẬN
      if (report.quintessence) {
        md.push('## I. LÁ BÀI CỐT TỦY & BÀI HỌC LINH HỒN (THE QUINTESSENCE)');
        md.push(`* **Lá bài đại diện cốt tủy:** **${report.quintessence.name_vi} (${report.quintessence.name_en})** (Số học: \`${report.quintessence.rawSum} -> ${report.quintessence.reducedNumber}\`)`);
        md.push(`* **Thông điệp cốt tủy:** *${report.quintessence.lesson}*\n`);
      }

      md.push('## II. TỔNG LUẬN MẠCH TRUYỆN BIỆN CHỨNG (SYNTHESIZED NARRATIVE)');
      md.push(`> ${report.synthesizedStory}\n`);

      if (report.archetypalPatterns && report.archetypalPatterns.length > 0) {
        md.push('### Mẫu hình cổ mẫu nổi bật (Archetypal Constellations):');
        report.archetypalPatterns.forEach(p => {
          md.push(`- **${p.title}** [${p.badge}]: ${p.desc}`);
        });
        md.push('');
      }

      md.push('---');
      md.push('## III. PHÂN TÍCH ĐỊNH LƯỢNG VĨ MÔ (MACRO SCAN)');
      md.push(`* **Bản chất trải bài:** **${report.fateVerdict}**`);
      md.push(`* **Tỷ lệ Ẩn chính (Major Arcana):** \`${report.majorRatio}\``);
      md.push(`* **Trạng thái chiều bài:** \`${report.orientationStat}\``);
      md.push(`* **Nguyên tố thống trị:** **${report.dominantElement}**`);
      md.push(`* **Nguyên tố thiếu hụt cần bổ sung:** ${report.missingElementsDesc}`);
      md.push(`* **Đánh giá dòng chảy tổng thể:** **${report.flowVerdict}**\n`);

      if (report.pairAnalysis && report.pairAnalysis.length > 0) {
        md.push('### Ma trận tương tác nguyên tố (Golden Dawn Elemental Dignities):');
        report.pairAnalysis.forEach(p => {
          const sign = p.score > 0 ? `+${p.score}` : `${p.score}`;
          md.push(`- **${p.fromCard}** -> **${p.toCard}** \`[${p.pair}]\` (${p.relation} ${sign}): ${p.explanation}`);
        });
        md.push('');
      }

      md.push('---');
      md.push('## IV. CHI TIẾT LUẬN GIẢI TỪNG VỊ TRÍ');
      report.cardReadings.forEach(c => {
        md.push(`### ${c.position}: ${c.cardName} — *[${c.orientation}]*`);
        md.push(`- **Phân loại & Nguyên tố:** ${c.arcana} Arcana | Nguyên tố ${c.element}`);
        md.push(`- **Từ khóa trọng tâm:** \`${c.keywords}\``);
        md.push(`- **Luận giải chi tiết:** ${c.detailMeaning}`);
        md.push(`- **Lời khuyên riêng:** *${c.advice}*\n`);
      });

      md.push('---');
      md.push('## V. TỔNG KẾT VÀ LỜI KHUYÊN HÀNH ĐỘNG (ACTIONABLE PRESCRIPTION)');
      md.push(`> **THÔNG ĐIỆP CHỐT:** ${report.finalAdvice}\n`);

      if (report.deepSynthesis) {
        md.push('---');
        md.push('## VI. LUẬN GIẢI CHIỀU SÂU & HƯỚNG DẪN CỤ THỂ');
        md.push(`${report.deepSynthesis}\n`);
      }
      return md.join('\n');
    }
  };

  global.NetaTarotEngine = NetaTarotEngine;
})(typeof window !== 'undefined' ? window : global);
