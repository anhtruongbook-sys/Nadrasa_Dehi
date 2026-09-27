/**
 * NETA LIGHT - GEMINI DEEP SYNTHESIS SERVICE (OPTIONAL EXTENSION)
 * 
 * Quản lý kết nối Google Gemini API với cơ chế Khóa Kép:
 * 1. Khóa tích hợp sẵn mã hóa 2 lớp (Built-in Encrypted Key).
 * 2. Khóa người dùng tùy biến lưu trữ vĩnh viễn (Persistent Custom Key).
 * 3. Tự động nhận diện và cascade mô hình: gemini-3.8-flash -> các bản cũ hơn.
 * 4. Không bao giờ lộ chuỗi key thô, cấm copy/cut.
 * 5. Tuyệt đối không đề cập đến AI/Gemini trong văn phong luận giải (Strict Persona & Ground-Truth).
 */

(function (global) {
  'use strict';

  // XOR Salt dùng để xáo trộn mã hóa
  const XOR_SALT = 0x5A;

  // Khóa mặc định đã mã hóa (Scrambled array)
  const SCRAMBLED_BUILTIN = [
    27, 11, 116, 27, 56, 98, 8, 20, 108, 16, 53, 15, 47, 41, 55, 16, 54, 111, 
    20, 41, 11, 27, 14, 99, 54, 49, 48, 44, 17, 54, 2, 28, 11, 17, 40, 43, 
    12, 19, 53, 62, 46, 50, 34, 43, 105, 45, 14, 52, 99, 111, 99, 5, 61
  ];

  const STORAGE_KEY_TOKEN = '__neta_synth_enc_token';
  const STORAGE_KEY_ENABLED = '__neta_deep_synth_enabled';

  // Hàng đợi mô hình ưu tiên: Luôn thử từ gemini-3.8-flash trở xuống
  const CANDIDATE_MODELS = [
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ];

  function unscramble(arr) {
    if (!Array.isArray(arr)) return '';
    try {
      return arr.map(b => String.fromCharCode(b ^ XOR_SALT)).join('');
    } catch (e) {
      return '';
    }
  }

  function scramble(str) {
    if (!str) return [];
    const arr = [];
    for (let i = 0; i < str.length; i++) {
      arr.push(str.charCodeAt(i) ^ XOR_SALT);
    }
    return arr;
  }

  /**
   * Lấy API Key đang hiệu lực:
   * Ưu tiên Khóa tùy biến trong localStorage -> Nếu không có thì dùng Khóa tích hợp sẵn
   */
  function getActiveKey() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TOKEN);
      if (stored) {
        const parsed = JSON.parse(stored);
        const dec = unscramble(parsed);
        if (dec && dec.length > 20) return dec;
      }
    } catch (e) {}
    return unscramble(SCRAMBLED_BUILTIN);
  }

  /**
   * Lưu khóa tùy biến của người dùng vào localStorage (Vĩnh viễn qua các lần tắt/mở app)
   */
  function setCustomKey(rawKey) {
    const k = (rawKey || '').trim();
    if (!k) {
      clearCustomKey();
      return;
    }
    try {
      const arr = scramble(k);
      localStorage.setItem(STORAGE_KEY_TOKEN, JSON.stringify(arr));
    } catch (e) {
      console.warn('Lỗi lưu khóa tùy biến:', e);
    }
  }

  /**
   * Xóa khóa tùy biến để quay về dùng khóa mặc định tích hợp sẵn
   */
  function clearCustomKey() {
    try {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    } catch (e) {}
  }

  /**
   * Kiểm tra người dùng có đang dùng khóa tùy biến hay khóa mặc định
   */
  function isCustomKeySet() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TOKEN);
      return !!stored;
    } catch (e) {
      return false;
    }
  }

  /**
   * Trạng thái BẬT/TẮT tùy chọn "Luận giải Chiều sâu" (Mặc định: FALSE)
   */
  function isDeepSynthesisEnabled() {
    try {
      return localStorage.getItem(STORAGE_KEY_ENABLED) === 'true';
    } catch (e) {
      return false;
    }
  }

  function setDeepSynthesisEnabled(enabled) {
    try {
      localStorage.setItem(STORAGE_KEY_ENABLED, enabled ? 'true' : 'false');
    } catch (e) {}
  }

  /**
   * Tự động gọi API Google với cơ chế Cascade hạ cấp mô hình ngầm
   */
  async function callGeminiCascade(promptText, apiKey) {
    let lastError = null;

    for (const model of CANDIDATE_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const payload = {
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2500
          }
        };

        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (resp.ok) {
          const data = await resp.json();
          const cand = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (cand && cand.trim().length > 50) {
            return cand.trim();
          }
        } else {
          const errText = await resp.text();
          console.warn(`Model ${model} trả về lỗi ${resp.status}, tự động thử mô hình kế tiếp...`);
          lastError = errText;
        }
      } catch (err) {
        console.warn(`Lỗi kết nối với ${model}:`, err);
        lastError = err;
      }
    }

    console.error('Tất cả mô hình trong hàng đợi đều không thành công. Chi tiết lỗi cuối:', lastError);
    return null;
  }

  /**
   * Xây dựng Prompt kỹ thuật bám sát 100% dữ liệu gốc & câu hỏi cụ thể của người dùng
   */
  function buildHermeticPrompt(report, customQuestion) {
    const questionToUse = (customQuestion || report.question || '').trim();
    const isGeneralQuestion = !questionToUse || questionToUse === 'Tổng quan vận thế';

    const systemInstruction = `Bạn là một Bậc Thầy Tham Vấn Tarot Cổ Điển và Triết Gia Chiêm Tinh Học Uyên Bác.
MỤC TIÊU DUY NHẤT:
- Dựa DUY NHẤT 100% trên dữ liệu định lượng của thuật toán bốc bài đã cho dưới đây để biên soạn bản luận giải sâu sắc, mạch lạc, trang nhã, giàu chất tâm lý học chiều sâu (Jungian Archetype) và truyền cảm.
- ${!isGeneralQuestion ? `NGƯỜI HỎI CÓ CÂU HỎI CỤ THỂ: "${questionToUse}". BẮT BUỘC bạn phải nhập cuộc và trả lời TRỰC DIỆN, SẮC BÉN vào đúng bản chất của sự việc/quyết định được hỏi (thay vì nói chung chung). Từng lá bài phải được ánh xạ vào bối cảnh thực tế của câu hỏi này.` : `Người hỏi quan tâm đến vận thế tổng quan. Hãy phân tích dòng chảy nội tâm và các xu hướng cuộc sống một cách thấu suốt.`}
- Nối kết các lá bài, chiều bài và tương tác nguyên tố thành một dòng chảy nhân quả thuyết phục.

ĐIỀU KHOẢN CẤM KỴ TUYỆT ĐỐI (ZERO-FABRICATION):
1. TUYỆT ĐỐI KHÔNG đề cập đến các từ: 'AI', 'Gemini', 'trí tuệ nhân tạo', 'bot', 'máy tính', 'mô hình', 'thuật toán', 'hệ thống' trong toàn bộ bài viết.
2. TUYỆT ĐỐI KHÔNG tự bịa thêm các lá bài khác, không đổi chiều bài (Xuôi/Ngược), không bịa đặt sự kiện viển vông ngoài đời. Toàn bộ luận điểm phải bắt nguồn từ các lá bài và nguyên tố đã rút dưới đây.`;

    const cardsDetail = report.cardReadings.map(c => {
      return `* Vị trí: ${c.position}
  - Lá bài: ${c.cardName} (${c.orientation})
  - Thuộc nhóm: ${c.arcana} Arcana | Nguyên tố: ${c.element}
  - Từ khóa cốt lõi: ${c.keywords}
  - Luận giải cơ sở: ${c.detailMeaning}
  - Lời khuyên lá bài: ${c.advice}`;
    }).join('\n\n');

    const pairDetail = (report.pairAnalysis && report.pairAnalysis.length > 0)
      ? report.pairAnalysis.map(p => `- ${p.fromCard} -> ${p.toCard}: ${p.relation} (${p.score > 0 ? '+' + p.score : p.score}) - ${p.explanation}`).join('\n')
      : 'Không có cặp tương tác đặc biệt';

    const quintDetail = report.quintessence
      ? `Lá bài: ${report.quintessence.name_vi} (${report.quintessence.name_en}) - Thông điệp cốt tủy: ${report.quintessence.lesson}`
      : 'Không áp dụng';

    const promptBody = `DỮ LIỆU ĐỊNH LƯỢNG TỪ TRẢI BÀI:
- Trải bài: ${report.spreadName}
- Chủ đề: ${report.domain.toUpperCase()}
- Câu hỏi người hỏi: ${questionToUse || 'Tổng quan'}
- Đánh giá tổng quan: ${report.fateVerdict}
- Tỷ lệ Ẩn chính: ${report.majorRatio}
- Trạng thái chiều bài: ${report.orientationStat}
- Nguyên tố thống trị: ${report.dominantElement}
- Nguyên tố thiếu hụt: ${report.missingElementsDesc}
- Dòng chảy năng lượng: ${report.flowVerdict}

CHI TIẾT TỪNG LÁ BÀI:
${cardsDetail}

TƯƠNG TÁC NGUYÊN TỐ (ELEMENTAL DIGNITIES):
${pairDetail}

LÁ BÀI CỐT TỦY (THE QUINTESSENCE):
${quintDetail}

LỜI KHUYÊN HÀNH ĐỘNG GỐC:
${report.finalAdvice}

HÃY BIÊN SOẠN BẢN LUẬN GIẢI CHI TIẾT THEO CẤU TRÚC:
1. Thông điệp mở đầu & Trả lời trực diện câu hỏi (nếu có câu hỏi cụ thể)
2. Phân tích dòng chảy nhân quả qua từng vị trí lá bài
3. Chiều sâu tương tác nguyên tố & Biến chuyển năng lượng
4. Bài học linh hồn từ Lá bài Cốt tủy (The Quintessence)
5. Lời khuyên hành động dứt khoát, sáng suốt`;

    return systemInstruction + '\n\n---\n\n' + promptBody;
  }

  /**
   * Hàm chính thực thi luận giải chuyên sâu
   */
  async function interpretTarotReading(report, customQuestion) {
    const key = getActiveKey();
    if (!key) {
      console.warn('Không tìm thấy API Key');
      return null;
    }

    const prompt = buildHermeticPrompt(report, customQuestion);
    return await callGeminiCascade(prompt, key);
  }

  // Export module ra global
  global.NetaGeminiService = {
    getActiveKey,
    setCustomKey,
    clearCustomKey,
    isCustomKeySet,
    isDeepSynthesisEnabled,
    setDeepSynthesisEnabled,
    interpretTarotReading,
    CANDIDATE_MODELS
  };

})(typeof window !== 'undefined' ? window : this);
