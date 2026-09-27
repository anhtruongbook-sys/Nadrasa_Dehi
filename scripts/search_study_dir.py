import os
import sys
sys.stdout.reconfigure(encoding='utf-8')

root_dir = r'c:\Books\Common Study\QMDJ-BAZI-16.03-V4'
keywords = ['tây bắc 1', 'tây bắc 2', '2/3', 'hướng 1', 'hướng 2/3', 'huong 1', 'huong 2/3', 'nam 1', 'nam 2', 'bắc 1', 'bắc 2']

for root, dirs, files in os.walk(root_dir):
    for f in files:
        if f.endswith(('.txt', '.py', '.json', '.md')):
            fp = os.path.join(root, f)
            try:
                with open(fp, 'r', encoding='utf-8', errors='ignore') as s:
                    lines = s.readlines()
                    for idx, line in enumerate(lines):
                        for kw in keywords:
                            if kw in line.lower():
                                print(f'{f}:{idx+1}: {line.strip()[:120]}')
                                break
            except Exception:
                pass
