import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 390, "height": 844})
        page = await context.new_page()

        await page.goto("http://127.0.0.1:8090/index.html")
        await page.wait_for_timeout(600)

        # Switch to Light Mode
        theme_btn = await page.query_selector("#btn-theme")
        is_light = await page.evaluate("() => document.body.classList.contains('theme-light')")
        if not is_light:
            await theme_btn.click()
            await page.wait_for_timeout(300)

        # Switch to Tu Vi
        await page.click("#deck-selector-trigger")
        await page.wait_for_timeout(300)
        await page.click("#tab-mode-tuvi")
        await page.wait_for_timeout(600)

        # Set exact values: 27/09/2026, Hour Ty (00:29)
        await page.evaluate("""() => {
            const d = document.getElementById('tuvi-input-day');
            const m = document.getElementById('tuvi-input-month');
            const y = document.getElementById('tuvi-input-year');
            const selZhi = document.getElementById('tuvi-select-canchi');
            const h = document.getElementById('tuvi-input-hour');
            const min = document.getElementById('tuvi-input-minute');
            if (d) d.value = '27';
            if (m) m.value = '09';
            if (y) y.value = '2026';
            if (selZhi) {
                selZhi.value = '0'; // Tý
                selZhi.dispatchEvent(new Event('change'));
            }
            if (h) h.value = '00';
            if (min) min.value = '29';
            const btnSubmit = document.getElementById('btn-tuvi-submit');
            if (btnSubmit) btnSubmit.click();
        }""")
        await page.wait_for_timeout(800)

        # Scroll to grid
        await page.evaluate("""() => {
            const grid = document.querySelector('.tuvi-grid-4x4');
            if (grid) grid.scrollIntoView({ behavior: 'instant', block: 'center' });
        }""")
        await page.wait_for_timeout(500)

        out_chart = r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\verify_tuvi_exact_user_chart.png"
        await page.screenshot(path=out_chart)
        print(f"Exact user chart screenshot saved to {out_chart}")

        await browser.close()
        print("Done!")

if __name__ == "__main__":
    asyncio.run(main())
