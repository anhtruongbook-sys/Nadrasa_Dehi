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

        # 2. KIỂM TRA NÚT BẬT TẮT TIA NGẮM: THU GỌN VÀ SẮP XẾP XUỐNG DƯỚI
        fab_info = await page.evaluate('''() => {
            const btnRay = document.getElementById('lakinh-btn-ray-float');
            const btnGps = document.getElementById('lakinh-btn-my-location');
            const rectRay = btnRay.getBoundingClientRect();
            const rectGps = btnGps.getBoundingClientRect();
            const csRay = window.getComputedStyle(btnRay);

            return {
                ray: {
                    width: rectRay.width,
                    height: rectRay.height,
                    bottom: window.innerHeight - rectRay.bottom,
                    right: window.innerWidth - rectRay.right,
                    borderRadius: csRay.borderRadius,
                    text: btnRay.innerText.trim(),
                    display: csRay.display
                },
                gps: {
                    width: rectGps.width,
                    height: rectGps.height,
                    bottom: window.innerHeight - rectGps.bottom,
                    right: window.innerWidth - rectGps.right
                }
            };
        }''')

        print("=== 1. KIỂM TRA NÚT BẬT TẮT TIA NGẮM THU GỌN ===")
        print(f"Kích thước nút Tia Ngắm: {fab_info['ray']['width']}x{fab_info['ray']['height']} px")
        print(f"Vị trí: bottom={fab_info['ray']['bottom']:.1f}px, right={fab_info['ray']['right']:.1f}px")
        print(f"Biểu tượng/Nội dung: '{fab_info['ray']['text']}'")
        print(f"Vị trí nút GPS cạnh bên: bottom={fab_info['gps']['bottom']:.1f}px, right={fab_info['gps']['right']:.1f}px")

        # Kiểm tra nút là hình tròn gọn 38px
        assert abs(fab_info['ray']['width'] - 38) <= 2, f"Chiều rộng phải ~38px, nhận được {fab_info['ray']['width']}"
        assert abs(fab_info['ray']['height'] - 38) <= 2, f"Chiều cao phải ~38px, nhận được {fab_info['ray']['height']}"
        assert fab_info['ray']['text'] == "🎯", f"Nút chỉ chứa biểu tượng 🎯 siêu gọn, nhận được: '{fab_info['ray']['text']}'"
        assert fab_info['ray']['bottom'] < 80, f"Nút phải được sắp xếp xuống dưới (<80px), nhận được: {fab_info['ray']['bottom']}px"
        assert fab_info['ray']['right'] > fab_info['gps']['right'], "Nút tia ngắm phải nằm cạnh nút GPS ở hàng dưới"
        print("✓ Nút tia ngắm đã thu gọn tròn 38px và sắp xếp xuống dưới thành công!")

        # 3. Chạm nút tia ngắm để bật
        await page.click('#lakinh-btn-ray-float')
        await page.wait_for_timeout(300)
        is_active = await page.evaluate('''() => {
            const btn = document.getElementById('lakinh-btn-ray-float');
            return window.lakinhState.isRayActive && btn.classList.contains('active');
        }''')
        assert is_active, "Chạm nút tròn 🎯 phải bật tia ngắm và có class active!"
        print("✓ Bật tia ngắm qua nút tròn thành công!")

        # Chụp ảnh kiểm chứng màn hình với 2 nút tròn gọn gàng góc dưới
        screenshot_path = 'C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/test_compact_fab_verified.png'
        await page.screenshot(path=screenshot_path)
        print(f"✓ Đã lưu ảnh chụp FAB gọn: {screenshot_path}")

        # 4. KIỂM TRA CHỐNG BẤM NHẦM KHI VUỐT TRÊN MÀN HÌNH CHÍNH (SWIPE-SAFE ON DOCK TOOLS)
        print("\n=== 2. KIỂM TRA CHỐNG BẤM NHẦM KHI VUỐT ===")
        # Giả lập thao tác vuốt lên (pointerdown -> pointermove dy=35px -> click) trên nút ⚙️ Công Cụ
        await page.evaluate('''() => {
            const btn = document.getElementById('lakinh-dock-tools');
            const rect = btn.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;

            btn.dispatchEvent(new PointerEvent('pointerdown', { clientX: cx, clientY: cy, bubbles: true }));
            btn.dispatchEvent(new PointerEvent('pointermove', { clientX: cx, clientY: cy - 35, bubbles: true }));
            btn.dispatchEvent(new MouseEvent('click', { clientX: cx, clientY: cy - 35, bubbles: true }));
        }''')
        await page.wait_for_timeout(300)
        is_sheet_open_after_swipe = await page.evaluate('window.lakinhState.isSheetOpen')
        print(f"Bảng điều khiển có bị mở nhầm sau khi vuốt lướt qua nút không: {is_sheet_open_after_swipe}")
        assert not is_sheet_open_after_swipe, "Vuốt lướt qua nút Công Cụ KHÔNG ĐƯỢC mở nhầm Bảng Điều Khiển!"
        print("✓ Thao tác vuốt lướt không gây bấm nhầm Bảng Điều Khiển!")

        # 5. Chạm dứt khoát tại chỗ (stationary tap) để mở Bảng Điều Khiển
        await page.evaluate('''() => {
            const btn = document.getElementById('lakinh-dock-tools');
            const rect = btn.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;

            btn.dispatchEvent(new PointerEvent('pointerdown', { clientX: cx, clientY: cy, bubbles: true }));
            btn.dispatchEvent(new MouseEvent('click', { clientX: cx, clientY: cy, bubbles: true }));
        }''')
        await page.wait_for_timeout(400)
        is_sheet_open_after_tap = await page.evaluate('window.lakinhState.isSheetOpen')
        assert is_sheet_open_after_tap, "Chạm dứt khoát tại chỗ PHẢI mở Bảng Điều Khiển!"
        print("✓ Chạm dứt khoát tại chỗ mở Bảng Điều Khiển thành công!")

        # 6. KIỂM TRA CHỐNG BẤM NHẦM KHI CUỘN VUỐT BÊN TRONG BẢNG ĐIỀU KHIỂN
        print("\n=== 3. KIỂM TRA CHỐNG BẤM NHẦM TRONG BẢNG ĐIỀU KHIỂN ===")
        # Lưu đĩa hiện tại
        initial_plate = await page.evaluate('window.lakinhState.activePlate')
        # Giả lập thao tác vuốt cuộn lên trên đè lên nút Dạ Quang (touchmove dy=25px rồi click)
        await page.evaluate('''() => {
            const sheet = document.getElementById('lakinh-bottom-sheet');
            const btnGold = document.getElementById('btn-plate-gold');
            
            const t1 = new Touch({ identifier: Date.now(), target: sheet, clientX: 100, clientY: 400 });
            sheet.dispatchEvent(new TouchEvent('touchstart', { touches: [t1], targetTouches: [t1], changedTouches: [t1], bubbles: true }));
            
            const t2 = new Touch({ identifier: Date.now(), target: sheet, clientX: 100, clientY: 370 });
            sheet.dispatchEvent(new TouchEvent('touchmove', { touches: [t2], targetTouches: [t2], changedTouches: [t2], bubbles: true }));
            
            btnGold.click(); // Click phát sinh khi thả tay sau khi vuốt
        }''')
        await page.wait_for_timeout(300)
        plate_after_swipe = await page.evaluate('window.lakinhState.activePlate')
        print(f"Đĩa La Kinh ban đầu: {initial_plate}, Đĩa sau khi vuốt cuộn: {plate_after_swipe}")
        assert plate_after_swipe == initial_plate, "Khi đang vuốt cuộn bảng điều khiển, nút KHÔNG ĐƯỢC bị bấm nhầm!"
        print("✓ Vuốt cuộn bên trong bảng điều khiển hoàn toàn chống bấm nhầm 100%!")

        # 7. KIỂM TRA VUỐT XUỐNG ĐỂ THU GỌN BẢNG ĐIỀU KHIỂN (SWIPE DOWN TO DISMISS)
        await page.evaluate('''() => {
            const handle = document.getElementById('sheet-handle');
            const tStart = new Touch({ identifier: 1, target: handle, clientX: 180, clientY: 350 });
            handle.dispatchEvent(new TouchEvent('touchstart', { touches: [tStart], changedTouches: [tStart], bubbles: true }));
            
            const tEnd = new Touch({ identifier: 1, target: handle, clientX: 180, clientY: 420 });
            handle.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [tEnd], bubbles: true }));
        }''')
        await page.wait_for_timeout(400)
        is_sheet_closed_swipe = await page.evaluate('!window.lakinhState.isSheetOpen')
        assert is_sheet_closed_swipe, "Vuốt xuống trên thanh gạt handle phải thu gọn bảng điều khiển!"
        print("✓ Vuốt xuống trên thanh gạt thu gọn bảng điều khiển thành công!")

        print("\n>>> TẤT CẢ CÁC BƯỚC KIỂM TRA ĐẠT 100% <<<")
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
