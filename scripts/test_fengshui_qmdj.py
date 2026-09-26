import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Luoshu palaces:
# 1: Khảm (Bắc)
# 2: Khôn (Tây Nam)
# 3: Chấn (Đông)
# 4: Tốn (Đông Nam)
# 5: Trung Cung
# 6: Càn (Tây Bắc)
# 7: Đoài (Tây)
# 8: Cấn (Đông Bắc)
# 9: Ly (Nam)

PALACE_NAMES = {
    1: 'Khảm (Bắc)',
    2: 'Khôn (Tây Nam)',
    3: 'Chấn (Đông)',
    4: 'Tốn (Đông Nam)',
    5: 'Trung Cung',
    6: 'Càn (Tây Bắc)',
    7: 'Đoài (Tây)',
    8: 'Cấn (Đông Bắc)',
    9: 'Ly (Nam)'
}

CLOCKWISE_8 = [6, 1, 8, 3, 4, 9, 2, 7] # Càn 6 -> Khảm 1 -> Cấn 8 -> Chấn 3 -> Tốn 4 -> Ly 9 -> Khôn 2 -> Đoài 7

STEM_SEQ = ['Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý', 'Đinh', 'Bính', 'Ất']

def get_a2_plate(van):
    a2 = {}
    for i, stem in enumerate(STEM_SEQ):
        p = (van - 1 + i) % 9 + 1
        if p != 5:
            a2[p] = stem
    p5_stem = STEM_SEQ[(5 - van) % 9]
    a2[2] = f"{a2.get(2, '')}/{p5_stem}"
    return a2

# 24 Sơn vị cửa -> Phù thủ
DOOR_24_SON = {
    'Nhâm': 'Mậu', 'Tý': 'Mậu', 'Quý': 'Mậu', 'Sửu': 'Mậu',
    'Cấn': 'Quý', 'Dần': 'Quý', 'Càn': 'Quý', 'Hợi': 'Quý',
    'Giáp': 'Kỷ', 'Mão': 'Kỷ', 'Tân': 'Kỷ', 'Tuất': 'Kỷ',
    'Ất': 'Nhâm', 'Thìn': 'Nhâm', 'Canh': 'Nhâm', 'Dậu': 'Nhâm',
    'Tốn': 'Canh', 'Tị': 'Canh', 'Khôn': 'Canh', 'Thân': 'Canh',
    'Bính': 'Tân', 'Ngọ': 'Tân', 'Đinh': 'Tân', 'Mùi': 'Tân'
}

# Cung gốc sao (A3), môn (A5)
ORIGINAL_STARS = {
    1: 'Thiên Bồng', 8: 'Thiên Nhậm', 3: 'Thiên Xung', 4: 'Thiên Phụ',
    9: 'Thiên Anh', 2: 'Thiên Nhuế', 7: 'Thiên Trụ', 6: 'Thiên Tâm'
}
ORIGINAL_DOORS = {
    1: 'Hưu', 8: 'Sinh', 3: 'Thương', 4: 'Đỗ',
    9: 'Cảnh', 2: 'Tử', 7: 'Kinh', 6: 'Khai'
}

STAR_RING = ['Xung', 'Phụ', 'Anh', 'Nhuế', 'Trụ', 'Tâm', 'Bồng', 'Nhậm']
DIVINITY_RING = ['Trực Phù', 'Đằng Xà', 'Thái Âm', 'Lục Hợp', 'Câu Trần', 'Chu Tước', 'Cửu Địa', 'Cửu Thiên']
DOOR_RING = ['Hưu', 'Sinh', 'Thương', 'Đỗ', 'Cảnh', 'Tử', 'Kinh', 'Khai']

