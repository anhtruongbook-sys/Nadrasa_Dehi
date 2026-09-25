import os
import cv2
import numpy as np
from scipy.optimize import linear_sum_assignment

old_dir = r'C:\Books\Neta Light\neta_cards'
new_dir = r'C:\Books\Neta Light\Bai Neta'

# Card names from cards_data.js
card_names = {
    0: "Mat_sau",
    1: "Yeu_nam",
    2: "Yeu_nu",
    3: "Vong_nam",
    4: "Vong_nu",
    5: "Du_dieu_kien_dau_thai",
    6: "Nghiep_nang",
    7: "Nghiep_dang_xay_ra",
    8: "Bua",
    9: "Quy_nam",
    10: "Quy_nu",
    11: "Thay_ta",
    12: "Tho_dia",
    13: "Dat_xau",
    14: "Nghiep_o_dat",
    15: "Dat_tot",
    16: "Ho_phap_thien_tam_dao",
    17: "Om_trang_1",
    18: "Om_trang_2",
    19: "Om_trang_3",
    20: "Co_the_khai_ngo",
    21: "Om_vang_1",
    22: "Om_vang_2",
    23: "Om_vang_3",
    24: "Om_trang_4",
    25: "Am_binh_nguoi",
    26: "Am_binh_suc_sinh",
    27: "Vong_nhi_nam",
    28: "Vong_nhi_nu",
    29: "Thay_chanh_phap",
    30: "Nghiep_tam_linh",
    31: "Chet_tan_so",
    32: "Chet_oan",
    33: "Phap_an",
    34: "Om_vang_4",
    35: "Ba_co_to",
    36: "Ong_manh",
    37: "Gia_tien",
    38: "Duyen_vo_chong",
    39: "Duyen_am",
    40: "Con_am",
    41: "Vi_thay_tam_linh",
    42: "Thien_than_ho_menh_nam",
    43: "Thien_than_ho_menh_nu",
    44: "Ho_phap",
    45: "Phap_binh",
    46: "Su_gia",
    47: "An_chu_van",
    48: "Quan_than_linh"
}

old_files = ['card_back.png'] + [f'card_{i:02d}.png' for i in range(1, 49)]
new_files = sorted([f for f in os.listdir(new_dir) if f.endswith('.jpg')])

old_imgs = [cv2.resize(cv2.imread(os.path.join(old_dir, f)), (150, 240)) for f in old_files]
new_imgs = [cv2.resize(cv2.imread(os.path.join(new_dir, f)), (150, 240)) for f in new_files]

# Cost matrix: 1.0 - correlation
cost_matrix = np.zeros((len(new_files), len(old_files)))

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
        sim = 0.5 * hist_corr + 0.5 * tm_corr
        cost_matrix[i, j] = 1.0 - sim

row_ind, col_ind = linear_sum_assignment(cost_matrix)

results = []
for r, c in zip(row_ind, col_ind):
    sim = 1.0 - cost_matrix[r, c]
    nf = new_files[r]
    of = old_files[c]
    card_id = c
    card_name = card_names[card_id]
    results.append((card_id, card_name, of, nf, sim))

results.sort(key=lambda x: x[0])
print(f"{'ID':<3} | {'Card Name':<25} | {'Old File':<14} | {'Similarity':<10} | {'New File'}")
print("-" * 90)
for cid, cname, of, nf, sim in results:
    print(f"{cid:<3} | {cname:<25} | {of:<14} | {sim:<10.3f} | {nf}")
