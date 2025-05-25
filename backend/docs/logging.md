# Hệ thống quản lý Logs

Tài liệu này mô tả hệ thống quản lý logs trong ứng dụng Quizizz API.

## Tổng quan

Hệ thống logging sử dụng Winston và Winston Daily Rotate File để:
- Ghi log vào file theo format JSON để dễ phân tích
- Phân chia log theo mức độ nghiêm trọng (error, warn, info, debug)
- Tự động xoay vòng log files để tránh tràn dung lượng
- Phân chia logs theo domain/context để dễ quản lý

## Cấu trúc thư mục

```
/logs
  ├── application-YYYY-MM-DD.log  # Chứa tất cả logs
  └── error-YYYY-MM-DD.log        # Chỉ chứa error logs
```

## Log Levels

- **ERROR**: Các lỗi nghiêm trọng làm ảnh hưởng đến chức năng của ứng dụng
- **WARN**: Cảnh báo về các vấn đề tiềm ẩn không gây lỗi ngay lập tức
- **INFO**: Thông tin về các sự kiện quan trọng trong ứng dụng (startup, shutdown, login, etc.)
- **DEBUG**: Thông tin chi tiết hỗ trợ debugging (chỉ xuất hiện trong môi trường development)

## Format Log

Mỗi log entry được lưu dưới dạng JSON với các trường sau:

```json
{
  "level": "info",
  "message": "User logged in",
  "timestamp": "2023-08-15 14:30:45",
  "service": "quizizz-api",
  "domain": "AuthController",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "123456",
  "...": "Các thông tin khác tùy context"
}
```

## Sử dụng Logger trong code

### Logger cơ bản

```typescript
import { logger } from '../services';

// Các mức độ log
logger.error('Lỗi nghiêm trọng', { error: err });
logger.warn('Cảnh báo', { data: someData });
logger.info('Thông tin', { userId: user.id });
logger.debug('Debug', { query: req.query });
```

### Domain-specific Logger

```typescript
import { LoggerFactory } from '../services/logger.service';

// Tạo logger cho một domain cụ thể
const logger = LoggerFactory.getLogger('UserService');

// Sử dụng
logger.info('User registered', { userId: user.id });
```

## Hướng dẫn sử dụng khi debug

### 1. Đặt logs ở các điểm quan trọng

```typescript
async function processQuiz(quizId, userId, requestId) {
  const logger = LoggerFactory.getLogger('QuizService');
  
  // Log bắt đầu xử lý
  logger.debug('Bắt đầu xử lý quiz', { quizId, userId, requestId });
  
  try {
    // Lấy thông tin quiz
    const quiz = await quizRepository.findById(quizId);
    if (!quiz) {
      logger.warn('Quiz không tồn tại', { quizId, requestId });
      throw new Error('Quiz không tồn tại');
    }
    
    // Log thông tin trung gian
    logger.debug('Đã tìm thấy quiz', { 
      requestId, 
      quizId, 
      questionCount: quiz.questions.length 
    });
    
    // Xử lý logic tiếp theo
    const result = await calculateResults(quiz, userId);
    
    // Log kết quả
    logger.debug('Hoàn thành xử lý quiz', { 
      requestId, 
      quizId, 
      score: result.score,
      timeTaken: result.timeTaken
    });
    
    return result;
  } catch (error) {
    // Log lỗi với đầy đủ thông tin context
    logger.error('Lỗi khi xử lý quiz', { 
      requestId, 
      quizId, 
      userId, 
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    });
    throw error;
  }
}
```

### 2. Sử dụng performance metrics

```typescript
async function generateReport(data, requestId) {
  const logger = LoggerFactory.getLogger('ReportService');
  const startTime = performance.now();
  
  logger.debug('Bắt đầu tạo báo cáo', { 
    requestId, 
    dataSize: data.length 
  });
  
  // Logic xử lý báo cáo
  const report = await processReport(data);
  
  const executionTime = performance.now() - startTime;
  logger.debug('Hoàn thành tạo báo cáo', { 
    requestId, 
    reportSize: report.size,
    executionTime: `${executionTime.toFixed(2)}ms`
  });
  
  // Log cảnh báo nếu thời gian xử lý quá lâu
  if (executionTime > 5000) {
    logger.warn('Tạo báo cáo mất quá nhiều thời gian', { 
      requestId, 
      executionTime: `${executionTime.toFixed(2)}ms`,
      dataSize: data.length
    });
  }
  
  return report;
}
```

### 3. Debug với requestId

Khi debug một vấn đề cụ thể, sử dụng requestId để theo dõi toàn bộ luồng xử lý:

1. **Thêm requestId vào response header**:
   ```typescript
   // Trong middleware hoặc controller
   res.setHeader('X-Request-ID', req.requestId);
   ```

2. **Lọc logs theo requestId**:
   ```bash
   # Xem toàn bộ luồng xử lý của một request
   cat logs/application-*.log | grep "550e8400-e29b-41d4-a716-446655440000" | jq
   
   # Theo dõi tiến trình theo thời gian
   cat logs/application-*.log | grep "550e8400-e29b-41d4-a716-446655440000" | jq -s 'sort_by(.timestamp)'
   ```

### 4. Phân tích logs với công cụ

