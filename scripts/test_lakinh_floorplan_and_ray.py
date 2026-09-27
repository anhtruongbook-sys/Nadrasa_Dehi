import asyncio
import base64
import sys
from io import BytesIO
from PIL import Image, ImageDraw
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

def create_sample_floor_plan():
    # Create a 400x300 sample house floor plan
    img = Image.new('RGBA', (400, 300), (248, 250, 252, 235))
    draw = ImageDraw.Draw(img)
    # Outer walls
    draw.rectangle([20, 20, 380, 280], outline=(30, 41, 59, 255), width=4)
    # Rooms
    draw.line([(200, 20), (200, 280)], fill=(30, 41, 59, 255), width=3) # Main dividing wall
    draw.line([(20, 150), (200, 150)], fill=(30, 41, 59, 255), width=2) # Living / Bed 1
    draw.line([(200, 170), (380, 170)], fill=(30, 41, 59, 255), width=2) # Bed 2 / Kitchen
    # Front door (Cửa Chính) at bottom
    draw.rectangle([170, 276, 230, 284], fill=(239, 68, 68, 255))
    # Center mark (Tim nhà)
    draw.ellipse([195, 145, 205, 155], fill=(234, 179, 8, 255), outline=(0,0,0,255))
    # Text labels
    draw.text((60, 70), "PHONG KHACH", fill=(71, 85, 105, 255))
    draw.text((60, 200), "PHONG NGU 1", fill=(71, 85, 105, 255))
    draw.text((250, 70), "PHONG NGU 2", fill=(71, 85, 105, 255))
    draw.text((250, 210), "BEP / AN", fill=(71, 85, 105, 255))
    draw.text((172, 258), "CUA", fill=(220, 38, 38, 255))

    buf = BytesIO()
    img.save(buf, format='PNG')
    return 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode('utf-8')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 360, 'height': 780})
        await page.goto('http://127.0.0.1:8090/index.html')
        await page.wait_for_timeout(600)

        # 1. Switch to La Kinh mode
        await page.click('#deck-selector-trigger')
        await page.wait_for_timeout(300)
        await page.click('#tab-mode-lakinh')
        await page.wait_for_timeout(1000)

        # 2. Check elements
        plan_container = await page.query_selector('#lakinh-floorplan-container')
        ray_container = await page.query_selector('#lakinh-ray-container')
        print(f"Plan Container present: {plan_container is not None}")
        print(f"Ray Container present: {ray_container is not None}")

        # 3. Inject mock floor plan image
        data_url = create_sample_floor_plan()
        await page.evaluate('''(dataUrl) => {
            window.lakinhState.planImageSrc = dataUrl;
            window.lakinhState.planScale = 1.0;
            window.lakinhState.planOpacity = 0.85;
            window.lakinhState.planRotation = 0.0;
            window.lakinhState.planOffsetX = 0;
            window.lakinhState.planOffsetY = 0;
            window.lakinhState.bgOpacity = 0.15;
            window.NetaLaKinhView.updateRotation(0.0);
            window.NetaLaKinhView.updateFloorPlanTransform();
        }''', data_url)
        await page.wait_for_timeout(600)

        # 4. Turn on Sighting Ray
        await page.evaluate('''() => {
            window.lakinhState.isRayActive = true;
            window.lakinhState.rayAngle = 135.0; // Aim at 135° (Tốn / Đông Nam)
            window.lakinhState.rayDistance = 140;
            window.NetaLaKinhView.updateSightingRay();
        }''')
        await page.wait_for_timeout(600)

        # 5. Capture screenshot of Viewport (La Kinh + Floor Plan + Sighting Ray)
        out_path1 = r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\test_lakinh_floorplan_and_ray.png"
        await page.screenshot(path=out_path1)
        print(f"Saved full screen view: {out_path1}")

        # 6. Click to open bottom sheet and verify controls
        await page.click('#lakinh-dock-tools')
        await page.wait_for_timeout(600)

        # Measure dimensions & read values
        stats = await page.evaluate('''() => {
            const planImg = document.getElementById('lakinh-floorplan-img');
            const disc = document.getElementById('lakinh-disc');
            const rayHandle = document.getElementById('lakinh-ray-target-handle');
            const hudDeg = document.getElementById('ray-hud-deg');
            const sheetDeg = document.getElementById('sheet-val-ray-deg');
            
            const planRect = planImg ? planImg.getBoundingClientRect() : null;
            const discRect = disc ? disc.getBoundingClientRect() : null;
            
            let centerDiffX = null;
            let centerDiffY = null;
            if (planRect && discRect) {
                const planCx = planRect.left + planRect.width / 2;
                const planCy = planRect.top + planRect.height / 2;
                const discCx = discRect.left + discRect.width / 2;
                const discCy = discRect.top + discRect.height / 2;
                centerDiffX = Math.round(Math.abs(planCx - discCx) * 10) / 10;
                centerDiffY = Math.round(Math.abs(planCy - discCy) * 10) / 10;
            }

            return {
                centerDiffX: centerDiffX,
                centerDiffY: centerDiffY,
                rayAngle: window.lakinhState.rayAngle,
                hudDegText: hudDeg ? hudDeg.textContent : null,
                sheetDegText: sheetDeg ? sheetDeg.textContent : null,
                planImgVisible: planImg ? (planImg.style.display !== 'none' && planImg.width > 0) : false,
                planImgWidth: planImg ? planImg.width : 0,
                planImgHeight: planImg ? planImg.height : 0
            };
        }''')
        print(f"Validation Stats: {stats}")

        # 7. Capture screenshot with 60vh Bottom Sheet open
        out_path2 = r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\test_lakinh_sheet_with_controls.png"
        await page.screenshot(path=out_path2)
        print(f"Saved bottom sheet view: {out_path2}")

        # 8. Test aiming by clicking on screen (e.g. at 280, 450 - lower right quadrant)
        await page.click('#sheet-close-btn')
        await page.wait_for_timeout(400)
        # Click on floor plan to the right
        await page.mouse.click(280, 450)
        await page.wait_for_timeout(400)

        clicked_angle = await page.evaluate('window.lakinhState.rayAngle')
        print(f"Angle after clicking (280, 450): {clicked_angle}°")

        out_path3 = r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\test_lakinh_clicked_ray.png"
        await page.screenshot(path=out_path3)
        print(f"Saved clicked ray view: {out_path3}")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
