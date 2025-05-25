/**
 * Script để phân tích luồng xử lý của một request dựa vào requestId
 * 
 * Sử dụng: node scripts/analyze-request.js REQUEST_ID
 */

const fs = require('fs');
const readline = require('readline');
const path = require('path');

const requestId = process.argv[2];
if (!requestId) {
  console.log('Vui lòng cung cấp requestId: node analyze-request.js REQUEST_ID');
  process.exit(1);
}

async function analyzeRequest() {
  const logsDir = path.join(__dirname, '..', 'logs');
  
  // Kiểm tra thư mục logs có tồn tại không
  if (!fs.existsSync(logsDir)) {
    console.error(`Thư mục logs không tồn tại: ${logsDir}`);
    process.exit(1);
  }
  
  const logFiles = fs.readdirSync(logsDir).filter(f => f.startsWith('application-'));
  const events = [];
  
  if (logFiles.length === 0) {
    console.log('Không tìm thấy file log nào');
    process.exit(0);
  }
  
  console.log(`Đang tìm kiếm logs cho requestId: ${requestId}`);
  console.log(`Đang quét ${logFiles.length} file log...`);
  
  for (const file of logFiles) {
    const rl = readline.createInterface({
      input: fs.createReadStream(path.join(logsDir, file)),
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
  
  if (events.length === 0) {
    console.log(`Không tìm thấy log nào với requestId: ${requestId}`);
    process.exit(0);
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
    
    if (Object.keys(details).length > 0) {
      console.log(JSON.stringify(details, null, 2));
    }
    console.log('-----------------------------------');
  });
  
  // Tính toán thống kê
  const totalTime = events.length > 1 
    ? events[events.length - 1].timestamp - events[0].timestamp 
    : 0;
  
  const errorCount = events.filter(e => e.level === 'error').length;
  const warnCount = events.filter(e => e.level === 'warn').length;
  
  console.log('\n===== THỐNG KÊ =====');
  console.log(`Tổng số log entries: ${events.length}`);
  console.log(`Tổng thời gian xử lý: ${totalTime}ms`);
  console.log(`Số lỗi (error): ${errorCount}`);
  console.log(`Số cảnh báo (warn): ${warnCount}`);
  
  // Thống kê theo domain nếu có
  const domainCounts = {};
  events.forEach(event => {
    if (event.domain) {
      domainCounts[event.domain] = (domainCounts[event.domain] || 0) + 1;
    }
  });
  
  if (Object.keys(domainCounts).length > 0) {
    console.log('\nPhân bố theo domain:');
    for (const [domain, count] of Object.entries(domainCounts)) {
      console.log(`  - ${domain}: ${count} log entries`);
    }
  }
}

analyzeRequest().catch(error => {
  console.error('Lỗi khi phân tích logs:', error);
  process.exit(1);
}); 