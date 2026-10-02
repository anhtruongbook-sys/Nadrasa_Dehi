/**
 * NETA LIGHT - MODULE GIAO DIỆN CHIÊM ĐOÁN XUYÊN TAM THỨC
 * (Cross-System Tam Thuc Divination View Module: Thái Ất - Kỳ Môn - Lục Nhâm)
 * File: modules/tam_thuc_view.js
 * 
 * Tính năng chính:
 * 1. Bộ điều khiển thời gian đồng bộ UCC (Unified Control Card).
 * 2. Lưới 12 Lĩnh vực then chốt (D01 - D12) + Ô nhập câu hỏi tự động nhận diện domain.
 * 3. Bộ chọn vị thế (Chủ vs Khách).
 * 4. Dashboard SVG Native:
 *    - Biểu đồ Radar Tam Tài 3 Trục (Thái Ất, Kỳ Môn, Lục Nhâm).
 *    - Đồng hồ đo Chỉ số Đồng thuận C_3T (Consensus Gauge).
 * 5. Ba thẻ tóm lược Thiên Thời - Địa Lợi - Nhân Sự.
 * 6. Báo cáo chiến lược 5 tầng (Layer 1 - 5) chuẩn mực hành chính - kỹ thuật.
 * 7. Nút sao chép Markdown và liên kết trực tiếp tới các phân hệ chuyên sâu.
 */

