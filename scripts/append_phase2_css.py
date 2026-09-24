import os

css_path = r"c:\Books\Neta Light\styles.css"
with open(css_path, "r", encoding="utf-8") as f:
    css_content = f.read()

phase2_css = """
/* ==========================================================================
   PHASE 2: FANNED RIBBON DECK & RITUAL ARENA ENHANCEMENTS
   ========================================================================== */

/* Pending & Active Target Slots */
.tarot-slot-wrapper.slot-pending {
  opacity: 0.85;
}

.tarot-slot-pos-badge.active-step {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #000000;
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.6);
  animation: badgeStepPulse 1.6s infinite alternate ease-in-out;
}

@keyframes badgeStepPulse {
  0% { transform: scale(1); box-shadow: 0 0 6px rgba(245, 158, 11, 0.4); }
  100% { transform: scale(1.15); box-shadow: 0 0 14px rgba(245, 158, 11, 0.8); }
}

.tarot-slot-pos-badge.pending {
  background: rgba(100, 116, 139, 0.6);
  color: #cbd5e1;
}

.tarot-slot-empty {
  position: relative;
  width: 140px;
  height: 238px;
  border-radius: 12px;
  border: 2px dashed rgba(167, 139, 250, 0.35);
  background: rgba(30, 27, 75, 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 8px;
  text-align: center;
  transition: all 0.3s ease;
  user-select: none;
}

.tarot-slot-empty.slot-current-target {
  border-color: #f59e0b;
  border-style: solid;
  background: rgba(245, 158, 11, 0.08);
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.25);
  animation: slotTargetPulse 2s infinite alternate ease-in-out;
}

@keyframes slotTargetPulse {
  0% { border-color: rgba(245, 158, 11, 0.5); box-shadow: 0 0 8px rgba(245, 158, 11, 0.2); }
  100% { border-color: #fbbf24; box-shadow: 0 0 22px rgba(245, 158, 11, 0.5); }
}

.slot-target-icon {
  font-size: 2.2rem;
  line-height: 1;
}

.slot-target-label {
  font-size: 0.78rem;
  color: #cbd5e1;
  font-weight: 500;
  line-height: 1.35;
}

.slot-current-target .slot-target-label {
  color: #fde68a;
  font-weight: 700;
}

/* Fanned Ribbon Workspace */
.tarot-ribbon-workspace {
  margin: 20px 0 24px 0;
  padding: 20px 16px 14px 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(26, 20, 64, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%);
  border: 1.5px solid rgba(139, 92, 246, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.tarot-ribbon-instruction {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  text-align: center;
}

.ribbon-step-badge {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #000000;
  font-weight: 800;
  font-size: 0.82rem;
  padding: 4px 14px;
  border-radius: 20px;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
}

.ribbon-prompt-text {
  font-size: 0.95rem;
  color: #e2e8f0;
  line-height: 1.45;
  max-width: 600px;
}

.ribbon-target-pos {
  color: #fcd34d;
  font-weight: 700;
  background: rgba(245, 158, 11, 0.15);
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid rgba(245, 158, 11, 0.35);
  display: inline-block;
  margin-top: 2px;
}

/* Ribbon Viewport & Scroll Track */
.tarot-ribbon-viewport {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
  padding: 28px 16px 20px 16px;
  user-select: none;
  scrollbar-width: thin;
  scrollbar-color: rgba(167, 139, 250, 0.4) transparent;
}

.tarot-ribbon-viewport::-webkit-scrollbar {
  height: 6px;
}

.tarot-ribbon-viewport::-webkit-scrollbar-thumb {
  background: rgba(167, 139, 250, 0.4);
  border-radius: 4px;
}

.tarot-ribbon-track {
  display: inline-flex;
  align-items: flex-end;
  height: 154px;
  padding: 0 45px;
  transition: transform 0.4s ease;
}

.tarot-ribbon-card {
  position: relative;
  width: 68px;
  height: 114px;
  margin-right: -45px; /* Elegant overlap */
  border-radius: 7px;
  box-shadow: -4px 0 10px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.35);
  border: 1.5px solid rgba(245, 158, 11, 0.45);
  cursor: pointer;
  transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s ease, filter 0.22s ease;
  flex-shrink: 0;
  background: #1e1b4b;
}

.tarot-ribbon-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
  pointer-events: none;
  display: block;
}

/* Hover & Active Lift Effect */
.tarot-ribbon-card:hover,
.tarot-ribbon-card:active {
  transform: translateY(-28px) scale(1.18) rotate(0deg) !important;
  z-index: 100 !important;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.75), 0 0 20px rgba(245, 158, 11, 0.85) !important;
  border-color: #fbbf24 !important;
}

/* Picked Card in Ribbon */
.tarot-ribbon-card.is-picked {
  opacity: 0.22;
  filter: grayscale(1);
  transform: translateY(-4px) scale(0.9) !important;
  pointer-events: none;
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: none;
}

/* Ribbon Riffle Shuffle Animation */
@keyframes ribbonShuffleRiffle {
  0% { transform: scale(1); }
  25% { transform: scale(0.85) translateX(-24px); }
  50% { transform: scale(0.9) translateX(24px); }
  75% { transform: scale(0.88) translateX(-12px); }
  100% { transform: scale(1); }
}

.tarot-ribbon-track.is-shuffling .tarot-ribbon-card {
  animation: ribbonShuffleRiffle 0.55s ease-in-out;
}

/* Ribbon Footer Bar */
.tarot-ribbon-footer-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 10px;
  padding: 0 6px;
  flex-wrap: wrap;
  gap: 10px;
}

.ribbon-scroll-hint {
  font-size: 0.82rem;
  color: #94a3b8;
  font-weight: 500;
}

.ribbon-tool-buttons {
  display: flex;
  gap: 8px;
}

.tarot-btn-subtle {
  background: rgba(139, 92, 246, 0.18);
  border: 1px solid rgba(167, 139, 250, 0.4);
  color: #e2e8f0;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tarot-btn-subtle:hover {
  background: rgba(139, 92, 246, 0.35);
  border-color: #a78bfa;
  color: #ffffff;
  transform: translateY(-1px);
}

/* Spread Ready Banner */
.tarot-spread-ready-banner {
  margin: 18px 0 20px 0;
  padding: 14px 20px;
  border-radius: 12px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
  animation: fadeIn 0.4s ease;
}

.ready-badge {
  font-size: 0.95rem;
  font-weight: 800;
  color: #34d399;
}

.ready-desc {
  font-size: 0.86rem;
  color: #cbd5e1;
}

.ready-desc strong {
  color: #6ee7b7;
}

/* Light Theme Adaptations */
body.theme-light .tarot-ribbon-workspace {
  background: linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%);
  border-color: #cbd5e1;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

body.theme-light .ribbon-prompt-text {
  color: #1e293b;
}

body.theme-light .ribbon-target-pos {
  color: #92400e;
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(217, 119, 6, 0.4);
}

body.theme-light .tarot-slot-empty {
  border-color: #cbd5e1;
  background: #f8fafc;
}

body.theme-light .tarot-slot-empty.slot-current-target {
  border-color: #d97706;
  background: #fffbeb;
  box-shadow: 0 0 16px rgba(217, 119, 6, 0.2);
}

body.theme-light .slot-target-label {
  color: #475569;
}

body.theme-light .slot-current-target .slot-target-label {
  color: #92400e;
}

body.theme-light .tarot-ribbon-card {
  box-shadow: -3px 0 6px rgba(0, 0, 0, 0.2), 0 3px 8px rgba(0, 0, 0, 0.15);
  border-color: rgba(217, 119, 6, 0.45);
}

body.theme-light .tarot-btn-subtle {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
}

body.theme-light .tarot-btn-subtle:hover {
  background: #e2e8f0;
  color: #0f172a;
}

body.theme-light .tarot-spread-ready-banner {
  background: #ecfdf5;
  border-color: #a7f3d0;
}

body.theme-light .ready-badge {
  color: #065f46;
}

body.theme-light .ready-desc {
  color: #1e293b;
}

/* Mobile Responsiveness for Ribbon & Slots */
@media (max-width: 640px) {
  .tarot-slot-empty {
    width: 92px;
    height: 156px;
    padding: 8px 4px;
    gap: 6px;
  }
  .slot-target-icon {
    font-size: 1.5rem;
  }
  .slot-target-label {
    font-size: 0.68rem;
  }
  .tarot-ribbon-workspace {
    padding: 14px 8px 10px 8px;
    margin: 14px 0 18px 0;
  }
  .ribbon-prompt-text {
    font-size: 0.85rem;
  }
  .tarot-ribbon-track {
    height: 130px;
    padding: 0 25px;
  }
  .tarot-ribbon-card {
    width: 54px;
    height: 92px;
    margin-right: -36px;
  }
  .tarot-ribbon-card:hover,
  .tarot-ribbon-card:active {
    transform: translateY(-20px) scale(1.15) rotate(0deg) !important;
  }
  .tarot-ribbon-footer-bar {
    justify-content: center;
    text-align: center;
  }
  .ribbon-scroll-hint {
    width: 100%;
    margin-bottom: 4px;
  }
}
"""

with open(css_path, "a", encoding="utf-8") as f:
    f.write(phase2_css)

print("Appended Phase 2 CSS to styles.css successfully!")
