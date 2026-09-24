import asyncio
import os
from playwright.async_api import async_playwright

SCREENSHOT_DIR = r"C:\Books\Neta Light\scripts\test_results"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

async def test_calendar():
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

        # 2. Check engine functions in browser context
        print("2. Verifying astronomical engine in browser...")
        engine_check = await page.evaluate("""() => {
            const eng = window.NetaCalendarEngine;
            if (!eng) return { error: "Engine not found on window!" };
            const lunar = eng.solar2Lunar(24, 9, 2026);
            const canChi = eng.getCanChi(24, 9, 2026, 10);
            const term = eng.getSolarTerm(24, 9, 2026);
            const mansion = eng.getMansion(24, 9, 2026);
            const truc = eng.getTruc(24, 9, 2026);
            const hd = eng.getDayHoangDao(24, 9, 2026);
            return {
                lunar, canChi, term, mansionName: mansion.name, trucName: truc.name, hd
            };
        }""")
        print("Engine test result:", engine_check)
        assert "error" not in engine_check, engine_check["error"]
        assert engine_check["canChi"]["year"].startswith("Bính Ngọ"), f"Expected Bính Ngọ, got {engine_check['canChi']['year']}"
        assert engine_check["canChi"]["yearNapAm"] == "Thiên Hà Thủy", f"Expected Thiên Hà Thủy, got {engine_check['canChi']['yearNapAm']}"
        print("Astronomical Math Verified: 2026 = Bính Ngọ (Thiên Hà Thủy) 100% correct!")

        # 3. Switch to Calendar Mode via Dropdown
        print("3. Switching to Lich Am Duong...")
        await page.click("#deck-selector-trigger")
        await page.wait_for_timeout(300)
        await page.click("#tab-mode-calendar")
        await page.wait_for_timeout(500)

        assert await page.is_visible("#view-calendar"), "view-calendar must be visible"
        assert await page.is_visible(".cal-month-wrapper"), "Month grid must be visible"

        shot_month = os.path.join(SCREENSHOT_DIR, "step2_01_calendar_month.png")
        await page.screenshot(path=shot_month)
        print(f"Saved Month Grid: {shot_month}")

        # 4. Click a day cell to update quick summary
        print("4. Selecting day cell...")
        await page.click(".cal-cell[data-day='15']")
        await page.wait_for_timeout(300)

        # 5. Switch to Daily Bloc view
        print("5. Switching to Daily Bloc view...")
        await page.click("#btn-view-bloc-detail")
        await page.wait_for_timeout(500)

        assert await page.is_visible(".cal-bloc-card"), "Daily Bloc card must be visible"
        big_num = await page.inner_text(".bloc-big-num")
        print(f"Bloc Big Day Number: {big_num}")
        assert big_num == "15", f"Expected 15, got {big_num}"

        shot_bloc = os.path.join(SCREENSHOT_DIR, "step2_02_calendar_day_bloc.png")
        await page.screenshot(path=shot_bloc)
        print(f"Saved Day Bloc: {shot_bloc}")

        # 6. Test 1-Tap Quick Action from Bloc (e.g. click Boi Bai)
        print("6. Testing 1-Tap Quick Action: back to Neta Light...")
        await page.click(".bloc-actions-row button[data-action='neta']")
        await page.wait_for_timeout(500)

        assert await page.is_visible("#view-cards"), "view-cards must be visible after 1-tap action"
        title = await page.inner_text("#app-main-title")
        print(f"App title after 1-tap action: {title}")
        assert "NETA LIGHT" in title

        print("=== ALL STEP 2 CALENDAR TESTS PASSED PERFECTLY! ===")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_calendar())
