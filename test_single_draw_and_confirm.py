import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 390, "height": 844})

        print("Navigating to http://127.0.0.1:8080 ...")
        await page.goto("http://127.0.0.1:8080")
        await page.wait_for_timeout(1000)

        # 1. Initial controls check
        has_draw_single = await page.is_visible("#btn-draw-single")
        has_draw_3 = await page.is_visible("#btn-draw-3")
        has_draw_main = await page.is_visible("#btn-draw-main")
        print(f"Initial controls: btn-draw-single={has_draw_single}, btn-draw-3={has_draw_3}, btn-draw-main={has_draw_main}")
        assert has_draw_single, "Must have btn-draw-single!"
        assert not has_draw_3, "Must not have draw 3 button!"
        assert not has_draw_main, "Must not have draw 10 button!"

        # 2. Draw 1 card
        print("Clicking #btn-draw-single...")
        await page.click("#btn-draw-single")
        await page.wait_for_timeout(1500)

        card_count = await page.evaluate("() => document.querySelectorAll('.card-item').length")
        print(f"Cards on table after initial draw: {card_count}")
        assert card_count == 1, f"Expected 1 card, got {card_count}"

        # 3. Draw more 1 card
        print("Clicking #btn-draw-more...")
        await page.click("#btn-draw-more")
        await page.wait_for_timeout(1000)
        card_count = await page.evaluate("() => document.querySelectorAll('.card-item').length")
        print(f"Cards on table after draw more: {card_count}")
        assert card_count == 2, f"Expected 2 cards, got {card_count}"

        # 4. Confirm Reset Modal Test
        print("Testing delicate confirm reset modal...")
        await page.click("#btn-reset")
        await page.wait_for_timeout(500)

        modal_visible = await page.is_visible("#confirm-reset-modal")
        print(f"Confirm modal visible: {modal_visible}")
        assert modal_visible, "Confirm modal must be visible!"

        # Click Cancel
        print("Clicking #btn-cancel-reset (Keep cards)...")
        await page.click("#btn-cancel-reset")
        await page.wait_for_timeout(500)
        modal_visible = await page.is_visible("#confirm-reset-modal")
        card_count = await page.evaluate("() => document.querySelectorAll('.card-item').length")
        print(f"After cancel: modal_visible={modal_visible}, cards={card_count}")
        assert not modal_visible, "Modal must close after Cancel!"
        assert card_count == 2, "Cards must remain on table!"

        # Click Reset again and Confirm
        print("Clicking #btn-reset and then #btn-confirm-reset...")
        await page.click("#btn-reset")
        await page.wait_for_timeout(500)
        await page.click("#btn-confirm-reset")
        await page.wait_for_timeout(1000)

        empty_visible = await page.is_visible("#empty-state")
        card_count = await page.evaluate("() => document.querySelectorAll('.card-item').length")
        print(f"After confirm reset: empty_visible={empty_visible}, cards={card_count}")
        assert empty_visible, "Must return to initial empty state!"
        assert card_count == 0, "Table must be cleared!"

        # 5. Switch to Poker and test
        print("Testing Poker single draw...")
        await page.click("#tab-mode-poker")
        await page.wait_for_timeout(500)

        has_poker_single = await page.is_visible("#btn-draw-single")
        print(f"Poker initial single button: {has_poker_single}")
        assert has_poker_single, "Poker must have single draw button!"

        await page.click("#btn-draw-single")
        await page.wait_for_timeout(1000)
        poker_cards = await page.evaluate("() => document.querySelectorAll('.card-item').length")
        print(f"Poker cards after 1 draw: {poker_cards}")
        assert poker_cards == 1, "Poker must draw exactly 1 card!"

        await page.screenshot(path="screenshot_single_draw_verified.png")
        print("Saved screenshot_single_draw_verified.png successfully!")

        await browser.close()
        print("ALL TESTS PASSED 100% PERFECTLY!")

if __name__ == "__main__":
    asyncio.run(run())
