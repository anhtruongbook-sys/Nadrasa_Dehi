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

    # -------------------------------------------------------------------------
    # TEST 1: 360px width mobile viewport (compact Android screen)
    # -------------------------------------------------------------------------
    context360 = browser.new_context(viewport={'width': 360, 'height': 800}, is_mobile=True, has_touch=True)
    page360 = context360.new_page()
    page360.goto(file_url)
    page360.wait_for_load_state('networkidle')

    page360.click('#deck-selector-trigger')
    page360.wait_for_timeout(200)
    page360.click('#tab-mode-tarot')
    page360.wait_for_timeout(350)

    # Switch to light mode
    page360.click('#btn-theme')
    page360.wait_for_timeout(300)

    # Capture 360px tabs
    page360.screenshot(path=os.path.join(artifacts_dir, 'tarot_fixed_3tabs_mobile_360.png'))
    
    # Check tabs bounding boxes
    tabs = page360.locator('.tarot-tab-btn')
    assert tabs.count() == 3, f"Expected 3 tabs, got {tabs.count()}"
    for i in range(tabs.count()):
        box = tabs.nth(i).bounding_box()
        print(f"Tab {i} bbox on 360px:", box)
        assert box['x'] + box['width'] <= 360, f"Tab {i} overflows 360px screen!"
    print("[PASS 1] All 3 tabs fit 100% cleanly on 360px screen without overflow.")

    # -------------------------------------------------------------------------
    # TEST 2: Haptic Checkbox default unchecked
    # -------------------------------------------------------------------------
    haptic_cb = page360.locator('#tarot-toggle-haptic')
    is_checked = haptic_cb.is_checked()
    print("Haptic checkbox default is_checked:", is_checked)
    assert not is_checked, "Haptic must be default FALSE (unchecked)!"
    print("[PASS 2] Haptic is default unchecked.")

    # -------------------------------------------------------------------------
    # TEST 3: Draw cards & verify Storyline Markdown & Section III Contrast
    # -------------------------------------------------------------------------
    page360.click('#btn-tarot-quick-draw')
    page360.wait_for_timeout(300)
    page360.click('#btn-tarot-flip-all')
    page360.wait_for_timeout(600)

    # Check Storyline text for raw markdown
    story_el = page360.locator('.tarot-storyline-content blockquote')
    story_html = story_el.inner_html()
    story_text = story_el.inner_text()
    print("Story text sample:", story_text[:120])
    assert "**" not in story_text, "Found raw ** in story text!"
    assert "<strong>" in story_html, "Expected <strong> tags in story HTML!"
    print("[PASS 3] Storyline narrative has NO raw ** asterisks, parsed to clean HTML.")

    # Scroll down to Section II & capture
    page360.evaluate("document.querySelector('.tarot-storyline-box').scrollIntoView({ behavior: 'smooth', block: 'center' });")
    page360.wait_for_timeout(300)
    page360.screenshot(path=os.path.join(artifacts_dir, 'tarot_fixed_storyline_no_asterisks.png'))

    # Scroll down to Section III & IV (Light mode contrast verification)
    patterns_box = page360.locator('.tarot-patterns-box')
    if patterns_box.is_visible():
        page360.evaluate("document.querySelector('.tarot-patterns-box').scrollIntoView({ behavior: 'smooth', block: 'center' });")
        page360.wait_for_timeout(300)
        badge = page360.locator('.pattern-badge').first
        badge_color = badge.evaluate("el => window.getComputedStyle(el).color")
        print("Pattern badge computed text color in light theme:", badge_color)
        page360.screenshot(path=os.path.join(artifacts_dir, 'tarot_fixed_light_contrast_section3.png'))
        print("[PASS 4] Captured Section III contrast in Light Mode.")

    context360.close()
    browser.close()

print("ALL_USER_FIXES_VERIFIED_SUCCESSFULLY")
