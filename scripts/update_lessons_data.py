import os
import sys

def update_data():
    for proj in [r'c:\Books\Neta Light', r'c:\Books\Neta Trio']:
        fpath = os.path.join(proj, 'modules', 'phap_hanh_data.js')
        with open(fpath, 'r', encoding='utf-8') as f:
            text = f.read()

        if '"id": "thong_phap"' not in text:
            cat_anchor = '  {\n    "id": "tam_an",\n    "name": "Tâm Ấn"\n  },'
            cat_addition = '  {\n    "id": "thong_phap",\n    "name": "Thông Pháp"\n  },\n' + cat_anchor
            text = text.replace(cat_anchor, cat_addition)

        if '"id": "lesson_24"' not in text:
            new_lessons = ''',
  {
    "id": "lesson_24",
    "title": "24 - [Thông Pháp] Bảng Đo Thông Pháp NETA",
    "category": "thong_phap",
    "categoryName": "Thông Pháp",
    "image": "assets/phap_hanh/lesson_24.jpg",
    "isBuiltIn": true,
    "order": 42
  },
  {
    "id": "lesson_25",
    "title": "25 - [Pháp Phục] Áo Kim Giáp Khi Hành Pháp",
    "category": "phap_bao_khi",
    "categoryName": "Pháp Bảo & Khí",
    "image": "assets/phap_hanh/lesson_25.jpg",
    "isBuiltIn": true,
    "order": 43
  },
  {
    "id": "lesson_26",
    "title": "26 - [Pháp Khí] Ấn Ký - Hướng Dẫn Sử Dụng",
    "category": "phap_bao_khi",
    "categoryName": "Pháp Bảo & Khí",
    "image": "assets/phap_hanh/lesson_26.jpg",
    "isBuiltIn": true,
    "order": 44
  }
];'''
            text = text.rstrip().rstrip(';')
            if text.endswith(']'):
                text = text[:-1].rstrip() + new_lessons

        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(text)

        print(f'Updated {fpath}')

if __name__ == '__main__':
    update_data()
