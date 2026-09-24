import os

css_path = r"c:\Books\Neta Light\styles.css"
with open(css_path, "r", encoding="utf-8") as f:
    css_content = f.read()

phase3_css = """
/* ==========================================================================
   PHASE 3: ENCYCLOPEDIA V2 & REFLECTIVE JOURNAL V2 STYLES
   ========================================================================== */

/* Encyclopedia Sub-filters (Court vs Pips) */
.tarot-ency-subfilters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
  padding: 6px 4px;
}

.subfilter-label {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 600;
}

.ency-class-btn {
  background: rgba(139, 92, 246, 0.12);
  border: 1px solid rgba(167, 139, 250, 0.3);
  color: #cbd5e1;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ency-class-btn:hover {
  background: rgba(139, 92, 246, 0.25);
  border-color: #a78bfa;
  color: #ffffff;
}

.ency-class-btn.active {
  background: #8b5cf6;
  border-color: #a78bfa;
  color: #ffffff;
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
}

.ency-count-badge {
  margin-left: auto;
  font-size: 0.8rem;
  color: #94a3b8;
}

.ency-count-badge strong {
  color: #f59e0b;
}

.ency-card-astro-hint {
  font-size: 0.7rem;
  color: #a78bfa;
  margin-top: 4px;
  line-height: 1.25;
}

/* Journal Stats Card */
.tarot-journal-stats-card {
  margin-bottom: 20px;
  padding: 16px 18px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(30, 27, 75, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
  border: 1.5px solid rgba(139, 92, 246, 0.35);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
}

.stats-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.stats-card-header h4 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #f3f4f6;
  margin: 0;
}

.stats-summary-grid {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
  align-items: center;
  margin-bottom: 14px;
}

.stat-box {
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(167, 139, 250, 0.2);
  border-radius: 10px;
  padding: 10px;
  text-align: center;
}

.stat-number {
  font-size: 1.6rem;
  font-weight: 800;
  color: #f59e0b;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 4px;
}

.dominant-energy-box {
  text-align: left;
  padding: 10px 14px;
}

.stat-subhead {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-dominant-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #38bdf8;
  margin-top: 4px;
}

.stats-top-cards-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.top-cards-label {
  font-size: 0.8rem;
  color: #cbd5e1;
  font-weight: 600;
}

.top-cards-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.top-card-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: 20px;
  padding: 3px 10px 3px 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.78rem;
  color: #fde68a;
}

.top-card-pill img {
  width: 20px;
  height: 32px;
  border-radius: 4px;
  object-fit: cover;
}

.top-card-pill:hover {
  background: rgba(245, 158, 11, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

/* Journal Tools & Filters */
.journal-tools-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tarot-journal-filters-row {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.journal-search-wrap {
  flex: 1;
  min-width: 220px;
}

.journal-search-wrap input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(139, 92, 246, 0.3);
  background: rgba(15, 23, 42, 0.8);
  color: #f1f5f9;
  font-size: 0.86rem;
}

.journal-domain-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.journal-domain-btn {
  background: rgba(139, 92, 246, 0.12);
  border: 1px solid rgba(167, 139, 250, 0.3);
  color: #cbd5e1;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.journal-domain-btn.active {
  background: #8b5cf6;
  border-color: #a78bfa;
  color: #ffffff;
}

/* Personal Reflection Container in Journal Item */
.journal-reflection-container {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(30, 27, 75, 0.4);
  border: 1px solid rgba(139, 92, 246, 0.25);
}

.reflection-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.reflection-stars {
  display: flex;
  align-items: center;
  gap: 2px;
}

.stars-label {
  font-size: 0.78rem;
  color: #94a3b8;
  margin-right: 4px;
}

.star-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0 1px;
  filter: grayscale(1);
  opacity: 0.45;
  transition: all 0.15s ease;
}

.star-btn.filled {
  filter: none;
  opacity: 1;
  transform: scale(1.1);
}

.star-btn:hover {
  transform: scale(1.25);
  filter: none;
  opacity: 1;
}

.btn-toggle-edit-reflection {
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(167, 139, 250, 0.3);
  color: #cbd5e1;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-toggle-edit-reflection:hover {
  background: rgba(139, 92, 246, 0.3);
  color: #ffffff;
}

.reflection-note-quote {
  font-size: 0.88rem;
  color: #e2e8f0;
  line-height: 1.45;
  border-left: 3px solid #f59e0b;
  padding-left: 10px;
  margin: 6px 0 2px 0;
}

.reflection-note-empty {
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.4;
}

.reflection-edit-box {
  margin-top: 8px;
}

.journal-reflection-textarea {
  width: 100%;
  min-height: 75px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(167, 139, 250, 0.4);
  background: rgba(15, 23, 42, 0.95);
  color: #f1f5f9;
  font-family: inherit;
  font-size: 0.86rem;
  line-height: 1.4;
  resize: vertical;
}

.reflection-edit-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  gap: 8px;
  flex-wrap: wrap;
}

.journal-status-dropdown {
  background: rgba(30, 27, 75, 0.9);
  border: 1px solid rgba(167, 139, 250, 0.4);
  color: #fde68a;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
}

.reflection-btn-group {
  display: flex;
  gap: 6px;
}

.btn-save-note {
  padding: 4px 12px;
  font-size: 0.8rem;
}

.btn-cancel-note {
  padding: 4px 10px;
  font-size: 0.8rem;
}

/* Modal 3D Flip & Astrological Info */
.modal-card-3d-scene {
  perspective: 1000px;
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.tarot-modal-img.is-reversed-view {
  transform: rotate(180deg);
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 -8px 25px rgba(239, 68, 68, 0.4) !important;
}

.modal-orientation-switcher {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 12px;
  width: 100%;
}

.modal-orient-btn {
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(167, 139, 250, 0.35);
  color: #cbd5e1;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-orient-btn.active {
  background: #f59e0b;
  border-color: #fbbf24;
  color: #000000;
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
}

.modal-astro-box {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(139, 92, 246, 0.08);
  border: 1px solid rgba(167, 139, 250, 0.25);
  text-align: left;
  width: 100%;
}

.astro-label {
  font-size: 0.72rem;
  color: #a78bfa;
  font-weight: 700;
  text-transform: uppercase;
}

.astro-val {
  font-size: 0.82rem;
  color: #f1f5f9;
  margin-bottom: 6px;
  line-height: 1.35;
}

.symbolism-block {
  background: rgba(245, 158, 11, 0.06);
  border-left: 3px solid #f59e0b;
  padding-left: 10px;
}

.symbolism-block p {
  font-size: 0.86rem;
  color: #fde68a;
  line-height: 1.45;
}

.highlight-block {
  border-left: 3px solid #8b5cf6;
  background: rgba(139, 92, 246, 0.06);
  padding-left: 10px;
}

/* Light Theme Adaptations for Phase 3 */
body.theme-light .tarot-journal-stats-card {
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  border-color: #cbd5e1;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
}

body.theme-light .stats-card-header h4 {
  color: #0f172a;
}

body.theme-light .stat-box {
  background: #f8fafc;
  border-color: #e2e8f0;
}

body.theme-light .stat-dominant-title {
  color: #0284c7;
}

body.theme-light .top-card-pill {
  background: #fffbeb;
  border-color: #fde68a;
  color: #92400e;
}

body.theme-light .journal-search-wrap input {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #0f172a;
}

body.theme-light .journal-domain-btn {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
}

body.theme-light .journal-domain-btn.active {
  background: #6366f1;
  color: #ffffff;
}

body.theme-light .journal-reflection-container {
  background: #f8fafc;
  border-color: #e2e8f0;
}

body.theme-light .reflection-note-quote {
  color: #1e293b;
  border-left-color: #d97706;
}

body.theme-light .journal-reflection-textarea {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #0f172a;
}

body.theme-light .journal-status-dropdown {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #b45309;
}

body.theme-light .modal-astro-box {
  background: #f8fafc;
  border-color: #e2e8f0;
}

body.theme-light .astro-val {
  color: #1e293b;
}

body.theme-light .symbolism-block {
  background: #fffbeb;
  border-left-color: #d97706;
}

body.theme-light .symbolism-block p {
  color: #92400e;
}

/* Mobile Media Queries for Phase 3 */
@media (max-width: 640px) {
  .stats-summary-grid {
    grid-template-columns: 100px 1fr;
    gap: 8px;
  }
  .stat-number {
    font-size: 1.35rem;
  }
  .stat-dominant-title {
    font-size: 0.84rem;
  }
  .tarot-journal-filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  .journal-domain-tabs {
    justify-content: flex-start;
  }
  .reflection-meta-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  .btn-toggle-edit-reflection {
    align-self: flex-end;
  }
}
"""

with open(css_path, "a", encoding="utf-8") as f:
    f.write(phase3_css)

print("Appended Phase 3 CSS to styles.css successfully!")
