import json
import os

src_file = r"C:\Books\Common Study\thuat_toan_lap_que\data\hkdq_core.json"
with open(src_file, "r", encoding="utf-8") as f:
    data = json.load(f)

print("Loaded keys from hkdq_core.json:", list(data.keys()))
print("Hexagrams count:", len(data.get("hexagrams", {})))
print("Tieu khong vong count:", len(data.get("tieu_khong_vong", [])))

core_export = {
    "hexagrams": data.get("hexagrams", {}),
    "tieu_khong_vong": data.get("tieu_khong_vong_matrix", [])
}

js_content = """/**
 * NETA LIGHT - HUYỀN KHÔNG ĐẠI QUÁI CORE DATA (64 QUẺ & 384 HÀO PHÂN KIM)
 * Trích xuất từ CSDL chuẩn Giáo trình Thầy Hạnh Nhật Tấn
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
    print(f"Written {dest}: {os.path.getsize(dest)} bytes ({os.path.getsize(dest)/1024:.1f} KB)")

print("Done exporting hkdq_data.js!")
