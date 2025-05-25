-- File seed.sql để tạo dữ liệu mẫu cho ứng dụng Quizizz
-- Sử dụng: mysql -u username -p database_name < seed.sql

-- Xóa dữ liệu hiện có (nếu cần)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE answers;
TRUNCATE TABLE participants;
TRUNCATE TABLE quiz_sessions;
TRUNCATE TABLE question_options;
TRUNCATE TABLE quiz_questions;
TRUNCATE TABLE quizzes;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Tạo người dùng mẫu
INSERT INTO users (id, email, password, fullName, role, createdAt, updatedAt, isGuest)
VALUES
  ('usr-001', 'admin@example.com', '$2b$10$fzIDQGPltFgCOYkqKNwz2e9UlNAO5UwGH.sjYi1X1VbhEUFAQ7ZF2', 'Admin User', 'ADMIN', NOW(), NOW(), false),
  ('usr-002', 'teacher@example.com', '$2b$10$fzIDQGPltFgCOYkqKNwz2e9UlNAO5UwGH.sjYi1X1VbhEUFAQ7ZF2', 'Teacher One', 'PROCTOR', NOW(), NOW(), false),
  ('usr-003', 'teacher2@example.com', '$2b$10$fzIDQGPltFgCOYkqKNwz2e9UlNAO5UwGH.sjYi1X1VbhEUFAQ7ZF2', 'Teacher Two', 'PROCTOR', NOW(), NOW(), false),
  ('usr-004', 'student1@example.com', '$2b$10$fzIDQGPltFgCOYkqKNwz2e9UlNAO5UwGH.sjYi1X1VbhEUFAQ7ZF2', 'Student One', 'STUDENT', NOW(), NOW(), false),
  ('usr-005', 'student2@example.com', '$2b$10$fzIDQGPltFgCOYkqKNwz2e9UlNAO5UwGH.sjYi1X1VbhEUFAQ7ZF2', 'Student Two', 'STUDENT', NOW(), NOW(), false),
  ('usr-006', 'student3@example.com', '$2b$10$fzIDQGPltFgCOYkqKNwz2e9UlNAO5UwGH.sjYi1X1VbhEUFAQ7ZF2', 'Student Three', 'STUDENT', NOW(), NOW(), false),
  ('usr-007', 'guest1', NULL, 'Guest User One', 'STUDENT', NOW(), NOW(), true),
  ('usr-008', 'guest2', NULL, 'Guest User Two', 'STUDENT', NOW(), NOW(), true);

-- Mật khẩu ở trên là 'password123' được hash với bcrypt

-- Tạo quiz mẫu
INSERT INTO quizzes (id, title, description, timeLimit, isPublic, code, createdAt, updatedAt, creatorId)
VALUES
  ('qz-001', 'Kiểm tra Toán học cơ bản', 'Bài kiểm tra về phép cộng, trừ, nhân, chia và phương trình đơn giản', 600, true, 'MATH01', NOW(), NOW(), 'usr-002'),
  ('qz-002', 'Kiểm tra Tiếng Anh', 'Từ vựng và ngữ pháp tiếng Anh cơ bản', 900, true, 'ENG123', NOW(), NOW(), 'usr-002'),
  ('qz-003', 'Kiểm tra Khoa học', 'Các khái niệm khoa học cơ bản', 1200, false, 'SCI456', NOW(), NOW(), 'usr-003');

-- Tạo câu hỏi cho quiz Toán học
INSERT INTO quiz_questions (id, content, type, timeLimit, points, difficulty, `order`, imageUrl, videoUrl, quizId)
VALUES
  ('qq-001', 'Tính: 5 + 7 = ?', 'MCQ', 30, 1, 'EASY', 1, NULL, NULL, 'qz-001'),
  ('qq-002', 'Tính: 12 - 5 = ?', 'MCQ', 30, 1, 'EASY', 2, NULL, NULL, 'qz-001'),
  ('qq-003', 'Giải phương trình: 3x + 5 = 20', 'MCQ', 60, 2, 'MEDIUM', 3, NULL, NULL, 'qz-001'),
  ('qq-004', 'Tính: 8 × 7 = ?', 'MCQ', 30, 1, 'EASY', 4, NULL, NULL, 'qz-001'),
  ('qq-005', 'Tìm nghiệm của phương trình: x² - 9 = 0', 'MULTIPLE_SELECT', 90, 3, 'HARD', 5, NULL, NULL, 'qz-001');

