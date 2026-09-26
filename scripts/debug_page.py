from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    page = b.new_page()
    page.on('console', lambda m: print('CONSOLE:', m.text))
    page.on('pageerror', lambda e: print('PAGEERROR:', e))
    page.goto('http://127.0.0.1:8088/index.html')
    page.wait_for_load_state('networkidle')
    page.evaluate("() => { window.switchAppMode('dichhoc'); }")
    b.close()
