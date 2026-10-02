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
  // 2. BẢNG 24 SƠN HƯỚNG & QUY CHIẾU LẬP CỰC (TAM NGUYÊN LONG & ÂM DƯƠNG CHUẨN)
  // ===========================================================================
  // Mỗi hướng gồm 3 Sơn: Sơn 1 (Địa Nguyên Long), Sơn 2 (Thiên Nguyên Long), Sơn 3 (Nhân Nguyên Long)
  // Dấu Âm Dương: +1 (Dương - Bay Thuận), -1 (Âm - Bay Nghịch)
  const SON_24_TABLE = [
    { name: "Tý", cung: "Khảm", cungId: "N", hanh: "Thuỷ", deg: 0, toa: "Ngọ", quai: 1, long: 2, long_name: "Thiên", sign: -1, am_duong: "Âm" },
    { name: "Quý", cung: "Khảm", cungId: "N", hanh: "Thuỷ", deg: 15, toa: "Đinh", quai: 1, long: 3, long_name: "Nhân", sign: -1, am_duong: "Âm" },
    { name: "Sửu", cung: "Cấn", cungId: "NE", hanh: "Thổ", deg: 30, toa: "Mùi", quai: 8, long: 1, long_name: "Địa", sign: -1, am_duong: "Âm" },
    { name: "Cấn", cung: "Cấn", cungId: "NE", hanh: "Thổ", deg: 45, toa: "Khôn", quai: 8, long: 2, long_name: "Thiên", sign: 1, am_duong: "Dương" },
    { name: "Dần", cung: "Cấn", cungId: "NE", hanh: "Mộc", deg: 60, toa: "Thân", quai: 8, long: 3, long_name: "Nhân", sign: 1, am_duong: "Dương" },
    { name: "Giáp", cung: "Chấn", cungId: "E", hanh: "Mộc", deg: 75, toa: "Canh", quai: 3, long: 1, long_name: "Địa", sign: 1, am_duong: "Dương" },
    { name: "Mão", cung: "Chấn", cungId: "E", hanh: "Mộc", deg: 90, toa: "Dậu", quai: 3, long: 2, long_name: "Thiên", sign: -1, am_duong: "Âm" },
    { name: "Ất", cung: "Chấn", cungId: "E", hanh: "Mộc", deg: 105, toa: "Tân", quai: 3, long: 3, long_name: "Nhân", sign: -1, am_duong: "Âm" },
    { name: "Thìn", cung: "Tốn", cungId: "SE", hanh: "Thổ", deg: 120, toa: "Tuất", quai: 4, long: 1, long_name: "Địa", sign: -1, am_duong: "Âm" },
    { name: "Tốn", cung: "Tốn", cungId: "SE", hanh: "Mộc", deg: 135, toa: "Càn", quai: 4, long: 2, long_name: "Thiên", sign: 1, am_duong: "Dương" },
    { name: "Tỵ", cung: "Tốn", cungId: "SE", hanh: "Hoả", deg: 150, toa: "Hợi", quai: 4, long: 3, long_name: "Nhân", sign: 1, am_duong: "Dương" },
    { name: "Bính", cung: "Ly", cungId: "S", hanh: "Hoả", deg: 165, toa: "Nhâm", quai: 9, long: 1, long_name: "Địa", sign: 1, am_duong: "Dương" },
    { name: "Ngọ", cung: "Ly", cungId: "S", hanh: "Hoả", deg: 180, toa: "Tý", quai: 9, long: 2, long_name: "Thiên", sign: -1, am_duong: "Âm" },
    { name: "Đinh", cung: "Ly", cungId: "S", hanh: "Hoả", deg: 195, toa: "Quý", quai: 9, long: 3, long_name: "Nhân", sign: -1, am_duong: "Âm" },
    { name: "Mùi", cung: "Khôn", cungId: "SW", hanh: "Thổ", deg: 210, toa: "Sửu", quai: 2, long: 1, long_name: "Địa", sign: -1, am_duong: "Âm" },
    { name: "Khôn", cung: "Khôn", cungId: "SW", hanh: "Thổ", deg: 225, toa: "Cấn", quai: 2, long: 2, long_name: "Thiên", sign: 1, am_duong: "Dương" },
    { name: "Thân", cung: "Khôn", cungId: "SW", hanh: "Kim", deg: 240, toa: "Dần", quai: 2, long: 3, long_name: "Nhân", sign: 1, am_duong: "Dương" },
    { name: "Canh", cung: "Đoài", cungId: "W", hanh: "Kim", deg: 255, toa: "Giáp", quai: 7, long: 1, long_name: "Địa", sign: 1, am_duong: "Dương" },
    { name: "Dậu", cung: "Đoài", cungId: "W", hanh: "Kim", deg: 270, toa: "Mão", quai: 7, long: 2, long_name: "Thiên", sign: -1, am_duong: "Âm" },
    { name: "Tân", cung: "Đoài", cungId: "W", hanh: "Kim", deg: 285, toa: "Ất", quai: 7, long: 3, long_name: "Nhân", sign: -1, am_duong: "Âm" },
    { name: "Tuất", cung: "Càn", cungId: "NW", hanh: "Thổ", deg: 300, toa: "Thìn", quai: 6, long: 1, long_name: "Địa", sign: -1, am_duong: "Âm" },
    { name: "Càn", cung: "Càn", cungId: "NW", hanh: "Kim", deg: 315, toa: "Tốn", quai: 6, long: 2, long_name: "Thiên", sign: 1, am_duong: "Dương" },
    { name: "Hợi", cung: "Càn", cungId: "NW", hanh: "Thuỷ", deg: 330, toa: "Tỵ", quai: 6, long: 3, long_name: "Nhân", sign: 1, am_duong: "Dương" },
    { name: "Nhâm", cung: "Khảm", cungId: "N", hanh: "Thuỷ", deg: 345, toa: "Bính", quai: 1, long: 1, long_name: "Địa", sign: 1, am_duong: "Dương" }
  ];

  function getSonInfo(deg) {
    const norm = (deg % 360 + 360) % 360;
    for (const s of SON_24_TABLE) {
      const diff = ((norm - s.deg + 180) % 360 + 360) % 360 - 180;
      if (diff >= -7.5 && diff < 7.5) {
        return s;
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
    tieu: {
      key: 'tieu',
      name: 'Tiểu Minh Đường',
      rangeLabel: '20m – 40m',
      rangeMinM: 20,
      rangeMaxM: 40,
      radiusM: 40,
      rings: [20, 30, 40], // Quét 3 vành cự ly trong dải không gian [20m, 40m]
      samplesPerRing: 12,
      color: '#38bdf8'
    },
    trung: {
      key: 'trung',
      name: 'Trung Minh Đường',
      rangeLabel: '40m – 350m',
      rangeMinM: 40,
      rangeMaxM: 350,
      radiusM: 350,
      rings: [80, 160, 250, 350], // Quét 4 vành cự ly trong dải không gian [40m, 350m]
      samplesPerRing: 12,
      color: '#fbbf24'
    },
    dai: {
      key: 'dai',
      name: 'Đại Minh Đường',
      rangeLabel: '350m – 2000m',
      rangeMinM: 350,
      rangeMaxM: 2000,
      radiusM: 2000,
      rings: [600, 1000, 1500, 2000], // Quét 4 vành cự ly trong dải không gian [350m, 2000m]
      samplesPerRing: 12,
      color: '#f43f5e'
    }
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
      const rings = cfg.rings || [cfg.radiusM];
      const samplesPerRing = cfg.samplesPerRing || 12;
      const step = 360.0 / samplesPerRing;

      rings.forEach(rDist => {
        for (let i = 0; i < samplesPerRing; i++) {
          const brg = i * step;
          const pt = getDestinationPoint(centerLat, centerLng, rDist, brg);
          const sonDiaBan = getSonInfo(brg);
          const sonThienBan = getThienBanSon(brg);
          samplesMap[key].push({
            bearing: Math.round(brg * 10) / 10,
            distanceM: rDist,
            lat: pt.lat,
            lng: pt.lng,
            son: sonDiaBan.name,
            cung: sonDiaBan.cung,
            hanh: sonDiaBan.hanh,
            sonThienBan: sonThienBan.name,
            songSon: sonThienBan.songSon
          });
          allPoints.push(pt);
        }
      });
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
        rangeLabel: cfg.rangeLabel,
        rangeMinM: cfg.rangeMinM,
        rangeMaxM: cfg.rangeMaxM,
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
  // 6. HUYỀN KHÔNG PHI TINH CHÍNH TÔNG (TAM NGUYÊN CỬU VẬN - THẨM THỊ HUYỀN KHÔNG)
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

  // Thứ tự 9 cung theo đường Lường Thiên Xích (quỹ đạo Lạc Thư phi tinh)
  const FLYING_PATH_IDS = ['C', 'NW', 'W', 'NE', 'S', 'N', 'SW', 'E', 'SE'];

  // Ánh xạ số Lạc Thư sang Cung vị tương ứng
  const STAR_TO_PALACE = {
    1: 'N',
    2: 'SW',
    3: 'E',
    4: 'SE',
    6: 'NW',
    7: 'W',
    8: 'NE',
    9: 'S'
  };

  /**
   * Xác định chiều bay (Thuận +1 hoặc Nghịch -1) cho Tọa Tinh hoặc Hướng Tinh khi nhập Trung Cung
   * Chuẩn mực Thẩm Thị Huyền Không Học cho TOÀN BỘ 9 VẬN (Tam Nguyên Cửu Vận 1 - 9)
   * @param {number} star - Số sao nhập trung cung (1-9)
   * @param {number} longIdx - Thứ tự Nguyên Long (1: Địa, 2: Thiên, 3: Nhân)
   * @param {number} currentPeriod - Vận hiện tại (1-9)
   * @param {string} sonCungId - Cung vị của Sơn tọa hoặc Sơn hướng
   */
  function getFlyDirection(star, longIdx, currentPeriod, sonCungId) {
    if (star !== 5) {
      // Với các sao 1, 2, 3, 4, 6, 7, 8, 9:
      // Tìm về Cung gốc Lạc Thư của sao đó, lấy Sơn cùng Nguyên Long để định Âm/Dương
      const palaceId = STAR_TO_PALACE[star];
      const matchingSon = SON_24_TABLE.find(s => s.cungId === palaceId && s.long === longIdx);
      return matchingSon ? matchingSon.sign : 1;
    } else {
      // Với sao số 5 (Ngũ Hoàng) nhập Trung Cung:
      // Trong Thẩm Thị Huyền Không, sao 5 ở Trung Cung không có 24 sơn riêng,
      // nên mượn tính chất của Cung vị mà sao 5 đang đóng trên Vận bàn của Vận đó:
      // - Vận lẻ (1, 3, 7, 9): Sao 5 đóng tại các cung Tứ Chánh (Ly, Đoài, Chấn, Khảm) -> Sơn 1 bay Thuận (+1), Sơn 2/3 bay Nghịch (-1)
      // - Vận chẵn (2, 4, 6, 8): Sao 5 đóng tại các cung Tứ Duy (Cấn, Càn, Tốn, Khôn) -> Sơn 1 bay Nghịch (-1), Sơn 2/3 bay Thuận (+1)
      // - Vận 5: Sao 5 ở Trung Cung Vận bàn -> lấy theo chính Cung vị của Sơn Tọa / Hướng đó
      const k5 = ((5 - currentPeriod) % 9 + 9) % 9;
      const palace5 = FLYING_PATH_IDS[k5] || 'C';
      const targetPalace = (palace5 === 'C' && sonCungId) ? sonCungId : palace5;
      const matchingSon = SON_24_TABLE.find(s => s.cungId === targetPalace && s.long === longIdx);
      return matchingSon ? matchingSon.sign : (longIdx === 1 ? 1 : -1);
    }
  }

  // Danh sách 16 Tinh Bàn chuẩn mực (Tam Nguyên Cửu Vận)
  // Mỗi hướng gồm 2 tinh bàn: Sơn 1 (Địa Nguyên Long) và Sơn 2/3 (Thiên/Nhân Nguyên Long)
  const TINH_BAN_16_LIST = [
    { index: 1,  id: "nam_1",       name: "1. Hướng Nam 1",      deg: 165, cung: "S",  sons: "Bính",       group: "1" },
    { index: 2,  id: "nam_2_3",     name: "2. Hướng Nam 2/3",    deg: 180, cung: "S",  sons: "Ngọ, Đinh",   group: "2/3" },
    { index: 3,  id: "taynam_1",    name: "3. Hướng Tây Nam 1",  deg: 210, cung: "SW", sons: "Mùi",        group: "1" },
    { index: 4,  id: "taynam_2_3",  name: "4. Hướng Tây Nam 2/3",deg: 225, cung: "SW", sons: "Khôn, Thân", group: "2/3" },
    { index: 5,  id: "tay_1",       name: "5. Hướng Tây 1",      deg: 255, cung: "W",  sons: "Canh",       group: "1" },
    { index: 6,  id: "tay_2_3",     name: "6. Hướng Tây 2/3",    deg: 270, cung: "W",  sons: "Dậu, Tân",   group: "2/3" },
    { index: 7,  id: "taybac_1",    name: "7. Hướng Tây Bắc 1",  deg: 300, cung: "NW", sons: "Tuất",       group: "1" },
    { index: 8,  id: "taybac_2_3",  name: "8. Hướng Tây Bắc 2/3",deg: 315, cung: "NW", sons: "Càn, Hợi",   group: "2/3" },
    { index: 9,  id: "bac_1",       name: "9. Hướng Bắc 1",      deg: 345, cung: "N",  sons: "Nhâm",       group: "1" },
    { index: 10, id: "bac_2_3",     name: "10. Hướng Bắc 2/3",   deg: 0,   cung: "N",  sons: "Tý, Quý",    group: "2/3" },
    { index: 11, id: "dongbac_1",   name: "11. Hướng Đông Bắc 1",deg: 30,  cung: "NE", sons: "Sửu",        group: "1" },
    { index: 12, id: "dongbac_2_3", name: "12. Hướng Đông Bắc 2/3",deg: 45,cung: "NE", sons: "Cấn, Dần",   group: "2/3" },
    { index: 13, id: "dong_1",      name: "13. Hướng Đông 1",     deg: 75,  cung: "E",  sons: "Giáp",       group: "1" },
    { index: 14, id: "dong_2_3",    name: "14. Hướng Đông 2/3",   deg: 90,  cung: "E",  sons: "Mão, Ất",    group: "2/3" },
    { index: 15, id: "dongnam_1",   name: "15. Hướng Đông Nam 1", deg: 120, cung: "SE", sons: "Thìn",       group: "1" },
    { index: 16, id: "dongnam_2_3", name: "16. Hướng Đông Nam 2/3",deg: 135,cung: "SE", sons: "Tốn, Tị",    group: "2/3" }
  ];

  // 8 hướng theo chiều kim đồng hồ để xoay đồ hình theo Hướng nhà
  const CW_PALACE_DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const PALACE_NAME_MAP = {
    'N': 'Chính Bắc (Khảm)',
    'NE': 'Đông Bắc (Cấn)',
    'E': 'Chính Đông (Chấn)',
    'SE': 'Đông Nam (Tốn)',
    'S': 'Chính Nam (Ly)',
    'SW': 'Tây Nam (Khôn)',
    'W': 'Chính Tây (Đoài)',
    'NW': 'Tây Bắc (Càn)',
    'C': 'Trung Cung (Thiên Tâm)'
  };

  /**
   * Tạo lưới 3x3 định hướng theo HƯỚNG NHÀ (Hàng trên là Hướng, hàng dưới là Tọa)
   * Chuẩn mực bảng tra phong thủy kinh điển
   */
  function getOrientedGridIds(facingPalace) {
    const idx = CW_PALACE_DIRS.indexOf(facingPalace);
    if (idx === -1) return [
      ['NW', 'N', 'NE'],
      ['W',  'C', 'E'],
      ['SW', 'S', 'SE']
    ];
    return [
      [CW_PALACE_DIRS[(idx - 1 + 8) % 8], CW_PALACE_DIRS[idx], CW_PALACE_DIRS[(idx + 1) % 8]],
      [CW_PALACE_DIRS[(idx - 2 + 8) % 8], 'C',                 CW_PALACE_DIRS[(idx + 2) % 8]],
      [CW_PALACE_DIRS[(idx - 3 + 8) % 8], CW_PALACE_DIRS[(idx + 4) % 8], CW_PALACE_DIRS[(idx + 3) % 8]]
    ];
  }

  function generateHuyenKhongMatrix(facingDeg, period = 9) {
    const sonFacing = getSonInfo(facingDeg);
    const toaDeg = (facingDeg + 180) % 360;
    const sonToa = getSonInfo(toaDeg);

    // 1. Lập Vận Tinh Bàn (Luôn bay thuận theo Lường Thiên Xích từ số Vận)
    const vanMap = {};
    FLYING_PATH_IDS.forEach((id, k) => {
      vanMap[id] = ((period - 1 + k) % 9) + 1;
    });

    // 2. Tọa Tinh (Sơn Tinh) và Hướng Tinh nhập Trung Cung
    const mountainCenterStar = vanMap[sonToa.cungId];
    const facingCenterStar = vanMap[sonFacing.cungId];

    // 3. Xác định chiều bay (Thuận +1 hoặc Nghịch -1)
    const mountainFlyDir = getFlyDirection(mountainCenterStar, sonToa.long, period, sonToa.cungId);
    const facingFlyDir = getFlyDirection(facingCenterStar, sonFacing.long, period, sonFacing.cungId);

    // 4. Phi tinh cho 9 Cung
    const mountainMap = {};
    const facingMap = {};
    FLYING_PATH_IDS.forEach((id, k) => {
      if (mountainFlyDir === 1) {
        mountainMap[id] = ((mountainCenterStar - 1 + k) % 9) + 1;
      } else {
        mountainMap[id] = ((mountainCenterStar - 1 - k + 81) % 9) + 1;
      }

      if (facingFlyDir === 1) {
        facingMap[id] = ((facingCenterStar - 1 + k) % 9) + 1;
      } else {
        facingMap[id] = ((facingCenterStar - 1 - k + 81) % 9) + 1;
      }
    });

    // 5. Xác định Tinh Bàn chuẩn trong danh mục 16 Tinh Bàn
    const groupKey = sonFacing.long === 1 ? "1" : "2/3";
    const tinhBanItem = TINH_BAN_16_LIST.find(t => t.cung === sonFacing.cungId && t.group === groupKey) || TINH_BAN_16_LIST[9];

    // 6. Tổng hợp Đồ Hình Định Hướng (HƯỚNG ở hàng trên cùng - Chuẩn Bảng Tra Phong Thủy)
    const orientedIds = getOrientedGridIds(sonFacing.cungId);
    const orientedGrid = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const pId = orientedIds[r][c];
        const isCenter = pId === 'C';
        const mStar = mountainMap[pId];
        const fStar = facingMap[pId];
        const vStar = vanMap[pId];
        orientedGrid.push({
          id: pId,
          name: PALACE_NAME_MAP[pId],
          isCenter: isCenter,
          vanStar: vStar,
          mountainStar: mStar,
          facingStar: fStar,
          isToa: pId === sonToa.cungId,
          isFacing: pId === sonFacing.cungId,
          hasPrimeStar: mStar === period || fStar === period,
          row: r,
          col: c
        });
      }
    }

    // 7. Tổng hợp lưới Địa Bàn Lạc Thư tĩnh (Bắc dưới, Nam trên)
    const geoGrid = LUO_SHU_POSITIONS.map(pos => {
      const isCenter = pos.id === 'C';
      const mStar = mountainMap[pos.id];
      const fStar = facingMap[pos.id];
      const vStar = vanMap[pos.id];

      return {
        id: pos.id,
        name: pos.name,
        quai: pos.quai,
        isCenter: isCenter,
        vanStar: vStar,
        mountainStar: mStar,
        facingStar: fStar,
        isToa: pos.id === sonToa.cungId,
        isFacing: pos.id === sonFacing.cungId,
        hasPrimeStar: mStar === period || fStar === period
      };
    });

    // 8. Phân định Cách Cục Tinh Bàn (4 đại cách cục kinh điển)
    const mAtToa = mountainMap[sonToa.cungId];
    const fAtFacing = facingMap[sonFacing.cungId];
    const mAtFacing = mountainMap[sonFacing.cungId];
    const fAtToa = facingMap[sonToa.cungId];

    let patternCode = 'normal';
    let patternName = 'Thường Cục';
    let patternDesc = 'Bố cục cân bằng, cần phối hợp loan đầu hình thế và công năng mở cửa hợp lý.';

    if (mAtToa === period && fAtFacing === period) {
      patternCode = 'vuong_son_vuong_huong';
      patternName = 'Vượng Sơn Vượng Hướng';
      patternDesc = 'Đinh tài lưỡng đắc: Phía sau cần tọa sơn cao vững, phía trước cần minh đường thoáng đãng có thủy để phát tài đại quý.';
    } else if (mAtToa === period && fAtToa === period) {
      patternCode = 'song_tinh_dao_toa';
      patternName = 'Song Tinh Đáo Tọa';
      patternDesc = 'Vượng đinh tài tụ hậu phương: Sau nhà nên có thủy rồi có sơn (hoặc hồ nước/sân trong rồi tới nhà cao). Tiền phương nên thông thoáng.';
    } else if (mAtFacing === period && fAtFacing === period) {
      patternCode = 'song_tinh_dao_huong';
      patternName = 'Song Tinh Đáo Hướng';
      patternDesc = 'Vượng tài đại phát tiền phương: Mặt tiền trước nhà rất cần tụ thủy (hồ nước, ngã ba, đường rộng) và phía sau thủy có án sơn hoặc nhà cao.';
    } else if (mAtFacing === period && fAtToa === period) {
      patternCode = 'thuong_son_ha_thuy';
      patternName = 'Thượng Sơn Hạ Thủy';
      patternDesc = 'Tổn đinh phá tài (bố cục đảo nghịch): Trước nhà gặp núi cao, sau nhà gặp nước lớn là đại kỵ, cần thiết kế non bộ / tiểu cảnh phong thủy hóa giải.';
    }

    return {
      period: period,
      facingDeg: Math.round(facingDeg * 10) / 10,
      toaDeg: Math.round(toaDeg * 10) / 10,
      sonFacing: sonFacing,
      sonToa: sonToa,
      tinhBanItem: tinhBanItem,
      tinhBanName: tinhBanItem.name,
      groupKey: groupKey,
      mountainCenterStar: mountainCenterStar,
      facingCenterStar: facingCenterStar,
      mountainFlyDir: mountainFlyDir,
      facingFlyDir: facingFlyDir,
      patternCode: patternCode,
      patternName: patternName,
      patternDesc: patternDesc,
      grid: orientedGrid,
      orientedGrid: orientedGrid,
      geoGrid: geoGrid
    };
  }

  // ===========================================================================
  // 7. TRỌNG TÂM THỬA ĐẤT (GREEN'S THEOREM CENTROID)
  // ===========================================================================
  function calculatePolygonCentroid(latlngs) {
    if (!latlngs || latlngs.length < 3) return null;

    const n = latlngs.length;
    const refLat = latlngs[0].lat;
    const refLng = latlngs[0].lng !== undefined ? latlngs[0].lng : latlngs[0].lon;
    const cosLat = Math.cos((refLat * Math.PI) / 180.0);

    let area = 0.0;
    let cEast = 0.0;
    let cNorth = 0.0;

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const lngI = latlngs[i].lng !== undefined ? latlngs[i].lng : latlngs[i].lon;
      const lngJ = latlngs[j].lng !== undefined ? latlngs[j].lng : latlngs[j].lon;
      const xi = (lngI - refLng) * cosLat;
      const yi = latlngs[i].lat - refLat;
      const xj = (lngJ - refLng) * cosLat;
      const yj = latlngs[j].lat - refLat;

      const factor = (xi * yj - xj * yi);
      area += factor;
      cEast += (xi + xj) * factor;
      cNorth += (yi + yj) * factor;
    }

    area = area / 2.0;
    if (Math.abs(area) < 1e-15) {
      const avgLat = latlngs.reduce((s, p) => s + p.lat, 0) / n;
      const avgLng = latlngs.reduce((s, p) => s + (p.lng !== undefined ? p.lng : p.lon), 0) / n;
      return { lat: avgLat, lng: avgLng, areaM2: 0 };
    }

    cEast = cEast / (6.0 * area);
    cNorth = cNorth / (6.0 * area);

    const clat = refLat + cNorth;
    const clng = refLng + (cEast / cosLat);

    // Tính diện tích xấp xỉ ra mét vuông (quy đổi từ độ kinh vĩ tại vĩ độ trung bình)
    const mPerDegLat = 111132.92;
    const mPerDegLng = 111412.84 * cosLat;
    const areaSqM = Math.abs(area) * mPerDegLat * mPerDegLng;

    return {
      lat: clat,
      lng: clng,
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

  // ===========================================================================
  // 7. HUYỀN KHÔNG ĐẠI QUÁI: 64 QUẺ & 384 HÀO VI PHÂN (0.9375°/HÀO)
  // ===========================================================================
  function getHKDQInfo(degree) {
    const rawData = global.HKDQ_CORE_DATA;
    if (!rawData || !rawData.hexagrams) {
      return null;
    }

    let deg = ((parseFloat(degree) % 360) + 360) % 360;
    if (deg === 0) deg = 360.0;

    let matchedQue = null;
    for (const key in rawData.hexagrams) {
      const q = rawData.hexagrams[key];
      const start = q.la_kinh ? q.la_kinh.deg_start : 0;
      const end = q.la_kinh ? q.la_kinh.deg_end : 0;
      if ((deg >= start && deg < end) || (end === 360.0 && deg === 360.0)) {
        matchedQue = q;
        break;
      }
    }

    if (!matchedQue) {
      matchedQue = rawData.hexagrams['Thuần Khôn'] || Object.values(rawData.hexagrams)[0];
    }

    // Xác định Hào vi phân 0.9375° (1 quẻ = 6 hào, mỗi hào = 5.625° / 6 = 0.9375°)
    const degStart = matchedQue.la_kinh ? matchedQue.la_kinh.deg_start : 0;
    const offset = Math.max(0, deg - degStart);
    let slot = Math.floor(offset / 0.9375);
    if (slot > 5) slot = 5;
    if (slot < 0) slot = 0;

    // Nguyên lý Dịch học HKĐQ Vòng 384 Hào Phân Kim La Kinh:
    // "Dương tòng tả biên đoàn đoàn chuyển, Âm tòng hữu lộ thứ đệ phô"
    // - Bán cầu Dương (0° - 180°, Hạ quái Chấn, Ly, Đoài, Càn - Hào Sơ Dương): Quẻ Dương đi THUẬN (Hào 1 -> 6)
    // - Bán cầu Âm (180° - 360°, Hạ quái Tốn, Khảm, Cấn, Khôn - Hào Sơ Âm): Quẻ Âm đi NGHỊCH (Hào 6 -> 1)
    const isDuong = (matchedQue.la_kinh && matchedQue.la_kinh.am_duong)
      ? (matchedQue.la_kinh.am_duong === 'Dương')
      : (degStart < 180.0);

    let hIdx = isDuong ? (slot + 1) : (6 - slot);
    if (hIdx > 6) hIdx = 6;
    if (hIdx < 1) hIdx = 1;

    let selectedHao = null;
    if (matchedQue.haos && matchedQue.haos.length) {
      selectedHao = matchedQue.haos.find(h => h.hao_index === hIdx) || matchedQue.haos[hIdx - 1];
    }

    // Kiểm tra ranh giới Không Vong (<= 0.4° sát mép quẻ)
    const distStart = Math.abs(deg - degStart);
    const distEnd = Math.abs(deg - (matchedQue.la_kinh ? matchedQue.la_kinh.deg_end : 360));
    const distToBoundary = Math.min(distStart, distEnd);
    const isNearBoundary = distToBoundary <= 0.4;

    let tkvInfo = null;
    if (isNearBoundary && rawData.tieu_khong_vong) {
      for (const item of rawData.tieu_khong_vong) {
        const matches = (item.tuyen_do_so || '').match(/(\d+\.?\d*)/);
        if (matches) {
          const tDeg = parseFloat(matches[1]);
          let angularDiff = Math.abs(deg - tDeg) % 360;
          if (angularDiff > 180) angularDiff = 360 - angularDiff;
          if (angularDiff <= 1.0) {
            tkvInfo = item;
            break;
          }
        }
      }
    }

    // Đánh giá Chính Thần / Linh Thần trong Vận 9 (2024 - 2043)
    const qKhi = matchedQue.quai_khi || matchedQue.quai_so || 0;
    const qVan = matchedQue.quai_van || 0;
    const isLinhThan = [1, 2, 3, 4].includes(qVan);
    const isChinhThan = [6, 7, 8, 9].includes(qVan);
    const isDuongVan9 = (qVan === 9);

    let roleName = isDuongVan9 ? "Đương Vận 9" : (isLinhThan ? "Linh Thần" : "Chính Thần");
    let roleAdvice = isDuongVan9
      ? `Quẻ Đương Vận 9 (Khí ${qKhi} • Vận ${qVan}) - TRỰC VẬN ĐẠI PHÁT! Là Chính Thần đương thời tối cao, đắc vượng khí tột đỉnh trong đại vận 2024 - 2043.`
      : (isLinhThan
        ? `Quẻ mang Quái Vận ${qVan} (Khí ${qKhi}) là LINH THẦN của Vận 9. Phương vị này CẦN ĐỘNG KHÍ, mở Cửa, Cổng, kê Bàn làm việc hoặc đặt Hồ cá, Phong thủy luân nạp Thủy chiêu tài đại cát.`
        : `Quẻ mang Quái Vận ${qVan} (Khí ${qKhi}) là CHÍNH THẦN của Vận 9. Phương vị này CẦN YÊN TĨNH, tựa lưng vững chắc (Tọa nhà, Bàn thờ, Giường ngủ, Két sắt), tuyệt đối kỵ nước động.`);

    // Đánh giá Lục Thân của Hào (Khai Môn / Kích Tài)
    let lucThanAdvice = '';
    const lt = selectedHao ? selectedHao.luc_than : '';
    if (lt === 'Thê Tài' || lt === 'Tử Tôn') {
      lucThanAdvice = `Hào ${hIdx} mang ${lt} (${selectedHao.can_chi}): Cực kỳ cát lợi để Khai Môn, đặt Cửa chính/Thành Môn hoặc kích hoạt tài lộc kinh doanh.`;
    } else if (lt === 'Quan Quỷ') {
      lucThanAdvice = `Hào ${hIdx} mang Quan Quỷ (${selectedHao.can_chi}): Kỵ mở Cửa chính, dễ vướng kiện tụng, thị phi, tai ách; chỉ hợp đặt phòng thờ trang nghiêm.`;
    } else if (lt === 'Huynh Đệ') {
      lucThanAdvice = `Hào ${hIdx} mang Huynh Đệ (${selectedHao.can_chi}): Tránh làm cửa chính hoặc nạp tài, chủ về cạnh tranh, hao tán tiền của.`;
    } else if (lt === 'Phụ Mẫu') {
      lucThanAdvice = `Hào ${hIdx} mang Phụ Mẫu (${selectedHao.can_chi}): Chủ về che chở, học vấn, giấy tờ bằng cấp, vững chắc cho gia trạch.`;
    }

    return {
      degree: Math.round(deg * 100) / 100,
      que_name: matchedQue.ten_que,
      ten_chuan_hoa: matchedQue.ten_chuan_hoa,
      quai_khi: qKhi,
      quai_van: qVan,
      quai_so: qKhi, // alias tương thích ngược
      ha_thuong_quai: matchedQue.ha_thuong_quai || '',
      cung_bat_quai: matchedQue.cung_bat_quai,
      ngu_hanh_cung: matchedQue.ngu_hanh_cung,
      cung_phuong_vi: matchedQue.la_kinh ? matchedQue.la_kinh.cung_phuong_vi : '',
      son_24: matchedQue.la_kinh ? matchedQue.la_kinh.son_24 : '',
      deg_range_que: matchedQue.la_kinh ? matchedQue.la_kinh.deg_range : '',
      am_duong: isDuong ? 'Dương' : 'Âm',
      chieu_hao: isDuong ? 'Thuận (1 → 6)' : 'Nghịch (6 → 1)',
      danh_gia_van_9: matchedQue.la_kinh ? matchedQue.la_kinh.danh_gia_van_9 : '',
      tai_ton_info: matchedQue.la_kinh ? matchedQue.la_kinh.tai_ton_info : '',
      nam_phat_mac_dinh: matchedQue.nam_phat_mac_dinh,
      nguoi_phat_mac_dinh: matchedQue.nguoi_phat_mac_dinh,
      haos: matchedQue.haos || [],
      hao_vi_phan: selectedHao ? {
        hao_index: hIdx,
        ten_hao: `Hào ${hIdx}`,
        can_chi: selectedHao.can_chi,
        luc_than: selectedHao.luc_than,
        deg_range: selectedHao.deg_range,
        nam_phat: selectedHao.nam_phat || matchedQue.nam_phat_mac_dinh,
        nguoi_phat: selectedHao.nguoi_phat || matchedQue.nguoi_phat_mac_dinh,
        advice: lucThanAdvice
      } : null,
      van_9_role: {
        role: roleName,
        is_linh_than: isLinhThan,
        is_chinh_than: isChinhThan,
        is_duong_van_9: isDuongVan9,
        quai_khi: qKhi,
        quai_van: qVan,
        quai_so: qKhi,
        advice: roleAdvice
      },
      canh_bao_khong_vong: {
        is_near_boundary: isNearBoundary,
        distance: Math.round(distToBoundary * 1000) / 1000,
        details: tkvInfo
      }
    };
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
    getHKDQInfo,
    SON_24_TABLE,
    THIEN_BAN_24_SON,
    SONG_SON_CUC_MAP,
    MINH_DUONG_CONFIG,
    TINH_BAN_16_LIST
  };

  global.NetaLaKinhEngine = NetaLaKinhEngine;

})(typeof window !== 'undefined' ? window : this);
