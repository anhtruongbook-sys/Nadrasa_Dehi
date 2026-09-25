import os
import sys
import shutil
import cv2
import numpy as np
from scipy.optimize import linear_sum_assignment

sys.stdout.reconfigure(encoding='utf-8')

base_dir = r'C:\Books\Neta Light'
old_dir = os.path.join(base_dir, 'neta_cards')
new_dir = os.path.join(base_dir, 'Bai Neta')
backup_dir = os.path.join(new_dir, '_backup_zalo')

# Detailed Vietnamese and ascii names
card_info = {
    0: {"vi": "Mặt sau", "en": "Mat_sau", "old": "card_back.png"},
    1: {"vi": "Yêu nam", "en": "Yeu_nam", "old": "card_01.png"},
    2: {"vi": "Yêu nữ", "en": "Yeu_nu", "old": "card_02.png"},
    3: {"vi": "Vong nam", "en": "Vong_nam", "old": "card_03.png"},
    4: {"vi": "Vong nữ", "en": "Vong_nu", "old": "card_04.png"},
    5: {"vi": "Đủ điều kiện đầu thai", "en": "Du_dieu_kien_dau_thai", "old": "card_05.png"},
    6: {"vi": "Nghiệp nặng", "en": "Nghiep_nang", "old": "card_06.png"},
    7: {"vi": "Nghiệp đang xảy ra", "en": "Nghiep_dang_xay_ra", "old": "card_07.png"},
    8: {"vi": "Bùa", "en": "Bua", "old": "card_08.png"},
    9: {"vi": "Quỷ nam", "en": "Quy_nam", "old": "card_09.png"},
    10: {"vi": "Quỷ nữ", "en": "Quy_nu", "old": "card_10.png"},
    11: {"vi": "Thầy tà", "en": "Thay_ta", "old": "card_11.png"},
    12: {"vi": "Thổ địa", "en": "Tho_dia", "old": "card_12.png"},
    13: {"vi": "Đất xấu", "en": "Dat_xau", "old": "card_13.png"},
    14: {"vi": "Nghiệp ở đất", "en": "Nghiep_o_dat", "old": "card_14.png"},
    15: {"vi": "Đất tốt", "en": "Dat_tot", "old": "card_15.png"},
    16: {"vi": "Hộ pháp thiên tam đạo", "en": "Ho_phap_thien_tam_dao", "old": "card_16.png"},
    17: {"vi": "Om trắng 1", "en": "Om_trang_1", "old": "card_17.png"},
    18: {"vi": "Om trắng 2", "en": "Om_trang_2", "old": "card_18.png"},
    19: {"vi": "Om trắng 3", "en": "Om_trang_3", "old": "card_19.png"},
    20: {"vi": "Có thể khai ngộ", "en": "Co_the_khai_ngo", "old": "card_20.png"},
    21: {"vi": "Om vàng 1", "en": "Om_vang_1", "old": "card_21.png"},
    22: {"vi": "Om vàng 2", "en": "Om_vang_2", "old": "card_22.png"},
    23: {"vi": "Om vàng 3", "en": "Om_vang_3", "old": "card_23.png"},
    24: {"vi": "Om trắng 4", "en": "Om_trang_4", "old": "card_24.png"},
    25: {"vi": "Âm binh người", "en": "Am_binh_nguoi", "old": "card_25.png"},
    26: {"vi": "Âm binh súc sinh", "en": "Am_binh_suc_sinh", "old": "card_26.png"},
    27: {"vi": "Vong nhi nam", "en": "Vong_nhi_nam", "old": "card_27.png"},
    28: {"vi": "Vong nhi nữ", "en": "Vong_nhi_nu", "old": "card_28.png"},
    29: {"vi": "Thầy chánh pháp", "en": "Thay_chanh_phap", "old": "card_29.png"},
    30: {"vi": "Nghiệp tâm linh", "en": "Nghiep_tam_linh", "old": "card_30.png"},
    31: {"vi": "Chết tận số", "en": "Chet_tan_so", "old": "card_31.png"},
    32: {"vi": "Chết oan", "en": "Chet_oan", "old": "card_32.png"},
    33: {"vi": "Pháp ấn", "en": "Phap_an", "old": "card_33.png"},
    34: {"vi": "Om vàng 4", "en": "Om_vang_4", "old": "card_34.png"},
    35: {"vi": "Bà cô tổ", "en": "Ba_co_to", "old": "card_35.png"},
    36: {"vi": "Ông mãnh", "en": "Ong_manh", "old": "card_36.png"},
    37: {"vi": "Gia tiên", "en": "Gia_tien", "old": "card_37.png"},
    38: {"vi": "Duyên vợ chồng", "en": "Duyen_vo_chong", "old": "card_38.png"},
    39: {"vi": "Duyên âm", "en": "Duyen_am", "old": "card_39.png"},
    40: {"vi": "Con âm", "en": "Con_am", "old": "card_40.png"},
    41: {"vi": "Vị thầy tâm linh", "en": "Vi_thay_tam_linh", "old": "card_41.png"},
    42: {"vi": "Thiên thần hộ mệnh nam", "en": "Thien_than_ho_menh_nam", "old": "card_42.png"},
    43: {"vi": "Thiên thần hộ mệnh nữ", "en": "Thien_than_ho_menh_nu", "old": "card_43.png"},
    44: {"vi": "Hộ pháp", "en": "Ho_phap", "old": "card_44.png"},
    45: {"vi": "Pháp binh", "en": "Phap_binh", "old": "card_45.png"},
    46: {"vi": "Sứ giả", "en": "Su_gia", "old": "card_46.png"},
    47: {"vi": "Ấn chữ vạn", "en": "An_chu_van", "old": "card_47.png"},
    48: {"vi": "Quan thần linh", "en": "Quan_than_linh", "old": "card_48.png"}
}

