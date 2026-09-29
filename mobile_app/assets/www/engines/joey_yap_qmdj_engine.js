/**
 * NETA LIGHT - JOEY YAP QI MEN DUN JIA ENGINE
 * File: engines/joey_yap_qmdj_engine.js
 * ---------------------------------------------------------------------------------
 * Đóng gói độc lập toàn bộ các thuật toán cốt lõi từ bộ toàn thư:
 * "Qi Men Dun Jia Compendium (Second Edition)" của tác giả Joey Yap.
 *
 * CÁC PHÂN HỆ TÍNH TOÁN & THUẬT TOÁN:
 * 1. Thập Nhị Nguyệt Tướng (12 Month Generals / Thái Dương Quá Cung).
 * 2. Ma trận 144 Tọa Độ Thái Trùng Thiên Mã (Great Minister Sky Horse).
 * 3. Bộ lọc Phủ quyết Ngũ Bất Ngộ Thời (Five Disharmony Hour - Veto Factor).
 * 4. Kỳ Môn Tam Thắng (Three Victory Palaces: Trực Phù, Cửu Thiên, Sinh Môn).
 * 5. Ngũ Bất Kích (Five Non-Striking Palaces: 5 phương vị cấm công kích).
 * 6. Du Tam Tị Ngũ (Swaying 3, Evading 5: Trực Phù đáo Chấn 3 vs Trung 5).
 * 7. Thiên Tam Môn (Heavenly 3 Doors) & Địa Tứ Hộ (Earthly 4 Gates).
 * 8. Môn Cung Hòa Nghĩa (Door-Palace Harmony & Righteousness).
 * 9. Hệ thống 76 Cách Cục Toàn Thư (Tam Cát Bảo, Cửu Độn, Tam Trá, Ngũ Giả,
 *    Đại Hung Cách, Lục Nghi Kích Hình, Tam Kỳ Nhập Mộ, Môn Bách, Cung Bức).
 * 10. Bát Môn & Cửu Tinh Khắc Ứng Thực Địa (Section H: Evidential Occurrences).
 * 11. Bộ điều phối Tác chiến Không gian (Spatial Strategic Execution) &
 *     Cầu nối tích hợp tự động với QMDJCore trong Neta Light.
 */

