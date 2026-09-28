import asyncio
import os
import sys
from playwright.async_api import async_playwright

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612"

async def test_lakinh_hud():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        ctx = await b.new_context(viewport={'width': 412, 'height': 915}) # Kích thước màn hình tương tự ảnh user
        page = await ctx.new_page()
        await page.goto("http://localhost:8090/index.html")
        await page.evaluate("() => { window.switchAppMode('lakinh'); }")
        await page.wait_for_timeout(1000)
        
        # Bật lớp Kỳ Môn Chiến Lược
        await page.evaluate("""() => {
            const btn = document.getElementById('lakinh-btn-qmdj-strat');
            if (btn && !btn.classList.contains('active')) btn.click();
        }""")
        await page.wait_for_timeout(500)
        
        # Chọn mục tiêu 'Cầu Tài' giống như trong ảnh người dùng gửi
        await page.evaluate("""() => {
            const pillWealth = document.querySelector('.qmdj-hud-pill-btn[data-goal="wealth"]');
            if (pillWealth) pillWealth.click();
        }""")
        await page.wait_for_timeout(500)
        
        # Chụp ảnh cận cảnh floating HUD
        hud = await page.wait_for_selector("#lakinh-qmdj-floating-hud")
        p_hud = os.path.join(ARTIFACT_DIR, "test_phase3_lakinh_hud_fixed.png")
        await hud.screenshot(path=p_hud)
        print("Captured HUD:", p_hud)
        
        # Chụp toàn màn hình La Kinh
        p_full = os.path.join(ARTIFACT_DIR, "test_phase3_lakinh_screen_fixed.png")
        await page.screenshot(path=p_full)
        print("Captured Full:", p_full)
        
        # Kiểm tra overflow của các text
        items_info = await page.evaluate("""() => {
            const items = document.querySelectorAll('.qmdj-hud-item');
            return Array.from(items).map(it => {
                const str = it.querySelector('strong');
                return {
                    lbl: it.querySelector('.lbl').innerText,
                    text: str.innerText,
                    scrollWidth: str.scrollWidth,
                    clientWidth: str.clientWidth,
                    isOverflowing: str.scrollWidth > str.clientWidth
                };
            });
        }""")
        for item in items_info:
            print(f"- {item['lbl']}: '{item['text']}' (Overflowing: {item['isOverflowing']})")
            
        await b.close()

if __name__ == "__main__":
    asyncio.run(test_lakinh_hud())
