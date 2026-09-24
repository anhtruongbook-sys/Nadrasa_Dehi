import os
import re

print("Starting fixes for 4 Tarot user issues...")

tarot_view_path = r"c:\Books\Neta Light\modules\tarot_view.js"
with open(tarot_view_path, "r", encoding="utf-8") as f:
    view_code = f.read()

# -------------------------------------------------------------
# 1. Haptic Setting: Default FALSE (OFF)
# -------------------------------------------------------------
haptic_state_search = r"(let encySearchQuery = '';)"
haptic_state_replace = """let encySearchQuery = '';
  let hapticEnabled = localStorage.getItem('neta_tarot_haptic') === 'true'; // MẶC ĐỊNH TẮT (FALSE)"""

if "let hapticEnabled" not in view_code:
    view_code = view_code.replace("let encySearchQuery = '';", haptic_state_replace, 1)
    print("[1] Added hapticEnabled state (default false).")

# Update triggerHaptic to check if (!hapticEnabled) return;
old_trigger_haptic = """  function triggerHaptic(duration = 15) {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(duration);
      }
    } catch (e) {}
  }"""

new_trigger_haptic = """  function triggerHaptic(duration = 15) {
    if (!hapticEnabled) return; // MẶC ĐỊNH TẮT, CHỈ CHẠY KHI NGƯỜI DÙNG BẬT
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(duration);
      }
    } catch (e) {}
  }"""

if old_trigger_haptic in view_code:
    view_code = view_code.replace(old_trigger_haptic, new_trigger_haptic, 1)
    print("[2] Updated triggerHaptic to respect hapticEnabled.")

# -------------------------------------------------------------
# 2. Markdown Formatter Helper
# -------------------------------------------------------------
markdown_helper = """  function formatMarkdownInline(str) {
    if (!str) return '';
    return str
      .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
      .replace(/\\*([^\\*\\n]+?)\\*/g, '<em>$1</em>');
  }
"""

if "function formatMarkdownInline" not in view_code:
    view_code = view_code.replace("  function escapeHTML(str) {", markdown_helper + "\n  function escapeHTML(str) {", 1)
    print("[3] Added formatMarkdownInline helper.")

# -------------------------------------------------------------
# 3. Compact 3 Tabs (No overflow on mobile)
# -------------------------------------------------------------
old_tabs_html = """          <div class="tarot-tabs">
            <button class="tarot-tab-btn ${currentSubTab === 'spread' ? 'active' : ''}" data-tab="spread">
              🔮 Trải Bài (Spread)
            </button>
            <button class="tarot-tab-btn ${currentSubTab === 'encyclopedia' ? 'active' : ''}" data-tab="encyclopedia">
              📖 Bách Khoa 78 Lá
            </button>
            <button class="tarot-tab-btn ${currentSubTab === 'journal' ? 'active' : ''}" data-tab="journal">
              📔 Nhật Ký (${getJournal().length})
            </button>
          </div>"""

new_tabs_html = """          <div class="tarot-tabs">
            <button class="tarot-tab-btn ${currentSubTab === 'spread' ? 'active' : ''}" data-tab="spread">
              🔮 Trải Bài
            </button>
            <button class="tarot-tab-btn ${currentSubTab === 'encyclopedia' ? 'active' : ''}" data-tab="encyclopedia">
              📖 Bách Khoa
            </button>
            <button class="tarot-tab-btn ${currentSubTab === 'journal' ? 'active' : ''}" data-tab="journal">
              📔 Nhật Ký
            </button>
          </div>"""

if old_tabs_html in view_code:
    view_code = view_code.replace(old_tabs_html, new_tabs_html, 1)
    print("[4] Compacted 3 tab buttons.")

# -------------------------------------------------------------
# 4. Add Haptic Checkbox to Control Row
# -------------------------------------------------------------
old_checkbox_row = """            <div class="tarot-control-group tarot-checkbox-group">
              <label class="tarot-switch-label">
                <input type="checkbox" id="tarot-allow-reversed" ${allowReversed ? 'checked' : ''}>
                <span class="tarot-switch-text">Cho phép lá ngược (Reversed)</span>
              </label>
            </div>"""

new_checkbox_row = """            <div class="tarot-control-group tarot-checkbox-group">
              <label class="tarot-switch-label">
                <input type="checkbox" id="tarot-allow-reversed" ${allowReversed ? 'checked' : ''}>
                <span class="tarot-switch-text">Cho phép lá ngược</span>
              </label>
              <label class="tarot-switch-label" title="Chế độ rung phản hồi (mặc định tắt)">
                <input type="checkbox" id="tarot-toggle-haptic" ${hapticEnabled ? 'checked' : ''}>
                <span class="tarot-switch-text">📳 Rung (Haptic)</span>
              </label>
            </div>"""

if old_checkbox_row in view_code:
    view_code = view_code.replace(old_checkbox_row, new_checkbox_row, 1)
    print("[5] Added Haptic toggle to control row.")

# -------------------------------------------------------------
# 5. Format Markdown in Storyline Narrative, Lessons & Advice
# -------------------------------------------------------------
view_code = view_code.replace(
    "<blockquote>${report.synthesizedStory}</blockquote>",
    "<blockquote>${formatMarkdownInline(report.synthesizedStory)}</blockquote>"
)
view_code = view_code.replace(
    "<p>${report.quintessence.lesson}</p>",
    "<p>${formatMarkdownInline(report.quintessence.lesson)}</p>"
)
view_code = view_code.replace(
    "<blockquote>${report.finalAdvice}</blockquote>",
    "<blockquote>${formatMarkdownInline(report.finalAdvice)}</blockquote>"
)
view_code = view_code.replace(
    '<div class="pattern-desc">${p.desc}</div>',
    '<div class="pattern-desc">${formatMarkdownInline(p.desc)}</div>'
)
view_code = view_code.replace(
    "<strong>Lời khuyên:</strong> ${entry.finalAdvice}",
    "<strong>Lời khuyên:</strong> ${formatMarkdownInline(entry.finalAdvice)}"
)
print("[6] Replaced markdown text with formatMarkdownInline.")

# -------------------------------------------------------------
# 6. Bind Haptic Checkbox Change Event
# -------------------------------------------------------------
haptic_event_code = """    // Haptic Setting Toggle Event
    const hapticToggle = container.querySelector('#tarot-toggle-haptic');
    if (hapticToggle) {
      hapticToggle.addEventListener('change', (e) => {
        hapticEnabled = e.target.checked;
        localStorage.setItem('neta_tarot_haptic', hapticEnabled ? 'true' : 'false');
        if (hapticEnabled) {
          if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(25);
          if (typeof window.showToast === 'function') {
            window.showToast('📳 Đã BẬT rung phản hồi');
          }
        } else {
          if (typeof window.showToast === 'function') {
            window.showToast('🔕 Đã TẮT rung phản hồi');
          }
        }
      });
    }
"""

if "const hapticToggle" not in view_code:
    view_code = view_code.replace("    // 3. Draw cards", haptic_event_code + "\n    // 3. Draw cards", 1)
    print("[7] Bound Haptic toggle event.")

with open(tarot_view_path, "w", encoding="utf-8") as f:
    f.write(view_code)

print("Saved modules/tarot_view.js successfully!")
