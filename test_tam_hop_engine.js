/**
 * TEST RUNNER FOR TAM HOP PHONG THUY ENGINE (JAVASCRIPT)
 * Mirrors test_tam_hop_engine.py and cross_check_benchmark.py
 */

const TamHopEngine = require('./engines/tam_hop_engine.js');
const assert = require('assert');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
    throw err;
  }
}

console.log("================================================================================");
console.log("  CHẠY BỘ KIỂM THỬ TỰ ĐỘNG TOÀN DIỆN TAM HOP ENGINE (JAVASCRIPT PARITY)");
console.log("================================================================================");

const engine = new TamHopEngine();

// Test 1: Tam Bàn La Kinh
runTest("Test 01: Tam Bàn La Kinh", () => {
  const pos_dia = engine.get_son_from_degree(0.0, "dia_ban");
  assert.strictEqual(pos_dia.son_name, "Tý");

  const pos_thien = engine.get_son_from_degree(352.5, "thien_ban");
  assert.strictEqual(pos_thien.son_name, "Tý");

  const pos_nhan = engine.get_son_from_degree(7.5, "nhan_ban");
  assert.strictEqual(pos_nhan.son_name, "Tý");
});

// Test 2: Tứ Đại Cục Thủy Khẩu
runTest("Test 02: Tứ Đại Cục Thủy Khẩu", () => {
  assert.strictEqual(engine.dinh_cuc_thuy_khau("Thìn").cuc_name, "Thủy Cục");
  assert.strictEqual(engine.dinh_cuc_thuy_khau("Tuất").cuc_name, "Hỏa Cục");
  assert.strictEqual(engine.dinh_cuc_thuy_khau("Sửu").cuc_name, "Kim Cục");
  assert.strictEqual(engine.dinh_cuc_thuy_khau("Mùi").cuc_name, "Mộc Cục");
});

// Test 3: Vòng Trường Sinh
runTest("Test 03: Vòng Trường Sinh", () => {
  const cs_thuy = engine.an_vong_truong_sinh("Thủy Cục", "thuan");
  assert.strictEqual(cs_thuy["Khôn Thân"], "Trường Sinh");
  assert.strictEqual(cs_thuy["Nhâm Tý"], "Đế Vượng");
  assert.strictEqual(cs_thuy["Ất Thìn"], "Mộ");
});

// Test 4: Lai Khứ Thủy Xung Phá
runTest("Test 04: Lai Khứ Thủy Xung Phá", () => {
  const res = engine.evaluate_lai_khu_thuy("Thủy Cục", "Khôn Thân", "Càn Hợi");
  assert.strictEqual(res.lai_thuy_danh_gia, "Cát");
  assert.strictEqual(res.khu_thuy_danh_gia, "ĐẠI HUNG");
  assert.ok(res.xung_pha_canh_bao.some(x => x.includes("XUNG PHÁ LÂM QUAN")));
});

// Test 5: Bát Sát Tiêu Vong
runTest("Test 05: Bát Sát Tiêu Vong", () => {
  const sat_kham = engine.kiem_tra_bat_sat_cung("Tý", "Thìn");
  assert.strictEqual(sat_kham.pham_bat_sat, true);
  assert.strictEqual(sat_kham.chi_sat_ky, "Thìn");

  const sat_can = engine.kiem_tra_bat_sat_cung("Càn", "Ngọ");
  assert.strictEqual(sat_can.pham_bat_sat, true);

  const an_toan = engine.kiem_tra_bat_sat_cung("Càn", "Tý");
  assert.strictEqual(an_toan.pham_bat_sat, false);
});

// Test 6: Nạp Giáp Bát Quái
runTest("Test 06: Nạp Giáp Bát Quái", () => {
  assert.strictEqual(engine.nap_giap_bat_quai("Giáp").quai_nap_giap, "Càn");
  assert.strictEqual(engine.nap_giap_bat_quai("Ất").quai_nap_giap, "Khôn");
  assert.strictEqual(engine.nap_giap_bat_quai("Bính").quai_nap_giap, "Cấn");
});

// Test 7: Thôi Quan Thủy Pháp
runTest("Test 07: Thôi Quan Thủy Pháp", () => {
  const res = engine.thoi_quan_thuy_phap("Thủy Cục", "Tý");
  assert.strictEqual(res.phuong_lam_quan, "Càn Hợi");
  assert.ok(res.phuong_phap_kich_hoat.includes("Lâm Quan"));
});

// Test 8: Bổ Long
runTest("Test 08: Bổ Long", () => {
  const res = engine.kiem_tra_bo_long("Tý", "Dậu");
  assert.ok(res.danh_gia.includes("Long Sinh Tọa"));
});

// Test 9: Tam Sát & Thái Tuế
runTest("Test 09: Tam Sát & Thái Tuế", () => {
  assert.strictEqual(engine.kiem_tra_tam_sat("Tý", "Ngọ").pham_tam_sat, true);
  assert.strictEqual(engine.kiem_tra_tam_sat("Tý", "Tý").pham_tam_sat, false);

  const tt_res = engine.kiem_tra_thai_tue_tue_pha("Tý", "Ngọ");
  assert.strictEqual(tt_res.pham_tue_pha, true);
  assert.ok(tt_res.danh_gia.includes("Tuế Phá"));
});

// Test 10: 72 Xuyên Sơn Long
runTest("Test 10: 72 Xuyên Sơn Long", () => {
  const long_0 = engine.get_72_xuyen_son_long(0.0);
  assert.strictEqual(long_0.is_quy_giap_khong_vong, true);

  const long_15 = engine.get_72_xuyen_son_long(15.0);
  assert.strictEqual(long_15.is_quy_giap_khong_vong, false);
});

