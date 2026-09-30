/**
 * NETA LIGHT - BÁT TỰ TỬ BÌNH & MANH PHÁI EXPERT INTERPRETER ENGINE
 * File: engines/bazi_interpreter.js
 * 
 * Hệ Chuyên Gia Luận Giải Bát Tự Toàn Diện 100% Offline (Deterministic Expert System).
 * Chuyển thể trực tiếp từ C:\Books\Common Study\Bat_Tu_Expert_System.
 * 
 * BẢO ĐẢM CÁC BẤT BIẾN KỸ THUẬT:
 * 1. ZERO-RECALCULATION: Tiếp nhận nguyên bản Tứ Trụ, Đại Vận và Chân Thái Dương Thời từ App.
 * 2. DETERMINISTIC EXPERT RULES:
 *    - Động cơ Cân Lực Ngũ Hành (QEE 100 điểm): Thân Vượng/Nhược/Tòng, Hỷ/Dụng/Kỵ/Điều Hầu Thần.
 *    - Động cơ Manh Phái: Phân định Khách - Chủ (Tân - Chủ), 5 cơ chế Tố Công (Hợp, Xung, Xuyên, Phá, Hình, Mộ Khố).
 *    - Động cơ Thần Sát Tam Mệnh Thông Hội: 12 Thần Sát kinh điển.
 *    - Hệ thống 6 Cây Quyết Định (Decision Trees): Bản tính, Sự nghiệp, Tài vận, Hôn nhân, Sức khỏe, Niên vận 2026.
 *    - Động cơ Thời Vận (Timing Engine): Luận giải sâu 10 Đại Vận, 100 Lưu Niên, tự động quét mốc sự kiện lớn (Mua nhà, Kết hôn, Sinh con, Đổi việc, Tụ tài).
 * 3. KỶ LUẬT VĂN PHONG (Rule 9 & Rule 12):
 *    - Khách quan, trung tính, không cảm tính, không giật gân, không mê tín dị đoan.
 *    - Tuyệt đối không ảo giác, không tự bịa thêm Thần Sát ngoài nguyên bản.
 *    - Không in các khẩu hiệu kỹ thuật thô ráp ("100% offline", "Deterministic").
 *    - Không chấm điểm số máy móc kiểu trần tục trong các đoạn văn luận đoán thực tế.
 */

