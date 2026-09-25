import asyncio
import sys
from playwright.async_api import async_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

async def check_errors():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        console_logs = []
        page_errors = []

        page.on('console', lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
        page.on('pageerror', lambda err: page_errors.append(str(err)))

        print("Navigating to index.html...")
        await page.goto('http://127.0.0.1:8080/index.html', wait_until='networkidle')
        await asyncio.sleep(1.0)

        # Switch to La Kinh
        print("Clicking La Kinh tab...")
        await page.click('#deck-selector-trigger')
        await asyncio.sleep(0.5)
        await page.click('#tab-mode-lakinh')
        await asyncio.sleep(2.0)

        print(f"=== PAGE ERRORS ({len(page_errors)}) ===")
        for err in page_errors:
            print(err)

        print(f"\n=== CONSOLE LOGS ({len(console_logs)}) ===")
        for log in console_logs:
            print(log)

        # Check DOM element #lakinh-map and #view-lakinh
        view_html = await page.evaluate("""() => {
            const v = document.getElementById('view-lakinh');
            return {
                exists: !!v,
                display: v ? window.getComputedStyle(v).display : null,
                innerHTML: v ? v.innerHTML.substring(0, 300) : null
            };
        }""")
        print("\n=== VIEW-LAKINH STATUS ===")
        print(view_html)

        await browser.close()

if __name__ == '__main__':
    asyncio.run(check_errors())
