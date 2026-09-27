import os
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 420, "height": 890})
        page = context.new_page()

        # Capture console errors
        errors = []
        page.on("console", lambda msg: errors.append(f"CONSOLE: {msg.text}") if msg.type == "error" else None)
        page.on("pageerror", lambda err: errors.append(f"PAGEERROR: {err}"))

        print("Navigating to http://localhost:8090/index.html ...")
        page.goto("http://localhost:8090/index.html")
        page.wait_for_timeout(1500)

        # 1. Switch to Trạch Cát mode
        print("Switching to Trạch Cát mode...")
        page.evaluate("window.switchAppMode('trachcat')")
        page.wait_for_timeout(1000)

        # Verify #view-trachcat is visible
        is_visible = page.is_visible("#view-trachcat")
        print(f"#view-trachcat visible: {is_visible}")
        assert is_visible, "#view-trachcat should be visible"

        # Check day cards count
        cards_count = page.locator(".tc-day-card").count()
        print(f"Initial day cards count: {cards_count}")
        assert cards_count > 0, "Should have rendered at least 1 day card"

        # Screenshot Trạch Cát initial view
        out_dir = r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612"
        page.screenshot(path=os.path.join(out_dir, "test_trachcat_initial.png"))
        print("Saved test_trachcat_initial.png")

        # 2. Test Category chip click (Hôn nhân)
        print("Clicking 'Hôn nhân' category chip...")
        page.click(".tc-cat-chip[data-cat='Hôn nhân']")
        page.wait_for_timeout(800)

        hn_cards = page.locator(".tc-day-card").count()
        print(f"Hôn nhân day cards count: {hn_cards}")
        page.screenshot(path=os.path.join(out_dir, "test_trachcat_honnhan.png"))
        print("Saved test_trachcat_honnhan.png")

        # 3. Test Deep link from La Kinh
        print("Testing deep link from La Kinh with sitting deg 0 (Tọa Tý)...")
        page.evaluate("window.openTrachCatForSitting(0)")
        page.wait_for_timeout(1000)

        is_tc_visible = page.is_visible("#view-trachcat")
        deg_val = page.input_value("#tc-input-deg")
        print(f"Trachcat visible after LaKinh call: {is_tc_visible}, Sitting deg in input: {deg_val}")
        page.screenshot(path=os.path.join(out_dir, "test_trachcat_lakinh_synced.png"))
        print("Saved test_trachcat_lakinh_synced.png")

        # 4. Test clicking 'Lập Kỳ Môn' button on top card
        print("Clicking 'Lập Kỳ Môn' button on top day card...")
        btn_qmdj = page.locator(".tc-btn-qmdj").first
        btn_qmdj.click()
        page.wait_for_timeout(1200)

        is_qmdj_visible = page.is_visible("#view-qmdj")
        print(f"#view-qmdj visible after clicking action button: {is_qmdj_visible}")
        assert is_qmdj_visible, "#view-qmdj should be visible after deep link"

        page.screenshot(path=os.path.join(out_dir, "test_trachcat_qmdj_linked.png"))
        print("Saved test_trachcat_qmdj_linked.png")

        # 5. Test Calendar Day Bloc deep link
        print("Switching to Calendar mode...")
        page.evaluate("window.switchAppMode('calendar')")
        page.wait_for_timeout(800)

        # Switch to Day bloc
        page.click("#btn-cal-tab-day")
        page.wait_for_timeout(600)

        # Click Trạch Cát button in Day bloc
        print("Clicking Trạch Cát button in Calendar day bloc...")
        page.click(".btn-launch-trachcat")
        page.wait_for_timeout(1000)

        is_back_tc = page.is_visible("#view-trachcat")
        print(f"#view-trachcat visible after Calendar link: {is_back_tc}")
        assert is_back_tc, "Should return to Trạch Cát from Calendar"

        page.screenshot(path=os.path.join(out_dir, "test_calendar_to_trachcat.png"))
        print("Saved test_calendar_to_trachcat.png")

        print(f"Total console errors encountered: {len(errors)}")
        for err in errors:
            print(f"  {err}")

        browser.close()
        print("All Playwright verification tests PASSED!")

if __name__ == "__main__":
    run_test()
