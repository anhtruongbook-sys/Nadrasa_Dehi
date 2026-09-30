import asyncio
import re
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Navigate to local server
        await page.goto("http://localhost:8090", wait_until="networkidle")
        await page.wait_for_timeout(1000)

        # Switch to Bazi mode using window.switchAppMode
        await page.evaluate("() => window.switchAppMode && window.switchAppMode('bazi')")
        await page.wait_for_timeout(1500)
        print("Switched to Bazi mode")

        # 1. Check main Bazi chart view
        bazi_view = await page.query_selector('#view-bazi')
        text_bazi_chart = await bazi_view.inner_text() if bazi_view else await page.inner_text("body")
        has_napam_chart = bool(re.search(r"Nạp Âm", text_bazi_chart, re.IGNORECASE))
        print("CHECK 1 - Main Bazi Chart View has 'Nạp Âm':", has_napam_chart)

        # 2. Switch to "📜 Luận Giải" mode
        analysis_btn = await page.query_selector('#btn-bazi-mode-analysis')
        if analysis_btn:
            await analysis_btn.click()
            await page.wait_for_timeout(1500)
            print("Switched to '📜 Luận Giải' mode")
            
            # Check Master Assessment Dashboard in Analysis mode
            master_card = await page.query_selector('#bazi-card-master-assessment')
            if master_card:
                master_text = await master_card.inner_text()
                has_napam_master = bool(re.search(r"Nạp Âm", master_text, re.IGNORECASE))
                print("CHECK 2 - Master Assessment Card has 'Nạp Âm':", has_napam_master)
                print("--- Master Card Excerpt ---")
                print(master_text[:250].strip())
            else:
                print("Master card not found")

            # 3. Switch to "Toàn Văn Báo Cáo Chuyên Sâu" subtab
            report_tab_btn = await page.query_selector('#btn-bazi-tab-full-report')
            if report_tab_btn:
                await report_tab_btn.click()
                await page.wait_for_timeout(1500)
                print("Switched to 'Toàn Văn Báo Cáo Chuyên Sâu' subtab")
                
                report_content = await page.query_selector('.bazi-full-report-content')
                if report_content:
                    rep_text = await report_content.inner_text()
                    has_napam_report = bool(re.search(r"Nạp Âm", rep_text, re.IGNORECASE))
                    has_thien_ha_thuy = bool(re.search(r"Thiên Hà Thủy", rep_text, re.IGNORECASE))
                    has_thien_thuong_hoa = bool(re.search(r"Thiên Thượng Hỏa", rep_text, re.IGNORECASE))
                    print("CHECK 3 - Bazi Full Report has 'Nạp Âm':", has_napam_report)
                    print("CHECK 3 - Bazi Full Report has 'Thiên Hà Thủy':", has_thien_ha_thuy)
                    print("CHECK 3 - Bazi Full Report has 'Thiên Thượng Hỏa':", has_thien_thuong_hoa)
                    
                    pos = rep_text.find("Cấu Trúc Bốn Cột Mệnh")
                    if pos != -1:
                        print("\n--- Excerpt of Part I in Report ---")
                        print(rep_text[pos:pos+450].strip())
                else:
                    print("Report content .bazi-full-report-content not found")
            else:
                print("Button #btn-bazi-tab-full-report not found")
        else:
            print("Analysis button #btn-bazi-mode-analysis not found")

        await page.screenshot(path="verify_bazi_no_napam.png")
        print("\nScreenshot saved to verify_bazi_no_napam.png")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
