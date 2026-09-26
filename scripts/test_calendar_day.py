from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    page.goto('http://127.0.0.1:8090/index.html')
    page.wait_for_timeout(1000)

    # Switch to calendar and click "Ngày" or "Chi tiết ngày"
    page.evaluate("() => switchDeckMode('calendar')")
    page.wait_for_timeout(500)
    page.evaluate("() => { const btn = document.querySelector('.btn-view-day') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Chi tiết ngày') || b.innerText.includes('Ngày')); if(btn) btn.click(); }")
    page.wait_for_timeout(600)
    page.screenshot(path='C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_calendar_day_mansion.png')
    browser.close()
    print("Done calendar day mansion check!")