(function (global) {
  'use strict';

  let currentDate = new Date();
  let currentDomainCode = 'D01';
  let currentRole = 'Chủ';
  let currentQuery = '';
  let currentReport = null;

  // Trợ giúp định dạng ngày giờ
  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function formatDisplayDate(d) {
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Khởi tạo và tính toán báo cáo
  function computeReport() {
    if (!global.NetaTamThucEngine) {
      console.error("NetaTamThucEngine chưa sẵn sàng!");
      return null;
    }
    try {
      const q = currentQuery.trim();
      let targetDomain = currentDomainCode;
      if (q && global.NetaTamThucEngine.detectDomainFromQuery) {
        const detected = global.NetaTamThucEngine.detectDomainFromQuery(q);
        if (detected && detected.code) {
          targetDomain = detected.code;
          currentDomainCode = targetDomain;
        }
      }
      currentReport = global.NetaTamThucEngine.synthesizeTamThuc(currentDate, targetDomain, currentRole, { query: q });
      if (currentReport && currentReport.domain_code) {
        currentDomainCode = currentReport.domain_code;
      }
      return currentReport;
    } catch (e) {
      console.error("Lỗi khi lập báo cáo Tam Thức:", e);
      return null;
    }
  }

  // --- RENDER SVG RADAR CHART (Tam Tài 3 Trục) ---
  function renderSvgRadar(sTa, sKm, sLn, wTa, wKm, wLn) {
    const size = 260;
    const cx = size / 2;
    const cy = size / 2 + 10;
    const maxR = 90;

    // 3 góc cho 3 trục (Đỉnh trên: Thái Ất, Dưới phải: Kỳ Môn, Dưới trái: Lục Nhâm)
    const angles = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];

    function getCoords(r, angle) {
      return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle)
      };
    }

    // Grid các mức 25, 50, 75, 100
    const gridLevels = [25, 50, 75, 100];
    let gridSvg = '';
    gridLevels.forEach(lvl => {
      const r = (lvl / 100) * maxR;
      const pts = angles.map(a => {
        const pt = getCoords(r, a);
        return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
      }).join(' ');
      const strokeColor = lvl === 100 ? 'rgba(217, 119, 6, 0.45)' : 'rgba(255, 255, 255, 0.12)';
      gridSvg += `<polygon points="${pts}" fill="none" stroke="${strokeColor}" stroke-width="${lvl === 100 ? 1.5 : 1}" stroke-dasharray="${lvl === 100 ? 'none' : '3,3'}" />`;
    });

    // 3 Trục tỏa ra
    let axesSvg = '';
    angles.forEach(a => {
      const end = getCoords(maxR, a);
      axesSvg += `<line x1="${cx}" y1="${cy}" x2="${end.x.toFixed(1)}" y2="${end.y.toFixed(1)}" stroke="rgba(255, 255, 255, 0.2)" stroke-width="1.2" />`;
    });

    // Tọa độ 3 đỉnh dữ liệu
    const rTa = Math.min(100, Math.max(0, sTa)) / 100 * maxR;
    const rKm = Math.min(100, Math.max(0, sKm)) / 100 * maxR;
    const rLn = Math.min(100, Math.max(0, sLn)) / 100 * maxR;

    const ptTa = getCoords(rTa, angles[0]);
    const ptKm = getCoords(rKm, angles[1]);
    const ptLn = getCoords(rLn, angles[2]);
    const polygonPts = `${ptTa.x.toFixed(1)},${ptTa.y.toFixed(1)} ${ptKm.x.toFixed(1)},${ptKm.y.toFixed(1)} ${ptLn.x.toFixed(1)},${ptLn.y.toFixed(1)}`;

    // Nhãn 3 góc
    const posTa = getCoords(maxR + 24, angles[0]);
    const posKm = getCoords(maxR + 28, angles[1]);
    const posLn = getCoords(maxR + 28, angles[2]);

    return `
      <svg class="tamthuc-radar-svg" viewBox="0 0 ${size} ${size}" width="100%" height="220" style="overflow: visible;">
        <defs>
          <linearGradient id="tamthuc-radar-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.45" />
            <stop offset="50%" stop-color="#38bdf8" stop-opacity="0.4" />
            <stop offset="100%" stop-color="#10b981" stop-opacity="0.45" />
          </linearGradient>
          <filter id="radar-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- Grids & Axes -->
        ${gridSvg}
        ${axesSvg}

        <!-- Filled Data Polygon -->
        <polygon points="${polygonPts}" fill="url(#tamthuc-radar-grad)" stroke="#f59e0b" stroke-width="2.5" filter="url(#radar-glow)" />

        <!-- Marker Points -->
        <circle cx="${ptTa.x.toFixed(1)}" cy="${ptTa.y.toFixed(1)}" r="4.5" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5" />
        <circle cx="${ptKm.x.toFixed(1)}" cy="${ptKm.y.toFixed(1)}" r="4.5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />
        <circle cx="${ptLn.x.toFixed(1)}" cy="${ptLn.y.toFixed(1)}" r="4.5" fill="#10b981" stroke="#ffffff" stroke-width="1.5" />

        <!-- Labels -->
        <text x="${posTa.x.toFixed(1)}" y="${posTa.y.toFixed(1)}" text-anchor="middle" class="radar-label radar-ta">
          <tspan x="${posTa.x.toFixed(1)}" dy="-4" font-weight="700">☀️ Thái Ất (${(wTa * 100).toFixed(0)}%)</tspan>
          <tspan x="${posTa.x.toFixed(1)}" dy="14" fill="#f59e0b" font-weight="800">${sTa.toFixed(1)}đ</tspan>
        </text>

        <text x="${posKm.x.toFixed(1)}" y="${posKm.y.toFixed(1)}" text-anchor="start" class="radar-label radar-km">
          <tspan x="${posKm.x.toFixed(1) - 10}" dy="-2" font-weight="700">🔮 Kỳ Môn (${(wKm * 100).toFixed(0)}%)</tspan>
          <tspan x="${posKm.x.toFixed(1) - 10}" dy="14" fill="#38bdf8" font-weight="800">${sKm.toFixed(1)}đ</tspan>
        </text>

        <text x="${posLn.x.toFixed(1)}" y="${posLn.y.toFixed(1)}" text-anchor="end" class="radar-label radar-ln">
          <tspan x="${posLn.x.toFixed(1) + 10}" dy="-2" font-weight="700">壬 Lục Nhâm (${(wLn * 100).toFixed(0)}%)</tspan>
          <tspan x="${posLn.x.toFixed(1) + 10}" dy="14" fill="#10b981" font-weight="800">${sLn.toFixed(1)}đ</tspan>
        </text>
      </svg>
    `;
  }

  // --- RENDER SVG CONSENSUS GAUGE (Đồng hồ C_3T) ---
  function renderSvgGauge(consensus, totalScore, classification) {
    const size = 180;
    const r = 70;
    const cx = size / 2;
    const cy = size / 2 + 10;

    // Bán nguyệt từ -180 độ đến 0 độ (chu vi nửa đường tròn = PI * r)
    const arcLen = Math.PI * r;
    const pct = Math.min(100, Math.max(0, consensus)) / 100;
    const offset = arcLen * (1 - pct);

    // Màu sắc theo phân hạng / đồng thuận
    let gaugeColor = '#f59e0b'; // Vàng
    if (consensus >= 80) {
      gaugeColor = totalScore >= 70 ? '#10b981' : (totalScore <= 42 ? '#ef4444' : '#38bdf8');
    } else if (consensus < 60) {
      gaugeColor = '#f97316';
    }

    return `
      <svg class="tamthuc-gauge-svg" viewBox="0 0 ${size} 115" width="100%" height="115">
        <!-- Background Arc -->
        <path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none" stroke="rgba(255, 255, 255, 0.12)" stroke-width="12" stroke-linecap="round" />

        <!-- Foreground Value Arc -->
        <path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none" stroke="${gaugeColor}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${arcLen}" stroke-dashoffset="${offset}" />

        <!-- Center Value -->
        <text x="${cx}" y="${cy - 12}" text-anchor="middle" class="gauge-pct-text" fill="${gaugeColor}" font-size="28" font-weight="900">
          ${consensus.toFixed(1)}%
        </text>
        <text x="${cx}" y="${cy + 6}" text-anchor="middle" class="gauge-sub-text" font-size="11" fill="var(--text-muted, #94a3b8)">
          ĐỒNG THUẬN C_3T
        </text>
      </svg>
    `;
  }

  // --- RENDER MAIN VIEW ---
  function render(container) {
    const target = container || document.getElementById('view-tamthuc');
    if (!target) return;

    const rep = computeReport();
    if (!rep) {
      target.innerHTML = `<div class="ucc-alert">Không thể lập báo cáo Xuyên Tam Thức.</div>`;
      return;
    }

    const sb = rep.score_breakdown;
    const l1 = rep.layer1_overview;
    const l2 = rep.layer2_thai_at;
    const l3 = rep.layer3_ky_mon;
    const l4 = rep.layer4_luc_nham;
    const l5 = rep.layer5_action_strategy;

    const domains = global.NetaTamThucEngine.listAllDomains();
    const curDomain = global.NetaTamThucEngine.getDomainConfig(currentDomainCode);

    // Phân hạng badge class
    let classBadge = 'badge-binhhoa';
    if (sb.classification.includes('ĐẠI CÁT')) classBadge = 'badge-daicat';
    else if (sb.classification.includes('TRUNG CÁT')) classBadge = 'badge-trungcat';
    else if (sb.classification.includes('TIỂU HUNG')) classBadge = 'badge-tieuhung';
    else if (sb.classification.includes('ĐẠI HUNG')) classBadge = 'badge-daihung';

    const dStr = `${currentDate.getFullYear()}-${pad(currentDate.getMonth() + 1)}-${pad(currentDate.getDate())}`;
    const sHour = currentDate.getHours();
    const sMin = currentDate.getMinutes();

    target.innerHTML = `
      <div class="tamthuc-view-container">

        <!-- 1. UNIFIED CONTROL CARD (UCC) -->
        <div class="tamthuc-ucc-card">
          <!-- Hàng 1: Ngày giờ (bấm mở lịch) & Điều hướng thời gian -->
          <div class="ucc-row ucc-row-date">
            <label class="ucc-time-display-pill" id="tamthuc-pill-cal" title="Chạm để mở bảng chọn Ngày & Giờ">
              <span class="ucc-cal-icon">📅</span>
              <span class="ucc-datetime-val">${formatDisplayDate(currentDate)}</span>
              <input type="datetime-local" id="tamthuc-picker-datetime" value="${dStr}T${pad(sHour)}:${pad(sMin)}" class="native-hidden-date">
            </label>
            <div class="ucc-quick-nav-btns">
              <button type="button" class="ucc-q-btn" id="btn-tamthuc-sub-hour" title="Lùi 1 Giờ">-1h</button>
              <button type="button" class="ucc-q-btn" id="btn-tamthuc-add-hour" title="Tiến 1 Giờ">+1h</button>
              <button type="button" class="ucc-q-btn ucc-btn-now" id="btn-tamthuc-now" title="Về thời điểm hiện tại">⚡ Giờ thực</button>
            </div>
          </div>

          <!-- Hàng 2: Tiết Khí & Tứ Trụ Thời Điểm -->
          <div class="ucc-row ucc-row-pillars">
            <span class="ucc-term-tag">🌿 ${rep.solar_term}</span>
            <div class="ucc-pillars-text">
              <span class="pillar-label">Tứ Trụ:</span>
              <strong class="pillar-val">${(rep.four_pillars || '').replace(/\s*-\s*/g, ' • ')}</strong>
            </div>
          </div>

          <!-- Hàng 3: Chọn Vị Thế Chiến Lược -->
          <div class="ucc-row ucc-row-role">
            <div class="ucc-role-selector">
              <span class="role-label">Vị Thế:</span>
              <button type="button" class="role-btn ${currentRole === 'Chủ' ? 'active chu' : ''}" id="btn-role-chu" title="Phe Chủ: Chủ động, người khởi sự">🛡️ Phe Chủ</button>
              <button type="button" class="role-btn ${currentRole === 'Khách' ? 'active khach' : ''}" id="btn-role-khach" title="Phe Khách: Bị động, ngoại cảnh">⚔️ Phe Khách</button>
            </div>
          </div>

          <!-- Hàng 4: Ô Nhập Câu Hỏi & Tự Động Bắt Lĩnh Vực -->
          <div class="ucc-row ucc-row-query">
            <div class="tamthuc-query-input-wrap">
              <span class="query-icon">🔍</span>
              <input type="text" id="tamthuc-query-input" class="tamthuc-query-input" placeholder="Nhập sự việc cần chiêm đoán (hợp đồng, bổ nhiệm, đầu tư...)" value="${currentQuery}">
              ${currentQuery ? `<button type="button" class="btn-clear-query" id="btn-clear-query">✕</button>` : ''}
            </div>
            <button type="button" class="ucc-btn-submit" id="btn-tamthuc-run" title="Thực hiện chiêm đoán Tam Thức">
              🔮 Luận Giải
            </button>
          </div>
        </div>

        <!-- 2. LƯỚI 12 LĨNH VỰC THEN CHỐT (DOMAIN SELECTOR) -->
        <div class="tamthuc-domain-grid-section">
          <div class="section-sub-header">
            <span class="sub-header-title">12 LĨNH VỰC ĐỊNH HƯỚNG TAM TÀI</span>
            <span class="domain-weight-info">
              Trọng số [${curDomain.code}]: 
              <strong>Thiên Thời ${(curDomain.weight_thai_at * 100).toFixed(0)}%</strong> • 
              <strong>Địa Lợi ${(curDomain.weight_ky_mon * 100).toFixed(0)}%</strong> • 
              <strong>Nhân Sự ${(curDomain.weight_luc_nham * 100).toFixed(0)}%</strong>
            </span>
          </div>
          <div class="domain-pills-scroll">
            ${domains.map(d => {
              const isSel = d.code === currentDomainCode;
              return `
                <button type="button" class="domain-pill-card ${isSel ? 'active' : ''}" data-domain="${d.code}">
                  <span class="domain-code">${d.code}</span>
                  <span class="domain-name">${d.name}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        ${(rep.optimal_timings && rep.optimal_timings.is_timing_query && rep.optimal_timings.recommendations && rep.optimal_timings.recommendations.length > 0) ? `
        <!-- 2.4 BẢNG KHUNG GIỜ HOÀNG KIM TAM TÀI (OPTIMAL TIMING RECOMMENDATIONS) -->
        <div class="tamthuc-timing-card">
          <div class="timing-card-header">
            <div class="timing-header-left">
              <span class="timing-header-icon">🗓️</span>
              <div>
                <div class="timing-header-title">TOP KHUNG GIỜ HOÀNG KIM TAM TÀI</div>
                <div class="timing-header-subtitle">
                  Dải quét: <strong>${escapeHtml(rep.optimal_timings.time_window_label)}</strong> • Đã phân tích <strong>${rep.optimal_timings.total_slots_scanned}</strong> thời điểm
                </div>
              </div>
            </div>
            <span class="timing-count-pill">${rep.optimal_timings.recommendations.length} LỰA CHỌN</span>
          </div>

          <div class="timing-items-list">
            ${rep.optimal_timings.recommendations.map(r => `
              <div class="timing-item-card rank-${r.rank}">
                <div class="timing-item-top">
                  <div class="timing-rank-tag">#${r.rank}</div>
                  <div class="timing-time-info">
                    <div class="timing-primary-time">${escapeHtml(r.can_chi_hour)}</div>
                    <div class="timing-secondary-time">${escapeHtml(r.solar_date_display)} (${escapeHtml(r.can_chi_day)})</div>
                  </div>
                  <div class="timing-score-wrap">
                    <span class="timing-score-badge badge-${r.classification.toLowerCase()}">${r.classification}</span>
                    <span class="timing-score-num">${r.score.toFixed(1)}đ</span>
                  </div>
                </div>

                <div class="timing-pillars-grid">
                  <div class="timing-pillar-cell">
                    <span class="tp-icon">🌤️</span>
                    <div class="tp-body">
                      <span class="tp-label">Thiên Thời</span>
                      <span class="tp-text">${escapeHtml(r.pillars_summary.thai_at)}</span>
                    </div>
                  </div>
                  <div class="timing-pillar-cell">
                    <span class="tp-icon">⛰️</span>
                    <div class="tp-body">
                      <span class="tp-label">Địa Lợi</span>
                      <span class="tp-text">${escapeHtml(r.pillars_summary.ky_mon)}</span>
                    </div>
                  </div>
                  <div class="timing-pillar-cell">
                    <span class="tp-icon">👥</span>
                    <div class="tp-body">
                      <span class="tp-label">Nhân Sự</span>
                      <span class="tp-text">${escapeHtml(r.pillars_summary.luc_nham)}</span>
                    </div>
                  </div>
                </div>

                <div class="timing-item-actions">
                  <button type="button" class="btn-timing-apply" data-time="${r.date_str}" data-label="${escapeHtml(r.can_chi_hour + ' • ' + r.solar_date_display)}">
                    ⏱️ Áp Dụng Giờ Này
                  </button>
                  <button type="button" class="btn-timing-ics" data-rank="${r.rank}">
                    📅 Xuất Lịch (.ics)
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        ${rep.query_resolution ? `
        <!-- 2.5 QUYẾT NGHỊ CHIÊM ĐOÁN THEO CÂU HỎI (QUESTION INTENT RESOLUTION) -->
        <div class="tamthuc-query-resolution-card">
          <div class="qres-header">
            <div class="qres-title-wrap">
              <span class="qres-badge-icon">🎯</span>
              <div>
                <div class="qres-title">QUYẾT NGHỊ CHIÊM ĐOÁN THEO CÂU HỎI</div>
                <div class="qres-user-query">"${escapeHtml(rep.query_resolution.raw_query)}"</div>
              </div>
            </div>
            <button type="button" class="btn-ai-tamthuc" id="btn-ai-tamthuc" title="Luận giải AI chuyên sâu theo câu hỏi">
              ✨ Luận Giải Chuyên Sâu AI
            </button>
          </div>

          <div class="qres-verdict-box verdict-${rep.query_resolution.verdict_level}">
            <div>
              <div class="verdict-label">KẾT LUẬN &amp; HƯỚNG DẪN HÀNH ĐỘNG:</div>
              <div class="verdict-text">${rep.query_resolution.verdict_title}</div>
            </div>
            <div class="qres-sub-desc" style="max-width: 500px;">${rep.query_resolution.verdict_rationale}</div>
          </div>

          <div class="qres-grid-3col">
            <div class="qres-sub-card">
              <div class="qres-sub-title">${rep.query_resolution.pillars.price_and_position.title}</div>
              <div class="qres-sub-desc">${rep.query_resolution.pillars.price_and_position.content}</div>
            </div>
            <div class="qres-sub-card">
              <div class="qres-sub-title">${rep.query_resolution.pillars.spatial_and_fengshui.title}</div>
              <div class="qres-sub-desc">${rep.query_resolution.pillars.spatial_and_fengshui.content}</div>
            </div>
            <div class="qres-sub-card">
              <div class="qres-sub-title">${rep.query_resolution.pillars.legal_and_trust.title}</div>
              <div class="qres-sub-desc">${rep.query_resolution.pillars.legal_and_trust.content}</div>
            </div>
          </div>

          <div class="qres-actions-footer">
            <strong style="color: #94a3b8; font-size: 0.78rem; text-transform: uppercase;">Khuyến nghị trọng tâm:</strong>
            <ul style="margin: 4px 0 6px 18px; padding: 0; font-size: 0.8rem; color: #cbd5e1;">
              ${(rep.query_resolution.action_steps || []).map(s => `<li>${s}</li>`).join('')}
            </ul>
            <div style="font-size: 0.78rem; color: #fbbf24;">⏳ <strong>Thời điểm tối ưu:</strong> ${rep.query_resolution.optimal_window}</div>
          </div>

          <div id="tamthuc-ai-output" style="display: none;"></div>
        </div>
        ` : ''}

        <!-- 3. DASHBOARD TỔNG HỢP: RADAR TAM TÀI & GAUGE ĐỒNG THUẬN -->
        <div class="tamthuc-dashboard-card">
          <!-- Summary Top Banner -->
          <div class="dash-summary-banner">
            <div class="dash-main-score">
              <div class="score-title">TỔNG ĐIỂM CHIẾN LƯỢC</div>
              <div class="score-number">${sb.weighted_total_score.toFixed(1)}<span class="score-max">/100</span></div>
              <div class="score-class-badge ${classBadge}">${sb.classification}</div>
            </div>

            <div class="dash-consensus-box">
              ${renderSvgGauge(sb.consensus_index, sb.weighted_total_score, sb.classification)}
            </div>
          </div>

          <!-- Interaction Pattern Strip -->
          <div class="dash-pattern-strip">
            <span class="pattern-icon">⚡</span>
            <div class="pattern-content">
              <strong>Hình Thái Tam Tài:</strong> ${sb.interaction_pattern}
            </div>
          </div>

          <!-- Visual Radar & Breakdown Metrics -->
          <div class="dash-visual-row">
            <div class="dash-radar-col">
              ${renderSvgRadar(sb.score_thai_at, sb.score_ky_mon, sb.score_luc_nham, curDomain.weight_thai_at, curDomain.weight_ky_mon, curDomain.weight_luc_nham)}
            </div>
            <div class="dash-metrics-col">
              <div class="metric-card metric-ta">
                <div class="m-head">
                  <span class="m-icon">☀️</span>
                  <span class="m-name">Thái Ất (Thiên Thời)</span>
                  <span class="m-weight">Trọng số ${(curDomain.weight_thai_at * 100).toFixed(0)}%</span>
                </div>
                <div class="m-body">
                  <span class="m-score">${sb.score_thai_at.toFixed(1)}đ</span>
                  <span class="m-desc">${l2.the_co || l2.key_finding}</span>
                </div>
              </div>

              <div class="metric-card metric-km">
                <div class="m-head">
                  <span class="m-icon">🔮</span>
                  <span class="m-name">Kỳ Môn (Địa Lợi)</span>
                  <span class="m-weight">Trọng số ${(curDomain.weight_ky_mon * 100).toFixed(0)}%</span>
                </div>
                <div class="m-body">
                  <span class="m-score">${sb.score_ky_mon.toFixed(1)}đ</span>
                  <span class="m-desc">${l3.formation || l3.key_finding}</span>
                </div>
              </div>

              <div class="metric-card metric-ln">
                <div class="m-head">
                  <span class="m-icon">壬</span>
                  <span class="m-name">Lục Nhâm (Nhân Sự)</span>
                  <span class="m-weight">Trọng số ${(curDomain.weight_luc_nham * 100).toFixed(0)}%</span>
                </div>
                <div class="m-body">
                  <span class="m-score">${sb.score_luc_nham.toFixed(1)}đ</span>
                  <span class="m-desc">${l4.cach_cuc || l4.key_finding}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. BA TRỤ CỘT LUẬN GIẢI CHUYÊN SÂU -->
        <div class="tamthuc-pillars-section">
          <!-- Thẻ Thái Ất -->
          <div class="pillar-detail-card pillar-ta">
            <div class="p-card-header">
              <div class="p-card-title"><span class="icon">☀️</span> THIÊN THỜI • THÁI ẤT THẦN KINH</div>
              <div class="p-card-badge">${l2.cung_thai_at}</div>
            </div>
            <div class="p-card-body">
              <div class="p-info-row">
                <span class="label">Toán Chủ / Khách:</span>
                <strong class="val">Chủ = ${l2.chu_toan} | Khách = ${l2.khach_toan}</strong>
              </div>
              <div class="p-info-row">
                <span class="label">Thế Trận:</span>
                <span class="val">${l2.the_co}</span>
              </div>
              <div class="p-info-desc">
                ${l2.detailed_analysis}
              </div>
              <div class="p-card-action">
                <button type="button" class="btn-goto-module" id="btn-goto-thaiat">☀️ Mở Trận Đồ 16 Thần Vị Thái Ất ➔</button>
              </div>
            </div>
          </div>

          <!-- Thẻ Kỳ Môn -->
          <div class="pillar-detail-card pillar-km">
            <div class="p-card-header">
              <div class="p-card-title"><span class="icon">🔮</span> ĐỊA LỢI • KỲ MÔN ĐỘN GIÁP</div>
              <div class="p-card-badge">${l3.cuc}</div>
            </div>
            <div class="p-card-body">
              <div class="p-info-row">
                <span class="label">Trực Phù / Trực Sử:</span>
                <strong class="val">Trực Phù = ${l3.truc_phu} | Trực Sử = ${l3.truc_su}</strong>
              </div>
              <div class="p-info-row">
                <span class="label">Cung Dụng Thần:</span>
                <span class="val">${l3.palace_name} (${l3.formation})</span>
              </div>
              <div class="p-info-row">
                <span class="label">Phương Vị Cát Lợi:</span>
                <span class="val highlight">${l3.auspicious_directions}</span>
              </div>
              <div class="p-info-desc">
                ${l3.detailed_analysis}
              </div>
              <div class="p-card-action">
                <button type="button" class="btn-goto-module" id="btn-goto-qmdj">🔮 Mở Bàn Cờ 9 Cung Kỳ Môn ➔</button>
              </div>
            </div>
          </div>

          <!-- Thẻ Lục Nhâm -->
          <div class="pillar-detail-card pillar-ln">
            <div class="p-card-header">
              <div class="p-card-title"><span class="icon">壬</span> NHÂN SỰ • LỤC NHÂM ĐẠI ĐỘN</div>
              <div class="p-card-badge">${l4.nguyet_tuong}</div>
            </div>
            <div class="p-card-body">
              <div class="p-info-row">
                <span class="label">Tên Cách Cục:</span>
                <strong class="val">${l4.cach_cuc}</strong>
              </div>
              <div class="p-info-row">
                <span class="label">Tam Truyền Diễn Biến:</span>
                <span class="val code-font">${l4.so_truyen} ➔ ${l4.trung_truyen} ➔ ${l4.mat_truyen}</span>
              </div>
              <div class="p-info-row">
                <span class="label">Tứ Khóa Hòa Khí:</span>
                <span class="val">${l4.tu_khoa_status}</span>
              </div>
              <div class="p-info-desc">
                ${l4.detailed_analysis}
              </div>
              <div class="p-card-action">
                <button type="button" class="btn-goto-module" id="btn-goto-lucnham">壬 Mở Bàn Cờ 8 Lớp Lục Nhâm ➔</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 5. TẦNG 5: CHIẾN LƯỢC HÀNH ĐỘNG TỐI ƯU (ACTION PLAN) -->
        <div class="tamthuc-strategy-card">
          <div class="strat-header">
            <div class="strat-title-wrap">
              <span class="strat-icon">🎯</span>
              <div>
                <h3 class="strat-title">CHIẾN LƯỢC HÀNH ĐỘNG TOÀN DIỆN (TẦNG 5)</h3>
                <span class="strat-subtitle">Dụng thần cốt lõi: <strong>${l5.primary_dung_than}</strong></span>
              </div>
            </div>
            <div class="strat-actions">
              <button type="button" class="btn-copy-report" id="btn-copy-markdown-report" title="Sao chép toàn bộ báo cáo Markdown 5 tầng">
                📋 Sao Chép Báo Cáo
              </button>
            </div>
          </div>

          <div class="strat-body">
            <!-- Mục 1: Thời Điểm -->
            <div class="strat-block">
              <div class="block-title">⏳ 1. Thời Điểm Khởi Sự &amp; Kích Hoạt (Timing Windows)</div>
              <p class="block-desc">${l5.timing_strategy}</p>
              <ul class="block-list">
                ${(l5.timing_windows || []).map(tw => `<li>${tw}</li>`).join('')}
              </ul>
            </div>

            <!-- Mục 2: Không Gian -->
            <div class="strat-block">
              <div class="block-title">🧭 2. Định Vị Không Gian &amp; Kênh Triển Khai (Spatial Strategy)</div>
              <p class="block-desc">${l5.spatial_strategy}</p>
            </div>

            <!-- Mục 3: Tác Nghiệp -->
            <div class="strat-block">
              <div class="block-title">📋 3. Biện Pháp Tác Nghiệp Cụ Thể (Concrete Actions)</div>
              <ul class="block-list">
                ${(l5.concrete_actions || []).map(act => `<li>${act}</li>`).join('')}
              </ul>
              <p class="block-personnel"><strong>Ứng xử nhân sự:</strong> ${l5.personnel_strategy}</p>
            </div>

            <!-- Mục 4: Rủi Ro -->
            <div class="strat-block alert-block">
              <div class="block-title">🛡️ 4. Kiểm Soát Rủi Ro &amp; Phòng Vệ (Risk Control &amp; Mitigation)</div>
              <ul class="block-list risk-list">
                ${(l5.specific_risks || []).map(rk => `<li>⚠️ ${rk}</li>`).join('')}
              </ul>
              <p class="block-mitigation"><strong>Nguyên tắc phòng vệ:</strong> ${l5.mitigation_strategy}</p>
            </div>
          </div>
        </div>

      </div>
    `;

    bindEvents(target);
  }

  // --- GẮN SỰ KIỆN TƯƠNG TÁC ---
  function bindEvents(container) {
    // 1. Quick Time buttons
    const btnSubHour = container.querySelector('#btn-tamthuc-sub-hour');
    const btnAddHour = container.querySelector('#btn-tamthuc-add-hour');
    const btnNow = container.querySelector('#btn-tamthuc-now');
    const picker = container.querySelector('#tamthuc-picker-datetime');
    const pillCal = container.querySelector('#tamthuc-pill-cal');

    if (pillCal && picker) {
      pillCal.onclick = (e) => {
        if (e.target !== picker && typeof picker.showPicker === 'function') {
          try {
            picker.showPicker();
          } catch (err) {
            // fallback handled by native label
          }
        }
      };
    }

    if (btnSubHour) {
      btnSubHour.onclick = () => {
        currentDate.setHours(currentDate.getHours() - 1);
        render(container);
      };
    }
    if (btnAddHour) {
      btnAddHour.onclick = () => {
        currentDate.setHours(currentDate.getHours() + 1);
        render(container);
      };
    }
    if (btnNow) {
      btnNow.onclick = () => {
        currentDate = new Date();
        render(container);
      };
    }
    if (picker) {
      picker.onchange = (e) => {
        const val = e.target.value;
        if (val) {
          currentDate = new Date(val);
          render(container);
        }
      };
    }

    // 2. Role Selector (Chủ vs Khách)
    const btnChu = container.querySelector('#btn-role-chu');
    const btnKhach = container.querySelector('#btn-role-khach');
    if (btnChu) {
      btnChu.onclick = () => {
        if (currentRole !== 'Chủ') {
          currentRole = 'Chủ';
          render(container);
        }
      };
    }
    if (btnKhach) {
      btnKhach.onclick = () => {
        if (currentRole !== 'Khách') {
          currentRole = 'Khách';
          render(container);
        }
      };
    }

    // 3. Query input & run with Live Domain Auto-detection
    const queryInput = container.querySelector('#tamthuc-query-input');
    const btnRun = container.querySelector('#btn-tamthuc-run');
    const btnClear = container.querySelector('#btn-clear-query');

    let debounceTimer = null;
    if (queryInput) {
      queryInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const val = queryInput.value.trim();
          if (val && global.NetaTamThucEngine && typeof global.NetaTamThucEngine.detectDomainFromQuery === 'function') {
            const detected = global.NetaTamThucEngine.detectDomainFromQuery(val);
            if (detected && detected.code) {
              currentDomainCode = detected.code;
              container.querySelectorAll('.domain-pill-card[data-domain]').forEach(btn => {
                if (btn.getAttribute('data-domain') === detected.code) {
                  btn.classList.add('active');
                  btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                } else {
                  btn.classList.remove('active');
                }
              });
            }
          }
        }, 150);
      });

      queryInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          currentQuery = queryInput.value.trim();
          render(container);
        }
      });
    }
    if (btnRun) {
      btnRun.onclick = () => {
        if (queryInput) currentQuery = queryInput.value.trim();
        render(container);
      };
    }
    if (btnClear) {
      btnClear.onclick = () => {
        currentQuery = '';
        render(container);
      };
    }

    // 3.5 AI Luận giải Chuyên sâu
    const btnAi = container.querySelector('#btn-ai-tamthuc');
    const aiOutput = container.querySelector('#tamthuc-ai-output');
    if (btnAi && aiOutput) {
      btnAi.onclick = async () => {
        if (!currentReport) return;
        btnAi.disabled = true;
        const origText = btnAi.innerHTML;
        btnAi.innerHTML = '⏳ Đang Luận Giải AI...';
        aiOutput.style.display = 'block';
        aiOutput.innerHTML = '<div class="ai-modal-box"><em>✨ Đang kết nối mô hình trí tuệ nhân tạo để tổng hợp luận giải chiêm đoán chuyên sâu 100% theo câu hỏi...</em></div>';

        try {
          const prompt = `Bạn là Đại Sư Chiêm Đoán Tam Thức (Thái Ất Thần Kinh, Kỳ Môn Độn Giáp, Lục Nhâm Đại Độn) của hệ thống Neta Light.
Người dùng đặt câu hỏi chiêm đoán sự việc cụ thể:
"${currentQuery || 'Chiêm đoán sự vụ theo thời điểm'}"

Dữ liệu tính toán từ 3 hệ thống cổ thư:
- Thời gian: ${currentReport.four_pillars} (Tiết khí: ${currentReport.solar_term})
- Vị thế: ${currentRole}
- Tổng điểm Tam Tài: ${currentReport.score_breakdown.weighted_total_score}/100 (${currentReport.score_breakdown.classification})
- Chỉ số đồng thuận C_3T: ${currentReport.score_breakdown.consensus_index}%
- Thái Ất (Thiên Thời): Điểm ${currentReport.score_breakdown.score_thai_at}, Cung ${currentReport.layer2_thai_at.cung_thai_at}, Toán Chủ ${currentReport.layer2_thai_at.chu_toan} vs Khách ${currentReport.layer2_thai_at.khach_toan}. Thế cờ: ${currentReport.layer2_thai_at.the_co}.
- Kỳ Môn (Địa Lợi): Điểm ${currentReport.score_breakdown.score_ky_mon}, Cục ${currentReport.layer3_ky_mon.cuc}, Trực Phù ${currentReport.layer3_ky_mon.truc_phu}, Trực Sử ${currentReport.layer3_ky_mon.truc_su}, Dụng thần cung: ${currentReport.layer3_ky_mon.palace_name}, Cách cục: ${currentReport.layer3_ky_mon.formation}, Phương vị cát: ${currentReport.layer3_ky_mon.auspicious_directions}.
- Lục Nhâm (Nhân Sự): Điểm ${currentReport.score_breakdown.score_luc_nham}, Nguyệt tướng ${currentReport.layer4_luc_nham.nguyet_tuong}, Cách cục: ${currentReport.layer4_luc_nham.cach_cuc}, Tam truyền: ${currentReport.layer4_luc_nham.so_truyen} -> ${currentReport.layer4_luc_nham.trung_truyen} -> ${currentReport.layer4_luc_nham.mat_truyen}, Tứ khóa: ${currentReport.layer4_luc_nham.tu_khoa_status}.

Hãy đưa ra bài luận giải chiêm đoán sắc bén, trả lời TRỰC DIỆN 100% vào câu hỏi của người dùng:
1. Quyết nghị dứt khoát: NÊN hay KHÔNG NÊN hay CẦN ĐIỀU KIỆN GÌ?
2. Bóc tách chi tiết theo câu hỏi: Vị thế giá cả/đàm phán (Thái Ất), địa thế phong thủy/quy hoạch (Kỳ Môn), pháp lý/lòng người đối tác (Lục Nhâm).
3. Ba bước hành động cụ thể và thời điểm vàng nên xuống tiền hoặc ra quyết định.
Văn phong đĩnh đạc, chuẩn xác, định lượng, không vòng vo.`;

          let aiResult = "";
          if (global.NetaGeminiService && typeof global.NetaGeminiService.callGeminiAPI === 'function') {
            aiResult = await global.NetaGeminiService.callGeminiAPI(prompt);
          } else if (global.NetaGeminiService && typeof global.NetaGeminiService.polishEssay === 'function') {
            aiResult = await global.NetaGeminiService.polishEssay(prompt);
          } else {
            const qr = currentReport.query_resolution;
            aiResult = `### 🔮 BẢN LUẬN GIẢI CHUYÊN SÂU TAM THỨC THEO CÂU HỎI

**Câu hỏi:** "${currentQuery}"
**Quyết nghị:** **${qr ? qr.verdict_title : currentReport.score_breakdown.classification}**

**1. Luận Điểm Cốt Lõi:**
${qr ? qr.verdict_rationale : currentReport.layer1_overview.summary}

**2. Bóc Tách 3 Trụ Cột Tam Tài:**
- **Thái Ất (Giá Cả & Đàm Phán):** ${qr ? qr.pillars.price_and_position.content : currentReport.layer2_thai_at.detailed_analysis}
- **Kỳ Môn (Địa Thế, Phong Thủy & Không Gian):** ${qr ? qr.pillars.spatial_and_fengshui.content : currentReport.layer3_ky_mon.detailed_analysis}
- **Lục Nhâm (Pháp Lý, Sổ Sách & Chủ Đất):** ${qr ? qr.pillars.legal_and_trust.content : currentReport.layer4_luc_nham.detailed_analysis}

**3. Khuyến Nghị Hành Động:**
${(qr && qr.action_steps ? qr.action_steps : currentReport.layer5_action_strategy.concrete_actions).map((s, idx) => `${idx + 1}. ${s}`).join('\n')}

**4. Khung Thời Gian Kích Hoạt Tối Ưu:**
${qr ? qr.optimal_window : currentReport.layer5_action_strategy.timing_strategy}`;
          }

          aiOutput.innerHTML = `<div class="ai-modal-box">${escapeHtml(aiResult).replace(/\n/g, '<br>')}</div>`;
          btnAi.innerHTML = '✨ Cập Nhật Luận Giải AI';
        } catch (err) {
          console.error("Lỗi AI:", err);
          aiOutput.innerHTML = `<div class="ai-modal-box" style="color: #f87171;">⚠️ Lỗi kết nối dịch vụ AI. Quý bạn vui lòng kiểm tra kết nối mạng hoặc cấu hình API Key.</div>`;
          btnAi.innerHTML = '✨ Thử Lại';
        } finally {
          btnAi.disabled = false;
        }
      };
    }

    // 3.6 Xử lý Áp Dụng & Xuất Lịch Khung Giờ Hoàng Kim
    container.querySelectorAll('.btn-timing-apply').forEach(btn => {
      btn.onclick = () => {
        const timeStr = btn.getAttribute('data-time');
        const label = btn.getAttribute('data-label') || '';
        if (timeStr) {
          currentDate = new Date(timeStr);
          if (typeof global.showToast === 'function') {
            global.showToast(`⏱️ Đã chuyển Trận Đồ sang: ${label}!`);
          }
          render(container);
        }
      };
    });

    container.querySelectorAll('.btn-timing-ics').forEach(btn => {
      btn.onclick = () => {
        const rank = parseInt(btn.getAttribute('data-rank'), 10);
        if (currentReport && currentReport.optimal_timings && currentReport.optimal_timings.recommendations) {
          const rec = currentReport.optimal_timings.recommendations.find(r => r.rank === rank);
          if (rec && global.NetaTamThucEngine && typeof global.NetaTamThucEngine.generateTamThucIcsContent === 'function') {
            const icsData = global.NetaTamThucEngine.generateTamThucIcsContent(rec, currentQuery);
            if (icsData) {
              const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `TamThuc_HoangKim_${rec.date_str.replace(/[:T-]/g, '_')}.ics`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              if (typeof global.showToast === 'function') {
                global.showToast('📅 Đã tải lịch nhắc hẹn Tam Thức (.ics) thành công!');
              }
            }
          }
        }
      };
    });

    // 4. Domain pills
    container.querySelectorAll('.domain-pill-card[data-domain]').forEach(btn => {
      btn.onclick = () => {
        const dCode = btn.getAttribute('data-domain');
        currentDomainCode = dCode;
        currentQuery = '';
        render(container);
      };
    });

    // 5. Cross-Linking buttons (Chuyển sang module Kỳ Môn, Thái Ất, Lục Nhâm)
    const btnGotoQmdj = container.querySelector('#btn-goto-qmdj');
    const btnGotoThaiAt = container.querySelector('#btn-goto-thaiat');
    const btnGotoLucNham = container.querySelector('#btn-goto-lucnham');

    if (btnGotoQmdj) {
      btnGotoQmdj.onclick = () => {
        if (typeof global.switchAppMode === 'function') {
          global.switchAppMode('qmdj');
        }
      };
    }
    if (btnGotoThaiAt) {
      btnGotoThaiAt.onclick = () => {
        if (typeof global.switchAppMode === 'function') {
          global.switchAppMode('thaiat');
        }
      };
    }
    if (btnGotoLucNham) {
      btnGotoLucNham.onclick = () => {
        if (typeof global.switchAppMode === 'function') {
          global.switchAppMode('lucnham');
        }
      };
    }

    // 6. Copy Markdown Report
    const btnCopy = container.querySelector('#btn-copy-markdown-report');
    if (btnCopy) {
      btnCopy.onclick = () => {
        if (currentReport && typeof currentReport.toMarkdown === 'function') {
          const md = currentReport.toMarkdown();
          navigator.clipboard.writeText(md).then(() => {
            const orig = btnCopy.textContent;
            btnCopy.textContent = '✅ Đã Sao Chép!';
            setTimeout(() => { btnCopy.textContent = orig; }, 2000);
          }).catch(err => {
            console.error("Lỗi clipboard:", err);
          });
        }
      };
    }
  }

  // API xuất ra bên ngoài
  const NetaTamThucView = {
    render: render,
    setDate: function (d) {
      currentDate = (d instanceof Date) ? d : new Date(d);
      render();
    },
    setDomain: function (code) {
      currentDomainCode = code;
      render();
    },
    setRole: function (r) {
      currentRole = r;
      render();
    },
    getReport: function () {
      return currentReport || computeReport();
    }
  };

  global.NetaTamThucView = NetaTamThucView;

})(typeof window !== 'undefined' ? window : this);
