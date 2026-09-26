import os
import sys
import time
from playwright.sync_api import sync_playwright

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def run():
    artifacts_dir = r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612"
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 430, "height": 932}) # iPhone 14 Pro Max size
        page = context.new_page()

        print("Navigating to http://127.0.0.1:8090/...")
        page.goto("http://127.0.0.1:8090/", wait_until="networkidle")

        # Open deck dropdown and select QMDJ mode
        print("Selecting Kỳ Môn Độn Giáp...")
        page.click("#deck-selector-trigger")
        page.wait_for_timeout(300)
        page.click("#tab-mode-qmdj")
        page.wait_for_timeout(800)

        # Switch to Phong Thủy tab
        print("Clicking Phong Thủy tab...")
        page.wait_for_selector("button[data-mode='phongthuy']", timeout=5000)
        page.click("button[data-mode='phongthuy']")
        page.wait_for_timeout(500)

        # Case 1: Vận 7, TB1 (Tuất), Cửa Thìn
        print("Setting Vận 7, Hướng TB1, Cửa Thìn...")
        page.select_option("#pt-select-van", "7")
        page.select_option("#pt-select-huong", "TB1")
        page.select_option("#pt-select-cua", "Thìn")
        page.click("#btn-pt-submit")
        page.wait_for_timeout(500)

        # Debug matching rules for pt-summary-strip
        rules_debug = page.evaluate("""() => {
            const el = document.querySelector('.pt-summary-strip');
            const res = [];
            for (const sheet of Array.from(document.styleSheets)) {
                try {
                    for (const rule of Array.from(sheet.cssRules)) {
                        if (rule.selectorText && el.matches(rule.selectorText)) {
                            res.push({ selector: rule.selectorText, cssText: rule.cssText });
                        }
                    }
                } catch(e) {}
            }
            return res;
        }""")
        print("Matching Rules for pt-summary-strip:")
        for r in rules_debug:
            print("  -", r['selector'], "->", r['cssText'])

        # Extract values for NW (Càn 6) and SE (Tốn 4)
        cells_info = page.evaluate("""() => {
            const cells = Array.from(document.querySelectorAll('.qmdj-palace-cell'));
            return cells.map(c => {
                const idx = c.getAttribute('data-palace-index');
                const mStar = c.querySelector('.pt-star-mountain')?.textContent?.trim();
                const fStar = c.querySelector('.pt-star-facing')?.textContent?.trim();
                const vStar = c.querySelector('.pt-star-van')?.textContent?.trim();
                const badges = Array.from(c.querySelectorAll('.pt-badge')).map(b => b.textContent.trim());
                const door = c.querySelector('.p-door')?.textContent?.trim();
                const divinity = c.querySelector('.p-divinity')?.textContent?.trim();
                return { idx, mStar, fStar, vStar, badges, door, divinity };
            });
        }""")

        tb1_path = os.path.join(artifacts_dir, "test_qmdj_tb1_van7.png")
        page.screenshot(path=tb1_path, full_page=True)
        print("Saved TB1 screenshot:", tb1_path)
        print("TB1 Cells:", cells_info)

        # Case 2: Vận 7, TB2_3 (Càn - Hợi), Cửa Thìn
        print("Setting Vận 7, Hướng TB2_3, Cửa Thìn...")
        page.select_option("#pt-select-van", "7")
        page.select_option("#pt-select-huong", "TB2_3")
        page.select_option("#pt-select-cua", "Thìn")
        page.click("#btn-pt-submit")
        page.wait_for_timeout(500)

        cells_info_tb2 = page.evaluate("""() => {
            const cells = Array.from(document.querySelectorAll('.qmdj-palace-cell'));
            return cells.map(c => {
                const idx = c.getAttribute('data-palace-index');
                const mStar = c.querySelector('.pt-star-mountain')?.textContent?.trim();
                const fStar = c.querySelector('.pt-star-facing')?.textContent?.trim();
                const vStar = c.querySelector('.pt-star-van')?.textContent?.trim();
                const badges = Array.from(c.querySelectorAll('.pt-badge')).map(b => b.textContent.trim());
                const door = c.querySelector('.p-door')?.textContent?.trim();
                const divinity = c.querySelector('.p-divinity')?.textContent?.trim();
                return { idx, mStar, fStar, vStar, badges, door, divinity };
            });
        }""")

        tb2_path = os.path.join(artifacts_dir, "test_qmdj_tb2_van7.png")
        page.screenshot(path=tb2_path, full_page=True)
        print("Saved TB2 screenshot:", tb2_path)
        print("TB2 Cells:", cells_info_tb2)

        # Test clicking Càn 6 cell to open modal
        print("Testing modal click on Càn 6 (index 5)...")
        can_cell = page.locator(".qmdj-palace-cell[data-palace-index='5']")
        can_cell.click()
        page.wait_for_timeout(400)
        modal_path = os.path.join(artifacts_dir, "test_qmdj_pt_modal.png")
        page.screenshot(path=modal_path, full_page=True)
        print("Saved Modal screenshot:", modal_path)

        browser.close()

if __name__ == '__main__':
    run()
