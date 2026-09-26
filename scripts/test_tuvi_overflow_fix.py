import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Mobile viewport (iPhone / Android)
        context = await browser.new_context(viewport={"width": 390, "height": 844})
        page = await context.new_page()

        print("Navigating to http://127.0.0.1:8090/index.html...")
        await page.goto("http://127.0.0.1:8090/index.html")
        await page.wait_for_timeout(800)

        # Switch to Light Theme if not already
        theme_btn = await page.query_selector("#btn-theme")
        is_light = await page.evaluate("() => document.body.classList.contains('theme-light')")
        if not is_light:
            print("Switching to Light Mode...")
            await theme_btn.click()
            await page.wait_for_timeout(400)

        # Open deck dropdown
        await page.click("#deck-selector-trigger")
        await page.wait_for_timeout(400)

        # Click on Tu Vi mode
        await page.click("#tab-mode-tuvi")
        await page.wait_for_timeout(800)

        # Set exact date/time from screenshot: 27/09/2026 00:29
        await page.evaluate("""() => {
            const d = document.getElementById('tuvi-input-day');
            const m = document.getElementById('tuvi-input-month');
            const y = document.getElementById('tuvi-input-year');
            const h = document.getElementById('tuvi-input-hour');
            const min = document.getElementById('tuvi-input-minute');
            if (d) d.value = '27';
            if (m) m.value = '09';
            if (y) y.value = '2026';
            if (h) h.value = '00';
            if (min) min.value = '29';
            const btnSubmit = document.getElementById('btn-tuvi-submit');
            if (btnSubmit) btnSubmit.click();
        }""")
        await page.wait_for_timeout(800)

        # Scroll to 4x4 grid
        await page.evaluate("""() => {
            const grid = document.querySelector('.tuvi-grid-4x4');
            if (grid) grid.scrollIntoView({ behavior: 'instant', block: 'center' });
        }""")
        await page.wait_for_timeout(500)

        # Take screenshot of the full chart (matching user's view)
        out_chart = r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\verify_tuvi_fixed_chart.png"
        await page.screenshot(path=out_chart)
        print(f"Chart screenshot saved to {out_chart}")

        # Also take a tight crop screenshot of cell Tật Ách and Điền Trạch
        tat_ach = await page.query_selector("div[data-palace-idx='4']") # Thìn
        if tat_ach:
            out_tat_ach = r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\verify_tat_ach_cell.png"
            await tat_ach.screenshot(path=out_tat_ach)
            print(f"Tật Ách cell screenshot saved to {out_tat_ach}")

        dien_trach = await page.query_selector("div[data-palace-idx='0']") # Tý
        if dien_trach:
            out_dien_trach = r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\verify_dien_trach_cell.png"
            await dien_trach.screenshot(path=out_dien_trach)
            print(f"Điền Trạch cell screenshot saved to {out_dien_trach}")

        await browser.close()
        print("Tu Vi visual verification complete!")

if __name__ == "__main__":
    asyncio.run(main())