-- Tạo câu hỏi cho quiz Tiếng Anh
INSERT INTO quiz_questions (id, content, type, timeLimit, points, difficulty, `order`, imageUrl, videoUrl, quizId)
VALUES
  ('qq-006', 'What is the past tense of "go"?', 'MCQ', 30, 1, 'EASY', 1, NULL, NULL, 'qz-002'),
  ('qq-007', 'Choose the correct article: ___ apple', 'MCQ', 30, 1, 'EASY', 2, NULL, NULL, 'qz-002'),
  ('qq-008', 'Which of these is a proper noun?', 'MCQ', 45, 2, 'MEDIUM', 3, NULL, NULL, 'qz-002'),
  ('qq-009', 'Identify the passive voice sentence:', 'MCQ', 60, 2, 'MEDIUM', 4, NULL, NULL, 'qz-002'),
  ('qq-010', 'Select all correct past participles:', 'MULTIPLE_SELECT', 90, 3, 'HARD', 5, NULL, NULL, 'qz-002');

-- Tạo câu hỏi cho quiz Khoa học
INSERT INTO quiz_questions (id, content, type, timeLimit, points, difficulty, `order`, imageUrl, videoUrl, quizId)
VALUES
  ('qq-011', 'Nước sôi ở nhiệt độ bao nhiêu độ C?', 'MCQ', 30, 1, 'EASY', 1, NULL, NULL, 'qz-003'),
  ('qq-012', 'Trái đất quay quanh mặt trời theo hình gì?', 'MCQ', 30, 1, 'EASY', 2, NULL, NULL, 'qz-003'),
  ('qq-013', 'Đâu là hành tinh gần mặt trời nhất?', 'MCQ', 45, 2, 'MEDIUM', 3, NULL, NULL, 'qz-003'),
  ('qq-014', 'Nguyên tố hóa học nào chiếm tỉ lệ cao nhất trong không khí?', 'MCQ', 45, 2, 'MEDIUM', 4, NULL, NULL, 'qz-003'),
  ('qq-015', 'Đâu là những đơn vị đo độ dài?', 'MULTIPLE_SELECT', 60, 3, 'MEDIUM', 5, NULL, NULL, 'qz-003');

-- Tạo đáp án cho câu hỏi Toán học
INSERT INTO question_options (id, content, isCorrect, `order`, imageUrl, matchingText, questionId)
VALUES
  -- Câu hỏi 1: 5 + 7 = ?
  ('qo-001', '10', false, 1, NULL, NULL, 'qq-001'),
  ('qo-002', '11', false, 2, NULL, NULL, 'qq-001'),
  ('qo-003', '12', true, 3, NULL, NULL, 'qq-001'),
  ('qo-004', '13', false, 4, NULL, NULL, 'qq-001'),
  
  -- Câu hỏi 2: 12 - 5 = ?
  ('qo-005', '5', false, 1, NULL, NULL, 'qq-002'),
  ('qo-006', '6', false, 2, NULL, NULL, 'qq-002'),
  ('qo-007', '7', true, 3, NULL, NULL, 'qq-002'),
  ('qo-008', '8', false, 4, NULL, NULL, 'qq-002'),
  
  -- Câu hỏi 3: 3x + 5 = 20
  ('qo-009', 'x = 3', false, 1, NULL, NULL, 'qq-003'),
  ('qo-010', 'x = 5', true, 2, NULL, NULL, 'qq-003'),
  ('qo-011', 'x = 7', false, 3, NULL, NULL, 'qq-003'),
  ('qo-012', 'x = 15', false, 4, NULL, NULL, 'qq-003'),
  
  -- Câu hỏi 4: 8 × 7 = ?
  ('qo-013', '54', false, 1, NULL, NULL, 'qq-004'),
  ('qo-014', '56', true, 2, NULL, NULL, 'qq-004'),
  ('qo-015', '58', false, 3, NULL, NULL, 'qq-004'),
  ('qo-016', '64', false, 4, NULL, NULL, 'qq-004'),
  
  -- Câu hỏi 5: x² - 9 = 0
  ('qo-017', 'x = -3', true, 1, NULL, NULL, 'qq-005'),
  ('qo-018', 'x = 0', false, 2, NULL, NULL, 'qq-005'),
  ('qo-019', 'x = 3', true, 3, NULL, NULL, 'qq-005'),
  ('qo-020', 'x = 9', false, 4, NULL, NULL, 'qq-005');

