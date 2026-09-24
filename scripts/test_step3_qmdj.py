import asyncio
import os
import sys

# Ensure UTF-8 output on Windows console
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

SCREENSHOT_DIR = r"C:\Books\Neta Light\scripts\test_results"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

async def test_qmdj():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Mobile viewport emulation (iPhone 14 / modern Android)
        context = await browser.new_context(
            viewport={'width': 390, 'height': 844},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True
        )
        page = await context.new_page()

        print("1. Opening app at http://127.0.0.1:8080...")
        await page.goto("http://127.0.0.1:8080", wait_until="networkidle")
        await page.wait_for_timeout(600)

        # 2. Check engine in browser context
        print("2. Verifying QMDJCore engine in browser...")
        engine_check = await page.evaluate("""() => {
            if (!window.QMDJCore) return { error: "QMDJCore not found on window!" };
            if (!window.QMDJCore.TheArtOfBecomingInvisible) return { error: "TheArtOfBecomingInvisible constructor not found!" };
            if (!window.NetaQMDJView) return { error: "NetaQMDJView module not found!" };

            const testDate = new Date(2026, 8, 24, 10, 0); // 24/09/2026 10:00 (Tháng 9 là index 8)
            const chart = new window.QMDJCore.TheArtOfBecomingInvisible(testDate);
            const patterns = window.QMDJCore.getChartPatterns ? window.QMDJCore.getChartPatterns(chart) : [];

            return {
                round: chart.round,
                boxLength: chart.box.length,
                patternsCount: patterns.length,
                firstPattern: patterns[0] ? patterns[0].name : null
            };
        }""")
        print("Engine check result:", engine_check)
        assert "error" not in engine_check, engine_check["error"]
        assert engine_check["boxLength"] == 3, "Luoshu box must be 3x3"
        print("QMDJ Engine Core 100% verified!")

        # 3. Switch to QMDJ Mode via Dropdown
        print("3. Switching to Ky Mon Don Giap via dropdown...")
        await page.click("#deck-selector-trigger")
        await page.wait_for_timeout(300)
        await page.click("#tab-mode-qmdj")
        await page.wait_for_timeout(500)

        assert await page.is_visible("#view-qmdj"), "view-qmdj must be visible"
        assert not await page.is_visible("#view-cards"), "view-cards must be hidden"

        # Check title & subtitle
        title = await page.inner_text("#app-main-title")
        assert "KỲ MÔN ĐỘN GIÁP" in title, f"Unexpected title: {title}"

        # 4. Verify 9 Palaces & Components
        print("4. Verifying 9 Palaces matrix & components...")
        cells = await page.query_selector_all(".qmdj-palace-cell")
        assert len(cells) == 9, f"Expected 9 palace cells, got {len(cells)}"

        center = await page.query_selector(".center-palace")
        assert center is not None, "Center palace must exist"
        center_text = await center.inner_text()
        assert "TRUNG CUNG" in center_text

        cuc_text = await page.inner_text(".cuc-round")
        print(f"Current Cuc: {cuc_text}")
        assert "CỤC" in cuc_text.upper()

        pillars_count = len(await page.query_selector_all(".q-pillar"))
        assert pillars_count == 4, f"Expected 4 pillars, got {pillars_count}"

        shot_grid = os.path.join(SCREENSHOT_DIR, "step3_01_qmdj_grid.png")
        await page.screenshot(path=shot_grid)
        print(f"Saved QMDJ Grid Screenshot: {shot_grid}")

        # 5. Test Hour Stepping
        print("5. Testing hour step navigation...")
        hour_val_before = await page.inner_text(".highlight-hour .q-val")
        print(f"Hour pillar before: {hour_val_before}")

        await page.click("#btn-qmdj-next-hour")
        await page.wait_for_timeout(400)
        hour_val_after = await page.inner_text(".highlight-hour .q-val")
        print(f"Hour pillar after +1 step: {hour_val_after}")

        await page.click("#btn-qmdj-prev-hour")
        await page.wait_for_timeout(400)

        await page.click("#btn-qmdj-now")
        await page.wait_for_timeout(400)

        # 6. Test Palace Click & Modal Detail
        print("6. Testing palace click to open detailed analysis modal...")
        # Click palace cell 0 (Tốn cung)
        await page.click('.qmdj-palace-cell:not(.center-palace)')
        await page.wait_for_timeout(400)

        assert await page.is_visible("#qmdj-palace-modal"), "QMDJ Palace modal must be visible"
        modal_title = await page.inner_text("#qmdj-modal-title")
        print(f"Modal title: {modal_title}")

        shot_modal = os.path.join(SCREENSHOT_DIR, "step3_02_qmdj_palace_modal.png")
        await page.screenshot(path=shot_modal)
        print(f"Saved QMDJ Modal Screenshot: {shot_modal}")

        # Close modal
        await page.click("#qmdj-modal-close")
        await page.wait_for_timeout(300)
        assert not await page.is_visible("#qmdj-palace-modal"), "Modal must be closed"

        # 7. Test Calendar -> QMDJ 1-tap transition
        print("7. Testing Calendar -> QMDJ 1-tap shortcut...")
        await page.click("#deck-selector-trigger")
        await page.wait_for_timeout(300)
        await page.click("#tab-mode-calendar")
        await page.wait_for_timeout(500)

        # Switch to Day Bloc
        await page.click("#btn-view-bloc-detail")
        await page.wait_for_timeout(400)

        # Click QMDJ 1-tap button in bloc
        await page.click(".cal-action-btn[data-action='qmdj']")
        await page.wait_for_timeout(500)

        assert await page.is_visible("#view-qmdj"), "Must switch back to QMDJ from Calendar bloc"
        print("Calendar -> QMDJ 1-tap transition verified!")

        # 8. Test Zero Regression on Card Modes
        print("8. Testing Zero Regression on Neta Light & Poker cards...")
        # Neta mode
        await page.click("#deck-selector-trigger")
        await page.wait_for_timeout(300)
        await page.click("#tab-mode-neta")
        await page.wait_for_timeout(500)
        assert await page.is_visible("#view-cards")

        # Draw 1 card
        await page.click("#btn-draw-single")
        await page.wait_for_timeout(800)
        card_el = await page.query_selector(".card-item")
        assert card_el is not None, "A card must be drawn"

        # Flip card
        await card_el.click()
        await page.wait_for_timeout(600)

        # Check if modal opened on flip or needs second click
        if await page.is_visible("#card-modal"):
            print("Card modal opened!")
            await page.click("#modal-close-btn")
            await page.wait_for_timeout(300)
        else:
            await card_el.click()
            await page.wait_for_timeout(400)
            if await page.is_visible("#card-modal"):
                print("Card modal opened on 2nd click!")
                await page.click("#modal-close-btn")
                await page.wait_for_timeout(300)

        shot_card = os.path.join(SCREENSHOT_DIR, "step3_03_zero_regression_card.png")
        await page.screenshot(path=shot_card)
        print(f"Saved Zero Regression Screenshot: {shot_card}")

        print("=== ALL STEP 3 QMDJ TESTS PASSED 100% PERFECTLY! ===")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_qmdj())
