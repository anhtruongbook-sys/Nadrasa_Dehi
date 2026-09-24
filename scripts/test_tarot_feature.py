# -*- coding: utf-8 -*-
"""
Kiểm thử tự động tính năng Tarot Rider-Waite (RWS) 78 lá bằng Playwright
"""
import os
import sys
import time
from playwright.sync_api import sync_playwright

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

def run_tarot_test():
    artifacts_dir = r"C:\Users\Admin\.gemini\antigravity\brain\32725825-4057-48fd-8f39-2b87c21de95b"
    os.makedirs(artifacts_dir, exist_ok=True)
    html_path = r"c:\Books\Neta Light\index.html"
    file_url = f"file:///{html_path.replace(os.sep, '/')}"

    errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        page = context.new_page()

        page.on("pageerror", lambda err: errors.append(f"PAGE ERROR: {err}"))
        page.on("console", lambda msg: print(f"[{msg.type}] {msg.text}") if msg.type in ["error", "warning"] else None)

        print(f"Navigating to: {file_url}")
        page.goto(file_url)
        page.wait_for_load_state("networkidle")

        # 1. Chuyển sang chế độ Tarot
        print("1. Switching to Tarot mode...")
        page.click("#deck-selector-trigger")
        page.wait_for_timeout(300)
        page.click("#tab-mode-tarot")
        page.wait_for_timeout(500)

        title = page.inner_text("#app-main-title")
        print(f"Main title: {title}")
        assert "TAROT" in title, f"Expected TAROT in title, got: {title}"

        # 2. Bốc bài 3 lá
        print("2. Drawing 3 cards spread...")
        page.fill("#tarot-question-input", "Công việc và dự án mới sắp tới có thuận lợi không?")
        page.click("#btn-tarot-quick-draw")
        page.wait_for_timeout(500)

        # Kiểm tra 3 lá bài xuất hiện
        card_scenes = page.query_selector_all(".tarot-card-3d-scene")
        print(f"Card scenes rendered: {len(card_scenes)}")
        assert len(card_scenes) == 3, f"Expected 3 cards, got {len(card_scenes)}"

        # Chụp ảnh bàn bài đang úp
        page.screenshot(path=os.path.join(artifacts_dir, "tarot_dark_unflipped.png"))

        # 3. Lật tất cả các lá bài
        print("3. Flipping all cards...")
        page.click("#btn-tarot-flip-all")
        page.wait_for_timeout(700)

        # Kiểm tra báo cáo xuất hiện
        report = page.query_selector(".tarot-report-card")
        assert report is not None, "Report card should be visible after flipping all cards"
        report_text = report.inner_text()
        print("Report excerpt:", report_text[:200])

        # Chụp ảnh báo cáo Dark mode
        page.screenshot(path=os.path.join(artifacts_dir, "tarot_dark_report.png"), full_page=True)

        # 4. Lưu vào nhật ký
        print("4. Saving to journal...")
        page.click("#btn-tarot-save-journal")
        page.wait_for_timeout(500)

        # 5. Chuyển sang Tab Nhật Ký
        print("5. Checking Journal tab...")
        page.click("button[data-tab='journal']")
        page.wait_for_timeout(400)
        journal_items = page.query_selector_all(".tarot-journal-item")
        print(f"Journal items found: {len(journal_items)}")
        assert len(journal_items) >= 1, "Expected at least 1 journal entry"

        page.screenshot(path=os.path.join(artifacts_dir, "tarot_journal_tab.png"))

        # 6. Chuyển sang Tab Bách Khoa 78 Lá
        print("6. Checking Encyclopedia tab...")
        page.click("button[data-tab='encyclopedia']")
        page.wait_for_timeout(400)

        all_cards = page.query_selector_all(".tarot-ency-card-item")
        print(f"Total encyclopedia cards: {len(all_cards)}")
        assert len(all_cards) == 78, f"Expected 78 cards in encyclopedia, got {len(all_cards)}"

        # Lọc Ẩn chính
        page.click("button[data-filter='Major']")
        page.wait_for_timeout(300)
        major_cards = page.query_selector_all(".tarot-ency-card-item")
        print(f"Major cards after filter: {len(major_cards)}")
        assert len(major_cards) == 22, f"Expected 22 major cards, got {len(major_cards)}"

        # Mở modal chi tiết lá bài đầu tiên
        major_cards[0].click()
        page.wait_for_timeout(500)
        modal = page.query_selector("#tarot-detail-modal")
        assert modal is not None and modal.is_visible(), "Detail modal should be visible"
        print("Card modal opened successfully!")

        page.screenshot(path=os.path.join(artifacts_dir, "tarot_card_modal.png"))
        page.click("#tarot-modal-close-btn")
        page.wait_for_timeout(300)

        # 7. Kiểm tra giao diện Light Mode
        print("7. Testing Light Mode...")
        page.click("button[data-tab='spread']")
        page.wait_for_timeout(300)
        page.click("#btn-theme")
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(artifacts_dir, "tarot_light_report.png"), full_page=True)

        browser.close()

    if errors:
        print("\nERRORS ENCOUNTERED:")
        for err in errors:
            print("-", err)
        sys.exit(1)
    else:
        print("\n[SUCCESS] ALL TAROT TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    run_tarot_test()