-- Tạo đáp án cho câu hỏi Tiếng Anh
INSERT INTO question_options (id, content, isCorrect, `order`, imageUrl, matchingText, questionId)
VALUES
  -- Câu hỏi 6: What is the past tense of "go"?
  ('qo-021', 'goed', false, 1, NULL, NULL, 'qq-006'),
  ('qo-022', 'went', true, 2, NULL, NULL, 'qq-006'),
  ('qo-023', 'gone', false, 3, NULL, NULL, 'qq-006'),
  ('qo-024', 'going', false, 4, NULL, NULL, 'qq-006'),
  
  -- Câu hỏi 7: Choose the correct article: ___ apple
  ('qo-025', 'a', false, 1, NULL, NULL, 'qq-007'),
  ('qo-026', 'an', true, 2, NULL, NULL, 'qq-007'),
  ('qo-027', 'the', false, 3, NULL, NULL, 'qq-007'),
  ('qo-028', 'no article needed', false, 4, NULL, NULL, 'qq-007'),
  
  -- Câu hỏi 8: Which of these is a proper noun?
  ('qo-029', 'table', false, 1, NULL, NULL, 'qq-008'),
  ('qo-030', 'city', false, 2, NULL, NULL, 'qq-008'),
  ('qo-031', 'Paris', true, 3, NULL, NULL, 'qq-008'),
  ('qo-032', 'beautiful', false, 4, NULL, NULL, 'qq-008'),
  
  -- Câu hỏi 9: Identify the passive voice sentence:
  ('qo-033', 'She writes a letter.', false, 1, NULL, NULL, 'qq-009'),
  ('qo-034', 'He is playing guitar.', false, 2, NULL, NULL, 'qq-009'),
  ('qo-035', 'The letter was written by her.', true, 3, NULL, NULL, 'qq-009'),
  ('qo-036', 'They have completed the project.', false, 4, NULL, NULL, 'qq-009'),
  
  -- Câu hỏi 10: Select all correct past participles:
  ('qo-037', 'goed', false, 1, NULL, NULL, 'qq-010'),
  ('qo-038', 'gone', true, 2, NULL, NULL, 'qq-010'),
  ('qo-039', 'written', true, 3, NULL, NULL, 'qq-010'),
  ('qo-040', 'writed', false, 4, NULL, NULL, 'qq-010');

