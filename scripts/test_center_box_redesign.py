import asyncio
import os
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Standard mobile screen (360 x 780)
        context = await browser.new_context(viewport={"width": 360, "height": 780})
        page = await context.new_page()
        
        await page.goto("http://127.0.0.1:8080", wait_until="networkidle")
        await asyncio.sleep(1)
        
        # Switch to Tu Vi
        await page.click("#deck-selector-trigger")
        await asyncio.sleep(0.3)
        await page.click("#tab-mode-tuvi")
        await asyncio.sleep(1)
        
        # Set date to 24/09/2026 21:18 (same as user screenshot)
        await page.fill("#tuvi-input-day", "24")
        await page.fill("#tuvi-input-month", "9")
        await page.fill("#tuvi-input-year", "2026")
        await page.fill("#tuvi-input-hour", "21")
        await page.fill("#tuvi-input-minute", "18")
        await page.click("#btn-tuvi-submit")
        await asyncio.sleep(1)
        
        # 1. LIGHT MODE
        await page.evaluate("document.body.classList.add('theme-light')")
        await asyncio.sleep(0.5)
        
        center_box = await page.query_selector(".tuvi-center-box")
        if center_box:
            await center_box.screenshot(path="test_center_box_new_light.png")
            print("Saved test_center_box_new_light.png")
            
        grid = await page.query_selector(".tuvi-grid-wrapper")
        if grid:
            await grid.screenshot(path="test_tuvi_grid_new_light.png")
            print("Saved test_tuvi_grid_new_light.png")

        # 2. DARK MODE
        await page.evaluate("document.body.classList.remove('theme-light')")
        await asyncio.sleep(0.5)
        
        if center_box:
            await center_box.screenshot(path="test_center_box_new_dark.png")
            print("Saved test_center_box_new_dark.png")
            
        if grid:
            await grid.screenshot(path="test_tuvi_grid_new_dark.png")
            print("Saved test_tuvi_grid_new_dark.png")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
