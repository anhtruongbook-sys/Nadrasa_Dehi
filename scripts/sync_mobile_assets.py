import shutil
import os

projects = [r'c:\Books\Neta Light', r'c:\Books\Neta Trio']

files = [
    'index.html',
    'phap_hanh.css',
    'phap_hanh_base64_data.js',
    'sw.js',
    'modules/phap_hanh_data.js',
    'modules/phap_hanh_view.js'
]

for p in projects:
    www = os.path.join(p, 'mobile_app', 'assets', 'www')
    for f in files:
        src = os.path.join(p, f)
        dst = os.path.join(www, f)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(src, dst)
        print(f"Synced {src} -> {dst}")

print("All files synced to mobile_app/assets/www!")
