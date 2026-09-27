import asyncio
import sys
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

async def main():
    async with async_playwright() as p:
        # Test on mobile 360x780
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 360, 'height': 780})
        await page.goto('http://127.0.0.1:8090/index.html')
        await page.wait_for_timeout(600)

        # 1. Switch to La Kinh
        await page.click('#deck-selector-trigger')
        await page.wait_for_timeout(300)
        await page.click('#tab-mode-lakinh')
        await page.wait_for_timeout(1000)

        # 2. Check top panel overflow
        top_panel_box = await page.evaluate('''() => {
            const p = document.getElementById('lakinh-top-panel');
            const row = p.querySelector('.lakinh-top-row');
            const rGroup = p.querySelector('.lakinh-top-right-group');
            const pRect = p.getBoundingClientRect();
            const rRect = rGroup.getBoundingClientRect();
            return {
                panelWidth: pRect.width,
                panelRight: pRect.right,
                groupRight: rRect.right,
                isOverflowing: rRect.right > pRect.right + 1,
                scrollWidth: p.scrollWidth,
                clientWidth: p.clientWidth
            };
        }''')
        print(f"Top panel layout check: {top_panel_box}")
        assert not top_panel_box['isOverflowing'], f"Top panel right buttons are overflowing: {top_panel_box}"

        # 3. Turn on Sighting Ray
        await page.click('#lakinh-btn-ray-quick')
        await page.wait_for_timeout(500)

        hud_visible = await page.is_visible('#lakinh-ray-floating-hud')
        print(f"Ray HUD visible: {hud_visible}")
        assert hud_visible, "Ray HUD should be visible"

        # Check full information in HUD
        hud_info = await page.evaluate('''() => {
            return {
                deg: document.getElementById('ray-hud-deg').textContent,
                son: document.getElementById('ray-hud-son').textContent,
                que: document.getElementById('ray-hud-que').textContent,
                khivan: document.getElementById('ray-hud-khivan').textContent,
                queRange: document.getElementById('ray-hud-que-range').textContent,
                haThuong: document.getElementById('ray-hud-que-ha-thuong').textContent,
                hao: document.getElementById('ray-hud-hao').textContent,
                haoRange: document.getElementById('ray-hud-hao-range').textContent,
                adviceText: document.getElementById('ray-hud-advice-text').textContent,
                diff: document.getElementById('ray-hud-diff').textContent
            };
        }''')
        print("HUD Full Information:", hud_info)
        assert bool(hud_info['que']), "Que name must not be empty"
        assert bool(hud_info['hao']), "Hao name must not be empty"
        assert bool(hud_info['queRange']), "Que range must not be empty"
        assert bool(hud_info['haoRange']), "Hao range must not be empty"

        # 4. Test Collapse on [✕] click
        await page.click('#btn-ray-hud-close')
        await page.wait_for_timeout(300)

        state_check = await page.evaluate('''() => {
            const hud = document.getElementById('lakinh-ray-floating-hud');
            const mini = document.getElementById('lakinh-ray-mini-pill');
            return {
                isRayActive: window.lakinhState.isRayActive,
                isRayHudCollapsed: window.lakinhState.isRayHudCollapsed,
                hudDisplay: hud.style.display,
                miniDisplay: mini.style.display,
                miniText: mini.innerText
            };
        }''')
        print("After clicking [X] collapse:", state_check)
        assert state_check['isRayActive'] == True, "Ray must NOT be turned off when clicking [X]"
        assert state_check['isRayHudCollapsed'] == True, "Ray HUD must be marked collapsed"
        assert state_check['hudDisplay'] == 'none', "HUD should be hidden"
        assert state_check['miniDisplay'] == 'flex', "Mini pill should be displayed"

        # 5. Test Expand on clicking mini pill
        await page.click('#lakinh-ray-mini-pill')
        await page.wait_for_timeout(300)

        state_expanded = await page.evaluate('''() => {
            const hud = document.getElementById('lakinh-ray-floating-hud');
            const mini = document.getElementById('lakinh-ray-mini-pill');
            return {
                isRayActive: window.lakinhState.isRayActive,
                isRayHudCollapsed: window.lakinhState.isRayHudCollapsed,
                hudDisplay: hud.style.display,
                miniDisplay: mini.style.display
            };
        }''')
        print("After clicking mini pill expand:", state_expanded)
        assert state_expanded['isRayHudCollapsed'] == False, "Ray HUD should expand"
        assert state_expanded['hudDisplay'] == 'block', "HUD should be displayed"
        assert state_expanded['miniDisplay'] == 'none', "Mini pill should be hidden"

        # 6. Test Transparency during dragging/aiming
        await page.evaluate('''() => {
            const handle = document.getElementById('lakinh-ray-target-handle');
            handle.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
        }''')
        has_trans_class = await page.evaluate('''() => {
            return document.getElementById('lakinh-ray-floating-hud').classList.contains('ray-hud-transparent');
        }''')
        print(f"HUD transparent during drag: {has_trans_class}")
        assert has_trans_class, "HUD must have ray-hud-transparent class when dragging"

        await page.evaluate('''() => {
            const handle = document.getElementById('lakinh-ray-target-handle');
            handle.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }));
        }''')
        has_trans_after = await page.evaluate('''() => {
            return document.getElementById('lakinh-ray-floating-hud').classList.contains('ray-hud-transparent');
        }''')
        print(f"HUD transparent after drag release: {has_trans_after}")
        assert not has_trans_after, "HUD must restore normal opacity when drag released"

        # Screenshot for verification
        await page.screenshot(path='C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/test_ray_full_info_verified.png')
        print("TEST PASSED: All 4 user requirements verified 100%!")
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
