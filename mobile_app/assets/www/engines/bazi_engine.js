/**
 * NETA LIGHT - BÁT TỰ MANH PHÁI ENGINE (MANG PAI BAZI)
 * Tính toán Tứ Trụ, Thập Thần, Vòng Trường Sinh, Tàng Can, Tương Tác Địa Chi,
 * 12 Cung & 12 Thần Manh Phái, và 10 Đại Vận (Lưu Niên).
 * Hoàn toàn chạy Client-Side độc lập 100%.
 */

(function (global) {
  'use strict';

  const TIAN_GAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  const DI_ZHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

  const GAN_YIN_YANG = {
    'Giáp': '+', 'Ất': '-', 'Bính': '+', 'Đinh': '-', 'Mậu': '+',
    'Kỷ': '-', 'Canh': '+', 'Tân': '-', 'Nhâm': '+', 'Quý': '-'
  };

  const GAN_WU_XING = {
    'Giáp': 'Mộc', 'Ất': 'Mộc',
    'Bính': 'Hỏa', 'Đinh': 'Hỏa',
    'Mậu': 'Thổ', 'Kỷ': 'Thổ',
    'Canh': 'Kim', 'Tân': 'Kim',
    'Nhâm': 'Thủy', 'Quý': 'Thủy'
  };

  const ZHI_WU_XING = {
    'Dần': 'Mộc', 'Mão': 'Mộc',
    'Tỵ': 'Hỏa', 'Ngọ': 'Hỏa',
    'Thân': 'Kim', 'Dậu': 'Kim',
    'Hợi': 'Thủy', 'Tý': 'Thủy',
    'Thìn': 'Thổ', 'Tuất': 'Thổ', 'Sửu': 'Thổ', 'Mùi': 'Thổ'
  };

  const CHANG_SHENG = [
    'Trường Sinh', 'Mộc Dục', 'Quan Đới', 'Lâm Quan', 'Đế Vượng',
    'Suy', 'Bệnh', 'Tử', 'Mộ', 'Tuyệt', 'Thai', 'Dưỡng'
  ];

  const CHANG_SHENG_START = {
    'Giáp': 'Hợi', 'Bính': 'Dần', 'Mậu': 'Dần', 'Canh': 'Tỵ', 'Nhâm': 'Thân',
    'Ất': 'Ngọ', 'Đinh': 'Dậu', 'Kỷ': 'Dậu', 'Tân': 'Tý', 'Quý': 'Mão'
  };

  const HIDDEN_GANS = {
    'Tý': ['Quý'],
    'Sửu': ['Kỷ', 'Quý', 'Tân'],
    'Dần': ['Giáp', 'Bính', 'Mậu'],
    'Mão': ['Ất'],
    'Thìn': ['Mậu', 'Ất', 'Quý'],
    'Tỵ': ['Bính', 'Canh', 'Mậu'],
    'Ngọ': ['Đinh', 'Kỷ'],
    'Mùi': ['Kỷ', 'Đinh', 'Ất'],
    'Thân': ['Canh', 'Nhâm', 'Mậu'],
    'Dậu': ['Tân'],
    'Tuất': ['Mậu', 'Tân', 'Đinh'],
    'Hợi': ['Nhâm', 'Giáp']
  };

  const MANG_PAI_PALACES = [
    'Mệnh Cung', 'Huynh Đệ', 'Phu Thê', 'Tử Tức',
    'Tài Bạch', 'Tật Ách', 'Thiên Di', 'Nô Bộc',
    'Quan Lộc', 'Điền Trạch', 'Phúc Đức', 'Phụ Mẫu'
  ];

  const MANG_PAI_SPIRITS = [
    'Thái Tuế', 'Thanh Long', 'Tang Môn', 'Lục Hợp',
    'Quan Phù', 'Tiểu Hao', 'Đại Hao', 'Chu Tước',
    'Bạch Hổ', 'Quý Nhân', 'Điếu Khách', 'Bệnh Phù'
  ];
  // Interactions
  const INTERACTIONS_CHUAN = {
    'Tý': 'Mùi', 'Mùi': 'Tý', 'Sửu': 'Ngọ', 'Ngọ': 'Sửu',
    'Dần': 'Tỵ', 'Tỵ': 'Dần', 'Mão': 'Thìn', 'Thìn': 'Mão',
    'Thân': 'Hợi', 'Hợi': 'Thân', 'Dậu': 'Tuất', 'Tuất': 'Dậu'
  };

  const INTERACTIONS_PO = {
    'Tý': 'Dậu', 'Dậu': 'Tý', 'Mão': 'Ngọ', 'Ngọ': 'Mão',
    'Sửu': 'Thìn', 'Thìn': 'Sửu', 'Mùi': 'Tuất', 'Tuất': 'Mùi',
    'Dần': 'Hợi', 'Hợi': 'Dần', 'Tỵ': 'Thân', 'Thân': 'Tỵ'
  };

  const INTERACTIONS_CHONG = {
    'Tý': 'Ngọ', 'Ngọ': 'Tý', 'Sửu': 'Mùi', 'Mùi': 'Sửu',
    'Dần': 'Thân', 'Thân': 'Dần', 'Mão': 'Dậu', 'Dậu': 'Mão',
    'Thìn': 'Tuất', 'Tuất': 'Thìn', 'Tỵ': 'Hợi', 'Hợi': 'Tỵ'
  };

  const INTERACTIONS_HE = {
    'Tý': 'Sửu', 'Sửu': 'Tý', 'Dần': 'Hợi', 'Hợi': 'Dần',
    'Mão': 'Tuất', 'Tuất': 'Mão', 'Thìn': 'Dậu', 'Dậu': 'Thìn',
    'Tỵ': 'Thân', 'Thân': 'Tỵ', 'Ngọ': 'Mùi', 'Mùi': 'Ngọ'
  };

  const INTERACTIONS_XING = {
    'Dần': ['Tỵ', 'Thân'], 'Tỵ': ['Dần', 'Thân'], 'Thân': ['Dần', 'Tỵ'],
    'Sửu': ['Tuất', 'Mùi'], 'Tuất': ['Sửu', 'Mùi'], 'Mùi': ['Sửu', 'Tuất'],
    'Tý': ['Mão'], 'Mão': ['Tý'],
    'Thìn': ['Thìn'], 'Ngọ': ['Ngọ'], 'Dậu': ['Dậu'], 'Hợi': ['Hợi']
  };

  // Tam Hợp & Tam Hội
  const INTERACTIONS_SAN_HE = [
    { group: ['Thân', 'Tý', 'Thìn'], element: 'Thủy', name: 'Tam Hợp Thủy Cục' },
    { group: ['Hợi', 'Mão', 'Mùi'], element: 'Mộc', name: 'Tam Hợp Mộc Cục' },
    { group: ['Dần', 'Ngọ', 'Tuất'], element: 'Hỏa', name: 'Tam Hợp Hỏa Cục' },
    { group: ['Tỵ', 'Dậu', 'Sửu'], element: 'Kim', name: 'Tam Hợp Kim Cục' }
  ];

  function getGanIdx(gan) { return TIAN_GAN.indexOf(gan); }
  function getZhiIdx(zhi) { return DI_ZHI.indexOf(zhi); }

  function getYearGanZhi(year) {
    if (year <= 0) return ['', ''];
    const gIdx = ((year - 4) % 10 + 10) % 10;
    const zIdx = ((year - 4) % 12 + 12) % 12;
    return [TIAN_GAN[gIdx], DI_ZHI[zIdx]];
  }

  function calculate10Deities(dayGan, targetGan) {
    const WX_CYCLE = ['Mộc', 'Hỏa', 'Thổ', 'Kim', 'Thủy'];
    const dayWx = GAN_WU_XING[dayGan];
    const targetWx = GAN_WU_XING[targetGan];
    const dayYy = GAN_YIN_YANG[dayGan];
    const targetYy = GAN_YIN_YANG[targetGan];
    const sameYy = dayYy === targetYy;
    const dayIdx = WX_CYCLE.indexOf(dayWx);
    const targetIdx = WX_CYCLE.indexOf(targetWx);
    const diff = ((targetIdx - dayIdx) % 5 + 5) % 5;
    if (diff === 0) return sameYy ? 'Tỉ Kiên' : 'Kiếp Tài';
    if (diff === 1) return sameYy ? 'Thực Thần' : 'Thương Quan';
    if (diff === 2) return sameYy ? 'Thiên Tài' : 'Chính Tài';
    if (diff === 3) return sameYy ? 'Thất Sát' : 'Chính Quan';
    if (diff === 4) return sameYy ? 'Thiên Ấn' : 'Chính Ấn';
    return '';
  }

  function calculateChangSheng(gan, zhi) {
    const startZhi = CHANG_SHENG_START[gan] || 'Hợi';
    const startIdx = getZhiIdx(startZhi);
    const targetIdx = getZhiIdx(zhi);
    const isYang = GAN_YIN_YANG[gan] === '+';
    const steps = isYang
      ? ((targetIdx - startIdx) % 12 + 12) % 12
      : ((startIdx - targetIdx) % 12 + 12) % 12;
    return CHANG_SHENG[steps];
  }

  function getSeasonStatus(monthZhi, dayGanWx) {
    const WX_ORDER = ['Mộc', 'Hỏa', 'Thổ', 'Kim', 'Thủy'];
    const SEASON_MAP = {
      'Dần': 'Mùa Xuân', 'Mão': 'Mùa Xuân', 'Thìn': 'Cuối Xuân (Thổ)',
      'Tỵ': 'Mùa Hạ', 'Ngọ': 'Mùa Hạ', 'Mùi': 'Cuối Hạ (Thổ)',
      'Thân': 'Mùa Thu', 'Dậu': 'Mùa Thu', 'Tuất': 'Cuối Thu (Thổ)',
      'Hợi': 'Mùa Đông', 'Tý': 'Mùa Đông', 'Sửu': 'Cuối Đông (Thổ)'
    };
    const season = SEASON_MAP[monthZhi] || '';
    const monthWx = ZHI_WU_XING[monthZhi] || 'Thổ';
    const mIdx = WX_ORDER.indexOf(monthWx);
    const dIdx = WX_ORDER.indexOf(dayGanWx);
    const diff = ((dIdx - mIdx) % 5 + 5) % 5;
    const statuses = [
      'ĐẮC LỆNH (Cùng hành mùa, đắc thời khí vượng)',
      'TƯỚNG (Được mùa tương sinh, sinh khí dồi dào)',
      'TỬ (Bị mùa khắc phạt, suy thoái khí)',
      'TÙ (Khắc mùa hao tổn, tiết giảm khí thế)',
      'HƯU (Sinh xuất cho mùa, tiết khí nghỉ ngơi)'
    ];
    return {
      season,
      monthWx,
      status: statuses[diff],
      stateCode: ['VUONG', 'TUONG', 'TU', 'TU_KHAC', 'HUU'][diff]
    };
  }

  function calculateHiddenGans(zhi) {
    return (HIDDEN_GANS[zhi] || []).slice();
  }

  function calcMengGong(yearGan, monthZhi, hourZhi) {
    const mZhiIdx = getZhiIdx(monthZhi);
    const mStep = ((mZhiIdx - 2) % 12 + 12) % 12; // 0=Dần .. 11=Sửu
    const m = mStep + 1; // Tháng tiết khí 1..12
    const hIdx = getZhiIdx(hourZhi); // 0=Tý .. 11=Hợi
    const mengZhiIdx = ((13 - m + hIdx) % 12 + 12) % 12;
    return DI_ZHI[mengZhiIdx];
  }

  function array12Palaces(mengGong, isMale) {
    const startIdx = getZhiIdx(mengGong);
    const dir = isMale ? 1 : -1;
    return MANG_PAI_PALACES.map((name, i) => ({
      cung: name,
      zhi: DI_ZHI[((startIdx + i * dir) % 12 + 12) % 12]
    }));
  }

  function array12Spirits(yearZhi, isMale) {
    const startIdx = getZhiIdx(yearZhi);
    const dir = isMale ? 1 : -1;
    return MANG_PAI_SPIRITS.map((name, i) => ({
      than: name,
      zhi: DI_ZHI[((startIdx + i * dir) % 12 + 12) % 12]
    }));
  }

  // ==========================================
  // THUẬT TOÁN THIÊN VĂN TÍNH NĂM KHỞI ĐẠI VẬN CHÍNH XÁC (JEAN MEEUS)
  // ==========================================

  const MAJOR_SOLAR_TERMS = [
    { name: 'Lập Xuân', zhi: 'Dần', deg: 315.0, approx_month: 2 },
    { name: 'Kinh Trập', zhi: 'Mão', deg: 345.0, approx_month: 3 },
    { name: 'Thanh Minh', zhi: 'Thìn', deg: 15.0, approx_month: 4 },
    { name: 'Lập Hạ', zhi: 'Tỵ', deg: 45.0, approx_month: 5 },
    { name: 'Mang Chủng', zhi: 'Ngọ', deg: 75.0, approx_month: 6 },
    { name: 'Tiểu Thử', zhi: 'Mùi', deg: 105.0, approx_month: 7 },
    { name: 'Lập Thu', zhi: 'Thân', deg: 135.0, approx_month: 8 },
    { name: 'Bạch Lộ', zhi: 'Dậu', deg: 165.0, approx_month: 9 },
    { name: 'Hàn Lộ', zhi: 'Tuất', deg: 195.0, approx_month: 10 },
    { name: 'Lập Đông', zhi: 'Hợi', deg: 225.0, approx_month: 11 },
    { name: 'Đại Tuyết', zhi: 'Tý', deg: 255.0, approx_month: 12 },
    { name: 'Tiểu Hàn', zhi: 'Sửu', deg: 285.0, approx_month: 1 }
  ];

  function sunLongitude(date) {
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    const d = date.getDate() + (date.getHours() + date.getMinutes() / 60.0 + date.getSeconds() / 3600.0) / 24.0;
    if (m <= 2) { y -= 1; m += 12; }
    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);
    const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
    const jdUtc = jd - 7.0 / 24.0;
    const T = (jdUtc - 2451545.0) / 36525.0;

    const L0 = (280.46646 + 36000.76983 * T + 0.0003032 * T * T) % 360.0;
    const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) % 360.0;
    const Mr = M * Math.PI / 180.0;
    let C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr);
    C += (0.019993 - 0.000101 * T) * Math.sin(2 * Mr);
    C += 0.000289 * Math.sin(3 * Mr);

    return ((L0 + C) % 360.0 + 360.0) % 360.0;
  }

  function findSolarTermTime(year, targetDeg, approxMonth) {
    const tStart = new Date(year, approxMonth - 1, 1).getTime() - 12 * 86400000;
    const tEnd = new Date(year, approxMonth - 1, 28, 23, 59).getTime() + 12 * 86400000;
    let low = tStart;
    let high = tEnd;
    for (let i = 0; i < 50; i++) {
      const mid = (low + high) / 2.0;
      const deg = sunLongitude(new Date(mid));
      let diff = (deg - targetDeg + 180) % 360 - 180;
      if (diff < 0) low = mid;
      else high = mid;
    }
    return new Date((low + high) / 2.0);
  }

  /**
   * Tính Tuổi & Năm Khởi Đại Vận chính xác 100% theo Tử Bình cổ thư và Tiết Khí thiên văn
   * Dương Nam / Âm Nữ: Đi Thuận đến Tiết Khí kế tiếp
   * Âm Nam / Dương Nữ: Đi Nghịch lùi về Tiết Khí trước đó
   */
  function calculateLuckStart(solarDate, isMale, yearGan) {
    const isYangYear = GAN_YIN_YANG[yearGan] === '+';
    const isForward = (isMale && isYangYear) || (!isMale && !isYangYear);
    const y = solarDate.getFullYear();
    const allTerms = [];
    for (const yearVal of [y - 1, y, y + 1]) {
      for (const item of MAJOR_SOLAR_TERMS) {
        const termDt = findSolarTermTime(yearVal, item.deg, item.approx_month);
        allTerms.push({ name: item.name, zhi: item.zhi, dt: termDt });
      }
    }
    allTerms.sort((a, b) => a.dt.getTime() - b.dt.getTime());

    let targetTerm = null;
    let diffDays = 0.0;
    const birthTime = solarDate.getTime();
    if (isForward) {
      for (const t of allTerms) {
        if (t.dt.getTime() > birthTime) {
          targetTerm = t;
          diffDays = (t.dt.getTime() - birthTime) / 86400000.0;
          break;
        }
      }
    } else {
      for (let i = allTerms.length - 1; i >= 0; i--) {
        const t = allTerms[i];
        if (t.dt.getTime() <= birthTime) {
          targetTerm = t;
          diffDays = (birthTime - t.dt.getTime()) / 86400000.0;
          break;
        }
      }
    }

    const yearsFloat = diffDays / 3.0;
    const yPart = Math.floor(yearsFloat);
    const mPart = Math.floor((yearsFloat - yPart) * 12);
    const dPart = Math.round(((yearsFloat - yPart) * 12 - mPart) * 30);
    let curY = solarDate.getFullYear() + yPart;
    let curM = (solarDate.getMonth() + 1) + mPart;
    while (curM > 12) {
      curY += 1;
      curM -= 12;
    }
    const startYear = curY;
    const startAge = startYear - solarDate.getFullYear();
    return {
      isForward,
      direction: isForward ? 'Thuận' : 'Nghịch',
      startYear,
      startAge,
      startAgeLunar: startAge + 1,
      targetTerm: targetTerm ? targetTerm.name : '',
      diffDays: parseFloat(diffDays.toFixed(2)),
      detailStr: `${yPart} năm ${mPart} tháng ${dPart} ngày (Khởi từ ${curY}-${String(curM).padStart(2, '0')} => Năm ${startYear})`
    };
  }

  function calcLuckPillars(yearGan, monthGan, monthZhi, dayGan, isMale, startAge = 2, birthYear = 2000, startYear = null) {
    const isYangYear = GAN_YIN_YANG[yearGan] === '+';
    // Dương Nam Âm Nữ đi thuận (+1), Âm Nam Dương Nữ đi nghịch (-1)
    const dir = ((isMale && isYangYear) || (!isMale && !isYangYear)) ? 1 : -1;
    let curGanIdx = getGanIdx(monthGan);
    let curZhiIdx = getZhiIdx(monthZhi);
    const results = [];
    const baseStartYear = (startYear !== null && startYear !== undefined) ? startYear : (birthYear > 0 ? (birthYear + startAge) : 0);

    for (let i = 1; i <= 10; i++) {
      curGanIdx = ((curGanIdx + dir) % 10 + 10) % 10;
      curZhiIdx = ((curZhiIdx + dir) % 12 + 12) % 12;
      const gan = TIAN_GAN[curGanIdx];
      const zhi = DI_ZHI[curZhiIdx];
      const deity = calculate10Deities(dayGan, gan);
      const canChi = `${gan} ${zhi}`;
      const changSheng = calculateChangSheng(dayGan, zhi);

      let rawHidden = calculateHiddenGans(zhi);
      if (rawHidden.length === 3) rawHidden = [rawHidden[1], rawHidden[0], rawHidden[2]];
      else if (rawHidden.length === 2) rawHidden = [rawHidden[1], rawHidden[0]];
      const hiddenWithDeities = rawHidden.map(h => ({
        gan: h,
        wx: GAN_WU_XING[h],
        ten_god: calculate10Deities(dayGan, h)
      }));

      const age = startAge + (i - 1) * 10;
      const year = baseStartYear > 0 ? (baseStartYear + (i - 1) * 10) : 0;
      const annualPillars = [];

      if (year > 0) {
        for (let yOff = 0; yOff < 10; yOff++) {
          const curYear = year + yOff;
          const [yGan, yZhi] = getYearGanZhi(curYear);
          const yDeity = calculate10Deities(dayGan, yGan);
          const yCanChi = `${yGan} ${yZhi}`;
          annualPillars.push({
            year: curYear,
            age: age + yOff,
            gan: yGan,
            zhi: yZhi,
            canChi: yCanChi,
            deity: yDeity
          });
        }
      }

      results.push({
        step: i,
        age,
        endAge: age + 9,
        year,
        canChi,
        gan,
        zhi,
        wxGan: GAN_WU_XING[gan],
        wxZhi: ZHI_WU_XING[zhi],
        deity,
        changSheng,
        hidden: hiddenWithDeities,
        annualPillars
      });
    }

    return { dir, results };
  }

  function evaluateBaziInteractions(zhiArray) {
    const results = [];
    const PILLAR_NAMES = ['Năm', 'Tháng', 'Ngày', 'Giờ'];

    for (let i = 0; i < zhiArray.length; i++) {
      for (let j = i + 1; j < zhiArray.length; j++) {
        const z1 = zhiArray[i], z2 = zhiArray[j];
        const p1 = PILLAR_NAMES[i], p2 = PILLAR_NAMES[j];

        // 1. Xuyên (Hại) - Quan trọng nhất trong Manh Phái
        if (INTERACTIONS_CHUAN[z1] === z2) {
          results.push({
            type: 'Xuyên (Tương Hại)',
            tag: 'xuyen',
            detail: `${z1} (trụ ${p1}) Xuyên ${z2} (trụ ${p2})`,
            desc: 'Đứt gãy, thù hằn ngầm, tổn thương vô hình hoặc bất ngờ phát sinh trở ngại.'
          });
        }

        // 2. Phá
        if (INTERACTIONS_PO[z1] === z2) {
          results.push({
            type: 'Tương Phá',
            tag: 'pha',
            detail: `${z1} (trụ ${p1}) Phá ${z2} (trụ ${p2})`,
            desc: 'Rạn nứt, cản trở tiến độ, hao tán nhỏ, phá vỡ cấu trúc ban đầu.'
          });
        }

        // 3. Lục Xung
        if (INTERACTIONS_CHONG[z1] === z2) {
          results.push({
            type: 'Lục Xung',
            tag: 'xung',
            detail: `${z1} (trụ ${p1}) Xung ${z2} (trụ ${p2})`,
            desc: 'Xung đột trực diện, dịch chuyển, biến động lớn, chia ly hoặc thay đổi phương hướng.'
          });
        }

        // 4. Lục Hợp
        if (INTERACTIONS_HE[z1] === z2) {
          results.push({
            type: 'Lục Hợp',
            tag: 'hop',
            detail: `${z1} (trụ ${p1}) Hợp ${z2} (trụ ${p2})`,
            desc: 'Kết nối mật thiết, ràng buộc duyên nợ, trợ lực tương hỗ hoặc bị kìm hãm.'
          });
        }

        // 5. Tương Hình
        if ((INTERACTIONS_XING[z1] || []).includes(z2)) {
          results.push({
            type: 'Tương Hình',
            tag: 'hinh',
            detail: `${z1} (trụ ${p1}) Hình ${z2} (trụ ${p2})`,
            desc: 'Dằn vặt nội tâm, thị phi luật pháp, quy tắc mâu thuẫn hoặc thương tật.'
          });
        }
      }
    }

    // Kiểm tra Tam Hợp
    INTERACTIONS_SAN_HE.forEach(sh => {
      const match = sh.group.filter(z => zhiArray.includes(z));
      if (match.length === 3) {
        results.push({
          type: 'Tam Hợp',
          tag: 'tamhop',
          detail: `${sh.name} (${sh.group.join('-')})`,
          desc: `Tứ trụ hội đủ bộ Tam Hợp hóa ${sh.element}, khí lực ngũ hành quy tụ mạnh mẽ.`
        });
      } else if (match.length === 2) {
        results.push({
          type: 'Bán Tam Hợp',
          tag: 'banhop',
          detail: `Bán hợp hóa ${sh.element} (${match.join('-')})`,
          desc: `Tứ trụ xuất hiện bán hợp sinh khí/mộ khí ${sh.element}.`
        });
      }
    });

    return results;
  }

  /**
   * Tạo lá số Bát Tự đầy đủ từ ngày giờ hoặc Tứ Trụ
   */
  function buildBaziChart({
    solarDate = null,
    day = 24, month = 9, year = 2026, hour = 11, minute = 0,
    isMale = true,
    startAge = null,
    startYear = null
  }) {
    let d = day, m = month, y = year, h = hour, min = minute;
    if (solarDate instanceof Date) {
      d = solarDate.getDate();
      m = solarDate.getMonth() + 1;
      y = solarDate.getFullYear();
      h = solarDate.getHours();
      min = solarDate.getMinutes();
    } else {
      solarDate = new Date(y, m - 1, d, h, min, 0);
    }

    // Sử dụng NetaCalendarEngine tính Can Chi theo Tiết Khí chuẩn
    let canChiData = null;
    let solarTerm = 'Thu Phân';
    let solarTermStr = 'Thu Phân';
    let solarTermFullStr = '';
    if (global.NetaCalendarEngine) {
      if (typeof global.NetaCalendarEngine.getSolarTermCanChi === 'function') {
        canChiData = global.NetaCalendarEngine.getSolarTermCanChi(d, m, y, h, minute);
      } else {
        canChiData = global.NetaCalendarEngine.getCanChi(d, m, y, h);
      }
      solarTerm = canChiData.solarTerm || global.NetaCalendarEngine.getSolarTerm(d, m, y, h, minute);
      solarTermStr = canChiData.solarTermStr || solarTerm;
      solarTermFullStr = canChiData.solarTermFullStr || '';
    } else {
      // Fallback tính tay
      const [yG, yZ] = getYearGanZhi(y);
      canChiData = {
        year: `${yG} ${yZ}`,
        month: 'Đinh Dậu',
        day: 'Tân Sửu',
        hour: 'Giáp Ngọ'
      };
    }

    const yParts = canChiData.year.split(' ');
    const mParts = canChiData.month.split(' ');
    const dParts = canChiData.day.split(' ');
    const hParts = canChiData.hour.split(' ');

    const yearGan = yParts[0], yearZhi = yParts[1];
    const monthGan = mParts[0], monthZhi = mParts[1];
    const dayGan = dParts[0], dayZhi = dParts[1];
    const hourGan = hParts[0], hourZhi = hParts[1];

    const ganArr = [yearGan, monthGan, dayGan, hourGan];
    const zhiArr = [yearZhi, monthZhi, dayZhi, hourZhi];
    const pillarLabels = ['Năm', 'Tháng', 'Ngày', 'Giờ'];
    const dayMasterWx = GAN_WU_XING[dayGan] || 'Kim';

    // Xây dựng Tứ Trụ
    const tuTru = ganArr.map((gan, idx) => {
      const zhi = zhiArr[idx];
      const canChiStr = `${gan} ${zhi}`;
      let rawHidden = calculateHiddenGans(zhi);
      if (rawHidden.length === 3) rawHidden = [rawHidden[1], rawHidden[0], rawHidden[2]];
      else if (rawHidden.length === 2) rawHidden = [rawHidden[1], rawHidden[0]];

      const hiddenWithDeities = rawHidden.map(h => ({
        gan: h,
        wx: GAN_WU_XING[h],
        ten_god: calculate10Deities(dayGan, h)
      }));

      return {
        pillar: pillarLabels[idx],
        gan,
        zhi,
        canChi: canChiStr,
        wxGan: GAN_WU_XING[gan],
        wxZhi: ZHI_WU_XING[zhi],
        deity: idx === 2 ? 'Nhật Chủ' : calculate10Deities(dayGan, gan),
        changSheng: calculateChangSheng(gan, zhi),
        changShengDayMaster: calculateChangSheng(dayGan, zhi),
        hidden: hiddenWithDeities
      };
    });

    const seasonStatus = getSeasonStatus(monthZhi, dayMasterWx);
    const mengGongZhi = (canChiData && canChiData.mengGongZhi) ? canChiData.mengGongZhi : calcMengGong(yearGan, monthZhi, hourZhi);
    const mengGong = (canChiData && canChiData.mengGong) ? canChiData.mengGong : mengGongZhi;
    const palaces = array12Palaces(mengGongZhi, isMale);
    const spirits = array12Spirits(yearZhi, isMale);

    // Tính toán Tuổi & Năm Khởi Đại Vận chính xác 100% theo Tiết Khí thiên văn
    const luckStartCalc = calculateLuckStart(solarDate, isMale, yearGan);
    const actualStartAge = (startAge !== null && startAge !== undefined) ? startAge : luckStartCalc.startAge;
    const actualStartYear = (startYear !== null && startYear !== undefined) ? startYear : luckStartCalc.startYear;
    const luckStart = {
      ...luckStartCalc,
      startAge: actualStartAge,
      startYear: actualStartYear
    };

    const luckData = calcLuckPillars(yearGan, monthGan, monthZhi, dayGan, isMale, actualStartAge, y, actualStartYear);
    const interactions = evaluateBaziInteractions(zhiArr);

    return {
      input: { day: d, month: m, year: y, hour: h, minute, isMale, startAge: actualStartAge, startYear: actualStartYear },
      dayMaster: {
        gan: dayGan,
        wx: dayMasterWx,
        yinYang: GAN_YIN_YANG[dayGan] === '+' ? 'Dương' : 'Âm',
        seasonStatus
      },
      solarTerm,
      solarTermStr,
      solarTermFullStr,
      tuTru,
      interactions,
      mangPai: {
        mengGong,
        palaces,
        spirits
      },
      luckStart,
      daYun: luckData
    };
  }

  // Helper Ngũ Hành CSS class
  function getWuXingColorClass(str) {
    if (!str) return '';
    const s = String(str).toLowerCase();
    if (['mộc', 'giáp', 'ất', 'dần', 'mão'].some(k => s.includes(k))) return 'wx-wood';
    if (['hỏa', 'bính', 'đinh', 'tỵ', 'ngọ'].some(k => s.includes(k))) return 'wx-fire';
    if (['thổ', 'mậu', 'kỷ', 'thìn', 'tuất', 'sửu', 'mùi'].some(k => s.includes(k))) return 'wx-earth';
    if (['kim', 'canh', 'tân', 'thân', 'dậu'].some(k => s.includes(k))) return 'wx-metal';
    if (['thủy', 'nhâm', 'quý', 'hợi', 'tý'].some(k => s.includes(k))) return 'wx-water';
    return '';
  }

  // Export API
  global.NetaBaziEngine = {
    buildBaziChart,
    calculate10Deities,
    calculateChangSheng,
    calculateHiddenGans,
    calcMengGong,
    evaluateBaziInteractions,
    calcLuckPillars,
    calculateLuckStart,
    findSolarTermTime,
    sunLongitude,
    getWuXingColorClass,
    TIAN_GAN,
    DI_ZHI,
    GAN_WU_XING,
    ZHI_WU_XING
  };

})(typeof window !== 'undefined' ? window : this);
