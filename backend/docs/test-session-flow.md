# Hướng dẫn test chức năng quản lý phiên Quiz

Tài liệu này hướng dẫn chi tiết cách test các chức năng liên quan đến quản lý phiên quiz trên Postman.

## 1. Chuẩn bị môi trường

### Cài đặt môi trường Postman
- Tạo môi trường mới "Quizizz Session Testing"
- Thêm các biến môi trường:
  - `baseUrl`: http://localhost:3001 (hoặc URL server của bạn)
  - `token`: (sẽ được cập nhật sau khi đăng nhập)
  - `quizId`: (sẽ được cập nhật sau khi tạo quiz)
  - `sessionId`: (sẽ được cập nhật sau khi tạo phiên)

### Chuẩn bị dữ liệu
- Đăng nhập vào hệ thống với vai trò giáo viên/giám thị
- Tạo sẵn ít nhất một quiz để sử dụng trong các bước test

## 2. Các bước test chức năng quản lý phiên quiz

### Bước 1: Đăng nhập để lấy token
- **Request**:
  - Phương thức: **POST**
  - URL: `{{baseUrl}}/api/auth/login`
  - Body (JSON):
  ```json
  {
    "email": "teacher@example.com",
    "password": "password123"
  }
  ```

- **Xử lý sau khi nhận response**:
  - Lưu giá trị `token` từ response vào biến môi trường `token`

### Bước 2: Lấy danh sách quiz để chọn quiz cần tạo phiên
- **Request**:
  - Phương thức: **GET**
  - URL: `{{baseUrl}}/api/quizzes`
  - Headers:
    - Authorization: Bearer {{token}}

- **Xử lý sau khi nhận response**:
  - Chọn một quiz và lưu `id` của quiz đó vào biến môi trường `quizId`

### Bước 3: Tạo phiên quiz mới
- **Request**:
  - Phương thức: **POST**
  - URL: `{{baseUrl}}/api/sessions`
  - Headers:
    - Authorization: Bearer {{token}}
    - Content-Type: application/json
  - Body (JSON):
  ```json
  {
    "quizId": "{{quizId}}"
  }
  ```

- **Response mong đợi**:
  ```json
  {
    "success": true,
    "data": {
      "id": "session_id",
      "code": "ABCDEF",
      "status": "PENDING",
      "startTime": null,
      "endTime": null,
      "quizId": "quiz_id",
      "proctorId": "user_id",
      "createdAt": "2023-05-25T10:00:00Z",
      "updatedAt": "2023-05-25T10:00:00Z",
      "quiz": {
        "id": "quiz_id",
        "title": "Tên Quiz"
      }
    }
  }
  ```

- **Xử lý sau khi nhận response**:
  - Lưu giá trị `data.id` vào biến môi trường `sessionId`
  - Lưu giá trị `data.code` vào biến môi trường `sessionCode` để sử dụng sau này

### Bước 4: Lấy thông tin chi tiết phiên quiz vừa tạo
- **Request**:
  - Phương thức: **GET**
  - URL: `{{baseUrl}}/api/sessions/{{sessionId}}`
  - Headers:
    - Authorization: Bearer {{token}}

- **Response mong đợi**:
  ```json
  {
    "success": true,
    "data": {
      "id": "{{sessionId}}",
      "code": "ABCDEF",
      "status": "PENDING",
      "startTime": null,
      "endTime": null,
      "quizId": "quiz_id",
      "proctorId": "user_id",
      "quiz": {
        "id": "quiz_id",
        "title": "Tên Quiz",
        "questions": [
          {
            "id": "question_id",
            "content": "Nội dung câu hỏi",
            "options": []
          }
        ]
      },
      "participants": []
    }
  }
  ```

- **Kiểm tra**:
  - Trạng thái phiên quiz là "PENDING"
  - Thời gian bắt đầu và kết thúc là null
  - Danh sách người tham gia rỗng

### Bước 5: Bắt đầu phiên quiz
- **Request**:
  - Phương thức: **PUT**
  - URL: `{{baseUrl}}/api/sessions/{{sessionId}}/start`
  - Headers:
    - Authorization: Bearer {{token}}

- **Response mong đợi**:
  ```json
  {
    "success": true,
    "data": {
      "id": "{{sessionId}}",
      "code": "ABCDEF",
      "status": "ACTIVE",
      "startTime": "2023-05-25T10:10:00Z",
      "endTime": null,
      "quizId": "quiz_id",
      "proctorId": "user_id",
      "quiz": {
        "id": "quiz_id",
        "title": "Tên Quiz"
      },
      "participants": []
    }
  }
  ```

