import sys
import os
import json
import subprocess
sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612")
from lasotuvi.App import lapDiaBan
from lasotuvi.DiaBan import diaBan as DiaBanClass

test_cases = [
    {"day": 27, "month": 9, "year": 2026, "hour_val": 2, "hour_solar": 1, "isMale": True, "label": "Case 1: 27/09/2026 01:00 Nam"},
    {"day": 15, "month": 5, "year": 1990, "hour_val": 4, "hour_solar": 6, "isMale": False, "label": "Case 2: 15/05/1990 06:00 Nữ"},
    {"day": 10, "month": 10, "year": 1985, "hour_val": 12, "hour_solar": 22, "isMale": True, "label": "Case 3: 10/10/1985 22:00 Nam"},
    {"day": 1, "month": 1, "year": 2000, "hour_val": 7, "hour_solar": 12, "isMale": True, "label": "Case 4: 01/01/2000 12:00 Nam"}
]

chi_names = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi']

secondary_stars_to_check = [
    "Tam Thai", "Bát Tọa", "Ân Quang", "Thiên Quý", "Thai Phụ", "Phong Cáo",
    "Thiên Quan", "Thiên Phúc", "Thiên Trù", "Lưu Hà", "Quốc Ấn", "Đường Phù",
    "Cô Thần", "Quả Tú", "Kiếp Sát", "Hoa Cái", "Phá Toái", "Đẩu Quân",
    "Thiên Tài", "Thiên Thọ", "Thiên Thương", "Thiên Sứ", "Thiên Giải", "Địa Giải",
    "Thiên Không", "Văn Tinh"
]

for tc in test_cases:
    db = lapDiaBan(DiaBanClass, tc['day'], tc['month'], tc['year'], tc['hour_val'], 1 if tc['isMale'] else -1, True, 7)
    star_positions_lasotuvi = {}
    for i in range(1, 13):
        chi = chi_names[i - 1]
        cung = db.thapNhiCung[i]
        for s in cung.cungSao:
            s_name = s['saoTen'].strip().title()
            # Normalize
            if s_name == "Bát Toạ": s_name = "Bát Tọa"
            if s_name == "Đào Hoa": s_name = "Đào Hoa"
            star_positions_lasotuvi[s_name] = chi

    print(f"\n{tc['label']}:")
    for s in secondary_stars_to_check:
        pos = star_positions_lasotuvi.get(s, "NOT_FOUND")
        print(f"  {s}: {pos}", end=" | ")
    print()
