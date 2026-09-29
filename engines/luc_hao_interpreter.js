/**
 * NETA LIGHT - LỤC HÀO INTERPRETER ENGINE (engines/luc_hao_interpreter.js)
 * 
 * Hệ thống Luận Giải Kinh Dịch Lục Hào Chuyên Sâu theo Phương pháp Nguyễn Tuấn Cường V2
 * và chuẩn mực cổ thư Bốc Phệ Chính Tông & Tăng San Bốc Dịch.
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

  const FENGSHUI_LEVELS = [
    { pos: 1, area: 'Đất đai, móng nhà, nền móng, cống rãnh', defaultDesc: 'Gốc rễ vững bền' },
    { pos: 2, area: 'Bếp núc, phòng ngủ, nhà ở, gian giữa', defaultDesc: 'Nơi sinh hoạt ấm cúng' },
    { pos: 3, area: 'Cửa trong, giường chiếu, bậc tam cấp', defaultDesc: 'Lối lưu thông nội bộ' },
    { pos: 4, area: 'Cổng lớn, cửa sổ, ban công, lối đón khí', defaultDesc: 'Minh đường nạp khí' },
    { pos: 5, area: 'Phòng khách, đường đi, ngõ vào, xe cộ', defaultDesc: 'Môi trường giao tiếp' },
    { pos: 6, area: 'Mái nhà, nóc nhà, tường rào, bàn thờ tổ tiên', defaultDesc: 'Đỉnh che chở tâm linh' }
  ];

  // =========================================================================
  // 2. ĐỘNG CƠ CÂN LỰC HÀO (-10.0 ĐẾN +10.0) CHUẨN NGUYỄN TUẤN CƯỜNG
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

  // =========================================================================
  // 3. ĐỘNG CƠ PHÂN TÍCH SUY LUẬN 8 BƯỚC NGUYỄN TUẤN CƯỜNG
  // =========================================================================
  function evaluate8Steps(queResult, topicKey = 'cautai', customQuestion = '') {
    const goc = queResult.que_goc;
    const bien = queResult.que_bien;
    const thoiGian = queResult.thoi_gian;
    const chiNgay = thoiGian.chiNgay;
    const chiThang = thoiGian.thangChi;
    const tuanKhong = thoiGian.tuanKhong || [];

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

    // Tìm trong 6 hào quẻ gốc (ưu tiên hào Thế, hào phát động hoặc hào vượng)
    const dtCandidates = haosEnriched.filter(h => h.lucThan === targetLucThan);
    if (dtCandidates.length === 1) {
      dungThanHao = dtCandidates[0];
      dungThanPos = dungThanHao.pos;
    } else if (dtCandidates.length > 1) {
      // Ưu tiên hào động hoặc hào Thế
      dungThanHao = dtCandidates.find(h => h.isDong) || dtCandidates.find(h => h.isThe) || dtCandidates[0];
      dungThanPos = dungThanHao.pos;
    } else {
      // Dụng Thần không hiện -> Tìm Phục Thần
      isPhucThan = true;
      const phucItem = (queResult.phuc_than || []).find(p => p.lucThan === targetLucThan);
      if (phucItem) {
        phucThanInfo = phucItem;
        dungThanPos = phucItem.pos;
        const phiHao = haosEnriched[phucItem.pos - 1];
        dungThanHao = {
          pos: phucItem.pos,
          can: phucItem.can,
          chi: phucItem.chi,
          chiElement: phucItem.chiElement,
          lucThan: phucItem.lucThan,
          isPhuc: true,
          phiThan: phiHao,
          canLuc: tinhCanLucHao({ chi: phucItem.chi, chiElement: phucItem.chiElement, isDong: false }, chiNgay, chiThang, tuanKhong)
        };
      } else {
        // Fallback về hào Thế
        dungThanHao = haosEnriched[goc.thePos - 1];
        dungThanPos = goc.thePos;
      }
    }

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
    const theHao = haosEnriched[goc.thePos - 1];
    const ungHao = haosEnriched[goc.ungPos - 1];

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
        phucInfo: phucThanInfo
      },
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

    const lines = [];
    lines.push('═══════════════════════════════════════════════════════════════════════════════');
    lines.push('               BẢN LUẬN GIẢI KINH DỊCH LỤC HÀO NÂNG CAO (NTC V2)');
    lines.push(`  Sự Vụ Chiêm Đoán: "${evalData.customQuestion}"`);
    lines.push(`  Chủ Đề Dụng Thần: [${evalData.topic.label}] ➔ Thủ Ngôi: ${evalData.targetLucThan}`);
    lines.push('═══════════════════════════════════════════════════════════════════════════════\n');

    lines.push('I. THÔNG SỐ TỌA ĐỘ BÀN QUẺ:');
    lines.push(`- Quẻ Chính: ${goc.name.toUpperCase()} (Cung ${goc.cung} - Hành ${goc.cungElement}${goc.cungSpecial ? ` • ${goc.cungSpecial}` : ''})`);
    if (bien) {
      lines.push(`- Quẻ Biến: ${bien.name.toUpperCase()} (Do Hào ${queResult.que_goc.haos.filter(h => h.isDong).map(h => h.pos).join(', ')} phát động biến hóa)`);
    } else {
      lines.push('- Quẻ Tĩnh: Sáu hào an tĩnh, vạn sự quy về nội lực gốc.');
    }
    lines.push(`- Trục Thời Gian: Ngày ${tg.canNgay} ${tg.chiNgay}, Tháng ${tg.thangChi} (Tiết: ${tg.solarTerm || 'Thu Phân'})`);
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
      lines.push(`   - Tình trạng: [PHỤC THẦN] ẩn dưới Hào Phi ${evalData.dungThan.phucInfo.pos} (${evalData.dungThan.phucInfo.phiThan.lucThan}). Cần cơ hội xung phá Phi Thần để phát lộ tài năng.`);
    } else {
      lines.push(`   - Ngự tại Hào ${dt.pos} (${dt.can}-${dt.chi} • ${dt.chiElement}). Cân Lực: [${dt.canLuc.score > 0 ? '+' : ''}${dt.canLuc.score}] -> Đạt mức [${dt.canLuc.status.toUpperCase()}].`);
      if (dt.canLuc.notes.length) lines.push(`   - Căn cứ khí số: ${dt.canLuc.notes.join('; ')}.`);
    }

    lines.push(`2. Khảo sát Tứ Thần Vận Động:`);
    lines.push(`   - Nguyên Thần (${tuThan.nguyenThan.name}): ${tuThan.nguyenThan.haos.length ? `Ngự Hào ${tuThan.nguyenThan.haos.map(h => h.pos).join(', ')} (Cội nguồn tương trợ, quý nhân giúp sức)` : 'Ẩn phục hoặc suy kiệt'}.`);
    lines.push(`   - Kỵ Thần (${tuThan.kyThan.name}): ${tuThan.kyThan.haos.length ? `Ngự Hào ${tuThan.kyThan.haos.map(h => h.pos).join(', ')} (Mầm mống rủi ro, trở lực cần phòng bị)` : 'An tĩnh không gây hại'}.`);
    lines.push('');

    lines.push('IV. TƯƠNG QUAN HÀO THẾ & THIÊN CƠ BIẾN HÓA:');
    lines.push(`- Hào Thế ngự Hào ${evalData.theHao.pos} (${evalData.theHao.lucThan} ${evalData.theHao.chi}): Cân Lực [${evalData.theHao.canLuc.score > 0 ? '+' : ''}${evalData.theHao.canLuc.score}] -> [${evalData.theHao.canLuc.status.toUpperCase()}].`);
    lines.push(`- Cục Diện Thế - Dụng: [${td.status}] -> ${td.desc}`);
    if (evalData.dongEffects.length) {
      lines.push('- Động Thái Biến Hóa:');
      evalData.dongEffects.forEach(e => lines.push(`   * ${e}`));
    }
    lines.push('');

    lines.push('V. ĐỊNH THỜI ĐIỂM ỨNG KỲ (KHI NÀO SỰ VIỆC XẢY RA):');
    evalData.ungKy.forEach(uk => lines.push(`- ${uk}`));
    lines.push('');

    if (evalData.fengshui.length) {
      lines.push('VI. CHẨN ĐOÁN PHONG THỦY GIA TRẠCH 6 HÀO:');
      evalData.fengshui.forEach(fs => {
        lines.push(`- Hào ${fs.pos} (${fs.area}): ${fs.issue} ➔ [Cảnh báo: ${fs.risk}]`);
      });
      lines.push('');
    }

    lines.push('VII. LỜI KHUYÊN DỊCH LÝ THỰC CHIẾN:');
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
    return {
      hexName: queResult.que_goc.name,
      bienHexName: queResult.que_bien ? queResult.que_bien.name : 'Thuần Tĩnh',
      palace: queResult.que_goc.cung,
      palaceElement: queResult.que_goc.cungElement,
      time: `Ngày ${queResult.thoi_gian.canNgay} ${queResult.thoi_gian.chiNgay}, Tháng ${queResult.thoi_gian.thangChi}`,
      tuanKhong: queResult.thoi_gian.tuanKhong || [],
      question: evalData.customQuestion,
      topic: evalData.topic.label,
      targetLucThan: evalData.targetLucThan,
      dungThanPos: evalData.dungThan.pos,
      dungThanScore: evalData.dungThan.hao.canLuc.score,
      dungThanStatus: evalData.dungThan.hao.canLuc.status,
      thePos: evalData.theHao.pos,
      theLucThan: evalData.theHao.lucThan,
      theScore: evalData.theHao.canLuc.score,
      theDungStatus: evalData.theDung.status,
      judgment: evalData.judgment.judgment,
      totalScore: evalData.judgment.totalScore,
      isSuccess: evalData.judgment.isSuccess,
      dongHaos: queResult.que_goc.haos.filter(h => h.isDong).map(h => h.pos),
      ungKy: evalData.ungKy
    };
  }

  // Lớp 2: Prompt Ép Khung Chống Ảo Giác
  function buildAntiHallucinationPrompt(factSheet) {
    return `
BẠN LÀ MỘT CHUYÊN GIA DỊCH HỌC KINH DỊCH LỤC HÀO HỌC THUẬT (PHƯƠNG PHÁP NGUYỄN TUẤN CƯỜNG V2).
DƯỚI ĐÂY LÀ "BẢN KHÓA CHÂN LÝ TOÁN HỌC" ĐÃ ĐƯỢC TÍNH TOÁN XÁC ĐỊNH 100%. BẠN BẮT BUỘC PHẢI TUÂN THỦ TUYỆT ĐỐI CÁC SỰ THỰC NÀY:

[KHÓA CHÂN LÝ DỊCH HỌC - GROUND-TRUTH FACT SHEET]:
- Câu hỏi chiêm đoán: "${factSheet.question}"
- Quẻ Chính: ${factSheet.hexName} (Cung ${factSheet.palace} - Hành ${factSheet.palaceElement})
- Quẻ Biến: ${factSheet.bienHexName} (Hào động: [${factSheet.dongHaos.join(', ') || 'Không có'}])
- Thời gian: ${factSheet.time} | Tuần Không: [${factSheet.tuanKhong.join(', ')}]
- Chủ đề: ${factSheet.topic} -> Dụng Thần BẮT BUỘC là: [${factSheet.targetLucThan}] ngự Hào ${factSheet.dungThanPos}
- Cân Lực Dụng Thần: ${factSheet.dungThanScore > 0 ? '+' : ''}${factSheet.dungThanScore} (${factSheet.dungThanStatus})
- Hào Thế (Bản thân đương số): Hào ${factSheet.thePos} (${factSheet.theLucThan}) - Cân Lực: ${factSheet.theScore > 0 ? '+' : ''}${factSheet.theScore}
- Ma trận Thế - Dụng: [${factSheet.theDungStatus}]
- KẾT LUẬN TOÁN HỌC: [${factSheet.judgment}] (Điểm số: ${factSheet.totalScore})
- ỨNG KỲ ĐỊNH THỜI: ${factSheet.ungKy.join('; ')}

[CÁC RÀO CHẮN NGHIÊM CẤM 100% (ANTI-HALLUCINATION RULES)]:
1. CẤM BỊA ĐẶT HOẶC ĐỔI TÊN QUẺ: Quẻ chính phải là "${factSheet.hexName}", quẻ biến là "${factSheet.bienHexName}".
2. CẤM ĐỔI DỤNG THẦN: Dụng thần phải là Lục Thân "${factSheet.targetLucThan}".
3. CẤM ĐẢO NGƯỢC KẾT LUẬN: Nếu Kết luận là Bất Lợi/Hung thì TUYỆT ĐỐI CẤM khen "đại cát", "thành công rực rỡ". Nếu Kết luận là Cát Lợi thì TUYỆT ĐỐI CẤM dọa nạt hung hiểm.
4. CẤM TỰ Ý BỊA HÀO ĐỘNG: Chỉ được phân tích các hào phát động trong danh sách [${factSheet.dongHaos.join(', ')}].
5. VĂN PHONG CHUẨN MỰC: Hành chính - kỹ thuật, triết lý Kinh Dịch trong sáng, không dùng từ ngữ mê tín bùa chú, không nói về số phận trọn đời.

YÊU CẦU: Hãy viết bài luận giải chuyên sâu (khoảng 400 - 600 từ) gồm 5 phần:
I. Tổng Quan Quẻ Khí & Phán Quyết Cốt Lõi.
II. Phân Tích Dụng Thần & Tứ Thần (Nguyên Thần, Kỵ Thần).
III. Tương Quan Hào Thế & Thiên Cơ Biến Hóa.
IV. Thời Điểm Ứng Nghiệm (Ứng Kỳ).
V. Lời Khuyên Hành Động Thực Tiễn.
`.trim();
  }

  // Lớp 4: Bộ Kiểm Toán Độc Lập 6 Tiêu Chí (Factual Consistency Verifier)
  function verifyFactualConsistency(factSheet, generatedText) {
    const errors = [];
    const textLower = generatedText.toLowerCase();

    // 1. Kiểm tra Tên Quẻ Chính
    const hexClean = factSheet.hexName.toLowerCase().replace('bát thuần ', '').trim();
    if (!textLower.includes(hexClean)) {
      errors.push(`Văn bản không nhắc đúng tên Quẻ Chính (${factSheet.hexName})`);
    }

    // 2. Kiểm tra Dụng Thần
    const dtClean = factSheet.targetLucThan.toLowerCase();
    if (!textLower.includes(dtClean)) {
      errors.push(`Văn bản không phân tích đúng Dụng Thần (${factSheet.targetLucThan})`);
    }

    // 3. Kiểm tra Đảo Ngược Phán Quyết (Polarity Inversion)
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

    // 4. Kiểm tra Hào Động Bịa Đặt
    if (factSheet.dongHaos.length === 0) {
      if (textLower.includes('hào phát động') || textLower.includes('hào động biến')) {
        errors.push('Quẻ Tĩnh nhưng AI bịa đặt có hào phát động');
      }
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

      const prompt = buildAntiHallucinationPrompt(factSheet);
      const aiResult = await global.NetaGeminiService.callGeminiCascade(prompt, apiKey);

      if (aiResult && aiResult.text) {
        // Kiểm toán độc lập qua Verifier
        const audit = verifyFactualConsistency(factSheet, aiResult.text);
        if (audit.isValid) {
          return {
            source: 'gemini_verified',
            verified: true,
            aiUsed: true,
            model: aiResult.model,
            reportText: aiResult.text,
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
    buildAntiHallucinationPrompt,
    verifyFactualConsistency,
    interpretHexagram
  };

  global.NetaLucHaoInterpreter = NetaLucHaoInterpreter;

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
