import asyncio
import os
import sys
from playwright.async_api import async_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b"

async def test_thuoc_lap_cuc():
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

        print("Navigating to http://127.0.0.1:8080/index.html...")
        await page.goto("http://127.0.0.1:8080/index.html", wait_until="domcontentloaded")
        await asyncio.sleep(1.0)

        # Chuyển sang tab La Kinh
        print("Switching to La Kinh tab...")
        await page.click('#deck-selector-trigger')
        await asyncio.sleep(0.5)
        await page.click('#tab-mode-lakinh')
        await asyncio.sleep(2.0)

        # 1. Kiểm tra ảnh đĩa La Kinh mặc định
        disc = await page.wait_for_selector('#lakinh-disc', timeout=5000)
        src = await disc.get_attribute('src')
        print(f"Default disc src: {src}")
        assert "thuoc_lap_cuc.png" in src, f"Expected thuoc_lap_cuc.png but got {src}"

        # Chụp ảnh giao diện chính với Thước Lập Cực mới siêu nét
        shot_main = os.path.join(ARTIFACT_DIR, "lakinh_thuoc_lap_cuc_main_view.png")
        await page.screenshot(path=shot_main)
        print(f"Saved main view screenshot: {shot_main}")

        # 2. Mở Bảng Điều Khiển Bottom Sheet
        print("Opening Bottom Sheet...")
        await page.click('#lakinh-dock-tools')
        await asyncio.sleep(0.8)

        shot_sheet = os.path.join(ARTIFACT_DIR, "lakinh_thuoc_lap_cuc_bottom_sheet.png")
        await page.screenshot(path=shot_sheet)
        print(f"Saved bottom sheet screenshot: {shot_sheet}")

        # 3. Chuyển sang mẫu Mica Trong Suốt
        print("Switching to Mica Trong Suốt...")
        await page.click('#btn-plate-trans')
        await asyncio.sleep(0.5)

        src_trans = await disc.get_attribute('src')
        print(f"Trans disc src: {src_trans}")
        assert "thuoc_lap_cuc_trans.png" in src_trans, f"Expected thuoc_lap_cuc_trans.png but got {src_trans}"

        # Đóng sheet để chụp ảnh toàn màn hình Mica Trong Suốt
        await page.click('#sheet-close-btn')
        await asyncio.sleep(0.5)

        shot_trans = os.path.join(ARTIFACT_DIR, "lakinh_thuoc_lap_cuc_trans_view.png")
        await page.screenshot(path=shot_trans)
        print(f"Saved trans view screenshot: {shot_trans}")

        await browser.close()
        print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(test_thuoc_lap_cuc())
