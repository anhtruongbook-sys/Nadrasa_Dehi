import asyncio
import json
import os
import sys
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from playwright.async_api import async_playwright

VIEWPORTS = [
    {"name": "iPhone SE (Compact)", "width": 375, "height": 667},
    {"name": "iPhone 14/15 Pro (Standard Mobile)", "width": 390, "height": 844},
    {"name": "Samsung Galaxy S20 (Android Long)", "width": 412, "height": 915},
    {"name": "iPad Mini (Tablet)", "width": 768, "height": 1024},
    {"name": "Desktop (Laptop / Monitor)", "width": 1280, "height": 800}
]

XSS_PAYLOADS = [
    "<img src=x onerror=alert(1)>",
    "'\"><script>alert('xss')</script>",
    "javascript:alert(1)",
    "<svg/onload=alert(1)>",
    "{{7*7}}"
]

async def run_ui_audit(page, report):
    print("\n--- [PHẦN 1] BẮT ĐẦU KIỂM THỬ GIAO DIỆN (UI/UX & RESPONSIVE) ---")
    ui_results = []

    for vp in VIEWPORTS:
        await page.set_viewport_size({"width": vp["width"], "height": vp["height"]})
        await page.goto("http://127.0.0.1:8080/index.html")
        await page.wait_for_selector("#app-container")

        # 1. Kiểm tra tràn khung ngang (Horizontal Overflow)
        scroll_width = await page.evaluate("() => document.body.scrollWidth")
        client_width = await page.evaluate("() => document.body.clientWidth")
        has_h_overflow = scroll_width > client_width

        # 2. Kiểm tra Tap Targets (Kích thước nút bấm theo WCAG)
        buttons_to_check = ["#btn-draw-single", "#btn-theme", "#btn-sound", "#btn-guide"]
        tap_target_issues = []
        for btn_id in buttons_to_check:
            loc = page.locator(btn_id)
            if await loc.is_visible():
                box = await loc.bounding_box()
                if box and (box["width"] < 32 or box["height"] < 32):
                    tap_target_issues.append(f"{btn_id} quá nhỏ ({box['width']}x{box['height']})")

        # 3. Rút bài và kiểm tra độ vừa vặn của arena
        await page.click("#btn-draw-single")
        await page.wait_for_selector(".card-item")

        # Rút thêm 9 lá (tổng 10 lá) để thử nghiệm mật độ cao
        for _ in range(9):
            if await page.locator("#btn-draw-more").is_visible():
                await page.click("#btn-draw-more")
                await page.wait_for_timeout(40)

        card_count = await page.locator(".card-item").count()
        app_box = await page.locator("#app-container").bounding_box()
        footer_box = await page.locator(".app-controls").bounding_box()
        header_box = await page.locator(".app-header").bounding_box()

        # Kiểm tra thẻ bài có bị tràn ra ngoài app container không
        first_card_box = await page.locator(".card-item").first.bounding_box()
        last_card_box = await page.locator(".card-item").last.bounding_box()

        arena_fit_ok = True
        if first_card_box and header_box:
            if first_card_box["y"] < header_box["y"] + header_box["height"]:
                arena_fit_ok = False
        if last_card_box and footer_box:
            if last_card_box["y"] + last_card_box["height"] > footer_box["y"] + 10:
                arena_fit_ok = False

        status = "PASS" if (not has_h_overflow and not tap_target_issues and arena_fit_ok) else "WARN"
        res = {
            "viewport": vp["name"],
            "dimensions": f"{vp['width']}x{vp['height']}",
            "no_overflow": not has_h_overflow,
            "tap_targets_ok": len(tap_target_issues) == 0,
            "tap_issues": tap_target_issues,
            "cards_rendered": card_count,
            "arena_fit_ok": arena_fit_ok,
            "status": status
        }
        ui_results.append(res)
        print(f"  ✓ Viewport {vp['name']} ({vp['width']}x{vp['height']}): Status {status} (Overflow: {has_h_overflow}, Fit: {arena_fit_ok})")

    report["ui_audit"] = ui_results

