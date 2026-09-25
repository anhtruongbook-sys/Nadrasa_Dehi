import os
import io
import base64
from PIL import Image

def generate():
    folder = 'assets/phap_hanh'
    files = sorted([f for f in os.listdir(folder) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
    print(f"Found {len(files)} files in {folder}")

    out_file = 'phap_hanh_base64_data.js'
    
    entries = []
    total_raw_bytes = 0

    for idx, f in enumerate(files, 1):
        fpath = os.path.join(folder, f)
        img = Image.open(fpath)
        orig_w, orig_h = img.size
        
        # Max width 420 for crisp mobile retina thumbnail
        target_w = 420
        target_h = int(orig_h * (target_w / orig_w))
        resized = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
        
        buf = io.BytesIO()
        resized.save(buf, format='JPEG', quality=78, optimize=True)
        raw_bytes = buf.getvalue()
        total_raw_bytes += len(raw_bytes)
        
        b64_str = base64.b64encode(raw_bytes).decode('ascii')
        data_uri = f"data:image/jpeg;base64,{b64_str}"
        
        rel_path = f"assets/phap_hanh/{f}"
        
        entries.append(f'  "{f}": "{data_uri}",')
        entries.append(f'  "{rel_path}": "{data_uri}",')
        print(f"[{idx}/{len(files)}] {f} -> {len(raw_bytes)/1024:.1f} KB")

    js_content = "window.PHAP_HANH_BASE64_DATA = {\n" + "\n".join(entries) + "\n};\n"
    
    with open(out_file, 'w', encoding='utf-8') as out:
        out.write(js_content)
        
    print(f"\nGenerated {out_file} successfully!")
    print(f"Total raw image bytes: {total_raw_bytes / (1024*1024):.2f} MB")
    print(f"JS file size: {os.path.getsize(out_file) / (1024*1024):.2f} MB")

if __name__ == '__main__':
    generate()
