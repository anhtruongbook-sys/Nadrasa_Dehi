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
        
        print("Opening app...")
        await page.goto("http://127.0.0.1:8080/index.html", wait_until='domcontentloaded')
        await asyncio.sleep(1.5)
        
        # 1. Capture initial Neta Light deck view with new card back
        print("Capturing Neta Light deck with new back cover...")
        await page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\neta_deck_new_back.png')
        
        # 2. Draw card (click deck or draw button)
        print("Drawing a card...")
        draw_btn = page.locator('#draw-btn, #btn-draw-single, .draw-btn')
        if await draw_btn.count() > 0:
            await draw_btn.first.click()
        else:
            # Click card in deck
            await page.locator('.card-item').first.click()
            
        await asyncio.sleep(2.0)
        
        # Capture drawn card
        await page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\neta_card_drawn_front.png')
        print("Captured drawn card front!")
        
        # 3. Click card to open modal
        print("Clicking drawn card to open modal...")
        await page.locator('.card-item').first.click()
        await asyncio.sleep(1.5)
        
        await page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\neta_card_modal_detail.png')
        print("Captured neta_card_modal_detail.png!")
            
        await browser.close()
        print("Test completed successfully!")

if __name__ == '__main__':
    asyncio.run(run())
