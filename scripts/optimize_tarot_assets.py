import os
import sys
import time
from PIL import Image

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

def main():
    src_dir = r"C:\Books\Tarot"
    target_dirs = [
        r"c:\Books\Neta Light\assets\tarot",
        r"c:\Books\Neta Light\mobile_app\assets\www\assets\tarot"
    ]

    for d in target_dirs:
        os.makedirs(d, exist_ok=True)

    png_files = sorted([f for f in os.listdir(src_dir) if f.lower().endswith(".png")])
    total_files = len(png_files)
    print(f"Bắt đầu tối ưu {total_files} tệp ảnh Tarot từ {src_dir}...")

    total_orig_bytes = 0
    total_webp_bytes = 0
    start_time = time.time()

    for idx, f in enumerate(png_files, 1):
        src_path = os.path.join(src_dir, f)
        orig_size = os.path.getsize(src_path)
        total_orig_bytes += orig_size

        webp_name = os.path.splitext(f)[0] + ".webp"
        
        with Image.open(src_path) as img:
            # Resize về chiều rộng chuẩn 720px để hiển thị sắc nét Retina
            target_width = 720
            w_percent = target_width / float(img.size[0])
            target_height = int(float(img.size[1]) * float(w_percent))
            
            # Convert RGBA to RGBA or RGB if necessary
            img_resized = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
            
            # Lưu vào thư mục đầu tiên
            first_dest = os.path.join(target_dirs[0], webp_name)
            img_resized.save(first_dest, "WEBP", quality=85, method=6)
            
            webp_size = os.path.getsize(first_dest)
            total_webp_bytes += webp_size
            
            # Sao chép sang các thư mục đích còn lại
            for d in target_dirs[1:]:
                other_dest = os.path.join(d, webp_name)
                # save directly or copy
                with open(first_dest, "rb") as sf, open(other_dest, "wb") as df:
                    df.write(sf.read())

        if idx % 10 == 0 or idx == total_files:
            print(f"[{idx:02d}/{total_files:02d}] Đã xử lý: {webp_name} ({orig_size/1024/1024:.2f}MB -> {webp_size/1024:.1f}KB)")

    elapsed = time.time() - start_time
    orig_mb = total_orig_bytes / (1024 * 1024)
    webp_mb = total_webp_bytes / (1024 * 1024)
    ratio = (1 - total_webp_bytes / total_orig_bytes) * 100

    print("=" * 60)
    print("🎉 HOÀN THÀNH TỐI ƯU HÓA HÌNH ẢNH TAROT!")
    print(f"Tổng số tệp đã tối ưu: {total_files} lá bài (kèm mặt lưng)")
    print(f"Dung lượng ban đầu (PNG): {orig_mb:.2f} MB")
    print(f"Dung lượng sau tối ưu (WebP): {webp_mb:.2f} MB")
    print(f"Tỷ lệ tiết kiệm dung lượng: {ratio:.1f}%")
    print(f"Thời gian thực thi: {elapsed:.2f} giây")
    print(f"Thư mục lưu trữ 1: {target_dirs[0]}")
    print(f"Thư mục lưu trữ 2: {target_dirs[1]}")
    print("=" * 60)

if __name__ == "__main__":
    main()
