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
            }
        });

        const dataUrl = canvas.toDataURL('image/png');
        return { success: true, length: dataUrl.length, width: canvas.width, height: canvas.height };
    }"""

    res = page.evaluate(js_code)
    print('La Kinh html2canvas export result:', res)
    browser.close()
