import os
import glob
from PIL import Image
import io
import base64
import json

src_dir = r"c:\Books\Neta Light\Porker"
files = glob.glob(os.path.join(src_dir, "*.png"))
print(f"Found {len(files)} files in {src_dir}")

base64_dict = {}

for f in sorted(files):
    fname = os.path.basename(f)
    im = Image.open(f)
    w, h = im.size
    
    # Target width 480px for optimal retina display on mobile
    target_w = 480
    target_h = int(h * (target_w / w))
    im_resized = im.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    buf = io.BytesIO()
    im_resized.save(buf, format='WEBP', quality=90)
    b64_str = "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode('ascii')
    
    # Store with multiple access keys for 100% match guarantee
    base64_dict[fname] = b64_str
    base64_dict[f"Porker/{fname}"] = b64_str
    base64_dict[f"porker/{fname}"] = b64_str
    base64_dict[f"/Porker/{fname}"] = b64_str

print(f"Total keys generated: {len(base64_dict)}")

js_content = "/**\n * POKER 52 LÁ - CSDL BASE64 DATA URLS (CHỐNG LỖI TAINTED CANVAS & TRẮNG MÀN HÌNH)\n */\nwindow.POKER_BASE64_DATA = " + json.dumps(base64_dict) + ";\n"

dest_dirs = [
    r"c:\Books\Neta Light",
    r"c:\Books\Neta Trio",
    r"c:\Books\Neta Light\mobile_app\assets\www",
    r"c:\Books\Neta Trio\mobile_app\assets\www"
]

for d in dest_dirs:
    target_file = os.path.join(d, "poker_base64_data.js")
    with open(target_file, "w", encoding="utf-8") as fp:
        fp.write(js_content)
    size_mb = os.path.getsize(target_file) / 1024 / 1024
    print(f"Written {target_file} ({size_mb:.2f} MB)")

print("Done generating poker_base64_data.js!")
