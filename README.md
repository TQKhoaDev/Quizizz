# Quizizz Clone

## Giới thiệu
Quizizz Clone là nền tảng giáo dục trực tuyến hiện đại cho phép tạo và quản lý các bài kiểm tra theo thời gian thực. Hệ thống hỗ trợ giáo viên tạo bộ câu hỏi và tổ chức kiểm tra, đồng thời học sinh có thể tham gia làm bài tương tác. **Hiện tại, dự án tập trung vào phần thi trắc nghiệm với khả năng mở rộng sang thi tự luận trong tương lai.**

## Kiến trúc hệ thống
- **Backend**: Node.js + Express + TypeScript
  - REST API cho tương tác không đồng bộ
  - WebSocket (Socket.IO) cho giao tiếp thời gian thực
  - Redis để cache và xử lý phân tán
- **Database**: MySQL với Prisma ORM
- **Xác thực**: JWT (JSON Web Token)
- **Phân quyền**: Dựa trên vai trò (ADMIN, PROCTOR, STUDENT)

## Mô hình dữ liệu
- **Quiz**: Mẫu bài kiểm tra, bao gồm thông tin và danh sách câu hỏi
- **QuizQuestion**: Câu hỏi trong bài kiểm tra
  - **MCQ**: Câu hỏi trắc nghiệm nhiều lựa chọn
  - **TRUE_FALSE**: Câu hỏi đúng/sai
  - **MULTIPLE_SELECT**: Câu hỏi nhiều đáp án đúng
  - **MATCHING**: Câu hỏi ghép đôi
  - **ESSAY** *(phát triển tương lai)*: Câu hỏi tự luận
- **QuizSession**: Phiên làm bài thực tế
- **Participant**: Người tham gia vào phiên kiểm tra
- **User**: Quản lý người dùng với các vai trò khác nhau

## Tính năng chính
1. **Quản lý Quiz trắc nghiệm**:
   - Tạo và chỉnh sửa bài kiểm tra
   - Thêm câu hỏi trắc nghiệm đa dạng (MCQ, TRUE/FALSE, MULTIPLE_SELECT, MATCHING)
   - Cấu hình thời gian cho từng câu hỏi
   - Thiết lập điểm số và mức độ khó

2. **Phòng học trực tuyến**:
   - Tạo phòng với mã độc nhất
   - Chat và giao tiếp thời gian thực
   - Hỗ trợ cuộc gọi thoại qua WebRTC

3. **Phiên kiểm tra thời gian thực**:
   - Đồng bộ câu hỏi đến người tham gia
   - Tính giờ cho từng câu hỏi
   - Hiển thị đáp án đúng sau mỗi câu hỏi
   - Bảng xếp hạng theo thời gian thực
   - Chống gian lận với tính năng khóa màn hình

4. **Phân tích kết quả**:
   - Thống kê điểm số của người tham gia
   - Phân tích câu hỏi dễ/khó
   - Biểu đồ phân phối điểm số
   - Xuất báo cáo kết quả

## Định hướng phát triển
1. **Thi trắc nghiệm (ưu tiên hiện tại)**:
   - Hệ thống chấm điểm tự động
   - Đa dạng loại câu hỏi trắc nghiệm
   - Hỗ trợ hình ảnh và video trong câu hỏi
   - Tạo ngân hàng câu hỏi

2. **Mở rộng sang thi tự luận (tương lai)**:
   - Hỗ trợ câu hỏi tự luận với trình soạn thảo rich-text
   - Công cụ đánh giá tự luận cho giáo viên
   - Tính năng AI hỗ trợ chấm điểm
   - So sánh bài làm để phát hiện đạo văn

## Giai đoạn phát triển
### Giai đoạn 1: Nền tảng cơ bản (Sprint 1-2)
- Thiết lập kiến trúc microservice và cơ sở dữ liệu
- Xây dựng hệ thống xác thực và phân quyền người dùng
- Phát triển API quản lý người dùng và quiz cơ bản
- Thiết kế giao diện quản lý quiz đơn giản

### Giai đoạn 2: Trắc nghiệm cơ bản (Sprint 3-4)
- Hoàn thiện hệ thống tạo và quản lý câu hỏi trắc nghiệm
- Phát triển phòng thi với mã tham gia
- Xây dựng cơ chế đồng bộ câu hỏi qua WebSocket
- Tạo bảng xếp hạng thời gian thực

