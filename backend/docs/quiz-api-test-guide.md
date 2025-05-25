# Hướng dẫn test API Quiz bằng Postman

File này hướng dẫn cách test các API liên quan đến quiz bằng công cụ Postman.

## Chuẩn bị

1. Cài đặt Postman từ [trang chủ](https://www.postman.com/downloads/)
2. Đảm bảo server backend của Quizizz đã được khởi động (`npm run dev` trong thư mục backend)
3. Tạo một collection mới trong Postman có tên "Quizizz API"

## Thiết lập ban đầu

### Thiết lập biến môi trường

1. Tạo môi trường mới trong Postman có tên "Quizizz Local"
2. Thêm các biến môi trường sau:
   - `baseUrl`: `http://localhost:3000` (hoặc port tương ứng với server của bạn)
   - `token`: (để trống, sẽ được cập nhật sau khi đăng nhập)

### Tạo request đăng nhập

Trước khi test các API quiz, bạn cần đăng nhập để có token xác thực:

1. Tạo POST request: `{{baseUrl}}/api/auth/login`
2. Body (raw JSON):
```json
{
  "email": "email_của_bạn@example.com",
  "password": "mật_khẩu_của_bạn"
}
```
3. Tests (để tự động lưu token):
```javascript
var jsonData = pm.response.json();
if (jsonData.token) {
    pm.environment.set("token", jsonData.token);
}
```

## Test các API Quiz

### 1. Lấy danh sách quiz của người dùng hiện tại

- **Method**: GET
- **URL**: `{{baseUrl}}/api/quizzes`
- **Headers**: 
  - Authorization: Bearer {{token}}
- **Kết quả mong đợi**: 
  - Status code: 200
  - Response body: Mảng các quiz của người dùng

### 2. Lấy quiz theo mã tham gia

- **Method**: GET
- **URL**: `{{baseUrl}}/api/quizzes/code/{code}`
- **Tham số**:
  - `code`: Mã tham gia quiz
- **Kết quả mong đợi**:
  - Status code: 200 nếu tìm thấy, 404 nếu không tìm thấy
  - Response body: Thông tin chi tiết của quiz

### 3. Lấy chi tiết một quiz theo ID

- **Method**: GET
- **URL**: `{{baseUrl}}/api/quizzes/{id}`
- **Headers**: 
  - Authorization: Bearer {{token}}
- **Tham số**:
  - `id`: ID của quiz
- **Kết quả mong đợi**:
  - Status code: 200 nếu tìm thấy, 404 nếu không tìm thấy
  - Response body: Thông tin chi tiết của quiz và các câu hỏi

### 4. Tạo một bài quiz mới

- **Method**: POST
- **URL**: `{{baseUrl}}/api/quizzes`
- **Headers**: 
  - Authorization: Bearer {{token}}
  - Content-Type: application/json
- **Body (raw JSON)**:
```json
{
  "title": "Quiz Test",
  "description": "Đây là quiz dùng để test API",
  "timeLimit": 600,
  "isPublic": true,
  "questions": [
    {
      "content": "Câu hỏi số 1?",
      "type": "MCQ",
      "timeLimit": 30,
      "points": 1,
      "difficulty": "EASY",
      "order": 0,
      "options": [
        {
          "content": "Đáp án A",
          "isCorrect": true,
          "order": 0
        },
        {
          "content": "Đáp án B",
          "isCorrect": false,
          "order": 1
        },
        {
          "content": "Đáp án C",
          "isCorrect": false,
          "order": 2
        },
        {
          "content": "Đáp án D",
          "isCorrect": false,
          "order": 3
        }
      ]
    },
    {
      "content": "Câu hỏi số 2?",
      "type": "TRUE_FALSE",
      "timeLimit": 15,
      "points": 1,
      "difficulty": "EASY",
      "order": 1,
      "options": [
        {
          "content": "Đúng",
          "isCorrect": true,
          "order": 0
        },
        {
          "content": "Sai",
          "isCorrect": false,
          "order": 1
        }
      ]
    }
  ]
}
```
- **Kết quả mong đợi**:
  - Status code: 201
  - Response body: Thông tin về quiz vừa được tạo

### 5. Cập nhật thông tin quiz

- **Method**: PUT
- **URL**: `{{baseUrl}}/api/quizzes/{id}`
- **Headers**: 
  - Authorization: Bearer {{token}}
  - Content-Type: application/json
- **Tham số**:
  - `id`: ID của quiz cần cập nhật
- **Body (raw JSON)**:
```json
{
  "title": "Quiz Test Đã Cập Nhật",
  "description": "Đây là mô tả đã được cập nhật",
  "timeLimit": 900,
  "isPublic": true,
  "questions": [
    {
      "id": "id_câu_hỏi_1",
      "content": "Câu hỏi số 1 đã cập nhật?",
      "timeLimit": 45,
      "options": [
        {
          "id": "id_đáp_án_A",
          "content": "Đáp án A đã cập nhật",
          "isCorrect": false
        },
        {
          "id": "id_đáp_án_B",
          "content": "Đáp án B đã cập nhật",
          "isCorrect": true
        }
      ]
    }
  ]
}
```
- **Kết quả mong đợi**:
  - Status code: 200
  - Response body: Thông tin về quiz sau khi cập nhật

### 6. Xóa quiz

- **Method**: DELETE
- **URL**: `{{baseUrl}}/api/quizzes/{id}`
- **Headers**: 
  - Authorization: Bearer {{token}}
- **Tham số**:
  - `id`: ID của quiz cần xóa
- **Kết quả mong đợi**:
  - Status code: 200
  - Response body: Thông báo đã xóa thành công

## Kiểm tra lỗi

Ngoài các test case thành công, cần kiểm tra một số trường hợp lỗi như:

1. Gửi request khi chưa đăng nhập (không có token)
2. Truy cập quiz không tồn tại
3. Truy cập quiz của người dùng khác
4. Tạo quiz với dữ liệu không hợp lệ (thiếu trường bắt buộc, sai định dạng, etc.)

## Lưu ý

1. Lưu các ID trong biến môi trường để tiện sử dụng:
   - Sau khi tạo quiz, lưu ID: `pm.environment.set("quizId", jsonData.data.id)`
   - Tương tự với các ID khác: câu hỏi, đáp án, v.v.

2. Thiết lập Test script để kiểm tra kết quả tự động:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has correct structure", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData).to.have.property('data');
});
```

3. Sử dụng Collection Runner của Postman để chạy toàn bộ các test liên tiếp nhau. 