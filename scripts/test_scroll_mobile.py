import sys
import os
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

artifacts_dir = r"C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b"
html_path = r"c:\Books\Neta Light\index.html"
file_url = "file:///" + html_path.replace("\\", "/")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    # Viewport mô phỏng đúng điện thoại người dùng
    context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    page = context.new_page()

    page.goto(file_url)
    page.wait_for_load_state('networkidle')

    # Chuyển Tarot mode
    page.click('#deck-selector-trigger')
    page.wait_for_timeout(300)
    page.click('#tab-mode-tarot')
    page.wait_for_timeout(400)

    # Bốc bài 3 lá
    page.click('#btn-tarot-quick-draw')
    page.wait_for_timeout(500)

    # Đo thông số cuộn của #view-tarot
    metrics = page.evaluate("""() => {
        const el = document.getElementById('view-tarot');
        return {
            clientHeight: el.clientHeight,
            scrollHeight: el.scrollHeight,
            canScroll: el.scrollHeight > el.clientHeight,
            initialScrollTop: el.scrollTop
        };
    }""")
    print("Initial Scroll Metrics:", metrics)

    # Thử cuộn xuống 350px
    page.evaluate("""() => {
        const el = document.getElementById('view-tarot');
        el.scrollTop = 350;
    }""")
    page.wait_for_timeout(300)

    scrolled_top = page.evaluate("""() => document.getElementById('view-tarot').scrollTop""")
    print("Scrolled scrollTop:", scrolled_top)

    assert scrolled_top > 0, f"Expected scrollTop > 0, got {scrolled_top}"
    print("[SUCCESS] #view-tarot scrolls smoothly on mobile!")

    # Chụp ảnh sau khi cuộn
    page.screenshot(path=os.path.join(artifacts_dir, "tarot_mobile_scrolled.png"))

    browser.close()
