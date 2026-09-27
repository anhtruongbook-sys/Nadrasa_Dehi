import sys
import os
import json
import subprocess
sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612")
from lasotuvi.App import lapDiaBan
from lasotuvi.DiaBan import diaBan as DiaBanClass

# Let's test on 27/09/2026 gio Suu (Nam)
db = lapDiaBan(DiaBanClass, 27, 9, 2026, 2, 1, True, 7)

chi_names = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi']

print("=== ALL STARS IN LASOTUVI BY PALACE ===")
for i in range(1, 13):
    chi = chi_names[i - 1]
    cung = db.thapNhiCung[i]
    print(f"[{chi}] ({cung.cungChu}):")
    sao_names = [s['saoTen'] for s in cung.cungSao]
    print(f"  Total {len(sao_names)}: {', '.join(sao_names)}")
