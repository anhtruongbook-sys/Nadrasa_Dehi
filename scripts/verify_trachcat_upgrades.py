import time
from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile viewport matching user's phone
        context = browser.new_context(viewport={'width': 390, 'height': 844})
        page = context.new_page()

        print("Navigating to http://localhost:8090/...")
        page.goto('http://localhost:8090/', wait_until='networkidle')
        time.sleep(1)

        # 1. Switch to theme-light
        page.evaluate("""
            document.body.classList.add('theme-light');
            if (window.switchAppMode) {
                window.switchAppMode('trachcat');
            }
        """)
        time.sleep(1)

        # Screenshot top view of Trach Cat in Light Theme
        page.screenshot(path='C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/test_trachcat_v222_top_light.png')
        print("Captured test_trachcat_v222_top_light.png")

        # 2. Test click "🏗️ Động Thổ"
        page.click('.tc-quick-pill[data-task-id="MUC_05"]')
        time.sleep(0.5)

        # 3. Test click "🧭 Lấy Tọa Từ La Kinh"
        page.evaluate("""
            if (window.lakinhState) {
                window.lakinhState.rotation = 45; // Hướng Đông Bắc 45° -> Tọa Tây Nam 225° (Khôn)
            }
        """)
        page.click('#tc-btn-get-lakinh')
        time.sleep(0.5)

        # Screenshot after clicking Động Thổ and Lấy Tọa
        page.screenshot(path='C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/test_trachcat_v222_dongtho_lakinh.png')
        print("Captured test_trachcat_v222_dongtho_lakinh.png")

        # 4. Scroll down to inspect Day Cards, 6 Giờ Hoàng Đạo, and Action Buttons
        page.evaluate("""
            const el = document.getElementById('view-trachcat');
            if (el) el.scrollTop = 550;
        """)
        time.sleep(0.5)

        page.screenshot(path='C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/test_trachcat_v222_cards_contrast.png')
        print("Captured test_trachcat_v222_cards_contrast.png")

        # 5. Test click "🏠 Cất Nóc"
        page.evaluate("""
            const el = document.getElementById('view-trachcat');
            if (el) el.scrollTop = 0;
        """)
        time.sleep(0.3)
        page.click('.tc-quick-pill[data-task-id="MUC_04"]')
        time.sleep(0.5)
        page.screenshot(path='C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/test_trachcat_v222_catnoc.png')
        print("Captured test_trachcat_v222_catnoc.png")

        # 6. Test click "🏡 Nhập Trạch"
        page.click('.tc-quick-pill[data-task-id="MUC_15"]')
        time.sleep(0.5)
        page.screenshot(path='C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/test_trachcat_v222_nhaptrach.png')
        print("Captured test_trachcat_v222_nhaptrach.png")

        browser.close()
        print("All tests completed successfully!")

if __name__ == '__main__':
    verify()