-- Tạo đáp án cho câu hỏi Khoa học
INSERT INTO question_options (id, content, isCorrect, `order`, imageUrl, matchingText, questionId)
VALUES
  -- Câu hỏi 11: Nước sôi ở nhiệt độ bao nhiêu độ C?
  ('qo-041', '0°C', false, 1, NULL, NULL, 'qq-011'),
  ('qo-042', '50°C', false, 2, NULL, NULL, 'qq-011'),
  ('qo-043', '100°C', true, 3, NULL, NULL, 'qq-011'),
  ('qo-044', '200°C', false, 4, NULL, NULL, 'qq-011'),
  
  -- Câu hỏi 12: Trái đất quay quanh mặt trời theo hình gì?
  ('qo-045', 'Hình tròn', false, 1, NULL, NULL, 'qq-012'),
  ('qo-046', 'Hình elip', true, 2, NULL, NULL, 'qq-012'),
  ('qo-047', 'Hình vuông', false, 3, NULL, NULL, 'qq-012'),
  ('qo-048', 'Đường zigzag', false, 4, NULL, NULL, 'qq-012'),
  
  -- Câu hỏi 13: Đâu là hành tinh gần mặt trời nhất?
  ('qo-049', 'Trái Đất', false, 1, NULL, NULL, 'qq-013'),
  ('qo-050', 'Sao Hỏa', false, 2, NULL, NULL, 'qq-013'),
  ('qo-051', 'Sao Kim', false, 3, NULL, NULL, 'qq-013'),
  ('qo-052', 'Sao Thủy', true, 4, NULL, NULL, 'qq-013'),
  
  -- Câu hỏi 14: Nguyên tố hóa học nào chiếm tỉ lệ cao nhất trong không khí?
  ('qo-053', 'Oxy', false, 1, NULL, NULL, 'qq-014'),
  ('qo-054', 'Nitơ', true, 2, NULL, NULL, 'qq-014'),
  ('qo-055', 'Carbon dioxide', false, 3, NULL, NULL, 'qq-014'),
  ('qo-056', 'Hydro', false, 4, NULL, NULL, 'qq-014'),
  
  -- Câu hỏi 15: Đâu là những đơn vị đo độ dài?
  ('qo-057', 'Mét', true, 1, NULL, NULL, 'qq-015'),
  ('qo-058', 'Lít', false, 2, NULL, NULL, 'qq-015'),
  ('qo-059', 'Kilogram', false, 3, NULL, NULL, 'qq-015'),
  ('qo-060', 'Inch', true, 4, NULL, NULL, 'qq-015');

-- Tạo phiên quiz
INSERT INTO quiz_sessions (id, status, startTime, endTime, code, quizId, proctorId, createdAt, updatedAt)
VALUES
  ('ses-001', 'ACTIVE', DATE_SUB(NOW(), INTERVAL 30 MINUTE), NULL, 'ABC123', 'qz-001', 'usr-002', NOW(), NOW()),
  ('ses-002', 'PENDING', NULL, NULL, 'DEF456', 'qz-002', 'usr-002', NOW(), NOW()),
  ('ses-003', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR), 'GHI789', 'qz-003', 'usr-003', NOW(), NOW());

-- Tạo người tham gia
INSERT INTO participants (id, joinTime, score, rank, userId, sessionId)
VALUES
  ('prt-001', DATE_SUB(NOW(), INTERVAL 25 MINUTE), 10, 1, 'usr-004', 'ses-001'),
  ('prt-002', DATE_SUB(NOW(), INTERVAL 23 MINUTE), 8, 2, 'usr-005', 'ses-001'),
  ('prt-003', DATE_SUB(NOW(), INTERVAL 20 MINUTE), 6, 3, 'usr-006', 'ses-001'),
  ('prt-004', DATE_SUB(NOW(), INTERVAL 15 MINUTE), 5, 4, 'usr-007', 'ses-001'),
  ('prt-005', DATE_SUB(NOW(), INTERVAL 110 MINUTE), 12, 1, 'usr-004', 'ses-003'),
  ('prt-006', DATE_SUB(NOW(), INTERVAL 105 MINUTE), 10, 2, 'usr-005', 'ses-003'),
  ('prt-007', DATE_SUB(NOW(), INTERVAL 100 MINUTE), 7, 3, 'usr-006', 'ses-003');

