# -*- coding: utf-8 -*-
import os

with open(r'c:\Books\Neta Light\styles.css', 'r', encoding='utf-8') as f:
    content = f.read()

tarot_css = """

/* ==========================================================================
   TAROT RIDER-WAITE-SMITH (RWS) MODULE STYLES
   ========================================================================== */

.tarot-module-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 16px 40px;
  box-sizing: border-box;
}

/* Sub-Nav Bar */
.tarot-nav-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.tarot-tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 4px;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.tarot-tab-btn {
  background: transparent;
  border: none;
  color: #d1d5db;
  font-size: 0.92rem;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tarot-tab-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.tarot-tab-btn.active {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.35);
}

/* Control Card */
.tarot-control-card {
  background: #181924;
  border: 1px solid rgba(139, 92, 246, 0.25);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.tarot-control-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: flex-end;
  margin-bottom: 14px;
}

.tarot-control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1 1 200px;
}

.tarot-control-group label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #a78bfa;
}

.tarot-select {
  background: #232538;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #f3f4f6;
  padding: 9px 12px;
  font-size: 0.9rem;
  font-weight: 600;
  outline: none;
}

.tarot-checkbox-group {
  flex: 1 1 180px;
  justify-content: center;
}

.tarot-switch-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 600;
  color: #d1d5db;
  padding-bottom: 6px;
}

.tarot-switch-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #8b5cf6;
  cursor: pointer;
}

.tarot-question-row {
  margin-bottom: 14px;
}

.tarot-question-input {
  width: 100%;
  box-sizing: border-box;
  background: #232538;
  border: 1px solid rgba(139, 92, 246, 0.35);
  border-radius: 8px;
  color: #ffffff;
  padding: 11px 14px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.tarot-question-input:focus {
  border-color: #a78bfa;
  box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.2);
}

.tarot-action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tarot-btn-primary {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(99, 102, 241, 0.35);
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.tarot-btn-primary:active {
  transform: scale(0.98);
}

.tarot-btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #f3f4f6;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
}

.tarot-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.tarot-btn-ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #9ca3af;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.tarot-btn-ghost:hover {
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.3);
}

.tarot-btn-ghost.danger {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.tarot-btn-ghost.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Arena Table & Empty State */
.tarot-arena-table {
  min-height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #1c1d2e 0%, #11121c 100%);
  border: 1px solid rgba(139, 92, 246, 0.18);
  border-radius: 16px;
  padding: 24px 16px;
  margin-bottom: 24px;
}

.tarot-empty-arena {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
}

.tarot-empty-deck-stack {
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.tarot-empty-deck-stack:hover {
  transform: translateY(-6px) scale(1.02);
}

.tarot-stack-img {
  width: 140px;
  height: 238px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(139, 92, 246, 0.3);
  object-fit: cover;
  border: 2px solid rgba(167, 139, 250, 0.5);
}

.tarot-empty-prompt {
  color: #9ca3af;
  font-size: 0.95rem;
  max-width: 380px;
  line-height: 1.5;
}

.tarot-empty-prompt strong {
  color: #a78bfa;
}

/* 3D Cards Spread Row */
.tarot-cards-spread-row {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  width: 100%;
  flex-wrap: wrap;
}

.tarot-slot-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 160px;
}

.tarot-slot-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.tarot-slot-pos-badge {
  background: #8b5cf6;
  color: #ffffff;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 800;
}

.tarot-slot-pos-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #d1d5db;
  text-align: center;
}

/* 3D Flip Card Mechanism */
.tarot-card-3d-scene {
  width: 150px;
  height: 255px;
  perspective: 1000px;
  cursor: pointer;
}

.tarot-card-3d {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1);
  border-radius: 10px;
}

.tarot-card-3d.flipped {
  transform: rotateY(180deg);
}

.tarot-card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.tarot-card-back img,
.tarot-card-front img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.tarot-card-front {
  transform: rotateY(180deg);
  background: #000;
}

.tarot-card-front.is-reversed img {
  transform: rotateZ(180deg);
}

.tarot-reversed-badge {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(239, 68, 68, 0.88);
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 900;
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.tarot-card-touch-hint {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  color: #f3f4f6;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 12px;
  white-space: nowrap;
  pointer-events: none;
}

.tarot-slot-card-meta {
  margin-top: 8px;
  text-align: center;
}

.tarot-slot-card-meta.placeholder {
  opacity: 0.5;
}

.tarot-meta-name {
  font-size: 0.88rem;
  font-weight: 800;
  color: #f3f4f6;
}

.tarot-meta-sub {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 2px;
}

/* Report Section Styles */
.tarot-report-card {
  background: #181924;
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
}

.tarot-report-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 14px;
  margin-bottom: 20px;
}

.tarot-report-badge {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: #a78bfa;
  margin-bottom: 6px;
}

.tarot-report-title {
  margin: 0 0 8px;
  font-size: 1.35rem;
  color: #ffffff;
}

.tarot-report-meta {
  display: flex;
  gap: 8px;
  font-size: 0.82rem;
  color: #9ca3af;
  flex-wrap: wrap;
}

.tarot-section-box {
  background: #202234;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
}

.tarot-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.tarot-sec-icon {
  font-size: 1.15rem;
}

.tarot-sec-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #e5e7eb;
}

.tarot-macro-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

.tarot-macro-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(0, 0, 0, 0.2);
  padding: 10px 12px;
  border-radius: 8px;
}

.macro-label {
  font-size: 0.78rem;
  color: #9ca3af;
  font-weight: 600;
}

.macro-val {
  font-size: 0.88rem;
  color: #f3f4f6;
  font-weight: 700;
}

.macro-val.fate-verdict {
  color: #fbbf24;
}

.macro-val.elem-dominant {
  color: #ec4899;
}

.macro-val.flow-verdict {
  color: #34d399;
}

/* Dignities */
.tarot-dignities-box {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.dignities-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #a78bfa;
  margin-bottom: 8px;
}

.dignity-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.25);
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 6px;
  font-size: 0.82rem;
  flex-wrap: wrap;
}

.dignity-pair {
  color: #e5e7eb;
}

.dignity-badge {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}

.relation-Tương\\ sinh {
  background: #065f46;
  color: #6ee7b7;
}

.relation-Đồng\\ dạng {
  background: #1e3a8a;
  color: #93c5fd;
}

.relation-Tương\\ khắc {
  background: #7f1d1d;
  color: #fca5a5;
}

.relation-Trung\\ tính {
  background: #374151;
  color: #d1d5db;
}

.dignity-desc {
  color: #9ca3af;
}

/* Card Readings in Report */
.tarot-cards-reading-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tarot-card-reading-card {
  display: flex;
  gap: 16px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  padding: 14px;
}

.reading-card-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 90px;
  flex-shrink: 0;
}

.reading-card-thumb {
  width: 90px;
  height: 153px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.reading-card-thumb.is-reversed {
  transform: rotateZ(180deg);
}

.reading-card-orientation {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}

.reading-card-orientation.upright {
  background: #065f46;
  color: #6ee7b7;
}

.reading-card-orientation.reversed {
  background: #7f1d1d;
  color: #fca5a5;
}

.reading-card-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.reading-card-pos {
  font-size: 0.78rem;
  font-weight: 800;
  color: #a78bfa;
}

.reading-card-name {
  margin: 0;
  font-size: 1.1rem;
  color: #ffffff;
}

.reading-card-tags {
  display: flex;
  gap: 6px;
}

.tarot-tag {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
  background: rgba(139, 92, 246, 0.2);
  color: #c4b5fd;
}

.reading-card-keywords {
  font-size: 0.82rem;
  color: #d1d5db;
}

.reading-card-desc {
  font-size: 0.88rem;
  line-height: 1.5;
  color: #e5e7eb;
}

.reading-card-advice {
  font-size: 0.85rem;
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #fbbf24;
}

/* Prescription */
.tarot-prescription-box {
  border-left: 4px solid #8b5cf6;
}

.tarot-prescription-content blockquote {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.6;
  color: #f3f4f6;
}

.tarot-report-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
}

/* Encyclopedia Tab */
.tarot-encyclopedia-workspace {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tarot-ency-filter-bar {
  background: #181924;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tarot-ency-search input {
  width: 100%;
  box-sizing: border-box;
  background: #232538;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #ffffff;
  padding: 10px 14px;
  font-size: 0.92rem;
  outline: none;
}

.tarot-ency-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ency-filter-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #d1d5db;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.ency-filter-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.ency-filter-btn.active {
  background: #8b5cf6;
  color: #ffffff;
  border-color: #8b5cf6;
}

.tarot-ency-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 14px;
}

.tarot-ency-card-item {
  background: #181924;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
  display: flex;
  flex-direction: column;
}

.tarot-ency-card-item:hover {
  transform: translateY(-4px);
  border-color: #a78bfa;
}

.ency-card-img-wrap {
  width: 100%;
  aspect-ratio: 1 / 1.7;
  overflow: hidden;
  background: #000;
}

.ency-card-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ency-card-info {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ency-card-name-vi {
  font-size: 0.82rem;
  font-weight: 800;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ency-card-name-en {
  font-size: 0.72rem;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ency-card-tags {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.ency-tag {
  font-size: 0.65rem;
  background: rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
  padding: 1px 4px;
  border-radius: 4px;
}

/* Journal Tab */
.tarot-journal-workspace {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tarot-journal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #181924;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
}

.journal-title-box h3 {
  margin: 0 0 4px;
  font-size: 1.1rem;
  color: #ffffff;
}

.journal-subtitle {
  font-size: 0.78rem;
  color: #9ca3af;
}

.tarot-journal-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tarot-journal-item {
  background: #181924;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.journal-item-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.journal-item-date {
  font-size: 0.8rem;
  font-weight: 700;
  color: #a78bfa;
}

.journal-badge {
  font-size: 0.72rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.08);
  color: #d1d5db;
  padding: 2px 6px;
  border-radius: 4px;
}

.btn-delete-entry {
  margin-left: auto;
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 1rem;
  cursor: pointer;
}

.btn-delete-entry:hover {
  color: #ef4444;
}

.journal-item-question {
  font-size: 0.92rem;
  color: #ffffff;
}

.journal-item-cards-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.journal-mini-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60px;
}

.journal-mini-card img {
  width: 50px;
  height: 85px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.journal-mini-card img.is-reversed {
  transform: rotateZ(180deg);
}

.mini-name {
  font-size: 0.68rem;
  font-weight: 700;
  color: #d1d5db;
  text-align: center;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60px;
}

.mini-orient {
  font-size: 0.62rem;
  color: #9ca3af;
}

.journal-item-advice {
  font-size: 0.85rem;
  color: #fbbf24;
  line-height: 1.4;
}

.journal-item-actions {
  display: flex;
  justify-content: flex-end;
}

.tarot-journal-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
  background: #181924;
  border: 1px dashed rgba(255, 255, 255, 0.15);
  border-radius: 14px;
}

.journal-empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.tarot-journal-empty h3 {
  margin: 0 0 8px;
  color: #ffffff;
}

.tarot-journal-empty p {
  margin: 0;
  max-width: 400px;
  color: #9ca3af;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Modal Chi Tiết Lá Bài */
.tarot-modal-dialog {
  max-width: 680px;
  width: 90%;
  background: #1a1b2b;
  border: 1px solid rgba(139, 92, 246, 0.4);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.tarot-modal-content {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.tarot-modal-img-col {
  width: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.tarot-modal-img {
  width: 180px;
  height: 306px;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(139, 92, 246, 0.4);
}

.tarot-modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}

.tarot-modal-info-col {
  flex: 1 1 300px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tarot-modal-title {
  margin: 0;
  font-size: 1.4rem;
  color: #ffffff;
}

.tarot-modal-sub {
  font-size: 0.88rem;
  color: #a78bfa;
  font-weight: 700;
  margin-top: -4px;
}

.tarot-info-block h4 {
  margin: 0 0 4px;
  font-size: 0.82rem;
  font-weight: 800;
  color: #cbd5e1;
}

.tarot-info-block p {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.45;
  color: #e5e7eb;
}

.tarot-advice-block {
  background: rgba(251, 191, 36, 0.1);
  padding: 10px 14px;
  border-radius: 8px;
  border-left: 3px solid #fbbf24;
}

.tarot-advice-block h4 {
  color: #fbbf24;
}

/* ==========================================================================
   LIGHT THEME OVERRIDES FOR TAROT MODULE
   ========================================================================== */
body.theme-light .tarot-control-card,
body.theme-light .tarot-report-card,
body.theme-light .tarot-ency-filter-bar,
body.theme-light .tarot-ency-card-item,
body.theme-light .tarot-journal-header,
body.theme-light .tarot-journal-item,
body.theme-light .tarot-journal-empty,
body.theme-light .tarot-modal-dialog {
  background: #ffffff;
  border-color: #e5e7eb;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

body.theme-light .tarot-tabs {
  background: #f3f4f6;
  border-color: #e5e7eb;
}

body.theme-light .tarot-tab-btn {
  color: #4b5563;
}

body.theme-light .tarot-tab-btn:hover {
  background: #e5e7eb;
  color: #111827;
}

body.theme-light .tarot-tab-btn.active {
  background: #7c3aed;
  color: #ffffff;
}

body.theme-light .tarot-arena-table {
  background: radial-gradient(circle at center, #f5f3ff 0%, #ede9fe 100%);
  border-color: #ddd6fe;
}

body.theme-light .tarot-select,
body.theme-light .tarot-question-input,
body.theme-light .tarot-ency-search input {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #111827;
}

body.theme-light .tarot-control-group label {
  color: #6d28d9;
}

body.theme-light .tarot-switch-label {
  color: #374151;
}

body.theme-light .tarot-empty-prompt {
  color: #6b7280;
}

body.theme-light .tarot-empty-prompt strong {
  color: #6d28d9;
}

body.theme-light .tarot-slot-pos-title {
  color: #374151;
}

body.theme-light .tarot-meta-name {
  color: #111827;
}

body.theme-light .tarot-meta-sub {
  color: #6b7280;
}

body.theme-light .tarot-report-title,
body.theme-light .reading-card-name,
body.theme-light .ency-card-name-vi,
body.theme-light .journal-title-box h3,
body.theme-light .journal-item-question,
body.theme-light .tarot-journal-empty h3,
body.theme-light .tarot-modal-title {
  color: #111827;
}

body.theme-light .tarot-section-box {
  background: #f9fafb;
  border-color: #e5e7eb;
}

body.theme-light .tarot-sec-title {
  color: #1f2937;
}

body.theme-light .tarot-macro-item {
  background: #ffffff;
  border: 1px solid #e5e7eb;
}

body.theme-light .macro-val {
  color: #111827;
}

body.theme-light .tarot-card-reading-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
}

body.theme-light .reading-card-desc {
  color: #374151;
}

body.theme-light .reading-card-keywords {
  color: #4b5563;
}

body.theme-light .tarot-prescription-content blockquote {
  color: #1f2937;
}

body.theme-light .dignity-row {
  background: #ffffff;
  border: 1px solid #e5e7eb;
}

body.theme-light .dignity-pair {
  color: #1f2937;
}

body.theme-light .ency-filter-btn {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #374151;
}

body.theme-light .ency-filter-btn.active {
  background: #7c3aed;
  color: #ffffff;
  border-color: #7c3aed;
}

body.theme-light .tarot-info-block h4 {
  color: #374151;
}

body.theme-light .tarot-info-block p {
  color: #1f2937;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .tarot-module-wrapper {
    padding: 8px 10px 30px;
  }
  .tarot-cards-spread-row {
    gap: 12px;
  }
  .tarot-slot-wrapper {
    width: 100px;
  }
  .tarot-card-3d-scene {
    width: 95px;
    height: 161px;
  }
  .tarot-card-reading-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .reading-card-tags {
    justify-content: center;
  }
  .tarot-modal-content {
    flex-direction: column;
    align-items: center;
  }
}
"""

new_content = content + tarot_css
with open(r'c:\Books\Neta Light\styles.css', 'w', encoding='utf-8') as f:
    f.write(new_content)
print('Updated styles.css successfully!')

with open(r'c:\Books\Neta Light\mobile_app\assets\www\styles.css', 'w', encoding='utf-8') as f:
    f.write(new_content)
print('Updated mobile_app/assets/www/styles.css successfully!')
