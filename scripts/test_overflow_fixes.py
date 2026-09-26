from playwright.sync_api import sync_playwright
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    # Mobile viewport matching user's phone (approx 360x800 or 390x844)
    page = browser.new_page(viewport={"width": 360, "height": 780})
    page.goto("http://127.0.0.1:8090/index.html")
    page.wait_for_timeout(1000)

    # 1. TEST QMDJ PHONG THỦY MODE
    print("Testing QMDJ Phong Thủy mode...")
    page.evaluate("() => switchDeckMode('qmdj')")
    page.wait_for_timeout(1000)

    # Click tab Phong Thủy
    page.click("button[data-mode='phongthuy']")
    page.wait_for_timeout(1000)

    # Select Can 6 and Son Thin like user's screenshot
    page.select_option("#pt-select-huong", "6")
    page.select_option("#pt-select-cua", "Thìn")
    page.click("#btn-pt-submit")
    page.wait_for_timeout(800)

    # Capture QMDJ screenshot
    page.screenshot(path="C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_qmdj_fixed.png")
    print("Saved verify_qmdj_fixed.png")

    # 2. TEST TỬ VI ĐẨU SỐ MODE
    print("Testing Tử Vi mode...")
    page.evaluate("() => switchDeckMode('tuvi')")
    page.wait_for_timeout(1000)

    # Capture top of Tử Vi
    page.screenshot(path="C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_tuvi_top_fixed.png")
    print("Saved verify_tuvi_top_fixed.png")

    # Scroll down to bottom of Tử Vi
    page.evaluate("() => { const c = document.querySelector('.tuvi-view-container'); if (c) c.scrollTop = c.scrollHeight; }")
    page.wait_for_timeout(500)
    page.screenshot(path="C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_tuvi_bottom_fixed.png")
    print("Saved verify_tuvi_bottom_fixed.png")

    browser.close()
    print("Done capturing verification screenshots!")
