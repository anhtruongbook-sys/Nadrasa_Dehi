import asyncio
import os
import sys

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from playwright.async_api import async_playwright

ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612"

async def test_phase2():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 420, 'height': 900},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True
        )
        page = await context.new_page()
        
        # Capture console errors if any
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        page.on("console", lambda msg: print(f"BROWSER: [{msg.type}] {msg.text}") if msg.type in ['error', 'warn'] else None)

        print("Navigating to http://localhost:8090/index.html...")
        await page.goto("http://localhost:8090/index.html", wait_until="networkidle")
        await page.wait_for_timeout(500)

        # Open deck selector
        print("Opening deck selector...")
        await page.click("#deck-selector-trigger")
        await page.wait_for_timeout(300)

        # Click Ky Mon
        print("Selecting Ky Mon Don Giap...")
        await page.click("#tab-mode-qmdj")
        await page.wait_for_timeout(600)

        # Verify Ky Mon view is visible
        is_visible = await page.is_visible("#view-qmdj")
        print(f"view-qmdj is visible: {is_visible}")

        # Click Tab 4: Tác Quyết
        print("Clicking Tab ⚔️ Tác Quyết...")
        await page.click('button.qmdj-tab-btn[data-mode="chienluoc"]')
        await page.wait_for_timeout(500)

        # Dark mode screenshot - Goal: Deal
        shot_dark_deal = os.path.join(ARTIFACT_DIR, "test_phase2_chienluoc_deal_dark.png")
        await page.screenshot(path=shot_dark_deal)
        print(f"Saved: {shot_dark_deal}")

        # Scroll down to see 9 palaces and host-guest box
        await page.evaluate("document.querySelector('.qmdj-view-container').scrollTop = 550")
        await page.wait_for_timeout(400)
        shot_dark_details = os.path.join(ARTIFACT_DIR, "test_phase2_chienluoc_details_dark.png")
        await page.screenshot(path=shot_dark_details)
        print(f"Saved: {shot_dark_details}")

        # Scroll down further to see Host-Guest & Dụng Thần boxes
        await page.evaluate("document.querySelector('.qmdj-view-container').scrollTop = 1100")
        await page.wait_for_timeout(400)
        shot_dark_bottom = os.path.join(ARTIFACT_DIR, "test_phase2_chienluoc_bottom_dark.png")
        await page.screenshot(path=shot_dark_bottom)
        print(f"Saved: {shot_dark_bottom}")

        # Test switching goal: Cầu Tài / Gọi Vốn
        print("Switching goal to: wealth (Cầu Tài)...")
        await page.evaluate("document.querySelector('.qmdj-view-container').scrollTop = 0")
        await page.wait_for_timeout(200)
        await page.click('button.jy-goal-btn[data-goal="wealth"]')
        await page.wait_for_timeout(300)

        shot_dark_wealth = os.path.join(ARTIFACT_DIR, "test_phase2_chienluoc_wealth_dark.png")
        await page.screenshot(path=shot_dark_wealth)
        print(f"Saved: {shot_dark_wealth}")

        # Switch to Light Theme
        print("Switching to Light Theme...")
        await page.click("#btn-theme")
        await page.wait_for_timeout(400)

        shot_light_wealth = os.path.join(ARTIFACT_DIR, "test_phase2_chienluoc_wealth_light.png")
        await page.screenshot(path=shot_light_wealth)
        print(f"Saved: {shot_light_wealth}")

        # Scroll down in light theme
        await page.evaluate("document.querySelector('.qmdj-view-container').scrollTop = 550")
        await page.wait_for_timeout(400)
        shot_light_details = os.path.join(ARTIFACT_DIR, "test_phase2_chienluoc_details_light.png")
        await page.screenshot(path=shot_light_details)
        print(f"Saved: {shot_light_details}")

        # Scroll down further in light theme to see Host-Guest & Dụng Thần
        await page.evaluate("document.querySelector('.qmdj-view-container').scrollTop = 1100")
        await page.wait_for_timeout(400)
        shot_light_bottom = os.path.join(ARTIFACT_DIR, "test_phase2_chienluoc_bottom_light.png")
        await page.screenshot(path=shot_light_bottom)
        print(f"Saved: {shot_light_bottom}")

        # Switch to Thoát Hiểm / Cứu Nguy (escape)
        print("Switching goal to: escape (Thoát Hiểm)...")
        await page.evaluate("document.querySelector('.qmdj-view-container').scrollTop = 0")
        await page.wait_for_timeout(200)
        await page.click('button.jy-goal-btn[data-goal="escape"]')
        await page.wait_for_timeout(300)
        shot_light_escape = os.path.join(ARTIFACT_DIR, "test_phase2_chienluoc_escape_light.png")
        await page.screenshot(path=shot_light_escape)
        print(f"Saved: {shot_light_escape}")

        # Test clicking Palace Cell (e.g. Cung Khảm 1) to open Palace Detail Modal
        print("Clicking Palace 1 (Khảm) to test Detail Modal...")
        await page.evaluate("document.querySelector('.qmdj-view-container').scrollTop = 550")
        await page.wait_for_timeout(300)
        await page.click('.jy-battle-cell[data-palace-index="1"]')
        await page.wait_for_timeout(400)
        shot_modal = os.path.join(ARTIFACT_DIR, "test_phase2_palace_modal.png")
        await page.screenshot(path=shot_modal)
        print(f"Saved: {shot_modal}")

        # Close modal
        close_btn = await page.query_selector(".qmdj-modal-close, .modal-close, #btn-modal-close")
        if close_btn:
            await close_btn.click()
            await page.wait_for_timeout(200)

        if errors:
            print("PAGE ERRORS ENCOUNTERED:")
            for e in errors:
                print(f"  - {e}")
        else:
            print("NO PAGE ERRORS! TEST COMPLETED SUCCESSFULLY.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_phase2())