async def run_performance_audit(page, report):
    print("\n--- [PHẦN 2] BẮT ĐẦU KIỂM THỬ HIỆU NĂNG (PERFORMANCE & METRICS) ---")
    await page.set_viewport_size({"width": 390, "height": 844})
    await page.goto("http://127.0.0.1:8080/index.html")
    await page.wait_for_selector("#app-container")

    # 1. Navigation Timing Metrics (FCP, DOM Ready, Load)
    timing = await page.evaluate("""() => {
        const perf = performance.getEntriesByType('navigation')[0] || {};
        const paint = performance.getEntriesByType('paint');
        let fcp = 0;
        paint.forEach(p => {
            if (p.name === 'first-contentful-paint') fcp = p.startTime;
        });
        return {
            dns: Math.round(perf.domainLookupEnd - perf.domainLookupStart || 0),
            tcp: Math.round(perf.connectEnd - perf.connectStart || 0),
            domContentLoaded: Math.round(perf.domContentLoadedEventEnd - perf.startTime || 0),
            loadComplete: Math.round(perf.loadEventEnd - perf.startTime || 0),
            fcp: Math.round(fcp || 0),
            domNodes: document.getElementsByTagName('*').length
        };
    }""")

    # 2. Đo thời gian xử lý khi rút bài (Draw Latency)
    start_draw = time.perf_counter()
    await page.click("#btn-draw-single")
    await page.wait_for_selector(".card-item")
    draw_latency_ms = round((time.perf_counter() - start_draw) * 1000, 2)

    # 3. Đo thời gian mở modal phóng to lá bài
    start_modal = time.perf_counter()
    await page.click(".card-item")
    await page.wait_for_selector("#card-modal", state="visible")
    modal_latency_ms = round((time.perf_counter() - start_modal) * 1000, 2)
    await page.click("#modal-close-btn")

    # 4. Đo thời gian chụp ảnh màn hình lưu vào máy (Canvas Snapshot Latency)
    start_snap = time.perf_counter()
    await page.click("#btn-screenshot-header")
    await page.wait_for_selector("#toast", state="visible")
    snap_latency_ms = round((time.perf_counter() - start_snap) * 1000, 2)

    perf_data = {
        "dom_content_loaded_ms": timing["domContentLoaded"],
        "load_complete_ms": timing["loadComplete"],
        "fcp_ms": timing["fcp"],
        "dom_node_count": timing["domNodes"],
        "draw_latency_ms": draw_latency_ms,
        "modal_latency_ms": modal_latency_ms,
        "screenshot_latency_ms": snap_latency_ms,
        "rating": "A+ EXCELLENT" if timing["domContentLoaded"] < 300 and draw_latency_ms < 100 else "B GOOD"
    }

    print(f"  ✓ DOMContentLoaded: {timing['domContentLoaded']} ms")
    print(f"  ✓ First Contentful Paint (FCP): {timing['fcp']} ms")
    print(f"  ✓ DOM Node Count: {timing['domNodes']} nodes")
    print(f"  ✓ Draw Card Latency: {draw_latency_ms} ms")
    print(f"  ✓ Card Modal Zoom Latency: {modal_latency_ms} ms")
    print(f"  ✓ Screenshot Capture Latency: {snap_latency_ms} ms")
    print(f"  ✓ Đánh giá hiệu năng: {perf_data['rating']}")

    report["performance_audit"] = perf_data

