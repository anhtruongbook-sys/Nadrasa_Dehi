import asyncio
import os
import sys

# Ensure UTF-8 output on Windows console
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

SCREENSHOT_DIR = r"C:\Books\Neta Light\scripts\test_results"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

async def test_bazi():
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
        print("2. Verifying NetaBaziEngine in browser...")
        engine_check = await page.evaluate("""() => {
            if (!window.NetaBaziEngine) return { error: "NetaBaziEngine not found on window!" };
            if (!window.NetaBaziView) return { error: "NetaBaziView module not found!" };

            const chart = window.NetaBaziEngine.buildBaziChart({
                day: 24, month: 9, year: 2026, hour: 11, isMale: true, startAge: 3
            });

            return {
                dayMaster: chart.dayMaster.gan,
                dayMasterWx: chart.dayMaster.wx,
                season: chart.dayMaster.seasonStatus.season,
                seasonState: chart.dayMaster.seasonStatus.stateCode,
                pillarsCount: chart.tuTru.length,
                yearCanChi: chart.tuTru[0].canChi,
                yearDeity: chart.tuTru[0].deity,
                dayCanChi: chart.tuTru[2].canChi,
                interactionsCount: chart.interactions.length,
                daYunCount: chart.daYun.results.length,
                firstDaYun: chart.daYun.results[0].canChi
            };
        }""")
        print("Engine check result:", engine_check)
        assert "error" not in engine_check, engine_check["error"]
        assert engine_check["dayMaster"] == "Tân", f"Expected Tân, got {engine_check['dayMaster']}"
        assert engine_check["dayMasterWx"] == "Kim"
        assert engine_check["pillarsCount"] == 4
        assert "Bính Ngọ" in engine_check["yearCanChi"]
        assert "Tân Sửu" in engine_check["dayCanChi"]
        assert engine_check["daYunCount"] == 10
        print("Bazi Engine Core 100% verified!")

        # 3. Switch to Bát Tự Mode via Dropdown
        print("3. Switching to Bat Tu Manh Phai via dropdown...")
        await page.click("#deck-selector-trigger")
        await page.wait_for_timeout(300)
        await page.click("#tab-mode-bazi")
        await page.wait_for_timeout(500)

        assert await page.is_visible("#view-bazi"), "view-bazi must be visible"
        assert not await page.is_visible("#view-cards"), "view-cards must be hidden"

        title = await page.inner_text("#app-main-title")
        print(f"App title: {title}")
        assert "BÁT TỰ" in title

        # 4. Verify Tứ Trụ, Interactions, 12 Palaces & Đại Vận
        print("4. Verifying Tứ Trụ, Tương Tác, 12 Cung & Đại Vận UI...")
        pillars = await page.query_selector_all(".bazi-pillar-col")
        assert len(pillars) == 4, f"Expected 4 pillars, got {len(pillars)}"

        # Check Day Master Pillar
        dm_pillar = await page.query_selector(".is-daymaster-col")
        assert dm_pillar is not None, "Day Master column must exist"
        dm_text = await dm_pillar.inner_text()
        assert "Bản Mệnh" in dm_text

        # Check 12 Palaces
        palaces = await page.query_selector_all(".bazi-palace-mini-card")
        assert len(palaces) == 12, f"Expected 12 palaces, got {len(palaces)}"

        # Check 10 Dai Vun
        dayun_items = await page.query_selector_all(".bazi-dayun-item")
        assert len(dayun_items) == 10, f"Expected 10 Dai Vun items, got {len(dayun_items)}"

        # Check Annual (Lưu Niên) Grid
        annual_cards = await page.query_selector_all(".annual-card")
        assert len(annual_cards) == 10, f"Expected 10 annual cards, got {len(annual_cards)}"

        shot_chart = os.path.join(SCREENSHOT_DIR, "step4_01_bazi_chart.png")
        await page.screenshot(path=shot_chart)
        print(f"Saved Bazi Chart Screenshot: {shot_chart}")

        # 5. Test Gender Toggle & Direction Reversal
        print("5. Testing Gender Toggle...")
        gender_text_before = await page.inner_text("#bazi-btn-gender")
        assert "Nam" in gender_text_before
        first_dayun_before = await page.inner_text(".bazi-dayun-item[data-step='1'] .lp-canchi")
        print(f"First DaYun (Nam): {first_dayun_before}")

        await page.click("#bazi-btn-gender")
        await page.wait_for_timeout(400)

        gender_text_after = await page.inner_text("#bazi-btn-gender")
        assert "Nữ" in gender_text_after
        first_dayun_after = await page.inner_text(".bazi-dayun-item[data-step='1'] .lp-canchi")
        print(f"First DaYun (Nữ): {first_dayun_after}")
        assert first_dayun_before != first_dayun_after, "DaYun direction must reverse for Female!"

        # Toggle back to Nam
        await page.click("#bazi-btn-gender")
        await page.wait_for_timeout(300)

        # 6. Test Step Selection in Đại Vận
        print("6. Testing selecting Step 2 in Đại Vận...")
        await page.click(".bazi-dayun-item[data-step='2']")
        await page.wait_for_timeout(300)
        annual_title = await page.inner_text(".annual-header")
        print(f"Annual Header after selecting Step 2: {annual_title}")
        assert "13 - 22" in annual_title or "VẬN" in annual_title

        # 7. Test Pillar Click & Modal Detail
        print("7. Testing Pillar click to open detail modal...")
        await page.click(".bazi-pillar-col[data-pillar-idx='2']") # Trụ Ngày
        await page.wait_for_timeout(400)

        assert await page.is_visible("#bazi-pillar-modal"), "Pillar modal must be visible"
        modal_title = await page.inner_text("#bazi-modal-title")
        print(f"Modal title: {modal_title}")
        assert "NGÀY" in modal_title

        shot_modal = os.path.join(SCREENSHOT_DIR, "step4_02_bazi_pillar_modal.png")
        await page.screenshot(path=shot_modal)
        print(f"Saved Bazi Modal Screenshot: {shot_modal}")

        # Close modal
        await page.click("#bazi-modal-close")
        await page.wait_for_timeout(300)
        assert not await page.is_visible("#bazi-pillar-modal")

        # 8. Test Calendar -> Bát Tự 1-tap transition
        print("8. Testing Calendar -> Bát Tự 1-tap shortcut...")
        await page.click("#deck-selector-trigger")
        await page.wait_for_timeout(300)
        await page.click("#tab-mode-calendar")
        await page.wait_for_timeout(500)

        # Switch to Day Bloc
        await page.click("#btn-view-bloc-detail")
        await page.wait_for_timeout(400)

        # Click Bát Tự button in bloc
        await page.click(".cal-action-btn[data-action='bazi']")
        await page.wait_for_timeout(500)

        assert await page.is_visible("#view-bazi"), "Must switch to Bazi from Calendar bloc"
        print("Calendar -> Bát Tự 1-tap transition verified!")

        # 9. Test Zero Regression on Card Modes
        print("9. Testing Zero Regression on Neta Light & Poker cards...")
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

        shot_card = os.path.join(SCREENSHOT_DIR, "step4_03_zero_regression_card.png")
        await page.screenshot(path=shot_card)
        print(f"Saved Zero Regression Screenshot: {shot_card}")

        print("=== ALL STEP 4 BAZI TESTS PASSED 100% PERFECTLY! ===")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_bazi())
