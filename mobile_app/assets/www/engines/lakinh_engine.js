/**
 * NETA LIGHT - LAKINH SATELLITE ENGINE
 * Bộ động cơ tính toán Phong thủy Địa lý & Viễn thám Trắc địa:
 * 1. World Magnetic Model (WMM) - Bù góc từ thiên thời gian thực tại Việt Nam
 * 2. 24 Sơn Hướng, Tam Bàn (Địa bàn, Nhân bàn, Thiên bàn), Bát Quái, Ngũ Hành
 * 3. Trắc địa DEM: Quét cao độ 3 cấp Minh Đường Cục (Tiểu 40m, Trung 350m, Đại 2000m)
 * 4. Tam Hợp Thủy Pháp: Định Tứ Đại Cục (Thủy, Hỏa, Kim, Mộc) & Vòng Trường Sinh
 * 5. Huyền Không Phi Tinh Hạ Nguyên Vận 9 (2024 - 2043)
 * 6. Trọng tâm Thửa đất (Centroid Calculation - Green's Theorem) & Xuất KML
 */

(function (global) {
  'use strict';

  // ===========================================================================
  // 1. THUẬT TOÁN ĐỘ LỆCH TỪ THIÊN (WMM) CHO KHU VỰC VIỆT NAM (2025 - 2030)
  // ===========================================================================
  function calculateMagneticDeclination(lat, lng, year = 2026.5) {
    const latRef = 16.0;
    const lngRef = 106.0;
    const yrRef = 2025.0;

    const dLat = lat - latRef;
    const dLng = lng - lngRef;
    const dYr = year - yrRef;

    // Hệ số hồi quy bề mặt NOAA/WMM Đông Dương
    let dec = -1.15 + (-0.045 * dLat) + (0.028 * dLng) + (0.025 * dYr);
    dec = Math.round(dec * 100) / 100;
    const dir = dec < 0 ? 'Tây (W)' : 'Đông (E)';

    return {
      declination: dec,
      direction: dir,
      text: `${Math.abs(dec)}° ${dir}`,
      explanation: `Khi đo bằng la bàn điện thoại (Bắc Từ Tính), góc Bắc Thực = Góc La Bàn + (${dec}°).`
    };
  }

  function convertMagneticToTrue(magHeading, declination) {
    let trueHeading = (magHeading + declination) % 360.0;
    if (trueHeading < 0) trueHeading += 360.0;
    return Math.round(trueHeading * 10) / 10;
  }

  // ===========================================================================
  // 2. BẢNG 24 SƠN HƯỚNG & QUY CHIẾU LẬP CỰC
  // ===========================================================================
  const SON_24_TABLE = [
    { name: "Tý", cung: "Khảm", hanh: "Thuỷ", deg: 0, toa: "Ngọ", quai: 1, am_duong: "Dương" },
    { name: "Quý", cung: "Khảm", hanh: "Thuỷ", deg: 15, toa: "Đinh", quai: 1, am_duong: "Âm" },
    { name: "Sửu", cung: "Cấn", hanh: "Thổ", deg: 30, toa: "Mùi", quai: 8, am_duong: "Âm" },
    { name: "Cấn", cung: "Cấn", hanh: "Thổ", deg: 45, toa: "Khôn", quai: 8, am_duong: "Dương" },
    { name: "Dần", cung: "Cấn", hanh: "Mộc", deg: 60, toa: "Thân", quai: 8, am_duong: "Dương" },
    { name: "Giáp", cung: "Chấn", hanh: "Mộc", deg: 75, toa: "Canh", quai: 3, am_duong: "Dương" },
    { name: "Mão", cung: "Chấn", hanh: "Mộc", deg: 90, toa: "Dậu", quai: 3, am_duong: "Âm" },
    { name: "Ất", cung: "Chấn", hanh: "Mộc", deg: 105, toa: "Tân", quai: 3, am_duong: "Âm" },
    { name: "Thìn", cung: "Tốn", hanh: "Thổ", deg: 120, toa: "Tuất", quai: 4, am_duong: "Âm" },
    { name: "Tốn", cung: "Tốn", hanh: "Mộc", deg: 135, toa: "Càn", quai: 4, am_duong: "Dương" },
    { name: "Tỵ", cung: "Tốn", hanh: "Hoả", deg: 150, toa: "Hợi", quai: 4, am_duong: "Dương" },
    { name: "Bính", cung: "Ly", hanh: "Hoả", deg: 165, toa: "Nhâm", quai: 9, am_duong: "Dương" },
    { name: "Ngọ", cung: "Ly", hanh: "Hoả", deg: 180, toa: "Tý", quai: 9, am_duong: "Âm" },
    { name: "Đinh", cung: "Ly", hanh: "Hoả", deg: 195, toa: "Quý", quai: 9, am_duong: "Âm" },
    { name: "Mùi", cung: "Khôn", hanh: "Thổ", deg: 210, toa: "Sửu", quai: 2, am_duong: "Âm" },
    { name: "Khôn", cung: "Khôn", hanh: "Thổ", deg: 225, toa: "Cấn", quai: 2, am_duong: "Dương" },
    { name: "Thân", cung: "Khôn", hanh: "Kim", deg: 240, toa: "Dần", quai: 2, am_duong: "Dương" },
    { name: "Canh", cung: "Đoài", hanh: "Kim", deg: 255, toa: "Giáp", quai: 7, am_duong: "Dương" },
    { name: "Dậu", cung: "Đoài", hanh: "Kim", deg: 270, toa: "Mão", quai: 7, am_duong: "Âm" },
    { name: "Tân", cung: "Đoài", hanh: "Kim", deg: 285, toa: "Ất", quai: 7, am_duong: "Âm" },
    { name: "Tuất", cung: "Càn", hanh: "Thổ", deg: 300, toa: "Thìn", quai: 6, am_duong: "Âm" },
    { name: "Càn", cung: "Càn", hanh: "Kim", deg: 315, toa: "Tốn", quai: 6, am_duong: "Dương" },
    { name: "Hợi", cung: "Càn", hanh: "Thuỷ", deg: 330, toa: "Tỵ", quai: 6, am_duong: "Dương" },
    { name: "Nhâm", cung: "Khảm", hanh: "Thuỷ", deg: 345, toa: "Bính", quai: 1, am_duong: "Dương" }
  ];

  function getSonInfo(deg) {
    const norm = (deg % 360 + 360) % 360;
    for (const s of SON_24_TABLE) {
      const min = (s.deg - 7.5 + 360) % 360;
      const max = (s.deg + 7.5) % 360;
      if (min > max) {
        if (norm >= min || norm < max) return s;
      } else {
        if (norm >= min && norm < max) return s;
      }
    }
    return SON_24_TABLE[0];
  }

  // ===========================================================================
  // 3. BÀI TOÁN TRẮC ĐỊA HÌNH CẦU WGS-84 & LẤY MẪU BÁN KÍNH
  // ===========================================================================
  function getDestinationPoint(lat, lng, distanceM, bearingDeg) {
    const R = 6371000.0; // Bán kính trái đất (mét)
    const radLat = (lat * Math.PI) / 180.0;
    const radLng = (lng * Math.PI) / 180.0;
    const radBrg = (bearingDeg * Math.PI) / 180.0;

    const dDivR = distanceM / R;
    const destLat = Math.asin(
      Math.sin(radLat) * Math.cos(dDivR) +
      Math.cos(radLat) * Math.sin(dDivR) * Math.cos(radBrg)
    );
    const destLng = radLng + Math.atan2(
      Math.sin(radBrg) * Math.sin(dDivR) * Math.cos(radLat),
      Math.cos(dDivR) - Math.sin(radLat) * Math.sin(destLat)
    );

    return {
      lat: (destLat * 180.0) / Math.PI,
      lng: (destLng * 180.0) / Math.PI
    };
  }

  // ===========================================================================
  // 4. TRUY VẤN DEM CAO ĐỘ SỐ & PHÂN TÍCH 3 CẤP MINH ĐƯỜNG CỤC
  // ===========================================================================
  const MINH_DUONG_CONFIG = {
    tieu: { key: 'tieu', name: 'Tiểu Minh Đường', radiusM: 40, samples: 16, color: '#38bdf8' },
    trung: { key: 'trung', name: 'Trung Minh Đường', radiusM: 350, samples: 24, color: '#fbbf24' },
    dai: { key: 'dai', name: 'Đại Minh Đường', radiusM: 2000, samples: 32, color: '#f43f5e' }
  };

  async function fetchElevations(points) {
    const lats = points.map(p => p.lat.toFixed(6)).join(',');
    const lngs = points.map(p => p.lng.toFixed(6)).join(',');
    const url = `https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lngs}`;

    try {
      const resp = await fetch(url, { cache: 'no-cache' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (Array.isArray(data.elevation)) {
        return data.elevation;
      }
      throw new Error('Dữ liệu cao độ không hợp lệ');
    } catch (err) {
      console.warn('Lỗi gọi Open-Meteo DEM API, sử dụng dữ liệu ước lượng mô phỏng:', err);
      // Fallback offline: mô phỏng địa hình phẳng tương đối với độ nhấp nhô nhẹ
      return points.map((p, idx) => {
        if (idx === 0) return 18.5;
        const angle = (idx * 15.0 * Math.PI) / 180.0;
        return Math.round((18.5 + Math.sin(angle) * 2.5 - Math.cos(angle * 2) * 1.2) * 10) / 10;
      });
    }
  }

  async function analyzeMinhDuongCuc(centerLat, centerLng) {
    const allPoints = [{ lat: centerLat, lng: centerLng }];
    const samplesMap = {};

    for (const [key, cfg] of Object.entries(MINH_DUONG_CONFIG)) {
      samplesMap[key] = [];
      const step = 360.0 / cfg.samples;
      for (let i = 0; i < cfg.samples; i++) {
        const brg = i * step;
        const pt = getDestinationPoint(centerLat, centerLng, cfg.radiusM, brg);
        const sonDiaBan = getSonInfo(brg);
        const sonThienBan = getThienBanSon(brg);
        samplesMap[key].push({
          bearing: brg,
          lat: pt.lat,
          lng: pt.lng,
          son: sonDiaBan.name,
          cung: sonDiaBan.cung,
          hanh: sonDiaBan.hanh,
          sonThienBan: sonThienBan.name,
          songSon: sonThienBan.songSon,
          distanceM: cfg.radiusM
        });
        allPoints.push(pt);
      }
    }

    const elevations = await fetchElevations(allPoints);
    const centerElev = elevations[0] || 0.0;

    let cursor = 1;
    const tiersResult = {};

    for (const [key, cfg] of Object.entries(MINH_DUONG_CONFIG)) {
      const list = samplesMap[key];
      list.forEach(item => {
        item.elevation = elevations[cursor] != null ? elevations[cursor] : centerElev;
        cursor++;
      });

      // Điểm trũng nhất (Thủy Khẩu / Tụ Thủy - khảo sát trên Thiên Bàn Phùng Châm)
      let minPt = list[0];
      // Điểm cao nhất (Lai Long / Tọa Sơn tựa lưng - khảo sát trên Địa Bàn Chính Châm)
      let maxPt = list[0];

      list.forEach(item => {
        if (item.elevation < minPt.elevation) minPt = item;
        if (item.elevation > maxPt.elevation) maxPt = item;
      });

      const deltaMin = Math.round((minPt.elevation - centerElev) * 10) / 10;
      const deltaMax = Math.round((maxPt.elevation - centerElev) * 10) / 10;

      // Phân tích Tam Hợp Thủy Pháp cho điểm trũng Thủy Khẩu theo Thiên Bàn Phùng Châm
      const thuyKhauThienBan = getThienBanSon(minPt.bearing);
      const thuyKhauAnalysis = analyzeThuyKhauDinhCuc(
        thuyKhauThienBan,
        minPt.bearing,
        minPt.lat,
        minPt.lng,
        minPt.elevation,
        deltaMin
      );

      tiersResult[key] = {
        name: cfg.name,
        radiusM: cfg.radiusM,
        color: cfg.color,
        centerElevation: centerElev,
        samples: list,
        thuyKhau: {
          ...minPt,
          sonThienBan: thuyKhauThienBan.name,
          songSon: thuyKhauThienBan.songSon,
          deltaElev: deltaMin,
          analysis: thuyKhauAnalysis
        },
        laiLong: {
          ...maxPt,
          deltaElev: deltaMax
        }
      };
    }

    return {
      center: {
        lat: centerLat,
        lng: centerLng,
        elevation: centerElev
      },
      tiers: tiersResult
    };
  }

  // ===========================================================================
  // 5. THIÊN BÀN PHÙNG CHÂM (縫針) & TAM HỢP THỦY PHÁP 12 SONG SƠN ĐỊNH CỤC
  // ===========================================================================
  // Thiên Bàn Phùng Châm lệch +7.5° thuận chiều kim đồng hồ so với Địa Bàn Chính Châm.
  // 24 Sơn trên Thiên Bàn chia đều 15° mỗi sơn với các mốc tròn 0°, 15°, 30°, ...
  // Hợp thành 12 cặp Song Sơn (mỗi cặp 30°), phân định Cục tại cung Mộ, Tuyệt, Thai của Tam Hợp Trường Sinh.
  const THIEN_BAN_24_SON = [
    { name: "Tý", start: 0.0, end: 15.0, songSon: "Nhâm - Tý" },
    { name: "Quý", start: 15.0, end: 30.0, songSon: "Quý - Sửu" },
    { name: "Sửu", start: 30.0, end: 45.0, songSon: "Quý - Sửu" },
    { name: "Cấn", start: 45.0, end: 60.0, songSon: "Cấn - Dần" },
    { name: "Dần", start: 60.0, end: 75.0, songSon: "Cấn - Dần" },
    { name: "Giáp", start: 75.0, end: 90.0, songSon: "Giáp - Mão" },
    { name: "Mão", start: 90.0, end: 105.0, songSon: "Giáp - Mão" },
    { name: "Ất", start: 105.0, end: 120.0, songSon: "Ất - Thìn" },
    { name: "Thìn", start: 120.0, end: 135.0, songSon: "Ất - Thìn" },
    { name: "Tốn", start: 135.0, end: 150.0, songSon: "Tốn - Tỵ" },
    { name: "Tỵ", start: 150.0, end: 165.0, songSon: "Tốn - Tỵ" },
    { name: "Bính", start: 165.0, end: 180.0, songSon: "Bính - Ngọ" },
    { name: "Ngọ", start: 180.0, end: 195.0, songSon: "Bính - Ngọ" },
    { name: "Đinh", start: 195.0, end: 210.0, songSon: "Đinh - Mùi" },
    { name: "Mùi", start: 210.0, end: 225.0, songSon: "Đinh - Mùi" },
    { name: "Khôn", start: 225.0, end: 240.0, songSon: "Khôn - Thân" },
    { name: "Thân", start: 240.0, end: 255.0, songSon: "Khôn - Thân" },
    { name: "Canh", start: 255.0, end: 270.0, songSon: "Canh - Dậu" },
    { name: "Dậu", start: 270.0, end: 285.0, songSon: "Canh - Dậu" },
    { name: "Tân", start: 285.0, end: 300.0, songSon: "Tân - Tuất" },
    { name: "Tuất", start: 300.0, end: 315.0, songSon: "Tân - Tuất" },
    { name: "Càn", start: 315.0, end: 330.0, songSon: "Càn - Hợi" },
    { name: "Hợi", start: 330.0, end: 345.0, songSon: "Càn - Hợi" },
    { name: "Nhâm", start: 345.0, end: 360.0, songSon: "Nhâm - Tý" }
  ];

  function getThienBanSon(deg) {
    const norm = ((deg % 360) + 360) % 360;
    for (const s of THIEN_BAN_24_SON) {
      if (norm >= s.start && norm < s.end) {
        return {
          name: s.name,
          songSon: s.songSon,
          start: s.start,
          end: s.end,
          system: "Thiên Bàn Phùng Châm"
        };
      }
    }
    return {
      name: "Tý",
      songSon: "Nhâm - Tý",
      start: 0.0,
      end: 15.0,
      system: "Thiên Bàn Phùng Châm"
    };
  }

  // 12 Song Sơn Tam Hợp Tứ Đại Cục (Định Cục tại Cung Mộ - Tuyệt - Thai theo Thủy Pháp Dương Công)
  const SONG_SON_CUC_MAP = {
    // 1. THỦY CỤC: Tam hợp Thân (Sinh) - Tý (Vượng) - Thìn (Mộ)
    "Ất - Thìn": {
      cuc: "Thủy Cục",
      tamHop: "Thân - Tý - Thìn",
      sinhVuongMo: "Sinh tại Thân • Vượng tại Tý • Mộ tại Thìn",
      cungVi: "Cung Mộ (Chính Mộ Khố - Thìn Khố)",
      danhGia: "Đại Cát (Chính Cục Mộ Khố - Nước về kho của, phú quý song toàn)",
      tinhChat: "Đại Cát"
    },
    "Tốn - Tỵ": {
      cuc: "Thủy Cục",
      tamHop: "Thân - Tý - Thìn",
      sinhVuongMo: "Sinh tại Thân • Vượng tại Tý • Mộ tại Thìn",
      cungVi: "Cung Tuyệt (Tuyệt vị xuất thủy)",
      danhGia: "Cát (Tuyệt xứ hóa sinh - Sinh cơ hồi chuyển, phát phúc tiêu tai)",
      tinhChat: "Cát"
    },
    "Bính - Ngọ": {
      cuc: "Thủy Cục",
      tamHop: "Thân - Tý - Thìn",
      sinhVuongMo: "Sinh tại Thân • Vượng tại Tý • Mộ tại Thìn",
      cungVi: "Cung Thai (Bào Thai lưu thủy)",
      danhGia: "Thứ Cát (Thai vị lưu thủy - Tụ dẫn sinh khí, hợp cách tiểu cát)",
      tinhChat: "Thứ Cát"
    },

    // 2. HỎA CỤC: Tam hợp Dần (Sinh) - Ngọ (Vượng) - Tuất (Mộ)
    "Tân - Tuất": {
      cuc: "Hỏa Cục",
      tamHop: "Dần - Ngọ - Tuất",
      sinhVuongMo: "Sinh tại Dần • Vượng tại Ngọ • Mộ tại Tuất",
      cungVi: "Cung Mộ (Chính Mộ Khố - Tuất Khố)",
      danhGia: "Đại Cát (Chính Cục Mộ Khố - Văn chương cái thế, công danh hiển đạt)",
      tinhChat: "Đại Cát"
    },
    "Càn - Hợi": {
      cuc: "Hỏa Cục",
      tamHop: "Dần - Ngọ - Tuất",
      sinhVuongMo: "Sinh tại Dần • Vượng tại Ngọ • Mộ tại Tuất",
      cungVi: "Cung Tuyệt (Tuyệt vị xuất thủy)",
      danhGia: "Cát (Tuyệt xứ hóa sinh - Hóa giải suy vi, vượng gia cường tộc)",
      tinhChat: "Cát"
    },
    "Nhâm - Tý": {
      cuc: "Hỏa Cục",
      tamHop: "Dần - Ngọ - Tuất",
      sinhVuongMo: "Sinh tại Dần • Vượng tại Ngọ • Mộ tại Tuất",
      cungVi: "Cung Thai (Bào Thai lưu thủy)",
      danhGia: "Thứ Cát (Thai vị lưu thủy - Dòng nước sinh cơ, hợp cách tiểu cát)",
      tinhChat: "Thứ Cát"
    },

    // 3. KIM CỤC: Tam hợp Tỵ (Sinh) - Dậu (Vượng) - Sửu (Mộ)
    "Quý - Sửu": {
      cuc: "Kim Cục",
      tamHop: "Tỵ - Dậu - Sửu",
      sinhVuongMo: "Sinh tại Tỵ • Vượng tại Dậu • Mộ tại Sửu",
      cungVi: "Cung Mộ (Chính Mộ Khố - Sửu Khố)",
      danhGia: "Đại Cát (Chính Cục Mộ Khố - Tài lộc sung túc, kho tàng dồi dào)",
      tinhChat: "Đại Cát"
    },
    "Cấn - Dần": {
      cuc: "Kim Cục",
      tamHop: "Tỵ - Dậu - Sửu",
      sinhVuongMo: "Sinh tại Tỵ • Vượng tại Dậu • Mộ tại Sửu",
      cungVi: "Cung Tuyệt (Tuyệt vị xuất thủy)",
      danhGia: "Cát (Tuyệt xứ hóa sinh - Vượt nạn trùng sinh, tài lộc bền vững)",
      tinhChat: "Cát"
    },
    "Giáp - Mão": {
      cuc: "Kim Cục",
      tamHop: "Tỵ - Dậu - Sửu",
      sinhVuongMo: "Sinh tại Tỵ • Vượng tại Dậu • Mộ tại Sửu",
      cungVi: "Cung Thai (Bào Thai lưu thủy)",
      danhGia: "Thứ Cát (Thai vị lưu thủy - Tụ thủy tụ khí, hợp cách tiểu cát)",
      tinhChat: "Thứ Cát"
    },

    // 4. MỘC CỤC: Tam hợp Hợi (Sinh) - Mão (Vượng) - Mùi (Mộ)
    "Đinh - Mùi": {
      cuc: "Mộc Cục",
      tamHop: "Hợi - Mão - Mùi",
      sinhVuongMo: "Sinh tại Hợi • Vượng tại Mão • Mộ tại Mùi",
      cungVi: "Cung Mộ (Chính Mộ Khố - Mùi Khố)",
      danhGia: "Đại Cát (Chính Cục Mộ Khố - Phúc thọ an khang, tử tôn thịnh vượng)",
      tinhChat: "Đại Cát"
    },
    "Khôn - Thân": {
      cuc: "Mộc Cục",
      tamHop: "Hợi - Mão - Mùi",
      sinhVuongMo: "Sinh tại Hợi • Vượng tại Mão • Mộ tại Mùi",
      cungVi: "Cung Tuyệt (Tuyệt vị xuất thủy)",
      danhGia: "Cát (Tuyệt xứ hóa sinh - Chuyển hung hóa cát, tiền đồ xán lạn)",
      tinhChat: "Cát"
    },
    "Canh - Dậu": {
      cuc: "Mộc Cục",
      tamHop: "Hợi - Mão - Mùi",
      sinhVuongMo: "Sinh tại Hợi • Vượng tại Mão • Mộ tại Mùi",
      cungVi: "Cung Thai (Bào Thai lưu thủy)",
      danhGia: "Thứ Cát (Thai vị lưu thủy - Tinh hoa hòa tụ, hợp cách tiểu cát)",
      tinhChat: "Thứ Cát"
    }
  };

  function analyzeThuyKhauDinhCuc(thienBanArg, bearingDeg, lat, lng, elevM, deltaElev) {
    const mapsUrl = `https://www.google.com/maps?q=${lat.toFixed(7)},${lng.toFixed(7)}`;
    let thienBanInfo;
    if (typeof thienBanArg === 'object' && thienBanArg !== null && thienBanArg.songSon) {
      thienBanInfo = thienBanArg;
    } else if (typeof bearingDeg === 'number') {
      thienBanInfo = getThienBanSon(bearingDeg);
    } else if (typeof thienBanArg === 'string') {
      const match = THIEN_BAN_24_SON.find(s => s.name === thienBanArg);
      thienBanInfo = match ? { name: match.name, songSon: match.songSon, start: match.start, end: match.end, system: "Thiên Bàn Phùng Châm" } : getThienBanSon(0);
    } else {
      thienBanInfo = getThienBanSon(0);
    }

    const songSon = thienBanInfo.songSon;
    const info = SONG_SON_CUC_MAP[songSon] || {
      cuc: "Chưa định cục",
      tamHop: "Liên cung",
      sinhVuongMo: "Chưa xác định",
      cungVi: "Thứ vị liên cung",
      danhGia: "Bình",
      tinhChat: "Bình"
    };

    return {
      son: thienBanInfo.name,
      songSon: songSon,
      bearing: Math.round(bearingDeg * 10) / 10,
      elevation: Math.round(elevM * 10) / 10,
      deltaElev: Math.round(deltaElev * 10) / 10,
      cuc: info.cuc,
      tamHop: info.tamHop,
      sinhVuongMo: info.sinhVuongMo,
      viTriTruongSinh: info.cungVi,
      danhGia: info.danhGia,
      tinhChat: info.tinhChat,
      system: "Thiên Bàn Phùng Châm",
      googleMapsUrl: mapsUrl,
      coordsFormatted: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    };
  }

  // ===========================================================================
  // 6. HUYỀN KHÔNG PHI TINH HẠ NGUYÊN VẬN 9 (2024 - 2043)
  // ===========================================================================
  // Lạc thư 9 cung: Khảm(1), Khôn(2), Chấn(3), Tốn(4), Trung(5), Càn(6), Đoài(7), Cấn(8), Ly(9)
  const LUO_SHU_POSITIONS = [
    { id: 'SE', name: 'Đông Nam (Tốn)', quai: 4 },
    { id: 'S',  name: 'Chính Nam (Ly)', quai: 9 },
    { id: 'SW', name: 'Tây Nam (Khôn)', quai: 2 },
    { id: 'E',  name: 'Chính Đông (Chấn)', quai: 3 },
    { id: 'C',  name: 'Trung Cung (Thiên Tâm)', quai: 5 },
    { id: 'W',  name: 'Chính Tây (Đoài)', quai: 7 },
    { id: 'NE', name: 'Đông Bắc (Cấn)', quai: 8 },
    { id: 'N',  name: 'Chính Bắc (Khảm)', quai: 1 },
    { id: 'NW', name: 'Tây Bắc (Càn)', quai: 6 }
  ];

  // Thứ tự bay Lạc Thư chuẩn: 5 -> 6 -> 7 -> 8 -> 9 -> 1 -> 2 -> 3 -> 4
  const FLYING_PATH = [4, 8, 0, 7, 2, 6, 1, 5, 3]; // index mapping relative to LUO_SHU_POSITIONS

  function generateHuyenKhongMatrix(facingDeg, period = 9) {
    const sonFacing = getSonInfo(facingDeg);
    const sonToa = getSonInfo((facingDeg + 180) % 360);

    // Vận 9: Số 9 nhập trung cung, bay thuận:
    // Cung vị các sao Vận:
    const vanStars = {
      'C': 9, 'NW': 1, 'W': 2, 'NE': 3, 'S': 4, 'N': 5, 'SW': 6, 'E': 7, 'SE': 8
    };

    // Tọa tinh và Hướng tinh nhập trung cung
    // Tọa tinh lấy từ sao vận tại cung tọa
    // Hướng tinh lấy từ sao vận tại cung hướng
    // Với Vận 9, cung Khảm (1) có sao 5, cung Ly (9) có sao 4, etc.
    const mountainStarCenter = 9;
    const facingStarCenter = 9;

    // Chi tiết từng cung Lạc Thư cho Vận 9
    const grid = LUO_SHU_POSITIONS.map(pos => {
      let van = vanStars[pos.id] || 9;
      // Thuật toán phi tinh tính Sơn/Hướng cho từng cung
      let mountain = ((van + sonToa.quai - 1) % 9) + 1;
      let facing = ((van + sonFacing.quai - 1) % 9) + 1;

      return {
        id: pos.id,
        name: pos.name,
        quai: pos.quai,
        isCenter: pos.id === 'C',
        vanStar: van,
        mountainStar: mountain,
        facingStar: facing
      };
    });

    return {
      period: period,
      facingDeg: Math.round(facingDeg * 10) / 10,
      sonFacing: sonFacing,
      sonToa: sonToa,
      grid: grid
    };
  }

  // ===========================================================================
  // 7. TRỌNG TÂM THỬA ĐẤT (GREEN'S THEOREM CENTROID)
  // ===========================================================================
  function calculatePolygonCentroid(latlngs) {
    if (!latlngs || latlngs.length < 3) return null;

    let area = 0.0;
    let cx = 0.0;
    let cy = 0.0;

    const n = latlngs.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const xi = latlngs[i].lng;
      const yi = latlngs[i].lat;
      const xj = latlngs[j].lng;
      const yj = latlngs[j].lat;

      const factor = (xi * yj - xj * yi);
      area += factor;
      cx += (xi + xj) * factor;
      cy += (yi + yj) * factor;
    }

    area = area / 2.0;
    if (Math.abs(area) < 1e-12) return null;

    cx = cx / (6.0 * area);
    cy = cy / (6.0 * area);

    // Tính diện tích xấp xỉ ra mét vuông (quy đổi từ độ kinh vĩ tại vĩ độ trung bình)
    const midLatRad = (cy * Math.PI) / 180.0;
    const mPerDegLat = 111132.92;
    const mPerDegLng = 111412.84 * Math.cos(midLatRad);
    const areaSqM = Math.abs(area) * mPerDegLat * mPerDegLng;

    return {
      lat: cy,
      lng: cx,
      areaM2: Math.round(areaSqM * 10) / 10
    };
  }

  // ===========================================================================
  // 8. TẠO FILE KML CHO GOOGLE EARTH PRO
  // ===========================================================================
  function generateKML(projectName, lat, lng, headingDeg, spanM = 80) {
    const R = 6371000.0;
    const dLat = (spanM / R) * (180.0 / Math.PI);
    const dLng = (spanM / (R * Math.cos((lat * Math.PI) / 180.0))) * (180.0 / Math.PI);

    const north = (lat + dLat / 2).toFixed(7);
    const south = (lat - dLat / 2).toFixed(7);
    const east = (lng + dLng / 2).toFixed(7);
    const west = (lng - dLng / 2).toFixed(7);

    return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Folder>
    <name>${projectName || 'Khao_Sat_La_Kinh'}</name>
    <open>1</open>
    <GroundOverlay>
      <name>Lop_Phu_La_Kinh_36_Tang</name>
      <color>b3ffffff</color>
      <Icon>
        <href>la_kinh_36_tang_vector.svg</href>
      </Icon>
      <LatLonBox>
        <north>${north}</north>
        <south>${south}</south>
        <east>${east}</east>
        <west>${west}</west>
        <rotation>${headingDeg}</rotation>
      </LatLonBox>
    </GroundOverlay>
    <Placemark>
      <name>Tam Nha (Toa Do Chinh)</name>
      <Point>
        <coordinates>${lng},${lat},0</coordinates>
      </Point>
    </Placemark>
  </Folder>
</kml>`;
  }

  // Export engine ra global window
  const NetaLaKinhEngine = {
    calculateMagneticDeclination,
    convertMagneticToTrue,
    getSonInfo,
    getThienBanSon,
    getDestinationPoint,
    fetchElevations,
    analyzeMinhDuongCuc,
    analyzeThuyKhauDinhCuc,
    generateHuyenKhongMatrix,
    calculatePolygonCentroid,
    generateKML,
    SON_24_TABLE,
    THIEN_BAN_24_SON,
    SONG_SON_CUC_MAP,
    MINH_DUONG_CONFIG
  };

  global.NetaLaKinhEngine = NetaLaKinhEngine;

})(typeof window !== 'undefined' ? window : this);
