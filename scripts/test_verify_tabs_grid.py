import asyncio
import os
from playwright.async_api import async_playwright

ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612"

async def test_tabs_grid():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Mobile viewport 390x844
        context = await browser.new_context(viewport={'width': 390, 'height': 844})
        page = await context.new_page()

        print("1. Loading http://127.0.0.1:8090 ...")
        await page.goto("http://127.0.0.1:8090", wait_until="networkidle")
        await page.wait_for_timeout(1000)

        # Switch to QMDJ
        await page.evaluate("""() => {
            if (window.switchAppMode) {
                window.switchAppMode('qmdj');
            }
        }""")
        await page.wait_for_timeout(1000)

        # Switch to chienluoc mode (Tác Quyết)
        print("2. Clicking Tab Tac Quyet...")
        await page.click(".qmdj-tab-btn[data-mode='chienluoc']")
        await page.wait_for_timeout(1000)

        # Kiểm tra kích thước và vị trí của từng tab button
        tabs = await page.locator(".qmdj-tab-btn").all()
        print(f"Total tabs found: {len(tabs)}")
        assert len(tabs) == 6, f"Mong đợi 6 tabs, nhưng tìm thấy: {len(tabs)}"

        for idx, tab in enumerate(tabs):
            box = await tab.bounding_box()
            text = (await tab.inner_text()).encode('ascii', 'replace').decode()
            print(f"Tab {idx+1} [{text}]: x={box['x']}, y={box['y']}, width={box['width']}, height={box['height']}")
            # Bắt buộc x >= 0 và x + width <= 390 (không tràn ra ngoài bên phải)
            assert box['x'] >= 0, f"Tab {text} bị tràn sang trái! x={box['x']}"
            assert box['x'] + box['width'] <= 390, f"Tab {text} bị tràn sang phải! right={box['x'] + box['width']}"

        # Chụp ảnh Dark mode
        shot_dark = os.path.join(ARTIFACT_DIR, "test_qmdj_tac_quyet_grid_dark.png")
        await page.screenshot(path=shot_dark, full_page=False)
        print(f"Captured: {shot_dark}")

        # Chụp ảnh Light mode
        await page.evaluate("() => document.body.classList.add('theme-light')")
        await page.wait_for_timeout(500)
        shot_light = os.path.join(ARTIFACT_DIR, "test_qmdj_tac_quyet_grid_light.png")
        await page.screenshot(path=shot_light, full_page=False)
        print(f"Captured: {shot_light}")

        print("ALL TAB POSITIONS ARE 100% WITHIN VIEWPORT WITHOUT OVERFLOW!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_tabs_grid())
