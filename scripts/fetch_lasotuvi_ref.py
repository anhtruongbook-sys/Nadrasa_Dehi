import urllib.request
import os
import sys
sys.stdout.reconfigure(encoding='utf-8')

repo_files = ['AmDuong.py', 'DiaBan.py', 'Sao.py', 'ThienBan.py']
save_dir = r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\lasotuvi_ref"
os.makedirs(save_dir, exist_ok=True)

for fname in repo_files:
    url = f"https://raw.githubusercontent.com/doanguyen/lasotuvi/master/lasotuvi/{fname}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8')
            dest = os.path.join(save_dir, fname)
            with open(dest, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Downloaded {fname} ({len(content)} chars)")
    except Exception as e:
        print(f"Failed to fetch {fname}: {e}")
