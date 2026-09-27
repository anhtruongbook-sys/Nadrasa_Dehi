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

  // XOR Salt dùng để xáo trộn mã hóa lưu cục bộ
  const XOR_SALT = 0x5A;

  const STORAGE_KEY_TOKEN = '__neta_synth_enc_token';
  const STORAGE_KEY_ENABLED = '__neta_deep_synth_enabled';

  // Hàng đợi mô hình ưu tiên: Mô hình mới nhất và tốt nhất khả dụng -> tự động chuyển xuống mô hình cũ hơn
  const CANDIDATE_MODELS = [
    'gemini-3.8-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-flash-latest'
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
   * Lấy API Key đang hiệu lực do người dùng nhập và lưu trữ cục bộ trên thiết bị
   * Không chứa bất kỳ khóa mặc định nào trong mã nguồn
   */
  function getActiveKey() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TOKEN);
      if (stored) {
        const parsed = JSON.parse(stored);
        const dec = unscramble(parsed);
        if (dec && dec.length > 15) return dec;
      }
    } catch (e) {}
    return '';
  }

  /**
   * Kiểm tra người dùng đã cài đặt API Key hay chưa
   */
  function hasActiveKey() {
    return !!getActiveKey();
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
   * Xóa khóa tùy biến khỏi thiết bị
   */
  function clearCustomKey() {
    try {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      setDeepSynthesisEnabled(false);
    } catch (e) {}
  }

  /**
   * Kiểm tra người dùng có đang dùng khóa tùy biến hay không
   */
  function isCustomKeySet() {
    return hasActiveKey();
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
   * Tự động gọi API Google với cơ chế Cascade hạ cấp mô hình ngầm & bắt lỗi chi tiết
   */
  async function callGeminiCascade(promptText, apiKey) {
    let lastErrorReason = null;
    let hadAuthError = false;

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

        // Timeout 6s per candidate to keep UI fast and responsive
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (resp.ok) {
          const data = await resp.json();
          const cand = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (cand && cand.trim().length > 50) {
            return { text: cand.trim(), error: null };
          }
        } else {
          const status = resp.status;
          if (status === 401 || status === 403) {
            hadAuthError = true;
            lastErrorReason = 'Khóa API không hợp lệ hoặc đã bị vô hiệu hóa (Mã lỗi 401). Vui lòng kiểm tra lại khóa tại Google AI Studio.';
            break; // Stop cascade immediately on invalid key
          } else if (status === 429) {
            lastErrorReason = 'Hệ thống Google đang quá tải hạn mức miễn phí (Mã lỗi 429). Vui lòng thử lại sau vài giây.';
          } else {
            lastErrorReason = `Mô hình ${model} trả về lỗi ${status}. Đang chuyển tiếp mô hình...`;
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.warn(`Model ${model} timeout sau 6s, chuyển tiếp sang mô hình tiếp theo...`);
        } else {
          console.warn(`Lỗi kết nối với ${model}:`, err);
        }
        lastErrorReason = 'Không thể kết nối đến máy chủ Google. Vui lòng kiểm tra mạng Internet.';
      }
    }

    if (hadAuthError) {
      return { text: null, error: lastErrorReason };
    }

    return {
      text: null,
      error: lastErrorReason || 'Không thể kết nối đến máy chủ Google. Vui lòng kiểm tra kết nối mạng và thử lại.'
    };
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

QUY CHUẨN ĐỊNH DẠNG VĂN BẢN (BẮT BUỘC):
1. Định dạng văn bản bằng Markdown chuẩn:
   - Dùng '## ' cho 5 đề mục chính (1. Thông điệp mở đầu, 2. Phân tích dòng chảy nhân quả...).
   - Dùng '### ' cho tiêu đề từng lá bài ở mục 2.
   - TUYỆT ĐỐI KHÔNG dùng '#### ' hay nhiều hơn 3 dấu thăng #.
   - TUYỆT ĐỐI KHÔNG dùng khối mã code block (dấu \`\`\`), không vẽ sơ đồ ASCII dạng '| | |' hay '--->'. Hãy diễn giải dòng chảy bằng câu văn xuôi mượt mà, tự nhiên.
   - Dùng gạch đầu dòng '- ' cho các ý phân tích cụ thể và lời khuyên hành động.

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
## 1. Thông điệp mở đầu & Trực diện câu hỏi
## 2. Phân tích dòng chảy nhân quả qua từng lá bài
## 3. Chiều sâu tương tác nguyên tố & Năng lượng tâm thức
## 4. Bài học linh hồn từ Lá bài Cốt tủy
## 5. Lời khuyên hành động sáng suốt`;

    return systemInstruction + '\n\n---\n\n' + promptBody;
  }

  /**
   * Hàm chính thực thi luận giải chuyên sâu
   */
  async function interpretTarotReading(report, customQuestion) {
    const key = getActiveKey();
    if (!key) {
      return { text: null, error: 'Chưa cài đặt Khóa API cá nhân. Hãy mở hộp thoại bí mật để cài đặt.' };
    }

    const prompt = buildHermeticPrompt(report, customQuestion);
    return await callGeminiCascade(prompt, key);
  }

  // Export module ra global
  global.NetaGeminiService = {
    getActiveKey,
    hasActiveKey,
    setCustomKey,
    clearCustomKey,
    isCustomKeySet,
    isDeepSynthesisEnabled,
    setDeepSynthesisEnabled,
    interpretTarotReading,
    CANDIDATE_MODELS
  };

})(typeof window !== 'undefined' ? window : this);
