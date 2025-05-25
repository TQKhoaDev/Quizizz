# Quizizz Clone - Backend

## Cài đặt và Khởi tạo dự án

### Cài đặt thư viện
```bash
npm install
```

### Cấu hình môi trường
1. Tạo file `.env` dựa trên file `.env.example` (nếu có)
2. Cập nhật thông tin kết nối cơ sở dữ liệu trong `.env`:
```
DATABASE_URL="mysql://username:password@localhost:3306/quizizz"
```

### Khởi tạo cơ sở dữ liệu
1. Tạo database MySQL mới (nếu chưa có):
```sql
CREATE DATABASE quizizz;
```

2. Có hai cách để khởi tạo cơ sở dữ liệu:

#### Cách 1: Sử dụng script tự động
- Windows:
```bash
init-db.bat
```

- Linux/Mac:
```bash
chmod +x init-db.sh
./init-db.sh
```

#### Cách 2: Từng bước thủ công
- Tạo Prisma client:
```bash
npm run prisma:generate
```

- Chạy migration để tạo cấu trúc bảng:
```bash
npm run prisma:migrate
```

- Tạo dữ liệu mẫu:
```bash
npm run prisma:seed
```

3. Xem cơ sở dữ liệu qua Prisma Studio:
```bash
npm run prisma:studio
```

## Chạy ứng dụng

### Môi trường phát triển
```bash
npm run dev
```

### Build và chạy cho production
```bash
npm run build
npm start
```

## Thông tin đăng nhập mẫu

### Admin
- Email: admin@quizizz.com
- Mật khẩu: admin123

### Giáo viên / Giám thị
- Email: proctor@quizizz.com
- Mật khẩu: proctor123

### Học sinh
- Email: student1@quizizz.com / student2@quizizz.com
- Mật khẩu: student123

## Xử lý lỗi phổ biến

### Lỗi với Prisma
Nếu gặp lỗi liên quan đến Prisma, thử các cách sau:

1. Xóa thư mục `node_modules/.prisma` và thư mục `node_modules/@prisma/client`, sau đó:
```bash
npm run prisma:generate
```

2. Nếu gặp lỗi về enum trong seed.ts, thử chạy với cờ `--no-engine`:
```bash
npx prisma generate --no-engine
```

3. Nếu gặp lỗi khi migrate:
```bash
npx prisma migrate reset --force
```

### Lỗi với MySQL
1. Đảm bảo MySQL đang chạy
2. Kiểm tra thông tin kết nối trong file `.env`
3. Kiểm tra quyền của người dùng MySQL

## Cấu trúc cơ sở dữ liệu

Cơ sở dữ liệu bao gồm các bảng chính sau:

1. **users**: Quản lý thông tin người dùng
   - Phân quyền: ADMIN, PROCTOR, STUDENT

2. **quizzes**: Lưu trữ các bài kiểm tra
   - Bao gồm tiêu đề, mô tả, thời gian làm bài, mã tham gia

3. **quiz_questions**: Lưu trữ các câu hỏi trong bài kiểm tra
   - Hỗ trợ các loại câu hỏi: MCQ, TRUE_FALSE, MULTIPLE_SELECT, MATCHING
   - Cấu hình thời gian cho từng câu, điểm số, mức độ khó

4. **question_options**: Lưu trữ các đáp án cho câu hỏi
   - Đánh dấu đáp án đúng/sai
   - Hỗ trợ các thông tin kèm theo như hình ảnh, văn bản ghép đôi

5. **quiz_sessions**: Lưu trữ các phiên kiểm tra thực tế
   - Theo dõi trạng thái, thời gian bắt đầu/kết thúc

6. **participants**: Lưu trữ thông tin người tham gia vào phiên kiểm tra
   - Theo dõi điểm số, thứ hạng

7. **answers**: Lưu trữ câu trả lời của người tham gia
   - Đánh dấu đúng/sai, tính điểm
   - Lưu thời gian phản hồi 