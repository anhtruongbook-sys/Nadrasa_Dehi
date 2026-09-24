import os
import re

print("Starting Phase 3 Implementation: Encyclopedia V2 & Reflective Journal V2...")

tarot_view_path = r"c:\Books\Neta Light\modules\tarot_view.js"
with open(tarot_view_path, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Update State to include Encyclopedia Class Filter & Journal Domain Filter
state_search = r"(let encyFilter = 'all';[\s\S]*?let encySearchQuery = '';)"
new_state_vars = """let encyFilter = 'all'; // 'all' | 'Major' | 'Cups' | 'Pentacles' | 'Swords' | 'Wands'
  let encyClassFilter = 'all'; // 'all' | 'court' | 'pips'
  let encySearchQuery = '';
  let journalFilterDomain = 'all'; // 'all' | 'general' | 'career' | 'love'
  let journalSearchQuery = '';"""

code = re.sub(state_search, new_state_vars, code, count=1)
print("[1] Updated state variables.")

# 2. Add Astrology & Symbolism Dictionary + Journal Stats & Helper functions
helpers_and_dict = """
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
"""

# Insert helpers right before renderTarot()
render_tarot_pos = code.find("  function renderTarot() {")
if render_tarot_pos == -1:
    print("ERROR: could not find renderTarot")
    exit(1)

code = code[:render_tarot_pos] + helpers_and_dict + "\n" + code[render_tarot_pos:]
print("[2] Inserted Astrology dictionary and Journal helpers.")

# Write updated file
with open(tarot_view_path, "w", encoding="utf-8") as f:
    f.write(code)

print("Saved step 1 of Phase 3.")
