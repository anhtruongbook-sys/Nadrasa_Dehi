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

  const NAP_AM_MAP = {
    'Giáp Tý': 'Hải Trung Kim', 'Ất Sửu': 'Hải Trung Kim',
    'Bính Dần': 'Lư Trung Hỏa', 'Đinh Mão': 'Lư Trung Hỏa',
    'Mậu Thìn': 'Đại Lâm Mộc', 'Kỷ Tỵ': 'Đại Lâm Mộc',
    'Canh Ngọ': 'Lộ Bàng Thổ', 'Tân Mùi': 'Lộ Bàng Thổ',
    'Nhâm Thân': 'Kiếm Phong Kim', 'Quý Dậu': 'Kiếm Phong Kim',
    'Giáp Tuất': 'Sơn Đầu Hỏa', 'Ất Hợi': 'Sơn Đầu Hỏa',
    'Bính Tý': 'Giản Hạ Thủy', 'Đinh Sửu': 'Giản Hạ Thủy',
    'Mậu Dần': 'Thành Đầu Thổ', 'Kỷ Mão': 'Thành Đầu Thổ',
    'Canh Thìn': 'Bạch Lạp Kim', 'Tân Tỵ': 'Bạch Lạp Kim',
    'Nhâm Ngọ': 'Dương Liễu Mộc', 'Quý Mùi': 'Dương Liễu Mộc',
    'Giáp Thân': 'Tuyền Trung Thủy', 'Ất Dậu': 'Tuyền Trung Thủy',
    'Bính Tuất': 'Ốc Thượng Thổ', 'Đinh Hợi': 'Ốc Thượng Thổ',
    'Mậu Tý': 'Tích Lịch Hỏa', 'Kỷ Sửu': 'Tích Lịch Hỏa',
    'Canh Dần': 'Tùng Bách Mộc', 'Tân Mão': 'Tùng Bách Mộc',
    'Nhâm Thìn': 'Trường Lưu Thủy', 'Quý Tỵ': 'Trường Lưu Thủy',
    'Giáp Ngọ': 'Sa Trung Kim', 'Ất Mùi': 'Sa Trung Kim',
    'Bính Thân': 'Sơn Hạ Hỏa', 'Đinh Dậu': 'Sơn Hạ Hỏa',
    'Mậu Tuất': 'Bình Địa Mộc', 'Kỷ Hợi': 'Bình Địa Mộc',
    'Canh Tý': 'Bích Thượng Thổ', 'Tân Sửu': 'Bích Thượng Thổ',
    'Nhâm Dần': 'Kim Bạch Kim', 'Quý Mão': 'Kim Bạch Kim',
    'Giáp Thìn': 'Phú Đăng Hỏa', 'Ất Tỵ': 'Phú Đăng Hỏa',
    'Bính Ngọ': 'Thiên Hà Thủy', 'Đinh Mùi': 'Thiên Hà Thủy',
    'Mậu Thân': 'Đại Dịch Thổ', 'Kỷ Dậu': 'Đại Dịch Thổ',
    'Canh Tuất': 'Thoa Xuyến Kim', 'Tân Hợi': 'Thoa Xuyến Kim',
    'Nhâm Tý': 'Tang Đố Mộc', 'Quý Sửu': 'Tang Đố Mộc',
    'Giáp Dần': 'Đại Khê Thủy', 'Ất Mão': 'Đại Khê Thủy',
    'Bính Thìn': 'Sa Trung Thổ', 'Đinh Tỵ': 'Sa Trung Thổ',
    'Mậu Ngọ': 'Thiên Thượng Hỏa', 'Kỷ Mùi': 'Thiên Thượng Hỏa',
    'Canh Thân': 'Thạch Lựu Mộc', 'Tân Dậu': 'Thạch Lựu Mộc',
    'Nhâm Tuất': 'Đại Hải Thủy', 'Quý Hợi': 'Đại Hải Thủy'
  };

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
      'VƯỢNG (Đắc lệnh, cùng hành mùa)',
      'TƯỚNG (Được mùa tương sinh)',
      'TỬ (Bị mùa khắc phạt)',
      'TÙ (Khắc lại mùa, hao lực)',
      'HƯU (Sinh xuất ra mùa, tiết khí)'
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

  function calcLuckPillars(yearGan, monthGan, monthZhi, dayGan, isMale, startAge = 3, birthYear = 2000) {
    const isYangYear = GAN_YIN_YANG[yearGan] === '+';
    // Dương Nam Âm Nữ đi thuận (+1), Âm Nam Dương Nữ đi nghịch (-1)
    const dir = ((isMale && isYangYear) || (!isMale && !isYangYear)) ? 1 : -1;
    let curGanIdx = getGanIdx(monthGan);
    let curZhiIdx = getZhiIdx(monthZhi);
    const results = [];

    for (let i = 1; i <= 10; i++) {
      curGanIdx = ((curGanIdx + dir) % 10 + 10) % 10;
      curZhiIdx = ((curZhiIdx + dir) % 12 + 12) % 12;
      const gan = TIAN_GAN[curGanIdx];
      const zhi = DI_ZHI[curZhiIdx];
      const deity = calculate10Deities(dayGan, gan);
      const canChi = `${gan} ${zhi}`;
      const napAm = NAP_AM_MAP[canChi] || '';
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
      const year = birthYear > 0 ? birthYear + age : 0;
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
            deity: yDeity,
            napAm: NAP_AM_MAP[yCanChi] || ''
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
        napAm,
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
    startAge = 3
  }) {
    let d = day, m = month, y = year, h = hour;
    if (solarDate instanceof Date) {
      d = solarDate.getDate();
      m = solarDate.getMonth() + 1;
      y = solarDate.getFullYear();
      h = solarDate.getHours();
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
        hour: 'Giáp Ngọ',
        yearNapAm: NAP_AM_MAP[`${yG} ${yZ}`] || ''
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
      const napAm = NAP_AM_MAP[canChiStr] || '';
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
        napAm,
        hidden: hiddenWithDeities
      };
    });

    const seasonStatus = getSeasonStatus(monthZhi, dayMasterWx);
    const mengGongZhi = (canChiData && canChiData.mengGongZhi) ? canChiData.mengGongZhi : calcMengGong(yearGan, monthZhi, hourZhi);
    const mengGong = (canChiData && canChiData.mengGong) ? canChiData.mengGong : mengGongZhi;
    const palaces = array12Palaces(mengGongZhi, isMale);
    const spirits = array12Spirits(yearZhi, isMale);
    const luckData = calcLuckPillars(yearGan, monthGan, monthZhi, dayGan, isMale, startAge, y);
    const interactions = evaluateBaziInteractions(zhiArr);

    return {
      input: { day: d, month: m, year: y, hour: h, minute, isMale, startAge },
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
    getWuXingColorClass,
    TIAN_GAN,
    DI_ZHI,
    GAN_WU_XING,
    ZHI_WU_XING,
    NAP_AM_MAP
  };

})(typeof window !== 'undefined' ? window : this);
