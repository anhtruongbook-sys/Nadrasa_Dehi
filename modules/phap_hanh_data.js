/**
 * CSDL PHÁP HÀNH NADRASA DEHI (41 BÀI HỌC VÀ CẢNH GIỚI GỐC)
 */

const PHAP_HANH_CATEGORIES = [
  {
    "id": "all",
    "name": "Tất cả"
  },
  {
    "id": "18_phu",
    "name": "18 Nơi Tại Phủ"
  },
  {
    "id": "tam_an",
    "name": "Tâm Ấn"
  },
  {
    "id": "thu_phap",
    "name": "Thủ Pháp"
  },
  {
    "id": "tran_phap",
    "name": "Trấn Pháp"
  },
  {
    "id": "do_vong",
    "name": "Độ Vong"
  },
  {
    "id": "phap_bao_khi",
    "name": "Pháp Bảo & Khí"
  },
  {
    "id": "linh_phu_so",
    "name": "Linh Phù & Sớ"
  },
  {
    "id": "bi_phap_thien",
    "name": "Bí Pháp & Thiền"
  },
  {
    "id": "custom",
    "name": "Bài học của tôi (Tự thêm)"
  }
];

const PHAP_HANH_BUILTIN_LESSONS = [
  {
    "id": "phu_01",
    "title": "01 - Đại Nghiệp",
    "category": "18_phu",
    "categoryName": "18 Nơi Tại Phủ",
    "image": "assets/phap_hanh/phu_01.jpg",
    "isBuiltIn": true,
    "order": 1
  },
  {
    "id": "phu_02",
    "title": "02 - Thần Thú",
    "category": "18_phu",
    "categoryName": "18 Nơi Tại Phủ",
    "image": "assets/phap_hanh/phu_02.jpg",
    "isBuiltIn": true,
    "order": 2
  },
  {
    "id": "phu_03",
    "title": "03 - Tiêu Hồn",
    "category": "18_phu",
    "categoryName": "18 Nơi Tại Phủ",
    "image": "assets/phap_hanh/phu_03.jpg",
    "isBuiltIn": true,
    "order": 3
  },
  {
    "id": "phu_04",
    "title": "04 - U Minh Giới",
    "category": "18_phu",
    "categoryName": "18 Nơi Tại Phủ",
    "image": "assets/phap_hanh/phu_04.jpg",
    "isBuiltIn": true,
    "order": 4
  },
  {
    "id": "phu_05",
    "title": "05 - Huyền Các",
    "category": "18_phu",
    "categoryName": "18 Nơi Tại Phủ",
    "image": "assets/phap_hanh/phu_05.jpg",
    "isBuiltIn": true,
    "order": 5
  },
  {
    "id": "phu_06",
    "title": "06 - Tiên Giới",
    "category": "18_phu",
    "categoryName": "18 Nơi Tại Phủ",
    "image": "assets/phap_hanh/phu_06.jpg",
    "isBuiltIn": true,
    "order": 6
  },
  {
    "id": "phu_07",
    "title": "07 - Đại Thất Sắc",
    "category": "18_phu",
    "categoryName": "18 Nơi Tại Phủ",
    "image": "assets/phap_hanh/phu_07.jpg",
    "isBuiltIn": true,
    "order": 7
  },
  {
    "id": "phu_08",
    "title": "08 - Chúng Sinh Luân",
    "category": "18_phu",
    "categoryName": "18 Nơi Tại Phủ",
    "image": "assets/phap_hanh/phu_08.jpg",
    "isBuiltIn": true,
    "order": 8
  },
  {
    "id": "phu_09",
    "title": "09 - Đại Nội Phủ",
    "category": "18_phu",
    "categoryName": "18 Nơi Tại Phủ",
    "image": "assets/phap_hanh/phu_09.jpg",
    "isBuiltIn": true,
    "order": 9
  },
  {
    "id": "phu_10",
    "title": "10 - Bồ Tát Giới",
    "category": "18_phu",
    "categoryName": "18 Nơi Tại Phủ",
    "image": "assets/phap_hanh/phu_10.jpg",
    "isBuiltIn": true,
    "order": 10
  },
  {
    "id": "phu_11",
    "title": "11 - Độc Minh Lâm",
    "category": "18_phu",
    "categoryName": "18 Nơi Tại Phủ",
    "image": "assets/phap_hanh/phu_11.jpg",
    "isBuiltIn": true,
    "order": 11
  },
  {
    "id": "phu_12",
    "title": "12 - Đại Chính Quan",
    "category": "18_phu",
    "categoryName": "18 Nơi Tại Phủ",
    "image": "assets/phap_hanh/phu_12.jpg",
    "isBuiltIn": true,
    "order": 12
  },
  {
    "id": "phu_13",
    "title": "13 - Vĩnh An Tự",
    "category": "18_phu",
    "categoryName": "18 Nơi Tại Phủ",
    "image": "assets/phap_hanh/phu_13.jpg",
    "isBuiltIn": true,
    "order": 13
  },
  {
    "id": "phu_14",
    "title": "14 - Tàng Kinh Thư",
    "category": "18_phu",
    "categoryName": "18 Nơi Tại Phủ",
    "image": "assets/phap_hanh/phu_14.jpg",
    "isBuiltIn": true,
    "order": 14
  },
  {
    "id": "phu_15",
    "title": "15 - Tuệ Giác Tâm Đường",
    "category": "18_phu",
    "categoryName": "18 Nơi Tại Phủ",
    "image": "assets/phap_hanh/phu_15.jpg",
    "isBuiltIn": true,
    "order": 15
  },
  {
    "id": "phu_16",
    "title": "16 - Kim Cang Tâm Đường",
    "category": "18_phu",
    "categoryName": "18 Nơi Tại Phủ",
    "image": "assets/phap_hanh/phu_16.jpg",
    "isBuiltIn": true,
    "order": 16
  },
  {
    "id": "phu_17",
    "title": "17 - Biến Thiên Tâm Đường",
    "category": "18_phu",
    "categoryName": "18 Nơi Tại Phủ",
    "image": "assets/phap_hanh/phu_17.jpg",
    "isBuiltIn": true,
    "order": 17
  },
  {
    "id": "phu_18",
    "title": "18 - Liễu Tri Tâm Đường",
    "category": "18_phu",
    "categoryName": "18 Nơi Tại Phủ",
    "image": "assets/phap_hanh/phu_18.jpg",
    "isBuiltIn": true,
    "order": 18
  },
  {
    "id": "lesson_01",
    "title": "01 - [Tâm Ấn] Biến Thiên Tâm Ấn",
    "category": "tam_an",
    "categoryName": "Tâm Ấn",
    "image": "assets/phap_hanh/lesson_01.jpg",
    "isBuiltIn": true,
    "order": 19
  },
  {
    "id": "lesson_02",
    "title": "02 - [Tâm Ấn] Kim Cang Tâm Ấn",
    "category": "tam_an",
    "categoryName": "Tâm Ấn",
    "image": "assets/phap_hanh/lesson_02.jpg",
    "isBuiltIn": true,
    "order": 20
  },
  {
    "id": "lesson_03",
    "title": "03 - [Tâm Ấn] Liễu Tri Tâm Ấn",
    "category": "tam_an",
    "categoryName": "Tâm Ấn",
    "image": "assets/phap_hanh/lesson_03.jpg",
    "isBuiltIn": true,
    "order": 21
  },
  {
    "id": "lesson_04",
    "title": "04 - [Tâm Ấn] Tuệ Giác Tâm Ấn",
    "category": "tam_an",
    "categoryName": "Tâm Ấn",
    "image": "assets/phap_hanh/lesson_04.jpg",
    "isBuiltIn": true,
    "order": 22
  },
  {
    "id": "lesson_05",
    "title": "05 - [Pháp Bảo] Thần Kiếm Nadrasa Dehi",
    "category": "phap_bao_khi",
    "categoryName": "Pháp Bảo & Khí",
    "image": "assets/phap_hanh/lesson_05.jpg",
    "isBuiltIn": true,
    "order": 23
  },
  {
    "id": "lesson_06",
    "title": "06 - [Pháp Khí] Bát Đại Thần Sát",
    "category": "phap_bao_khi",
    "categoryName": "Pháp Bảo & Khí",
    "image": "assets/phap_hanh/lesson_06.jpg",
    "isBuiltIn": true,
    "order": 24
  },
  {
    "id": "lesson_07",
    "title": "07 - [Linh Phù] Đạo Bùa Chữ Vạn",
    "category": "linh_phu_so",
    "categoryName": "Linh Phù & Sớ",
    "image": "assets/phap_hanh/lesson_07.jpg",
    "isBuiltIn": true,
    "order": 25
  },
  {
    "id": "lesson_08",
    "title": "08 - [Thủ Pháp] Nguyên Lý Của Thủ Pháp",
    "category": "thu_phap",
    "categoryName": "Thủ Pháp",
    "image": "assets/phap_hanh/lesson_08.jpg",
    "isBuiltIn": true,
    "order": 26
  },
  {
    "id": "lesson_09",
    "title": "09 - [Thủ Pháp] Thủ Pháp Dẫn Nhập",
    "category": "thu_phap",
    "categoryName": "Thủ Pháp",
    "image": "assets/phap_hanh/lesson_09.jpg",
    "isBuiltIn": true,
    "order": 27
  },
  {
    "id": "lesson_10",
    "title": "10 - [Thủ Pháp] Cân Bằng Năng Lượng Cho Người Nhập",
    "category": "thu_phap",
    "categoryName": "Thủ Pháp",
    "image": "assets/phap_hanh/lesson_10.jpg",
    "isBuiltIn": true,
    "order": 28
  },
  {
    "id": "lesson_11",
    "title": "11 - [Thủ Pháp] Thu Phục Âm Binh Và Năng Lượng Trược Khí",
    "category": "thu_phap",
    "categoryName": "Thủ Pháp",
    "image": "assets/phap_hanh/lesson_11.jpg",
    "isBuiltIn": true,
    "order": 29
  },
  {
    "id": "lesson_12",
    "title": "12 - [Thủ Pháp] Chữa Lành Cho Vong Linh Và Biến Thực",
    "category": "thu_phap",
    "categoryName": "Thủ Pháp",
    "image": "assets/phap_hanh/lesson_12.jpg",
    "isBuiltIn": true,
    "order": 30
  },
  {
    "id": "lesson_13",
    "title": "13 - [Thủ Pháp] Trấn Lên Đồ Vật",
    "category": "thu_phap",
    "categoryName": "Thủ Pháp",
    "image": "assets/phap_hanh/lesson_13.jpg",
    "isBuiltIn": true,
    "order": 31
  },
  {
    "id": "lesson_14",
    "title": "14 - [Thủ Pháp] Vẽ Năng Lượng Bảo Vệ Ranh Giới",
    "category": "thu_phap",
    "categoryName": "Thủ Pháp",
    "image": "assets/phap_hanh/lesson_14.jpg",
    "isBuiltIn": true,
    "order": 32
  },
  {
    "id": "lesson_15",
    "title": "15 - [Trấn Pháp] Trấn Tại Ban Thờ Gia Tiên",
    "category": "tran_phap",
    "categoryName": "Trấn Pháp",
    "image": "assets/phap_hanh/lesson_15.jpg",
    "isBuiltIn": true,
    "order": 33
  },
  {
    "id": "lesson_16",
    "title": "16 - [Trấn Pháp] Trấn Đất Ở",
    "category": "tran_phap",
    "categoryName": "Trấn Pháp",
    "image": "assets/phap_hanh/lesson_16.jpg",
    "isBuiltIn": true,
    "order": 34
  },
  {
    "id": "lesson_17",
    "title": "17 - [Trấn Pháp] Trấn Mộ",
    "category": "tran_phap",
    "categoryName": "Trấn Pháp",
    "image": "assets/phap_hanh/lesson_17.jpg",
    "isBuiltIn": true,
    "order": 35
  },
  {
    "id": "lesson_18",
    "title": "18 - [Độ Vong] Rước Vong Chết Bên Ngoài Về Nhà Thờ Cúng",
    "category": "do_vong",
    "categoryName": "Độ Vong",
    "image": "assets/phap_hanh/lesson_18.jpg",
    "isBuiltIn": true,
    "order": 36
  },
  {
    "id": "lesson_19",
    "title": "19 - [Độ Vong] Pháp Độ Vong Khi Chặt Phá Cây Cối",
    "category": "do_vong",
    "categoryName": "Độ Vong",
    "image": "assets/phap_hanh/lesson_19.jpg",
    "isBuiltIn": true,
    "order": 37
  },
  {
    "id": "lesson_20",
    "title": "20 - [Sớ Văn] Sớ Biến Thiên",
    "category": "linh_phu_so",
    "categoryName": "Linh Phù & Sớ",
    "image": "assets/phap_hanh/lesson_20.jpg",
    "isBuiltIn": true,
    "order": 38
  },
  {
    "id": "lesson_21",
    "title": "21 - [Bí Pháp] Phượng Hoàng Và Hoa Mi Te Ra",
    "category": "bi_phap_thien",
    "categoryName": "Bí Pháp & Thiền",
    "image": "assets/phap_hanh/lesson_21.jpg",
    "isBuiltIn": true,
    "order": 39
  },
  {
    "id": "lesson_22",
    "title": "22 - [Bí Pháp] Quang Thủ Camisala",
    "category": "bi_phap_thien",
    "categoryName": "Bí Pháp & Thiền",
    "image": "assets/phap_hanh/lesson_22.jpg",
    "isBuiltIn": true,
    "order": 40
  },
  {
    "id": "lesson_23",
    "title": "23 - [Thiền Định] Thiền Xuất Ấn Thủ Pháp",
    "category": "bi_phap_thien",
    "categoryName": "Bí Pháp & Thiền",
    "image": "assets/phap_hanh/lesson_23.jpg",
    "isBuiltIn": true,
    "order": 41
  }
];
