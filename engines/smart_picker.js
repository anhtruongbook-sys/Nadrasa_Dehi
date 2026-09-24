/**
 * NETA SMART PICKER (BỘ CHỌN NGÀY GIỜ SIÊU TỐC CHO CÁC MỐC THỜI GIAN XA)
 * Cung cấp giải pháp chọn ngày giờ tối ưu trải nghiệm trên di động:
 * 1. Nhập số trực tiếp với Tự động nhảy ô (Auto-advance Day -> Month -> Year -> Time).
 * 2. Nhận diện năm thông minh từ 2 chữ số (79 -> 1979, 05 -> 2005).
 * 3. Gọi Date/Time Picker mặc định của hệ điều hành (Android / iOS native showPicker).
 * 4. Bảng chọn Thập niên & Năm siêu tốc (Quick Decade & Year Jumper - 2 chạm đến mọi năm).
 * 5. Chuyển đổi linh hoạt DƯƠNG LỊCH <-> ÂM LỊCH (hỗ trợ người chỉ nhớ ngày sinh Âm).
 * 6. Đồng bộ 2 chiều Can Chi Giờ <-> Giờ : Phút.
 */
(function (global) {
  'use strict';

  // Can Chi Giờ chuẩn
  const CAN_CHI_HOURS = [
    { zhi: 'Tý', startH: 23, endH: 1, midH: 0, val: 0, label: 'Tý (23-01h)' },
    { zhi: 'Sửu', startH: 1, endH: 3, midH: 2, val: 2, label: 'Sửu (01-03h)' },
    { zhi: 'Dần', startH: 3, endH: 5, midH: 4, val: 4, label: 'Dần (03-05h)' },
    { zhi: 'Mão', startH: 5, endH: 7, midH: 6, val: 6, label: 'Mão (05-07h)' },
    { zhi: 'Thìn', startH: 7, endH: 9, midH: 8, val: 8, label: 'Thìn (07-09h)' },
    { zhi: 'Tỵ', startH: 9, endH: 11, midH: 10, val: 10, label: 'Tỵ (09-11h)' },
    { zhi: 'Ngọ', startH: 11, endH: 13, midH: 12, val: 12, label: 'Ngọ (11-13h)' },
    { zhi: 'Mùi', startH: 13, endH: 15, midH: 14, val: 14, label: 'Mùi (13-15h)' },
    { zhi: 'Thân', startH: 15, endH: 17, midH: 16, val: 16, label: 'Thân (15-17h)' },
    { zhi: 'Dậu', startH: 17, endH: 19, midH: 18, val: 18, label: 'Dậu (17-19h)' },
    { zhi: 'Tuất', startH: 19, endH: 21, midH: 20, val: 20, label: 'Tuất (19-21h)' },
    { zhi: 'Hợi', startH: 21, endH: 23, midH: 22, val: 22, label: 'Hợi (21-23h)' }
  ];

  // Các thập niên thông dụng
  const DECADES = [
    { label: '1940s', start: 1940 },
    { label: '1950s', start: 1950 },
    { label: '1960s', start: 1960 },
    { label: '1970s', start: 1970 },
    { label: '1980s', start: 1980 },
    { label: '1990s', start: 1990 },
    { label: '2000s', start: 2000 },
    { label: '2010s', start: 2010 },
    { label: '2020s', start: 2020 }
  ];

  // Helper tìm Can Chi theo giờ thực
  function getZhiByHour(hour) {
    const h = parseInt(hour, 10);
    if (isNaN(h)) return CAN_CHI_HOURS[0];
    if (h >= 23 || h < 1) return CAN_CHI_HOURS[0];
    for (let i = 1; i < CAN_CHI_HOURS.length; i++) {
      if (h >= CAN_CHI_HOURS[i].startH && h < CAN_CHI_HOURS[i].endH) {
        return CAN_CHI_HOURS[i];
      }
    }
    return CAN_CHI_HOURS[0];
  }

  // Tự động nhận diện 2 chữ số sang năm đầy đủ
  function parseSmartYear(rawYear) {
    const s = String(rawYear).trim();
    if (!s) return new Date().getFullYear();
    const val = parseInt(s, 10);
    if (isNaN(val)) return new Date().getFullYear();
    if (s.length <= 2) {
      // Quy tắc thế kỷ thông minh: > 30 là 19xx, <= 30 là 20xx
      return val > 30 ? 1900 + val : 2000 + val;
    }
    return val;
  }

  // Khởi tạo tính năng nhảy ô tự động (Auto-advance)
  function setupAutoAdvance(elements, onCommit) {
    const { dayInput, monthInput, yearInput, hourInput, minInput } = elements;

    if (dayInput) {
      dayInput.addEventListener('input', (e) => {
        let val = dayInput.value;
        if (val.length >= 2 || parseInt(val, 10) >= 4) {
          if (parseInt(val, 10) > 31) dayInput.value = '31';
          if (monthInput) {
            monthInput.focus();
            monthInput.select();
          }
        }
      });
      dayInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && monthInput) {
          monthInput.focus();
          monthInput.select();
        }
      });
    }

    if (monthInput) {
      monthInput.addEventListener('input', (e) => {
        let val = monthInput.value;
        if (val.length >= 2 || parseInt(val, 10) >= 2) {
          if (parseInt(val, 10) > 12) monthInput.value = '12';
          if (yearInput) {
            yearInput.focus();
            yearInput.select();
          }
        }
      });
      monthInput.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !monthInput.value && dayInput) {
          dayInput.focus();
        } else if (e.key === 'Enter' && yearInput) {
          yearInput.focus();
          yearInput.select();
        }
      });
    }

    if (yearInput) {
      yearInput.addEventListener('blur', () => {
        if (yearInput.value.length === 2) {
          yearInput.value = parseSmartYear(yearInput.value);
        }
      });
      yearInput.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !yearInput.value && monthInput) {
          monthInput.focus();
        } else if (e.key === 'Enter') {
          if (yearInput.value.length === 2) {
            yearInput.value = parseSmartYear(yearInput.value);
          }
          if (hourInput) {
            hourInput.focus();
            hourInput.select();
          } else if (onCommit) {
            onCommit();
          }
        }
      });
    }

    if (hourInput) {
      hourInput.addEventListener('input', () => {
        let val = hourInput.value;
        if (val.length >= 2 || parseInt(val, 10) >= 3) {
          if (parseInt(val, 10) > 23) hourInput.value = '23';
          if (minInput) {
            minInput.focus();
            minInput.select();
          }
        }
      });
      hourInput.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !hourInput.value && yearInput) {
          yearInput.focus();
        } else if (e.key === 'Enter' && minInput) {
          minInput.focus();
          minInput.select();
        }
      });
    }

    if (minInput) {
      minInput.addEventListener('input', () => {
        if (parseInt(minInput.value, 10) > 59) minInput.value = '59';
      });
      minInput.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !minInput.value && hourInput) {
          hourInput.focus();
        } else if (e.key === 'Enter' && onCommit) {
          onCommit();
        }
      });
    }
  }

  // Kết nối Date Picker mặc định của OS
  function setupNativeDatePicker(calBtn, nativeDateInput, onDateSelected) {
    if (!calBtn || !nativeDateInput) return;

    calBtn.addEventListener('click', (e) => {
      e.preventDefault();
      try {
        if (typeof nativeDateInput.showPicker === 'function') {
          nativeDateInput.showPicker();
        } else {
          nativeDateInput.focus();
          nativeDateInput.click();
        }
      } catch (err) {
        nativeDateInput.click();
      }
    });

    nativeDateInput.addEventListener('change', () => {
      const val = nativeDateInput.value; // YYYY-MM-DD
      if (val) {
        const parts = val.split('-');
        if (parts.length === 3) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          const d = parseInt(parts[2], 10);
          if (onDateSelected) {
            onDateSelected(d, m, y);
          }
        }
      }
    });
  }

  // Mở Modal Bảng Chọn Thập Niên & Năm Siêu Tốc (Quick Decade & Year Jumper)
  function openYearJumperModal(currentYear, onSelectYear) {
    let existingModal = document.getElementById('smart-year-modal');
    if (existingModal) existingModal.remove();

    const curY = parseInt(currentYear, 10) || new Date().getFullYear();
    const curDecadeStart = Math.floor(curY / 10) * 10;

    const modal = document.createElement('div');
    modal.id = 'smart-year-modal';
    modal.className = 'modal-overlay smart-year-overlay';
    modal.innerHTML = `
      <div class="modal-dialog smart-year-dialog">
        <div class="smart-year-header">
          <h3>⚡ Chọn Năm Siêu Tốc (1940 - 2030)</h3>
          <button class="modal-close" id="btn-close-year-modal">&times;</button>
        </div>
        <div class="smart-year-body">
          <div class="decade-selector-label">1. CHỌN THẬP NIÊN:</div>
          <div class="decade-chips-grid">
            ${DECADES.map(dec => `
              <button class="decade-chip ${dec.start === curDecadeStart ? 'active' : ''}" data-decade="${dec.start}">
                ${dec.label}
              </button>
            `).join('')}
          </div>

          <div class="decade-selector-label">2. CHỌN NĂM CỤ THỂ:</div>
          <div class="years-chips-grid" id="years-chips-grid">
            <!-- Render dynamically -->
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';

    function renderYears(decadeStart) {
      const grid = document.getElementById('years-chips-grid');
      if (!grid) return;
      let html = '';
      for (let y = decadeStart; y < decadeStart + 10; y++) {
        html += `
          <button class="year-chip ${y === curY ? 'active' : ''}" data-year="${y}">
            ${y}
          </button>
        `;
      }
      grid.innerHTML = html;

      grid.querySelectorAll('.year-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          const yr = parseInt(btn.getAttribute('data-year'), 10);
          modal.remove();
          if (onSelectYear) onSelectYear(yr);
        });
      });
    }

    renderYears(curDecadeStart);

    modal.querySelectorAll('.decade-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.decade-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const dec = parseInt(btn.getAttribute('data-decade'), 10);
        renderYears(dec);
      });
    });

    const closeBtn = document.getElementById('btn-close-year-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => modal.remove());
    }
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  // Export API
  global.NetaSmartPicker = {
    CAN_CHI_HOURS,
    DECADES,
    getZhiByHour,
    parseSmartYear,
    setupAutoAdvance,
    setupNativeDatePicker,
    openYearJumperModal
  };

})(typeof window !== 'undefined' ? window : this);
