# Compare all 16 Tinh Ban with the user's poster
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from test_xuan_kong import generate_chart, SON_24
from test_oriented_grid import get_oriented_grid

# 16 Tinh Ban list in the poster:
POSTER_16 = [
    ("1. Hướng Nam 1",      165, "S",  "Bính"),
    ("2. Hướng Nam 2/3",    180, "S",  "Ngọ / Đinh"),
    ("3. Hướng Tây Nam 1",  210, "SW", "Mùi"),
    ("4. Hướng Tây Nam 2/3",225, "SW", "Khôn / Thân"),
    ("5. Hướng Tây 1",      255, "W",  "Canh"),
    ("6. Hướng Tây 2/3",    270, "W",  "Dậu / Tân"),
    ("7. Hướng Tây Bắc 1",  300, "NW", "Tuất"),
    ("8. Hướng Tây Bắc 2/3",315, "NW", "Càn / Hợi"),
    ("9. Hướng Bắc 1",      345, "N",  "Nhâm"),
    ("10. Hướng Bắc 2/3",   0,   "N",  "Tý / Quý"),
    ("11. Hướng Đông Bắc 1", 30, "NE", "Sửu"),
    ("12. Hướng Đông Bắc 2/3",45,"NE", "Cấn / Dần"),
    ("13. Hướng Đông 1",     75, "E",  "Giáp"),
    ("14. Hướng Đông 2/3",   90, "E",  "Mão / Ất"),
    ("15. Hướng Đông Nam 1", 120,"SE", "Thìn"),
    ("16. Hướng Đông Nam 2/3",135,"SE","Tốn / Tị")
]

for title, deg, facing_palace, son_names in POSTER_16:
    res = generate_chart(deg, 9)
    grid_layout = get_oriented_grid(facing_palace)
    print(f"\n==================== {title} ({son_names}) ====================")
    print(f"Tọa tinh nhập trung: {res['mountain_center']} ({res['m_dir']}), Hướng tinh: {res['facing_center']} ({res['f_dir']})")
    print(f"Cách cục: {res['pattern']}")
    for r in range(3):
        row_str = []
        for c in range(3):
            p_id = grid_layout[r][c]
            m, f, v = res['grid'][p_id]
            # Format like poster: [v] on top, m f below
            row_str.append(f"[{v:^2} | {m} {f}]")
        print("  " + "  ".join(row_str))
