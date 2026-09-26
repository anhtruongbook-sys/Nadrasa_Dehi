from playwright.sync_api import sync_playwright
import time
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def test_period_switching():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 900})
        page.goto("http://127.0.0.1:8090/index.html")
        page.wait_for_timeout(2000)

        page.evaluate("() => switchDeckMode('lakinh')")
        page.wait_for_timeout(1000)

        # Open HK modal directly
        page.evaluate("() => window.NetaLaKinhView.openHuyenKhongModal(9, 0.0)")
        page.wait_for_timeout(1000)

        # 1. Switch to Period 8
        page.select_option("#hk-period-select", "8")
        page.wait_for_timeout(800)
        title_p8 = page.inner_text(".lakinh-modal-title")
        print("Switched to:", title_p8)
        assert "VẬN 8" in title_p8

        # Select Box 10: Tọa Ngọ Hướng Tý (0 deg) in Period 8
        page.select_option("#hk-chart-select", "0")
        page.wait_for_timeout(800)
        details = page.inner_text(".lakinh-hk-details")
        badge = page.inner_text(".lakinh-hk-badge")
        print("Period 8 - Hướng Tý details:\n", details)
        print("Pattern badge:", badge)
        assert "Song Tinh Đáo Tọa" in badge or "Song Tinh" in badge

        # Select Box 8: Tọa Càn Hướng Tốn (135 deg) in Period 8 -> Vượng Sơn Vượng Hướng
        page.select_option("#hk-chart-select", "135")
        page.wait_for_timeout(800)
        badge_p8_ton = page.inner_text(".lakinh-hk-badge")
        print("Period 8 - Hướng Tốn 2/3 (Tọa Càn Hướng Tốn) badge:", badge_p8_ton)
        assert "Vượng Sơn Vượng Hướng" in badge_p8_ton

        # Take screenshot of Period 8
        page.screenshot(path="C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_period_8_vuong_son_vuong_huong.png")

        # 2. Switch to Period 7
        page.select_option("#hk-period-select", "7")
        page.wait_for_timeout(800)
        title_p7 = page.inner_text(".lakinh-modal-title")
        print("Switched to:", title_p7)
        assert "VẬN 7" in title_p7

        # In Period 7: Tọa Mão Hướng Dậu (270 deg) -> Vượng Sơn Vượng Hướng
        page.select_option("#hk-chart-select", "270")
        page.wait_for_timeout(800)
        badge_p7 = page.inner_text(".lakinh-hk-badge")
        print("Period 7 - Hướng Tây 2/3 badge:", badge_p7)
        assert "Vượng Sơn Vượng Hướng" in badge_p7

        browser.close()
        print("ALL PERIOD SWITCHING UI TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_period_switching()
