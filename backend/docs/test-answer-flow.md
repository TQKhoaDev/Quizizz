# Hướng dẫn test chức năng trả lời và xem kết quả

Tài liệu này hướng dẫn chi tiết cách test các chức năng liên quan đến việc gửi câu trả lời và xem kết quả trên Postman.

## 1. Chuẩn bị môi trường

### Cài đặt môi trường Postman
- Tạo môi trường mới "Quizizz Answer Testing"
- Thêm các biến môi trường:
  - `baseUrl`: http://localhost:3001 (hoặc URL server của bạn)
  - `token`: (sẽ được cập nhật sau khi đăng nhập)
  - `sessionId`: (ID của phiên quiz đang hoạt động)
  - `participantId`: (ID của người tham gia)
  - `questionId`: (ID của câu hỏi)
  - `optionId`: (ID của đáp án)

### Chuẩn bị dữ liệu
- Đảm bảo đã có sẵn ít nhất một phiên quiz đang hoạt động (status = ACTIVE)
- Đã có người tham gia vào phiên quiz

## 2. Các bước test chức năng trả lời và xem kết quả

### Bước 1: Đăng nhập (nếu test với vai trò người dùng đã đăng nhập)
- **Request**:
  - Phương thức: **POST**
  - URL: `{{baseUrl}}/api/auth/login`
  - Body (JSON):
  ```json
  {
    "email": "student@example.com",
    "password": "password123"
  }
  ```

- **Xử lý sau khi nhận response**:
  - Lưu giá trị `token` từ response vào biến môi trường `token`

### Bước 2: Tham gia phiên quiz
- **Request**:
  - Phương thức: **POST**
  - URL: `{{baseUrl}}/api/quizzes/join`
  - Headers (nếu đã đăng nhập):
    - Authorization: Bearer {{token}}
  - Body (JSON):
  ```json
  {
    "code": "ABCDEF",
    "displayName": "Người chơi test" // Chỉ cần nếu không đăng nhập
  }
  ```

- **Xử lý sau khi nhận response**:
  - Lưu giá trị `data.participant.id` vào biến môi trường `participantId`
  - Lưu giá trị `data.session.id` vào biến môi trường `sessionId`

### Bước 3: Lấy danh sách câu hỏi của phiên quiz
- **Request**:
  - Phương thức: **GET**
  - URL: `{{baseUrl}}/api/sessions/{{sessionId}}/questions`
  - Params:
    - participantId: {{participantId}}

- **Xử lý sau khi nhận response**:
  - Lưu ID của một câu hỏi vào biến môi trường `questionId`
  - Lưu ID của một đáp án vào biến môi trường `optionId`

### Bước 4: Gửi câu trả lời
- **Request**:
  - Phương thức: **POST**
  - URL: `{{baseUrl}}/api/answers`
  - Headers (nếu đã đăng nhập):
    - Authorization: Bearer {{token}}
    - Content-Type: application/json
  - Body (JSON):
  ```json
  {
    "questionId": "{{questionId}}",
    "optionId": "{{optionId}}",
    "sessionId": "{{sessionId}}",
    "responseTime": 3500,
    "participantId": "{{participantId}}" // Chỉ cần nếu không đăng nhập
  }
  ```

- **Response mong đợi**:
  ```json
  {
    "success": true,
    "data": {
      "answer": {
        "id": "answer_id",
        "participantId": "{{participantId}}",
        "questionId": "{{questionId}}",
        "optionId": "{{optionId}}",
        "isCorrect": true,
        "points": 10,
        "responseTime": 3500,
        "answerTime": "2023-05-25T10:15:00Z"
      },
      "isCorrect": true,
      "points": 10
    }
  }
  ```

- **Kiểm tra**:
  - Câu trả lời được ghi nhận thành công
  - Thông tin về độ chính xác và điểm số được trả về

### Bước 5: Gửi thêm câu trả lời cho các câu hỏi khác
- Lặp lại Bước 4 cho các câu hỏi khác trong quiz
- Lưu ý cập nhật `questionId` và `optionId` cho mỗi câu trả lời

