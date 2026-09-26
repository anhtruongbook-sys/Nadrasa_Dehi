from playwright.sync_api import sync_playwright
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    page.goto('http://127.0.0.1:8090/index.html')
    page.wait_for_timeout(1000)

    modes = ['lakinh', 'tuvi', 'bazi', 'dichhoc', 'tarot', 'calendar', 'phaphanh']
    for m in modes:
        print(f"Switching to mode: {m}...")
        page.evaluate(f"() => switchDeckMode('{m}')")
        page.wait_for_timeout(800)
        page.screenshot(path=f'C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_mode_{m}.png')
        print(f"  Mode {m} OK!")

    browser.close()
    print("ALL MODULE CHECKS PASSED!")
