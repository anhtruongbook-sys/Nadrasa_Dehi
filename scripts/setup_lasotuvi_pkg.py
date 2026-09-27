import urllib.request
import os
import sys

ref_dir = r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\lasotuvi"
os.makedirs(ref_dir, exist_ok=True)

# Copy files or download Lich_HND
url = "https://raw.githubusercontent.com/doanguyen/lasotuvi/master/lasotuvi/Lich_HND.py"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    with open(os.path.join(ref_dir, "Lich_HND.py"), "w", encoding="utf-8") as f:
        f.write(resp.read().decode('utf-8'))

# Also copy other files to lasotuvi package
for fn in ['AmDuong.py', 'DiaBan.py', 'Sao.py', 'ThienBan.py', 'App.py']:
    src = os.path.join(r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612\lasotuvi_ref", fn)
    dst = os.path.join(ref_dir, fn)
    with open(src, "r", encoding="utf-8") as f_src:
        with open(dst, "w", encoding="utf-8") as f_dst:
            f_dst.write(f_src.read())

with open(os.path.join(ref_dir, "__init__.py"), "w", encoding="utf-8") as f:
    f.write("# init\n")

print("Created lasotuvi package successfully!")
