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
  async function callGeminiCascade(promptText, apiKey, options = {}) {
    let lastErrorReason = null;
    let hadAuthError = false;

    // Tìm mô hình tốt nhất khả dụng trước khi luận đoán
    const candidateModels = await discoverAvailableModels(apiKey);

    const temperature = options.temperature !== undefined ? options.temperature : 0.7;
    const maxOutputTokens = options.maxOutputTokens || 4096;
    const timeoutMs = options.timeoutMs || 25000;

    const payload = {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: maxOutputTokens
      }
    };

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const headers = {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        };

        // Timeout động (mặc định 25s cho bài phân tích dài, hoặc theo options)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

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
   * Xây dựng Prompt Biên Tập & Soạn Lại Văn Phong Trải Bài Tarot Từ Thuật Toán Offline
   * AI TUYỆT ĐỐI KHÔNG TỰ LUẬN GIẢI MÀ CHỈ ĐÓNG VAI TRÒ BIÊN TẬP VIÊN TRAU CHUỐT NỘI DUNG THUẬT TOÁN
   */
  function buildHermeticPrompt(report, customQuestion) {
    const questionToUse = (customQuestion || report.question || '').trim();

    // Lấy toàn văn bản luận giải thuật toán offline
    let offlineReportText = '';
    if (global.NetaTarotEngine && typeof global.NetaTarotEngine.formatMarkdownReport === 'function') {
      offlineReportText = global.NetaTarotEngine.formatMarkdownReport(report);
    } else {
      const lines = [];
      lines.push(`Trải bài: ${report.spreadName} | Chủ đề: ${report.domain.toUpperCase()}`);
      if (questionToUse) lines.push(`Câu hỏi người hỏi: "${questionToUse}"`);
      if (report.quintessence) {
        lines.push(`Lá bài cốt tủy: ${report.quintessence.name_vi} (${report.quintessence.name_en}) - Bài học linh hồn: ${report.quintessence.lesson}`);
      }
      lines.push(`Tổng luận mạch truyện nhân quả: ${report.synthesizedStory}`);
      lines.push(`Bản chất trải bài: ${report.fateVerdict} | Dòng chảy năng lượng: ${report.flowVerdict}`);
      (report.cardReadings || []).forEach(c => {
        lines.push(`- Vị trí ${c.position}: Lá ${c.cardName} (${c.orientation}) - Từ khóa: ${c.keywords} - Luận giải: ${c.detailMeaning} - Lời khuyên: ${c.advice}`);
      });
      if (report.pairAnalysis && report.pairAnalysis.length > 0) {
        lines.push('Tương tác nguyên tố:');
        report.pairAnalysis.forEach(p => lines.push(`  * ${p.fromCard} -> ${p.toCard}: ${p.relation} - ${p.explanation}`));
      }
      lines.push(`Lời khuyên chiến lược: ${report.finalAdvice}`);
      offlineReportText = lines.join('\n');
    }

    const systemInstruction = `BẠN LÀ MỘT BẬC THẦY TỔNG BIÊN TẬP VĂN BẢN TAROT & TÂM LÝ HỌC CHIỀU SÂU (JUNGIAN ARCHETYPE) UYÊN BÁC.
DƯỚI ĐÂY LÀ "TOÀN VĂN BẢN LUẬN GIẢI TRẢI BÀI TAROT" ĐÃ ĐƯỢC THUẬT TOÁN XÁC ĐỊNH OFFLINE TÍNH TOÁN VÀ XUẤT RA CHÍNH XÁC 100%.

NHIỆM VỤ DUY NHẤT CỦA BẠN:
SOẠN LẠI, BIÊN TẬP LẠI VÀ TRAU CHUỐT TOÀN BỘ NỘI DUNG BẢN LUẬN GIẢI THUẬT TOÁN OFFLINE DƯỚI ĐÂY THÀNH MỘT BÀI THAM VẤN TÂM LÝ HOÀN CHỈNH, MẠCH LẠC, TRANG NHÃ, SÂU SẮC, GIÀU CHẤT VĂN HỌC VÀ TRUYỀN CẢM HỨNG (ĐỘ DÀI KHOẢNG 1.200 - 1.800 TỪ).

[CÁC NGUYÊN TẮC BẤT BIẾN - ZERO-FABRICATION EDITORIAL RULES]:
1. TUYỆT ĐỐI KHÔNG TỰ LUẬN GIẢI: Bạn KHÔNG được tự ý sáng tác, suy đoán hay bịa thêm bất kỳ lá bài nào khác ngoài trải bài thuật toán đã cho.
2. TRUNG THỰC 100% VỚI BẢN GỐC THUẬT TOÁN:
   - Giữ nguyên toàn bộ các lá bài, vị trí và chiều bài (Xuôi/Ngược).
   - Bám sát ý nghĩa chi tiết, từ khóa, cốt tủy (The Quintessence) và mạch truyện biện chứng mà thuật toán đã xâu chuỗi.
   - Bám sát lời khuyên hành động cụ thể từ bản gốc thuật toán.
   - ${questionToUse ? `ĐẶC BIỆT: Người hỏi có câu hỏi cụ thể: "${questionToUse}". Hãy ánh xạ mọi luận điểm của thuật toán vào bối cảnh thực tế của câu hỏi này một cách trực diện và thấu suốt.` : 'Phân tích dòng chảy cuộc sống và bài học nội tâm một cách thấu suốt.'}
3. KỶ LUẬT ĐỊNH DẠNG VĂN BẢN (ANTI-CLUTTER):
   - TUYỆT ĐỐI KHÔNG DÙNG CODE BLOCK (dấu \`\`\`), KHÔNG VẼ SƠ ĐỒ ASCII DẠNG '| | |' hay '--->'. Hãy diễn giải dòng chảy bằng văn xuôi mượt mà, tự nhiên.
   - TUYỆT ĐỐI KHÔNG DÙNG CÁC TỪ: 'AI', 'Gemini', 'trí tuệ nhân tạo', 'bot', 'máy tính', 'thuật toán', 'mô hình'.
   - Dùng đề mục Markdown ## cho các phần chính và ### cho từng lá bài.

CẤU TRÚC BÀI BIÊN TẬP BẮT BUỘC:
## I. THÔNG ĐIỆP CỐT TỦY & TỔNG QUAN NĂNG LƯỢNG
(Biên tập lại từ phần Cốt tủy & Đánh giá vĩ mô của thuật toán, trực diện vào câu hỏi đương số.)

## II. MẠCH TRUYỆN NHÂN QUẢ & PHÂN TÍCH CHI TIẾT TỪNG LÁ BÀI
(Biên tập lại mạch truyện 3 thì và phân tích từng lá bài theo vị trí từ bản gốc thuật toán.)

## III. CHIỀU SÂU TƯƠNG TÁC NGUYÊN TỐ & NĂNG LƯỢNG NỘI TÂM
(Biên tập lại ma trận tương tác nguyên tố Golden Dawn từ bản gốc thuật toán.)

## IV. LỜI KHUYÊN HÀNH ĐỘNG CHIẾN LƯỢC & BÀI HỌC CHUYỂN HÓA
(Biên tập lại định hướng hành động cụ thể và bài học chuyển hóa thực tiễn từ thuật toán.)

[TOÀN VĂN BẢN LUẬN GIẢI THUẬT TOÁN OFFLINE CẦN BIÊN TẬP]:
${offlineReportText}`;

    return systemInstruction;
  }

  /**
   * Hàm chính thực thi biên tập lại trải bài Tarot bằng AI
   */
  async function interpretTarotReading(report, customQuestion) {
    const key = getActiveKey();
    if (!key) {
      return { text: null, error: 'Chưa cài đặt Khóa API cá nhân. Hãy mở hộp thoại bí mật để cài đặt.' };
    }

    const prompt = buildHermeticPrompt(report, customQuestion);
    const res = await callGeminiCascade(prompt, key, {
      temperature: 0.5,
      maxOutputTokens: 4096,
      timeoutMs: 45000
    });

    if (res && res.text) {
      // Làm sạch triệt để code blocks và đường kẻ thô nếu AI lỡ sinh
      let cleaned = res.text.trim();
      cleaned = cleaned.replace(/```(?:text|markdown)?[^\n]*\n?([\s\S]*?)```/g, '$1');
      cleaned = cleaned.replace(/```[a-zA-Z]*/g, '').replace(/```/g, '');
      cleaned = cleaned.replace(/^[=\-~_]{3,}\s*$/gm, '');
      res.text = cleaned;
    }
    return res;
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

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
