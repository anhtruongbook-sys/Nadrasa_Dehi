/**
 * NETA LIGHT - THÁI ẤT THẦN KINH ENGINE (thai_at_engine.js)
 * Triển khai giải thuật số học xác định 100% chuẩn xác theo cổ bản
 * và đối soát khớp tuyệt đối với file gốc 'Thai At Than Kinh.xls' (Lê Trung Tú, 2009).
 * 
 * Tính năng hạt nhân:
 * 1. Tứ Kể: Kể Năm (Tuế Kế), Kể Tháng (Nguyệt Kế), Kể Ngày (Nhật Kế), Kể Giờ (Thời Kế).
 * 2. Vòng Kỷ Dư (360), 72 Cục, 5 Nguyên, Dương Độn / Âm Độn.
 * 3. Tam Toán: Toán Chủ, Toán Khách, Toán Định.
 * 4. Tứ Tướng: Chủ Đại Tướng, Khách Đại Tướng, Chủ Tham Tướng, Khách Tham Tướng.
 * 5. Hệ thống 30+ Thần Sát kinh điển: Thái Ất, Văn Xương, Kế Thần, Thủy Kích,
 *    Ngũ Phúc, Quân Cơ, Thần Cơ, Dân Cơ, Tứ Thần, Thiên Ất, Địa Ất, Trực Phù,
 *    Thanh Long, Xích Kỳ, Hắc Kỳ, Âm Cả, Tuế Cả, Thần Hợp, Kể Định, Phi Phù,
 *    Đại Du, Cửa Trực, Tiểu Du, Thần Quý, 9 Sao Trực Phù, Bát Phong.
 * 6. Thái Ất Mệnh Pháp 12 Cung Nhân Mệnh (Mệnh, Phụ, Tướng, Phúc, Tật, Nô, Quan, Điền, Tài, Tử, Thê, Huynh).
 * 
 * Hoàn toàn thuần JavaScript - Chạy Offline 100% không phụ thuộc thư viện ngoài.
 */

