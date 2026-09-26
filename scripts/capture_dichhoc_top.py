from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    page.goto('http://127.0.0.1:8090/index.html')
    page.wait_for_timeout(1000)
    page.evaluate("() => { document.body.classList.remove('theme-dark'); document.body.classList.add('theme-light'); localStorage.setItem('neta_theme', 'light'); }")
    page.evaluate("() => document.getElementById('tab-mode-dichhoc').click()")
    page.wait_for_timeout(1000)
    page.screenshot(path=r'C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_dichhoc_top_optimized.png')
    browser.close()
    print("Dich Hoc top captured successfully!")