(function (global) {
  'use strict';

  // ==========================================
  // I. HẰNG SỐ & BẢNG TRA CỨU CƠ BẢN
  // ==========================================

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

  const HIDDEN_GANS_RATIO = {
    'Tý': [{ gan: 'Quý', ratio: 1.0 }],
    'Sửu': [{ gan: 'Kỷ', ratio: 0.6 }, { gan: 'Quý', ratio: 0.25 }, { gan: 'Tân', ratio: 0.15 }],
    'Dần': [{ gan: 'Giáp', ratio: 0.6 }, { gan: 'Bính', ratio: 0.25 }, { gan: 'Mậu', ratio: 0.15 }],
    'Mão': [{ gan: 'Ất', ratio: 1.0 }],
    'Thìn': [{ gan: 'Mậu', ratio: 0.6 }, { gan: 'Ất', ratio: 0.25 }, { gan: 'Quý', ratio: 0.15 }],
    'Tỵ': [{ gan: 'Bính', ratio: 0.6 }, { gan: 'Mậu', ratio: 0.25 }, { gan: 'Canh', ratio: 0.15 }],
    'Ngọ': [{ gan: 'Đinh', ratio: 0.7 }, { gan: 'Kỷ', ratio: 0.3 }],
    'Mùi': [{ gan: 'Kỷ', ratio: 0.6 }, { gan: 'Đinh', ratio: 0.25 }, { gan: 'Ất', ratio: 0.15 }],
    'Thân': [{ gan: 'Canh', ratio: 0.6 }, { gan: 'Nhâm', ratio: 0.25 }, { gan: 'Mậu', ratio: 0.15 }],
    'Dậu': [{ gan: 'Tân', ratio: 1.0 }],
    'Tuất': [{ gan: 'Mậu', ratio: 0.6 }, { gan: 'Tân', ratio: 0.25 }, { gan: 'Đinh', ratio: 0.15 }],
    'Hợi': [{ gan: 'Nhâm', ratio: 0.7 }, { gan: 'Giáp', ratio: 0.3 }]
  };

  const PILLAR_WEIGHTS = {
    month_zhi: 40.0,
    day_zhi: 15.0,
    hour_zhi: 12.0,
    year_zhi: 8.0,
    month_gan: 9.0,
    hour_gan: 9.0,
    year_gan: 7.0
  };

  // Tương tác Can Chi Manh Phái
  const GAN_HE = {
    'Giáp': 'Kỷ', 'Kỷ': 'Giáp',
    'Ất': 'Canh', 'Canh': 'Ất',
    'Bính': 'Tân', 'Tân': 'Bính',
    'Đinh': 'Nhâm', 'Nhâm': 'Đinh',
    'Mậu': 'Quý', 'Quý': 'Mậu'
  };

  const ZHI_CHONG = {
    'Tý': 'Ngọ', 'Ngọ': 'Tý', 'Sửu': 'Mùi', 'Mùi': 'Sửu',
    'Dần': 'Thân', 'Thân': 'Dần', 'Mão': 'Dậu', 'Dậu': 'Mão',
    'Thìn': 'Tuất', 'Tuất': 'Thìn', 'Tỵ': 'Hợi', 'Hợi': 'Tỵ'
  };

  const ZHI_CHUAN = {
    'Tý': 'Mùi', 'Mùi': 'Tý', 'Sửu': 'Ngọ', 'Ngọ': 'Sửu',
    'Dần': 'Tỵ', 'Tỵ': 'Dần', 'Mão': 'Thìn', 'Thìn': 'Mão',
    'Thân': 'Hợi', 'Hợi': 'Thân', 'Dậu': 'Tuất', 'Tuất': 'Dậu'
  };

  const ZHI_HE = {
    'Tý': 'Sửu', 'Sửu': 'Tý', 'Dần': 'Hợi', 'Hợi': 'Dần',
    'Mão': 'Tuất', 'Tuất': 'Mão', 'Thìn': 'Dậu', 'Dậu': 'Thìn',
    'Tỵ': 'Thân', 'Thân': 'Tỵ', 'Ngọ': 'Mùi', 'Mùi': 'Ngọ'
  };

  const ZHI_PO = {
    'Tý': 'Dậu', 'Dậu': 'Tý', 'Mão': 'Ngọ', 'Ngọ': 'Mão',
    'Sửu': 'Thìn', 'Thìn': 'Sửu', 'Mùi': 'Tuất', 'Tuất': 'Mùi',
    'Dần': 'Hợi', 'Hợi': 'Dần', 'Tỵ': 'Thân', 'Thân': 'Tỵ'
  };

  const ZHI_XING = {
    'Dần': ['Tỵ', 'Thân'], 'Tỵ': ['Dần', 'Thân'], 'Thân': ['Dần', 'Tỵ'],
    'Sửu': ['Tuất', 'Mùi'], 'Tuất': ['Sửu', 'Mùi'], 'Mùi': ['Sửu', 'Tuất'],
    'Tý': ['Mão'], 'Mão': ['Tý'],
    'Thìn': ['Thìn'], 'Ngọ': ['Ngọ'], 'Dậu': ['Dậu'], 'Hợi': ['Hợi']
  };

  const SAN_HE = {
    'Thân': ['Tý', 'Thìn'], 'Tý': ['Thân', 'Thìn'], 'Thìn': ['Thân', 'Tý'],
    'Dần': ['Ngọ', 'Tuất'], 'Ngọ': ['Dần', 'Tuất'], 'Tuất': ['Dần', 'Ngọ'],
    'Tỵ': ['Dậu', 'Sửu'], 'Dậu': ['Tỵ', 'Sửu'], 'Sửu': ['Tỵ', 'Dậu'],
    'Hợi': ['Mão', 'Mùi'], 'Mão': ['Hợi', 'Mùi'], 'Mùi': ['Hợi', 'Mão']
  };

  const TREASURY_MAP = {
    'Thìn': { name: 'Thủy Khố', element: 'Thủy', stored: ['Quý', 'Ất'] },
    'Tuất': { name: 'Hỏa Khố', element: 'Hỏa', stored: ['Đinh', 'Tân'] },
    'Sửu': { name: 'Kim Khố', element: 'Kim', stored: ['Tân', 'Quý'] },
    'Mùi': { name: 'Mộc Khố', element: 'Mộc', stored: ['Ất', 'Đinh'] }
  };

  const SHEN_SHA_RULES = {
    THIEN_AT_QUY_NHAN: {
      'Giáp': ['Sửu', 'Mùi'], 'Mậu': ['Sửu', 'Mùi'], 'Canh': ['Sửu', 'Mùi'],
      'Ất': ['Tý', 'Thân'], 'Kỷ': ['Tý', 'Thân'],
      'Bính': ['Hợi', 'Dậu'], 'Đinh': ['Hợi', 'Dậu'],
      'Nhâm': ['Mão', 'Tỵ'], 'Quý': ['Mão', 'Tỵ'],
      'Tân': ['Dần', 'Ngọ']
    },
    LOC_THAN: {
      'Giáp': 'Dần', 'Ất': 'Mão',
      'Bính': 'Tỵ', 'Đinh': 'Ngọ',
      'Mậu': 'Tỵ', 'Kỷ': 'Ngọ',
      'Canh': 'Thân', 'Tân': 'Dậu',
      'Nhâm': 'Hợi', 'Quý': 'Tý'
    },
    DUONG_NHAN: {
      'Giáp': 'Mão', 'Ất': 'Thìn',
      'Bính': 'Ngọ', 'Đinh': 'Mùi',
      'Mậu': 'Ngọ', 'Kỷ': 'Mùi',
      'Canh': 'Dậu', 'Tân': 'Tuất',
      'Nhâm': 'Tý', 'Quý': 'Sửu'
    },
    DICH_MA: {
      'Thân': 'Dần', 'Tý': 'Dần', 'Thìn': 'Dần',
      'Dần': 'Thân', 'Ngọ': 'Thân', 'Tuất': 'Thân',
      'Tỵ': 'Hợi', 'Dậu': 'Hợi', 'Sửu': 'Hợi',
      'Hợi': 'Tỵ', 'Mão': 'Tỵ', 'Mùi': 'Tỵ'
    },
    DAO_HOA: {
      'Thân': 'Dậu', 'Tý': 'Dậu', 'Thìn': 'Dậu',
      'Dần': 'Mão', 'Ngọ': 'Mão', 'Tuất': 'Mão',
      'Tỵ': 'Ngọ', 'Dậu': 'Ngọ', 'Sửu': 'Ngọ',
      'Hợi': 'Tý', 'Mão': 'Tý', 'Mùi': 'Tý'
    },
    HOA_CAI: {
      'Thân': 'Thìn', 'Tý': 'Thìn', 'Thìn': 'Thìn',
      'Dần': 'Tuất', 'Ngọ': 'Tuất', 'Tuất': 'Tuất',
      'Tỵ': 'Sửu', 'Dậu': 'Sửu', 'Sửu': 'Sửu',
      'Hợi': 'Mùi', 'Mão': 'Mùi', 'Mùi': 'Mùi'
    },
    VAN_XUONG: {
      'Giáp': 'Tỵ', 'Ất': 'Ngọ',
      'Bính': 'Thân', 'Đinh': 'Dậu',
      'Mậu': 'Thân', 'Kỷ': 'Dậu',
      'Canh': 'Hợi', 'Tân': 'Tý',
      'Nhâm': 'Dần', 'Quý': 'Mão'
    },
    TUONG_TINH: {
      'Dần': 'Ngọ', 'Ngọ': 'Ngọ', 'Tuất': 'Ngọ',
      'Thân': 'Tý', 'Tý': 'Tý', 'Thìn': 'Tý',
      'Tỵ': 'Dậu', 'Dậu': 'Dậu', 'Sửu': 'Dậu',
      'Hợi': 'Mão', 'Mão': 'Mão', 'Mùi': 'Mão'
    },
    KIEP_SAT: {
      'Thân': 'Tỵ', 'Tý': 'Tỵ', 'Thìn': 'Tỵ',
      'Dần': 'Hợi', 'Ngọ': 'Hợi', 'Tuất': 'Hợi',
      'Tỵ': 'Dần', 'Dậu': 'Dần', 'Sửu': 'Dần',
      'Hợi': 'Thân', 'Mão': 'Thân', 'Mùi': 'Thân'
    },
    CO_THAN_QUA_TU: {
      'Hợi': { co_than: 'Dần', qua_tu: 'Tuất' }, 'Tý': { co_than: 'Dần', qua_tu: 'Tuất' }, 'Sửu': { co_than: 'Dần', qua_tu: 'Tuất' },
      'Dần': { co_than: 'Tỵ', qua_tu: 'Sửu' }, 'Mão': { co_than: 'Tỵ', qua_tu: 'Sửu' }, 'Thìn': { co_than: 'Tỵ', qua_tu: 'Sửu' },
      'Tỵ': { co_than: 'Thân', qua_tu: 'Thìn' }, 'Ngọ': { co_than: 'Thân', qua_tu: 'Thìn' }, 'Mùi': { co_than: 'Thân', qua_tu: 'Thìn' },
      'Thân': { co_than: 'Hợi', qua_tu: 'Mùi' }, 'Dậu': { co_than: 'Hợi', qua_tu: 'Mùi' }, 'Tuất': { co_than: 'Hợi', qua_tu: 'Mùi' }
    },
    HONG_LOAN_THIEN_HY: {
      'Tý': { hong_loan: 'Mão', thien_hy: 'Dậu' }, 'Sửu': { hong_loan: 'Dần', thien_hy: 'Thân' },
      'Dần': { hong_loan: 'Sửu', thien_hy: 'Mùi' }, 'Mão': { hong_loan: 'Tý', thien_hy: 'Ngọ' },
      'Thìn': { hong_loan: 'Hợi', thien_hy: 'Tỵ' }, 'Tỵ': { hong_loan: 'Tuất', thien_hy: 'Thìn' },
      'Ngọ': { hong_loan: 'Dậu', thien_hy: 'Mão' }, 'Mùi': { hong_loan: 'Thân', thien_hy: 'Dần' },
      'Thân': { hong_loan: 'Mùi', thien_hy: 'Sửu' }, 'Dậu': { hong_loan: 'Ngọ', thien_hy: 'Tý' },
      'Tuất': { hong_loan: 'Tỵ', thien_hy: 'Hợi' }, 'Hợi': { hong_loan: 'Thìn', thien_hy: 'Tuất' }
    }
  };

  // Helper tính Thập Thần
  function calculate10Deities(dayGan, targetGan) {
    if (!dayGan || !targetGan) return '';
    const dayWx = GAN_WU_XING[dayGan];
    const targetWx = GAN_WU_XING[targetGan];
    const isSameYinYang = GAN_YIN_YANG[dayGan] === GAN_YIN_YANG[targetGan];

    const wxCycle = ['Mộc', 'Hỏa', 'Thổ', 'Kim', 'Thủy'];
    const dIdx = wxCycle.indexOf(dayWx);
    const tIdx = wxCycle.indexOf(targetWx);
    const diff = (tIdx - dIdx + 5) % 5;

    if (diff === 0) return isSameYinYang ? 'Tỉ Kiên' : 'Kiếp Tài';
    if (diff === 1) return isSameYinYang ? 'Thực Thần' : 'Thương Quan';
    if (diff === 2) return isSameYinYang ? 'Thiên Tài' : 'Chính Tài';
    if (diff === 3) return isSameYinYang ? 'Thất Sát' : 'Chính Quan';
    if (diff === 4) return isSameYinYang ? 'Thiên Ấn' : 'Chính Ấn';
    return '';
  }

  // Helper tính Vòng Trường Sinh
  function calculateChangSheng(gan, zhi) {
    const startZhi = CHANG_SHENG_START[gan];
    if (!startZhi) return '';
    const isYang = GAN_YIN_YANG[gan] === '+';
    const startIdx = DI_ZHI.indexOf(startZhi);
    const targetIdx = DI_ZHI.indexOf(zhi);
    const dir = isYang ? 1 : -1;
    let offset = (targetIdx - startIdx) * dir;
    offset = ((offset % 12) + 12) % 12;
    return CHANG_SHENG[offset] || '';
  }

  // ==========================================
  // II. ĐỘNG CƠ CÂN LỰC NGŨ HÀNH (QEE - 100 ĐIỂM)
  // ==========================================

  function calculateElementScores(chart) {
    const scores = { 'Mộc': 0.0, 'Hỏa': 0.0, 'Thổ': 0.0, 'Kim': 0.0, 'Thủy': 0.0 };

    // 1. Điểm từ Thiên Can
    scores[GAN_WU_XING[chart.month_gan]] += PILLAR_WEIGHTS.month_gan;
    scores[GAN_WU_XING[chart.hour_gan]] += PILLAR_WEIGHTS.hour_gan;
    scores[GAN_WU_XING[chart.year_gan]] += PILLAR_WEIGHTS.year_gan;

    // 2. Điểm từ Địa Chi phân rã qua tỷ lệ Tàng Can
    const zhiWeights = [
      { zhi: chart.month_zhi, w: PILLAR_WEIGHTS.month_zhi },
      { zhi: chart.day_zhi, w: PILLAR_WEIGHTS.day_zhi },
      { zhi: chart.hour_zhi, w: PILLAR_WEIGHTS.hour_zhi },
      { zhi: chart.year_zhi, w: PILLAR_WEIGHTS.year_zhi }
    ];

    for (const zw of zhiWeights) {
      const hiddenList = HIDDEN_GANS_RATIO[zw.zhi] || [];
      for (const h of hiddenList) {
        scores[GAN_WU_XING[h.gan]] += zw.w * h.ratio;
      }
    }

    for (const k in scores) {
      scores[k] = parseFloat(scores[k].toFixed(2));
    }
    return scores;
  }

  function classifyBodyStrength(chart, elementScores) {
    const dayWx = GAN_WU_XING[chart.day_gan];
    const wxCycle = ['Mộc', 'Hỏa', 'Thổ', 'Kim', 'Thủy'];
    const dIdx = wxCycle.indexOf(dayWx);

    const sameWx = dayWx;
    const resourceWx = wxCycle[(dIdx - 1 + 5) % 5];
    const outputWx = wxCycle[(dIdx + 1) % 5];
    const wealthWx = wxCycle[(dIdx + 2) % 5];
    const officerWx = wxCycle[(dIdx + 3) % 5];

    const supportScore = parseFloat((elementScores[sameWx] + elementScores[resourceWx]).toFixed(2));
    const drainScore = parseFloat((elementScores[outputWx] + elementScores[wealthWx] + elementScores[officerWx]).toFixed(2));

    // Kiểm tra thông căn
    let hasRoot = false;
    for (const zhi of [chart.year_zhi, chart.month_zhi, chart.day_zhi, chart.hour_zhi]) {
      const hidden = HIDDEN_GANS_RATIO[zhi] || [];
      if (hidden.some(h => GAN_WU_XING[h.gan] === dayWx)) {
        hasRoot = true;
        break;
      }
    }

    let pattern = 'Chính Cách';
    let strength = '';
    let detail = '';

    if (supportScore <= 14.0 && !hasRoot) {
      if (elementScores[wealthWx] >= 50.0) {
        pattern = 'Tòng Tài Cách';
        strength = 'Tòng Nhược (Tòng Tài)';
        detail = 'Nhật Chủ hoàn toàn vô khí, bỏ mình quy thuận theo thế lực Tài Tinh cực thịnh.';
      } else if (elementScores[officerWx] >= 50.0) {
        pattern = 'Tòng Sát Cách';
        strength = 'Tòng Nhược (Tòng Sát)';
        detail = 'Nhật Chủ không nơi nương tựa, quy phục theo uy lực sấm sét của Quan Sát.';
      } else if (elementScores[outputWx] >= 50.0) {
        pattern = 'Tòng Nhi Cách';
        strength = 'Tòng Nhược (Tòng Nhi)';
        detail = 'Nhật Chủ thuận theo dòng khí tú vi tuôn chảy của Thực Thần Thương Quan.';
      } else {
        pattern = 'Tòng Thế Cách';
        strength = 'Tòng Nhược (Tòng Thế)';
        detail = 'Dị nguyên quá mạnh, Nhật Chủ theo phe thịnh nhất.';
      }
    } else if (supportScore >= 82.0) {
      pattern = 'Chuyên Vượng Cách (Độc Hành)';
      strength = 'Cực Vượng';
      detail = `Hành ${dayWx} chiếm độc tôn thế lực trong cục diện, không thể áp chế, chỉ thuận thế tiết khí.`;
    } else {
      if (supportScore >= 53.0) {
        strength = 'Thân Vượng';
        detail = `Lực Bản Nguyên (${supportScore}đ) áp đảo Dị Nguyên (${drainScore}đ). Nhật Chủ đắc khí, ưa tiết hao khắc.`;
      } else if (supportScore <= 45.0) {
        strength = 'Thân Nhược';
        detail = `Lực Bản Nguyên (${supportScore}đ) yếu hơn Dị Nguyên (${drainScore}đ). Nhật Chủ bị vây hãm mệt mỏi, cần sinh phù trợ lực.`;
      } else {
        strength = 'Trung Hòa';
        detail = `Lực Bản Nguyên (${supportScore}đ) và Dị Nguyên (${drainScore}đ) cân bằng hài hòa.`;
      }
    }

    return {
      pattern,
      strength,
      support_score: supportScore,
      drain_score: drainScore,
      detail,
      same_wx: sameWx,
      resource_wx: resourceWx,
      output_wx: outputWx,
      wealth_wx: wealthWx,
      officer_wx: officerWx
    };
  }

  function determineFavorableElements(chart, bodyInfo, elementScores) {
    const pattern = bodyInfo.pattern;
    const strength = bodyInfo.strength;
    const sameWx = bodyInfo.same_wx;
    const resourceWx = bodyInfo.resource_wx;
    const outputWx = bodyInfo.output_wx;
    const wealthWx = bodyInfo.wealth_wx;
    const officerWx = bodyInfo.officer_wx;

    // Điều hầu
    let dieuHau = null;
    let dieuHauReason = '';
    if (['Hợi', 'Tý', 'Sửu'].includes(chart.month_zhi)) {
      dieuHau = 'Hỏa';
      dieuHauReason = 'Sinh vào tiết Đông hàn giá buốt, vạn vật đông kết, tối khẩn thiết cần Hỏa sưởi ấm cục diện.';
    } else if (['Tỵ', 'Ngọ', 'Mùi'].includes(chart.month_zhi)) {
      dieuHau = 'Thủy';
      dieuHauReason = 'Sinh vào tiết Hạ viêm nhiệt khô khan, cỏ cây khô héo, bắt buộc có Thủy tưới nhuận sinh khí.';
    }

    let favorable = [];
    let primaryUse = [];
    let unfavorable = [];
    let idle = [];

    if (pattern.includes('Tòng')) {
      if (pattern === 'Tòng Tài Cách') {
        primaryUse = [wealthWx];
        favorable = [outputWx];
        unfavorable = [sameWx, resourceWx];
      } else if (pattern === 'Tòng Sát Cách') {
        primaryUse = [officerWx];
        favorable = [wealthWx];
        unfavorable = [sameWx, resourceWx];
      } else if (pattern === 'Tòng Nhi Cách') {
        primaryUse = [outputWx];
        favorable = [wealthWx];
        unfavorable = [resourceWx, officerWx];
      }
    } else if (pattern === 'Chuyên Vượng Cách (Độc Hành)') {
      primaryUse = [outputWx];
      favorable = [sameWx];
      unfavorable = [officerWx, wealthWx];
    } else {
      if (strength === 'Thân Nhược') {
        primaryUse = [resourceWx];
        favorable = [sameWx];
        unfavorable = [officerWx, wealthWx];
        idle = [outputWx];
      } else if (strength === 'Thân Vượng') {
        primaryUse = [wealthWx, officerWx];
        favorable = [outputWx];
        unfavorable = [resourceWx, sameWx];
      } else {
        const sortedElems = Object.keys(elementScores).sort((a, b) => elementScores[a] - elementScores[b]);
        primaryUse = [sortedElems[0]];
        favorable = [outputWx, wealthWx];
        unfavorable = [resourceWx];
      }
    }

    return {
      primary_use: primaryUse,
      favorable,
      unfavorable,
      idle,
      climate_use: dieuHau,
      climate_reason: dieuHauReason
    };
  }

  function evaluateQuantitative(chart) {
    const scores = calculateElementScores(chart);
    const body = classifyBodyStrength(chart, scores);
    const gods = determineFavorableElements(chart, body, scores);
    return {
      element_scores: scores,
      body_strength: body,
      gods_selection: gods
    };
  }

  // ==========================================
  // III. ĐỘNG CƠ BÁT TỰ MANH PHÁI (TỐ CÔNG & KHÁCH CHỦ)
  // ==========================================

  function analyzeHostGuest(chart) {
    const pNames = ['Năm', 'Tháng', 'Ngày', 'Giờ'];
    const gans = [chart.year_gan, chart.month_gan, chart.day_gan, chart.hour_gan];
    const zhis = [chart.year_zhi, chart.month_zhi, chart.day_zhi, chart.hour_zhi];

    const guestPillars = [0, 1]; // Năm, Tháng
    const hostPillars = [2, 3];  // Ngày, Giờ

    const wealthHost = [], wealthGuest = [];
    const officerHost = [], officerGuest = [];

    // Kiểm tra Khách (Năm, Tháng)
    for (const idx of guestPillars) {
      const deity = calculate10Deities(chart.day_gan, gans[idx]);
      if (deity.includes('Tài')) wealthGuest.push(`${pNames[idx]} (${gans[idx]} ${zhis[idx]})`);
      if (deity.includes('Quan') || deity.includes('Sát')) officerGuest.push(`${pNames[idx]} (${gans[idx]} ${zhis[idx]})`);

      for (const h of (HIDDEN_GANS_RATIO[zhis[idx]] || [])) {
        const hDeity = calculate10Deities(chart.day_gan, h.gan);
        if (hDeity.includes('Tài')) wealthGuest.push(`Tàng ${pNames[idx]} (${h.gan})`);
        if (hDeity.includes('Quan') || hDeity.includes('Sát')) officerGuest.push(`Tàng ${pNames[idx]} (${h.gan})`);
      }
    }

    // Kiểm tra Chủ (Ngày, Giờ)
    for (const idx of hostPillars) {
      if (idx !== 2) {
        const deity = calculate10Deities(chart.day_gan, gans[idx]);
        if (deity.includes('Tài')) wealthHost.push(`${pNames[idx]} (${gans[idx]} ${zhis[idx]})`);
        if (deity.includes('Quan') || deity.includes('Sát')) officerHost.push(`${pNames[idx]} (${gans[idx]} ${zhis[idx]})`);
      }
      for (const h of (HIDDEN_GANS_RATIO[zhis[idx]] || [])) {
        const hDeity = calculate10Deities(chart.day_gan, h.gan);
        if (hDeity.includes('Tài')) wealthHost.push(`Tàng ${pNames[idx]} (${h.gan})`);
        if (hDeity.includes('Quan') || hDeity.includes('Sát')) officerHost.push(`Tàng ${pNames[idx]} (${h.gan})`);
      }
    }

    let summary = '';
    if (wealthHost.length > 0 && wealthGuest.length === 0) {
      summary = 'Tài tinh ngự tại cung Chủ: Tiền tài là của tự thân gây dựng, độc lập tự chủ, không cần nhờ vả bên ngoài.';
    } else if (wealthGuest.length > 0 && wealthHost.length === 0) {
      summary = 'Tài tinh nằm tại cung Khách: Tiền bạc thuộc về xã hội/người khác, bản mệnh phải dùng năng lực (Thể) vươn ra ngoài để đoạt lấy.';
    } else if (wealthHost.length > 0 && wealthGuest.length > 0) {
      summary = 'Tài tinh cả ở Khách lẫn Chủ: Nguồn thu phong phú, vừa có tài sản tích lũy riêng vừa có dòng tiền luân chuyển từ thương trường.';
    } else {
      summary = 'Tài tinh ẩn tàng, mệnh cục tập trung vào Tố công chức vị hoặc năng lực chuyên môn kỹ thuật.';
    }

    return {
      wealth_host: wealthHost,
      wealth_guest: wealthGuest,
      officer_host: officerHost,
      officer_guest: officerGuest,
      summary
    };
  }

  function detectWorkMechanisms(chart) {
    const works = [];
    const pNames = ['Năm', 'Tháng', 'Ngày', 'Giờ'];
    const gans = [chart.year_gan, chart.month_gan, chart.day_gan, chart.hour_gan];
    const zhis = [chart.year_zhi, chart.month_zhi, chart.day_zhi, chart.hour_zhi];

    // 1. Thiên can Ngũ Hợp
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        const g1 = gans[i], g2 = gans[j];
        if (GAN_HE[g1] === g2) {
          const isHostGuest = (i < 2 && j >= 2) || (i >= 2 && j < 2);
          const scope = isHostGuest ? 'Chủ - Khách (Hợp kéo ngoại vật về mình)' : 'Nội bộ liên kết';
          works.push({
            type: 'Hợp Chế Công (Can Hợp)',
            detail: `${g1} (${pNames[i]}) hợp ${g2} (${pNames[j]})`,
            scope,
            meaning: 'Tác động thu hút, kiểm soát đối phương, dùng uy tín hòa giải để đoạt lấy thành quả.'
          });
        }
      }
    }

    // 2. Địa chi Lục Hợp, Lục Xung, Lục Xuyên, Lục Phá, Tam Hình
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        const z1 = zhis[i], z2 = zhis[j];
        const isHostGuest = (i < 2 && j >= 2) || (i >= 2 && j < 2);
        const tag = isHostGuest ? 'Chủ tác động Khách' : 'Nội bộ tác động';

        if (ZHI_CHUAN[z1] === z2) {
          works.push({
            type: 'Xuyên Chế Công (Hại)',
            detail: `${z1} (${pNames[i]}) Xuyên ${z2} (${pNames[j]})`,
            scope: tag,
            meaning: 'Tổn thương đột ngột, đứt gãy ngầm, xung đột tốc độ cao; nếu chế đúng Kỵ Thần thì phát tài cực nhanh nhưng hiểm trở.'
          });
        }
        if (ZHI_CHONG[z1] === z2) {
          works.push({
            type: 'Xung Chế Công',
            detail: `${z1} (${pNames[i]}) Xung ${z2} (${pNames[j]})`,
            scope: tag,
            meaning: 'Dịch chuyển, biến động, đối đầu trực diện, dùng lực lượng đánh bại thần đối phương.'
          });
        }
        if (ZHI_HE[z1] === z2) {
          works.push({
            type: 'Hợp Chế Công (Chi Hợp)',
            detail: `${z1} (${pNames[i]}) Hợp ${z2} (${pNames[j]})`,
            scope: tag,
            meaning: 'Trói buộc, kết nạp, cộng tác chặt chẽ, kiểm soát và sở hữu.'
          });
        }
        if (ZHI_PO[z1] === z2) {
          works.push({
            type: 'Phá Tác Động',
            detail: `${z1} (${pNames[i]}) Phá ${z2} (${pNames[j]})`,
            scope: tag,
            meaning: 'Rạn nứt, cản trở, xói mòn kế hoạch, hao phí tiểu tiết.'
          });
        }
        if ((ZHI_XING[z1] || []).includes(z2)) {
          works.push({
            type: 'Hình Chế Công',
            detail: `${z1} (${pNames[i]}) Hình ${z2} (${pNames[j]})`,
            scope: tag,
            meaning: 'Tranh chấp pháp lý, luật lệ, dằn vặt cải cách, phù hợp ngành tư pháp kỷ luật phẫu thuật.'
          });
        }
      }
    }

    // 3. Mộ Khố
    for (let i = 0; i < 4; i++) {
      const zhi = zhis[i];
      if (TREASURY_MAP[zhi]) {
        const tInfo = TREASURY_MAP[zhi];
        let isOpened = false;
        const openedBy = [];
        for (let j = 0; j < 4; j++) {
          if (i !== j) {
            const otherZhi = zhis[j];
            if (ZHI_CHONG[zhi] === otherZhi) {
              isOpened = true;
              openedBy.push(`${otherZhi} (${pNames[j]}) Xung`);
            } else if ((ZHI_XING[zhi] || []).includes(otherZhi)) {
              isOpened = true;
              openedBy.push(`${otherZhi} (${pNames[j]}) Hình`);
            }
          }
        }
        const statusStr = isOpened ? `ĐÃ ĐƯỢC MỞ bởi [${openedBy.join(', ')}]` : 'ĐANG ĐÓNG (Ngậm khí, cần đại vận/lưu niên xung hình mới phát)';
        works.push({
          type: 'Mộ Khố Tác Dụng',
          detail: `${zhi} (${pNames[i]}) là ${tInfo.name} (${tInfo.element})`,
          scope: `Trụ ${pNames[i]}`,
          meaning: `Trạng thái kho tàng: ${statusStr}.`
        });
      }
    }

    return works;
  }

  function analyzeYinYangParty(chart) {
    const yangChars = new Set(['Giáp', 'Bính', 'Mậu', 'Canh', 'Nhâm', 'Dần', 'Tỵ', 'Ngọ', 'Mùi', 'Tuất']);
    const yinChars = new Set(['Ất', 'Đinh', 'Kỷ', 'Tân', 'Quý', 'Thân', 'Dậu', 'Hợi', 'Tý', 'Sửu', 'Thìn']);

    const allChars = [
      chart.year_gan, chart.year_zhi,
      chart.month_gan, chart.month_zhi,
      chart.day_gan, chart.day_zhi,
      chart.hour_gan, chart.hour_zhi
    ];

    const yangCount = allChars.filter(c => yangChars.has(c)).length;
    const yinCount = allChars.filter(c => yinChars.has(c)).length;

    let dominant = '';
    let isAntiClimax = false;
    let antiDetail = '';

    if (yangCount >= 6) {
      dominant = 'Dương Đảng Áp Đảo (Khí thế bốc cao, thích chế Âm)';
      if (yinCount === 1) {
        antiDetail = 'Cảnh báo Phản Cục tiềm ẩn: Một chữ Âm cô độc dễ bị Dương khí nuốt chửng hoặc phản đòn khi gặp đại vận phù trợ.';
        isAntiClimax = true;
      }
    } else if (yinCount >= 6) {
      dominant = 'Âm Đảng Áp Đảo (Khí thế trầm tĩnh, thâm sâu, thích chế Dương)';
      if (yangCount === 1) {
        antiDetail = 'Cảnh báo Phản Cục tiềm ẩn: Một chữ Dương cô độc dễ bị Âm khí dập tắt gây bệnh tật hoặc biến cố đột ngột.';
        isAntiClimax = true;
      }
    } else {
      dominant = `Âm Dương Cân Bằng Giao Hòa (${yangCount} Dương / ${yinCount} Âm)`;
    }

    return {
      yang_count: yangCount,
      yin_count: yinCount,
      dominant,
      is_anti_climax: isAntiClimax,
      anti_detail: antiDetail
    };
  }

  function evaluateMangPai(chart) {
    return {
      host_guest: analyzeHostGuest(chart),
      work_mechanisms: detectWorkMechanisms(chart),
      yin_yang_party: analyzeYinYangParty(chart)
    };
  }

  // ==========================================
  // IV. ĐỘNG CƠ THẦN SÁT TAM MỆNH THÔNG HỘI
  // ==========================================

  function findAllShenSha(chart) {
    const results = [];
    const zhis = [chart.year_zhi, chart.month_zhi, chart.day_zhi, chart.hour_zhi];
    const pNames = ['Năm', 'Tháng', 'Ngày', 'Giờ'];

    // 1. Thiên Ất Quý Nhân (từ Can Ngày và Can Năm)
    const thienAtDay = SHEN_SHA_RULES.THIEN_AT_QUY_NHAN[chart.day_gan] || [];
    const thienAtYear = SHEN_SHA_RULES.THIEN_AT_QUY_NHAN[chart.year_gan] || [];
    const thienAtTargets = Array.from(new Set([...thienAtDay, ...thienAtYear]));

    for (let i = 0; i < 4; i++) {
      if (thienAtTargets.includes(zhis[i])) {
        results.push({
          name: 'Thiên Ất Quý Nhân',
          pillar: pNames[i],
          zhi: zhis[i],
          type: 'Cát Thần Tối Thượng',
          meaning: 'Gặp hung hóa cát, được quý nhân và bề trên nâng đỡ, mở rộng cơ hội học hành và sự nghiệp.'
        });
      }
    }

    // 2. Lộc Thần (từ Can Ngày)
    const locTarget = SHEN_SHA_RULES.LOC_THAN[chart.day_gan];
    for (let i = 0; i < 4; i++) {
      if (zhis[i] === locTarget) {
        results.push({
          name: 'Lộc Thần (Bản Mệnh Lộc)',
          pillar: pNames[i],
          zhi: zhis[i],
          type: 'Cát Tinh Tài Phúc',
          meaning: 'Nắm giữ phúc lộc tự thân, ăn mặc sung túc, có lòng tự trọng và năng lực tài chính độc lập.'
        });
      }
    }

    // 3. Kình Dương (Dương Nhẫn từ Can Ngày)
    const nhanTarget = SHEN_SHA_RULES.DUONG_NHAN[chart.day_gan];
    for (let i = 0; i < 4; i++) {
      if (zhis[i] === nhanTarget) {
        results.push({
          name: 'Kình Dương (Dương Nhẫn)',
          pillar: pNames[i],
          zhi: zhis[i],
          type: 'Hung Sát Cương Quyền',
          meaning: 'Cương liệt, khí phách dũng cảm, uy quyền nhưng tính tình nóng nảy, dễ gặp hình thương xây xát.'
        });
      }
    }

    // 4. Dịch Mã (từ Chi Năm và Chi Ngày)
    const maYear = SHEN_SHA_RULES.DICH_MA[chart.year_zhi];
    const maDay = SHEN_SHA_RULES.DICH_MA[chart.day_zhi];
    for (let i = 0; i < 4; i++) {
      if ([maYear, maDay].includes(zhis[i])) {
        results.push({
          name: 'Dịch Mã',
          pillar: pNames[i],
          zhi: zhis[i],
          type: 'Động Tinh Dịch Chuyển',
          meaning: 'Thích di chuyển, công tác xa, đi lại nhiều, có duyên xuất ngoại hoặc đổi chỗ ở thường xuyên.'
        });
      }
    }

    // 5. Đào Hoa (Hàm Trì từ Chi Năm và Chi Ngày)
    const daoYear = SHEN_SHA_RULES.DAO_HOA[chart.year_zhi];
    const daoDay = SHEN_SHA_RULES.DAO_HOA[chart.day_zhi];
    for (let i = 0; i < 4; i++) {
      if ([daoYear, daoDay].includes(zhis[i])) {
        results.push({
          name: 'Đào Hoa (Hàm Trì)',
          pillar: pNames[i],
          zhi: zhis[i],
          type: 'Duyên Tinh Xã Giao',
          meaning: 'Duyên dáng, có sức hút với người khác phái, khéo léo trong giao tiếp, đa sầu đa cảm.'
        });
      }
    }

    // 6. Hoa Cái (từ Chi Ngày/Năm)
    const hoaDay = SHEN_SHA_RULES.HOA_CAI[chart.day_zhi];
    const hoaYear = SHEN_SHA_RULES.HOA_CAI[chart.year_zhi];
    for (let i = 0; i < 4; i++) {
      if ([hoaDay, hoaYear].includes(zhis[i])) {
        results.push({
          name: 'Hoa Cái',
          pillar: pNames[i],
          zhi: zhis[i],
          type: 'Nghệ Thuật & Triết Học',
          meaning: 'Tư chất thông tuệ, thiên hướng triết lý nghệ thuật, tâm hồn thanh cao nhưng dễ cảm thấy cô độc.'
        });
      }
    }

    // 7. Văn Xương Quý Nhân (từ Can Ngày)
    const vanTarget = SHEN_SHA_RULES.VAN_XUONG[chart.day_gan];
    for (let i = 0; i < 4; i++) {
      if (zhis[i] === vanTarget) {
        results.push({
          name: 'Văn Xương Quý Nhân',
          pillar: pNames[i],
          zhi: zhis[i],
          type: 'Khoa Bảng Trí Tuệ',
          meaning: 'Thông minh đĩnh ngộ, có năng khiếu học thuật, viết lách, thi cử đỗ đạt và nghiên cứu sâu sắc.'
        });
      }
    }

    // 8. Tướng Tinh
    const tuongYear = SHEN_SHA_RULES.TUONG_TINH[chart.year_zhi];
    const tuongDay = SHEN_SHA_RULES.TUONG_TINH[chart.day_zhi];
    for (let i = 0; i < 4; i++) {
      if ([tuongYear, tuongDay].includes(zhis[i])) {
        results.push({
          name: 'Tướng Tinh',
          pillar: pNames[i],
          zhi: zhis[i],
          type: 'Thống Soái Lãnh Đạo',
          meaning: 'Có tài điều binh khiển tướng, quyết đoán chỉ huy, uy vọng đứng đầu tập thể.'
        });
      }
    }

    // 9. Kiếp Sát
    const kiepYear = SHEN_SHA_RULES.KIEP_SAT[chart.year_zhi];
    const kiepDay = SHEN_SHA_RULES.KIEP_SAT[chart.day_zhi];
    for (let i = 0; i < 4; i++) {
      if ([kiepYear, kiepDay].includes(zhis[i])) {
        results.push({
          name: 'Kiếp Sát',
          pillar: pNames[i],
          zhi: zhis[i],
          type: 'Uy Lực & Cạnh Tranh',
          meaning: 'Táo bạo, mưu lược sắc sảo, thích ứng biến nhanh trước nguy biến; cần kiềm chế tính háo thắng.'
        });
      }
    }

    // 10. Cô Thần / Quả Tú (từ Chi Năm)
    const cogg = SHEN_SHA_RULES.CO_THAN_QUA_TU[chart.year_zhi];
    if (cogg) {
      for (let i = 0; i < 4; i++) {
        if (zhis[i] === cogg.co_than) {
          results.push({
            name: 'Cô Thần',
            pillar: pNames[i],
            zhi: zhis[i],
            type: 'Độc Lập Nội Giới',
            meaning: 'Tính cách thích tĩnh lặng một mình, suy tư độc lập, không thích a dua theo đám đông.'
          });
        }
        if (zhis[i] === cogg.qua_tu) {
          results.push({
            name: 'Quả Tú',
            pillar: pNames[i],
            zhi: zhis[i],
            type: 'Kín Kẽ Trầm Tư',
            meaning: 'Nội tâm khép kín, giữ bí mật tốt, đôi khi khó giãi bày tâm tư cùng bạn đời.'
          });
        }
      }
    }

    // 11. Hồng Loan / Thiên Hỷ (từ Chi Năm)
    const hly = SHEN_SHA_RULES.HONG_LOAN_THIEN_HY[chart.year_zhi];
    if (hly) {
      for (let i = 0; i < 4; i++) {
        if (zhis[i] === hly.hong_loan) {
          results.push({
            name: 'Hồng Loan',
            pillar: pNames[i],
            zhi: zhis[i],
            type: 'Hỷ Khí Duyên Lành',
            meaning: 'Duyên dáng đoan trang, hỷ sự lâm môn, được người người mến mộ.'
          });
        }
        if (zhis[i] === hly.thien_hy) {
          results.push({
            name: 'Thiên Hỷ',
            pillar: pNames[i],
            zhi: zhis[i],
            type: 'Phúc Khí Hoan Hỷ',
            meaning: 'Lạc quan yêu đời, mang lại niềm vui cho gia đạo và bạn bè xung quanh.'
          });
        }
      }
    }

    // 12. Thiên La Địa Võng
    if (zhis.includes('Thìn') && zhis.includes('Tuất')) {
      results.push({
        name: 'Thiên La Địa Võng (Thìn - Tuất)',
        pillar: 'Tứ Trụ',
        zhi: 'Thìn & Tuất',
        type: 'Rào Chắn Kỷ Luật',
        meaning: 'Cần chú trọng tuân thủ pháp luật, giữ gìn kỷ cương hành chính, tránh các tranh chấp pháp lý.'
      });
    }

    return results;
  }

  // ==========================================
  // V. HỆ THỐNG 6 CÂY QUYẾT ĐỊNH CHUYÊN ĐỀ
  // ==========================================

  function evaluatePersonality(chart, quant, mangPai, shenSha) {
    const dmTraits = {
      'Giáp': 'Cương trực, hiên ngang như tùng bách, trọng nghĩa khí, có chí tiến thủ mạnh mẽ nhưng đôi khi cố chấp, thiếu linh hoạt.',
      'Ất': 'Mềm mại, uyển chuyển như dây leo cỏ hoa, khả năng thích nghi ngoại giao xuất sắc nhưng lập trường dễ dao động.',
      'Bính': 'Hào sảng, nhiệt huyết như ánh thái dương, quang minh lỗi lạc, giàu lòng bao dung nhưng tính khí dễ nóng nảy vội vã.',
      'Đinh': 'Trầm tĩnh, sâu sắc như ngọn đèn soi bóng đêm, giàu trực giác và đồng cảm, tỉ mỉ cẩn trọng nhưng dễ đa sầu âu lo.',
      'Mậu': 'Vững chãi, đĩnh đạc như núi cao thành trì, trọng chữ tín và trung hậu nhưng đôi khi chậm chạp, bảo thủ.',
      'Kỷ': 'Bao dung, thấm nhuần như đất phù sa ruộng vườn, đa tài đa nghệ, khéo léo vun vén nhưng nội tâm có phần phức tạp.',
      'Canh': 'Cương liệt, quyết đoán như gươm báu đao kiếm, chuộng lẽ phải, dám làm dám chịu nhưng dễ va chạm gay gắt.',
      'Tân': 'Sắc sảo, tinh tế như ngọc ngà châu báu, trọng thể diện và danh dự, tư duy duy mỹ nhưng tự tôn quá cao.',
      'Nhâm': 'Phóng khoáng, thông tuệ như nước biển lớn, tầm nhìn chiến lược sâu rộng nhưng tính khí khó lường, ghét gò bó.',
      'Quý': 'Mềm mỏng, tĩnh lặng như giọt sương mai, trực giác siêu phàm, tư duy thấu đáo nhưng đôi lúc u hoài khép kín.'
    };

    const prominentDeities = [
      calculate10Deities(chart.day_gan, chart.month_gan),
      calculate10Deities(chart.day_gan, chart.hour_gan)
    ];

    const deityInfluences = [];
    if (prominentDeities.some(d => d.includes('Thực Thần'))) {
      deityInfluences.push('Thực Thần thấu lộ: Tính cách nho nhã, điềm đạm, thích cuộc sống bình an, yêu thích ẩm thực và nghệ thuật sống.');
    }
    if (prominentDeities.some(d => d.includes('Thương Quan'))) {
      deityInfluences.push('Thương Quan nhập cục: Trí tuệ phi thường, óc phản biện sắc bén, bất khuất trước quyền uy, tư duy đột phá đổi mới.');
    }
    if (prominentDeities.some(d => d.includes('Chính Quan'))) {
      deityInfluences.push('Chính Quan dẫn đầu: Kỷ luật nghiêm minh, tôn trọng pháp luật và danh dự, phong thái đàng hoàng mực thước.');
    }
    if (prominentDeities.some(d => d.includes('Thất Sát'))) {
      deityInfluences.push('Thất Sát nắm lệnh: Khí phách kiên cường, dũng cảm, bản lĩnh chỉ huy vượt qua nghịch cảnh và áp lực lớn.');
    }
    if (prominentDeities.some(d => d.includes('Ấn'))) {
      deityInfluences.push('Ấn Tinh sinh trợ: Ham học hỏi nghiên cứu, trọng đạo đức, có lòng trắc ẩn và thiên hướng hàn lâm tri thức.');
    }

    const starNotes = [];
    const starNames = shenSha.map(s => s.name);
    if (starNames.includes('Hoa Cái')) starNotes.push('Có Hoa Cái: Thiên hướng triết học, tư duy độc lập thanh cao, thích chiều sâu nội tâm.');
    if (starNames.includes('Văn Xương Quý Nhân')) starNotes.push('Có Văn Xương: Học thức thông tuệ, có khiếu viết lách, văn chương và lý luận khúc chiết.');
    if (starNames.includes('Kình Dương (Dương Nhẫn)')) starNotes.push('Có Kình Dương: Ý chí sắt đá, không lùi bước trước khó khăn nhưng cần kiềm chế cơn nóng nảy.');

    return {
      day_master_nature: dmTraits[chart.day_gan] || '',
      deity_influences: deityInfluences,
      star_notes: starNotes,
      body_state: quant.body_strength.detail
    };
  }

  function evaluateCareer(chart, quant, mangPai, shenSha) {
    const quantBody = quant.body_strength;
    const works = mangPai.work_mechanisms;
    const hg = mangPai.host_guest;

    let careerPath = '';
    const industryTags = [];

    const hasOfficer = Boolean(hg.officer_host.length || hg.officer_guest.length);
    const hasWealth = Boolean(hg.wealth_host.length || hg.wealth_guest.length);

    const quantStr = JSON.stringify(quant);
    if (quantStr.includes('Sát') || quantStr.includes('Quan')) {
      if (quantStr.includes('Ấn')) {
        careerPath = 'Quan Ấn Tương Sinh / Sát Ấn Tương Sinh: Phù hợp làm việc trong các tổ chức quy mô lớn, bộ máy hành chính nhà nước, lãnh đạo quản lý hoặc viện nghiên cứu học thuật cấp cao.';
        industryTags.push('Quản lý hành chính', 'Cơ quan công quyền', 'Giáo dục đại học', 'Nghiên cứu khoa học');
      } else {
        careerPath = 'Quan Sát Hữu Chế: Bản lĩnh kinh thương, thích hợp môi trường cạnh tranh cao, doanh nghiệp thương mại, kiểm soát rủi ro hoặc tư pháp.';
        industryTags.push('Doanh nghiệp lớn', 'Tư pháp kiểm toán', 'Quản trị rủi ro');
      }
    } else if (hasWealth && (quantStr.includes('Thực') || quantStr.includes('Thương'))) {
      careerPath = 'Thực Thương Sinh Tài: Tư duy thương trường xuất chúng, có khả năng tự tạo ra dòng tiền từ sản phẩm, dịch vụ trí tuệ hoặc sáng tạo nội dung độc lập.';
      industryTags.push('Kinh doanh tự do', 'Khởi nghiệp công nghệ', 'Thiết kế & Sáng tạo', 'Thương mại dịch vụ');
    } else {
      careerPath = 'Tỉ Kiếp Tố Công / Ấn Thụ Tố Công: Dựa vào chuyên môn tay nghề sâu, kỹ năng kỹ thuật độc lập hoặc học vấn để phát triển vững chắc.';
      industryTags.push('Kỹ thuật chuyên sâu', 'Công nghệ thông tin', 'Tư vấn chuyên gia', 'Y dược & Trị liệu');
    }

    let workEfficiency = '';
    if (works.length >= 3) {
      workEfficiency = 'Mệnh cục Tố Công Đa Năng: Cuộc đời năng động, làm việc không ngừng nghỉ, mở ra nhiều ngã rẽ và cơ hội phát triển vượt bậc.';
    } else if (works.length >= 1) {
      workEfficiency = 'Mệnh cục Tố Công Tập Trung: Đường hướng sự nghiệp nhất quán, chuyên tâm sâu sắc vào một lĩnh vực chủ chốt để đạt thành tựu.';
    } else {
      workEfficiency = 'Mệnh cục Khí thế thanh nhàn: Ít xung đột bon chen, coi trọng sự an yên ổn định hơn là chạy theo danh lợi trường đời.';
    }

    return {
      career_pattern: quantBody.pattern,
      career_path: careerPath,
      industry_tags: industryTags,
      work_efficiency: workEfficiency,
      mechanisms_summary: works.slice(0, 4).map(w => `${w.detail} -> ${w.meaning}`)
    };
  }

  function evaluateWealth(chart, quant, mangPai, shenSha) {
    const strength = quant.body_strength.strength;
    const scores = quant.element_scores;
    const wealthWx = quant.body_strength.wealth_wx;
    const wealthScore = scores[wealthWx] || 0.0;
    const hg = mangPai.host_guest;

    const treasuryStatus = [];
    for (const w of mangPai.work_mechanisms) {
      if (w.type === 'Mộ Khố Tác Dụng') {
        treasuryStatus.push(`${w.detail}: ${w.meaning}`);
      }
    }

    let wealthLevel = '';
    let wealthAdvice = '';

    if (strength.includes('Thân Vượng')) {
      if (wealthScore >= 15.0) {
        wealthLevel = 'Thân Vượng Thắng Tài: Bản lĩnh quản trị tài chính mạnh mẽ, có sức khỏe và nghị lực gánh vác khối lượng của cải lớn, đại cát đại lợi.';
        wealthAdvice = 'Nên mạnh dạn đầu tư vào tài sản hữu hình, bất động sản hoặc sản xuất kinh doanh có chiều sâu.';
      } else {
        wealthLevel = 'Thân Vượng Tài Khí Tiềm Ẩn: Sức làm việc rất lớn nhưng cần gặp thời vận tương sinh (Đại vận Tài/Thương) để khai phá dòng tiền bùng nổ.';
        wealthAdvice = 'Tập trung xây dựng nền tảng chuyên môn vững chắc, tiền tài sẽ tự tìm đến khi thời cơ chín muồi.';
      }
    } else if (strength.includes('Thân Nhược')) {
      if (wealthScore >= 25.0) {
        wealthLevel = 'Tài Đa Thân Nhược (Cơ hội ngập tràn nhưng năng lực tự thân chịu áp lực lớn): Dễ mệt mỏi vì tiền của, kiếm được nhiều nhưng dễ hao hụt qua quan hệ xã hội.';
        wealthAdvice = 'Tuyệt đối không nên ôm đồm quá nhiều dự án cùng lúc; nên hợp tác cổ phần với người đáng tin cậy để chia sẻ rủi ro.';
      } else {
        wealthLevel = 'Tài Khí Hài Hòa: Kiếm tiền vừa sức, cuộc sống ấm no ổn định, không chịu gánh nặng nợ nần lớn.';
        wealthAdvice = 'Duy trì kỷ luật chi tiêu có kế hoạch, tích lũy từng bước chắc chắn.';
      }
    } else {
      wealthLevel = 'Mệnh Cục Tài Vận Đặc Thù: Lợi nhuận bùng nổ mạnh mẽ theo chu kỳ thời vận hỷ dụng thần.';
      wealthAdvice = 'Nắm bắt các cơ hội theo xu thế công nghệ mới và liên minh hợp tác lớn.';
    }

    return {
      wealth_level: wealthLevel,
      wealth_score: `${wealthWx} (${wealthScore} điểm)`,
      host_guest_wealth: hg.summary,
      treasury_analysis: treasuryStatus.length > 0 ? treasuryStatus : ['Lá số không tọa Tài Khố lộ thiên; tích lũy dựa vào dòng tiền lưu động.'],
      wealth_advice: wealthAdvice
    };
  }

  function evaluateMarriage(chart, quant, mangPai, shenSha) {
    const dayZhi = chart.day_zhi;
    const spouseInteractions = [];
    for (const w of mangPai.work_mechanisms) {
      if (w.scope.includes('Ngày') || w.detail.includes(dayZhi)) {
        spouseInteractions.push(`${w.type}: ${w.detail} (${w.meaning})`);
      }
    }

    let marriageStatus = '';
    let marriageAdvice = '';

    if (spouseInteractions.some(s => s.includes('Xuyên'))) {
      marriageStatus = 'Cung Phu Thê phạm Xuyên (Hại): Mối quan hệ vợ chồng dễ có những rạn nứt hoặc tổn thương nội tâm ngầm khó giãi bày. Cần cẩn trọng bất đồng quan điểm sống.';
      marriageAdvice = 'Hai bên nên học cách tôn trọng không gian riêng của nhau, chia sẻ chân thành và tránh để người ngoài can thiệp vào chuyện riêng tư.';
    } else if (spouseInteractions.some(s => s.includes('Xung'))) {
      marriageStatus = 'Cung Phu Thê tọa Xung: Vợ chồng tính cách trái ngược, hay tranh luận hoặc thường xuyên phải công tác xa nhau.';
      marriageAdvice = 'Nên biến thế xung thành dịch chuyển tích cực: cùng nhau đi du lịch, chia sẻ công việc hoặc phân chia trách nhiệm gia đình rõ ràng.';
    } else if (spouseInteractions.some(s => s.includes('Hợp'))) {
      marriageStatus = 'Cung Phu Thê đắc Hợp: Tình cảm gắn kết sâu sắc, vợ chồng có sức hút bền chặt, tương trợ đắc lực cho công danh nhau.';
      marriageAdvice = 'Duy trì sự tin cậy lẫn nhau, cùng vun đắp mục tiêu kinh tế chung.';
    } else {
      marriageStatus = 'Cung Phu Thê bình ổn, tĩnh tại: Cuộc sống gia đạo êm đềm, ít sóng gió bất thường.';
      marriageAdvice = 'Chăm sóc đời sống tinh thần và quan tâm đến các mốc thời vận gia đình.';
    }

    return {
      palace_zhi: dayZhi,
      marriage_status: marriageStatus,
      spouse_interactions: spouseInteractions.length > 0 ? spouseInteractions : ['Cung Phu Thê không bị xung hại trực tiếp, thế cục gia đạo an định.'],
      marriage_advice: marriageAdvice
    };
  }

  function evaluateHealth(chart, quant, mangPai, shenSha) {
    const scores = quant.element_scores;
    const warnings = [];
    const preventions = [];

    const tangPhuMap = {
      'Mộc': { organ: 'Can (Gan), Đởm (Mật), Hệ gân cốt, Mắt', prevent: 'Hạn chế thức khuya sau 23h, kiểm soát căng thẳng, bổ sung nước và rau xanh, bảo vệ thị lực.' },
      'Hỏa': { organ: 'Tâm (Tim mạch), Tiểu tràng, Huyết áp, Hệ tuần hoàn', prevent: 'Tránh xúc động mạnh đột ngột, theo dõi huyết áp định kỳ, tập thể dục nhịp điệu nhẹ nhàng.' },
      'Thổ': { organ: 'Tỳ (Lách), Vị (Dạ dày), Hệ tiêu hóa, Chuyển hóa', prevent: 'Ăn uống đúng giờ, giảm bớt đồ ngọt cay nóng khó tiêu, tránh âu lo suy nghĩ quá độ khi ăn.' },
      'Kim': { organ: 'Phế (Phổi), Đại tràng, Đường hô hấp, Da lông', prevent: 'Giữ ấm cổ họng khi chuyển mùa, tránh môi trường khói bụi ô nhiễm, tập thở sâu khí công.' },
      'Thủy': { organ: 'Thận, Bàng quang, Hệ tiết niệu, Xương tủy, Sinh lý', prevent: 'Uống đủ nước ấm, tránh ngồi lâu một chỗ, giữ ấm vùng thắt lưng và bàn chân vào mùa lạnh.' }
    };

    for (const elem in scores) {
      const val = scores[elem];
      if (val >= 42.0) {
        warnings.push(`Hành ${elem} quá vượng (${val}đ - Khí ứ trệ): Nguy cơ ảnh hưởng trực tiếp đến ${tangPhuMap[elem].organ}.`);
        preventions.push(`Đối với ${elem}: ${tangPhuMap[elem].prevent}`);
      } else if (val <= 8.0) {
        warnings.push(`Hành ${elem} quá suy yếu (${val}đ - Khí suy kiệt): Dễ suy giảm chức năng ${tangPhuMap[elem].organ}.`);
        preventions.push(`Đối với ${elem}: ${tangPhuMap[elem].prevent}`);
      }
    }

    if (warnings.length === 0) {
      warnings.push('Ngũ hành phân bố tương đối đồng đều (không có hành nào vượt quá ngưỡng 42đ hoặc dưới 8đ). Khí sắc và sức đề kháng tổng thể tốt.');
      preventions.push('Duy trì chế độ sinh hoạt điều độ, cân bằng giữa làm việc và nghỉ ngơi.');
    }

    return {
      health_warnings: warnings,
      lifestyle_preventions: preventions
    };
  }

  function evaluateTimingYear(chart, quant, mangPai, targetYear) {
    const lps = chart.luck_pillars || [];
    let activeLuck = null;
    for (const lp of lps) {
      const yStart = lp.year_start || lp.year;
      if (yStart <= targetYear && targetYear <= yStart + 9) {
        activeLuck = lp;
        break;
      }
    }

    const gIdx = ((targetYear - 4) % 10 + 10) % 10;
    const zIdx = ((targetYear - 4) % 12 + 12) % 12;
    const yGan = TIAN_GAN[gIdx];
    const yZhi = DI_ZHI[zIdx];
    const yCanChi = `${yGan} ${yZhi}`;
    const yDeity = calculate10Deities(chart.day_gan, yGan);

    const yearInteractions = [];
    const zhis = [chart.year_zhi, chart.month_zhi, chart.day_zhi, chart.hour_zhi];
    const pNames = ['Năm', 'Tháng', 'Ngày', 'Giờ'];

    for (let i = 0; i < 4; i++) {
      const z = zhis[i];
      if (ZHI_CHONG[yZhi] === z) yearInteractions.push(`Chi Lưu Niên ${yZhi} XUNG Chi ${z} trụ ${pNames[i]} -> Biến động mạnh mẽ, thay đổi môi trường.`);
      if (ZHI_CHUAN[yZhi] === z) yearInteractions.push(`Chi Lưu Niên ${yZhi} XUYÊN Chi ${z} trụ ${pNames[i]} -> Cần đề phòng va chạm, tổn thất bất ngờ.`);
      if (ZHI_HE[yZhi] === z) yearInteractions.push(`Chi Lưu Niên ${yZhi} HỢP Chi ${z} trụ ${pNames[i]} -> Có cơ hội gắn kết, hợp tác làm ăn thuận lợi.`);
    }

    const favorableElems = [...quant.gods_selection.favorable, ...quant.gods_selection.primary_use];
    const unfavorableElems = quant.gods_selection.unfavorable;
    const yearGanWx = GAN_WU_XING[yGan];

    let forecastGrade = '';
    let forecastDesc = '';

    if (favorableElems.includes(yearGanWx)) {
      forecastGrade = 'Năm Thuận Buồm Xuôi Gió / Đắc Thời';
      forecastDesc = `Thiên Can ${yGan} mang ngũ hành ${yearGanWx} tương hợp với Dụng Thần bản mệnh. Thời cơ thuận lợi để mở rộng quy mô, thực hiện các dự định lớn và gặt hái thành quả.`;
    } else if (unfavorableElems.includes(yearGanWx)) {
      forecastGrade = 'Năm Thử Thách / Cần Cẩn Trọng Giữ Gìn';
      forecastDesc = `Thiên Can ${yGan} mang ngũ hành ${yearGanWx} lâm vào cung Kỵ Thần. Nên giữ thế thủ vững chắc, tránh mạo hiểm tài chính quy mô lớn, chú trọng củng cố nội lực.`;
    } else {
      forecastGrade = 'Năm Bình Ổn / Tích Lũy Bền Vững';
      forecastDesc = `Khí số năm ${targetYear} ở thế trung dung cân bằng. Vừa làm vừa tích lũy, ổn định từng bước tiến lên.`;
    }

    return {
      target_year: targetYear,
      year_can_chi: yCanChi,
      year_deity: yDeity,
      active_luck_pillar: activeLuck ? `${activeLuck.canChi || activeLuck.can_chi} (${activeLuck.age_start || activeLuck.age}-${activeLuck.age_end || activeLuck.endAge} tuổi)` : 'N/A',
      forecast_grade: forecastGrade,
      forecast_desc: forecastDesc,
      year_interactions: yearInteractions.length > 0 ? yearInteractions : ['Không có xung hại trực diện vào gốc Tứ Trụ; vận khí trôi chảy êm ả.']
    };
  }

  // ==========================================
  // VI. ĐỘNG CƠ THỜI VẬN CHUYÊN SÂU (TIMING ENGINE)
  // ==========================================

  const ELEMENT_PRODUCED_BY = { 'Mộc': 'Thủy', 'Hỏa': 'Mộc', 'Thổ': 'Hỏa', 'Kim': 'Thổ', 'Thủy': 'Kim' };
  const ELEMENT_PRODUCES = { 'Thủy': 'Mộc', 'Mộc': 'Hỏa', 'Hỏa': 'Thổ', 'Thổ': 'Kim', 'Kim': 'Thủy' };
  const ELEMENT_CONTROLS = { 'Mộc': 'Thổ', 'Hỏa': 'Kim', 'Thổ': 'Thủy', 'Kim': 'Mộc', 'Thủy': 'Hỏa' };

  function getTreasuryRole(dayWx, treasuryZhi) {
    const tWx = TREASURY_MAP[treasuryZhi] ? TREASURY_MAP[treasuryZhi].element : '';
    if (!tWx) return 'Mộ Khố';
    if (tWx === dayWx) return 'Tỉ Kiếp Khố (Kho Nhân Lực, Huynh Đệ, Cạnh Tranh)';
    if (tWx === ELEMENT_PRODUCED_BY[dayWx]) return 'Ấn Khố (Kho Trí Tuệ, Bằng Cấp, Nhà Đất, Chỗ Dựa)';
    if (tWx === ELEMENT_PRODUCES[dayWx]) return 'Thực Thương Khố (Kho Sáng Tạo, Ý Tưởng, Con Cái, Đầu Tư)';
    if (tWx === ELEMENT_CONTROLS[dayWx]) return 'Tài Khố (Kho Tiền Bạc, Nguồn Vốn, Doanh Thu, Tài Sản)';
    return 'Quan Sát Khố (Kho Quyền Lực, Chức Vị, Quản Lý, Pháp Lý)';
  }

  function analyzeDeepLuckPillars(chart, quant, mangPai) {
    const lps = chart.luck_pillars || [];
    const dayWx = GAN_WU_XING[chart.day_gan];
    const favorable = [...quant.gods_selection.favorable, ...quant.gods_selection.primary_use];
    const unfavorable = quant.gods_selection.unfavorable;

    const zhis = [chart.year_zhi, chart.month_zhi, chart.day_zhi, chart.hour_zhi];
    const pNames = ['Năm', 'Tháng', 'Ngày', 'Giờ'];

    return lps.map(lp => {
      const gan = lp.gan;
      const zhi = lp.zhi;
      const canChi = lp.canChi || lp.can_chi;
      const ageStart = lp.age_start || lp.age;
      const ageEnd = lp.age_end || (ageStart + 9);
      const yearStart = lp.year_start || lp.year;
      const yearEnd = yearStart + 9;
      const deity = lp.deity || lp.ten_god;
      const changSheng = lp.changSheng || lp.chang_sheng;

      const ganWx = GAN_WU_XING[gan];
      const zhiWx = ZHI_WU_XING[zhi];

      // Tương tác Chi Vận với 4 Trụ
      const pillarInteractions = [];
      for (let i = 0; i < 4; i++) {
        const pz = zhis[i];
        if (ZHI_CHUAN[zhi] === pz) pillarInteractions.push(`Chi Đại Vận ${zhi} XUYÊN ${pz} trụ ${pNames[i]} -> Biến cố ngầm, đứt gãy quan hệ.`);
        if (ZHI_CHONG[zhi] === pz) pillarInteractions.push(`Chi Đại Vận ${zhi} XUNG ${pz} trụ ${pNames[i]} -> Biến động lớn, dời chỗ ở, thay đổi công việc.`);
        if (ZHI_HE[zhi] === pz) pillarInteractions.push(`Chi Đại Vận ${zhi} LỤC HỢP ${pz} trụ ${pNames[i]} -> Kết giao uy tín, thêm trợ lực hợp tác.`);
        if ((SAN_HE[zhi] || []).includes(pz)) pillarInteractions.push(`Chi Đại Vận ${zhi} BÁN HỢP ${pz} trụ ${pNames[i]} -> Tụ khí ngũ hành, sinh khí dồi dào.`);
      }

      // Mộ khố trong Đại Vận
      let treasuryInfo = null;
      if (TREASURY_MAP[zhi]) {
        treasuryInfo = {
          zhi,
          name: TREASURY_MAP[zhi].name,
          role: getTreasuryRole(dayWx, zhi),
          status: 'Đại Vận mở kho'
        };
      }

      // Đánh giá 5 năm đầu vs 5 năm sau
      const first5Favorable = favorable.includes(ganWx);
      const last5Favorable = favorable.includes(zhiWx);

      let summaryGrade = '';
      if (first5Favorable && last5Favorable) summaryGrade = 'Đại Cát Cả 10 Năm';
      else if (!first5Favorable && !last5Favorable) summaryGrade = 'Gian Nan Thử Thách 10 Năm';
      else if (first5Favorable) summaryGrade = 'Tiền Cát Hậu Bình (5 năm đầu hanh thông)';
      else summaryGrade = 'Tiền Nan Hậu Cát (5 năm sau khởi sắc)';

      return {
        step: lp.step,
        canChi,
        ageRange: `${ageStart} - ${ageEnd} tuổi`,
        yearRange: `${yearStart} - ${yearEnd}`,
        deity,
        changSheng,
        summaryGrade,
        first5Years: `${gan} (${ganWx}) quản 5 năm đầu (${yearStart} - ${yearStart + 4}): ${first5Favorable ? 'Hỷ Thần tương trợ' : (unfavorable.includes(ganWx) ? 'Kỵ Thần áp chế' : 'Khí số bình hòa')}`,
        last5Years: `${zhi} (${zhiWx}) quản 5 năm sau (${yearStart + 5} - ${yearEnd}): ${last5Favorable ? 'Hỷ Thần đắc địa' : (unfavorable.includes(zhiWx) ? 'Kỵ Thần quấy nhiễu' : 'Khí số bình hòa')}`,
        pillarInteractions,
        treasuryInfo
      };
    });
  }

  function detectAnnualMilestones(chart, quant, mangPai, targetYear) {
    const lps = chart.luck_pillars || [];
    let activeLp = null;
    for (const lp of lps) {
      const yStart = lp.year_start || lp.year;
      if (yStart <= targetYear && targetYear <= yStart + 9) {
        activeLp = lp;
        break;
      }
    }
    if (!activeLp) return [];

    const gIdx = ((targetYear - 4) % 10 + 10) % 10;
    const zIdx = ((targetYear - 4) % 12 + 12) % 12;
    const yGan = TIAN_GAN[gIdx];
    const yZhi = DI_ZHI[zIdx];
    const yCanChi = `${yGan} ${yZhi}`;
    const yDeity = calculate10Deities(chart.day_gan, yGan);

    const dayGan = chart.day_gan;
    const dayZhi = chart.day_zhi;
    const monthZhi = chart.month_zhi;
    const hourZhi = chart.hour_zhi;
    const ageAtTarget = targetYear - chart.birth_year;
    const isMale = chart.is_male;

    const events = [];

    // 1. Mua Nhà / Điền Sản
    const propertyTriggers = [];
    if (GAN_HE[dayGan] === yGan && (ZHI_HE[yZhi] === dayZhi || yZhi === dayZhi)) {
      propertyTriggers.push(`Thiên Can Lưu Niên ${yGan} (${yDeity}) HỢP Nhật Can ${dayGan}`);
      propertyTriggers.push(`Chi Lưu Niên ${yZhi} LỤC HỢP / ĐỒNG KHÍ Tọa Chi ${dayZhi}`);
      events.push({
        category: 'Nhà cửa & Điền sản',
        badge: '🏡 MUA NHÀ / TẠO LẬP TRẠCH VIỆN / RA Ở RIÊNG',
        triggers: propertyTriggers,
        description: `Năm ${targetYear} (${yCanChi}) hội tụ tượng cách: Can ${yGan} (${yDeity}) hợp Thân, Chi ${yZhi} mang Ấn Lục Hợp Tọa Chi ${dayZhi}: Đem Ấn nhập thân, chủ sở hữu tư gia, tậu nhà riêng hoặc độc lập điền sản.`
      });
    }

    // 2. Hỷ Sự Hôn Nhân / Kết Hôn
    if (!propertyTriggers.length) {
      const isLucHopSpouse = (ZHI_HE[yZhi] === dayZhi);
      const isTamHopSpouse = ((SAN_HE[dayZhi] || []).includes(yZhi));
      let isSpouseStar = false;
      if (isMale && (yDeity.includes('Tài') || GAN_HE[dayGan] === yGan)) isSpouseStar = true;
      if (!isMale && (yDeity.includes('Quan') || yDeity.includes('Sát') || GAN_HE[dayGan] === yGan)) isSpouseStar = true;

      if (isLucHopSpouse && (ageAtTarget >= 20 && ageAtTarget <= 36)) {
        events.push({
          category: 'Hôn nhân & Gia đạo',
          badge: '💍 HỶ SỰ HÔN NHÂN / KẾT HÔN',
          triggers: [`Chi Lưu Niên ${yZhi} LỤC HỢP trực diện Cung Phu Thê ${dayZhi}`],
          description: `Năm ${targetYear} (${yCanChi}) có Chi Lưu Niên ${yZhi} LỤC HỢP trực diện với Tọa Chi ${dayZhi} (Cung Phu Thê): 'Phu Thê Cung phùng Lục Hợp, hỷ sự tất lâm môn'. Đương số kết duyên trăm năm, chính thức thành gia lập thất.`
        });
      } else if ((isLucHopSpouse || isTamHopSpouse) && isSpouseStar) {
        events.push({
          category: 'Hôn nhân & Gia đạo',
          badge: ageAtTarget <= 38 ? '💍 HỶ SỰ HÔN NHÂN / KẾT HÔN' : '💖 HỶ SỰ GIA ĐẠO / PHU THÊ ĐỒNG TÂM',
          triggers: [`Cung Phu Thê đắc Hợp + Tinh tú phối ngẫu giao hòa (${yDeity})`],
          description: `Năm ${targetYear} (${yCanChi}) kích hoạt cung duyên nợ và phối ngẫu, chủ hỷ khí lâm môn, hôn phối hòa hợp.`
        });
      }
    }

    // 3. Sinh Con / Thêm Đinh
    const isChildStar = isMale ? (yDeity.includes('Quan') || yDeity.includes('Sát')) : (yDeity.includes('Thực') || yDeity.includes('Thương'));
    if ((ZHI_HE[yZhi] === hourZhi || (SAN_HE[hourZhi] || []).includes(yZhi)) && (isChildStar || yDeity.includes('Thực') || yDeity.includes('Thương'))) {
      events.push({
        category: 'Con cái & Tử tức',
        badge: '👶 SINH CON / THÊM ĐINH ĐÓN QUÝ TỬ',
        triggers: [`Chi Lưu Niên ${yZhi} HỢP Cung Tử Tức Trụ Giờ ${hourZhi} kết hợp sao sinh nở`],
        description: `Năm ${targetYear} (${yCanChi}) dẫn động Cung Tử Tức và tinh tú con cái, chủ gia đạo thêm đinh, đón quý tử bình an.`
      });
    }

    // 4. Thăng Tiến Công Danh
    const favorableElems = [...quant.gods_selection.favorable, ...quant.gods_selection.primary_use];
    if (favorableElems.includes(GAN_WU_XING[yGan]) && (yDeity.includes('Quan') || yDeity.includes('Ấn') || yDeity.includes('Tướng Tinh'))) {
      events.push({
        category: 'Sự nghiệp & Công danh',
        badge: '📈 THĂNG TIẾN CÔNG DANH / MỞ RỘNG TẦM ẢNH HƯỞNG',
        triggers: [`Lưu Niên ${yCanChi} mang ${yDeity} là Dụng Thần trợ mệnh`],
        description: `Năm ${targetYear} (${yCanChi}) thiên can dẫn xuất quý khí, quyền hành gia tăng, được cấp trên tín nhiệm giao phó trọng trách.`
      });
    }

    // 5. Tụ Tài / Khai Khố
    if (TREASURY_MAP[yZhi] && (ZHI_CHONG[yZhi] === monthZhi || (ZHI_XING[yZhi] || []).includes(monthZhi))) {
      events.push({
        category: 'Tài chính & Kinh doanh',
        badge: '💰 KHAI KHỐ TỤ TÀI / DÒNG TIỀN ĐỘT PHÁ',
        triggers: [`Chi Lưu Niên ${yZhi} Xung/Hình mở kho tàng`],
        description: `Năm ${targetYear} (${yCanChi}) kích hoạt 'Bất xung bất phát', mở bung kho tàng tài sản, mang lại lợi nhuận quy mô lớn.`
      });
    }

    // 6. Dịch Mã / Xuất Ngoại
    const maTarget = SHEN_SHA_RULES.DICH_MA[chart.year_zhi];
    if (yZhi === maTarget || ZHI_CHONG[yZhi] === chart.year_zhi) {
      events.push({
        category: 'Dịch chuyển & Cư trú',
        badge: '🚗 BIẾN ĐỘNG ĐI LẠI / XUẤT NGOẠI / ĐỔI MÔI TRƯỜNG',
        triggers: [`Lưu Niên lâm Dịch Mã hoặc Xung Chi Năm`],
        description: `Năm ${targetYear} (${yCanChi}) động cung di chuyển, chủ đi công tác xa, du học xuất ngoại hoặc chuyển đổi chi nhánh làm việc.`
      });
    }

    return events;
  }

  // ==========================================
  // VII. BỘ SINH BÁO CÁO TOÀN DIỆN (REPORT GENERATOR)
  // ==========================================

  function evaluateGeJu(chart, quant) {
    const dm = chart.day_gan;
    const mz = chart.month_zhi;
    const luKinhMap = {
      'Giáp': { lộc: 'Dần', nhẫn: 'Mão' },
      'Ất': { lộc: 'Mão', nhẫn: 'Thìn' },
      'Bính': { lộc: 'Tỵ', nhẫn: 'Ngọ' },
      'Đinh': { lộc: 'Ngọ', nhẫn: 'Mùi' },
      'Mậu': { lộc: 'Tỵ', nhẫn: 'Ngọ' },
      'Kỷ': { lộc: 'Ngọ', nhẫn: 'Mùi' },
      'Canh': { lộc: 'Thân', nhẫn: 'Dậu' },
      'Tân': { lộc: 'Dậu', nhẫn: 'Tuất' },
      'Nhâm': { lộc: 'Hợi', nhẫn: 'Tý' },
      'Quý': { lộc: 'Tý', nhẫn: 'Sửu' }
    };

    if (luKinhMap[dm] && luKinhMap[dm].nhẫn === mz) {
      return {
        name: 'Dương Nhẫn Cách (Kình Dương Nguyệt Lệnh)',
        type: 'Đặc Cách Tử Bình',
        status: quant.body_strength.is_strong ? 'Thành Cách (Thân vượng cần Quan Sát chế ngự)' : 'Cần Ấn Thụ điều phối',
        description: 'Khí lực bản thân cực kỳ dũng mãnh, tính cách quyết đoán, dám nghĩ dám làm, thích hợp lĩnh vực quản lý kỷ luật, kỹ thuật phức tạp hoặc tiên phong khai phá.',
        favorableGods: 'Quan Sát hoặc Thực Thương',
        advice: 'Cần duy trì sự bình tĩnh, tránh nóng vội, lắng nghe ý kiến cộng sự để chuyển hóa uy lực thành thành tựu bền vững.'
      };
    }

    if (luKinhMap[dm] && luKinhMap[dm].lộc === mz) {
      return {
        name: 'Kiến Lộc Cách (Lộc Thần Nguyệt Lệnh)',
        type: 'Đặc Cách Tử Bình',
        status: 'Thành Cách (Thân vượng tự lập, cần Tài Quan thấu lộ)',
        description: 'Mệnh chủ tự lực cánh sinh, không nương tựa gia sản tổ nghiệp, tự thân dựng nên cơ đồ bằng thực lực và ý chí kiên định.',
        favorableGods: 'Tài Tinh và Quan Tinh',
        advice: 'Tận dụng ưu thế năng lực bản thân, mở rộng mạng lưới hợp tác và tích lũy dòng vốn bài bản.'
      };
    }

    const hidden = HIDDEN_GANS_RATIO[mz] || [];
    const stems = [chart.year_gan, chart.month_gan, chart.hour_gan];
    let chosen = null;

    for (const h of hidden) {
      if (stems.includes(h.gan)) {
        chosen = h;
        break;
      }
    }
    if (!chosen && hidden.length > 0) chosen = hidden[0];

    const deity = calculate10Deities(dm, chosen.gan);
    const geJuNames = {
      'Chính Quan': { name: 'Chính Quan Cách', desc: 'Thanh cao chính trực, quy phạm khuôn phép, có tài quản lý hành chính và danh dự xã hội.' },
      'Thất Sát': { name: 'Thất Sát Cách (Thiên Quan)', desc: 'Uy dũng quyết liệt, năng lực ứng biến sắc bén, thích nghi vượt trội trong môi trường cạnh tranh khốc liệt.' },
      'Chính Ấn': { name: 'Chính Ấn Cách (Ấn Thụ Cách)', desc: 'Bác ái, nhân hậu, hiếu học, có phúc ấm che chở, trường thọ và uy tín trong lĩnh vực học thuật, tư vấn.' },
      'Thiên Ấn': { name: 'Thiên Ấn Cách (Kiêu Thần)', desc: 'Tư duy độc đáo, trí tuệ phi truyền thống, năng khiếu nghệ thuật, nghiên cứu chuyên sâu hoặc công nghệ cao.' },
      'Chính Tài': { name: 'Chính Tài Cách', desc: 'Cần kiệm, thực tế, tài chính minh bạch, tích lũy vững vàng từng bước, coi trọng chữ tín và gia đình.' },
      'Thiên Tài': { name: 'Thiên Tài Cách', desc: 'Hào sảng, nhạy bén cơ hội thương trường, dòng tiền luân chuyển mạnh mẽ, năng khiếu kinh doanh đầu tư.' },
      'Thực Thần': { name: 'Thực Thần Cách', desc: 'Ôn hòa, thanh lịch, tài hoa tiết tú, khẩu tài xuất chúng, phúc lộc tự nhiên và trường thọ an nhàn.' },
      'Thương Quan': { name: 'Thương Quan Cách', desc: 'Thông tuệ xuất chúng, tài hoa phát tiết, phản biện sắc sảo, dám đột phá lối mòn nhưng cần khiêm nhường.' }
    };

    const info = geJuNames[deity] || { name: `${deity} Cách`, desc: 'Cách cục thiên định vận hành theo Thập Thần chủ quản.' };
    return {
      name: info.name,
      type: `Chính Cách Tử Bình (${chosen.type} thấu lộ)`,
      deity: deity,
      originGan: chosen.gan,
      status: quant.body_strength.is_strong ? 'Thân Vượng Đắc Cách' : 'Thân Nhược Hữu Cách (Cần Ấn Tỉ nâng đỡ)',
      description: info.desc,
      favorableGods: quant.gods_selection.primary_use.join(', ') || 'Tùy vận',
      advice: 'Lấy Dụng Thần làm trung tâm điều phối hành vi, duy trì sự cân bằng ngũ hành để cách cục đạt hiệu quả cao nhất.'
    };
  }

  function calculate12Months(targetYear, dayGan) {
    const yGanIdx = ((targetYear - 4) % 10 + 10) % 10;
    const startGanIdx = ((yGanIdx % 5) * 2 + 2) % 10;
    const MONTH_ZHIS = ['Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu'];
    const SOLAR_TERMS = [
      'Tiết Lập Xuân (Tháng Giêng)', 'Tiết Kinh Trập (Tháng Hai)', 'Tiết Thanh Minh (Tháng Ba)',
      'Tiết Lập Hạ (Tháng Tư)', 'Tiết Mang Chủng (Tháng Năm)', 'Tiết Tiểu Thử (Tháng Sáu)',
      'Tiết Lập Thu (Tháng Bảy)', 'Tiết Bạch Lộ (Tháng Tám)', 'Tiết Hàn Lộ (Tháng Chín)',
      'Tiết Lập Đông (Tháng Mười)', 'Tiết Đại Tuyết (Tháng Mười Một)', 'Tiết Tiểu Hàn (Tháng Chạp)'
    ];

    const results = [];
    for (let m = 0; m < 12; m++) {
      const gan = TIAN_GAN[(startGanIdx + m) % 10];
      const zhi = MONTH_ZHIS[m];
      const canChi = `${gan} ${zhi}`;
      const deity = calculate10Deities(dayGan, gan);
      results.push({
        monthNumber: m + 1,
        solarTerm: SOLAR_TERMS[m],
        canChi,
        gan,
        zhi,
        deity,
        wx: ZHI_WU_XING[zhi]
      });
    }
    return results;
  }

  // ==========================================
  // VII-B. ĐỘNG CƠ TỔNG HỢP CỐT CÁCH & BẢN ĐỒ CHIẾN LƯỢC VẬN TRÌNH (BAZI MASTER SYNTHESIZER)
  // ==========================================

  const BaziMasterSynthesizer = {
    synthesizeMasterAssessment: function (chart, quant, mangPai, shenSha, decisions, timingData, targetYear = 2026) {
      const dm = chart.day_gan;
      const dmZhi = chart.day_zhi;
      const dmWx = GAN_WU_XING[dm];
      const dmYinYang = GAN_YIN_YANG[dm] === '+' ? 'Dương' : 'Âm';
      const dmChangSheng = calculateChangSheng(dm, dmZhi);
      const baziYear = chart.birth_year;
      const isMale = chart.is_male;
      const body = quant.body_strength || {};
      const gods = quant.gods_selection || { primary_use: [], favorable: [], unfavorable: [] };
      const geju = evaluateGeJu(chart, quant);
      const scores = quant.element_scores || {};

      // 1. Điểm cốt cách định lượng khách quan (overallScore 50-96)
      let overallScore = 68;
      if (body.strength === 'Thân Vượng' || body.strength === 'Trung Hòa') overallScore += 7;
      if (geju.status && geju.status.includes('Thành Cách')) overallScore += 6;
      if (mangPai.work_mechanisms && mangPai.work_mechanisms.length >= 2) overallScore += 5;

      const goodShenSha = (shenSha || []).filter(s =>
        s.type.includes('Cát') || s.type.includes('Quý Nhân') || s.name.includes('Quý Nhân') || s.name.includes('Lộc') || s.name.includes('Tướng')
      );
      const badShenSha = (shenSha || []).filter(s =>
        s.type.includes('Hung') || s.name.includes('Dương') || s.name.includes('Sát') || s.name.includes('Đà') || s.name.includes('Cô') || s.name.includes('Quả')
      );
      overallScore += Math.min(10, goodShenSha.length * 2);
      overallScore -= Math.min(8, badShenSha.length * 2);

      // Cân đối điểm
      overallScore = Math.max(48, Math.min(94, overallScore));

      let gradeBadge = "Cát Cách Vững Vàng";
      if (overallScore >= 85) gradeBadge = "Cát Cách (Vận Số Thuận Chiều)";
      else if (overallScore >= 75) gradeBadge = "Cát Cách Vững Vàng (Khí Số Thuận Lợi)";
      else if (overallScore >= 65) gradeBadge = "Khí Số Bình Ổn (Trung Bình Khá)";
      else gradeBadge = "Cần Tôi Rèn Bản Lĩnh (Vượt Khó Kiến Tạo)";

      const primaryUseStr = (gods.primary_use || []).join(', ') || 'Đang định';
      const favorableStr = (gods.favorable || []).join(', ') || 'Đang định';
      const unfavorableStr = (gods.unfavorable || []).join(', ') || 'Không đáng kể';
      const climateUseStr = gods.climate_use || '';

      const executiveSummary = `Lá số Bát Tự sở hữu phẩm cách ${gradeBadge} (Điểm định lượng cốt cách: ${overallScore}/100). Bản thể Nhật Chủ ${dm} (${dmYinYang} ${dmWx}) tọa Chi Ngày ${dmZhi} ở vị thế ${dmChangSheng}, thế cục ${body.strength || 'Trung Hòa'} (${body.pattern || 'Chính Cách'}), phối hợp cách cục ${geju.name}. Hệ thống Hỷ Dụng Thần xác định ngũ hành ưu tiên là ${primaryUseStr} (Dụng Thần) và ${favorableStr} (Hỷ Thần); cần tiết chế tác động của ${unfavorableStr} (Kỵ Thần). Cơ cấu Khách - Chủ vận hành theo định hướng tự lập, có khả năng quản trị chuyên môn và thích ứng linh hoạt trước biến chuyển của thời vận.`;

      const masterOverview = {
        gradeBadge,
        overallScore,
        dayMaster: `${dm} ${dmZhi}`,
        dayMasterGan: dm,
        dayMasterZhi: dmZhi,
        dayMasterWx: dmWx,
        dayMasterYinYang: dmYinYang,
        dayMasterChangSheng: dmChangSheng,
        bodyStrength: body.strength,
        pattern: body.pattern,
        gejuName: geju.name,
        gejuStatus: geju.status,
        primaryUse: primaryUseStr,
        favorable: favorableStr,
        unfavorable: unfavorableStr,
        climateUse: climateUseStr,
        climateReason: gods.climate_reason || '',
        hostGuestSummary: mangPai.host_guest?.summary || 'Tương quan Khách - Chủ vận hành hài hòa',
        executiveSummary
      };

      // 2. Danh Mục Điểm Sáng & Ưu Thế Thiên Phú (brightSpots)
      const brightSpots = [];

      brightSpots.push({
        type: "cach_cuc",
        title: `Cách Cục: ${geju.name} (${geju.status})`,
        detail: `${geju.description} Lợi thế phát huy khi vận hành đúng Dụng Thần ${primaryUseStr}. ${geju.advice}`
      });

      brightSpots.push({
        type: "dung_than",
        title: `Hỷ Dụng Thần Khai Thông: Hành ${primaryUseStr} & ${favorableStr}`,
        detail: `Dụng Thần đóng vai trò trục then chốt điều hòa sinh thái ngũ hành, giúp giải tỏa áp lực và khai phóng năng lực của Nhật Chủ. Khi gặp vận hội tương sinh, hiệu quả công việc và tài chính được củng cố rõ rệt.`
      });

      if (goodShenSha.length > 0) {
        const starSummary = goodShenSha.slice(0, 4).map(s => `${s.name} (ngự trụ ${s.pillar} - chi ${s.zhi})`).join('; ');
        brightSpots.push({
          type: "quy_nhan",
          title: "Cát Tinh & Quý Nhân Chiếu Mệnh",
          detail: `Hiện diện các quý tinh: ${starSummary}. Mang lại sự nâng đỡ của quý nhân bề trên, tăng cường sự minh mẫn trong học vấn, tư duy và khả năng hóa giải nguy nan.`
        });
      }

      if (mangPai.work_mechanisms && mangPai.work_mechanisms.length > 0) {
        const primaryMech = mangPai.work_mechanisms[0];
        brightSpots.push({
          type: "to_cong",
          title: `Cơ Chế Tố Công Manh Phái: ${primaryMech.type} (${primaryMech.scope})`,
          detail: `${primaryMech.detail} — ${primaryMech.meaning}`
        });
      }

      if (decisions.wealth && decisions.wealth.treasury_analysis && !decisions.wealth.treasury_analysis[0]?.includes('không tọa')) {
        brightSpots.push({
          type: "tai_kho",
          title: "Trạng Thái Tài Khố & Tụ Tài",
          detail: decisions.wealth.treasury_analysis.join('; ')
        });
      }

      // 3. Danh Mục Điểm Cần Lưu Ý & Hóa Giải (hazardSpots)
      const hazardSpots = [];

      if (badShenSha.length > 0) {
        const badSummary = badShenSha.slice(0, 3).map(s => `${s.name} (trụ ${s.pillar} - chi ${s.zhi})`).join('; ');
        hazardSpots.push({
          type: "hung_sat",
          title: `Hung Sát Cần Tiết Chế: ${badShenSha.map(s => s.name).slice(0, 2).join(', ')}`,
          detail: `Sự hiện diện của ${badSummary} nhắc nhở đương số cần giữ sự điềm tĩnh trong giao tiếp, kiểm soát cảm xúc, cẩn trọng vấn đề pháp lý và tránh đầu tư mạo hiểm.`
        });
      }

      if (gods.unfavorable && gods.unfavorable.length > 0) {
        hazardSpots.push({
          type: "ky_than",
          title: `Cảnh Báo Kỵ Thần: Ngũ Hành ${unfavorableStr}`,
          detail: `Hành ${unfavorableStr} làm gia tăng áp lực hoặc gây mất cân đối cấu trúc ngũ hành. Trong các năm hoặc tháng có hành này vượng, cần chủ động phòng thủ và tránh mở rộng quy mô quá mức.`
        });
      }

      for (const elem in scores) {
        const val = scores[elem];
        if (val >= 42.0) {
          hazardSpots.push({
            type: "ngu_hanh_lech",
            title: `Ngũ Hành Thái Vượng: Hành ${elem} (${val} điểm)`,
            detail: `Khí thế hành ${elem} chiếm tỷ trọng quá lớn, dễ gây áp lực lên cơ quan tạng phủ tương ứng và tạo xu hướng hành vi thiên lệch. Cần ứng dụng màu sắc và phương vị để tiết chế.`
          });
          break;
        } else if (val <= 6.0) {
          hazardSpots.push({
            type: "ngu_hanh_lech",
            title: `Ngũ Hành Khuyết Hãm: Hành ${elem} (${val} điểm)`,
            detail: `Nguồn năng lượng hành ${elem} suy vi, cần được bổ khuyết thông qua môi trường sống, chế độ dinh dưỡng và lối sống lành mạnh.`
          });
          break;
        }
      }

      if (decisions.marriage && decisions.marriage.spouse_interactions && decisions.marriage.spouse_interactions.some(s => s.includes('Xuyên') || s.includes('Xung'))) {
        hazardSpots.push({
          type: "gia_dao",
          title: "Khuyết Hãm Trục Tương Tác Cung Phu Thê",
          detail: decisions.marriage.marriage_status
        });
      }

      // 4. Bản Đồ Hướng Đi Vận Trình Đời Người (lifeTrajectory)
      const deepLps = timingData.deepLuckPillars || [];
      const dv1 = deepLps[0] || {};
      const dv2 = deepLps[1] || {};

      const tienVanText = `Giai đoạn từ sơ sinh đến trước 30 tuổi (khởi vận qua các Đại Vận ${dv1.canChi || ''} [${dv1.ageRange || ''}], ${dv2.canChi || ''} [${dv2.ageRange || ''}]): Chặng đường học vấn, định hình nhân cách và tôi rèn ý chí tự lập. Chịu ảnh hưởng chính từ Trụ Năm (${chart.year_gan} ${chart.year_zhi}) và Trụ Tháng (${chart.month_gan} ${chart.month_zhi}). Đây là nền móng tích lũy tri thức và kinh nghiệm thực tiễn.`;

      let goldenLp = null;
      let defenseLp = null;
      let maxLpScore = -999;
      let minLpScore = 999;

      deepLps.forEach((lp, idx) => {
        if (idx >= 1 && idx <= 6) {
          let sc = 50;
          if (lp.summaryGrade?.includes('Đại Cát')) sc += 25;
          else if (lp.summaryGrade?.includes('Tiền Cát') || lp.summaryGrade?.includes('Hậu Cát')) sc += 12;
          else if (lp.summaryGrade?.includes('Gian Nan')) sc -= 20;

          if (lp.treasuryInfo) sc += 10;
          if (lp.pillarInteractions && lp.pillarInteractions.some(p => p.includes('XUNG') || p.includes('XUYÊN'))) sc -= 15;
          if (lp.pillarInteractions && lp.pillarInteractions.some(p => p.includes('LỤC HỢP') || p.includes('BÁN HỢP'))) sc += 10;

          if (sc > maxLpScore) {
            maxLpScore = sc;
            goldenLp = lp;
          }
          if (sc < minLpScore) {
            minLpScore = sc;
            defenseLp = lp;
          }
        }
      });

      if (!goldenLp && deepLps.length > 2) goldenLp = deepLps[2];
      if (!defenseLp && deepLps.length > 3) defenseLp = deepLps[3];

      const trungVanText = `Giai đoạn từ 30 đến 55 tuổi: Trọng tâm chuyển sang Trụ Ngày (${chart.day_gan} ${chart.day_zhi}). Đây là thời kỳ trọng tâm kiến tạo sự nghiệp, xác lập uy tín chuyên môn và xây dựng nền tảng tài chính gia đình vững chắc.`;

      const goldenDecadeText = goldenLp
        ? `Đại Vận ${goldenLp.canChi} (${goldenLp.ageRange} • Năm ${goldenLp.yearRange}): Năng lượng thiên can và địa chi tương hợp với Hỷ Dụng Thần, ${goldenLp.summaryGrade}. Đây là giai đoạn thuận lợi để tập trung phát triển công việc, mở rộng mạng lưới đối tác và tích lũy giá trị tài sản dài hạn.`
        : "Các đại vận trung niên cần kiên trì phát huy năng lực chuyên môn để gặt hái thành quả.";

      const defenseDecadeText = defenseLp && defenseLp !== goldenLp
        ? `Đại Vận ${defenseLp.canChi} (${defenseLp.ageRange} • Năm ${defenseLp.yearRange}): Khí số chịu áp lực từ Kỵ Thần hoặc tương tác xung hình, ${defenseLp.summaryGrade}. Đương số cần duy trì chiến lược phòng ngự chủ động, kiểm soát rủi ro tài chính, tránh vay mượn mạo hiểm và chú trọng gìn giữ sức khỏe gia đình.`
        : "Cần chú trọng tính kỷ luật và quản trị rủi ro trong các giai đoạn chuyển giao thời vận.";

      const dvHau = deepLps.slice(5);
      const hauVanText = `Giai đoạn sau 55 tuổi (các Đại Vận từ ${dvHau[0]?.ageRange || '55 tuổi'} trở đi): Khí số quy về Trụ Giờ (${chart.hour_gan} ${chart.hour_zhi}). Đương số bước vào giai đoạn đúc kết thành quả cuộc đời, an dưỡng tinh thần, phát huy đạo lý dưỡng tâm bồi đức và truyền thừa kinh nghiệm cho thế hệ sau.`;

      const lifeTrajectory = {
        tienVan: {
          period: "Tiền Vận (Dưới 30 Tuổi)",
          theme: "Giai Đoạn Ươm Mầm & Rèn Giũa Bản Lĩnh",
          content: tienVanText
        },
        trungVan: {
          period: "Trung Vận (30 Đến 55 Tuổi)",
          theme: "Giai Đoạn Kiến Tạo Cơ Đồ & Mở Rộng Sự Nghiệp",
          content: trungVanText,
          goldenDecade: {
            title: `Thập Niên Thuận Lợi Trọng Điểm: Đại Vận ${goldenLp?.canChi || 'Trung Niên'} (${goldenLp?.ageRange || ''})`,
            detail: goldenDecadeText
          },
          defenseDecade: {
            title: `Thập Niên Cần Phòng Thủ Cẩn Trọng: Đại Vận ${defenseLp?.canChi || 'Thử Thách'} (${defenseLp?.ageRange || ''})`,
            detail: defenseDecadeText
          }
        },
        hauVan: {
          period: "Hậu Vận (Sau 55 Tuổi)",
          theme: "Giai Đoạn An Hưởng & Truyền Thừa Phúc Đức",
          content: hauVanText
        }
      };

      // 5. Lời Khuyên Hành Động Thiết Thực Theo 5 Trụ Cột (strategicPillars)
      const strategicPillars = {
        career: {
          title: "Công Việc & Phát Triển Sự Nghiệp",
          advice: decisions.career?.career_path
            ? `${decisions.career.career_path} Ngành nghề khuyên dùng: ${(decisions.career.industry_tags || []).join(', ')}. Ưu tiên môi trường coi trọng năng lực chuyên môn, quy chế minh bạch và tính ổn định bền vững.`
            : `Phát huy năng lực chuyên môn sâu, làm việc có kế hoạch và phương pháp rõ ràng, lấy uy tín nghề nghiệp làm gốc rễ thăng tiến.`
        },
        wealth: {
          title: "Tiền Tài & Quản Trị Tài Sản Bền Vững",
          advice: decisions.wealth?.wealth_advice
            ? `${decisions.wealth.wealth_level} ${decisions.wealth.wealth_advice} Tích lũy tài sản qua các kênh an toàn, ưu tiên gia tăng giá trị nội tại thay vì chạy theo đầu cơ ngắn hạn.`
            : `Quản trị dòng tiền có kỷ luật, trích lập quỹ dự phòng và chuyển hóa thặng dư thành tài sản tích lũy thực tế.`
        },
        marriage: {
          title: "Hôn Nhân & Vun Đắp Gia Đạo",
          advice: decisions.marriage?.marriage_advice
            ? `${decisions.marriage.marriage_status} ${decisions.marriage.marriage_advice} Xây dựng hạnh phúc gia đình trên sự tôn trọng, thấu hiểu và chia sẻ trách nhiệm bình đẳng.`
            : `Tôn trọng khoảng trời riêng của bạn đời, chủ động lắng nghe và giải quyết bất đồng bằng sự chân thành, hòa ái.`
        },
        health: {
          title: "Sức Khỏe & Phòng Ngừa Thể Chất",
          advice: decisions.health?.lifestyle_preventions && decisions.health.lifestyle_preventions.length > 0
            ? `${decisions.health.lifestyle_preventions[0]} Duy trì chế độ dinh dưỡng cân bằng ngũ hành, vận động thể chất đều đặn và thăm khám sức khỏe định kỳ.`
            : `Sinh hoạt điều độ, tránh làm việc quá sức kéo dài, chú trọng giấc ngủ và dưỡng sinh ngũ tạng.`
        },
        mindfulness: {
          title: "Đạo Tu Dưỡng & Phong Thủy Cải Vận",
          advice: `Mệnh do thiên định nhưng vận do nhân tạo. Ứng dụng màu sắc và phương vị thuộc hành ${primaryUseStr} (${favorableStr}) để gia tăng sinh khí; duy trì tâm thế khiêm tốn, tích cực bồi đức hành thiện để chuyển hóa các xung sát của thời vận thành phúc lành bền lâu.`
        }
      };

      return {
        masterOverview,
        brightSpots,
        hazardSpots,
        lifeTrajectory,
        strategicPillars
      };
    }
  };

  function buildMarkdownReport(chart, quant, mangPai, shenSha, decisions, timingData, targetYear = 2026, masterAssessment = null) {
    const dm = chart.day_gan;
    const genderStr = chart.is_male ? 'Nam' : 'Nữ';
    const baziYear = chart.birth_year;
    const startAge = chart.start_age;
    const startYear = chart.start_year;

    const md = [];

    // Header chuẩn học thuật
    md.push('# BÁO CÁO LUẬN GIẢI LÁ SỐ BÁT TỰ TOÀN THƯ');
    md.push('### HỆ CHUYÊN GIA DỰ ĐOÁN XÁC ĐỊNH – TỬ BÌNH & MANH PHÁI KẾT HỢP\n');
    md.push(`**Bản Mệnh**: Nhật Chủ **${dm}** (${GAN_WU_XING[dm]}) | **Giới tính**: ${genderStr} | **Năm sinh**: ${baziYear} | **Khởi vận**: ${startAge} tuổi (Năm ${startYear})\n`);
    md.push('---\n');

    // Mục Lục Báo Cáo
    md.push('### 📑 CẤU TRÚC NỘI DUNG KHẢO LUẬN TOÀN THƯ:');
    md.push('- [I. Bảng Thiết Lập Tứ Trụ & Năng Lượng Nền Tảng](#sec-I)');
    md.push('- [II. Tổng Luận Cốt Cách & Bản Đồ Chiến Lược Vận Trình Đời Người](#sec-II)');
    md.push('- [III. Định Lượng Khí Số Ngũ Hành (QEE) & Tử Bình Cách Cục Luận](#sec-III)');
    md.push('- [IV. Phân Tích Cấu Trúc Manh Phái (Tố Công & Khách - Chủ)](#sec-IV)');
    md.push('- [V. Hệ Thống Thần Sát Kinh Điển & Khảo Luận 12 Cung Manh Phái](#sec-V)');
    md.push('- [VI. Luận Giải Chuyên Đề 6 Trụ Cột Đời Người](#sec-V)');
    md.push('- [VII. Lộ Trình Toàn Diện 10 Đại Vận Cuộc Đời (Kèm Lưu Niên Chi Tiết)](#sec-VII)');
    md.push(`- [VIII. Luận Giải Chi Tiết Niên Vận Năm ${targetYear} & 12 Lưu Nguyệt](#sec-VIII)`);
    md.push('- [IX. Các Mốc Biến Cố Trọng Đại & Lưu Niên Độc Đáo](#sec-IX)');
    md.push('- [X. Tổng Kết Triết Lý Dưỡng Mệnh & Kích Hoạt Hỷ Dụng Thần](#sec-X)');
    md.push('\n---\n');
    md.push('\n---\n');

    // PHẦN 1: BẢNG LẬP MỆNH TỨ TRỤ
    md.push('<a id="sec-I"></a>');
    md.push('## I. THIẾT LẬP TỨ TRỤ & NĂNG LƯỢNG NỀN TẢNG TIÊN THIÊN\n');
    md.push('### 🏛️ Cấu Trúc Bốn Cột Mệnh (Tứ Trụ):');

    const pillarsData = [
      { name: 'Năm', gan: chart.year_gan, zhi: chart.year_zhi, period: 'Thiếu niên (1 - 16 tuổi)', focus: 'Gốc rễ tổ tiên, phúc ấm gia đình' },
      { name: 'Tháng', gan: chart.month_gan, zhi: chart.month_zhi, period: 'Thanh xuân (17 - 32 tuổi)', focus: 'Đề cương khí tượng, sự nghiệp ban đầu, học vấn' },
      { name: 'Ngày', gan: chart.day_gan, zhi: chart.day_zhi, period: 'Trung niên (33 - 48 tuổi)', focus: 'Bản thể Nhật Chủ, cung phối ngẫu, đỉnh cao cuộc đời' },
      { name: 'Giờ', gan: chart.hour_gan, zhi: chart.hour_zhi, period: 'Hậu vận (từ 49 tuổi trở đi)', focus: 'Cửa ngõ con cái, kết quả chung cuộc, quy túc sinh mệnh' }
    ];

    pillarsData.forEach((p, idx) => {
      const canChi = `${p.gan} ${p.zhi}`;
      const deity = idx === 2 ? 'Nhật Chủ (Bản Thể)' : calculate10Deities(chart.day_gan, p.gan);
      const cs = calculateChangSheng(chart.day_gan, p.zhi);
      const hidden = (HIDDEN_GANS_RATIO[p.zhi] || []).map(h => `${h.gan} (${calculate10Deities(chart.day_gan, h.gan)})`).join(', ');
      md.push(`* **Trụ ${p.name} (${canChi}):** Thập Thần: **${deity}** | Vòng Trường Sinh: \`${cs}\` | Tàng Can: ${hidden}`);
    });
    md.push('\n');

    md.push('### Phân Tích Ý Nghĩa Bốn Cột Mệnh (Tứ Trụ Chi Tiết):');
    pillarsData.forEach((p, idx) => {
      const canChi = `${p.gan} ${p.zhi}`;
      const deity = idx === 2 ? 'Nhật Chủ (Bản Thân)' : calculate10Deities(chart.day_gan, p.gan);
      const cs = calculateChangSheng(chart.day_gan, p.zhi);
      const hiddenStems = (HIDDEN_GANS_RATIO[p.zhi] || []);
      const hiddenDesc = hiddenStems.map(h => `${h.gan} (${calculate10Deities(chart.day_gan, h.gan)}, ${Math.round(h.ratio * 100)}% khí lực)`).join('; ');

      md.push(`#### 🏛️ 1.${idx + 1}. Trụ ${p.name}: ${canChi} [${cs}]`);
      md.push(`- **Thời kỳ quản hạt**: ${p.period} • **Trọng tâm biểu hiện**: ${p.focus}.`);
      md.push(`- **Cấu trúc Thiên Can & Địa Chi**: Can ${p.gan} mang ${deity}, ngự trên Chi ${p.zhi} ở trạng thái Trường Sinh là \`${cs}\`.`);
      md.push(`- **Khí lực Tàng Can**: Nắm giữ các mầm mống ${hiddenDesc}.`);
      if (idx === 0) {
        md.push('- **Luận giải**: Trụ Năm đại diện cho cây đại thụ gia tộc. Thiên Can và Thập Thần ở Trụ Năm phản ánh nền tảng giáo dục sơ khởi, phúc ấm gia đình truyền lại. Khi bước vào đời, nền tảng đạo đức và văn hóa từ tổ tiên chính là điểm tựa ban đầu để đương số định hình nhân cách và sự tự tin.');
      } else if (idx === 1) {
        md.push('- **Luận giải**: Trụ Tháng là Đề Cương Nguyệt Lệnh, đóng vai trò then chốt nhất trong việc định hình khí hậu, mùa sinh và đo lường độ vượng suy của ngũ hành. Năng lượng tại Trụ Tháng biểu thị năng lực thích ứng với môi trường làm việc xã hội, các cơ hội hợp tác và tính cạnh tranh trong giai đoạn thanh xuân lập nghiệp.');
      } else if (idx === 2) {
        md.push('- **Luận giải**: Trụ Ngày gồm Can Ngày (Nhật Chủ) và Chi Ngày (Tọa Chi - Cung Phu Thê). Đây là hạt nhân trung tâm của toàn bộ tinh bàn Bát Tự. Tọa Chi phản ánh trực tiếp sức khỏe thể chất, tâm tư thầm kín và phẩm chất của người bạn đời đồng hành. Mối quan hệ tương sinh tương khắc tại trụ này quyết định sự viên mãn của gia đạo trung niên.');
      } else {
        md.push('- **Luận giải**: Trụ Giờ là nơi quy túc khí số của sinh mệnh, đại diện cho con cái, học trò, cấp dưới và những thành quả tích lũy sau nhiều năm cống hiến. Khí tượng Trụ Giờ trong lành, đắc sinh trợ dự báo một hậu vận thong dong, an nhàn, có người kế tục sự nghiệp vẻ vang.');
      }
      md.push('');
    });

    // Tương tác nội bộ Tứ Trụ
    md.push('### Khảo Sát Tương Tác Nội Bộ Giữa Các Cột Mệnh:');
    const zhis = [chart.year_zhi, chart.month_zhi, chart.day_zhi, chart.hour_zhi];
    const gans = [chart.year_gan, chart.month_gan, chart.day_gan, chart.hour_gan];
    const internalInteractions = [];

    // Kiểm tra Xung
    const OPPOSITE_ZHIS = { 'Tý': 'Ngọ', 'Sửu': 'Mùi', 'Dần': 'Thân', 'Mão': 'Dậu', 'Thìn': 'Tuất', 'Tỵ': 'Hợi' };
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        const z1 = zhis[i], z2 = zhis[j];
        const p1 = pillarsData[i].name, p2 = pillarsData[j].name;
        if (OPPOSITE_ZHIS[z1] === z2 || OPPOSITE_ZHIS[z2] === z1) {
          internalInteractions.push(`- **Tương Xung [${p1} - ${p2}]**: Chi ${z1} xung Chi ${z2} — Báo hiệu sự đối kháng năng lượng hoặc biến động chỗ ở, môi trường làm việc giữa hai thời kỳ.`);
        }
      }
    }

    // Kiểm tra Lục Hợp
    const SIX_COMBOS = { 'Tý': 'Sửu', 'Dần': 'Hợi', 'Mão': 'Tuất', 'Thìn': 'Dậu', 'Tỵ': 'Thân', 'Ngọ': 'Mùi' };
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        const z1 = zhis[i], z2 = zhis[j];
        const p1 = pillarsData[i].name, p2 = pillarsData[j].name;
        if (SIX_COMBOS[z1] === z2 || SIX_COMBOS[z2] === z1) {
          internalInteractions.push(`- **Lục Hợp [${p1} - ${p2}]**: Chi ${z1} hợp Chi ${z2} — Mang lại sự hòa hảo, kết nối khăng khít và tương trợ tích cực giữa các trụ.`);
        }
      }
    }

    // Kiểm tra Hợp Can
    const GAN_COMBOS = { 'Giáp': 'Kỷ', 'Ất': 'Canh', 'Bính': 'Tân', 'Đinh': 'Nhâm', 'Mậu': 'Quý' };
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        const g1 = gans[i], g2 = gans[j];
        const p1 = pillarsData[i].name, p2 = pillarsData[j].name;
        if (GAN_COMBOS[g1] === g2 || GAN_COMBOS[g2] === g1) {
          internalInteractions.push(`- **Thiên Can Hợp Hóa [${p1} - ${p2}]**: Can ${g1} hợp Can ${g2} — Thể hiện sự liên kết mật thiết về tư tưởng, mục tiêu và tình cảm.`);
        }
      }
    }

    if (internalInteractions.length > 0) {
      internalInteractions.forEach(it => md.push(it));
    } else {
      md.push('- Các cột mệnh trong Tứ Trụ ngự ở thế độc lập, trường khí phân bố ôn hòa, không xảy ra xung đột hay câu thúc quá mức.');
    }
    // PHẦN 2: TỔNG LUẬN CỐT CÁCH & BẢN ĐỒ CHIẾN LƯỢC VẬN TRÌNH ĐỜI NGƯỜI
    md.push('<a id="sec-II"></a>');
    md.push('## II. TỔNG LUẬN CỐT CÁCH & BẢN ĐỒ CHIẾN LƯỢC VẬN TRÌNH ĐỜI NGƯỜI\n');
    const ma = masterAssessment || BaziMasterSynthesizer.synthesizeMasterAssessment(chart, quant, mangPai, shenSha, decisions, timingData, targetYear);
    const mo = ma.masterOverview;

    md.push('### 1. Khảo Luận Cốt Cách Tổng Thể & Trực Giác Mệnh Cục:');
    md.push(`- **Phẩm cách lá số**: **${mo.gradeBadge}** (Điểm định lượng cốt cách: **${mo.overallScore}/100**).`);
    md.push(`- **Nhật Chủ & Tọa Chi**: **${chart.day_gan} ${chart.day_zhi}** (${mo.dayMasterYinYang} ${mo.dayMasterWx} tọa Chi ${chart.day_zhi} - Vị thế Trường Sinh: *${mo.dayMasterChangSheng}*).`);
    md.push(`- **Thế Cục & Cách Cục**: **${mo.bodyStrength}** (${mo.pattern}) • **${mo.gejuName}** (${mo.gejuStatus}).`);
    md.push(`- **Hệ Thống Hỷ Dụng Thần**: Dụng Thần: \`${mo.primaryUse}\` | Hỷ Thần: \`${mo.favorable}\` | Kỵ Thần: \`${mo.unfavorable}\`${mo.climateUse ? ` | Điều Hầu: \`${mo.climateUse}\`` : ''}.`);
    md.push(`- **Định vị Khách - Chủ**: ${mo.hostGuestSummary}.`);
    md.push(`- **Nhận định cốt cách tổng quát**: ${mo.executiveSummary}\n`);

    md.push('### 2. Danh Mục Điểm Sáng & Ưu Thế Thiên Phú (Thế Mạnh Cốt Lõi):');
    (ma.brightSpots || []).forEach(b => {
      md.push(`- **✨ ${b.title}**: ${b.detail}`);
    });
    md.push('\n');

    md.push('### 3. Danh Mục Điểm Cần Lưu Ý & Phương Pháp Hóa Giải (Thử Thách Vận Trình):');
    if ((ma.hazardSpots || []).length > 0) {
      ma.hazardSpots.forEach(h => {
        md.push(`- **⚠️ ${h.title}**: ${h.detail}`);
      });
    } else {
      md.push('- Lá số ngũ hành phân bố cân hòa, các cung vị không bị xung hại hoặc hung sát áp chế trực diện.');
    }
    md.push('\n');

    md.push('### 4. Bản Đồ Hướng Đi Vận Trình Đời Người (3 Chặng Cuộc Đời):');
    const traj = ma.lifeTrajectory;
    md.push(`#### 4.1. ${traj.tienVan.period}: ${traj.tienVan.theme}`);
    md.push(`- ${traj.tienVan.content}\n`);

    md.push(`#### 4.2. ${traj.trungVan.period}: ${traj.trungVan.theme}`);
    md.push(`- ${traj.trungVan.content}`);
    if (traj.trungVan.goldenDecade) {
      md.push(`- **🌟 ${traj.trungVan.goldenDecade.title}**: ${traj.trungVan.goldenDecade.detail}`);
    }
    if (traj.trungVan.defenseDecade) {
      md.push(`- **🛡️ ${traj.trungVan.defenseDecade.title}**: ${traj.trungVan.defenseDecade.detail}`);
    }
    md.push('\n');

    md.push(`#### 4.3. ${traj.hauVan.period}: ${traj.hauVan.theme}`);
    md.push(`- ${traj.hauVan.content}\n`);

    md.push('### 5. Lời Khuyên Hành Động Thiết Thực Theo 5 Trụ Cột Chiến Lược:');
    const sp = ma.strategicPillars;
    md.push(`- **💼 ${sp.career.title}**: ${sp.career.advice}`);
    md.push(`- **💰 ${sp.wealth.title}**: ${sp.wealth.advice}`);
    md.push(`- **🏡 ${sp.marriage.title}**: ${sp.marriage.advice}`);
    md.push(`- **🌿 ${sp.health.title}**: ${sp.health.advice}`);
    md.push(`- **🕊️ ${sp.mindfulness.title}**: ${sp.mindfulness.advice}`);
    md.push('\n---\n');

    // PHẦN 3: ĐỊNH LƯỢNG KHÍ SỐ NGŨ HÀNH & CÁCH CỤC
    md.push('<a id="sec-III"></a>');
    md.push('## III. ĐỊNH LƯỢNG KHÍ SỐ NGŨ HÀNH (THUẬT TOÁN QEE - 100 ĐIỂM) & CÁCH CỤC TỬ BÌNH\n');
    const scores = quant.element_scores;
    const body = quant.body_strength;
    const gods = quant.gods_selection;

    const scoreLine = Object.keys(scores).map(k => `**${k}**: ${scores[k]}đ`).join(' | ');
    md.push(`- **Phân bố năng lượng ngũ hành tuyệt đối**: ${scoreLine}`);
    md.push(`- **Thế Cục Vượng Suy Toàn Cục**: **${body.strength}** (${body.pattern})`);
    md.push(`  + *Lực Bản Nguyên (Hành cùng loại Tỉ Kiếp + Hành sinh ta Chính Ấn/Thiên Ấn)*: **${body.support_score} điểm**`);
    md.push(`  + *Lực Dị Nguyên (Hành ta sinh Thực Thần/Thương Quan + Hành ta khắc Tài Tinh + Hành khắc ta Quan Sát)*: **${body.drain_score} điểm**`);
    md.push(`  + *Chi tiết thế cục*: ${body.detail}\n`);

    md.push('### ⚖️ Đối Soát Trọng Số Ngũ Hành & Vai Trò Hỷ - Dụng Thần:');
    for (const elem in scores) {
      const val = scores[elem];
      let statusStr = '';
      if (val >= 40.0) statusStr = 'Thái Vượng (Khí thế áp đảo, cần tiết chế)';
      else if (val >= 25.0) statusStr = 'Cường Thịnh (Dồi dào, phát huy tốt)';
      else if (val >= 12.0) statusStr = 'Trung Hòa (Cân bằng vừa phải)';
      else if (val >= 5.0) statusStr = 'Suy Nhược (Yếu ớt, cần phù trợ)';
      else statusStr = 'Cực Khuyết (Khí lực tàng ẩn, thiếu hụt)';

      let roleStr = '';
      if (gods.primary_use.includes(elem)) roleStr = '⭐ DỤNG THẦN (Cứu cánh sinh mệnh)';
      else if (gods.favorable.includes(elem)) roleStr = '✨ HỶ THẦN (Trợ lực cát lành)';
      else if (gods.unfavorable.includes(elem)) roleStr = '⚠️ KỴ THẦN (Gây áp lực, hao tán)';
      else if (gods.climate_use === elem) roleStr = '🌡️ ĐIỀU HẦU DỤNG THẦN';
      else roleStr = 'Nhàn Thần (Bình hòa)';

      md.push(`* **Hành ${elem}:** **${val} điểm** (${val}%) — *${statusStr}* ➔ **${roleStr}**`);
    }
    md.push('\n');

    // Khảo Luận Cách Cục Tử Bình
    const geju = evaluateGeJu(chart, quant);
    md.push('### Khảo Luận Tử Bình Cách Cục (Đề Cương Nguyệt Lệnh):');
    md.push(`- **Tên Cách Cục**: **${geju.name}** (${geju.type})`);
    md.push(`- **Trạng thái định cách**: \`${geju.status}\``);
    md.push(`- **Bản chất khí số**: ${geju.description}`);
    md.push(`- **Phối hợp Tướng Thần & Hỷ Khí**: Ưu tiên ngũ hành \`${geju.favorableGods}\` để nâng đỡ cách cục.`);
    md.push(`- **Chiến lược tối ưu hóa**: ${geju.advice}\n`);

    md.push('### Chiến Lược Sử Dụng Hỷ - Dụng - Kỵ Thần:');
    md.push(`- **Dụng Thần (Then chốt khai thông)**: \`${gods.primary_use.length ? gods.primary_use.join(', ') : 'Tùy vận thế'}\` — Là ngũ hành quan trọng nhất, đóng vai trò giải quyết mâu thuẫn cốt lõi của lá số, giúp bản mệnh khai thông dòng chảy tài lộc và phát huy tối đa tiềm năng.`);
    md.push(`- **Hỷ Thần (Trợ lực đồng hành)**: \`${gods.favorable.join(', ')}\` — Là ngũ hành sinh trợ hoặc bảo vệ cho Dụng Thần, mang lại các cơ hội may mắn, quý nhân nâng đỡ và gia tăng sức chịu đựng trước biến động.`);
    md.push(`- **Kỵ Thần (Áp lực cần hóa giải)**: \`${gods.unfavorable.join(', ')}\` — Là ngũ hành gây tổn hại cho Dụng Thần hoặc làm thiên lệch thái quá cấu trúc năng lượng, chủ về thị phi, hao tài, trở ngại công việc.`);
    if (gods.climate_use) {
      md.push(`- **Điều Hầu Dụng Thần (Cân bằng sinh thái mùa sinh)**: \`${gods.climate_use}\` — *${gods.climate_reason}*`);
    }
    md.push('\n---\n');

    // PHẦN 4: CẤU TRÚC MANH PHÁI
    md.push('<a id="sec-IV"></a>');
    md.push('## IV. PHÂN TÍCH CẤU TRÚC MANH PHÁI (TỐ CÔNG & KHÁCH - CHỦ)\n');
    const hg = mangPai.host_guest;
    const party = mangPai.yin_yang_party;
    const works = mangPai.work_mechanisms;

    md.push('### 1. Phân Định Khách - Chủ (Tân - Chủ) Trong Mệnh Cục');
    md.push(`- **Tổng quan vị trí**: ${hg.summary}`);
    md.push('- **Cung Chủ (Nội gia: Trụ Ngày & Giờ)**: Đại diện cho tự thân năng lực, tài sản tích lũy riêng, gia đình nhỏ và thuộc hạ trung thành.');
    md.push('- **Cung Khách (Ngoại giới: Trụ Năm & Tháng)**: Đại diện cho xã hội, thương trường, cấp trên, đối tác và nguồn tài nguyên công chúng.');
    md.push(`- **Tài Tinh tại Chủ/Khách**: Chủ có [${hg.wealth_host.join(', ') || 'Ẩn tàng'}] | Khách có [${hg.wealth_guest.join(', ') || 'Ẩn tàng'}].`);
    md.push(`- **Quan Sát tại Chủ/Khách**: Chủ có [${hg.officer_host.join(', ') || 'Ẩn tàng'}] | Khách có [${hg.officer_guest.join(', ') || 'Ẩn tàng'}].\n`);

    md.push('### 2. Đãng Thế Âm Dương & Thế Trận Lực Lượng');
    md.push(`- **Trạng thái phân bố**: ${party.dominant} (Gồm ${party.yang_count} chữ Dương và ${party.yin_count} chữ Âm trong Tứ Trụ).`);
    if (party.is_anti_climax) {
      md.push(`  > ⚠️ **Lưu ý Hiện Tượng Phản Cục**: ${party.anti_detail}`);
    } else {
      md.push('- **Nhận xét**: Khí thế Âm Dương cân bằng hài hòa, các luồng năng lượng nóng - lạnh, nhu - cương tương tác tuần hoàn, giúp mệnh chủ ứng biến linh hoạt trước cả cơ hội lẫn thử thách.');
    }
    md.push('\n### 3. Các Cơ Chế Tố Công Phát Hiện Trong Tứ Trụ:');
    if (works.length > 0) {
      works.forEach((w, wIdx) => {
        md.push(`- **Cơ chế ${wIdx + 1} [${w.type}]** (${w.scope}): \`${w.detail}\``);
        md.push(`  + *Bản chất tác động*: ${w.meaning}`);
      });
    } else {
      md.push('- Cục diện thanh thuần, tĩnh tại, các can chi hòa khí tương sinh, không thiết lập thế xung sát công phá bạo liệt.');
    }
    md.push('\n---\n');

    // PHẦN 5: HỆ THỐNG THẦN SÁT KINH ĐIỂN & 12 CUNG MANH PHÁI
    md.push('<a id="sec-V"></a>');
    md.push('## V. HỆ THỐNG THẦN SÁT KINH ĐIỂN & 12 CUNG MANH PHÁI\n');
    md.push('### 1. Bảng Thần Sát Chiếu Mệnh Từ Tam Mệnh Thông Hội:');
    if (shenSha.length > 0) {
      shenSha.forEach(s => {
        md.push(`- **⭐ ${s.name}** (Ngự tại Trụ ${s.pillar} - Chi ${s.zhi}): \`${s.type}\``);
        md.push(`  + *Ý nghĩa*: ${s.meaning}`);
      });
    } else {
      md.push('- Các tinh bàn cát hung vận hành ở thế bình hòa, không bị hung sát nặng nề công phá.');
    }
    md.push('\n');

    // 12 Cung & 12 Thần Manh Phái
    const MANG_PAI_PALACES_LIST = [
      'Mệnh Cung', 'Huynh Đệ', 'Phu Thê', 'Tử Tức', 'Tài Bạch', 'Tật Ách',
      'Thiên Di', 'Nô Bộc', 'Quan Lộc', 'Điền Trạch', 'Phúc Đức', 'Phụ Mẫu'
    ];
    const MANG_PAI_SPIRITS_LIST = [
      'Thái Tuế', 'Thái Dương', 'Tang Môn', 'Thái Âm', 'Quan Phù', 'Tử Phù',
      'Tuế Phá', 'Long Đức', 'Bạch Hổ', 'Phúc Đức', 'Điếu Khách', 'Bệnh Phù'
    ];

    const monthZhiIdx = DI_ZHI.indexOf(chart.month_zhi);
    const hourZhiIdx = DI_ZHI.indexOf(chart.hour_zhi);
    const mengGongZhiIdx = ((26 - (monthZhiIdx + 1) - (hourZhiIdx + 1)) % 12 + 12) % 12;
    const mengGongZhi = DI_ZHI[mengGongZhiIdx];

    const dir = chart.is_male ? 1 : -1;
    const palaces12 = MANG_PAI_PALACES_LIST.map((cung, i) => ({
      cung,
      zhi: DI_ZHI[((mengGongZhiIdx + i * dir) % 12 + 12) % 12],
      spirit: MANG_PAI_SPIRITS_LIST[i] || ''
    }));

    md.push('### 2. Hệ Thống 12 Cung & 12 Thần Manh Phái (Tổng Hợp):');
    md.push(`- **Mệnh Cung An Tại**: Chi **${mengGongZhi}** (${ZHI_WU_XING[mengGongZhi]}) — Khởi đầu trục tọa độ vận hành nội tại của sinh mệnh.\n`);

    const palaceMeanings = {
      'Mệnh Cung': 'Cốt cách, bản lĩnh, ý chí tự thân và trục xoay số mệnh',
      'Huynh Đệ': 'Tình nghĩa anh chị em, bạn hữu thâm giao, sự sẻ chia nâng đỡ',
      'Phu Thê': 'Duyên nợ trăm năm, hòa khí gia đạo, tính cách bạn đời',
      'Tử Tức': 'Đường con cái, thế hệ kế thừa, năng lực truyền thụ',
      'Tài Bạch': 'Dòng tiền lưu chuyển, phương thức kiếm tiền và tụ tài',
      'Tật Ách': 'Sức đề kháng, những ẩn họa tạng phủ cần lưu tâm phòng ngừa',
      'Thiên Di': 'Không gian xã hội, ngoại giao, xuất hành, cơ duyên phương xa',
      'Nô Bộc': 'Đồng nghiệp, cấp dưới, mạng lưới nhân sự và sự trung thành',
      'Quan Lộc': 'Vị thế xã hội, công danh chức quyền, môi trường phát triển',
      'Điền Trạch': 'Đất đai, nhà cửa, cơ sở vật chất, khả năng tích lũy trạch viện',
      'Phúc Đức': 'Đời sống tinh thần, phước đức tổ tiên, sự an lạc nội tâm',
      'Phụ Mẫu': 'Ân nghĩa sinh thành, sự dạy dỗ và phúc ấm của đấng song thân'
    };

    palaces12.forEach((p, idx) => {
      const pWx = ZHI_WU_XING[p.zhi];
      const meaning = palaceMeanings[p.cung] || 'Cung chức năng vận hành';
      md.push(`* **Cung ${p.cung} (Chi ${p.zhi} • Hành ${pWx}):** Thần Sát: \`${p.spirit}\` — ${meaning}`);
    });
    md.push('\n');

    // Khảo luận chuyên sâu chi tiết từng Cung trong 12 Cung Manh Phái
    md.push('### 3. Khảo Luận Chuyên Sâu Chi Tiết Thập Nhị Cung Manh Phái:');
    const spiritDetailedDescriptions = {
      'Thái Tuế': 'Chủ về sự tôn nghiêm, quyền uy lãnh đạo, tự chủ cao độ nhưng cũng dễ cô độc nếu quá cứng nhắc.',
      'Thái Dương': 'Chủ về sự quang minh chính đại, quý nhân nam giới nâng đỡ, danh tiếng lan tỏa rực rỡ.',
      'Tang Môn': 'Chủ về sự ưu tư, trăn trở nội tâm, cẩn trọng chuyện buồn thương hoặc hao tốn tình cảm.',
      'Thái Âm': 'Chủ về sự dịu dàng, phúc đức âm phù, quý nhân nữ giới và sự tích lũy của cải kín đáo.',
      'Quan Phù': 'Chủ về văn chương giấy tờ, quy chế pháp luật, cần chú ý tính minh bạch để tránh thị phi kiện tụng.',
      'Tử Phù': 'Chủ về sự tĩnh lặng, biến động ngầm, cần cẩn trọng bảo vệ sức khỏe và các mối quan hệ thân tín.',
      'Tuế Phá': 'Chủ về sự xung đột, đổi mới, phá vỡ thế cân bằng cũ để tái lập trật tự mới; cẩn thận hao tán.',
      'Long Đức': 'Chủ về phúc lộc từ thiện tâm, hóa hung thành cát, nhận được sự cảm thông và trợ lực bất ngờ.',
      'Bạch Hổ': 'Chủ về tính quyết đoán, quyền biến thép, nhưng cũng cảnh báo nguy cơ va chạm, trầy xước, phẫu thuật.',
      'Phúc Đức': 'Chủ về phúc ấm tổ tiên, sự an nhàn thanh thản, gặp dữ hóa lành, gia tăng tuổi thọ và trí tuệ.',
      'Điếu Khách': 'Chủ về sự chia sẻ, động lòng trắc ẩn trước nỗi đau tha nhân, tránh can thiệp sâu việc bao đồng.',
      'Bệnh Phù': 'Chủ về hệ miễn dịch suy giảm cục bộ, nhắc nhở kỷ luật nghỉ ngơi điều độ để phục hồi năng lượng.'
    };

    palaces12.forEach((p, idx) => {
      const pWx = ZHI_WU_XING[p.zhi];
      const spDesc = spiritDetailedDescriptions[p.spirit] || 'Vận hành khí số theo quy luật luân chuyển tự nhiên.';
      md.push(`#### 🏛️ 5.2.${idx + 1}. Cung ${p.cung} (Tọa tại Chi ${p.zhi} - Ngũ Hành: ${pWx})`);
      md.push(`- **Thần Sát Trấn Ngự**: \`${p.spirit}\` — ${spDesc}`);
      md.push(`- **Mối tương quan với Bản Thể Nhật Chủ (${dm} ${GAN_WU_XING[dm]})**: Ngũ hành Cung là ${pWx}, đóng vai trò quan trọng trong việc cân bằng hoặc kích hoạt lực lượng của bản mệnh.`);
      md.push(`- **Luận đoán chuyên biệt**: Cung ${p.cung} phản ánh trọn vẹn ${palaceMeanings[p.cung]}. Khi tọa tại ${p.zhi}, trường năng lượng này đòi hỏi đương số phải chủ động phát huy điểm mạnh của \`${p.spirit}\`, đồng thời kiểm soát các yếu tố tiêu cực để giữ gìn sự hanh thông bền vững.`);
      md.push('');
    });
    md.push('---\n');

    // PHẦN 6: LUẬN GIẢI CHUYÊN ĐỀ 6 TRỤ CỘT ĐỜI NGƯỜI
    md.push('<a id="sec-VI"></a>');
    md.push('## VI. LUẬN GIẢI CHUYÊN ĐỀ TỪ CÂY QUYẾT ĐỊNH XÁC ĐỊNH\n');

    // 1. Bản tính
    const p = decisions.personality;
    md.push('### 1. Bản Tính, Khí Chất & Tiềm Năng Bản Mệnh');
    md.push(`- **Cốt cách Nhật Chủ**: ${p.day_master_nature}`);
    p.deity_influences.forEach(d => md.push(`- ${d}`));
    p.star_notes.forEach(s => md.push(`- ${s}`));
    md.push(`- **Nội lực thể trạng**: ${p.body_state}`);
    md.push('- **Lời khuyên tu dưỡng**: Giữ tâm thái vững vàng, bồi dưỡng sự kiên nhẫn, tránh nóng vội khi gặp trắc trở; lấy sự chính trực làm gốc rễ phát triển.\n');

    // 2. Sự nghiệp
    const cr = decisions.career;
    md.push('### 2. Sự Nghiệp, Công Danh & Ngành Nghề Thích Hợp');
    md.push(`- **Định hướng chủ đạo**: ${cr.career_path}`);
    md.push(`- **Lĩnh vực phù hợp nhất**: \`${cr.industry_tags.join(', ')}\``);
    md.push(`- **Hiệu suất Tố Công**: ${cr.work_efficiency}`);
    md.push('- **Môi trường làm việc tối ưu**: Ưu tiên các môi trường coi trọng năng lực chuyên môn, quy chế minh bạch, có cơ hội thăng tiến định lượng dựa trên đóng góp thực tế.\n');

    // 3. Tài vận
    const w = decisions.wealth;
    md.push('### 3. Tài Vận, Khả Năng Tích Lũy & Mộ Khố');
    md.push(`- **Cục diện tài lộc**: ${w.wealth_level}`);
    md.push(`- **Nguồn gốc tài sản**: ${w.host_guest_wealth}`);
    md.push(`- **Trạng thái Tài Khố (Kho tiền)**: ${w.treasury_analysis.join('; ')}`);
    md.push(`- **Lời khuyên quản trị tài chính**: *${w.wealth_advice}*`);
    md.push('- **Chiến lược đầu tư**: Phân bổ dòng vốn theo nguyên tắc giá trị, tránh đầu cơ lướt sóng ngắn hạn; ưu tiên các tài sản gia tăng giá trị theo thời gian.\n');

    // 4. Hôn nhân
    const m = decisions.marriage;
    md.push('### 4. Hôn Nhân, Tình Duyên & Cung Phu Thê');
    md.push(`- **Tình trạng Cung Phu Thê (Chi ${m.palace_zhi})**: ${m.marriage_status}`);
    m.spouse_interactions.forEach(inter => md.push(`  + ${inter}`));
    md.push(`- **Phương châm gìn giữ hòa khí**: *${m.marriage_advice}*`);
    md.push('- **Tâm lý học gia đình**: Sự lắng nghe và thấu cảm là chìa khóa then chốt giúp hóa giải mọi mâu thuẫn; cùng nhau vun vén tài chính sẽ tạo nên chỗ dựa vững chắc cho con cái.\n');

    // 5. Sức khỏe
    const h = decisions.health;
    md.push('### 5. Sức Khỏe & Chăm Sóc Tạng Phủ Ngũ Hành');
    h.health_warnings.forEach(warn => md.push(`- **Cảnh báo tạng phủ**: ${warn}`));
    h.lifestyle_preventions.forEach(prev => md.push(`- **Biện pháp dưỡng sinh**: ${prev}`));
    md.push('- **Kỷ luật sinh hoạt**: Chú trọng giấc ngủ sâu trước 23h, duy trì vận động thể chất đều đặn mỗi ngày để điều hòa kinh lạc và đào thải độc tố.\n');

    // 6. Dự báo Lưu Niên
    const tm = decisions.timing;
    md.push(`### 6. Dự Báo Niên Vận & Lưu Niên Năm ${tm.target_year} (${tm.year_can_chi})`);
    md.push(`- **Đại Vận Đương Thời**: \`${tm.active_luck_pillar}\``);
    md.push(`- **Thập Thần Lưu Niên**: \`${tm.year_deity}\``);
    md.push(`- **Đánh giá Khí Vận**: **${tm.forecast_grade}**`);
    md.push(`- **Phân tích chi tiết**: ${tm.forecast_desc}`);
    md.push('- **Tương tác Can Chi năm này với Tứ Trụ**:');
    tm.year_interactions.forEach(yi => md.push(`  + ${yi}`));
    md.push('- **Phương châm hành động trong năm**: Chủ động nắm bắt cơ hội liên quan đến Hỷ Dụng Thần, giữ gìn tài sản cẩn trọng ở những tháng xung khắc, tăng cường kết nối đối tác uy tín.\n---\n');

    // PHẦN 7: LỘ TRÌNH 8-10 ĐẠI VẬN CUỘC ĐỜI & LƯU NIÊN CHI TIẾT
    md.push('<a id="sec-VII"></a>');
    md.push('## VII. LỘ TRÌNH 10 ĐẠI VẬN CUỘC ĐỜI (TOÀN DIỆN 100 NĂM KHÍ SỐ)\n');
    md.push('Khảo sát chi tiết 10 bước chuyển dịch đại vận và diễn biến từng năm:\n');

    const deepLps = timingData.deepLuckPillars || [];
    deepLps.forEach(lp => {
      md.push(`### ⏳ Đại Vận ${lp.step} (${lp.ageRange} • Năm ${lp.yearRange}): ${lp.canChi}`);
      md.push(`* **Thập Thần & Vị Thế:** Thập Thần: **${lp.deity}** | Vòng Trường Sinh: \`${lp.changSheng}\` | Đánh giá: **${lp.summaryGrade}**`);
      md.push(`* **5 Năm Đầu (Can Quản):** ${lp.first5Years}`);
      md.push(`* **5 Năm Sau (Chi Quản):** ${lp.last5Years}`);
      if (lp.pillarInteractions.length > 0) {
        md.push('* **Tương tác Tứ Trụ:** ' + lp.pillarInteractions.join('; '));
      }
      if (lp.treasuryInfo) {
        md.push(`* **Mộ Khố Kích Hoạt:** \`${lp.treasuryInfo.name}\` (${lp.treasuryInfo.role}) — Trạng thái: ${lp.treasuryInfo.status}`);
      }

      // 10 Lưu Niên của Đại Vận này
      const yStart = parseInt(lp.yearRange.split(' - ')[0], 10);
      if (!isNaN(yStart)) {
        md.push('\n*Diễn biến 10 Lưu Niên trong Đại Vận:*');
        for (let yOffset = 0; yOffset < 10; yOffset++) {
          const curYear = yStart + yOffset;
          const curAge = curYear - baziYear;
          const curAgeLunar = curAge + 1;
          const yG = TIAN_GAN[((curYear - 4) % 10 + 10) % 10];
          const yZ = DI_ZHI[((curYear - 4) % 12 + 12) % 12];
          const cChi = `${yG} ${yZ}`;
          const dty = calculate10Deities(dm, yG);

          let note = 'Bình hòa phát triển';
          if (yZ === chart.day_zhi) note = 'Động chạm Cung Phu Thê (Chi Ngày)';
          else if (yZ === chart.month_zhi) note = 'Động chạm Đề Cương Nguyệt Lệnh';
          else if (yZ === chart.year_zhi) note = 'Thái Tuế tương trùng Trụ Năm';
          else if (gods.primary_use.includes(GAN_WU_XING[yG]) || gods.primary_use.includes(ZHI_WU_XING[yZ])) note = '✨ Vận Hỷ Dụng Thần trợ lực';
          else if (gods.unfavorable.includes(GAN_WU_XING[yG]) && gods.unfavorable.includes(ZHI_WU_XING[yZ])) note = '⚠️ Vận Kỵ Thần, cẩn trọng hao tổn';

          md.push(`- **Năm ${curYear} (${cChi} • ${curAge}t / ${curAgeLunar}t ÂL):** Thập Thần: ${dty} • *${note}*`);
        }
      }
      md.push('\n');
    });
    md.push('---\n');

    // PHẦN 8: LUẬN GIẢI CHI TIẾT NIÊN VẬN & 12 LƯU NGUYỆT
    md.push('<a id="sec-VIII"></a>');
    md.push(`## VIII. LUẬN GIẢI CHI TIẾT NIÊN VẬN NĂM ${targetYear} & 12 LƯU NGUYỆT\n`);
    const monthsData = calculate12Months(targetYear, dm);

    md.push(`### 1. Tổng Quan Khí Vận Năm ${targetYear} (${tm.year_can_chi}):`);
    md.push(`- **Thập Thần Chiếu Mệnh**: \`${tm.year_deity}\` | **Khí Vận Toàn Niên**: **${tm.forecast_grade}**.`);
    md.push(`- **Phân tích bối cảnh**: ${tm.forecast_desc}`);
    md.push('- **Tương tác năm với Tứ Trụ**: ' + (tm.year_interactions.join('; ') || 'Khí trường điều hòa ổn định.'));
    md.push('\n');

    md.push(`### 2. Diễn Biến Khí Số Chi Tiết 12 Lưu Nguyệt Năm ${targetYear} (Ngũ Hổ Độn):`);
    monthsData.forEach(m => {
      const isGood = gods.primary_use.includes(m.wx) || gods.favorable.includes(m.wx);
      const isBad = gods.unfavorable.includes(m.wx);
      const evalGrade = isGood ? '✨ Cát Lành' : (isBad ? '⚠️ Thận Trọng' : 'Bình Hòa');
      const mDeity = m.deity;

      md.push(`#### 🗓️ Tháng ${m.monthNumber} (${m.canChi} • ${m.solarTerm}): ${evalGrade}`);
      md.push(`* **Khí Số:** Thập Thần: \`${mDeity}\` • Hành Khí Chi: ${m.wx}`);
      if (isGood) {
        md.push('* **Đặc trưng trường khí:** Đắc sinh khí của Hỷ Dụng Thần, tinh thần minh mẫn, công việc có nhiều thuận lợi, cơ hội tài lộc gia tăng.');
      } else if (isBad) {
        md.push('* **Đặc trưng trường khí:** Chịu áp lực từ Kỵ Thần, dễ có hao tổn nhỏ hoặc tiến độ bị chậm lại, cần giữ tâm thế thận trọng và bình tĩnh.');
      } else {
        md.push('* **Đặc trưng trường khí:** Trường khí ổn định, thích hợp cho việc duy trì nhịp độ làm việc đều đặn, củng cố các nền tảng sẵn có.');
      }

      let monthAdvice = '';
      if (['Chính Tài', 'Thiên Tài'].includes(mDeity)) {
        monthAdvice = 'Tài lộc có cơ hội hanh thông, thích hợp thu hồi các khoản nợ hoặc xem xét đầu tư có tính toán; tránh cho vay mượn rủi ro.';
      } else if (['Chính Quan', 'Thất Sát'].includes(mDeity)) {
        monthAdvice = 'Trọng tâm xoay quanh công danh, quan hệ cấp trên hoặc hợp đồng pháp lý; cần làm việc chỉn chu, đúng quy chuẩn quy chế.';
      } else if (['Chính Ấn', 'Thiên Ấn'].includes(mDeity)) {
        monthAdvice = 'Thời điểm thuận lợi cho việc học tập, nâng cao nghiệp vụ, nghiên cứu, hoạch định chiến lược và chăm sóc sức khỏe gia đình.';
      } else if (['Thực Thần', 'Thương Quan'].includes(mDeity)) {
        monthAdvice = 'Năng lực sáng tạo và giao tiếp xã hội phát huy tốt; chú ý lời ăn tiếng nói nơi công sở để giữ gìn hòa khí đồng nghiệp.';
      } else {
        monthAdvice = 'Tương tác với bạn bè, đồng sự gia tăng; cần chú ý phân định rõ ràng quyền lợi tài chính để tránh hiểu lầm không đáng có.';
      }
      md.push(`* **Lời khuyên ứng biến:** ${monthAdvice}\n`);
    });
    md.push('---\n');

    // PHẦN 9: CÁC MỐC SỰ KIỆN TRỌNG ĐẠI TRONG ĐỜI (MILESTONES)
    md.push('<a id="sec-IX"></a>');
    md.push('## IX. CÁC MỐC BIẾN CỐ TRỌNG ĐẠI & LƯU NIÊN ĐỘC ĐÁO\n');
    const milestoneYears = [2000, 2007, 2013, 2019, 2021, 2023, 2025, 2026, 2028, 2030, 2032, 2035];
    let milestoneCount = 0;

    milestoneYears.forEach(y => {
      if (y >= chart.birth_year) {
        const annualEvts = detectAnnualMilestones(chart, quant, mangPai, y);
        if (annualEvts.length > 0) {
          milestoneCount++;
          md.push(`### 🎯 Mốc Thời Gian Năm ${y} (${y - chart.birth_year} tuổi):`);
          annualEvts.forEach(e => {
            md.push(`- **${e.badge}** (*Phân loại: ${e.category}*):`);
            md.push(`  + ${e.description}`);
            if (e.triggers && e.triggers.length > 0) {
              md.push(`  + *Cơ sở tương tác thiên văn & can chi*: ${e.triggers.join('; ')}`);
            }
          });
          md.push('');
        }
      }
    });

    if (milestoneCount === 0) {
      md.push('- Vận trình cuộc đời tương đối êm đềm, không gặp phải các xung đột hay biến cố mang tính đảo lộn dữ dội.\n');
    }

    // PHẦN 10: TỔNG KẾT TRIẾT LÝ DƯỠNG MỆNH
    md.push('<a id="sec-X"></a>');
    md.push('---\n## X. TỔNG KẾT TRIẾT LÝ DƯỠNG MỆNH & PHƯƠNG PHÁP ỨNG DỤNG\n');
    md.push('> *\"Mệnh do thiên định, Vận do nhân tạo, Hạnh do tự cầu.\"* Bát tự là bản đồ địa hình năng lượng bẩm sinh; sự tu dưỡng đạo đức, kỷ luật làm việc và lựa chọn môi trường sống phù hợp với Hỷ Dụng Thần sẽ giúp tối ưu hóa tiềm năng và chuyển nguy thành an.\n');

    md.push('### Hướng Dẫn Kích Hoạt Hỷ Dụng Thần Toàn Diện:');
    const useList = Array.from(new Set([...gods.primary_use, ...gods.favorable]));

    const adviceMap = {
      'Hỏa': '- **Phương vị cát lợi**: Ưu tiên phương Nam, đón ánh nắng bình minh.\n- **Màu sắc trang phục & nội thất**: Đỏ, tím, hồng, cam, cánh sen.\n- **Vật phẩm trợ mệnh**: Đèn chiếu sáng ấm áp, tranh phong cảnh mặt trời mọc, đá thạch anh tím, ruby.\n- **Ngành nghề & Lĩnh vực**: Công nghệ thông tin, trí tuệ nhân tạo, truyền thông, marketing, năng lượng, điện tử, ẩm thực nung nấu.\n- **Thói quen dưỡng sinh**: Dậy sớm tập thể dục, tiếp xúc ánh sáng tự nhiên, giữ tinh thần lạc quan nhiệt huyết.',
      'Thủy': '- **Phương vị cát lợi**: Ưu tiên phương Bắc, nơi gần nguồn nước trong lành.\n- **Màu sắc trang phục & nội thất**: Đen, xanh nước biển, xanh lam thẫm, xám than.\n- **Vật phẩm trợ mệnh**: Bể cá thủy sinh, thác nước phong thủy, đá sapphire xanh, thạch anh đen.\n- **Ngành nghề & Lĩnh vực**: Logistics vận tải, hàng hải, xuất nhập khẩu, thương mại điện tử, du lịch lữ hành, đồ uống giải khát.\n- **Thói quen dưỡng sinh**: Uống đủ nước ấm, tập bơi lội hoặc đi bộ ven hồ nước, giữ sự linh hoạt uyển chuyển trong giao tiếp.',
      'Mộc': '- **Phương vị cát lợi**: Ưu tiên phương Đông và Đông Nam.\n- **Màu sắc trang phục & nội thất**: Xanh lá cây, xanh ngọc, xanh rêu, họa tiết hoa lá.\n- **Vật phẩm trợ mệnh**: Cây xanh phong thủy (Kim tiền, Vạn lộc, Trầu bà), đồ gỗ mỹ nghệ tự nhiên, đá ngọc bích jade.\n- **Ngành nghề & Lĩnh vực**: Giáo dục đào tạo, xuất bản, kiến trúc cảnh quan, y dược thảo mộc, nông nghiệp công nghệ cao, lâm sản.\n- **Thói quen dưỡng sinh**: Đi dạo công viên, hít thở khí trời rừng cây, đọc sách tĩnh tâm, nuôi dưỡng lòng trắc ẩn bao dung.',
      'Kim': '- **Phương vị cát lợi**: Ưu tiên phương Tây và Tây Bắc.\n- **Màu sắc trang phục & nội thất**: Trắng, xám bạc, ghi sáng, ánh kim lấp lánh.\n- **Vật phẩm trợ mệnh**: Trang sức vàng bạc bạch kim, đồng hồ kim loại cơ học cao cấp, thạch anh trắng, chuông gió đồng.\n- **Ngành nghề & Lĩnh vực**: Cơ khí chính xác, tài chính ngân hàng, bảo hiểm, kiểm toán tư pháp, quản trị kỷ luật, công nghệ phần cứng.\n- **Thói quen dưỡng sinh**: Rèn luyện kỷ luật bản thân, giữ lời hứa nghiêm minh, tập thở sâu khí công điều hòa phổi.',
      'Thổ': '- **Phương vị cát lợi**: Ưu tiên trung tâm, Đông Bắc và Tây Nam.\n- **Màu sắc trang phục & nội thất**: Vàng đất, nâu sẫm, be, vàng cam nhạt.\n- **Vật phẩm trợ mệnh**: Đồ gốm sứ nghệ thuật, bình ngọc, đá mắt hổ, thạch anh vàng, đồ phong thủy đất nung.\n- **Ngành nghề & Lĩnh vực**: Bất động sản, xây dựng hạ tầng, kiến trúc đô thị, kho bãi lưu trữ, nông sản ngũ cốc, vật liệu đá sỏi.\n- **Thói quen dưỡng sinh**: Sinh hoạt điều độ, ăn uống đúng giờ, giữ chữ tín hàng đầu, xây dựng sự kiên định bền bỉ.'
    };

    useList.forEach(elem => {
      if (adviceMap[elem]) {
        md.push(`#### 🌿 Ứng dụng Ngũ Hành ${elem} Trong Đời Sống:`);
        md.push(adviceMap[elem]);
        md.push('');
      }
    });

    return md.join('\n');
  }

  // ==========================================
  // VIII. HIGH-LEVEL PUBLIC APIS
  // ==========================================

  /**
   * Phân tích từ đối tượng BaziChart của NetaBaziEngine
   */
  function analyzeFromBaziChart(baziChart, targetYear = 2026) {
    if (!baziChart || !baziChart.tuTru) {
      throw new Error('Lá số Bát Tự không hợp lệ!');
    }

    const tuTru = baziChart.tuTru;
    const yearGan = tuTru[0].gan, yearZhi = tuTru[0].zhi;
    const monthGan = tuTru[1].gan, monthZhi = tuTru[1].zhi;
    const dayGan = tuTru[2].gan, dayZhi = tuTru[2].zhi;
    const hourGan = tuTru[3].gan, hourZhi = tuTru[3].zhi;

    const isMale = baziChart.input ? baziChart.input.isMale : true;
    const birthYear = baziChart.input ? baziChart.input.year : 2000;
    const startAge = baziChart.luckStart ? baziChart.luckStart.startAge : (baziChart.input ? baziChart.input.startAge : 2);
    const startYear = baziChart.luckStart ? baziChart.luckStart.startYear : (baziChart.input ? baziChart.input.startYear : (birthYear + startAge));

    const luckPillars = (baziChart.daYun && baziChart.daYun.results) ? baziChart.daYun.results : [];

    const chartAdapter = {
      year_gan: yearGan, year_zhi: yearZhi,
      month_gan: monthGan, month_zhi: monthZhi,
      day_gan: dayGan, day_zhi: dayZhi,
      hour_gan: hourGan, hour_zhi: hourZhi,
      is_male: isMale,
      birth_year: birthYear,
      start_age: startAge,
      start_year: startYear,
      luck_pillars: luckPillars
    };

    return analyzeFromNormalizedChart(chartAdapter, targetYear);
  }

  /**
   * Phân tích từ Payload đa cấu trúc (Schema 1, 2, 3, 4)
   */
  function analyzeFromExistingChart(chartPayload, targetYear = 2026) {
    let yG = '', yZ = '', mG = '', mZ = '', dG = '', dZ = '', hG = '', hZ = '';
    let isMale = true;
    let birthYear = 2000;
    let startAge = null;
    let startYear = null;
    let prebuiltLuck = null;

    if (chartPayload.pillars && Array.isArray(chartPayload.pillars)) {
      // Schema 3: Mảng Pillars
      chartPayload.pillars.forEach(p => {
        const parts = (p.can_chi || p.canChi || '').trim().split(/\s+/);
        if (p.pillar === 'Năm') { yG = parts[0]; yZ = parts[1]; }
        if (p.pillar === 'Tháng') { mG = parts[0]; mZ = parts[1]; }
        if (p.pillar === 'Ngày') { dG = parts[0]; dZ = parts[1]; }
        if (p.pillar === 'Giờ') { hG = parts[0]; hZ = parts[1]; }
      });
    } else if (chartPayload.year_gan) {
      // Schema 2: Key rời
      yG = chartPayload.year_gan; yZ = chartPayload.year_zhi;
      mG = chartPayload.month_gan; mZ = chartPayload.month_zhi;
      dG = chartPayload.day_gan; dZ = chartPayload.day_zhi;
      hG = chartPayload.hour_gan; hZ = chartPayload.hour_zhi;
    } else if (chartPayload.year) {
      // Schema 1: Chuỗi ghép
      const yP = (chartPayload.year || '').split(' '); yG = yP[0]; yZ = yP[1];
      const mP = (chartPayload.month || '').split(' '); mG = mP[0]; mZ = mP[1];
      const dP = (chartPayload.day || '').split(' '); dG = dP[0]; dZ = dP[1];
      const hP = (chartPayload.hour || '').split(' '); hG = hP[0]; hZ = hP[1];
    }

    if (chartPayload.gender !== undefined) {
      isMale = chartPayload.gender === 'Nam' || chartPayload.gender === true;
    } else if (chartPayload.is_male !== undefined) {
      isMale = Boolean(chartPayload.is_male);
    }

    if (chartPayload.birth_year) birthYear = parseInt(chartPayload.birth_year, 10);
    if (chartPayload.start_age !== undefined && chartPayload.start_age !== null) startAge = parseInt(chartPayload.start_age, 10);
    if (chartPayload.start_year !== undefined && chartPayload.start_year !== null) startYear = parseInt(chartPayload.start_year, 10);
    if (chartPayload.luck_pillars) prebuiltLuck = chartPayload.luck_pillars;

    // Fallback tính đại vận nếu chưa có
    if (!prebuiltLuck && global.NetaBaziEngine) {
      const calcLuck = global.NetaBaziEngine.calcLuckPillars(yG, mG, mZ, dG, isMale, startAge || 2, birthYear, startYear);
      prebuiltLuck = calcLuck ? calcLuck.results : [];
    }

    const chartAdapter = {
      year_gan: yG, year_zhi: yZ,
      month_gan: mG, month_zhi: mZ,
      day_gan: dG, day_zhi: dZ,
      hour_gan: hG, hour_zhi: hZ,
      is_male: isMale,
      birth_year: birthYear,
      start_age: startAge || 2,
      start_year: startYear || (birthYear + (startAge || 2)),
      luck_pillars: prebuiltLuck || []
    };

    return analyzeFromNormalizedChart(chartAdapter, targetYear);
  }

  function analyzeFromNormalizedChart(chart, targetYear = 2026) {
    // 1. Cân Lực Ngũ Hành
    const quantData = evaluateQuantitative(chart);

    // 2. Manh Phái
    const mangPaiData = evaluateMangPai(chart);

    // 3. Thần Sát
    const shenShaList = findAllShenSha(chart);

    // 4. 6 Cây Quyết Định
    const decisions = {
      personality: evaluatePersonality(chart, quantData, mangPaiData, shenShaList),
      career: evaluateCareer(chart, quantData, mangPaiData, shenShaList),
      wealth: evaluateWealth(chart, quantData, mangPaiData, shenShaList),
      marriage: evaluateMarriage(chart, quantData, mangPaiData, shenShaList),
      health: evaluateHealth(chart, quantData, mangPaiData, shenShaList),
      timing: evaluateTimingYear(chart, quantData, mangPaiData, targetYear)
    };

    // 5. Động cơ Thời Vận
    const deepLuckPillars = analyzeDeepLuckPillars(chart, quantData, mangPaiData);
    const targetAnnualMilestones = detectAnnualMilestones(chart, quantData, mangPaiData, targetYear);

    const timingData = {
      deepLuckPillars,
      targetAnnualMilestones
    };

    // 5.5. Động cơ Tổng Hợp Cốt Cách & Bản Đồ Chiến Lược Vận Trình
    const masterAssessment = BaziMasterSynthesizer.synthesizeMasterAssessment(chart, quantData, mangPaiData, shenShaList, decisions, timingData, targetYear);

    // 6. Báo Cáo Markdown Toàn Văn
    const markdownReport = buildMarkdownReport(chart, quantData, mangPaiData, shenShaList, decisions, timingData, targetYear, masterAssessment);

    return {
      status: 'success',
      chart_data: chart,
      quantitative_data: quantData,
      mang_pai_data: mangPaiData,
      shen_sha: shenShaList,
      decisions,
      timing_data: timingData,
      master_assessment: masterAssessment,
      markdown_report: markdownReport
    };
  }

  // Export API
  global.NetaBaziInterpreter = {
    analyzeFromBaziChart,
    analyzeFromExistingChart,
    synthesizeMasterAssessment: BaziMasterSynthesizer.synthesizeMasterAssessment,
    evaluateQuantitative,
    evaluateMangPai,
    findAllShenSha,
    evaluatePersonality,
    evaluateCareer,
    evaluateWealth,
    evaluateMarriage,
    evaluateHealth,
    evaluateTimingYear,
    analyzeDeepLuckPillars,
    detectAnnualMilestones,
    buildMarkdownReport,
    TIAN_GAN,
    DI_ZHI,
    GAN_WU_XING,
    ZHI_WU_XING,
    SHEN_SHA_RULES,
    PILLAR_WEIGHTS
  };

})(typeof window !== 'undefined' ? window : this);
