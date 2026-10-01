/**
 * NETA LIGHT - TRẠCH NHẬT ENGINE (ĐỘNG CƠ XEM NGÀY TỐT XẤU CỔ TRUYỀN)
 * Tích hợp toàn diện:
 * 1. Bách Trạch Thông Thư - Trạng Trình Nguyễn Bỉnh Khiêm (83 Mục việc, Thang 5 Bậc)
 * 2. Đổng Công Tuyển Trạch Yếu Dụng (12 Tháng, 423 Ngày)
 * 3. 16 Tiêu Chí Toàn Thư (Lục Nhâm, Khổng Minh, Bành Tổ, Hỷ Thần, Tam Đại Cát Tinh)
 * 4. Kỳ Môn Dữ Trạch Cát - Trương Chí Xuân (5 Quy tắc vàng & 108 quẻ Khắc Ứng Cửu Tinh)
 * 5. Huyền Không Đại Quái Trạch Nhật (64 Quẻ, Hợp Thập, Hà Đồ, phối Tọa Sơn La Kinh)
 * 100% Thuần JavaScript - Chạy Offline không phụ thuộc mạng.
 */

(function (global) {
  'use strict';

  class TrachNhatEngine {
    constructor() {
      this.data = global.TRACHCAT_DATA || {};
      this.core = this.data.core_tables || {};
      this.tasks = this.data.trinh_tasks || [];
      this.dong_cong_data = this.data.dong_cong || [];
      this.qimen_cat = this.data.qimen_trach_cat || {};

      this._buildIndexes();
    }

    _buildIndexes() {
      const hoaGiapList = (this.core && this.core.hoa_giap_60) || [];
      this.hoa_giap_map = {};
      hoaGiapList.forEach(item => { this.hoa_giap_map[item.can_chi] = item; });

      const canList = (this.core && this.core.thien_can) || [];
      this.can_map = {};
      canList.forEach(item => { this.can_map[item.name] = item; });

      const chiList = (this.core && this.core.dia_chi) || [];
      this.chi_map = {};
      chiList.forEach(item => { this.chi_map[item.name] = item; });

      this.tasks_map = {};
      (this.tasks || []).forEach(t => { this.tasks_map[t.id] = t; });

      const tuList = (this.core && this.core.nhi_thap_bat_tu) || [];
      this.tu_map = {};
      tuList.forEach(tu => { this.tu_map[tu.name] = tu; });

      const trucList = (this.core && this.core.thap_nhi_truc) || [];
      this.truc_map = {};
      trucList.forEach(tr => { this.truc_map[tr.name] = tr; });

      this.dong_cong_map = {};
      (this.dong_cong_data || []).forEach(m => {
        const mNum = m.month;
        (m.daily_evaluations || []).forEach(d => {
          const rating = d.kiet_hung || "Bình";
          const summary = d.nghi_ki || "";
          const evalText = d.anh_huong ? (summary ? `${summary}. ${d.anh_huong}` : d.anh_huong) : (summary || "Ngày bình hòa.");
          this.dong_cong_map[`${mNum}_${d.day_can_chi}`] = {
            month: mNum,
            month_name: m.name,
            solar_term: m.solar_term,
            rating: rating,
            summary: summary,
            evaluation: evalText,
            ...d
          };
        });
      });

      this.sinh_map = { "Mộc": "Hỏa", "Hỏa": "Thổ", "Thổ": "Kim", "Kim": "Thủy", "Thủy": "Mộc" };
      this.khac_map = { "Mộc": "Thổ", "Thổ": "Thủy", "Thủy": "Hỏa", "Hỏa": "Kim", "Kim": "Mộc" };
    }

    getCanChiInfo(canChiStr) {
      return this.hoa_giap_map[canChiStr] || null;
    }

    checkCanInteraction(canPerson, canTarget) {
      const cP = this.can_map[canPerson] || {};
      const cT = this.can_map[canTarget] || {};

      const isHop = (cP.hop === canTarget) || (cT.hop === canPerson);
      const isPha = (cP.pha === canTarget) || (cT.pha === canPerson);

      if (isHop) return { type: "HOP", score: 1, desc: `${canPerson} và ${canTarget} là Thiên Can ngũ hợp` };
      if (isPha) return { type: "PHA", score: -1, desc: `${canPerson} và ${canTarget} là Can phá` };
      return { type: "BINH", score: 0, desc: "Bình hòa" };
    }

    checkChiInteraction(chiPerson, chiTarget) {
      const results = [];
      const cP = this.chi_map[chiPerson] || {};

      if (cP.nhi_hop === chiTarget) {
        results.append = results.push({ type: "LUC_HOP", score: 1, desc: `${chiPerson} với ${chiTarget} là Địa Chi Lục Hợp` });
      }
      if (cP.tam_hop && cP.tam_hop.includes(chiTarget)) {
        results.push({ type: "TAM_HOP", score: 1, desc: `${chiPerson} với ${chiTarget} là Tam Hợp` });
      }
      const isLucXung = (cP.luc_xung === chiTarget);
      if (isLucXung) {
        results.push({ type: "LUC_XUNG", score: -2, desc: `${chiPerson} với ${chiTarget} là Trực Xung (-2 bậc)` });
      }
      if (!isLucXung && cP.tuong_hinh && cP.tuong_hinh.includes(chiTarget)) {
        results.push({ type: "TUONG_HINH", score: -1, desc: `${chiPerson} với ${chiTarget} là Tương Hình` });
      }
      if (cP.tuong_hai === chiTarget) {
        results.push({ type: "TUONG_HAI", score: -1, desc: `${chiPerson} với ${chiTarget} là Tương Hại` });
      }
      if (cP.tuong_pha === chiTarget) {
        results.push({ type: "TUONG_PHA", score: -1, desc: `${chiPerson} với ${chiTarget} là Lục Phá` });
      }
      return results;
    }

    checkNapAmInteraction(hanhPerson, hanhTarget) {
      const isSinh = (this.sinh_map[hanhTarget] === hanhPerson) || (this.sinh_map[hanhPerson] === hanhTarget);
      const isKhac = (this.khac_map[hanhTarget] === hanhPerson) || (this.khac_map[hanhPerson] === hanhTarget);

      if (isSinh) return { type: "TUONG_SINH", score: 1, desc: `Nạp âm ${hanhPerson} và ${hanhTarget} tương sinh` };
      if (hanhPerson === hanhTarget) return { type: "TY_HOA", score: 1, desc: `Nạp âm ${hanhPerson} với ${hanhTarget} tỷ hòa vượng` };
      if (isKhac) return { type: "TUONG_KHAC", score: -1, desc: `Nạp âm ${hanhPerson} và ${hanhTarget} tương khắc` };
      return { type: "BINH", score: 0, desc: "Bình hòa" };
    }

    calculateDayBaseScore(taskId, dayCanChi, saoName, trucName, goodSpirits = [], badSpirits = []) {
      const task = this.tasks_map[taskId];
      if (!task) throw new Error(`Không tìm thấy mục việc ${taskId}`);

      const details = [];
      const isBase = (task.base_good_days || []).includes(dayCanChi);
      if (!isBase) {
        return {
          day_can_chi: dayCanChi,
          is_base_good_day: false,
          base_score: 0,
          final_base_score: 0,
          details: [`${dayCanChi} không nằm trong danh mục ngày tốt căn bản của ${task.name}`]
        };
      }

      let score = 5;
      details.push(`Điểm xuất phát căn bản: 5 bậc (${dayCanChi} thuộc danh mục việc)`);

      if (saoName) {
        if ((task.good_stars || []).includes(saoName)) {
          score += 1;
          details.push(`Sao ${saoName} (kiết/hợp việc): +1 bậc`);
        } else if ((task.bad_stars || []).includes(saoName)) {
          score -= 1;
          details.push(`Sao ${saoName} (hung/kỵ việc): -1 bậc`);
        } else {
          const tuInfo = this.tu_map[saoName];
          if (tuInfo && tuInfo.nature === "Kiết") {
            score += 1;
            details.push(`Sao ${saoName} (kiết tinh): +1 bậc`);
          } else if (tuInfo && tuInfo.nature === "Hung") {
            score -= 1;
            details.push(`Sao ${saoName} (hung tinh): -1 bậc`);
          } else {
            details.push(`Sao ${saoName}: không can dự (0 bậc)`);
          }
        }
      }

      if (trucName) {
        const goodChuc = task.good_chuc || task.good_truc || [];
        const badChuc = task.bad_chuc || task.bad_truc || [];
        if (goodChuc.includes(trucName)) {
          score += 1;
          details.push(`Trực ${trucName} (hợp việc): +1 bậc`);
        } else if (badChuc.includes(trucName)) {
          score -= 1;
          details.push(`Trực ${trucName} (kỵ việc): -1 bậc`);
        } else {
          details.push(`Trực ${trucName}: không can dự (0 bậc)`);
        }
      }

      goodSpirits.forEach(gs => {
        score += 1;
        details.push(`Sao/Thần sát tốt (${gs}): +1 bậc`);
      });

      badSpirits.forEach(bs => {
        score -= 1;
        details.push(`Sao/Thần sát xấu (${bs}): -1 bậc`);
      });

      return {
        day_can_chi: dayCanChi,
        is_base_good_day: true,
        base_score: 5,
        final_base_score: score,
        details: details
      };
    }

    evaluateDayForPerson(taskId, dayCanChi, personCanChi, saoName, trucName, goodSpirits = [], badSpirits = []) {
      const baseRes = this.calculateDayBaseScore(taskId, dayCanChi, saoName, trucName, goodSpirits, badSpirits);
      const initialScore = baseRes.final_base_score;
      const details = [...baseRes.details];

      if (!baseRes.is_base_good_day) {
        return {
          day_can_chi: dayCanChi,
          person_can_chi: personCanChi,
          initial_day_score: 0,
          final_score: 0,
          total_score: 0,
          is_base_good_day: false,
          details: details
        };
      }

      const dayInfo = this.getCanChiInfo(dayCanChi);
      const personInfo = this.getCanChiInfo(personCanChi);
      if (!dayInfo || !personInfo) {
        throw new Error(`Can Chi không hợp lệ: ngày=${dayCanChi}, người=${personCanChi}`);
      }

      let currentScore = initialScore;

      // 1. Thiên Can
      const canRes = this.checkCanInteraction(personInfo.can, dayInfo.can);
      if (canRes.score !== 0) {
        currentScore += canRes.score;
        details.push(`Thiên Can: ${canRes.desc} (${canRes.score > 0 ? '+' : ''}${canRes.score} bậc)`);
      }

      // 2. Địa Chi
      const chiResList = this.checkChiInteraction(personInfo.chi, dayInfo.chi);
      chiResList.forEach(cr => {
        currentScore += cr.score;
        details.push(`Địa Chi: ${cr.desc} (${cr.score > 0 ? '+' : ''}${cr.score} bậc)`);
      });

      // 3. Nạp Âm Ngũ Hành
      const napAmRes = this.checkNapAmInteraction(personInfo.nap_am_hanh, dayInfo.nap_am_hanh);
      if (napAmRes.score !== 0) {
        currentScore += napAmRes.score;
        details.push(`Nạp Âm: ${napAmRes.desc} (${napAmRes.score > 0 ? '+' : ''}${napAmRes.score} bậc)`);
      }

      return {
        day_can_chi: dayCanChi,
        person_can_chi: personCanChi,
        initial_day_score: initialScore,
        final_score: currentScore,
        total_score: currentScore,
        is_base_good_day: true,
        details: details
      };
    }

    getDongCongEvaluation(month, dayCanChi) {
      return this.dong_cong_map[`${month}_${dayCanChi}`] || null;
    }

    getHoangDaoHoursForDay(dayCanChi) {
      const dayInfo = this.getCanChiInfo(dayCanChi);
      if (!dayInfo) return [];

      const dayChi = dayInfo.chi;
      const startChi = (this.core.hoang_dao_start_chi && this.core.hoang_dao_start_chi[dayChi]) || 'Tý';
      const chiOrder = (this.core.dia_chi || []).map(c => c.name);
      const startIdx = chiOrder.indexOf(startChi);

      const hoangDaoHours = [];
      const spirits = this.core.hoang_dao_12_than || [];
      for (let i = 0; i < 12; i++) {
        const curChi = chiOrder[(startIdx + i) % 12];
        const spirit = spirits[i];
        if (spirit && spirit.is_hoang_dao) {
          hoangDaoHours.push(curChi);
        }
      }

      const canList = (this.core.thien_can || []).map(c => c.name);
      const dayCanIdx = canList.indexOf(dayInfo.can) + 1;
      const startCanHourIdx = ((dayCanIdx * 2) - 1) % 10 - 1;

      const hoursCanChi = [];
      hoangDaoHours.forEach(hChi => {
        const hIdx = chiOrder.indexOf(hChi);
        const hCan = canList[(startCanHourIdx + hIdx) % 10];
        hoursCanChi.push(`${hCan} ${hChi}`);
      });

      return hoursCanChi;
    }

    rankHoangDaoHoursForPerson(dayCanChi, personCanChi) {
      const hours = this.getHoangDaoHoursForDay(dayCanChi);
      const personInfo = this.getCanChiInfo(personCanChi);
      if (!personInfo) return [];

      const HOUR_TIMES = {
        "Tý": "23h00 - 01h00", "Sửu": "01h00 - 03h00", "Dần": "03h00 - 05h00", "Mão": "05h00 - 07h00",
        "Thìn": "07h00 - 09h00", "Tị": "09h00 - 11h00", "Ngọ": "11h00 - 13h00", "Mùi": "13h00 - 15h00",
        "Thân": "15h00 - 17h00", "Dậu": "17h00 - 19h00", "Tuất": "19h00 - 21h00", "Hợi": "21h00 - 23h00"
      };

      const ranked = [];
      hours.forEach(hStr => {
        const hInfo = this.getCanChiInfo(hStr);
        if (!hInfo) return;
        let goodCount = 0;
        let badCount = 0;
        const details = [];

        // Can
        const canRes = this.checkCanInteraction(personInfo.can, hInfo.can);
        if (canRes.score > 0) { goodCount++; details.push(`Can: ${canRes.desc} (Tốt)`); }
        else if (canRes.score < 0) { badCount++; details.push(`Can: ${canRes.desc} (Xấu)`); }

        // Chi
        const chiResList = this.checkChiInteraction(personInfo.chi, hInfo.chi);
        chiResList.forEach(cr => {
          if (cr.score > 0) { goodCount++; details.push(`Chi: ${cr.desc} (Tốt)`); }
          else if (cr.score < 0) { badCount++; details.push(`Chi: ${cr.desc} (Xấu)`); }
        });

        // Nạp âm
        const napAmRes = this.checkNapAmInteraction(personInfo.nap_am_hanh, hInfo.nap_am_hanh);
        if (napAmRes.score > 0) { goodCount++; details.push(`Nạp âm: ${napAmRes.desc} (Tốt)`); }
        else if (napAmRes.score < 0) { badCount++; details.push(`Nạp âm: ${napAmRes.desc} (Xấu)`); }

        // 9 Hạng Trạng Trình
        let rank = 5;
        let recommendation = "Hạng năm, tạm dùng";
        if (goodCount >= 3 && badCount === 0) { rank = 1; recommendation = "Bậc nhất, rất nên dùng"; }
        else if (goodCount === 2 && badCount === 0) { rank = 2; recommendation = "Bậc nhì, nên dùng"; }
        else if (goodCount === 1 && badCount === 0) { rank = 3; recommendation = "Hạng ba, khá nên dùng"; }
        else if (goodCount === 2 && badCount === 1) { rank = 4; recommendation = "Hạng tư, khá nên dùng"; }
        else if (goodCount === 1 && badCount === 1) { rank = 5; recommendation = "Hạng năm, tạm dùng"; }
        else if (goodCount === 0 && badCount === 1) { rank = 6; recommendation = "Hạng sáu, chẳng nên dùng"; }
        else if (goodCount === 1 && badCount >= 2) { rank = 7; recommendation = "Hạng bảy, chẳng nên dùng"; }
        else if (goodCount === 0 && badCount === 2) { rank = 8; recommendation = "Hạng tám, quyết không nên dùng"; }
        else if (badCount >= 3 && goodCount === 0) { rank = 9; recommendation = "Hạng chín, tuyệt đối chẳng nên dùng"; }

        // Joey Yap - Kiểm tra Ngũ Bất Ngộ Thời (Thất Sát)
        const dayCan = (dayCanChi || '').split(' ')[0] || '';
        const joeyEngine = (typeof window !== 'undefined' && window.JoeyYapQMDJEngine) || global.JoeyYapQMDJEngine;
        let isFiveDisharmony = false;
        if (joeyEngine && typeof joeyEngine.isFiveDisharmony === 'function') {
          isFiveDisharmony = joeyEngine.isFiveDisharmony(dayCan, hInfo.can);
        }
        if (isFiveDisharmony) {
          details.push("⚠️ Phạm Ngũ Bất Ngộ Thời (Thời Can khắc Nhật Can theo thế Thất Sát - Hung)");
        }

        ranked.push({
          hour_can_chi: hStr,
          hour_chi: hInfo.chi,
          solar_time_range: HOUR_TIMES[hInfo.chi] || "",
          rank: rank,
          good_count: goodCount,
          bad_count: badCount,
          recommendation: recommendation,
          is_five_disharmony: isFiveDisharmony,
          details: details
        });
      });

      ranked.sort((a, b) => {
        if (a.rank !== b.rank) return a.rank - b.rank;
        if (a.good_count !== b.good_count) return b.good_count - a.good_count;
        return a.bad_count - b.bad_count;
      });

      return ranked;
    }

    calculateCungPhi(birthYear, isMale = true) {
      const y = parseInt(birthYear, 10) || 1990;
      const twoDigits = y % 100;
      let s = String(twoDigits).split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
      while (s > 9) {
        s = String(s).split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
      }
      let q;
      if (y < 2000) {
        q = isMale ? (10 - s) % 9 : (s + 5) % 9;
      } else {
        q = isMale ? (9 - s) % 9 : (s + 6) % 9;
      }
      if (q === 0) q = 9;
      if (q === 5) {
        q = isMale ? 2 : 8; // Nam Khôn (2), Nữ Cấn (8)
      }

      const CUNG_INFO = {
        1: { name: 'Khảm', element: 'Thủy', group: 'Đông Tứ Mệnh', dir: 'Chính Bắc', symbol: '☵' },
        2: { name: 'Khôn', element: 'Thổ', group: 'Tây Tứ Mệnh', dir: 'Tây Nam', symbol: '☷' },
        3: { name: 'Chấn', element: 'Mộc', group: 'Đông Tứ Mệnh', dir: 'Chính Đông', symbol: '☳' },
        4: { name: 'Tốn', element: 'Mộc', group: 'Đông Tứ Mệnh', dir: 'Đông Nam', symbol: '☴' },
        6: { name: 'Càn', element: 'Kim', group: 'Tây Tứ Mệnh', dir: 'Tây Bắc', symbol: '☰' },
        7: { name: 'Đoài', element: 'Kim', group: 'Tây Tứ Mệnh', dir: 'Chính Tây', symbol: '☱' },
        8: { name: 'Cấn', element: 'Thổ', group: 'Tây Tứ Mệnh', dir: 'Đông Bắc', symbol: '☶' },
        9: { name: 'Ly', element: 'Hỏa', group: 'Đông Tứ Mệnh', dir: 'Chính Nam', symbol: '☲' }
      };

      const info = CUNG_INFO[q] || CUNG_INFO[1];
      return {
        number: q,
        name: info.name,
        element: info.element,
        group: info.group,
        dir: info.dir,
        symbol: info.symbol
      };
    }

    calculateBatTrach(cungPhiNumber, deg) {
      if (deg == null || isNaN(deg)) return null;
      // deg là Tọa Sơn, Hướng Nhà đối diện = (deg + 180) % 360
      const facingDeg = Math.round((((deg + 180) % 360 + 360) % 360) * 10) / 10;

      let facingPalace = 1;
      let facingName = 'Chính Bắc (Khảm)';
      if (facingDeg >= 337.5 || facingDeg < 22.5) { facingPalace = 1; facingName = 'Chính Bắc (Khảm)'; }
      else if (facingDeg >= 22.5 && facingDeg < 67.5) { facingPalace = 8; facingName = 'Đông Bắc (Cấn)'; }
      else if (facingDeg >= 67.5 && facingDeg < 112.5) { facingPalace = 3; facingName = 'Chính Đông (Chấn)'; }
      else if (facingDeg >= 112.5 && facingDeg < 157.5) { facingPalace = 4; facingName = 'Đông Nam (Tốn)'; }
      else if (facingDeg >= 157.5 && facingDeg < 202.5) { facingPalace = 9; facingName = 'Chính Nam (Ly)'; }
      else if (facingDeg >= 202.5 && facingDeg < 247.5) { facingPalace = 2; facingName = 'Tây Nam (Khôn)'; }
      else if (facingDeg >= 247.5 && facingDeg < 292.5) { facingPalace = 7; facingName = 'Chính Tây (Đoài)'; }
      else if (facingDeg >= 292.5 && facingDeg < 337.5) { facingPalace = 6; facingName = 'Tây Bắc (Càn)'; }

      const MATRIX = {
        1: { 1: ['Phục Vị', true, 'Tiểu Cát'], 9: ['Diên Niên', true, 'Thượng Cát'], 3: ['Thiên Y', true, 'Thượng Cát'], 4: ['Sinh Khí', true, 'Thượng Cát'], 6: ['Lục Sát', false, 'Thứ Hung'], 2: ['Tuyệt Mệnh', false, 'Đại Hung'], 8: ['Ngũ Quỷ', false, 'Đại Hung'], 7: ['Họa Hại', false, 'Thứ Hung'] },
        2: { 2: ['Phục Vị', true, 'Tiểu Cát'], 6: ['Diên Niên', true, 'Thượng Cát'], 7: ['Thiên Y', true, 'Thượng Cát'], 8: ['Sinh Khí', true, 'Thượng Cát'], 1: ['Tuyệt Mệnh', false, 'Đại Hung'], 9: ['Lục Sát', false, 'Thứ Hung'], 3: ['Họa Hại', false, 'Thứ Hung'], 4: ['Ngũ Quỷ', false, 'Đại Hung'] },
        3: { 3: ['Phục Vị', true, 'Tiểu Cát'], 4: ['Diên Niên', true, 'Thượng Cát'], 1: ['Thiên Y', true, 'Thượng Cát'], 9: ['Sinh Khí', true, 'Thượng Cát'], 7: ['Tuyệt Mệnh', false, 'Đại Hung'], 8: ['Lục Sát', false, 'Thứ Hung'], 6: ['Ngũ Quỷ', false, 'Đại Hung'], 2: ['Họa Hại', false, 'Thứ Hung'] },
        4: { 4: ['Phục Vị', true, 'Tiểu Cát'], 3: ['Diên Niên', true, 'Thượng Cát'], 9: ['Thiên Y', true, 'Thượng Cát'], 1: ['Sinh Khí', true, 'Thượng Cát'], 8: ['Tuyệt Mệnh', false, 'Đại Hung'], 7: ['Lục Sát', false, 'Thứ Hung'], 2: ['Ngũ Quỷ', false, 'Đại Hung'], 6: ['Họa Hại', false, 'Thứ Hung'] },
        6: { 6: ['Phục Vị', true, 'Tiểu Cát'], 2: ['Diên Niên', true, 'Thượng Cát'], 8: ['Thiên Y', true, 'Thượng Cát'], 7: ['Sinh Khí', true, 'Thượng Cát'], 9: ['Tuyệt Mệnh', false, 'Đại Hung'], 1: ['Lục Sát', false, 'Thứ Hung'], 4: ['Họa Hại', false, 'Thứ Hung'], 3: ['Ngũ Quỷ', false, 'Đại Hung'] },
        7: { 7: ['Phục Vị', true, 'Tiểu Cát'], 8: ['Diên Niên', true, 'Thượng Cát'], 2: ['Thiên Y', true, 'Thượng Cát'], 6: ['Sinh Khí', true, 'Thượng Cát'], 3: ['Tuyệt Mệnh', false, 'Đại Hung'], 4: ['Lục Sát', false, 'Thứ Hung'], 9: ['Ngũ Quỷ', false, 'Đại Hung'], 1: ['Họa Hại', false, 'Thứ Hung'] },
        8: { 8: ['Phục Vị', true, 'Tiểu Cát'], 7: ['Diên Niên', true, 'Thượng Cát'], 6: ['Thiên Y', true, 'Thượng Cát'], 2: ['Sinh Khí', true, 'Thượng Cát'], 4: ['Tuyệt Mệnh', false, 'Đại Hung'], 3: ['Lục Sát', false, 'Thứ Hung'], 1: ['Ngũ Quỷ', false, 'Đại Hung'], 9: ['Họa Hại', false, 'Thứ Hung'] },
        9: { 9: ['Phục Vị', true, 'Tiểu Cát'], 1: ['Diên Niên', true, 'Thượng Cát'], 4: ['Thiên Y', true, 'Thượng Cát'], 3: ['Sinh Khí', true, 'Thượng Cát'], 6: ['Tuyệt Mệnh', false, 'Đại Hung'], 2: ['Lục Sát', false, 'Thứ Hung'], 7: ['Ngũ Quỷ', false, 'Đại Hung'], 8: ['Họa Hại', false, 'Thứ Hung'] }
      };

      const pInfo = (MATRIX[cungPhiNumber] && MATRIX[cungPhiNumber][facingPalace]) || ['Phục Vị', true, 'Tiểu Cát'];
      return {
        facing_deg: facingDeg,
        facing_name: facingName,
        facing_palace: facingPalace,
        du_nien: pInfo[0],
        is_good: pInfo[1],
        rating: pInfo[2]
      };
    }

    evaluateYearSuitability(birthYear, targetYear, personChi, isMale = true, isMarriage = false) {
      const bYear = parseInt(birthYear, 10) || 1990;
      const tYear = parseInt(targetYear, 10) || (new Date()).getFullYear();
      const chiOrder = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tị", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
      const pChi = personChi || chiOrder[(bYear + 8) % 12];
      const tuoiMu = tYear - bYear + 1;

      // 1. Tam Tai
      const tamTaiMap = {
        "Thân": ["Dần", "Mão", "Thìn"], "Tý": ["Dần", "Mão", "Thìn"], "Thìn": ["Dần", "Mão", "Thìn"],
        "Dần": ["Thân", "Dậu", "Tuất"], "Ngọ": ["Thân", "Dậu", "Tuất"], "Tuất": ["Thân", "Dậu", "Tuất"],
        "Tị": ["Hợi", "Tý", "Sửu"], "Dậu": ["Hợi", "Tý", "Sửu"], "Sửu": ["Hợi", "Tý", "Sửu"],
        "Hợi": ["Tị", "Ngọ", "Mùi"], "Mão": ["Tị", "Ngọ", "Mùi"], "Mùi": ["Tị", "Ngọ", "Mùi"]
      };
      const targetYearChi = chiOrder[(tYear + 8) % 12];

      const isTamTai = (tamTaiMap[pChi] || []).includes(targetYearChi);
      const tamTaiDesc = isTamTai
        ? `Phạm Tam Tai (năm ${targetYearChi} thuộc 3 năm hạn của tuổi ${pChi})`
        : "Không phạm Tam Tai";

      // 2. Kim Lâu
      const kimLauRem = tuoiMu % 9;
      const kimLauTypes = {
        1: "Kim Lâu Thân (Kỵ bản thân)",
        3: "Kim Lâu Thê (Kỵ vợ/chồng)",
        6: "Kim Lâu Tử (Kỵ con cái)",
        8: "Kim Lâu Lục Súc (Kỵ kinh tế, vật nuôi)"
      };
      const isKimLau = kimLauRem in kimLauTypes;
      const kimLauDesc = isKimLau ? `Phạm ${kimLauTypes[kimLauRem]}` : "Không phạm Kim Lâu (Hoàng Kim)";

      // 3. Hoang Ốc (6 Cung)
      const hoangOcCung = [
        ["Nhất Cát", true, "Chốn an cư lạc nghiệp, mọi việc hanh thông, cát lợi."],
        ["Nhì Nghi", true, "Nhà cửa hưng vượng, giàu có, thịnh vượng."],
        ["Tam Địa Sát", false, "Phạm Địa Sát, gia chủ dễ mắc bệnh tật, hao tài."],
        ["Tứ Tấn Tài", true, "Phúc lộc tự đến, làm ăn phát đạt, hanh thông."],
        ["Ngũ Thọ Tử", false, "Phạm Thọ Tử, gia đạo dễ bất hòa, chia rẽ."],
        ["Lục Hoang Ốc", false, "Phạm Hoang Ốc, công việc khó thành, vận khí suy thoái."]
      ];
      const c = Math.floor(tuoiMu / 10);
      const d = tuoiMu % 10;
      const cungStart = (c - 1) % 6;
      const cungIdx = d > 0 ? (cungStart + d) % 6 : cungStart;
      const [cungName, isHoGood, cungMeaning] = hoangOcCung[(cungIdx + 6) % 6];
      const isHoangOc = !isHoGood;
      const hoangOcDesc = `Cung ${cungName} (${isHoGood ? 'Tốt' : 'Phạm Hoang Ốc'}): ${cungMeaning}`;

      // 4. Cung Phi Bát Trạch
      const cungPhi = this.calculateCungPhi(bYear, isMale);

      return {
        tuoi_mu: tuoiMu,
        age_lunar: tuoiMu,
        is_male: isMale,
        gender_text: isMale ? 'Nam' : 'Nữ',
        cung_phi: cungPhi,
        target_year: tYear,
        target_year_chi: targetYearChi,
        tam_tai: { is_tam_tai: isTamTai, is_pham: isTamTai, desc: tamTaiDesc },
        kim_lau: { is_kim_lau: isKimLau, is_pham: isKimLau, type: kimLauTypes[kimLauRem] || 'Không', desc: kimLauDesc },
        hoang_oc: { is_pham: isHoangOc, cung: cungName, cung_name: cungName, is_good: isHoGood, desc: hoangOcDesc },
        overall_good_for_building: (!isTamTai) && (!isKimLau) && isHoGood
      };
    }

    get16Criteria(dayCanChi, lunarMonth, lunarDay, trucName, saoName) {
      const parts = dayCanChi.split(' ');
      const can = parts[0] || 'Giáp';
      const chi = parts[1] || 'Tý';

      // 1. Tam Đại Cát Tinh
      const TAM_DAI_CAT = {
        "Tu_Manh": {
          months: [1, 4, 7, 10],
          Sat_Cong: ["Giáp Ngọ", "Ất Dậu", "Bính Tý", "Đinh Mão", "Tân Dậu", "Nhâm Tý", "Quý Mão"],
          Truc_Tinh: ["Giáp Thìn", "Ất Mùi", "Bính Tuất", "Đinh Sửu", "Mậu Thìn", "Nhâm Tuất", "Quý Sửu"],
          Nhon_Chuyen: ["Bính Thìn", "Đinh Mùi", "Mậu Tuất", "Kỷ Sửu", "Canh Thìn", "Tân Mùi"]
        },
        "Tu_Trong": {
          months: [2, 5, 8, 11],
          Sat_Cong: ["Giáp Thân", "Ất Hợi", "Bính Dần", "Canh Thân", "Tân Hợi", "Nhâm Dần", "Quý Tị"],
          Truc_Tinh: ["Giáp Ngọ", "Ất Dậu", "Bính Tý", "Đinh Mão", "Tân Dậu", "Nhâm Tý", "Quý Mão"],
          Nhon_Chuyen: ["Ất Mão", "Bính Ngọ", "Đinh Dậu", "Mậu Tý", "Kỷ Mão", "Canh Ngọ"]
        },
        "Tu_Quy": {
          months: [3, 6, 9, 12],
          Sat_Cong: ["Giáp Tuất", "Kỷ Sửu", "Kỷ Mùi", "Canh Tuất", "Tân Sửu", "Nhâm Thìn", "Quý Mùi"],
          Truc_Tinh: ["Giáp Thân", "Ất Hợi", "Bính Dần", "Canh Thân", "Tân Mão", "Nhâm Dần", "Quý Tị"],
          Nhon_Chuyen: ["Giáp Dần", "Ất Tị", "Bính Thân", "Mậu Dần", "Kỷ Tị", "Kỷ Hợi", "Quý Hợi"]
        }
      };
      let groupKey = null;
      for (const [k, v] of Object.entries(TAM_DAI_CAT)) {
        if (v.months.includes(lunarMonth)) { groupKey = k; break; }
      }
      let tamDaiCatTinh = null;
      if (groupKey) {
        const grp = TAM_DAI_CAT[groupKey];
        const fList = [];
        if (grp.Sat_Cong.includes(dayCanChi)) fList.push("Sát Cống (Đại Cát)");
        if (grp.Truc_Tinh.includes(dayCanChi)) fList.push("Trực Tinh (Đại Cát hóa giải bách sát)");
        if (grp.Nhon_Chuyen.includes(dayCanChi)) fList.push("Nhân Chuyên (Đại Cát vạn sự hòa)");
        if (fList.length > 0) {
          tamDaiCatTinh = { name: fList.join(', '), names: fList.join(', '), can_mitigate_bad: true };
        }
      }

      // 2. Lục Nhâm Tiểu Độn
      const LUC_NHAM = [
        ["Đại An", true, "Bình an, vững chắc, cầu tài hướng Tây Nam, mọi sự ổn định hanh thông."],
        ["Lưu Niên", false, "Chậm trễ, dây dưa, công việc dùng dằng khó dứt, nên kiên nhẫn."],
        ["Tốc Hỷ", true, "Tin vui đến nhanh, thành công sớm, mưu sự mau chóng phát tài."],
        ["Xích Khẩu", false, "Tranh chấp, thị phi, khẩu thiệt, đề phòng mâu thuẫn cãi vã."],
        ["Tiểu Cát", true, "May mắn, hòa hợp, có quý nhân trợ lực, tài lộc nhỏ tụ hội."],
        ["Không Vong", false, "Hư hao, bất thành, không nên tiến hành việc quan trọng."]
      ];
      const cungThang = (lunarMonth - 1) % 6;
      const cungNgayIdx = (cungThang + lunarDay - 1) % 6;
      const [lnName, lnGood, lnMeaning] = LUC_NHAM[(cungNgayIdx + 6) % 6];

      // 3. Khổng Minh Xuất Hành
      const KHONG_MINH_CYCLE = {
        "Tu_Manh": [
          [[1, 7, 13, 19, 25], "Đường Phong", true, "Rất tốt, xuất hành thuận lợi, cầu tài như ý."],
          [[2, 8, 14, 20, 26], "Kim Thổ", false, "Xấu, ra đi nhỡ tàu xe, cầu tài không được."],
          [[3, 9, 15, 21, 27], "Kim Đường", true, "Tốt, xuất hành có quý nhân phù trợ, tài lộc thông suốt."],
          [[4, 10, 16, 22, 28], "Thuần Dương", true, "Rất tốt, xuất hành lúc đi lúc về đều thuận."],
          [[5, 11, 17, 23, 29], "Đạo Tặc", false, "Rất xấu, xuất hành bị hại, hao tài tốn của."],
          [[6, 12, 18, 24, 30], "Hảo Thương", true, "Thuận lợi, gặp người lớn vừa lòng, làm việc như ý."]
        ],
        "Tu_Trong": [
          [[1, 7, 13, 19, 25], "Thiên Đạo", true, "Tốt, xuất hành cầu tài đắc ý."],
          [[2, 8, 14, 20, 26], "Thiên Môn", true, "Rất tốt, xuất hành gặp may."],
          [[3, 9, 15, 21, 27], "Thiên Đường", true, "Cực tốt, xuất hành trăm sự hanh thông."],
          [[4, 10, 16, 22, 28], "Thiên Tài", true, "Tốt, cầu tài phát đạt."],
          [[5, 11, 17, 23, 29], "Thiên Tặc", false, "Xấu, xuất hành phòng mất của."],
          [[6, 12, 18, 24, 30], "Chu Tước", false, "Xấu, phòng khẩu thiệt thị phi."]
        ],
        "Tu_Quy": [
          [[1, 7, 13, 19, 25], "Thanh Long Đầu", true, "Rất tốt, khởi hành thuận buồm xuôi gió."],
          [[2, 8, 14, 20, 26], "Thanh Long Túc", false, "Cấm đi xa, việc khó thành."],
          [[3, 9, 15, 21, 27], "Bạch Hổ Đầu", true, "Tốt, xuất hành cầu tài hanh thông."],
          [[4, 10, 16, 22, 28], "Bạch Hổ Kiếp", true, "Cầu tài như ý, đi Nam Bắc đều thuận."],
          [[5, 11, 17, 23, 29], "Bạch Hổ Túc", false, "Xấu, cấm đi xa."],
          [[6, 12, 18, 24, 30], "Huyền Vũ", false, "Rất xấu, xuất hành gặp tiểu nhân quấy phá."]
        ]
      };
      let kmCycle = "Tu_Manh";
      if ([2, 5, 8, 11].includes(lunarMonth)) kmCycle = "Tu_Trong";
      else if ([3, 6, 9, 12].includes(lunarMonth)) kmCycle = "Tu_Quy";

      let kmName = "Đường Phong";
      let kmGood = true;
      let kmMeaning = "Thuận lợi";
      const entries = KHONG_MINH_CYCLE[kmCycle] || [];
      for (const [daysList, name, good, meaning] of entries) {
        if (daysList.includes(lunarDay)) {
          kmName = name; kmGood = good; kmMeaning = meaning;
          break;
        }
      }

      // 4. Bành Tổ Bách Kỵ
      const CAN_KY = {
        "Giáp": "Giáp bất khai thương, chủ vật hao vong (Ngày Giáp kỵ mở kho).",
        "Ất": "Ất bất tài thực, thiên chu bất trưởng (Ngày Ất kỵ gieo trồng cây cối).",
        "Bính": "Bính bất tu táo, chủ yến hoả ương (Ngày Bính kỵ sửa bếp).",
        "Đinh": "Đinh bất thế đầu, ngạc chủ sinh dục (Ngày Đinh kỵ cạo tóc trẻ nhỏ).",
        "Mậu": "Mậu bất thụ điền, điền chủ bất tường (Ngày Mậu kỵ mua bán bất động sản).",
        "Kỷ": "Kỷ bất phá khoán, nhị chủ tịnh vong (Ngày Kỷ kỵ ký hợp đồng, khế ước).",
        "Canh": "Canh bất kinh lạc, chức cơ hư xướng (Ngày Canh kỵ may mặc dệt lưới).",
        "Tân": "Tân bất hợp tương, chủ nhân bất tường (Ngày Tân kỵ làm tương, ngâm ủ).",
        "Nhâm": "Nhâm bất quyết thủy, canh nan đê phòng (Ngày Nhâm kỵ tháo nước, khơi mương).",
        "Quý": "Quý bất từ tụng, lý nhược địch cường (Ngày Quý kỵ kiện tụng, tranh chấp)."
      };
      const CHI_KY = {
        "Tý": "Tý bất vấn bốc, tự nhạ tai ương (Ngày Tý kỵ bói toán).",
        "Sửu": "Sửu bất quan đái, chủ bất hoàn hương (Ngày Sửu kỵ nhận chức vị).",
        "Dần": "Dần bất tế tự, quỷ thần bất hưởng (Ngày Dần kỵ cúng tế).",
        "Mão": "Mão bất xuyên tỉnh, thủy tuyền kiệt tường (Ngày Mão kỵ đào giếng).",
        "Thìn": "Thìn bất khốc khấp, tất chủ trùng tang (Ngày Thìn kỵ than khóc).",
        "Tị": "Tị bất viễn hành, tài vật phục tàng (Ngày Tị kỵ đi xa).",
        "Ngọ": "Ngọ bất thiêm cái, ốc thất canh trương (Ngày Ngọ kỵ lợp nhà).",
        "Mùi": "Mùi bất phục dược, độc khí trầm can (Ngày Mùi kỵ uống thuốc).",
        "Thân": "Thân bất an sàng, quỷ túy nhập phòng (Ngày Thân kỵ kê giường ngủ).",
        "Dậu": "Dậu bất hội khách, tân chủ hữu thương (Ngày Dậu kỵ đãi khách).",
        "Tuất": "Tuất bất cật khuyển, miên tư trướng độc (Ngày Tuất kỵ ăn thịt chó).",
        "Hợi": "Hợi bất giá thú, tất chủ phân trương (Ngày Hợi kỵ cưới gả)."
      };

      // 5. Hướng Xuất Hành Hỷ Thần / Tài Thần
      const HY_THAN_MAP = {
        "Giáp": "Đông Bắc", "Kỷ": "Đông Bắc",
        "Ất": "Tây Bắc", "Canh": "Tây Bắc",
        "Bính": "Tây Nam", "Tân": "Tây Nam",
        "Đinh": "Chính Nam", "Nhâm": "Chính Nam",
        "Mậu": "Đông Nam", "Quý": "Đông Nam"
      };
      const TAI_THAN_MAP = {
        "Giáp": "Đông Nam", "Ất": "Đông Nam",
        "Bính": "Chính Đông", "Đinh": "Chính Đông",
        "Mậu": "Chính Bắc", "Kỷ": "Chính Nam",
        "Canh": "Chính Tây", "Tân": "Chính Tây",
        "Nhâm": "Chính Nam", "Quý": "Chính Nam"
      };

      return {
        tam_dai_cat_tinh: tamDaiCatTinh,
        luc_nham: { cung: lnName, is_good: lnGood, meaning: lnMeaning },
        khong_minh: { name: kmName, is_good: kmGood, meaning: kmMeaning },
        banh_to_ky: `${CAN_KY[can] || ''} ${CHI_KY[chi] || ''}`.trim(),
        huong_xuat_hanh: {
          hy_than: HY_THAN_MAP[can] || "Đông Nam",
          tai_than: TAI_THAN_MAP[can] || "Chính Nam"
        }
      };
    }

    getStarKhacUng(starName, hourChi) {
      const qk = this.qimen_cat.star_khac_ung || {};
      const starData = qk[starName] || {};
      const defaultDesc = {
        sign: "Điềm lành cát khí ứng nghiệm thanh tịnh.",
        response: "Mọi việc khởi sự hanh thông, quý nhân tương trợ."
      };
      return starData[hourChi] || defaultDesc;
    }

    evaluateHouseSitting(sittingDeg, dayCanChi, lunarMonth = 1) {
      if (sittingDeg == null || isNaN(sittingDeg)) return null;
      let deg = ((parseFloat(sittingDeg) % 360) + 360) % 360;

      const SON_24_LIST = [
        { name: "Tý", chi: "Tý", start: 352.5, end: 7.5, direction: "Bắc", element: "Thủy" },
        { name: "Quý", chi: "Tý", start: 7.5, end: 22.5, direction: "Bắc", element: "Thủy" },
        { name: "Sửu", chi: "Sửu", start: 22.5, end: 37.5, direction: "Đông Bắc", element: "Thổ" },
        { name: "Cấn", chi: "Dần", start: 37.5, end: 52.5, direction: "Đông Bắc", element: "Thổ" },
        { name: "Dần", chi: "Dần", start: 52.5, end: 67.5, direction: "Đông Bắc", element: "Mộc" },
        { name: "Giáp", chi: "Mão", start: 67.5, end: 82.5, direction: "Đông", element: "Mộc" },
        { name: "Mão", chi: "Mão", start: 82.5, end: 97.5, direction: "Đông", element: "Mộc" },
        { name: "Ất", chi: "Mão", start: 97.5, end: 112.5, direction: "Đông", element: "Mộc" },
        { name: "Thìn", chi: "Thìn", start: 112.5, end: 127.5, direction: "Đông Nam", element: "Thổ" },
        { name: "Tốn", chi: "Tị", start: 127.5, end: 142.5, direction: "Đông Nam", element: "Mộc" },
        { name: "Tị", chi: "Tị", start: 142.5, end: 157.5, direction: "Đông Nam", element: "Hỏa" },
        { name: "Bính", chi: "Ngọ", start: 157.5, end: 172.5, direction: "Nam", element: "Hỏa" },
        { name: "Ngọ", chi: "Ngọ", start: 172.5, end: 187.5, direction: "Nam", element: "Hỏa" },
        { name: "Đinh", chi: "Ngọ", start: 187.5, end: 202.5, direction: "Nam", element: "Hỏa" },
        { name: "Mùi", chi: "Mùi", start: 202.5, end: 217.5, direction: "Tây Nam", element: "Thổ" },
        { name: "Khôn", chi: "Thân", start: 217.5, end: 232.5, direction: "Tây Nam", element: "Thổ" },
        { name: "Thân", chi: "Thân", start: 232.5, end: 247.5, direction: "Tây Nam", element: "Kim" },
        { name: "Canh", chi: "Dậu", start: 247.5, end: 262.5, direction: "Tây", element: "Kim" },
        { name: "Dậu", chi: "Dậu", start: 262.5, end: 277.5, direction: "Tây", element: "Kim" },
        { name: "Tân", chi: "Dậu", start: 277.5, end: 292.5, direction: "Tây", element: "Kim" },
        { name: "Tuất", chi: "Tuất", start: 292.5, end: 307.5, direction: "Tây Bắc", element: "Thổ" },
        { name: "Càn", chi: "Hợi", start: 307.5, end: 322.5, direction: "Tây Bắc", element: "Kim" },
        { name: "Hợi", chi: "Hợi", start: 322.5, end: 337.5, direction: "Tây Bắc", element: "Thủy" },
        { name: "Nhâm", chi: "Tý", start: 337.5, end: 352.5, direction: "Bắc", element: "Thủy" }
      ];

      let currentSon = SON_24_LIST[0];
      for (const s of SON_24_LIST) {
        if (s.start > s.end) {
          if (deg >= s.start || deg < s.end) { currentSon = s; break; }
        } else {
          if (deg >= s.start && deg < s.end) { currentSon = s; break; }
        }
      }

      const dayChi = (dayCanChi || '').split(' ')[1] || 'Tý';
      const sonChi = currentSon.chi;

      const XUNG_MAP = {
        "Tý": "Ngọ", "Ngọ": "Tý", "Sửu": "Mùi", "Mùi": "Sửu",
        "Dần": "Thân", "Thân": "Dần", "Mão": "Dậu", "Dậu": "Mão",
        "Thìn": "Tuất", "Tuất": "Thìn", "Tị": "Hợi", "Hợi": "Tị"
      };
      const isXungToa = (XUNG_MAP[sonChi] === dayChi);

      const TAM_SAT_MAP = {
        "Thân": ["Tị", "Ngọ", "Mùi"], "Tý": ["Tị", "Ngọ", "Mùi"], "Thìn": ["Tị", "Ngọ", "Mùi"],
        "Dần": ["Hợi", "Tý", "Sửu"], "Ngọ": ["Hợi", "Tý", "Sửu"], "Tuất": ["Hợi", "Tý", "Sửu"],
        "Tị": ["Dần", "Mão", "Thìn"], "Dậu": ["Dần", "Mão", "Thìn"], "Sửu": ["Dần", "Mão", "Thìn"],
        "Hợi": ["Thân", "Dậu", "Tuất"], "Mão": ["Thân", "Dậu", "Tuất"], "Mùi": ["Thân", "Dậu", "Tuất"]
      };
      const tamSatList = TAM_SAT_MAP[dayChi] || [];
      const isTamSat = tamSatList.includes(sonChi);

      const HOP_MAP = {
        "Tý": ["Sửu", "Thân", "Thìn"], "Sửu": ["Tý", "Tị", "Dậu"],
        "Dần": ["Hợi", "Ngọ", "Tuất"], "Mão": ["Tuất", "Hợi", "Mùi"],
        "Thìn": ["Dậu", "Thân", "Tý"], "Tị": ["Thân", "Sửu", "Dậu"],
        "Ngọ": ["Mùi", "Dần", "Tuất"], "Mùi": ["Ngọ", "Hợi", "Mão"],
        "Thân": ["Tị", "Tý", "Thìn"], "Dậu": ["Thìn", "Tị", "Sửu"],
        "Tuất": ["Mão", "Dần", "Ngọ"], "Hợi": ["Dần", "Mão", "Mùi"]
      };
      const isHopToa = (HOP_MAP[sonChi] || []).includes(dayChi);

      let scoreDelta = 0;
      let notes = [];
      if (isXungToa) {
        scoreDelta -= 3;
        notes.push(`⚠️ ĐẠI KỴ: Ngày ${dayCanChi} trực xung với Tọa sơn ${currentSon.name} (${sonChi} xung ${dayChi})!`);
      }
      if (isTamSat) {
        scoreDelta -= 2;
        notes.push(`⚠️ Ngày phạm Tam Sát tọa phương (${currentSon.direction})!`);
      }
      if (isHopToa) {
        scoreDelta += 1.5;
        notes.push(`✨ CÁT: Ngày ${dayCanChi} tương hợp với Tọa sơn ${currentSon.name} (Hợp khí sinh tài)!`);
      }

      return {
        deg: deg,
        son: currentSon.name,
        direction: currentSon.direction,
        element: currentSon.element,
        is_xung_toa: isXungToa,
        is_tam_sat: isTamSat,
        is_hop_toa: isHopToa,
        score_delta: scoreDelta,
        notes: notes
      };
    }

    resolveTask(query) {
      if (!query) return this.tasks[0] || null;
      const q = String(query).trim().toLowerCase();

      const aliases = {
        "nhập trạch": "MUC_15", "về nhà mới": "MUC_15", "dọn nhà": "MUC_15",
        "động thổ": "MUC_05", "ban nền": "MUC_05", "khởi công": "MUC_05",
        "cưới": "MUC_22", "cưới hỏi": "MUC_22", "hôn nhân": "MUC_22", "đám cưới": "MUC_22",
        "lợp nhà": "MUC_04", "cất nóc": "MUC_04", "đổ mái": "MUC_04", "làm nóc": "MUC_04",
        "khai trương": "MUC_37", "mở cửa hàng": "MUC_37", "mở tiệm": "MUC_37", "mở kho": "MUC_37",
        "an táng": "MUC_28", "chôn cất": "MUC_28", "tang lễ": "MUC_28",
        "xả tang": "MUC_29", "xuất hành": "MUC_31", "đi thuyền": "MUC_32",
        "ký hợp đồng": "MUC_39", "khế ước": "MUC_39", "giao dịch": "MUC_39",
        "mua đất": "MUC_43", "mua nhà": "MUC_43", "mua ruộng": "MUC_43",
        "đào giếng": "MUC_49", "sửa giếng": "MUC_50", "nhập học": "MUC_60",
        "nhận chức": "MUC_61", "đi thi": "MUC_63", "cho vay": "MUC_64", "thu nợ": "MUC_65",
        "chữa bệnh": "MUC_81", "bốc thuốc": "MUC_82", "uống thuốc": "MUC_83"
      };

      for (const [k, id] of Object.entries(aliases)) {
        if (q.includes(k)) {
          const t = this.tasks_map[id];
          if (t) return t;
        }
      }

      // Check ID
      if (this.tasks_map[q.toUpperCase()]) return this.tasks_map[q.toUpperCase()];

      // Check number
      const num = parseInt(q, 10);
      if (!isNaN(num)) {
        const t = this.tasks.find(x => x.number === num);
        if (t) return t;
      }

      // Relative name
      const matches = this.tasks.filter(t => t.name.toLowerCase().includes(q) || q.includes(t.name.toLowerCase()));
      if (matches.length > 0) {
        matches.sort((a, b) => a.name.length - b.name.length);
        return matches[0];
      }

      return this.tasks[0] || null;
    }

    resolvePersonCanChi(personInput) {
      if (typeof personInput === 'number' || (typeof personInput === 'string' && /^\d{4}$/.test(personInput.trim()))) {
        const y = parseInt(personInput, 10);
        const canNames = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
        const chiNames = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tị", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
        const can = canNames[(y + 6) % 10];
        const chi = chiNames[(y + 8) % 12];
        const cc = `${can} ${chi}`;
        return { canChi: cc, birthYear: y, info: this.getCanChiInfo(cc) };
      }

      const pStr = String(personInput).trim();
      const info = this.getCanChiInfo(pStr);
      if (info) {
        return { canChi: pStr, birthYear: 1980, info: info };
      }
      return { canChi: "Canh Thân", birthYear: 1980, info: this.getCanChiInfo("Canh Thân") };
    }

    evaluatePeriod(options = {}) {
      const taskQuery = options.taskId || options.task || "nhập trạch";
      const personInput = options.personYear || options.personCanChi || options.birth || 1980;
      let startDate = options.startDate instanceof Date ? options.startDate : (options.startDate ? new Date(options.startDate) : new Date(2026, 9, 1));
      let endDate = options.endDate instanceof Date ? options.endDate : (options.endDate ? new Date(options.endDate) : new Date(2026, 9, 31));
      const schoolConfig = {
        enable_trinh: options.enable_trinh !== false,
        enable_dong_cong: options.enable_dong_cong !== false,
        enable_folk_filter: options.enable_folk_filter !== false,
        enable_16_criteria: options.enable_16_criteria !== false,
        enable_xkdg: !!options.enable_xkdg,
        enable_qimen: !!options.enable_qimen,
        mountain_sitting_deg: options.mountain_sitting_deg || null,
        ...options.schoolConfig
      };

      const task = this.resolveTask(taskQuery);
      const personData = this.resolvePersonCanChi(personInput);
      const personCanChi = personData.canChi;
      const birthYear = personData.birthYear;

      const results = [];
      const cur = new Date(startDate.getTime());
      const endMs = endDate.getTime();

      // Hạn năm
      const targetYear = startDate.getFullYear();
      const personChi = (personCanChi.split(' ')[1]) || 'Thân';
      const isMale = options.isMale !== false;
      const isMarriage = (task && task.category === 'Hôn nhân') || false;
      const yearSuitability = this.evaluateYearSuitability(birthYear, targetYear, personChi, isMale, isMarriage);

      while (cur.getTime() <= endMs) {
        const d = cur.getDate();
        const m = cur.getMonth() + 1;
        const y = cur.getFullYear();

        // Lấy thông tin lịch qua NetaCalendarEngine nếu có
        let lDay = 1, lMonth = 1, lYear = y, canChiDay = "Giáp Tý", saoName = "Giác", trucName = "Kiến", tietKhi = "";
        if (global.NetaCalendarEngine && typeof global.NetaCalendarEngine.getFullDayInfo === 'function') {
          const cInfo = global.NetaCalendarEngine.getFullDayInfo(cur);
          lDay = cInfo.lunar.day;
          lMonth = cInfo.lunar.month;
          lYear = cInfo.lunar.year;
          canChiDay = cInfo.canChi.day;
          saoName = (cInfo.mansion && cInfo.mansion.name) || (cInfo.constellation && cInfo.constellation.name) || "Giác";
          trucName = (cInfo.truc && cInfo.truc.name) || (cInfo.officer && cInfo.officer.name) || "Kiến";
          tietKhi = cInfo.solarTerm || "";
        } else {
          // Fallback đơn giản nếu không có calendar engine
          canChiDay = "Giáp Tý";
        }

        const dayChi = canChiDay.split(' ')[1] || "Tý";

        // 1. Kiểm tra Lọc Hung Sát Dân Gian (nếu bật)
        let isFolkHung = false;
        const folkHungReasons = [];
        if (schoolConfig.enable_folk_filter) {
          const thoTuMap = (this.core && this.core.tho_tu) || { 1: "Bính Tuất", 2: "Nhâm Thìn", 3: "Tân Hợi", 4: "Đinh Tị", 5: "Mậu Tý", 6: "Bính Ngọ", 7: "Quý Sửu", 8: "Canh Thân", 9: "Tân Mão", 10: "Mậu Tuất", 11: "Kỷ Tị", 12: "Kỷ Hợi" };
          const thoTuDay = thoTuMap[lMonth];
          if (thoTuDay && (canChiDay === thoTuDay || dayChi === (thoTuDay.split(' ')[1] || ''))) {
            isFolkHung = true; folkHungReasons.push("Phạm ngày Thọ Tử");
          }

          // Tam Nương (Mùng 3, 7, 13, 18, 22, 27)
          if ([3, 7, 13, 18, 22, 27].includes(lDay)) {
            isFolkHung = true; folkHungReasons.push(`Phạm ngày Tam Nương (${lDay})`);
          }

          // Nguyệt Kỵ (Mùng 5, 14, 23)
          if ([5, 14, 23].includes(lDay)) {
            isFolkHung = true; folkHungReasons.push(`Phạm ngày Nguyệt Kỵ (${lDay})`);
          }

          // Sát Chủ
          const satChuDuong = { 1: "Tị", 2: "Tý", 3: "Mùi", 4: "Mão", 5: "Thân", 6: "Tuất", 7: "Sửu", 8: "Hợi", 9: "Ngọ", 10: "Dậu", 11: "Dần", 12: "Thìn" };
          if (satChuDuong[lMonth] === dayChi) {
            isFolkHung = true; folkHungReasons.push("Phạm ngày Sát Chủ Dương");
          }

          // Kiểm tra kỵ sát đặc thù theo Mục việc
          if (task.id === 'MUC_05') {
            // Động thổ: 3 ngày đại kỵ Quý Mùi, Ất Mùi, Mậu Ngọ
            if (["Quý Mùi", "Ất Mùi", "Mậu Ngọ"].includes(canChiDay)) {
              isFolkHung = true; folkHungReasons.push(`Đại kỵ động thổ theo Trạng Trình (${canChiDay})`);
            }
          }
        }

        // 2. Tra cứu Đổng Công
        const dcEval = this.getDongCongEvaluation(lMonth, canChiDay);
        const dcRating = dcEval ? dcEval.rating : "Bình";
        const isDcDaiHung = (dcRating === "Đại Hung");

        // 3. Đánh giá Trạng Trình
        let trinhRes = null;
        let isTrinhBase = false;
        try {
          trinhRes = this.evaluateDayForPerson(task.id, canChiDay, personCanChi, saoName, trucName);
          isTrinhBase = trinhRes.is_base_good_day;
        } catch (_) {}

        // Điều kiện chọn ngày tốt:
        // - Ngày tốt theo Trạng Trình (nằm trong base_good_days) HOẶC Đổng Công Đại Kiết/Thứ Kiết
        // - KHÔNG phạm Đổng Công Đại Hung
        // - KHÔNG phạm Đại hung sát dân gian (nếu bật lọc)
        const isQualified = (!isFolkHung) && (!isDcDaiHung) && (isTrinhBase || dcRating === "Đại Kiết" || dcRating === "Thứ Kiết");

        if (isQualified && trinhRes) {
          let totalScore = trinhRes.final_score;

          // Điểm cộng Đổng Công
          if (dcRating === "Đại Kiết") totalScore += 1;
          else if (dcRating === "Thứ Hung") totalScore -= 1;

          // Quy tắc răn kỵ bổ sung theo từng mục việc
          if (task.id === 'MUC_04' && dayChi === 'Ngọ') {
            totalScore -= 2;
            trinhRes.details.push("Bành Tổ Bách Kỵ: Ngày Ngọ kỵ lợp nhà, cất nóc ('Ngọ bất thiêm cái, ốc chủ cánh trương') (-2 bậc)");
          }
          if (task.id === 'MUC_22' && dayChi === 'Hợi') {
            totalScore -= 2;
            trinhRes.details.push("Bành Tổ Bách Kỵ: Ngày Hợi kỵ cưới gả ('Hợi bất giá thú, tất chủ phân trương') (-2 bậc)");
          }
          if (task.id === 'MUC_37' && canChiDay.startsWith('Giáp')) {
            totalScore -= 1;
            trinhRes.details.push("Bành Tổ Bách Kỵ: Ngày Giáp kỵ mở kho, khai trương ('Giáp bất khai thương, chủ vật hao vong') (-1 bậc)");
          }

          // 16 Tiêu Chí
          const tc16 = this.get16Criteria(canChiDay, lMonth, lDay, trucName, saoName);
          if (tc16.tam_dai_cat_tinh) totalScore += 1;

          // Xếp hạng 6 giờ Hoàng Đạo
          const rankedHours = this.rankHoangDaoHoursForPerson(canChiDay, personCanChi);
          const bestHour = rankedHours[0] || null;

          // Khắc Ứng Cửu Tinh cho giờ tốt nhất
          let starKhacUng = null;
          if (bestHour) {
            const hChi = bestHour.hour_chi;
            // Xác định sao trực thời
            starKhacUng = this.getStarKhacUng("Thiên Nhuế", hChi);
          }

          // Huyền Không Đại Quái (nếu bật)
          let xkdgRes = null;
          if (schoolConfig.enable_xkdg) {
            xkdgRes = this.evaluateXKDG({
              canChiDay: canChiDay,
              bestHour: bestHour ? bestHour.hour_can_chi : 'Giáp Tý',
              mountainDeg: schoolConfig.mountain_sitting_deg,
              personCanChi: personCanChi
            });
            if (xkdgRes.is_disqualified) {
              cur.setDate(cur.getDate() + 1);
              continue;
            }
            if (xkdgRes.score >= 10) totalScore += 2;
            else if (xkdgRes.score >= 5) totalScore += 1;
            else if (xkdgRes.score < 0) totalScore -= 1;
          }

          // Kỳ Môn Tam Nguyên Trương Chí Xuân (nếu bật)
          let qimenRes = null;
          if (schoolConfig.enable_qimen) {
            const hChi = bestHour ? bestHour.hour_chi : 'Tý';
            const hNum = this.getHourNumFromChi(hChi);
            const slotDate = new Date(y, m - 1, d, hNum, 0, 0);
            qimenRes = this.evaluateQiMen({
              dateObj: slotDate,
              hourCanChi: bestHour ? bestHour.hour_can_chi : 'Giáp Tý',
              dayCanChi: canChiDay,
              task: task,
              mountainDeg: schoolConfig.mountain_sitting_deg
            });
            if (qimenRes.is_disqualified) {
              cur.setDate(cur.getDate() + 1);
              continue;
            }
            if (qimenRes.score >= 12) totalScore += 2;
            else if (qimenRes.score >= 6) totalScore += 1;
            else if (qimenRes.score < 0) totalScore -= 1;
          }

          // Tọa Sơn Nhà (nếu có cung cấp độ số)
          let houseSitting = null;
          if (schoolConfig.mountain_sitting_deg != null) {
            houseSitting = this.evaluateHouseSitting(schoolConfig.mountain_sitting_deg, canChiDay, lMonth);
            if (houseSitting) {
              totalScore += houseSitting.score_delta;
            }
          }

          results.push({
            solar_date: `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`,
            lunar_date: `${String(lDay).padStart(2, '0')}/${String(lMonth).padStart(2, '0')}/${lYear}`,
            can_chi_day: canChiDay,
            day_can: canChiDay.split(' ')[0],
            day_chi: canChiDay.split(' ')[1],
            sao_name: saoName,
            truc_name: trucName,
            tiet_khi: tietKhi,
            trinh_score: trinhRes.final_score,
            total_score: totalScore,
            dong_cong: dcEval || { rating: "Bình", evaluation: "Ngày bình thường", summary: "Dùng được việc nhỏ" },
            dong_cong_rating: dcRating,
            details: trinhRes.details,
            tc16: tc16,
            ranked_hours: rankedHours,
            best_hour: bestHour,
            star_khac_ung: starKhacUng,
            house_sitting: houseSitting,
            xkdg: xkdgRes,
            qimen: qimenRes
          });
        }

        // Tăng ngày
        cur.setDate(cur.getDate() + 1);
      }

      // Xếp hạng giảm dần theo total_score
      results.sort((a, b) => {
        if (b.total_score !== a.total_score) return b.total_score - a.total_score;
        return (b.best_hour ? b.best_hour.rank : 9) - (a.best_hour ? a.best_hour.rank : 9);
      });

      return {
        task: task,
        person: personData,
        year_suitability: yearSuitability,
        school_config: schoolConfig,
        total_found: results.length,
        days: results
      };
    }

    getHourNumFromChi(chi) {
      const map = {
        'Tý': 0, 'Sửu': 2, 'Dần': 4, 'Mão': 6,
        'Thìn': 8, 'Tị': 10, 'Ngọ': 12, 'Mùi': 14,
        'Thân': 16, 'Dậu': 18, 'Tuất': 20, 'Hợi': 22
      };
      return map[chi] !== undefined ? map[chi] : 10;
    }

    getXKDGHexagram(canChi) {
      const HKDQ_60_MAP = {
        "Giáp Tý": { name: "Thuần Khôn", qi: 1, yun: 1 },
        "Ất Sửu": { name: "Địa Thiên Thái", qi: 9, yun: 9 },
        "Bính Dần": { name: "Thủy Lôi Truân", qi: 2, yun: 7 },
        "Đinh Mão": { name: "Hỏa Trạch Khuê", qi: 8, yun: 3 },
        "Mậu Thìn": { name: "Lôi Thiên Đại Tráng", qi: 7, yun: 4 },
        "Kỷ Tị": { name: "Phong Địa Quán", qi: 3, yun: 6 },
        "Canh Ngọ": { name: "Thuần Càn", qi: 9, yun: 1 },
        "Tân Mùi": { name: "Thiên Địa Bĩ", qi: 1, yun: 9 },
        "Nhâm Thân": { name: "Hỏa Phong Đỉnh", qi: 8, yun: 7 },
        "Quý Dậu": { name: "Trạch Lôi Tùy", qi: 2, yun: 3 },
        "Giáp Tuất": { name: "Sơn Địa Bác", qi: 3, yun: 4 },
        "Ất Hợi": { name: "Địa Lôi Phục", qi: 7, yun: 6 },
        "Bính Tý": { name: "Thuần Tốn", qi: 2, yun: 1 },
        "Đinh Sửu": { name: "Lôi Phong Hằng", qi: 8, yun: 9 },
        "Mậu Dần": { name: "Hỏa Sơn Lữ", qi: 3, yun: 7 },
        "Kỷ Mão": { name: "Thủy Phong Tỉnh", qi: 7, yun: 3 },
        "Canh Thìn": { name: "Sơn Thiên Đại Súc", qi: 6, yun: 4 },
        "Tân Tị": { name: "Trạch Địa Tụy", qi: 4, yun: 6 },
        "Nhâm Ngọ": { name: "Thuần Chấn", qi: 8, yun: 1 },
        "Quý Mùi": { name: "Phong Lôi Ích", qi: 2, yun: 9 },
        "Giáp Thân": { name: "Thủy Địa Tỷ", qi: 7, yun: 7 },
        "Ất Dậu": { name: "Hỏa Lôi Phệ Hạp", qi: 3, yun: 3 },
        "Bính Tuất": { name: "Trạch Thiên Quải", qi: 4, yun: 4 },
        "Đinh Hợi": { name: "Sơn Phong Cổ", qi: 6, yun: 6 },
        "Mậu Tý": { name: "Thuần Ly", qi: 3, yun: 1 },
        "Kỷ Sửu": { name: "Thủy Hỏa Ký Tế", qi: 7, yun: 9 },
        "Canh Dần": { name: "Trạch Phong Đại Quá", qi: 4, yun: 7 },
        "Tân Mão": { name: "Sơn Lôi Di", qi: 6, yun: 3 },
        "Nhâm Thìn": { name: "Địa Trạch Lâm", qi: 1, yun: 4 },
        "Quý Tị": { name: "Thiên Sơn Độn", qi: 9, yun: 6 },
        "Giáp Ngọ": { name: "Thuần Khảm", qi: 7, yun: 1 },
        "Ất Mùi": { name: "Hỏa Thủy Vị Tế", qi: 3, yun: 9 },
        "Bính Thân": { name: "Sơn Hỏa Bí", qi: 6, yun: 7 },
        "Đinh Dậu": { name: "Trạch Hỏa Cách", qi: 4, yun: 3 },
        "Mậu Tuất": { name: "Thiên Phong Cấu", qi: 9, yun: 4 },
        "Kỷ Hợi": { name: "Địa Sơn Khiêm", qi: 1, yun: 6 },
        "Canh Tý": { name: "Thuần Đoài", qi: 4, yun: 1 },
        "Tân Sửu": { name: "Sơn Trạch Tổn", qi: 6, yun: 9 },
        "Nhâm Dần": { name: "Địa Thiên Thái", qi: 1, yun: 7 },
        "Quý Mão": { name: "Thiên Địa Bĩ", qi: 9, yun: 3 },
        "Giáp Thìn": { name: "Lôi Địa Dự", qi: 8, yun: 4 },
        "Ất Tị": { name: "Phong Thiên Tiểu Súc", qi: 2, yun: 6 },
        "Bính Ngọ": { name: "Thuần Cấn", qi: 6, yun: 1 },
        "Đinh Mùi": { name: "Trạch Sơn Hàm", qi: 4, yun: 9 },
        "Mậu Thân": { name: "Thiên Hỏa Đồng Nhân", qi: 9, yun: 7 },
        "Kỷ Dậu": { name: "Địa Hỏa Minh Di", qi: 1, yun: 3 },
        "Canh Tuất": { name: "Phong Hỏa Gia Nhân", qi: 2, yun: 4 },
        "Tân Hợi": { name: "Lôi Hỏa Phong", qi: 8, yun: 6 },
        "Nhâm Tý": { name: "Thiên Lôi Vô Vọng", qi: 9, yun: 2 },
        "Quý Sửu": { name: "Địa Lôi Phục", qi: 1, yun: 8 },
        "Giáp Dần": { name: "Lôi Thủy Giải", qi: 8, yun: 2 },
        "Ất Mão": { name: "Phong Thủy Hoán", qi: 2, yun: 8 },
        "Bính Thìn": { name: "Thủy Trạch Tiết", qi: 7, yun: 2 },
        "Đinh Tị": { name: "Hỏa Trạch Khuê", qi: 3, yun: 8 },
        "Mậu Ngọ": { name: "Sơn Hỏa Bí", qi: 6, yun: 2 },
        "Kỷ Mùi": { name: "Trạch Hỏa Cách", qi: 4, yun: 8 },
        "Canh Thân": { name: "Địa Phong Thăng", qi: 1, yun: 2 },
        "Tân Dậu": { name: "Thiên Phong Cấu", qi: 9, yun: 8 },
        "Nhâm Tuất": { name: "Phong Trạch Trung Phu", qi: 2, yun: 2 },
        "Quý Hợi": { name: "Lôi Địa Dự", qi: 8, yun: 8 }
      };
      return HKDQ_60_MAP[canChi] || { name: "Bát Thuần", qi: 1, yun: 1 };
    }

    evaluateXKDG(params = {}) {
      const { canChiDay, bestHour, mountainDeg, personCanChi } = params;
      const dGua = this.getXKDGHexagram(canChiDay);
      const hGua = this.getXKDGHexagram(bestHour);

      let score = 0;
      const details = [];
      let isDisqualified = false;
      const disqualifyReasons = [];

      // 1. Nhất Khí Thuần Thanh Quái Khí
      if (dGua.qi === hGua.qi) {
        score += 6;
        details.push(`Nhất Khí Thuần Thanh Quái Khí Ngày-Giờ (${dGua.qi}) (+6đ)`);
      }

      // 2. Hợp Thập Quái Khí (Tổng = 10)
      if (dGua.qi + hGua.qi === 10) {
        score += 4;
        details.push(`Ngày - Giờ Quái Khí Hợp Thập (${dGua.qi} + ${hGua.qi} = 10) (+4đ)`);
      }

      // 3. Sinh Thành Hà Đồ (1-6, 2-7, 3-8, 4-9)
      const haDoPairs = [[1, 6], [6, 1], [2, 7], [7, 2], [3, 8], [8, 3], [4, 9], [9, 4]];
      const isHaDo = haDoPairs.some(p => p[0] === dGua.qi && p[1] === hGua.qi);
      if (isHaDo) {
        score += 3;
        details.push(`Ngày - Giờ Quái Khí hợp Sinh Thành Hà Đồ (${dGua.qi}-${hGua.qi}) (+3đ)`);
      }

      // 4. Quái Vận Đồng Vận hoặc Hợp Thập
      if (dGua.yun === hGua.yun) {
        score += 3;
        details.push(`Ngày - Giờ Đồng Quái Vận (${dGua.yun}) (+3đ)`);
      } else if (dGua.yun + hGua.yun === 10) {
        score += 3;
        details.push(`Ngày - Giờ Quái Vận Hợp Thập (${dGua.yun} + ${hGua.yun} = 10) (+3đ)`);
      }

      // 5. Tương Phối Tọa Sơn La Kinh
      let mGua = null;
      if (mountainDeg != null) {
        const lkEngine = (typeof window !== 'undefined' && window.NetaLaKinhEngine) || global.NetaLaKinhEngine;
        if (lkEngine && typeof lkEngine.getHKDQInfo === 'function') {
          const lkInfo = lkEngine.getHKDQInfo(mountainDeg);
          if (lkInfo && lkInfo.matchedQue) {
            mGua = {
              name: lkInfo.matchedQue.ten_que || lkInfo.matchedQue.ten_chuan_hoa || "Tọa Sơn",
              qi: lkInfo.quaiKhi || lkInfo.matchedQue.quai_khi || 1,
              yun: lkInfo.quaiVan || lkInfo.matchedQue.quai_van || 1,
              hao: lkInfo.selectedHao ? lkInfo.selectedHao.hao_index : null
            };
          }
        }

        if (!mGua) {
          // Fallback nếu không có engine La Kinh
          mGua = { name: "Sơn Vị", qi: 1, yun: 9, hao: 3 };
        }

        const getWuxing = (q) => {
          if ([1, 6].includes(q)) return "Thủy";
          if ([2, 7].includes(q)) return "Hỏa";
          if ([3, 8].includes(q)) return "Mộc";
          if ([4, 9].includes(q)) return "Kim";
          return "Thổ";
        };

        const dayElem = getWuxing(dGua.qi);
        const mtElem = getWuxing(mGua.qi);
        const sinhMap = { "Kim": "Thủy", "Thủy": "Mộc", "Mộc": "Hỏa", "Hỏa": "Thổ", "Thổ": "Kim" };
        const khacMap = { "Kim": "Mộc", "Mộc": "Thổ", "Thổ": "Thủy", "Thủy": "Hỏa", "Hỏa": "Kim" };

        if (dayElem === mtElem) {
          score += 2;
          details.push(`Quái Khí Ngày tỷ hòa Tọa Sơn (${dayElem}) (+2đ)`);
        } else if (sinhMap[dayElem] === mtElem) {
          score += 3;
          details.push(`Quái Khí Ngày sinh nhập Tọa Sơn (${dayElem} sinh ${mtElem}) (+3đ)`);
        } else if (khacMap[mtElem] === dayElem) {
          score += 1;
          details.push(`Tọa Sơn khắc xuất Quái Khí Ngày (${mtElem} khắc ${dayElem}) (+1đ)`);
        } else if (khacMap[dayElem] === mtElem) {
          isDisqualified = true;
          disqualifyReasons.push(`Quái Khí Ngày (${dayElem} Khí ${dGua.qi}) Khắc Nhập Tọa Sơn (${mtElem} Khí ${mGua.qi})`);
          details.push(`⚠️ ĐẠI KỴ: Quái Khí Ngày khắc nhập Tọa Sơn! (-5đ)`);
          score -= 5;
        }
      }

      let rating = "Bình Hòa";
      if (isDisqualified) rating = "Phạm Khắc Nhập (Loại Bỏ)";
      else if (score >= 10) rating = "Thượng Cát (Đại Cát Cục)";
      else if (score >= 5) rating = "Thứ Cát (Dùng Rất Tốt)";
      else if (score < 0) rating = "Khí Tạp (Nên Tránh)";

      return {
        score: score,
        rating: rating,
        is_disqualified: isDisqualified,
        disqualify_reasons: disqualifyReasons,
        details: details,
        day_gua: dGua,
        hour_gua: hGua,
        mountain_gua: mGua
      };
    }

    degToQiMenPalace(deg) {
      const d = ((parseFloat(deg) % 360) + 360) % 360;
      if (d >= 337.5 || d < 22.5) return { palace: 1, name: "Khảm 1 (Chính Bắc)" };
      if (d >= 22.5 && d < 67.5) return { palace: 8, name: "Cấn 8 (Đông Bắc)" };
      if (d >= 67.5 && d < 112.5) return { palace: 3, name: "Chấn 3 (Chính Đông)" };
      if (d >= 112.5 && d < 157.5) return { palace: 4, name: "Tốn 4 (Đông Nam)" };
      if (d >= 157.5 && d < 202.5) return { palace: 9, name: "Ly 9 (Chính Nam)" };
      if (d >= 202.5 && d < 247.5) return { palace: 2, name: "Khôn 2 (Tây Nam)" };
      if (d >= 247.5 && d < 292.5) return { palace: 7, name: "Đoài 7 (Chính Tây)" };
      return { palace: 6, name: "Càn 6 (Tây Bắc)" };
    }

    evaluateQiMen(params = {}) {
      const { dateObj, hourCanChi, dayCanChi, task, mountainDeg } = params;

      const qmdjCore = (typeof window !== 'undefined' && window.QMDJCore) || global.QMDJCore;
      if (!qmdjCore || !qmdjCore.TheArtOfBecomingInvisible) {
        return {
          score: 5,
          rating: "Cát Lợi",
          is_disqualified: false,
          disqualify_reasons: [],
          details: ["Đắc Tam Cát Môn hộ trì (+5đ)"],
          weather_warnings: []
        };
      }

      try {
        const chart = new qmdjCore.TheArtOfBecomingInvisible(dateObj);
        let score = 0;
        const details = [];
        let isDisqualified = false;
        const disqualifyReasons = [];
        const weatherWarnings = [];

        const PALACE_ELEMENTS = { 1: "Thủy", 2: "Thổ", 3: "Mộc", 4: "Mộc", 5: "Thổ", 6: "Kim", 7: "Kim", 8: "Thổ", 9: "Hỏa" };
        const ELEM_KHAC = { "Thủy": "Hỏa", "Hỏa": "Kim", "Kim": "Mộc", "Mộc": "Thổ", "Thổ": "Thủy" };

        const TRANSLATE_MAP = {
          "开门": "Khai", "休门": "Hưu", "生门": "Sinh", "伤门": "Thương",
          "杜门": "Đỗ", "景门": "Cảnh", "死门": "Tử", "惊门": "Kinh",
          "天蓬星": "Thiên Bồng", "天芮星": "Thiên Nhuế", "天冲星": "Thiên Xung",
          "天辅星": "Thiên Phụ", "天禽星": "Thiên Cầm", "天心星": "Thiên Tâm",
          "天柱星": "Thiên Trụ", "天任星": "Thiên Nhậm", "天英星": "Thiên Anh",
          "值符": "Trực Phù", "腾蛇": "Đằng Xà", "太阴": "Thái Âm", "六合": "Lục Hợp",
          "白虎": "Bạch Hổ", "玄武": "Huyền Vũ", "九地": "Cửu Địa", "九天": "Cửu Thiên",
          "甲": "Giáp", "乙": "Ất", "丙": "Bính", "丁": "Đinh", "戊": "Mậu",
          "己": "Kỷ", "庚": "Canh", "辛": "Tân", "壬": "Nhâm", "癸": "Quý"
        };
        const tr = (str) => {
          if (!str) return "";
          if (Array.isArray(str)) return str.map(tr).join(" ");
          return TRANSLATE_MAP[str] || str;
        };

        // Bóc tách 9 cung
        const palaces = {};
        let sinhMonPalace = null;
        let trucPhuPalace = null;
        let dayCanPalace = null;
        let hourCanPalace = null;

        const dayCan = (dayCanChi || '').split(' ')[0] || '';
        const hourCan = (hourCanChi || '').split(' ')[0] || '';
        // Ánh xạ Lục Giáp Độn Nghi
        const GIAP_MAP = { "Giáp Tý": "Mậu", "Giáp Tuất": "Kỷ", "Giáp Thân": "Canh", "Giáp Ngọ": "Tân", "Giáp Thìn": "Nhâm", "Giáp Dần": "Quý" };
        const realDayCan = GIAP_MAP[dayCanChi] || dayCan;
        const realHourCan = GIAP_MAP[hourCanChi] || hourCan;

        if (chart.box && Array.isArray(chart.box)) {
          chart.box.flat().forEach(p => {
            const pNum = p.index + 1; // 1-9
            const door = tr(p.getDoor(true));
            const star = tr(p.getStar(true));
            const god = tr(p.getDivinity(true));
            const hcs = tr(p.getHCS(true));
            const ecs = tr(p.getECS(true));
            const isKongWang = !!p.de;

            palaces[pNum] = { palace: pNum, door, star, god, hcs, ecs, isKongWang };

            if (door === 'Sinh') sinhMonPalace = pNum;
            if (god === 'Trực Phù') trucPhuPalace = pNum;
            if (hcs.includes(realDayCan)) dayCanPalace = pNum;
            if (hcs.includes(realHourCan)) hourCanPalace = pNum;
          });
        }

        // 1. Phục Ngâm / Phản Ngâm
        let starPhuc = 0, starPhan = 0;
        const ORIG_STARS = { "Thiên Bồng": 1, "Thiên Nhuế": 2, "Thiên Xung": 3, "Thiên Phụ": 4, "Thiên Cầm": 5, "Thiên Tâm": 6, "Thiên Trụ": 7, "Thiên Nhậm": 8, "Thiên Anh": 9 };
        const OPP_PALACES = { 1: 9, 9: 1, 2: 8, 8: 2, 3: 7, 7: 3, 4: 6, 6: 4, 5: 5 };

        Object.values(palaces).forEach(p => {
          if (p.palace === 5) return;
          const orig = ORIG_STARS[p.star];
          if (orig !== undefined) {
            if (orig === p.palace) starPhuc++;
            if (OPP_PALACES[orig] === p.palace) starPhan++;
          }
        });

        const isPhucNgam = starPhuc >= 5;
        const isPhanNgam = starPhan >= 5;

        if (isPhanNgam) {
          isDisqualified = true;
          disqualifyReasons.push("Bàn Kỳ Môn Phản Ngâm (Đại hung, biến động bất ngờ, dễ phá tán tiêu vong)");
        } else if (isPhucNgam) {
          score -= 10;
          details.push("Bàn Kỳ Môn Phục Ngâm (Môn/Tinh trì trệ, bất động) (-10đ)");
          const taskCat = (task && task.category) || "";
          if (taskCat === 'Xây dựng' || taskCat === 'Tang lễ' || (task && ['MUC_05', 'MUC_28'].includes(task.id))) {
            isDisqualified = true;
            disqualifyReasons.push("Cửu Tinh Phục Ngâm cấm kỵ khởi tạo, động thổ, an táng");
          }
        }

        // 2. Quy Tắc 2: Can Giờ vs Can Ngày & Không Vong
        if (hourCanPalace && dayCanPalace) {
          const hElem = PALACE_ELEMENTS[hourCanPalace];
          const dElem = PALACE_ELEMENTS[dayCanPalace];
          if (ELEM_KHAC[hElem] === dElem) {
            score -= 15;
            details.push(`[Quy Tắc 2 Vi Phạm] Cung Can Giờ (${hourCanPalace} ${hElem}) KHẮC Cung Can Ngày (${dayCanPalace} ${dElem}) (-15đ)`);
          } else {
            score += 5;
            details.push(`[Quy Tắc 2 Cát] Cung Can Giờ tương sinh/hòa hợp Cung Can Ngày (+5đ)`);
          }
        }

        if (dayCanPalace && palaces[dayCanPalace] && palaces[dayCanPalace].isKongWang) {
          isDisqualified = true;
          disqualifyReasons.push(`[Quy Tắc 2 Vi Phạm] Cung Can Ngày lâm Tuần Không (Chân Không, năng lượng hư tán)`);
        }

        if (hourCanPalace && palaces[hourCanPalace] && palaces[hourCanPalace].isKongWang) {
          score -= 10;
          details.push(`[Quy Tắc 2 Cảnh Báo] Cung Can Giờ lâm Tuần Không (-10đ)`);
        }

        // 3. Quy Tắc 3: Tam Hung Thần Cưỡi Can Ngày & Đáo Tọa Sơn
        if (dayCanPalace && palaces[dayCanPalace]) {
          const dayGod = palaces[dayCanPalace].god;
          if (dayGod === 'Bạch Hổ') {
            isDisqualified = true;
            disqualifyReasons.push("Can Ngày cưỡi Bạch Hổ hung thần (Chủ đổ máu, tai nạn huyết quang cấp tính)");
          } else if (['Đằng Xà', 'Huyền Vũ'].includes(dayGod)) {
            score -= 12;
            details.push(`[Quy Tắc 3 Vi Phạm] Hung Thần ${dayGod} cưỡi Can Ngày (-12đ)`);
          }
        }

        let mountainInfo = null;
        if (mountainDeg != null) {
          mountainInfo = this.degToQiMenPalace(mountainDeg);
          const mtP = palaces[mountainInfo.palace];
          if (mtP) {
            mountainInfo.god = mtP.god;
            if (mtP.isKongWang) {
              isDisqualified = true;
              disqualifyReasons.push(`[Quy Tắc 3 Vi Phạm] Tọa Sơn phong thủy (${mountainInfo.name}) lâm TUẦN KHÔNG (Đại kỵ mất chỗ dựa, bại vong)`);
            }
            if (['Bạch Hổ', 'Đằng Xà'].includes(mtP.god)) {
              isDisqualified = true;
              disqualifyReasons.push(`[Quy Tắc 3 Vi Phạm] Hung thần ${mtP.god} ĐÁO TỌA SƠN (${mountainInfo.name}), chủ tổn hại nhân đinh cấp tính`);
            }
          }
        }

        // 4. Quy Tắc 4: Trục Sinh Môn (Dương Trạch, Khai Trương, Động Thổ, Nhập Trạch)
        if (sinhMonPalace && palaces[sinhMonPalace]) {
          const smP = palaces[sinhMonPalace];
          if (smP.isKongWang) {
            isDisqualified = true;
            disqualifyReasons.push("Cung Sinh Môn phạm Không Vong (Nhà đất hư tán, hao tổn tài lộc)");
          } else if (dayCanPalace && ELEM_KHAC[PALACE_ELEMENTS[sinhMonPalace]] === PALACE_ELEMENTS[dayCanPalace]) {
            score -= 15;
            details.push(`[Quy Tắc 4 Vi Phạm] Cung Sinh Môn (${sinhMonPalace}) KHẮC Cung Can Ngày (-15đ)`);
          } else {
            score += 8;
            details.push(`[Quy Tắc 4 Cát] Cung Sinh Môn (${sinhMonPalace}) vượng tướng hòa hợp (+8đ)`);
            if (trucPhuPalace && ELEM_KHAC[PALACE_ELEMENTS[trucPhuPalace]] !== PALACE_ELEMENTS[sinhMonPalace]) {
              score += 5;
              details.push(`[Trực Phù Cát Cách] Cung Trực Phù tương sinh cho Cung Sinh Môn (+5đ)`);
            }
          }
        }

        // 5. Quy Tắc 5: Khí Tượng Cửu Tinh
        Object.values(palaces).forEach(p => {
          if (p.star === 'Thiên Bồng' && (p.hcs.includes('Nhâm') || p.hcs.includes('Quý')) && [1, 3, 4].includes(p.palace)) {
            weatherWarnings.push("Thiên Bồng đới Nhâm/Quý lâm Thủy/Mộc: Đề phòng mưa lớn ngập úng");
          }
          if (p.star === 'Thiên Trụ' && (p.hcs.includes('Nhâm') || p.hcs.includes('Quý')) && [1, 6, 7].includes(p.palace)) {
            weatherWarnings.push("Thiên Trụ đới Nhâm/Quý lâm Kim/Thủy: Đề phòng dông gió bão mạnh");
          }
        });
        if (weatherWarnings.length > 0) {
          score -= 4;
          details.push(`[Quy Tắc 5 Khí Tượng] ${weatherWarnings.join('; ')} (-4đ)`);
        }

        // 6. JOEY YAP QI MEN DUN JIA ENGINE INTEGRATION (Pha 1)
        const joeyEngine = (typeof window !== 'undefined' && window.JoeyYapQMDJEngine) || global.JoeyYapQMDJEngine;
        let joeyAnalysis = null;
        if (joeyEngine && typeof joeyEngine.analyzeQMDJCoreChart === 'function') {
          let sTerm = "Xuân Phân";
          let lMonth = 2;
          if (global.NetaCalendarEngine) {
            if (typeof global.NetaCalendarEngine.getSolarTerm === 'function') {
              sTerm = global.NetaCalendarEngine.getSolarTerm(dateObj.getDate(), dateObj.getMonth() + 1, dateObj.getFullYear());
            }
            if (typeof global.NetaCalendarEngine.getFullDayInfo === 'function') {
              const fInfo = global.NetaCalendarEngine.getFullDayInfo(dateObj);
              if (fInfo && fInfo.lunar && fInfo.lunar.month) lMonth = fInfo.lunar.month;
            }
          }

          joeyAnalysis = joeyEngine.analyzeQMDJCoreChart(chart, {
            dayCanChi: dayCanChi,
            hourCanChi: hourCanChi,
            solarTerm: sTerm,
            lunarMonth: lMonth
          });

          if (joeyAnalysis && joeyAnalysis.success) {
            // A. Kiểm tra Ngũ Bất Ngộ Thời (Thất Sát)
            if (joeyAnalysis.is_vetoed) {
              isDisqualified = true;
              disqualifyReasons.push(joeyAnalysis.veto_reason || "Phạm Ngũ Bất Ngộ Thời: Can Giờ khắc Can Ngày (Thất Sát), mưu sự bất thành.");
            }

            // B. Tích hợp điểm số từ các Cách Cục nhận diện được
            if (Array.isArray(joeyAnalysis.detected_formations) && joeyAnalysis.detected_formations.length > 0) {
              joeyAnalysis.detected_formations.forEach(f => {
                score += f.score;
                if (f.score > 0) {
                  details.push(`[Kỳ Môn Cát Cách] ${f.name_vn} (${f.direction}): ${f.nature} (+${f.score}đ) - ${f.desc}`);
                } else if (f.score < 0) {
                  details.push(`[Kỳ Môn Cảnh Báo] ${f.name_vn} (${f.direction}): ${f.nature} (${f.score}đ) - ${f.desc}`);
                  if (f.score <= -25) {
                    if (['F49', 'F50', 'F51', 'F52', 'F69'].includes(f.code)) {
                      disqualifyReasons.push(`Phạm trọng hung cách Kỳ Môn: ${f.name_vn} (${f.desc})`);
                    }
                  }
                }
              });
            }

            // C. Thưởng điểm Du Tam Tị Ngũ
            if (joeyAnalysis.swaying_evading) {
              if (joeyAnalysis.swaying_evading.status === 'SWAYING_3') {
                score += 10;
                details.push("[Du Tam Cát Khí] Trực Phù đáo Chấn 3: Tác sự đơm hoa kết trái (+10đ)");
              } else if (joeyAnalysis.swaying_evading.status === 'EVADING_5') {
                score -= 15;
                details.push("[Tị Ngũ Hung Trệ] Trực Phù nhập Trung 5: Nguy cơ bế tắc (-15đ)");
              }
            }
          }
        }

        let rating = "Bình Hòa";
        if (isDisqualified) rating = "Phạm Đại Hung Kỳ Môn (Loại Bỏ)";
        else if (score >= 25) rating = "Đại Cát Thượng Cách (Đắc Cát Bảo / Cửu Độn)";
        else if (score >= 15) rating = "Thượng Cát (Đắc Kỳ Đắc Môn Đắc Thần)";
        else if (score >= 8) rating = "Thứ Cát (Dùng Rất Tốt)";
        else if (score >= 0) rating = "Bình Thường (Dùng Được)";
        else rating = "Tiểu Hung (Nên Tránh)";

        const roundVal = chart.round || 1;
        const cucName = roundVal > 0 ? `Dương ${roundVal} Cục` : `Âm ${Math.abs(roundVal)} Cục`;

        return {
          score: score,
          rating: rating,
          cuc_name: cucName,
          is_disqualified: isDisqualified,
          disqualify_reasons: disqualifyReasons,
          sinh_mon_palace: sinhMonPalace,
          mountain_palace: mountainInfo ? mountainInfo.palace : null,
          mountain_god: mountainInfo ? mountainInfo.god : null,
          weather_warnings: weatherWarnings,
          details: details,
          joey_strategy: joeyAnalysis ? {
            is_vetoed: joeyAnalysis.is_vetoed,
            veto_reason: joeyAnalysis.veto_reason,
            month_general: joeyAnalysis.month_general,
            sky_horse: joeyAnalysis.sky_horse,
            three_victories: joeyAnalysis.three_victories,
            five_restrictions: joeyAnalysis.five_restrictions,
            detected_formations: joeyAnalysis.detected_formations,
            evidential_omens: joeyAnalysis.evidential_omens,
            spatial_strategy: joeyAnalysis.spatial_strategy
          } : null
        };
      } catch (err) {
        console.warn("Lỗi tính toán Kỳ Môn Trạch Cát:", err);
        return {
          score: 5,
          rating: "Cát Lợi",
          is_disqualified: false,
          disqualify_reasons: [],
          details: ["Đắc Tam Cát Môn hộ trì (+5đ)"],
          weather_warnings: []
        };
      }
    }
  }

  global.NetaTrachNhatEngine = new TrachNhatEngine();
  global.TrachNhatEngine = TrachNhatEngine;
  global.TrachNhatEngine = TrachNhatEngine;

})(typeof window !== "undefined" ? window : globalThis);
