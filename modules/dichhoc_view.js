/**
 * NETA LIGHT - DỊCH HỌC VIEW CONTROLLER (modules/dichhoc_view.js)
 * Giao diện Bốc Quẻ Dịch Lý (Lục Hào Nạp Giáp & Mai Hoa Dịch Số).
 * Thiết kế Mobile-First tinh gọn, sang trọng, vừa vặn 100% trong khung hình, không tràn ngang.
 * Đồ họa đồng tiền Càn Long tinh xảo, âm thanh Web Audio API, và hiển thị Lục Hào theo từng tầng hào trực quan.
 */

(function (global) {
  'use strict';

  // State quản lý của module Dịch Học
  const state = {
    method: 'luchao', // 'luchao' | 'maihoa'
    selectedDate: new Date(),
    purpose: '', // Việc cần xem
    haoCoins: [], // Danh sách các hào đã gieo (1 -> 6), mỗi hào nhận 6, 7, 8, 9
    coinStates: [3, 2, 3], // 3 đồng xu hiện tại (2: Âm, 3: Dương)
    coinAngles: [15, -20, 35], // Góc xoay tự nhiên ngẫu nhiên
    isFlipping: false,
    maiHoaMode: 'time', // 'time' | 'numbers'
    soA: 7,
    soB: 8,
    result: null
  };

  // Web Audio API mô phỏng tiếng kim loại tiền đồng cổ va chạm leng keng
  function playCoinAudio(type = 'clink') {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      if (type === 'done') {
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.12 / (idx + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.95);
        });
      } else {
        const freqs = [1600, 2400, 3500];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq + (Math.random() * 60 - 30), now);
          gain.gain.setValueAtTime(0.09 / (idx + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.35);
        });
      }
    } catch (e) {}
  }

  // Rung phản hồi xúc giác nhẹ (Haptic)
  function triggerHaptic(duration = 20) {
    if (navigator.vibrate) {
      try { navigator.vibrate(duration); } catch (e) {}
    }
  }

  // Helper lấy thông tin lịch & tiết khí từ NetaCalendarEngine
  function getCalendarInfo(date = new Date()) {
    if (global.NetaCalendarEngine && typeof global.NetaCalendarEngine.getFullDayInfo === 'function') {
      return global.NetaCalendarEngine.getFullDayInfo(date);
    }
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    return {
      solar: { day: d, month: m, year: y, dateStr: `${d}/${m}/${y}` },
      lunar: { day: d, month: m, year: y, dateStr: `Ngày ${d} tháng ${m}` },
      canChi: { year: 'Bính Ngọ', month: 'Đinh Dậu', day: 'Nhâm Dần', hour: 'Tân Hợi', dayGan: 'Nhâm', dayZhi: 'Dần', monthZhi: 'Dậu', yearZhi: 'Ngọ', hourZhi: 'Hợi' },
      solarTerm: 'Thu phân'
    };
  }

  // Render SVG đồng tiền Càn Long tinh xảo, kích thước gọn gàng
  function renderCoinSVG(val, isFlipping, idx) {
    const isYang = (val === 3);
    const angle = state.coinAngles[idx] || 0;

    return `
      <div class="dh-coin-item ${isFlipping ? 'is-flipping' : ''}" style="transform: rotate(${isFlipping ? 0 : angle}deg);" data-coin-idx="${idx}" title="${isYang ? 'Mặt Dương (3 điểm)' : 'Mặt Âm (2 điểm)'}">
        ${isYang ? `
          <!-- MẶT DƯƠNG (3 ĐIỂM) -->
          <svg class="dh-coin-svg" viewBox="0 0 100 100">
            <defs>
              <radialGradient id="cYang${idx}" cx="45%" cy="38%" r="60%">
                <stop offset="0%" stop-color="#eed58f" />
                <stop offset="45%" stop-color="#c19946" />
                <stop offset="85%" stop-color="#7e5d22" />
                <stop offset="100%" stop-color="#4a3511" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="47" fill="url(#cYang${idx})" stroke="#382509" stroke-width="2.2" />
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#fae8ab" stroke-width="1" opacity="0.6" />
            <circle cx="50" cy="50" r="41" fill="none" stroke="#2a1b06" stroke-width="1" opacity="0.75" />
            
            <rect x="37" y="37" width="26" height="26" fill="none" stroke="#251604" stroke-width="2" />
            <rect x="38.5" y="38.5" width="23" height="23" fill="#140f09" stroke="#d5b058" stroke-width="0.8" />

            <text x="22" y="57" font-family="serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#2d1b06">ᠪᠣᠣ</text>
            <text x="78" y="57" font-family="serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#2d1b06">ᠴᡳᠶᠣ</text>
            <circle cx="50" cy="23" r="2.5" fill="#2d1b06" opacity="0.6" />
            <circle cx="50" cy="77" r="2.5" fill="#2d1b06" opacity="0.6" />
          </svg>
        ` : `
          <!-- MẶT ÂM (2 ĐIỂM) -->
          <svg class="dh-coin-svg" viewBox="0 0 100 100">
            <defs>
              <radialGradient id="cYin${idx}" cx="45%" cy="38%" r="60%">
                <stop offset="0%" stop-color="#e2bf70" />
                <stop offset="45%" stop-color="#b08637" />
                <stop offset="85%" stop-color="#73521a" />
                <stop offset="100%" stop-color="#422f0d" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="47" fill="url(#cYin${idx})" stroke="#382509" stroke-width="2.2" />
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#fae8ab" stroke-width="1" opacity="0.6" />
            <circle cx="50" cy="50" r="41" fill="none" stroke="#2a1b06" stroke-width="1" opacity="0.75" />
            
            <rect x="37" y="37" width="26" height="26" fill="none" stroke="#251604" stroke-width="2" />
            <rect x="38.5" y="38.5" width="23" height="23" fill="#140f09" stroke="#d5b058" stroke-width="0.8" />

            <text x="50" y="28" font-family="'KaiTi', 'SimSun', serif" font-size="15" font-weight="900" text-anchor="middle" fill="#281704">乾</text>
            <text x="50" y="86" font-family="'KaiTi', 'SimSun', serif" font-size="15" font-weight="900" text-anchor="middle" fill="#281704">隆</text>
            <text x="21" y="56" font-family="'KaiTi', 'SimSun', serif" font-size="15" font-weight="900" text-anchor="middle" fill="#281704">通</text>
            <text x="79" y="56" font-family="'KaiTi', 'SimSun', serif" font-size="15" font-weight="900" text-anchor="middle" fill="#281704">寶</text>
          </svg>
        `}
        <div class="dh-coin-badge">${isYang ? '3' : '2'}</div>
      </div>
    `;
  }

  // Khởi tạo và render giao diện
  function render() {
    const container = document.getElementById('view-dichhoc');
    if (!container) return;

    const calInfo = getCalendarInfo(state.selectedDate);
    const canChi = calInfo.canChi || {};
    const solarTerm = calInfo.solarTerm || 'Thu phân';
    const chiNgay = canChi.dayZhi || 'Dần';
    const chiThang = canChi.monthZhi || 'Dậu';

    const eng = global.NetaDichHocEngine;
    const elmNgay = eng ? (eng.DIA_CHI_NGU_HANH[chiNgay] || 'Mộc') : 'Mộc';
    const elmThang = eng ? (eng.DIA_CHI_NGU_HANH[chiThang] || 'Kim') : 'Kim';

    // Đảm bảo luôn có quẻ mẫu nếu chưa gieo
    if (!state.result) {
      if (state.method === 'luchao') {
        if (state.haoCoins.length === 0) {
          state.haoCoins = [7, 7, 7, 6, 7, 7]; // Phong Thiên Tiểu Súc động Hào 4
        }
        chayLapQueLucHao();
      } else {
        chayLapQueMaiHoa();
      }
    }

    container.innerHTML = `
      <div class="dichhoc-container">
        <!-- 1. Thanh Menu Tab Gọn Gàng -->
        <div class="dh-nav-bar">
          <div class="dh-tab-group">
            <button class="dh-tab-btn ${state.method === 'luchao' ? 'active' : ''}" id="dh-tab-luchao">
              🪙 Lục Hào Nạp Giáp
            </button>
            <button class="dh-tab-btn ${state.method === 'maihoa' ? 'active' : ''}" id="dh-tab-maihoa">
              🌸 Mai Hoa Dịch Số
            </button>
          </div>
          <div class="dh-action-right">
            <button class="dh-icon-btn" id="dh-btn-now" title="Đồng bộ thời gian thực">
              🕒 Hiện Tại
            </button>
            <button class="dh-icon-btn" id="dh-btn-picker" title="Chọn ngày giờ chiêm quẻ">
              📅 Giờ Khác
            </button>
            <button class="dh-icon-btn primary-save" id="dh-btn-save-shot" title="Lưu ảnh quẻ chiêm bái">
              📷 Lưu Ảnh
            </button>
          </div>
        </div>

        <!-- 2. Thẻ Thông Tin Thời Điểm Chiêm Quẻ (Compact Header Strip) -->
        <div class="dh-meta-strip">
          <div class="dh-meta-row">
            <div class="dh-meta-col">
              <span class="m-lbl">Tứ Trụ:</span>
              <strong class="m-val">${canChi.hour || 'Tân Hợi'} • ${canChi.day || 'Nhâm Dần'} • ${canChi.month || 'Đinh Dậu'} • ${canChi.year || 'Bính Ngọ'}</strong>
            </div>
            <div class="dh-meta-col">
              <span class="m-lbl">Dương lịch:</span>
              <span class="m-val">${calInfo.solar.dateStr} (${state.selectedDate.toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})})</span>
            </div>
          </div>
          <div class="dh-meta-row sub-row">
            <div><span class="m-lbl">Tiết khí:</span> <em>${solarTerm}</em></div>
            <div><span class="m-lbl">Nhật thần:</span> <strong>${chiNgay}-${elmNgay}</strong></div>
            <div><span class="m-lbl">Nguyệt lệnh:</span> <strong>${chiThang}-${elmThang}</strong></div>
            <div><span class="m-lbl">Tuần không:</span> <strong style="color:#f59e0b;">${(state.result && state.result.thoi_gian && state.result.thoi_gian.tuanKhong) ? state.result.thoi_gian.tuanKhong.join(', ') : 'Tuất, Hợi'}</strong></div>
          </div>
          <div class="dh-purpose-row">
            <span class="m-lbl">Việc cần xem:</span>
            <input type="text" id="dh-purpose-input" class="dh-purpose-input" value="${state.purpose}" placeholder="Nhập sự vụ muốn chiêm (ví dụ: Hợp tác làm ăn, Tài lộc, Gia sự)...">
          </div>
        </div>

        <!-- 3. Khu Vực Gieo Quẻ Tinh Tế & Gọn Gàng -->
        ${renderInteractionPanel()}

        <!-- 4. Khu Vực Hiển Thị Quẻ & Phân Tích Lục Hào Chuẩn Mobile (Không Tràn Màn Hình) -->
        <div id="dh-result-section">
          ${renderResultSection()}
        </div>
      </div>
    `;

    bindEvents();
  }

  // Render khu vực gieo quẻ tinh gọn
  function renderInteractionPanel() {
    const curHaoCount = state.haoCoins.length;

    if (state.method === 'luchao') {
      const sum = state.coinStates.reduce((a, b) => a + b, 0);
      let sumDesc = '';
      if (sum === 6) sumDesc = '2 + 2 + 2 = 6 • Lão Âm (Hào Âm Động ☷ ➔ ☰)';
      else if (sum === 7) sumDesc = '2 + 2 + 3 = 7 • Thiếu Dương (Hào Dương Tĩnh ☰)';
      else if (sum === 8) sumDesc = '2 + 3 + 3 = 8 • Thiếu Âm (Hào Âm Tĩnh ☷)';
      else if (sum === 9) sumDesc = '3 + 3 + 3 = 9 • Lão Dương (Hào Dương Động ☰ ➔ ☷)';

      return `
        <div class="dh-toss-card">
          <!-- 3 Đồng Xu Càn Long Nhỏ Gọn Tinh Xảo -->
          <div class="dh-coins-tray" id="dh-coins-tray" title="Chạm để gieo hào tiếp theo">
            <div class="dh-coins-group">
              ${[0, 1, 2].map(idx => renderCoinSVG(state.coinStates[idx] || 3, state.isFlipping, idx)).join('')}
            </div>
            <div class="dh-toss-sum-pill ${state.isFlipping ? 'flipping' : ''}">
              ${state.isFlipping ? '✨ Đang gieo đồng tiền cổ...' : `🪙 ${sumDesc}`}
            </div>
          </div>

          <!-- Thang 6 Hào Gọn Gàng (Từ Dưới Lên) -->
          <div class="dh-steps-row">
            ${[1, 2, 3, 4, 5, 6].map(h => {
              const isDone = h <= curHaoCount;
              const isCur = (h === curHaoCount + 1);
              let valStr = '';
              if (isDone) {
                const val = state.haoCoins[h - 1];
                if (val === 6) valStr = '6 (L.Âm)';
                else if (val === 7) valStr = '7 (Dương)';
                else if (val === 8) valStr = '8 (Âm)';
                else if (val === 9) valStr = '9 (L.Dương)';
              }
              return `
                <div class="dh-mini-step ${isDone ? 'done' : ''} ${isCur ? 'active' : ''}">
                  <span class="step-num">H${h}</span>
                  <span class="step-val">${valStr ? valStr.split(' ')[0] : '•'}</span>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Cụm Nút Thao Tác -->
          <div class="dh-btn-actions">
            <button class="dh-action-btn primary" id="dh-btn-cast-step" ${curHaoCount >= 6 ? 'disabled style="opacity:0.5;"' : ''}>
              🎲 Gieo Hào ${Math.min(6, curHaoCount + 1)}/6
            </button>
            <button class="dh-action-btn speed" id="dh-btn-cast-auto">
              ⚡ Gieo Tự Động 6 Hào
            </button>
            <button class="dh-action-btn outline" id="dh-btn-reset-cast">
              🔄 Gieo Lại
            </button>
          </div>
        </div>
      `;
    } else {
      // Mai Hoa Dịch Số
      return `
        <div class="dh-toss-card">
          <div class="dh-mh-selector">
            <button class="dh-mh-btn ${state.maiHoaMode === 'time' ? 'active' : ''}" id="dh-mh-tab-time">
              🕒 Theo Thời Gian Tiết Khí
            </button>
            <button class="dh-mh-btn ${state.maiHoaMode === 'numbers' ? 'active' : ''}" id="dh-mh-tab-numbers">
              🔢 Theo 2 Số Tâm Linh
            </button>
          </div>

          ${state.maiHoaMode === 'numbers' ? `
            <div class="dh-numbers-row">
              <div class="num-col">
                <label>Số A (Thượng quái):</label>
                <input type="number" id="dh-inp-num-a" class="dh-num-input" value="${state.soA}" min="1" max="9999">
              </div>
              <div class="num-col">
                <label>Số B (Hạ quái):</label>
                <input type="number" id="dh-inp-num-b" class="dh-num-input" value="${state.soB}" min="1" max="9999">
              </div>
            </div>
          ` : `
            <div class="dh-mh-note">
              Công thức Tiên Thiên: <strong>(Năm + Tháng + Ngày) mod 8</strong> làm Thượng Quái • <strong>(+ Giờ) mod 8</strong> làm Hạ Quái • <strong>Tổng mod 6</strong> tìm Hào Động.
            </div>
          `}

          <div class="dh-btn-actions">
            <button class="dh-action-btn primary" id="dh-btn-run-maihoa" style="min-width: 180px;">
              🌸 Khởi Quẻ Mai Hoa
            </button>
          </div>
        </div>
      `;
    }
  }

  // =========================================================================
  // 4. RENDER BẢN QUẺ & PHÂN TÍCH LỤC HÀO CHUẨN MỰC (MOBILE-FIRST)
  // =========================================================================
  function renderResultSection() {
    if (!state.result) return '';

    const isLucHao = (state.method === 'luchao');
    const res = isLucHao ? state.result : (state.result.luc_hao || state.result);
    const goc = isLucHao ? res.que_goc : {
      name: state.result.que_chu.name,
      tuong: state.result.que_chu.tuong,
      tho: state.result.que_chu.tho,
      cung: state.result.que_chu.cung,
      cungSpecial: state.result.que_chu.cungSpecial,
      bits: state.result.que_chu.bits,
      haos: (res && res.que_goc) ? res.que_goc.haos : []
    };
    const ho = !isLucHao ? state.result.que_ho : null;
    const bien = isLucHao ? res.que_bien : (res ? res.que_bien : {
      name: state.result.que_bien.name,
      tuong: state.result.que_bien.tuong,
      tho: state.result.que_bien.tho,
      cung: state.result.que_bien.cung,
      cungSpecial: state.result.que_bien.cungSpecial,
      bits: state.result.que_bien.bits,
      haos: (res && res.que_bien) ? res.que_bien.haos : []
    });

    const phuc = res ? (res.phuc_than || []) : [];

    return `
      <div class="dh-main-result-card" id="dh-capture-target">
        <!-- A. ĐỒ HÌNH CÁC QUẺ (Vừa vặn trên cùng 1 hàng, thanh mảnh, sang trọng) -->
        <div class="dh-hex-arena ${ho ? 'triple' : 'dual'}">
          <!-- Quẻ Gốc / Quẻ Chủ -->
          <div class="dh-hex-item">
            <div class="hex-badge chu">${ho ? 'Quẻ Chủ' : 'Bản Quái'}</div>
            <div class="hex-name">${goc.name}</div>
            <div class="hex-bars">
              ${renderBarsSlim(goc.bits, goc.haos ? goc.haos.map(h => h.isDong) : [state.result.hao_dong === 1, state.result.hao_dong === 2, state.result.hao_dong === 3, state.result.hao_dong === 4, state.result.hao_dong === 5, state.result.hao_dong === 6])}
            </div>
            <div class="hex-cung">Họ ${goc.cung}${goc.cungSpecial ? ` (${goc.cungSpecial})` : ''}</div>
            <div class="hex-samtru">${goc.tuong ? goc.tuong.toUpperCase() : ''}</div>
          </div>

          <!-- Quẻ Hỗ (Nếu là Mai Hoa) -->
          ${ho ? `
            <div class="dh-hex-item">
              <div class="hex-badge ho">Quẻ Hỗ</div>
              <div class="hex-name">${ho.name}</div>
              <div class="hex-bars">
                ${renderBarsSlim(ho.bits, [])}
              </div>
              <div class="hex-cung">Họ ${ho.cung}${ho.cungSpecial ? ` (${ho.cungSpecial})` : ''}</div>
              <div class="hex-samtru">${ho.tuong ? ho.tuong.toUpperCase() : ''}</div>
            </div>
          ` : ''}

          <!-- Quẻ Biến -->
          <div class="dh-hex-item">
            <div class="hex-badge bien">Biến Quái</div>
            <div class="hex-name">${bien ? bien.name : 'Thuần Tĩnh'}</div>
            <div class="hex-bars">
              ${bien ? renderBarsSlim(bien.bits, []) : '<div style="font-size:0.7rem; color:#64748b; padding:18px 0;">Không động</div>'}
            </div>
            <div class="hex-cung">${bien ? `Họ ${bien.cung}${bien.cungSpecial ? ` (${bien.cungSpecial})` : ''}` : 'Bất biến'}</div>
            <div class="hex-samtru">${(bien && bien.tuong) ? bien.tuong.toUpperCase() : ''}</div>
          </div>
        </div>

        <!-- B. BẢNG PHÂN TÍCH LỤC HÀO NẠP GIÁP (ĐỐI XỨNG, 100% VỪA MÀN HÌNH KHÔNG TRÀN) -->
        <div class="dh-yao-list-box">
          <div class="dh-box-header">
            <span>📋 PHÂN TÍCH 6 HÀO NẠP GIÁP & THẦN SÁT (TỪ HÀO 6 XUỐNG HÀO 1)</span>
          </div>

          <div class="dh-yao-stack">
            ${[5, 4, 3, 2, 1, 0].map(i => {
              const hGoc = goc.haos ? goc.haos[i] : null;
              const hBien = (bien && bien.haos) ? bien.haos[i] : null;
              if (!hGoc) return '';
              const isDong = hGoc.isDong;
              const phucItem = phuc.find(p => p.pos === hGoc.pos);

              return `
                <div class="dh-yao-row ${isDong ? 'is-dong' : ''}">
                  <!-- Cột 1: Vị trí & Vạch Hào & Thế/Ứng -->
                  <div class="yao-col-pos">
                    <span class="pos-text">H${hGoc.pos}</span>
                    <div class="mini-bar-wrap">${renderMiniYaoBar(hGoc.bit, isDong)}</div>
                    ${hGoc.isThe ? '<span class="pill-the">Thế</span>' : ''}
                    ${hGoc.isUng ? '<span class="pill-ung">Ứng</span>' : ''}
                  </div>

                  <!-- Cột 2: Nội dung chính linh hoạt 2 tầng (Mobile-First không đè chữ) -->
                  <div class="yao-col-body">
                    <div class="yao-sub-top">
                      <div class="yao-thu-tag">
                        <span>${hGoc.lucThu}</span>
                        ${phucItem ? `<span class="yao-phuc-inline">Phục: ${phucItem.lucThan.split(' ')[0]}-${phucItem.chi}</span>` : ''}
                      </div>
                      <div class="sat-badges">
                        ${hGoc.isTuanKhong ? '<span class="tag-tk">TK</span>' : ''}
                        <span class="tag-vs ${hGoc.vuongSuy === 'Vượng' ? 'v-vuong' : ''}">${hGoc.vuongSuy}</span>
                        ${hGoc.isQuaiThan ? '<span class="tag-qt">QT</span>' : ''}
                        ${hGoc.isLoc ? '<span class="tag-ts">Lộc</span>' : ''}
                        ${hGoc.isMa ? '<span class="tag-ts">Mã</span>' : ''}
                        ${hGoc.isQuy ? '<span class="tag-ts">Quý</span>' : ''}
                        ${hGoc.isDao ? '<span class="tag-ts">Đào</span>' : ''}
                      </div>
                    </div>

                    <div class="yao-sub-main ${isDong ? 'text-dong' : ''}">
                      <div class="yao-goc-main">
                        <strong>${hGoc.lucThan}</strong>
                        <span class="yao-canchi">${hGoc.can}-${hGoc.chi}</span>
                        <span class="yao-elm">(${hGoc.chiElement})</span>
                      </div>
                      ${isDong && hBien ? `
                        <div class="yao-bien-inline">
                          <span class="arrow-dong">&rarr;</span>
                          <strong>${hBien.lucThan}</strong>
                          <span class="yao-canchi">${hBien.can}-${hBien.chi}</span>
                          <span class="yao-elm">(${hBien.chiElement})</span>
                        </div>
                      ` : ''}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- C. THUYẾT MINH THỂ - DỤNG (NẾU LÀ MAI HOA) HOẶC LỜI THOÁN QUẺ -->
        ${!isLucHao && state.result.the_dung ? `
          <div class="dh-the-dung-card">
            <div class="td-header">
              <span>⚖️ THỂ DỤNG MAI HOA (HÀO ĐỘNG: HÀO ${state.result.hao_dong})</span>
            </div>
            <div class="td-flex">
              <div class="td-cell">
                <span class="td-lbl">THỂ (Chủ):</span>
                <strong class="td-val">${state.result.the_dung.the.info.name} (${state.result.the_dung.the.info.element})</strong>
              </div>
              <div class="td-cell">
                <span class="td-lbl">DỤNG (Sự vụ):</span>
                <strong class="td-val" style="color:#ef4444;">${state.result.the_dung.dung.info.name} (${state.result.the_dung.dung.info.element})</strong>
              </div>
            </div>
            <div class="td-verdict ${state.result.the_dung.muc_do || 'cat'}">
              ${state.result.the_dung.danh_gia}
            </div>
          </div>
        ` : `
          <div class="dh-tho-card">
            <div class="tho-lbl">Lời Kinh Dịch Cốt Tủy:</div>
            <div class="tho-txt">"${goc.tho || 'Cương kiện trung chính, hanh thông đại cát.'}"</div>
          </div>
        `}
      </div>
    `;
  }

  // Render 6 vạch hào thanh mảnh, thẩm mỹ cao
  function renderBarsSlim(bits, dongFlags = []) {
    let html = '';
    for (let i = 5; i >= 0; i--) {
      const bit = bits[i];
      const isDong = dongFlags[i] || false;
      const isYang = (bit === 1);

      html += `
        <div class="dh-bar-row ${isDong ? 'is-dong' : ''}">
          ${isYang ? `
            <div class="dh-bar yang ${isDong ? 'dong' : ''}"></div>
          ` : `
            <div class="dh-bar yin ${isDong ? 'dong' : ''}">
              <div class="seg"></div>
              <div class="space"></div>
              <div class="seg"></div>
            </div>
          `}
        </div>
      `;
    }
    return html;
  }

  // Render vạch hào mini
  function renderMiniYaoBar(bit, isDong) {
    if (bit === 1) {
      return `<div class="mini-bar yang ${isDong ? 'dong' : ''}"></div>`;
    } else {
      return `
        <div class="mini-bar yin ${isDong ? 'dong' : ''}">
          <span></span><span></span>
        </div>
      `;
    }
  }

  // =========================================================================
  // 5. CÁC HÀM XỬ LÝ SỰ KIỆN & TÍNH TOÁN
  // =========================================================================
  function chayLapQueLucHao() {
    const eng = global.NetaDichHocEngine;
    if (!eng || !eng.LucHaoEngine) return;
    const cal = getCalendarInfo(state.selectedDate);
    state.result = eng.LucHaoEngine.lapQue(state.haoCoins, cal);
  }

  function chayLapQueMaiHoa() {
    const eng = global.NetaDichHocEngine;
    if (!eng || !eng.MaiHoaEngine) return;
    const cal = getCalendarInfo(state.selectedDate);

    if (state.maiHoaMode === 'time') {
      const canChi = cal.canChi || {};
      const zhiNames = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
      const namZhi = canChi.yearZhi || 'Ngọ';
      const namIdx = zhiNames.indexOf(namZhi) + 1;
      const thangAm = cal.lunar ? cal.lunar.month : (state.selectedDate.getMonth() + 1);
      const ngayAm = cal.lunar ? cal.lunar.day : state.selectedDate.getDate();
      const gioZhi = canChi.hourZhi || 'Hợi';
      const gioIdx = zhiNames.indexOf(gioZhi) + 1;

      state.result = eng.MaiHoaEngine.lapQueThoiGian(namIdx, thangAm, ngayAm, gioIdx, cal);
    } else {
      state.result = eng.MaiHoaEngine.lapQueTheoHaiSo(state.soA, state.soB, 0, cal);
    }
  }

  // Gieo 1 hào ngẫu nhiên
  function gieoMotHao() {
    if (state.isFlipping) return;
    if (state.haoCoins.length >= 6) {
      if (global.showToast) global.showToast('✅ Đã gieo đủ 6 hào. Bấm "Gieo Lại" nếu muốn bốc quẻ mới.');
      return;
    }

    state.isFlipping = true;
    triggerHaptic(25);
    playCoinAudio('clink');

    const c1 = Math.random() < 0.5 ? 2 : 3;
    const c2 = Math.random() < 0.5 ? 2 : 3;
    const c3 = Math.random() < 0.5 ? 2 : 3;

    state.coinStates = [c1, c2, c3];
    state.coinAngles = [
      Math.floor(Math.random() * 50) - 25,
      Math.floor(Math.random() * 50) - 25,
      Math.floor(Math.random() * 50) - 25
    ];

    render();

    setTimeout(() => {
      state.isFlipping = false;
      const total = c1 + c2 + c3;
      state.haoCoins.push(total);
      triggerHaptic(15);
      playCoinAudio('clink');

      if (state.haoCoins.length >= 6) {
        chayLapQueLucHao();
        setTimeout(() => playCoinAudio('done'), 150);
      }
      render();
    }, 550);
  }

  // Gieo nhanh 6 hào
  function gieoTuDong6Hao() {
    state.haoCoins = [];
    for (let i = 0; i < 6; i++) {
      const c1 = Math.random() < 0.5 ? 2 : 3;
      const c2 = Math.random() < 0.5 ? 2 : 3;
      const c3 = Math.random() < 0.5 ? 2 : 3;
      state.haoCoins.push(c1 + c2 + c3);
    }
    state.coinStates = [
      Math.random() < 0.5 ? 2 : 3,
      Math.random() < 0.5 ? 2 : 3,
      Math.random() < 0.5 ? 2 : 3
    ];
    chayLapQueLucHao();
    playCoinAudio('done');
    triggerHaptic(35);
    render();
  }

  // Gắn sự kiện giao diện
  function bindEvents() {
    const tabLucHao = document.getElementById('dh-tab-luchao');
    if (tabLucHao) {
      tabLucHao.onclick = () => {
        state.method = 'luchao';
        if (state.haoCoins.length === 0) state.haoCoins = [7, 7, 7, 6, 7, 7];
        chayLapQueLucHao();
        render();
      };
    }

    const tabMaiHoa = document.getElementById('dh-tab-maihoa');
    if (tabMaiHoa) {
      tabMaiHoa.onclick = () => {
        state.method = 'maihoa';
        chayLapQueMaiHoa();
        render();
      };
    }

    const btnCastStep = document.getElementById('dh-btn-cast-step');
    if (btnCastStep) btnCastStep.onclick = gieoMotHao;

    const tray = document.getElementById('dh-coins-tray');
    if (tray) tray.onclick = gieoMotHao;

    const btnCastAuto = document.getElementById('dh-btn-cast-auto');
    if (btnCastAuto) btnCastAuto.onclick = gieoTuDong6Hao;

    const btnResetCast = document.getElementById('dh-btn-reset-cast');
    if (btnResetCast) {
      btnResetCast.onclick = () => {
        state.haoCoins = [];
        state.result = null;
        render();
      };
    }

    const mhTabTime = document.getElementById('dh-mh-tab-time');
    if (mhTabTime) {
      mhTabTime.onclick = () => {
        state.maiHoaMode = 'time';
        chayLapQueMaiHoa();
        render();
      };
    }

    const mhTabNumbers = document.getElementById('dh-mh-tab-numbers');
    if (mhTabNumbers) {
      mhTabNumbers.onclick = () => {
        state.maiHoaMode = 'numbers';
        chayLapQueMaiHoa();
        render();
      };
    }

    const inpNumA = document.getElementById('dh-inp-num-a');
    if (inpNumA) {
      inpNumA.oninput = (e) => {
        state.soA = parseInt(e.target.value, 10) || 1;
      };
    }

    const inpNumB = document.getElementById('dh-inp-num-b');
    if (inpNumB) {
      inpNumB.oninput = (e) => {
        state.soB = parseInt(e.target.value, 10) || 1;
      };
    }

    const btnRunMaiHoa = document.getElementById('dh-btn-run-maihoa');
    if (btnRunMaiHoa) {
      btnRunMaiHoa.onclick = () => {
        chayLapQueMaiHoa();
        render();
      };
    }

    const purposeInput = document.getElementById('dh-purpose-input');
    if (purposeInput) {
      purposeInput.oninput = (e) => {
        state.purpose = e.target.value;
      };
    }

    const btnNow = document.getElementById('dh-btn-now');
    if (btnNow) {
      btnNow.onclick = () => {
        state.selectedDate = new Date();
        if (state.method === 'luchao') chayLapQueLucHao();
        else chayLapQueMaiHoa();
        render();
        if (global.showToast) global.showToast('🕒 Đã đồng bộ theo thời gian thực');
      };
    }

    const btnPicker = document.getElementById('dh-btn-picker');
    if (btnPicker) btnPicker.onclick = openDateTimePickerModal;

    const btnSaveShot = document.getElementById('dh-btn-save-shot');
    if (btnSaveShot) {
      btnSaveShot.onclick = exportDichQuaiScreenshot;
    }
  }

  // Chụp ảnh màn hình quẻ chiêm bái Ultra-HD
  function exportDichQuaiScreenshot() {
    const target = document.getElementById('dh-capture-target') || document.querySelector('.dh-main-result-card');
    if (!target) return;

    if (global.showToast) global.showToast('⏳ Đang tạo ảnh quẻ Ultra-HD...');

    if (typeof html2canvas === 'function') {
      html2canvas(target, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#0f172a'
      }).then(canvas => {
        const dataUrl = canvas.toDataURL('image/png');
        const filename = `QueDichLy_${state.method}_${Date.now()}.png`;

        if (global.NativeBridge && typeof global.NativeBridge.saveImageToGallery === 'function') {
          global.NativeBridge.saveImageToGallery(dataUrl, filename);
        } else {
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
        if (global.showToast) global.showToast(`✅ Đã lưu ảnh quẻ: ${filename}`);
      }).catch(err => {
        console.error('Screenshot error:', err);
        if (global.showToast) global.showToast('❌ Không thể xuất ảnh: ' + err.message);
      });
    } else {
      if (typeof global.captureArenaScreenshot === 'function') {
        global.captureArenaScreenshot();
      } else {
        alert('Trình duyệt chưa hỗ trợ xuất ảnh.');
      }
    }
  }

  // Modal chọn ngày giờ tùy ý
  function openDateTimePickerModal() {
    let overlay = document.getElementById('dh-picker-modal-overlay');
    if (overlay) overlay.remove();

    const d = state.selectedDate;
    const pad = (n) => String(n).padStart(2, '0');
    const curVal = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    overlay = document.createElement('div');
    overlay.id = 'dh-picker-modal-overlay';
    overlay.className = 'dh-modal-overlay';
    overlay.innerHTML = `
      <div class="dh-modal-dialog">
        <div class="dh-modal-header">
          <div class="dh-modal-title">📅 CHỌN THỜI ĐIỂM CHIÊM QUẺ</div>
          <button class="dh-icon-btn" id="dh-modal-close-btn" style="border:none; background:transparent;">✕</button>
        </div>
        <div style="font-size: 0.74rem; color: #94a3b8; margin-bottom: 10px;">
          Chọn mốc thời gian để tự động tính Can Chi 4 trụ, Tiết Khí, Nguyệt Lệnh & Nhật Thần:
        </div>
        <input type="datetime-local" id="dh-custom-dt-input" class="dh-num-input" value="${curVal}">
        <div style="display: flex; gap: 8px; margin-top: 14px;">
          <button class="dh-action-btn outline" id="dh-modal-cancel" style="width: 50%;">Hủy</button>
          <button class="dh-action-btn primary" id="dh-modal-confirm" style="width: 50%;">Xác Nhận</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    document.getElementById('dh-modal-close-btn').onclick = close;
    document.getElementById('dh-modal-cancel').onclick = close;
    document.getElementById('dh-modal-confirm').onclick = () => {
      const val = document.getElementById('dh-custom-dt-input').value;
      if (val) {
        state.selectedDate = new Date(val);
        if (state.method === 'luchao') chayLapQueLucHao();
        else chayLapQueMaiHoa();
        render();
        if (global.showToast) global.showToast(`📅 Đã cập nhật thời gian: ${state.selectedDate.toLocaleString('vi-VN')}`);
      }
      close();
    };
  }

  // Public module API
  const NetaDichHocView = {
    init: () => {},
    render: render,
    setMethod: (m) => {
      state.method = m;
      render();
    }
  };

  global.NetaDichHocView = NetaDichHocView;

})(typeof window !== 'undefined' ? window : this);
