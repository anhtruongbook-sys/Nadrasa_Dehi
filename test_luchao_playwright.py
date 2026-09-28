import asyncio
from playwright.async_api import async_playwright
import os
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

async def run_tests():
    artifact_dir = r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612"
    errors = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 900})
        page = await context.new_page()

        page.on("console", lambda msg: errors.append(f"CONSOLE: {msg.text}") if msg.type == "error" else None)
        page.on("pageerror", lambda exc: errors.append(f"PAGEERROR: {exc}"))
        page.on("dialog", lambda dialog: dialog.accept())

        print("Navigating to http://localhost:8090/index.html ...")
        await page.goto("http://localhost:8090/index.html", wait_until="networkidle")
        await page.wait_for_timeout(1000)

        # 1. Mở menu và chuyển sang tab Kinh Dịch Lục Hào
        print("Clicking dropdown menu...")
        await page.click("#deck-selector-trigger")
        await page.wait_for_timeout(500)
        await page.screenshot(path=os.path.join(artifact_dir, "test_luchao_1_dropdown.png"))

        print("Selecting tab-mode-luchao...")
        await page.click("#tab-mode-luchao")
        await page.wait_for_timeout(1000)

        # Kiểm tra view-luchao hiển thị
        is_visible = await page.is_visible("#view-luchao")
        print(f"View Lục Hào visible: {is_visible}")
        assert is_visible, "view-luchao is not visible!"

        await page.screenshot(path=os.path.join(artifact_dir, "test_luchao_2_initial_bangque.png"))

        # 2. Kiểm tra các Subtabs
        print("Clicking Subtab 8 Bước...")
        await page.click('button[data-subtab="quy_trinh_8_buoc"]')
        await page.wait_for_timeout(600)
        await page.screenshot(path=os.path.join(artifact_dir, "test_luchao_3_8steps.png"))

        print("Clicking Subtab Phong Thủy 6 Hào...")
        await page.click('button[data-subtab="phong_thuy"]')
        await page.wait_for_timeout(600)
        await page.screenshot(path=os.path.join(artifact_dir, "test_luchao_4_fengshui.png"))

        print("Clicking Subtab Báo Cáo Toàn Văn...")
        await page.click('button[data-subtab="bao_cao"]')
        await page.wait_for_timeout(600)
        await page.screenshot(path=os.path.join(artifact_dir, "test_luchao_5_baocao.png"))

        # 3. Thử đổi chuyên đề sang Bệnh tật & Sức khỏe
        print("Changing topic to benh_tat...")
        await page.select_option("#luchao-topic-select", "benh_tat")
        await page.wait_for_timeout(600)
        await page.click('button[data-subtab="bang_que"]')
        await page.wait_for_timeout(600)
        await page.screenshot(path=os.path.join(artifact_dir, "test_luchao_6_topic_benhtat.png"))

        # 4. Thử phương thức gieo tiền xu
        print("Switching to Coin mode...")
        await page.click('button[data-method="coin"]')
        await page.wait_for_timeout(600)
        
        # Reset coin về 0/6 hào
        print("Resetting coins to 0...")
        await page.click("#luchao-btn-coin-reset")
        await page.wait_for_timeout(400)
        await page.screenshot(path=os.path.join(artifact_dir, "test_luchao_7_coin_mode.png"))

        print("Throwing coins 6 times...")
        for i in range(6):
            btn = page.locator("#luchao-btn-throw-coin")
            if await btn.is_enabled():
                await btn.click()
                await page.wait_for_timeout(800)

        await page.screenshot(path=os.path.join(artifact_dir, "test_luchao_8_coin_completed.png"))

        # 5. Thử phương thức nhập số Seri
        print("Switching to Serial mode...")
        await page.click('button[data-method="serial"]')
        await page.wait_for_timeout(600)
        await page.fill("#luchao-serial-number", "888999")
        await page.click("#luchao-btn-cast")
        await page.wait_for_timeout(800)
        await page.screenshot(path=os.path.join(artifact_dir, "test_luchao_9_serial_mode.png"))

        # 6. Kiểm tra Cầu Nối Ứng Kỳ -> Trạch Cát Đại Cát
        print("Testing Auspicious Days Finder from Ung Ky...")
        await page.click('button[data-subtab="quy_trinh_8_buoc"]')
        await page.wait_for_timeout(600)
        await page.click("#luchao-btn-find-auspicious")
        await page.wait_for_timeout(800)
        await page.screenshot(path=os.path.join(artifact_dir, "test_luchao_10_auspicious_days.png"))

        # 7. Kiểm tra Sổ Tay Nhật Ký Quẻ
        print("Testing Hexagram Journal & Verification...")
        await page.click('button[data-subtab="nhat_ky"]')
        await page.wait_for_timeout(600)
        
        # Nhấn lưu quẻ hiện tại
        await page.click("#luchao-btn-save-current")
        await page.wait_for_timeout(600)
        await page.screenshot(path=os.path.join(artifact_dir, "test_luchao_11_journal_saved.png"))

        # Cập nhật kết quả kiểm chứng
        verify_btn = page.locator(".btn-save-verify").first
        if await verify_btn.count() > 0:
            await page.select_option(".verify-select", "success")
            await page.fill(".verify-text-input", "Hậu kiểm thực tế: Ký kết hợp đồng thành công vào đúng ngày Thân.")
            await verify_btn.click()
            await page.wait_for_timeout(600)
            await page.screenshot(path=os.path.join(artifact_dir, "test_luchao_12_journal_verified.png"))

        # 8. Kiểm tra Subtab 6: Án Lệ Thầy Cường (290 Quẻ)
        print("Testing Subtab 6: Án Lệ Thầy Cường (290 Quẻ)...")
        await page.click('button[data-subtab="an_le_ntc"]')
        await page.wait_for_timeout(800)
        await page.screenshot(path=os.path.join(artifact_dir, "test_luchao_13_an_le_main.png"))

        # Test filter chip
        print("Testing Filter Chip Khối 5: Phong Thủy...")
        await page.click('button[data-filter="khoi_5"]')
        await page.wait_for_timeout(600)
        await page.screenshot(path=os.path.join(artifact_dir, "test_luchao_14_an_le_filtered.png"))

        # Test search
        print("Testing Search Keyword 'giếng'...")
        await page.fill("#anle-search-input", "giếng")
        await page.press("#anle-search-input", "Enter")
        await page.wait_for_timeout(600)
        await page.screenshot(path=os.path.join(artifact_dir, "test_luchao_15_an_le_searched.png"))

        # Test open modal
        view_btn = page.locator(".btn-anle-view").first
        if await view_btn.count() > 0:
            print("Opening Case Study Modal...")
            await view_btn.click()
            await page.wait_for_timeout(600)
            await page.screenshot(path=os.path.join(artifact_dir, "test_luchao_16_an_le_modal.png"))

            # Close modal
            await page.click("#btn-anle-modal-close")
            await page.wait_for_timeout(400)

        print("Done testing!")
        print(f"Total Errors detected: {len(errors)}")
        for err in errors:
            print("  - ", err)

        assert len(errors) == 0, f"Errors occurred during test: {errors}"
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_tests())
