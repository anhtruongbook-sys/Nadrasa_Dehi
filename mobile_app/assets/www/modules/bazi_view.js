/**
 * Module: Bazi View (Tứ Trụ - Bát Tự Manh Phái Mệnh Lý)
 * Neta Light Framework
 * Khôi phục 100% Bàn Lá Số Gốc & Hoàn Thiện Giai Đoạn 3: Dual-Subnav & 7 Card Dashboard Tương Tác
 */

(function (global) {
  'use strict';

  let currentBaziDate = new Date();
  let currentIsMale = true;
  let currentStartAge = null; // null để tự động tính theo giải thuật thiên văn tiết khí
  let isLunarMode = false;
  let selectedLuckStep = 1;
  let currentChartData = null;

  // Giai đoạn 2 & 3: View Mode & Subnav States
  let currentViewMode = 'chart'; // 'chart' = Bàn Lá Số Trực Quan; 'analysis' = Luận Giải Chuyên Sâu
  let currentAnalysisSubTab = 'dashboard'; // 'dashboard' = 7 Card Dashboard; 'report' = Toàn Văn Báo Cáo
  let currentTopicFilter = 'ALL'; // 'ALL', 'career', 'wealth', 'marriage', 'health', 'relatives', 'fengshui'
  let currentAnalysisCache = null;
  let isAiPolishing = false;
  let aiPolishedText = null;
  let aiErrorMessage = null;
  let currentReportMode = 'standard'; // 'standard' | 'ai'

  function resetBaziAiState() {
    aiPolishedText = null;
    isAiPolishing = false;
    aiErrorMessage = null;
    currentReportMode = 'standard';
    currentAnalysisCache = null;
  }

  function initBaziView() {
    const container = document.getElementById('view-bazi');
    if (!container) return;
    renderBazi();
  }

  function setDateAndRender(date, isMale = currentIsMale) {
    currentBaziDate = new Date(date);
    currentIsMale = isMale;
    resetBaziAiState();
    currentViewMode = 'chart';
    renderBazi();
  }

  function computeBaziChart() {
    if (!global.NetaBaziEngine) {
      console.error("NetaBaziEngine not found!");
      return null;
    }
    try {
      const chart = global.NetaBaziEngine.buildBaziChart({
        solarDate: currentBaziDate,
        isMale: currentIsMale,
        startAge: currentStartAge
      });
      currentChartData = chart;
      return chart;
    } catch (e) {
      console.error("Error computing Bazi chart:", e);
      return null;
    }
  }

  function getOrRunBaziAnalysis(chart, targetYear = 2026) {
    if (currentAnalysisCache && currentAnalysisCache.chart === chart && currentAnalysisCache.targetYear === targetYear) {
      return currentAnalysisCache;
    }
    if (!global.NetaBaziInterpreter || !global.NetaBaziInterpreter.analyzeFromBaziChart) {
      console.error("NetaBaziInterpreter not available!");
      return null;
    }
    try {
      const analysis = global.NetaBaziInterpreter.analyzeFromBaziChart(chart, targetYear);
      currentAnalysisCache = {
        chart,
        targetYear,
        analysis,
        reportMarkdown: analysis.markdown_report
      };
      return currentAnalysisCache;
    } catch (e) {
      console.error("Error running Bazi analysis:", e);
      return null;
    }
  }

  function formatMarkdownInline(text) {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" class="bazi-report-toc-pill">$1</a>');
  }

  function renderMarkdownToHTML(str) {
    if (!str) return '';
    const lines = str.split('\n');
    let html = '';
    let inList = false;
    let inTable = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) {
        if (inList) { html += '</ul>'; inList = false; }
        if (inTable) { html += '</tbody></table></div>'; inTable = false; }
        continue;
      }

      if (line.startsWith('---') || line.startsWith('***')) {
        if (inList) { html += '</ul>'; inList = false; }
        if (inTable) { html += '</tbody></table></div>'; inTable = false; }
        html += '<hr class="bazi-report-hr">';
        continue;
      }

      if (line.startsWith('> ')) {
        if (inList) { html += '</ul>'; inList = false; }
        const quoteText = line.substring(2).trim();
        if (quoteText.startsWith('[!IMPORTANT]')) {
          html += '<div class="bazi-callout-box important"><strong>⚠️ Cảnh Báo Trọng Yếu:</strong> ' + formatMarkdownInline(quoteText.replace('[!IMPORTANT]', '').trim()) + '</div>';
        } else if (quoteText.startsWith('[!NOTE]')) {
          html += '<div class="bazi-callout-box note"><strong>📌 Lưu Ý:</strong> ' + formatMarkdownInline(quoteText.replace('[!NOTE]', '').trim()) + '</div>';
        } else {
          html += '<blockquote class="bazi-report-quote">' + formatMarkdownInline(quoteText) + '</blockquote>';
        }
        continue;
      }

      if (line.startsWith('|') && line.endsWith('|')) {
        if (inList) { html += '</ul>'; inList = false; }
        if (/^\|[\s\-:]+(\|[\s\-:]+)+\|$/.test(line)) {
          continue;
        }

        const cells = line.split('|').slice(1, -1).map(c => c.trim());
        if (!inTable) {
          inTable = true;
          html += '<div class="bazi-table-wrap"><table class="bazi-report-table"><thead><tr>';
          cells.forEach(cell => {
            html += `<th>${formatMarkdownInline(cell)}</th>`;
          });
          html += '</tr></thead><tbody>';
        } else {
          html += '<tr>';
          cells.forEach(cell => {
            html += `<td>${formatMarkdownInline(cell)}</td>`;
          });
          html += '</tr>';
        }
        continue;
      } else if (inTable) {
        html += '</tbody></table></div>';
        inTable = false;
      }

      if (line.startsWith('# ')) {
        if (inList) { html += '</ul>'; inList = false; }
        const text = line.substring(2).trim();
        html += `<h1 class="bazi-report-h1">${formatMarkdownInline(text)}</h1>`;
        continue;
      }
      if (line.startsWith('## ')) {
        if (inList) { html += '</ul>'; inList = false; }
        const text = line.substring(3).trim();
        const secId = 'sec-' + text.split('.')[0].trim().replace(/[^a-zA-Z0-9]/g, '');
        html += `<h2 class="bazi-report-h2" id="${secId}">${formatMarkdownInline(text)}</h2>`;
        continue;
      }
      if (line.startsWith('### ')) {
        if (inList) { html += '</ul>'; inList = false; }
        const text = line.substring(4).trim();
        html += `<h3 class="bazi-report-h3">${formatMarkdownInline(text)}</h3>`;
        continue;
      }
      if (line.startsWith('#### ')) {
        if (inList) { html += '</ul>'; inList = false; }
        const text = line.substring(5).trim();
        html += `<h4 class="bazi-report-h4">${formatMarkdownInline(text)}</h4>`;
        continue;
      }

      if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('+ ')) {
        if (!inList) { html += '<ul class="bazi-report-list">'; inList = true; }
        const itemText = line.substring(2).trim();
        html += `<li>${formatMarkdownInline(itemText)}</li>`;
        continue;
      }

      const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        if (!inList) { html += '<ul class="bazi-report-list">'; inList = true; }
        html += `<li><strong>${numMatch[1]}.</strong> ${formatMarkdownInline(numMatch[2])}</li>`;
        continue;
      }

      if (inList) html += '</ul>';
      html += `<p style="margin: 6px 0;">${formatMarkdownInline(line)}</p>`;
    }

    if (inList) html += '</ul>';
    if (inTable) html += '</tbody></table></div>';
    return html;
  }

  function downloadReportFile(content, filename) {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function showBaziToast(msg) {
    let toast = document.getElementById('bazi-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'bazi-toast';
      toast.style.cssText = 'position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.85); color: #f5b041; padding: 10px 20px; border-radius: 8px; border: 1px solid #d4af37; font-size: 0.85rem; font-weight: 700; z-index: 99999; box-shadow: 0 4px 15px rgba(0,0,0,0.5); transition: opacity 0.3s ease; pointer-events: none;';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(() => {
      toast.style.opacity = '0';
    }, 2800);
  }

  function triggerAiPolish(analysisObj) {
    if (!analysisObj || !analysisObj.reportMarkdown) return;
    const geminiService = global.NetaGeminiService;
    if (!geminiService) {
      aiErrorMessage = 'Dịch vụ AI chưa được khởi tạo. Vui lòng tải lại ứng dụng.';
      currentReportMode = 'ai';
      renderBazi();
      return;
    }

    const apiKey = (geminiService.getActiveKey && geminiService.getActiveKey()) || '';
    if (!apiKey) {
      aiErrorMessage = 'Chưa cài đặt Google Gemini API Key. Bạn có thể cài đặt khóa tại mục Cài Đặt hoặc trong Trải Bài Tarot để sử dụng chung cho toàn bộ ứng dụng.';
      currentReportMode = 'ai';
      renderBazi();
      return;
    }

    isAiPolishing = true;
    currentReportMode = 'ai';
    currentAnalysisSubTab = 'report';
    aiErrorMessage = null;
    renderBazi();

    const prompt = `Bạn là Tổng Biên Tập cao cấp chuyên ngành Bát Tự Tử Bình & Manh Phái học thuật.
Dưới đây là TOÀN VĂN BẢN LUẬN GIẢI BÁT TỰ ĐẦY ĐỦ (>650 dòng) do hệ thống thuật toán xác định tính toán độc lập.

NHIỆM VỤ BẮT BUỘC (ZERO-TRUNCATION & ZERO-FABRICATION):
1. Trau chuốt văn phong mượt mà, uyển chuyển, giàu tính triết lý nhân văn Đông phương và chuẩn mực học thuật.
2. TUYỆT ĐỐI KHÔNG ĐƯỢC TÓM TẮT, KHÔNG RÚT GỌN NỘI DUNG: Phải giữ lại đầy đủ toàn bộ 9 phần chính (từ Phần I đến Phần IX) với dung lượng và độ sâu chi tiết tương đương bản gốc (>500 dòng).
3. GIỮ NGUYÊN TOÀN BỘ CÁC BẢNG BIỂU DẠNG MARKDOWN (Tứ Trụ, Thần Sát, Cung Vị, Thập Thần, Trường Sinh...).
4. GIỮ NGUYÊN TOÀN BỘ 10 ĐẠI VẬN, CÁC MỐC BIẾN CỐ ĐỜI NGƯỜI VÀ 12 LƯU NGUYỆT NĂM KHẢO SÁT.
5. KHÔNG THAY ĐỔI CÁC SỐ LIỆU ĐỊNH LƯỢNG, ĐIỂM SỐ, DỤNG THẦN, HỶ THẦN, KỴ THẦN HOẶC KẾT LUẬN MỆNH LÝ.
6. KHÔNG DÙNG TỪ NGỮ QUẢNG CÁO, GIẬT GÂN, THỔI PHỒNG.

--- BẢN BÁO CÁO BÁT TỰ THUẬT TOÁN GỐC CẦN BIÊN TẬP ---
${analysisObj.reportMarkdown}
--- HẾT BẢN BÁO CÁO GỐC ---

Hãy xuất bản toàn văn bài luận giải đã được trau chuốt hoàn chỉnh ngay dưới đây:`;

    const sysInstruction = "Bạn là Tổng Biên Tập học thuật Bát Tự Tử Bình & Manh Phái cao cấp. Nhiệm vụ duy nhất của bạn là trau chuốt, biên tập và hoàn thiện văn phong từ bản luận giải offline 100% được cung cấp. TUYỆT ĐỐI NGHIÊM CẤM tóm tắt rút gọn, nghiêm cấm tự ý sáng tác thêm bớt dữ liệu ngoài bản gốc. Độ dài bài xuất bản phải tương đương bản gốc (>500 dòng).";

    const callAI = async () => {
      if (typeof geminiService.polishReport === 'function') {
        const res = await geminiService.polishReport(prompt, {
          temperature: 0.3,
          maxOutputTokens: 8192,
          timeoutMs: 90000,
          systemInstruction: sysInstruction
        });
        return typeof res === 'string' ? res : (res && res.text ? res.text : '');
      } else if (typeof geminiService.callGeminiCascade === 'function') {
        const res = await geminiService.callGeminiCascade(prompt, apiKey, {
          temperature: 0.3,
          maxOutputTokens: 8192,
          timeoutMs: 90000,
          systemInstruction: sysInstruction
        });
        if (res && res.text) {
          return res.text.replace(/```(?:text|markdown)?[^\n]*\n?([\s\S]*?)```/g, '$1').replace(/```/g, '').trim();
        } else if (res && res.error) {
          throw new Error(res.error);
        }
      }
      throw new Error('Dịch vụ Gemini AI chưa sẵn sàng trên trình duyệt.');
    };

    callAI()
      .then(res => {
        isAiPolishing = false;
        aiPolishedText = res;
        renderBazi();
      })
      .catch(err => {
        isAiPolishing = false;
        aiErrorMessage = 'Lỗi kết nối khi trau chuốt văn bản: ' + (err.message || err);
        renderBazi();
      });
  }

  // GIAI ĐOẠN 3: HÀM TẠO 7 CARD DASHBOARD TỔNG HỢP & BỘ LỌC TƯƠNG TÁC
  function renderDashboardHTML(analysisObj, chart) {
    if (!analysisObj || !analysisObj.analysis) return '<div class="annual-empty">Đang cập nhật bảng phân tích tổng hợp...</div>';

    const analysis = analysisObj.analysis;
    const quant = analysis.quantitative_data || {};
    const mangPai = analysis.mang_pai_data || {};
    const shenSha = analysis.shen_sha || [];
    const decisions = analysis.decisions || {};
    const targetYear = analysisObj.targetYear || 2026;
    const scores = quant.element_scores || { Kim: 0, Mộc: 0, Thủy: 0, Hỏa: 0, Thổ: 0 };
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0) || 100;
    const bodyStr = quant.body_strength || {};
    const gods = quant.gods_selection || {};

    const getWxClass = global.NetaBaziEngine.getWuXingColorClass;

    // Tính 12 Lưu Nguyệt cho Năm Khảo Sát
    const yGanIdx = ((targetYear - 4) % 10 + 10) % 10;
    const startGanIdx = ((yGanIdx % 5) * 2 + 2) % 10;
    const TIAN_GAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
    const MONTH_ZHIS = ['Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu'];
    const SOLAR_TERMS = [
      'Tiết Lập Xuân (Tháng 1)', 'Tiết Kinh Trập (Tháng 2)', 'Tiết Thanh Minh (Tháng 3)',
      'Tiết Lập Hạ (Tháng 4)', 'Tiết Mang Chủng (Tháng 5)', 'Tiết Tiểu Thử (Tháng 6)',
      'Tiết Lập Thu (Tháng 7)', 'Tiết Bạch Lộ (Tháng 8)', 'Tiết Hàn Lộ (Tháng 9)',
      'Tiết Lập Đông (Tháng 10)', 'Tiết Đại Tuyết (Tháng 11)', 'Tiết Tiểu Hàn (Tháng 12)'
    ];

    const monthlyList = [];
    for (let m = 0; m < 12; m++) {
      const g = TIAN_GAN[(startGanIdx + m) % 10];
      const z = MONTH_ZHIS[m];
      const cc = `${g} ${z}`;
      const dName = global.NetaBaziEngine.calculate10Deities(chart.dayMaster.gan, g);
      monthlyList.push({
        num: m + 1,
        term: SOLAR_TERMS[m],
        canChi: cc,
        gan: g,
        zhi: z,
        deity: dName,
        wx: global.NetaBaziEngine.ZHI_WU_XING[z]
      });
    }

    // Lọc danh sách chuyên đề theo pill được chọn
    const topicsMap = [
      {
        id: 'career',
        name: '💼 Sự Nghiệp & Quyền Lực',
        level: decisions.career ? 'Cát Vượng' : 'Bình Hòa',
        content: decisions.career ? `
          <p><strong>Cơ chế phát triển:</strong> ${decisions.career.career_path}</p>
          <p><strong>Ngành nghề tương hợp:</strong> ${(decisions.career.industry_tags || []).join(' • ')}</p>
          <p><strong>Hiệu suất Tố Công:</strong> ${decisions.career.work_efficiency}</p>
        ` : '<p>Chưa có dữ liệu khảo luận sự nghiệp.</p>'
      },
      {
        id: 'wealth',
        name: '💰 Tài Chính & Điền Sản',
        level: decisions.wealth ? 'Thượng Cát' : 'Bình Hòa',
        content: decisions.wealth ? `
          <p><strong>Năng lực nạp tài:</strong> ${decisions.wealth.wealth_level}</p>
          <p><strong>Khí lực Tài tinh:</strong> ${decisions.wealth.wealth_score}</p>
          <p><strong>Đặc tính Khách - Chủ:</strong> ${decisions.wealth.host_guest_wealth}</p>
        ` : '<p>Chưa có dữ liệu khảo luận tài chính.</p>'
      },
      {
        id: 'marriage',
        name: '❤️ Hôn Nhân & Gia Đạo',
        level: decisions.marriage ? 'Bình Hòa' : 'Cần Hóa Giải',
        content: decisions.marriage ? `
          <p><strong>Hiện trạng Cung Phu Thê:</strong> ${decisions.marriage.marriage_status}</p>
          <p><strong>Tương tác gia đạo:</strong> ${(decisions.marriage.spouse_interactions || []).join('; ')}</p>
          <p><strong>Đạo hòa hợp:</strong> ${decisions.marriage.marriage_advice}</p>
        ` : '<p>Chưa có dữ liệu khảo luận hôn nhân.</p>'
      },
      {
        id: 'health',
        name: '🌿 Sức Khỏe & Ngũ Quan',
        level: decisions.health && decisions.health.health_warnings && decisions.health.health_warnings.length > 0 ? 'Cần Chú Trọng' : 'Khang Kiện',
        content: decisions.health ? `
          <ul style="margin: 0; padding-left: 18px;">
            ${(decisions.health.health_warnings || []).map(w => `<li style="margin-bottom: 4px;">${w}</li>`).join('')}
          </ul>
          <p style="margin-top: 6px;"><strong>Phòng ngừa dưỡng sinh:</strong> ${decisions.health.lifestyle_prevention || 'Ăn uống điều độ, tránh hàn lạnh ẩm thấp.'}</p>
        ` : '<p>Chưa có dữ liệu khảo luận sức khỏe.</p>'
      },
      {
        id: 'relatives',
        name: '👨‍👩‍👧 Lục Thân & Tổ Nghiệp',
        level: 'Bình Hòa',
        content: `
          <p><strong>Trụ Năm (Tổ Nghiệp & Phúc Đức):</strong> Đại diện cho cội nguồn gia tiên, ông bà tổ phụ. Tương tác ${chart.tuTru[0].gan} ${chart.tuTru[0].zhi} (${chart.tuTru[0].deity}) quyết định phúc ấm tiền vận.</p>
          <p><strong>Trụ Tháng (Phụ Mẫu & Huynh Đệ):</strong> Đại diện cho cha mẹ và anh em đồng môn. Nơi ngự của Nguyệt Lệnh ${chart.tuTru[1].gan} ${chart.tuTru[1].zhi} (${chart.tuTru[1].deity}), nắm giữ quyền điều tiết toàn bộ khí số.</p>
          <p><strong>Trụ Giờ (Tử Tức & Hậu Vận):</strong> Đại diện cho con cháu, thế hệ kế thừa và thời vận khi về già (${chart.tuTru[3].gan} ${chart.tuTru[3].zhi} - ${chart.tuTru[3].deity}).</p>
        `
      },
      {
        id: 'fengshui',
        name: '🧭 Môi Trường & Phong Thủy',
        level: 'Đắc Cách',
        content: `
          <p><strong>Nhu cầu Điều Hầu mùa sinh:</strong> ${gods.climate_reason || 'Cân bằng hàn noãn táo thấp của tiết khí.'}</p>
          <p><strong>Phương vị cát lợi:</strong> Ưu tiên các phương vị thuộc hành ${(gods.primary_use || []).concat(gods.favorable || []).join(', ')} để kích hoạt vượng khí.</p>
          <p><strong>Không gian an cư:</strong> Bố trí ánh sáng hài hòa, thông thoáng, tăng cường các yếu tố sinh vượng cho Dụng Thần.</p>
        `
      }
    ];

    const displayedTopics = currentTopicFilter === 'ALL'
      ? topicsMap
      : topicsMap.filter(t => t.id === currentTopicFilter);

    return `
      <div class="bazi-dashboard-container">
        <!-- CARD 1: CÂN LỰC NGŨ HÀNH QEE & ĐẮC LỆNH NGUYỆT LỆNH -->
        <div class="bazi-analysis-card">
          <div class="bazi-card-header-styled">
            <div class="bazi-card-title-main">
              <span>⚖️</span> CÂN LỰC NGŨ HÀNH QEE & ĐẮC LỆNH NGUYỆT LỆNH
            </div>
            <span class="bazi-card-tag">${bodyStr.pattern || 'Chính Cách'} • ${bodyStr.strength || 'Thân Vượng'}</span>
          </div>

          <div style="font-size: 0.8rem; margin-bottom: 12px; color: var(--text-color); line-height: 1.6;">
            <strong>Trạng thái Bản Mệnh:</strong> ${bodyStr.detail || ''} • Nguyệt Lệnh: <strong class="gold-text">${chart.dayMaster.seasonStatus.status}</strong>
          </div>

          <div class="bazi-wuxing-grid">
            ${['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ'].map(elem => {
              const sc = scores[elem] || 0;
              const pct = Math.round((sc / totalScore) * 100);
              const fillClass = elem === 'Kim' ? 'fill-kim' : (elem === 'Mộc' ? 'fill-moc' : (elem === 'Thủy' ? 'fill-thuy' : (elem === 'Hỏa' ? 'fill-hoa' : 'fill-tho')));
              return `
                <div class="bazi-wuxing-item">
                  <div class="bazi-wuxing-meta">
                    <span class="${getWxClass(elem)}">Hành ${elem}</span>
                    <span>${sc.toFixed(1)}đ (${pct}%)</span>
                  </div>
                  <div class="bazi-wuxing-bar-bg">
                    <div class="bazi-wuxing-bar-fill ${fillClass}" style="width: ${pct}%;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- CARD 2: HỆ THỐNG HỶ - DỤNG - KỴ THẦN & TRỌNG ĐIỂM ĐIỀU HẦU -->
        <div class="bazi-analysis-card">
          <div class="bazi-card-header-styled">
            <div class="bazi-card-title-main">
              <span>🎯</span> HỆ THỐNG HỶ - DỤNG - KỴ THẦN & ĐIỀU HẦU TIÊN QUYẾT
            </div>
            <span class="bazi-card-tag">Tử Bình Học Thuật</span>
          </div>

          <div class="bazi-yongshen-grid">
            <div class="bazi-ys-box favorable">
              <div class="bazi-ys-head text-fav">
                <span>🌟 DỤNG THẦN (Ưu tiên số 1)</span>
                <span>${(gods.primary_use || []).join(', ') || 'Đang xác định'}</span>
              </div>
              <div class="bazi-ys-body">
                Trụ cột sinh mệnh, tiết giảm khí thái quá hoặc nâng đỡ khí suy vi, giúp cục diện ngũ hành đạt tới thế cân bằng vĩnh cửu.
              </div>
            </div>

            <div class="bazi-ys-box favorable">
              <div class="bazi-ys-head text-fav">
                <span>✨ HỶ THẦN (Sinh trợ)</span>
                <span>${(gods.favorable || []).join(', ') || 'Đang xác định'}</span>
              </div>
              <div class="bazi-ys-body">
                Ngũ hành phò trợ, bảo vệ và nuôi dưỡng Dụng Thần trước sự công phá của Kỵ Thần trong các chu kỳ đại vận.
              </div>
            </div>

            <div class="bazi-ys-box unfavorable">
              <div class="bazi-ys-head text-unfav">
                <span>⚠️ KỴ THẦN & CỪU THẦN</span>
                <span>${(gods.unfavorable || []).join(', ') || 'Chưa phát hiện'}</span>
              </div>
              <div class="bazi-ys-body">
                Hành gây ứ trệ hoặc xung khắc làm tổn thương nguyên khí bản mệnh; cần dùng hành vi, màu sắc và phương vị để hóa giải.
              </div>
            </div>

            <div class="bazi-ys-box">
              <div class="bazi-ys-head" style="color: var(--gold-glow);">
                <span>🌿 ĐIỀU HẦU MÙA SINH</span>
                <span>Hành ${gods.climate_use || 'Hỏa'}</span>
              </div>
              <div class="bazi-ys-body">
                ${gods.climate_reason || 'Cân bằng nhiệt độ và độ ẩm của tiết khí sinh thần.'}
              </div>
            </div>
          </div>
        </div>

        <!-- CARD 3: CẤU TRÚC MANH PHÁI KHÁCH - CHỦ & CƠ CHẾ TỐ CÔNG -->
        <div class="bazi-analysis-card">
          <div class="bazi-card-header-styled">
            <div class="bazi-card-title-main">
              <span>🏛️</span> CẤU TRÚC MANH PHÁI KHÁCH - CHỦ & CƠ CHẾ TỐ CÔNG
            </div>
            <span class="bazi-card-tag">Manh Phái Mệnh Lý</span>
          </div>

          <div class="bazi-host-guest-wrap">
            <div class="bazi-hg-col">
              <div class="bazi-hg-title">🌐 BÊN KHÁCH (Năm & Tháng)</div>
              <div style="font-size: 0.76rem; color: var(--text-color); line-height: 1.5;">
                Đại diện cho môi trường xã hội, thiên hạ, đối tác thương trường, nguồn tài nguyên ngoại giới. 
                <br><strong>Tài Quan Khách:</strong> ${((mangPai.host_guest && mangPai.host_guest.wealth_guest) || []).join(', ') || 'Ngoại giới bình hòa'}
              </div>
            </div>
            <div class="bazi-hg-col">
              <div class="bazi-hg-title">🏠 BÊN CHỦ (Ngày & Giờ)</div>
              <div style="font-size: 0.76rem; color: var(--text-color); line-height: 1.5;">
                Đại diện cho bản thân, gia đình, tâm tưởng, kho tàng nội tại và thành quả tự thân tích lũy.
                <br><strong>Tài Quan Chủ:</strong> ${((mangPai.host_guest && mangPai.host_guest.wealth_host) || []).join(', ') || 'Nội tâm tự lập'}
              </div>
            </div>
          </div>

          <div style="margin-top: 12px; font-size: 0.8rem; font-weight: 700; color: var(--gold-primary);">
            ⚔️ Các Mắt Xích Tố Công Cốt Lõi:
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">
            ${((mangPai.work_mechanisms) || []).map(wm => `
              <div style="padding: 6px 10px; border-radius: 6px; background: rgba(245, 176, 65, 0.05); border: 1px solid rgba(245, 176, 65, 0.2); font-size: 0.76rem;">
                <strong style="color: var(--gold-glow);">${wm.type}</strong> (${wm.detail}): ${wm.meaning}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- CARD 4: BẢNG THẦN SÁT CHIẾU MỆNH KINH ĐIỂN -->
        <div class="bazi-analysis-card">
          <div class="bazi-card-header-styled">
            <div class="bazi-card-title-main">
              <span>🌟</span> BẢNG THẦN SÁT CHIẾU MỆNH KINH ĐIỂN (TAM MỆNH THÔNG HỘI)
            </div>
            <span class="bazi-card-tag">${shenSha.length} Thần Sát Khảo Luận</span>
          </div>

          <div class="bazi-shensha-container">
            ${['Năm', 'Tháng', 'Ngày', 'Giờ'].map(pName => {
              const starsInPillar = shenSha.filter(s => s.pillar === pName);
              if (starsInPillar.length === 0) return '';
              return `
                <div class="bazi-shensha-row">
                  <span class="bazi-pillar-tag-sm">Trụ ${pName}:</span>
                  ${starsInPillar.map(st => {
                    const isAusp = st.type.includes('Cát') || st.type.includes('Quý Nhân') || st.type.includes('Phúc') || st.type.includes('Lộc');
                    return `
                      <span class="bazi-ss-chip ${isAusp ? 'auspicious' : 'inauspicious'}" title="${st.meaning}">
                        ${st.name} (${st.zhi})
                      </span>
                    `;
                  }).join('')}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- CARD 5: KHẢO LUẬN 6 TRỤ CỘT ĐỜI NGƯỜI (BỘ LỌC TƯƠNG TÁC) -->
        <div class="bazi-analysis-card">
          <div class="bazi-card-header-styled">
            <div class="bazi-card-title-main">
              <span>📜</span> KHẢO LUẬN 6 TRỤ CỘT ĐỜI NGƯỜI (BỘ LỌC TƯƠNG TÁC)
            </div>
            <span class="bazi-card-tag">Chuyên Đề Mệnh Lý</span>
          </div>

          <!-- Quick Topic Pills Bar -->
          <div class="bazi-topic-filter-bar">
            <button class="bazi-topic-pill ${currentTopicFilter === 'ALL' ? 'active' : ''}" data-topic="ALL">🌟 Tất Cả 6 Trụ Cột</button>
            <button class="bazi-topic-pill ${currentTopicFilter === 'career' ? 'active' : ''}" data-topic="career">💼 Sự Nghiệp</button>
            <button class="bazi-topic-pill ${currentTopicFilter === 'wealth' ? 'active' : ''}" data-topic="wealth">💰 Tài Chính</button>
            <button class="bazi-topic-pill ${currentTopicFilter === 'marriage' ? 'active' : ''}" data-topic="marriage">❤️ Hôn Nhân</button>
            <button class="bazi-topic-pill ${currentTopicFilter === 'health' ? 'active' : ''}" data-topic="health">🌿 Sức Khỏe</button>
            <button class="bazi-topic-pill ${currentTopicFilter === 'relatives' ? 'active' : ''}" data-topic="relatives">👨‍👩‍👧 Lục Thân</button>
            <button class="bazi-topic-pill ${currentTopicFilter === 'fengshui' ? 'active' : ''}" data-topic="fengshui">🧭 Phong Thủy</button>
          </div>

          <!-- Topics List -->
          <div>
            ${displayedTopics.map(t => `
              <div class="bazi-topic-card" id="topic-card-${t.id}">
                <div class="bazi-topic-head">
                  <span>${t.name}</span>
                  <span class="bazi-card-tag" style="font-size: 0.7rem;">Phẩm cách: ${t.level}</span>
                </div>
                <div class="bazi-topic-body">
                  ${t.content}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- CARD 6: NIÊN VẬN KHẢO SÁT 2026 (BÍNH NGỌ) & LƯỚI 12 LƯU NGUYỆT -->
        <div class="bazi-analysis-card">
          <div class="bazi-card-header-styled">
            <div class="bazi-card-title-main">
              <span>📅</span> NIÊN VẬN NĂM ${targetYear} (${decisions.timing ? decisions.timing.year_can_chi : 'Bính Ngọ'}) & 12 LƯU NGUYỆT
            </div>
            <span class="bazi-card-tag">${decisions.timing ? decisions.timing.forecast_grade : 'Đắc Thời'}</span>
          </div>

          <div style="font-size: 0.8rem; margin-bottom: 12px; line-height: 1.6; color: var(--text-color);">
            <strong>Đại Vận đương nhiệm:</strong> ${decisions.timing ? decisions.timing.active_luck_pillar : 'Đang an vị'}
            <br><strong>Khí số niên vận:</strong> ${decisions.timing ? decisions.timing.forecast_desc : 'Khí số năm mới tương tác sinh động với Tứ Trụ.'}
          </div>

          <div style="font-size: 0.78rem; font-weight: 700; color: var(--gold-primary); margin-bottom: 8px;">
            🌙 Diễn Biến Khí Số Chi Tiết 12 Tháng:
          </div>

          <div class="bazi-month-grid">
            ${monthlyList.map(m => `
              <div class="bazi-month-card">
                <div class="bazi-month-head">
                  <span>Tháng ${m.num} (${m.canChi})</span>
                  <span class="${getWxClass(m.wx)}">${m.wx}</span>
                </div>
                <div class="bazi-month-desc">
                  Thần: <strong>${m.deity}</strong>
                  <br><span style="font-size: 0.68rem; color: var(--gold-glow);">${m.term.split('(')[0].trim()}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- CARD 7: QUẢN TRỊ VẬN MỆNH & ĐẠO DƯỠNG MỆNH TOÀN DIỆN -->
        <div class="bazi-analysis-card">
          <div class="bazi-card-header-styled">
            <div class="bazi-card-title-main">
              <span>🧘</span> QUẢN TRỊ VẬN MỆNH & ĐẠO DƯỠNG MỆNH TOÀN DIỆN
            </div>
            <span class="bazi-card-tag">Thuận Mệnh - Đắc Thời</span>
          </div>

          <div class="bazi-remedy-grid">
            <div class="bazi-remedy-card">
              <div class="bazi-remedy-head">🎨 Màu Sắc Khí Số</div>
              <div class="bazi-remedy-content">
                Ưa chuộng sắc tố đại diện cho Dụng Thần (${(gods.primary_use || []).join(', ')}): vàng nâu, trắng bạc hoặc đỏ ấm; hạn chế sắc đen sẫm và xanh lục đậm khi hành Thủy/Mộc đã quá vượng.
              </div>
            </div>

            <div class="bazi-remedy-card">
              <div class="bazi-remedy-head">🧭 Phương Vị Cát Lợi</div>
              <div class="bazi-remedy-content">
                Ưu tiên tọa lạc làm việc, kê giường ngủ hoặc phát triển sự nghiệp về các hướng Tây Nam, Đông Bắc (Thổ) hoặc Tây, Tây Bắc (Kim) để đón sinh khí hanh thông.
              </div>
            </div>

            <div class="bazi-remedy-card">
              <div class="bazi-remedy-head">💼 Nghề Nghiệp Khuyên Dùng</div>
              <div class="bazi-remedy-content">
                ${decisions.career && decisions.career.industry_tags ? decisions.career.industry_tags.join(' • ') : 'Kỹ thuật chuyên sâu, công nghệ, nghiên cứu, quản trị tài sản'}.
              </div>
            </div>

            <div class="bazi-remedy-card">
              <div class="bazi-remedy-head">🌱 Đạo Tu Dưỡng Tâm Tính</div>
              <div class="bazi-remedy-content">
                Giữ tâm thế điềm tĩnh, khiêm cung, phát huy thế mạnh chuyên môn độc lập; khi gặp năm xung tháng hạn cần chủ động phòng thủ tích lũy thay vì mạo hiểm khuếch trương.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderBazi() {
    const container = document.getElementById('view-bazi');
    if (!container) return;

    const chart = computeBaziChart();
    if (!chart) {
      container.innerHTML = `
        <div class="module-placeholder">
          <div class="placeholder-icon">📜</div>
          <h2 class="placeholder-title">LỖI KHỞI TẠO BÁT TỰ</h2>
          <p class="placeholder-desc">Không thể tính toán lá số cho thời điểm này. Vui lòng thử lại.</p>
        </div>
      `;
      return;
    }

    const { dayMaster, solarTerm, solarTermStr, solarTermFullStr, tuTru, interactions, mangPai, daYun, input } = chart;
    const pad = n => String(n).padStart(2, '0');
    const dStr = `${input.year}-${pad(input.month)}-${pad(input.day)}`;
    const timeFormatted = `${pad(input.hour)}:${pad(input.minute)} • ${pad(input.day)}/${pad(input.month)}/${input.year}`;

    const lunarObj = global.NetaCalendarEngine ? global.NetaCalendarEngine.solar2Lunar(input.day, input.month, input.year) : null;
    const displayDay = isLunarMode && lunarObj ? lunarObj.day : input.day;
    const displayMonth = isLunarMode && lunarObj ? lunarObj.month : input.month;
    const displayYear = isLunarMode && lunarObj ? lunarObj.year : input.year;

    const getWxClass = global.NetaBaziEngine.getWuXingColorClass;

    // Unified Control Card (Dùng chung cho cả 2 chế độ, giữ nguyên 100% chức năng gốc)
    const ctrlCardHTML = `
      <!-- Unified Control Card -->
      <div class="unified-ctrl-card">
        <!-- Row 1: Calendar switch & Date Box -->
        <div class="ucc-row ucc-row-date">
          <div class="ucc-pill-cal">
            <button type="button" class="ucc-pill-btn ${!isLunarMode ? 'active' : ''}" id="bazi-btn-solar">☀️ Dương</button>
            <button type="button" class="ucc-pill-btn ${isLunarMode ? 'active' : ''}" id="bazi-btn-lunar">🌙 Âm</button>
          </div>
          <div class="ucc-date-box" id="bazi-ucc-date-box" title="Nhập ngày tháng hoặc chạm vào dấu gạch/nút lịch để mở bảng chọn">
            <input type="number" id="bazi-input-day" class="num-box num-day" min="1" max="31" value="${displayDay}" placeholder="Ngày" title="Nhập Ngày (1-31)">
            <span class="num-slash">/</span>
            <input type="number" id="bazi-input-month" class="num-box num-month" min="1" max="12" value="${displayMonth}" placeholder="Tháng" title="Nhập Tháng (1-12)">
            <span class="num-slash">/</span>
            <input type="number" id="bazi-input-year" class="num-box num-year" min="1900" max="2100" value="${displayYear}" placeholder="Năm" title="Nhập Năm (gõ 2 số: 79 -> 1979)">
            <button type="button" class="ucc-btn-year" id="bazi-btn-quick-year" title="Bảng chọn Thập niên & Năm siêu tốc">⚡Năm</button>
            <label class="btn-picker-cal" id="bazi-btn-native-cal" title="Mở bảng chọn Ngày & Giờ">
              📅
              <input type="datetime-local" id="bazi-date-picker" value="${dStr}T${pad(input.hour)}:${pad(input.minute)}" class="native-hidden-date">
            </label>
          </div>
        </div>

        <!-- Row 2: Can Chi + Numeric Time & Gender -->
        <div class="ucc-row ucc-row-time">
          <div class="ucc-time-box">
            <select id="bazi-select-canchi" class="select-canchi">
              ${generateHourOptions(input.hour)}
            </select>
            <input type="number" id="bazi-input-hour" class="num-box num-hour" min="0" max="23" value="${pad(input.hour)}" placeholder="Giờ" title="Nhập Giờ (0-23)">
            <span class="num-colon">:</span>
            <input type="number" id="bazi-input-minute" class="num-box num-min" min="0" max="59" value="${pad(input.minute)}" placeholder="Phút" title="Nhập Phút (0-59)">
          </div>
          <div class="ucc-pill-gender">
            <button type="button" class="ucc-gender-btn ${currentIsMale ? 'active male' : ''}" id="bazi-btn-male">♂ Nam</button>
            <button type="button" class="ucc-gender-btn ${!currentIsMale ? 'active female' : ''}" id="bazi-btn-female">♀ Nữ</button>
          </div>
        </div>

        <!-- Row 3: Actions & Giai Đoạn 2/3 View Switcher -->
        <div class="ucc-row ucc-row-actions">
          <button class="ucc-btn-now" id="btn-bazi-now" title="Về thời điểm hiện tại">
            ⚡ Giờ thực
          </button>
          <div class="ucc-pill-view">
            <button type="button" class="ucc-view-btn ${currentViewMode === 'chart' ? 'active' : ''}" id="btn-bazi-mode-chart" title="Bàn Lá Số Bát Tự Trực Quan">
              🏛️ Bàn Lá Số
            </button>
            <button type="button" class="ucc-view-btn ${currentViewMode === 'analysis' ? 'active' : ''}" id="btn-bazi-mode-analysis" title="Bản Luận Giải Chuyên Sâu">
              📜 Luận Giải
            </button>
          </div>
          <button class="ucc-btn-submit" id="btn-bazi-submit" title="Lập lại Bát Tự">
            🔮 Lập Bát Tự
          </button>
        </div>
      </div>
    `;

    // NẾU ĐANG Ở CHẾ ĐỘ LUẬN GIẢI CHUYÊN SÂU (GIAI ĐOẠN 2 & 3)
    if (currentViewMode === 'analysis') {
      const analysisObj = getOrRunBaziAnalysis(chart, 2026);
      const reportMarkdown = analysisObj ? analysisObj.reportMarkdown : '';
      const lines = reportMarkdown.split('\n');
      const lineCount = lines.length;
      const charCount = reportMarkdown.length;
      const targetYear = analysisObj ? analysisObj.targetYear : 2026;

      container.innerHTML = `
        <div class="bazi-view-container">
          ${ctrlCardHTML}

          <div class="bazi-analysis-container">
            <!-- Thanh Công Cụ Chuẩn Hóa Neta -->
            <div class="neta-action-toolbar">
              <div class="neta-module-badge">
                <span>⚖️</span>
                <span>Bát Tự Tứ Trụ • Tử Bình &amp; Manh Phái</span>
              </div>
              <div class="neta-toolbar-actions">
                <button class="neta-btn-action" id="btn-bazi-copy-report" title="Sao chép toàn bộ bài luận giải vào bộ nhớ tạm">
                  📋 Sao Chép Luận Giải
                </button>
                <button class="neta-btn-action" id="btn-bazi-download-report" title="Tải xuống bài luận giải dạng Markdown">
                  💾 Tải File (.MD)
                </button>
                <button class="neta-btn-polish-ai" id="btn-bazi-polish-ai" title="Trau chuốt văn phong toàn diện bằng AI">
                  ${isAiPolishing ? '⏳ Đang Trau Chuốt...' : '✨ Trau Chuốt Văn Phong'}
                </button>
              </div>
            </div>

            <!-- Sub-Tab Navigation (Giai đoạn 3: Dual Subnav) -->
            <div class="bazi-analysis-subnav">
              <button class="bazi-subnav-btn ${currentAnalysisSubTab === 'dashboard' ? 'active' : ''}" id="btn-bazi-tab-dashboard">
                📊 Bảng Phân Tích Tổng Hợp (7 Card Dashboard)
              </button>
              <button class="bazi-subnav-btn ${currentAnalysisSubTab === 'report' ? 'active' : ''}" id="btn-bazi-tab-full-report">
                📜 Toàn Văn Báo Cáo Học Thuật (>${lineCount} Dòng)
              </button>
            </div>

            <!-- 3. Nội dung hiển thị theo Sub-Tab -->
            ${currentAnalysisSubTab === 'dashboard' ? `
              <!-- SUBTAB 1: 7 CARD DASHBOARD TỔNG HỢP -->
              ${renderDashboardHTML(analysisObj, chart)}
            ` : `
              <!-- SUBTAB 2: FULL REPORT READER CONTAINER -->
              <div class="bazi-full-report-wrap">
                <div class="bazi-report-meta-bar">
                  <div style="font-weight: 800; font-size: 0.95rem; color: var(--gold-glow); display: flex; align-items: center; gap: 8px;">
                    <span>📜</span> BẢN TOÀN VĂN LUẬN GIẢI BÁT TỰ TOÀN THƯ
                  </div>
                  <div class="neta-report-mode-toggle">
                    <button type="button" class="neta-mode-pill ${currentReportMode === 'standard' ? 'active' : ''}" id="btn-bazi-mode-standard">
                      📜 Bản Tiêu Chuẩn
                    </button>
                    <button type="button" class="neta-mode-pill ${currentReportMode === 'ai' ? 'active' : ''}" id="btn-bazi-mode-ai">
                      ${isAiPolishing ? '⏳ Đang Trau Chuốt...' : '✨ Bản Trau Chuốt (AI)'}
                    </button>
                  </div>
                </div>

                ${currentReportMode === 'ai' ? `
                  <!-- Chế độ Trau Chuốt AI (Hiển thị ngay trong lòng báo cáo, không bật ô to đùng) -->
                  ${isAiPolishing ? `
                    <div class="neta-inline-ai-loading">
                      <div class="neta-ai-loading-step">
                        <span class="neta-ai-sparkle-icon">✨</span>
                        <span>Đang tiến hành biên tập, trau chuốt cấu trúc câu và từ ngữ học thuật Tứ Trụ...</span>
                      </div>
                      <div class="neta-ai-shimmer-track"><div class="neta-ai-shimmer-thumb"></div></div>
                    </div>
                  ` : ''}

                  ${aiErrorMessage ? `
                    <div style="color: #e74c3c; font-weight: 600; font-size: 0.85rem; line-height: 1.6; background: rgba(231,76,60,0.12); padding: 14px; border-radius: 8px; border: 1px solid rgba(231,76,60,0.3); margin: 16px 0;">
                      <div>⚠️ ${aiErrorMessage}</div>
                      <div style="margin-top: 10px;">
                        <button type="button" class="neta-btn-action" id="btn-bazi-open-key-modal" style="background: var(--gold-primary); color: #000; font-weight: 700; border-color: var(--gold-glow);">
                          ⚙️ Cài Đặt Khóa Gemini API Dùng Chung
                        </button>
                      </div>
                    </div>
                  ` : ''}

                  ${aiPolishedText ? `
                    <div class="neta-polished-status-bar">
                      <span>✨ Bản Luận Giải Đã Được Trau Chuốt Học Thuật Bởi Gemini AI</span>
                      <button type="button" class="neta-btn-inline-back" id="btn-bazi-back-standard">↩️ Xem Bản Tiêu Chuẩn</button>
                    </div>
                    <div class="bazi-full-report-content neta-drop-cap" style="font-size: 0.88rem; line-height: 1.75; color: var(--text-color);">
                      ${renderMarkdownToHTML(aiPolishedText)}
                    </div>
                  ` : (!isAiPolishing && !aiErrorMessage ? `
                    <div style="text-align: center; padding: 36px 16px; color: var(--text-muted);">
                      <p style="margin-bottom: 12px;">Chưa kích hoạt trau chuốt văn phong cho lá số này.</p>
                      <button type="button" class="neta-btn-polish-ai" id="btn-bazi-inline-trigger-ai">
                        ✨ Bắt Đầu Trau Chuốt Văn Phong
                      </button>
                    </div>
                  ` : '')}
                ` : `
                  <!-- Chế độ Tiêu Chuẩn (Offline 100%) -->
                  <div class="bazi-report-stats-badge" style="margin-bottom: 12px; display: inline-block;">
                    📄 ${lineCount} Dòng • ${charCount.toLocaleString('vi-VN')} Ký Tự • Năm Khảo Sát ${targetYear}
                  </div>

                  <!-- Table of Contents -->
                  <div class="bazi-report-toc">
                    <span style="font-weight: 700; font-size: 0.72rem; color: var(--gold-primary); align-self: center; margin-right: 4px;">Mục lục nhanh:</span>
                    <a class="bazi-report-toc-pill" href="#sec-I">I. Tứ Trụ</a>
                    <a class="bazi-report-toc-pill" href="#sec-II">II. Ngũ Hành & Cách Cục</a>
                    <a class="bazi-report-toc-pill" href="#sec-III">III. Manh Phái Khách Chủ</a>
                    <a class="bazi-report-toc-pill" href="#sec-IV">IV. 12 Cung Manh Phái</a>
                    <a class="bazi-report-toc-pill" href="#sec-V">V. 6 Trụ Cột Đời Người</a>
                    <a class="bazi-report-toc-pill" href="#sec-VI">VI. 10 Đại Vận & Lưu Niên</a>
                    <a class="bazi-report-toc-pill" href="#sec-VII">VII. Niên Vận ${targetYear} & 12 Lưu Nguyệt</a>
                    <a class="bazi-report-toc-pill" href="#sec-VIII">VIII. Mốc Biến Cố Trọng Đại</a>
                    <a class="bazi-report-toc-pill" href="#sec-IX">IX. Dưỡng Mệnh Đạo</a>
                  </div>

                  <div class="bazi-full-report-content" style="font-size: 0.85rem; line-height: 1.7; color: var(--text-color);">
                    ${renderMarkdownToHTML(reportMarkdown)}
                  </div>
                `}

                <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid rgba(245, 176, 65, 0.3); display: flex; justify-content: flex-end; gap: 8px;">
                  <button class="bazi-btn-action-sm" id="btn-bazi-copy-report-bottom">
                    📋 Sao Chép Toàn Bộ Báo Cáo
                  </button>
                  <button class="bazi-btn-action-sm" id="btn-bazi-download-report-bottom">
                    💾 Tải File Báo Cáo (.MD)
                  </button>
                </div>
              </div>
            `}
          </div>
        </div>
      `;

      bindBaziEvents(chart);
      return;
    }

    // CHẾ ĐỘ MẶC ĐỊNH: BÀN LÁ SỐ BÁT TỰ TRỰC QUAN NGUYÊN BẢN 100%
    container.innerHTML = `
      <div class="bazi-view-container">
        ${ctrlCardHTML}

        <!-- Master Overview Banner (Compact Slim) -->
        <div class="bazi-master-banner">
          <div class="bm-left">
            <div class="bm-daymaster-badge ${getWxClass(dayMaster.wx)}">
              <span class="bm-gan">${dayMaster.gan}</span>
              <span class="bm-wx">${dayMaster.wx}</span>
            </div>
            <div class="bm-details">
              <div class="bm-title">NHẬT CHỦ: <strong class="${getWxClass(dayMaster.wx)}">${dayMaster.gan} ${dayMaster.wx}</strong> • ${dayMaster.yinYang}</div>
              <div class="bm-birth">📅 ${timeFormatted} • ${currentIsMale ? 'Nam' : 'Nữ'} • Mệnh: <strong>${mangPai.mengGong}</strong></div>
            </div>
          </div>
          <div class="bm-season-status">
            <span class="bm-season-tag ${dayMaster.seasonStatus.stateCode === 'VUONG' || dayMaster.seasonStatus.stateCode === 'TUONG' ? 'season-strong' : 'season-weak'}" title="${dayMaster.seasonStatus.status}">
              <strong>${dayMaster.seasonStatus.status.split(' ')[0]}</strong><span class="bm-season-desc"> ${dayMaster.seasonStatus.status.includes('(') ? dayMaster.seasonStatus.status.slice(dayMaster.seasonStatus.status.indexOf('(')) : ''}</span>
            </span>
          </div>
        </div>

        <!-- Bát Tự Tiết Khí Info Strip -->
        <div class="bazi-term-strip">
          <span>🌿 Tiết Khí: <strong>${solarTerm}</strong></span>
          <span class="term-sep">•</span>
          <span>Chuyển tiết: <strong class="tk-exact-time">${chart.solarTermDetails ? chart.solarTermDetails.transition.formatted : (solarTermFullStr.includes('Chuyển: ') ? solarTermFullStr.split('Chuyển: ')[1].replace(')', '') : '')}</strong></span>
        </div>

        <!-- 4 Pillars Grid (Tứ Trụ) -->
        <div class="bazi-section-card">
          <div class="bazi-card-title">
            <span>🏛️ TỨ TRỤ (BỐN CỘT MỆNH)</span>
            <span class="bazi-card-subtitle">Chạm từng cột xem phân tích chi tiết</span>
          </div>
          <div class="bazi-pillars-grid">
            ${tuTru.map((tru, idx) => `
              <div class="bazi-pillar-col ${idx === 2 ? 'is-daymaster-col' : ''}" data-pillar-idx="${idx}">
                <div class="bp-header">
                  <span class="bp-name">TRỤ ${tru.pillar.toUpperCase()}</span>
                  ${idx === 2 ? '<span class="bp-master-pill">Bản Mệnh</span>' : ''}
                </div>
                <div class="bp-body">
                  <!-- Thập thần can -->
                  <div class="bp-deity">${tru.deity}</div>
                  
                  <!-- Thiên Can -->
                  <div class="bp-gan ${getWxClass(tru.gan)}">${tru.gan}</div>
                  
                  <!-- Địa Chi -->
                  <div class="bp-zhi ${getWxClass(tru.zhi)}">${tru.zhi}</div>
                  
                  <!-- Vòng Trường Sinh -->
                  <div class="bp-changsheng">
                    <span class="cs-label">Trường Sinh:</span>
                    <strong class="cs-val">${tru.changSheng}</strong>
                  </div>

                  <!-- Tàng Can -->
                  <div class="bp-hidden-section">
                    <span class="hidden-title">Tàng Can:</span>
                    <div class="hidden-stems-list">
                      ${tru.hidden.map(h => `
                        <div class="hidden-stem-item">
                          <span class="h-stem ${getWxClass(h.gan)}">${h.gan}</span>
                          <span class="h-deity">${h.ten_god}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>

                  <!-- Nạp Âm -->
                  <div class="bp-napam">
                    <span class="napam-text">${tru.napAm}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Tương Tác Địa Chi Manh Phái -->
        <div class="bazi-section-card">
          <div class="bazi-card-title">
            <span>⚔️ TƯƠNG TÁC ĐỊA CHI (CỐT LÕI MANH PHÁI)</span>
            <span class="bazi-badge-count">${interactions.length} quan hệ</span>
          </div>
          <div class="bazi-interactions-container">
            ${interactions.length === 0 ? `
              <div class="bazi-empty-notice">Tứ trụ thanh thuần, không xuất hiện xung hại hay tương hình trực diện.</div>
            ` : `
              <div class="bazi-interactions-grid">
                ${interactions.map(item => `
                  <div class="bazi-interaction-card tag-${item.tag}">
                    <div class="bi-type">${item.type.toUpperCase()}</div>
                    <div class="bi-detail">${item.detail}</div>
                    <div class="bi-desc">${item.desc}</div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>

        <!-- 12 Cung & 12 Thần Manh Phái -->
        <div class="bazi-section-card">
          <div class="bazi-card-title">
            <span>🏰 12 CUNG & 12 THẦN MANH PHÁI</span>
            <span class="bazi-card-subtitle">Mệnh Cung an tại: <strong>${mangPai.mengGong}</strong></span>
          </div>
          <div class="bazi-palaces-grid">
            ${mangPai.palaces.map((p, pIdx) => {
              const spirit = mangPai.spirits[pIdx] ? mangPai.spirits[pIdx].than : '';
              return `
                <div class="bazi-palace-mini-card">
                  <div class="bpm-header">
                    <span class="bpm-name">${p.cung}</span>
                    <span class="bpm-zhi ${getWxClass(p.zhi)}">${p.zhi}</span>
                  </div>
                  <div class="bpm-spirit">
                    <span class="spirit-badge">${spirit}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 10 Bước Đại Vận -->
        <div class="bazi-section-card">
          <div class="bazi-card-title">
            <span>🚀 10 BƯỚC ĐẠI VẬN (${daYun.dir > 0 ? 'Thuận Hành' : 'Nghịch Hành'})</span>
            <span class="bazi-card-subtitle">Khởi vận: <strong>Năm ${chart.luckStart ? chart.luckStart.startYear : (input.year + input.startAge)}</strong> (${chart.luckStart ? chart.luckStart.startAge : input.startAge} tuổi) • ${chart.luckStart && chart.luckStart.detailStr ? chart.luckStart.detailStr : 'Chạm để xem Lưu Niên'}</span>
          </div>
          <div class="bazi-dayun-scroll">
            ${daYun.results.map(lp => `
              <div class="bazi-dayun-item ${lp.step === selectedLuckStep ? 'active-dayun' : ''}" data-step="${lp.step}">
                <div class="lp-step-num">Vận ${lp.step}</div>
                <div class="lp-age-range">${lp.age} - ${lp.endAge} tuổi</div>
                <div class="lp-year-range">${lp.year}</div>
                <div class="lp-canchi">
                  <span class="lp-gan ${getWxClass(lp.gan)}">${lp.gan}</span>
                  <span class="lp-zhi ${getWxClass(lp.zhi)}">${lp.zhi}</span>
                </div>
                <div class="lp-deity">${lp.deity}</div>
                <div class="lp-changsheng">${lp.changSheng}</div>
                <div class="lp-napam">${lp.napAm}</div>
              </div>
            `).join('')}
          </div>

          <!-- Lưu Niên 10 Năm Của Đại Vận Được Chọn -->
          <div class="bazi-annual-section" id="bazi-annual-box">
            ${renderAnnualPillarsHTML(daYun.results.find(r => r.step === selectedLuckStep))}
          </div>
        </div>
      </div>

      <!-- Pillar Detail Modal -->
      <div class="modal-overlay" id="bazi-pillar-modal" style="display: none;">
        <div class="modal-dialog bazi-modal-dialog">
          <div class="guide-header">
            <h2 id="bazi-modal-title">🏛️ Chi Tiết Trụ</h2>
            <button class="modal-close" id="bazi-modal-close" aria-label="Đóng">&times;</button>
          </div>
          <div class="bazi-modal-body" id="bazi-modal-body">
            <!-- Dynamically populated -->
          </div>
        </div>
      </div>
    `;

    bindBaziEvents(chart);
  }

  function renderAnnualPillarsHTML(luckStep) {
    if (!luckStep || !luckStep.annualPillars || luckStep.annualPillars.length === 0) {
      return '<div class="annual-empty">Chưa có thông tin Lưu Niên.</div>';
    }

    const getWxClass = global.NetaBaziEngine.getWuXingColorClass;

    return `
      <div class="annual-wrapper">
        <div class="annual-header">
          <span>📅 LƯU NIÊN 10 NĂM: ĐẠI VẬN ${luckStep.canChi} (${luckStep.age} - ${luckStep.endAge} TUỔI)</span>
        </div>
        <div class="annual-grid">
          ${luckStep.annualPillars.map(ap => `
            <div class="annual-card">
              <div class="ac-year">${ap.year}</div>
              <div class="ac-age">${ap.age} tuổi</div>
              <div class="ac-canchi">
                <span class="${getWxClass(ap.gan)}">${ap.gan}</span>
                <span class="${getWxClass(ap.zhi)}">${ap.zhi}</span>
              </div>
              <div class="ac-deity">${ap.deity}</div>
              <div class="ac-napam">${ap.napAm}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function generateHourOptions(selectedHour) {
    const CHI_HOURS = [
      { name: 'Tý (23h - 01h)', hour: 0 },
      { name: 'Sửu (01h - 03h)', hour: 2 },
      { name: 'Dần (03h - 05h)', hour: 4 },
      { name: 'Mão (05h - 07h)', hour: 6 },
      { name: 'Thìn (07h - 09h)', hour: 8 },
      { name: 'Tỵ (09h - 11h)', hour: 10 },
      { name: 'Ngọ (11h - 13h)', hour: 12 },
      { name: 'Mùi (13h - 15h)', hour: 14 },
      { name: 'Thân (15h - 17h)', hour: 16 },
      { name: 'Dậu (17h - 19h)', hour: 18 },
      { name: 'Tuất (19h - 21h)', hour: 20 },
      { name: 'Hợi (21h - 23h)', hour: 22 }
    ];

    return CHI_HOURS.map(ch => {
      let isSel = false;
      if (ch.hour === 0) {
        isSel = selectedHour === 23 || selectedHour === 0;
      } else {
        isSel = selectedHour >= (ch.hour - 1) && selectedHour < (ch.hour + 1);
      }
      return `<option value="${ch.hour}" ${isSel ? 'selected' : ''}>${ch.name}</option>`;
    }).join('');
  }

  function bindBaziEvents(chart) {
    const pad = n => String(n).padStart(2, '0');

    // Sync elements
    const inputDay = document.getElementById('bazi-input-day');
    const inputMonth = document.getElementById('bazi-input-month');
    const inputYear = document.getElementById('bazi-input-year');
    const datePicker = document.getElementById('bazi-date-picker');
    const selectCanChi = document.getElementById('bazi-select-canchi');
    const inputHour = document.getElementById('bazi-input-hour');
    const inputMin = document.getElementById('bazi-input-minute');
    const btnSubmit = document.getElementById('btn-bazi-submit');

    // Chuyển đổi Dương Lịch <-> Âm Lịch
    const btnSolar = document.getElementById('bazi-btn-solar');
    const btnLunar = document.getElementById('bazi-btn-lunar');
    if (btnSolar) {
      btnSolar.onclick = () => {
        if (isLunarMode) {
          isLunarMode = false;
          renderBazi();
        }
      };
    }
    if (btnLunar) {
      btnLunar.onclick = () => {
        if (!isLunarMode) {
          isLunarMode = true;
          renderBazi();
        }
      };
    }

    // Nút Chọn Năm Siêu Tốc (Decade & Year Jumper)
    const btnQuickYear = document.getElementById('bazi-btn-quick-year');
    if (btnQuickYear && inputYear) {
      btnQuickYear.onclick = (e) => {
        e.preventDefault();
        if (global.NetaSmartPicker) {
          global.NetaSmartPicker.openYearJumperModal(inputYear.value, (newYear) => {
            inputYear.value = newYear;
            if (btnSubmit) btnSubmit.click();
          });
        }
      };
    }

    // Tự động nhảy ô thông minh (Auto-advance) & Nhận diện năm 2 chữ số (79 -> 1979)
    if (global.NetaSmartPicker) {
      global.NetaSmartPicker.setupAutoAdvance({
        dayInput: inputDay,
        monthInput: inputMonth,
        yearInput: inputYear,
        hourInput: inputHour,
        minuteInput: inputMin,
        onSubmit: () => { if (btnSubmit) btnSubmit.click(); }
      });
      // Kết nối Date Picker gốc của hệ điều hành di động (datetime-local)
      if (datePicker) {
        datePicker.addEventListener('change', () => {
          if (!datePicker.value) return;
          const [dPart, tPart] = datePicker.value.split('T');
          const [y, m, d] = dPart.split('-').map(Number);
          let h = 12, min = 0;
          if (tPart) {
            [h, min] = tPart.split(':').map(Number);
          }
          isLunarMode = false;
          if (inputDay) inputDay.value = d;
          if (inputMonth) inputMonth.value = m;
          if (inputYear) inputYear.value = y;
          if (inputHour) inputHour.value = pad(h);
          if (inputMin) inputMin.value = pad(min);

          if (selectCanChi && global.NetaSmartPicker) {
            const zhiObj = global.NetaSmartPicker.getZhiByHour(h);
            if (zhiObj) selectCanChi.value = String(zhiObj.val);
          }

          currentBaziDate = new Date(y, m - 1, d, h, min, 0);
          currentAnalysisCache = null;
          renderBazi();
        });

        const pickerLabel = document.getElementById('bazi-btn-native-cal');
        const dateBox = document.getElementById('bazi-ucc-date-box');

        const triggerWheelPicker = (e) => {
          if (e && e.target === datePicker) return;
          if (e) e.preventDefault();
          const curD = currentBaziDate;
          datePicker.value = `${curD.getFullYear()}-${pad(curD.getMonth() + 1)}-${pad(curD.getDate())}T${pad(curD.getHours())}:${pad(curD.getMinutes())}`;
          if (typeof datePicker.showPicker === 'function') {
            datePicker.showPicker();
          } else {
            datePicker.click();
          }
        };

        if (pickerLabel) {
          pickerLabel.onclick = triggerWheelPicker;
        }
        if (dateBox) {
          dateBox.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
              triggerWheelPicker(e);
            }
          });
        }
      }
    }

    // Sync Can Chi hour -> numeric hour box
    if (selectCanChi) {
      selectCanChi.addEventListener('change', () => {
        if (inputHour) inputHour.value = pad(selectCanChi.value);
      });
    }

    // Sync numeric hour box -> Can Chi select
    if (inputHour) {
      inputHour.addEventListener('input', () => {
        const h = parseInt(inputHour.value);
        if (isNaN(h)) return;
        if (global.NetaSmartPicker) {
          const zhiObj = global.NetaSmartPicker.getZhiByHour(h);
          if (zhiObj && selectCanChi) selectCanChi.value = String(zhiObj.val);
        }
      });
    }

    // Gender toggle
    const btnMale = document.getElementById('bazi-btn-male');
    const btnFemale = document.getElementById('bazi-btn-female');
    if (btnMale) {
      btnMale.onclick = () => {
        if (!currentIsMale) {
          currentIsMale = true;
          currentAnalysisCache = null;
          renderBazi();
        }
      };
    }
    if (btnFemale) {
      btnFemale.onclick = () => {
        if (currentIsMale) {
          currentIsMale = false;
          currentAnalysisCache = null;
          renderBazi();
        }
      };
    }

    // Now button
    const btnNow = document.getElementById('btn-bazi-now');
    if (btnNow) {
      btnNow.onclick = () => {
        isLunarMode = false;
        currentBaziDate = new Date();
        currentAnalysisCache = null;
        currentViewMode = 'chart';
        renderBazi();
      };
    }

    // Submit button (Luôn luôn hiển thị bàn lá số khi bấm Lập Bát Tự)
    if (btnSubmit) {
      btnSubmit.onclick = () => {
        let d = parseInt(inputDay ? inputDay.value : 1) || 1;
        let m = parseInt(inputMonth ? inputMonth.value : 1) || 1;
        let y = parseInt(inputYear ? inputYear.value : 2026) || 2026;
        if (inputYear && inputYear.value.length === 2 && global.NetaSmartPicker) {
          y = global.NetaSmartPicker.parseSmartYear(inputYear.value);
          inputYear.value = y;
        }
        const h = Math.min(23, Math.max(0, parseInt(inputHour ? inputHour.value : 12) || 12));
        const min = Math.min(59, Math.max(0, parseInt(inputMin ? inputMin.value : 0) || 0));

        if (isLunarMode && global.NetaCalendarEngine) {
          const solar = global.NetaCalendarEngine.lunar2Solar(d, m, y);
          if (solar) {
            d = solar.day;
            m = solar.month;
            y = solar.year;
          }
        }

        currentBaziDate = new Date(y, m - 1, d, h, min, 0);
        currentAnalysisCache = null;
        currentViewMode = 'chart';
        renderBazi();
      };
    }

    // Mode toggles (Giai Đoạn 2)
    const btnModeChart = document.getElementById('btn-bazi-mode-chart');
    const btnModeAnalysis = document.getElementById('btn-bazi-mode-analysis');

    if (btnModeChart) {
      btnModeChart.onclick = () => {
        currentViewMode = 'chart';
        renderBazi();
      };
    }
    if (btnModeAnalysis) {
      btnModeAnalysis.onclick = () => {
        currentViewMode = 'analysis';
        renderBazi();
      };
    }

    // Subnav toggles (Giai Đoạn 3: Dual Subnav)
    const btnTabDashboard = document.getElementById('btn-bazi-tab-dashboard');
    const btnTabFullReport = document.getElementById('btn-bazi-tab-full-report');

    if (btnTabDashboard) {
      btnTabDashboard.onclick = () => {
        currentAnalysisSubTab = 'dashboard';
        renderBazi();
      };
    }
    if (btnTabFullReport) {
      btnTabFullReport.onclick = () => {
        currentAnalysisSubTab = 'report';
        renderBazi();
      };
    }

    // Topic Filter Pills (Giai đoạn 3: Card 5)
    const topicPills = document.querySelectorAll('.bazi-topic-pill[data-topic]');
    topicPills.forEach(pill => {
      pill.onclick = () => {
        const topic = pill.getAttribute('data-topic');
        currentTopicFilter = topic;
        renderBazi();
      };
    });

    // Luck step selection (Đại Vận)
    const luckItems = document.querySelectorAll('.bazi-dayun-item[data-step]');
    luckItems.forEach(item => {
      item.onclick = () => {
        const step = parseInt(item.getAttribute('data-step'), 10);
        selectedLuckStep = step;
        luckItems.forEach(el => el.classList.remove('active-dayun'));
        item.classList.add('active-dayun');
        const annualBox = document.getElementById('bazi-annual-box');
        if (annualBox) {
          const target = chart.daYun.results.find(r => r.step === step);
          annualBox.innerHTML = renderAnnualPillarsHTML(target);
        }
      };
    });

    // Pillar click modal
    const pillarCols = document.querySelectorAll('.bazi-pillar-col[data-pillar-idx]');
    pillarCols.forEach(col => {
      col.onclick = () => {
        const idx = parseInt(col.getAttribute('data-pillar-idx'), 10);
        const pData = chart.tuTru[idx];
        if (pData) {
          openPillarModal(pData, idx, chart);
        }
      };
    });

    // Modal close
    const modalClose = document.getElementById('bazi-modal-close');
    const modalOverlay = document.getElementById('bazi-pillar-modal');
    if (modalClose && modalOverlay) {
      modalClose.onclick = () => { modalOverlay.style.display = 'none'; };
      modalOverlay.onclick = (e) => {
        if (e.target === modalOverlay) modalOverlay.style.display = 'none';
      };
    }

    // Action buttons in Analysis mode
    const btnCopyReport = document.getElementById('btn-bazi-copy-report');
    const btnCopyBottom = document.getElementById('btn-bazi-copy-report-bottom');
    const btnDownload = document.getElementById('btn-bazi-download-report');
    const btnDownloadBottom = document.getElementById('btn-bazi-download-report-bottom');
    const btnPolishAi = document.getElementById('btn-bazi-polish-ai');
    const btnCloseAiBox = document.getElementById('btn-close-ai-box');
    const btnCopyAi = document.getElementById('btn-copy-ai-polished');

    const handleCopy = () => {
      const analysisObj = getOrRunBaziAnalysis(chart, 2026);
      if (analysisObj && analysisObj.reportMarkdown) {
        navigator.clipboard.writeText(analysisObj.reportMarkdown).then(() => {
          showBaziToast('✅ Đã sao chép toàn bộ bài luận giải vào bộ nhớ tạm!');
        }).catch(() => {
          showBaziToast('⚠️ Không thể sao chép tự động. Vui lòng thử lại.');
        });
      }
    };

    const handleDownload = () => {
      const analysisObj = getOrRunBaziAnalysis(chart, 2026);
      if (analysisObj && analysisObj.reportMarkdown) {
        const d = chart.input;
        const filename = `Luan_Giai_Bat_Tu_${d.year}_${d.month}_${d.day}_${d.hour}h.md`;
        downloadReportFile(analysisObj.reportMarkdown, filename);
        showBaziToast('💾 Đã tải xuống tệp bài luận giải (.md)!');
      }
    };

    if (btnCopyReport) btnCopyReport.onclick = handleCopy;
    if (btnCopyBottom) btnCopyBottom.onclick = handleCopy;
    if (btnDownload) btnDownload.onclick = handleDownload;
    if (btnDownloadBottom) btnDownloadBottom.onclick = handleDownload;

    if (btnPolishAi) {
      btnPolishAi.onclick = () => {
        currentAnalysisSubTab = 'report';
        currentReportMode = 'ai';
        const analysisObj = getOrRunBaziAnalysis(chart, 2026);
        if (analysisObj && !aiPolishedText && !isAiPolishing) {
          triggerAiPolish(analysisObj);
        } else {
          renderBazi();
        }
      };
    }

    // Toggle chế độ Báo cáo Tiêu Chuẩn vs Trau Chuốt AI (Nhúng mượt mà trong báo cáo)
    const btnModeStandard = document.getElementById('btn-bazi-mode-standard');
    const btnBackStandard = document.getElementById('btn-bazi-back-standard');
    const btnModeAi = document.getElementById('btn-bazi-mode-ai');
    const btnInlineTriggerAi = document.getElementById('btn-bazi-inline-trigger-ai');

    if (btnModeStandard) {
      btnModeStandard.onclick = () => {
        currentReportMode = 'standard';
        renderBazi();
      };
    }
    if (btnBackStandard) {
      btnBackStandard.onclick = () => {
        currentReportMode = 'standard';
        renderBazi();
      };
    }
    if (btnModeAi) {
      btnModeAi.onclick = () => {
        currentReportMode = 'ai';
        const analysisObj = getOrRunBaziAnalysis(chart, 2026);
        if (analysisObj && !aiPolishedText && !isAiPolishing) {
          triggerAiPolish(analysisObj);
        } else {
          renderBazi();
        }
      };
    }
    if (btnInlineTriggerAi) {
      btnInlineTriggerAi.onclick = () => {
        const analysisObj = getOrRunBaziAnalysis(chart, 2026);
        if (analysisObj) triggerAiPolish(analysisObj);
      };
    }

    const btnBaziOpenKey = document.getElementById('btn-bazi-open-key-modal');
    if (btnBaziOpenKey) {
      btnBaziOpenKey.onclick = () => {
        if (global.NetaGeminiService && typeof global.NetaGeminiService.openConfigModal === 'function') {
          global.NetaGeminiService.openConfigModal();
        } else if (global.NetaTarotView && typeof global.NetaTarotView.openKeyConfigModal === 'function') {
          global.NetaTarotView.openKeyConfigModal();
        }
      };
    }

    if (btnCopyAi) {
      btnCopyAi.onclick = () => {
        if (aiPolishedText) {
          navigator.clipboard.writeText(aiPolishedText).then(() => {
            showBaziToast('✅ Đã chép văn bản trau chuốt AI!');
          });
        }
      };
    }
  }

  function openPillarModal(pData, idx, chart) {
    const modal = document.getElementById('bazi-pillar-modal');
    const mTitle = document.getElementById('bazi-modal-title');
    const mBody = document.getElementById('bazi-modal-body');
    if (!modal || !mTitle || !mBody) return;

    const pNames = ['NĂM (TỔ NGHIỆP & TIỀN VẬN)', 'THÁNG (PHỤ MẪU & HUYNH ĐỆ)', 'NGÀY (BẢN MỆNH & PHU THÊ)', 'GIỜ (TỬ TỨC & HẬU VẬN)'];
    mTitle.innerHTML = `🏛️ TRỤ ${pNames[idx]}`;

    const getWxClass = global.NetaBaziEngine.getWuXingColorClass;
    const ganWx = global.NetaBaziEngine.GAN_WU_XING[pData.gan];
    const zhiWx = global.NetaBaziEngine.ZHI_WU_XING[pData.zhi];

    mBody.innerHTML = `
      <div class="bpm-banner">
        <div class="bpm-canchi ${getWxClass(pData.gan)}">${pData.gan} ${pData.zhi}</div>
        <div class="bpm-napam">${pData.napAm}</div>
      </div>

      <div class="bpm-detail-grid">
        <div><strong>Thập Thần:</strong> <span class="gold-text">${pData.deity}</span></div>
        <div><strong>Vòng Trường Sinh:</strong> <span>${pData.changSheng}</span></div>
        <div><strong>Ngũ Hành Can Chi:</strong> Can ${ganWx} • Chi ${zhiWx}</div>
      </div>

      <div class="bpm-hidden-box">
        <div class="bpm-box-title">🌱 CÁC CAN TÀNG TRONG ĐỊA CHI ${pData.zhi.toUpperCase()}:</div>
        <div class="bpm-hidden-tags">
          ${pData.hidden.map(h => `
            <div class="bpm-htag">
              <strong class="${getWxClass(h.gan)}">${h.gan} (${global.NetaBaziEngine.GAN_WU_XING[h.gan]})</strong>
              <span>${h.ten_god}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="bpm-role-box">
        <div class="bpm-box-title">📖 VAI TRÒ MỆNH LÝ CỦA TRỤ NÀY:</div>
        <p>${getPillarRoleDescription(idx, pData)}</p>
      </div>
    `;

    modal.style.display = 'flex';
  }

  function getPillarRoleDescription(idx, pData) {
    switch (idx) {
      case 0:
        return 'Đại diện cho gốc rễ gia tiên, dòng họ, nền tảng phúc ấm của ông bà tổ tiên và giai đoạn từ 1 đến 16 tuổi.';
      case 1:
        return 'Đại diện cho cung Phụ Mẫu, huynh đệ, môi trường xã hội và giai đoạn thanh niên khởi nghiệp từ 17 đến 32 tuổi. Nguyệt Lệnh là bộ chỉ huy ngũ hành của toàn bộ lá số.';
      case 2:
        return 'Thiên Can là Nhật Chủ (Bản Thân), Địa Chi là Cung Phu Thê (Hôn Phối). Đại diện cho giai đoạn trung niên từ 33 đến 48 tuổi, quyết định hạnh phúc gia đạo và ý chí tự thân.';
      case 3:
        return 'Đại diện cho cung Tử Tức (con cái), thế hệ kế thừa, sự nghiệp hậu vận và giai đoạn từ 49 tuổi trở về già.';
      default:
        return 'Trụ cột nắm giữ thiên cơ sinh hóa của cuộc đời.';
    }
  }

  // Export API
  global.NetaBaziView = {
    init: initBaziView,
    render: renderBazi,
    setDateAndRender: setDateAndRender
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBaziView);
  } else {
    initBaziView();
  }

})(typeof window !== 'undefined' ? window : this);
