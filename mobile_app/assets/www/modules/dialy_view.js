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
          
          <!-- Hàng 1: Hướng / Tọa & Cụm nút đồng bộ La Kinh -->
          <div class="dialy-header-row-1">
            <div class="dialy-heading-badge-group">
              <span class="dialy-heading-title">🧭 Hướng:</span>
              <span class="dialy-val-deg">${deg.toFixed(1)}°</span>
              <span class="dialy-val-son">(${huongSon})</span>
              <span class="dialy-val-toa">• Tọa: ${toaDeg.toFixed(1)}° (${toaSon})</span>
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
          <b style="color: #38bdf8; font-size: 0.85rem;">${thuyPhap ? thuyPhap.cuc_name : ''}</b>
        </div>

        <!-- Điều chỉnh Thủy Khẩu & Dòng Chảy -->
        <div class="dialy-thuykhau-box">
          <div style="display: flex; justify-content: space-between; font-size: 0.72rem; margin-bottom: 4px;">
            <span class="dialy-label">Phương Thủy Khẩu Thoát Nước:</span>
            <b style="color: #facc15;">${tkDeg.toFixed(1)}° (${thuyPhap ? thuyPhap.thuy_khau.son_name : ''})</b>
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
          <div style="font-size: 1.05rem; font-weight: 800; color: #c084fc;">
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
            <div class="meta-val" style="color: #38bdf8;">${hex.quai_khi}</div>
          </div>
          <div class="dialy-que-meta-item">
            <span class="dialy-label">Quái Vận</span>
            <div class="meta-val" style="color: #c084fc;">Vận ${hex.quai_van}</div>
          </div>
          <div class="dialy-que-meta-item">
            <span class="dialy-label">Âm Dương</span>
            <div class="meta-val" style="color: #facc15;">${hex.la_kinh ? hex.la_kinh.am_duong : ''}</div>
          </div>
        </div>

        <div class="dialy-que-subbox">
          Độ số: <b>${hex.la_kinh ? hex.la_kinh.deg_range : ''}</b> (${hex.la_kinh ? hex.la_kinh.son_24 : ''})<br/>
          Tài lộc: <span class="dialy-tai-loc-text">${hex.la_kinh ? hex.la_kinh.tai_ton_info : ''}</span>
        </div>
      </div>

      <!-- 2. 384 HÀO PHÂN KIM VI MÔ (0.9375°/HÀO) -->
      <div class="dialy-card-section">
        <div class="dialy-card-title">
          <span>🎯 2. Hào Phân Kim Vi Mô (Hào ${curHao ? curHao.hao_index : '?'})</span>
          ${curHao ? `<span class="dialy-badge purple">${curHao.luc_than}</span>` : ''}
        </div>

        ${curHao ? `
          <div style="background: rgba(192, 132, 252, 0.1); border: 1px solid rgba(192, 132, 252, 0.3); border-radius: 6px; padding: 6px 8px; margin-bottom: 6px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; margin-bottom: 2px;">
              <b style="color: #c084fc;">Hào ${curHao.hao_index} • ${curHao.can_chi}</b>
              <span class="dialy-label">${curHao.deg_range}</span>
            </div>
            <div style="display: flex; gap: 8px; font-size: 0.68rem; color: #94a3b8;">
              <span>Năm phát: <b style="color: #facc15;">${curHao.nam_phat || 'Chưa định'}</b></span>
              <span>Người phát: <b style="color: #4ade80;">${curHao.nguoi_phat || 'Chưa định'}</b></span>
            </div>
          </div>
        ` : ''}

        <!-- 6 Hào của Quẻ Chủ -->
        <div class="dialy-hao-list">
          ${(hex.haos || []).slice().reverse().map(h => {
            const isCur = curHao && curHao.hao_index === h.hao_index;
            return `
              <div class="dialy-hao-item ${isCur ? 'active' : ''}">
                <span style="font-weight: 700; color: ${isCur ? '#c084fc' : '#cbd5e1'};">Hào ${h.hao_index}: ${h.can_chi} (${h.luc_than})</span>
                <span class="dialy-label">${h.deg_range}</span>
                <button type="button" class="dialy-btn-select-hao dialy-btn-sm" data-target-deg="${(h.deg_start + h.deg_end)/2}" style="font-size: 0.62rem; padding: 1px 6px;">
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

    // Slider & Input Hướng
    const slH = document.getElementById('dialy-slider-huong');
    const inH = document.getElementById('dialy-input-huong');
    if (slH) {
      slH.oninput = (e) => {
        state.curHuongDeg = parseFloat(e.target.value) || 0;
        render();
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

    // Tab Tam Hợp: Thủy khẩu slider & input
    const slTk = document.getElementById('dialy-slider-thuykhau');
    const inTk = document.getElementById('dialy-input-thuykhau');
    if (slTk) {
      slTk.oninput = (e) => {
        state.curThuyKhauDeg = parseFloat(e.target.value) || 0;
        render();
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
   Thiết kế Mobile-First Ergonomics - Siêu mỏng nhẹ - Chống tràn & Cuộn mượt mà
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
  scroll-behavior: smooth;
  position: relative !important;
  box-sizing: border-box;
  background: radial-gradient(circle at 50% 10%, rgba(28, 16, 38, 0.7) 0%, rgba(12, 4, 14, 0.98) 100%);
  color: #f1f5f9;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  transition: background 0.25s ease, color 0.25s ease;
}

.dialy-workspace {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  min-height: 100%;
  box-sizing: border-box;
  padding-bottom: 90px;
}

/* ============================================================
   STICKY HEADER TỐI GIẢN (COMPACT SLIM CONTROLLER)
   ============================================================ */
.dialy-sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(18, 8, 22, 0.94);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(245, 176, 65, 0.25);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  padding: 8px 10px 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-sizing: border-box;
}

/* Hàng 1: Hướng / Tọa & Cụm nút La Kinh */
.dialy-header-row-1 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
}

.dialy-heading-badge-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 0.76rem;
  line-height: 1.2;
}

.dialy-heading-title {
  color: #cbd5e1;
  font-weight: 600;
}

.dialy-val-deg {
  color: #f5b041;
  font-size: 0.92rem;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.dialy-val-son {
  color: #facc15;
  font-weight: 700;
}

.dialy-val-toa {
  color: #94a3b8;
  font-size: 0.72rem;
}

/* Các nút hành động nhỏ gọn */
.dialy-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.dialy-btn-sm {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.68rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
  transition: all 0.2s ease;
  user-select: none;
  touch-action: manipulation;
}

.dialy-btn-sm:hover,
.dialy-btn-sm:active {
  background: rgba(245, 176, 65, 0.18);
  border-color: #f5b041;
  color: #facc15;
}

.dialy-btn-sm.dialy-btn-primary {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  border: 1px solid #f59e0b;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(217, 119, 6, 0.35);
}

.dialy-btn-sm.dialy-btn-primary:active {
  transform: scale(0.97);
}

/* Hàng 2: Slider & Vi Chỉnh Góc */
.dialy-slider-control-row {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(10, 4, 14, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 4px 6px;
}

.dialy-range-slider {
  flex: 1;
  height: 4px;
  accent-color: #f5b041;
  cursor: pointer;
}

.dialy-input-number {
  width: 50px;
  background: rgba(20, 8, 24, 0.8);
  border: 1px solid rgba(245, 176, 65, 0.4);
  border-radius: 5px;
  color: #facc15;
  font-weight: 800;
  font-size: 0.76rem;
  text-align: center;
  padding: 2px 3px;
  outline: none;
}

.dialy-input-number:focus {
  border-color: #facc15;
  box-shadow: 0 0 0 2px rgba(245, 176, 65, 0.25);
}

.dialy-step-group {
  display: flex;
  gap: 3px;
}

.dialy-deg-step-btn {
  padding: 2px 5px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  color: #cbd5e1;
  font-size: 0.65rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
  touch-action: manipulation;
}

.dialy-deg-step-btn:active {
  background: rgba(245, 176, 65, 0.25);
  border-color: #f5b041;
  color: #facc15;
  transform: scale(0.95);
}

/* Hàng 3: Thẻ Đối Sánh Nhất Thể (Master Parity Bar) Mỏng Gọn */
.dialy-parity-bar {
  border-radius: 6px;
  padding: 4px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  font-size: 0.68rem;
  line-height: 1.3;
  transition: all 0.2s ease;
}

.dialy-parity-bar.good {
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.35);
  color: #86efac;
}

.dialy-parity-bar.warn {
  background: rgba(239, 68, 68, 0.14);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
}

.dialy-parity-bar.neutral {
  background: rgba(245, 176, 65, 0.1);
  border: 1px solid rgba(245, 176, 65, 0.3);
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

/* Hàng 4: Segmented Tab Bar Siêu Nhẹ (iOS Style) */
.dialy-tab-bar {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: rgba(10, 4, 14, 0.6);
  padding: 3px;
  border-radius: 8px;
  gap: 3px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.dialy-tab-btn {
  padding: 5px 8px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #94a3b8;
  font-weight: 700;
  font-size: 0.74rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  user-select: none;
  touch-action: manipulation;
}

.dialy-tab-btn.active {
  background: rgba(245, 176, 65, 0.18);
  color: #facc15;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(245, 176, 65, 0.35);
}

.dialy-parity-mini-card {
  background: rgba(10, 4, 14, 0.5);
  padding: 6px 8px;
  border-radius: 6px;
  border-left: 3px solid #64748b;
  font-size: 0.70rem;
}

.dialy-parity-mini-card.active {
  border-left-color: #10b981;
}

/* ============================================================
   CARD SECTIONS TRONG BODY NỘI DUNG
   ============================================================ */
.dialy-content-body {
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-sizing: border-box;
}

.dialy-card-section {
  background: rgba(26, 14, 32, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(245, 176, 65, 0.18);
  border-radius: 10px;
  padding: 10px 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
}

.dialy-card-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #f5b041;
  letter-spacing: 0.3px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
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
  font-size: 0.74rem;
  padding: 3px 0;
  color: #cbd5e1;
}

.dialy-data-row .dialy-label {
  color: #94a3b8;
}

.dialy-data-row .dialy-value {
  font-weight: 700;
  color: #f8fafc;
}

/* Badges */
.dialy-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 12px;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  line-height: 1.2;
}

.dialy-badge.green {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.35);
}

.dialy-badge.red {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.35);
}

.dialy-badge.gold {
  background: rgba(245, 176, 65, 0.15);
  color: #facc15;
  border: 1px solid rgba(245, 176, 65, 0.35);
}

.dialy-badge.purple {
  background: rgba(192, 132, 252, 0.15);
  color: #d8b4fe;
  border: 1px solid rgba(192, 132, 252, 0.35);
}

/* Thủy Khẩu & Dòng Chảy Box */
.dialy-thuykhau-box {
  background: rgba(10, 4, 14, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
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
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  color: #94a3b8;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 5px 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  touch-action: manipulation;
  text-align: center;
}

.dialy-flow-btn.active {
  background: rgba(245, 176, 65, 0.2);
  border-color: #f5b041;
  color: #facc15;
}

/* Lưới 12 Cung Trường Sinh (3 Cột) */
.dialy-vongts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  margin-top: 6px;
}

.dialy-vongts-cell {
  background: rgba(15, 6, 20, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 5px 4px;
  text-align: center;
  font-size: 0.68rem;
  line-height: 1.25;
  transition: all 0.15s ease;
}

.dialy-vongts-cell.is-huong {
  background: rgba(245, 176, 65, 0.18);
  border-color: #f5b041;
}

.dialy-vongts-cell.is-thuykhau {
  background: rgba(56, 189, 248, 0.18);
  border-color: #38bdf8;
}

.dialy-vongts-cell .cell-title {
  font-weight: 700;
  color: #cbd5e1;
}

.dialy-vongts-cell.is-huong .cell-title {
  color: #facc15;
}

.dialy-vongts-cell.is-thuykhau .cell-title {
  color: #38bdf8;
}

.dialy-vongts-cell .cell-desc {
  font-weight: 600;
  color: #94a3b8;
  margin-top: 2px;
}

.dialy-vongts-cell .cell-desc.good {
  color: #4ade80;
}

.dialy-vongts-cell .cell-tag {
  font-size: 0.58rem;
  font-weight: 800;
  display: block;
  margin-top: 2px;
}

/* Nút Nắn Hướng Vi Mô Cải Tiến (Micro-Steering) */
.dialy-btn-micro-steering {
  width: 100%;
  padding: 8px 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.74rem;
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
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 6px 4px;
}

.dialy-que-meta-item .meta-val {
  font-size: 1.05rem;
  font-weight: 800;
  margin-top: 2px;
}

.dialy-que-subbox {
  font-size: 0.70rem;
  color: #cbd5e1;
  background: rgba(10, 4, 14, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 6px 8px;
  border-radius: 6px;
  line-height: 1.35;
}

.dialy-tai-loc-text {
  color: #4ade80;
  font-weight: 600;
}

/* Lưới Hào 6 Phân Kim */
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
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 5px 8px;
  font-size: 0.70rem;
}

.dialy-hao-item.active {
  background: rgba(192, 132, 252, 0.16);
  border-color: #c084fc;
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
  background: rgba(10, 4, 14, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 5px 6px;
  cursor: pointer;
  font-size: 0.68rem;
  user-select: none;
  touch-action: manipulation;
  transition: all 0.15s ease;
}

.dialy-matrix-item:hover,
.dialy-matrix-item:active {
  background: rgba(245, 176, 65, 0.12);
  border-color: #f5b041;
}

.dialy-matrix-item.active {
  background: rgba(245, 176, 65, 0.2);
  border-color: #f5b041;
}

.dialy-matrix-item.active .matrix-title {
  color: #facc15;
}

/* ==========================================================================
   GIAO DIỆN SÁNG (THEME-LIGHT) - ĐỒNG BỘ 100% VỚI NETA LIGHT
   Chuẩn màu Giấy Lụa Hoàng Gia & Tương Phản WCAG AAA
   ========================================================================== */
body.theme-light #view-dialy {
  background: radial-gradient(circle at 50% 10%, #fdfbf7 0%, #f4ede1 55%, #e8dcce 100%) !important;
  color: #1e293b !important;
}

body.theme-light .dialy-sticky-header {
  background: rgba(255, 253, 249, 0.96) !important;
  border-bottom: 1px solid rgba(217, 119, 6, 0.3) !important;
  box-shadow: 0 4px 16px rgba(120, 60, 10, 0.08) !important;
}

body.theme-light .dialy-heading-title {
  color: #475569 !important;
}

body.theme-light .dialy-val-deg {
  color: #b45309 !important;
}

body.theme-light .dialy-val-son {
  color: #d97706 !important;
}

body.theme-light .dialy-val-toa {
  color: #64748b !important;
}

body.theme-light .dialy-btn-sm {
  background: #f8fafc !important;
  border: 1px solid #cbd5e1 !important;
  color: #334155 !important;
}

body.theme-light .dialy-btn-sm:hover,
body.theme-light .dialy-btn-sm:active {
  background: #fef3c7 !important;
  border-color: #f59e0b !important;
  color: #92400e !important;
}

body.theme-light .dialy-btn-sm.dialy-btn-primary {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%) !important;
  border: 1px solid #b45309 !important;
  color: #ffffff !important;
  box-shadow: 0 2px 6px rgba(180, 83, 9, 0.3) !important;
}

body.theme-light .dialy-slider-control-row {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
}

body.theme-light .dialy-range-slider {
  accent-color: #b45309 !important;
}

body.theme-light .dialy-input-number {
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  color: #b45309 !important;
}

body.theme-light .dialy-input-number:focus {
  border-color: #b45309 !important;
  box-shadow: 0 0 0 2px rgba(180, 83, 9, 0.2) !important;
}

body.theme-light .dialy-deg-step-btn {
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  color: #334155 !important;
}

body.theme-light .dialy-deg-step-btn:active {
  background: #fef3c7 !important;
  border-color: #f59e0b !important;
  color: #92400e !important;
}

/* Parity Bar Light */
body.theme-light .dialy-parity-bar.good {
  background: #ecfdf5 !important;
  border: 1px solid #a7f3d0 !important;
  color: #065f46 !important;
}

body.theme-light .dialy-parity-bar.warn {
  background: #fef2f2 !important;
  border: 1px solid #fecaca !important;
  color: #991b1b !important;
}

body.theme-light .dialy-parity-bar.neutral {
  background: #fefce8 !important;
  border: 1px solid #fef08a !important;
  color: #854d0e !important;
}

/* Tab Bar Light */
body.theme-light .dialy-tab-bar {
  background: #f1f5f9 !important;
  border: 1px solid #e2e8f0 !important;
}

body.theme-light .dialy-tab-btn {
  color: #64748b !important;
}

body.theme-light .dialy-tab-btn.active {
  background: #ffffff !important;
  color: #9a3412 !important;
  border: 1px solid rgba(217, 119, 6, 0.3) !important;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08) !important;
}

body.theme-light .dialy-parity-mini-card {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  color: #1e293b !important;
}

body.theme-light .dialy-parity-mini-card.active {
  background: #f0fdf4 !important;
  border-left-color: #10b981 !important;
}

body.theme-light .dialy-parity-mini-card b {
  color: #1e293b !important;
}

/* Cards Light */
body.theme-light .dialy-card-section {
  background: rgba(255, 255, 255, 0.96) !important;
  border: 1px solid rgba(217, 119, 6, 0.25) !important;
  box-shadow: 0 2px 12px rgba(120, 60, 10, 0.06) !important;
}

body.theme-light .dialy-card-title {
  color: #9a3412 !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
}

body.theme-light .dialy-data-row {
  color: #334155 !important;
}

body.theme-light .dialy-data-row .dialy-label {
  color: #64748b !important;
}

body.theme-light .dialy-data-row .dialy-value {
  color: #0f172a !important;
}

/* Badges Light */
body.theme-light .dialy-badge.green {
  background: #dcfce7 !important;
  color: #15803d !important;
  border-color: #86efac !important;
}

body.theme-light .dialy-badge.red {
  background: #fee2e2 !important;
  color: #b91c1c !important;
  border-color: #fca5a5 !important;
}

body.theme-light .dialy-badge.gold {
  background: #fef3c7 !important;
  color: #92400e !important;
  border-color: #fde68a !important;
}

body.theme-light .dialy-badge.purple {
  background: #f3e8ff !important;
  color: #7e22ce !important;
  border-color: #d8b4fe !important;
}

/* Thủy Khẩu & Flow Light */
body.theme-light .dialy-thuykhau-box {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
}

body.theme-light .dialy-flow-btn {
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  color: #475569 !important;
}

body.theme-light .dialy-flow-btn.active {
  background: #fef3c7 !important;
  border-color: #f59e0b !important;
  color: #92400e !important;
}

/* Vòng Trường Sinh Light */
body.theme-light .dialy-vongts-cell {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
}

body.theme-light .dialy-vongts-cell.is-huong {
  background: #fef3c7 !important;
  border-color: #f59e0b !important;
}

body.theme-light .dialy-vongts-cell.is-thuykhau {
  background: #e0f2fe !important;
  border-color: #38bdf8 !important;
}

body.theme-light .dialy-vongts-cell .cell-title {
  color: #334155 !important;
}

body.theme-light .dialy-vongts-cell.is-huong .cell-title {
  color: #92400e !important;
}

body.theme-light .dialy-vongts-cell.is-thuykhau .cell-title {
  color: #0369a1 !important;
}

body.theme-light .dialy-vongts-cell .cell-desc {
  color: #64748b !important;
}

body.theme-light .dialy-vongts-cell .cell-desc.good {
  color: #15803d !important;
}

/* Quẻ Meta Grid Light */
body.theme-light .dialy-que-meta-item {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
}

body.theme-light .dialy-que-meta-item span {
  color: #64748b !important;
}

body.theme-light .dialy-que-subbox {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  color: #334155 !important;
}

body.theme-light .dialy-tai-loc-text {
  color: #15803d !important;
}

/* Hào List Light */
body.theme-light .dialy-hao-item {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  color: #1e293b !important;
}

body.theme-light .dialy-hao-item.active {
  background: #f3e8ff !important;
  border-color: #a855f7 !important;
}

/* Ma trận Light */
body.theme-light .dialy-matrix-item {
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  color: #1e293b !important;
}

body.theme-light .dialy-matrix-item:hover,
body.theme-light .dialy-matrix-item:active {
  background: #fef3c7 !important;
  border-color: #f59e0b !important;
}

body.theme-light .dialy-matrix-item.active {
  background: #fef3c7 !important;
  border-color: #d97706 !important;
}

body.theme-light .dialy-matrix-item.active .matrix-title {
  color: #92400e !important;
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
