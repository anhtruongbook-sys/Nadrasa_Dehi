import asyncio
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 390, 'height': 844})
        page = await context.new_page()

        # 1. Truy cập local server
        await page.goto('http://127.0.0.1:8080/index.html')
        await page.wait_for_selector('#btn-sound')

        # 2. Kiểm tra trạng thái mặc định: TẮT ÂM THANH
        sound_icon_text = await page.locator('#sound-icon').text_content()
        btn_title = await page.locator('#btn-sound').get_attribute('title')
        print(f"Trạng thái ban đầu: Icon={sound_icon_text}, Title={btn_title}")
        assert '🔕' in sound_icon_text, f"Lỗi: Icon ban đầu phải là 🔕, nhận được: {sound_icon_text}"
        assert 'Bật' in btn_title, f"Lỗi: Title ban đầu phải chứa chữ 'Bật', nhận được: {btn_title}"

        # 3. Thử rút 1 lá bài khi đang tắt âm thanh
        await page.click('#btn-draw-single')
        await page.wait_for_selector('.card-item')
        card_count = await page.locator('.card-item').count()
        print(f"Rút bài thành công khi tắt âm: {card_count} lá")
        assert card_count == 1, "Phải có đúng 1 lá bài"

        # 4. Bấm nút âm thanh để BẬT lên
        await page.click('#btn-sound')
        await page.wait_for_timeout(300)
        sound_icon_after_on = await page.locator('#sound-icon').text_content()
        btn_title_after_on = await page.locator('#btn-sound').get_attribute('title')
        toast_text = await page.locator('#toast').text_content()
        print(f"Sau khi bật: Icon={sound_icon_after_on}, Title={btn_title_after_on}, Toast={toast_text}")
        assert '🔔' in sound_icon_after_on, f"Lỗi: Icon sau khi bật phải là 🔔, nhận được: {sound_icon_after_on}"
        assert 'Tắt' in btn_title_after_on, f"Lỗi: Title sau khi bật phải chứa 'Tắt', nhận được: {btn_title_after_on}"
        assert 'bật' in toast_text.lower(), f"Lỗi: Toast phải thông báo đã bật, nhận được: {toast_text}"

        # 5. Bấm nút âm thanh lần nữa để TẮT lại
        await page.click('#btn-sound')
        await page.wait_for_timeout(300)
        sound_icon_after_off = await page.locator('#sound-icon').text_content()
        btn_title_after_off = await page.locator('#btn-sound').get_attribute('title')
        toast_off_text = await page.locator('#toast').text_content()
        print(f"Sau khi tắt: Icon={sound_icon_after_off}, Title={btn_title_after_off}, Toast={toast_off_text}")
        assert '🔕' in sound_icon_after_off, f"Lỗi: Icon sau khi tắt phải là 🔕, nhận được: {sound_icon_after_off}"
        assert 'Bật' in btn_title_after_off, f"Lỗi: Title sau khi tắt phải chứa 'Bật', nhận được: {btn_title_after_off}"

        # Chụp ảnh xác thực
        await page.screenshot(path='screenshot_sound_default_verified.png')
        print("Đã chụp ảnh xác thực: screenshot_sound_default_verified.png")

        await browser.close()
        print("ALL SOUND DEFAULT TESTS PASSED 100% PERFECTLY!")

if __name__ == '__main__':
    asyncio.run(main())
