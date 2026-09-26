/**
 * NETA LIGHT - DỊCH HỌC VIEW CONTROLLER (modules/dichhoc_view.js)
 * Giao diện Bốc Quẻ Dịch Lý (Lục Hào Nạp Giáp & Mai Hoa Dịch Số).
 * Đồng bộ 100% với NetaCalendarEngine (Tiết Khí, Can Chi, Nguyệt Lệnh, Nhật Thần).
 */

(function (global) {
  'use strict';

  // State cục bộ của module Dịch Học
  const state = {
    method: 'luchao', // 'luchao' hoặc 'maihoa'
    selectedDate: new Date(),
    haoCoins: [], // Danh sách các hào đã gieo (1 -> 6), mỗi hào nhận 6, 7, 8, 9
    coinStates: [3, 2, 3], // 3 đồng xu hiện tại (2: Âm, 3: Dương)
    isFlipping: false,
    maiHoaMode: 'time', // 'time' hoặc 'numbers'
    soA: 7,
    soB: 8,
    result: null
  };

  // Helper lấy thông tin lịch & tiết khí chuẩn xác từ NetaCalendarEngine
  function getCalendarInfo(date = new Date()) {
    if (global.NetaCalendarEngine && typeof global.NetaCalendarEngine.getFullDayInfo === 'function') {
      return global.NetaCalendarEngine.getFullDayInfo(date);
    }
    // Fallback nếu chưa load calendar engine
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    return {
      solar: { day: d, month: m, year: y, dateStr: `${d}/${m}/${y}` },
      lunar: { day: d, month: m, year: y, dateStr: `Ngày ${d} tháng ${m}` },
      canChi: { year: 'Bính Ngọ', month: 'Đinh Dậu', day: 'Nhâm Dần', hour: 'Tân Hợi', dayGan: 'Nhâm', dayZhi: 'Dần', monthZhi: 'Dậu' },
      solarTerm: 'Thu phân'
    };
  }

  // Khởi tạo và render giao diện
  function render() {
    const container = document.getElementById('view-dichhoc');
    if (!container) return;

    const calInfo = getCalendarInfo(state.selectedDate);
    const canChi = calInfo.canChi || {};
    const solarTerm = calInfo.solarTerm || 'Thu phân';
    const chiNgay = canChi.dayZhi || 'Dần';
    const chiThang = canChi.monthZhi || 'Dậu';

    // Ngũ hành Nhật thần & Nguyệt lệnh
    const eng = global.NetaDichHocEngine;
    const elmNgay = eng ? (eng.DIA_CHI_NGU_HANH[chiNgay] || 'Mộc') : 'Mộc';
    const elmThang = eng ? (eng.DIA_CHI_NGU_HANH[chiThang] || 'Kim') : 'Kim';

    // Nếu chưa có quẻ, tự động lập 1 quẻ mặc định để hiển thị
    if (!state.result) {
      if (state.method === 'luchao') {
        if (state.haoCoins.length === 0) {
          // Mặc định sinh 6 hào mẫu nếu chưa gieo
          state.haoCoins = [7, 7, 7, 6, 7, 7]; // Phong Thiên Tiểu Súc động hào 4
        }
        chayLapQueLucHao();
      } else {
        chayLapQueMaiHoa();
      }
    }

    container.innerHTML = `
      <div class="dichhoc-container">
        <!-- 1. Thanh Menu Tab & Công Cụ -->
        <div class="dh-nav-bar">
          <div class="dh-tab-group">
            <button class="dh-tab-btn ${state.method === 'luchao' ? 'active' : ''}" id="dh-tab-luchao">
              <span>🪙</span> Lục Hào Nạp Giáp
            </button>
            <button class="dh-tab-btn ${state.method === 'maihoa' ? 'active' : ''}" id="dh-tab-maihoa">
              <span>🌸</span> Mai Hoa Dịch Số
            </button>
          </div>
          <div class="dh-action-right">
            <button class="dh-icon-btn" id="dh-btn-now" title="Lấy giờ hiện tại">
              🕒 Hiện Tại
            </button>
            <button class="dh-icon-btn" id="dh-btn-picker" title="Chọn ngày giờ khác">
              📅 Chọn Giờ
            </button>
            <button class="dh-icon-btn" id="dh-btn-save-shot" title="Lưu ảnh quẻ">
              📷 Lưu Ảnh
            </button>
          </div>
        </div>

        <!-- 2. Thẻ Thông Tin Thiên Văn & Tiết Khí Đồng Bộ -->
        <div class="dh-meta-card" id="dh-meta-box">
          <div class="dh-meta-header">
            <div class="dh-meta-title">
              <span>☯️ THÔNG TIN THỜI ĐIỂM CHIÊM QUẺ</span>
            </div>
            <div class="dh-meta-stamp">${state.method === 'luchao' ? '六爻預測' : '梅花易數'}</div>
          </div>
          <div class="dh-meta-grid">
            <div class="dh-meta-item">
              Dương lịch: <strong>${calInfo.solar.dateStr} (${state.selectedDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })})</strong>
            </div>
            <div class="dh-meta-item">
              Âm lịch: <strong>${calInfo.lunar.dateStr || ''}</strong>
            </div>
            <div class="dh-meta-item">
              Tứ Trụ Can Chi: <strong>${canChi.hour || ''}, ${canChi.day || ''}, ${canChi.month || ''}, ${canChi.year || ''}</strong>
            </div>
            <div class="dh-meta-item">
              Tiết khí: <em>${solarTerm}</em> | Tuần không: <em>${(state.result && state.result.thoi_gian && state.result.thoi_gian.tuanKhong) ? state.result.thoi_gian.tuanKhong.join(', ') : 'Tuất, Hợi'}</em>
            </div>
            <div class="dh-meta-item">
              Nhật thần: <strong>${chiNgay} (${elmNgay})</strong> | Nguyệt lệnh: <strong>${chiThang} (${elmThang})</strong>
            </div>
            <div class="dh-meta-item">
              Phương pháp: <strong>${state.method === 'luchao' ? 'Lục Hào (3 Đồng Xu Càn Long)' : (state.maiHoaMode === 'time' ? 'Mai Hoa (Thời Gian Tiết Khí)' : 'Mai Hoa (Hai Số Học)')}</strong>
            </div>
          </div>
        </div>

        <!-- 3. Khu Vực Tương Tác Gieo Quẻ -->
        ${renderInteractionPanel()}

        <!-- 4. Khu Vực Hiển Thị Bản Quẻ Trực Quan (3 Quẻ) -->
        <div id="dh-result-section">
          ${renderResultSection()}
        </div>
      </div>
    `;

    bindEvents();
  }

  // Render khu vực gieo quẻ tương tác
  function renderInteractionPanel() {
    if (state.method === 'luchao') {
      const curHaoCount = state.haoCoins.length;
      return `
        <div class="dh-cast-panel">
          <div style="font-weight: 700; font-size: 0.85rem; color: #f5b041; margin-bottom: 6px;">
            🪙 BÀN GIEO QUẺ LỤC HÀO (3 ĐỒNG XU CỔ)
          </div>
          <div style="font-size: 0.72rem; color: #94a3b8; margin-bottom: 12px;">
            Chạm vào đồng xu hoặc bấm nút bên dưới để gieo lần lượt từ Hào 1 (dưới cùng) đến Hào 6 (trên cùng).
          </div>

          <!-- 3 Đồng Xu Cổ -->
          <div class="dh-coins-stage">
            ${[0, 1, 2].map(idx => {
              const val = state.coinStates[idx] || 3;
              const isYang = (val === 3);
              return `
                <div class="dh-coin ${isYang ? 'is-yang' : 'is-yin'} ${state.isFlipping ? 'flipping' : ''}" data-coin-idx="${idx}" title="${isYang ? 'Mặt Trơn / Chữ Số (Dương = 3)' : 'Mặt 4 Chữ Hán Càn Long (Âm = 2)'}">
                  <div class="dh-coin-hole"></div>
                  <span class="dh-coin-text top">${isYang ? '•' : 'Càn'}</span>
                  <span class="dh-coin-text bottom">${isYang ? '•' : 'Long'}</span>
                  <span class="dh-coin-text left">${isYang ? '3' : 'Thông'}</span>
                  <span class="dh-coin-text right">${isYang ? 'D' : 'Bảo'}</span>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Thang Tiến Trình 6 Hào -->
          <div class="dh-progress-bar">
            ${[1, 2, 3, 4, 5, 6].map(h => {
              const isDone = h <= curHaoCount;
              const isCur = (h === curHaoCount + 1);
              let valText = '';
              if (isDone) {
                const cVal = state.haoCoins[h - 1];
                if (cVal === 6) valText = '6 (L.Âm)';
                else if (cVal === 7) valText = '7 (T.Dương)';
                else if (cVal === 8) valText = '8 (T.Âm)';
                else if (cVal === 9) valText = '9 (L.Dương)';
              }
              return `
                <div class="dh-step-pill ${isDone ? 'done' : ''} ${isCur ? 'active' : ''}">
                  H${h}${valText ? '<br>' + valText.split(' ')[0] : ''}
                </div>
              `;
            }).join('')}
          </div>

          <div class="dh-buttons-row">
            <button class="dh-btn primary" id="dh-btn-cast-step" ${curHaoCount >= 6 ? 'disabled style="opacity:0.6;"' : ''}>
              🎲 Gieo Hào ${Math.min(6, curHaoCount + 1)}/6
            </button>
            <button class="dh-btn auto-speed" id="dh-btn-cast-auto">
              ⚡ Gieo Tự Động 6 Hào
            </button>
            <button class="dh-btn secondary" id="dh-btn-reset-cast">
              🔄 Gieo Lại Từ Đầu
            </button>
          </div>
        </div>
      `;
    } else {
      // Mai Hoa Dịch Số
      return `
        <div class="dh-cast-panel">
          <div style="font-weight: 700; font-size: 0.85rem; color: #f5b041; margin-bottom: 6px;">
            🌸 KHỞI QUẺ MAI HOA DỊCH SỐ (THIỆU KHANG TIẾT)
          </div>
          <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 14px;">
            <button class="dh-tab-btn ${state.maiHoaMode === 'time' ? 'active' : ''}" id="dh-mh-tab-time">
              🕒 Theo Niên Nguyệt Nhật Thời
            </button>
            <button class="dh-tab-btn ${state.maiHoaMode === 'numbers' ? 'active' : ''}" id="dh-mh-tab-numbers">
              🔢 Theo 2 Con Số (Số Học)
            </button>
          </div>

          ${state.maiHoaMode === 'numbers' ? `
            <div style="display: flex; justify-content: center; gap: 12px; margin-bottom: 14px; max-width: 320px; margin-left: auto; margin-right: auto;">
              <div style="flex: 1; text-align: left;">
                <label style="font-size: 0.72rem; color: #94a3b8; font-weight: 700;">Số A (Thượng quái):</label>
                <input type="number" id="dh-inp-num-a" class="dh-input-box" value="${state.soA}" min="1" max="9999">
              </div>
              <div style="flex: 1; text-align: left;">
                <label style="font-size: 0.72rem; color: #94a3b8; font-weight: 700;">Số B (Hạ quái):</label>
                <input type="number" id="dh-inp-num-b" class="dh-input-box" value="${state.soB}" min="1" max="9999">
              </div>
            </div>
          ` : `
            <div style="font-size: 0.74rem; color: #cbd5e1; margin-bottom: 14px; line-height: 1.5;">
              Khởi quẻ theo quy tắc Tiên Thiên: <strong>(Năm + Tháng + Ngày) mod 8</strong> làm Thượng Quái; <strong>(Năm + Tháng + Ngày + Giờ) mod 8</strong> làm Hạ Quái; <strong>Tổng mod 6</strong> tìm Hào Động.
            </div>
          `}

          <div class="dh-buttons-row">
            <button class="dh-btn primary" id="dh-btn-run-maihoa">
              🌸 Lập Quẻ Mai Hoa
            </button>
          </div>
        </div>
      `;
    }
  }

  // Render bản quẻ trực quan (Quẻ Chủ - Quẻ Hỗ - Quẻ Biến)
  function renderResultSection() {
    if (!state.result) return '';

    if (state.method === 'luchao') {
      return renderLucHaoResult(state.result);
    } else {
      return renderMaiHoaResult(state.result);
    }
  }

  // Render kết quả Lục Hào
  function renderLucHaoResult(res) {
    const goc = res.que_goc || {};
    const bien = res.que_bien;
    const phuc = res.phuc_than || [];

    return `
      <!-- 3 Quẻ Lục Hào Trực Quan -->
      <div class="dh-que-stage">
        <!-- Quẻ Gốc -->
        <div class="dh-que-card is-main">
          <span class="dh-que-role-badge chu">Bản Quái (${goc.queType || 'Bản Cung'})</span>
          <div class="dh-que-name">${goc.name || ''}</div>
          <div class="dh-que-cung">Họ ${goc.cung} (${goc.cungElement}) • Thế Hào ${goc.thePos}, Ứng Hào ${goc.ungPos}</div>
          <div class="dh-lines-wrap">
            ${renderLinesVertical(goc.bits, goc.haos.map(h => h.isDong))}
          </div>
          <div class="dh-que-tuong">⚡ ${goc.tuong || ''}</div>
        </div>

        <!-- Quẻ Biến (nếu có động) -->
        ${bien ? `
          <div class="dh-que-card">
            <span class="dh-que-role-badge bien">Biến Quái (${res.dong_count} Hào Động)</span>
            <div class="dh-que-name">${bien.name || ''}</div>
            <div class="dh-que-cung">Quẻ Biến Sau Khi Động Hào Hóa Khí</div>
            <div class="dh-lines-wrap">
              ${renderLinesVertical(bien.bits, [])}
            </div>
            <div class="dh-que-tuong">🔮 ${bien.tuong || ''}</div>
          </div>
        ` : `
          <div class="dh-que-card">
            <span class="dh-que-role-badge ho">Quẻ Tĩnh (Bất Động)</span>
            <div class="dh-que-name">Thuần Tĩnh An Định</div>
            <div class="dh-que-cung">Không có hào động, việc bình ổn lâu dài</div>
            <div style="font-size: 0.74rem; color: #94a3b8; padding: 24px 0;">
              Khi quẻ không có hào động, sự việc giữ nguyên trạng thái ban đầu, lấy hào Thế làm trung tâm luận giải.
            </div>
          </div>
        `}
      </div>

      <!-- Bảng Chi Tiết Từng Hào Lục Hào -->
      <div class="dh-table-card">
        <div style="font-weight: 700; font-size: 0.8rem; color: #f5b041; margin-bottom: 8px; display: flex; justify-content: space-between;">
          <span>📋 BẢNG PHÂN TÍCH LỤC HÀO NẠP GIÁP CHI TIẾT</span>
          <span style="font-size: 0.68rem; color: #94a3b8;">* Thứ tự từ Hào 6 (trên) xuống Hào 1 (dưới)</span>
        </div>
        <table class="dh-data-table">
          <thead>
            <tr>
              <th style="width: 46px;">Hào</th>
              <th style="width: 50px;">Thế/Ứng</th>
              <th style="width: 85px;">Lục Thú</th>
              <th>Lục Thân Bản Quái</th>
              <th style="width: 90px;">Can Chi</th>
              <th style="width: 40px;">TK</th>
              <th style="width: 50px;">V-S</th>
              <th style="width: 70px;">Thần Sát</th>
              ${bien ? `<th>Quẻ Biến (${bien.name})</th>` : ''}
            </tr>
          </thead>
          <tbody>
            ${[5, 4, 3, 2, 1, 0].map(i => {
              const h = goc.haos[i];
              const hBien = bien ? bien.haos[i] : null;
              return `
                <tr class="${h.isDong ? 'dong-row' : ''}">
                  <td>Hào ${h.pos}</td>
                  <td>
                    ${h.isThe ? '<span class="badge-the">Thế</span>' : ''}
                    ${h.isUng ? '<span class="badge-ung">Ứng</span>' : ''}
                  </td>
                  <td>${h.lucThu}</td>
                  <td style="font-weight: 700; color: ${h.lucThan === 'Thê Tài' ? '#4ade80' : (h.lucThan === 'Quan Quỷ' ? '#f87171' : (h.lucThan === 'Tử Tôn' ? '#38bdf8' : '#fbbf24'))};">
                    ${h.lucThan}
                  </td>
                  <td><strong>${h.can}${h.chi}</strong> (${h.chiElement})</td>
                  <td>${h.isTuanKhong ? '<span class="badge-tk">K</span>' : ''}</td>
                  <td>${h.vuongSuy}</td>
                  <td style="font-size: 0.68rem; color: #38bdf8;">${h.thanSat || '-'}</td>
                  ${bien ? `
                    <td style="text-align: left; padding-left: 8px;">
                      ${h.isDong ? `<strong>&rarr; ${hBien.lucThan} ${hBien.can}${hBien.chi} (${hBien.chiElement})</strong>` : '<span style="color:#64748b;">-</span>'}
                    </td>
                  ` : ''}
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- Phục Thần Banner -->
        ${phuc.length > 0 ? `
          <div class="phuc-than-banner">
            <strong>🔍 Phục Thần:</strong>
            ${phuc.map(p => `Hào ${p.pos} <b>${p.lucThan} ${p.can}${p.chi} (${p.chiElement})</b> phục dưới Phi Thần <b>${p.phiThan.lucThan} ${p.phiThan.can}${p.phiThan.chi}</b>`).join('; ')}.
          </div>
        ` : ''}
      </div>
    `;
  }

  // Render kết quả Mai Hoa
  function renderMaiHoaResult(res) {
    const chu = res.que_chu || {};
    const ho = res.que_ho || {};
    const bien = res.que_bien || {};
    const td = res.the_dung || {};

    return `
      <!-- 3 Quẻ Mai Hoa Trực Quan (Chủ - Hỗ - Biến) -->
      <div class="dh-que-stage">
        <!-- Quẻ Chủ -->
        <div class="dh-que-card is-main">
          <span class="dh-que-role-badge chu">Quẻ Chủ (Bản Thể)</span>
          <div class="dh-que-name">${chu.name || ''}</div>
          <div class="dh-que-cung">${chu.thuong_quai.name} (${chu.thuong_quai.element}) trên ${chu.ha_quai.name} (${chu.ha_quai.element})</div>
          <div class="dh-lines-wrap">
            ${renderLinesVertical(chu.bits, [res.hao_dong === 1, res.hao_dong === 2, res.hao_dong === 3, res.hao_dong === 4, res.hao_dong === 5, res.hao_dong === 6])}
          </div>
          <div class="dh-que-tuong">⚡ ${chu.tuong || ''}</div>
        </div>

        <!-- Quẻ Hỗ -->
        <div class="dh-que-card">
          <span class="dh-que-role-badge ho">Quẻ Hỗ (Trung Gian)</span>
          <div class="dh-que-name">${ho.name || ''}</div>
          <div class="dh-que-cung">${ho.thuong_ho.name} (${ho.thuong_ho.element}) trên ${ho.ha_ho.name} (${ho.ha_ho.element})</div>
          <div class="dh-lines-wrap">
            ${renderLinesVertical(ho.bits, [])}
          </div>
          <div class="dh-que-tuong">🌱 ${ho.tuong || ''}</div>
        </div>

        <!-- Quẻ Biến -->
        <div class="dh-que-card">
          <span class="dh-que-role-badge bien">Quẻ Biến (Kết Cục)</span>
          <div class="dh-que-name">${bien.name || ''}</div>
          <div class="dh-que-cung">${bien.thuong_bien.name} (${bien.thuong_bien.element}) trên ${bien.ha_bien.name} (${bien.ha_bien.element})</div>
          <div class="dh-lines-wrap">
            ${renderLinesVertical(bien.bits, [])}
          </div>
          <div class="dh-que-tuong">🔮 ${bien.tuong || ''}</div>
        </div>
      </div>

      <!-- Thẻ Luận Giải Thể - Dụng -->
      <div class="dh-the-dung-card">
        <div style="font-weight: 700; font-size: 0.8rem; color: #f5b041; margin-bottom: 10px; display: flex; justify-content: space-between;">
          <span>⚖️ LUẬN GIẢI THỂ - DỤNG SINH KHẮC (HÀO ĐỘNG: HÀO ${res.hao_dong})</span>
          <span style="font-size: 0.72rem; color: #38bdf8;">${td.the ? td.the.vi_tri : ''}</span>
        </div>

        <div class="dh-td-grid">
          <div class="dh-td-box">
            <div class="dh-td-label">THỂ QUÁI (Chủ Sự)</div>
            <div class="dh-td-name">${td.the ? td.the.info.name : ''} (${td.the ? td.the.info.element : ''})</div>
            <div style="font-size: 0.68rem; color: #94a3b8; margin-top: 2px;">Tượng: ${td.the ? td.the.info.nature : ''} (${td.the ? td.the.vi_tri : ''})</div>
          </div>
          <div class="dh-td-box">
            <div class="dh-td-label">DỤNG QUÁI (Hoàn Cảnh / Đối Tác)</div>
            <div class="dh-td-name" style="color: #ef4444;">${td.dung ? td.dung.info.name : ''} (${td.dung ? td.dung.info.element : ''})</div>
            <div style="font-size: 0.68rem; color: #94a3b8; margin-top: 2px;">Tượng: ${td.dung ? td.dung.info.nature : ''} (Chứa Hào ${res.hao_dong})</div>
          </div>
        </div>

        <div class="dh-td-verdict ${td.muc_do || 'cat'}">
          ${td.danh_gia || ''}
        </div>
      </div>
    `;
  }

  // Render 6 vạch hào theo chiều dọc (Hào 6 trên cùng, Hào 1 dưới cùng)
  function renderLinesVertical(bits, dongFlags = []) {
    let html = '';
    // i chạy từ 5 xuống 0 (hào 6 -> hào 1)
    for (let i = 5; i >= 0; i--) {
      const bit = bits[i];
      const isDong = dongFlags[i] || false;
      const isYang = (bit === 1);

      html += `
        <div class="dh-line-item ${isDong ? 'dong' : ''}" title="Hào ${i + 1}: ${isYang ? 'Dương' : 'Âm'} ${isDong ? '(Động)' : '(Tĩnh)'}">
          ${isYang ? `
            <div class="dh-line-yang"></div>
          ` : `
            <div class="dh-line-yin">
              <div class="dh-line-yin-bar"></div>
              <div class="dh-line-yin-bar"></div>
            </div>
          `}
          ${isDong ? `<span class="dh-line-dong-mark">${isYang ? 'o' : 'x'}</span>` : ''}
        </div>
      `;
    }
    return html;
  }

  // Tính toán quẻ Lục Hào
  function chayLapQueLucHao() {
    const eng = global.NetaDichHocEngine;
    if (!eng || !eng.LucHaoEngine) return;

    const cal = getCalendarInfo(state.selectedDate);
    state.result = eng.LucHaoEngine.lapQue(state.haoCoins, cal);
  }

  // Tính toán quẻ Mai Hoa
  function chayLapQueMaiHoa() {
    const eng = global.NetaDichHocEngine;
    if (!eng || !eng.MaiHoaEngine) return;

    if (state.maiHoaMode === 'time') {
      const cal = getCalendarInfo(state.selectedDate);
      const canChi = cal.canChi || {};
      const zhiNames = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

      // Địa chi năm: 1..12
      const namZhi = canChi.yearZhi || 'Ngọ';
      const namIdx = zhiNames.indexOf(namZhi) + 1;

      // Tháng âm: 1..12
      const thangAm = cal.lunar ? cal.lunar.month : (state.selectedDate.getMonth() + 1);
      // Ngày âm: 1..30
      const ngayAm = cal.lunar ? cal.lunar.day : state.selectedDate.getDate();

      // Địa chi giờ: 1..12
      const gioZhi = canChi.hourZhi || 'Hợi';
      const gioIdx = zhiNames.indexOf(gioZhi) + 1;

      state.result = eng.MaiHoaEngine.lapQueThoiGian(namIdx, thangAm, ngayAm, gioIdx);
    } else {
      state.result = eng.MaiHoaEngine.lapQueTheoHaiSo(state.soA, state.soB);
    }
  }

  // Gieo 1 hào ngẫu nhiên (3 đồng xu)
  function gieoMotHao() {
    if (state.isFlipping) return;
    state.isFlipping = true;

    // Tung ngẫu nhiên 3 đồng xu: mỗi xu nhận 2 (Âm) hoặc 3 (Dương)
    const c1 = Math.random() < 0.5 ? 2 : 3;
    const c2 = Math.random() < 0.5 ? 2 : 3;
    const c3 = Math.random() < 0.5 ? 2 : 3;
    state.coinStates = [c1, c2, c3];
    const total = c1 + c2 + c3; // 6, 7, 8, hoặc 9

    render();

    setTimeout(() => {
      state.isFlipping = false;
      state.haoCoins.push(total);
      if (state.haoCoins.length >= 6) {
        chayLapQueLucHao();
      }
      render();
    }, 600);
  }

  // Gieo tự động toàn bộ 6 hào
  function gieoTuDong6Hao() {
    state.haoCoins = [];
    for (let i = 0; i < 6; i++) {
      const c1 = Math.random() < 0.5 ? 2 : 3;
      const c2 = Math.random() < 0.5 ? 2 : 3;
      const c3 = Math.random() < 0.5 ? 2 : 3;
      state.haoCoins.push(c1 + c2 + c3);
    }
    state.coinStates = [
      Math.random() < 0.5 ? 2 : 3,
      Math.random() < 0.5 ? 2 : 3,
      Math.random() < 0.5 ? 2 : 3
    ];
    chayLapQueLucHao();
    render();
  }

  // Gắn sự kiện giao diện
  function bindEvents() {
    // 1. Chuyển tab Lục Hào / Mai Hoa
    const tabLucHao = document.getElementById('dh-tab-luchao');
    if (tabLucHao) {
      tabLucHao.onclick = () => {
        state.method = 'luchao';
        if (state.haoCoins.length === 0) {
          state.haoCoins = [7, 7, 7, 6, 7, 7];
        }
        chayLapQueLucHao();
        render();
      };
    }

    const tabMaiHoa = document.getElementById('dh-tab-maihoa');
    if (tabMaiHoa) {
      tabMaiHoa.onclick = () => {
        state.method = 'maihoa';
        chayLapQueMaiHoa();
        render();
      };
    }

    // 2. Chế độ Mai Hoa (Thời gian / Số học)
    const mhTabTime = document.getElementById('dh-mh-tab-time');
    if (mhTabTime) {
      mhTabTime.onclick = () => {
        state.maiHoaMode = 'time';
        chayLapQueMaiHoa();
        render();
      };
    }

    const mhTabNumbers = document.getElementById('dh-mh-tab-numbers');
    if (mhTabNumbers) {
      mhTabNumbers.onclick = () => {
        state.maiHoaMode = 'numbers';
        chayLapQueMaiHoa();
        render();
      };
    }

    const inpNumA = document.getElementById('dh-inp-num-a');
    if (inpNumA) {
      inpNumA.oninput = (e) => {
        state.soA = parseInt(e.target.value, 10) || 1;
      };
    }

    const inpNumB = document.getElementById('dh-inp-num-b');
    if (inpNumB) {
      inpNumB.oninput = (e) => {
        state.soB = parseInt(e.target.value, 10) || 1;
      };
    }

    const btnRunMaiHoa = document.getElementById('dh-btn-run-maihoa');
    if (btnRunMaiHoa) {
      btnRunMaiHoa.onclick = () => {
        chayLapQueMaiHoa();
        render();
      };
    }

    // 3. Nút Gieo Quẻ Lục Hào
    const btnCastStep = document.getElementById('dh-btn-cast-step');
    if (btnCastStep) {
      btnCastStep.onclick = gieoMotHao;
    }

    const btnCastAuto = document.getElementById('dh-btn-cast-auto');
    if (btnCastAuto) {
      btnCastAuto.onclick = gieoTuDong6Hao;
    }

    const btnResetCast = document.getElementById('dh-btn-reset-cast');
    if (btnResetCast) {
      btnResetCast.onclick = () => {
        state.haoCoins = [];
        state.result = null;
        render();
      };
    }

    // 4. Header buttons: Hiện Tại & Chọn Giờ & Lưu Ảnh
    const btnNow = document.getElementById('dh-btn-now');
    if (btnNow) {
      btnNow.onclick = () => {
        state.selectedDate = new Date();
        if (state.method === 'luchao') chayLapQueLucHao();
        else chayLapQueMaiHoa();
        render();
        if (global.showToast) global.showToast('🕒 Đã đồng bộ theo thời gian thực');
      };
    }

    const btnPicker = document.getElementById('dh-btn-picker');
    if (btnPicker) {
      btnPicker.onclick = openDateTimePickerModal;
    }

    const btnSaveShot = document.getElementById('dh-btn-save-shot');
    if (btnSaveShot) {
      btnSaveShot.onclick = () => {
        if (typeof global.captureArenaScreenshot === 'function') {
          global.captureArenaScreenshot();
        } else {
          alert('Chụp ảnh màn hình lưu vào máy');
        }
      };
    }
  }

  // Modal chọn ngày giờ tùy ý (kế thừa từ logic smart_picker hoặc native date input)
  function openDateTimePickerModal() {
    let overlay = document.getElementById('dh-picker-modal-overlay');
    if (overlay) overlay.remove();

    const d = state.selectedDate;
    const pad = (n) => String(n).padStart(2, '0');
    const curVal = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    overlay = document.createElement('div');
    overlay.id = 'dh-picker-modal-overlay';
    overlay.className = 'dh-modal-overlay';
    overlay.innerHTML = `
      <div class="dh-modal-dialog">
        <div class="dh-modal-header">
          <div class="dh-modal-title">📅 CHỌN THỜI ĐIỂM CHIÊM QUẺ</div>
          <button class="dh-icon-btn" id="dh-modal-close-btn" style="border:none; background:transparent;">✕</button>
        </div>
        <div style="font-size: 0.74rem; color: #94a3b8; margin-bottom: 10px;">
          Chọn mốc thời gian để động cơ tự động tính Can Chi 4 trụ, Tiết Khí, Nguyệt Lệnh & Nhật Thần:
        </div>
        <input type="datetime-local" id="dh-custom-dt-input" class="dh-input-box" value="${curVal}">
        <div style="display: flex; gap: 8px; margin-top: 14px;">
          <button class="dh-btn secondary" id="dh-modal-cancel" style="width: 50%;">Hủy</button>
          <button class="dh-btn primary" id="dh-modal-confirm" style="width: 50%;">Xác Nhận</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    document.getElementById('dh-modal-close-btn').onclick = close;
    document.getElementById('dh-modal-cancel').onclick = close;
    document.getElementById('dh-modal-confirm').onclick = () => {
      const val = document.getElementById('dh-custom-dt-input').value;
      if (val) {
        state.selectedDate = new Date(val);
        if (state.method === 'luchao') chayLapQueLucHao();
        else chayLapQueMaiHoa();
        render();
        if (global.showToast) global.showToast(`📅 Đã cập nhật mốc thời gian: ${state.selectedDate.toLocaleString('vi-VN')}`);
      }
      close();
    };
  }

  // Public module API
  const NetaDichHocView = {
    init: () => {
      // Đăng ký render khi DOM sẵn sàng
    },
    render: render,
    setMethod: (m) => {
      state.method = m;
      render();
    }
  };

  global.NetaDichHocView = NetaDichHocView;

})(typeof window !== 'undefined' ? window : this);