async def run_security_audit(page, report):
    print("\n--- [PHẦN 3] BẮT ĐẦU KIỂM THỬ AN TOÀN THÔNG TIN (INFORMATION SECURITY) ---")
    security_findings = []

    # 1. Kiểm tra XSS Injection trong ô tìm kiếm Guide Modal
    await page.goto("http://127.0.0.1:8080/index.html")
    await page.click("#btn-guide")
    await page.wait_for_selector("#guide-modal", state="visible")

    dialog_triggered = False
    def on_dialog(d):
        nonlocal dialog_triggered
        dialog_triggered = True
        asyncio.create_task(d.dismiss())

    page.on("dialog", on_dialog)

    for payload in XSS_PAYLOADS:
        await page.fill("#guide-search-input", payload)
        await page.wait_for_timeout(100)

    await page.click("#guide-close-btn")
    xss_safe = not dialog_triggered
    print(f"  ✓ XSS Injection Fuzzing (5 payloads): {'AN TOÀN (No Dialog Fired)' if xss_safe else 'CẢNH BÁO: XSS Triggered!'}")
    if not xss_safe:
        security_findings.append("XSS Injection payload executed an alert box!")

    # 2. Kiểm tra LocalStorage Privacy (Không có dữ liệu bí mật / PII / Token rò rỉ)
    local_storage_data = await page.evaluate("""() => {
        let items = {};
        for (let i = 0; i < localStorage.length; i++) {
            let k = localStorage.key(i);
            items[k] = localStorage.getItem(k);
        }
        return items;
    }""")
    print(f"  ✓ LocalStorage Keys: {list(local_storage_data.keys())}")
    for k, v in local_storage_data.items():
        if any(bad in k.lower() for bad in ["token", "auth", "secret", "password", "user", "phone", "email"]):
            security_findings.append(f"LocalStorage contains sensitive key: {k}")

    # 3. Kiểm tra Tainted Canvas / Origin Cleanliness
    await page.click("#btn-draw-single")
    await page.wait_for_selector(".card-item")
    tainted_check = await page.evaluate("""async () => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            const img = document.querySelector('.card-img');
            if (img) {
                ctx.drawImage(img, 0, 0, 100, 100);
                const data = canvas.toDataURL('image/png');
                return { clean: true, length: data.length };
            }
            return { clean: true, length: 0 };
        } catch(e) {
            return { clean: false, error: e.toString() };
        }
    }""")
    print(f"  ✓ Tainted Canvas Security: {'100% ORIGIN-CLEAN' if tainted_check.get('clean') else 'TAINTED: ' + tainted_check.get('error')}")
    if not tainted_check.get("clean"):
        security_findings.append("Canvas tainted on card image export!")

    # 4. Kiểm tra Android Permissions
    manifest_path = r"c:\Books\Neta Light\mobile_app\android\app\src\main\AndroidManifest.xml"
    excessive_permissions = []
    if os.path.exists(manifest_path):
        with open(manifest_path, "r", encoding="utf-8") as f:
            content = f.read()
            for dangerous in ["CAMERA", "RECORD_AUDIO", "READ_CONTACTS", "ACCESS_FINE_LOCATION", "READ_EXTERNAL_STORAGE"]:
                if f"android.permission.{dangerous}" in content:
                    excessive_permissions.append(dangerous)

    print(f"  ✓ Android Manifest Permissions: {'TỐI GIẢN CHUẨN MỰC' if not excessive_permissions else 'CẢNH BÁO QUYỀN THỪA: ' + str(excessive_permissions)}")
    if excessive_permissions:
        security_findings.append(f"Excessive Android permissions: {excessive_permissions}")

    # 5. Kiểm tra Security Headers trên Server
    import urllib.request
    req = urllib.request.urlopen("http://127.0.0.1:8080/index.html")
    headers = dict(req.headers)
    has_nosniff = headers.get("X-Content-Type-Options") == "nosniff"
    has_frame_guard = "X-Frame-Options" in headers
    has_csp = "Content-Security-Policy" in headers or "content-security-policy" in headers

    print(f"  ✓ Server Security Headers: nosniff={has_nosniff}, x-frame-options={has_frame_guard}, csp={has_csp}")

    sec_data = {
        "xss_fuzzing_passed": xss_safe,
        "local_storage_clean": len(security_findings) == 0,
        "canvas_origin_clean": tainted_check.get("clean", False),
        "android_permissions_minimal": len(excessive_permissions) == 0,
        "server_headers": {
            "nosniff": has_nosniff,
            "x_frame_options": has_frame_guard,
            "csp": has_csp
        },
        "findings": security_findings,
        "security_score": "100/100" if len(security_findings) == 0 and has_nosniff and has_frame_guard else "85/100"
    }

    report["security_audit"] = sec_data

async def main():
    report = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "audit_version": "1.0",
        "app_name": "Neta Light & Poker"
    }

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        await run_ui_audit(page, report)
        await run_performance_audit(page, report)
        await run_security_audit(page, report)

        await browser.close()

    out_file = r"c:\Books\Neta Light\audit_report.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print("\n=======================================================")
    print(f"BÁO CÁO KIỂM THỬ ĐÃ ĐƯỢC XUẤT RA: {out_file}")
    print("=======================================================")

if __name__ == "__main__":
    asyncio.run(main())
