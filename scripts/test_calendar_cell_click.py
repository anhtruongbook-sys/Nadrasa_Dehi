import os
import sys
from playwright.sync_api import sync_playwright

def test():
    out_dir = os.path.join(os.path.dirname(__file__), 'test_results')
    os.makedirs(out_dir, exist_ok=True)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 412, "height": 915})
        page.goto("http://127.0.0.1:8080")
        page.wait_for_timeout(600)

        # Switch to Calendar
        page.click("#deck-selector-trigger")
        page.wait_for_timeout(200)
        page.click("#tab-mode-calendar")
        page.wait_for_timeout(500)

        # Verify month view is open
        assert page.is_visible(".cal-month-wrapper"), "Month wrapper should be visible"

        # Click on Day 24 cell
        cell_24 = page.locator('.cal-cell[data-day="24"]')
        assert cell_24.count() > 0, "Cell 24 should exist"
        print("Clicking on Day 24 cell...")
        cell_24.click()
        page.wait_for_timeout(500)

        # Verify Day Bloc is now visible!
        assert page.is_visible(".cal-bloc-card"), "Day Bloc card should be visible after clicking cell 24!"
        big_num = page.locator(".bloc-big-num").inner_text().strip()
        print(f"Current Day Bloc number displayed: {big_num}")
        assert big_num == "24", f"Expected day 24, got {big_num}"

        # Capture screenshot of Day Bloc
        page.screenshot(path=os.path.join(out_dir, "test_click_day_24_result.png"))
        print("Screenshot saved to test_click_day_24_result.png")

        # Now test clicking the '‹ Lịch Tháng' back button
        page.click("#btn-back-month")
        page.wait_for_timeout(400)
        assert page.is_visible(".cal-month-wrapper"), "Should be back to Month view!"
        print("Successfully navigated back to Month view via #btn-back-month!")

        # Also test in Light Theme
        page.click("#btn-theme")
        page.wait_for_timeout(400)
        cell_15 = page.locator('.cal-cell[data-day="15"]')
        cell_15.click()
        page.wait_for_timeout(400)
        assert page.is_visible(".cal-bloc-card"), "Day Bloc card should be visible in Light theme!"
        big_num_15 = page.locator(".bloc-big-num").inner_text().strip()
        assert big_num_15 == "15", f"Expected day 15, got {big_num_15}"
        page.screenshot(path=os.path.join(out_dir, "test_click_day_15_light_result.png"))
        print("Screenshot saved to test_click_day_15_light_result.png")

        browser.close()
        print("ALL_TESTS_PASSED_SUCCESSFULLY")

if __name__ == '__main__':
    test()
