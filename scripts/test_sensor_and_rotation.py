import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 412, 'height': 915})
        page = await context.new_page()
        
        file_url = "file:///c:/Books/Neta Light/index.html"
        await page.goto(file_url, wait_until='domcontentloaded')
        await asyncio.sleep(1.0)
        
        # Chuyển tab La Kinh
        await page.click('#deck-selector-trigger')
        await asyncio.sleep(0.4)
        await page.click('#tab-mode-lakinh')
        await asyncio.sleep(1.5)
        
        # 1. Kiểm tra góc 0° (Chuẩn Bắc): Sơn Tý ở 12h, Kim la bàn chỉ thẳng lên 12h
        await page.evaluate("""() => {
            // Đặt góc 0°
            const sRot = document.getElementById('sheet-slider-rotation');
            if (sRot) {
                sRot.value = 0;
                sRot.dispatchEvent(new Event('input'));
            }
        }""")
        await asyncio.sleep(1.0)
        await page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\lakinh_rotation_0deg_north.png')
        print("Captured: lakinh_rotation_0deg_north.png")
        
        # 2. Kiểm tra góc 318.9° (Sơn Càn - trường hợp thực tế của người dùng)
        # Tại 318.9°: Vạch ngắm 12h chỉ Sơn Càn; Kim Bắc đỏ quay về hướng 41.1° (Đông Bắc - hướng Bắc thực của Trái Đất)
        await page.evaluate("""() => {
            const sRot = document.getElementById('sheet-slider-rotation');
            if (sRot) {
                sRot.value = 318.9;
                sRot.dispatchEvent(new Event('input'));
            }
        }""")
        await asyncio.sleep(1.0)
        await page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\lakinh_rotation_318deg_can.png')
        print("Captured: lakinh_rotation_318deg_can.png")
        
        # 3. Kiểm tra góc 90° (Sơn Mão - Đông)
        # Tại 90°: Vạch ngắm 12h chỉ Sơn Mão; Kim Bắc đỏ quay về hướng 270° (Bên trái 9h - hướng Bắc thực của Trái Đất)
        await page.evaluate("""() => {
            const sRot = document.getElementById('sheet-slider-rotation');
            if (sRot) {
                sRot.value = 90.0;
                sRot.dispatchEvent(new Event('input'));
            }
        }""")
        await asyncio.sleep(1.0)
        await page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\lakinh_rotation_90deg_east.png')
        print("Captured: lakinh_rotation_90deg_east.png")
        
        # 4. Kiểm tra cảm biến La Bàn Live kích hoạt
        await page.evaluate("""() => {
            // Giả lập sự kiện deviceorientationabsolute với alpha = 41.1 (ứng với hướng máy 318.9° Tây Bắc)
            const btn = document.getElementById('lakinh-dock-sensor');
            if (btn) btn.click();
            
            // Dispatch absolute event
            window.dispatchEvent(new DeviceOrientationEvent('deviceorientationabsolute', {
                alpha: 41.1,
                beta: 35.0,
                gamma: 0.0,
                absolute: true
            }));
        }""")
        await asyncio.sleep(1.2)
        await page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\lakinh_live_sensor_active.png')
        print("Captured: lakinh_live_sensor_active.png")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(run())
