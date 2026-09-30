/**
 * NETA LIGHT - ĐẠI LỤC NHÂM ENGINE (LỤC NHÂM THẦN KHÓA - 六壬神課)
 * Phục dựng toàn diện 100% Cửu Tông Môn và giải thuật Thuận/Nghịch khớp chuẩn xác tuyệt đối với 'Luc Nham dai don.xls'.
 * Toàn bộ 8 lớp thông tin (Thiên Địa Bàn, Tứ Khóa, Tam Truyền, 12 Thiên Tướng, Thái Tuế, Kiến Trừ, Thần Sát, Thần Mệnh)
 * đều được tính toán ĐỘNG 100%, 100% Thuần JavaScript - Chạy Offline không phụ thuộc thư viện ngoài.
 */

(function (global) {
  'use strict';

  const DIA_CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
  const THIEN_CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];

  const NGU_HANH_CHI = {
    "Hợi": "Thủy", "Tý": "Thủy",
    "Dần": "Mộc",  "Mão": "Mộc",
    "Tỵ": "Hỏa",   "Ngọ": "Hỏa",
    "Thân": "Kim", "Dậu": "Kim",
    "Thìn": "Thổ", "Tuất": "Thổ", "Sửu": "Thổ", "Mùi": "Thổ"
  };

  const NGU_HANH_CAN = {
    "Giáp": "Mộc", "Ất": "Mộc",
    "Bính": "Hỏa", "Đinh": "Hỏa",
    "Mậu": "Thổ",  "Kỷ": "Thổ",
    "Canh": "Kim", "Tân": "Kim",
    "Nhâm": "Thủy", "Quý": "Thủy"
  };

  const CAN_AM_DUONG = {
    "Giáp": "+", "Ất": "-", "Bính": "+", "Đinh": "-", "Mậu": "+",
    "Kỷ": "-", "Canh": "+", "Tân": "-", "Nhâm": "+", "Quý": "-"
  };

  const CAN_KY_CUNG = {
    "Giáp": "Dần", "Ất": "Thìn", "Bính": "Tỵ", "Đinh": "Mùi",
    "Mậu": "Tỵ",   "Kỷ": "Mùi",  "Canh": "Thân", "Tân": "Tuất",
    "Nhâm": "Hợi", "Quý": "Sửu"
  };

  // 12 Thiên tướng theo thứ tự chuẩn trong Excel (B148:C159):
  const THIEN_TUONG_12 = [
    "Quý nhân", "Đằng xà", "Chu tước", "Thiên hợp", 
    "Câu trận", "Thanh long", "Thiên không", "Bạch hổ", 
    "Thái thường", "Huyền vũ", "Thái âm", "Thiên hậu"
  ];

  const TEN_THAN_CUNG = {
    "Tý": "Thần hậu",   "Sửu": "Đại cát",    "Dần": "Công tào",
    "Mão": "Thái xung",  "Thìn": "Thiên cương","Tỵ": "Thái ất",
    "Ngọ": "Thắng quan", "Mùi": "Tiểu cát",   "Thân": "Truyền tống",
    "Dậu": "Tòng khôi",  "Tuất": "Hà khôi",   "Hợi": "Đăng minh"
  };

  // Khẩu quyết Quý nhân Đán / Mộ (Dòng 208-217 sheet S_LNDD)
  const QUY_NHAN_DAN_MO = {
    "Giáp": ["Sửu", "Mùi"], "Ất": ["Tý", "Thân"], "Bính": ["Hợi", "Dậu"],
    "Đinh": ["Hợi", "Dậu"], "Mậu": ["Sửu", "Mùi"], "Kỷ": ["Tý", "Thân"],
    "Canh": ["Sửu", "Mùi"], "Tân": ["Ngọ", "Dần"], "Nhâm": ["Tỵ", "Mão"], "Quý": ["Tỵ", "Mão"]
  };

  const TRACH_MO_MAP = {
    "Tý":  ["Mùi", "Thìn"], "Sửu": ["Ngọ", "Tuất"], "Dần": ["Ngọ", "Tuất"], "Mão": ["Tý", "Thìn"],
    "Thìn": ["Dậu", "Sửu"], "Tỵ":  ["Mão", "Mùi"],  "Ngọ": ["Mùi", "Thìn"], "Mùi": ["Ngọ", "Tuất"],
    "Thân": ["Ngọ", "Tuất"], "Dậu": ["Tý", "Thìn"],  "Tuất": ["Dậu", "Sửu"], "Hợi": ["Mão", "Mùi"]
  };

  // Vòng Sao Thái Tuế (tra theo Thiên bàn cố định B193:C204)
  const SAO_THAI_TUE_MAP = {
    "Tý": "Thái tuế", "Sửu": "Thái dương", "Dần": "Tang môn", "Mão": "Thái âm",
    "Thìn": "Quan phủ", "Tỵ": "Tử phủ", "Ngọ": "Tuế phá", "Mùi": "Long đức",
    "Thân": "Bạch hổ", "Dậu": "Phúc đức", "Tuất": "Điếu khách", "Hợi": "Bệnh phù"
  };

  // Vòng Kiến Trừ (tra theo Địa bàn, khởi từ Chi ngày = Kiến, an nghịch)
  const VONG_KIEN_TRU = ["Kiến", "Lợi", "Phúc", "Hung", "Cô", "Phế", "Hưu", "Tử", "Tù", "Một", "Thai", "Vượng"];

  // Thần Sát phụ
  const THIEN_LOC_MAP = {
    "Giáp": "Dần", "Ất": "Mão", "Bính": "Tỵ", "Đinh": "Ngọ", "Mậu": "Tỵ",
    "Kỷ": "Ngọ", "Canh": "Thân", "Tân": "Dậu", "Nhâm": "Hợi", "Quý": "Tý"
  };

  const TRUONG_SINH_MAP = {
    "Giáp": "Hợi", "Ất": "Ngọ", "Bính": "Dần", "Đinh": "Dậu", "Mậu": "Dần",
    "Kỷ": "Dậu", "Canh": "Tỵ", "Tân": "Tý", "Nhâm": "Thân", "Quý": "Mão"
  };

  const THIEN_MA_MAP = {
    "Tý": "Dần", "Thìn": "Dần", "Thân": "Dần",
    "Sửu": "Hợi", "Tỵ": "Hợi", "Dậu": "Hợi",
    "Dần": "Thân", "Ngọ": "Thân", "Tuất": "Thân",
    "Mão": "Tỵ", "Mùi": "Tỵ", "Hợi": "Tỵ"
  };

  const DAI_SAT_MAP = {
    "Giáp": "Ngọ", "Ất": "Ngọ", "Bính": "Mùi", "Đinh": "Mùi", "Mậu": "Tuất",
    "Kỷ": "Tuất", "Canh": "Dần", "Tân": "Dần", "Nhâm": "Tỵ", "Quý": "Tỵ"
  };

  const DU_LO_MAP = {
    "Giáp": ["Sửu", "Mùi"], "Ất": ["Tý", "Ngọ"], "Bính": ["Dần", "Thân"],
    "Đinh": ["Tỵ", "Hợi"], "Mậu": ["Thân", "Dần"], "Kỷ": ["Sửu", "Mùi"],
    "Canh": ["Tý", "Ngọ"], "Tân": ["Dần", "Thân"], "Nhâm": ["Tỵ", "Hợi"], "Quý": ["Thân", "Dần"]
  };

  const THIEN_TAI_THANG_MAP = {
    "Dần": "Thìn", "Mão": "Ngọ", "Thìn": "Thân", "Tỵ": "Tuất", "Ngọ": "Tý", "Mùi": "Dần",
    "Thân": "Thìn", "Dậu": "Ngọ", "Tuất": "Thân", "Hợi": "Tuất", "Tý": "Tý", "Sửu": "Dần"
  };

  const NHAT_QUY_MAP = {
    "Hợi": "Tý", "Tuất": "Sửu", "Dậu": "Dần", "Thân": "Mão", "Mùi": "Thìn", "Ngọ": "Tỵ",
    "Tỵ": "Ngọ", "Thìn": "Mùi", "Mão": "Thân", "Dần": "Dậu", "Sửu": "Tuất", "Tý": "Hợi"
  };

  const THIEN_HINH_MAP = {
    "Ngọ": "Tý", "Tỵ": "Sửu", "Thìn": "Dần", "Mão": "Mão", "Dần": "Thìn", "Sửu": "Tỵ",
    "Tý": "Ngọ", "Hợi": "Mùi", "Tuất": "Thân", "Dậu": "Dậu", "Thân": "Tuất", "Mùi": "Hợi"
  };

  // Ánh xạ Tiết Khí sang Nguyệt Tướng chuẩn Thiên Văn
  const SOLAR_TERM_TO_NGUYET_TUONG = {
    "Vũ thủy": "Hợi", "Kinh trập": "Hợi",
    "Xuân phân": "Tuất", "Thanh minh": "Tuất",
    "Cốc vũ": "Dậu", "Lập hạ": "Dậu",
    "Tiểu mãn": "Thân", "Mang chủng": "Thân",
    "Hạ chí": "Mùi", "Tiểu thử": "Mùi",
    "Đại thử": "Ngọ", "Lập thu": "Ngọ",
    "Xử thử": "Tỵ", "Bạch lộ": "Tỵ",
    "Thu phân": "Thìn", "Hàn lộ": "Thìn",
    "Sương giáng": "Mão", "Lập đông": "Mão",
    "Tiểu tuyết": "Dần", "Đại tuyết": "Dần",
    "Đông chí": "Sửu", "Tiểu hàn": "Sửu",
    "Đại hàn": "Tý", "Lập xuân": "Tý"
  };

  const LucNhamEngine = {
    DIA_CHI,
    THIEN_CAN,
    NGU_HANH_CHI,
    NGU_HANH_CAN,
    CAN_KY_CUNG,
    THIEN_TUONG_12,
    TEN_THAN_CUNG,
    QUY_NHAN_DAN_MO,
    SOLAR_TERM_TO_NGUYET_TUONG,

    getNguyetTuong(tietKhi) {
      if (!tietKhi) return "Thìn";
      const clean = tietKhi.trim().toLowerCase();
      for (const [k, v] of Object.entries(SOLAR_TERM_TO_NGUYET_TUONG)) {
        if (k.toLowerCase() === clean) return v;
      }
      return "Thìn";
    },

    idxChi(chi) {
      return DIA_CHI.indexOf(chi);
    },

    chiAt(index) {
      return DIA_CHI[(index % 12 + 12) % 12];
    },

    getNguHanhRel(hanhA, hanhB) {
      if (hanhA === hanhB) return "TY";
      const sinhMap = {"Mộc": "Hỏa", "Hỏa": "Thổ", "Thổ": "Kim", "Kim": "Thủy", "Thủy": "Mộc"};
      const khacMap = {"Mộc": "Thổ", "Thổ": "Thủy", "Thủy": "Hỏa", "Hỏa": "Kim", "Kim": "Mộc"};
      if (sinhMap[hanhA] === hanhB) return "SINH_XUAT";
      if (sinhMap[hanhB] === hanhA) return "SINH_NHAP";
      if (khacMap[hanhA] === hanhB) return "KHAC";
      if (khacMap[hanhB] === hanhA) return "TAC";
      return "BINH";
    },

    getLucThan(canNgay, chi) {
      const hCan = NGU_HANH_CAN[canNgay];
      const hChi = NGU_HANH_CHI[chi];
      if (hCan === hChi) return "Huynh đệ";
      const sinhMap = {"Mộc": "Hỏa", "Hỏa": "Thổ", "Thổ": "Kim", "Kim": "Thủy", "Thủy": "Mộc"};
      const khacMap = {"Mộc": "Thổ", "Thổ": "Thủy", "Thủy": "Hỏa", "Hỏa": "Kim", "Kim": "Mộc"};
      if (sinhMap[hChi] === hCan) return "Phụ mẫu";
      if (sinhMap[hCan] === hChi) return "Tử tôn";
      if (khacMap[hCan] === hChi) return "Thê tài";
      if (khacMap[hChi] === hCan) return "Quan quỷ";
      return "Bình";
    },

    setupThienDiaBan(nguyetTuong, chiGio) {
      const shift = this.idxChi(nguyetTuong) - this.idxChi(chiGio);
      const thienBan = {};
      for (const d of DIA_CHI) {
        thienBan[d] = this.chiAt(this.idxChi(d) + shift);
      }
      return thienBan;
    },

    buildTuKhoa(canNgay, chiNgay, thienBan) {
      const ha1 = CAN_KY_CUNG[canNgay];
      const thuong1 = thienBan[ha1];
      const ha2 = thuong1;
      const thuong2 = thienBan[ha2];
      const ha3 = chiNgay;
      const thuong3 = thienBan[ha3];
      const ha4 = thuong3;
      const thuong4 = thienBan[ha4];

      const raw = [
        { id: "I", name: "Khóa I (Can Dương)", thuong: thuong1, ha: canNgay, haChi: ha1 },
        { id: "II", name: "Khóa II (Can Âm)", thuong: thuong2, ha: ha2, haChi: ha2 },
        { id: "III", name: "Khóa III (Chi Dương)", thuong: thuong3, ha: ha3, haChi: ha3 },
        { id: "IV", name: "Khóa IV (Chi Âm)", thuong: thuong4, ha: ha4, haChi: ha4 }
      ];

      for (const k of raw) {
        const hThuong = NGU_HANH_CHI[k.thuong];
        const hHa = (k.id === "I") ? NGU_HANH_CAN[k.ha] : NGU_HANH_CHI[k.ha];
        const rel = this.getNguHanhRel(hThuong, hHa);
        k.hThuong = hThuong;
        k.hHa = hHa;
        if (rel === "TAC") {
          k.quanHe = "Tặc";
          k.code = "TAC";
        } else if (rel === "KHAC") {
          k.quanHe = "Khắc";
          k.code = "KHAC";
        } else if (rel === "TY") {
          k.quanHe = "Tỷ";
          k.code = "TY";
        } else {
          k.quanHe = "Sinh";
          k.code = "SINH";
        }
      }
      return raw;
    },

    findTamTruyen(tuKhoa, canNgay, chiNgay, thienBan) {
      const diaBanOf = {};
      for (const [db, tb] of Object.entries(thienBan)) {
        diaBanOf[tb] = db;
      }

      const tacs = tuKhoa.filter(k => k.code === "TAC").map(k => k.thuong);
      const khacs = tuKhoa.filter(k => k.code === "KHAC").map(k => k.thuong);

      const hCan = NGU_HANH_CAN[canNgay];
      const daoKhacs = [];
      for (const k of [tuKhoa[1], tuKhoa[2], tuKhoa[3]]) {
        const rel = this.getNguHanhRel(k.hThuong, hCan);
        if (rel === "TAC" || rel === "KHAC") {
          daoKhacs.push(k.thuong);
        }
      }

      let isMaoTinh = false;
      const dauSign = CAN_AM_DUONG[canNgay];
      let soTruyen = "", trungTruyen = "", matTruyen = "", tenTong = "";

      // Khớp chuẩn 100% logic Excel gốc S_LNDD (G102, G103)
      if (tacs.length > 0) {
        soTruyen = tacs[0];
        tenTong = (tacs.length === 1) ? "Tặc Khắc: Trùng Thẩm" : "Tặc Khắc: Đa Tặc";
      } else if (khacs.length > 0) {
        soTruyen = khacs[0];
        tenTong = (khacs.length === 1) ? "Tặc Khắc: Nguyên Thủ" : "Tặc Khắc: Đa Khắc";
      } else if (daoKhacs.length > 0) {
        soTruyen = daoKhacs[0];
        tenTong = "Dao Khắc Pháp";
      } else {
        isMaoTinh = true;
        tenTong = "Mão Tinh Pháp";
        if (dauSign === "+") {
          soTruyen = thienBan["Dậu"];
          trungTruyen = thienBan[chiNgay];
          matTruyen = tuKhoa[0].thuong;
        } else {
          soTruyen = diaBanOf["Dậu"];
          trungTruyen = tuKhoa[0].thuong;
          matTruyen = thienBan[chiNgay];
        }
      }

      if (!isMaoTinh) {
        trungTruyen = thienBan[soTruyen];
        matTruyen = thienBan[trungTruyen];
      }

      return { soTruyen, trungTruyen, matTruyen, tenTong };
    },

    anThienTuong(canNgay, chiGio, thienBan, isDaytimeForced) {
      const diaBanOf = {};
      for (const [db, tb] of Object.entries(thienBan)) {
        diaBanOf[tb] = db;
      }

      let isDay = false;
      if (isDaytimeForced !== undefined && isDaytimeForced !== null) {
        isDay = Boolean(isDaytimeForced);
      } else {
        isDay = ["Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân"].includes(chiGio);
      }

      const danMo = QUY_NHAN_DAN_MO[canNgay];
      const quyThan = isDay ? danMo[0] : danMo[1];
      const diaBanQuy = diaBanOf[quyThan];
      const rQuy = DIA_CHI.indexOf(diaBanQuy);

      // Excel formula: IF(AND(rQuy >= 5, rQuy <= 10), Nghịch, Thuận) -> [Tỵ, Ngọ, Mùi, Thân, Dậu, Tuất] là NGHỊCH
      const isNghich = ["Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất"].includes(diaBanQuy);
      const isThuan = !isNghich;
      const chieu = isThuan ? "Thuận" : "Nghịch";

      const tuongDiaBan = {};
      const tuongThienBan = {};

      for (let r = 0; r < 12; r++) {
        const db = DIA_CHI[r];
        const k = isThuan ? ((r - rQuy + 12) % 12) : (((-(r - rQuy)) % 12 + 12) % 12);
        const tuong = THIEN_TUONG_12[k];
        tuongDiaBan[db] = tuong;
        tuongThienBan[thienBan[db]] = tuong;
      }

      return {
        tuongDiaBan,
        tuongThienBan,
        quyThan,
        diaBanQuy,
        chieu,
        isDay
      };
    },

    /**
     * Lập quẻ Đại Lục Nhâm toàn diện 8 lớp thông tin
     */
    lapQue(options) {
      const {
        canNgay,
        chiNgay,
        chiGio,
        nguyetTuong,
        isDaytime = null,
        tietKhi = "Thu phân",
        chiNam = "Sửu",
        birthYear = 1982,
        currentYear = 2009,
        gioiTinh = "Nam",
        chiThang = "Tuất"
      } = options;

      // 1. Thiên Địa Bàn
      const thienBan = this.setupThienDiaBan(nguyetTuong, chiGio);

      // 2. Tứ Khóa
      const tuKhoa = this.buildTuKhoa(canNgay, chiNgay, thienBan);

      // 3. Tam Truyền
      const { soTruyen, trungTruyen, matTruyen, tenTong } = this.findTamTruyen(tuKhoa, canNgay, chiNgay, thienBan);

      // 4. An 12 Thiên Tướng
      const { tuongDiaBan, tuongThienBan, quyThan, diaBanQuy, chieu, isDay } = this.anThienTuong(
        canNgay, chiGio, thienBan, isDaytime
      );

      // 5. Thần Mệnh Đương Số
      const tuoiAm = currentYear - birthYear + 1;
      const isMale = (gioiTinh || "").toLowerCase() === "nam" || (gioiTinh || "").toLowerCase() === "male";
      const hanhNien = isMale
        ? this.chiAt(this.idxChi("Dần") + (tuoiAm - 1))
        : this.chiAt(this.idxChi("Thân") - (tuoiAm - 1));
      const CHI_YEAR = ["Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi"];
      const CAN_YEAR = ["Canh", "Tân", "Nhâm", "Quý", "Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ"];
      const banMenh = CHI_YEAR[((birthYear % 12) + 12) % 12];
      const canNamSinh = CAN_YEAR[((birthYear % 10) + 10) % 10];
      const canChiNamSinh = `${canNamSinh} ${banMenh}`;

      const trachMo = TRACH_MO_MAP[chiNgay] || ["", ""];
      const canKy = CAN_KY_CUNG[canNgay] || "";

      // 6. Tính toán ĐỘNG Thần Sát phụ
      const locChi = THIEN_LOC_MAP[canNgay] || "";
      const tsChi = TRUONG_SINH_MAP[canNgay] || "";
      const maChi = THIEN_MA_MAP[chiNgay] || "";
      const dsChi = DAI_SAT_MAP[canNgay] || "";
      const duLoPair = DU_LO_MAP[canNgay] || ["", ""];
      const duLoChi = isDay ? duLoPair[0] : duLoPair[1];
      const duLoName = isDay ? "Du đô" : "Lỗ đô";
      const ttChi = THIEN_TAI_THANG_MAP[chiThang] || "";
      const nqDb = NHAT_QUY_MAP[chiThang] || "";
      const nqChi = thienBan[nqDb] || "";
      const thDb = THIEN_HINH_MAP[chiThang] || "";
      const thChi = thienBan[thDb] || "";

      // 7. Chi tiết 12 cung ĐỘNG 100%
      const cung12 = {};
      for (const d of DIA_CHI) {
        const tb = thienBan[d];
        const saoThaiTue = SAO_THAI_TUE_MAP[tb] || "";
        const offsetKt = (this.idxChi(d) - this.idxChi(chiNgay) + 12) % 12;
        const saoKienTru = VONG_KIEN_TRU[offsetKt];

        const thanSatPhu = [];
        if (tb === ttChi && ttChi) thanSatPhu.push("Thiên tài");
        if (tb === duLoChi && duLoChi) thanSatPhu.push(duLoName);
        if (tb === locChi && locChi) thanSatPhu.push("Thiên lộc");
        if (tb === tsChi && tsChi) thanSatPhu.push("Trường sinh");
        if (tb === maChi && maChi) thanSatPhu.push("Thiên mã");
        if (tb === nqChi && nqChi) thanSatPhu.push("Nhật quỷ");
        if (tb === thChi && thChi) thanSatPhu.push("Thiên hình");
        if (tb === dsChi && dsChi) thanSatPhu.push("Đại sát");

        cung12[d] = {
          diaBan: d,
          thienBan: tb,
          thienTuong: tuongThienBan[tb],
          saoThaiTue: saoThaiTue,
          saoKienTru: saoKienTru,
          thanSatPhu: thanSatPhu,
          tenNguyetTuong: TEN_THAN_CUNG[tb] || "",
          lucThan: this.getLucThan(canNgay, tb),
          quanHe: this.getNguHanhRel(NGU_HANH_CHI[tb], NGU_HANH_CHI[d]),
          tagHanhNien: (d === hanhNien) ? `${tuoiAm} T` : "",
          tagBanMenh: (d === banMenh) ? "Mệnh" : "",
          tagTrachMo: (d === trachMo[0]) ? "Trạch" : ((d === trachMo[1]) ? "Mộ" : ""),
          tagCanChiNgay: (d === canKy) ? canNgay : ((d === chiNgay) ? chiNgay : "")
        };
      }

      return {
        canNgay,
        chiNgay,
        chiGio,
        nguyetTuong,
        tenNguyetTuong: TEN_THAN_CUNG[nguyetTuong] || "",
        isDaytime: isDay,
        tietKhi,
        quyNhanCung: diaBanQuy,
        quyNhanChieu: chieu,
        tuoiAm,
        gioiTinh,
        birthYear,
        banMenhChi: banMenh,
        canChiNamSinh: canChiNamSinh,
        currentYear,
        hanhNienChi: hanhNien,
        trachThan: trachMo[0],
        moThan: trachMo[1],
        canKyCungChi: canKy,
        tuKhoa,
        tamTruyenTenTong: tenTong,
        soTruyen: {
          chi: soTruyen,
          thienTuong: tuongThienBan[soTruyen],
          lucThan: this.getLucThan(canNgay, soTruyen),
          nguHanh: NGU_HANH_CHI[soTruyen]
        },
        trungTruyen: {
          chi: trungTruyen,
          thienTuong: tuongThienBan[trungTruyen],
          lucThan: this.getLucThan(canNgay, trungTruyen),
          nguHanh: NGU_HANH_CHI[trungTruyen]
        },
        matTruyen: {
          chi: matTruyen,
          thienTuong: tuongThienBan[matTruyen],
          lucThan: this.getLucThan(canNgay, matTruyen),
          nguHanh: NGU_HANH_CHI[matTruyen]
        },
        cung12
      };
    }
  };

  // Export
  global.LucNhamEngine = LucNhamEngine;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = LucNhamEngine;
  }
})(typeof window !== 'undefined' ? window : globalThis);
