import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # 360x780 mobile viewport (standard Android phone)
        page = await browser.new_page(viewport={'width': 360, 'height': 780})
        await page.goto('http://127.0.0.1:8090/index.html')
        await page.wait_for_timeout(600)

        # Switch to Light Mode
        theme_btn = await page.query_selector("#btn-theme")
        is_light = await page.evaluate("() => document.body.classList.contains('theme-light')")
        if not is_light:
            await theme_btn.click()
            await page.wait_for_timeout(300)

        # Apply CSS and DOM overrides dynamically to test fix
        await page.evaluate('''() => {
            // 1. QMDJ Fixes
            const style = document.createElement('style');
            style.innerHTML = `
                .qmdj-matrix-grid {
                    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                    gap: 3px !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                }
                .qmdj-palace-cell {
                    min-width: 0 !important;
                    width: 100% !important;
                    padding: 3px 4px !important;
                    overflow: hidden !important;
                }
                .p-divinity { font-size: 0.62rem !important; }
                .p-door { font-size: 0.72rem !important; }
                .p-stars { font-size: 0.50rem !important; letter-spacing: -0.2px !important; }
                .p-hcs { font-size: 0.90rem !important; }
                .p-hcs.p-hcs-double { font-size: 0.65rem !important; }
                .p-cung-name { font-size: 0.55rem !important; }
                .p-ecs { font-size: 0.68rem !important; }
                .p-ecs-stem.p-ecs-stem-double { font-size: 0.58rem !important; }

                /* Tu Vi Center Box Fix */
                .tuvi-center-box {
                    grid-column: 2 / span 2 !important;
                    grid-row: 2 / span 2 !important;
                    grid-area: 2 / 2 / span 2 / span 2 !important;
                    height: 100% !important;
                    min-height: 100% !important;
                }
                .tc-inner-border {
                    width: 100% !important;
                    height: 100% !important;
                    min-height: 100% !important;
                    box-sizing: border-box !important;
                    contain: none !important;
                }
            `;
            document.head.appendChild(style);
        }''')

        # 1. Test QMDJ Duong Ban
        await page.click('#deck-selector-trigger')
        await page.wait_for_timeout(300)
        await page.click('#tab-mode-qmdj')
        await page.wait_for_timeout(600)

        # Check grid width and scrollWidth
        qmdj_dim = await page.evaluate('''() => {
            const grid = document.querySelector('.qmdj-matrix-grid');
            return {
                width: grid.offsetWidth,
                scrollWidth: grid.scrollWidth,
                col3Right: document.querySelectorAll('.qmdj-palace-cell')[2].getBoundingClientRect().right
            };
        }''')
        print(f"QMDJ Duong Ban dimensions: {qmdj_dim}")
        await page.screenshot(path=r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\test_qmdj_duong_ban_after.png")

        # 2. Test QMDJ Am Ban
        await page.click('.qmdj-tab-btn[data-mode="amban"]')
        await page.wait_for_timeout(600)
        await page.screenshot(path=r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\test_qmdj_am_ban_after.png")

        # 3. Test Tu Vi Center Box
        await page.click('#deck-selector-trigger')
        await page.wait_for_timeout(300)
        await page.click('#tab-mode-tuvi')
        await page.wait_for_timeout(600)

        # Ensure inline style on center box is set as well
        await page.evaluate('''() => {
            const center = document.querySelector('.tuvi-center-box');
            if (center) {
                center.style.gridRow = '2 / span 2';
                center.style.gridColumn = '2 / span 2';
                center.style.height = '100%';
            }
        }''')
        await page.wait_for_timeout(300)

        # Scroll to grid
        await page.evaluate("""() => {
            const grid = document.querySelector('.tuvi-grid-4x4');
            if (grid) grid.scrollIntoView({ behavior: 'instant', block: 'center' });
        }""")
        await page.wait_for_timeout(500)

        tuvi_center_dim = await page.evaluate('''() => {
            const center = document.querySelector('.tuvi-center-box');
            const inner = document.querySelector('.tc-inner-border');
            return {
                centerRect: center ? center.getBoundingClientRect() : null,
                innerRect: inner ? inner.getBoundingClientRect() : null
            };
        }''')
        print(f"Tu Vi Center Box dimensions: {tuvi_center_dim}")
        await page.screenshot(path=r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\test_tuvi_center_box_after.png")

        await browser.close()
        print("Test complete!")

if __name__ == "__main__":
    asyncio.run(main())
