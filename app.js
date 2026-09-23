/**
 * NETA LIGHT - LOGIC & DYNAMIC LAYOUT ENGINE
 * Pháp môn Nadrasa Dehi
 */

(function () {
  'use strict';

  // State
  let availableDeck = [];
  let drawnCards = [];
  let currentModalIndex = 0;
  let soundEnabled = true;
  let audioCtx = null;

  // DOM Elements
  const emptyState = document.getElementById('empty-state');
  const arenaHint = document.getElementById('arena-hint');
  const cardsGrid = document.getElementById('cards-grid');
  const initialControls = document.getElementById('initial-controls');
  const sessionControls = document.getElementById('session-controls');
  const deckRemainingText = document.getElementById('deck-remaining-text');
  const drawnCountText = document.getElementById('drawn-count-text');
  const btnRemainingSub = document.getElementById('btn-remaining-sub');
  const btnSound = document.getElementById('btn-sound');
  const soundIcon = document.getElementById('sound-icon');
  const btnGuide = document.getElementById('btn-guide');
  const toast = document.getElementById('toast');

  // Modal Elements
  const cardModal = document.getElementById('card-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalBodyContent = document.getElementById('modal-body-content');
  const modalPrevBtn = document.getElementById('modal-prev-btn');
  const modalNextBtn = document.getElementById('modal-next-btn');
  const modalCardCounter = document.getElementById('modal-card-counter');

  // Guide Elements
  const guideModal = document.getElementById('guide-modal');
  const guideCloseBtn = document.getElementById('guide-close-btn');
  const guideSearchInput = document.getElementById('guide-search-input');
  const guideCardsList = document.getElementById('guide-cards-list');

  // Initialize
  function init() {
    resetDeck();
    bindEvents();
    renderGuideList();
    registerServiceWorker();
    preloadAllCardImages();
  }

  // Preload all 48 cards silently into browser memory
  function preloadAllCardImages() {
    if (typeof NETA_CARDS_DATA !== 'undefined') {
      // Preload back card first
      const back = new Image();
      back.src = 'neta_cards/card_back.png';

      // Preload all front cards
      NETA_CARDS_DATA.forEach((card) => {
        const img = new Image();
        img.src = card.image;
      });
    }
  }

  // Audio System using Web Audio API (Chime/Bell)
  function playBellChime() {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      // Tibetan Singing Bowl Harmony
      const freqs = [528, 792, 1056];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.12 / (idx + 1), ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 2.5);
      });
    } catch (e) {
      console.warn('Audio not supported or blocked:', e);
    }
  }

  function playFlipChime() {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Ignored
    }
  }

  function playCardSlideSound() {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(554, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      // Ignored
    }
  }

  // Reset / Initialize Deck
  function resetDeck() {
    availableDeck = [...NETA_CARDS_DATA];
    drawnCards = [];
    shuffleDeck(availableDeck);
    updateStatusBar();
    showEmptyState();
  }

  // Fisher-Yates Shuffle
  function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  // Update Status Bar and Counter text
  function updateStatusBar() {
    const remaining = availableDeck.length;
    const drawn = drawnCards.length;

    deckRemainingText.textContent = `Bộ bài: Còn ${remaining}/48 lá`;
    drawnCountText.textContent = drawn;
    if (btnRemainingSub) {
      btnRemainingSub.textContent = `(Còn ${remaining})`;
    }

    const drawMoreBtn = document.getElementById('btn-draw-more');
    if (drawMoreBtn) {
      if (remaining === 0) {
        drawMoreBtn.disabled = true;
        drawMoreBtn.style.opacity = '0.5';
        drawMoreBtn.style.pointerEvents = 'none';
      } else {
        drawMoreBtn.disabled = false;
        drawMoreBtn.style.opacity = '1';
        drawMoreBtn.style.pointerEvents = 'auto';
      }
    }
  }

  function showEmptyState() {
    emptyState.style.display = 'flex';
    if (arenaHint) arenaHint.style.display = 'none';
    cardsGrid.style.display = 'none';
    cardsGrid.innerHTML = '';
    initialControls.style.display = 'flex';
    sessionControls.style.display = 'none';
  }

  function showActiveArena() {
    emptyState.style.display = 'none';
    if (arenaHint) arenaHint.style.display = 'flex';
    cardsGrid.style.display = 'grid';
    initialControls.style.display = 'none';
    sessionControls.style.display = 'flex';
  }

  // Dynamic Adaptive Layout Engine
  function applyDynamicLayout(count) {
    // Remove all previous layout classes
    cardsGrid.className = 'cards-grid';

    if (count === 1) {
      cardsGrid.classList.add('layout-1');
    } else if (count === 2) {
      cardsGrid.classList.add('layout-2');
    } else if (count === 3) {
      cardsGrid.classList.add('layout-3');
    } else if (count === 4) {
      cardsGrid.classList.add('layout-4');
    } else if (count >= 5 && count <= 6) {
      cardsGrid.classList.add('layout-5-6');
    } else if (count >= 7 && count <= 8) {
      cardsGrid.classList.add('layout-7-8');
    } else if (count >= 9 && count <= 15) {
      // 10 lá và các lá bốc thêm: Lưới 5 cột đều (2 hàng x 5 lá đối xứng hoàn hảo)
      cardsGrid.classList.add('layout-5-col');
    } else if (count >= 16 && count <= 20) {
      cardsGrid.classList.add('layout-5-col');
    } else {
      cardsGrid.classList.add('layout-17-plus');
    }
  }

  // Draw initial batch (1, 3, 10 cards)
  function drawInitialBatch(count) {
    if (availableDeck.length < count) {
      showToast('Bộ bài không đủ số lượng để bốc!');
      return;
    }

    playBellChime();
    showActiveArena();

    const newCards = [];
    for (let i = 0; i < count; i++) {
      newCards.push(availableDeck.pop());
    }

    drawnCards = newCards;
    updateStatusBar();
    renderDrawnCards(true); // Stagger-flip animation
  }

  // Render all cards currently on table
  function renderDrawnCards(animateFlip) {
    cardsGrid.innerHTML = '';
    cardsGrid.style.display = 'grid';
    applyDynamicLayout(drawnCards.length);

    drawnCards.forEach((card, index) => {
      const cardEl = createCardElement(card, index);
      cardsGrid.appendChild(cardEl);

      if (animateFlip) {
        setTimeout(() => {
          cardEl.classList.add('flipped');
          if (index === 0) playFlipChime();
        }, 70 * index + 80);
      } else {
        cardEl.classList.add('flipped');
      }
    });
  }

  // Draw 1 more card (Rút thêm từng lá)
  function drawMoreOneCard() {
    if (availableDeck.length === 0) {
      showToast('Đã bốc hết toàn bộ 48 lá bài trong bộ!');
      return;
    }

    playCardSlideSound();
    const newCard = availableDeck.pop();
    drawnCards.push(newCard);

    updateStatusBar();
    applyDynamicLayout(drawnCards.length);

    const cardIndex = drawnCards.length - 1;
    const cardEl = createCardElement(newCard, cardIndex);
    cardsGrid.appendChild(cardEl);

    setTimeout(() => {
      cardEl.classList.add('flipped');
      playFlipChime();
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);

    showToast(`Đã rút thêm lá: ${newCard.name}`);
  }

  // Create single card DOM element
  function createCardElement(card, index) {
    const item = document.createElement('div');
    item.className = 'card-item';
    item.setAttribute('data-index', index);

    item.innerHTML = `
      <div class="card-order-badge">${index + 1}</div>
      <div class="card-inner">
        <div class="card-face card-back">
          <img src="neta_cards/card_back.png" alt="Mặt sau bài Neta Light" onerror="if(!this.dataset.r){this.dataset.r=1;setTimeout(()=>{this.src='neta_cards/card_back.png?r='+Date.now()},250);}">
        </div>
        <div class="card-face card-front">
          <img src="${card.image}" alt="${card.name}" onerror="if(!this.dataset.r){this.dataset.r=1;setTimeout(()=>{this.src='${card.image}?r='+Date.now()},250);}">
        </div>
      </div>
      <div class="card-title-tag">${card.name}</div>
    `;

    item.addEventListener('click', () => {
      openCardModal(index);
    });

    return item;
  }

  // Open Card Zoom Modal
  function openCardModal(index) {
    currentModalIndex = index;
    const card = drawnCards[index];
    if (!card) return;

    modalBodyContent.innerHTML = `
      <div class="modal-card-preview">
        <img src="${card.image}" alt="${card.name}">
      </div>
      <h3 class="modal-card-title">${card.name}</h3>
      <div class="modal-tags">
        <span class="modal-tag">Tần số: ${card.frequency}</span>
        <span class="modal-tag">${card.group}</span>
        <span class="modal-tag">${card.attribute}</span>
      </div>
      <div class="modal-desc-box">
        <strong>📖 Ý nghĩa:</strong><br>
        ${card.description}
      </div>
      <div class="modal-advice-box">
        <strong>💡 Lời khuyên hành pháp:</strong><br>
        ${card.advice}
      </div>
    `;

    updateModalNavigation();
    cardModal.style.display = 'flex';
  }

  function updateModalNavigation() {
    modalCardCounter.textContent = `Lá ${currentModalIndex + 1} / ${drawnCards.length}`;
    modalPrevBtn.disabled = currentModalIndex === 0;
    modalNextBtn.disabled = currentModalIndex === drawnCards.length - 1;
  }

  function closeModal() {
    cardModal.style.display = 'none';
  }

  // Sound Engine (Web Audio API - No external sound files needed!)
  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Singing bowl bell chime (432Hz harmonic)
  function playBellChime() {
    if (!soundEnabled) return;
    try {
      initAudio();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, audioCtx.currentTime); // Root 432 Hz
      osc.frequency.exponentialRampToValueAtTime(864, audioCtx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(432, audioCtx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 2.6);
    } catch (e) {
      // Audio not supported or blocked
    }
  }

  // Subtle Flip Chime
  function playFlipChime() {
    if (!soundEnabled) return;
    try {
      initAudio();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(528, audioCtx.currentTime); // 528 Hz miracle tone
      osc.frequency.exponentialRampToValueAtTime(792, audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.65);
    } catch (e) {}
  }

  function playCardSlideSound() {
    if (!soundEnabled) return;
    try {
      initAudio();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(480, audioCtx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.32);
    } catch (e) {}
  }

  // Toast
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  // Guide Modal Search & List
  function renderGuideList(filterText = '') {
    guideCardsList.innerHTML = '';
    const norm = filterText.toLowerCase().trim();

    const filtered = NETA_CARDS_DATA.filter((c) => {
      if (!norm) return true;
      return (
        c.name.toLowerCase().includes(norm) ||
        c.frequency.toLowerCase().includes(norm) ||
        c.group.toLowerCase().includes(norm) ||
        c.description.toLowerCase().includes(norm)
      );
    });

    if (filtered.length === 0) {
      guideCardsList.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 20px;">Không tìm thấy quân bài phù hợp</div>';
      return;
    }

    filtered.forEach((card) => {
      const item = document.createElement('div');
      item.className = 'guide-item';
      item.innerHTML = `
        <img src="${card.image}" alt="${card.name}" class="guide-thumb" loading="lazy">
        <div class="guide-info">
          <div class="guide-name">#${card.id < 10 ? '0' + card.id : card.id} - ${card.name}</div>
          <div class="guide-meta">Tần số: ${card.frequency} • ${card.group}</div>
        </div>
      `;
      item.addEventListener('click', () => {
        guideModal.style.display = 'none';
        // Open card details in main modal
        const tempIndex = drawnCards.findIndex((c) => c.id === card.id);
        if (tempIndex !== -1) {
          openCardModal(tempIndex);
        } else {
          // Open as preview
          openStaticCardPreview(card);
        }
      });
      guideCardsList.appendChild(item);
    });
  }

  function openStaticCardPreview(card) {
    modalBodyContent.innerHTML = `
      <div class="modal-card-preview">
        <img src="${card.image}" alt="${card.name}">
      </div>
      <h3 class="modal-card-title">${card.name}</h3>
      <div class="modal-tags">
        <span class="modal-tag">Tần số: ${card.frequency}</span>
        <span class="modal-tag">${card.group}</span>
        <span class="modal-tag">${card.attribute}</span>
      </div>
      <div class="modal-desc-box">
        <strong>📖 Ý nghĩa:</strong><br>
        ${card.description}
      </div>
      <div class="modal-advice-box">
        <strong>💡 Lời khuyên hành pháp:</strong><br>
        ${card.advice}
      </div>
    `;
    modalCardCounter.textContent = `#${card.id} (Tra cứu)`;
    modalPrevBtn.disabled = true;
    modalNextBtn.disabled = true;
    cardModal.style.display = 'flex';
  }

  // Bind UI Events
  function bindEvents() {
    // Initial draw buttons
    document.getElementById('btn-draw-1').addEventListener('click', () => drawInitialBatch(1));
    document.getElementById('btn-draw-3').addEventListener('click', () => drawInitialBatch(3));
    document.getElementById('btn-draw-10').addEventListener('click', () => drawInitialBatch(10));

    // In-session buttons
    document.getElementById('btn-draw-more').addEventListener('click', drawMoreOneCard);

    document.getElementById('btn-shuffle').addEventListener('click', () => {
      shuffleDeck(availableDeck);
      playBellChime();
      showToast('Đã xáo lại các lá bài còn lại trong bộ!');
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
      resetDeck();
      playBellChime();
      showToast('Đã thu bài và dọn bàn. Bạn có thể bắt đầu lượt bốc mới!');
    });

    // Sound toggle
    btnSound.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundIcon.textContent = soundEnabled ? '🔔' : '🔕';
      btnSound.style.opacity = soundEnabled ? '1' : '0.6';
      showToast(soundEnabled ? 'Đã bật âm thanh thiền' : 'Đã tắt âm thanh');
    });

    // Guide Modal
    btnGuide.addEventListener('click', () => {
      guideModal.style.display = 'flex';
    });
    guideCloseBtn.addEventListener('click', () => {
      guideModal.style.display = 'none';
    });
    guideSearchInput.addEventListener('input', (e) => {
      renderGuideList(e.target.value);
    });

    // Card Zoom Modal
    modalCloseBtn.addEventListener('click', closeModal);
    cardModal.addEventListener('click', (e) => {
      if (e.target === cardModal) closeModal();
    });

    modalPrevBtn.addEventListener('click', () => {
      if (currentModalIndex > 0) {
        openCardModal(currentModalIndex - 1);
      }
    });

    modalNextBtn.addEventListener('click', () => {
      if (currentModalIndex < drawnCards.length - 1) {
        openCardModal(currentModalIndex + 1);
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
        guideModal.style.display = 'none';
      }
    });
  }

  // Register Service Worker for Offline PWA
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
      });
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
