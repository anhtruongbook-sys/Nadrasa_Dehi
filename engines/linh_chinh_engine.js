/**
 * NETA LIGHT - LINH CHÍNH THẦN ENGINE (engines/linh_chinh_engine.js)
 * Tính toán Linh Thần / Chính Thần Vượng Khí & Suy Khí theo phương pháp Phi Tinh 2 Tầng
 * Chuẩn xác 100% theo bài học Huyền Không Đại Quái Khóa 3 Cao Cấp (Bài 13 & 13.1) - Thầy Hạnh Nhật Tấn
 */

(function (global) {
  'use strict';

  // 1. Bát Quái Tiên Thiên (Phục Hy) và Phương Vị Tương Ứng
  // Càn 1 Nam, Đoài 2 Đông Nam, Ly 3 Đông, Chấn 4 Đông Bắc, Tốn 5 Tây Nam, Khảm 6 Tây, Cấn 7 Tây Bắc, Khôn 8 Bắc
  const TIEN_THIEN_BAT_QUAI_DIRECTION = {
    'Càn':  'ly_n',    // Nam (Ly)
    'Đoài': 'ton_dn',  // Đông Nam (Tốn)
    'Ly':   'chan_d',  // Đông (Chấn)
    'Chấn': 'can_db',  // Đông Bắc (Cấn)
    'Tốn':  'khon_tn', // Tây Nam (Khôn)
    'Khảm': 'doai_t',  // Tây (Đoài)
    'Cấn':  'can_tb',  // Tây Bắc (Càn)
    'Khôn': 'kham_b'   // Bắc (Khảm)
  };

  // 2. Thứ tự bay Cửu Cung Lạc Thư (Lượng Thiên Xích Track)
  const PALACES_TRACK = [
    { id: 'trung',   name: 'Trung Cung', baseNum: 5, centerDeg: 0,   degRange: '' },
    { id: 'can_tb',  name: 'Tây Bắc',    cungName: 'Càn',  baseNum: 6, centerDeg: 315, degRange: '292.5° - 337.5°' },
    { id: 'doai_t',  name: 'Tây',        cungName: 'Đoài', baseNum: 7, centerDeg: 270, degRange: '247.5° - 292.5°' },
    { id: 'can_db',  name: 'Đông Bắc',   cungName: 'Cấn',  baseNum: 8, centerDeg: 45,  degRange: '22.5° - 67.5°' },
    { id: 'ly_n',    name: 'Nam',        cungName: 'Ly',   baseNum: 9, centerDeg: 180, degRange: '157.5° - 202.5°' },
    { id: 'kham_b',  name: 'Bắc',        cungName: 'Khảm', baseNum: 1, centerDeg: 0,   degRange: '337.5° - 22.5°' },
    { id: 'khon_tn', name: 'Tây Nam',    cungName: 'Khôn', baseNum: 2, centerDeg: 225, degRange: '202.5° - 247.5°' },
    { id: 'chan_d',  name: 'Đông',       cungName: 'Chấn', baseNum: 3, centerDeg: 90,  degRange: '67.5° - 112.5°' },
    { id: 'ton_dn',  name: 'Đông Nam',   cungName: 'Tốn',  baseNum: 4, centerDeg: 135, degRange: '112.5° - 157.5°' }
  ];

  // 8 Cung Địa Bàn (không tính Trung Cung)
  const PALACES_8 = PALACES_TRACK.filter(p => p.id !== 'trung');

  // Hàm bay Cửu Cung theo Lượng Thiên Xích (mặc định từ Trung Cung)
  function flyStars(centerStar, isForward) {
    return flyStarsFromPalace('trung', centerStar, isForward);
  }

  // Hàm bay Cửu Cung theo Lượng Thiên Xích bắt đầu từ một Cung bất kỳ
  function flyStarsFromPalace(startPalaceId, startStar, isForward) {
    let startIdx = PALACES_TRACK.findIndex(p => p.id === startPalaceId);
    if (startIdx < 0) startIdx = 0;
    const result = {};
    for (let i = 0; i < 9; i++) {
      const step = (i - startIdx + 9) % 9;
      const star = isForward
        ? ((startStar - 1 + step) % 9) + 1
        : (((startStar - 1 - step) % 9 + 9) % 9) + 1;
      result[PALACES_TRACK[i].id] = star;
    }
    return result;
  }

  // Chuẩn hóa góc 0 - 360
  function normalizeDeg(deg) {
    return ((deg % 360) + 360) % 360;
  }

  // Tra cứu Quẻ HKĐQ từ góc độ
  function getHkdqHexagramByDegree(deg) {
    deg = normalizeDeg(deg);
    const data = global.HKDQ_CORE_DATA;
    if (!data || !data.hexagrams) return null;

    const hexes = Object.values(data.hexagrams);
    for (const h of hexes) {
      if (h.la_kinh) {
        const start = h.la_kinh.deg_start;
        const end = h.la_kinh.deg_end;
        if (start <= end) {
          if (deg >= start && deg < end) return h;
        } else {
          if (deg >= start || deg < end) return h;
        }
      }
    }
    return hexes[0] || null;
  }

  /**
   * Tính toán toàn diện Linh - Chính Thần Vượng / Suy Khí
   * @param {Object} params
   * @param {number} params.huongDeg - Hướng đo La Kinh (Hướng 12h)
   * @param {number} [params.currentVan=9] - Vận khảo sát (Mặc định Vận 9)
   * @returns {Object} Toàn bộ dữ liệu 2 Bảng Phi Tinh và 8 Cung phân loại
   */
  function calculateLinhChinhThan({ huongDeg, currentVan = 9 }) {
    huongDeg = normalizeDeg(huongDeg || 0);
    const toaDeg = normalizeDeg(huongDeg + 180); // Hướng 6 giờ (Tọa Sơn)

    // Tìm Quẻ Tọa
    const queToa = getHkdqHexagramByDegree(toaDeg);
    let thuongQuaiToa = 'Càn';
    let haQuaiToa = 'Càn';
    if (queToa && queToa.ha_thuong_quai) {
      const parts = queToa.ha_thuong_quai.split('/');
      if (parts.length >= 2) {
        haQuaiToa = parts[0].replace('Hạ', '').trim();
        thuongQuaiToa = parts[1].replace('Thượng', '').trim();
      }
    }

    const isHaNguyen = (currentVan >= 6 && currentVan <= 9);

    // BƯỚC 1: Bảng 1 (Vận Tinh: Vận lẻ phi Thuận (+), Vận chẵn phi Nghịch (-) nhập Trung Cung)
    const isVanOdd = (currentVan % 2 !== 0);
    const isVanEven = !isVanOdd;
    const isBang1Forward = isVanOdd; // Vận Lẻ Thuận (+), Vận Chẵn Nghịch (-)
    const bang1 = flyStars(currentVan, isBang1Forward);

    // Tìm cung/ô đang chứa sao số 5 trong Bảng 1
    const cungChuaSao5_Step1 = PALACES_TRACK.find(p => bang1[p.id] === 5) || PALACES_TRACK[5];
    const cungChuaSao5_Id = cungChuaSao5_Step1.id;
    const cungChuaSao5_Name = `${cungChuaSao5_Step1.name} (${cungChuaSao5_Step1.cungName || 'Trung'})`;

    // BƯỚC 2: Thượng quái quẻ Tọa theo hướng Tiên Thiên -> lấy số sao tại hướng đó trên Bảng 1
    const targetDirId = TIEN_THIEN_BAT_QUAI_DIRECTION[thuongQuaiToa] || 'ly_n';
    const saoDan = bang1[targetDirId];

    // BƯỚC 3: Đem sao dẫn (saoDan) đặt vào ô chứa sao số 5 của Bước 1 (cungChuaSao5_Id)
    // Quy tắc bay Bảng 2: Cùng chẵn lẻ với Vận -> Phi Thuận (+), Khác chẵn lẻ với Vận -> Phi Nghịch (-)
    const isStarDanOdd = (saoDan % 2 !== 0);
    const isBang2Forward = (isVanOdd === isStarDanOdd);
    const bang2 = flyStarsFromPalace(cungChuaSao5_Id, saoDan, isBang2Forward);

    // BƯỚC 4: Đánh giá 8 Cung
    const palacesAnalysis = {};
    let countLinhVuong = 0;
    let countChinhVuong = 0;

    PALACES_8.forEach(p => {
      // 1. Phân định Linh / Chính Thần theo Cửu Cung Lạc Thư gốc
      let role = '';
      if (isHaNguyen) {
        // Hạ Nguyên: 6, 7, 8, 9 là Chính Thần; 1, 2, 3, 4 là Linh Thần
        role = (p.baseNum >= 6 && p.baseNum <= 9) ? 'Chính Thần' : 'Linh Thần';
      } else {
        // Thượng Nguyên: 1, 2, 3, 4 là Chính Thần; 6, 7, 8, 9 là Linh Thần
        role = (p.baseNum >= 1 && p.baseNum <= 4) ? 'Chính Thần' : 'Linh Thần';
      }

      // 2. Xét Vượng / Suy từ số của Bảng 2
      const starVal = bang2[p.id];
      let isVuong = false;
      if (starVal === 1 || starVal === 5 || starVal === 9) {
        isVuong = true; // 1, 5, 9 luôn là Vượng Khí cả Thượng và Hạ Nguyên
      } else if (isHaNguyen) {
        // Hạ Nguyên: 6, 7, 8 là Vượng Khí; 2, 3, 4 là Suy Khí
        isVuong = (starVal === 6 || starVal === 7 || starVal === 8);
      } else {
        // Thượng Nguyên: 2, 3, 4 là Vượng Khí; 6, 7, 8 là Suy Khí
        isVuong = (starVal === 2 || starVal === 3 || starVal === 4);
      }

      // 3. Phân loại 4 Trạng Thái & Mã Màu
      let type = '';
      let label = '';
      let shortLabel = '';
      let color = '';
      let borderColor = '';
      let bgColor = '';
      let icon = '';
      let action = '';
      let badgeClass = '';

      if (role === 'Linh Thần' && isVuong) {
        type = 'LINH_VUONG';
        label = 'Linh Thần Vượng Khí';
        shortLabel = 'Linh Vượng';
        color = '#38bdf8';
        borderColor = '#0284c7';
        bgColor = 'rgba(2, 132, 199, 0.25)';
        icon = '💧';
        action = 'ĐẠI CÁT ĐẶT THỦY: Vị trí vàng đặt hồ cá, thác nước, mở cửa đón tài vận.';
        badgeClass = 'badge-linh-vuong';
        countLinhVuong++;
      } else if (role === 'Linh Thần' && !isVuong) {
        type = 'LINH_SUY';
        label = 'Linh Thần Suy Khí';
        shortLabel = 'Linh Suy';
        color = '#94a3b8';
        borderColor = '#475569';
        bgColor = 'rgba(71, 85, 105, 0.20)';
        icon = '⚠️';
        action = 'NÉ ĐỘNG THỦY: Linh Thần ngậm suy khí, tuyệt đối không đặt nước động.';
        badgeClass = 'badge-linh-suy';
      } else if (role === 'Chính Thần' && isVuong) {
        type = 'CHINH_VUONG';
        label = 'Chính Thần Vượng Khí';
        shortLabel = 'Chính Vượng';
        color = '#f87171';
        borderColor = '#dc2626';
        bgColor = 'rgba(220, 38, 38, 0.25)';
        icon = '🏔️';
        action = 'ĐẠI CÁT TỌA SƠN: Vị trí vàng tựa lưng, đặt phòng ngủ, bàn thờ vượng nhân đinh.';
        badgeClass = 'badge-chinh-vuong';
        countChinhVuong++;
      } else {
        type = 'CHINH_SUY';
        label = 'Chính Thần Suy Khí';
        shortLabel = 'Chính Suy';
        color = '#fbbf24';
        borderColor = '#d97706';
        bgColor = 'rgba(217, 119, 6, 0.20)';
        icon = '🛡️';
        action = 'CHÍNH THẦN SUY: Nhân đinh suy yếu, cần hóa giải bằng điểm tựa tĩnh tại.';
        badgeClass = 'badge-chinh-suy';
      }

      palacesAnalysis[p.id] = {
        id: p.id,
        name: p.name,
        cungName: p.cungName,
        baseNum: p.baseNum,
        centerDeg: p.centerDeg,
        degRange: p.degRange,
        starBang1: bang1[p.id],
        starBang2: starVal,
        role: role,
        isVuong: isVuong,
        gasStatus: isVuong ? 'Vượng Khí' : 'Suy Khí',
        type: type,
        label: label,
        shortLabel: shortLabel,
        color: color,
        borderColor: borderColor,
        bgColor: bgColor,
        icon: icon,
        action: action,
        badgeClass: badgeClass
      };
    });

    const targetPalaceInfo = PALACES_TRACK.find(p => p.id === targetDirId);

    return {
      huongDeg,
      toaDeg,
      currentVan,
      isHaNguyen,
      queToa: queToa ? {
        id: queToa.id,
        tenQue: queToa.ten_que,
        name: queToa.ten_que,
        quaiKhi: queToa.quai_khi,
        quaiVan: queToa.quai_van,
        haThuongQuai: queToa.ha_thuong_quai,
        thuongQuai: thuongQuaiToa,
        haQuai: haQuaiToa,
        cungBatQuai: queToa.cung_bat_quai,
        son: queToa.la_kinh ? queToa.la_kinh.son_24 : ''
      } : null,
      toaQue: queToa ? {
        id: queToa.id,
        tenQue: queToa.ten_que,
        name: queToa.ten_que,
        quaiKhi: queToa.quai_khi,
        quaiVan: queToa.quai_van,
        haThuongQuai: queToa.ha_thuong_quai,
        thuongQuai: thuongQuaiToa,
        haQuai: haQuaiToa,
        cungBatQuai: queToa.cung_bat_quai,
        son: queToa.la_kinh ? queToa.la_kinh.son_24 : ''
      } : null,
      thuongQuaiName: thuongQuaiToa,
      huongTienThienThuongQuai: targetPalaceInfo ? `${targetPalaceInfo.name} (${targetPalaceInfo.cungName})` : 'Nam (Ly)',
      cungChuaSao5_B1_Id: cungChuaSao5_Id,
      cungChuaSao5_B1_Name: cungChuaSao5_Name,
      saoDan: saoDan,
      saoNhapB2: saoDan,
      phiThuanB1: isBang1Forward,
      ruleB1: isVanOdd ? 'Vận lẻ phi Thuận (+)' : 'Vận chẵn phi Nghịch (-)',
      phiThuanB2: isBang2Forward,
      ruleB2: (isVanOdd === isStarDanOdd) ? 'Cùng chẵn/lẻ với Vận' : 'Khác chẵn/lẻ với Vận',
      tienThienInfo: {
        thuongQuai: thuongQuaiToa,
        targetDirId: targetDirId,
        targetDirName: targetPalaceInfo ? targetPalaceInfo.name : 'Nam (Ly)'
      },
      bang1: {
        center: currentVan,
        isForward: isBang1Forward,
        directionText: isBang1Forward ? 'Phi Thuận (+)' : 'Phi Nghịch (-)',
        cungSao5: cungChuaSao5_Name,
        cungSao5Id: cungChuaSao5_Id,
        stars: bang1
      },
      bang2: {
        startPalaceId: cungChuaSao5_Id,
        startPalaceName: cungChuaSao5_Name,
        startStar: saoDan,
        center: bang2['trung'],
        isForward: isBang2Forward,
        directionText: isBang2Forward ? 'Phi Thuận (+)' : 'Phi Nghịch (-)',
        stars: bang2
      },
      palaces: palacesAnalysis,
      cungResults: Object.values(palacesAnalysis).map(p => ({
        cungId: p.baseNum,
        cungName: p.cungName,
        huong: p.name,
        saoB1: p.starBang1,
        saoB2: p.starBang2,
        linhChinh: p.role,
        vuongSuy: p.gasStatus,
        ketLuan: p.type,
        dienGiai: p.label,
        loiKhuyen: p.action,
        color: p.color,
        icon: p.icon
      })),
      summary: {
        countLinhVuong,
        countChinhVuong,
        linhVuongPalaces: Object.values(palacesAnalysis).filter(p => p.type === 'LINH_VUONG').map(p => p.name),
        chinhVuongPalaces: Object.values(palacesAnalysis).filter(p => p.type === 'CHINH_VUONG').map(p => p.name)
      }
    };
  }

  const LinhChinhEngine = {
    TIEN_THIEN_BAT_QUAI_DIRECTION,
    PALACES_TRACK,
    PALACES_8,
    normalizeDeg,
    flyStars,
    getHkdqHexagramByDegree,
    calculateLinhChinhThan
  };

  global.LinhChinhEngine = LinhChinhEngine;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = LinhChinhEngine;
  }

})(typeof window !== 'undefined' ? window : globalThis);