### Bước 6: Xem kết quả của người tham gia
- **Request**:
  - Phương thức: **GET**
  - URL: `{{baseUrl}}/api/answers/participants/{{participantId}}/results`

- **Response mong đợi**:
  ```json
  {
    "success": true,
    "data": {
      "participant": {
        "id": "{{participantId}}",
        "user": {
          "id": "user_id",
          "fullName": "Tên người dùng",
          "email": "email@example.com",
          "isGuest": false
        },
        "score": 25,
        "rank": 1
      },
      "quiz": {
        "id": "quiz_id",
        "title": "Tên Quiz"
      },
      "session": {
        "id": "{{sessionId}}",
        "code": "ABCDEF",
        "status": "ACTIVE"
      },
      "statistics": {
        "totalQuestions": 5,
        "answered": 3,
        "correctAnswers": 2,
        "incorrectAnswers": 1,
        "unanswered": 2,
        "accuracy": 40
      },
      "answers": [
        {
          "questionId": "question_id_1",
          "question": "Nội dung câu hỏi 1",
          "selectedOption": "Đáp án A",
          "isCorrect": true,
          "points": 15,
          "responseTime": 2500
        },
        {
          "questionId": "question_id_2",
          "question": "Nội dung câu hỏi 2",
          "selectedOption": "Đáp án B",
          "isCorrect": true,
          "points": 10,
          "responseTime": 3500
        },
        {
          "questionId": "question_id_3",
          "question": "Nội dung câu hỏi 3",
          "selectedOption": "Đáp án C",
          "isCorrect": false,
          "points": 0,
          "responseTime": 5000
        }
      ]
    }
  }
  ```

- **Kiểm tra**:
  - Thông tin người tham gia được hiển thị chính xác
  - Thống kê về số câu trả lời, số câu đúng, sai, chưa trả lời
  - Danh sách chi tiết các câu trả lời
  - Điểm số được tính đúng dựa trên độ khó và thời gian trả lời

## 3. Kiểm tra các tình huống đặc biệt

### Kiểm tra gửi câu trả lời cho câu hỏi đã trả lời
- Gửi lại câu trả lời cho một câu hỏi đã trả lời trước đó
- Kiểm tra xem có nhận được thông báo lỗi phù hợp không

### Kiểm tra gửi câu trả lời khi phiên quiz chưa bắt đầu
- Tạo một phiên quiz mới nhưng chưa bắt đầu (status = PENDING)
- Thử gửi câu trả lời
- Kiểm tra xem có nhận được thông báo lỗi phù hợp không

### Kiểm tra gửi câu trả lời khi phiên quiz đã kết thúc
- Tìm một phiên quiz đã kết thúc (status = COMPLETED)
- Thử gửi câu trả lời
- Kiểm tra xem có nhận được thông báo lỗi phù hợp không

### Kiểm tra với đáp án không tồn tại
- Gửi câu trả lời với optionId không tồn tại
- Kiểm tra xem có nhận được thông báo lỗi phù hợp không

### Kiểm tra với người tham gia không tồn tại
- Gửi câu trả lời với participantId không tồn tại
- Kiểm tra xem có nhận được thông báo lỗi phù hợp không

### Kiểm tra tính điểm với độ khó và thời gian khác nhau
- Gửi câu trả lời cho câu hỏi có độ khó khác nhau (EASY, MEDIUM, HARD)
- Gửi câu trả lời với thời gian phản hồi khác nhau
- Kiểm tra điểm số được tính toán có phù hợp với công thức tính điểm không:
  - Câu hỏi EASY: 5 điểm cơ bản
  - Câu hỏi MEDIUM: 10 điểm cơ bản
  - Câu hỏi HARD: 15 điểm cơ bản
  - Thưởng 50% nếu trả lời trong 25% thời gian đầu
  - Thưởng 25% nếu trả lời trong 50% thời gian đầu
  - Thưởng 10% nếu trả lời trong 75% thời gian đầu 