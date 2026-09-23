// Database 48 quân bài Neta Light - Pháp môn Nadrasa Dehi
// Nguồn đối chiếu chuẩn: Bai Neta Light V2_1.pdf & Quân bài neta light V2_1.xlsx

const NETA_CARDS_DATA = [
  {
    id: 1,
    name: "Yêu nam",
    image: "neta_cards/card_01.png",
    frequency: "226",
    group: "Thực thể âm giới",
    attribute: "Cảnh báo / Khảo đảo",
    description: "Thực thể yêu quái nam mang năng lượng trược khí, gây mê mờ, quấy nhiễu tâm thức hoặc tác động vào các mối quan hệ.",
    advice: "Giữ tâm định tĩnh, không sanh tâm sợ hãi hay oán trách; hướng về Chánh Pháp, phát tâm hồi hướng công đức và đọc Chú Bổn Tôn để thanh tẩy năng lượng."
  },
  {
    id: 2,
    name: "Yêu nữ",
    image: "neta_cards/card_02.png",
    frequency: "226",
    group: "Thực thể âm giới",
    attribute: "Cảnh báo / Dẫn dụ",
    description: "Thực thể yêu quái nữ mang năng lượng dẫn dụ cảm xúc, làm xao lãng đường tu, khơi gợi bản ngã hoặc sân si tình cảm.",
    advice: "Nhận biết rõ ràng các biến động cảm xúc bất thường. Tránh tranh cãi, giữ gìn giới hạnh, gia tăng thời gian thiền định tiếp nhận năng lượng thanh tịnh."
  },
  {
    id: 3,
    name: "Vong nam",
    image: "neta_cards/card_03.png",
    frequency: "226",
    group: "Cõi vong linh",
    attribute: "Nhắc nhở / Trợ duyên",
    description: "Linh hồn nam giới nơi cõi âm nương tựa hoặc có duyên tiền kiếp, mong muốn được chia sẻ năng lượng hoặc gửi tín hiệu cần trợ giúp.",
    advice: "Phát tâm từ bi, đọc kinh cầu siêu hoặc tác ý hướng năng lượng ánh sáng của Pháp môn Nadrasa Dehi cứu độ cho hương linh được nhẹ nhàng, siêu thoát."
  },
  {
    id: 4,
    name: "Vong nữ",
    image: "neta_cards/card_04.png",
    frequency: "226",
    group: "Cõi vong linh",
    attribute: "Nhắc nhở / Trợ duyên",
    description: "Linh hồn nữ giới nơi cõi âm còn vướng mắc tâm niệm chưa dứt, hiện diện để nhắc nhở hoặc cần sự soi sáng của chánh đạo.",
    advice: "Khởi tâm thương xót, không xua đuổi hung bạo; sám hối các mối duyên nợ xưa và nguyện cầu chư vị Hộ pháp dẫn dắt linh hồn về nơi an lành."
  },
  {
    id: 5,
    name: "Đủ điều kiện đầu thai",
    image: "neta_cards/card_05.png",
    frequency: "227",
    group: "Chuyển hóa luân hồi",
    attribute: "Cát tường / Giải thoát",
    description: "Báo hiệu một hương linh hoặc phần năng lượng âm đã mãn hạn nghiệp báo, đã nhận đủ công đức khai sáng và đủ phước duyên để tái sinh làm người.",
    advice: "Một điều lành lớn lao vừa hoàn thành. Hãy tiếp tục tinh tấn gieo duyên chánh pháp, phước đức đang tròn đầy."
  },
  {
    id: 6,
    name: "Nghiệp nặng",
    image: "neta_cards/card_06.png",
    frequency: "227",
    group: "Nghiệp báo nhân quả",
    attribute: "Cảnh báo cấp độ cao",
    description: "Dấu hiệu cho thấy một khối nghiệp chướng sâu dày đang trỗi dậy, có thể tạo nên sóng gió lớn về thân mạng, tâm lý hoặc tài vận.",
    advice: "Hết sức cẩn trọng trong từng lời nói, hành động. Tuyệt đối không khởi tâm ác; tích cực phóng sinh, sám hối sâu sắc và kiên trì trì niệm nhận ánh sáng bảo hộ."
  },
  {
    id: 7,
    name: "Nghiệp đang xảy ra",
    image: "neta_cards/card_07.png",
    frequency: "226",
    group: "Nghiệp báo nhân quả",
    attribute: "Hiện tiền / Trả nghiệp",
    description: "Nghiệp quả không còn ở dạng tiềm ẩn mà đang trực tiếp trổ quả trong cuộc sống hiện tại qua những trắc trở, xung đột hoặc bệnh tật.",
    advice: "Dũng cảm đối diện và hoan hỷ đón nhận để trả dứt nợ nần tiền kiếp. Hãy giữ lòng bao dung, không oán trách, nghiệp sẽ tiêu trừ nhanh chóng."
  },
  {
    id: 8,
    name: "Bùa",
    image: "neta_cards/card_08.png",
    frequency: "226",
    group: "Khí cụ tà thuật",
    attribute: "Nhiễm khí / Tà khí",
    description: "Sự hiện diện của bùa chú, tà thuật hoặc các trường năng lượng cưỡng bức bị gài đặt cố ý hoặc vô tình vướng phải.",
    advice: "Không nên hoảng sợ. Hãy quán chiếu Pháp Ấn tối thượng và chữ Vạn quang minh soi rọi giải tỏa mọi cấu kết tà thuật; giữ tâm thanh tịnh thì bùa chú tự mất linh."
  },
  {
    id: 9,
    name: "Quỷ nam",
    image: "neta_cards/card_09.png",
    frequency: "226",
    group: "Quỷ giới",
    attribute: "Năng lượng đối kháng",
    description: "Năng lượng quỷ nam hung hãn, chủ về xung đột, bực dọc, phá hoại thanh danh hoặc gây tổn hao dương khí mãnh liệt.",
    advice: "Kiềm chế tối đa cơn giận dữ; không sa đà vào tranh chấp hơn thua. Dâng tâm chí thành nương tựa oai lực của chư vị Hộ Pháp để che chở bản thân."
  },
  {
    id: 10,
    name: "Quỷ nữ",
    image: "neta_cards/card_10.png",
    frequency: "226",
    group: "Quỷ giới",
    attribute: "Năng lượng xáo trộn",
    description: "Thực thể quỷ nữ mang tính chất u uất, sân hận thâm sâu, dễ gây ám ảnh tâm lý, xáo trộn giấc ngủ hoặc nghi kỵ nội bộ.",
    advice: "Thắp sáng tình thương và lòng từ bi. Rèn luyện sự kiên nhẫn, dọn dẹp không gian sống sạch sẽ, thanh tẩy bằng hương trầm và tâm thế chánh trực."
  },
  {
    id: 11,
    name: "Thầy tà",
    image: "neta_cards/card_11.png",
    frequency: "Đồ hình đen",
    group: "Tà sư tà đạo",
    attribute: "Cảnh báo sai lạc",
    description: "Sự dẫn dắt sai đường từ những kẻ dùng pháp môn tà vạy, trục lợi tâm linh hoặc gieo rắc sự sợ hãi để trói buộc tâm thức người khác.",
    advice: "Tỉnh giác nhận diện! Tránh xa những nơi cúng bái mê tín dị đoan, không giao phó vận mệnh cho tha nhân; chỉ nương theo Chánh Pháp và vị Thầy Chân Thật."
  },
  {
    id: 12,
    name: "Thổ địa",
    image: "neta_cards/card_12.png",
    frequency: "Hoa văn đỏ",
    group: "Phúc thần bản xứ",
    attribute: "Bảo hộ gia cư",
    description: "Vị Phúc thần cai quản mảnh đất bạn đang cư ngụ hoặc làm việc, tượng trưng cho sự yên ổn gia trạch và hòa hợp với long mạch địa phương.",
    advice: "Biết ơn mảnh đất mình đang sống; giữ gìn vệ sinh, hành xử hòa nhã với xóm giềng. Thành tâm lễ tạ Thổ Thần để đón nhận sinh khí và hanh thông."
  },
  {
    id: 13,
    name: "Đất xấu (không có thổ địa)",
    image: "neta_cards/card_13.png",
    frequency: "Cung khuyết",
    group: "Phong thủy / Điền trạch",
    attribute: "Khí trường suy kiệt",
    description: "Thửa đất có trường năng lượng tiêu điều, âm khí nặng nề, thiếu vắng sự bảo hộ của chư vị chánh thần hoặc từng có nhiều biến cố u uất.",
    advice: "Không nên vội vàng đầu tư hoặc xây cất nếu chưa điều chỉnh khí trường. Cần thanh tẩy, tu tập hồi hướng, an vị Pháp Ấn chánh đạo để tái tạo sinh khí."
  },
  {
    id: 14,
    name: "Nghiệp ở đất",
    image: "neta_cards/card_14.png",
    frequency: "Sóng đen",
    group: "Phong thủy / Điền trạch",
    attribute: "Oan gia long mạch",
    description: "Nghiệp nợ hoặc ân oán xưa kia từng xảy ra trên mảnh đất (mồ mả cũ, tranh chấp máu lửa, oan khuất nơi đất đai) nay trỗi dậy ảnh hưởng gia chủ.",
    advice: "Tổ chức sám hối, hồi hướng công đức sâu rộng cho chư vị hương linh hữu danh vô vị tại khu đất; dứt khoát không dùng vũ lực hay tà thuật trấn yểm."
  },
  {
    id: 15,
    name: "Đất tốt",
    image: "neta_cards/card_15.png",
    frequency: "Sóng đỏ",
    group: "Phong thủy / Điền trạch",
    attribute: "Cát tường vượng khí",
    description: "Vùng đất lành, phong thủy hài hòa, sinh khí tràn đầy và được che chở bởi các trường năng lượng thanh khiết; rất tốt cho việc cư trú và tu học.",
    advice: "Đất lành chim đậu. Hãy trân trọng, sống lương thiện và phát huy công việc thiện lành để phước báu trên đất ngày càng thêm dày."
  },
  {
    id: 16,
    name: "Hộ pháp thiên tâm đạo",
    image: "neta_cards/card_16.png",
    frequency: "227 Lệnh đỏ",
    group: "Chư vị Hộ Pháp",
    attribute: "Hộ trì dũng mãnh",
    description: "Chư vị Đại Hộ Pháp của dòng Thiên Tâm Đạo đang thị hiện che chở, ngăn chặn các thế lực hắc ám xâm phạm đường tu và sinh hoạt của bạn.",
    advice: "Vững lòng tin tưởng, không hoang mang sợ hãi trước khó khăn. Luôn giữ tâm niệm chân chánh, chư vị Hộ Pháp luôn tề tựu hộ trì."
  },
  {
    id: 17,
    name: "Om trắng (1)",
    image: "neta_cards/card_17.png",
    frequency: "227 Om Đỏ",
    group: "Quang Minh Chủng Tử",
    attribute: "Thanh tịnh / Khởi sinh",
    description: "Âm thanh nguyên thủy Om mang luồng năng lượng bạch hào quang tinh khiết, gột rửa mọi trược khí ở tầng số tế vi của thân tâm.",
    advice: "Thực hành hít thở sâu, chú tâm vào luân xa tim và đỉnh đầu, quán tưởng ánh sáng trắng bao bọc cơ thể, xua tan mọi mỏi mệt phiền não."
  },
  {
    id: 18,
    name: "Om trắng (2)",
    image: "neta_cards/card_18.png",
    frequency: "227 Om Đỏ",
    group: "Quang Minh Chủng Tử",
    attribute: "Trực giác / Tĩnh lặng",
    description: "Dòng năng lượng Om trắng soi tỏ trực giác, giúp bạn nhìn xuyên qua lớp sương mù của ảo vọng và những giả tướng bên ngoài.",
    advice: "Lắng nghe tiếng nói sâu thẳm bên trong. Tạm dừng những quyết định hấp tấp; câu trả lời chân thật nhất đang nằm trong sự tĩnh lặng của bạn."
  },
  {
    id: 19,
    name: "Om trắng (3)",
    image: "neta_cards/card_19.png",
    frequency: "227 Om Đỏ",
    group: "Quang Minh Chủng Tử",
    attribute: "Hóa giải / Tha thứ",
    description: "Sức mạnh tha thứ và buông xả vô điều kiện dưới sự gia trì của năng lượng Om trắng; giải phóng những nút thắt tâm thức giam cầm bạn bấy lâu.",
    advice: "Hãy tha thứ cho chính mình và những người từng làm bạn tổn thương. Khi bạn mở lòng xả bỏ, ánh sáng an lạc sẽ lập tức tràn ngập."
  },
  {
    id: 20,
    name: "Có thể khai ngộ",
    image: "neta_cards/card_20.png",
    frequency: "227 Đồ hình Sen",
    group: "Giác Ngộ Tâm Thức",
    attribute: "Đại cát tường / Đột phá",
    description: "Khoảnh khắc thiêng liêng khi hạt giống tuệ giác chín muồi; cánh cửa nhận thức tâm linh sẵn sàng bật mở sau chuỗi ngày kiên trì tu tập.",
    advice: "Đừng bỏ lỡ cơ hội quý báu này! Hãy tăng cường thiền định, mở rộng tầm nhìn, kết nối với Bổn Tôn; sự hiểu biết sâu sắc về chân lý đang hiển lộ."
  },
  {
    id: 21,
    name: "Om vàng (1)",
    image: "neta_cards/card_21.png",
    frequency: "227 Om Hoàng Kim",
    group: "Quang Minh Chủng Tử",
    attribute: "Bảo hộ hoàng kim",
    description: "Năng lượng hoàng kim ấm áp và uy lực của chủng tử Om, tạo nên vòng kim cang kiên cố bảo vệ bạn trước mọi luồng khí độc hại.",
    advice: "Tự tin bước về phía trước. Bạn đang được che chở tuyệt đối bởi từ trường năng lượng màu vàng ánh kim của Chư Phật và chư vị Thánh chúng."
  },
  {
    id: 22,
    name: "Om vàng (2)",
    image: "neta_cards/card_22.png",
    frequency: "227 Om Hoàng Kim",
    group: "Quang Minh Chủng Tử",
    attribute: "Thịnh vượng / Phúc lạc",
    description: "Dòng chảy thịnh vượng, hanh thông về phước đức, trí tuệ và các thuận duyên trong cuộc sống đời thường đang đổ dồn về bạn.",
    advice: "Đón nhận với lòng biết ơn và biết sẻ chia giúp đỡ những người xung quanh; phước báu được chia sẻ sẽ nhân lên gấp bội phần."
  },
  {
    id: 23,
    name: "Om vàng (3)",
    image: "neta_cards/card_23.png",
    frequency: "227 Om Hoàng Kim",
    group: "Quang Minh Chủng Tử",
    attribute: "Năng lượng chữa lành",
    description: "Khả năng tự chữa lành mạnh mẽ cho cơ thể vật lý và tinh thần; đánh tan sự tắc nghẽn của các luân xa và hồi phục nguyên khí dồi dào.",
    advice: "Dành thời gian nghỉ ngơi, uống nước sạch, thiền định tiếp thu năng lượng vũ trụ để cơ thể tự cân bằng và khôi phục sự sống tươi mới."
  },
  {
    id: 24,
    name: "Om trắng (4)",
    image: "neta_cards/card_24.png",
    frequency: "227 Om Đỏ",
    group: "Quang Minh Chủng Tử",
    attribute: "Thanh lọc toàn diện",
    description: "Cấp độ thanh lọc cao nhất của năng lượng Om trắng, tái tạo lại toàn bộ hào quang bảo hộ và dứt sạch những liên kết năng lượng xấu xa.",
    advice: "Cắt đứt dứt khoát những thói quen tiêu cực. Một chu kỳ mới tinh khôi, sáng tỏ đang bắt đầu trong cuộc đời bạn."
  },
  {
    id: 25,
    name: "Âm binh người",
    image: "neta_cards/card_25.png",
    frequency: "225",
    group: "Âm phần thao túng",
    attribute: "Nhiễu loạn / Cản trở",
    description: "Đội quân âm binh có nguồn gốc linh hồn người bị sai khiến, gây ra những cản trở vô cớ, làm hỏng các kế hoạch hoặc tạo cảm giác mỏi mệt nặng nề.",
    advice: "Định tâm vững vàng, không giao dịch hay cúng kiếng cầu xin âm binh. Thường xuyên quán tưởng Pháp Ấn Chữ Vạn để giải phóng và chuyển hóa các thực thể này."
  },
  {
    id: 26,
    name: "Âm binh súc sinh",
    image: "neta_cards/card_26.png",
    frequency: "224",
    group: "Âm phần thao túng",
    attribute: "Bản năng hung bạo",
    description: "Linh hồn động vật, súc sinh bị nuôi dưỡng và kích hoạt bản năng hoang dã để tấn công phần vía, gây đau nhức cơ thể hoặc tính khí bất thường.",
    advice: "Phát nguyện ăn chay, phóng sinh, hồi hướng năng lượng yêu thương cho loài vật; tâm từ bi chân thật chính là giáp sắt vô địch hóa giải oán kết."
  },
  {
    id: 27,
    name: "Vong nhi nam",
    image: "neta_cards/card_27.png",
    frequency: "223",
    group: "Vong nhi hài đồng",
    attribute: "Cần che chở / Yêu thương",
    description: "Linh hồn thai nhi hoặc trẻ nhỏ (nam) chưa có cơ hội trưởng thành, vương vấn trong luân xa của cha mẹ hoặc gia đình với nỗi buồn tủi.",
    advice: "Đặt tên, trò chuyện với con bằng lòng yêu thương chân thành; sám hối chân thật và hồi hướng công đức giúp con sớm nương cửa Phật tái sinh."
  },
  {
    id: 28,
    name: "Vong nhi nữ",
    image: "neta_cards/card_28.png",
    frequency: "223",
    group: "Vong nhi hài đồng",
    attribute: "Cần che chở / Yêu thương",
    description: "Linh hồn thai nhi (nữ) quấn quýt bên người thân, mong muốn được công nhận và nhận được hơi ấm tình thương gia đình.",
    advice: "Không xua đuổi, không làm phép cắt đứt tàn nhẫn; hãy dùng tình mẫu tử/phụ tử ấm áp bù đắp và trợ duyên cho linh hồn bé thơ được siêu thăng cõi sáng."
  },
  {
    id: 29,
    name: "Thầy chánh pháp",
    image: "neta_cards/card_29.png",
    frequency: "227 Đồ hình Đỏ",
    group: "Minh Sư Chánh Đạo",
    attribute: "Chỉ đường dẫn lối",
    description: "Sự xuất hiện hoặc lời chỉ dạy quý báu từ một vị Minh Sư chân chính, giúp bạn tháo gỡ mê lầm, đặt nền móng vững chắc cho hành trình tâm linh.",
    advice: "Kính ngưỡng và lắng nghe với lòng khiêm hạ; thực hành nghiêm túc những lời chỉ dẫn đúng đắn của vị Thầy để tiến bước vững vàng."
  },
  {
    id: 30,
    name: "Nghiệp tâm linh",
    image: "neta_cards/card_30.png",
    frequency: "227 Kim Cang Đỏ",
    group: "Khảo đảo đường tu",
    attribute: "Thử thách ý chí",
    description: "Những bài học cam go liên quan đến lời thề tiền kiếp, sự nghi ngờ bản thân hoặc những chướng ngại tinh vi trên con đường thực hành pháp.",
    advice: "Vàng thật không sợ lửa đỏ. Hãy xem chướng ngại như bậc thang tôi luyện ý chí; kiên định với lý tưởng ban đầu, bạn sẽ vượt qua một cách vẻ vang."
  },
  {
    id: 31,
    name: "Chết tận số",
    image: "neta_cards/card_31.png",
    frequency: "227 Vòng Tròn Đen",
    group: "Quy luật sinh diệt",
    attribute: "Mãn hạn nhân duyên",
    description: "Sự kết thúc thuận theo lẽ tự nhiên của một kiếp người hoặc một giai đoạn cuộc đời; đã hoàn tất sứ mệnh và bài học ở cõi trần gian.",
    advice: "Tâm niệm bình thản trước vô thường. Trân trọng từng giây phút hiện tại và chuẩn bị tâm thái thanh thản cho những hành trình tiếp nối."
  },
  {
    id: 32,
    name: "Chết oan",
    image: "neta_cards/card_32.png",
    frequency: "227 Hồng Tâm Đỏ",
    group: "Oan khiên cõi âm",
    attribute: "Uất ức chưa giải",
    description: "Sự ra đi bất đắc kỳ tử (tai nạn, oan khuất) khiến thần thức kinh hãi, chưa chấp nhận cái chết và vẫn còn quanh quẩn kêu cứu.",
    advice: "Gia tâm khai thị để hương linh hiểu rõ lẽ vô thường của thân xác; trì niệm Pháp môn Nadrasa Dehi trợ lực để tháo gỡ oán khí cho họ."
  },
  {
    id: 33,
    name: "Pháp ấn",
    image: "neta_cards/card_33.png",
    frequency: "ĐẠI PHÁP ẤN TỐI CAO",
    group: "Bảo Vật Tối Thượng",
    attribute: "Đại quy quyền / Trấn an",
    description: "Linh ấn tối cao của Pháp môn Nadrasa Dehi mang oai lực toàn giác, thiết lập trật tự vũ trụ, xua tan mọi tà khí và xác lập sắc lệnh cứu độ.",
    advice: "Điềm lành tột bậc! Mọi tai ương đều được tiêu trừ, mọi sự nghiệp thiện lành đều được chứng giám và thành tựu viên mãn dưới bóng Pháp Ấn."
  },
  {
    id: 34,
    name: "Om vàng (4)",
    image: "neta_cards/card_34.png",
    frequency: "227 Om Vàng",
    group: "Quang Minh Chủng Tử",
    attribute: "Đại quang minh",
    description: "Ánh sáng hoàng kim chiếu diệu khắp mười phương, tượng trưng cho trí tuệ vô biên và lòng từ bi hỷ xả không bờ bến.",
    advice: "Hãy trở thành kênh dẫn ánh sáng cho đời; dùng trí tuệ và sự ấm áp của bạn sưởi ấm, dẫn dắt những người đang lầm than."
  },
  {
    id: 35,
    name: "Bà cô tổ",
    image: "neta_cards/card_35.png",
    frequency: "Lưới Vuông Đỏ (1)",
    group: "Gia Tiên Tiền Nhân",
    attribute: "Hộ trì dòng họ",
    description: "Vị tiền nhân nữ linh thiêng trong dòng họ (mất khi còn trẻ, có duyên tu tập cõi tiên), luôn dõi theo che chở cho con cháu hiếu thảo.",
    advice: "Tưởng nhớ công ơn tổ tiên, hương khói chu đáo, sống đoan chính và chăm ngoan; Bà Cô Tổ sẽ luôn gia hộ che chở tai qua nạn khỏi."
  },
  {
    id: 36,
    name: "Ông mãnh",
    image: "neta_cards/card_36.png",
    frequency: "Lưới Vuông Đỏ (2)",
    group: "Gia Tiên Tiền Nhân",
    attribute: "Uy quyền che chở",
    description: "Vị tiền nhân nam trẻ tuổi linh thiêng của gia tộc, mang khí thế dũng cảm, bảo bọc các thế hệ hậu sinh trước những phong ba bão táp.",
    advice: "Tác ý hướng về cội nguồn, giữ gìn danh dự gia đình dòng tộc; khi gặp cơn nguy nan hãy thành tâm cầu khẩn sự phù hộ của Ông Mãnh."
  },
  {
    id: 37,
    name: "Gia tiên",
    image: "neta_cards/card_37.png",
    frequency: "Mặt Trời Luân Xa",
    group: "Gia Tiên Tiền Nhân",
    attribute: "Cội nguồn huyết thống",
    description: "Toàn thể hội đồng Cửu Huyền Thất Tổ, các bậc tiền nhân nhiều đời nhiều kiếp đang hiện diện nhắc nhở hoặc tiếp thêm cội rễ phước báu.",
    advice: "Uống nước nhớ nguồn. Hãy làm nhiều việc công đức, tạo dựng phúc lành nhân danh dòng họ để hồi hướng báo ân sâu nặng đến tổ tiên."
  },
  {
    id: 38,
    name: "Duyên vợ chồng",
    image: "neta_cards/card_38.png",
    frequency: "Thái Cực Nhật Nguyệt",
    group: "Nhân Duyên Cõi Trần",
    attribute: "Tơ hồng chính danh",
    description: "Mối duyên nợ phu thê sâu nặng đã định sẵn qua nhiều kiếp sống; sự gặp gỡ để cùng nhau xây dựng tổ ấm hoặc cùng trả nợ nhân quả yêu thương.",
    advice: "Trân trọng người bạn đời bên cạnh; lấy sự nhẫn nại, thấu hiểu và lòng bao dung làm kim chỉ nam để vun đắp hạnh phúc bền vững."
  },
  {
    id: 39,
    name: "Duyên âm",
    image: "neta_cards/card_39.png",
    frequency: "Giọt Nước Âm Dương",
    group: "Vấn Vương Tiền Duyên",
    attribute: "Vướng mắc tình cảm",
    description: "Một linh hồn ở cõi âm vì còn lưu luyến tình cảm xưa cũ nên đi theo bên cạnh, có thể gây trắc trở đường tình duyên thực tại hoặc sức khỏe.",
    advice: "Trò chuyện dứt khoát nhưng từ bi: trần và âm có lối đi riêng, xin hồi hướng mọi phước lành để người xưa sớm đi chuyển kiếp, giải thoát cho cả hai."
  },
  {
    id: 40,
    name: "Con âm",
    image: "neta_cards/card_40.png",
    frequency: "Xoắn Ốc Âm Dương",
    group: "Duyên Nợ Tử Tức",
    attribute: "Ràng buộc duyên phận",
    description: "Phần linh hồn con cái theo về từ cõi vô hình hoặc sợi dây ràng buộc nghiệp lực liên quan đến trách nhiệm sinh thành, dưỡng dục tâm linh.",
    advice: "Bao bọc bằng tâm niệm từ bi, nuôi dưỡng bằng năng lượng chánh niệm và thiện nguyện để chuyển hóa mọi oán hận thành hoa thơm trái ngọt."
  },
  {
    id: 41,
    name: "Vị thầy tâm linh",
    image: "neta_cards/card_41.png",
    frequency: "227 Song Ấn Vàng",
    group: "Bổn Tôn Dẫn Đạo",
    attribute: "Kết nối vi tế",
    description: "Vị Thầy Vô Vi (Master / Bổn Tôn Nadrasa Dehi) đang trực tiếp soi sáng tâm hồn bạn qua trực giác, giấc mơ hoặc những sự trùng hợp kỳ diệu.",
    advice: "Dành không gian yên tĩnh để lắng đọng tâm tư; vị Thầy luôn ở bên trong bạn, chỉ cần bạn tĩnh lặng là có thể cảm nhận trọn vẹn sự dẫn dắt."
  },
  {
    id: 42,
    name: "Thiên thần hộ mệnh nam",
    image: "neta_cards/card_42.png",
    frequency: "227 Kết Cấu Nam",
    group: "Vị Thánh Bảo Hộ",
    attribute: "Dũng lực che chở",
    description: "Vị Thánh thiên thần nam giới luôn kề cận bảo vệ bạn trong mọi chuyến đi, công việc và đối diện với những thế lực tiêu cực bên ngoài.",
    advice: "Tạ ơn Đấng bảo hộ vô hình. Hãy hành động mạnh mẽ, dứt khoát với tinh thần trượng nghĩa và lòng dũng cảm."
  },
  {
    id: 43,
    name: "Thiên thần hộ mệnh nữ",
    image: "neta_cards/card_43.png",
    frequency: "227 Kết Cấu Nữ",
    group: "Vị Thánh Bảo Hộ",
    attribute: "Dịu dàng vỗ về",
    description: "Vị Thánh thiên thần nữ giới mang năng lượng từ ái, xoa dịu những vết thương lòng, chữa lành cảm xúc và đem lại sự bình an diệu kỳ.",
    advice: "Hãy mở rộng trái tim để đón nhận sự dịu dàng của vũ trụ; tự tha thứ cho những lầm lỡ và nuôi dưỡng tâm hồn bằng tình yêu thương thuần khiết."
  },
  {
    id: 44,
    name: "Hộ pháp",
    image: "neta_cards/card_44.png",
    frequency: "227 Tọa Tướng Đỏ",
    group: "Chư Vị Hộ Trì",
    attribute: "Trấn áp tà ma",
    description: "Chư vị Hộ Pháp oai phong lẫm liệt, túc trực ngăn chặn ma chướng, bảo vệ đạo tràng và bảo vệ người chân tu không bị quấy nhiễu.",
    advice: "Sống chánh trực, trung thực và kiên định; năng lượng Hộ Pháp sẽ trở thành bức tường thành vững chắc che chở cho bạn."
  },
  {
    id: 45,
    name: "Pháp binh",
    image: "neta_cards/card_45.png",
    frequency: "227 Linh Phù Đỏ (1)",
    group: "Quân Đội Cõi Sáng",
    attribute: "Kỷ cương / Trật tự",
    description: "Đội ngũ binh tướng cõi sáng thi hành lệnh công lý tâm linh, lập lại trật tự và dọn sạch các cấu trúc năng lượng ô trược xung quanh bạn.",
    advice: "Giữ kỷ luật trong cuộc sống và tu tập; trật tự bên trong tâm trí sẽ kích hoạt sự tương ứng hài hòa với trật tự vũ trụ."
  },
  {
    id: 46,
    name: "Sứ giả",
    image: "neta_cards/card_46.png",
    frequency: "227 Linh Phù Đỏ (2)",
    group: "Đấng Truyền Tin",
    attribute: "Thông điệp vũ trụ",
    description: "Sứ giả tâm linh mang đến những tin tức quan trọng, những dấu hiệu chỉ đường hoặc mở ra những cơ hội bất ngờ ngoài mong đợi.",
    advice: "Chú ý quan sát các dấu hiệu đồng quy (synchronicity) trong cuộc sống hàng ngày; vũ trụ đang gửi những lời nhắn nhủ dẫn lối cho bạn."
  },
  {
    id: 47,
    name: "Ấn chữ vạn",
    image: "neta_cards/card_47.png",
    frequency: "ĐẠI ẤN CHỮ VẠN ĐỎ",
    group: "Biểu Tượng Viên Mãn",
    attribute: "Đại từ bi / Cứu độ",
    description: "Biểu tượng Chữ Vạn xoay vần bất tận mang dòng năng lượng vi diệu của mười phương Chư Phật, chuyển hóa mọi nghịch cảnh thành thuận duyên.",
    advice: "Phúc đức viên mãn! Hãy an tâm cống hiến và phụng sự nhân sinh; năng lượng Chữ Vạn luôn chiếu sáng vạn nẻo đường bạn đi."
  },
  {
    id: 48,
    name: "Quan thần linh",
    image: "neta_cards/card_48.png",
    frequency: "227 Nút Dây Đỏ",
    group: "Chánh Thần Bản Xứ",
    attribute: "Công lý / Chứng giám",
    description: "Vị Quan Thần Linh chính danh cai quản địa bàn khu vực, nắm giữ sổ ghi nhận công tội và phân xử công minh các vấn đề âm dương.",
    advice: "Kính trọng bề trên, giữ gìn phẩm hạnh trong sạch; việc ngay thẳng không thẹn với lương tâm thì trời đất quỷ thần đều kính trọng phù trợ."
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = NETA_CARDS_DATA;
}
