from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    
    # 1. Desktop Test
    page_desktop = browser.new_page(viewport={'width': 1080, 'height': 1200})
    page_desktop.goto('http://127.0.0.1:8088/index.html')
    page_desktop.wait_for_load_state('networkidle')
    time.sleep(1)
    page_desktop.evaluate("() => { if (window.switchAppMode) window.switchAppMode('dichhoc'); }")
    time.sleep(2.5)
    page_desktop.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\dichhoc_clean_desktop.png', full_page=True)
    print('Desktop clean screenshot saved!')

    # 2. Mobile Test (390x844 iPhone 14 / Pixel)
    page_mobile = browser.new_page(viewport={'width': 390, 'height': 844})
    page_mobile.goto('http://127.0.0.1:8088/index.html')
    page_mobile.wait_for_load_state('networkidle')
    time.sleep(1)
    page_mobile.evaluate("() => { if (window.switchAppMode) window.switchAppMode('dichhoc'); }")
    time.sleep(2.5)
    page_mobile.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\dichhoc_clean_mobile.png', full_page=True)
    print('Mobile clean screenshot saved!')

    # 3. Mobile Scrolled Test (to verify bottom Yao rows H4..H1)
    page_mobile.evaluate("() => { const v = document.getElementById('view-dichhoc'); if (v) v.scrollTop = 480; }")
    time.sleep(0.5)
    page_mobile.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\dichhoc_clean_mobile_scrolled.png')
    print('Mobile scrolled clean screenshot saved!')

    # 4. Mobile Mai Hoa Test
    page_mobile.evaluate("() => { const v = document.getElementById('view-dichhoc'); if (v) v.scrollTop = 0; }")
    page_mobile.click('#dh-tab-maihoa')
    time.sleep(2.5)
    page_mobile.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\dichhoc_clean_maihoa_mobile.png', full_page=True)
    print('Mai Hoa clean screenshot saved!')

    browser.close()
