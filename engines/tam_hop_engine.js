/**
 * NETA LIGHT - TAM HOP PHONG THUY ENGINE (COMPUTATIONAL SAN HE CORE)
 * File: engines/tam_hop_engine.js
 * ---------------------------------------------------------------------------------
 * Chuyển hóa 100% thuật toán định lượng Phong Thủy Tam Hợp Phái từ tam_hop_engine.py
 * dựa trên toàn bộ hệ thống phương pháp luận thực chiến Tam Hợp Phái.
 *
 * BAO QUÁT TOÀN DIỆN 31 BÀI HỌC:
 * 1. Tam Bàn La Kinh (Địa Bàn Chính Châm, Nhân Bàn Trung Châm, Thiên Bàn Phùng Châm).
 * 2. 24 Sơn Hướng 360°, Phân định Mép biên 3° vs Tâm sơn 9° (Chính Khí thuần khiết).
 * 3. Tứ Đại Cục (Thủy Cục, Hỏa Cục, Kim Cục, Mộc Cục) & Định Cục Thủy Khẩu Thiên Bàn.
 * 4. Vòng Trường Sinh 12 Cung & 12 Cặp Song Sơn Ngũ Hành.
 * 5. Nhận diện Thế Cục Thủy Pháp (Chính Sinh Hướng, Chính Vượng Hướng, Lâm Quan Hướng...).
 * 6. Lai Thủy - Khứ Thủy & Cảnh báo Xung Phá (Trường Sinh, Lâm Quan, Đế Vượng).
 * 7. Bát Lộ Hoàng Tuyền Sát (Sát Nhân Hoàng Tuyền vs Cứu Bần Hoàng Tuyền).
 * 8. Bát Sát Tiêu Vong (Khảm Long, Khôn Thỏ, Chấn Hầu, Tốn Kê, Càn Mã, Đoài Xà, Cấn Hổ, Ly Trư).
 * 9. Nạp Giáp Bát Quái & Bản Thể Quẻ Càn.
 * 10. Thôi Quan Thủy Pháp (Kích hoạt Quan Lộc & Khoa Bảng).
 * 11. Phép Bổ Long Mạch & Khí Đất Long Mạch.
 * 12. Tam Sát Toàn Thư (Kiếp Sát, Tai Sát, Tuế Sát) - "Khả tọa bất khả hướng".
 * 13. Thái Tuế, Tuế Phá & Chu kỳ Mộc Tinh.
 * 14. 72 Xuyên Sơn Long & 12 Tuyến Quý Giáp Không Vong.
 * 15. Lại Công Ngũ Hành (Chuyên dùng Tiêu Sa).
 * 16. Phân loại Hình Thể Sa Sơn & Ngũ Sa Pháp (Sinh, Vượng, Nô, Sát, Tiết Sa).
 * 17. Nhị Thập Bát Tú (28 Tinh Tú) trên Nhân Bàn Trung Châm.
 * 18. Phụ Tinh Phiên Quái Sa Pháp (9 Sao Phiên Quái).
 * 19. Hoàng Tuyền Sa Pháp & Tứ Đại Đường Cục.
 * 20. Tam Cát Thần Trợ: Thiên Ất Quý Nhân (Âm/Dương), Thiên Lộc, Dịch Mã.
 * 21. Nhận diện Hình thể thực tế của Mã Quý Nhân (Mã khảm / Gò yên ngựa).
 * 22. 120 Phân Kim vi mô (Tuyến Châu Bảo vs Cô Hư, Không Vong).
 * 23. Quy trình thực chiến tổng hợp lâm sàng 6 bước.
 */

