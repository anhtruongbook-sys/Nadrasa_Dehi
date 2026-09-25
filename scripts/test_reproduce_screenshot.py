import sys
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.on('console', lambda msg: sys.stdout.buffer.write(f"PAGE LOG: {msg.text}\n".encode('utf-8', errors='replace')))
    page.goto('http://127.0.0.1:8080')
    page.wait_for_timeout(2000)
    
    # 1. Test Tarot
    print("Testing Tarot...")
    page.evaluate("window.switchDeckMode('tarot')")
    page.wait_for_timeout(1000)
    
    page.click('#btn-tarot-quick-draw')
    page.wait_for_timeout(1000)
    page.click('#btn-tarot-flip-all')
    page.wait_for_timeout(1000)
    
    page.click('#btn-screenshot-header')
    page.wait_for_timeout(3000)
    
    toasts = page.query_selector_all('.toast')
    for t in toasts:
        sys.stdout.buffer.write(f"TAROT TOAST: {t.inner_text()}\n".encode('utf-8', errors='replace'))
    
    page.screenshot(path='tarot_screenshot_test.png')

    # 2. Test La Kinh
    print("Testing La Kinh...")
    page.evaluate("window.switchDeckMode('lakinh')")
    page.wait_for_timeout(2000)
    
    page.click('#btn-screenshot-header')
    page.wait_for_timeout(3000)
    
    toasts = page.query_selector_all('.toast')
    for t in toasts:
        sys.stdout.buffer.write(f"LAKINH TOAST: {t.inner_text()}\n".encode('utf-8', errors='replace'))
    
    page.screenshot(path='lakinh_screenshot_test.png')
    browser.close()
