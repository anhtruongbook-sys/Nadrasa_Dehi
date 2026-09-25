import sys
import os
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(accept_downloads=True)
    page = context.new_page()
    page.on('console', lambda msg: sys.stdout.buffer.write(f"PAGE LOG: {msg.text}\n".encode('utf-8', errors='replace')))

    page.goto('http://127.0.0.1:8080')
    page.wait_for_timeout(2000)

    # 1. Test Tarot
    sys.stdout.buffer.write(b"=== TEST 1: TAROT SCREENSHOT VIA HEADER BUTTON ===\n")
    page.evaluate("window.switchDeckMode('tarot')")
    page.wait_for_timeout(1000)

    # Quick draw & flip all
    page.click('#btn-tarot-quick-draw')
    page.wait_for_timeout(1000)
    page.click('#btn-tarot-flip-all')
    page.wait_for_timeout(1000)

    # Click header screenshot button
    sys.stdout.buffer.write(b"Clicking #btn-screenshot-header in Tarot...\n")
    with page.expect_download(timeout=10000) as download_info:
        page.click('#btn-screenshot-header')
    
    download = download_info.value
    tarot_file = os.path.join(os.getcwd(), download.suggested_filename)
    download.save_as(tarot_file)
    sys.stdout.buffer.write(f"Tarot screenshot downloaded successfully: {tarot_file} (Size: {os.path.getsize(tarot_file)} bytes)\n".encode('utf-8'))

    # 2. Test La Kinh
    sys.stdout.buffer.write(b"=== TEST 2: LA KINH SCREENSHOT VIA HEADER BUTTON ===\n")
    page.evaluate("window.switchDeckMode('lakinh')")
    page.wait_for_timeout(2000)

    sys.stdout.buffer.write(b"Clicking #btn-screenshot-header in La Kinh...\n")
    with page.expect_download(timeout=15000) as download_info_lk:
        page.click('#btn-screenshot-header')

    download_lk = download_info_lk.value
    lakinh_file = os.path.join(os.getcwd(), download_lk.suggested_filename)
    download_lk.save_as(lakinh_file)
    sys.stdout.buffer.write(f"La Kinh screenshot downloaded successfully: {lakinh_file} (Size: {os.path.getsize(lakinh_file)} bytes)\n".encode('utf-8'))

    # Verify no error toasts
    toasts = page.query_selector_all('.toast')
    for t in toasts:
        txt = t.inner_text()
        sys.stdout.buffer.write(f"TOAST: {txt}\n".encode('utf-8', errors='replace'))
        if 'Không thể lưu' in txt or 'Tainted' in txt:
            raise Exception(f"Failed with error toast: {txt}")

    browser.close()
    sys.stdout.buffer.write(b"ALL TESTS PASSED! ZERO TAINTED CANVAS ERRORS!\n")
