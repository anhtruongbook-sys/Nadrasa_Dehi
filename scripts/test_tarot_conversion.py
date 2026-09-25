import sys
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.on('console', lambda msg: sys.stdout.buffer.write(f"PAGE LOG: {msg.text}\n".encode('utf-8', errors='replace')))
    page.goto('http://127.0.0.1:8080')
    page.wait_for_timeout(2000)

    # Inject test script to test Tarot screenshot
    tarot_res = page.evaluate('''async () => {
        window.switchDeckMode('tarot');
        await new Promise(r => setTimeout(r, 600));
        
        // Draw 3 cards
        document.getElementById('btn-tarot-quick-draw').click();
        await new Promise(r => setTimeout(r, 600));
        document.getElementById('btn-tarot-flip-all').click();
        await new Promise(r => setTimeout(r, 600));

        // Test converting all images in view-tarot
        const viewTarot = document.getElementById('view-tarot');
        const imgs = viewTarot.querySelectorAll('img');
        console.log('Found tarot imgs:', imgs.length);

        const results = [];
        for (const img of imgs) {
            try {
                const res = await fetch(img.src);
                const blob = await res.blob();
                const dUrl = await new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
                results.push({ src: img.src, ok: true, len: dUrl.length });
            } catch (e) {
                results.push({ src: img.src, ok: false, err: e.message });
            }
        }
        return results;
    }''')
    print("Tarot card conversion results:", tarot_res)

    browser.close()
