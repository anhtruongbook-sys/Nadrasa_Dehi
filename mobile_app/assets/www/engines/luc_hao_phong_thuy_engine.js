/**
 * NETA LIGHT - LỤC HÀO PHONG THỦY ENGINE (engines/luc_hao_phong_thuy_engine.js)
 * 
 * ĐỘNG CƠ CHẨN ĐOÁN PHONG THỦY DƯƠNG TRẠCH & ÂM TRẠCH QUA LỤC HÀO NẠP GIÁP
 * Tích hợp tri thức từ hệ thống Luc_hao_phong_thuy (C:\Books\Common Study\Luc_hao_phong_thuy)
 * 
 * NGUYÊN TẮC CỐT LÕI:
 * 1. ZERO-RECASTING INVARIANT: Tuyệt đối không gieo lại quẻ. Kế thừa 100% thông tin
 *    từ kết quả quẻ Lục Hào đã có (state.lucHao.result / NetaLucHao2Engine).
 * 2. TRỤC TRẠCH (HÀO 2) - NHÂN (HÀO 5): Đánh giá tương tác trường khí nhà và người ở.
 * 3. MA TRẬN 6 HÀO VỊ KHÔNG GIAN: Ánh xạ 6 hào với 6 bộ vị kiến trúc nội ngoại thất / âm phần.
 * 4. CHẨN ĐOÁN SÁT KHÍ KIẾN TRÚC HIỆN ĐẠI: Thương Sát, Thiên Trảm Sát, Hỏa Sát Điện Lực,
 *    Thang Máy Xung Động Sát, Thủy Sát Rò Rỉ, Áp Đỉnh Sát.
 * 5. PHƯƠNG ÁN HÓA GIẢI NGŨ HÀNH: Màu sắc, bài trí, vật liệu và vật phẩm phong thủy.
 * 6. CHẠY CLIENT-SIDE 100% OFFLINE trên cả Web và Android APK (Flutter Webview).
 */

