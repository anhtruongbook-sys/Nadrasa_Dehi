from playwright.sync_api import sync_playwright
import base64
from PIL import Image
import io, numpy as np

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 412, 'height': 915})
    page.goto('http://127.0.0.1:8080')
    page.wait_for_timeout(1000)
    page.evaluate("() => switchDeckMode('tuvi')")
    page.wait_for_timeout(1000)
    
    info = page.evaluate('''() => {
        const el = document.querySelector('.tuvi-view-container');
        const title = document.querySelector('.tc-title');
        const cell = document.querySelector('.tuvi-cell');
        const cTitle = window.getComputedStyle(title);
        const cEl = window.getComputedStyle(el);
        return {
            containerOpacity: cEl.opacity,
            containerFilter: cEl.filter,
            titleColor: cTitle.color,
            titleOpacity: cTitle.opacity,
            cellBg: window.getComputedStyle(cell).backgroundColor,
            bodyBg: window.getComputedStyle(document.body).backgroundColor
        };
    }''')
    print('DOM styles:', info)
    
    # Trigger the real screenshot button in the app!
    page.click('#btn-screenshot-header')
    page.wait_for_timeout(2000)
    
    # Also evaluate html2canvas directly
    canvasData = page.evaluate('''async () => {
        const el = document.querySelector('.tuvi-view-container');
        const canvas = await html2canvas(el, {
            scale: 2,
            backgroundColor: '#120104'
        });
        return canvas.toDataURL('image/png');
    }''')
    
    b64data = canvasData.split(',')[1]
    img = Image.open(io.BytesIO(base64.b64decode(b64data)))
    print('Canvas size:', img.size)
    arr = np.array(img)
    print('Canvas max pixel:', arr.max())
    print('Canvas mean pixel:', arr.mean())
    
    img.save('scripts/test_canvas_output.png')
    
    # Also take direct page screenshot for comparison
    page.screenshot(path='scripts/test_page_screenshot.png')
    page_img = Image.open('scripts/test_page_screenshot.png')
    page_arr = np.array(page_img)
    print('Page screenshot max pixel:', page_arr.max())
    print('Page screenshot mean pixel:', page_arr.mean())

    browser.close()
    print("Done debug_screenshot.py")
