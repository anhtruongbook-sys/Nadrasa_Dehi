import asyncio
import sys
from playwright.async_api import async_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 412, "height": 915})
        page = await context.new_page()

        print("Navigating to http://127.0.0.1:8080 ...")
        await page.goto("http://127.0.0.1:8080", wait_until="networkidle")

        # 1. Test Tử Vi
        print("Testing Tu Vi module...")
        await page.evaluate("() => switchAppMode('tuvi')")
        await page.wait_for_selector("#tuvi-input-year")

        # Check buttons exist
        assert await page.is_visible("#tuvi-btn-cal-type"), "Tu Vi Lunar toggle missing"
        assert await page.is_visible("#tuvi-btn-quick-year"), "Tu Vi Year jumper missing"

        # Test typing '79' in year input
        year_input = page.locator("#tuvi-input-year")
        await year_input.fill("79")
        await year_input.press("Enter")
        await page.wait_for_timeout(300)
        # Year should expand to 1979 or chart recomputed
        val = await year_input.input_value()
        print(f"Tu Vi year input value after '79': {val}")
        assert val == "1979", f"Expected 1979 but got {val}"

        # Test decade modal
        await page.click("#tuvi-btn-quick-year")
        await page.wait_for_selector("#smart-year-modal", state="visible")
        print("Tu Vi: Year jumper modal opened!")
        # Click 1960s
        decade_chip = page.locator('.decade-chip:has-text("1960s")')
        await decade_chip.click()
        # Click 1965
        year_chip = page.locator('.year-chip:has-text("1965")')
        await year_chip.click()
        await page.wait_for_timeout(300)
        val2 = await year_input.input_value()
        print(f"Tu Vi year input value after picking 1965: {val2}")
        assert val2 == "1965", f"Expected 1965 but got {val2}"

        # Test Lunar Toggle & Bidirectional Conversion
        print("Testing Tu Vi Lunar Input (24/10/1979 Âm Lịch)...")
        await page.click("#tuvi-btn-cal-type")
        toggle_text = await page.inner_text("#tuvi-btn-cal-type")
        assert "Âm" in toggle_text, f"Expected Lunar toggle active, got {toggle_text}"
        await page.fill("#tuvi-input-day", "24")
        await page.fill("#tuvi-input-month", "10")
        await page.fill("#tuvi-input-year", "1979")
        await page.click("#btn-tuvi-submit")
        await page.wait_for_timeout(400)
        # Check that chart was computed and corresponds to solar 13/12/1979
        tuvi_meta = await page.inner_text(".tuvi-center-box")
        print(f"Tu Vi Center Box after Lunar 24/10/1979:\n{tuvi_meta}")
        assert "13/12/1979" in tuvi_meta, f"Expected 13/12/1979 in chart but got: {tuvi_meta}"
        assert "24/10" in tuvi_meta, f"Expected 24/10 in chart but got: {tuvi_meta}"

        # 2. Test Bát Tự
        print("Testing Bazi module...")
        await page.evaluate("() => switchAppMode('bazi')")
        await page.wait_for_selector("#bazi-input-year")
        assert await page.is_visible("#bazi-btn-cal-type"), "Bazi Lunar toggle missing"
        assert await page.is_visible("#bazi-btn-quick-year"), "Bazi Year jumper missing"

        bazi_year = page.locator("#bazi-input-year")
        await bazi_year.fill("05")
        await bazi_year.press("Enter")
        await page.wait_for_timeout(300)
        bazi_val = await bazi_year.input_value()
        print(f"Bazi year input after '05': {bazi_val}")
        assert bazi_val == "2005", f"Expected 2005 but got {bazi_val}"

        # 3. Test Kỳ Môn
        print("Testing QMDJ module...")
        await page.evaluate("() => switchAppMode('qmdj')")
        await page.wait_for_selector("#qmdj-input-year")
        assert await page.is_visible("#btn-qmdj-lunar-toggle"), "QMDJ Lunar toggle missing"
        assert await page.is_visible("#btn-qmdj-year-jumper"), "QMDJ Year jumper missing"

        qmdj_year = page.locator("#qmdj-input-year")
        await qmdj_year.fill("82")
        await page.click("#btn-qmdj-submit")
        await page.wait_for_timeout(300)
        qmdj_val = await qmdj_year.input_value()
        print(f"QMDJ year input after '82': {qmdj_val}")
        assert qmdj_val == "1982", f"Expected 1982 but got {qmdj_val}"

        # 4. Test Calendar View
        print("Testing Calendar module...")
        await page.evaluate("() => switchAppMode('calendar')")
        await page.wait_for_selector("#cal-jump-year")
        assert await page.is_visible("#btn-cal-lunar-toggle"), "Calendar Lunar toggle missing"
        assert await page.is_visible("#btn-cal-year-jumper"), "Calendar Year jumper missing"

        cal_year = page.locator("#cal-jump-year")
        await cal_year.fill("90")
        await page.click("#btn-cal-jump")
        await page.wait_for_timeout(300)
        cal_val = await cal_year.input_value()
        print(f"Calendar year input after '90': {cal_val}")
        assert cal_val == "1990", f"Expected 1990 but got {cal_val}"

        print("ALL 4 MODULES PASSED SMART PICKER & DECADE JUMPER TESTS SUCCESSFULLY!")
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
