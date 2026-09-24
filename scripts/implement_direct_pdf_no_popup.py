import os

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Report Footer Actions to 4 direct buttons
    target_report_actions = '''        <!-- Report Footer Actions -->
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

    new_report_actions = '''        <!-- Report Footer Actions: Direct 1-Click Zero-Popup -->
        <div class="tarot-report-actions">
          <button id="btn-tarot-save-journal" class="tarot-btn-primary" title="Lưu kết quả trải bài vào sổ tay">
            💾 Lưu Nhật Ký
          </button>
          <button id="btn-tarot-export-pdf" class="tarot-btn-pdf" title="Tải trực tiếp tệp PDF đồ họa A4">
            📄 Tải File PDF
          </button>
          <button id="btn-tarot-download-html" class="tarot-btn-secondary" title="Tải tệp HTML báo cáo độc lập">
            📥 Tải File HTML
          </button>
          <button id="btn-tarot-copy-markdown" class="tarot-btn-secondary" title="Sao chép toàn bộ văn bản Markdown">
            📋 Sao Chép MD
          </button>
        </div>'''

    if target_report_actions in content:
        content = content.replace(target_report_actions, new_report_actions, 1)
        print(f"Updated report actions buttons in {filepath}")
    else:
        print(f"Report actions not matched in {filepath}")

    # 2. Update Journal item actions to include direct PDF and HTML download
    target_journal_actions = '''                <div class="journal-item-actions">
                  <button class="tarot-btn-secondary btn-view-journal-detail" data-id="${entry.id}">
                    👁️ Xem Toàn Văn
                  </button>
                  <button class="tarot-btn-pdf btn-export-journal-pdf" data-id="${entry.id}">
                    📄 Xuất PDF
                  </button>
                </div>'''

    new_journal_actions = '''                <div class="journal-item-actions">
                  <button class="tarot-btn-secondary btn-view-journal-detail" data-id="${entry.id}">
                    👁️ Xem Lại
                  </button>
                  <button class="tarot-btn-pdf btn-export-journal-pdf" data-id="${entry.id}">
                    📄 Tải PDF
                  </button>
                  <button class="tarot-btn-secondary btn-download-journal-html" data-id="${entry.id}">
                    📥 Tải HTML
                  </button>
                </div>'''

    if target_journal_actions in content:
        content = content.replace(target_journal_actions, new_journal_actions, 1)
        print(f"Updated journal actions in {filepath}")
    else:
        print(f"Journal actions not matched in {filepath}")

    # 3. Update Event Listeners in Tarot View
    target_listeners = '''    // 8. Export PDF Report
    const btnExportPdf = container.querySelector('#btn-tarot-export-pdf');
    if (btnExportPdf && currentReadingReport) {
      btnExportPdf.addEventListener('click', () => {
        triggerHaptic(15);
        openPdfExportModal(currentReadingReport);
      });
    }

    // 8b. Copy Markdown
    const btnCopyMd = container.querySelector('#btn-tarot-copy-markdown');'''

    new_listeners = '''    // 8. Direct PDF Download (Zero Popup)
    const btnExportPdf = container.querySelector('#btn-tarot-export-pdf');
    if (btnExportPdf && currentReadingReport) {
      btnExportPdf.addEventListener('click', () => {
        triggerHaptic(15);
        exportTarotPdfDirect(currentReadingReport, btnExportPdf);
      });
    }

    // 8b. Direct HTML Download (Zero Popup)
    const btnDownloadHtml = container.querySelector('#btn-tarot-download-html');
    if (btnDownloadHtml && currentReadingReport) {
      btnDownloadHtml.addEventListener('click', () => {
        triggerHaptic(15);
        downloadStandaloneHtmlReport(currentReadingReport, btnDownloadHtml);
      });
    }

    // 8c. Copy Markdown
    const btnCopyMd = container.querySelector('#btn-tarot-copy-markdown');'''

    if target_listeners in content:
        content = content.replace(target_listeners, new_listeners, 1)
        print(f"Updated action listeners in {filepath}")
    else:
        print(f"Action listeners not matched in {filepath}")

    # 4. Update Journal Event Listeners
    target_journal_listeners = '''    container.querySelectorAll('.btn-export-journal-pdf').forEach(btn => {
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
    });'''

    new_journal_listeners = '''    container.querySelectorAll('.btn-export-journal-pdf').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const list = getJournal();
        const entry = list.find(it => it.id === id);
        if (entry && entry.fullReport) {
          triggerHaptic(15);
          exportTarotPdfDirect(entry.fullReport, btn);
        }
      });
    });

    container.querySelectorAll('.btn-download-journal-html').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const list = getJournal();
        const entry = list.find(it => it.id === id);
        if (entry && entry.fullReport) {
          triggerHaptic(15);
          downloadStandaloneHtmlReport(entry.fullReport, btn);
        }
      });
    });'''

    if target_journal_listeners in content:
        content = content.replace(target_journal_listeners, new_journal_listeners, 1)
        print(f"Updated journal listeners in {filepath}")
    else:
        print(f"Journal listeners not matched in {filepath}")

    # 5. Replace openPdfExportModal and downloadStandaloneHtmlReport with robust direct export functions
    start_func_marker = "  function downloadStandaloneHtmlReport(report) {"
    end_func_marker = "  const NetaTarotView = {"

    if start_func_marker in content and end_func_marker in content:
        start_idx = content.find(start_func_marker)
        end_idx = content.find(end_func_marker)

        new_export_logic = '''  function downloadStandaloneHtmlReport(report, btnElement) {
    if (!report) return;
    const bodyContent = buildTarotPdfHtml(report);
    const fullHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bao_Cao_Tarot_Neta_${Date.now()}</title>
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
      padding: 32px 30px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .pdf-hdr-banner { border-bottom: 2.5px solid #4f46e5; padding-bottom: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: flex-start; }
    .pdf-hdr-left { display: flex; align-items: center; gap: 12px; }
    .pdf-hdr-icon { font-size: 2.2rem; }
    .pdf-hdr-title { font-size: 1.25rem; font-weight: 800; color: #1e1b4b; margin: 0; }
    .pdf-hdr-subtitle { font-size: 0.85rem; color: #64748b; margin-top: 2px; }
    .pdf-hdr-date { font-size: 0.82rem; color: #475569; text-align: right; }
    .pdf-meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-size: 0.88rem; }
    .pdf-meta-cell { display: flex; gap: 6px; }
    .pdf-meta-label { color: #64748b; font-weight: 600; }
    .pdf-meta-val { color: #0f172a; font-weight: 700; }
    .pdf-sec-head { font-size: 1.05rem; font-weight: 800; color: #312e81; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
    .pdf-cards-gallery-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-bottom: 10px; }
    .pdf-card-col { flex: 0 0 120px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px; text-align: center; background: #f8fafc; box-sizing: border-box; }
    .pdf-card-pos { font-size: 0.72rem; font-weight: 700; color: #4338ca; margin-bottom: 4px; }
    .pdf-card-img-wrap { width: 100%; aspect-ratio: 2/3.4; overflow: hidden; border-radius: 4px; margin-bottom: 6px; background: #e2e8f0; }
    .pdf-card-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .pdf-card-img-wrap img.is-reversed { transform: rotate(180deg); }
    .pdf-card-name-vi { font-size: 0.82rem; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
    .pdf-card-name-en { font-size: 0.7rem; color: #64748b; margin-bottom: 4px; }
    .pdf-card-status-badge { display: inline-block; font-size: 0.68rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
    .pdf-card-status-badge.upright { background: #dbeafe; color: #1e40af; }
    .pdf-card-status-badge.reversed { background: #fee2e2; color: #991b1b; }
    .pdf-block { margin-bottom: 20px; page-break-inside: avoid; }
    .pdf-quint-card { display: flex; gap: 16px; background: #faf5ff; border: 1.5px solid #d8b4fe; border-radius: 8px; padding: 14px; }
    .pdf-quint-img { width: 75px; height: 125px; object-fit: cover; border-radius: 6px; border: 1px solid #c084fc; flex-shrink: 0; }
    .pdf-story-quote { background: #f1f5f9; border-left: 4px solid #4f46e5; padding: 12px 16px; border-radius: 0 8px 8px 0; color: #1e293b; font-size: 0.94rem; line-height: 1.6; margin: 0; text-align: justify; }
    .pdf-pattern-item { background: #fff5f7; border: 1px solid #fbcfe8; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; text-align: justify; }
    .pdf-pattern-badge { background: #fce7f3; color: #831843; border: 1px solid #f472b6; font-size: 0.78rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; }
    .pdf-card-detail-item { display: flex; gap: 16px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 12px; background: #ffffff; page-break-inside: avoid; }
    .pdf-card-thumb { width: 78px; height: 130px; object-fit: cover; border-radius: 6px; border: 1px solid #cbd5e1; flex-shrink: 0; }
    .pdf-card-thumb.is-reversed { transform: rotate(180deg); }
    .pdf-card-info { flex: 1; text-align: justify; }
    .pdf-card-pos-title { font-size: 0.88rem; font-weight: 800; color: #4338ca; margin-bottom: 2px; }
    .pdf-card-item-name { font-size: 1.05rem; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
    .pdf-card-meta-line { font-size: 0.82rem; color: #475569; margin-bottom: 8px; }
    .pdf-card-text { font-size: 0.9rem; color: #1e293b; line-height: 1.55; margin-bottom: 8px; text-align: justify; }
    .pdf-card-advice-box { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 8px 12px; font-size: 0.86rem; color: #065f46; text-align: justify; }
    .pdf-prescription-quote { background: #ecfdf5; border-left: 4px solid #059669; padding: 12px 16px; border-radius: 0 8px 8px 0; color: #065f46; font-size: 0.94rem; line-height: 1.6; margin: 0; text-align: justify; }
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

    const filename = `Bao_Cao_Tarot_Neta_${Date.now()}.html`;
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      if (document.body.contains(a)) document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 45000);

    if (btnElement) {
      const orig = btnElement.innerHTML;
      btnElement.innerHTML = '✅ Đã Tải';
      setTimeout(() => { btnElement.innerHTML = orig; }, 2500);
    }
    if (typeof window.showToast === 'function') {
      window.showToast('✅ Đã tải tệp HTML Báo cáo Luận giải về máy!');
    }
  }

  function exportTarotPdfDirect(report, btnElement) {
    if (!report) return;

    const originalText = btnElement ? btnElement.innerHTML : '';
    if (btnElement) {
      btnElement.disabled = true;
      btnElement.innerHTML = '⏳ Đang tạo PDF...';
    }
    if (typeof window.showToast === 'function') {
      window.showToast('⏳ Đang kết xuất tệp PDF đồ họa, vui lòng chờ giây lát...');
    }

    // 1. Render content in hidden container for html2pdf
    let renderContainer = document.getElementById('tarot-pdf-direct-render');
    if (!renderContainer) {
      renderContainer = document.createElement('div');
      renderContainer.id = 'tarot-pdf-direct-render';
      renderContainer.style.position = 'fixed';
      renderContainer.style.left = '-9999px';
      renderContainer.style.top = '0';
      renderContainer.style.width = '780px';
      renderContainer.style.zIndex = '-9999';
      renderContainer.style.background = '#ffffff';
      document.body.appendChild(renderContainer);
    }

    renderContainer.innerHTML = buildTarotPdfHtml(report);

    // 2. html2pdf options
    const filename = `Luan_Giai_Tarot_Neta_${Date.now()}.pdf`;
    const opt = {
      margin: [8, 8, 8, 8],
      filename: filename,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    if (typeof window.html2pdf === 'function') {
      window.html2pdf().set(opt).from(renderContainer).save().then(() => {
        if (btnElement) {
          btnElement.disabled = false;
          btnElement.innerHTML = '✅ Đã Tải';
          setTimeout(() => { btnElement.innerHTML = originalText; }, 2500);
        }
        if (typeof window.showToast === 'function') {
          window.showToast('✅ Đã tải file PDF luận giải về máy thành công!');
        }
      }).catch((err) => {
        console.error('html2pdf generation error, falling back to print:', err);
        if (btnElement) {
          btnElement.disabled = false;
          btnElement.innerHTML = originalText;
        }
        fallbackToSystemPrint(report);
      });
    } else {
      // Direct fallback to hardware print if html2pdf not available
      if (btnElement) {
        btnElement.disabled = false;
        btnElement.innerHTML = originalText;
      }
      fallbackToSystemPrint(report);
    }
  }

  function fallbackToSystemPrint(report) {
    let printArea = document.getElementById('tarot-pdf-print-area');
    if (!printArea) {
      printArea = document.createElement('div');
      printArea.id = 'tarot-pdf-print-area';
      document.body.appendChild(printArea);
    }
    printArea.innerHTML = buildTarotPdfHtml(report);
    if (typeof window.showToast === 'function') {
      window.showToast('📄 Đang mở hộp thoại In / Lưu PDF hệ thống...');
    }
    window.print();
  }

'''
        content = content[:start_idx] + new_export_logic + content[end_idx:]
        print(f"Replaced popup modal with direct export logic in {filepath}")
    else:
        print(f"Export logic markers not found in {filepath}")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Wrote file {filepath}")

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
