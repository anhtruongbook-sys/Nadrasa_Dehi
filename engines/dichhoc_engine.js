/**
 * NETA LIGHT - DỊCH HỌC ENGINE (LỤC HÀO NẠP GIÁP & MAI HOA DỊCH SỐ)
 * Thuật toán kinh điển Dã Hạc Lão Nhân (Bốc Phệ Chính Tông) & Thiệu Ung (Mai Hoa Dịch Số).
 * Tích hợp 100% đồng bộ với NetaCalendarEngine (Tiết Khí, Can Chi, Nguyệt Lệnh, Nhật Thần).
 */

(function (global) {
  'use strict';

  // 1. DỮ LIỆU BÁT QUÁI ĐƠN (TRIGRAMS)
  // bits: [hào 1, hào 2, hào 3] (0 = Âm -- --, 1 = Dương ------)
  const TRIGRAM_DATA = {
    'Can': {
      id: 'Can', name: 'Càn', nature: 'Thiên', symbol: '☰',
      bits: [1, 1, 1], tien_thien: 1, hau_thien: 6,
      element: 'Kim', direction: 'Tây Bắc'
    },
    'Doai': {
      id: 'Doai', name: 'Đoài', nature: 'Trạch', symbol: '☱',
      bits: [1, 1, 0], tien_thien: 2, hau_thien: 7,
      element: 'Kim', direction: 'Tây'
    },
    'Ly': {
      id: 'Ly', name: 'Ly', nature: 'Hỏa', symbol: '☲',
      bits: [1, 0, 1], tien_thien: 3, hau_thien: 9,
      element: 'Hỏa', direction: 'Nam'
    },
    'Chan': {
      id: 'Chan', name: 'Chấn', nature: 'Lôi', symbol: '☳',
      bits: [1, 0, 0], tien_thien: 4, hau_thien: 3,
      element: 'Mộc', direction: 'Đông'
    },
    'Ton': {
      id: 'Ton', name: 'Tốn', nature: 'Phong', symbol: '☴',
      bits: [0, 1, 1], tien_thien: 5, hau_thien: 4,
      element: 'Mộc', direction: 'Đông Nam'
    },
    'Kham': {
      id: 'Kham', name: 'Khảm', nature: 'Thủy', symbol: '☵',
      bits: [0, 1, 0], tien_thien: 6, hau_thien: 1,
      element: 'Thủy', direction: 'Bắc'
    },
    'Can_M': {
      id: 'Can_M', name: 'Cấn', nature: 'Sơn', symbol: '☶',
      bits: [0, 0, 1], tien_thien: 7, hau_thien: 8,
      element: 'Thổ', direction: 'Đông Bắc'
    },
    'Khon': {
      id: 'Khon', name: 'Khôn', nature: 'Địa', symbol: '☷',
      bits: [0, 0, 0], tien_thien: 8, hau_thien: 2,
      element: 'Thổ', direction: 'Tây Nam'
    }
  };

  // Helper chuyển bits sang key quái
  function bitsToKey(b0, b1, b2) {
    const keyStr = `${b0},${b1},${b2}`;
    for (const k in TRIGRAM_DATA) {
      const b = TRIGRAM_DATA[k].bits;
      if (b[0] === b0 && b[1] === b1 && b[2] === b2) return k;
    }
    return 'Can';
  }

  function tienThienToKey(num) {
    let n = ((num - 1) % 8 + 8) % 8 + 1;
    for (const k in TRIGRAM_DATA) {
      if (TRIGRAM_DATA[k].tien_thien === n) return k;
    }
    return 'Khon';
  }

  // 2. BẢNG 64 QUẺ KÉP (HEXAGRAMS) & TƯỢNG QUẺ KINH ĐIỂN
  const HEXAGRAM_NAMES = {
    'Can,Can': { name: 'Bát Thuần Càn', tuong: 'Khốn long đắc thủy', tho: 'Cương kiện trung chính, hanh thông đại cát.' },
    'Can,Doai': { name: 'Thiên Trạch Lý', tuong: 'Hổ khẩu bạt tu', tho: 'Dẫm đuôi cọp dữ, cẩn trọng vượt nguy.' },
    'Can,Ly': { name: 'Thiên Hỏa Đồng Nhân', tuong: 'Tiên nhân chỉ lộ', tho: 'Đồng lòng cùng người, văn minh sáng suốt.' },
    'Can,Chan': { name: 'Thiên Lôi Vô Vọng', tuong: 'Điểu quỳnh lao lung', tho: 'Chân thật không càn bậy, thuận theo tự nhiên.' },
    'Can,Ton': { name: 'Thiên Phong Cấu', tuong: 'Tha hương ngộ hữu', tho: 'Gặp gỡ bất ngờ, nữ thế đang lên.' },
    'Can,Kham': { name: 'Thiên Thủy Tụng', tuong: 'Dĩ trung kiến trực', tho: 'Tranh chấp kiện tụng, nên hòa chớ tranh.' },
    'Can,Can_M': { name: 'Thiên Sơn Độn', tuong: 'Nùng vân tế nhật', tho: 'Ẩn nhẫn thoái lui, bảo toàn nguyên khí.' },
    'Can,Khon': { name: 'Thiên Địa Bĩ', tuong: 'Hổ lạc hãm khanh', tho: 'Bế tắc ngăn trở, quân tử giữ mình.' },

    'Doai,Can': { name: 'Trạch Thiên Quải', tuong: 'Du phong thoát võng', tho: 'Dứt khoát đoạn tuyệt, quyết đoán trừ tà.' },
    'Doai,Doai': { name: 'Bát Thuần Đoài', tuong: 'Lưỡng trạch tương tư', tho: 'Vui vẻ hòa nhã, bạn bè trao đổi.' },
    'Doai,Ly': { name: 'Trạch Hỏa Cách', tuong: 'Hạn miêu đắc vũ', tho: 'Cách mạng cải biến, thay cũ đổi mới.' },
    'Doai,Chan': { name: 'Trạch Lôi Tùy', tuong: 'Đẩy xe trên cát', tho: 'Tùy cơ ứng biến, thuận thời theo người.' },
    'Doai,Ton': { name: 'Trạch Phong Đại Quá', tuong: 'Dạ quá thuyền kiều', tho: 'Gánh nặng quá sức, rường cột lung lay.' },
    'Doai,Kham': { name: 'Trạch Thủy Khốn', tuong: 'Thoát lãng trùu đê', tho: 'Cùng đường chịu khốn, tôi rèn ý chí.' },
    'Doai,Can_M': { name: 'Trạch Sơn Hàm', tuong: 'Manh nha xuất thổ', tho: 'Cảm ứng giao hòa, nam nữ tình duyên.' },
    'Doai,Khon': { name: 'Trạch Địa Tụy', tuong: 'Ngư ông đắc lợi', tho: 'Thu hút tụ họp, tinh hoa quần tụ.' },

    'Ly,Can': { name: 'Hỏa Thiên Đại Hữu', tuong: 'Kho kim mãn ốc', tho: 'Có lớn thu hoạch, quang minh rực rỡ.' },
    'Ly,Doai': { name: 'Hỏa Trạch Khuê', tuong: 'Thái công bất ngộ', tho: 'Trái ý chia rẽ, bất đồng quan điểm.' },
    'Ly,Ly': { name: 'Bát Thuần Ly', tuong: 'Thiên la địa võng', tho: 'Sáng suốt bám tựa, cần giữ lòng chính.' },
    'Ly,Chan': { name: 'Hỏa Lôi Phệ Hạp', tuong: 'Cắn đứt vật cản', tho: 'Trừ bỏ chướng ngại, hình pháp công minh.' },
    'Ly,Ton': { name: 'Hỏa Phong Đỉnh', tuong: 'Ngư ông đắc lộc', tho: 'Đúc đỉnh lập nghiệp, vững vàng đổi mới.' },
    'Ly,Kham': { name: 'Hỏa Thủy Vị Tế', tuong: 'Hồ thiệp đại xuyên', tho: 'Chưa xong việc đời, tiếp tục nỗ lực.' },
    'Ly,Can_M': { name: 'Hỏa Sơn Lữ', tuong: 'Điểu thiêu sào huyệt', tho: 'Khách đi đường xa, an phận thủ thường.' },
    'Ly,Khon': { name: 'Hỏa Địa Tấn', tuong: 'Long kiếm xuất hạp', tho: 'Tiến bước thăng tiến, ánh sáng chan hòa.' },

    'Chan,Can': { name: 'Lôi Thiên Đại Tráng', tuong: 'Dương trù xúc phiên', tho: 'Khí thế mạnh mẽ, chớ dùng bạo lực.' },
    'Chan,Doai': { name: 'Lôi Trạch Quy Muội', tuong: 'Duyên mộc cầu ngư', tho: 'Lấy chồng lệch hướng, khởi đầu sai lầm.' },
    'Chan,Ly': { name: 'Lôi Hỏa Phong', tuong: 'Cổ kính trùng minh', tho: 'Thịnh vượng dồi dào, lo lúc xế bóng.' },
    'Chan,Chan': { name: 'Bát Thuần Chấn', tuong: 'Kim chung dạ hưởng', tho: 'Sấm vang kinh động, tu tâm dưỡng tính.' },
    'Chan,Ton': { name: 'Lôi Phong Hằng', tuong: 'Ngư ông lạc đạo', tho: 'Lâu dài bền vững, trước sau như một.' },
    'Chan,Kham': { name: 'Lôi Thủy Giải', tuong: 'Vũ quá thiên tình', tho: 'Giải tỏa tai ách, khoan dung tha thứ.' },
    'Chan,Can_M': { name: 'Lôi Sơn Tiểu Quá', tuong: 'Phi điểu di âm', tho: 'Vượt qua một chút, nên làm việc nhỏ.' },
    'Chan,Khon': { name: 'Lôi Địa Dự', tuong: 'Thanh long đắc vị', tho: 'Vui vẻ hòa thuận, hưng khởi tiến hành.' },

    'Ton,Can': { name: 'Phong Thiên Tiểu Súc', tuong: 'Mật vân bất vũ', tho: 'Mây dày chưa mưa, tích lũy điều nhỏ.' },
    'Ton,Doai': { name: 'Phong Trạch Trung Phu', tuong: 'Hạc minh tại âm', tho: 'Thành tín tận tâm, cảm động muôn loài.' },
    'Ton,Ly': { name: 'Phong Hỏa Gia Nhân', tuong: 'Khai hoa kết quả', tho: 'Gia đình trong ấm, tề gia trị quốc.' },
    'Ton,Chan': { name: 'Phong Lôi Ích', tuong: 'Khô mộc phùng xuân', tho: 'Tăng thêm bồi đắp, giúp dân làm lợi.' },
    'Ton,Ton': { name: 'Bát Thuần Tốn', tuong: 'Dạ nhập u lâm', tho: 'Thuận tòng khiêm nhường, gió thổi lan xa.' },
    'Ton,Kham': { name: 'Phong Thủy Hoán', tuong: 'Cách hà vọng kim', tho: 'Ly tán giải tỏa, đổi mới lòng người.' },
    'Ton,Can_M': { name: 'Phong Sơn Tiệm', tuong: 'Phượng hoàng lai nghi', tho: 'Tiến bước tuần tự, chắc chắn lâu dài.' },
    'Ton,Khon': { name: 'Phong Địa Quan', tuong: 'Hạc lập kê quần', tho: 'Quan sát ngắm trông, làm gương thiên hạ.' },

    'Kham,Can': { name: 'Thủy Thiên Nhu', tuong: 'Minh châu xuất thổ', tho: 'Chờ đợi thời cơ, vui hưởng tiệc tùng.' },
    'Kham,Doai': { name: 'Thủy Trạch Tiết', tuong: 'Trảm thảo trừ căn', tho: 'Tiết độ có chừng, giữ gìn chừng mực.' },
    'Kham,Ly': { name: 'Thủy Hỏa Ký Tế', tuong: 'Kim bảng đề danh', tho: 'Đã xong mọi sự, phòng ngừa suy vi.' },
    'Kham,Chan': { name: 'Thủy Lôi Truân', tuong: 'Loạn ti vô đầu', tho: 'Gian nan buổi đầu, cần người dẫn lối.' },
    'Kham,Ton': { name: 'Thủy Phong Tỉnh', tuong: 'Khô tỉnh sinh tuyền', tho: 'Giếng nước dưỡng người, không vơi không cạn.' },
    'Kham,Kham': { name: 'Bát Thuần Khảm', tuong: 'Thủy để lao nguyệt', tho: 'Trùng trùng hiểm trở, giữ lòng kiên trinh.' },
    'Kham,Can_M': { name: 'Thủy Sơn Kiển', tuong: 'Vũ tuyết đồ thồ', tho: 'Đường đi khó khăn, nên dừng suy xét.' },
    'Kham,Khon': { name: 'Thủy Địa Tỷ', tuong: 'Thuyền đắc thuận phong', tho: 'Thân thiết nương tựa, kết bạn đồng lòng.' },

    'Can_M,Can': { name: 'Sơn Thiên Đại Súc', tuong: 'Đồng điền đắc mễ', tho: 'Tích chứa điều lớn, nuôi dưỡng hiền tài.' },
    'Can_M,Doai': { name: 'Sơn Trạch Tổn', tuong: 'Thôi xa lạc nhai', tho: 'Bớt mình giúp người, tổn trước ích sau.' },
    'Can_M,Ly': { name: 'Sơn Hỏa Bí', tuong: 'Bạch hổ bạt trảo', tho: 'Trang sức văn vẻ, bên trong thuần phác.' },
    'Can_M,Chan': { name: 'Sơn Lôi Di', tuong: 'Khẩu thực điều dưỡng', tho: 'Nuôi dưỡng chính đạo, xem lời ăn nói.' },
    'Can_M,Ton': { name: 'Sơn Phong Cổ', tuong: 'Thiềm thừ lạc tỉnh', tho: 'Mục nát đổ nát, sửa chữa việc xưa.' },
    'Can_M,Kham': { name: 'Sơn Thủy Mông', tuong: 'Mù mịt mở lối', tho: 'Khai sáng mông muội, học hỏi thầy hay.' },
    'Can_M,Can_M': { name: 'Bát Thuần Cấn', tuong: 'Thế như bàn thạch', tho: 'Dừng lại tĩnh lặng, thấy núi dừng chân.' },
    'Can_M,Khon': { name: 'Sơn Địa Bác', tuong: 'Oanh sào lạc địa', tho: 'Rơi rụng bào mòn, tiểu nhân lấn lướt.' },

    'Khon,Can': { name: 'Địa Thiên Thái', tuong: 'Hỷ báo tam nguyên', tho: 'Trời đất giao hòa, thái bình thịnh trị.' },
    'Khon,Doai': { name: 'Địa Trạch Lâm', tuong: 'Phát chính thi nhân', tho: 'Đến gần bao dung, dạy dân vỗ về.' },
    'Khon,Ly': { name: 'Địa Hỏa Minh Di', tuong: 'Quá kiều trừu bản', tho: 'Ánh sáng bị thương, giấu tài giữ mạng.' },
    'Khon,Chan': { name: 'Địa Lôi Phục', tuong: 'Phu thê phản mục', tho: 'Trở lại đạo lành, dương khí phục sinh.' },
    'Khon,Ton': { name: 'Địa Phong Thăng', tuong: 'Chỉ thượng thiêm hoa', tho: 'Vươn lên cao lớn, mầm cây trồi lên.' },
    'Khon,Kham': { name: 'Địa Thủy Sư', tuong: 'Mã đáo thành công', tho: 'Kéo quân chinh phạt, tướng soái nghiêm minh.' },
    'Khon,Can_M': { name: 'Địa Sơn Khiêm', tuong: 'Bạt hoa đắc kim', tho: 'Khiêm nhường đức độ, núi ẩn trong đất.' },
    'Khon,Khon': { name: 'Bát Thuần Khôn', tuong: 'Vạn vật sinh thành', tho: 'Nhu thuận bao dung, nâng đỡ vạn vật.' }
  };

  // 3. QUY TẮC NGŨ HÀNH
  const NGU_HANH_SINH = { 'Kim': 'Thủy', 'Thủy': 'Mộc', 'Mộc': 'Hỏa', 'Hỏa': 'Thổ', 'Thổ': 'Kim' };
  const NGU_HANH_KHAC = { 'Kim': 'Mộc', 'Mộc': 'Thổ', 'Thổ': 'Thủy', 'Thủy': 'Hỏa', 'Hỏa': 'Kim' };

  const DIA_CHI_NGU_HANH = {
    'Tý': 'Thủy', 'Sửu': 'Thổ', 'Dần': 'Mộc', 'Mão': 'Mộc',
    'Thìn': 'Thổ', 'Tỵ': 'Hỏa', 'Ngọ': 'Hỏa', 'Mùi': 'Thổ',
    'Thân': 'Kim', 'Dậu': 'Kim', 'Tuất': 'Thổ', 'Hợi': 'Thủy'
  };

  // 4. NẠP GIÁP CAN CHI (Tiêu Diên Thọ & Kinh Phòng)
  const NAP_GIAP = {
    'Can': {
      noi: [['Giáp', 'Tý'], ['Giáp', 'Dần'], ['Giáp', 'Thìn']],
      ngoai: [['Nhâm', 'Ngọ'], ['Nhâm', 'Thân'], ['Nhâm', 'Tuất']]
    },
    'Khon': {
      noi: [['Ất', 'Mùi'], ['Ất', 'Tỵ'], ['Ất', 'Mão']],
      ngoai: [['Quý', 'Sửu'], ['Quý', 'Hợi'], ['Quý', 'Dậu']]
    },
    'Chan': {
      noi: [['Canh', 'Tý'], ['Canh', 'Dần'], ['Canh', 'Thìn']],
      ngoai: [['Canh', 'Ngọ'], ['Canh', 'Thân'], ['Canh', 'Tuất']]
    },
    'Ton': {
      noi: [['Tân', 'Sửu'], ['Tân', 'Hợi'], ['Tân', 'Dậu']],
      ngoai: [['Tân', 'Mùi'], ['Tân', 'Tỵ'], ['Tân', 'Mão']]
    },
    'Kham': {
      noi: [['Mậu', 'Dần'], ['Mậu', 'Thìn'], ['Mậu', 'Ngọ']],
      ngoai: [['Mậu', 'Thân'], ['Mậu', 'Tuất'], ['Mậu', 'Tý']]
    },
    'Ly': {
      noi: [['Kỷ', 'Mão'], ['Kỷ', 'Sửu'], ['Kỷ', 'Hợi']],
      ngoai: [['Kỷ', 'Dậu'], ['Kỷ', 'Mùi'], ['Kỷ', 'Tỵ']]
    },
    'Can_M': {
      noi: [['Bính', 'Thìn'], ['Bính', 'Ngọ'], ['Bính', 'Thân']],
      ngoai: [['Bính', 'Tuất'], ['Bính', 'Tý'], ['Bính', 'Dần']]
    },
    'Doai': {
      noi: [['Đinh', 'Tỵ'], ['Đinh', 'Mão'], ['Đinh', 'Sửu']],
      ngoai: [['Đinh', 'Hợi'], ['Đinh', 'Dậu'], ['Đinh', 'Mùi']]
    }
  };

  // 5. TUẦN KHÔNG (60 HOA GIÁP)
  const TUAN_KHONG_MAP = {
    'Giáp Tý': ['Tuất', 'Hợi'], 'Ất Sửu': ['Tuất', 'Hợi'], 'Bính Dần': ['Tuất', 'Hợi'], 'Đinh Mão': ['Tuất', 'Hợi'],
    'Mậu Thìn': ['Tuất', 'Hợi'], 'Kỷ Tỵ': ['Tuất', 'Hợi'], 'Canh Ngọ': ['Tuất', 'Hợi'], 'Tân Mùi': ['Tuất', 'Hợi'],
    'Nhâm Thân': ['Tuất', 'Hợi'], 'Quý Dậu': ['Tuất', 'Hợi'],
    'Giáp Tuất': ['Thân', 'Dậu'], 'Ất Hợi': ['Thân', 'Dậu'], 'Bính Tý': ['Thân', 'Dậu'], 'Đinh Sửu': ['Thân', 'Dậu'],
    'Mậu Dần': ['Thân', 'Dậu'], 'Kỷ Mão': ['Thân', 'Dậu'], 'Canh Thìn': ['Thân', 'Dậu'], 'Tân Tỵ': ['Thân', 'Dậu'],
    'Nhâm Ngọ': ['Thân', 'Dậu'], 'Quý Mùi': ['Thân', 'Dậu'],
    'Giáp Thân': ['Ngọ', 'Mùi'], 'Ất Dậu': ['Ngọ', 'Mùi'], 'Bính Tuất': ['Ngọ', 'Mùi'], 'Đinh Hợi': ['Ngọ', 'Mùi'],
    'Mậu Tý': ['Ngọ', 'Mùi'], 'Kỷ Sửu': ['Ngọ', 'Mùi'], 'Canh Dần': ['Ngọ', 'Mùi'], 'Tân Mão': ['Ngọ', 'Mùi'],
    'Nhâm Thìn': ['Ngọ', 'Mùi'], 'Quý Tỵ': ['Ngọ', 'Mùi'],
    'Giáp Ngọ': ['Thìn', 'Tỵ'], 'Ất Mùi': ['Thìn', 'Tỵ'], 'Bính Thân': ['Thìn', 'Tỵ'], 'Đinh Dậu': ['Thìn', 'Tỵ'],
    'Mậu Tuất': ['Thìn', 'Tỵ'], 'Kỷ Hợi': ['Thìn', 'Tỵ'], 'Canh Tý': ['Thìn', 'Tỵ'], 'Tân Sửu': ['Thìn', 'Tỵ'],
    'Nhâm Dần': ['Thìn', 'Tỵ'], 'Quý Mão': ['Thìn', 'Tỵ'],
    'Giáp Thìn': ['Dần', 'Mão'], 'Ất Tỵ': ['Dần', 'Mão'], 'Bính Ngọ': ['Dần', 'Mão'], 'Đinh Mùi': ['Dần', 'Mão'],
    'Mậu Thân': ['Dần', 'Mão'], 'Kỷ Dậu': ['Dần', 'Mão'], 'Canh Tuất': ['Dần', 'Mão'], 'Tân Hợi': ['Dần', 'Mão'],
    'Nhâm Tý': ['Dần', 'Mão'], 'Quý Sửu': ['Dần', 'Mão'],
    'Giáp Dần': ['Tý', 'Sửu'], 'Ất Mão': ['Tý', 'Sửu'], 'Bính Thìn': ['Tý', 'Sửu'], 'Đinh Tỵ': ['Tý', 'Sửu'],
    'Mậu Ngọ': ['Tý', 'Sửu'], 'Kỷ Mùi': ['Tý', 'Sửu'], 'Canh Thân': ['Tý', 'Sửu'], 'Tân Dậu': ['Tý', 'Sửu'],
    'Nhâm Tuất': ['Tý', 'Sửu'], 'Quý Hợi': ['Tý', 'Sửu']
  };

  // 6. THẦN SÁT & VƯỢNG SUY
  function tinhThanSat(canNgay, chiNgay) {
    const quyNhanMap = {
      'Giáp': ['Sửu', 'Mùi'], 'Mậu': ['Sửu', 'Mùi'], 'Canh': ['Sửu', 'Mùi'],
      'Ất': ['Tý', 'Thân'], 'Kỷ': ['Tý', 'Thân'],
      'Bính': ['Hợi', 'Dậu'], 'Đinh': ['Hợi', 'Dậu'],
      'Nhâm': ['Mão', 'Tỵ'], 'Quý': ['Mão', 'Tỵ'],
      'Tân': ['Ngọ', 'Dần']
    };
    const locThanMap = {
      'Giáp': 'Dần', 'Ất': 'Mão', 'Bính': 'Tỵ', 'Mậu': 'Tỵ',
      'Đinh': 'Ngọ', 'Kỷ': 'Ngọ', 'Canh': 'Thân', 'Tân': 'Dậu',
      'Nhâm': 'Hợi', 'Quý': 'Tý'
    };
    const dichMaMap = {
      'Thân': 'Dần', 'Tý': 'Dần', 'Thìn': 'Dần',
      'Dần': 'Thân', 'Ngọ': 'Thân', 'Tuất': 'Thân',
      'Tỵ': 'Hợi', 'Dậu': 'Hợi', 'Sửu': 'Hợi',
      'Hợi': 'Tỵ', 'Mão': 'Tỵ', 'Mùi': 'Tỵ'
    };
    const daoHoaMap = {
      'Thân': 'Dậu', 'Tý': 'Dậu', 'Thìn': 'Dậu',
      'Dần': 'Mão', 'Ngọ': 'Mão', 'Tuất': 'Mão',
      'Tỵ': 'Ngọ', 'Dậu': 'Ngọ', 'Sửu': 'Ngọ',
      'Hợi': 'Tý', 'Mão': 'Tý', 'Mùi': 'Tý'
    };

    return {
      quy_nhan: quyNhanMap[canNgay] || [],
      loc_than: [locThanMap[canNgay] || ''],
      dich_ma: [dichMaMap[chiNgay] || ''],
      dao_hoa: [daoHoaMap[chiNgay] || '']
    };
  }

  // Khẩu quyết An Quái Thân (Quái Thần):
  // Âm thế khởi Ngọ thuận hành chi, Dương thế khởi Tý thuận hành chi.
  function tinhQuaiThan(thePos, theBit) {
    // thePos: 1..6; theBit: 0 (Âm), 1 (Dương)
    const zhiOrder = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
    const startZhi = (theBit === 1) ? 'Tý' : 'Ngọ';
    const startIdx = zhiOrder.indexOf(startZhi);
    const quaiThanIdx = (startIdx + (thePos - 1)) % 12;
    return zhiOrder[quaiThanIdx];
  }

  // Nhận diện Quẻ Lục Xung & Lục Hợp kinh điển
  function getHexagramSpecialType(bits) {
    const haKey = bitsToKey(bits[0], bits[1], bits[2]);
    const thuongKey = bitsToKey(bits[3], bits[4], bits[5]);
    const combo = `${thuongKey},${haKey}`;
    // 8 Bát Thuần + Thiên Lôi Vô Vọng + Lôi Thiên Đại Tráng
    const lucXungKeys = [
      'Can,Can', 'Khon,Khon', 'Chan,Chan', 'Ton,Ton',
      'Kham,Kham', 'Ly,Ly', 'Can_M,Can_M', 'Doai,Doai',
      'Can,Chan', 'Chan,Can'
    ];
    if (lucXungKeys.includes(combo)) return 'LỤC XUNG';

    // Lục Hợp: Địa Thiên Thái, Thiên Địa Bĩ, Thủy Hỏa Ký Tế, Hỏa Thủy Vị Tế, Địa Lôi Phục, Sơn Hỏa Bí, Phong Lôi Ích
    const lucHopKeys = [
      'Khon,Can', 'Can,Khon', 'Kham,Ly', 'Ly,Kham',
      'Khon,Chan', 'Can_M,Ly', 'Ton,Chan'
    ];
    if (lucHopKeys.includes(combo)) return 'LỤC HỢP';
    return '';
  }

  function tinhVuongSuy(thangChi, haoChi) {
    if (!thangChi || !haoChi) return '-';
    const thangElm = DIA_CHI_NGU_HANH[thangChi];
    const haoElm = DIA_CHI_NGU_HANH[haoChi];
    if (!thangElm || !haoElm) return '-';

    if (haoElm === thangElm) return 'Vượng';
    if (NGU_HANH_SINH[thangElm] === haoElm) return 'Tướng';
    if (NGU_HANH_SINH[haoElm] === thangElm) return 'Hưu';
    if (NGU_HANH_KHAC[haoElm] === thangElm) return 'Tù';
    if (NGU_HANH_KHAC[thangElm] === haoElm) return 'Tử';
    return '-';
  }

  // 7. BÁT CUNG & THẾ ỨNG TABLE
  const PALACES = ['Can', 'Kham', 'Can_M', 'Chan', 'Ton', 'Ly', 'Khon', 'Doai'];
  const PALACE_ELEMENTS = {
    'Can': 'Kim', 'Doai': 'Kim', 'Ly': 'Hỏa', 'Chan': 'Mộc',
    'Ton': 'Mộc', 'Kham': 'Thủy', 'Can_M': 'Thổ', 'Khon': 'Thổ'
  };

  const HEXAGRAM_TO_PALACE_MAP = {};
  const PURE_HEXAGRAM_CACHE = {};

  (function initPalaceTables() {
    PALACES.forEach(pal => {
      const baseTrigramBits = TRIGRAM_DATA[pal].bits;
      const baseBits = [...baseTrigramBits, ...baseTrigramBits];
      const baseKey = baseBits.join(',');
      PURE_HEXAGRAM_CACHE[pal] = baseBits;

      // 1. Thuần quái (Thế 6, Ứng 3)
      HEXAGRAM_TO_PALACE_MAP[baseKey] = { palace: pal, type: 'Bản Cung', the: 6, ung: 3 };

      // 2. Nhất thế: Biến hào 1 (Thế 1, Ứng 4)
      const q1 = [...baseBits]; q1[0] ^= 1;
      HEXAGRAM_TO_PALACE_MAP[q1.join(',')] = { palace: pal, type: 'Nhất Thế', the: 1, ung: 4 };

      // 3. Nhị thế: Biến tiếp hào 2 (Thế 2, Ứng 5)
      const q2 = [...q1]; q2[1] ^= 1;
      HEXAGRAM_TO_PALACE_MAP[q2.join(',')] = { palace: pal, type: 'Nhị Thế', the: 2, ung: 5 };

      // 4. Tam thế: Biến tiếp hào 3 (Thế 3, Ứng 6)
      const q3 = [...q2]; q3[2] ^= 1;
      HEXAGRAM_TO_PALACE_MAP[q3.join(',')] = { palace: pal, type: 'Tam Thế', the: 3, ung: 6 };

      // 5. Tứ thế: Biến tiếp hào 4 (Thế 4, Ứng 1)
      const q4 = [...q3]; q4[3] ^= 1;
      HEXAGRAM_TO_PALACE_MAP[q4.join(',')] = { palace: pal, type: 'Tứ Thế', the: 4, ung: 1 };

      // 6. Ngũ thế: Biến tiếp hào 5 (Thế 5, Ứng 2)
      const q5 = [...q4]; q5[4] ^= 1;
      HEXAGRAM_TO_PALACE_MAP[q5.join(',')] = { palace: pal, type: 'Ngũ Thế', the: 5, ung: 2 };

      // 7. Du Hồn: Biến ngược lại hào 4 (Thế 4, Ứng 1)
      const q6 = [...q5]; q6[3] ^= 1;
      HEXAGRAM_TO_PALACE_MAP[q6.join(',')] = { palace: pal, type: 'Du Hồn', the: 4, ung: 1 };

      // 8. Quy Hồn: Biến cả 3 hào Nội quái trở về ban đầu (Thế 3, Ứng 6)
      const q7 = [...q6];
      q7[0] = baseBits[0];
      q7[1] = baseBits[1];
      q7[2] = baseBits[2];
      HEXAGRAM_TO_PALACE_MAP[q7.join(',')] = { palace: pal, type: 'Quy Hồn', the: 3, ung: 6 };
    });
  })();

  function tinhLucThan(cungElement, haoElement) {
    if (haoElement === cungElement) return 'Huynh Đệ';
    if (NGU_HANH_SINH[haoElement] === cungElement) return 'Phụ Mẫu';
    if (NGU_HANH_SINH[cungElement] === haoElement) return 'Tử Tôn';
    if (NGU_HANH_KHAC[haoElement] === cungElement) return 'Quan Quỷ';
    if (NGU_HANH_KHAC[cungElement] === haoElement) return 'Thê Tài';
    return '-';
  }

  const LUC_THU_ORDER = ['Thanh Long', 'Chu Tước', 'Câu Trần', 'Đằng Xà', 'Bạch Hổ', 'Huyền Vũ'];
  const CAN_NGAY_LUC_THU_START = {
    'Giáp': 'Thanh Long', 'Ất': 'Thanh Long',
    'Bính': 'Chu Tước', 'Đinh': 'Chu Tước',
    'Mậu': 'Câu Trần',
    'Kỷ': 'Đằng Xà',
    'Canh': 'Bạch Hổ', 'Tân': 'Bạch Hổ',
    'Nhâm': 'Huyền Vũ', 'Quý': 'Huyền Vũ'
  };

  // =========================================================================
  // 8. ĐỘNG CƠ MAI HOA DỊCH SỐ (THIỆU KHANG TIẾT)
  // =========================================================================
  const MaiHoaEngine = {
    lapQueThoiGian(namZhiIndex, thangAm, ngayAm, gioZhiIndex, calendarContext = {}) {
      const zhiNames = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

      // Hỗ trợ truyền thẳng calendarContext (lấy từ NetaCalendarEngine) làm đối số thứ 1
      if (typeof namZhiIndex === 'object' && namZhiIndex !== null) {
        calendarContext = namZhiIndex;
        const canChi = calendarContext.canChi || {};
        const namZhi = canChi.yearZhi || (canChi.year ? canChi.year.split(' ')[1] : 'Ngọ');
        namZhiIndex = zhiNames.indexOf(namZhi) + 1;

        // BẮT BUỘC: Tháng Mai Hoa lấy chuẩn xác theo 12 Tiết Lệnh từ NetaCalendarEngine
        thangAm = (calendarContext.monthStep !== undefined)
          ? (calendarContext.monthStep + 1)
          : (canChi.monthZhi ? ((zhiNames.indexOf(canChi.monthZhi) - 2 + 12) % 12 + 1) : 8);

        ngayAm = (calendarContext.lunar && calendarContext.lunar.day) ? calendarContext.lunar.day : 1;
        const gioZhi = canChi.hourZhi || (canChi.hour ? canChi.hour.split(' ')[1] : 'Hợi');
        gioZhiIndex = zhiNames.indexOf(gioZhi) + 1;
      }

      // namZhiIndex: 1..12 (Tý=1, Sửu=2...)
      // gioZhiIndex: 1..12
      let sumThuong = Number(namZhiIndex) + Number(thangAm) + Number(ngayAm);
      let thuongNum = sumThuong % 8;
      if (thuongNum === 0) thuongNum = 8;

      let sumHa = sumThuong + Number(gioZhiIndex);
      let haNum = sumHa % 8;
      if (haNum === 0) haNum = 8;

      let dongNum = sumHa % 6;
      if (dongNum === 0) dongNum = 6;

      return this.xayDungQue(thuongNum, haNum, dongNum, calendarContext);
    },

    lapQueTheoHaiSo(soA, soB, gioZhiIndex = 0, calendarContext = {}) {
      const zhiNames = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
      if (typeof gioZhiIndex === 'object' && gioZhiIndex !== null) {
        calendarContext = gioZhiIndex;
        const canChi = calendarContext.canChi || {};
        const gioZhi = canChi.hourZhi || (canChi.hour ? canChi.hour.split(' ')[1] : 'Hợi');
        gioZhiIndex = zhiNames.indexOf(gioZhi) + 1;
      }
      if (gioZhiIndex === 0 && calendarContext.canChi) {
        const gz = calendarContext.canChi.hourZhi || (calendarContext.canChi.hour ? calendarContext.canChi.hour.split(' ')[1] : 'Hợi');
        gioZhiIndex = zhiNames.indexOf(gz) + 1;
      }

      let thuongNum = Number(soA) % 8;
      if (thuongNum === 0) thuongNum = 8;

      let haNum = Number(soB) % 8;
      if (haNum === 0) haNum = 8;

      let tong = Number(soA) + Number(soB) + Number(gioZhiIndex || 0);
      let dongNum = tong % 6;
      if (dongNum === 0) dongNum = 6;

      return this.xayDungQue(thuongNum, haNum, dongNum, calendarContext);
    },

    xayDungQue(thuongNum, haNum, dongNum, calendarContext = {}) {
      const thuongKey = tienThienToKey(thuongNum);
      const haKey = tienThienToKey(haNum);

      const bitsHa = TRIGRAM_DATA[haKey].bits;       // (h1, h2, h3)
      const bitsThuong = TRIGRAM_DATA[thuongKey].bits; // (h4, h5, h6)
      const chuBits = [...bitsHa, ...bitsThuong];

      // Quẻ Hỗ:
      // Hạ hỗ: hào 2, 3, 4
      const haHoKey = bitsToKey(chuBits[1], chuBits[2], chuBits[3]);
      // Thượng hỗ: hào 3, 4, 5
      const thuongHoKey = bitsToKey(chuBits[2], chuBits[3], chuBits[4]);
      const hoBits = [chuBits[1], chuBits[2], chuBits[3], chuBits[2], chuBits[3], chuBits[4]];

      // Quẻ Biến:
      const bienBits = [...chuBits];
      const idxDong = dongNum - 1;
      bienBits[idxDong] ^= 1;

      const haBienKey = bitsToKey(bienBits[0], bienBits[1], bienBits[2]);
      const thuongBienKey = bitsToKey(bienBits[3], bienBits[4], bienBits[5]);

      // Bát Cung & Lục Xung cho 3 Quẻ
      const chuKey = chuBits.join(',');
      const chuPalaceInfo = HEXAGRAM_TO_PALACE_MAP[chuKey] || { palace: 'Can', type: 'Bản Cung' };
      const chuCungName = TRIGRAM_DATA[chuPalaceInfo.palace].name;
      const chuSpecial = getHexagramSpecialType(chuBits);

      const hoKey = hoBits.join(',');
      const hoPalaceInfo = HEXAGRAM_TO_PALACE_MAP[hoKey] || { palace: 'Can', type: 'Bản Cung' };
      const hoCungName = TRIGRAM_DATA[hoPalaceInfo.palace].name;
      const hoSpecial = getHexagramSpecialType(hoBits);

      const bienKey = bienBits.join(',');
      const bienPalaceInfo = HEXAGRAM_TO_PALACE_MAP[bienKey] || { palace: 'Can', type: 'Bản Cung' };
      const bienCungName = TRIGRAM_DATA[bienPalaceInfo.palace].name;
      const bienSpecial = getHexagramSpecialType(bienBits);

      // Thể - Dụng:
      let theKey, theViTri, dungKey, dungViTri;
      if (dongNum <= 3) {
        theKey = thuongKey;
        theViTri = 'Thượng Quái (Ngoại)';
        dungKey = haKey;
        dungViTri = 'Hạ Quái (Nội)';
      } else {
        theKey = haKey;
        theViTri = 'Hạ Quái (Nội)';
        dungKey = thuongKey;
        dungViTri = 'Thượng Quái (Ngoại)';
      }

      const theElm = TRIGRAM_DATA[theKey].element;
      const dungElm = TRIGRAM_DATA[dungKey].element;

      let quanHe = 'Tỷ hòa';
      let danhGia = 'Tỷ hòa (Đồng hành: Cát lợi, bè bạn tương trợ, việc diễn tiến êm đẹp)';
      let mucDo = 'cat';

      if (dungElm === theElm) {
        quanHe = 'Tỷ hòa';
        danhGia = 'Tỷ hòa (Đồng hành: Cát tường, có quý nhân tương trợ, công việc thuận buồm xuôi gió)';
        mucDo = 'cat';
      } else if (NGU_HANH_SINH[dungElm] === theElm) {
        quanHe = 'Dụng sinh Thể';
        danhGia = 'Dụng sinh Thể (Đại cát: Cơ hội và tài lộc tự tìm đến, vạn sự hanh thông, không nhọc lòng)';
        mucDo = 'dai_cat';
      } else if (NGU_HANH_KHAC[theElm] === dungElm) {
        quanHe = 'Thể khắc Dụng';
        danhGia = 'Thể khắc Dụng (Tiểu cát: Chủ sự khống chế được tình hình, có nỗ lực ắt thu về quả ngọt)';
        mucDo = 'tieu_cat';
      } else if (NGU_HANH_SINH[theElm] === dungElm) {
        quanHe = 'Thể sinh Dụng';
        danhGia = 'Thể sinh Dụng (Tiết khí: Hao tâm tổn trí, bỏ công sức giúp người, lợi lộc bị phân tán)';
        mucDo = 'tieu_hung';
      } else if (NGU_HANH_KHAC[dungElm] === theElm) {
        quanHe = 'Dụng khắc Thể';
        danhGia = 'Dụng khắc Thể (Đại hung: Gặp trở ngại ngăn cản, đề phòng tổn thất tài vật hoặc thị phi)';
        mucDo = 'dai_hung';
      }

      const chuInfo = HEXAGRAM_NAMES[`${thuongKey},${haKey}`] || { name: 'Chưa đặt tên', tuong: '', tho: '' };
      const hoInfo = HEXAGRAM_NAMES[`${thuongHoKey},${haHoKey}`] || { name: 'Chưa đặt tên', tuong: '', tho: '' };
      const bienInfo = HEXAGRAM_NAMES[`${thuongBienKey},${haBienKey}`] || { name: 'Chưa đặt tên', tuong: '', tho: '' };

      // Lập bảng Lục Hào Nạp Giáp cho Mai Hoa (chuẩn Bốc Phệ)
      const haoCoins = [];
      for (let i = 0; i < 6; i++) {
        if (i === idxDong) {
          haoCoins.push(chuBits[i] === 0 ? 6 : 9); // Động
        } else {
          haoCoins.push(chuBits[i] === 0 ? 8 : 7); // Tĩnh
        }
      }
      let lucHaoResult = null;
      try {
        lucHaoResult = LucHaoEngine.lapQue(haoCoins, calendarContext);
      } catch (e) {
        console.error('Error generating LucHao for MaiHoa:', e);
      }

      return {
        que_chu: {
          name: chuInfo.name,
          tuong: chuInfo.tuong,
          tho: chuInfo.tho,
          cung: chuCungName,
          cungSpecial: chuSpecial,
          thuong_quai: TRIGRAM_DATA[thuongKey],
          ha_quai: TRIGRAM_DATA[haKey],
          bits: chuBits
        },
        que_ho: {
          name: hoInfo.name,
          tuong: hoInfo.tuong,
          tho: hoInfo.tho,
          cung: hoCungName,
          cungSpecial: hoSpecial,
          thuong_ho: TRIGRAM_DATA[thuongHoKey],
          ha_ho: TRIGRAM_DATA[haHoKey],
          bits: hoBits
        },
        que_bien: {
          name: bienInfo.name,
          tuong: bienInfo.tuong,
          tho: bienInfo.tho,
          cung: bienCungName,
          cungSpecial: bienSpecial,
          thuong_bien: TRIGRAM_DATA[thuongBienKey],
          ha_bien: TRIGRAM_DATA[haBienKey],
          bits: bienBits
        },
        hao_dong: dongNum,
        the_dung: {
          the: { key: theKey, info: TRIGRAM_DATA[theKey], vi_tri: theViTri },
          dung: { key: dungKey, info: TRIGRAM_DATA[dungKey], vi_tri: dungViTri },
          quan_he: quanHe,
          danh_gia: danhGia,
          muc_do: mucDo
        },
        thoi_gian: (lucHaoResult && lucHaoResult.thoi_gian) ? lucHaoResult.thoi_gian : {
          canNgay: calendarContext.canChi?.dayGan || 'Đinh',
          chiNgay: calendarContext.canChi?.dayZhi || 'Mùi',
          ngayHoaGiap: calendarContext.canChi?.day || `${calendarContext.canChi?.dayGan || 'Đinh'} ${calendarContext.canChi?.dayZhi || 'Mùi'}`,
          thangChi: calendarContext.canChi?.monthZhi || 'Dậu',
          tuanKhong: (calendarContext.canChi?.day && TUAN_KHONG_MAP[calendarContext.canChi.day]) ? TUAN_KHONG_MAP[calendarContext.canChi.day] : ['Dần', 'Mão'],
          thanSat: tinhThanSat(calendarContext.canChi?.dayGan || 'Đinh', calendarContext.canChi?.dayZhi || 'Mùi'),
          solarTerm: calendarContext.solarTerm || ''
        },
        luc_hao: lucHaoResult
      };
    }
  };

  // =========================================================================
  // 9. ĐỘNG CƠ LỤC HÀO NẠP GIÁP (BỐC PHỆ CHÍNH TÔNG)
  // =========================================================================
  const LucHaoEngine = {
    /**
     * Gieo quẻ Lục Hào
     * @param {Array<number>} haoCoins Mảng 6 giá trị hào từ 1 đến 6 (6: Lão Âm, 7: Thiếu Dương, 8: Thiếu Âm, 9: Lão Dương)
     * @param {Object} calendarContext Dữ liệu thời gian lấy từ NetaCalendarEngine (canChi, solarTerm...)
     */
    lapQue(haoCoins, calendarContext = {}) {
      if (!Array.isArray(haoCoins) || haoCoins.length !== 6) {
        throw new Error('Cần đúng 6 hào từ 1 đến 6');
      }

      // Tự động đồng bộ từ NetaCalendarEngine nếu calendarContext chưa có Can Chi
      if ((!calendarContext || !calendarContext.canChi) && global.NetaCalendarEngine && typeof global.NetaCalendarEngine.getFullDayInfo === 'function') {
        const fullDay = global.NetaCalendarEngine.getFullDayInfo();
        calendarContext = { ...fullDay, ...(calendarContext || {}) };
        if (calendarContext.solarTermCanChi) {
          calendarContext.canChi = { ...(calendarContext.canChi || {}), ...calendarContext.solarTermCanChi };
        }
      }

      const canChi = calendarContext.canChi || {};
      const canNgay = canChi.dayGan || (canChi.day ? canChi.day.split(' ')[0] : 'Đinh');
      const chiNgay = canChi.dayZhi || (canChi.day ? canChi.day.split(' ')[1] : 'Mùi');
      const ngayHoaGiap = canChi.day || `${canNgay} ${chiNgay}`;
      const thangChi = canChi.monthZhi || (canChi.month ? canChi.month.split(' ')[1] : 'Dậu');

      // 1. Tách bit quẻ gốc và quẻ biến
      const gocBits = [];
      const bienBits = [];
      const dongFlags = [];

      haoCoins.forEach(val => {
        if (val === 6) { // Lão Âm (động biến Dương)
          gocBits.push(0);
          bienBits.push(1);
          dongFlags.push(true);
        } else if (val === 7) { // Thiếu Dương (tĩnh)
          gocBits.push(1);
          bienBits.push(1);
          dongFlags.push(false);
        } else if (val === 8) { // Thiếu Âm (tĩnh)
          gocBits.push(0);
          bienBits.push(0);
          dongFlags.push(false);
        } else if (val === 9) { // Lão Dương (động biến Âm)
          gocBits.push(1);
          bienBits.push(0);
          dongFlags.push(true);
        } else {
          // Fallback an toàn
          gocBits.push(val % 2);
          bienBits.push(val % 2);
          dongFlags.push(false);
        }
      });

      const gocKey = gocBits.join(',');
      const hasDong = dongFlags.some(d => d);

      // 2. Tra cứu Bát Cung & Thế Ứng
      const palaceInfo = HEXAGRAM_TO_PALACE_MAP[gocKey] || { palace: 'Can', type: 'Bản Cung', the: 6, ung: 3 };
      const cungKey = palaceInfo.palace;
      const cungName = TRIGRAM_DATA[cungKey].name;
      const cungElement = PALACE_ELEMENTS[cungKey];
      const thePos = palaceInfo.the;
      const ungPos = palaceInfo.ung;
      const queType = palaceInfo.type;
      const gocSpecial = getHexagramSpecialType(gocBits);

      // Quái Thân (Quái Thần QT)
      const theBit = gocBits[thePos - 1];
      const quaiThanZhi = tinhQuaiThan(thePos, theBit);

      // 3. Tên Quẻ Gốc
      const haGocKey = bitsToKey(gocBits[0], gocBits[1], gocBits[2]);
      const thuongGocKey = bitsToKey(gocBits[3], gocBits[4], gocBits[5]);
      const chuMeta = HEXAGRAM_NAMES[`${thuongGocKey},${haGocKey}`] || { name: 'Chưa đặt tên', tuong: '', tho: '' };

      // 4. Nạp Giáp Can Chi
      const noiNap = NAP_GIAP[haGocKey].noi;     // [h1, h2, h3]
      const ngoaiNap = NAP_GIAP[thuongGocKey].ngoai; // [h4, h5, h6]
      const allNapGoc = [...noiNap, ...ngoaiNap];

      // 5. An Lục Thú
      const startThu = CAN_NGAY_LUC_THU_START[canNgay] || 'Thanh Long';
      const startIdx = LUC_THU_ORDER.indexOf(startThu);
      const lucThuList = [0, 1, 2, 3, 4, 5].map(i => LUC_THU_ORDER[(startIdx + i) % 6]);

      // 6. Tuần Không & Thần Sát
      const tuanKhongChis = TUAN_KHONG_MAP[ngayHoaGiap] || [];
      const thanSatInfo = tinhThanSat(canNgay, chiNgay);

      // 7. Lập chi tiết 6 hào Quẻ Gốc
      const haosGocDetail = [];
      const lucThanPresent = new Set();

      for (let i = 0; i < 6; i++) {
        const pos = i + 1;
        const [canHao, chiHao] = allNapGoc[i];
        const chiElm = DIA_CHI_NGU_HANH[chiHao];
        const lucThan = tinhLucThan(cungElement, chiElm);
        lucThanPresent.add(lucThan);

        const isThe = (pos === thePos);
        const isUng = (pos === ungPos);
        const isDong = dongFlags[i];
        const isTK = tuanKhongChis.includes(chiHao);
        const vsMark = tinhVuongSuy(thangChi, chiHao);

        const isLoc = thanSatInfo.loc_than.includes(chiHao);
        const isMa = thanSatInfo.dich_ma.includes(chiHao);
        const isQuy = thanSatInfo.quy_nhan.includes(chiHao);
        const isDao = thanSatInfo.dao_hoa.includes(chiHao);
        const isQT = (chiHao === quaiThanZhi);

        const tsApplied = [];
        if (isQuy) tsApplied.push('Q.Nhân');
        if (isLoc) tsApplied.push('Lộc');
        if (isMa) tsApplied.push('Mã');
        if (isDao) tsApplied.push('ĐàoHoa');

        haosGocDetail.push({
          pos: pos,
          bit: gocBits[i],
          coinVal: haoCoins[i],
          can: canHao,
          chi: chiHao,
          chiElement: chiElm,
          lucThan: lucThan,
          lucThu: lucThuList[i],
          isThe: isThe,
          isUng: isUng,
          isDong: isDong,
          isTuanKhong: isTK,
          vuongSuy: vsMark,
          isLoc: isLoc,
          isMa: isMa,
          isQuy: isQuy,
          isDao: isDao,
          isQuaiThan: isQT,
          thanSat: tsApplied.join(', ')
        });
      }

      // 8. Tìm Phục Thần (nếu thiếu Lục Thân)
      const allLucThan = ['Phụ Mẫu', 'Tử Tôn', 'Quan Quỷ', 'Thê Tài', 'Huynh Đệ'];
      const missingLucThan = allLucThan.filter(lt => !lucThanPresent.has(lt));
      const phucThanInfo = [];

      if (missingLucThan.length > 0) {
        const pureBits = PURE_HEXAGRAM_CACHE[cungKey];
        const pureHaKey = bitsToKey(pureBits[0], pureBits[1], pureBits[2]);
        const pureThuongKey = bitsToKey(pureBits[3], pureBits[4], pureBits[5]);
        const pureNap = [...NAP_GIAP[pureHaKey].noi, ...NAP_GIAP[pureThuongKey].ngoai];

        for (let i = 0; i < 6; i++) {
          const pos = i + 1;
          const [canP, chiP] = pureNap[i];
          const chiPElm = DIA_CHI_NGU_HANH[chiP];
          const ltP = tinhLucThan(cungElement, chiPElm);
          if (missingLucThan.includes(ltP)) {
            phucThanInfo.push({
              pos: pos,
              lucThan: ltP,
              can: canP,
              chi: chiP,
              chiElement: chiPElm,
              phiThan: haosGocDetail[i]
            });
          }
        }
      }

      // 9. Xử lý Quẻ Biến (nếu có hào động)
      let bienData = null;
      if (hasDong) {
        const haBienKey = bitsToKey(bienBits[0], bienBits[1], bienBits[2]);
        const thuongBienKey = bitsToKey(bienBits[3], bienBits[4], bienBits[5]);
        const bienMeta = HEXAGRAM_NAMES[`${thuongBienKey},${haBienKey}`] || { name: 'Chưa đặt tên', tuong: '', tho: '' };

        const bienKey = bienBits.join(',');
        const bienPalaceInfo = HEXAGRAM_TO_PALACE_MAP[bienKey] || { palace: 'Can', type: 'Bản Cung' };
        const bienCungName = TRIGRAM_DATA[bienPalaceInfo.palace].name;
        const bienSpecial = getHexagramSpecialType(bienBits);

        const noiBienNap = NAP_GIAP[haBienKey].noi;
        const ngoaiBienNap = NAP_GIAP[thuongBienKey].ngoai;
        const allNapBien = [...noiBienNap, ...ngoaiBienNap];

        const haosBienDetail = [];
        for (let i = 0; i < 6; i++) {
          const pos = i + 1;
          const [canB, chiB] = allNapBien[i];
          const chiBElm = DIA_CHI_NGU_HANH[chiB];
          const lucThanB = tinhLucThan(cungElement, chiBElm);
          const isTKB = tuanKhongChis.includes(chiB);
          const vsB = tinhVuongSuy(thangChi, chiB);

          const isLocB = thanSatInfo.loc_than.includes(chiB);
          const isMaB = thanSatInfo.dich_ma.includes(chiB);
          const isQuyB = thanSatInfo.quy_nhan.includes(chiB);
          const isDaoB = thanSatInfo.dao_hoa.includes(chiB);
          const isQTB = (chiB === quaiThanZhi);

          haosBienDetail.push({
            pos: pos,
            bit: bienBits[i],
            can: canB,
            chi: chiB,
            chiElement: chiBElm,
            lucThan: lucThanB,
            isDong: dongFlags[i],
            isTuanKhong: isTKB,
            vuongSuy: vsB,
            isLoc: isLocB,
            isMa: isMaB,
            isQuy: isQuyB,
            isDao: isDaoB,
            isQuaiThan: isQTB
          });
        }

        bienData = {
          name: bienMeta.name,
          tuong: bienMeta.tuong,
          tho: bienMeta.tho,
          cung: bienCungName,
          cungSpecial: bienSpecial,
          bits: bienBits,
          haos: haosBienDetail
        };
      }

      // Quẻ Hỗ của quẻ gốc (Hạ hỗ: hào 2,3,4; Thượng hỗ: hào 3,4,5)
      const haHoKey = bitsToKey(gocBits[1], gocBits[2], gocBits[3]);
      const thuongHoKey = bitsToKey(gocBits[2], gocBits[3], gocBits[4]);
      const hoBits = [gocBits[1], gocBits[2], gocBits[3], gocBits[2], gocBits[3], gocBits[4]];
      const hoMeta = HEXAGRAM_NAMES[`${thuongHoKey},${haHoKey}`] || { name: 'Chưa đặt tên', tuong: '', tho: '' };
      const hoPalaceInfo = HEXAGRAM_TO_PALACE_MAP[hoBits.join(',')] || { palace: 'Can' };
      const hoCungName = TRIGRAM_DATA[hoPalaceInfo.palace].name;
      const hoSpecial = getHexagramSpecialType(hoBits);
      const hoData = {
        name: hoMeta.name,
        tuong: hoMeta.tuong,
        tho: hoMeta.tho,
        cung: hoCungName,
        cungSpecial: hoSpecial,
        bits: hoBits
      };

      return {
        que_goc: {
          name: chuMeta.name,
          tuong: chuMeta.tuong,
          tho: chuMeta.tho,
          cung: cungName,
          cungKey: cungKey,
          cungSpecial: gocSpecial,
          cungElement: cungElement,
          thePos: thePos,
          ungPos: ungPos,
          queType: queType,
          bits: gocBits,
          haos: haosGocDetail
        },
        que_ho: hoData,
        phuc_than: phucThanInfo,
        que_bien: bienData,
        has_dong: hasDong,
        dong_count: dongFlags.filter(Boolean).length,
        thoi_gian: {
          canNgay: canNgay,
          chiNgay: chiNgay,
          ngayHoaGiap: ngayHoaGiap,
          thangChi: thangChi,
          tuanKhong: tuanKhongChis,
          thanSat: thanSatInfo,
          solarTerm: calendarContext.solarTerm || ''
        }
      };
    }
  };

  // Export module API ra global window
  const NetaDichHocEngine = {
    TRIGRAM_DATA,
    HEXAGRAM_NAMES,
    DIA_CHI_NGU_HANH,
    TUAN_KHONG_MAP,
    MaiHoaEngine,
    LucHaoEngine,
    tinhThanSat,
    tinhVuongSuy,
    tinhLucThan
  };

  global.NetaDichHocEngine = NetaDichHocEngine;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = NetaDichHocEngine;
  }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
