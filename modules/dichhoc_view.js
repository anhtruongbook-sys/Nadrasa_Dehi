/**
 * NETA LIGHT - DỊCH HỌC VIEW CONTROLLER (modules/dichhoc_view.js)
 * Giao diện Bốc Quẻ Dịch Lý (Lục Hào Nạp Giáp & Mai Hoa Dịch Số).
 * Phân định rạch ròi 100% State độc lập giữa Lục Hào và Mai Hoa:
 * - Chuyển Tab chuyển đổi lập tức giao diện & kết quả tương ứng.
 * - Loại bỏ nút lưu ảnh trùng lặp trong thanh công cụ (dùng nút 📷 tại header chung).
 * - Thanh công cụ co dãn trên 1 hàng duy nhất, tuyệt đối không vỡ dòng.
 * - Bảng I và Bảng II hiển thị chuẩn xác danh xưng 64 quẻ Kinh Dịch.
 */

(function (global) {
  'use strict';

  // State độc lập cho từng phân hệ
  const state = {
    method: 'luchao', // 'luchao' | 'maihoa'
    selectedDate: new Date(),
    purpose: '', // Việc cần xem
    selectedTopic: 'cautai', // Chủ đề Dụng thần mặc định
    analysisSubTab: 'dashboard', // 'dashboard' | 'report' (Dual Subnav)
    lucHao2Result: null, // Kết quả toàn diện từ LucHao2Pipeline
    interpretation: null, // Báo cáo luận giải chuyên sâu (Quy tắc & Gemini)
    isInterpretingAI: false, // Trạng thái đang gọi Gemini AI
    currentReportMode: 'standard', // 'standard' | 'ai'
    aiErrorMessage: null,
    aiPolishedText: null,
    
    // 1. Phân hệ Lục Hào Nạp Giáp
    lucHao: {
      coins: [], // Mảng 6 hào đã gieo (6, 7, 8, 9)
      coinStates: [3, 2, 3], // 3 đồng xu hiện tại (2: Âm, 3: Dương)
      coinAngles: [15, -20, 35],
      isFlipping: false,
      result: null // Kết quả lập quẻ khi đủ 6 hào
    },

    // 2. Phân hệ Mai Hoa Dịch Số
    maiHoa: {
      mode: 'time', // 'time' | 'numbers'
      soA: 7,
      soB: 8,
      result: null // Kết quả lập quẻ Mai Hoa
    }
  };

  function resetDichHocAiState() {
    state.aiPolishedText = null;
    state.isInterpretingAI = false;
    state.aiErrorMessage = null;
    state.currentReportMode = 'standard';
    state.lucHao2Result = null;
  }

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
    try {
      if (window.NativeBridge && typeof window.NativeBridge.postMessage === 'function') {
        window.NativeBridge.postMessage(JSON.stringify({
          action: 'haptic',
          duration: duration
        }));
      }
    } catch (e) {}

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
      solarTerm: 'Thu Phân',
      solarTermStr: 'Thu Phân (Chuyển: 23/09 07:05)'
    };
  }

  // Render SVG đồng tiền Càn Long tinh xảo
  function renderCoinSVG(val, isFlipping, idx) {
    const isYang = (val === 3);
    const angle = state.lucHao.coinAngles[idx] || 0;

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

  // Render 6 vạch hào slot live trên thẻ hiển thị 3 quẻ Lục Hào
  function renderSlotBars(type) {
    const curCount = state.lucHao.coins.length;
    let html = '';

    for (let h = 6; h >= 1; h--) {
      const isCast = (h <= curCount);

      if (!isCast) {
        html += `
          <div class="slot-line placeholder">
            <span class="p-dash"></span>
          </div>
        `;
      } else {
        const val = state.lucHao.coins[h - 1];
        let isYang = false;
        let isDong = false;

        if (type === 'chinh') {
          isDong = (val === 6 || val === 9);
          isYang = (val === 7 || val === 9);
        } else if (type === 'bien') {
          isDong = (val === 6 || val === 9);
          if (val === 6) isYang = true;
          else if (val === 9) isYang = false;
          else isYang = (val === 7);
        } else if (type === 'ho') {
          const gocBits = state.lucHao.coins.map(v => (v === 7 || v === 9 ? 1 : 0));
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

  // Render thanh chọn chủ đề Dụng thần cho Lục Hào
  function renderTopicSelector() {
    if (state.method !== 'luchao') return '';
    const presets = [
      { key: 'cautai', label: '💰 Cầu Tài & Đầu Tư', dungThan: 'Thê Tài' },
      { key: 'congdanh', label: '🏆 Công Danh & Sự Nghiệp', dungThan: 'Quan Quỷ' },
      { key: 'tinhduyen', label: '💍 Tình Duyên & Hôn Nhân', dungThan: 'Thê Tài / Quan Quỷ' },
      { key: 'suckhoe', label: '🩺 Sức Khỏe & Tật Bệnh', dungThan: 'Tử Tôn / Hào Thế' },
      { key: 'nhadat', label: '🏡 Nhà Đất & Bất Động Sản', dungThan: 'Phụ Mẫu' },
      { key: 'thicu', label: '📚 Thi Cử & Học Vấn', dungThan: 'Phụ Mẫu' },
      { key: 'xuatquoc', label: '✈️ Xuất Hành & Di Chuyển', dungThan: 'Hào Thế / Dịch Mã' },
      { key: 'phaply', label: '⚖️ Pháp Lý & Kiện Tụng', dungThan: 'Quan Quỷ' },
      { key: 'thaisan', label: '👶 Thai Sản & Sinh Nở', dungThan: 'Tử Tôn' },
      { key: 'timdo', label: '🔍 Tìm Người & Tìm Vật', dungThan: 'Thê Tài / Phụ Mẫu' },
      { key: 'tongquan', label: '🌐 Chiêm Vận Toàn Cảnh', dungThan: 'Hào Thế' }
    ];
    const curPreset = presets.find(p => p.key === state.selectedTopic) || presets[0];

    return `
      <div class="dh-topic-selector-box">
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.72rem;">
          <span class="m-lbl">Chủ đề Dụng thần:</span>
          <span style="font-size:0.68rem; color:#f5b041; font-weight:700;">
            ${curPreset ? `${curPreset.label} ➔ ${curPreset.dungThan}` : ''}
          </span>
        </div>
        <div class="dh-topic-chips-scroll">
          ${presets.map(p => `
            <button type="button" class="dh-topic-chip ${state.selectedTopic === p.key ? 'active' : ''}" data-topic-key="${p.key}">
              ${p.label}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Khởi tạo và render toàn bộ giao diện
  function render() {
    const container = document.getElementById('view-dichhoc');
    if (!container) return;

    const calInfo = getCalendarInfo(state.selectedDate);
    const canChi = calInfo.canChi || {};
    const solarTermStr = calInfo.solarTermStr || calInfo.solarTerm || 'Thu Phân';
    const chiNgay = canChi.dayZhi || 'Dần';
    const chiThang = canChi.monthZhi || 'Dậu';

    const eng = global.NetaDichHocEngine;
    const elmNgay = eng ? (eng.DIA_CHI_NGU_HANH[chiNgay] || 'Mộc') : 'Mộc';
    const elmThang = eng ? (eng.DIA_CHI_NGU_HANH[chiThang] || 'Kim') : 'Kim';

    // Xác định kết quả hiện tại theo tab
    const activeResult = (state.method === 'luchao') ? state.lucHao.result : state.maiHoa.result;
    const tuanKhongStr = (activeResult && activeResult.thoi_gian && activeResult.thoi_gian.tuanKhong)
      ? activeResult.thoi_gian.tuanKhong.join(', ')
      : 'Thìn, Tỵ';

    container.innerHTML = `
      <div class="dichhoc-container">
        <!-- 1. Thanh Menu Tab Gọn Gàng (1 Dòng Duy Nhất - Không Tràn) -->
        <div class="dh-nav-bar">
          <div class="dh-tab-group">
            <button class="dh-tab-btn ${state.method === 'luchao' ? 'active' : ''}" id="dh-tab-luchao">
              🪙 Lục Hào
            </button>
            <button class="dh-tab-btn ${state.method === 'maihoa' ? 'active' : ''}" id="dh-tab-maihoa">
              🌸 Mai Hoa
            </button>
          </div>
          <div class="dh-action-right">
            <button class="dh-icon-btn" id="dh-btn-now" title="Đồng bộ thời gian thực">
              🕒 Hiện Tại
            </button>
            <button class="dh-icon-btn" id="dh-btn-picker" title="Chọn ngày giờ chiêm quẻ">
              📅 Giờ Khác
            </button>
            <input type="datetime-local" id="dh-hidden-datetime" style="position:fixed; top:-1000px; left:-1000px; opacity:0; pointer-events:none;" />
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
            <div><span class="m-lbl">Tiết khí:</span> <strong>${calInfo.solarTerm || 'Thu Phân'}</strong></div>
            <div><span class="m-lbl">Nhật thần:</span> <strong>${chiNgay}-${elmNgay}</strong></div>
            <div><span class="m-lbl">Nguyệt lệnh:</span> <strong>${chiThang}-${elmThang}</strong></div>
            <div><span class="m-lbl">Tuần không:</span> <strong style="color:#f59e0b;">${tuanKhongStr}</strong></div>
          </div>
          <div class="dh-term-sub-strip">
            <span>🌿 Tiết: <strong>${calInfo.solarTerm || 'Thu Phân'}</strong></span>
            <span class="term-sep">•</span>
            <span>Chuyển tiết: <strong class="tk-exact-time">${calInfo.solarTermDetails ? calInfo.solarTermDetails.transition.formatted : (calInfo.solarTermFullStr && calInfo.solarTermFullStr.includes('Chuyển: ') ? calInfo.solarTermFullStr.split('Chuyển: ')[1].replace(')', '') : '')}</strong></span>
          </div>
          <div class="dh-purpose-row">
            <span class="m-lbl">Việc cần xem:</span>
            <input type="text" id="dh-purpose-input" class="dh-purpose-input" value="${state.purpose}" placeholder="Nhập sự vụ muốn chiêm (ví dụ: Hợp tác làm ăn, Tài lộc, Gia sự)...">
          </div>
          ${renderTopicSelector()}
        </div>

        <!-- 3. Khu Vực Tương Tác Theo Tab (Lục Hào: Gieo Xu Ống Quẻ / Mai Hoa: Khởi Quẻ Thời Gian & Số) -->
        ${renderInteractionPanel()}

        <!-- 4. Bản Phân Tích Lục Hào Nạp Giáp & Thần Sát (Chuẩn 100% Theo Đúng Tab Đang Xem) -->
        <div id="dh-result-section">
          ${renderResultSection()}
        </div>
      </div>
    `;

    bindEvents();
  }

  // Render khu vực tương tác theo tab được chọn
  function renderInteractionPanel() {
    if (state.method === 'luchao') {
      const curHaoCount = state.lucHao.coins.length;
      const sum = state.lucHao.coinStates.reduce((a, b) => a + b, 0);
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

      let nameChinh = '-';
      let nameHo = '-';
      let nameBien = '-';
      if (state.lucHao.result && state.lucHao.result.que_goc) {
        nameChinh = state.lucHao.result.que_goc.name;
        nameHo = state.lucHao.result.que_ho ? state.lucHao.result.que_ho.name : '-';
        nameBien = state.lucHao.result.que_bien ? state.lucHao.result.que_bien.name : 'Thuần Tĩnh';
      }

      return `
        <div class="dh-toss-card">
          <!-- A. 3 THẺ QUẺ TRÊN ĐẦU (QUẺ CHÍNH | QUẺ HỖ | QUẺ BIẾN) -->
          <div class="dh-casting-slots-card">
            <div class="dh-slots-header">
              <div class="dh-slot-col">
                <div class="slot-title">QUẺ CHÍNH</div>
                <div class="slot-bars-box">
                  ${renderSlotBars('chinh')}
                </div>
                <div class="slot-name-label">${nameChinh}</div>
              </div>
              <div class="dh-slot-divider"></div>

              <div class="dh-slot-col">
                <div class="slot-title">QUẺ HỖ</div>
                <div class="slot-bars-box">
                  ${renderSlotBars('ho')}
                </div>
                <div class="slot-name-label">${nameHo}</div>
              </div>
              <div class="dh-slot-divider"></div>

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

          <!-- B. LỜI DẪN NHẮC NHỞ -->
          <div class="dh-prompt-quote">
            <span class="quote-mark">“</span>
            <span class="quote-text">${quoteText}</span>
            <span class="quote-mark">”</span>
          </div>

          <!-- C. TRUNG TÂM TƯƠNG TÁC: BÁT QUÁI TIÊN THIÊN & ỐNG QUẺ THÁI CỰC -->
          <div class="dh-stage-arena">
            <div class="dh-bagua-bg">
              <svg class="dh-bagua-svg" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.35" />
                <circle cx="100" cy="100" r="62" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.25" />
                
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

                <g transform="translate(100, 100)">
                  <circle cx="0" cy="0" r="32" fill="#0f172a" stroke="#d97706" stroke-width="1.5" />
                  <path d="M 0 -32 A 32 32 0 0 1 0 32 A 16 16 0 0 1 0 0 A 16 16 0 0 0 0 -32" fill="#f8fafc" />
                  <circle cx="0" cy="-16" r="4" fill="#0f172a" />
                  <circle cx="0" cy="16" r="4" fill="#f8fafc" />
                </g>
              </svg>
            </div>

            <div class="dh-tube-container ${state.lucHao.isFlipping ? 'tube-shaking' : ''}" id="dh-interactive-tube" title="Chạm vào Ống Quẻ để gieo Hào!">
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

                <ellipse cx="70" cy="24" rx="46" ry="13" fill="url(#rimGrad)" stroke="#221206" stroke-width="2.2" />
                <ellipse cx="70" cy="24" rx="40" ry="9" fill="#120902" />

                <path d="M 24 24 L 29 158 Q 70 170 111 158 L 116 24 Z" fill="url(#woodGrad)" stroke="#2a1406" stroke-width="2" />
                
                <line x1="44" y1="26" x2="47" y2="162" stroke="#2c1507" stroke-width="1.5" opacity="0.6" />
                <line x1="63" y1="27" x2="64" y2="165" stroke="#2c1507" stroke-width="1.5" opacity="0.6" />
                <line x1="77" y1="27" x2="76" y2="165" stroke="#2c1507" stroke-width="1.5" opacity="0.6" />
                <line x1="96" y1="26" x2="93" y2="162" stroke="#2c1507" stroke-width="1.5" opacity="0.6" />

                <path d="M 25 46 Q 70 54 115 46" fill="none" stroke="#d97706" stroke-width="2.5" opacity="0.75" />
                <path d="M 28 138 Q 70 146 112 138" fill="none" stroke="#d97706" stroke-width="2.5" opacity="0.75" />

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
            ${state.lucHao.coinStates.map((val, idx) => renderCoinSVG(val, state.lucHao.isFlipping, idx)).join('')}
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
            <button class="dh-mh-btn ${state.maiHoa.mode === 'time' ? 'active' : ''}" id="dh-mh-tab-time">
              🕒 Theo Thời Gian Tiết Khí
            </button>
            <button class="dh-mh-btn ${state.maiHoa.mode === 'numbers' ? 'active' : ''}" id="dh-mh-tab-numbers">
              🔢 Theo 2 Số Tâm Linh
            </button>
          </div>

          ${state.maiHoa.mode === 'numbers' ? `
            <div class="dh-numbers-row">
              <div class="num-col">
                <label>Số A (Thượng quái):</label>
                <input type="number" id="dh-inp-num-a" class="dh-num-input" value="${state.maiHoa.soA}" min="1" max="9999">
              </div>
              <div class="num-col">
                <label>Số B (Hạ quái):</label>
                <input type="number" id="dh-inp-num-b" class="dh-num-input" value="${state.maiHoa.soB}" min="1" max="9999">
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
            <button class="dh-action-btn outline" id="dh-btn-reset-maihoa">
              🔄 Làm Mới
            </button>
          </div>
        </div>
      `;
    }
  }

  // =========================================================================
  // 4. RENDER CÁC THẺ PHÂN TÍCH LỤC HÀO 2.0 (DASHBOARD & FULL REPORT)
  // =========================================================================

  // Mỏ neo kiểm chứng hiện trạng ngoại câu hỏi
  function renderGroundTruthCard(gt) {
    if (!gt || !gt.verification_anchors) return '';
    const va = gt.verification_anchors;
    return `
      <div class="dh-gt-card">
        <div class="dh-gt-title">
          <span>🔍</span> MỎ NEO KIỂM CHỨNG HIỆN TRẠNG NGOẠI CÂU HỎI (GROUND-TRUTH FIDELITY)
        </div>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:8px;">
          Đối chiếu 3 mỏ neo thực tế để kiểm chứng độ đắc khí và độ chính xác của quẻ trước khi xem xét tương lai:
        </div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          <div class="dh-eval-card" style="background:rgba(16,185,129,0.06); border-color:rgba(16,185,129,0.25);">
            <div><strong>1. Thể trạng & Khí lực Đương số:</strong> <span class="dh-badge-pill pill-neutral">${escapeReportHtml(va.personal_health?.status || 'Bình ổn')}</span></div>
            <div style="margin-top:2px;">${escapeReportHtml(va.personal_health?.evidence || '')}</div>
          </div>
          <div class="dh-eval-card" style="background:rgba(16,185,129,0.06); border-color:rgba(16,185,129,0.25);">
            <div><strong>2. Không gian Gia trạch & Môi trường:</strong> <span class="dh-badge-pill pill-neutral">${escapeReportHtml(va.spatial_fengshui?.status || 'Bình ổn')}</span></div>
            <div style="margin-top:2px;">${escapeReportHtml(va.spatial_fengshui?.evidence || '')}</div>
          </div>
          <div class="dh-eval-card" style="background:rgba(16,185,129,0.06); border-color:rgba(16,185,129,0.25);">
            <div><strong>3. Biến cố & Vận động Gần đây:</strong> <span class="dh-badge-pill pill-neutral">${escapeReportHtml(va.recent_past_events?.status || 'Bình ổn')}</span></div>
            <div style="margin-top:2px;">${escapeReportHtml(va.recent_past_events?.evidence || '')}</div>
          </div>
        </div>
      </div>
    `;
  }

  // Radar cảnh báo nguy cơ tiềm ẩn & điểm nghẽn
  function renderHazardRadarCard(hazards) {
    if (!hazards || hazards.length === 0) return '';
    return `
      <div class="dh-hazard-card">
        <div class="dh-hazard-title">
          <span>⚠️</span> RADAR CẢNH BÁO NGUY CƠ TIỀM ẨN & ĐIỂM NGHẼN NĂNG LƯỢNG
        </div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${hazards.map(hz => {
            const isHigh = hz.level && (hz.level.includes('Cao') || hz.level.includes('Trọng') || hz.level.includes('CỰC'));
            return `
              <div class="dh-eval-card" style="background:${isHigh ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)'}; border-color:${isHigh ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'};">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                  <strong style="color:${isHigh ? '#ef4444' : '#f59e0b'};">${escapeReportHtml(hz.title)}</strong>
                  <span class="dh-badge-pill ${isHigh ? 'pill-hung' : 'pill-warn'}">${escapeReportHtml(hz.level || 'Cần lưu ý')}</span>
                </div>
                <div style="color:var(--text-color); margin-bottom:4px;">${escapeReportHtml(hz.detail)}</div>
                ${hz.remedy ? `<div style="font-size:0.72rem; color:var(--gold-glow);">🛡️ <strong>Hóa giải:</strong> ${escapeReportHtml(hz.remedy)}</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Định thời điểm ứng kỳ (Harmonic Timing)
  function renderHarmonicTimingCard(timing) {
    if (!timing) return '';
    const opt = timing.optimal_positive_timing;
    const risk = timing.critical_risk_timing;

    return `
      <div class="dh-timing-card">
        <div class="dh-timing-title">
          <span>⏳</span> ĐỊNH THỜI ĐIỂM ỨNG KỲ (HARMONIC TIMING ENGINE)
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:8px;">
          ${opt ? `
            <div class="dh-eval-card" style="background:rgba(16,185,129,0.07); border-color:rgba(16,185,129,0.3);">
              <div style="font-weight:700; color:#10b981; margin-bottom:3px;">
                🌟 Thời Điểm Hanh Thông / Đắc Lực Nhất:
              </div>
              <div style="font-size:0.76rem; color:var(--text-color);">
                Chi <strong>${opt.branch}</strong> • Góc pha: ${Math.round(opt.angle_deg)}° • Điểm cộng hưởng: <strong>+${(opt.resonance_score || 0).toFixed(1)}</strong>
              </div>
              <div style="font-size:0.74rem; color:var(--text-muted); margin-top:2px;">
                ${escapeReportHtml(opt.meaning || '')}
              </div>
            </div>
          ` : ''}
          ${risk ? `
            <div class="dh-eval-card" style="background:rgba(239,68,68,0.07); border-color:rgba(239,68,68,0.3);">
              <div style="font-weight:700; color:#ef4444; margin-bottom:3px;">
                ⚠️ Thời Điểm Rủi Ro / Cần Phòng Tránh:
              </div>
              <div style="font-size:0.76rem; color:var(--text-color);">
                Chi <strong>${risk.branch}</strong> • Góc pha: ${Math.round(risk.angle_deg)}° • Điểm xung đột: <strong>-${(risk.risk_score || 0).toFixed(1)}</strong>
              </div>
              <div style="font-size:0.74rem; color:var(--text-muted); margin-top:2px;">
                ${escapeReportHtml(risk.meaning || '')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // 6 Lăng kính chuyên sâu Nhất Quái Đa Đoán (Lý Kế Trung)
  function renderMultiLensGrid(daDoan) {
    if (!daDoan) return '';
    const lenses = [
      { key: 'lens_1_primary_intent', icon: '🎯', title: '1. Sự Vụ Trọng Tâm', data: daDoan.lens_1_primary_intent },
      { key: 'lens_2_wealth', icon: '💰', title: '2. Tài Vận & Dòng Tiền', data: daDoan.lens_2_wealth },
      { key: 'lens_3_career', icon: '💼', title: '3. Công Danh & Sự Nghiệp', data: daDoan.lens_3_career },
      { key: 'lens_4_relationship', icon: '❤️', title: '4. Tình Cảm & Nhân Duyên', data: daDoan.lens_4_relationship },
      { key: 'lens_5_health', icon: '🩺', title: '5. Thân Thể & Tật Bệnh', data: daDoan.lens_5_health },
      { key: 'lens_6_spatial_fengshui', icon: '🏡', title: '6. Phong Thủy & Không Gian', data: daDoan.lens_6_spatial_fengshui }
    ];

    return `
      <div style="margin-bottom:12px;">
        <div style="font-size:0.84rem; font-weight:800; color:var(--gold-primary); margin-bottom:8px; display:flex; align-items:center; gap:6px;">
          <span>🌌</span> 6 LĂNG KÍNH CHUYÊN SÂU (NHẤT QUÁI ĐA ĐOÁN - LÝ KẾ TRUNG)
        </div>
        <div class="dh-multilens-grid">
          ${lenses.map(l => {
            if (!l.data) return '';
            return `
              <div class="dh-lens-card">
                <div class="dh-lens-head">
                  <span class="dh-lens-title"><span>${l.icon}</span> ${escapeReportHtml(l.title)}</span>
                  <span class="dh-lens-badge">${l.data.key_haos ? l.data.key_haos.join(', ') : 'Lục Hào'}</span>
                </div>
                <div class="dh-lens-body">
                  ${escapeReportHtml(l.data.summary || '')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Sự vụ trọng tâm & phân tích đa mục tiêu
  function renderMultiObjectiveCard(intentUtility, hexDetails) {
    if (!intentUtility) return '';
    const objs = intentUtility.objectives || {};
    const theHao = hexDetails?.haos ? hexDetails.haos[hexDetails.the_position - 1] : null;
    const ungHao = hexDetails?.haos ? hexDetails.haos[hexDetails.ung_position - 1] : null;

    return `
      <div class="dh-eval-card highlight" style="margin-bottom:12px;">
        <div class="dh-card-title">🎯 Sự Vụ Trọng Tâm & Tương Quan Thế - Ứng:</div>
        <div style="font-size:0.78rem; line-height:1.6; margin-bottom:8px;">
          • <strong>Hào Thế (Bản thân / Phía mình):</strong> Hào ${hexDetails?.the_position} (${theHao ? `${theHao.luc_than} ${theHao.can}-${theHao.branch} • Hành ${theHao.element}` : '-'}) • Điểm năng lượng: <strong>${theHao ? (theHao.energy > 0 ? '+' : '') + theHao.energy.toFixed(1) : '0'} (${theHao?.spectrum || 'Bình'})</strong>
          <br>• <strong>Hào Ứng (Đối tác / Đối tượng):</strong> Hào ${hexDetails?.ung_position} (${ungHao ? `${ungHao.luc_than} ${ungHao.can}-${ungHao.branch} • Hành ${ungHao.element}` : '-'}) • Điểm năng lượng: <strong>${ungHao ? (ungHao.energy > 0 ? '+' : '') + ungHao.energy.toFixed(1) : '0'} (${ungHao?.spectrum || 'Bình'})</strong>
        </div>
        <div style="font-size:0.75rem; font-weight:700; color:var(--gold-glow); margin-bottom:4px;">
          📊 Phân Tích Đa Mục Tiêu & Kỳ Vọng Hữu Dụng E[U]:
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:6px;">
          ${Object.keys(objs).map(k => {
            const o = objs[k];
            const isCat = o.state === 'CAT_VUONG';
            const isHung = o.state === 'CANH_BAO_RUI_RO';
            return `
              <div style="background:rgba(0,0,0,0.25); border:1px solid rgba(245,176,65,0.18); border-radius:6px; padding:6px 8px; font-size:0.72rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                  <strong>${escapeReportHtml(o.target_name || k)}</strong>
                  <span class="dh-badge-pill ${isCat ? 'pill-cat' : (isHung ? 'pill-hung' : 'pill-neutral')}">${escapeReportHtml(o.state || '')}</span>
                </div>
                <div>Trọng số: ${Math.round((o.weight || 0) * 100)}% • Hữu dụng: <strong>${(o.weighted_utility || 0).toFixed(2)}</strong></div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Toàn văn báo cáo chuyên sâu 7 phần (Full Report Reader)
  function renderFullReportReader() {
    const interp = state.interpretation;
    const rawText = (state.currentReportMode === 'ai' && state.aiPolishedText) 
      ? state.aiPolishedText 
      : (interp ? interp.reportText : '');

    return `
      <div class="dh-full-report-wrap">
        <div class="dh-report-header-wrap" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid rgba(245, 176, 65, 0.25);">
          <div style="font-weight: 800; font-size: 0.95rem; color: var(--gold-glow); display: flex; align-items: center; gap: 8px;">
            <span>📜</span> BẢN TOÀN VĂN LUẬN GIẢI KINH DỊCH LỤC HÀO 2.0
          </div>
          <div class="neta-report-mode-toggle">
            <button type="button" class="neta-mode-pill ${state.currentReportMode === 'standard' ? 'active' : ''}" id="btn-dh-mode-standard">
              📜 Bản Tiêu Chuẩn
            </button>
            <button type="button" class="neta-mode-pill ${state.currentReportMode === 'ai' ? 'active' : ''}" id="btn-dh-mode-ai">
              ${state.isInterpretingAI ? '⏳ Đang Trau Chuốt...' : '✨ Bản Trau Chuốt (AI)'}
            </button>
          </div>
        </div>

        ${state.currentReportMode === 'ai' ? `
          ${state.isInterpretingAI ? `
            <div class="neta-inline-ai-loading">
              <div class="neta-ai-loading-step">
                <span class="neta-ai-sparkle-icon">✨</span>
                <span>${state.aiLoadingStepText || 'Đang tiến hành biên tập, trau chuốt ngôn từ Dịch lý 2.0 và phân tích khí số...'}</span>
              </div>
              <div class="neta-ai-shimmer-track"><div class="neta-ai-shimmer-thumb"></div></div>
            </div>
          ` : ''}

          ${state.aiErrorMessage ? `
            <div style="color: #e74c3c; font-weight: 600; font-size: 0.85rem; line-height: 1.6; background: rgba(231,76,60,0.12); padding: 14px; border-radius: 8px; border: 1px solid rgba(231,76,60,0.3); margin: 16px 0;">
              <div>⚠️ ${escapeReportHtml(state.aiErrorMessage)}</div>
              <div style="margin-top: 10px;">
                <button type="button" class="neta-btn-action" id="btn-dh-open-key-modal" style="background: var(--gold-primary); color: #000; font-weight: 700; border-color: var(--gold-glow);">
                  ⚙️ Cài Đặt Khóa Gemini API Dùng Chung
                </button>
              </div>
            </div>
          ` : ''}

          ${state.aiPolishedText ? `
            <div class="neta-polished-status-bar">
              <span>✨ Bản Luận Giải Đã Được Trau Chuốt Học Thuật Bởi Gemini AI</span>
              <button type="button" class="neta-btn-inline-back" id="btn-dh-back-standard">↩️ Xem Bản Tiêu Chuẩn</button>
            </div>
            <div class="dh-full-report-content neta-drop-cap" style="font-size: 0.88rem; line-height: 1.75; color: var(--text-color); margin-top: 16px;">
              ${formatReportToRichHtml(state.aiPolishedText)}
            </div>
          ` : (!state.isInterpretingAI && !state.aiErrorMessage ? `
            <div style="text-align: center; padding: 36px 16px; color: var(--text-muted);">
              <p style="margin-bottom: 12px;">Chưa kích hoạt trau chuốt văn phong cho quẻ Dịch này.</p>
              <button type="button" class="neta-btn-polish-ai" id="btn-dh-inline-trigger-ai">
                ✨ Bắt Đầu Trau Chuốt Văn Phong
              </button>
            </div>
          ` : '')}
        ` : `
          <!-- Table of Contents Pills for 7 Sections -->
          <div class="bazi-report-toc" style="margin-bottom: 14px;">
            <span style="font-weight: 700; font-size: 0.72rem; color: var(--gold-primary); align-self: center; margin-right: 4px;">Chuyên mục:</span>
            <span class="bazi-report-toc-pill">I. Đánh Giá Tổng Quan</span>
            <span class="bazi-report-toc-pill">II. Kiểm Chứng Hiện Trạng</span>
            <span class="bazi-report-toc-pill">III. Điểm Thuận Lợi</span>
            <span class="bazi-report-toc-pill">IV. Nguy Cơ Tiềm Ẩn</span>
            <span class="bazi-report-toc-pill">V. 6 Lăng Kính</span>
            <span class="bazi-report-toc-pill">VI. Lời Khuyên & Ứng Kỳ</span>
            <span class="bazi-report-toc-pill">VII. Bảng Quẻ Kỹ Thuật</span>
          </div>

          <div class="dh-full-report-content neta-drop-cap" style="font-size: 0.88rem; line-height: 1.75; color: var(--text-color);">
            ${formatReportToRichHtml(rawText)}
          </div>
        `}

        <!-- Cụm nút cuối trang tinh tế, không tràn chữ -->
        <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid rgba(245, 176, 65, 0.3); display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap;">
          <button type="button" class="neta-btn-action" id="dh-btn-copy-report-bottom" title="Sao chép toàn bộ bài luận giải">
            📋 Sao Chép
          </button>
          <button type="button" class="neta-btn-action" id="dh-btn-download-report-bottom" title="Tải xuống bài luận giải (.MD)">
            💾 Tải (.MD)
          </button>
        </div>
      </div>
    `;
  }

  // Dashboard tổng hợp khí số & 6 lăng kính Lục Hào 2.0
  function renderLucHao2Dashboard(res, pipelineResult, goc, ho, bien, phuc) {
    const iu = pipelineResult ? pipelineResult.intent_utility : null;
    let bannerClass = 'banner-binh';
    let decisionText = iu ? iu.decision : 'BÌNH HÒA';
    let probText = iu ? Math.round((iu.success_probability || 0.5) * 100) + '%' : '50%';
    let expectedUtilityText = iu ? (iu.total_utility || 0).toFixed(2) : '0.50';
    let primaryDomain = iu ? iu.primary_domain : 'Chiêm đoán sự vụ';

    if (iu) {
      if (iu.success_probability >= 0.6) bannerClass = 'banner-cat';
      else if (iu.success_probability <= 0.4) bannerClass = 'banner-hung';
    }

    return `
      <!-- A. ĐỒ HÌNH 3 QUẺ TRỰC QUAN -->
      <div class="dh-hex-arena triple">
        <div class="dh-hex-item">
          <div class="hex-badge chu">Quẻ Chính</div>
          <div class="hex-name">${goc.name}</div>
          <div class="hex-bars">
            ${renderBarsSlim(goc.bits, goc.haos ? goc.haos.map(h => h.isDong) : [])}
          </div>
          <div class="hex-cung">Họ ${goc.cung}${goc.cungSpecial ? ` (${goc.cungSpecial})` : ''}</div>
        </div>

        <div class="dh-hex-item">
          <div class="hex-badge ho">Quẻ Hỗ</div>
          <div class="hex-name">${ho ? ho.name : '-'}</div>
          <div class="hex-bars">
            ${ho ? renderBarsSlim(ho.bits, []) : ''}
          </div>
          <div class="hex-cung">${ho ? `Họ ${ho.cung}${ho.cungSpecial ? ` (${ho.cungSpecial})` : ''}` : '-'}</div>
        </div>

        <div class="dh-hex-item">
          <div class="hex-badge bien">Quẻ Biến</div>
          <div class="hex-name">${bien ? bien.name : 'Thuần Tĩnh'}</div>
          <div class="hex-bars">
            ${bien ? renderBarsSlim(bien.bits, []) : '<div style="font-size:0.7rem; color:#64748b; padding:18px 0;">Không động</div>'}
          </div>
          <div class="hex-cung">${bien ? `Họ ${bien.cung}${bien.cungSpecial ? ` (${bien.cungSpecial})` : ''}` : 'Bất biến'}</div>
        </div>
      </div>

      <!-- B. BANNER PHÁN ĐOÁN TỔNG THỂ KHÍ SỐ & XÁC SUẤT KHẢ THI -->
      <div class="dh-judgment-banner ${bannerClass}" style="margin-bottom: 12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div>
            <span style="font-size:0.92rem; font-weight:800;">⚖️ PHÁN QUYẾT: ${escapeReportHtml(decisionText)}</span>
            <div style="font-size:0.75rem; opacity:0.92; margin-top:3px;">
              Trọng tâm: <strong>${escapeReportHtml(primaryDomain)}</strong> • Kỳ vọng hữu dụng: <strong>${expectedUtilityText}</strong> • Xác suất khả thi: <strong>${probText}</strong>
            </div>
          </div>
          <div style="font-size:0.76rem; text-align:right;">
            <span class="dh-badge-gold">Quẻ ${escapeReportHtml(goc.name)} ${bien ? '➔ ' + escapeReportHtml(bien.name) : ''}</span>
          </div>
        </div>
      </div>

      <!-- C. SỰ VỤ TRỌNG TÂM & TƯƠNG QUAN THẾ - ỨNG -->
      ${pipelineResult ? renderMultiObjectiveCard(pipelineResult.intent_utility, pipelineResult.hexagram_details) : ''}

      <!-- D. MỎ NEO KIỂM CHỨNG HIỆN TRẠNG NGOẠI CÂU HỎI -->
      ${pipelineResult ? renderGroundTruthCard(pipelineResult.ground_truth) : ''}

      <!-- E. RADAR CẢNH BÁO NGUY CƠ TIỀM ẨN -->
      ${pipelineResult ? renderHazardRadarCard(pipelineResult.nhat_quai_da_doan?.hidden_hazards_radar) : ''}

      <!-- F. ĐỊNH THỜI ĐIỂM ỨNG KỲ -->
      ${pipelineResult ? renderHarmonicTimingCard(pipelineResult.harmonic_timing) : ''}

      <!-- G. 6 LĂNG KÍNH CHUYÊN SÂU NHẤT QUÁI ĐA ĐOÁN -->
      ${pipelineResult ? renderMultiLensGrid(pipelineResult.nhat_quai_da_doan) : ''}

      <!-- H. BẢNG I: PHÂN TÍCH LỤC HÀO NẠP GIÁP & LỤC THÚ -->
      <div class="dh-table-container">
        <div class="dh-table-title">
          <span>📋 BẢNG I: PHÂN TÍCH LỤC HÀO NẠP GIÁP & LỤC THÚ</span>
        </div>
        <div class="dh-table-scroll">
          <table class="dh-spec-table">
            <thead>
              <tr class="th-group-row">
                <th colspan="6" class="th-group-left">QUẺ ${goc.name.toUpperCase()}</th>
                <th colspan="5" class="th-group-right">${bien ? `QUẺ ${bien.name.toUpperCase()}` : 'BẤT BIẾN (THUẦN TĨNH)'}</th>
              </tr>
              <tr class="th-cols-row">
                <th style="width: 32px;">Hào</th>
                <th style="width: 36px;">T/Ứ</th>
                <th>Lục Thân</th>
                <th>Can Chi</th>
                <th>Phục thần</th>
                <th style="width: 28px;">TK</th>
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
                    <td class="td-center td-bar">${renderMiniYaoBar(hGoc.bit, isDong)}</td>
                    <td class="td-center">
                      ${hGoc.isThe ? '<span class="pill-the">Thế</span>' : ''}
                      ${hGoc.isUng ? '<span class="pill-ung">Ứng</span>' : ''}
                    </td>
                    <td class="td-bold ${isDong ? 'text-red' : ''}">${hGoc.lucThan}</td>
                    <td class="${isDong ? 'text-red' : ''}">${hGoc.can}-${hGoc.chi} <small>(${hGoc.chiElement})</small></td>
                    <td class="td-phuc">${phucItem ? `${phucItem.lucThan.split(' ')[0]}-${phucItem.chi}` : '-'}</td>
                    <td class="td-center ${hGoc.isTuanKhong ? 'text-tk' : ''}">${hGoc.isTuanKhong ? 'K' : ''}</td>

                    <td class="td-bold ${isDong && hBien ? 'text-red' : 'td-dim'}">${hBien ? hBien.lucThan : '-'}</td>
                    <td class="${isDong && hBien ? 'text-red' : 'td-dim'}">${hBien ? `${hBien.can}-${hBien.chi} <small>(${hBien.chiElement})</small>` : '-'}</td>
                    <td class="td-center ${hBien && hBien.isTuanKhong ? 'text-tk' : ''}">${(hBien && hBien.isTuanKhong) ? 'K' : ''}</td>
                    <td class="td-thu ${isDong ? 'text-red' : ''}">${hGoc.lucThu}</td>
                    <td class="td-center td-bar">${hBien ? renderMiniYaoBar(hBien.bit, false) : '-'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- I. BẢNG II: VƯỢNG SUY & THẦN SÁT TỪNG HÀO -->
      <div class="dh-table-container">
        <div class="dh-table-title">
          <span>🌟 BẢNG II: VƯỢNG SUY & THẦN SÁT TỪNG HÀO</span>
        </div>
        <div class="dh-table-scroll">
          <table class="dh-spec-table">
            <thead>
              <tr class="th-group-row">
                <th colspan="8" class="th-group-left">QUẺ ${goc.name.toUpperCase()}</th>
                <th colspan="6" class="th-group-right">${bien ? `QUẺ ${bien.name.toUpperCase()}` : 'BẤT BIẾN (THUẦN TĨNH)'}</th>
              </tr>
              <tr class="th-cols-row">
                <th>Hào</th>
                <th style="width: 38px;">V-S</th>
                <th style="width: 44px;">Cân Lực</th>
                <th style="width: 48px;">Quái thần</th>
                <th style="width: 32px;">Lộc</th>
                <th style="width: 32px;">Mã</th>
                <th style="width: 32px;">Quý</th>
                <th style="width: 32px;">Đào</th>
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

                let canLucBadge = '-';
                if (pipelineResult?.hexagram_details?.haos) {
                  const hao2 = pipelineResult.hexagram_details.haos[i];
                  if (hao2) {
                    const sc = Math.round(hao2.energy * 10) / 10;
                    const cls = sc >= 1.5 ? 'vuong' : (sc <= -1.5 ? 'suy' : 'binh');
                    const starsList = (hao2.stars || []).join('; ');
                    canLucBadge = `<span class="badge-canluc ${cls}" title="${hao2.spectrum || ''}${starsList ? ': ' + starsList : ''}">${sc > 0 ? '+' : ''}${sc}</span>`;
                  }
                } else if (state.interpretation?.evaluation?.haosEnriched) {
                  const enrichedHao = state.interpretation.evaluation.haosEnriched[i];
                  if (enrichedHao && enrichedHao.canLuc) {
                    const sc = enrichedHao.canLuc.score;
                    const cls = sc >= 1.5 ? 'vuong' : (sc <= -1.5 ? 'suy' : 'binh');
                    canLucBadge = `<span class="badge-canluc ${cls}" title="${enrichedHao.canLuc.status}: ${enrichedHao.canLuc.notes.join('; ')}">${sc > 0 ? '+' : ''}${sc}</span>`;
                  }
                }

                return `
                  <tr class="dh-row ${isDong ? 'row-dong' : ''}">
                    <td class="td-bold ${isDong ? 'text-red' : ''}">${hGoc.can} ${hGoc.chi}</td>
                    <td class="td-center ${hGoc.vuongSuy === 'Vượng' ? 'text-green' : (hGoc.vuongSuy === 'Tướng' ? 'text-cyan' : '')}">${hGoc.vuongSuy}</td>
                    <td class="td-center">${canLucBadge}</td>
                    <td class="td-center">${hGoc.isQuaiThan ? '<strong class="badge-ts qt">QT</strong>' : '-'}</td>
                    <td class="td-center">${hGoc.isLoc ? '<strong class="badge-ts loc">L</strong>' : '-'}</td>
                    <td class="td-center">${hGoc.isMa ? '<strong class="badge-ts ma">M</strong>' : '-'}</td>
                    <td class="td-center">${hGoc.isQuy ? '<strong class="badge-ts quy">Q</strong>' : '-'}</td>
                    <td class="td-center">${hGoc.isDao ? '<strong class="badge-ts dao">Đ</strong>' : '-'}</td>

                    <td class="td-bold ${isDong && hBien ? 'text-red' : 'td-dim'}">${hBien ? `${hBien.can} ${hBien.chi}` : '-'}</td>
                    <td class="td-center ${hBien && hBien.vuongSuy === 'Vượng' ? 'text-green' : (hBien && hBien.vuongSuy === 'Tướng' ? 'text-cyan' : 'td-dim')}">${hBien ? hBien.vuongSuy : '-'}</td>
                    <td class="td-center">${(hBien && hBien.isLoc) ? '<strong class="badge-ts loc">L</strong>' : '-'}</td>
                    <td class="td-center">${(hBien && hBien.isMa) ? '<strong class="badge-ts ma">M</strong>' : '-'}</td>
                    <td class="td-center">${(hBien && hBien.isQuy) ? '<strong class="badge-ts quy">Q</strong>' : '-'}</td>
                    <td class="td-center">${(hBien && hBien.isDao) ? '<strong class="badge-ts dao">Đ</strong>' : '-'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- J. THOÁN TỪ KINH DỊCH CHUẨN XÁC -->
      <div class="dh-thoan-card">
        <div class="thoan-title">Kinh Dịch Thoán Từ & Ý Nghĩa:</div>
        <div class="thoan-text"><strong>${goc.name}:</strong> "${goc.tho || 'Cương nhu ứng hội, đạo trời tuần hoàn, giữ lòng trung chính ắt được hanh thông.'}"</div>
      </div>
    `;
  }

  // =========================================================================
  // 5. RENDER BẢN QUẺ & PHÂN TÍCH LỤC HÀO NẠP GIÁP TOÀN DIỆN (THEO ĐÚNG TAB)
  // =========================================================================
  function renderResultSection() {
    const isLucHao = (state.method === 'luchao');
    
    // Nếu là Lục Hào mà chưa đủ 6 hào thì chưa hiển thị bảng phân tích (đang trong quá trình gieo)
    if (isLucHao && (!state.lucHao.result || state.lucHao.coins.length < 6)) {
      return '';
    }

    // Nếu là Mai Hoa mà chưa có kết quả thì tính ngay
    if (!isLucHao && !state.maiHoa.result) {
      chayLapQueMaiHoa();
    }

    const curResult = isLucHao ? state.lucHao.result : state.maiHoa.result;
    if (!curResult) return '';

    const res = isLucHao ? curResult : (curResult.luc_hao || curResult);
    const goc = isLucHao ? res.que_goc : {
      name: curResult.que_chu.name,
      tuong: curResult.que_chu.tuong,
      tho: curResult.que_chu.tho,
      cung: curResult.que_chu.cung,
      cungSpecial: curResult.que_chu.cungSpecial,
      bits: curResult.que_chu.bits,
      haos: (res && res.que_goc) ? res.que_goc.haos : []
    };
    const ho = isLucHao ? (res.que_ho || null) : curResult.que_ho;
    const bien = isLucHao ? res.que_bien : (res ? res.que_bien : {
      name: curResult.que_bien.name,
      tuong: curResult.que_bien.tuong,
      tho: curResult.que_bien.tho,
      cung: curResult.que_bien.cung,
      cungSpecial: curResult.que_bien.cungSpecial,
      bits: curResult.que_bien.bits,
      haos: (res && res.que_bien) ? res.que_bien.haos : []
    });

    const phuc = res ? (res.phuc_than || []) : [];

    // Nếu là Lục Hào: Hiển thị Action Toolbar & Dual Subnav
    if (isLucHao) {
      return `
        <div class="dh-main-result-card" id="dh-capture-target">
          <!-- 1. Thanh Công Cụ Chuẩn Hóa Neta -->
          <div class="neta-action-toolbar">
            <div class="neta-module-badge">
              <span>📜</span>
              <span>Kinh Dịch Lục Hào 2.0 • Nhất Quái Đa Đoán</span>
            </div>
            <div class="neta-toolbar-actions">
              <button type="button" class="neta-btn-action" id="dh-btn-copy-report" title="Sao chép toàn bộ bài luận giải">
                📋 Sao Chép
              </button>
              <button type="button" class="neta-btn-action" id="dh-btn-download-report" title="Tải xuống bài luận giải (.MD)">
                💾 Tải (.MD)
              </button>
              <button type="button" class="neta-btn-polish-ai" id="dh-btn-run-ai" ${state.isInterpretingAI ? 'disabled' : ''} title="Trau chuốt văn phong toàn diện bằng AI">
                ${state.isInterpretingAI ? '⏳ Đang Trau Chuốt...' : '✨ Trau Chuốt'}
              </button>
            </div>
          </div>

          <!-- 2. Sub-Tab Navigation (Dual Subnav) -->
          <div class="dh-analysis-subnav">
            <button type="button" class="dh-subnav-btn ${state.analysisSubTab === 'dashboard' ? 'active' : ''}" id="btn-dh-tab-dashboard">
              📊 Đồ Hình & Khí Số
            </button>
            <button type="button" class="dh-subnav-btn ${state.analysisSubTab === 'report' ? 'active' : ''}" id="btn-dh-tab-full-report">
              📜 Toàn Văn
            </button>
          </div>

          <!-- 3. Nội dung theo Sub-Tab -->
          ${state.analysisSubTab === 'dashboard' ? `
            ${renderLucHao2Dashboard(res, state.lucHao2Result, goc, ho, bien, phuc)}
          ` : `
            ${renderFullReportReader()}
          `}
        </div>
      `;
    }

    // Nếu là Mai Hoa: Đồ hình 3 quẻ, Bảng I & II, Thể Dụng Mai Hoa, Thoán từ
    return `
      <div class="dh-main-result-card" id="dh-capture-target">
        <!-- A. ĐỒ HÌNH 3 QUẺ TRỰC QUAN -->
        <div class="dh-hex-arena triple">
          <div class="dh-hex-item">
            <div class="hex-badge chu">Quẻ Chính</div>
            <div class="hex-name">${goc.name}</div>
            <div class="hex-bars">
              ${renderBarsSlim(goc.bits, goc.haos ? goc.haos.map(h => h.isDong) : [])}
            </div>
            <div class="hex-cung">Họ ${goc.cung}${goc.cungSpecial ? ` (${goc.cungSpecial})` : ''}</div>
          </div>

          <div class="dh-hex-item">
            <div class="hex-badge ho">Quẻ Hỗ</div>
            <div class="hex-name">${ho ? ho.name : '-'}</div>
            <div class="hex-bars">
              ${ho ? renderBarsSlim(ho.bits, []) : ''}
            </div>
            <div class="hex-cung">${ho ? `Họ ${ho.cung}${ho.cungSpecial ? ` (${ho.cungSpecial})` : ''}` : '-'}</div>
          </div>

          <div class="dh-hex-item">
            <div class="hex-badge bien">Quẻ Biến</div>
            <div class="hex-name">${bien ? bien.name : 'Thuần Tĩnh'}</div>
            <div class="hex-bars">
              ${bien ? renderBarsSlim(bien.bits, []) : '<div style="font-size:0.7rem; color:#64748b; padding:18px 0;">Không động</div>'}
            </div>
            <div class="hex-cung">${bien ? `Họ ${bien.cung}${bien.cungSpecial ? ` (${bien.cungSpecial})` : ''}` : 'Bất biến'}</div>
          </div>
        </div>

        <!-- B. BẢNG I: LỤC HÀO NẠP GIÁP & LỤC THÚ -->
        <div class="dh-table-container">
          <div class="dh-table-title">
            <span>📋 BẢNG I: PHÂN TÍCH LỤC HÀO NẠP GIÁP & LỤC THÚ</span>
          </div>
          <div class="dh-table-scroll">
            <table class="dh-spec-table">
              <thead>
                <tr class="th-group-row">
                  <th colspan="6" class="th-group-left">QUẺ ${goc.name.toUpperCase()}</th>
                  <th colspan="5" class="th-group-right">${bien ? `QUẺ ${bien.name.toUpperCase()}` : 'BẤT BIẾN (THUẦN TĨNH)'}</th>
                </tr>
                <tr class="th-cols-row">
                  <th style="width: 32px;">Hào</th>
                  <th style="width: 36px;">T/Ứ</th>
                  <th>Lục Thân</th>
                  <th>Can Chi</th>
                  <th>Phục thần</th>
                  <th style="width: 28px;">TK</th>
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
                      <td class="td-center td-bar">${renderMiniYaoBar(hGoc.bit, isDong)}</td>
                      <td class="td-center">
                        ${hGoc.isThe ? '<span class="pill-the">Thế</span>' : ''}
                        ${hGoc.isUng ? '<span class="pill-ung">Ứng</span>' : ''}
                      </td>
                      <td class="td-bold ${isDong ? 'text-red' : ''}">${hGoc.lucThan}</td>
                      <td class="${isDong ? 'text-red' : ''}">${hGoc.can}-${hGoc.chi} <small>(${hGoc.chiElement})</small></td>
                      <td class="td-phuc">${phucItem ? `${phucItem.lucThan.split(' ')[0]}-${phucItem.chi}` : '-'}</td>
                      <td class="td-center ${hGoc.isTuanKhong ? 'text-tk' : ''}">${hGoc.isTuanKhong ? 'K' : ''}</td>

                      <td class="td-bold ${isDong && hBien ? 'text-red' : 'td-dim'}">${hBien ? hBien.lucThan : '-'}</td>
                      <td class="${isDong && hBien ? 'text-red' : 'td-dim'}">${hBien ? `${hBien.can}-${hBien.chi} <small>(${hBien.chiElement})</small>` : '-'}</td>
                      <td class="td-center ${hBien && hBien.isTuanKhong ? 'text-tk' : ''}">${(hBien && hBien.isTuanKhong) ? 'K' : ''}</td>
                      <td class="td-thu ${isDong ? 'text-red' : ''}">${hGoc.lucThu}</td>
                      <td class="td-center td-bar">${hBien ? renderMiniYaoBar(hBien.bit, false) : '-'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- C. BẢNG II: VƯỢNG SUY & THẦN SÁT TỪNG HÀO -->
        <div class="dh-table-container">
          <div class="dh-table-title">
            <span>🌟 BẢNG II: VƯỢNG SUY & THẦN SÁT TỪNG HÀO</span>
          </div>
          <div class="dh-table-scroll">
            <table class="dh-spec-table">
              <thead>
                <tr class="th-group-row">
                  <th colspan="8" class="th-group-left">QUẺ ${goc.name.toUpperCase()}</th>
                  <th colspan="6" class="th-group-right">${bien ? `QUẺ ${bien.name.toUpperCase()}` : 'BẤT BIẾN (THUẦN TĨNH)'}</th>
                </tr>
                <tr class="th-cols-row">
                  <th>Hào</th>
                  <th style="width: 38px;">V-S</th>
                  <th style="width: 44px;">Cân Lực</th>
                  <th style="width: 48px;">Quái thần</th>
                  <th style="width: 32px;">Lộc</th>
                  <th style="width: 32px;">Mã</th>
                  <th style="width: 32px;">Quý</th>
                  <th style="width: 32px;">Đào</th>
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
                      <td class="td-bold ${isDong ? 'text-red' : ''}">${hGoc.can} ${hGoc.chi}</td>
                      <td class="td-center ${hGoc.vuongSuy === 'Vượng' ? 'text-green' : (hGoc.vuongSuy === 'Tướng' ? 'text-cyan' : '')}">${hGoc.vuongSuy}</td>
                      <td class="td-center">-</td>
                      <td class="td-center">${hGoc.isQuaiThan ? '<strong class="badge-ts qt">QT</strong>' : '-'}</td>
                      <td class="td-center">${hGoc.isLoc ? '<strong class="badge-ts loc">L</strong>' : '-'}</td>
                      <td class="td-center">${hGoc.isMa ? '<strong class="badge-ts ma">M</strong>' : '-'}</td>
                      <td class="td-center">${hGoc.isQuy ? '<strong class="badge-ts quy">Q</strong>' : '-'}</td>
                      <td class="td-center">${hGoc.isDao ? '<strong class="badge-ts dao">Đ</strong>' : '-'}</td>

                      <td class="td-bold ${isDong && hBien ? 'text-red' : 'td-dim'}">${hBien ? `${hBien.can} ${hBien.chi}` : '-'}</td>
                      <td class="td-center ${hBien && hBien.vuongSuy === 'Vượng' ? 'text-green' : (hBien && hBien.vuongSuy === 'Tướng' ? 'text-cyan' : 'td-dim')}">${hBien ? hBien.vuongSuy : '-'}</td>
                      <td class="td-center">${(hBien && hBien.isLoc) ? '<strong class="badge-ts loc">L</strong>' : '-'}</td>
                      <td class="td-center">${(hBien && hBien.isMa) ? '<strong class="badge-ts ma">M</strong>' : '-'}</td>
                      <td class="td-center">${(hBien && hBien.isQuy) ? '<strong class="badge-ts quy">Q</strong>' : '-'}</td>
                      <td class="td-center">${(hBien && hBien.isDao) ? '<strong class="badge-ts dao">Đ</strong>' : '-'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- D. THUYẾT MINH THỂ - DỤNG (KHI LÀ MAI HOA) -->
        ${curResult.the_dung ? `
          <div class="dh-the-dung-card">
            <div class="td-header">
              <span>⚖️ THỂ DỤNG MAI HOA (HÀO ĐỘNG: HÀO ${curResult.hao_dong})</span>
            </div>
            <div class="td-content">
              <div class="td-col">
                <span class="td-label">THỂ QUÁI:</span> <strong>${curResult.the_dung.the.info.name}</strong> (${curResult.the_dung.the.info.element}) • Ở ${curResult.the_dung.the.vi_tri === 'thuong' ? 'Thượng Quái' : 'Hạ Quái'}
              </div>
              <div class="td-col">
                <span class="td-label">DỤNG QUÁI:</span> <strong>${curResult.the_dung.dung.info.name}</strong> (${curResult.the_dung.dung.info.element}) • Ở ${curResult.the_dung.dung.vi_tri === 'thuong' ? 'Thượng Quái' : 'Hạ Quái'}
              </div>
            </div>
            <div class="td-summary">
              <span class="badge-eval ${(curResult.the_dung.muc_do || '').includes('cat') ? 'cat' : ((curResult.the_dung.muc_do || '').includes('hung') ? 'hung' : 'binh')}">${curResult.the_dung.danh_gia}</span>
            </div>
          </div>
        ` : ''}

        <!-- E. THOÁN TỪ KINH DỊCH CHUẨN XÁC -->
        <div class="dh-thoan-card">
          <div class="thoan-title">Kinh Dịch Thoán Từ & Ý Nghĩa:</div>
          <div class="thoan-text"><strong>${goc.name}:</strong> "${goc.tho || 'Cương nhu ứng hội, đạo trời tuần hoàn, giữ lòng trung chính ắt được hanh thông.'}"</div>
        </div>
      </div>
    `;
  }


  // Chuyển đổi văn bản luận giải thành cấu trúc HTML giàu đồ họa và mỹ cảm
  function formatReportToRichHtml(rawText) {
    if (!rawText) return '';
    let text = rawText.trim();

    // 0. Làm sạch triệt để các khối code block thừa ```text ... ``` hoặc đường kẻ ====
    text = text.replace(/```[a-zA-Z]*\n?([\s\S]*?)```/g, (match, p1) => {
      return p1.split('\n').filter(line => {
        const tr = line.trim();
        if (tr.startsWith('===') || tr.startsWith('---')) return false;
        if (tr.match(/^QUẺ CHÍNH:.*QUẺ BIẾN:/i)) return false;
        if (tr.match(/^Hào\s+\d+:\s+\[.*\]\s+.*\|\s+Hào\s+\d+:/i)) return false;
        return true;
      }).join('\n');
    });
    text = text.replace(/```[a-zA-Z]*/g, '');
    text = text.replace(/```/g, '');
    // 1. Tách và chuẩn hóa biểu ngữ tiêu đề Lục Hào 2.0 (Lý Kế Trung)
    let bannerHtml = '';
    const headerMatch2 = text.match(/(?:^[=\-~_━═─]{3,}\s*\n)?\s*BÁO CÁO DỰ ĐOÁN LỤC HÀO[^\n]*\n[^\n]*\n(?:[=\-~_━═─]{3,}\s*\n)?-\s*Câu hỏi\s*:\s*"([^"]*)"\s*\n-\s*Quẻ Chính\s*:\s*([^\n]+)\s*\n-\s*Quẻ Biến\s*:\s*([^\n]+)\s*\n-\s*Thời gian gieo quẻ\s*:\s*([^\n]+)(?:\s*\n[=\-~_━═─]{3,})?/m);
    if (headerMatch2) {
      const q = headerMatch2[1];
      const queChinh = headerMatch2[2];
      const queBien = headerMatch2[3];
      const thoiGian = headerMatch2[4];
      bannerHtml = `
        <div class="dh-formatted-banner">
          <div class="dh-fb-tag">KINH DỊCH LỤC HÀO 2.0 • NHẤT QUÁI ĐA ĐOÁN (LÝ KẾ TRUNG)</div>
          <div class="dh-fb-title">BÁO CÁO DỰ ĐOÁN HỌC THUẬT CHUYÊN SÂU</div>
          <div class="dh-fb-meta">
            <div class="dh-fb-meta-item"><strong>Sự Vụ:</strong> <span>${escapeReportHtml(q || 'Chiêm đoán việc')}</span></div>
            <div class="dh-fb-meta-item"><strong>Quẻ:</strong> <span class="dh-badge-gold">${escapeReportHtml(queChinh)} ➔ ${escapeReportHtml(queBien)}</span></div>
            <div class="dh-fb-meta-item"><strong>Thời Gian:</strong> <span style="color:var(--text-muted);">${escapeReportHtml(thoiGian)}</span></div>
          </div>
        </div>
      `;
      text = text.replace(headerMatch2[0], '').trim();
    }

    text = text.replace(/^[=\-~_━═─]{3,}\s*$/gm, '');
    text = text.replace(/^[=\-~_━═─]{3,}\s*\n\s*\[HẾT BÁO CÁO DỰ ĐOÁN LỤC HÀO 2\.0\]\s*\n[=\-~_━═─]{3,}\s*$/gm, '');

    // 2. Phân tách theo từng chuyên mục (Section)
    const lines = text.split('\n');
    let html = bannerHtml;
    let currentSecTitle = '';
    let currentSecNum = '';
    let sectionLines = [];

    function flushCurrentSection() {
      if (!currentSecTitle && sectionLines.length === 0) return;
      html += `
        <div class="dh-report-card">
          ${currentSecTitle ? `
            <div class="dh-report-card-head">
              ${currentSecNum ? `<span class="dh-sec-badge">${escapeReportHtml(currentSecNum)}</span>` : ''}
              <span class="dh-sec-name">${escapeReportHtml(currentSecTitle)}</span>
            </div>
          ` : ''}
          <div class="dh-report-card-body">
            ${renderReportSectionLines(sectionLines)}
          </div>
        </div>
      `;
      currentSecTitle = '';
      currentSecNum = '';
      sectionLines = [];
    }

    const secHeaderRegex = /^(?:##\s+)?([I|V|X|0-9]+)\.\s+(.*)$/;

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const line = rawLine.trim();
      if (!line) continue;

      // Bỏ qua triệt để các dòng rác code block, bảng thô hay đường kẻ sót lại
      if (line.startsWith('```') || line.match(/^[=\-~_━═─]{3,}$/)) continue;
      if (line.includes('[HẾT BÁO CÁO DỰ ĐOÁN LỤC HÀO 2.0]')) continue;
      if (line.match(/^QUẺ CHÍNH:.*QUẺ BIẾN:/i)) continue;
      if (line.match(/^Hào\s+[1-6]:\s*\[/i) && (line.includes('(') || line.includes('|'))) continue;
      if (line.match(/\|\s*Hào\s+[1-6]:/i)) continue;

      // Nhận diện tiêu đề chuyên mục: "I. ...", "II. ...", "## I. ...", "## 1. ..."
      const match = line.match(secHeaderRegex);
      if (match) {
        flushCurrentSection();
        currentSecNum = match[1];
        currentSecTitle = match[2].replace(/:$/, '').trim();
        continue;
      }

      // Nhận diện tiêu đề markdown: "## ...", "### ..."
      const mdMatch = line.match(/^#{2,3}\s+(.*)$/);
      if (mdMatch) {
        flushCurrentSection();
        currentSecNum = '';
        currentSecTitle = mdMatch[1].replace(/:$/, '').trim();
        continue;
      }

      sectionLines.push(rawLine);
    }

    flushCurrentSection();
    return html;
  }

  // Render các dòng nội dung bên trong một chuyên mục
  function renderReportSectionLines(lines) {
    let out = '';
    for (let rawLine of lines) {
      const l = rawLine.trim();
      if (!l) continue;

      // Loại bỏ hoàn toàn các ký tự vẽ khung ASCII thô (+-----+ hoặc +====+)
      if (/^\+[=+\-\|]+\+$/.test(l)) {
        continue;
      }

      // Loại bỏ các dòng bảng rỗng (|   |   |)
      if (/^\|[\s\|]+$/.test(l)) {
        continue;
      }

      // Chuyển hóa thanh tiến trình ASCII dạng [Mục] ====> 52/100 thành badge chuẩn
      const mScore = l.match(/^(\[[^\]]+\]|[A-Za-z0-9\.\s&À-ỹ]+)\s*[-=]{3,}>\s*(.*)$/);
      if (mScore) {
        const name = mScore[1].replace(/[\[\]]/g, '').trim();
        const val = mScore[2].trim();
        out += `<div class="neta-score-bar-line"><span class="neta-score-name">${formatInlineMarkup(name)}</span><span class="neta-score-val">${formatInlineMarkup(val)}</span></div>`;
        continue;
      }

      // 1. Phán đoán cốt lõi: ">>> PHÁN ĐOÁN: [...] (Điểm khí số: ...)"
      if (l.startsWith('>>> PHÁN ĐOÁN:') || l.includes('PHÁN ĐOÁN: [')) {
        const matchPd = l.match(/PHÁN ĐOÁN:\s*\[([^\]]+)\](?:\s*\(Điểm khí số:\s*([^\)]+)\))?/i);
        if (matchPd) {
          const textPd = matchPd[1];
          const scorePd = matchPd[2] || '';
          const isCat = textPd.includes('CÁT') || textPd.includes('THUẬN') || textPd.includes('THÀNH CÔNG');
          const isHung = textPd.includes('HUNG') || textPd.includes('BẤT LỢI') || textPd.includes('THẤT BẠI');
          const cls = isCat ? 'verdict-cat' : (isHung ? 'verdict-hung' : 'verdict-binh');
          out += `
            <div class="dh-verdict-box ${cls}">
              <div class="dh-verdict-top">KẾT LUẬN & PHÁN QUYẾT CỐT LÕI</div>
              <div class="dh-verdict-title">${escapeReportHtml(textPd)}</div>
              ${scorePd ? `<div class="dh-verdict-score">Điểm khí số: <strong>${escapeReportHtml(scorePd)}</strong></div>` : ''}
            </div>
          `;
          continue;
        }
      }

      // 2. Trích dẫn / Callout: "> ..."
      if (l.startsWith('>')) {
        const cleanQuote = l.replace(/^>\s*/, '');
        out += `<div class="dh-report-callout">${formatInlineMarkup(cleanQuote)}</div>`;
        continue;
      }

      // 3. Dòng mục con: "   * ..." hoặc "* ..."
      if (rawLine.match(/^\s*[\*]\s+/) || l.startsWith('* ')) {
        const cleanText = l.replace(/^[\*]\s*/, '');
        out += `
          <div class="dh-report-row sub">
            <span class="dh-row-bullet sub">▸</span>
            <div class="dh-row-content">${formatInlineMarkup(cleanText)}</div>
          </div>
        `;
        continue;
      }

      // 4. Tiêu đề mục con được đánh số: "1. Dụng Thần...", "2. Khảo sát..."
      if (l.match(/^\d+\.\s+/)) {
        const numMatch = l.match(/^(\d+)\.\s+(.*)$/);
        out += `
          <div class="dh-report-subhead">
            <span class="dh-subhead-num">${numMatch[1]}</span>
            <span class="dh-subhead-text">${formatInlineMarkup(numMatch[2])}</span>
          </div>
        `;
        continue;
      }

      // 5. Dòng danh sách chính: "- ..." hoặc "• ..."
      if (l.startsWith('- ') || l.startsWith('• ')) {
        const cleanText = l.replace(/^[-•]\s*/, '');
        out += `
          <div class="dh-report-row">
            <span class="dh-row-bullet">•</span>
            <div class="dh-row-content">${formatInlineMarkup(cleanText)}</div>
          </div>
        `;
        continue;
      }

      // 6. Đoạn văn xuôi thông thường
      out += `<p class="dh-report-para">${formatInlineMarkup(l)}</p>`;
    }
    return out;
  }

  // Định dạng chữ in đậm, in nghiêng, các badge nhãn và mũi tên
  function formatInlineMarkup(str) {
    if (!str) return '';
    let s = str;
    const boldMatches = s.match(/\*\*/g);
    if (boldMatches && boldMatches.length % 2 !== 0) {
      s += '**';
    }
    const starMatches = s.replace(/\*\*/g, '').match(/\*/g);
    if (starMatches && starMatches.length % 2 !== 0) {
      s += '*';
    }
    s = escapeReportHtml(s);

    // Chữ in đậm **text**
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Chữ in nghiêng *text*
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Thẻ nhãn định lượng [...]
    s = s.replace(/\[([^\]]+)\]/g, (m, p1) => {
      const up = p1.toUpperCase();
      if (up.includes('CÁT') || up.includes('VƯỢNG') || up.includes('SINH') || up.includes('TIẾN') || up.includes('ĐẮC LỰC')) {
        return `<span class="dh-badge-pill pill-cat">[${p1}]</span>`;
      }
      if (up.includes('HUNG') || up.includes('BẤT LỢI') || up.includes('KHẮC') || up.includes('THOÁI') || up.includes('PHÁ') || up.includes('CẢNH BÁO')) {
        return `<span class="dh-badge-pill pill-hung">[${p1}]</span>`;
      }
      if (up.includes('KHÔNG VONG') || up.includes('MỘ') || up.includes('TUYỆT') || up.includes('GIẰNG CO') || up.includes('ẨN PHỤC')) {
        return `<span class="dh-badge-pill pill-warn">[${p1}]</span>`;
      }
      return `<span class="dh-badge-pill pill-neutral">[${p1}]</span>`;
    });

    // Mũi tên chuyển hóa
    s = s.replace(/(?:-&gt;|&gt;|&rarr;|➔|->)/g, '<span class="dh-arrow">➔</span>');

    return s;
  }

  function escapeReportHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
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
  // 5. CÁC HÀM TÍNH TOÁN & XỬ LÝ SỰ KIỆN
  // =========================================================================
  function chayLapQueLucHao() {
    const eng = global.NetaDichHocEngine;
    if (!eng || !eng.LucHaoEngine) return;
    const cal = getCalendarInfo(state.selectedDate);
    state.lucHao.result = eng.LucHaoEngine.lapQue(state.lucHao.coins, cal);

    // Tính toán chuyên sâu Luc Hao 2.0 Pipeline (Graph Diffusion, Multi-Objective Utility, Harmonic Timing, 6 Lenses)
    if (global.NetaLucHao2Engine && typeof global.NetaLucHao2Engine.executeFromCoins === 'function') {
      const canChi = cal.canChi || {};
      const dayCan = canChi.dayGan || (canChi.day ? canChi.day.split(' ')[0] : 'Giáp');
      const dayChi = canChi.dayZhi || (canChi.day ? canChi.day.split(' ')[1] : 'Tý');
      const monthChi = canChi.monthZhi || (canChi.month ? canChi.month.split(' ')[1] : 'Dần');
      const question = state.purpose || (global.NetaLucHao2Engine.TOPIC_PRESETS?.find(t => t.key === state.selectedTopic)?.label || "Chiêm đoán cát hung sự vụ");

      const pipelineResult = global.NetaLucHao2Engine.executeFromCoins(
        state.lucHao.coins,
        dayCan,
        dayChi,
        monthChi,
        question
      );
      state.lucHao2Result = pipelineResult;

      // Sinh báo cáo tiêu chuẩn Offline 100%
      const reportMarkdown = global.NetaLucHao2Engine.formatFullReport(pipelineResult);
      state.interpretation = {
        source: 'deterministic',
        verified: true,
        aiUsed: false,
        reportText: reportMarkdown,
        evaluation: global.NetaLucHao2Engine.evaluate8Steps(state.lucHao.result, state.selectedTopic, state.purpose),
        pipelineResult: pipelineResult
      };
    }
  }

  function chayLapQueMaiHoa() {
    const eng = global.NetaDichHocEngine;
    if (!eng || !eng.MaiHoaEngine) return;
    const cal = getCalendarInfo(state.selectedDate);

    if (state.maiHoa.mode === 'time') {
      const canChi = cal.canChi || {};
      const zhiNames = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
      const namZhi = canChi.yearZhi || 'Ngọ';
      const namIdx = zhiNames.indexOf(namZhi) + 1;
      const thangAm = cal.lunar ? cal.lunar.month : (state.selectedDate.getMonth() + 1);
      const ngayAm = cal.lunar ? cal.lunar.day : state.selectedDate.getDate();
      const gioZhi = canChi.hourZhi || 'Hợi';
      const gioIdx = zhiNames.indexOf(gioZhi) + 1;

      state.maiHoa.result = eng.MaiHoaEngine.lapQueThoiGian(namIdx, thangAm, ngayAm, gioIdx, cal);
    } else {
      state.maiHoa.result = eng.MaiHoaEngine.lapQueTheoHaiSo(state.maiHoa.soA, state.maiHoa.soB, 0, cal);
    }
  }

  // Gieo 1 hào ngẫu nhiên
  function gieoMotHao() {
    if (state.lucHao.isFlipping) return;
    if (state.lucHao.coins.length === 0) {
      resetDichHocAiState();
    }
    if (state.lucHao.coins.length >= 6) {
      if (global.showToast) global.showToast('✅ Đã gieo đủ 6 hào. Bấm "Gieo Lại Từ Đầu" nếu muốn bốc quẻ mới.');
      return;
    }

    state.lucHao.isFlipping = true;
    triggerHaptic(30);
    playCoinAudio('shake');

    const c1 = Math.random() < 0.5 ? 2 : 3;
    const c2 = Math.random() < 0.5 ? 2 : 3;
    const c3 = Math.random() < 0.5 ? 2 : 3;

    state.lucHao.coinStates = [c1, c2, c3];
    state.lucHao.coinAngles = [
      Math.floor(Math.random() * 50) - 25,
      Math.floor(Math.random() * 50) - 25,
      Math.floor(Math.random() * 50) - 25
    ];

    render();

    setTimeout(() => {
      state.lucHao.isFlipping = false;
      const total = c1 + c2 + c3;
      state.lucHao.coins.push(total);
      triggerHaptic(20);
      playCoinAudio('clink');

      if (state.lucHao.coins.length >= 6) {
        chayLapQueLucHao();
        setTimeout(() => playCoinAudio('done'), 180);
      }
      render();
    }, 550);
  }

  // Gieo nhanh 6 hào
  function gieoTuDong6Hao() {
    resetDichHocAiState();
    state.lucHao.coins = [];
    for (let i = 0; i < 6; i++) {
      const c1 = Math.random() < 0.5 ? 2 : 3;
      const c2 = Math.random() < 0.5 ? 2 : 3;
      const c3 = Math.random() < 0.5 ? 2 : 3;
      state.lucHao.coins.push(c1 + c2 + c3);
    }
    state.lucHao.coinStates = [
      Math.random() < 0.5 ? 2 : 3,
      Math.random() < 0.5 ? 2 : 3,
      Math.random() < 0.5 ? 2 : 3
    ];
    chayLapQueLucHao();
    playCoinAudio('done');
    triggerHaptic(40);
    render();
  }

  // Đặt lại Lục Hào
  function resetCastingLucHao() {
    state.lucHao.coins = [];
    state.lucHao.result = null;
    state.interpretation = null;
    resetDichHocAiState();
    state.lucHao.coinStates = [3, 2, 3];
    playCoinAudio('clink');
    render();
  }

  // Gắn sự kiện giao diện
  function bindEvents() {
    // Chuyển Tab Lục Hào
    const tabLucHao = document.getElementById('dh-tab-luchao');
    if (tabLucHao) {
      tabLucHao.onclick = () => {
        if (state.method === 'luchao') return;
        state.method = 'luchao';
        render();
      };
    }

    // Chuyển Tab Mai Hoa (luôn cập nhật quẻ Mai Hoa ngay)
    const tabMaiHoa = document.getElementById('dh-tab-maihoa');
    if (tabMaiHoa) {
      tabMaiHoa.onclick = () => {
        if (state.method === 'maihoa') return;
        state.method = 'maihoa';
        chayLapQueMaiHoa();
        render();
      };
    }

    // Chạm vào Ống Quẻ Thái Cực để gieo
    const interactiveTube = document.getElementById('dh-interactive-tube');
    if (interactiveTube) {
      interactiveTube.onclick = () => gieoMotHao();
    }

    // Nút gieo từng bước Lục Hào
    const btnCastStep = document.getElementById('dh-btn-cast-step');
    if (btnCastStep) {
      btnCastStep.onclick = () => gieoMotHao();
    }

    // Nút gieo nhanh 6 hào
    const btnCastAuto = document.getElementById('dh-btn-cast-auto');
    if (btnCastAuto) {
      btnCastAuto.onclick = () => gieoTuDong6Hao();
    }

    // Nút gieo lại từ đầu Lục Hào
    const btnResetCast = document.getElementById('dh-btn-reset-cast');
    if (btnResetCast) {
      btnResetCast.onclick = () => resetCastingLucHao();
    }

    // Nút chạy Mai Hoa
    const btnRunMaiHoa = document.getElementById('dh-btn-run-maihoa');
    if (btnRunMaiHoa) {
      btnRunMaiHoa.onclick = () => {
        chayLapQueMaiHoa();
        playCoinAudio('done');
        render();
        if (global.showToast) global.showToast('🌸 Đã khởi quẻ Mai Hoa thành công!');
      };
    }

    // Nút làm mới Mai Hoa
    const btnResetMh = document.getElementById('dh-btn-reset-maihoa');
    if (btnResetMh) {
      btnResetMh.onclick = () => {
        state.selectedDate = new Date();
        chayLapQueMaiHoa();
        render();
      };
    }

    // Mai Hoa Mode Tabs
    const btnMhTime = document.getElementById('dh-mh-tab-time');
    if (btnMhTime) {
      btnMhTime.onclick = () => {
        state.maiHoa.mode = 'time';
        chayLapQueMaiHoa();
        render();
      };
    }
    const btnMhNums = document.getElementById('dh-mh-tab-numbers');
    if (btnMhNums) {
      btnMhNums.onclick = () => {
        state.maiHoa.mode = 'numbers';
        render();
      };
    }

    const inpA = document.getElementById('dh-inp-num-a');
    if (inpA) inpA.onchange = (e) => { state.maiHoa.soA = parseInt(e.target.value, 10) || 1; };
    const inpB = document.getElementById('dh-inp-num-b');
    if (inpB) inpB.onchange = (e) => { state.maiHoa.soB = parseInt(e.target.value, 10) || 1; };

    // Input mục đích chiêm quẻ
    const inpPurpose = document.getElementById('dh-purpose-input');
    if (inpPurpose) {
      inpPurpose.oninput = (e) => { 
        state.purpose = e.target.value; 
      };
      inpPurpose.onchange = () => {
        if (state.lucHao.coins.length === 6) {
          chayLapQueLucHao();
          render();
        }
      };
    }

    // Chọn nhanh chủ đề Dụng thần
    document.querySelectorAll('.dh-topic-chip').forEach(btn => {
      btn.onclick = () => {
        const tKey = btn.getAttribute('data-topic-key');
        if (tKey && state.selectedTopic !== tKey) {
          state.selectedTopic = tKey;
          if (state.lucHao.coins.length === 6) {
            chayLapQueLucHao();
          }
          render();
        }
      };
    });

    // Subnav tabs: Dashboard vs Full Report
    const btnDhTabDashboard = document.getElementById('btn-dh-tab-dashboard');
    if (btnDhTabDashboard) {
      btnDhTabDashboard.onclick = () => {
        if (state.analysisSubTab !== 'dashboard') {
          state.analysisSubTab = 'dashboard';
          render();
        }
      };
    }

    const btnDhTabFullReport = document.getElementById('btn-dh-tab-full-report');
    if (btnDhTabFullReport) {
      btnDhTabFullReport.onclick = () => {
        if (state.analysisSubTab !== 'report') {
          state.analysisSubTab = 'report';
          render();
        }
      };
    }

    // Nút Trau Chuốt Văn Phong AI Chuẩn Hóa
    const runAiHandler = async () => {
      if (state.isInterpretingAI) return;
      if (!state.lucHao.result || !global.NetaLucHao2Engine) return;

      const geminiService = global.NetaGeminiService;
      const apiKey = geminiService && typeof geminiService.getActiveKey === 'function' ? geminiService.getActiveKey() : null;
      if (!apiKey) {
        state.analysisSubTab = 'report';
        state.currentReportMode = 'ai';
        state.aiErrorMessage = 'Chưa cài đặt Google Gemini API Key. Bạn có thể cài đặt khóa dùng chung tại mục Cài Đặt hoặc trong Trải Bài Tarot để sử dụng cho toàn bộ ứng dụng.';
        render();
        return;
      }

      state.analysisSubTab = 'report';
      state.currentReportMode = 'ai';
      state.isInterpretingAI = true;
      state.aiErrorMessage = null;
      state.aiLoadingStepText = 'Đang chuẩn bị phân đoạn biên tập học thuật Lục Hào 2.0...';
      render();
      try {
        const onProgress = (currentPart, totalParts, partTitle) => {
          state.aiLoadingStepText = `Đang trau chuốt ${partTitle}...`;
          render();
        };
        const aiRes = await global.NetaLucHao2Engine.interpretHexagram(state.lucHao.result, {
          topicKey: state.selectedTopic,
          customQuestion: state.purpose,
          useAI: true,
          onProgress
        });
        if (aiRes.aiUsed && aiRes.reportText) {
          state.aiPolishedText = aiRes.reportText;
          state.interpretation = aiRes;
        } else if (aiRes.warning) {
          state.aiErrorMessage = aiRes.warning;
        } else {
          state.aiPolishedText = aiRes.reportText;
          state.interpretation = aiRes;
        }
        if (global.showToast) global.showToast('✨ Trau chuốt văn phong hoàn tất!');
      } catch (e) {
        state.aiErrorMessage = e.message || 'Lỗi trau chuốt văn phong AI';
        if (global.showToast) global.showToast('Lỗi: ' + e.message);
      } finally {
        state.isInterpretingAI = false;
        render();
      }
    };

    const btnRunAI = document.getElementById('dh-btn-run-ai');
    if (btnRunAI) btnRunAI.onclick = runAiHandler;
    const btnInlineTriggerAi = document.getElementById('btn-dh-inline-trigger-ai');
    if (btnInlineTriggerAi) btnInlineTriggerAi.onclick = runAiHandler;

    // Toggle chế độ Báo cáo Tiêu Chuẩn vs Trau Chuốt AI (Nhúng mượt mà trong báo cáo)
    const btnModeStandard = document.getElementById('btn-dh-mode-standard');
    const btnBackStandard = document.getElementById('btn-dh-back-standard');
    const btnModeAi = document.getElementById('btn-dh-mode-ai');

    if (btnModeStandard) {
      btnModeStandard.onclick = () => {
        state.currentReportMode = 'standard';
        render();
      };
    }
    if (btnBackStandard) {
      btnBackStandard.onclick = () => {
        state.currentReportMode = 'standard';
        render();
      };
    }
    if (btnModeAi) {
      btnModeAi.onclick = () => {
        state.currentReportMode = 'ai';
        if (!state.aiPolishedText && !state.isInterpretingAI) {
          runAiHandler();
        } else {
          render();
        }
      };
    }

    const btnDhOpenKey = document.getElementById('btn-dh-open-key-modal');
    if (btnDhOpenKey) {
      btnDhOpenKey.onclick = () => {
        if (global.NetaGeminiService && typeof global.NetaGeminiService.openConfigModal === 'function') {
          global.NetaGeminiService.openConfigModal();
        } else if (global.NetaTarotView && typeof global.NetaTarotView.openKeyConfigModal === 'function') {
          global.NetaTarotView.openKeyConfigModal();
        }
      };
    }

    // Xử lý sao chép bài luận giải (Cả thanh toolbar & nút cuối bài)
    const copyHandler = () => {
      const text = (state.currentReportMode === 'ai' && state.aiPolishedText) 
        ? state.aiPolishedText 
        : (state.interpretation && state.interpretation.reportText);
      if (text) {
        navigator.clipboard.writeText(text).then(() => {
          if (global.showToast) global.showToast('📋 Đã sao chép toàn văn bài luận giải vào Clipboard!');
        }).catch(() => {
          if (global.showToast) global.showToast('Không thể sao chép tự động, hãy bôi đen để copy.');
        });
      }
    };
    const btnCopyReport = document.getElementById('dh-btn-copy-report');
    if (btnCopyReport) btnCopyReport.onclick = copyHandler;
    const btnCopyReportBottom = document.getElementById('dh-btn-copy-report-bottom');
    if (btnCopyReportBottom) btnCopyReportBottom.onclick = copyHandler;

    // Xử lý tải xuống file bài luận giải (.MD)
    const downloadHandler = () => {
      const text = (state.currentReportMode === 'ai' && state.aiPolishedText) 
        ? state.aiPolishedText 
        : (state.interpretation && state.interpretation.reportText);
      if (text) {
        try {
          const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'Luan_Giai_Luc_Hao_2.md';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          if (global.showToast) global.showToast('💾 Đã tải bản luận giải Lục Hào 2.0!');
        } catch (err) {
          if (global.showToast) global.showToast('Không thể tải file, hãy bấm Sao Chép.');
        }
      }
    };
    const btnDownloadReport = document.getElementById('dh-btn-download-report');
    if (btnDownloadReport) btnDownloadReport.onclick = downloadHandler;
    const btnDownloadReportBottom = document.getElementById('dh-btn-download-report-bottom');
    if (btnDownloadReportBottom) btnDownloadReportBottom.onclick = downloadHandler;

    // Nút thời gian hiện tại
    const btnNow = document.getElementById('dh-btn-now');
    if (btnNow) {
      btnNow.onclick = () => {
        state.selectedDate = new Date();
        if (state.method === 'luchao' && state.lucHao.coins.length === 6) {
          chayLapQueLucHao();
        } else if (state.method === 'maihoa') {
          chayLapQueMaiHoa();
        }
        render();
        if (global.showToast) global.showToast('🕒 Đã đồng bộ thời gian hiện tại!');
      };
    }

    // Nút chọn ngày giờ khác
    const btnPicker = document.getElementById('dh-btn-picker');
    const hiddenDate = document.getElementById('dh-hidden-datetime');
    if (btnPicker && hiddenDate) {
      btnPicker.onclick = () => {
        if (typeof hiddenDate.showPicker === 'function') {
          hiddenDate.showPicker();
        } else {
          hiddenDate.click();
        }
      };
      hiddenDate.onchange = (e) => {
        if (e.target.value) {
          state.selectedDate = new Date(e.target.value);
          if (state.method === 'luchao' && state.lucHao.coins.length === 6) {
            chayLapQueLucHao();
          } else if (state.method === 'maihoa') {
            chayLapQueMaiHoa();
          }
          render();
          if (global.showToast) global.showToast('📅 Đã cập nhật thời gian chiêm quẻ!');
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
