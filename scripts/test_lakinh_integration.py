import asyncio
import os
import sys
from playwright.async_api import async_playwright

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

async def run_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Mobile viewport testing
        context = await browser.new_context(viewport={'width': 412, 'height': 892})
        page = await context.new_page()

        # Listen to console
        page.on('console', lambda msg: print(f"Browser console [{msg.type}]: {msg.text}"))
        page.on('pageerror', lambda err: print(f"Browser pageerror: {err}"))

        file_url = f"file:///{os.path.abspath('c:/Books/Neta Light/index.html').replace(os.sep, '/')}"
        print(f"Loading {file_url}...")
        await page.goto(file_url, wait_until='domcontentloaded')
        await asyncio.sleep(1.0)

        # 1. Open deck dropdown
        print("Clicking deck dropdown trigger...")
        await page.click('#deck-selector-trigger')
        await asyncio.sleep(0.5)

        # Save screenshot of dropdown with new option
        dropdown_shot = 'c:/Users/Admin/.gemini/antigravity/brain/32725825-4057-48fd-8f39-2b87c21de95b/lakinh_dropdown_menu.png'
        await page.screenshot(path=dropdown_shot)
        print(f"Saved {dropdown_shot}")

        # 2. Select La Kinh mode
        print("Selecting tab-mode-lakinh...")
        await page.click('#tab-mode-lakinh')
        await asyncio.sleep(1.5)

        # 3. Verify header titles and visibility
        main_title = await page.inner_text('#app-main-title')
        sub_title = await page.inner_text('#app-sub-title')
        print(f"App title: '{main_title}', Subtitle: '{sub_title}'")
        assert 'LA KINH' in main_title

        # Check view-lakinh display
        view_display = await page.evaluate("() => getComputedStyle(document.getElementById('view-lakinh')).display")
        print(f"view-lakinh display: {view_display}")
        assert view_display == 'flex'

        # 4. Check HUD information
        deg = await page.inner_text('#lakinh-disp-degree')
        son = await page.inner_text('#lakinh-disp-son')
        dec = await page.inner_text('#lakinh-disp-declination')
        print(f"Initial HUD -> Degree: {deg}, Son: {son}, WMM: {dec}")

        # Save initial map view screenshot
        view_shot = 'c:/Users/Admin/.gemini/antigravity/brain/32725825-4057-48fd-8f39-2b87c21de95b/lakinh_main_view.png'
        await page.screenshot(path=view_shot)
        print(f"Saved {view_shot}")

        # 5. Rotate compass +5 degrees
        print("Clicking +5 deg button...")
        await page.click('#btn-rot-p5')
        await asyncio.sleep(0.3)
        deg_after = await page.inner_text('#lakinh-disp-degree')
        son_after = await page.inner_text('#lakinh-disp-son')
        print(f"After +5° HUD -> Degree: {deg_after}, Son: {son_after}")

        # 6. Test Huyen Khong modal
        print("Opening Huyen Khong modal...")
        await page.click('#lakinh-btn-huyenkhong')
        await asyncio.sleep(0.6)
        hk_shot = 'c:/Users/Admin/.gemini/antigravity/brain/32725825-4057-48fd-8f39-2b87c21de95b/lakinh_huyenkhong_modal.png'
        await page.screenshot(path=hk_shot)
        print(f"Saved {hk_shot}")

        # Close Huyen Khong modal
        await page.click('.lakinh-modal-close')
        await asyncio.sleep(0.4)

        # 7. Test Elevation and Thuy Khau Scan
        print("Scanning elevation and tiers...")
        await page.click('#lakinh-btn-scan-elev')
        await asyncio.sleep(2.5) # Wait for Open-Meteo elevation API response
        minhduong_shot = 'c:/Users/Admin/.gemini/antigravity/brain/32725825-4057-48fd-8f39-2b87c21de95b/lakinh_minhduong_modal.png'
        await page.screenshot(path=minhduong_shot)
        print(f"Saved {minhduong_shot}")

        # Close Minh Duong modal
        await page.click('.lakinh-modal-close')
        await asyncio.sleep(0.4)

        # 8. Test Ray-casting
        print("Toggling ray casting...")
        await page.click('#lakinh-btn-ray')
        await asyncio.sleep(0.5)

        # Final active map screenshot
        final_shot = 'c:/Users/Admin/.gemini/antigravity/brain/32725825-4057-48fd-8f39-2b87c21de95b/lakinh_ray_active.png'
        await page.screenshot(path=final_shot)
        print(f"Saved {final_shot}")

        await browser.close()
        print("ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == '__main__':
    asyncio.run(run_test())
