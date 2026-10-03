/**
 * NETA LIGHT - TẦM LONG ĐIỂM HUYỆT & LOAN ĐẦU ĐỊA MẠO SỐ ENGINE
 * File: engines/tam_long_engine.js
 * ---------------------------------------------------------------------------------
 * Kế thừa và hợp nhất 100% thuật toán từ dự án Tam_long_diem_huyet:
 * 1. Tầng 1: Tầm Long & Khảo sát Địa mạo số (Slope, Aspect, Curvatures, TPI, TRI).
 * 2. Tầng 2: Sát Sa & Tứ Tượng Hộ Vệ (Huyền Vũ, Chu Tước, Thanh Long, Bạch Hổ).
 * 3. Tầng 3: Chỉ số Tàng Phong Tụ Khí (Wind Enclosure Index - WEI).
 * 4. Tầng 4: Quan Thủy (Ngọc Đới Hoàn Yêu vs Phản Cung Thủy, Thủy Khẩu).
 * 5. Tầng 5: Điểm Huyệt & Tứ Thế (Oa, Kiềm, Nhũ, Đột) & Chấm điểm Đa tiêu chí SMCE.
 * 6. Tầng 6: La Kinh Vi Mô & Micro-Steering (24 Sơn, 60 Xuyên Sơn, 72 Thấu Địa, 120 Phân Kim, WMM).
 */

