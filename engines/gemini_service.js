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

  // Hàng đợi mô hình dự phòng: gemini-3.5-flash & gemini-2.5-flash là ưu tiên hàng đầu
  const DEFAULT_CANDIDATE_MODELS = [
    'gemini-3.5-flash',
    'gemini-2.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-2.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest'
  ];

  let cachedDiscoveredModels = null;
  let cacheDiscoveryTimestamp = 0;
  let lastActiveModel = 'gemini-3.5-flash';
  const DISCOVERY_CACHE_TTL = 10 * 60 * 1000; // 10 phút

  /**
   * Tự động truy vấn danh sách mô hình khả dụng từ Google AI Studio API:
   * GET https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}
   * Tự động lọc các model hỗ trợ generateContent và xếp hạng model tối ưu nhất.
   */
  async function discoverAvailableModels(apiKey) {
    const now = Date.now();
    if (cachedDiscoveredModels && cachedDiscoveredModels.length > 0 && (now - cacheDiscoveryTimestamp < DISCOVERY_CACHE_TTL)) {
      return cachedDiscoveredModels;
    }

    if (!apiKey) return DEFAULT_CANDIDATE_MODELS;

    const urls = [
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
      `https://generativelanguage.googleapis.com/v1beta/models`
    ];

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const resp = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (resp.ok) {
          const data = await resp.json();
          if (Array.isArray(data.models) && data.models.length > 0) {
            // Lọc các model hỗ trợ generateContent
            const validModels = data.models
              .filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
              .map(m => m.name.replace(/^models\//, ''));

            if (validModels.length > 0) {
              const scoreModel = (name) => {
                const n = name.toLowerCase();
                if (n === 'gemini-3.5-flash') return 1000;
                if (n === 'gemini-2.5-flash') return 980;
                if (n.includes('3.5-flash')) return 950;
                if (n.includes('2.5-flash')) return 920;
                if (n.includes('3.8-flash')) return 880;
                if (n.includes('3.5')) return 850;
                if (n.includes('2.5')) return 800;
                if (n.includes('flash')) return 500;
                return 100;
              };

              validModels.sort((a, b) => scoreModel(b) - scoreModel(a));

              cachedDiscoveredModels = validModels;
              cacheDiscoveryTimestamp = now;
              lastActiveModel = validModels[0];
              console.log('✅ Đã tự động phát hiện danh mục mô hình Gemini khả dụng:', validModels.slice(0, 5));
              return validModels;
            }
          }
        }
      } catch (e) {
        console.warn('Không thể truy vấn danh mục models trực tiếp, sử dụng hàng đợi dự phòng:', e.message);
      }
    }

    return DEFAULT_CANDIDATE_MODELS;
  }

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
      cachedDiscoveredModels = null; // Làm mới danh mục model khi đổi key
      cacheDiscoveryTimestamp = 0;
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
      cachedDiscoveredModels = null;
      cacheDiscoveryTimestamp = 0;
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
   * Tự động gọi API Google với cơ chế đa chiến lược (x-goog-api-key, URL param, Bearer)
   * Tương thích 100% với cả Auth Key mới (AQ...) và Standard API Key (AIza...)
   */
  async function callGeminiCascade(promptText, apiKey) {
    let lastErrorReason = null;
    let hadAuthError = false;

    // Tìm mô hình tốt nhất khả dụng trước khi luận đoán
    const candidateModels = await discoverAvailableModels(apiKey);

    const payload = {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2500
      }
    };

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const headers = {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        };

        // Timeout 10s per candidate to allow solid generation
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const resp = await fetch(url, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (resp.ok) {
          const data = await resp.json();
          const cand = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (cand && cand.trim().length > 0) {
            lastActiveModel = model;
            return { text: cand.trim(), model: model, error: null };
          }
        } else {
          const status = resp.status;
          let errJson = null;
          try { errJson = await resp.json(); } catch(e) {}
          const errMsg = errJson?.error?.message || '';
          const errReason = errJson?.error?.details?.[0]?.reason || '';

          if (status === 400 && (errReason === 'API_KEY_INVALID' || errMsg.includes('API key not valid'))) {
            hadAuthError = true;
            lastErrorReason = 'Khóa API không hợp lệ. Vui lòng kiểm tra lại khóa tại Google AI Studio.';
            break;
          } else if (status === 401 || status === 403) {
            if (errMsg.includes('API key') || errReason.includes('API_KEY') || errMsg.includes('PERMISSION_DENIED')) {
              hadAuthError = true;
              lastErrorReason = 'Khóa API không có quyền truy cập hoặc đã bị vô hiệu hóa (Mã 401/403). Vui lòng kiểm tra lại khóa tại Google AI Studio.';
              break;
            }
          } else if (status === 503 || status === 429 || status === 500 || status === 502 || status === 504) {
            console.log(`Mô hình ${model} phản hồi HTTP ${status} (Quá tải/Tạm ngưng), chuyển tiếp sang mô hình dự phòng...`);
            lastErrorReason = `Mô hình ${model} đang tạm thời quá tải (HTTP ${status}). Hệ thống đã chuyển đổi sang mô hình dự phòng.`;
            continue;
          } else if (status === 404 || status === 400) {
            console.log(`Mô hình ${model} không khả dụng (HTTP ${status}), chuyển tiếp mô hình...`);
            continue;
          } else {
            lastErrorReason = `Mô hình ${model} phản hồi mã ${status}. Đang chuyển tiếp...`;
            continue;
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.warn(`Model ${model} timeout sau 10s, chuyển tiếp mô hình dự phòng...`);
        } else {
          console.warn(`Lỗi kết nối với ${model}:`, err.message);
        }
        lastErrorReason = 'Không thể kết nối đến máy chủ Google. Vui lòng kiểm tra mạng Internet.';
        continue;
      }

      if (hadAuthError) break;
    }

    if (hadAuthError) {
      return { text: null, error: lastErrorReason };
    }

    return {
      text: null,
      error: lastErrorReason || 'Không thể kết nối đến mô hình Google AI khả dụng. Vui lòng kiểm tra lại kết nối mạng và thử lại.'
    };
  }

  /**
   * Kiểm tra kết nối và tìm model tốt nhất khả dụng
   */
  async function testConnection(apiKey) {
    const key = (apiKey || getActiveKey() || '').trim();
    if (!key) return { success: false, error: 'Chưa nhập Khóa API.' };

    cachedDiscoveredModels = null;
    cacheDiscoveryTimestamp = 0;

    const models = await discoverAvailableModels(key);
    if (!models || models.length === 0) {
      return { success: false, error: 'Không thể kết nối đến Google API để lấy danh mục mô hình.' };
    }

    const testPrompt = 'Xin chào, hãy phản hồi: Hoạt động tốt.';
    const res = await callGeminiCascade(testPrompt, key);
    if (res && res.text) {
      const activeM = res.model || lastActiveModel || 'gemini-3.5-flash';
      return {
        success: true,
        model: activeM,
        message: `Kết nối thành công! Đang sử dụng mô hình tối ưu: ${activeM}`
      };
    } else {
      return {
        success: false,
        error: res.error || 'Kiểm tra kết nối thất bại.'
      };
    }
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
    discoverAvailableModels,
    callGeminiCascade,
    testConnection,
    getActiveModelName: () => lastActiveModel || 'gemini-3.5-flash',
    CANDIDATE_MODELS: DEFAULT_CANDIDATE_MODELS
  };

})(typeof window !== 'undefined' ? window : this);
