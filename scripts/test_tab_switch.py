import asyncio
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Mobile viewport (iPhone 14 / modern Android)
        context = await browser.new_context(viewport={"width": 390, "height": 844})
        page = await context.new_page()

        print("Navigating to app...")
        await page.goto("http://127.0.0.1:8090/index.html")
        await page.wait_for_timeout(1000)

        # Switch to Dich Hoc
        print("Switching to Dich Hoc...")
        await page.evaluate("() => document.getElementById('tab-mode-dichhoc').click()")
        await page.wait_for_timeout(1000)

        # 1. Capture initial Luc Hao view
        await page.screenshot(path="C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/test_tab_1_luchao_init.png")
        print("Saved test_tab_1_luchao_init.png")

        # Check toolbar buttons
        nav_buttons = await page.locator(".dh-nav-bar button").all_inner_texts()
        print("Sub-toolbar buttons:", nav_buttons)

        # 2. Click Mai Hoa tab directly
        print("Clicking Mai Hoa tab...")
        await page.locator("#dh-tab-maihoa").click()
        await page.wait_for_timeout(800)
        await page.screenshot(path="C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/test_tab_2_maihoa_switch.png")
        print("Saved test_tab_2_maihoa_switch.png")

        # 3. Switch back to Luc Hao
        print("Switching back to Luc Hao...")
        await page.locator("#dh-tab-luchao").click()
        await page.wait_for_timeout(800)
        await page.screenshot(path="C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/test_tab_3_luchao_back.png")
        print("Saved test_tab_3_luchao_back.png")

        # 4. In Luc Hao, click '⚡ Gieo Nhanh Cả 6 Hào'
        print("Clicking 'Gieo Nhanh Ca 6 Hao'...")
        await page.locator("#dh-btn-cast-auto").click()
        await page.wait_for_timeout(1500)
        await page.screenshot(path="C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/test_tab_4_luchao_cast_done.png")
        print("Saved test_tab_4_luchao_cast_done.png")

        # 5. Switch to Mai Hoa immediately without clicking Gieo Lai
        print("Switching to Mai Hoa after Luc Hao cast...")
        await page.locator("#dh-tab-maihoa").click()
        await page.wait_for_timeout(800)
        await page.screenshot(path="C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/test_tab_5_maihoa_after_cast.png")
        print("Saved test_tab_5_maihoa_after_cast.png")

        # 6. Switch back to Luc Hao immediately
        print("Switching back to Luc Hao...")
        await page.locator("#dh-tab-luchao").click()
        await page.wait_for_timeout(800)
        await page.screenshot(path="C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/test_tab_6_luchao_persisted.png")
        print("Saved test_tab_6_luchao_persisted.png")

        await browser.close()
        print("Test completed successfully.")

if __name__ == "__main__":
    asyncio.run(main())
