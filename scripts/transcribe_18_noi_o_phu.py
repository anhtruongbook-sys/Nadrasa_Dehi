import easyocr
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

reader = easyocr.Reader(['vi', 'en'], gpu=False)
fdir = '18 noi o Phu'
files = sorted(os.listdir(fdir))

os.makedirs('scratch', exist_ok=True)
output_path = 'scratch/18_noi_o_phu_transcription.txt'

print(f"Starting OCR transcription of all {len(files)} realms in '{fdir}'...", flush=True)

with open(output_path, 'w', encoding='utf-8') as out_f:
    for idx, f in enumerate(files):
        p = os.path.join(fdir, f)
        print(f"[{idx+1}/18] Processing {f}...", flush=True)
        res = reader.readtext(p, detail=0)
        content = '\n'.join(res)
        out_f.write(f"=== REALM {idx+1:02d} ({f}) ===\n{content}\n\n")
        out_f.flush()
        first_line = res[0] if res else "EMPTY"
        print(f"  -> Done realm {idx+1}: {first_line[:50]}", flush=True)

print(f"\nALL 18 REALMS TRANSCRIBED SUCCESSFULLY TO '{output_path}'!", flush=True)