```bash
# Cài đặt jq nếu chưa có
# npm install -g jq

# Lọc tất cả lỗi trong ngày
cat logs/application-$(date +%Y-%m-%d).log | jq 'select(.level=="error")'

# Thống kê số lượng lỗi theo domain
cat logs/application-*.log | jq 'select(.level=="error") | .domain' | sort | uniq -c

# Tìm các request có thời gian xử lý lâu
cat logs/application-*.log | jq 'select(.duration != null and .duration > 1000)'

# Tìm các lỗi liên quan đến một userId cụ thể
cat logs/application-*.log | jq 'select(.userId=="123456" and .level=="error")'
```

### 5. Tạo bản đồ trực quan cho request

Đặt log với các giai đoạn xử lý để dễ dàng theo dõi luồng xử lý:

```typescript
// Trong controller
logger.info('Request bắt đầu', { requestId, endpoint: '/api/quizzes', method: 'POST' });

// Trong service layer
logger.debug('Đang xác thực người dùng', { requestId, userId });
logger.debug('Đang xử lý dữ liệu', { requestId, step: 'data_processing' });
logger.debug('Đang lưu vào database', { requestId, step: 'database_save' });

// Khi hoàn thành
logger.info('Request hoàn thành', { requestId, processingTime: '120ms' });
```

Sau đó, tạo một script để phân tích và hiển thị timeline của request:

```javascript
// script/analyze-request.js
const fs = require('fs');
const readline = require('readline');

const requestId = process.argv[2];
if (!requestId) {
  console.log('Vui lòng cung cấp requestId: node analyze-request.js REQUEST_ID');
  process.exit(1);
}

async function analyzeRequest() {
  const logFiles = fs.readdirSync('logs').filter(f => f.startsWith('application-'));
  const events = [];
  
  for (const file of logFiles) {
    const rl = readline.createInterface({
      input: fs.createReadStream(`logs/${file}`),
      crlfDelay: Infinity
    });
    
    for await (const line of rl) {
      try {
        const log = JSON.parse(line);
        if (log.requestId === requestId) {
          events.push({
            timestamp: new Date(log.timestamp),
            message: log.message,
            level: log.level,
            step: log.step || 'unknown',
            duration: log.duration,
            ...log
          });
        }
      } catch (e) {
        // Bỏ qua các dòng không phải JSON
      }
    }
  }
  
  // Sắp xếp theo thời gian
  events.sort((a, b) => a.timestamp - b.timestamp);
  
  // Hiển thị timeline
  console.log(`\n===== TIMELINE FOR REQUEST ${requestId} =====\n`);
  let startTime = events.length > 0 ? events[0].timestamp : null;
  
  events.forEach((event, index) => {
    const timeDiff = startTime ? (event.timestamp - startTime) : 0;
    console.log(`[+${timeDiff}ms] [${event.level.toUpperCase()}] ${event.message}`);
    
    // Hiển thị thông tin bổ sung
    const details = { ...event };
    delete details.timestamp;
    delete details.message;
    delete details.level;
    delete details.requestId;
    
    console.log(JSON.stringify(details, null, 2));
    console.log('-----------------------------------');
  });
}

analyzeRequest().catch(console.error);
```

## Best Practices

1. **Luôn bao gồm thông tin requestId** để có thể theo dõi toàn bộ chu trình xử lý một request
2. **Không log thông tin nhạy cảm** như mật khẩu, token, thông tin cá nhân
3. **Sử dụng đúng log level** phù hợp với mục đích
4. **Thêm context có ý nghĩa** vào mỗi log entry (user ID, action, etc.)
5. **Sử dụng domain-specific logger** để dễ dàng lọc logs theo module/feature

## Quản lý Log Files

### Xoay vòng Log Files

Log files tự động được xoay vòng dựa trên:
- Ngày (mỗi ngày một file mới)
- Kích thước tối đa (20MB)
- Thời gian lưu trữ (14 ngày)

### Dọn dẹp Log Files

Chạy script dọn dẹp logs định kỳ:

```bash
npm run logs:clean
```

Script này sẽ:
- Xóa logs cũ hơn 30 ngày
- Đảm bảo tổng dung lượng thư mục logs không vượt quá 500MB

## Monitoring và Alerting

Để thiết lập monitoring và alerting cho logs, có thể:

1. **ELK Stack**: Kết nối logs với Elasticsearch, Logstash và Kibana
2. **Grafana Loki**: Kết nối logs với Grafana Loki
3. **Custom Alerts**: Sử dụng script phân tích logs để gửi cảnh báo qua email hoặc Slack

## Tích hợp với Cloud Logging

Để đưa logs lên cloud services:

- **AWS CloudWatch**: Sử dụng winston-cloudwatch transport
- **Azure Monitor**: Sử dụng winston-azure-application-insights
- **Google Cloud Logging**: Sử dụng winston-gcp-logging

## Các tip hay

1. Sử dụng `requestId` để theo dõi toàn bộ chu trình xử lý một request
2. Kết hợp logs với metrics để có cái nhìn tổng quan về hiệu suất ứng dụng
3. Sử dụng domain-specific logger để dễ dàng lọc logs theo module/feature
4. Thêm requestId vào response headers để có thể kết nối logs giữa backend và frontend 