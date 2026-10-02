/**
 * NETA LIGHT - ĐỊA CHÍNH & SỔ ĐỎ ENGINE (engines/diachinh_engine.js)
 * Động Cơ Trắc Địa Chuyển Đổi Tọa Độ VN-2000 Sang WGS-84 Toàn Cầu
 * Thuật toán Gauss-Krüger / UTM múi 3° (k0 = 0.9999), 7 tham số Bursa-Wolf (EPSG 9606),
 * Thuật toán Bowring giải mã vĩ độ/kinh độ không lặp, CSDL 63 Tỉnh Thành (TT 25/2014/TT-BTNMT)
 * 100% Thuần JavaScript - Chạy Offline không phụ thuộc thư viện ngoài.
 */

(function (global) {
  'use strict';

  // ==========================================
  // 1. CSDL 63 TỈNH THÀNH & KINH TUYẾN TRỤC (THÔNG TƯ 25/2014/TT-BTNMT)
  // ==========================================
  const PROVINCES_DATA = {
    "Hà Nội": { cm: 105.0, dms: "105°00'" },
    "Hồ Chí Minh": { cm: 105.75, dms: "105°45'" },
    "Đà Nẵng": { cm: 107.75, dms: "107°45'" },
    "Hải Phòng": { cm: 105.75, dms: "105°45'" },
    "Cần Thơ": { cm: 105.0, dms: "105°00'" },
    "An Giang": { cm: 104.5, dms: "104°30'" },
    "Bà Rịa - Vũng Tàu": { cm: 107.0, dms: "107°00'" },
    "Bắc Giang": { cm: 107.0, dms: "107°00'" },
    "Bắc Kạn": { cm: 106.5, dms: "106°30'" },
    "Bạc Liêu": { cm: 105.0, dms: "105°00'" },
    "Bắc Ninh": { cm: 105.5, dms: "105°30'" },
    "Bến Tre": { cm: 106.0, dms: "106°00'" },
    "Bình Định": { cm: 108.25, dms: "108°15'" },
    "Bình Dương": { cm: 105.75, dms: "105°45'" },
    "Bình Phước": { cm: 106.25, dms: "106°15'" },
    "Bình Thuận": { cm: 107.75, dms: "107°45'" },
    "Cà Mau": { cm: 104.5, dms: "104°30'" },
    "Cao Bằng": { cm: 105.75, dms: "105°45'" },
    "Đắk Lắk": { cm: 108.5, dms: "108°30'" },
    "Đắk Nông": { cm: 108.5, dms: "108°30'" },
    "Điện Biên": { cm: 103.0, dms: "103°00'" },
    "Đồng Nai": { cm: 107.75, dms: "107°45'" },
    "Đồng Tháp": { cm: 105.0, dms: "105°00'" },
    "Gia Lai": { cm: 108.5, dms: "108°30'" },
    "Hà Giang": { cm: 105.0, dms: "105°00'" },
    "Hà Nam": { cm: 105.5, dms: "105°30'" },
    "Hà Tĩnh": { cm: 105.5, dms: "105°30'" },
    "Hải Dương": { cm: 105.5, dms: "105°30'" },
    "Hậu Giang": { cm: 105.0, dms: "105°00'" },
    "Hòa Bình": { cm: 106.0, dms: "106°00'" },
    "Hưng Yên": { cm: 105.5, dms: "105°30'" },
    "Khánh Hòa": { cm: 108.25, dms: "108°15'" },
    "Kiên Giang": { cm: 104.5, dms: "104°30'" },
    "Kon Tum": { cm: 107.5, dms: "107°30'" },
    "Lai Châu": { cm: 103.0, dms: "103°00'" },
    "Lâm Đồng": { cm: 107.75, dms: "107°45'" },
    "Lạng Sơn": { cm: 107.25, dms: "107°15'" },
    "Lào Cai": { cm: 104.75, dms: "104°45'" },
    "Long An": { cm: 105.75, dms: "105°45'" },
    "Nam Định": { cm: 105.5, dms: "105°30'" },
    "Nghệ An": { cm: 104.75, dms: "104°45'" },
    "Ninh Bình": { cm: 105.5, dms: "105°30'" },
    "Ninh Thuận": { cm: 108.25, dms: "108°15'" },
    "Phú Thọ": { cm: 104.75, dms: "104°45'" },
    "Phú Yên": { cm: 108.5, dms: "108°30'" },
    "Quảng Bình": { cm: 106.0, dms: "106°00'" },
    "Quảng Nam": { cm: 107.75, dms: "107°45'" },
    "Quảng Ngãi": { cm: 108.0, dms: "108°00'" },
    "Quảng Ninh": { cm: 107.75, dms: "107°45'" },
    "Quảng Trị": { cm: 106.5, dms: "106°30'" },
    "Sóc Trăng": { cm: 105.5, dms: "105°30'" },
    "Sơn La": { cm: 104.0, dms: "104°00'" },
    "Tây Ninh": { cm: 105.5, dms: "105°30'" },
    "Thái Bình": { cm: 105.5, dms: "105°30'" },
    "Thái Nguyên": { cm: 106.5, dms: "106°30'" },
    "Thanh Hóa": { cm: 105.0, dms: "105°00'" },
    "Thừa Thiên Huế": { cm: 107.0, dms: "107°00'" },
    "Tiền Giang": { cm: 105.75, dms: "105°45'" },
    "Trà Vinh": { cm: 106.25, dms: "106°15'" },
    "Tuyên Quang": { cm: 106.0, dms: "106°00'" },
    "Vĩnh Long": { cm: 105.5, dms: "105°30'" },
    "Vĩnh Phúc": { cm: 105.5, dms: "105°30'" },
    "Yên Bái": { cm: 104.75, dms: "104°45'" }
  };

  // ==========================================
  // 2. THAM SỐ TOÁN HỌC TRẮC ĐỊA & BURSA-WOLF (EPSG 9606)
  // ==========================================
  const ELLIPSOID_A = 6378137.0; // Bán trục lớn WGS-84 / GRS-80
  const ELLIPSOID_F = 1.0 / 298.257223563; // Độ dẹt
  const ELLIPSOID_B = ELLIPSOID_A * (1.0 - ELLIPSOID_F);
  const ELLIPSOID_E2 = 2.0 * ELLIPSOID_F - ELLIPSOID_F * ELLIPSOID_F;
  const ELLIPSOID_E_PRIME2 = ELLIPSOID_E2 / (1.0 - ELLIPSOID_E2);
  const FALSE_EASTING = 500000.0;
  const SCALE_FACTOR_3DEG = 0.9999; // Múi 3 độ

  // Bộ 7 tham số chuyển đổi Datum Bursa-Wolf (Cục Đo đạc, Bản đồ & Thông tin Địa lý VN)
  const BW7 = {
    dx: -191.90441429,
    dy: -39.30318279,
    dz: -111.45032835,
    rx: -0.00928836 * (Math.PI / (180.0 * 3600.0)),
    ry: 0.02029997 * (Math.PI / (180.0 * 3600.0)),
    rz: -0.00420336 * (Math.PI / (180.0 * 3600.0)),
    scale_ppm: -0.252906278 * 1e-6
  };

  // ==========================================
  // 3. THUẬT TOÁN CHUYỂN ĐỔI HAI CHIỀU VN-2000 <-> WGS-84
  // ==========================================

  /**
   * Chuyển đổi tọa độ trắc địa phẳng VN-2000 (X Northing, Y Easting) sang WGS-84 (Lat, Lon)
   * @param {number} xNorth - Tọa độ X (Northing) mét
   * @param {number} yEast - Tọa độ Y (Easting) mét
   * @param {number} cmDeg - Kinh tuyến trục (độ thập phân)
   * @param {number} k0 - Hệ số co giãn (mặc định 0.9999)
   * @returns {{ lat: number, lon: number }}
   */
  function vn2000ToWgs84(xNorth, yEast, cmDeg, k0 = SCALE_FACTOR_3DEG) {
    const a = ELLIPSOID_A;
    const e2 = ELLIPSOID_E2;
    const e_prime2 = ELLIPSOID_E_PRIME2;

    // 1. Phép chiếu ngược Transverse Mercator (UTM)
    const xPrime = yEast - FALSE_EASTING;
    const yPrime = xNorth;
    const M = yPrime / k0;

    const e1 = (1.0 - Math.sqrt(1.0 - e2)) / (1.0 + Math.sqrt(1.0 - e2));
    const mu = M / (a * (1.0 - e2 / 4.0 - 3.0 * e2 * e2 / 64.0 - 5.0 * Math.pow(e2, 3) / 256.0));

    const phi1 = mu + (3.0 * e1 / 2.0 - 27.0 * Math.pow(e1, 3) / 32.0) * Math.sin(2.0 * mu)
                    + (21.0 * e1 * e1 / 16.0 - 55.0 * Math.pow(e1, 4) / 32.0) * Math.sin(4.0 * mu)
                    + (151.0 * Math.pow(e1, 3) / 96.0) * Math.sin(6.0 * mu)
                    + (1097.0 * Math.pow(e1, 4) / 512.0) * Math.sin(8.0 * mu);

    const sinPhi1 = Math.sin(phi1);
    const cosPhi1 = Math.cos(phi1);
    const tanPhi1 = Math.tan(phi1);

    const N1 = a / Math.sqrt(1.0 - e2 * sinPhi1 * sinPhi1);
    const T1 = tanPhi1 * tanPhi1;
    const C1 = e_prime2 * cosPhi1 * cosPhi1;
    const R1 = a * (1.0 - e2) / Math.pow(1.0 - e2 * sinPhi1 * sinPhi1, 1.5);
    const D = xPrime / (N1 * k0);

    const phiVN = phi1 - (N1 * tanPhi1 / R1) * (
      (D * D) / 2.0
      - (5.0 + 3.0 * T1 + 10.0 * C1 - 4.0 * C1 * C1 - 9.0 * e_prime2) * Math.pow(D, 4) / 24.0
      + (61.0 + 90.0 * T1 + 298.0 * C1 + 45.0 * T1 * T1 - 252.0 * e_prime2 - 3.0 * C1 * C1) * Math.pow(D, 6) / 720.0
    );

    const lamVN = (cmDeg * Math.PI / 180.0) + (
      D
      - (1.0 + 2.0 * T1 + C1) * Math.pow(D, 3) / 6.0
      + (5.0 - 2.0 * C1 + 28.0 * T1 - 3.0 * C1 * C1 + 8.0 * e_prime2 + 24.0 * T1 * T1) * Math.pow(D, 5) / 120.0
    ) / cosPhi1;

    // 2. Chuyển toạ độ địa tâm Descartes XYZ VN-2000
    const N = a / Math.sqrt(1.0 - e2 * Math.sin(phiVN) * Math.sin(phiVN));
    const X_vn = N * Math.cos(phiVN) * Math.cos(lamVN);
    const Y_vn = N * Math.cos(phiVN) * Math.sin(lamVN);
    const Z_vn = N * (1.0 - e2) * Math.sin(phiVN);

    // 3. Phép biến đổi Bursa-Wolf 7 tham số
    const M_scale = 1.0 + BW7.scale_ppm;
    const X_wgs = BW7.dx + M_scale * (X_vn - BW7.rz * Y_vn + BW7.ry * Z_vn);
    const Y_wgs = BW7.dy + M_scale * (BW7.rz * X_vn + Y_vn - BW7.rx * Z_vn);
    const Z_wgs = BW7.dz + M_scale * (-BW7.ry * X_vn + BW7.rx * Y_vn + Z_vn);

    // 4. Chuyển Descartes WGS sang Lat, Lon (Thuật toán Bowring)
    const p = Math.sqrt(X_wgs * X_wgs + Y_wgs * Y_wgs);
    const b = ELLIPSOID_B;
    const theta = Math.atan2(Z_wgs * a, p * b);

    const latWgsRad = Math.atan2(
      Z_wgs + e_prime2 * b * Math.pow(Math.sin(theta), 3),
      p - e2 * a * Math.pow(Math.cos(theta), 3)
    );
    const lonWgsRad = Math.atan2(Y_wgs, X_wgs);

    return {
      lat: latWgsRad * 180.0 / Math.PI,
      lon: lonWgsRad * 180.0 / Math.PI
    };
  }

  /**
   * Chuyển đổi ngược WGS-84 (Lat, Lon) -> VN-2000 (X Northing, Y Easting)
   */
  function wgs84ToVn2000(latDeg, lonDeg, cmDeg, k0 = SCALE_FACTOR_3DEG) {
    const a = ELLIPSOID_A;
    const e2 = ELLIPSOID_E2;
    const e_prime2 = ELLIPSOID_E_PRIME2;
    const latRad = latDeg * Math.PI / 180.0;
    const lonRad = lonDeg * Math.PI / 180.0;

    // 1. WGS84 Geodetic sang Descartes XYZ
    const N_wgs = a / Math.sqrt(1.0 - e2 * Math.sin(latRad) * Math.sin(latRad));
    const X_wgs = N_wgs * Math.cos(latRad) * Math.cos(lonRad);
    const Y_wgs = N_wgs * Math.cos(latRad) * Math.sin(lonRad);
    const Z_wgs = N_wgs * (1.0 - e2) * Math.sin(latRad);

    // 2. Nghịch đảo 7 tham số Bursa-Wolf
    const M_scale = 1.0 + BW7.scale_ppm;
    const dx = X_wgs - BW7.dx;
    const dy = Y_wgs - BW7.dy;
    const dz = Z_wgs - BW7.dz;

    const X_vn = (dx + BW7.rz * dy - BW7.ry * dz) / M_scale;
    const Y_vn = (-BW7.rz * dx + dy + BW7.rx * dz) / M_scale;
    const Z_vn = (BW7.ry * dx - BW7.rx * dy + dz) / M_scale;

    // 3. Descartes VN-2000 sang Geodetic Lat/Lon (Bowring)
    const p = Math.sqrt(X_vn * X_vn + Y_vn * Y_vn);
    const b = ELLIPSOID_B;
    const theta = Math.atan2(Z_vn * a, p * b);

    const phiVN = Math.atan2(
      Z_vn + e_prime2 * b * Math.pow(Math.sin(theta), 3),
      p - e2 * a * Math.pow(Math.cos(theta), 3)
    );
    const lamVN = Math.atan2(Y_vn, X_vn);

    // 4. Phép chiếu thuận Transverse Mercator (UTM)
    const cmRad = cmDeg * Math.PI / 180.0;
    const deltaLam = lamVN - cmRad;

    const sinPhi = Math.sin(phiVN);
    const cosPhi = Math.cos(phiVN);
    const tanPhi = Math.tan(phiVN);

    const N = a / Math.sqrt(1.0 - e2 * sinPhi * sinPhi);
    const T = tanPhi * tanPhi;
    const C = e_prime2 * cosPhi * cosPhi;
    const A_coeff = cosPhi * deltaLam;

    const M = a * (
      (1.0 - e2 / 4.0 - 3.0 * e2 * e2 / 64.0 - 5.0 * Math.pow(e2, 3) / 256.0) * phiVN
      - (3.0 * e2 / 8.0 + 3.0 * e2 * e2 / 32.0 + 45.0 * Math.pow(e2, 3) / 1024.0) * Math.sin(2.0 * phiVN)
      + (15.0 * e2 * e2 / 256.0 + 45.0 * Math.pow(e2, 3) / 1024.0) * Math.sin(4.0 * phiVN)
      - (35.0 * Math.pow(e2, 3) / 3072.0) * Math.sin(6.0 * phiVN)
    );

    const xPrime = k0 * N * (
      A_coeff
      + (1.0 - T + C) * Math.pow(A_coeff, 3) / 6.0
      + (5.0 - 18.0 * T + T * T + 72.0 * C - 58.0 * e_prime2) * Math.pow(A_coeff, 5) / 120.0
    );

    const yPrime = k0 * (
      M
      + N * tanPhi * (
        (A_coeff * A_coeff) / 2.0
        + (5.0 - T + 9.0 * C + 4.0 * C * C) * Math.pow(A_coeff, 4) / 24.0
        + (61.0 - 58.0 * T + T * T + 600.0 * C - 330.0 * e_prime2) * Math.pow(A_coeff, 6) / 720.0
      )
    );

    return {
      x: yPrime, // Northing
      y: xPrime + FALSE_EASTING // Easting
    };
  }

  // ==========================================
  // 4. BỘ BÓC TÁCH BẢNG TỌA ĐỘ VĂN BẢN & PHÁT HIỆN ĐẢO TRỤC X/Y
  // ==========================================
  function parseCoordinatesText(text, provName = "Hà Nội") {
    if (!text || typeof text !== 'string') {
      return { points: [], warnings: ["Dữ liệu trống."] };
    }

    const lines = text.trim().split('\n');
    const parsed = [];
    let counter = 1;

    const junkKeywords = [
      'kinh tuyến', 'kinh tuyen', 'chu vi', 'diện tích', 'dien tich',
      'tọa độ tâm', 'toa do tam', 'google maps', 'báo cáo', 'bao cao',
      'tên thửa đất', 'ten thua dat', 'tỉnh / thành phố', 'tinh / thanh pho',
      'điểm mốc', 'diem moc', 'vĩ độ', 'vi do', 'kinh độ', 'kinh do',
      'chiều dài cạnh', 'chieu dai canh', 'kết quả chuyển đổi', 'ket qua chuyen doi',
      'số đỉnh mốc', 'so dinh moc', 'tt', 'stt', 'ký hiệu', 'ky hieu'
    ];

    lines.forEach(line => {
      const clean = line.trim();
      if (!clean) return;

      const lowerClean = clean.toLowerCase();
      if (junkKeywords.some(kw => lowerClean.includes(kw))) {
        return; // Bỏ qua dòng tiêu đề / metadata
      }

      let tokens = [];
      if (clean.includes('\t')) {
        tokens = clean.split('\t').map(t => t.trim()).filter(Boolean);
      } else if (clean.includes(';')) {
        tokens = clean.split(';').map(t => t.trim()).filter(Boolean);
      } else if (clean.includes(',') && clean.split(',').length >= 3) {
        tokens = clean.split(',').map(t => t.trim()).filter(Boolean);
      } else {
        tokens = clean.split(/\s+/).map(t => t.trim()).filter(Boolean);
      }

      const numbers = [];
      let name = '';

      function cleanNumToken(str) {
        if (!str) return NaN;
        let s = String(str).trim().replace(/[^\d.,\-+]/g, '');
        if (!s) return NaN;
        if (s.includes('.') && s.includes(',')) {
          if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
            s = s.replace(/\./g, '').replace(',', '.');
          } else {
            s = s.replace(/,/g, '');
          }
        } else if (s.includes(',')) {
          const parts = s.split(',');
          if (parts.length === 2 && parts[1].length <= 6) {
            s = s.replace(',', '.');
          } else {
            s = s.replace(/,/g, '');
          }
        } else if (s.includes('.')) {
          const dots = s.split('.');
          if (dots.length > 2) {
            s = dots.join('');
          }
        }
        return parseFloat(s);
      }

      tokens.forEach(tok => {
        const val = cleanNumToken(tok);
        if (!isNaN(val) && /[\d]/.test(tok)) {
          numbers.push(val);
        } else if (!name && !/^(đỉnh|điểm|mốc|stt|x|y|northing|easting)$/i.test(tok.trim())) {
          name = tok;
        }
      });

      if (numbers.length >= 2) {
        let pName = name;
        let c1, c2;
        if (numbers.length >= 3 && numbers[0] < 500) {
          pName = pName || Math.floor(numbers[0]).toString();
          c1 = numbers[1];
          c2 = numbers[2];
        } else {
          pName = pName || counter.toString();
          c1 = numbers[0];
          c2 = numbers[1];
        }

        // Kiểm tra cặp tọa độ
        const isVn2000 = (c1 > 10000 && c2 > 10000);
        const isWgs84Normal = (c1 >= 8 && c1 <= 24 && c2 >= 101 && c2 <= 111);
        const isWgs84Swapped = (c2 >= 8 && c2 <= 24 && c1 >= 101 && c1 <= 111);

        if (isVn2000) {
          parsed.push({ name: pName, c1, c2, isWgs84: false });
          counter++;
        } else if (isWgs84Normal) {
          parsed.push({ name: pName, c1, c2, isWgs84: true, lat: c1, lon: c2 });
          counter++;
        } else if (isWgs84Swapped) {
          parsed.push({ name: pName, c1: c2, c2: c1, isWgs84: true, lat: c2, lon: c1 });
          counter++;
        }
      }
    });

    if (parsed.length === 0) {
      return { points: [], warnings: ["Không tìm thấy toạ độ hợp lệ. Vui lòng kiểm tra định dạng nhập."] };
    }

    const warnings = [];
    const allWgs84 = parsed.every(p => p.isWgs84);

    if (allWgs84) {
      const cmDeg = PROVINCES_DATA[provName] ? PROVINCES_DATA[provName].cm : 105.0;
      warnings.push(`Dữ liệu đầu vào là tọa độ WGS-84 (GPS). Hệ thống đã tự động tính toán VN-2000 theo kinh tuyến trục ${cmDeg}°.`);
      const points = parsed.map(p => {
        const vn = wgs84ToVn2000(p.lat, p.lon, cmDeg);
        return {
          name: p.name,
          x: vn.x,
          y: vn.y,
          lat: p.lat,
          lon: p.lon
        };
      });
      return { points, warnings };
    }

    // Kiểm tra đảo trục VN-2000: Ở VN, X (Northing) luôn > 900,000m, Y (Easting) luôn ~500,000m
    const c1Avg = parsed.reduce((sum, p) => sum + p.c1, 0) / parsed.length;
    const c2Avg = parsed.reduce((sum, p) => sum + p.c2, 0) / parsed.length;
    let isSwapped = false;

    if (c1Avg < 800000 && c2Avg > 800000) {
      isSwapped = true;
      warnings.push("Phát hiện đảo trục X/Y trên bản vẽ: Cột 1 là Y (Easting ~500k) và Cột 2 là X (Northing > 900k). Hệ thống đã tự động đảo về chuẩn quy định.");
    }

    const points = parsed.map(p => ({
      name: p.name,
      x: isSwapped ? p.c2 : p.c1,
      y: isSwapped ? p.c1 : p.c2
    }));

    return { points, warnings };
  }

  // ==========================================
  // 5. TÍNH TOÁN HÌNH HỌC TRẮC ĐỊA & PHONG THỦY 24 SƠN
  // ==========================================

  // Bảng 24 Sơn Vị và góc phương vị trung tâm
  const SON_24_BEARING = [
    { name: "Tý", deg: 0, dir: "Chính Bắc", group: "Khảm" },
    { name: "Quý", deg: 15, dir: "Bắc", group: "Khảm" },
    { name: "Sửu", deg: 30, dir: "Đông Bắc", group: "Cấn" },
    { name: "Cấn", deg: 45, dir: "Chính Đông Bắc", group: "Cấn" },
    { name: "Dần", deg: 60, dir: "Đông Bắc", group: "Cấn" },
    { name: "Giáp", deg: 75, dir: "Đông", group: "Chấn" },
    { name: "Mão", deg: 90, dir: "Chính Đông", group: "Chấn" },
    { name: "Ất", deg: 105, dir: "Đông", group: "Chấn" },
    { name: "Thìn", deg: 120, dir: "Đông Nam", group: "Tốn" },
    { name: "Tốn", deg: 135, dir: "Chính Đông Nam", group: "Tốn" },
    { name: "Tị", deg: 150, dir: "Đông Nam", group: "Tốn" },
    { name: "Bính", deg: 165, dir: "Nam", group: "Ly" },
    { name: "Ngọ", deg: 180, dir: "Chính Nam", group: "Ly" },
    { name: "Đinh", deg: 195, dir: "Nam", group: "Ly" },
    { name: "Mùi", deg: 210, dir: "Tây Nam", group: "Khôn" },
    { name: "Khôn", deg: 225, dir: "Chính Tây Nam", group: "Khôn" },
    { name: "Thân", deg: 240, dir: "Tây Nam", group: "Khôn" },
    { name: "Canh", deg: 255, dir: "Tây", group: "Đoài" },
    { name: "Dậu", deg: 270, dir: "Chính Tây", group: "Đoài" },
    { name: "Tân", deg: 285, dir: "Tây", group: "Đoài" },
    { name: "Tuất", deg: 300, dir: "Tây Bắc", group: "Càn" },
    { name: "Càn", deg: 315, dir: "Chính Tây Bắc", group: "Càn" },
    { name: "Hợi", deg: 330, dir: "Tây Bắc", group: "Càn" },
    { name: "Nhâm", deg: 345, dir: "Bắc", group: "Khảm" }
  ];

  function getSonByBearing(deg) {
    const normDeg = ((deg % 360) + 360) % 360;
    for (let i = 0; i < SON_24_BEARING.length; i++) {
      const s = SON_24_BEARING[i];
      let diff = Math.abs(normDeg - s.deg);
      if (diff > 180) diff = 360 - diff;
      if (diff <= 7.5) {
        return s;
      }
    }
    return SON_24_BEARING[0];
  }

  /**
   * Tính diện tích đa giác (m2) theo tọa độ phẳng phẳng X, Y (Shoelace Formula)
   */
  function calculatePolygonArea(pts) {
    if (!pts || pts.length < 3) return 0;
    let area = 0;
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      // Dùng tọa độ X (North), Y (East)
      area += (pts[i].y * pts[j].x - pts[j].y * pts[i].x);
    }
    return Math.abs(area) / 2.0;
  }

  /**
   * Tính tọa độ trọng tâm (Centroid - Tim khu đất)
   */
  function calculateCentroid(pts) {
    if (!pts || pts.length === 0) return null;
    if (pts.length === 1) {
      return {
        lat: pts[0].lat,
        lon: pts[0].lon,
        x: pts[0].x,
        y: pts[0].y
      };
    }
    if (pts.length === 2) {
      return {
        lat: (pts[0].lat + pts[1].lat) / 2,
        lon: (pts[0].lon + pts[1].lon) / 2,
        x: (pts[0].x + pts[1].x) / 2,
        y: (pts[0].y + pts[1].y) / 2
      };
    }

    const n = pts.length;

    // 1. Tọa độ phẳng VN-2000 (X = Northing, Y = Easting)
    // Dùng hệ tọa độ tương đối (trừ điểm gốc ref) để triệt tiêu 100% lỗi mất chữ số có nghĩa (Catastrophic Cancellation)
    const refX = pts[0].x !== undefined ? pts[0].x : 0;
    const refY = pts[0].y !== undefined ? pts[0].y : 0;

    let signedArea = 0.0;
    let cu = 0.0; // Easting offset
    let cv = 0.0; // Northing offset

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const u0 = (pts[i].y !== undefined ? pts[i].y : 0) - refY; // Easting tương đối
      const v0 = (pts[i].x !== undefined ? pts[i].x : 0) - refX; // Northing tương đối
      const u1 = (pts[j].y !== undefined ? pts[j].y : 0) - refY;
      const v1 = (pts[j].x !== undefined ? pts[j].x : 0) - refX;
      const a = (u0 * v1 - u1 * v0);
      signedArea += a;
      cu += (u0 + u1) * a;
      cv += (v0 + v1) * a;
    }

    signedArea *= 0.5;
    let finalX, finalY;
    if (Math.abs(signedArea) < 1e-7) {
      finalX = pts.reduce((s, p) => s + (p.x || 0), 0) / n;
      finalY = pts.reduce((s, p) => s + (p.y || 0), 0) / n;
    } else {
      cu = cu / (6.0 * signedArea);
      cv = cv / (6.0 * signedArea);
      finalY = refY + cu; // Easting
      finalX = refX + cv; // Northing
    }

    // 2. Tọa độ địa lý WGS-84 (Lat, Lon / Lng)
    // Dùng hệ tọa độ tương đối chiếu cục bộ (nhân cos(refLat)) để đạt độ chính xác cỡ milimet
    const refLat = pts[0].lat;
    const refLon = pts[0].lng !== undefined ? pts[0].lng : pts[0].lon;
    const cosLat = Math.cos((refLat * Math.PI) / 180.0);

    let geoArea = 0.0;
    let cEast = 0.0;
    let cNorth = 0.0;

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const lonI = pts[i].lng !== undefined ? pts[i].lng : pts[i].lon;
      const lonJ = pts[j].lng !== undefined ? pts[j].lng : pts[j].lon;
      const xi = (lonI - refLon) * cosLat;
      const yi = pts[i].lat - refLat;
      const xj = (lonJ - refLon) * cosLat;
      const yj = pts[j].lat - refLat;
      const a = (xi * yj - xj * yi);
      geoArea += a;
      cEast += (xi + xj) * a;
      cNorth += (yi + yj) * a;
    }

    geoArea *= 0.5;
    let clat, clon;
    if (Math.abs(geoArea) > 1e-15) {
      cEast = cEast / (6.0 * geoArea);
      cNorth = cNorth / (6.0 * geoArea);
      clat = refLat + cNorth;
      clon = refLon + (cEast / cosLat);
    } else {
      clat = pts.reduce((s, p) => s + p.lat, 0) / n;
      clon = pts.reduce((s, p) => s + (p.lng !== undefined ? p.lng : p.lon), 0) / n;
    }

    return {
      lat: clat,
      lon: clon,
      lng: clon,
      x: finalX,
      y: finalY
    };
  }

  /**
   * Tính chiều dài và góc phương vị của từng cạnh ranh
   */
  function calculateEdges(pts) {
    if (!pts || pts.length < 2) return [];
    const edges = [];
    const n = pts.length;

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const p1 = pts[i];
      const p2 = pts[j];

      const dx = p2.x - p1.x; // dNorthing
      const dy = p2.y - p1.y; // dEasting
      const lengthM = Math.sqrt(dx * dx + dy * dy);

      // Góc phương vị trắc địa (Azimuth tính từ hướng Bắc quay theo chiều kim đồng hồ)
      let bearingRad = Math.atan2(dy, dx);
      let bearingDeg = (bearingRad * 180.0 / Math.PI + 360.0) % 360.0;
      bearingDeg = Math.round(bearingDeg * 10) / 10;

      const son = getSonByBearing(bearingDeg);

      edges.push({
        from: p1.name || String(i + 1),
        to: p2.name || String(j + 1),
        lengthM: Math.round(lengthM * 100) / 100,
        bearingDeg: bearingDeg,
        sonName: son.name,
        sonDir: son.dir,
        sonGroup: son.group,
        sonVi: {
          name: son.name,
          cung: son.dir,
          nguHanh: son.group
        },
        huong: son.dir
      });
    }

    return edges;
  }

  // ==========================================
  // Tra cứu Tỉnh Thành & Kinh Tuyến Trục
  // ==========================================
  function getAllProvinces() {
    return Object.keys(PROVINCES_DATA).map(name => {
      const p = PROVINCES_DATA[name];
      return {
        id: name,
        name: name,
        ktt: p.cm,
        cm: p.cm,
        dms: p.dms,
        zone3: true,
        k0: SCALE_FACTOR_3DEG
      };
    });
  }

  function getProvince(nameOrKey) {
    if (!nameOrKey) {
      const p = PROVINCES_DATA["Hà Nội"];
      return { id: "Hà Nội", name: "Hà Nội", ktt: p.cm, cm: p.cm, dms: p.dms, zone3: true, k0: SCALE_FACTOR_3DEG };
    }
    if (PROVINCES_DATA[nameOrKey]) {
      const p = PROVINCES_DATA[nameOrKey];
      return { id: nameOrKey, name: nameOrKey, ktt: p.cm, cm: p.cm, dms: p.dms, zone3: true, k0: SCALE_FACTOR_3DEG };
    }
    const lower = String(nameOrKey).toLowerCase().replace(/[-_]/g, ' ');
    if (lower === 'hanoi' || lower === 'chuongmy') {
      const p = PROVINCES_DATA["Hà Nội"];
      return { id: "Hà Nội", name: "Hà Nội", ktt: p.cm, cm: p.cm, dms: p.dms, zone3: true, k0: SCALE_FACTOR_3DEG };
    }
    if (lower === 'hcm') {
      const p = PROVINCES_DATA["Hồ Chí Minh"];
      return { id: "Hồ Chí Minh", name: "Hồ Chí Minh", ktt: p.cm, cm: p.cm, dms: p.dms, zone3: true, k0: SCALE_FACTOR_3DEG };
    }
    if (lower === 'danang') {
      const p = PROVINCES_DATA["Đà Nẵng"];
      return { id: "Đà Nẵng", name: "Đà Nẵng", ktt: p.cm, cm: p.cm, dms: p.dms, zone3: true, k0: SCALE_FACTOR_3DEG };
    }
    for (const [k, v] of Object.entries(PROVINCES_DATA)) {
      if (k.toLowerCase() === lower || k.toLowerCase().includes(lower)) {
        return { id: k, name: k, ktt: v.cm, cm: v.cm, dms: v.dms, zone3: true, k0: SCALE_FACTOR_3DEG };
      }
    }
    const def = PROVINCES_DATA["Hà Nội"];
    return { id: "Hà Nội", name: "Hà Nội", ktt: def.cm, cm: def.cm, dms: def.dms, zone3: true, k0: SCALE_FACTOR_3DEG };
  }

  // ==========================================
  // 6. XỬ LÝ TOÀN DIỆN THỬA ĐẤT (MASTER WORKFLOW)
  // ==========================================
  function processParcel(arg1 = {}, arg2, arg3) {
    let name = "", province = "Hà Nội", rawText = "", k0 = SCALE_FACTOR_3DEG;
    if (typeof arg1 === 'object' && arg1 !== null) {
      name = arg1.name || arg1.parcelName || "";
      province = arg1.province || "Hà Nội";
      rawText = arg1.rawText || arg1.coordText || arg1.text || "";
      k0 = arg1.k0 || SCALE_FACTOR_3DEG;
    } else if (typeof arg1 === 'string') {
      rawText = arg1;
      province = arg2 || "Hà Nội";
      name = arg3 || "";
    }
    if (!name) name = "Thửa Đất";

    const provObj = getProvince(province);
    const provData = PROVINCES_DATA[provObj.name] || PROVINCES_DATA["Hà Nội"];
    const cmDeg = provData.cm;

    const parsedRes = parseCoordinatesText(rawText, provObj.name);
    if (!parsedRes.points || parsedRes.points.length === 0) {
      return {
        success: false,
        error: parsedRes.warnings.join(' ') || "Không có điểm mốc hợp lệ."
      };
    }

    // Chuyển đổi toàn bộ sang WGS-84
    const convertedPoints = parsedRes.points.map((p, idx) => {
      let lat = p.lat, lon = p.lon;
      if (lat == null || lon == null) {
        const wgs = vn2000ToWgs84(p.x, p.y, cmDeg, k0);
        lat = wgs.lat;
        lon = wgs.lon;
      }
      return {
        id: p.name || String(idx + 1),
        index: idx + 1,
        name: p.name || String(idx + 1),
        x: Math.round(p.x * 1000) / 1000,
        y: Math.round(p.y * 1000) / 1000,
        lat: Math.round(lat * 10000000) / 10000000,
        lon: Math.round(lon * 10000000) / 10000000,
        lng: Math.round(lon * 10000000) / 10000000
      };
    });

    const areaM2 = Math.round(calculatePolygonArea(convertedPoints) * 100) / 100;
    const edges = calculateEdges(convertedPoints);
    const perimeterM = Math.round(edges.reduce((s, e) => s + e.lengthM, 0) * 100) / 100;
    const centroid = calculateCentroid(convertedPoints);

    return {
      success: true,
      name: name,
      parcelName: name,
      province: {
        id: provObj.name,
        name: provObj.name,
        ktt: cmDeg,
        cm: cmDeg,
        dms: provData.dms,
        zone3: true
      },
      centralMeridian: cmDeg,
      centralMeridianDms: provData.dms,
      vertices: convertedPoints,
      points: convertedPoints,
      vertexCount: convertedPoints.length,
      pointCount: convertedPoints.length,
      edges: edges,
      areaM2: areaM2,
      areaSao: Math.round((areaM2 / 360) * 10) / 10,
      perimeterM: perimeterM,
      centroid: centroid,
      warnings: parsedRes.warnings || []
    };
  }

  // ==========================================
  // 7. BỘ XUẤT TỆP KML GOOGLE EARTH
  // ==========================================
  function generateKML(parcel) {
    if (!parcel || !parcel.points || parcel.points.length === 0) return '';

    const pts = parcel.points;
    const coordString = pts.map(p => `${p.lon},${p.lat},0`).join(' ') + ` ${pts[0].lon},${pts[0].lat},0`;

    const edgeRows = (parcel.edges || []).map(e => `
      <tr>
        <td style="padding:4px 8px;border:1px solid #ddd;font-weight:bold;">${e.from} - ${e.to}</td>
        <td style="padding:4px 8px;border:1px solid #ddd;text-align:right;">${e.lengthM} m</td>
        <td style="padding:4px 8px;border:1px solid #ddd;text-align:center;">${e.bearingDeg}°</td>
        <td style="padding:4px 8px;border:1px solid #ddd;">Sơn ${e.sonName} (${e.sonDir})</td>
      </tr>
    `).join('');

    const pointPlacemarks = pts.map(p => `
      <Placemark>
        <name>Mốc ${p.name}</name>
        <description><![CDATA[
          <div style="font-family:Arial,sans-serif;font-size:12px;">
            <p><strong>Mốc ranh:</strong> ${p.name}</p>
            <p><strong>VN-2000 X (Bắc):</strong> ${p.x.toFixed(3)} m</p>
            <p><strong>VN-2000 Y (Đông):</strong> ${p.y.toFixed(3)} m</p>
            <p><strong>WGS-84:</strong> ${p.lat.toFixed(7)}°, ${p.lon.toFixed(7)}°</p>
          </div>
        ]]></description>
        <Point>
          <coordinates>${p.lon},${p.lat},0</coordinates>
        </Point>
      </Placemark>
    `).join('');

    const centroidPlacemark = parcel.centroid ? `
      <Placemark>
        <name>🎯 Tim Đất: ${parcel.name}</name>
        <description><![CDATA[
          <div style="font-family:Arial,sans-serif;font-size:13px;">
            <h3 style="color:#d97706;margin:0 0 6px;">${parcel.name}</h3>
            <p><strong>Diện tích:</strong> ${parcel.areaM2.toLocaleString('vi-VN')} m²</p>
            <p><strong>Chu vi:</strong> ${parcel.perimeterM.toLocaleString('vi-VN')} m</p>
            <p><strong>Tỉnh thành:</strong> ${parcel.province} (KTT: ${parcel.centralMeridianDms})</p>
            <p><strong>Tọa độ Tim:</strong> ${parcel.centroid.lat.toFixed(7)}°, ${parcel.centroid.lon.toFixed(7)}°</p>
          </div>
        ]]></description>
        <Point>
          <coordinates>${parcel.centroid.lon},${parcel.centroid.lat},0</coordinates>
        </Point>
      </Placemark>
    ` : '';

    return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${parcel.name}</name>
    <description><![CDATA[
      <h2>Ranh Giới Thửa Đất VN-2000</h2>
      <p><strong>Tỉnh/Thành phố:</strong> ${parcel.province} (KTT: ${parcel.centralMeridianDms})</p>
      <p><strong>Diện tích:</strong> ${parcel.areaM2.toLocaleString('vi-VN')} m²</p>
      <p><strong>Chu vi:</strong> ${parcel.perimeterM.toLocaleString('vi-VN')} m</p>
      <table style="border-collapse:collapse;font-size:12px;margin-top:8px;">
        <tr style="background:#f1f5f9;">
          <th style="padding:4px 8px;border:1px solid #ddd;">Cạnh</th>
          <th style="padding:4px 8px;border:1px solid #ddd;">Dài</th>
          <th style="padding:4px 8px;border:1px solid #ddd;">Góc</th>
          <th style="padding:4px 8px;border:1px solid #ddd;">24 Sơn Vị</th>
        </tr>
        ${edgeRows}
      </table>
    ]]></description>
    <Style id="polyStyle">
      <LineStyle>
        <color>ff10b981</color>
        <width>3</width>
      </LineStyle>
      <PolyStyle>
        <color>4010b981</color>
      </PolyStyle>
    </Style>
    <Placemark>
      <name>${parcel.name} (Ranh Giới)</name>
      <styleUrl>#polyStyle</styleUrl>
      <Polygon>
        <extrude>1</extrude>
        <altitudeMode>clampToGround</altitudeMode>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>${coordString}</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
    ${centroidPlacemark}
    ${pointPlacemarks}
  </Document>
</kml>`;
  }

  /**
   * Phân tích tệp Excel (.xlsx, .xls) hoặc mảng nhị phân ArrayBuffer / Uint8Array / Base64
   * Trích xuất tọa độ VN-2000 / WGS-84, nhận diện tỉnh thành & tên thửa đất
   * @param {ArrayBuffer|Uint8Array|string} inputData - Dữ liệu nhị phân hoặc chuỗi base64
   * @param {string} [filename] - Tên tệp gốc để fallback đặt tên thửa đất
   * @returns {{ success: boolean, coordText: string, provinceKey: string|null, parcelName: string, pointCount: number, error?: string }}
   */
  function parseExcelData(inputData, filename = '') {
    const XLSXLib = (typeof XLSX !== 'undefined') ? XLSX : (typeof window !== 'undefined' ? window.XLSX : null);
    if (!XLSXLib) {
      return { success: false, error: 'Thư viện SheetJS (XLSX) chưa được tải.' };
    }

    try {
      let workbook;
      if (typeof inputData === 'string') {
        const cleanB64 = inputData.includes(',') ? inputData.split(',')[1] : inputData;
        workbook = XLSXLib.read(cleanB64, { type: 'base64' });
      } else {
        workbook = XLSXLib.read(inputData, { type: 'array' });
      }

      if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
        return { success: false, error: 'Tệp Excel không chứa bảng tính (sheet) nào.' };
      }

      // Ưu tiên sheet có tên liên quan đến tọa độ hoặc sheet đầu tiên
      let targetSheetName = workbook.SheetNames[0];
      for (const sName of workbook.SheetNames) {
        const lower = sName.toLowerCase();
        if (lower.includes('nhap_toa_do') || lower.includes('toa do') || lower.includes('tọa độ') || lower.includes('ranh')) {
          targetSheetName = sName;
          break;
        }
      }

      const worksheet = workbook.Sheets[targetSheetName];
      const jsonRows = XLSXLib.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

      if (!jsonRows || jsonRows.length === 0) {
        return { success: false, error: 'Bảng tính rỗng, không có dữ liệu dòng.' };
      }

      // 1. Quét tìm Tỉnh/Thành phố và Tên Thửa Đất từ metadata các dòng đầu
      let detectedProvince = '';
      let detectedParcelName = '';

      for (let r = 0; r < Math.min(20, jsonRows.length); r++) {
        const row = jsonRows[r];
        if (!Array.isArray(row)) continue;
        for (let c = 0; c < row.length; c++) {
          const val = String(row[c]).trim().toLowerCase();
          if (val.includes('tỉnh') || val.includes('thành phố') || val.includes('tp.') || val.includes('province')) {
            const nextVal = String(row[c + 1] || row[c + 2] || '').trim();
            for (const pName in PROVINCES_DATA) {
              if (pName.toLowerCase() === nextVal.toLowerCase() || nextVal.toLowerCase().includes(pName.toLowerCase()) || val.includes(pName.toLowerCase())) {
                detectedProvince = pName;
                break;
              }
            }
          }
          if (val.includes('tên thửa') || val.includes('thửa số') || val.includes('thửa đất') || val.includes('địa điểm') || val.includes('dự án')) {
            const nextVal = String(row[c + 1] || row[c + 2] || '').trim();
            if (nextVal && !detectedParcelName) {
              detectedParcelName = nextVal;
            } else if (!detectedParcelName && String(row[c]).trim().length > 3) {
              detectedParcelName = String(row[c]).trim();
            }
          }
        }
      }

      // 2. Nhận diện các cột
      function isXCol(cell) {
        const c = String(cell).trim().toLowerCase();
        return c === 'x' || c.startsWith('x_') || c.startsWith('x ') || c.startsWith('x(') ||
               c.includes('x_vn2000') || c.includes('x vn2000') || c.includes('toạ độ x') || 
               c.includes('tọa độ x') || c.includes('northing') || /\bx\b/.test(c);
      }
      function isYCol(cell) {
        const c = String(cell).trim().toLowerCase();
        return c === 'y' || c.startsWith('y_') || c.startsWith('y ') || c.startsWith('y(') ||
               c.includes('y_vn2000') || c.includes('y vn2000') || c.includes('toạ độ y') || 
               c.includes('tọa độ y') || c.includes('easting') || /\by\b/.test(c);
      }
      function isNameCol(cell) {
        const c = String(cell).trim().toLowerCase();
        return c.includes('điểm') || c.includes('mốc') || c.includes('stt') || c.includes('đỉnh') || c.includes('point') || c === 'tên' || c === 'name';
      }

      const junkKeywords = [
        'kinh tuyến', 'kinh tuyen', 'chu vi', 'diện tích', 'dien tich', 
        'tọa độ tâm', 'toa do tam', 'google maps', 'báo cáo', 'bao cao',
        'tên thửa đất', 'ten thua dat', 'tỉnh / thành phố', 'tinh / thanh pho',
        'số đỉnh mốc', 'so dinh moc', 'bảng kê tọa độ'
      ];

      // 3. Quét tìm hàng tiêu đề chứa cột Điểm, X, Y
      let headerRow = -1;
      let colX = -1, colY = -1, colName = -1;

      for (let r = 0; r < Math.min(30, jsonRows.length); r++) {
        const row = jsonRows[r];
        if (!Array.isArray(row)) continue;
        let foundX = -1, foundY = -1, foundName = -1;
        row.forEach((cell, idx) => {
          if (isXCol(cell) && foundX === -1) foundX = idx;
          else if (isYCol(cell) && foundY === -1) foundY = idx;
          else if (isNameCol(cell) && foundName === -1) foundName = idx;
        });

        if (foundX !== -1 && foundY !== -1) {
          headerRow = r;
          colX = foundX;
          colY = foundY;
          colName = foundName;
          break;
        }
      }

      const extractedLines = [];

      if (headerRow !== -1 && colX !== -1 && colY !== -1) {
        for (let r = headerRow + 1; r < jsonRows.length; r++) {
          const row = jsonRows[r];
          if (!row || row.length <= Math.max(colX, colY)) continue;
          const rowStr = row.map(c => String(c).toLowerCase()).join(' ');
          if (junkKeywords.some(kw => rowStr.includes(kw))) continue;

          const rawX = String(row[colX]).replace(/\s+/g, '').replace(',', '.');
          const rawY = String(row[colY]).replace(/\s+/g, '').replace(',', '.');
          const xVal = parseFloat(rawX);
          const yVal = parseFloat(rawY);
          const nameVal = colName !== -1 && row[colName] !== '' && row[colName] !== undefined
                          ? String(row[colName]).trim()
                          : (extractedLines.length + 1).toString();

          if (!isNaN(xVal) && !isNaN(yVal)) {
            const isValidVn2000 = (xVal > 10000 && yVal > 10000);
            const isValidWgs = (xVal >= 8 && xVal <= 24 && yVal >= 101 && yVal <= 111) ||
                               (yVal >= 8 && yVal <= 24 && xVal >= 101 && xVal <= 111);
            if (isValidVn2000 || isValidWgs) {
              extractedLines.push(`${nameVal}  ${xVal}  ${yVal}`);
            }
          }
        }
      } else {
        // Fallback: Quét các dòng có ít nhất 2 số hợp lệ
        for (let r = 0; r < jsonRows.length; r++) {
          const row = jsonRows[r];
          if (!Array.isArray(row)) continue;
          const rowStr = row.map(c => String(c).toLowerCase()).join(' ');
          if (junkKeywords.some(kw => rowStr.includes(kw))) continue;

          const nums = [];
          let rowName = '';
          for (let c = 0; c < row.length; c++) {
            const rawCell = String(row[c]).trim();
            const num = parseFloat(rawCell.replace(/\s+/g, '').replace(',', '.'));
            if (!isNaN(num) && /^-?\d+(\.\d+)?$/.test(rawCell.replace(/\s+/g, '').replace(',', '.'))) {
              nums.push(num);
            } else if (!rowName && rawCell) {
              rowName = rawCell;
            }
          }

          if (nums.length >= 2) {
            let pName = rowName;
            let c1, c2;
            if (nums.length >= 3 && nums[0] < 500) {
              pName = pName || String(Math.floor(nums[0]));
              c1 = nums[1];
              c2 = nums[2];
            } else {
              pName = pName || String(extractedLines.length + 1);
              c1 = nums[0];
              c2 = nums[1];
            }

            const isValidVn2000 = (c1 > 10000 && c2 > 10000);
            const isValidWgs = (c1 >= 8 && c1 <= 24 && c2 >= 101 && c2 <= 111) ||
                               (c2 >= 8 && c2 <= 24 && c1 >= 101 && c1 <= 111);
            if (isValidVn2000 || isValidWgs) {
              extractedLines.push(`${pName}  ${c1}  ${c2}`);
            }
          }
        }
      }

      if (extractedLines.length === 0) {
        return { success: false, error: 'Không tìm thấy cột hoặc cặp tọa độ hợp lệ trong tệp Excel.' };
      }

      if (!detectedParcelName && filename) {
        detectedParcelName = filename.replace(/\.(xlsx|xls|csv|txt)$/i, '').replace(/[_-]/g, ' ').trim();
      }

      return {
        success: true,
        coordText: extractedLines.join('\n'),
        provinceKey: detectedProvince || null,
        parcelName: detectedParcelName || '',
        pointCount: extractedLines.length
      };
    } catch (err) {
      return { success: false, error: 'Lỗi đọc tệp Excel: ' + (err.message || String(err)) };
    }
  }

  // CSDL Mẫu Thửa Đất Tiêu Chuẩn 63 Tỉnh Thành
  const SAMPLE_PARCELS = {
    hanoi_sample: {
      name: "Thửa Đất Mẫu Hà Nội (Hoàn Kiếm)",
      provinceKey: "Hà Nội",
      text: `1  2324500.50  588600.20
2  2324525.80  588635.40
3  2324505.10  588660.80
4  2324480.00  588625.60`
    },
    hcm_sample: {
      name: "Thửa Đất Mẫu TP.HCM (Quận 1)",
      provinceKey: "Hồ Chí Minh",
      text: `1  1192100.00  605200.00
2  1192120.00  605230.00
3  1192100.00  605250.00
4  1192080.00  605220.00`
    },
    danang_sample: {
      name: "Thửa Đất Mẫu Đà Nẵng (Hải Châu)",
      provinceKey: "Đà Nẵng",
      text: `1  1774300.00  545200.00
2  1774325.00  545230.00
3  1774300.00  545255.00
4  1774275.00  545225.00`
    }
  };

  // Export Engine API
  const NetaDiaChinhEngine = {
    PROVINCES_DATA,
    SON_24_BEARING,
    SAMPLE_PARCELS,
    vn2000ToWgs84,
    wgs84ToVn2000,
    parseCoordinatesText,
    parseExcelData,
    calculatePolygonArea,
    calculateCentroid,
    calculateEdges,
    getSonByBearing,
    getAllProvinces,
    getProvince,
    processParcel,
    generateKML
  };

  global.NetaDiaChinhEngine = NetaDiaChinhEngine;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = NetaDiaChinhEngine;
  }

})(typeof window !== 'undefined' ? window : globalThis);
