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

        # Switch to Dark mode if currently light
        theme_btn = await page.query_selector("#btn-theme")
        is_light = await page.evaluate("() => document.body.classList.contains('theme-light')")
        if is_light:
            await theme_btn.click()
            await page.wait_for_timeout(300)

        # Switch to Tu Vi
        await page.click('#deck-selector-trigger')
        await page.wait_for_timeout(300)
        await page.click('#tab-mode-tuvi')
        await page.wait_for_timeout(600)

        # Set date to 13/12/1979 01:30 Nam
        await page.evaluate('''() => {
            const inputD = document.getElementById('tuvi-input-day');
            const inputM = document.getElementById('tuvi-input-month');
            const inputY = document.getElementById('tuvi-input-year');
            const inputH = document.getElementById('tuvi-input-hour');
            const inputMin = document.getElementById('tuvi-input-minute');
            if (inputD) inputD.value = '13';
            if (inputM) inputM.value = '12';
            if (inputY) inputY.value = '1979';
            if (inputH) inputH.value = '01';
            if (inputMin) inputMin.value = '30';
            
            const btnSubmit = document.getElementById('btn-tuvi-submit');
            if (btnSubmit) btnSubmit.click();
        }''')
        await page.wait_for_timeout(600)

        # Apply fix
        await page.evaluate('''() => {
            const strip = document.querySelector('.tuvi-master-strip');
            if (strip) {
                strip.style.flexShrink = '0';
                strip.style.height = 'auto';
                strip.style.minHeight = 'unset';
                strip.style.padding = '4px 6px';
                strip.style.gap = '2px 8px';
            }
        }''')
        await page.wait_for_timeout(300)

        # Check bounds
        info = await page.evaluate('''() => {
            const strip = document.querySelector('.tuvi-master-strip');
            const rect = strip.getBoundingClientRect();
            const items = Array.from(strip.querySelectorAll('.tms-item')).map(it => ({
                text: it.textContent,
                rect: it.getBoundingClientRect()
            }));
            const maxBottom = Math.max(...items.map(it => it.rect.bottom));
            const minTop = Math.min(...items.map(it => it.rect.top));
            return {
                stripRect: rect,
                itemsCount: items.length,
                minItemTop: minTop,
                maxItemBottom: maxBottom,
                isInside: (minTop >= rect.top) && (maxBottom <= rect.bottom)
            };
        }''')
        print("Dark mode check info:", info)
        await page.screenshot(path=r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\test_tuvi_fixed_strip_dark.png")
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