(function (global) {
  'use strict';

  // =========================================================================
  // 1. LUOPAN PHAN KIM ENGINE (Thuần túy, 0 dependency)
  // =========================================================================
  class LuopanPhanKimEngine {
    static MOUNTAINS = [
      { name: "TÝ", centerAzimuth: 0.0, start: 352.5, end: 7.5, quoc: "Khảm", cuc: "Dương Thủy" },
      { name: "QUÝ", centerAzimuth: 15.0, start: 7.5, end: 22.5, quoc: "Khảm", cuc: "Âm Thủy" },
      { name: "SỬU", centerAzimuth: 30.0, start: 22.5, end: 37.5, quoc: "Cấn", cuc: "Âm Thổ" },
      { name: "CẤN", centerAzimuth: 45.0, start: 37.5, end: 52.5, quoc: "Cấn", cuc: "Dương Thổ" },
      { name: "DẦN", centerAzimuth: 60.0, start: 52.5, end: 67.5, quoc: "Cấn", cuc: "Dương Mộc" },
      { name: "GIÁP", centerAzimuth: 75.0, start: 67.5, end: 82.5, quoc: "Chấn", cuc: "Dương Mộc" },
      { name: "MÃO", centerAzimuth: 90.0, start: 82.5, end: 97.5, quoc: "Chấn", cuc: "Âm Mộc" },
      { name: "ẤT", centerAzimuth: 105.0, start: 97.5, end: 112.5, quoc: "Chấn", cuc: "Âm Mộc" },
      { name: "THÌN", centerAzimuth: 120.0, start: 112.5, end: 127.5, quoc: "Tốn", cuc: "Dương Thổ" },
      { name: "TỐN", centerAzimuth: 135.0, start: 127.5, end: 142.5, quoc: "Tốn", cuc: "Âm Mộc" },
      { name: "TỴ", centerAzimuth: 150.0, start: 142.5, end: 157.5, quoc: "Tốn", cuc: "Âm Hỏa" },
      { name: "BÍNH", centerAzimuth: 165.0, start: 157.5, end: 172.5, quoc: "Ly", cuc: "Dương Hỏa" },
      { name: "NGỌ", centerAzimuth: 180.0, start: 172.5, end: 187.5, quoc: "Ly", cuc: "Âm Hỏa" },
      { name: "ĐINH", centerAzimuth: 195.0, start: 187.5, end: 202.5, quoc: "Ly", cuc: "Âm Hỏa" },
      { name: "MÙI", centerAzimuth: 210.0, start: 202.5, end: 217.5, quoc: "Khôn", cuc: "Âm Thổ" },
      { name: "KHÔN", centerAzimuth: 225.0, start: 217.5, end: 232.5, quoc: "Khôn", cuc: "Âm Thổ" },
      { name: "THÂN", centerAzimuth: 240.0, start: 232.5, end: 247.5, quoc: "Khôn", cuc: "Dương Kim" },
      { name: "CANH", centerAzimuth: 255.0, start: 247.5, end: 262.5, quoc: "Đoài", cuc: "Dương Kim" },
      { name: "DẬU", centerAzimuth: 270.0, start: 262.5, end: 277.5, quoc: "Đoài", cuc: "Âm Kim" },
      { name: "TÂN", centerAzimuth: 285.0, start: 277.5, end: 292.5, quoc: "Đoài", cuc: "Âm Kim" },
      { name: "TUẤT", centerAzimuth: 300.0, start: 292.5, end: 307.5, quoc: "Càn", cuc: "Dương Thổ" },
      { name: "CÀN", centerAzimuth: 315.0, start: 307.5, end: 322.5, quoc: "Càn", cuc: "Dương Kim" },
      { name: "HỢI", centerAzimuth: 330.0, start: 322.5, end: 337.5, quoc: "Càn", cuc: "Âm Thủy" },
      { name: "NHÂM", centerAzimuth: 345.0, start: 337.5, end: 352.5, quoc: "Khảm", cuc: "Dương Thủy" },
    ];

    static calculateDeclination(lat, lng, year = 2026.5) {
      const latRef = 16.0;
      const lngRef = 106.0;
      const baseDec = -1.75;
      const dLat = (lat - latRef) * 0.045;
      const dLng = (lng - lngRef) * 0.032;
      const dYear = (year - 2025.0) * (-0.02);
      return +(baseDec + dLat + dLng + dYear).toFixed(2);
    }

    static normalizeAngle(deg) {
      let a = deg % 360.0;
      if (a < 0) a += 360.0;
      return +a.toFixed(4);
    }

    static getMountain(bearing) {
      const b = this.normalizeAngle(bearing);
      if (b >= 352.5 || b < 7.5) {
        return this.MOUNTAINS[0]; // TÝ
      }
      for (let i = 1; i < this.MOUNTAINS.length; i++) {
        if (b >= this.MOUNTAINS[i].start && b < this.MOUNTAINS[i].end) {
          return this.MOUNTAINS[i];
        }
      }
      return this.MOUNTAINS[0];
    }

    static getPhanKim120(bearing) {
      const b = this.normalizeAngle(bearing);
      const m = this.getMountain(b);
      let relDeg = b - m.start;
      if (relDeg < 0) relDeg += 360.0;
      const slot = Math.min(Math.max(Math.floor(relDeg / 3.0), 0), 4);

      const slotStart = this.normalizeAngle(m.start + slot * 3.0);
      const slotEnd = this.normalizeAngle(slotStart + 3.0);
      const slotCenter = this.normalizeAngle(slotStart + 1.5);

      const canOrder = ["Giáp", "Bính", "Mậu", "Canh", "Nhâm"];
      const canName = canOrder[slot];
      const canChi = `${canName} ${m.name}`;

      let tinhChat = "CO";
      let danhGia = "HUNG";
      let moTa = "";
      let color = "#EF4444";

      if (slot === 0) {
        tinhChat = "CO";
        danhGia = "HUNG";
        moTa = "Cô âm độc dương, khí cô độc, bất lợi nhân đinh";
        color = "#F59E0B";
      } else if (slot === 1) {
        tinhChat = "VUONG";
        danhGia = "CAT";
        moTa = "Bính phân kim - Khí Vượng phát tài lộc, hiển vinh";
        color = "#059669";
      } else if (slot === 2) {
        tinhChat = "KHONG_VONG";
        danhGia = "DAI_HUNG";
        moTa = "Mậu phân kim - Chính trung Quy Giáp Sát / Đại Không Vong";
        color = "#DC2626";
      } else if (slot === 3) {
        tinhChat = "TUONG";
        danhGia = "DAI_CAT";
        moTa = "Canh phân kim - Khí Tướng đại cát, phước đức miên trường";
        color = "#16A34A";
      } else {
        tinhChat = "HU";
        danhGia = "HUNG";
        moTa = "Nhâm phân kim - Khí Hư nhược, thoái tán tài lộc";
        color = "#EF4444";
      }

      return {
        index: slot + 1,
        canChi,
        start: slotStart,
        end: slotEnd,
        center: slotCenter,
        napAm: this.getNapAm(canChi),
        tinhChat,
        danhGia,
        moTa,
        color,
      };
    }

    static getThauDia72(bearing) {
      const b = this.normalizeAngle(bearing);
      const m = this.getMountain(b);
      let relDeg = b - m.start;
      if (relDeg < 0) relDeg += 360.0;
      const slot = Math.min(Math.max(Math.floor(relDeg / 5.0), 0), 2);

      const start = this.normalizeAngle(m.start + slot * 5.0);
      const end = this.normalizeAngle(start + 5.0);
      const center = this.normalizeAngle(start + 2.5);

      if (slot === 1) {
        return {
          index: 2,
          canChi: `Trung Long ${m.name}`,
          start,
          end,
          center,
          phanLoai: "SAI_THAC",
          danhGia: "DAI_HUNG",
          moTa: "Sai Thác Long / Đại Không Vong - Nhị khí giao tranh",
          isBaoChau: false
        };
      } else if (slot === 0) {
        return {
          index: 1,
          canChi: `Tiền Long ${m.name}`,
          start,
          end,
          center,
          phanLoai: "BAO_CHAU",
          danhGia: "CAT",
          moTa: "Bảo Châu Long - Sinh khí tụ tập, quý nhân phò trợ",
          isBaoChau: true
        };
      } else {
        return {
          index: 3,
          canChi: `Hậu Long ${m.name}`,
          start,
          end,
          center,
          phanLoai: "BAO_CHAU",
          danhGia: "DAI_CAT",
          moTa: "Bảo Châu Long - Tướng tinh đắc vị, phú quý song toàn",
          isBaoChau: true
        };
      }
    }

    static getXuyenSon60(bearing) {
      const b = this.normalizeAngle(bearing);
      const index = Math.floor(b / 6.0);
      const start = index * 6.0;
      const end = start + 6.0;
      const center = start + 3.0;

      const can = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
      const chi = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
      const canChi = `${can[index % 10]} ${chi[index % 12]}`;

      return {
        index: index + 1,
        canChi,
        start,
        end,
        center,
        napAm: this.getNapAm(canChi),
        khi: index % 2 === 0 ? "Thuần Khí Dương" : "Thuần Khí Âm",
      };
    }

    static analyzeSteering(trueBearing, declination) {
      const b = this.normalizeAngle(trueBearing);
      const m = this.getMountain(b);
      const pk = this.getPhanKim120(b);

      const distToBoundary = Math.min(Math.abs(b - m.start), Math.abs(b - m.end));
      let isBoundary = false;
      let voidType = "NONE";
      let warning = "";

      if (distToBoundary <= 0.75) {
        isBoundary = true;
        voidType = (m.start % 45 === 22.5 || m.end % 45 === 22.5) ? "DAI_KHONG_VONG" : "TIEU_KHONG_VONG";
        warning = `CẢNH BÁO: Đang nằm sát tuyến ${voidType} (cách vạch ${distToBoundary.toFixed(2)}°)!`;
      } else if (pk.tinhChat === "KHONG_VONG") {
        isBoundary = true;
        voidType = "QUY_GIAP_SAT";
        warning = `CẢNH BÁO: Đang phạm phân kim Mậu (${pk.canChi} - Chính Trung)! Tuyến Quy Giáp Sát.`;
      } else if (pk.tinhChat === "CO" || pk.tinhChat === "HU") {
        voidType = "CO_HU";
        warning = `LƯU Ý: Phân kim ${pk.canChi} thuộc tuyến Cô Hư, khí thoái.`;
      }

      const targetCanh = this.normalizeAngle(m.start + 10.5);
      const targetBinh = this.normalizeAngle(m.start + 4.5);

      let deltaCanh = targetCanh - b;
      if (deltaCanh > 180) deltaCanh -= 360;
      if (deltaCanh < -180) deltaCanh += 360;

      let deltaBinh = targetBinh - b;
      if (deltaBinh > 180) deltaBinh -= 360;
      if (deltaBinh < -180) deltaBinh += 360;

      let bestTargetTrue = targetCanh;
      let bestDelta = deltaCanh;
      let targetPhanKim = `Canh ${m.name}`;

      if (Math.abs(deltaBinh) < Math.abs(deltaCanh)) {
        bestTargetTrue = targetBinh;
        bestDelta = deltaBinh;
        targetPhanKim = `Bính ${m.name}`;
      }

      const recMag = this.normalizeAngle(bestTargetTrue - declination);

      return {
        isCurrentInVoid: isBoundary || pk.tinhChat === "KHONG_VONG",
        voidType,
        warningMessage: warning,
        recommendedTrueBearing: bestTargetTrue,
        recommendedMagneticBearing: recMag,
        deltaAngle: +bestDelta.toFixed(2),
        targetPhanKim,
        targetThauDia: "Bảo Châu Long (Cát Tường)",
        rationale: `Vi chỉnh ${bestDelta > 0 ? "quay sang PHẢI" : "quay sang TRÁI"} ${Math.abs(bestDelta).toFixed(2)}° để nhập đúng phân kim ${targetPhanKim} (${bestTargetTrue.toFixed(2)}° Cát).`,
      };
    }

    static getNapAm(canChi) {
      const map = {
        "Giáp Tý": "Hải Trung Kim", "Ất Sửu": "Hải Trung Kim",
        "Bính Dần": "Lô Trung Hỏa", "Đinh Mão": "Lô Trung Hỏa",
        "Mậu Thìn": "Đại Lâm Mộc", "Kỷ Tỵ": "Đại Lâm Mộc",
        "Canh Ngọ": "Lộ Bàng Thổ", "Tân Mùi": "Lộ Bàng Thổ",
        "Nhâm Thân": "Kiếm Phong Kim", "Quý Dậu": "Kiếm Phong Kim",
        "Giáp Tuất": "Sơn Đầu Hỏa", "Ất Hợi": "Sơn Đầu Hỏa",
        "Bính Tý": "Giản Hạ Thủy", "Đinh Sửu": "Giản Hạ Thủy",
        "Mậu Dần": "Thành Đầu Thổ", "Kỷ Mão": "Thành Đầu Thổ",
        "Canh Thìn": "Bạch Lạp Kim", "Tân Tỵ": "Bạch Lạp Kim",
        "Nhâm Ngọ": "Dương Liễu Mộc", "Quý Mùi": "Dương Liễu Mộc",
        "Giáp Thân": "Tuyền Trung Thủy", "Ất Dậu": "Tuyền Trung Thủy",
        "Bính Tuất": "Ốc Thượng Thổ", "Đinh Hợi": "Ốc Thượng Thổ",
        "Mậu Tý": "Tích Lịch Hỏa", "Kỷ Sửu": "Tích Lịch Hỏa",
        "Canh Dần": "Tùng Bách Mộc", "Tân Mão": "Tùng Bách Mộc",
        "Nhâm Thìn": "Trường Lưu Thủy", "Quý Tỵ": "Trường Lưu Thủy",
        "Giáp Ngọ": "Sa Trung Kim", "Ất Mùi": "Sa Trung Kim",
        "Bính Thân": "Sơn Hạ Hỏa", "Đinh Dậu": "Sơn Hạ Hỏa",
        "Mậu Tuất": "Bình Địa Mộc", "Kỷ Hợi": "Bình Địa Mộc",
        "Canh Tý": "Bích Thượng Thổ", "Tân Sửu": "Bích Thượng Thổ",
        "Nhâm Dần": "Kim Bạch Kim", "Quý Mão": "Kim Bạch Kim",
        "Giáp Thìn": "Phú Đăng Hỏa", "Ất Tỵ": "Phú Đăng Hỏa",
        "Bính Ngọ": "Thiên Hà Thủy", "Đinh Mùi": "Thiên Hà Thủy",
        "Mậu Thân": "Đại Dịch Thổ", "Kỷ Dậu": "Đại Dịch Thổ",
        "Canh Tuất": "Thoa Xuyến Kim", "Tân Hợi": "Thoa Xuyến Kim",
        "Nhâm Tý": "Tang Đố Mộc", "Quý Sửu": "Tang Đố Mộc",
        "Giáp Dần": "Đại Khê Thủy", "Ất Mão": "Đại Khê Thủy",
        "Bính Thìn": "Sa Trung Thổ", "Đinh Tỵ": "Sa Trung Thổ",
        "Mậu Ngọ": "Thích Lịch Hỏa", "Kỷ Mùi": "Thích Lịch Hỏa",
        "Canh Thân": "Thạch Lựu Mộc", "Tân Dậu": "Thạch Lựu Mộc",
        "Nhâm Tuất": "Đại Hải Thủy", "Quý Hợi": "Đại Hải Thủy",
      };
      return map[canChi] || "Ngũ Hành Khí";
    }
  }

  // =========================================================================
  // 2. TẦM LONG ĐIỂM HUYỆT & LOAN ĐẦU ENGINE (TOÁN HỌC ĐỊA MẠO SỐ)
  // =========================================================================
  class TamLongDiemHuyetEngine {
    /**
     * Phân tích Toàn diện Loan Đầu Địa Mạo Số & Tứ Tượng Chân Huyệt
     * @param {Object} params - { lat, lng, headingDeg, demResult }
     */
    static analyzeLoanDau({ lat = 20.5242, lng = 106.1099, headingDeg = 180.0, demResult = null }) {
      headingDeg = LuopanPhanKimEngine.normalizeAngle(headingDeg);
      const declination = LuopanPhanKimEngine.calculateDeclination(lat, lng);
      const toaDeg = LuopanPhanKimEngine.normalizeAngle(headingDeg + 180.0);
      const leftDeg = LuopanPhanKimEngine.normalizeAngle(headingDeg - 90.0);
      const rightDeg = LuopanPhanKimEngine.normalizeAngle(headingDeg + 90.0);

      // 1. Phân tích La Kinh Vi Mô
      const pkFacing = LuopanPhanKimEngine.getPhanKim120(headingDeg);
      const tdFacing = LuopanPhanKimEngine.getThauDia72(headingDeg);
      const xsFacing = LuopanPhanKimEngine.getXuyenSon60(headingDeg);
      const mtFacing = LuopanPhanKimEngine.getMountain(headingDeg);
      const steering = LuopanPhanKimEngine.analyzeSteering(headingDeg, declination);

      const pkSitting = LuopanPhanKimEngine.getPhanKim120(toaDeg);
      const tdSitting = LuopanPhanKimEngine.getThauDia72(toaDeg);
      const mtSitting = LuopanPhanKimEngine.getMountain(toaDeg);

      // 2. Bóc tách dữ liệu cao độ thực địa từ DEM
      let centerElev = 18.5;
      let samplesByTier = { tieu: [], trung: [], dai: [] };
      let thuyKhauData = null;
      let laiLongData = null;

      if (demResult && demResult.tiers) {
        centerElev = demResult.center ? demResult.center.elevation : 18.5;
        if (demResult.tiers.tieu && demResult.tiers.tieu.samples) samplesByTier.tieu = demResult.tiers.tieu.samples;
        if (demResult.tiers.trung && demResult.tiers.trung.samples) samplesByTier.trung = demResult.tiers.trung.samples;
        if (demResult.tiers.dai && demResult.tiers.dai.samples) samplesByTier.dai = demResult.tiers.dai.samples;

        const activeTier = demResult.tiers.trung || demResult.tiers.tieu;
        if (activeTier) {
          thuyKhauData = activeTier.thuyKhau;
          laiLongData = activeTier.laiLong;
        }
      } else {
        // Fallback mô phỏng địa hình cục bộ nếu chưa có DEM thực
        samplesByTier.tieu = this._generateSimulatedSamples(centerElev, 30.0);
        samplesByTier.trung = this._generateSimulatedSamples(centerElev, 180.0);
        samplesByTier.dai = this._generateSimulatedSamples(centerElev, 800.0);
        thuyKhauData = {
          bearing: 115.0,
          elevation: centerElev - 2.8,
          distanceM: 180,
          sonThienBan: 'Thìn',
          deltaElev: -2.8
        };
        laiLongData = {
          bearing: 340.0,
          elevation: centerElev + 4.5,
          distanceM: 320,
          son: 'Hợi',
          deltaElev: 4.5
        };
      }

      // 3. Đo lường cao độ theo 4 hướng Tứ Tượng (Relative to Heading)
      const elevFacing = this._getElevationAtBearing(samplesByTier.trung, headingDeg, centerElev);
      const elevSitting = this._getElevationAtBearing(samplesByTier.trung, toaDeg, centerElev);
      const elevLeft = this._getElevationAtBearing(samplesByTier.trung, leftDeg, centerElev);
      const elevRight = this._getElevationAtBearing(samplesByTier.trung, rightDeg, centerElev);

      const deltaSitting = +(elevSitting - centerElev).toFixed(1); // Huyền Vũ
      const deltaFacing = +(elevFacing - centerElev).toFixed(1);   // Chu Tước
      const deltaLeft = +(elevLeft - centerElev).toFixed(1);       // Thanh Long
      const deltaRight = +(elevRight - centerElev).toFixed(1);     // Bạch Hổ

      // 4. Đo lường cao độ theo 4 Phương vị Địa Lý Tuyệt Đối (Bắc, Nam, Đông, Tây)
      const elevNorth = this._getElevationAtBearing(samplesByTier.trung, 0.0, centerElev);
      const elevSouth = this._getElevationAtBearing(samplesByTier.trung, 180.0, centerElev);
      const elevEast = this._getElevationAtBearing(samplesByTier.trung, 90.0, centerElev);
      const elevWest = this._getElevationAtBearing(samplesByTier.trung, 270.0, centerElev);

      // 5. Đánh giá Tứ Tượng Hộ Vệ (Four Celestial Animals)
      const tuTuong = {
        huyenVu: {
          name: "Huyền Vũ (Hậu Tọa Tựa Sơn)",
          bearing: toaDeg,
          mountain: mtSitting.name,
          elevation: elevSitting,
          deltaElev: deltaSitting,
          isDacCach: deltaSitting >= -0.5,
          danhGia: deltaSitting >= 2.0
            ? "ĐẠI CÁT: Tọa sơn cao ráo, gối tựa vững chãi, tàng tụ đại sinh khí."
            : (deltaSitting >= 0.0 ? "CÁT: Hậu trạch có gối tựa bằng phẳng hoặc gò nhẹ, bình hòa vững chắc." : "LƯU Ý: Hậu diện thoái dốc trũng, cần đắp đất tôn nền hoặc tạo hậu viện vững trãi."),
          icon: "⛰️"
        },
        chuTuoc: {
          name: "Chu Tước (Tiền Hướng Minh Đường)",
          bearing: headingDeg,
          mountain: mtFacing.name,
          elevation: elevFacing,
          deltaElev: deltaFacing,
          isDacCach: deltaFacing <= 1.0,
          danhGia: deltaFacing <= -0.5
            ? "ĐẠI CÁT: Minh đường quang đãng, hạ dốc đón quang minh tụ khí, phát tài lộc."
            : (deltaFacing <= 1.5 ? "CÁT: Tiền diện thoai thoải, có án sơn nhẹ phía xa che chắn gió bấc." : "HUNG: Tiền diện bị núi hoặc gò cao áp sát (Bức Bách Sát), khí khó tụ."),
          icon: "🦅"
        },
        thanhLong: {
          name: "Thanh Long (Tả Sa Hộ Vệ)",
          bearing: leftDeg,
          mountain: LuopanPhanKimEngine.getMountain(leftDeg).name,
          elevation: elevLeft,
          deltaElev: deltaLeft,
          isDacCach: deltaLeft >= -1.0,
          danhGia: deltaLeft >= deltaRight
            ? "ĐẠI CÁT: Tả Thanh Long vươn cao ôm bọc Hữu Hổ, quý nhân phò trợ, sự nghiệp hưng thịnh."
            : "BÌNH HÒA: Tả sa thoai thoải, ngang bằng hữu hổ.",
          icon: "🐉"
        },
        bachHo: {
          name: "Bạch Hổ (Hữu Sa Thuần Phục)",
          bearing: rightDeg,
          mountain: LuopanPhanKimEngine.getMountain(rightDeg).name,
          elevation: elevRight,
          deltaElev: deltaRight,
          isDacCach: deltaRight <= deltaLeft + 1.5,
          danhGia: deltaRight <= deltaLeft
            ? "ĐẠI CÁT: Hữu Bạch Hổ thuần phục, không ngẩng đầu lấn át, gia đạo an hòa êm ấm."
            : "LƯU Ý: Bạch Hổ hơi nhô cao (Hổ Khiếu), nên trồng cây xanh hoặc bố trí cảnh quan tĩnh trấn áp.",
          icon: "🐅"
        }
      };

      // 6. Tính toán Chỉ số Tàng Phong Tụ Khí (Wind Enclosure Index - WEI)
      // Tỷ lệ che chở gió hại ở Hậu & Tả Hữu, thông thoáng ở Minh Đường
      let weiPoints = 0;
      if (deltaSitting > 0) weiPoints += 30; else if (deltaSitting >= -0.5) weiPoints += 20;
      if (deltaLeft > 0) weiPoints += 25; else if (deltaLeft >= -0.5) weiPoints += 15;
      if (deltaRight > 0 && deltaRight <= deltaLeft + 1.0) weiPoints += 20; else if (deltaRight >= -0.5) weiPoints += 15;
      if (deltaFacing < deltaSitting) weiPoints += 25; else if (deltaFacing <= centerElev + 1.0) weiPoints += 15;
      const weiPercent = Math.min(Math.max(weiPoints, 20), 98);

      // 7. Tính Toán Đặc Trưng Địa Mạo Vi Mô (TPI & Curvatures)
      const avgTieu = this._computeAverageElevation(samplesByTier.tieu, centerElev);
      const avgTrung = this._computeAverageElevation(samplesByTier.trung, centerElev);
      const tpiMicro = +(centerElev - avgTieu).toFixed(2);  // > 0 là gò, < 0 là trũng
      const tpiMeso = +(centerElev - avgTrung).toFixed(2);

      // Độ cong Profile (Dọc Tọa - Hướng) & Planform (Ngang Tả - Hữu)
      const kProf = +((elevSitting - 2 * centerElev + elevFacing) / 100.0).toFixed(4);
      const kPlan = +((elevLeft - 2 * centerElev + elevRight) / 100.0).toFixed(4);

      // 8. Nhận diện Hình Thái Chân Huyệt Theo Tứ Thế Cổ Điển
      let hinhTheHuyet = {
        loai: "Đột Huyệt (Gò Tròn Nổi Cát Địa)",
        tenHan: "突穴 (Đột)",
        moTa: "Giữa vùng đất bằng phẳng nổi lên một gò tròn cao ráo, tụ sinh khí viên mãn. Thuộc cách 'Bình dương nhất đột thắng vạn sơn', phú quý miên trường.",
        nguHanh: "Kim / Thổ Thế",
        dacDiem: "TPI vi mô dương, khô ráo, cao ráo, không úng ngập.",
        icon: "🌕",
        badgeClass: "green"
      };

      if (kPlan < -0.005 && kProf < -0.005) {
        hinhTheHuyet = {
          loai: "Oa Huyệt (Lòng Chảo Tụ Khí)",
          tenHan: "窝穴 (Oa)",
          moTa: "Huyệt kết ở chỗ lòng chảo tròn thoai thoải, các gờ xung quanh che chắn gió tứ bề. Nước tụ ở giữa đầm ấm, đại cát cho điền trạch và tài lộc.",
          nguHanh: "Thủy / Thổ Thế",
          dacDiem: "Độ cong dọc và ngang đều lõm, tàng phong tụ khí hữu tình.",
          icon: "🥣",
          badgeClass: "green"
        };
      } else if (kPlan < -0.003 && Math.abs(kProf) <= 0.015) {
        hinhTheHuyet = {
          loai: "Kiềm Huyệt (Gọng Kìm Ôm Bọc)",
          tenHan: "钳穴 (Kiềm)",
          moTa: "Hai cánh sa Tả Hữu (Thanh Long - Bạch Hổ) vươn dài ra phía trước như đôi càng cua hoặc gọng kìm ôm ấp minh đường, huyệt nằm an ổn ở tâm kiềm.",
          nguHanh: "Mộc Thế",
          dacDiem: "Hai cánh bảo hộ che chắn gió ngang tuyệt hảo, nhân đinh hưng vượng.",
          icon: "🦀",
          badgeClass: "green"
        };
      } else if (kPlan > 0.003 && deltaFacing < 0.5) {
        hinhTheHuyet = {
          loai: "Nhũ Huyệt (Bầu Buông Sườn Đồi)",
          tenHan: "乳穴 (Nhũ)",
          moTa: "Từ sống núi hoặc gò cao buông rủ xuống một vệt đất tròn trịa như bầu ngực mẹ, sinh khí dồn tụ ở phần đầu nhú, nơi đất bắt đầu thoai thoải mở ra minh đường.",
          nguHanh: "Hỏa / Thổ Thế",
          dacDiem: "Sống gò mạch rõ ràng, dẫn khí trực tiếp từ Lai Long chủ mạch.",
          icon: "⛰️",
          badgeClass: "green"
        };
      } else if (Math.abs(tpiMicro) <= 0.3 && Math.abs(tpiMeso) <= 0.5) {
        hinhTheHuyet = {
          loai: "Bình Dương Chân Huyệt (Đồng Bằng Vi Mạch)",
          tenHan: "平洋穴 (Bình Dương)",
          moTa: "Địa hình đồng bằng bằng phẳng, ứng nghiệm quy luật cổ: 'Cao nhất thốn vi sơn, đê nhất thốn vi thủy'. Mạch khí dẫn chìm, tụ lại nhờ dòng nước ôm bọc.",
          nguHanh: "Thủy / Kim Thế",
          dacDiem: "Bằng phẳng vi tế, trọng ở thế nước bọc và hướng đón vượng khí Vận 9.",
          icon: "🌾",
          badgeClass: "gold"
        };
      }

      // 9. Đánh giá Thế Nước (Quan Thủy & Thủy Khẩu)
      let theNuoc = {
        loai: "Ngọc Đới Hoàn Yêu (Thủy Ôm Bọc)",
        danhGia: "ĐẠI CÁT",
        moTa: "Dòng chảy hoặc điểm tụ nước uốn cong hình đai ngọc ôm lấy Minh Đường phía trước. Khí gặp nước thì dừng lại ('Giới thủy tắc chỉ'), tài lộc tụ hội dồi dào.",
        color: "#10b981",
        isCat: true
      };

      if (thuyKhauData) {
        // Kiểm tra góc lệch giữa Thủy Khẩu và Hướng nhà
        let deltaTkHuong = Math.abs(thuyKhauData.bearing - headingDeg);
        if (deltaTkHuong > 180) deltaTkHuong = 360 - deltaTkHuong;

        if (deltaTkHuong < 30.0) {
          theNuoc = {
            loai: "Trực Xung Thủy (Nước Đâm Thẳng)",
            danhGia: "HUNG",
            moTa: "Thủy khẩu hoặc dòng thoát nước đâm trực diện vào mặt trước trạch đất. Khí chảy xối xả làm tán khí, chủ hao tài.",
            color: "#ef4444",
            isCat: false
          };
        } else if (deltaTkHuong > 150.0) {
          theNuoc = {
            loai: "Hậu Xung Khứ Thủy",
            danhGia: "BÌNH HÒA",
            moTa: "Thoát nước phía sau lưng, cần làm rãnh thoát ngầm uốn lượn để tránh thoát thoái nguyên khí.",
            color: "#f59e0b",
            isCat: true
          };
        } else {
          theNuoc = {
            loai: "Ngọc Đới Hoàn Yêu (Thủy Khẩu Đắc Cách)",
            danhGia: "ĐẠI CÁT",
            moTa: `Thủy Khẩu thoát tại phương ${thuyKhauData.sonThienBan || 'Trũng'} (${thuyKhauData.bearing.toFixed(1)}°), dòng nước uốn cong hữu tình ôm lấy trạch đất.`,
            color: "#10b981",
            isCat: true
          };
        }
      }

      // 10. Chấm Điểm Đa Tiêu Chí Chân Huyệt (SMCE Score)
      let totalScore = 50;
      if (weiPercent >= 80) totalScore += 20; else if (weiPercent >= 65) totalScore += 12;
      if (tuTuong.huyenVu.isDacCach) totalScore += 10;
      if (tuTuong.chuTuoc.isDacCach) totalScore += 10;
      if (tuTuong.thanhLong.isDacCach) totalScore += 5;
      if (tuTuong.bachHo.isDacCach) totalScore += 5;
      if (theNuoc.isCat) totalScore += 10;
      if (pkFacing.tinhChat === 'VUONG' || pkFacing.tinhChat === 'TUONG') totalScore += 10;
      if (pkFacing.tinhChat === 'KHONG_VONG') totalScore -= 25;

      totalScore = Math.min(Math.max(totalScore, 25), 99);

      let xepHangChânHuyet = "CÁT ĐỊA";
      let xepHangClass = "green";
      if (totalScore >= 88) {
        xepHangChânHuyet = "ĐẠI CÁT CHÂN HUYỆT (Tàng Phong Đắc Thủy)";
        xepHangClass = "green";
      } else if (totalScore >= 72) {
        xepHangChânHuyet = "CÁT ĐỊA HỘ VỆ (Vững Gia Đạo)";
        xepHangClass = "green";
      } else if (totalScore >= 55) {
        xepHangChânHuyet = "BÌNH HÒA TRẠCH (Cần Vi Điều Chỉnh)";
        xepHangClass = "gold";
      } else {
        xepHangChânHuyet = "TIẾT KHÍ / PHẠM SÁT (Cần Chấn Chỉnh)";
        xepHangClass = "warn";
      }

      return {
        coords: { lat, lng },
        headingDeg,
        toaDeg,
        declination,
        centerElev,
        tuTuong,
        weiPercent,
        tpi: {
          micro: tpiMicro,
          meso: tpiMeso,
          kProf,
          kPlan
        },
        hinhTheHuyet,
        theNuoc,
        laiLong: laiLongData,
        thuyKhau: thuyKhauData,
        score: totalScore,
        xepHang: xepHangChânHuyet,
        xepHangClass,
        luopan: {
          facing: {
            mountain: mtFacing,
            phanKim: pkFacing,
            thauDia: tdFacing,
            xuyenSon: xsFacing
          },
          sitting: {
            mountain: mtSitting,
            phanKim: pkSitting,
            thauDia: tdSitting
          },
          steering
        }
      };
    }

    /**
     * Tự động quét DEM và phân tích toàn diện
     */
    static async scanAndAnalyze(lat, lng, headingDeg) {
      let demResult = null;
      if (global.NetaLaKinhEngine && typeof global.NetaLaKinhEngine.analyzeMinhDuongCuc === 'function') {
        try {
          demResult = await global.NetaLaKinhEngine.analyzeMinhDuongCuc(lat, lng);
        } catch (e) {
          console.warn('Lỗi gọi analyzeMinhDuongCuc, sử dụng mô phỏng:', e);
        }
      }
      return this.analyzeLoanDau({ lat, lng, headingDeg, demResult });
    }

    // Helper: Tìm cao độ tại góc phương vị gần nhất
    static _getElevationAtBearing(samples, targetBrg, fallback) {
      if (!samples || samples.length === 0) return fallback;
      targetBrg = LuopanPhanKimEngine.normalizeAngle(targetBrg);

      let closest = samples[0];
      let minDiff = 360.0;

      for (const s of samples) {
        let diff = Math.abs(s.bearing - targetBrg);
        if (diff > 180) diff = 360 - diff;
        if (diff < minDiff) {
          minDiff = diff;
          closest = s;
        }
      }
      return closest && typeof closest.elevation === 'number' ? closest.elevation : fallback;
    }

    // Helper: Tính trung bình cao độ
    static _computeAverageElevation(samples, fallback) {
      if (!samples || samples.length === 0) return fallback;
      const valid = samples.filter(s => typeof s.elevation === 'number');
      if (valid.length === 0) return fallback;
      const sum = valid.reduce((acc, cur) => acc + cur.elevation, 0);
      return +(sum / valid.length).toFixed(2);
    }

    // Helper: Sinh mẫu mô phỏng khi offline
    static _generateSimulatedSamples(centerElev, radiusM) {
      const list = [];
      for (let i = 0; i < 24; i++) {
        const brg = i * 15.0;
        const rad = (brg * Math.PI) / 180.0;
        // Mô phỏng Huyền Vũ cao hơn phía Bắc, Chu Tước thoải hơn phía Nam
        const elev = centerElev + Math.cos(rad) * 2.2 + Math.sin(rad * 2) * 0.8;
        list.push({
          bearing: brg,
          distanceM: radiusM,
          elevation: +elev.toFixed(1)
        });
      }
      return list;
    }
  }

  // Export engine ra global window & module exports
  global.LuopanPhanKimEngine = LuopanPhanKimEngine;
  global.TamLongDiemHuyetEngine = TamLongDiemHuyetEngine;
  global.TamLongEngine = TamLongDiemHuyetEngine;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      LuopanPhanKimEngine,
      TamLongDiemHuyetEngine,
      TamLongEngine: TamLongDiemHuyetEngine
    };
  }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis));
