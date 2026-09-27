import asyncio
import sys
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 360, 'height': 780})
        await page.goto('http://127.0.0.1:8090/index.html')
        await page.wait_for_timeout(600)

        # 1. Chuyển sang màn hình La Kinh
        await page.click('#deck-selector-trigger')
        await page.wait_for_timeout(300)
        await page.click('#tab-mode-lakinh')
        await page.wait_for_timeout(1000)

        # 2. Bật tia ngắm
        await page.click('#lakinh-btn-ray-float')
        await page.wait_for_timeout(500)

        # 3. Đặt góc xoay nhà 144.5° và tia ngắm 344.2° như trong hình chụp người dùng
        await page.evaluate('''() => {
            window.lakinhState.rotation = 144.5;
            window.NetaLaKinhView.updateRotation(144.5);
            window.NetaLaKinhView.setRayAngle(344.2);
        }''')
        await page.wait_for_timeout(500)

        # Thu gọn để hiển thị Mini Card
        await page.click('#btn-ray-hud-collapse')
        await page.wait_for_timeout(400)

        # 4. Trích xuất và kiểm tra thông số chi tiết đầy đủ trên Mini Card
        data = await page.evaluate('''() => {
            const mini = document.getElementById('lakinh-ray-mini-pill');
            const deg = document.getElementById('ray-mini-deg')?.textContent || '';
            const son = document.getElementById('ray-mini-son')?.textContent || '';
            const que = document.getElementById('ray-mini-que')?.textContent || '';
            const khivan = document.getElementById('ray-mini-khivan')?.textContent || '';
            const hao = document.getElementById('ray-mini-hao')?.textContent || '';
            const badge = document.getElementById('ray-mini-badge')?.textContent || '';
            const rect = mini.getBoundingClientRect();

            return {
                visible: window.getComputedStyle(mini).display !== 'none',
                deg,
                son,
                que,
                khivan,
                hao,
                badge,
                width: rect.width,
                left: rect.left,
                right: rect.right,
                noOverflow: rect.left >= 0 && rect.right <= 360 && rect.width <= 360
            };
        }''')

        print("=== KẾT QUẢ KIỂM TRA MINI CARD TIA NGẮM ===")
        print(f"Hiển thị: {data['visible']}")
        print(f"Độ số: {data['deg']}")
        print(f"Sơn: {data['son']}")
        print(f"Tên Quẻ: {data['que']}")
        print(f"Khí Vận: {data['khivan']}")
        print(f"Hào & Lục Thân: {data['hao']}")
        print(f"Linh / Chính Thần: {data['badge']}")
        print(f"Kích thước: width={data['width']}px, left={data['left']}px, right={data['right']}px")
        print(f"Không tràn màn hình: {data['noOverflow']}")

        assert data['visible'], "Mini Card phải hiển thị!"
        assert "344.2" in data['deg'], f"Độ số phải là 344.2°, nhận được: {data['deg']}"
        assert "Nhâm" in data['son'], f"Sơn phải chứa Nhâm, nhận được: {data['son']}"
        assert len(data['que']) > 1, f"Tên quẻ không được rỗng, nhận được: {data['que']}"
        assert "Khí" in data['khivan'] and "Vận" in data['khivan'], f"Khí vận phải đầy đủ, nhận được: {data['khivan']}"
        assert "Hào" in data['hao'] and "(" in data['hao'], f"Hào phải có thông tin Lục Thân trong ngoặc, nhận được: {data['hao']}"
        assert len(data['badge']) > 2, f"Badge Linh/Chính thần phải có nội dung, nhận được: {data['badge']}"
        assert data['noOverflow'], f"Mini Card không được tràn màn hình 360px! {data}"

        # 5. Chụp ảnh màn hình kiểm chứng
        screenshot_path = 'C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/test_ray_full_hkdq_verified.png'
        await page.screenshot(path=screenshot_path)
        print(f"Ảnh chụp màn hình đã lưu tại: {screenshot_path}")

        # 6. Kiểm tra mở rộng chi tiết khi chạm vào nút ▾ Chi tiết hoặc Hàng 2 HKDQ
        await page.click('#btn-ray-mini-expand')
        await page.wait_for_timeout(400)
        is_expanded = await page.is_visible('#lakinh-ray-floating-hud')
        assert is_expanded, "Chạm vào '▾ Chi tiết' phải mở rộng bảng Floating HUD!"
        print("Mở rộng bảng chi tiết thành công!")

        # 7. Thu gọn lại
        await page.click('#btn-ray-hud-collapse')
        await page.wait_for_timeout(400)
        assert await page.is_visible('#lakinh-ray-mini-pill'), "Sau khi thu gọn, Mini Card phải xuất hiện lại!"

        # 8. Tắt tia ngắm bằng nút ✕ trên Mini Card
        await page.click('#btn-ray-mini-close')
        await page.wait_for_timeout(400)
        is_ray_hidden = await page.evaluate('''() => {
            return !window.lakinhState.isRayActive &&
                   document.getElementById('lakinh-ray-mini-pill').style.display === 'none';
        }''')
        assert is_ray_hidden, "Bấm nút [✕] trên Mini Card phải tắt tia ngắm thành công!"
        print("Tắt tia ngắm qua nút [✕] thành công!")

        print("\n>>> TẤT CẢ 8 BƯỚC KIỂM TRA ĐẠT 100% <<<")
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
