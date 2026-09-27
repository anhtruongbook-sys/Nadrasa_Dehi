import asyncio
import base64
import sys
from io import BytesIO
from PIL import Image, ImageDraw
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

def create_sample_floor_plan():
    img = Image.new('RGBA', (400, 300), (248, 250, 252, 235))
    draw = ImageDraw.Draw(img)
    draw.rectangle([20, 20, 380, 280], outline=(30, 41, 59, 255), width=4)
    draw.line([(200, 20), (200, 280)], fill=(30, 41, 59, 255), width=3)
    draw.rectangle([170, 276, 230, 284], fill=(239, 68, 68, 255))
    draw.ellipse([195, 145, 205, 155], fill=(234, 179, 8, 255), outline=(0,0,0,255))
    draw.text((60, 70), "PHONG KHACH", fill=(71, 85, 105, 255))
    buf = BytesIO()
    img.convert('RGB').save(buf, format='JPEG', quality=85)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode('utf-8')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 360, 'height': 780})
        await page.goto('http://127.0.0.1:8090/index.html')
        await page.wait_for_timeout(600)

        # Switch to La Kinh
        await page.click('#deck-selector-trigger')
        await page.wait_for_timeout(300)
        await page.click('#tab-mode-lakinh')
        await page.wait_for_timeout(1000)

        # Check initial status in bottom sheet
        await page.click('#lakinh-btn-plan-quick')
        await page.wait_for_timeout(300)
        status_before = await page.inner_text('#sheet-val-plan-status')
        print(f"Status before upload: {status_before}")

        # Simulate native photo received from Android Kotlin NativeBridge
        sample_b64 = create_sample_floor_plan()
        await page.evaluate('''(b64) => {
            if (typeof window._onNativeFloorPlanReceived === 'function') {
                window._onNativeFloorPlanReceived(JSON.stringify([b64]));
            }
        }''', sample_b64)
        await page.wait_for_timeout(1000)

        # Check status after upload
        status_after = await page.inner_text('#sheet-val-plan-status')
        print(f"Status after native floor plan received: {status_after}")

        img_src = await page.get_attribute('#lakinh-floorplan-img', 'src')
        img_display = await page.evaluate('() => document.getElementById("lakinh-floorplan-img").style.display')
        print(f"Image src set: {bool(img_src and len(img_src) > 50)}")
        print(f"Image display style: {img_display}")

        controls_display = await page.evaluate('() => document.getElementById("lakinh-plan-controls-wrap").style.display')
        print(f"Controls wrap display: {controls_display}")

        assert status_after == 'Đã nạp bản vẽ', f"Expected 'Đã nạp bản vẽ', got '{status_after}'"
        assert img_display == 'block', "Image is not displayed"
        assert controls_display == 'block', "Controls wrap is not displayed"

        print("TEST PASSED: Native floor plan callback received and rendered successfully!")
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