// Test 11: Lại Công Ngũ Hành
runTest("Test 11: Lại Công Ngũ Hành", () => {
  assert.strictEqual(engine.lai_cong_ngu_hanh("Càn").lai_cong_ngu_hanh, "Mộc");
  assert.strictEqual(engine.lai_cong_ngu_hanh("Tý").lai_cong_ngu_hanh, "Kim");
  assert.strictEqual(engine.lai_cong_ngu_hanh("Bính").lai_cong_ngu_hanh, "Hỏa");
});

// Test 12: Tiêu Sa Ngũ Hành
runTest("Test 12: Tiêu Sa Ngũ Hành", () => {
  const sa_tron = engine.phan_loai_hinh_the_sa("ngọn đồi tròn bát úp");
  assert.strictEqual(sa_tron.loai_sa, "Kim Sa");

  const sa_nhon = engine.phan_loai_hinh_the_sa("tháp truyền hình nhọn hoắt");
  assert.strictEqual(sa_nhon.loai_sa, "Hỏa Sa");

  const res_sinh = engine.tieu_sa_ngu_hanh("Kim", "Thổ");
  assert.strictEqual(res_sinh.phan_loai_sa, "Sinh Sa");

  const res_sat = engine.tieu_sa_ngu_hanh("Mộc", "Kim");
  assert.strictEqual(res_sat.phan_loai_sa, "Sát Sa");
});

// Test 13: Tam Cát & Dịch Mã thực tế
runTest("Test 13: Tam Cát & Dịch Mã thực tế", () => {
  const ma_hinh_the = engine.phan_tich_hinh_the_ma("Tý", "Dần", "ngọn đồi hình yên ngựa thoai thoải");
  assert.strictEqual(ma_hinh_the.is_dung_phuong, true);
  assert.strictEqual(ma_hinh_the.is_hinh_yen_ngua, true);
  assert.ok(ma_hinh_the.danh_gia.toUpperCase().includes("ĐẮC CÁCH"));
});

// Test 14: Quy trình thực chiến tổng hợp
runTest("Test 14: Quy trình thực chiến tổng hợp", () => {
  const res = engine.quy_trinh_thuc_chien_tong_hop(0.0, 115.0, "Giáp", "Tý", "Thìn");
  assert.ok("buoc_1_thuy_phap" in res);
  assert.ok("buoc_2_tam_sat" in res);
  assert.ok("buoc_3_thai_tue" in res);
  assert.ok("buoc_4_hoang_tuyen" in res);
  assert.ok("buoc_5_phan_kim_120" in res);
  assert.ok("buoc_6_tam_cat" in res);
  assert.ok(res.ket_luan_tong_the !== null && res.ket_luan_tong_the !== undefined);
});

console.log("\n================================================================================");
console.log("  CHẠY BỘ ĐỐI CHIẾU & KIỂM CHỨNG CHÉO QUỐC TẾ (BENCHMARKS)");
console.log("================================================================================");

// Benchmark Ca 1
runTest("Benchmark Ca 1: Thủy Cục - Chính Vượng Hướng (Tân Nhâm hội tụ Thìn)", () => {
  const res = TamHopEngine.evaluate_trach_thuy_phap(0.0, 115.0);
  assert.strictEqual(res.cuc_name, "Thủy Cục");
  assert.ok(res.the_cuc.includes("CHÍNH VƯỢNG HƯỚNG"));
});

// Benchmark Ca 2
runTest("Benchmark Ca 2: Sát Nhân Hoàng Tuyền (Canh Đinh Khôn)", () => {
  const huong_info = TamHopEngine.get_son_from_degree(195.0, "dia_ban");
  const thuy_info = TamHopEngine.get_son_from_degree(220.0, "thien_ban");
  const res_ht = TamHopEngine.kiem_tra_hoang_tuyen(huong_info.son_name, thuy_info.son_name);
  assert.ok(res_ht.loai_sat.includes("SÁT NHÂN HOÀNG TUYỀN"));
});

// Benchmark Ca 3
runTest("Benchmark Ca 3: Cứu Bần Hoàng Tuyền (Khôn hướng xuất Canh Đinh)", () => {
  const huong_info = TamHopEngine.get_son_from_degree(225.0, "dia_ban");
  const thuy_info = TamHopEngine.get_son_from_degree(190.0, "thien_ban");
  const res_ht = TamHopEngine.kiem_tra_hoang_tuyen(huong_info.son_name, thuy_info.son_name);
  assert.ok(res_ht.loai_sat.includes("CỨU BẦN HOÀNG TUYỀN"));
});

// Benchmark Ca 4
runTest("Benchmark Ca 4: Bát Sát Tiêu Vong (Khảm Long)", () => {
  const sat_res = TamHopEngine.kiem_tra_bat_sat_cung("Tý", "Thìn");
  assert.strictEqual(sat_res.pham_bat_sat, true);
});

// Benchmark Ca 5
runTest("Benchmark Ca 5: 120 Phân Kim Châu Bảo vs Không Vong", () => {
  const pk_cb = TamHopEngine.get_120_phan_kim(356.5);
  const pk_kv = TamHopEngine.get_120_phan_kim(359.0);
  assert.strictEqual(pk_cb.duoc_phep_lay, true);
  assert.strictEqual(pk_kv.duoc_phep_lay, false);
});

console.log("\n================================================================================");
console.log(`TỔNG KẾT KIỂM THỬ JAVASCRIPT: ${passedTests}/${totalTests} TESTS ĐẠT 100% HOÀN HẢO!`);
console.log("================================================================================");
