import asyncio
import os
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 412, 'height': 915})
        page = await context.new_page()

        file_url = 'file:///' + os.path.abspath('index.html').replace('\\', '/')
        print(f"Loading: {file_url}")
        await page.goto(file_url, wait_until='domcontentloaded')
        await page.wait_for_timeout(800)

        # 1. Switch to Địa Chính
        print("1. Switch to diachinh...")
        await page.evaluate("window.switchAppMode('diachinh')")
        await page.wait_for_timeout(500)

        # 2. Load sample
        print("2. Load sample parcel...")
        await page.evaluate("window.NetaDiaChinhView.loadSample('hanoi_sample')")
        await page.wait_for_timeout(500)

        # Verify buttons exist
        btn_lk = await page.query_selector('#dc-btn-go-lakinh')
        btn_tl = await page.query_selector('#dc-btn-go-tamlong')
        print(f"Button #dc-btn-go-lakinh exists: {btn_lk is not None}")
        print(f"Button #dc-btn-go-tamlong exists: {btn_tl is not None}")

        # 3. Click [ 🧭 La Kinh Lập Cực ] for the first time
        print("3. Clicking [ 🧭 La Kinh Lập Cực ] for the first time...")
        await page.click('#dc-btn-go-lakinh')
        await page.wait_for_timeout(1000)

        # Check map center and parcel visibility in lakinh
        parcel_banner = await page.evaluate("document.querySelector('#lakinh-parcel-banner').style.display !== 'none'")
        lakinh_center = await page.evaluate("window.lakinhState.centerCoords")
        imported_parcel = await page.evaluate("!!window.lakinhState.importedParcel")
        polygon_points_count = await page.evaluate("window.lakinhState.polygonPoints ? window.lakinhState.polygonPoints.length : 0")
        print(f"Parcel banner visible: {parcel_banner}")
        print(f"La Kinh Center: {lakinh_center}")
        print(f"Imported parcel exists in state: {imported_parcel}")
        print(f"Polygon points count: {polygon_points_count}")

        # Wait 2.5 seconds to ensure background GPS timer (1200ms) has fired and did NOT hijack view
        print("4. Waiting 2.5s to verify background GPS did NOT hijack view...")
        await page.wait_for_timeout(2500)

        lakinh_center_after = await page.evaluate("window.lakinhState.centerCoords")
        parcel_banner_after = await page.evaluate("document.querySelector('#lakinh-parcel-banner').style.display !== 'none'")
        print(f"La Kinh Center after 2.5s: {lakinh_center_after}")
        print(f"Parcel banner still visible: {parcel_banner_after}")

        # Screenshot La Kinh view with parcel intact
        sc_path = os.path.abspath(r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\test_lakinh_parcel_persistent.png")
        await page.screenshot(path=sc_path)
        print(f"Screenshot saved to: {sc_path}")

        # Verify coordinates didn't drift
        assert abs(lakinh_center[0] - lakinh_center_after[0]) < 0.0001, "Center drifted!"
        assert abs(lakinh_center[1] - lakinh_center_after[1]) < 0.0001, "Center drifted!"
        assert parcel_banner_after == True, "Parcel banner disappeared!"

        await browser.close()
        print("TEST PASSED: Parcel persisted on first switch without disappearing!")

if __name__ == '__main__':
    asyncio.run(main())
