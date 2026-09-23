import asyncio
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 390, 'height': 844})
        page = await context.new_page()

        print("[TEST] 1. Loading http://127.0.0.1:8080 ...")
        await page.goto("http://127.0.0.1:8080", wait_until="networkidle")

        print("[TEST] 2. Switching to Poker tab...")
        await page.click("#tab-mode-poker")
        await page.wait_for_timeout(300)

        # Mở Modal Tra Cứu
        print("[TEST] 3. Opening Guide modal to inspect 9 Spades...")
        await page.click("#btn-guide")
        await page.wait_for_timeout(300)

        # Search for "9 Bích"
        await page.fill("#guide-search-input", "Chín (9) Bích")
        await page.wait_for_timeout(300)

        # Click on 9 Spades in guide list
        await page.click(".guide-item")
        await page.wait_for_timeout(400)

        # Verify title & meaning in preview modal
        title = await page.text_content(".modal-card-title")
        desc = await page.text_content(".modal-desc-box")
        advice = await page.text_content(".modal-advice-box")

        print(f"[TEST] 9 Bích Modal Title: {title}")
        print(f"[TEST] 9 Bích Modal Desc: {desc}")
        print(f"[TEST] 9 Bích Modal Advice: {advice}")

        assert "Chín (9) Bích" in title
        assert "Vong Nam" in desc, f"Expected 'Vong Nam' in desc, got: {desc}"

        await page.screenshot(path="screenshot_9_bich_verified.png")
        print("[TEST] Saved screenshot_9_bich_verified.png successfully!")

        # Close modal
        await page.click("#modal-close-btn")
        await page.wait_for_timeout(200)

        # Search for "Át (Ace) Rô"
        await page.click("#btn-guide")
        await page.wait_for_timeout(200)
        await page.fill("#guide-search-input", "Át (Ace) Rô")
        await page.wait_for_timeout(300)
        await page.click(".guide-item")
        await page.wait_for_timeout(300)

        aro_title = await page.text_content(".modal-card-title")
        aro_desc = await page.text_content(".modal-desc-box")
        print(f"[TEST] Át Rô Modal Title: {aro_title}")
        print(f"[TEST] Át Rô Modal Desc: {aro_desc}")
        assert "Ngài Nadrasa Dehi" in aro_desc, f"Expected 'Ngài Nadrasa Dehi' in desc, got: {aro_desc}"

        await page.screenshot(path="screenshot_at_ro_verified.png")
        print("[TEST] Saved screenshot_at_ro_verified.png successfully!")

        await browser.close()
        print("\n>>> ALL VISUAL GROUND TRUTH CHECKS PASSED 100%!")

asyncio.run(run())
