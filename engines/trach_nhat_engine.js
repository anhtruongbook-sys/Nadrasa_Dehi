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

        ranked.push({
          hour_can_chi: hStr,
          hour_chi: hInfo.chi,
          solar_time_range: HOUR_TIMES[hInfo.chi] || "",
          rank: rank,
          good_count: goodCount,
          bad_count: badCount,
          recommendation: recommendation,
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

    evaluateYearSuitability(birthYear, targetYear, personChi) {
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

      return {
        tuoi_mu: tuoiMu,
        age_lunar: tuoiMu,
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
      const yearSuitability = this.evaluateYearSuitability(birthYear, targetYear, personChi);

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
            house_sitting: houseSitting
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
  }

  global.NetaTrachNhatEngine = new TrachNhatEngine();
  global.TrachNhatEngine = TrachNhatEngine;

})(typeof window !== "undefined" ? window : globalThis);
