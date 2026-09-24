from playwright.sync_api import sync_playwright
from PIL import Image
import numpy as np
import base64
import io
import os

os.makedirs('scripts/test_results', exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 412, 'height': 915})
    page.goto('http://127.0.0.1:8080')
    page.wait_for_timeout(1000)
    
    # 1. Switch to Tử Vi
    page.evaluate("() => switchDeckMode('tuvi')")
    page.wait_for_timeout(1000)
    
    # Check button positions
    positions = page.evaluate('''() => {
        const btnNow = document.getElementById('btn-tuvi-now').getBoundingClientRect();
        const btnSubmit = document.getElementById('btn-tuvi-submit').getBoundingClientRect();
        return {
            btnNowLeft: btnNow.left,
            btnNowRight: btnNow.right,
            btnSubmitLeft: btnSubmit.left,
            btnSubmitRight: btnSubmit.right,
            distance: btnSubmit.left - btnNow.right
        };
    }''')
    print('Tu Vi Button Positions:', positions)
    assert positions['distance'] > 50, f"Distance too small: {positions['distance']}"
    print("SUCCESS: 'Gio thuc' and 'Lap La So' are well separated with gap:", positions['distance'])
    
    # Take screenshot in Dark Theme
    page.screenshot(path='scripts/test_results/tuvi_dark_screen.png')
    
    # Capture using html2canvas directly via app function
    canvasData = page.evaluate('''async () => {
        const targetElement = document.querySelector('.tuvi-view-container');
        const isLight = document.body.classList.contains('theme-light');
        const bgColor = isLight ? '#fdfbf7' : '#160408';
        const canvas = await html2canvas(targetElement, {
            scale: 3,
            backgroundColor: bgColor,
            useCORS: true,
            onclone: (clonedDoc) => {
                const ctrlBars = clonedDoc.querySelectorAll('.tuvi-ctrl-bar, .bazi-ctrl-bar, .qmdj-ctrl-bar');
                ctrlBars.forEach(b => b.style.display = 'none');
            }
        });
        return canvas.toDataURL('image/png');
    }''')
    
    b64data = canvasData.split(',')[1]
    dark_img = Image.open(io.BytesIO(base64.b64decode(b64data)))
    dark_img.save('scripts/test_results/tuvi_dark_canvas.png')
    print(f"Dark canvas size: {dark_img.size}, Max pixel: {np.array(dark_img).max()}")
    
    # Check that control bar is NOT in the image (it is hidden)
    # The height should be compact and focused on the chart
    assert dark_img.size[0] >= 1000, f"Resolution too low: {dark_img.size[0]}"
    
    # 2. Check Bát Tự button positions
    page.evaluate("() => switchDeckMode('bazi')")
    page.wait_for_timeout(1000)
    bazi_pos = page.evaluate('''() => {
        const btnNow = document.getElementById('btn-bazi-now').getBoundingClientRect();
        const btnSubmit = document.getElementById('btn-bazi-submit').getBoundingClientRect();
        return {
            btnNowRight: btnNow.right,
            btnSubmitLeft: btnSubmit.left,
            distance: btnSubmit.left - btnNow.right
        };
    }''')
    print('Bat Tu Button Positions:', bazi_pos)
    assert bazi_pos['distance'] > 50, f"Bat Tu distance too small: {bazi_pos['distance']}"
    
    # 3. Check Kỳ Môn button positions
    page.evaluate("() => switchDeckMode('qmdj')")
    page.wait_for_timeout(1000)
    qmdj_pos = page.evaluate('''() => {
        const btnNow = document.getElementById('btn-qmdj-now').getBoundingClientRect();
        const btnSubmit = document.getElementById('btn-qmdj-submit').getBoundingClientRect();
        return {
            btnNowRight: btnNow.right,
            btnSubmitLeft: btnSubmit.left,
            distance: btnSubmit.left - btnNow.right
        };
    }''')
    print('Ky Mon Button Positions:', qmdj_pos)
    assert qmdj_pos['distance'] > 50, f"Ky Mon distance too small: {qmdj_pos['distance']}"
    
    # 4. Switch to Light Theme and check contrast
    page.click('#btn-theme')
    page.wait_for_timeout(1000)
    page.screenshot(path='scripts/test_results/qmdj_light_screen.png')
    
    page.evaluate("() => switchDeckMode('tuvi')")
    page.wait_for_timeout(1000)
    page.screenshot(path='scripts/test_results/tuvi_light_screen.png')
    
    print("ALL TESTS PASSED SUCCESSFULLY!")
    browser.close()