(function (global) {
  'use strict';

  // ==============================================================================
  // 1. TỪ ĐIỂN & HỆ THỐNG DANH MỤC THUẬT NGỮ ĐỐI SOÁT
  // ==============================================================================

  const STEMS_10 = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  const STEM_PINYIN = {
    'Giáp': 'Jia', 'Ất': 'Yi', 'Bính': 'Bing', 'Đinh': 'Ding', 'Mậu': 'Wu',
    'Kỷ': 'Ji', 'Canh': 'Geng', 'Tân': 'Xin', 'Nhâm': 'Ren', 'Quý': 'Gui'
  };
  const PINYIN_TO_VN_STEM = {
    'Jia': 'Giáp', 'Yi': 'Ất', 'Bing': 'Bính', 'Ding': 'Đinh', 'Wu': 'Mậu',
    'Ji': 'Kỷ', 'Geng': 'Canh', 'Xin': 'Tân', 'Ren': 'Nhâm', 'Gui': 'Quý'
  };

  const BRANCHES_12 = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  const BRANCH_PINYIN = {
    'Tý': 'Zi', 'Sửu': 'Chou', 'Dần': 'Yin', 'Mão': 'Mao', 'Thìn': 'Chen', 'Tỵ': 'Si',
    'Ngọ': 'Wu', 'Mùi': 'Wei', 'Thân': 'Shen', 'Dậu': 'You', 'Tuất': 'Xu', 'Hợi': 'Hai'
  };
  const PINYIN_TO_VN_BRANCH = {
    'Zi': 'Tý', 'Chou': 'Sửu', 'Yin': 'Dần', 'Mao': 'Mao', 'Chen': 'Thìn', 'Si': 'Tỵ',
    'Wu': 'Ngọ', 'Wei': 'Mùi', 'Shen': 'Thân', 'You': 'Dậu', 'Xu': 'Tuất', 'Hai': 'Hợi'
  };

  const PALACES = {
    1: { id: 1, name: 'Khảm', pinyin: 'Kan', direction: 'Bắc', degrees: '337.5° - 22.5°', centerDeg: 0, element: 'Thủy', branches: ['Tý'] },
    2: { id: 2, name: 'Khôn', pinyin: 'Kun', direction: 'Tây Nam', degrees: '202.5° - 247.5°', centerDeg: 225, element: 'Thổ', branches: ['Mùi', 'Thân'] },
    3: { id: 3, name: 'Chấn', pinyin: 'Zhen', direction: 'Đông', degrees: '67.5° - 112.5°', centerDeg: 90, element: 'Mộc', branches: ['Mão'] },
    4: { id: 4, name: 'Tốn', pinyin: 'Xun', direction: 'Đông Nam', degrees: '112.5° - 157.5°', centerDeg: 135, element: 'Mộc', branches: ['Thìn', 'Tỵ'] },
    5: { id: 5, name: 'Trung Cung', pinyin: 'Center', direction: 'Trung Cung', degrees: 'Trung Tâm', centerDeg: 0, element: 'Thổ', branches: [] },
    6: { id: 6, name: 'Càn', pinyin: 'Qian', direction: 'Tây Bắc', degrees: '292.5° - 337.5°', centerDeg: 315, element: 'Kim', branches: ['Tuất', 'Hợi'] },
    7: { id: 7, name: 'Đoài', pinyin: 'Dui', direction: 'Tây', degrees: '247.5° - 292.5°', centerDeg: 270, element: 'Kim', branches: ['Dậu'] },
    8: { id: 8, name: 'Cấn', pinyin: 'Gen', direction: 'Đông Bắc', degrees: '22.5° - 67.5°', centerDeg: 45, element: 'Thổ', branches: ['Sửu', 'Dần'] },
    9: { id: 9, name: 'Ly', pinyin: 'Li', direction: 'Nam', degrees: '157.5° - 202.5°', centerDeg: 180, element: 'Hỏa', branches: ['Ngọ'] }
  };

  const DOORS_META = {
    'Khai':     { vn: 'Khai Môn', en: 'Open Door', element: 'Kim', nature: 'Đại Cát', homePalace: 6, action: 'Hành động cởi mở, khai sáng bế tắc, đón nhận cơ hội mới, quang minh chính đại kiến tạo sự nghiệp.' },
    'Khai Môn': { vn: 'Khai Môn', en: 'Open Door', element: 'Kim', nature: 'Đại Cát', homePalace: 6, action: 'Hành động cởi mở, khai sáng bế tắc, đón nhận cơ hội mới, quang minh chính đại kiến tạo sự nghiệp.' },
    'Hưu':      { vn: 'Hưu Môn', en: 'Rest Door', element: 'Thủy', nature: 'Cát', homePalace: 1, action: 'Phong thái an nhiên, giải trừ căng thẳng, tìm kiếm bình an, phục hồi năng lượng và kết nối quý nhân.' },
    'Hưu Môn':  { vn: 'Hưu Môn', en: 'Rest Door', element: 'Thủy', nature: 'Cát', homePalace: 1, action: 'Phong thái an nhiên, giải trừ căng thẳng, tìm kiếm bình an, phục hồi năng lượng và kết nối quý nhân.' },
    'Sinh':     { vn: 'Sinh Môn', en: 'Life Door', element: 'Thổ', nature: 'Đại Cát', homePalace: 8, action: 'Sinh sôi nảy nở, tạo ra của cải tài lộc bền vững, khả năng tái sinh và biến tiềm năng thành hiện thực.' },
    'Sinh Môn': { vn: 'Sinh Môn', en: 'Life Door', element: 'Thổ', nature: 'Đại Cát', homePalace: 8, action: 'Sinh sôi nảy nở, tạo ra của cải tài lộc bền vững, khả năng tái sinh và biến tiềm năng thành hiện thực.' },
    'Thương':   { vn: 'Thương Môn', en: 'Harm Door', element: 'Mộc', nature: 'Hung', homePalace: 3, action: 'Hành động dũng mãnh, dám đương đầu cạnh tranh, giải quyết nợ nần, truy cầu mục tiêu quyết liệt.' },
    'Thương Môn': { vn: 'Thương Môn', en: 'Harm Door', element: 'Mộc', nature: 'Hung', homePalace: 3, action: 'Hành động dũng mãnh, dám đương đầu cạnh tranh, giải quyết nợ nần, truy cầu mục tiêu quyết liệt.' },
    'Đỗ':       { vn: 'Đỗ Môn', en: 'Delusion Door', element: 'Mộc', nature: 'Bình Hòa (Bảo Mật)', homePalace: 4, action: 'Bảo mật thông tin, ẩn mình nghiên cứu chuyên sâu, ngăn ngừa rò rỉ và giữ kín kế hoạch chiến lược.' },
    'Đỗ Môn':   { vn: 'Đỗ Môn', en: 'Delusion Door', element: 'Mộc', nature: 'Bình Hòa (Bảo Mật)', homePalace: 4, action: 'Bảo mật thông tin, ẩn mình nghiên cứu chuyên sâu, ngăn ngừa rò rỉ và giữ kín kế hoạch chiến lược.' },
    'Cảnh':     { vn: 'Cảnh Môn', en: 'Scenery Door', element: 'Hỏa', nature: 'Thứ Cát (Hiển Lộ)', homePalace: 9, action: 'Quảng bá danh tiếng, kế hoạch truyền thông nổi bật, ký kết văn bản pháp lý, yến tiệc giao lưu.' },
    'Cảnh Môn': { vn: 'Cảnh Môn', en: 'Scenery Door', element: 'Hỏa', nature: 'Thứ Cát (Hiển Lộ)', homePalace: 9, action: 'Quảng bá danh tiếng, kế hoạch truyền thông nổi bật, ký kết văn bản pháp lý, yến tiệc giao lưu.' },
    'Tử':       { vn: 'Tử Môn', en: 'Death Door', element: 'Thổ', nature: 'Đại Hung', homePalace: 2, action: 'Sự kiên định không lay chuyển, xử lý bất động sản, kết thúc dứt khoát, gắn liền với tâm linh sâu kín.' },
    'Tử Môn':   { vn: 'Tử Môn', en: 'Death Door', element: 'Thổ', nature: 'Đại Hung', homePalace: 2, action: 'Sự kiên định không lay chuyển, xử lý bất động sản, kết thúc dứt khoát, gắn liền với tâm linh sâu kín.' },
    'Kinh':     { vn: 'Kinh Môn', en: 'Fear Door', element: 'Kim', nature: 'Hung', homePalace: 7, action: 'Gây kinh ngạc cảnh báo, tranh biện pháp lý, cảnh giác cao độ trước những biến động bất ngờ.' },
    'Kinh Môn': { vn: 'Kinh Môn', en: 'Fear Door', element: 'Kim', nature: 'Hung', homePalace: 7, action: 'Gây kinh ngạc cảnh báo, tranh biện pháp lý, cảnh giác cao độ trước những biến động bất ngờ.' }
  };

  const STARS_META = {
    'Thiên Bồng': { vn: 'Thiên Bồng', element: 'Thủy', nature: 'Đại Hung', intellect: 'Tư duy mạo hiểm, dám chấp nhận rủi ro lớn, đầu óc kinh doanh nhạy bén, thích khám phá vùng nước sâu bí ẩn.' },
    'Thiên Nhuế': { vn: 'Thiên Nhuế', element: 'Thổ', nature: 'Đại Hung (Học Vấn & Y Đạo)', intellect: 'Đầu óc tỉ mỉ nghiên cứu căn nguyên vấn đề, tố chất thầy thuốc khám chữa bệnh, chuyên gia phân tích và đào tạo.' },
    'Thiên Xung': { vn: 'Thiên Xung', element: 'Mộc', nature: 'Thứ Cát', intellect: 'Phản xạ chớp nhoáng, tư duy tốc độ, dũng cảm tiên phong mở đường, dám làm dám chịu và tràn đầy xung lực.' },
    'Thiên Phụ':  { vn: 'Thiên Phụ', element: 'Mộc', nature: 'Đại Cát', intellect: 'Trí tuệ học thuật uyên bác, phong thái văn nhân thanh nhã, năng lực truyền thụ tri thức và bồi dưỡng nhân tài.' },
    'Thiên Cầm':  { vn: 'Thiên Cầm', element: 'Thổ', nature: 'Đại Cát', intellect: 'Tư duy quân bình, lòng trung chính công tâm, năng lực quy tụ lòng người và điều phối tổng thể đại cục.' },
    'Thiên Tâm':  { vn: 'Thiên Tâm', element: 'Kim', nature: 'Đại Cát', intellect: 'Tư duy chiến lược gia, mưu lược đại tài, khả năng quản trị vĩ mô, tố chất lãnh đạo dẫn dắt và cứu thế.' },
    'Thiên Trụ':  { vn: 'Thiên Trụ', element: 'Kim', nature: 'Hung', intellect: 'Tư duy phản biện sắc bén, tài năng hùng biện tranh luận, nhìn thấu lỗ hổng của đối phương, hợp đàm phán luật pháp.' },
    'Thiên Nhậm': { vn: 'Thiên Nhậm', element: 'Thổ', nature: 'Đại Cát', intellect: 'Tư duy thực tế kiên nhẫn, cần cù liêm chính, năng lực tích lũy tài nguyên và gây dựng nền tảng vững chắc.' },
    'Thiên Anh':  { vn: 'Thiên Anh', element: 'Hỏa', nature: 'Bình Hòa', intellect: 'Tư duy thẩm mỹ sáng tạo, say mê cái đẹp và danh vọng, có năng khiếu nghệ thuật, biểu diễn và quảng bá hình ảnh.' },
    'Thiên Nhuế/Thiên Cầm': { vn: 'Thiên Nhuế & Thiên Cầm', element: 'Thổ', nature: 'Cầm Nhuế Đồng Cung (Cát Hung Đồng Tọa)', intellect: 'Tư duy nghiên cứu tỉ mỉ, đào sâu căn nguyên bản chất (Thiên Nhuế) kết hợp đức tính trung chính công tâm, năng lực quy tụ và điều phối đại cục (Thiên Cầm).' },
    'Thiên Cầm/Thiên Nhuế': { vn: 'Thiên Cầm & Thiên Nhuế', element: 'Thổ', nature: 'Cầm Nhuế Đồng Cung (Cát Hung Đồng Tọa)', intellect: 'Lòng trung chính công tâm, năng lực điều phối quy tụ vạn sự (Thiên Cầm) kết hợp khả năng phân tích tỉ mỉ, thấu đáo căn nguyên vấn đề (Thiên Nhuế).' }
  };

  const DEITIES_META = {
    'Trực Phù': {
      vn: 'Trực Phù', en: 'The Chief', nature: 'Cát Lợi Tối Cao',
      title: 'Thần Bảo Hộ Tối Cao & Hào Quang Vũ Trụ',
      subconscious_power: 'Khả năng lãnh đạo bẩm sinh, thu hút quý nhân trợ lực, chuyển nguy thành an, tâm nguyện lành được vũ trụ hồi đáp.',
      affirmation: 'Kết nối với Bậc Đạo Sư & Tâm Thức Tối Cao, tâm sáng dẫn lối, vạn chướng tiêu trừ, sở nguyện tòng tâm.',
      spiritual_focus: 'Nạp năng lượng bảo hộ tối thượng của vũ trụ, thanh lọc hào quang, tiêu trừ nghiệp lực và chướng ngại.',
      advice: 'Hãy luôn khởi tâm đại từ bi và phát nguyện chân thành trước khi hành động, bạn sẽ được trường năng lượng tối cao tương trợ.'
    },
    'Đằng Xà': {
      vn: 'Đằng Xà', en: 'Surging Snake', nature: 'Biến Hóa & Linh Cảm',
      title: 'Thần Biến Hóa & Giác Quan Thứ Sáu',
      subconscious_power: 'Trực giác tâm linh siêu nhạy bén, linh tính dự báo biến động, khả năng ứng biến linh hoạt và làm chủ sự bất định.',
      affirmation: 'Lắng nghe trực giác tĩnh lặng, nhìn thấu dịch chuyển vô hình, làm chủ năng lượng chuyển hóa.',
      spiritual_focus: 'Khai mở linh giác, rèn luyện sự nhạy cảm năng lượng, thanh tẩy ảo giác và chuyển hóa bất an.',
      advice: 'Tin tưởng vào giác quan thứ sáu đầu tiên nảy sinh trong tâm trí, đồng thời giữ tâm bình thản để không bị hoang mang.'
    },
    'Thái Âm': {
      vn: 'Thái Âm', en: 'Great Moon', nature: 'Trí Huệ & Tĩnh Lặng',
      title: 'Thần Trí Huệ Ẩn & Chữa Lành Nội Tâm',
      subconscious_power: 'Tư duy sâu sắc, trí tuệ mưu lược kín đáo, khả năng tự chữa lành, khai mở trực giác thấu suốt và định tâm.',
      affirmation: 'Trí huệ như ánh trăng vằng vặc, tĩnh lặng soi sáng, thấu tỏ cội nguồn, tâm an trí sáng.',
      spiritual_focus: 'Tĩnh tâm tuyệt đối, đi sâu vào tầng định thiền quán, chữa lành tổn thương và tái sinh tuệ giác.',
      advice: 'Dành không gian yên tĩnh chiêm nghiệm trước khi đưa ra quyết sách, sức mạnh lớn nhất của bạn đến từ sự tĩnh lặng.'
    },
    'Lục Hợp': {
      vn: 'Lục Hợp', en: 'Six Harmony', nature: 'Hòa Hợp & Kết Nối',
      title: 'Thần Hòa Duyên & Kết Nối Nhân Duyên',
      subconscious_power: 'Kỹ năng thấu cảm, gắn kết các mối quan hệ, hòa giải mâu thuẫn, xây dựng đồng minh và thu hút sự hợp tác bền vững.',
      affirmation: 'Tâm từ tỏa rạng, gieo duyên thiện lành, vạn vật tương hợp, đón nhận sự đồng thuận và yêu thương.',
      spiritual_focus: 'Quán chiếu tâm từ bi, hàn gắn các mối quan hệ rạn nứt, lan tỏa tình thương và sự hòa hợp.',
      advice: 'Tận dụng sức mạnh kết nối và tinh thần đội nhóm; sự hòa thuận và hợp tác chính là chìa khóa mở ra cánh cửa thành công.'
    },
    'Bạch Hổ': {
      vn: 'Bạch Hổ', en: 'White Tiger', nature: 'Dũng Khí & Sức Mạnh',
      title: 'Thần Dũng Mãnh & Thể Lực Vô Song',
      subconscious_power: 'Ý chí kiên cường, sức chịu đựng phi thường, nguồn năng lượng thể chất bùng nổ, không lùi bước trước hiểm nguy.',
      affirmation: 'Dũng khí kiên định như kim cương, sức mạnh vô song, bứt phá mọi rào cản và chướng ngại.',
      spiritual_focus: 'Nạp năng lượng hỏa nhiệt dũng mãnh, đập tan nỗi sợ hãi, tôi luyện ý chí và phục hồi thể lực dẻo dai.',
      advice: 'Biến áp lực thành động lực đột phá; chú ý kiểm soát sự nóng nảy để chuyển hóa dũng khí thành hành động chuẩn xác.'
    },
    'Câu Trần': {
      vn: 'Câu Trần', en: 'Grappling Hook', nature: 'Kiên Định & Vững Chãi',
      title: 'Thần Kiên Nhẫn & Bám Trụ Vững Vàng',
      subconscious_power: 'Sức bền phi thường, năng lực chịu đựng và giải quyết các vấn đề phức tạp, bám đuổi mục tiêu đến cùng.',
      affirmation: 'Tâm bất biến giữa dòng đời vạn biến, bám chắc mục tiêu, kiên trì ắt thành tựu.',
      spiritual_focus: 'Thiền định định tâm, tháo gỡ các nút thắt năng lượng bị ứ trệ, tái lập sự ổn định.',
      advice: 'Học cách buông bỏ những điều không thể thay đổi để giải phóng năng lượng trì trệ, tập trung vào trọng tâm.'
    },
    'Huyền Vũ': {
      vn: 'Huyền Vũ', en: 'Black Tortoise', nature: 'Thấu Cảm & Thuyết Phục',
      title: 'Thần Thấu Tâm & Thuật Thuyết Phục',
      subconscious_power: 'Khả năng đọc vị tâm lý người khác, nghệ thuật truyền cảm hứng và thuyết phục lôi cuốn, nắm bắt cơ hội ngầm.',
      affirmation: 'Thấu cảm nhân tâm, tâm ý nhu hòa như dòng nước, chuyển hóa lòng người bằng sự thấu hiểu sâu sắc.',
      spiritual_focus: 'Quán chiếu sự thật, thanh lọc ảo tưởng, thức tỉnh năng lực phân định chân giả sắc bén.',
      advice: 'Sử dụng tài năng thấu cảm và thuyết phục vì mục đích thiện lương; luôn giữ sự minh bạch để xây dựng uy tín lâu bền.'
    },
    'Chu Tước': {
      vn: 'Chu Tước', en: 'Red Phoenix', nature: 'Hiển Lộ & Truyền Thông',
      title: 'Thần Hùng Biện & Lan Tỏa Danh Tiếng',
      subconscious_power: 'Tài hùng biện sắc bén, khả năng lan tỏa thông điệp mạnh mẽ, gây dựng danh tiếng và truyền cảm hứng cộng đồng.',
      affirmation: 'Lời nói mang ánh sáng chân lý, khai sáng tâm trí, lan tỏa thông điệp tích cực đến muôn nơi.',
      spiritual_focus: 'Khai mở luân xa cổ họng (năng lượng khẩu nghiệp thiện lành), quán tưởng ánh sáng rực rỡ soi chiếu tâm thức.',
      advice: 'Cẩn trọng trong lời ăn tiếng nói, hướng tài năng truyền thông vào việc chia sẻ tri thức và nâng đỡ người khác.'
    },
    'Cửu Địa': {
      vn: 'Cửu Địa', en: 'Nine Earth', nature: 'Nuôi Dưỡng & An Định',
      title: 'Thần Tiếp Đất & Nuôi Dưỡng Vững Chãi',
      subconscious_power: 'Sự kiên nhẫn sâu dày, khả năng tích lũy tài sản và tài nguyên lâu dài, lòng bao dung nuôi dưỡng và nâng đỡ.',
      affirmation: 'Tâm an vững như lòng đại địa, bao dung nuôi dưỡng muôn loài, tích tụ phúc đức và tài nguyên trường tồn.',
      spiritual_focus: 'Thiền tiếp đất (Grounding), hấp thu sinh khí của đất mẹ, làm dịu tâm trí và nạp năng lượng bình an.',
      advice: 'Đi từng bước vững chắc, tích lũy theo thời gian; sự điềm tĩnh và nền tảng gốc rễ chính là chỗ dựa vững chắc nhất của bạn.'
    },
    'Cửu Thiên': {
      vn: 'Cửu Thiên', en: 'Nine Heaven', nature: 'Viễn Kiến & Khai Phóng',
      title: 'Thần Viễn Kiến & Sáng Tạo Bất Tận',
      subconscious_power: 'Tầm nhìn bao quát vượt thời không, tư duy đột phá không giới hạn, khát vọng vươn lên đỉnh cao và truyền cảm hứng.',
      affirmation: 'Tâm thức mở rộng vô biên như bầu trời, vươn cao đón nguồn sáng vô lượng, hiện thực hóa những kỳ tích phi thường.',
      spiritual_focus: 'Mở rộng tầng ý thức, kết nối nguồn cảm hứng vô tận của vũ trụ, kích hoạt tầm nhìn vĩ mô.',
      advice: 'Đừng để tư duy bị giới hạn bởi khuôn mẫu cũ; hãy đặt ra những mục tiêu lớn và kiên định bay cao hướng về lý tưởng.'
    }
  };

  const ELEMENT_PRODUCES = { 'Mộc': 'Hỏa', 'Hỏa': 'Thổ', 'Thổ': 'Kim', 'Kim': 'Thủy', 'Thủy': 'Mộc' };
  const ELEMENT_CONTROLS = { 'Mộc': 'Thổ', 'Thổ': 'Thủy', 'Thủy': 'Hỏa', 'Hỏa': 'Kim', 'Kim': 'Mộc' };

  // ==============================================================================
  // 2. 12 NGUYỆT TƯỚNG & 144 TỌA ĐỘ THÁI TRÙNG THIÊN MÃ (SECTIONS D & G)
  // ==============================================================================

  // Bảng 12 Nguyệt Tướng theo 24 Tiết Khí (Thái Dương Quá Cung)
  const SOLAR_TERM_TO_MONTH_GENERAL = {
    "Đại Hàn":   { name_vn: "Thần Hậu", branch: "Tý", month: 12, name_cn: "神后" },
    "Lập Xuân":  { name_vn: "Thần Hậu", branch: "Tý", month: 12, name_cn: "神后" },
    "Vũ Thủy":   { name_vn: "Đăng Minh", branch: "Hợi", month: 1, name_cn: "登明" },
    "Kinh Trập": { name_vn: "Đăng Minh", branch: "Hợi", month: 1, name_cn: "登明" },
    "Xuân Phân": { name_vn: "Hà Khôi", branch: "Tuất", month: 2, name_cn: "河魁" },
    "Thanh Minh":{ name_vn: "Hà Khôi", branch: "Tuất", month: 2, name_cn: "河魁" },
    "Cốc Vũ":    { name_vn: "Tòng Khôi", branch: "Dậu", month: 3, name_cn: "從魁" },
    "Lập Hạ":    { name_vn: "Tòng Khôi", branch: "Dậu", month: 3, name_cn: "從魁" },
    "Tiểu Mãn":  { name_vn: "Truyền Tống", branch: "Thân", month: 4, name_cn: "傳送" },
    "Mang Chủng":{ name_vn: "Truyền Tống", branch: "Thân", month: 4, name_cn: "傳送" },
    "Hạ Chí":    { name_vn: "Tiểu Cát", branch: "Mùi", month: 5, name_cn: "小吉" },
    "Tiểu Thử":  { name_vn: "Tiểu Cát", branch: "Mùi", month: 5, name_cn: "小吉" },
    "Đại Thử":   { name_vn: "Thắng Quang", branch: "Ngọ", month: 6, name_cn: "勝光" },
    "Lập Thu":   { name_vn: "Thắng Quang", branch: "Ngọ", month: 6, name_cn: "勝光" },
    "Xử Thử":    { name_vn: "Thái Ất", branch: "Tỵ", month: 7, name_cn: "太乙" },
    "Bạch Lộ":   { name_vn: "Thái Ất", branch: "Tỵ", month: 7, name_cn: "太乙" },
    "Thu Phân":  { name_vn: "Thiên Cương", branch: "Thìn", month: 8, name_cn: "天罡" },
    "Hàn Lộ":    { name_vn: "Thiên Cương", branch: "Thìn", month: 8, name_cn: "天罡" },
    "Sương Giáng":{ name_vn: "Thái Trùng", branch: "Mão", month: 9, name_cn: "太衝" },
    "Lập Đông":  { name_vn: "Thái Trùng", branch: "Mão", month: 9, name_cn: "太衝" },
    "Tiểu Tuyết":{ name_vn: "Công Tào", branch: "Dần", month: 10, name_cn: "功曹" },
    "Đại Tuyết": { name_vn: "Công Tào", branch: "Dần", month: 10, name_cn: "功曹" },
    "Đông Chí":  { name_vn: "Đại Cát", branch: "Sửu", month: 11, name_cn: "大吉" },
    "Tiểu Hàn":  { name_vn: "Đại Cát", branch: "Sửu", month: 11, name_cn: "大吉" }
  };

  const LUNAR_MONTH_GENERALS = [
    { month: 1, name_vn: "Đăng Minh", branch: "Hợi", pinyin: "Deng Ming" },
    { month: 2, name_vn: "Hà Khôi", branch: "Tuất", pinyin: "He Kui" },
    { month: 3, name_vn: "Tòng Khôi", branch: "Dậu", pinyin: "Cong Kui" },
    { month: 4, name_vn: "Truyền Tống", branch: "Thân", pinyin: "Chuan Song" },
    { month: 5, name_vn: "Tiểu Cát", branch: "Mùi", pinyin: "Xiao Ji" },
    { month: 6, name_vn: "Thắng Quang", branch: "Ngọ", pinyin: "Sheng Guang" },
    { month: 7, name_vn: "Thái Ất", branch: "Tỵ", pinyin: "Tai Yi" },
    { month: 8, name_vn: "Thiên Cương", branch: "Thìn", pinyin: "Tian Gang" },
    { month: 9, name_vn: "Thái Trùng", branch: "Mão", pinyin: "Tai Chong" },
    { month: 10, name_vn: "Công Tào", branch: "Dần", pinyin: "Gong Cao" },
    { month: 11, name_vn: "Đại Cát", branch: "Sửu", pinyin: "Da Ji" },
    { month: 12, name_vn: "Thần Hậu", branch: "Tý", pinyin: "Shen Hou" }
  ];

  function getMonthGeneral(solarTermOrMonth) {
    if (typeof solarTermOrMonth === 'string' && SOLAR_TERM_TO_MONTH_GENERAL[solarTermOrMonth]) {
      return SOLAR_TERM_TO_MONTH_GENERAL[solarTermOrMonth];
    }
    const m = parseInt(solarTermOrMonth) || 1;
    const clampedM = Math.max(1, Math.min(12, m));
    return LUNAR_MONTH_GENERALS[clampedM - 1];
  }

  /**
   * Tính tọa độ Thái Trùng Thiên Mã (144 Tọa Độ Ma Trận)
   * Thuật toán: Đặt Nguyệt Tướng lên Chi Giờ, thuận hành tìm vị trí của Mão (Thái Trùng).
   */
  function getGreatMinisterSkyHorse(monthGenBranch, hourBranch) {
    const normBranch = (b) => {
      if (!b) return 'Tý';
      const s = String(b).trim();
      return (s === 'Tị') ? 'Tỵ' : s;
    };

    const mBranch = normBranch(monthGenBranch);
    const hBranch = normBranch(hourBranch);

    const genIdx = BRANCHES_12.indexOf(mBranch);
    const hourIdx = BRANCHES_12.indexOf(hBranch);
    const maoIdx = BRANCHES_12.indexOf("Mão");

    if (genIdx === -1 || hourIdx === -1) {
      return {
        sky_horse_branch: "Mão",
        palace_id: 3,
        palace_name: PALACES[3].name,
        direction: PALACES[3].direction,
        strategic_effect: "Bến cảng trong giông bão, giải vây cấp tốc, thoát hiểm an toàn khi đối mặt áp lực."
      };
    }

    const offset = (maoIdx - genIdx + 12) % 12;
    const targetBranchIdx = (hourIdx + offset) % 12;
    const targetBranch = BRANCHES_12[targetBranchIdx];

    let targetPalace = 3;
    for (const [pid, pinfo] of Object.entries(PALACES)) {
      if (pinfo.branches && pinfo.branches.includes(targetBranch)) {
        targetPalace = parseInt(pid);
        break;
      }
    }

    return {
      sky_horse_branch: targetBranch,
      palace_id: targetPalace,
      palace_name: PALACES[targetPalace].name,
      direction: PALACES[targetPalace].direction,
      strategic_effect: "Bến cảng trong giông bão, giải vây cấp tốc, thoát hiểm an toàn khi đối mặt áp lực."
    };
  }

  // ==============================================================================
  // 3. BỘ LỌC PHỦ QUYẾT NGŨ BẤT NGỘ THỜI (FIVE DISHARMONY HOUR - VETO)
  // ==============================================================================

  const FIVE_DISHARMONY_MAP = {
    'Giáp': 'Canh',
    'Ất': 'Tân',
    'Bính': 'Nhâm',
    'Đinh': 'Quý',
    'Mậu': 'Giáp',
    'Kỷ': 'Ất',
    'Canh': 'Bính',
    'Tân': 'Đinh',
    'Nhâm': 'Mậu',
    'Quý': 'Kỷ'
  };

  function isFiveDisharmonyHour(dayStem, hourStem) {
    const cleanDay = (dayStem || '').trim();
    const cleanHour = (hourStem || '').trim();
    return FIVE_DISHARMONY_MAP[cleanDay] === cleanHour;
  }

  // ==============================================================================
  // 4. THUẬT TOÁN KỲ MÔN TAM THẮNG (THE THREE VICTORIES - P. 864)
  // ==============================================================================

  function evaluateThreeVictoryPalaces(chiefPalace, nineHeavenPalace, lifeDoorPalace) {
    const firstVic = {
      rank: 1,
      name: "Đệ Nhất Thắng (Trực Phù Cung)",
      palace_id: chiefPalace,
      palace_name: PALACES[chiefPalace].name,
      direction: PALACES[chiefPalace].direction,
      essence: "Quân vương hộ trì, uy quyền tối thượng, bách chiến bách thắng."
    };

    const secondVic = {
      rank: 2,
      name: "Đệ Nhị Thắng (Cửu Thiên Cung)",
      palace_id: nineHeavenPalace,
      palace_name: PALACES[nineHeavenPalace].name,
      direction: PALACES[nineHeavenPalace].direction,
      essence: "Dương binh thanh thế, tầm nhìn chiến lược vươn xa, thuyết phục áp đảo."
    };

    const thirdVic = {
      rank: 3,
      name: "Đệ Tam Thắng (Sinh Môn Cung)",
      palace_id: lifeDoorPalace,
      palace_name: PALACES[lifeDoorPalace].name,
      direction: PALACES[lifeDoorPalace].direction,
      essence: "Sinh khí dồi dào, tối đa hóa lợi nhuận tài chính, bảo toàn cơ nghiệp."
    };

    const convergences = [];
    if (chiefPalace === nineHeavenPalace && nineHeavenPalace === lifeDoorPalace) {
      convergences.push("TAM THẮNG ĐỒNG CUNG (Đại uy lực tối thượng hiếm có)");
    } else {
      if (chiefPalace === lifeDoorPalace) convergences.push("Trực Phù hội Sinh Môn (Đệ Nhất + Đệ Tam Thắng Đồng Cung)");
      if (chiefPalace === nineHeavenPalace) convergences.push("Trực Phù hội Cửu Thiên (Đệ Nhất + Đệ Nhị Thắng Đồng Cung)");
      if (nineHeavenPalace === lifeDoorPalace) convergences.push("Cửu Thiên hội Sinh Môn (Đệ Nhị + Đệ Tam Thắng Đồng Cung: Thanh thế + Tài lộc)");
    }

    return {
      first_victory: firstVic,
      second_victory: secondVic,
      third_victory: thirdVic,
      convergences,
      is_converged: convergences.length > 0,
      rule: "Người chủ sự bắt buộc ngồi quay lưng (Back-Facing) vào một trong ba cung vị này."
    };
  }

  // ==============================================================================
  // 5. THUẬT TOÁN NGŨ BẤT KÍCH (FIVE NON-STRIKING PALACES - P. 865)
  // ==============================================================================

  function evaluateFiveNonStriking(chiefPalace, nineHeavenPalace, lifeDoorPalace, nineEarthPalace, envoyPalace) {
    const list = [
      { palace_id: chiefPalace, name: "Trực Phù (Thiên Ất)" },
      { palace_id: nineHeavenPalace, name: "Cửu Thiên" },
      { palace_id: lifeDoorPalace, name: "Sinh Môn" },
      { palace_id: nineEarthPalace, name: "Cửu Địa" },
      { palace_id: envoyPalace, name: "Trực Sử" }
    ];

    const uniqueSectors = {};
    list.forEach(item => {
      const pid = item.palace_id;
      if (PALACES[pid]) {
        if (!uniqueSectors[pid]) {
          uniqueSectors[pid] = {
            palace_id: pid,
            palace_name: PALACES[pid].name,
            direction: PALACES[pid].direction,
            reasons: [item.name]
          };
        } else {
          uniqueSectors[pid].reasons.push(item.name);
        }
      }
    });

    return {
      restricted_sectors: Object.values(uniqueSectors),
      warning: "Tuyệt đối không đối đầu trực diện, ép giá hoặc khởi kiện vào các phương vị này."
    };
  }

  // ==============================================================================
  // 6. THUẬT TOÁN DU TAM TỊ NGŨ & MÔN CUNG HÒA NGHĨA
  // ==============================================================================

  function evaluateSwaying3Evading5(chiefPalace) {
    if (chiefPalace === 3) {
      return {
        status: "SWAYING_3",
        score: 20,
        message: "Du Tam: Trực Phù đáo Chấn Cung 3: Kế hoạch nở rộ, đơm hoa kết trái (+20đ)."
      };
    }
    if (chiefPalace === 5) {
      return {
        status: "EVADING_5",
        score: -30,
        message: "Tị Ngũ: Trực Phù nhập Trung Cung 5: Nguy cơ đình trệ bế tắc nghiêm trọng (-30đ)."
      };
    }
    return { status: "NORMAL", score: 0, message: `Trực Phù đáo Cung ${chiefPalace}` };
  }

  function evaluateDoorPalaceHarmony(doorName, palaceId) {
    const dClean = (doorName || '').replace(' Môn', '').trim();
    const dMeta = DOORS_META[dClean] || DOORS_META['Khai'];
    const pMeta = PALACES[palaceId] || PALACES[1];

    const dElem = dMeta.element;
    const pElem = pMeta.element;

    if (dElem === pElem) {
      return { stage: "Tỷ Hòa", score: 8, desc: `Cùng hành ${dElem} tương trợ, tiến triển ổn định (+8đ).` };
    }
    if (ELEMENT_PRODUCES[dElem] === pElem) {
      return { stage: "Hòa (Môn sinh Cung)", score: 15, desc: `Môn (${dElem}) sinh Cung (${pElem}): Môi trường tiếp nhận tích cực (+15đ).` };
    }
    if (ELEMENT_PRODUCES[pElem] === dElem) {
      return { stage: "Nghĩa (Cung sinh Môn)", score: 15, desc: `Cung (${pElem}) sinh Môn (${dElem}): Nền tảng hậu thuẫn vững vàng, quý nhân trợ lực (+15đ).` };
    }
    if (ELEMENT_CONTROLS[dElem] === pElem) {
      return { stage: "Môn Bách (Môn khắc Cung)", score: -20, desc: `Môn (${dElem}) khắc Cung (${pElem}): Nội bộ tranh chấp, trở ngại nghiêm trọng (-20đ).` };
    }
    if (ELEMENT_CONTROLS[pElem] === dElem) {
      return { stage: "Cung Bức (Cung khắc Môn)", score: -15, desc: `Cung (${pElem}) khắc Môn (${dElem}): Bị kiềm chế từ bên ngoài, khó phát huy (-15đ).` };
    }
    return { stage: "Bình", score: 0, desc: "Trạng thái bình thường." };
  }

  // ==============================================================================
  // 7. THƯ VIỆN NHẬN DIỆN 76 CÁCH CỤC TOÀN THƯ (76 FORMATIONS ENGINE)
  // ==============================================================================

  function scanPalaceFormations(pId, hStem, eStem, door, deity, star, isEnvoy) {
    const list = [];
    const h = (hStem || '').trim();
    const e = (eStem || '').trim();
    const d = (door || '').replace(' Môn', '').trim();
    const dei = (deity || '').trim();
    const s = (star || '').trim();

    // 1. TAM CÁT BẢO (THREE PRECIOUS)
    if (h === 'Mậu' && e === 'Bính') {
      list.push({ code: 'F01', name_vn: 'Thanh Long Phản Thủ', nature: 'Đại Cát', score: 30, desc: 'Vạn sự hanh thông, gặp quý nhân nâng đỡ, thăng tiến vượt bậc.' });
    }
    if (h === 'Bính' && e === 'Mậu') {
      list.push({ code: 'F02', name_vn: 'Phi Điểu Điệt Huyệt', nature: 'Đại Cát', score: 30, desc: 'Cơ hội vàng tự tìm đến, không tốn nhiều công sức mà thu hoạch trọn vẹn.' });
    }
    if (h === 'Đinh' && isEnvoy) {
      list.push({ code: 'F03', name_vn: 'Ngọc Nữ Thủ Môn', nature: 'Cát Lợi', score: 25, desc: 'Lợi cho đàm phán riêng tư, hôn nhân, tiệc tùng ăn mừng, bảo mật hậu trường.' });
    }

    // 2. CỬU ĐỘN (NINE DUN)
    if (h === 'Bính' && e === 'Đinh' && d === 'Khai') {
      list.push({ code: 'F04', name_vn: 'Thiên Độn', nature: 'Đại Cát', score: 25, desc: 'Đắc thiên thời, đại lợi mở rộng kinh doanh, xuất hành, thăng quan.' });
    }
    if (h === 'Ất' && e === 'Kỷ' && d === 'Khai') {
      list.push({ code: 'F05', name_vn: 'Địa Độn', nature: 'Đại Cát', score: 25, desc: 'Đắc địa lợi, vững chắc tài sản, xây dựng bất động sản, phòng thủ kiên cố.' });
    }
    if (h === 'Đinh' && dei === 'Thái Âm' && d === 'Hưu') {
      list.push({ code: 'F06', name_vn: 'Nhân Độn', nature: 'Đại Cát', score: 25, desc: 'Đắc nhân hòa, quý nhân phò trợ, tuyển dụng nhân tài, giải quyết tranh chấp.' });
    }
    if (h === 'Ất' && pId === 4 && ['Khai', 'Hưu', 'Sinh'].includes(d)) {
      list.push({ code: 'F07', name_vn: 'Phong Độn', nature: 'Cát Lợi', score: 20, desc: 'Thuận buồm xuôi gió, truyền thông lan tỏa, bán hàng thần tốc.' });
    }
    if (h === 'Ất' && e === 'Tân' && d === 'Sinh') {
      list.push({ code: 'F08', name_vn: 'Vân Độn', nature: 'Cát Lợi', score: 20, desc: 'Mây lành che chở, ẩn giấu năng lượng, chờ thời cơ bứt phá.' });
    }
    if (h === 'Ất' && pId === 1 && d === 'Hưu') {
      list.push({ code: 'F09', name_vn: 'Long Độn', nature: 'Cát Lợi', score: 20, desc: 'Rồng ẩn nước sâu, đại lợi đầu tư tài chính, cầu mưa thuận gió hòa.' });
    }
    if (h === 'Tân' && pId === 8 && d === 'Sinh') {
      list.push({ code: 'F10', name_vn: 'Hổ Độn', nature: 'Cát Lợi', score: 20, desc: 'Hổ gầm rừng sâu, uy phong trấn áp đối thủ, thu hồi công nợ.' });
    }
    if (h === 'Bính' && dei === 'Cửu Thiên' && d === 'Sinh') {
      list.push({ code: 'F11', name_vn: 'Thần Độn', nature: 'Đại Cát', score: 25, desc: 'Thần linh hộ niệm, trực giác bén nhạy, công danh lẫy lừng.' });
    }
    if (h === 'Đinh' && dei === 'Cửu Địa' && d === 'Đỗ') {
      list.push({ code: 'F12', name_vn: 'Quỷ Độn', nature: 'Cát Lợi', score: 20, desc: 'Xuất quỷ nhập thần, che giấu tung tích hoàn hảo, đối thủ không thể nắm bắt.' });
    }

    // 3. TAM TRÁ & NGŨ GIẢ (DECEPTIONS & FALSITIES)
    if (['Khai', 'Hưu', 'Sinh'].includes(d) && dei === 'Thái Âm') {
      list.push({ code: 'F13', name_vn: 'Chân Trá', nature: 'Cát Lợi', score: 18, desc: 'Hành sự cơ mật, mượn sức người làm nên đại sự.' });
    }
    if (['Khai', 'Hưu', 'Sinh'].includes(d) && dei === 'Cửu Địa') {
      list.push({ code: 'F14', name_vn: 'Trọng Trá', nature: 'Cát Lợi', score: 18, desc: 'Thích hợp tích lũy vốn liếng, mua sắm tài sản, ẩn mình chờ thời.' });
    }
    if (['Khai', 'Hưu', 'Sinh'].includes(d) && dei === 'Lục Hợp') {
      list.push({ code: 'F15', name_vn: 'Hưu Trá', nature: 'Cát Lợi', score: 18, desc: 'Hòa giải tranh chấp, liên minh đối tác chiến lược.' });
    }
    if (['Khai', 'Hưu', 'Sinh'].includes(d) && dei === 'Cửu Thiên') {
      list.push({ code: 'F16', name_vn: 'Thiên Giả', nature: 'Thứ Cát', score: 15, desc: 'Hư trương thanh thế, phát động chiến dịch truyền thông.' });
    }
    if (d === 'Đỗ' && dei === 'Cửu Địa') {
      list.push({ code: 'F17', name_vn: 'Địa Giả', nature: 'Thứ Cát', score: 15, desc: 'Rút lui an toàn, bảo tồn tài chính trong khủng hoảng.' });
    }

    // 4. ĐẠI HUNG CÁCH (FIERCE INAUSPICIOUS FORMATIONS)
    if (h === 'Tân' && e === 'Ất') {
      list.push({ code: 'F49', name_vn: 'Bạch Hổ Thảng Cuồng', nature: 'Đại Hung', score: -30, desc: 'Khách hại Chủ, tai nạn xe cộ, thương tích đổ máu, đổ vỡ kinh doanh.' });
    }
    if (h === 'Quý' && e === 'Bính') {
      list.push({ code: 'F50', name_vn: 'Đằng Xà Yêu Kiều', nature: 'Đại Hung', score: -25, desc: 'Hỏa bốc Thủy khô, kiện tụng thị phi, lừa đảo hợp đồng, hoảng hốt.' });
    }
    if (h === 'Ất' && e === 'Tân') {
      list.push({ code: 'F51', name_vn: 'Thanh Long Đào Tẩu', nature: 'Đại Hung', score: -25, desc: 'Nô bộc phản bội, mất tiền hao tài, phân ly tan tác, nguy cơ phá sản.' });
    }
    if (h === 'Bính' && e === 'Quý') {
      list.push({ code: 'F52', name_vn: 'Chu Tước Đầu Giang', nature: 'Đại Hung', score: -25, desc: 'Văn tự thất lạc, tranh chấp pháp lý, thư tín bị phong tỏa, tai nạn sông nước.' });
    }
    if (h === 'Bính' && e === 'Canh') {
      list.push({ code: 'F53', name_vn: 'Huỳnh Hoặc Nhập Bạch', nature: 'Hung', score: -20, desc: 'Đề phòng trộm cướp, mất mát tài sản, đối thủ xâm nhập phá hoại.' });
    }
    if (h === 'Canh' && e === 'Bính') {
      list.push({ code: 'F54', name_vn: 'Thái Bạch Nhập Huỳnh', nature: 'Cát cho Tiến Công', score: 15, desc: 'Lợi thế chủ động tiến công, giặc tự tan rã, đánh chiếm thị phần.' });
    }

    // 5. LỤC NGHI KÍCH HÌNH & TAM KỲ NHẬP MỘ
    const STRIKES = {
      'Mậu_3': 'Mậu kích hình tại Chấn 3 (Tý Mão tương hình)',
      'Kỷ_2': 'Kỷ kích hình tại Khôn 2 (Tuất Mùi tương hình)',
      'Canh_8': 'Canh kích hình tại Cấn 8 (Thân Dần tương hình)',
      'Tân_9': 'Tân kích hình tại Ly 9 (Ngọ Ngọ tự hình)',
      'Nhâm_4': 'Nhâm kích hình tại Tốn 4 (Thìn Thìn tự hình)',
      'Quý_4': 'Quý kích hình tại Tốn 4 (Dần Tỵ tương hình)'
    };
    const strikeKey = `${h}_${pId}`;
    if (STRIKES[strikeKey]) {
      list.push({ code: 'F69', name_vn: 'Lục Nghi Kích Hình', nature: 'Đại Hung', score: -30, desc: `${STRIKES[strikeKey]}: Tổn hại thân thể, án phạt hoặc thiệt hại kinh tế nặng nề.` });
    }

    const GRAVES = {
      'Ất_6': 'Ất Kỳ nhập mộ tại Càn 6 (Ất Mộc mộ tại Tuất)',
      'Bính_6': 'Bính Kỳ nhập mộ tại Càn 6 (Bính Hỏa mộ tại Tuất)',
      'Đinh_8': 'Đinh Kỳ nhập mộ tại Cấn 8 (Đinh Hỏa mộ tại Sửu)'
    };
    const graveKey = `${h}_${pId}`;
    if (GRAVES[graveKey]) {
      list.push({ code: 'F67', name_vn: 'Tam Kỳ Nhập Mộ', nature: 'Hung Trệ', score: -25, desc: `${GRAVES[graveKey]}: Tài năng bị chôn vùi, bế tắc không lối thoát.` });
    }

    // 6. MÔN BÁCH & CUNG BỨC
    const harmony = evaluateDoorPalaceHarmony(d, pId);
    if (harmony.stage.includes('Môn Bách')) {
      list.push({ code: 'F73', name_vn: 'Môn Bách Cách', nature: 'Hung Họa', score: -20, desc: harmony.desc });
    } else if (harmony.stage.includes('Cung Bức')) {
      list.push({ code: 'F74', name_vn: 'Cung Bức Cách', nature: 'Hạn Chế', score: -15, desc: harmony.desc });
    }

    return list;
  }

  // ==============================================================================
  // 8. BÁT MÔN & CỬU TINH KHẮC ỨNG THỰC ĐỊA (SECTION H: EVIDENTIAL OMENS)
  // ==============================================================================

  const DOOR_OMENS = {
    'Khai': {
      door_vn: 'Khai Môn',
      prime_omen: 'Gặp quan chức, xe cộ sang trọng, tiền bạc, người mặc áo màu trắng hoặc vàng nhạt.',
      signals: ['Người cầm giấy tờ / hồ sơ / hợp đồng', 'Đoàn xe công vụ đi qua', 'Người đội mũ bảo hiểm/áo khoác sáng màu']
    },
    'Hưu': {
      door_vn: 'Hưu Môn',
      prime_omen: 'Gặp quý nhân hòa nhã, tăng ni đạo sĩ, người mang theo rượu thịt hoặc phụ nữ bế trẻ nhỏ.',
      signals: ['Người áo xanh lam hoặc đen', 'Thuyền bè hoặc mặt nước êm đềm', 'Tiếng cười đùa vui vẻ hòa thuận']
    },
    'Sinh': {
      door_vn: 'Sinh Môn',
      prime_omen: 'Gặp thương gia, tiền tài của cải, gia súc hoặc người mang thai / sinh nở.',
      signals: ['Người ôm bọc tiền / túi hàng hóa lớn', 'Cây cối đâm chồi nở hoa xanh tốt', 'Thú cưng hoặc vật nuôi khỏe mạnh']
    },
    'Thương': {
      door_vn: 'Thương Môn',
      prime_omen: 'Gặp người xô xát, va quẹt xe cộ, người khiêng vác gỗ củi hoặc tiếng gào thét.',
      signals: ['Tiếng còi phanh xe gấp', 'Người mang gậy gộc hoặc vật sắc nhọn', 'Người có vết thương tật ở chân']
    },
    'Đỗ': {
      door_vn: 'Đỗ Môn',
      prime_omen: 'Gặp người che mặt, cảnh sát ẩn mật, thợ mộc cưa gỗ, sương mù che phủ.',
      signals: ['Xe tuần tra chớp đèn', 'Cổng ngõ khóa kín', 'Người lén lút né tránh tầm nhìn']
    },
    'Cảnh': {
      door_vn: 'Cảnh Môn',
      prime_omen: 'Gặp người mặc áo đỏ, văn nhân nghệ sĩ, đám cưới, pháo hoa, bằng khen tài liệu.',
      signals: ['Ánh lửa bập bùng hoặc đèn rực rỡ', 'Nhạc hội / sự kiện rộn rã', 'Người mang tranh vẽ hoặc sách báo']
    },
    'Tử': {
      door_vn: 'Tử Môn',
      prime_omen: 'Gặp đám tang, người mặc đồ tang trắng, đồ sứ vỡ, người già yếu bệnh tật.',
      signals: ['Tiếng khóc than hoặc chuông đám ma', 'Mùi khói hương trầm nồng nặc', 'Xác động vật chết bên đường']
    },
    'Kinh': {
      door_vn: 'Kinh Môn',
      prime_omen: 'Gặp người cãi vã, chó sủa dữ dội, người cầm kim loại / chuông đồng, tin tức giật gân.',
      signals: ['Tiếng còi báo động khẩn cấp', 'Chó sủa rượt đuổi người', 'Tiếng kim loại va đập gay gắt']
    }
  };

  const STAR_OMENS = {
    'Thiên Bồng': { star_vn: 'Thiên Bồng', omen: 'Gặp mưa lớn, đàn cá bơi, kẻ trộm cắp, người mang ô dù màu đen.' },
    'Thiên Nhuế': { star_vn: 'Thiên Nhuế', omen: 'Gặp người đau bệnh, phụ nữ mang thai, thầy thuốc đông y, trâu bò cày ruộng.' },
    'Thiên Xung': { star_vn: 'Thiên Xung', omen: 'Gặp sấm sét, chim bay vút lên, tiếng trống dồn dập, người chạy thể thao.' },
    'Thiên Phụ':  { star_vn: 'Thiên Phụ', omen: 'Gặp thầy giáo, học sinh cắp sách, người cầm hoa sen, văn tự bằng cấp.' },
    'Thiên Cầm':  { star_vn: 'Thiên Cầm', omen: 'Gặp lãnh đạo vi hành, chim quý cất tiếng hót, đồ vật quý giá màu vàng.' },
    'Thiên Tâm':  { star_vn: 'Thiên Tâm', omen: 'Gặp thầy thuốc mang hòm thuốc, người tu đạo, người đeo trang sức vàng bạc.' },
    'Thiên Trụ':  { star_vn: 'Thiên Trụ', omen: 'Gặp gió lốc, chuông đồng ngân vang, người thổi sáo, đồ sắt gỉ sét vỡ đôi.' },
    'Thiên Nhậm': { star_vn: 'Thiên Nhậm', omen: 'Gặp nông dân vác cuốc, người gù lưng, bao tải lúa gạo, núi đá sừng sững.' },
    'Thiên Anh':  { star_vn: 'Thiên Anh', omen: 'Gặp ánh chớp, lửa cháy bập bùng, phụ nữ trang điểm lộng lẫy, người say rượu.' },
    'Thiên Nhuế/Thiên Cầm': { star_vn: 'Thiên Nhuế & Thiên Cầm', omen: 'Gặp thầy thuốc đông y, phụ nữ mang thai, đồng thời gặp người có uy quyền chính trực, đồ vật quý giá bằng đất hoặc kim loại màu vàng.' },
    'Thiên Cầm/Thiên Nhuế': { star_vn: 'Thiên Cầm & Thiên Nhuế', omen: 'Gặp người lãnh đạo điềm tĩnh, chim quý cất tiếng, kết hợp thấy thầy thuốc khám bệnh hoặc người mang sách thuốc.' }
  };

  /**
   * Phân giải chính xác thông tin Sao (hỗ trợ Cầm Nhuế đồng cung và tránh fallback mù quáng)
   */
  function resolveStarMeta(starRaw, roleTitle = '') {
    if (!starRaw) {
      if (roleTitle && roleTitle.includes('Sức Khỏe')) return STARS_META['Thiên Nhuế'];
      return STARS_META['Thiên Tâm'];
    }
    const clean = String(starRaw).trim();
    if (STARS_META[clean]) {
      if (roleTitle && roleTitle.includes('Sức Khỏe') && clean.includes('Thiên Nhuế')) {
        return STARS_META['Thiên Nhuế'];
      }
      return STARS_META[clean];
    }

    // Trường hợp Cầm Nhuế đồng cung
    if (clean.includes('Thiên Nhuế') && clean.includes('Thiên Cầm')) {
      if (roleTitle && roleTitle.includes('Sức Khỏe')) {
        return STARS_META['Thiên Nhuế'];
      }
      return STARS_META['Thiên Nhuế/Thiên Cầm'];
    }

    // Khớp đơn tinh trong chuỗi ghép
    for (const [k, v] of Object.entries(STARS_META)) {
      if (!k.includes('/') && clean.includes(k)) {
        return v;
      }
    }

    return {
      vn: clean || 'Thiên Tâm',
      element: 'Thổ',
      nature: 'Bình Hòa',
      intellect: 'Trí tuệ thích ứng linh hoạt theo thời cuộc và điều kiện ngoại cảnh.'
    };
  }

  function resolveStarOmen(starRaw) {
    if (!starRaw) return STAR_OMENS['Thiên Tâm'];
    const clean = String(starRaw).trim();
    if (STAR_OMENS[clean]) return STAR_OMENS[clean];
    if (clean.includes('Thiên Nhuế') && clean.includes('Thiên Cầm')) {
      return STAR_OMENS['Thiên Nhuế/Thiên Cầm'];
    }
    for (const [k, v] of Object.entries(STAR_OMENS)) {
      if (!k.includes('/') && clean.includes(k)) return v;
    }
    return STAR_OMENS['Thiên Tâm'];
  }

  function getEvidentialOmens(doorName, starName, direction) {
    const dClean = (doorName || '').replace(' Môn', '').trim();
    const dInfo = DOOR_OMENS[dClean] || DOOR_OMENS['Khai'];
    const sClean = (starName || '').trim();
    const sInfo = resolveStarOmen(sClean);

    return {
      direction_of_departure: direction || 'Bắc',
      door_omen: {
        door_name: dInfo.door_vn,
        prime_phenomenon: dInfo.prime_omen,
        signals: dInfo.signals
      },
      star_omen: {
        star_name: sInfo.star_vn,
        manifestation: sInfo.omen
      },
      verification_rule: "Khi xuất hành theo phương vị chỉ định trong vòng 30 phút, nếu gặp ít nhất một điềm báo trên là năng lượng đã kích hoạt thành công."
    };
  }

  // ==============================================================================
  // 9. BỘ PHÂN TÍCH TOÀN DIỆN & CẦU NỐI VỚI NETA LIGHT (MASTER INTEGRATION)
  // ==============================================================================

  class JoeyYapQMDJEngine {
    constructor() {
      this.PALACES = PALACES;
      this.DOORS_META = DOORS_META;
      this.STARS_META = STARS_META;
      this.DEITIES_META = DEITIES_META;
    }

    isFiveDisharmony(dayStem, hourStem) {
      return isFiveDisharmonyHour(dayStem, hourStem);
    }

    getMonthGen(termOrMonth) {
      return getMonthGeneral(termOrMonth);
    }

    getSkyHorse(monthGenBranch, hourBranch) {
      return getGreatMinisterSkyHorse(monthGenBranch, hourBranch);
    }

    evaluateThreeVictories(chiefPalace, nineHeavenPalace, lifeDoorPalace) {
      return evaluateThreeVictoryPalaces(chiefPalace, nineHeavenPalace, lifeDoorPalace);
    }

    evaluateFiveRestrictions(chief, nineHeaven, lifeDoor, nineEarth, envoy) {
      return evaluateFiveNonStriking(chief, nineHeaven, lifeDoor, nineEarth, envoy);
    }

    scanPalaceFormations(pId, hStem, eStem, door, deity, star, isEnvoy) {
      return scanPalaceFormations(pId, hStem, eStem, door, deity, star, isEnvoy);
    }

    getOmens(doorName, starName, direction) {
      return getEvidentialOmens(doorName, starName, direction);
    }

    /**
     * Bóc tách và thẩm định toàn diện bàn Kỳ Môn từ đối tượng QMDJCore trong Neta Light
     * @param {Object} chart - Instance tạo bởi new QMDJCore.TheArtOfBecomingInvisible(dateObj)
     * @param {Object} params - { dayCanChi, hourCanChi, solarTerm, lunarMonth, taskGoal }
     */
    analyzeQMDJCoreChart(chart, params = {}) {
      if (!chart || !chart.box) {
        return { success: false, message: "Không tìm thấy dữ liệu bàn cờ Kỳ Môn hợp lệ." };
      }

      const dayCanChiRaw = params.dayCanChi || (chart.date ? chart.date.cstb(true) : '');
      const hourCanChiRaw = params.hourCanChi || (chart.hour ? chart.hour.cstb(true) : '');

      const parseCanChi = (str) => {
        if (!str) return { can: 'Giáp', chi: 'Tý' };
        const clean = String(str).trim();
        if (clean.includes(' ')) {
          const parts = clean.split(' ').filter(Boolean);
          const c = parts[0] || 'Giáp';
          let b = parts[1] || 'Tý';
          if (b === 'Tị') b = 'Tỵ';
          return { can: c, chi: b };
        }
        // Chuỗi không có dấu cách (ví dụ "辛巳", "ẤtTỵ", "CanhNgọ")
        const CANS = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
        const CHIS = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Tị', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi', '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        let cRes = 'Giáp', bRes = 'Tý';
        for (const c of CANS) {
          if (clean.startsWith(c)) {
            cRes = c;
            const rest = clean.substring(c.length);
            for (const b of CHIS) {
              if (rest.includes(b)) {
                bRes = b;
                break;
              }
            }
            break;
          }
        }
        if (bRes === 'Tị') bRes = 'Tỵ';
        return { can: cRes, chi: bRes };
      };

      const dayObj = parseCanChi(dayCanChiRaw);
      const hourObj = parseCanChi(hourCanChiRaw);
      const dayStem = dayObj.can;
      const hourStem = hourObj.can;
      const hourBranch = hourObj.chi;

      // 1. Kiểm tra bộ lọc phủ quyết Ngũ Bất Ngộ Thời
      const isVetoed = isFiveDisharmonyHour(dayStem, hourStem);
      const vetoReason = isVetoed ? `Phạm Ngũ Bất Ngộ Thời: Can Giờ (${hourStem}) khắc Can Ngày (${dayStem}) theo thế Thất Sát. Toàn bộ cát khí bị triệt tiêu.` : '';

      // Bảng ánh xạ dịch nhanh
      const TR_MAP = {
        "开门": "Khai", "休门": "Hưu", "生门": "Sinh", "伤门": "Thương",
        "杜门": "Đỗ", "景门": "Cảnh", "死门": "Tử", "惊门": "Kinh",
        "天蓬星": "Thiên Bồng", "天芮星": "Thiên Nhuế", "天冲星": "Thiên Xung",
        "天辅星": "Thiên Phụ", "天禽星": "Thiên Cầm", "天心星": "Thiên Tâm",
        "天柱星": "Thiên Trụ", "天任星": "Thiên Nhậm", "天英星": "Thiên Anh",
        "值符": "Trực Phù", "直符": "Trực Phù", "腾蛇": "Đằng Xà", "螣蛇": "Đằng Xà",
        "太阴": "Thái Âm", "六合": "Lục Hợp", "白虎": "Bạch Hổ", "玄武": "Huyền Vũ",
        "九地": "Cửu Địa", "九天": "Cửu Thiên", "勾陈": "Câu Trần", "朱雀": "Chu Tước",
        "甲": "Giáp", "乙": "Ất", "丙": "Bính", "丁": "Đinh", "戊": "Mậu",
        "己": "Kỷ", "庚": "Canh", "辛": "Tân", "壬": "Nhâm", "癸": "Quý"
      };
      const tr = (val) => {
        if (!val) return '';
        if (Array.isArray(val)) return val.map(tr).join('/');
        return TR_MAP[val] || val;
      };

      // 2. Bóc tách 9 cung Lạc Thư
      const palaces = {};
      let chiefPalace = 1;
      let envoyPalace = 1;
      let lifeDoorPalace = 8;
      let nineHeavenPalace = 9;
      let nineEarthPalace = 1;
      let deathDoorPalace = 2;
      let fearDoorPalace = 7;

      chart.box.flat().forEach(p => {
        const pNum = p.index + 1; // 1 - 9
        const door = tr(p.getDoor(true));
        const star = tr(p.getStar(true));
        const deity = tr(p.getDivinity(true));
        const hcsRaw = tr(p.getHCS(true));
        const ecsRaw = tr(p.getECS(true));
        const hcsList = (Array.isArray(hcsRaw) ? hcsRaw : String(hcsRaw).split('/')).map(s => s.trim()).filter(Boolean);
        const ecsList = (Array.isArray(ecsRaw) ? ecsRaw : String(ecsRaw).split('/')).map(s => s.trim()).filter(Boolean);
        const hcs = hcsList[0] || '';
        const ecs = ecsList[0] || '';
        const isKongWang = !!p.de;

        palaces[pNum] = { palace: pNum, door, star, deity, hcs, hcsList, ecs, ecsList, isKongWang, formations: [] };

        if (deity === 'Trực Phù') chiefPalace = pNum;
        if (deity === 'Cửu Thiên') nineHeavenPalace = pNum;
        if (deity === 'Cửu Địa') nineEarthPalace = pNum;
        if (door.includes('Sinh')) lifeDoorPalace = pNum;
        if (door.includes('Tử')) deathDoorPalace = pNum;
        if (door.includes('Kinh')) fearDoorPalace = pNum;
        if (p.isTrucSu) envoyPalace = pNum;
      });

      // 3. Quét toàn bộ 76 Cách Cục trên 9 Cung
      let totalFormationScore = 0;
      const detectedFormations = [];

      for (let pid = 1; pid <= 9; pid++) {
        if (pid === 5) continue;
        const pInfo = palaces[pid];
        if (!pInfo) continue;
        const fList = scanPalaceFormations(
          pid,
          pInfo.hcs,
          pInfo.ecs,
          pInfo.door,
          pInfo.deity,
          pInfo.star,
          (pid === envoyPalace)
        );
        pInfo.formations = fList;
        fList.forEach(f => {
          totalFormationScore += f.score;
          detectedFormations.push({
            palace_id: pid,
            palace_name: PALACES[pid].name,
            direction: PALACES[pid].direction,
            ...f
          });
        });
      }

      // 4. Nguyệt Tướng & Thái Trùng Thiên Mã
      const solarTerm = params.solarTerm || "Xuân Phân";
      const lunarMonth = params.lunarMonth || 2;
      const monthGen = getMonthGeneral(solarTerm);
      const skyHorse = getGreatMinisterSkyHorse(monthGen.branch, hourBranch || "Tý");

      // 5. Tam Thắng & Ngũ Bất Kích
      const threeVictories = evaluateThreeVictoryPalaces(chiefPalace, nineHeavenPalace, lifeDoorPalace);
      const fiveRestrictions = evaluateFiveNonStriking(chiefPalace, nineHeavenPalace, lifeDoorPalace, nineEarthPalace, envoyPalace);
      const swaying = evaluateSwaying3Evading5(chiefPalace);

      // 6. Điểm tổng hợp Chiến Lược Không Gian
      let netScore = 50 + totalFormationScore + swaying.score;
      if (threeVictories.is_converged) netScore += 15;
      if (isVetoed) netScore = -999;

      // 7. Khắc Ứng Thực Địa tại Cung Tam Thắng Cát Nhất
      const bestPalaceId = chiefPalace;
      const bestDoor = palaces[bestPalaceId] ? palaces[bestPalaceId].door : 'Khai';
      const bestStar = palaces[bestPalaceId] ? palaces[bestPalaceId].star : 'Thiên Tâm';
      const evidential = getEvidentialOmens(bestDoor, bestStar, PALACES[bestPalaceId].direction);

      return {
        success: true,
        is_vetoed: isVetoed,
        veto_reason: vetoReason,
        score: netScore,
        palaces,
        month_general: monthGen,
        sky_horse: skyHorse,
        three_victories: threeVictories,
        five_restrictions: fiveRestrictions,
        swaying_evading: swaying,
        detected_formations: detectedFormations,
        evidential_omens: evidential,
        spatial_strategy: {
          presenter_back_facing: `${threeVictories.first_victory.direction} (${threeVictories.first_victory.palace_name} - Trực Phù)`,
          alternative_back_facing: `${threeVictories.third_victory.direction} (${threeVictories.third_victory.palace_name} - Sinh Môn)`,
          emergency_escape_vector: `${skyHorse.direction} (${skyHorse.palace_name} - Thái Trùng Thiên Mã tại ${skyHorse.sky_horse_branch})`,
          target_placement_sectors: [
            `${PALACES[deathDoorPalace].direction} (Tử Môn - Tiêu hao ý chí)`,
            `${PALACES[fearDoorPalace].direction} (Kinh Môn - Gây hoang mang do dự)`
          ],
          five_no_attacks: fiveRestrictions.restricted_sectors.map(s => `${s.direction} (${s.reasons.join(', ')})`)
        }
      };
    }

    /**
     * Tìm Tuần Thủ (Xun Shou) ẩn dưới lục nghi cho Giáp
     */
    getXunLeader(stem, branch) {
      const sIdx = STEMS_10.indexOf(stem);
      const bIdx = BRANCHES_12.indexOf(branch);
      if (sIdx === -1 || bIdx === -1) return 'Mậu';
      const diff = (bIdx - sIdx + 12) % 12;
      const XUN_MAP = {
        0: 'Mậu',  // Giáp Tý tuần
        10: 'Kỷ',  // Giáp Tuất tuần
        8: 'Canh', // Giáp Thân tuần
        6: 'Tân',  // Giáp Ngọ tuần
        4: 'Nhâm', // Giáp Thìn tuần
        2: 'Quý'   // Giáp Dần tuần
      };
      return XUN_MAP[diff] || 'Mậu';
    }

    /**
     * Bóc tách và liên kết Bát Tự với Bàn Kỳ Môn Giờ Sinh (Joey Yap Destiny Qi Men)
     * @param {Object} baziInput - Đối tượng lá số Bát Tự (từ NetaBaziEngine hoặc { solarDate, tuTru })
     * @param {Object} natalChart - Bàn Kỳ Môn giờ sinh (tùy chọn)
     */
    computeDestinyQiMen(baziInput, natalChart = null) {
      if (!baziInput) return null;

      let solarDate = baziInput.solarDate;
      if (!solarDate && baziInput.input) {
        solarDate = new Date(baziInput.input.year, baziInput.input.month - 1, baziInput.input.day, baziInput.input.hour, baziInput.input.minute);
      }
      if (!solarDate) solarDate = new Date();

      // Dựng Bàn Kỳ Môn giờ sinh nếu chưa truyền vào
      let chart = natalChart;
      if (!chart && global.QMDJCore && global.QMDJCore.TheArtOfBecomingInvisible) {
        try {
          chart = new global.QMDJCore.TheArtOfBecomingInvisible(solarDate);
        } catch (e) {
          console.error("Lỗi dựng Bàn Kỳ Môn giờ sinh:", e);
        }
      }

      if (!chart) return null;

      let dayCan = 'Giáp', dayChi = 'Tý', yearCan = 'Giáp', yearChi = 'Tý', hourCan = 'Giáp', hourChi = 'Tý';
      if (Array.isArray(baziInput.tuTru)) {
        const yP = baziInput.tuTru[0] || {};
        const dP = baziInput.tuTru[2] || {};
        const hP = baziInput.tuTru[3] || {};
        yearCan = yP.gan || yP.can || 'Giáp';
        yearChi = yP.zhi || yP.chi || 'Tý';
        dayCan = dP.gan || dP.can || 'Giáp';
        dayChi = dP.zhi || dP.chi || 'Tý';
        hourCan = hP.gan || hP.can || 'Giáp';
        hourChi = hP.zhi || hP.chi || 'Tý';
      } else if (baziInput.tuTru && typeof baziInput.tuTru === 'object') {
        const yP = baziInput.tuTru.year || {};
        const dP = baziInput.tuTru.day || {};
        const hP = baziInput.tuTru.hour || {};
        yearCan = yP.can || yP.gan || 'Giáp';
        yearChi = yP.chi || yP.zhi || 'Tý';
        dayCan = dP.can || dP.gan || 'Giáp';
        dayChi = dP.chi || dP.zhi || 'Tý';
        hourCan = hP.can || hP.gan || 'Giáp';
        hourChi = hP.chi || hP.zhi || 'Tý';
      } else {
        dayCan = baziInput.dayCan || 'Giáp';
        dayChi = baziInput.dayChi || 'Tý';
        yearCan = baziInput.yearCan || 'Giáp';
        yearChi = baziInput.yearChi || 'Tý';
        hourCan = baziInput.hourCan || 'Giáp';
        hourChi = baziInput.hourChi || 'Tý';
      }

      // Phân tích toàn diện Bàn Kỳ Môn
      const analyzed = this.analyzeQMDJCoreChart(chart, {
        dayCanChi: `${dayCan} ${dayChi}`,
        hourCanChi: `${hourCan} ${hourChi}`,
        solarTerm: baziInput.solarTermStr || ''
      });

      if (!analyzed || !analyzed.success) return null;

      // Can Ngày / Năm / Giờ nếu là Giáp thì lấy Tuần Thủ
      const effectiveDayStem = (dayCan === 'Giáp') ? this.getXunLeader(dayCan, dayChi) : dayCan;
      const effectiveYearStem = (yearCan === 'Giáp') ? this.getXunLeader(yearCan, yearChi) : yearCan;
      const effectiveHourStem = (hourCan === 'Giáp') ? this.getXunLeader(hourCan, hourChi) : hourCan;

      // Xác định các Cung Mệnh Kỳ Môn chuẩn học thuật Joey Yap & Kỳ Môn Mệnh Lý:
      // 1. Cung Bản Mệnh (Life Palace): Tìm Can Ngày (effectiveDayStem) trên THIÊN BÀN (Heaven Plate)
      // 2. Cung Xã Hội / Niên Mệnh (Year Palace): Tìm Can Năm (effectiveYearStem) trên THIÊN BÀN
      // 3. Cung Tử Tức / Hậu Vận (Children Palace): Tìm Can Giờ (effectiveHourStem) trên THIÊN BÀN
      // 4. Cung Sự Nghiệp (Career Palace): Tìm Khai Môn (Open Door)
      // 5. Cung Tài Lộc (Wealth Palace): Tìm Sinh Môn (Life Door)
      // 6. Cung Hôn Nhân / Nhân Duyên (Relationship Palace): Tìm Lục Hợp (Six Harmony)
      // 7. Cung Sức Khỏe (Health Palace): Tìm Thiên Nhuế (Tian Rui Star)
      // 8. Cung Quý Nhân (Mentor Palace): Tìm Trực Phù (Chief Deity)

      let lifePalaceId = 1;
      let yearPalaceId = 1;
      let hourPalaceId = 1;
      let careerPalaceId = 6;
      let wealthPalaceId = 8;
      let relationshipPalaceId = 2;
      let healthPalaceId = 2;
      let noblemanPalaceId = 1;

      for (let pId = 1; pId <= 9; pId++) {
        if (pId === 5) continue;
        const p = analyzed.palaces[pId];
        if (!p) continue;
        const hList = p.hcsList || [p.hcs];
        if (hList.includes(effectiveDayStem)) lifePalaceId = pId;
        if (hList.includes(effectiveYearStem)) yearPalaceId = pId;
        if (hList.includes(effectiveHourStem)) hourPalaceId = pId;
        if (p.door && p.door.includes('Khai')) careerPalaceId = pId;
        if (p.door && p.door.includes('Sinh')) wealthPalaceId = pId;
        if (p.deity && p.deity.includes('Lục Hợp')) relationshipPalaceId = pId;
        if (p.star && p.star.includes('Thiên Nhuế')) healthPalaceId = pId;
        if (p.deity && p.deity.includes('Trực Phù')) noblemanPalaceId = pId;
      }

      // Xử lý ký Cung Khôn 2 nếu Thiên Can rơi vào Trung Cung 5
      if (!lifePalaceId || lifePalaceId === 5) lifePalaceId = 2;
      if (!yearPalaceId || yearPalaceId === 5) yearPalaceId = 2;
      if (!hourPalaceId || hourPalaceId === 5) hourPalaceId = 2;

      const allPalacesRoles = {};
      for (let i = 1; i <= 9; i++) allPalacesRoles[i] = [];

      const addRole = (pid, badgeText, badgeClass) => {
        if (!allPalacesRoles[pid]) allPalacesRoles[pid] = [];
        allPalacesRoles[pid].push({ text: badgeText, class: badgeClass });
      };

      addRole(lifePalaceId, '👑 BẢN MỆNH', 'badge-life');
      addRole(careerPalaceId, '💼 SỰ NGHIỆP', 'badge-career');
      addRole(wealthPalaceId, '💰 TÀI LỘC', 'badge-wealth');
      addRole(relationshipPalaceId, '❤️ HÔN NHÂN', 'badge-relation');
      addRole(healthPalaceId, '🩺 SỨC KHỎE', 'badge-health');
      addRole(noblemanPalaceId, '✨ QUÝ NHÂN', 'badge-nobleman');
      if (yearPalaceId !== lifePalaceId) addRole(yearPalaceId, '🌐 XÃ HỘI', 'badge-social');
      if (hourPalaceId !== lifePalaceId && hourPalaceId !== noblemanPalaceId) addRole(hourPalaceId, '👶 TỬ TỨC', 'badge-children');

      const buildPalaceReport = (pid, stem, roleTitle = '') => {
        const pInfo = PALACES[pid] || PALACES[1];
        const pData = analyzed.palaces[pid] || {};
        const dClean = (pData.door || '').replace(' Môn', '').trim();
        const doorMeta = DOORS_META[dClean] || DOORS_META['Khai'];
        const starMeta = resolveStarMeta(pData.star, roleTitle);
        const deityMeta = DEITIES_META[pData.deity] || DEITIES_META['Trực Phù'];

        const hStem = pData.hcs || pData.heaven_stem || 'Ất';
        const eStem = pData.ecs || pData.earth_stem || 'Mậu';

        // Lọc các cách cục rơi vào cung này và chuẩn hóa tên / tính chất
        const rawFormations = (analyzed.detected_formations || []).filter(f => f.palace_id === pid);
        const palaceFormations = rawFormations.map(f => ({
          name: f.name || f.name_vn || 'Cách Cục',
          is_auspicious: f.is_auspicious !== undefined ? f.is_auspicious : (f.nature ? f.nature.includes('Cát') : f.score > 0),
          description: f.description || f.desc || ''
        }));

        return {
          palace_id: pid,
          palace_name: pInfo.name,
          direction: pInfo.direction,
          degrees: pInfo.degrees,
          center_deg: pInfo.centerDeg,
          element: pInfo.element,
          role_title: roleTitle,
          stem,
          heaven_stem: hStem,
          earth_stem: eStem,
          door: doorMeta.vn,
          door_action: doorMeta.action,
          star: starMeta.vn,
          star_intellect: starMeta.intellect,
          deity: deityMeta.vn,
          deity_en: deityMeta.en,
          deity_title: deityMeta.title,
          deity_power: deityMeta.subconscious_power,
          deity_affirmation: deityMeta.affirmation,
          deity_focus: deityMeta.spiritual_focus,
          deity_advice: deityMeta.advice,
          formations: palaceFormations,
          harmony: evaluateDoorPalaceHarmony(doorMeta.vn, pid)
        };
      };

      const lifePalace = buildPalaceReport(lifePalaceId, dayCan, '👑 Cung Bản Mệnh (Life Palace)');
      const yearPalace = buildPalaceReport(yearPalaceId, yearCan, '🌐 Cung Xã Hội / Niên Mệnh (Year Palace)');
      const hourPalace = buildPalaceReport(hourPalaceId, hourCan, '👶 Cung Tử Tức / Hậu Vận (Children Palace)');
      const careerPalace = buildPalaceReport(careerPalaceId, null, '💼 Cung Sự Nghiệp (Career Palace - Khai Môn)');
      const wealthPalace = buildPalaceReport(wealthPalaceId, null, '💰 Cung Tài Lộc (Wealth Palace - Sinh Môn)');
      const relationshipPalace = buildPalaceReport(relationshipPalaceId, null, '❤️ Cung Hôn Nhân / Nhân Duyên (Relationship Palace - Lục Hợp)');
      const healthPalace = buildPalaceReport(healthPalaceId, null, '🩺 Cung Sức Khỏe (Health Palace - Thiên Nhuế)');
      const noblemanPalace = buildPalaceReport(noblemanPalaceId, null, '✨ Cung Quý Nhân (Nobleman Palace - Trực Phù)');

      return {
        success: true,
        solarDate,
        day_stem: dayCan,
        day_branch: dayChi,
        year_stem: yearCan,
        year_branch: yearChi,
        effective_day_stem: effectiveDayStem,
        effective_year_stem: effectiveYearStem,
        effective_hour_stem: effectiveHourStem,
        life_palace: lifePalace,
        year_palace: yearPalace,
        hour_palace: hourPalace,
        career_palace: careerPalace,
        wealth_palace: wealthPalace,
        relationship_palace: relationshipPalace,
        health_palace: healthPalace,
        nobleman_palace: noblemanPalace,
        all_palaces_roles: allPalacesRoles,
        three_victories: analyzed.three_victories,
        sky_horse: analyzed.sky_horse,
        chart: chart
      };
    }

    /**
     * Lấy chỉ dẫn Phương vị Tọa Thiền Định Tâm Thời Gian Thực theo Joey Yap Spiritual Qi Men
     * @param {Date} date - Thời điểm thiền quán (mặc định là hiện tại)
     */
    getSpiritualMeditationGuide(date = new Date()) {
      if (!global.QMDJCore || !global.QMDJCore.TheArtOfBecomingInvisible) {
        return null;
      }

      let chart = null;
      try {
        chart = new global.QMDJCore.TheArtOfBecomingInvisible(date);
      } catch (e) {
        console.error("Lỗi dựng Bàn Kỳ Môn thiền quán:", e);
        return null;
      }

      const analyzed = this.analyzeQMDJCoreChart(chart);
      if (!analyzed || !analyzed.success) return null;

      // Danh mục 4 hướng tọa thiền nạp khí chủ đạo
      const TARGET_DEITIES = [
        {
          key: 'chief',
          deityName: 'Trực Phù',
          purpose: 'Nạp Khí Hộ Thân & Tiêu Trừ Nghiệp Lực',
          icon: '✨',
          tag: 'Tối Thượng',
          practice_title: 'Thiền Kết Nối Nguồn Sáng Vũ Trụ'
        },
        {
          key: 'moon',
          deityName: 'Thái Âm',
          purpose: 'Tĩnh Tâm Tuyệt Đối & Khai Mở Trí Huệ',
          icon: '🧘',
          tag: 'Định Huệ',
          practice_title: 'Thiền Định Tĩnh Lặng & Chữa Lành'
        },
        {
          key: 'earth',
          deityName: 'Cửu Địa',
          purpose: 'Tiếp Đất (Grounding) & Nuôi Dưỡng Thể Lực',
          icon: '🌍',
          tag: 'An Thần',
          practice_title: 'Thiền Tiếp Đất Đại Địa Nuôi Dưỡng'
        },
        {
          key: 'heaven',
          deityName: 'Cửu Thiên',
          purpose: 'Mở Rộng Tâm Thức & Thăng Hoa Sáng Tạo',
          icon: '🚀',
          tag: 'Thăng Hoa',
          practice_title: 'Thiền Mở Rộng Ý Thức Vô Biên'
        }
      ];

      const meditationSectors = [];

      TARGET_DEITIES.forEach(td => {
        // Tìm cung có Thần này
        for (let pId = 1; pId <= 9; pId++) {
          if (pId === 5) continue;
          const pData = analyzed.palaces[pId];
          if (pData && (pData.deity === td.deityName || (td.deityName === 'Trực Phù' && pData.is_chief))) {
            const pInfo = PALACES[pId];
            const dClean = (pData.door || '').replace(' Môn', '').trim();
            const doorMeta = DOORS_META[dClean] || DOORS_META['Hưu'];
            const deityMeta = DEITIES_META[td.deityName] || DEITIES_META['Trực Phù'];

            meditationSectors.push({
              key: td.key,
              icon: td.icon,
              tag: td.tag,
              purpose: td.purpose,
              practice_title: td.practice_title,
              deity: deityMeta.vn,
              deity_en: deityMeta.en,
              deity_title: deityMeta.title,
              affirmation: deityMeta.affirmation,
              spiritual_focus: deityMeta.spiritual_focus,
              palace_id: pId,
              palace_name: pInfo.name,
              direction: pInfo.direction,
              degrees: pInfo.degrees,
              center_deg: pInfo.centerDeg,
              door: doorMeta.vn,
              star: pData.star
            });
            break;
          }
        }
      });

      return {
        success: true,
        date: date,
        hourCanChi: chart.hour ? chart.hour.cstb(true) : '',
        dayCanChi: chart.date ? chart.date.cstb(true) : '',
        solarTerm: analyzed.month_general ? analyzed.month_general.name_vn : '',
        sectors: meditationSectors,
        three_steps_guide: [
          {
            step: 1,
            name: "Định Vị (Align)",
            desc: "Ngồi tĩnh tọa trang nghiêm, giữ lưng thẳng tự nhiên. Xoay lưng (Back to Direction) về đúng phương vị của vị Thần bạn chọn."
          },
          {
            step: 2,
            name: "Phát Nguyện (Command)",
            desc: "Khép nhẹ mi mắt, hít thở sâu 3 nhịp chậm rãi bằng cơ hoành, khởi niệm thầm hoặc tụng khẩu quyết tâm thức tương ứng với lòng thành kính."
          },
          {
            step: 3,
            name: "Kết Nối (Connect)",
            desc: "Giữ tâm trí rỗng rang, xả buông mọi lo toan vọng niệm trong 15 - 30 phút, cảm nhận luồng sinh khí an lành bao bọc toàn bộ cơ thể."
          }
        ]
      };
    }
  }

  // Đăng ký toàn cục
  const engineInstance = new JoeyYapQMDJEngine();
  global.JoeyYapQMDJEngine = engineInstance;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = engineInstance;
  }

})(typeof window !== "undefined" ? window : globalThis);
