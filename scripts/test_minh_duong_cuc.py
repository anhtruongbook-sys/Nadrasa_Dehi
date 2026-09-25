import asyncio
import os
import sys
from playwright.async_api import async_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b"

async def test_minh_duong():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            permissions=['geolocation'],
            geolocation={'latitude': 21.0475, 'longitude': 105.7958, 'accuracy': 10},
            viewport={'width': 390, 'height': 844},
            is_mobile=True,
            has_touch=True
        )
        page = await context.new_page()

        print("Navigating to http://127.0.0.1:8080/index.html...")
        await page.goto("http://127.0.0.1:8080/index.html", wait_until="domcontentloaded")
        await asyncio.sleep(1.0)

        # Chuyển tab La Kinh
        print("Switching to La Kinh tab...")
        await page.click('#deck-selector-trigger')
        await asyncio.sleep(0.5)
        await page.click('#tab-mode-lakinh')
        await asyncio.sleep(2.0)

        # Kiểm tra nút Quét Cục
        dem_btn = await page.wait_for_selector("#lakinh-dock-dem", timeout=5000)
        assert dem_btn, "Button #lakinh-dock-dem not found!"
        print("Clicking #lakinh-dock-dem...")
        await dem_btn.click()

        # Đợi modal xuất hiện (quét DEM 3 cấp)
        print("Waiting for #modal-minhduong-overlay...")
        modal = await page.wait_for_selector("#modal-minhduong-overlay", timeout=12000)
        assert modal, "Modal #modal-minhduong-overlay not displayed!"

        modal_text = await modal.inner_text()
        print("\n--- MODAL CONTENT PREVIEW ---")
        try:
            print(modal_text)
        except Exception:
            print(modal_text.encode('utf-8', errors='ignore').decode('utf-8'))
        print("-----------------------------\n")

        # Kiểm tra các tiêu chí bất biến
        assert "THIÊN BÀN PHÙNG CHÂM" in modal_text, "Missing THIÊN BÀN PHÙNG CHÂM in title!"
        assert "Thủy Khẩu (Thiên Bàn Phùng Châm):" in modal_text, "Missing Thủy Khẩu Thiên Bàn label!"
        assert "Song Sơn" in modal_text, "Missing Song Sơn in modal content!"
        assert "Tam Hợp Trường Sinh:" in modal_text, "Missing Tam Hợp Trường Sinh in modal content!"

        # Chụp ảnh artifact
        screenshot_path = os.path.join(ARTIFACT_DIR, "lakinh_thien_ban_phung_cham_cuc_modal.png")
        await page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to: {screenshot_path}")

        await browser.close()
        print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(test_minh_duong())
