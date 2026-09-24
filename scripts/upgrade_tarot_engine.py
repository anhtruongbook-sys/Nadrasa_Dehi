# -*- coding: utf-8 -*-
"""
Script nâng cấp engines/tarot_engine.js:
1. Thuật toán Lá Bài Cốt Tủy (The Quintessence Card Algorithm).
2. Bộ Nhận Diện Mẫu Hình Cổ Mẫu (Archetypal Pattern Matching & Constellations).
3. Bộ Tạo Mạch Truyện Nhân Quả Biện Chứng (Dialectical Narrative Synthesis).
"""

import sys
import os
import json

sys.path.insert(0, r"C:\Books\Tarot")
import tarot_interpreter

db = tarot_interpreter.TAROT_DATABASE
relations_raw = tarot_interpreter.ELEMENTAL_RELATIONS

relations_json = {}
for (el1, el2), val in relations_raw.items():
    key = f"{el1}_{el2}"
    relations_json[key] = val

db_json_str = json.dumps(db, ensure_ascii=False, indent=2)
rel_json_str = json.dumps(relations_json, ensure_ascii=False, indent=2)

js_content = f"""/**
 * NETA LIGHT - CLASSICAL TAROT INTERPRETER ENGINE (V2.0 ADVANCED)
 * 
 * Dựa trên hệ thống biểu tượng Rider-Waite-Smith (RWS) & Thuật toán Golden Dawn Elemental Dignities.
 * Tích hợp 3 Thuật toán Luận giải Chuyên sâu Offline (Zero-AI):
 * 1. The Quintessence Card (Lá Bài Cốt Tủy - Paul Foster Case & Mary K. Greer)
 * 2. Archetypal Pattern Matching (Mẫu hình Hoàng gia, Đơn sắc, Cặp bài đối ngẫu)
 * 3. Dialectical Narrative Synthesis (Mạch truyện nhân quả biện chứng xâu chuỗi 3 thì)
 */

(function (global) {{
  'use strict';

  // 1. CƠ SỞ TRI THỨC 78 LÁ BÀI TAROT
  const TAROT_DATABASE = {db_json_str};

  // 2. MA TRẬN TƯƠNG TÁC NGUYÊN TỐ (GOLDEN DAWN ELEMENTAL DIGNITIES)
  const ELEMENTAL_RELATIONS = {rel_json_str};

  const ELEMENT_DESCRIPTIONS = {{
    Fire: 'Nhiệt huyết, ý chí hành động và ngọn lửa đam mê',
    Water: 'Cảm xúc, tình cảm, sự thấu cảm và trực giác nội tâm',
    Air: 'Lý trí, sự thật khách quan, phân tích logic và giải tỏa áp lực',
    Earth: 'Tính thực tế, kế hoạch tài chính cụ thể và nền tảng vật chất vững vàng'
  }};

  const SPREAD_DEFINITIONS = {{
    'single': {{
      id: 'single',
      name: '1 lá: Thông điệp Trọng tâm (Daily Card)',
      count: 1,
      positions: ['Trọng tâm thông điệp hiện tại']
    }},
    'past_present_future': {{
      id: 'past_present_future',
      name: '3 lá: Dòng thời gian (Quá khứ - Hiện tại - Tương lai)',
      count: 3,
      positions: [
        'Quá khứ / Căn nguyên gốc rễ',
        'Hiện tại / Thử thách cốt lõi',
        'Xu hướng Tương lai / Kết quả tiềm năng'
      ]
    }},
    'problem_solution': {{
      id: 'problem_solution',
      name: '3 lá: Vấn đề & Giải pháp',
      count: 3,
      positions: [
        'Thực trạng vấn đề',
        'Nguyên nhân ẩn giấu',
        'Giải pháp hành động đề xuất'
      ]
    }},
    'relationship': {{
      id: 'relationship',
      name: '3 lá: Mối quan hệ & Tương tác đôi bên',
      count: 3,
      positions: [
        'Năng lượng & Tâm thế của bạn',
        'Năng lượng & Mong cầu của đối phương',
        'Giao thoa & Hướng phát triển của mối quan hệ'
      ]
    }},
    'decision': {{
      id: 'decision',
      name: '3 lá: So sánh & Lựa chọn ngã rẽ',
      count: 3,
      positions: [
        'Con đường / Lựa chọn A',
        'Con đường / Lựa chọn B',
        'Yếu tố then chốt quyết định'
      ]
    }}
  }};

  const QUINTESSENCE_LESSONS = {{
    0: 'Tái sinh qua niềm tin thuần khiết: Hãy dám bước vào khoảng trống vô định với sự can đảm của đứa trẻ; giải phóng mọi định kiến cũ kỹ.',
    1: 'Hiện thực hóa ý chí: Bạn đã có đầy đủ nguồn lực và công cụ, vấn đề then chốt là tập trung 100% ý chí để biến ý niệm thành hành động thực tế.',
    2: 'Lắng nghe trực giác & tĩnh lặng: Câu trả lời không nằm ở thế giới ồn ào bên ngoài; hãy kiên nhẫn quan sát, giữ bí mật và tin vào tiếng nói nội tâm.',
    3: 'Nuôi dưỡng & Sinh sôi trù phú: Dự án và tâm tư cần thời gian đơm hoa kết trái tự nhiên; hãy dùng tình yêu thương và sự kiên nhẫn thay vì thúc ép.',
    4: 'Thiết lập trật tự & kỷ luật thép: Cần xây dựng quy trình, ranh giới rõ ràng và kiểm soát hoàn cảnh bằng lý trí vững vàng.',
    5: 'Tôn trọng quy chuẩn & tìm kiếm chỉ dẫn: Học hỏi từ tiền nhân, tuân thủ các nguyên tắc đạo lý hoặc tìm kiếm lời khuyên từ bậc thầy nhiều kinh nghiệm.',
    6: 'Lựa chọn của con tim & cam kết hệ giá trị: Đứng trước ngã rẽ quan trọng, hãy chọn con đường hòa hợp với tiếng gọi đích thực của tâm hồn.',
    7: 'Tập trung ý chí & kiểm soát xung đột: Điều phối các luồng năng lượng đối lập bên trong bạn để lao về phía trước với quyết tâm kiên định.',
    8: 'Sức mạnh của sự nhu hòa: Dùng lòng từ tâm, sự nhẫn nại và thấu cảm để thuần hóa những con thú hoang giận dữ hay lo âu bên trong.',
    9: 'Tự vấn nội tâm & soi sáng chân lý: Rút lui khỏi ồn ào thế sự để tìm lại chính mình; câu trả lời đang chờ đợi bạn trong khoảnh khắc cô độc thông tuệ.',
    10: 'Thích ứng với bánh xe luân chuyển: Vận mệnh luôn vận động không ngừng; điều quan trọng là đứng ở tâm trục bánh xe để giữ thăng bằng dù thăng hay trầm.',
    11: 'Minh bạch & Cân bằng nhân quả: Hành động công tâm, nhìn nhận sự thật khách quan và nhận trách nhiệm về mọi lựa chọn của bản thân.',
    12: 'Buông bỏ để nhìn đời từ góc độ mới: Đôi khi dừng lại, hi sinh cái tôi nhất thời chính là chìa khóa để khai mở sự giác ngộ sâu sắc nhất.',
    13: 'Đoạn tuyệt chu kỳ cũ để tái sinh: Cái gì đã mục ruỗng cần phải ra đi để nhường chỗ cho sự sống mới bắt đầu; đừng cố níu giữ dĩ vãng.',
    14: 'Tiết chế & Nghệ thuật dung hòa: Trộn lẫn các thái cực bằng sự nhịp nhàng, kiên định và điều độ; tránh mọi biểu hiện cực đoan.',
    15: 'Nhận diện xiềng xích ảo tưởng: Đối diện với những cám dỗ, nỗi sợ hãi hoặc thói quen trói buộc để tự giải phóng bản thân khỏi ngục tù tâm lý.',
    16: 'Giải phóng qua sự sụp đổ của ảo vọng: Bão giông phá hủy những tòa thành giả tạo để bạn được xây dựng lại cuộc đời trên nền móng chân thật vững bền.',
    17: 'Hy vọng & Niềm tin dẫn lối: Sau giông bão là bầu trời sao thanh bình; hãy mở lòng đón nhận nguồn cảm hứng chữa lành và định hướng tương lai.',
    18: 'Vượt qua ảo ảnh & bóng tối tiềm thức: Cẩn trọng trước những hoang mang, nghi kỵ; hãy để trực giác dẫn đường qua màn sương mù mờ ảo.',
    19: 'Rạng rỡ ánh sáng & thành tựu viên mãn: Sự thật được phơi bày rõ ràng, niềm vui thuần khiết và năng lượng sống tích cực tràn đầy.',
    20: 'Tiếng gọi thức tỉnh & Tái định giá cuộc đời: Thời khắc tha thứ cho quá khứ, nghe theo tiếng gọi thiên mệnh để bước lên một tầm thức mới.',
    21: 'Viên mãn & Hợp nhất toàn diện: Hoàn tất một đại chu kỳ thành công, đạt tới sự hòa hợp trọn vẹn giữa bản thân và vũ trụ.'
  }};

  // 3. ĐỘNG CƠ THUẬT TOÁN TAROT ENGINE
  const NetaTarotEngine = {{
    getDatabase: function () {{
      return TAROT_DATABASE;
    }},

    getSpreadDefinitions: function () {{
      return SPREAD_DEFINITIONS;
    }},

    getCard: function (cardId) {{
      return TAROT_DATABASE[cardId] || null;
    }},

    getAllCardsList: function () {{
      return Object.values(TAROT_DATABASE);
    }},

    drawRandom: function (count = 3, allowReversed = true) {{
      const keys = Object.keys(TAROT_DATABASE);
      const shuffled = keys.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, count);
      
      return selected.map(id => {{
        const isUpright = allowReversed ? (Math.random() > 0.25) : true;
        return {{
          cardId: id,
          isUpright: isUpright
        }};
      }});
    }},

    detectDomainFromQuestion: function (questionText) {{
      if (!questionText || typeof questionText !== 'string') return 'general';
      const q = questionText.toLowerCase();
      
      const loveKeywords = ['yêu', 'tình', 'người yêu', 'crush', 'chia tay', 'kết hôn', 'cưới', 'bạn gái', 'bạn trai', 'tình cảm', 'hẹn hò', 'chồng', 'vợ'];
      const careerKeywords = ['việc', 'công việc', 'tiền', 'lương', 'sếp', 'đồng nghiệp', 'kinh doanh', 'đầu tư', 'học tập', 'thi cử', 'thăng chức', 'dự án', 'nghề'];

      if (loveKeywords.some(kw => q.includes(kw))) return 'love';
      if (careerKeywords.some(kw => q.includes(kw))) return 'career';
      return 'general';
    }},

    /**
     * THUẬT TOÁN 1: TÍNH LÁ BÀI CỐT TỦY (THE QUINTESSENCE CARD)
     * Paul Foster Case & Mary K. Greer
     */
    computeQuintessence: function (cardObjects) {{
      let totalSum = 0;
      cardObjects.forEach(c => {{
        let num = c.number !== undefined ? c.number : 0;
        if (c.arcana === 'Minor') {{
          if (c.id.includes('_01_') || c.id.includes('_Ace')) num = 1;
          else if (c.id.includes('_11_') || c.id.includes('_Page')) num = 11;
          else if (c.id.includes('_12_') || c.id.includes('_Knight')) num = 12;
          else if (c.id.includes('_13_') || c.id.includes('_Queen')) num = 13;
          else if (c.id.includes('_14_') || c.id.includes('_King')) num = 14;
        }}
        totalSum += num;
      }});

      let reduced = totalSum;
      while (reduced > 22) {{
        const digits = String(reduced).split('').map(Number);
        reduced = digits.reduce((acc, d) => acc + d, 0);
      }}

      const majorIdMap = {{
        0: 'Major_00_Fool', 22: 'Major_00_Fool',
        1: 'Major_01_Magician', 2: 'Major_02_High_Priestess', 3: 'Major_03_Empress',
        4: 'Major_04_Emperor', 5: 'Major_05_Hierophant', 6: 'Major_06_Lovers',
        7: 'Major_07_Chariot', 8: 'Major_08_Strength', 9: 'Major_09_Hermit',
        10: 'Major_10_Wheel_of_Fortune', 11: 'Major_11_Justice', 12: 'Major_12_Hanged_Man',
        13: 'Major_13_Death', 14: 'Major_14_Temperance', 15: 'Major_15_Devil',
        16: 'Major_16_Tower', 17: 'Major_17_Star', 18: 'Major_18_Moon',
        19: 'Major_19_Sun', 20: 'Major_20_Judgement', 21: 'Major_21_World'
      }};

      const quintCardId = majorIdMap[reduced] || 'Major_00_Fool';
      const quintCard = TAROT_DATABASE[quintCardId];

      return {{
        rawSum: totalSum,
        reducedNumber: reduced,
        cardId: quintCardId,
        nameVi: quintCard ? quintCard.name_vi : 'Kẻ Khờ',
        nameEn: quintCard ? quintCard.name_en : 'The Fool',
        imageWebp: quintCardId + '.webp',
        lesson: QUINTESSENCE_LESSONS[reduced] || QUINTESSENCE_LESSONS[0]
      }};
    }},

    /**
     * THUẬT TOÁN 2: NHẬN DIỆN MẪU HÌNH CỔ MẪU (ARCHETYPAL PATTERN MATCHING)
     */
    detectArchetypalPatterns: function (cardObjects) {{
      const patterns = [];

      // A. Mẫu Court Cards (Hoàng Gia)
      const courtCards = cardObjects.filter(c => 
        c.id.includes('_11_') || c.id.includes('_Page') ||
        c.id.includes('_12_') || c.id.includes('_Knight') ||
        c.id.includes('_13_') || c.id.includes('_Queen') ||
        c.id.includes('_14_') || c.id.includes('_King')
      );
      if (courtCards.length >= 2) {{
        patterns.push({{
          type: 'court_dominance',
          title: 'Mẫu Hình Hoàng Gia (Tác Động Từ Con Người Bên Ngoài)',
          badge: '👥 Ảnh hưởng từ các nhân vật ngoại cảnh',
          desc: `Trải bài xuất hiện ${{courtCards.length}} nhân vật Hoàng gia (${{courtCards.map(c => c.name_vi).join(', ')}}). Báo hiệu tình huống không thuần túy là nội tâm cá nhân, mà đang bị chi phối mạnh mẽ bởi các nhân vật ngoại cảnh (cấp trên, đối tác, người thân hoặc đối thủ). Cần chú ý phong cách giao tiếp và ranh giới với những người này.`
        }});
      }}

      // B. Mẫu Suit Extremity (Bộ Đơn Sắc)
      const suitCounts = {{ Cups: 0, Pentacles: 0, Swords: 0, Wands: 0 }};
      cardObjects.forEach(c => {{
        if (c.id.startsWith('Cups')) suitCounts.Cups++;
        else if (c.id.startsWith('Pentacles')) suitCounts.Pentacles++;
        else if (c.id.startsWith('Swords')) suitCounts.Swords++;
        else if (c.id.startsWith('Wands')) suitCounts.Wands++;
      }});

      for (const suit in suitCounts) {{
        if (suitCounts[suit] >= 2) {{
          const suitDescs = {{
            Swords: {{
              title: 'Cơn Bão Lý Trí & Áp Lực Tinh Thần (Swords Dominant)',
              badge: '⚔️ Bộ Kiếm chiếm ưu thế',
              desc: 'Tập trung dày đặc của năng lượng Kiếm. Bạn đang suy nghĩ, phân tích quá mức hoặc trải qua căng thẳng tâm lý, lo âu và xung đột quan điểm. Cần học cách hạ bớt sự ám ảnh của lý thuyết để cho tâm trí được nghỉ ngơi.'
            }},
            Cups: {{
              title: 'Dòng Lũ Cảm Xúc & Trực Giác Nhạy Cảm (Cups Dominant)',
              badge: '🏆 Bộ Cốc chiếm ưu thế',
              desc: 'Cảm xúc và trái tim đang chi phối gần như toàn bộ tình huống. Bạn nhạy cảm, thấu cảm sâu sắc nhưng cũng dễ bị tổn thương hoặc để tình cảm làm mờ mắt trước những dữ kiện khách quan. Hãy dùng một chút lý trí để định hình dòng chảy.'
            }},
            Pentacles: {{
              title: 'Nền Móng Vật Chất & Tiến Độ Thực Tế (Pentacles Dominant)',
              badge: '🪙 Bộ Tiền chiếm ưu thế',
              desc: 'Tình huống xoay quanh tài chính, sự nghiệp, tiến độ công việc hoặc nền tảng vật chất cụ thể. Tiến độ có thể chậm rãi nhưng vững chắc. Lời khuyên là hãy bám sát dữ liệu thực tế thay vì suy đoán mơ hồ.'
            }},
            Wands: {{
              title: 'Ngọn Lửa Hành Động & Tiến Trình Khẩn Trương (Wands Dominant)',
              badge: '🪄 Bộ Gậy chiếm ưu thế',
              desc: 'Năng lượng hành động, đam mê và nhiệt huyết đang bùng nổ. Sự việc tiến triển với tốc độ nhanh, nhiều ý tưởng hoặc chuyển dịch cùng lúc. Hãy duy trì sự tập trung cao độ để ngọn lửa không bị phân tán hoặc thiêu rụi sức lực.'
            }}
          }};
          patterns.push(suitDescs[suit]);
        }}
      }}

      // C. Mẫu Aces (Hạt giống khởi đầu)
      const aces = cardObjects.filter(c => c.id.includes('_01_') || c.id.includes('_Ace'));
      if (aces.length >= 2) {{
        patterns.push({{
          type: 'multiple_aces',
          title: 'Khởi Đầu Dồn Dập & Hạt Giống Cơ Hội Mới (Multiple Aces)',
          badge: '🌱 Chu kỳ mới mở ra',
          desc: `Sự hội tụ của ${{aces.length}} lá Át (${{aces.map(c => c.name_vi).join(', ')}}) báo hiệu một cánh cửa số mệnh mới đang mở toang. Bạn đang đứng trước thời cơ khởi sắc hiếm có trên nhiều phương diện. Hãy nhanh chóng nắm bắt hạt giống này.`
        }});
      }}

      // D. Mẫu Cặp Đối Ngẫu Huyền Bí
      const cardIds = cardObjects.map(c => c.id);
      const checkPair = (id1, id2) => cardIds.includes(id1) && cardIds.includes(id2);

      if (checkPair('Major_16_Tower', 'Major_17_Star')) {{
        patterns.push({{
          type: 'tower_star',
          title: 'Tái Sinh Qua Giông Bão: Ánh Sao Sau Sự Đổ Vỡ',
          badge: '⚡ Cặp bài Chuyển hóa lớn',
          desc: 'Sự xuất hiện đồng thời của The Tower và The Star là dấu hiệu kinh điển cho thấy: Mọi sự đổ vỡ hay biến cố vừa qua thực chất là sự thanh tẩy cần thiết để dọn đường cho niềm hy vọng và sự tái sinh chân chính nhất của bạn.'
        }});
      }}
      if (checkPair('Major_13_Death', 'Major_19_Sun')) {{
        patterns.push({{
          type: 'death_sun',
          title: 'Đoạn Tuyệt Bóng Tối & Đón Bình Minh Rực Rỡ',
          badge: '☀️ Cặp bài Tái sinh viên mãn',
          desc: 'Sự kết hợp giữa Death và The Sun mang ý nghĩa một chu kỳ u tối, đau thương đã hoàn toàn khép lại. Bình minh đang hé rạng với năng lượng rạng ngời và thành công vượt bậc.'
        }});
      }}
      if (checkPair('Major_06_Lovers', 'Major_15_Devil')) {{
        patterns.push({{
          type: 'lovers_devil',
          title: 'Sự Giằng Xé Giữa Tình Yêu Thuần Khiết & Cám Dỗ Trói Buộc',
          badge: '⛓️ Xung đột nội tâm sâu sắc',
          desc: 'The Lovers và The Devil cùng xuất hiện phản ánh một sự giằng xé dữ dội giữa lý tưởng thanh cao và những ham muốn, ràng buộc độc hại. Đây là bài kiểm tra đạo đức và sự tự do đích thực của bạn.'
        }});
      }}

      return patterns;
    }},

    /**
     * THUẬT TOÁN 3: TỔNG HỢP MẠCH TRUYỆN BIỆN CHỨNG (DIALECTICAL NARRATIVE SYNTHESIS)
     * Xâu chuỗi nhân - quả qua 3 thì (Past - Present - Future) thành một cốt truyện hoàn chỉnh
     */
    synthesizeDialecticalNarrative: function (cardObjects, domain, pairAnalysis, quintessence, spreadType) {{
      const k = cardObjects.length;
      if (k === 1) {{
        const c = cardObjects[0];
        const orient = c.is_upright ? 'thuận dòng năng lượng' : 'gặp điểm nghẽn cản trở';
        return `Thông điệp hiện tại tập trung toàn diện vào lá **${{c.name_vi}} (${{c.name_en}})** trong trạng thái ${{orient}}. Bài học cốt lõi là ${{c.advice}}`;
      }}

      if (k === 3 && spreadType === 'past_present_future') {{
        const [c1, c2, c3] = cardObjects;
        const p1 = pairAnalysis[0] || {{ relation: 'Trung tính', score: 0 }};
        const p2 = pairAnalysis[1] || {{ relation: 'Trung tính', score: 0 }};

        // Giai đoạn 1: Quá khứ -> Hiện tại
        let bridge1 = '';
        if (p1.score > 0.5) {{
          bridge1 = `Chính nền tảng và bài học từ **${{c1.name_vi}}** trong quá khứ (${{c1.keywords_up.split(',')[0]}}) đã tạo bước đệm tự nhiên, đưa bạn tiến thẳng vào thử thách cốt lõi ở hiện tại: **${{c2.name_vi}}**.`;
        }} else if (p1.score < 0) {{
          bridge1 = `Tuy nhiên, những dư chấn hoặc xung đột năng lượng chưa được giải quyết từ **${{c1.name_vi}}** (${{c1.is_upright ? c1.keywords_up : c1.keywords_rev}}) đang tạo thành điểm nghẽn, đẩy bạn vào trạng thái đầy trăn trở của **${{c2.name_vi}}** ở hiện tại.`;
        }} else {{
          bridge1 = `Tiến trình chuyển dịch từ **${{c1.name_vi}}** ở quá khứ sang **${{c2.name_vi}}** ở hiện tại diễn ra theo quy luật tự nhiên, phản ánh đúng giai đoạn trưởng thành trong nhận thức của bạn.`;
        }}

        // Giai đoạn 2: Hiện tại -> Tương lai
        let bridge2 = '';
        if (p2.score > 0.5) {{
          bridge2 = `Nếu tại thời điểm này, bạn làm chủ được bài học của **${{c2.name_vi}}** (${{c2.advice}}), dòng chảy năng lượng sẽ tương sinh mạnh mẽ, mở đường cho quả ngọt viên mãn ở tương lai với **${{c3.name_vi}}** (${{c3.is_upright ? c3.keywords_up : c3.keywords_rev}}).`;
        }} else if (p2.score < 0) {{
          bridge2 = `Đáng lưu ý, tương lai với **${{c3.name_vi}}** đang có sự xung đột năng lượng với hiện tại. Điều này cảnh báo: Nếu không chấn chỉnh kịp thời điểm nghẽn của **${{c2.name_vi}}**, bạn có nguy cơ rơi vào thế giằng co hoặc áp lực không đáng có khi bước sang giai đoạn tiếp theo.`;
        }} else {{
          bridge2 = `Tương lai phía trước mang đậm sắc thái của **${{c3.name_vi}}**, mở ra cơ hội để bạn hiện thực hóa những gì đang ấp ủ, miễn là bạn giữ được tâm thế vững vàng từ hiện tại.`;
        }}

        // Kết luận cốt tủy
        const quintSummary = quintessence ? `Sợi chỉ đỏ xuyên suốt toàn bộ tiến trình này chính là bài học linh hồn của lá Cốt Tủy **${{quintessence.name_vi}}**: *"${{quintessence.lesson}}"*` : '';

        return `${{bridge1}} ${{bridge2}} ${{quintSummary}}`;
      }}

      // Mặc định cho các spread 3 lá khác
      return `Dòng chảy của trải bài liên kết chặt chẽ giữa các vị trí. Khi thấu suốt bài học của từng giai đoạn, bức tranh toàn cảnh sẽ dẫn lối tới sự chuyển hóa của lá Cốt Tủy **${{quintessence ? quintessence.name_vi : ''}}**.`;
    }},

    /**
     * Thuật toán Luận giải Trải bài Toàn diện (V2.0)
     */
    evaluateSpread: function (drawnCards, spreadType = 'past_present_future', domain = 'general', question = '') {{
      const k = drawnCards.length;
      const cardObjects = [];
      
      for (const item of drawnCards) {{
        const base = TAROT_DATABASE[item.cardId];
        if (!base) continue;
        cardObjects.push({{
          ...base,
          is_upright: item.isUpright !== false,
          image_webp: item.cardId + '.webp'
        }});
      }}

      // --- BƯỚC 1: PHÂN TÍCH ĐỊNH LƯỢNG VĨ MÔ (MACRO SCAN) ---
      const majorsCount = cardObjects.filter(c => c.arcana === 'Major').length;
      const majorRatio = k > 0 ? (majorsCount / k) : 0;
      
      const uprightCount = cardObjects.filter(c => c.is_upright).length;
      const reversedCount = k - uprightCount;

      const elementCounts = {{ Fire: 0, Water: 0, Air: 0, Earth: 0 }};
      cardObjects.forEach(c => {{
        if (elementCounts[c.element] !== undefined) {{
          elementCounts[c.element]++;
        }}
      }});

      let dominantElement = 'Fire';
      let maxCount = -1;
      for (const el in elementCounts) {{
        if (elementCounts[el] > maxCount) {{
          maxCount = elementCounts[el];
          dominantElement = el;
        }}
      }}

      const missingElements = Object.keys(elementCounts).filter(el => elementCounts[el] === 0);

      // Đánh giá Fate vs Free-will
      let fateVerdict = '';
      if (majorRatio >= 0.6) {{
        fateVerdict = 'ĐỊNH MỆNH CHI PHỐI CHỦ ĐẠO (Biến chuyển lớn, bài học nghiệp quả ngoài tầm kiểm soát trực tiếp)';
      }} else if (majorRatio >= 0.3) {{
        fateVerdict = 'CÂN BẰNG GIỮA THỜI THẾ VÀ Ý CHÍ (Có cơ duyên đưa đẩy nhưng quyền quyết định then chốt nằm ở bạn)';
      }} else {{
        fateVerdict = 'HÀNH ĐỘNG CÁ NHÂN QUYẾT ĐỊNH (Sự việc cụ thể hàng ngày, kết quả phụ thuộc 100% vào nỗ lực thực tế)';
      }}

      // --- BƯỚC 2: MA TRẬN TƯƠNG TÁC NGUYÊN TỐ (ELEMENTAL DIGNITIES) ---
      const pairAnalysis = [];
      let totalAffinityScore = 0;

      for (let i = 0; i < k - 1; i++) {{
        const c1 = cardObjects[i];
        const c2 = cardObjects[i + 1];
        const pairKey = `${{c1.element}}_${{c2.element}}`;
        const rel = ELEMENTAL_RELATIONS[pairKey] || {{ type: 'Trung tính', score: 0.5, desc: 'Năng lượng dung hòa bình thường.' }};
        totalAffinityScore += rel.score;
        pairAnalysis.push({{
          fromCard: c1.name_vi,
          toCard: c2.name_vi,
          pair: `${{c1.element}} -> ${{c2.element}}`,
          relation: rel.type,
          score: rel.score,
          explanation: rel.desc
        }});
      }}

      // --- BƯỚC 3: THUẬT TOÁN QUINTESSENCE & ARCHETYPAL PATTERNS ---
      const quintessence = this.computeQuintessence(cardObjects);
      const archetypalPatterns = this.detectArchetypalPatterns(cardObjects);

      // --- BƯỚC 4: TỔNG HỢP MẠCH TRUYỆN BIỆN CHỨNG (NARRATIVE SYNTHESIS) ---
      const synthesizedStory = this.synthesizeDialecticalNarrative(cardObjects, domain, pairAnalysis, quintessence, spreadType);

      // --- BƯỚC 5: ÁNH XẠ VỊ TRÍ TRẢI BÀI (SLOT BINDING) ---
      const spreadDef = SPREAD_DEFINITIONS[spreadType] || SPREAD_DEFINITIONS['past_present_future'];
      const positionLabels = spreadDef.positions || [];

      const cardReadings = cardObjects.map((c, i) => {{
        const posName = positionLabels[i] || `Vị trí ${{i + 1}}`;
        const orientationStr = c.is_upright ? 'Xuôi (Upright)' : 'Ngược (Reversed)';
        const kw = c.is_upright ? c.keywords_up : c.keywords_rev;
        let meaning = (c.meanings && c.meanings[domain]) ? c.meanings[domain] : (c.meanings ? c.meanings.general : '');
        if (!c.is_upright) {{
          meaning = `[Năng lượng ngược / cản trở] ${{meaning}} Đang có điểm nghẽn hoặc biểu hiện thái quá/thiếu hụt cần chấn chỉnh.`;
        }}

        return {{
          slotIndex: i,
          position: posName,
          cardId: c.id,
          cardName: `${{c.name_vi}} (${{c.name_en}})`,
          nameVi: c.name_vi,
          nameEn: c.name_en,
          imageWebp: c.image_webp,
          isUpright: c.is_upright,
          orientation: orientationStr,
          arcana: c.arcana,
          element: c.element,
          keywords: kw,
          detailMeaning: meaning,
          advice: c.advice
        }};
      }});

      // --- BƯỚC 6: TỔNG HỢP DÒNG CHẢY NĂNG LƯỢNG & LỜI KHUYÊN ---
      const dominantDesc = ELEMENT_DESCRIPTIONS[dominantElement] || dominantElement;
      const missingDesc = missingElements.length > 0
        ? missingElements.map(e => `${{e}} (${{ELEMENT_DESCRIPTIONS[e]}})`).join(', ')
        : 'Không thiếu nguyên tố nào (Trạng thái cân bằng tốt)';

      let flowVerdict = '';
      if (totalAffinityScore > 1.0) {{
        flowVerdict = 'DÒNG CHẢY NĂNG LƯỢNG THUẬN LỢI (Các giai đoạn tương sinh hỗ trợ nhau rất nhịp nhàng)';
      }} else if (totalAffinityScore < -0.5) {{
        flowVerdict = 'DÒNG CHẢY CÓ XUNG ĐỘT (Có sự bất đồng giữa các giai đoạn, cần giải quyết mâu thuẫn nội tại trước)';
      }} else {{
        flowVerdict = 'DÒNG CHẢY ỔN ĐỊNH BÌNH THƯỜNG (Tiến triển theo quy luật tự nhiên, không có biến động cực đoan)';
      }}

      let finalAdvice = `Tập trung phát huy nguồn năng lượng của ${{dominantDesc}}. `;
      if (missingElements.length > 0) {{
        finalAdvice += `Đồng thời đặc biệt bổ sung phần đang thiếu hụt: ${{missingDesc}}. `;
      }}
      if (quintessence) {{
        finalAdvice += `Lời khuyên cốt tủy từ lá ${{quintessence.name_vi}}: ${{quintessence.lesson}}`;
      }}

      const now = new Date();
      const timestamp = now.toLocaleString('vi-VN', {{ dateStyle: 'medium', timeStyle: 'short' }});

      return {{
        timestamp: timestamp,
        spreadType: spreadType,
        spreadName: spreadDef.name,
        question: question || 'Tổng quan vận thế',
        domain: domain,
        fateVerdict: fateVerdict,
        majorRatio: `${{majorsCount}}/${{k}} lá (${{Math.round(majorRatio * 100)}}%)`,
        uprightCount: uprightCount,
        reversedCount: reversedCount,
        orientationStat: `${{uprightCount}} Xuôi / ${{reversedCount}} Ngược`,
        dominantElement: `${{dominantElement}} (${{dominantDesc}})`,
        missingElementsDesc: missingDesc,
        flowVerdict: flowVerdict,
        totalAffinityScore: totalAffinityScore,
        pairAnalysis: pairAnalysis,
        quintessence: quintessence,
        archetypalPatterns: archetypalPatterns,
        synthesizedStory: synthesizedStory,
        cardReadings: cardReadings,
        finalAdvice: finalAdvice
      }};
    }},

    /**
     * Xuất báo cáo dạng Markdown chuyên nghiệp
     */
    formatMarkdownReport: function (report) {{
      const md = [];
      md.push('# BÁO CÁO LUẬN GIẢI TAROT THEO THUẬT TOÁN CỔ ĐIỂN CHUYÊN SÂU');
      md.push(`*Thời gian:* \\`${{report.timestamp}}\\` | *Chủ đề:* \\`${{report.domain.toUpperCase()}}\\` | *Trải bài:* \\`${{report.spreadName}}\\``);
      if (report.question) {{
        md.push(`*Câu hỏi / Chủ đích:* **${{report.question}}**\\n`);
      }}
      md.push('---');
      
      // I. CỐT TỦY & TỔNG LUẬN
      if (report.quintessence) {{
        md.push('## I. LÁ BÀI CỐT TỦY & BÀI HỌC LINH HỒN (THE QUINTESSENCE)');
        md.push(`* **Lá bài đại diện cốt tủy:** **${{report.quintessence.name_vi}} (${{report.quintessence.name_en}})** (Số học: \\`${{report.quintessence.rawSum}} -> ${{report.quintessence.reducedNumber}}\\`)`);
        md.push(`* **Thông điệp cốt tủy:** *${{report.quintessence.lesson}}*\\n`);
      }}

      md.push('## II. TỔNG LUẬN MẠCH TRUYỆN BIỆN CHỨNG (SYNTHESIZED NARRATIVE)');
      md.push(`> ${{report.synthesizedStory}}\\n`);

      if (report.archetypalPatterns && report.archetypalPatterns.length > 0) {{
        md.push('### Mẫu hình cổ mẫu nổi bật (Archetypal Constellations):');
        report.archetypalPatterns.forEach(p => {{
          md.push(`- **${{p.title}}** [${{p.badge}}]: ${{p.desc}}`);
        }});
        md.push('');
      }}

      md.push('---');
      md.push('## III. PHÂN TÍCH ĐỊNH LƯỢNG VĨ MÔ (MACRO SCAN)');
      md.push(`* **Bản chất trải bài:** **${{report.fateVerdict}}**`);
      md.push(`* **Tỷ lệ Ẩn chính (Major Arcana):** \\`${{report.majorRatio}}\\``);
      md.push(`* **Trạng thái chiều bài:** \\`${{report.orientationStat}}\\``);
      md.push(`* **Nguyên tố thống trị:** **${{report.dominantElement}}**`);
      md.push(`* **Nguyên tố thiếu hụt cần bổ sung:** ${{report.missingElementsDesc}}`);
      md.push(`* **Đánh giá dòng chảy tổng thể:** **${{report.flowVerdict}}**\\n`);

      if (report.pairAnalysis && report.pairAnalysis.length > 0) {{
        md.push('### Ma trận tương tác nguyên tố (Golden Dawn Elemental Dignities):');
        report.pairAnalysis.forEach(p => {{
          const sign = p.score > 0 ? `+${{p.score}}` : `${{p.score}}`;
          md.push(`- **${{p.fromCard}}** -> **${{p.toCard}}** \\`[${{p.pair}}]\\` (${{p.relation}} ${{sign}}): ${{p.explanation}}`);
        }});
        md.push('');
      }}

      md.push('---');
      md.push('## IV. CHI TIẾT LUẬN GIẢI TỪNG VỊ TRÍ');
      report.cardReadings.forEach(c => {{
        md.push(`### ${{c.position}}: ${{c.cardName}} — *[${{c.orientation}}]*`);
        md.push(`- **Phân loại & Nguyên tố:** ${{c.arcana}} Arcana | Nguyên tố ${{c.element}}`);
        md.push(`- **Từ khóa trọng tâm:** \\`${{c.keywords}}\\``);
        md.push(`- **Luận giải chi tiết:** ${{c.detailMeaning}}`);
        md.push(`- **Lời khuyên riêng:** *${{c.advice}}*\\n`);
      }});

      md.push('---');
      md.push('## V. TỔNG KẾT VÀ LỜI KHUYÊN HÀNH ĐỘNG (ACTIONABLE PRESCRIPTION)');
      md.push(`> **THÔNG ĐIỆP CHỐT:** ${{report.finalAdvice}}\\n`);
      return md.join('\\n');
    }}
  }};

  global.NetaTarotEngine = NetaTarotEngine;
}})(typeof window !== 'undefined' ? window : global);
"""

out_engine = r"c:\Books\Neta Light\engines\tarot_engine.js"
with open(out_engine, "w", encoding="utf-8") as f:
    f.write(js_content)
print(f"[OK] Generated {out_engine} ({len(js_content)} bytes)")

mobile_engine = r"c:\Books\Neta Light\mobile_app\assets\www\engines\tarot_engine.js"
with open(mobile_engine, "w", encoding="utf-8") as f:
    f.write(js_content)
print(f"[OK] Synced {mobile_engine}")