-- Tạo câu trả lời cho phiên quiz Toán học (ses-001)
INSERT INTO answers (id, answerTime, isCorrect, points, responseTime, participantId, questionId, optionId, essayAnswer)
VALUES
  -- Người tham gia 1 (usr-004)
  ('ans-001', DATE_SUB(NOW(), INTERVAL 24 MINUTE), true, 5, 10000, 'prt-001', 'qq-001', 'qo-003', NULL),
  ('ans-002', DATE_SUB(NOW(), INTERVAL 22 MINUTE), true, 5, 12000, 'prt-001', 'qq-002', 'qo-007', NULL),
  
  -- Người tham gia 2 (usr-005)
  ('ans-003', DATE_SUB(NOW(), INTERVAL 22 MINUTE), true, 5, 9000, 'prt-002', 'qq-001', 'qo-003', NULL),
  ('ans-004', DATE_SUB(NOW(), INTERVAL 20 MINUTE), false, 0, 15000, 'prt-002', 'qq-002', 'qo-006', NULL),
  ('ans-005', DATE_SUB(NOW(), INTERVAL 18 MINUTE), true, 3, 25000, 'prt-002', 'qq-003', 'qo-010', NULL),
  
  -- Người tham gia 3 (usr-006)
  ('ans-006', DATE_SUB(NOW(), INTERVAL 19 MINUTE), true, 6, 8000, 'prt-003', 'qq-001', 'qo-003', NULL),
  ('ans-007', DATE_SUB(NOW(), INTERVAL 17 MINUTE), false, 0, 11000, 'prt-003', 'qq-004', 'qo-015', NULL),
  
  -- Người tham gia 4 (usr-007 - guest)
  ('ans-008', DATE_SUB(NOW(), INTERVAL 14 MINUTE), true, 5, 12000, 'prt-004', 'qq-001', 'qo-003', NULL);

-- Tạo câu trả lời cho phiên quiz Khoa học (ses-003)
INSERT INTO answers (id, answerTime, isCorrect, points, responseTime, participantId, questionId, optionId, essayAnswer)
VALUES
  -- Người tham gia 5 (usr-004)
  ('ans-009', DATE_SUB(NOW(), INTERVAL 108 MINUTE), true, 5, 9000, 'prt-005', 'qq-011', 'qo-043', NULL),
  ('ans-010', DATE_SUB(NOW(), INTERVAL 106 MINUTE), true, 5, 11000, 'prt-005', 'qq-012', 'qo-046', NULL),
  ('ans-011', DATE_SUB(NOW(), INTERVAL 104 MINUTE), false, 0, 20000, 'prt-005', 'qq-013', 'qo-051', NULL),
  ('ans-012', DATE_SUB(NOW(), INTERVAL 102 MINUTE), true, 2, 30000, 'prt-005', 'qq-014', 'qo-054', NULL),
  
  -- Người tham gia 6 (usr-005)
  ('ans-013', DATE_SUB(NOW(), INTERVAL 104 MINUTE), true, 5, 10000, 'prt-006', 'qq-011', 'qo-043', NULL),
  ('ans-014', DATE_SUB(NOW(), INTERVAL 102 MINUTE), true, 5, 12000, 'prt-006', 'qq-012', 'qo-046', NULL),
  ('ans-015', DATE_SUB(NOW(), INTERVAL 100 MINUTE), false, 0, 22000, 'prt-006', 'qq-014', 'qo-053', NULL),
  
  -- Người tham gia 7 (usr-006)
  ('ans-016', DATE_SUB(NOW(), INTERVAL 98 MINUTE), true, 5, 11000, 'prt-007', 'qq-011', 'qo-043', NULL),
  ('ans-017', DATE_SUB(NOW(), INTERVAL 96 MINUTE), false, 0, 14000, 'prt-007', 'qq-012', 'qo-045', NULL),
  ('ans-018', DATE_SUB(NOW(), INTERVAL 94 MINUTE), true, 2, 25000, 'prt-007', 'qq-014', 'qo-054', NULL);

-- Chú thích:
-- Mật khẩu hash được tạo với bcrypt, "password123" là giá trị gốc
-- Các ID được đặt theo quy ước để dễ nhận biết: usr-00x, qz-00x, qq-00x, qo-00x, ses-00x, prt-00x, ans-00x
-- Dữ liệu thời gian được tạo tương đối so với thời điểm hiện tại để mô phỏng các phiên quiz khác nhau 