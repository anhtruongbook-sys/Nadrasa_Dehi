# NETA LIGHT - Pháp Môn Nadrasa Dehi 🪷

Ứng dụng bốc bài Neta Light (48 quân bài năng lượng) dành cho thiết bị di động (Android, iOS) và trình duyệt máy tính.

---

## 🌟 Tính Năng Nổi Bật

- **Bộ bài chuẩn 48 quân**: Hình ảnh, tần số năng lượng (226, 227, 225, 224, 223...), biểu tượng và lời khuyên hành pháp chuẩn xác theo tư liệu Pháp môn Nadrasa Dehi.
- **Mặt lưng bài Pháp Ấn**: Hoa văn đỏ viền vàng với Pháp Ấn trung tâm cùng hiệu ứng lật bài 3D mượt mà.
- **Các chế độ bốc linh hoạt**:
  - `Rút 1 lá`: Xem thông điệp trong ngày.
  - `Rút 3 lá`: Trải 3 lá bài hàng ngang.
  - `Rút 10 lá`: Cách bốc chính của Pháp môn, xếp chuẩn thành 2 hàng × 5 cột đối xứng hoàn hảo.
  - `➕ Rút thêm 1 lá`: Cho phép rút thêm từng lá vào bất kỳ lúc nào, hệ thống tự động co giãn và bổ sung bài ngay ngắn.
- **Chạm phóng to (Card Zoom Modal)**: Chạm vào bất kỳ lá nào trên màn hình để xem ảnh phóng to, tần số năng lượng, ý nghĩa và lời khuyên hành pháp.
- **Âm thanh Chuông Thiền (Offline)**: Tích hợp âm thanh chuông thiền tần số 432Hz và 528Hz bằng Web Audio API native, hoạt động 100% offline không cần internet.
- **Hỗ trợ PWA Cài Đặt (Add to Home Screen)**: Cài đặt trực tiếp lên màn hình điện thoại iPhone (Safari) hoặc Android (Chrome) với Icon Pháp Ấn riêng, mở chạy toàn màn hình (full-screen) như Native App.

---

## 📱 Cài Đặt & Sử Dụng

### 1. Mở trực tiếp trên Trình duyệt Máy tính
- Mở file `index.html` trực tiếp bằng trình duyệt (Chrome, Edge, Safari, Firefox).
- Hoặc bấm đúp chuột vào file `start_app.bat` để khởi động máy chủ cục bộ và truy cập `http://localhost:8080`.

### 2. Sử dụng trên Điện thoại (iPhone / Android)
1. Kết nối điện thoại vào cùng mạng Wi-Fi với máy chủ.
2. Mở trình duyệt điện thoại truy cập theo địa chỉ IP máy chủ (ví dụ `http://<IP_MAY_TINH>:8080`).
3. **Cài đặt vào màn hình chính**:
   - **Trên iPhone (Safari)**: Bấm nút **Chia sẻ** (ô vuông mũi tên lên) $\rightarrow$ Chọn **"Thêm vào màn hình chính" (Add to Home Screen)**.
   - **Trên Android (Chrome)**: Bấm menu **3 chấm** $\rightarrow$ Chọn **"Cài đặt ứng dụng"** hoặc **"Thêm vào màn hình chính"**.

---

## 📂 Cấu Trúc Thư Mục

```text
├── index.html          # Giao diện chính Mobile-First PWA
├── styles.css          # Định dạng giao diện & động cơ Responsive Grid
├── app.js              # Thuật toán bốc bài & logic lật bài 3D
├── cards_data.js       # Dữ liệu từ điển 48 quân bài Neta Light
├── manifest.json       # Cấu hình PWA & thông tin ứng dụng di động
├── sw.js               # Service Worker hỗ trợ chạy Offline
├── start_app.bat       # Script khởi chạy máy chủ cục bộ 1-click
├── neta_cards/         # Thư mục 48 ảnh quân bài + mặt lưng bài + Pháp Ấn
├── icons/              # Thư mục icon ứng dụng đa kích thước (PWA/iOS/Android)
└── favicon.ico         # Biểu tượng tab trình duyệt
```