(function (global) {
  'use strict';

  // =========================================================================
  // BẢNG DỮ LIỆU CƠ SỞ (LOOKUP MATRICES & GROUND TRUTH)
  // =========================================================================

  // 24 Sơn Hướng chuẩn theo vòng tròn 360 độ (Địa Bàn Chính Châm)
  // Tâm Tý tại 0 độ (352.5° đến 7.5°)
  const SON_24 = [
    { name: "Tý",   deg_start: 352.5, deg_end: 7.5,   chi: "Tý",   can: null,  quai: "Khảm", cung_bat_quai: "Khảm", am_duong: "Dương", ngu_hanh: "Thủy" },
    { name: "Quý",  deg_start: 7.5,   deg_end: 22.5,  chi: null,  can: "Quý", quai: null,   cung_bat_quai: "Khảm", am_duong: "Âm",    ngu_hanh: "Thủy" },
    { name: "Sửu",  deg_start: 22.5,  deg_end: 37.5,  chi: "Sửu",  can: null,  quai: null,   cung_bat_quai: "Cấn",  am_duong: "Âm",    ngu_hanh: "Thổ" },
    { name: "Cấn",  deg_start: 37.5,  deg_end: 52.5,  chi: null,  can: null,  quai: "Cấn",  cung_bat_quai: "Cấn",  am_duong: "Dương", ngu_hanh: "Thổ" },
    { name: "Dần",  deg_start: 52.5,  deg_end: 67.5,  chi: "Dần",  can: null,  quai: null,   cung_bat_quai: "Cấn",  am_duong: "Dương", ngu_hanh: "Mộc" },
    { name: "Giáp", deg_start: 67.5,  deg_end: 82.5,  chi: null,  can: "Giáp",quai: null,   cung_bat_quai: "Chấn", am_duong: "Dương", ngu_hanh: "Mộc" },
    { name: "Mão",  deg_start: 82.5,  deg_end: 97.5,  chi: "Mão",  can: null,  quai: "Chấn", cung_bat_quai: "Chấn", am_duong: "Âm",    ngu_hanh: "Mộc" },
    { name: "Ất",   deg_start: 97.5,  deg_end: 112.5, chi: null,  can: "Ất",  quai: null,   cung_bat_quai: "Chấn", am_duong: "Âm",    ngu_hanh: "Mộc" },
    { name: "Thìn", deg_start: 112.5, deg_end: 127.5, chi: "Thìn", can: null,  quai: null,   cung_bat_quai: "Tốn",  am_duong: "Âm",    ngu_hanh: "Thổ" },
    { name: "Tốn",  deg_start: 127.5, deg_end: 142.5, chi: null,  can: null,  quai: "Tốn",  cung_bat_quai: "Tốn",  am_duong: "Dương", ngu_hanh: "Mộc" },
    { name: "Tỵ",   deg_start: 142.5, deg_end: 157.5, chi: "Tỵ",   can: null,  quai: null,   cung_bat_quai: "Tốn",  am_duong: "Dương", ngu_hanh: "Hỏa" },
    { name: "Bính", deg_start: 157.5, deg_end: 172.5, chi: null,  can: "Bính",quai: null,   cung_bat_quai: "Ly",   am_duong: "Dương", ngu_hanh: "Hỏa" },
    { name: "Ngọ",  deg_start: 172.5, deg_end: 187.5, chi: "Ngọ",  can: null,  quai: "Ly",   cung_bat_quai: "Ly",   am_duong: "Âm",    ngu_hanh: "Hỏa" },
    { name: "Đinh", deg_start: 187.5, deg_end: 202.5, chi: null,  can: "Đinh",quai: null,   cung_bat_quai: "Ly",   am_duong: "Âm",    ngu_hanh: "Hỏa" },
    { name: "Mùi",  deg_start: 202.5, deg_end: 217.5, chi: "Mùi",  can: null,  quai: null,   cung_bat_quai: "Khôn", am_duong: "Âm",    ngu_hanh: "Thổ" },
    { name: "Khôn", deg_start: 217.5, deg_end: 232.5, chi: null,  can: null,  quai: "Khôn", cung_bat_quai: "Khôn", am_duong: "Dương", ngu_hanh: "Thổ" },
    { name: "Thân", deg_start: 232.5, deg_end: 247.5, chi: "Thân", can: null,  quai: null,   cung_bat_quai: "Khôn", am_duong: "Dương", ngu_hanh: "Kim" },
    { name: "Canh", deg_start: 247.5, deg_end: 262.5, chi: null,  can: "Canh",quai: null,   cung_bat_quai: "Đoài", am_duong: "Dương", ngu_hanh: "Kim" },
    { name: "Dậu",  deg_start: 262.5, deg_end: 277.5, chi: "Dậu",  can: null,  quai: "Đoài", cung_bat_quai: "Đoài", am_duong: "Âm",    ngu_hanh: "Kim" },
    { name: "Tân",  deg_start: 277.5, deg_end: 292.5, chi: null,  can: "Tân", quai: null,   cung_bat_quai: "Đoài", am_duong: "Âm",    ngu_hanh: "Kim" },
    { name: "Tuất", deg_start: 292.5, deg_end: 307.5, chi: "Tuất", can: null,  quai: null,   cung_bat_quai: "Càn",  am_duong: "Âm",    ngu_hanh: "Thổ" },
    { name: "Càn",  deg_start: 307.5, deg_end: 322.5, chi: null,  can: null,  quai: "Càn",  cung_bat_quai: "Càn",  am_duong: "Dương", ngu_hanh: "Kim" },
    { name: "Hợi",  deg_start: 322.5, deg_end: 337.5, chi: "Hợi",  can: null,  quai: null,   cung_bat_quai: "Càn",  am_duong: "Dương", ngu_hanh: "Thủy" },
    { name: "Nhâm", deg_start: 337.5, deg_end: 352.5, chi: null,  can: "Nhâm",quai: null,   cung_bat_quai: "Khảm", am_duong: "Dương", ngu_hanh: "Thủy" }
  ];

  // Song Sơn Ngũ Hành (12 cặp Song Sơn)
  const SONG_SON = {
    "Nhâm Tý": { ngu_hanh: "Thủy", cuc: "Thủy Cục", chi_chinh: "Tý" },
    "Quý Sửu": { ngu_hanh: "Kim",  cuc: "Kim Cục",  chi_chinh: "Sửu" },
    "Cấn Dần": { ngu_hanh: "Hỏa",  cuc: "Hỏa Cục",  chi_chinh: "Dần" },
    "Giáp Mão": { ngu_hanh: "Mộc", cuc: "Mộc Cục",  chi_chinh: "Mão" },
    "Ất Thìn": { ngu_hanh: "Thủy", cuc: "Thủy Cục", chi_chinh: "Thìn" },
    "Tốn Tỵ":  { ngu_hanh: "Kim",  cuc: "Kim Cục",  chi_chinh: "Tỵ" },
    "Bính Ngọ": { ngu_hanh: "Hỏa", cuc: "Hỏa Cục",  chi_chinh: "Ngọ" },
    "Đinh Mùi": { ngu_hanh: "Mộc", cuc: "Mộc Cục",  chi_chinh: "Mùi" },
    "Khôn Thân": { ngu_hanh: "Thủy", cuc: "Thủy Cục", chi_chinh: "Thân" },
    "Canh Dậu": { ngu_hanh: "Kim",  cuc: "Kim Cục",  chi_chinh: "Dậu" },
    "Tân Tuất": { ngu_hanh: "Hỏa",  cuc: "Hỏa Cục",  chi_chinh: "Tuất" },
    "Càn Hợi":  { ngu_hanh: "Mộc",  cuc: "Mộc Cục",  chi_chinh: "Hợi" }
  };

  // 12 Cung Trường Sinh theo thứ tự chuẩn
  const CUNG_TRUONG_SINH = [
    "Trường Sinh", "Mộc Dục", "Quan Đới", "Lâm Quan",
    "Đế Vượng", "Suy", "Bệnh", "Tử",
    "Mộ", "Tuyệt", "Thai", "Dưỡng"
  ];

  // Vòng Song Sơn theo chiều kim đồng hồ
  const VONG_SONG_SON_THUAN = [
    "Khôn Thân", "Canh Dậu", "Tân Tuất", "Càn Hợi",
    "Nhâm Tý", "Quý Sửu", "Cấn Dần", "Giáp Mão",
    "Ất Thìn", "Tốn Tỵ", "Bính Ngọ", "Đinh Mùi"
  ];

  // Điểm khởi Trường Sinh của Tứ Đại Cục
  const KHOI_TRUONG_SINH = {
    "Thủy Cục": { khoi_tai: "Khôn Thân", mo_khu: "Ất Thìn", ngu_hanh: "Thủy" },
    "Hỏa Cục":  { khoi_tai: "Cấn Dần",   mo_khu: "Tân Tuất", ngu_hanh: "Hỏa" },
    "Kim Cục":  { khoi_tai: "Tốn Tỵ",    mo_khu: "Quý Sửu",  ngu_hanh: "Kim" },
    "Mộc Cục":  { khoi_tai: "Càn Hợi",   mo_khu: "Đinh Mùi", ngu_hanh: "Mộc" }
  };

  // Bảng Hoàng Tuyền Sát (Canh Đinh Khôn thượng thị hoàng tuyền...)
  const HOANG_TUYEN_MAP = {
    "Canh": "Khôn", "Đinh": "Khôn",
    "Khôn": ["Canh", "Đinh"],
    "Ất": "Tốn",    "Bính": "Tốn",
    "Tốn": ["Ất", "Bính"],
    "Giáp": "Cấn",   "Quý": "Cấn",
    "Cấn": ["Giáp", "Quý"],
    "Tân": "Càn",   "Nhâm": "Càn",
    "Càn": ["Tân", "Nhâm"]
  };

  // Bát Sát Tiêu Vong
  const BAT_SAT_CUNG = {
    "Khảm": { chi_sat: "Thìn", con_vat: "Long (Rồng)", son_quai: ["Nhâm", "Tý", "Quý"] },
    "Khôn": { chi_sat: "Mão",  con_vat: "Thỏ (Mèo)",   son_quai: ["Mùi", "Khôn", "Thân"] },
    "Chấn": { chi_sat: "Thân", con_vat: "Hầu (Khỉ)",   son_quai: ["Giáp", "Mão", "Ất"] },
    "Tốn":  { chi_sat: "Dậu",  con_vat: "Kê (Gà)",     son_quai: ["Thìn", "Tốn", "Tỵ"] },
    "Càn":  { chi_sat: "Ngọ",  con_vat: "Mã (Ngựa)",   son_quai: ["Tuất", "Càn", "Hợi"] },
    "Đoài": { chi_sat: "Tỵ",   con_vat: "Xà (Rắn)",    son_quai: ["Canh", "Dậu", "Tân"] },
    "Cấn":  { chi_sat: "Dần",  con_vat: "Hổ (Cọp)",    son_quai: ["Sửu", "Cấn", "Dần"] },
    "Ly":   { chi_sat: "Hợi",  con_vat: "Trư (Lợn)",   son_quai: ["Bính", "Ngọ", "Đinh"] }
  };

  // Nạp Giáp Bát Quái
  const NAP_GIAP_MAP = {
    "Càn":  ["Giáp", "Nhâm"],
    "Khôn": ["Ất", "Quý"],
    "Cấn":  ["Bính"],
    "Tốn":  ["Tân"],
    "Chấn": ["Canh", "Hợi", "Mùi"],
    "Đoài": ["Đinh", "Tỵ", "Sửu"],
    "Khảm": ["Mậu", "Thân", "Thìn"],
    "Ly":   ["Kỷ", "Dần", "Tuất"]
  };

  // Lại Công Ngũ Hành
  const LAI_CONG_NGU_HANH_MAP = {
    "Càn": "Mộc", "Khôn": "Mộc", "Cấn": "Mộc", "Tốn": "Mộc",
    "Dần": "Thủy", "Thân": "Thủy", "Tỵ": "Thủy", "Hợi": "Thủy",
    "Giáp": "Hỏa", "Canh": "Hỏa", "Nhâm": "Hỏa", "Bính": "Hỏa",
    "Tý": "Kim", "Ngọ": "Kim", "Mão": "Kim", "Dậu": "Kim",
    "Thìn": "Thổ", "Tuất": "Thổ", "Sửu": "Thổ", "Mùi": "Thổ",
    "Ất": "Thổ", "Tân": "Thổ", "Đinh": "Thổ", "Quý": "Thổ"
  };

  // 28 Tinh Tú trên Nhân Bàn
  const NHI_THAP_BAT_TU_LIST = [
    { name: "Giác",  phuong: "Đông", ngu_hanh: "Mộc",  tinh_chat: "Cát" },
    { name: "Cang",  phuong: "Đông", ngu_hanh: "Kim",  tinh_chat: "Hung" },
    { name: "Đê",   phuong: "Đông", ngu_hanh: "Thổ",  tinh_chat: "Hung" },
    { name: "Phòng", phuong: "Đông", ngu_hanh: "Hỏa",  tinh_chat: "Cát" },
    { name: "Tâm",   phuong: "Đông", ngu_hanh: "Hỏa",  tinh_chat: "Hung" },
    { name: "Vĩ",    phuong: "Đông", ngu_hanh: "Hỏa",  tinh_chat: "Cát" },
    { name: "Cơ",    phuong: "Đông", ngu_hanh: "Thủy", tinh_chat: "Cát" },
    { name: "Đẩu",   phuong: "Bắc",  ngu_hanh: "Mộc",  tinh_chat: "Cát" },
    { name: "Ngưu",  phuong: "Bắc",  ngu_hanh: "Kim",  tinh_chat: "Hung" },
    { name: "Nữ",    phuong: "Bắc",  ngu_hanh: "Thổ",  tinh_chat: "Hung" },
    { name: "Hư",    phuong: "Bắc",  ngu_hanh: "Hỏa",  tinh_chat: "Hung" },
    { name: "Nguy",  phuong: "Bắc",  ngu_hanh: "Hỏa",  tinh_chat: "Hung" },
    { name: "Thất",  phuong: "Bắc",  ngu_hanh: "Hỏa",  tinh_chat: "Cát" },
    { name: "Bích",  phuong: "Bắc",  ngu_hanh: "Thủy", tinh_chat: "Cát" },
    { name: "Khuê",  phuong: "Tây",  ngu_hanh: "Mộc",  tinh_chat: "Hung" },
    { name: "Lâu",   phuong: "Tây",  ngu_hanh: "Kim",  tinh_chat: "Cát" },
    { name: "Vị",    phuong: "Tây",  ngu_hanh: "Thổ",  tinh_chat: "Cát" },
    { name: "Mão",   phuong: "Tây",  ngu_hanh: "Hỏa",  tinh_chat: "Hung" },
    { name: "Tất",   phuong: "Tây",  ngu_hanh: "Hỏa",  tinh_chat: "Cát" },
    { name: "Chủy",  phuong: "Tây",  ngu_hanh: "Hỏa",  tinh_chat: "Hung" },
    { name: "Sâm",   phuong: "Tây",  ngu_hanh: "Thủy", tinh_chat: "Cát" },
    { name: "Tỉnh",  phuong: "Nam",  ngu_hanh: "Mộc",  tinh_chat: "Cát" },
    { name: "Quỷ",   phuong: "Nam",  ngu_hanh: "Kim",  tinh_chat: "Hung" },
    { name: "Liễu",  phuong: "Nam",  ngu_hanh: "Thổ",  tinh_chat: "Hung" },
    { name: "Tinh",  phuong: "Nam",  ngu_hanh: "Hỏa",  tinh_chat: "Hung" },
    { name: "Trương",phuong: "Nam",  ngu_hanh: "Hỏa",  tinh_chat: "Cát" },
    { name: "Dực",   phuong: "Nam",  ngu_hanh: "Hỏa",  tinh_chat: "Cát" },
    { name: "Chẩn",  phuong: "Nam",  ngu_hanh: "Thủy", tinh_chat: "Cát" }
  ];

  // Phụ Tinh Phiên Quái
  const PHU_TINH_9_SAO = [
    { sao: "Phụ Bật",   tinh_chat: "Cát",  tuong_ung: "Phục Vị",   mo_ta: "Trợ lực, bình an, duy trì cơ nghiệp" },
    { sao: "Vũ Khúc",   tinh_chat: "Cát",  tuong_ung: "Diên Niên", mo_ta: "Tài lộc vững vàng, trường thọ, con cháu hòa thuận" },
    { sao: "Phá Quân",  tinh_chat: "Hung", tuong_ung: "Tuyệt Mệnh", mo_ta: "Tổn hao nhân đinh, quan tụng, tai họa bất ngờ" },
    { sao: "Liêm Trinh", tinh_chat: "Hung", tuong_ung: "Ngũ Quỷ",   mo_ta: "Hỏa hoạn, trộm cướp, khẩu thiệt, bất an" },
    { sao: "Tham Lang", tinh_chat: "Cát",  tuong_ung: "Sinh Khí",   mo_ta: "Đại cát, thăng tiến công danh, tài trí thông minh" },
    { sao: "Cự Môn",    tinh_chat: "Cát",  tuong_ung: "Thiên Y",    mo_ta: "Sức khỏe dồi dào, điền sản hưng thịnh" },
    { sao: "Lộc Tồn",   tinh_chat: "Hung", tuong_ung: "Họa Hại",   mo_ta: "Thất thoát tiền của, thị phi, trở ngại" },
    { sao: "Văn Khúc",  tinh_chat: "Hung", tuong_ung: "Lục Sát",    mo_ta: "Dâm loạn, đào hoa xấu, bệnh tật dây dưa" }
  ];

  // Thiên Ất Quý Nhân (Âm Quý & Dương Quý)
  const THIEN_AT_QUY_NHAN = {
    "Giáp": { duong_quy: "Sửu", am_quy: "Mùi" },
    "Mậu":  { duong_quy: "Sửu", am_quy: "Mùi" },
    "Canh": { duong_quy: "Sửu", am_quy: "Mùi" },
    "Ất":   { duong_quy: "Thân", am_quy: "Tý" },
    "Kỷ":   { duong_quy: "Thân", am_quy: "Tý" },
    "Bính": { duong_quy: "Hợi", am_quy: "Dậu" },
    "Đinh": { duong_quy: "Hợi", am_quy: "Dậu" },
    "Lục Tân": { duong_quy: "Ngọ", am_quy: "Dần" },
    "Tân":  { duong_quy: "Ngọ", am_quy: "Dần" },
    "Nhâm": { duong_quy: "Mão", am_quy: "Tỵ" },
    "Quý":  { duong_quy: "Mão", am_quy: "Tỵ" }
  };

  // Thiên Lộc (Lộc Quý Nhân)
  const THIEN_LOC = {
    "Giáp": "Dần", "Ất": "Mão", "Bính": "Tỵ", "Đinh": "Ngọ",
    "Mậu": "Tỵ", "Kỷ": "Ngọ", "Canh": "Thân", "Tân": "Dậu",
    "Nhâm": "Hợi", "Quý": "Tý"
  };

  // Mã Quý Nhân (Dịch Mã)
  const DICH_MA = {
    "Thân": "Dần", "Tý": "Dần", "Thìn": "Dần",
    "Dần": "Thân", "Ngọ": "Thân", "Tuất": "Thân",
    "Tỵ": "Hợi", "Dậu": "Hợi", "Sửu": "Hợi",
    "Hợi": "Tỵ", "Mão": "Tỵ", "Mùi": "Tỵ"
  };

  // Tam Sát
  const TAM_SAT = {
    "Dần": { tam_sat: "Bắc", chi_sat: ["Hợi", "Tý", "Sửu"] },
    "Ngọ": { tam_sat: "Bắc", chi_sat: ["Hợi", "Tý", "Sửu"] },
    "Tuất": { tam_sat: "Bắc", chi_sat: ["Hợi", "Tý", "Sửu"] },
    "Thân": { tam_sat: "Nam", chi_sat: ["Tỵ", "Ngọ", "Mùi"] },
    "Tý": { tam_sat: "Nam", chi_sat: ["Tỵ", "Ngọ", "Mùi"] },
    "Thìn": { tam_sat: "Nam", chi_sat: ["Tỵ", "Ngọ", "Mùi"] },
    "Tỵ": { tam_sat: "Đông", chi_sat: ["Dần", "Mão", "Thìn"] },
    "Dậu": { tam_sat: "Đông", chi_sat: ["Dần", "Mão", "Thìn"] },
    "Sửu": { tam_sat: "Đông", chi_sat: ["Dần", "Mão", "Thìn"] },
    "Hợi": { tam_sat: "Tây", chi_sat: ["Thân", "Dậu", "Tuất"] },
    "Mão": { tam_sat: "Tây", chi_sat: ["Thân", "Dậu", "Tuất"] },
    "Mùi": { tam_sat: "Tây", chi_sat: ["Thân", "Dậu", "Tuất"] }
  };

  // Tiện ích hỗ trợ chuẩn hóa góc
  function normalizeDeg(deg) {
    return ((deg % 360.0) + 360.0) % 360.0;
  }

  // =========================================================================
  // CLASS TAM HOP ENGINE
  // =========================================================================
  class TamHopEngine {
    // Thuộc tính tĩnh truy cập dữ liệu
    static SON_24 = SON_24;
    static SONG_SON = SONG_SON;
    static CUNG_TRUONG_SINH = CUNG_TRUONG_SINH;
    static VONG_SONG_SON_THUAN = VONG_SONG_SON_THUAN;
    static KHOI_TRUONG_SINH = KHOI_TRUONG_SINH;
    static HOANG_TUYEN_MAP = HOANG_TUYEN_MAP;
    static BAT_SAT_CUNG = BAT_SAT_CUNG;
    static NAP_GIAP_MAP = NAP_GIAP_MAP;
    static LAI_CONG_NGU_HANH_MAP = LAI_CONG_NGU_HANH_MAP;
    static NHI_THAP_BAT_TU_LIST = NHI_THAP_BAT_TU_LIST;
    static PHU_TINH_9_SAO = PHU_TINH_9_SAO;
    static THIEN_AT_QUY_NHAN = THIEN_AT_QUY_NHAN;
    static THIEN_LOC = THIEN_LOC;
    static DICH_MA = DICH_MA;
    static TAM_SAT = TAM_SAT;

    // Instance properties mirror statics for class instances
    SON_24 = SON_24;
    SONG_SON = SONG_SON;
    CUNG_TRUONG_SINH = CUNG_TRUONG_SINH;
    VONG_SONG_SON_THUAN = VONG_SONG_SON_THUAN;
    KHOI_TRUONG_SINH = KHOI_TRUONG_SINH;
    HOANG_TUYEN_MAP = HOANG_TUYEN_MAP;
    BAT_SAT_CUNG = BAT_SAT_CUNG;
    NAP_GIAP_MAP = NAP_GIAP_MAP;
    LAI_CONG_NGU_HANH_MAP = LAI_CONG_NGU_HANH_MAP;
    NHI_THAP_BAT_TU_LIST = NHI_THAP_BAT_TU_LIST;
    PHU_TINH_9_SAO = PHU_TINH_9_SAO;
    THIEN_AT_QUY_NHAN = THIEN_AT_QUY_NHAN;
    THIEN_LOC = THIEN_LOC;
    DICH_MA = DICH_MA;
    TAM_SAT = TAM_SAT;

    // =========================================================================
    // MODULE 1: HỆ QUY CHIẾU TAM BÀN LA KINH
    // =========================================================================
    static get_son_from_degree(deg, ban = "dia_ban") {
      deg = normalizeDeg(deg);
      let calc_deg = deg;
      // Quy đổi góc ngắm thực địa về hệ tọa độ Địa Bàn để tra cứu bảng SON_24:
      // - Địa bàn (Chính châm): Chuẩn 0° Bắc, không lệch.
      // - Thiên bàn (Phùng châm): Vành ngoài lệch thuận +7.5° (về Đông).
      //   Tâm Tý Thiên bàn ở 7.5° (giữa Tý và Quý Địa bàn). Sơn Tý: [0.0°, 15.0°).
      //   Muốn một góc thực địa deg quy về Địa bàn để tra SON_24: calc_deg = deg - 7.5°.
      // - Nhân bàn (Trung châm): Vành giữa lệch nghịch -7.5° (về Tây).
      //   Tâm Tý Nhân bàn ở 352.5° (giữa Nhâm và Tý Địa bàn). Sơn Tý: [345.0°, 360.0°).
      //   Muốn một góc thực địa deg quy về Địa bàn để tra SON_24: calc_deg = deg + 7.5°.
      if (ban === "nhan_ban") {
        calc_deg = normalizeDeg(deg + 7.5);
      } else if (ban === "thien_ban") {
        calc_deg = normalizeDeg(deg - 7.5);
      }

      let matched_son = null;
      for (let i = 0; i < SON_24.length; i++) {
        const s = SON_24[i];
        if (s.name === "Tý") {
          if (calc_deg >= s.deg_start || calc_deg < s.deg_end) {
            matched_son = Object.assign({}, s);
            break;
          }
        } else {
          if (calc_deg >= s.deg_start && calc_deg < s.deg_end) {
            matched_son = Object.assign({}, s);
            break;
          }
        }
      }

      let rel_pos = 0.0;
      if (matched_son.name === "Tý") {
        rel_pos = normalizeDeg(calc_deg - 352.5);
      } else {
        rel_pos = calc_deg - matched_son.deg_start;
      }

      let sub_zone = "";
      let is_pure_center = false;
      if (rel_pos < 3.0) {
        sub_zone = "Biên trái (3° - Cận Không Vong / Xuất Quái)";
        is_pure_center = false;
      } else if (rel_pos > 12.0) {
        sub_zone = "Biên phải (3° - Cận Không Vong / Xuất Quái)";
        is_pure_center = false;
      } else {
        sub_zone = "Tâm sơn chính giữa (9° - Chính Khí Thuần Khiết)";
        is_pure_center = true;
      }

      return {
        ban: ban,
        raw_degree: deg,
        calc_degree: calc_deg,
        son_name: matched_son.name,
        cung_bat_quai: matched_son.cung_bat_quai,
        am_duong: matched_son.am_duong,
        ngu_hanh: matched_son.ngu_hanh,
        sub_zone: sub_zone,
        is_pure_center: is_pure_center
      };
    }
    get_son_from_degree(deg, ban = "dia_ban") {
      return TamHopEngine.get_son_from_degree(deg, ban);
    }

    // =========================================================================
    // MODULE 2: ĐỊNH CỤC TỪ THỦY KHẨU (BÀI 8 KHÓA 1)
    // =========================================================================
    static determine_cuc_from_thuy_khau(thuy_khau_deg_or_name) {
      let son_name = "";
      if (typeof thuy_khau_deg_or_name === "number") {
        const son_info = TamHopEngine.get_son_from_degree(thuy_khau_deg_or_name, "thien_ban");
        son_name = son_info.son_name;
      } else {
        son_name = String(thuy_khau_deg_or_name).trim();
      }

      let matched_song_son = null;
      for (const ss in SONG_SON) {
        if (ss.includes(son_name)) {
          matched_song_son = ss;
          break;
        }
      }

      if (!matched_song_son) {
        throw new Error("Không nhận diện được Song Sơn cho Thủy Khẩu: " + son_name);
      }

      const cuc_name = SONG_SON[matched_song_son].cuc;
      const cuc_info = KHOI_TRUONG_SINH[cuc_name];

      return {
        thuy_khau_son: son_name,
        thuy_khau_song_son: matched_song_son,
        cuc_name: cuc_name,
        cuc_ngu_hanh: cuc_info.ngu_hanh,
        khoi_truong_sinh_tai: cuc_info.khoi_tai,
        mo_khu_chuan: cuc_info.mo_khu
      };
    }
    determine_cuc_from_thuy_khau(thuy_khau_deg_or_name) {
      return TamHopEngine.determine_cuc_from_thuy_khau(thuy_khau_deg_or_name);
    }
    static dinh_cuc_thuy_khau(thuy_khau_deg_or_name) {
      return TamHopEngine.determine_cuc_from_thuy_khau(thuy_khau_deg_or_name);
    }
    dinh_cuc_thuy_khau(thuy_khau_deg_or_name) {
      return TamHopEngine.determine_cuc_from_thuy_khau(thuy_khau_deg_or_name);
    }

    // =========================================================================
    // MODULE 3: VÒNG TRƯỜNG SINH 12 CUNG TRÊN THIÊN BÀN
    // =========================================================================
    static get_vong_truong_sinh(cuc_name, chieu_quay = "thuan") {
      const khoi_tai = KHOI_TRUONG_SINH[cuc_name].khoi_tai;
      const idx_start = VONG_SONG_SON_THUAN.indexOf(khoi_tai);

      const result = [];
      for (let step = 0; step < 12; step++) {
        const cung_ts = CUNG_TRUONG_SINH[step];
        let ss_idx = 0;
        if (chieu_quay === "thuan") {
          ss_idx = (idx_start + step) % 12;
        } else {
          ss_idx = ((idx_start - step) % 12 + 12) % 12;
        }

        const ss_name = VONG_SONG_SON_THUAN[ss_idx];
        let tinh_chat = "Bình / Tụ Khí";
        if (["Trường Sinh", "Quan Đới", "Lâm Quan", "Đế Vượng"].includes(cung_ts)) {
          tinh_chat = "Cát Thủy (Lai Thủy/Cửa)";
        } else if (["Mộ", "Tuyệt", "Tử", "Bệnh"].includes(cung_ts)) {
          tinh_chat = "Khứ Thủy Cát (Thoát nước/Mộ)";
        }

        result.push({
          cung_truong_sinh: cung_ts,
          song_son: ss_name,
          ngu_hanh: SONG_SON[ss_name].ngu_hanh,
          tinh_chat: tinh_chat
        });
      }
      return result;
    }
    get_vong_truong_sinh(cuc_name, chieu_quay = "thuan") {
      return TamHopEngine.get_vong_truong_sinh(cuc_name, chieu_quay);
    }

    static an_vong_truong_sinh(cuc_name, chieu_quay = "thuan") {
      const lst = TamHopEngine.get_vong_truong_sinh(cuc_name, chieu_quay);
      const res = {};
      for (let i = 0; i < lst.length; i++) {
        res[lst[i].song_son] = lst[i].cung_truong_sinh;
      }
      return res;
    }
    an_vong_truong_sinh(cuc_name, chieu_quay = "thuan") {
      return TamHopEngine.an_vong_truong_sinh(cuc_name, chieu_quay);
    }

    // =========================================================================
    // MODULE 4: NHẬN DIỆN THẾ CỤC THỦY PHÁP & ĐÁNH GIÁ TỌA HƯỚNG
    // =========================================================================
    static evaluate_trach_thuy_phap(huong_nha_deg, thuy_khau_deg, dong_chay = "ta_dao_huu") {
      const huong_dia_ban = TamHopEngine.get_son_from_degree(huong_nha_deg, "dia_ban");
      const thuy_khau_thien_ban = TamHopEngine.get_son_from_degree(thuy_khau_deg, "thien_ban");

      const cuc_res = TamHopEngine.determine_cuc_from_thuy_khau(thuy_khau_thien_ban.son_name);
      const cuc_name = cuc_res.cuc_name;

      const chieu = dong_chay.toLowerCase().includes("ta") ? "thuan" : "nghich";
      const vong_ts = TamHopEngine.get_vong_truong_sinh(cuc_name, chieu);

      const huong_son = huong_dia_ban.son_name;
      let huong_song_son = null;
      for (const ss in SONG_SON) {
        if (ss.includes(huong_son)) {
          huong_song_son = ss;
          break;
        }
      }

      let cung_nap_huong = "Không rõ";
      for (let i = 0; i < vong_ts.length; i++) {
        if (vong_ts[i].song_son === huong_song_son) {
          cung_nap_huong = vong_ts[i].cung_truong_sinh;
          break;
        }
      }

      let the_cuc = "Phổ thông";
      let danh_gia = "Bình";
      let ghi_chu = "";

      if (cung_nap_huong === "Đế Vượng" && cuc_res.thuy_khau_song_son.includes("Ất Thìn")) {
        the_cuc = "CHÍNH VƯỢNG HƯỚNG (Tả Thủy Đảo Hữu xuất Mộ vị)";
        danh_gia = "ĐẠI CÁT ĐẠI LỢI";
        ghi_chu = "Hưng thịnh kinh doanh thương nghiệp, gia tăng tích lũy tài chính, con cháu hưng vượng.";
      } else if (cung_nap_huong === "Trường Sinh" && cuc_res.thuy_khau_song_son.includes("Ất Thìn")) {
        the_cuc = "CHÍNH SINH HƯỚNG (Hữu Thủy Đảo Tả xuất Mộ vị)";
        danh_gia = "ĐẠI CÁT ĐẠI LỢI";
        ghi_chu = "Đinh tài lưỡng vượng, phúc thọ miên trường, quý nhân phù trợ.";
      } else if (cung_nap_huong === "Lâm Quan") {
        the_cuc = "LÂM QUAN HƯỚNG";
        danh_gia = "CÁT (Vượng Quan Lộc)";
        ghi_chu = "Thăng quan tiến chức, danh hiển dòng tộc, con cháu đỗ đạt.";
      } else if (["Bệnh", "Tử", "Tuyệt"].includes(cung_nap_huong)) {
        the_cuc = "HƯỚNG PHẠM TỬ TUYỆT";
        danh_gia = "ĐẠI HUNG";
        ghi_chu = "Khí suy bại, tài vận hao tán, bệnh tật liên miên. Cần xoay cửa chỉnh phân kim.";
      }

      // Kiểm tra Hoàng Tuyền
      const ht_res = TamHopEngine.kiem_tra_hoang_tuyen(huong_son, thuy_khau_thien_ban.son_name);
      const ht_warning = ht_res.mo_ta;
      if (ht_res.pham_sat && ht_res.loai_sat.includes("SÁT NHÂN")) {
        danh_gia = "ĐẠI HUNG";
      }

      return {
        huong_nha: huong_dia_ban,
        thuy_khau: thuy_khau_thien_ban,
        cuc_name: cuc_name,
        chieu_quay: chieu,
        huong_song_son: huong_song_son,
        cung_nap_huong: cung_nap_huong,
        the_cuc: the_cuc,
        danh_gia: danh_gia,
        hoang_tuyen_sat: ht_warning,
        khuyen_nghi: ghi_chu
      };
    }
    evaluate_trach_thuy_phap(huong_nha_deg, thuy_khau_deg, dong_chay = "ta_dao_huu") {
      return TamHopEngine.evaluate_trach_thuy_phap(huong_nha_deg, thuy_khau_deg, dong_chay);
    }

    // =========================================================================
    // MODULE 5: LAI THỦY - KHỨ THỦY & XUNG PHÁ CÁC CUNG (BÀI 9 KHÓA 1)
    // =========================================================================
    static evaluate_lai_khu_thuy(cuc_name, lai_thuy_son, khu_thuy_son, chieu_quay = "thuan") {
      const vong_ts = TamHopEngine.get_vong_truong_sinh(cuc_name, chieu_quay);

      let cung_lai = null;
      let cung_khu = null;
      for (let i = 0; i < vong_ts.length; i++) {
        if (vong_ts[i].song_son.includes(lai_thuy_son)) {
          cung_lai = vong_ts[i].cung_truong_sinh;
        }
        if (vong_ts[i].song_son.includes(khu_thuy_son)) {
          cung_khu = vong_ts[i].cung_truong_sinh;
        }
      }

      const lai_danh_gia = ["Trường Sinh", "Quan Đới", "Lâm Quan", "Đế Vượng"].includes(cung_lai)
        ? "Cát"
        : "Hung (Lai Thủy suy bại)";

      const xung_pha = [];
      let khu_danh_gia = "Cát (Tiêu thủy đúng vị)";
      if (cung_khu === "Trường Sinh") {
        xung_pha.push("XUNG PHÁ TRƯỜNG SINH (Đại Hung - Tổn hại nhân đinh, đoản thọ)");
        khu_danh_gia = "ĐẠI HUNG";
      } else if (cung_khu === "Lâm Quan") {
        xung_pha.push("XUNG PHÁ LÂM QUAN (Đại Hung - Phá sản, thoái quan, suy đồi cơ nghiệp)");
        khu_danh_gia = "ĐẠI HUNG";
      } else if (cung_khu === "Đế Vượng") {
        xung_pha.push("XUNG PHÁ ĐẾ VƯỢNG (Đại Hung - Tiêu tán đại tài sản, suy vi bất ngờ)");
        khu_danh_gia = "ĐẠI HUNG";
      }

      return {
        cuc_name: cuc_name,
        lai_thuy_son: lai_thuy_son,
        cung_lai_thuy: cung_lai,
        lai_thuy_danh_gia: lai_danh_gia,
        khu_thuy_son: khu_thuy_son,
        cung_khu_thuy: cung_khu,
        khu_thuy_danh_gia: khu_danh_gia,
        xung_pha_canh_bao: xung_pha.length > 0 ? xung_pha : ["Không phạm xung phá cát vị"]
      };
    }
    evaluate_lai_khu_thuy(cuc_name, lai_thuy_son, khu_thuy_son, chieu_quay = "thuan") {
      return TamHopEngine.evaluate_lai_khu_thuy(cuc_name, lai_thuy_son, khu_thuy_son, chieu_quay);
    }

    // =========================================================================
    // MODULE 6: BÁT SÁT TIÊU VONG (BÀI 6 KHÓA 1 & BÀI 3 KHÓA 2)
    // =========================================================================
    static kiem_tra_bat_sat_cung(toa_son, phuong_den_hoac_thuy) {
      toa_son = String(toa_son).trim();
      const phuong = String(phuong_den_hoac_thuy).trim();

      let quai_toa = null;
      for (let i = 0; i < SON_24.length; i++) {
        if (SON_24[i].name === toa_son) {
          quai_toa = SON_24[i].cung_bat_quai;
          break;
        }
      }

      if (!quai_toa || !BAT_SAT_CUNG[quai_toa]) {
        return { pham_bat_sat: false, mo_ta: "Không xác định được quẻ cho tọa " + toa_son };
      }

      const sat_info = BAT_SAT_CUNG[quai_toa];
      const chi_sat = sat_info.chi_sat;
      const pham = (chi_sat === phuong) || phuong.includes(chi_sat);

      return {
        toa_son: toa_son,
        cung_bat_quai: quai_toa,
        chi_sat_ky: chi_sat,
        con_vat_tuong_trung: sat_info.con_vat,
        phuong_xet: phuong,
        pham_bat_sat: pham,
        danh_gia: pham ? "ĐẠI HUNG (Phạm Bát Sát Tiêu Vong)" : "BÌNH (Không phạm Bát Sát)",
        mo_ta: pham
          ? `Tọa ${toa_son} (${quai_toa}) kỵ phương ${chi_sat} (${sat_info.con_vat}). Nếu có Lai thủy, Sa nhọn hoặc mở cửa tại đây sẽ phạm Bát Sát Tiêu Vong.`
          : "Phương vị an toàn."
      };
    }
    kiem_tra_bat_sat_cung(toa_son, phuong_den_hoac_thuy) {
      return TamHopEngine.kiem_tra_bat_sat_cung(toa_son, phuong_den_hoac_thuy);
    }

    // =========================================================================
    // MODULE 7: NẠP GIÁP BÁT QUÁI (BÀI 11 KHÓA 1)
    // =========================================================================
    static nap_giap_bat_quai(son_name) {
      const son = String(son_name).trim();
      let quai_nap = null;
      for (const q in NAP_GIAP_MAP) {
        if (NAP_GIAP_MAP[q].includes(son)) {
          quai_nap = q;
          break;
        }
      }

      let ngu_hanh_quai = "Thổ";
      if (["Càn", "Đoài"].includes(quai_nap)) {
        ngu_hanh_quai = "Kim";
      } else if (["Chấn", "Tốn"].includes(quai_nap)) {
        ngu_hanh_quai = "Mộc";
      } else if (quai_nap === "Khảm") {
        ngu_hanh_quai = "Thủy";
      } else if (quai_nap === "Ly") {
        ngu_hanh_quai = "Hỏa";
      }

      return {
        son_name: son,
        quai_nap_giap: quai_nap,
        ngu_hanh_quai: ngu_hanh_quai
      };
    }
    nap_giap_bat_quai(son_name) {
      return TamHopEngine.nap_giap_bat_quai(son_name);
    }

    // =========================================================================
    // MODULE 8: THÔI QUAN THỦY PHÁP (BÀI 15 KHÓA 1)
    // =========================================================================
    static thoi_quan_thuy_phap(cuc_name, huong_nha_son) {
      const vong_ts = TamHopEngine.get_vong_truong_sinh(cuc_name, "thuan");
      let lam_quan_ss = null;
      for (let i = 0; i < vong_ts.length; i++) {
        if (vong_ts[i].cung_truong_sinh === "Lâm Quan") {
          lam_quan_ss = vong_ts[i].song_son;
          break;
        }
      }

      return {
        cuc_name: cuc_name,
        huong_nha_son: huong_nha_son,
        phuong_lam_quan: lam_quan_ss,
        phuong_phap_kich_hoat: `Mở cổng, trổ cửa phụ hoặc thiết kế bể cá/hồ nước tụ thủy tại phương vị ${lam_quan_ss} (Lâm Quan) để kích hoạt tài lộc, thúc đẩy công danh sự nghiệp phát triển vững bền.`
      };
    }
    thoi_quan_thuy_phap(cuc_name, huong_nha_son) {
      return TamHopEngine.thoi_quan_thuy_phap(cuc_name, huong_nha_son);
    }

    // =========================================================================
    // MODULE 9: PHÉP BỔ LONG MẠCH (BÀI 1 KHÓA 2)
    // =========================================================================
    static kiem_tra_bo_long(toa_nha_son, long_nhap_thu_son) {
      let toa_nh = null;
      let long_nh = null;
      for (let i = 0; i < SON_24.length; i++) {
        if (SON_24[i].name === toa_nha_son) {
          toa_nh = SON_24[i].ngu_hanh;
        }
        if (SON_24[i].name === long_nhap_thu_son) {
          long_nh = SON_24[i].ngu_hanh;
        }
      }

      const sinh_map = { "Thủy": "Mộc", "Mộc": "Hỏa", "Hỏa": "Thổ", "Thổ": "Kim", "Kim": "Thủy" };
      const khac_map = { "Thủy": "Hỏa", "Hỏa": "Kim", "Kim": "Mộc", "Mộc": "Thổ", "Thổ": "Thủy" };

      let danh_gia = "Bình";
      if (long_nh === toa_nh) {
        danh_gia = "CÁT (Tỷ Hòa Vượng Long)";
      } else if (sinh_map[long_nh] === toa_nh) {
        danh_gia = "ĐẠI CÁT (Long Sinh Tọa - Sinh Khí Dồi Dào)";
      } else if (sinh_map[toa_nh] === long_nh) {
        danh_gia = "THỨ CÁT (Tọa Sinh Long - Tiết Khí Nhẹ)";
      } else if (khac_map[long_nh] === toa_nh) {
        danh_gia = "ĐẠI HUNG (Long Khắc Tọa - Sát Long Bất Lợi)";
      } else if (khac_map[toa_nh] === long_nh) {
        danh_gia = "BÌNH (Tọa Khắc Long - Chế Ngự Khí)";
      }

      return {
        toa_nha_son: toa_nha_son,
        toa_ngu_hanh: toa_nh,
        long_nhap_thu_son: long_nhap_thu_son,
        long_ngu_hanh: long_nh,
        danh_gia: danh_gia,
        nguyen_ly: "Long mạch nhập thủ cần tương sinh hoặc tỷ hòa với Tọa nhà để bảo toàn sinh khí tiếp dẫn cho trạch đất."
      };
    }
    kiem_tra_bo_long(toa_nha_son, long_nhap_thu_son) {
      return TamHopEngine.kiem_tra_bo_long(toa_nha_son, long_nhap_thu_son);
    }

    // =========================================================================
    // MODULE 10: THÁI TUẾ, TUẾ PHÁ & BÀN KIẾP SÁT (BÀI 3 KHÓA 2)
    // =========================================================================
    static kiem_tra_thai_tue_tue_pha(nam_chi, huong_toa_son) {
      const xung_chi = {
        "Tý": "Ngọ", "Sửu": "Mùi", "Dần": "Thân", "Mão": "Dậu",
        "Thìn": "Tuất", "Tỵ": "Hợi", "Ngọ": "Tý", "Mùi": "Sửu",
        "Thân": "Dần", "Dậu": "Mão", "Tuất": "Thìn", "Hợi": "Tỵ"
      };
      const tue_pha = xung_chi[nam_chi] || "Không rõ";

      const pham_thai_tue = huong_toa_son.includes(nam_chi);
      const pham_tue_pha = huong_toa_son.includes(tue_pha);

      let danh_gia = "BÌNH (An Lành)";
      if (pham_tue_pha) {
        danh_gia = "ĐẠI HUNG (Phạm Tuế Phá - Nghiêm cấm động thổ và lập hướng)";
      } else if (pham_thai_tue) {
        danh_gia = "CẦN LƯU Ý (Phạm Thái Tuế - Có thể Tọa, kỵ lập Hướng)";
      }

      return {
        nam_chi: nam_chi,
        thai_tue_phuong: nam_chi,
        tue_pha_phuong: tue_pha,
        son_dang_xet: huong_toa_son,
        pham_thai_tue: pham_thai_tue,
        pham_tue_pha: pham_tue_pha,
        danh_gia: danh_gia
      };
    }
    kiem_tra_thai_tue_tue_pha(nam_chi, huong_toa_son) {
      return TamHopEngine.kiem_tra_thai_tue_tue_pha(nam_chi, huong_toa_son);
    }

    // =========================================================================
    // MODULE 11: 72 XUYÊN SƠN LONG & 12 QUÝ GIÁP KHÔNG VONG (BÀI 4 KHÓA 2)
    // =========================================================================
    static get_72_xuyen_son_long(deg) {
      deg = normalizeDeg(deg);
      const long_index = Math.floor(deg / 5.0) + 1;

      let is_quy_giap_khong_vong = false;
      const rel_to_border = deg % 30.0;
      if (rel_to_border < 2.5 || rel_to_border > 27.5) {
        is_quy_giap_khong_vong = true;
      }

      const canh_bao = is_quy_giap_khong_vong
        ? "ĐẠI HUNG (Rơi vào Quý Giáp Không Vong - Khí đất chai cứng, không nên sử dụng)"
        : "HỢP CÁCH (Xuyên Sơn Long nạp khí lưu thông)";

      return {
        degree: deg,
        long_index_72: long_index,
        is_quy_giap_khong_vong: is_quy_giap_khong_vong,
        danh_gia: canh_bao
      };
    }
    get_72_xuyen_son_long(deg) {
      return TamHopEngine.get_72_xuyen_son_long(deg);
    }

    // =========================================================================
    // MODULE 12: LẠI CÔNG NGŨ HÀNH (BÀI 5 KHÓA 2)
    // =========================================================================
    static lai_cong_ngu_hanh(son_name) {
      const son = String(son_name).trim();
      const nh = LAI_CONG_NGU_HANH_MAP[son] || "Không rõ";
      return {
        son_name: son,
        lai_cong_ngu_hanh: nh,
        khau_quyet: "Càn Khôn Cấn Tốn Mộc, Dần Thân Tỵ Hợi Thủy, Giáp Canh Nhâm Bính Hỏa, Tý Ngọ Mão Dậu Kim, Thìn Tuất Sửu Mùi Ất Tân Đinh Quý Thổ."
      };
    }
    lai_cong_ngu_hanh(son_name) {
      return TamHopEngine.lai_cong_ngu_hanh(son_name);
    }

    // =========================================================================
    // MODULE 13: HÌNH THỂ SA SƠN & TIÊU SA TRÊN NHÂN BÀN (BÀI 6-9 KHÓA 2)
    // =========================================================================
    static phan_loai_hinh_the_sa(mo_ta) {
      const mo_ta_lower = String(mo_ta).toLowerCase();
      if (mo_ta_lower.includes("tròn") || mo_ta_lower.includes("bát úp") || mo_ta_lower.includes("chuông")) {
        return { loai_sa: "Kim Sa", ngu_hanh: "Kim", hinh_thai: "Đỉnh tròn trịa", tinh_chat: "Chủ tài lộc, tích lũy của cải điền sản" };
      } else if (mo_ta_lower.includes("nhọn") || mo_ta_lower.includes("tam giác") || mo_ta_lower.includes("tháp")) {
        return { loai_sa: "Hỏa Sa", ngu_hanh: "Hỏa", hinh_thai: "Đỉnh sắc nhọn", tinh_chat: "Chủ hỏa hoạn, thị phi, quan tụng (cần tránh)" };
      } else if (mo_ta_lower.includes("sóng") || mo_ta_lower.includes("lượn") || mo_ta_lower.includes("nhấp nhô")) {
        return { loai_sa: "Thủy Sa", ngu_hanh: "Thủy", hinh_thai: "Uốn lượn mềm mại", tinh_chat: "Chủ đào hoa, trí tuệ thông minh, mưu lược" };
      } else if (mo_ta_lower.includes("vuông") || mo_ta_lower.includes("phẳng") || mo_ta_lower.includes("bàn")) {
        return { loai_sa: "Thổ Sa", ngu_hanh: "Thổ", hinh_thai: "Đỉnh bằng phẳng", tinh_chat: "Chủ đất đai điền trang, uy quyền vững chãi" };
      } else {
        return { loai_sa: "Mộc Sa", ngu_hanh: "Mộc", hinh_thai: "Trụ đứng vươn cao", tinh_chat: "Chủ học vấn khoa bảng, danh hiển dòng tộc" };
      }
    }
    phan_loai_hinh_the_sa(mo_ta) {
      return TamHopEngine.phan_loai_hinh_the_sa(mo_ta);
    }

    static tieu_sa_ngu_hanh(toa_ngu_hanh, sa_ngu_hanh) {
      const sinh_map = { "Thủy": "Mộc", "Mộc": "Hỏa", "Hỏa": "Thổ", "Thổ": "Kim", "Kim": "Thủy" };
      const khac_map = { "Thủy": "Hỏa", "Hỏa": "Kim", "Kim": "Mộc", "Mộc": "Thổ", "Thổ": "Thủy" };

      let tinh_chat = "BÌNH";
      let phan_loai = "Bình";

      if (sa_ngu_hanh === toa_ngu_hanh) {
        tinh_chat = "VƯỢNG SA (Cát - Nhân đinh hưng thịnh, bạn bè tương trợ)";
        phan_loai = "Vượng Sa";
      } else if (sinh_map[sa_ngu_hanh] === toa_ngu_hanh) {
        tinh_chat = "SINH SA (Đại Cát - Tăng phúc tăng thọ, tài lộc dồi dào)";
        phan_loai = "Sinh Sa";
      } else if (khac_map[toa_ngu_hanh] === sa_ngu_hanh) {
        tinh_chat = "NÔ SA / TÀI SA (Cát - Làm chủ tiền bạc, công danh hưng thịnh)";
        phan_loai = "Nô Sa";
      } else if (khac_map[sa_ngu_hanh] === toa_ngu_hanh) {
        tinh_chat = "SÁT SA (Đại Hung - Sát thương tai họa, bệnh tật nan y)";
        phan_loai = "Sát Sa";
      } else if (sinh_map[toa_ngu_hanh] === sa_ngu_hanh) {
        tinh_chat = "TIẾT SA (Hung - Hao tán sinh khí, thất thoát tài chính)";
        phan_loai = "Tiết Sa";
      }

      return {
        toa_ngu_hanh: toa_ngu_hanh,
        sa_ngu_hanh: sa_ngu_hanh,
        phan_loai_sa: phan_loai,
        danh_gia: tinh_chat
      };
    }
    tieu_sa_ngu_hanh(toa_ngu_hanh, sa_ngu_hanh) {
      return TamHopEngine.tieu_sa_ngu_hanh(toa_ngu_hanh, sa_ngu_hanh);
    }

    // =========================================================================
    // MODULE 14: NHỊ THẬP BÁT TÚ TRÊN NHÂN BÀN (BÀI 7 KHÓA 2)
    // =========================================================================
    static nhi_thap_bat_tu_nhan_ban(deg) {
      const calc_deg = normalizeDeg(deg + 7.5);
      const step = 360.0 / 28.0;
      const idx = Math.floor(calc_deg / step) % 28;
      const tu_info = NHI_THAP_BAT_TU_LIST[idx];

      return {
        raw_deg: deg,
        nhan_ban_deg: calc_deg,
        tinh_tu_name: tu_info.name,
        phuong_vi: tu_info.phuong,
        tinh_tu_ngu_hanh: tu_info.ngu_hanh,
        tinh_chat: tu_info.tinh_chat
      };
    }
    nhi_thap_bat_tu_nhan_ban(deg) {
      return TamHopEngine.nhi_thap_bat_tu_nhan_ban(deg);
    }

    // =========================================================================
    // MODULE 15: PHỤ TINH PHIÊN QUÁI SA PHÁP (BÀI 8 KHÓA 2)
    // =========================================================================
    static phu_tinh_phien_quai_sa(toa_quai, sa_quai) {
      const map_can = {
        "Càn": "Phụ Bật", "Đoài": "Vũ Khúc", "Chấn": "Phá Quân", "Khôn": "Liêm Trinh",
        "Khảm": "Tham Lang", "Tốn": "Cự Môn", "Cấn": "Lộc Tồn", "Ly": "Văn Khúc"
      };
      const sao_name = map_can[sa_quai] || "Phụ Bật";
      let sao_info = null;
      for (let i = 0; i < PHU_TINH_9_SAO.length; i++) {
        if (PHU_TINH_9_SAO[i].sao === sao_name) {
          sao_info = PHU_TINH_9_SAO[i];
          break;
        }
      }

      return {
        toa_quai: toa_quai,
        sa_quai: sa_quai,
        sao_phien_quai: sao_name,
        tinh_chat: sao_info.tinh_chat,
        tuong_ung_bat_trach: sao_info.tuong_ung,
        mo_ta: sao_info.mo_ta
      };
    }
    phu_tinh_phien_quai_sa(toa_quai, sa_quai) {
      return TamHopEngine.phu_tinh_phien_quai_sa(toa_quai, sa_quai);
    }

    // =========================================================================
    // MODULE 16: HOÀNG TUYỀN SA PHÁP (BÀI 10 KHÓA 2)
    // =========================================================================
    static kiem_tra_hoang_tuyen_sa(huong_son, sa_son) {
      const res_ht = TamHopEngine.kiem_tra_hoang_tuyen(huong_son, sa_son);
      if (res_ht.pham_sat && res_ht.loai_sat.includes("SÁT NHÂN")) {
        return {
          pham_hoang_tuyen_sa: true,
          danh_gia: "ĐẠI HUNG (Hoàng Tuyền Sát Sa)",
          mo_ta: `Hướng ${huong_son} thấy Sa Sơn tại phương ${sa_son} phạm Hoàng Tuyền Sát Sa, chủ tổn thọ và thoái bại danh lộc.`
        };
      }
      return {
        pham_hoang_tuyen_sa: false,
        danh_gia: "BÌNH (Không phạm Hoàng Tuyền Sa)",
        mo_ta: "Phương vị Sa Sơn không phạm Hoàng Tuyền."
      };
    }
    kiem_tra_hoang_tuyen_sa(huong_son, sa_son) {
      return TamHopEngine.kiem_tra_hoang_tuyen_sa(huong_son, sa_son);
    }

    // =========================================================================
    // MODULE 17: HÌNH THỂ MÃ QUÝ NHÂN (BÀI 14 KHÓA 2)
    // =========================================================================
    static phan_tich_hinh_the_ma(chi_chu, sa_son, mo_ta) {
      const dich_ma_phuong = DICH_MA[chi_chu];
      const is_dung_phuong = (sa_son === dich_ma_phuong) || (dich_ma_phuong && sa_son.includes(dich_ma_phuong));
      const mo_ta_lower = String(mo_ta).toLowerCase();
      const is_yen_ngua = mo_ta_lower.includes("yên ngựa") || mo_ta_lower.includes("lõm giữa") || mo_ta_lower.includes("yên cương");

      let danh_gia = "BÌNH THƯỜNG (Không đắc cách Mã Quý Nhân)";
      if (is_dung_phuong && is_yen_ngua) {
        danh_gia = "ĐẠI CÁT (Chính Khí Mã Quý Nhân Đắc Cách - Thăng quan tiến chức, công tác thuyên chuyển hanh thông)";
      } else if (is_dung_phuong) {
        danh_gia = "CÁT (Đúng phương Dịch Mã, hình thế bình hòa)";
      }

      return {
        chi_chu: chi_chu,
        phuong_dich_ma: dich_ma_phuong,
        sa_son: sa_son,
        is_dung_phuong: is_dung_phuong,
        is_hinh_yen_ngua: is_yen_ngua,
        danh_gia: danh_gia
      };
    }
    phan_tich_hinh_the_ma(chi_chu, sa_son, mo_ta) {
      return TamHopEngine.phan_tich_hinh_the_ma(chi_chu, sa_son, mo_ta);
    }

    // =========================================================================
    // MODULE 18: TỔNG HỢP QUY TRÌNH THỰC CHIẾN LÂM SÀNG 6 BƯỚC (BÀI 15 KHÓA 2)
    // =========================================================================
    static quy_trinh_thuc_chien_tong_hop(huong_deg, thuy_khau_deg, can_chu, chi_chu, nam_hien_tai, cac_sa_xung_quanh = null) {
      // Bước 1 & 2: Thủy Pháp
      const thuy_phap = TamHopEngine.evaluate_trach_thuy_phap(huong_deg, thuy_khau_deg);
      const huong_son = thuy_phap.huong_nha.son_name;

      // Bước 3: Tam Sát & Thái Tuế
      const tam_sat_res = TamHopEngine.kiem_tra_tam_sat(nam_hien_tai, huong_son);
      const thai_tue_res = TamHopEngine.kiem_tra_thai_tue_tue_pha(nam_hien_tai, huong_son);

      // Bước 4: Hoàng Tuyền & Bát Sát
      const hoang_tuyen_res = TamHopEngine.kiem_tra_hoang_tuyen(huong_son, thuy_phap.thuy_khau.son_name);
      const bat_sat_res = TamHopEngine.kiem_tra_bat_sat_cung(huong_son, thuy_phap.thuy_khau.son_name);

      // Bước 5: 120 Phân Kim
      const phan_kim = TamHopEngine.get_120_phan_kim(huong_deg);

      // Bước 6: Tam Cát Thần Trợ
      const tam_cat = TamHopEngine.get_quy_nhan_loc_ma(can_chu, chi_chu);

      const is_hop_cach = phan_kim.duoc_phep_lay && !tam_sat_res.pham_tam_sat && !thai_tue_res.pham_tue_pha;
      const ket_luan = is_hop_cach
        ? "Hợp cách phong thủy Tam Hợp Phái"
        : "Cần tinh chỉnh độ số phân kim hoặc phương án cửa cổng để hạn chế sát khí.";

      return {
        buoc_1_thuy_phap: thuy_phap,
        buoc_2_tam_sat: tam_sat_res,
        buoc_3_thai_tue: thai_tue_res,
        buoc_4_hoang_tuyen: hoang_tuyen_res,
        buoc_4b_bat_sat: bat_sat_res,
        buoc_5_phan_kim_120: phan_kim,
        buoc_6_tam_cat: tam_cat,
        ket_luan_tong_the: ket_luan
      };
    }
    quy_trinh_thuc_chien_tong_hop(huong_deg, thuy_khau_deg, can_chu, chi_chu, nam_hien_tai, cac_sa_xung_quanh = null) {
      return TamHopEngine.quy_trinh_thuc_chien_tong_hop(huong_deg, thuy_khau_deg, can_chu, chi_chu, nam_hien_tai, cac_sa_xung_quanh);
    }

    // =========================================================================
    // CÁC HÀM TIỆN ÍCH & API KIỂM ĐỊNH MỞ RỘNG
    // =========================================================================
    static kiem_tra_hoang_tuyen(huong_son, thuy_khau_son) {
      const huong = String(huong_son).trim();
      const thuy = String(thuy_khau_son).trim();

      const target = HOANG_TUYEN_MAP[huong];
      if (target && typeof target === "string" && target === thuy) {
        return {
          pham_sat: true,
          loai_sat: "SÁT NHÂN HOÀNG TUYỀN (Đại Hung)",
          mo_ta: `Hướng ${huong} mà Thủy Khẩu tại ${thuy} phạm Sát Nhân Hoàng Tuyền, làm suy thoái quan lộc, hao tổn nhân đinh.`
        };
      }

      if (target && Array.isArray(target) && target.includes(thuy)) {
        return {
          pham_sat: true,
          loai_sat: "CỨU BẦN HOÀNG TUYỀN (Đại Cát)",
          mo_ta: `Hướng ${huong} mà Thủy Khẩu thoát tại ${thuy} đắc cách Cứu Bần Hoàng Tuyền, tiêu thủy đúng pháp sinh tài phát lộc.`
        };
      }

      return {
        pham_sat: false,
        loai_sat: "KHÔNG PHẠM",
        mo_ta: `Hướng ${huong} và Thủy Khẩu ${thuy} an toàn, không phạm Hoàng Tuyền Sát.`
      };
    }
    kiem_tra_hoang_tuyen(huong_son, thuy_khau_son) {
      return TamHopEngine.kiem_tra_hoang_tuyen(huong_son, thuy_khau_son);
    }

    static kiem_tra_tam_sat(chi_nam_hoac_cuc, huong_nha_son) {
      const chi = String(chi_nam_hoac_cuc).trim();
      const huong = String(huong_nha_son).trim();

      const sat_info = TAM_SAT[chi];
      if (!sat_info) {
        return { pham_sat: false, mo_ta: "Chi không hợp lệ" };
      }

      const pham = sat_info.chi_sat.includes(huong);
      return {
        chi_nam_cuc: chi,
        huong_nha: huong,
        tam_sat_phuong: sat_info.tam_sat,
        cac_son_sat: sat_info.chi_sat,
        pham_tam_sat: pham,
        danh_gia: pham ? "ĐẠI HUNG (Hướng phạm Tam Sát)" : "BÌNH (Không phạm Tam Sát)"
      };
    }
    kiem_tra_tam_sat(chi_nam_hoac_cuc, huong_nha_son) {
      return TamHopEngine.kiem_tra_tam_sat(chi_nam_hoac_cuc, huong_nha_son);
    }

    static get_son_degree_range(son_name, ban = "dia_ban") {
      const found = SON_24.find(item => item.name === son_name);
      if (!found) return null;
      let offset = 0.0;
      if (ban === "thien_ban") offset = 7.5;
      else if (ban === "nhan_ban") offset = -7.5;

      const raw_start = normalizeDeg(found.deg_start + offset);
      const raw_end = normalizeDeg(found.deg_end + offset);
      let center = 0.0;
      if (found.name === "Tý") {
        center = normalizeDeg(offset);
      } else {
        center = normalizeDeg(((found.deg_start + found.deg_end) / 2) + offset);
      }

      return {
        son_name: son_name,
        ban: ban,
        cung_bat_quai: found.cung_bat_quai,
        deg_start: raw_start,
        deg_end: raw_end,
        deg_center: center,
        deg_range_str: `${raw_start.toFixed(1)}° - ${raw_end.toFixed(1)}° (Tâm ${center.toFixed(1)}°)`
      };
    }
    get_son_degree_range(son_name, ban = "dia_ban") {
      return TamHopEngine.get_son_degree_range(son_name, ban);
    }

    static get_chi_tiet_hoang_tuyen(huong_son) {
      const huong = String(huong_son).trim();
      const target = HOANG_TUYEN_MAP[huong];
      let danh_sach_sat = [];
      if (typeof target === "string") {
        danh_sach_sat = [target];
      } else if (Array.isArray(target)) {
        danh_sach_sat = target;
      }

      const chi_tiet_son = danh_sach_sat.map(s => {
        const diaRange = TamHopEngine.get_son_degree_range(s, "dia_ban");
        const thienRange = TamHopEngine.get_son_degree_range(s, "thien_ban");
        return {
          son: s,
          cung: diaRange ? diaRange.cung_bat_quai : "",
          deg_range_dia_ban: diaRange ? diaRange.deg_range_str : "",
          deg_range_thien_ban: thienRange ? thienRange.deg_range_str : "",
          deg_range: thienRange ? `${thienRange.deg_start.toFixed(1)}° - ${thienRange.deg_end.toFixed(1)}°` : "",
          deg_center: thienRange ? thienRange.deg_center : 0
        };
      });

      return {
        huong_nha: huong,
        danh_sach_son: chi_tiet_son,
        canh_bao_khu_thuy: "Kỵ khứ thủy (cấm đào cống ngầm, rãnh thoát nước, hố ga chảy ra các phương này theo THIÊN BÀN PHÙNG CHÂM)",
        canh_bao_cua_cong: "Kỵ mở cổng phụ, cửa ngõ đón dòng nước xiết hoặc xung chiếu tại phương vị Hoàng Tuyền theo ĐỊA BÀN CHÍNH CHÂM",
        khuyen_nghi: "Nếu nước chảy xiết thoát đi tại đây phạm 'Sát Nhân Hoàng Tuyền' (đoạt mạng, phá tài). Cần di dời vị trí xả nước hoặc dịch chuyển cổng/cửa sang cung vị Cát."
      };
    }
    get_chi_tiet_hoang_tuyen(huong_son) {
      return TamHopEngine.get_chi_tiet_hoang_tuyen(huong_son);
    }

    static get_chi_tiet_bat_sat(toa_son) {
      toa_son = String(toa_son).trim();
      let quai_toa = null;
      for (let i = 0; i < SON_24.length; i++) {
        if (SON_24[i].name === toa_son) {
          quai_toa = SON_24[i].cung_bat_quai;
          break;
        }
      }
      if (!quai_toa || !BAT_SAT_CUNG[quai_toa]) return null;
      const sat_info = BAT_SAT_CUNG[quai_toa];
      const chi_sat = sat_info.chi_sat;
      const diaRange = TamHopEngine.get_son_degree_range(chi_sat, "dia_ban");
      const nhanRange = TamHopEngine.get_son_degree_range(chi_sat, "nhan_ban");
      const thienRange = TamHopEngine.get_son_degree_range(chi_sat, "thien_ban");

      return {
        toa_son: toa_son,
        quai_toa: quai_toa,
        chi_sat: chi_sat,
        cung_sat: diaRange ? diaRange.cung_bat_quai : "",
        deg_range_dia_ban: diaRange ? diaRange.deg_range_str : "",
        deg_range_nhan_ban: nhanRange ? nhanRange.deg_range_str : "",
        deg_range_thien_ban: thienRange ? thienRange.deg_range_str : "",
        deg_range: diaRange ? `${diaRange.deg_start.toFixed(1)}° - ${diaRange.deg_end.toFixed(1)}°` : "",
        deg_center: diaRange ? diaRange.deg_center : 0,
        con_vat: sat_info.con_vat,
        canh_bao_cua_cong: `TUYỆT ĐỐI CẤM mở cửa chính, cửa phụ, trổ cổng, mở ngõ đi tại Sơn ${chi_sat} (Đo theo Địa Bàn: ${diaRange ? diaRange.deg_range_str : ""})`,
        canh_bao_thuy: `Cấm đón nước đến (Lai Thủy), đào giếng khoan, đặt bồn nước ngầm/bể phốt tại phương ${chi_sat} (Lai Thủy đo Thiên Bàn: ${thienRange ? thienRange.deg_range_str : ""}; Bể phốt trạch trù đo Địa Bàn: ${diaRange ? diaRange.deg_range_str : ""})`,
        canh_bao_ngoai_canh: `Kỵ góc nhọn, tháp cao, cột điện, góc đình chùa xung chiếu từ phương ${chi_sat} (Đo theo Nhân Bàn Trung Châm: ${nhanRange ? nhanRange.deg_range_str : ""}, chủ tổn đinh, bệnh nan y, tai họa bất ngờ).`
      };
    }
    get_chi_tiet_bat_sat(toa_son) {
      return TamHopEngine.get_chi_tiet_bat_sat(toa_son);
    }

    static get_chi_tiet_tam_sat(chi_nam) {
      const chi = String(chi_nam).trim();
      const sat_info = TAM_SAT[chi];
      if (!sat_info) return null;

      const phuong = sat_info.tam_sat;
      const cac_son = sat_info.chi_sat;
      const TEN_TAM_SAT = ["Kiếp Sát", "Tai Sát", "Tuế Sát"];

      const chi_tiet = cac_son.map((s, idx) => {
        const found = SON_24.find(item => item.name === s);
        return {
          loai_sat: TEN_TAM_SAT[idx],
          son: s,
          cung: found ? found.cung_bat_quai : "",
          deg_range: found ? `${found.deg_start}° - ${found.deg_end}°` : "",
          deg_center: found ? ((found.deg_start + found.deg_end) / 2) : 0
        };
      });

      let dai_do = "";
      if (phuong === "Bắc") dai_do = "315° - 45° (Hợi - Tý - Sửu)";
      else if (phuong === "Nam") dai_do = "135° - 225° (Tỵ - Ngọ - Mùi)";
      else if (phuong === "Đông") dai_do = "45° - 135° (Dần - Mão - Thìn)";
      else if (phuong === "Tây") dai_do = "225° - 315° (Thân - Dậu - Tuất)";

      return {
        nam_chi: chi,
        phuong_tam_sat: phuong,
        dai_do_so: dai_do,
        cac_son: chi_tiet,
        canh_bao_dong_tho: `CẤM ĐỘNG THỔ / SỬA CHỮA: Tuyệt đối không đào móng, đập phá, khoan tường, cơi nới ở phương ${phuong} trong năm ${chi}`,
        canh_bao_huong_nha_cua: `NGUYÊN TẮC 'TỌA ĐƯỢC NHƯNG HƯỚNG CẤM': Nhà được phép tọa ${phuong}, nhưng CẤM mở Cửa chính, Cửa phụ, Cổng ngõ nhìn về phương ${phuong}`,
        khuyen_nghi: `Nếu cửa/cổng hiện hữu nhìn về hướng Tam Sát (${dai_do}), trong năm ${chi} nên hạn chế đi lại cửa này, sử dụng cửa ngách hoặc treo gương Bát Quái / vật phẩm ngũ hành hóa giải.`
      };
    }
    get_chi_tiet_tam_sat(chi_nam) {
      return TamHopEngine.get_chi_tiet_tam_sat(chi_nam);
    }

    static get_quy_nhan_loc_ma(can_chu, chi_chu) {
      const can_clean = String(can_chu).trim();
      const chi_clean = String(chi_chu).trim();

      const qn_info = THIEN_AT_QUY_NHAN[can_clean] || { duong_quy: "Chưa rõ", am_quy: "Chưa rõ" };
      const loc_info = THIEN_LOC[can_clean] || "Chưa rõ";
      const ma_info = DICH_MA[chi_clean] || "Chưa rõ";

      return {
        can_gia_chu: can_clean,
        chi_gia_chu: chi_clean,
        duong_quy_nhan: qn_info.duong_quy,
        am_quy_nhan: qn_info.am_quy,
        thien_loc: loc_info,
        dich_ma: ma_info,
        khuyen_nghi_kich_hoat: `Mở cổng/cửa hoặc đặt bàn làm việc nhìn về ${qn_info.duong_quy} (Quý Nhân), đặt két sắt tại ${loc_info} (Thiên Lộc), đặt tượng ngựa/phòng giao dịch tại ${ma_info} (Dịch Mã).`
      };
    }
    get_quy_nhan_loc_ma(can_chu, chi_chu) {
      return TamHopEngine.get_quy_nhan_loc_ma(can_chu, chi_chu);
    }
    static tinh_tam_cat(can_chu, chi_chu) {
      return TamHopEngine.get_quy_nhan_loc_ma(can_chu, chi_chu);
    }
    tinh_tam_cat(can_chu, chi_chu) {
      return TamHopEngine.get_quy_nhan_loc_ma(can_chu, chi_chu);
    }

    static get_120_phan_kim(deg) {
      deg = normalizeDeg(deg);
      const son_info = TamHopEngine.get_son_from_degree(deg, "dia_ban");
      let rel_deg = 0.0;
      if (son_info.son_name === "Tý") {
        rel_deg = normalizeDeg(deg - 352.5);
      } else {
        let matched = null;
        for (let i = 0; i < SON_24.length; i++) {
          if (SON_24[i].name === son_info.son_name) {
            matched = SON_24[i];
            break;
          }
        }
        rel_deg = deg - matched.deg_start;
      }

      const pk_index = Math.floor(rel_deg / 3.0) + 1; // 1 to 5
      const pk_names = [
        "Giáp/Ất (Phân Kim 1)",
        "Bính/Đinh (Phân Kim 2)",
        "Mậu/Kỷ (Phân Kim 3)",
        "Canh/Tân (Phân Kim 4)",
        "Nhâm/Quý (Phân Kim 5)"
      ];

      let tinh_chat = "";
      let is_good = false;
      if (pk_index === 2 || pk_index === 4) {
        tinh_chat = "TUYẾN CHÂU BẢO (Vượng Tướng - Đại Cát)";
        is_good = true;
      } else if (pk_index === 3) {
        tinh_chat = "QUY SÁT / KHÔNG VONG (Đại Hung - Tránh dùng)";
        is_good = false;
      } else {
        tinh_chat = "CÔ HƯ (Khí Suy - Không Nên Lấy)";
        is_good = false;
      }

      return {
        degree: deg,
        son_name: son_info.son_name,
        phan_kim_index: pk_index,
        phan_kim_type: pk_names[Math.min(pk_index - 1, 4)],
        tinh_chat: tinh_chat,
        duoc_phep_lay: is_good
      };
    }
    get_120_phan_kim(deg) {
      return TamHopEngine.get_120_phan_kim(deg);
    }
    static kiem_tra_120_phan_kim(deg) {
      return TamHopEngine.get_120_phan_kim(deg);
    }
    kiem_tra_120_phan_kim(deg) {
      return TamHopEngine.get_120_phan_kim(deg);
    }
  }

  // Đăng ký toàn cục và Module Exports
  const engineInstance = new TamHopEngine();
  global.TamHopEngine = TamHopEngine;
  global.tamHopEngine = engineInstance;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TamHopEngine;
  }
})(typeof window !== "undefined" ? window : globalThis);
