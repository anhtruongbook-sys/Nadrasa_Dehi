import os
import re

tarot_view_path = r"c:\Books\Neta Light\modules\tarot_view.js"
with open(tarot_view_path, "r", encoding="utf-8") as f:
    code = f.read()

# Make sure initRibbonDeckPool is called when view renders or changes spread
# Let's inspect where renderSpreadSubView starts
spread_subview_pattern = r"(function renderSpreadSubView\(\) \{[\s\S]*?function renderSpreadSlots\(spreadDef\) \{[\s\S]*?function areAllCardsFlipped\(\) \{)"

new_spread_subview = """function renderSpreadSubView() {
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

  function areAllCardsFlipped() {"""

code = re.sub(spread_subview_pattern, new_spread_subview, code, count=1)
print("2. Replaced renderSpreadSubView, renderSpreadSlots, and added renderRibbonWorkspaceHTML.")

# Now update bindTarotEvents to handle ribbon clicks, shuffle, quick draw, card flips
events_pattern = r"(const btnQuickDraw = container\.querySelector\('#btn-tarot-quick-draw'\);[\s\S]*?// 7\. Save to Journal)"

new_events = """const btnQuickDraw = container.querySelector('#btn-tarot-quick-draw');
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

    // 7. Save to Journal"""

code = re.sub(events_pattern, new_events, code, count=1)
print("3. Replaced event handlers in bindTarotEvents.")

with open(tarot_view_path, "w", encoding="utf-8") as f:
    f.write(code)

print("Saved updated modules/tarot_view.js successfully!")
