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
    curActiveTab: 'tamlong', // 'tamlong' | 'tamhop' | 'hkdq'
    curCanChu: 'Giáp',
    curChiChu: 'Tý',
    curNamChi: 'Thìn',
    curMoTaSa: '',
    curHkdqFilterVan: 'all',
    curHkdqFilterKhi: 'all',
    demCoords: { lat: 20.5242, lng: 106.1099 },
    demResult: null,
    isDemLoading: false,
    inputGpsText: '',
    profileViewTab: 'longitudinal', // 'longitudinal' | 'transverse' | 'radar'
    panel4ActiveTab: 'dem' // 'dem' | 'slope' | 'tangphong' | 'heatmap'
  };

  const PANEL4_CONFIGS = {
    dem: {
      src: 'assets/dialy/hinh_3_1_dem_long_thuy.png',
      title: 'HÌNH 3.1: BẢN ĐỒ ĐỊA HÌNH SỐ (DEM), KHUNG XƯƠNG SỐNG LONG & MẠNG LƯỚI THỦY HỆ',
      badge: 'Lưới DEM 120x120 (2.8km x 2.8km)',
      desc: 'Bóc tách sống Long mạch chính (Ridge Skeleton) dựa trên chỉ số vị trí địa hình TPI > 3.0m và mạng thủy lưu D8 (Flow Accumulation >= 120 ô lưới). Tọa sơn Thái Tổ Sơn 68.4m, Chân Huyệt Top 1 tại thềm cao độ +8.0m.',
      formula: 'TPI = Z0 - Mean(Zi) > 3.0m | FA(x, y) = 1 + SUM(FA_inflow) >= 120 | d_ridge in [50m, 250m]'
    },
    slope: {
      src: 'assets/dialy/hinh_3_2_slope_dia_mao.png',
      title: 'HÌNH 3.2: BẢN ĐỒ ĐỘ DỐC (SLOPE) & VI ĐỊA MẠO BỀ MẶT HUYỆT TRƯỜNG',
      badge: 'Zevenbergen-Thorne 1987',
      desc: 'Phân tích vi phân độ dốc và độ cong bề mặt: Vùng nước vịnh (0° - 2°), thềm đất tụ khí (4° - 8°), sườn đồi dốc mạnh (> 15°). Chân Huyệt Top 1 đạt độ dốc 9.2° với k_plan > 0 tụ sinh khí, thoát nước tự nhiên an toàn.',
      formula: 'Slope = arctan(sqrt(p^2 + q^2)) * (180/pi) | k_prof (độ thoải), k_plan (hội tụ sinh khí)'
    },
    tangphong: {
      src: 'assets/dialy/hinh_3_3_tang_phong_tu_tuong.png',
      title: 'HÌNH 3.3: BẢN ĐỒ CHỈ SỐ TÀNG PHONG & HỘ VỆ TỨ TƯỢNG (WEI)',
      badge: '360° Raycasting WEI: 0.86/1.00',
      desc: 'Định lượng góc che chắn chân trời cực đại (Horizon Elevation Angles) theo 8 phương tia. Hậu Huyền Vũ tựa đồi cao chắn gió bấc, Tiền Chu Tước mở quang đãng đón thủy khí, Tả Long Hữu Hổ bao bọc khép kín.',
      formula: 'beta_k = max_r [ arctan((Z(r, alpha_k) - Z0)/r) ] | WEI = (1/8) * SUM [ max(0, beta_k) ]'
    },
    heatmap: {
      src: 'assets/dialy/hinh_3_4_heatmap_chan_huyet.png',
      title: 'HÌNH 3.4: BẢN ĐỒ NHIỆT XÁC SUẤT HUYỆT TRƯỜNG & TOP CHÂN HUYỆT (MCE)',
      badge: 'Top 1 Chân Huyệt (100.0/100đ)',
      desc: 'Mô hình hợp nhất đa tiêu chí không gian (Spatial MCE) kết hợp lọc triệt tiêu cực đại cục bộ (NMS bán kính 150m). Chân Huyệt Top 1 (Oa Huyệt) đạt điểm tuyệt đối 100/100 điểm, thế Tọa Tốn Hướng Càn.',
      formula: 'S(x,y) = 0.25*Encl + 0.20*Animals + 0.15*Vein + 0.20*Water + 0.20*Hall | NMS R_min = 150m'
    }
  };

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getLaKinhCoordsAndRotation() {
    let lat = 20.5242;
    let lng = 106.1099;
    let rot = state.curHuongDeg;

    if (global.NetaLaKinhView && typeof global.NetaLaKinhView.getState === 'function') {
      try {
        const lkState = global.NetaLaKinhView.getState();
        if (typeof lkState.rotation === 'number') rot = lkState.rotation;
        if (lkState.userLocation && typeof lkState.userLocation[0] === 'number') {
          lat = lkState.userLocation[0];
          lng = lkState.userLocation[1];
        } else if (lkState.centerCoords && typeof lkState.centerCoords[0] === 'number') {
          lat = lkState.centerCoords[0];
          lng = lkState.centerCoords[1];
        }
      } catch (e) {
        console.warn('getLaKinhCoords warning:', e);
      }
    }
    if ((!lat || !lng) && global.mapInstance && typeof global.mapInstance.getCenter === 'function') {
      try {
        const c = global.mapInstance.getCenter();
        if (c && typeof c.lat === 'number') {
          lat = c.lat;
          lng = c.lng;
        }
      } catch (e) {}
    }
    return { lat, lng, rotation: rot };
  }

  function getEffectiveCoords() {
    if (state.inputGpsText && state.inputGpsText.trim()) {
      if (global.TamLongEngine && typeof global.TamLongEngine.parseGpsOrMapsUrl === 'function') {
        const parsed = global.TamLongEngine.parseGpsOrMapsUrl(state.inputGpsText);
        if (parsed) {
          return { lat: parsed.lat, lng: parsed.lng, isFromInput: true };
        }
      }
    }
    const lk = getLaKinhCoordsAndRotation();
    return { lat: lk.lat, lng: lk.lng, isFromInput: false };
  }

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
    try {
      const container = document.getElementById('view-dialy');
      if (!container) return;

      // Đồng bộ góc độ ban đầu từ La Kinh nếu có
      if (global.NetaLaKinhView && typeof global.NetaLaKinhView.getState === 'function') {
        try {
          const lkState = global.NetaLaKinhView.getState();
          if (typeof lkState.rotation === 'number') state.curHuongDeg = lkState.rotation;
          if (typeof lkState.tamHopThuyKhauDeg === 'number') state.curThuyKhauDeg = lkState.tamHopThuyKhauDeg;
          if (lkState.tamHopDongChay) state.curDongChay = lkState.tamHopDongChay;
          if (lkState.lastDemScanResult) state.demResult = lkState.lastDemScanResult;
        } catch (e) {
          console.warn('Sync lakinh state warning:', e);
        }
      }
      try {
        if (global.mapInstance && typeof global.mapInstance.getCenter === 'function') {
          const c = global.mapInstance.getCenter();
          if (c && typeof c.lat === 'number' && typeof c.lng === 'number') {
            state.demCoords = { lat: c.lat, lng: c.lng };
          }
        }
      } catch (e) {
        console.warn('Map center get error:', e);
      }
      if (!state.demCoords || typeof state.demCoords.lat !== 'number') {
        state.demCoords = { lat: 20.5242, lng: 106.1099 };
      }

      render();
    } catch (err) {
      console.error('DiaLyView.init error:', err);
    }
  }

  function render() {
    try {
      const container = document.getElementById('view-dialy');
      if (!container) return;
      const prevScrollTop = container.scrollTop;

    const deg = normalizeDeg(state.curHuongDeg);
    const tkDeg = normalizeDeg(state.curThuyKhauDeg);
    const toaDeg = normalizeDeg(deg + 180.0);

    // Xác định tọa độ thực tế: nếu người dùng nhập thì ưu tiên, nếu không thì lấy từ La Kinh
    const effCoords = getEffectiveCoords();
    state.demCoords.lat = effCoords.lat;
    state.demCoords.lng = effCoords.lng;
    const lkCoords = getLaKinhCoordsAndRotation();

    // Tính toán Tầm Long Điểm Huyệt & Loan Đầu Vi Địa Mạo Số
    const tamLongData = global.TamLongEngine ? global.TamLongEngine.analyzeLoanDau({
      lat: state.demCoords.lat,
      lng: state.demCoords.lng,
      headingDeg: deg,
      demResult: state.demResult
    }) : null;

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
              ${state.curActiveTab === 'tamlong' ? `
                <span>🏔️ ${tamLongData ? tamLongData.hinhTheHuyet.loai.split('(')[0].trim() : 'Chân Huyệt'}</span>
                <span style="opacity: 0.85; font-weight: normal;">• Điểm ${tamLongData ? tamLongData.score : 0}/100 (${tamLongData ? tamLongData.xepHang.split('(')[0].trim() : ''})</span>
              ` : (state.curActiveTab === 'tamhop' ? `
                <span>🌊 ${thuyPhap ? thuyPhap.cuc_name : 'Tam Hợp'}</span>
                <span style="opacity: 0.85; font-weight: normal;">• ${thuyPhap ? thuyPhap.the_cuc : ''} | ${pk120 ? pk120.can_chi : ''}</span>
              ` : `
                <span>☯️ ${hkdq && hkdq.hexagram ? hkdq.hexagram.ten_que : 'Đại Quái'}</span>
                <span style="opacity: 0.85; font-weight: normal;">• Khí ${hkdq ? hkdq.quai_khi : ''} Vận ${hkdq ? hkdq.quai_van : ''}</span>
              `)}
            </div>
            ${isPhamKhongVong && pk120.steering && pk120.steering.recommended_heading !== undefined ? `
              <div class="dialy-parity-right">
                <button type="button" class="dialy-btn-sm dialy-btn-primary dialy-btn-micro-steering" data-target-deg="${pk120.steering.recommended_heading}" style="font-size: 0.62rem; padding: 2px 7px; margin: 0;">
                  🎯 Nắn ${pk120.steering.delta_angle > 0 ? '+' : ''}${pk120.steering.delta_angle.toFixed(1)}°
                </button>
              </div>
            ` : ''}
          </div>

          <!-- Hàng 4: Segmented Tab Bar Siêu Nhẹ (iOS Style) - 3 Phân Hệ -->
          <div class="dialy-tab-bar">
            <button type="button" id="dialy-tab-btn-tamlong" class="dialy-tab-btn ${state.curActiveTab === 'tamlong' ? 'active' : ''}">
              🏔️ Tầm Long
            </button>
            <button type="button" id="dialy-tab-btn-tamhop" class="dialy-tab-btn ${state.curActiveTab === 'tamhop' ? 'active' : ''}">
              🌊 Tam Hợp
            </button>
            <button type="button" id="dialy-tab-btn-hkdq" class="dialy-tab-btn ${state.curActiveTab === 'hkdq' ? 'active' : ''}">
              ☯️ Đại Quái
            </button>
          </div>
        </div>

        <!-- ================= NỘI DUNG CHÍNH (THEO TAB) ================= -->
        <div class="dialy-content-body">
          ${state.curActiveTab === 'tamlong'
            ? renderTamLongTabHtml({ deg, toaDeg, huongSon, toaSon, tamLongData, thuyPhap, pk120, effCoords, lkCoords })
            : (state.curActiveTab === 'tamhop'
                ? renderTamHopTabHtml({ deg, tkDeg, toaDeg, huongSon, toaSon, thuyPhap, pk120, thauDia72, xuyenSon60, xuyenSon72, tamSat, thaiTue, hoangTuyen, batSat, tamCat, tu28, tamLongData })
                : renderHkdqTabHtml({ deg, hkdq, tamLongData })
              )
          }
        </div>
      </div>
    `;

    container.scrollTop = prevScrollTop;
    bindEvents();
    } catch (renderErr) {
      console.error('Lỗi khi render DiaLyView:', renderErr);
      const container = document.getElementById('view-dialy');
      if (container) {
        container.innerHTML = `
          <div style="padding: 24px 16px; text-align: center; color: #ef4444; font-family: sans-serif;">
            <div style="font-size: 1.5rem; margin-bottom: 8px;">⚠️</div>
            <div style="font-weight: 700; margin-bottom: 8px;">Không thể tải dữ liệu Địa Lý Khảo Sát</div>
            <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 16px;">${renderErr.message || 'Lỗi xử lý tham số'}</div>
            <button type="button" onclick="if(window.NetaDiaLyView)window.NetaDiaLyView.init()" style="padding: 8px 16px; border-radius: 8px; background: #b45309; color: #fff; border: none; font-weight: 700; cursor: pointer;">Thử lại</button>
          </div>
        `;
      }
    }
  }

  // --- ĐỒ GIẢI TRỰC QUAN HÓA MẶT CẮT TRẮC DIỆN & TỨ TƯỢNG (SVG NATIVE) ---
  function renderLongitudinalSvg(profile, centerElev, toaDeg, huongDeg) {
    if (!profile || profile.length === 0) {
      return `<div style="text-align:center; padding: 18px; font-size: 0.70rem; color: #94a3b8;">Chưa có dữ liệu trắc diện dọc</div>`;
    }
    const W = 520;
    const H = 185;
    const padL = 42;
    const padR = 24;
    const padT = 24;
    const padB = 32;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    const minX = -600;
    const maxX = 600;
    const elevs = profile.map(p => p.elev);
    let minE = Math.min(...elevs, centerElev);
    let maxE = Math.max(...elevs, centerElev);
    const spanE = Math.max(maxE - minE, 8.0);
    const yMin = minE - spanE * 0.15;
    const yMax = maxE + spanE * 0.25;

    const mapX = (d) => padL + ((d - minX) / (maxX - minX)) * plotW;
    const mapY = (e) => padT + plotH - ((e - yMin) / (yMax - yMin)) * plotH;

    const pts = [...profile].sort((a, b) => a.distM - b.distM);

    let polyPoints = `${mapX(minX)},${padT + plotH}`;
    pts.forEach(p => {
      polyPoints += ` ${mapX(p.distM).toFixed(1)},${mapY(p.elev).toFixed(1)}`;
    });
    polyPoints += ` ${mapX(maxX)},${padT + plotH}`;

    let linePath = `M ${mapX(pts[0].distM).toFixed(1)} ${mapY(pts[0].elev).toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      linePath += ` L ${mapX(pts[i].distM).toFixed(1)} ${mapY(pts[i].elev).toFixed(1)}`;
    }

    const centerX = mapX(0);

    return `
      <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="longGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0284c7" stop-opacity="0.45" />
            <stop offset="100%" stop-color="#0f172a" stop-opacity="0.1" />
          </linearGradient>
        </defs>

        <line x1="${padL}" y1="${padT + plotH}" x2="${W - padR}" y2="${padT + plotH}" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
        <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + plotH}" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
        
        <polygon points="${polyPoints}" fill="url(#longGrad)" />
        <path d="${linePath}" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linejoin="round" />

        <line x1="${centerX}" y1="${padT}" x2="${centerX}" y2="${padT + plotH}" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,3" opacity="0.7" />

        ${pts.map(p => {
          const px = mapX(p.distM);
          const py = mapY(p.elev);
          if (p.isCenter) {
            return `
              <circle cx="${px}" cy="${py}" r="5.5" fill="#f59e0b" stroke="#ffffff" stroke-width="1.8" />
              <text x="${px}" y="${py - 9}" fill="#facc15" font-size="8.5" font-weight="900" text-anchor="middle">📍 Huyệt (${p.elev.toFixed(1)}m)</text>
            `;
          }
          return `
            <circle cx="${px}" cy="${py}" r="3" fill="#38bdf8" stroke="#ffffff" stroke-width="1" />
            <text x="${px}" y="${py - 5}" fill="#cbd5e1" font-size="7" font-weight="700" text-anchor="middle">${p.elev.toFixed(1)}m</text>
          `;
        }).join('')}

        <text x="${padL}" y="${padT + plotH + 14}" fill="#f87171" font-size="7.5" font-weight="800" text-anchor="start">⛰️ Hậu Huyền Vũ (${toaDeg.toFixed(0)}°)</text>
        <text x="${centerX}" y="${padT + plotH + 14}" fill="#facc15" font-size="8" font-weight="800" text-anchor="middle">0m (Huyệt)</text>
        <text x="${W - padR}" y="${padT + plotH + 14}" fill="#38bdf8" font-size="7.5" font-weight="800" text-anchor="end">💧 Chu Tước (${huongDeg.toFixed(0)}°)</text>

        <text x="${padL - 4}" y="${padT + 4}" fill="#94a3b8" font-size="7" text-anchor="end">${maxE.toFixed(1)}m</text>
        <text x="${padL - 4}" y="${padT + plotH}" fill="#94a3b8" font-size="7" text-anchor="end">${minE.toFixed(1)}m</text>
      </svg>
    `;
  }

  function renderTransverseSvg(profile, centerElev, huongDeg) {
    if (!profile || profile.length === 0) {
      return `<div style="text-align:center; padding: 18px; font-size: 0.70rem; color: #94a3b8;">Chưa có dữ liệu trắc diện ngang</div>`;
    }
    const W = 520;
    const H = 185;
    const padL = 42;
    const padR = 24;
    const padT = 24;
    const padB = 32;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    const minX = -600;
    const maxX = 600;
    const elevs = profile.map(p => p.elev);
    let minE = Math.min(...elevs, centerElev);
    let maxE = Math.max(...elevs, centerElev);
    const spanE = Math.max(maxE - minE, 8.0);
    const yMin = minE - spanE * 0.15;
    const yMax = maxE + spanE * 0.25;

    const mapX = (d) => padL + ((d - minX) / (maxX - minX)) * plotW;
    const mapY = (e) => padT + plotH - ((e - yMin) / (yMax - yMin)) * plotH;

    const pts = [...profile].sort((a, b) => a.distM - b.distM);

    let polyPoints = `${mapX(minX)},${padT + plotH}`;
    pts.forEach(p => {
      polyPoints += ` ${mapX(p.distM).toFixed(1)},${mapY(p.elev).toFixed(1)}`;
    });
    polyPoints += ` ${mapX(maxX)},${padT + plotH}`;

    let linePath = `M ${mapX(pts[0].distM).toFixed(1)} ${mapY(pts[0].elev).toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      linePath += ` L ${mapX(pts[i].distM).toFixed(1)} ${mapY(pts[i].elev).toFixed(1)}`;
    }

    const centerX = mapX(0);

    return `
      <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="transGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.4" />
            <stop offset="100%" stop-color="#0f172a" stop-opacity="0.1" />
          </linearGradient>
        </defs>

        <line x1="${padL}" y1="${padT + plotH}" x2="${W - padR}" y2="${padT + plotH}" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
        <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + plotH}" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
        
        <polygon points="${polyPoints}" fill="url(#transGrad)" />
        <path d="${linePath}" fill="none" stroke="#4ade80" stroke-width="2.2" stroke-linejoin="round" />

        <line x1="${centerX}" y1="${padT}" x2="${centerX}" y2="${padT + plotH}" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,3" opacity="0.7" />

        ${pts.map(p => {
          const px = mapX(p.distM);
          const py = mapY(p.elev);
          if (p.isCenter) {
            return `
              <circle cx="${px}" cy="${py}" r="5.5" fill="#f59e0b" stroke="#ffffff" stroke-width="1.8" />
              <text x="${px}" y="${py - 9}" fill="#facc15" font-size="8.5" font-weight="900" text-anchor="middle">📍 Huyệt (${p.elev.toFixed(1)}m)</text>
            `;
          }
          return `
            <circle cx="${px}" cy="${py}" r="3" fill="#4ade80" stroke="#ffffff" stroke-width="1" />
            <text x="${px}" y="${py - 5}" fill="#cbd5e1" font-size="7" font-weight="700" text-anchor="middle">${p.elev.toFixed(1)}m</text>
          `;
        }).join('')}

        <text x="${padL}" y="${padT + plotH + 14}" fill="#4ade80" font-size="7.5" font-weight="800" text-anchor="start">🐉 Tả Thanh Long (-600m)</text>
        <text x="${centerX}" y="${padT + plotH + 14}" fill="#facc15" font-size="8" font-weight="800" text-anchor="middle">0m (Huyệt)</text>
        <text x="${W - padR}" y="${padT + plotH + 14}" fill="#fbbf24" font-size="7.5" font-weight="800" text-anchor="end">🐅 Hữu Bạch Hổ (+600m)</text>

        <text x="${padL - 4}" y="${padT + 4}" fill="#94a3b8" font-size="7" text-anchor="end">${maxE.toFixed(1)}m</text>
        <text x="${padL - 4}" y="${padT + plotH}" fill="#94a3b8" font-size="7" text-anchor="end">${minE.toFixed(1)}m</text>
      </svg>
    `;
  }

  function renderRadarSvg(radarDirs, centerElev) {
    if (!radarDirs || radarDirs.length === 0) {
      return `<div style="text-align:center; padding: 18px; font-size: 0.70rem; color: #94a3b8;">Chưa có dữ liệu radar Tứ Tượng</div>`;
    }
    const W = 320;
    const H = 240;
    const cx = W / 2;
    const cy = 120;
    const maxR = 80;

    const deltas = radarDirs.map(d => Math.abs(d.deltaElev));
    const maxDelta = Math.max(...deltas, 4.0);

    const pts = radarDirs.map(d => {
      const rad = ((d.bearing - 90.0) * Math.PI) / 180.0;
      const normVal = Math.max(Math.min((d.deltaElev + maxDelta) / (2 * maxDelta), 1.0), 0.15);
      const r = normVal * maxR;
      return {
        x: cx + r * Math.cos(rad),
        y: cy + r * Math.sin(rad),
        labelX: cx + (maxR + 16) * Math.cos(rad),
        labelY: cy + (maxR + 16) * Math.sin(rad),
        ...d
      };
    });

    const polyStr = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

    return `
      <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.2" />
            <stop offset="100%" stop-color="#10b981" stop-opacity="0.45" />
          </radialGradient>
        </defs>

        <circle cx="${cx}" cy="${cy}" r="${maxR * 0.25}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
        <circle cx="${cx}" cy="${cy}" r="${maxR * 0.50}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
        <circle cx="${cx}" cy="${cy}" r="${maxR * 0.75}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
        <circle cx="${cx}" cy="${cy}" r="${maxR}" fill="none" stroke="rgba(245,176,65,0.3)" stroke-width="1.2" />

        ${pts.map(p => {
          const rad = ((p.bearing - 90.0) * Math.PI) / 180.0;
          const ax = cx + maxR * Math.cos(rad);
          const ay = cy + maxR * Math.sin(rad);
          return `<line x1="${cx}" y1="${cy}" x2="${ax}" y2="${ay}" stroke="rgba(255,255,255,0.15)" stroke-width="1" />`;
        }).join('')}

        <polygon points="${polyStr}" fill="url(#radarGrad)" stroke="#38bdf8" stroke-width="1.8" />
        <circle cx="${cx}" cy="${cy}" r="3" fill="#f59e0b" />

        ${pts.map(p => `
          <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.8" fill="#38bdf8" stroke="#ffffff" stroke-width="1" />
          <text x="${p.labelX.toFixed(1)}" y="${p.labelY.toFixed(1) + 3}" fill="#cbd5e1" font-size="7" font-weight="700" text-anchor="middle">
            ${p.icon}${p.name}
          </text>
        `).join('')}
      </svg>
    `;
  }

  // Render HTML cho Tab: Tầm Long Điểm Huyệt & Tứ Tượng Loan Đầu
  function renderTamLongTabHtml(data) {
    const { deg, toaDeg, huongSon, toaSon, tamLongData, thuyPhap, pk120, effCoords, lkCoords } = data;
    if (!tamLongData) {
      return `<div style="text-align: center; color: #94a3b8; padding: 20px;">Đang tải dữ liệu Tầm Long Điểm Huyệt...</div>`;
    }

    const { centerElev, tuTuong, weiPercent, tpi, hinhTheHuyet, theNuoc, laiLong, thuyKhau, score, xepHang, xepHangClass, luopan, profiles, radar8Dirs } = tamLongData;
    const lkLat = lkCoords ? lkCoords.lat : 20.5242;
    const lkLng = lkCoords ? lkCoords.lng : 106.1099;
    const isFromCustom = effCoords && effCoords.isFromInput;

    const panelData = PANEL4_CONFIGS[state.panel4ActiveTab] || PANEL4_CONFIGS.dem;

    return `
      <!-- 1. ĐỊA MẠO SỐ & TỌA ĐỘ GPS KHẢO SÁT -->
      <div class="dialy-card-section">
        <div class="dialy-card-title">
          <span>🏔️ 1. Khảo Sát Tọa Độ &amp; Địa Hình Số (DEM)</span>
          <span class="dialy-badge ${isFromCustom ? 'blue' : 'gold'}" style="font-size: 0.65rem;">
            ${isFromCustom ? '📍 Tùy Chỉnh' : '🧭 Từ La Kinh'}
          </span>
        </div>

        <!-- Ô NHẬP LINK GOOGLE MAPS HOẶC TỌA ĐỘ GPS -->
        <div class="dialy-gps-input-wrap">
          <div class="dialy-gps-input-row">
            <input type="text" id="dialy-gps-input" class="dialy-gps-input"
              placeholder="🧭 Đang dùng tọa độ La Kinh (${lkLat.toFixed(5)}°, ${lkLng.toFixed(5)}°)..."
              value="${escapeHtml(state.inputGpsText || '')}"
              autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
            ${state.inputGpsText ? `
              <button type="button" id="dialy-btn-gps-clear" class="dialy-gps-clear-btn" title="Xóa để quay về tọa độ La Kinh">✕</button>
            ` : ''}
          </div>

          <div class="dialy-gps-btn-group">
            <button type="button" id="dialy-btn-get-lakinh" class="dialy-gps-act-btn" title="Lấy tọa độ tâm bản đồ và góc xoay từ La Kinh">
              🧭 Lấy từ La Kinh
            </button>
            <button type="button" id="dialy-btn-get-gps" class="dialy-gps-act-btn" title="Bắt tọa độ vệ tinh GPS máy">
              📍 GPS Thực địa
            </button>
            <button type="button" id="dialy-btn-scan-dem" class="dialy-gps-act-btn primary" ${state.isDemLoading ? 'disabled' : ''} title="Tải dữ liệu cao độ thực tế và phân tích địa mạo">
              ${state.isDemLoading ? '⏳ Đang Quét...' : '⚡ Phân Tích DEM'}
            </button>
          </div>
        </div>

        <div class="dialy-data-row">
          <span class="dialy-label">Tọa Độ Đang Áp Dụng:</span>
          <strong class="dialy-value">${state.demCoords.lat.toFixed(5)}°N, ${state.demCoords.lng.toFixed(5)}°E</strong>
          <span style="font-size: 0.65rem; color: #94a3b8; margin-left: 4px;">(${isFromCustom ? 'Từ ô nhập' : 'Tự động từ La Kinh'})</span>
        </div>

        <div class="dialy-data-row">
          <span class="dialy-label">Cao Độ Gốc Tâm Trạch:</span>
          <strong style="color: #38bdf8; font-size: 0.90rem;">${centerElev.toFixed(1)} m</strong>
          <span class="dialy-label" style="margin-left: 6px; font-size: 0.65rem;">(Bù Từ Thiên WMM: ${tamLongData.declination.toFixed(2)}°)</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 6px; font-size: 0.70rem;">
          <div class="dialy-sub-card">
            <span class="dialy-label">⛰️ Lai Long (Gối Tựa Cao Nhất):</span>
            <div style="color: #fbbf24; font-weight: 800; margin-top: 2px;">
              ${laiLong ? `${laiLong.son || 'Chính'} (${laiLong.elevation.toFixed(1)}m • +${laiLong.deltaElev.toFixed(1)}m)` : 'Đang khảo sát'}
            </div>
            <div style="font-size: 0.60rem; color: #94a3b8;">Cự ly: ${laiLong ? laiLong.distanceM : 0}m • Gối sơn vững chãi</div>
          </div>

          <div class="dialy-sub-card">
            <span class="dialy-label">💧 Thủy Khẩu (Điểm Thoát Thấp Nhất):</span>
            <div style="color: #38bdf8; font-weight: 800; margin-top: 2px;">
              ${thuyKhau ? `${thuyKhau.sonThienBan || 'Trũng'} (${thuyKhau.elevation.toFixed(1)}m • ${thuyKhau.deltaElev.toFixed(1)}m)` : 'Đang khảo sát'}
            </div>
            <div style="font-size: 0.60rem; color: #94a3b8;">Cự ly: ${thuyKhau ? thuyKhau.distanceM : 0}m • Tụ thủy xuất khẩu</div>
          </div>
        </div>

        <!-- KHUNG ĐỒ GIẢI TRỰC QUAN (PROFILES & RADAR) -->
        <div class="dialy-profile-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.72rem; font-weight: 800; color: #f5b041;">
              📐 Đồ Giải Trắc Diện &amp; Tứ Tượng Thực Địa
            </span>
            <span style="font-size: 0.62rem; color: #94a3b8;">
              Phạm vi ±600m
            </span>
          </div>

          <div class="dialy-profile-tab-bar">
            <button type="button" class="dialy-profile-tab-btn ${state.profileViewTab === 'longitudinal' ? 'active' : ''}" data-tab="longitudinal" title="Trắc diện dọc (Hậu Huyền Vũ - Tiền Chu Tước)">
              📈 Trắc Dọc
            </button>
            <button type="button" class="dialy-profile-tab-btn ${state.profileViewTab === 'transverse' ? 'active' : ''}" data-tab="transverse" title="Trắc diện ngang (Tả Thanh Long - Hữu Bạch Hổ)">
              📊 Trắc Ngang
            </button>
            <button type="button" class="dialy-profile-tab-btn ${state.profileViewTab === 'radar' ? 'active' : ''}" data-tab="radar" title="Lược đồ Radar che chắn Tứ Tượng 8 hướng">
              🕸️ Radar Tứ Tượng
            </button>
          </div>

          <div class="dialy-svg-wrap">
            ${state.profileViewTab === 'longitudinal'
              ? renderLongitudinalSvg(profiles ? profiles.longitudinal : null, centerElev, toaDeg, deg)
              : (state.profileViewTab === 'transverse'
                ? renderTransverseSvg(profiles ? profiles.transverse : null, centerElev, deg)
                : renderRadarSvg(radar8Dirs, centerElev))}
          </div>

          <div style="font-size: 0.62rem; color: #94a3b8; line-height: 1.35; padding: 2px 4px;">
            ${state.profileViewTab === 'longitudinal'
              ? '<b>Trắc diện dọc</b>: Khảo sát sống long từ Hậu Tọa Sơn Huyền Vũ qua Chân Huyệt tụ khí xuống Tiền Chu Tước Minh Đường.'
              : (state.profileViewTab === 'transverse'
                ? '<b>Trắc diện ngang</b>: Khảo sát độ ôm bọc và cân đối giữa cánh tay Tả Thanh Long (bên trái) và Hữu Bạch Hổ (bên phải).'
                : '<b>Lược đồ Radar</b>: Đo lường độ nâng cao che chở gió hại 8 phương (WEI) và góc mở đón vượng khí quang minh.')}
          </div>
        </div>
      </div>

      <!-- 2. TỨ TƯỢNG HỘ VỆ & CHỈ SỐ TÀNG PHONG TỤ KHÍ (WEI) -->
      <div class="dialy-card-section">
        <div class="dialy-card-title">
          <span>🛡️ 2. Tứ Tượng Hộ Vệ &amp; Tàng Phong Tụ Khí</span>
          <span class="dialy-badge ${weiPercent >= 75 ? 'green' : 'gold'}">
            WEI ${weiPercent}%
          </span>
        </div>

        <!-- Thanh Đo Chỉ Số Tàng Phong (Wind Enclosure Index) -->
        <div style="margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.68rem; margin-bottom: 3px;">
            <span class="dialy-label">Chỉ số Tụ Khí Tàng Phong (WEI):</span>
            <b style="color: ${weiPercent >= 75 ? '#4ade80' : '#facc15'};">${weiPercent}% (Khí Tụ Đắc Cách)</b>
          </div>
          <div class="dialy-wei-bar-wrap">
            <div class="dialy-wei-bar-fill" style="width: ${weiPercent}%;"></div>
          </div>
          <div style="font-size: 0.62rem; color: #94a3b8; margin-top: 3px; font-style: italic;">
            "Khí thừa phong tắc tán, giới thủy tắc chỉ" - Tứ bề che chở, sinh khí ngưng đọng.
          </div>
        </div>

        <!-- Lưới 4 Con Thú Tứ Tượng (2x2 Grid) -->
        <div class="dialy-tutruong-grid">
          <!-- Hậu Huyền Vũ -->
          <div class="dialy-tutruong-card ${tuTuong.huyenVu.isDacCach ? 'dac-cach' : ''}">
            <div class="card-head">
              <span class="card-icon">${tuTuong.huyenVu.icon}</span>
              <b class="card-name">Hậu Huyền Vũ</b>
              <span class="card-elev ${tuTuong.huyenVu.deltaElev >= 0 ? 'good' : 'warn'}">
                ${tuTuong.huyenVu.deltaElev >= 0 ? '+' : ''}${tuTuong.huyenVu.deltaElev.toFixed(1)}m
              </span>
            </div>
            <div class="card-desc">${tuTuong.huyenVu.danhGia}</div>
            <div class="card-foot">Tọa ${toaDeg.toFixed(1)}° (${tuTuong.huyenVu.mountain}) • ${tuTuong.huyenVu.elevation.toFixed(1)}m</div>
          </div>

          <!-- Tiền Chu Tước -->
          <div class="dialy-tutruong-card ${tuTuong.chuTuoc.isDacCach ? 'dac-cach' : ''}">
            <div class="card-head">
              <span class="card-icon">${tuTuong.chuTuoc.icon}</span>
              <b class="card-name">Tiền Chu Tước</b>
              <span class="card-elev ${tuTuong.chuTuoc.deltaElev <= 0.5 ? 'good' : 'warn'}">
                ${tuTuong.chuTuoc.deltaElev >= 0 ? '+' : ''}${tuTuong.chuTuoc.deltaElev.toFixed(1)}m
              </span>
            </div>
            <div class="card-desc">${tuTuong.chuTuoc.danhGia}</div>
            <div class="card-foot">Hướng ${deg.toFixed(1)}° (${tuTuong.chuTuoc.mountain}) • ${tuTuong.chuTuoc.elevation.toFixed(1)}m</div>
          </div>

          <!-- Tả Thanh Long -->
          <div class="dialy-tutruong-card ${tuTuong.thanhLong.isDacCach ? 'dac-cach' : ''}">
            <div class="card-head">
              <span class="card-icon">${tuTuong.thanhLong.icon}</span>
              <b class="card-name">Tả Thanh Long</b>
              <span class="card-elev good">
                ${tuTuong.thanhLong.deltaElev >= 0 ? '+' : ''}${tuTuong.thanhLong.deltaElev.toFixed(1)}m
              </span>
            </div>
            <div class="card-desc">${tuTuong.thanhLong.danhGia}</div>
            <div class="card-foot">Tả Sa (${tuTuong.thanhLong.mountain}) • ${tuTuong.thanhLong.elevation.toFixed(1)}m</div>
          </div>

          <!-- Hữu Bạch Hổ -->
          <div class="dialy-tutruong-card ${tuTuong.bachHo.isDacCach ? 'dac-cach' : ''}">
            <div class="card-head">
              <span class="card-icon">${tuTuong.bachHo.icon}</span>
              <b class="card-name">Hữu Bạch Hổ</b>
              <span class="card-elev ${tuTuong.bachHo.isDacCach ? 'good' : 'warn'}">
                ${tuTuong.bachHo.deltaElev >= 0 ? '+' : ''}${tuTuong.bachHo.deltaElev.toFixed(1)}m
              </span>
            </div>
            <div class="card-desc">${tuTuong.bachHo.danhGia}</div>
            <div class="card-foot">Hữu Sa (${tuTuong.bachHo.mountain}) • ${tuTuong.bachHo.elevation.toFixed(1)}m</div>
          </div>
        </div>
      </div>

      <!-- 3. NHẬN DIỆN CHÂN HUYỆT THEO TỨ THẾ CỔ ĐIỂN -->
      <div class="dialy-card-section">
        <div class="dialy-card-title">
          <span>🎯 3. Nhận Diện Chân Huyệt Theo Tứ Thế Cổ Điển</span>
          <span class="dialy-badge ${hinhTheHuyet.badgeClass}">${hinhTheHuyet.nguHanh}</span>
        </div>

        <div class="dialy-chanhuyet-card">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.5rem;">${hinhTheHuyet.icon}</span>
            <div>
              <div class="chanhuyet-main-title" style="font-size: 0.95rem; font-weight: 900;">
                ${hinhTheHuyet.loai}
              </div>
              <div class="chanhuyet-sub-info" style="font-size: 0.65rem;">
                Thế Huyệt: <b>${hinhTheHuyet.tenHan}</b> • Đặc tính: <b>${hinhTheHuyet.dacDiem}</b>
              </div>
            </div>
          </div>
          
          <div class="chanhuyet-desc" style="font-size: 0.70rem; line-height: 1.4; margin-top: 6px;">
            ${hinhTheHuyet.moTa}
          </div>

          <div class="dialy-tpi-strip">
            <span>TPI Vi mô: <b>${tpi.micro > 0 ? '+' : ''}${tpi.micro}m</b></span>
            <span>TPI Trung mô: <b>${tpi.meso > 0 ? '+' : ''}${tpi.meso}m</b></span>
            <span>k_prof: <b>${tpi.kProf}</b></span>
            <span>k_plan: <b>${tpi.kPlan}</b></span>
          </div>
        </div>

        <!-- 4 Hình Thái Tham Chiếu (Oa - Kiềm - Nhũ - Đột) -->
        <div class="dialy-tuthe-mini-grid">
          <div class="dialy-tuthe-mini-item ${hinhTheHuyet.loai.includes('Oa') ? 'active' : ''}">
            <b>🥣 Oa Huyệt</b><br/><span>Lòng chảo tụ khí</span>
          </div>
          <div class="dialy-tuthe-mini-item ${hinhTheHuyet.loai.includes('Kiềm') ? 'active' : ''}">
            <b>🦀 Kiềm Huyệt</b><br/><span>Gọng kìm hai cánh</span>
          </div>
          <div class="dialy-tuthe-mini-item ${hinhTheHuyet.loai.includes('Nhũ') ? 'active' : ''}">
            <b>⛰️ Nhũ Huyệt</b><br/><span>Bầu tròn buông sườn</span>
          </div>
          <div class="dialy-tuthe-mini-item ${hinhTheHuyet.loai.includes('Đột') || hinhTheHuyet.loai.includes('Bình Dương') ? 'active' : ''}">
            <b>🌕 Đột Huyệt</b><br/><span>Gò nổi bình dương</span>
          </div>
        </div>
      </div>

      <!-- 4. QUAN THỦY & SA THỦY (SƠN HOÀN THỦY BÃO) -->
      <div class="dialy-card-section">
        <div class="dialy-card-title">
          <span>💧 4. Quan Thủy &amp; Sa Thủy Ôm Bọc</span>
          <span class="dialy-badge ${theNuoc.isCat ? 'green' : 'gold'}">${theNuoc.danhGia}</span>
        </div>

        <div class="dialy-data-row">
          <span class="dialy-label">Hình Thái Thủy Thế:</span>
          <strong style="color: ${theNuoc.color}; font-weight: 800;">${theNuoc.loai}</strong>
        </div>

        <div style="font-size: 0.70rem; color: #cbd5e1; line-height: 1.4; margin: 4px 0;">
          ${theNuoc.moTa}
        </div>

        <div class="dialy-data-row" style="border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 4px; margin-top: 4px;">
          <span class="dialy-label">Phương Thủy Khẩu:</span>
          <strong class="dialy-value">${thuyKhau ? `${thuyKhau.sonThienBan} (${thuyKhau.bearing.toFixed(1)}°)` : 'Đang khảo sát'}</strong>
          <span class="dialy-label" style="margin-left: 6px;">Cục: <b>${thuyPhap ? thuyPhap.cuc_name : 'Thủy Cục'}</b></span>
        </div>
      </div>

      <!-- 5. TỔNG THỂ CHÂN HUYỆT & ĐỀ XUẤT PHÂN KIM VI MÔ -->
      <div class="dialy-card-section">
        <div class="dialy-card-title">
          <span>💎 5. Tổng Thể Chân Huyệt &amp; Đề Xuất Phân Kim</span>
          <span class="dialy-badge ${xepHangClass}">${score}/100 Điểm</span>
        </div>

        <div class="dialy-data-row">
          <span class="dialy-label">Đánh Giá Huyệt Vị:</span>
          <strong style="color: #facc15; font-size: 0.85rem;">${xepHang}</strong>
        </div>

        <div class="dialy-data-row">
          <span class="dialy-label">Phân Kim 120 Hướng:</span>
          <strong class="dialy-value">${luopan.facing.phanKim.canChi} • ${luopan.facing.phanKim.napAm}</strong>
          <span class="dialy-badge ${luopan.facing.phanKim.danhGia === 'DAI_CAT' || luopan.facing.phanKim.danhGia === 'CAT' ? 'green' : 'red'}" style="margin-left: 4px;">
            ${luopan.facing.phanKim.tinhChat}
          </span>
        </div>

        <div class="dialy-data-row">
          <span class="dialy-label">72 Thấu Địa Long:</span>
          <strong style="color: ${luopan.facing.thauDia.isBaoChau ? '#4ade80' : '#f87171'};">
            ${luopan.facing.thauDia.canChi} (${luopan.facing.thauDia.danhGia})
          </strong>
        </div>

        <div class="dialy-data-row">
          <span class="dialy-label">60 Xuyên Sơn Long:</span>
          <strong class="dialy-value">${luopan.facing.xuyenSon.canChi} • ${luopan.facing.xuyenSon.napAm} (${luopan.facing.xuyenSon.khi})</strong>
        </div>

        ${luopan.steering.isCurrentInVoid ? `
          <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 6px; padding: 6px 8px; margin: 6px 0;">
            <div style="font-size: 0.72rem; color: #f87171; font-weight: 700;">
              ⚠️ ${luopan.steering.warningMessage}
            </div>
            <div style="font-size: 0.68rem; color: #fca5a5; margin-top: 2px;">
              ${luopan.steering.rationale}
            </div>
            <button type="button" class="dialy-btn-micro-steering" data-target-deg="${luopan.steering.recommendedTrueBearing}">
              🎯 Nắn Vi Mô: Xoay ${luopan.steering.deltaAngle > 0 ? '+' : ''}${luopan.steering.deltaAngle.toFixed(1)}° Sang ${luopan.steering.targetPhanKim} (${luopan.steering.recommendedTrueBearing.toFixed(1)}° Cát)
            </button>
          </div>
        ` : `
          <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.25); border-radius: 6px; padding: 5px 8px; margin: 6px 0; font-size: 0.70rem; color: #4ade80;">
            ✨ Phân kim lập hướng đắc cách cát tường, nạp vượng khí âm dương tương phối.
          </div>
        `}
      </div>

      <!-- 6. BỘ 4 BẢN ĐỒ ĐỊA MẠO SỐ & TẦM LONG ĐIỂM HUYỆT (QUY MÔ 2.8KM) -->
      <div class="dialy-card-section">
        <div class="dialy-card-title">
          <span>🗺️ 6. Bản Đồ Địa Mạo Số &amp; Huyệt Trường (4 Panel 300 DPI)</span>
          <span class="dialy-badge gold">Số Liệu Thực</span>
        </div>

        <div class="dialy-panel4-tab-bar">
          <button type="button" class="dialy-panel4-tab-btn ${state.panel4ActiveTab === 'dem' ? 'active' : ''}" data-panel="dem">
            🏔️ 3.1 DEM &amp; Thủy
          </button>
          <button type="button" class="dialy-panel4-tab-btn ${state.panel4ActiveTab === 'slope' ? 'active' : ''}" data-panel="slope">
            📐 3.2 Độ Dốc
          </button>
          <button type="button" class="dialy-panel4-tab-btn ${state.panel4ActiveTab === 'tangphong' ? 'active' : ''}" data-panel="tangphong">
            🛡️ 3.3 Tàng Phong
          </button>
          <button type="button" class="dialy-panel4-tab-btn ${state.panel4ActiveTab === 'heatmap' ? 'active' : ''}" data-panel="heatmap">
            🎯 3.4 Xác Suất Huyệt
          </button>
        </div>

        <div class="dialy-panel4-img-wrap" id="dialy-panel4-lightbox-trigger" title="Nhấp để xem chi tiết ảnh nét cao">
          <img src="${panelData.src}" class="dialy-panel4-img" id="dialy-panel4-img" alt="${panelData.title}" />
          <div class="dialy-panel4-overlay-badge">
            ${panelData.badge}
          </div>
        </div>

        <div class="dialy-panel4-desc-box">
          <div class="dialy-panel4-title" style="font-weight: 800; color: #facc15; font-size: 0.72rem; margin-bottom: 3px;">
            ${panelData.title}
          </div>
          <div class="dialy-panel4-desc" style="font-size: 0.65rem; color: #cbd5e1; line-height: 1.4;">
            ${panelData.desc}
          </div>
          <div class="dialy-panel4-formula-strip">
            <code class="dialy-panel4-formula">${panelData.formula}</code>
          </div>
        </div>
      </div>
    `;
  }

  // Render HTML cho Tab: Tam Hợp Phái
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

    // Chuyển Tab (3 Phân Hệ)
    const tabBtnTl = document.getElementById('dialy-tab-btn-tamlong');
    const tabBtnTh = document.getElementById('dialy-tab-btn-tamhop');
    const tabBtnHk = document.getElementById('dialy-tab-btn-hkdq');
    if (tabBtnTl) {
      tabBtnTl.onclick = () => {
        state.curActiveTab = 'tamlong';
        render();
        const v = document.getElementById('view-dialy');
        if (v) v.scrollTop = 0;
      };
    }
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

    // --- KHẢO SÁT GPS & BẢN ĐỒ VỆ TINH ---
    const inGps = document.getElementById('dialy-gps-input');
    if (inGps) {
      inGps.oninput = (e) => {
        state.inputGpsText = e.target.value;
        const clearBtn = document.getElementById('dialy-btn-gps-clear');
        if (clearBtn) clearBtn.style.display = state.inputGpsText ? 'block' : 'none';
      };
      inGps.onchange = (e) => {
        state.inputGpsText = e.target.value;
        render();
      };
    }

    const btnGpsClear = document.getElementById('dialy-btn-gps-clear');
    if (btnGpsClear) {
      btnGpsClear.onclick = () => {
        state.inputGpsText = '';
        const lk = getLaKinhCoordsAndRotation();
        state.demCoords = { lat: lk.lat, lng: lk.lng };
        if (typeof showToast === 'function') showToast('🧭 Đã quay về dùng tọa độ từ La Kinh');
        render();
      };
    }

    const btnGetLk = document.getElementById('dialy-btn-get-lakinh');
    if (btnGetLk) {
      btnGetLk.onclick = () => {
        state.inputGpsText = '';
        const lk = getLaKinhCoordsAndRotation();
        state.curHuongDeg = lk.rotation;
        state.demCoords = { lat: lk.lat, lng: lk.lng };
        if (typeof showToast === 'function') {
          showToast(`🧭 Đã lấy tọa độ La Kinh (${lk.lat.toFixed(5)}°, ${lk.lng.toFixed(5)}°) & hướng ${lk.rotation.toFixed(1)}°`);
        }
        render();
      };
    }

    const btnGetGps = document.getElementById('dialy-btn-get-gps');
    if (btnGetGps) {
      btnGetGps.onclick = () => {
        if (!navigator.geolocation) {
          if (typeof showToast === 'function') showToast('⚠️ Thiết bị không hỗ trợ cảm biến GPS');
          return;
        }
        if (typeof showToast === 'function') showToast('🛰️ Đang kết nối vệ tinh GPS...');
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = +pos.coords.latitude.toFixed(6);
            const lng = +pos.coords.longitude.toFixed(6);
            state.inputGpsText = `${lat}, ${lng}`;
            state.demCoords = { lat, lng };
            if (typeof showToast === 'function') showToast(`📍 Đã định vị GPS: ${lat}°, ${lng}°`);
            render();
          },
          (err) => {
            console.warn('GPS error:', err);
            if (typeof showToast === 'function') showToast(`⚠️ Không lấy được GPS: ${err.message || 'Lỗi cảm biến'}`);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      };
    }

    container.querySelectorAll('.dialy-profile-tab-btn').forEach(btn => {
      btn.onclick = () => {
        const tab = btn.dataset.tab;
        if (tab && state.profileViewTab !== tab) {
          state.profileViewTab = tab;
          render();
        }
      };
    });

    container.querySelectorAll('.dialy-panel4-tab-btn').forEach(btn => {
      btn.onclick = () => {
        const p = btn.dataset.panel;
        if (p && state.panel4ActiveTab !== p) {
          state.panel4ActiveTab = p;
          // Cập nhật in-place: không scroll jump, không giật màn hình
          container.querySelectorAll('.dialy-panel4-tab-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.panel === p);
          });
          const pData = PANEL4_CONFIGS[p] || PANEL4_CONFIGS.dem;
          const imgEl = container.querySelector('#dialy-panel4-img');
          const badgeEl = container.querySelector('.dialy-panel4-overlay-badge');
          const titleEl = container.querySelector('.dialy-panel4-title');
          const descEl = container.querySelector('.dialy-panel4-desc');
          const formulaEl = container.querySelector('.dialy-panel4-formula');
          if (imgEl) { imgEl.src = pData.src; imgEl.alt = pData.title; }
          if (badgeEl) badgeEl.textContent = pData.badge;
          if (titleEl) titleEl.textContent = pData.title;
          if (descEl) descEl.textContent = pData.desc;
          if (formulaEl) formulaEl.textContent = pData.formula;
        }
      };
    });

    const triggerLBox = document.getElementById('dialy-panel4-lightbox-trigger');
    if (triggerLBox) {
      triggerLBox.onclick = () => {
        const imgEl = triggerLBox.querySelector('img');
        if (imgEl && imgEl.src) {
          window.open(imgEl.src, '_blank');
        }
      };
    }

    // Quét DEM Thực Địa (Open-Meteo DEM API)
    const btnScanDem = document.getElementById('dialy-btn-scan-dem');
    if (btnScanDem) {
      btnScanDem.onclick = async () => {
        state.isDemLoading = true;
        render();
        try {
          const eff = getEffectiveCoords();
          state.demCoords.lat = eff.lat;
          state.demCoords.lng = eff.lng;

          if (global.TamLongEngine && typeof global.TamLongEngine.scanAndAnalyze === 'function') {
            const res = await global.TamLongEngine.scanAndAnalyze(state.demCoords.lat, state.demCoords.lng, state.curHuongDeg);
            state.demResult = {
              center: { elevation: res.centerElev, lat: state.demCoords.lat, lng: state.demCoords.lng },
              tiers: {
                trung: {
                  thuyKhau: res.thuyKhau,
                  laiLong: res.laiLong
                }
              }
            };
            if (typeof showToast === 'function') {
              showToast(`🏔️ Đã quét xong DEM: Cao độ ${res.centerElev.toFixed(1)}m • Chân Huyệt: ${res.hinhTheHuyet.loai}`);
            }
          }
        } catch (err) {
          console.error(err);
          if (typeof showToast === 'function') showToast('❌ Không thể quét dữ liệu DEM');
        } finally {
          state.isDemLoading = false;
          render();
        }
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

/* Hàng 4: Segmented Tab Bar (3 Cột Chuẩn Mực) */
.dialy-tab-bar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: rgba(10, 4, 14, 0.7);
  padding: 3px;
  border-radius: 8px;
  gap: 3px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dialy-tab-btn {
  padding: 6px 4px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #cbd5e1;
  font-weight: 800;
  font-size: 0.72rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  user-select: none;
  touch-action: manipulation;
  white-space: nowrap;
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

/* Tầm Long Điểm Huyệt Components (Dark Mode) */
.dialy-sub-card {
  background: rgba(10, 4, 14, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 6px 8px;
}

.dialy-wei-bar-wrap {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 2px;
}

.dialy-wei-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #38bdf8 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.dialy-tutruong-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  margin-top: 6px;
}

.dialy-tutruong-card {
  background: rgba(10, 4, 14, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 0.68rem;
}

.dialy-tutruong-card.dac-cach {
  border-color: rgba(16, 185, 129, 0.4);
}

.dialy-tutruong-card .card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialy-tutruong-card .card-icon {
  font-size: 0.85rem;
}

.dialy-tutruong-card .card-name {
  font-weight: 800;
  color: #f1f5f9;
  flex: 1;
  margin-left: 4px;
}

.dialy-tutruong-card .card-elev {
  font-weight: 800;
  font-size: 0.65rem;
}

.dialy-tutruong-card .card-elev.good {
  color: #4ade80;
}

.dialy-tutruong-card .card-elev.warn {
  color: #f87171;
}

.dialy-tutruong-card .card-desc {
  font-size: 0.62rem;
  color: #94a3b8;
  line-height: 1.3;
}

.dialy-tutruong-card .card-foot {
  font-size: 0.60rem;
  color: #64748b;
  margin-top: 2px;
}

.dialy-chanhuyet-card {
  background: rgba(245, 176, 65, 0.1);
  border: 1.5px solid rgba(245, 176, 65, 0.35);
  border-radius: 8px;
  padding: 8px 10px;
  margin-top: 6px;
}

.dialy-chanhuyet-card .chanhuyet-main-title {
  color: #facc15;
}

.dialy-chanhuyet-card .chanhuyet-sub-info {
  color: #94a3b8;
}

.dialy-chanhuyet-card .chanhuyet-desc {
  color: #cbd5e1;
}

.dialy-tpi-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  background: rgba(0, 0, 0, 0.25);
  padding: 4px 6px;
  border-radius: 4px;
  margin-top: 6px;
  font-size: 0.64rem;
  color: #94a3b8;
}

.dialy-tpi-strip b {
  color: #facc15;
}

.dialy-tuthe-mini-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  margin-top: 6px;
}

.dialy-tuthe-mini-item {
  background: rgba(10, 4, 14, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 4px 2px;
  text-align: center;
  font-size: 0.60rem;
  line-height: 1.25;
}

.dialy-tuthe-mini-item b {
  color: #cbd5e1;
}

.dialy-tuthe-mini-item span {
  color: #64748b;
  font-size: 0.55rem;
}

.dialy-tuthe-mini-item.active {
  background: rgba(245, 176, 65, 0.22);
  border-color: #f5b041;
}

.dialy-tuthe-mini-item.active b {
  color: #facc15;
}

.dialy-tuthe-mini-item.active span {
  color: #fde68a;
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

/* Tầm Long Điểm Huyệt (Theme-Light WCAG AAA) */
body.theme-light .dialy-sub-card {
  background: #f8fafc !important;
  border: 1.5px solid #cbd5e1 !important;
}

body.theme-light .dialy-tutruong-card {
  background: #ffffff !important;
  border: 1.5px solid #cbd5e1 !important;
}

body.theme-light .dialy-tutruong-card.dac-cach {
  border-color: #059669 !important;
  background: #f0fdf4 !important;
}

body.theme-light .dialy-tutruong-card .card-name {
  color: #0f172a !important;
}

body.theme-light .dialy-tutruong-card .card-desc {
  color: #334155 !important;
  font-weight: 600 !important;
}

body.theme-light .dialy-tutruong-card .card-foot {
  color: #64748b !important;
  font-weight: 700 !important;
}

body.theme-light .dialy-chanhuyet-card {
  background: #fefce8 !important;
  border: 1.5px solid #b45309 !important;
}

body.theme-light .chanhuyet-main-title {
  color: #78350f !important;
  font-weight: 900 !important;
}

body.theme-light .chanhuyet-sub-info {
  color: #334155 !important;
  font-weight: 600 !important;
}

body.theme-light .chanhuyet-sub-info b {
  color: #0f172a !important;
  font-weight: 800 !important;
}

body.theme-light .chanhuyet-desc {
  color: #0f172a !important;
  font-weight: 600 !important;
}

body.theme-light .dialy-tpi-strip {
  background: #f8fafc !important;
  border: 1px solid #cbd5e1 !important;
  color: #334155 !important;
}

body.theme-light .dialy-tpi-strip b {
  color: #78350f !important;
}

body.theme-light .dialy-tuthe-mini-item {
  background: #ffffff !important;
  border: 1.5px solid #cbd5e1 !important;
}

body.theme-light .dialy-tuthe-mini-item b {
  color: #0f172a !important;
}

body.theme-light .dialy-tuthe-mini-item span {
  color: #475569 !important;
}

body.theme-light .dialy-tuthe-mini-item.active {
  background: #fef3c7 !important;
  border-color: #b45309 !important;
}

body.theme-light .dialy-tuthe-mini-item.active b {
  color: #78350f !important;
}

body.theme-light .dialy-tuthe-mini-item.active span {
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
