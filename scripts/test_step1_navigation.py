import asyncio
import os
from playwright.async_api import async_playwright

SCREENSHOT_DIR = r"C:\Books\Neta Light\scripts\test_results"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

async def test_navigation():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Mobile viewport emulation (iPhone 14 / modern Android)
        context = await browser.new_context(
            viewport={'width': 390, 'height': 844},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True
        )
        page = await context.new_page()

        print("1. Opening app...")
        await page.goto("http://127.0.0.1:8080", wait_until="networkidle")
        await page.wait_for_timeout(600)

        # 1. Capture initial Neta Light state
        shot_initial = os.path.join(SCREENSHOT_DIR, "step1_01_neta_initial.png")
        await page.screenshot(path=shot_initial)
        print(f"Saved: {shot_initial}")

        # 2. Open Dropdown
        print("2. Opening Dropdown Menu...")
        await page.click("#deck-selector-trigger")
        await page.wait_for_timeout(300)
        assert await page.is_visible("#deck-dropdown"), "Dropdown should be visible!"

        shot_dropdown = os.path.join(SCREENSHOT_DIR, "step1_02_dropdown_menu.png")
        await page.screenshot(path=shot_dropdown)
        print(f"Saved: {shot_dropdown}")

        # 3. Switch to Ky Mon Don Giap
        print("3. Switching to Ky Mon Don Giap...")
        await page.click("#tab-mode-qmdj")
        await page.wait_for_timeout(400)
        title = await page.inner_text("#app-main-title")
        print(f"Current title: {title}")
        assert "KỲ MÔN" in title, f"Expected KỲ MÔN in title, got: {title}"
        assert await page.is_visible("#view-qmdj"), "view-qmdj should be visible"
        assert not await page.is_visible("#view-cards"), "view-cards should be hidden"

        shot_qmdj = os.path.join(SCREENSHOT_DIR, "step1_03_view_qmdj.png")
        await page.screenshot(path=shot_qmdj)
        print(f"Saved: {shot_qmdj}")

        # 4. Switch to Bat Tu
        print("4. Switching to Bat Tu...")
        await page.click("#deck-selector-trigger")
        await page.wait_for_timeout(300)
        await page.click("#tab-mode-bazi")
        await page.wait_for_timeout(400)
        title = await page.inner_text("#app-main-title")
        print(f"Current title: {title}")
        assert "BÁT TỰ" in title
        assert await page.is_visible("#view-bazi")

        # 5. Switch to Tu Vi
        print("5. Switching to Tu Vi...")
        await page.click("#deck-selector-trigger")
        await page.wait_for_timeout(300)
        await page.click("#tab-mode-tuvi")
        await page.wait_for_timeout(400)
        title = await page.inner_text("#app-main-title")
        print(f"Current title: {title}")
        assert "TỬ VI" in title
        assert await page.is_visible("#view-tuvi")

        # 6. Switch to Lich Am Duong
        print("6. Switching to Lich Am Duong...")
        await page.click("#deck-selector-trigger")
        await page.wait_for_timeout(300)
        await page.click("#tab-mode-calendar")
        await page.wait_for_timeout(400)
        title = await page.inner_text("#app-main-title")
        print(f"Current title: {title}")
        assert "LỊCH ÂM DƯƠNG" in title
        assert await page.is_visible("#view-calendar")

        shot_calendar = os.path.join(SCREENSHOT_DIR, "step1_04_view_calendar.png")
        await page.screenshot(path=shot_calendar)
        print(f"Saved: {shot_calendar}")

        # 7. Switch back to Neta Light & draw a card (Regression Test)
        print("7. Switching back to Neta Light & drawing a card...")
        await page.click("#deck-selector-trigger")
        await page.wait_for_timeout(300)
        await page.click("#tab-mode-neta")
        await page.wait_for_timeout(400)
        assert await page.is_visible("#view-cards")
        await page.click("#btn-draw-single")
        await page.wait_for_timeout(800)
        cards_count = await page.locator(".card-item").count()
        print(f"Cards drawn in Neta Light: {cards_count}")
        assert cards_count == 1, f"Expected 1 card, got {cards_count}"

        # 8. Switch to Poker & draw a card (Regression Test)
        print("8. Switching to Poker & drawing a card...")
        await page.click("#deck-selector-trigger")
        await page.wait_for_timeout(300)
        await page.click("#tab-mode-poker")
        await page.wait_for_timeout(400)
        await page.click("#btn-draw-single")
        await page.wait_for_timeout(800)
        poker_cards_count = await page.locator(".card-item").count()
        print(f"Cards drawn in Poker: {poker_cards_count}")
        assert poker_cards_count == 1, f"Expected 1 card, got {poker_cards_count}"

        shot_poker_drawn = os.path.join(SCREENSHOT_DIR, "step1_05_poker_drawn.png")
        await page.screenshot(path=shot_poker_drawn)
        print(f"Saved: {shot_poker_drawn}")

        print("=== ALL STEP 1 TESTS PASSED PERFECTLY! ===")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_navigation())
