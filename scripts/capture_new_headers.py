import os
import sys
from playwright.sync_api import sync_playwright

def capture():
    out_dir = os.path.join(os.path.dirname(__file__), 'test_results')
    os.makedirs(out_dir, exist_ok=True)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 412, "height": 915})
        page.goto("http://127.0.0.1:8080")
        page.wait_for_timeout(600)

        def switch_mode(mode):
            page.click("#deck-selector-trigger")
            page.wait_for_timeout(200)
            page.click(f"#tab-mode-{mode}")
            page.wait_for_timeout(400)

        # 1. Dark Theme
        for mode in ['calendar', 'qmdj', 'bazi', 'tuvi']:
            switch_mode(mode)
            page.screenshot(path=os.path.join(out_dir, f"header_{mode}_dark.png"), clip={"x": 0, "y": 50, "width": 412, "height": 210})

        # Toggle to Light Theme
        page.click("#btn-theme")
        page.wait_for_timeout(400)

        # 2. Light Theme
        for mode in ['tuvi', 'bazi', 'qmdj', 'calendar']:
            switch_mode(mode)
            page.screenshot(path=os.path.join(out_dir, f"header_{mode}_light.png"), clip={"x": 0, "y": 50, "width": 412, "height": 210})

        browser.close()
        print("ALL_8_HEADER_SCREENSHOTS_CAPTURED")

if __name__ == '__main__':
    capture()
