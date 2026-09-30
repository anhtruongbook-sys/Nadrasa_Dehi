/**
 * NETA LIGHT - LỤC HÀO 2.0 ADVANCED ENGINE (engines/luc_hao_2_engine.js)
 * 
 * ĐỘNG CƠ DỊCH HỌC KHOA HỌC THẾ HỆ MỚI (LUC HAO 2.0)
 * Hiện thực hóa toàn diện:
 * 1. Lập quẻ Bát Cung Nạp Giáp độc lập 100% (HexagramBuilder).
 * 2. Ma trận tương tác kề 8x8 & Lan truyền năng lượng đồ thị rời rạc (GraphDiffusionEngine).
 * 3. Trình giải mã hàm mục tiêu đa chiều & Hàm hữu dụng E[U] (MultiObjectiveIntentResolver).
 * 4. Động cơ giao thoa sóng lượng giác 12 Địa Chi tính Ứng kỳ (HarmonicTimingEngine).
 * 5. Hệ thống "Nhất Quái Đa Đoán" chuẩn Lý Kế Trung (NhatQuaiDaDoanEngine: 6 lăng kính + Radar hiểm họa ngầm).
 * 6. Động cơ nghiệm chứng hiện trạng 3 trục (GroundTruthVerificationEngine: Thể trạng, Gia trạch, Biến cố).
 * 7. Động cơ sinh luận giải văn xuôi 7 phần học thuật (DeepNarrativeEngine: 12 phân hệ chuyên sâu).
 * 
 * Hoàn toàn chạy Client-side 100% Offline trên Web & Mobile APK (Flutter Webview).
 */

