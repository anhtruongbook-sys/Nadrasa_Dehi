# Test Python script for canonical Xuan Kong Flying Stars
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# 24 Sơn table with Palace, Trigram, Long (1: Dia, 2: Thien, 3: Nhan), and Yin/Yang
# Yin/Yang: +1 (Duong - Thuan), -1 (Am - Nghich)
SON_24 = [
    {"name": "Nhâm", "cung": "N",  "quai": 1, "long": 1, "long_name": "Địa", "sign": 1,  "deg": 345},
    {"name": "Tý",   "cung": "N",  "quai": 1, "long": 2, "long_name": "Thiên", "sign": -1, "deg": 0},
    {"name": "Quý",  "cung": "N",  "quai": 1, "long": 3, "long_name": "Nhân", "sign": -1, "deg": 15},

    {"name": "Sửu",  "cung": "NE", "quai": 8, "long": 1, "long_name": "Địa", "sign": -1, "deg": 30},
    {"name": "Cấn",  "cung": "NE", "quai": 8, "long": 2, "long_name": "Thiên", "sign": 1,  "deg": 45},
    {"name": "Dần",  "cung": "NE", "quai": 8, "long": 3, "long_name": "Nhân", "sign": 1,  "deg": 60},

    {"name": "Giáp", "cung": "E",  "quai": 3, "long": 1, "long_name": "Địa", "sign": 1,  "deg": 75},
    {"name": "Mão",  "cung": "E",  "quai": 3, "long": 2, "long_name": "Thiên", "sign": -1, "deg": 90},
    {"name": "Ất",   "cung": "E",  "quai": 3, "long": 3, "long_name": "Nhân", "sign": -1, "deg": 105},

    {"name": "Thìn", "cung": "SE", "quai": 4, "long": 1, "long_name": "Địa", "sign": -1, "deg": 120},
    {"name": "Tốn",  "cung": "SE", "quai": 4, "long": 2, "long_name": "Thiên", "sign": 1,  "deg": 135},
    {"name": "Tị",   "cung": "SE", "quai": 4, "long": 3, "long_name": "Nhân", "sign": 1,  "deg": 150},

    {"name": "Bính", "cung": "S",  "quai": 9, "long": 1, "long_name": "Địa", "sign": 1,  "deg": 165},
    {"name": "Ngọ",  "cung": "S",  "quai": 9, "long": 2, "long_name": "Thiên", "sign": -1, "deg": 180},
    {"name": "Đinh", "cung": "S",  "quai": 9, "long": 3, "long_name": "Nhân", "sign": -1, "deg": 195},

    {"name": "Mùi",  "cung": "SW", "quai": 2, "long": 1, "long_name": "Địa", "sign": -1, "deg": 210},
    {"name": "Khôn", "cung": "SW", "quai": 2, "long": 2, "long_name": "Thiên", "sign": 1,  "deg": 225},
    {"name": "Thân", "cung": "SW", "quai": 2, "long": 3, "long_name": "Nhân", "sign": 1,  "deg": 240},

    {"name": "Canh", "cung": "W",  "quai": 7, "long": 1, "long_name": "Địa", "sign": 1,  "deg": 255},
    {"name": "Dậu",  "cung": "W",  "quai": 7, "long": 2, "long_name": "Thiên", "sign": -1, "deg": 270},
    {"name": "Tân",  "cung": "W",  "quai": 7, "long": 3, "long_name": "Nhân", "sign": -1, "deg": 285},

    {"name": "Tuất", "cung": "NW", "quai": 6, "long": 1, "long_name": "Địa", "sign": -1, "deg": 300},
    {"name": "Càn",  "cung": "NW", "quai": 6, "long": 2, "long_name": "Thiên", "sign": 1,  "deg": 315},
    {"name": "Hợi",  "cung": "NW", "quai": 6, "long": 3, "long_name": "Nhân", "sign": 1,  "deg": 330}
]

# Luo Shu 9 Palaces order for Flying Stars:
FLYING_ORDER = ['C', 'NW', 'W', 'NE', 'S', 'N', 'SW', 'E', 'SE']

# Mapping Trigram/Number to Palace ID
STAR_TO_PALACE = {
    1: 'N',
    2: 'SW',
    3: 'E',
    4: 'SE',
    6: 'NW',
    7: 'W',
    8: 'NE',
    9: 'S'
}

def get_son_by_deg(deg):
    norm = (deg % 360 + 360) % 360
    for s in SON_24:
        # Check angle range [s.deg - 7.5, s.deg + 7.5)
        diff = (norm - s['deg'] + 180) % 360 - 180
        if -7.5 <= diff < 7.5:
            return s
    return SON_24[1] # Default Tý

def get_fly_direction(star, long_idx, current_period):
    """
    Returns +1 for Forward (Thuận), -1 for Reverse (Nghịch).
    """
    if star != 5:
        # Find original palace of star
        palace = STAR_TO_PALACE[star]
        # In this palace, find the mountain corresponding to long_idx (1: Dia, 2: Thien, 3: Nhan)
        matching_son = next(s for s in SON_24 if s['cung'] == palace and s['long'] == long_idx)
        return matching_son['sign']
    else:
        # Star 5 enters center: depends on current_period (Tam Nguyen Cuu Van)
        # For odd periods (1, 3, 7, 9):
        # Long 1 (Dia): Forward (+1)
        # Long 2, 3 (Thien, Nhan): Reverse (-1)
        # For even periods (2, 4, 6, 8):
        # Long 1 (Dia): Reverse (-1)
        # Long 2, 3 (Thien, Nhan): Forward (+1)
        if current_period in [1, 3, 7, 9]:
            return 1 if long_idx == 1 else -1
        else: # 2, 4, 6, 8 (or 5)
            return -1 if long_idx == 1 else 1

