import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Grant geolocation permission and mock location (Hoan Kiem, Hanoi)
        context = await browser.new_context(
            permissions=['geolocation'],
            geolocation={'latitude': 21.028511, 'longitude': 105.854167, 'accuracy': 15},
            viewport={'width': 412, 'height': 915},
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
        
        # 1. Kéo bản đồ đi nơi khác (TP. Hồ Chí Minh)
        await page.evaluate("""() => {
            // Giả lập người dùng vuốt/kéo bản đồ đến TP. Hồ Chí Minh
            const map = window.L && document.querySelector('#lakinh-map')?._leaflet_map;
            // Or access via global if exposed or search chip
            const btnHcm = document.querySelector('[data-city-idx="1"]');
        }""")
        
        # Mở modal tìm kiếm và chọn TP. Hồ Chí Minh
        await page.click('#lakinh-btn-search')
        await asyncio.sleep(0.5)
        await page.click('[data-city-idx="1"]') # TP. Hồ Chí Minh
        await asyncio.sleep(2.0)
        
        # Chụp ảnh khi đang ở TP.HCM
        await page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\lakinh_panned_to_hcm.png')
        print("Captured lakinh_panned_to_hcm.png (At Ho Chi Minh City)")
        
        # 2. Bấm nút nổi 'Về Vị Trí Hiện Tại'
        await page.click('#lakinh-btn-my-location')
        await asyncio.sleep(3.0)
        
        # Chụp ảnh sau khi bay về lại vị trí GPS Hà Nội
        await page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\lakinh_returned_to_my_location.png')
        print("Captured lakinh_returned_to_my_location.png (Returned to GPS Location)")
        
        await browser.close()

if __name__ == '__main__':
    asyncio.run(run())
