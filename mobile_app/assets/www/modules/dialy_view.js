/**
 * NETA LIGHT - MODULE ĐỊA LÝ KHẢO SÁT CHUYÊN SÂU
 * Tích Hợp Song Phái Nhất Thể: Phong Thủy Tam Hợp Phái & Huyền Không Đại Quái
 * Đồng bộ hai chiều (Bi-directional State Coupling) với La Kinh Vệ Tinh
 * Hỗ trợ 100% Theme Sáng (theme-light) & Tối (Dark Mode) - Ergonomics Mobile
 */
(function (global) {
  'use strict';

  // State nội tại của Module Địa Lý Khảo Sát
  const state = {
    curHuongDeg: 180.0,
    curThuyKhauDeg: 115.0,
    curDongChay: 'ta_dao_huu',
    curActiveTab: 'tamhop', // 'tamhop' hoặc 'hkdq'
    curCanChu: 'Giáp',
    curChiChu: 'Tý',
    curNamChi: 'Thìn',
    curMoTaSa: '',
    curHkdqFilterVan: 'all',
    curHkdqFilterKhi: 'all',
    demCoords: null,
    demData: null,
    isDemLoading: false
  };

  function normalizeDeg(deg) {
    return ((deg % 360) + 360) % 360;
  }

  // Tra cứu thông tin Huyền Không Đại Quái từ góc độ deg
  function getHkdqByDegree(deg) {
    deg = normalizeDeg(deg);
    const data = global.HKDQ_CORE_DATA;
    if (!data || !data.hexagrams) return null;

    const hexes = Object.values(data.hexagrams);
    let matchedHex = null;

    for (const h of hexes) {
      if (h.la_kinh) {
        const start = h.la_kinh.deg_start;
        const end = h.la_kinh.deg_end;
        if (start <= end) {
          if (deg >= start && deg < end) {
            matchedHex = h;
            break;
          }
        } else {
          // Trường hợp quẻ vắt ngang 0° (ví dụ 354.38° - 360° hoặc 0° - 5.62°)
          if (deg >= start || deg < end) {
            matchedHex = h;
            break;
          }
        }
      }
    }

    if (!matchedHex && hexes.length > 0) matchedHex = hexes[0];
    if (!matchedHex) return null;

    // Tìm hào phân kim (1-6)
    let matchedHao = null;
    if (matchedHex.haos && matchedHex.haos.length > 0) {
      for (const hao of matchedHex.haos) {
        const hStart = hao.deg_start;
        const hEnd = hao.deg_end;
        if (hStart <= hEnd) {
          if (deg >= hStart && deg < hEnd) {
            matchedHao = hao;
            break;
          }
        } else {
          if (deg >= hStart || deg < hEnd) {
            matchedHao = hao;
            break;
          }
        }
      }
      if (!matchedHao) matchedHao = matchedHex.haos[0];
    }

    // Đánh giá phối quẻ
    const quaiKhi = matchedHex.quai_khi;
    const quaiVan = matchedHex.quai_van;
    const isHopThapVan = (quaiVan + 9 === 10) || (quaiVan === 1); // Vận 1 phối Vận 9 hợp thập
    const isHopThapKhi = (quaiKhi + 1 === 10); // Khí hợp thập
    const isTamBatDaoLu = [ [1,6], [6,1], [2,7], [7,2], [3,8], [8,3], [4,9], [9,4] ].some(p => p[0] === quaiKhi);
    const isPhuMauTamBan = [1,4,7].includes(quaiVan) || [2,5,8].includes(quaiVan) || [3,6,9].includes(quaiVan);

    return {
      hexagram: matchedHex,
      hao: matchedHao,
      quai_khi: quaiKhi,
      quai_van: quaiVan,
      cung: matchedHex.cung_bat_quai,
      ngu_hanh: matchedHex.ngu_hanh_cung,
      is_hop_thap: isHopThapVan || isHopThapKhi,
      is_tam_bat_dao_lu: isTamBatDaoLu,
      is_tam_ban_quai: isPhuMauTamBan,
      danh_gia_van_9: matchedHex.la_kinh ? matchedHex.la_kinh.danh_gia_van_9 : 'Bình hòa'
    };
  }

  // Đánh giá Công Năng Phong Thủy của Hào theo Lục Thân (Chuẩn mực Khóa 2 Thực Chiến - Thầy HNT)
  function getHaoFengShuiRole(lucThan) {
    switch (lucThan) {
      case 'Thê Tài':
        return {
          title: '✨ Cát Khai Môn & Kích Thủy',
          advice: 'Đại cát để trổ Cửa chính, Cổng phụ hoặc đặt Bể cá, Phong thủy luân chiêu tài tiến bảo, đắc lợi kinh doanh.',
          badgeClass: 'green',
          isCat: true
        };
      case 'Tử Tôn':
        return {
          title: '✨ Phúc Thần Chiêu Cát',
          advice: 'Đại cát Khai Môn, Thành Môn đón vượng khí phúc thần; sinh quý tử, giải trừ tai ách.',
          badgeClass: 'green',
          isCat: true
        };
      case 'Quan Quỷ':
        return {
          title: '⚠️ Đại Kỵ Mở Cửa & Động Thủy',
          advice: 'Tuyệt đối tránh trổ Cửa chính hoặc đặt Bể cá; chủ thị phi kiện tụng, tai họa. Chỉ hợp an vị Gian thờ trang nghiêm.',
          badgeClass: 'warn',
          isCat: false
        };
      case 'Huynh Đệ':
        return {
          title: '⚠️ Tránh Mở Cửa & Động Thủy',
          advice: 'Tránh làm Cửa chính hoặc kích hoạt Thủy; chủ về cạnh tranh bất lợi, hao tán tiền của.',
          badgeClass: 'gold',
          isCat: false
        };
      case 'Phụ Mẫu':
        return {
          title: '🛡️ Thanh Tĩnh Cát Lợi',
          advice: 'Chủ điền trạch vững bền, bảo trợ gia đạo; rất thích hợp đặt Bàn làm việc, Phòng học, Phòng thiền yên tĩnh.',
          badgeClass: 'purple',
          isCat: true
        };
      default:
        return {
          title: '⚖️ Bình Hòa',
          advice: 'Khí trường trung tính, cần phối hợp Loan Đầu thực địa.',
          badgeClass: 'neutral',
          isCat: true
        };
    }
  }

  // Khởi tạo và render module
  function init() {
    const container = document.getElementById('view-dialy');
    if (!container) return;

    // Đồng bộ góc độ ban đầu từ La Kinh nếu có
    if (global.NetaLaKinhView && typeof global.NetaLaKinhView.getState === 'function') {
      const lkState = global.NetaLaKinhView.getState();
      if (typeof lkState.rotation === 'number') state.curHuongDeg = lkState.rotation;
      if (typeof lkState.tamHopThuyKhauDeg === 'number') state.curThuyKhauDeg = lkState.tamHopThuyKhauDeg;
      if (lkState.tamHopDongChay) state.curDongChay = lkState.tamHopDongChay;
    }

    render();
  }

  function render() {
    const container = document.getElementById('view-dialy');
    if (!container) return;

    const deg = normalizeDeg(state.curHuongDeg);
    const tkDeg = normalizeDeg(state.curThuyKhauDeg);
    const toaDeg = normalizeDeg(deg + 180.0);

    // Tính toán Tam Hợp
    const thuyPhap = global.TamHopEngine ? global.TamHopEngine.evaluate_trach_thuy_phap(deg, tkDeg, state.curDongChay) : null;
    const pk120 = global.TamHopEngine ? global.TamHopEngine.get_120_phan_kim(deg) : null;
    const thauDia72 = global.TamHopEngine ? global.TamHopEngine.get_72_thau_dia_long(deg) : null;
    const xuyenSon60 = global.TamHopEngine ? global.TamHopEngine.get_60_xuyen_son_long(deg) : null;
    const xuyenSon72 = global.TamHopEngine ? global.TamHopEngine.get_72_xuyen_son_long(deg) : null;
    const huongSon = thuyPhap ? thuyPhap.huong_nha.son_name : '';
    const toaInfo = global.TamHopEngine ? global.TamHopEngine.get_son_from_degree(toaDeg, 'dia_ban') : null;
    const toaSon = toaInfo ? toaInfo.son_name : '';

    const tamSat = global.TamHopEngine ? global.TamHopEngine.kiem_tra_tam_sat(state.curNamChi, huongSon) : null;
    const thaiTue = global.TamHopEngine ? global.TamHopEngine.kiem_tra_thai_tue_tue_pha(state.curNamChi, huongSon) : null;
    const hoangTuyen = global.TamHopEngine ? global.TamHopEngine.kiem_tra_hoang_tuyen(huongSon, thuyPhap ? thuyPhap.thuy_khau.son_name : '') : null;
    const batSat = global.TamHopEngine ? global.TamHopEngine.kiem_tra_bat_sat_cung(toaSon, thuyPhap ? thuyPhap.thuy_khau.son_name : '') : null;
    const tamCat = global.TamHopEngine ? global.TamHopEngine.get_quy_nhan_loc_ma(state.curCanChu, state.curChiChu) : null;
    const tu28 = global.TamHopEngine ? global.TamHopEngine.nhi_thap_bat_tu_nhan_ban(deg) : null;

    // Tính toán Đại Quái
    const hkdq = getHkdqByDegree(deg);

    // Đánh giá Tổng thể Song Phái
    const isTamHopCat = pk120 && pk120.duoc_phep_lay && thauDia72 && thauDia72.is_bao_chau && (!tamSat || !tamSat.pham_tam_sat) && (!batSat || !batSat.pham_bat_sat);
    const isHkdqCat = hkdq && (hkdq.danh_gia_van_9.includes('Cát') || hkdq.danh_gia_van_9.includes('ĐẠI PHÁT') || hkdq.is_hop_thap);
    const isSongPhaiDacCach = isTamHopCat && isHkdqCat;
    const isPhamKhongVong = pk120 && !pk120.duoc_phep_lay;

    container.innerHTML = `
      <div class="dialy-workspace">
        
        <!-- ================= STICKY HEADER SIÊU GỌN (COMPACT SLIM CONTROLLER) ================= -->
        <div class="dialy-sticky-header">
          
          <!-- Hàng 1: Hướng / Tọa & Cụm nút đồng bộ La Kinh / Ảnh Dài -->
          <div class="dialy-header-row-1">
            <div class="dialy-heading-badge-group" style="white-space: nowrap;">
              <span class="dialy-heading-title">🧭</span>
              <span class="dialy-val-deg">${deg.toFixed(1)}°</span>
              <span class="dialy-val-son">(${huongSon})</span>
              <span class="dialy-val-toa">• Tọa ${toaDeg.toFixed(1)}°</span>
            </div>
            
            <div class="dialy-header-actions">
              <button type="button" class="dialy-btn-sm" id="dialy-btn-sync-lakinh" title="Đồng bộ từ La Kinh">
                🔄 La Kinh
              </button>
              <button type="button" class="dialy-btn-sm dialy-btn-primary" id="dialy-btn-apply-lakinh" title="Áp sang La Kinh & Mở bản đồ">
                🧭 Áp Dụng
              </button>
            </div>
          </div>

          <!-- Hàng 2: Slider & Bộ Vi Chỉnh Góc Mượt Mà -->
          <div class="dialy-slider-control-row">
            <input type="range" id="dialy-slider-huong" class="dialy-range-slider" min="0" max="359.9" step="0.1" value="${deg}">
            <input type="number" id="dialy-input-huong" class="dialy-input-number" min="0" max="359.9" step="0.1" value="${deg.toFixed(1)}">
            <div class="dialy-step-group">
              <button type="button" class="dialy-deg-step-btn" data-step="-1">-1°</button>
              <button type="button" class="dialy-deg-step-btn" data-step="-0.5">-0.5°</button>
              <button type="button" class="dialy-deg-step-btn" data-step="0.5">+0.5°</button>
              <button type="button" class="dialy-deg-step-btn" data-step="1">+1°</button>
            </div>
          </div>

          <!-- Hàng 3: Thẻ Đối Sánh Nhất Thể (Master Parity Bar) Mỏng Nhẹ -->
          <div class="dialy-parity-bar ${isSongPhaiDacCach ? 'good' : (isPhamKhongVong ? 'warn' : 'neutral')}">
            <div class="dialy-parity-left">
              <span>${isSongPhaiDacCach ? '✨ Song Phái Cát Khí' : (isPhamKhongVong ? '⚠️ Tuyến Không Vong' : '⚖️ Khảo Sát')}</span>
              <span style="opacity: 0.85; font-weight: normal;">• ${pk120 ? pk120.can_chi : ''} | ${hkdq && hkdq.hexagram ? hkdq.hexagram.ten_que : ''}</span>
            </div>
            ${isPhamKhongVong && pk120.steering && pk120.steering.recommended_heading !== undefined ? `
              <div class="dialy-parity-right">
                <button type="button" class="dialy-btn-sm dialy-btn-primary dialy-btn-micro-steering" data-target-deg="${pk120.steering.recommended_heading}" style="font-size: 0.62rem; padding: 2px 7px; margin: 0;">
                  🎯 Nắn ${pk120.steering.delta_angle > 0 ? '+' : ''}${pk120.steering.delta_angle.toFixed(1)}°
                </button>
              </div>
            ` : ''}
          </div>

          <!-- Hàng 4: Segmented Tab Bar Siêu Nhẹ (iOS Style) -->
          <div class="dialy-tab-bar">
            <button type="button" id="dialy-tab-btn-tamhop" class="dialy-tab-btn ${state.curActiveTab === 'tamhop' ? 'active' : ''}">
              🌊 Tam Hợp &amp; DEM
            </button>
            <button type="button" id="dialy-tab-btn-hkdq" class="dialy-tab-btn ${state.curActiveTab === 'hkdq' ? 'active' : ''}">
              ☯️ Huyền Không Đại Quái
            </button>
          </div>
        </div>

        <!-- ================= NỘI DUNG CHÍNH (THEO TAB) ================= -->
        <div class="dialy-content-body">
          ${state.curActiveTab === 'tamhop' ? renderTamHopTabHtml({ deg, tkDeg, toaDeg, huongSon, toaSon, thuyPhap, pk120, thauDia72, xuyenSon60, xuyenSon72, tamSat, thaiTue, hoangTuyen, batSat, tamCat, tu28 }) : renderHkdqTabHtml({ deg, hkdq })}
        </div>
      </div>
    `;

    bindEvents();
  }

  // Render HTML cho Tab 1: Tam Hợp Phái & Địa Mạo DEM
  function renderTamHopTabHtml(data) {
    const { deg, tkDeg, toaDeg, huongSon, toaSon, thuyPhap, pk120, thauDia72, xuyenSon60, xuyenSon72, tamSat, thaiTue, hoangTuyen, batSat, tamCat, tu28 } = data;
    const vongTS = thuyPhap ? global.TamHopEngine.get_vong_truong_sinh(thuyPhap.cuc_name, thuyPhap.chieu_quay) : [];

    return `
      <!-- 1. THỦY PHÁP & ĐIỀU HƯỚNG THỦY KHẨU -->
      <div class="dialy-card-section">
        <div class="dialy-card-title">
          <span>🌊 1. Thủy Pháp &amp; Vòng Trường Sinh 12 Cung</span>
          <span class="dialy-badge ${thuyPhap && thuyPhap.the_cuc.includes('Cát') ? 'green' : 'gold'}">
            ${thuyPhap ? thuyPhap.the_cuc : ''}
          </span>
        </div>
        
        <div class="dialy-data-row">
          <span class="dialy-label">Cục Đất Phong Thủy:</span>
          <b class="dialy-cuc-dat" style="font-size: 0.85rem;">${thuyPhap ? thuyPhap.cuc_name : ''}</b>
        </div>

        <!-- Điều chỉnh Thủy Khẩu & Dòng Chảy -->
        <div class="dialy-thuykhau-box">
          <div style="display: flex; justify-content: space-between; font-size: 0.72rem; margin-bottom: 4px;">
            <span class="dialy-label">Phương Thủy Khẩu Thoát Nước:</span>
            <b class="dialy-thuykhau-deg">${tkDeg.toFixed(1)}° (${thuyPhap ? thuyPhap.thuy_khau.son_name : ''})</b>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <input type="range" id="dialy-slider-thuykhau" class="dialy-range-slider" min="0" max="359.9" step="0.5" value="${tkDeg}">
            <input type="number" id="dialy-input-thuykhau" class="dialy-input-number" min="0" max="359.9" step="0.5" value="${tkDeg.toFixed(1)}">
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
            <span class="dialy-label" style="font-size: 0.70rem;">Chiều Dòng Chảy:</span>
            <div class="dialy-flow-group">
              <button type="button" class="dialy-flow-btn ${state.curDongChay === 'ta_dao_huu' ? 'active' : ''}" id="dialy-btn-flow-ta">Tả → Hữu (Dương)</button>
              <button type="button" class="dialy-flow-btn ${state.curDongChay === 'huu_dao_ta' ? 'active' : ''}" id="dialy-btn-flow-huu">Hữu → Tả (Âm)</button>
            </div>
          </div>
        </div>

        <!-- Lưới 12 Cung Trường Sinh (3 Cột) -->
        <div class="dialy-vongts-grid">
          ${vongTS.map(ts => {
            const songSon = ts.song_son || '';
            const saoName = ts.cung_truong_sinh || ts.sao_name || '';
            const isHuong = huongSon && songSon.includes(huongSon);
            const isTK = thuyPhap && thuyPhap.thuy_khau && songSon.includes(thuyPhap.thuy_khau.son_name);
            const isGood = ['Trường Sinh', 'Quan Đới', 'Lâm Quan', 'Đế Vượng'].includes(saoName);
            return `
              <div class="dialy-vongts-cell ${isHuong ? 'is-huong' : ''} ${isTK ? 'is-thuykhau' : ''}">
                <div class="cell-title">${songSon}</div>
                <div class="cell-desc ${isGood ? 'good' : ''}">${saoName}</div>
                ${isHuong ? '<span class="cell-tag" style="color: #f59e0b;">[HƯỚNG]</span>' : ''}
                ${isTK ? '<span class="cell-tag" style="color: #0284c7;">[THỦY KHẨU]</span>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 2. 120 PHÂN KIM VI MÔ & THẨM ĐỊNH KHÍ TUYẾN -->
      <div class="dialy-card-section">
        <div class="dialy-card-title">
          <span>💎 2. 120 Phân Kim Vi Mô (${deg.toFixed(1)}°)</span>
          <span class="dialy-badge ${pk120 && pk120.duoc_phep_lay ? 'green' : 'red'}">
            ${pk120 ? pk120.tinh_chat.split('(')[0] : ''}
          </span>
        </div>

        <div class="dialy-data-row">
          <span class="dialy-label">Phân Kim &amp; Nạp Âm:</span>
          <strong class="dialy-value">${pk120 ? pk120.phan_kim_type : ''} • ${pk120 ? pk120.nap_am : ''}</strong>
        </div>

        ${pk120 && !pk120.duoc_phep_lay ? `
          <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 6px; padding: 6px 8px; margin: 6px 0;">
            <div style="font-size: 0.72rem; color: #f87171; font-weight: 700;">
              ⚠️ CẢNH BÁO: ${pk120.tinh_chat}
            </div>
            <div style="font-size: 0.68rem; color: #fca5a5; margin-top: 2px;">
              ${(pk120.steering && pk120.steering.warning) ? pk120.steering.warning : 'Cần nắn chỉnh phân kim sang cung Vượng / Tướng.'}
            </div>
            ${(pk120.steering && pk120.steering.recommended_heading !== undefined) ? `
              <button type="button" class="dialy-btn-micro-steering" data-target-deg="${pk120.steering.recommended_heading}">
                🎯 Nắn Vi Mô: Xoay ${pk120.steering.delta_angle > 0 ? '+' : ''}${pk120.steering.delta_angle.toFixed(1)}° Sang ${pk120.steering.target_phan_kim} (${pk120.steering.recommended_heading.toFixed(1)}° Cát)
              </button>
            ` : ''}
          </div>
        ` : `
          <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.25); border-radius: 6px; padding: 5px 8px; margin: 6px 0; font-size: 0.70rem; color: #4ade80;">
            ✨ Phân kim đắc khí cát lợi (${pk120 ? pk120.tinh_chat : ''}), âm dương tương phối.
          </div>
        `}

        <!-- 72 Thấu Địa Long & 60 Xuyên Sơn Long -->
        <div style="border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 6px; margin-top: 6px;">
          ${thauDia72 ? `
            <div class="dialy-data-row">
              <span class="dialy-label">72 Thấu Địa Long:</span>
              <strong style="color: ${thauDia72.is_bao_chau ? '#4ade80' : '#f87171'};">
                ${thauDia72.ten_long} • ${thauDia72.danh_gia}
              </strong>
            </div>
          ` : ''}

          ${xuyenSon60 ? `
            <div class="dialy-data-row">
              <span class="dialy-label">60 Xuyên Sơn Long:</span>
              <strong class="dialy-value">
                Long ${xuyenSon60.index_60}/60: ${xuyenSon60.can_chi} • ${xuyenSon60.khi}
              </strong>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- 3. BÁT LỘ HOÀNG TUYỀN & BÁT SÁT TIÊU VONG -->
      <div class="dialy-card-section">
        <div class="dialy-card-title">
          <span>⚠️ 3. Bát Lộ Hoàng Tuyền &amp; Sát Khí</span>
        </div>
        
        <div class="dialy-data-row">
          <span class="dialy-label">Hoàng Tuyền Sát:</span>
          <strong style="color: ${hoangTuyen && hoangTuyen.pham_sat ? '#f87171' : '#4ade80'};">
            ${hoangTuyen ? (hoangTuyen.pham_sat ? ('ĐẠI HUNG (' + (hoangTuyen.loai_sat || 'Hoàng Tuyền') + ')') : 'BÌNH (Không phạm)') : 'BÌNH'}
          </strong>
        </div>

        <div class="dialy-data-row">
          <span class="dialy-label">Bát Sát Cung Tọa:</span>
          <strong style="color: ${batSat && batSat.pham_bat_sat ? '#f87171' : '#4ade80'};">
            ${batSat ? batSat.danh_gia : ''}
          </strong>
        </div>

        <div class="dialy-data-row">
          <span class="dialy-label">Thái Tuế &amp; Tuế Phá:</span>
          <strong style="color: ${thaiTue && thaiTue.pham_tue_pha ? '#f87171' : '#cbd5e1'};">
            ${thaiTue ? thaiTue.danh_gia : ''}
          </strong>
        </div>
      </div>
    `;
  }

  // Render HTML cho Tab 2: Huyền Không Đại Quái (64 Quẻ & 384 Hào)
  function renderHkdqTabHtml(data) {
    const { deg, hkdq } = data;
    if (!hkdq || !hkdq.hexagram) {
      return `<div style="text-align: center; color: #94a3b8; padding: 20px;">Đang nạp dữ liệu Huyền Không Đại Quái...</div>`;
    }

    const hex = hkdq.hexagram;
    const curHao = hkdq.hao;
    const allHexes = global.HKDQ_CORE_DATA ? Object.values(global.HKDQ_CORE_DATA.hexagrams) : [];

    // Lọc theo Vận
    const filteredHexes = allHexes.filter(h => {
      if (state.curHkdqFilterVan !== 'all' && h.quai_van !== parseInt(state.curHkdqFilterVan, 10)) return false;
      return true;
    });

    return `
      <!-- 1. THÔNG SỐ QUẺ CHỦ THEO LA KINH -->
      <div class="dialy-card-section">
        <div class="dialy-card-title">
          <span>☯️ 1. Quẻ Chủ Đại Quái (${deg.toFixed(1)}°)</span>
          <span class="dialy-badge ${hex.la_kinh && hex.la_kinh.danh_gia_van_9.includes('Cát') ? 'green' : 'gold'}">
            ${hex.la_kinh ? hex.la_kinh.danh_gia_van_9 : ''}
          </span>
        </div>

        <div style="margin-bottom: 6px;">
          <div class="dialy-que-title" style="font-size: 1.05rem; font-weight: 800; color: #c084fc;">
            ${hex.ten_que} (${hex.ha_thuong_quai})
          </div>
          <div style="font-size: 0.68rem; color: #94a3b8;">
            Cung: <b>${hex.cung_bat_quai} (${hex.ngu_hanh_cung})</b> • STT La Kinh: <b>${hex.la_kinh ? hex.la_kinh.stt_la_kinh : ''}/64</b>
          </div>
        </div>

        <!-- Quái Khí, Quái Vận, Âm Dương (3 Cột) -->
        <div class="dialy-que-meta-grid">
          <div class="dialy-que-meta-item">
            <span class="dialy-label">Quái Khí</span>
            <div class="meta-val khi" style="color: #38bdf8;">${hex.quai_khi}</div>
          </div>
          <div class="dialy-que-meta-item">
            <span class="dialy-label">Quái Vận</span>
            <div class="meta-val van" style="color: #c084fc;">Vận ${hex.quai_van}</div>
          </div>
          <div class="dialy-que-meta-item">
            <span class="dialy-label">Âm Dương</span>
            <div class="meta-val amduong" style="color: #facc15;">${hex.la_kinh ? hex.la_kinh.am_duong : ''}</div>
          </div>
        </div>

        <div class="dialy-que-subbox">
          <div>Độ số: <b>${hex.la_kinh ? hex.la_kinh.deg_range : ''}</b> (${hex.la_kinh ? hex.la_kinh.son_24 : ''})</div>
          <div style="margin-top: 3px;">Tài lộc: <span class="dialy-tai-loc-text">${hex.la_kinh ? hex.la_kinh.tai_ton_info : ''}</span></div>
          <div style="margin-top: 5px; padding-top: 4px; border-top: 1px dashed rgba(255,255,255,0.15); display: flex; flex-direction: column; gap: 3px; font-size: 0.70rem;">
            <div>📅 <b>Ứng kỳ Năm phát:</b> <span class="dialy-nam-phat" style="color: #facc15; font-weight: 800;">Năm ${hex.nam_phat_mac_dinh || 'Đương Vận 9'}</span> <span style="font-size: 0.62rem; opacity: 0.75;">(Bài 14 - Hào Biến)</span></div>
            <div>👤 <b>Ứng nhân Được phát:</b> <span class="dialy-nguoi-phat" style="color: #4ade80; font-weight: 800;">Người tuổi ${hex.nguoi_phat_mac_dinh || 'Bản cung'}</span> <span style="font-size: 0.62rem; opacity: 0.75;">(Bài 15 - Quẻ gốc)</span></div>
          </div>
        </div>
      </div>

      <!-- 2. 384 HÀO PHÂN KIM VI MÔ (0.9375°/HÀO) -->
      <div class="dialy-card-section">
        <div class="dialy-card-title">
          <span>🎯 2. Hào Phân Kim Vi Mô (Hào ${curHao ? curHao.hao_index : '?'})</span>
          ${curHao ? `<span class="dialy-badge purple">${curHao.luc_than}</span>` : ''}
        </div>

        ${curHao ? (() => {
          const role = getHaoFengShuiRole(curHao.luc_than);
          const isHaoNamPhat = !!curHao.nam_phat;
          const isHaoNguoiPhat = !!curHao.nguoi_phat;
          return `
            <div class="dialy-hao-cur-card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <b class="hao-cur-title">Hào ${curHao.hao_index} • ${curHao.can_chi} (${curHao.luc_than})</b>
                <span class="dialy-label" style="font-weight: 700;">${curHao.deg_range}</span>
              </div>
              
              <!-- Đánh giá công năng Khai Môn & Kích Thủy (Khóa 2 Bài 1 & 5) -->
              <div class="hao-role-box ${role.isCat ? 'is-cat' : 'is-warn'}">
                <div class="role-box-title">${role.title}</div>
                <div class="role-box-desc">${role.advice}</div>
              </div>

              <!-- Ứng kỳ & Ứng nhân của Trạch (Từ CSDL Excel Thầy HNT) -->
              <div class="hao-meta-row">
                <span class="hao-meta-label">📅 Năm phát:</span>
                <span class="dialy-nam-phat">Năm ${hex.nam_phat_mac_dinh || 'Đương Vận 9'}</span>
                ${isHaoNamPhat ? `<span style="font-size: 0.60rem; color: #facc15; background: rgba(250,204,21,0.15); padding: 1px 4px; border-radius: 3px; font-weight: 700; margin-left: 4px;">⭐ Hào Biến</span>` : ''}
              </div>
              <div class="hao-meta-row">
                <span class="hao-meta-label">👤 Người phát:</span>
                <span class="dialy-nguoi-phat">Người tuổi ${hex.nguoi_phat_mac_dinh || 'Bản cung'}</span>
                ${isHaoNguoiPhat ? `<span style="font-size: 0.60rem; color: #4ade80; background: rgba(74,222,128,0.15); padding: 1px 4px; border-radius: 3px; font-weight: 700; margin-left: 4px;">⭐ Hào Ứng Nhân</span>` : ''}
              </div>
            </div>
          `;
        })() : ''}

        <!-- 6 Hào của Quẻ Chủ -->
        <div class="dialy-hao-list">
          ${(hex.haos || []).slice().reverse().map(h => {
            const isCur = curHao && curHao.hao_index === h.hao_index;
            const hRole = getHaoFengShuiRole(h.luc_than);
            const isHaoNam = !!h.nam_phat;
            const isHaoNguoi = !!h.nguoi_phat;
            return `
              <div class="dialy-hao-item ${isCur ? 'active' : ''}">
                <div style="flex: 1; min-width: 0;">
                  <div style="display: flex; justify-content: space-between; align-items: baseline;">
                    <span style="font-weight: 700; color: ${isCur ? '#c084fc' : '#cbd5e1'};">Hào ${h.hao_index}: ${h.can_chi} (${h.luc_than})</span>
                    <span class="dialy-label" style="margin-left: 6px;">${h.deg_range}</span>
                  </div>
                  <div style="font-size: 0.62rem; color: #94a3b8; margin-top: 2px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                    <span style="color: ${hRole.isCat ? '#4ade80' : '#fbbf24'}; font-weight: 700;">${hRole.title.split('&')[0].trim()}</span>
                    ${isHaoNam ? `<span style="color: #facc15; font-weight: 700; margin-left: 4px;">• ⭐ Hào Biến (Năm ${h.nam_phat})</span>` : ''}
                    ${isHaoNguoi ? `<span style="color: #60a5fa; font-weight: 700; margin-left: 4px;">• ⭐ Hào Ứng Nhân (Tuổi ${h.nguoi_phat})</span>` : ''}
                  </div>
                </div>
                <button type="button" class="dialy-btn-select-hao dialy-btn-sm" data-target-deg="${(h.deg_start + h.deg_end)/2}" style="font-size: 0.62rem; padding: 2px 7px; margin-left: 6px;">
                  Chọn
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 3. THẨM ĐỊNH PHỐI QUẺ BÍ TRUYỀN VẬN 9 -->
      <div class="dialy-card-section">
        <div class="dialy-card-title">
          <span>⚖️ 3. Thẩm Định Phối Quẻ Bí Truyền Vận 9</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 0.70rem;">
          <div class="dialy-parity-mini-card ${hkdq.is_hop_thap ? 'active' : ''}">
            <b>Hợp Thập (Cộng = 10):</b><br/>
            <span style="color: ${hkdq.is_hop_thap ? '#10b981' : '#94a3b8'}; font-weight: 700;">${hkdq.is_hop_thap ? 'ĐẮC CÁCH HỢP THẬP' : 'Không phạm'}</span>
          </div>

          <div class="dialy-parity-mini-card ${hkdq.is_tam_bat_dao_lu ? 'active' : ''}">
            <b>Tam Bát Đạo Lữ:</b><br/>
            <span style="color: ${hkdq.is_tam_bat_dao_lu ? '#10b981' : '#94a3b8'}; font-weight: 700;">${hkdq.is_tam_bat_dao_lu ? 'HỢP SINH THÀNH' : 'Không có'}</span>
          </div>
        </div>
      </div>

      <!-- 4. BẢNG TRA CỨU 64 QUẺ TOÀN ĐỒ (INTERACTIVE MATRIX) -->
      <div class="dialy-card-section">
        <div class="dialy-card-title">
          <span>📚 4. Ma Trận 64 Quẻ Toàn Đồ</span>
          <select id="dialy-filter-van" class="dialy-input-number" style="width: auto; padding: 2px 6px; font-size: 0.68rem;">
            <option value="all">Tất cả Vận</option>
            <option value="9" ${state.curHkdqFilterVan === '9' ? 'selected' : ''}>Vận 9 (Đương Vận)</option>
            <option value="1" ${state.curHkdqFilterVan === '1' ? 'selected' : ''}>Vận 1</option>
            <option value="2" ${state.curHkdqFilterVan === '2' ? 'selected' : ''}>Vận 2</option>
            <option value="3" ${state.curHkdqFilterVan === '3' ? 'selected' : ''}>Vận 3</option>
            <option value="4" ${state.curHkdqFilterVan === '4' ? 'selected' : ''}>Vận 4</option>
            <option value="6" ${state.curHkdqFilterVan === '6' ? 'selected' : ''}>Vận 6</option>
            <option value="7" ${state.curHkdqFilterVan === '7' ? 'selected' : ''}>Vận 7</option>
            <option value="8" ${state.curHkdqFilterVan === '8' ? 'selected' : ''}>Vận 8</option>
          </select>
        </div>

        <div class="dialy-matrix-grid">
          ${filteredHexes.map(h => {
            const isSelected = hex.id === h.id;
            const centerDeg = h.la_kinh ? (h.la_kinh.deg_start + h.la_kinh.deg_end)/2 : 0;
            return `
              <div class="dialy-matrix-item ${isSelected ? 'active' : ''}" data-target-deg="${centerDeg}">
                <div class="matrix-title" style="font-weight: 700; color: ${isSelected ? '#facc15' : '#cbd5e1'};">${h.ten_que}</div>
                <div class="dialy-label" style="font-size: 0.60rem;">Khí ${h.quai_khi} • Vận ${h.quai_van} • ${h.la_kinh ? h.la_kinh.son_24 : ''}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Gán sự kiện điều khiển
  function bindEvents() {
    const container = document.getElementById('view-dialy');
    if (!container) return;

    // Chuyển Tab
    const tabBtnTh = document.getElementById('dialy-tab-btn-tamhop');
    const tabBtnHk = document.getElementById('dialy-tab-btn-hkdq');
    if (tabBtnTh) {
      tabBtnTh.onclick = () => {
        state.curActiveTab = 'tamhop';
        render();
        const v = document.getElementById('view-dialy');
        if (v) v.scrollTop = 0;
      };
    }
    if (tabBtnHk) {
      tabBtnHk.onclick = () => {
        state.curActiveTab = 'hkdq';
        render();
        const v = document.getElementById('view-dialy');
        if (v) v.scrollTop = 0;
      };
    }


    // Slider & Input Hướng (Tối ưu phản hồi tức thì 120fps bằng RAF Throttle)
    const slH = document.getElementById('dialy-slider-huong');
    const inH = document.getElementById('dialy-input-huong');
    let rafHuongId = null;
    if (slH) {
      slH.oninput = (e) => {
        const val = parseFloat(e.target.value) || 0;
        state.curHuongDeg = val;
        if (inH) inH.value = val.toFixed(1);
        const valDegEl = container.querySelector('.dialy-val-deg');
        if (valDegEl) valDegEl.textContent = val.toFixed(1) + '°';
        if (rafHuongId) cancelAnimationFrame(rafHuongId);
        rafHuongId = requestAnimationFrame(() => {
          render();
        });
      };
    }
    if (inH) {
      inH.onchange = (e) => {
        state.curHuongDeg = parseFloat(e.target.value) || 0;
        render();
      };
    }

    // Nút vi chỉnh góc nhanh
    container.querySelectorAll('.dialy-deg-step-btn').forEach(btn => {
      btn.onclick = () => {
        const step = parseFloat(btn.dataset.step) || 0;
        state.curHuongDeg = normalizeDeg(state.curHuongDeg + step);
        render();
      };
    });

    // Cầu nối La Kinh: Lấy góc từ La Kinh
    const btnSyncLk = document.getElementById('dialy-btn-sync-lakinh');
    if (btnSyncLk) {
      btnSyncLk.onclick = () => {
        if (global.NetaLaKinhView && typeof global.NetaLaKinhView.getState === 'function') {
          const lkState = global.NetaLaKinhView.getState();
          if (typeof lkState.rotation === 'number') state.curHuongDeg = lkState.rotation;
          if (typeof lkState.tamHopThuyKhauDeg === 'number') state.curThuyKhauDeg = lkState.tamHopThuyKhauDeg;
          if (lkState.tamHopDongChay) state.curDongChay = lkState.tamHopDongChay;
          render();
          if (typeof showToast === 'function') showToast(`🔄 Đã đồng bộ hướng ${state.curHuongDeg.toFixed(1)}° từ La Kinh`);
        }
      };
    }

    // Cầu nối La Kinh: Áp sang La Kinh & Mở bản đồ
    const btnApplyLk = document.getElementById('dialy-btn-apply-lakinh');
    if (btnApplyLk) {
      btnApplyLk.onclick = () => {
        if (global.NetaLaKinhView && typeof global.NetaLaKinhView.getState === 'function') {
          const lkState = global.NetaLaKinhView.getState();
          lkState.rotation = state.curHuongDeg;
          lkState.tamHopThuyKhauDeg = state.curThuyKhauDeg;
          lkState.tamHopDongChay = state.curDongChay;
          if (typeof global.NetaLaKinhView.updateRotation === 'function') {
            global.NetaLaKinhView.updateRotation(state.curHuongDeg);
          }
        }
        if (typeof global.switchAppMode === 'function') {
          global.switchAppMode('lakinh');
        }
        if (typeof showToast === 'function') {
          showToast(`🎯 Đã áp dụng ${state.curHuongDeg.toFixed(1)}° sang La Kinh & Bản Đồ Vệ Tinh`);
        }
      };
    }

    // Tab Tam Hợp: Thủy khẩu slider & input (RAF Throttling)
    const slTk = document.getElementById('dialy-slider-thuykhau');
    const inTk = document.getElementById('dialy-input-thuykhau');
    let rafTkId = null;
    if (slTk) {
      slTk.oninput = (e) => {
        const val = parseFloat(e.target.value) || 0;
        state.curThuyKhauDeg = val;
        if (inTk) inTk.value = val.toFixed(1);
        if (rafTkId) cancelAnimationFrame(rafTkId);
        rafTkId = requestAnimationFrame(() => {
          render();
        });
      };
    }
    if (inTk) {
      inTk.onchange = (e) => {
        state.curThuyKhauDeg = parseFloat(e.target.value) || 0;
        render();
      };
    }

    // Tab Tam Hợp: Nút dòng chảy
    const btnFlowTa = document.getElementById('dialy-btn-flow-ta');
    const btnFlowHuu = document.getElementById('dialy-btn-flow-huu');
    if (btnFlowTa) {
      btnFlowTa.onclick = () => {
        state.curDongChay = 'ta_dao_huu';
        render();
      };
    }
    if (btnFlowHuu) {
      btnFlowHuu.onclick = () => {
        state.curDongChay = 'huu_dao_ta';
        render();
      };
    }

    // Tab Tam Hợp: Nút nắn hướng vi mô né Không Vong (Micro-Steering)
    container.querySelectorAll('.dialy-btn-micro-steering').forEach(btn => {
      btn.onclick = () => {
        const targetDeg = parseFloat(btn.dataset.targetDeg);
        if (!isNaN(targetDeg)) {
          state.curHuongDeg = targetDeg;
          render();
          if (typeof showToast === 'function') {
            showToast(`🎯 Đã nắn hướng vi mô sang: ${targetDeg.toFixed(1)}° (Cát Phân Kim)`);
          }
        }
      };
    });

    // Tab Đại Quái: Chọn hào
    container.querySelectorAll('.dialy-btn-select-hao').forEach(btn => {
      btn.onclick = () => {
        const targetDeg = parseFloat(btn.dataset.targetDeg);
        if (!isNaN(targetDeg)) {
          state.curHuongDeg = targetDeg;
          render();
        }
      };
    });

    // Tab Đại Quái: Lọc theo Vận
    const selFilterVan = document.getElementById('dialy-filter-van');
    if (selFilterVan) {
      selFilterVan.onchange = (e) => {
        state.curHkdqFilterVan = e.target.value;
        render();
      };
    }

    // Tab Đại Quái: Click quẻ trong ma trận 64 quẻ
    container.querySelectorAll('.dialy-matrix-item').forEach(item => {
      item.onclick = () => {
        const targetDeg = parseFloat(item.dataset.targetDeg);
        if (!isNaN(targetDeg)) {
          state.curHuongDeg = targetDeg;
          render();
        }
      };
    });
  }

  // Đối tượng Public API
  const NetaDiaLyView = {
    init: init,
    render: render,
    setHeading: (deg) => {
      state.curHuongDeg = normalizeDeg(deg);
      render();
    },
    getState: () => state
  };

  
  function injectFallbackStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('dialy-view-injected-styles')) return;
    const style = document.createElement('style');
    style.id = 'dialy-view-injected-styles';
    style.textContent = `/* ==========================================================================
   NETA LIGHT - ĐỊA LÝ KHẢO SÁT CHUYÊN SÂU (TAM HỢP & ĐẠI QUÁI) CSS
   Hỗ trợ 100% Giao diện Sáng (body.theme-light) & Tối (Dark Mode Mặc định)
   Tối ưu Mobile Ergonomics - Tương phản cực cao WCAG AAA - Cuộn siêu mượt 120fps
   ========================================================================== */

#view-dialy {
  width: 100%;
  max-width: 100%;
  flex: 1 1 0% !important;
  min-height: 0 !important;
  height: 100% !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  -webkit-overflow-scrolling: touch !important;
  touch-action: pan-y !important;
  scroll-behavior: auto !important; /* Bỏ smooth scroll để cuộn quán tính tự nhiên, siêu nhẹ */
  overscroll-behavior-y: contain;
  position: relative !important;
  box-sizing: border-box;
  background: radial-gradient(circle at 50% 10%, rgba(28, 16, 38, 0.7) 0%, rgba(12, 4, 14, 0.98) 100%);
  color: #f1f5f9;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  transform: translateZ(0); /* Kích hoạt tăng tốc GPU */
  will-change: scroll-position;
}

.dialy-workspace {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  min-height: 100%;
  box-sizing: border-box;
  padding-bottom: 100px;
}

/* ============================================================
   STICKY HEADER TỐI GIẢN (COMPACT HIGH-PERFORMANCE CONTROLLER)
   Không dùng backdrop-filter: blur để loại bỏ 100% hiện tượng tụt FPS
   ============================================================ */
.dialy-sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #180a1c; /* Nền solid chống lag */
  border-bottom: 1.5px solid rgba(245, 176, 65, 0.3);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
  padding: 6px 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  box-sizing: border-box;
  transform: translateZ(0);
}

/* Hàng 1: Hướng / Tọa & Cụm nút La Kinh / Chụp Dài */
.dialy-header-row-1 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
}

.dialy-heading-badge-group {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  font-size: 0.76rem;
  line-height: 1.2;
}

.dialy-heading-title {
  color: #cbd5e1;
  font-weight: 700;
}

.dialy-val-deg {
  color: #f5b041;
  font-size: 0.94rem;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.dialy-val-son {
  color: #facc15;
  font-weight: 800;
}

.dialy-val-toa {
  color: #94a3b8;
  font-size: 0.72rem;
  font-weight: 600;
}

/* Các nút hành động nhỏ gọn */
.dialy-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.dialy-btn-sm {
  padding: 4px 7px;
  border-radius: 6px;
  font-size: 0.68rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
  transition: background 0.15s ease, border-color 0.15s ease;
  user-select: none;
  touch-action: manipulation;
}

.dialy-btn-sm:active {
  transform: scale(0.96);
  background: rgba(245, 176, 65, 0.25);
  border-color: #f5b041;
  color: #facc15;
}

.dialy-btn-sm.dialy-btn-primary {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  border: 1px solid #f59e0b;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(217, 119, 6, 0.35);
}



/* Hàng 2: Slider & Vi Chỉnh Góc */
.dialy-slider-control-row {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(10, 4, 14, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 3px 6px;
}

.dialy-range-slider {
  flex: 1;
  height: 6px;
  accent-color: #f5b041;
  cursor: pointer;
}

.dialy-input-number {
  width: 52px;
  background: rgba(20, 8, 24, 0.9);
  border: 1.5px solid rgba(245, 176, 65, 0.5);
  border-radius: 5px;
  color: #facc15;
  font-weight: 800;
  font-size: 0.78rem;
  text-align: center;
  padding: 2px 3px;
  outline: none;
}

.dialy-input-number:focus {
  border-color: #facc15;
  box-shadow: 0 0 0 2px rgba(245, 176, 65, 0.3);
}

.dialy-step-group {
  display: flex;
  gap: 3px;
}

.dialy-deg-step-btn {
  padding: 3px 5px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 4px;
  color: #f1f5f9;
  font-size: 0.66rem;
  font-weight: 800;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
}

.dialy-deg-step-btn:active {
  background: #f59e0b;
  border-color: #facc15;
  color: #ffffff;
  transform: scale(0.95);
}

/* Hàng 3: Thẻ Đối Sánh Nhất Thể Mỏng Gọn */
.dialy-parity-bar {
  border-radius: 6px;
  padding: 4px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  font-size: 0.70rem;
  line-height: 1.3;
}

.dialy-parity-bar.good {
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid #22c55e;
  color: #86efac;
}

.dialy-parity-bar.warn {
  background: rgba(239, 68, 68, 0.18);
  border: 1px solid #ef4444;
  color: #fca5a5;
}

.dialy-parity-bar.neutral {
  background: rgba(245, 176, 65, 0.14);
  border: 1px solid #f59e0b;
  color: #fde047;
}

.dialy-parity-left {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dialy-parity-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

/* Hàng 4: Segmented Tab Bar */
.dialy-tab-bar {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: rgba(10, 4, 14, 0.7);
  padding: 3px;
  border-radius: 8px;
  gap: 3px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dialy-tab-btn {
  padding: 6px 8px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #cbd5e1;
  font-weight: 800;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  user-select: none;
  touch-action: manipulation;
}

.dialy-tab-btn.active {
  background: rgba(245, 176, 65, 0.22);
  color: #facc15;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(245, 176, 65, 0.45);
}

/* ============================================================
   CARD SECTIONS TRONG BODY
   ============================================================ */
.dialy-content-body {
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-sizing: border-box;
}

.dialy-card-section {
  background: rgba(26, 14, 32, 0.88);
  border: 1.5px solid rgba(245, 176, 65, 0.22);
  border-radius: 10px;
  padding: 10px 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
  content-visibility: auto;
}

.dialy-card-title {
  font-size: 0.84rem;
  font-weight: 800;
  color: #f5b041;
  letter-spacing: 0.3px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 6px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dialy-data-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.76rem;
  padding: 3px 0;
  color: #cbd5e1;
}

.dialy-data-row .dialy-label {
  color: #94a3b8;
  font-weight: 600;
}

.dialy-data-row .dialy-value {
  font-weight: 800;
  color: #f8fafc;
}

/* Badges */
.dialy-badge {
  font-size: 0.66rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  line-height: 1.2;
}

.dialy-badge.green {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
  border: 1px solid #22c55e;
}

.dialy-badge.red {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid #ef4444;
}

.dialy-badge.gold {
  background: rgba(245, 176, 65, 0.2);
  color: #facc15;
  border: 1px solid #f59e0b;
}

.dialy-badge.purple {
  background: rgba(192, 132, 252, 0.2);
  color: #d8b4fe;
  border: 1px solid #c084fc;
}

/* Thủy Khẩu & Dòng Chảy Box */
.dialy-thuykhau-box {
  background: rgba(10, 4, 14, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 10px;
  margin: 6px 0;
}

.dialy-flow-group {
  display: flex;
  gap: 6px;
}

.dialy-flow-btn {
  flex: 1;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: #cbd5e1;
  font-size: 0.70rem;
  font-weight: 800;
  padding: 6px 8px;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  text-align: center;
}

.dialy-flow-btn.active {
  background: rgba(245, 176, 65, 0.25);
  border-color: #f5b041;
  color: #facc15;
}

/* Lưới 12 Cung Trường Sinh (3 Cột) */
.dialy-vongts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
  margin-top: 6px;
}

.dialy-vongts-cell {
  background: rgba(15, 6, 20, 0.7);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 6px 4px;
  text-align: center;
  font-size: 0.70rem;
  line-height: 1.25;
}

.dialy-vongts-cell.is-huong {
  background: rgba(245, 176, 65, 0.22);
  border-color: #f5b041;
}

.dialy-vongts-cell.is-thuykhau {
  background: rgba(56, 189, 248, 0.22);
  border-color: #38bdf8;
}

.dialy-vongts-cell .cell-title {
  font-weight: 800;
  color: #f1f5f9;
}

.dialy-vongts-cell.is-huong .cell-title {
  color: #facc15;
}

.dialy-vongts-cell.is-thuykhau .cell-title {
  color: #38bdf8;
}

.dialy-vongts-cell .cell-desc {
  font-weight: 700;
  color: #94a3b8;
  margin-top: 2px;
}

.dialy-vongts-cell .cell-desc.good {
  color: #4ade80;
}

.dialy-vongts-cell .cell-tag {
  font-size: 0.60rem;
  font-weight: 800;
  display: block;
  margin-top: 2px;
}

/* Nút Nắn Hướng Vi Mô Cải Tiến */
.dialy-btn-micro-steering {
  width: 100%;
  padding: 8px 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  font-weight: 800;
  font-size: 0.76rem;
  border: 1px solid #34d399;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);
  margin-top: 6px;
  user-select: none;
  touch-action: manipulation;
}

.dialy-btn-micro-steering:active {
  transform: scale(0.98);
}

/* Quẻ Chủ 3 Cột */
.dialy-que-meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  font-size: 0.72rem;
  text-align: center;
  margin: 6px 0;
}

.dialy-que-meta-item {
  background: rgba(10, 4, 14, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 6px 4px;
}

.dialy-que-meta-item .meta-val {
  font-size: 1.08rem;
  font-weight: 900;
  margin-top: 2px;
}

.dialy-que-subbox {
  font-size: 0.72rem;
  color: #cbd5e1;
  background: rgba(10, 4, 14, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 6px 8px;
  border-radius: 6px;
  line-height: 1.4;
}

.dialy-tai-loc-text {
  color: #4ade80;
  font-weight: 700;
}

/* Lưới Hào 6 Phân Kim */
/* Card Hào Phân Kim Hiện Tại (Vi Mô) */
.dialy-hao-cur-card {
  background: rgba(192, 132, 252, 0.1);
  border: 1px solid rgba(192, 132, 252, 0.35);
  border-radius: 6px;
  padding: 8px 10px;
  margin-bottom: 8px;
}

.dialy-hao-cur-card .hao-cur-title {
  color: #c084fc;
  font-weight: 800;
  font-size: 0.76rem;
}

.dialy-hao-cur-card .hao-meta-row {
  display: flex;
  gap: 6px;
  font-size: 0.70rem;
  line-height: 1.4;
  margin-top: 3px;
}

.dialy-hao-cur-card .hao-meta-label {
  color: #94a3b8;
  font-weight: 600;
  min-width: 72px;
  flex-shrink: 0;
}

.dialy-hao-cur-card .dialy-nam-phat {
  color: #facc15;
  font-weight: 700;
}

.dialy-hao-cur-card .dialy-nguoi-phat {
  color: #4ade80;
  font-weight: 700;
}

/* Hộp Đánh Giá Công Năng Phong Thủy của Hào */
.hao-role-box {
  font-size: 0.70rem;
  margin: 6px 0;
  padding: 6px 8px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 5px;
  border-left: 3.5px solid #64748b;
}

.hao-role-box.is-cat {
  border-left-color: #10b981;
}

.hao-role-box.is-cat .role-box-title {
  color: #4ade80;
  font-weight: 800;
}

.hao-role-box.is-warn {
  border-left-color: #f59e0b;
}

.hao-role-box.is-warn .role-box-title {
  color: #fbbf24;
  font-weight: 800;
}

.hao-role-box .role-box-desc {
  color: #cbd5e1;
  font-size: 0.66rem;
  margin-top: 2px;
  line-height: 1.35;
}

/* Danh Sách 6 Hào */
.dialy-hao-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 6px;
}

.dialy-hao-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(10, 4, 14, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 0.72rem;
}

.dialy-hao-item.active {
  background: rgba(192, 132, 252, 0.2);
  border-color: #c084fc;
}

.dialy-parity-mini-card {
  background: rgba(10, 4, 14, 0.6);
  padding: 6px 8px;
  border-radius: 6px;
  border-left: 3.5px solid #64748b;
  font-size: 0.72rem;
}

.dialy-parity-mini-card.active {
  border-left-color: #10b981;
}

/* Ma Trận 64 Quẻ */
.dialy-matrix-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 5px;
  max-height: 240px;
  overflow-y: auto;
  margin-top: 6px;
  padding-right: 2px;
}

.dialy-matrix-item {
  background: rgba(10, 4, 14, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 5px 6px;
  cursor: pointer;
  font-size: 0.70rem;
  user-select: none;
  touch-action: manipulation;
}

.dialy-matrix-item.active {
  background: rgba(245, 176, 65, 0.25);
  border-color: #f5b041;
}

/* ==========================================================================
   GIAO DIỆN SÁNG (THEME-LIGHT) - ĐỘ TƯƠNG PHẢN CỰC CAO (WCAG AAA)
   Đặc trị màn hình chói sáng, loại bỏ hoàn toàn chữ mờ / vàng nhạt / xám nhạt
   ========================================================================== */
body.theme-light #view-dialy {
  background: radial-gradient(circle at 50% 10%, #fdfbf7 0%, #f4ede1 55%, #e8dcce 100%) !important;
  color: #0f172a !important;
}

body.theme-light .dialy-sticky-header {
  background: #fdfbf7 !important; /* Nền solid giấy hoàng gia, siêu nét, 0% blur lag */
  border-bottom: 2px solid rgba(180, 83, 9, 0.3) !important;
  box-shadow: 0 3px 12px rgba(120, 60, 10, 0.1) !important;
}

body.theme-light .dialy-heading-title {
  color: #0f172a !important;
  font-weight: 800 !important;
}

body.theme-light .dialy-val-deg {
  color: #9a3412 !important; /* Cam đỏ hổ phách đậm */
  font-weight: 900 !important;
}

body.theme-light .dialy-val-son {
  color: #78350f !important; /* Nâu đồng đậm */
  font-weight: 900 !important;
}

body.theme-light .dialy-val-toa {
  color: #334155 !important; /* Xám than đậm */
  font-weight: 700 !important;
}

body.theme-light .dialy-btn-sm {
  background: #ffffff !important;
  border: 1.5px solid #94a3b8 !important;
  color: #0f172a !important;
  font-weight: 800 !important;
}

body.theme-light .dialy-btn-sm:active {
  background: #fef3c7 !important;
  border-color: #b45309 !important;
  color: #92400e !important;
}

body.theme-light .dialy-btn-sm.dialy-btn-primary {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%) !important;
  border: 1.5px solid #92400e !important;
  color: #ffffff !important;
  box-shadow: 0 2px 6px rgba(180, 83, 9, 0.35) !important;
}



body.theme-light .dialy-slider-control-row {
  background: #ffffff !important;
  border: 1.5px solid #cbd5e1 !important;
}

body.theme-light .dialy-range-slider {
  accent-color: #b45309 !important;
}

body.theme-light .dialy-input-number {
  background: #ffffff !important;
  border: 2px solid #b45309 !important;
  color: #78350f !important;
  font-weight: 900 !important;
}

body.theme-light .dialy-deg-step-btn {
  background: #f8fafc !important;
  border: 1.5px solid #94a3b8 !important;
  color: #0f172a !important;
  font-weight: 800 !important;
}

body.theme-light .dialy-deg-step-btn:active {
  background: #b45309 !important;
  color: #ffffff !important;
}

/* Parity Bar Light */
body.theme-light .dialy-parity-bar.good {
  background: #ecfdf5 !important;
  border: 1.5px solid #059669 !important;
  color: #064e3b !important;
  font-weight: 800 !important;
}

body.theme-light .dialy-parity-bar.warn {
  background: #fef2f2 !important;
  border: 1.5px solid #dc2626 !important;
  color: #7f1d1d !important;
  font-weight: 800 !important;
}

body.theme-light .dialy-parity-bar.neutral {
  background: #fefce8 !important;
  border: 1.5px solid #d97706 !important;
  color: #78350f !important;
  font-weight: 800 !important;
}

/* Tab Bar Light */
body.theme-light .dialy-tab-bar {
  background: #e2e8f0 !important;
  border: 1.5px solid #cbd5e1 !important;
}

body.theme-light .dialy-tab-btn {
  color: #475569 !important;
  font-weight: 800 !important;
}

body.theme-light .dialy-tab-btn.active {
  background: #ffffff !important;
  color: #78350f !important;
  border: 1.5px solid #b45309 !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12) !important;
}

/* Card Section Light */
body.theme-light .dialy-card-section {
  background: #ffffff !important;
  border: 1.5px solid rgba(180, 83, 9, 0.25) !important;
  box-shadow: 0 2px 10px rgba(120, 60, 10, 0.08) !important;
}

body.theme-light .dialy-card-title {
  color: #78350f !important;
  font-weight: 900 !important;
  border-bottom: 1.5px solid #f1f5f9 !important;
}

body.theme-light .dialy-data-row {
  color: #0f172a !important;
}

body.theme-light .dialy-data-row .dialy-label {
  color: #334155 !important;
  font-weight: 700 !important;
}

body.theme-light .dialy-data-row .dialy-value {
  color: #0f172a !important;
  font-weight: 900 !important;
}

/* Tên Quẻ Chủ & Quái Vận Trong Light Mode (High-Contrast AAA) */
body.theme-light .dialy-que-title {
  color: #581c87 !important; /* Tím hoàng gia cực đậm */
  font-weight: 900 !important;
}

body.theme-light .dialy-que-meta-item {
  background: #f8fafc !important;
  border: 1.5px solid #cbd5e1 !important;
}

body.theme-light .dialy-que-meta-item .meta-val.khi {
  color: #0369a1 !important; /* Xanh navy đậm */
}

body.theme-light .dialy-que-meta-item .meta-val.van {
  color: #6b21a8 !important; /* Tím than đậm */
}

body.theme-light .dialy-que-meta-item .meta-val.amduong {
  color: #9a3412 !important; /* Cam hổ phách đậm */
}

body.theme-light .dialy-que-subbox {
  background: #f8fafc !important;
  border: 1.5px solid #cbd5e1 !important;
  color: #0f172a !important;
}

body.theme-light .dialy-tai-loc-text {
  color: #15803d !important; /* Xanh lục đậm nét */
  font-weight: 800 !important;
}

/* Danh Sách Hào Trong Light Mode (Đen Mực Nét 100%) */
body.theme-light .dialy-hao-item {
  background: #ffffff !important;
  border: 1.5px solid #cbd5e1 !important;
  color: #0f172a !important;
}

body.theme-light .dialy-hao-item span:first-child {
  color: #0f172a !important;
  font-weight: 800 !important;
}

body.theme-light .dialy-hao-item .dialy-label {
  color: #334155 !important;
  font-weight: 700 !important;
}

body.theme-light .dialy-hao-item.active {
  background: #faf5ff !important;
  border-color: #a855f7 !important;
}

body.theme-light .dialy-hao-item.active span:first-child {
  color: #581c87 !important;
}

body.theme-light .dialy-hao-cur-card {
  background: #faf5ff !important;
  border: 1.5px solid #c084fc !important;
}

body.theme-light .dialy-hao-cur-card b {
  color: #581c87 !important;
}

body.theme-light .dialy-nam-phat {
  color: #78350f !important;
}

body.theme-light .dialy-nguoi-phat {
  color: #15803d !important;
}

/* 12 Cung Trường Sinh Light Mode */
body.theme-light .dialy-vongts-cell {
  background: #ffffff !important;
  border: 1.5px solid #cbd5e1 !important;
}

body.theme-light .dialy-vongts-cell .cell-title {
  color: #0f172a !important;
  font-weight: 900 !important;
}

body.theme-light .dialy-vongts-cell .cell-desc {
  color: #334155 !important;
  font-weight: 700 !important;
}

body.theme-light .dialy-vongts-cell .cell-desc.good {
  color: #14532d !important; /* Xanh rừng đậm */
  font-weight: 900 !important;
}

body.theme-light .dialy-vongts-cell.is-huong {
  background: #fef3c7 !important;
  border-color: #d97706 !important;
}

body.theme-light .dialy-vongts-cell.is-huong .cell-title {
  color: #78350f !important;
}

body.theme-light .dialy-vongts-cell.is-huong .cell-desc {
  color: #14532d !important;
}

body.theme-light .dialy-vongts-cell.is-huong .cell-tag {
  color: #b45309 !important;
}

body.theme-light .dialy-vongts-cell.is-thuykhau {
  background: #e0f2fe !important;
  border-color: #0284c7 !important;
}

body.theme-light .dialy-vongts-cell.is-thuykhau .cell-title {
  color: #0369a1 !important;
}

body.theme-light .dialy-vongts-cell.is-thuykhau .cell-tag {
  color: #0369a1 !important;
}

/* Thủy Khẩu & Flow Light */
body.theme-light .dialy-thuykhau-box {
  background: #f8fafc !important;
  border: 1.5px solid #cbd5e1 !important;
}

body.theme-light .dialy-cuc-dat {
  color: #0369a1 !important;
  font-weight: 900 !important;
}

body.theme-light .dialy-thuykhau-deg {
  color: #78350f !important;
  font-weight: 900 !important;
}

body.theme-light .dialy-flow-btn {
  background: #ffffff !important;
  border: 1.5px solid #94a3b8 !important;
  color: #0f172a !important;
}

body.theme-light .dialy-flow-btn.active {
  background: #fef3c7 !important;
  border-color: #b45309 !important;
  color: #78350f !important;
}

/* Parity Mini Cards Light */
body.theme-light .dialy-parity-mini-card {
  background: #f8fafc !important;
  border: 1.5px solid #cbd5e1 !important;
  color: #0f172a !important;
}

body.theme-light .dialy-parity-mini-card.active {
  background: #ecfdf5 !important;
  border-left-color: #059669 !important;
}

body.theme-light .dialy-parity-mini-card b {
  color: #0f172a !important;
}

/* Ma Trận 64 Quẻ Light */
body.theme-light .dialy-matrix-item {
  background: #ffffff !important;
  border: 1.5px solid #cbd5e1 !important;
  color: #0f172a !important;
}

body.theme-light .dialy-matrix-item.active {
  background: #fef3c7 !important;
  border-color: #b45309 !important;
}

body.theme-light .dialy-matrix-item.active .matrix-title {
  color: #78350f !important;
  font-weight: 900 !important;
}

/* Light Theme Cho Card Hào Vi Mô Hiện Tại */
body.theme-light .dialy-hao-cur-card {
  background: #fdf4ff !important;
  border: 1.5px solid #d8b4fe !important;
}

body.theme-light .dialy-hao-cur-card .hao-cur-title {
  color: #581c87 !important;
}

body.theme-light .dialy-hao-cur-card .hao-meta-label {
  color: #475569 !important;
  font-weight: 700 !important;
}

body.theme-light .dialy-hao-cur-card .dialy-nam-phat {
  color: #b45309 !important; /* Hổ phách đậm tương phản WCAG AAA */
  font-weight: 800 !important;
}

body.theme-light .dialy-hao-cur-card .dialy-nguoi-phat {
  color: #15803d !important; /* Xanh lục đậm tương phản WCAG AAA */
  font-weight: 800 !important;
}

body.theme-light .dialy-hao-item .hao-sub-ung-nam {
  color: #b45309 !important;
}

body.theme-light .dialy-hao-item .hao-sub-ung-nguoi {
  color: #15803d !important;
}

/* Light Theme Cho Hào Role Box */
body.theme-light .hao-role-box {
  background: #ffffff !important;
  border: 1.5px solid #cbd5e1 !important;
  border-left-width: 4px !important;
}

body.theme-light .hao-role-box.is-cat {
  background: #f0fdf4 !important;
  border-color: #bbf7d0 !important;
  border-left-color: #15803d !important;
}

body.theme-light .hao-role-box.is-cat .role-box-title {
  color: #14532d !important;
}

body.theme-light .hao-role-box.is-warn {
  background: #fefce8 !important;
  border-color: #fef08a !important;
  border-left-color: #b45309 !important;
}

body.theme-light .hao-role-box.is-warn .role-box-title {
  color: #78350f !important;
}

body.theme-light .hao-role-box .role-box-desc {
  color: #1e293b !important;
  font-weight: 600 !important;
}


`;
    document.head.appendChild(style);
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectFallbackStyles);
    } else {
      injectFallbackStyles();
    }
  }

  global.NetaDiaLyView = NetaDiaLyView;
  global.NetaDiaLy = NetaDiaLyView;

})(typeof window !== 'undefined' ? window : this);
