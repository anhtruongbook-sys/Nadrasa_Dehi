from playwright.sync_api import sync_playwright
import sys
import os

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    page.goto('http://127.0.0.1:8090/index.html')
    page.wait_for_timeout(1000)

    # 1. Check Lịch Vạn Niên -> Nhị Thập Bát Tú
    print("Testing Calendar: Nhị Thập Bát Tú...")
    page.evaluate("() => switchDeckMode('calendar')")
    page.wait_for_timeout(800)
    page.screenshot(path='C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_mansion_calendar.png')

    # Get the text of Nhị Thập Bát Tú
    mansion_text = page.evaluate("""() => {
        const el = document.querySelector('.meta-box:has(.meta-title)');
        const boxes = Array.from(document.querySelectorAll('.meta-box'));
        const mBox = boxes.find(b => b.innerText.includes('NHỊ THẬP BÁT TÚ'));
        return mBox ? mBox.innerText : 'NOT FOUND';
    }""")
    print("Mansion 28 info:", mansion_text)

    # 2. Check La Kinh -> Huyền Không Phi Tinh Vận 9
    print("Testing La Kinh: Huyền Không Phi Tinh...")
    page.evaluate("() => switchDeckMode('lakinh')")
    page.wait_for_timeout(1000)
    # Open Bottom Sheet or directly call openHuyenKhongModal
    page.evaluate("""() => {
        // Find bottom sheet toggle or trigger function directly
        const btnTools = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Công Cụ'));
        if (btnTools) btnTools.click();
    }""")
    page.wait_for_timeout(500)
    page.screenshot(path='C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_lakinh_tools_sheet.png')

    # Click HK button
    page.evaluate("""() => {
        const btnHK = document.getElementById('sheet-btn-huyenkhong');
        if (btnHK) btnHK.click();
    }""")
    page.wait_for_timeout(500)
    page.screenshot(path='C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_lakinh_huyenkhong_modal.png')

    # Click HKDQ button
    page.evaluate("""() => {
        const btnClose = document.querySelector('.lakinh-modal-close');
        if (btnClose) btnClose.click();
        const btnTools = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Công Cụ'));
        if (btnTools) btnTools.click();
    }""")
    page.wait_for_timeout(400)
    page.evaluate("""() => {
        const btnHKDQ = document.getElementById('sheet-btn-hkdq');
        if (btnHKDQ) btnHKDQ.click();
    }""")
    page.wait_for_timeout(500)
    page.screenshot(path='C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_lakinh_hkdq_modal.png')

    browser.close()
    print("TEST FINISHED SUCCESSFULLY!")
