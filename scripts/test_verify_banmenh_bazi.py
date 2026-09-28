import asyncio
import os
from playwright.async_api import async_playwright

ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612"

async def test_banmenh_and_bazi():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Mobile viewport 390x844 (iPhone 12/13/14)
        context = await browser.new_context(viewport={'width': 390, 'height': 844})
        page = await context.new_page()
        page.on('console', lambda msg: print(f"CONSOLE [{msg.type}]: {msg.text.encode('ascii', 'replace').decode()}"))
        page.on('pageerror', lambda err: print(f"PAGEERROR: {str(err).encode('ascii', 'replace').decode()}"))

        print("1. Loading http://127.0.0.1:8090 ...")
        await page.goto("http://127.0.0.1:8090", wait_until="networkidle")
        await page.wait_for_timeout(1500)

        # --- TEST 1: KỲ MÔN ĐỘN GIÁP ---
        print("2. Switching to QMDJ view...")
        await page.evaluate("""() => {
            if (window.switchAppMode) {
                window.switchAppMode('qmdj');
            } else {
                const btn = document.getElementById('tab-mode-qmdj');
                if (btn) btn.click();
            }
        }""")
        await page.wait_for_timeout(1000)

        # Kiểm tra thanh tabs của Kỳ Môn có bị đè bẹp (squished) không
        tabs_box = await page.locator(".qmdj-mode-tabs").bounding_box()
        print(f"QMDJ Tabs Bounding Box: {tabs_box}")
        assert tabs_box is not None, "Không tìm thấy .qmdj-mode-tabs!"
        assert tabs_box['height'] >= 30, f"Tabs bị co ép quá nhỏ! height={tabs_box['height']}"

        # Kiểm tra 6 tab buttons
        tab_buttons = await page.locator(".qmdj-tab-btn").all_text_contents()
        print(f"QMDJ Tabs count: {len(tab_buttons)}")
        assert len(tab_buttons) == 6, f"Mong đợi 6 tabs, nhưng tìm thấy: {len(tab_buttons)}"

        # Chụp ảnh Dương Bàn
        shot_qmdj_tabs = os.path.join(ARTIFACT_DIR, "test_qmdj_tabs_fixed.png")
        await page.screenshot(path=shot_qmdj_tabs, full_page=False)
        print(f"Captured: {shot_qmdj_tabs}")

        # Bấm sang Tab Bản Mệnh
        print("3. Clicking Tab Ban Menh...")
        await page.click(".qmdj-tab-btn[data-mode='banmenh']")
        await page.wait_for_timeout(1000)

        # Kiểm tra sự hiện diện của #qmdj-banmenh-card trong QMDJ
        banmenh_card = await page.wait_for_selector("#qmdj-banmenh-card", timeout=5000)
        assert banmenh_card is not None, "Không tìm thấy #qmdj-banmenh-card trong Kỳ Môn!"

        # Chụp ảnh Bản Mệnh Dark mode
        shot_banmenh_dark = os.path.join(ARTIFACT_DIR, "test_qmdj_banmenh_dark.png")
        await page.screenshot(path=shot_banmenh_dark, full_page=False)
        print(f"Captured: {shot_banmenh_dark}")

        # Chụp ảnh Bản Mệnh Light mode
        await page.evaluate("() => document.body.classList.add('theme-light')")
        await page.wait_for_timeout(500)
        shot_banmenh_light = os.path.join(ARTIFACT_DIR, "test_qmdj_banmenh_light.png")
        await page.screenshot(path=shot_banmenh_light, full_page=False)
        print(f"Captured: {shot_banmenh_light}")
        await page.evaluate("() => document.body.classList.remove('theme-light')")

        # --- TEST 2: BÁT TỰ MANH PHÁI ---
        print("4. Switching to Bazi view...")
        await page.evaluate("""() => {
            if (window.switchAppMode) {
                window.switchAppMode('bazi');
            } else {
                const btn = document.getElementById('tab-mode-bazi');
                if (btn) btn.click();
            }
        }""")
        await page.wait_for_timeout(1000)

        # Xác minh Bát Tự KHÔNG CÒN thẻ #bazi-qmdj-card
        qmdj_in_bazi = await page.locator("#bazi-qmdj-card").count()
        print(f"QMDJ card in Bazi count: {qmdj_in_bazi}")
        assert qmdj_in_bazi == 0, "LỖI: Kỳ Môn vẫn còn bị chèn trong Bát Tự!"

        # Xác minh các thành phần chuẩn của Bát Tự
        pillars = await page.locator(".bazi-pillars-grid").count()
        interactions = await page.locator(".bazi-interactions-container").count()
        palaces = await page.locator(".bazi-palaces-grid").count()
        dayun = await page.locator(".bazi-dayun-scroll").count()
        print(f"Bazi components: pillars={pillars}, interactions={interactions}, palaces={palaces}, dayun={dayun}")
        assert pillars > 0 and palaces > 0 and dayun > 0, "Thành phần cốt lõi của Bát Tự bị thiếu!"

        # Chụp ảnh Bát Tự Dark mode
        shot_bazi_dark = os.path.join(ARTIFACT_DIR, "test_bazi_clean_dark.png")
        await page.screenshot(path=shot_bazi_dark, full_page=False)
        print(f"Captured: {shot_bazi_dark}")

        # Cuộn xuống chụp phần 12 Cung & Đại Vận liền mạch
        await page.evaluate("() => document.querySelector('.bazi-view-container').scrollTop = 500")
        await page.wait_for_timeout(500)
        shot_bazi_scrolled = os.path.join(ARTIFACT_DIR, "test_bazi_clean_scrolled.png")
        await page.screenshot(path=shot_bazi_scrolled, full_page=False)
        print(f"Captured: {shot_bazi_scrolled}")

        print("ALL TESTS PASSED SUCCESSFULLY!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_banmenh_and_bazi())
