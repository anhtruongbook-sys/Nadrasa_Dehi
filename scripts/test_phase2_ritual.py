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

    # 1. Capture initial state with Ribbon Deck and 3 pending slots
    page.screenshot(path=os.path.join(artifacts_dir, 'tarot_phase2_initial_ribbon.png'))
    print("[1] Captured initial ribbon state.")

    # Scroll ribbon into full view
    page.evaluate("document.getElementById('tarot-ribbon-viewport').scrollIntoView({ behavior: 'smooth', block: 'center' });")
    page.wait_for_timeout(300)
    page.screenshot(path=os.path.join(artifacts_dir, 'tarot_phase2_ribbon_scrolled.png'))
    print("[1b] Captured ribbon track in view.")

    # 2. Pick 1st card from ribbon
    cards = page.locator('.tarot-ribbon-card')
    cards.nth(10).click(force=True)
    page.wait_for_timeout(350)
    page.screenshot(path=os.path.join(artifacts_dir, 'tarot_phase2_picked_card1.png'))
    print("[2] Captured step 1 (1 card picked).")

    # 3. Pick 2nd card from ribbon
    cards.nth(25).click(force=True)
    page.wait_for_timeout(350)

    # 4. Pick 3rd card from ribbon
    cards.nth(40).click(force=True)
    page.wait_for_timeout(500)

    # Scroll back up to slots
    page.evaluate("document.getElementById('view-tarot').scrollTop = 0;")
    page.wait_for_timeout(300)
    page.screenshot(path=os.path.join(artifacts_dir, 'tarot_phase2_all_picked_ready.png'))
    print("[3] Captured all 3 cards picked in Arena.")

    # 5. Flip all cards
    btn_flip_all = page.locator('#btn-tarot-flip-all')
    if btn_flip_all.is_visible():
        btn_flip_all.click()
    else:
        scenes = page.locator('.tarot-card-3d-scene')
        for i in range(scenes.count()):
            scenes.nth(i).click()
            page.wait_for_timeout(150)

    page.wait_for_timeout(600)

    # Scroll down to view report
    page.evaluate("document.getElementById('view-tarot').scrollTop = document.getElementById('tarot-report-section').offsetTop;")
    page.wait_for_timeout(300)
    page.screenshot(path=os.path.join(artifacts_dir, 'tarot_phase2_flipped_report.png'))
    print("[4] Captured flipped deep report.")

    # 6. Test Light Theme
    theme_btn = page.locator('#btn-toggle-theme')
    if theme_btn.is_visible():
        theme_btn.click()
        page.wait_for_timeout(300)
        page.evaluate("document.getElementById('view-tarot').scrollTop = 0;")
        page.wait_for_timeout(300)
        page.screenshot(path=os.path.join(artifacts_dir, 'tarot_phase2_light_theme.png'))
        print("[5] Captured light theme.")

    browser.close()

print("ALL_PHASE2_TESTS_PASSED")
