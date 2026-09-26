/**
 * NETA LIGHT - DỊCH HỌC VIEW CONTROLLER (modules/dichhoc_view.js)
 * Giao diện Bốc Quẻ Dịch Lý (Lục Hào Nạp Giáp & Mai Hoa Dịch Số).
 * Tối ưu hóa tinh tế theo chuẩn mực TRANG DỊCH QUÁI của Học Viện Lý Số (Bốc Phệ Cổ Truyền).
 * Đồ họa đồng tiền Càn Long Thông Bảo 3D, âm thanh kim loại Web Audio API, và bảng đối sánh 2 cột chuẩn mực.
 */

(function (global) {
  'use strict';

  // State quản lý của module Dịch Học
  const state = {
    method: 'luchao', // 'luchao' | 'maihoa'
    viewMode: 'chart', // 'chart' (Trang Dịch Quái chuẩn) | 'detailed' (Thuyết minh luận giải)
    selectedDate: new Date(),
    purpose: 'Hợp tác phát triển', // Việc cần xem
    haoCoins: [], // Danh sách các hào đã gieo (1 -> 6), mỗi hào nhận 6, 7, 8, 9
    coinStates: [3, 2, 3], // 3 đồng xu hiện tại (2: Âm - Càn Long, 3: Dương - Mãn Châu)
    coinAngles: [12, -25, 38], // Góc xoay tự nhiên sau khi rơi
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
        // Chuông thiền kết quẻ ngân vang
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.18 / (idx + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.25);
        });
      } else {
        // Tiếng leng keng kim loại tiền đồng
        const freqs = [1520, 2350, 3450, 4900];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq + (Math.random() * 80 - 40), now);
          gain.gain.setValueAtTime(0.12 / (idx + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35 + Math.random() * 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.5);
        });
      }
    } catch (e) {
      // Audio không khả dụng không gây lỗi
    }
  }

  // Rung phản hồi xúc giác nhẹ (Haptic)
  function triggerHaptic(duration = 25) {
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

  // Render SVG đồng tiền Càn Long Thông Bảo cổ pháp
  function renderCoinSVG(val, isFlipping, idx) {
    const isYang = (val === 3); // 3 = Dương (Lưng Mãn Châu), 2 = Âm (Mặt chữ Càn Long)
    const angle = state.coinAngles[idx] || 0;

    return `
      <div class="dh-coin-wrapper ${isFlipping ? 'is-tossing' : ''}" style="transform: rotate(${isFlipping ? 0 : angle}deg);" data-coin-idx="${idx}" title="${isYang ? 'Mặt Dương / Lưng Mãn Châu (3 điểm)' : 'Mặt Âm / Càn Long Thông Bảo (2 điểm)'}">
        ${isYang ? `
          <!-- MẶT DƯƠNG: CHỮ MÃN CHÂU (3 ĐIỂM) -->
          <svg class="dh-coin-svg" viewBox="0 0 100 100">
            <defs>
              <radialGradient id="gradYang${idx}" cx="45%" cy="38%" r="60%">
                <stop offset="0%" stop-color="#eed58f" />
                <stop offset="35%" stop-color="#bf9543" />
                <stop offset="75%" stop-color="#7e5d22" />
                <stop offset="100%" stop-color="#4a3511" />
              </radialGradient>
              <filter id="shadowYang${idx}">
                <feDropShadow dx="0" dy="1.2" stdDeviation="0.6" flood-color="#fff2be" flood-opacity="0.65" />
                <feDropShadow dx="0" dy="-1" stdDeviation="0.6" flood-color="#1f1404" flood-opacity="0.9" />
              </filter>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#gradYang${idx})" stroke="#382509" stroke-width="2.5" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="#fae8ab" stroke-width="1.2" opacity="0.65" />
            <circle cx="50" cy="50" r="41.5" fill="none" stroke="#2a1b06" stroke-width="1.2" opacity="0.8" />
            
            <rect x="36.5" y="36.5" width="27" height="27" fill="none" stroke="#251604" stroke-width="2.2" />
            <rect x="38" y="38" width="24" height="24" fill="#18130c" stroke="#d5b058" stroke-width="1" />

            <!-- Ký tự Mãn Châu (Boo Ciowan) -->
            <text x="21" y="58" font-family="'KaiTi', 'STKaiti', serif" font-size="18" font-weight="900" text-anchor="middle" fill="#2d1b06" filter="url(#shadowYang${idx})">ᠪᠣᠣ</text>
            <text x="79" y="58" font-family="'KaiTi', 'STKaiti', serif" font-size="18" font-weight="900" text-anchor="middle" fill="#2d1b06" filter="url(#shadowYang${idx})">ᠴᡳᠶᠣ</text>
            
            <!-- Chấm họa tiết cung đình đỉnh đáy -->
            <circle cx="50" cy="22" r="3" fill="#2d1b06" opacity="0.6" />
            <circle cx="50" cy="78" r="3" fill="#2d1b06" opacity="0.6" />
          </svg>
        ` : `
          <!-- MẶT ÂM: 4 CHỮ CÀN LONG THÔNG BẢO (2 ĐIỂM) -->
          <svg class="dh-coin-svg" viewBox="0 0 100 100">
            <defs>
              <radialGradient id="gradYin${idx}" cx="45%" cy="38%" r="60%">
                <stop offset="0%" stop-color="#e2bf70" />
                <stop offset="35%" stop-color="#b08637" />
                <stop offset="75%" stop-color="#73521a" />
                <stop offset="100%" stop-color="#422f0d" />
              </radialGradient>
              <filter id="shadowYin${idx}">
                <feDropShadow dx="0" dy="1.2" stdDeviation="0.6" flood-color="#fdf1c2" flood-opacity="0.65" />
                <feDropShadow dx="0" dy="-1" stdDeviation="0.6" flood-color="#1f1404" flood-opacity="0.9" />
              </filter>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#gradYin${idx})" stroke="#382509" stroke-width="2.5" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="#fae8ab" stroke-width="1.2" opacity="0.65" />
            <circle cx="50" cy="50" r="41.5" fill="none" stroke="#2a1b06" stroke-width="1.2" opacity="0.8" />
            
            <rect x="36.5" y="36.5" width="27" height="27" fill="none" stroke="#251604" stroke-width="2.2" />
            <rect x="38" y="38" width="24" height="24" fill="#18130c" stroke="#d5b058" stroke-width="1" />

            <!-- 4 Chữ Hán Càn Long Thông Bảo -->
            <text x="50" y="27" font-family="'KaiTi', 'STKaiti', 'SimSun', serif" font-size="16.5" font-weight="900" text-anchor="middle" fill="#281704" filter="url(#shadowYin${idx})">乾</text>
            <text x="50" y="87" font-family="'KaiTi', 'STKaiti', 'SimSun', serif" font-size="16.5" font-weight="900" text-anchor="middle" fill="#281704" filter="url(#shadowYin${idx})">隆</text>
            <text x="20.5" y="56.5" font-family="'KaiTi', 'STKaiti', 'SimSun', serif" font-size="16.5" font-weight="900" text-anchor="middle" fill="#281704" filter="url(#shadowYin${idx})">通</text>
            <text x="79.5" y="56.5" font-family="'KaiTi', 'STKaiti', 'SimSun', serif" font-size="16.5" font-weight="900" text-anchor="middle" fill="#281704" filter="url(#shadowYin${idx})">寶</text>
          </svg>
        `}
        <div class="dh-coin-val-tag">${isYang ? '3 (Dương)' : '2 (Âm)'}</div>
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

    // Đảm bảo luôn có quẻ khởi tạo mẫu nếu chưa gieo
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
        <!-- 1. Thanh Menu Tab & Điều Khiển Nhanh -->
        <div class="dh-nav-bar">
          <div class="dh-tab-group">
            <button class="dh-tab-btn ${state.method === 'luchao' ? 'active' : ''}" id="dh-tab-luchao">
              <span>🪙</span> Lục Hào Nạp Giáp
            </button>
            <button class="dh-tab-btn ${state.method === 'maihoa' ? 'active' : ''}" id="dh-tab-maihoa">
              <span>🌸</span> Mai Hoa Dịch Số
            </button>
          </div>
          <div class="dh-action-right">
            <button class="dh-icon-btn ${state.viewMode === 'chart' ? 'active-mode' : ''}" id="dh-btn-mode-toggle" title="Chuyển chế độ xem">
              ${state.viewMode === 'chart' ? '📖 Luận Giải' : '📜 Trang Dịch Quái'}
            </button>
            <button class="dh-icon-btn" id="dh-btn-now" title="Đồng bộ thời gian thực">
              🕒 Hiện Tại
            </button>
            <button class="dh-icon-btn" id="dh-btn-picker" title="Chọn ngày giờ chiêm quẻ">
              📅 Chọn Giờ
            </button>
            <button class="dh-icon-btn primary-save" id="dh-btn-save-shot" title="Lưu ảnh Trang Dịch Quái Ultra-HD">
              📷 Lưu Ảnh Quẻ
            </button>
          </div>
        </div>

        <!-- 2. Khu Vực Tương Tác Gieo Quẻ Tinh Tế -->
        ${renderInteractionPanel()}

        <!-- 3. Khu Vực Hiển Thị Kết Quả Quẻ (Trang Dịch Quái Chuẩn Mực hoặc Luận Giải Chi Tiết) -->
        <div id="dh-result-section">
          ${state.viewMode === 'chart' ? renderTrangDichQuaiChart() : renderDetailedReport()}
        </div>
      </div>
    `;

    bindEvents();
  }

  // Render khu vực gieo quẻ tinh tế
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
        <div class="dh-cast-panel">
          <div class="dh-cast-panel-header">
            <div class="dh-panel-title">
              <span class="dh-panel-icon">🪙</span> BÀN GIEO XU CỔ PHÁP (3 ĐỒNG TIỀN CÀN LONG)
            </div>
            <div class="dh-panel-sub">
              Chạm vào đĩa đồng hoặc bấm nút để gieo lần lượt từ Hào 1 (Sơ hào ở dưới) lên Hào 6 (Thượng hào ở trên).
            </div>
          </div>

          <!-- Khay Gieo Xu Thiền Môn -->
          <div class="dh-sacred-tray" id="dh-sacred-tray" title="Chạm để gieo hào tiếp theo">
            <div class="dh-tray-rim"></div>
            <div class="dh-coins-cluster">
              ${[0, 1, 2].map(idx => renderCoinSVG(state.coinStates[idx] || 3, state.isFlipping, idx)).join('')}
            </div>
            <div class="dh-tray-result-pill ${state.isFlipping ? 'animating' : ''}">
              ${state.isFlipping ? '✨ Đang tung 3 đồng tiền cổ...' : `🪙 ${sumDesc}`}
            </div>
          </div>

          <!-- Thang Tiến Trình 6 Hào Mọc Từ Dưới Lên -->
          <div class="dh-progress-container">
            <div class="dh-progress-label">Tiến trình hào quái (Gieo từ dưới lên):</div>
            <div class="dh-progress-bar">
              ${[1, 2, 3, 4, 5, 6].map(h => {
                const isDone = h <= curHaoCount;
                const isCur = (h === curHaoCount + 1);
                let tag = '';
                if (isDone) {
                  const val = state.haoCoins[h - 1];
                  if (val === 6) tag = '6 (L.Âm)';
                  else if (val === 7) tag = '7 (Dương)';
                  else if (val === 8) tag = '8 (Âm)';
                  else if (val === 9) tag = '9 (L.Dương)';
                }
                return `
                  <div class="dh-step-pill ${isDone ? 'done' : ''} ${isCur ? 'active' : ''}">
                    <span class="h-name">Hào ${h}</span>
                    <span class="h-val">${tag || '-'}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Dãy Nút Thao Tác -->
          <div class="dh-buttons-row">
            <button class="dh-btn primary" id="dh-btn-cast-step" ${curHaoCount >= 6 ? 'disabled style="opacity:0.55;"' : ''}>
              🎲 Gieo Hào ${Math.min(6, curHaoCount + 1)} / 6
            </button>
            <button class="dh-btn auto-speed" id="dh-btn-cast-auto">
              ⚡ Gieo Tự Động 6 Hào
            </button>
            <button class="dh-btn secondary" id="dh-btn-reset-cast">
              🔄 Gieo Lại Từ Đầu
            </button>
          </div>
        </div>
      `;
    } else {
      // Mai Hoa Dịch Số
      return `
        <div class="dh-cast-panel">
          <div class="dh-cast-panel-header">
            <div class="dh-panel-title">
              <span class="dh-panel-icon">🌸</span> KHỞI QUẺ MAI HOA DỊCH SỐ (THIỆU KHANG TIẾT)
            </div>
            <div class="dh-panel-sub">
              Khởi quẻ theo Tiên Thiên Bát Quái dựa vào thời điểm tiết khí hoặc hai con số linh cảm.
            </div>
          </div>

          <div class="dh-mh-mode-switcher">
            <button class="dh-mh-pill-btn ${state.maiHoaMode === 'time' ? 'active' : ''}" id="dh-mh-tab-time">
              🕒 Theo Niên Nguyệt Nhật Thời
            </button>
            <button class="dh-mh-pill-btn ${state.maiHoaMode === 'numbers' ? 'active' : ''}" id="dh-mh-tab-numbers">
              🔢 Theo 2 Con Số (Số Học)
            </button>
          </div>

          ${state.maiHoaMode === 'numbers' ? `
            <div class="dh-mh-numbers-box">
              <div class="dh-inp-col">
                <label>Số A (Thượng quái):</label>
                <input type="number" id="dh-inp-num-a" class="dh-input-box" value="${state.soA}" min="1" max="99999">
              </div>
              <div class="dh-inp-col">
                <label>Số B (Hạ quái):</label>
                <input type="number" id="dh-inp-num-b" class="dh-input-box" value="${state.soB}" min="1" max="99999">
              </div>
            </div>
          ` : `
            <div class="dh-mh-time-formula">
              Công thức Tiên Thiên: <strong>(Năm + Tháng + Ngày) mod 8</strong> làm Thượng Quái • <strong>(Năm + Tháng + Ngày + Giờ) mod 8</strong> làm Hạ Quái • <strong>Tổng mod 6</strong> tìm Hào Động.
            </div>
          `}

          <div class="dh-buttons-row">
            <button class="dh-btn primary" id="dh-btn-run-maihoa">
              🌸 Lập Quẻ Mai Hoa
            </button>
          </div>
        </div>
      `;
    }
  }

  // =========================================================================
  // 4. RENDER "TRANG DỊCH QUÁI" CHUẨN MỰC HỌC VIỆN LÝ SỐ (Y HỆT 2 ẢNH)
  // =========================================================================
  function renderTrangDichQuaiChart() {
    if (!state.result) return '';

    const calInfo = getCalendarInfo(state.selectedDate);
    const canChi = calInfo.canChi || {};
    const solarTerm = calInfo.solarTerm || 'Thu phân';
    const chiNgay = canChi.dayZhi || 'Dần';
    const chiThang = canChi.monthZhi || 'Dậu';
    const eng = global.NetaDichHocEngine;
    const elmNgay = eng ? (eng.DIA_CHI_NGU_HANH[chiNgay] || 'Mộc') : 'Mộc';
    const elmThang = eng ? (eng.DIA_CHI_NGU_HANH[chiThang] || 'Kim') : 'Kim';

    // Dữ liệu quẻ
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
    const dongCount = isLucHao ? (res.dong_count || 0) : 1;

    return `
      <div class="dh-trang-dich-quai" id="dh-capture-target">
        <!-- HEADER TRANG DỊCH QUÁI -->
        <div class="dh-tdq-header">
          <div class="dh-tdq-title-box">
            <h1 class="dh-tdq-main-title">TRANG DỊCH QUÁI</h1>
            
            <div class="dh-tdq-meta-lines">
              <div class="dh-tdq-line">
                <span class="lbl">Thời gian lập quẻ:</span>
                <span class="val">${state.selectedDate.toLocaleTimeString('vi-VN')} - ${calInfo.solar.dateStr} (giờ ${canChi.hourZhi || 'Hợi'}, ngày ${calInfo.lunar.day || 15}/${calInfo.lunar.month || 8}/${calInfo.solar.year} ÂD hợp lịch)</span>
              </div>
              <div class="dh-tdq-line">
                <span class="lbl">Can Chi:</span>
                <span class="val">Giờ ${canChi.hour || 'Tân Hợi'}, ngày ${canChi.day || 'Nhâm Dần'}, tháng ${canChi.month || 'Đinh Dậu'}, năm ${canChi.year || 'Bính Ngọ'}</span>
              </div>
              <div class="dh-tdq-line">
                <span class="lbl">Tiết khí:</span> <strong class="val-bold">${solarTerm}</strong>
                <span class="spacer-inline"></span>
                <span class="lbl">Nhật thần:</span> <strong class="val-bold">${chiNgay}-${elmNgay}</strong>
                <span class="spacer-inline"></span>
                <span class="lbl">Nguyệt lệnh:</span> <strong class="val-bold">${chiThang}-${elmThang}</strong>
              </div>
              <div class="dh-tdq-line">
                <span class="lbl">Phương pháp lập quẻ:</span>
                <span class="val-bold">${isLucHao ? 'Lục hào' : 'Mai hoa'}</span>
              </div>
              <div class="dh-tdq-line purpose-line">
                <span class="lbl">Việc cần xem:</span>
                <input type="text" id="dh-purpose-input" class="dh-tdq-purpose-input" value="${state.purpose}" placeholder="Nhập sự vụ cần chiêm bái...">
              </div>
            </div>
          </div>

          <!-- ICON ĐỒ HỌA GÓC TRÊN BÊN PHẢI -->
          <div class="dh-tdq-corner-art">
            ${isLucHao ? `
              <!-- 3 ĐỒNG XU CÀN LONG XẾP LỚP (Ảnh 1) -->
              <div class="dh-art-coins-cluster" title="3 đồng tiền Càn Long Thông Bảo">
                <div class="art-coin c1">
                  <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#bf9543" stroke="#382509" stroke-width="3"/><rect x="38" y="38" width="24" height="24" fill="#18130c" stroke="#382509"/><text x="50" y="27" font-size="15" font-weight="900" text-anchor="middle" fill="#281704">乾</text><text x="50" y="87" font-size="15" font-weight="900" text-anchor="middle" fill="#281704">隆</text><text x="21" y="56" font-size="15" font-weight="900" text-anchor="middle" fill="#281704">通</text><text x="79" y="56" font-size="15" font-weight="900" text-anchor="middle" fill="#281704">寶</text></svg>
                </div>
                <div class="art-coin c2">
                  <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#ab8235" stroke="#382509" stroke-width="3"/><rect x="38" y="38" width="24" height="24" fill="#18130c" stroke="#382509"/><text x="22" y="58" font-size="17" font-weight="bold" text-anchor="middle" fill="#281704">ᠪᠣᠣ</text><text x="78" y="58" font-size="17" font-weight="bold" text-anchor="middle" fill="#281704">ᠴᡳᠶᠣ</text></svg>
                </div>
                <div class="art-coin c3">
                  <svg viewBox="0 0 100 100"><circle cx="50" cy="48" r="46" fill="#c69f4c" stroke="#382509" stroke-width="3"/><rect x="38" y="36" width="24" height="24" fill="#18130c" stroke="#382509"/><text x="50" y="25" font-size="15" font-weight="900" text-anchor="middle" fill="#281704">乾</text><text x="50" y="85" font-size="15" font-weight="900" text-anchor="middle" fill="#281704">隆</text><text x="21" y="54" font-size="15" font-weight="900" text-anchor="middle" fill="#281704">通</text><text x="79" y="54" font-size="15" font-weight="900" text-anchor="middle" fill="#281704">寶</text></svg>
                </div>
              </div>
            ` : `
              <!-- CÀNH HOA MAI THỦY MẶC & THƯ PHÁP (Ảnh 2) -->
              <div class="dh-art-plum-blossom" title="Mai Hoa Dịch Số">
                <svg viewBox="0 0 130 90" class="dh-plum-svg">
                  <!-- Cành cây thủy mặc -->
                  <path d="M10,80 Q50,45 85,30 T125,15" fill="none" stroke="#5c4033" stroke-width="3.5" stroke-linecap="round"/>
                  <path d="M50,48 Q70,60 95,65" fill="none" stroke="#5c4033" stroke-width="2" stroke-linecap="round"/>
                  <path d="M75,34 Q85,18 95,12" fill="none" stroke="#5c4033" stroke-width="1.8" stroke-linecap="round"/>
                  <!-- Hoa mai hồng nhạt -->
                  <circle cx="85" cy="30" r="7" fill="#f43f5e" opacity="0.85"/>
                  <circle cx="85" cy="30" r="3" fill="#ffe4e6"/>
                  <circle cx="95" cy="12" r="6" fill="#f43f5e" opacity="0.85"/>
                  <circle cx="95" cy="12" r="2.5" fill="#ffe4e6"/>
                  <circle cx="95" cy="65" r="6" fill="#f43f5e" opacity="0.85"/>
                  <circle cx="120" cy="16" r="5" fill="#f43f5e" opacity="0.8"/>
                  <circle cx="65" cy="40" r="5.5" fill="#f43f5e" opacity="0.85"/>
                  <circle cx="40" cy="55" r="4.5" fill="#fb7185" opacity="0.75"/>
                </svg>
                <div class="dh-calligraphy-text">梅花易數</div>
              </div>
            `}
          </div>
        </div>

        <!-- ĐƯỜNG PHÂN CÁCH TRANG TRỌNG -->
        <div class="dh-tdq-divider"></div>

        <!-- KHỐI ĐỒ HÌNH QUẺ (LỤC HÀO: 2 QUẺ | MAI HOA: 3 QUẺ) -->
        <div class="dh-tdq-hexagrams-stage ${ho ? 'is-triple' : 'is-dual'}">
          <!-- QUẺ CHỦ -->
          <div class="dh-tdq-hex-col">
            <h2 class="dh-tdq-hex-name">${goc.name}</h2>
            <div class="dh-tdq-bars-wrap">
              ${renderThickBars(goc.bits, goc.haos ? goc.haos.map(h => h.isDong) : [state.result.hao_dong === 1, state.result.hao_dong === 2, state.result.hao_dong === 3, state.result.hao_dong === 4, state.result.hao_dong === 5, state.result.hao_dong === 6])}
            </div>
            <div class="dh-tdq-house-name">HỌ ${goc.cung.toUpperCase()}${goc.cungSpecial ? ` (${goc.cungSpecial})` : ''}</div>
            <div class="dh-tdq-oracle-poem">${goc.tuong ? goc.tuong.toUpperCase() : ''}</div>
          </div>

          <!-- QUẺ HỖ (NẾU LÀ MAI HOA) -->
          ${ho ? `
            <div class="dh-tdq-hex-col">
              <h2 class="dh-tdq-hex-name">${ho.name}</h2>
              <div class="dh-tdq-bars-wrap">
                ${renderThickBars(ho.bits, [])}
              </div>
              <div class="dh-tdq-house-name">HỌ ${ho.cung.toUpperCase()}${ho.cungSpecial ? ` (${ho.cungSpecial})` : ''}</div>
              <div class="dh-tdq-oracle-poem">${ho.tuong ? ho.tuong.toUpperCase() : ''}</div>
            </div>
          ` : ''}

          <!-- QUẺ BIẾN -->
          <div class="dh-tdq-hex-col">
            <h2 class="dh-tdq-hex-name">${bien.name}</h2>
            <div class="dh-tdq-bars-wrap">
              ${renderThickBars(bien.bits, [])}
            </div>
            <div class="dh-tdq-house-name">HỌ ${bien.cung.toUpperCase()}${bien.cungSpecial ? ` (${bien.cungSpecial})` : ''}</div>
            <div class="dh-tdq-oracle-poem">${bien.tuong ? bien.tuong.toUpperCase() : ''}</div>
          </div>
        </div>

        <!-- BẢNG LỤC HÀO NẠP GIÁP CHI TIẾT (ĐỐI XỨNG 2 CỘT CHUẨN XÁC NHƯ ẢNH) -->
        <div class="dh-tdq-table-wrap">
          <table class="dh-tdq-main-table">
            <thead>
              <tr class="header-main-titles">
                <th colspan="6" class="th-goc-head">${goc.tuong ? goc.tuong.toUpperCase() : 'BẢN QUÁI'}</th>
                <th colspan="5" class="th-bien-head">${bien.tuong ? bien.tuong.toUpperCase() : 'BIẾN QUÁI'}</th>
              </tr>
              <tr class="header-columns">
                <!-- Nửa Trái: Quẻ Gốc -->
                <th style="width: 44px;">Hào</th>
                <th style="width: 44px;">T/Ứ</th>
                <th style="width: 80px;">Lục Thân</th>
                <th style="width: 86px;">Can Chi</th>
                <th style="width: 90px;">Phục thần</th>
                <th style="width: 38px;">TK</th>

                <!-- Nửa Phải: Quẻ Biến & Lục Thú -->
                <th style="width: 80px;">Lục Thân</th>
                <th style="width: 86px;">Can Chi</th>
                <th style="width: 38px;">TK</th>
                <th style="width: 88px;">Lục Thú</th>
                <th style="width: 44px;">Hào</th>
              </tr>
            </thead>
            <tbody>
              ${[5, 4, 3, 2, 1, 0].map(i => {
                const hGoc = goc.haos ? goc.haos[i] : null;
                const hBien = bien.haos ? bien.haos[i] : null;
                if (!hGoc) return '';
                const isDong = hGoc.isDong;

                // Tìm phục thần ở vị trí hào này
                const phucItem = phuc.find(p => p.pos === hGoc.pos);

                return `
                  <tr class="${isDong ? 'row-is-dong' : ''}">
                    <!-- Nửa Trái (Quẻ Gốc) -->
                    <td class="cell-mini-bar">${renderMiniYaoBar(hGoc.bit, isDong)}</td>
                    <td class="cell-the-ung">
                      ${hGoc.isThe ? '<strong class="the-tag">Thế</strong>' : ''}
                      ${hGoc.isUng ? '<strong class="ung-tag">Ứng</strong>' : ''}
                    </td>
                    <td class="cell-luc-than ${isDong ? 'text-dong' : ''}">${hGoc.lucThan}</td>
                    <td class="cell-can-chi ${isDong ? 'text-dong' : ''}">${hGoc.can}-${hGoc.chi}</td>
                    <td class="cell-phuc-than">${phucItem ? `${phucItem.lucThan.split(' ')[0]}-${phucItem.chi}` : ''}</td>
                    <td class="cell-tk">${hGoc.isTuanKhong ? '<span class="tk-k">K</span>' : ''}</td>

                    <!-- Nửa Phải (Quẻ Biến & Lục Thú) -->
                    <td class="cell-luc-than ${isDong ? 'text-dong' : ''}">${hBien ? hBien.lucThan : ''}</td>
                    <td class="cell-can-chi ${isDong ? 'text-dong' : ''}">${hBien ? `${hBien.can}-${hBien.chi}` : ''}</td>
                    <td class="cell-tk">${(hBien && hBien.isTuanKhong) ? '<span class="tk-k">K</span>' : ''}</td>
                    <td class="cell-luc-thu ${isDong ? 'text-dong' : ''}">${hGoc.lucThu}</td>
                    <td class="cell-mini-bar">${hBien ? renderMiniYaoBar(hBien.bit, false) : ''}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- BẢNG DƯỚI: VƯỢNG SUY & THẦN SÁT (LỘC, MÃ, QUÝ, ĐÀO) ĐỐI XỨNG -->
        <div class="dh-tdq-bottom-grid">
          <table class="dh-tdq-sub-table">
            <thead>
              <tr>
                <!-- Quẻ Gốc -->
                <th style="width: 76px;">Hào</th>
                <th style="width: 50px;">V-S</th>
                <th style="width: 58px;">Quái thần</th>
                <th style="width: 36px;">Lộc</th>
                <th style="width: 36px;">Mã</th>
                <th style="width: 36px;">Quý</th>
                <th style="width: 36px;">Đào</th>

                <!-- Quẻ Biến -->
                <th style="width: 76px; border-left: 2px solid #cbd5e1;">Hào</th>
                <th style="width: 50px;">V-S</th>
                <th style="width: 36px;">Lộc</th>
                <th style="width: 36px;">Mã</th>
                <th style="width: 36px;">Quý</th>
                <th style="width: 36px;">Đào</th>
              </tr>
            </thead>
            <tbody>
              ${[5, 4, 3, 2, 1, 0].map(i => {
                const hGoc = goc.haos ? goc.haos[i] : null;
                const hBien = bien.haos ? bien.haos[i] : null;
                if (!hGoc) return '';
                const isDong = hGoc.isDong;

                return `
                  <tr class="${isDong ? 'row-is-dong' : ''}">
                    <!-- Quẻ Gốc -->
                    <td class="cell-name-chi ${isDong ? 'text-dong' : ''}">${hGoc.can} ${hGoc.chi}</td>
                    <td class="cell-vs ${isDong ? 'text-dong' : ''}">${hGoc.vuongSuy}</td>
                    <td>${hGoc.isQuaiThan ? '<strong class="qt-mark">QT</strong>' : '-'}</td>
                    <td>${hGoc.isLoc ? '<strong class="ts-mark">L</strong>' : '-'}</td>
                    <td>${hGoc.isMa ? '<strong class="ts-mark">M</strong>' : '-'}</td>
                    <td>${hGoc.isQuy ? '<strong class="ts-mark">Q</strong>' : '-'}</td>
                    <td>${hGoc.isDao ? '<strong class="ts-mark">Đ</strong>' : '-'}</td>

                    <!-- Quẻ Biến -->
                    <td class="cell-name-chi ${isDong ? 'text-dong' : ''}" style="border-left: 2px solid #cbd5e1;">${hBien ? `${hBien.can} ${hBien.chi}` : '-'}</td>
                    <td class="cell-vs ${isDong ? 'text-dong' : ''}">${hBien ? hBien.vuongSuy : '-'}</td>
                    <td>${(hBien && hBien.isLoc) ? '<strong class="ts-mark">L</strong>' : '-'}</td>
                    <td>${(hBien && hBien.isMa) ? '<strong class="ts-mark">M</strong>' : '-'}</td>
                    <td>${(hBien && hBien.isQuy) ? '<strong class="ts-mark">Q</strong>' : '-'}</td>
                    <td>${(hBien && hBien.isDao) ? '<strong class="ts-mark">Đ</strong>' : '-'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- FOOTER TRANG DỊCH QUÁI -->
        <div class="dh-tdq-footer">
          <span>Lập tại <strong>Neta Light & Huyền Học</strong> • Hệ Thống Dịch Lý Cổ Truyền Chuẩn Mực</span>
          <span class="dh-tdq-footer-link">Bản quyền học thuật Dã Hạc & Thiệu Ung</span>
        </div>
      </div>
    `;
  }

  // Render 6 vạch hào to rõ (Blue navy cho hào tĩnh, Red cho hào động)
  function renderThickBars(bits, dongFlags = []) {
    let html = '';
    // Hào 6 (i=5) ở trên cùng -> Hào 1 (i=0) ở dưới cùng
    for (let i = 5; i >= 0; i--) {
      const bit = bits[i];
      const isDong = dongFlags[i] || false;
      const isYang = (bit === 1);

      html += `
        <div class="dh-thick-line-row ${isDong ? 'is-dong' : ''}">
          ${isYang ? `
            <!-- Hào Dương: 1 Thanh Liền -->
            <div class="dh-thick-bar yang ${isDong ? 'dong' : ''}"></div>
          ` : `
            <!-- Hào Âm: 2 Thanh Đứt -->
            <div class="dh-thick-bar yin ${isDong ? 'dong' : ''}">
              <div class="yin-seg"></div>
              <div class="yin-space"></div>
              <div class="yin-seg"></div>
            </div>
          `}
        </div>
      `;
    }
    return html;
  }

  // Render vạch hào mini trong bảng Lục Hào
  function renderMiniYaoBar(bit, isDong) {
    const isYang = (bit === 1);
    if (isYang) {
      return `<div class="mini-yao-yang ${isDong ? 'dong' : ''}"></div>`;
    } else {
      return `
        <div class="mini-yao-yin ${isDong ? 'dong' : ''}">
          <span class="seg"></span>
          <span class="seg"></span>
        </div>
      `;
    }
  }

  // =========================================================================
  // 5. RENDER THUYẾT MINH LUẬN GIẢI HIỆN ĐẠI (CHẾ ĐỘ XEM THỨ HAI)
  // =========================================================================
  function renderDetailedReport() {
    if (!state.result) return '';
    const isLucHao = (state.method === 'luchao');
    const res = state.result;

    if (isLucHao) {
      const goc = res.que_goc;
      const bien = res.que_bien;
      return `
        <div class="dh-detailed-wrap">
          <div class="dh-card-box">
            <h3 class="dh-box-title">⚖️ THUYẾT MINH LUẬN GIẢI BỐC PHỆ LỤC HÀO</h3>
            <p style="font-size: 0.82rem; line-height: 1.6; color: #cbd5e1;">
              Quẻ chiêm được: <strong>${goc.name}</strong> (${goc.queType}, thuộc Cung ${goc.cung} - ${goc.cungElement}). 
              ${res.dong_count > 0 ? `Có <strong>${res.dong_count} hào động</strong> hóa thành quẻ <strong>${bien.name}</strong> (Cung ${bien.cung}).` : 'Quẻ thuần tĩnh an định, không có hào động.'}
            </p>
            <div class="dh-info-callout">
              <div>📍 <strong>Hào Thế (Chủ Thể):</strong> Hào ${goc.thePos} (${goc.haos[goc.thePos - 1].lucThan} ${goc.haos[goc.thePos - 1].can}${goc.haos[goc.thePos - 1].chi}) • Là tâm điểm đại diện cho đương số chiêm quẻ.</div>
              <div style="margin-top: 4px;">🎯 <strong>Hào Ứng (Đối Tác / Hoàn Cảnh):</strong> Hào ${goc.ungPos} (${goc.haos[goc.ungPos - 1].lucThan} ${goc.haos[goc.ungPos - 1].can}${goc.haos[goc.ungPos - 1].chi}) • Đại diện cho đối phương hoặc sự vụ cần xem.</div>
            </div>
            <div class="dh-tho-box">
              <div class="tho-title">Lời Kinh Dịch Cốt Tủy:</div>
              <div class="tho-body">"${goc.tho || 'Cương kiện trung chính, hanh thông đại cát.'}"</div>
            </div>
          </div>
        </div>
      `;
    } else {
      // Mai Hoa Thể Dụng
      const td = res.the_dung;
      return `
        <div class="dh-detailed-wrap">
          <div class="dh-card-box">
            <h3 class="dh-box-title">🌸 LUẬN GIẢI THỂ - DỤNG MAI HOA DỊCH SỐ (HÀO ĐỘNG: HÀO ${res.hao_dong})</h3>
            <div class="dh-td-grid">
              <div class="dh-td-box">
                <div class="dh-td-label">THỂ QUÁI (Chủ Sự)</div>
                <div class="dh-td-name">${td.the.info.name} (${td.the.info.element})</div>
                <div class="dh-td-sub">Tượng: ${td.the.info.nature} • ${td.the.vi_tri}</div>
              </div>
              <div class="dh-td-box">
                <div class="dh-td-label">DỤNG QUÁI (Khách / Sự Vụ)</div>
                <div class="dh-td-name" style="color: #ef4444;">${td.dung.info.name} (${td.dung.info.element})</div>
                <div class="dh-td-sub">Tượng: ${td.dung.info.nature} • ${td.dung.vi_tri}</div>
              </div>
            </div>
            <div class="dh-td-verdict ${td.muc_do || 'cat'}">
              ${td.danh_gia}
            </div>
          </div>
        </div>
      `;
    }
  }

  // =========================================================================
  // 6. TÍNH TOÁN & CÁC HÀM XỬ LÝ SỰ KIỆN
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

  // Gieo 1 hào ngẫu nhiên (3 đồng xu tung lên với vật lý và âm thanh)
  function gieoMotHao() {
    if (state.isFlipping) return;
    if (state.haoCoins.length >= 6) {
      if (global.showToast) global.showToast('✅ Đã gieo đủ 6 hào. Bấm "Gieo Lại" nếu muốn lập quẻ mới.');
      return;
    }

    state.isFlipping = true;
    triggerHaptic(30);
    playCoinAudio('clink');

    // 3 đồng xu tung ngẫu nhiên: mỗi xu nhận 2 (Âm) hoặc 3 (Dương)
    const c1 = Math.random() < 0.5 ? 2 : 3;
    const c2 = Math.random() < 0.5 ? 2 : 3;
    const c3 = Math.random() < 0.5 ? 2 : 3;

    state.coinStates = [c1, c2, c3];
    state.coinAngles = [
      Math.floor(Math.random() * 60) - 30,
      Math.floor(Math.random() * 60) - 30,
      Math.floor(Math.random() * 60) - 30
    ];

    render();

    setTimeout(() => {
      state.isFlipping = false;
      const total = c1 + c2 + c3; // 6, 7, 8, hoặc 9
      state.haoCoins.push(total);
      triggerHaptic(15);
      playCoinAudio('clink');

      if (state.haoCoins.length >= 6) {
        chayLapQueLucHao();
        setTimeout(() => playCoinAudio('done'), 200);
      }
      render();
    }, 650);
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
    state.coinAngles = [
      Math.floor(Math.random() * 60) - 30,
      Math.floor(Math.random() * 60) - 30,
      Math.floor(Math.random() * 60) - 30
    ];
    chayLapQueLucHao();
    playCoinAudio('done');
    triggerHaptic(40);
    render();
  }

  // Gắn sự kiện giao diện
  function bindEvents() {
    // 1. Chuyển Tab Lục Hào / Mai Hoa
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

    // 2. Chuyển chế độ xem (Trang Dịch Quái / Luận Giải Chi Tiết)
    const btnModeToggle = document.getElementById('dh-btn-mode-toggle');
    if (btnModeToggle) {
      btnModeToggle.onclick = () => {
        state.viewMode = (state.viewMode === 'chart') ? 'detailed' : 'chart';
        render();
      };
    }

    // 3. Gieo quẻ tương tác
    const btnCastStep = document.getElementById('dh-btn-cast-step');
    if (btnCastStep) btnCastStep.onclick = gieoMotHao;

    const tray = document.getElementById('dh-sacred-tray');
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

    // 4. Mai Hoa modes
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

    // 5. Ô nhập mục đích "Việc cần xem"
    const purposeInput = document.getElementById('dh-purpose-input');
    if (purposeInput) {
      purposeInput.oninput = (e) => {
        state.purpose = e.target.value;
      };
    }

    // 6. Header Buttons: Hiện Tại, Chọn Giờ, Lưu Ảnh
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

  // Chụp ảnh màn hình Trang Dịch Quái Ultra-HD
  function exportDichQuaiScreenshot() {
    const target = document.getElementById('dh-capture-target') || document.querySelector('.dichhoc-container');
    if (!target) return;

    if (global.showToast) global.showToast('⏳ Đang kết xuất ảnh Trang Dịch Quái Ultra-HD...');

    if (typeof html2canvas === 'function') {
      html2canvas(target, {
        scale: 3, // Ultra-HD 3x nét căng như in ấn
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff'
      }).then(canvas => {
        const dataUrl = canvas.toDataURL('image/png');
        const filename = `TrangDichQuai_${state.method}_${Date.now()}.png`;

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
        if (global.showToast) global.showToast(`✅ Đã lưu ảnh Trang Dịch Quái: ${filename}`);
      }).catch(err => {
        console.error('Screenshot error:', err);
        if (global.showToast) global.showToast('❌ Không thể xuất ảnh: ' + err.message);
      });
    } else {
      if (typeof global.captureArenaScreenshot === 'function') {
        global.captureArenaScreenshot();
      } else {
        alert('Trình duyệt chưa hỗ trợ xuất ảnh canvas.');
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
        <input type="datetime-local" id="dh-custom-dt-input" class="dh-input-box" value="${curVal}">
        <div style="display: flex; gap: 8px; margin-top: 14px;">
          <button class="dh-btn secondary" id="dh-modal-cancel" style="width: 50%;">Hủy</button>
          <button class="dh-btn primary" id="dh-modal-confirm" style="width: 50%;">Xác Nhận</button>
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

  // Lắc điện thoại để gieo quẻ (Accelerometer shake sensor)
  let lastX, lastY, lastZ;
  let lastShakeTime = 0;
  window.addEventListener('devicemotion', (e) => {
    if (state.method !== 'luchao' || state.isFlipping || state.haoCoins.length >= 6) return;
    const current = e.accelerationIncludingGravity;
    if (!current) return;
    const now = Date.now();
    if ((now - lastShakeTime) > 1000) {
      const diffTime = now - lastShakeTime;
      const speed = Math.abs(current.x + current.y + current.z - (lastX + lastY + lastZ || 0)) / diffTime * 10000;
      if (speed > 800) {
        lastShakeTime = now;
        gieoMotHao();
      }
      lastX = current.x;
      lastY = current.y;
      lastZ = current.z;
    }
  });

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