### Giai đoạn 3: Tính năng nâng cao (Sprint 5-6)
- Thêm các loại câu hỏi đa dạng (ghép đôi, nhiều đáp án)
- Tích hợp hệ thống phân tích kết quả và thống kê
- Phát triển tính năng chống gian lận
- Cải thiện UX/UI và trải nghiệm người dùng

### Giai đoạn 4: Mở rộng và tối ưu (Sprint 7-8)
- Tối ưu hóa hiệu năng và khả năng mở rộng
- Xây dựng ngân hàng câu hỏi và chức năng import/export
- Thêm tính năng hỗ trợ hình ảnh và video trong câu hỏi
- Chuẩn bị hạ tầng cho việc mở rộng sang thi tự luận

### Giai đoạn 5: Tích hợp tự luận (Sprint 9-10)
- Phát triển mô hình dữ liệu và API cho câu hỏi tự luận
- Xây dựng trình soạn thảo rich-text cho câu trả lời
- Thiết kế giao diện chấm điểm cho giáo viên
- Nghiên cứu và tích hợp AI hỗ trợ chấm điểm (thử nghiệm)

## Công nghệ và công cụ
- **Backend**: Node.js, Express, TypeScript
- **Database**: MySQL, Prisma ORM
- **Cache**: Redis
- **Giao tiếp thời gian thực**: Socket.IO, WebRTC
- **DevOps**: Docker, Redis adapter

## Khả năng mở rộng
- Mở rộng theo chiều ngang với nhiều instance backend
- Caching thông minh giảm tải database
- Xử lý hàng nghìn kết nối đồng thời 

## Quy tắc dự án
### Quy tắc phát triển
1. **Git Flow**:
   - `main`: code sản phẩm đã sẵn sàng triển khai
   - `develop`: code đang phát triển
   - `feature/*`: phát triển tính năng mới
   - `bugfix/*`: sửa lỗi
   - `release/*`: chuẩn bị cho phiên bản mới

2. **Quy trình commit**:
   - Mỗi commit phải có mô tả rõ ràng về thay đổi
   - Format: `[type]: mô tả ngắn gọn` (type: feat, fix, docs, style, refactor, test, chore)
   - Mỗi tính năng cần tạo Pull Request riêng biệt

3. **Code Review**:
   - Mọi code phải được review bởi ít nhất một thành viên khác
   - Sửa tất cả các comments trước khi merge
   - Kiểm tra lại các tiêu chuẩn mã nguồn trước khi yêu cầu review

### Quy tắc mã nguồn
1. **Chuẩn mã nguồn**:
   - Tuân thủ ESLint và Prettier đã cấu hình
   - Sử dụng TypeScript cho mọi file mã nguồn
   - Đảm bảo coverage kiểm thử đạt tối thiểu 80%

2. **Cấu trúc dự án**:
   - Tuân thủ kiến trúc đã được thiết kế
   - Tách biệt rõ ràng giữa các lớp (controller, service, repository)
   - Đặt tên file theo chuẩn: kebab-case.ts

3. **Xử lý lỗi**:
   - Xử lý lỗi đồng nhất qua ErrorHandler
   - Log đầy đủ thông tin lỗi
   - Trả về response chuẩn hóa khi có lỗi

### Quy tắc hợp tác
1. **Giao tiếp**:
   - Daily standup meeting (15 phút)
   - Weekly review (1 giờ)
   - Báo cáo vướng mắc sớm và rõ ràng

2. **Phân công**:
   - Mỗi tính năng cần có người chịu trách nhiệm chính
   - Chia nhỏ công việc và cập nhật trạng thái trên Jira/Trello
   - Ước tính thời gian thực hiện mỗi task

3. **Tài liệu**:
   - Cập nhật tài liệu API sau mỗi thay đổi
   - Viết tài liệu hướng dẫn cho tính năng mới
   - Comment code phức tạp

### Quy tắc kiểm thử
1. **Unit Test**:
   - Viết test cho mọi hàm/phương thức quan trọng
   - Sử dụng Jest hoặc Mocha + Chai
   - Tập trung vào kiểm thử các trường hợp biên

2. **Integration Test**:
   - Kiểm thử API endpoints 
   - Kiểm thử các tương tác giữa các service
   - Sử dụng môi trường test độc lập

