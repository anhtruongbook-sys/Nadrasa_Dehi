import os

css_addition = '''
/* ================= MOBILE-FIRST MODAL & PICKER STYLES ================= */
.ph-modal-mobile {
  max-height: 88vh;
  display: flex;
  flex-direction: column;
}

.ph-modal-mobile .ph-modal-body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 16px 20px;
}

.ph-picker-actions-row {
  display: flex;
  gap: 12px;
  width: 100%;
  margin: 6px 0 10px 0;
}

.ph-mobile-pick-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 10px;
  border-radius: 14px;
  cursor: pointer;
  user-select: none;
  background: rgba(212, 175, 55, 0.08);
  border: 1.5px solid rgba(212, 175, 55, 0.4);
  color: #f8fafc;
  text-align: center;
  transition: transform 0.15s, background 0.2s, border-color 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.ph-mobile-pick-btn:active {
  transform: scale(0.96);
  background: rgba(212, 175, 55, 0.2);
}

.ph-pick-icon {
  font-size: 28px;
  line-height: 1;
  margin-bottom: 6px;
}

.ph-pick-title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.ph-label-sub {
  font-size: 12px;
  font-weight: 400;
  opacity: 0.7;
}

.ph-sticky-footer {
  position: sticky;
  bottom: 0;
  z-index: 10;
  background: #180509;
  border-top: 1px solid rgba(212, 175, 55, 0.25);
  box-shadow: 0 -6px 16px rgba(0, 0, 0, 0.35);
  padding: 14px 20px;
}

body.theme-light .ph-mobile-pick-btn {
  background: #ffffff !important;
  border: 1.5px solid #c9a96e !important;
  color: #47260e !important;
  box-shadow: 0 4px 12px rgba(90, 50, 20, 0.08) !important;
}

body.theme-light .ph-mobile-pick-btn:active {
  background: #fdf6ec !important;
}

body.theme-light .ph-sticky-footer {
  background: #fdfaf5 !important;
  border-top: 1px solid #ede3d3 !important;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.06) !important;
}
'''

for proj in [r'c:\Books\Neta Light', r'c:\Books\Neta Trio']:
    fpath = os.path.join(proj, 'phap_hanh.css')
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    if '.ph-picker-actions-row' not in content:
        content += '\n' + css_addition

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Updated {fpath}')