def generate_chart(facing_deg, period=9):
    facing_son = get_son_by_deg(facing_deg)
    toa_deg = (facing_deg + 180) % 360
    toa_son = get_son_by_deg(toa_deg)

    # 1. Period Stars (Van Ban) - always forward
    van_stars = {}
    for k, p_id in enumerate(FLYING_ORDER):
        van_stars[p_id] = ((period - 1 + k) % 9) + 1

    # 2. Mountain & Facing Stars entering center
    mountain_center = van_stars[toa_son['cung']]
    facing_center = van_stars[facing_son['cung']]

    # 3. Determine fly directions
    m_dir = get_fly_direction(mountain_center, toa_son['long'], period)
    f_dir = get_fly_direction(facing_center, facing_son['long'], period)

    # 4. Fly 9 palaces
    mountain_stars = {}
    facing_stars = {}
    for k, p_id in enumerate(FLYING_ORDER):
        if m_dir == 1:
            m_star = ((mountain_center - 1 + k) % 9) + 1
        else:
            m_star = ((mountain_center - 1 - k + 81) % 9) + 1
        mountain_stars[p_id] = m_star

        if f_dir == 1:
            f_star = ((facing_center - 1 + k) % 9) + 1
        else:
            f_star = ((facing_center - 1 - k + 81) % 9) + 1
        facing_stars[p_id] = f_star

    # Classify pattern
    pattern = "Thường cục"
    m_at_toa = mountain_stars[toa_son['cung']]
    f_at_facing = facing_stars[facing_son['cung']]
    m_at_facing = mountain_stars[facing_son['cung']]
    f_at_toa = facing_stars[toa_son['cung']]

    if m_at_toa == period and f_at_facing == period:
        pattern = "Vượng Sơn Vượng Hướng (Đinh Tài Lưỡng Đắc)"
    elif m_at_toa == period and f_at_toa == period:
        pattern = "Song Tinh Đáo Tọa (Vượng Đinh Bại Tài)"
    elif m_at_facing == period and f_at_facing == period:
        pattern = "Song Tinh Đáo Hướng (Vượng Tài Bại Đinh)"
    elif m_at_facing == period and f_at_toa == period:
        pattern = "Thượng Sơn Hạ Thủy (Tổn Đinh Phá Tài)"

    return {
        "toa": toa_son,
        "facing": facing_son,
        "mountain_center": mountain_center,
        "facing_center": facing_center,
        "m_dir": "Thuận (+)" if m_dir == 1 else "Nghịch (-)",
        "f_dir": "Thuận (+)" if f_dir == 1 else "Nghịch (-)",
        "pattern": pattern,
        "grid": {p: (mountain_stars[p], facing_stars[p], van_stars[p]) for p in FLYING_ORDER}
    }

# Test 1: Tọa Ngọ Hướng Tý (Sơn 2 - Thiên Nguyên Long)
c_ty = generate_chart(0, 9)
print(f"=== Tọa {c_ty['toa']['name']} Hướng {c_ty['facing']['name']} ({c_ty['facing']['long_name']} Nguyên Long) ===")
print(f"Tọa tinh: {c_ty['mountain_center']} ({c_ty['m_dir']}), Hướng tinh: {c_ty['facing_center']} ({c_ty['f_dir']})")
print(f"Cách cục: {c_ty['pattern']}")
print(f"Trung Cung: {c_ty['grid']['C']}")
print(f"Bắc (Khảm - Hướng): {c_ty['grid']['N']}")
print(f"Nam (Ly - Tọa): {c_ty['grid']['S']}")

# Test 2: Tọa Bính Hướng Nhâm (Sơn 1 - Địa Nguyên Long của cùng trục Nam - Bắc)
c_nham = generate_chart(345, 9)
print(f"\n=== Tọa {c_nham['toa']['name']} Hướng {c_nham['facing']['name']} ({c_nham['facing']['long_name']} Nguyên Long) ===")
print(f"Tọa tinh: {c_nham['mountain_center']} ({c_nham['m_dir']}), Hướng tinh: {c_nham['facing_center']} ({c_nham['f_dir']})")
print(f"Cách cục: {c_nham['pattern']}")
print(f"Trung Cung: {c_nham['grid']['C']}")
print(f"Bắc (Khảm - Hướng): {c_nham['grid']['N']}")
print(f"Nam (Ly - Tọa): {c_nham['grid']['S']}")

# Test 3: Tọa Đinh Hướng Quý (Sơn 3 - Nhân Nguyên Long của cùng trục Nam - Bắc)
c_quy = generate_chart(15, 9)
print(f"\n=== Tọa {c_quy['toa']['name']} Hướng {c_quy['facing']['name']} ({c_quy['facing']['long_name']} Nguyên Long) ===")
print(f"Tọa tinh: {c_quy['mountain_center']} ({c_quy['m_dir']}), Hướng tinh: {c_quy['facing_center']} ({c_quy['f_dir']})")
print(f"Cách cục: {c_quy['pattern']}")
print(f"Trung Cung: {c_quy['grid']['C']}")
print(f"Bắc (Khảm - Hướng): {c_quy['grid']['N']}")
print(f"Nam (Ly - Tọa): {c_quy['grid']['S']}")
