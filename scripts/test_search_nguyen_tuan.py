import asyncio
import sys
from playwright.async_api import async_playwright

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            permissions=['geolocation'],
            geolocation={'latitude': 21.0285, 'longitude': 105.8542, 'accuracy': 15},
            viewport={'width': 390, 'height': 844},
            is_mobile=True,
            has_touch=True
        )
        page = await context.new_page()
        
        # Listen to console messages and network errors
        page.on("console", lambda msg: print(f"[BROWSER CONSOLE] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"[BROWSER ERROR] {err}"))
        
        print("Navigating to app...")
        await page.goto("http://127.0.0.1:8080/index.html", wait_until='domcontentloaded')
        await asyncio.sleep(1.0)
        
        # Switch to La Kinh
        print("Switching to La Kinh tab...")
        await page.click('#deck-selector-trigger')
        await asyncio.sleep(0.4)
        await page.click('#tab-mode-lakinh')
        await asyncio.sleep(2.0)
        
        # Input "82 nguyễn tuân"
        print("Typing '82 nguyễn tuân' into search bar...")
        await page.fill('#lakinh-search-bar-input', '82 nguyễn tuân')
        
        # Wait for debounce & search completion
        await asyncio.sleep(2.5)
        
        # Check suggestions
        items = await page.locator('.lakinh-search-suggest-item').all()
        print(f"Found {len(items)} suggestion items in dropdown:")
        for idx, item in enumerate(items):
            text = await item.inner_text()
            name_attr = await item.get_attribute('data-name')
            lat_attr = await item.get_attribute('data-lat')
            lng_attr = await item.get_attribute('data-lng')
            print(f"  [{idx+1}] {text.replace(chr(10), ' | ')} -> lat: {lat_attr}, lng: {lng_attr}, data-name: {name_attr}")
            
        await page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\lakinh_search_nguyen_tuan_results.png')
        print("Saved lakinh_search_nguyen_tuan_results.png")
        
        # Click on the second suggestion item (online geocoded item: Thống Nhất Complex)
        if len(items) >= 2:
            print("Clicking second suggestion (Thống Nhất Complex)...")
            await items[1].click()
            await asyncio.sleep(2.5)
            
            coords = await page.evaluate("window.lakinhState ? window.lakinhState.centerCoords : null")
            print(f"Map center coordinates after click: {coords}")
            
            await page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\lakinh_map_centered_thong_nhat_complex.png')
            print("Saved lakinh_map_centered_thong_nhat_complex.png")
            
        await browser.close()
        print("Finished test successfully!")

if __name__ == '__main__':
    asyncio.run(run())
