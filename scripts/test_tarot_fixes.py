import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Mobile viewport 360x740 (Standard Android)
        page = await browser.new_page(viewport={'width': 360, 'height': 740})
        await page.goto('http://127.0.0.1:8090/index.html')
        await page.wait_for_timeout(800)

        # 1. Switch to Tarot mode
        await page.click('#deck-selector-trigger')
        await page.wait_for_timeout(300)
        # Click Tarot deck option if exists
        tarot_opt = await page.query_selector('.deck-option[data-deck="tarot"]')
        if tarot_opt:
            await tarot_opt.click()
            await page.wait_for_timeout(500)

        # 2. Trigger Key Modal
        await page.evaluate("() => { if (window.NetaTarotView && window.NetaTarotView.openKeyConfigModal) window.NetaTarotView.openKeyConfigModal(); }")
        await page.wait_for_timeout(400)

        # Verify modal dimensions on 360px screen
        modal_info = await page.evaluate('''() => {
            const modal = document.getElementById('tarot-key-config-modal');
            const dialog = modal ? modal.querySelector('.tarot-key-modal-dialog') : null;
            const input = modal ? modal.querySelector('#tarot-custom-key-input') : null;
            const pasteBtn = modal ? modal.querySelector('#btn-tarot-paste-key') : null;
            const closeBtn = modal ? modal.querySelector('#tarot-key-modal-close') : null;
            const title = modal ? modal.querySelector('.tarot-key-modal-title') : null;

            if (!dialog) return { error: 'Modal not found' };

            const dRect = dialog.getBoundingClientRect();
            const iRect = input.getBoundingClientRect();
            const pRect = pasteBtn.getBoundingClientRect();
            const cRect = closeBtn.getBoundingClientRect();
            const tRect = title.getBoundingClientRect();

            return {
                windowWidth: window.innerWidth,
                dialog: { left: Math.round(dRect.left), right: Math.round(dRect.right), width: Math.round(dRect.width), overflowRight: dRect.right > window.innerWidth },
                input: { left: Math.round(iRect.left), right: Math.round(iRect.right), width: Math.round(iRect.width) },
                pasteBtn: { left: Math.round(pRect.left), right: Math.round(pRect.right), width: Math.round(pRect.width), overflowRight: pRect.right > dRect.right },
                closeAndTitleOverlap: cRect.left < tRect.right && cRect.bottom > tRect.top
            };
        }''')
        print(f"Modal Layout Info: {modal_info}")

        # Screenshot modal
        await page.screenshot(path=r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\test_tarot_key_modal_fixed.png")

        # 3. Test formatMarkdownDeep with edge cases
        markdown_test_result = await page.evaluate('''() => {
            const sampleMarkdown = `### 1. Phân Tích Tổng Quan
Dòng chảy năng lượng thể hiện sự chuyển hóa sâu sắc.

#### 1.1 Khía Cạnh Ý Thức
Tiềm thức đang thúc đẩy hành động mới.

\`\`\`
[Vị Trí 1: The Fool] ---> [Vị Trí 2: The Magician]
\`\`\`

##### Điểm Cần Chú Ý
- Hãy kiên định với mục tiêu.
- Đừng vội vàng đưa ra quyết định tài chính.

---

### 2. Lời Khuyên Hành Động
Hành động đúng lúc sẽ mang lại sự bứt phá.`;

            let html = '';
            if (window.NetaTarotView && window.NetaTarotView.formatMarkdownDeep) {
                html = window.NetaTarotView.formatMarkdownDeep(sampleMarkdown);
            } else {
                html = 'formatMarkdownDeep not exposed';
            }

            return {
                html: html,
                hasRawH5: html.includes('#####'),
                hasRawH4: html.includes('####'),
                hasRawH3: html.includes('###'),
                hasRawBackticks: html.includes('```'),
                hasDiagramCard: html.includes('tarot-deep-diagram-card'),
                hasDivider: html.includes('tarot-deep-divider'),
                hasMinorHeading: html.includes('tarot-deep-minor-heading')
            };
        }''')
        print(f"Markdown formatting test: {markdown_test_result}")

        await browser.close()
        print("Playwright test finished successfully!")

if __name__ == "__main__":
    asyncio.run(main())
