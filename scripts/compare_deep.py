import sys
import os
import json
import subprocess
sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, r"C:\Users\Admin\.gemini\antigravity\brain\d927b630-f8f0-4d4e-8e07-2d999bea6612")
from lasotuvi.App import lapDiaBan
from lasotuvi.DiaBan import diaBan as DiaBanClass

test_cases = [
    {
        "day": 27, "month": 9, "year": 2026, "hour_val": 2, "hour_solar": 1, "isMale": True,
        "label": "Case 1: 27/09/2026 01:00 Nam (Bính Ngọ, tháng 8 âm, giờ Sửu)"
    },
    {
        "day": 15, "month": 5, "year": 1990, "hour_val": 4, "hour_solar": 6, "isMale": False,
        "label": "Case 2: 15/05/1990 06:00 Nữ (Canh Ngọ, tháng 4 âm, giờ Mão)"
    },
    {
        "day": 10, "month": 10, "year": 1985, "hour_val": 12, "hour_solar": 22, "isMale": True,
        "label": "Case 3: 10/10/1985 22:00 Nam (Ất Sửu, tháng 8 âm, giờ Hợi)"
    },
    {
        "day": 1, "month": 1, "year": 2000, "hour_val": 7, "hour_solar": 12, "isMale": True,
        "label": "Case 4: 01/01/2000 12:00 Nam (Kỷ Mão, tháng 11 âm, giờ Ngọ)"
    }
]

chi_names = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi']

def normalize_star_name(s):
    s = s.strip().title()
    # Normalize common variations
    mapping = {
        "Tử Vi": "Tử Vi", "Liêm Trinh": "Liêm Trinh", "Thiên Đồng": "Thiên Đồng",
        "Vũ Khúc": "Vũ Khúc", "Thái Dương": "Thái Dương", "Thiên Cơ": "Thiên Cơ",
        "Thiên Phủ": "Thiên Phủ", "Thái Âm": "Thái Âm", "Tham Lang": "Tham Lang",
        "Cự Môn": "Cự Môn", "Thiên Tướng": "Thiên Tướng", "Thiên Lương": "Thiên Lương",
        "Thất Sát": "Thất Sát", "Phá Quân": "Phá Quân",
        "Bác Sỹ": "Bác Sĩ", "Thiên Riêu": "Thiên Diêu",
        "Tả Phù": "Tả Phụ", "Thái Tuế": "Thái Tuế",
        "Địa Kiếp": "Địa Kiếp", "Địa Không": "Địa Không",
        "Kình Dương": "Kình Dương", "Đà La": "Đà La",
        "Hỏa Tinh": "Hỏa Tinh", "Linh Tinh": "Linh Tinh",
        "Hóa Lộc": "Hóa Lộc", "Hóa Quyền": "Hóa Quyền", "Hóa Khoa": "Hóa Khoa", "Hóa Kỵ": "Hóa Kỵ"
    }
    return mapping.get(s, s)

