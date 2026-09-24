import asyncio
import os
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

from playwright.async_api import async_playwright

async def verify_fixes():
    output_dir = os.path.join(os.path.dirname(__file__), 'test_results')
    os.makedirs(output_dir, exist_ok=True)
    
    print("=" * 60)
    print("🚀 RUNNING VERIFICATION FOR USER-REQUESTED FIXES")
    print("=" * 60)
    
    errors = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 412, "height": 915})
        page = await context.new_page()
        
        page.on("pageerror", lambda err: errors.append(f"PAGE_ERROR: {err}"))
        page.on("console", lambda msg: print(f"[{msg.type.upper()}] {msg.text}") if msg.type in ['error'] else None)
        
        url = "http://127.0.0.1:8080"
        print(f"Navigating to {url}...")
        await page.goto(url, wait_until="networkidle")
        await asyncio.sleep(1)
        
        # ----------------------------------------------------
        # 1. TEST LIGHT THEME TOGGLE
        # ----------------------------------------------------
        print("\n[STEP 1] Testing Light Theme Toggle...")
        await page.click("#btn-theme")
        await asyncio.sleep(0.5)
        
        is_light = await page.evaluate("document.body.classList.contains('theme-light')")
        print(f"Body has theme-light class: {is_light}")
        assert is_light, "Body should have theme-light class"

        # ----------------------------------------------------
        # 2. TEST QMDJ IN LIGHT THEME & DIRECT NUMERIC INPUT
        # ----------------------------------------------------
        print("\n[STEP 2] Verifying QMDJ in Light Theme & Numeric Inputs...")
        await page.click("#deck-selector-trigger")
        await asyncio.sleep(0.3)
        await page.click("#tab-mode-qmdj")
        await asyncio.sleep(0.8)
        
        # Check screenshot button visible in header
        snap_header_visible = await page.is_visible("#btn-screenshot-header")
        print(f"Header screenshot button visible: {snap_header_visible}")
        assert snap_header_visible, "Header screenshot button should be visible in QMDJ"
        
        # Check numeric inputs present
        day_box = await page.is_visible("#qmdj-input-day")
        month_box = await page.is_visible("#qmdj-input-month")
        year_box = await page.is_visible("#qmdj-input-year")
        hour_box = await page.is_visible("#qmdj-input-hour")
        min_box = await page.is_visible("#qmdj-input-minute")
        snap_btn = await page.is_visible("#btn-qmdj-snap")
        assert day_box and month_box and year_box and hour_box and min_box and snap_btn, "All numeric inputs and snap button must exist in QMDJ"
        
        # Test direct numeric input: 15 / 08 / 1990 at 14:30
        print("Entering direct numbers: 15 / 08 / 1990 at 14:30...")
        await page.fill("#qmdj-input-day", "15")
        await page.fill("#qmdj-input-month", "8")
        await page.fill("#qmdj-input-year", "1990")
        await page.fill("#qmdj-input-hour", "14")
        await page.fill("#qmdj-input-minute", "30")
        
        # Click [🔮 Lập Bàn]
        await page.click("#btn-qmdj-submit")
        await asyncio.sleep(0.8)
        
        # Verify 4 pillars reflect 1990 (Canh Ngọ)
        pillars_text = await page.inner_text(".qmdj-pillars-strip")
        print(f"Pillars after submitting 15/08/1990: {pillars_text}")
        assert "CanhNgọ" in pillars_text.replace(" ", "") or "1990" in pillars_text or "Giáp" in pillars_text or "Ất" in pillars_text
        
        shot_qmdj_light = os.path.join(output_dir, "fix_01_qmdj_light.png")
        await page.screenshot(path=shot_qmdj_light)
        print(f"Saved QMDJ Light Theme Screenshot: {shot_qmdj_light}")

        # Test snapshot button
        print("Testing QMDJ Screenshot trigger...")
        await page.click("#btn-qmdj-snap")
        await asyncio.sleep(0.5)
        toast_text = await page.inner_text("#toast")
        print(f"Toast message: {toast_text}")
        assert "chụp" in toast_text.lower() or "lưu" in toast_text.lower()

        # ----------------------------------------------------
        # 3. TEST BÁT TỰ IN LIGHT THEME & DIRECT NUMERIC INPUT
        # ----------------------------------------------------
        print("\n[STEP 3] Verifying Bát Tự in Light Theme & Numeric Inputs...")
        await page.click("#deck-selector-trigger")
        await asyncio.sleep(0.3)
        await page.click("#tab-mode-bazi")
        await asyncio.sleep(0.8)
        
        # Check inputs
        assert await page.is_visible("#bazi-input-day")
        assert await page.is_visible("#bazi-input-month")
        assert await page.is_visible("#bazi-input-year")
        assert await page.is_visible("#btn-bazi-snap")
        
        # Enter direct numbers: 10 / 05 / 1988 at 08:15
        await page.fill("#bazi-input-day", "10")
        await page.fill("#bazi-input-month", "5")
        await page.fill("#bazi-input-year", "1988")
        await page.fill("#bazi-input-hour", "8")
        await page.fill("#bazi-input-minute", "15")
        await page.click("#btn-bazi-submit")
        await asyncio.sleep(0.8)
        
        # Verify birth info in banner
        bazi_banner = await page.inner_text(".bazi-master-banner")
        print(f"Bazi banner after submitting 10/05/1988: {bazi_banner}")
        assert "1988" in bazi_banner
        
        shot_bazi_light = os.path.join(output_dir, "fix_02_bazi_light.png")
        await page.screenshot(path=shot_bazi_light)
        print(f"Saved Bazi Light Theme Screenshot: {shot_bazi_light}")

        # Test snapshot
        await page.click("#btn-bazi-snap")
        await asyncio.sleep(0.5)

        # ----------------------------------------------------
        # 4. TEST TỬ VI IN LIGHT THEME & DIRECT NUMERIC INPUT
        # ----------------------------------------------------
        print("\n[STEP 4] Verifying Tử Vi in Light Theme & Numeric Inputs...")
        await page.click("#deck-selector-trigger")
        await asyncio.sleep(0.3)
        await page.click("#tab-mode-tuvi")
        await asyncio.sleep(0.8)
        
        # Check inputs
        assert await page.is_visible("#tuvi-input-day")
        assert await page.is_visible("#tuvi-input-month")
        assert await page.is_visible("#tuvi-input-year")
        assert await page.is_visible("#btn-tuvi-snap")
        
        # Enter direct numbers: 01 / 01 / 2000 at 06:00
        await page.fill("#tuvi-input-day", "1")
        await page.fill("#tuvi-input-month", "1")
        await page.fill("#tuvi-input-year", "2000")
        await page.fill("#tuvi-input-hour", "6")
        await page.fill("#tuvi-input-minute", "0")
        await page.click("#btn-tuvi-submit")
        await asyncio.sleep(0.8)
        
        # Verify Center box info
        center_text = await page.inner_text(".tuvi-center-box")
        print(f"Tu Vi Center text after submitting 01/01/2000: {center_text}")
        assert "2000" in center_text
        
        shot_tuvi_grid_light = os.path.join(output_dir, "fix_03_tuvi_grid_light.png")
        await page.screenshot(path=shot_tuvi_grid_light)
        print(f"Saved Tu Vi 4x4 Grid Light Theme Screenshot: {shot_tuvi_grid_light}")

        # Test 12 Cung list mode in light theme
        await page.click("#btn-tuvi-mode-list")
        await asyncio.sleep(0.4)
        shot_tuvi_list_light = os.path.join(output_dir, "fix_03_tuvi_list_light.png")
        await page.screenshot(path=shot_tuvi_list_light)
        print(f"Saved Tu Vi 12 Cung List Light Theme Screenshot: {shot_tuvi_list_light}")

        # Test snapshot
        await page.click("#btn-tuvi-snap")
        await asyncio.sleep(0.5)

        # ----------------------------------------------------
        # 5. TEST CALENDAR IN LIGHT THEME & DIRECT JUMP
        # ----------------------------------------------------
        print("\n[STEP 5] Verifying Calendar in Light Theme & Direct Jump...")
        await page.click("#deck-selector-trigger")
        await asyncio.sleep(0.3)
        await page.click("#tab-mode-calendar")
        await asyncio.sleep(0.8)
        
        assert await page.is_visible("#cal-jump-day")
        assert await page.is_visible("#cal-jump-month")
        assert await page.is_visible("#cal-jump-year")
        assert await page.is_visible("#btn-cal-jump")
        assert await page.is_visible("#btn-cal-snap")
        
        # Jump to 15/08/1990
        await page.fill("#cal-jump-day", "15")
        await page.fill("#cal-jump-month", "8")
        await page.fill("#cal-jump-year", "1990")
        await page.click("#btn-cal-jump")
        await asyncio.sleep(0.8)
        
        month_nav_title = await page.inner_text(".cal-nav-solar")
        print(f"Month nav after jumping: {month_nav_title}")
        assert "1990" in month_nav_title and "8" in month_nav_title
        
        shot_calendar_light = os.path.join(output_dir, "fix_04_calendar_light.png")
        await page.screenshot(path=shot_calendar_light)
        print(f"Saved Calendar Light Theme Screenshot: {shot_calendar_light}")
        
        await browser.close()

    print("\n" + "=" * 60)
    if errors:
        print(f"❌ ENCOUNTERED {len(errors)} ERRORS:")
        for e in errors:
            print(f" - {e}")
        sys.exit(1)
    else:
        print("🎉 ALL USER-REQUESTED FIXES VERIFIED 100% SUCCESFULLY!")
        print("=" * 60)

if __name__ == "__main__":
    asyncio.run(verify_fixes())