(function (global) {
  'use strict';

  // =========================================================================
  // 1. DỮ LIỆU ĐỊNH NGHĨA PHONG THỦY & NGŨ HÀNH
  // =========================================================================
  const BRANCH_TO_ELEMENT = {
    "Tý": "Thủy", "Sửu": "Thổ", "Dần": "Mộc", "Mão": "Mộc",
    "Thìn": "Thổ", "Tỵ": "Hỏa", "Ngọ": "Hỏa", "Mùi": "Thổ",
    "Thân": "Kim", "Dậu": "Kim", "Tuất": "Thổ", "Hợi": "Thủy"
  };

  const ELEMENT_RELATIONS = {
    "Kim,Thủy": "SINH", "Thủy,Mộc": "SINH", "Mộc,Hỏa": "SINH",
    "Hỏa,Thổ": "SINH", "Thổ,Kim": "SINH",
    "Kim,Mộc": "KHAC", "Mộc,Thổ": "KHAC", "Thổ,Thủy": "KHAC",
    "Thủy,Hỏa": "KHAC", "Hỏa,Kim": "KHAC"
  };

  function getElementRelation(elA, elB) {
    if (!elA || !elB) return "BINH";
    if (elA === elB) return "TY_HOA";
    if (ELEMENT_RELATIONS[`${elA},${elB}`] === "SINH") return "A_SINH_B";
    if (ELEMENT_RELATIONS[`${elB},${elA}`] === "SINH") return "B_SINH_A";
    if (ELEMENT_RELATIONS[`${elA},${elB}`] === "KHAC") return "A_KHAC_B";
    if (ELEMENT_RELATIONS[`${elB},${elA}`] === "KHAC") return "B_KHAC_A";
    return "BINH";
  }

  // 6 Hào vị không gian Dương trạch
  const DUONG_TRACH_SPATIAL = {
    1: {
      name: "Sơ Hào [ĐỊA CƠ]",
      spatial_element: "Nền móng, địa tầng, mương rãnh, đường cống thoát nước ngầm",
      interior: "Mặt sàn, bậc cửa ra vào, chân cầu thang, khu để giày dép",
      exterior: "Đất vườn quanh nhà, lối đi hông, rãnh thoát nước ngầm",
      human_role: "Con nhỏ, người giúp việc, thú cưng trong nhà",
      prosperous: "Nền móng kiên cố, địa khí vững chãi, long mạch tụ hội",
      defective: "Móng nhà lún nứt, ẩm thấp, rò rỉ nước ngầm, cống rãnh tắc nghẽn uế khí"
    },
    2: {
      name: "Nhị Hào [TRẠCH VỊ]",
      spatial_element: "Trụ trạch, gian nhà chính, phòng bếp (Táo vị), phòng ngủ gia chủ, giường ngủ",
      interior: "Bếp đun, bàn ăn, giường ngủ chủ nhà, nơi tàng phong tụ khí",
      exterior: "Sân trong, giếng trời trung tâm, tiểu cảnh nội đình",
      human_role: "Nội tướng, người vợ, mẹ, người quán xuyến gia đình",
      prosperous: "Bếp ấm cúng vượng khí, vợ chồng hòa thuận, gia đạo an vui, tàng phong đắc khí",
      defective: "Bếp đặt sai hướng, giường ngủ bị xà đè / xung chiếu, gia đạo bất an"
    },
    3: {
      name: "Tam Hào [MÔN KHUYẾT]",
      spatial_element: "Cửa ngách, cửa phụ, cầu thang, hành lang nội bộ, bàn làm việc",
      interior: "Cửa phòng ngủ, bậc tam cấp, vách ngăn phòng, kệ tủ trung gian",
      exterior: "Ngõ nhỏ dẫn vào nhà, lối đi hông, tường ngăn phụ",
      human_role: "Anh em, bạn bè thân thiết, đồng sự cộng tác",
      prosperous: "Khí đạo lưu thông hanh thông, cầu thang bố trí thuận khí",
      defective: "Hành lang xung sát (thương sát), cầu thang đâm thẳng cửa, cửa đối cửa gây khẩu thiệt"
    },
    4: {
      name: "Tứ Hào [MÔN VỊ]",
      spatial_element: "Cổng lớn, cửa chính (Đại Môn), ban công, cửa sổ lớn đón gió",
      interior: "Khung cửa chính, sảnh vào căn hộ, huyền quan đón khí",
      exterior: "Cổng ngõ, hàng rào bao quanh, mặt tiền tiếp giáp ngõ phố",
      human_role: "Thân tộc, họ hàng, thông gia, cấp quản lý trung gian",
      prosperous: "Đại môn nạp cát khí, minh đường thoáng sáng, huyền quan tụ tài",
      defective: "Cửa chính bị xung sát (đường đâm, góc nhọn chiếu), ban công thoát khí"
    },
    5: {
      name: "Ngũ Hào [NHÂN VỊ / GIA CHỦ]",
      spatial_element: "Phòng khách chính, minh đường, đường cái trước nhà, sảnh đón, phòng thờ",
      interior: "Vị trí ngồi của gia chủ, bàn trà tiếp khách, không gian trung tâm trọng yếu",
      exterior: "Đại lộ trước nhà, quảng trường, không gian khoáng đạt phía trước",
      human_role: "Gia trưởng, người chủ gia đình, người trụ cột kinh tế",
      prosperous: "Gia chủ vượng quyền, minh đường khoáng đạt, quý nhân phù trợ, tài khí dồi dào",
      defective: "Gia chủ hao tổn sức khỏe, đường cái trước nhà bức bách, phòng khách tối tăm u ám"
    },
    6: {
      name: "Lục Hào [ĐỐNG LƯƠNG]",
      spatial_element: "Mái nhà, trần nhà, xà nóc (đống lương), tầng thượng, bàn thờ thần linh",
      interior: "Xà gồ mái, trần thạch cao, phòng thờ tầng thượng, kho chứa áp mái",
      exterior: "Nóc nhà, bồn nước mái, cột thu lôi, tháp chuông, công trình cao lân cận",
      human_role: "Ông bà, tổ tiên, người cao tuổi cố vấn thoái ẩn",
      prosperous: "Mái nhà che chở vững chắc, gia phong hiển vinh, âm phúc tổ tiên che chở",
      defective: "Mái dột nát, xà nóc cong vênh, áp mái bức bối nóng nực, bàn thờ không trang nghiêm"
    }
  };

  // 6 Hào vị không gian Âm trạch
  const AM_TRACH_SPATIAL = {
    1: {
      name: "Sơ Hào [HUYỆT ĐỂ]",
      spatial_element: "Đáy huyệt mộ, nền đất đặt tiểu quách, mạch nước ngầm đáy huyệt",
      indicator: "Trạng thái khô ráo hay úng ngập, có sỏi đá kết tụ hay bùn sình",
      prosperous: "Huyệt thổ ấm áp, ngũ sắc thái thổ, đất khô ráo tụ khí sinh tài",
      defective: "Đáy huyệt đọng nước, bùn lầy sình lầy, đất cứng đá chọc phá"
    },
    2: {
      name: "Nhị Hào [HÀI CỐT / QUAN QUÁCH]",
      spatial_element: "Quan tài, tiểu sành, hài cốt, thi thể người đã khuất",
      indicator: "Hài cốt bình an hay xao động, rễ cây đâm, côn trùng mối mọt",
      prosperous: "Hài cốt kết phát hồng tươi, quan quách nguyên vẹn, sinh khí bảo bọc",
      defective: "Rễ cây xuyên quách, mối mọt xâm nhập, hài cốt dịch chuyển bất an"
    },
    3: {
      name: "Tam Hào [MỘ MÔN / BIA MỘ]",
      spatial_element: "Cửa mộ, bia mộ, tường bao khuôn viên mộ, bậc tam cấp",
      indicator: "Bia đá khắc chữ, hướng đặt bia, ranh giới phần mộ",
      prosperous: "Bia mộ tôn nghiêm, tường bao che chắn gió độc, hướng bia chuẩn xác",
      defective: "Bia mộ nứt gãy, chữ mờ lạc táng, tường bao sụp đổ, trâu bò xâm lấn"
    },
    4: {
      name: "Tứ Hào [ÁN SƠN / NỘI MINH ĐƯỜNG]",
      spatial_element: "Gò đất án sơn trước mộ, khoảng đất trước huyệt, bàn thờ lộ thiên",
      indicator: "Án sơn hữu tình hay bức bách, bàn lễ bày biện",
      prosperous: "Án sơn bằng tròn thanh tú, nội minh đường tụ khí che chắn",
      defective: "Án sơn cao ngất bức bách, khe rãnh đâm xuyên, đất trước mộ xói lở"
    },
    5: {
      name: "Ngũ Hào [LONG MẠCH / TRIỀU SƠN]",
      spatial_element: "Thân rồng dẫn mạch (Long nhập thủ), núi chầu phía xa (Triều sơn), ngoại minh đường",
      indicator: "Thế long vượng hay thoái, núi xa triều bái",
      prosperous: "Long mạch trùng điệp uốn lượn có sinh khí, triều sơn hữu tình cung kính",
      defective: "Long mạch bị đào xới cắt đứt, triều sơn quay lưng vô tình hoặc chọc gai nhọn"
    },
    6: {
      name: "Lục Hào [TỌA SƠN / HẬU CHẨM]",
      spatial_element: "Núi dựa sau huyệt (Tọa sơn, Huyền Vũ sơn), cây đại thụ phía sau, bầu trời che chở",
      indicator: "Thế núi phía sau dày dặn hay trơ trọi, hậu bối",
      prosperous: "Tọa sơn dày dặn vững chãi như bình phong chắn gió bắc, đại thụ xanh tốt",
      defective: "Hậu chẩm khuyết hãm, vách đá cheo leo đổ nát, gió thổi thốc từ sau lưng"
    }
  };

  // Quy tắc nhận diện 6 Sát khí kiến trúc hiện đại
  const MODERN_HAZARD_RULES = {
    THUONG_SAT: {
      name: "Thương Sát (Đường đâm / Hành lang dài chĩa thẳng vào cửa)",
      target_haos: [4, 5],
      check: (haos, thePos) => {
        return haos.some(h => (h.position === 4 || h.position === 5) &&
          (h.luc_thu === "Bạch Hổ" || h.luc_than === "Quan Quỷ") &&
          h.is_moving);
      },
      impact: "Luồng khí xung quá xiết gây tổn hại sức khỏe, tai nạn bất ngờ, tài khí thất tán khó tích lũy.",
      remedy: "Bố trí huyền quan chắn gió trước cửa, treo rèm hạt gỗ dày, đặt bình phong hoặc chậu cây cảnh lá tròn xanh tươi cản sát khí."
    },
    THIEN_TRAM_SAT: {
      name: "Thiên Trảm Sát (Khe hẹp giữa hai tòa nhà chém vào ban công / cửa)",
      target_haos: [4, 6],
      check: (haos, thePos) => {
        return haos.some(h => (h.position === 4 || h.position === 6) &&
          h.luc_thu === "Bạch Hổ" && h.element === "Kim" && h.is_moving);
      },
      impact: "Lực hút gió cực mạnh mang theo áp suất âm, gia chủ dễ mắc bệnh huyết áp, thần kinh căng thẳng, hao tài.",
      remedy: "Dán phim cách nhiệt phản quang, trồng hàng trúc cảnh xanh cản gió ở ban công, treo gương lồi Bát Quái hoặc chuông gió giải sát."
    },
    HOA_SAT_DIEN_LUC: {
      name: "Hỏa Sát Điện Lực (Trạm biến áp, cột điện, hộp kỹ thuật điện sát vách)",
      target_haos: [2, 3, 5],
      check: (haos, thePos) => {
        return haos.some(h => [2, 3, 5].includes(h.position) &&
          (h.luc_thu === "Chu Tước" || (h.luc_than === "Quan Quỷ" && h.element === "Hỏa")) &&
          h.is_moving);
      },
      impact: "Bức xạ điện từ cao làm giấc ngủ chập chờn, tim đập nhanh, tính khí người trong nhà dễ nóng nảy sinh cãi vã.",
      remedy: "Đặt khối thạch anh vàng hoặc chậu cây bản lá dày gần vách tiếp giáp nguồn điện, dùng Thủy/Thổ để hóa giải tính bốc hỏa."
    },
    THANG_MAY_XUNG_KHI: {
      name: "Thang Máy Xung Động Sát (Hộp thang máy sát phòng ngủ hoặc cửa thang đối diện cửa chính)",
      target_haos: [2, 3, 4],
      check: (haos, thePos) => {
        const h2 = haos.find(h => h.position === 2);
        const h4 = haos.find(h => h.position === 4);
        return (h2 && h2.is_moving && (h2.luc_thu === "Bạch Hổ" || h2.luc_thu === "Huyền Vũ")) ||
               (h4 && h4.is_moving && (h4.luc_thu === "Bạch Hổ" || h4.luc_thu === "Huyền Vũ"));
      },
      impact: "Trường khí chuyển động lên xuống liên tục làm nhiễu loạn từ trường gia trạch, người ở bồn chồn khó tích lũy của cải.",
      remedy: "Ốp vách tiêu âm cách âm chuyên dụng tại phòng ngủ tiếp giáp thang máy, đặt thảm màu đỏ hoặc bình phong chắn tại cửa chính."
    },
    THUY_SAT_RO_RI: {
      name: "Thủy Sát Ẩm Thấp (Đường ống nước ngầm rò rỉ, nhà vệ sinh đè bếp/giường)",
      target_haos: [1, 2],
      check: (haos, thePos) => {
        return haos.some(h => (h.position === 1 || h.position === 2) &&
          h.luc_thu === "Huyền Vũ" && (h.element === "Thủy" || h.is_nguyet_pha || h.is_tuan_khong));
      },
      impact: "Ẩm mốc phát sinh, tổn hại kết cấu móng nhà, người trong nhà dễ mắc bệnh phụ khoa, thận suy, đau nhức xương khớp.",
      remedy: "Khắc phục triệt để điểm rò rỉ cơ học, chống thấm đa lớp, thông gió cưỡng bức bằng quạt hút, đặt đá phong thủy hút ẩm."
    },
    AP_DINH_SAT: {
      name: "Áp Đỉnh Sát (Xà ngang đè giường ngủ, bàn thờ hoặc bàn làm việc)",
      target_haos: [2, 5, 6],
      check: (haos, thePos) => {
        const h6 = haos.find(h => h.position === 6);
        return h6 && h6.is_moving && (h6.element === "Thổ" || h6.element === "Kim");
      },
      impact: "Tạo cảm giác bị đè nén nặng nề, đau đầu mãn tính, sự nghiệp trì trệ có cảm giác không ngóc đầu lên được.",
      remedy: "Đóng trần thạch cao che kín xà ngang, dời vị trí giường/bàn ra khỏi phương vị xà; nếu không dời được thì treo hai sáo trúc nghiêng 45 độ."
    }
  };

  // =========================================================================
  // 2. ADAPTER TIẾP NHẬN QUẺ CÓ SẴN (ZERO-RECASTING)
  // =========================================================================
  const ExistingHexAdapter = {
    normalize: function (rawHexData) {
      if (!rawHexData) return null;

      // Đã chuẩn hex_data
      if (rawHexData.haos && rawHexData.palace_element && rawHexData.hex_name) {
        return rawHexData;
      }

      // Chuẩn hóa từ state.lucHao.result của Neta Light (dichhoc_engine.js)
      const qg = rawHexData.que_goc || rawHexData;
      const qb = rawHexData.que_bien || rawHexData.bien_data;
      const hexName = qg.name || qg.goc_name || rawHexData.goc_name || 'Quẻ Gốc';
      const palaceName = qg.cung || qg.cung_name || rawHexData.cung_name || 'Càn';
      const palaceElement = qg.cungElement || qg.cung_element || rawHexData.cung_element || 'Kim';
      const thePos = qg.thePos || qg.the_pos || rawHexData.the_pos || 1;
      const ungPos = qg.ungPos || qg.ung_pos || rawHexData.ung_pos || 4;
      const changedHexName = qb ? (qb.name || qb.bien_name || 'Quẻ Tĩnh') : 'Quẻ Tĩnh';

      const rawHaos = qg.haos || qg.haos_goc_detail || rawHexData.haos_goc_detail || rawHexData.haos || [];
      const bienHaos = qb ? (qb.haos || qb.haos_bien_detail || []) : [];
      const bienMap = {};
      bienHaos.forEach(bh => { if (bh.pos) bienMap[bh.pos] = bh; });

      const haos = rawHaos.map((rh, idx) => {
        const pos = rh.pos || rh.position || (idx + 1);
        const isDong = !!(rh.isDong || rh.is_dong || rh.is_moving);
        const chi = rh.chi || rh.branch || '';
        const chiElem = rh.chiElement || rh.element || BRANCH_TO_ELEMENT[chi] || 'Thổ';
        const lucThan = rh.lucThan || rh.luc_than || '';
        const lucThu = rh.lucThu || rh.luc_thu || '';

        let chBr = null;
        let chEl = null;
        let chLt = null;
        if (isDong && bienMap[pos]) {
          chBr = bienMap[pos].chi || null;
          chEl = bienMap[pos].chiElement || BRANCH_TO_ELEMENT[chBr] || null;
          chLt = bienMap[pos].lucThan || null;
        }

        return {
          position: pos,
          bit: (rh.bit !== undefined) ? rh.bit : 1,
          can: rh.can || '',
          branch: chi,
          element: chiElem,
          luc_than: lucThan,
          luc_thu: lucThu,
          is_the: (pos === thePos),
          is_ung: (pos === ungPos),
          is_moving: isDong,
          is_tuan_khong: !!(rh.isTuanKhong || rh.is_tuan_khong || rh.tk === 'K'),
          is_nguyet_pha: !!(rh.vuongSuy === 'Phá' || rh.is_nguyet_pha),
          changed_branch: chBr,
          changed_element: chEl,
          changed_luc_than: chLt
        };
      });

      const tg = rawHexData.thoi_gian || {};
      const dayCan = tg.canNgay || rawHexData.day_can || rawHexData.can_ngay || '';
      const dayChi = tg.chiNgay || rawHexData.day_chi || rawHexData.chi_ngay || '';
      const monthChi = tg.thangChi || rawHexData.month_chi || rawHexData.thang_chi || '';
      const tuanKhong = tg.tuanKhong || rawHexData.tuan_khong || [];

      return {
        hex_name: hexName,
        palace_name: palaceName,
        palace_element: palaceElement,
        the_position: thePos,
        ung_position: ungPos,
        changed_hex_name: changedHexName,
        has_moving_hao: haos.some(h => h.is_moving),
        haos: haos,
        time_meta: {
          day_can: dayCan,
          day_chi: dayChi,
          month_chi: monthChi,
          tuan_khong: Array.isArray(tuanKhong) ? tuanKhong : [tuanKhong]
        }
      };
    }
  };

  // =========================================================================
  // 3. ĐỘNG CƠ CHẨN ĐOÁN DƯƠNG TRẠCH (DUONG TRACH ENGINE)
  // =========================================================================
  const DuongTrachEngine = {
    analyze: function (hexData) {
      const haos = hexData.haos || [];
      if (haos.length < 6) return null;

      const h2 = haos.find(h => h.position === 2) || haos[1];
      const h5 = haos.find(h => h.position === 5) || haos[4];

      const el2 = h2.element;
      const el5 = h5.element;
      const rel = getElementRelation(el2, el5);

      let trachNhanGrade = "BINH";
      let trachNhanTitle = "TRẠCH NHÂN BÌNH HÒA";
      let trachNhanDesc = "";

      if (rel === "A_SINH_B") {
        trachNhanGrade = "CAT";
        trachNhanTitle = "TRẠCH SINH NHÂN (ĐẠI CÁT)";
        trachNhanDesc = "Đất lành dưỡng người, ngôi nhà sinh trợ trực tiếp cho gia chủ. Người ở an khang, tài lộc tích tụ tự nhiên, gia đạo êm ấm vượng phát.";
      } else if (rel === "B_KHAC_A") {
        trachNhanGrade = "CAT_TRUNG";
        trachNhanTitle = "NHÂN KHẮC TRẠCH (THỨ CÁT)";
        trachNhanDesc = "Gia chủ nắm thế chủ động, làm chủ hoàn toàn không gian ngôi nhà. Cần bỏ công sức kiến thiết bài trí nhưng sự nghiệp vững tiến, công thành danh toại.";
      } else if (rel === "TY_HOA") {
        trachNhanGrade = "BINH_CAT";
        trachNhanTitle = "TRẠCH NHÂN TỶ HÒA (CÁT BÌNH)";
        trachNhanDesc = "Trường khí ngôi nhà và gia chủ đồng điệu, cuộc sống bình ổn, sức khỏe duy trì tốt, ít biến cố lớn.";
      } else if (rel === "B_SINH_A") {
        trachNhanGrade = "TIET_KHI";
        trachNhanTitle = "NHÂN SINH TRẠCH (TIẾT KHÍ)";
        trachNhanDesc = "Gia chủ bị hao tâm tổn lực vì nhà cửa, chi phí sửa sang tốn kém, dễ mệt mỏi suy giảm thể lực. Cần bổ sung năng lượng sinh trợ cho gia chủ.";
      } else if (rel === "A_KHAC_B") {
        trachNhanGrade = "HUNG";
        trachNhanTitle = "TRẠCH KHẮC NHÂN (HUNG HIỂM)";
        trachNhanDesc = "Ngôi nhà phạm sát khí áp bức gia chủ. Ở lâu sinh trắc trở, tâm trạng bất an, sự nghiệp gặp lực cản lớn, sức khỏe suy sụp. Cần cấp bách hóa giải.";
      } else {
        trachNhanGrade = "BINH";
        trachNhanTitle = "TRƯỜNG KHÍ QUÂN BÌNH";
        trachNhanDesc = "Trường khí Trạch - Nhân ở trạng thái quân bình, cần duy trì ánh sáng và thông gió tự nhiên.";
      }

      // Phân tích ma trận 6 hào vị
      const spatialRows = [];
      const hazards = [];
      const prosperousPoints = [];

      haos.forEach(h => {
        const pos = h.position;
        const meta = DUONG_TRACH_SPATIAL[pos] || {};
        let evaluation = "Bình ổn";
        let evalClass = "status-normal";
        let detailNote = "";

        if (h.luc_than === "Quan Quỷ") {
          if (h.is_moving) {
            evaluation = "⚠️ Sát Khí Phát Động";
            evalClass = "status-danger";
            detailNote = `Quan Quỷ động tại ${meta.name}: Điểm phát sinh uế khí hoặc sát khí mạnh, đề phòng chập điện, trộm cắp hoặc kết cấu hư hỏng.`;
            hazards.push(detailNote);
          } else {
            evaluation = "Ẩm Khí / Uế Khí Tiềm Ẩn";
            evalClass = "status-warning";
            detailNote = `Quan Quỷ phục tại ${meta.name}: Nơi đây ánh sáng yếu hoặc thiếu thông gió, cần dọn dẹp sạch sẽ.`;
          }
        } else if (h.luc_than === "Tử Tôn") {
          evaluation = "🌟 Phúc Thần Che Chở (Tụ Khí)";
          evalClass = "status-good";
          detailNote = `Tử Tôn ngự tại ${meta.name}: Sinh khí dồi dào, giải trừ tai ương, mang lại may mắn, bình an cho không gian này.`;
          prosperousPoints.push(`Hào ${pos} (${meta.name}): Phúc thần tụ khí.`);
        } else if (h.luc_than === "Thê Tài") {
          evaluation = "💰 Tài Vị / Vượng Tài";
          evalClass = "status-good";
          detailNote = `Thê Tài ngự tại ${meta.name}: Điểm tụ tài lộc, thích hợp bố trí két sắt, quầy thu ngân hoặc không gian sinh lời.`;
          prosperousPoints.push(`Hào ${pos} (${meta.name}): Điểm đón tài khí.`);
        } else if (h.luc_than === "Phụ Mẫu") {
          evaluation = "🏛️ Trụ Trạch Bảo Trợ";
          evalClass = "status-good";
          detailNote = `Phụ Mẫu ngự tại ${meta.name}: Tường vách kiên cố, giấy tờ pháp lý vững vàng, gia phong nền nếp.`;
        } else if (h.luc_than === "Huynh Đệ") {
          if (h.is_moving) {
            evaluation = "💸 Hao Tán / Phong Khí Xung";
            evalClass = "status-warning";
            detailNote = `Huynh Đệ động tại ${meta.name}: Khí lưu thông quá nhanh gây tán tài, đề phòng cửa đối cửa hoặc hành lang thông gió quá mạnh.`;
            hazards.push(detailNote);
          } else {
            evaluation = "Tường Rào / Bình Phong";
            evalClass = "status-normal";
            detailNote = `Huynh Đệ tại ${meta.name}: Đóng vai trò che chắn, ngăn cách không gian.`;
          }
        }

        // Tác động của Lục Thú
        if (h.luc_thu === "Bạch Hổ" && h.is_moving) {
          hazards.push(`Hào ${pos} lâm Bạch Hổ động: Cảnh báo va đập cơ học, vật sắc nhọn kim khí chĩa vào hoặc góc nhọn sát khí.`);
        } else if (h.luc_thu === "Huyền Vũ" && (h.element === "Thủy" || h.is_tuan_khong)) {
          hazards.push(`Hào ${pos} lâm Huyền Vũ: Cảnh báo nguy cơ ẩm mốc, rò rỉ nước ngầm hoặc đường thoát nước bế tắc.`);
        } else if (h.luc_thu === "Chu Tước" && h.element === "Hỏa" && h.is_moving) {
          hazards.push(`Hào ${pos} lâm Chu Tước động: Cảnh báo hỏa nhiệt quá vượng, dây điện quá tải hoặc tiếng ồn gây khẩu thiệt.`);
        }

        spatialRows.push({
          position: pos,
          name: meta.name,
          spatial_element: meta.spatial_element,
          interior: meta.interior,
          exterior: meta.exterior,
          hao_can_chi: `${h.can} ${h.branch} (${h.element})`,
          luc_than: h.luc_than,
          luc_thu: h.luc_thu,
          is_moving: h.is_moving,
          is_tuan_khong: h.is_tuan_khong,
          is_nguyet_pha: h.is_nguyet_pha,
          evaluation: evaluation,
          eval_class: evalClass,
          detail_note: detailNote,
          prosperous_meaning: meta.prosperous,
          defective_meaning: meta.defective
        });
      });

      return {
        trach_nhan: {
          grade: trachNhanGrade,
          title: trachNhanTitle,
          description: trachNhanDesc,
          element_h2: el2,
          element_h5: el5,
          relation: rel
        },
        spatial_rows: spatialRows,
        hazards: hazards,
        prosperous_points: prosperousPoints
      };
    }
  };

  // =========================================================================
  // 4. ĐỘNG CƠ CHẨN ĐOÁN ÂM TRẠCH (AM TRACH ENGINE)
  // =========================================================================
  const AmTrachEngine = {
    analyze: function (hexData) {
      const haos = hexData.haos || [];
      if (haos.length < 6) return null;

      const h2 = haos.find(h => h.position === 2) || haos[1]; // Hài cốt / quan quách
      const h5 = haos.find(h => h.position === 5) || haos[4]; // Long mạch

      let huyetTrangThai = "An định, tụ khí";
      let huyetClass = "status-good";
      if (h2.is_moving || h2.luc_than === "Quan Quỷ") {
        huyetTrangThai = "⚠️ Xao động, có uế khí hoặc rễ cây xâm lấn";
        huyetClass = "status-danger";
      } else if (h2.is_tuan_khong) {
        huyetTrangThai = "Huyệt mộ lâm Không Vong (khí chưa tụ)";
        huyetClass = "status-warning";
      }

      const spatialRows = haos.map(h => {
        const pos = h.position;
        const meta = AM_TRACH_SPATIAL[pos] || {};
        return {
          position: pos,
          name: meta.name,
          spatial_element: meta.spatial_element,
          indicator: meta.indicator,
          hao_can_chi: `${h.can} ${h.branch} (${h.element})`,
          luc_than: h.luc_than,
          luc_thu: h.luc_thu,
          is_moving: h.is_moving,
          is_tuan_khong: h.is_tuan_khong,
          prosperous_meaning: meta.prosperous,
          defective_meaning: meta.defective
        };
      });

      return {
        huyet_trang_thai: huyetTrangThai,
        huyet_class: huyetClass,
        spatial_rows: spatialRows
      };
    }
  };

  // =========================================================================
  // 5. ĐỘNG CƠ CHẨN ĐOÁN SÁT KHÍ KIẾN TRÚC HIỆN ĐẠI
  // =========================================================================
  const SatKhiDiagnosticsEngine = {
    diagnose: function (hexData) {
      const haos = hexData.haos || [];
      const thePos = hexData.the_position || 1;
      const detected = [];

      Object.keys(MODERN_HAZARD_RULES).forEach(key => {
        const rule = MODERN_HAZARD_RULES[key];
        try {
          if (rule.check(haos, thePos)) {
            detected.push({
              key: key,
              name: rule.name,
              impact: rule.impact,
              remedy: rule.remedy
            });
          }
        } catch (e) {
          console.warn("Lỗi kiểm tra sát khí:", key, e);
        }
      });

      return detected;
    }
  };

  // =========================================================================
  // 6. ĐỘNG CƠ TỔNG HỢP GIẢI PHÁP HÓA GIẢI NGŨ HÀNH (REMEDIATION ENGINE)
  // =========================================================================
  const RemediationEngine = {
    synthesizeRemedy: function (duongTrachRes, hazardsDetected, hexData) {
      const plans = [];

      // 1. Hóa giải theo trục Trạch - Nhân
      if (duongTrachRes && duongTrachRes.trach_nhan) {
        const tn = duongTrachRes.trach_nhan;
        if (tn.relation === "A_KHAC_B") { // Trạch khắc Nhân
          plans.push({
            title: `Hóa Giải Trục Trạch Khắc Nhân (${tn.element_h2} khắc ${tn.element_h5})`,
            priority: "Cao",
            mechanism: `Dùng ngũ hành Thông Khí gián tiếp giữa Trạch (${tn.element_h2}) và Nhân (${tn.element_h5}).`,
            action: tn.element_h2 === "Hỏa" && tn.element_h5 === "Kim" ?
              "Bổ sung hành Thổ (gốm sứ, bình phong màu vàng, tranh phong cảnh đồi núi) để chuyển thành Hỏa sinh Thổ, Thổ sinh Kim." :
              tn.element_h2 === "Thủy" && tn.element_h5 === "Hỏa" ?
              "Bổ sung hành Mộc (cây xanh tán rộng, rèm màu xanh lá, nội thất gỗ tự nhiên) để Thủy sinh Mộc, Mộc sinh Hỏa." :
              tn.element_h2 === "Mộc" && tn.element_h5 === "Thổ" ?
              "Bổ sung hành Hỏa (đèn chiếu sáng ấm, thảm màu đỏ/cam, tranh mặt trời mọc) để Mộc sinh Hỏa, Hỏa sinh Thổ." :
              tn.element_h2 === "Kim" && tn.element_h5 === "Mộc" ?
              "Bổ sung hành Thủy (thác nước phong thủy mini, bể cá, màu xanh nước biển) để Kim sinh Thủy, Thủy sinh Mộc." :
              "Bổ sung hành Kim (chuông gió kim loại 6 ống, tượng đồng) để Thổ sinh Kim, Kim sinh Thủy."
          });
        } else if (tn.relation === "B_SINH_A") { // Nhân sinh Trạch (tiết khí)
          plans.push({
            title: `Bồi Bổ Nguyên Khí Cho Gia Chủ (Nhân sinh Trạch - ${tn.element_h5} sinh ${tn.element_h2})`,
            priority: "Trung bình",
            mechanism: `Gia chủ bị tiết hao sinh lực nuôi dưỡng ngôi nhà. Cần bổ sung năng lượng hành đồng khí hoặc sinh trợ cho hành của Hào 5 (${tn.element_h5}).`,
            action: `Tăng cường ánh sáng, sử dụng vật phẩm và màu sắc thuộc hành tương sinh với ${tn.element_h5} tại phòng ngủ và phòng làm việc.`
          });
        }
      }

      // 2. Hóa giải theo các sát khí hiện đại phát hiện được
      if (Array.isArray(hazardsDetected) && hazardsDetected.length > 0) {
        hazardsDetected.forEach(hz => {
          plans.push({
            title: `Hóa Giải: ${hz.name}`,
            priority: "Cao",
            mechanism: hz.impact,
            action: hz.remedy
          });
        });
      }

      // 3. Nếu không có sát khí lớn
      if (plans.length === 0) {
        plans.push({
          title: "Bảo Toàn Sinh Khí & Dưỡng Khí Tự Nhiên",
          priority: "Tiêu chuẩn",
          mechanism: "Trường khí ngôi nhà đạt trạng thái cân bằng ổn định, không ghi nhận xung sát nghiêm trọng.",
          action: "Duy trì vệ sinh thông thoáng tại Minh Đường (Hào 5) và Huyền Quan (Hào 4), đón ánh sáng mặt trời tự nhiên mỗi sáng, chăm sóc cây xanh tươi tốt để tích lũy tài khí."
        });
      }

      return plans;
    }
  };

  // =========================================================================
  // 7. MASTER PIPELINE: ĐIỀU PHỐI PHONG THỦY TỪ QUẺ CÓ SẴN
  // =========================================================================
  const NetaLucHaoPhongThuyEngine = {
    ExistingHexAdapter: ExistingHexAdapter,
    DuongTrachEngine: DuongTrachEngine,
    AmTrachEngine: AmTrachEngine,
    SatKhiDiagnosticsEngine: SatKhiDiagnosticsEngine,
    RemediationEngine: RemediationEngine,

    /**
     * Hàm phân tích cốt lõi: Tiếp nhận quẻ có sẵn, tuyệt đối KHÔNG gieo lại quẻ.
     * @param {Object} rawHexData - Kết quả từ state.lucHao.result của Neta Light
     * @param {String} mode - 'DUONG_TRACH' | 'AM_TRACH' | 'TOAN_DIEN'
     * @param {Object} options - { propertyAddress, orientation, degree }
     */
    analyzeExistingHex: function (rawHexData, mode = 'DUONG_TRACH', options = {}) {
      if (!rawHexData) return null;

      // 1. Chuẩn hóa qua Adapter trong 0.001 giây (Zero-Recasting)
      const hexData = ExistingHexAdapter.normalize(rawHexData);
      if (!hexData || !hexData.haos || hexData.haos.length < 6) return null;

      // 2. Phân tích Dương Trạch
      let duongTrachRes = null;
      if (mode === 'DUONG_TRACH' || mode === 'TOAN_DIEN') {
        duongTrachRes = DuongTrachEngine.analyze(hexData);
      }

      // 3. Phân tích Âm Trạch
      let amTrachRes = null;
      if (mode === 'AM_TRACH' || mode === 'TOAN_DIEN') {
        amTrachRes = AmTrachEngine.analyze(hexData);
      }

      // 4. Chẩn đoán Sát Khí Hiện Đại
      const hazards = SatKhiDiagnosticsEngine.diagnose(hexData);

      // 5. Tổng hợp phương án hóa giải
      const remedies = RemediationEngine.synthesizeRemedy(duongTrachRes, hazards, hexData);

      const meta = {
        mode: mode,
        property_address: options.propertyAddress || 'Công trình khảo sát phong thủy',
        orientation: options.orientation || 'Tọa Hướng theo quẻ',
        hex_name: hexData.hex_name,
        changed_hex_name: hexData.changed_hex_name,
        palace: `Cung ${hexData.palace_name} (${hexData.palace_element})`,
        the_hao: hexData.the_position,
        ung_hao: hexData.ung_position,
        time_meta: hexData.time_meta
      };

      return {
        meta: meta,
        hex_data: hexData,
        duong_trach: duongTrachRes,
        am_trach: amTrachRes,
        hazards: hazards,
        remedies: remedies
      };
    },

    formatMarkdownReport: function (result) {
      if (!result) return '';
      const m = result.meta;
      const tm = m.time_meta || {};
      const lines = [];

      lines.push(`# BÁO CÁO KHẢO SÁT & LUẬN GIẢI PHONG THỦY LỤC HÀO`);
      lines.push(`> **Công trình:** ${m.property_address} | **Tọa hướng:** ${m.orientation}`);
      lines.push(`> **Quẻ:** **${m.hex_name.toUpperCase()}** (${m.palace}) ➔ Biến: **${m.changed_hex_name.toUpperCase()}**`);
      lines.push(`> **Thời điểm chiêm:** Ngày ${tm.day_can || ''} ${tm.day_chi || ''}, Tháng ${tm.month_chi || ''} | Tuần Không: [${(tm.tuan_khong || []).join(', ')}]\n`);

      if (result.duong_trach) {
        const dt = result.duong_trach;
        lines.push(`## 🏠 I. TƯƠNG QUAN TRẠCH VỊ (HÀO 2) & NHÂN VỊ (HÀO 5)`);
        lines.push(`### **${dt.trach_nhan.title}**`);
        lines.push(`${dt.trach_nhan.description}\n`);

        lines.push(`## 📐 II. MA TRẬN 6 BỘ VỊ KHÔNG GIAN NỘI TRẠCH`);
        lines.push(`| Hào Vị | Không Gian Kiến Trúc | Can Chi & Ngũ Hành | Lục Thân | Lục Thú | Đánh Giá Khí Trường |`);
        lines.push(`| :---: | :--- | :--- | :--- | :--- | :--- |`);
        (dt.spatial_rows || []).slice().reverse().forEach(row => {
          const moveTag = row.is_moving ? ' *(ĐỘNG)*' : '';
          const tkTag = row.is_tuan_khong ? ' *(TK)*' : '';
          lines.push(`| **Hào ${row.position}** | ${row.name} | ${row.hao_can_chi}${moveTag}${tkTag} | ${row.luc_than} | ${row.luc_thu} | ${row.evaluation} |`);
        });
        lines.push('');
      }

      if (result.hazards && result.hazards.length > 0) {
        lines.push(`## ⚠️ III. SÁT KHÍ KIẾN TRÚC HIỆN ĐẠI PHÁT HIỆN`);
        result.hazards.forEach((hz, idx) => {
          lines.push(`### ${idx + 1}. ${hz.name}`);
          lines.push(`- **Tác động:** ${hz.impact}`);
          lines.push(`- **Hóa giải:** ${hz.remedy}\n`);
        });
      }

      if (result.remedies && result.remedies.length > 0) {
        lines.push(`## 🛡️ IV. PHƯƠNG ÁN HÓA GIẢI & BỐ TRÍ NGŨ HÀNH`);
        result.remedies.forEach((rem, idx) => {
          lines.push(`### ${idx + 1}. ${rem.title} [Ưu tiên: ${rem.priority}]`);
          lines.push(`- **Cơ chế:** ${rem.mechanism}`);
          lines.push(`- **Biện pháp thực thi:** ${rem.action}\n`);
        });
      }

      return lines.join('\n');
    }
  };

  global.NetaLucHaoPhongThuyEngine = NetaLucHaoPhongThuyEngine;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = NetaLucHaoPhongThuyEngine;
  }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
