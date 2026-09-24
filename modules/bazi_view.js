/**
 * NETA LIGHT - BÁT TỰ MANH PHÁI VIEW MODULE
 * Giao diện Lập Lá Số Bát Tự Tứ Trụ, Thập Thần, Vòng Trường Sinh, Tàng Can,
 * Tương Tác Địa Chi, 12 Cung & 12 Thần Manh Phái, và 10 Bước Đại Vận.
 */

(function (global) {
  'use strict';

  let currentBaziDate = new Date();
  let currentIsMale = true;
  let currentStartAge = 3;
  let currentChartData = null;
  let selectedLuckStep = 1;

  function initBaziView() {
    const container = document.getElementById('view-bazi');
    if (!container) return;
    renderBazi();
  }

  function setDateAndRender(date, isMale = currentIsMale) {
    currentBaziDate = new Date(date);
    currentIsMale = isMale;
    renderBazi();
  }

  function computeBaziChart() {
    if (!global.NetaBaziEngine) {
      console.error("NetaBaziEngine not found!");
      return null;
    }
    try {
      const chart = global.NetaBaziEngine.buildBaziChart({
        solarDate: currentBaziDate,
        isMale: currentIsMale,
        startAge: currentStartAge
      });
      currentChartData = chart;
      return chart;
    } catch (e) {
      console.error("Error computing Bazi chart:", e);
      return null;
    }
  }

  function renderBazi() {
    const container = document.getElementById('view-bazi');
    if (!container) return;

    const chart = computeBaziChart();
    if (!chart) {
      container.innerHTML = `
        <div class="module-placeholder">
          <div class="placeholder-icon">📜</div>
          <h2 class="placeholder-title">LỖI KHỞI TẠO BÁT TỰ</h2>
          <p class="placeholder-desc">Không thể tính toán lá số cho thời điểm này. Vui lòng thử lại.</p>
        </div>
      `;
      return;
    }

    const { dayMaster, solarTerm, tuTru, interactions, mangPai, daYun, input } = chart;
    const pad = n => String(n).padStart(2, '0');
    const dStr = `${input.year}-${pad(input.month)}-${pad(input.day)}`;
    const timeFormatted = `${pad(input.hour)}:${pad(input.minute)} • ${pad(input.day)}/${pad(input.month)}/${input.year}`;

    const getWxClass = global.NetaBaziEngine.getWuXingColorClass;

    container.innerHTML = `
      <div class="bazi-view-container">
        <!-- Bazi Ultra-Compact Control Bar -->
        <div class="bazi-ctrl-bar">
          <div class="bazi-inputs-row">
            <!-- Direct Numeric Date -->
            <div class="numeric-date-row">
              <input type="number" id="bazi-input-day" class="num-box num-day" min="1" max="31" value="${input.day}" placeholder="Ngày" title="Nhập Ngày (1-31)">
              <span class="num-slash">/</span>
              <input type="number" id="bazi-input-month" class="num-box num-month" min="1" max="12" value="${input.month}" placeholder="Tháng" title="Nhập Tháng (1-12)">
              <span class="num-slash">/</span>
              <input type="number" id="bazi-input-year" class="num-box num-year" min="1900" max="2100" value="${input.year}" placeholder="Năm" title="Nhập Năm">
              <label class="btn-picker-cal" title="Chọn ngày trên lịch">
                📅
                <input type="date" id="bazi-date-picker" value="${dStr}" class="native-hidden-date">
              </label>
            </div>

            <!-- Time: Can Chi Select + Direct Numeric Hour & Minute -->
            <div class="numeric-time-row">
              <select id="bazi-select-canchi" class="select-canchi">
                <option value="0" ${[23, 0].includes(input.hour) ? 'selected' : ''}>Tý (23-01h)</option>
                <option value="2" ${[1, 2].includes(input.hour) ? 'selected' : ''}>Sửu (01-03h)</option>
                <option value="4" ${[3, 4].includes(input.hour) ? 'selected' : ''}>Dần (03-05h)</option>
                <option value="6" ${[5, 6].includes(input.hour) ? 'selected' : ''}>Mão (05-07h)</option>
                <option value="8" ${[7, 8].includes(input.hour) ? 'selected' : ''}>Thìn (07-09h)</option>
                <option value="10" ${[9, 10].includes(input.hour) ? 'selected' : ''}>Tỵ (09-11h)</option>
                <option value="12" ${[11, 12].includes(input.hour) ? 'selected' : ''}>Ngọ (11-13h)</option>
                <option value="14" ${[13, 14].includes(input.hour) ? 'selected' : ''}>Mùi (13-15h)</option>
                <option value="16" ${[15, 16].includes(input.hour) ? 'selected' : ''}>Thân (15-17h)</option>
                <option value="18" ${[17, 18].includes(input.hour) ? 'selected' : ''}>Dậu (17-19h)</option>
                <option value="20" ${[19, 20].includes(input.hour) ? 'selected' : ''}>Tuất (19-21h)</option>
                <option value="22" ${[21, 22].includes(input.hour) ? 'selected' : ''}>Hợi (21-23h)</option>
              </select>
              <input type="number" id="bazi-input-hour" class="num-box num-hour" min="0" max="23" value="${pad(input.hour)}" placeholder="Giờ" title="Nhập Giờ (0-23)">
              <span class="num-colon">:</span>
              <input type="number" id="bazi-input-minute" class="num-box num-min" min="0" max="59" value="${pad(input.minute)}" placeholder="Phút" title="Nhập Phút (0-59)">
            </div>

            <!-- Gender Toggle -->
            <button class="bazi-btn-gender ${currentIsMale ? 'gender-male' : 'gender-female'}" id="bazi-btn-gender" title="Chạm để đổi giới tính">
              ${currentIsMale ? '♂ Nam' : '♀ Nữ'}
            </button>
          </div>

          <div class="bazi-actions-row">
            <button class="bazi-btn-action bazi-btn-now" id="btn-bazi-now" title="Về thời điểm hiện tại">
              ⚡ Giờ thực
            </button>
            <button class="bazi-btn-action bazi-btn-submit" id="btn-bazi-submit" title="Lập lại Bát Tự">
              🔮 Lập Bát Tự
            </button>
          </div>
        </div>

        <!-- Master Overview Banner (Compact Slim) -->
        <div class="bazi-master-banner">
          <div class="bm-left">
            <div class="bm-daymaster-badge ${getWxClass(dayMaster.wx)}">
              <span class="bm-gan">${dayMaster.gan}</span>
              <span class="bm-wx">${dayMaster.wx}</span>
            </div>
            <div class="bm-details">
              <div class="bm-title">NHẬT CHỦ: <strong class="${getWxClass(dayMaster.wx)}">${dayMaster.gan} ${dayMaster.wx}</strong> • ${dayMaster.yinYang}</div>
              <div class="bm-birth">📅 ${timeFormatted} • ${currentIsMale ? 'Nam' : 'Nữ'} • Tiết Khí: <strong>${solarTerm}</strong> • Mệnh Cung: <strong>${mangPai.mengGong}</strong></div>
            </div>
          </div>
          <div class="bm-season-status">
            <span class="bm-season-tag ${dayMaster.seasonStatus.stateCode === 'VUONG' || dayMaster.seasonStatus.stateCode === 'TUONG' ? 'season-strong' : 'season-weak'}">
              ${dayMaster.seasonStatus.status}
            </span>
          </div>
        </div>

        <!-- 4 Pillars Grid (Tứ Trụ) -->
        <div class="bazi-section-card">
          <div class="bazi-card-title">
            <span>🏛️ TỨ TRỤ (BỐN CỘT MỆNH)</span>
            <span class="bazi-card-subtitle">Chạm từng cột xem phân tích chi tiết</span>
          </div>
          <div class="bazi-pillars-grid">
            ${tuTru.map((tru, idx) => `
              <div class="bazi-pillar-col ${idx === 2 ? 'is-daymaster-col' : ''}" data-pillar-idx="${idx}">
                <div class="bp-header">
                  <span class="bp-name">TRỤ ${tru.pillar.toUpperCase()}</span>
                  ${idx === 2 ? '<span class="bp-master-pill">Bản Mệnh</span>' : ''}
                </div>
                <div class="bp-body">
                  <!-- Thập thần can -->
                  <div class="bp-deity">${tru.deity}</div>
                  
                  <!-- Thiên Can -->
                  <div class="bp-gan ${getWxClass(tru.gan)}">${tru.gan}</div>
                  
                  <!-- Địa Chi -->
                  <div class="bp-zhi ${getWxClass(tru.zhi)}">${tru.zhi}</div>
                  
                  <!-- Vòng Trường Sinh -->
                  <div class="bp-changsheng">
                    <span class="cs-label">Trường Sinh:</span>
                    <strong class="cs-val">${tru.changSheng}</strong>
                  </div>

                  <!-- Tàng Can -->
                  <div class="bp-hidden-section">
                    <span class="hidden-title">Tàng Can:</span>
                    <div class="hidden-stems-list">
                      ${tru.hidden.map(h => `
                        <div class="hidden-stem-item">
                          <span class="h-stem ${getWxClass(h.gan)}">${h.gan}</span>
                          <span class="h-deity">${h.ten_god}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>

                  <!-- Nạp Âm -->
                  <div class="bp-napam">
                    <span class="napam-text">${tru.napAm}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Tương Tác Địa Chi Manh Phái -->
        <div class="bazi-section-card">
          <div class="bazi-card-title">
            <span>⚔️ TƯƠNG TÁC ĐỊA CHI (CỐT LÕI MANH PHÁI)</span>
            <span class="bazi-badge-count">${interactions.length} quan hệ</span>
          </div>
          <div class="bazi-interactions-container">
            ${interactions.length === 0 ? `
              <div class="bazi-empty-notice">Tứ trụ thanh thuần, không xuất hiện xung hại hay tương hình trực diện.</div>
            ` : `
              <div class="bazi-interactions-grid">
                ${interactions.map(item => `
                  <div class="bazi-interaction-card tag-${item.tag}">
                    <div class="bi-type">${item.type.toUpperCase()}</div>
                    <div class="bi-detail">${item.detail}</div>
                    <div class="bi-desc">${item.desc}</div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>

        <!-- 12 Cung & 12 Thần Manh Phái -->
        <div class="bazi-section-card">
          <div class="bazi-card-title">
            <span>🏰 12 CUNG & 12 THẦN MANH PHÁI</span>
            <span class="bazi-card-subtitle">Mệnh Cung an tại: <strong>${mangPai.mengGong}</strong></span>
          </div>
          <div class="bazi-palaces-grid">
            ${mangPai.palaces.map((p, pIdx) => {
              const spirit = mangPai.spirits[pIdx] ? mangPai.spirits[pIdx].than : '';
              return `
                <div class="bazi-palace-mini-card">
                  <div class="bpm-header">
                    <span class="bpm-name">${p.cung}</span>
                    <span class="bpm-zhi ${getWxClass(p.zhi)}">${p.zhi}</span>
                  </div>
                  <div class="bpm-spirit">
                    <span class="spirit-badge">${spirit}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 10 Bước Đại Vận -->
        <div class="bazi-section-card">
          <div class="bazi-card-title">
            <span>🚀 10 BƯỚC ĐẠI VẬN (${daYun.dir > 0 ? 'Thuận Hành' : 'Nghịch Hành'})</span>
            <span class="bazi-card-subtitle">Khởi vận từ <strong>${input.startAge}</strong> tuổi • Chạm để xem Lưu Niên</span>
          </div>
          <div class="bazi-dayun-scroll">
            ${daYun.results.map(lp => `
              <div class="bazi-dayun-item ${lp.step === selectedLuckStep ? 'active-dayun' : ''}" data-step="${lp.step}">
                <div class="lp-step-num">Vận ${lp.step}</div>
                <div class="lp-age-range">${lp.age} - ${lp.endAge} tuổi</div>
                <div class="lp-year-range">${lp.year}</div>
                <div class="lp-canchi">
                  <span class="lp-gan ${getWxClass(lp.gan)}">${lp.gan}</span>
                  <span class="lp-zhi ${getWxClass(lp.zhi)}">${lp.zhi}</span>
                </div>
                <div class="lp-deity">${lp.deity}</div>
                <div class="lp-changsheng">${lp.changSheng}</div>
                <div class="lp-napam">${lp.napAm}</div>
              </div>
            `).join('')}
          </div>

          <!-- Lưu Niên 10 Năm Của Đại Vận Được Chọn -->
          <div class="bazi-annual-section" id="bazi-annual-box">
            ${renderAnnualPillarsHTML(daYun.results.find(r => r.step === selectedLuckStep))}
          </div>
        </div>
      </div>

      <!-- Pillar Detail Modal -->
      <div class="modal-overlay" id="bazi-pillar-modal" style="display: none;">
        <div class="modal-dialog bazi-modal-dialog">
          <div class="guide-header">
            <h2 id="bazi-modal-title">🏛️ Chi Tiết Trụ</h2>
            <button class="modal-close" id="bazi-modal-close" aria-label="Đóng">&times;</button>
          </div>
          <div class="bazi-modal-body" id="bazi-modal-body">
            <!-- Dynamically populated -->
          </div>
        </div>
      </div>
    `;

    bindBaziEvents(chart);
  }

  function renderAnnualPillarsHTML(luckStep) {
    if (!luckStep || !luckStep.annualPillars || luckStep.annualPillars.length === 0) {
      return '<div class="annual-empty">Chưa có thông tin Lưu Niên.</div>';
    }

    const getWxClass = global.NetaBaziEngine.getWuXingColorClass;

    return `
      <div class="annual-wrapper">
        <div class="annual-header">
          <span>📅 LƯU NIÊN 10 NĂM: ĐẠI VẬN ${luckStep.canChi} (${luckStep.age} - ${luckStep.endAge} TUỔI)</span>
        </div>
        <div class="annual-grid">
          ${luckStep.annualPillars.map(ap => `
            <div class="annual-card">
              <div class="ac-year">${ap.year}</div>
              <div class="ac-age">${ap.age} tuổi</div>
              <div class="ac-canchi">
                <span class="${getWxClass(ap.gan)}">${ap.gan}</span>
                <span class="${getWxClass(ap.zhi)}">${ap.zhi}</span>
              </div>
              <div class="ac-deity">${ap.deity}</div>
              <div class="ac-napam">${ap.napAm}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function generateHourOptions(selectedHour) {
    const CHI_HOURS = [
      { name: 'Tý (23h - 01h)', hour: 0 },
      { name: 'Sửu (01h - 03h)', hour: 2 },
      { name: 'Dần (03h - 05h)', hour: 4 },
      { name: 'Mão (05h - 07h)', hour: 6 },
      { name: 'Thìn (07h - 09h)', hour: 8 },
      { name: 'Tỵ (09h - 11h)', hour: 10 },
      { name: 'Ngọ (11h - 13h)', hour: 12 },
      { name: 'Mùi (13h - 15h)', hour: 14 },
      { name: 'Thân (15h - 17h)', hour: 16 },
      { name: 'Dậu (17h - 19h)', hour: 18 },
      { name: 'Tuất (19h - 21h)', hour: 20 },
      { name: 'Hợi (21h - 23h)', hour: 22 }
    ];

    return CHI_HOURS.map(ch => {
      // Check if selectedHour falls into this range
      let isSel = false;
      if (ch.hour === 0) {
        isSel = selectedHour === 23 || selectedHour === 0;
      } else {
        isSel = selectedHour >= (ch.hour - 1) && selectedHour < (ch.hour + 1);
      }
      return `<option value="${ch.hour}" ${isSel ? 'selected' : ''}>${ch.name}</option>`;
    }).join('');
  }

  function bindBaziEvents(chart) {
    const pad = n => String(n).padStart(2, '0');

    // Sync elements
    const inputDay = document.getElementById('bazi-input-day');
    const inputMonth = document.getElementById('bazi-input-month');
    const inputYear = document.getElementById('bazi-input-year');
    const datePicker = document.getElementById('bazi-date-picker');
    const selectCanChi = document.getElementById('bazi-select-canchi');
    const inputHour = document.getElementById('bazi-input-hour');
    const inputMin = document.getElementById('bazi-input-minute');

    // Sync native datepicker -> numeric boxes
    if (datePicker) {
      datePicker.addEventListener('change', () => {
        if (!datePicker.value) return;
        const [y, m, d] = datePicker.value.split('-').map(Number);
        if (inputDay) inputDay.value = d;
        if (inputMonth) inputMonth.value = m;
        if (inputYear) inputYear.value = y;
      });
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

    // Gender toggle
    const btnGender = document.getElementById('bazi-btn-gender');
    if (btnGender) {
      btnGender.onclick = () => {
        currentIsMale = !currentIsMale;
        renderBazi();
      };
    }

    // Now button
    const btnNow = document.getElementById('btn-bazi-now');
    if (btnNow) {
      btnNow.onclick = () => {
        currentBaziDate = new Date();
        renderBazi();
      };
    }

    // Submit button
    const btnSubmit = document.getElementById('btn-bazi-submit');
    if (btnSubmit) {
      btnSubmit.onclick = () => {
        const d = Math.min(31, Math.max(1, parseInt(inputDay ? inputDay.value : 1) || 1));
        const m = Math.min(12, Math.max(1, parseInt(inputMonth ? inputMonth.value : 1) || 1));
        const y = Math.min(2100, Math.max(1900, parseInt(inputYear ? inputYear.value : 2026) || 2026));
        const h = Math.min(23, Math.max(0, parseInt(inputHour ? inputHour.value : 12) || 12));
        const min = Math.min(59, Math.max(0, parseInt(inputMin ? inputMin.value : 0) || 0));

        currentBaziDate = new Date(y, m - 1, d, h, min, 0);
        renderBazi();
      };
    }

    // Luck step selection (Đại Vận)
    const luckItems = document.querySelectorAll('.bazi-dayun-item[data-step]');
    luckItems.forEach(item => {
      item.onclick = () => {
        const step = parseInt(item.getAttribute('data-step'), 10);
        selectedLuckStep = step;
        luckItems.forEach(el => el.classList.remove('active-dayun'));
        item.classList.add('active-dayun');
        const annualBox = document.getElementById('bazi-annual-box');
        if (annualBox) {
          const target = chart.daYun.results.find(r => r.step === step);
          annualBox.innerHTML = renderAnnualPillarsHTML(target);
        }
      };
    });

    // Pillar click modal
    const pillarCols = document.querySelectorAll('.bazi-pillar-col[data-pillar-idx]');
    pillarCols.forEach(col => {
      col.onclick = () => {
        const idx = parseInt(col.getAttribute('data-pillar-idx'), 10);
        openPillarModal(chart, idx);
      };
    });

    // Modal Close
    const modalClose = document.getElementById('bazi-modal-close');
    const modal = document.getElementById('bazi-pillar-modal');
    if (modalClose && modal) {
      modalClose.onclick = () => { modal.style.display = 'none'; };
      modal.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
      };
    }
  }

  function openPillarModal(chart, idx) {
    const modal = document.getElementById('bazi-pillar-modal');
    const titleEl = document.getElementById('bazi-modal-title');
    const bodyEl = document.getElementById('bazi-modal-body');
    if (!modal || !bodyEl || !chart) return;

    const tru = chart.tuTru[idx];
    if (!tru) return;

    const PILLAR_DESCS = [
      {
        name: 'Trụ Năm (Tổ Nghiệp & Tiền Vận)',
        desc: 'Đại diện cho gốc rễ gia tiên, dòng họ, nền tảng phúc ấm của ông bà tổ tiên và giai đoạn từ 1 đến 16 tuổi.'
      },
      {
        name: 'Trụ Tháng (Cha Mẹ & Thời Thiếu Niên)',
        desc: 'Đại diện cho phụ mẫu, huynh đệ, môi trường trưởng thành, học hành khởi nghiệp và giai đoạn từ 17 đến 32 tuổi.'
      },
      {
        name: 'Trụ Ngày (Bản Mệnh & Vợ Chồng)',
        desc: 'Thiên Can là Nhật Chủ (bản thân người xem). Địa Chi là Cung Phu Thê (người phối ngẫu). Đại diện cho giai đoạn trung niên từ 33 đến 48 tuổi.'
      },
      {
        name: 'Trụ Giờ (Con Cái & Hậu Vận)',
        desc: 'Đại diện cho con cái, hậu bối, cấp dưới, thành tựu cuối đời, tài sản tích lũy và giai đoạn từ 49 tuổi trở về sau.'
      }
    ];

    const pMeta = PILLAR_DESCS[idx] || { name: `Trụ ${tru.pillar}`, desc: '' };
    titleEl.textContent = `🏛️ ${pMeta.name.toUpperCase()}`;

    bodyEl.innerHTML = `
      <div class="bazi-modal-content">
        <div class="bm-canchi-big">
          <span class="bm-gan-big">${tru.gan}</span>
          <span class="bm-zhi-big">${tru.zhi}</span>
          <span class="bm-napam-tag">${tru.napAm}</span>
        </div>

        <div class="bm-detail-box">
          <div class="bm-row"><strong>Thập Thần:</strong> <span class="text-gold">${tru.deity}</span></div>
          <div class="bm-row"><strong>Vòng Trường Sinh:</strong> ${tru.changSheng}</div>
          <div class="bm-row"><strong>Ngũ Hành Can Chi:</strong> Can ${tru.wxGan} • Chi ${tru.wxZhi}</div>
        </div>

        <div class="bm-hidden-box">
          <h4>🌱 CÁC CAN TÀNG TRONG ĐỊA CHI ${tru.zhi.toUpperCase()}:</h4>
          <div class="bm-hidden-list">
            ${tru.hidden.map(h => `
              <div class="bm-h-item">
                <span class="bm-h-gan">${h.gan} (${h.wx})</span>
                <span class="bm-h-deity">${h.ten_god}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="bm-role-box">
          <h4>📖 VAI TRÒ MỆNH LÝ CỦA TRỤ NÀY:</h4>
          <p>${pMeta.desc}</p>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  }

  // Export to global
  global.NetaBaziView = {
    init: initBaziView,
    render: renderBazi,
    setDate: setDateAndRender
  };

})(typeof window !== 'undefined' ? window : this);
