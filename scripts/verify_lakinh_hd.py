import asyncio
import os
import sys
from playwright.async_api import async_playwright

ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612"

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            permissions=['geolocation'],
            geolocation={'latitude': 21.0285, 'longitude': 105.8542, 'accuracy': 10},
            viewport={'width': 412, 'height': 915},
            is_mobile=True,
            has_touch=True
        )
        page = await context.new_page()
        await page.goto("http://127.0.0.1:8090/index.html", wait_until="domcontentloaded")
        await page.wait_for_function("() => typeof window.switchDeckMode === 'function'", timeout=10000)

        # Switch to lakinh
        await page.evaluate("() => window.switchDeckMode('lakinh')")
        await page.wait_for_timeout(2500)

        # 1. Main view with HD Mica Trans plate
        p1 = os.path.join(ARTIFACT_DIR, "lakinh_hd_mica_trans_1x.png")
        await page.screenshot(path=p1)
        print("Saved:", p1)

        # Open bottom sheet
        await page.click("#lakinh-dock-tools")
        await page.wait_for_timeout(800)

        # 2. Test 1.5x zoom
        await page.click("#btn-size-15x")
        await page.wait_for_timeout(500)
        # Close sheet
        await page.click("#sheet-close-btn")
        await page.wait_for_timeout(500)
        p2 = os.path.join(ARTIFACT_DIR, "lakinh_hd_zoom_15x.png")
        await page.screenshot(path=p2)
        print("Saved:", p2)

        # 3. Test 2x zoom & Gold plate
        await page.click("#lakinh-dock-tools")
        await page.wait_for_timeout(500)
        await page.click("#btn-size-2x")
        await page.wait_for_timeout(500)
        await page.click("#btn-plate-gold")
        await page.wait_for_timeout(500)
        await page.click("#sheet-close-btn")
        await page.wait_for_timeout(500)
        p3 = os.path.join(ARTIFACT_DIR, "lakinh_hd_gold_2x.png")
        await page.screenshot(path=p3)
        print("Saved:", p3)

        # 4. Test Paper plate
        await page.click("#lakinh-dock-tools")
        await page.wait_for_timeout(500)
        await page.click("#btn-plate-thuoc")
        await page.wait_for_timeout(500)
        await page.click("#sheet-close-btn")
        await page.wait_for_timeout(500)
        p4 = os.path.join(ARTIFACT_DIR, "lakinh_hd_paper_disc.png")
        await page.screenshot(path=p4)
        print("Saved:", p4)

        await browser.close()
        print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(run())