# Bảng tra Cung Trực Sử (A5) từ A2 Phù Thủ và A2 Hướng Nhà (trang 30 KMDJ_BVS.pdf & out_table.txt)
# Row: A2 Hướng Nhà (Giáp/Ất/Bính/Đinh/Mậu/Kỷ/Canh/Tân/Nhâm/Quý)
# Col: Vị trí A2 Phù Thủ: [Đông(3), Đông Nam(4), Nam(9), Tây Nam(2), Tây(7), Tây Bắc(6), Bắc(1), Đông Bắc(8)]
TRUC_SU_MATRIX = {
    'Giáp': {3: 3, 4: 4, 9: 9, 2: 2, 7: 7, 6: 6, 1: 1, 8: 8},
    'Ất':   {3: 4, 4: 2, 9: 1, 2: 3, 7: 8, 6: 7, 1: 2, 8: 9},
    'Bính': {3: 2, 4: 6, 9: 2, 2: 4, 7: 9, 6: 8, 1: 3, 8: 1},
    'Đinh': {3: 6, 4: 7, 9: 3, 2: 2, 7: 1, 6: 9, 1: 4, 8: 2},
    'Mậu':  {3: 7, 4: 8, 9: 4, 2: 6, 7: 2, 6: 1, 1: 2, 8: 3},
    'Kỷ':   {3: 8, 4: 9, 9: 2, 2: 7, 7: 3, 6: 2, 1: 6, 8: 4},
    'Canh': {3: 9, 4: 1, 9: 6, 2: 8, 7: 4, 6: 3, 1: 7, 8: 2},
    'Tân':  {3: 1, 4: 2, 9: 7, 2: 9, 7: 2, 6: 4, 1: 8, 8: 6},
    'Nhâm': {3: 2, 4: 3, 9: 8, 2: 1, 7: 6, 6: 2, 1: 9, 8: 7},
    'Quý':  {3: 3, 4: 4, 9: 9, 2: 2, 7: 7, 6: 6, 1: 1, 8: 8}
}

def compute_fengshui_qmdj(van, huong_nha_palace, son_cua):
    a2 = get_a2_plate(van)
    phu_thu = DOOR_24_SON[son_cua]
    
    # Hướng nhà can
    huong_nha_can_raw = a2[huong_nha_palace]
    huong_nha_can = huong_nha_can_raw.split('/')[0]
    
    # Find A2 Phù Thủ palace
    a2_phu_thu_palace = None
    for p, stem in a2.items():
        if phu_thu in stem:
            a2_phu_thu_palace = p
            break
            
    # Rings starting from Hướng Nhà
    h_idx = CLOCKWISE_8.index(huong_nha_palace)
    clockwise_from_huong = CLOCKWISE_8[h_idx:] + CLOCKWISE_8[:h_idx]
    
    # A2 ring from Hướng Nhà
    a2_ring = [a2[p] for p in clockwise_from_huong]
    
    # A1 plate: starts with phu_thu at Hướng Nhà, then follows A2 order
    # find phu_thu in a2_ring
    pt_idx = -1
    for i, stem in enumerate(a2_ring):
        if phu_thu in stem:
            pt_idx = i
            break
    a1_ring = a2_ring[pt_idx:] + a2_ring[:pt_idx]
    
    # A3 Star: star of a2_phu_thu_palace
    root_star_name = ORIGINAL_STARS[a2_phu_thu_palace].replace('Thiên ', '')
    s_idx = STAR_RING.index(root_star_name)
    a3_ring = STAR_RING[s_idx:] + STAR_RING[:s_idx]
    
    # A4 Divinity: Trực Phù at Hướng Nhà
    a4_ring = list(DIVINITY_RING)
    
    # A5 Door: Root door of a2_phu_thu_palace
    root_door = ORIGINAL_DOORS[a2_phu_thu_palace]
    # Tra ma trận trực sử
    truc_su_palace = TRUC_SU_MATRIX[huong_nha_can][a2_phu_thu_palace]
    
    # an vòng A5 từ truc_su_palace
    ts_idx = CLOCKWISE_8.index(truc_su_palace)
    clockwise_from_ts = CLOCKWISE_8[ts_idx:] + CLOCKWISE_8[:ts_idx]
    d_idx = DOOR_RING.index(root_door)
    a5_doors = DOOR_RING[d_idx:] + DOOR_RING[:d_idx]
    
    a5_plate_by_palace = {}
    for p, d in zip(clockwise_from_ts, a5_doors):
        a5_plate_by_palace[p] = d
        
    a5_ring_from_huong = [a5_plate_by_palace[p] for p in clockwise_from_huong]
    
    print("=== TEST RESULT ===")
    print("A2 Plate:", a2)
    print("A1 Phù Thủ:", phu_thu)
    print("A2 Hướng Nhà:", huong_nha_can_raw)
    print("A2 Ring from NW:", a2_ring)
    print("A1 Plate (clockwise from NW):", a1_ring)
    print("A2 Phù Thủ Palace:", a2_phu_thu_palace)
    print("A3 Plate:", a3_ring)
    print("Trực Sử Target Palace:", truc_su_palace)
    print("A5 Plate (from NW):", a5_ring_from_huong)
    return True

if __name__ == '__main__':
    compute_fengshui_qmdj(8, 6, 'Thìn')
