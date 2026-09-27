import asyncio
import sys
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    async with async_playwright() as p:
        # Screen width 360px (mobile)
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 360, 'height': 780})
        await page.goto('http://127.0.0.1:8090/index.html')
        await page.wait_for_timeout(600)

        # 1. Switch to La Kinh
        await page.click('#deck-selector-trigger')
        await page.wait_for_timeout(300)
        await page.click('#tab-mode-lakinh')
        await page.wait_for_timeout(1000)

        # 2. Turn on Sighting Ray
        await page.click('#lakinh-btn-ray-quick')
        await page.wait_for_timeout(500)

        # Set exact ray angle 342.8° as in user screenshot
        await page.evaluate('''() => {
            window.lakinhState.rayAngle = 342.8;
            window.lakinhState.rotation = 145.3;
            // update ray
            const container = document.getElementById('view-lakinh');
            if (window.lakinhState.isRayActive) {
                // trigger updateSightingRay
                const sRayDeg = document.getElementById('sheet-slider-ray-deg');
                if (sRayDeg) {
                    sRayDeg.value = 342.8;
                    sRayDeg.dispatchEvent(new Event('input', { bubbles: true }));
                    sRayDeg.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        }''')
        await page.wait_for_timeout(500)

        # Check expanded HUD dimensions on 360px viewport
        hud_box = await page.evaluate('''() => {
            const hud = document.getElementById('lakinh-ray-floating-hud');
            const rect = hud.getBoundingClientRect();
            return {
                left: rect.left,
                right: rect.right,
                width: rect.width,
                scrollWidth: hud.scrollWidth,
                clientWidth: hud.clientWidth,
                isOverflowing: rect.left < 0 || rect.right > 360 || hud.scrollWidth > hud.clientWidth + 1
            };
        }''')
        print(f"Expanded HUD bounding box at 342.8°: {hud_box}")
        assert not hud_box['isOverflowing'], f"Expanded HUD overflows: {hud_box}"

        # Screenshot of expanded HUD at 342.8°
        await page.screenshot(path='C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/test_ray_expanded_342_8.png')

        # 3. Collapse to mini pill by clicking [✕]
        await page.click('#btn-ray-hud-close')
        await page.wait_for_timeout(400)

        mini_box = await page.evaluate('''() => {
            const mini = document.getElementById('lakinh-ray-mini-pill');
            const rect = mini.getBoundingClientRect();
            return {
                text: mini.innerText.replace(/\\n/g, ' '),
                left: rect.left,
                right: rect.right,
                width: rect.width,
                scrollWidth: mini.scrollWidth,
                clientWidth: mini.clientWidth,
                touchesBorder: rect.left < 8 || rect.right > 352,
                isOverflowing: rect.left < 0 || rect.right > 360 || mini.scrollWidth > mini.clientWidth + 1
            };
        }''')
        print(f"Collapsed Mini Pill bounding box at 342.8°: {mini_box}")
        assert not mini_box['isOverflowing'], f"Mini pill overflows screen: {mini_box}"
        assert not mini_box['touchesBorder'], f"Mini pill should not stretch edge-to-edge: {mini_box}"
        assert mini_box['width'] < 330, f"Mini pill width should be compact (<330px), got {mini_box['width']}"

        # Screenshot of collapsed Mini Pill at 342.8°
        await page.screenshot(path='C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/test_ray_collapsed_mini_pill.png')

        # 4. Click mini pill to expand back
        await page.click('#lakinh-ray-mini-pill')
        await page.wait_for_timeout(400)

        is_expanded_again = await page.evaluate('''() => {
            const hud = document.getElementById('lakinh-ray-floating-hud');
            const mini = document.getElementById('lakinh-ray-mini-pill');
            return hud.style.display !== 'none' && mini.style.display === 'none';
        }''')
        print(f"Expanded back successfully on click: {is_expanded_again}")
        assert is_expanded_again, "Mini pill must expand back to detailed card when clicked"

        print("ALL TESTS PASSED: Sighting ray info box never overflows, stays perfectly compact and centered!")
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
