# -*- coding: utf-8 -*-
import shutil
import os
import sys

src_dir = r"C:\Books\Common Study\Tai lieu Nadrasa Dehi\Tiếp"
dst_dir = r"c:\Books\Neta Light\assets\phap_hanh"
mobile_dst_dir = r"c:\Books\Neta Light\mobile_app\assets\www\assets\phap_hanh"
trio_dst_dir = r"c:\Books\Neta Trio\assets\phap_hanh"
trio_mobile_dst = r"c:\Books\Neta Trio\mobile_app\assets\www\assets\phap_hanh"

mapping = {
    '27 - [Hộ Pháp] Ngọc Bảo Hộ Pháp.jpg': 'lesson_27.jpg',
    '28 - [Hộ Pháp] Thanh Cương Hộ Pháp.jpg': 'lesson_28.jpg',
    '29 - [Hộ Pháp] Đông Phương Sứ Giả Hộ Pháp.jpg': 'lesson_29.jpg',
    '30 - [Hộ Pháp] Bất Động Hộ Pháp.jpg': 'lesson_30.jpg',
    '31 - [Hộ Pháp] Lưỡng Thần Hộ Pháp.jpg': 'lesson_31.jpg',
    '32 - [Hộ Pháp] Cảm Thán Hộ Pháp.jpg': 'lesson_32.jpg',
    '33 - [Hộ Pháp] Chướng Ngại Hộ Pháp.jpg': 'lesson_33.jpg'
}

for src_name, dst_name in mapping.items():
    s = os.path.join(src_dir, src_name)
    if not os.path.exists(s):
        print(f"NOT FOUND: {s}")
        continue
    for d_dir in [dst_dir, mobile_dst_dir, trio_dst_dir, trio_mobile_dst]:
        parent = os.path.dirname(d_dir)
        if os.path.exists(parent):
            os.makedirs(d_dir, exist_ok=True)
            t = os.path.join(d_dir, dst_name)
            shutil.copy2(s, t)
            print(f"Copied -> {dst_name} in {d_dir}")

print("All new lesson images copied successfully!")
