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

  function renderBaziQMDJDestinyHTML(chart) {
    if (!chart || !global.JoeyYapQMDJEngine || !global.JoeyYapQMDJEngine.computeDestinyQiMen) {
      return '';
    }

    let destiny = null;
    try {
      destiny = global.JoeyYapQMDJEngine.computeDestinyQiMen(chart);
    } catch (e) {
      console.error("Lỗi tính toán Bản Mệnh Kỳ Môn:", e);
      return '';
    }

    if (!destiny || !destiny.life_palace) return '';

    const lp = destiny.life_palace;
    const yp = destiny.year_palace;

    const DEITY_ICONS = {
      'Trực Phù': '✨',
      'Đằng Xà': '🐍',
      'Thái Âm': '🌙',
      'Lục Hợp': '🤝',
      'Bạch Hổ': '🐯',
      'Câu Trần': '⚓',
      'Huyền Vũ': '🐢',
      'Chu Tước': '🦚',
      'Cửu Địa': '🌍',
      'Cửu Thiên': '🚀'
    };

    const deityIcon = DEITY_ICONS[lp.deity] || '🔮';

    return `
      <!-- 🔮 KỲ MÔN BẢN MỆNH (JOEY YAP DESTINY QI MEN) -->
      <div class="bazi-section-card bazi-qmdj-card" id="bazi-qmdj-card">
        <div class="bazi-card-title">
          <div class="bqc-title-left">
            <span>🔮 KỲ MÔN BẢN MỆNH (JOEY YAP LIFE PALACE)</span>
            <span class="bqc-badge-palace">${lp.palace_name} (${lp.direction} • ${lp.degrees})</span>
          </div>
          <button type="button" class="bqc-btn-lakinh" id="btn-bazi-open-lakinh" data-deg="${lp.center_deg}" data-dir="${lp.direction}" title="Mở La Kinh định vị phương vị Bản Mệnh">
            🧭 La Kinh
          </button>
        </div>

        <div class="bqc-main-grid">
          <!-- Cột Trái: Thần Hộ Mệnh Cá Nhân (Personal Guardian Deity) -->
          <div class="bqc-deity-box">
            <div class="bqc-box-header">
              <span class="bqc-icon">${deityIcon}</span>
              <div class="bqc-deity-titles">
                <div class="bqc-deity-name">${lp.deity} <span class="bqc-deity-en">(${lp.deity_en})</span></div>
                <div class="bqc-deity-role">${lp.deity_title}</div>
              </div>
            </div>

            <div class="bqc-prop-row">
              <span class="bqc-label">Năng lực Tiềm thức:</span>
              <span class="bqc-val">${lp.deity_power}</span>
            </div>

            <div class="bqc-prop-row bqc-affirmation-row">
              <span class="bqc-label">Khẩu quyết Kích hoạt:</span>
              <blockquote class="bqc-affirmation-quote">"${lp.deity_affirmation}"</blockquote>
            </div>

            <div class="bqc-prop-row">
              <span class="bqc-label">Lời khuyên Khai mở:</span>
              <span class="bqc-val bqc-advice">${lp.deity_advice}</span>
            </div>
          </div>

          <!-- Cột Phải: Bộ Ba Bản Mệnh (Cửu Tinh, Bát Môn & Cách Cục) -->
          <div class="bqc-details-box">
            <div class="bqc-detail-item">
              <div class="bqc-di-header">
                <span class="bqc-di-icon">⭐</span>
                <span class="bqc-di-title">Sao Bản Mệnh: <strong>${lp.star}</strong></span>
              </div>
              <p class="bqc-di-desc">${lp.star_intellect}</p>
            </div>

            <div class="bqc-detail-item">
              <div class="bqc-di-header">
                <span class="bqc-di-icon">🚪</span>
                <span class="bqc-di-title">Cửa Bản Mệnh: <strong>${lp.door}</strong></span>
              </div>
              <p class="bqc-di-desc">${lp.door_action}</p>
            </div>

            <div class="bqc-detail-item">
              <div class="bqc-di-header">
                <span class="bqc-di-icon">🛡️</span>
                <span class="bqc-di-title">Khí Cục & Can Tọa: <strong>${lp.heaven_stem} / ${lp.earth_stem}</strong></span>
              </div>
              <div class="bqc-formations-list">
                ${lp.formations && lp.formations.length > 0 ? lp.formations.map(f => `
                  <span class="bqc-formation-badge ${f.is_auspicious ? 'badge-auspicious' : 'badge-inauspicious'}" title="${f.description}">
                    ${f.is_auspicious ? '✨' : '⚠️'} ${f.name}
                  </span>
                `).join('') : '<span class="bqc-formation-neutral">Bình hòa, không phạm hình khắc trực xung.</span>'}
              </div>
            </div>

            <div class="bqc-detail-item bqc-social-item">
              <div class="bqc-di-header">
                <span class="bqc-di-icon">🌐</span>
                <span class="bqc-di-title">Cung Xã Hội (Can Năm): <strong>${yp.palace_name} (${yp.direction})</strong></span>
              </div>
              <p class="bqc-di-desc">Thần <strong>${yp.deity}</strong> • Môn <strong>${yp.door}</strong> • Tinh <strong>${yp.star}</strong> (Ảnh hưởng môi trường vĩ mô và uy tín cộng đồng).</p>
            </div>
          </div>
        </div>

        <!-- Thanh Hướng dẫn Tọa Lưng Đắc Khí -->
        <div class="bqc-compass-banner">
          <span class="bqc-cb-icon">🧘</span>
          <div class="bqc-cb-text">
            <strong>Phương vị Tọa Lưng Đắc Khí:</strong> Khi thiền định, lập chiến lược hoặc đối mặt quyết định trọng đại, hãy ngồi <strong>quay lưng về hướng ${lp.direction} (${lp.palace_name} • ${lp.degrees})</strong> để tiếp nhận trường khí bảo hộ mạnh nhất từ Thần Bản Mệnh ${lp.deity}.
          </div>
        </div>
      </div>
    `;
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

    const { dayMaster, solarTerm, solarTermStr, solarTermFullStr, tuTru, interactions, mangPai, daYun, input } = chart;
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
        <!-- Unified Control Card -->
        <div class="unified-ctrl-card">
          <!-- Row 1: Calendar switch & Date Box -->
          <div class="ucc-row ucc-row-date">
            <div class="ucc-pill-cal">
              <button type="button" class="ucc-pill-btn ${!isLunarMode ? 'active' : ''}" id="bazi-btn-solar">☀️ Dương</button>
              <button type="button" class="ucc-pill-btn ${isLunarMode ? 'active' : ''}" id="bazi-btn-lunar">🌙 Âm</button>
            </div>
            <div class="ucc-date-box" id="bazi-ucc-date-box" title="Nhập ngày tháng hoặc chạm vào dấu gạch/nút lịch để mở bảng chọn">
              <input type="number" id="bazi-input-day" class="num-box num-day" min="1" max="31" value="${displayDay}" placeholder="Ngày" title="Nhập Ngày (1-31)">
              <span class="num-slash">/</span>
              <input type="number" id="bazi-input-month" class="num-box num-month" min="1" max="12" value="${displayMonth}" placeholder="Tháng" title="Nhập Tháng (1-12)">
              <span class="num-slash">/</span>
              <input type="number" id="bazi-input-year" class="num-box num-year" min="1900" max="2100" value="${displayYear}" placeholder="Năm" title="Nhập Năm (gõ 2 số: 79 -> 1979)">
              <button type="button" class="ucc-btn-year" id="bazi-btn-quick-year" title="Bảng chọn Thập niên & Năm siêu tốc">⚡Năm</button>
              <label class="btn-picker-cal" id="bazi-btn-native-cal" title="Mở bảng chọn Ngày & Giờ (Hình 3)">
                📅
                <input type="datetime-local" id="bazi-date-picker" value="${dStr}T${pad(input.hour)}:${pad(input.minute)}" class="native-hidden-date">
              </label>
            </div>
          </div>

          <!-- Row 2: Can Chi + Numeric Time & Gender -->
          <div class="ucc-row ucc-row-time">
            <div class="ucc-time-box">
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
            <div class="ucc-pill-gender">
              <button type="button" class="ucc-gender-btn ${currentIsMale ? 'active male' : ''}" id="bazi-btn-male">♂ Nam</button>
              <button type="button" class="ucc-gender-btn ${!currentIsMale ? 'active female' : ''}" id="bazi-btn-female">♀ Nữ</button>
            </div>
          </div>

          <!-- Row 3: Actions (Giờ thực on left, Lập Bát Tự on right) -->
          <div class="ucc-row ucc-row-actions">
            <button class="ucc-btn-now" id="btn-bazi-now" title="Về thời điểm hiện tại">
              ⚡ Giờ thực
            </button>
            <button class="ucc-btn-submit" id="btn-bazi-submit" title="Lập lại Bát Tự">
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
              <div class="bm-birth">📅 ${timeFormatted} • ${currentIsMale ? 'Nam' : 'Nữ'} • Mệnh: <strong>${mangPai.mengGong}</strong></div>
            </div>
          </div>
          <div class="bm-season-status">
            <span class="bm-season-tag ${dayMaster.seasonStatus.stateCode === 'VUONG' || dayMaster.seasonStatus.stateCode === 'TUONG' ? 'season-strong' : 'season-weak'}" title="${dayMaster.seasonStatus.status}">
              <strong>${dayMaster.seasonStatus.status.split(' ')[0]}</strong><span class="bm-season-desc"> ${dayMaster.seasonStatus.status.includes('(') ? dayMaster.seasonStatus.status.slice(dayMaster.seasonStatus.status.indexOf('(')) : ''}</span>
            </span>
          </div>
        </div>

        <!-- Bát Tự Tiết Khí Info Strip -->
        <div class="bazi-term-strip">
          <span>🌿 Tiết Khí: <strong>${solarTerm}</strong></span>
          <span class="term-sep">•</span>
          <span>Chuyển tiết: <strong class="tk-exact-time">${chart.solarTermDetails ? chart.solarTermDetails.transition.formatted : (solarTermFullStr.includes('Chuyển: ') ? solarTermFullStr.split('Chuyển: ')[1].replace(')', '') : '')}</strong></span>
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

        <!-- 🔮 KỲ MÔN BẢN MỆNH (JOEY YAP DESTINY QI MEN) -->
        ${renderBaziQMDJDestinyHTML(chart)}

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
    const btnSubmit = document.getElementById('btn-bazi-submit');

    // Chuyển đổi Dương Lịch <-> Âm Lịch
    const btnSolar = document.getElementById('bazi-btn-solar');
    const btnLunar = document.getElementById('bazi-btn-lunar');
    if (btnSolar) {
      btnSolar.onclick = () => {
        if (isLunarMode) {
          isLunarMode = false;
          renderBazi();
        }
      };
    }
    if (btnLunar) {
      btnLunar.onclick = () => {
        if (!isLunarMode) {
          isLunarMode = true;
          renderBazi();
        }
      };
    }

    // Nút Chọn Năm Siêu Tốc (Decade & Year Jumper)
    const btnQuickYear = document.getElementById('bazi-btn-quick-year');
    if (btnQuickYear && inputYear) {
      btnQuickYear.onclick = (e) => {
        e.preventDefault();
        if (global.NetaSmartPicker) {
          global.NetaSmartPicker.openYearJumperModal(inputYear.value, (newYear) => {
            inputYear.value = newYear;
            if (btnSubmit) btnSubmit.click();
          });
        }
      };
    }

    // Tự động nhảy ô thông minh (Auto-advance) & Nhận diện năm 2 chữ số (79 -> 1979)
    if (global.NetaSmartPicker) {
      global.NetaSmartPicker.setupAutoAdvance({
        dayInput: inputDay,
        monthInput: inputMonth,
        yearInput: inputYear,
        hourInput: inputHour,
        minuteInput: inputMin,
        onSubmit: () => { if (btnSubmit) btnSubmit.click(); }
      });
      // Kết nối Date Picker gốc của hệ điều hành di động (datetime-local Hình 3)
      if (datePicker) {
        datePicker.addEventListener('change', () => {
          if (!datePicker.value) return;
          const [dPart, tPart] = datePicker.value.split('T');
          const [y, m, d] = dPart.split('-').map(Number);
          let h = 12, min = 0;
          if (tPart) {
            [h, min] = tPart.split(':').map(Number);
          }
          isLunarMode = false;
          if (inputDay) inputDay.value = d;
          if (inputMonth) inputMonth.value = m;
          if (inputYear) inputYear.value = y;
          if (inputHour) inputHour.value = pad(h);
          if (inputMin) inputMin.value = pad(min);

          if (selectCanChi && global.NetaSmartPicker) {
            const zhiObj = global.NetaSmartPicker.getZhiByHour(h);
            if (zhiObj) selectCanChi.value = String(zhiObj.val);
          }

          currentBaziDate = new Date(y, m - 1, d, h, min, 0);
          renderBazi();
        });

        const pickerLabel = document.getElementById('bazi-btn-native-cal');
        const dateBox = document.getElementById('bazi-ucc-date-box');

        const triggerWheelPicker = (e) => {
          if (e && e.target === datePicker) return;
          if (e) e.preventDefault();
          const curD = currentBaziDate;
          datePicker.value = `${curD.getFullYear()}-${pad(curD.getMonth() + 1)}-${pad(curD.getDate())}T${pad(curD.getHours())}:${pad(curD.getMinutes())}`;
          if (typeof datePicker.showPicker === 'function') {
            datePicker.showPicker();
          } else {
            datePicker.click();
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
    }

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
        if (global.NetaSmartPicker) {
          const zhiObj = global.NetaSmartPicker.getZhiByHour(h);
          if (zhiObj && selectCanChi) selectCanChi.value = String(zhiObj.val);
        }
      });
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
    if (btnSubmit) {
      btnSubmit.onclick = () => {
        let d = parseInt(inputDay ? inputDay.value : 1) || 1;
        let m = parseInt(inputMonth ? inputMonth.value : 1) || 1;
        let y = parseInt(inputYear ? inputYear.value : 2026) || 2026;
        if (inputYear && inputYear.value.length === 2 && global.NetaSmartPicker) {
          y = global.NetaSmartPicker.parseSmartYear(inputYear.value);
          inputYear.value = y;
        }
        const h = Math.min(23, Math.max(0, parseInt(inputHour ? inputHour.value : 12) || 12));
        const min = Math.min(59, Math.max(0, parseInt(inputMin ? inputMin.value : 0) || 0));

        // Nếu người dùng nhập ngày Âm lịch, tự động quy đổi sang Dương lịch
        if (isLunarMode && global.NetaCalendarEngine) {
          const solar = global.NetaCalendarEngine.lunar2Solar(d, m, y);
          if (solar) {
            d = solar.day;
            m = solar.month;
            y = solar.year;
          }
        }

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

    // Chuyển sang La Kinh và định vị góc Bản Mệnh
    // Chuyển sang La Kinh và định vị góc Bản Mệnh
    const btnLakinh = document.getElementById('btn-bazi-open-lakinh');
    if (btnLakinh) {
      btnLakinh.onclick = () => {
        if (typeof window.switchAppMode === 'function') {
          window.switchAppMode('lakinh');
        } else {
          const tabLakinh = document.getElementById('tab-mode-lakinh');
          if (tabLakinh) tabLakinh.click();
        }
      };
    }

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
