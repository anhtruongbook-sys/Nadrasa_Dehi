/**
 * NETA LIGHT - CALENDAR VIEW MODULE (GIAO DIỆN LỊCH ÂM DƯƠNG THÁNG & NGÀY BLOC)
 * Tích hợp mượt mà vào #view-calendar với 2 chế độ:
 * 1. Chế độ Lịch Tháng (Monthly Grid 7xN)
 * 2. Chế độ Lịch Ngày (Daily Bloc Card)
 * Kèm hệ thống nút bấm 1 chạm liên kết sang Kỳ Môn, Bát Tự, Tử Vi, Bốc Bài.
 */

(function (global) {
  'use strict';

  let currentSelectedDate = new Date();
  let currentCalendarMode = 'month'; // 'month' or 'day'
  let isCalLunarMode = false;

  function initCalendarView() {
    const container = document.getElementById('view-calendar');
    if (!container) return;

    renderCalendar();
  }

  function renderCalendar() {
    const container = document.getElementById('view-calendar');
    if (!container) return;

    const y = currentSelectedDate.getFullYear();
    const m = currentSelectedDate.getMonth() + 1; // 1-12
    const d = currentSelectedDate.getDate();
    const pad = n => String(n).padStart(2, '0');

    const dayInfo = global.NetaCalendarEngine.getFullDayInfo(currentSelectedDate);

    container.innerHTML = `
      <div class="calendar-module-container">
        <!-- Top Calendar Navigation Bar (2 Clean Non-overflowing Rows) -->
        <div class="cal-top-bar">
          <div class="cal-top-row-1">
            <div class="cal-mode-toggle">
              <button class="cal-btn-tab ${currentCalendarMode === 'month' ? 'active' : ''}" id="btn-cal-tab-month">
                📅 Tháng
              </button>
              <button class="cal-btn-tab ${currentCalendarMode === 'day' ? 'active' : ''}" id="btn-cal-tab-day">
                📆 Ngày
              </button>
            </div>
            <div class="ucc-pill-cal">
              <button type="button" class="ucc-pill-btn ${!isCalLunarMode ? 'active' : ''}" id="btn-cal-solar">☀️ Dương</button>
              <button type="button" class="ucc-pill-btn ${isCalLunarMode ? 'active' : ''}" id="btn-cal-lunar">🌙 Âm</button>
            </div>
            <button class="cal-btn-today" id="btn-cal-today" title="Về hôm nay">
              ⚡ Hôm nay
            </button>
          </div>
          <div class="cal-top-row-2">
            <div class="ucc-date-box" id="cal-ucc-date-box" title="Nhập ngày tháng hoặc chạm vào dấu gạch/nút lịch để mở bảng chọn">
              <input type="number" id="cal-jump-day" class="num-box num-day" min="1" max="31" value="${isCalLunarMode ? dayInfo.lunar.day : d}" placeholder="Ngày" title="Nhập Ngày">
              <span class="num-slash">/</span>
              <input type="number" id="cal-jump-month" class="num-box num-month" min="1" max="12" value="${isCalLunarMode ? dayInfo.lunar.month : m}" placeholder="Tháng" title="Nhập Tháng">
              <span class="num-slash">/</span>
              <input type="number" id="cal-jump-year" class="num-box num-year" min="1900" max="2100" value="${isCalLunarMode ? dayInfo.lunar.year : y}" placeholder="Năm" title="Nhập Năm">
              <button type="button" class="ucc-btn-year" id="btn-cal-year-jumper" title="Chọn nhanh thập niên & năm">⚡Năm</button>
              <label class="btn-picker-cal" id="cal-btn-native-cal" title="Mở bảng chọn Ngày (Hình 3)">
                📅
                <input type="datetime-local" id="cal-native-picker" value="${y}-${pad(m)}-${pad(d)}T12:00" class="native-hidden-date">
              </label>
            </div>
            <button class="cal-btn-jump" id="btn-cal-jump" title="Đến ngày">🚀 Xem</button>
          </div>
        </div>

        <!-- Navigation Bar -->
        <div class="cal-month-nav">
          <button class="cal-nav-arrow" id="btn-cal-prev" title="${currentCalendarMode === 'month' ? 'Tháng trước' : 'Ngày trước'}">◀</button>
          <div class="cal-nav-title">
            <span class="cal-nav-solar">${currentCalendarMode === 'month' ? `THÁNG ${m} / ${y}` : `NGÀY ${d} THÁNG ${m} / ${y}`}</span>
            <span class="cal-nav-lunar">${currentCalendarMode === 'month' ? `Năm ${dayInfo.canChi.year} (${dayInfo.canChi.yearNapAm})` : `Ngày ${dayInfo.canChi.day} (${dayInfo.canChi.dayNapAm}) • ${dayInfo.solarTermStr || dayInfo.solarTerm}`}</span>
          </div>
          <button class="cal-nav-arrow" id="btn-cal-next" title="${currentCalendarMode === 'month' ? 'Tháng sau' : 'Ngày sau'}">▶</button>
        </div>

        <!-- View Body -->
        <div class="cal-body">
          ${currentCalendarMode === 'month' ? renderMonthGridHTML(y, m, d) : renderDayBlocHTML(dayInfo)}
        </div>
      </div>
    `;

    bindCalendarEvents(y, m);
  }

  function renderMonthGridHTML(year, month, selectedDay) {
    const matrix = global.NetaCalendarEngine.getMonthMatrix(year, month);
    const dayHeaders = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    let html = `
      <div class="cal-month-wrapper">
        <div class="cal-grid-header">
          ${dayHeaders.map((dh, idx) => `<div class="cal-header-cell ${idx === 6 ? 'sunday' : ''}">${dh}</div>`).join('')}
        </div>
        <div class="cal-grid-body">
    `;

    matrix.forEach(week => {
      week.forEach((cell, idx) => {
        if (!cell) {
          html += `<div class="cal-cell empty"></div>`;
        } else {
          const isToday = isSameDay(new Date(cell.solarYear, cell.solarMonth - 1, cell.solarDay), new Date());
          const isSelected = cell.solarDay === selectedDay;
          const isSunday = idx === 6;
          const isSpecial = cell.isSpecial; // Mùng 1 hoặc Rằm

          html += `
            <div class="cal-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isSunday ? 'sunday' : ''}" data-day="${cell.solarDay}">
              <div class="cal-solar-num">${cell.solarDay}</div>
              <div class="cal-lunar-num ${isSpecial ? 'special-lunar' : ''}">
                ${cell.lunarDay === 1 ? `${cell.lunarDay}/${cell.lunarMonth}` : cell.lunarDay}
              </div>
              ${cell.isHoangDao ? `<span class="cal-dot-hd" title="Hoàng Đạo"></span>` : ''}
              ${isSpecial ? `<span class="cal-dot-special" title="${cell.lunarDay === 1 ? 'Mùng 1' : 'Rằm'}"></span>` : ''}
            </div>
          `;
        }
      });
    });

    html += `
        </div>
      </div>

      <!-- Quick Day Summary Panel below Month Grid -->
      <div class="cal-quick-summary" id="cal-quick-summary">
        ${renderQuickDaySummaryHTML(currentSelectedDate)}
      </div>
    `;

    return html;
  }

  function renderQuickDaySummaryHTML(date) {
    const info = global.NetaCalendarEngine.getFullDayInfo(date);
    return `
      <div class="quick-summary-card">
        <div class="qs-header">
          <div class="qs-solar">${info.solar.dayOfWeek}, ${info.solar.dateStr}</div>
          <div class="qs-badge ${info.hoangDao.isHoangDao ? 'badge-hd' : 'badge-hac'}">${info.hoangDao.label} (${info.hoangDao.spiritName})</div>
        </div>
        <div class="qs-lunar-row">
          <span class="qs-lunar-text">Âm lịch: <strong>Ngày ${info.lunar.day} tháng ${info.lunar.month}${info.lunar.isLeap ? ' (Nhuận)' : ''}</strong></span>
          <span class="qs-term-text" title="${info.solarTermFullStr || ''}">🌿 ${info.solarTermStr || info.solarTerm}</span>
        </div>
        <div class="qs-canchi-grid">
          <div><small>Năm:</small> <strong>${info.canChi.year}</strong></div>
          <div><small>Tháng:</small> <strong>${info.canChi.month}</strong></div>
          <div><small>Ngày:</small> <strong>${info.canChi.day}</strong></div>
          <div><small>Trực:</small> <strong>${info.truc.name}</strong></div>
        </div>
        <!-- 1-Tap Quick Action Row -->
        <div class="qs-actions">
          <button class="cal-action-btn btn-view-bloc" id="btn-view-bloc-detail">
            📖 Chi tiết ngày
          </button>
          <button class="cal-action-btn btn-launch-qmdj" data-action="qmdj">
            🔮 Kỳ Môn
          </button>
          <button class="cal-action-btn btn-launch-bazi" data-action="bazi">
            📜 Bát Tự
          </button>
          <button class="cal-action-btn btn-launch-tuvi" data-action="tuvi">
            🌌 Tử Vi
          </button>
        </div>
      </div>
    `;
  }

  function renderDayBlocHTML(info) {
    return `
      <div class="cal-bloc-card">
        <!-- Bloc Header -->
        <div class="bloc-top">
          <button class="btn-back-to-month" id="btn-back-month" title="Quay lại lịch tháng">‹ Lịch Tháng</button>
          <div class="bloc-header-info">
            <div class="bloc-weekday">${info.solar.dayOfWeek}</div>
            <div class="bloc-solar-month">Tháng ${info.solar.month} Năm ${info.solar.year}</div>
          </div>
        </div>

        <!-- Big Solar Day Number -->
        <div class="bloc-center-solar">
          <div class="bloc-big-num">${info.solar.day}</div>
          <div class="bloc-hoang-dao-badge ${info.hoangDao.isHoangDao ? 'badge-hd' : 'badge-hac'}">
            ${info.hoangDao.label} • ${info.hoangDao.spiritName}
          </div>
        </div>

        <!-- Lunar Date Banner -->
        <div class="bloc-lunar-banner">
          <div class="bloc-lunar-main">
            Ngày <strong>${info.lunar.day}</strong> Tháng <strong>${info.lunar.month}</strong> ${info.lunar.isLeap ? '(Nhuận)' : ''}
          </div>
          <div class="bloc-lunar-sub" title="${info.solarTermFullStr || ''}">Năm ${info.canChi.year} • Tiết ${info.solarTermStr || info.solarTerm}</div>
        </div>

        <!-- Tứ Trụ Can Chi & Nạp Âm -->
        <div class="bloc-pillars-box">
          <div class="pillar-item">
            <span class="pillar-label">NĂM</span>
            <span class="pillar-val">${info.canChi.year}</span>
            <span class="pillar-napam">${info.canChi.yearNapAm}</span>
          </div>
          <div class="pillar-item">
            <span class="pillar-label">THÁNG</span>
            <span class="pillar-val">${info.canChi.month}</span>
            <span class="pillar-napam">${info.canChi.monthNapAm}</span>
          </div>
          <div class="pillar-item highlight-day">
            <span class="pillar-label">NGÀY</span>
            <span class="pillar-val">${info.canChi.day}</span>
            <span class="pillar-napam">${info.canChi.dayNapAm}</span>
          </div>
        </div>

        <!-- Trực & 28 Tú -->
        <div class="bloc-metaphysics-grid">
          <div class="meta-box">
            <div class="meta-title">🌿 THẬP NHỊ TRỰC</div>
            <div class="meta-highlight">Trực ${info.truc.name} (${info.truc.type === 'cat' ? 'Đại Cát' : (info.truc.type === 'hung' ? 'Hung' : 'Bình')})</div>
            <div class="meta-desc"><strong>Nên:</strong> ${info.truc.good}</div>
            <div class="meta-desc"><strong>Kiêng:</strong> ${info.truc.bad}</div>
          </div>
          <div class="meta-box">
            <div class="meta-title">⭐ NHỊ THẬP BÁT TÚ</div>
            <div class="meta-highlight">Sao ${info.mansion.name} (${info.mansion.animal})</div>
            <div class="meta-desc">${info.mansion.desc}</div>
          </div>
        </div>

        <!-- Giờ Hoàng Đạo -->
        <div class="bloc-hours-box">
          <div class="hours-title">✨ GIỜ HOÀNG ĐẠO TRONG NGÀY</div>
          <div class="hours-chips">
            ${info.goodHours.map(gh => `<span class="hour-chip"><strong>${gh.zhi}</strong> (${gh.range})</span>`).join('')}
          </div>
        </div>

        <!-- 1-Tap Quick Action Row -->
        <div class="bloc-actions-row">
          <button class="cal-action-btn btn-launch-qmdj" data-action="qmdj">
            🔮 Lập Kỳ Môn
          </button>
          <button class="cal-action-btn btn-launch-bazi" data-action="bazi">
            📜 Lập Bát Tự
          </button>
          <button class="cal-action-btn btn-launch-tuvi" data-action="tuvi">
            🌌 Lập Tử Vi
          </button>
          <button class="cal-action-btn btn-launch-cards" data-action="neta">
            🪷 Bốc Bài
          </button>
        </div>
      </div>
    `;
  }

  function bindCalendarEvents(year, month) {
    // Mode toggles
    const btnTabMonth = document.getElementById('btn-cal-tab-month');
    const btnTabDay = document.getElementById('btn-cal-tab-day');
    const btnToday = document.getElementById('btn-cal-today');

    if (btnTabMonth) {
      btnTabMonth.onclick = () => {
        currentCalendarMode = 'month';
        renderCalendar();
      };
    }
    if (btnTabDay) {
      btnTabDay.onclick = () => {
        currentCalendarMode = 'day';
        renderCalendar();
      };
    }
    if (btnToday) {
      btnToday.onclick = () => {
        currentSelectedDate = new Date();
        renderCalendar();
      };
    }

    // Jump button (Direct numeric date)
    const btnJump = document.getElementById('btn-cal-jump');
    const inputDay = document.getElementById('cal-jump-day');
    const inputMonth = document.getElementById('cal-jump-month');
    const inputYear = document.getElementById('cal-jump-year');
    const nativePicker = document.getElementById('cal-native-picker');
    const btnYearJumper = document.getElementById('btn-cal-year-jumper');
    const btnSolar = document.getElementById('btn-cal-solar');
    const btnLunar = document.getElementById('btn-cal-lunar');

    if (btnSolar) {
      btnSolar.onclick = () => {
        if (isCalLunarMode) {
          isCalLunarMode = false;
          renderCalendar();
        }
      };
    }
    if (btnLunar) {
      btnLunar.onclick = () => {
        if (!isCalLunarMode) {
          isCalLunarMode = true;
          renderCalendar();
        }
      };
    }

    if (btnJump) {
      btnJump.onclick = () => {
        const d = Math.min(31, Math.max(1, parseInt(inputDay ? inputDay.value : 1) || 1));
        const m = Math.min(12, Math.max(1, parseInt(inputMonth ? inputMonth.value : 1) || 1));
        let rawYear = parseInt(inputYear ? inputYear.value : 2026) || 2026;
        if (global.NetaSmartPicker && rawYear < 100) {
          rawYear = global.NetaSmartPicker.parseSmartYear(rawYear);
          if (inputYear) inputYear.value = rawYear;
        }
        const y = Math.min(2100, Math.max(1900, rawYear));

        if (isCalLunarMode && global.NetaCalendarEngine && global.NetaCalendarEngine.lunar2Solar) {
          const solar = global.NetaCalendarEngine.lunar2Solar(d, m, y, false, 7);
          currentSelectedDate = new Date(solar.year, solar.month - 1, solar.day);
        } else {
          currentSelectedDate = new Date(y, m - 1, d);
        }
        renderCalendar();
      };
    }

    // Native picker support (datetime-local Hình 3)
    if (nativePicker) {
      nativePicker.addEventListener('change', () => {
        if (!nativePicker.value) return;
        const [dPart] = nativePicker.value.split('T');
        const [py, pm, pd] = dPart.split('-').map(Number);
        isCalLunarMode = false;
        currentSelectedDate = new Date(py, pm - 1, pd);
        renderCalendar();
      });

      const pickerLabel = document.getElementById('cal-btn-native-cal');
      const dateBox = document.getElementById('cal-ucc-date-box');

      const triggerWheelPicker = (e) => {
        if (e && e.target === nativePicker) return;
        if (e) e.preventDefault();
        const curD = currentSelectedDate;
        nativePicker.value = `${curD.getFullYear()}-${pad(curD.getMonth() + 1)}-${pad(curD.getDate())}T12:00`;
        if (typeof nativePicker.showPicker === 'function') {
          nativePicker.showPicker();
        } else {
          nativePicker.click();
        }
      };

      if (pickerLabel) {
        pickerLabel.onclick = triggerWheelPicker;
      }
      if (dateBox) {
        dateBox.addEventListener('click', (e) => {
          // Bấm vào khoảng trống/dấu slash '/' thì mở bảng chọn ngày giờ như hình 3
          if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
            triggerWheelPicker(e);
          }
        });
      }
    }

    // Smart auto-advance and decade jumper
    if (global.NetaSmartPicker) {
      global.NetaSmartPicker.setupAutoAdvance({
        dayInput: inputDay,
        monthInput: inputMonth,
        yearInput: inputYear,
        onSubmit: () => {
          if (btnJump) btnJump.click();
        }
      });

      if (btnYearJumper && inputYear) {
        btnYearJumper.onclick = () => {
          const curY = parseInt(inputYear.value) || currentSelectedDate.getFullYear();
          global.NetaSmartPicker.openYearJumperModal(curY, (selectedYear) => {
            inputYear.value = selectedYear;
            if (btnJump) btnJump.click();
          });
        };
      }
    }

    // Prev / Next Month
    const btnPrev = document.getElementById('btn-cal-prev');
    const btnNext = document.getElementById('btn-cal-next');

    if (btnPrev) {
      btnPrev.onclick = () => {
        if (currentCalendarMode === 'month') {
          currentSelectedDate = new Date(year, month - 2, 1);
        } else {
          currentSelectedDate = new Date(currentSelectedDate.getTime() - 86400000);
        }
        renderCalendar();
      };
    }
    if (btnNext) {
      btnNext.onclick = () => {
        if (currentCalendarMode === 'month') {
          currentSelectedDate = new Date(year, month, 1);
        } else {
          currentSelectedDate = new Date(currentSelectedDate.getTime() + 86400000);
        }
        renderCalendar();
      };
    }

    // Cell clicks in Month grid -> Switch directly to Day Bloc
    const cells = document.querySelectorAll('.cal-cell:not(.empty)');
    cells.forEach(cell => {
      cell.onclick = () => {
        const day = parseInt(cell.getAttribute('data-day'));
        currentSelectedDate = new Date(year, month - 1, day);
        currentCalendarMode = 'day';
        renderCalendar();
      };
    });

    // Back to Month button from Day Bloc
    const btnBackMonth = document.getElementById('btn-back-month');
    if (btnBackMonth) {
      btnBackMonth.onclick = () => {
        currentCalendarMode = 'month';
        renderCalendar();
      };
    }

    // View Bloc Detail button
    const btnViewBloc = document.getElementById('btn-view-bloc-detail');
    if (btnViewBloc) {
      btnViewBloc.onclick = () => {
        currentCalendarMode = 'day';
        renderCalendar();
      };
    }

    // Launch chart actions
    const actionBtns = document.querySelectorAll('.cal-action-btn[data-action]');
    actionBtns.forEach(btn => {
      btn.onclick = () => {
        const targetMode = btn.getAttribute('data-action');
        if (targetMode === 'bazi' && global.NetaBaziView && typeof global.NetaBaziView.setDate === 'function') {
          global.NetaBaziView.setDate(currentSelectedDate);
        } else if (targetMode === 'qmdj' && global.NetaQMDJView && typeof global.NetaQMDJView.setDate === 'function') {
          global.NetaQMDJView.setDate(currentSelectedDate);
        } else if (targetMode === 'tuvi' && global.NetaTuViView && typeof global.NetaTuViView.setDate === 'function') {
          global.NetaTuViView.setDate(currentSelectedDate);
        }
        if (typeof global.switchAppMode === 'function') {
          global.switchAppMode(targetMode);
        }
      };
    });
  }

  function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  // Export to global
  global.NetaCalendarView = {
    init: initCalendarView,
    render: renderCalendar,
    getSelectedDate: () => currentSelectedDate
  };

})(typeof window !== 'undefined' ? window : this);
