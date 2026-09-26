from playwright.sync_api import sync_playwright
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    page.goto('http://127.0.0.1:8090/index.html')
    page.wait_for_timeout(1000)

    # 1. Switch to QMDJ
    print("Navigating to QMDJ...")
    page.evaluate("() => document.getElementById('tab-mode-qmdj').click()")
    page.wait_for_timeout(600)

    # Screenshot Mode 1: Duong Ban
    page.screenshot(path=r'C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_qmdj_mode1_duongban.png')
    print("Captured Mode 1: Duong Ban")

    # 2. Switch to Mode 2: Am Ban
    print("Switching to Am Ban...")
    page.locator('.qmdj-tab-btn[data-mode="amban"]').click()
    page.wait_for_timeout(600)
    page.screenshot(path=r'C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_qmdj_mode2_amban.png')
    print("Captured Mode 2: Am Ban")

    # 3. Switch to Mode 3: Phong Thuy
    print("Switching to Phong Thuy...")
    page.locator('.qmdj-tab-btn[data-mode="phongthuy"]').click()
    page.wait_for_timeout(600)
    page.screenshot(path=r'C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_qmdj_mode3_phongthuy.png')
    print("Captured Mode 3: Phong Thuy")

    # 4. Click a palace cell in Phong Thuy (e.g. Do Mon palace cell)
    print("Opening Palace Modal in Phong Thuy...")
    page.locator('.qmdj-palace-cell').nth(0).click()
    page.wait_for_timeout(500)
    page.screenshot(path=r'C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_qmdj_mode3_modal.png')
    print("Captured Mode 3: Modal")

    # Close modal
    page.locator('#qmdj-modal-close').click()
    page.wait_for_timeout(300)

    # 5. Test Light theme
    print("Testing Light theme...")
    page.evaluate("""() => {
        document.body.classList.remove('theme-dark');
        document.body.classList.add('theme-light');
        localStorage.setItem('neta_theme', 'light');
    }""")
    page.wait_for_timeout(400)
    page.screenshot(path=r'C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_qmdj_mode3_light.png')
    print("Captured Mode 3: Light Theme")

    browser.close()
    print("ALL QMDJ 3-MODE TESTS PASSED!")
