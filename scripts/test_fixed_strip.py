import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def verify_theme(page, theme_name):
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
            clientHeight: strip.clientHeight,
            scrollHeight: strip.scrollHeight,
            offsetHeight: strip.offsetHeight,
            itemsCount: items.length,
            minItemTop: minTop,
            maxItemBottom: maxBottom,
            isInside: (minTop >= rect.top) && (maxBottom <= rect.bottom)
        };
    }''')
    print(f"[{theme_name}] Verification info: {info}")
    assert info['isInside'], f"Items overflow strip in {theme_name}!"
    assert info['clientHeight'] >= info['scrollHeight'] - 1, f"ScrollHeight exceeds clientHeight in {theme_name}!"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 360, 'height': 780})
        await page.goto('http://127.0.0.1:8090/index.html')
        await page.wait_for_timeout(600)

        # 1. Test Light mode
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

        # Verify Light Mode
        await verify_theme(page, "LIGHT THEME")
        await page.screenshot(path=r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\tuvi_native_light.png")

        # 2. Switch to Dark Mode and verify
        await theme_btn.click()
        await page.wait_for_timeout(400)
        await verify_theme(page, "DARK THEME")
        await page.screenshot(path=r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\tuvi_native_dark.png")

        print("ALL VERIFICATIONS PASSED NATIVELY!")
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
