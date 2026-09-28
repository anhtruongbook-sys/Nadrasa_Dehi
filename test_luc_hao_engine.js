/**
 * test_luc_hao_engine.js
 * Kiểm thử tự động Động cơ Lục Hào JavaScript thuần
 * Đối chiếu chéo 100% với test_luc_hao_engine.py và phương pháp Thầy Nguyễn Tuấn Cường
 */

const LucHaoEngine = require('./engines/luc_hao_engine.js');
const assert = require('assert');

console.log("=== BẮT ĐẦU KIỂM THỬ ĐỘNG CƠ LỤC HÀO JAVASCRIPT THUẦN ===");

// TEST 1: Quẻ Thuần Càn
console.log("\n[TEST 1] Kiểm tra Quẻ Thuần Càn (Bát Cung, Thế Ứng, Lục Thân)");
const eCan = new LucHaoEngine.HexagramEngine(1, 1, [], "Giáp", "Tý", "Thân", "Tý");
assert.strictEqual(eCan.hexName, "Thuần Càn", "Tên quẻ phải là Thuần Càn");
assert.strictEqual(eCan.palaceName, "Càn", "Bát cung phải là Càn");
assert.strictEqual(eCan.palaceElement, "Kim", "Ngũ hành cung phải là Kim");
assert.strictEqual(eCan.theIdx, 6, "Hào Thế của quẻ Bát Thuần phải ở hào 6");
assert.strictEqual(eCan.ungIdx, 3, "Hào Ứng của quẻ Bát Thuần phải ở hào 3");
assert.strictEqual(eCan.isBatThuan, true, "Phải là quẻ Bát Thuần");
assert.strictEqual(eCan.isLucXung, true, "Thuần Càn phải là quẻ Lục Xung");
console.log("-> TEST 1 PASSED: Quẻ Thuần Càn chuẩn 100%!");

// TEST 2: Quẻ Hỏa Thủy Vị Tế (Bài 1 Ca 1)
console.log("\n[TEST 2] Kiểm tra Quẻ Hỏa Thủy Vị Tế (Động Hào 2)");
const eViTe = new LucHaoEngine.HexagramEngine(3, 6, [2], "Ất", "Mão", "Hợi", "Tý");
assert.strictEqual(eViTe.hexName, "Hỏa Thủy Vị Tế");
assert.strictEqual(eViTe.palaceName, "Ly");
assert.strictEqual(eViTe.theIdx, 3);
assert.strictEqual(eViTe.ungIdx, 6);
assert.strictEqual(eViTe.bienHexName, "Hỏa Địa Tấn");
const h2 = eViTe.haos[1]; // Hào 2
assert.strictEqual(h2.isDong, true);
assert.strictEqual(h2.branch, "Thìn");
assert.strictEqual(h2.lucThan, "Tử Tôn");
assert.strictEqual(h2.bienBranch, "Tỵ");
assert.strictEqual(h2.hoaType, "Hóa Hồi Đầu Sinh");
console.log("-> TEST 2 PASSED: Quẻ Hỏa Thủy Vị Tế chuẩn 100%!");

// TEST 3: Quẻ Thiên Lôi Vô Vọng (Bài 7 & 8 Ca 2)
console.log("\n[TEST 3] Kiểm tra Quẻ Thiên Lôi Vô Vọng & Quy trình 8 bước Cầu Tài");
const eVoVong = new LucHaoEngine.HexagramEngine(1, 4, [4], "Ất", "Mùi", "Tỵ", "Ngọ");
assert.strictEqual(eVoVong.hexName, "Thiên Lôi Vô Vọng");
assert.strictEqual(eVoVong.palaceName, "Tốn");
assert.strictEqual(eVoVong.theIdx, 4);
assert.strictEqual(eVoVong.ungIdx, 1);
assert.strictEqual(eVoVong.bienHexName, "Phong Lôi Ích");

const res8 = eVoVong.evaluate8Steps("Cầu tài");
assert.strictEqual(res8.step_1_dung_than.name, "Thê Tài");
assert.strictEqual(res8.step_1_dung_than.chosen_hao, 3, "Dụng thần lưỡng hiện phải chọn hào 3");
assert.strictEqual(res8.step_6_ket_luan.is_success, true, "Cầu tài quẻ Vô Vọng động hào 4 phải THÀNH CÔNG");
console.log("-> TEST 3 PASSED: Quy trình 8 bước nhị phân giải quẻ chính xác 100%!");

// TEST 4: Khảo sát Phong thủy Gia trạch 6 Hào
console.log("\n[TEST 4] Kiểm tra Phân hệ Khảo sát Phong Thủy Gia Trạch 6 Hào");
const fengshui = eVoVong.analyzeFengshui6Haos();
assert.strictEqual(fengshui.detailed_levels.length, 6, "Phải có đủ 6 bậc hào không gian");
assert.strictEqual(fengshui.detailed_levels[0].spatial_area.includes("Nền móng"), true);
assert.strictEqual(fengshui.detailed_levels[5].spatial_area.includes("Mái nhà"), true);
console.log("-> TEST 4 PASSED: Khảo sát 6 bậc hào phong thủy hoạt động hoàn hảo!");

// TEST 5: Bộ Sinh Báo Cáo Luận Giải Tự Nhiên
console.log("\n[TEST 5] Kiểm tra Bộ sinh Báo Cáo Tự Nhiên (Rule-Based NLG)");
const fullReading = LucHaoEngine.RuleBasedReportGenerator.generateFullReading(eVoVong, "Cầu tài", "Tôi muốn đầu tư vào dự án mới có thuận lợi không?");
assert.strictEqual(fullReading.includes("BẢN LUẬN GIẢI KINH DỊCH LỤC HÀO CHUYÊN SÂU"), true);
assert.strictEqual(fullReading.includes("THÀNH CÔNG"), true);
assert.strictEqual(fullReading.includes("KHẢO SÁT TRƯỜNG KHÍ PHONG THỦY GIA TRẠCH"), true);
console.log("-> TEST 5 PASSED: Báo cáo văn bản tự nhiên sinh ra hoàn chỉnh!");

// TEST 6: Các phương thức lập quẻ
console.log("\n[TEST 6] Kiểm tra Lập Quẻ Đa Thức (Giờ động tâm, Đồng xu, Số seri)");
const cDongTam = LucHaoEngine.castByDongTamHour("Tý", 10, 15, "Ngọ");
assert.strictEqual(typeof cDongTam.upper, "number");
assert.strictEqual(typeof cDongTam.lower, "number");
assert.strictEqual(cDongTam.dongHaos.length, 1);

const cCoins = LucHaoEngine.castByCoins([1, 2, 3, 0, 1, 2]);
assert.strictEqual(typeof cCoins.upper, "number");
assert.strictEqual(cCoins.dongHaos.includes(3), true);
assert.strictEqual(cCoins.dongHaos.includes(4), true);

const cSerial = LucHaoEngine.castBySerial("987654321");
assert.strictEqual(typeof cSerial.upper, "number");
console.log("-> TEST 6 PASSED: Đa phương thức lập quẻ hoạt động chuẩn xác!");

console.log("\n============================================================");
console.log("TẤT CẢ 6 BÀI KIỂM THỬ ĐỘNG CƠ LỤC HÀO JAVASCRIPT ĐÃ THÀNH CÔNG 100%!");
console.log("============================================================\n");
