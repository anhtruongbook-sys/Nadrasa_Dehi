import sys
import time
import re
from playwright.sync_api import sync_playwright

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

USER_TEST_KEY = "AQ.Ab8RN6JoUusmJl5NsQAT9lkjvKlXFQKrqVIodthxq3wTn959_g"

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 900})
        page = context.new_page()
        page.on("console", lambda msg: print(f"[BROWSER CONSOLE {msg.type}]: {msg.text}"))
        page.on("pageerror", lambda err: print(f"[BROWSER ERROR]: {err}"))

        print("1. Loading http://127.0.0.1:8090/ ...")
        page.goto("http://127.0.0.1:8090/", wait_until="networkidle")

        # Clear any existing stored keys from previous tests
        page.evaluate("() => { localStorage.removeItem('__neta_synth_enc_token'); localStorage.removeItem('__neta_deep_synth_enabled'); }")

        # Switch to Tarot module
        print("2. Switching to Tarot module...")
        page.evaluate("""
            () => {
                if (typeof window.switchAppMode === 'function') {
                    window.switchAppMode('tarot');
                } else {
                    const btn = document.getElementById('tab-mode-tarot');
                    if (btn) btn.click();
                }
            }
        """)
        time.sleep(1)

        # Verify NO visible "Luận giải Chiều sâu" switch or gear icon on the main interface
        print("3. Verifying that 'Luận giải Chiều sâu' is NOT displayed on the main UI...")
        chk_deep = page.locator("#tarot-toggle-deep-synth")
        assert chk_deep.count() == 0, "Error: 'tarot-toggle-deep-synth' must NOT be visible on the main screen!"
        
        gear_icon = page.locator("#btn-tarot-open-key-config")
        assert gear_icon.count() == 0, "Error: Gear icon 'btn-tarot-open-key-config' must NOT be on main screen!"

        checkboxes = page.locator(".tarot-checkbox-group label")
        print(f"Main control checkboxes count: {checkboxes.count()}")
        assert checkboxes.count() == 2, f"Expected exactly 2 switches (allow reversed & haptic), found {checkboxes.count()}"

        # Verify secret trigger exists
        print("4. Checking secret trigger glyph ✦ ...")
        secret_glyph = page.locator("#tarot-secret-trigger")
        assert secret_glyph.count() > 0, "Secret trigger glyph ✦ not found"

        # Click secret trigger to open modal
        print("5. Clicking secret trigger glyph ✦ to open modal...")
        secret_glyph.click()
        time.sleep(0.5)

        modal = page.locator("#tarot-key-config-modal")
        assert modal.is_visible(), "Modal should open when clicking secret glyph ✦"
        print("Modal successfully opened via discreet glyph!")

        # Verify elements inside modal
        deep_toggle = page.locator("#modal-deep-synth-toggle")
        assert deep_toggle.count() > 0, "Deep synth toggle inside modal not found"
        assert not deep_toggle.is_checked(), "Deep synth toggle should be unchecked by default when no key is set"

        paste_btn = page.locator("#btn-tarot-paste-key")
        assert paste_btn.count() > 0, "Paste button not found in modal"

        eye_btn = page.locator("#btn-tarot-toggle-eye")
        assert eye_btn.count() > 0, "Eye visibility toggle button not found in modal"

        key_input = page.locator("#tarot-custom-key-input")
        assert key_input.count() > 0, "Key input not found in modal"

        # Check CSS user-select on key_input
        user_select = key_input.evaluate("el => window.getComputedStyle(el).userSelect")
        print(f"Key input user-select: '{user_select}' (must NOT be 'none')")
        assert user_select != 'none', "Key input must not block user-select!"

        # Input custom key and toggle deep synthesis ON
        print("6. Inputting custom key, enabling toggle and saving...")
        key_input.fill(USER_TEST_KEY)
        deep_toggle.check(force=True)
        time.sleep(0.3)
        page.click("#btn-tarot-save-key")
        time.sleep(1)

        # Verify key is saved and feature is now enabled
        has_key_now = page.evaluate("() => window.NetaGeminiService.hasActiveKey()")
        is_enabled = page.evaluate("() => window.NetaGeminiService.isDeepSynthesisEnabled()")
        print(f"Key saved: hasActiveKey = {has_key_now}, isDeepSynthesisEnabled = {is_enabled}")
        assert has_key_now, "Key should now be saved"
        assert is_enabled, "Deep synthesis should now be enabled"

        # Test custom question reading
        print("7. Performing Tarot spread reading with custom key and question...")
        custom_q = "Dự án hợp tác công nghệ sắp tới của tôi có triển vọng thành công không?"
        q_input = page.locator("#tarot-question-input")
        q_input.fill(custom_q)
        time.sleep(0.3)

        page.click("#btn-tarot-quick-draw")
        time.sleep(0.5)
        page.click("#btn-tarot-flip-all")
        time.sleep(0.5)

        # Check for deep section loading or rendered
        print("8. Waiting for deep synthesis section to process...")
        deep_box = page.locator("#tarot-deep-section-box")
        assert deep_box.count() > 0, "Deep synthesis section should appear when enabled"

        # Wait up to 25s for synthesis completion
        for _ in range(25):
            content = page.locator("#tarot-deep-body-content").inner_text()
            if "Đang kết nối" not in content and len(content.strip()) > 30:
                print("Deep synthesis finished processing!")
                break
            time.sleep(1)

        final_text = page.locator("#tarot-deep-body-content").inner_text()
        print(f"Synthesis result preview: {final_text[:160]}...")

        # Strict checks: No AI terms allowed
        forbidden = ["AI", "Gemini", "mô hình ngôn ngữ", "trí tuệ nhân tạo", "LLM", "Google"]
        for word in forbidden:
            assert not re.search(r'\b' + re.escape(word) + r'\b', final_text, re.IGNORECASE), f"Forbidden word '{word}' found in output!"

        print("Zero AI leakage check passed!")

        # Screenshot modal when reopened
        print("9. Reopening secret modal to verify saved key status...")
        secret_glyph = page.locator("#tarot-secret-trigger")
        secret_glyph.click()
        time.sleep(0.5)
        page.screenshot(path="artifacts/tarot_secret_modal_redesigned.png")
        print("Screenshot saved to artifacts/tarot_secret_modal_redesigned.png")

        print("=== ALL TESTS PASSED SUCCESSFULLY! ===")
        browser.close()

if __name__ == "__main__":
    run_test()
