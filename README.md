# API-Tester-Mini
Một công cụ kiểm thử API nhẹ, lấy cảm hứng từ Postman, dùng để gửi các yêu cầu HTTP và hiển thị trực quan các phản hồi JSON trong một giao diện sạch sẽ và thân thiện với người dùng.

## 🚀 Tính năng nổi bật
- **Giao diện hiện đại**: Dark theme phong cách lập trình viên chuyên nghiệp, với hiệu ứng glassmorphism và micro-animations.
- **Hỗ trợ đầy đủ các phương thức HTTP**: GET, POST, PUT, DELETE, PATCH.
- **Vượt rào CORS**: Sử dụng mô hình proxy với C# ASP.NET Core làm backend để gửi request thay cho trình duyệt, giúp bạn dễ dàng test các API từ bất kỳ tên miền nào mà không lo bị lỗi CORS.
- **Cấu hình Request chi tiết**:
  - Hỗ trợ thêm/xóa động (dynamic rows) cho `Query Params` và `Headers`.
  - Tự động đồng bộ `Params` lên URL ngay khi gõ.
  - Hỗ trợ nhập `JSON Body` có tích hợp nút Format {} để tự động làm đẹp code.
- **Trình bày Response trực quan**:
  - Tự động nhận diện định dạng JSON và tô màu (syntax highlighting).
  - Hiển thị đầy đủ Status Code, Response Time (ms), và Size (KB).
  - Liệt kê toàn bộ Response Headers.

## 🛠 Công nghệ sử dụng
- **Backend**: C# ASP.NET Core MVC (Proxy Server, HttpClient).
- **Frontend**: HTML5, Vanilla JavaScript (ES6+), CSS3 (Custom Dark Theme).

## 📥 Hướng dẫn cài đặt & Chạy ứng dụng

### 1. Yêu cầu hệ thống
- Máy tính của bạn cần cài đặt sẵn [.NET 8.0 SDK](https://dotnet.microsoft.com/en-us/download) (hoặc mới hơn).

### 2. Khởi chạy
Mở Terminal hoặc Command Prompt tại thư mục dự án `API-Tester-Mini` và chạy lệnh sau:

```bash
dotnet run
# Hoặc để tự động reload code khi có thay đổi:
dotnet watch run
```

### 3. Truy cập
Sau khi server báo khởi chạy thành công, hãy mở trình duyệt web và truy cập vào địa chỉ mặc định được hiển thị trong terminal, ví dụ:
```text
https://localhost:7083
hoặc
http://localhost:5246
```

## 📖 Hướng dẫn sử dụng cơ bản
1. **Gửi Request**:
   - Chọn phương thức mong muốn (VD: `GET`).
   - Nhập URL vào ô địa chỉ. Ví dụ: `https://jsonplaceholder.typicode.com/posts/1`
   - Nhấn nút **Send**.
2. **Thêm Headers hoặc Body**:
   - Chuyển sang Tab **Headers** để thêm các Header tuỳ chỉnh. Mặc định công cụ đã tích hợp sẵn `Content-Type: application/json`.
   - Nếu bạn dùng POST/PUT, hãy chuyển sang tab **Body**, nhập một chuỗi JSON hợp lệ và nhấn nút `{} Format` nếu muốn mã được thụt lề đẹp mắt.
3. **Xem Kết Quả**:
   - Ngay phía dưới, hệ thống sẽ trả về thẻ **Body** (chứa nội dung JSON có màu sắc) và thẻ **Headers** (danh sách các header trả về).
   - Góc trên của vùng hiển thị sẽ hiển thị trạng thái của Request.

---
*Dự án được xây dựng với mục đích học tập và cung cấp một bộ công cụ hỗ trợ kiểm thử API siêu nhẹ, không cần cài đặt ứng dụng Desktop nặng nề như Postman.*
