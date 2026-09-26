import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        ctx = await b.new_context(viewport={'width': 390, 'height': 844})
        page = await ctx.new_page()
        await page.goto('http://127.0.0.1:8090/index.html')
        await page.wait_for_timeout(1000)
        await page.evaluate("() => document.getElementById('tab-mode-qmdj').click()")
        await page.wait_for_timeout(800)
        await page.locator('#btn-qmdj-year-jumper').click()
        await page.wait_for_timeout(500)
        await page.screenshot(path='C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/test_modal_year_jumper.png')
        await b.close()
        print('Year jumper modal screenshot saved!')

if __name__ == '__main__':
    asyncio.run(run())
