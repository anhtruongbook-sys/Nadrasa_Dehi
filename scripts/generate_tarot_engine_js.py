# -*- coding: utf-8 -*-
"""
Script xuất bản CSDL 78 lá bài Tarot và Thuật toán Golden Dawn sang engines/tarot_engine.js
"""
import sys
import os
import json

sys.path.insert(0, r"C:\Books\Tarot")
import tarot_interpreter

db = tarot_interpreter.TAROT_DATABASE
relations_raw = tarot_interpreter.ELEMENTAL_RELATIONS

# Chuyển đổi tuple key trong ELEMENTAL_RELATIONS thành string key 'El1_El2'
relations_json = {}
for (el1, el2), val in relations_raw.items():
    key = f"{el1}_{el2}"
    relations_json[key] = val

db_json_str = json.dumps(db, ensure_ascii=False, indent=2)
rel_json_str = json.dumps(relations_json, ensure_ascii=False, indent=2)

js_content = f"""/**
 * NETA LIGHT - CLASSICAL TAROT INTERPRETER ENGINE
 * 
 * Dựa trên hệ thống biểu tượng Rider-Waite-Smith (RWS) & Thuật toán Golden Dawn Elemental Dignities.
 * Tri thức chuẩn 78 lá bài (22 Major Arcana + 56 Minor Arcana).
 * Hoàn toàn chạy Offline 100% (Client-Side Heuristic NLG Engine, Zero-API, Zero-Cost).
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

    /**
     * Bốc ngẫu nhiên k lá bài không trùng lặp kèm chiều ngẫu nhiên
     * Xác suất: 75% xuôi, 25% ngược theo chuẩn bốc tự nhiên
     */
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

    /**
     * Tự động nhận diện chủ đề câu hỏi nếu người dùng nhập text
     */
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
     * Thuật toán Luận giải Trải bài Toàn diện
     * @param {{Array}} drawnCards Mảng các object [{{cardId: 'Major_00_Fool', isUpright: true}}, ...]
     * @param {{string}} spreadType 'past_present_future' | 'problem_solution' | 'relationship' | 'decision' | 'single'
     * @param {{string}} domain 'general' | 'career' | 'love'
     * @param {{string}} question Câu hỏi của người dùng (tùy chọn)
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

      // --- BƯỚC 3: ÁNH XẠ VỊ TRÍ TRẢI BÀI (SLOT BINDING) ---
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

      // --- BƯỚC 4: TỔNG HỢP DÒNG CHẢY NĂNG LƯỢNG & LỜI KHUYÊN ---
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
        finalAdvice += `Đồng thời đặc biệt bổ sung phần đang thiếu hụt: ${{missingDesc}}.`;
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
        cardReadings: cardReadings,
        finalAdvice: finalAdvice
      }};
    }},

    /**
     * Xuất báo cáo dạng Markdown
     */
    formatMarkdownReport: function (report) {{
      const md = [];
      md.push('# BÁO CÁO LUẬN GIẢI TRẢI BÀI TAROT THEO THUẬT TOÁN CỔ ĐIỂN');
      md.push(`*Thời gian:* \\`${{report.timestamp}}\\` | *Chủ đề:* \\`${{report.domain.toUpperCase()}}\\` | *Trải bài:* \\`${{report.spreadName}}\\``);
      if (report.question) {{
        md.push(`*Câu hỏi / Chủ đích:* **${{report.question}}**\\n`);
      }}
      md.push('---');
      md.push('## I. PHÂN TÍCH ĐỊNH LƯỢNG VĨ MÔ (MACRO SCAN)');
      md.push(`* **Bản chất trải bài:** **${{report.fateVerdict}}**`);
      md.push(`* **Tỷ lệ Ẩn chính (Major Arcana):** \\`${{report.majorRatio}}\\``);
      md.push(`* **Trạng thái chiều bài:** \\`${{report.orientationStat}}\\``);
      md.push(`* **Nguyên tố thống trị:** **${{report.dominantElement}}**`);
      md.push(`* **Nguyên tố thiếu hụt cần bổ sung:** ${{report.missingElementsDesc}}`);
      md.push(`* **Đánh giá dòng chảy tổng thể:** **${{report.flowVerdict}}**\\n`);

      if (report.pairAnalysis && report.pairAnalysis.length > 0) {{
        md.push('### Ma trận tương tác nguyên tố giữa các lá bài (Elemental Dignities):');
        report.pairAnalysis.forEach(p => {{
          const sign = p.score > 0 ? `+${{p.score}}` : `${{p.score}}`;
          md.push(`- **${{p.fromCard}}** -> **${{p.toCard}}** \\`[${{p.pair}}]\\` (${{p.relation}} ${{sign}}): ${{p.explanation}}`);
        }});
        md.push('');
      }}

      md.push('---');
      md.push('## II. CHI TIẾT LUẬN GIẢI TỪNG VỊ TRÍ');
      report.cardReadings.forEach(c => {{
        md.push(`### ${{c.position}}: ${{c.cardName}} — *[${{c.orientation}}]*`);
        md.push(`- **Phân loại & Nguyên tố:** ${{c.arcana}} Arcana | Nguyên tố ${{c.element}}`);
        md.push(`- **Từ khóa trọng tâm:** \\`${{c.keywords}}\\``);
        md.push(`- **Luận giải chi tiết:** ${{c.detailMeaning}}`);
        md.push(`- **Lời khuyên riêng:** *${{c.advice}}*\\n`);
      }});

      md.push('---');
      md.push('## III. TỔNG KẾT VÀ LỜI KHUYÊN HÀNH ĐỘNG (ACTIONABLE PRESCRIPTION)');
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

# Đồng bộ sang mobile_app
mobile_engine = r"c:\Books\Neta Light\mobile_app\assets\www\engines\tarot_engine.js"
os.makedirs(os.path.dirname(mobile_engine), exist_ok=True)
with open(mobile_engine, "w", encoding="utf-8") as f:
    f.write(js_content)
print(f"[OK] Synced {mobile_engine}")
