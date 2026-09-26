import json
import os
import math

# Danh sách 64 Quẻ chuẩn xác 100% trích xuất từ hình ảnh Thước Lập Cực thực tế
# Đi theo chiều kim đồng hồ từ 0.00° đến 360.00°:
CLOCKWISE_64 = [
    # Cung Khảm (0° - 45°, Hạ Chấn)
    "Địa Lôi Phục", "Sơn Lôi Di", "Thủy Lôi Truân", "Phong Lôi Ích",
    "Thuần Chấn", "Hỏa Lôi Phệ Hạp", "Trạch Lôi Tùy", "Thiên Lôi Vô Vọng",
    # Cung Cấn (45° - 90°, Hạ Ly)
    "Địa Hỏa Minh Di", "Sơn Hỏa Bí", "Thủy Hỏa Ký Tế", "Phong Hỏa Gia Nhân",
    "Lôi Hỏa Phong", "Thuần Ly", "Trạch Hỏa Cách", "Thiên Hỏa Đồng Nhân",
    # Cung Chấn (90° - 135°, Hạ Đoài)
    "Địa Trạch Lâm", "Sơn Trạch Tổn", "Thủy Trạch Tiết", "Phong Trạch Trung Phu",
    "Lôi Trạch Quy Muội", "Hỏa Trạch Khuê", "Thuần Đoài", "Thiên Trạch Lý",
    # Cung Tốn (135° - 180°, Hạ Càn)
    "Địa Thiên Thái", "Sơn Thiên Đại Súc", "Thủy Thiên Nhu", "Phong Thiên Tiểu Súc",
    "Lôi Thiên Đại Tráng", "Hỏa Thiên Đại Hữu", "Trạch Thiên Quải", "Thuần Càn",
    # Cung Ly (180° - 225°, Hạ Tốn)
    "Thiên Phong Cấu", "Trạch Phong Đại Quá", "Hỏa Phong Đỉnh", "Lôi Phong Hằng",
    "Thuần Tốn", "Thủy Phong Tỉnh", "Sơn Phong Cổ", "Địa Phong Thăng",
    # Cung Khôn (225° - 270°, Hạ Khảm)
    "Thiên Thủy Tụng", "Trạch Thủy Khốn", "Hỏa Thủy Vị Tế", "Lôi Thủy Giải",
    "Phong Thủy Hoán", "Thuần Khảm", "Sơn Thủy Mông", "Địa Thủy Sư",
    # Cung Đoài (270° - 315°, Hạ Cấn)
    "Thiên Sơn Độn", "Trạch Sơn Hàm", "Hỏa Sơn Lữ", "Lôi Sơn Tiểu Quá",
    "Phong Sơn Tiệm", "Thủy Sơn Kiển", "Thuần Cấn", "Địa Sơn Khiêm",
    # Cung Càn (315° - 360°, Hạ Khôn)
    "Thiên Địa Bĩ", "Trạch Địa Tụy", "Hỏa Địa Tấn", "Lôi Địa Dự",
    "Phong Địa Quan", "Thủy Địa Tỷ", "Sơn Địa Bác", "Thuần Khôn"
]

SON_24_BOUNDS = [
    ("Tý", "Khảm", 352.5, 7.5),
    ("Quý", "Khảm", 7.5, 22.5),
    ("Sửu", "Cấn", 22.5, 37.5),
    ("Cấn", "Cấn", 37.5, 52.5),
    ("Dần", "Cấn", 52.5, 67.5),
    ("Giáp", "Chấn", 67.5, 82.5),
    ("Mão", "Chấn", 82.5, 97.5),
    ("Ất", "Chấn", 97.5, 112.5),
    ("Thìn", "Tốn", 112.5, 127.5),
    ("Tốn", "Tốn", 127.5, 142.5),
    ("Tỵ", "Tốn", 142.5, 157.5),
    ("Bính", "Ly", 157.5, 172.5),
    ("Ngọ", "Ly", 172.5, 187.5),
    ("Đinh", "Ly", 187.5, 202.5),
    ("Mùi", "Khôn", 202.5, 217.5),
    ("Khôn", "Khôn", 217.5, 232.5),
    ("Thân", "Khôn", 232.5, 247.5),
    ("Canh", "Đoài", 247.5, 262.5),
    ("Dậu", "Đoài", 262.5, 277.5),
    ("Tân", "Đoài", 277.5, 292.5),
    ("Tuất", "Càn", 292.5, 307.5),
    ("Càn", "Càn", 307.5, 322.5),
    ("Hợi", "Càn", 322.5, 337.5),
    ("Nhâm", "Khảm", 337.5, 352.5)
]

def get_son_cung(deg_mid):
    deg = (deg_mid % 360 + 360) % 360
    for son, cung, s, e in SON_24_BOUNDS:
        if s > e: # Vắt qua 0 độ (Sơn Tý: 352.5 - 7.5)
            if deg >= s or deg < e:
                return f"Sơn {son}", f"{cung}"
        else:
            if s <= deg < e:
                return f"Sơn {son}", f"{cung}"
    return "Sơn Tý", "Khảm"

