import asyncio
import sys
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    async with async_playwright() as p:
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

        # Set ray angle to 343.3° as in user screenshot
        await page.evaluate('''() => {
            window.lakinhState.rayAngle = 343.3;
            window.lakinhState.rotation = 144.5;
            const sRayDeg = document.getElementById('sheet-slider-ray-deg');
            if (sRayDeg) {
                sRayDeg.value = 343.3;
                sRayDeg.dispatchEvent(new Event('input', { bubbles: true }));
                sRayDeg.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }''')
        await page.wait_for_timeout(500)

        # VERIFY 1: Target handle in compass center has NO duplicate label pill
        target_label_exists = await page.evaluate('''() => {
            const handle = document.getElementById('lakinh-ray-target-handle');
            const lbl = document.getElementById('lakinh-ray-target-label');
            return lbl !== null && window.getComputedStyle(lbl).display !== 'none';
        }''')
        print(f"Duplicate center pill exists: {target_label_exists}")
        assert not target_label_exists, "Redundant pill on target handle must be removed!"

        # VERIFY 2: Expanded HUD has [– Thu gọn] and [✕ Tắt tia]
        has_collapse_btn = await page.is_visible('#btn-ray-hud-collapse')
        has_close_btn = await page.is_visible('#btn-ray-hud-close')
        print(f"HUD has [– Thu gọn]: {has_collapse_btn}, [✕ Tắt tia]: {has_close_btn}")
        assert has_collapse_btn and has_close_btn, "HUD must have both collapse and turn-off buttons"

        # Screenshot of clean expanded HUD
        await page.screenshot(path='C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/test_ray_no_duplicate_expanded.png')

        # VERIFY 3: Click [– Thu gọn] to collapse into Mini Pill
        await page.click('#btn-ray-hud-collapse')
        await page.wait_for_timeout(400)

        mini_status = await page.evaluate('''() => {
            const mini = document.getElementById('lakinh-ray-mini-pill');
            const rect = mini.getBoundingClientRect();
            const btnClose = document.getElementById('btn-ray-mini-close');
            return {
                text: mini.innerText.replace(/\\n/g, ' '),
                width: rect.width,
                left: rect.left,
                right: rect.right,
                touchesBorder: rect.left < 8 || rect.right > 352,
                hasTurnOffBtn: btnClose !== null && window.getComputedStyle(btnClose).display !== 'none'
            };
        }''')
        print(f"Collapsed Mini Pill status: {mini_status}")
        assert mini_status['hasTurnOffBtn'], "Mini pill must have explicit [✕ Tắt] button!"
        assert not mini_status['touchesBorder'], "Mini pill must not stretch edge-to-edge!"

        # Screenshot of clean Mini Pill with [✕ Tắt] button
        await page.screenshot(path='C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/test_ray_no_duplicate_collapsed.png')

        # VERIFY 4: Click [✕ Tắt] on Mini Pill to turn off sighting ray completely
        await page.click('#btn-ray-mini-close')
        await page.wait_for_timeout(400)

        is_ray_off = await page.evaluate('''() => {
            return !window.lakinhState.isRayActive &&
                   document.getElementById('lakinh-ray-container').style.display === 'none' &&
                   document.getElementById('lakinh-ray-mini-pill').style.display === 'none' &&
                   document.getElementById('lakinh-ray-floating-hud').style.display === 'none';
        }''')
        print(f"Ray turned off via Mini Pill [✕ Tắt]: {is_ray_off}")
        assert is_ray_off, "Clicking [✕ Tắt] on mini pill must turn off the sighting ray completely!"

        # VERIFY 5: Turn ray back ON via quick button #lakinh-btn-ray-quick
        await page.click('#lakinh-btn-ray-quick')
        await page.wait_for_timeout(400)

        is_ray_back_on = await page.evaluate('''() => {
            return window.lakinhState.isRayActive &&
                   document.getElementById('lakinh-ray-container').style.display === 'block';
        }''')
        print(f"Ray turned back ON via quick button: {is_ray_back_on}")
        assert is_ray_back_on, "Clicking #lakinh-btn-ray-quick must turn ray back ON!"

        # VERIFY 6: Turn ray OFF via [✕ Tắt tia] on expanded HUD
        await page.click('#btn-ray-hud-close')
        await page.wait_for_timeout(400)

        is_ray_off_again = await page.evaluate('''() => {
            return !window.lakinhState.isRayActive;
        }''')
        print(f"Ray turned off via HUD [✕ Tắt tia]: {is_ray_off_again}")
        assert is_ray_off_again, "Clicking [✕ Tắt tia] on HUD must turn off ray!"

        print("ALL VERIFICATIONS PASSED: No duplicate pill, perfect turn-off and collapse controls!")
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