3. **End-to-End Test**:
   - Kiểm thử các luồng người dùng chính
   - Sử dụng Cypress hoặc Playwright
   - Tự động hóa cho CI/CD pipeline

### Quy tắc triển khai
1. **Môi trường**:
   - Development: cho phát triển
   - Staging: cho kiểm thử UAT
   - Production: cho người dùng cuối

2. **CI/CD**:
   - Tự động chạy test cho mọi PR
   - Tự động triển khai lên môi trường tương ứng
   - Rollback tự động nếu phát hiện lỗi

3. **Monitoring**:
   - Theo dõi hiệu suất hệ thống
   - Cảnh báo khi có lỗi nghiêm trọng
   - Log đầy đủ cho việc debug 

## Tích hợp AI vào quy trình phát triển
### Cấu hình AI cho dự án
1. **Tài liệu hướng dẫn cho AI**:
   - Tạo file `ai-guidelines.md` mô tả chi tiết về kiến trúc, quy tắc mã nguồn
   - Cung cấp ví dụ code mẫu cho từng thành phần (controller, service, model)
   - Liệt kê các mẫu thiết kế (design patterns) được áp dụng trong dự án

2. **Cấu hình AI trong IDE**:
   - Sử dụng Cursor hoặc GitHub Copilot với cấu hình tùy chỉnh
   - Trỏ AI đến tài liệu quy tắc của dự án
   - Tạo file `.aiconfig` hoặc tương tự tại thư mục gốc

3. **Chuẩn hóa mã nguồn**:
   - Sử dụng file cấu hình chung cho ESLint, Prettier
   - Tạo snippets chuẩn hóa để AI tham khảo
   - Định nghĩa rõ cấu trúc thư mục và quy ước đặt tên

### Huấn luyện AI
1. **Cung cấp ngữ cảnh**:
   - Tạo file `.eslintrc.js` và `.prettierrc` với quy tắc rõ ràng
   - Viết mã nguồn mẫu cho các thành phần chính
   - Đặt comment hướng dẫn tại các vị trí quan trọng

2. **Chuẩn hóa prompt**:
   - Tạo templates prompt cho các tác vụ phổ biến
   - Mô tả chi tiết yêu cầu khi giao tiếp với AI
   - Luôn đề cập đến quy tắc dự án trong prompt

3. **Phản hồi và điều chỉnh**:
   - Review code do AI tạo ra và cung cấp phản hồi
   - Điều chỉnh prompt dựa trên kết quả nhận được
   - Tạo bộ sưu tập các prompt hiệu quả

### Quy trình làm việc với AI
1. **Quy trình tạo code mới**:
   - Cung cấp cho AI tổng quan về tính năng cần phát triển
   - Tham chiếu đến các phần code tương tự hiện có
   - Yêu cầu AI tuân thủ các quy tắc và cấu trúc dự án

2. **Quy trình review code**:
   - Sử dụng AI để kiểm tra tuân thủ quy tắc
   - Yêu cầu AI tìm các lỗi tiềm ẩn và vấn đề bảo mật
   - Đánh giá tính nhất quán với phần còn lại của codebase

3. **Tích hợp vào CI/CD**:
   - Sử dụng AI trong quá trình CI để kiểm tra chất lượng code
   - Tự động hóa việc kiểm tra tuân thủ quy tắc
   - Tạo báo cáo về sự tuân thủ quy tắc dự án

### Thư mục và file cấu hình
```
project-root/
├── .aiconfig                  # Cấu hình cho AI tools
├── docs/
│   ├── ai-guidelines.md       # Hướng dẫn cho AI
│   └── code-examples/         # Ví dụ code mẫu
├── .eslintrc.js               # Quy tắc ESLint
├── .prettierrc                # Quy tắc Prettier
└── templates/
    └── ai-prompts/            # Mẫu prompt cho AI
```

### Ví dụ prompt chuẩn
```
Tạo một controller mới cho tính năng [tên tính năng] với các yêu cầu sau:
- Tuân thủ cấu trúc controller hiện tại trong src/controllers
- Sử dụng các decorators từ thư viện X
- Implement các phương thức CRUD cơ bản
- Thêm xử lý lỗi theo ErrorHandler hiện có
- Tuân thủ quy tắc đặt tên kebab-case.ts cho file
- Đảm bảo 100% type safety

Tham khảo file mẫu: src/controllers/quiz-controller.ts
``` 