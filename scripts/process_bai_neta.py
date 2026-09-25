import os
import sys
import glob
import re
import json
import base64
import io
import shutil
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r"C:\Books\Neta Light"
BAI_NETA_DIR = os.path.join(BASE_DIR, "Bai Neta")
NETA_CARDS_DIR = os.path.join(BASE_DIR, "neta_cards")
MOBILE_NETA_DIR = os.path.join(BASE_DIR, "mobile_app", "assets", "www", "neta_cards")
CARDS_DATA_PATH = os.path.join(BASE_DIR, "cards_data.js")
BASE64_OUTPUT_PATH = os.path.join(BASE_DIR, "cards_base64_data.js")
MOBILE_BASE64_PATH = os.path.join(BASE_DIR, "mobile_app", "assets", "www", "cards_base64_data.js")

os.makedirs(NETA_CARDS_DIR, exist_ok=True)
os.makedirs(MOBILE_NETA_DIR, exist_ok=True)

# 1. Parse cards_data.js
with open(CARDS_DATA_PATH, "r", encoding="utf-8") as f:
    content = f.read()

card_matches = re.findall(r'id:\s*(\d+),\s*name:\s*"([^"]+)"', content)
print(f"Found {len(card_matches)} cards in cards_data.js")

# 2. Check each card against Bai Neta files
all_files = glob.glob(os.path.join(BAI_NETA_DIR, "*.jpg"))
file_map = {}
for fp in all_files:
    fn = os.path.basename(fp)
    m = re.match(r'^(\d+)\s*-\s*(.+)\.jpg$', fn, re.IGNORECASE)
    if m:
        idx = int(m.group(1))
        file_map[idx] = fp

print(f"Mapped {len(file_map)} files from {BAI_NETA_DIR}")
assert 0 in file_map, "Missing 00 - Mặt sau.jpg!"

for cid_str, name in card_matches:
    cid = int(cid_str)
    assert cid in file_map, f"Missing card {cid} ({name}) in Bai Neta!"
    print(f"Verified Card {cid:02d}: {name} -> {os.path.basename(file_map[cid])}")

# 3. Process cards and build base64 dictionary
base64_dict = {}

print("\n--- Converting cards to PNG and generating base64 WebP ---")

# Card back (0)
back_src = file_map[0]
with Image.open(back_src) as img:
    img = img.convert("RGB")
    # Save PNG
    target_png = os.path.join(NETA_CARDS_DIR, "card_back.png")
    img.save(target_png, "PNG", optimize=True)
    # Mobile PNG
    shutil.copy2(target_png, os.path.join(MOBILE_NETA_DIR, "card_back.png"))
    
    # Save WebP base64
    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=90)
    b64_str = "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode('ascii')
    base64_dict["card_back.png"] = b64_str
    base64_dict["neta_cards/card_back.png"] = b64_str
    print(f"Processed card_back: {img.size} ({os.path.getsize(target_png):,} bytes PNG)")

# Cards 1 to 48
for cid in range(1, 49):
    src = file_map[cid]
    target_name = f"card_{cid:02d}.png"
    target_png = os.path.join(NETA_CARDS_DIR, target_name)
    
    with Image.open(src) as img:
        img = img.convert("RGB")
        img.save(target_png, "PNG", optimize=True)
        shutil.copy2(target_png, os.path.join(MOBILE_NETA_DIR, target_name))
        
        # Save WebP base64
        buf = io.BytesIO()
        img.save(buf, format="WEBP", quality=90)
        b64_str = "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode('ascii')
        base64_dict[target_name] = b64_str
        base64_dict[f"neta_cards/{target_name}"] = b64_str
        
        # If card 33 (Pháp ấn), also save phap_an.jpg
        if cid == 33:
            phap_an_target = os.path.join(NETA_CARDS_DIR, "phap_an.jpg")
            img.save(phap_an_target, "JPEG", quality=95)
            shutil.copy2(phap_an_target, os.path.join(MOBILE_NETA_DIR, "phap_an.jpg"))
            base64_dict["phap_an.jpg"] = b64_str
            base64_dict["neta_cards/phap_an.jpg"] = b64_str

print(f"All 48 cards and card back converted successfully!")

# 4. Write cards_base64_data.js
js_content = "window.CARDS_BASE64_DATA = " + json.dumps(base64_dict) + ";\n"
with open(BASE64_OUTPUT_PATH, "w", encoding="utf-8") as f:
    f.write(js_content)
with open(MOBILE_BASE64_PATH, "w", encoding="utf-8") as f:
    f.write(js_content)

print(f"Wrote {BASE64_OUTPUT_PATH} and {MOBILE_BASE64_PATH} ({len(js_content):,} bytes)")
print("DONE!")
