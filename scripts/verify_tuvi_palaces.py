import asyncio
import os
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

SCREENSHOT_DIR = r"C:\Books\Neta Light\scripts\test_results"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 412, 'height': 915},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True
        )
        page = await context.new_page()

        print("1. Loading http://127.0.0.1:8080...")
        await page.goto("http://127.0.0.1:8080", wait_until="networkidle")
        await asyncio.sleep(0.5)

        # Evaluate NetaTuViEngine directly for 13/12/1979 01:30 Nam
        print("2. Verifying Engine calculation for 13/12/1979 01:30 Nam...")
        eval_result = await page.evaluate("""() => {
            const chart = window.NetaTuViEngine.generateTuViChart({
                day: 13, month: 12, year: 1979, hour: 1, isMale: true, viewYear: 1979
            });

            return {
                meta: chart.meta,
                palaces: chart.palaces.map(p => ({
                    index: p.index,
                    zhi: p.zhi,
                    gan: p.gan,
                    canChi: p.canChi,
                    name: p.name,
                    isMenh: p.isMenh,
                    isThan: p.isThan,
                    daiHan: p.daiHan,
                    mainStars: p.mainStars.map(s => s.fullName)
                }))
            };
        }""")

        meta = eval_result["meta"]
        palaces = eval_result["palaces"]
        palace_by_index = {p["index"]: p for p in palaces}

        print(f"Lunar Date: {meta['lunarDay']}/{meta['lunarMonth']} năm {meta['yearGan']} {meta['yearZhi']}")
        print(f"Bản Mệnh: {meta['napAm']}")
        print(f"Cục: {meta['cucName']}")
        print(f"Đương Số: {meta['amDuongNamNu']}")
        print(f"Mệnh Can Chi: {meta['menhCanChi']} (Cung {meta['menhIdx']} - Tuất)")

        # Assertions
        assert meta["lunarMonth"] == 10, f"Expected Lunar Month 10, got {meta['lunarMonth']}"
        assert meta["lunarDay"] == 24, f"Expected Lunar Day 24, got {meta['lunarDay']}"
        assert meta["menhIdx"] == 10, f"Expected Mệnh at Tuất (10), got {meta['menhIdx']}"
        assert meta["thanIdx"] == 0, f"Expected Thân at Tý (0), got {meta['thanIdx']}"
        assert meta["amDuongNamNu"] == "Âm Nam", f"Expected Âm Nam, got {meta['amDuongNamNu']}"
        assert meta["cucName"] == "Hỏa Lục Cục", f"Expected Hỏa Lục Cục, got {meta['cucName']}"
        assert meta["napAm"] == "Thiên Thượng Hỏa", f"Expected Thiên Thượng Hỏa, got {meta['napAm']}"

        # 12 functional palaces CLOCKWISE from Mệnh (10 - Tuất):
        # Mệnh (Tuất 10) -> Phụ Mẫu (Hợi 11) -> Phúc Đức (Tý 0) -> Điền Trạch (Sửu 1) ->
        # Quan Lộc (Dần 2) -> Nô Bộc (Mão 3) -> Thiên Di (Thìn 4) -> Tật Ách (Tỵ 5) ->
        # Tài Bạch (Ngọ 6) -> Tử Tức (Mùi 7) -> Phu Thê (Thân 8) -> Huynh Đệ (Dậu 9)
        expected = {
            10: {"name": "Mệnh", "canChi": "Giáp Tuất", "isMenh": True, "isThan": False, "daiHan": 6},
            11: {"name": "Phụ Mẫu", "canChi": "Ất Hợi", "isMenh": False, "isThan": False, "daiHan": 116},
            0:  {"name": "Phúc Đức", "canChi": "Bính Tý", "isMenh": False, "isThan": True, "daiHan": 106},
            1:  {"name": "Điền Trạch", "canChi": "Đinh Sửu", "isMenh": False, "isThan": False, "daiHan": 96},
            2:  {"name": "Quan Lộc", "canChi": "Bính Dần", "isMenh": False, "isThan": False, "daiHan": 86},
            3:  {"name": "Nô Bộc", "canChi": "Đinh Mão", "isMenh": False, "isThan": False, "daiHan": 76},
            4:  {"name": "Thiên Di", "canChi": "Mậu Thìn", "isMenh": False, "isThan": False, "daiHan": 66},
            5:  {"name": "Tật Ách", "canChi": "Kỷ Tỵ", "isMenh": False, "isThan": False, "daiHan": 56},
            6:  {"name": "Tài Bạch", "canChi": "Canh Ngọ", "isMenh": False, "isThan": False, "daiHan": 46},
            7:  {"name": "Tử Tức", "canChi": "Tân Mùi", "isMenh": False, "isThan": False, "daiHan": 36},
            8:  {"name": "Phu Thê", "canChi": "Nhâm Thân", "isMenh": False, "isThan": False, "daiHan": 26},
            9:  {"name": "Huynh Đệ", "canChi": "Quý Dậu", "isMenh": False, "isThan": False, "daiHan": 16},
        }

        print("\n--- PALACE VERIFICATION TABLE (AN THUẬN KIM ĐỒNG HỒ) ---")
        for idx in range(12):
            p = palace_by_index[idx]
            exp = expected[idx]
            print(f"Chi {p['zhi']} ({idx}): {p['name']} | {p['canChi']} | ĐH: {p['daiHan']} | Menh: {p['isMenh']} | Than: {p['isThan']}")
            assert p["name"] == exp["name"], f"At {p['zhi']} ({idx}): expected name {exp['name']}, got {p['name']}"
            assert p["canChi"] == exp["canChi"], f"At {p['zhi']} ({idx}): expected canChi {exp['canChi']}, got {p['canChi']}"
            assert p["isMenh"] == exp["isMenh"], f"At {p['zhi']} ({idx}): expected isMenh {exp['isMenh']}, got {p['isMenh']}"
            assert p["isThan"] == exp["isThan"], f"At {p['zhi']} ({idx}): expected isThan {exp['isThan']}, got {p['isThan']}"
            assert p["daiHan"] == exp["daiHan"], f"At {p['zhi']} ({idx}): expected daiHan {exp['daiHan']}, got {p['daiHan']}"

        print("\nAll 12 Palaces verified clockwise 100%!")

        # 3. Test UI rendering with inputs
        print("\n3. Testing UI rendering with 13/12/1979 01:30...")
        # Switch to Tu Vi mode
        await page.click("#deck-selector-trigger")
        await asyncio.sleep(0.3)
        await page.click("#tab-mode-tuvi")
        await asyncio.sleep(0.5)

        # Fill date inputs
        await page.fill("#tuvi-input-day", "13")
        await page.fill("#tuvi-input-month", "12")
        await page.fill("#tuvi-input-year", "1979")
        await page.fill("#tuvi-input-hour", "1")
        await page.fill("#tuvi-input-minute", "30")

        # Trigger submit
        await page.click("#btn-tuvi-submit")
        await asyncio.sleep(0.6)

        # Check Center box
        center_text = await page.inner_text(".tuvi-center-box")
        print("\nCenter Box Content:\n", center_text)
        assert "24/10 năm Kỷ Mùi" in center_text, f"Center box should show 24/10 năm Kỷ Mùi, got {center_text}"
        assert "Giáp Tuất" in center_text, f"Center box should show Cung Mệnh: Giáp Tuất"
        assert "Thân cư:\nPhúc Đức (Bính Tý)" in center_text or "Phúc Đức (Bính Tý)" in center_text, "Center box should show Thân cư: Phúc Đức (Bính Tý)"
        assert "Âm Nam" in center_text, "Center box should show Âm Nam"

        # Check Master strip
        master_strip = await page.inner_text(".tuvi-master-strip")
        print("\nMaster Strip Content:\n", master_strip)
        assert "Âm Nam" in master_strip
        assert "Thân cư Phúc Đức" in master_strip

        # Take screenshot
        shot_path = os.path.join(SCREENSHOT_DIR, "tuvi_1979_clockwise_verified.png")
        await page.screenshot(path=shot_path, full_page=True)
        print(f"\nSaved full screenshot to {shot_path}")

        await browser.close()
        print("\n=== VERIFICATION FINISHED SUCCESSFULLY ===")

if __name__ == "__main__":
    asyncio.run(verify())
