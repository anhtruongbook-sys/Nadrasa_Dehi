/**
 * NETA LIGHT - KỲ MÔN ĐỘN GIÁP VIEW MODULE
 * Lập Bàn 9 Cung (Luoshu 3x3 Grid) chuẩn xác theo Chân Thái Dương Thời
 * Hiển thị Thần, Tinh, Môn, Can Thiên/Địa Bàn, Mã Tinh, Không Vong & Cách Cục.
 * Chạm vào từng Cung để xem phân tích chi tiết.
 */

(function (global) {
  'use strict';

  let currentQmdjDate = new Date();
  let currentChart = null;
  let currentPatterns = [];
  let isQmdjLunarMode = false;

  const VI_DICT = {
    "天蓬星": "Thiên Bồng", "天任星": "Thiên Nhậm", "天冲星": "Thiên Xung",
    "天辅星": "Thiên Phụ", "天英星": "Thiên Anh", "天芮星": "Thiên Nhuế",
    "天柱星": "Thiên Trụ", "天心星": "Thiên Tâm", "天禽星": "Thiên Cầm",
    "休门": "Hưu Môn", "生门": "Sinh Môn", "伤门": "Thương Môn",
    "杜门": "Đỗ Môn", "景门": "Cảnh Môn", "死门": "Tử Môn",
    "惊门": "Kinh Môn", "开门": "Khai Môn",
    "直符": "Trực Phù", "值符": "Trực Phù", "腾蛇": "Đằng Xà", "太阴": "Thái Âm", "六合": "Lục Hợp",
    "白虎": "Bạch Hổ", "玄武": "Huyền Vũ", "九地": "Cửu Địa", "九天": "Cửu Thiên",
    "勾陈": "Câu Trần", "朱雀": "Chu Tước", "螣蛇": "Đằng Xà",
    "甲": "Giáp", "乙": "Ất", "丙": "Bính", "丁": "Đinh", "戊": "Mậu",
    "己": "Kỷ", "庚": "Canh", "辛": "Tân", "壬": "Nhâm", "癸": "Quý",
    "子": "Tý", "丑": "Sửu", "寅": "Dần", "卯": "Mão", "辰": "Thìn", "巳": "Tỵ",
    "午": "Ngọ", "未": "Mùi", "申": "Thân", "酉": "Dậu", "戌": "Tuất", "亥": "Hợi",
    "坎": "Khảm (1)", "坤": "Khôn (2)", "震": "Chấn (3)", "巽": "Tốn (4)",
    "中": "Trung (5)", "乾": "Càn (6)", "兑": "Đoài (7)", "艮": "Cấn (8)", "离": "Ly (9)",
    "马": "Mã"
  };

  const PALACE_NAMES = {
    0: "Khảm 1",
    1: "Khôn 2",
    2: "Chấn 3",
    3: "Tốn 4",
    4: "Trung 5",
    5: "Càn 6",
    6: "Đoài 7",
    7: "Cấn 8",
    8: "Ly 9"
  };

  const CAT_BINH = ["Cảnh Môn", "Đỗ Môn", "Thiên Anh", "Thiên Xung", "Chu Tước", "Câu Trần", "Đằng Xà"];
  const CAT_CAT = ["Hưu Môn", "Sinh Môn", "Khai Môn", "Thiên Phụ", "Thiên Nhậm", "Thiên Tâm", "Thiên Cầm", "Trực Phù", "Thái Âm", "Lục Hợp", "Cửu Thiên", "Cửu Địa", "Giáp", "Ất", "Bính", "Đinh", "Mậu"];
  const CAT_HUNG = ["Thương Môn", "Tử Môn", "Kinh Môn", "Thiên Bồng", "Thiên Nhuế", "Thiên Trụ", "Huyền Vũ", "Bạch Hổ", "Canh", "Tân", "Nhâm", "Quý", "Kỷ"];

  function translate(text) {
    if (!text) return "";
    let res = String(text);
    const keys = Object.keys(VI_DICT).sort((a, b) => b.length - a.length);
    keys.forEach(k => { res = res.split(k).join(VI_DICT[k]); });
    return res;
  }

  function getCatClass(text) {
    const t = (text || "").trim();
    if (CAT_CAT.some(c => t.includes(c) || c === t)) return "cat-good";
    if (CAT_HUNG.some(c => t.includes(c) || c === t)) return "cat-bad";
    if (CAT_BINH.some(c => t.includes(c) || c === t)) return "cat-mid";
    return "";
  }

  function initQmdjView() {
    const container = document.getElementById('view-qmdj');
    if (!container) return;
    renderQmdj();
  }

  function computeQmdjChart(date = currentQmdjDate) {
    if (!global.QMDJCore || !global.QMDJCore.TheArtOfBecomingInvisible) {
      console.error("QMDJCore engine not found!");
      return null;
    }
    try {
      const chart = new global.QMDJCore.TheArtOfBecomingInvisible(date);
      const patterns = global.QMDJCore.getChartPatterns ? global.QMDJCore.getChartPatterns(chart) : [];
      currentChart = chart;
      currentPatterns = patterns;
      return { chart, patterns };
    } catch (e) {
      console.error("Error computing QMDJ chart:", e);
      return null;
    }
  }

  function renderQmdj() {
    const container = document.getElementById('view-qmdj');
    if (!container) return;

    const data = computeQmdjChart(currentQmdjDate);
    if (!data || !data.chart) {
      container.innerHTML = `
        <div class="module-placeholder">
          <div class="placeholder-icon">🔮</div>
          <h2 class="placeholder-title">LỖI KHỞI TẠO BÀN KỲ MÔN</h2>
          <p class="placeholder-desc">Không thể tính toán bàn cờ cho thời điểm này. Vui lòng thử lại.</p>
        </div>
      `;
      return;
    }

    const { chart, patterns } = data;
    const roundText = chart.round > 0 ? `Dương ${chart.round} Cục` : `Âm ${Math.abs(chart.round)} Cục`;
    const pillars = {
      year: chart.year ? translate(chart.year.cstb(true)) : '',
      month: chart.month ? translate(chart.month.cstb(true)) : '',
      day: chart.date ? translate(chart.date.cstb(true)) : '',
      hour: chart.hour ? translate(chart.hour.cstb(true)) : ''
    };

    const d = currentQmdjDate;
    const pad = n => String(n).padStart(2, '0');
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())} - ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

    // Get 24 Solar term from calendar engine
    let solarTerm = "Xuân Phân";
    if (global.NetaCalendarEngine) {
      solarTerm = global.NetaCalendarEngine.getSolarTerm(d.getDate(), d.getMonth() + 1, d.getFullYear());
    }

    let dayVal = d.getDate();
    let monthVal = d.getMonth() + 1;
    let yearVal = d.getFullYear();
    if (isQmdjLunarMode && global.NetaCalendarEngine) {
      const lInfo = global.NetaCalendarEngine.getFullDayInfo(d);
      dayVal = lInfo.lunar.day;
      monthVal = lInfo.lunar.month;
      yearVal = lInfo.lunar.year;
    }

    container.innerHTML = `
      <div class="qmdj-view-container">
        <!-- Unified Control Card -->
        <div class="unified-ctrl-card">
          <!-- Row 1: Calendar switch & Date Box -->
          <div class="ucc-row ucc-row-date">
            <div class="ucc-pill-cal">
              <button type="button" class="ucc-pill-btn ${!isQmdjLunarMode ? 'active' : ''}" id="btn-qmdj-solar">☀️ Dương</button>
              <button type="button" class="ucc-pill-btn ${isQmdjLunarMode ? 'active' : ''}" id="btn-qmdj-lunar">🌙 Âm</button>
            </div>
            <div class="ucc-date-box">
              <input type="number" id="qmdj-input-day" class="num-box num-day" min="1" max="31" value="${dayVal}" placeholder="Ngày" title="Nhập Ngày (1-31)">
              <span class="num-slash">/</span>
              <input type="number" id="qmdj-input-month" class="num-box num-month" min="1" max="12" value="${monthVal}" placeholder="Tháng" title="Nhập Tháng (1-12)">
              <span class="num-slash">/</span>
              <input type="number" id="qmdj-input-year" class="num-box num-year" min="1900" max="2100" value="${yearVal}" placeholder="Năm" title="Nhập Năm">
              <button type="button" class="ucc-btn-year" id="btn-qmdj-year-jumper" title="Chọn nhanh thập niên & năm">⚡Năm</button>
              <label class="btn-picker-cal" id="qmdj-btn-native-cal" title="Chọn ngày trên lịch">
                📅
                <input type="date" id="qmdj-date-picker" value="${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}" class="native-hidden-date">
              </label>
            </div>
          </div>

          <!-- Row 2: Can Chi + Numeric Time & Hour Stepping -->
          <div class="ucc-row ucc-row-time">
            <div class="ucc-time-box">
              <select id="qmdj-select-canchi" class="select-canchi">
                <option value="0" ${[23, 0].includes(d.getHours()) ? 'selected' : ''}>Tý (23-01h)</option>
                <option value="2" ${[1, 2].includes(d.getHours()) ? 'selected' : ''}>Sửu (01-03h)</option>
                <option value="4" ${[3, 4].includes(d.getHours()) ? 'selected' : ''}>Dần (03-05h)</option>
                <option value="6" ${[5, 6].includes(d.getHours()) ? 'selected' : ''}>Mão (05-07h)</option>
                <option value="8" ${[7, 8].includes(d.getHours()) ? 'selected' : ''}>Thìn (07-09h)</option>
                <option value="10" ${[9, 10].includes(d.getHours()) ? 'selected' : ''}>Tỵ (09-11h)</option>
                <option value="12" ${[11, 12].includes(d.getHours()) ? 'selected' : ''}>Ngọ (11-13h)</option>
                <option value="14" ${[13, 14].includes(d.getHours()) ? 'selected' : ''}>Mùi (13-15h)</option>
                <option value="16" ${[15, 16].includes(d.getHours()) ? 'selected' : ''}>Thân (15-17h)</option>
                <option value="18" ${[17, 18].includes(d.getHours()) ? 'selected' : ''}>Dậu (17-19h)</option>
                <option value="20" ${[19, 20].includes(d.getHours()) ? 'selected' : ''}>Tuất (19-21h)</option>
                <option value="22" ${[21, 22].includes(d.getHours()) ? 'selected' : ''}>Hợi (21-23h)</option>
              </select>
              <input type="number" id="qmdj-input-hour" class="num-box num-hour" min="0" max="23" value="${pad(d.getHours())}" placeholder="Giờ" title="Nhập Giờ (0-23)">
              <span class="num-colon">:</span>
              <input type="number" id="qmdj-input-minute" class="num-box num-min" min="0" max="59" value="${pad(d.getMinutes())}" placeholder="Phút" title="Nhập Phút (0-59)">
            </div>
            <div class="ucc-step-group">
              <button class="ucc-step-btn" id="btn-qmdj-prev-hour" title="Lùi 1 Giờ (2 tiếng)">◀ 2h</button>
              <button class="ucc-step-btn" id="btn-qmdj-next-hour" title="Tiến 1 Giờ (2 tiếng)">2h ▶</button>
            </div>
          </div>

          <!-- Row 3: Actions (Giờ thực, Cục badge, Lập Bàn) -->
          <div class="ucc-row ucc-row-actions">
            <button class="ucc-btn-now" id="btn-qmdj-now" title="Đặt lại về thời điểm hiện tại">⚡ Giờ thực</button>
            <div class="qmdj-cuc-badge" title="Cục số và Tiết khí">
              <span>${roundText}</span>
              <span class="cuc-dot">•</span>
              <span>${solarTerm}</span>
            </div>
            <button class="ucc-btn-submit" id="btn-qmdj-submit" title="Lập bàn Kỳ Môn">🔮 Lập Bàn</button>
          </div>
        </div>

        <!-- 4 Pillars Summary Header -->
        <div class="qmdj-pillars-strip">
          <div class="q-pillar"><span class="q-lbl">NĂM</span><strong class="q-val">${pillars.year}</strong></div>
          <div class="q-pillar"><span class="q-lbl">THÁNG</span><strong class="q-val">${pillars.month}</strong></div>
          <div class="q-pillar"><span class="q-lbl">NGÀY</span><strong class="q-val">${pillars.day}</strong></div>
          <div class="q-pillar highlight-hour"><span class="q-lbl">GIỜ</span><strong class="q-val">${pillars.hour}</strong></div>
        </div>

        <!-- 9-Palace Matrix (Lưới 3x3 Lạc Thư Chuẩn) -->
        <div class="qmdj-matrix-grid">
          ${renderPalacesHTML(chart, patterns, pillars, timeStr)}
        </div>

        <!-- Patterns (Cát/Hung Cách Cục) List Accordion -->
        <div class="qmdj-patterns-box">
          <div class="patterns-header">
            <span>✨ CÁT / HUNG CÁCH CỤC (${patterns.length})</span>
            <span class="patterns-hint">Chạm cung để xem chi tiết</span>
          </div>
          <div class="patterns-chips">
            ${patterns.slice(0, 8).map(p => `
              <span class="pattern-chip ${p.type === 'cat' ? 'chip-cat' : 'chip-hung'}" title="${p.desc || ''}">
                ${p.name}
              </span>
            `).join('')}
            ${patterns.length > 8 ? `<span class="pattern-chip chip-more">+${patterns.length - 8} cách cục</span>` : ''}
          </div>
        </div>
      </div>

      <!-- Palace Detail Modal -->
      <div class="modal-overlay" id="qmdj-palace-modal" style="display: none;">
        <div class="modal-dialog qmdj-palace-dialog">
          <div class="guide-header">
            <h2 id="qmdj-modal-title">🏰 Chi Tiết Cung Kỳ Môn</h2>
            <button class="modal-close" id="qmdj-modal-close" aria-label="Đóng">&times;</button>
          </div>
          <div class="qmdj-modal-body" id="qmdj-modal-body">
            <!-- Dynamically populated -->
          </div>
        </div>
      </div>
    `;

    bindQmdjEvents(chart, patterns);
  }

  function renderPalacesHTML(chart, patterns, pillars, timeStr) {
    const box = chart.box; // 3x3 array: [0][0]=Tốn, [0][1]=Ly, [0][2]=Khôn, ...
    let html = '';

    box.forEach((row, rIdx) => {
      row.forEach((palace, cIdx) => {
        const isCenter = palace.index === 4;
        const pIndex = palace.index; // 0-8
        const door = translate(palace.getDoor(true));
        const stars = Array.isArray(palace.getStar(true)) ? palace.getStar(true).map(translate) : [translate(palace.getStar(true))];
        const divinity = translate(palace.getDivinity(true));
        const hcs = palace.getHCS(true).map(translate); // Thiên can thiên bàn
        const ecs = palace.getECS(true).map(translate); // Thiên can địa bàn
        const isVoid = palace.de; // Tuần không
        const isHorse = palace.hs; // Mã tinh

        // Check palace patterns
        const palPatterns = patterns.filter(p => parseInt(p.palaceIndex) === pIndex);

        if (isCenter) {
          // Trung cung: hiển thị thời gian & thông tin cốt lõi
          html += `
            <div class="qmdj-palace-cell center-palace" data-palace-index="${pIndex}">
              <div class="center-content">
                <div class="center-symbol">☯</div>
                <div class="center-title">TRUNG CUNG (5)</div>
                <div class="center-time">${timeStr}</div>
                <div class="center-ecs-stems">Thiên Cầm: ${hcs.join(' ')}</div>
              </div>
            </div>
          `;
        } else {
          const palaceName = PALACE_NAMES[pIndex] || `Cung ${pIndex + 1}`;
          html += `
            <div class="qmdj-palace-cell" data-palace-index="${pIndex}">
              <!-- Top Row: Thần & Số Cung -->
              <div class="p-top">
                <span class="p-divinity ${getCatClass(divinity)}">${divinity}</span>
                <div class="p-top-right">
                  ${isVoid ? '<span class="p-void-mark" title="Tuần Không">〇</span>' : ''}
                  <span class="p-num">${pIndex + 1}</span>
                </div>
              </div>

              <!-- Mid Row: Cửa & Sao (trái), Can Thiên Bàn (phải) -->
              <div class="p-mid">
                <div class="p-door-star">
                  <div class="p-door ${getCatClass(door)}">${door}</div>
                  <div class="p-stars">
                    ${stars.map(s => `<span class="${getCatClass(s)}">${s}</span>`).join(' ')}
                  </div>
                </div>
                <div class="p-stems-right">
                  ${hcs.map(stem => `<span class="p-hcs ${getCatClass(stem)}">${stem}</span>`).join('')}
                </div>
              </div>

              <!-- Bottom Row: Tên Cung & Can Địa Bàn -->
              <div class="p-bot">
                <div class="p-bot-left">
                  <span class="p-cung-name">${palaceName}</span>
                  ${isHorse ? '<span class="p-horse" title="Mã Tinh">🐎</span>' : ''}
                </div>
                <div class="p-ecs">
                  ${ecs.map(stem => `<span class="p-ecs-stem ${getCatClass(stem)}">${stem}</span>`).join(' ')}
                </div>
              </div>

              ${palPatterns.length > 0 ? `
                <div class="p-indicator-dot ${palPatterns.some(p => p.type === 'cat') ? 'dot-cat' : 'dot-hung'}"></div>
              ` : ''}
            </div>
          `;
        }
      });
    });

    return html;
  }

  function bindQmdjEvents(chart, patterns) {
    const pad = n => String(n).padStart(2, '0');

    // Sync elements
    const inputDay = document.getElementById('qmdj-input-day');
    const inputMonth = document.getElementById('qmdj-input-month');
    const inputYear = document.getElementById('qmdj-input-year');
    const datePicker = document.getElementById('qmdj-date-picker');
    const selectCanChi = document.getElementById('qmdj-select-canchi');
    const inputHour = document.getElementById('qmdj-input-hour');
    const inputMin = document.getElementById('qmdj-input-minute');
    const btnSolar = document.getElementById('btn-qmdj-solar');
    const btnLunar = document.getElementById('btn-qmdj-lunar');

    if (btnSolar) {
      btnSolar.onclick = () => {
        if (isQmdjLunarMode) {
          isQmdjLunarMode = false;
          renderQmdj();
        }
      };
    }
    if (btnLunar) {
      btnLunar.onclick = () => {
        if (!isQmdjLunarMode) {
          isQmdjLunarMode = true;
          renderQmdj();
        }
      };
    }

    // Sync native datepicker -> numeric boxes
    if (datePicker) {
      datePicker.addEventListener('change', () => {
        if (!datePicker.value) return;
        const [y, m, d] = datePicker.value.split('-').map(Number);
        isQmdjLunarMode = false;
        if (inputDay) inputDay.value = d;
        if (inputMonth) inputMonth.value = m;
        if (inputYear) inputYear.value = y;
      });
      const pickerLabel = document.getElementById('qmdj-btn-native-cal') || document.querySelector('.btn-picker-cal');
      if (pickerLabel && global.NetaSmartPicker) {
        global.NetaSmartPicker.setupNativeDatePicker(pickerLabel, datePicker);
      }
    }

    // Smart auto advance and decade jumper
    const btnYearJumper = document.getElementById('btn-qmdj-year-jumper');
    if (global.NetaSmartPicker) {
      global.NetaSmartPicker.setupAutoAdvance({
        dayInput: inputDay,
        monthInput: inputMonth,
        yearInput: inputYear,
        hourInput: inputHour,
        minuteInput: inputMin,
        onSubmit: () => {
          if (btnSubmit) btnSubmit.click();
        }
      });

      if (btnYearJumper && inputYear) {
        btnYearJumper.onclick = () => {
          const curY = parseInt(inputYear.value) || currentQmdjDate.getFullYear();
          global.NetaSmartPicker.openYearJumperModal(curY, (selectedYear) => {
            inputYear.value = selectedYear;
            syncDateBoxesToPicker();
          });
        };
      }
    }

    // Sync numeric boxes -> native datepicker
    function syncDateBoxesToPicker() {
      if (!inputDay || !inputMonth || !inputYear || !datePicker) return;
      const d = parseInt(inputDay.value) || 1;
      const m = parseInt(inputMonth.value) || 1;
      const y = parseInt(inputYear.value) || 2026;
      datePicker.value = `${y}-${pad(m)}-${pad(d)}`;
    }
    if (inputDay) inputDay.addEventListener('input', syncDateBoxesToPicker);
    if (inputMonth) inputMonth.addEventListener('input', syncDateBoxesToPicker);
    if (inputYear) inputYear.addEventListener('input', syncDateBoxesToPicker);

    // Sync Can Chi hour -> numeric hour box
    if (selectCanChi) {
      selectCanChi.addEventListener('change', () => {
        if (inputHour) inputHour.value = pad(selectCanChi.value);
      });
    }

    // Sync numeric hour box -> Can Chi select
    if (inputHour) {
      inputHour.addEventListener('input', () => {
        const h = parseInt(inputHour.value);
        if (isNaN(h)) return;
        const CAN_CHI_MAP = [
          { val: 0, match: [23, 0] }, { val: 2, match: [1, 2] },
          { val: 4, match: [3, 4] }, { val: 6, match: [5, 6] },
          { val: 8, match: [7, 8] }, { val: 10, match: [9, 10] },
          { val: 12, match: [11, 12] }, { val: 14, match: [13, 14] },
          { val: 16, match: [15, 16] }, { val: 18, match: [17, 18] },
          { val: 20, match: [19, 20] }, { val: 22, match: [21, 22] }
        ];
        const found = CAN_CHI_MAP.find(c => c.match.includes(h));
        if (found && selectCanChi) selectCanChi.value = String(found.val);
      });
    }

    // Submit button: Cast chart with input date & time
    const btnSubmit = document.getElementById('btn-qmdj-submit');
    if (btnSubmit) {
      btnSubmit.onclick = () => {
        let d = Math.min(31, Math.max(1, parseInt(inputDay ? inputDay.value : 1) || 1));
        let m = Math.min(12, Math.max(1, parseInt(inputMonth ? inputMonth.value : 1) || 1));
        let rawYear = parseInt(inputYear ? inputYear.value : 2026) || 2026;
        if (global.NetaSmartPicker && rawYear < 100) {
          rawYear = global.NetaSmartPicker.parseSmartYear(rawYear);
          if (inputYear) inputYear.value = rawYear;
        }
        let y = Math.min(2100, Math.max(1900, rawYear));
        const h = Math.min(23, Math.max(0, parseInt(inputHour ? inputHour.value : 12) || 12));
        const min = Math.min(59, Math.max(0, parseInt(inputMin ? inputMin.value : 0) || 0));

        if (isQmdjLunarMode && global.NetaCalendarEngine && global.NetaCalendarEngine.lunar2Solar) {
          const solar = global.NetaCalendarEngine.lunar2Solar(d, m, y, false, 7);
          d = solar.day;
          m = solar.month;
          y = solar.year;
        }

        currentQmdjDate = new Date(y, m - 1, d, h, min, 0);
        renderQmdj();
      };
    }

    // Hour steps: 2 hours per step (1 canh giờ)
    const btnPrev = document.getElementById('btn-qmdj-prev-hour');
    const btnNext = document.getElementById('btn-qmdj-next-hour');
    const btnNow = document.getElementById('btn-qmdj-now');

    if (btnPrev) {
      btnPrev.onclick = () => {
        currentQmdjDate = new Date(currentQmdjDate.getTime() - 2 * 3600000);
        renderQmdj();
      };
    }
    if (btnNext) {
      btnNext.onclick = () => {
        currentQmdjDate = new Date(currentQmdjDate.getTime() + 2 * 3600000);
        renderQmdj();
      };
    }
    if (btnNow) {
      btnNow.onclick = () => {
        currentQmdjDate = new Date();
        renderQmdj();
      };
    }

    // Click on palace cell to open detail modal
    const cells = document.querySelectorAll('.qmdj-palace-cell');
    cells.forEach(cell => {
      cell.onclick = () => {
        const pIndex = parseInt(cell.getAttribute('data-palace-index'));
        openPalaceDetailModal(chart, patterns, pIndex);
      };
    });

    // Close modal
    const modalClose = document.getElementById('qmdj-modal-close');
    const modalOverlay = document.getElementById('qmdj-palace-modal');
    if (modalClose && modalOverlay) {
      modalClose.onclick = () => { modalOverlay.style.display = 'none'; };
      modalOverlay.onclick = (e) => {
        if (e.target === modalOverlay) modalOverlay.style.display = 'none';
      };
    }
  }

  function openPalaceDetailModal(chart, patterns, pIndex) {
    const modal = document.getElementById('qmdj-palace-modal');
    const titleEl = document.getElementById('qmdj-modal-title');
    const bodyEl = document.getElementById('qmdj-modal-body');
    if (!modal || !bodyEl) return;

    const palace = chart.box.flat().find(p => p.index === pIndex);
    if (!palace) return;

    const palaceName = PALACE_NAMES[pIndex] || `Cung ${pIndex + 1}`;
    titleEl.textContent = `🏰 CUNG ${palaceName.toUpperCase()}`;

    const door = translate(palace.getDoor(true));
    const stars = Array.isArray(palace.getStar(true)) ? palace.getStar(true).map(translate) : [translate(palace.getStar(true))];
    const divinity = translate(palace.getDivinity(true));
    const hcs = palace.getHCS(true).map(translate);
    const ecs = palace.getECS(true).map(translate);
    const palPatterns = patterns.filter(p => parseInt(p.palaceIndex) === pIndex);

    bodyEl.innerHTML = `
      <div class="palace-modal-content">
        <div class="pm-badges-row">
          <div class="pm-badge"><strong>Bát Thần:</strong> ${divinity}</div>
          <div class="pm-badge"><strong>Cửu Tinh:</strong> ${stars.join(', ')}</div>
          <div class="pm-badge"><strong>Bát Môn:</strong> ${door}</div>
        </div>

        <div class="pm-stems-box">
          <div><small>Thiên Can Thiên Bàn:</small> <strong>${hcs.join(' ')}</strong></div>
          <div><small>Thiên Can Địa Bàn:</small> <strong>${ecs.join(' ')}</strong></div>
          <div><small>Trạng thái:</small> ${palace.de ? '<span class="text-hung">Tuần Không (〇)</span>' : '<span class="text-cat">Bình hòa</span>'} ${palace.hs ? '<span class="text-cat">• Có Mã Tinh (🐎)</span>' : ''}</div>
        </div>

        <div class="pm-patterns-section">
          <h4 class="pm-sec-title">⚔️ CÁC CÁCH CỤC TẠI CUNG NÀY (${palPatterns.length})</h4>
          ${palPatterns.length === 0 ? '<p class="pm-empty">Không có cách cục đặc biệt tại cung này.</p>' : `
            <div class="pm-patterns-list">
              ${palPatterns.map(p => `
                <div class="pm-pattern-item ${p.type === 'cat' ? 'border-cat' : 'border-hung'}">
                  <div class="pm-p-name ${p.type === 'cat' ? 'text-cat' : 'text-hung'}">${p.name.toUpperCase()}</div>
                  <div class="pm-p-desc">${p.desc || 'Không có mô tả'}</div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  }

  // Set date from external caller (e.g. from Calendar)
  function setDateAndRender(date) {
    currentQmdjDate = new Date(date);
    renderQmdj();
  }

  // Export to global
  global.NetaQMDJView = {
    init: initQmdjView,
    render: renderQmdj,
    setDate: setDateAndRender
  };

})(typeof window !== 'undefined' ? window : this);
