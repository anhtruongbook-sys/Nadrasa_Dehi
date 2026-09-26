from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    page.goto('http://127.0.0.1:8090/index.html')
    page.wait_for_timeout(1000)

    page.evaluate("() => switchDeckMode('lakinh')")
    page.wait_for_timeout(800)

    page.evaluate("""() => {
        window.NetaLaKinhView.updateRotation(0.0);
        window.NetaLaKinhView.openHuyenKhongModal(9);
    }""")
    page.wait_for_timeout(500)

    # Change to Van 8
    print("Selecting Period 8...")
    page.select_option('#hk-period-select', '8')
    page.wait_for_timeout(600)
    page.screenshot(path='C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_hk_period_8.png')

    card_text = page.evaluate("() => document.querySelector('.lakinh-hk-header-card')?.innerText")
    print("Period 8 Card text:\n", card_text)

    browser.close()
    print("Period switch check passed!")
