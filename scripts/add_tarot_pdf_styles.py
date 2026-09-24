import os

CSS_RULES = """
/* ==========================================================================
   TAROT BUTTON CONTRAST FIX & PDF EXPORT STYLING
   ========================================================================== */

/* 1. All Button Contrast Fixes (Dark & Light Theme) */
.tarot-btn-pdf {
  background: linear-gradient(135deg, #059669, #10b981) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: #ffffff !important;
  border-radius: 8px !important;
  padding: 10px 16px !important;
  font-size: 0.92rem !important;
  font-weight: 700 !important;
  cursor: pointer !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 6px !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25) !important;
}

.tarot-btn-pdf:hover {
  background: linear-gradient(135deg, #047857, #059669) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35) !important;
}

.tarot-btn-pdf:active {
  transform: scale(0.98) !important;
}

.tarot-report-actions {
  display: flex !important;
  gap: 10px !important;
  flex-wrap: wrap !important;
  justify-content: stretch !important;
  margin-top: 20px !important;
}

.tarot-report-actions button {
  flex: 1 1 calc(33.333% - 10px) !important;
  min-width: 140px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 6px !important;
  padding: 12px 10px !important;
  font-size: 0.88rem !important;
  font-weight: 700 !important;
  border-radius: 8px !important;
}

@media (max-width: 540px) {
  .tarot-report-actions {
    flex-direction: column !important;
  }
  .tarot-report-actions button {
    width: 100% !important;
    min-width: 100% !important;
  }
}

/* Light Theme Overrides for Tarot Buttons */
body.theme-light .tarot-btn-secondary {
  background: #ffffff !important;
  border: 1.5px solid #cbd5e1 !important;
  color: #0f172a !important; /* DARK CHARCOAL TEXT */
  font-weight: 700 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
}

body.theme-light .tarot-btn-secondary:hover {
  background: #f1f5f9 !important;
  color: #0f172a !important;
  border-color: #94a3b8 !important;
}

body.theme-light .tarot-btn-ghost {
  background: transparent !important;
  border: 1.5px solid #cbd5e1 !important;
  color: #334155 !important;
  font-weight: 600 !important;
}

body.theme-light .tarot-btn-ghost:hover {
  background: #f1f5f9 !important;
  color: #0f172a !important;
}

body.theme-light .tarot-btn-pdf {
  background: linear-gradient(135deg, #059669, #10b981) !important;
  border: 1px solid #047857 !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25) !important;
}

/* 2. PDF Modal & Interactive Preview Styling */
.tarot-pdf-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.82);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  box-sizing: border-box;
}

.tarot-pdf-modal-card {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 14px;
  width: 100%;
  max-width: 900px;
  max-height: 94vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
}

.tarot-pdf-modal-header {
  padding: 14px 18px;
  background: #1e293b;
  border-bottom: 1px solid #334155;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tarot-pdf-modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #f8fafc;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tarot-pdf-modal-close {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.3rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.tarot-pdf-modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.tarot-pdf-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #090d16;
  -webkit-overflow-scrolling: touch;
}

.tarot-pdf-modal-footer {
  padding: 12px 18px;
  background: #1e293b;
  border-top: 1px solid #334155;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

/* Standalone A4 Sheet Preview Styling */
.tarot-pdf-paper {
  background: #ffffff !important;
  color: #0f172a !important;
  max-width: 780px;
  margin: 0 auto;
  padding: 32px 36px;
  box-sizing: border-box;
  border-radius: 6px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.55;
}

@media (max-width: 600px) {
  .tarot-pdf-paper {
    padding: 18px 14px;
  }
}

.pdf-hdr-banner {
  border-bottom: 2.5px solid #4f46e5;
  padding-bottom: 12px;
  margin-bottom: 18px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.pdf-hdr-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pdf-hdr-icon {
  font-size: 2.4rem;
}

.pdf-hdr-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: 0.5px;
  margin: 0;
}

.pdf-hdr-subtitle {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 2px;
}

.pdf-hdr-date {
  font-size: 0.85rem;
  color: #475569;
  text-align: right;
  font-weight: 600;
}

.pdf-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 22px;
  font-size: 0.9rem;
}

@media (max-width: 500px) {
  .pdf-meta-grid {
    grid-template-columns: 1fr;
  }
}

.pdf-meta-cell {
  display: flex;
  gap: 6px;
}

.pdf-meta-label {
  color: #64748b;
  font-weight: 600;
  white-space: nowrap;
}

.pdf-meta-val {
  color: #0f172a;
  font-weight: 700;
}

/* Spread Visual Gallery in PDF */
.pdf-spread-box {
  margin-bottom: 24px;
  page-break-inside: avoid;
}

.pdf-sec-head {
  font-size: 1.05rem;
  font-weight: 800;
  color: #312e81;
  border-bottom: 1.5px solid #cbd5e1;
  padding-bottom: 6px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pdf-cards-gallery-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
  margin-bottom: 10px;
}

.pdf-card-col {
  flex: 0 0 130px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 8px;
  text-align: center;
  background: #f8fafc;
  box-sizing: border-box;
}

@media (max-width: 480px) {
  .pdf-card-col {
    flex: 0 0 100px;
    padding: 6px;
  }
}

.pdf-card-pos {
  font-size: 0.75rem;
  font-weight: 700;
  color: #4338ca;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pdf-card-img-wrap {
  width: 100%;
  aspect-ratio: 2/3.4;
  overflow: hidden;
  border-radius: 4px;
  margin-bottom: 6px;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pdf-card-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.pdf-card-img-wrap img.is-reversed {
  transform: rotate(180deg);
}

.pdf-card-name-vi {
  font-size: 0.82rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.25;
  margin-bottom: 2px;
}

.pdf-card-name-en {
  font-size: 0.72rem;
  color: #64748b;
  margin-bottom: 4px;
}

.pdf-card-status-badge {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.pdf-card-status-badge.upright {
  background: #dbeafe;
  color: #1e40af;
}

.pdf-card-status-badge.reversed {
  background: #fee2e2;
  color: #991b1b;
}

/* Sections I - VI in PDF */
.pdf-block {
  margin-bottom: 20px;
  page-break-inside: avoid;
}

.pdf-quint-card {
  display: flex;
  gap: 16px;
  background: #faf5ff;
  border: 1.5px solid #d8b4fe;
  border-radius: 8px;
  padding: 14px;
}

.pdf-quint-img {
  width: 75px;
  height: 125px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #c084fc;
  flex-shrink: 0;
}

.pdf-story-quote {
  background: #f1f5f9;
  border-left: 4px solid #4f46e5;
  padding: 12px 16px;
  border-radius: 0 8px 8px 0;
  color: #1e293b;
  font-size: 0.94rem;
  line-height: 1.6;
  font-style: normal;
  margin: 0;
}

.pdf-pattern-item {
  background: #fff5f7;
  border: 1px solid #fbcfe8;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 8px;
}

.pdf-pattern-badge {
  background: #fce7f3;
  color: #831843;
  border: 1px solid #f472b6;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}

.pdf-card-detail-item {
  display: flex;
  gap: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 12px;
  background: #ffffff;
  page-break-inside: avoid;
}

.pdf-card-thumb {
  width: 78px;
  height: 130px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  flex-shrink: 0;
}

.pdf-card-thumb.is-reversed {
  transform: rotate(180deg);
}

.pdf-card-info {
  flex: 1;
}

.pdf-card-pos-title {
  font-size: 0.88rem;
  font-weight: 800;
  color: #4338ca;
  margin-bottom: 2px;
}

.pdf-card-item-name {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 6px;
}

.pdf-card-meta-line {
  font-size: 0.82rem;
  color: #475569;
  margin-bottom: 8px;
}

.pdf-card-text {
  font-size: 0.9rem;
  color: #1e293b;
  line-height: 1.55;
  margin-bottom: 8px;
}

.pdf-card-advice-box {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.86rem;
  color: #065f46;
}

.pdf-prescription-quote {
  background: #ecfdf5;
  border-left: 4px solid #059669;
  padding: 12px 16px;
  border-radius: 0 8px 8px 0;
  color: #065f46;
  font-size: 0.94rem;
  line-height: 1.6;
  margin: 0;
}

.pdf-footer {
  margin-top: 28px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
  color: #94a3b8;
}

/* 3. HARDWARE PRINT STYLESHEET (@media print) */
#tarot-pdf-print-area {
  display: none;
}

@media print {
  @page {
    size: A4 portrait;
    margin: 12mm 10mm 12mm 10mm;
  }

  html, body {
    background: #ffffff !important;
    color: #0f172a !important;
    font-size: 10pt !important;
    line-height: 1.45 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Hide the entire interactive application */
  #app-container,
  .app-header,
  .tarot-nav-bar,
  .tarot-control-card,
  .tarot-arena-table,
  .tarot-report-actions,
  .tarot-fanned-container,
  .tarot-pdf-modal-overlay,
  .tarot-pdf-modal-header,
  .tarot-pdf-modal-footer,
  .modal-overlay {
    display: none !important;
  }

  /* Only display the printable sheet */
  #tarot-pdf-print-area {
    display: block !important;
    width: 100% !important;
    background: #ffffff !important;
    color: #0f172a !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .tarot-pdf-paper {
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    max-width: 100% !important;
    width: 100% !important;
  }

  .pdf-block,
  .pdf-spread-box,
  .pdf-card-detail-item,
  .pdf-quint-card {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .pdf-sec-head {
    page-break-after: avoid !important;
    break-after: avoid !important;
  }
}
"""

def main():
    root = r"c:\Books\Neta Light"
    paths = [
        os.path.join(root, "styles.css"),
        os.path.join(root, "mobile_app", "assets", "www", "styles.css")
    ]
    for p in paths:
        if os.path.exists(p):
            with open(p, "a", encoding="utf-8") as f:
                f.write("\n" + CSS_RULES + "\n")
            print(f"Appended PDF and contrast CSS to: {p}")

if __name__ == "__main__":
    main()
