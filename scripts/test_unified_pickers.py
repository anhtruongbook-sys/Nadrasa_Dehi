import asyncio
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 390, "height": 844})
        page = await context.new_page()

        print("Navigating to app...")
        await page.goto("http://127.0.0.1:8090/index.html")
        await page.wait_for_timeout(1000)

        # 1. Test QMDJ
        print("Switching to QMDJ...")
        await page.evaluate("() => document.getElementById('tab-mode-qmdj').click()")
        await page.wait_for_timeout(800)
        await page.screenshot(path="C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/picker_qmdj.png")
        print("Saved picker_qmdj.png")

        # 2. Test Bazi
        print("Switching to Bazi...")
        await page.evaluate("() => document.getElementById('tab-mode-bazi').click()")
        await page.wait_for_timeout(800)
        await page.screenshot(path="C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/picker_bazi.png")
        print("Saved picker_bazi.png")

        # 3. Test Tuvi
        print("Switching to Tu Vi...")
        await page.evaluate("() => document.getElementById('tab-mode-tuvi').click()")
        await page.wait_for_timeout(800)
        await page.screenshot(path="C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/picker_tuvi.png")
        print("Saved picker_tuvi.png")

        # 4. Test Calendar
        print("Switching to Calendar...")
        await page.evaluate("() => document.getElementById('tab-mode-calendar').click()")
        await page.wait_for_timeout(800)
        await page.screenshot(path="C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/picker_calendar.png")
        print("Saved picker_calendar.png")

        await browser.close()
        print("All picker tests completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
