import os
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile viewport standard 412x915
        context = browser.new_context(viewport={"width": 412, "height": 915})
        page = context.new_page()

        out_dir = r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612"

        print("1. Loading http://localhost:8090/index.html ...")
        page.goto("http://localhost:8090/index.html")
        page.wait_for_timeout(1500)

        # ------------------------------------------------------------------
        # TEST 1: LA KINH SINGLE RAY (NO DUPLICATE RAY)
        # ------------------------------------------------------------------
        print("2. Switching to La Kinh mode...")
        page.evaluate("window.switchAppMode('lakinh')")
        page.wait_for_timeout(1000)

        # Turn on ray
        print("Turning on sighting ray...")
        page.click("#lakinh-btn-ray-quick")
        page.wait_for_timeout(1000)

        # Check Leaflet polylines count in surveyRayLayerGroup
        leaflet_ray_count = page.evaluate("window.surveyRayLayerGroup ? window.surveyRayLayerGroup.getLayers().length : 0")
        print(f"Leaflet surveyRayLayerGroup layers count: {leaflet_ray_count}")
        assert leaflet_ray_count == 0, f"Expected 0 Leaflet duplicate rays, got {leaflet_ray_count}"

        # Screenshot La Kinh with only 1 single ray
        page.screenshot(path=os.path.join(out_dir, "test_lakinh_single_ray_verified.png"))
        print("Saved test_lakinh_single_ray_verified.png")

        # ------------------------------------------------------------------
        # TEST 2: TRẠCH CÁT OVERFLOW & YEAR 1979 & SCROLLABILITY
        # ------------------------------------------------------------------
        print("3. Switching to Trạch Cát mode...")
        page.evaluate("window.switchAppMode('trachcat')")
        page.wait_for_timeout(1000)

        # Verify no hardcoded button Canh Ngọ (1990)
        has_canhngo_btn = page.locator("#tc-btn-quick-year").count()
        print(f"Has #tc-btn-quick-year: {has_canhngo_btn > 0}")
        assert has_canhngo_btn == 0, "Hardcoded Canh Ngo button should be removed"

        # Change year to 1979
        print("Typing year 1979 in #tc-input-year...")
        page.fill("#tc-input-year", "1979")
        page.dispatch_event("#tc-input-year", "change")
        page.wait_for_timeout(600)

        # Check text in person badges
        person_badges_text = page.locator(".tc-person-badges").text_content()
        print(f"Person badges text for 1979: {person_badges_text.strip()}")
        assert "Kỷ Mùi" in person_badges_text, f"Expected Kỷ Mùi in badges text, got: {person_badges_text}"
        assert "48 tuổi mụ" in person_badges_text, f"Expected 48 tuổi mụ in badges text, got: {person_badges_text}"

        # Test scrollability of #view-trachcat
        print("Testing scrollability of #view-trachcat...")
        initial_scroll = page.evaluate("document.getElementById('view-trachcat').scrollTop")
        page.evaluate("document.getElementById('view-trachcat').scrollTop = 450")
        page.wait_for_timeout(400)
        new_scroll = page.evaluate("document.getElementById('view-trachcat').scrollTop")
        print(f"Scroll top before: {initial_scroll}, after: {new_scroll}")
        assert new_scroll > 0, "Container #view-trachcat should be scrollable!"

        # Screenshot scrolled dark mode
        page.screenshot(path=os.path.join(out_dir, "test_trachcat_dark_scrolled.png"))
        print("Saved test_trachcat_dark_scrolled.png")

        # ------------------------------------------------------------------
        # TEST 3: LIGHT THEME COMPATIBILITY
        # ------------------------------------------------------------------
        print("4. Switching to LIGHT THEME...")
        page.evaluate("document.getElementById('btn-theme').click()")
        page.wait_for_timeout(800)

        is_light = page.evaluate("document.body.classList.contains('theme-light')")
        print(f"Body has theme-light class: {is_light}")
        assert is_light, "Body should have theme-light class"

        # Scroll to top to capture full light form
        page.evaluate("document.getElementById('view-trachcat').scrollTop = 0")
        page.wait_for_timeout(400)

        page.screenshot(path=os.path.join(out_dir, "test_trachcat_light_theme_top.png"))
        print("Saved test_trachcat_light_theme_top.png")

        # Scroll down to capture day cards in light theme
        page.evaluate("document.getElementById('view-trachcat').scrollTop = 400")
        page.wait_for_timeout(400)

        page.screenshot(path=os.path.join(out_dir, "test_trachcat_light_theme_cards.png"))
        print("Saved test_trachcat_light_theme_cards.png")

        # ------------------------------------------------------------------
        # TEST 4: BUTTON TRA CỨU & MONTH SELECTION
        # ------------------------------------------------------------------
        print("5. Clicking Month 10 pill...")
        page.click(".tc-month-pill[data-month='10']")
        page.wait_for_timeout(600)

        month_cards = page.locator(".tc-day-card").count()
        print(f"Month 10 day cards count: {month_cards}")
        assert month_cards > 0, "Month 10 should have results"

        print("Clicking 'TRA CỨU NGÀY ĐẠI CÁT' button...")
        page.click("#tc-btn-run")
        page.wait_for_timeout(800)

        browser.close()
        print("ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    run_verification()
