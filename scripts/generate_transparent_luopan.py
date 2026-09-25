import math
import os
import sys

def create_transparent_luopan(filepath, size=1800):
    center = size / 2.0
    r_max = (size / 2.0) - 25

    son_24 = [
        ('Tý', 'Khảm', 'Thuỷ', 'Nhâm'), ('Quý', 'Khảm', 'Thuỷ', 'Đinh'),
        ('Sửu', 'Cấn', 'Thổ', 'Mùi'), ('Cấn', 'Cấn', 'Thổ', 'Khôn'),
        ('Dần', 'Cấn', 'Mộc', 'Thân'), ('Giáp', 'Chấn', 'Mộc', 'Canh'),
        ('Mão', 'Chấn', 'Mộc', 'Dậu'), ('Ất', 'Chấn', 'Mộc', 'Tân'),
        ('Thìn', 'Tốn', 'Thổ', 'Tuất'), ('Tốn', 'Tốn', 'Mộc', 'Càn'),
        ('Tỵ', 'Tốn', 'Hoả', 'Hợi'), ('Bính', 'Ly', 'Hoả', 'Nhâm'),
        ('Ngọ', 'Ly', 'Hoả', 'Tý'), ('Đinh', 'Ly', 'Hoả', 'Quý'),
        ('Mùi', 'Khôn', 'Thổ', 'Sửu'), ('Khôn', 'Khôn', 'Thổ', 'Cấn'),
        ('Thân', 'Khôn', 'Kim', 'Dần'), ('Canh', 'Đoài', 'Kim', 'Giáp'),
        ('Dậu', 'Đoài', 'Kim', 'Mão'), ('Tân', 'Đoài', 'Kim', 'Ất'),
        ('Tuất', 'Càn', 'Thổ', 'Thìn'), ('Càn', 'Càn', 'Kim', 'Tốn'),
        ('Hợi', 'Càn', 'Thuỷ', 'Tỵ'), ('Nhâm', 'Khảm', 'Thuỷ', 'Bính')
    ]

    bat_sat_map = {
        'Khảm': 'Thìn', 'Khôn': 'Mão', 'Chấn': 'Thân', 'Tốn': 'Dậu',
        'Càn': 'Ngọ', 'Đoài': 'Tỵ', 'Cấn': 'Dần', 'Ly': 'Hợi'
    }

    tu_28 = [
        'Hư', 'Nguy', 'Thất', 'Bích', 'Khuê', 'Lâu', 'Vị', 'Mão',
        'Tất', 'Chủy', 'Sâm', 'Tỉnh', 'Quỷ', 'Liễu', 'Tinh', 'Trương',
        'Dực', 'Chẩn', 'Giác', 'Cang', 'Đê', 'Phòng', 'Tâm', 'Vĩ',
        'Cơ', 'Đẩu', 'Ngưu', 'Nữ'
    ]

    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}">')
    svg.append('<defs>')
    svg.append('<style>')
    svg.append('''
        text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; text-anchor: middle; dominant-baseline: central; paint-order: stroke fill; stroke: rgba(255,255,255,0.95); stroke-width: 2.2px; stroke-linejoin: round; }
        .ring { fill: none; stroke: rgba(185, 28, 28, 0.75); stroke-width: 1.2; }
        .ring-bold { fill: none; stroke: #b91c1c; stroke-width: 2.5; }
        .tick { stroke: rgba(255,255,255,0.85); stroke-width: 1; }
        .tick-major { stroke: #dc2626; stroke-width: 2.4; }
        .crosshair { stroke: #ef4444; stroke-width: 1.8; stroke-dasharray: 6, 4; }
        .needle-n { fill: #ef4444; filter: drop-shadow(0 0 4px #ffffff); }
        .needle-s { fill: #1e293b; filter: drop-shadow(0 0 4px #ffffff); }
        .txt-deg { font-size: 11px; fill: #0f172a; font-weight: 800; }
        .txt-tu { font-size: 12px; fill: #9a3412; font-weight: 800; }
        .txt-24son { font-size: 18px; fill: #7f1d1d; font-weight: 900; }
        .txt-thienban { font-size: 13px; fill: #0369a1; font-weight: 800; }
        .txt-nhanban { font-size: 13px; fill: #15803d; font-weight: 800; }
        .txt-batsat { font-size: 11px; fill: #b91c1c; font-weight: 800; }
        .txt-quai { font-size: 20px; fill: #991b1b; font-weight: 900; }
    ''')
    svg.append('</style>')
    svg.append('</defs>')

    # 1. Mặt đĩa tròn tổng thể - HOÀN TOÀN TRONG SUỐT (fill="none") ĐỂ HIỆN BẢN ĐỒ VỆ TINH 100%
    svg.append(f'<circle cx="{center}" cy="{center}" r="{r_max}" fill="none" stroke="#b91c1c" stroke-width="4"/>')

    cur_r = r_max
    # TẦNG 1: VÒNG 360 ĐỘ
    r_deg_inner = cur_r - 32
    svg.append(f'<circle cx="{center}" cy="{center}" r="{r_deg_inner}" class="ring"/>')
    for deg in range(360):
        rad = math.radians(deg - 90)
        cos_a = math.cos(rad)
        sin_a = math.sin(rad)
        if deg % 5 == 0:
            x1 = center + cur_r * cos_a
            y1 = center + cur_r * sin_a
            x2 = center + (r_deg_inner + 6) * cos_a
            y2 = center + (r_deg_inner + 6) * sin_a
            tick_cls = "tick-major" if deg % 10 == 0 else "tick"
            svg.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" class="{tick_cls}"/>')
            if deg % 10 == 0:
                rt = r_deg_inner + 16
                xt = center + rt * cos_a
                yt = center + rt * sin_a
                svg.append(f'<text x="{xt:.1f}" y="{yt:.1f}" class="txt-deg" transform="rotate({deg} {xt:.1f} {yt:.1f})">{deg}°</text>')
        else:
            x1 = center + cur_r * cos_a
            y1 = center + cur_r * sin_a
            x2 = center + (cur_r - 8) * cos_a
            y2 = center + (cur_r - 8) * sin_a
            svg.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" class="tick"/>')
    cur_r = r_deg_inner

    # TẦNG 2: 28 TÚ
    r_tu_inner = cur_r - 28
    svg.append(f'<circle cx="{center}" cy="{center}" r="{r_tu_inner}" class="ring"/>')
    step_tu = 360.0 / 28.0
    for i, name in enumerate(tu_28):
        deg = i * step_tu
        rad = math.radians(deg - 90)
        x1 = center + cur_r * math.cos(rad)
        y1 = center + cur_r * math.sin(rad)
        x2 = center + r_tu_inner * math.cos(rad)
        y2 = center + r_tu_inner * math.sin(rad)
        svg.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" class="ring"/>')
        mid_deg = deg + step_tu / 2.0
        mid_rad = math.radians(mid_deg - 90)
        rt = r_tu_inner + 14
        xt = center + rt * math.cos(mid_rad)
        yt = center + rt * math.sin(mid_rad)
        svg.append(f'<text x="{xt:.1f}" y="{yt:.1f}" class="txt-tu" transform="rotate({mid_deg} {xt:.1f} {yt:.1f})">{name}</text>')
    cur_r = r_tu_inner

    # TẦNG 3: THIÊN BÀN PHÙNG CHÂM (+7.5 độ)
    r_tb_inner = cur_r - 35
    svg.append(f'<circle cx="{center}" cy="{center}" r="{r_tb_inner}" class="ring"/>')
    for i, item in enumerate(son_24):
        deg = i * 15.0 + 7.5
        rad = math.radians(deg - 90 - 7.5)
        x1 = center + cur_r * math.cos(rad)
        y1 = center + cur_r * math.sin(rad)
        x2 = center + r_tb_inner * math.cos(rad)
        y2 = center + r_tb_inner * math.sin(rad)
        svg.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="#0369a1" stroke-width="0.8"/>')
        rt = r_tb_inner + 17
        rad_t = math.radians(deg - 90)
        xt = center + rt * math.cos(rad_t)
        yt = center + rt * math.sin(rad_t)
        svg.append(f'<text x="{xt:.1f}" y="{yt:.1f}" class="txt-thienban" transform="rotate({deg} {xt:.1f} {yt:.1f})">{item[0]}</text>')
    cur_r = r_tb_inner

    # TẦNG 4: NHÂN BÀN TRUNG CHÂM (-7.5 độ)
    r_nb_inner = cur_r - 35
    svg.append(f'<circle cx="{center}" cy="{center}" r="{r_nb_inner}" class="ring"/>')
    for i, item in enumerate(son_24):
        deg = i * 15.0 - 7.5
        rad = math.radians(deg - 90 - 7.5)
        x1 = center + cur_r * math.cos(rad)
        y1 = center + cur_r * math.sin(rad)
        x2 = center + r_nb_inner * math.cos(rad)
        y2 = center + r_nb_inner * math.sin(rad)
        svg.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="#15803d" stroke-width="0.8"/>')
        rt = r_nb_inner + 17
        rad_t = math.radians(deg - 90)
        xt = center + rt * math.cos(rad_t)
        yt = center + rt * math.sin(rad_t)
        svg.append(f'<text x="{xt:.1f}" y="{yt:.1f}" class="txt-nhanban" transform="rotate({deg} {xt:.1f} {yt:.1f})">{item[0]}</text>')
    cur_r = r_nb_inner

    # TẦNG 5: ĐỊA BÀN CHÍNH CHÂM (24 SƠN CHÍNH - 0 độ)
    r_db_inner = cur_r - 55
    svg.append(f'<circle cx="{center}" cy="{center}" r="{r_db_inner}" class="ring-bold"/>')
    for i, item in enumerate(son_24):
        deg = i * 15.0
        rad = math.radians(deg - 90 - 7.5)
        x1 = center + cur_r * math.cos(rad)
        y1 = center + cur_r * math.sin(rad)
        x2 = center + r_db_inner * math.cos(rad)
        y2 = center + r_db_inner * math.sin(rad)
        svg.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="#b91c1c" stroke-width="1.8"/>')
        rt = r_db_inner + 28
        rad_t = math.radians(deg - 90)
        xt = center + rt * math.cos(rad_t)
        yt = center + rt * math.sin(rad_t)
        svg.append(f'<text x="{xt:.1f}" y="{yt:.1f}" class="txt-24son" transform="rotate({deg} {xt:.1f} {yt:.1f})">{item[0]}</text>')
    cur_r = r_db_inner

    # TẦNG 6: BÁT SÁT HOÀNG TUYỀN
    r_bs_inner = cur_r - 35
    svg.append(f'<circle cx="{center}" cy="{center}" r="{r_bs_inner}" class="ring"/>')
    for i, cung in enumerate(['Khảm', 'Cấn', 'Chấn', 'Tốn', 'Ly', 'Khôn', 'Đoài', 'Càn']):
        deg = i * 45.0
        rad = math.radians(deg - 90 - 22.5)
        x1 = center + cur_r * math.cos(rad)
        y1 = center + cur_r * math.sin(rad)
        x2 = center + r_bs_inner * math.cos(rad)
        y2 = center + r_bs_inner * math.sin(rad)
        svg.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" class="ring"/>')
        sat = bat_sat_map[cung]
        rt = r_bs_inner + 17
        rad_t = math.radians(deg - 90)
        xt = center + rt * math.cos(rad_t)
        yt = center + rt * math.sin(rad_t)
        svg.append(f'<text x="{xt:.1f}" y="{yt:.1f}" class="txt-batsat" transform="rotate({deg} {xt:.1f} {yt:.1f})">Sát: {sat}</text>')
    cur_r = r_bs_inner

    # TẦNG 7: HẬU THIÊN BÁT QUÁI (Tên 8 Cung)
    r_ht_inner = cur_r - 45
    svg.append(f'<circle cx="{center}" cy="{center}" r="{r_ht_inner}" class="ring-bold"/>')
    cung_names = ['KHẢM', 'CẤN', 'CHẤN', 'TỐN', 'LY', 'KHÔN', 'ĐOÀI', 'CÀN']
    for i, name in enumerate(cung_names):
        deg = i * 45.0
        rad = math.radians(deg - 90 - 22.5)
        x1 = center + cur_r * math.cos(rad)
        y1 = center + cur_r * math.sin(rad)
        x2 = center + r_ht_inner * math.cos(rad)
        y2 = center + r_ht_inner * math.sin(rad)
        svg.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="#8b0000" stroke-width="2.5"/>')
        rt = r_ht_inner + 22
        rad_t = math.radians(deg - 90)
        xt = center + rt * math.cos(rad_t)
        yt = center + rt * math.sin(rad_t)
        svg.append(f'<text x="{xt:.1f}" y="{yt:.1f}" class="txt-quai" transform="rotate({deg} {xt:.1f} {yt:.1f})">{name}</text>')
    cur_r = r_ht_inner

    # TẦNG 8: TIÊN THIÊN BÁT QUÁI (Quái tượng)
    r_tt_inner = cur_r - 45
    svg.append(f'<circle cx="{center}" cy="{center}" r="{r_tt_inner}" class="ring"/>')
    quai_symbols = ['☵', '☶', '☳', '☴', '☲', '☷', '☱', '☰']
    for i, sym in enumerate(quai_symbols):
        deg = i * 45.0
        rt = r_tt_inner + 22
        rad = math.radians(deg - 90)
        xt = center + rt * math.cos(rad)
        yt = center + rt * math.sin(rad)
        svg.append(f'<text x="{xt:.1f}" y="{yt:.1f}" font-size="28" fill="#8b0000" transform="rotate({deg} {xt:.1f} {yt:.1f})">{sym}</text>')
    cur_r = r_tt_inner

    # TẦNG 9: THIÊN TRÌ (AO TRỜI) - HOÀN TOÀN TRONG SUỐT ĐỂ NHÌN THẤY 100% NỀN ĐẤT VÀ MÁI NHÀ
    r_thientri = cur_r
    svg.append(f'<circle cx="{center}" cy="{center}" r="{r_thientri}" fill="none" stroke="#b22222" stroke-width="2.5" stroke-dasharray="6, 4"/>')
    
    # Chữ thập đỏ định vị Thiên Trì
    svg.append(f'<line x1="{center}" y1="{center - r_thientri + 10}" x2="{center}" y2="{center + r_thientri - 10}" class="crosshair"/>')
    svg.append(f'<line x1="{center - r_thientri + 10}" y1="{center}" x2="{center + r_thientri - 10}" y2="{center}" class="crosshair"/>')

    # Kim chỉ nam mỏng thanh lịch
    needle_len = r_thientri * 0.72
    needle_w = 12
    svg.append(f'<polygon points="{center},{center - needle_len} {center - needle_w},{center} {center + needle_w},{center}" class="needle-n"/>')
    svg.append(f'<polygon points="{center},{center + needle_len} {center - needle_w},{center} {center + needle_w},{center}" class="needle-s"/>')
    svg.append(f'<circle cx="{center}" cy="{center}" r="8" fill="#d4af37" stroke="#ffffff" stroke-width="2"/>')
    svg.append(f'<circle cx="{center}" cy="{center}" r="3" fill="#ef4444"/>')

    svg.append(f'<text x="{center}" y="{center - needle_len + 22}" font-size="14" font-weight="900" fill="#ffffff" stroke="#b91c1c" stroke-width="2.5px">N</text>')
    svg.append(f'<text x="{center}" y="{center + needle_len - 22}" font-size="14" font-weight="900" fill="#ffffff" stroke="#1e293b" stroke-width="2.5px">S</text>')

    svg.append('</svg>')

    content = '\n'.join(svg)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Done generating transparent vector SVG: {filepath} ({len(content)} bytes)')

if __name__ == '__main__':
    paths = [
        'c:/Books/Neta Light/assets/lakinh/la_kinh_36_tang_vector.svg',
        'c:/Books/Neta Light/mobile_app/assets/www/assets/lakinh/la_kinh_36_tang_vector.svg'
    ]
    for p in paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        create_transparent_luopan(p)
