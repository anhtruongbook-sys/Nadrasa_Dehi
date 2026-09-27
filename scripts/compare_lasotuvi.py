import sys
import os
import json
sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612")
from lasotuvi.App import lapDiaBan
from lasotuvi.DiaBan import diaBan as DiaBanClass

def run_lasotuvi(nn, tt, nnnn, gio_chi_idx_1_based, is_male):
    gioi_tinh = 1 if is_male else -1
    db = lapDiaBan(DiaBanClass, nn, tt, nnnn, gio_chi_idx_1_based, gioi_tinh, True, 7)
    res = {}
    for i in range(1, 13):
        cung = db.thapNhiCung[i]
        cung_name = cung.cungChu
        sao_list = [s['saoTen'] for s in cung.cungSao]
        res[cung.cungTen] = {
            'cungSo': i,
            'cungChu': cung_name,
            'daiHan': getattr(cung, 'cungDaiHan', None),
            'tieuHan': getattr(cung, 'cungTieuHan', None),
            'sao': sao_list,
            'tuan': getattr(cung, 'tuanTrung', False),
            'triet': getattr(cung, 'trietLo', False),
            'cungThan': getattr(cung, 'cungThan', False)
        }
    return res

t1 = run_lasotuvi(27, 9, 2026, 2, True) # 27/09/2026 giờ Sửu (2)
print("=== LASOTUVI RESULT FOR 27/09/2026 GIO SUU (NAM) ===")
for chi, data in t1.items():
    print(f"[{chi}] Cung: {data['cungChu']} (Thân: {data['cungThan']}) | ĐH: {data['daiHan']} | TH: {data['tieuHan']} | Tuần: {data['tuan']} | Triệt: {data['triet']}")
    print(f"      Sao: {', '.join(data['sao'])}")
