import os

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Locate buildTarotPdfHtml and replace it with the corrected version
    start_marker = "  function buildTarotPdfHtml(report) {"
    end_marker = "  function downloadStandaloneHtmlReport(report) {"

    if start_marker not in content or end_marker not in content:
        print(f"Markers not found in {filepath}")
        return

    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)

    new_builder = '''  function buildTarotPdfHtml(report) {
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
\n'''

    content = content[:start_idx] + new_builder + content[end_idx:]
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Successfully updated buildTarotPdfHtml in {filepath}")

def main():
    root = r"c:\Books\Neta Light"
    paths = [
        os.path.join(root, "modules", "tarot_view.js"),
        os.path.join(root, "mobile_app", "assets", "www", "modules", "tarot_view.js")
    ]
    for p in paths:
        if os.path.exists(p):
            update_file(p)

if __name__ == '__main__':
    main()
