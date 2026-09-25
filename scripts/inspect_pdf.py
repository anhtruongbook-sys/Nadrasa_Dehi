import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open(r'C:\Books\Neta Light\Bai Neta Light V2_1.pdf')
page = doc[0]

# List images embedded in page with their bbox
for img_info in page.get_images():
    xref = img_info[0]
    base_img = doc.extract_image(xref)
    print(f"Xref {xref}: {base_img['width']}x{base_img['height']}, ext: {base_img['ext']}")

print("--- Text Blocks ---")
blocks = page.get_text('blocks')
for i, b in enumerate(sorted(blocks, key=lambda x: (round(x[1]/30)*30, x[0]))):
    text = " ".join(b[4].split())
    print(f"[{i:02d}] x={b[0]:.1f}, y={b[1]:.1f} | {text}")
