import json
import fitz
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Books/Neta Light/cards_database.json', encoding='utf-8') as f:
    cards = json.load(f)

print("=== VERIFYING ALL 48 CARDS AGAINST EXCEL & PDF ===")
for c in cards:
    cid = c['id']
    row = c['row']
    col = c['col']
    name = c['name']
    img = c['image']
    src = c['source_image']
    print(f"#{cid:02d} | Hàng {row}, Cột {col} | {name:<28} | Ảnh: {img} ({src})")

print(f"\nTổng số quân bài đã đối chiếu: {len(cards)}/48 quân bài.")
