import asyncio
import os
from playwright.async_api import async_playwright

ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\4d72166e-a558-4f4d-91fa-f0ed6498588e"

async def test_tightened():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 390, 'height': 844},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True
        )
        page = await context.new_page()
        await page.goto("http://127.0.0.1:8080", wait_until="networkidle")
        await page.wait_for_timeout(600)

        # Switch to Poker
        await page.click("#deck-selector-trigger")
        await page.wait_for_timeout(300)
        await page.click("#tab-mode-poker")
        await page.wait_for_timeout(400)

        # Switch to Light Theme (same as user photo)
        await page.click("#btn-theme")
        await page.wait_for_timeout(300)

        # Draw 1 card
        await page.click("#btn-draw-single")
        await page.wait_for_timeout(500)

        # Draw 5 more cards -> total 6 cards
        for _ in range(5):
            await page.click("#btn-draw-more")
            await page.wait_for_timeout(300)

        # Check header bounding box
        header_box = await page.locator(".app-header").bounding_box()
        print(f"Header height: {header_box['height']}px (Y: {header_box['y']})")

        # Take screenshot of 6 cards in light theme
        shot = os.path.join(ARTIFACT_DIR, "v112_tightened_poker_6cards.png")
        await page.screenshot(path=shot)
        print(f"Saved: {shot}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_tightened())
