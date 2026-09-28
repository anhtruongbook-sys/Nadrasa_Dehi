/**
 * NETA LIGHT - LỤC HÀO VIEW CONTROLLER (modules/luchao_view.js)
 * Giao diện Bốc Phệ Kinh Dịch Lục Hào Nạp Giáp (Phương pháp luận Thầy Nguyễn Tuấn Cường V2)
 * 100% Deterministic, Zero-AI, 100% Offline.
 */

(function (global) {
  'use strict';

  function getEngine() {
    return global.LucHaoEngine || (typeof window !== 'undefined' ? window.LucHaoEngine : null);
  }

  // State quản lý toàn bộ giao diện Lục Hào
  const STORAGE_KEY = 'netalight_luchao_journal_v1';

  // State quản lý toàn bộ giao diện Lục Hào
  const state = {
    method: 'hour', // 'hour' (giờ động tâm) | 'coin' (gieo đồng xu) | 'serial' (số seri)
    topicKey: 'tai_van',
    question: '',
    selectedDate: new Date(),
    
    // Gieo đồng xu
    coinsCast: [], // Mảng 6 hào đã gieo (mỗi phần tử: 0..3 mặt ngửa)
    currentCoins: [1, 2, 1], // Trạng thái 3 đồng xu hiển thị (1: sấp, 2: ngửa)
    isShaking: false,

    // Số Seri
    serialNumber: '689999',

    // Kết quả tính toán
    currentResult: null,
    activeTab: 'bang_que', // 'bang_que' | 'quy_trinh_8_buoc' | 'phong_thuy' | 'bao_cao' | 'nhat_ky'

    // Nhật ký & Hậu kiểm
    journalFilter: 'all', // 'all' | 'pending' | 'success' | 'partial' | 'failed'

    // Tra ngày Trạch Cát Đại Cát theo Ứng Kỳ
    auspiciousDaysList: null,
    showAuspiciousBox: false,

    // Án Lệ Thầy Cường (290 Quẻ) & Toàn Thư Bài Giảng
    anLeFilter: 'all', // 'all' | 'khoi_1' | 'khoi_2' | 'khoi_3' | 'khoi_4' | 'khoi_5' | 'khoi_6'
    anLeSearch: '',
    selectedCaseId: null
  };

  // Web Audio API mô phỏng âm thanh kim loại tiền xu va chạm
  function playCoinSound(type = 'clink') {
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
        const bufferSize = ctx.sampleRate * 0.3;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1750;
        filter.Q.value = 3;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
      } else {
        const freqs = [1800, 2600, 3800];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq + (Math.random() * 60 - 30), now);
          gain.gain.setValueAtTime(0.09 / (idx + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.3);
        });
      }
    } catch (e) {}
  }

  // ==========================================
  // SỔ TAY NHẬT KÝ BỐC QUẺ & HẬU KIỂM OFFLINE
  // ==========================================
  function getJournalList() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Lỗi đọc nhật ký Lục Hào:', e);
      return [];
    }
  }

  function saveJournalList(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Lỗi lưu nhật ký Lục Hào:', e);
    }
  }

  function saveCurrentToJournal(userNote = '') {
    if (!state.currentResult) return null;
    const res = state.currentResult;
    const list = getJournalList();
    const entryId = 'lh_' + Date.now();

    const newEntry = {
      id: entryId,
      created_at: new Date().toISOString(),
      question: state.question || 'Chiêm đoán việc cần xem',
      topicKey: state.topicKey,
      topicName: res.thematic_analysis.topic_name,
      method: state.method,
      dateInput: state.selectedDate ? state.selectedDate.toISOString() : new Date().toISOString(),
      gocName: res.goc.name,
      bienName: res.bien ? res.bien.name : '— (Quẻ Tĩnh)',
      dungThan: res.thematic_analysis.dung_than,
      isSuccess: res.thematic_analysis.ket_luan_chung.thanh_bai,
      conclusionShort: res.thematic_analysis.ket_luan_chung.ket_luan_ngan,
      conclusionDetail: res.thematic_analysis.ket_luan_chung.chi_tiet,
      ungKyText: res.thematic_analysis.ung_ky ? res.thematic_analysis.ung_ky.thoi_gian_du_kien : '',
      verificationStatus: 'pending', // 'pending' | 'success' | 'partial' | 'failed'
      verificationNote: userNote || '',
      savedResult: res
    };

    list.unshift(newEntry);
    saveJournalList(list);
    return newEntry;
  }

  function updateVerification(id, status, note) {
    const list = getJournalList();
    const item = list.find(x => x.id === id);
    if (item) {
      item.verificationStatus = status;
      if (note !== undefined) item.verificationNote = note;
      item.updated_at = new Date().toISOString();
      saveJournalList(list);
    }
  }

  function deleteFromJournal(id) {
    let list = getJournalList();
    list = list.filter(x => x.id !== id);
    saveJournalList(list);
  }

  function loadHexagramFromJournal(id) {
    const list = getJournalList();
    const item = list.find(x => x.id === id);
    if (item && item.savedResult) {
      state.currentResult = item.savedResult;
      state.question = item.question;
      state.topicKey = item.topicKey;
      state.selectedDate = new Date(item.dateInput || item.created_at);
      state.method = item.method || 'hour';
      state.activeTab = 'bang_que';
      return true;
    }
    return false;
  }

  function exportJournalJSON() {
    const list = getJournalList();
    const jsonStr = JSON.stringify(list, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neta_light_luc_hao_journal_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJournalJSON(fileContent) {
    try {
      const data = JSON.parse(fileContent);
      if (Array.isArray(data)) {
        const current = getJournalList();
        const existingIds = new Set(current.map(x => x.id));
        let added = 0;
        data.forEach(item => {
          if (item.id && !existingIds.has(item.id)) {
            current.push(item);
            added++;
          }
        });
        current.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        saveJournalList(current);
        return { success: true, count: added };
      }
      return { success: false, message: 'Dữ liệu không đúng định dạng mảng.' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  // ==========================================
  // CẦU NỐI ỨNG KỲ -> TRẠCH CÁT ĐẠI CÁT
  // ==========================================
  const CHI_ORDER_LIST = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  const HOANG_DAO_STARS = ['Thanh Long', 'Minh Đường', 'Kim Quỹ', 'Thiên Đức', 'Ngọc Đường', 'Tư Mệnh'];

  function extractTargetChisFromUngKy(res) {
    const targetChis = new Set();
    if (!res) return [];

    const ungKy = res.thematic_analysis && res.thematic_analysis.ung_ky;
    const ungKyText = ungKy ? `${ungKy.thoi_gian_du_kien} ${ungKy.ly_do}` : '';

    // Tìm các chi xuất hiện trong chuỗi ứng kỳ
    CHI_ORDER_LIST.forEach(chi => {
      if (ungKyText.includes(chi)) {
        targetChis.add(chi);
      }
    });

    // Nếu chưa có, lấy chi của Dụng thần và chi của Hào Thế
    if (targetChis.size === 0) {
      const dtHao = res.goc.haos.find(h => h.luc_than === res.thematic_analysis.dung_than);
      if (dtHao) targetChis.add(dtHao.branch);
      const theHao = res.goc.haos[res.goc.the_hao - 1];
      if (theHao) targetChis.add(theHao.branch);
    }

    return Array.from(targetChis);
  }

  function findAuspiciousDaysForUngKy(res, daysLimit = 60) {
    const targetChis = extractTargetChisFromUngKy(res);
    if (targetChis.length === 0) return [];

    const startDate = new Date(state.selectedDate || new Date());
    const matchedDays = [];

    const engine = getEngine();
    const extractInfo = engine && engine.extractDateInfo ? engine.extractDateInfo : null;

    for (let i = 1; i <= daysLimit; i++) {
      const curDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dInfo = extractInfo ? extractInfo(curDate) : null;
      if (!dInfo) continue;

      const dayChi = dInfo.day_branch;
      if (targetChis.includes(dayChi)) {
        // Ngày này khớp với Địa Chi Ứng Kỳ!
        const dayCanChi = `${dInfo.day_can} ${dInfo.day_branch}`;
        
        // 1. Kiểm tra Hoàng Đạo / Hắc Đạo
        const chiIdx = CHI_ORDER_LIST.indexOf(dayChi);
        const monthChiIdx = CHI_ORDER_LIST.indexOf(dInfo.month_branch);
        const startMap = { 2: 0, 8: 0, 3: 2, 9: 2, 4: 4, 10: 4, 5: 6, 11: 6, 0: 8, 6: 8, 1: 10, 7: 10 };
        const tlStart = startMap[monthChiIdx] || 0;
        const starOffset = (chiIdx - tlStart + 12) % 12;
        const ALL_12_STARS = [
          'Thanh Long', 'Minh Đường', 'Thiên Hình', 'Chu Tước', 'Kim Quỹ', 'Thiên Đức',
          'Bạch Hổ', 'Ngọc Đường', 'Thiên Lao', 'Huyền Vũ', 'Tư Mệnh', 'Câu Trận'
        ];
        const dayStar = ALL_12_STARS[starOffset] || 'Thanh Long';
        const isHoangDao = HOANG_DAO_STARS.includes(dayStar);

        // 2. Tính Thập Nhị Trực
        const trucOffset = (chiIdx - monthChiIdx + 12) % 12;
        const ALL_12_TRUC = ['Kiến', 'Trừ', 'Mãn', 'Bình', 'Định', 'Chấp', 'Phá', 'Nguy', 'Thành', 'Thâu', 'Khai', 'Bế'];
        const dayTruc = ALL_12_TRUC[trucOffset] || 'Định';
        const isGoodTruc = ['Trừ', 'Định', 'Thành', 'Khai', 'Nguy', 'Mãn'].includes(dayTruc);

        // 3. Phân loại Cát / Thứ Cát
        let rating = 'Bình Hòa';
        let ratingClass = 'binh-hoa';
        let score = 5;

        if (isHoangDao && isGoodTruc) {
          rating = 'Đại Cát';
          ratingClass = 'dai-cat';
          score = 9;
        } else if (isHoangDao || isGoodTruc) {
          rating = 'Thứ Cát';
          ratingClass = 'thu-cat';
          score = 7;
        }

        matchedDays.push({
          date: curDate,
          dateStr: `${curDate.getDate().toString().padStart(2, '0')}/${(curDate.getMonth() + 1).toString().padStart(2, '0')}/${curDate.getFullYear()}`,
          daysAway: i,
          dayCanChi: dayCanChi,
          monthChi: dInfo.month_branch,
          dayStar: dayStar,
          isHoangDao: isHoangDao,
          dayTruc: dayTruc,
          isGoodTruc: isGoodTruc,
          rating: rating,
          ratingClass: ratingClass,
          score: score,
          tietKhi: dInfo.tiet_khi
        });
      }
    }

    matchedDays.sort((a, b) => b.score - a.score || a.daysAway - b.daysAway);
    return matchedDays;
  }

  // Khởi tạo và render giao diện chính Lục Hào
  function render(containerId = 'view-luchao') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!state.currentResult) {
      // Tự động lập quẻ ban đầu theo giờ hiện tại
      calculateHexagram();
    }

    container.innerHTML = `
      <div class="luchao-app-wrapper">
        <!-- Control Header & Method Selection -->
        <div class="luchao-control-panel">
          <div class="luchao-header-row">
            <div class="luchao-title-group">
              <span class="luchao-badge-main">BỐC PHỆ NẠP GIÁP</span>
              <h2 class="luchao-main-heading">Kinh Dịch Lục Hào (Thầy Nguyễn Tuấn Cường V2)</h2>
            </div>
            <div class="luchao-method-tabs">
              <button class="luchao-method-btn ${state.method === 'hour' ? 'active' : ''}" data-method="hour">
                ⏰ Giờ Động Tâm
              </button>
              <button class="luchao-method-btn ${state.method === 'coin' ? 'active' : ''}" data-method="coin">
                🪙 Gieo Tiền Xu
              </button>
              <button class="luchao-method-btn ${state.method === 'serial' ? 'active' : ''}" data-method="serial">
                🔢 Số Seri Tiền / ĐT
              </button>
            </div>
          </div>

          <!-- Input Fields Row -->
          <div class="luchao-inputs-row">
            <div class="luchao-input-col" style="flex: 1.2;">
              <label class="luchao-label">15 Chuyên Đề Dự Đoán</label>
              <select id="luchao-topic-select" class="luchao-select">
                ${Object.entries((getEngine() && getEngine().THEMATIC_TOPICS) || {}).map(([key, t]) => `
                  <option value="${key}" ${state.topicKey === key ? 'selected' : ''}>
                    ${t.name} (Dụng: ${t.dung_than})
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="luchao-input-col" style="flex: 2;">
              <label class="luchao-label">Sự Việc Cần Chiêm Đoán (Vấn Đề Động Tâm)</label>
              <input type="text" id="luchao-question-input" class="luchao-input" 
                placeholder="VD: Cầu tài tháng này có đắc lợi không? Hợp tác mở cửa hàng có thuận?" 
                value="${escapeHtml(state.question || '')}">
            </div>

            <div class="luchao-input-col" style="flex: 1.1;">
              <label class="luchao-label">Thời Gian Chiêm Đoán</label>
              <input type="datetime-local" id="luchao-datetime-input" class="luchao-input" 
                value="${formatDateTimeInput(state.selectedDate)}">
            </div>

            <div class="luchao-btn-action-col">
              <button id="luchao-btn-cast" class="luchao-btn-cast-action">
                ⚡ Lập Bàn Quẻ
              </button>
            </div>
          </div>

          <!-- Dynamic Method Area (Coins or Serial) -->
          ${state.method === 'coin' ? renderCoinThrowArea() : ''}
          ${state.method === 'serial' ? renderSerialInputArea() : ''}
        </div>

        <!-- Result Container -->
        ${state.currentResult ? renderResultSection(state.currentResult) : ''}
      </div>
    `;

    bindEvents(container);
  }

  // Format datetime for input[type="datetime-local"]
  function formatDateTimeInput(date) {
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // Escape HTML
  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Render khu vực gieo đồng xu
  function renderCoinThrowArea() {
    const count = state.coinsCast.length;
    const isCompleted = count >= 6;

    return `
      <div class="luchao-coin-stage">
        <div class="luchao-coin-header">
          <span class="luchao-coin-progress">
            Đã gieo: <strong>${count} / 6</strong> Hào 
            ${count > 0 ? `(Lần gần nhất: Hào ${count} - ${getCoinOutcomeName(state.coinsCast[count - 1])})` : ''}
          </span>
          <button id="luchao-btn-coin-reset" class="luchao-btn-small">Làm lại từ Hào 1</button>
        </div>

        <div class="luchao-coin-interactive">
          <div class="luchao-three-coins-box ${state.isShaking ? 'shaking' : ''}">
            ${state.currentCoins.map((side, i) => `
              <div class="luchao-coin ${side === 2 ? 'heads' : 'tails'}">
                <span class="luchao-coin-inner">${side === 2 ? '乾隆<br>通寶' : '🀄<br>Bảo'}</span>
                <span class="luchao-coin-label">${side === 2 ? 'Ngửa (+3)' : 'Sấp (+2)'}</span>
              </div>
            `).join('')}
          </div>

          <div class="luchao-coin-actions">
            <button id="luchao-btn-throw-coin" class="luchao-btn-throw" ${isCompleted ? 'disabled' : ''}>
              🪙 ${isCompleted ? 'Đã Đủ 6 Hào (Bàn Quẻ Đã An)' : `Lắc & Gieo Hào ${count + 1}`}
            </button>
          </div>
        </div>

        <!-- History 6 hào đã gieo -->
        <div class="luchao-coin-history-line">
          ${[1, 2, 3, 4, 5, 6].map((haoIdx) => {
            const cast = state.coinsCast[haoIdx - 1];
            if (cast === undefined) {
              return `<span class="luchao-history-slot empty">H${haoIdx}: Chưa gieo</span>`;
            }
            const info = getCoinOutcomeInfo(cast);
            return `
              <span class="luchao-history-slot filled ${info.isDong ? 'dong' : ''}">
                H${haoIdx}: ${info.label} (${cast} ngửa) ${info.isDong ? '⚡' : ''}
              </span>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function getCoinOutcomeName(heads) {
    if (heads === 0) return 'Lão Âm (Âm Động ⚡)';
    if (heads === 1) return 'Thiếu Dương (Dương Tĩnh)';
    if (heads === 2) return 'Thiếu Âm (Âm Tĩnh)';
    if (heads === 3) return 'Lão Dương (Dương Động ⚡)';
    return '';
  }

  function getCoinOutcomeInfo(heads) {
    if (heads === 0) return { label: 'Lão Âm (- - o)', isDong: true, isYang: false };
    if (heads === 1) return { label: 'Thiếu Dương (———)', isDong: false, isYang: true };
    if (heads === 2) return { label: 'Thiếu Âm (- -)', isDong: false, isYang: false };
    if (heads === 3) return { label: 'Lão Dương (——— x)', isDong: true, isYang: true };
    return { label: '—', isDong: false, isYang: false };
  }

  // Render khu vực nhập số Seri
  function renderSerialInputArea() {
    return `
      <div class="luchao-serial-stage">
        <div class="luchao-serial-group">
          <label class="luchao-label">Dãy Số Seri (Tiền giấy, CMND/CCCD, Biển số xe, SĐT)</label>
          <div class="luchao-serial-input-wrapper">
            <input type="text" id="luchao-serial-number" class="luchao-input-serial" 
              placeholder="VD: 689999 hoặc 0988888888" value="${escapeHtml(state.serialNumber)}">
            <span class="luchao-serial-hint">Tự động chia nửa chuỗi: Nửa đầu Thượng Quái, Nửa sau Hạ Quái, Tổng mod 6 Hào Động.</span>
          </div>
        </div>
      </div>
    `;
  }

  // Lập quẻ và tính toán
  function calculateHexagram() {
    try {
      const engine = getEngine();
      if (!engine) return;
      let res = null;
      if (state.method === 'hour') {
        res = engine.castByDongTamHour(state.selectedDate, state.topicKey, state.question);
      } else if (state.method === 'coin') {
        if (state.coinsCast.length === 6) {
          res = engine.castByCoins(state.coinsCast, state.selectedDate, state.topicKey, state.question);
        } else {
          // Tạo ngẫu nhiên nếu chưa gieo đủ
          const randomCoins = Array.from({ length: 6 }, () => Math.floor(Math.random() * 4));
          state.coinsCast = randomCoins;
          res = engine.castByCoins(randomCoins, state.selectedDate, state.topicKey, state.question);
        }
      } else if (state.method === 'serial') {
        res = engine.castBySerial(state.serialNumber || '6888', state.selectedDate, state.topicKey, state.question);
      }
      state.currentResult = res;
    } catch (e) {
      console.error('Lỗi tính quẻ Lục Hào:', e);
    }
  }

  // Render phần kết quả toàn diện
  function renderResultSection(res) {
    const dateInfo = res.date_info;
    const g = res.goc;
    const b = res.bien;
    const analysis = res.thematic_analysis;
    const fengshui = res.fengshui;
    const eightSteps = analysis.eight_steps;

    return `
      <div class="luchao-result-section">
        <!-- Thông Tin Nhật Nguyệt Thần Sát Bar -->
        <div class="luchao-datetime-summary-bar">
          <div class="luchao-summary-item">
            <span class="luchao-item-title">TIẾT KHÍ &amp; THÁNG:</span>
            <span class="luchao-item-val highlight">${dateInfo.tiet_khi} (${dateInfo.month_branch} Nguyệt Kiến)</span>
          </div>
          <div class="luchao-summary-item">
            <span class="luchao-item-title">NHẬT THẦN:</span>
            <span class="luchao-item-val highlight">${dateInfo.day_can} ${dateInfo.day_branch}</span>
          </div>
          <div class="luchao-summary-item">
            <span class="luchao-item-title">TUẦN KHÔNG:</span>
            <span class="luchao-item-val alert">${dateInfo.tuan_khong.join(', ')}</span>
          </div>
          <div class="luchao-summary-item">
            <span class="luchao-item-title">THẦN SÁT NGÀY:</span>
            <span class="luchao-item-val">
              Lộc: <strong>${dateInfo.than_sat.loc}</strong> | 
              Mã: <strong>${dateInfo.than_sat.dich_ma}</strong> | 
              Quý: <strong>${dateInfo.than_sat.quy_nhan.join('/')}</strong> | 
              Đào Hoa: <strong>${dateInfo.than_sat.dao_hoa}</strong>
            </span>
          </div>
        </div>

        <!-- Result Navigation Tabs -->
        <div class="luchao-result-subtabs">
          <button class="luchao-subtab-btn ${state.activeTab === 'bang_que' ? 'active' : ''}" data-subtab="bang_que">
            📊 Bàn Quẻ Lục Hào
          </button>
          <button class="luchao-subtab-btn ${state.activeTab === 'quy_trinh_8_buoc' ? 'active' : ''}" data-subtab="quy_trinh_8_buoc">
            🎯 Quy Trình 8 Bước (${analysis.ket_luan_chung.ket_luan_ngan})
          </button>
          <button class="luchao-subtab-btn ${state.activeTab === 'phong_thuy' ? 'active' : ''}" data-subtab="phong_thuy">
            🏡 Khảo Sát Phong Thủy 6 Hào
          </button>
          <button class="luchao-subtab-btn ${state.activeTab === 'bao_cao' ? 'active' : ''}" data-subtab="bao_cao">
            📜 Báo Cáo Luận Giải Toàn Văn
          </button>
          <button class="luchao-subtab-btn ${state.activeTab === 'nhat_ky' ? 'active' : ''}" data-subtab="nhat_ky">
            📖 Nhật Ký &amp; Hậu Kiểm (${getJournalList().length})
          </button>
          <button class="luchao-subtab-btn ${state.activeTab === 'an_le_ntc' ? 'active' : ''}" data-subtab="an_le_ntc">
            📚 Án Lệ Thầy Cường (290 Quẻ)
          </button>
        </div>

        <!-- Subtab 1: Bàn Quẻ Lục Hào Trực Quan -->
        ${state.activeTab === 'bang_que' ? renderTabBangQue(res) : ''}

        <!-- Subtab 2: Quy trình 8 bước nhị phân -->
        ${state.activeTab === 'quy_trinh_8_buoc' ? renderTab8Steps(res) : ''}

        <!-- Subtab 3: Khảo sát phong thủy gia trạch -->
        ${state.activeTab === 'phong_thuy' ? renderTabPhongThuy(res) : ''}

        <!-- Subtab 4: Báo cáo văn bản tự nhiên -->
        ${state.activeTab === 'bao_cao' ? renderTabBaoCao(res) : ''}

        <!-- Subtab 5: Sổ tay Nhật ký quẻ & Hậu kiểm thực tế -->
        ${state.activeTab === 'nhat_ky' ? renderTabNhatKy() : ''}

        <!-- Subtab 6: Thư viện 290 án lệ & Toàn thư bài giảng NTC -->
        ${state.activeTab === 'an_le_ntc' ? renderTabAnLe(res) : ''}
      </div>
    `;
  }

  // Render Subtab 1: Bàn Quẻ Lục Hào
  function renderTabBangQue(res) {
    const g = res.goc;
    const b = res.bien;
    const dateInfo = res.date_info;
    const canLuc = res.can_luc;

    return `
      <div class="luchao-bangque-container">
        <!-- Quẻ Overview Banner -->
        <div class="luchao-que-banner">
          <div class="luchao-que-col-info left">
            <span class="luchao-que-type">QUẺ GỐC (BỔN QUÁI)</span>
            <h3 class="luchao-que-name">${g.name}</h3>
            <span class="luchao-que-cung">${g.cung} Cung • Thuộc ${g.cung_element}</span>
            <div class="luchao-que-badges">
              ${g.is_luc_hop ? '<span class="luchao-badge hop">Lục Hợp Quái</span>' : ''}
              ${g.is_luc_xung ? '<span class="luchao-badge xung">Lục Xung Quái</span>' : ''}
              ${g.is_du_hon ? '<span class="luchao-badge duhon">Du Hồn</span>' : ''}
              ${g.is_quy_hon ? '<span class="luchao-badge quyhon">Quy Hồn</span>' : ''}
              ${g.is_thuan ? '<span class="luchao-badge batthuan">Bát Thuần</span>' : ''}
            </div>
          </div>

          <div class="luchao-que-col-info middle">
            <div class="luchao-action-divider">
              <span class="luchao-dong-count">${res.has_dong ? `Có ${res.dong_indices.length} Hào Động (Hào ${res.dong_indices.join(', ')})` : 'Quẻ Tĩnh (Không có hào động)'}</span>
              <span class="luchao-arrow-transform">➔</span>
            </div>
          </div>

          <div class="luchao-que-col-info right">
            <span class="luchao-que-type">QUẺ BIẾN (BIẾN QUÁI)</span>
            <h3 class="luchao-que-name">${b ? b.name : '— (Quẻ Tĩnh)'}</h3>
            <span class="luchao-que-cung">${b ? `${b.cung} Cung • Thuộc ${b.cung_element}` : 'Không biến đổi'}</span>
            <div class="luchao-que-badges">
              ${b && b.is_luc_hop ? '<span class="luchao-badge hop">Lục Hợp Quái</span>' : ''}
              ${b && b.is_luc_xung ? '<span class="luchao-badge xung">Lục Xung Quái</span>' : ''}
            </div>
          </div>
        </div>

        <!-- Bảng 6 Hào Đối Chiếu Song Song -->
        <div class="luchao-table-hint">👈 Vuốt ngang để xem đủ 6 hào quẻ gốc &amp; quẻ biến 👉</div>
        <div class="luchao-table-wrapper">
          <table class="luchao-table">
            <thead>
              <tr>
                <th style="width: 10%;">Lục Thú</th>
                <th style="width: 12%;">Phục Thần</th>
                <th style="width: 38%;" colspan="3">Quẻ Gốc: ${g.name}</th>
                <th style="width: 8%;">Thế / Ứng</th>
                <th style="width: 32%;" colspan="2">Quẻ Biến: ${b ? b.name : 'Tĩnh'}</th>
              </tr>
            </thead>
            <tbody>
              ${[6, 5, 4, 3, 2, 1].map((haoIdx) => {
                const hg = g.haos[haoIdx - 1];
                const hb = b ? b.haos[haoIdx - 1] : null;
                const thu = res.luc_thu[haoIdx - 1];
                const phuc = g.phuc_than ? g.phuc_than[haoIdx - 1] : null;
                const isThe = g.the_hao === haoIdx;
                const isUng = g.ung_hao === haoIdx;
                const isDong = hg.is_dong;
                const cl = canLuc ? canLuc[haoIdx - 1] : null;

                return `
                  <tr class="luchao-tr ${isDong ? 'row-dong' : ''} ${isThe ? 'row-the' : ''}">
                    <!-- Lục Thú -->
                    <td class="td-luc-thu">
                      <span class="luchao-thu-badge">${thu}</span>
                    </td>

                    <!-- Phục Thần -->
                    <td class="td-phuc-than">
                      ${phuc && phuc.luc_than ? `
                        <div class="phuc-than-pill">
                          <span class="pt-than">${phuc.luc_than}</span>
                          <span class="pt-chi">${phuc.branch} (${phuc.element})</span>
                        </div>
                      ` : '<span class="text-muted">—</span>'}
                    </td>

                    <!-- Hào Quẻ Gốc: Lục Thân + Chi Can + Vạch Hào -->
                    <td class="td-luc-than-goc">
                      <strong>${hg.luc_than}</strong>
                    </td>
                    <td class="td-branch-goc">
                      <span>${hg.stem || ''}${hg.branch} (${hg.element})</span>
                      ${hg.is_tuan_khong ? '<span class="badge-tk" title="Hào Lạc Tuần Không">Không</span>' : ''}
                      ${cl && cl.is_am_dong ? '<span class="badge-ad" title="Ám Động">Ám</span>' : ''}
                      ${cl && cl.is_nhat_pha ? '<span class="badge-np" title="Nhật Phá">Phá</span>' : ''}
                    </td>
                    <td class="td-vach-goc">
                      <div class="vach-hao-wrapper">
                        ${renderVachHao(hg.is_yang, isDong)}
                      </div>
                    </td>

                    <!-- Thế / Ứng -->
                    <td class="td-the-ung">
                      ${isThe ? '<span class="badge-the">THẾ</span>' : ''}
                      ${isUng ? '<span class="badge-ung">ỨNG</span>' : ''}
                    </td>

                    <!-- Vạch Hào Quẻ Biến -->
                    <td class="td-vach-bien">
                      <div class="vach-hao-wrapper">
                        ${hb ? renderVachHao(hb.is_yang, false) : '<span class="text-muted">—</span>'}
                      </div>
                    </td>

                    <!-- Hào Quẻ Biến: Chi Can + Lục Thân -->
                    <td class="td-branch-bien">
                      ${hb ? `
                        <div class="bien-info-group">
                          <strong>${hb.luc_than}</strong>
                          <span>${hb.stem || ''}${hb.branch} (${hb.element})</span>
                          ${isDong ? `<span class="badge-sinh-khac ${getSinhKhacClass(hg.element, hb.element)}">${getSinhKhacText(hg.element, hb.element)}</span>` : ''}
                        </div>
                      ` : '<span class="text-muted">—</span>'}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Chú Thích & Điểm Cân Lực 6 Hào -->
        <div class="luchao-canluc-box">
          <h4 class="luchao-box-title">⚡ Điểm Cân Lực 6 Hào &amp; Trạng Thái Vượng Suy</h4>
          <div class="luchao-canluc-grid">
            ${canLuc.map((cl, i) => `
              <div class="luchao-canluc-card ${cl.diem_tong_hop >= 2.5 ? 'vuong' : cl.diem_tong_hop <= -2.5 ? 'suy' : 'binh'}">
                <div class="cl-top">
                  <span class="cl-hao">Hào ${cl.hao_index} (${cl.luc_than})</span>
                  <span class="cl-score">${cl.diem_tong_hop > 0 ? '+' : ''}${cl.diem_tong_hop.toFixed(1)}</span>
                </div>
                <div class="cl-body">
                  <span class="cl-branch">${cl.branch} (${cl.element})</span>
                  <span class="cl-status">${cl.trang_thai_vuong_suy}</span>
                </div>
                <div class="cl-details">
                  <span>Nguyệt: ${cl.quan_he_nguyet}</span>
                  <span>Nhật: ${cl.quan_he_nhat}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // Render thanh vạch hào (Dương liền, Âm đứt)
  function renderVachHao(isYang, isDong) {
    if (isYang) {
      return `
        <div class="vach-yang ${isDong ? 'dong' : ''}">
          <span class="vach-solid"></span>
          ${isDong ? '<span class="dong-mark">✕</span>' : ''}
        </div>
      `;
    } else {
      return `
        <div class="vach-yin ${isDong ? 'dong' : ''}">
          <span class="vach-half"></span>
          <span class="vach-gap"></span>
          <span class="vach-half"></span>
          ${isDong ? '<span class="dong-mark">◯</span>' : ''}
        </div>
      `;
    }
  }

  function getSinhKhacClass(eGoc, eBien) {
    const engine = getEngine();
    if (!engine || !eGoc || !eBien) return '';
    const rel = engine.ELEMENT_RELATIONS;
    if (rel && rel.sinh && rel.sinh[eBien] === eGoc) return 'hoi-dau-sinh';
    if (rel && rel.khac && rel.khac[eBien] === eGoc) return 'hoi-dau-khac';
    return '';
  }

  function getSinhKhacText(eGoc, eBien) {
    const engine = getEngine();
    if (!engine || !eGoc || !eBien) return '';
    const rel = engine.ELEMENT_RELATIONS;
    if (rel && rel.sinh && rel.sinh[eBien] === eGoc) return 'Hồi Đầu Sinh (+ Cát)';
    if (rel && rel.khac && rel.khac[eBien] === eGoc) return 'Hồi Đầu Khắc (- Hung)';
    if (eGoc === eBien) return 'Tỷ Hòa';
    return 'Hóa Biến';
  }

  // Render Subtab 2: Quy trình 8 bước nhị phân
  function renderTab8Steps(res) {
    const analysis = res.thematic_analysis;
    const steps = analysis.eight_steps;
    const ketLuan = analysis.ket_luan_chung;
    const ungKy = analysis.ung_ky;

    const stepTitles = {
      step_1_dinh_tam_dong: 'Bước 1: Xác Định Động Tâm & Phân Định Thể Dụng',
      step_2_tim_dung_than: 'Bước 2: Tìm Kiếm & Định Vị Dụng Thần (Hiện hay Phục)',
      step_3_can_luc_nhat_nguyet: 'Bước 3: Cân Lực Nguyệt Kiến & Nhật Thần Với Dụng Thần',
      step_4_khao_sat_dong_hao: 'Bước 4: Khảo Sát Tác Động Của Các Động Hào',
      step_5_kiem_tra_the_ung: 'Bước 5: Thẩm Tra Tương Tác Hào Thế & Hào Ứng',
      step_6_thanh_bai_nhi_phan: 'Bước 6: Khẳng Định Nhị Phân Thành / Bại (Logic Toán Học)',
      step_7_xac_dinh_ung_ky: 'Bước 7: Định Vị Thời Điểm Ứng Nghiệm (Ứng Kỳ)',
      step_8_bien_phap_hoa_giai: 'Bước 8: Đề Xuất Biện Pháp Tối Ưu Hóa & Ngũ Hành Hóa Giải'
    };

    return `
      <div class="luchao-8steps-container">
        <!-- Banner Kết Luận Nhị Phân -->
        <div class="luchao-verdict-banner ${ketLuan.thanh_bai ? 'thanh' : 'bai'}">
          <div class="verdict-icon">${ketLuan.thanh_bai ? '✅' : '⚠️'}</div>
          <div class="verdict-text-group">
            <span class="verdict-sub">KẾT LUẬN QUY TRÌNH 8 BƯỚC NHỊ PHÂN (${analysis.topic_name})</span>
            <h3 class="verdict-title">${ketLuan.ket_luan_ngan}</h3>
            <p class="verdict-desc">${ketLuan.chi_tiet}</p>
          </div>
        </div>

        <!-- Ứng Kỳ Card -->
        ${ungKy ? `
          <div class="luchao-ungky-card">
            <div class="ungky-header">
              <span class="ungky-badge">⏳ ỨNG KỲ DỰ ĐOÁN</span>
              <strong class="ungky-time">${ungKy.thoi_gian_du_kien}</strong>
            </div>
            <div class="ungky-reason">
              <strong>Cơ sở lý luận:</strong> ${ungKy.ly_do} (Phương pháp: <em>${ungKy.phuong_phap}</em>)
            </div>
            <div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
              <button id="luchao-btn-find-auspicious" class="btn-goto-trachcat" style="padding: 6px 14px; font-size: 0.85rem;">
                📅 Tra Cứu Ngày Đại Cát Theo Ứng Kỳ (60 Ngày Tới)
              </button>
            </div>
            ${state.showAuspiciousBox ? renderAuspiciousDaysBox(state.auspiciousDaysList) : ''}
          </div>
        ` : ''}

        <!-- Accordion 8 Bước -->
        <div class="luchao-steps-list">
          ${Object.entries(steps).map(([stepKey, stepData], idx) => `
            <div class="luchao-step-card ${stepData.status === 'fail' ? 'step-warning' : ''}">
              <div class="step-card-header">
                <span class="step-number">${idx + 1}</span>
                <span class="step-title">${stepTitles[stepKey] || stepKey}</span>
                <span class="step-status-tag ${stepData.status || 'ok'}">${stepData.status === 'fail' ? 'Bất Lợi' : 'Thuận Lợi'}</span>
              </div>
              <div class="step-card-body">
                <div class="step-detail-row">
                  <strong>Nội dung:</strong> <span>${stepData.detail || ''}</span>
                </div>
                ${stepData.score !== undefined ? `
                  <div class="step-detail-row">
                    <strong>Điểm cân lực:</strong> <span class="score-badge">${stepData.score > 0 ? '+' : ''}${stepData.score}</span>
                  </div>
                ` : ''}
                ${stepData.hoa_giai ? `
                  <div class="step-detail-row hoa-giai">
                    <strong>Phương án hành động:</strong> <span>${stepData.hoa_giai}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Render Subtab 3: Phong Thủy Gia Trạch 6 Bậc Hào
  function renderTabPhongThuy(res) {
    const fs = res.fengshui;
    if (!fs || !fs.haos) return '<p class="p-4">Không có dữ liệu phong thủy.</p>';

    return `
      <div class="luchao-fengshui-container">
        <div class="luchao-fengshui-intro">
          <span class="fs-badge">KHẢO SÁT GIA TRẠCH</span>
          <h3>Chẩn Đoán Khí Trường &amp; Hình Thế Trạch Bát Quái</h3>
          <p>Phương pháp luận Thầy Nguyễn Tuấn Cường phân định 6 tầng cấu trúc ngôi nhà từ móng đất (Hào 1) đến nóc mái và trời cao (Hào 6), đối chiếu vượng suy của Lục Thân và Lục Thú.</p>
        </div>

        <div class="luchao-fengshui-grid">
          ${[6, 5, 4, 3, 2, 1].map((idx) => {
            const h = fs.haos[idx - 1];
            return `
              <div class="luchao-fs-card ${h.is_khuyet_ham ? 'khuyet-ham' : 'an-dinh'}">
                <div class="fs-card-header">
                  <span class="fs-hao-badge">HÀO ${h.hao_index}</span>
                  <span class="fs-position">${h.vi_tri_khong_gian}</span>
                  <span class="fs-status-pill ${h.is_khuyet_ham ? 'alert' : 'safe'}">
                    ${h.is_khuyet_ham ? '⚠️ Có Khuyết Hãm' : '✅ Bình Hòa / An Định'}
                  </span>
                </div>
                <div class="fs-card-body">
                  <div class="fs-row">
                    <strong>Vật thể tương ứng:</strong> <span>${h.vat_the_tuong_ung}</span>
                  </div>
                  <div class="fs-row">
                    <strong>Lục Thú ngự:</strong> <span class="fs-thu-tag">${h.luc_thu}</span> 
                    &bull; <strong>Lục Thân:</strong> <span>${h.luc_than} (${h.element})</span>
                  </div>
                  <div class="fs-row desc">
                    <strong>Hiện trạng năng lượng:</strong> <span>${h.y_nghia_hien_trang}</span>
                  </div>
                  ${h.is_khuyet_ham ? `
                    <div class="fs-row hoa-giai-box">
                      <strong>Hóa giải ngũ hành:</strong> <span>${h.bien_phap_hoa_giai}</span>
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Render Subtab 4: Báo cáo luận giải tự nhiên toàn văn
  function renderTabBaoCao(res) {
    const engine = getEngine();
    const reportText = (engine && engine.RuleBasedReportGenerator)
      ? engine.RuleBasedReportGenerator.generateFullReport(res)
      : 'Đang tải báo cáo...';

    return `
      <div class="luchao-baocao-container">
        <div class="luchao-baocao-toolbar">
          <button id="luchao-btn-copy-report" class="luchao-btn-action">
            📋 Sao Chép Báo Cáo
          </button>
          <span class="luchao-baocao-hint">Báo cáo chuẩn học thuật, tự nhiên, 100% Zero-AI logic.</span>
        </div>

        <div class="luchao-baocao-paper">
          <pre id="luchao-report-text-pre" class="luchao-report-text">${escapeHtml(reportText)}</pre>
        </div>
      </div>
    `;
  }

  // Render Khối Bảng Ngày Cát Tường Theo Ứng Kỳ
  function renderAuspiciousDaysBox(days) {
    if (!days || days.length === 0) {
      return `
        <div class="luchao-auspicious-results-box">
          <div class="auspicious-header-row">
            <span class="auspicious-title">📅 Danh Sách Ngày Cát Tường Theo Ứng Kỳ</span>
            <button id="luchao-btn-close-auspicious" class="auspicious-close-btn">&times;</button>
          </div>
          <p style="margin: 0; font-size: 0.85rem; color: #94a3b8;">Không tìm thấy ngày phù hợp hoặc dữ liệu can chi chưa sẵn sàng.</p>
        </div>
      `;
    }

    return `
      <div class="luchao-auspicious-results-box">
        <div class="auspicious-header-row">
          <span class="auspicious-title">✨ Tìm Thấy ${days.length} Ngày Đại Cát Theo Ứng Kỳ (60 Ngày Tới)</span>
          <button id="luchao-btn-close-auspicious" class="auspicious-close-btn" title="Đóng bảng">&times;</button>
        </div>
        <div style="overflow-x: auto;">
          <table class="auspicious-table">
            <thead>
              <tr>
                <th>Dương Lịch</th>
                <th>Can Chi Ngày</th>
                <th>Trực (12 Trực)</th>
                <th>Hoàng / Hắc Đạo</th>
                <th>Đánh Giá Cát Hung</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              ${days.slice(0, 10).map((d) => `
                <tr class="auspicious-tr">
                  <td><strong>${d.dateStr}</strong> <span style="font-size: 0.75rem; color: #94a3b8;">(+${d.daysAway} ngày)</span></td>
                  <td><span class="highlight" style="font-weight: 700; color: #fbbf24;">${d.dayCanChi}</span> (${d.tietKhi})</td>
                  <td>${d.dayTruc} ${d.isGoodTruc ? '⭐' : ''}</td>
                  <td><span style="color: ${d.isHoangDao ? '#fbbf24' : '#94a3b8'};">${d.dayStar} (${d.isHoangDao ? 'Hoàng Đạo' : 'Hắc Đạo'})</span></td>
                  <td><span class="badge-cat-rating ${d.ratingClass}">${d.rating}</span></td>
                  <td>
                    <button class="btn-goto-trachcat" data-target-date="${d.date.toISOString()}">
                      🧭 Xem Trạch Cát
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // Render Subtab 5: Sổ Tay Nhật Ký Quẻ & Hậu Kiểm Thực Tế
  function renderTabNhatKy() {
    const list = getJournalList();
    const filter = state.journalFilter || 'all';

    const filtered = list.filter(item => {
      if (filter === 'all') return true;
      return item.verificationStatus === filter;
    });

    const totalCount = list.length;
    const successCount = list.filter(x => x.verificationStatus === 'success').length;
    const partialCount = list.filter(x => x.verificationStatus === 'partial').length;
    const pendingCount = list.filter(x => x.verificationStatus === 'pending').length;
    const failedCount = list.filter(x => x.verificationStatus === 'failed').length;
    const verifiedTotal = successCount + partialCount + failedCount;
    const accuracyRate = verifiedTotal > 0 ? Math.round((successCount + partialCount * 0.5) / verifiedTotal * 100) : 0;

    return `
      <div class="luchao-journal-container">
        <!-- Stats Grid -->
        <div class="luchao-journal-stats-grid">
          <div class="journal-stat-card">
            <div class="stat-val">${totalCount}</div>
            <div class="stat-label">Tổng Quẻ Đã Lưu</div>
          </div>
          <div class="journal-stat-card">
            <div class="stat-val success">${successCount}</div>
            <div class="stat-label">Ứng Nghiệm Chuẩn</div>
          </div>
          <div class="journal-stat-card">
            <div class="stat-val pending">${pendingCount}</div>
            <div class="stat-label">Đang Chờ Ứng Kỳ</div>
          </div>
          <div class="journal-stat-card">
            <div class="stat-val rate">${accuracyRate}%</div>
            <div class="stat-label">Tỷ Lệ Chuẩn Xác</div>
          </div>
        </div>

        <!-- Toolbar: Bộ lọc & Nút Xuất/Nhập -->
        <div class="luchao-journal-toolbar">
          <div class="journal-filter-group">
            <span style="font-size: 0.85rem; color: #94a3b8;">Lọc theo trạng thái:</span>
            <select id="luchao-journal-filter-select" class="journal-filter-select">
              <option value="all" ${filter === 'all' ? 'selected' : ''}>Tất cả (${totalCount})</option>
              <option value="pending" ${filter === 'pending' ? 'selected' : ''}>Chờ ứng kỳ (${pendingCount})</option>
              <option value="success" ${filter === 'success' ? 'selected' : ''}>Ứng nghiệm chuẩn (${successCount})</option>
              <option value="partial" ${filter === 'partial' ? 'selected' : ''}>Ứng nghiệm một phần (${partialCount})</option>
              <option value="failed" ${filter === 'failed' ? 'selected' : ''}>Chưa ứng nghiệm (${failedCount})</option>
            </select>
          </div>

          <div class="journal-actions-group">
            <button id="luchao-btn-save-current" class="btn-secondary" title="Lưu quẻ đang xem vào nhật ký">
              💾 Lưu Quẻ Này
            </button>
            <button id="luchao-btn-export-journal" class="btn-secondary" title="Tải về tệp JSON">
              📥 Xuất Sao Lưu
            </button>
            <button id="luchao-btn-import-journal-trigger" class="btn-secondary" title="Nhập dữ liệu từ tệp JSON">
              📤 Phục Hồi
            </button>
            <input type="file" id="luchao-input-journal-file" accept=".json" style="display: none;" />
          </div>
        </div>

        <!-- Danh sách thẻ quẻ -->
        ${filtered.length === 0 ? `
          <div class="journal-empty-state">
            <span class="journal-empty-icon">📭</span>
            <h4>Chưa có quẻ nào trong mục này</h4>
            <p>Hãy lập quẻ và nhấn "Lưu Quẻ Này" để ghi nhận nhật ký chiêm nghiệm cá nhân.</p>
          </div>
        ` : `
          <div class="luchao-journal-list">
            ${filtered.map(item => `
              <div class="luchao-journal-card" data-journal-id="${item.id}">
                <div class="journal-card-top">
                  <div>
                    <h4 class="journal-card-title">${escapeHtml(item.question)}</h4>
                    <div class="journal-meta-row">
                      <span>🏷️ ${escapeHtml(item.topicName)} (Dụng: <strong>${item.dungThan}</strong>)</span>
                      <span>⏰ ${new Date(item.dateInput || item.created_at).toLocaleString('vi-VN')}</span>
                      <span>🔄 Phương thức: ${item.method === 'coin' ? 'Gieo xu' : item.method === 'serial' ? 'Số seri' : 'Giờ động tâm'}</span>
                    </div>
                  </div>
                  <div style="display: flex; gap: 6px; align-items: center;">
                    <span class="journal-badge-verdict ${item.isSuccess ? 'thanh' : 'bai'}">
                      ${item.conclusionShort}
                    </span>
                    <span class="badge-verification ${item.verificationStatus}">
                      ${item.verificationStatus === 'success' ? '✅ Chuẩn Xác' : item.verificationStatus === 'partial' ? '⚠️ Một Phần' : item.verificationStatus === 'failed' ? '❌ Chưa Ứng' : '⏳ Đang Chờ'}
                    </span>
                  </div>
                </div>

                <div class="journal-card-body">
                  <div style="margin-bottom: 6px;">
                    <strong>Quẻ:</strong> <span class="highlight" style="font-weight: 700; color: #fbbf24;">${item.gocName}</span> ➔ <span style="font-weight: 700;">${item.bienName}</span>
                  </div>
                  <div style="margin-bottom: 6px;">
                    <strong>Ứng Kỳ Dự Báo:</strong> <span>${escapeHtml(item.ungKyText || 'Đang cập nhật')}</span>
                  </div>
                  <div>
                    <strong>Phán đoán:</strong> <span>${escapeHtml(item.conclusionDetail || '')}</span>
                  </div>
                </div>

                <!-- Form cập nhật Hậu kiểm -->
                <div class="journal-verification-box">
                  <strong style="font-size: 0.82rem; color: #fbbf24;">📝 Ghi Nhận Kiểm Chứng Thực Tế (Hậu Kiểm):</strong>
                  <div class="journal-verify-form">
                    <div class="verify-input-row">
                      <select class="verify-select" data-id="${item.id}">
                        <option value="pending" ${item.verificationStatus === 'pending' ? 'selected' : ''}>⏳ Đang Chờ Ứng Kỳ</option>
                        <option value="success" ${item.verificationStatus === 'success' ? 'selected' : ''}>✅ Ứng Nghiệm Chuẩn Xác</option>
                        <option value="partial" ${item.verificationStatus === 'partial' ? 'selected' : ''}>⚠️ Ứng Nghiệm Một Phần</option>
                        <option value="failed" ${item.verificationStatus === 'failed' ? 'selected' : ''}>❌ Không Ứng Nghiệm</option>
                      </select>
                      <input type="text" class="verify-text-input" data-id="${item.id}" placeholder="Ghi chú kết quả thực tế diễn ra..." value="${escapeHtml(item.verificationNote || '')}" />
                      <button class="btn-save-verify" data-id="${item.id}">Lưu</button>
                    </div>
                  </div>
                </div>

                <!-- Hành động thẻ -->
                <div class="journal-card-actions">
                  <button class="btn-journal-load" data-id="${item.id}">
                    👁️ Tải lại Bàn Quẻ
                  </button>
                  <button class="btn-journal-delete" data-id="${item.id}">
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  // ==========================================
  // THƯ VIỆN 290 ÁN LỆ & TOÀN THƯ BÀI GIẢNG NTC
  // ==========================================
  function getAllCaseStudies() {
    if (typeof window !== 'undefined' && window.LUC_HAO_CASE_STUDIES) {
      return window.LUC_HAO_CASE_STUDIES;
    }
    if (typeof global !== 'undefined' && global.LUC_HAO_CASE_STUDIES) {
      return global.LUC_HAO_CASE_STUDIES;
    }
    return [];
  }

  function getAllLessons() {
    if (typeof window !== 'undefined' && window.LUC_HAO_LESSONS_CATALOG) {
      return window.LUC_HAO_LESSONS_CATALOG;
    }
    if (typeof global !== 'undefined' && global.LUC_HAO_LESSONS_CATALOG) {
      return global.LUC_HAO_LESSONS_CATALOG;
    }
    return [];
  }

  function getMatchingCasesForCurrentHexagram(res) {
    if (!res || !res.goc) return [];
    const allCases = getAllCaseStudies();
    const gocName = res.goc.name;
    const bienName = res.bien ? res.bien.name : '';

    return allCases.filter((c) => {
      if (!c.hexagrams || c.hexagrams.length === 0) return false;
      return c.hexagrams.includes(gocName) || (bienName && c.hexagrams.includes(bienName));
    });
  }

  function renderTabAnLe(res) {
    const allCases = getAllCaseStudies();
    const matchingCases = getMatchingCasesForCurrentHexagram(res);

    // Lọc theo Khối bài học
    let filteredCases = allCases;
    if (state.anLeFilter !== 'all') {
      const blockIdMap = {
        'khoi_1': 1,
        'khoi_2': 2,
        'khoi_3': 3,
        'khoi_4': 4,
        'khoi_5': 5,
        'khoi_6': 6
      };
      const targetBlockId = blockIdMap[state.anLeFilter];
      filteredCases = filteredCases.filter((c) => {
        if (targetBlockId === 1) return c.lesson_id <= 5;
        if (targetBlockId === 2) return c.lesson_id >= 6 && c.lesson_id <= 14;
        if (targetBlockId === 3) return c.lesson_id >= 15 && c.lesson_id <= 42;
        if (targetBlockId === 4) return c.lesson_id >= 43 && c.lesson_id <= 49;
        if (targetBlockId === 5) return c.lesson_id >= 50 && c.lesson_id <= 67;
        if (targetBlockId === 6) return c.lesson_id >= 68 && c.lesson_id <= 71;
        return true;
      });
    }

    // Lọc theo Từ khóa tìm kiếm
    if (state.anLeSearch && state.anLeSearch.trim()) {
      const q = state.anLeSearch.trim().toLowerCase();
      filteredCases = filteredCases.filter((c) => {
        return (c.case_title && c.case_title.toLowerCase().includes(q)) ||
               (c.summary && c.summary.toLowerCase().includes(q)) ||
               (c.lesson_title && c.lesson_title.toLowerCase().includes(q)) ||
               (c.full_text && c.full_text.toLowerCase().includes(q)) ||
               (c.hexagrams && c.hexagrams.some((h) => h.toLowerCase().includes(q)));
      });
    }

    const selectedCase = state.selectedCaseId ? allCases.find((c) => c.id === state.selectedCaseId) : null;

    return `
      <div class="luchao-anle-container">
        <!-- Án Lệ Trực Tiếp Đối Chiếu Với Quẻ Đang Chiêm -->
        ${matchingCases.length > 0 ? `
          <div class="anle-matching-box">
            <div class="anle-matching-title">
              <span>🎯 Án Lệ Của Thầy Cường Cùng Quẻ Hiện Tại [${res.goc.name}${res.bien ? ' biến ' + res.bien.name : ''}] (${matchingCases.length} án lệ):</span>
            </div>
            <div class="anle-matching-list">
              ${matchingCases.map((mc) => `
                <div class="anle-matching-item" data-case-id="${mc.id}">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span class="anle-lesson-badge">${mc.lesson_title.split(':')[0]}</span>
                    <span class="anle-block-tag">${mc.block_name}</span>
                  </div>
                  <div style="font-weight: 700; color: #facc15; font-size: 0.9rem; margin-bottom: 4px;">
                    ${escapeHtml(mc.case_title)}
                  </div>
                  <div style="font-size: 0.82rem; color: #cbd5e1; line-height: 1.4;">
                    ${escapeHtml(mc.summary ? mc.summary.slice(0, 180) + '...' : (mc.full_text ? mc.full_text.slice(0, 180) + '...' : ''))}
                  </div>
                  <div style="display: flex; justify-content: flex-end; margin-top: 6px;">
                    <span style="font-size: 0.78rem; color: #38bdf8; font-weight: 600;">Xem chi tiết phân tích của Thầy &rarr;</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : `
          <div class="anle-matching-box" style="border-color: rgba(255,255,255,0.15); background: rgba(15,23,42,0.6);">
            <div class="anle-matching-title" style="color: #94a3b8;">
              <span>ℹ️ Quẻ hiện tại [${res.goc.name}] chưa có án lệ đối chiếu trực tiếp cùng tên trong 290 án lệ trích dẫn. Bạn có thể tra cứu theo chuyên đề bên dưới:</span>
            </div>
          </div>
        `}

        <!-- Toolbar: Tìm Kiếm & Lọc Khối Kiến Thức -->
        <div class="anle-toolbar">
          <div class="anle-search-row">
            <input type="text" id="anle-search-input" class="anle-search-input" 
              placeholder="🔍 Tìm theo tên quẻ, từ khóa (đòi nợ, mua nhà, vong, bệnh tật, xin việc, sảy thai, tình duyên, giếng...)..." 
              value="${escapeHtml(state.anLeSearch || '')}">
          </div>

          <div class="anle-chips-row">
            <button class="anle-chip-btn ${state.anLeFilter === 'all' ? 'active' : ''}" data-filter="all">Tất cả (290 án lệ)</button>
            <button class="anle-chip-btn ${state.anLeFilter === 'khoi_1' ? 'active' : ''}" data-filter="khoi_1">Khối 1: Lập Quẻ (Bài 1-5)</button>
            <button class="anle-chip-btn ${state.anLeFilter === 'khoi_2' ? 'active' : ''}" data-filter="khoi_2">Khối 2: Định Lực (Bài 6-14)</button>
            <button class="anle-chip-btn ${state.anLeFilter === 'khoi_3' ? 'active' : ''}" data-filter="khoi_3">Khối 3: Đời Sống (Bài 15-42)</button>
            <button class="anle-chip-btn ${state.anLeFilter === 'khoi_4' ? 'active' : ''}" data-filter="khoi_4">Khối 4: Tượng Pháp (Bài 43-49)</button>
            <button class="anle-chip-btn ${state.anLeFilter === 'khoi_5' ? 'active' : ''}" data-filter="khoi_5">Khối 5: Phong Thủy (Bài 50-67)</button>
            <button class="anle-chip-btn ${state.anLeFilter === 'khoi_6' ? 'active' : ''}" data-filter="khoi_6">Khối 6: Trạch Cát (Bài 68-71)</button>
          </div>

          <div class="anle-results-stats">
            <span>Hiển thị <strong>${filteredCases.length}</strong> / ${allCases.length} án lệ thực tế</span>
            <span>Trích xuất 100% nguyên văn giáo trình Thầy Nguyễn Tuấn Cường V2</span>
          </div>
        </div>

        <!-- Grid Án Lệ -->
        <div class="anle-grid">
          ${filteredCases.slice(0, 60).map((c) => `
            <div class="anle-card">
              <div class="anle-card-header">
                <span class="anle-lesson-badge">${c.lesson_title.split(':')[0]}</span>
                <span class="anle-block-tag">${c.block_name.split(':')[0]}</span>
              </div>
              <div class="anle-card-title">${escapeHtml(c.case_title)}</div>
              ${c.hexagrams && c.hexagrams.length > 0 ? `
                <div class="anle-hex-tags">
                  ${c.hexagrams.map((h) => `<span class="anle-hex-tag">${escapeHtml(h)}</span>`).join('')}
                </div>
              ` : ''}
              <div class="anle-card-summary">
                ${escapeHtml(c.summary || c.full_text || 'Không có mô tả chi tiết.')}
              </div>
              <div class="anle-card-footer">
                <span style="font-size: 0.75rem; color: #64748b;">Án lệ #${c.id}</span>
                <button class="btn-anle-view" data-case-id="${c.id}">Xem Toàn Văn &rarr;</button>
              </div>
            </div>
          `).join('')}
        </div>

        ${filteredCases.length > 60 ? `
          <div style="text-align: center; padding: 14px; color: #94a3b8; font-size: 0.85rem;">
            (Đang hiển thị 60 án lệ đầu tiên. Nhập từ khóa tìm kiếm cụ thể để tra cứu nhanh hơn trong toàn bộ 290 án lệ)
          </div>
        ` : ''}

        <!-- Modal Xem Toàn Văn Án Lệ Của Thầy Cường -->
        ${selectedCase ? renderAnLeModal(selectedCase) : ''}
      </div>
    `;
  }

  function renderAnLeModal(c) {
    return `
      <div class="anle-modal-overlay" id="anle-modal-overlay">
        <div class="anle-modal-content">
          <div class="anle-modal-header">
            <div>
              <div style="font-size: 0.8rem; color: #38bdf8; font-weight: 700; margin-bottom: 2px;">
                ${escapeHtml(c.lesson_title)} • ${escapeHtml(c.block_name)}
              </div>
              <div class="anle-modal-title">${escapeHtml(c.case_title)}</div>
            </div>
            <button class="anle-modal-close" id="btn-anle-modal-close">&times;</button>
          </div>
          <div class="anle-modal-body">
            <div class="anle-meta-box">
              <div><strong>Số hiệu:</strong> Án lệ #${c.id}</div>
              <div><strong>Bài học:</strong> Bài ${c.lesson_id}</div>
              ${c.hexagrams && c.hexagrams.length > 0 ? `<div><strong>Quẻ liên quan:</strong> ${c.hexagrams.join(', ')}</div>` : ''}
            </div>

            ${c.summary ? `
              <div>
                <h4 style="color: #fbbf24; margin: 0 0 6px 0; font-size: 0.95rem;">📋 Tóm Tắt Tình Huống & Phân Tích:</h4>
                <div class="anle-text-section">${escapeHtml(c.summary)}</div>
              </div>
            ` : ''}

            ${c.full_text ? `
              <div>
                <h4 style="color: #38bdf8; margin: 0 0 6px 0; font-size: 0.95rem;">📖 Toàn Văn Lời Thầy Giảng & Nghiệm Chứng Thực Tế:</h4>
                <div class="anle-text-section">${escapeHtml(c.full_text)}</div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // Bind toàn bộ sự kiện giao diện
  function bindEvents(container) {
    // 1. Chuyển đổi phương thức lập quẻ
    container.querySelectorAll('.luchao-method-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const m = btn.dataset.method;
        if (state.method !== m) {
          state.method = m;
          if (m === 'coin') {
            state.coinsCast = [];
          }
          calculateHexagram();
          render();
        }
      });
    });

    // 2. Chọn chuyên đề
    const topicSel = container.querySelector('#luchao-topic-select');
    if (topicSel) {
      topicSel.addEventListener('change', (e) => {
        state.topicKey = e.target.value;
        calculateHexagram();
        render();
      });
    }

    // 3. Nhập câu hỏi
    const questionInp = container.querySelector('#luchao-question-input');
    if (questionInp) {
      questionInp.addEventListener('change', (e) => {
        state.question = e.target.value.trim();
      });
    }

    // 4. Nhập thời gian
    const dtInp = container.querySelector('#luchao-datetime-input');
    if (dtInp) {
      dtInp.addEventListener('change', (e) => {
        if (e.target.value) {
          state.selectedDate = new Date(e.target.value);
        }
      });
    }

    // 5. Nút Lập Bàn Quẻ
    const btnCast = container.querySelector('#luchao-btn-cast');
    if (btnCast) {
      btnCast.addEventListener('click', () => {
        const qVal = container.querySelector('#luchao-question-input')?.value;
        if (qVal) state.question = qVal.trim();
        calculateHexagram();
        playCoinSound('done');
        render();
      });
    }

    // 6. Gieo đồng xu
    const btnThrowCoin = container.querySelector('#luchao-btn-throw-coin');
    if (btnThrowCoin) {
      btnThrowCoin.addEventListener('click', () => {
        if (state.coinsCast.length >= 6) return;

        state.isShaking = true;
        playCoinSound('shake');
        render();

        setTimeout(() => {
          // Lắc ra 3 đồng xu ngẫu nhiên (1: sấp +2, 2: ngửa +3)
          const c1 = Math.random() < 0.5 ? 1 : 2;
          const c2 = Math.random() < 0.5 ? 1 : 2;
          const c3 = Math.random() < 0.5 ? 1 : 2;
          state.currentCoins = [c1, c2, c3];

          // Số mặt ngửa: đếm số 2
          const heads = [c1, c2, c3].filter((x) => x === 2).length;
          state.coinsCast.push(heads);
          state.isShaking = false;

          playCoinSound('clink');

          if (state.coinsCast.length === 6) {
            playCoinSound('done');
            calculateHexagram();
          }

          render();
        }, 320);
      });
    }

    // 7. Reset gieo xu
    const btnResetCoin = container.querySelector('#luchao-btn-coin-reset');
    if (btnResetCoin) {
      btnResetCoin.addEventListener('click', () => {
        state.coinsCast = [];
        render();
      });
    }

    // 8. Nhập số seri
    const serialInp = container.querySelector('#luchao-serial-number');
    if (serialInp) {
      serialInp.addEventListener('input', (e) => {
        state.serialNumber = e.target.value;
      });
    }

    // 9. Chuyển subtabs kết quả
    container.querySelectorAll('.luchao-subtab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.activeTab = btn.dataset.subtab;
        render();
      });
    });

    // 10. Copy báo cáo
    const btnCopy = container.querySelector('#luchao-btn-copy-report');
    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        const textPre = container.querySelector('#luchao-report-text-pre');
        if (textPre && navigator.clipboard) {
          navigator.clipboard.writeText(textPre.textContent).then(() => {
            btnCopy.textContent = '✅ Đã Sao Chép!';
            setTimeout(() => {
              btnCopy.textContent = '📋 Sao Chép Báo Cáo';
            }, 2000);
          }).catch(() => {
            alert('Không thể sao chép tự động. Hãy bôi đen văn bản để sao chép.');
          });
        }
      });
    }

    // 11. Tra cứu ngày Đại Cát theo Ứng Kỳ
    const btnFindAuspicious = container.querySelector('#luchao-btn-find-auspicious');
    if (btnFindAuspicious) {
      btnFindAuspicious.addEventListener('click', () => {
        state.auspiciousDaysList = findAuspiciousDaysForUngKy(state.currentResult, 60);
        state.showAuspiciousBox = true;
        render();
      });
    }

    const btnCloseAuspicious = container.querySelector('#luchao-btn-close-auspicious');
    if (btnCloseAuspicious) {
      btnCloseAuspicious.addEventListener('click', () => {
        state.showAuspiciousBox = false;
        render();
      });
    }

    // Nút chuyển sang phân hệ Trạch Cát với ngày được chọn
    container.querySelectorAll('.btn-goto-trachcat').forEach((btn) => {
      btn.addEventListener('click', () => {
        const isoDate = btn.dataset.targetDate;
        if (isoDate) {
          const targetD = new Date(isoDate);
          if (typeof window.switchAppMode === 'function') {
            window.switchAppMode('trachcat');
            // Cập nhật ngày trên Trạch Cát nếu có
            setTimeout(() => {
              if (window.NetaTrachCatView && typeof window.NetaTrachCatView.setDate === 'function') {
                window.NetaTrachCatView.setDate(targetD);
              }
            }, 200);
          }
        }
      });
    });

    // 12. Lưu quẻ vào Nhật Ký
    const btnSaveCurrent = container.querySelector('#luchao-btn-save-current');
    if (btnSaveCurrent) {
      btnSaveCurrent.addEventListener('click', () => {
        const entry = saveCurrentToJournal();
        if (entry) {
          alert(`Đã lưu quẻ [${entry.gocName}] vào Sổ Tay Nhật Ký thành công!`);
          render();
        }
      });
    }

    // 13. Lọc danh sách Nhật Ký
    const filterSel = container.querySelector('#luchao-journal-filter-select');
    if (filterSel) {
      filterSel.addEventListener('change', (e) => {
        state.journalFilter = e.target.value;
        render();
      });
    }

    // 14. Cập nhật Kiểm chứng Hậu kiểm
    container.querySelectorAll('.btn-save-verify').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const card = btn.closest('.luchao-journal-card');
        if (card) {
          const sel = card.querySelector('.verify-select');
          const inp = card.querySelector('.verify-text-input');
          const status = sel ? sel.value : 'pending';
          const note = inp ? inp.value.trim() : '';
          updateVerification(id, status, note);
          alert('Đã cập nhật kết quả kiểm chứng thực tế!');
          render();
        }
      });
    });

    // 15. Tải lại Bàn Quẻ từ Nhật Ký
    container.querySelectorAll('.btn-journal-load').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const ok = loadHexagramFromJournal(id);
        if (ok) {
          playCoinSound('done');
          render();
        }
      });
    });

    // 16. Xóa quẻ khỏi Nhật Ký
    container.querySelectorAll('.btn-journal-delete').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (confirm('Bạn có chắc chắn muốn xóa quẻ này khỏi sổ tay nhật ký?')) {
          deleteFromJournal(id);
          render();
        }
      });
    });

    // 17. Xuất & Nhập JSON Nhật Ký
    const btnExport = container.querySelector('#luchao-btn-export-journal');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        exportJournalJSON();
      });
    }

    const btnImportTrigger = container.querySelector('#luchao-btn-import-journal-trigger');
    const inputImportFile = container.querySelector('#luchao-input-journal-file');
    if (btnImportTrigger && inputImportFile) {
      btnImportTrigger.addEventListener('click', () => {
        inputImportFile.click();
      });
      inputImportFile.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            const content = evt.target.result;
            const res = importJournalJSON(content);
            if (res.success) {
              alert(`Phục hồi thành công! Đã thêm ${res.count} quẻ mới vào sổ tay.`);
              render();
            } else {
              alert(`Lỗi phục hồi: ${res.message}`);
            }
          };
          reader.readAsText(file);
        }
      });
    }

    // 18. Sự kiện Subtab Án Lệ Thầy Cường (290 Quẻ)
    // Lọc theo chip Khối kiến thức
    container.querySelectorAll('.anle-chip-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.anLeFilter = btn.dataset.filter;
        render();
      });
    });

    // Tìm kiếm án lệ
    const anLeSearchInp = container.querySelector('#anle-search-input');
    if (anLeSearchInp) {
      anLeSearchInp.addEventListener('input', (e) => {
        state.anLeSearch = e.target.value;
      });
      anLeSearchInp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          render();
        }
      });
    }

    // Mở modal án lệ
    container.querySelectorAll('.btn-anle-view, .anle-matching-item').forEach((el) => {
      el.addEventListener('click', (e) => {
        const id = parseInt(el.dataset.caseId, 10);
        if (id) {
          state.selectedCaseId = id;
          render();
        }
      });
    });

    // Đóng modal án lệ
    const modalCloseBtn = container.querySelector('#btn-anle-modal-close');
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => {
        state.selectedCaseId = null;
        render();
      });
    }
    const modalOverlay = container.querySelector('#anle-modal-overlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          state.selectedCaseId = null;
          render();
        }
      });
    }
  }

  // Public API
  global.NetaLucHaoView = {
    render: render,
    getState: () => state,
    calculateHexagram: calculateHexagram
  };

})(typeof window !== 'undefined' ? window : this);
