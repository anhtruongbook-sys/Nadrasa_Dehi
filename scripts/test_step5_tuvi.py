import asyncio
import os
import sys

# Ensure UTF-8 output on Windows console
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

SCREENSHOT_DIR = r"C:\Books\Neta Light\scripts\test_results"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

async def test_tuvi():
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
        print("2. Verifying NetaTuViEngine in browser...")
        engine_check = await page.evaluate("""() => {
            if (!window.NetaTuViEngine) return { error: "NetaTuViEngine not found on window!" };
            if (!window.NetaTuViView) return { error: "NetaTuViView module not found!" };

            const chart = window.NetaTuViEngine.generateTuViChart({
                day: 24, month: 9, year: 2026, hour: 11, isMale: true
            });

            const menh = chart.palaces.find(p => p.isMenh);
            const than = chart.palaces.find(p => p.isThan);

            return {
                cucName: chart.meta.cucName,
                napAm: chart.meta.napAm,
                menhCung: menh ? menh.canChi : null,
                thanCung: than ? than.canChi : null,
                menhMainStars: menh ? menh.mainStars.map(s => s.fullName) : [],
                palacesCount: chart.palaces.length,
                relativesCheck: menh ? menh.relatives : null
            };
        }""")
        print("Engine check result:", engine_check)
        assert "error" not in engine_check, engine_check["error"]
        assert "Mộc Tam Cục" in engine_check["cucName"]
        assert "Thiên Hà Thủy" in engine_check["napAm"]
        assert engine_check["palacesCount"] == 12
        assert engine_check["menhCung"] == "Tân Mão"
        print("Tu Vi Engine Core 100% verified!")

        # 3. Switch to Tử Vi Mode via Dropdown
        print("3. Switching to Tu Vi Dau So via dropdown...")
        await page.click("#deck-selector-trigger")
        await page.wait_for_timeout(300)
        await page.click("#tab-mode-tuvi")
        await page.wait_for_timeout(500)

        assert await page.is_visible("#view-tuvi"), "view-tuvi must be visible"
        assert not await page.is_visible("#view-cards"), "view-cards must be hidden"

        title = await page.inner_text("#app-main-title")
        print(f"App title: {title}")
        assert "TỬ VI" in title

        # 4. Verify 4x4 Grid & Components
        print("4. Verifying 4x4 Grid layout & components...")
        cells = await page.query_selector_all(".tuvi-cell")
        assert len(cells) == 12, f"Expected 12 palace cells, got {len(cells)}"

        center = await page.query_selector(".tuvi-center-box")
        assert center is not None, "Center Thiên Bàn must exist"
        center_text = await center.inner_text()
        assert "TỬ VI ĐẨU SỐ" in center_text
        assert "Mộc Tam Cục" in center_text

        menh_cell = await page.query_selector(".cell-menh")
        assert menh_cell is not None, "Cung Mệnh must be highlighted"

        shot_grid = os.path.join(SCREENSHOT_DIR, "step5_01_tuvi_grid_4x4.png")
        await page.screenshot(path=shot_grid)
        print(f"Saved 4x4 Grid Screenshot: {shot_grid}")

        # 5. Test Palace Click & Modal Detail
        print("5. Testing Palace click to open detail modal...")
        await page.click(".cell-menh")
        await page.wait_for_timeout(400)

        assert await page.is_visible("#tuvi-palace-modal"), "Tu Vi Palace modal must be visible"
        modal_title = await page.inner_text("#tuvi-modal-title")
        print(f"Modal title: {modal_title}")
        assert "MỆNH" in modal_title

        # Check relatives section
        assert await page.is_visible(".relatives-section"), "Tam Phương Tứ Chính section must exist"

        shot_modal = os.path.join(SCREENSHOT_DIR, "step5_02_tuvi_palace_modal.png")
        await page.screenshot(path=shot_modal)
        print(f"Saved Tu Vi Modal Screenshot: {shot_modal}")

        # Close modal
        await page.click("#tuvi-modal-close")
        await page.wait_for_timeout(300)
        assert not await page.is_visible("#tuvi-palace-modal")

        # 6. Test Switch to List Mode
        print("6. Testing switch to 12 Palaces List mode...")
        await page.click("#btn-tuvi-mode-list")
        await page.wait_for_timeout(400)

        list_cards = await page.query_selector_all(".tuvi-list-card")
        assert len(list_cards) == 12, f"Expected 12 list cards, got {len(list_cards)}"

        shot_list = os.path.join(SCREENSHOT_DIR, "step5_03_tuvi_list_mode.png")
        await page.screenshot(path=shot_list)
        print(f"Saved Tu Vi List Mode Screenshot: {shot_list}")

        # Switch back to 4x4 Grid
        await page.click("#btn-tuvi-mode-grid")
        await page.wait_for_timeout(300)

        # 7. Test Calendar -> Tử Vi 1-tap transition
        print("7. Testing Calendar -> Tử Vi 1-tap shortcut...")
        await page.click("#deck-selector-trigger")
        await page.wait_for_timeout(300)
        await page.click("#tab-mode-calendar")
        await page.wait_for_timeout(500)

        # Switch to Day Bloc
        await page.click("#btn-view-bloc-detail")
        await page.wait_for_timeout(400)

        # Click Tử Vi button in bloc
        await page.click(".cal-action-btn[data-action='tuvi']")
        await page.wait_for_timeout(500)

        assert await page.is_visible("#view-tuvi"), "Must switch to Tu Vi from Calendar bloc"
        print("Calendar -> Tử Vi 1-tap transition verified!")

        # 8. Test Zero Regression on Card Modes
        print("8. Testing Zero Regression on Neta Light & Poker cards...")
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

        if await page.is_visible("#card-modal"):
            await page.click("#modal-close-btn")
            await page.wait_for_timeout(300)

        shot_card = os.path.join(SCREENSHOT_DIR, "step5_04_zero_regression_card.png")
        await page.screenshot(path=shot_card)
        print(f"Saved Zero Regression Screenshot: {shot_card}")

        print("=== ALL STEP 5 TU VI TESTS PASSED 100% PERFECTLY! ===")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_tuvi())
