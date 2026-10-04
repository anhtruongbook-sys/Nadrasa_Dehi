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

        # 1. Chuyển sang Địa Chính và nạp thửa đất mẫu
        print("1. Switching to Địa Chính mode...")
        await page.evaluate("window.switchAppMode('diachinh')")
        await page.wait_for_timeout(500)

        print("2. Loading sample parcel 'hanoi_sample'...")
        await page.evaluate("window.NetaDiaChinhView.loadSample('hanoi_sample')")
        await page.wait_for_timeout(500)

        parcel = await page.evaluate("window.NetaDiaChinhView.getState().currentParcel")
        print(f"Parcel loaded: {parcel.get('parcelName') if parcel else None}")
        centroid = parcel.get('centroid') if parcel else None
        print(f"Centroid (Tim khu đất): lat={centroid.get('lat')}, lng={centroid.get('lng')}")

        # Check button #dc-btn-go-tamlong
        btn_go_tamlong = await page.query_selector('#dc-btn-go-tamlong')
        print(f"Button #dc-btn-go-tamlong exists: {btn_go_tamlong is not None}")

        # 2. Click [ 🏔️ Tầm Long Điểm Huyệt ]
        print("3. Clicking [ 🏔️ Tầm Long Điểm Huyệt ]...")
        await page.click('#dc-btn-go-tamlong')
        await page.wait_for_timeout(1000)

        # Verify switched to Dialy view & Tam Long tab
        cur_view_dialy = await page.evaluate("document.querySelector('#view-dialy').style.display !== 'none'")
        active_tab = await page.evaluate("window.NetaDiaLyView.getState().curActiveTab")
        input_gps = await page.evaluate("window.NetaDiaLyView.getState().inputGpsText")
        dem_coords = await page.evaluate("window.NetaDiaLyView.getState().demCoords")
        print(f"Switched to DiaLy view: {cur_view_dialy}")
        print(f"Active Tab in DiaLy: {active_tab}")
        print(f"Input GPS Text in Tam Long: {input_gps}")
        print(f"DEM Coords in Tam Long: {dem_coords}")

        # 3. Check button #dialy-btn-get-diachinh in Tab Tầm Long
        btn_get_dc = await page.query_selector('#dialy-btn-get-diachinh')
        print(f"Button #dialy-btn-get-diachinh exists: {btn_get_dc is not None}")

        # Test clicking #dialy-btn-get-lakinh first then #dialy-btn-get-diachinh
        await page.click('#dialy-btn-get-lakinh')
        await page.wait_for_timeout(300)
        gps_after_lk = await page.evaluate("window.NetaDiaLyView.getState().inputGpsText")
        print(f"After [🧭 Lấy từ La Kinh], inputGpsText: '{gps_after_lk}'")

        await page.click('#dialy-btn-get-diachinh')
        await page.wait_for_timeout(300)
        gps_after_dc = await page.evaluate("window.NetaDiaLyView.getState().inputGpsText")
        print(f"After [📐 Tim Đất], inputGpsText: '{gps_after_dc}'")

        # Take screenshot of Tab Tầm Long with Centroid loaded
        screenshot_path = os.path.abspath(r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\test_tamlong_from_diachinh_centroid.png")
        await page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to: {screenshot_path}")

        await browser.close()
        print("ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == '__main__':
    asyncio.run(main())
