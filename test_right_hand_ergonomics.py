import asyncio
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Khởi tạo viewport chuẩn điện thoại của người dùng (390x844)
        context = await browser.new_context(viewport={'width': 390, 'height': 844})
        page = await context.new_page()

        await page.goto('http://127.0.0.1:8080/index.html')
        await page.wait_for_selector('#app-container')

        # Chuyển sang Bài Tây Poker
        await page.click('#tab-mode-poker')
        await page.wait_for_timeout(200)

        # Chuyển sang Theme Sáng (như ảnh người dùng gửi)
        current_theme = await page.evaluate("() => document.body.classList.contains('theme-light')")
        if not current_theme:
            await page.click('#btn-theme')
            await page.wait_for_timeout(200)

        # Rút bài 1 lá đầu tiên
        await page.click('#btn-draw-single')
        await page.wait_for_selector('.card-item')

        # Rút thêm 4 lá nữa để đủ 5 lá bài như trong ảnh người dùng gửi
        for i in range(4):
            await page.click('#btn-draw-more')
            await page.wait_for_timeout(100)

        card_count = await page.locator('.card-item').count()
        print(f"Đã rút tổng cộng {card_count} lá bài.")

        # Lấy tọa độ bounding box của các nút trong thanh điều khiển
        box_reset = await page.locator('#btn-reset').bounding_box()
        box_shuffle = await page.locator('#btn-shuffle').bounding_box()
        box_reading = await page.locator('#btn-session-reading').bounding_box()
        box_draw_more = await page.locator('#btn-draw-more').bounding_box()

        print("Tọa độ X của các nút từ trái sang phải:")
        print(f"  1. Thu bài: X = {box_reset['x']:.1f}")
        print(f"  2. Xáo bài: X = {box_shuffle['x']:.1f}")
        print(f"  3. Luận giải: X = {box_reading['x']:.1f}")
        print(f"  4. Rút tiếp: X = {box_draw_more['x']:.1f}")

        # Kiểm tra điều kiện công thái học tay phải:
        # Nút Thu bài (nguy hiểm) phải ở ngoài cùng bên trái (X nhỏ nhất)
        assert box_reset['x'] < box_shuffle['x'], "Lỗi: Nút Thu bài phải nằm bên trái nút Xáo bài"
        assert box_shuffle['x'] < box_reading['x'], "Lỗi: Nút Xáo bài phải nằm bên trái nút Luận giải"
        assert box_reading['x'] < box_draw_more['x'], "Lỗi: Nút Luận giải phải nằm bên trái nút Rút tiếp"
        # Nút Rút tiếp phải ở ngoài cùng bên phải (X lớn nhất)
        assert box_draw_more['x'] > box_reading['x'], "Lỗi: Nút Rút tiếp phải nằm ở ngoài cùng bên phải!"

        print("\n✅ KIỂM TRA CÔNG THÁI HỌC TAY PHẢI: HOÀN TOÀN CHUẨN XÁC!")
        print("  -> Nút 'Rút tiếp' nằm tại góc dưới bên phải, ngay dưới tầm với tự nhiên của ngón cái tay phải.")
        print("  -> Nút 'Thu bài' được đưa sang góc xa nhất bên trái, tránh hoàn toàn rủi ro bấm nhầm.")

        # Chụp ảnh xác thực
        await page.screenshot(path='screenshot_right_hand_ergonomics.png')
        print("Đã chụp ảnh xác thực: screenshot_right_hand_ergonomics.png")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
