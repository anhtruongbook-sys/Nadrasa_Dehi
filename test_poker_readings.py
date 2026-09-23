import asyncio
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Mobile viewport emulation (iPhone 13 / Modern smartphone)
        context = await browser.new_context(
            viewport={'width': 390, 'height': 844},
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
        )
        page = await context.new_page()

        print("[TEST] 1. Loading http://127.0.0.1:8080 ...")
        await page.goto("http://127.0.0.1:8080", wait_until="networkidle")

        print("[TEST] 2. Switching to Poker tab...")
        await page.click("#tab-mode-poker")
        await page.wait_for_timeout(300)

        # Verify initial Poker title
        title = await page.text_content("#app-main-title")
        assert "POKER" in title, f"Expected Poker in title, got: {title}"

        # Draw 9 cards
        print("[TEST] 3. Drawing 9 cards (Tụ 1, Tụ 2, Tụ 3)...")
        await page.click("#btn-draw-main")
        await page.wait_for_timeout(1000)

        # Verify cards count
        card_items = await page.query_selector_all(".card-item")
        print(f"[TEST] Rendered {len(card_items)} card items on arena.")
        assert len(card_items) == 9, f"Expected 9 cards, got: {len(card_items)}"

        # Verify NO reading panel shown on arena directly ("ko hiện sẵn luận giải")
        reading_panel_exists = await page.is_visible("#poker-reading-panel")
        print(f"[TEST] Reading panel on arena visible: {reading_panel_exists}")
        assert not reading_panel_exists, "Reading panel should NOT be shown directly on table arena!"

        # Verify NO title tags under cards in Poker mode ("bài tây không cần chữ chú thích tên")
        title_tags = await page.query_selector_all(".cards-grid .card-title-tag")
        print(f"[TEST] Card title tags count under cards: {len(title_tags)}")
        assert len(title_tags) == 0, f"Expected 0 title tags under poker cards, got: {len(title_tags)}"

        # Verify NO order badges on cards ("không hiển thị số thứ tự lá bài nhé")
        order_badges = await page.query_selector_all(".cards-grid .card-order-badge")
        print(f"[TEST] Card order badges count: {len(order_badges)}")
        assert len(order_badges) == 0, f"Expected 0 order badges on cards, got: {len(order_badges)}"

        # Verify Footer controls are FIXED inside viewport (not scrolled out of view)
        footer_box = await page.locator("#session-controls").bounding_box()
        print(f"[TEST] Footer controls box: {footer_box}")
        assert footer_box['y'] + footer_box['height'] <= 844 + 5, "Footer controls must be fixed inside viewport!"

        # Verify all 9 cards fit inside arena without being covered by footer controls
        last_card_box = await card_items[-1].bounding_box()
        print(f"[TEST] 9th card bottom: {last_card_box['y'] + last_card_box['height']} vs Footer top: {footer_box['y']}")
        assert last_card_box['y'] + last_card_box['height'] <= footer_box['y'] + 10, "Cards must fit within 1 screen above footer controls!"

        # Verify reading buttons are visible
        hint_reading_visible = await page.is_visible("#btn-open-reading")
        session_reading_visible = await page.is_visible("#btn-session-reading")
        print(f"[TEST] Hint reading button: {hint_reading_visible}, Session reading button: {session_reading_visible}")
        assert hint_reading_visible and session_reading_visible, "Reading buttons should be visible in Poker mode!"

        # Save screenshot of clean fitscreen table
        await page.screenshot(path="screenshot_poker_fitscreen.png")
        print("[TEST] Saved screenshot_poker_fitscreen.png")

        # Open Spiritual Reading Modal
        print("[TEST] 4. Opening Spiritual Reading Modal...")
        await page.click("#btn-session-reading")
        await page.wait_for_timeout(500)

        modal_visible = await page.is_visible("#reading-modal")
        assert modal_visible, "Reading modal should be visible after clicking reading button"

        # Check Tụ 1 badge
        tu1_badge = await page.text_content(".tu-reading-box.tu-1 .tu-box-badge")
        print(f"[TEST] Modal Tụ 1 badge: {tu1_badge.strip()}")
        assert "Xác nhận cao nhất" in tu1_badge

        # Check Tụ 2 badge
        tu2_badge = await page.text_content(".tu-reading-box.tu-2 .tu-box-badge")
        print(f"[TEST] Modal Tụ 2 badge: {tu2_badge.strip()}")
        assert "Có thể chấp nhận được" in tu2_badge

        # Check Tụ 3 badge
        tu3_badge = await page.text_content(".tu-reading-box.tu-3 .tu-box-badge")
        print(f"[TEST] Modal Tụ 3 badge: {tu3_badge.strip()}")
        assert "Cần kiểm tra bốc lại" in tu3_badge

        # Save screenshot of Reading Modal
        await page.screenshot(path="screenshot_reading_modal.png")
        print("[TEST] Saved screenshot_reading_modal.png")

        # Close Reading Modal
        await page.click("#reading-close-btn")
        await page.wait_for_timeout(300)
        modal_closed = not (await page.is_visible("#reading-modal"))
        assert modal_closed, "Reading modal should be closed"

        # Test Draw More (1 lá nữa -> 10 lá -> Tụ 4 bổ trợ)
        print("[TEST] 5. Drawing 1 more card (Testing Tụ 4 & auto-scaling to 4 rows)...")
        await page.click("#btn-draw-more")
        await page.wait_for_timeout(600)

        card_items_10 = await page.query_selector_all(".card-item")
        assert len(card_items_10) == 10, f"Expected 10 cards, got: {len(card_items_10)}"

        # Verify 10 cards still fit within screen
        last_card_10_box = await card_items_10[-1].bounding_box()
        footer_box_after = await page.locator("#session-controls").bounding_box()
        print(f"[TEST] 10th card bottom: {last_card_10_box['y'] + last_card_10_box['height']} vs Footer top: {footer_box_after['y']}")
        assert last_card_10_box['y'] + last_card_10_box['height'] <= footer_box_after['y'] + 10, "10 cards must still fit within 1 screen!"

        # Check Tụ 4 in modal
        await page.click("#btn-session-reading")
        await page.wait_for_timeout(400)
        tu4_exists = await page.is_visible(".tu-reading-box.tu-extra")
        assert tu4_exists, "Tụ bổ trợ (tu-extra) should be visible when 10 cards drawn"
        tu4_badge = await page.text_content(".tu-reading-box.tu-extra .tu-box-badge")
        print(f"[TEST] Tụ 4 badge: {tu4_badge.strip()}")
        assert "Bổ trợ thông tin" in tu4_badge
        await page.click("#reading-close-btn")
        await page.wait_for_timeout(200)

        # Run algorithmic unit tests inside page context
        print("[TEST] 5. Running in-browser unit tests for spiritual combos...")
        test_results = await page.evaluate('''() => {
            const { detectTuCombo, detectConsecutiveCombos, checkMatchingTus } = window._pokerEngine;
            const results = {};

            // Mock cards
            const c2s = { rankNum: 2, colorType: 'black', suitCode: 'spades', shortName: '2♠', name: '2 Bích', meaning: 'Vong trẻ em nữ' };
            const c6s = { rankNum: 6, colorType: 'black', suitCode: 'spades', shortName: '6♠', name: '6 Bích', meaning: 'Nghiệp tâm linh' };
            const c3s = { rankNum: 3, colorType: 'black', suitCode: 'spades', shortName: '3♠', name: '3 Bích', meaning: 'Âm binh súc sinh, động mộ' };

            const combo263 = detectTuCombo([c2s, c6s, c3s]);
            results.combo263 = combo263 ? combo263.name : null;

            // 5-7-8 black
            const c5s = { rankNum: 5, colorType: 'black', suitCode: 'spades', shortName: '5♠', name: '5 Bích' };
            const c7s = { rankNum: 7, colorType: 'black', suitCode: 'spades', shortName: '7♠', name: '7 Bích' };
            const c8s = { rankNum: 8, colorType: 'black', suitCode: 'spades', shortName: '8♠', name: '8 Bích' };
            const combo578b = detectTuCombo([c5s, c7s, c8s]);
            results.combo578b = combo578b ? combo578b.name : null;

            // 5-7-8 red
            const c5h = { rankNum: 5, colorType: 'red', suitCode: 'hearts', shortName: '5♥', name: '5 Cơ' };
            const c7h = { rankNum: 7, colorType: 'red', suitCode: 'hearts', shortName: '7♥', name: '7 Cơ' };
            const c8h = { rankNum: 8, colorType: 'red', suitCode: 'hearts', shortName: '8♥', name: '8 Cơ' };
            const combo578r = detectTuCombo([c5h, c7h, c8h]);
            results.combo578r = combo578r ? combo578r.name : null;

            // 2 pairs in 4 consecutive black cards
            const c1s = { rankNum: 1, colorType: 'black', suitCode: 'spades', shortName: 'A♠' };
            const c1c = { rankNum: 1, colorType: 'black', suitCode: 'clubs', shortName: 'A♣' };
            const cKs = { rankNum: 13, colorType: 'black', suitCode: 'spades', shortName: 'K♠' };
            const cKc = { rankNum: 13, colorType: 'black', suitCode: 'clubs', shortName: 'K♣' };
            const alerts4black = detectConsecutiveCombos([c1s, c1c, cKs, cKc]);
            results.alert4black = alerts4black.length > 0 ? alerts4black[0].title : null;

            // 2 pairs in 4 cards mixed color
            const cKh = { rankNum: 13, colorType: 'red', suitCode: 'hearts', shortName: 'K♥' };
            const alerts4mixed = detectConsecutiveCombos([c1s, c1c, cKs, cKh]);
            results.alert4mixed = alerts4mixed.length > 0 ? alerts4mixed[0].title : null;

            // 2 pairs in 5 consecutive cards (spread across 5 cards, e.g. A, A, 9, K, K)
            const c9d = { rankNum: 9, colorType: 'red', suitCode: 'diamonds', shortName: '9♦' };
            const alerts5 = detectConsecutiveCombos([c1s, c1c, c9d, cKs, cKh]);
            results.alert5 = alerts5.length > 0 ? alerts5[0].title : null;

            // 2 matching Tus
            const tuA = [c2s, c6s, c3s];
            const tuB = [c2s, c6s, c3s];
            const matching = checkMatchingTus([...tuA, ...tuB]);
            results.matching = matching.length > 0 ? matching[0].title : null;

            return results;
        }''')

        print(f"[TEST] Combo [2-6-3] result: {test_results['combo263']}")
        assert "Bộ 2 - 6 - 3" in test_results['combo263']

        print(f"[TEST] Combo [5-7-8 Đen] result: {test_results['combo578b']}")
        assert "Bộ 5 - 7 - 8 Đen" in test_results['combo578b']

        print(f"[TEST] Combo [5-7-8 Đỏ] result: {test_results['combo578r']}")
        assert "Bộ 5 - 7 - 8 Đỏ" in test_results['combo578r']

        print(f"[TEST] 4 black cards 2 pairs alert: {test_results['alert4black']}")
        assert "Hết phúc làm người" in test_results['alert4black']

        print(f"[TEST] 4 mixed cards 2 pairs alert: {test_results['alert4mixed']}")
        assert "Cạn phúc" in test_results['alert4mixed']

        print(f"[TEST] 5 cards 2 pairs alert: {test_results['alert5']}")
        assert "Xác nhận như bộ 3" in test_results['alert5']

        print(f"[TEST] Matching Tus alert: {test_results['matching']}")
        assert "có các lá bài như nhau" in test_results['matching']

        # Test Neta Light mode has NO order badges as well
        print("[TEST] 6. Switching to Neta Light tab and drawing 10 cards...")
        await page.click("#tab-mode-neta")
        await page.wait_for_timeout(300)
        await page.click("#btn-draw-main")
        await page.wait_for_timeout(800)

        neta_badges = await page.query_selector_all(".cards-grid .card-order-badge")
        print(f"[TEST] Neta Light order badges count: {len(neta_badges)}")
        assert len(neta_badges) == 0, f"Expected 0 order badges in Neta Light, got: {len(neta_badges)}"

        await page.screenshot(path="screenshot_neta_nobadges.png")
        print("[TEST] Saved screenshot_neta_nobadges.png")

        await browser.close()
        print("[TEST] ALL SPIRITUAL RULES & POKER TESTS PASSED SUCCESSFULLY! 100% PASS.")

asyncio.run(run())
