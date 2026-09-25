import asyncio
import sys
from playwright.async_api import async_playwright

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 390, 'height': 844},
            is_mobile=True,
            has_touch=True
        )
        page = await context.new_page()
        page.on("console", lambda msg: print(f"[CONSOLE] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"[ERROR] {err}"))
        
        print("Navigating to app...")
        await page.goto("http://127.0.0.1:8080/index.html", wait_until='domcontentloaded')
        await asyncio.sleep(1.0)
        
        # Switch to La Kinh
        print("Switching to La Kinh tab...")
        await page.click('#deck-selector-trigger')
        await asyncio.sleep(0.4)
        await page.click('#tab-mode-lakinh')
        await asyncio.sleep(2.0)
        
        # 1. Verify search bar is initially hidden
        search_wrap = page.locator('#lakinh-search-bar-wrap')
        is_hidden_initially = not await search_wrap.is_visible()
        print(f"1. Search bar initially hidden: {is_hidden_initially}")
        assert is_hidden_initially, "Search bar should be hidden initially!"
        
        await page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\lakinh_search_hidden_initial.png')
        print("Captured lakinh_search_hidden_initial.png (100% clean view)")
        
        # 2. Click 🔍 search toggle button
        print("2. Clicking 🔍 toggle button...")
        await page.click('#lakinh-btn-search')
        await asyncio.sleep(0.6)
        
        is_visible_after_toggle = await search_wrap.is_visible()
        print(f"Search bar visible after clicking toggle: {is_visible_after_toggle}")
        assert is_visible_after_toggle, "Search bar should be visible after toggle!"
        
        # 3. Type "82 nguyễn tuân"
        print("3. Typing '82 nguyễn tuân'...")
        await page.fill('#lakinh-search-bar-input', '82 nguyễn tuân')
        await asyncio.sleep(2.0)
        
        items = await page.locator('.lakinh-search-suggest-item').all()
        print(f"Found {len(items)} suggestions")
        assert len(items) > 0, "Should have suggestions!"
        
        await page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\lakinh_search_active_typing.png')
        
        # 4. Click first suggestion
        print("4. Clicking suggestion to complete task...")
        await items[0].click()
        await asyncio.sleep(2.0)
        
        # 5. Verify search bar is now automatically hidden!
        is_hidden_after_select = not await search_wrap.is_visible()
        print(f"5. Search bar automatically hidden after selection: {is_hidden_after_select}")
        assert is_hidden_after_select, "Search bar should be automatically hidden after selection!"
        
        await page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\lakinh_search_autohidden_after_selection.png')
        print("Captured lakinh_search_autohidden_after_selection.png!")
        
        # 6. Test toggle again to make sure user can search again anytime
        print("6. Clicking 🔍 toggle again to verify re-open capability...")
        await page.click('#lakinh-btn-search')
        await asyncio.sleep(0.5)
        print(f"Search bar visible again: {await search_wrap.is_visible()}")
        
        # Test close button ▲
        print("7. Clicking ▲ close button on search bar...")
        await page.click('#lakinh-search-bar-close')
        await asyncio.sleep(0.5)
        print(f"Search bar hidden via ▲ button: {not await search_wrap.is_visible()}")
        
        await browser.close()
        print("All verification steps PASSED successfully!")

if __name__ == '__main__':
    asyncio.run(run())
