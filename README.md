# HỆ THỐNG WEBQUEST LỊCH SỬ VÀ ĐỊA LÍ 5 - TRƯỜNG TIỂU HỌC TRUNG NHỨT
## SẢN PHẨM SỐ PHỤC VỤ SÁNG KIẾN KINH NGHIỆM NĂM HỌC 2026

Dự án website học tập trực tuyến được xây dựng theo mô hình **WebQuest 4.0** kết hợp **Trí tuệ nhân tạo (AI)**, thiết kế mở, lưu trữ trực tuyến, tối ưu hoá tương tác hai chiều và nộp bài siêu tối giản dành riêng cho học sinh lớp 5A2 Trường Tiểu học Trung Nhứt (quận Thốt Nốt, thành phố Cần Thơ).

---

## I. TỔNG QUAN TÍNH NĂNG NỔI BẬT

1. **4 Không gian WebQuest chuẩn 6 bước:**
   - **Chủ đề 2:** Những quốc gia đầu tiên trên lãnh thổ Việt Nam (Văn Lang, Âu Lạc, Phù Nam - di sản Óc Eo Nam Bộ, Chăm-pa).
   - **Chủ đề 3:** Xây dựng và bảo vệ đất nước Việt Nam (Chiến dịch Điện Biên Phủ 1954 và Đại thắng mùa Xuân 30/4/1975).
   - **Chủ đề 5:** Tìm hiểu thế giới (Văn minh Ai Cập & Văn minh Hy Lạp cổ đại).
   - **Chủ đề 6:** Chung tay xây dựng thế giới (Bảo vệ môi trường kênh rạch quê hương Thốt Nốt & Gìn giữ hoà bình).

2. **Cơ chế nộp bài Siêu Tối Giản 1 chạm cho học sinh lớp 5:**
   - Hoàn toàn **không cần tài khoản / không cần mật khẩu**.
   - **Chụp ảnh trực tiếp bằng Camera:** Bật webcam/camera chụp thẳng trang vở ghi hoặc tranh vẽ, bấm gửi bài.
   - **Ghi âm trực tiếp qua Micro:** Bấm nút đỏ để nói lời bình lịch sử hoặc giải pháp địa lí, tự động lưu file âm thanh.
   - **Bảng Vinh Danh & Pháo hoa Confetti:** Tên nhóm và sản phẩm hiển thị ngay lập tức kèm huy hiệu số và lời khen của giáo viên.

3. **Trợ lý AI Sư phạm Thông minh (AI Persona):**
   - Đóng vai tương ứng theo từng chủ đề: *Bác Ba Khảo Cổ*, *Anh Chiến Sĩ Sao Vuông*, *Nhà Du Hành Herodotus*, *Bạn Xanh Gaia*.
   - Hướng dẫn tư duy, gợi mở phương pháp, tuyệt đối không đưa sẵn đáp án bài tập.

4. **Phân hệ Cài đặt Giáo viên (Teacher Admin Studio):**
   - Mở khóa bằng mã PIN bảo mật: **`5A2TN`**.
   - Giáo viên có thể trực tiếp Thêm, Sửa, Xoá bài học, đổi nội dung 6 bước WebQuest và cấu hình Trợ lý AI ngay trên trang web.
   - Hỗ trợ nút xuất tệp `topics.json` và nút khôi phục dữ liệu gốc chuẩn mực.

5. **Ngôn ngữ thiết kế Pastel nam tính trang nhã:**
   - Tone màu điềm đạm, vững chãi: *Slate Navy*, *Muted Bronze*, *Muted Crimson*, *Deep Azure*, *Sage Earth*.
   - Tương phản văn bản đạt chuẩn WCAG AA ($\ge 4.5:1$), bảo vệ thị lực học sinh.

---

## II. HƯỚNG DẪN TRIỂN KHAI LÊN GITHUB PAGES TRONG 3 PHÚT

### Bước 1: Khởi tạo kho mã nguồn trên GitHub
1. Đăng nhập vào [GitHub](https://github.com/).
2. Nhấn nút **New Repository**, đặt tên kho: `webquest-lsdl5-trungnhut`.
3. Chọn chế độ **Public** $\rightarrow$ Nhấn **Create repository**.

### Bước 2: Tải mã nguồn lên GitHub
Mở PowerShell hoặc Terminal tại thư mục này và chạy các lệnh:
```bash
git init
git add .
git commit -m "Phát hành hệ thống WebQuest Lịch sử và Địa lí 5 - Tiểu học Trung Nhứt"
git branch -M main
git remote add origin https://github.com/[TÊN-TÀI-KHOẢN-CỦA-BẠN]/webquest-lsdl5-trungnhut.git
git push -u origin main
```
*(Hoặc kéo thả toàn bộ các file `index.html`, `README.md`, thư mục `assets` và `data` trực tiếp lên giao diện Web của GitHub).*

### Bước 3: Kích hoạt GitHub Pages
1. Tại repository trên GitHub, vào mục **Settings** $\rightarrow$ chọn thẻ **Pages** ở cột bên trái.
2. Tại mục **Branch**, chọn nhánh **`main`**, thư mục **`/ (root)`** $\rightarrow$ Nhấn **Save**.
3. Sau 1 - 2 phút, website sẽ hoạt động chính thức tại địa chỉ:
   ```
   https://[TÊN-TÀI-KHOẢN-CỦA-BẠN].github.io/webquest-lsdl5-trungnhut/
   ```

---

## III. CÁCH ĐƯA MINH CHỨNG VÀO HỒ SƠ SÁNG KIẾN KINH NGHIỆM

1. **In mã QR:** Dùng trang [me-qr.com](https://me-qr.com/) hoặc tính năng tạo QR trên trình duyệt Chrome để tạo mã QR dẫn thẳng về link GitHub Pages của bạn. Chèn ảnh mã QR này vào trang bìa phụ và Phụ lục SKKN kèm chú thích:
   > *"Quét mã QR để truy cập trực tiếp Website WebQuest bài giảng lớp 5A2 đã được tác giả triển khai trong thực tế."*
2. **Ảnh chụp minh chứng thực nghiệm:** Chụp ảnh học sinh lớp 5A2 ngồi học tại phòng tin học trường Tiểu học Trung Nhứt đang thao tác trên website và chụp ảnh bài làm để in vào mục Hiệu quả của sáng kiến.
