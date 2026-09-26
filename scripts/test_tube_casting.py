from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    
    # 1. Test Mobile (390x844 - iPhone / Pixel standard)
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    page.goto('http://127.0.0.1:8088/index.html')
    page.wait_for_load_state('networkidle')
    time.sleep(1)

    # Switch to Dịch Học mode
    page.evaluate("() => { if (window.switchAppMode) window.switchAppMode('dichhoc'); }")
    time.sleep(2)

    # Capture initial casting view (0/6 cast)
    page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\dichhoc_tube_initial.png')
    print('Initial casting view saved!')

    # Cast Hào 1 by tapping the Ống Quẻ directly!
    page.click('#dh-interactive-tube')
    time.sleep(1)

    # Cast Hào 2 by tapping the button
    page.click('#dh-btn-cast-step')
    time.sleep(1)

    # Capture midway view (2/6 cast)
    page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\dichhoc_tube_midway.png')
    print('Midway casting view saved!')

    # Cast remaining 4 haos
    for _ in range(4):
        page.click('#dh-btn-cast-step')
        time.sleep(0.8)

    time.sleep(1.5)

    # Capture completed divination view in Dark Mode
    page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\dichhoc_completed_dark.png')
    
    # Scroll down to see Bảng I & Bảng II
    page.evaluate("() => { const v = document.getElementById('view-dichhoc'); if (v) v.scrollTop = 580; }")
    time.sleep(0.5)
    page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\dichhoc_completed_tables_dark.png')
    print('Completed Dark view saved!')

    # 2. Test Light Theme Mode (User's device theme from Image 1)
    page.evaluate("() => { document.body.classList.add('theme-light'); }")
    time.sleep(0.5)
    page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\dichhoc_completed_tables_light.png')
    
    # Scroll back to top in Light Theme
    page.evaluate("() => { const v = document.getElementById('view-dichhoc'); if (v) v.scrollTop = 0; }")
    time.sleep(0.5)
    page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\dichhoc_completed_top_light.png')
    print('Completed Light view saved!')

    browser.close()
