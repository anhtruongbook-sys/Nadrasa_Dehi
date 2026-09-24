/**
 * NETA LIGHT - CLASSICAL TAROT VIEW MODULE
 * 
 * Trải nghiệm bốc và luận giải Tarot Rider-Waite-Smith (RWS) 78 lá cổ điển.
 * Kết hợp Thuật toán Golden Dawn Elemental Dignities & Macro Scan.
 * Hoàn toàn chạy Offline 100% (Client-Side Heuristic NLG Engine).
 */

(function (global) {
  'use strict';

  // State
  let currentSubTab = 'spread'; // 'spread' | 'encyclopedia' | 'journal'
  let currentSpreadType = 'past_present_future';
  let currentDomain = 'general';
  let allowReversed = true;
  let activeDrawnCards = []; // [{cardId, isUpright, isFlipped}]
  let currentReadingReport = null;
  let encyFilter = 'all'; // 'all' | 'Major' | 'Cups' | 'Pentacles' | 'Swords' | 'Wands'
  let encySearchQuery = '';

  // Phase 2: Interactive Fanned Ribbon Deck & Audio State
  let ribbonDeckPool = []; // [{index, cardId, isUpright, isPicked}]
  let isShufflingRibbon = false;
  let audioCtx = null;

  function getAudioContext() {
    try {
      if (typeof window !== 'undefined' && window.soundEnabled === false) return null;
      if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) audioCtx = new AC();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    } catch (e) {
      return null;
    }
  }

  function playCardSlideSound() {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const bufferSize = Math.floor(ctx.sampleRate * 0.12);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.Q.setValueAtTime(1.8, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.11);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch (e) {}
  }

  function playCardFlipSound() {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  }

  function playMysticChime() {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      [528, 1056].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const vol = i === 0 ? 0.22 : 0.1;
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 1.85);
      });
    } catch (e) {}
  }

  function playShuffleSound() {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        playCardSlideSound();
      }, i * 45);
    }
  }

  function triggerHaptic(duration = 15) {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(duration);
      }
    } catch (e) {}
  }

  function initRibbonDeckPool(forceShuffle = false) {
    const engine = global.NetaTarotEngine;
    if (!engine) return;
    const all = engine.getAllCardsList();
    if (ribbonDeckPool.length === 0 || forceShuffle) {
      const copy = [...all];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      ribbonDeckPool = copy.map((card, idx) => ({
        index: idx,
        cardId: card.id,
        isUpright: allowReversed ? (Math.random() > 0.25) : true,
        isPicked: false
      }));
    }
  }

  const JOURNAL_STORAGE_KEY = 'NETA_TAROT_OFFLINE_JOURNAL_V1';

  function escapeHTML(str) {
    if (typeof str !== 'string') return str == null ? '' : String(str);
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // --- LOCAL STORAGE HELPERS FOR JOURNAL ---
  function getJournal() {
    try {
      const data = localStorage.getItem(JOURNAL_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading tarot journal', e);
      return [];
    }
  }

  function saveJournalEntry(entry) {
    try {
      const list = getJournal();
      list.unshift(entry); // newest first
      // keep max 50 entries
      if (list.length > 50) list.pop();
      localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      console.error('Error saving tarot journal', e);
      return false;
    }
  }

  function deleteJournalEntry(id) {
    try {
      let list = getJournal();
      list = list.filter(item => item.id !== id);
      localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      console.error('Error deleting tarot journal entry', e);
      return false;
    }
  }

  function clearAllJournal() {
    try {
      localStorage.removeItem(JOURNAL_STORAGE_KEY);
      return true;
    } catch (e) {
      return false;
    }
  }

  // --- INITIALIZATION & RENDER ---
  function initTarotView() {
    const container = document.getElementById('view-tarot');
    if (!container) return;
    renderTarot();
  }

  function renderTarot() {
    const container = document.getElementById('view-tarot');
    if (!container) return;

    container.innerHTML = `
      <div class="tarot-module-wrapper">
        <!-- Sub-Nav Header -->
        <div class="tarot-nav-bar">
          <div class="tarot-tabs">
            <button class="tarot-tab-btn ${currentSubTab === 'spread' ? 'active' : ''}" data-tab="spread">
              🔮 Trải Bài (Spread)
            </button>
            <button class="tarot-tab-btn ${currentSubTab === 'encyclopedia' ? 'active' : ''}" data-tab="encyclopedia">
              📖 Bách Khoa 78 Lá
            </button>
            <button class="tarot-tab-btn ${currentSubTab === 'journal' ? 'active' : ''}" data-tab="journal">
              📔 Nhật Ký (${getJournal().length})
            </button>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="tarot-subview-container" id="tarot-subview-container">
          ${renderCurrentSubView()}
        </div>
      </div>
    `;

    bindTarotEvents(container);
  }

  function renderCurrentSubView() {
    if (currentSubTab === 'spread') {
      return renderSpreadSubView();
    } else if (currentSubTab === 'encyclopedia') {
      return renderEncyclopediaSubView();
    } else if (currentSubTab === 'journal') {
      return renderJournalSubView();
    }
    return '';
  }

  // ==========================================================================
  // TAB 1: SPREAD (TRẢI BÀI)
  // ==========================================================================
  function renderSpreadSubView() {
    const engine = global.NetaTarotEngine;
    if (!engine) return '<div class="tarot-error">Không tìm thấy Động cơ Tarot!</div>';

    initRibbonDeckPool();

    const spreads = engine.getSpreadDefinitions();
    const currentSpreadDef = spreads[currentSpreadType] || spreads['past_present_future'];
    const requiredCount = currentSpreadDef.count;

    return `
      <div class="tarot-spread-workspace">
        <!-- Control Bar: Topic, Spread, Reversed Toggle, Question -->
        <div class="tarot-control-card">
          <div class="tarot-control-row">
            <div class="tarot-control-group">
              <label for="tarot-spread-select">Kiểu trải bài:</label>
              <select id="tarot-spread-select" class="tarot-select">
                <option value="past_present_future" ${currentSpreadType === 'past_present_future' ? 'selected' : ''}>3 lá: Quá khứ - Hiện tại - Tương lai</option>
                <option value="problem_solution" ${currentSpreadType === 'problem_solution' ? 'selected' : ''}>3 lá: Vấn đề & Giải pháp</option>
                <option value="relationship" ${currentSpreadType === 'relationship' ? 'selected' : ''}>3 lá: Mối quan hệ & Hai bên</option>
                <option value="decision" ${currentSpreadType === 'decision' ? 'selected' : ''}>3 lá: Lựa chọn A / B & Quyết định</option>
                <option value="single" ${currentSpreadType === 'single' ? 'selected' : ''}>1 lá: Thông điệp hàng ngày (Daily)</option>
              </select>
            </div>

            <div class="tarot-control-group">
              <label for="tarot-domain-select">Chủ đề chiêm nghiệm:</label>
              <select id="tarot-domain-select" class="tarot-select">
                <option value="general" ${currentDomain === 'general' ? 'selected' : ''}>🌟 Tổng quan vận thế</option>
                <option value="career" ${currentDomain === 'career' ? 'selected' : ''}>💼 Công việc & Tài chính</option>
                <option value="love" ${currentDomain === 'love' ? 'selected' : ''}>❤️ Tình cảm & Mối quan hệ</option>
              </select>
            </div>

            <div class="tarot-control-group tarot-checkbox-group">
              <label class="tarot-switch-label">
                <input type="checkbox" id="tarot-allow-reversed" ${allowReversed ? 'checked' : ''}>
                <span class="tarot-switch-text">Cho phép lá ngược (Reversed)</span>
              </label>
            </div>
          </div>

          <div class="tarot-question-row">
            <input type="text" id="tarot-question-input" class="tarot-question-input" 
              placeholder="Nhập câu hỏi hoặc việc bạn đang băn khoăn (ví dụ: 'Công việc sắp tới có thuận lợi không?')..." 
              value="${escapeHTML(currentReadingReport ? currentReadingReport.question : '')}">
          </div>

          <div class="tarot-action-buttons">
            <button id="btn-tarot-quick-draw" class="tarot-btn-primary">
              ⚡ Bốc Nhanh Tự Động (${requiredCount} lá)
            </button>
            ${activeDrawnCards.length === requiredCount ? `
              <button id="btn-tarot-flip-all" class="tarot-btn-secondary">
                ✨ Lật Tất Cả
              </button>
            ` : ''}
            ${activeDrawnCards.length > 0 ? `
              <button id="btn-tarot-reset-spread" class="tarot-btn-ghost">
                🔄 Bốc Lại Từ Đầu
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Spread Arena Table (Vùng Trải Bài) -->
        <div class="tarot-arena-table">
          ${renderSpreadSlots(currentSpreadDef)}
        </div>

        <!-- Interactive Fanned Ribbon Deck Ritual (Dải Quạt 78 Lá Trực Giác) -->
        ${renderRibbonWorkspaceHTML(currentSpreadDef)}

        <!-- Comprehensive Report Section -->
        <div class="tarot-report-anchor" id="tarot-report-section">
          ${currentReadingReport && areAllCardsFlipped() ? renderTarotReportHTML(currentReadingReport) : ''}
        </div>
      </div>
    `;
  }

  function renderSpreadSlots(spreadDef) {
    const positions = spreadDef.positions || [];
    const requiredCount = spreadDef.count || 3;

    return `
      <div class="tarot-cards-spread-row count-${requiredCount}">
        ${Array.from({ length: requiredCount }).map((_, index) => {
          const item = activeDrawnCards[index];
          const posLabel = positions[index] || `Vị trí ${index + 1}`;

          if (item) {
            const cardData = global.NetaTarotEngine.getCard(item.cardId);
            const isFlipped = item.isFlipped;
            const isReversed = !item.isUpright;
            const imgUrl = `assets/tarot/${item.cardId}.webp`;

            return `
              <div class="tarot-slot-wrapper slot-filled">
                <div class="tarot-slot-header">
                  <span class="tarot-slot-pos-badge">${index + 1}</span>
                  <span class="tarot-slot-pos-title">${posLabel}</span>
                </div>
                <div class="tarot-card-3d-scene" data-index="${index}">
                  <div class="tarot-card-3d ${isFlipped ? 'flipped' : ''}">
                    <!-- Back Side -->
                    <div class="tarot-card-face tarot-card-back">
                      <img src="assets/tarot/Back_Cover.webp" alt="Mặt sau bài Tarot" loading="lazy">
                      <div class="tarot-card-touch-hint">Chạm để lật</div>
                    </div>
                    <!-- Front Side -->
                    <div class="tarot-card-face tarot-card-front ${isReversed ? 'is-reversed' : ''}">
                      <img src="${imgUrl}" alt="${cardData ? cardData.name_vi : ''}" loading="lazy">
                      ${isReversed ? '<div class="tarot-reversed-badge">NGƯỢC</div>' : ''}
                    </div>
                  </div>
                </div>
                ${isFlipped && cardData ? `
                  <div class="tarot-slot-card-meta">
                    <div class="tarot-meta-name">${cardData.name_vi}</div>
                    <div class="tarot-meta-sub">${cardData.name_en} • ${item.isUpright ? 'Xuôi' : 'Ngược'}</div>
                  </div>
                ` : `
                  <div class="tarot-slot-card-meta placeholder">
                    <div class="tarot-meta-name">Đang úp</div>
                    <div class="tarot-meta-sub">Chạm để mở lá bài</div>
                  </div>
                `}
              </div>
            `;
          } else {
            const isCurrentTarget = index === activeDrawnCards.length;
            return `
              <div class="tarot-slot-wrapper slot-pending">
                <div class="tarot-slot-header">
                  <span class="tarot-slot-pos-badge ${isCurrentTarget ? 'active-step' : 'pending'}">${index + 1}</span>
                  <span class="tarot-slot-pos-title">${posLabel}</span>
                </div>
                <div class="tarot-slot-empty ${isCurrentTarget ? 'slot-current-target' : ''}">
                  <div class="slot-target-glow"></div>
                  <div class="slot-target-icon">${isCurrentTarget ? '✨' : '🃏'}</div>
                  <div class="slot-target-label">${isCurrentTarget ? 'Chạm dải bài bên dưới' : `Chờ chọn lá ${index + 1}`}</div>
                </div>
                <div class="tarot-slot-card-meta placeholder">
                  <div class="tarot-meta-name">${isCurrentTarget ? 'Đang chờ chọn' : 'Chưa chọn'}</div>
                  <div class="tarot-meta-sub">${posLabel}</div>
                </div>
              </div>
            `;
          }
        }).join('')}
      </div>
    `;
  }

  function renderRibbonWorkspaceHTML(spreadDef) {
    const requiredCount = spreadDef.count || 3;
    const currentStep = activeDrawnCards.length;
    const positions = spreadDef.positions || [];
    const isCompleted = currentStep >= requiredCount;

    if (isCompleted) {
      return `
        <div class="tarot-spread-ready-banner">
          <div class="ready-badge">✨ Bàn bài đã sẵn sàng (${requiredCount}/${requiredCount} lá)</div>
          <div class="ready-desc">Chạm vào từng lá bài để lật mở theo trực giác, hoặc bấm <strong>✨ Lật Tất Cả</strong></div>
        </div>
      `;
    }

    const currentPosLabel = positions[currentStep] || `Lá thứ ${currentStep + 1}`;

    return `
      <div class="tarot-ribbon-workspace">
        <div class="tarot-ribbon-instruction">
          <div class="ribbon-step-badge">Bước ${currentStep + 1} / ${requiredCount}</div>
          <div class="ribbon-prompt-text">
            Hãy tĩnh tâm, nghĩ về câu hỏi và <strong>chạm chọn 1 lá bài</strong> theo trực giác cho vị trí:
            <span class="ribbon-target-pos">${currentPosLabel}</span>
          </div>
        </div>

        <div class="tarot-ribbon-viewport" id="tarot-ribbon-viewport">
          <div class="tarot-ribbon-track ${isShufflingRibbon ? 'is-shuffling' : ''}" id="tarot-ribbon-track">
            ${ribbonDeckPool.map((c, idx) => {
              const waveY = Math.round(Math.sin(idx * 0.4) * 6);
              const rot = ((idx % 7) - 3) * 0.8;
              return `
                <div class="tarot-ribbon-card ${c.isPicked ? 'is-picked' : ''}" 
                  data-ribbon-idx="${idx}"
                  style="transform: translateY(${waveY}px) rotate(${rot}deg);"
                  title="Chạm để chọn lá bài này">
                  <img src="assets/tarot/Back_Cover.webp" alt="Mặt sau bài Tarot" loading="lazy">
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="tarot-ribbon-footer-bar">
          <div class="ribbon-scroll-hint">👈 Vuốt ngang để lướt qua toàn bộ 78 lá bài 👉</div>
          <div class="ribbon-tool-buttons">
            <button id="btn-tarot-shuffle-ribbon" class="tarot-btn-subtle" title="Xáo trộn lại toàn bộ 78 lá bài">
              🔄 Xáo Bộ Bài
            </button>
            <button id="btn-tarot-pick-current" class="tarot-btn-subtle" title="Tự động chọn ngẫu nhiên lá bài tiếp theo">
              ⚡ Bốc Hộ Tôi Lá Này
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function areAllCardsFlipped() {
    if (activeDrawnCards.length === 0) return false;
    return activeDrawnCards.every(c => c.isFlipped);
  }

  // --- RENDER BÁO CÁO LUẬN GIẢI TAROT ---
  function renderTarotReportHTML(report) {
    if (!report) return '';

    return `
      <div class="tarot-report-card">
        <div class="tarot-report-header">
          <div class="tarot-report-badge">📜 BÁO CÁO LUẬN GIẢI TAROT CHUYÊN SÂU</div>
          <h2 class="tarot-report-title">${escapeHTML(report.question || 'Chiêm Nghiệm Vận Thế')}</h2>
          <div class="tarot-report-meta">
            <span>📅 ${report.timestamp}</span>
            <span>•</span>
            <span>Trải bài: ${report.spreadName}</span>
            <span>•</span>
            <span>Chủ đề: <strong>${report.domain.toUpperCase()}</strong></span>
          </div>
        </div>

        <!-- PHẦN I: LÁ BÀI CỐT TỦY & BÀI HỌC LINH HỒN (THE QUINTESSENCE) -->
        ${report.quintessence ? `
          <div class="tarot-section-box tarot-quintessence-box">
            <div class="tarot-section-header">
              <span class="tarot-sec-icon">🔮</span>
              <span class="tarot-sec-title">I. LÁ BÀI CỐT TỦY (THE QUINTESSENCE CARD)</span>
            </div>
            <div class="tarot-quint-content">
              <div class="tarot-quint-img-wrap">
                <img src="assets/tarot/${report.quintessence.imageWebp}" alt="${report.quintessence.nameVi}" class="tarot-quint-img">
              </div>
              <div class="tarot-quint-info">
                <div class="tarot-quint-title">
                  <span class="quint-name">${report.quintessence.nameVi}</span>
                  <span class="quint-sub">${report.quintessence.nameEn}</span>
                  <span class="quint-num-badge">Số học: ${report.quintessence.rawSum} ➔ ${report.quintessence.reducedNumber}</span>
                </div>
                <div class="tarot-quint-lesson">
                  <strong>✨ Bài học linh hồn cốt lõi:</strong>
                  <p>${report.quintessence.lesson}</p>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- PHẦN II: MẠCH TRUYỆN BIỆN CHỨNG (SYNTHESIZED STORYLINE NARRATIVE) -->
        <div class="tarot-section-box tarot-storyline-box">
          <div class="tarot-section-header">
            <span class="tarot-sec-icon">📜</span>
            <span class="tarot-sec-title">II. TỔNG LUẬN MẠCH TRUYỆN BIỆN CHỨNG (STORYLINE NARRATIVE)</span>
          </div>
          <div class="tarot-storyline-content">
            <blockquote>${report.synthesizedStory}</blockquote>
          </div>
        </div>

        <!-- PHẦN III: MẪU HÌNH CỔ MẪU NỔI BẬT (ARCHETYPAL CONSTELLATIONS) -->
        ${report.archetypalPatterns && report.archetypalPatterns.length > 0 ? `
          <div class="tarot-section-box tarot-patterns-box">
            <div class="tarot-section-header">
              <span class="tarot-sec-icon">🌌</span>
              <span class="tarot-sec-title">III. MẪU HÌNH CỔ MẪU NỔI BẬT (ARCHETYPAL PATTERNS)</span>
            </div>
            <div class="tarot-patterns-list">
              ${report.archetypalPatterns.map(p => `
                <div class="tarot-pattern-item">
                  <div class="pattern-header">
                    <span class="pattern-title">${p.title}</span>
                    <span class="pattern-badge">${p.badge}</span>
                  </div>
                  <div class="pattern-desc">${p.desc}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- PHẦN IV: MACRO SCAN & ELEMENTAL DIGNITIES -->
        <div class="tarot-section-box">
          <div class="tarot-section-header">
            <span class="tarot-sec-icon">🔬</span>
            <span class="tarot-sec-title">IV. PHÂN TÍCH ĐỊNH LƯỢNG VĨ MÔ (MACRO SCAN)</span>
          </div>
          <div class="tarot-macro-grid">
            <div class="tarot-macro-item">
              <span class="macro-label">Bản chất trải bài (Fate vs Free-will):</span>
              <strong class="macro-val fate-verdict">${report.fateVerdict}</strong>
            </div>
            <div class="tarot-macro-item">
              <span class="macro-label">Tỷ lệ Ẩn chính (Major Arcana):</span>
              <span class="macro-val">${report.majorRatio}</span>
            </div>
            <div class="tarot-macro-item">
              <span class="macro-label">Trạng thái chiều bài:</span>
              <span class="macro-val">${report.orientationStat}</span>
            </div>
            <div class="tarot-macro-item">
              <span class="macro-label">Nguyên tố thống trị:</span>
              <strong class="macro-val elem-dominant">${report.dominantElement}</strong>
            </div>
            <div class="tarot-macro-item">
              <span class="macro-label">Nguyên tố vắng bóng cần bù đắp:</span>
              <span class="macro-val">${report.missingElementsDesc}</span>
            </div>
            <div class="tarot-macro-item">
              <span class="macro-label">Dòng chảy năng lượng tổng thể:</span>
              <strong class="macro-val flow-verdict">${report.flowVerdict}</strong>
            </div>
          </div>

          ${report.pairAnalysis && report.pairAnalysis.length > 0 ? `
            <div class="tarot-dignities-box">
              <div class="dignities-title">Ma trận tương tác nguyên tố (Golden Dawn Elemental Dignities):</div>
              <div class="dignities-list">
                ${report.pairAnalysis.map(p => `
                  <div class="dignity-row">
                    <span class="dignity-pair"><strong>${p.fromCard}</strong> ➔ <strong>${p.toCard}</strong> [${p.pair}]</span>
                    <span class="dignity-badge relation-${p.relation}">${p.relation} (${p.score > 0 ? '+' : ''}${p.score})</span>
                    <span class="dignity-desc">${p.explanation}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- PHẦN V: CHI TIẾT TỪNG LÁ BÀI -->
        <div class="tarot-section-box">
          <div class="tarot-section-header">
            <span class="tarot-sec-icon">🃏</span>
            <span class="tarot-sec-title">V. LUẬN GIẢI CHI TIẾT TỪNG VỊ TRÍ</span>
          </div>
          <div class="tarot-cards-reading-list">
            ${report.cardReadings.map(c => `
              <div class="tarot-card-reading-card">
                <div class="reading-card-left">
                  <img src="assets/tarot/${c.imageWebp}" alt="${c.cardName}" class="reading-card-thumb ${c.isUpright ? '' : 'is-reversed'}">
                  <div class="reading-card-orientation ${c.isUpright ? 'upright' : 'reversed'}">${c.orientation}</div>
                </div>
                <div class="reading-card-right">
                  <div class="reading-card-pos">${c.position}</div>
                  <h3 class="reading-card-name">${c.cardName}</h3>
                  <div class="reading-card-tags">
                    <span class="tarot-tag arcana">${c.arcana} Arcana</span>
                    <span class="tarot-tag element">Nguyên tố ${c.element}</span>
                  </div>
                  <div class="reading-card-keywords">
                    <strong>Từ khóa:</strong> <span>${c.keywords}</span>
                  </div>
                  <div class="reading-card-desc">
                    ${c.detailMeaning}
                  </div>
                  <div class="reading-card-advice">
                    <strong>💡 Lời khuyên:</strong> <em>${c.advice}</em>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- PHẦN VI: TỔNG KẾT & LỜI KHUYÊN HÀNH ĐỘNG -->
        <div class="tarot-section-box tarot-prescription-box">
          <div class="tarot-section-header">
            <span class="tarot-sec-icon">🎯</span>
            <span class="tarot-sec-title">VI. TỔNG KẾT & LỜI KHUYÊN HÀNH ĐỘNG (ACTIONABLE PRESCRIPTION)</span>
          </div>
          <div class="tarot-prescription-content">
            <blockquote>${report.finalAdvice}</blockquote>
          </div>
        </div>

        <!-- Report Footer Actions -->
        <div class="tarot-report-actions">
          <button id="btn-tarot-save-journal" class="tarot-btn-primary">
            💾 Lưu Vào Nhật Ký
          </button>
          <button id="btn-tarot-copy-markdown" class="tarot-btn-secondary">
            📋 Sao Chép Markdown
          </button>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // TAB 2: ENCYCLOPEDIA (BÁCH KHOA TOÀN THƯ 78 LÁ BÀI)
  // ==========================================================================
  function renderEncyclopediaSubView() {
    const engine = global.NetaTarotEngine;
    if (!engine) return '';
    const allCards = engine.getAllCardsList();

    const filtered = allCards.filter(c => {
      // Filter by Arcana / Suit
      if (encyFilter === 'Major' && c.arcana !== 'Major') return false;
      if (encyFilter === 'Cups' && !c.id.startsWith('Cups')) return false;
      if (encyFilter === 'Pentacles' && !c.id.startsWith('Pentacles')) return false;
      if (encyFilter === 'Swords' && !c.id.startsWith('Swords')) return false;
      if (encyFilter === 'Wands' && !c.id.startsWith('Wands')) return false;

      // Filter by search query
      if (encySearchQuery) {
        const q = encySearchQuery.toLowerCase().trim();
        const matchNameVi = c.name_vi.toLowerCase().includes(q);
        const matchNameEn = c.name_en.toLowerCase().includes(q);
        const matchKeywords = (c.keywords_up + ' ' + c.keywords_rev).toLowerCase().includes(q);
        return matchNameVi || matchNameEn || matchKeywords;
      }
      return true;
    });

    return `
      <div class="tarot-encyclopedia-workspace">
        <div class="tarot-ency-filter-bar">
          <div class="tarot-ency-search">
            <input type="text" id="tarot-ency-search-input" placeholder="🔍 Tìm theo tên lá bài (ví dụ: Kẻ Khờ, The Fool, Cups, Kiếm...)" value="${escapeHTML(encySearchQuery)}">
          </div>
          <div class="tarot-ency-tabs">
            <button class="ency-filter-btn ${encyFilter === 'all' ? 'active' : ''}" data-filter="all">Tất cả (78)</button>
            <button class="ency-filter-btn ${encyFilter === 'Major' ? 'active' : ''}" data-filter="Major">Ẩn chính (22)</button>
            <button class="ency-filter-btn ${encyFilter === 'Cups' ? 'active' : ''}" data-filter="Cups">Cốc (Cups - 14)</button>
            <button class="ency-filter-btn ${encyFilter === 'Pentacles' ? 'active' : ''}" data-filter="Pentacles">Tiền (Pentacles - 14)</button>
            <button class="ency-filter-btn ${encyFilter === 'Swords' ? 'active' : ''}" data-filter="Swords">Kiếm (Swords - 14)</button>
            <button class="ency-filter-btn ${encyFilter === 'Wands' ? 'active' : ''}" data-filter="Wands">Gậy (Wands - 14)</button>
          </div>
        </div>

        <div class="tarot-ency-grid">
          ${filtered.map(c => `
            <div class="tarot-ency-card-item" data-id="${c.id}">
              <div class="ency-card-img-wrap">
                <img src="assets/tarot/${c.id}.webp" alt="${c.name_vi}" loading="lazy">
              </div>
              <div class="ency-card-info">
                <div class="ency-card-name-vi">${c.name_vi}</div>
                <div class="ency-card-name-en">${c.name_en}</div>
                <div class="ency-card-tags">
                  <span class="ency-tag">${c.arcana}</span>
                  <span class="ency-tag">${c.element}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // TAB 3: JOURNAL (NHẬT KÝ TRẢI BÀI)
  // ==========================================================================
  function renderJournalSubView() {
    const list = getJournal();

    if (list.length === 0) {
      return `
        <div class="tarot-journal-empty">
          <div class="journal-empty-icon">📔</div>
          <h3>Chưa có bản ghi nhật ký nào</h3>
          <p>Khi bạn thực hiện trải bài và bấm <strong>💾 Lưu Vào Nhật Ký</strong>, kết quả chiêm nghiệm sẽ được lưu trữ cục bộ bảo mật 100% tại đây.</p>
        </div>
      `;
    }

    return `
      <div class="tarot-journal-workspace">
        <div class="tarot-journal-header">
          <div class="journal-title-box">
            <h3>Nhật Ký Chiêm Nghiệm Tarot (${list.length} lần xem)</h3>
            <span class="journal-subtitle">Lưu trữ bảo mật hoàn toàn trên thiết bị của bạn</span>
          </div>
          <button id="btn-tarot-clear-journal" class="tarot-btn-ghost danger">
            🗑️ Xóa Toàn Bộ
          </button>
        </div>

        <div class="tarot-journal-list">
          ${list.map(entry => `
            <div class="tarot-journal-item" data-id="${entry.id}">
              <div class="journal-item-head">
                <div class="journal-item-date">📅 ${entry.timestamp}</div>
                <div class="journal-item-badges">
                  <span class="journal-badge">${entry.spreadName}</span>
                  <span class="journal-badge">${entry.domain.toUpperCase()}</span>
                </div>
                <button class="btn-delete-entry" data-id="${entry.id}" title="Xóa bản ghi này">✕</button>
              </div>

              <div class="journal-item-question">
                <strong>Hỏi:</strong> ${escapeHTML(entry.question || 'Chiêm nghiệm tổng quan')}
              </div>

              <div class="journal-item-cards-row">
                ${entry.drawnCards.map(c => {
                  const cardData = global.NetaTarotEngine.getCard(c.cardId);
                  return `
                    <div class="journal-mini-card">
                      <img src="assets/tarot/${c.cardId}.webp" alt="${cardData ? cardData.name_vi : ''}" class="${c.isUpright ? '' : 'is-reversed'}">
                      <div class="mini-name">${cardData ? cardData.name_vi : c.cardId}</div>
                      <div class="mini-orient">${c.isUpright ? 'Xuôi' : 'Ngược'}</div>
                    </div>
                  `;
                }).join('')}
              </div>

              <div class="journal-item-advice">
                <strong>Lời khuyên:</strong> ${entry.finalAdvice}
              </div>

              <div class="journal-item-actions">
                <button class="tarot-btn-secondary btn-view-journal-detail" data-id="${entry.id}">
                  👁️ Xem Chi Tiết Báo Cáo
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // EVENT BINDINGS
  // ==========================================================================
  function bindTarotEvents(container) {
    // 1. Sub-Tabs
    container.querySelectorAll('.tarot-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        if (tab && tab !== currentSubTab) {
          currentSubTab = tab;
          renderTarot();
        }
      });
    });

    // 2. Spread Select & Domain Select
    const spreadSelect = container.querySelector('#tarot-spread-select');
    if (spreadSelect) {
      spreadSelect.addEventListener('change', (e) => {
        currentSpreadType = e.target.value;
        activeDrawnCards = [];
        currentReadingReport = null;
        renderTarot();
      });
    }

    const domainSelect = container.querySelector('#tarot-domain-select');
    if (domainSelect) {
      domainSelect.addEventListener('change', (e) => {
        currentDomain = e.target.value;
        if (currentReadingReport) {
          // Re-evaluate with new domain
          const qInput = container.querySelector('#tarot-question-input');
          const q = qInput ? qInput.value.trim() : '';
          currentReadingReport = global.NetaTarotEngine.evaluateSpread(activeDrawnCards, currentSpreadType, currentDomain, q);
          renderTarot();
        }
      });
    }

    const reversedCheck = container.querySelector('#tarot-allow-reversed');
    if (reversedCheck) {
      reversedCheck.addEventListener('change', (e) => {
        allowReversed = e.target.checked;
      });
    }

    // 3. Quick Draw Button & Deck Stack Click
    const btnQuickDraw = container.querySelector('#btn-tarot-quick-draw');
    const engine = global.NetaTarotEngine;

    // Helper: Execute complete draw (for Quick Draw)
    const handleQuickDrawCards = () => {
      if (!engine) return;
      const spreads = engine.getSpreadDefinitions();
      const count = (spreads[currentSpreadType] || spreads['past_present_future']).count;

      const qInput = container.querySelector('#tarot-question-input');
      const question = qInput ? qInput.value.trim() : '';
      if (question && currentDomain === 'general') {
        currentDomain = engine.detectDomainFromQuestion(question);
      }

      initRibbonDeckPool();
      // Mark first 'count' cards as picked
      const drawn = [];
      let drawnCount = 0;
      for (let i = 0; i < ribbonDeckPool.length && drawnCount < count; i++) {
        if (!ribbonDeckPool[i].isPicked) {
          ribbonDeckPool[i].isPicked = true;
          drawn.push({
            cardId: ribbonDeckPool[i].cardId,
            isUpright: ribbonDeckPool[i].isUpright,
            isFlipped: false
          });
          drawnCount++;
        }
      }

      activeDrawnCards = drawn;
      currentReadingReport = engine.evaluateSpread(activeDrawnCards, currentSpreadType, currentDomain, question);

      playShuffleSound();
      triggerHaptic(20);
      renderTarot();

      setTimeout(() => {
        const table = document.querySelector('.tarot-arena-table');
        if (table) table.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    };

    if (btnQuickDraw) btnQuickDraw.addEventListener('click', handleQuickDrawCards);

    // Interactive Ribbon Card Selection
    container.querySelectorAll('.tarot-ribbon-card').forEach(cardEl => {
      cardEl.addEventListener('click', () => {
        const idx = parseInt(cardEl.getAttribute('data-ribbon-idx'), 10);
        if (isNaN(idx) || !ribbonDeckPool[idx] || ribbonDeckPool[idx].isPicked) return;

        const spreads = engine.getSpreadDefinitions();
        const requiredCount = (spreads[currentSpreadType] || spreads['past_present_future']).count;
        if (activeDrawnCards.length >= requiredCount) return;

        ribbonDeckPool[idx].isPicked = true;
        activeDrawnCards.push({
          cardId: ribbonDeckPool[idx].cardId,
          isUpright: ribbonDeckPool[idx].isUpright,
          isFlipped: false
        });

        playCardSlideSound();
        triggerHaptic(15);

        if (activeDrawnCards.length === requiredCount) {
          const qInput = container.querySelector('#tarot-question-input');
          const question = qInput ? qInput.value.trim() : '';
          if (question && currentDomain === 'general') {
            currentDomain = engine.detectDomainFromQuestion(question);
          }
          currentReadingReport = engine.evaluateSpread(activeDrawnCards, currentSpreadType, currentDomain, question);
          playMysticChime();
        }

        renderTarot();

        setTimeout(() => {
          const table = document.querySelector('.tarot-arena-table');
          if (table) table.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 150);
      });
    });

    // Ribbon Shuffle Button
    const btnShuffleRibbon = container.querySelector('#btn-tarot-shuffle-ribbon');
    if (btnShuffleRibbon) {
      btnShuffleRibbon.addEventListener('click', () => {
        isShufflingRibbon = true;
        playShuffleSound();
        triggerHaptic(30);

        const track = container.querySelector('#tarot-ribbon-track');
        if (track) track.classList.add('is-shuffling');

        setTimeout(() => {
          initRibbonDeckPool(true);
          activeDrawnCards = [];
          currentReadingReport = null;
          isShufflingRibbon = false;
          renderTarot();
        }, 550);
      });
    }

    // Ribbon Auto-Pick Next Card
    const btnPickCurrent = container.querySelector('#btn-tarot-pick-current');
    if (btnPickCurrent) {
      btnPickCurrent.addEventListener('click', () => {
        const spreads = engine.getSpreadDefinitions();
        const requiredCount = (spreads[currentSpreadType] || spreads['past_present_future']).count;
        if (activeDrawnCards.length >= requiredCount) return;

        const nextIdx = ribbonDeckPool.findIndex(c => !c.isPicked);
        if (nextIdx !== -1) {
          ribbonDeckPool[nextIdx].isPicked = true;
          activeDrawnCards.push({
            cardId: ribbonDeckPool[nextIdx].cardId,
            isUpright: ribbonDeckPool[nextIdx].isUpright,
            isFlipped: false
          });

          playCardSlideSound();
          triggerHaptic(15);

          if (activeDrawnCards.length === requiredCount) {
            const qInput = container.querySelector('#tarot-question-input');
            const question = qInput ? qInput.value.trim() : '';
            if (question && currentDomain === 'general') {
              currentDomain = engine.detectDomainFromQuestion(question);
            }
            currentReadingReport = engine.evaluateSpread(activeDrawnCards, currentSpreadType, currentDomain, question);
            playMysticChime();
          }

          renderTarot();
        }
      });
    }

    // Flip Cards interaction (3D click)
    container.querySelectorAll('.tarot-card-3d-scene').forEach(scene => {
      scene.addEventListener('click', () => {
        const idx = parseInt(scene.getAttribute('data-index'), 10);
        if (!isNaN(idx) && activeDrawnCards[idx]) {
          activeDrawnCards[idx].isFlipped = !activeDrawnCards[idx].isFlipped;
          playCardFlipSound();
          triggerHaptic(15);
          renderTarot();
          if (areAllCardsFlipped()) {
            setTimeout(() => {
              const rep = document.getElementById('tarot-report-section');
              if (rep) rep.scrollIntoView({ behavior: 'smooth' });
            }, 300);
          }
        }
      });
    });

    // Flip All
    const btnFlipAll = container.querySelector('#btn-tarot-flip-all');
    if (btnFlipAll) {
      btnFlipAll.addEventListener('click', () => {
        activeDrawnCards.forEach(c => c.isFlipped = true);
        playCardFlipSound();
        triggerHaptic(20);
        renderTarot();
        setTimeout(() => {
          const rep = document.getElementById('tarot-report-section');
          if (rep) rep.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      });
    }

    // Reset Spread
    const btnReset = container.querySelector('#btn-tarot-reset-spread');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        activeDrawnCards = [];
        currentReadingReport = null;
        initRibbonDeckPool(true);
        renderTarot();
      });
    }

    // 7. Save to Journal
    const btnSaveJournal = container.querySelector('#btn-tarot-save-journal');
    if (btnSaveJournal && currentReadingReport) {
      btnSaveJournal.addEventListener('click', () => {
        const entry = {
          id: 'tarot_' + Date.now(),
          timestamp: currentReadingReport.timestamp,
          spreadType: currentSpreadType,
          spreadName: currentReadingReport.spreadName,
          domain: currentReadingReport.domain,
          question: currentReadingReport.question,
          drawnCards: activeDrawnCards.map(c => ({
            cardId: c.cardId,
            isUpright: c.isUpright
          })),
          fateVerdict: currentReadingReport.fateVerdict,
          finalAdvice: currentReadingReport.finalAdvice,
          fullReport: currentReadingReport
        };
        const ok = saveJournalEntry(entry);
        if (ok) {
          if (typeof window.showToast === 'function') {
            window.showToast('✅ Đã lưu kết quả trải bài vào Nhật Ký!');
          } else {
            alert('Đã lưu kết quả vào Nhật ký!');
          }
          btnSaveJournal.textContent = '✅ Đã Lưu';
          btnSaveJournal.disabled = true;
        }
      });
    }

    // 8. Copy Markdown
    const btnCopyMd = container.querySelector('#btn-tarot-copy-markdown');
    if (btnCopyMd && currentReadingReport) {
      btnCopyMd.addEventListener('click', () => {
        const md = global.NetaTarotEngine.formatMarkdownReport(currentReadingReport);
        navigator.clipboard.writeText(md).then(() => {
          if (typeof window.showToast === 'function') {
            window.showToast('📋 Đã sao chép Báo cáo Markdown vào Clipboard!');
          } else {
            alert('Đã sao chép Markdown!');
          }
        }).catch(() => {
          alert('Không thể sao chép tự động, vui lòng thử lại.');
        });
      });
    }

    // 9. Encyclopedia Interactions
    const searchInput = container.querySelector('#tarot-ency-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        encySearchQuery = e.target.value;
        const grid = container.querySelector('.tarot-ency-grid');
        if (grid) {
          grid.innerHTML = renderEncyclopediaGridOnly();
          bindEncyclopediaCardClicks(container);
        }
      });
    }

    container.querySelectorAll('.ency-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        encyFilter = btn.getAttribute('data-filter') || 'all';
        renderTarot();
      });
    });

    bindEncyclopediaCardClicks(container);

    // 10. Journal Actions
    const btnClearAllJournal = container.querySelector('#btn-tarot-clear-journal');
    if (btnClearAllJournal) {
      btnClearAllJournal.addEventListener('click', () => {
        if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử Nhật Ký Tarot không?')) {
          clearAllJournal();
          renderTarot();
          if (typeof window.showToast === 'function') {
            window.showToast('Đã xóa toàn bộ nhật ký.');
          }
        }
      });
    }

    container.querySelectorAll('.btn-delete-entry').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (id && confirm('Xóa bản ghi chiêm nghiệm này?')) {
          deleteJournalEntry(id);
          renderTarot();
        }
      });
    });

    container.querySelectorAll('.btn-view-journal-detail').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const list = getJournal();
        const entry = list.find(it => it.id === id);
        if (entry && entry.fullReport) {
          currentReadingReport = entry.fullReport;
          currentSpreadType = entry.spreadType;
          currentDomain = entry.domain;
          activeDrawnCards = entry.drawnCards.map(c => ({
            ...c,
            isFlipped: true
          }));
          currentSubTab = 'spread';
          renderTarot();
          setTimeout(() => {
            const rep = document.getElementById('tarot-report-section');
            if (rep) rep.scrollIntoView({ behavior: 'smooth' });
          }, 200);
        }
      });
    });
  }

  function renderEncyclopediaGridOnly() {
    const engine = global.NetaTarotEngine;
    if (!engine) return '';
    const allCards = engine.getAllCardsList();

    const filtered = allCards.filter(c => {
      if (encyFilter === 'Major' && c.arcana !== 'Major') return false;
      if (encyFilter === 'Cups' && !c.id.startsWith('Cups')) return false;
      if (encyFilter === 'Pentacles' && !c.id.startsWith('Pentacles')) return false;
      if (encyFilter === 'Swords' && !c.id.startsWith('Swords')) return false;
      if (encyFilter === 'Wands' && !c.id.startsWith('Wands')) return false;

      if (encySearchQuery) {
        const q = encySearchQuery.toLowerCase().trim();
        const matchNameVi = c.name_vi.toLowerCase().includes(q);
        const matchNameEn = c.name_en.toLowerCase().includes(q);
        const matchKeywords = (c.keywords_up + ' ' + c.keywords_rev).toLowerCase().includes(q);
        return matchNameVi || matchNameEn || matchKeywords;
      }
      return true;
    });

    return filtered.map(c => `
      <div class="tarot-ency-card-item" data-id="${c.id}">
        <div class="ency-card-img-wrap">
          <img src="assets/tarot/${c.id}.webp" alt="${c.name_vi}" loading="lazy">
        </div>
        <div class="ency-card-info">
          <div class="ency-card-name-vi">${c.name_vi}</div>
          <div class="ency-card-name-en">${c.name_en}</div>
          <div class="ency-card-tags">
            <span class="ency-tag">${c.arcana}</span>
            <span class="ency-tag">${c.element}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  function bindEncyclopediaCardClicks(container) {
    container.querySelectorAll('.tarot-ency-card-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        if (id) openTarotCardDetailModal(id);
      });
    });
  }

  // --- POPUP CHI TIẾT LÁ BÀI TAROT ---
  function openTarotCardDetailModal(cardId) {
    const engine = global.NetaTarotEngine;
    if (!engine) return;
    const c = engine.getCard(cardId);
    if (!c) return;

    let modal = document.getElementById('tarot-detail-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'tarot-detail-modal';
      modal.className = 'modal-overlay tarot-detail-modal';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-dialog tarot-modal-dialog">
        <button class="modal-close" id="tarot-modal-close-btn">&times;</button>
        <div class="tarot-modal-content">
          <div class="tarot-modal-img-col">
            <img src="assets/tarot/${c.id}.webp" alt="${c.name_vi}" class="tarot-modal-img">
            <div class="tarot-modal-tags">
              <span class="tarot-tag">${c.arcana} Arcana</span>
              <span class="tarot-tag">Nguyên tố ${c.element}</span>
              ${c.number !== undefined ? `<span class="tarot-tag">Số ${c.number}</span>` : ''}
            </div>
          </div>
          <div class="tarot-modal-info-col">
            <h2 class="tarot-modal-title">${c.name_vi}</h2>
            <div class="tarot-modal-sub">${c.name_en}</div>

            <div class="tarot-info-block">
              <h4>🔑 Từ khóa Xuôi (Upright):</h4>
              <p>${c.keywords_up}</p>
            </div>

            <div class="tarot-info-block">
              <h4>🔄 Từ khóa Ngược (Reversed):</h4>
              <p>${c.keywords_rev}</p>
            </div>

            <div class="tarot-info-block">
              <h4>🌟 Ý nghĩa Tổng quan:</h4>
              <p>${c.meanings ? c.meanings.general : ''}</p>
            </div>

            <div class="tarot-info-block">
              <h4>💼 Công việc & Tài chính:</h4>
              <p>${c.meanings ? c.meanings.career : ''}</p>
            </div>

            <div class="tarot-info-block">
              <h4>❤️ Tình cảm & Mối quan hệ:</h4>
              <p>${c.meanings ? c.meanings.love : ''}</p>
            </div>

            <div class="tarot-info-block tarot-advice-block">
              <h4>💡 Lời khuyên vàng:</h4>
              <p><em>${c.advice}</em></p>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    const closeBtn = modal.querySelector('#tarot-modal-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => { modal.style.display = 'none'; };
    }
    modal.onclick = (e) => {
      if (e.target === modal) modal.style.display = 'none';
    };
  }

  // Export module
  const NetaTarotView = {
    init: initTarotView,
    render: renderTarot,
    openCardDetail: openTarotCardDetailModal
  };

  global.NetaTarotView = NetaTarotView;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTarotView);
  } else {
    initTarotView();
  }
})(typeof window !== 'undefined' ? window : global);