old_files = [card_info[i]["old"] for i in range(49)]
# Use backup_dir as source of truth for the 49 original files
zalo_files = sorted([f for f in os.listdir(backup_dir) if f.endswith('.jpg')])

print(f"Found {len(zalo_files)} original files in backup directory.")
assert len(zalo_files) == 49, f"Expected 49 files, found {len(zalo_files)}"

old_imgs = [cv2.resize(cv2.imread(os.path.join(old_dir, f)), (150, 240)) for f in old_files]
new_imgs = [cv2.resize(cv2.imread(os.path.join(backup_dir, f)), (150, 240)) for f in zalo_files]

cost_matrix = np.zeros((len(zalo_files), len(old_files)))
for i, n_img in enumerate(new_imgs):
    n_hsv = cv2.cvtColor(n_img, cv2.COLOR_BGR2HSV)
    n_hist = cv2.calcHist([n_hsv], [0, 1], None, [30, 32], [0, 180, 0, 256])
    cv2.normalize(n_hist, n_hist, 0, 1, cv2.NORM_MINMAX)

    for j, o_img in enumerate(old_imgs):
        o_hsv = cv2.cvtColor(o_img, cv2.COLOR_BGR2HSV)
        o_hist = cv2.calcHist([o_hsv], [0, 1], None, [30, 32], [0, 180, 0, 256])
        cv2.normalize(o_hist, o_hist, 0, 1, cv2.NORM_MINMAX)

        hist_corr = max(0, cv2.compareHist(n_hist, o_hist, cv2.HISTCMP_CORREL))
        tm_corr = max(0, cv2.matchTemplate(n_img, o_img, cv2.TM_CCOEFF_NORMED)[0][0])
        cost_matrix[i, j] = 1.0 - (0.5 * hist_corr + 0.5 * tm_corr)

row_ind, col_ind = linear_sum_assignment(cost_matrix)

# Build renaming plan
plan = []
for r, c in zip(row_ind, col_ind):
    cid = c
    zalo_file = zalo_files[r]
    vi_name = card_info[cid]["vi"]
    en_name = card_info[cid]["en"]
    target_name = f"{cid:02d} - {vi_name}.jpg"
    plan.append((cid, vi_name, zalo_file, target_name))

plan.sort(key=lambda x: x[0])

# Clean new_dir of raw files and copy from backup to clean names
for item in os.listdir(new_dir):
    if item == '_backup_zalo':
        continue
    item_path = os.path.join(new_dir, item)
    if os.path.isfile(item_path):
        os.remove(item_path)

for cid, vi_name, zalo_file, target_name in plan:
    src = os.path.join(backup_dir, zalo_file)
    dst = os.path.join(new_dir, target_name)
    shutil.copy2(src, dst)
    print(f"[{cid:02d}] {target_name} <= {zalo_file[:25]}...")

print("\nAll 49 files named successfully in Bai Neta!")
