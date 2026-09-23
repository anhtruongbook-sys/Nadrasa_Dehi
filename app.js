/**
 * NETA LIGHT & POKER - TWO DECK ENGINE
 * Pháp môn Nadrasa Dehi & Bài Tây 52 Lá
 */

(function () {
  'use strict';

  // State
  let currentDeckMode = 'neta'; // 'neta' or 'poker'
  let availableDeck = [];
  let drawnCards = [];
  let currentModalIndex = 0;
  let soundEnabled = true;
  let audioCtx = null;

  // Deck Configuration
  const DECK_CONFIG = {
    neta: {
      name: 'NETA LIGHT',
      subtitle: 'Pháp môn Nadrasa Dehi',
      logo: 'neta_cards/phap_an.jpg',
      backImage: 'neta_cards/card_back.png',
      getData: () => (typeof NETA_CARDS_DATA !== 'undefined' ? NETA_CARDS_DATA : []),
      totalCards: 48,
      emptyTitle: 'Định Tâm Chiêm Nghiệm',
      emptyDesc: 'Hãy hít thở sâu, giữ tâm trí tĩnh lặng và tập trung vào câu hỏi hoặc nguyện vọng của bạn, sau đó chọn số lượng lá bài bên dưới.',
      mainDrawCount: 10,
      mainDrawLabel: 'Rút 10 lá',
      guideTitle: '📜 Bảng Tra Cứu 48 Quân Bài Neta Light'
    },
    poker: {
      name: 'POKER 52 LÁ',
      subtitle: 'Bài Tây Cổ Điển',
      logo: 'Porker/card_back.png',
      backImage: 'Porker/card_back.png',
      getData: () => (typeof POKER_CARDS_DATA !== 'undefined' ? POKER_CARDS_DATA : []),
      totalCards: 52,
      emptyTitle: 'Chiêm Đoán Bài Tây 52 Lá',
      emptyDesc: 'Tập trung vào sự việc hoặc người bạn muốn xem, sau đó chọn rút 1 lá, rút 3 lá hoặc rút 9 lá bên dưới.',
      mainDrawCount: 9,
      mainDrawLabel: 'Rút 9 lá',
      guideTitle: '♠️ Tra Cứu 52 Quân Bài Tây (Poker)'
    }
  };

  // DOM Elements
  const tabModeNeta = document.getElementById('tab-mode-neta');
  const tabModePoker = document.getElementById('tab-mode-poker');
  const appMainTitle = document.getElementById('app-main-title');
  const appSubTitle = document.getElementById('app-sub-title');
  const headerLogo = document.getElementById('header-logo');

  const emptyState = document.getElementById('empty-state');
  const emptyAvatarImg = document.getElementById('empty-avatar-img');
  const emptyTitleText = document.getElementById('empty-title-text');
  const emptyDescText = document.getElementById('empty-desc-text');

  const arenaHint = document.getElementById('arena-hint');
  const cardsGrid = document.getElementById('cards-grid');

  const initialControls = document.getElementById('initial-controls');
  const sessionControls = document.getElementById('session-controls');
  const btnDrawMain = document.getElementById('btn-draw-main');
  const btnDrawMainText = document.getElementById('btn-draw-main-text');

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
  const guideModalTitle = document.getElementById('guide-modal-title');
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

  // Preload all cards into browser cache
  function preloadAllCardImages() {
    setTimeout(() => {
      // Preload Neta cards
      if (typeof NETA_CARDS_DATA !== 'undefined') {
        const back1 = new Image();
        back1.src = 'neta_cards/card_back.png';
        NETA_CARDS_DATA.forEach((card) => {
          const img = new Image();
          img.src = card.image;
        });
      }
      // Preload Poker cards
      if (typeof POKER_CARDS_DATA !== 'undefined') {
        const back2 = new Image();
        back2.src = 'Porker/card_back.png';
        POKER_CARDS_DATA.forEach((card) => {
          const img = new Image();
          img.src = card.image;
        });
      }
    }, 1200);
  }

  // Switch between Neta Light & Poker Deck Modes
  function switchDeckMode(mode) {
    if (currentDeckMode === mode) return;
    currentDeckMode = mode;

    tabModeNeta.classList.toggle('active', mode === 'neta');
    tabModePoker.classList.toggle('active', mode === 'poker');

    const cfg = DECK_CONFIG[mode];
    appMainTitle.textContent = cfg.name;
    appSubTitle.textContent = cfg.subtitle;
    headerLogo.src = cfg.logo;
    emptyAvatarImg.src = cfg.logo;
    emptyTitleText.textContent = cfg.emptyTitle;
    emptyDescText.textContent = cfg.emptyDesc;
    btnDrawMainText.textContent = cfg.mainDrawLabel;
    guideModalTitle.textContent = cfg.guideTitle;
    guideSearchInput.value = '';

    resetDeck();
    renderGuideList();
    playBellChime();
    showToast(`Đã chuyển sang: ${cfg.name}`);
  }

  // Reset / Initialize Current Deck
  function resetDeck() {
    const cfg = DECK_CONFIG[currentDeckMode];
    availableDeck = [...cfg.getData()];
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

  // Update Status Bar
  function updateStatusBar() {
    const cfg = DECK_CONFIG[currentDeckMode];
    const remaining = availableDeck.length;
    const drawn = drawnCards.length;

    deckRemainingText.textContent = `Bộ bài: Còn ${remaining}/${cfg.totalCards} lá`;
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
    cardsGrid.className = 'cards-grid';

    // Bố cục Bài Tây Poker: Tối đa 3 lá / hàng, luôn căn giữa
    if (currentDeckMode === 'poker') {
      cardsGrid.classList.add('poker-grid');
      if (count === 1) {
        cardsGrid.classList.add('poker-col-1');
      } else if (count === 2) {
        cardsGrid.classList.add('poker-col-2');
      } else {
        // 3 lá, 9 lá hoặc rút thêm: Luôn tối đa đúng 3 lá trên 1 hàng
        cardsGrid.classList.add('poker-col-3');
      }
      return;
    }

    // Bố cục Neta Light (Cách bốc chính 10 lá 5 cột)
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
      cardsGrid.classList.add('layout-5-col');
    } else if (count >= 16 && count <= 20) {
      cardsGrid.classList.add('layout-5-col');
    } else {
      cardsGrid.classList.add('layout-17-plus');
    }
  }

  // Draw initial batch (1, 3, or main count)
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
    renderDrawnCards(true);
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
      showToast('Đã bốc hết toàn bộ lá bài trong bộ!');
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

    showToast(`Đã rút thêm: ${newCard.name}`);
  }

  // Create single card DOM element
  function createCardElement(card, index) {
    const cfg = DECK_CONFIG[currentDeckMode];
    const item = document.createElement('div');
    item.className = 'card-item';
    item.setAttribute('data-index', index);

    item.innerHTML = `
      <div class="card-order-badge">${index + 1}</div>
      <div class="card-inner">
        <div class="card-face card-back">
          <img src="${cfg.backImage}" alt="Mặt sau bài" onerror="if(!this.dataset.r){this.dataset.r=1;setTimeout(()=>{this.src='${cfg.backImage}?r='+Date.now()},250);}">
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

    if (currentDeckMode === 'poker') {
      // Poker Modal Template
      modalBodyContent.innerHTML = `
        <div class="modal-card-preview" style="aspect-ratio: 2/3; height: 260px; width: auto;">
          <img src="${card.image}" alt="${card.name}">
        </div>
        <h3 class="modal-card-title">${card.name}</h3>
        <div class="modal-tags">
          <span class="modal-tag">Bậc: ${card.rank}</span>
          <span class="modal-tag">Chất: ${card.suit} (${card.symbol})</span>
          <span class="modal-tag">${card.color}</span>
        </div>
        <div class="modal-desc-box">
          <strong>🃏 Chi tiết quân bài:</strong><br>
          ${card.description}
        </div>
        <div class="modal-advice-box" style="border-left-color: var(--gold-primary);">
          <strong>✨ Ý nghĩa biểu trưng:</strong><br>
          ${card.advice}
        </div>
      `;
    } else {
      // Neta Light Modal Template
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
    }

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

  // Sound Engine
  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playBellChime() {
    if (!soundEnabled) return;
    try {
      initAudio();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(864, audioCtx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(432, audioCtx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 2.6);
    } catch (e) {}
  }

  function playFlipChime() {
    if (!soundEnabled) return;
    try {
      initAudio();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(528, audioCtx.currentTime);
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
    const cfg = DECK_CONFIG[currentDeckMode];
    const data = cfg.getData();

    const filtered = data.filter((c) => {
      if (!norm) return true;
      return (
        c.name.toLowerCase().includes(norm) ||
        (c.frequency && c.frequency.toLowerCase().includes(norm)) ||
        (c.suit && c.suit.toLowerCase().includes(norm)) ||
        (c.rank && c.rank.toLowerCase().includes(norm)) ||
        (c.description && c.description.toLowerCase().includes(norm))
      );
    });

    if (filtered.length === 0) {
      guideCardsList.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 20px;">Không tìm thấy quân bài phù hợp</div>';
      return;
    }

    filtered.forEach((card) => {
      const item = document.createElement('div');
      item.className = 'guide-item';
      const meta = currentDeckMode === 'poker' ? `Chất ${card.suit} (${card.symbol}) • ${card.color}` : `Tần số: ${card.frequency} • ${card.group}`;

      item.innerHTML = `
        <img src="${card.image}" alt="${card.name}" class="guide-thumb" loading="lazy">
        <div class="guide-info">
          <div class="guide-name">#${card.id < 10 ? '0' + card.id : card.id} - ${card.name}</div>
          <div class="guide-meta">${meta}</div>
        </div>
      `;
      item.addEventListener('click', () => {
        guideModal.style.display = 'none';
        const tempIndex = drawnCards.findIndex((c) => c.id === card.id);
        if (tempIndex !== -1) {
          openCardModal(tempIndex);
        } else {
          openStaticCardPreview(card);
        }
      });
      guideCardsList.appendChild(item);
    });
  }

  function openStaticCardPreview(card) {
    if (currentDeckMode === 'poker') {
      modalBodyContent.innerHTML = `
        <div class="modal-card-preview" style="aspect-ratio: 2/3; height: 260px; width: auto;">
          <img src="${card.image}" alt="${card.name}">
        </div>
        <h3 class="modal-card-title">${card.name}</h3>
        <div class="modal-tags">
          <span class="modal-tag">Bậc: ${card.rank}</span>
          <span class="modal-tag">Chất: ${card.suit} (${card.symbol})</span>
          <span class="modal-tag">${card.color}</span>
        </div>
        <div class="modal-desc-box">
          <strong>🃏 Chi tiết quân bài:</strong><br>
          ${card.description}
        </div>
        <div class="modal-advice-box" style="border-left-color: var(--gold-primary);">
          <strong>✨ Ý nghĩa biểu trưng:</strong><br>
          ${card.advice}
        </div>
      `;
    } else {
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
    }
    modalCardCounter.textContent = `#${card.id} (Tra cứu)`;
    modalPrevBtn.disabled = true;
    modalNextBtn.disabled = true;
    cardModal.style.display = 'flex';
  }

  // Bind UI Events
  function bindEvents() {
    // Mode Switch Tabs
    tabModeNeta.addEventListener('click', () => switchDeckMode('neta'));
    tabModePoker.addEventListener('click', () => switchDeckMode('poker'));

    // Initial draw buttons
    document.getElementById('btn-draw-1').addEventListener('click', () => drawInitialBatch(1));
    document.getElementById('btn-draw-3').addEventListener('click', () => drawInitialBatch(3));
    btnDrawMain.addEventListener('click', () => {
      const cfg = DECK_CONFIG[currentDeckMode];
      drawInitialBatch(cfg.mainDrawCount);
    });

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
      showToast(soundEnabled ? 'Đã bật âm thanh' : 'Đã tắt âm thanh');
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
        navigator.serviceWorker.register('sw.js?v=3.5').catch(() => {});
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
