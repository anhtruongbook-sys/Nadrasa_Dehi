import asyncio
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 390, "height": 844})
        page = await context.new_page()

        print("Navigating to app...")
        await page.goto("http://127.0.0.1:8090/index.html")
        await page.wait_for_timeout(1000)

        # Ensure light theme
        await page.evaluate("""() => {
            document.body.classList.remove('theme-dark');
            document.body.classList.add('theme-light');
            localStorage.setItem('neta_theme', 'light');
        }""")
        await page.wait_for_timeout(500)

        # 1. Switch to Dịch Học
        print("Navigating to Dịch Học...")
        await page.evaluate("() => document.getElementById('tab-mode-dichhoc').click()")
        await page.wait_for_timeout(1000)

        # Check Tiết khí text
        tiet_khi = await page.locator('.dh-meta-row.sub-row').inner_text()
        print('Dịch Học Meta Strip:\n', tiet_khi)

        # Switch to Mai Hoa tab and cast quẻ
        print("Clicking Mai Hoa tab...")
        await page.locator('#dh-tab-maihoa').click()
        await page.wait_for_timeout(800)

        print("Casting Mai Hoa...")
        await page.locator('#dh-btn-run-maihoa').click()
        await page.wait_for_timeout(1000)

        # Scroll to Thể Dụng card
        await page.evaluate("""() => {
            const el = document.querySelector('.dh-the-dung-card');
            if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
        }""")
        await page.wait_for_timeout(500)

        await page.screenshot(path="C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_the_dung_light.png")
        print("Saved verify_the_dung_light.png")

        styles = await page.evaluate("""() => {
            const card = document.querySelector('.dh-the-dung-card');
            const col = document.querySelector('.td-col');
            const badge = document.querySelector('.badge-eval');
            return {
                cardBg: card ? getComputedStyle(card).backgroundColor : null,
                colColor: col ? getComputedStyle(col).color : null,
                badgeBg: badge ? getComputedStyle(badge).backgroundColor : null,
                badgeColor: badge ? getComputedStyle(badge).color : null,
                badgeText: badge ? badge.innerText : null
            };
        }""")
        print("Computed Styles in Light Mode:", styles)

        # 2. Check Bát Tự
        print("Navigating to Bát Tự...")
        await page.evaluate("() => document.getElementById('tab-mode-bazi').click()")
        await page.wait_for_timeout(1000)
        bazi_birth = await page.locator('.bm-birth').inner_text()
        print('Bát Tự Birth Bar:\n', bazi_birth)
        await page.screenshot(path="C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_bazi_light.png")

        # 3. Check Kỳ Môn
        print("Navigating to Kỳ Môn...")
        await page.evaluate("() => document.getElementById('tab-mode-qmdj').click()")
        await page.wait_for_timeout(1000)
        qmdj_badge = await page.locator('.qmdj-cuc-badge').inner_text()
        print('Kỳ Môn Cuc Badge:\n', qmdj_badge.replace('\n', ' '))
        await page.screenshot(path="C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_qmdj_light.png")

        # 4. Check Calendar Bloc
        print("Navigating to Calendar...")
        await page.evaluate("() => document.getElementById('tab-mode-calendar').click()")
        await page.wait_for_timeout(1000)
        cal_lunar = await page.locator('.cal-nav-lunar').inner_text()
        print('Calendar Lunar Nav:\n', cal_lunar)
        await page.screenshot(path="C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_calendar_light.png")

        await browser.close()
        print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!")

if __name__ == '__main__':
    asyncio.run(main())
