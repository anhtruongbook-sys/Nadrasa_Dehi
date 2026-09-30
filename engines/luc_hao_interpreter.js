/**
 * NETA LIGHT - LỤC HÀO INTERPRETER ENGINE (engines/luc_hao_interpreter.js)
 * 
 * Hệ thống Luận Giải Kinh Dịch Lục Hào Chuyên Sâu
 * theo chuẩn mực cổ thư Bốc Phệ Chính Tông & Tăng San Bốc Dịch.
 * 
 * Tích hợp cơ chế Lưỡng Động Cơ (Dual-Engine Architecture):
 * 1. Động cơ Thuần Quy Tắc (Deterministic Expert System) - 100% Offline, độ trễ 0ms.
 * 2. Động cơ Tích Hợp Gemini AI với Rào Chắn Chống Ảo Giác 4 Lớp (4-Tier Guardrail):
 *    - Lớp 1: Khóa Chân Lý Toán Học (Ground-Truth Fact Sheet)
 *    - Lớp 2: Ép Khung Prompt (Strict Anti-Hallucination Constraints)
 *    - Lớp 3: Gọi Gemini AI Cascade (gemini-3.5-flash / gemini-2.5-flash)
 *    - Lớp 4: Bộ Kiểm Toán Độc Lập 6 Tiêu Chí (Factual Consistency Verifier) + Tự Động Fallback
 */

