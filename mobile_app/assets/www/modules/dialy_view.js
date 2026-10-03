/**
 * NETA LIGHT - MODULE ĐỊA LÝ KHẢO SÁT CHUYÊN SÂU
 * Tích Hợp Song Phái Nhất Thể: Phong Thủy Tam Hợp Phái & Huyền Không Đại Quái
 * Đồng bộ hai chiều (Bi-directional State Coupling) với La Kinh Vệ Tinh
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

  const STEMS = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  const BRANCHES = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

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

    container.innerHTML = `
      <div class="dialy-workspace" style="display: flex; flex-direction: column; width: 100%; min-height: 100%; background: #070d17; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding-bottom: 70px;">
        
        <!-- ================= STICKY HEADER & MASTER CONTROLLER ================= -->
        <div class="dialy-sticky-header" style="position: sticky; top: 0; z-index: 100; background: rgba(11, 19, 34, 0.95); backdrop-filter: blur(12px); border-bottom: 1.5px solid rgba(56, 189, 248, 0.25); padding: 10px 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.4);">
          
          <!-- Hàng tiêu đề & Cầu nối 2 chiều La Kinh -->
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 1.25rem;">⛰️☯️</span>
              <div>
                <div style="font-weight: 800; font-size: 0.95rem; color: #38bdf8; letter-spacing: 0.3px;">
                  ĐỊA LÝ KHẢO SÁT CHUYÊN SÂU
                </div>
                <div style="font-size: 0.65rem; color: #94a3b8;">
                  Nhất Thể Song Phái: Tam Hợp Địa Mạo &amp; Huyền Không Đại Quái
                </div>
              </div>
            </div>
            
            <div style="display: flex; gap: 6px;">
              <button type="button" id="dialy-btn-sync-lakinh" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-size: 0.70rem; font-weight: 700; padding: 5px 9px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                🔄 Lấy Từ La Kinh
              </button>
              <button type="button" id="dialy-btn-apply-lakinh" style="background: linear-gradient(135deg, #10b981, #059669); border: none; color: #fff; font-size: 0.70rem; font-weight: 700; padding: 5px 10px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px rgba(16,185,129,0.3);">
                🧭 Áp Sang La Kinh
              </button>
            </div>
          </div>

          <!-- Thanh điều khiển Hướng Nhà & Thủy Khẩu Siêu Cấp -->
          <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 8px 10px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 0.75rem; color: #cbd5e1; font-weight: 600;">
                🧭 Hướng Khảo Sát: <b style="color: #38bdf8; font-size: 0.95rem;">${deg.toFixed(1)}°</b> • Sơn <b style="color: #facc15;">${huongSon}</b>
              </span>
              <span style="font-size: 0.72rem; color: #94a3b8;">
                Tọa: <b style="color: #cbd5e1;">${toaDeg.toFixed(1)}° (${toaSon})</b>
              </span>
            </div>
            
            <div style="display: flex; align-items: center; gap: 8px;">
              <input type="range" id="dialy-slider-huong" min="0" max="359.9" step="0.1" value="${deg}" style="flex: 1; accent-color: #38bdf8; cursor: pointer;">
              <input type="number" id="dialy-input-huong" min="0" max="359.9" step="0.1" value="${deg.toFixed(1)}" style="width: 58px; background: #0f172a; border: 1px solid #38bdf8; border-radius: 4px; color: #38bdf8; font-weight: 700; font-size: 0.78rem; text-align: center; padding: 2px 4px;">
            </div>

            <!-- Nút vi chỉnh góc nhanh -->
            <div style="display: flex; justify-content: space-between; margin-top: 6px; gap: 4px;">
              <button type="button" class="dialy-deg-step-btn" data-step="-5">-5°</button>
              <button type="button" class="dialy-deg-step-btn" data-step="-1">-1°</button>
              <button type="button" class="dialy-deg-step-btn" data-step="-0.5">-0.5°</button>
              <button type="button" class="dialy-deg-step-btn" data-step="0.5">+0.5°</button>
              <button type="button" class="dialy-deg-step-btn" data-step="1">+1°</button>
              <button type="button" class="dialy-deg-step-btn" data-step="5">+5°</button>
            </div>
          </div>

          <!-- THẺ TÓM TẮT ĐỐI SÁNH NHẤT THỂ SONG PHÁI (MASTER PARITY BAR) -->
          <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(56, 189, 248, 0.08)); border: 1.5px solid ${isSongPhaiDacCach ? '#22c55e' : (pk120 && !pk120.duoc_phep_lay ? '#ef4444' : '#f59e0b')}; border-radius: 8px; padding: 8px 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 0.70rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: ${isSongPhaiDacCach ? '#4ade80' : (pk120 && !pk120.duoc_phep_lay ? '#f87171' : '#facc15')};">
                ${isSongPhaiDacCach ? '✨ SONG PHÁI ĐẮC CÁCH (LÝ KHÍ & ĐỊA THẾ TOÀN BÍCH)' : (pk120 && !pk120.duoc_phep_lay ? '⚠️ PHẠM TUYẾN KHÔNG VONG / CẦN NẮN HƯỚNG' : '⚖️ ĐỐI SÁNH ĐA DIỆN TAM HỢP & ĐẠI QUÁI')}
              </span>
              <span style="font-size: 0.68rem; color: #94a3b8;">
                24 Sơn: <b>${huongSon}</b>
              </span>
            </div>

            <!-- Đối chiếu 2 dòng song song -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 0.70rem;">
              <div style="background: rgba(15,23,42,0.7); padding: 5px 6px; border-radius: 4px; border-left: 2px solid #38bdf8;">
                <b style="color: #38bdf8;">🌊 Tam Hợp:</b><br/>
                ${pk120 ? `<span style="color: ${pk120.duoc_phep_lay ? '#4ade80' : '#f87171'}; font-weight: 700;">${pk120.can_chi} (${pk120.tinh_chat.split('(')[0]})</span>` : ''}<br/>
                ${thauDia72 ? `<span style="color: ${thauDia72.is_bao_chau ? '#38bdf8' : '#f87171'};">${thauDia72.ten_long} (${thauDia72.is_bao_chau ? 'Bảo Châu' : 'Sai Thác'})</span>` : ''}
              </div>

              <div style="background: rgba(15,23,42,0.7); padding: 5px 6px; border-radius: 4px; border-left: 2px solid #c084fc;">
                <b style="color: #c084fc;">☯️ Đại Quái:</b><br/>
                ${hkdq && hkdq.hexagram ? `<span style="color: #f1f5f9; font-weight: 700;">${hkdq.hexagram.ten_que} [${hkdq.quai_khi}/${hkdq.quai_van}]</span>` : ''}<br/>
                ${hkdq && hkdq.hao ? `<span style="color: #e2e8f0;">Hào ${hkdq.hao.hao_index} (${hkdq.hao.luc_than}) • <b style="color: #4ade80;">${hkdq.danh_gia_van_9.includes('Cát') ? 'Cát' : 'Bình'}</b></span>` : ''}
              </div>
            </div>
          </div>

          <!-- THANH CHUYỂN 2 TAB LỚN -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 8px;">
            <button type="button" id="dialy-tab-btn-tamhop" class="dialy-main-tab-btn ${state.curActiveTab === 'tamhop' ? 'active' : ''}">
              🌊 TAM HỢP &amp; ĐỊA MẠO DEM
            </button>
            <button type="button" id="dialy-tab-btn-hkdq" class="dialy-main-tab-btn ${state.curActiveTab === 'hkdq' ? 'active' : ''}">
              ☯️ HUYỀN KHÔNG ĐẠI QUÁI
            </button>
          </div>
        </div>

        <!-- ================= NỘI DUNG CHÍNH (THEO TAB) ================= -->
        <div class="dialy-content-body" style="padding: 12px 14px;">
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
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem; margin-bottom: 6px;">
          <span style="color: #94a3b8;">Cục Đất:</span>
          <b style="color: #38bdf8; font-size: 0.85rem;">${thuyPhap ? thuyPhap.cuc_name : ''}</b>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem; margin-bottom: 6px;">
          <span style="color: #94a3b8;">Thế Cục Thủy Pháp:</span>
          <span class="dialy-badge ${thuyPhap && thuyPhap.the_cuc.includes('Cát') ? 'green' : 'gold'}">
            ${thuyPhap ? thuyPhap.the_cuc : ''}
          </span>
        </div>

        <!-- Điều chỉnh Thủy Khẩu & Dòng Chảy -->
        <div style="background: rgba(15,23,42,0.6); padding: 8px; border-radius: 6px; margin: 8px 0;">
          <div style="display: flex; justify-content: space-between; font-size: 0.72rem; margin-bottom: 4px;">
            <span style="color: #cbd5e1;">Phương Thủy Khẩu Thoát Nước:</span>
            <b style="color: #facc15;">${tkDeg.toFixed(1)}° (${thuyPhap ? thuyPhap.thuy_khau.son_name : ''})</b>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="range" id="dialy-slider-thuykhau" min="0" max="359.9" step="0.5" value="${tkDeg}" style="flex: 1; accent-color: #facc15;">
            <input type="number" id="dialy-input-thuykhau" min="0" max="359.9" step="0.5" value="${tkDeg.toFixed(1)}" style="width: 58px; background: #0f172a; border: 1px solid #facc15; border-radius: 4px; color: #facc15; font-weight: 700; font-size: 0.78rem; text-align: center; padding: 2px 4px;">
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
            <span style="font-size: 0.72rem; color: #94a3b8;">Dòng Chảy Tự Nhiên:</span>
            <div style="display: flex; gap: 6px;">
              <button type="button" class="dialy-flow-btn ${state.curDongChay === 'ta_dao_huu' ? 'active' : ''}" id="dialy-btn-flow-ta">Tả Sang Hữu (Dương)</button>
              <button type="button" class="dialy-flow-btn ${state.curDongChay === 'huu_dao_ta' ? 'active' : ''}" id="dialy-btn-flow-huu">Hữu Sang Tả (Âm)</button>
            </div>
          </div>
        </div>

        <!-- Lưới 12 Cung Trường Sinh -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; margin-top: 8px;">
          ${vongTS.map(ts => {
            const songSon = ts.song_son || '';
            const saoName = ts.cung_truong_sinh || ts.sao_name || '';
            const isHuong = huongSon && songSon.includes(huongSon);
            const isTK = thuyPhap && thuyPhap.thuy_khau && songSon.includes(thuyPhap.thuy_khau.son_name);
            const isGood = ['Trường Sinh', 'Quan Đới', 'Lâm Quan', 'Đế Vượng'].includes(saoName);
            return `
              <div style="background: ${isHuong ? 'rgba(56,189,248,0.2)' : (isTK ? 'rgba(250,204,21,0.2)' : 'rgba(15,23,42,0.5)')}; border: 1px solid ${isHuong ? '#38bdf8' : (isTK ? '#facc15' : 'rgba(255,255,255,0.06)')}; border-radius: 4px; padding: 4px 6px; text-align: center; font-size: 0.68rem;">
                <div style="font-weight: 700; color: ${isHuong ? '#38bdf8' : (isTK ? '#facc15' : '#cbd5e1')};">${songSon}</div>
                <div style="color: ${isGood ? '#4ade80' : '#94a3b8'}; font-weight: 600;">${saoName}</div>
                ${isHuong ? '<span style="font-size: 0.60rem; color: #38bdf8; display: block;">[HƯỚNG]</span>' : ''}
                ${isTK ? '<span style="font-size: 0.60rem; color: #facc15; display: block;">[THỦY KHẨU]</span>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 2. 120 PHÂN KIM VI MÔ & THẨM ĐỊNH KHÍ TUYẾN -->
      <div class="dialy-card-section">
        <div class="dialy-card-title">
          <span>💎 2. 120 Phân Kim Vi Mô &amp; Lái Hướng Né Tuyến Không Vong</span>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 0.76rem; margin-bottom: 4px;">
          <span style="color: #94a3b8;">120 Phân Kim (${deg.toFixed(1)}°):</span>
          <strong style="color: #38bdf8;">${pk120 ? pk120.phan_kim_type : ''} • Nạp Âm: ${pk120 ? pk120.nap_am : ''}</strong>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem; margin-bottom: 6px;">
          <span style="color: #94a3b8;">Tính Chất Khí Tuyến:</span>
          <span class="dialy-badge ${pk120 && pk120.duoc_phep_lay ? 'green' : 'red'}">
            ${pk120 ? pk120.tinh_chat : ''}
          </span>
        </div>

        ${pk120 && !pk120.duoc_phep_lay ? `
          <div style="background: rgba(239, 68, 68, 0.15); border: 1.5px solid rgba(239, 68, 68, 0.4); border-radius: 6px; padding: 8px 10px; margin-bottom: 8px;">
            <div style="font-size: 0.76rem; color: #fca5a5; font-weight: 800; display: flex; align-items: center; gap: 4px;">
              ⚠️ CẢNH BÁO TUYẾN KHÔNG VONG / QUY GIÁP SÁT
            </div>
            <div style="font-size: 0.72rem; color: #fecaca; margin-top: 3px; line-height: 1.4;">
              ${(pk120.steering && pk120.steering.warning) ? pk120.steering.warning : 'Rơi vào tuyến suy tuyệt, tổn hao tài đinh. Cần nắn chỉnh phân kim sang cung Vượng / Tướng.'}
            </div>
            ${(pk120.steering && pk120.steering.recommended_heading !== undefined) ? `
              <button type="button" class="dialy-btn-micro-steering" data-target-deg="${pk120.steering.recommended_heading}">
                🎯 Nắn Hướng Vi Mô: Xoay ${pk120.steering.delta_angle > 0 ? '+' : ''}${pk120.steering.delta_angle.toFixed(1)}° Sang ${pk120.steering.target_phan_kim} (${pk120.steering.recommended_heading.toFixed(1)}° - Cát Khí)
              </button>
            ` : ''}
          </div>
        ` : `
          <div style="background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 6px; padding: 6px 10px; margin-bottom: 8px; font-size: 0.74rem; color: #86efac;">
            ✨ Phân kim đắc khí cát lợi (${pk120 ? pk120.tinh_chat : ''}), âm dương tương phối, nhân tài hưng thịnh.
          </div>
        `}

        <!-- 72 Thấu Địa Long & 60 Xuyên Sơn Long -->
        <div style="border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 6px; margin-top: 6px;">
          ${thauDia72 ? `
            <div style="display: flex; justify-content: space-between; font-size: 0.74rem; margin-bottom: 2px;">
              <span style="color: #94a3b8;">72 Thấu Địa Long:</span>
              <strong style="color: ${thauDia72.is_bao_chau ? '#4ade80' : '#f87171'};">
                ${thauDia72.ten_long} • ${thauDia72.danh_gia}
              </strong>
            </div>
            <div style="font-size: 0.68rem; color: #cbd5e1; margin-bottom: 6px; font-style: italic;">
              ${thauDia72.mo_ta}
            </div>
          ` : ''}

          ${xuyenSon60 ? `
            <div style="display: flex; justify-content: space-between; font-size: 0.74rem; margin-bottom: 2px;">
              <span style="color: #94a3b8;">60 Xuyên Sơn Long:</span>
              <strong style="color: #38bdf8;">
                Long thứ ${xuyenSon60.index_60}/60: ${xuyenSon60.can_chi} (${xuyenSon60.nap_am}) • ${xuyenSon60.khi}
              </strong>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- 3. BÁT LỘ HOÀNG TUYỀN & BÁT SÁT TIÊU VONG -->
      <div class="dialy-card-section">
        <div class="dialy-card-title">
          <span>⚠️ 3. Bát Lộ Hoàng Tuyền &amp; Bát Sát Tiêu Vong</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; font-size: 0.74rem; margin-bottom: 4px;">
          <span style="color: #94a3b8;">Hoàng Tuyền Sát Khí:</span>
          <strong style="color: ${hoangTuyen && hoangTuyen.pham_sat ? '#f87171' : '#4ade80'};">
            ${hoangTuyen ? hoangTuyen.danh_gia : ''}
          </strong>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 0.74rem; margin-bottom: 4px;">
          <span style="color: #94a3b8;">Bát Sát Cung Tọa:</span>
          <strong style="color: ${batSat && batSat.pham_bat_sat ? '#f87171' : '#4ade80'};">
            ${batSat ? batSat.danh_gia : ''}
          </strong>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 0.74rem;">
          <span style="color: #94a3b8;">Thái Tuế &amp; Tuế Phá:</span>
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
          <span>☯️ 1. Quẻ Chủ Huyền Không Đại Quái (${deg.toFixed(1)}°)</span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div>
            <div style="font-size: 1.05rem; font-weight: 800; color: #c084fc;">
              ${hex.ten_que} (${hex.ha_thuong_quai})
            </div>
            <div style="font-size: 0.70rem; color: #94a3b8;">
              Cung Bát Quái: <b>${hex.cung_bat_quai} (${hex.ngu_hanh_cung})</b> • STT La Kinh: <b>${hex.la_kinh ? hex.la_kinh.stt_la_kinh : ''}/64</b>
            </div>
          </div>
          <span class="dialy-badge ${hex.la_kinh && hex.la_kinh.danh_gia_van_9.includes('Cát') ? 'green' : 'gold'}">
            ${hex.la_kinh ? hex.la_kinh.danh_gia_van_9 : ''}
          </span>
        </div>

        <!-- Quái Số, Quái Khí, Quái Vận -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; font-size: 0.74rem; text-align: center; margin-bottom: 8px;">
          <div style="background: rgba(15,23,42,0.7); padding: 6px; border-radius: 6px; border-top: 2px solid #38bdf8;">
            <span style="color: #94a3b8;">Quái Khí</span><br/>
            <b style="color: #38bdf8; font-size: 1.05rem;">${hex.quai_khi}</b>
          </div>
          <div style="background: rgba(15,23,42,0.7); padding: 6px; border-radius: 6px; border-top: 2px solid #c084fc;">
            <span style="color: #94a3b8;">Quái Vận</span><br/>
            <b style="color: #c084fc; font-size: 1.05rem;">Vận ${hex.quai_van}</b>
          </div>
          <div style="background: rgba(15,23,42,0.7); padding: 6px; border-radius: 6px; border-top: 2px solid #facc15;">
            <span style="color: #94a3b8;">Âm Dương</span><br/>
            <b style="color: #facc15; font-size: 1.05rem;">${hex.la_kinh ? hex.la_kinh.am_duong : ''}</b>
          </div>
        </div>

        <div style="font-size: 0.72rem; color: #cbd5e1; background: rgba(15,23,42,0.5); padding: 6px 8px; border-radius: 6px;">
          Phạm vi độ số: <b>${hex.la_kinh ? hex.la_kinh.deg_range : ''}</b> (${hex.la_kinh ? hex.la_kinh.son_24 : ''})<br/>
          Thông tin Tài/Tử Tôn: <span style="color: #4ade80;">${hex.la_kinh ? hex.la_kinh.tai_ton_info : ''}</span>
        </div>
      </div>

      <!-- 2. 384 HÀO PHÂN KIM VI MÔ (0.9375°/HÀO) -->
      <div class="dialy-card-section">
        <div class="dialy-card-title">
          <span>🎯 2. Hào Phân Kim Vi Mô (Hào ${curHao ? curHao.hao_index : '?'})</span>
        </div>

        ${curHao ? `
          <div style="background: rgba(192, 132, 252, 0.12); border: 1.5px solid rgba(192, 132, 252, 0.35); border-radius: 6px; padding: 8px 10px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <b style="color: #c084fc; font-size: 0.85rem;">Hào ${curHao.hao_index} • ${curHao.can_chi}</b>
              <span class="dialy-badge purple">${curHao.luc_than}</span>
            </div>
            <div style="font-size: 0.72rem; color: #cbd5e1; margin-bottom: 4px;">
              Độ số: <b>${curHao.deg_range}</b>
            </div>
            <div style="display: flex; gap: 8px; font-size: 0.70rem; color: #94a3b8;">
              <span>Năm phát tài: <b style="color: #facc15;">${curHao.nam_phat || 'Chưa định'}</b></span>
              <span>Người phát: <b style="color: #4ade80;">${curHao.nguoi_phat || 'Chưa định'}</b></span>
            </div>
          </div>
        ` : ''}

        <!-- 6 Hào của Quẻ Chủ -->
        <div style="display: flex; flex-direction: column; gap: 4px;">
          ${(hex.haos || []).slice().reverse().map(h => {
            const isCur = curHao && curHao.hao_index === h.hao_index;
            return `
              <div style="display: flex; justify-content: space-between; align-items: center; background: ${isCur ? 'rgba(192, 132, 252, 0.2)' : 'rgba(15,23,42,0.4)'}; border: 1px solid ${isCur ? '#c084fc' : 'rgba(255,255,255,0.06)'}; border-radius: 4px; padding: 4px 8px; font-size: 0.70rem;">
                <span style="font-weight: 700; color: ${isCur ? '#c084fc' : '#cbd5e1'};">Hào ${h.hao_index}: ${h.can_chi} (${h.luc_than})</span>
                <span style="color: #94a3b8;">${h.deg_range}</span>
                <button type="button" class="dialy-btn-select-hao" data-target-deg="${(h.deg_start + h.deg_end)/2}" style="background: none; border: 1px solid rgba(255,255,255,0.2); color: #cbd5e1; border-radius: 3px; font-size: 0.65rem; padding: 1px 5px; cursor: pointer;">
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

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 0.72rem;">
          <div style="background: rgba(15,23,42,0.6); padding: 6px; border-radius: 4px; border-left: 2px solid ${hkdq.is_hop_thap ? '#4ade80' : '#64748b'};">
            <b>Hợp Thập (Cộng = 10):</b><br/>
            <span style="color: ${hkdq.is_hop_thap ? '#4ade80' : '#94a3b8'};">${hkdq.is_hop_thap ? 'ĐẮC CÁCH HỢP THẬP' : 'Không phạm'}</span>
          </div>

          <div style="background: rgba(15,23,42,0.6); padding: 6px; border-radius: 4px; border-left: 2px solid ${hkdq.is_tam_bat_dao_lu ? '#4ade80' : '#64748b'};">
            <b>Tam Bát Đạo Lữ:</b><br/>
            <span style="color: ${hkdq.is_tam_bat_dao_lu ? '#4ade80' : '#94a3b8'};">${hkdq.is_tam_bat_dao_lu ? 'HỢP SINH THÀNH' : 'Không có'}</span>
          </div>
        </div>
      </div>

      <!-- 4. BẢNG TRA CỨU 64 QUẺ TOÀN ĐỒ (INTERACTIVE MATRIX) -->
      <div class="dialy-card-section">
        <div class="dialy-card-title" style="display: flex; justify-content: space-between; align-items: center;">
          <span>📚 4. Ma Trận 64 Quẻ Toàn Đồ</span>
          <select id="dialy-filter-van" style="background: #0f172a; color: #38bdf8; border: 1px solid #38bdf8; border-radius: 4px; font-size: 0.70rem; padding: 2px 4px;">
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

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; max-height: 280px; overflow-y: auto; margin-top: 6px; padding-right: 4px;">
          ${filteredHexes.map(h => {
            const isSelected = hex.id === h.id;
            const centerDeg = h.la_kinh ? (h.la_kinh.deg_start + h.la_kinh.deg_end)/2 : 0;
            return `
              <div class="dialy-hex-grid-item ${isSelected ? 'selected' : ''}" data-target-deg="${centerDeg}" style="background: ${isSelected ? 'rgba(56,189,248,0.2)' : 'rgba(15,23,42,0.5)'}; border: 1px solid ${isSelected ? '#38bdf8' : 'rgba(255,255,255,0.06)'}; border-radius: 4px; padding: 5px 6px; cursor: pointer; font-size: 0.68rem;">
                <div style="font-weight: 700; color: ${isSelected ? '#38bdf8' : '#f1f5f9'};">${h.ten_que}</div>
                <div style="color: #94a3b8; font-size: 0.62rem;">Khí ${h.quai_khi} • Vận ${h.quai_van} • ${h.la_kinh ? h.la_kinh.son_24 : ''}</div>
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
      };
    }
    if (tabBtnHk) {
      tabBtnHk.onclick = () => {
        state.curActiveTab = 'hkdq';
        render();
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
    container.querySelectorAll('.dialy-hex-grid-item').forEach(item => {
      item.onclick = () => {
        const targetDeg = parseFloat(item.dataset.targetDeg);
        if (!isNaN(targetDeg)) {
          state.curHuongDeg = targetDeg;
          render();
        }
      };
    });
  }

  // Thêm CSS riêng cho Module Địa Lý
  function injectStyles() {
    if (document.getElementById('dialy-view-styles')) return;
    const style = document.createElement('style');
    style.id = 'dialy-view-styles';
    style.textContent = `
      .dialy-main-tab-btn {
        padding: 8px 10px;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        color: #94a3b8;
        font-weight: 700;
        font-size: 0.72rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .dialy-main-tab-btn.active {
        background: rgba(56, 189, 248, 0.2);
        border-color: #38bdf8;
        color: #38bdf8;
        box-shadow: 0 0 10px rgba(56, 189, 248, 0.25);
      }
      .dialy-deg-step-btn {
        flex: 1;
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 4px;
        color: #cbd5e1;
        font-size: 0.68rem;
        font-weight: 600;
        padding: 3px 0;
        cursor: pointer;
      }
      .dialy-deg-step-btn:hover {
        border-color: #38bdf8;
        color: #38bdf8;
      }
      .dialy-card-section {
        background: rgba(15, 23, 42, 0.75);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 10px 12px;
        margin-bottom: 10px;
      }
      .dialy-card-title {
        font-size: 0.82rem;
        font-weight: 700;
        color: #38bdf8;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        padding-bottom: 6px;
        margin-bottom: 8px;
      }
      .dialy-badge {
        font-size: 0.65rem;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 4px;
        text-transform: uppercase;
      }
      .dialy-badge.green { background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); }
      .dialy-badge.red { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }
      .dialy-badge.gold { background: rgba(250, 204, 21, 0.2); color: #facc15; border: 1px solid rgba(250, 204, 21, 0.4); }
      .dialy-badge.purple { background: rgba(192, 132, 252, 0.2); color: #c084fc; border: 1px solid rgba(192, 132, 252, 0.4); }
      .dialy-flow-btn {
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 4px;
        color: #94a3b8;
        font-size: 0.68rem;
        font-weight: 600;
        padding: 3px 6px;
        cursor: pointer;
      }
      .dialy-flow-btn.active {
        background: rgba(250, 204, 21, 0.2);
        border-color: #facc15;
        color: #facc15;
      }
      .dialy-btn-micro-steering {
        margin-top: 6px;
        width: 100%;
        padding: 7px 10px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: #fff;
        font-weight: 700;
        font-size: 0.76rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        box-shadow: 0 2px 6px rgba(16,185,129,0.3);
      }
    `;
    document.head.appendChild(style);
  }

  // Khởi động khi DOM sẵn sàng
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectStyles);
    } else {
      injectStyles();
    }
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
