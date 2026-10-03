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

  global.NetaDiaLyView = NetaDiaLyView;
  global.NetaDiaLy = NetaDiaLyView;

})(typeof window !== 'undefined' ? window : this);
