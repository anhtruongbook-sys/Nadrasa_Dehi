import asyncio
import os
from playwright.async_api import async_playwright

ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\4d72166e-a558-4f4d-91fa-f0ed6498588e"

async def run_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Mobile viewport emulation (iPhone 14 / modern Android)
        context = await browser.new_context(
            viewport={'width': 390, 'height': 844},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True
        )
        page = await context.new_page()

        print("1. Opening http://127.0.0.1:8080...")
        await page.goto("http://127.0.0.1:8080", wait_until="networkidle")
        await page.wait_for_timeout(1000)

        # Check initial screen
        header_box = await page.locator(".app-header").bounding_box()
        print(f"Header height: {header_box['height']}px (Target <= 45px)")
        assert header_box['height'] <= 46, f"Header too tall: {header_box['height']}"

        # 1. Chụp màn hình khởi động Theme Tối
        shot1 = os.path.join(ARTIFACT_DIR, "v110_dark_initial.png")
        await page.screenshot(path=shot1)
        print(f"Saved: {shot1}")

        # 2. Click trigger để mở dropdown chọn bộ bài
        print("2. Opening Deck Dropdown Menu...")
        await page.click("#deck-selector-trigger")
        await page.wait_for_timeout(400)
        dropdown_visible = await page.is_visible("#deck-dropdown")
        print(f"Dropdown visible: {dropdown_visible}")
        assert dropdown_visible, "Dropdown did not open!"

        shot2 = os.path.join(ARTIFACT_DIR, "v110_dark_dropdown.png")
        await page.screenshot(path=shot2)
        print(f"Saved: {shot2}")

        # 3. Chọn sang Bài Tây Poker
        print("3. Switching to Bài Tây Poker...")
        await page.click("#tab-mode-poker")
        await page.wait_for_timeout(500)
        
        # Kiểm tra tiêu đề đã đổi
        title_text = await page.inner_text("#app-main-title")
        print(f"Title after switch: {title_text}")
        assert "POKER" in title_text.upper(), f"Unexpected title: {title_text}"

        # 4. Rút 1 lá Poker ngẫu nhiên
        print("4. Drawing 1 Poker card...")
        await page.click("#btn-draw-single")
        await page.wait_for_timeout(800)

        shot3 = os.path.join(ARTIFACT_DIR, "v110_poker_1card.png")
        await page.screenshot(path=shot3)
        print(f"Saved: {shot3}")

        # 5. Rút tiếp 2 lá nữa bằng nút Rút tiếp ở góc phải dưới
        print("5. Drawing more cards with ergonomic right-hand button...")
        await page.click("#btn-draw-more")
        await page.wait_for_timeout(600)
        await page.click("#btn-draw-more")
        await page.wait_for_timeout(600)

        shot4 = os.path.join(ARTIFACT_DIR, "v110_poker_3cards.png")
        await page.screenshot(path=shot4)
        print(f"Saved: {shot4}")

        # 6. Đổi sang Theme Sáng (Light Theme)
        print("6. Toggling Light Theme...")
        await page.click("#btn-theme")
        await page.wait_for_timeout(500)

        shot5 = os.path.join(ARTIFACT_DIR, "v110_light_poker_3cards.png")
        await page.screenshot(path=shot5)
        print(f"Saved: {shot5}")

        # 7. Mở dropdown ở Theme Sáng để kiểm tra độ tương phản & thẩm mỹ
        print("7. Opening dropdown in Light Theme...")
        await page.click("#deck-selector-trigger")
        await page.wait_for_timeout(400)

        shot6 = os.path.join(ARTIFACT_DIR, "v110_light_dropdown.png")
        await page.screenshot(path=shot6)
        print(f"Saved: {shot6}")

        # 8. Chuyển lại về Neta Light
        print("8. Switching back to Neta Light in Light Theme...")
        await page.click("#tab-mode-neta")
        await page.wait_for_timeout(500)

        # 9. Rút 1 lá Neta Light
        await page.click("#btn-draw-single")
        await page.wait_for_timeout(800)

        shot7 = os.path.join(ARTIFACT_DIR, "v110_light_neta_1card.png")
        await page.screenshot(path=shot7)
        print(f"Saved: {shot7}")

        # 10. Test chức năng Thu bài trực tiếp 1 chạm (Không còn hộp thoại xác nhận phiền phức)
        print("10. Testing direct 1-touch Reset without modal popup...")
        await page.click("#btn-reset")
        await page.wait_for_timeout(400)
        
        # Kiểm tra hộp thoại xác nhận hoàn toàn không tồn tại trên trang
        confirm_modal = await page.query_selector("#confirm-reset-modal")
        assert confirm_modal is None, "Error: #confirm-reset-modal should not exist!"
        
        # Bàn bài được thu dọn tức thì và trở về trạng thái rỗng
        empty_visible = await page.is_visible("#empty-state")
        print(f"Empty state restored instantly: {empty_visible}")
        assert empty_visible, "Empty state not restored after direct 1-touch reset!"

        shot8 = os.path.join(ARTIFACT_DIR, "v110_instant_reset_empty.png")
        await page.screenshot(path=shot8)
        print(f"Saved: {shot8}")

        # Chuyển lại theme tối để kết thúc ở trạng thái chuẩn
        await page.click("#btn-theme")
        await page.wait_for_timeout(300)

        print("ALL TESTS PASSED 100%!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_test())
