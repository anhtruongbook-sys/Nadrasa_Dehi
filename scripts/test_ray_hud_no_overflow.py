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

        # VERIFY 1: Floating Sighting Ray button is clearly visible on the main screen
        ray_float_btn = await page.is_visible('#lakinh-btn-ray-float')
        ray_float_text = await page.inner_text('#ray-float-text')
        print(f"Floating Sighting Ray button visible: {ray_float_btn}, text: '{ray_float_text}'")
        assert ray_float_btn, "Prominent floating button #lakinh-btn-ray-float must be visible on screen!"
        assert ray_float_text == "Tia Ngắm", f"Initial button text should be 'Tia Ngắm', got '{ray_float_text}'"

        # Screenshot: Screen with ray OFF and prominent floating button
        await page.screenshot(path='C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/test_ray_fab_screen_off.png')

        # VERIFY 2: Click floating button to turn ON the sighting ray
        await page.click('#lakinh-btn-ray-float')
        await page.wait_for_timeout(500)

        is_ray_active = await page.evaluate('window.lakinhState.isRayActive')
        ray_float_text_active = await page.inner_text('#ray-float-text')
        print(f"After click floating button, ray active: {is_ray_active}, text: '{ray_float_text_active}'")
        assert is_ray_active, "Clicking floating button must turn ON the sighting ray!"
        assert "Bật" in ray_float_text_active, "Button text should indicate active state!"

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

        # VERIFY 3: Compass center has NO duplicate label pill
        target_label_exists = await page.evaluate('''() => {
            const lbl = document.getElementById('lakinh-ray-target-label');
            return lbl !== null && window.getComputedStyle(lbl).display !== 'none';
        }''')
        print(f"Duplicate center pill exists: {target_label_exists}")
        assert not target_label_exists, "Redundant pill on target handle must be removed!"

        # VERIFY 4: Collapse to Mini Pill
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
        assert mini_status['hasTurnOffBtn'], "Mini pill must have explicit [✕] button!"
        assert not mini_status['touchesBorder'], "Mini pill must not stretch edge-to-edge!"

        # Screenshot: Screen with ray ON collapsed to Mini Pill
        await page.screenshot(path='C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/test_ray_fab_screen_on_collapsed.png')

        # VERIFY 5: Click floating button to turn OFF the sighting ray
        await page.click('#lakinh-btn-ray-float')
        await page.wait_for_timeout(400)

        is_ray_off = await page.evaluate('''() => {
            return !window.lakinhState.isRayActive &&
                   document.getElementById('lakinh-ray-container').style.display === 'none' &&
                   document.getElementById('lakinh-ray-mini-pill').style.display === 'none';
        }''')
        print(f"Ray turned off via floating button: {is_ray_off}")
        assert is_ray_off, "Clicking floating button again must turn OFF the sighting ray!"

        print("ALL VERIFICATIONS PASSED: Prominent floating button works 100%, duplicate pill removed!")
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
