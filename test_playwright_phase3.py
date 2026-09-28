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

async def test_phase3():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 420, 'height': 900},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True
        )
        page = await context.new_page()

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

        # Click La Kinh
        print("Selecting La Kinh 36 Tang...")
        await page.click("#tab-mode-lakinh")
        await page.wait_for_timeout(1000)

        # Verify initial compass is intact
        is_visible = await page.is_visible("#view-lakinh")
        print(f"view-lakinh is visible: {is_visible}")

        shot_initial = os.path.join(ARTIFACT_DIR, "test_phase3_lakinh_initial.png")
        await page.screenshot(path=shot_initial)
        print(f"Saved: {shot_initial}")

        # Click button ⚔️ to activate QMDJ Strategic Layer
        print("Clicking #lakinh-btn-qmdj-strat to activate QMDJ Strategic Layer...")
        await page.click("#lakinh-btn-qmdj-strat")
        await page.wait_for_timeout(600)

        # Verify SVG layer and HUD
        svg_visible = await page.is_visible("#lakinh-qmdj-svg")
        hud_visible = await page.is_visible("#lakinh-qmdj-floating-hud")
        print(f"lakinh-qmdj-svg visible: {svg_visible}, hud visible: {hud_visible}")

        shot_dark_deal = os.path.join(ARTIFACT_DIR, "test_phase3_lakinh_qmdj_dark_deal.png")
        await page.screenshot(path=shot_dark_deal)
        print(f"Saved: {shot_dark_deal}")

        # Rotate compass to 60 degrees (test synchronization)
        print("Rotating compass to 60.0 degrees...")
        await page.evaluate("window.NetaLaKinhView.updateRotation(60.0)")
        await page.wait_for_timeout(400)

        shot_rotated = os.path.join(ARTIFACT_DIR, "test_phase3_lakinh_qmdj_rotated.png")
        await page.screenshot(path=shot_rotated)
        print(f"Saved: {shot_rotated}")

        # Switch goal to wealth (Cầu Tài)
        print("Switching goal to: wealth (Cầu Tài)...")
        await page.click('.qmdj-hud-pill-btn[data-goal="wealth"]')
        await page.wait_for_timeout(400)

        shot_wealth = os.path.join(ARTIFACT_DIR, "test_phase3_lakinh_qmdj_wealth.png")
        await page.screenshot(path=shot_wealth)
        print(f"Saved: {shot_wealth}")

        # Switch to Light Theme
        print("Switching to Light Theme...")
        await page.click("#btn-theme")
        await page.wait_for_timeout(400)

        shot_light = os.path.join(ARTIFACT_DIR, "test_phase3_lakinh_qmdj_light.png")
        await page.screenshot(path=shot_light)
        print(f"Saved: {shot_light}")

        # Open Bottom Sheet to check controls
        print("Opening Bottom Sheet...")
        await page.click("#lakinh-dock-tools")
        await page.wait_for_timeout(500)

        shot_sheet = os.path.join(ARTIFACT_DIR, "test_phase3_lakinh_bottom_sheet.png")
        await page.screenshot(path=shot_sheet)
        print(f"Saved: {shot_sheet}")

        # Click Link button to switch to 9-palace QMDJ board
        print("Clicking #sheet-btn-qmdj-view-link to switch to QMDJ module...")
        await page.click("#sheet-btn-qmdj-view-link")
        await page.wait_for_timeout(800)

        shot_transition = os.path.join(ARTIFACT_DIR, "test_phase3_lakinh_transition_qmdj.png")
        await page.screenshot(path=shot_transition)
        print(f"Saved: {shot_transition}")

        if errors:
            print("PAGE ERRORS ENCOUNTERED:")
            for e in errors:
                print(f"  - {e}")
        else:
            print("NO PAGE ERRORS! TEST COMPLETED SUCCESSFULLY.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_phase3())
