from playwright.sync_api import sync_playwright
import os

def test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 390, "height": 844}, accept_downloads=True)
        page.goto('http://127.0.0.1:8080')
        page.wait_for_timeout(400)

        # 1. Switch to Tu Vi
        page.evaluate("() => { if (window.switchAppMode) window.switchAppMode('tuvi'); }")
        page.wait_for_timeout(500)

        # Trigger download and verify
        with page.expect_download() as download_info:
            page.evaluate("() => window.captureArenaScreenshot()")

        download = download_info.value
        filename = download.suggested_filename
        print("[SUCCESS] Tu Vi direct download triggered! Filename:", filename)

        os.makedirs('scripts/test_results', exist_ok=True)
        save_path = os.path.join('scripts/test_results', filename)
        download.save_as(save_path)
        print("[SUCCESS] Image saved to disk:", save_path)
        assert os.path.exists(save_path) and os.path.getsize(save_path) > 10000

        # Verify no popup/modal exists on page
        modal_exists = page.locator('#screenshot-modal').count()
        print("Screenshot modal exists count:", modal_exists)
        assert modal_exists == 0, "No screenshot modal should exist!"

        # 2. Switch to Calendar
        page.evaluate("() => { if (window.switchAppMode) window.switchAppMode('calendar'); }")
        page.wait_for_timeout(500)

        with page.expect_download() as cal_dl_info:
            page.evaluate("() => window.captureArenaScreenshot()")

        cal_dl = cal_dl_info.value
        print("[SUCCESS] Calendar direct download triggered! Filename:", cal_dl.suggested_filename)
        cal_path = os.path.join('scripts/test_results', cal_dl.suggested_filename)
        cal_dl.save_as(cal_path)
        assert os.path.exists(cal_path) and os.path.getsize(cal_path) > 10000

        print("=" * 60)
        print("DIRECT DOWNLOAD (NO POPUP) TEST PASSED 100%!")
        print("=" * 60)
        browser.close()

if __name__ == '__main__':
    test()
