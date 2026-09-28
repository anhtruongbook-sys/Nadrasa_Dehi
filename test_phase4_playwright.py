import asyncio
import os
import sys
from playwright.async_api import async_playwright

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612"

async def run_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 430, 'height': 932}) # iPhone 15 Pro Max
        page = await context.new_page()

        errors = []
        page.on("pageerror", lambda err: errors.append(f"PAGE ERROR: {err}"))
        page.on("console", lambda msg: errors.append(f"CONSOLE ERROR: {msg.text}") if msg.type == "error" else None)

        print("1. Loading http://localhost:8090/index.html...")
        await page.goto("http://localhost:8090/index.html", wait_until="networkidle")
        await page.wait_for_timeout(1000)

        # 2. Kiểm tra Engine Joey Yap Kỳ Môn
        print("2. Verifying JoeyYapQMDJEngine methods...")
        engine_eval = await page.evaluate("""() => {
            if (!window.JoeyYapQMDJEngine) return { ok: false, msg: 'JoeyYapQMDJEngine not found' };
            const engine = window.JoeyYapQMDJEngine;
            
            // Test getSpiritualMeditationGuide
            const guide = engine.getSpiritualMeditationGuide(new Date());
            if (!guide || !guide.sectors || guide.sectors.length < 4) {
                return { ok: false, msg: 'getSpiritualMeditationGuide invalid' };
            }
            
            // Test computeDestinyQiMen
            const sampleBazi = {
                solarDate: new Date(1990, 5, 15, 10, 30),
                tuTru: {
                    year: { can: 'Canh', chi: 'Ngọ' },
                    month: { can: 'Nhâm', chi: 'Ngọ' },
                    day: { can: 'Bính', chi: 'Dần' },
                    hour: { can: 'Quý', chi: 'Tỵ' }
                }
            };
            const destiny = engine.computeDestinyQiMen(sampleBazi);
            if (!destiny || !destiny.life_palace) {
                return { ok: false, msg: 'computeDestinyQiMen invalid' };
            }
            
            return {
                ok: true,
                guideCount: guide.sectors.length,
                lifePalaceName: destiny.life_palace.palace_name,
                lifeDeity: destiny.life_palace.deity,
                lifeStar: destiny.life_palace.star,
                lifeDoor: destiny.life_palace.door
            };
        }""")
        print("Engine verification result:", engine_eval)
        assert engine_eval["ok"], f"Engine verification failed: {engine_eval}"

        # 3. Kiểm tra Tab Bát Tự (view-bazi) & Thẻ Kỳ Môn Bản Mệnh
        print("3. Switching to Bazi view...")
        await page.evaluate("""() => {
            if (window.switchAppMode) {
                window.switchAppMode('bazi');
            } else {
                const btn = document.getElementById('tab-mode-bazi');
                if (btn) btn.click();
            }
        }""")
        await page.wait_for_timeout(1000)

        # Kiểm tra sự hiện diện của #bazi-qmdj-card
        qmdj_card = await page.wait_for_selector("#bazi-qmdj-card", timeout=5000)
        assert qmdj_card is not None, "Thẻ #bazi-qmdj-card không xuất hiện trong Bát Tự!"

        # Chụp ảnh Dark mode Bát Tự
        bazi_dark_shot = os.path.join(ARTIFACT_DIR, "test_phase4_bazi_qmdj_dark.png")
        await page.screenshot(path=bazi_dark_shot, full_page=False)
        print(f"Captured: {bazi_dark_shot}")

        # Chuyển Light mode và chụp ảnh
        await page.evaluate("() => document.body.classList.add('theme-light')")
        await page.wait_for_timeout(500)
        bazi_light_shot = os.path.join(ARTIFACT_DIR, "test_phase4_bazi_qmdj_light.png")
        await page.screenshot(path=bazi_light_shot, full_page=False)
        print(f"Captured: {bazi_light_shot}")
        await page.evaluate("() => document.body.classList.remove('theme-light')")

        # 4. Kiểm tra nút mở La Kinh từ Bát Tự
        print("4. Testing btn-bazi-open-lakinh click...")
        await page.click("#btn-bazi-open-lakinh")
        await page.wait_for_timeout(1000)
        lakinh_visible = await page.is_visible("#view-lakinh")
        print(f"La Kinh view visible after click from Bazi: {lakinh_visible}")
        assert lakinh_visible, "Bấm nút La Kinh từ Bát Tự không mở view La Kinh!"

        # 5. Kiểm tra Tab Pháp Hành (view-phaphanh) & Widget Tọa Thiền
        print("5. Switching to Phap Hanh view...")
        await page.evaluate("""() => {
            if (window.switchAppMode) {
                window.switchAppMode('phaphanh');
            } else {
                const btn = document.getElementById('tab-mode-phaphanh');
                if (btn) btn.click();
            }
        }""")
        await page.wait_for_timeout(1000)

        # Kiểm tra widget thiền định
        meditation_widget = await page.wait_for_selector("#ph-meditation-widget .ph-meditation-card", timeout=5000)
        assert meditation_widget is not None, "Widget Tọa Thiền Kỳ Môn không xuất hiện trong Pháp Hành!"

        # Chụp ảnh Dark mode Pháp Hành
        ph_dark_shot = os.path.join(ARTIFACT_DIR, "test_phase4_phaphanh_meditation_dark.png")
        await page.screenshot(path=ph_dark_shot, full_page=False)
        print(f"Captured: {ph_dark_shot}")

        # Chuyển Light mode và chụp ảnh
        await page.evaluate("() => document.body.classList.add('theme-light')")
        await page.wait_for_timeout(500)
        ph_light_shot = os.path.join(ARTIFACT_DIR, "test_phase4_phaphanh_meditation_light.png")
        await page.screenshot(path=ph_light_shot, full_page=False)
        print(f"Captured: {ph_light_shot}")
        await page.evaluate("() => document.body.classList.remove('theme-light')")

        # 6. Kiểm tra Toggle Collapse / Expand của Widget Tọa Thiền
        print("6. Testing toggle collapse on meditation widget...")
        toggle_btn = await page.wait_for_selector("#btn-ph-mc-toggle")
        await toggle_btn.click()
        await page.wait_for_timeout(500)
        body_hidden = await page.is_hidden("#ph-mc-body")
        print(f"Meditation body hidden after collapse: {body_hidden}")
        assert body_hidden, "Bấm toggle thu gọn nhưng body vẫn hiển thị!"

        # Mở rộng lại
        await toggle_btn.click()
        await page.wait_for_timeout(500)
        body_shown = await page.is_visible("#ph-mc-body")
        print(f"Meditation body visible after expand: {body_shown}")
        assert body_shown, "Bấm toggle mở rộng nhưng body không hiển thị!"

        # 7. Kiểm tra nút mở La Kinh từ Pháp Hành
        print("7. Testing btn-ph-open-lakinh click...")
        await page.click("#btn-ph-open-lakinh")
        await page.wait_for_timeout(1000)
        lakinh_from_ph = await page.is_visible("#view-lakinh")
        print(f"La Kinh view visible after click from Phap Hanh: {lakinh_from_ph}")
        assert lakinh_from_ph, "Bấm nút La Kinh từ Pháp Hành không mở view La Kinh!"

        print("=== TEST SUMMARY ===")
        print(f"Total Console/Page Errors: {len(errors)}")
        for err in errors:
            print("  ", err)

        await browser.close()
        print("ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(run_test())