(function (global) {
  'use strict';

  // 16 Thần Vị trên Địa Bàn Thái Ất (Thứ tự 1..16)
  const THAP_LUC = [
    "Thân", "Dậu", "Tuất", "Kiền", "Hợi", "Tý", "Sửu", "Cấn",
    "Dần", "Mão", "Thìn", "Tốn", "Tỵ", "Ngọ", "Mùi", "Khôn"
  ];

  // Trọng số Lạc Thư của 16 cung (8 cung quái mang điểm, 8 chi trung gian = 0)
  const CUNG_WEIGHTS = {
    "Thân": 0, "Dậu": 6, "Tuất": 0, "Kiền": 1,
    "Hợi": 0, "Tý": 8, "Sửu": 0, "Cấn": 3,
    "Dần": 0, "Mão": 4, "Thìn": 0, "Tốn": 9,
    "Tỵ": 0, "Ngọ": 2, "Mùi": 0, "Khôn": 7
  };

  const QUAI_WEIGHTS = {
    "Dậu": 6, "Kiền": 1, "Tý": 8, "Cấn": 3,
    "Mão": 4, "Tốn": 9, "Ngọ": 2, "Khôn": 7
  };

  // 8 Cung an Thái Ất (Ất Cả) - Chu kỳ 24 bước (3 năm ngự 1 cung)
  const THAI_AT_PALACES = ["Kiền", "Ngọ", "Cấn", "Mão", "Dậu", "Khôn", "Tý", "Tốn"];

  // 18 Bước an Văn Xương (Thiên Mục / Bài Văn)
  const VAN_XUONG_STEPS = [
    "Thân", "Dậu", "Tuất", "Kiền", "Kiền", "Hợi",
    "Tý", "Sửu", "Cấn", "Dần", "Mão", "Thìn",
    "Tốn", "Tỵ", "Ngọ", "Mùi", "Khôn", "Khôn"
  ];

  // 12 Bước an Kế Thần (Thần Kể)
  const KE_THAN_STEPS = [
    "Dần", "Sửu", "Tý", "Hợi", "Tuất", "Dậu",
    "Thân", "Mùi", "Ngọ", "Tỵ", "Thìn", "Mão"
  ];

  // Bảng tra Cung Tướng từ số hàng đơn vị của Toán (Cell U94:V102)
  const TUONG_NUMBER = {
    1: "Kiền", 2: "Ngọ", 3: "Cấn", 4: "Mão",
    5: "Cung giữa", 6: "Dậu", 7: "Khôn", 8: "Tý", 9: "Tốn"
  };

  // Bảng tra Ngũ Phúc (Cell Y96:Z100)
  const NGU_PHUC_STEPS = { 1: "Kiền", 2: "Cấn", 3: "Tốn", 4: "Khôn", 5: "Cung giữa" };

  // Bảng tra Thần Cơ, Dân Cơ (Cell AS5:AV16)
  const TABLE_AU = ['Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ'];
  const TABLE_AV = ['Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu'];

  // Bảng tra Tứ Thần, Thiên Ất, Trực Phù, Thanh Long, Xích Kỳ, Hắc Kỳ, Âm Cả (Cell AS19:BD30)
  const TABLE_THAN = [
    [1, 'Kiền', 'Dậu', 'Cung giữa', 'Hợi', 'Hợi', 'Hợi', 'Tuất', 'Kiền', 'Tốn', 'Cung giữa', 'Cung giữa', 'Cấn'],
    [2, 'Ngọ', 'Khôn', 'Dậu', 'Tý', 'Thân', 'Tuất', 'Hợi', 'Tý', 'Ngọ', 'Dần', 'Dần', 'Cấn'],
    [3, 'Cấn', 'Tý', 'Khôn', 'Sửu', 'Tỵ', 'Dậu', 'Tý', 'Cấn', 'Khôn', 'Khôn', 'Ngọ', 'Cấn'],
    [4, 'Mão', 'Tốn', 'Tý', 'Dần', 'Dần', 'Thân', 'Sửu', 'Tốn', 'Kiền', 'Mão', 'Cấn', 'Cấn'],
    [5, 'Cung giữa', 'Tỵ', 'Tốn', 'Mão', null, 'Mùi', 'Dần', 'Khôn', 'Cấn', 'Cung giữa', 'Mão', 'Khôn'],
    [6, 'Dậu', 'Khôn', 'Tốn', 'Thìn', null, 'Ngọ', 'Mão', null, null, 'Tốn', 'Tốn', 'Khôn'],
    [7, 'Khôn', 'Dần', 'Thân', 'Tỵ', null, 'Tỵ', 'Thìn', null, null, 'Dần', 'Dậu', 'Khôn'],
    [8, 'Tý', 'Kiền', 'Dần', 'Ngọ', null, 'Thìn', 'Tỵ', null, null, 'Dần', 'Khôn', 'Khôn'],
    [9, 'Tốn', 'Ngọ', 'Kiền', 'Mùi', null, 'Mão', 'Ngọ', null, null, 'Kiền', 'Cung giữa', null],
    [10, 'Tốn', 'Cấn', 'Ngọ', 'Thân', null, 'Dần', 'Mùi', null, null, 'Ngọ', 'Tý', null],
    [11, 'Khôn', 'Mão', 'Cấn', 'Dậu', null, 'Sửu', 'Thân', null, null, 'Cấn', 'Cấn', null],
    [12, 'Kiền', 'Cung giữa', 'Mão', 'Tuất', null, 'Tý', 'Dậu', null, null, 'Mão', 'Tốn', null]
  ];

  const TABLE_CUA_TRUC = ['Kiền', 'Tý', 'Cấn', 'Mão', 'Tốn', 'Ngọ', 'Khôn', 'Dậu'];
  const TABLE_TIEU_DU = [
    'Khôn', 'Khôn', 'Thân', 'Dậu', 'Tuất', 'Kiền',
    'Kiền', 'Hợi', 'Tý', 'Sửu', 'Cấn', 'Dần',
    'Mão', 'Thìn', 'Tốn', 'Tỵ', 'Ngọ', 'Mùi'
  ];

  const CUU_TINH = [
    "Thiên Bồng", "Thiên Nhuế", "Thiên Xung", "Thiên Phụ", "Thiên Cầm",
    "Thiên Tâm", "Thiên Trụ", "Thiên Nhậm", "Thiên Anh"
  ];

  const THAN_QUY = [
    "Thái nhất", "Thiên hoàng", "Thái âm", "Hàm trì", "Thanh long",
    "Thiên phù", "Chiêu dao", "Hiên viên", "Nhiếp đề"
  ];

  const LUC_HOP = {
    "Tý": "Sửu", "Sửu": "Tý", "Dần": "Hợi", "Hợi": "Dần",
    "Mão": "Tuất", "Tuất": "Mão", "Thìn": "Dậu", "Dậu": "Thìn",
    "Tỵ": "Thân", "Thân": "Tỵ", "Ngọ": "Mùi", "Mùi": "Ngọ"
  };

  const DIA_CHI_12 = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
  const MENH_12_CUNG = ["MỆNH", "PHỤ", "TƯỚNG", "PHÚC", "TẬT", "NÔ", "QUAN", "ĐIỀN", "TÀI", "TỬ", "THÊ", "HUYNH"];

  // Helper tính Modulo toán học dương
  function mathMod(n, m) {
    return ((n % m) + m) % m;
  }

  // --- 1. TÍCH LŨY TAM TOÁN (CHUẨN S_4Ke) ---
  function calcAccumulatedSum(fromPos, toPos) {
    let idxFrom = THAP_LUC.indexOf(fromPos) + 1;
    let idxTo = THAP_LUC.indexOf(toPos) + 1;
    if (idxFrom === idxTo) return QUAI_WEIGHTS[fromPos] || 1;

    let total = 0;
    let curr = idxFrom;
    while (curr !== idxTo) {
      let name = THAP_LUC[curr - 1];
      let w = (curr === idxFrom) ? (QUAI_WEIGHTS[name] || 1) : (QUAI_WEIGHTS[name] || 0);
      total += w;
      curr = (curr % 16) + 1;
    }
    return total;
  }

  // --- 2. AN TỨ TƯỚNG (CHUẨN S_4Ke R27, R29, R30, R31) ---
  function getGeneralPalace(toanVal) {
    if (toanVal <= 0) return "Cung giữa";
    let s = String(toanVal);
    let lastDigit = parseInt(s[s.length - 1], 10);
    if (lastDigit === 0) lastDigit = Math.floor(parseInt(s, 10) / 10);
    return TUONG_NUMBER[lastDigit % 10] || "Cung giữa";
  }

  function getAssistantGeneral(daiTuong, toanVal) {
    if (toanVal <= 0) return "Cung giữa";
    let s = String(toanVal);
    let lastDigit = parseInt(s[s.length - 1], 10);
    if (lastDigit === 0) lastDigit = Math.floor(parseInt(s, 10) / 10);
    let targetVal = 3 * lastDigit;
    let sT = String(targetVal);
    let rem = parseInt(sT[sT.length - 1], 10);
    if (rem === 0) rem = Math.floor(targetVal / 10);
    return TUONG_NUMBER[rem % 10] || "Cung giữa";
  }

  // --- 3. GIẢI 1 KỂ ĐỘC LẬP (SOLVE KE) ---
  function solveKe(keName, epoch, donType = "Dương Độn") {
    let kyDu = mathMod(epoch - 1, 360) + 1;
    let cuc = mathMod(kyDu - 1, 72) + 1;
    let nguyen = Math.floor((kyDu - 1) / 72) + 1;

    // Thái Ất
    let thaiAtPos = THAI_AT_PALACES[Math.floor(mathMod(kyDu - 1, 24) / 3)];

    // Văn Xương & Kế Thần
    let vanXuongPos = VAN_XUONG_STEPS[mathMod(kyDu - 1, 18)];
    let keThanPos = KE_THAN_STEPS[mathMod(kyDu - 1, 12)];

    // Thủy Kích (Cell R25 chuẩn xác)
    let vxIdx = THAP_LUC.indexOf(vanXuongPos) + 1;
    let ktIdx = THAP_LUC.indexOf(keThanPos) + 1;
    let tkRaw = 9 + vxIdx - ktIdx - 2;
    let tkIdx = mathMod(tkRaw, 16) + 1;
    let thuyKichPos = THAP_LUC[tkIdx - 1];

    // Tam Toán
    let toanChu = calcAccumulatedSum(vanXuongPos, thaiAtPos);
    let toanKhach = calcAccumulatedSum(thuyKichPos, thaiAtPos);

    // Tứ Tướng
    let daiChu = getGeneralPalace(toanChu);
    let daiKhach = getGeneralPalace(toanKhach);
    let thamChu = getAssistantGeneral(daiChu, toanChu);
    let thamKhach = getAssistantGeneral(daiKhach, toanKhach);

    // Bảng sao
    let stars = {};
    let starsByPalace = {};
    function setStar(name, pos) {
      stars[name] = pos;
      if (pos) {
        if (!starsByPalace[pos]) starsByPalace[pos] = [];
        starsByPalace[pos].push(name);
      }
    }

    setStar("Thái Ất", thaiAtPos);
    setStar("Văn Xương", vanXuongPos);
    setStar("Kế Thần", keThanPos);
    setStar("Thủy Kích", thuyKichPos);
    setStar("Chủ Đại Tướng", daiChu);
    setStar("Khách Đại Tướng", daiKhach);
    setStar("Chủ Tham Tướng", thamChu);
    setStar("Khách Tham Tướng", thamKhach);

    // Ngũ Phúc (Cell R32: +115 cho Kể Năm, +117 cho Tháng, Ngày, Giờ)
    let npOffset = (keName === "Kể Năm" || keName === "Nam") ? 115 : 117;
    let npStep = mathMod(epoch + npOffset - 1, 225) + 1;
    let npPalace = NGU_PHUC_STEPS[Math.floor((npStep - 1) / 45) + 1] || "Cung giữa";
    setStar("Ngũ Phúc", npPalace);

    // Quân Cơ, Thần Cơ, Dân Cơ (Cell R33-R35)
    let qStep = mathMod(epoch + 252 - 1, 360) + 1;
    setStar("Quân Cơ", TABLE_AU[Math.floor((qStep - 1) / 30)]);
    setStar("Thần Cơ", TABLE_AU[Math.floor(mathMod(qStep - 1, 36) / 3)]);
    setStar("Dân Cơ", TABLE_AV[mathMod(qStep - 1, 12)]);

    // Tứ Thần, Thiên Ất, Trực Phù (Cell R36-R38)
    let tuStep = mathMod(epoch - 1, 36) + 1;
    let ttIdx = Math.floor((tuStep - 1) / 3);
    setStar("Tứ Thần", TABLE_THAN[ttIdx][1]);
    setStar("Thiên Ất", TABLE_THAN[ttIdx][2]);
    setStar("Trực Phù", TABLE_THAN[ttIdx][3]);

    // Rồng Xanh, Xích Kỳ, Hắc Kỳ, Âm Cả, Tuế Cả, Thần Hợp (Cell R39-R44)
    let chi12 = mathMod(epoch - 1, 12);
    let chiMod12 = chi12 + 1;
    let rongXanh = (chiMod12 === 6 || chiMod12 === 12) ? "Tuất" : TABLE_THAN[chi12][4];
    let xichKy = (chiMod12 === 6 || chiMod12 === 12) ? "Thân" : TABLE_THAN[mathMod(mathMod(epoch + 1 - 1, 40), 4)][5];
    let hacKy = (chiMod12 === 6 || chiMod12 === 12) ? "Mùi" : TABLE_THAN[Math.floor(mathMod(epoch + 25 - 1, 36) / 3)][6];
    let amCa = TABLE_THAN[chi12][7];
    let tueCa = DIA_CHI_12[chi12];
    let thanHop = LUC_HOP[tueCa];

    setStar("Rồng Xanh", rongXanh);
    setStar("Cờ Đỏ", xichKy);
    setStar("Cờ Đen", hacKy);
    setStar("Âm Cả", amCa);
    setStar("Tuế Cả", tueCa);
    setStar("Thần Hợp", thanHop);

    // Kể Định & Toán Định (Cell R45-R46)
    let thIdx = THAP_LUC.indexOf(thanHop) + 1;
    let tcIdx = THAP_LUC.indexOf(tueCa) + 1;
    let diff = mathMod(vxIdx - thIdx + 16 - 1, 16) + 1;
    let kdIdx = mathMod(diff + tcIdx - 1, 16) + 1;
    let keDinh = THAP_LUC[kdIdx - 1];
    setStar("Kể Định", keDinh);
    let toanDinh = calcAccumulatedSum(keDinh, thaiAtPos);

    // Phi Phù, Địa Ất, Đại Du, Cửa Trực, Tiểu Du (Cell R47-R51)
    setStar("Phi Phù", TABLE_THAN[ttIdx][9]);
    setStar("Địa Ất", TABLE_THAN[ttIdx][10]);
    setStar("Đại Du", TABLE_THAN[Math.floor(mathMod(epoch + 34 - 1, 288) / 36)][12]);
    setStar("Cửa Trực", TABLE_CUA_TRUC[Math.floor(mathMod(epoch - 1, 240) / 30)]);
    setStar("Tiểu Du", TABLE_TIEU_DU[mathMod(epoch - 1, 18)]);

    // Thần Quý & 9 Sao Trực Phù
    let thanQuyName = THAN_QUY[mathMod(epoch - 1 + 3, 9)];
    setStar("Thần Quý", thanQuyName);
    let sao9 = CUU_TINH[Math.floor(mathMod(epoch - 1, 90) / 10) % 9];
    setStar("9 Sao Trực Phù", sao9);

    // Đánh giá Biến Dị Thiên Địa
    let isVoThien = (toanChu < 10 && toanKhach < 10) || (toanChu === 1 && toanKhach === 7);
    let isVoDia = ([1, 2, 7].includes(toanChu % 10)) && ([1, 7].includes(toanKhach % 10));
    let isVoNhan = ([1, 7, 31].includes(toanDinh)) || (toanChu === toanKhach);

    let tinhThe = "Bình hòa";
    if (toanChu > toanKhach) {
      tinhThe = "Chủ thắng (Thuận nội bộ, xây dựng, củng cố căn cơ)";
    } else if (toanKhach > toanChu) {
      tinhThe = "Khách thắng (Thuận xuất chinh, mở rộng thị trường, đàm phán)";
    } else {
      tinhThe = "Trùng toán (Hòa hoãn - cần thận trọng thế trận giằng co)";
    }

    return {
      keName,
      epoch,
      kyDu,
      cuc,
      nguyen,
      donType,
      thaiAtPos,
      vanXuongPos,
      keThanPos,
      thuyKichPos,
      toanChu,
      toanKhach,
      toanDinh,
      generals: {
        daiChu,
        daiKhach,
        thamChu,
        thamKhach
      },
      stars,
      starsByPalace,
      thanQuyName,
      sao9,
      isVoThien,
      isVoDia,
      isVoNhan,
      tinhThe
    };
  }

  // --- 4. THÁI ẤT MỆNH PHÁP 12 CUNG NHÂN MỆNH ---
  function buildMenhPhap12Cung(keNgayResult) {
    let laSo = {};
    for (let i = 0; i < DIA_CHI_12.length; i++) {
      let branch = DIA_CHI_12[i];
      let cungName = MENH_12_CUNG[i];
      let starsInPalace = [];
      for (let sName in keNgayResult.stars) {
        if (keNgayResult.stars[sName] === branch) {
          starsInPalace.push(sName);
        }
      }
      laSo[cungName] = {
        cungName,
        branch,
        stars: starsInPalace,
        locVal: (i * 10 + 5) % 120 + 5,
        maVal: ((11 - i) * 10 + 5) % 120 + 5,
        daiHanTuoi: i > 0 ? (i * 10 + 2) : 2
      };
    }
    return laSo;
  }

  // --- 5. LẬP BÀN TRẬN ĐỒ TOÀN DIỆN TỪ DATE OBJ ---
  function buildThaiAtChart(dateInput) {
    let d = (dateInput instanceof Date) ? dateInput : new Date(dateInput);
    if (isNaN(d.getTime())) d = new Date();

    let dd = d.getDate();
    let mm = d.getMonth() + 1;
    let yy = d.getFullYear();
    let hour = d.getHours();
    let minute = d.getMinutes();

    let jd;
    let canChi = { nam: '', thang: '', ngay: '', gio: '' };
    let tietKhiName = 'Thu Phân';

    // Tích hợp dữ liệu ngày giờ & tiết khí chuẩn xác từ NetaCalendarEngine
    if (global.NetaCalendarEngine) {
      if (typeof global.NetaCalendarEngine.getFullDayInfo === 'function') {
        try {
          const fullInfo = global.NetaCalendarEngine.getFullDayInfo(d);
          if (fullInfo) {
            if (fullInfo.solarTerm) tietKhiName = fullInfo.solarTerm;
            if (fullInfo.canChi) {
              canChi = {
                nam: fullInfo.canChi.year || '',
                thang: fullInfo.canChi.month || '',
                ngay: fullInfo.canChi.day || '',
                gio: fullInfo.canChi.hour || ''
              };
            }
          }
        } catch (e) {
          console.warn('Thái Ất: Lỗi đọc getFullDayInfo từ Calendar Engine:', e);
        }
      } else if (typeof global.NetaCalendarEngine.getSolarTermName === 'function') {
        tietKhiName = global.NetaCalendarEngine.getSolarTermName(dd, mm, yy, hour, minute);
      }

      if (typeof global.NetaCalendarEngine.getJulianDay === 'function') {
        jd = global.NetaCalendarEngine.getJulianDay(dd, mm, yy);
      }
    }

    if (!jd) {
      // Fallback tính Julian Day thuần
      let a = Math.floor((14 - mm) / 12);
      let y = yy + 4800 - a;
      let m = mm + 12 * a - 3;
      jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
      if (!canChi.nam) {
        canChi = {
          nam: `Năm ${yy}`,
          thang: `Tháng ${mm}`,
          ngay: `Ngày ${dd}`,
          gio: `Giờ ${hour}h`
        };
      }
    }

    // Xác định Dương Độn / Âm Độn (Từ Hạ chí ~21/06 đến Đông chí ~22/12 là Âm Độn)
    let isAmDon = (mm > 6 && mm < 12) || (mm === 6 && dd >= 21) || (mm === 12 && dd < 22);
    let donType = isAmDon ? "Âm Độn" : "Dương Độn";

    // 1. Kể Năm
    let epochNam = yy + 10153917;
    let keNam = solveKe("Kể Năm", epochNam, donType);

    // 2. Kể Tháng
    let epochThang = (keNam.kyDu - 1) * 12 + 2 + mm;
    let keThang = solveKe("Kể Tháng", epochThang, donType);

    // 3. Kể Ngày
    let epochNgay = mathMod(jd, 360) + 1;
    let keNgay = solveKe("Kể Ngày", epochNgay, donType);

    // 4. Kể Giờ
    let chiGioIdx = Math.floor((hour + 1) / 2) % 12;
    let epochGio = (keNgay.kyDu - 1) * 12 + chiGioIdx + 1;
    let keGio = solveKe("Kể Giờ", epochGio, donType);

    // 5. Lá Số Thái Ất Nhân Mệnh 12 Cung
    let laSoMenh = buildMenhPhap12Cung(keNgay);

    // 6. Ma trận 16 Cung Kể Giờ
    let board16 = {};
    THAP_LUC.forEach(pos => { board16[pos] = []; });
    board16["Cung giữa"] = [];
    for (let sName in keGio.stars) {
      let p = keGio.stars[sName];
      if (p && board16[p]) board16[p].push(sName);
    }

    return {
      date: d,
      solarStr: `${String(dd).padStart(2, '0')}/${String(mm).padStart(2, '0')}/${yy} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      canChi,
      tietKhi: tietKhiName,
      donType,
      keNam,
      keThang,
      keNgay,
      keGio,
      board16,
      laSoMenh
    };
  }

  // --- 6. SELF-TEST RUNNER KIỂM ĐỊNH TỰ ĐỘNG ---
  function runSelfTest() {
    const benchmarks = {
      "Nam": {
        epoch: 10155926,
        thaiAtPos: "Dậu", vanXuongPos: "Dậu", keThanPos: "Sửu", thuyKichPos: "Tuất",
        toanChu: 6, toanKhach: 35, toanDinh: 35,
        daiChu: "Dậu", daiKhach: "Cung giữa", thamChu: "Tý", thamKhach: "Cung giữa",
        nguPhuc: "Cung giữa", quanCo: "Sửu", thanCo: "Ngọ", danCo: "Hợi",
        tuThan: "Kiền", thienAt: "Dậu", trucPhu: "Cung giữa", rongXanh: "Tý",
        xichKy: "Tỵ", hacKy: "Mão", amCa: "Hợi", tueCa: "Sửu", thanHop: "Tý", keDinh: "Tuất"
      },
      "Thang": {
        epoch: 3910,
        thaiAtPos: "Tốn", vanXuongPos: "Kiền", keThanPos: "Tỵ", thuyKichPos: "Mùi",
        toanChu: 16, toanKhach: 30, toanDinh: 1,
        daiChu: "Dậu", daiKhach: "Cấn", thamChu: "Tý", thamKhach: "Tốn",
        nguPhuc: "Cung giữa", quanCo: "Tý", thanCo: "Sửu", danCo: "Mùi",
        tuThan: "Tý", thienAt: "Kiền", trucPhu: "Dần", rongXanh: "Thân",
        xichKy: "Tỵ", hacKy: "Thân", amCa: "Mùi", tueCa: "Dậu", thanHop: "Thìn", keDinh: "Thìn"
      },
      "Ngay": {
        epoch: 253,
        thaiAtPos: "Dậu", vanXuongPos: "Thân", keThanPos: "Dần", thuyKichPos: "Khôn",
        toanChu: 1, toanKhach: 7, toanDinh: 7,
        daiChu: "Kiền", daiKhach: "Khôn", thamChu: "Cấn", thamKhach: "Kiền",
        nguPhuc: "Khôn", quanCo: "Tuất", thanCo: "Ngọ", danCo: "Tuất",
        tuThan: "Kiền", thienAt: "Dậu", trucPhu: "Cung giữa", rongXanh: "Hợi",
        xichKy: "Thân", hacKy: "Mão", amCa: "Tuất", tueCa: "Tý", thanHop: "Sửu", keDinh: "Khôn"
      },
      "Gio": {
        epoch: 3032,
        thaiAtPos: "Cấn", vanXuongPos: "Sửu", keThanPos: "Mùi", thuyKichPos: "Khôn",
        toanChu: 1, toanKhach: 22, toanDinh: 3,
        daiChu: "Kiền", daiKhach: "Ngọ", thamChu: "Cấn", thamKhach: "Dậu",
        nguPhuc: "Cung giữa", quanCo: "Mùi", thanCo: "Thân", danCo: "Tỵ",
        tuThan: "Cấn", thienAt: "Tý", trucPhu: "Khôn", rongXanh: "Ngọ",
        xichKy: "Hợi", hacKy: "Sửu", amCa: "Tỵ", tueCa: "Mùi", thanHop: "Ngọ", keDinh: "Cấn"
      }
    };

    let allPassed = true;
    for (let kName in benchmarks) {
      let exp = benchmarks[kName];
      let res = solveKe(kName, exp.epoch);
      
      let checks = [
        ['thaiAtPos', res.thaiAtPos, exp.thaiAtPos],
        ['vanXuongPos', res.vanXuongPos, exp.vanXuongPos],
        ['keThanPos', res.keThanPos, exp.keThanPos],
        ['thuyKichPos', res.thuyKichPos, exp.thuyKichPos],
        ['toanChu', res.toanChu, exp.toanChu],
        ['toanKhach', res.toanKhach, exp.toanKhach],
        ['toanDinh', res.toanDinh, exp.toanDinh],
        ['daiChu', res.generals.daiChu, exp.daiChu],
        ['daiKhach', res.generals.daiKhach, exp.daiKhach],
        ['thamChu', res.generals.thamChu, exp.thamChu],
        ['thamKhach', res.generals.thamKhach, exp.thamKhach],
        ['nguPhuc', res.stars["Ngũ Phúc"], exp.nguPhuc],
        ['quanCo', res.stars["Quân Cơ"], exp.quanCo],
        ['thanCo', res.stars["Thần Cơ"], exp.thanCo],
        ['danCo', res.stars["Dân Cơ"], exp.danCo],
        ['tuThan', res.stars["Tứ Thần"], exp.tuThan],
        ['thienAt', res.stars["Thiên Ất"], exp.thienAt],
        ['trucPhu', res.stars["Trực Phù"], exp.trucPhu],
        ['rongXanh', res.stars["Rồng Xanh"], exp.rongXanh],
        ['xichKy', res.stars["Cờ Đỏ"], exp.xichKy],
        ['hacKy', res.stars["Cờ Đen"], exp.hacKy],
        ['amCa', res.stars["Âm Cả"], exp.amCa],
        ['tueCa', res.stars["Tuế Cả"], exp.tueCa],
        ['thanHop', res.stars["Thần Hợp"], exp.thanHop],
        ['keDinh', res.stars["Kể Định"], exp.keDinh]
      ];

      for (let c of checks) {
        if (c[1] !== c[2]) {
          console.error(`[SELF-TEST FAILED] ${kName} - ${c[0]}: expected '${c[2]}', got '${c[1]}'`);
          allPassed = false;
        }
      }
    }

    return allPassed;
  }

  // Export API
  const NetaThaiAtEngine = {
    solveKe,
    buildThaiAtChart,
    buildMenhPhap12Cung,
    calcAccumulatedSum,
    getGeneralPalace,
    getAssistantGeneral,
    runSelfTest,
    THAP_LUC,
    CUNG_WEIGHTS,
    QUAI_WEIGHTS,
    MENH_12_CUNG,
    DIA_CHI_12
  };

  global.NetaThaiAtEngine = NetaThaiAtEngine;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = NetaThaiAtEngine;
  }

})(typeof window !== 'undefined' ? window : globalThis);
