import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # 360x780 Android viewport
        page = await browser.new_page(viewport={'width': 360, 'height': 780})
        await page.goto('http://127.0.0.1:8090/index.html')
        await page.wait_for_timeout(600)

        # 1. Switch to Light Mode
        theme_btn = await page.query_selector("#btn-theme")
        is_light = await page.evaluate("() => document.body.classList.contains('theme-light')")
        if not is_light:
            await theme_btn.click()
            await page.wait_for_timeout(300)

        # 2. Test QMDJ Duong Ban
        await page.click('#deck-selector-trigger')
        await page.wait_for_timeout(300)
        await page.click('#tab-mode-qmdj')
        await page.wait_for_timeout(600)

        await page.screenshot(path=r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\test_qmdj_duong_ban_before.png")

        # 3. Test QMDJ Am Ban
        await page.click('.qmdj-tab-btn[data-mode="amban"]')
        await page.wait_for_timeout(600)

        await page.screenshot(path=r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\test_qmdj_am_ban_before.png")

        # 4. Test Tu Vi Center Box
        await page.click('#deck-selector-trigger')
        await page.wait_for_timeout(300)
        await page.click('#tab-mode-tuvi')
        await page.wait_for_timeout(600)

        # Scroll to grid
        await page.evaluate("""() => {
            const grid = document.querySelector('.tuvi-grid-4x4');
            if (grid) grid.scrollIntoView({ behavior: 'instant', block: 'center' });
        }""")
        await page.wait_for_timeout(500)

        await page.screenshot(path=r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\test_tuvi_center_box_before.png")

        await browser.close()
        print("Completed taking before screenshots!")

if __name__ == "__main__":
    asyncio.run(main())
