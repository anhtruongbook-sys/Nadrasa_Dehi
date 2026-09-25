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
        
        print("Switching to Tarot mode...")
        await page.click('#deck-selector-trigger')
        await asyncio.sleep(0.4)
        await page.click('#tab-mode-tarot')
        await asyncio.sleep(1.5)
        
        print("Filling question and quick draw...")
        await page.fill('#tarot-question-input', 'Kế hoạch công việc sắp tới?')
        await page.click('#btn-tarot-quick-draw')
        await asyncio.sleep(0.8)
        
        print("Flipping all cards...")
        await page.click('#btn-tarot-flip-all')
        await asyncio.sleep(1.2)
        
        print("Clicking export PDF button and expecting download...")
        btn_pdf = page.locator('button:has-text("Tải File PDF")')
        print(f"Export PDF button count: {await btn_pdf.count()}")
        
        async with page.expect_download() as download_info:
            await btn_pdf.click()
            
        download = await download_info.value
        save_path = r'C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\downloaded_tarot_report.pdf'
        await download.save_as(save_path)
        print(f"PDF successfully downloaded! Saved to {save_path}")
        print(f"PDF size: {len(open(save_path, 'rb').read()):,} bytes")
            
        await page.screenshot(path=r'C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\tarot_pdf_export_reproduce.png')
        await browser.close()
        print("Finished reproduce script!")

if __name__ == '__main__':
    asyncio.run(run())
