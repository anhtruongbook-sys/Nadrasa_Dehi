import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Mobile viewport: 390x844 (standard mobile width)
        context = await browser.new_context(
            permissions=['geolocation'],
            geolocation={'latitude': 21.0475, 'longitude': 105.7958, 'accuracy': 10}, # Tran Cung, Hanoi / IBST area
            viewport={'width': 390, 'height': 844},
            is_mobile=True,
            has_touch=True
        )
        page = await context.new_page()
        await page.goto("http://127.0.0.1:8080/index.html", wait_until='domcontentloaded')
        await asyncio.sleep(1.0)
        
        # Chuyển tab La Kinh
        await page.click('#deck-selector-trigger')
        await asyncio.sleep(0.4)
        await page.click('#tab-mode-lakinh')
        await asyncio.sleep(2.0)
        
        # 1. Đo kích thước và kiểm tra tràn của dock
        overflow_info = await page.evaluate("""() => {
            const dock = document.getElementById('lakinh-bottom-dock');
            const btns = Array.from(dock.querySelectorAll('.lakinh-dock-btn'));
            const rect = dock.getBoundingClientRect();
            return {
                windowWidth: window.innerWidth,
                dockLeft: rect.left,
                dockRight: rect.right,
                dockWidth: rect.width,
                isDockOverflowing: rect.right > window.innerWidth || rect.left < 0,
                buttons: btns.map(b => ({
                    text: b.innerText,
                    width: b.getBoundingClientRect().width,
                    scrollWidth: b.scrollWidth,
                    clientWidth: b.clientWidth
                }))
            };
        }""")
        print("isDockOverflowing:", overflow_info.get("isDockOverflowing"))
        print("dockWidth:", overflow_info.get("dockWidth"), "windowWidth:", overflow_info.get("windowWidth"))
        
        # Chụp ảnh tổng thể màn hình di động (kiểm chứng không bị tràn)
        await page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\lakinh_dock_no_overflow.png')
        print("Captured lakinh_dock_no_overflow.png")
        
        # 2. Bật cảm biến La Bàn và kiểm tra nút
        await page.click('#lakinh-dock-sensor')
        await asyncio.sleep(0.5)
        
        # Giả lập phát sự kiện con quay 3D nghiêng
        await page.evaluate("""() => {
            // Giả lập sự kiện deviceorientationabsolute
            const event = new Event('deviceorientationabsolute');
            event.alpha = 345.7; // Tương đương heading 14.3°
            event.beta = 35.0;   // Nghiêng tay 35 độ
            event.gamma = 3.0;   // Lắc nhẹ 3 độ
            event.absolute = true;
            window.dispatchEvent(event);
        }""")
        await asyncio.sleep(1.0)
        
        await page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\lakinh_sensor_active_no_overflow.png')
        print("Captured lakinh_sensor_active_no_overflow.png")
        
        await browser.close()

if __name__ == '__main__':
    asyncio.run(run())
