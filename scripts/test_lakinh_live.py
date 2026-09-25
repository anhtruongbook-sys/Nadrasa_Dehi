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
        await asyncio.sleep(2.0)
        
        # 1. Chụp ảnh màn hình La Kinh xuyên thấu bản đồ vệ tinh
        await page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\lakinh_transparent_satellite_view.png')
        print('Captured: lakinh_transparent_satellite_view.png')
        
        # 2. Click nút tìm kiếm
        await page.click('#lakinh-btn-search')
        await page.wait_for_timeout(800)
        await page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\lakinh_search_modal.png')
        print('Captured: lakinh_search_modal.png')
        
        # 3. Chọn TP. Hồ Chí Minh
        await page.click('.lakinh-city-chip[data-city-idx="1"]')
        await page.wait_for_timeout(2000)
        await page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\lakinh_jumped_hcm.png')
        print('Captured: lakinh_jumped_hcm.png')
        
        # 4. Giả lập GPS bị chặn (err.code = 1) -> hiện modal hướng dẫn
        await page.evaluate("""() => {
            // Giả lập navigator.geolocation ném error code 1 (PERMISSION_DENIED)
            const btn = document.getElementById('lakinh-dock-gps');
            if (btn) {
                // Mock geolocation
                navigator.geolocation.getCurrentPosition = (success, error) => {
                    error({ code: 1, message: 'User denied Geolocation' });
                };
                btn.click();
            }
        }""")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\lakinh_gps_blocked_guidance_modal.png')
        print('Captured: lakinh_gps_blocked_guidance_modal.png')
        
        await browser.close()

if __name__ == '__main__':
    asyncio.run(run())
