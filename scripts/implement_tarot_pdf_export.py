import os

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Report Footer Actions button markup
    target_footer = '''        <!-- Report Footer Actions -->
        <div class="tarot-report-actions">
          <button id="btn-tarot-save-journal" class="tarot-btn-primary">
            💾 Lưu Vào Nhật Ký
          </button>
          <button id="btn-tarot-copy-markdown" class="tarot-btn-secondary">
            📋 Sao Chép Markdown
          </button>
        </div>'''

    new_footer = '''        <!-- Report Footer Actions -->
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
        </div>'''

    if target_footer in content:
        content = content.replace(target_footer, new_footer, 1)
        print(f"Updated footer buttons in {filepath}")
    else:
        print(f"Footer buttons already updated or not found in {filepath}")

    # 2. Update Journal item actions to include Export PDF button
    target_journal_btn = '''                <div class="journal-item-actions">
                  <button class="tarot-btn-secondary btn-view-journal-detail" data-id="${entry.id}">
                    👁️ Xem Lại Toàn Văn Báo Cáo
                  </button>
                </div>'''

    new_journal_btn = '''                <div class="journal-item-actions">
                  <button class="tarot-btn-secondary btn-view-journal-detail" data-id="${entry.id}">
                    👁️ Xem Toàn Văn
                  </button>
                  <button class="tarot-btn-pdf btn-export-journal-pdf" data-id="${entry.id}">
                    📄 Xuất PDF
                  </button>
                </div>'''

    if target_journal_btn in content:
        content = content.replace(target_journal_btn, new_journal_btn, 1)
        print(f"Updated journal action buttons in {filepath}")
    else:
        print(f"Journal action buttons already updated or not found in {filepath}")

    # 3. Add Event Listeners for Export PDF
    target_copy_md = '''    // 8. Copy Markdown
    const btnCopyMd = container.querySelector('#btn-tarot-copy-markdown');'''

    new_copy_md = '''    // 8. Export PDF Report
    const btnExportPdf = container.querySelector('#btn-tarot-export-pdf');
    if (btnExportPdf && currentReadingReport) {
      btnExportPdf.addEventListener('click', () => {
        triggerHaptic(15);
        openPdfExportModal(currentReadingReport);
      });
    }

    // 8b. Copy Markdown
    const btnCopyMd = container.querySelector('#btn-tarot-copy-markdown');'''

    if target_copy_md in content:
        content = content.replace(target_copy_md, new_copy_md, 1)
        print(f"Added PDF button listener in {filepath}")
    else:
        print(f"PDF button listener already added or not found in {filepath}")

    # 4. Add Journal Export PDF listener
    target_journal_view_detail = '''    container.querySelectorAll('.btn-view-journal-detail').forEach(btn => {'''

    new_journal_view_detail = '''    container.querySelectorAll('.btn-export-journal-pdf').forEach(btn => {
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

    container.querySelectorAll('.btn-view-journal-detail').forEach(btn => {'''

    if target_journal_view_detail in content and 'btn-export-journal-pdf' not in content:
        content = content.replace(target_journal_view_detail, new_journal_view_detail, 1)
        print(f"Added journal PDF export listener in {filepath}")
    else:
        print(f"Journal PDF listener already added or not found in {filepath}")

    # 5. Insert PDF Generator and Modal Functions before const NetaTarotView = {
    target_netatarotview = '''  const NetaTarotView = {'''

    pdf_functions = '''  // ==========================================================================
  // PDF EXPORT ENGINE & HIGH-FIDELITY PRINTABLE GENERATOR
  // ==========================================================================

  function buildTarotPdfHtml(report) {
    if (!report) return '';

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
            <span class="pdf-meta-label">⚖️ Xu thế chuyển dịch:</span>
            <span class="pdf-meta-val">${report.fateVerdict || 'Cân bằng'}</span>
          </div>
        </div>
    `;

    // Visual Spread Gallery
    if (report.cards && report.cards.length > 0) {
      html += `
        <div class="pdf-spread-box">
          <div class="pdf-sec-head">
            <span>🖼️</span> BÀN TRẢI BÀI TRỰC QUAN (${report.cards.length} LÁ)
          </div>
          <div class="pdf-cards-gallery-grid">
            ${report.cards.map((c, i) => `
              <div class="pdf-card-col">
                <div class="pdf-card-pos" title="${c.position ? c.position.nameVi : ''}">
                  ${c.position ? c.position.nameVi : `Vị trí #${i + 1}`}
                </div>
                <div class="pdf-card-img-wrap">
                  <img src="assets/tarot/${c.imageWebp || (c.cardId + '.webp')}" 
                       alt="${c.cardName || ''}" 
                       class="${c.isUpright ? '' : 'is-reversed'}">
                </div>
                <div class="pdf-card-name-vi">${c.nameVi || c.cardName || ''}</div>
                <div class="pdf-card-name-en">${c.nameEn || ''}</div>
                <span class="pdf-card-status-badge ${c.isUpright ? 'upright' : 'reversed'}">
                  ${c.isUpright ? '↑ Chiều Thuận' : '↓ Chiều Ngược'}
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
            <img src="assets/tarot/${q.imageWebp || (q.cardId + '.webp')}" alt="${q.nameVi}" class="pdf-quint-img">
            <div>
              <div style="font-size: 1.05rem; font-weight: 800; color: #1e1b4b; margin-bottom: 4px;">
                ${q.nameVi} (Số học: ${q.roman} - Tổng số học: ${q.sum})
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

    // Section IV: Elemental Dignities
    if (report.elementalScan) {
      const el = report.elementalScan;
      html += `
        <div class="pdf-block">
          <div class="pdf-sec-head">
            <span>⚖️</span> IV. PHỐI HỢP NGUYÊN TỐ & PHẨM HẠNH (ELEMENTAL DIGNITIES)
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; font-size: 0.9rem; margin-bottom: 8px;">
            <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 8px;">
              <span>🔥 <strong>Lửa:</strong> ${el.fire || 0} lá</span>
              <span>💧 <strong>Nước:</strong> ${el.water || 0} lá</span>
              <span>💨 <strong>Khí:</strong> ${el.air || 0} lá</span>
              <span>🌍 <strong>Đất:</strong> ${el.earth || 0} lá</span>
            </div>
            <div style="color: #475569; font-size: 0.88rem;">${report.dignitiesSummary || el.summary || ''}</div>
          </div>
        </div>
      `;
    }

    // Section V: Detailed Card Breakdown
    if (report.cards && report.cards.length > 0) {
      html += `
        <div class="pdf-block">
          <div class="pdf-sec-head">
            <span>🔍</span> V. LUẬN GIẢI CHI TIẾT TỪNG QUÂN BÀI
          </div>
          ${report.cards.map((c, i) => `
            <div class="pdf-card-detail-item">
              <img src="assets/tarot/${c.imageWebp || (c.cardId + '.webp')}" 
                   alt="${c.cardName}" 
                   class="pdf-card-thumb ${c.isUpright ? '' : 'is-reversed'}">
              <div class="pdf-card-info">
                <div class="pdf-card-pos-title">
                  ${c.position ? c.position.nameVi : `Vị trí #${i + 1}`}: ${c.position ? c.position.description : ''}
                </div>
                <div class="pdf-card-item-name">
                  ${c.cardName} <span class="pdf-card-status-badge ${c.isUpright ? 'upright' : 'reversed'}">${c.isUpright ? 'Chiều Thuận' : 'Chiều Ngược'}</span>
                </div>
                <div class="pdf-card-meta-line">
                  <strong>Từ khóa:</strong> ${(c.keywords || []).slice(0, 5).join(' • ')}
                </div>
                ${c.reading && c.reading.symbolBreakdown ? `
                  <div style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 6px; padding: 6px 10px; font-size: 0.84rem; color: #581c87; margin-bottom: 8px;">
                    👁️ <strong>Biểu tượng học RWS:</strong> ${c.reading.symbolBreakdown}
                  </div>
                ` : ''}
                <div class="pdf-card-text">
                  ${formatMarkdownInline(c.reading ? c.reading.meaning : (c.desc || ''))}
                </div>
                ${c.reading && c.reading.advice ? `
                  <div class="pdf-card-advice-box">
                    💡 <strong>Lời khuyên vị trí:</strong> ${formatMarkdownInline(c.reading.advice)}
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
  };'''

    if target_netatarotview in content and 'buildTarotPdfHtml' not in content:
        # replace the NetaTarotView object block
        end_idx = content.find('global.NetaTarotView = NetaTarotView;')
        if end_idx != -1:
            start_idx = content.find(target_netatarotview)
            content = content[:start_idx] + pdf_functions + '\n\n  ' + content[end_idx:]
            print(f"Added PDF functions and updated NetaTarotView in {filepath}")
    else:
        print(f"PDF functions already present or target not found in {filepath}")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Successfully processed {filepath}")

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
