import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 360, 'height': 780})
        await page.goto('http://127.0.0.1:8090/index.html')
        await page.click('#deck-selector-trigger')
        await page.click('#tab-mode-qmdj')
        await page.wait_for_timeout(600)
        
        # Test Duong Ban & Am Ban
        grid_info = await page.evaluate('''() => {
            const grid = document.querySelector('.qmdj-matrix-grid');
            const cells = Array.from(document.querySelectorAll('.qmdj-palace-cell'));
            const container = document.querySelector('.qmdj-view-container');
            return {
                viewportWidth: window.innerWidth,
                containerRect: container ? container.getBoundingClientRect() : null,
                gridRect: grid ? grid.getBoundingClientRect() : null,
                gridScrollWidth: grid ? grid.scrollWidth : null,
                cells: cells.map((c, i) => ({
                    idx: i,
                    rect: c.getBoundingClientRect(),
                    scrollWidth: c.scrollWidth,
                    offsetWidth: c.offsetWidth,
                    content: c.innerText.replace(/\\n/g, ' ')
                }))
            };
        }''')
        print(f"Viewport width: {grid_info['viewportWidth']}")
        print(f"Container rect: {grid_info['containerRect']}")
        print(f"Grid rect: {grid_info['gridRect']}, scrollWidth: {grid_info['gridScrollWidth']}")
        rules = await page.evaluate('''() => {
            const grid = document.querySelector('.qmdj-matrix-grid');
            grid.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
            const cell = document.querySelector('.qmdj-palace-cell');
            return {
                grid: {
                    display: window.getComputedStyle(grid).display,
                    gridTemplateColumns: window.getComputedStyle(grid).gridTemplateColumns,
                    width: window.getComputedStyle(grid).width,
                    scrollWidth: grid.scrollWidth
                },
                cell: {
                    width: window.getComputedStyle(cell).width,
                    scrollWidth: cell.scrollWidth
                }
            };
        }''')
        print(rules)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
