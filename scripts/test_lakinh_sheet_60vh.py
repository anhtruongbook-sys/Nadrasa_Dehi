import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # 360x780 Android viewport matching user screenshot
        page = await browser.new_page(viewport={'width': 360, 'height': 780})
        await page.goto('http://127.0.0.1:8090/index.html')
        await page.wait_for_timeout(800)

        # 1. Switch to La Kinh mode
        await page.click('#deck-selector-trigger')
        await page.wait_for_timeout(300)
        
        # Click La Kinh option
        lakinh_opt = await page.query_selector('#tab-mode-lakinh')
        if lakinh_opt:
            await lakinh_opt.click()
            await page.wait_for_timeout(1000)

        # 2. Click "⚙️ Công Cụ" to open bottom sheet
        tools_btn = await page.query_selector('#lakinh-dock-tools')
        if tools_btn:
            await tools_btn.click()
            await page.wait_for_timeout(600)

        # Measure sheet height vs window height
        info = await page.evaluate('''() => {
            const sheet = document.getElementById('lakinh-bottom-sheet');
            if (!sheet) return { error: 'Sheet not found' };
            const rect = sheet.getBoundingClientRect();
            const winH = window.innerHeight;
            return {
                windowHeight: winH,
                sheetTop: rect.top,
                sheetHeight: rect.height,
                sheetPercent: ((rect.height / winH) * 100).toFixed(1) + '%',
                lakinhVisibleHeightAbove: rect.top,
                lakinhPercentAbove: ((rect.top / winH) * 100).toFixed(1) + '%'
            };
        }''')
        print(f"Sheet Dimensions: {info}")

        # Capture screenshot
        out_path = r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\test_lakinh_sheet_60vh.png"
        await page.screenshot(path=out_path)
        print(f"Saved screenshot to: {out_path}")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
