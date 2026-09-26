from playwright.sync_api import sync_playwright
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    page.goto('http://127.0.0.1:8090/index.html')
    page.wait_for_timeout(1000)

    # 1. Test La Kinh & Phi Tinh
    print("Opening La Kinh...")
    page.locator('#tab-mode-lakinh').click()
    page.wait_for_timeout(1200)
    page.screenshot(path=r'C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_lakinh_view.png')
    print("La Kinh captured successfully!")

    # 2. Test Tu Vi
    print("Opening Tu Vi...")
    page.locator('#tab-mode-tuvi').click()
    page.wait_for_timeout(1200)
    page.screenshot(path=r'C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_tuvi_view.png')
    print("Tu Vi captured successfully!")

    # 3. Test Bazi
    print("Opening Bazi...")
    page.locator('#tab-mode-bazi').click()
    page.wait_for_timeout(1000)
    page.screenshot(path=r'C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_bazi_view.png')
    print("Bazi captured successfully!")

    browser.close()
    print("All modules verified!")