def calibrate_hkdq_data():
    core_json_path = r"C:\Books\Common Study\thuat_toan_lap_que\data\hkdq_core.json"
    with open(core_json_path, "r", encoding="utf-8") as f:
        core_data = json.load(f)

    hexagrams = core_data.get("hexagrams", {})
    print(f"Loaded {len(hexagrams)} hexagrams from {core_json_path}")

    # Chuẩn hóa tên khóa tìm kiếm
    def find_que_key(target_name):
        t = target_name.replace("Bát Thuần", "Thuần").strip()
        for k in hexagrams:
            if k.replace("Bát Thuần", "Thuần").strip() == t:
                return k
        return None

    # Hiệu chỉnh độ số cho từng quẻ theo thứ tự CLOCKWISE_64
    for idx, name in enumerate(CLOCKWISE_64):
        key = find_que_key(name)
        if not key:
            print(f"WARNING: Cannot find hexagram '{name}' in core_data!")
            continue

        q = hexagrams[key]
        deg_start = round(idx * 5.625, 4)
        deg_end = round((idx + 1) * 5.625, 4)
        deg_mid = round(deg_start + 2.8125, 4)
        son_str, cung_str = get_son_cung(deg_mid)

        # Cập nhật thông tin la kinh của quẻ
        lk = q.setdefault("la_kinh", {})
        lk["stt_la_kinh"] = idx + 1
        lk["deg_start"] = deg_start
        lk["deg_end"] = deg_end
        lk["deg_range"] = f"{deg_start:.2f}° - {deg_end:.2f}°"
        lk["son_24"] = son_str
        lk["cung_phuong_vi"] = cung_str

        # Quy luật Bất Biến của Vòng 384 Hào La Kinh (Tiên Thiên 64 Quái Viên Đồ / Thanh Nang Áo Ngữ):
        # "Dương tòng tả biên đoàn đoàn chuyển, Âm tòng hữu lộ thứ đệ phô"
        # - Bán cầu Dương (0° - 180°, Hạ quái Chấn, Ly, Đoài, Càn - Hào Sơ Dương): Quẻ Dương đi THUẬN (Hào 1 -> 6)
        # - Bán cầu Âm (180° - 360°, Hạ quái Tốn, Khảm, Cấn, Khôn - Hào Sơ Âm): Quẻ Âm đi NGHỊCH (Hào 6 -> 1)
        is_duong = (deg_start < 180.0)
        lk["am_duong"] = "Dương" if is_duong else "Âm"
        lk["chieu_hao"] = "Thuận (1 → 6)" if is_duong else "Nghịch (6 → 1)"

        # Cập nhật độ số từng hào theo chiều Thuận / Nghịch
        haos = q.get("haos", [])
        for h in haos:
            h_idx = h["hao_index"] # 1 to 6
            if is_duong:
                slot = h_idx - 1 # Quẻ Dương đi thuận: Hào 1 ở deg_start, Hào 6 ở deg_end
            else:
                slot = 6 - h_idx # Quẻ Âm đi nghịch: Hào 6 ở deg_start, Hào 1 ở deg_end

            h_deg_start = round(deg_start + slot * 0.9375, 4)
            h_deg_end = round(deg_start + (slot + 1) * 0.9375, 4)
            h["deg_start"] = h_deg_start
            h["deg_end"] = h_deg_end
            h["deg_range"] = f"{h_deg_start:.2f}° - {h_deg_end:.2f}°"

    # Lưu lại file JSON
    with open(core_json_path, "w", encoding="utf-8") as f:
        json.dump(core_data, f, ensure_ascii=False, indent=2)
    print(f"Saved calibrated core_data to {core_json_path}")

    # Xuất ra engines/hkdq_data.js và mobile_app/assets/www/engines/hkdq_data.js
    core_export = {
        "hexagrams": core_data.get("hexagrams", {}),
        "tieu_khong_vong": core_data.get("tieu_khong_vong_matrix", [])
    }

    js_content = """/**
 * NETA LIGHT - HUYỀN KHÔNG ĐẠI QUÁI CORE DATA (64 QUẺ & 384 HÀO PHÂN KIM)
 * Khớp chuẩn xác 100% với Thước Lập Cực La Kinh thực tế
 */
(function (global) {
  global.HKDQ_CORE_DATA = """ + json.dumps(core_export, ensure_ascii=False) + """;
})(typeof window !== "undefined" ? window : this);
"""

    dest_paths = [
        r"c:\Books\Neta Light\engines\hkdq_data.js",
        r"c:\Books\Neta Light\mobile_app\assets\www\engines\hkdq_data.js"
    ]

    for dest in dest_paths:
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, "w", encoding="utf-8") as f_out:
            f_out.write(js_content)
        print(f"Exported to {dest} ({os.path.getsize(dest)/1024:.1f} KB)")

if __name__ == "__main__":
    calibrate_hkdq_data()
