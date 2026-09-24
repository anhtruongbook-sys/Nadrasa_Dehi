import asyncio
import os
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Mobile viewport 360 x 780
        context = await browser.new_context(viewport={"width": 360, "height": 780})
        page = await context.new_page()
        
        await page.goto("http://127.0.0.1:8080", wait_until="networkidle")
        await asyncio.sleep(1)
        
        # Switch to Tu Vi
        await page.click("#deck-selector-trigger")
        await asyncio.sleep(0.3)
        await page.click("#tab-mode-tuvi")
        await asyncio.sleep(1)
        
        # Set date to 13/12/1979 at 02:27 (as in user screenshot)
        await page.fill("#tuvi-input-day", "13")
        await page.fill("#tuvi-input-month", "12")
        await page.fill("#tuvi-input-year", "1979")
        await page.fill("#tuvi-input-hour", "2")
        await page.fill("#tuvi-input-minute", "27")
        await page.click("#btn-tuvi-submit")
        await asyncio.sleep(1)
        
        # 1. LIGHT MODE
        await page.evaluate("document.body.classList.add('theme-light')")
        await asyncio.sleep(0.5)
        
        # Check text in center box
        center_text = await page.inner_text(".tuvi-center-box")
        print("Center Box text:\n", center_text)
        
        # Check if 48 tuổi and Năm xem 2026 (Bính Ngọ) exist
        assert "2026 (Bính Ngọ)" in center_text, f"Center box must show 2026 (Bính Ngọ), got:\n{center_text}"
        assert "48 tuổi" in center_text, "Center box must show 48 tuổi for 1979 birth year"
        
        # Check sao lưu in cells
        luu_stars = await page.query_selector_all(".star-luu")
        print(f"Total Sao Luu rendered across palaces: {len(luu_stars)}")
        assert len(luu_stars) == 9, f"Palaces must render 9 Sao Luu, got: {len(luu_stars)}"
        
        # Capture screenshots
        ctrl = await page.query_selector(".unified-ctrl-card")
        if ctrl:
            await ctrl.screenshot(path="test_ctrl_card_view_year_light.png")
            print("Saved test_ctrl_card_view_year_light.png")
            
        center_box = await page.query_selector(".tuvi-center-box")
        if center_box:
            await center_box.screenshot(path="test_center_box_view_year_light.png")
            print("Saved test_center_box_view_year_light.png")
            
        grid = await page.query_selector(".tuvi-grid-wrapper")
        if grid:
            await grid.screenshot(path="test_tuvi_grid_view_year_light.png")
            print("Saved test_tuvi_grid_view_year_light.png")

        # 2. Test Step Year: click [ ▶ ] to change to 2027
        await page.click("#btn-view-year-next")
        await asyncio.sleep(0.8)
        new_center = await page.inner_text(".tuvi-center-box")
        print("Center Box after step to 2027:\n", new_center)
        assert "2027 (Đinh Mùi)" in new_center and "49 tuổi" in new_center, "Step year must update to 2027 (Đinh Mùi) and 49 tuổi!"
        
        # Step back to 2026
        await page.click("#btn-view-year-prev")
        await asyncio.sleep(0.8)
        
        # 3. DARK MODE
        await page.evaluate("document.body.classList.remove('theme-light')")
        await asyncio.sleep(0.5)
        
        grid_dark = await page.query_selector(".tuvi-grid-wrapper")
        if grid_dark:
            await grid_dark.screenshot(path="test_tuvi_grid_view_year_dark.png")
            print("Saved test_tuvi_grid_view_year_dark.png")

        print("\n🎉 ALL SAO LUU & VIEW YEAR TESTS PASSED WITH 100% ACCURACY!")
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
