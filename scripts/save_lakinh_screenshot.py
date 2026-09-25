import base64
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('http://127.0.0.1:8080')
    page.wait_for_timeout(2000)
    
    js_code = """async () => {
        window.switchDeckMode('lakinh');
        await new Promise(r => setTimeout(r, 1500));

        const target = document.getElementById('view-lakinh');
        const imgs = target.querySelectorAll('img');

        const map = new Map();
        for (const img of imgs) {
            let fetchUrl = img.src;
            const m = fetchUrl.match(/x=(\\d+)&y=(\\d+)&z=(\\d+)/);
            if (m) {
                fetchUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/' + m[3] + '/' + m[2] + '/' + m[1];
            }

            try {
                const r = await fetch(fetchUrl);
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
            backgroundColor: '#06070a',
            useCORS: true,
            allowTaint: false,
            onclone: (clonedDoc) => {
                clonedDoc.querySelectorAll('img').forEach(img => {
                    const b64 = map.get(img.src);
                    if (b64 && b64.startsWith('data:')) {
                        img.src = b64;
                    } else {
                        img.remove();
                    }
                });

                const hideSelectors = [
                    '#lakinh-btn-my-location',
                    '#lakinh-search-bar-wrap',
                    '#lakinh-dock',
                    '#lakinh-floating-controls',
                    '#lakinh-bottom-sheet',
                    '.leaflet-control-zoom',
                    '.leaflet-control-attribution',
                    '#lakinh-btn-search',
                    '#lakinh-btn-layer',
                    '#lakinh-btn-projects'
                ];
                hideSelectors.forEach(sel => {
                    const el = clonedDoc.querySelector(sel);
                    if (el) el.style.display = 'none';
                });

                // Add survey footer badge
                const footer = document.createElement('div');
                footer.style.position = 'absolute';
                footer.style.bottom = '12px';
                footer.style.left = '12px';
                footer.style.padding = '8px 14px';
                footer.style.borderRadius = '8px';
                footer.style.background = 'rgba(10, 15, 29, 0.85)';
                footer.style.border = '1px solid rgba(245, 176, 65, 0.4)';
                footer.style.color = '#f8fafc';
                footer.style.fontSize = '12px';
                footer.style.fontFamily = 'system-ui, sans-serif';
                footer.style.lineHeight = '1.4';
                footer.style.zIndex = '9999';
                footer.innerHTML = '<strong>NETA LIGHT • LA KINH VỆ TINH 36 TẦNG</strong><br><span style=\"color:#f5b041;\">Khảo sát phong thủy &amp; Định vị vệ tinh thực địa</span>';
                clonedDoc.getElementById('view-lakinh').appendChild(footer);
            }
        });

        return canvas.toDataURL('image/png');
    }"""

    data_url = page.evaluate(js_code)
    img_bytes = base64.b64decode(data_url.split(',')[1])
    with open('lakinh_exported_screenshot.png', 'wb') as f:
        f.write(img_bytes)
    print('Saved lakinh_exported_screenshot.png successfully! Size:', len(img_bytes))
    browser.close()
