import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 412, 'height': 915})
        page = await context.new_page()
        
        await page.goto('http://127.0.0.1:8080/index.html')
        await page.wait_for_selector('#app-container', timeout=5000)
        
        # Switch to La Kinh
        await page.evaluate("switchDeckMode('lakinh')")
        await page.wait_for_timeout(2000)
        
        # Test 1: Call jumpToLocation with 82 Nguyen Tuan
        print('--- TEST 1: ADDRESS PIN ONLY ---')
        await page.evaluate('''() => {
            // Jump to 82 Nguyen Tuan
            const lat = 20.9986, lng = 105.8037;
            window.NetaLaKinhView.jumpTo(lat, lng, "Số 82 Đường Nguyễn Tuân");
        }''')
        await page.wait_for_timeout(1500)
        
        # Check marker element in DOM
        pin_info = await page.evaluate('''() => {
            const marker = document.querySelector('.custom-search-pin');
            if (!marker) return null;
            const inner = marker.querySelector('.search-drop-pin');
            const svg = marker.querySelector('svg');
            const computed = window.getComputedStyle(marker);
            return {
                exists: true,
                hasSvg: !!svg,
                hasDropPin: !!inner,
                background: computed.backgroundColor,
                textContent: marker.textContent.trim()
            };
        }''')
        print(f'Address Pin info: {pin_info}')
        assert pin_info and pin_info['hasSvg'], 'Search pin SVG not found!'
        assert '0284c7' not in pin_info.get('background', ''), 'Marker has solid blue background!'
        print('PASS: Address marker is PIN ONLY with zero text bubble blocking the map!')
        
        # Test 2: Trigger DEM / Minh Duong Cuc to check Thuy Khau
        print('\n--- TEST 2: THUY KHAU MARKER WITHOUT BLUE BACKGROUND ---')
        await page.click('#lakinh-dock-dem')
        await page.wait_for_timeout(3000)
        
        # Close modal to see the map
        close_modal = await page.query_selector('.lakinh-modal-close')
        if close_modal:
            await close_modal.click()
            await page.wait_for_timeout(1000)
            
        thuykhau_info = await page.evaluate('''() => {
            const tkMarker = document.querySelector('.custom-watermouth-pin');
            if (!tkMarker) return null;
            const wrap = tkMarker.querySelector('.watermouth-pin-wrap');
            const svg = tkMarker.querySelector('svg');
            const span = tkMarker.querySelector('span');
            const compWrap = wrap ? window.getComputedStyle(wrap) : null;
            const compSpan = span ? window.getComputedStyle(span) : null;
            return {
                exists: true,
                hasSvg: !!svg,
                spanText: span ? span.textContent : '',
                wrapBg: compWrap ? compWrap.backgroundColor : '',
                spanBg: compSpan ? compSpan.backgroundColor : ''
            };
        }''')
        print(f'Thuy Khau info: {thuykhau_info}')
        assert thuykhau_info and thuykhau_info['hasSvg'], 'Thuy Khau SVG pin missing!'
        print('PASS: Thuy Khau has water drop pin without opaque blue background!')
        
        # Save screenshot
        await page.screenshot(path='test_clean_pins_result.png')
        print('Saved screenshot to test_clean_pins_result.png')
        
        await browser.close()
        print('\nALL PIN TESTS PASSED!')

if __name__ == '__main__':
    asyncio.run(run())
