import os
import sys
from playwright.sync_api import sync_playwright

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 390, "height": 844})
        page.goto('http://127.0.0.1:8080')
        page.wait_for_timeout(400)
        
        # 1. Switch to Light Theme
        page.evaluate("() => { if (window.applyTheme) window.applyTheme('light', false); }")
        page.wait_for_timeout(300)
        
        # 2. Check Calendar View
        page.evaluate("() => { if (window.switchAppMode) window.switchAppMode('calendar'); }")
        page.wait_for_timeout(500)
        
        os.makedirs('scripts/test_results', exist_ok=True)
        page.screenshot(path='scripts/test_results/test_calendar_light_contrast.png')
        print("[SUCCESS] Calendar Light Theme screenshot saved to scripts/test_results/test_calendar_light_contrast.png")
        
        # Check duplicate snap buttons
        snap_buttons = page.locator('button:has-text("📸 Chụp")').count()
        print("Duplicate snap buttons count in calendar:", snap_buttons)
        assert snap_buttons == 0, f"Found {snap_buttons} duplicate snap buttons in calendar!"
        
        # Test Screenshot trigger in Calendar
        page.click('#btn-screenshot-header')
        page.wait_for_timeout(1200)
        
        modal_visible = page.is_visible('#screenshot-modal')
        img_src_len = page.evaluate('() => (document.getElementById("screenshot-preview-img") || {}).src ? document.getElementById("screenshot-preview-img").src.length : 0')
        print("Calendar Screenshot Modal visible:", modal_visible, "Img data length:", img_src_len)
        assert modal_visible and img_src_len > 1000, "Screenshot modal failed in Calendar!"
        
        page.screenshot(path='scripts/test_results/test_calendar_screenshot_modal.png')
        print("[SUCCESS] Calendar Screenshot Modal captured!")
        
        page.click('#screenshot-close-btn')
        page.wait_for_timeout(300)
        
        # 3. Check Tu Vi View
        page.evaluate("() => { if (window.switchAppMode) window.switchAppMode('tuvi'); }")
        page.wait_for_timeout(500)
        
        tuvi_snap = page.locator('button:has-text("📸 Chụp")').count()
        print("Duplicate snap buttons in Tu Vi:", tuvi_snap)
        assert tuvi_snap == 0, f"Found {tuvi_snap} duplicate snap buttons in Tu Vi!"
        
        page.click('#btn-screenshot-header')
        page.wait_for_timeout(1200)
        tuvi_modal = page.is_visible('#screenshot-modal')
        tuvi_img_len = page.evaluate('() => (document.getElementById("screenshot-preview-img") || {}).src ? document.getElementById("screenshot-preview-img").src.length : 0')
        print("Tu Vi Screenshot Modal visible:", tuvi_modal, "Img data length:", tuvi_img_len)
        assert tuvi_modal and tuvi_img_len > 1000, "Screenshot modal failed in Tu Vi!"
        
        page.screenshot(path='scripts/test_results/test_tuvi_screenshot_modal.png')
        print("[SUCCESS] Tu Vi Screenshot Modal captured!")
        
        page.click('#screenshot-close-btn')
        page.wait_for_timeout(300)
        
        # 4. Check Bazi View
        page.evaluate("() => { if (window.switchAppMode) window.switchAppMode('bazi'); }")
        page.wait_for_timeout(500)
        bazi_snap = page.locator('button:has-text("📸 Chụp")').count()
        print("Duplicate snap buttons in Bazi:", bazi_snap)
        assert bazi_snap == 0, f"Found {bazi_snap} duplicate snap buttons in Bazi!"
        
        # 5. Check QMDJ View
        page.evaluate("() => { if (window.switchAppMode) window.switchAppMode('qmdj'); }")
        page.wait_for_timeout(500)
        qmdj_snap = page.locator('button:has-text("📸 Chụp")').count()
        print("Duplicate snap buttons in QMDJ:", qmdj_snap)
        assert qmdj_snap == 0, f"Found {qmdj_snap} duplicate snap buttons in QMDJ!"
        
        print("=" * 60)
        print("ALL VERIFICATION CHECKS PASSED 100%!")
        print("=" * 60)
        browser.close()

if __name__ == '__main__':
    run_tests()
