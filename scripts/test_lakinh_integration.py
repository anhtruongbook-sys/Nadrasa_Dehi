import asyncio
import os
import sys
from playwright.async_api import async_playwright

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

async def run_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Mobile viewport testing matching user's phone (e.g. 412 x 892)
        context = await browser.new_context(
            viewport={'width': 412, 'height': 892},
            permissions=['geolocation'],
            geolocation={'latitude': 21.028511, 'longitude': 105.854167}
        )
        page = await context.new_page()

        file_url = f"file:///{os.path.abspath('c:/Books/Neta Light/index.html').replace(os.sep, '/')}"
        print(f"Loading {file_url}...")
        await page.goto(file_url, wait_until='domcontentloaded')
        await asyncio.sleep(1.0)

        # 1. Open deck dropdown & switch to La Kinh
        print("Switching to La Kinh mode...")
        await page.click('#deck-selector-trigger')
        await asyncio.sleep(0.4)
        await page.click('#tab-mode-lakinh')
        await asyncio.sleep(1.5)

        # 2. Capture unobstructed clean map & compass view
        full_shot = 'c:/Users/Admin/.gemini/antigravity/brain/32725825-4057-48fd-8f39-2b87c21de95b/lakinh_unobstructed_view.png'
        await page.screenshot(path=full_shot)
        print(f"Saved full clean view: {full_shot}")

        # 3. Test tapping HUD Pill to view detail card
        print("Tapping HUD Pill...")
        await page.click('#lakinh-hud-pill')
        await asyncio.sleep(0.5)
        hud_detail_shot = 'c:/Users/Admin/.gemini/antigravity/brain/32725825-4057-48fd-8f39-2b87c21de95b/lakinh_hud_detail_expanded.png'
        await page.screenshot(path=hud_detail_shot)
        print(f"Saved HUD detail: {hud_detail_shot}")

        # Tap HUD pill again to toggle close
        await page.click('#lakinh-hud-pill')
        await asyncio.sleep(0.4)

        # 4. Test GPS button
        print("Testing GPS button...")
        await page.click('#lakinh-dock-gps')
        await asyncio.sleep(1.2)
        gps_shot = 'c:/Users/Admin/.gemini/antigravity/brain/32725825-4057-48fd-8f39-2b87c21de95b/lakinh_gps_located.png'
        await page.screenshot(path=gps_shot)
        print(f"Saved GPS located shot: {gps_shot}")

        # 5. Test opening Bottom Sheet (Công Cụ)
        print("Opening Bottom Sheet...")
        await page.click('#lakinh-dock-tools')
        await asyncio.sleep(0.6)
        sheet_shot = 'c:/Users/Admin/.gemini/antigravity/brain/32725825-4057-48fd-8f39-2b87c21de95b/lakinh_bottom_sheet_open.png'
        await page.screenshot(path=sheet_shot)
        print(f"Saved Bottom Sheet shot: {sheet_shot}")

        # 6. Test closing Bottom Sheet
        print("Closing Bottom Sheet...")
        await page.click('#sheet-close-btn')
        await asyncio.sleep(0.5)

        # Final check: view should be clean again
        final_shot = 'c:/Users/Admin/.gemini/antigravity/brain/32725825-4057-48fd-8f39-2b87c21de95b/lakinh_final_clean_view.png'
        await page.screenshot(path=final_shot)
        print(f"Saved final clean view: {final_shot}")

        await browser.close()
        print("V2 TESTS PASSED SUCCESSFULLY!")

if __name__ == '__main__':
    asyncio.run(run_test())
