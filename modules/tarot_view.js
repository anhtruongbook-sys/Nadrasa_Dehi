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
  let encyClassFilter = 'all'; // 'all' | 'court' | 'pips'
  let encySearchQuery = '';
  let hapticEnabled = localStorage.getItem('neta_tarot_haptic') === 'true'; // MẶC ĐỊNH TẮT (FALSE)
  let journalFilterDomain = 'all'; // 'all' | 'general' | 'career' | 'love'
  let journalSearchQuery = '';

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
    if (!hapticEnabled) return; // MẶC ĐỊNH TẮT, CHỈ CHẠY KHI NGƯỜI DÙNG BẬT
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

  function formatMarkdownInline(str) {
    if (!str) return '';
    return str
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^\*\n]+?)\*/g, '<em>$1</em>');
  }

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


  // ASTROLOGICAL & SYMBOLIC CORRESPONDENCES (PHASE 3)
  const MAJOR_ASTROLOGY = {
    "Major_00_Fool": { astro: "Sao Thiên Vương & Khí (Uranus / Air)", num: "0 (Vô cực & Khởi nguyên)", symbols: "Hoa hồng trắng (thuần khiết), tay nải (tiềm năng tích lũy), chú chó nhỏ (bản năng hộ vệ), bờ vực (bước nhảy niềm tin)." },
    "Major_01_Magician": { astro: "Sao Thủy (Mercury / Giao tiếp & Trí tuệ)", num: "1 (Ý chí & Khởi đầu)", symbols: "Gậy phép hướng thiên, 4 bảo vật bàn thờ (Gậy, Cốc, Kiếm, Tiền), vòng vô cực Lemniscate." },
    "Major_02_High_Priestess": { astro: "Mặt Trăng (Moon / Tiềm thức & Bí ẩn)", num: "2 (Nhị nguyên & Cân bằng)", symbols: "Hai cột đền Boaz & Jachin, bức màn quả lựu, cuộn kinh TORA, trăng lưỡi liềm dưới chân." },
    "Major_03_Empress": { astro: "Sao Kim (Venus / Tình yêu & Sung túc)", num: "3 (Sinh sôi & Sáng tạo)", symbols: "Vương miện 12 ngôi sao, cánh đồng lúa mì chín vàng, dòng thác nước trù phú, khiên biểu tượng Venus." },
    "Major_04_Emperor": { astro: "Cung Bạch Dương (Aries / Quyền lực & Trật tự)", num: "4 (Cấu trúc & Nền tảng vững chắc)", symbols: "Ngai vàng chạm đầu cừu đực, quyền trượng Ankh sinh khí, quả cầu hoàng quyền, áo giáp sắt." },
    "Major_05_Hierophant": { astro: "Cung Kim Ngưu (Taurus / Truyền thống & Giáo lý)", num: "5 (Thử thách & Khế ước tinh thần)", symbols: "Hai chìa khóa thiên đàng chéo nhau, vương miện ba tầng ngôi giáo hoàng, hai tu sĩ quỳ dưới bệ." },
    "Major_06_Lovers": { astro: "Cung Song Tử (Gemini / Gắn kết & Lựa chọn)", num: "6 (Hài hòa & Giao cảm)", symbols: "Đại thiên thần Raphael ban phước, Adam & Eva, Cây sự sống và Cây tri thức thiện ác." },
    "Major_07_Chariot": { astro: "Cung Cự Giải (Cancer / Ý chí vượt thắng)", num: "7 (Chiến thắng & Tự chủ)", symbols: "Hai nhân sư đen-trắng điều khiển bằng ý chí, cỗ xe bọc thép phủ màn trời sao, áo giáp trăng lưỡi liềm." },
    "Major_08_Strength": { astro: "Cung Sư Tử (Leo / Sức mạnh nội tâm)", num: "8 (Can trường & Từ tâm)", symbols: "Người phụ nữ dịu dàng khép miệng sư tử gầm, vòng vô cực hoa cỏ, sự kiên nhẫn cảm hóa." },
    "Major_09_Hermit": { astro: "Cung Xử Nữ (Virgo / Tự vấn & Soi sáng)", num: "9 (Trưởng thành & Tĩnh lặng)", symbols: "Ngọn đèn lồng mang ngôi sao 6 cánh (Seal of Solomon), cây gậy hành hương, đỉnh núi tuyết cô độc." },
    "Major_10_Wheel_of_Fortune": { astro: "Sao Mộc (Jupiter / Vận mệnh & Cơ hội)", num: "10 (Chu kỳ chuyển dịch & Nhân duyên)", symbols: "Bánh xe luân hồi khắc chữ YHWH / TARO, tượng Nhân sư trí tuệ, rắn Typhon, thần Anubis." },
    "Major_11_Justice": { astro: "Cung Thiên Bình (Libra / Công lý & Nhân quả)", num: "11 (Cân bằng & Minh bạch)", symbols: "Chiếc cân công lý hai đĩa chuẩn xác, thanh gươm hai lưỡi giơ cao, bức màn tím che giấu chân lý." },
    "Major_12_Hanged_Man": { astro: "Sao Hải Vương & Nước (Neptune / Giác ngộ & Buông bỏ)", num: "12 (Góc nhìn mới & Chuyển hóa)", symbols: "Người treo ngược một chân trên cành cây sống hình chữ T, vầng hào quang quanh đầu, thái độ an nhiên." },
    "Major_13_Death": { astro: "Cung Bọ Cạp (Scorpio / Chuyển hóa & Tái sinh)", num: "13 (Kết thúc để tái sinh)", symbols: "Kỵ sĩ xương trắng trên chiến mã, lá cờ hoa hồng huyền bí Mystic Rose, mặt trời mọc giữa hai ngọn tháp." },
    "Major_14_Temperance": { astro: "Cung Nhân Mã (Sagittarius / Dung hòa & Giả kim)", num: "14 (Điều hòa & Điềm tĩnh)", symbols: "Đại thiên thần rót nước luân chuyển giữa hai bình, một chân trên cạn một chân ngâm nước, đóa hoa diên vĩ." },
    "Major_15_Devil": { astro: "Cung Ma Kết (Capricorn / Ràng buộc & Cám dỗ)", num: "15 (Ảo tưởng vật chất & Bóng tối)", symbols: "Ác quỷ Baphomet trên bệ đá, sợi xích lỏng lẻo trói cổ hai người, ngọn đuốc chúc xuống đất." },
    "Major_16_Tower": { astro: "Sao Hỏa (Mars / Đổ vỡ ảo tưởng & Giải phóng)", num: "16 (Sự thật thức tỉnh đột ngột)", symbols: "Tia sét đánh vỡ vương miện trên đỉnh tháp đá cao, ngọn lửa bùng cháy dữ dội, hai bóng người rơi xuống." },
    "Major_17_Star": { astro: "Cung Bảo Bình (Aquarius / Hy vọng & Chữa lành)", num: "17 (Niềm tin & Ánh sáng soi đường)", symbols: "Ngôi sao lớn 8 cánh rực rỡ, thiếu nữ tưới nước nguồn sống lên đất và suối, chú chim Ibis trên cành cây." },
    "Major_18_Moon": { astro: "Cung Song Ngư (Pisces / Tiềm thức & Trực giác)", num: "18 (Ảo giác & Nỗi sợ nguyên thủy)", symbols: "Hai con chó sói tru trăng, con tôm bò lên từ đáy đầm lầy sâu thẳm, các giọt sương ánh sáng rơi rụng." },
    "Major_19_Sun": { astro: "Mặt Trời (Sun / Thành tựu & Vinh quang)", num: "19 (Ánh sáng rực rỡ & Niềm vui)", symbols: "Đứa trẻ thơ trần trụi cưỡi ngựa trắng, đóa hoa hướng dương rạng rỡ, bức tường đá vững chãi, cờ đỏ chiến thắng." },
    "Major_20_Judgement": { astro: "Sao Diêm Vương & Lửa (Pluto / Thức tỉnh tối hậu)", num: "20 (Phán xét & Tái sinh linh hồn)", symbols: "Đại thiên thần Gabriel thổi tù và cứu rỗi, con người trỗi dậy từ cỗ quan tài đá, dãy núi tuyết vĩnh cửu." },
    "Major_21_World": { astro: "Sao Thổ & Đất (Saturn / Viên mãn & Trọn vẹn)", num: "21 (Hoàn tất chu kỳ & Hợp nhất)", symbols: "Vũ công thanh thoát giữa vòng nguyệt quế bầu dục, 4 sinh vật bốn góc trời (Người, Đại bàng, Sư tử, Bò mộng)." }
  };

  function getCardMetadata(card) {
    if (!card) return null;
    if (card.arcana === 'Major') {
      const data = MAJOR_ASTROLOGY[card.id] || {};
      return {
        astro: data.astro || 'Huyền học Ẩn chính',
        num: data.num || `Số ${card.number}`,
        symbols: data.symbols || 'Biểu tượng RWS cổ điển'
      };
    }
    // Minor Arcana
    let suitAstro = '';
    let suitSymbol = '';
    if (card.id.startsWith('Wands')) {
      suitAstro = 'Nhóm Lửa: Bạch Dương, Sư Tử, Nhân Mã';
      suitSymbol = 'Cây gậy đâm chồi nảy lộc (Sinh khí, nhiệt huyết, ý chí hành động và bản lĩnh sáng tạo).';
    } else if (card.id.startsWith('Cups')) {
      suitAstro = 'Nhóm Nước: Cự Giải, Bọ Cạp, Song Ngư';
      suitSymbol = 'Chiếc cốc rót tràn dòng nước (Cảm xúc sâu lắng, trực giác, tình yêu thương và sự thấu cảm).';
    } else if (card.id.startsWith('Swords')) {
      suitAstro = 'Nhóm Khí: Song Tử, Thiên Bình, Bảo Bình';
      suitSymbol = 'Thanh kiếm hai lưỡi sắc bén (Lý trí tỉnh thức, sự thật khách quan, tư duy phân tích và áp lực thử thách).';
    } else if (card.id.startsWith('Pentacles')) {
      suitAstro = 'Nhóm Đất: Kim Ngưu, Xử Nữ, Ma Kết';
      suitSymbol = 'Đồng tiền vàng khắc ngôi sao 5 cánh (Vật chất, tài chính, kỹ năng nghề nghiệp và nền tảng cụ thể).';
    }

    let rankText = 'Lá số';
    if (card.id.includes('Ace')) rankText = 'Ách (Ace - Khởi nguyên tinh hoa 100%)';
    else if (card.id.includes('Page')) rankText = 'Tiểu đồng (Page - Tinh thần học hỏi, thông điệp mới)';
    else if (card.id.includes('Knight')) rankText = 'Hiệp sĩ (Knight - Tiến công, hành động thần tốc)';
    else if (card.id.includes('Queen')) rankText = 'Hoàng hậu (Queen - Nuôi dưỡng, thấu hiểu chiều sâu)';
    else if (card.id.includes('King')) rankText = 'Vua (King - Làm chủ tối cao, quyền lực và bản lĩnh)';
    else if (card.number !== undefined) rankText = `Lá số ${card.number}`;

    return {
      astro: suitAstro,
      num: rankText,
      symbols: suitSymbol
    };
  }

  // --- JOURNAL EXTENDED FUNCTIONS ---
  function updateJournalEntryData(id, reflectionNote, rating, manifestStatus) {
    try {
      const list = getJournal();
      const item = list.find(it => it.id === id);
      if (item) {
        if (reflectionNote !== undefined) item.reflectionNote = reflectionNote;
        if (rating !== undefined) item.rating = rating;
        if (manifestStatus !== undefined) item.manifestStatus = manifestStatus;
        localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(list));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error updating journal', e);
      return false;
    }
  }

  function computeJournalStats() {
    const list = getJournal();
    if (!list || list.length === 0) return null;

    const totalReadings = list.length;
    const cardFreq = {};
    const suitCounts = { Wands: 0, Cups: 0, Swords: 0, Pentacles: 0, Major: 0 };

    list.forEach(entry => {
      (entry.drawnCards || []).forEach(c => {
        cardFreq[c.cardId] = (cardFreq[c.cardId] || 0) + 1;
        if (c.cardId.startsWith('Major')) suitCounts.Major++;
        else if (c.cardId.startsWith('Wands')) suitCounts.Wands++;
        else if (c.cardId.startsWith('Cups')) suitCounts.Cups++;
        else if (c.cardId.startsWith('Swords')) suitCounts.Swords++;
        else if (c.cardId.startsWith('Pentacles')) suitCounts.Pentacles++;
      });
    });

    const topCards = Object.entries(cardFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cardId, count]) => {
        const data = global.NetaTarotEngine.getCard(cardId);
        return {
          cardId,
          count,
          nameVi: data ? data.name_vi : cardId,
          nameEn: data ? data.name_en : ''
        };
      });

    // Dominant Suit
    let maxSuit = 'Major';
    let maxCount = suitCounts.Major;
    Object.entries(suitCounts).forEach(([suit, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxSuit = suit;
      }
    });

    const suitNames = {
      Major: 'Ẩn chính (Major Arcana - Các bài học linh hồn & Bước ngoặt lớn)',
      Wands: 'Bộ Gậy (Hành động, ý chí, công việc và đam mê)',
      Cups: 'Bộ Cốc (Cảm xúc, tình yêu, mối quan hệ và trực giác)',
      Swords: 'Bộ Kiếm (Lý trí, tư duy phân tích, sự thật và quyết định)',
      Pentacles: 'Bộ Tiền (Nền móng vật chất, tài chính và sự ổn định)'
    };

    return {
      totalReadings,
      topCards,
      dominantSuit: maxSuit,
      dominantSuitDesc: suitNames[maxSuit],
      suitCounts
    };
  }

  function exportJournalData() {
    const list = getJournal();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(list, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `NetaLight_Tarot_Journal_${Date.now()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  }

  function importJournalData(jsonText) {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) throw new Error('Dữ liệu không đúng định dạng mảng.');
      localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(parsed));
      return true;
    } catch (e) {
      alert('Tệp dữ liệu không hợp lệ: ' + e.message);
      return false;
    }
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
              🔮 Trải Bài
            </button>
            <button class="tarot-tab-btn ${currentSubTab === 'encyclopedia' ? 'active' : ''}" data-tab="encyclopedia">
              📖 Bách Khoa
            </button>
            <button class="tarot-tab-btn ${currentSubTab === 'journal' ? 'active' : ''}" data-tab="journal">
              📔 Nhật Ký
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
                <span class="tarot-switch-text">Cho phép lá ngược</span>
              </label>
              <label class="tarot-switch-label" title="Chế độ rung phản hồi (mặc định tắt)">
                <input type="checkbox" id="tarot-toggle-haptic" ${hapticEnabled ? 'checked' : ''}>
                <span class="tarot-switch-text">📳 Rung (Haptic)</span>
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
                  <p>${formatMarkdownInline(report.quintessence.lesson)}</p>
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
            <blockquote>${formatMarkdownInline(report.synthesizedStory)}</blockquote>
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
                  <div class="pattern-desc">${formatMarkdownInline(p.desc)}</div>
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
            <blockquote>${formatMarkdownInline(report.finalAdvice)}</blockquote>
          </div>
        </div>

        <!-- Report Footer Actions -->
        <div class="tarot-report-actions">
          <button id="btn-tarot-save-journal" class="tarot-btn-primary">
            💾 Lưu Vào Nhật Ký
          </button>
          <button id="btn-tarot-export-pdf" class="tarot-btn-pdf">
            📄 Lưu / Xuất File PDF
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
      // Suit / Arcana Filter
      if (encyFilter === 'Major' && c.arcana !== 'Major') return false;
      if (encyFilter === 'Cups' && !c.id.startsWith('Cups')) return false;
      if (encyFilter === 'Pentacles' && !c.id.startsWith('Pentacles')) return false;
      if (encyFilter === 'Swords' && !c.id.startsWith('Swords')) return false;
      if (encyFilter === 'Wands' && !c.id.startsWith('Wands')) return false;

      // Class Filter (Court vs Pips)
      if (encyClassFilter === 'court') {
        const isCourt = c.id.includes('Page') || c.id.includes('Knight') || c.id.includes('Queen') || c.id.includes('King');
        if (!isCourt) return false;
      } else if (encyClassFilter === 'pips') {
        const isCourt = c.id.includes('Page') || c.id.includes('Knight') || c.id.includes('Queen') || c.id.includes('King');
        if (c.arcana === 'Major' || isCourt) return false;
      }

      // Search query
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
            <input type="text" id="tarot-ency-search-input" placeholder="🔍 Tìm theo tên hoặc từ khóa (ví dụ: Kẻ Khờ, The Fool, Cups, Ách, Tình cảm...)" value="${escapeHTML(encySearchQuery)}">
          </div>
          <div class="tarot-ency-tabs">
            <button class="ency-filter-btn ${encyFilter === 'all' ? 'active' : ''}" data-filter="all">Tất cả (78)</button>
            <button class="ency-filter-btn ${encyFilter === 'Major' ? 'active' : ''}" data-filter="Major">Ẩn chính (22)</button>
            <button class="ency-filter-btn ${encyFilter === 'Cups' ? 'active' : ''}" data-filter="Cups">Cốc (Cups - 14)</button>
            <button class="ency-filter-btn ${encyFilter === 'Pentacles' ? 'active' : ''}" data-filter="Pentacles">Tiền (Pentacles - 14)</button>
            <button class="ency-filter-btn ${encyFilter === 'Swords' ? 'active' : ''}" data-filter="Swords">Kiếm (Swords - 14)</button>
            <button class="ency-filter-btn ${encyFilter === 'Wands' ? 'active' : ''}" data-filter="Wands">Gậy (Wands - 14)</button>
          </div>
          <div class="tarot-ency-subfilters">
            <span class="subfilter-label">Phân cấp:</span>
            <button class="ency-class-btn ${encyClassFilter === 'all' ? 'active' : ''}" data-class="all">Toàn bộ</button>
            <button class="ency-class-btn ${encyClassFilter === 'court' ? 'active' : ''}" data-class="court">👑 Hoàng gia (Court - 16)</button>
            <button class="ency-class-btn ${encyClassFilter === 'pips' ? 'active' : ''}" data-class="pips">🔢 Lá số (Pips 1-10 - 40)</button>
            <span class="ency-count-badge">Hiển thị: <strong>${filtered.length}</strong> lá</span>
          </div>
        </div>

        <div class="tarot-ency-grid">
          ${filtered.map(c => {
            const meta = getCardMetadata(c);
            return `
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
                  <div class="ency-card-astro-hint">${meta ? meta.astro : ''}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderJournalSubView() {
    const list = getJournal();
    const stats = computeJournalStats();

    if (list.length === 0) {
      return `
        <div class="tarot-journal-empty">
          <div class="journal-empty-icon">📔</div>
          <h3>Chưa có bản ghi nhật ký nào</h3>
          <p>Khi bạn thực hiện trải bài và bấm <strong>💾 Lưu Vào Nhật Ký</strong>, kết quả chiêm nghiệm sẽ được lưu trữ cục bộ bảo mật 100% tại đây.</p>
          <div class="journal-empty-actions">
            <button id="btn-tarot-import-json-empty" class="tarot-btn-secondary">📥 Khôi Phục Từ Tệp JSON</button>
            <input type="file" id="tarot-journal-file-input" accept=".json" style="display: none;">
          </div>
        </div>
      `;
    }

    // Filter list by domain & search
    const filteredList = list.filter(entry => {
      if (journalFilterDomain !== 'all' && entry.domain !== journalFilterDomain) return false;
      if (journalSearchQuery) {
        const q = journalSearchQuery.toLowerCase().trim();
        const matchQ = (entry.question || '').toLowerCase().includes(q);
        const matchNote = (entry.reflectionNote || '').toLowerCase().includes(q);
        const matchSpread = (entry.spreadName || '').toLowerCase().includes(q);
        return matchQ || matchNote || matchSpread;
      }
      return true;
    });

    const statusMap = {
      studying: { label: '⏳ Đang chiêm nghiệm', color: '#f59e0b' },
      manifested: { label: '✅ Đã ứng nghiệm', color: '#10b981' },
      lesson: { label: '💡 Bài học sâu sắc', color: '#8b5cf6' }
    };

    return `
      <div class="tarot-journal-workspace">
        <!-- STATS & INSIGHTS CARD (PHASE 3) -->
        ${stats ? `
          <div class="tarot-journal-stats-card">
            <div class="stats-card-header">
              <span class="stats-icon">📊</span>
              <h4>Thống Kê Tần Suất & Năng Lượng Tâm Thức</h4>
            </div>
            <div class="stats-summary-grid">
              <div class="stat-box">
                <div class="stat-number">${stats.totalReadings}</div>
                <div class="stat-label">Lần trải bài</div>
              </div>
              <div class="stat-box dominant-energy-box">
                <div class="stat-subhead">Dòng năng lượng chủ đạo:</div>
                <div class="stat-dominant-title">${stats.dominantSuitDesc}</div>
              </div>
            </div>
            ${stats.topCards.length > 0 ? `
              <div class="stats-top-cards-row">
                <span class="top-cards-label">Lá bài xuất hiện nhiều nhất:</span>
                <div class="top-cards-pills">
                  ${stats.topCards.map(tc => `
                    <div class="top-card-pill" data-id="${tc.cardId}">
                      <img src="assets/tarot/${tc.cardId}.webp" alt="${tc.nameVi}">
                      <span>${tc.nameVi} (<strong>${tc.count}</strong> lần)</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Top Tools & Filter Bar -->
        <div class="tarot-journal-header">
          <div class="journal-title-box">
            <h3>Nhật Ký Chiêm Nghiệm (${filteredList.length}/${list.length} bản ghi)</h3>
            <span class="journal-subtitle">Lưu trữ cục bộ bảo mật 100% trên thiết bị</span>
          </div>
          <div class="journal-tools-bar">
            <button id="btn-tarot-export-json" class="tarot-btn-subtle" title="Tải tệp sao lưu JSON về máy">
              📤 Sao Lưu JSON
            </button>
            <button id="btn-tarot-import-json" class="tarot-btn-subtle" title="Khôi phục nhật ký từ tệp JSON">
              📥 Khôi Phục
            </button>
            <input type="file" id="tarot-journal-file-input" accept=".json" style="display: none;">
            <button id="btn-tarot-clear-journal" class="tarot-btn-ghost danger" title="Xóa toàn bộ nhật ký">
              🗑️ Xóa Hết
            </button>
          </div>
        </div>

        <div class="tarot-journal-filters-row">
          <div class="journal-search-wrap">
            <input type="text" id="tarot-journal-search-input" placeholder="🔍 Tìm theo câu hỏi hoặc ghi chú..." value="${escapeHTML(journalSearchQuery)}">
          </div>
          <div class="journal-domain-tabs">
            <button class="journal-domain-btn ${journalFilterDomain === 'all' ? 'active' : ''}" data-domain="all">Tất cả</button>
            <button class="journal-domain-btn ${journalFilterDomain === 'general' ? 'active' : ''}" data-domain="general">🌟 Tổng quan</button>
            <button class="journal-domain-btn ${journalFilterDomain === 'career' ? 'active' : ''}" data-domain="career">💼 Công việc</button>
            <button class="journal-domain-btn ${journalFilterDomain === 'love' ? 'active' : ''}" data-domain="love">❤️ Tình cảm</button>
          </div>
        </div>

        <!-- Journal Entries List -->
        <div class="tarot-journal-list">
          ${filteredList.map(entry => {
            const currentRating = entry.rating || 0;
            const currentStatus = entry.manifestStatus || 'studying';
            const statusInfo = statusMap[currentStatus] || statusMap.studying;

            return `
              <div class="tarot-journal-item" data-id="${entry.id}">
                <div class="journal-item-head">
                  <div class="journal-item-date">📅 ${entry.timestamp}</div>
                  <div class="journal-item-badges">
                    <span class="journal-badge">${entry.spreadName}</span>
                    <span class="journal-badge domain-${entry.domain}">${entry.domain.toUpperCase()}</span>
                    <span class="journal-badge status-tag" style="border-color: ${statusInfo.color}; color: ${statusInfo.color};">${statusInfo.label}</span>
                  </div>
                  <button class="btn-delete-entry" data-id="${entry.id}" title="Xóa bản ghi này">✕</button>
                </div>

                <div class="journal-item-question">
                  <strong>Hỏi:</strong> ${escapeHTML(entry.question || 'Chiêm nghiệm tổng quan')}
                </div>

                <div class="journal-item-cards-row">
                  ${(entry.drawnCards || []).map(c => {
                    const cardData = global.NetaTarotEngine.getCard(c.cardId);
                    return `
                      <div class="journal-mini-card" data-id="${c.cardId}">
                        <img src="assets/tarot/${c.cardId}.webp" alt="${cardData ? cardData.name_vi : ''}" class="${c.isUpright ? '' : 'is-reversed'}">
                        <div class="mini-name">${cardData ? cardData.name_vi : c.cardId}</div>
                        <div class="mini-orient">${c.isUpright ? 'Xuôi' : 'Ngược'}</div>
                      </div>
                    `;
                  }).join('')}
                </div>

                <div class="journal-item-advice">
                  <strong>Lời khuyên:</strong> ${formatMarkdownInline(entry.finalAdvice)}
                </div>

                <!-- PERSONAL REFLECTION SECTION (PHASE 3) -->
                <div class="journal-reflection-container" id="reflection-wrap-${entry.id}">
                  <div class="reflection-meta-row">
                    <div class="reflection-stars" data-id="${entry.id}">
                      <span class="stars-label">Độ ứng nghiệm:</span>
                      ${[1, 2, 3, 4, 5].map(star => `
                        <button class="star-btn ${star <= currentRating ? 'filled' : ''}" data-star="${star}" data-id="${entry.id}">⭐</button>
                      `).join('')}
                    </div>
                    <button class="btn-toggle-edit-reflection" data-id="${entry.id}">
                      ✏️ ${entry.reflectionNote ? 'Sửa Ghi Chú' : 'Viết Phản Tư'}
                    </button>
                  </div>

                  <div class="reflection-display-box" id="reflection-display-${entry.id}">
                    ${entry.reflectionNote ? `
                      <div class="reflection-note-quote">
                        <strong>📝 Phản tư cá nhân:</strong>
                        <p>${escapeHTML(entry.reflectionNote)}</p>
                      </div>
                    ` : `
                      <div class="reflection-note-empty">
                        <em>Chưa có ghi chú phản tư. Chạm "Viết Phản Tư" để ghi lại diễn biến thực tế sau khi sự việc xảy ra...</em>
                      </div>
                    `}
                  </div>

                  <div class="reflection-edit-box" id="reflection-edit-${entry.id}" style="display: none;">
                    <textarea class="journal-reflection-textarea" id="textarea-${entry.id}" placeholder="Ghi lại diễn biến thực tế, cảm xúc hoặc bài học nhận được sau lần trải bài này...">${escapeHTML(entry.reflectionNote || '')}</textarea>
                    <div class="reflection-edit-footer">
                      <select class="journal-status-dropdown" id="status-select-${entry.id}">
                        <option value="studying" ${currentStatus === 'studying' ? 'selected' : ''}>⏳ Đang chiêm nghiệm</option>
                        <option value="manifested" ${currentStatus === 'manifested' ? 'selected' : ''}>✅ Đã ứng nghiệm chuẩn xác</option>
                        <option value="lesson" ${currentStatus === 'lesson' ? 'selected' : ''}>💡 Bài học quý giá</option>
                      </select>
                      <div class="reflection-btn-group">
                        <button class="tarot-btn-primary btn-save-note" data-id="${entry.id}">Lưu</button>
                        <button class="tarot-btn-ghost btn-cancel-note" data-id="${entry.id}">Hủy</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="journal-item-actions">
                  <button class="tarot-btn-secondary btn-view-journal-detail" data-id="${entry.id}">
                    👁️ Xem Toàn Văn
                  </button>
                  <button class="tarot-btn-pdf btn-export-journal-pdf" data-id="${entry.id}">
                    📄 Xuất PDF
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

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

    // 8. Export PDF Report
    const btnExportPdf = container.querySelector('#btn-tarot-export-pdf');
    if (btnExportPdf && currentReadingReport) {
      btnExportPdf.addEventListener('click', () => {
        triggerHaptic(15);
        openPdfExportModal(currentReadingReport);
      });
    }

    // 8b. Copy Markdown
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

    // Phase 3: Encyclopedia Class Sub-Filters
    container.querySelectorAll('.ency-class-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        encyClassFilter = btn.getAttribute('data-class') || 'all';
        renderTarot();
      });
    });

    // Phase 3: Journal Domain Filters & Search
    container.querySelectorAll('.journal-domain-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        journalFilterDomain = btn.getAttribute('data-domain') || 'all';
        renderTarot();
      });
    });

    const journalSearchInput = container.querySelector('#tarot-journal-search-input');
    if (journalSearchInput) {
      journalSearchInput.addEventListener('input', (e) => {
        journalSearchQuery = e.target.value;
        const subview = container.querySelector('#tarot-subview-container');
        if (subview) {
          subview.innerHTML = renderJournalSubView();
          bindTarotEvents(container);
        }
      });
    }

    // Phase 3: Journal Star Ratings
    container.querySelectorAll('.star-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const star = parseInt(btn.getAttribute('data-star'), 10);
        if (id && !isNaN(star)) {
          updateJournalEntryData(id, undefined, star, undefined);
          playCardSlideSound();
          triggerHaptic(15);
          renderTarot();
          if (typeof window.showToast === 'function') {
            window.showToast(`⭐ Đã cập nhật độ ứng nghiệm: ${star}/5 sao`);
          }
        }
      });
    });

    // Phase 3: Toggle Reflection Note Editor
    container.querySelectorAll('.btn-toggle-edit-reflection').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const displayBox = container.querySelector(`#reflection-display-${id}`);
        const editBox = container.querySelector(`#reflection-edit-${id}`);
        if (displayBox && editBox) {
          const isEditing = editBox.style.display !== 'none';
          editBox.style.display = isEditing ? 'none' : 'block';
          displayBox.style.display = isEditing ? 'block' : 'none';
        }
      });
    });

    // Phase 3: Save Reflection Note
    container.querySelectorAll('.btn-save-note').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const textarea = container.querySelector(`#textarea-${id}`);
        const statusSelect = container.querySelector(`#status-select-${id}`);
        if (id && textarea) {
          const noteText = textarea.value.trim();
          const statusVal = statusSelect ? statusSelect.value : 'studying';
          updateJournalEntryData(id, noteText, undefined, statusVal);
          triggerHaptic(20);
          renderTarot();
          if (typeof window.showToast === 'function') {
            window.showToast('✅ Đã lưu ghi chú phản tư cá nhân!');
          }
        }
      });
    });

    container.querySelectorAll('.btn-cancel-note').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const displayBox = container.querySelector(`#reflection-display-${id}`);
        const editBox = container.querySelector(`#reflection-edit-${id}`);
        if (displayBox && editBox) {
          editBox.style.display = 'none';
          displayBox.style.display = 'block';
        }
      });
    });

    // Phase 3: Export & Import Journal Data
    const btnExportJson = container.querySelector('#btn-tarot-export-json');
    if (btnExportJson) {
      btnExportJson.addEventListener('click', () => {
        exportJournalData();
        if (typeof window.showToast === 'function') {
          window.showToast('📁 Đang tải tệp sao lưu Nhật ký JSON...');
        }
      });
    }

    const btnImportJson = container.querySelector('#btn-tarot-import-json');
    const btnImportJsonEmpty = container.querySelector('#btn-tarot-import-json-empty');
    const fileInput = container.querySelector('#tarot-journal-file-input');

    const handleImportTrigger = () => {
      if (fileInput) fileInput.click();
    };
    if (btnImportJson) btnImportJson.addEventListener('click', handleImportTrigger);
    if (btnImportJsonEmpty) btnImportJsonEmpty.addEventListener('click', handleImportTrigger);

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const ok = importJournalData(event.target.result);
          if (ok) {
            renderTarot();
            if (typeof window.showToast === 'function') {
              window.showToast('✅ Đã khôi phục dữ liệu Nhật ký thành công!');
            }
          }
        };
        reader.readAsText(file);
      });
    }

    // Mini card click in journal opens card detail
    container.querySelectorAll('.journal-mini-card').forEach(mc => {
      mc.addEventListener('click', () => {
        const id = mc.getAttribute('data-id');
        if (id) openTarotCardDetailModal(id);
      });
    });

    // Top frequent card pills click in stats
    container.querySelectorAll('.top-card-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const id = pill.getAttribute('data-id');
        if (id) openTarotCardDetailModal(id);
      });
    });


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

    container.querySelectorAll('.btn-export-journal-pdf').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const list = getJournal();
        const entry = list.find(it => it.id === id);
        if (entry && entry.fullReport) {
          triggerHaptic(15);
          openPdfExportModal(entry.fullReport);
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
  function openTarotCardDetailModal(cardId, initialReversed = false) {
    const engine = global.NetaTarotEngine;
    if (!engine) return;
    const c = engine.getCard(cardId);
    if (!c) return;
    const meta = getCardMetadata(c);

    let isModalReversed = initialReversed;

    let modal = document.getElementById('tarot-detail-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'tarot-detail-modal';
      modal.className = 'modal-overlay tarot-detail-modal';
      document.body.appendChild(modal);
    }

    function renderModalBody() {
      modal.innerHTML = `
        <div class="modal-dialog tarot-modal-dialog">
          <button class="modal-close" id="tarot-modal-close-btn">&times;</button>
          <div class="tarot-modal-content">
            <!-- Left Col: 3D Flip Card & Attributes -->
            <div class="tarot-modal-img-col">
              <div class="modal-card-3d-scene">
                <img src="assets/tarot/${c.id}.webp" alt="${c.name_vi}" 
                  class="tarot-modal-img ${isModalReversed ? 'is-reversed-view' : ''}" 
                  id="modal-card-img"
                  title="Chạm vào nút bên dưới để đổi chiều bài">
              </div>

              <!-- Orientation Toggle Buttons -->
              <div class="modal-orientation-switcher">
                <button class="modal-orient-btn ${!isModalReversed ? 'active' : ''}" id="btn-orient-upright">
                  🔼 Chiều Xuôi
                </button>
                <button class="modal-orient-btn ${isModalReversed ? 'active' : ''}" id="btn-orient-reversed">
                  🔽 Chiều Ngược
                </button>
              </div>

              <div class="tarot-modal-tags">
                <span class="tarot-tag">${c.arcana} Arcana</span>
                <span class="tarot-tag">Nguyên tố ${c.element}</span>
                ${c.number !== undefined ? `<span class="tarot-tag">Số ${c.number}</span>` : ''}
              </div>

              ${meta ? `
                <div class="modal-astro-box">
                  <div class="astro-label">🪐 Chiêm Tinh & Thiên Thể:</div>
                  <div class="astro-val">${meta.astro}</div>
                  <div class="astro-label">🔢 Số Học Huyền Bí:</div>
                  <div class="astro-val">${meta.num}</div>
                </div>
              ` : ''}
            </div>

            <!-- Right Col: Meaning, Symbolism & Advice -->
            <div class="tarot-modal-info-col">
              <h2 class="tarot-modal-title">${c.name_vi}</h2>
              <div class="tarot-modal-sub">${c.name_en}</div>

              <!-- Symbolism Breakdown -->
              ${meta && meta.symbols ? `
                <div class="tarot-info-block symbolism-block">
                  <h4>🎨 Biểu Tượng Học Rider-Waite (Symbolism):</h4>
                  <p>${meta.symbols}</p>
                </div>
              ` : ''}

              <!-- Active Orientation Keywords -->
              <div class="tarot-info-block ${!isModalReversed ? 'highlight-block' : ''}">
                <h4>🔑 Từ khóa Xuôi (Upright):</h4>
                <p>${c.keywords_up}</p>
              </div>

              <div class="tarot-info-block ${isModalReversed ? 'highlight-block' : ''}">
                <h4>🔄 Từ khóa Ngược (Reversed):</h4>
                <p>${c.keywords_rev}</p>
              </div>

              <div class="tarot-info-block">
                <h4>🌟 Ý nghĩa Tổng quan (${!isModalReversed ? 'Chiều Xuôi' : 'Chiều Ngược'}):</h4>
                <p>${!isModalReversed ? (c.meanings ? c.meanings.general : '') : 'Năng lượng bị trì hoãn, xung đột nội tâm hoặc cần soi xét lại góc nhìn.'}</p>
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
                <h4>💡 Lời khuyên cốt lõi:</h4>
                <p><em>${c.advice}</em></p>
              </div>
            </div>
          </div>
        </div>
      `;

      modal.style.display = 'flex';

      // Event bindings inside modal
      const closeBtn = modal.querySelector('#tarot-modal-close-btn');
      if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; };
      modal.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
      };

      const btnUp = modal.querySelector('#btn-orient-upright');
      const btnRev = modal.querySelector('#btn-orient-reversed');
      if (btnUp) btnUp.onclick = () => {
        if (isModalReversed) {
          isModalReversed = false;
          playCardFlipSound();
          triggerHaptic(15);
          renderModalBody();
        }
      };
      if (btnRev) btnRev.onclick = () => {
        if (!isModalReversed) {
          isModalReversed = true;
          playCardFlipSound();
          triggerHaptic(15);
          renderModalBody();
        }
      };
    }

    renderModalBody();
  }

  // ==========================================================================
  // PDF EXPORT ENGINE & HIGH-FIDELITY PRINTABLE GENERATOR
  // ==========================================================================

  function buildTarotPdfHtml(report) {
    if (!report) return '';

    const cards = report.cardReadings || report.cards || [];
    const domainLabels = {
      general: 'Tổng Quan Vận Trình',
      love: 'Tình Duyên & Mối Quan Hệ',
      career: 'Sự Nghiệp & Công Danh',
      finance: 'Tài Chính & Đầu Tư',
      spiritual: 'Phát Triển Tâm Linh & Tự Thân'
    };
    const domainText = domainLabels[report.domain] || report.domain || 'Tổng Quan';
    const nowStr = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    let html = `
      <div class="tarot-pdf-paper">
        <!-- Header Banner -->
        <div class="pdf-hdr-banner">
          <div class="pdf-hdr-left">
            <span class="pdf-hdr-icon">🔮</span>
            <div>
              <h1 class="pdf-hdr-title">NETA LIGHT - BÁO CÁO LUẬN GIẢI TAROT CHUYÊN SÂU</h1>
              <div class="pdf-hdr-subtitle">Hệ Thống Phân Tích Biểu Tượng & Động Lực Năng Lượng Nadrasa Dehi</div>
            </div>
          </div>
          <div class="pdf-hdr-date">
            <div>Ngày trích xuất:</div>
            <div><strong>${nowStr}</strong></div>
          </div>
        </div>

        <!-- Metadata Bar -->
        <div class="pdf-meta-grid">
          <div class="pdf-meta-cell">
            <span class="pdf-meta-label">❓ Định tâm / Câu hỏi:</span>
            <span class="pdf-meta-val">${report.question || 'Chiêm nghiệm tổng quan vận trình'}</span>
          </div>
          <div class="pdf-meta-cell">
            <span class="pdf-meta-label">📐 Kiểu trải bài:</span>
            <span class="pdf-meta-val">${report.spreadName || 'Trải bài Tarot'}</span>
          </div>
          <div class="pdf-meta-cell">
            <span class="pdf-meta-label">🧭 Lĩnh vực chiêm nghiệm:</span>
            <span class="pdf-meta-val">${domainText}</span>
          </div>
          <div class="pdf-meta-cell">
            <span class="pdf-meta-label">⚖️ Xu thế định hướng:</span>
            <span class="pdf-meta-val">${report.fateVerdict || 'Cân bằng'}</span>
          </div>
        </div>
    `;

    // Visual Spread Gallery
    if (cards.length > 0) {
      html += `
        <div class="pdf-spread-box">
          <div class="pdf-sec-head">
            <span>🖼️</span> BÀN TRẢI BÀI TRỰC QUAN (${cards.length} LÁ)
          </div>
          <div class="pdf-cards-gallery-grid">
            ${cards.map((c, i) => `
              <div class="pdf-card-col">
                <div class="pdf-card-pos" title="${c.position || ''}">
                  ${c.position || `Vị trí #${i + 1}`}
                </div>
                <div class="pdf-card-img-wrap">
                  <img src="assets/tarot/${c.imageWebp || (c.cardId + '.webp')}" 
                       alt="${c.cardName || ''}" 
                       class="${c.isUpright ? '' : 'is-reversed'}">
                </div>
                <div class="pdf-card-name-vi">${c.nameVi || c.cardName || ''}</div>
                <div class="pdf-card-name-en">${c.nameEn || ''}</div>
                <span class="pdf-card-status-badge ${c.isUpright ? 'upright' : 'reversed'}">
                  ${c.orientation || (c.isUpright ? '↑ Chiều Thuận' : '↓ Chiều Ngược')}
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Section I: Quintessence
    if (report.quintessence) {
      const q = report.quintessence;
      html += `
        <div class="pdf-block">
          <div class="pdf-sec-head">
            <span>✨</span> I. NĂNG LƯỢNG LINH HỒN CỐT TỦY (QUINTESSENCE)
          </div>
          <div class="pdf-quint-card">
            <img src="assets/tarot/${q.imageWebp || q.image_webp || (q.cardId + '.webp')}" alt="${q.nameVi || q.name_vi}" class="pdf-quint-img">
            <div>
              <div style="font-size: 1.05rem; font-weight: 800; color: #1e1b4b; margin-bottom: 4px;">
                ${q.nameVi || q.name_vi} (Số học: ${q.roman || q.reducedNumber} - Tổng: ${q.rawSum || q.sum})
              </div>
              <div style="font-size: 0.88rem; color: #4338ca; font-weight: 700; margin-bottom: 8px;">
                Căn nguyên năng lượng & Bài học thấu suốt
              </div>
              <div style="font-size: 0.92rem; color: #1e293b; line-height: 1.55;">
                ${formatMarkdownInline(q.lesson || '')}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Section II: Storyline Narrative
    if (report.synthesizedStory) {
      html += `
        <div class="pdf-block">
          <div class="pdf-sec-head">
            <span>📜</span> II. DÒNG CHẢY CỐT TRUYỆN TOÀN CẢNH (STORYLINE NARRATIVE)
          </div>
          <blockquote class="pdf-story-quote">
            ${formatMarkdownInline(report.synthesizedStory)}
          </blockquote>
        </div>
      `;
    }

    // Section III: Archetypal Patterns
    if (report.archetypalPatterns && report.archetypalPatterns.length > 0) {
      html += `
        <div class="pdf-block">
          <div class="pdf-sec-head">
            <span>🏛️</span> III. CÁC MẪU THỨC CẤU TRÚC (ARCHETYPAL PATTERNS)
          </div>
          ${report.archetypalPatterns.map(p => `
            <div class="pdf-pattern-item">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span class="pdf-pattern-badge">${p.badge}</span>
                <strong style="color: #9d174d; font-size: 0.95rem;">${p.title}</strong>
              </div>
              <div style="color: #1e293b; font-size: 0.88rem; line-height: 1.5;">${p.desc}</div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Section IV: Elemental Dignities & Macro Scan
    html += `
      <div class="pdf-block">
        <div class="pdf-sec-head">
          <span>⚖️</span> IV. PHÂN TÍCH ĐỊNH LƯỢNG VĨ MÔ & NGUYÊN TỐ (MACRO SCAN)
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; font-size: 0.9rem; margin-bottom: 8px;">
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; margin-bottom: 8px;">
            <div><strong>Tỷ lệ Ẩn chính:</strong> ${report.majorRatio || 'N/A'}</div>
            <div><strong>Trạng thái chiều:</strong> ${report.orientationStat || 'N/A'}</div>
            <div><strong>Nguyên tố thống trị:</strong> ${report.dominantElement || 'Cân bằng'}</div>
            <div><strong>Dòng chảy tổng thể:</strong> ${report.flowVerdict || 'Bình ổn'}</div>
          </div>
          ${report.missingElementsDesc ? `
            <div style="color: #475569; font-size: 0.86rem; border-top: 1px solid #e2e8f0; padding-top: 6px;">
              <strong>Bổ sung thiếu hụt:</strong> ${report.missingElementsDesc}
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Section V: Detailed Card Breakdown
    if (cards.length > 0) {
      html += `
        <div class="pdf-block">
          <div class="pdf-sec-head">
            <span>🔍</span> V. LUẬN GIẢI CHI TIẾT TỪNG QUÂN BÀI
          </div>
          ${cards.map((c, i) => `
            <div class="pdf-card-detail-item">
              <img src="assets/tarot/${c.imageWebp || (c.cardId + '.webp')}" 
                   alt="${c.cardName}" 
                   class="pdf-card-thumb ${c.isUpright ? '' : 'is-reversed'}">
              <div class="pdf-card-info">
                <div class="pdf-card-pos-title">
                  ${c.position || `Vị trí #${i + 1}`}
                </div>
                <div class="pdf-card-item-name">
                  ${c.cardName || c.nameVi} <span class="pdf-card-status-badge ${c.isUpright ? 'upright' : 'reversed'}">${c.orientation || (c.isUpright ? 'Chiều Thuận' : 'Chiều Ngược')}</span>
                </div>
                <div class="pdf-card-meta-line">
                  <strong>Từ khóa:</strong> ${Array.isArray(c.keywords) ? c.keywords.slice(0, 5).join(' • ') : (c.keywords || '')}
                </div>
                <div class="pdf-card-text">
                  ${formatMarkdownInline(c.detailMeaning || c.meaning || '')}
                </div>
                ${c.advice ? `
                  <div class="pdf-card-advice-box">
                    💡 <strong>Lời khuyên:</strong> ${formatMarkdownInline(c.advice)}
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Section VI: Actionable Prescription
    if (report.finalAdvice) {
      html += `
        <div class="pdf-block">
          <div class="pdf-sec-head">
            <span>🎯</span> VI. TỔNG KẾT & KẾ HOẠCH HÀNH ĐỘNG (ACTIONABLE PRESCRIPTION)
          </div>
          <blockquote class="pdf-prescription-quote">
            ${formatMarkdownInline(report.finalAdvice)}
          </blockquote>
        </div>
      `;
    }

    // Footer
    html += `
        <div class="pdf-footer">
          <div>Trích xuất từ <strong>Hệ Thống Bốc Bài Neta Light</strong> - Pháp môn Nadrasa Dehi</div>
          <div>Bản in định dạng chuẩn A4 • Lưu hành nội bộ chiêm nghiệm</div>
        </div>
      </div>
    `;

    return html;
  }

  function downloadStandaloneHtmlReport(report) {
    if (!report) return;
    const bodyContent = buildTarotPdfHtml(report);
    const fullHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bao_Cao_Tarot_Neta_Light_${Date.now()}</title>
  <style>
    body {
      background: #f1f5f9;
      color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 24px 12px;
    }
    .tarot-pdf-paper {
      background: #ffffff;
      max-width: 800px;
      margin: 0 auto;
      padding: 32px 36px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .pdf-hdr-banner { border-bottom: 2.5px solid #4f46e5; padding-bottom: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: flex-start; }
    .pdf-hdr-left { display: flex; align-items: center; gap: 12px; }
    .pdf-hdr-icon { font-size: 2.4rem; }
    .pdf-hdr-title { font-size: 1.3rem; font-weight: 800; color: #1e1b4b; margin: 0; }
    .pdf-hdr-subtitle { font-size: 0.85rem; color: #64748b; margin-top: 2px; }
    .pdf-hdr-date { font-size: 0.85rem; color: #475569; text-align: right; }
    .pdf-meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 22px; font-size: 0.9rem; }
    .pdf-meta-cell { display: flex; gap: 6px; }
    .pdf-meta-label { color: #64748b; font-weight: 600; }
    .pdf-meta-val { color: #0f172a; font-weight: 700; }
    .pdf-sec-head { font-size: 1.05rem; font-weight: 800; color: #312e81; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
    .pdf-cards-gallery-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px; margin-bottom: 10px; }
    .pdf-card-col { flex: 0 0 130px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px; text-align: center; background: #f8fafc; box-sizing: border-box; }
    .pdf-card-pos { font-size: 0.75rem; font-weight: 700; color: #4338ca; margin-bottom: 6px; }
    .pdf-card-img-wrap { width: 100%; aspect-ratio: 2/3.4; overflow: hidden; border-radius: 4px; margin-bottom: 6px; background: #e2e8f0; }
    .pdf-card-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .pdf-card-img-wrap img.is-reversed { transform: rotate(180deg); }
    .pdf-card-name-vi { font-size: 0.82rem; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
    .pdf-card-name-en { font-size: 0.72rem; color: #64748b; margin-bottom: 4px; }
    .pdf-card-status-badge { display: inline-block; font-size: 0.7rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
    .pdf-card-status-badge.upright { background: #dbeafe; color: #1e40af; }
    .pdf-card-status-badge.reversed { background: #fee2e2; color: #991b1b; }
    .pdf-block { margin-bottom: 20px; page-break-inside: avoid; }
    .pdf-quint-card { display: flex; gap: 16px; background: #faf5ff; border: 1.5px solid #d8b4fe; border-radius: 8px; padding: 14px; }
    .pdf-quint-img { width: 75px; height: 125px; object-fit: cover; border-radius: 6px; border: 1px solid #c084fc; flex-shrink: 0; }
    .pdf-story-quote { background: #f1f5f9; border-left: 4px solid #4f46e5; padding: 12px 16px; border-radius: 0 8px 8px 0; color: #1e293b; font-size: 0.94rem; line-height: 1.6; margin: 0; }
    .pdf-pattern-item { background: #fff5f7; border: 1px solid #fbcfe8; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; }
    .pdf-pattern-badge { background: #fce7f3; color: #831843; border: 1px solid #f472b6; font-size: 0.78rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; }
    .pdf-card-detail-item { display: flex; gap: 16px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 12px; background: #ffffff; page-break-inside: avoid; }
    .pdf-card-thumb { width: 78px; height: 130px; object-fit: cover; border-radius: 6px; border: 1px solid #cbd5e1; flex-shrink: 0; }
    .pdf-card-thumb.is-reversed { transform: rotate(180deg); }
    .pdf-card-info { flex: 1; }
    .pdf-card-pos-title { font-size: 0.88rem; font-weight: 800; color: #4338ca; margin-bottom: 2px; }
    .pdf-card-item-name { font-size: 1.05rem; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
    .pdf-card-meta-line { font-size: 0.82rem; color: #475569; margin-bottom: 8px; }
    .pdf-card-text { font-size: 0.9rem; color: #1e293b; line-height: 1.55; margin-bottom: 8px; }
    .pdf-card-advice-box { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 8px 12px; font-size: 0.86rem; color: #065f46; }
    .pdf-prescription-quote { background: #ecfdf5; border-left: 4px solid #059669; padding: 12px 16px; border-radius: 0 8px 8px 0; color: #065f46; font-size: 0.94rem; line-height: 1.6; margin: 0; }
    .pdf-footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: #94a3b8; }
    @media print {
      body { background: #fff; padding: 0; }
      .tarot-pdf-paper { box-shadow: none; border: none; padding: 0; }
    }
  </style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_Cao_Tarot_Neta_Light_${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (typeof window.showToast === 'function') {
      window.showToast('✅ Đã tải tệp HTML Báo cáo Luận giải về máy!');
    }
  }

  function openPdfExportModal(report) {
    if (!report) return;

    const oldModal = document.getElementById('tarot-pdf-modal');
    if (oldModal) oldModal.remove();

    // Prepare print area for hardware print
    let printArea = document.getElementById('tarot-pdf-print-area');
    if (!printArea) {
      printArea = document.createElement('div');
      printArea.id = 'tarot-pdf-print-area';
      document.body.appendChild(printArea);
    }
    const reportHtml = buildTarotPdfHtml(report);
    printArea.innerHTML = reportHtml;

    // Interactive Preview Modal
    const modal = document.createElement('div');
    modal.id = 'tarot-pdf-modal';
    modal.className = 'tarot-pdf-modal-overlay';
    modal.innerHTML = `
      <div class="tarot-pdf-modal-card">
        <div class="tarot-pdf-modal-header">
          <h3><span>📄</span> Xuất Báo Cáo Luận Giải PDF (Format Đẹp Mắt)</h3>
          <button class="tarot-pdf-modal-close" id="btn-close-pdf-modal">✕</button>
        </div>
        <div class="tarot-pdf-modal-body">
          <div style="margin-bottom: 12px; color: #cbd5e1; font-size: 0.88rem; display: flex; align-items: center; justify-content: space-between;">
            <span>Xem trước định dạng chuẩn A4 (Bao gồm đồ họa quân bài & phân tích chuyên sâu)</span>
          </div>
          <div class="tarot-pdf-preview-container">
            ${reportHtml}
          </div>
        </div>
        <div class="tarot-pdf-modal-footer">
          <button id="btn-download-html-report" class="tarot-btn-secondary">
            💾 Tải Bản HTML Báo Cáo
          </button>
          <button id="btn-print-to-pdf" class="tarot-btn-pdf">
            🖨️ Lưu Dưới Dạng PDF (Save as PDF)
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const btnClose = modal.querySelector('#btn-close-pdf-modal');
    if (btnClose) {
      btnClose.addEventListener('click', () => modal.remove());
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    const btnPrint = modal.querySelector('#btn-print-to-pdf');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        triggerHaptic(20);
        if (typeof window.showToast === 'function') {
          window.showToast('📄 Đang mở trình Lưu PDF / In hệ thống...');
        }
        setTimeout(() => {
          window.print();
        }, 150);
      });
    }

    const btnDownloadHtml = modal.querySelector('#btn-download-html-report');
    if (btnDownloadHtml) {
      btnDownloadHtml.addEventListener('click', () => {
        triggerHaptic(15);
        downloadStandaloneHtmlReport(report);
      });
    }
  }

  const NetaTarotView = {
    init: initTarotView,
    render: renderTarot,
    openCardDetail: openTarotCardDetailModal,
    exportPdf: openPdfExportModal
  };

  global.NetaTarotView = NetaTarotView;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTarotView);
  } else {
    initTarotView();
  }
})(typeof window !== 'undefined' ? window : global);
