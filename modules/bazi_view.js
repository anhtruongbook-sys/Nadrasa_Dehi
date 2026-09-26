/**
 * NETA LIGHT - BÁT TỰ MANH PHÁI VIEW MODULE
 * Giao diện Lập Lá Số Bát Tự Tứ Trụ, Thập Thần, Vòng Trường Sinh, Tàng Can,
 * Tương Tác Địa Chi, 12 Cung & 12 Thần Manh Phái, và 10 Bước Đại Vận.
 */

(function (global) {
  'use strict';

  let currentBaziDate = new Date();
  let currentIsMale = true;
  let isLunarMode = false;
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

    const lunarObj = global.NetaCalendarEngine ? global.NetaCalendarEngine.solar2Lunar(input.day, input.month, input.year) : null;
    const displayDay = isLunarMode && lunarObj ? lunarObj.day : input.day;
    const displayMonth = isLunarMode && lunarObj ? lunarObj.month : input.month;
    const displayYear = isLunarMode && lunarObj ? lunarObj.year : input.year;

    const getWxClass = global.NetaBaziEngine.getWuXingColorClass;

    container.innerHTML = `
      <div class="bazi-view-container">
        <!-- Unified Control Card (Native Wheel Picker & Gender) -->
        <div class="unified-ctrl-card">
          <!-- Row 1: Birth Date display & Quick Native Picker -->
          <div class="ucc-row" style="justify-content: space-between; flex-wrap: wrap; gap: 6px;">
            <div class="ucc-date-display-badge" id="btn-bazi-badge" title="Chạm để mở vòng quay chọn ngày giờ sinh">
              <span>👶</span>
              <span class="solar-highlight">${pad(input.day)}/${pad(input.month)}/${input.year} ${pad(input.hour)}:${pad(input.minute)}</span>
              <span class="lunar-sub">(${lunarObj ? `ÂL: ${lunarObj.day}/${lunarObj.month}` : ''})</span>
            </div>
            <div style="display: flex; gap: 4px; align-items: center; flex-shrink: 0;">
              <button type="button" class="ucc-btn-now" id="btn-bazi-now" title="Về thời điểm hiện tại">🕒 Hiện Tại</button>
              <button type="button" class="ucc-btn-picker" id="btn-bazi-picker" title="Chọn ngày giờ sinh">📅 Chọn Giờ Sinh</button>
              <input type="datetime-local" id="bazi-hidden-datetime" style="position:fixed; top:-1000px; left:-1000px; opacity:0; pointer-events:none;" />
            </div>
          </div>

          <!-- Row 2: Gender & Lập Bát Tự -->
          <div class="ucc-row ucc-row-actions" style="justify-content: space-between; align-items: center;">
            <div class="ucc-pill-gender">
              <button type="button" class="ucc-gender-btn ${currentIsMale ? 'active male' : ''}" id="bazi-btn-male">♂ Nam</button>
              <button type="button" class="ucc-gender-btn ${!currentIsMale ? 'active female' : ''}" id="bazi-btn-female">♀ Nữ</button>
            </div>
            <button class="ucc-btn-submit" id="btn-bazi-submit" title="Lập lại Bát Tự">🔮 Lập Bát Tự</button>
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

    const pickerBtn = document.getElementById('btn-bazi-picker');
    const badgeBtn = document.getElementById('btn-bazi-badge');
    const hiddenInput = document.getElementById('bazi-hidden-datetime');

    const openPicker = () => {
      if (!hiddenInput) return;
      const d = currentBaziDate;
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
          isLunarMode = false;
          currentBaziDate = new Date(e.target.value);
          renderBazi();
        }
      };
    }

    // Gender toggle
    const btnMale = document.getElementById('bazi-btn-male');
    const btnFemale = document.getElementById('bazi-btn-female');
    if (btnMale) {
      btnMale.onclick = () => {
        if (!currentIsMale) {
          currentIsMale = true;
          renderBazi();
        }
      };
    }
    if (btnFemale) {
      btnFemale.onclick = () => {
        if (currentIsMale) {
          currentIsMale = false;
          renderBazi();
        }
      };
    }

    // Now button
    const btnNow = document.getElementById('btn-bazi-now');
    if (btnNow) {
      btnNow.onclick = () => {
        isLunarMode = false;
        currentBaziDate = new Date();
        renderBazi();
      };
    }

    // Submit button
    const btnSubmit = document.getElementById('btn-bazi-submit');
    if (btnSubmit) {
      btnSubmit.onclick = () => {
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
