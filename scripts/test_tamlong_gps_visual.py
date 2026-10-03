import sys
import time
from playwright.sync_api import sync_playwright

if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 390, 'height': 844})
    page = context.new_page()
    page.goto('http://127.0.0.1:8088')
    page.wait_for_function('typeof window.switchAppMode === "function"')
    time.sleep(1)

    # Chuyển sang module dialy
    page.evaluate("window.switchAppMode('dialy')")
    time.sleep(1)

    # 1. Chụp màn hình mặc định Tab Tầm Long (Dark mode)
    page.screenshot(path='tamlong_gps_default_dark.png')
    print('1. Default Dark Mode screenshot taken', flush=True)

    # Kiểm tra input placeholder
    placeholder = page.locator('#dialy-gps-input').get_attribute('placeholder')
    print('Placeholder:', placeholder, flush=True)

    # 2. Test chuyển sang tab Trắc Diện Ngang
    page.locator('button[data-tab="transverse"]').click(force=True)
    time.sleep(0.5)
    page.screenshot(path='tamlong_transverse_dark.png')
    print('2. Transverse tab clicked & screenshot taken', flush=True)

    # 3. Test chuyển sang tab Radar
    page.locator('button[data-tab="radar"]').click(force=True)
    time.sleep(0.5)
    page.screenshot(path='tamlong_radar_dark.png')
    print('3. Radar tab clicked & screenshot taken', flush=True)

    # 4. Quay lại tab Trắc Diện Dọc
    page.locator('button[data-tab="longitudinal"]').click(force=True)
    time.sleep(0.5)

    # 5. Nhập link Google Maps & bấm Phân Tích DEM
    page.locator('#dialy-gps-input').fill('https://www.google.com/maps?q=12.569941,109.213615')
    time.sleep(0.5)
    page.locator('#dialy-btn-scan-dem').click(force=True)
    print('4. Clicked Scan DEM with Google Maps link, waiting 3s...', flush=True)
    time.sleep(3)

    page.screenshot(path='tamlong_gps_custom_scanned.png')
    print('5. Custom GPS Scanned screenshot taken', flush=True)

    # 6. Test nút Lấy từ La Kinh
    page.locator('#dialy-btn-get-lakinh').click(force=True)
    time.sleep(1)
    page.screenshot(path='tamlong_gps_reset_lakinh.png')
    print('6. Reset to La Kinh screenshot taken', flush=True)

    # 7. Test Light mode
    page.evaluate("document.body.classList.add('theme-light')")
    time.sleep(0.5)
    page.screenshot(path='tamlong_gps_light_mode.png')
    print('7. Light Mode screenshot taken', flush=True)

    # 8. Test Section 6: 4 Đồ hình Tính toán Thủy Tổ Long (300 DPI)
    page.evaluate("document.body.classList.remove('theme-light')") # Quay lại Dark mode để xem đồ họa chuẩn
    time.sleep(0.5)

    sec6 = page.locator('.dialy-panel4-tab-bar')
    if sec6.count() > 0:
        sec6.scroll_into_view_if_needed()
        time.sleep(1)
        page.screenshot(path='tamlong_panel4_dem.png')
        print('8. Section 6 Panel 1 (DEM) screenshot taken', flush=True)

        # Tab Slope
        page.locator('button[data-panel="slope"]').click(force=True)
        time.sleep(0.8)
        page.screenshot(path='tamlong_panel4_slope.png')
        print('9. Section 6 Panel 2 (Slope) screenshot taken', flush=True)

        # Tab Tàng Phong
        page.locator('button[data-panel="tangphong"]').click(force=True)
        time.sleep(0.8)
        page.screenshot(path='tamlong_panel4_tangphong.png')
        print('10. Section 6 Panel 3 (Tàng Phong) screenshot taken', flush=True)

        # Tab Heatmap
        page.locator('button[data-panel="heatmap"]').click(force=True)
        time.sleep(0.8)
        page.screenshot(path='tamlong_panel4_heatmap.png')
        print('11. Section 6 Panel 4 (Heatmap) screenshot taken', flush=True)

    # 9. Test chụp ảnh màn hình dài toàn trang (Full Page Screenshot)
    btn_snap = page.locator('#dialy-btn-snapshot')
    if btn_snap.count() > 0:
        btn_snap.click(force=True)
        time.sleep(1.5)
        print('12. Clicked Full Snapshot button successfully', flush=True)

    browser.close()
    print('ALL TESTS COMPLETED SUCCESSFULLY!', flush=True)
