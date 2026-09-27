import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 360, 'height': 780})
        
        # Listen for console messages and page errors
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        page.on("console", lambda msg: print(f"[Browser Console] {msg.type}: {msg.text}") if msg.type in ['error', 'warn'] else None)

        await page.goto('http://127.0.0.1:8090/index.html')
        await page.wait_for_timeout(600)

        # Switch to La Kinh mode
        await page.click('#deck-selector-trigger')
        await page.wait_for_timeout(300)
        await page.click('#tab-mode-lakinh')
        await page.wait_for_timeout(800)

        # 1. Simulate Native Bridge call
        result = await page.evaluate('''() => {
            // Emulate NativeBridge exists like in mobile app
            window.NativeBridge = {
                postMessage: function(msg) {
                    window._lastNativeMsg = msg;
                }
            };

            const dockSensor = document.getElementById('lakinh-dock-sensor');
            if (dockSensor) dockSensor.click();

            // Simulate incoming hardware compass heading: 128.4 degrees (Sơn Tốn)
            if (typeof window._onNativeCompassHeading === 'function') {
                window._onNativeCompassHeading(128.4, 3);
            }

            const disc = document.getElementById('lakinh-disc');
            const pillDeg = document.getElementById('hud-pill-deg');
            const pillSon = document.getElementById('hud-pill-son');
            const detailToaHuong = document.getElementById('hud-detail-toa-huong');

            return {
                lastNativeMsg: window._lastNativeMsg,
                discTransform: disc ? disc.style.transform : null,
                pillDeg: pillDeg ? pillDeg.textContent : null,
                pillSon: pillSon ? pillSon.textContent : null,
                detailToaHuong: detailToaHuong ? detailToaHuong.textContent : null
            };
        }''')
        print("Test Native Bridge Compass Result:", result)
        assert result['lastNativeMsg'] == '{"action":"startCompass"}', "NativeBridge did not receive startCompass!"
        assert result['pillDeg'] == '128.4°', f"pillDeg expected 128.4° but got {result['pillDeg']}"
        assert 'Tốn' in result['pillSon'], f"pillSon expected Sơn Tốn but got {result['pillSon']}"
        assert '128.4°' in result['detailToaHuong'], f"detailToaHuong expected 128.4° but got {result['detailToaHuong']}"

        # 2. Test Stop Compass
        stopResult = await page.evaluate('''() => {
            const dockSensor = document.getElementById('lakinh-dock-sensor');
            if (dockSensor) dockSensor.click();
            return window._lastNativeMsg;
        }''')
        print("Test Stop Compass Result:", stopResult)
        assert stopResult == '{"action":"stopCompass"}', "NativeBridge did not receive stopCompass!"

        assert len(errors) == 0, f"Page had errors: {errors}"
        print("ALL COMPASS TESTS PASSED 100%!")
        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
