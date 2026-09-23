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
      guideTitle: '📜 Bảng Tra Cứu Quân Bài Neta Light'
    },
    poker: {
      name: 'BÀI TÂY POKER',
      subtitle: 'Chiêm Đoán Tâm Linh',
      logo: 'Porker/card_back.png',
      backImage: 'Porker/card_back.png',
      getData: () => (typeof POKER_CARDS_DATA !== 'undefined' ? POKER_CARDS_DATA : []),
      totalCards: 52,
      emptyTitle: 'Chiêm Đoán Bài Tây Poker',
      emptyDesc: 'Tập trung vào sự việc hoặc người bạn muốn xem, sau đó chọn rút 1 lá, rút 3 lá hoặc rút 9 lá bên dưới.',
      mainDrawCount: 9,
      mainDrawLabel: 'Rút 9 lá',
      guideTitle: '♠️ Tra Cứu Quân Bài Tây (Poker)'
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

  const arenaContainer = document.getElementById('arena-container');
  const arenaHint = document.getElementById('arena-hint');
  const cardsGrid = document.getElementById('cards-grid');

  const btnOpenReading = document.getElementById('btn-open-reading');
  const readingAlertBadge = document.getElementById('reading-alert-badge');
  const btnSessionReading = document.getElementById('btn-session-reading');
  const readingSessionDot = document.getElementById('reading-session-dot');

  const readingModal = document.getElementById('reading-modal');
  const readingCloseBtn = document.getElementById('reading-close-btn');
  const readingModalBody = document.getElementById('reading-modal-body');

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
  const btnTheme = document.getElementById('btn-theme');
  const themeIcon = document.getElementById('theme-icon');
  let currentTheme = localStorage.getItem('neta_theme') || 'dark';
  const toast = document.getElementById('toast');

  // Screenshot Elements
  const btnScreenshotHeader = document.getElementById('btn-screenshot-header');

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
    window._openCardModal = (idx) => openCardModal(idx);
    window._pokerEngine = {
      detectTuCombo,
      detectConsecutiveCombos,
      checkMatchingTus
    };
    initTheme();
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
    const remaining = availableDeck.length;
    const drawn = drawnCards.length;

    if (deckRemainingText) deckRemainingText.textContent = 'Bộ bài';
    if (drawnCountText) drawnCountText.textContent = drawn;
    if (btnRemainingSub) btnRemainingSub.textContent = '';

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
    if (btnOpenReading) btnOpenReading.style.display = 'none';
    if (btnSessionReading) btnSessionReading.style.display = 'none';
    if (btnScreenshotHeader) btnScreenshotHeader.style.display = 'none';
    closeReadingModal();
    initialControls.style.display = 'flex';
    sessionControls.style.display = 'none';
  }

  function showActiveArena() {
    emptyState.style.display = 'none';
    if (arenaHint) arenaHint.style.display = 'flex';
    cardsGrid.style.display = 'grid';
    if (btnScreenshotHeader) btnScreenshotHeader.style.display = 'inline-flex';
    initialControls.style.display = 'none';
    sessionControls.style.display = 'flex';
  }

  // Dynamic Card Auto-Scaling Engine
  // Đảm bảo tất cả các lá bài luôn tự thu nhỏ để vừa khít 100% trong 1 màn hình duy nhất
  function fitCardsToScreen() {
    if (!cardsGrid || drawnCards.length === 0) return;

    const count = drawnCards.length;
    const arenaW = arenaContainer ? arenaContainer.clientWidth : window.innerWidth;
    const arenaH = arenaContainer ? arenaContainer.clientHeight : window.innerHeight * 0.65;

    let cols = 3;
    let rows = 1;

    if (currentDeckMode === 'poker') {
      if (count === 1) {
        cols = 1; rows = 1;
      } else if (count === 2) {
        cols = 2; rows = 1;
      } else {
        cols = 3;
        rows = Math.ceil(count / 3);
      }
    } else {
      // Neta Light
      if (count === 1) { cols = 1; rows = 1; }
      else if (count === 2) { cols = 2; rows = 1; }
      else if (count === 3) { cols = 3; rows = 1; }
      else if (count <= 6) { cols = 3; rows = 2; }
      else if (count <= 8) { cols = 4; rows = 2; }
      else if (count <= 10) { cols = 5; rows = 2; }
      else { cols = 5; rows = Math.ceil(count / 5); }
    }

    // Khoảng cách an toàn giữa các lá bài
    const gapX = cols >= 5 ? 3 : (cols === 3 ? 5 : 8);
    const gapY = rows >= 4 ? 3 : (rows === 3 ? 5 : 8);
    // Bài tây poker không cần chú thích tên ở dưới quân bài -> labelH = 0
    const labelH = currentDeckMode === 'poker' ? 0 : (rows >= 4 ? 12 : (rows === 3 ? 14 : 16));
    const fontSize = rows >= 4 ? '0.48rem' : (rows === 3 ? '0.56rem' : '0.64rem');

    const hintH = (arenaHint && arenaHint.style.display !== 'none') ? (arenaHint.offsetHeight || 30) : 0;
    const padX = 12;
    const padY = 16 + hintH;
    const availW = Math.max(80, arenaW - padX);
    const availH = Math.max(80, arenaH - padY);

    // Tính kích thước tối đa theo trục ngang và trục dọc
    const maxCellW = Math.floor((availW - (cols - 1) * gapX) / cols);
    const maxCellH = Math.floor((availH - (rows - 1) * gapY) / rows);
    const maxCardH_fromHeight = maxCellH - labelH;

    // Tỉ lệ Poker = 2/3 (0.667), Neta = 5/7 (0.714)
    const ratio = currentDeckMode === 'poker' ? (2 / 3) : (5 / 7);
    const maxCardH_fromWidth = maxCellW / ratio;

    let optimalCardH = Math.min(maxCardH_fromHeight, maxCardH_fromWidth);
    const capMaxH = count === 1 ? 230 : (count === 2 ? 180 : (count === 3 ? 160 : (rows >= 4 ? 115 : 145)));
    optimalCardH = Math.min(optimalCardH, capMaxH);
    optimalCardH = Math.max(optimalCardH, 36);

    const optimalCardW = Math.floor(optimalCardH * ratio);

    cardsGrid.style.setProperty('--grid-cols', cols);
    cardsGrid.style.setProperty('--card-w', `${optimalCardW}px`);
    cardsGrid.style.setProperty('--card-h', `${optimalCardH}px`);
    cardsGrid.style.setProperty('--card-gap-x', `${gapX}px`);
    cardsGrid.style.setProperty('--card-gap-y', `${gapY}px`);
    cardsGrid.style.setProperty('--card-font-size', fontSize);
    cardsGrid.style.setProperty('--card-label-h', `${labelH}px`);
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

    fitCardsToScreen();
    renderPokerReadingPanel(drawnCards);
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

    const cardIndex = drawnCards.length - 1;
    const cardEl = createCardElement(newCard, cardIndex);
    cardsGrid.appendChild(cardEl);

    setTimeout(() => {
      cardEl.classList.add('flipped');
      playFlipChime();
    }, 100);

    fitCardsToScreen();
    renderPokerReadingPanel(drawnCards);
    showToast(`Đã rút thêm: ${newCard.name}`);
  }

  // ================= POKER SPIRITUAL READING ENGINE =================
  // Luận giải tâm linh theo Tụ (3 cây/tụ) & Bộ 4, 5 lá liền nhau

  function detectTuCombo(tuCards) {
    if (!tuCards || tuCards.length < 3) return null;
    if (typeof POKER_COMBOS_DATA === 'undefined') return null;

    const ranks = tuCards.map((c) => c.rankNum).sort((a, b) => a - b);
    const colorTypes = tuCards.map((c) => c.colorType);
    const suitCodes = tuCards.map((c) => c.suitCode);

    const isAllBlack = colorTypes.every((ct) => ct === 'black');
    const isAllRed = colorTypes.every((ct) => ct === 'red');
    const isSameSuit = suitCodes.every((sc) => sc === suitCodes[0]);

    // 1. Check combos from POKER_COMBOS_DATA (16 combos & Nadrasa)
    for (const combo of POKER_COMBOS_DATA) {
      const comboRanks = [...combo.ranks].sort((a, b) => a - b);
      if (
        ranks[0] === comboRanks[0] &&
        ranks[1] === comboRanks[1] &&
        ranks[2] === comboRanks[2]
      ) {
        if (combo.color === 'black' && !isAllBlack) continue;
        if (combo.color === 'red' && !isAllRed) continue;
        if (combo.suit && combo.suit !== 'any' && (!isSameSuit || suitCodes[0] !== combo.suit)) continue;
        return {
          name: combo.name,
          meaning: combo.meaning,
          description: combo.description
        };
      }
    }

    // 2. Check 3-card straight flush (Dây đồng chất chuẩn theo PDF)
    if (
      isSameSuit &&
      ((ranks[0] + 1 === ranks[1] && ranks[1] + 1 === ranks[2]) ||
        (ranks[0] === 1 && ranks[1] === 12 && ranks[2] === 13))
    ) {
      if (isAllBlack) {
        return {
          name: `Dây đen đồng chất (${tuCards[0].suit})`,
          meaning: 'Việc gấp',
          description: 'Dây đen đồng chất: Việc gấp.'
        };
      } else if (isAllRed) {
        return {
          name: `Dây đỏ đồng chất (${tuCards[0].suit})`,
          meaning: 'Thông pháp',
          description: 'Dây đỏ đồng chất: Thông pháp.'
        };
      }
    }

    // 3. Check bộ số Nadrasa Dehi (Bộ 22, bộ 7, kết nối 27/227)
    // Bộ ba quân 7 (777)
    if (ranks[0] === 7 && ranks[1] === 7 && ranks[2] === 7) {
      return {
        name: 'Bộ Số 777 Nadrasa Dehi',
        meaning: 'Hãy tập trung lắng nghe sự dẫn dắt ngay bây giờ',
        description: 'Hãy tập trung lắng nghe sự dẫn dắt ngay bây giờ, đọc trong suy nghĩ của bạn sẽ nghe thấy lời chỉ dẫn.'
      };
    }
    // Bộ ba quân 2 (222)
    if (ranks[0] === 2 && ranks[1] === 2 && ranks[2] === 2) {
      return {
        name: 'Bộ Số 222 Nadrasa Dehi',
        meaning: 'Sự xuất hiện của thiên thần bảo hộ bất kể khi nào bạn kêu gọi',
        description: 'Sự xuất hiện của thiên thần bảo hộ bất kể khi nào bạn kêu gọi.'
      };
    }
    // Bộ số 22x (có hai quân 2 và 1 quân khác)
    const countRank2 = ranks.filter((r) => r === 2).length;
    if (countRank2 === 2) {
      const otherRank = ranks.find((r) => r !== 2);
      const nadrasaMap = {
        1: { code: '221', desc: 'Nhiều trắc trở sắp xảy ra về tiền bạc, sức khỏe' },
        3: { code: '223', desc: 'Hãy thiền nhận năng lượng bảo vệ' },
        4: { code: '224', desc: 'Kiềm chế và rèn luyện kiên nhẫn, cẩn thận tổn thương' },
        5: { code: '225', desc: 'Sự mất mát nào đó sớm xảy ra' },
        6: { code: '226', desc: 'Có nghiệp đang quanh bạn, và sẽ trổ ra sắp tơi hoặc bây giờ.' },
        7: { code: '227', desc: 'Linh hồn của bạn đang trong kết nối với vị thầy Bổn Tôn (Nadrasa Dehi).' },
        8: { code: '228', desc: 'Sự bảo hộ của các vị Hộ Pháp dành cho bạn' },
        9: { code: '229', desc: 'Hãy buông bỏ các bám chấp và quên đi nỗi đau buồn của quá khứ. Sống với thực tại.' },
        10: { code: '220', desc: 'Sự cố về họa mắt và họa miệng rất dễ xảy ra giữ vững thái độ ôn hòa trong mọi tình huống.' }
      };
      if (nadrasaMap[otherRank]) {
        const item = nadrasaMap[otherRank];
        return {
          name: `Bộ Số ${item.code} Nadrasa Dehi`,
          meaning: item.desc,
          description: item.desc
        };
      }
    }
    // Gánh 272 hoặc 727
    const origRanks = tuCards.map((c) => c.rankNum);
    if ((origRanks[0] === 2 && origRanks[1] === 7 && origRanks[2] === 2) ||
        (origRanks[0] === 7 && origRanks[1] === 2 && origRanks[2] === 7)) {
      return {
        name: `Bộ Số Gánh ${origRanks.join('')} Nadrasa Dehi`,
        meaning: 'Chủ định kết nối số 27 biến thiên',
        description: 'Nadrasa Dehi chủ định kết nối là số 27 và cao nhất trong kết nối là 227, trong đó số 2 và 7 linh hoạt biến thiên.'
      };
    }

    // 4. Check 3 of a kind (Bộ ba cùng bậc)
    if (ranks[0] === ranks[1] && ranks[1] === ranks[2]) {
      return {
        name: `Bộ Ba Quân ${tuCards[0].rankShort || tuCards[0].rank}`,
        meaning: 'Uy lực ba chân vạc - Khuếch đại năng lượng',
        description: `Cả 3 quân bài đều đồng bậc ${tuCards[0].rank}, báo hiệu năng lượng biểu trưng được củng cố vững chắc gấp ba lần.`
      };
    }

    return null;
  }

  // Detect consecutive 4-card or 5-card combos (2 pairs)
  function detectConsecutiveCombos(cards) {
    const alerts = [];
    if (!cards || cards.length < 4) return alerts;

    // Check 4 consecutive cards for 2 pairs
    for (let i = 0; i <= cards.length - 4; i++) {
      const slice4 = cards.slice(i, i + 4);
      const counts = {};
      slice4.forEach((c) => {
        counts[c.rankNum] = (counts[c.rankNum] || 0) + 1;
      });
      const freqs = Object.values(counts).sort((a, b) => b - a);
      if (freqs.length === 2 && freqs[0] === 2 && freqs[1] === 2) {
        const isAllBlack = slice4.every((c) => c.colorType === 'black');
        if (isAllBlack) {
          alerts.push({
            type: 'danger-critical',
            cardsRange: `Lá ${i + 1} - ${i + 4}`,
            cardsList: slice4.map((c) => c.shortName || c.name).join(', '),
            title: '🚨 2 đôi trong 4 lá toàn đen: Hết phúc làm người',
            description: 'Cảnh báo nghiệp quả cạn kiệt, cần lập tức sám hối sâu sắc và tu phúc cấp thiết.'
          });
        } else {
          alerts.push({
            type: 'danger-warn',
            cardsRange: `Lá ${i + 1} - ${i + 4}`,
            cardsList: slice4.map((c) => c.shortName || c.name).join(', '),
            title: '⚠️ 2 đôi trong 4 lá: Cạn phúc',
            description: 'Phước đức đang có dấu hiệu hao hụt lớn; cần thận trọng trong lời nói, hành động và tích thêm phước thiện.'
          });
        }
      }
    }

    // Check 5 consecutive cards for 2 pairs
    for (let i = 0; i <= cards.length - 5; i++) {
      const slice5 = cards.slice(i, i + 5);
      const counts = {};
      slice5.forEach((c) => {
        counts[c.rankNum] = (counts[c.rankNum] || 0) + 1;
      });
      const freqs = Object.values(counts).sort((a, b) => b - a);
      if (freqs[0] === 2 && freqs[1] === 2 && freqs[2] === 1) {
        // Chỉ tính 2 đôi trong 5 lá nếu không bị trùng với 4 lá liền nhau đã thành 2 đôi
        const sub4a = slice5.slice(0, 4);
        const sub4b = slice5.slice(1, 5);
        const isTwoPairs4 = (arr) => {
          const c = {};
          arr.forEach((x) => (c[x.rankNum] = (c[x.rankNum] || 0) + 1));
          const vals = Object.values(c).sort((a, b) => b - a);
          return vals.length === 2 && vals[0] === 2 && vals[1] === 2;
        };
        if (!isTwoPairs4(sub4a) && !isTwoPairs4(sub4b)) {
          alerts.push({
            type: 'confirm-combo',
            cardsRange: `Lá ${i + 1} - ${i + 5}`,
            cardsList: slice5.map((c) => c.shortName || c.name).join(', '),
            title: '✨ 2 đôi trong 5 lá liền nhau: Xác nhận như bộ 3',
            description: 'Cấu trúc tương hỗ đặc biệt xác nhận năng lượng tâm linh tương đương hiệu lực của một bộ 3 linh ứng.'
          });
        }
      }
    }

    return alerts;
  }

  // Check matching Tụs (2 tụ có các lá như nhau)
  function checkMatchingTus(cards) {
    const alerts = [];
    if (!cards || cards.length < 6) return alerts;

    const tus = [];
    for (let i = 0; i + 3 <= cards.length; i += 3) {
      tus.push({
        index: Math.floor(i / 3) + 1,
        cards: cards.slice(i, i + 3),
        ranks: cards
          .slice(i, i + 3)
          .map((c) => c.rankNum)
          .sort((a, b) => a - b)
          .join('-')
      });
    }

    for (let i = 0; i < tus.length; i++) {
      for (let j = i + 1; j < tus.length; j++) {
        if (tus[i].ranks === tus[j].ranks) {
          alerts.push({
            title: `✨ Tụ ${tus[i].index} và Tụ ${tus[j].index} có các lá bài như nhau`,
            description: '2 tụ có các lá như nhau: Xác nhận như bộ 3 (Đồng điệu linh ứng).'
          });
        }
      }
    }

    return alerts;
  }

  // Open Spiritual Reading Modal
  function openReadingModal() {
    if (!readingModal) return;
    readingModal.style.display = 'flex';
  }

  // Close Spiritual Reading Modal
  function closeReadingModal() {
    if (!readingModal) return;
    readingModal.style.display = 'none';
  }

  // Render Poker Reading Content into Modal
  function renderPokerReadingPanel(cards) {
    if (!readingModalBody) return;

    if (currentDeckMode !== 'poker' || !cards || cards.length === 0) {
      if (btnOpenReading) btnOpenReading.style.display = 'none';
      if (btnSessionReading) btnSessionReading.style.display = 'none';
      readingModalBody.innerHTML = '';
      return;
    }

    // Hiển thị nút bấm Luận Giải ở Hint Bar và Session Controls
    if (btnOpenReading) btnOpenReading.style.display = 'inline-flex';
    if (btnSessionReading) btnSessionReading.style.display = 'inline-flex';

    const consecutiveAlerts = detectConsecutiveCombos(cards);
    const matchingTuAlerts = checkMatchingTus(cards);

    // Group cards into Tụ (mỗi tụ 3 lá)
    const tus = [];
    let hasAnyCombo = false;
    const totalTus = Math.ceil(cards.length / 3);
    for (let i = 0; i < totalTus; i++) {
      const start = i * 3;
      const end = Math.min(start + 3, cards.length);
      const tuCards = cards.slice(start, end);

      let tuName = `Tụ ${i + 1}`;
      let badgeClass = 'badge-rank-extra';
      let badgeText = '🔮 Bổ trợ thông tin';
      let boxClass = 'tu-extra';

      if (i === 0) {
        tuName = 'Tụ 1 (3 cây đầu tiên)';
        badgeClass = 'badge-rank-1';
        badgeText = '🌟 Xác nhận cao nhất';
        boxClass = 'tu-1';
      } else if (i === 1) {
        tuName = 'Tụ 2 (3 cây kế tiếp)';
        badgeClass = 'badge-rank-2';
        badgeText = '⚡ Có thể chấp nhận được';
        boxClass = 'tu-2';
      } else if (i === 2) {
        tuName = 'Tụ 3 (3 cây kế tiếp)';
        badgeClass = 'badge-rank-3';
        badgeText = '⚠️ Cần kiểm tra bốc lại';
        boxClass = 'tu-3';
      } else {
        tuName = `Tụ ${i + 1} (Cây rút thêm bổ trợ)`;
      }

      const combo = tuCards.length === 3 ? detectTuCombo(tuCards) : null;
      if (combo) hasAnyCombo = true;

      tus.push({
        index: i + 1,
        tuName,
        badgeClass,
        badgeText,
        boxClass,
        cards: tuCards,
        startIndex: start,
        combo
      });
    }

    // Bật dot/badge cảnh báo nếu có phát hiện đặc biệt
    const hasAlert = consecutiveAlerts.length > 0 || matchingTuAlerts.length > 0 || hasAnyCombo;
    if (readingAlertBadge) {
      readingAlertBadge.style.display = hasAlert ? 'inline-flex' : 'none';
    }
    if (readingSessionDot) {
      readingSessionDot.style.display = hasAlert ? 'block' : 'none';
    }

    let html = `
      <div class="poker-panel-title">
        <span>🃏 Chi Tiết Luận Giải 52 Quân Bài Tây</span>
      </div>
      <div class="poker-reading-rule-box">
        <div class="poker-reading-rule-title">
          <span>📜 Quy tắc luận giải Nadrasa Dehi:</span>
        </div>
        <div>• <strong>Bộ 3 con</strong>: Chỉ có ý nghĩa khi <strong>cùng nằm trong 1 tụ (3 cây)</strong> (Tụ 1: 3 cây đầu; Tụ 2: 3 cây kế tiếp; Tụ 3: 3 cây sau).</div>
        <div>• <strong>Bộ nhiều hơn 3 con</strong> (2 đôi trong 4 lá, 2 đôi trong 5 lá...): Bắt buộc phải <strong>liên tiếp nhau</strong>.</div>
        <div>• <strong>Hiệu lực xác nhận</strong>: Tụ đầu (Tụ 1) xác nhận cao nhất, Tụ 2 có thể chấp nhận được, Tụ 3 cần kiểm tra bốc lại.</div>
      </div>
    `;

    // Render consecutive alerts if any
    if (consecutiveAlerts.length > 0 || matchingTuAlerts.length > 0) {
      consecutiveAlerts.forEach((a) => {
        const isConfirm = a.type === 'confirm-combo';
        const style = isConfirm
          ? 'background: rgba(46, 204, 113, 0.2); border-color: #2ecc71; color: #a9dfbf;'
          : '';
        html += `
          <div class="tu-consecutive-alert" style="${style}">
            <div>${a.title} <span style="font-size: 0.70rem; opacity: 0.85;">(${a.cardsList})</span></div>
            <div style="font-size: 0.72rem; margin-top: 3px; font-weight: normal;">${a.description}</div>
          </div>
        `;
      });

      matchingTuAlerts.forEach((a) => {
        html += `
          <div class="tu-consecutive-alert" style="background: rgba(52, 152, 219, 0.2); border-color: #3498db; color: #aed6f1;">
            <div>${a.title}</div>
            <div style="font-size: 0.72rem; margin-top: 3px; font-weight: normal;">${a.description}</div>
          </div>
        `;
      });
    }

    // Render each Tu
    tus.forEach((tu) => {
      html += `
        <div class="tu-reading-box ${tu.boxClass}">
          <div class="tu-box-header">
            <span class="tu-box-name">${tu.tuName}</span>
            <span class="tu-box-badge ${tu.badgeClass}">${tu.badgeText}</span>
          </div>
          <div class="tu-box-content">
            <div style="margin-bottom: 4px;">
              ${tu.cards
                .map(
                  (c, cIdx) => `
                <div style="margin: 2px 0; cursor: pointer;" onclick="window._openCardModal(${tu.startIndex + cIdx})">
                  • <strong>${c.shortName || c.name}</strong>: ${c.meaning || c.description}
                </div>
              `
                )
                .join('')}
            </div>
            ${
              tu.combo
                ? `
              <div class="tu-combo-alert">
                <div>⚜️ <strong>${tu.combo.name}</strong>: ${tu.combo.meaning}</div>
                <div style="font-size: 0.72rem; opacity: 0.9; margin-top: 2px; font-weight: normal;">${tu.combo.description}</div>
              </div>
            `
                : tu.cards.length === 3
                ? `<div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 3px; font-style: italic;">(3 lá đơn lẻ trong cùng 1 tụ, không tạo thành bộ 3 quy ước)</div>`
                : `<div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 3px; font-style: italic;">(Đang bốc ${tu.cards.length}/3 lá - Cần đủ 3 lá cùng 1 tụ để xác thực bộ)</div>`
            }
          </div>
        </div>
      `;
    });

    readingModalBody.innerHTML = html;
  }

  // Create single card DOM element
  function createCardElement(card, index) {
    const cfg = DECK_CONFIG[currentDeckMode];
    const item = document.createElement('div');
    item.className = 'card-item';
    item.setAttribute('data-index', index);

    const showTitleTag = currentDeckMode !== 'poker';

    item.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-back">
          <img src="${cfg.backImage}" alt="Mặt sau bài" onerror="if(!this.dataset.r){this.dataset.r=1;setTimeout(()=>{this.src='${cfg.backImage}?r='+Date.now()},250);}">
        </div>
        <div class="card-face card-front">
          <img src="${card.image}" alt="${card.name}" onerror="if(!this.dataset.r){this.dataset.r=1;setTimeout(()=>{this.src='${card.image}?r='+Date.now()},250);}">
        </div>
      </div>
      ${showTitleTag ? `<div class="card-title-tag">${card.name}</div>` : ''}
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

  // ================= THEME CONTROLLER (SÁNG / TỐI) =================
  function initTheme() {
    applyTheme(currentTheme, false);
  }

  function applyTheme(theme, notify = true) {
    currentTheme = theme;
    localStorage.setItem('neta_theme', theme);
    if (theme === 'light') {
      document.body.classList.add('theme-light');
      if (themeIcon) themeIcon.textContent = '🌙';
      if (btnTheme) btnTheme.title = 'Chuyển sang giao diện Tối';
      if (notify) showToast('☀️ Đã chuyển sang giao diện Sáng');
    } else {
      document.body.classList.remove('theme-light');
      if (themeIcon) themeIcon.textContent = '☀️';
      if (btnTheme) btnTheme.title = 'Chuyển sang giao diện Sáng';
      if (notify) showToast('🌙 Đã chuyển sang giao diện Tối');
    }
  }

  function toggleTheme() {
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme, true);
    playBellChime();
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

    // Theme toggle (Sáng / Tối)
    if (btnTheme) {
      btnTheme.addEventListener('click', toggleTheme);
    }

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

    // Spiritual Reading Modal
    if (btnOpenReading) {
      btnOpenReading.addEventListener('click', openReadingModal);
    }
    if (btnSessionReading) {
      btnSessionReading.addEventListener('click', openReadingModal);
    }
    if (readingCloseBtn) {
      readingCloseBtn.addEventListener('click', closeReadingModal);
    }
    if (readingModal) {
      readingModal.addEventListener('click', (e) => {
        if (e.target === readingModal) closeReadingModal();
      });
    }

    // Screenshot Event (Header camera button)
    if (btnScreenshotHeader) btnScreenshotHeader.addEventListener('click', captureArenaScreenshot);

    // Auto-fit cards on screen resize
    window.addEventListener('resize', fitCardsToScreen);
    window.addEventListener('orientationchange', () => {
      setTimeout(fitCardsToScreen, 150);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
        guideModal.style.display = 'none';
        closeReadingModal();
      }
    });
  }

  // ================= SCREENSHOT ENGINE (LƯU TRỰC TIẾP VÀO MÁY) =================

  function triggerCameraFlash() {
    const flash = document.createElement('div');
    flash.className = 'camera-flash-overlay';
    document.body.appendChild(flash);
    requestAnimationFrame(() => {
      flash.classList.add('flash-fade');
      setTimeout(() => {
        if (flash.parentNode) flash.parentNode.removeChild(flash);
      }, 350);
    });
  }

  function playCameraShutterSound() {
    if (!soundEnabled) return;
    try {
      initAudio();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.06);

      setTimeout(() => playBellChime(), 60);
    } catch (e) {}
  }

  async function captureArenaScreenshot() {
    if (drawnCards.length === 0) {
      showToast('Chưa có quân bài nào trên bàn để chụp!');
      return;
    }

    triggerCameraFlash();
    playCameraShutterSound();
    showToast('📸 Đang chụp và lưu ảnh vào máy...');

    try {
      const appContainer = document.getElementById('app-container');
      if (!appContainer) return;

      if (typeof html2canvas === 'undefined') {
        showToast('Đang nạp công cụ chụp ảnh, vui lòng thử lại sau giây lát!');
        return;
      }

      const isLight = currentTheme === 'light';
      const bgColor = isLight ? '#f4ede1' : '#120104';
      const titleColor = isLight ? '#6e1507' : '#f5b041';

      // Capture full app container at retina 2x resolution
      const canvas = await html2canvas(appContainer, {
        scale: 2,
        backgroundColor: bgColor,
        useCORS: true,
        logging: false,
        allowTaint: true,
        onclone: (clonedDoc) => {
          const title = clonedDoc.querySelector('.app-title');
          if (title) {
            title.style.background = 'none';
            title.style.webkitBackgroundClip = 'initial';
            title.style.webkitTextFillColor = titleColor;
            title.style.color = titleColor;
          }
          if (isLight) {
            const hintText = clonedDoc.querySelector('.hint-text');
            if (hintText) hintText.style.color = '#3d1a08';
            const hintBar = clonedDoc.querySelector('.arena-hint-bar');
            if (hintBar) {
              hintBar.style.backgroundColor = '#f0e3ce';
              hintBar.style.borderColor = '#c29a53';
            }
          }
        }
      });

      const dataUrl = canvas.toDataURL('image/png');
      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
      const modeName = currentDeckMode === 'poker' ? 'Poker' : 'NetaLight';
      const filename = `${modeName}_TraiBai_${dateStr}.png`;

      // Convert DataURL to Blob synchronously
      const binStr = atob(dataUrl.split(',')[1]);
      const len = binStr.length;
      const u8arr = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        u8arr[i] = binStr.charCodeAt(i);
      }
      const blob = new Blob([u8arr], { type: 'image/png' });
      const blobUrl = URL.createObjectURL(blob);

      // Trigger instant direct download into user device
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (a.parentNode) a.parentNode.removeChild(a);
      }, 1000);

      // Keep blob URL alive for 5 minutes so Android Chrome download service finishes smoothly
      setTimeout(() => URL.revokeObjectURL(blobUrl), 300000);

      showToast('✨ Đã lưu ảnh vào máy! Bác mở Thư viện ảnh / Tải về để xem nhé');

    } catch (err) {
      console.error('Screenshot error:', err);
      showToast('Không thể lưu ảnh: ' + (err.message || err));
    }
  }

  // Register Service Worker for Offline PWA
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js?v=3.6').catch(() => {});
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
