import asyncio
import os
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def run_full_suite():
    output_dir = os.path.join(os.path.dirname(__file__), 'test_results')
    os.makedirs(output_dir, exist_ok=True)
    
    print("=" * 60)
    print("🚀 RUNNING FULL END-TO-END VERIFICATION SUITE (ALL 6 MODES)")
    print("=" * 60)
    
    errors = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Mobile viewport standard
        context = await browser.new_context(viewport={"width": 412, "height": 915})
        page = await context.new_page()
        
        page.on("pageerror", lambda err: errors.append(f"PAGE_ERROR: {err}"))
        page.on("console", lambda msg: print(f"[{msg.type.upper()}] {msg.text}") if msg.type in ['error', 'warn'] else None)
        
        url = "http://127.0.0.1:8080"
        print(f"Navigating to {url}...")
        await page.goto(url, wait_until="networkidle")
        await asyncio.sleep(1)
        
        # ----------------------------------------------------
        # TEST 1: NETA LIGHT CARDS (MODE 1)
        # ----------------------------------------------------
        print("\n[TEST 1] Verifying Neta Light Cards Mode...")
        assert await page.is_visible("#view-cards"), "View cards should be visible"
        # Click draw 1 card
        await page.click("#btn-draw-single")
        await asyncio.sleep(0.5)
        drawn_cards = await page.locator(".card-item").count()
        print(f"Drawn Neta cards count: {drawn_cards}")
        assert drawn_cards == 1, f"Expected 1 card drawn, got {drawn_cards}"
        
        # Flip card
        await page.click(".card-item")
        await asyncio.sleep(0.5)
        if await page.is_visible("#card-modal"):
            await page.click("#modal-close-btn")
            await asyncio.sleep(0.3)
        await page.screenshot(path=os.path.join(output_dir, "suite_01_neta.png"))
        print("✓ Test 1: Neta Light mode working smoothly")

        # ----------------------------------------------------
        # TEST 2: POKER CARDS (MODE 2)
        # ----------------------------------------------------
        print("\n[TEST 2] Switching to Poker Cards Mode...")
        await page.click("#deck-selector-trigger")
        await asyncio.sleep(0.3)
        await page.click('#tab-mode-poker')
        await asyncio.sleep(0.8)
        
        # Check active mode and header title
        poker_active = await page.locator('#tab-mode-poker.active').count()
        assert poker_active == 1, "Poker option should be active in dropdown"
        
        # Draw 1 card then draw more
        await page.click("#btn-draw-single")
        await asyncio.sleep(0.5)
        await page.click("#btn-draw-more")
        await asyncio.sleep(0.5)
        poker_cards = await page.locator(".card-item").count()
        print(f"Drawn Poker cards count: {poker_cards}")
        assert poker_cards == 2, f"Expected 2 poker cards drawn, got {poker_cards}"
        await page.screenshot(path=os.path.join(output_dir, "suite_02_poker.png"))
        print("✓ Test 2: Poker mode working smoothly")

        # ----------------------------------------------------
        # TEST 3: LỊCH ÂM DƯƠNG (MODE 3)
        # ----------------------------------------------------
        print("\n[TEST 3] Switching to Lịch Âm Dương Mode...")
        await page.click("#deck-selector-trigger")
        await asyncio.sleep(0.3)
        await page.click('#tab-mode-calendar')
        await asyncio.sleep(0.8)
        
        assert await page.is_visible("#view-calendar"), "Calendar view should be visible"
        cal_days = await page.locator(".cal-cell:not(.empty)").count()
        print(f"Calendar day cells count: {cal_days}")
        assert cal_days >= 28, "Expected calendar month grid"
        
        summary_visible = await page.is_visible(".quick-summary-card")
        assert summary_visible, "Quick day summary card should be visible"
        
        # Test 1-tap fast buttons present
        btn_qmdj = await page.locator(".cal-action-btn:has-text('Kỳ Môn')").count()
        btn_bazi = await page.locator(".cal-action-btn:has-text('Bát Tự')").count()
        btn_tuvi = await page.locator(".cal-action-btn:has-text('Tử Vi')").count()
        assert btn_qmdj > 0 and btn_bazi > 0 and btn_tuvi > 0, "All 3 fast action buttons must be present"
        await page.screenshot(path=os.path.join(output_dir, "suite_03_calendar.png"))
        print("✓ Test 3: Calendar mode working smoothly")

        # ----------------------------------------------------
        # TEST 4: KỲ MÔN ĐỘN GIÁP (MODE 4)
        # ----------------------------------------------------
        print("\n[TEST 4] Switching to Kỳ Môn Độn Giáp via fast 1-tap button...")
        await page.click(".cal-action-btn:has-text('Kỳ Môn')")
        await asyncio.sleep(0.8)
        
        assert await page.is_visible("#view-qmdj"), "QMDJ view should be visible"
        qmdj_palaces = await page.locator(".qmdj-palace-cell").count()
        print(f"QMDJ palace cells count: {qmdj_palaces}")
        assert qmdj_palaces == 9, f"Expected 9 palaces in Luoshu grid, got {qmdj_palaces}"
        
        # Click palace cell (not center) to test Modal
        await page.click('.qmdj-palace-cell:not(.center-palace)')
        await asyncio.sleep(0.4)
        modal_visible = await page.is_visible("#qmdj-palace-modal")
        assert modal_visible, "QMDJ detail modal should open"
        await page.click("#qmdj-modal-close")
        await asyncio.sleep(0.3)
        await page.screenshot(path=os.path.join(output_dir, "suite_04_qmdj.png"))
        print("✓ Test 4: QMDJ mode working smoothly")

        # ----------------------------------------------------
        # TEST 5: BÁT TỰ MANH PHÁI (MODE 5)
        # ----------------------------------------------------
        print("\n[TEST 5] Switching to Bát Tự Manh Phái via dropdown...")
        await page.click("#deck-selector-trigger")
        await asyncio.sleep(0.3)
        await page.click('#tab-mode-bazi')
        await asyncio.sleep(0.8)
        
        assert await page.is_visible("#view-bazi"), "Bazi view should be visible"
        bazi_pillars = await page.locator(".bazi-pillar-col").count()
        print(f"Bazi pillar count: {bazi_pillars}")
        assert bazi_pillars == 4, f"Expected 4 pillars (Năm, Tháng, Ngày, Giờ), got {bazi_pillars}"
        
        # Test clicking Đại vận step
        await page.click(".bazi-dayun-item[data-step='2']")
        await asyncio.sleep(0.3)
        luunien_count = await page.locator(".annual-card").count()
        print(f"Lưu Niên years rendered: {luunien_count}")
        assert luunien_count == 10, f"Expected 10 Lưu Niên cards, got {luunien_count}"
        
        # Test pillar modal
        await page.click(".bazi-pillar-col[data-pillar-idx='2']")
        await asyncio.sleep(0.4)
        assert await page.is_visible("#bazi-pillar-modal"), "Pillar modal should open"
        await page.click("#bazi-modal-close")
        await asyncio.sleep(0.3)
        await page.screenshot(path=os.path.join(output_dir, "suite_05_bazi.png"))
        print("✓ Test 5: Bazi mode working smoothly")

        # ----------------------------------------------------
        # TEST 6: TỬ VI ĐẨU SỐ (MODE 6)
        # ----------------------------------------------------
        print("\n[TEST 6] Switching to Tử Vi Đẩu Số via dropdown...")
        await page.click("#deck-selector-trigger")
        await asyncio.sleep(0.3)
        await page.click('#tab-mode-tuvi')
        await asyncio.sleep(0.8)
        
        assert await page.is_visible("#view-tuvi"), "Tu Vi view should be visible"
        
        # Check 12 palaces in 4x4 Grid
        tuvi_palaces = await page.locator(".tuvi-cell:not(.tuvi-cell-center)").count()
        print(f"Tu Vi palace count: {tuvi_palaces}")
        assert tuvi_palaces == 12, f"Expected 12 palaces around the border, got {tuvi_palaces}"
        
        center_visible = await page.is_visible(".tuvi-center-box")
        assert center_visible, "Center box (Thiên Bàn) should be visible"
        
        # Test Palace click modal (Cung Mệnh)
        await page.click(".cell-menh")
        await asyncio.sleep(0.4)
        tv_modal_visible = await page.is_visible("#tuvi-palace-modal")
        assert tv_modal_visible, "Tu Vi detail modal should open"
        await page.click("#tuvi-modal-close")
        await asyncio.sleep(0.3)
        
        # Test Toggle to List Mode (12 Cung)
        await page.click("#btn-tuvi-mode-list")
        await asyncio.sleep(0.4)
        list_cards = await page.locator(".tuvi-list-card").count()
        print(f"Tu Vi list mode cards count: {list_cards}")
        assert list_cards == 12, f"Expected 12 cards in list mode, got {list_cards}"
        await page.screenshot(path=os.path.join(output_dir, "suite_06_tuvi_list.png"))
        
        # Toggle back to 4x4 grid
        await page.click("#btn-tuvi-mode-grid")
        await asyncio.sleep(0.4)
        await page.screenshot(path=os.path.join(output_dir, "suite_06_tuvi_grid.png"))
        print("✓ Test 6: Tu Vi mode working smoothly")

        # ----------------------------------------------------
        # TEST 7: ZERO REGRESSION RETURN TO NETA LIGHT
        # ----------------------------------------------------
        print("\n[TEST 7] Switching back to Neta Light to confirm zero regression...")
        await page.click("#deck-selector-trigger")
        await asyncio.sleep(0.3)
        await page.click('#tab-mode-neta')
        await asyncio.sleep(0.8)
        
        assert await page.is_visible("#view-cards"), "View cards should be visible again"
        assert not await page.is_visible("#view-tuvi"), "Tuvi view should be hidden"
        assert not await page.is_visible("#view-bazi"), "Bazi view should be hidden"
        assert not await page.is_visible("#view-qmdj"), "QMDJ view should be hidden"
        assert not await page.is_visible("#view-calendar"), "Calendar view should be hidden"
        await page.screenshot(path=os.path.join(output_dir, "suite_07_back_to_neta.png"))
        print("✓ Test 7: Return to Neta Light passed with zero regression")
        
        await browser.close()
        
    print("\n" + "=" * 60)
    if errors:
        print(f"❌ ENCOUNTERED {len(errors)} ERRORS:")
        for e in errors:
            print(f" - {e}")
        sys.exit(1)
    else:
        print("🎉 ALL 6 MODES PASSED 100% WITH ZERO ERRORS!")
        print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_full_suite())
