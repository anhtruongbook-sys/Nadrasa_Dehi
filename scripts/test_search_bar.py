import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Mobile viewport: 390x844
        context = await browser.new_context(
            permissions=['geolocation'],
            geolocation={'latitude': 21.0285, 'longitude': 105.8542, 'accuracy': 15},
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
        
        # 1. Kiểm tra sự hiện diện của thanh tìm kiếm
        search_visible = await page.is_visible('#lakinh-search-bar-input')
        print(f"Search input visible: {search_visible}")
        
        # 2. Click vào thanh tìm kiếm khi rỗng -> Xem Quick Cities
        await page.click('#lakinh-search-bar-input')
        await asyncio.sleep(0.5)
        await page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\lakinh_search_quick_cities.png')
        print("Captured lakinh_search_quick_cities.png")
        
        # 3. Nhập tọa độ GPS trực tiếp: 21.0475, 105.7958 (Viện IBST, Trần Cung)
        await page.fill('#lakinh-search-bar-input', '21.0475, 105.7958')
        await asyncio.sleep(0.6)
        
        # Click gợi ý tọa độ
        coord_item = await page.is_visible('.lakinh-search-suggest-item.highlight-coord')
        print(f"Coordinate highlight suggestion visible: {coord_item}")
        await page.click('.lakinh-search-suggest-item.highlight-coord')
        await asyncio.sleep(2.0)
        
        await page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\lakinh_search_gps_coords.png')
        print("Captured lakinh_search_gps_coords.png")
        
        # 4. Nhập địa chỉ: "Hoàn Kiếm"
        await page.fill('#lakinh-search-bar-input', 'Hoàn Kiếm')
        await asyncio.sleep(1.2)
        
        # Chụp ảnh kết quả gợi ý địa chỉ
        await page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\lakinh_search_address_dropdown.png')
        print("Captured lakinh_search_address_dropdown.png")
        
        # Nhấn Enter để thực hiện tìm kiếm
        await page.keyboard.press('Enter')
        await asyncio.sleep(2.0)
        
        await browser.close()
        print("Test completed successfully")

if __name__ == '__main__':
    asyncio.run(run())