(function (global) {
  'use strict';

  // 1. CƠ SỞ DỮ LIỆU & QUY TẮC DỊCH LÝ NỀN TẢNG
  const LUC_THAN_RELATIONS = {
    'Phụ Mẫu': { sinh: 'Huynh Đệ', khac: 'Tử Tôn', biSinh: 'Quan Quỷ', biKhac: 'Thê Tài' },
    'Huynh Đệ': { sinh: 'Tử Tôn', khac: 'Thê Tài', biSinh: 'Phụ Mẫu', biKhac: 'Quan Quỷ' },
    'Tử Tôn':   { sinh: 'Thê Tài', khac: 'Quan Quỷ', biSinh: 'Huynh Đệ', biKhac: 'Phụ Mẫu' },
    'Thê Tài':  { sinh: 'Quan Quỷ', khac: 'Phụ Mẫu', biSinh: 'Tử Tôn', biKhac: 'Huynh Đệ' },
    'Quan Quỷ': { sinh: 'Phụ Mẫu', khac: 'Huynh Đệ', biSinh: 'Thê Tài', biKhac: 'Tử Tôn' }
  };

  const TOPIC_PRESETS = [
    { key: 'cautai', label: '💰 Cầu Tài & Đầu Tư', dungThan: 'Thê Tài', desc: 'Buôn bán, hùn vốn, chứng khoán, mở cửa hàng, đòi nợ' },
    { key: 'congdanh', label: '🏆 Công Danh & Thăng Chức', dungThan: 'Quan Quỷ', desc: 'Thăng tiến, xin việc, bổ nhiệm, thi tuyển cán bộ, uy quyền' },
    { key: 'thicu', label: '📚 Thi Cử & Học Hành', dungThan: 'Phụ Mẫu', desc: 'Thi tuyển sinh, thi tốt nghiệp, đồ án, cấp bằng, giấy tờ' },
    { key: 'honnhan_nam', label: '💍 Hôn Nhân (Nam hỏi)', dungThan: 'Thê Tài', desc: 'Tìm hiểu, cưới hỏi, tình cảm đối phương đối với nam' },
    { key: 'honnhan_nu', label: '💍 Hôn Nhân (Nữ hỏi)', dungThan: 'Quan Quỷ', desc: 'Tìm hiểu, cưới hỏi, tình cảm đối phương đối với nữ' },
    { key: 'concai', label: '👶 Con Cái & Thai Sản', dungThan: 'Tử Tôn', desc: 'Cầu con, sinh nở, nuôi dạy, phúc đức dòng dõi' },
    { key: 'giatrach', label: '🏡 Gia Trạch & Nhà Đất', dungThan: 'Phụ Mẫu', desc: 'Mua bán nhà đất, dọn nhà, phong thủy móng/bếp/cổng' },
    { key: 'suckhoe', label: '🩺 Sức Khỏe & Bệnh Tật', dungThan: 'Tử Tôn', desc: 'Khám bệnh, tìm thầy thuốc, xem tình trạng hồi phục' },
    { key: 'kientung', label: '⚖️ Kiện Tụng & Tranh Chấp', dungThan: 'Quan Quỷ', desc: 'Tranh chấp pháp lý, hòa giải, kiện tụng, tòa án' },
    { key: 'khac', label: '❓ Việc Chung & Động Tâm', dungThan: 'Thế Hào', desc: 'Mọi sự vụ bất ngờ cần xem xu thế biến chuyển' }
  ];

  const DIA_CHI_XUNG = {
    'Tý': 'Ngọ', 'Ngọ': 'Tý',
    'Sửu': 'Mùi', 'Mùi': 'Sửu',
    'Dần': 'Thân', 'Thân': 'Dần',
    'Mão': 'Dậu', 'Dậu': 'Mão',
    'Thìn': 'Tuất', 'Tuất': 'Thìn',
    'Tỵ': 'Hợi', 'Hợi': 'Tỵ'
  };

  const DIA_CHI_NHI_HOP = {
    'Tý': 'Sửu', 'Sửu': 'Tý',
    'Dần': 'Hợi', 'Hợi': 'Dần',
    'Mão': 'Tuất', 'Tuất': 'Mão',
    'Thìn': 'Dậu', 'Dậu': 'Thìn',
    'Tỵ': 'Thân', 'Thân': 'Tỵ',
    'Ngọ': 'Mùi', 'Mùi': 'Ngọ'
  };

  const MO_KHO = {
    'Kim': 'Sửu',
    'Mộc': 'Mùi',
    'Thủy': 'Thìn',
    'Thổ': 'Thìn',
    'Hỏa': 'Tuất'
  };

  const NGU_HANH_SINH = { 'Mộc': 'Hỏa', 'Hỏa': 'Thổ', 'Thổ': 'Kim', 'Kim': 'Thủy', 'Thủy': 'Mộc' };
  const NGU_HANH_KHAC = { 'Mộc': 'Thổ', 'Thổ': 'Thủy', 'Thủy': 'Hỏa', 'Hỏa': 'Kim', 'Kim': 'Mộc' };
  const DIA_CHI_NGU_HANH = {
    'Tý': 'Thủy', 'Hợi': 'Thủy',
    'Dần': 'Mộc', 'Mão': 'Mộc',
    'Tỵ': 'Hỏa', 'Ngọ': 'Hỏa',
    'Thân': 'Kim', 'Dậu': 'Kim',
    'Thìn': 'Thổ', 'Tuất': 'Thổ', 'Sửu': 'Thổ', 'Mùi': 'Thổ'
  };

  const FENGSHUI_LEVELS = [
    { pos: 1, area: 'Đất đai, móng nhà, nền móng, cống rãnh', defaultDesc: 'Gốc rễ vững bền' },
    { pos: 2, area: 'Bếp núc, phòng ngủ, nhà ở, gian giữa', defaultDesc: 'Nơi sinh hoạt ấm cúng' },
    { pos: 3, area: 'Cửa trong, giường chiếu, bậc tam cấp', defaultDesc: 'Lối lưu thông nội bộ' },
    { pos: 4, area: 'Cổng lớn, cửa sổ, ban công, lối đón khí', defaultDesc: 'Minh đường nạp khí' },
    { pos: 5, area: 'Phòng khách, đường đi, ngõ vào, xe cộ', defaultDesc: 'Môi trường giao tiếp' },
    { pos: 6, area: 'Mái nhà, nóc nhà, tường rào, bàn thờ tổ tiên', defaultDesc: 'Đỉnh che chở tâm linh' }
  ];

  // =========================================================================
  // 2. ĐỘNG CƠ CÂN LỰC HÀO (-10.0 ĐẾN +10.0) THEO DỊCH LÝ ĐỊNH LƯỢNG
  // =========================================================================
  function tinhCanLucHao(hao, chiNgay, chiThang, tuanKhongList = []) {
    let score = 0.0;
    const notes = [];

    const chi = hao.chi;
    const elm = hao.chiElement;
    const eng = global.NetaDichHocEngine;
    const elmThang = eng?.DIA_CHI_NGU_HANH[chiThang] || 'Kim';
    const elmNgay = eng?.DIA_CHI_NGU_HANH[chiNgay] || 'Mộc';

    // 1. Tác động của Tháng (Nguyệt Kiến)
    if (chi === chiThang) {
      score += 4.0;
      notes.push('Lâm Nguyệt Kiến (+4.0: Cực vượng)');
    } else if (elmThang && eng.NGU_HANH_SINH?.[elmThang] === elm) {
      score += 2.5;
      notes.push(`Được Tháng sinh (+2.5: Đắc lệnh)`);
    } else if (elmThang === elm) {
      score += 2.0;
      notes.push(`Đồng hành với Tháng (+2.0)`);
    } else if (elmThang && eng.NGU_HANH_KHAC?.[elmThang] === elm) {
      score -= 2.0;
      notes.push(`Bị Tháng khắc (-2.0: Hưu tù)`);
    }

    if (DIA_CHI_XUNG[chiThang] === chi) {
      score -= 4.0;
      notes.push('Phạm Nguyệt Phá (-4.0: Khí số suy tàn)');
    }

    // 2. Tác động của Ngày (Nhật Kiến)
    if (chi === chiNgay) {
      score += 3.5;
      notes.push('Lâm Nhật Kiến (+3.5: Cương kiện)');
    } else if (elmNgay && eng.NGU_HANH_SINH?.[elmNgay] === elm) {
      score += 2.0;
      notes.push(`Được Ngày sinh (+2.0)`);
    } else if (elmNgay && eng.NGU_HANH_KHAC?.[elmNgay] === elm) {
      score -= 1.5;
      notes.push(`Bị Ngày khắc (-1.5)`);
    }

    if (DIA_CHI_NHI_HOP[chiNgay] === chi) {
      score += 2.0;
      notes.push('Nhật Hợp (+2.0: Được bao bọc che chở)');
    }

    // Xung Ngày: Phân định Ám Động vs Nhật Phá
    let isAmDong = false;
    let isNhatPha = false;
    if (DIA_CHI_XUNG[chiNgay] === chi) {
      if (score >= 1.5) {
        score += 2.0;
        isAmDong = true;
        notes.push('Đắc Ám Động (+2.0: Khí vượng phùng xung hóa động ngầm)');
      } else {
        score -= 3.0;
        isNhatPha = true;
        notes.push('Bị Nhật Phá (-3.0: Suy khí phùng xung bị đánh tan)');
      }
    }

    // 3. Tuần Không (Chân Không vs Giả Không)
    let isTuanKhong = tuanKhongList.includes(chi);
    let isChanKhong = false;
    let isGiaKhong = false;
    if (isTuanKhong) {
      if (score >= 2.0) {
        isGiaKhong = true;
        notes.push('Lâm Giả Không (Vượng khí ngộ Không, ngày xuất Không tất ứng)');
      } else {
        score -= 3.0;
        isChanKhong = true;
        notes.push('Lâm Chân Không (-3.0: Hưu tù ngộ Không như mây khói vô vọng)');
      }
    }

    // 4. Biến hóa Hào Động (nếu có biến)
    let hoaType = 'Tĩnh';
    if (hao.isDong && hao.bienChi) {
      score += 1.5;
      notes.push('Bản thân phát động (+1.5)');
      const bienElm = eng?.DIA_CHI_NGU_HANH[hao.bienChi] || '';
      
      // Hồi đầu sinh / khắc
      if (eng?.NGU_HANH_SINH?.[bienElm] === elm) {
        score += 3.5;
        hoaType = 'Hồi Đầu Sinh';
        notes.push(`Hóa Hồi Đầu Sinh (+3.5: Cực cát, hậu vận bồi đắp)`);
      } else if (eng?.NGU_HANH_KHAC?.[bienElm] === elm) {
        score -= 4.5;
        hoaType = 'Hồi Đầu Khắc';
        notes.push(`Hóa Hồi Đầu Khắc (-4.5: Đại hung, mầm họa quay đầu)`);
      }

      // Hóa Mộ
      if (MO_KHO[elm] === hao.bienChi) {
        score -= 3.0;
        hoaType = 'Hóa Mộ';
        notes.push('Hóa Mộ (-3.0: Rơi vào bế tắc, cầm tù tài năng)');
      }

      // Hóa Không
      if (tuanKhongList.includes(hao.bienChi)) {
        score -= 2.5;
        hoaType = 'Hóa Không Vong';
        notes.push('Hóa Không Vong (-2.5: Cuối cùng thành hư ảo)');
      }
    }

    // 5. Thần sát gia trợ
    if (hao.isLoc) { score += 1.5; notes.push('Lâm Lộc Thần (+1.5)'); }
    if (hao.isQuy) { score += 1.0; notes.push('Lâm Quý Nhân (+1.0)'); }
    if (hao.isMa)  { score += 0.5; notes.push('Lâm Dịch Mã (+0.5: Di biến nhanh)'); }
    if (hao.isDao) { score += 0.5; notes.push('Lâm Đào Hoa (+0.5: Duyên hội)'); }

    // Đánh giá nhãn trạng thái năng lượng
    let statusLabel = 'Bình Hòa';
    if (score >= 4.0) statusLabel = 'Cực Vượng';
    else if (score >= 1.5) statusLabel = 'Vượng';
    else if (score >= 0.0) statusLabel = 'Tướng / Bình';
    else if (score >= -2.5) statusLabel = 'Suy / Hưu';
    else statusLabel = 'Tử Tuyệt / Cực Suy';

    return {
      score: parseFloat(score.toFixed(1)),
      status: statusLabel,
      isAmDong,
      isNhatPha,
      isChanKhong,
      isGiaKhong,
      isTuanKhong,
      hoaType,
      notes
    };
  }

  // Đánh giá quan hệ Phi - Phục chuẩn mực cổ thư Dịch học (Bốc Phệ Chính Tông & Tăng San Bốc Dịch)
  function evaluatePhiPhucRelation(phucHao, phiHao, eng) {
    if (!phucHao || !phiHao) return null;
    const phucElm = phucHao.chiElement;
    const phiElm = phiHao.chiElement;
    let relation = '';
    let relationType = ''; // 'phi_sinh_phuc' | 'phuc_khac_phi' | 'phi_khac_phuc' | 'phuc_sinh_phi' | 'ti_hoa'
    let scoreImpact = 0;
    let desc = '';

    if (NGU_HANH_SINH[phiElm] === phucElm) {
      relationType = 'phi_sinh_phuc';
      relation = 'Phi Sinh Phục vi Trường Sinh (Đắc Dưỡng - Rất Cát)';
      scoreImpact = 2.0;
      desc = `Hào Phi [${phiHao.lucThan} ${phiHao.chi} • ${phiElm}] tương sinh hào Phục [${phucHao.lucThan} ${phucHao.chi} • ${phucElm}]. Dụng Thần được dưỡng khí che chở, khi đắc thời xuất đầu sẽ phát huy công lực cát lành tối đa.`;
    } else if (NGU_HANH_KHAC[phucElm] === phiElm) {
      relationType = 'phuc_khac_phi';
      relation = 'Phục Khắc Phi vi Xuất Đầu (Phá Kén Nắm Quyền - Cát)';
      scoreImpact = 1.0;
      desc = `Dụng Thần Phục [${phucHao.lucThan} ${phucHao.chi} • ${phucElm}] dũng mãnh khắc chế hào Phi [${phiHao.lucThan} ${phiHao.chi} • ${phiElm}]. Có khí thế đạp đổ chướng ngại, chủ động phá kén trồi lên nắm quyền.`;
    } else if (NGU_HANH_KHAC[phiElm] === phucElm) {
      relationType = 'phi_khac_phuc';
      relation = 'Phi Khắc Phục vi Thương Hại (Khắc Bạt Kìm Kẹp - Hung)';
      scoreImpact = -3.0;
      desc = `Hào Phi [${phiHao.lucThan} ${phiHao.chi} • ${phiElm}] khắc phạt đè nén hào Phục [${phucHao.lucThan} ${phucHao.chi} • ${phucElm}]. Dụng Thần bị kìm kẹp nghiêm trọng, khó lòng phát lộ nếu không có Nhật Nguyệt hoặc hào động xung phá Phi Thần.`;
    } else if (NGU_HANH_SINH[phucElm] === phiElm) {
      relationType = 'phuc_sinh_phi';
      relation = 'Phục Sinh Phi vi Tiết Khí (Hao Tổn Tâm Lực)';
      scoreImpact = -1.5;
      desc = `Dụng Thần Phục sinh xuất cho hào Phi, rơi vào thế tiết khí hao tổn, mưu sự nhọc nhằn, vì người khác mà hao tốn tài lực.`;
    } else {
      relationType = 'ti_hoa';
      relation = 'Phi Phục Tỉ Hòa (Đồng Hành Tương Trợ)';
      scoreImpact = 0.5;
      desc = `Hào Phi [${phiHao.chi} • ${phiElm}] và hào Phục [${phucHao.chi} • ${phucElm}] đồng hành, trường khí tương đồng, dễ dàng hiệp lực khi có thời cơ.`;
    }

    return { relationType, relation, scoreImpact, desc };
  }

  // =========================================================================
  // 3. ĐỘNG CƠ PHÂN TÍCH SUY LUẬN 8 BƯỚC CỔ PHÁP CHUYÊN SÂU
  // =========================================================================
  function evaluate8Steps(queResult, topicKey = 'cautai', customQuestion = '') {
    const goc = queResult.que_goc;
    const bien = queResult.que_bien;
    const thoiGian = queResult.thoi_gian;
    const chiNgay = thoiGian.chiNgay;
    const chiThang = thoiGian.thangChi;
    const tuanKhong = thoiGian.tuanKhong || [];
    const eng = global.NetaDichHocEngine;

    // Tìm preset chủ đề
    const preset = TOPIC_PRESETS.find(p => p.key === topicKey) || TOPIC_PRESETS[0];
    const targetLucThan = preset.dungThan === 'Thế Hào' ? (goc.haos[goc.thePos - 1]?.lucThan || 'Huynh Đệ') : preset.dungThan;

    // 1. Tính toán cân lực cho toàn bộ 6 hào
    const haosEnriched = goc.haos.map((h, idx) => {
      const bienHao = (bien && bien.haos) ? bien.haos[idx] : null;
      const hData = { ...h, bienChi: bienHao ? bienHao.chi : null, bienLucThan: bienHao ? bienHao.lucThan : null };
      const canLuc = tinhCanLucHao(hData, chiNgay, chiThang, tuanKhong);
      return {
        ...hData,
        canLuc
      };
    });

    // 2. Bước 1: Chọn Dụng Thần
    let dungThanHao = null;
    let dungThanPos = -1;
    let isPhucThan = false;
    let phucThanInfo = null;
    let phiPhucRel = null;

    // Tìm trong 6 hào quẻ gốc (ưu tiên hào Thế, hào phát động hoặc hào vượng)
    const dtCandidates = haosEnriched.filter(h => h.lucThan === targetLucThan);
    if (dtCandidates.length === 1) {
      dungThanHao = { ...dtCandidates[0], isPhuc: false };
      dungThanPos = dungThanHao.pos;
    } else if (dtCandidates.length > 1) {
      // Ưu tiên hào động hoặc hào Thế
      const chosen = dtCandidates.find(h => h.isDong) || dtCandidates.find(h => h.isThe) || dtCandidates[0];
      dungThanHao = { ...chosen, isPhuc: false };
      dungThanPos = dungThanHao.pos;
    } else {
      // Dụng Thần không hiện -> Tìm Phục Thần
      isPhucThan = true;
      const phucItem = (queResult.phuc_than || []).find(p => p.lucThan === targetLucThan);
      if (phucItem) {
        phucThanInfo = phucItem;
        dungThanPos = phucItem.pos;
        const phiHao = haosEnriched[phucItem.pos - 1];
        phiPhucRel = evaluatePhiPhucRelation(phucItem, phiHao, eng);
        const baseCanLuc = tinhCanLucHao({ chi: phucItem.chi, chiElement: phucItem.chiElement, isDong: false }, chiNgay, chiThang, tuanKhong);
        
        // Điều chỉnh điểm cân lực theo tương quan Phi - Phục
        const adjustedScore = parseFloat((baseCanLuc.score + (phiPhucRel?.scoreImpact || 0)).toFixed(1));
        let adjustedStatus = baseCanLuc.status;
        if (adjustedScore >= 4.0) adjustedStatus = 'Cực Vượng';
        else if (adjustedScore >= 1.5) adjustedStatus = 'Vượng';
        else if (adjustedScore >= 0.0) adjustedStatus = 'Tướng / Bình';
        else if (adjustedScore >= -2.5) adjustedStatus = 'Suy / Hưu';
        else adjustedStatus = 'Tử Tuyệt / Cực Suy';

        baseCanLuc.score = adjustedScore;
        baseCanLuc.status = adjustedStatus;
        if (phiPhucRel) baseCanLuc.notes.push(phiPhucRel.relation);

        dungThanHao = {
          pos: phucItem.pos,
          can: phucItem.can,
          chi: phucItem.chi,
          chiElement: phucItem.chiElement,
          lucThan: phucItem.lucThan,
          isPhuc: true,
          presenceType: 'PHỤC THẦN (Tàng phục dưới Phi Thần)',
          phiThan: phiHao,
          phiPhucRelation: phiPhucRel,
          canLuc: baseCanLuc
        };
      } else {
        // Fallback về hào Thế
        dungThanHao = { ...haosEnriched[goc.thePos - 1], isPhuc: false, presenceType: 'HIỆN DIỆN MINH BẠCH TRÊN QUẺ' };
        dungThanPos = goc.thePos;
      }
    }

    if (dungThanHao && !dungThanHao.presenceType) {
      dungThanHao.presenceType = 'HIỆN DIỆN MINH BẠCH TRÊN QUẺ';
    }

    // 2b. Khảo sát toàn bộ Phục Thần của Quẻ (kể cả khi Dụng Thần không phải là Phục Thần)
    const allPhucThanEvaluated = (queResult.phuc_than || []).map(pItem => {
      const phiHao = haosEnriched[pItem.pos - 1];
      const rel = evaluatePhiPhucRelation(pItem, phiHao, eng);
      return {
        ...pItem,
        phiThan: phiHao,
        phiPhucRelation: rel
      };
    });

    // 3. Bước 1b: Khảo sát Tứ Thần
    const rels = LUC_THAN_RELATIONS[targetLucThan] || {};
    const nguyenThanName = rels.biSinh; // Sinh Dụng Thần
    const kyThanName = rels.biKhac;     // Khắc Dụng Thần
    const cuuThanName = rels.sinh;       // Khắc Nguyên Thần, sinh Kỵ Thần
    const tietThanName = rels.khac;      // Hao khí Dụng Thần

    const nguyenThanHaos = haosEnriched.filter(h => h.lucThan === nguyenThanName);
    const kyThanHaos = haosEnriched.filter(h => h.lucThan === kyThanName);
    const cuuThanHaos = haosEnriched.filter(h => h.lucThan === cuuThanName);
    const tietThanHaos = haosEnriched.filter(h => h.lucThan === tietThanName);

    // 4. Bước 2: Khảo sát Hào Thế (Bản thân đương số)
    const theHao = haosEnriched[goc.thePos - 1] || haosEnriched.find(h => h.isThe) || haosEnriched[0];
    const ungHao = haosEnriched[goc.ungPos - 1] || haosEnriched.find(h => h.isUng) || haosEnriched[3];

    // 5. Bước 3 & 4: So khớp ma trận Thế - Dụng
    const dtScore = dungThanHao.canLuc.score;
    const theScore = theHao.canLuc.score;
    let theDungStatus = '';
    let theDungDesc = '';

    if (dtScore >= 1.5 && theScore >= 1.5) {
      theDungStatus = 'THẾ DỤNG LƯỠNG VƯỢNG';
      theDungDesc = 'Thời cơ thị trường rộng mở, bản thân đủ năng lực, tài chính và sự minh triết để đón nhận kết quả đại cát.';
    } else if (dtScore >= 1.5 && theScore < 0.0) {
      theDungStatus = 'DỤNG VƯỢNG THẾ SUY';
      theDungDesc = 'Cơ hội rất lớn và hấp dẫn nhưng nội lực bản thân yếu kém, gánh vác quá sức dễ sinh đổ vỡ, tổn hại hoặc kiệt sức.';
    } else if (dtScore < 0.0 && theScore >= 1.5) {
      theDungStatus = 'THẾ VƯỢNG DỤNG SUY';
      theDungDesc = 'Bản thân nhiệt huyết, tự tin nhưng thị trường bất lợi, thời cơ chưa chín muồi, việc khó thành do khách quan cản trở.';
    } else {
      theDungStatus = 'THẾ DỤNG GIAI SUY';
      theDungDesc = 'Cả thiên thời, địa lợi lẫn nhân hòa đều chưa ủng hộ; tuyệt đối nên án binh bất động, bảo toàn vốn liếng.';
    }

    // 6. Bước 5: Hào động tác động
    const dongEffects = [];
    haosEnriched.filter(h => h.isDong).forEach(dh => {
      let act = '';
      if (dh.lucThan === nguyenThanName) {
        act = `Nguyên Thần [${dh.lucThan} Hào ${dh.pos}] phát động SINH DỤNG THẦN (+Cát lành, có người nâng đỡ, dòng tiền đổ về)`;
      } else if (dh.lucThan === kyThanName) {
        act = `Kỵ Thần [${dh.lucThan} Hào ${dh.pos}] phát động KHẮC DỤNG THẦN (-Nguy hiểm, có rủi ro cản trở, kẻ phá hoại)`;
      } else if (dh.pos === dungThanPos) {
        act = `Chính Dụng Thần [Hào ${dh.pos}] phát động (${dh.canLuc.hoaType}) -> Vận trình có sự chuyển biến mạnh mẽ`;
      } else if (dh.pos === goc.thePos) {
        act = `Hào Thế [Hào ${dh.pos}] phát động (${dh.canLuc.hoaType}) -> Đương số chủ động hành động, biến đổi hoàn cảnh`;
      } else {
        act = `Hào ${dh.pos} (${dh.lucThan} ${dh.chi}) phát động biến ${dh.bienLucThan || ''} ${dh.bienChi || ''}`;
      }
      dongEffects.push(act);
    });

    // 7. Bước 6: Phán quyết Cát / Hung nhị phân
    let totalScore = dtScore * 1.5 + theScore * 1.2;
    // Bù trừ động hào
    haosEnriched.filter(h => h.isDong).forEach(dh => {
      if (dh.lucThan === nguyenThanName) totalScore += 2.0;
      if (dh.lucThan === kyThanName) totalScore -= 3.0;
    });

    let judgment = 'BÌNH HÒA';
    let judgmentColor = '#f59e0b';
    let isSuccess = null;

    if (totalScore >= 5.0) {
      judgment = 'ĐẠI CÁT ĐẠI LỢI (THÀNH CÔNG RỰC RỠ)';
      judgmentColor = '#10b981';
      isSuccess = true;
    } else if (totalScore >= 1.5) {
      judgment = 'CÁT LÀNH (THUẬN LỢI ĐẠT ĐƯỢC)';
      judgmentColor = '#059669';
      isSuccess = true;
    } else if (totalScore >= -1.5) {
      judgment = 'DÂY DƯA / TRẮC TRỞ (CẦN KIÊN NHẪN)';
      judgmentColor = '#f59e0b';
      isSuccess = null;
    } else if (totalScore >= -5.0) {
      judgment = 'BẤT LỢI / TIÊU HAO (NÊN ĐỀ PHÒNG)';
      judgmentColor = '#ef4444';
      isSuccess = false;
    } else {
      judgment = 'ĐẠI HUNG / TỔN THẤT (TUYỆT ĐỐI KHÔNG NÊN LÀM)';
      judgmentColor = '#b91c1c';
      isSuccess = false;
    }

    // 8. Bước 7: Xác định Ứng Kỳ Đa Chiều
    const ungKyList = [];
    if (dungThanHao.canLuc.isTuanKhong) {
      ungKyList.push(`Dụng Thần lâm Tuần Không: Ứng nghiệm vào ngày/tháng [${dungThanHao.chi}] (Xuất Không) hoặc ngày xung [${DIA_CHI_XUNG[dungThanHao.chi]}] (Xung Không khai phát).`);
    }
    if (dungThanHao.canLuc.isAmDong) {
      ungKyList.push(`Dụng Thần ngộ Ám Động: Sự việc ứng nghiệm cực kỳ chớp nhoáng trong vòng vài ngày tới (ngày hợp [${DIA_CHI_NHI_HOP[dungThanHao.chi]}] hoặc ngày trực [${dungThanHao.chi}]).`);
    }
    if (isPhucThan && phucThanInfo) {
      ungKyList.push(`Dụng Thần Phục Thần ngự dưới Phi Thần: Cần đợi ngày xung phá Phi Thần [${DIA_CHI_XUNG[phucThanInfo.phiThan.chi]}] hoặc ngày trực Phục Thần [${phucThanInfo.chi}] để lộ diện.`);
    }
    if (dungThanHao.isDong) {
      ungKyList.push(`Dụng Thần phát động: Sự việc định thời vào ngày hợp với Hào Động [${DIA_CHI_NHI_HOP[dungThanHao.chi]}] hoặc ngày hào Biến [${dungThanHao.bienChi}].`);
    }
    if (ungKyList.length === 0) {
      ungKyList.push(`Quẻ tĩnh an định: Ứng kỳ vào ngày mang Chi của Dụng Thần [${dungThanHao.chi}] hoặc ngày xung kích khai mở [${DIA_CHI_XUNG[dungThanHao.chi]}].`);
    }

    // 9. Bước 8: Chẩn đoán Phong Thủy 6 Hào & Hóa giải thực chiến
    const fsFindings = [];
    haosEnriched.forEach(h => {
      const lvl = FENGSHUI_LEVELS.find(l => l.pos === h.pos);
      if (h.lucThan === 'Quan Quỷ') {
        fsFindings.push({ pos: h.pos, area: lvl.area, issue: `Quan Quỷ ngự Hào ${h.pos} (${h.chi})`, risk: 'Ám khí, mầm bệnh hoặc tranh chấp tại khu vực này' });
      } else if (h.isNhatPha || h.canLuc.isChanKhong) {
        fsFindings.push({ pos: h.pos, area: lvl.area, issue: `Hào ${h.pos} bị Nhật Phá / Chân Không`, risk: 'Cấu trúc hư hỏng, nứt nẻ hoặc suy thoái khí trường' });
      }
    });

    return {
      topic: preset,
      customQuestion: customQuestion || preset.label,
      targetLucThan,
      haosEnriched,
      dungThan: {
        hao: dungThanHao,
        pos: dungThanPos,
        isPhuc: isPhucThan,
        phucInfo: phucThanInfo,
        phiPhucRelation: dungThanHao.phiPhucRelation
      },
      allPhucThan: allPhucThanEvaluated,
      tuThan: {
        nguyenThan: { name: nguyenThanName, haos: nguyenThanHaos },
        kyThan: { name: kyThanName, haos: kyThanHaos },
        cuuThan: { name: cuuThanName, haos: cuuThanHaos },
        tietThan: { name: tietThanName, haos: tietThanHaos }
      },
      theHao,
      ungHao,
      theDung: {
        status: theDungStatus,
        desc: theDungDesc,
        dtScore,
        theScore
      },
      dongEffects,
      judgment: {
        judgment,
        judgmentColor,
        isSuccess,
        totalScore: parseFloat(totalScore.toFixed(1))
      },
      ungKy: ungKyList,
      fengshui: fsFindings
    };
  }

  // =========================================================================
  // 4. BỘ SINH BÁO CÁO THUẦN QUY TẮC (100% DETERMINISTIC - ZERO AI)
  // =========================================================================
  function generateDeterministicReport(evalData, queResult) {
    const goc = queResult.que_goc;
    const bien = queResult.que_bien;
    const tg = queResult.thoi_gian;
    const dt = evalData.dungThan.hao;
    const tuThan = evalData.tuThan;
    const td = evalData.theDung;
    const jm = evalData.judgment;
    const eng = global.NetaDichHocEngine;

    const lines = [];
    lines.push('═══════════════════════════════════════════════════════════════════════════════');
    lines.push('               BẢN LUẬN GIẢI KINH DỊCH LỤC HÀO CHUYÊN SÂU');
    lines.push(`  Sự Vụ Chiêm Đoán: "${evalData.customQuestion}"`);
    lines.push(`  Chủ Đề Dụng Thần: [${evalData.topic.label}] ➔ Thủ Ngôi: ${evalData.targetLucThan} (${dt.can || ''}-${dt.chi} • Hành ${dt.chiElement})`);
    lines.push('═══════════════════════════════════════════════════════════════════════════════\n');

    lines.push('I. THÔNG SỐ TỌA ĐỘ BÀN QUẺ:');
    lines.push(`- Quẻ Chính: ${goc.name.toUpperCase()} (Cung ${goc.cung} - Hành ${goc.cungElement}${goc.cungSpecial ? ` • ${goc.cungSpecial}` : ''})`);
    if (bien) {
      lines.push(`- Quẻ Biến: ${bien.name.toUpperCase()} (Do Hào ${queResult.que_goc.haos.filter(h => h.isDong).map(h => h.pos).join(', ')} phát động biến hóa)`);
    } else {
      lines.push('- Quẻ Tĩnh: Sáu hào an tĩnh, vạn sự quy về nội lực gốc.');
    }
    const elmNgay = tg.ngayElement || eng?.DIA_CHI_NGU_HANH?.[tg.chiNgay] || '';
    const elmThang = tg.thangElement || eng?.DIA_CHI_NGU_HANH?.[tg.thangChi] || '';
    lines.push(`- Trục Thời Gian: Ngày ${tg.canNgay} ${tg.chiNgay} (Hành ${elmNgay}), Tháng ${tg.thangChi} (Hành ${elmThang}, Tiết: ${tg.solarTerm || 'Thu Phân'})`);
    lines.push(`- Tuần Không: [${(tg.tuanKhong || []).join(', ')}] ngộ Không.\n`);

    lines.push('II. KẾT LUẬN & PHÁN QUYẾT TỔNG HÒA:');
    lines.push(`>>> PHÁN ĐOÁN: [${jm.judgment}] (Điểm khí số: ${jm.totalScore > 0 ? '+' : ''}${jm.totalScore})`);
    if (jm.isSuccess === true) {
      lines.push(`- Đánh giá: Khí số đắc thế, Dụng Thần và Hào Thế cùng cộng hưởng cát lành. Sự việc dự định hanh thông, đón nhận kết quả thuận lợi.`);
    } else if (jm.isSuccess === false) {
      lines.push(`- Đánh giá: Khí số suy vi hoặc bị Kỵ Thần khắc hại nghiêm trọng. Tuyệt đối cẩn trọng trước tổn thất, không nên mạo hiểm đầu tư hoặc xuất tiền.`);
    } else {
      lines.push(`- Đánh giá: Thế cờ giằng co, việc cần thêm thời gian để hóa giải xung khắc và chờ đợi thời điểm Ứng Kỳ thuận lợi.`);
    }
    lines.push('');

    lines.push('III. PHÂN TÍCH DỤNG THẦN & TỨ THẦN LUẬN:');
    lines.push(`1. Dụng Thần [${evalData.targetLucThan}]:`);
    if (evalData.dungThan.isPhuc) {
      const pInfo = evalData.dungThan.phucInfo;
      lines.push(`   - Tình trạng: [HÀO TÀNG PHỤC (Phục Thần)] ẩn dưới Hào Phi ${pInfo.pos} (${pInfo.phiThan?.lucThan} ${pInfo.phiThan?.chi} • Hành ${pInfo.phiThan?.chiElement}).`);
      if (evalData.dungThan.phiPhucRelation) {
        lines.push(`   - Quan hệ Phi - Phục: [${evalData.dungThan.phiPhucRelation.relation}]. ${evalData.dungThan.phiPhucRelation.desc}`);
      }
      lines.push(`   - Cân Lực: [${dt.canLuc.score > 0 ? '+' : ''}${dt.canLuc.score}] -> Đạt mức [${dt.canLuc.status.toUpperCase()}].`);
    } else {
      lines.push(`   - Tình trạng: [HIỆN DIỆN MINH BẠCH TRÊN QUẺ (Chính Thần)] ngự tại Hào ${dt.pos} (${dt.can}-${dt.chi} • Hành ${dt.chiElement}).`);
      lines.push(`   - Cân Lực: [${dt.canLuc.score > 0 ? '+' : ''}${dt.canLuc.score}] -> Đạt mức [${dt.canLuc.status.toUpperCase()}].`);
      if (dt.canLuc.notes.length) lines.push(`   - Căn cứ khí số: ${dt.canLuc.notes.join('; ')}.`);
    }

    lines.push(`2. Khảo sát Tứ Thần Vận Động:`);
    lines.push(`   - Nguyên Thần (${tuThan.nguyenThan.name}): ${tuThan.nguyenThan.haos.length ? `Ngự Hào ${tuThan.nguyenThan.haos.map(h => h.pos).join(', ')} (Cội nguồn tương trợ, quý nhân giúp sức)` : 'Ẩn phục hoặc suy kiệt'}.`);
    lines.push(`   - Kỵ Thần (${tuThan.kyThan.name}): ${tuThan.kyThan.haos.length ? `Ngự Hào ${tuThan.kyThan.haos.map(h => h.pos).join(', ')} (Mầm mống rủi ro, trở lực cần phòng bị)` : 'An tĩnh không gây hại'}.`);
    lines.push('');

    lines.push('IV. CHUYÊN ĐỀ HÀO TÀNG PHỤC (PHỤC THẦN KHẢO LUẬN):');
    if (evalData.dungThan.isPhuc) {
      lines.push(`- Dụng Thần [${evalData.targetLucThan}] là Hào Tàng Phục: Mang Can Chi [${dt.can}-${dt.chi} • Hành ${dt.chiElement}].`);
      lines.push(`- Khảo sát Phi Thần che đậy: Hào Phi ${dt.phiThan?.pos} (${dt.phiThan?.lucThan} ${dt.phiThan?.chi} • ${dt.phiThan?.chiElement}).`);
      lines.push(`- Cơ chế xuất phục: Cần chờ ngày xung Phi Thần [${DIA_CHI_XUNG[dt.phiThan?.chi] || ''}] để phá kén hoặc ngày trực Phục Thần [${dt.chi}] để nắm quyền.`);
    } else {
      lines.push(`- Dụng Thần [${evalData.targetLucThan} ${dt.can || ''}-${dt.chi} • Hành ${dt.chiElement}]: Hiện diện minh bạch tại Hào ${dt.pos} của Quẻ Chính, khí trường phát lộ trực tiếp, không bị che đậy hay tàng phục.`);
    }
    if (evalData.allPhucThan && evalData.allPhucThan.length > 0) {
      lines.push('- Khảo sát các Lục Thân tàng phục khác trong quẻ:');
      evalData.allPhucThan.forEach(p => {
        lines.push(`   * Phục Thần [${p.lucThan} ${p.can}-${p.chi} • ${p.chiElement}] phục dưới Hào Phi ${p.pos} (${p.phiThan?.lucThan} ${p.phiThan?.chi} • ${p.phiThan?.chiElement}) -> [${p.phiPhucRelation?.relation || 'Tương giao'}]`);
      });
    } else {
      lines.push('- Quẻ có đầy đủ cả 5 Lục Thân, không có hào nào bị khuyết hay tàng phục.');
    }
    lines.push('');

    lines.push('V. TƯƠNG QUAN HÀO THẾ & THIÊN CƠ BIẾN HÓA:');
    lines.push(`- Hào Thế ngự Hào ${evalData.theHao.pos} (${evalData.theHao.lucThan} ${evalData.theHao.chi}): Cân Lực [${evalData.theHao.canLuc.score > 0 ? '+' : ''}${evalData.theHao.canLuc.score}] -> [${evalData.theHao.canLuc.status.toUpperCase()}].`);
    lines.push(`- Cục Diện Thế - Dụng: [${td.status}] -> ${td.desc}`);
    if (evalData.dongEffects.length) {
      lines.push('- Động Thái Biến Hóa:');
      evalData.dongEffects.forEach(e => lines.push(`   * ${e}`));
    }
    lines.push('');

    lines.push('VI. ĐỊNH THỜI ĐIỂM ỨNG KỲ (KHI NÀO SỰ VIỆC XẢY RA):');
    evalData.ungKy.forEach(uk => lines.push(`- ${uk}`));
    lines.push('');

    if (evalData.fengshui.length) {
      lines.push('VII. CHẨN ĐOÁN PHONG THỦY GIA TRẠCH 6 HÀO:');
      evalData.fengshui.forEach(fs => {
        lines.push(`- Hào ${fs.pos} (${fs.area}): ${fs.issue} ➔ [Cảnh báo: ${fs.risk}]`);
      });
      lines.push('');
    }

    lines.push('VIII. LỜI KHUYÊN DỊCH LÝ THỰC CHIẾN:');
    lines.push('> Ranh giới học thuật: Lục Hào chiêm sự vụ theo động tâm, không đoán định số mệnh trọn đời. Hóa giải là điều chỉnh hành vi, thời điểm và bố trí vật lý không gian; tuyệt đối không dùng bùa chú, tỳ hưu hay vật phẩm mê tín dị đoan.');
    const theThu = evalData.theHao.lucThu;
    if (theThu === 'Thanh Long') lines.push('- Tâm pháp Lục Thú: Hành xử đàng hoàng, chính đại quang minh, dựa trên pháp lý hợp đồng rõ ràng ắt được quý nhân tương trợ.');
    else if (theThu === 'Chu Tước') lines.push('- Tâm pháp Lục Thú: Giữ gìn lời ăn tiếng nói, cẩn trọng thị phi điều tiếng, soi xét từng điều khoản văn bản thỏa thuận.');
    else if (theThu === 'Bạch Hổ') lines.push('- Tâm pháp Lục Thú: Kiềm chế nóng giận, tuyệt đối không manh động bột phát, chú ý đi lại cẩn thận.');
    else if (theThu === 'Huyền Vũ') lines.push('- Tâm pháp Lục Thú: Cảnh giác gian lận, thỏa thuận ngầm bất minh, giữ bí mật thông tin tài chính.');
    else lines.push('- Tâm pháp Lục Thú: Vững vàng tâm định, loại bỏ hoài nghi mơ hồ, tiến thoái có chừng mực.');

    return lines.join('\n');
  }

  // =========================================================================
  // 5. RÀO CHẮN CHỐNG ẢO GIÁC 4 LỚP CHO GEMINI AI (4-TIER GUARDRAIL)
  // =========================================================================

  // Lớp 1: Khóa Chân Lý (Ground-Truth Fact Sheet)
  function createGroundTruthFactSheet(evalData, queResult) {
    const goc = queResult.que_goc;
    const bien = queResult.que_bien;
    const tg = queResult.thoi_gian;
    const dt = evalData.dungThan.hao;
    const eng = global.NetaDichHocEngine;

    const elmNgay = tg.ngayElement || eng?.DIA_CHI_NGU_HANH?.[tg.chiNgay] || '';
    const elmThang = tg.thangElement || eng?.DIA_CHI_NGU_HANH?.[tg.thangChi] || '';

    // Bảng chi tiết 6 hào
    const haosOverview = goc.haos.map(h => {
      const enriched = evalData.haosEnriched.find(e => e.pos === h.pos) || h;
      return `Hào ${h.pos}: [${h.lucThan}] ${h.can}-${h.chi} (Hành ${h.chiElement}) | Lục Thú: ${h.lucThu} | Cân lực: ${enriched.canLuc?.score > 0 ? '+' : ''}${enriched.canLuc?.score} (${enriched.canLuc?.status}) ${h.isDong ? `[ĐỘNG -> Biến ${enriched.bienLucThan || ''} ${enriched.bienChi || ''}]` : '[TĨNH]'}${h.isThe ? ' [HÀO THẾ]' : ''}${h.isUng ? ' [HÀO ỨNG]' : ''}`;
    });

    // Toàn bộ phục thần
    const allPhucThanList = (evalData.allPhucThan || []).map(p => {
      return `Phục Thần [${p.lucThan} ${p.can}-${p.chi} • Hành ${p.chiElement}] phục dưới Hào Phi ${p.pos} [${p.phiThan?.lucThan} ${p.phiThan?.chi} • Hành ${p.phiThan?.chiElement}] -> ${p.phiPhucRelation?.relation || ''}`;
    });

    // Phân tích quan hệ Nhật/Nguyệt với Dụng Thần
    const dtChi = dt.chi;
    const dtElm = dt.chiElement;
    const chiThang = tg.thangChi;
    const chiNgay = tg.chiNgay;

    let nguyetRel = `Tháng ${chiThang} (${elmThang}): `;
    if (chiThang === dtChi) nguyetRel += `Lâm Nguyệt Kiến (Đại vượng khí)`;
    else if (DIA_CHI_XUNG[chiThang] === dtChi) nguyetRel += `Phạm Nguyệt Phá (${dtChi}-${chiThang} tương xung, cực suy)`;
    else if (NGU_HANH_SINH[elmThang] === dtElm) nguyetRel += `Được Tháng sinh`;
    else if (NGU_HANH_KHAC[elmThang] === dtElm) nguyetRel += `Bị Tháng khắc (${elmThang} khắc ${dtElm}: Hưu tù)`;
    else if (elmThang === dtElm) nguyetRel += `Đồng hành với Tháng (Vượng)`;
    else nguyetRel += `Bình hòa`;

    let nhatRel = `Ngày ${chiNgay} (${elmNgay}): `;
    if (chiNgay === dtChi) nhatRel += `Lâm Nhật Kiến (Cương kiện)`;
    else if (DIA_CHI_XUNG[chiNgay] === dtChi) nhatRel += dt.canLuc?.isAmDong ? `Đắc Ám Động` : `Phạm Nhật Phá`;
    else if (DIA_CHI_NHI_HOP[chiNgay] === dtChi) nhatRel += `Nhật Hợp (Được che chở)`;
    else if (NGU_HANH_SINH[elmNgay] === dtElm) nhatRel += `Được Ngày sinh`;
    else if (NGU_HANH_KHAC[elmNgay] === dtElm) nhatRel += `Bị Ngày khắc`;
    else if (NGU_HANH_SINH[dtElm] === elmNgay) nhatRel += `Sinh xuất cho Ngày (${dtElm} sinh ${elmNgay}: Tiết khí)`;
    else nhatRel += `Bình hòa`;

    return {
      hexName: goc.name,
      bienHexName: bien ? bien.name : 'Thuần Tĩnh',
      palace: goc.cung,
      palaceElement: goc.cungElement,
      time: `Ngày ${tg.canNgay} ${tg.chiNgay} (Hành ${elmNgay}), Tháng ${tg.thangChi} (Hành ${elmThang})`,
      chiNgay,
      chiThang,
      elmNgay,
      elmThang,
      tuanKhong: tg.tuanKhong || [],
      question: evalData.customQuestion,
      topic: evalData.topic.label,
      targetLucThan: evalData.targetLucThan,
      dungThan: {
        lucThan: evalData.targetLucThan,
        pos: evalData.dungThan.pos,
        can: dt.can || '',
        chi: dt.chi || '',
        element: dt.chiElement || '', // Khóa cứng: ví dụ 'Mộc'
        isPhuc: evalData.dungThan.isPhuc,
        presenceType: evalData.dungThan.isPhuc ? 'PHỤC THẦN (Tàng phục dưới Phi Thần)' : 'HIỆN DIỆN MINH BẠCH TRÊN QUẺ (Chính Thần)',
        score: dt.canLuc.score,
        status: dt.canLuc.status,
        notes: dt.canLuc.notes,
        nguyetRel,
        nhatRel,
        phiThanInfo: evalData.dungThan.isPhuc ? {
          pos: evalData.dungThan.phucInfo?.pos,
          lucThan: evalData.dungThan.phucInfo?.phiThan?.lucThan,
          can: evalData.dungThan.phucInfo?.phiThan?.can,
          chi: evalData.dungThan.phucInfo?.phiThan?.chi,
          element: evalData.dungThan.phucInfo?.phiThan?.chiElement,
          relation: evalData.dungThan.phiPhucRelation?.relation,
          relationDesc: evalData.dungThan.phiPhucRelation?.desc
        } : null
      },
      thePos: evalData.theHao.pos,
      theLucThan: evalData.theHao.lucThan,
      theCanChi: `${evalData.theHao.can || ''}-${evalData.theHao.chi}`,
      theElement: evalData.theHao.chiElement,
      theScore: evalData.theHao.canLuc.score,
      theStatus: evalData.theHao.canLuc.status,
      theDungStatus: evalData.theDung.status,
      theDungDesc: evalData.theDung.desc,
      judgment: evalData.judgment.judgment,
      totalScore: evalData.judgment.totalScore,
      isSuccess: evalData.judgment.isSuccess,
      dongHaos: goc.haos.filter(h => h.isDong).map(h => h.pos),
      dongEffects: evalData.dongEffects,
      ungKy: evalData.ungKy,
      haosOverview,
      allPhucThanList,
      allPhucThanSummary: allPhucThanList.length > 0 ? allPhucThanList.join('; ') : 'Quẻ có đầy đủ cả 5 Lục Thân, không có hào tàng phục.'
    };
  }

  // Lớp 2: Prompt Biên Tập & Soạn Lại Văn Phong Thuật Toán Offline
  // AI TUYỆT ĐỐI KHÔNG TỰ LUẬN GIẢI, CHỈ ĐÓNG VAI TRÒ BIÊN TẬP VIÊN TRAU CHUỐT NỘI DUNG TỪ BẢN GỐC THUẬT TOÁN
  function buildEditorialPolishPrompt(deterministicReportText, factSheet) {
    const dt = factSheet.dungThan;
    return `
BẠN LÀ MỘT BẬC THẦY TỔNG BIÊN TẬP VĂN BẢN KINH DỊCH & TRIẾT HỌC CỔ ĐIỂN UYÊN BÁC.
DƯỚI ĐÂY LÀ "TOÀN VĂN BẢN LUẬN GIẢI KINH DỊCH LỤC HÀO" ĐÃ ĐƯỢC THUẬT TOÁN XÁC ĐỊNH OFFLINE TÍNH TOÁN VÀ XUẤT RA CHÍNH XÁC 100%.

NHIỆM VỤ DUY NHẤT CỦA BẠN:
SOẠN LẠI, BIÊN TẬP LẠI VÀ TRAU CHUỐT TOÀN BỘ NỘI DUNG BẢN LUẬN GIẢI THUẬT TOÁN DƯỚI ĐÂY THÀNH MỘT BÀI VĂN XUÔI NGHỊ LUẬN TRIẾT HỌC HOÀN CHỈNH, MẠCH LẠC, TRANG NHÃ, LIỀN MẠCH VÀ GIÀU CHIỀU SÂU (ĐỘ DÀI KHOẢNG 1.200 - 1.800 TỪ).

[CÁC NGUYÊN TẮC BẤT BIẾN - STRICT GROUND-TRUTH & EDITORIAL RULES]:
1. TUYỆT ĐỐI KHÔNG TỰ LUẬN GIẢI: Bạn KHÔNG được tự ý sáng tác, suy đoán hay bịa thêm bất kỳ thông tin nào ngoài bản luận giải thuật toán gốc.
2. TRUNG THỰC 100% VỚI BẢN GỐC THUẬT TOÁN:
   - Giữ nguyên Quẻ Chính: "${factSheet.hexName}", Quẻ Biến: "${factSheet.bienHexName}".
   - Giữ nguyên Dụng Thần: [${dt.lucThan}] (${dt.chi} • Hành [${dt.element.toUpperCase()}]). TUYỆT ĐỐI KHÔNG đổi ngũ hành Dụng Thần sang bất kỳ hành nào khác!
   - Giữ nguyên Tình trạng Dụng Thần: ${dt.presenceType}.
   - Giữ nguyên Phán Quyết Cốt Lõi: [${factSheet.judgment}] (Điểm số: ${factSheet.totalScore}). Nếu quẻ Bất Lợi/Hung thì giữ nguyên, không được nịnh hót đảo ngược thành cát lợi.
   - Giữ nguyên toàn bộ các mốc thời gian Ứng Kỳ và lời khuyên hành động thực chiến từ bản gốc thuật toán.
3. KỶ LUẬT ĐỊNH DẠNG VĂN BẢN (ANTI-CLUTTER):
   - TUYỆT ĐỐI NGHIÊM CẤM DÙNG CODE BLOCK (dấu \`\`\` hoặc \`\`\`text, \`\`\`markdown). Toàn bộ bài viết BẮT BUỘC là văn bản Markdown thuần túy.
   - TUYỆT ĐỐI NGHIÊM CẤM VẼ BẢNG TEXT/ASCII HOẶC CHÉP LẠI BẢNG 6 HÀO THÔ (Giao diện người dùng đã có sẵn 2 bảng nạp giáp ở trên).
   - TUYỆT ĐỐI NGHIÊM CẤM DÙNG ĐƯỜNG KẺ THÔ (==== hoặc ----).
4. PHƯƠNG PHÁP BIÊN TẬP NÂNG CAO:
   - Chuyển hóa toàn bộ các gạch đầu dòng khô khan của bản gốc thuật toán thành các đoạn văn xuôi mượt mà, sâu sắc, lập luận chặt chẽ theo dòng chảy nhân quả.
   - Mỗi phần đề mục giữ nguyên cấu trúc rõ ràng, sử dụng các tiêu đề ## chuẩn mực:

## I. TỔNG QUAN BÀN QUẺ & PHÁN QUYẾT CỐT LÕI
(Biên tập lại từ Phần I & II của thuật toán: Luận giải quẻ khí, tượng quẻ, hoàn cảnh người hỏi "${factSheet.question}" và phán quyết dứt khoát.)

## II. DỤNG THẦN CHUYÊN KHẢO & CÂN LỰC KHÍ SỐ
(Biên tập lại từ Phần III & IV của thuật toán: Luận giải vị thế Dụng Thần ${dt.lucThan} ${dt.can}-${dt.chi} hành ${dt.element.toUpperCase()}, vượng suy theo Nhật Nguyệt, tình trạng chính thần hoặc phục thần.)

## III. HỆ THỐNG TỨ THẦN TRỢ KHÍ (NGUYÊN, KỴ, CỪU, TIẾT)
(Biên tập lại tương quan lực lượng giữa Nguyên Thần sinh trợ và Kỵ Thần khắc hại theo thuật toán.)

## IV. TÂM PHÁP HÀO THẾ & CỤC DIỆN THẾ - DỤNG
(Biên tập lại từ Phần V của thuật toán: Tâm thế của đương số tại Hào Thế và tương quan Thế - Dụng.)

## V. ĐỘNG THÁI BIẾN HÓA & TIẾN TRÌNH NHÂN QUẢ
(Biên tập lại chiều hướng phát động biến hóa của các hào hoặc sự an định tích lũy của quẻ tĩnh theo thuật toán.)

## VI. ĐỊNH THỜI ĐIỂM ỨNG KỲ
(Biên tập lại các mốc thời gian ngày/tháng cụ thể theo thuật toán xác định: ${factSheet.ungKy.join('; ')}.)

## VII. PHONG THỦY GIA TRẠCH & LỜI KHUYÊN DỊCH LÝ THỰC CHIẾN
(Biên tập lại chẩn đoán phong thủy 6 hào và lời khuyên hành vi thực tiễn từ bản thuật toán.)

[TOÀN VĂN BẢN LUẬN GIẢI THUẬT TOÁN OFFLINE GỐC CẦN BIÊN TẬP]:
${deterministicReportText}
`.trim();
  }

  // Lớp 4: Bộ Kiểm Toán Độc Lập Chống Ảo Giác (Factual Consistency Verifier)
  function verifyFactualConsistency(factSheet, generatedText) {
    const errors = [];
    const textLower = generatedText.toLowerCase();
    const dt = factSheet.dungThan;
    const dtClean = factSheet.targetLucThan.toLowerCase();

    // 1. Kiểm tra Tên Quẻ Chính
    const hexClean = factSheet.hexName.toLowerCase().replace('bát thuần ', '').trim();
    if (!textLower.includes(hexClean)) {
      errors.push(`Văn bản không nhắc đúng tên Quẻ Chính (${factSheet.hexName})`);
    }

    // 2. Kiểm tra Dụng Thần
    if (!textLower.includes(dtClean)) {
      errors.push(`Văn bản không phân tích đúng Dụng Thần (${factSheet.targetLucThan})`);
    }

    // 3. KIỂM TRA KHÓA NGŨ HÀNH DỤNG THẦN (CHỐNG ẢO GIÁC NGŨ HÀNH)
    const dtElm = (dt.element || '').toLowerCase();
    if (dtElm) {
      const otherElms = ['kim', 'mộc', 'thủy', 'hỏa', 'thổ'].filter(e => e !== dtElm);
      for (const badElm of otherElms) {
        // Bắt lỗi nếu gán ngũ hành sai: ví dụ "thê tài.*(thuộc hành|là hành|hành|mạng)\\s*kim" khi dtElm là 'mộc'
        const reg = new RegExp(`(${dtClean})[^.!?\\n]{0,60}(thuộc\\s*hành|là\\s*hành|hành|mạng|mệnh)\\s*${badElm}`, 'i');
        if (reg.test(textLower)) {
          errors.push(`AI gán sai ngũ hành cho Dụng Thần (Dụng Thần [${factSheet.targetLucThan}] mang ngũ hành [${dt.element.toUpperCase()}], nhưng văn bản lại viết là hành [${badElm.toUpperCase()}])`);
          break;
        }
      }
    }

    // 4. KIỂM TRA TÌNH TRẠNG PHỤC THẦN
    if (!dt.isPhuc) {
      // Nếu Dụng thần hiện diện minh bạch nhưng AI lại nói là tàng phục
      if (textLower.includes(`${dtClean} là hào tàng phục`) || textLower.includes(`${dtClean} tàng phục dưới`) || textLower.includes(`dụng thần tàng phục dưới`)) {
        errors.push(`Dụng Thần hiện diện minh bạch tại Hào ${dt.pos} nhưng AI lại nhầm lẫn là hào tàng phục`);
      }
    }

    // 5. Kiểm tra Đảo Ngược Phán Quyết (Polarity Inversion)
    if (factSheet.isSuccess === false) {
      const positiveWords = ['đại cát đại lợi', 'chắc chắn thành công', 'vô cùng thuận lợi', 'tiền tài bội thu', 'thắng lợi trọn vẹn'];
      for (const pw of positiveWords) {
        if (textLower.includes(pw)) {
          errors.push(`Phát hiện Đảo Ngược Phán Quyết (Quẻ Hung/Bất lợi nhưng AI dùng từ nịnh hót '${pw}')`);
          break;
        }
      }
    } else if (factSheet.isSuccess === true) {
      const negativeWords = ['đại hung', 'tổn thất nặng nề', 'hoàn toàn vô vọng', 'thất bại thảm hại'];
      for (const nw of negativeWords) {
        if (textLower.includes(nw)) {
          errors.push(`Phát hiện Đảo Ngược Phán Quyết (Quẻ Cát nhưng AI dùng từ dọa nạt '${nw}')`);
          break;
        }
      }
    }

    // 6. Kiểm tra Hào Động Bịa Đặt
    if (factSheet.dongHaos.length === 0) {
      if (textLower.includes('hào phát động') || textLower.includes('hào động biến')) {
        errors.push('Quẻ Tĩnh nhưng AI bịa đặt có hào phát động');
      }
    }

    // 7. KIỂM TRA CODE BLOCK & ĐƯỜNG KẺ THÔ
    if (generatedText.includes('```') || textLower.includes('```text') || textLower.includes('```markdown') || generatedText.includes('=====')) {
      errors.push('Văn bản chứa khối code block (```) hoặc đường kẻ thô vi phạm quy chuẩn thẩm mỹ');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // =========================================================================
  // 6. API ĐIỀU PHỐI ĐẦU CUỐI (FACADE API)
  // =========================================================================

  /**
   * Phân tích và sinh bài luận giải từ đối tượng kết quả quẻ có sẵn
   */
  async function interpretHexagram(queResult, options = {}) {
    const topicKey = options.topicKey || 'cautai';
    const customQuestion = options.customQuestion || '';
    const useAI = options.useAI === true;

    // 1. Chạy động cơ suy luận 8 bước
    const evalData = evaluate8Steps(queResult, topicKey, customQuestion);

    // 2. Sinh sẵn Bản Luận Giải Thuần Quy Tắc (100% Xác Định)
    const deterministicText = generateDeterministicReport(evalData, queResult);
    const factSheet = createGroundTruthFactSheet(evalData, queResult);

    // Nếu không yêu cầu AI hoặc không có service Gemini -> Trả về bản Quy Tắc ngay lập tức (0ms)
    if (!useAI || !global.NetaGeminiService) {
      return {
        source: 'deterministic',
        verified: true,
        aiUsed: false,
        reportText: deterministicText,
        evaluation: evalData,
        factSheet
      };
    }

    // Nếu yêu cầu AI -> Kích hoạt Rào chắn 4 Lớp
    try {
      const apiKey = global.NetaGeminiService.getActiveKey?.();
      if (!apiKey) {
        return {
          source: 'deterministic_no_key',
          verified: true,
          aiUsed: false,
          warning: 'Chưa cài đặt Khóa API Gemini, đã tự động chuyển sang Bản Luận Giải Quy Tắc.',
          reportText: deterministicText,
          evaluation: evalData,
          factSheet
        };
      }

      const idxV = deterministicText.search(/\n(?=(?:##\s+)?V\.\s+)/i);
      let rawAiText = '';
      let usedModel = 'gemini-cascade';

      if (idxV !== -1 && typeof global.NetaGeminiService.polishReportInChunks === 'function') {
        const part1Text = deterministicText.substring(0, idxV).trim();
        const part2Text = deterministicText.substring(idxV).trim();

        const chunks = [
          {
            title: "Phần 1/2: Khí Vận Bàn Quẻ, Dụng Thần & Cân Lực Tứ Thần",
            content: part1Text,
            sysInstruction: `Bạn là Bậc Thầy Tổng Biên Tập Kinh Dịch Lục Hào & Triết học cổ điển uyên bác. Hãy trau chuốt, biên tập lại các Mục I, II, III, IV từ bản thuật toán gốc một cách sâu sắc, giàu chất văn học và truyền cảm hứng.
BẮT BUỘC 100% GIỮ NGUYÊN TÊN GỌI VÀ SỐ THỨ TỰ CỦA CÁC MỤC:
## I. TỔNG QUAN BÀN QUẺ & PHÁN QUYẾT CỐT LÕI
## II. DỤNG THẦN CHUYÊN KHẢO & CÂN LỰC KHÍ SỐ
## III. HỆ THỐNG TỨ THẦN TRỢ KHÍ (NGUYÊN, KỴ, CỪU, TIẾT)
## IV. CHUYÊN ĐỀ HÀO TÀNG PHỤC (PHỤC THẦN KHẢO LUẬN)
${factSheet.question ? `Ánh xạ sâu sắc với sự vụ người hỏi: "${factSheet.question}".` : ''}
TUYỆT ĐỐI KHÔNG TỰ BỎ MỤC, KHÔNG TÓM TẮT RÚT GỌN, KHÔNG DÙNG TỪ NGỮ QUẢNG CÁO.`
          },
          {
            title: "Phần 2/2: Hào Thế Biến Hóa, Ứng Kỳ & Lời Khuyên Thực Chiến",
            content: part2Text,
            sysInstruction: `Bạn là Bậc Thầy Tổng Biên Tập Kinh Dịch Lục Hào & Triết học cổ điển uyên bác. Hãy trau chuốt, biên tập lại các Mục V, VI, VII, VIII từ bản thuật toán gốc một cách sâu sắc, giàu chất văn học và truyền cảm hứng.
BẮT BUỘC 100% GIỮ NGUYÊN TÊN GỌI VÀ SỐ THỨ TỰ CỦA CÁC MỤC:
## V. TÂM PHÁP HÀO THẾ & TIẾN TRÌNH NHÂN QUẢ
## VI. ĐỊNH THỜI ĐIỂM ỨNG KỲ
## VII. PHONG THỦY GIA TRẠCH 6 HÀO
## VIII. LỜI KHUYÊN DỊCH LÝ THỰC CHIẾN
${factSheet.question ? `Ánh xạ sâu sắc với sự vụ người hỏi: "${factSheet.question}".` : ''}
TUYỆT ĐỐI KHÔNG TỰ BỎ MỤC, KHÔNG TÓM TẮT RÚT GỌN, KHÔNG DÙNG TỪ NGỮ QUẢNG CÁO.`
          }
        ];

        try {
          rawAiText = await global.NetaGeminiService.polishReportInChunks(chunks, {
            onProgress: options.onProgress,
            temperature: 0.35,
            maxOutputTokens: 8192,
            apiKey
          });
          usedModel = (global.NetaGeminiService.getActiveModelName && global.NetaGeminiService.getActiveModelName()) || 'gemini-cascade';
        } catch (err) {
          console.warn('Luc Hao chunked polishing fallback to single call:', err);
        }
      }

      if (!rawAiText) {
        const prompt = buildEditorialPolishPrompt(deterministicText, factSheet);
        const aiResult = await global.NetaGeminiService.callGeminiCascade(prompt, apiKey, {
          temperature: 0.35,
          maxOutputTokens: 8192,
          timeoutMs: 60000
        });
        rawAiText = aiResult?.text || '';
        usedModel = aiResult?.model || usedModel;
      }

      if (rawAiText) {
        let cleanedText = rawAiText.trim();

        // 1. Loại bỏ các khối code block thừa ```text ... ``` và bảng thô
        cleanedText = cleanedText.replace(/```(?:text|markdown)?[^\n]*\n?([\s\S]*?)```/g, (match, p1) => {
          return p1.split('\n').filter(line => {
            const tr = line.trim();
            if (tr.match(/^[=\-~_]{3,}$/)) return false;
            if (tr.match(/^QUẺ CHÍNH:.*QUẺ BIẾN:/i)) return false;
            if (tr.match(/^Hào\s+[1-6]:\s*\[/i)) return false;
            if (tr.match(/\|\s*Hào\s+[1-6]:/i)) return false;
            return true;
          }).join('\n');
        });
        cleanedText = cleanedText.replace(/```[a-zA-Z]*/g, '').replace(/```/g, '');
        cleanedText = cleanedText.replace(/^[=\-~_]{3,}\s*$/gm, '');

        // 2. Loại bỏ các dòng rác lặp lại danh sách hào nếu nằm ngoài code block
        cleanedText = cleanedText.split('\n').filter(line => {
          const tr = line.trim();
          if (tr.match(/^QUẺ CHÍNH:.*QUẺ BIẾN:/i)) return false;
          if (tr.match(/^Hào\s+[1-6]:\s*\[.*\]\s+.*\|\s+Hào\s+[1-6]:/i)) return false;
          return true;
        }).join('\n').trim();

        // 3. Kiểm toán độc lập qua Verifier
        const audit = verifyFactualConsistency(factSheet, cleanedText);
        if (audit.isValid) {
          return {
            source: 'gemini_verified',
            verified: true,
            aiUsed: true,
            model: aiResult.model,
            reportText: cleanedText,
            evaluation: evalData,
            factSheet
          };
        } else {
          // PHÁT HIỆN ẢO GIÁC: Tự động kích hoạt Fallback bảo vệ người dùng!
          console.warn('⚠️ Phát hiện ảo giác Gemini, đã kích hoạt Fallback:', audit.errors);
          const fallbackAnnotated = `> ⚠️ [LƯU Ý BẢO MẬT DỊCH LÝ]:\n> Hệ thống phát hiện mô hình AI có dấu hiệu sai lệch dữ liệu (${audit.errors.join('; ')}).\n> Đã tự động kích hoạt BẢN LUẬN GIẢI THUẦN QUY TẮC 100% XÁC ĐỊNH để bảo toàn độ chính xác tuyệt đối.\n\n` + deterministicText;
          return {
            source: 'safety_fallback',
            verified: true,
            aiUsed: false,
            hallucinationDetected: true,
            errors: audit.errors,
            reportText: fallbackAnnotated,
            evaluation: evalData,
            factSheet
          };
        }
      } else {
        throw new Error(aiResult?.error || 'Không nhận được phản hồi từ AI');
      }
    } catch (err) {
      console.warn('⚠️ Lỗi gọi Gemini, fallback sang Quy Tắc:', err.message);
      return {
        source: 'api_fallback',
        verified: true,
        aiUsed: false,
        warning: `Kết nối AI gián đoạn (${err.message}). Đã xuất bản luận giải quy tắc xác định.`,
        reportText: deterministicText,
        evaluation: evalData,
        factSheet
      };
    }
  }

  // Export module API ra global window
  const NetaLucHaoInterpreter = {
    TOPIC_PRESETS,
    tinhCanLucHao,
    evaluate8Steps,
    generateDeterministicReport,
    createGroundTruthFactSheet,
    buildEditorialPolishPrompt,
    buildAntiHallucinationPrompt: buildEditorialPolishPrompt,
    verifyFactualConsistency,
    interpretHexagram
  };

  global.NetaLucHaoInterpreter = NetaLucHaoInterpreter;

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
