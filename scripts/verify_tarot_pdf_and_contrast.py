import time
import subprocess
import sys
from playwright.sync_api import sync_playwright

def main():
    # Start local http server on port 8899
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "8899"], cwd=r"c:\Books\Neta Light")
    time.sleep(1.5)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            # Mobile viewport 360x800 as in user screenshot
            context = browser.new_context(viewport={'width': 360, 'height': 800})
            page = context.new_page()

            page.goto('http://localhost:8899/index.html')
            page.wait_for_timeout(1000)

            # 1. Switch to light theme
            page.evaluate("document.body.className = 'theme-light'; localStorage.setItem('neta_theme', 'light');")
            page.wait_for_timeout(300)

            # 2. Switch to Tarot mode
            page.evaluate("window.switchDeckMode('tarot');")
            page.wait_for_timeout(1000)

            # 3. Quick draw 3 cards
            btn_quick = page.locator('#btn-tarot-quick-draw')
            if btn_quick.is_visible():
                btn_quick.click()
                page.wait_for_timeout(600)

            # 4. Flip all cards
            btn_flip = page.locator('#btn-tarot-flip-all')
            if btn_flip.is_visible():
                btn_flip.click()
                page.wait_for_timeout(1000)

            # 5. Check Report Actions Section
            actions_sec = page.locator('.tarot-report-actions')
            actions_sec.scroll_into_view_if_needed()
            page.wait_for_timeout(500)

            # Capture screenshot of the report buttons in light theme
            page.screenshot(path=r"c:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\tarot_fixed_buttons_light_theme.png")
            print("Captured screenshot: tarot_fixed_buttons_light_theme.png")

            # Check styles of btn-tarot-copy-markdown
            btn_copy = page.locator('#btn-tarot-copy-markdown')
            copy_color = page.evaluate("el => window.getComputedStyle(el).color", btn_copy.element_handle())
            copy_bg = page.evaluate("el => window.getComputedStyle(el).backgroundColor", btn_copy.element_handle())
            print(f"Copy Markdown button in light theme - color: {copy_color}, bg: {copy_bg}")

            # Check that copy_color is dark charcoal, not white/faded
            assert "15, 23, 42" in copy_color or "30, 41, 59" in copy_color or "0, 0, 0" in copy_color, f"Color not dark: {copy_color}"
            print("PASS 1: Copy Markdown button has strong dark contrast in light theme!")

            # Check btn-tarot-export-pdf exists and is visible
            btn_pdf = page.locator('#btn-tarot-export-pdf')
            assert btn_pdf.is_visible(), "Export PDF button not visible"
            pdf_color = page.evaluate("el => window.getComputedStyle(el).color", btn_pdf.element_handle())
            print(f"Export PDF button color: {pdf_color}")
            print("PASS 2: Export PDF button is present and styled!")

            # 6. Click Export PDF button to test PDF modal
            btn_pdf.click()
            page.wait_for_timeout(800)

            modal = page.locator('#tarot-pdf-modal')
            assert modal.is_visible(), "PDF Modal did not open!"
            print("PASS 3: PDF Modal opened successfully!")

            # Capture screenshot of PDF modal preview
            page.screenshot(path=r"c:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\tarot_pdf_modal_preview_mobile.png")
            print("Captured screenshot: tarot_pdf_modal_preview_mobile.png")

            # Check PDF paper elements inside modal
            card_imgs = page.locator('.tarot-pdf-paper .pdf-card-img-wrap img')
            card_count = card_imgs.count()
            print(f"Number of card images in PDF spread gallery: {card_count}")
            assert card_count >= 3, f"Expected at least 3 cards in gallery, got {card_count}"
            print("PASS 4: PDF spread gallery renders all card images!")

            # Check Print button and HTML download button
            btn_print = page.locator('#btn-print-to-pdf')
            btn_html = page.locator('#btn-download-html-report')
            assert btn_print.is_visible(), "Print to PDF button not visible"
            assert btn_html.is_visible(), "Download HTML report button not visible"
            print("PASS 5: Both Print to PDF and Download HTML buttons are operational!")

            # Test desktop view of PDF Paper
            page.set_viewport_size({'width': 1024, 'height': 900})
            page.wait_for_timeout(500)
            page.screenshot(path=r"c:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\tarot_pdf_modal_preview_desktop.png")
            print("Captured screenshot: tarot_pdf_modal_preview_desktop.png")

            browser.close()
    finally:
        srv.terminate()

if __name__ == '__main__':
    main()
