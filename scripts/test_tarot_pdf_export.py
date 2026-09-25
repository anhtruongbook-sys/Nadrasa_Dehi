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
        await asyncio.sleep(1.0)
        
        # Switch to Tarot deck
        print("Switching to Tarot mode...")
        await page.click('#deck-selector-trigger')
        await asyncio.sleep(0.4)
        await page.click('#tab-mode-tarot')
        await asyncio.sleep(1.5)
        
        # Start a quick 3-card spread
        print("Drawing cards in Tarot...")
        # Check if spread buttons exist
        draw_quick = page.locator('#btn-tarot-draw-all, #btn-tarot-flip-all')
        
        # Click on ribbon cards to draw 3 cards
        ribbon_cards = page.locator('.ribbon-card')
        count = await ribbon_cards.count()
        print(f"Ribbon cards count: {count}")
        if count >= 3:
            for i in range(3):
                await ribbon_cards.nth(i * 10).click()
                await asyncio.sleep(0.4)
                
        # Flip all cards
        btn_flip = page.locator('#btn-tarot-flip-all')
        if await btn_flip.count() > 0:
            await btn_flip.click()
            await asyncio.sleep(1.0)
            
        # Scroll to report section
        print("Checking report section...")
        report_sec = page.locator('#tarot-report-section')
        print(f"Report section visible: {await report_sec.is_visible()}")
        
        # Click Export PDF button
        btn_pdf = page.locator('#btn-tarot-export-pdf, button:has-text("Xuất Báo Cáo PDF"), button:has-text("Tải PDF")')
        print(f"PDF button found: {await btn_pdf.count()}")
        if await btn_pdf.count() > 0:
            print("Clicking Export PDF button...")
            await btn_pdf.first.click()
            await asyncio.sleep(4.0)
            
        await page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\tarot_pdf_test_result.png')
        print("Captured tarot_pdf_test_result.png")
        
        await browser.close()
        print("Test finished!")

if __name__ == '__main__':
    asyncio.run(run())
