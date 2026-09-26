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

    const lInfo = global.NetaCalendarEngine ? global.NetaCalendarEngine.getFullDayInfo(d) : null;
    const lunarText = lInfo ? `ÂL: ${lInfo.lunar.day}/${lInfo.lunar.month} • ${pillars.day}` : '';

    container.innerHTML = `
      <div class="qmdj-view-container">
        <!-- Unified Control Card (Native Wheel Picker & Steppers) -->
        <div class="unified-ctrl-card">
          <!-- Row 1: Date display & Quick Native Picker -->
          <div class="ucc-row" style="justify-content: space-between; flex-wrap: wrap; gap: 6px;">
            <div class="ucc-date-display-badge" id="btn-qmdj-badge" title="Chạm để mở vòng quay chọn ngày giờ">
              <span>📅</span>
              <span class="solar-highlight">${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}</span>
              <span class="lunar-sub">(${lunarText})</span>
            </div>
            <div style="display: flex; gap: 4px; align-items: center; flex-shrink: 0;">
              <button type="button" class="ucc-btn-now" id="btn-qmdj-now" title="Về thời điểm hiện tại">🕒 Hiện Tại</button>
              <button type="button" class="ucc-btn-picker" id="btn-qmdj-picker" title="Chọn ngày giờ chiêm quẻ">📅 Giờ Khác</button>
              <input type="datetime-local" id="qmdj-hidden-datetime" style="position:fixed; top:-1000px; left:-1000px; opacity:0; pointer-events:none;" />
            </div>
          </div>

          <!-- Row 2: Canh stepping, Cục badge, Lập Bàn -->
          <div class="ucc-row ucc-row-actions" style="justify-content: space-between; align-items: center;">
            <div class="ucc-step-group">
              <button class="ucc-step-btn" id="btn-qmdj-prev-hour" title="Lùi 1 Canh Giờ (2 tiếng)">◀ 2h</button>
              <button class="ucc-step-btn" id="btn-qmdj-next-hour" title="Tiến 1 Canh Giờ (2 tiếng)">2h ▶</button>
            </div>
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

    const pickerBtn = document.getElementById('btn-qmdj-picker');
    const badgeBtn = document.getElementById('btn-qmdj-badge');
    const hiddenInput = document.getElementById('qmdj-hidden-datetime');

    const openPicker = () => {
      if (!hiddenInput) return;
      const d = currentQmdjDate;
      hiddenInput.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      if (typeof hiddenInput.showPicker === 'function') {
        hiddenInput.showPicker();
      } else {
        hiddenInput.click();
      }
    };

    if (pickerBtn) pickerBtn.onclick = openPicker;
    if (badgeBtn) badgeBtn.onclick = openPicker;

    if (hiddenInput) {
      hiddenInput.onchange = (e) => {
        if (e.target.value) {
          currentQmdjDate = new Date(e.target.value);
          renderQmdj();
        }
      };
    }

    const btnNow = document.getElementById('btn-qmdj-now');
    if (btnNow) {
      btnNow.onclick = () => {
        currentQmdjDate = new Date();
        renderQmdj();
      };
    }

    const btnSubmit = document.getElementById('btn-qmdj-submit');
    if (btnSubmit) {
      btnSubmit.onclick = () => {
        renderQmdj();
      };
    }

    // Hour steps: 2 hours per step (1 canh giờ)
    const btnPrev = document.getElementById('btn-qmdj-prev-hour');
    const btnNext = document.getElementById('btn-qmdj-next-hour');
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
