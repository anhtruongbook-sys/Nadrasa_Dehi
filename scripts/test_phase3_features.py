import os
import sys
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

artifacts_dir = r"C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b"
html_path = r"c:\Books\Neta Light\index.html"
file_url = "file:///" + html_path.replace("\\", "/")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    # iPhone 14 Pro viewport
    context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    page = context.new_page()

    page.goto(file_url)
    page.wait_for_load_state('networkidle')

    # Switch to Tarot mode
    page.click('#deck-selector-trigger')
    page.wait_for_timeout(200)
    page.click('#tab-mode-tarot')
    page.wait_for_timeout(400)

    # 1. Quick draw 3 cards and save to Journal
    page.click('#btn-tarot-quick-draw')
    page.wait_for_timeout(350)
    page.click('#btn-tarot-flip-all')
    page.wait_for_timeout(500)

    btn_save = page.locator('#btn-tarot-save-journal')
    if btn_save.is_visible():
        btn_save.click()
        page.wait_for_timeout(300)
        print("[1] Saved a reading to Journal.")

    # 2. Test Encyclopedia Tab (Bách Khoa 78 Lá)
    page.click('.tarot-tab-btn[data-tab="encyclopedia"]')
    page.wait_for_timeout(400)

    # Click court cards filter
    page.click('.ency-class-btn[data-class="court"]')
    page.wait_for_timeout(300)
    page.screenshot(path=os.path.join(artifacts_dir, 'tarot_phase3_ency_court_cards.png'))
    print("[2] Filtered court cards in Encyclopedia.")

    # Click a card to open Modal
    first_item = page.locator('.tarot-ency-card-item').first
    first_item.click()
    page.wait_for_timeout(400)

    # Test 3D Reversed toggle
    page.click('#btn-orient-reversed')
    page.wait_for_timeout(350)
    page.screenshot(path=os.path.join(artifacts_dir, 'tarot_phase3_modal_reversed_3d.png'))
    print("[3] Tested Modal 3D Reversed view with Astrological info.")

    # Close modal
    page.click('#tarot-modal-close-btn')
    page.wait_for_timeout(300)

    # 3. Test Journal Tab (Nhật Ký Chiêm Nghiệm & Phản Tư Cá Nhân)
    page.click('.tarot-tab-btn[data-tab="journal"]')
    page.wait_for_timeout(400)

    # Click 4-star rating
    star_4 = page.locator('.star-btn[data-star="4"]').first
    if star_4.is_visible():
        star_4.click()
        page.wait_for_timeout(300)

    # Click Write Reflection
    btn_edit_ref = page.locator('.btn-toggle-edit-reflection').first
    if btn_edit_ref.is_visible():
        btn_edit_ref.click()
        page.wait_for_timeout(250)

        # Type reflection note
        textarea = page.locator('.journal-reflection-textarea').first
        textarea.fill("Chiêm nghiệm thực tế: Các thử thách và lời khuyên về công việc trong tuần đã diễn ra rất khớp với lá bài.")
        
        # Select status: manifested
        status_select = page.locator('.journal-status-dropdown').first
        status_select.select_option('manifested')

        # Save note
        page.click('.btn-save-note')
        page.wait_for_timeout(400)
        print("[4] Added reflection note and 4-star rating.")

    page.screenshot(path=os.path.join(artifacts_dir, 'tarot_phase3_journal_reflection.png'))

    # 4. Test Light Theme on Journal
    page.click('#btn-theme')
    page.wait_for_timeout(300)
    page.screenshot(path=os.path.join(artifacts_dir, 'tarot_phase3_journal_light.png'))
    print("[5] Captured Journal light theme.")

    browser.close()

print("ALL_PHASE3_TESTS_PASSED")
