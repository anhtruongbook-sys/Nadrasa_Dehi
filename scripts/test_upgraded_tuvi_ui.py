import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 360, 'height': 780})
        await page.goto('http://127.0.0.1:8090/index.html')
        await page.wait_for_timeout(600)

        # Light mode
        theme_btn = await page.query_selector("#btn-theme")
        is_light = await page.evaluate("() => document.body.classList.contains('theme-light')")
        if not is_light:
            await theme_btn.click()
            await page.wait_for_timeout(300)

        # Switch to Tu Vi
        await page.click('#deck-selector-trigger')
        await page.wait_for_timeout(300)
        await page.click('#tab-mode-tuvi')
        await page.wait_for_timeout(600)

        # 1. Screenshot 4x4 Grid
        await page.screenshot(path=r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\test_tuvi_upgraded_grid.png")

        # 2. Click on Cung Thìn (Tài Bạch) or Cung Dần (Thiên Di) to open modal
        cells = await page.query_selector_all('[data-palace-idx]')
        if cells and len(cells) > 2:
            await cells[2].click() # Cung Dần
            await page.wait_for_timeout(400)
            await page.screenshot(path=r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\test_tuvi_upgraded_modal.png")

        await browser.close()
        print("Playwright UI test finished successfully!")

if __name__ == '__main__':
    asyncio.run(main())
