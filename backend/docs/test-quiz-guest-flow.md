# Hướng dẫn test chức năng tham gia Quiz với tư cách khách

Tài liệu này hướng dẫn chi tiết cách test chức năng tham gia quiz với tư cách người dùng khách (không cần đăng nhập) trên Postman.

## 1. Chuẩn bị môi trường

### Cài đặt môi trường Postman
- Tạo môi trường mới "Quizizz Guest Testing"
- Thêm biến môi trường:
  - `baseUrl`: http://localhost:3001 (hoặc URL server của bạn)

### Chuẩn bị dữ liệu
- Đảm bảo đã có sẵn ít nhất một phiên quiz đang hoạt động
- Ghi lại mã code của phiên quiz để sử dụng

## 2. Các bước test chức năng khách

### Bước 1: Tham gia phiên quiz với tư cách khách
- **Request**:
  - Phương thức: **POST**
  - URL: `{{baseUrl}}/api/quizzes/join`
  - Body (JSON):
  ```json
  {
    "code": "ABC123",
    "displayName": "Người chơi ẩn danh"
  }
  ```

- **Response mong đợi**:
  ```json
  {
    "success": true,
    "data": {
      "session": {
        "id": "session_id",
        "code": "ABC123",
        "status": "ACTIVE",
        "startTime": "2023-05-25T10:00:00Z",
        "endTime": null
      },
      "quiz": {
        "id": "quiz_id",
        "title": "Tên Quiz",
        "description": "Mô tả Quiz"
      },
      "participant": {
        "id": "participant_id",
        "userId": "user_id_của_tài_khoản_khách",
        "sessionId": "session_id",
        "score": 0,
        "joinTime": "2023-05-25T10:05:00Z"
      }
    }
  }
  ```

- **Kiểm tra**:
  - Response trả về có chứa thông tin participant
  - userId trong participant là ID của người dùng khách vừa được tạo

### Bước 2: Lưu thông tin người tham gia
- Lưu giá trị `participant.id` và `session.id` vào biến môi trường để sử dụng cho các request tiếp theo:
  - `participantId`: ID của người tham gia
  - `sessionId`: ID của phiên quiz đang tham gia

### Bước 3: Lấy danh sách câu hỏi của phiên quiz
- **Request**:
  - Phương thức: **GET**
  - URL: `{{baseUrl}}/api/sessions/{{sessionId}}/questions`
  - Params:
    - participantId: {{participantId}}

- **Response mong đợi**:
  ```json
  {
    "success": true,
    "data": {
      "questions": [
        {
          "id": "question_id_1",
          "content": "Nội dung câu hỏi 1",
          "type": "MCQ",
          "options": [
            {
              "id": "option_id_1",
              "content": "Đáp án A"
            },
            {
              "id": "option_id_2",
              "content": "Đáp án B"
            }
          ]
        }
      ]
    }
  }
  ```

- **Kiểm tra**:
  - Danh sách câu hỏi được trả về
  - Mỗi câu hỏi có các tùy chọn trả lời

### Bước 4: Gửi câu trả lời
- **Request**:
  - Phương thức: **POST**
  - URL: `{{baseUrl}}/api/answers`
  - Body (JSON):
  ```json
  {
    "questionId": "question_id_1",
    "optionId": "option_id_1",
    "sessionId": "{{sessionId}}",
    "participantId": "{{participantId}}",
    "responseTime": 2500
  }
  ```

- **Response mong đợi**:
  ```json
  {
    "success": true,
    "data": {
      "isCorrect": true,
      "points": 10,
      "responseTime": 2500
    }
  }
  ```

- **Kiểm tra**:
  - Câu trả lời được ghi nhận thành công
  - Thông tin về độ chính xác và điểm số được trả về

### Bước 5: Xem kết quả cuối cùng
- **Request**:
  - Phương thức: **GET**
  - URL: `{{baseUrl}}/api/participants/{{participantId}}/results`

- **Response mong đợi**:
  ```json
  {
    "success": true,
    "data": {
      "participant": {
        "id": "participant_id",
        "score": 10,
        "rank": 1,
        "user": {
          "fullName": "Người chơi ẩn danh",
          "isGuest": true
        }
      },
      "answers": [
        {
          "questionId": "question_id_1",
          "isCorrect": true,
          "points": 10,
          "responseTime": 2500
        }
      ]
    }
  }
  ```

- **Kiểm tra**:
  - Kết quả hiển thị đúng thông tin người dùng khách
  - Tổng điểm và thứ hạng được tính đúng
  - Danh sách câu trả lời được hiển thị đầy đủ

## 3. Kiểm tra tình huống đặc biệt

### Tham gia lại phiên quiz với cùng một tên
- Thực hiện lại Bước 1 với cùng displayName
- Kiểm tra xem có tạo người dùng khách mới không, hoặc sử dụng lại người dùng cũ

### Tham gia với tên để trống
- Thực hiện Bước 1 nhưng bỏ trống displayName
- Kiểm tra xem có nhận được thông báo lỗi phù hợp không

### Tham gia phiên quiz không tồn tại
- Thực hiện Bước 1 với mã code không tồn tại
- Kiểm tra xem có nhận được thông báo lỗi phù hợp không

### Tham gia phiên quiz đã kết thúc
- Tìm một phiên quiz có status là COMPLETED
- Thử tham gia và kiểm tra xem có nhận được thông báo lỗi phù hợp không 