import os

css_path = r"c:\Books\Neta Light\styles.css"
with open(css_path, "r", encoding="utf-8") as f:
    css_content = f.read()

fixes_css = """
/* ==========================================================================
   FIXES: 3-TAB RESPONSIVENESS & COMPREHENSIVE LIGHT THEME CONTRAST
   ========================================================================== */

/* 1. Perfect 3-Tab Responsiveness (Zero horizontal overflow on any mobile screen) */
.tarot-nav-bar {
  display: flex !important;
  justify-content: center !important;
  width: 100% !important;
  margin-bottom: 12px !important;
}

.tarot-tabs {
  display: flex !important;
  width: 100% !important;
  max-width: 480px !important;
  box-sizing: border-box !important;
  gap: 4px !important;
  padding: 3px !important;
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 12px !important;
  flex-wrap: nowrap !important;
  overflow: hidden !important;
}

.tarot-tab-btn {
  flex: 1 1 0 !important;
  min-width: 0 !important;
  padding: 8px 4px !important;
  font-size: 0.85rem !important;
  font-weight: 700 !important;
  white-space: nowrap !important;
  text-align: center !important;
  border-radius: 8px !important;
  border: none !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}

@media (max-width: 420px) {
  .tarot-tab-btn {
    font-size: 0.78rem !important;
    padding: 7px 2px !important;
  }
}

/* 2. Comprehensive Light Theme Contrast Rules */
body.theme-light .tarot-control-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06) !important;
}

body.theme-light .tarot-control-group label {
  color: #4338ca !important;
}

body.theme-light .tarot-select {
  background: #ffffff !important;
  color: #0f172a !important;
  border: 1px solid #cbd5e1 !important;
}

body.theme-light .tarot-switch-label {
  color: #1e293b !important;
}

body.theme-light .tarot-question-input {
  background: #ffffff !important;
  color: #0f172a !important;
  border: 1px solid #cbd5e1 !important;
}

body.theme-light .tarot-question-input::placeholder {
  color: #94a3b8 !important;
}

body.theme-light .tarot-arena-table {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
}

body.theme-light .tarot-tabs {
  background: #f1f5f9 !important;
  border-color: #cbd5e1 !important;
}

body.theme-light .tarot-tab-btn {
  color: #475569 !important;
}

body.theme-light .tarot-tab-btn:hover {
  background: #e2e8f0 !important;
  color: #0f172a !important;
}

body.theme-light .tarot-tab-btn.active {
  background: #6366f1 !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35) !important;
}

/* Arena Card Slot Meta in Light Theme */
body.theme-light .tarot-slot-card-meta .tarot-meta-name {
  color: #0f172a !important;
  font-weight: 700 !important;
}

body.theme-light .tarot-slot-card-meta .tarot-meta-sub {
  color: #475569 !important;
  font-weight: 500 !important;
}

body.theme-light .tarot-slot-pos-title {
  color: #1e293b !important;
  font-weight: 700 !important;
}

body.theme-light .tarot-slot-pos-badge {
  background: #6366f1 !important;
  color: #ffffff !important;
}

body.theme-light .tarot-slot-pos-badge.pending {
  background: #cbd5e1 !important;
  color: #475569 !important;
}

/* Report Card in Light Theme */
body.theme-light .tarot-report-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.06) !important;
}

body.theme-light .tarot-report-title {
  color: #0f172a !important;
}

body.theme-light .tarot-report-meta {
  color: #475569 !important;
}

body.theme-light .tarot-sec-title {
  color: #0f172a !important;
}

body.theme-light .tarot-section-box {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
}

/* Section I: Quintessence in Light Theme */
body.theme-light .tarot-quintessence-box {
  background: #faf5ff !important;
  border: 1.5px solid #d8b4fe !important;
}

body.theme-light .quint-name {
  color: #0f172a !important;
}

body.theme-light .quint-sub {
  color: #475569 !important;
}

body.theme-light .quint-num-badge {
  background: #fef3c7 !important;
  color: #92400e !important;
  border: 1px solid #f59e0b !important;
  font-weight: 700 !important;
}

body.theme-light .tarot-quint-lesson strong {
  color: #7e22ce !important;
}

body.theme-light .tarot-quint-lesson p {
  color: #1e293b !important;
}

/* Section II: Storyline in Light Theme */
body.theme-light .tarot-storyline-box {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
}

body.theme-light .tarot-storyline-content blockquote {
  color: #0f172a !important;
  background: #f1f5f9 !important;
  border-left: 4px solid #6366f1 !important;
}

body.theme-light .tarot-storyline-content strong {
  color: #4338ca !important;
}

/* Section III: Archetypal Patterns in Light Theme (Fixed pale text bug) */
body.theme-light .tarot-patterns-box {
  background: #fff5f7 !important;
  border: 1.5px solid #fbcfe8 !important;
}

body.theme-light .pattern-header .pattern-title {
  color: #9d174d !important;
}

body.theme-light .pattern-badge {
  background: #fce7f3 !important;
  color: #831843 !important;
  border: 1px solid #f472b6 !important;
  font-weight: 700 !important;
}

body.theme-light .pattern-desc {
  color: #1e293b !important;
}

/* Section IV: Macro Scan in Light Theme */
body.theme-light .tarot-macro-item {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
}

body.theme-light .macro-label {
  color: #475569 !important;
}

body.theme-light .macro-val {
  color: #0f172a !important;
}

body.theme-light .macro-val.fate-verdict {
  color: #b45309 !important;
}

body.theme-light .macro-val.elem-dominant {
  color: #0369a1 !important;
}

body.theme-light .dignity-desc {
  color: #1e293b !important;
}

body.theme-light .dignity-badge {
  font-weight: 700 !important;
}

/* Section V: Detailed Readings in Light Theme */
body.theme-light .tarot-card-reading-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05) !important;
}

body.theme-light .reading-card-pos {
  color: #4338ca !important;
  font-weight: 700 !important;
}

body.theme-light .reading-card-name {
  color: #0f172a !important;
}

body.theme-light .reading-card-keywords {
  color: #334155 !important;
}

body.theme-light .reading-card-keywords span {
  color: #0f172a !important;
  font-weight: 600 !important;
}

body.theme-light .reading-card-desc {
  color: #1e293b !important;
}

body.theme-light .reading-card-advice {
  background: #ecfdf5 !important;
  border: 1px solid #a7f3d0 !important;
  color: #065f46 !important;
}

body.theme-light .reading-card-advice em {
  color: #047857 !important;
}

/* Section VI: Actionable Prescription in Light Theme */
body.theme-light .tarot-prescription-box {
  background: #ecfdf5 !important;
  border: 1.5px solid #a7f3d0 !important;
}

body.theme-light .tarot-prescription-content blockquote {
  color: #065f46 !important;
  background: #ffffff !important;
  border-left: 4px solid #059669 !important;
}
"""

with open(css_path, "a", encoding="utf-8") as f:
    f.write(fixes_css)

print("Appended fixes CSS to styles.css successfully!")
