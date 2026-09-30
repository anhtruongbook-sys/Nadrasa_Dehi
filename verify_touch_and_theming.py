import os
import sys
import time
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile viewport standard iPhone / Galaxy
        context = browser.new_context(
            viewport={"width": 390, "height": 844},
            user_agent="Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36"
        )
        page = context.new_page()

        console_logs = []
        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))

        # Navigate to local server
        url = "http://localhost:8090/index.html"
        print(f"Loading {url}...")
        page.goto(url, wait_until="networkidle")
        time.sleep(1)

        # -------------------------------------------------------------
        # TEST 1: THÁI ẤT THẦN KINH
        # -------------------------------------------------------------
        print("\n--- TEST 1: THÁI ẤT THẦN KINH ---")
        page.evaluate("document.body.classList.remove('theme-light')")
        page.evaluate("window.switchAppMode('thaiat')")
        time.sleep(1)

        # Kiểm tra sự hiện diện của Unified Control Card
        ucc_present = page.evaluate("document.querySelector('#view-thaiat .unified-ctrl-card') !== null")
        print(f"Thái Ất UCC present: {ucc_present}")

        # Kiểm tra khả năng cuộn dọc của #view-thaiat
        scroll_info_thaiat = page.evaluate("""() => {
            const v = document.getElementById('view-thaiat');
            const w = v ? v.querySelector('.thaiat-view-wrap') : null;
            return {
                view: v ? {
                    scrollHeight: v.scrollHeight,
                    clientHeight: v.clientHeight,
                    overflowY: getComputedStyle(v).overflowY,
                    display: getComputedStyle(v).display
                } : null,
                wrap: w ? {
                    scrollHeight: w.scrollHeight,
                    clientHeight: w.clientHeight,
                    offsetHeight: w.offsetHeight,
                    overflowY: getComputedStyle(w).overflowY,
                    testScroll: (() => {
                        const b = w.scrollTop;
                        w.scrollTop = 150;
                        const a = w.scrollTop;
                        w.scrollTop = 0;
                        return { before: b, after: a, scrolled: a > b };
                    })()
                } : null
            };
        }""")
        print(f"Thái Ất scroll info: {scroll_info_thaiat}")

        # Kiểm tra tràn ngang của hàng filter
        overflow_filter = page.evaluate("""() => {
            const bar = document.querySelector('.thaiat-filters-bar');
            if (!bar) return { present: false };
            return {
                present: true,
                scrollWidth: bar.scrollWidth,
                clientWidth: bar.clientWidth,
                hasHorizontalOverflow: bar.scrollWidth > bar.clientWidth + 2
            };
        }""")
        print(f"Thái Ất filter overflow check: {overflow_filter}")

        # Chụp ảnh Dark Mode
        page.screenshot(path="C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_thaiat_dark.png")

        # Chuyển sang Light Mode
        page.evaluate("document.body.classList.add('theme-light')")
        time.sleep(0.5)
        page.screenshot(path="C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_thaiat_light.png")

        # -------------------------------------------------------------
        # TEST 2: LỤC NHÂM ĐẠI ĐỘN
        # -------------------------------------------------------------
        print("\n--- TEST 2: LỤC NHÂM ĐẠI ĐỘN ---")
        page.evaluate("window.switchAppMode('lucnham')")
        time.sleep(1)

        # Kiểm tra sự hiện diện của Unified Control Card
        ucc_ln_present = page.evaluate("document.querySelector('#view-lucnham .unified-ctrl-card') !== null")
        print(f"Lục Nhâm UCC present: {ucc_ln_present}")

        # Kiểm tra khả năng cuộn dọc của #view-lucnham
        scroll_info_lucnham = page.evaluate("""() => {
            const v = document.getElementById('view-lucnham');
            const w = v ? v.querySelector('.lucnham-view-wrap') : null;
            return {
                view: v ? {
                    scrollHeight: v.scrollHeight,
                    clientHeight: v.clientHeight,
                    overflowY: getComputedStyle(v).overflowY,
                    display: getComputedStyle(v).display
                } : null,
                wrap: w ? {
                    scrollHeight: w.scrollHeight,
                    clientHeight: w.clientHeight,
                    offsetHeight: w.offsetHeight,
                    overflowY: getComputedStyle(w).overflowY,
                    testScroll: (() => {
                        const b = w.scrollTop;
                        w.scrollTop = 200;
                        const a = w.scrollTop;
                        w.scrollTop = 0;
                        return { before: b, after: a, scrolled: a > b };
                    })()
                } : null
            };
        }""")
        print(f"Lục Nhâm scroll info: {scroll_info_lucnham}")

        # Chụp ảnh Light Mode Lục Nhâm
        page.screenshot(path="C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_lucnham_light.png")

        # Quay lại Dark Mode Lục Nhâm
        page.evaluate("document.body.classList.remove('theme-light')")
        time.sleep(0.5)
        page.screenshot(path="C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_lucnham_dark.png")

        # Chạm vào 1 cung để kiểm tra Drawer
        page.evaluate("window.LucNhamView.selectPalace('Ngọ')")
        time.sleep(0.5)
        drawer_open = page.evaluate("document.getElementById('lucnham-drawer').classList.contains('open')")
        print(f"Lục Nhâm drawer opened: {drawer_open}")
        page.screenshot(path="C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_lucnham_drawer_theme.png")

        # Đóng browser
        browser.close()

        print("\nVerification completed successfully!")

if __name__ == "__main__":
    run_verification()
