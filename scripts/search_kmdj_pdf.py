import pypdf
import sys
sys.stdout.reconfigure(encoding='utf-8')

p = r'c:\Books\Common Study\QMDJ-BAZI-16.03-V4\KMDJ_BVS.pdf'
reader = pypdf.PdfReader(p)
keywords = ['hướng 1', 'hướng 2', 'tây bắc 1', 'tây bắc 2', '2/3', 'sơn 1', 'sơn 2', 'hướng 2/3', 'bắc 1', 'nam 1', 'đông 1', 'tây 1']

print(f"Total pages: {len(reader.pages)}")
matches = 0
for i, page in enumerate(reader.pages):
    txt = page.extract_text() or ''
    found = False
    for kw in keywords:
        if kw in txt.lower():
            if not found:
                print(f"\n--- Page {i+1} ---")
                found = True
            for line in txt.splitlines():
                if kw in line.lower():
                    print('   ', line.strip())
            matches += 1
            if matches > 50:
                break
    if matches > 50:
        break
