import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Mobile viewport
        context = await browser.new_context(viewport={"width": 390, "height": 844})
        page = await context.new_page()

        print("Navigating to http://127.0.0.1:8090/index.html...")
        await page.goto("http://127.0.0.1:8090/index.html")
        await page.wait_for_timeout(1000)

        # Open deck dropdown
        await page.click("#deck-selector-trigger")
        await page.wait_for_timeout(500)

        # Click on Phap Hanh mode
        await page.click("#tab-mode-phaphanh")
        await page.wait_for_timeout(1000)

        # Check subtitle text
        subtitle = await page.inner_text("#app-sub-title")
        print(f"Current Subtitle: '{subtitle}'")

        # Take screenshot of Phap Hanh initial view
        await page.screenshot(path=r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\verify_phap_hanh_all.png")

        # Click on "Hộ Pháp" chip
        chips = await page.query_selector_all(".ph-chip-btn")
        for chip in chips:
            text = await chip.inner_text()
            if "Hộ Pháp" in text:
                print("Clicking Hộ Pháp chip...")
                await chip.click()
                break

        await page.wait_for_timeout(800)

        # Check count badge
        count_text = await page.inner_text("#ph-lessons-count")
        print(f"Hộ Pháp Lessons count: '{count_text}'")

        # Take screenshot of Ho Phap category
        await page.screenshot(path=r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\verify_phap_hanh_ho_phap.png")

        # Click on the first Ho Phap card to open viewer modal
        first_card = await page.query_selector(".ph-card")
        if first_card:
            print("Clicking first card to open LightBox...")
            await first_card.click()
            await page.wait_for_timeout(800)
            
            # Take screenshot of viewer modal
            await page.screenshot(path=r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\verify_phap_hanh_modal.png")

        await browser.close()
        print("Verification complete!")

if __name__ == "__main__":
    asyncio.run(main())