(function (global) {
  'use strict';

  // =========================================================================
  // 1. CÁC NGUYÊN LÝ DỊCH HỌC NÂNG CAO (ADVANCED DICH RULES)
  // =========================================================================
  const AdvancedDichRules = {
    THIEN_AT_QUY_NHAN: {
      "Giáp": ["Sửu", "Mùi"], "Mậu": ["Sửu", "Mùi"], "Canh": ["Sửu", "Mùi"],
      "Ất":   ["Tý", "Thân"],  "Kỷ":  ["Tý", "Thân"],
      "Bính": ["Hợi", "Dậu"],  "Đinh": ["Hợi", "Dậu"],
      "Nhâm": ["Mão", "Tỵ"],   "Quý":  ["Mão", "Tỵ"],
      "Tân":  ["Ngọ", "Dần"]
    },

    LOC_THAN: {
      "Giáp": "Dần", "Ất": "Mão", "Bính": "Tỵ", "Đinh": "Ngọ",
      "Mậu": "Tỵ",  "Kỷ": "Ngọ", "Canh": "Thân", "Tân": "Dậu",
      "Nhâm": "Hợi", "Quý": "Tý"
    },

    DUONG_NHAN: {
      "Giáp": "Mão", "Ất": "Dần", "Bính": "Ngọ", "Đinh": "Tỵ",
      "Mậu": "Ngọ",  "Kỷ": "Tỵ", "Canh": "Dậu", "Tân": "Thân",
      "Nhâm": "Tý",  "Quý": "Hợi"
    },

    DICH_MA: {
      "Thân": "Dần", "Tý": "Dần", "Thìn": "Dần",
      "Dần": "Thân", "Ngọ": "Thân", "Tuất": "Thân",
      "Tỵ": "Hợi",  "Dậu": "Hợi",  "Sửu": "Hợi",
      "Hợi": "Tỵ",  "Mão": "Tỵ",  "Mùi": "Tỵ"
    },

    DAO_HOA: {
      "Thân": "Dậu", "Tý": "Dậu", "Thìn": "Dậu",
      "Dần": "Mão", "Ngọ": "Mão", "Tuất": "Mão",
      "Tỵ": "Ngọ",  "Dậu": "Ngọ",  "Sửu": "Ngọ",
      "Hợi": "Tý",  "Mão": "Tý",  "Mùi": "Tý"
    },

    HOA_CAI: {
      "Thân": "Thìn", "Tý": "Thìn", "Thìn": "Thìn",
      "Dần": "Tuất", "Ngọ": "Tuất", "Tuất": "Tuất",
      "Tỵ": "Sửu",  "Dậu": "Sửu",  "Sửu": "Sửu",
      "Hợi": "Mùi",  "Mão": "Mùi",  "Mùi": "Mùi"
    },

    TIEN_THAN: {
      "Dần": "Mão", "Tỵ": "Ngọ", "Thân": "Dậu", "Hợi": "Tý",
      "Sửu": "Thìn", "Thìn": "Mùi", "Mùi": "Tuất"
    },

    THOAI_THAN: {
      "Mão": "Dần", "Ngọ": "Tỵ", "Dậu": "Thân", "Tý": "Hợi",
      "Thìn": "Sửu", "Mùi": "Thìn", "Tuất": "Mùi"
    },

    QUE_LUC_XUNG: new Set([
      "Thuần Càn", "Thuần Khôn", "Thuần Chấn", "Thuần Tốn",
      "Thuần Khảm", "Thuần Ly", "Thuần Cấn", "Thuần Đoài",
      "Thiên Lôi Vô Vọng", "Lôi Thiên Đại Tráng"
    ]),

    QUE_LUC_HOP: new Set([
      "Địa Thiên Thái", "Thiên Địa Bĩ", "Thủy Trạch Tiết", "Sơn Hỏa Bí",
      "Địa Lôi Phục", "Lôi Địa Dự", "Hỏa Sơn Lữ", "Trạch Thủy Khốn"
    ]),

    TAM_HOP_SPECS: {
      "Thân,Tý,Thìn": { cuc_name: "Thủy Cục", elem: "Thủy", branches: ["Thân", "Tý", "Thìn"] },
      "Hợi,Mão,Mùi":  { cuc_name: "Mộc Cục",  elem: "Mộc",  branches: ["Hợi", "Mão", "Mùi"] },
      "Dần,Ngọ,Tuất": { cuc_name: "Hỏa Cục",  elem: "Hỏa",  branches: ["Dần", "Ngọ", "Tuất"] },
      "Tỵ,Dậu,Sửu":   { cuc_name: "Kim Cục",  elem: "Kim",  branches: ["Tỵ", "Dậu", "Sửu"] }
    },

    LUC_HOP_MAP: {
      "Tý": "Sửu", "Sửu": "Tý", "Dần": "Hợi", "Hợi": "Dần",
      "Mão": "Tuất", "Tuất": "Mão", "Thìn": "Dậu", "Dậu": "Thìn",
      "Tỵ": "Thân", "Thân": "Tỵ", "Ngọ": "Mùi", "Mùi": "Ngọ"
    },

    LUC_XUNG_MAP: {
      "Tý": "Ngọ", "Ngọ": "Tý", "Sửu": "Mùi", "Mùi": "Sửu",
      "Dần": "Thân", "Thân": "Dần", "Mão": "Dậu", "Dậu": "Mão",
      "Thìn": "Tuất", "Tuất": "Thìn", "Tỵ": "Hợi", "Hợi": "Tỵ"
    },

    MO_MAP:    { "Mộc": "Mùi", "Hỏa": "Tuất", "Thổ": "Thìn", "Kim": "Sửu", "Thủy": "Thìn" },
    TUYET_MAP: { "Mộc": "Thân", "Hỏa": "Hợi", "Thổ": "Tỵ",  "Kim": "Dần", "Thủy": "Tỵ" },

    getShenShaForHao(branch, dayCan, dayChi) {
      const stars = [];
      const quy = this.THIEN_AT_QUY_NHAN[dayCan] || [];
      if (quy.includes(branch)) stars.push("Quý Nhân");
      if (branch === this.LOC_THAN[dayCan]) stars.push("Lộc Thần");
      if (branch === this.DUONG_NHAN[dayCan]) stars.push("Dương Nhận");
      if (branch === this.DICH_MA[dayChi]) stars.push("Dịch Mã");
      if (branch === this.DAO_HOA[dayChi]) stars.push("Đào Hoa");
      if (branch === this.HOA_CAI[dayChi]) stars.push("Hoa Cái");
      return stars;
    },

    analyzeMovingLineDynamics(movingBranch, movingElem, changedBranch, changedElem, tuanKhong, monthChi) {
      const sinhMap = { "Thủy": "Mộc", "Mộc": "Hỏa", "Hỏa": "Thổ", "Thổ": "Kim", "Kim": "Thủy" };
      const khacMap = { "Thủy": "Hỏa", "Hỏa": "Kim", "Kim": "Mộc", "Mộc": "Thổ", "Thổ": "Thủy" };

      let hoiDau = "BÌNH_THƯỜNG";
      let hoiDauDesc = "";

      if (sinhMap[changedElem] === movingElem) {
        hoiDau = "HOI_DAU_SINH";
        hoiDauDesc = `Hồi Đầu Sinh (Biến hào ${changedBranch} ${changedElem} sinh trợ bản thân: Nguồn lực được tăng cường, có thêm trợ lực)`;
      } else if (khacMap[changedElem] === movingElem) {
        hoiDau = "HOI_DAU_KHAC";
        hoiDauDesc = `Hồi Đầu Khắc (Biến hào ${changedBranch} ${changedElem} khắc chế động hào: Bất lợi, hành động phát sinh dễ gặp trở ngại)`;
      }

      let tienThoai = "KHONG";
      let tienThoaiDesc = "";
      if (this.TIEN_THAN[movingBranch] === changedBranch) {
        tienThoai = "TIEN_THAN";
        tienThoaiDesc = `Tiến Thần (${movingBranch} hóa ${changedBranch}: Xu thế phát triển thuận lợi, thế lực được củng cố và gia tăng)`;
      } else if (this.THOAI_THAN[movingBranch] === changedBranch) {
        tienThoai = "THOAI_THAN";
        tienThoaiDesc = `Thoái Thần (${movingBranch} thoái ${changedBranch}: Khí thế giảm sút, tiến độ chững lại, có xu hướng rút lui)`;
      }

      const hoaMo = (this.MO_MAP[movingElem] === changedBranch);
      const hoaMoDesc = hoaMo ? `Hóa Mộ (Động biến nhập Mộ tại ${changedBranch}: Nguồn lực bị lưu giữ hoặc tạm thời hạn chế phát huy, cần thời điểm xung khai)` : "";

      const hoaTuyet = (this.TUYET_MAP[movingElem] === changedBranch);
      const hoaTuyetDesc = hoaTuyet ? `Hóa Tuyệt (Động biến lâm Tuyệt địa tại ${changedBranch}: Năng lượng suy giảm mạnh, cần thời gian tích lũy lại)` : "";

      const hoaKhong = (tuanKhong || []).includes(changedBranch);
      const hoaKhongDesc = hoaKhong ? `Hóa Tuần Không (Biến hào ${changedBranch} lâm Không: Kết quả chưa định hình rõ ràng, cần chờ thời điểm xuất Không)` : "";

      const hoaPha = (this.LUC_XUNG_MAP[changedBranch] === monthChi);
      const hoaPhaDesc = hoaPha ? `Hóa Nguyệt Phá (Biến hào ${changedBranch} bị Nguyệt Phá: Kết quả dễ bị tác động hoặc thay đổi bởi yếu tố bên ngoài)` : "";

      return {
        hoi_dau: hoiDau,
        hoi_dau_desc: hoiDauDesc,
        tien_thoai: tienThoai,
        tien_thoai_desc: tienThoaiDesc,
        hoa_mo: hoaMo,
        hoa_mo_desc: hoaMoDesc,
        hoa_tuyet: hoaTuyet,
        hoa_tuyet_desc: hoaTuyetDesc,
        hoa_khong: hoaKhong,
        hoa_khong_desc: hoaKhongDesc,
        hoa_pha: hoaPha,
        hoa_pha_desc: hoaPhaDesc
      };
    },

    detectTamHop(haos, monthChi, dayChi) {
      const mainBranches = haos.map(h => h.branch);
      const movingBranches = haos.filter(h => h.is_moving).map(h => h.branch);
      const detected = [];

      for (const key of Object.keys(this.TAM_HOP_SPECS)) {
        const spec = this.TAM_HOP_SPECS[key];
        const [b1, b2, b3] = spec.branches;

        if (mainBranches.includes(b1) && mainBranches.includes(b2) && mainBranches.includes(b3)) {
          const hasMoving = [b1, b2, b3].some(b => movingBranches.includes(b));
          detected.push({
            cuc_name: spec.cuc_name,
            element: spec.elem,
            branches: [b1, b2, b3],
            type: hasMoving ? "TAM_HOP_TOAN_QUAI" : "TAM_HOP_TINH_CUC",
            description: `Tam Hợp ${spec.cuc_name} (${b1}-${b2}-${b3}) tụ hội trên quẻ: Tích tụ trường năng lượng ${spec.elem} cực thịnh, chi phối toàn bộ khí vận bàn quẻ.`
          });
        } else {
          const inMoving = spec.branches.filter(b => movingBranches.includes(b));
          if (inMoving.length >= 2) {
            const missing = spec.branches.find(b => !movingBranches.includes(b));
            if (missing === monthChi || missing === dayChi) {
              detected.push({
                cuc_name: spec.cuc_name,
                element: spec.elem,
                branches: [b1, b2, b3],
                type: "TAM_HOP_DONG_HOA_NHAT_NGUYET",
                description: `Tam Hợp ${spec.cuc_name} do các hào động phối hợp với Nhật/Nguyệt ${missing} thành cục: Được thời vận thiên cơ trợ lực cực mạnh.`
              });
            }
          }
        }
      }
      return detected;
    },

    detectTamHinh(haos, monthChi, dayChi) {
      const branches = new Set([...haos.map(h => h.branch), monthChi, dayChi]);
      const hinhList = [];

      if (branches.has("Dần") && branches.has("Tỵ") && branches.has("Thân")) {
        hinhList.push("Tam Hình (Dần - Tỵ - Thân Trì Thế Hình): Cảnh báo xung đột quyền lực gay gắt, tai ách pháp luật hoặc phẫu thuật thương tật.");
      }
      if (branches.has("Sửu") && branches.has("Tuất") && branches.has("Mùi")) {
        hinhList.push("Tam Hình (Sửu - Tuất - Mùi Vô Ân Hình): Đề phòng người thân tín làm phản, ân đền oán trả, tranh chấp đất đai tài sản.");
      }
      if (branches.has("Tý") && branches.has("Mão")) {
        hinhList.push("Tương Hình (Tý - Mão Vô Lễ Hình): Mâu thuẫn lễ nghĩa, thị phi điều tiếng, bất hòa giữa các thế hệ hoặc trong tình cảm.");
      }

      return hinhList;
    },

    classifyHexagramSpecialStructure(hexName, palaceRole) {
      const isLucXung = this.QUE_LUC_XUNG.has(hexName);
      const isLucHop = this.QUE_LUC_HOP.has(hexName);
      const isDuHon = (palaceRole === "Du Hồn");
      const isQuyHon = (palaceRole === "Quy Hồn");

      const notes = [];
      if (isLucXung) {
        notes.push("Quẻ Lục Xung: Khí trường xung tán dữ dội. Sự việc biến động mau chóng, việc gấp thì chóng thành, việc lâu dài dễ tan rã; xem bệnh cấp tính mau khỏi, bệnh mạn tính thì nguy.");
      }
      if (isLucHop) {
        notes.push("Quẻ Lục Hợp: Khí trường kết dính, hòa hợp bền chặt. Thuận lợi cho hợp tác, hôn nhân, đàm phán lâu dài; nhưng việc xấu gặp hợp thì dây dưa khó dứt.");
      }
      if (isDuHon) {
        notes.push("Quẻ Du Hồn: Biểu thị tâm thần bất định, tha hương bôn ba, phương hướng chao đảo chưa có chỗ dừng chân vững chắc.");
      }
      if (isQuyHon) {
        notes.push("Quẻ Quy Hồn: Biểu thị quay về chốn cũ, thu hồi vốn liếng, ràng buộc gia tộc, không nên đi xa, sự việc quay về vạch xuất phát.");
      }

      return {
        is_luc_xung: isLucXung,
        is_luc_hop: isLucHop,
        is_du_hon: isDuHon,
        is_quy_hon: isQuyHon,
        special_notes: notes
      };
    }
  };

  // =========================================================================
  // 2. ĐỊNH LƯỢNG NĂNG LƯỢNG NGŨ HÀNH & MA TRẬN KỀ 8X8
  // =========================================================================
  const FiveElementsEnergy = {
    ELEMENTS: ["Thủy", "Mộc", "Hỏa", "Thổ", "Kim"],

    INTERACTION_WEIGHTS: {
      "Thủy,Mộc": 1.0,  "Mộc,Hỏa": 1.0,  "Hỏa,Thổ": 1.0,  "Thổ,Kim": 1.0,  "Kim,Thủy": 1.0,
      "Mộc,Thủy": -0.4, "Hỏa,Mộc": -0.4, "Thổ,Hỏa": -0.4, "Kim,Thổ": -0.4, "Thủy,Kim": -0.4,
      "Thủy,Hỏa": -1.0, "Hỏa,Kim": -1.0, "Kim,Mộc": -1.0, "Mộc,Thổ": -1.0, "Thổ,Thủy": -1.0,
      "Hỏa,Thủy": -0.6, "Kim,Hỏa": -0.6, "Mộc,Kim": -0.6, "Thổ,Mộc": -0.6, "Thủy,Thổ": -0.6
    },

    BRANCH_ELEMENTS: {
      "Tý": "Thủy", "Hợi": "Thủy",
      "Dần": "Mộc", "Mão": "Mộc",
      "Tỵ": "Hỏa",  "Ngọ": "Hỏa",
      "Thân": "Kim", "Dậu": "Kim",
      "Thìn": "Thổ", "Tuất": "Thổ", "Sửu": "Thổ", "Mùi": "Thổ"
    },

    CLASH_PAIRS: new Set([
      "Tý,Ngọ", "Ngọ,Tý", "Sửu,Mùi", "Mùi,Sửu",
      "Dần,Thân", "Thân,Dần", "Mão,Dậu", "Dậu,Mão",
      "Thìn,Tuất", "Tuất,Thìn", "Tỵ,Hợi", "Hợi,Tỵ"
    ]),

    COMBINE_PAIRS: new Set([
      "Tý,Sửu", "Sửu,Tý", "Dần,Hợi", "Hợi,Dần",
      "Mão,Tuất", "Tuất,Mão", "Thìn,Dậu", "Dậu,Thìn",
      "Tỵ,Thân", "Thân,Tỵ", "Ngọ,Mùi", "Mùi,Ngọ"
    ]),

    getInteraction(fromElem, toElem) {
      if (fromElem === toElem) return 0.5; // Tỷ hòa đồng pha
      const key = `${fromElem},${toElem}`;
      return this.INTERACTION_WEIGHTS[key] || 0.0;
    }
  };

  class HexagramNode {
    constructor(nodeId, label, branch, lucThan, isThe = false, isUng = false, isMoving = false, changedBranch = null) {
      this.node_id = nodeId;
      this.label = label;
      this.branch = branch;
      this.element = FiveElementsEnergy.BRANCH_ELEMENTS[branch] || "Thổ";
      this.luc_than = lucThan;
      this.is_the = isThe;
      this.is_ung = isUng;
      this.is_moving = isMoving;
      this.changed_branch = changedBranch;
      this.changed_element = changedBranch ? (FiveElementsEnergy.BRANCH_ELEMENTS[changedBranch] || "") : "";
      this.base_energy = 1.0;
      this.current_energy = 1.0;
    }
  }

  const EnergyMatrixBuilder = {
    buildMatrix(nodes, monthBranch, dayBranch) {
      const allNodes = nodes.map(n => Object.assign(Object.create(Object.getPrototypeOf(n)), n));

      // Nút 7: Nguyệt Lệnh (Mùa)
      const monthNode = new HexagramNode(7, "Nguyệt Lệnh", monthBranch, "Môi Trường");
      monthNode.base_energy = 5.0;

      // Nút 8: Nhật Thần (Xung Lực)
      const dayNode = new HexagramNode(8, "Nhật Thần", dayBranch, "Xung Lực");
      dayNode.base_energy = 4.0;

      allNodes.push(monthNode, dayNode);
      const n = allNodes.length; // 8
      const W = Array.from({ length: n }, () => Array(n).fill(0.0));

      for (let i = 0; i < n; i++) {
        const nodeI = allNodes[i];
        for (let j = 0; j < n; j++) {
          if (i === j) {
            W[i][j] = 0.1;
            continue;
          }
          const nodeJ = allNodes[j];
          let baseW = FiveElementsEnergy.getInteraction(nodeI.element, nodeJ.element);

          const pair = `${nodeI.branch},${nodeJ.branch}`;
          if (FiveElementsEnergy.COMBINE_PAIRS.has(pair)) baseW += 1.5;
          if (FiveElementsEnergy.CLASH_PAIRS.has(pair))   baseW -= 2.0;

          if (nodeI.is_moving && nodeI.changed_branch && i < 6 && j < 6) {
            baseW *= 1.8;
          }

          if (i >= 6 && j < 6) {
            baseW *= 1.5; // Ảnh hưởng 1 chiều từ Nhật / Nguyệt xuống 6 hào
          } else if (i < 6 && j >= 6) {
            baseW = 0.0;  // 6 hào không tác động ngược lại Nhật Nguyệt
          }

          W[i][j] = Math.round(baseW * 10000) / 10000;
        }
      }
      return { W, allNodes };
    }
  };

  // =========================================================================
  // 3. ĐỘNG CƠ LAN TRUYỀN NĂNG LƯỢNG ĐỒ THỊ (GRAPH DIFFUSION ENGINE)
  // =========================================================================
  class GraphDiffusionEngine {
    constructor(nodes, monthBranch, dayBranch, alpha = 0.65, beta = 0.35, maxIterations = 50, tolerance = 1e-4) {
      this.rawNodes = nodes;
      this.monthBranch = monthBranch;
      this.dayBranch = dayBranch;
      this.alpha = alpha;
      this.beta = beta;
      this.maxIterations = maxIterations;
      this.tolerance = tolerance;

      const built = EnergyMatrixBuilder.buildMatrix(nodes, monthBranch, dayBranch);
      this.W = built.W;
      this.allNodes = built.allNodes;
      this.numNodes = this.allNodes.length; // 8
    }

    runDiffusion() {
      let x = this.allNodes.map(n => n.base_energy);
      let converged = false;
      let iterationCount = 0;

      for (let it = 0; it < this.maxIterations; it++) {
        iterationCount++;
        const xNew = Array(this.numNodes).fill(0.0);

        for (let j = 0; j < this.numNodes; j++) {
          const selfEnergy = this.alpha * x[j];
          let incomingEnergy = 0.0;
          for (let i = 0; i < this.numNodes; i++) {
            incomingEnergy += this.W[i][j] * x[i];
          }

          const totalVal = selfEnergy + this.beta * incomingEnergy;

          if (j >= 6) {
            xNew[j] = this.allNodes[j].base_energy;
          } else {
            xNew[j] = Math.round(10.0 * Math.tanh(totalVal / 8.0) * 10000) / 10000;
          }
        }

        let delta = 0.0;
        for (let k = 0; k < 6; k++) delta += Math.abs(xNew[k] - x[k]);
        x = xNew;

        if (delta < this.tolerance) {
          converged = true;
          break;
        }
      }

      const resultsNodes = [];
      for (let idx = 0; idx < 6; idx++) {
        const node = this.allNodes[idx];
        const finalEnergy = x[idx];
        let spectrum = "";
        if (finalEnergy >= 4.0) spectrum = "ĐẮC LỆNH VƯỢNG TƯỚNG (Khí thế dồi dào, thuận lợi lớn)";
        else if (finalEnergy >= 1.5) spectrum = "HƯU TÙ PHÙNG SINH (Có trợ lực, tiến triển tốt)";
        else if (finalEnergy >= -1.5) spectrum = "BÌNH HÒA TRUNG HÒA (Khí vận cân bằng, ổn định)";
        else if (finalEnergy >= -4.0) spectrum = "HƯU TÙ THIẾU KHÍ (Hao tổn nội lực, cần bổ trợ)";
        else spectrum = "HƯU TÙ BỊ KHẮC (Suy thoái, chịu áp lực lớn)";

        resultsNodes.push({
          position: node.node_id,
          label: node.label,
          branch: node.branch,
          element: node.element,
          luc_than: node.luc_than,
          is_the: node.is_the,
          is_ung: node.is_ung,
          is_moving: node.is_moving,
          changed_branch: node.changed_branch,
          equilibrium_energy: finalEnergy,
          energy_spectrum: spectrum
        });
      }

      const sum6 = x.slice(0, 6).reduce((a, b) => a + b, 0);
      const avg6 = sum6 / 6;
      const variance6 = x.slice(0, 6).reduce((acc, v) => acc + Math.pow(v - avg6, 2), 0) / 6;

      return {
        converged,
        iterations: iterationCount,
        month_field: `${this.monthBranch} (${FiveElementsEnergy.BRANCH_ELEMENTS[this.monthBranch] || ''})`,
        day_impulse: `${this.dayBranch} (${FiveElementsEnergy.BRANCH_ELEMENTS[this.dayBranch] || ''})`,
        nodes_state: resultsNodes,
        total_system_energy: Math.round(sum6 * 10000) / 10000,
        energy_variance: Math.round(variance6 * 10000) / 10000
      };
    }
  }

  // =========================================================================
  // 4. HÀM MỤC TIÊU ĐA CHIỀU (MULTI-OBJECTIVE INTENT RESOLVER)
  // =========================================================================
  const MultiObjectiveIntentResolver = {
    DOMAINS_MAP: {
      "TAI_CHINH_DAU_TU": "Tài Chính, Đầu Tư & Dòng Tiền",
      "BAT_DONG_SAN_DAT_DAI": "Bất Động Sản, Nhà Đất & Sang Nhượng",
      "CONG_DANH_SU_NGHIEP": "Công Danh, Sự Nghiệp & Tuyển Dụng",
      "THI_CU_HOC_VAN": "Thi Cử, Học Vấn & Bằng Cấp",
      "PHAP_LY_TRANH_CHAP": "Pháp Lý, Kiện Tụng & Tranh Chấp",
      "HON_NHAN_TINH_CAM": "Hôn Nhân, Tình Cảm & Gia Đạo",
      "THAI_SAN_SINH_NO": "Thai Sản, Sinh Nở & Con Cái",
      "SUC_KHOE_BENH_TAT": "Sức Khỏe, Bệnh Tật & Thể Trạng",
      "PHONG_THUY_GIA_TRACH": "Phong Thủy, Gia Trạch & Môi Trường Sống",
      "XUAT_HANH_GIAO_THONG": "Xuất Hành, Giao Thông & Di Chuyển",
      "TIM_NGUOI_TIM_VAT": "Tìm Người Mất Tích & Đồ Vật Thất Lạc",
      "CHIEM_VAN_TONG_QUAN": "Chiêm Đoán Toàn Cảnh & Thời Thế Đời Sống"
    },

    detectDomain(question) {
      if (!question || !question.trim()) return "CHIEM_VAN_TONG_QUAN";
      const q = question.toLowerCase().trim();

      const generalTerms = ["vận", "thời vận", "hôm nay", "năm nay", "thế nào", "tổng quan", "xem quẻ", "gieo quẻ", "chiêm quẻ", "bói"];
      const hasGeneral = generalTerms.some(term => q.includes(term));
      const specificKeywords = [
        "tiền", "lãi", "lợi nhuận", "đầu tư", "nợ", "bán", "mua", "việc", "chức", "thăng", "sếp",
        "cưới", "yêu", "vợ", "chồng", "bệnh", "mổ", "nhà", "đất", "kiện", "con", "bầu", "thai", "xe", "mất", "tìm"
      ];
      if (hasGeneral && !specificKeywords.some(w => q.includes(w))) {
        return "CHIEM_VAN_TONG_QUAN";
      }

      if (["đất", "mua nhà", "bán nhà", "sổ đỏ", "bất động sản", "mặt bằng", "nhà đất"].some(w => q.includes(w))) {
        return "BAT_DONG_SAN_DAT_DAI";
      }
      if (["mang thai", "sinh con", "có bầu", "thai nhi", "sảy thai", "sinh mổ", "sinh thường", "trai hay gái", "giới tính thai"].some(w => q.includes(w))) {
        return "THAI_SAN_SINH_NO";
      }
      if (["thi", "đỗ", "đậu", "rớt", "điểm", "bằng", "chứng chỉ", "nguyện vọng", "học vị", "tốt nghiệp", "khảo thí"].some(w => q.includes(w))) {
        return "THI_CU_HOC_VAN";
      }
      if (["kiện", "tòa", "công an", "phạt", "tranh chấp", "bắt", "tù", "tội", "án", "luật sư"].some(w => q.includes(w))) {
        return "PHAP_LY_TRANH_CHAP";
      }
      if (["xuất hành", "đi xa", "du học", "xuất ngoại", "công tác", "chuyến bay", "lộ trình", "xe cộ"].some(w => q.includes(w))) {
        return "XUAT_HANH_GIAO_THONG";
      }
      if (["mất đồ", "rơi đồ", "thất lạc", "trộm", "tìm người", "bỏ nhà", "mất tích", "tìm ví", "tìm chìa khóa", "bị mất", "đánh rơi", "rơi mất", "tìm đồ", "tìm lại", "để quên", "ở đâu"].some(w => q.includes(w))) {
        return "TIM_NGUOI_TIM_VAT";
      }
      if (["bệnh", "đau", "ốm", "thuốc", "mổ", "bác sĩ", "viện", "khỏe", "chết", "sống", "ung thư", "dạ dày", "tim"].some(w => q.includes(w))) {
        return "SUC_KHOE_BENH_TAT";
      }
      if (["yêu", "vợ", "chồng", "cưới", "ly hôn", "tình", "người yêu", "bạn gái", "bạn trai", "ngoại tình", "chia tay"].some(w => q.includes(w))) {
        return "HON_NHAN_TINH_CAM";
      }
      if (["phong thủy", "hướng nhà", "bếp", "bàn thờ", "chuyển nhà", "sửa nhà", "mộ", "mồ mả"].some(w => q.includes(w))) {
        return "PHONG_THUY_GIA_TRACH";
      }
      if (["việc", "chức", "bổ nhiệm", "thăng", "sếp", "công ty", "tuyển dụng", "phỏng vấn", "xin việc", "điều động"].some(w => q.includes(w))) {
        return "CONG_DANH_SU_NGHIEP";
      }
      if (["tiền", "tài", "lãi", "lợi nhuận", "doanh thu", "vay", "nợ", "đầu tư", "bán", "mua", "giá", "kinh doanh", "mở cửa hàng", "xưởng"].some(w => q.includes(w))) {
        return "TAI_CHINH_DAU_TU";
      }

      return "CHIEM_VAN_TONG_QUAN";
    },

    resolveIntentWeights(question) {
      const domain = this.detectDomain(question);

      const weightsByDomain = {
        "TAI_CHINH_DAU_TU":     { "Thê Tài": 2.5, "Tử Tôn": 1.2, "Huynh Đệ": -1.2, "Quan Quỷ": -0.5, "Phụ Mẫu": 0.0, "Hào Thế": 1.0 },
        "BAT_DONG_SAN_DAT_DAI": { "Thê Tài": 2.0, "Phụ Mẫu": 2.0, "Huynh Đệ": -0.8, "Quan Quỷ": 0.5, "Tử Tôn": 0.8, "Hào Thế": 1.0 },
        "CONG_DANH_SU_NGHIEP":  { "Quan Quỷ": 2.5, "Phụ Mẫu": 1.5, "Tử Tôn": -1.0, "Huynh Đệ": -0.5, "Thê Tài": 0.5, "Hào Thế": 1.2 },
        "THI_CU_HOC_VAN":       { "Phụ Mẫu": 2.5, "Quan Quỷ": 1.8, "Tử Tôn": -1.2, "Huynh Đệ": 0.0, "Thê Tài": -0.5, "Hào Thế": 1.0 },
        "PHAP_LY_TRANH_CHAP":   { "Quan Quỷ": -2.5, "Tử Tôn": 2.0, "Phụ Mẫu": 1.2, "Huynh Đệ": -0.8, "Thê Tài": 0.0, "Hào Thế": 1.5 },
        "HON_NHAN_TINH_CAM":   { "Thê Tài": 1.5, "Quan Quỷ": 1.5, "Huynh Đệ": -1.2, "Phụ Mẫu": 0.8, "Tử Tôn": 0.8, "Hào Thế": 1.5 },
        "THAI_SAN_SINH_NO":     { "Tử Tôn": 2.8, "Phụ Mẫu": -1.5, "Quan Quỷ": -1.0, "Huynh Đệ": 0.0, "Thê Tài": 0.8, "Hào Thế": 1.5 },
        "SUC_KHOE_BENH_TAT":    { "Tử Tôn": 2.5, "Quan Quỷ": -2.5, "Phụ Mẫu": -0.5, "Thê Tài": 0.0, "Huynh Đệ": 0.0, "Hào Thế": 2.0 },
        "PHONG_THUY_GIA_TRACH": { "Phụ Mẫu": 2.2, "Quan Quỷ": -1.2, "Tử Tôn": 1.0, "Thê Tài": 1.0, "Huynh Đệ": -0.5, "Hào Thế": 1.5 },
        "XUAT_HANH_GIAO_THONG": { "Phụ Mẫu": 1.5, "Tử Tôn": 1.5, "Quan Quỷ": -1.8, "Huynh Đệ": -0.5, "Thê Tài": 0.8, "Hào Thế": 2.0 },
        "TIM_NGUOI_TIM_VAT":    { "Thê Tài": 1.5, "Phụ Mẫu": 1.5, "Tử Tôn": 1.2, "Quan Quỷ": -1.0, "Huynh Đệ": -0.8, "Hào Thế": 1.5 },
        "CHIEM_VAN_TONG_QUAN":  { "Hào Thế": 2.5, "Thê Tài": 1.2, "Tử Tôn": 1.2, "Phụ Mẫu": 1.0, "Quan Quỷ": 0.6, "Huynh Đệ": -0.6 }
      };

      const raw = weightsByDomain[domain] || weightsByDomain["CHIEM_VAN_TONG_QUAN"];
      const totalW = Object.values(raw).reduce((acc, v) => acc + Math.abs(v), 0);
      const res = {};
      for (const [k, v] of Object.entries(raw)) {
        res[k] = Math.round((v / totalW) * 1000) / 1000;
      }
      return res;
    },

    evaluateUtility(weights, equilibriumNodes) {
      const lucThanEnergy = { "Thê Tài": [], "Quan Quỷ": [], "Phụ Mẫu": [], "Tử Tôn": [], "Huynh Đệ": [] };
      let theEnergy = 0.0;
      let ungEnergy = 0.0;

      for (const n of equilibriumNodes) {
        const lt = n.luc_than;
        const e = n.equilibrium_energy;
        if (lucThanEnergy[lt]) lucThanEnergy[lt].push(e);
        if (n.is_the) theEnergy = e;
        if (n.is_ung) ungEnergy = e;
      }

      const ltAvg = {};
      for (const [lt, vals] of Object.entries(lucThanEnergy)) {
        ltAvg[lt] = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length) : 0.0;
      }

      let totalUtility = 0.0;
      const breakdown = {};
      for (const [lt, w] of Object.entries(weights)) {
        let score = 0.0;
        let eVal = 0.0;
        if (lt === "Hào Thế") {
          eVal = theEnergy;
          score = w * theEnergy;
        } else if (ltAvg[lt] !== undefined) {
          eVal = ltAvg[lt];
          score = w * ltAvg[lt];
        }
        breakdown[lt] = { weight: w, energy: Math.round(eVal * 100) / 100, contribution: Math.round(score * 1000) / 1000 };
        totalUtility += score;
      }
      totalUtility = Math.round(totalUtility * 1000) / 1000;

      let decision = "";
      let probSuccess = 0.5;

      if (totalUtility >= 2.5) {
        decision = "TỐI ƯU CỰC ĐẠI / TOÀN NĂNG THẮNG LỢI";
        probSuccess = 0.92;
      } else if (totalUtility >= 0.8) {
        decision = "KHẢ THI TÍCH CỰC / ĐẠT KẾT QUẢ KỲ VỌNG";
        probSuccess = 0.75;
      } else if (totalUtility >= -0.8) {
        decision = "TRẠNG THÁI GIẰNG CO / NỖ LỰC CÂN BẰNG NGUỒN LỰC";
        probSuccess = 0.50;
      } else if (totalUtility >= -2.5) {
        decision = "BẤT LỢI SUY HAO / RỦI RO TIỀM ẨN CAO";
        probSuccess = 0.28;
      } else {
        decision = "TRIỆT TIÊU ĐỔ VỠ / ĐÌNH CHỈ KHẨN CẤP";
        probSuccess = 0.08;
      }

      return {
        total_utility: totalUtility,
        success_probability: probSuccess,
        decision,
        the_vs_ung_gradient: Math.round((theEnergy - ungEnergy) * 1000) / 1000,
        breakdown,
        target_weights: weights
      };
    }
  };

  // =========================================================================
  // 5. ĐỘNG CƠ ĐỊNH THỜI ĐIỂM ỨNG KỲ CHUẨN LỤC HÀO CỔ TRUYỀN (DÃ HẠC THẦN KHÓA)
  // =========================================================================
  const HarmonicTimingEngine = {
    BRANCHES: ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"],

    BRANCH_META: {
      "Tý": { element: "Thủy", lucHop: "Sửu", lucXung: "Ngọ", sinh: "Thân", mo: "Thìn", tuyet: "Tỵ" },
      "Sửu": { element: "Thổ", lucHop: "Tý", lucXung: "Mùi", sinh: "Tỵ", mo: "Thìn", tuyet: "Hợi" },
      "Dần": { element: "Mộc", lucHop: "Hợi", lucXung: "Thân", sinh: "Hợi", mo: "Mùi", tuyet: "Thân" },
      "Mão": { element: "Mộc", lucHop: "Tuất", lucXung: "Dậu", sinh: "Hợi", mo: "Mùi", tuyet: "Thân" },
      "Thìn": { element: "Thổ", lucHop: "Dậu", lucXung: "Tuất", sinh: "Ngọ", mo: "Thìn", tuyet: "Hợi" },
      "Tỵ": { element: "Hỏa", lucHop: "Thân", lucXung: "Hợi", sinh: "Dần", mo: "Tuất", tuyet: "Hợi" },
      "Ngọ": { element: "Hỏa", lucHop: "Mùi", lucXung: "Tý", sinh: "Dần", mo: "Tuất", tuyet: "Hợi" },
      "Mùi": { element: "Thổ", lucHop: "Ngọ", lucXung: "Sửu", sinh: "Tỵ", mo: "Mùi", tuyet: "Tỵ" },
      "Thân": { element: "Kim", lucHop: "Tỵ", lucXung: "Dần", sinh: "Thìn", mo: "Sửu", tuyet: "Dần" },
      "Dậu": { element: "Kim", lucHop: "Thìn", lucXung: "Mão", sinh: "Sửu", mo: "Sửu", tuyet: "Dần" },
      "Tuất": { element: "Thổ", lucHop: "Mão", lucXung: "Thìn", sinh: "Ngọ", mo: "Tuất", tuyet: "Tỵ" },
      "Hợi": { element: "Thủy", lucHop: "Dần", lucXung: "Tỵ", sinh: "Dậu", mo: "Thìn", tuyet: "Tỵ" }
    },

    ELEMENT_OVERCOMING: {
      "Kim": "Mộc", "Mộc": "Thổ", "Thổ": "Thủy", "Thủy": "Hỏa", "Hỏa": "Kim"
    },

    calculateResonanceCurve(equilibriumNodes, intentWeights, hexData, monthChi, dayChi) {
      if (!equilibriumNodes || equilibriumNodes.length === 0) {
        return {
          optimal_positive_timing: {
            branch: "Tý",
            principle: "Đắc Trị Phùng Vượng",
            time_window: "Giai đoạn ngày/tháng Tý",
            meaning: "Thời điểm hanh thông, thích hợp để khởi sự.",
            action: "Chủ động triển khai."
          },
          critical_risk_timing: {
            branch: "Ngọ",
            principle: "Lục Xung Cần Phòng Tránh",
            time_window: "Giai đoạn ngày/tháng Ngọ",
            meaning: "Thời điểm xung khắc, cần bảo toàn lực lượng.",
            action: "Cẩn trọng duy trì ổn định."
          }
        };
      }

      // 1. Xác định Dụng Thần ưu tiên dựa trên trọng số câu hỏi
      let targetNode = null;
      let highestWeight = -1;

      for (const n of equilibriumNodes) {
        const lt = n.luc_than;
        let w = intentWeights ? (intentWeights[lt] || 0.1) : 0.1;
        if (n.is_moving) w += 0.5;
        if (n.is_the) w += 0.3;
        if (w > highestWeight) {
          highestWeight = w;
          targetNode = n;
        }
      }

      if (!targetNode) {
        targetNode = equilibriumNodes.find(n => n.is_the) || equilibriumNodes[0];
      }

      const branch = targetNode.branch;
      const bMeta = this.BRANCH_META[branch] || this.BRANCH_META["Tý"];
      const isMoving = targetNode.is_moving;
      const changedBranch = targetNode.changed_branch;

      let isTK = false;
      let isNP = false;
      const theNode = equilibriumNodes.find(n => n.is_the) || targetNode;

      if (hexData && hexData.haos) {
        const found = hexData.haos.find(h => h.position === targetNode.position);
        if (found) {
          isTK = found.is_tuan_khong;
          isNP = found.is_nguyet_pha;
        }
      }

      // 2. Tính Thời Điểm Hanh Thông (Optimal Positive Timing) theo Dã Hạc Thần Khóa
      let optBranch = "";
      let optPrinciple = "";
      let optMeaning = "";

      if (isTK) {
        optBranch = branch;
        optPrinciple = "Tuần Không Phùng Trị / Xuất Không";
        optMeaning = `Dụng Thần ${targetNode.luc_than} (${targetNode.branch}) lâm Tuần Không. Thời cơ hanh thông ứng vào ngày/tháng ${branch} (Xuất Không) hoặc ngày/tháng ${bMeta.lucXung} (Xung Không). Khi xuất Không, khí số được giải tỏa, mưu sự tiến triển thuận lợi.`;
      } else if (isNP) {
        optBranch = bMeta.lucHop;
        optPrinciple = "Hợp Xứ Cứu Phá / Xuất Nguyệt Lâm Trị";
        optMeaning = `Dụng Thần ${targetNode.luc_than} (${targetNode.branch}) bị Nguyệt Phá. Thời cơ hanh thông ứng vào ngày/tháng ${bMeta.lucHop} (Lục Hợp cứu phá), hoặc sau khi bước sang tháng mới đến ngày ${branch} phùng Trị để hồi phục trọn vẹn lực lượng.`;
      } else if (isMoving) {
        optBranch = bMeta.lucHop;
        optPrinciple = "Hào Động Phùng Lục Hợp / Phùng Trị";
        optMeaning = `Dụng Thần ${targetNode.luc_than} (${targetNode.branch}) phát động. Theo Dã Hạc Thần Khóa, hào động ứng vào ngày/tháng ${bMeta.lucHop} (Động phùng Hợp định cục) hoặc ngày/tháng ${branch} (phùng Trị phát tiết tinh hoa).`;
      } else {
        optBranch = bMeta.lucXung;
        optPrinciple = "Tĩnh Phùng Lục Xung Khởi / Phùng Trị";
        optMeaning = `Dụng Thần ${targetNode.luc_than} (${targetNode.branch}) tĩnh tại. Theo Dịch lý 'Tĩnh phùng Xung vi Khởi', thời cơ hành động hanh thông nhất ứng vào ngày/tháng ${bMeta.lucXung} (Xung khởi để phát tác) hoặc ngày ${branch} (Lâm Trị đắc lệnh).`;
      }

      // 3. Tính Thời Điểm Rủi Ro (Critical Risk Timing)
      let riskBranch = "";
      let riskPrinciple = "";
      let riskMeaning = "";

      const kyThanElement = Object.keys(this.ELEMENT_OVERCOMING).find(k => this.ELEMENT_OVERCOMING[k] === targetNode.element) || "Thủy";
      const kyThanNode = equilibriumNodes.find(n => n.element === kyThanElement);

      if (kyThanNode && kyThanNode.is_moving) {
        riskBranch = kyThanNode.branch;
        riskPrinciple = `Kỵ Thần ${kyThanNode.luc_than} (${kyThanNode.branch}) Phát Động Khắc Hại`;
        riskMeaning = `Kỵ Thần hành ${kyThanElement} phát động gây tổn thương cho Dụng Thần. Giai đoạn ngày/tháng ${riskBranch} là lúc Kỵ Thần lâm Trị đắc lệnh, tiềm ẩn rủi ro tranh chấp hoặc đình trệ cao, cần kiên nhẫn phòng thủ.`;
      } else if (targetNode.is_moving && changedBranch && this.BRANCH_META[changedBranch]) {
        const changedEl = this.BRANCH_META[changedBranch].element;
        if (this.ELEMENT_OVERCOMING[changedEl] === targetNode.element) {
          riskBranch = changedBranch;
          riskPrinciple = `Hào Động Biến Hồi Đầu Khắc (${changedBranch} ${changedEl} khắc ${targetNode.branch} ${targetNode.element})`;
          riskMeaning = `Hào phát động biến thành chi khắc gốc. Giai đoạn ngày/tháng ${riskBranch} là thời điểm lực khắc phát tác mạnh nhất, tuyệt đối không nên vội vã manh động hay đầu tư mạo hiểm.`;
        }
      }

      if (!riskBranch) {
        const theMeta = this.BRANCH_META[theNode.branch] || bMeta;
        riskBranch = theMeta.lucXung;
        riskPrinciple = `Lục Xung Với Hào Thế (${theNode.branch} xung ${theMeta.lucXung})`;
        riskMeaning = `Giai đoạn ngày/tháng ${riskBranch} đối xung với vị trí bản thân (Hào Thế ${theNode.branch}), tâm lý dễ xáo trộn bất an, hoàn cảnh phát sinh biến động ngoài dự kiến, cần giữ vững tâm thế.`;
      }

      return {
        optimal_positive_timing: {
          branch: optBranch,
          principle: optPrinciple,
          time_window: `Giai đoạn ngày/tháng Chi ${optBranch} (hoặc giờ ${optBranch})`,
          meaning: optMeaning,
          action: "Thời cơ chín muồi, nên chủ động quyết đoán hành động, nắm bắt cơ hội."
        },
        critical_risk_timing: {
          branch: riskBranch,
          principle: riskPrinciple,
          time_window: `Giai đoạn ngày/tháng Chi ${riskBranch} (hoặc giờ ${riskBranch})`,
          meaning: riskMeaning,
          action: "Nên án binh bất động, bảo toàn lực lượng, rà soát pháp lý hồ sơ, tránh đối đầu trực diện."
        }
      };
    }
  };

  // =========================================================================
  // 6. CƠ SỞ TRI THỨC LÝ KẾ TRUNG (LI JI ZHONG KNOWLEDGE)
  // =========================================================================
  const LiJiZhongKnowledge = {
    HAO_POSITIONS: {
      1: {
        space_fengshui: "Móng nhà, nền đất, cống rãnh, giếng nước, mương thoát nước",
        body_anatomy: "Bàn chân, ngón chân, gót chân, huyệt Dũng Tuyền, cơ sở nâng đỡ",
        social_rank: "Dân thường, người lao động trực tiếp, cấp dưới cơ sở",
        temporal_phase: "Giai đoạn khởi phát ban đầu, mầm mống sơ khai",
        family_role: "Con út, cháu nhỏ, người giúp việc, vật nuôi"
      },
      2: {
        space_fengshui: "Gian nhà chính, phòng bếp (bếp lò), phòng ngủ vợ chồng, giường ngủ",
        body_anatomy: "Đầu gối, bắp đùi, cơ quan sinh dục, bàng quang, hậu môn",
        social_rank: "Nhân viên tác nghiệp trực tiếp, vợ chồng, nội tướng trong nhà",
        temporal_phase: "Giai đoạn tích lũy nội lực, chuẩn bị triển khai",
        family_role: "Vợ, mẹ hiền, người quán xuyến nội trợ"
      },
      3: {
        space_fengshui: "Cửa ngách, cầu thang, hành lang phụ, bàn làm việc, giếng trời",
        body_anatomy: "Vùng thắt lưng, eo, rốn, bụng dưới, tử cung, hông",
        social_rank: "Trưởng nhóm, cán bộ cơ sở, người quản lý cấp thấp",
        temporal_phase: "Giai đoạn biến động nội bộ, thử thách bước đầu",
        family_role: "Anh em thứ, bạn bè thân thiết, đồng nghiệp"
      },
      4: {
        space_fengshui: "Cửa chính của căn hộ, ban công, cổng ngõ nội bộ, cửa sổ lớn",
        body_anatomy: "Lồng ngực, dạ dày, tim, phổi, lưng trên, cơ hoành",
        social_rank: "Cán bộ quản lý cấp trung, thư ký, người truyền đạt mệnh lệnh",
        temporal_phase: "Giai đoạn bước ngoặt chuyển tiếp, chuẩn bị bộc lộ ra ngoài",
        family_role: "Cô dì, chú bác, thông gia, đối tác thân cận"
      },
      5: {
        space_fengshui: "Phòng khách chính, đường cái trước nhà, sảnh đón khách, minh đường",
        body_anatomy: "Cổ họng, yết hầu, mặt, mắt, mũi, miệng, tim mạch",
        social_rank: "Lãnh đạo cao nhất, thủ trưởng cơ quan, sếp trực tiếp, chính quyền",
        temporal_phase: "Giai đoạn đỉnh cao, thời kỳ cực thịnh, cao trào sự việc",
        family_role: "Gia trưởng, người chủ gia đình, cha, trụ cột kinh tế"
      },
      6: {
        space_fengshui: "Mái nhà, trần nhà, bàn thờ tổ tiên, nóc nhà, cột ăng-ten, tường bao ngoài",
        body_anatomy: "Đầu, não bộ, thái dương, tóc, hộp sọ, hệ thần kinh trung ương",
        social_rank: "Chủ tịch hội đồng quản trị, cố vấn cao cấp, nguyên lão thoái ẩn",
        temporal_phase: "Giai đoạn kết thúc, thoái trào, hậu quả lâu dài",
        family_role: "Ông bà, tổ tiên, người cao tuổi nhất dòng họ"
      }
    },

    LUC_THU_TRAITS: {
      "Thanh Long": {
        nature: "Cát tường, quang minh chính đại, lễ độ, văn nhã, hỷ khí",
        psychology: "Tính cách hòa nhã, cởi mở, tự tin, phong độ, hướng tới sự minh bạch",
        shadow_side: "Nếu suy hoặc lâm Kỵ Thần: Quá chú trọng hình thức bên ngoài, chi tiêu thiếu kiểm soát cho sở thích cá nhân",
        material: "Cây xanh tươi tốt, đồ gỗ mới, phục trang chỉnh tề, vật phẩm bài trí trang nhã"
      },
      "Chu Tước": {
        nature: "Văn thư, thông tin, đối thoại, âm thanh, năng lượng nhiệt, thiết bị điện tử",
        psychology: "Giao tiếp hoạt bát, phản xạ nhanh, năng động, thích biểu đạt quan điểm thẳng thắn",
        shadow_side: "Nếu suy hoặc khắc Thế: Dễ phát sinh tranh luận, bất đồng ý kiến hoặc thông tin trao đổi bị hiểu sai",
        material: "Sách vở, hợp đồng, giấy tờ, điện thoại, máy vi tính, bếp lò, đường dây điện"
      },
      "Câu Trần": {
        nature: "Đất đai, nhà cửa, kết cấu, tiến độ chậm rãi, tính ổn định",
        psychology: "Điềm đạm, chất phác, kiên nhẫn, cẩn trọng, làm việc có nguyên tắc",
        shadow_side: "Nếu suy hoặc lâm Kỵ: Tiến độ công việc bị chậm lại, xử lý thủ tục kéo dài, khó thay đổi thói quen",
        material: "Đất đai, công trình xây dựng, đồ gốm sứ, đồ cổ, tường bao, vật dụng lâu năm"
      },
      "Đằng Xà": {
        nature: "Biến đổi linh hoạt, đường nét uốn lượn, trực giác, sự phức tạp",
        psychology: "Tư duy nhạy cảm, thận trọng đề phòng, trực giác tốt, suy nghĩ nhiều chiều",
        shadow_side: "Nếu suy hoặc lâm Kỵ: Tâm lý lo âu, giấc ngủ chập chờn, hợp đồng hoặc giao dịch tiềm ẩn điều khoản phức tạp",
        material: "Hệ thống dây điện, đường ống dẫn, dây cáp, sơ đồ mạng lưới, bản vẽ uốn lượn"
      },
      "Bạch Hổ": {
        nature: "Uy dũng, dứt khoát, kim khí, cơ khí chế tạo, y tế can thiệp",
        psychology: "Thẳng thắn, quyết đoán, tính cách cương trực, hành động nhanh gọn, dám chịu trách nhiệm",
        shadow_side: "Nếu suy hoặc khắc Thế: Dễ nóng vội, xung đột quan điểm hoặc phát sinh sự cố liên quan đến thiết bị cơ khí, kim loại",
        material: "Công cụ kim loại, máy móc cơ khí, thiết bị y tế, vật dụng sắc bén, phương tiện vận tải"
      },
      "Huyền Vũ": {
        nature: "Kín đáo, thâm trầm, bảo mật, môi trường nước, thông tin nội bộ",
        psychology: "Kín kẽ, thâm trầm, giữ bí mật tốt, giàu khả năng hoạch định chiến lược ngầm",
        shadow_side: "Nếu suy hoặc khắc Thế: Dễ gặp tình trạng thiếu minh bạch từ đối tác, thông tin bị che giấu hoặc thất thoát chi phí ngầm",
        material: "Hệ thống cấp thoát nước, khu vực thiếu ánh sáng, kho lưu trữ kín, dữ liệu mật"
      }
    },

    PATHOLOGY_MATRIX: {
      "Kim": {
        organs: "Hệ hô hấp, phổi, phế quản, đại tràng, da lông, mũi, xương cốt",
        symptoms: "Ho khan, hen suyễn, khó thở, viêm da dị ứng, đau nhức xương khớp, gãy xương",
        moving_hazard: "Lâm Bạch Hổ phát động: Nguy cơ phẫu thuật mổ xẻ, gãy xương hoặc chảy máu"
      },
      "Mộc": {
        organs: "Hệ thần kinh, gan, mật, gân cốt, mắt, chi dưới, huyết áp",
        symptoms: "Đau đầu, chóng mặt, huyết áp cao, men gan tăng, co giật gân cơ, mỏi mắt",
        moving_hazard: "Lâm Bạch Hổ ở Hào 5/6: Cảnh báo tai biến mạch máu não, đột quỵ hoặc chấn thương sọ não"
      },
      "Thủy": {
        organs: "Hệ bài tiết, thận, bàng quang, cơ quan sinh dục, tủy sống, tai, máu huyết",
        symptoms: "Suy thận, viêm nhiễm đường tiểu, rối loạn kinh nguyệt, lạnh chân tay, ù tai",
        moving_hazard: "Lâm Huyền Vũ: Bệnh viêm nhiễm phụ khoa/nam khoa, bệnh xã hội hoặc trúng gió độc"
      },
      "Hỏa": {
        organs: "Hệ tuần hoàn, tim mạch, huyết áp, ruột non (tiểu tràng), mắt, lưỡi",
        symptoms: "Đánh trống ngực, loạn nhịp tim, sốt cao viêm loét, mất ngủ triền miên, đau mắt đỏ",
        moving_hazard: "Lâm Chu Tước phát động: Viêm nhiễm cấp tính, xuất huyết hoặc bỏng nhiệt"
      },
      "Thổ": {
        organs: "Hệ tiêu hóa, tỳ vị (dạ dày), lá lách, cơ bắp, miệng môi",
        symptoms: "Đau dạ dày, trào ngược axit, đầy hơi khó tiêu, viêm đại tràng, teo cơ",
        moving_hazard: "Lâm Câu Trần hoặc Đằng Xà: Khối u mãn tính, ung nhọt, phù nề tích nước"
      }
    }
  };

  // =========================================================================
  // 7. BỘ LẬP QUẺ BÁT CUNG NẠP GIÁP ĐỘC LẬP (HEXAGRAM BUILDER)
  // =========================================================================
  const HexagramBuilder = {
    TRIGRAMS: {
      "1,1,1": { name: "Càn",  element: "Kim", nature: "Thiên" },
      "0,1,0": { name: "Khảm", element: "Thủy", nature: "Thủy" },
      "0,0,1": { name: "Cấn",  element: "Thổ", nature: "Sơn" },
      "1,0,0": { name: "Chấn", element: "Mộc", nature: "Lôi" },
      "0,1,1": { name: "Tốn",  element: "Mộc", nature: "Phong" },
      "1,0,1": { name: "Ly",   element: "Hỏa", nature: "Hỏa" },
      "0,0,0": { name: "Khôn", element: "Thổ", nature: "Địa" },
      "1,1,0": { name: "Đoài", element: "Kim", nature: "Trạch" }
    },

    INNER_NA_GIAP: {
      "Càn":  [["Giáp", "Tý", "Thủy"], ["Giáp", "Dần", "Mộc"], ["Giáp", "Thìn", "Thổ"]],
      "Khôn": [["Ất", "Mùi", "Thổ"],   ["Ất", "Tỵ", "Hỏa"],     ["Ất", "Mão", "Mộc"]],
      "Chấn": [["Canh", "Tý", "Thủy"], ["Canh", "Dần", "Mộc"], ["Canh", "Thìn", "Thổ"]],
      "Tốn":  [["Tân", "Sửu", "Thổ"],  ["Tân", "Hợi", "Thủy"],  ["Tân", "Dậu", "Kim"]],
      "Khảm": [["Mậu", "Dần", "Mộc"],  ["Mậu", "Thìn", "Thổ"],  ["Mậu", "Ngọ", "Hỏa"]],
      "Ly":   [["Kỷ", "Mão", "Mộc"],   ["Kỷ", "Sửu", "Thổ"],   ["Kỷ", "Hợi", "Thủy"]],
      "Cấn":  [["Bính", "Thìn", "Thổ"], ["Bính", "Ngọ", "Hỏa"],  ["Bính", "Thân", "Kim"]],
      "Đoài": [["Đinh", "Tỵ", "Hỏa"],   ["Đinh", "Mão", "Mộc"],  ["Đinh", "Sửu", "Thổ"]]
    },

    OUTER_NA_GIAP: {
      "Càn":  [["Nhâm", "Ngọ", "Hỏa"],  ["Nhâm", "Thân", "Kim"], ["Nhâm", "Tuất", "Thổ"]],
      "Khôn": [["Quý", "Sửu", "Thổ"],   ["Quý", "Hợi", "Thủy"],  ["Quý", "Dậu", "Kim"]],
      "Chấn": [["Canh", "Ngọ", "Hỏa"],  ["Canh", "Thân", "Kim"], ["Canh", "Tuất", "Thổ"]],
      "Tốn":  [["Tân", "Mùi", "Thổ"],   ["Tân", "Tỵ", "Hỏa"],    ["Tân", "Mão", "Mộc"]],
      "Khảm": [["Mậu", "Thân", "Kim"],  ["Mậu", "Tuất", "Thổ"],  ["Mậu", "Tý", "Thủy"]],
      "Ly":   [["Kỷ", "Dậu", "Kim"],    ["Kỷ", "Mùi", "Thổ"],   ["Kỷ", "Tỵ", "Hỏa"]],
      "Cấn":  [["Bính", "Tuất", "Thổ"], ["Bính", "Tý", "Thủy"],  ["Bính", "Dần", "Mộc"]],
      "Đoài": [["Đinh", "Hợi", "Thủy"],  ["Đinh", "Dậu", "Kim"],  ["Đinh", "Mùi", "Thổ"]]
    },

    LUC_THU_MAP: {
      "Giáp": ["Thanh Long", "Chu Tước", "Câu Trần", "Đằng Xà", "Bạch Hổ", "Huyền Vũ"],
      "Ất":   ["Thanh Long", "Chu Tước", "Câu Trần", "Đằng Xà", "Bạch Hổ", "Huyền Vũ"],
      "Bính": ["Chu Tước", "Câu Trần", "Đằng Xà", "Bạch Hổ", "Huyền Vũ", "Thanh Long"],
      "Đinh": ["Chu Tước", "Câu Trần", "Đằng Xà", "Bạch Hổ", "Huyền Vũ", "Thanh Long"],
      "Mậu":  ["Câu Trần", "Đằng Xà", "Bạch Hổ", "Huyền Vũ", "Thanh Long", "Chu Tước"],
      "Kỷ":   ["Đằng Xà", "Bạch Hổ", "Huyền Vũ", "Thanh Long", "Chu Tước", "Câu Trần"],
      "Canh": ["Bạch Hổ", "Huyền Vũ", "Thanh Long", "Chu Tước", "Câu Trần", "Đằng Xà"],
      "Tân":  ["Bạch Hổ", "Huyền Vũ", "Thanh Long", "Chu Tước", "Câu Trần", "Đằng Xà"],
      "Nhâm": ["Huyền Vũ", "Thanh Long", "Chu Tước", "Câu Trần", "Đằng Xà", "Bạch Hổ"],
      "Quý":  ["Huyền Vũ", "Thanh Long", "Chu Tước", "Câu Trần", "Đằng Xà", "Bạch Hổ"]
    },

    TUAN_KHONG_MAP: {
      "Giáp,Tý": ["Tuất", "Hợi"], "Ất,Sửu": ["Tuất", "Hợi"], "Bính,Dần": ["Tuất", "Hợi"], "Đinh,Mão": ["Tuất", "Hợi"],
      "Mậu,Thìn": ["Tuất", "Hợi"], "Kỷ,Tỵ": ["Tuất", "Hợi"], "Canh,Ngọ": ["Tuất", "Hợi"], "Tân,Mùi": ["Tuất", "Hợi"],
      "Nhâm,Thân": ["Tuất", "Hợi"], "Quý,Dậu": ["Tuất", "Hợi"],

      "Giáp,Tuất": ["Thân", "Dậu"], "Ất,Hợi": ["Thân", "Dậu"], "Bính,Tý": ["Thân", "Dậu"], "Đinh,Sửu": ["Thân", "Dậu"],
      "Mậu,Dần": ["Thân", "Dậu"], "Kỷ,Mão": ["Thân", "Dậu"], "Canh,Thìn": ["Thân", "Dậu"], "Tân,Tỵ": ["Thân", "Dậu"],
      "Nhâm,Ngọ": ["Thân", "Dậu"], "Quý,Mùi": ["Thân", "Dậu"],

      "Giáp,Thân": ["Ngọ", "Mùi"], "Ất,Dậu": ["Ngọ", "Mùi"], "Bính,Tuất": ["Ngọ", "Mùi"], "Đinh,Hợi": ["Ngọ", "Mùi"],
      "Mậu,Tý": ["Ngọ", "Mùi"], "Kỷ,Sửu": ["Ngọ", "Mùi"], "Canh,Dần": ["Ngọ", "Mùi"], "Tân,Mão": ["Ngọ", "Mùi"],
      "Nhâm,Thìn": ["Ngọ", "Mùi"], "Quý,Tỵ": ["Ngọ", "Mùi"],

      "Giáp,Ngọ": ["Thìn", "Tỵ"], "Ất,Mùi": ["Thìn", "Tỵ"], "Bính,Thân": ["Thìn", "Tỵ"], "Đinh,Dậu": ["Thìn", "Tỵ"],
      "Mậu,Tuất": ["Thìn", "Tỵ"], "Kỷ,Hợi": ["Thìn", "Tỵ"], "Canh,Tý": ["Thìn", "Tỵ"], "Tân,Sửu": ["Thìn", "Tỵ"],
      "Nhâm,Dần": ["Thìn", "Tỵ"], "Quý,Mão": ["Thìn", "Tỵ"],

      "Giáp,Thìn": ["Dần", "Mão"], "Ất,Tỵ": ["Dần", "Mão"], "Bính,Ngọ": ["Dần", "Mão"], "Đinh,Mùi": ["Dần", "Mão"],
      "Mậu,Thân": ["Dần", "Mão"], "Kỷ,Dậu": ["Dần", "Mão"], "Canh,Tuất": ["Dần", "Mão"], "Tân,Hợi": ["Dần", "Mão"],
      "Nhâm,Tý": ["Dần", "Mão"], "Quý,Sửu": ["Dần", "Mão"],

      "Giáp,Dần": ["Tý", "Sửu"], "Ất,Mão": ["Tý", "Sửu"], "Bính,Thìn": ["Tý", "Sửu"], "Đinh,Tỵ": ["Tý", "Sửu"],
      "Mậu,Ngọ": ["Tý", "Sửu"], "Kỷ,Mùi": ["Tý", "Sửu"], "Canh,Thân": ["Tý", "Sửu"], "Tân,Dậu": ["Tý", "Sửu"],
      "Nhâm,Tuất": ["Tý", "Sửu"], "Quý,Hợi": ["Tý", "Sửu"]
    },

    OPPOSITE_BRANCH: {
      "Tý": "Ngọ", "Ngọ": "Tý", "Sửu": "Mùi", "Mùi": "Sửu",
      "Dần": "Thân", "Thân": "Dần", "Mão": "Dậu", "Dậu": "Mão",
      "Thìn": "Tuất", "Tuất": "Thìn", "Tỵ": "Hợi", "Hợi": "Tỵ"
    },

    HEX_NAMES_MATRIX: {
      "Càn,Càn": "Thuần Càn", "Càn,Khảm": "Thiên Thủy Tụng", "Càn,Cấn": "Thiên Sơn Độn", "Càn,Chấn": "Thiên Lôi Vô Vọng",
      "Càn,Tốn": "Thiên Phong Cấu", "Càn,Ly": "Thiên Hỏa Đồng Nhân", "Càn,Khôn": "Thiên Địa Bĩ", "Càn,Đoài": "Thiên Trạch Lý",

      "Khảm,Càn": "Thủy Thiên Nhu", "Khảm,Khảm": "Thuần Khảm", "Khảm,Cấn": "Thủy Sơn Kiển", "Khảm,Chấn": "Thủy Lôi Truân",
      "Khảm,Tốn": "Thủy Phong Tỉnh", "Khảm,Ly": "Thủy Hỏa Ký Tế", "Khảm,Khôn": "Thủy Địa Tỷ", "Khảm,Đoài": "Thủy Trạch Tiết",

      "Cấn,Càn": "Sơn Thiên Đại Súc", "Cấn,Khảm": "Sơn Thủy Mông", "Cấn,Cấn": "Thuần Cấn", "Cấn,Chấn": "Sơn Lôi Di",
      "Cấn,Tốn": "Sơn Phong Cổ", "Cấn,Ly": "Sơn Hỏa Bí", "Cấn,Khôn": "Sơn Địa Bác", "Cấn,Đoài": "Sơn Trạch Tổn",

      "Chấn,Càn": "Lôi Thiên Đại Tráng", "Chấn,Khảm": "Lôi Thủy Giải", "Chấn,Cấn": "Lôi Sơn Tiểu Quá", "Chấn,Chấn": "Thuần Chấn",
      "Chấn,Tốn": "Lôi Phong Hằng", "Chấn,Ly": "Lôi Hỏa Phong", "Chấn,Khôn": "Lôi Địa Dự", "Chấn,Đoài": "Lôi Trạch Quy Muội",

      "Tốn,Càn": "Phong Thiên Tiểu Súc", "Tốn,Khảm": "Phong Thủy Hoán", "Tốn,Cấn": "Phong Sơn Tiệm", "Tốn,Chấn": "Phong Lôi Ích",
      "Tốn,Tốn": "Thuần Tốn", "Tốn,Ly": "Phong Hỏa Gia Nhân", "Tốn,Khôn": "Phong Địa Quan", "Tốn,Đoài": "Phong Trạch Trung Phu",

      "Ly,Càn": "Hỏa Thiên Đại Hữu", "Ly,Khảm": "Hỏa Thủy Vị Tế", "Ly,Cấn": "Hỏa Sơn Lữ", "Ly,Chấn": "Hỏa Lôi Phệ Hạp",
      "Ly,Tốn": "Hỏa Phong Đỉnh", "Ly,Ly": "Thuần Ly", "Ly,Khôn": "Hỏa Địa Tấn", "Ly,Đoài": "Hỏa Trạch Khuê",

      "Khôn,Càn": "Địa Thiên Thái", "Khôn,Khảm": "Địa Thủy Sư", "Khôn,Cấn": "Địa Sơn Khiêm", "Khôn,Chấn": "Địa Lôi Phục",
      "Khôn,Tốn": "Địa Phong Thăng", "Khôn,Ly": "Địa Hỏa Minh Di", "Khôn,Khôn": "Thuần Khôn", "Khôn,Đoài": "Địa Trạch Lâm",

      "Đoài,Càn": "Trạch Thiên Quải", "Đoài,Khảm": "Trạch Thủy Khốn", "Đoài,Cấn": "Trạch Sơn Hàm", "Đoài,Chấn": "Trạch Lôi Tùy",
      "Đoài,Tốn": "Trạch Phong Đại Quá", "Đoài,Ly": "Trạch Hỏa Cách", "Đoài,Khôn": "Trạch Địa Tụy", "Đoài,Đoài": "Thuần Đoài"
    },

    getPalaceAndTheUng(bits) {
      const lower = bits.slice(0, 3).join(',');
      const upper = bits.slice(3, 6).join(',');

      if (lower === upper) {
        const palace = this.TRIGRAMS[upper].name;
        const elem = this.TRIGRAMS[upper].element;
        return { palaceName: palace, palaceElem: elem, thePos: 6, ungPos: 3, palaceRole: "Bản Cung" };
      }

      const palaceList = [
        ["Càn", [1,1,1]], ["Khảm", [0,1,0]], ["Cấn", [0,0,1]], ["Chấn", [1,0,0]],
        ["Tốn", [0,1,1]], ["Ly", [1,0,1]],   ["Khôn", [0,0,0]], ["Đoài", [1,1,0]]
      ];

      for (const [pName, pData] of palaceList) {
        const pElem = this.TRIGRAMS[pData.join(',')].element;
        const b = [...pData, ...pData]; // Quẻ Thuần 6 hào

        const b1 = [...b]; b1[0] = 1 - b1[0];
        if (bits.join(',') === b1.join(',')) return { palaceName: pName, palaceElem: pElem, thePos: 1, ungPos: 4, palaceRole: "Biến Hào 1" };

        const b2 = [...b1]; b2[1] = 1 - b2[1];
        if (bits.join(',') === b2.join(',')) return { palaceName: pName, palaceElem: pElem, thePos: 2, ungPos: 5, palaceRole: "Biến Hào 2" };

        const b3 = [...b2]; b3[2] = 1 - b3[2];
        if (bits.join(',') === b3.join(',')) return { palaceName: pName, palaceElem: pElem, thePos: 3, ungPos: 6, palaceRole: "Biến Hào 3" };

        const b4 = [...b3]; b4[3] = 1 - b4[3];
        if (bits.join(',') === b4.join(',')) return { palaceName: pName, palaceElem: pElem, thePos: 4, ungPos: 1, palaceRole: "Biến Hào 4" };

        const b5 = [...b4]; b5[4] = 1 - b5[4];
        if (bits.join(',') === b5.join(',')) return { palaceName: pName, palaceElem: pElem, thePos: 5, ungPos: 2, palaceRole: "Biến Hào 5" };

        const bDu = [...b5]; bDu[3] = 1 - bDu[3];
        if (bits.join(',') === bDu.join(',')) return { palaceName: pName, palaceElem: pElem, thePos: 4, ungPos: 1, palaceRole: "Du Hồn" };

        const bQuy = [...pData, ...bDu.slice(3, 6)];
        if (bits.join(',') === bQuy.join(',')) return { palaceName: pName, palaceElem: pElem, thePos: 3, ungPos: 6, palaceRole: "Quy Hồn" };
      }

      return { palaceName: "Càn", palaceElem: "Kim", thePos: 6, ungPos: 3, palaceRole: "Bản Cung" };
    },

    getLucThan(palaceElem, haoElem) {
      const sinhMap = { "Thủy": "Mộc", "Mộc": "Hỏa", "Hỏa": "Thổ", "Thổ": "Kim", "Kim": "Thủy" };
      const khacMap = { "Thủy": "Hỏa", "Hỏa": "Kim", "Kim": "Mộc", "Mộc": "Thổ", "Thổ": "Thủy" };

      if (haoElem === palaceElem) return "Huynh Đệ";
      if (sinhMap[haoElem] === palaceElem) return "Phụ Mẫu";
      if (sinhMap[palaceElem] === haoElem) return "Tử Tôn";
      if (khacMap[palaceElem] === haoElem) return "Thê Tài";
      if (khacMap[haoElem] === palaceElem) return "Quan Quỷ";
      return "Huynh Đệ";
    },

    calculatePhucThan(palaceName, palaceElem, mainHaos, monthChi, dayChi, tuanKhong) {
      const sinhMap = { "Thủy": "Mộc", "Mộc": "Hỏa", "Hỏa": "Thổ", "Thổ": "Kim", "Kim": "Thủy" };
      const khacMap = { "Thủy": "Hỏa", "Hỏa": "Kim", "Kim": "Mộc", "Mộc": "Thổ", "Thổ": "Thủy" };

      const pureLower = this.INNER_NA_GIAP[palaceName] || [];
      const pureUpper = this.OUTER_NA_GIAP[palaceName] || [];
      const pureAll = [...pureLower, ...pureUpper];

      const pureHaos = [];
      for (let idx = 0; idx < 6; idx++) {
        const [can, chi, elem] = pureAll[idx];
        const lt = this.getLucThan(palaceElem, elem);
        pureHaos.push({ position: idx + 1, can, branch: chi, element: elem, luc_than: lt });
      }

      const existingLucThan = new Set(mainHaos.map(h => h.luc_than));
      const allPossible = ["Phụ Mẫu", "Huynh Đệ", "Tử Tôn", "Thê Tài", "Quan Quỷ"];
      const missingLucThan = allPossible.filter(lt => !existingLucThan.has(lt));

      const phucThanList = [];
      for (const missingLt of missingLucThan) {
        for (const ph of pureHaos) {
          if (ph.luc_than === missingLt) {
            const pos = ph.position;
            const phiHao = mainHaos[pos - 1];
            const phiElem = phiHao.element;
            const phucElem = ph.element;

            let relation = "";
            let relStatus = "";

            if (sinhMap[phiElem] === phucElem) {
              relation = "Phi Sinh Phục (Phi lai sinh Phục đắc trường sinh - Rất tốt, được hỗ trợ xuất đầu)";
              relStatus = "PHI_SINH_PHUC";
            } else if (sinhMap[phucElem] === phiElem) {
              relation = "Phục Sinh Phi (Phục khứ sinh Phi vi tiết khí - Bị tiêu hao, lực yếu)";
              relStatus = "PHUC_SINH_PHI";
            } else if (khacMap[phiElem] === phucElem) {
              relation = "Phi Khắc Phục (Phi lai khắc Phục vi thương thân - Bị kìm hãm, khó xuất đầu)";
              relStatus = "PHI_KHAC_PHUC";
            } else if (khacMap[phucElem] === phiElem) {
              relation = "Phục Khắc Phi (Phục khắc Phi thần vi xuất bạo - Phục thần mạnh mẽ phá rào lộ diện)";
              relStatus = "PHUC_KHAC_PHI";
            } else {
              relation = "Phi Phục Tỷ Hòa (Đồng khí tương cầu, bình ổn)";
              relStatus = "TY_HOA";
            }

            let canEmerge = false;
            const emergeReasons = [];

            if (phiHao.is_tuan_khong) {
              canEmerge = true;
              emergeReasons.push("Phi Thần lâm Tuần Không (tạo khoảng trống cho Phục Thần xuất hiện)");
            }
            if (phiHao.is_nguyet_pha) {
              canEmerge = true;
              emergeReasons.push("Phi Thần bị Nguyệt Phá suy yếu, giảm lực đè nén");
            }
            if (relStatus === "PHI_SINH_PHUC" || relStatus === "PHUC_KHAC_PHI") {
              canEmerge = true;
              emergeReasons.push("Quan hệ Phi - Phục thuận lợi cho việc xuất hiện");
            }
            if (phiHao.is_moving) {
              canEmerge = true;
              emergeReasons.push("Phi Thần phát động tạo điều kiện cho Phục Thần xuất hiện");
            }

            const isUnderThe = phiHao.is_the;
            const isUnderUng = phiHao.is_ung;
            const isUnderMoving = phiHao.is_moving;

            let hiddenMeaning = "";
            const theMeaning = {
              "Thê Tài": "Đương số có kế hoạch tài chính dự phòng hoặc đang tập trung vào việc quản lý dòng tiền, tài sản",
              "Quan Quỷ": "Đương số đang chịu áp lực công việc, trách nhiệm quản lý hoặc quan tâm đến tình trạng sức khỏe",
              "Phụ Mẫu": "Đương số đang tập trung xử lý hồ sơ, thủ tục giấy tờ, hợp đồng hoặc công việc gia đình",
              "Tử Tôn": "Đương số có định hướng đầu tư mở rộng, phát triển sản phẩm mới hoặc quan tâm đến con cái",
              "Huynh Đệ": "Đương số chú trọng đến quan hệ đối tác, chia sẻ nguồn lực hoặc kiểm soát chi phí vận hành"
            };
            const ungMeaning = {
              "Thê Tài": "Đối tác/đối phương có nguồn lực tài chính dự phòng hoặc toan tính riêng về lợi ích kinh tế",
              "Quan Quỷ": "Đối tác/đối phương đang chịu áp lực công việc, vướng mắc pháp lý hoặc có mối bận tâm riêng",
              "Phụ Mẫu": "Đối tác/đối phương phụ thuộc vào thủ tục giấy tờ, hợp đồng hoặc người bảo trợ",
              "Tử Tôn": "Đối tác/đối phương có thiện chí hợp tác hoặc muốn giải tỏa xung đột",
              "Huynh Đệ": "Đối tác/đối phương có nhiều bên liên kết hoặc đặt nặng vấn đề cạnh tranh lợi ích"
            };

            if (isUnderThe) hiddenMeaning = `Phục dưới Hào Thế: ${theMeaning[missingLt] || ''}`;
            else if (isUnderUng) hiddenMeaning = `Phục dưới Hào Ứng: ${ungMeaning[missingLt] || ''}`;
            else if (isUnderMoving) hiddenMeaning = `Phục dưới Hào Động: Hào phát động làm chuyển hóa trạng thái, tạo điều kiện cho Phục Thần [${missingLt}] phát huy tác dụng`;

            phucThanList.push({
              missing_luc_than: missingLt,
              position: pos,
              phuc_can: ph.can,
              phuc_branch: ph.branch,
              phuc_element: ph.element,
              phi_luc_than: phiHao.luc_than,
              phi_branch: phiHao.branch,
              phi_element: phiElem,
              phi_phuc_relation: relation,
              can_emerge: canEmerge,
              emerge_analysis: emergeReasons.length > 0 ? emergeReasons.join('; ') : "Phục Thần còn bị ẩn khuất, cần chờ ngày xung Phi Thần hoặc trực Phục Thần mới dùng được",
              is_under_the: isUnderThe,
              is_under_ung: isUnderUng,
              is_under_moving: isUnderMoving,
              hidden_meaning: hiddenMeaning
            });
          }
        }
      }
      return phucThanList;
    },

    build(coins, dayCan, dayChi, monthChi) {
      const mainBits = [];
      const changedBits = [];
      const isMovingList = [];

      const safeCoins = Array.isArray(coins) ? [...coins] : [];
      while (safeCoins.length < 6) safeCoins.push(7);

      for (let i = 0; i < 6; i++) {
        const c = safeCoins[i];
        if (c === 7) { mainBits.push(1); changedBits.push(1); isMovingList.push(false); }
        else if (c === 8) { mainBits.push(0); changedBits.push(0); isMovingList.push(false); }
        else if (c === 9) { mainBits.push(1); changedBits.push(0); isMovingList.push(true); }
        else if (c === 6) { mainBits.push(0); changedBits.push(1); isMovingList.push(true); }
        else { mainBits.push(1); changedBits.push(1); isMovingList.push(false); }
      }

      const lowerTrigram = this.TRIGRAMS[mainBits.slice(0, 3).join(',')].name;
      const upperTrigram = this.TRIGRAMS[mainBits.slice(3, 6).join(',')].name;
      const hexName = this.HEX_NAMES_MATRIX[`${upperTrigram},${lowerTrigram}`] || `${upperTrigram} ${lowerTrigram}`;

      const { palaceName, palaceElem, thePos, ungPos, palaceRole } = this.getPalaceAndTheUng(mainBits);

      const lowerNa = this.INNER_NA_GIAP[lowerTrigram] || [];
      const upperNa = this.OUTER_NA_GIAP[upperTrigram] || [];
      const allNa = [...lowerNa, ...upperNa];

      const changedLowerTrigram = this.TRIGRAMS[changedBits.slice(0, 3).join(',')].name;
      const changedUpperTrigram = this.TRIGRAMS[changedBits.slice(3, 6).join(',')].name;
      const changedHexName = this.HEX_NAMES_MATRIX[`${changedUpperTrigram},${changedLowerTrigram}`] || "";
      const changedNa = [...(this.INNER_NA_GIAP[changedLowerTrigram] || []), ...(this.OUTER_NA_GIAP[changedUpperTrigram] || [])];

      const lucThuList = this.LUC_THU_MAP[dayCan] || this.LUC_THU_MAP["Giáp"];
      const tkKey = `${dayCan},${dayChi}`;
      const tuanKhong = this.TUAN_KHONG_MAP[tkKey] || [];
      const nguyetPhaBranch = this.OPPOSITE_BRANCH[monthChi] || "";
      const nhatXungBranch = this.OPPOSITE_BRANCH[dayChi] || "";

      const haos = [];
      for (let i = 0; i < 6; i++) {
        const pos = i + 1;
        const [can, chi, elem] = allNa[i];
        const lucThan = this.getLucThan(palaceElem, elem);
        const lucThu = lucThuList[i];
        const isThe = (pos === thePos);
        const isUng = (pos === ungPos);
        const isMov = isMovingList[i];

        const cBranch = isMov ? changedNa[i][1] : null;
        const cElem = isMov ? changedNa[i][2] : null;
        const cLucThan = (isMov && cElem) ? this.getLucThan(palaceElem, cElem) : null;

        const isKhong = tuanKhong.includes(chi);
        const isPha = (chi === nguyetPhaBranch);
        const isNhatXung = (chi === nhatXungBranch);
        const isAmDong = (!isMov) && isNhatXung;

        const stars = AdvancedDichRules.getShenShaForHao(chi, dayCan, dayChi);
        let dynamics = null;
        if (isMov && cBranch && cElem) {
          dynamics = AdvancedDichRules.analyzeMovingLineDynamics(chi, elem, cBranch, cElem, tuanKhong, monthChi);
        }

        haos.push({
          position: pos,
          bit: mainBits[i],
          can,
          branch: chi,
          element: elem,
          luc_than: lucThan,
          luc_thu: lucThu,
          is_the: isThe,
          is_ung: isUng,
          is_moving: isMov,
          is_tuan_khong: isKhong,
          is_nguyet_pha: isPha,
          is_am_dong: isAmDong,
          changed_branch: cBranch,
          changed_element: cElem,
          changed_luc_than: cLucThan,
          stars,
          dynamics
        });
      }

      const phucThanData = this.calculatePhucThan(palaceName, palaceElem, haos, monthChi, dayChi, tuanKhong);
      const phucMap = {};
      phucThanData.forEach(p => { phucMap[p.position] = p; });

      for (const h of haos) {
        if (phucMap[h.position]) {
          h.has_phuc_than = true;
          h.phuc_than_info = phucMap[h.position];
        } else {
          h.has_phuc_than = false;
          h.phuc_than_info = null;
        }
      }

      const specialStructure = AdvancedDichRules.classifyHexagramSpecialStructure(hexName, palaceRole);
      const tamHop = AdvancedDichRules.detectTamHop(haos, monthChi, dayChi);
      const tamHinh = AdvancedDichRules.detectTamHinh(haos, monthChi, dayChi);

      return {
        hex_name: hexName,
        palace_name: palaceName,
        palace_element: palaceElem,
        palace_role: palaceRole,
        the_position: thePos,
        ung_position: ungPos,
        changed_hex_name: isMovingList.some(Boolean) ? changedHexName : "Quẻ Tĩnh",
        has_moving_hao: isMovingList.some(Boolean),
        haos,
        phuc_than_list: phucThanData,
        special_structure: specialStructure,
        tam_hop: tamHop,
        tam_hinh: tamHinh,
        time_meta: {
          day_can: dayCan,
          day_chi: dayChi,
          month_chi: monthChi,
          tuan_khong: tuanKhong,
          nguyet_pha: nguyetPhaBranch
        }
      };
    }
  };

  // =========================================================================
  // 8. ĐỘNG CƠ "NHẤT QUÁI ĐA ĐOÁN" (NHAT QUAI DA DOAN ENGINE)
  // =========================================================================
  class NhatQuaiDaDoanEngine {
    constructor(hexData, diffusionResult, intentResult) {
      this.hexData = hexData;
      this.diffusionResult = diffusionResult;
      this.intentResult = intentResult;

      this.haos = hexData.haos;
      this.thePos = hexData.the_position;
      this.ungPos = hexData.ung_position;
      this.timeMeta = hexData.time_meta;
      this.phucThanList = hexData.phuc_than_list || [];

      const nodesMap = {};
      diffusionResult.nodes_state.forEach(n => { nodesMap[n.position] = n; });
      for (const h of this.haos) {
        const node = nodesMap[h.position];
        h.energy = node ? node.equilibrium_energy : 0.0;
        h.spectrum = node ? node.energy_spectrum : "";
      }
    }

    getActionablePhucThan(targetDungThan = null) {
      const actionable = [];
      for (const pt of this.phucThanList) {
        const isDung = (targetDungThan !== null && pt.missing_luc_than === targetDungThan);
        if (isDung || pt.is_under_the || pt.is_under_ung || pt.is_under_moving) {
          actionable.push(pt);
        }
      }
      return actionable;
    }

    analyzeAllDomains() {
      let primaryDungThan = null;
      const pw = this.intentResult.target_weights || {};
      const entries = Object.entries(pw);
      if (entries.length > 0) {
        entries.sort((a, b) => b[1] - a[1]);
        primaryDungThan = entries[0][0];
      }

      const actionablePhuc = this.getActionablePhucThan(primaryDungThan);

      return {
        lens_1_primary_intent: this.analyzePrimaryIntent(),
        lens_2_wealth_finance: this.analyzeWealthFinance(),
        lens_3_career_status:  this.analyzeCareerStatus(),
        lens_4_marriage_romance: this.analyzeMarriageRomance(),
        lens_5_health_medical: this.analyzeHealthMedical(),
        lens_6_spatial_fengshui: this.analyzeSpatialFengShui(),
        phuc_than_analysis: actionablePhuc,
        hidden_warnings: this.detectHiddenWarnings()
      };
    }

    analyzePrimaryIntent() {
      const u = this.intentResult;
      const prob = u.success_probability;
      const grad = u.the_vs_ung_gradient;

      let prospect = "";
      if (prob >= 0.75) prospect = "khả năng thành tựu rất cao, thiên thời địa lợi và nhân tâm đều tương trợ trọn vẹn";
      else if (prob >= 0.45) prospect = "thế sự đang ở trạng thái giằng co cân bằng, cần kiên trì và ứng xử khéo léo để xoay chuyển cục diện";
      else prospect = "cục diện tiềm ẩn nhiều trở lực và tiêu hao, chưa phải là thời cơ thuận lợi để hành động";

      const theUngEval = grad > 0 
        ? "đương số hoàn toàn nắm thế thượng phong chủ động, kiểm soát được đối phương" 
        : "đối phương hoặc hoàn cảnh khách quan bên ngoài đang chi phối lấn lướt";

      return {
        domain_title: "Chiêm Đoán Sự Vụ Trọng Tâm (Câu hỏi đương số)",
        decision: u.decision,
        the_vs_ung_stance: theUngEval,
        summary: `Về sự việc người hỏi đang quan tâm: Bàn quẻ xác lập trạng thái '${u.decision}'. Khí vận tổng thể cho thấy ${prospect}. Tương quan Thế - Ứng phản ánh ${theUngEval}.`
      };
    }

    analyzeWealthFinance() {
      const taiHaos = this.haos.filter(h => h.luc_than === "Thê Tài");
      const tuHaos = this.haos.filter(h => h.luc_than === "Tử Tôn");
      const huynhHaos = this.haos.filter(h => h.luc_than === "Huynh Đệ");

      let taiStatus = "";
      if (taiHaos.length === 0) {
        const phucTai = this.phucThanList.filter(pt => pt.missing_luc_than === "Thê Tài");
        if (phucTai.length > 0) {
          const pt = phucTai[0];
          let locNote = "";
          if (pt.is_under_the) locNote = " (dưới Hào Thế)";
          else if (pt.is_under_ung) locNote = " (dưới Hào Ứng)";
          else if (pt.is_under_moving) locNote = " (dưới Hào Động)";
          taiStatus = `Thê Tài Phục Tàng${locNote} (Ẩn dưới Hào ${pt.position} mang Phi Thần ${pt.phi_luc_than} ${pt.phi_branch}). Quan hệ: ${pt.phi_phuc_relation}. Khả năng xuất hiện: ${pt.emerge_analysis}`;
        } else {
          taiStatus = "Tài Thần Phục Tàng (Vốn liếng bị ẩn khuất, dòng tiền tắc nghẽn chưa lộ diện trên bàn quẻ)";
        }
      } else {
        const bestTai = taiHaos.reduce((max, h) => h.energy > max.energy ? h : max, taiHaos[0]);
        const e = bestTai.energy;
        if (e >= 3.0) taiStatus = `Thê Tài vượng tướng ngự Hào ${bestTai.position} (${bestTai.branch} ${bestTai.element}) lâm ${bestTai.luc_thu} (Lợi nhuận dồi dào, tài nguyên phong phú)`;
        else if (e >= -1.0) taiStatus = `Thê Tài bình hòa ngự Hào ${bestTai.position} (Dòng tiền vừa đủ chi dùng, cần tích lũy chặt chẽ)`;
        else taiStatus = `Thê Tài suy kiệt / bị tổn hại ở Hào ${bestTai.position} (Dễ thâm hụt vốn liếng, khó thu hồi nợ cũ)`;
      }

      const huynhMoving = huynhHaos.filter(h => h.is_moving);
      const huynhRisk = [];
      if (huynhMoving.length > 0) {
        for (const hm of huynhMoving) {
          huynhRisk.push(`Hào ${hm.position} (Huynh Đệ ${hm.branch}) phát động lâm ${hm.luc_thu}: Cảnh báo nguy cơ bị đối tác chiếm dụng vốn, lừa gạt hoặc chi tiêu phát sinh đột biến`);
        }
      } else if (huynhHaos.some(h => h.energy > 5.0)) {
        huynhRisk.push("Huynh Đệ quá vượng âm thầm khắc Tài: Cạnh tranh thị trường khốc liệt, chi phí vận hành cao");
      } else {
        huynhRisk.push("Huynh Đệ an tĩnh: Nguy cơ hao tài ở mức kiểm soát được");
      }

      let tuTonDesc = "";
      if (tuHaos.length === 0) {
        const phucTu = this.phucThanList.filter(pt => pt.missing_luc_than === "Tử Tôn" && (pt.is_under_the || pt.is_under_ung || pt.is_under_moving));
        if (phucTu.length > 0) {
          const pt = phucTu[0];
          const locNote = pt.is_under_the ? "dưới Hào Thế" : (pt.is_under_ung ? "dưới Hào Ứng" : "dưới Hào Động");
          tuTonDesc = `Tử Tôn Phục Tàng ${locNote}: Nguồn sinh tài và dự án mới đang được ấp ủ, chờ thời cơ kích hoạt.`;
        } else {
          tuTonDesc = "Quẻ khuyết Tử Tôn trên các hào trọng yếu: Nguồn sinh tài và tệp khách hàng mới chưa thực sự mở rộng rõ nét, cần tích cực chủ động tìm kiếm.";
        }
      } else {
        const hasTuTon = tuHaos.some(h => h.energy > 0);
        tuTonDesc = hasTuTon ? "Có nguồn khách hàng và sản phẩm mới tiếp sức bền vững (Tử Tôn vượng trợ Tài)" : "Nguồn sinh tài còn yếu, kinh doanh dễ bị đứt đoạn";
      }

      return {
        domain_title: "Tài Vận, Dòng Tiền & Cơ Hội Đầu Tư",
        tai_status: taiStatus,
        tu_ton_assessment: tuTonDesc,
        huynh_de_risk: huynhRisk.join('; ')
      };
    }

    analyzeCareerStatus() {
      const quanHaos = this.haos.filter(h => h.luc_than === "Quan Quỷ");
      const phuHaos = this.haos.filter(h => h.luc_than === "Phụ Mẫu");
      const hao5 = this.haos[4];

      let quanStatus = "";
      if (quanHaos.length === 0) {
        const phucQuan = this.phucThanList.filter(pt => pt.missing_luc_than === "Quan Quỷ");
        if (phucQuan.length > 0) {
          const pt = phucQuan[0];
          quanStatus = `Quan Quỷ Phục Tàng (Ẩn dưới Hào ${pt.position} mang Phi Thần ${pt.phi_luc_than} ${pt.phi_branch}). Quyền lực chưa nắm chắc, cần đợi thời cơ lộ diện (${pt.emerge_analysis})`;
        } else {
          quanStatus = "Quan Quỷ ẩn phục: Quyền lực chưa nắm chắc, vị trí công việc còn biến động mập mờ";
        }
      } else {
        const bestQuan = quanHaos.reduce((max, h) => h.energy > max.energy ? h : max, quanHaos[0]);
        const e = bestQuan.energy;
        if (e >= 3.0) quanStatus = `Quan Quỷ vượng tướng ở Hào ${bestQuan.position} (${bestQuan.branch}) lâm ${bestQuan.luc_thu}: Công danh rộng mở, có uy quyền, được cấp trên cất nhắc`;
        else if (e >= -1.0) quanStatus = `Quan Quỷ giữ thế bình hòa ở Hào ${bestQuan.position}: Công việc ổn định theo nếp cũ, chưa có đột biến thăng tiến`;
        else quanStatus = `Quan Quỷ suy yếu / lâm Nguyệt Phá / Tuần Không: Áp lực công việc đè nặng, đề phòng khiển trách hoặc mất chức`;
      }

      let phuStatus = "";
      if (phuHaos.length === 0) {
        const phucPhu = this.phucThanList.filter(pt => pt.missing_luc_than === "Phụ Mẫu");
        if (phucPhu.length > 0) {
          phuStatus = `Phụ Mẫu Phục Tàng dưới Hào ${phucPhu[0].position}: Hợp đồng, văn bằng chứng từ đang bị tắc nghẽn, cần thúc đẩy mới hoàn thành.`;
        } else {
          phuStatus = "Hồ sơ, thủ tục pháp lý dễ bị chậm trễ hoặc gặp trục trặc";
        }
      } else {
        phuStatus = phuHaos.some(h => h.energy > 0) 
          ? "Giấy tờ, hợp đồng, quyết định phê duyệt thuận lợi (Phụ Mẫu có lực)" 
          : "Hồ sơ, thủ tục pháp lý dễ bị chậm trễ hoặc gặp trục trặc";
      }

      let bossAttitude = `Hào 5 (${hao5.luc_than} ${hao5.branch}) lâm ${hao5.luc_thu}: `;
      if (hao5.is_the) {
        bossAttitude += "Đương số tự mình làm chủ hoặc giữ vị trí chỉ huy then chốt.";
      } else if (hao5.energy > 2.0) {
        const trait = LiJiZhongKnowledge.LUC_THU_TRAITS[hao5.luc_thu] || {};
        bossAttitude += `Cấp trên có năng lực mạnh mẽ, phong cách ${trait.nature || ''}.`;
      } else {
        bossAttitude += "Cấp trên thiếu quyết đoán hoặc đang gặp khó khăn nội tại.";
      }

      return {
        domain_title: "Công Danh, Sự Nghiệp, Quan Vận & Pháp Lý",
        quan_status: quanStatus,
        document_status: phuStatus,
        superior_relationship: bossAttitude
      };
    }

    analyzeMarriageRomance() {
      const theHao = this.haos[this.thePos - 1];
      const ungHao = this.haos[this.ungPos - 1];

      const theElem = theHao.element;
      const ungElem = ungHao.element;

      const sinhMap = { "Thủy": "Mộc", "Mộc": "Hỏa", "Hỏa": "Thổ", "Thổ": "Kim", "Kim": "Thủy" };
      const khacMap = { "Thủy": "Hỏa", "Hỏa": "Kim", "Kim": "Mộc", "Mộc": "Thổ", "Thổ": "Thủy" };

      let relation = "";
      if (ungElem === theElem) relation = "Thế Ứng Tỷ Hòa: Hai bên có sự đồng điệu về quan điểm, môn đăng hộ đối, bình đẳng tôn trọng.";
      else if (sinhMap[ungElem] === theElem) relation = "Ứng Sinh Thế: Đối phương chủ động quan tâm, bao dung, một lòng hướng về đương số.";
      else if (sinhMap[theElem] === ungElem) relation = "Thế Sinh Ứng: Đương số si tình, hy sinh nhiều hơn cho đối phương, chịu phần thiệt thòi.";
      else if (khacMap[ungElem] === theElem) relation = "Ứng Khắc Thế: Đối phương lấn lướt, tính tình áp đặt, dễ nảy sinh mâu thuẫn đối đầu gay gắt.";
      else relation = "Thế Khắc Ứng: Đương số nắm quyền kiểm soát trong mối quan hệ, muốn đối phương phục tùng.";

      const taiCount = this.haos.filter(h => h.luc_than === "Thê Tài").length;
      const quanCount = this.haos.filter(h => h.luc_than === "Quan Quỷ").length;
      const thirdPartyWarning = [];

      if (taiCount >= 2) thirdPartyWarning.push("Xuất hiện nhiều hào Thê Tài: Chuyện tình cảm có sự so sánh, phân tâm hoặc mối quan hệ ngoài luồng");
      if (quanCount >= 2) thirdPartyWarning.push("Xuất hiện nhiều hào Quan Quỷ: Tâm tư phức tạp, có nhiều người theo đuổi hoặc áp lực tình cảm nặng nề");
      if (this.haos.some(h => h.luc_than === "Huynh Đệ" && h.is_moving)) {
        thirdPartyWarning.push("Huynh Đệ phát động: Cảnh báo sự cản trở từ bạn bè/người thứ ba chen ngang hoặc mâu thuẫn tranh đoạt");
      }
      if (thirdPartyWarning.length === 0) {
        thirdPartyWarning.push("Cung tình cảm thuần nhất, không có dấu hiệu can nhiễu từ người thứ ba");
      }

      const ungTrait = LiJiZhongKnowledge.LUC_THU_TRAITS[ungHao.luc_thu] || {};

      return {
        domain_title: "Hôn Nhân, Tình Cảm & Hạnh Phúc Gia Đạo",
        the_ung_dynamic: relation,
        partner_personality: `Đối phương ngự Hào ${ungHao.position} (${ungHao.luc_than} ${ungHao.branch}) lâm ${ungHao.luc_thu}: ${ungTrait.psychology || 'Tính cách bình ổn'}.`,
        romance_hazards: thirdPartyWarning.join('; ')
      };
    }

    analyzeHealthMedical() {
      const theHao = this.haos[this.thePos - 1];
      const tuHaos = this.haos.filter(h => h.luc_than === "Tử Tôn");

      const theVitality = theHao.energy;
      let vitalityDesc = "";
      if (theVitality >= 3.0) vitalityDesc = "Chính khí sung mãn, sức đề kháng tự thân rất tốt, nhanh hồi phục nếu ốm đau.";
      else if (theVitality >= -1.0) vitalityDesc = "Thể lực ở mức trung bình, dễ mệt mỏi khi làm việc quá sức, cần nghỉ ngơi bồi bổ.";
      else vitalityDesc = "Nguyên khí suy vi, sức đề kháng giảm sút nghiêm trọng, cơ thể đang ở trạng thái báo động.";

      const pathologyPoints = [];
      for (const h of this.haos) {
        const isPathogen = (h.luc_than === "Quan Quỷ") || (h.luc_thu === "Bạch Hổ" && (h.is_moving || h.energy < -3.0));
        if (isPathogen) {
          const pos = h.position;
          const posInfo = LiJiZhongKnowledge.HAO_POSITIONS[pos].body_anatomy;
          const elemInfo = LiJiZhongKnowledge.PATHOLOGY_MATRIX[h.element] || {};

          let pDesc = `Hào ${pos} (${h.luc_than} ${h.branch} - ${h.element}) lâm ${h.luc_thu}: Điểm báo tổn thương tại vùng [${posInfo}]. Mầm bệnh liên quan đến: ${elemInfo.organs || ''} (Triệu chứng: ${elemInfo.symptoms || ''}).`;
          if (h.luc_thu === "Bạch Hổ") {
            pDesc += ` -> [CẢNH BÁO]: ${elemInfo.moving_hazard || 'Nguy cơ viêm nhiễm nặng hoặc phẫu thuật'}.`;
          }
          pathologyPoints.push(pDesc);
        }
      }

      if (pathologyPoints.length === 0) {
        pathologyPoints.push("Không có điểm báo bệnh lý nguy hiểm; các cơ quan trong cơ thể vận hành bình ổn.");
      }

      let cureAssessment = "";
      if (tuHaos.some(h => h.energy > 2.0)) cureAssessment = "Thuốc men gặp thầy gặp thuốc rất đắc lực, hệ miễn dịch tự nhiên hoạt động tích cực (Tử Tôn vượng tướng).";
      else if (tuHaos.some(h => h.energy >= -1.0)) cureAssessment = "Cần tuân thủ đúng phác đồ điều trị của bác sĩ chuyên khoa, không được chủ quan bỏ dở.";
      else cureAssessment = "Dược lực còn yếu hoặc dùng chưa đúng thuốc, cần tham vấn ý kiến chuyên gia y tế uy tín để đổi phác đồ.";

      return {
        domain_title: "Thể Trạng Sinh Học, Cơ Quan Cơ Thể & Chẩn Đoán Bệnh Lý",
        vitality_status: vitalityDesc,
        pathology_points: pathologyPoints,
        treatment_prognosis: cureAssessment
      };
    }

    analyzeSpatialFengShui() {
      const hao2 = this.haos[1]; // Trạch
      const hao5 = this.haos[4]; // Nhân

      const sinhMap = { "Thủy": "Mộc", "Mộc": "Hỏa", "Hỏa": "Thổ", "Thổ": "Kim", "Kim": "Thủy" };
      const khacMap = { "Thủy": "Hỏa", "Hỏa": "Kim", "Kim": "Mộc", "Mộc": "Thổ", "Thổ": "Thủy" };

      let trachNhan = "";
      if (sinhMap[hao2.element] === hao5.element) trachNhan = "Trạch Sinh Nhân: Nhà sinh người, căn nhà bồi tụ vượng khí cho gia chủ, ở lâu càng phát đạt.";
      else if (hao2.element === hao5.element) trachNhan = "Trạch Nhân Tỷ Hòa: Khí trường của nhà và người cân bằng, gia đạo yên vui, bình ổn.";
      else if (khacMap[hao2.element] === hao5.element) trachNhan = "Trạch Khắc Nhân: Nhà khắc người, ở trong nhà hay cảm thấy ngột ngạt, mệt mỏi, bất an, tài lộc khó tụ.";
      else trachNhan = "Nhân Khắc Trạch / Nhân Sinh Trạch: Gia chủ phải hao tâm tổn sức sửa sang cải tạo nhà cửa nhiều lần.";

      const spatialDiagnostics = [];
      for (const h of this.haos) {
        const p = h.position;
        const posSpace = LiJiZhongKnowledge.HAO_POSITIONS[p].space_fengshui;
        const thu = h.luc_thu;
        const hasAnomaly = h.is_moving || h.is_nguyet_pha || (h.luc_than === "Quan Quỷ") || (["Đằng Xà", "Bạch Hổ"].includes(thu) && h.energy < 0);

        if (hasAnomaly) {
          let diag = `Hào ${p} [${posSpace}] mang ${h.luc_than} ${h.branch} lâm ${thu}: `;
          if (thu === "Đằng Xà") diag += "Có mạng nhện giăng, dây điện chằng chịt bừa bộn hoặc góc khuất u ám tích tụ âm khí.";
          else if (thu === "Bạch Hổ") diag += "Có đồ kim loại sắc nhọn chĩa vào hoặc vị trí này đang bị nứt nẻ, hư hại, cần sửa chữa gấp.";
          else if (thu === "Chu Tước") diag += "Vị trí này gần nguồn nhiệt/đồ điện tử phát tiếng ồn, dễ gây bất an cãi cọ trong nhà.";
          else if (thu === "Huyền Vũ") diag += "Vị trí này bị ẩm mốc, đường ống nước rò rỉ hoặc thiếu ánh sáng tự nhiên.";
          else if (h.is_moving) diag += "Vị trí này đang có sự xáo trộn, dịch chuyển đồ đạc hoặc chấn động mạnh.";
          else diag += "Khí trường tại khu vực này chưa ổn định, cần dọn dẹp phong quang.";
          spatialDiagnostics.push(diag);
        }
      }

      if (spatialDiagnostics.length === 0) {
        spatialDiagnostics.push("Cả 6 bậc hào vị trong gia trạch đều quang đãng, phong thủy hài hòa tàng phong tụ khí.");
      }

      return {
        domain_title: "Phong Thủy Không Gian Gia Trạch (6 Bậc Hào Vị)",
        house_vs_occupant: trachNhan,
        spatial_issues: spatialDiagnostics
      };
    }

    detectHiddenWarnings() {
      const warnings = [];

      for (const h of this.haos) {
        const dyn = h.dynamics;
        if (dyn) {
          if (dyn.hoi_dau === "HOI_DAU_KHAC") {
            warnings.push(`[LƯU Ý HÀO ĐỘNG]: Hào ${h.position} (${h.luc_than}) phát động HÓA HỒI ĐẦU KHẮC -> ${dyn.hoi_dau_desc}.`);
          }
          if (dyn.hoa_mo) {
            warnings.push(`[LƯU Ý HÀO ĐỘNG]: Hào ${h.position} (${h.luc_than}) phát động HÓA MỘ -> ${dyn.hoa_mo_desc}.`);
          }
          if (dyn.hoa_tuyet) {
            warnings.push(`[LƯU Ý HÀO ĐỘNG]: Hào ${h.position} (${h.luc_than}) phát động HÓA TUYỆT -> ${dyn.hoa_tuyet_desc}.`);
          }
        }
      }

      for (const h of this.haos) {
        if (h.is_moving && h.luc_thu === "Bạch Hổ") {
          warnings.push(`[LƯU Ý AN TOÀN]: Hào ${h.position} (${h.luc_than}) lâm BẠCH HỔ phát động: Cần cẩn trọng khi đi lại, tránh va chạm và giữ bình tĩnh trong giao tiếp.`);
        }
      }

      const tamHinhList = this.hexData.tam_hinh || [];
      for (const th of tamHinhList) warnings.push(`[LƯU Ý TAM HÌNH]: ${th}`);

      const spec = this.hexData.special_structure || {};
      for (const note of (spec.special_notes || [])) {
        if (note.includes("Lục Xung") || note.includes("Du Hồn")) {
          warnings.push(`[LƯU Ý CẤU TRÚC QUẺ]: ${note}`);
        }
      }

      const theHao = this.haos[this.thePos - 1];
      if ((theHao.stars || []).includes("Dương Nhận")) {
        warnings.push("[LƯU Ý HÀNH XỬ]: Hào Thế lâm DƯƠNG NHẬN: Dễ nảy sinh tâm lý nóng vội, thiếu kiên nhẫn; cần giữ bình tĩnh khi xử lý công việc.");
      }

      for (const h of this.haos) {
        if (h.luc_than === "Phụ Mẫu" && (h.is_nguyet_pha || h.energy <= -6.0)) {
          warnings.push(`[LƯU Ý GIA ĐẠO & HỒ SƠ]: Hào ${h.position} (Phụ Mẫu) bị Nguyệt Phá / Suy kiệt: Cần chú ý theo dõi sức khỏe người lớn tuổi và rà soát kỹ giấy tờ quan trọng.`);
        }
      }

      if (theHao.energy <= -7.0) {
        warnings.push("[LƯU Ý NỘI LỰC]: Hào Thế suy yếu: Nên ưu tiên nghỉ ngơi, củng cố sức khỏe và hạn chế đưa ra các quyết định quan trọng.");
      }

      if (warnings.length === 0) {
        warnings.push("Bàn quẻ không ghi nhận xung sát nghiêm trọng; toàn cục vận hành ổn định.");
      }

      return warnings;
    }
  }

  // =========================================================================
  // 9. ĐỘNG CƠ NGHIỆM CHỨNG HIỆN TRẠNG (GROUND-TRUTH VERIFICATION ENGINE)
  // =========================================================================
  const GroundTruthVerificationEngine = {
    BODY_POSITIONS: {
      1: { zone: "Bàn chân, ngón chân, gót chân", habit: "thường xuyên phải đi lại nhiều, vùng bàn chân hoặc gót chân gần đây dễ nhức mỏi" },
      2: { zone: "Cẳng chân, khớp gối, đùi", habit: "vùng khớp gối hoặc cơ đùi chịu lực nhiều, dễ mỏi khi đứng lâu" },
      3: { zone: "Thắt lưng, rốn, bụng dưới, dạ dày", habit: "hệ tiêu hóa hoặc vùng thắt lưng khá nhạy cảm với thức ăn và thời tiết" },
      4: { zone: "Lồng ngực, lưng trên, tim, phổi", habit: "vùng lưng trên hoặc lồng ngực dễ cảm thấy tức mỏi khi làm việc căng thẳng" },
      5: { zone: "Vùng cổ, họng, vai, mặt, miệng", habit: "vùng cổ vai gáy hoặc thanh quản dễ bị căng cứng, khô rát khi nói nhiều" },
      6: { zone: "Đầu, não bộ, thái dương, giấc ngủ", habit: "hệ thần kinh chịu nhiều áp lực suy nghĩ, dễ đau thái dương hoặc trằn trọc khó ngủ" }
    },

    LUC_THU_PERSONAL_TRAITS: {
      "Thanh Long": {
        trait: "Thần sắc hòa nhã, diện mạo sáng sủa, giao thiệp nhã nhặn",
        feature: "khuôn mặt hoặc cơ thể thường có nét tươi tỉnh, gần đây trong người tinh thần tương đối thoải mái hoặc vừa đón nhận thông tin tích cực"
      },
      "Chu Tước": {
        trait: "Phản xạ nhanh, hoạt ngôn, năng động, bộc trực",
        feature: "vùng mặt, miệng hoặc họng thường có nốt ruồi/vết tì nhỏ, gần đây dễ bị khô nóng trong người hoặc phải nói và trao đổi nhiều"
      },
      "Câu Trần": {
        trait: "Tính cách cẩn trọng, điềm tĩnh, chắc chắn, kiên trì",
        feature: "dáng người đậm chắc, da ngăm hoặc dày dạn; hệ tiêu hóa hoặc vùng cơ bắp dễ mỏi mệt khi thay đổi thói quen sinh hoạt"
      },
      "Đằng Xà": {
        trait: "Tư duy nhạy cảm, hay suy nghĩ sâu, trực giác tốt",
        feature: "giấc ngủ chập chờn hoặc hay tỉnh giấc giữa đêm; trên cơ thể dễ có nốt ruồi ẩn, vết chàm hoặc vết bớt bẩm sinh"
      },
      "Bạch Hổ": {
        trait: "Tính cách cương trực, quyết đoán, làm việc thẳng thắn dứt khoát",
        feature: "trên người thường có vết sẹo mổ, vết khâu hoặc vết trầy xước cũ; vùng cơ xương khớp tương ứng dễ bị đau nhức khi thời tiết giao mùa"
      },
      "Huyền Vũ": {
        trait: "Kín đáo, thận trọng, tư duy thâm trầm, ít bộc lộ ra ngoài",
        feature: "đang có những toan tính, kế hoạch riêng tư hoặc chuyện nội bộ chưa tiện công khai; thói quen làm việc thường thiên về chiều tối hoặc không gian yên tĩnh"
      }
    },

    LUC_THU_SPATIAL_TRAITS: {
      "Huyền Vũ": "khu vực bếp, chân tường hoặc hệ thống ống nước có hiện tượng rò rỉ ẩm, thoát nước chậm hoặc có góc khuất thiếu ánh sáng",
      "Bạch Hổ": "trong nhà hoặc ngay trước cửa có vật kim loại sắc nhọn, thiết bị máy móc cơ khí, ngã ba đường hoặc bờ tường có vết nứt mẻ",
      "Đằng Xà": "khu vực phòng ngủ hoặc bếp nấu có đường dây điện chằng chịt, đường ống uốn lượn hoặc đồ đạc sắp đặt gây cảm giác rối mắt",
      "Câu Trần": "nền móng, sân trước hoặc góc nhà từng được tôn tạo, sửa chữa hoặc có vật liệu xây dựng cũ tích tụ chưa dọn",
      "Chu Tước": "khu vực bếp nấu hoặc bàn thờ có nguồn nhiệt lớn, không gian gần cửa sổ hoặc cổng ngõ dễ bị ảnh hưởng bởi tiếng ồn bên ngoài",
      "Thanh Long": "gian nhà chính hoặc cửa ra vào tương đối thoáng đãng, có bố trí cây cảnh hoặc đồ gỗ bài trí gọn gàng, đón sáng tốt"
    },

    verifyGroundTruth(hexData, graphData) {
      const haos = hexData.haos;
      const theHao = haos.find(h => h.is_the) || haos[0];
      const thePos = theHao.position;
      const theLucThu = theHao.luc_thu;

      const bodyInfo = this.BODY_POSITIONS[thePos] || this.BODY_POSITIONS[3];
      const traitInfo = this.LUC_THU_PERSONAL_TRAITS[theLucThu] || this.LUC_THU_PERSONAL_TRAITS["Thanh Long"];

      const personalVerification = `Về bản thân đương số (Hào Thế ngự Hào ${thePos} lâm ${theLucThu}): ${traitInfo.trait}. Về thể trạng và nhân tướng: ${traitInfo.feature}. Đặc biệt tại vùng cơ thể [${bodyInfo.zone}], ${bodyInfo.habit}.`;

      const hao2 = haos[1];
      const h2LucThu = hao2.luc_thu;
      const h2Note = this.LUC_THU_SPATIAL_TRAITS[h2LucThu] || "khu vực sinh hoạt duy trì thế ổn định, ánh sáng và thông gió vừa phải";

      const extraSpatial = [];
      for (const h of haos) {
        const p = h.position;
        if (h.is_moving) {
          if (p === 3) extraSpatial.push("cửa ngõ hoặc cầu thang gần đây có sự cọt kẹt, tiếng ồn hoặc phát sinh sửa chữa nhỏ");
          else if (p === 6) extraSpatial.push("mái nhà, trần nhà hoặc bờ tường trên cao có vết nứt hoặc cần gia cố chống thấm");
          else if (p === 1) extraSpatial.push("nền móng hoặc cống rãnh thoát nước sát mặt đất có chỗ bị nghẹt cát sỏi");
        } else if (h.is_nguyet_pha && p === 2) {
          extraSpatial.push("khu vực bếp nấu hoặc gian nhà chính từng có vật dụng bị vỡ hoặc thiết bị điện nước bị hỏng");
        }
      }
      const extraStr = extraSpatial.length > 0 ? ` Đồng thời, ${extraSpatial[0]}.` : "";
      const spatialVerification = `Về hiện trạng nhà ở (Khảo sát Hào 2 Trạch lâm ${h2LucThu}): Tại gia trạch hiện hữu, ${h2Note}.${extraStr}`;

      const recentEvents = [];
      const nguyetPhaHaos = haos.filter(h => h.is_nguyet_pha);
      if (nguyetPhaHaos.length > 0) {
        const np = nguyetPhaHaos[0];
        const lt = np.luc_than;
        if (lt === "Thê Tài") recentEvents.push("Trong vòng 1 tháng trở lại đây, đương số vừa trải qua một đợt hao tốn tài chính ngoài dự kiến hoặc đồ dùng giá trị bị hỏng");
        else if (lt === "Phụ Mẫu") recentEvents.push("Gần đây thủ tục giấy tờ, hợp đồng hoặc công việc liên quan đến người lớn tuổi trong gia đình gặp chút chậm trễ, phát sinh điều chỉnh");
        else if (lt === "Huynh Đệ") recentEvents.push("Thời gian ngắn trước đó có sự bất đồng ý kiến hoặc va chạm lời nói với bạn bè, đồng nghiệp");
        else if (lt === "Quan Quỷ") recentEvents.push("Gần đây đương số vừa giải tỏa được một áp lực công việc hoặc vừa khỏi một đợt cảm sốt, nhức mỏi");
        else recentEvents.push("Gần đây kế hoạch vui chơi hoặc công việc của con cái, dự án mới có sự thay đổi thời gian");
      }

      const amDongHaos = haos.filter(h => h.is_am_dong);
      if (amDongHaos.length > 0 && recentEvents.length === 0) {
        const ad = amDongHaos[0];
        recentEvents.push(`Có một sự việc bất ngờ vừa phát sinh từ phía môi trường ngoài tác động tới đương số (liên quan đến Hào ${ad.position} ${ad.luc_than}) mà trước đó chưa lường tới`);
      }

      const tuanKhongHaos = haos.filter(h => h.is_tuan_khong);
      if (tuanKhongHaos.length > 0 && recentEvents.length < 2) {
        const tk = tuanKhongHaos[0];
        recentEvents.push(`Hiện tại đang có một lời hứa hẹn, cuộc trao đổi hoặc khoản tiền liên quan đến ${tk.luc_than} vẫn đang trong trạng thái chờ đợi, chưa có kết quả phản hồi dứt điểm`);
      }

      if (recentEvents.length === 0) {
        recentEvents.push("Thời gian gần đây công việc và đời sống duy trì nhịp độ bình ổn, không có biến động tiêu cực lớn phát sinh");
      }

      const recentPastVerification = recentEvents.map(r => r.replace(/\.+$/, '')).join('. ') + '.';

      return {
        personal_anchor: personalVerification,
        spatial_anchor: spatialVerification,
        recent_past_anchor: recentPastVerification
      };
    }
  };

  // =========================================================================
  // 10. ĐỘNG CƠ SINH LUẬN GIẢI CHUYÊN SÂU (DEEP NARRATIVE ENGINE)
  // =========================================================================
  const DeepNarrativeEngine = {
    HEXAGRAM_CORE_PHILOSOPHY: {
      "Thuần Càn": "Cương kiện hanh thông, thời cơ vươn lên nắm quyền chủ động",
      "Thuần Khôn": "Nhu thuận bao dung, nuôi dưỡng nâng đỡ vạn vật, dĩ tĩnh chế động",
      "Thủy Lôi Truân": "Khởi đầu gian nan, vạn sự sơ khai cần kiên nhẫn tích lũy",
      "Sơn Thủy Mông": "Mông muội cần khai sáng, lắng nghe lời thầy, chớ hấp tấp",
      "Thủy Thiên Nhu": "Chờ đợi thời cơ, tích dưỡng khí lực, kiên định ắt thành",
      "Thiên Thủy Tụng": "Tranh chấp bất hòa, dĩ hòa vi quý, chớ cố theo kiện",
      "Địa Thủy Sư": "Chính quy kỷ luật, tập hợp lực lượng, cẩn trọng dùng người",
      "Thủy Địa Tỷ": "Thân thiết gắn bó, tương trợ đồng lòng, hòa hợp đắc lợi",
      "Phong Thiên Tiểu Súc": "Tích lũy nhỏ bé, mây dày chưa mưa, kiên trì chờ gió",
      "Thiên Trạch Lý": "Đi trên đuôi cọp, giữ lễ thận trọng, biến nguy thành an",
      "Địa Thiên Thái": "Thái bình thịnh trị, âm dương giao hòa, thông suốt hanh thông",
      "Thiên Địa Bĩ": "Bế tắc tối tăm, tiểu nhân lấn lướt, quân tử ẩn nhẫn",
      "Thiên Hỏa Đồng Nhân": "Đồng tâm hiệp lực, hòa hợp đại chúng, việc lớn dễ thành",
      "Hỏa Thiên Đại Hữu": "Mùa màng bội thu, ánh dương rực rỡ, danh tài song toàn",
      "Địa Sơn Khiêm": "Khiêm tốn hưởng phúc, đạo trời bớt thừa bù thiếu, bền vững",
      "Lôi Địa Dự": "Vui vẻ phấn khởi, hăng hái tiến bước, lòng người hướng về",
      "Trạch Lôi Tùy": "Tùy thời ứng biến, thuận theo tự nhiên, chớ cưỡng cầu",
      "Sơn Phong Cổ": "Trùng tu việc cũ, bài trừ tệ nạn, lội ngược dòng cải cách",
      "Địa Trạch Lâm": "Đến gần giám sát, thời vận phát đạt, phòng tháng tám thoái",
      "Phong Địa Quan": "Quan sát tĩnh lặng, thấu triệt lòng người, nêu gương sáng",
      "Hỏa Lôi Phệ Hạp": "Cắn đứt trở lực, nghiêm minh pháp luật, trừ khử gian tà",
      "Sơn Hỏa Bí": "Vẻ đẹp văn nhã, trang sức chừng mực, thực chất quý hơn hình",
      "Sơn Địa Bác": "Bào mòn sụp đổ, nền móng lung lay, chỉ nên an phận thủ thường",
      "Địa Lôi Phục": "Dương khí quay về, một vòng tuần hoàn mới bắt đầu khởi sắc",
      "Thiên Lôi Vô Vọng": "Chân thật tự nhiên, không toan tính vụ lợi, chớ làm càn",
      "Sơn Thiên Đại Súc": "Kho tàng tích lũy, bồi dưỡng tài đức lớn, chờ thời xuất kích",
      "Sơn Lôi Di": "Dưỡng thân dưỡng tâm, cẩn trọng lời ăn tiếng nói và ẩm thực",
      "Trạch Phong Đại Quá": "Gánh nặng quá tải, rường cột lung lay, cần nhanh chóng giải tỏa",
      "Thuần Khảm": "Hiểm trở trùng trùng, giữ lòng chí thành vượt qua giông bão",
      "Thuần Ly": "Ánh sáng văn minh, bám vào chính đạo, sáng suốt nhận định",
      "Trạch Sơn Hàm": "Cảm ứng chân thành, nam nữ giao hòa, lòng thành lay động",
      "Lôi Phong Hằng": "Bền bỉ dài lâu, thủy chung như nhất, giữ vững lập trường",
      "Thiên Sơn Độn": "Lùi bước bảo toàn khí lực, tránh né xung đột với kẻ tiểu nhân",
      "Lôi Thiên Đại Tráng": "Khí thế hừng hực, sức mạnh dồi dào, cẩn trọng ngông cuồng",
      "Hỏa Địa Tấn": "Mặt trời lên cao, thăng tiến vượt bậc, được ân huệ cất nhắc",
      "Địa Hỏa Minh Di": "Mặt trời lặn dưới đất, tổn thương u tối, giấu kín tài trí",
      "Phong Hỏa Gia Nhân": "Trong ấm ngoài êm, gia đạo chỉnh tề, giữ nghiêm gia phong",
      "Hỏa Trạch Khuê": "Bất hòa trái nghịch, chia rẽ nội bộ, tìm điểm chung trong dị biệt",
      "Thủy Sơn Kiển": "Gian nan trước mắt, dừng bước suy xét, tìm sự trợ giúp của bạn hiền",
      "Lôi Thủy Giải": "Tháo gỡ ách tắc, ân xá giải nguy, khó khăn dần tan biến",
      "Sơn Trạch Tổn": "Chịu phần thiệt thòi, bớt dục vọng bồi bổ đức dày, trước tổn sau ích",
      "Phong Lôi Ích": "Gia tăng nguồn lực, chớp thời cơ mở rộng, làm việc nghĩa",
      "Trạch Thiên Quải": "Dứt khoát quyết đoán, dẹp bỏ dứt điểm điều sai trái",
      "Thiên Phong Cấu": "Gặp gỡ tình cờ, âm nhu lớn dần, cẩn trọng sự cám dỗ bất ngờ",
      "Trạch Địa Tụy": "Tụ hội đông vui, quy tụ nhân tài và tài vật, cần đề phòng hỗn loạn",
      "Địa Phong Thăng": "Từng bước đi lên, tích tiểu thành đại, có quý nhân dẫn lối",
      "Trạch Thủy Khốn": "Bế tắc thử thách, cùng đường sinh biến, rèn luyện chí khí",
      "Thủy Phong Tỉnh": "Giếng nước nuôi người, mạch nguồn không cạn, tu dưỡng nhân cách",
      "Trạch Hỏa Cách": "Cách mạng lột xác, đổi cũ thay mới, hợp lòng trời thuận lòng người",
      "Hỏa Phong Đỉnh": "Đúc vạc lập ngôi, vững vàng nghiệp lớn, biến chất thành tinh",
      "Thuần Chấn": "Sấm vang chấn động, kinh sợ sửa mình, bình tĩnh làm chủ",
      "Thuần Cấn": "Dừng lại bất động, giữ vững ranh giới, định tâm an định",
      "Phong Sơn Tiệm": "Tuần tự tiến bước, vững chắc từng khâu, chim hồng bay về núi",
      "Lôi Trạch Quy Muội": "Hấp tấp sai lầm, tiến thoái lưỡng nan, vội vàng chuốc họa",
      "Lôi Hỏa Phong": "Cực thịnh đủ đầy, đỉnh cao vinh quang, giữ mình kẻo trăng khuyết",
      "Hỏa Sơn Lữ": "Khách trọ tha hương, hoàn cảnh bất định phiêu bạt, thận trọng giữ mình",
      "Thuần Tốn": "Thuận tòng khiêm nhường, gió thấu ngóc ngách, quyền biến linh hoạt",
      "Thuần Đoài": "Vui vẻ giao tiếp, ngôn từ êm dịu, bè bạn đàm đạo tương trợ",
      "Phong Thủy Hoán": "Giải tán tiêu tan, gió thổi tan mây mù, vượt qua sóng gió",
      "Thủy Trạch Tiết": "Tiết chế có chừng, kỷ luật chừng mực, không nên quá khắt khe",
      "Phong Trạch Trung Phu": "Lòng thành tín nghĩa, cảm động vạn vật, uy tín tạo thành công",
      "Lôi Sơn Tiểu Quá": "Vượt quá đôi chút, việc nhỏ thành công, việc lớn chớ mạo hiểm",
      "Thủy Hỏa Ký Tế": "Mọi sự đã xong, thành tựu trọn vẹn, cảnh giác thoái trào ngầm",
      "Hỏa Thủy Vị Tế": "Chưa xong việc, khởi đầu chu kỳ mới, nỗ lực đến cùng sẽ hanh thông"
    },

    getHexagramCoreMeaning(name) {
      if (!name) return "Biến chuyển trạng thái khí vận theo quy luật âm dương tiêu trưởng";
      for (const [k, v] of Object.entries(this.HEXAGRAM_CORE_PHILOSOPHY)) {
        if (k.toLowerCase() === name.toLowerCase() || name.toLowerCase().includes(k.toLowerCase())) {
          return v;
        }
      }
      return "Biến chuyển trạng thái khí vận theo quy luật âm dương tiêu trưởng";
    },

    synthesize(meta, hexData, intentEval, graphData, timingData, multiLens) {
      const question = (meta.question || "").trim();
      const domainType = MultiObjectiveIntentResolver.detectDomain(question);
      intentEval.domain_type = domainType;

      const directAnswer = this.buildDirectQuestionAnswer(meta, hexData, intentEval, graphData, multiLens, timingData);
      const overviewText = this.buildOverview(meta, hexData, intentEval, graphData);
      const groundTruth = GroundTruthVerificationEngine.verifyGroundTruth(hexData, graphData);
      const brightPoints = this.buildBrightPoints(hexData, graphData, multiLens);
      const darkPoints = this.buildDarkPoints(hexData, graphData, multiLens);
      const domainDeepDive = this.buildDomainDeepDive(domainType, hexData, graphData, multiLens);
      const strategicAdvice = this.buildStrategicAdvice(intentEval, timingData, multiLens, hexData);

      return {
        domain_type: domainType,
        direct_answer: directAnswer,
        section_1_overview: overviewText,
        section_2_verification: groundTruth,
        section_3_bright_points: brightPoints,
        section_4_dark_points: darkPoints,
        section_5_domain_deep_dive: domainDeepDive,
        section_6_strategic_advice: strategicAdvice
      };
    },

    buildDirectQuestionAnswer(meta, hexData, intentEval, graphData, multiLens, timingData) {
      const q = (meta.question || "").trim();
      const domainType = intentEval.domain_type || MultiObjectiveIntentResolver.detectDomain(q);
      const prob = intentEval.success_probability !== undefined ? intentEval.success_probability : 0.5;
      const uScore = intentEval.total_utility !== undefined ? intentEval.total_utility : 0.0;
      const theHao = hexData.haos.find(h => h.is_the) || hexData.haos[0];
      const ungHao = hexData.haos.find(h => h.is_ung) || hexData.haos[3];
      const posTiming = timingData.optimal_positive_timing || { branch: "Thân", meaning: "Thời điểm thuận lợi" };
      const negTiming = timingData.critical_risk_timing || { branch: "Dần", meaning: "Thời điểm rủi ro" };

      // 1. Phán đoán trực diện câu hỏi chiêm đoán (Direct Answer)
      let directVerdict = "";
      switch (domainType) {
        case "TAI_CHINH_DAU_TU":
          if (prob >= 0.65) directVerdict = "Về việc đầu tư / cầu tài: **NÊN TRIỂN KHAI**. Bàn quẻ cho thấy dòng tiền có triển vọng sinh lời thực chất, nguồn vốn luân chuyển thông suốt và mục tiêu tài chính đạt được như kỳ vọng.";
          else if (prob >= 0.40) directVerdict = "Về việc đầu tư / cầu tài: **NÊN THẬN TRỌNG, CHỈ NÊN THĂM DÒ TỪNG PHẦN**. Dòng tiền đang ở thế giằng co, chi phí phát sinh có thể làm suy giảm biên lợi nhuận, chưa phải thời điểm giải ngân ồ ạt.";
          else directVerdict = "Về việc đầu tư / cầu tài: **KHÔNG NÊN ĐẦU TƯ LỚN HOẶC MỞ RỘNG QUY MÔ LÚC NÀY**. Nguy cơ hao tổn vốn liếng, dòng tiền dễ bị ứ đọng hoặc bị đối tác chiếm dụng; ưu tiên giữ tiền mặt và bảo toàn thanh khoản.";
          break;

        case "BAT_DONG_SAN_DAT_DAI":
          if (prob >= 0.65) directVerdict = "Về giao dịch bất động sản / nhà đất: **GIAO DỊCH THUẬN LỢI, CÓ THỂ TIẾN HÀNH**. Đất đai / nhà ở trường khí ổn định, pháp lý minh bạch và giá trị giao dịch đạt được mức mong muốn.";
          else if (prob >= 0.40) directVerdict = "Về giao dịch bất động sản / nhà đất: **TIẾN TRÌNH CÒN CHẬM, CẦN RÀ SOÁT KỸ HỒ SƠ PHÁP LÝ**. Có sự giằng co về giá cả hoặc thủ tục giấy tờ cần thời gian bổ sung, nên kiên nhẫn đàm phán thêm.";
          else directVerdict = "Về giao dịch bất động sản / nhà đất: **CHƯA NÊN CHỐT GIAO DỊCH HOẶC XUẤT TIỀN ĐẶT CỌC**. Quẻ báo hiệu rủi ro về quy hoạch, tranh chấp ranh giới hoặc tính thanh khoản kém, dễ bị chôn vốn lâu dài.";
          break;

        case "CONG_DANH_SU_NGHIEP":
          if (prob >= 0.65) directVerdict = "Về công việc / thăng chức / chuyển việc: **KẾT QUẢ RẤT KHẢ QUAN, NÊN TỰ TIN ỨNG TUYỂN HOẶC NHẬN NHIỆM VỤ MỚI**. Uy tín và năng lực chuyên môn được cấp trên ghi nhận, mở ra cơ hội phát triển bền vững.";
          else if (prob >= 0.40) directVerdict = "Về công việc / cơ hội nghề nghiệp: **CƠ HỘI ĐANG TRONG GIAI ĐOẠN CÂN NHẮC, NÊN GIỮ VỊ TRÍ ỔN ĐỊNH VÀ BỒI ĐẮP NĂNG LỰC**. Tránh thay đổi vội vàng khi chưa nắm chắc điều khoản và môi trường mới.";
          else directVerdict = "Về công việc / sự nghiệp: **CHƯA PHẢI THỜI ĐIỂM THÍCH HỢP ĐỂ CHUYỂN ĐỔI HOẶC ĐÒI HỎI QUYỀN LỢI**. Môi trường đang có áp lực lớn, có thể gặp đối thủ cạnh tranh hoặc bất đồng quan điểm với cấp trên, nên nhẫn nại phòng thủ.";
          break;

        case "THI_CU_HOC_VAN":
          if (prob >= 0.65) directVerdict = "Về thi cử / học vấn / bảo vệ đề án: **KẾT QUẢ ĐẠT ĐƯỢC NHƯ Ý NGUYỆN, DỄ ĐẠT ĐIỂM CAO HOẶC TRÚNG TUYỂN**. Văn tinh trợ lực, kiến thức chuẩn bị chu đáo và nhận được sự đánh giá tích cực từ hội đồng.";
          else if (prob >= 0.40) directVerdict = "Về thi cử / học vấn: **KẾT QUẢ Ở MỨC AN TOÀN, ĐẠT YÊU CẦU NHƯNG CẦN TẬP TRUNG CAO ĐỘ**. Đề phòng tâm lý chủ quan hoặc sai sót nhỏ do không rà soát kỹ yêu cầu của hội đồng/đề tài.";
          else directVerdict = "Về thi cử / học vấn: **KẾT QUẢ CHƯA ĐẠT KỲ VỌNG HOẶC GẶP TRỞ LỰC VỀ THỦ TỤC**. Cần rà soát kỹ lưỡng kiến thức, chuẩn bị hồ sơ chỉn chu và chuẩn bị sẵn phương án thi lại/bảo vệ lại.";
          break;

        case "PHAP_LY_TRANH_CHAP":
          if (prob >= 0.65) directVerdict = "Về tranh chấp / pháp lý: **CƠ SỞ PHÁP LÝ NGHIÊNG VỀ PHÍA ĐƯƠNG SỐ, KHẢ NĂNG THẮNG KIỆN HOẶC HÒA GIẢI CÓ LỢI RẤT CAO**. Chứng cứ rõ ràng, đối phương có xu hướng thoái lui.";
          else if (prob >= 0.40) directVerdict = "Về tranh chấp / pháp lý: **NÊN ƯU TIÊN THƯƠNG LƯỢNG HÒA GIẢI NGOÀI TÒA ÁN**. Vụ việc có tính chất kéo dài, chi phí tốn kém và kết quả khó tạo ưu thế tuyệt đối cho bên nào.";
          else directVerdict = "Về tranh chấp / pháp lý: **BẤT LỢI CHO ĐƯƠNG SỐ, NÊN TÌM CÁCH RÚT LUI HOẶC THỎA HIỆP ĐỂ TRÁNH THIỆT HẠI NẶNG HƠN**. Nguy cơ vướng vào rắc rối tố tụng dai dẳng hoặc bị xử phạt hành chính.";
          break;

        case "HON_NHAN_TINH_CAM":
          if (prob >= 0.65) directVerdict = "Về tình duyên / hôn nhân: **MỐI QUAN HỆ HÒA HỢP, TIẾN TRIỂN TỐT ĐẸP VÀ CÓ HỶ TÍN**. Đôi bên thấu hiểu, tôn trọng và có sự gắn kết bền chặt, thích hợp cho việc bàn tính chuyện trăm năm.";
          else if (prob >= 0.40) directVerdict = "Về tình duyên / hôn nhân: **CẦN SỰ CHIA SẺ VÀ LẮNG NGHE ĐỂ GIẢI TỎA HIỂU LẦM**. Mối quan hệ có sự so đo hoặc tác động từ bên ngoài, chớ nên nóng giận làm tổn thương nhau.";
          else directVerdict = "Về tình duyên / hôn nhân: **CẢNH BÁO RẠN NỨT HOẶC MÂU THUẪN ĐỐI ĐẦU GAY GẮT**. Đôi bên thiếu sự tin tưởng, dễ có sự can thiệp từ người thứ ba hoặc khác biệt khó dung hòa, cần bình tĩnh xem xét lại.";
          break;

        case "THAI_SAN_SINH_NO":
          if (prob >= 0.65) directVerdict = "Về thai sản / sinh nở: **MẸ TRÒN CON VUÔNG, THAI KHÍ VỮNG VÀNG AN LÀNH**. Con cái khỏe mạnh, sinh nở thuận buồm xuôi gió.";
          else if (prob >= 0.40) directVerdict = "Về thai sản / sinh nở: **THAI KỲ CẦN CHÚ Ý NGHỈ NGƠI VÀ THEO DÕI ĐỊNH KỲ**. Đề phòng mệt mỏi thể chất, nên tuân thủ chỉ dẫn dinh dưỡng và khám thai đúng hẹn.";
          else directVerdict = "Về thai sản / sinh nở: **CẦN ĐẶC BIỆT CẨN TRỌNG, TUÂN THỦ NGHIÊM NGẶT HƯỚNG DẪN CỦA BÁC SĨ SẢN KHOA**. Tránh vận động mạnh, theo dõi sát các dấu hiệu bất thường để xử lý kịp thời.";
          break;

        case "SUC_KHOE_BENH_TAT":
          if (prob >= 0.65) directVerdict = "Về sức khỏe / điều trị bệnh: **BỆNH TÌNH CÓ CHUYỂN BIẾN RẤT TÍCH CỰC, NHANH CHÓNG PHỤC HỒI**. Gặp thầy gặp thuốc, thể trạng cải thiện rõ rệt từng ngày.";
          else if (prob >= 0.40) directVerdict = "Về sức khỏe / bệnh tật: **BỆNH DẠNG MÃN TÍNH CẦN THỜI GIAN ĐIỀU DƯỠNG KIÊN TRÌ**. Không nên nôn nóng hoặc tự ý đổi thuốc, cần duy trì lối sống lành mạnh.";
          else directVerdict = "Về sức khỏe / bệnh tật: **TÌNH TRẠNG CƠ THỂ ĐANG CẢNH BÁO, CẦN ĐI KHÁM CHUYÊN SÂU NGAY LẬP TỨC**. Tránh chủ quan với các triệu chứng đau nhức hoặc sốt kéo dài.";
          break;

        case "PHONG_THUY_GIA_TRACH":
          if (prob >= 0.65) directVerdict = "Về phong thủy gia trạch / nơi ở: **ĐẤT LÀNH CHIM ĐẬU, TRƯỜNG KHÍ GIA ĐẠO AN KHANG TỤ KHÍ**. Môi trường sống hòa hợp giúp gia chủ an tâm làm ăn và giữ gìn hòa khí.";
          else if (prob >= 0.40) directVerdict = "Về phong thủy nơi ở: **CÓ MỘT VÀI ĐIỂM BẤT CẬP NHỎ CẦN SẮP XẾP LẠI**. Nên dọn dẹp các khu vực bừa bộn hoặc tối tăm (bếp, chân cầu thang) để kích hoạt sinh khí.";
          else directVerdict = "Về phong thủy nơi ở: **GIA TRẠCH BỊ XUNG SÁT HOẶC CÓ ĐIỂM NGHẼN KHÍ NẶNG NỀ**. Cần xem xét cải tạo lại hướng bếp, lối vào hoặc khắc phục hiện tượng thấm dột ẩm mốc.";
          break;

        case "XUAT_HANH_GIAO_THONG":
          if (prob >= 0.65) directVerdict = "Về chuyến đi / xuất hành: **CHUYẾN ĐI HANH THÔNG, THƯỢNG LỘ BÌNH AN VÀ ĐẠT ĐƯỢC MỤC ĐÍCH**. Lịch trình suôn sẻ, nơi đến đón tiếp thuận lợi.";
          else if (prob >= 0.40) directVerdict = "Về chuyến đi / di chuyển: **LỊCH TRÌNH CÓ THỂ PHÁT SINH THAY ĐỔI HOẶC CHẬM TRỄ NHẸ**. Cần kiểm tra kỹ giấy tờ, phương tiện và dự trù thời gian đi lại.";
          else directVerdict = "Về chuyến đi / xuất hành: **NÊN CÂN NHẮC HOÃN LỊCH TRÌNH NẾU KHÔNG THẬT SỰ CẤP BÁCH**. Đề phòng thời tiết xấu, trục trặc xe cộ hoặc giấy tờ bị vướng mắc.";
          break;

        case "TIM_NGUOI_TIM_VAT":
          if (prob >= 0.65) directVerdict = "Về việc tìm đồ / tìm người: **KHẢ NĂNG TÌM LẠI ĐƯỢC RẤT CAO, VẬT / NGƯỜI CHƯA ĐI XA**. Tập trung tìm kiếm theo hướng và vị trí hào Dụng Thần chỉ dẫn sẽ có kết quả.";
          else if (prob >= 0.40) directVerdict = "Về việc tìm kiếm: **TÌM ĐƯỢC NHƯNG CẦN THỜI GIAN VÀ SỰ KIÊN TRÌ HỎI THĂM**. Có thể bị vật khác che khuất hoặc người cần tìm đang ở nơi kín đáo.";
          else directVerdict = "Về việc tìm kiếm: **RẤT KHÓ TÌM LẠI HOẶC ĐÃ THẤT LẠC XA**. Cần nhờ cậy lực lượng chức năng hoặc mở rộng tối đa phạm vi tìm kiếm.";
          break;

        default: // CHIEM_VAN_TONG_QUAN
          if (prob >= 0.65) directVerdict = "Về thời vận tổng quan: **VẬN THẾ ĐANG TRONG KỲ KHỞI SẮC, VẠN SỰ HANH THÔNG**. Thích hợp triển khai các dự định ấp ủ, nắm bắt thời cơ để bứt phá.";
          else if (prob >= 0.40) directVerdict = "Về thời vận tổng quan: **CỤC DIỆN BÌNH HÒA, THUẬN LỢI ĐI KÈM THỬ THÁCH**. Nên lấy ổn định làm trọng, củng cố nền tảng và tích lũy nội lực chờ thời.";
          else directVerdict = "Về thời vận tổng quan: **THỜI VẬN CHƯA THUẬN, NÊN THỦ THƯỜNG AN PHẬN**. Tránh mạo hiểm hoặc mở rộng việc lớn, tập trung giải quyết các tồn đọng nội bộ.";
          break;
      }

      // 2. Cơ chế khí số then chốt (Core Rationale)
      const rationaleParts = [];
      const theEnergy = graphData.nodes_state[theHao.position - 1].equilibrium_energy;
      const theTone = theEnergy >= 2.0 ? "nội lực vững vàng, khí số vượng tướng" : (theEnergy >= -1.0 ? "nội lực ở mức bình hòa" : "nội lực suy yếu, chịu nhiều sức ép");
      rationaleParts.push(`Hào Thế (chủ thể đương số) ngự Hào ${theHao.position} mang ${theHao.luc_than} ${theHao.branch} lâm ${theHao.luc_thu} có ${theTone}.`);

      const grad = intentEval.the_vs_ung_gradient || 0.0;
      if (grad > 2.0) rationaleParts.push("Thế - Ứng cho thấy đương số nắm thế thượng phong chủ động, hoàn cảnh và đối phương hướng về mình.");
      else if (grad < -2.0) rationaleParts.push("Thế - Ứng cho thấy hoàn cảnh hoặc đối tác ngoài cuộc đang chiếm thế lấn lướt, đương số cần tránh đối đầu trực diện.");
      else rationaleParts.push("Thế và Ứng cân bằng tương đắc, đôi bên cùng thăm dò phối hợp.");

      const movingHaos = hexData.haos.filter(h => h.is_moving);
      if (movingHaos.length > 0) {
        const movDetails = movingHaos.map(mh => {
          const dyn = mh.dynamics;
          let dynLabel = "";
          if (dyn) {
            if (dyn.hoi_dau) dynLabel = dyn.hoi_dau_desc;
            else if (dyn.tien_thoai) dynLabel = dyn.tien_thoai_desc;
            else if (dyn.hoa_mo) dynLabel = "động hóa Mộ (nguồn lực bị giữ lại)";
            else if (dyn.hoa_tuyet) dynLabel = "động hóa Tuyệt (động lực suy giảm)";
          }
          return `Hào ${mh.position} (${mh.luc_than} ${mh.branch}) động biến sang ${mh.changed_branch} (${mh.changed_luc_than})${dynLabel ? `: ${dynLabel}` : ''}`;
        });
        rationaleParts.push(`Bàn quẻ phát động tại: ${movDetails.join('; ')}.`);
      } else {
        rationaleParts.push("Quẻ thuần tĩnh không có hào động, sự việc diễn tiến tuần tự theo trường khí ổn định, không có biến động bất ngờ.");
      }

      const coreRationale = rationaleParts.join(' ');

      // 3. Quyết định then chốt
      let keyAction = "";
      if (uScore >= 1.5) {
        keyAction = "Chủ động triển khai quyết liệt theo kế hoạch. Tận dụng tối đa nguồn lực và thời cơ để tiến hành các bước then chốt.";
      } else if (uScore >= -0.5) {
        keyAction = "Thận trọng thăm dò, đi từng bước nhỏ và kiện toàn các điều khoản / nguồn lực nội bộ trước khi cam kết chính thức.";
      } else {
        keyAction = "Tạm dừng hoặc hoãn lại các quyết định đầu tư, thay đổi quan trọng; ưu tiên phòng thủ, bảo toàn vốn và quản trị rủi ro.";
      }

      // 4. Thời điểm vàng (Ứng kỳ cát)
      const goldenTiming = `Địa Chi ${posTiming.branch.toUpperCase()} (${posTiming.meaning}). Bố trí các công việc trọng yếu, ký kết, đàm phán hoặc khởi động vào ngày/tháng mang Chi ${posTiming.branch}.`;

      // 5. Thời điểm rủi ro (Ứng kỳ hung)
      const riskTiming = `Địa Chi ${negTiming.branch.toUpperCase()} (${negTiming.meaning}). Cần thận trọng trong giao tiếp, hạn chế quyết định vội vàng và đề phòng các chi phí phát sinh vào ngày/tháng mang Chi ${negTiming.branch}.`;

      // 6. Biện pháp quản trị rủi ro & Hóa giải
      const hw = multiLens.hidden_warnings || [];
      let remedyAdvice = "";
      if (hw.length > 0 && !hw[0].includes("không ghi nhận xung sát")) {
        remedyAdvice = `Cần lưu ý: ${hw[0]}. Khuyến nghị rà soát kỹ tính pháp lý hợp đồng, minh bạch tài chính và kiểm tra an toàn không gian sống.`;
      } else {
        remedyAdvice = "Duy trì kỷ luật vận hành, chuẩn bị quỹ dự phòng tài chính từ 10-15%, và kiểm soát tiến độ định kỳ để tránh sơ suất nhỏ.";
      }

      // 7. Tâm thái xử thế theo Đạo Dịch
      const hexName = meta.hexagram_name;
      const coreMeaning = this.getHexagramCoreMeaning(hexName);
      const iChingMindset = `Quẻ ${hexName} nhắc nhở: "${coreMeaning}". Người trí biết tùy thời ứng biến, thuận theo đạo trời mà hành xử chính trực thì vạn sự được hanh thông.`;

      return {
        question: q,
        domain_title: MultiObjectiveIntentResolver.DOMAINS_MAP[domainType] || "Chiêm Đoán Toàn Cảnh",
        direct_verdict: directVerdict,
        core_rationale: coreRationale,
        key_action: keyAction,
        golden_timing: goldenTiming,
        risk_timing: riskTiming,
        remedy_advice: remedyAdvice,
        i_ching_mindset: iChingMindset
      };
    },

    buildOverview(meta, hexData, intentEval, graphData) {
      const hexName = meta.hexagram_name;
      const changedName = meta.changed_hexagram_name;
      const palace = meta.palace;
      const decision = intentEval.decision;
      const prob = intentEval.success_probability;
      const theGradient = intentEval.the_vs_ung_gradient;
      const questionText = (meta.question || "").trim();

      const hasMoving = hexData.has_moving_hao;
      const movingCount = hexData.haos.filter(h => h.is_moving).length;

      const p = [];
      const isGeneral = !questionText || ["chiêm đoán thời vận tổng quan", "xem vận hạn", "tổng quan"].includes(questionText.toLowerCase());

      if (!isGeneral) {
        p.push(`Xét theo vấn đề đương số đang băn khoăn về *"${questionText}"*, bàn quẻ xác lập Quẻ Chính là **${hexName.toUpperCase()}** (${palace})` + 
               (hasMoving ? `, phát sinh ${movingCount} hào động biến thành quẻ **${changedName.toUpperCase()}**.` : ", là một **Quẻ Tĩnh** thuần nhất không có hào động."));
      } else {
        p.push(`Xét theo ý niệm chiêm định **Khí vận toàn cảnh & Thời thế đời sống** của đương số, bàn quẻ xác lập Quẻ Chính là **${hexName.toUpperCase()}** (${palace})` + 
               (hasMoving ? `, phát sinh ${movingCount} hào động biến thành quẻ **${changedName.toUpperCase()}**.` : ", là một **Quẻ Tĩnh** thuần nhất không có hào động."));
      }

      const coreMeaning = this.getHexagramCoreMeaning(hexName);
      p.push(`Đạo lý căn bản của quẻ **${hexName}** trong Chu Dịch chỉ rõ: *"${coreMeaning}"*.`);

      if (hasMoving) {
        const changedMeaning = this.getHexagramCoreMeaning(changedName);
        p.push(`Sự xuất hiện của các hào động chuyển hóa quẻ chính sang quẻ biến **${changedName}** mang thông điệp: *"${changedMeaning}"*. Sự việc trải qua hai giai đoạn: giai đoạn đầu biểu hiện qua tính chất của quẻ chính, sau đó chuyển hướng sang chiều hướng của quẻ biến.`);
      } else {
        p.push("Bàn quẻ sáu hào an tĩnh phản ánh sự việc đang ở trạng thái tích tụ ổn định, chuyển biến theo đúng quy luật tự nhiên, không có biến cố xáo trộn đột ngột từ bên ngoài.");
      }

      if (prob >= 0.75) {
        p.push(`Tổng hòa năng lượng đồ thị đạt mức hữu dụng cao, khẳng định cục diện **${decision}** (xác suất khả thi đạt khoảng ${Math.round(prob * 100)}%).`);
      } else if (prob >= 0.45) {
        p.push(`Tổng hòa năng lượng phản ánh trạng thái **${decision}** (khả năng cân bằng đạt khoảng ${Math.round(prob * 100)}%), thuận lợi hay khó khăn tùy thuộc vào sự chuẩn bị kỹ lưỡng và thái độ ứng xử.`);
      } else {
        p.push(`Tổng hòa năng lượng cho thấy quẻ rơi vào thế **${decision}** (khả năng thuận lợi chỉ đạt khoảng ${Math.round(prob * 100)}%), cần chủ động phòng vệ và tránh mạo hiểm.`);
      }

      if (theGradient > 2.0) {
        p.push("Tương quan Thế - Ứng nghiêng rõ rệt về phía Hào Thế, khẳng định **đương số hoàn toàn nắm thế chủ động và quyền quyết định trong tay**.");
      } else if (theGradient < -2.0) {
        p.push("Tương quan Thế - Ứng nghiêng về phía đối phương, phản ánh **hoàn cảnh khách quan bên ngoài hoặc đối tác đang nắm quyền chi phối áp đảo**. Đương số đang ở thế bị động, chịu nhiều áp lực kiềm chế.");
      } else {
        p.push("Tương quan năng lượng giữa Thế và Ứng ở thế cân bằng giằng co, hai bên vừa hợp tác vừa thăm dò lẫn nhau, không bên nào hoàn toàn áp đặt được bên nào.");
      }

      return p.join(' ');
    },

    buildBrightPoints(hexData, graphData, multiLens) {
      const points = [];
      const haos = hexData.haos;
      const nodesState = graphData.nodes_state;

      const theHao = haos.find(h => h.is_the) || haos[0];
      const theEnergy = nodesState[theHao.position - 1].equilibrium_energy;
      if (theEnergy >= 3.0) {
        points.push({
          title: `Nội Lực Hào Thế Vững Vàng (Hào ${theHao.position} ${theHao.luc_than} ${theHao.branch} Lâm ${theHao.luc_thu})`,
          detail: "Hào Thế đại diện cho chính bản thân đương số ngự ngôi vượng tướng, khí số sung mãn. Điều này bảo đảm tâm lý tự tin, sức khỏe dồi dào, trí tuệ sáng suốt và đủ bản lĩnh đương đầu với mọi biến cố."
        });
      }

      const taiHaos = haos.filter(h => h.luc_than === "Thê Tài");
      for (const th of taiHaos) {
        const e = nodesState[th.position - 1].equilibrium_energy;
        if (e >= 3.0) {
          points.push({
            title: `Kho Tài Vận Vượng Tướng (Hào ${th.position} Thê Tài ${th.branch} ${th.element})`,
            detail: `Thê Tài ngự Hào ${th.position} lâm ${th.luc_thu} vượng khí dồi dào. Đây là chỉ dấu rõ ràng cho thấy dòng tiền tiềm năng rất lớn, nguồn thu nhập hoặc lợi nhuận của sự việc có cơ sở phát triển vững bền.`
          });
        }
      }

      const tuHaos = haos.filter(h => h.luc_than === "Tử Tôn");
      for (const tuh of tuHaos) {
        const e = nodesState[tuh.position - 1].equilibrium_energy;
        if (e >= 3.0) {
          points.push({
            title: `Phúc Thần Che Chở & Nguồn Khách Hàng Ổn Định (Hào ${tuh.position} Tử Tôn ${tuh.branch})`,
            detail: "Tử Tôn là Phúc Đức chi thần, vừa là nguồn sinh tài bất tận, vừa khắc chế tiêu trừ tai họa của Quan Quỷ. Tử Tôn có lực mang lại sự hanh thông, sản phẩm được thị trường đón nhận, hoặc ốm đau mau gặp thầy gặp thuốc."
          });
        }
      }

      for (const h of haos) {
        const dyn = h.dynamics;
        if (dyn) {
          if (dyn.hoi_dau === "HOI_DAU_SINH") {
            points.push({
              title: `Hào ${h.position} (${h.luc_than}) Động Hóa Hồi Đầu Sinh`,
              detail: dyn.hoi_dau_desc
            });
          } else if (dyn.tien_thoai === "TIEN_THAN") {
            points.push({
              title: `Hào ${h.position} (${h.luc_than}) Động Hóa Tiến Thần`,
              detail: dyn.tien_thoai_desc
            });
          }
        }
      }

      for (const th of (hexData.tam_hop || [])) {
        points.push({
          title: `Cát Cục Tam Hợp ${th.cuc_name}`,
          detail: th.description
        });
      }

      for (const h of haos) {
        const stars = h.stars || [];
        const pos = h.position;
        for (const st of stars) {
          if (st === "Quý Nhân") {
            points.push({
              title: `Thiên Ất Quý Nhân Phù Trợ (Ngự tại Hào ${pos} ${h.luc_than})`,
              detail: "Quý Nhân là đệ nhất cát thần giải ách. Báo hiệu trong hoàn cảnh ngặt nghèo sẽ có quý nhân, bậc trưởng bối hoặc người có thẩm quyền ra tay tương trợ, biến nguy thành an."
            });
          } else if (st === "Lộc Thần") {
            points.push({
              title: `Đắc Lộc Thần Bản Mệnh (Ngự tại Hào ${pos} ${h.luc_than})`,
              detail: "Lộc Thần chủ về bổng lộc, lương bổng chính thức, nguồn thu vững bền của cơ quan hoặc sự nghiệp, đem lại sự sung túc tài chính tự nhiên."
            });
          } else if (st === "Dịch Mã" && (h.is_moving || h.is_the)) {
            points.push({
              title: `Dịch Mã Phát Động / Lâm Thế (Hào ${pos})`,
              detail: "Dịch Mã chủ về di chuyển, biến động, xuất ngoại, thăng tiến nhanh. Báo hiệu cơ hội bứt phá sẽ đến khi thay đổi môi trường hoặc đi công tác xa."
            });
          }
        }
      }

      for (const h of haos) {
        if (h.luc_thu === "Thanh Long" && nodesState[h.position - 1].equilibrium_energy > 0) {
          points.push({
            title: `Cát Khí Từ Thanh Long (Ngự tại Hào ${h.position} ${h.luc_than})`,
            detail: "Thanh Long là đệ nhất cát thần Lục Thú, chủ về niềm vui, hỷ tín, danh dự quang minh và các mối quan hệ giao thiệp văn nhã, giúp tăng cường uy tín và tạo vận may bất ngờ."
          });
          break;
        }
      }

      if (points.length === 0) {
        points.push({
          title: "Trạng Thái Ổn Định Nội Bộ",
          detail: "Quẻ duy trì sự ổn định tương đối, không bị xung phá hoàn toàn, tạo tiền đề để tích lũy nội lực từng bước."
        });
      }
      return points;
    },

    buildDarkPoints(hexData, graphData, multiLens) {
      const points = [];
      const haos = hexData.haos;
      const nodesState = graphData.nodes_state;

      for (const h of haos) {
        const dyn = h.dynamics;
        if (dyn) {
          if (dyn.hoi_dau === "HOI_DAU_KHAC") {
            points.push({
              title: `Hào ${h.position} (${h.luc_than}) Động Hóa Hồi Đầu Khắc`,
              detail: `${dyn.hoi_dau_desc}. Phản ánh hành động phát sinh gặp lực cản ngược chiều từ kết quả biến hóa, cần rà soát và điều chỉnh phương án triển khai.`
            });
          } else if (dyn.hoa_mo) {
            points.push({
              title: `Hào ${h.position} (${h.luc_than}) Động Hóa Mộ`,
              detail: `${dyn.hoa_mo_desc}. Phản ánh nguồn lực hoặc tiến độ tạm thời bị lưu giữ, cần thời điểm xung hợp để giải tỏa.`
            });
          } else if (dyn.hoa_tuyet) {
            points.push({
              title: `Hào ${h.position} (${h.luc_than}) Động Hóa Tuyệt`,
              detail: `${dyn.hoa_tuyet_desc}. Động lực ban đầu có xu hướng suy giảm dần, cần bổ sung nguồn lực tiếp sức kịp thời.`
            });
          } else if (dyn.tien_thoai === "THOAI_THAN") {
            points.push({
              title: `Hào ${h.position} (${h.luc_than}) Động Hóa Thoái Thần`,
              detail: `${dyn.tien_thoai_desc}. Tiến độ có xu hướng chậm lại, cần duy trì kỷ luật và kiên định mục tiêu.`
            });
          }
        }
      }

      const lucThanImpact = {
        "Thê Tài": "Chủ về dòng tiền, vốn liếng hoặc chi phí. Dấu hiệu này cảnh báo sự thâm hụt tài chính, khả năng thu hồi vốn chậm hoặc phát sinh chi tiêu ngoài dự tính.",
        "Quan Quỷ": "Chủ về thẩm quyền, vị thế công tác, thủ tục pháp lý hoặc sức ép tâm lý. Báo hiệu công việc chịu nhiều trở lực, quy trình phê duyệt kéo dài.",
        "Phụ Mẫu": "Chủ về hồ sơ, chứng từ, bằng cấp, hợp đồng hoặc người lớn tuổi. Cần rà soát kỹ tính pháp lý văn bản và chú ý sức khỏe thân nhân.",
        "Tử Tôn": "Chủ về nguồn khách hàng, sản phẩm đầu ra, phương án phục hồi hoặc tinh thần lạc quan. Báo hiệu thị trường có phần trầm lắng hoặc tinh thần dễ mệt mỏi.",
        "Huynh Đệ": "Chủ về sự cạnh tranh, đồng nghiệp hoặc đối tác đồng cấp. Báo hiệu nguồn lực tương trợ từ bên ngoài còn hạn chế, cần chủ động dựa vào nội lực."
      };

      for (const h of haos) {
        const pos = h.position;
        const e = nodesState[pos - 1].equilibrium_energy;
        if (h.is_nguyet_pha || e <= -5.0) {
          const lt = h.luc_than;
          const impactText = lucThanImpact[lt] || "Khí số suy giảm, nguồn lực tại cung vị này cần thời gian củng cố.";
          const theUngTag = h.is_the ? " [THẾ]" : (h.is_ung ? " [ỨNG]" : "");
          points.push({
            title: `Tổn Thương Khí Số Tại Hào ${pos} (${lt} ${h.branch} Lâm ${h.luc_thu}${theUngTag})`,
            detail: `Hào ${pos} rơi vào thế ${h.is_nguyet_pha ? 'Nguyệt Phá' : 'Suy kiệt khí số'}. ${impactText}`
          });
        }
      }

      for (const h of haos) {
        if (h.is_tuan_khong) {
          const theUngTag = h.is_the ? " [THẾ]" : (h.is_ung ? " [ỨNG]" : "");
          points.push({
            title: `Hào ${h.position} (${h.luc_than} ${h.branch}${theUngTag}) Rơi Vào Tuần Không`,
            detail: `${h.luc_than} lâm Tuần Không biểu thị sự việc tạm thời chưa định hình, lời hứa hẹn hoặc kết quả thực tế cần chờ đến ngày xuất không hoặc xung không mới rõ ràng.`
          });
        }
      }

      for (const h of haos) {
        if (h.luc_than === "Huynh Đệ" && (h.is_moving || nodesState[h.position - 1].equilibrium_energy >= 5.0)) {
          points.push({
            title: `Nguy Cơ Tranh Đoạt & Hao Tán Từ Huynh Đệ (Hào ${h.position} ${h.branch})`,
            detail: "Huynh Đệ là thần cướp tài và gây khẩu thiệt. Huynh Đệ quá vượng cảnh báo chi phí vận hành phình to, đối tác ngầm cạnh tranh, hoặc bị bạn bè/đồng nghiệp chia sẻ bớt quyền lợi."
          });
          break;
        }
      }

      for (const h of haos) {
        if ((h.stars || []).includes("Dương Nhận")) {
          const role = `Hào ${h.position} (${h.luc_than} ${h.branch})` + (h.is_the ? " [THẾ]" : (h.is_ung ? " [ỨNG]" : ""));
          points.push({
            title: `Sát Khí Từ Dương Nhận (Ngự tại ${role})`,
            detail: `${role} lâm Dương Nhận mang tính cương liệt, thẳng thắn; cần tiết chế cảm xúc, tránh nóng vội đưa ra quyết định khi chưa đủ cơ sở dữ liệu.`
          });
        }
      }

      const phucList = multiLens.phuc_than_analysis || [];
      for (const pt of phucList) {
        if (!pt.can_emerge) {
          let roleLabel = "";
          if (pt.is_under_the) roleLabel = " [Ẩn dưới Hào Thế]";
          else if (pt.is_under_ung) roleLabel = " [Ẩn dưới Hào Ứng]";
          else if (pt.is_under_moving) roleLabel = " [Ẩn dưới Hào Động]";
          else roleLabel = " [Dụng Thần Khuyết]";

          const meaningNote = pt.hidden_meaning ? ` Ý nghĩa ẩn tàng: ${pt.hidden_meaning}.` : "";
          points.push({
            title: `Phục Thần Trọng Yếu Bị Kìm Hãm${roleLabel} (${pt.missing_luc_than} Ẩn Dưới Hào ${pt.position})`,
            detail: `Lục Thân [${pt.missing_luc_than}] ẩn nấp dưới Phi Thần ${pt.phi_luc_than} (${pt.phi_branch}). ${pt.phi_phuc_relation}. ${pt.emerge_analysis}.${meaningNote}`
          });
        }
      }

      if (points.length === 0) {
        points.push({
          title: "Không Có Điểm Nghẽn Nguy Hiểm Lớn",
          detail: "Bàn quẻ không xuất hiện sát khí xung phá dữ dội, các rủi ro phát sinh chỉ ở mức độ xáo trộn cục bộ dễ khắc phục."
        });
      }
      return points;
    },

    buildDomainDeepDive(domainType, hexData, graphData, multiLens) {
      const l2 = multiLens.lens_2_wealth_finance;
      const l3 = multiLens.lens_3_career_status;
      const l4 = multiLens.lens_4_marriage_romance;
      const l5 = multiLens.lens_5_health_medical;
      const l6 = multiLens.lens_6_spatial_fengshui;

      // 1. TÀI CHÍNH & ĐẦU TƯ
      if (domainType === "TAI_CHINH_DAU_TU" || domainType === "TAI_CHINH_KINH_DOANH") {
        const taiEval = l2.tai_status;
        let taiConclude = "";
        if (taiEval.includes("Phục Tàng")) {
          taiConclude = "Dấu hiệu này phản ánh nguồn vốn hoặc lợi nhuận chưa thể hiện hữu ngay, dòng tiền có thể bị chậm thu hồi hoặc còn ở dạng tiềm năng. Cần thận trọng trong việc giải ngân hay mở rộng quy mô.";
        } else if (taiEval.includes("suy kiệt")) {
          taiConclude = "Dấu hiệu này cảnh báo nguy cơ thâm hụt tài chính, hiệu quả sinh lời thấp so với dự kiến, cần tính toán kỹ rủi ro tồn đọng vốn.";
        } else if (taiEval.includes("vượng tướng")) {
          taiConclude = "Điều này khẳng định tiềm năng sinh lời tốt, khả năng luân chuyển vốn nhanh và tính khả thi tài chính cao.";
        } else {
          taiConclude = "Dòng tiền ở mức ổn định, đáp ứng được chi phí vận hành thường xuyên nhưng chưa có thặng dư đột biến.";
        }

        return {
          field_name: "LĨNH VỰC TÀI CHÍNH, ĐẦU TƯ & DÒNG TIỀN DOANH NGHIỆP",
          analysis_blocks: [
            { subtitle: "1. Năng Lực Vốn & Khả Năng Sinh Lời (Hào Thê Tài)", content: `Hào Thê Tài là yếu tố phản ánh dòng tiền và nguồn vốn của sự việc. Hiện trạng: ${taiEval}. ${taiConclude}` },
            { subtitle: "2. Nguồn Sinh Tài & Thị Trường (Hào Tử Tôn)", content: `Hào Tử Tôn đóng vai trò sinh trợ tài chính và phản ánh nguồn khách hàng. Đánh giá: ${l2.tu_ton_assessment} Cần chú trọng chất lượng sản phẩm và giữ vững tệp khách hàng trọng tâm.` },
            { subtitle: "3. Kiểm Soát Chi Phí & Cạnh Tranh (Hào Huynh Đệ)", content: `Yếu tố chi phí và cạnh tranh được phản ánh qua hào Huynh Đệ. Nhận định: ${l2.huynh_de_risk}. Cần kiểm soát hợp đồng, theo dõi công nợ chặt chẽ và hạn chế chi tiêu phát sinh ngoài kế hoạch.` }
          ]
        };
      }

      // 2. BẤT ĐỘNG SẢN & ĐẤT ĐAI
      if (domainType === "BAT_DONG_SAN_DAT_DAI") {
        const phuHaos = hexData.haos.filter(h => h.luc_than === "Phụ Mẫu");
        const taiHaos = hexData.haos.filter(h => h.luc_than === "Thê Tài");
        const h2 = hexData.haos[1];
        const h2Energy = graphData.nodes_state[1].equilibrium_energy;

        let h2Status = "";
        if (h2Energy >= 2.0) h2Status = `Hào 2 (Trạch) ngự ${h2.branch} lâm ${h2.luc_thu} vượng tướng: Trường khí khu đất ổn định, kết cấu công trình vững chãi, môi trường xung quanh hòa hợp.`;
        else if (h2Energy <= -2.0 || h2.is_nguyet_pha) h2Status = `Hào 2 (Trạch) ngự ${h2.branch} lâm ${h2.luc_thu} chịu lực xung phá hoặc suy khí: Cần kiểm tra kỹ hiện trạng nền móng, chất lượng hoàn thiện hoặc hệ thống thoát nước.`;
        else h2Status = `Hào 2 (Trạch) ngự ${h2.branch} lâm ${h2.luc_thu} bình hòa: Bất động sản duy trì giá trị sử dụng ổn định.`;

        let phStatus = "";
        if (phuHaos.length > 0) {
          const ph = phuHaos[0];
          if (ph.is_tuan_khong) phStatus = `Hào Phụ Mẫu ${ph.branch} lâm Tuần Không: Hồ sơ giấy tờ, sổ đỏ hoặc chứng từ chuyển nhượng đang trong quá trình xử lý, chưa hoàn tất thủ tục dứt điểm.`;
          else if (ph.is_nguyet_pha) phStatus = `Hào Phụ Mẫu ${ph.branch} lâm Nguyệt Phá: Cần rà soát kỹ tính pháp lý, chỉ giới quy hoạch hoặc tranh chấp ranh giới đất đai trước khi đặt cọc.`;
          else phStatus = `Hào Phụ Mẫu ${ph.branch} ngự Hào ${ph.position} lâm ${ph.luc_thu}: Tính pháp lý rõ ràng, giấy chứng nhận quyền sở hữu và hợp đồng chuyển nhượng hợp lệ.`;
        } else {
          phStatus = "Hào Phụ Mẫu phục tàng dưới phi thần: Hồ sơ pháp lý cần thời gian xác minh tại cơ quan đăng ký đất đai, chớ vội vàng giao dịch khi chưa rõ quy hoạch.";
        }

        let valStatus = "";
        if (taiHaos.length > 0) {
          const th = taiHaos[0];
          const thEnergy = graphData.nodes_state[th.position - 1].equilibrium_energy;
          if (thEnergy >= 2.0) valStatus = `Hào Thê Tài ${th.branch} vượng khí: Giá trị chuyển nhượng tương đối hấp dẫn, khả năng giữ giá hoặc sinh lời theo thời gian rất khả quan.`;
          else valStatus = `Hào Thê Tài ${th.branch} suy khí: Tính thanh khoản chậm, dòng tiền thu hồi cần thời gian dài, không thích hợp cho phương án lướt sóng ngắn hạn.`;
        } else {
          valStatus = "Hào Thê Tài bất hiện trên quẻ chính: Dòng tiền từ bất động sản chưa thể thu hồi ngay, giao dịch có thể kéo dài hơn dự tính.";
        }

        return {
          field_name: "LĨNH VỰC BẤT ĐỘNG SẢN, NHÀ ĐẤT & SANG NHƯỢNG",
          analysis_blocks: [
            { subtitle: "1. Khí Trường & Vị Thế Mặt Bằng / Nhà Đất (Hào 2 Trạch)", content: h2Status },
            { subtitle: "2. Tính Pháp Lý, Giấy Tờ Sở Hữu & Quy Hoạch (Hào Phụ Mẫu)", content: phStatus },
            { subtitle: "3. Giá Trị Sang Nhượng & Tiềm Năng Khai Thác (Hào Thê Tài & Tử Tôn)", content: `${valStatus} Khuyến nghị khảo sát giá giao dịch thực tế trong bán kính 1km và kiểm tra bản đồ quy hoạch tại phòng tài nguyên môi trường.` }
          ]
        };
      }

      // 3. CÔNG DANH & SỰ NGHIỆP
      if (domainType === "CONG_DANH_SU_NGHIEP") {
        const quanEval = l3.quan_status;
        let quanConclude = "";
        if (quanEval.includes("Phục Tàng")) quanConclude = "Vị trí và thẩm quyền chưa được xác lập rõ ràng, cơ hội thăng tiến còn phụ thuộc vào các điều kiện khách quan hoặc sự sắp xếp nhân sự cấp trên.";
        else if (quanEval.includes("suy yếu")) quanConclude = "Khối lượng công việc và trách nhiệm lớn nhưng quyền hạn còn hạn chế, cần cẩn trọng trong các quyết định chuyên môn.";
        else if (quanEval.includes("vượng tướng")) quanConclude = "Thời vận công danh thuận lợi, đương số có uy tín, chuyên môn được ghi nhận và có triển vọng đảm nhận trọng trách mới.";
        else quanConclude = "Vị trí công tác duy trì thế ổn định, nên tập trung hoàn thành tốt nhiệm vụ hiện tại.";

        return {
          field_name: "LĨNH VỰC SỰ NGHIỆP, QUAN VẬN, BỔ NHIỆM & CÔNG TÁC",
          analysis_blocks: [
            { subtitle: "1. Vị Trí Công Tác & Thẩm Quyền (Hào Quan Quỷ)", content: `Quan Quỷ là Dụng Thần đại diện cho chức vụ, quyền hạn và môi trường công tác. Trạng thái: ${quanEval}. ${quanConclude}` },
            { subtitle: "2. Quan Hệ Với Cấp Trên & Người Có Thẩm Quyền (Hào 5)", content: `Hào 5 đại diện cho cấp quản lý trực tiếp hoặc cơ quan phê duyệt. Đánh giá: ${l3.superior_relationship} Cần chuẩn bị báo cáo mạch lạc, bám sát quy trình làm việc chuẩn mực.` },
            { subtitle: "3. Hồ Sơ, Văn Bằng & Thủ Tục (Hào Phụ Mẫu)", content: `Yếu tố hồ sơ, chứng từ và cơ sở pháp lý thể hiện qua hào Phụ Mẫu. Hiện trạng: ${l3.document_status} Cần rà soát kỹ các điều khoản văn bản trước khi ký kết hoặc phê duyệt.` }
          ]
        };
      }

      // 4. THI CỬ, HỌC VẤN & BẰNG CẤP
      if (domainType === "THI_CU_HOC_VAN") {
        const phuHaos = hexData.haos.filter(h => h.luc_than === "Phụ Mẫu");
        const quanHaos = hexData.haos.filter(h => h.luc_than === "Quan Quỷ");
        const theHao = hexData.haos.find(h => h.is_the) || hexData.haos[0];
        const theEnergy = graphData.nodes_state[theHao.position - 1].equilibrium_energy;

        let phConclude = "";
        if (phuHaos.length > 0) {
          const ph = phuHaos[0];
          const phE = graphData.nodes_state[ph.position - 1].equilibrium_energy;
          if (ph.is_tuan_khong) phConclude = `Hào Phụ Mẫu ${ph.branch} lâm Tuần Không: Đề thi hoặc bài làm có phần chưa bám sát trọng tâm ôn luyện, hoặc tâm lý trong phòng thi bị phân tâm.`;
          else if (phE >= 2.0) phConclude = `Hào Phụ Mẫu ${ph.branch} vượng tướng: Kiến thức chuẩn bị vững vàng, bài làm gãy gọn, đáp ứng chuẩn mực yêu cầu của hội đồng chấm thi.`;
          else phConclude = `Hào Phụ Mẫu ${ph.branch} ở mức trung bình: Cần rà soát lại các phần kiến thức cốt lõi, tránh các lỗi diễn đạt hoặc sơ suất trong trình bày.`;
        } else {
          phConclude = "Hào Phụ Mẫu phục tàng: Cần kiểm tra kỹ các giấy tờ dự thi, số báo danh và quy chế thi để tránh phát sinh trục trặc thủ tục.";
        }

        let qhConclude = "";
        if (quanHaos.length > 0) {
          const qh = quanHaos[0];
          const qhE = graphData.nodes_state[qh.position - 1].equilibrium_energy;
          if (qhE >= 2.0) qhConclude = `Hào Quan Quỷ ${qh.branch} vượng khí trợ Thế: Cơ hội trúng tuyển hoặc đạt thứ hạng cao rất rõ nét, chỉ tiêu xét tuyển thuận lợi.`;
          else qhConclude = `Hào Quan Quỷ ${qh.branch} suy khí: Tỷ lệ cạnh tranh chỉ tiêu tương đối khốc liệt, cần nỗ lực tối đa trong từng phần điểm số.`;
        } else {
          qhConclude = "Hào Quan Quỷ phục tàng: Kết quả xét tuyển có thể công bố chậm hơn dự kiến hoặc phải chờ đợt xét bổ sung.";
        }

        const psyStatus = theEnergy >= 2.0 
          ? "Tâm lý tự tin, tư duy minh mẫn và phản xạ nhanh nhạy trong phòng thi." 
          : "Có phần hồi hộp, lo âu; cần giữ nhịp thở ổn định và đọc kỹ toàn bộ đề trước khi đặt bút làm bài.";

        return {
          field_name: "LĨNH VỰC THI CỬ, HỌC VẤN, BẰNG CẤP & BỔ NHIỆM CHỨC DANH",
          analysis_blocks: [
            { subtitle: "1. Bài Thi, Kiến Thức & Giấy Báo Kết Quả (Hào Phụ Mẫu)", content: phConclude },
            { subtitle: "2. Thứ Hạng, Bảng Vàng & Điểm Chuẩn Tuyển Chọn (Hào Quan Quỷ)", content: qhConclude },
            { subtitle: "3. Tâm Lý Phòng Thi & Năng Lực Ứng Biến (Hào Thế)", content: `Khảo sát Hào Thế (Sĩ tử): ${psyStatus} Khuyến nghị ngủ đủ giấc trước ngày thi và chuẩn bị đầy đủ dụng cụ, giấy tờ hợp lệ.` }
          ]
        };
      }

      // 5. PHÁP LÝ & TRANH CHẤP
      if (domainType === "PHAP_LY_TRANH_CHAP") {
        const theHao = hexData.haos.find(h => h.is_the) || hexData.haos[0];
        const ungHao = hexData.haos.find(h => h.is_ung) || hexData.haos[3];
        const quanHaos = hexData.haos.filter(h => h.luc_than === "Quan Quỷ");
        const theE = graphData.nodes_state[theHao.position - 1].equilibrium_energy;
        const ungE = graphData.nodes_state[ungHao.position - 1].equilibrium_energy;

        let stance = "";
        if (theE > ungE) stance = "Đương số nắm lý lẽ thuyết phục hơn, hồ sơ chứng cứ có trọng lượng và thế chủ động thuộc về mình.";
        else if (theE < ungE) stance = "Phía đối phương đang chiếm ưu thế về chứng cứ hoặc sự ủng hộ khách quan; đương số nên cân nhắc giải pháp thương lượng, hòa giải ngoài tố tụng.";
        else stance = "Hai bên đều có lý lẽ và lập luận riêng, vụ việc dễ rơi vào thế giằng co kéo dài.";

        let courtStatus = "";
        if (quanHaos.length > 0) {
          const qh = quanHaos[0];
          courtStatus = `Hào Quan Quỷ ${qh.branch} (${qh.luc_thu}) đại diện cho cơ quan xét xử: Quá trình tố tụng đòi hỏi tuân thủ nghiêm ngặt trình tự thủ tục, phán quyết căn cứ chặt chẽ trên chứng cứ văn bản.`;
        } else {
          courtStatus = "Quan Quỷ phục tàng: Vụ việc có xu hướng tạm đình chỉ hoặc chuyển cơ quan hòa giải cấp cơ sở trước khi mở phiên xét xử chính thức.";
        }

        return {
          field_name: "LĨNH VỰC PHÁP LÝ, KIỆN TỤNG & TRANH CHẤP",
          analysis_blocks: [
            { subtitle: "1. Vị Thế Tố Tụng Giữa Hai Bên (Hào Thế - Hào Ứng)", content: stance },
            { subtitle: "2. Cơ Quan Tài Phán & Trình Tự Xét Xử (Hào Quan Quỷ)", content: courtStatus },
            { subtitle: "3. Chứng Cứ Pháp Lý & Chi Phí Tố Tụng (Hào Phụ Mẫu & Huynh Đệ)", content: "Hào Phụ Mẫu (chứng cứ, biên bản) và Huynh Đệ (án phí, chi phí pháp lý): Cần bảo quản kỹ các biên lai, vi bằng và tài liệu đối chiếu; hạn chế phát sinh chi phí tranh tụng kéo dài." }
          ]
        };
      }

      // 6. HÔN NHÂN & TÌNH CẢM
      if (domainType === "HON_NHAN_TINH_CAM" || domainType === "HON_NHAN_TINH_DUYEN") {
        return {
          field_name: "LĨNH VỰC HÔN NHÂN, TÌNH CẢM & GIA ĐẠO",
          analysis_blocks: [
            { subtitle: "1. Tương Tác Giữa Bản Thân Và Đối Tượng (Hào Thế - Hào Ứng)", content: `Mối quan hệ giữa Đương số (Hào Thế) và Đối phương (Hào Ứng): ${l4.the_ung_dynamic} Đây là yếu tố quyết định sự ổn định của mối quan hệ.` },
            { subtitle: "2. Đặc Điểm Của Đối Phương (Hào Ứng)", content: `Khảo sát Hào Ứng: ${l4.partner_personality} Cần thấu hiểu tính cách đối phương để có cách trao đổi phù hợp, tránh bất đồng ý kiến.` },
            { subtitle: "3. Tác Động Bên Ngoài & Yếu Tố Phát Sinh", content: `Đánh giá các yếu tố ngoại cảnh: ${l4.romance_hazards} Sự thẳng thắn, rõ ràng và duy trì giao tiếp thường xuyên là cơ sở duy trì mối quan hệ bền vững.` }
          ]
        };
      }

      // 7. THAI SẢN & SINH NỞ
      if (domainType === "THAI_SAN_SINH_NO") {
        const tuHaos = hexData.haos.filter(h => h.luc_than === "Tử Tôn");
        const theHao = hexData.haos.find(h => h.is_the) || hexData.haos[0];
        const theE = graphData.nodes_state[theHao.position - 1].equilibrium_energy;

        let fetalStatus = "";
        if (tuHaos.length > 0) {
          const th = tuHaos[0];
          const thE = graphData.nodes_state[th.position - 1].equilibrium_energy;
          const isYang = ["Tý", "Dần", "Thìn", "Ngọ", "Thân", "Tuất"].includes(th.branch);
          const genderHint = isYang ? "Thuộc tính dương hào: Xu hướng thiên về bé trai." : "Thuộc tính âm hào: Xu hướng thiên về bé gái.";

          if (th.is_tuan_khong) fetalStatus = `Hào Tử Tôn ${th.branch} ngự Hào ${th.position} lâm Tuần Không: Cần chú ý theo dõi dinh dưỡng và lịch khám thai định kỳ, nghỉ ngơi hợp lý.`;
          else if (thE >= 2.0) fetalStatus = `Hào Tử Tôn ${th.branch} ngự Hào ${th.position} lâm ${th.luc_thu} vượng khí: Thai nhi phát triển khỏe mạnh, trường khí an định. (${genderHint})`;
          else fetalStatus = `Hào Tử Tôn ${th.branch} bình hòa: Thai kỳ diễn tiến bình thường, cần duy trì chế độ sinh hoạt điều độ. (${genderHint})`;
        } else {
          fetalStatus = "Hào Tử Tôn phục tàng: Cần kiểm tra kỹ các mốc siêu âm thai kỳ, bổ sung dưỡng chất theo chỉ định của bác sĩ chuyên khoa sản.";
        }

        const maternalStatus = theE >= 1.0 
          ? "Thể trạng người mẹ khỏe mạnh, khí huyết lưu thông tốt, tinh thần thư thái." 
          : "Người mẹ dễ có cảm giác mệt mỏi, thai nghén; cần tăng cường nghỉ ngơi, tránh làm việc nặng.";

        const deliveryNote = hexData.haos.some(h => h.is_moving && h.luc_thu === "Bạch Hổ")
          ? "Bạch Hổ phát động: Nên chủ động đăng ký tại bệnh viện sản khoa uy tín để được theo dõi sát sao và có chỉ định phương pháp sinh nở an toàn nhất."
          : "Quá trình sinh nở diễn tiến thuận lợi theo phác đồ y khoa thông thường.";

        return {
          field_name: "LĨNH VỰC THAI SẢN, SINH NỞ & SỨC KHỎE MẸ VÀ BÉ",
          analysis_blocks: [
            { subtitle: "1. Thai Nhi & Sự Phát Triển Khỏe Mạnh (Hào Tử Tôn)", content: fetalStatus },
            { subtitle: "2. Thể Trạng Người Mẹ & Môi Trường Dưỡng Thai (Hào Thế & Hào Phụ Mẫu)", content: maternalStatus },
            { subtitle: "3. Tiên Lượng Sinh Nở & Biện Pháp Y Tế Chủ Động", content: `${deliveryNote} Tuyệt đối tuân thủ chỉ định của bác sĩ chuyên khoa sản và khám định kỳ đúng hẹn.` }
          ]
        };
      }

      // 8. SỨC KHỎE & BỆNH TẬT
      if (domainType === "SUC_KHOE_BENH_TAT") {
        return {
          field_name: "LĨNH VỰC THỂ TRẠNG & SỨC KHỎE",
          analysis_blocks: [
            { subtitle: "1. Thể Lực & Sức Đề Kháng (Hào Thế)", content: `Tình trạng thể lực của đương số: ${l5.vitality_status} Thể lực tốt là nền tảng để thích nghi và phục hồi sức khỏe.` },
            { subtitle: "2. Vị Trí Cần Lưu Ý Theo Hào Vị", content: "Khảo sát các vùng cơ thể theo 6 hào vị Lý Kế Trung:\n" + l5.pathology_points.map(p => `• ${p}`).join('\n') },
            { subtitle: "3. Hướng Phục Hồi & Điều Trị (Hào Tử Tôn)", content: `Khảo sát Dược Thần (Tử Tôn): ${l5.treatment_prognosis} Nên tuân thủ phác đồ y khoa chính thống kết hợp sinh hoạt, nghỉ ngơi điều độ.` }
          ]
        };
      }

      // 9. PHONG THỦY GIA TRẠCH
      if (domainType === "PHONG_THUY_GIA_TRACH" || domainType === "GIA_TRACH_PHONG_THUY") {
        return {
          field_name: "LĨNH VỰC KHÔNG GIAN SỐNG & GIA TRẠCH",
          analysis_blocks: [
            { subtitle: "1. Mối Tương Quan Giữa Nhà Ở Và Người Cư Ngụ (Hào 2 & Hào 5)", content: `Đánh giá tương tác giữa Hào 2 (Trạch) và Hào 5 (Nhân): ${l6.house_vs_occupant} Không gian sống ổn định giúp gia tăng sự yên tâm và hiệu quả làm việc.` },
            { subtitle: "2. Khảo Sát Các Khu Vực Theo 6 Hào Vị", content: "Rà soát 6 cung vị trong khuôn viên nhà ở:\n" + l6.spatial_issues.map(s => `• ${s}`).join('\n') }
          ]
        };
      }

      // 10. XUẤT HÀNH & GIAO THÔNG
      if (domainType === "XUAT_HANH_GIAO_THONG") {
        const theHao = hexData.haos.find(h => h.is_the) || hexData.haos[0];
        const hasDichMa = (theHao.stars || []).includes("Dịch Mã");
        const phuHaos = hexData.haos.filter(h => h.luc_than === "Phụ Mẫu");

        const maDesc = hasDichMa 
          ? "Hào Thế lâm Dịch Mã: Báo hiệu chuyến đi khởi động nhanh chóng, lịch trình di chuyển rõ ràng." 
          : "Hào Thế không lâm Dịch Mã: Chuyến đi mang tính kế hoạch thông thường, diễn tiến theo đúng dự kiến.";
        const theMoveDesc = `Bản thân đương số ngự Hào ${theHao.position} (${theHao.luc_than}) lâm ${theHao.luc_thu}. ${maDesc}`;

        const h5E = graphData.nodes_state[4].equilibrium_energy;
        const roadDesc = h5E >= 0 
          ? "Hào 5 (Lộ trình đường sá) bình ổn, giao thông thuận lợi." 
          : "Hào 5 có dấu hiệu xung sát hoặc thời tiết biến động, cần chú ý kiểm tra xe cộ, dự phòng tắc đường hoặc trễ giờ.";

        const docDesc = phuHaos.length > 0 
          ? `Hào Phụ Mẫu (phương tiện, vé tàu xe, hộ chiếu/visa): Giấy tờ đi lại hợp lệ (${phuHaos[0].branch} ${phuHaos[0].luc_thu}), nên kiểm tra kỹ hạn sử dụng trước ngày khởi hành.` 
          : "Phụ Mẫu phục tàng: Cần kiểm tra cẩn thận lịch trình bay/tàu xe để tránh nhầm lẫn thời gian.";

        const ungHao = hexData.haos.find(h => h.is_ung) || hexData.haos[3];
        const ungE = graphData.nodes_state[ungHao.position - 1].equilibrium_energy;
        const destDesc = ungE >= 1.0 
          ? "Địa phương nơi đến đón tiếp thuận lợi, môi trường làm việc hoặc lưu trú hòa hợp." 
          : "Nơi đến khí hậu hoặc phong thổ có sự khác biệt, nên mang theo thuốc dự phòng thông dụng.";

        return {
          field_name: "LĨNH VỰC XUẤT HÀNH, DI CHUYỂN, GIAO THÔNG & ĐI XA",
          analysis_blocks: [
            { subtitle: "1. Bản Thân & Động Lực Di Chuyển (Hào Thế & Dịch Mã)", content: theMoveDesc },
            { subtitle: "2. Lộ Trình, Phương Tiện & Thủ Tục Đi Lại (Hào 5 & Hào Phụ Mẫu)", content: `${roadDesc} ${docDesc}` },
            { subtitle: "3. Môi Trường Nơi Đến & Sự An Toàn (Hào Ứng)", content: destDesc }
          ]
        };
      }

      // 11. TÌM NGƯỜI & TÌM VẬT
      if (domainType === "TIM_NGUOI_TIM_VAT") {
        const taiHaos = hexData.haos.filter(h => h.luc_than === "Thê Tài");
        const phuHaos = hexData.haos.filter(h => h.luc_than === "Phụ Mẫu");
        const targetH = taiHaos[0] || phuHaos[0] || hexData.haos[0];
        const pos = targetH.position;
        const branch = targetH.branch;
        const lt = targetH.luc_thu;

        const directionsMap = {
          "Tý": "Chính Bắc (Khảm)", "Sửu": "Đông Bắc (Cấn)", "Dần": "Đông Bắc (Cấn)",
          "Mão": "Chính Đông (Chấn)", "Thìn": "Đông Nam (Tốn)", "Tỵ": "Đông Nam (Tốn)",
          "Ngọ": "Chính Nam (Ly)", "Mùi": "Tây Nam (Khôn)", "Thân": "Tây Nam (Khôn)",
          "Dậu": "Chính Tây (Đoài)", "Tuất": "Tây Bắc (Càn)", "Hợi": "Tây Bắc (Càn)"
        };
        const dirName = directionsMap[branch] || "Trung cung hoặc phương vị quen thuộc";

        const spatialLocMap = {
          "Huyền Vũ": "nơi khuất tối, gần nước, góc nhà hoặc bị vật khác che khuất",
          "Chu Tước": "gần thiết bị phát nhiệt, bàn làm việc, giấy tờ hoặc khu vực có nhiều tiếng ồn",
          "Câu Trần": "trong ngăn kéo, tủ tài liệu cũ hoặc nơi chứa đồ đạc ít khi di chuyển",
          "Đằng Xà": "gần bó dây điện, khe kẹp, gầm giường hoặc nơi bài trí đồ đạc rối mắt",
          "Bạch Hổ": "gần công cụ kim loại, đồ cơ khí, góc tường hoặc khu vực giao thông qua lại",
          "Thanh Long": "trong phòng khách, trên bàn sạch sẽ hoặc nơi bài trí đồ đạc ngăn nắp"
        };
        const spatialLoc = spatialLocMap[lt] || "khu vực thường xuyên lui tới";

        const tNode = graphData.nodes_state[pos - 1];
        let findPrognosis = "";
        if (targetH.is_tuan_khong) findPrognosis = "Dụng Thần lâm Tuần Không: Hiện tại chưa thể tìm ra ngay, cần chờ đến ngày xung không hoặc xuất không mới thấy manh mối.";
        else if (tNode.equilibrium_energy >= 1.0 || targetH.is_moving) findPrognosis = "Dụng Thần vượng khí hoặc phát động: Khả năng tìm lại đồ vật/liên lạc được với người rất cao, vật chưa bị mang đi xa.";
        else findPrognosis = "Dụng Thần suy khí hoặc nhập Mộ: Đồ vật có thể đã bị thất lạc sâu hoặc người cần tìm đang ở nơi kín đáo, cần mở rộng phạm vi tìm kiếm.";

        return {
          field_name: "LĨNH VỰC TÌM NGƯỜI MẤT TÍCH & ĐỒ VẬT THẤT LẠC",
          analysis_blocks: [
            { subtitle: "1. Hiện Trạng & Khả Năng Tìm Thấy (Dụng Thần)", content: `Dụng Thần ngự tại Hào ${pos} (${targetH.luc_than} ${branch}) lâm ${lt}. ${findPrognosis}` },
            { subtitle: "2. Phương Hướng & Địa Điểm Cần Tập Trung Tìm Kiếm", content: `Phương vị trọng tâm: Hướng **${dirName}**. Về đặc điểm nơi chốn: Đồ vật hoặc người có xu hướng nằm ở **${spatialLoc}**.` },
            { subtitle: "3. Hành Động & Thời Điểm Phát Hiện", content: `Khuyến nghị rà soát kỹ các khu vực theo hướng ${dirName}, hỏi thăm người xung quanh tại cung vị Hào ${pos} và kiên nhẫn tìm lại vào các ngày mang Chi ${branch} hoặc xung Hợp với ${branch}.` }
          ]
        };
      }

      // 12. CHIÊM VẬN TỔNG QUAN (MẶC ĐỊNH)
      const theHao = hexData.haos.find(h => h.is_the) || hexData.haos[0];
      const theNode = graphData.nodes_state[theHao.position - 1];
      const theEnergy = theNode.equilibrium_energy;

      const thePhuc = (multiLens.phuc_than_analysis || []).filter(pt => pt.is_under_the);
      const thePhucNote = thePhuc.length > 0 ? ` Dưới Hào Thế có ${thePhuc[0].hidden_meaning}.` : "";

      const ungPhuc = (multiLens.phuc_than_analysis || []).filter(pt => pt.is_under_ung);
      const ungPhucNote = ungPhuc.length > 0 ? ` Dưới Hào Ứng có: ${ungPhuc[0].hidden_meaning}.` : "";

      const theTone = theEnergy >= 2.0 
        ? "Nội lực ổn định, tinh thần tập trung, đủ điều kiện chủ động xử lý các công việc." 
        : (theEnergy >= -1.0 ? "Nội lực ở mức bình hòa, duy trì nhịp độ làm việc ổn định." : "Khí thế đang chịu nhiều áp lực, cần sắp xếp thời gian hợp lý để tránh quá tải.");

      return {
        field_name: "QUÉT TOÀN CẢNH 5 TRỤ CỘT ĐỜI SỐNG (BẢN THÂN - TÀI CHÍNH - CÔNG DANH - TÌNH DUYÊN - SỨC KHỎE)",
        analysis_blocks: [
          { subtitle: "1. Bản Thân & Nội Lực Hiện Tại (Hào Thế)", content: `Hào Thế ngự tại Hào ${theHao.position} (${theHao.luc_than} ${theHao.branch}) lâm ${theHao.luc_thu}. ${theTone}${thePhucNote}` },
          { subtitle: "2. Tài Vận & Khả Năng Tích Lũy (Hào Thê Tài & Tử Tôn)", content: `Thê Tài chủ về nguồn thu và quản lý tài chính: ${l2.tai_status}. Về nguồn sinh tài và cơ hội mở rộng: ${l2.tu_ton_assessment}` },
          { subtitle: "3. Công Việc, Vị Thế & Thủ Tục (Hào Quan Quỷ & Phụ Mẫu)", content: `Quan Quỷ đại diện cho môi trường công tác và trách nhiệm chuyên môn: ${l3.quan_status}. Về quan hệ quản lý và thủ tục hồ sơ: ${l3.superior_relationship} ${l3.document_status}` },
          { subtitle: "4. Tình Cảm & Quan Hệ Đối Ngoại (Hào Thế - Hào Ứng)", content: `Tương quan giữa Bản thân (Thế) và Đối tác / Môi trường ngoài (Ứng): ${l4.the_ung_dynamic} Đặc điểm đối phương: ${l4.partner_personality}.${ungPhucNote}` },
          { subtitle: "5. Thể Trạng Sức Khỏe & Dự Phòng Rủi Ro", content: `Thể trạng chung: ${l5.vitality_status}. Hướng phục hồi: ${l5.treatment_prognosis}` }
        ]
      };
    },

    buildStrategicAdvice(intentEval, timingData, multiLens, hexData) {
      const adviceList = [];
      const uScore = intentEval.total_utility !== undefined ? intentEval.total_utility : 0.0;
      const posTiming = timingData.optimal_positive_timing;
      const negTiming = timingData.critical_risk_timing;

      if (uScore >= 1.5) {
        adviceList.push({
          category: "Tâm thế hành sự: Chủ động triển khai, duy trì kỷ luật",
          content: "Thời vận tương đối thuận lợi. Cần chủ động nắm bắt cơ hội và triển khai công việc theo đúng kế hoạch. Song song đó, duy trì việc kiểm soát chất lượng và quy trình quản trị để bảo đảm kết quả bền vững."
        });
      } else if (uScore >= -0.5) {
        adviceList.push({
          category: "Tâm thế hành sự: Củng cố nội bộ, chờ thời cơ phù hợp",
          content: "Cục diện đang ở trạng thái cân bằng giằng co. Nên giữ ổn định vị trí hiện tại, kiện toàn quy trình nội bộ, tối ưu hóa chi phí và tránh mở rộng quy mô khi chưa đủ điều kiện."
        });
      } else {
        adviceList.push({
          category: "Tâm thế hành sự: Phòng thủ thận trọng, bảo toàn nguồn lực",
          content: "Trường khí bất lợi và tiềm ẩn rủi ro phát sinh. Nên tạm hoãn các quyết định đầu tư lớn hoặc chuyển đổi công việc quan trọng, lập kế hoạch dự phòng và tham vấn kỹ ý kiến chuyên môn."
        });
      }

      adviceList.push({
        category: `Thời điểm thuận lợi để triển khai (Địa Chi ${posTiming.branch})`,
        content: `${posTiming.meaning} Đây là thời điểm tương tác năng lượng đạt trạng thái thuận lợi nhất. Nên bố trí các công việc trọng yếu như ký kết, thương thảo hoặc khởi động vào ngày/tháng mang Địa Chi ${posTiming.branch}.`
      });

      adviceList.push({
        category: `Thời điểm cần thận trọng phòng ngừa (Địa Chi ${negTiming.branch})`,
        content: `${negTiming.meaning} Vào các ngày/tháng mang Địa Chi ${negTiming.branch}, trường năng lượng có xung đột ngược pha. Cần thận trọng trong giao tiếp, hạn chế quyết định vội vàng và đề phòng các chi phí phát sinh.`
      });

      const hw = multiLens.hidden_warnings || [];
      if (hw.length > 0 && !hw[0].includes("không ghi nhận xung sát")) {
        adviceList.push({
          category: "Lưu ý về môi trường & Không gian sống",
          content: `Theo thông tin từ quẻ: '${hw[0]}'. Đương số nên kiểm tra lại khu vực liên quan trong nhà, sắp xếp đồ đạc gọn gàng, chú ý an toàn khi đi lại và theo dõi sức khỏe người lớn tuổi.`
        });
      } else {
        adviceList.push({
          category: "Lưu ý về môi trường & Không gian sống",
          content: "Giữ gìn không gian sinh hoạt thông thoáng, đủ ánh sáng tự nhiên; các khu vực cửa ra vào và bếp cần duy trì sự ngăn nắp, sạch sẽ để tạo môi trường sống thuận lợi."
        });
      }

      return adviceList;
    }
  };

  // =========================================================================
  // 11. MASTER PIPELINE ĐIỀU PHỐI (LUC HAO 2.0 PIPELINE)
  // =========================================================================
  const LucHao2Pipeline = {
    executeFromCoins(coins, dayCan, dayChi, monthChi, question = null) {
      const effectiveQuestion = (question && question.trim()) ? question.trim() : "Chiêm đoán thời vận tổng quan";

      // 1. Lập quẻ hoàn chỉnh
      const hexData = HexagramBuilder.build(coins, dayCan, dayChi, monthChi);

      // 2. Chuyển đổi sang HexagramNode
      const nodesForGraph = hexData.haos.map(h => new HexagramNode(
        h.position,
        `Hào ${h.position}`,
        h.branch,
        h.luc_than,
        h.is_the,
        h.is_ung,
        h.is_moving,
        h.changed_branch
      ));

      // 3. Trọng số mục tiêu
      const intentWeights = MultiObjectiveIntentResolver.resolveIntentWeights(effectiveQuestion);

      // 4. Lan truyền năng lượng đồ thị
      const diffusionEngine = new GraphDiffusionEngine(nodesForGraph, monthChi, dayChi);
      const diffusionResult = diffusionEngine.runDiffusion();
      const equilibriumNodes = diffusionResult.nodes_state;

      // 5. Đánh giá hàm hữu dụng U
      const utilityEval = MultiObjectiveIntentResolver.evaluateUtility(intentWeights, equilibriumNodes);

      // 6. Tính Ứng kỳ Lục Hào cổ truyền (Dã Hạc Thần Khóa)
      const timingEval = HarmonicTimingEngine.calculateResonanceCurve(equilibriumNodes, intentWeights, hexData, monthChi, dayChi);

      // 7. Nhất Quái Đa Đoán Lý Kế Trung
      const multiLensEngine = new NhatQuaiDaDoanEngine(hexData, diffusionResult, utilityEval);
      const multiLensReport = multiLensEngine.analyzeAllDomains();

      // 8. Báo cáo văn xuôi 7 phần
      const metaInfo = {
        algorithm: "Luc Hao 2.0 - Standalone Graph Diffusion & Deep Narrative Synthesis",
        question: effectiveQuestion,
        hexagram_name: hexData.hex_name,
        changed_hexagram_name: hexData.changed_hex_name,
        palace: `Cung ${hexData.palace_name} (${hexData.palace_element})`,
        the_hao: hexData.the_position,
        ung_hao: hexData.ung_position,
        time_meta: hexData.time_meta
      };

      const deepNarrative = DeepNarrativeEngine.synthesize(
        metaInfo,
        hexData,
        utilityEval,
        diffusionResult,
        timingEval,
        multiLensReport
      );

      return {
        meta: metaInfo,
        hexagram_details: hexData,
        intent_utility: utilityEval,
        graph_diffusion: diffusionResult,
        harmonic_timing: timingEval,
        nhat_quai_da_doan: multiLensReport,
        deep_narrative: deepNarrative
      };
    },

    formatFullReport(result) {
      const meta = result.meta;
      const hd = result.hexagram_details;
      const u = result.intent_utility;
      const g = result.graph_diffusion;
      const t = result.harmonic_timing;
      const m = result.nhat_quai_da_doan;
      const dn = result.deep_narrative;
      const tm = meta.time_meta;

      const lines = [];
      lines.push("=".repeat(90));
      lines.push("                         BÁO CÁO DỰ ĐOÁN LỤC HÀO (LỤC HÀO 2.0)");
      lines.push("                Phương pháp: Bát Cung Nạp Giáp & Nhất Quái Đa Đoán (Lý Kế Trung)");
      lines.push("=".repeat(90));
      lines.push(`- Câu hỏi            : "${meta.question}"`);
      lines.push(`- Quẻ Chính          : ${meta.hexagram_name.toUpperCase()} (${meta.palace})`);
      lines.push(`- Quẻ Biến           : ${meta.changed_hexagram_name.toUpperCase()}`);
      lines.push(`- Thời gian gieo quẻ : Ngày ${tm.day_can} ${tm.day_chi}, Tháng ${tm.month_chi} | Tuần Không: [${(tm.tuan_khong || []).join(', ')}]`);
      lines.push("=".repeat(90));

      // I. ĐÁNH GIÁ TỔNG QUAN & KẾT LUẬN CHIÊM ĐOÁN
      lines.push("\n" + "━".repeat(90));
      lines.push("I. ĐÁNH GIÁ TỔNG QUAN & KẾT LUẬN CHIÊM ĐOÁN");
      lines.push("━".repeat(90));
      lines.push(`>>> PHÁN ĐOÁN: [${u.decision}] (Khả năng thành tựu: ${Math.round((u.success_probability || 0.5) * 100)}% • Khí số: ${u.decision === 'ĐẠI CÁT' || u.decision === 'TRUNG CÁT' ? 'Thuận Lợi' : (u.decision === 'TIỂU CÁT' ? 'Bình Ổn' : 'Nhiều Trắc Trở')})`);
      const grad = u.the_vs_ung_gradient || 0.0;
      let viTheStr = "";
      if (grad > 2.0) viTheStr = "Đương số giữ thế chủ động, nắm quyền quyết định";
      else if (grad < -2.0) viTheStr = "Hoàn cảnh bên ngoài hoặc đối phương đang chi phối lấn lướt";
      else viTheStr = "Thế và Ứng cân bằng, đôi bên cùng phối hợp thăm dò";
      lines.push(`>>> VỊ THẾ BÀN QUẺ: ${viTheStr}`);
      lines.push("\n" + dn.section_1_overview);

      const da = dn.direct_answer;
      if (da) {
        lines.push("\n### 1. Trực Diện Trả Lời Câu Hỏi Chiêm Đoán:");
        lines.push(`- **Sự vụ chiêm đoán**: "${meta.question}"`);
        lines.push(`- **Kết luận trực diện**: ${da.direct_verdict}`);
        lines.push(`- **Cơ chế khí số quyết định**: ${da.core_rationale}`);

        lines.push("\n### 2. Định Hướng & Lời Khuyên Hành Động Thiết Thực:");
        lines.push(`- 🎯 **Quyết định then chốt**: ${da.key_action}`);
        lines.push(`- ⏳ **Thời điểm vàng hành động (Ứng kỳ cát)**: ${da.golden_timing}`);
        lines.push(`- ⚠️ **Thời điểm rủi ro cần phòng tránh (Ứng kỳ hung)**: ${da.risk_timing}`);
        lines.push(`- 🛡️ **Biện pháp quản trị rủi ro & Hóa giải**: ${da.remedy_advice}`);
        lines.push(`- 🌿 **Tâm thái xử thế theo Đạo Dịch**: ${da.i_ching_mindset}`);
      }

      // II. ĐỐI CHIẾU KIỂM CHỨNG HIỆN TRẠNG
      lines.push("\n" + "━".repeat(90));
      lines.push("II. ĐỐI CHIẾU KIỂM CHỨNG HIỆN TRẠNG (GROUND-TRUTH VERIFICATION)");
      lines.push("━".repeat(90));
      const vt = dn.section_2_verification || {};
      lines.push(`- **👤 Bản thân & Thể trạng**: ${vt.personal_anchor || ''}\n`);
      lines.push(`- **🏡 Không gian & Gia trạch**: ${vt.spatial_anchor || ''}\n`);
      lines.push(`- **⚡ Biến cố gần đây**: ${vt.recent_past_anchor || ''}`);

      // III. ĐIỂM THUẬN LỢI
      lines.push("\n" + "━".repeat(90));
      lines.push("III. DANH MỤC ĐIỂM SÁNG & THỜI CƠ THUẬN LỢI");
      lines.push("━".repeat(90));
      (dn.section_3_bright_points || []).forEach(bp => {
        lines.push(`- **✨ ${bp.title}**: ${bp.detail}\n`);
      });

      // IV. ĐIỂM BẤT LỢI & RỦI RO
      lines.push("━".repeat(90));
      lines.push("IV. DANH MỤC ĐIỂM CẦN LƯU Ý & RỦI RO TIỀM ẨN");
      lines.push("━".repeat(90));
      (dn.section_4_dark_points || []).forEach(dp => {
        lines.push(`- **⚠️ ${dp.title}**: ${dp.detail}\n`);
      });

      // V. PHÂN TÍCH TRỌNG TÂM
      lines.push("━".repeat(90));
      const dd = dn.section_5_domain_deep_dive || {};
      lines.push(`V. PHÂN TÍCH TRỌNG TÂM: ${dd.field_name || ''}`);
      lines.push("━".repeat(90));
      (dd.analysis_blocks || []).forEach(ab => {
        lines.push(`\n### ${ab.subtitle}`);
        lines.push(`${ab.content}`);
      });

      // VI. LỜI KHUYÊN & ĐỊNH HƯỚNG
      lines.push("\n" + "━".repeat(90));
      lines.push("VI. LỜI KHUYÊN & ĐỊNH HƯỚNG HÀNH ĐỘNG CHIẾN LƯỢC");
      lines.push("━".repeat(90));
      (dn.section_6_strategic_advice || []).forEach(sa => {
        lines.push(`- **🌟 ${sa.category}**: ${sa.content}\n`);
      });

      // VII. BẢNG QUẺ & THÔNG SỐ CHI TIẾT (BÀN QUẺ LỤC HÀO NẠP GIÁP)
      lines.push("━".repeat(90));
      lines.push("VII. BẢNG QUẺ & THÔNG SỐ CHI TIẾT (BÀN QUẺ LỤC HÀO NẠP GIÁP)");
      lines.push("━".repeat(90));
      lines.push(`- **Quẻ Gốc**: ${meta.hexagram_name.toUpperCase()} (Họ ${meta.palace})`);
      lines.push(`- **Quẻ Biến**: ${meta.changed_hexagram_name ? meta.changed_hexagram_name.toUpperCase() : 'BẤT BIẾN (THUẦN TĨNH)'}`);
      lines.push(`- **Nhật Nguyệt Can Chi**: Ngày ${tm.day_can} ${tm.day_chi}, Tháng ${tm.month_chi} | **Tuần Không**: [${(tm.tuan_khong || []).join(', ')}]`);
      lines.push("");
      lines.push("| Hào | Lục Thú | Phục Thần | Quẻ Gốc (Lục Thân & Can Chi) | Vạch Hào | Thế / Ứng | Động Biến | Quẻ Biến (Lục Thân & Can Chi) | Khí Vận Nhật Nguyệt | Thần Sát |");
      lines.push("| :---: | :---: | :---: | :--- | :---: | :---: | :---: | :--- | :--- | :--- |");

      const reversedHaos = [...hd.haos].reverse();
      for (const h of reversedHaos) {
        const pos = h.position;
        const theUng = h.is_the ? "**[THẾ]**" : (h.is_ung ? "**[ỨNG]**" : "-");

        let yaoSymbol = "";
        let yaoDongMark = "Tĩnh";
        if (h.is_moving) {
          if (h.bit === 1) {
            yaoSymbol = "▅▅▅▅▅▅▅";
            yaoDongMark = "○ Động hóa Âm";
          } else {
            yaoSymbol = "▅▅▅  ▅▅▅";
            yaoDongMark = "✕ Động hóa Dương";
          }
        } else {
          yaoSymbol = h.bit === 1 ? "▅▅▅▅▅▅▅" : "▅▅▅  ▅▅▅";
        }

        let bienStr = "-";
        if (h.is_moving) {
          const dyn = h.dynamics;
          const dynTags = [];
          if (dyn) {
            if (dyn.hoi_dau === "HOI_DAU_SINH") dynTags.push("Hồi Đầu Sinh");
            else if (dyn.hoi_dau === "HOI_DAU_KHAC") dynTags.push("Hồi Đầu Khắc");
            if (dyn.tien_thoai === "TIEN_THAN") dynTags.push("Tiến Thần");
            else if (dyn.tien_thoai === "THOAI_THAN") dynTags.push("Thoái Thần");
            if (dyn.hoa_mo) dynTags.push("Hóa Mộ");
            if (dyn.hoa_tuyet) dynTags.push("Hóa Tuyệt");
            if (dyn.hoa_khong) dynTags.push("Hóa Không");
            if (dyn.hoa_pha) dynTags.push("Hóa Phá");
          }
          const dynStr = dynTags.length > 0 ? ` (${dynTags.join(', ')})` : "";
          bienStr = `${h.changed_luc_than} ${h.changed_branch}${dynStr}`;
        }

        let phucStr = "-";
        const ptMatch = (m.phuc_than_analysis || []).find(p => p.position === pos);
        if (ptMatch) {
          phucStr = `${ptMatch.missing_luc_than} ${ptMatch.phi_branch}`;
        }

        const statusFlags = [];
        if (h.is_tuan_khong) statusFlags.push("Tuần Không");
        if (h.is_nguyet_pha) statusFlags.push("Nguyệt Phá");
        if (h.is_am_dong) statusFlags.push("Ám Động");

        const nodeState = g.nodes_state[pos - 1];
        const eVal = nodeState ? nodeState.equilibrium_energy : 0;
        let khiThe = "";
        if (eVal >= 4.0) khiThe = "Vượng Tướng";
        else if (eVal >= 1.5) khiThe = "Đắc Sinh";
        else if (eVal >= -1.5) khiThe = "Bình Hòa";
        else if (eVal >= -4.0) khiThe = "Hưu Tù";
        else khiThe = "Bị Khắc";

        if (statusFlags.length > 0) {
          khiThe += ` (${statusFlags.join(', ')})`;
        }

        const starsList = h.stars || [];
        const starsStr = starsList.length > 0 ? starsList.join(', ') : "-";

        lines.push(`| Hào ${pos} | ${h.luc_thu} | ${phucStr} | ${h.luc_than} ${h.can}-${h.branch} (${h.element}) | \`${yaoSymbol}\` | ${theUng} | ${yaoDongMark} | ${bienStr} | ${khiThe} | ${starsStr} |`);
      }
      lines.push("");

      // Thông tin Phục Thần
      const actionablePhuc = m.phuc_than_analysis || [];
      if (actionablePhuc.length > 0) {
        lines.push("\n▶ THÔNG TIN PHỤC THẦN BÁT CUNG (XÉT TẠI CÁC CUNG TRỌNG YẾU):");
        for (const pt of actionablePhuc) {
          lines.push(`  • Phục Thần [${pt.missing_luc_than}] phục dưới Hào ${pt.position} (Phi Thần ${pt.phi_luc_than} ${pt.phi_branch}):`);
          lines.push(`    - Tương tác: ${pt.phi_phuc_relation}`);
          lines.push(`    - Khả năng xuất hiện: ${pt.emerge_analysis}`);
          if (pt.hidden_meaning) lines.push(`    - Ý nghĩa thực tiễn: ${pt.hidden_meaning}`);
        }
      }

      // Cảnh báo Radar
      const hw = m.hidden_warnings || [];
      if (hw.length > 0) {
        lines.push("\n▶ CẢNH BÁO NGUY CƠ TIỀM ẨN NGOÀI CÂU HỎI (HIDDEN HAZARD RADAR):");
        for (const w of hw) {
          lines.push(`  • ${w}`);
        }
      }

      lines.push("\n" + "=".repeat(90));
      lines.push("                          [HẾT BÁO CÁO DỰ ĐOÁN LỤC HÀO 2.0]");
      lines.push("=".repeat(90));

      return lines.join('\n');
    }
  };

  // =========================================================================
  // 12. TƯƠNG THÍCH NGƯỢC (BACKWARD COMPATIBILITY BRIDGE)
  // =========================================================================
  const TOPIC_PRESETS = [
    { key: "cautai", label: "Cầu Tài / Kinh Doanh", dungThan: "Thê Tài" },
    { key: "congdanh", label: "Công Danh / Sự Nghiệp", dungThan: "Quan Quỷ" },
    { key: "tinhduyen", label: "Tình Duyên / Hôn Nhân", dungThan: "Thê Tài / Quan Quỷ" },
    { key: "suckhoe", label: "Sức Khỏe / Bệnh Tật", dungThan: "Tử Tôn / Hào Thế" },
    { key: "nhadat", label: "Bất Động Sản / Nhà Đất", dungThan: "Phụ Mẫu" },
    { key: "thicu", label: "Thi Cử / Học Vấn", dungThan: "Phụ Mẫu" },
    { key: "xuatquoc", label: "Xuất Hành / Di Chuyển", dungThan: "Hào Thế / Dịch Mã" },
    { key: "phaply", label: "Pháp Lý / Kiện Tụng", dungThan: "Quan Quỷ" },
    { key: "thaisan", label: "Thai Sản / Sinh Nở", dungThan: "Tử Tôn" },
    { key: "timdo", label: "Tìm Người / Tìm Vật", dungThan: "Thê Tài / Phụ Mẫu" },
    { key: "tongquan", label: "Chiêm Vận Toàn Cảnh", dungThan: "Hào Thế" }
  ];

  /**
   * Cầu nối tương thích ngược 100% với các hàm gọi cũ từ dichhoc_view.js
   */
  function evaluate8Steps(hexResult, topicKey, customQuestion) {
    if (!hexResult) return null;

    // Chuyển đổi dữ liệu hexResult từ dichhoc_engine.js sang định dạng LucHao2Pipeline
    let coins = [];
    if (Array.isArray(hexResult)) {
      coins = hexResult;
    } else if (hexResult.coins && Array.isArray(hexResult.coins) && hexResult.coins.length > 0) {
      coins = hexResult.coins;
    } else {
      const haosList = hexResult.haos || (hexResult.que_goc ? hexResult.que_goc.haos : []);
      coins = haosList.map(h => {
        if (h.isDong) return h.bit === 1 ? 9 : 6;
        return h.bit === 1 ? 7 : 8;
      });
    }
    while (coins.length < 6) coins.push(7);

    const canChi = hexResult.thoi_gian?.canChi || hexResult.canChi || {};
    const dayCan = canChi.dayGan || (canChi.day ? canChi.day.split(' ')[0] : 'Giáp');
    const dayChi = canChi.dayZhi || (canChi.day ? canChi.day.split(' ')[1] : 'Tý');
    const monthChi = canChi.monthZhi || (canChi.month ? canChi.month.split(' ')[1] : 'Dần');

    const question = customQuestion || (TOPIC_PRESETS.find(t => t.key === topicKey)?.label || "");

    const pipelineResult = LucHao2Pipeline.executeFromCoins(coins, dayCan, dayChi, monthChi, question);
    const reportText = LucHao2Pipeline.formatFullReport(pipelineResult);

    return {
      pipelineResult,
      reportText,
      topic: { key: topicKey, label: question },
      judgment: {
        judgment: pipelineResult.intent_utility.decision,
        isSuccess: pipelineResult.intent_utility.success_probability >= 0.6,
        totalScore: Math.round(pipelineResult.intent_utility.total_utility * 10)
      },
      dungThan: {
        hao: pipelineResult.hexagram_details.haos[pipelineResult.hexagram_details.the_position - 1],
        isPhuc: false,
        pos: pipelineResult.hexagram_details.the_position
      },
      theHao: pipelineResult.hexagram_details.haos[pipelineResult.hexagram_details.the_position - 1],
      ungHao: pipelineResult.hexagram_details.haos[pipelineResult.hexagram_details.ung_position - 1],
      tuThan: {
        nguyenThan: { name: "Tử Tôn", haos: [] },
        kyThan: { name: "Huynh Đệ", haos: [] }
      },
      theDung: {
        status: pipelineResult.intent_utility.decision,
        desc: pipelineResult.nhat_quai_da_doan.lens_1_primary_intent.summary
      },
      dongEffects: (hexResult.haos || []).filter(h => h.isDong).map(h => `Hào ${h.pos} phát động chuyển hóa khí số`),
      ungKy: [
        pipelineResult.harmonic_timing.optimal_positive_timing.meaning,
        pipelineResult.harmonic_timing.critical_risk_timing.meaning
      ],
      fengshui: pipelineResult.nhat_quai_da_doan.lens_6_spatial_fengshui.spatial_issues.map((issue, idx) => ({
        pos: idx + 1,
        area: `Hào ${idx + 1}`,
        issue,
        risk: "Cần lưu ý"
      })),
      haosEnriched: pipelineResult.hexagram_details.haos.map(h => ({
        canLuc: {
          score: Math.round(h.energy * 10) / 10,
          status: h.spectrum,
          notes: h.stars || []
        }
      }))
    };
  }

  function generateDeterministicReport(evalData, hexResult) {
    if (evalData && evalData.reportText) return evalData.reportText;
    if (evalData && evalData.pipelineResult) return LucHao2Pipeline.formatFullReport(evalData.pipelineResult);
    return "Không có dữ liệu luận giải.";
  }

  function createGroundTruthFactSheet(evalData, hexResult) {
    if (!evalData || !evalData.pipelineResult) return {};
    const res = evalData.pipelineResult;
    return {
      hexName: res.meta.hexagram_name,
      changedName: res.meta.changed_hexagram_name,
      palace: res.meta.palace,
      decision: res.intent_utility.decision,
      verification: res.deep_narrative.section_2_verification,
      timing: res.harmonic_timing
    };
  }

  function splitLucHaoReportIntoChunks(reportText) {
    if (!reportText) return [];

    // Tìm vị trí bắt đầu của Mục V (6 Lăng Kính Nhất Quái Đa Đoán)
    const match = reportText.match(/(?:\n[━=]+\n|\n##\s+|\n)V\.\s+/i);
    if (match && match.index !== undefined) {
      const idxV = match.index;
      const part1 = reportText.substring(0, idxV).trim();
      const part2 = reportText.substring(idxV).trim();
      return [
        {
          title: "Phần 1/2: Tổng Quan Khí Số, Kiểm Chứng Hiện Trạng & Nguy Cơ",
          content: part1
        },
        {
          title: "Phần 2/2: 6 Lăng Kính Nhất Quái Đa Đoán, Ứng Kỳ & Bảng Kỹ Thuật",
          content: part2
        }
      ];
    }

    return [
      {
        title: "Toàn Văn Luận Giải Lục Hào 2.0",
        content: reportText
      }
    ];
  }

  async function interpretHexagram(hexResult, options = {}) {
    const evalData = evaluate8Steps(hexResult, options.topicKey, options.customQuestion);
    const deterministicText = generateDeterministicReport(evalData, hexResult);
    const factSheet = createGroundTruthFactSheet(evalData, hexResult);

    if (!options.useAI) {
      return {
        source: 'deterministic',
        verified: true,
        aiUsed: false,
        reportText: deterministicText,
        evaluation: evalData,
        factSheet
      };
    }

    // Kiểm tra tính sẵn sàng của Gemini Service dùng chung
    const geminiService = global.NetaGeminiService;
    if (!geminiService) {
      return {
        source: 'offline_fallback',
        verified: true,
        aiUsed: false,
        warning: 'Dịch vụ Gemini AI chưa sẵn sàng trên trình duyệt. Đã hiển thị bản luận giải tiêu chuẩn offline.',
        reportText: deterministicText,
        evaluation: evalData,
        factSheet
      };
    }

    const apiKey = (options && options.apiKey) || (typeof geminiService.getActiveKey === 'function' ? geminiService.getActiveKey() : null);
    if (!apiKey) {
      return {
        source: 'offline_fallback',
        verified: true,
        aiUsed: false,
        warning: 'Chưa cài đặt Google Gemini API Key. Bạn có thể cài đặt khóa dùng chung tại mục Cài Đặt hoặc trong Trải Bài Tarot để sử dụng cho toàn bộ ứng dụng.',
        reportText: deterministicText,
        evaluation: evalData,
        factSheet
      };
    }

    try {
      const chunks = splitLucHaoReportIntoChunks(deterministicText);
      let polished = '';

      if (typeof geminiService.polishReportInChunks === 'function' && chunks.length > 1) {
        polished = await geminiService.polishReportInChunks(chunks, {
          onProgress: options.onProgress,
          temperature: 0.3,
          maxOutputTokens: 8192
        });
      } else if (typeof geminiService.polishReport === 'function') {
        if (typeof options.onProgress === 'function') {
          options.onProgress(1, 1, "Toàn Văn Luận Giải Lục Hào 2.0");
        }
        const prompt = [
          "BẠN LÀ TỔNG BIÊN TẬP HỌC THUẬT DỊCH HỌC KHOA HỌC CAO CẤP.",
          "NHIỆM VỤ: TRAU CHUỐT VĂN PHONG CHO BÁO CÁO LỤC HÀO 2.0 DƯỚI ĐÂY.",
          "",
          "[QUY TẮC BẮT BUỘC - BẢO TOÀN DỮ LIỆU GỐC 100%]:",
          "1. TUYỆT ĐỐI BẢO TOÀN TOÀN BỘ CẤU TRÚC 7 PHẦN (I. ĐÁNH GIÁ TỔNG QUAN, II. ĐỐI CHIẾU KIỂM CHỨNG HIỆN TRẠNG, III. ĐIỂM THUẬN LỢI, IV. ĐIỂM BẤT LỢI & RỦI RO, V. PHÂN TÍCH TRỌNG TÂM, VI. LỜI KHUYÊN & ĐỊNH HƯỚNG, VII. BẢNG QUẺ & THÔNG SỐ CHI TIẾT).",
          "2. TUYỆT ĐỐI GIỮ NGUYÊN TÊN QUẺ, HÀO THẾ, HÀO ỨNG, ĐỊA CHI, DỤNG THẦN, THỜI ĐIỂM ỨNG KỲ VÀ CÁC MỎ NEO NGHIỆM CHỨNG HIỆN TRẠNG.",
          "3. TUYỆT ĐỐI KHÔNG VẼ KHUNG ASCII (+---+), KHÔNG DÙNG KÝ HIỆU VẼ BẢNG THÔ SƠ. Sử dụng Markdown chuẩn mực (| Cột 1 | Cột 2 |).",
          "4. Văn phong uyên bác, trang nhã, khách quan, định lượng, không mê tín, không dùng từ ngữ thổi phồng.",
          "",
          "--- BẢN BÁO CÁO GỐC CẦN BIÊN TẬP ---",
          deterministicText,
          "--- HẾT BẢN BÁO CÁO GỐC ---",
          "",
          "Hãy xuất bản toàn văn bản luận giải đã được trau chuốt hoàn chỉnh ngay dưới đây:"
        ].join('\n');

        polished = await geminiService.polishReport(prompt, {
          temperature: 0.3,
          maxOutputTokens: 8192
        });
      }

      return {
        source: 'gemini_ai',
        verified: true,
        aiUsed: true,
        reportText: polished || deterministicText,
        evaluation: evalData,
        factSheet
      };
    } catch (err) {
      console.warn('Lỗi gọi Gemini AI, tự động chuyển về bản Offline:', err);
      return {
        source: 'offline_fallback',
        verified: true,
        aiUsed: false,
        warning: `Kết nối AI tạm gián đoạn (${err.message || 'Lỗi mạng'}). Đã hiển thị bản luận giải tiêu chuẩn offline.`,
        reportText: deterministicText,
        evaluation: evalData,
        factSheet
      };
    }
  }

  // =========================================================================
  // 13. EXPORT MODULE RA GLOBAL
  // =========================================================================
  const NetaLucHao2Engine = {
    // Pipeline & Sub-engines
    LucHao2Pipeline,
    HexagramBuilder,
    EnergyMatrixBuilder,
    GraphDiffusionEngine,
    MultiObjectiveIntentResolver,
    HarmonicTimingEngine,
    LiJiZhongKnowledge,
    NhatQuaiDaDoanEngine,
    GroundTruthVerificationEngine,
    DeepNarrativeEngine,
    AdvancedDichRules,
    FiveElementsEnergy,

    // High-level API
    executeFromCoins: LucHao2Pipeline.executeFromCoins.bind(LucHao2Pipeline),
    formatFullReport: LucHao2Pipeline.formatFullReport.bind(LucHao2Pipeline),

    // Backward Compatibility API for existing code
    TOPIC_PRESETS,
    evaluate8Steps,
    generateDeterministicReport,
    createGroundTruthFactSheet,
    interpretHexagram
  };

  global.NetaLucHao2Engine = NetaLucHao2Engine;
  // Gán đè vào NetaLucHaoInterpreter để nâng cấp lập tức toàn bộ hệ thống
  global.NetaLucHaoInterpreter = NetaLucHao2Engine;

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
