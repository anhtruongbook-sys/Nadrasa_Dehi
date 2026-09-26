/**
 * NETA LIGHT - DỊCH HỌC VIEW CONTROLLER (modules/dichhoc_view.js)
 * Giao diện Bốc Quẻ Dịch Lý (Lục Hào Nạp Giáp & Mai Hoa Dịch Số).
 * Thiết kế Tinh Hoa Á Đông: Khung 3 Quẻ Live Slots, Bát Quái Tiên Thiên, Ống Quẻ Thái Cực Tương Tác.
 * Hiển thị đầy đủ 100% dữ liệu gốc: Bảng Lục Hào Nạp Giáp & Bảng Vượng Suy Thần Sát đối chiếu 2 quẻ.
 * Tương thích hoàn hảo Dark Theme & Light Theme, tuyệt đối không tràn màn hình.
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

  // Web Audio API mô phỏng tiếng kim loại tiền đồng cổ va chạm leng keng & lắc ống tre
  function playCoinAudio(type = 'clink') {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      if (type === 'done') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.12 / (idx + 1), now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.85);
        });
      } else if (type === 'shake') {
        // Âm thanh lắc ống quẻ xào xạc
        const bufferSize = ctx.sampleRate * 0.35;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1800;
        filter.Q.value = 3;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
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

  // Render SVG đồng tiền Càn Long tinh xảo
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

  // Render vạch hào mini cho bảng dữ liệu
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

  // Render 6 vạch hào slot live trên thẻ hiển thị 3 quẻ (Hình 2)
  function renderSlotBars(type) {
    const curCount = state.haoCoins.length;
    let html = '';

    // Hào 6 ở trên cùng, Hào 1 ở dưới cùng
    for (let h = 6; h >= 1; h--) {
      const isCast = (h <= curCount);

      if (!isCast) {
        // Chưa gieo: vạch placeholder xám nét đứt
        html += `
          <div class="slot-line placeholder">
            <span class="p-dash"></span>
          </div>
        `;
      } else {
        const val = state.haoCoins[h - 1];
        let isYang = false;
        let isDong = false;

        if (type === 'chinh') {
          isDong = (val === 6 || val === 9);
          isYang = (val === 7 || val === 9);
        } else if (type === 'bien') {
          // Biến quái: 6 (Lão âm) biến Dương; 9 (Lão dương) biến Âm
          isDong = (val === 6 || val === 9);
          if (val === 6) isYang = true;
          else if (val === 9) isYang = false;
          else isYang = (val === 7);
        } else if (type === 'ho') {
          // Quẻ hỗ: chỉ hiển thị khi đã có đủ thông tin các hào liên quan (H2, H3, H4, H5)
          const gocBits = state.haoCoins.map(v => (v === 7 || v === 9 ? 1 : 0));
          const hoBitsMap = { 1: gocBits[1], 2: gocBits[2], 3: gocBits[3], 4: gocBits[2], 5: gocBits[3], 6: gocBits[4] };
          isYang = (hoBitsMap[h] === 1);
          isDong = false;
        }

        if (isYang) {
          html += `
            <div class="slot-line filled yang ${isDong ? 'dong' : ''}">
              <span class="bar-solid"></span>
            </div>
          `;
        } else {
          html += `
            <div class="slot-line filled yin ${isDong ? 'dong' : ''}">
              <span class="bar-seg"></span>
              <span class="bar-gap"></span>
              <span class="bar-seg"></span>
            </div>
          `;
        }
      }
    }
    return html;
  }

  // Khởi tạo và render toàn bộ giao diện
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

        <!-- 2. Thẻ Thông Tin Tứ Trụ, Tiết Khí & Sự Vụ Muốn Chiêm -->
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
            <div><span class="m-lbl">Tuần không:</span> <strong style="color:#f59e0b;">${(state.result && state.result.thoi_gian && state.result.thoi_gian.tuanKhong) ? state.result.thoi_gian.tuanKhong.join(', ') : 'Thìn, Tỵ'}</strong></div>
          </div>
          <div class="dh-purpose-row">
            <span class="m-lbl">Việc cần xem:</span>
            <input type="text" id="dh-purpose-input" class="dh-purpose-input" value="${state.purpose}" placeholder="Nhập sự vụ muốn chiêm (ví dụ: Hợp tác làm ăn, Tài lộc, Gia sự)...">
          </div>
        </div>

        <!-- 3. Khu Vực Gieo Quẻ Tinh Tế Cổ Điển (Hình 2: 3 Quẻ Slots, Bát Quái, Ống Quẻ Thái Cực) -->
        ${renderInteractionPanel()}

        <!-- 4. Bản Phân Tích Lục Hào Nạp Giáp & Thần Sát Đầy Đủ 100% Theo Đúng 2 Ảnh Mẫu -->
        <div id="dh-result-section">
          ${renderResultSection()}
        </div>
      </div>
    `;

    bindEvents();
  }

  // Render khu vực gieo quẻ tinh tế theo phong cách Cổ điển Á Đông (Hình 2)
  function renderInteractionPanel() {
    const curHaoCount = state.haoCoins.length;
    const isLucHao = (state.method === 'luchao');

    if (isLucHao) {
      const sum = state.coinStates.reduce((a, b) => a + b, 0);
      let sumDesc = '';
      if (sum === 6) sumDesc = '2 + 2 + 2 = 6 • Lão Âm (Hào Âm Động ☷ ➔ ☰)';
      else if (sum === 7) sumDesc = '2 + 2 + 3 = 7 • Thiếu Dương (Hào Dương Tĩnh ☰)';
      else if (sum === 8) sumDesc = '2 + 3 + 3 = 8 • Thiếu Âm (Hào Âm Tĩnh ☷)';
      else if (sum === 9) sumDesc = '3 + 3 + 3 = 9 • Lão Dương (Hào Dương Động ☰ ➔ ☷)';

      let quoteText = '';
      if (curHaoCount === 0) {
        quoteText = 'Bạn cần gieo 6 lần để lập thành Quẻ. Chạm vào Ống Quẻ bên dưới để tiến hành gieo quẻ.';
      } else if (curHaoCount < 6) {
        quoteText = `Đã gieo Hào ${curHaoCount}/6. Chạm tiếp vào Ống Quẻ để gieo Hào ${curHaoCount + 1}.`;
      } else {
        quoteText = 'Đã hoàn tất gieo đủ 6 Hào! Xem toàn văn Bảng Nạp Giáp & Thần Sát chi tiết bên dưới.';
      }

      // Tên 3 quẻ hiển thị trên đầu
      let nameChinh = '-';
      let nameHo = '-';
      let nameBien = '-';
      if (state.result && state.result.que_goc) {
        nameChinh = state.result.que_goc.name;
        nameHo = state.result.que_ho ? state.result.que_ho.name : '-';
        nameBien = state.result.que_bien ? state.result.que_bien.name : 'Thuần Tĩnh';
      }

      return `
        <div class="dh-toss-card">
          <!-- A. 3 THẺ QUẺ TRÊN ĐẦU (QUẺ CHÍNH | QUẺ HỖ | QUẺ BIẾN) THEO HÌNH 2 -->
          <div class="dh-casting-slots-card">
            <div class="dh-slots-header">
              <!-- Cột Quẻ Chính -->
              <div class="dh-slot-col">
                <div class="slot-title">QUẺ CHÍNH</div>
                <div class="slot-bars-box">
                  ${renderSlotBars('chinh')}
                </div>
                <div class="slot-name-label">${nameChinh}</div>
              </div>
              <div class="dh-slot-divider"></div>

              <!-- Cột Quẻ Hỗ -->
              <div class="dh-slot-col">
                <div class="slot-title">QUẺ HỖ</div>
                <div class="slot-bars-box">
                  ${renderSlotBars('ho')}
                </div>
                <div class="slot-name-label">${nameHo}</div>
              </div>
              <div class="dh-slot-divider"></div>

              <!-- Cột Quẻ Biến -->
              <div class="dh-slot-col">
                <div class="slot-title">QUẺ BIẾN</div>
                <div class="slot-bars-box">
                  ${renderSlotBars('bien')}
                </div>
                <div class="slot-name-label">${nameBien}</div>
              </div>
            </div>

            <div class="dh-slots-note">
              <span>Ghi chú: Hào màu <span class="dot-static">⚫</span> là hào thường, hào màu <span class="dot-dong">🟠</span> là hào động</span>
            </div>
          </div>

          <!-- B. LỜI DẪN NHẮC NHỞ (QUOTE NHƯ HÌNH 2) -->
          <div class="dh-prompt-quote">
            <span class="quote-mark">“</span>
            <span class="quote-text">${quoteText}</span>
            <span class="quote-mark">”</span>
          </div>

          <!-- C. TRUNG TÂM TƯƠNG TÁC: BÁT QUÁI TIÊN THIÊN & ỐNG QUẺ THÁI CỰC -->
          <div class="dh-stage-arena">
            <!-- Bát Quái Đồ Đẹp Mắt Ở Phía Sau -->
            <div class="dh-bagua-bg">
              <svg class="dh-bagua-svg" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.35" />
                <circle cx="100" cy="100" r="62" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.25" />
                
                <!-- 8 Hướng Bát Quái: Càn (Thiên), Đoài (Trạch), Ly (Hỏa), Chấn (Lôi), Tốn (Phong), Khảm (Thủy), Cấn (Sơn), Khôn (Địa) -->
                <text x="100" y="24" font-size="8.5" font-weight="700" text-anchor="middle" fill="currentColor">Thiên</text>
                <rect x="88" y="28" width="24" height="2" fill="currentColor" opacity="0.75" />
                <rect x="88" y="32" width="24" height="2" fill="currentColor" opacity="0.75" />
                <rect x="88" y="36" width="24" height="2" fill="currentColor" opacity="0.75" />

                <text x="100" y="188" font-size="8.5" font-weight="700" text-anchor="middle" fill="currentColor">Địa</text>
                <rect x="88" y="164" width="10" height="2" fill="currentColor" opacity="0.75" /><rect x="102" y="164" width="10" height="2" fill="currentColor" opacity="0.75" />
                <rect x="88" y="168" width="10" height="2" fill="currentColor" opacity="0.75" /><rect x="102" y="168" width="10" height="2" fill="currentColor" opacity="0.75" />
                <rect x="88" y="172" width="10" height="2" fill="currentColor" opacity="0.75" /><rect x="102" y="172" width="10" height="2" fill="currentColor" opacity="0.75" />

                <text x="22" y="103" font-size="8.5" font-weight="700" text-anchor="middle" fill="currentColor">Hỏa</text>
                <text x="178" y="103" font-size="8.5" font-weight="700" text-anchor="middle" fill="currentColor">Thủy</text>

                <text x="44" y="46" font-size="8" font-weight="700" text-anchor="middle" fill="currentColor">Trạch</text>
                <text x="156" y="46" font-size="8" font-weight="700" text-anchor="middle" fill="currentColor">Phong</text>
                <text x="44" y="160" font-size="8" font-weight="700" text-anchor="middle" fill="currentColor">Lôi</text>
                <text x="156" y="160" font-size="8" font-weight="700" text-anchor="middle" fill="currentColor">Sơn</text>

                <!-- Vòng Âm Dương Trung Tâm -->
                <g transform="translate(100, 100)">
                  <circle cx="0" cy="0" r="32" fill="#0f172a" stroke="#d97706" stroke-width="1.5" />
                  <path d="M 0 -32 A 32 32 0 0 1 0 32 A 16 16 0 0 1 0 0 A 16 16 0 0 0 0 -32" fill="#f8fafc" />
                  <circle cx="0" cy="-16" r="4" fill="#0f172a" />
                  <circle cx="0" cy="16" r="4" fill="#f8fafc" />
                </g>
              </svg>
            </div>

            <!-- Ống Quẻ Thái Cực Tương Tác (Chạm Để Lắc & Gieo) -->
            <div class="dh-tube-container ${state.isFlipping ? 'tube-shaking' : ''}" id="dh-interactive-tube" title="Chạm vào Ống Quẻ để gieo Hào!">
              <svg class="dh-tube-svg" viewBox="0 0 140 180">
                <defs>
                  <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#4a2810" />
                    <stop offset="25%" stop-color="#7c461e" />
                    <stop offset="50%" stop-color="#9a5a29" />
                    <stop offset="75%" stop-color="#7c461e" />
                    <stop offset="100%" stop-color="#4a2810" />
                  </linearGradient>
                  <linearGradient id="rimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#3d210c" />
                    <stop offset="100%" stop-color="#1f1005" />
                  </linearGradient>
                  <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#fde047" />
                    <stop offset="60%" stop-color="#d97706" />
                    <stop offset="100%" stop-color="#78350f" />
                  </radialGradient>
                </defs>

                <!-- Miệng Ống Quẻ (Oval Top Rim) -->
                <ellipse cx="70" cy="24" rx="46" ry="13" fill="url(#rimGrad)" stroke="#221206" stroke-width="2.2" />
                <ellipse cx="70" cy="24" rx="40" ry="9" fill="#120902" />

                <!-- Thân Ống Tre / Gỗ Bát Giác Khắc Thái Cực -->
                <path d="M 24 24 L 29 158 Q 70 170 111 158 L 116 24 Z" fill="url(#woodGrad)" stroke="#2a1406" stroke-width="2" />
                
                <!-- Gân nan tre dọc -->
                <line x1="44" y1="26" x2="47" y2="162" stroke="#2c1507" stroke-width="1.5" opacity="0.6" />
                <line x1="63" y1="27" x2="64" y2="165" stroke="#2c1507" stroke-width="1.5" opacity="0.6" />
                <line x1="77" y1="27" x2="76" y2="165" stroke="#2c1507" stroke-width="1.5" opacity="0.6" />
                <line x1="96" y1="26" x2="93" y2="162" stroke="#2c1507" stroke-width="1.5" opacity="0.6" />

                <!-- Đai Đồng Cố Định Thân Ống -->
                <path d="M 25 46 Q 70 54 115 46" fill="none" stroke="#d97706" stroke-width="2.5" opacity="0.75" />
                <path d="M 28 138 Q 70 146 112 138" fill="none" stroke="#d97706" stroke-width="2.5" opacity="0.75" />

                <!-- Huy Hiệu Thái Cực Bằng Vàng Ở Thân Ống Quẻ -->
                <circle cx="70" cy="94" r="21" fill="url(#goldGlow)" stroke="#3f1e06" stroke-width="1.8" />
                <g transform="translate(70, 94)">
                  <path d="M 0 -17 A 17 17 0 0 1 0 17 A 8.5 8.5 0 0 1 0 0 A 8.5 8.5 0 0 0 0 -17" fill="#1e1309" />
                  <circle cx="0" cy="-8.5" r="2.6" fill="#1e1309" />
                  <circle cx="0" cy="8.5" r="2.6" fill="#fde047" />
                </g>
              </svg>

              <div class="dh-tube-badge">
                <span>Chạm để Lắc Quẻ</span>
              </div>
            </div>
          </div>

          <!-- D. 3 ĐỒNG TIỀN XU CÀN LONG & KẾT QUẢ ĐIỂM SỐ -->
          <div class="dh-coins-row">
            ${state.coinStates.map((val, idx) => renderCoinSVG(val, state.isFlipping, idx)).join('')}
          </div>

          <div class="dh-coin-formula">
            <span>🪙 ${sumDesc}</span>
          </div>

          <!-- E. CỤM NÚT ĐIỀU KHIỂN HÀNH ĐỘNG -->
          <div class="dh-btn-actions">
            ${curHaoCount < 6 ? `
              <button class="dh-action-btn primary" id="dh-btn-cast-step">
                🎲 Gieo Hào ${curHaoCount + 1}/6
              </button>
            ` : `
              <button class="dh-action-btn primary" id="dh-btn-cast-done" disabled style="opacity: 0.85;">
                ✅ Đã Gieo Đủ 6 Hào
              </button>
            `}
            <button class="dh-action-btn speed" id="dh-btn-cast-auto">
              ⚡ Gieo Nhanh Cả 6 Hào
            </button>
            <button class="dh-action-btn outline" id="dh-btn-reset-cast">
              🔄 Gieo Lại Từ Đầu
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
            <button class="dh-action-btn outline" id="dh-btn-reset-cast">
              🔄 Đặt Lại
            </button>
          </div>
        </div>
      `;
    }
  }

  // =========================================================================
  // 4. RENDER BẢN QUẺ & PHÂN TÍCH LỤC HÀO NẠP GIÁP TOÀN DIỆN (THEO ĐÚNG 2 ẢNH MẪU)
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
    const ho = isLucHao ? (res.que_ho || null) : state.result.que_ho;
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
        <!-- A. ĐỒ HÌNH 3 QUẺ TRỰC QUAN (QUẺ CHỦ / CHÍNH - QUẺ HỖ - QUẺ BIẾN) -->
        <div class="dh-hex-arena triple">
          <!-- 1. Quẻ Chính / Quẻ Gốc -->
          <div class="dh-hex-item">
            <div class="hex-badge chu">Quẻ Chính</div>
            <div class="hex-name">${goc.name}</div>
            <div class="hex-bars">
              ${renderBarsSlim(goc.bits, goc.haos ? goc.haos.map(h => h.isDong) : [])}
            </div>
            <div class="hex-cung">Họ ${goc.cung}${goc.cungSpecial ? ` (${goc.cungSpecial})` : ''}</div>
            <div class="hex-samtru">${goc.tuong ? goc.tuong.toUpperCase() : ''}</div>
          </div>

          <!-- 2. Quẻ Hỗ -->
          <div class="dh-hex-item">
            <div class="hex-badge ho">Quẻ Hỗ</div>
            <div class="hex-name">${ho ? ho.name : '-'}</div>
            <div class="hex-bars">
              ${ho ? renderBarsSlim(ho.bits, []) : ''}
            </div>
            <div class="hex-cung">${ho ? `Họ ${ho.cung}${ho.cungSpecial ? ` (${ho.cungSpecial})` : ''}` : '-'}</div>
            <div class="hex-samtru">${(ho && ho.tuong) ? ho.tuong.toUpperCase() : ''}</div>
          </div>

          <!-- 3. Quẻ Biến -->
          <div class="dh-hex-item">
            <div class="hex-badge bien">Quẻ Biến</div>
            <div class="hex-name">${bien ? bien.name : 'Thuần Tĩnh'}</div>
            <div class="hex-bars">
              ${bien ? renderBarsSlim(bien.bits, []) : '<div style="font-size:0.7rem; color:#64748b; padding:18px 0;">Không động</div>'}
            </div>
            <div class="hex-cung">${bien ? `Họ ${bien.cung}${bien.cungSpecial ? ` (${bien.cungSpecial})` : ''}` : 'Bất biến'}</div>
            <div class="hex-samtru">${(bien && bien.tuong) ? bien.tuong.toUpperCase() : ''}</div>
          </div>
        </div>

        <!-- B. BẢNG I: LỤC HÀO NẠP GIÁP & LỤC THÚ (CHUẨN 100% THEO 2 ẢNH MẪU) -->
        <div class="dh-table-container">
          <div class="dh-table-title">
            <span>📋 BẢNG I: PHÂN TÍCH LỤC HÀO NẠP GIÁP & LỤC THÚ</span>
          </div>
          <div class="dh-table-scroll">
            <table class="dh-spec-table">
              <thead>
                <tr class="th-group-row">
                  <th colspan="6" class="th-group-left">${goc.tuong ? goc.tuong.toUpperCase() : goc.name.toUpperCase()}</th>
                  <th colspan="5" class="th-group-right">${bien ? (bien.tuong ? bien.tuong.toUpperCase() : bien.name.toUpperCase()) : 'BẤT BIẾN'}</th>
                </tr>
                <tr class="th-cols-row">
                  <!-- Quẻ Gốc (6 cột) -->
                  <th style="width: 32px;">Hào</th>
                  <th style="width: 36px;">T/Ứ</th>
                  <th>Lục Thân</th>
                  <th>Can Chi</th>
                  <th>Phục thần</th>
                  <th style="width: 28px;">TK</th>
                  <!-- Quẻ Biến (5 cột) -->
                  <th>Lục Thân</th>
                  <th>Can Chi</th>
                  <th style="width: 28px;">TK</th>
                  <th>Lục Thú</th>
                  <th style="width: 32px;">Hào</th>
                </tr>
              </thead>
              <tbody>
                ${[5, 4, 3, 2, 1, 0].map(i => {
                  const hGoc = goc.haos ? goc.haos[i] : null;
                  const hBien = (bien && bien.haos) ? bien.haos[i] : null;
                  if (!hGoc) return '';
                  const isDong = hGoc.isDong;
                  const phucItem = phuc.find(p => p.pos === hGoc.pos);

                  return `
                    <tr class="dh-row ${isDong ? 'row-dong' : ''}">
                      <!-- Gốc: Vạch Hào -->
                      <td class="td-center td-bar">${renderMiniYaoBar(hGoc.bit, isDong)}</td>
                      <!-- Gốc: Thế / Ứng -->
                      <td class="td-center">
                        ${hGoc.isThe ? '<span class="pill-the">Thế</span>' : ''}
                        ${hGoc.isUng ? '<span class="pill-ung">Ứng</span>' : ''}
                      </td>
                      <!-- Gốc: Lục Thân -->
                      <td class="td-bold ${isDong ? 'text-red' : ''}">${hGoc.lucThan}</td>
                      <!-- Gốc: Can Chi -->
                      <td class="${isDong ? 'text-red' : ''}">${hGoc.can}-${hGoc.chi} <small>(${hGoc.chiElement})</small></td>
                      <!-- Gốc: Phục thần -->
                      <td class="td-phuc">${phucItem ? `${phucItem.lucThan.split(' ')[0]}-${phucItem.chi}` : '-'}</td>
                      <!-- Gốc: Tuần không -->
                      <td class="td-center ${hGoc.isTuanKhong ? 'text-tk' : ''}">${hGoc.isTuanKhong ? 'K' : ''}</td>

                      <!-- Biến: Lục Thân -->
                      <td class="td-bold ${isDong && hBien ? 'text-red' : 'td-dim'}">${hBien ? hBien.lucThan : '-'}</td>
                      <!-- Biến: Can Chi -->
                      <td class="${isDong && hBien ? 'text-red' : 'td-dim'}">${hBien ? `${hBien.can}-${hBien.chi} <small>(${hBien.chiElement})</small>` : '-'}</td>
                      <!-- Biến: Tuần không -->
                      <td class="td-center ${hBien && hBien.isTuanKhong ? 'text-tk' : ''}">${(hBien && hBien.isTuanKhong) ? 'K' : ''}</td>
                      <!-- Lục Thú -->
                      <td class="td-thu ${isDong ? 'text-red' : ''}">${hGoc.lucThu}</td>
                      <!-- Biến: Vạch Hào -->
                      <td class="td-center td-bar">${hBien ? renderMiniYaoBar(hBien.bit, false) : '-'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- C. BẢNG II: VƯỢNG SUY & THẦN SÁT TỪNG HÀO (CHUẨN 100% THEO 2 ẢNH MẪU) -->
        <div class="dh-table-container">
          <div class="dh-table-title">
            <span>🌟 BẢNG II: VƯỢNG SUY & THẦN SÁT TỪNG HÀO</span>
          </div>
          <div class="dh-table-scroll">
            <table class="dh-spec-table">
              <thead>
                <tr class="th-cols-row">
                  <!-- Quẻ Gốc (7 cột) -->
                  <th>Hào</th>
                  <th style="width: 38px;">V-S</th>
                  <th style="width: 48px;">Quái thần</th>
                  <th style="width: 32px;">Lộc</th>
                  <th style="width: 32px;">Mã</th>
                  <th style="width: 32px;">Quý</th>
                  <th style="width: 32px;">Đào</th>
                  <!-- Quẻ Biến (6 cột) -->
                  <th>Hào</th>
                  <th style="width: 38px;">V-S</th>
                  <th style="width: 32px;">Lộc</th>
                  <th style="width: 32px;">Mã</th>
                  <th style="width: 32px;">Quý</th>
                  <th style="width: 32px;">Đào</th>
                </tr>
              </thead>
              <tbody>
                ${[5, 4, 3, 2, 1, 0].map(i => {
                  const hGoc = goc.haos ? goc.haos[i] : null;
                  const hBien = (bien && bien.haos) ? bien.haos[i] : null;
                  if (!hGoc) return '';
                  const isDong = hGoc.isDong;

                  return `
                    <tr class="dh-row ${isDong ? 'row-dong' : ''}">
                      <!-- Gốc: Hào Can Chi -->
                      <td class="td-bold ${isDong ? 'text-red' : ''}">${hGoc.can} ${hGoc.chi}</td>
                      <!-- Gốc: Vượng Suy -->
                      <td class="td-center ${hGoc.vuongSuy === 'Vượng' ? 'text-green' : (hGoc.vuongSuy === 'Tướng' ? 'text-cyan' : '')}">${hGoc.vuongSuy}</td>
                      <!-- Gốc: Quái Thần -->
                      <td class="td-center">${hGoc.isQuaiThan ? '<strong class="badge-ts qt">QT</strong>' : '-'}</td>
                      <!-- Gốc: Lộc -->
                      <td class="td-center">${hGoc.isLoc ? '<strong class="badge-ts loc">L</strong>' : '-'}</td>
                      <!-- Gốc: Mã -->
                      <td class="td-center">${hGoc.isMa ? '<strong class="badge-ts ma">M</strong>' : '-'}</td>
                      <!-- Gốc: Quý -->
                      <td class="td-center">${hGoc.isQuy ? '<strong class="badge-ts quy">Q</strong>' : '-'}</td>
                      <!-- Gốc: Đào -->
                      <td class="td-center">${hGoc.isDao ? '<strong class="badge-ts dao">Đ</strong>' : '-'}</td>

                      <!-- Biến: Hào Can Chi -->
                      <td class="td-bold ${isDong && hBien ? 'text-red' : 'td-dim'}">${hBien ? `${hBien.can} ${hBien.chi}` : '-'}</td>
                      <!-- Biến: Vượng Suy -->
                      <td class="td-center ${hBien && hBien.vuongSuy === 'Vượng' ? 'text-green' : (hBien && hBien.vuongSuy === 'Tướng' ? 'text-cyan' : 'td-dim')}">${hBien ? hBien.vuongSuy : '-'}</td>
                      <!-- Biến: Lộc -->
                      <td class="td-center">${(hBien && hBien.isLoc) ? '<strong class="badge-ts loc">L</strong>' : '-'}</td>
                      <!-- Biến: Mã -->
                      <td class="td-center">${(hBien && hBien.isMa) ? '<strong class="badge-ts ma">M</strong>' : '-'}</td>
                      <!-- Biến: Quý -->
                      <td class="td-center">${(hBien && hBien.isQuy) ? '<strong class="badge-ts quy">Q</strong>' : '-'}</td>
                      <!-- Biến: Đào -->
                      <td class="td-center">${(hBien && hBien.isDao) ? '<strong class="badge-ts dao">Đ</strong>' : '-'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- D. THUYẾT MINH THỂ - DỤNG (NẾU LÀ MAI HOA) HOẶC LỜI THOÁN QUẺ -->
        ${!isLucHao && state.result.the_dung ? `
          <div class="dh-the-dung-card">
            <div class="td-header">
              <span>⚖️ THỂ DỤNG MAI HOA (HÀO ĐỘNG: HÀO ${state.result.hao_dong})</span>
            </div>
            <div class="td-content">
              <div class="td-col">
                <strong>THỂ QUÁI:</strong> ${state.result.the_dung.the.info.name} (${state.result.the_dung.the.info.element}) • Ở ${state.result.the_dung.the.vi_tri === 'thuong' ? 'Thượng Quái' : 'Hạ Quái'}
              </div>
              <div class="td-col">
                <strong>DỤNG QUÁI:</strong> ${state.result.the_dung.dung.info.name} (${state.result.the_dung.dung.info.element}) • Ở ${state.result.the_dung.dung.vi_tri === 'thuong' ? 'Thượng Quái' : 'Hạ Quái'}
              </div>
            </div>
            <div class="td-summary">
              <span class="badge-eval ${state.result.the_dung.danh_gia.includes('ĐẠI CÁT') ? 'cat' : (state.result.the_dung.danh_gia.includes('HUNG') ? 'hung' : 'binh')}">${state.result.the_dung.danh_gia}</span>
              <span>${state.result.the_dung.quan_he}</span>
            </div>
          </div>
        ` : ''}

        <!-- E. LỜI KINH DỊCH CỐT TỦY -->
        <div class="dh-thoan-card">
          <div class="thoan-title">Lời Kinh Dịch Cốt Tủy:</div>
          <div class="thoan-text">"${goc.tho || 'Cương nhu ứng hội, đạo trời tuần hoàn, giữ lòng trung chính ắt được hanh thông.'}"</div>
        </div>
      </div>
    `;
  }

  // Render 6 vạch hào thanh mảnh
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

  // Gieo 1 hào ngẫu nhiên khi chạm vào Ống Quẻ hoặc nút Gieo Hào
  function gieoMotHao() {
    if (state.isFlipping) return;
    if (state.haoCoins.length >= 6) {
      if (global.showToast) global.showToast('✅ Đã gieo đủ 6 hào. Bấm "Gieo Lại Từ Đầu" nếu muốn bốc quẻ mới.');
      return;
    }

    state.isFlipping = true;
    triggerHaptic(30);
    playCoinAudio('shake');

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
      triggerHaptic(20);
      playCoinAudio('clink');

      if (state.haoCoins.length >= 6) {
        chayLapQueLucHao();
        setTimeout(() => playCoinAudio('done'), 180);
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
    triggerHaptic(40);
    render();
  }

  // Đặt lại từ đầu
  function resetCasting() {
    state.haoCoins = [];
    state.result = null;
    state.coinStates = [3, 2, 3];
    playCoinAudio('clink');
    render();
  }

  // Gắn sự kiện giao diện
  function bindEvents() {
    const tabLucHao = document.getElementById('dh-tab-luchao');
    if (tabLucHao) {
      tabLucHao.onclick = () => {
        state.method = 'luchao';
        render();
      };
    }

    const tabMaiHoa = document.getElementById('dh-tab-maihoa');
    if (tabMaiHoa) {
      tabMaiHoa.onclick = () => {
        state.method = 'maihoa';
        if (!state.result) chayLapQueMaiHoa();
        render();
      };
    }

    // Chạm vào Ống Quẻ Thái Cực để gieo
    const interactiveTube = document.getElementById('dh-interactive-tube');
    if (interactiveTube) {
      interactiveTube.onclick = () => gieoMotHao();
    }

    // Nút gieo từng bước
    const btnCastStep = document.getElementById('dh-btn-cast-step');
    if (btnCastStep) {
      btnCastStep.onclick = () => gieoMotHao();
    }

    // Nút gieo nhanh 6 hào
    const btnCastAuto = document.getElementById('dh-btn-cast-auto');
    if (btnCastAuto) {
      btnCastAuto.onclick = () => gieoTuDong6Hao();
    }

    // Nút gieo lại từ đầu
    const btnResetCast = document.getElementById('dh-btn-reset-cast');
    if (btnResetCast) {
      btnResetCast.onclick = () => resetCasting();
    }

    // Nút chạy Mai Hoa
    const btnRunMaiHoa = document.getElementById('dh-btn-run-maihoa');
    if (btnRunMaiHoa) {
      btnRunMaiHoa.onclick = () => {
        chayLapQueMaiHoa();
        playCoinAudio('done');
        render();
      };
    }

    // Mai Hoa Mode Tabs
    const btnMhTime = document.getElementById('dh-mh-tab-time');
    if (btnMhTime) {
      btnMhTime.onclick = () => {
        state.maiHoaMode = 'time';
        chayLapQueMaiHoa();
        render();
      };
    }
    const btnMhNums = document.getElementById('dh-mh-tab-numbers');
    if (btnMhNums) {
      btnMhNums.onclick = () => {
        state.maiHoaMode = 'numbers';
        render();
      };
    }

    const inpA = document.getElementById('dh-inp-num-a');
    if (inpA) inpA.onchange = (e) => { state.soA = parseInt(e.target.value, 10) || 1; };
    const inpB = document.getElementById('dh-inp-num-b');
    if (inpB) inpB.onchange = (e) => { state.soB = parseInt(e.target.value, 10) || 1; };

    // Input mục đích chiêm quẻ
    const inpPurpose = document.getElementById('dh-purpose-input');
    if (inpPurpose) {
      inpPurpose.oninput = (e) => { state.purpose = e.target.value; };
    }

    // Nút thời gian hiện tại
    const btnNow = document.getElementById('dh-btn-now');
    if (btnNow) {
      btnNow.onclick = () => {
        state.selectedDate = new Date();
        if (state.method === 'luchao' && state.haoCoins.length === 6) {
          chayLapQueLucHao();
        } else if (state.method === 'maihoa') {
          chayLapQueMaiHoa();
        }
        render();
        if (global.showToast) global.showToast('🕒 Đã đồng bộ thời gian hiện tại!');
      };
    }

    // Nút chụp ảnh quẻ chiêm
    const btnSaveShot = document.getElementById('dh-btn-save-shot');
    if (btnSaveShot) {
      btnSaveShot.onclick = async () => {
        const target = document.getElementById('dh-capture-target');
        if (!target) {
          if (global.showToast) global.showToast('⚠️ Vui lòng gieo đủ quẻ trước khi lưu ảnh.');
          return;
        }
        if (typeof global.html2canvas === 'function') {
          try {
            const canvas = await global.html2canvas(target, { backgroundColor: '#0f172a', scale: 2 });
            const link = document.createElement('a');
            link.download = `Que_Dich_${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
            if (global.showToast) global.showToast('📷 Đã lưu ảnh quẻ thành công!');
          } catch (err) {
            console.error(err);
          }
        } else {
          if (global.showToast) global.showToast('📷 Vui lòng dùng tính năng chụp màn hình thiết bị.');
        }
      };
    }
  }

  // Controller API export
  const DichHocView = {
    init: render,
    render: render,
    destroy() {}
  };

  global.DichHocView = DichHocView;
  global.NetaDichHocView = DichHocView;

})(typeof window !== 'undefined' ? window : this);
