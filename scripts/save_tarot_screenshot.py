import base64
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('http://127.0.0.1:8080')
    page.wait_for_timeout(2000)
    
    js_code = """async () => {
        window.switchDeckMode('tarot');
        await new Promise(r => setTimeout(r, 800));

        // Draw 3 cards & flip all to get the full report
        document.getElementById('btn-tarot-quick-draw').click();
        await new Promise(r => setTimeout(r, 600));
        document.getElementById('btn-tarot-flip-all').click();
        await new Promise(r => setTimeout(r, 800));

        const target = document.getElementById('view-tarot');
        const imgs = target.querySelectorAll('img');

        const map = new Map();
        for (const img of imgs) {
            try {
                const r = await fetch(img.src);
                if (r.ok) {
                    const b = await r.blob();
                    const dUrl = await new Promise(res => {
                        const reader = new FileReader();
                        reader.onloadend = () => res(reader.result);
                        reader.readAsDataURL(b);
                    });
                    map.set(img.src, dUrl);
                }
            } catch(e) {}
        }

        const canvas = await html2canvas(target, {
            scale: 2,
            backgroundColor: '#0c0d14',
            useCORS: true,
            allowTaint: false,
            onclone: (clonedDoc) => {
                clonedDoc.querySelectorAll('img').forEach(img => {
                    const b64 = map.get(img.src);
                    if (b64 && b64.startsWith('data:')) {
                        img.src = b64;
                    } else {
                        // Safe card placeholder
                        const cardBox = document.createElement('div');
                        cardBox.style.padding = '12px';
                        cardBox.style.borderRadius = '8px';
                        cardBox.style.background = '#1e1b4b';
                        cardBox.style.border = '1px solid #4338ca';
                        cardBox.style.textAlign = 'center';
                        cardBox.innerHTML = '<div style=\"font-size: 2rem;\">🃏</div><div style=\"font-weight: 700; color: #e0e7ff;\">' + (img.alt || 'Tarot Card') + '</div>';
                        if (img.parentNode) img.parentNode.replaceChild(cardBox, img);
                    }
                });

                // Expand view-tarot container
                const vTarot = clonedDoc.getElementById('view-tarot');
                if (vTarot) {
                    vTarot.style.height = 'auto';
                    vTarot.style.maxHeight = 'none';
                    vTarot.style.overflow = 'visible';
                    vTarot.style.padding = '16px';
                    vTarot.style.background = '#0c0d14';
                }

                // Hide interactive UI elements in screenshot
                const hideSelectors = [
                    '#tarot-tabs-nav',
                    '.tarot-action-buttons',
                    '.tarot-control-panel-grid',
                    '.tarot-ribbon-workspace-wrapper',
                    '.tarot-report-actions',
                    '#tarot-quick-actions'
                ];
                hideSelectors.forEach(sel => {
                    const el = clonedDoc.querySelector(sel);
                    if (el) el.style.display = 'none';
                });
            }
        });

        return canvas.toDataURL('image/png');
    }"""

    data_url = page.evaluate(js_code)
    img_bytes = base64.b64decode(data_url.split(',')[1])
    with open('tarot_exported_screenshot.png', 'wb') as f:
        f.write(img_bytes)
    print('Saved tarot_exported_screenshot.png successfully! Size:', len(img_bytes))
    browser.close()