for tc in test_cases:
    print(f"\n=======================================================")
    print(f"TEST: {tc['label']}")
    print(f"=======================================================")

    # 1. Run doanguyen/lasotuvi
    db = lapDiaBan(DiaBanClass, tc['day'], tc['month'], tc['year'], tc['hour_val'], 1 if tc['isMale'] else -1, True, 7)
    
    # 2. Run NetaTuViEngine via node
    input_payload = json.dumps({
        "day": tc['day'], "month": tc['month'], "year": tc['year'],
        "hour": tc['hour_solar'], "isMale": tc['isMale'], "viewYear": 2026
    })
    proc = subprocess.run(["node", "scripts/compare_runner.js", input_payload], capture_output=True, text=True, encoding='utf-8')
    neta_chart = json.loads(proc.stdout)
    meta = neta_chart['meta']

    print(f"Cục Số & Bản Mệnh:")
    print(f"  - lasotuvi: Cục = {db.thapNhiCung[1].cungDaiHan} (khởi đầu)")
    print(f"  - Neta:     Cục = {meta['cuc']} ({meta['cucName']}), Nạp Âm = {meta['napAm']}")

    # Compare each palace
    diff_count = 0
    match_count = 0
    for i in range(12):
        chi = chi_names[i]
        cung_lasotuvi = db.thapNhiCung[i + 1]
        cung_neta = neta_chart['palaces'][i]

        # 1. Cung Name
        c1 = cung_lasotuvi.cungChu.title()
        c2 = cung_neta['name'].title()
        if c1 != c2:
            print(f"  [!] {chi}: Tên cung lệch -> lasotuvi: '{c1}' vs Neta: '{c2}'")
            diff_count += 1
        else:
            match_count += 1

        # 2. Đại hạn
        dh1 = cung_lasotuvi.cungDaiHan
        dh2 = cung_neta['daiHan']
        if dh1 != dh2:
            print(f"  [!] {chi}: Đại hạn lệch -> lasotuvi: {dh1} vs Neta: {dh2}")
            diff_count += 1

        # 3. Tiểu hạn
        th1 = cung_lasotuvi.cungTieuHan
        th2 = cung_neta['tieuHan']
        if th1 != th2:
            print(f"  [!] {chi}: Tiểu hạn lệch -> lasotuvi: {th1} vs Neta: {th2}")
            diff_count += 1

        # 4. Tuần / Triệt
        tuan1 = getattr(cung_lasotuvi, 'tuanTrung', False)
        tuan2 = cung_neta['isTuan']
        triet1 = getattr(cung_lasotuvi, 'trietLo', False)
        triet2 = cung_neta['isTriet']
        if tuan1 != tuan2:
            print(f"  [!] {chi}: Tuần Không lệch -> lasotuvi: {tuan1} vs Neta: {tuan2}")
            diff_count += 1
        if triet1 != triet2:
            print(f"  [!] {chi}: Triệt Không lệch -> lasotuvi: {triet1} vs Neta: {triet2}")
            diff_count += 1

        # 5. Stars in palace
        stars1 = set(normalize_star_name(s['saoTen']) for s in cung_lasotuvi.cungSao)
        stars2 = set(normalize_star_name(s['name']) for s in cung_neta['mainStars'] + cung_neta['luckyStars'] + cung_neta['badStars'])

        # Check 14 main stars
        main14 = {"Tử Vi", "Liêm Trinh", "Thiên Đồng", "Vũ Khúc", "Thái Dương", "Thiên Cơ",
                  "Thiên Phủ", "Thái Âm", "Tham Lang", "Cự Môn", "Thiên Tướng", "Thiên Lương",
                  "Thất Sát", "Phá Quân"}
        main_diff = (stars1 & main14) ^ (stars2 & main14)
        if main_diff:
            print(f"  [CRITICAL] {chi}: Chính tinh lệch -> {main_diff}")
            diff_count += 1

        # Check Tu Hoa
        tu_hoa = {"Hóa Lộc", "Hóa Quyền", "Hóa Khoa", "Hóa Kỵ"}
        tu_hoa_diff = (stars1 & tu_hoa) ^ (stars2 & tu_hoa)
        if tu_hoa_diff:
            print(f"  [!] {chi}: Tứ Hóa lệch -> lasotuvi: {stars1 & tu_hoa} vs Neta: {stars2 & tu_hoa}")
            diff_count += 1

        # Check Sat Tinh
        sat6 = {"Kình Dương", "Đà La", "Địa Không", "Địa Kiếp", "Hỏa Tinh", "Linh Tinh"}
        sat_diff = (stars1 & sat6) ^ (stars2 & sat6)
        if sat_diff:
            print(f"  [!] {chi}: Lục Sát Tinh lệch -> lasotuvi: {stars1 & sat6} vs Neta: {stars2 & sat6}")
            diff_count += 1

    print(f"==> KẾT QUẢ ĐỐI CHỨNG: {diff_count} điểm lệch, {match_count} cung trùng khớp chức năng.")
