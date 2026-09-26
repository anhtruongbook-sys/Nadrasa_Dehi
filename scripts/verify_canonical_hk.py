from playwright.sync_api import sync_playwright
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    page.goto('http://127.0.0.1:8090/index.html')
    page.wait_for_timeout(1000)

    page.evaluate("() => switchDeckMode('lakinh')")
    page.wait_for_timeout(1000)

    # Test 1: Hướng Bắc 2/3 (Tọa Ngọ Hướng Tý - 0.0°)
    print("Testing 10. Hướng Bắc 2/3 (0.0°)...")
    page.evaluate("""() => {
        window.NetaLaKinhView.updateRotation(0.0);
        window.NetaLaKinhView.openHuyenKhongModal(9, 0.0);
    }""")
    page.wait_for_timeout(600)
    page.screenshot(path='C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_poster_box_10_bac_2_3.png')

    res10 = page.evaluate("""() => {
        const title = document.querySelector('.lakinh-chart-select option:checked')?.innerText;
        const sub = document.querySelector('.lakinh-hk-title-sub')?.innerText;
        const cells = Array.from(document.querySelectorAll('.lakinh-palace-cell')).map(c => ({
            name: c.querySelector('.lakinh-palace-name')?.innerText,
            van: c.querySelector('.lakinh-star-period-top')?.innerText,
            son: c.querySelector('.lakinh-star-mountain')?.innerText,
            huong: c.querySelector('.lakinh-star-facing')?.innerText
        }));
        return { title, sub, cells };
    }""")
    print("Box 10 title:", res10['title'], "|", res10['sub'])
    print("Row 1 (HƯỚNG):", [f"[{c['van']}|{c['son']} {c['huong']}]" for c in res10['cells'][:3]])
    print("Row 2 (TRUNG):", [f"[{c['van']}|{c['son']} {c['huong']}]" for c in res10['cells'][3:6]])
    print("Row 3 (TỌA) :", [f"[{c['van']}|{c['son']} {c['huong']}]" for c in res10['cells'][6:9]])

    # Test 2: Hướng Bắc 1 (Tọa Bính Hướng Nhâm - 345.0°)
    print("\nTesting 9. Hướng Bắc 1 (345.0°)...")
    page.evaluate("""() => {
        window.NetaLaKinhView.updateRotation(345.0);
        window.NetaLaKinhView.openHuyenKhongModal(9, 345.0);
    }""")
    page.wait_for_timeout(600)
    page.screenshot(path='C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_poster_box_9_bac_1.png')

    res9 = page.evaluate("""() => {
        const title = document.querySelector('.lakinh-chart-select option:checked')?.innerText;
        const sub = document.querySelector('.lakinh-hk-title-sub')?.innerText;
        const cells = Array.from(document.querySelectorAll('.lakinh-palace-cell')).map(c => ({
            name: c.querySelector('.lakinh-palace-name')?.innerText,
            van: c.querySelector('.lakinh-star-period-top')?.innerText,
            son: c.querySelector('.lakinh-star-mountain')?.innerText,
            huong: c.querySelector('.lakinh-star-facing')?.innerText
        }));
        return { title, sub, cells };
    }""")
    print("Box 9 title:", res9['title'], "|", res9['sub'])
    print("Row 1 (HƯỚNG):", [f"[{c['van']}|{c['son']} {c['huong']}]" for c in res9['cells'][:3]])
    print("Row 2 (TRUNG):", [f"[{c['van']}|{c['son']} {c['huong']}]" for c in res9['cells'][3:6]])
    print("Row 3 (TỌA) :", [f"[{c['van']}|{c['son']} {c['huong']}]" for c in res9['cells'][6:9]])

    # Test 3: Hướng Nam 1 (165.0°)
    print("\nTesting 1. Hướng Nam 1 (165.0°)...")
    page.evaluate("""() => {
        window.NetaLaKinhView.updateRotation(165.0);
        window.NetaLaKinhView.openHuyenKhongModal(9, 165.0);
    }""")
    page.wait_for_timeout(600)
    page.screenshot(path='C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_poster_box_1_nam_1.png')

    res1 = page.evaluate("""() => {
        const title = document.querySelector('.lakinh-chart-select option:checked')?.innerText;
        const cells = Array.from(document.querySelectorAll('.lakinh-palace-cell')).map(c => ({
            name: c.querySelector('.lakinh-palace-name')?.innerText,
            van: c.querySelector('.lakinh-star-period-top')?.innerText,
            son: c.querySelector('.lakinh-star-mountain')?.innerText,
            huong: c.querySelector('.lakinh-star-facing')?.innerText
        }));
        return { title, cells };
    }""")
    print("Box 1 title:", res1['title'])
    print("Row 1 (HƯỚNG):", [f"[{c['van']}|{c['son']} {c['huong']}]" for c in res1['cells'][:3]])
    print("Row 2 (TRUNG):", [f"[{c['van']}|{c['son']} {c['huong']}]" for c in res1['cells'][3:6]])
    print("Row 3 (TỌA) :", [f"[{c['van']}|{c['son']} {c['huong']}]" for c in res1['cells'][6:9]])

    # Test 4: Light Theme screenshot
    print("\nTesting Light theme...")
    page.evaluate("() => document.body.classList.add('light-theme')")
    page.wait_for_timeout(400)
    page.screenshot(path='C:/Users/Admin/.gemini/antigravity/brain/d927b630-f8f0-4d4e-8e07-2d999bea6612/verify_poster_light_theme.png')

    browser.close()
    print("\nALL VERIFICATION TESTS COMPLETED!")
