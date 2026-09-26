import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # 360x780 mobile viewport (standard Android phone)
        page = await browser.new_page(viewport={'width': 360, 'height': 780})
        await page.goto('http://127.0.0.1:8090/index.html')
        await page.wait_for_timeout(600)

        # Switch to Light Mode to match user screenshot
        theme_btn = await page.query_selector("#btn-theme")
        is_light = await page.evaluate("() => document.body.classList.contains('theme-light')")
        if not is_light:
            await theme_btn.click()
            await page.wait_for_timeout(300)

        # 1. Test QMDJ Duong Ban without any script overrides
        await page.click('#deck-selector-trigger')
        await page.wait_for_timeout(300)
        await page.click('#tab-mode-qmdj')
        await page.wait_for_timeout(600)

        # Check grid width and scrollWidth
        qmdj_dim = await page.evaluate('''() => {
            const grid = document.querySelector('.qmdj-matrix-grid');
            const cells = Array.from(document.querySelectorAll('.qmdj-palace-cell'));
            const container = document.querySelector('.qmdj-board-container') || document.querySelector('.screen.active');
            return {
                gridWidth: grid.offsetWidth,
                gridScrollWidth: grid.scrollWidth,
                containerScrollWidth: container ? container.scrollWidth : 0,
                cellBoundingRights: cells.slice(0, 3).map(c => c.getBoundingClientRect().right),
                windowInnerWidth: window.innerWidth
            };
        }''')
        print(f"QMDJ Duong Ban dimensions: {qmdj_dim}")
        await page.screenshot(path=r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\verify_prod_qmdj_duong_ban.png")

        # 2. Test QMDJ Am Ban
        await page.click('.qmdj-tab-btn[data-mode="amban"]')
        await page.wait_for_timeout(600)
        await page.screenshot(path=r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\verify_prod_qmdj_am_ban.png")

        # 3. Test Tu Vi Center Box
        await page.click('#deck-selector-trigger')
        await page.wait_for_timeout(300)
        await page.click('#tab-mode-tuvi')
        await page.wait_for_timeout(600)

        # Measure center box and inner border
        tuvi_dim = await page.evaluate('''() => {
            const center = document.querySelector('.tuvi-center-box');
            const inner = document.querySelector('.tc-inner-border');
            const content = document.querySelector('.tc-content');
            const grid = document.querySelector('.tuvi-grid-4x4');
            const cells = Array.from(document.querySelectorAll('.tuvi-cell'));
            return {
                centerRect: center.getBoundingClientRect(),
                innerRect: inner.getBoundingClientRect(),
                contentScrollHeight: content.scrollHeight,
                contentClientHeight: content.clientHeight,
                gridRect: grid.getBoundingClientRect(),
                cellRows: cells.map(c => ({ name: c.querySelector('.tc-cung-title')?.textContent, row: c.style.gridRow }))
            };
        }''')
        print(f"Tu Vi Center Box dimensions: {tuvi_dim['centerRect']}, Inner: {tuvi_dim['innerRect']}")
        await page.screenshot(path=r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\verify_prod_tuvi_center_box.png")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