- **Kiểm tra**:
  - Trạng thái phiên quiz đã chuyển thành "ACTIVE"
  - Thời gian bắt đầu đã được cập nhật
  - Thời gian kết thúc vẫn là null

### Bước 6: Có thể mở tab Postman mới để test tham gia phiên quiz
- Sử dụng mã phòng `sessionCode` đã lưu trước đó để test chức năng tham gia với vai trò học sinh
- Thực hiện các bước trong file hướng dẫn "test-quiz-guest-flow.md"

### Bước 7: Lấy danh sách phiên quiz của người dùng hiện tại
- **Request**:
  - Phương thức: **GET**
  - URL: `{{baseUrl}}/api/sessions`
  - Headers:
    - Authorization: Bearer {{token}}

- **Response mong đợi**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "{{sessionId}}",
        "code": "ABCDEF",
        "status": "ACTIVE",
        "startTime": "2023-05-25T10:10:00Z",
        "endTime": null,
        "quizId": "quiz_id",
        "proctorId": "user_id",
        "quiz": {
          "id": "quiz_id",
          "title": "Tên Quiz"
        },
        "_count": {
          "participants": 0
        }
      }
    ]
  }
  ```

- **Kiểm tra**:
  - Phiên quiz vừa tạo có trong danh sách
  - Thông tin trạng thái và thời gian chính xác

### Bước 8: Kết thúc phiên quiz
- **Request**:
  - Phương thức: **PUT**
  - URL: `{{baseUrl}}/api/sessions/{{sessionId}}/end`
  - Headers:
    - Authorization: Bearer {{token}}

- **Response mong đợi**:
  ```json
  {
    "success": true,
    "data": {
      "id": "{{sessionId}}",
      "code": "ABCDEF",
      "status": "COMPLETED",
      "startTime": "2023-05-25T10:10:00Z",
      "endTime": "2023-05-25T10:30:00Z",
      "quizId": "quiz_id",
      "proctorId": "user_id",
      "quiz": {
        "id": "quiz_id",
        "title": "Tên Quiz"
      },
      "participants": []
    }
  }
  ```

- **Kiểm tra**:
  - Trạng thái phiên quiz đã chuyển thành "COMPLETED"
  - Thời gian kết thúc đã được cập nhật

### Bước 9: Kiểm tra xếp hạng người tham gia
- **Request**:
  - Phương thức: **GET**
  - URL: `{{baseUrl}}/api/sessions/{{sessionId}}`
  - Headers:
    - Authorization: Bearer {{token}}

- **Response mong đợi**:
  ```json
  {
    "success": true,
    "data": {
      "id": "{{sessionId}}",
      "status": "COMPLETED",
      "participants": [
        {
          "id": "participant_id",
          "score": 10,
          "rank": 1,
          "user": {
            "fullName": "Nguyễn Văn A",
            "isGuest": false
          }
        }
      ]
    }
  }
  ```

- **Kiểm tra**:
  - Danh sách người tham gia được trả về
  - Mỗi người tham gia có thông tin về điểm số và xếp hạng

## 3. Kiểm tra các tình huống đặc biệt

### Kiểm tra khi bắt đầu phiên quiz đã bắt đầu
- Tạo một phiên quiz mới
- Gọi API bắt đầu phiên quiz
- Gọi lại API bắt đầu phiên quiz lần nữa
- Kiểm tra response có thông báo lỗi phù hợp không

### Kiểm tra khi kết thúc phiên quiz chưa bắt đầu
- Tạo một phiên quiz mới (trạng thái PENDING)
- Gọi API kết thúc phiên quiz
- Kiểm tra response có thông báo lỗi phù hợp không

### Kiểm tra khi kết thúc phiên quiz đã kết thúc
- Tạo một phiên quiz mới
- Gọi API bắt đầu phiên quiz
- Gọi API kết thúc phiên quiz
- Gọi lại API kết thúc phiên quiz lần nữa
- Kiểm tra response có thông báo lỗi phù hợp không

### Kiểm tra khi hủy phiên quiz
- Tạo một phiên quiz mới
- Gọi API hủy phiên quiz (`/api/sessions/:sessionId/cancel`)
- Kiểm tra trạng thái chuyển thành "CANCELLED"

### Kiểm tra quyền truy cập
- Đăng nhập với tài khoản học sinh
- Thử gọi các API quản lý phiên quiz
- Kiểm tra các response có yêu cầu xác thực phù hợp không 