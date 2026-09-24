import time
import subprocess
import sys
from playwright.sync_api import sync_playwright

def main():
    srv = subprocess.Popen([sys.executable, "-m", "http.server", "8899"], cwd=r"c:\Books\Neta Light")
    time.sleep(1.5)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(viewport={'width': 360, 'height': 800}, accept_downloads=True)
            page = context.new_page()

            page.goto('http://localhost:8899/index.html')
            page.wait_for_timeout(1000)

            # Switch to light theme
            page.evaluate("document.body.className = 'theme-light'; localStorage.setItem('neta_theme', 'light');")
            page.wait_for_timeout(300)

            # Switch to Tarot mode
            page.evaluate("window.switchDeckMode('tarot');")
            page.wait_for_timeout(1500)

            # Quick draw 3 cards
            btn_quick = page.locator('#btn-tarot-quick-draw')
            assert btn_quick.is_visible(), "Quick draw button not visible"
            btn_quick.click()
            page.wait_for_timeout(800)

            # Flip All button
            btn_flip = page.locator('#btn-tarot-flip-all')
            assert btn_flip.is_visible(), "Flip all button not visible"
            btn_flip.click()
            page.wait_for_timeout(1000)

            # Report card visible
            rep_card = page.locator('.tarot-report-card')
            assert rep_card.is_visible(), "Report card should be visible"

            # 1. VERIFY TEXT ALIGNMENT: JUSTIFY
            story_bq = page.locator('.tarot-storyline-content blockquote')
            align_val = page.evaluate("el => window.getComputedStyle(el).textAlign", story_bq.element_handle())
            print(f"Storyline blockquote text-align: {align_val}")
            assert align_val == 'justify', f"Expected justify, got {align_val}"
            print("PASS 1: Storyline narrative text-align is JUSTIFY!")

            desc_card = page.locator('.reading-card-desc').first
            align_desc = page.evaluate("el => window.getComputedStyle(el).textAlign", desc_card.element_handle())
            print(f"Card reading description text-align: {align_desc}")
            assert align_desc == 'justify', f"Expected justify, got {align_desc}"
            print("PASS 2: Card reading description text-align is JUSTIFY!")

            advice_bq = page.locator('.tarot-prescription-content blockquote')
            align_adv = page.evaluate("el => window.getComputedStyle(el).textAlign", advice_bq.element_handle())
            print(f"Prescription advice text-align: {align_adv}")
            assert align_adv == 'justify', f"Expected justify, got {align_adv}"
            print("PASS 3: Final advice text-align is JUSTIFY!")

            # Capture screenshot of justified text
            page.evaluate("el => el.scrollIntoView()", story_bq.element_handle())
            page.wait_for_timeout(300)
            page.screenshot(path=r"c:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\tarot_justified_storyline_mobile.png")
            print("Captured screenshot: tarot_justified_storyline_mobile.png")

            # 2. VERIFY 4 DIRECT ACTION BUTTONS (NO POPUP)
            actions_box = page.locator('.tarot-report-actions')
            actions_box.scroll_into_view_if_needed()
            page.wait_for_timeout(300)

            btn_save = page.locator('#btn-tarot-save-journal')
            btn_pdf = page.locator('#btn-tarot-export-pdf')
            btn_html = page.locator('#btn-tarot-download-html')
            btn_copy = page.locator('#btn-tarot-copy-markdown')

            assert btn_save.is_visible(), "Save Journal button missing"
            assert btn_pdf.is_visible(), "PDF Download button missing"
            assert btn_html.is_visible(), "HTML Download button missing"
            assert btn_copy.is_visible(), "Copy MD button missing"
            print("PASS 4: All 4 direct action buttons are visible in the 2x2 grid!")

            # Capture screenshot of the 4 buttons
            page.screenshot(path=r"c:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b\tarot_4_direct_buttons_mobile.png")
            print("Captured screenshot: tarot_4_direct_buttons_mobile.png")

            # 3. TEST DIRECT HTML DOWNLOAD (ZERO POPUP)
            print("Testing direct HTML download...")
            with page.expect_download() as download_info:
                btn_html.click()
            download = download_info.value
            html_path = download.suggested_filename
            print(f"HTML downloaded directly: {html_path}")
            assert html_path.endswith('.html'), f"Expected .html file, got {html_path}"
            assert page.locator('#tarot-pdf-modal').count() == 0, "Popup modal should NOT exist!"
            print("PASS 5: Direct HTML download works with ZERO POPUP!")

            # 4. TEST DIRECT PDF DOWNLOAD (ZERO POPUP)
            print("Testing direct PDF download...")
            with page.expect_download(timeout=15000) as pdf_download_info:
                btn_pdf.click()
            pdf_download = pdf_download_info.value
            pdf_filename = pdf_download.suggested_filename
            print(f"PDF downloaded directly: {pdf_filename}")
            assert pdf_filename.endswith('.pdf'), f"Expected .pdf file, got {pdf_filename}"
            assert page.locator('#tarot-pdf-modal').count() == 0, "Popup modal should NOT exist!"
            print("PASS 6: Direct PDF download works with ZERO POPUP!")

            browser.close()
            print("\nALL 6 VERIFICATIONS PASSED 100% PERFECTLY!")
    finally:
        srv.terminate()

if __name__ == '__main__':
    main()
