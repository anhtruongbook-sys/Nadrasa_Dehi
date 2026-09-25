const fs = require('fs');
const code = fs.readFileSync('engines/lakinh_engine.js', 'utf8');
const window = {};
eval(code);
const eng = window.NetaLaKinhEngine;

console.log('Testing 12 Song Son mappings on Thien Ban Phung Cham:');
const testAngles = [
  { brg: 0, expSon: 'Tý', expSongSon: 'Nhâm - Tý', expCuc: 'Hỏa Cục', expCung: 'Cung Thai' },
  { brg: 30, expSon: 'Sửu', expSongSon: 'Quý - Sửu', expCuc: 'Kim Cục', expCung: 'Cung Mộ' },
  { brg: 60, expSon: 'Dần', expSongSon: 'Cấn - Dần', expCuc: 'Kim Cục', expCung: 'Cung Tuyệt' },
  { brg: 90, expSon: 'Mão', expSongSon: 'Giáp - Mão', expCuc: 'Kim Cục', expCung: 'Cung Thai' },
  { brg: 120, expSon: 'Thìn', expSongSon: 'Ất - Thìn', expCuc: 'Thủy Cục', expCung: 'Cung Mộ' },
  { brg: 150, expSon: 'Tỵ', expSongSon: 'Tốn - Tỵ', expCuc: 'Thủy Cục', expCung: 'Cung Tuyệt' },
  { brg: 180, expSon: 'Ngọ', expSongSon: 'Bính - Ngọ', expCuc: 'Thủy Cục', expCung: 'Cung Thai' },
  { brg: 210, expSon: 'Mùi', expSongSon: 'Đinh - Mùi', expCuc: 'Mộc Cục', expCung: 'Cung Mộ' },
  { brg: 240, expSon: 'Thân', expSongSon: 'Khôn - Thân', expCuc: 'Mộc Cục', expCung: 'Cung Tuyệt' },
  { brg: 270, expSon: 'Dậu', expSongSon: 'Canh - Dậu', expCuc: 'Mộc Cục', expCung: 'Cung Thai' },
  { brg: 300, expSon: 'Tuất', expSongSon: 'Tân - Tuất', expCuc: 'Hỏa Cục', expCung: 'Cung Mộ' },
  { brg: 330, expSon: 'Hợi', expSongSon: 'Càn - Hợi', expCuc: 'Hỏa Cục', expCung: 'Cung Tuyệt' },
  { brg: 350, expSon: 'Nhâm', expSongSon: 'Nhâm - Tý', expCuc: 'Hỏa Cục', expCung: 'Cung Thai' }
];

let allPassed = true;
testAngles.forEach(t => {
  const tb = eng.getThienBanSon(t.brg);
  const analysis = eng.analyzeThuyKhauDinhCuc(tb, t.brg, 21.0, 105.8, 15, -2);
  const ok = tb.name === t.expSon && tb.songSon === t.expSongSon && analysis.cuc === t.expCuc && analysis.viTriTruongSinh.includes(t.expCung);
  console.log(`Brg ${t.brg}° -> Son: ${tb.name} (${tb.songSon}), Cuc: ${analysis.cuc}, Cung: ${analysis.viTriTruongSinh.split(' ')[0]} ${analysis.viTriTruongSinh.split(' ')[1]} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) allPassed = false;
});

console.log('Result:', allPassed ? 'ALL TESTS PASSED 100%' : 'SOME TESTS FAILED');
process.exit(allPassed ? 0 : 1);
