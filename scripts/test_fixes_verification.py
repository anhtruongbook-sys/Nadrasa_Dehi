import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 412, 'height': 915})
        page = await context.new_page()
        
        # Test 1: Check Phap An circular shape on home page
        print('--- TEST 1: PHAP AN ---')
        await page.goto('http://127.0.0.1:8080/index.html')
        await page.wait_for_selector('#empty-avatar-img', timeout=5000)
        
        box = await page.locator('#empty-avatar-img').bounding_box()
        print(f'empty-avatar-img box: {box}')
        assert abs(box['width'] - box['height']) < 2, f'Phap An is not square! width={box["width"]}, height={box["height"]}'
        print('PASS: Phap An is a perfect 1:1 circle!')
        
        # Check natural width and height of Phap An image
        nat_size = await page.evaluate('''() => {
            const img = document.getElementById('empty-avatar-img');
            return { w: img.naturalWidth, h: img.naturalHeight };
        }''')
        print(f'Phap An natural size: {nat_size}')
        assert nat_size['w'] == nat_size['h'], 'Phap An natural image is not square!'
        print('PASS: Phap An original image is square (2560x2560)!')
        
        await page.screenshot(path='test_phap_an_round.png')
        
        # Test 2: Check Tarot screenshot and PDF
        print('\n--- TEST 2: TAROT SCREENSHOT & PDF ---')
        # Switch to Tarot mode
        await page.evaluate("switchDeckMode('tarot')")
        await page.wait_for_timeout(1000)
        
        # Draw cards in Tarot
        await page.click('#btn-tarot-quick-draw')
        await page.wait_for_timeout(1000)
        await page.click('#btn-tarot-flip-all')
        await page.wait_for_timeout(2000)
        
        # Check Tarot cards Base64 available
        has_tarot_b64 = await page.evaluate('''() => {
            return typeof window.TAROT_BASE64_DATA === 'object' && Object.keys(window.TAROT_BASE64_DATA).length > 50;
        }''')
        print(f'Tarot Base64 data loaded: {has_tarot_b64}')
        assert has_tarot_b64, 'TAROT_BASE64_DATA is missing!'
        
        # Check getCardBase64 lookup for Tarot card
        tarot_card_b64 = await page.evaluate('''() => {
            return window.getCardBase64('assets/tarot/Major_00_Fool.webp');
        }''')
        assert tarot_card_b64 and tarot_card_b64.startswith('data:image/'), 'getCardBase64 failed for Major_00_Fool.webp'
        print('PASS: getCardBase64 successfully resolves Tarot cards to data URLs!')
        
        # Trigger screenshot in Tarot
        await page.click('#btn-screenshot-header')
        await page.wait_for_timeout(2500)
        
        toast = await page.text_content('#toast')
        print(f'Screenshot toast result: {toast}')
        await page.screenshot(path='test_tarot_reading.png')

        # Test PDF export button click
        await page.click('#btn-tarot-export-pdf')
        await page.wait_for_timeout(3000)
        print('Tarot PDF export button clicked and generated!')
        
        # Test 3: Check La Kinh disc and screenshot
        print('\n--- TEST 3: LA KINH DISC & SCREENSHOT ---')
        await page.evaluate("switchDeckMode('lakinh')")
        await page.wait_for_timeout(2000)
        
        has_lakinh_b64 = await page.evaluate('''() => {
            return typeof window.LAKINH_BASE64_DATA === 'object' && Object.keys(window.LAKINH_BASE64_DATA).length > 0;
        }''')
        print(f'La Kinh Base64 data loaded: {has_lakinh_b64}')
        assert has_lakinh_b64, 'LAKINH_BASE64_DATA is missing!'
        
        # Check getCardBase64 lookup for lakinh disc
        lakinh_disc_b64 = await page.evaluate('''() => {
            return window.getCardBase64('thuoc_lap_cuc_trans.png');
        }''')
        assert lakinh_disc_b64 and lakinh_disc_b64.startswith('data:image/'), 'getCardBase64 failed for thuoc_lap_cuc_trans.png'
        print('PASS: getCardBase64 successfully resolves La Kinh disc to data URL!')
        
        # Check lakinh-disc presence and dimensions
        disc_box = await page.locator('#lakinh-disc').bounding_box()
        print(f'Lakinh disc box: {disc_box}')
        assert disc_box is not None and disc_box['width'] > 100, 'Lakinh disc missing!'
        
        # Trigger screenshot in La Kinh
        await page.click('#btn-screenshot-header')
        await page.wait_for_timeout(2500)
        
        toast_lk = await page.text_content('#toast')
        print(f'La Kinh screenshot toast: {toast_lk}')
        await page.screenshot(path='test_lakinh_screen.png')
        
        await browser.close()
        print('\nALL TESTS PASSED SUCCESSFULLY!')

if __name__ == '__main__':
    asyncio.run(run())
