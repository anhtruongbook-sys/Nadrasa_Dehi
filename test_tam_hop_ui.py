import asyncio
import os
import sys
from playwright.async_api import async_playwright

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612"

async def test_tam_hop_ui():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        ctx = await b.new_context(viewport={'width': 412, 'height': 915})
        page = await ctx.new_page()
        await page.goto("http://localhost:8090/index.html")
        await page.evaluate("() => { window.switchAppMode('lakinh'); }")
        await page.wait_for_timeout(1000)

        # 1. Chụp màn hình La Kinh chính có nút Tam Hợp 🌊 trên top bar
        p_lakinh = os.path.join(ARTIFACT_DIR, "test_lakinh_tamhop_topbar.png")
        await page.screenshot(path=p_lakinh)
        print("Captured La Kinh topbar with Tam Hop button:", p_lakinh)

        # 2. Bấm mở thẻ HUD detail để kiểm tra hiển thị Tam Bàn & 120 Phân Kim
        await page.evaluate("() => { const pill = document.getElementById('lakinh-hud-pill'); if (pill) pill.click(); }")
        await page.wait_for_timeout(500)
        p_hud_detail = os.path.join(ARTIFACT_DIR, "test_lakinh_hud_detail_tamban.png")
        await page.screenshot(path=p_hud_detail)
        print("Captured HUD detail card with Tam Ban & 120 Phan Kim:", p_hud_detail)

        # 3. Bấm nút 🌊 Tam Hợp để mở Modal Thẩm Định
        await page.evaluate("() => { const btn = document.getElementById('lakinh-btn-tam-hop'); if (btn) btn.click(); }")
        await page.wait_for_timeout(800)

        modal = await page.wait_for_selector(".tamhop-modal-dialog")
        p_modal = os.path.join(ARTIFACT_DIR, "test_tamhop_modal_full.png")
        await modal.screenshot(path=p_modal)
        print("Captured Tam Hop Modal Top:", p_modal)

        # Cuộn modal xuống phần giữa (Vòng Trường Sinh, Bát Sát, Hoàng Tuyền)
        await page.evaluate("() => { const m = document.querySelector('.tamhop-modal-dialog'); if (m) m.scrollTop = 420; }")
        await page.wait_for_timeout(300)
        p_modal_mid = os.path.join(ARTIFACT_DIR, "test_tamhop_modal_truong_sinh.png")
        await modal.screenshot(path=p_modal_mid)
        print("Captured Tam Hop Modal Mid (Truong Sinh & Sat Khi):", p_modal_mid)

        # Cuộn modal xuống đáy (120 Phân Kim, Tam Cát, Action Buttons)
        await page.evaluate("() => { const m = document.querySelector('.tamhop-modal-dialog'); if (m) m.scrollTop = 1400; }")
        await page.wait_for_timeout(300)
        p_modal_bot = os.path.join(ARTIFACT_DIR, "test_tamhop_modal_actions.png")
        await modal.screenshot(path=p_modal_bot)
        print("Captured Tam Hop Modal Bottom (Phan Kim, Tam Cat & Actions):", p_modal_bot)

        # 4. Kiểm tra nút "🎯 Đặt La Kinh Về ...°"
        await page.evaluate("""() => {
            const btnApply = document.getElementById('th-btn-apply-compass');
            if (btnApply) btnApply.click();
        }""")
        await page.wait_for_timeout(600)
        p_lakinh_applied = os.path.join(ARTIFACT_DIR, "test_lakinh_applied_from_modal.png")
        await page.screenshot(path=p_lakinh_applied)
        print("Captured La Kinh after applying compass heading:", p_lakinh_applied)

        await b.close()

if __name__ == "__main__":
    asyncio.run(test_tam_hop_ui())
