/**
 * Script xóa các file log cũ để tránh tràn ổ đĩa
 * Giữ lại log files trong N ngày gần đây, xóa các log cũ hơn
 */

const fs = require('fs');
const path = require('path');

// Cấu hình
const LOGS_DIR = path.join(__dirname, '..', 'logs');
const RETENTION_DAYS = 30; // Giữ log trong 30 ngày
const MAX_LOG_SIZE_MB = 500; // Giới hạn kích thước tổng cộng của thư mục logs (MB)

// Đảm bảo thư mục logs tồn tại
if (!fs.existsSync(LOGS_DIR)) {
  console.log(`Thư mục logs không tồn tại: ${LOGS_DIR}`);
  process.exit(0);
}

// Lấy danh sách tất cả các file trong thư mục logs
const files = fs.readdirSync(LOGS_DIR);
if (files.length === 0) {
  console.log('Không có file log nào để xử lý');
  process.exit(0);
}

// Lọc ra các file log và lấy thông tin chi tiết
const logFiles = files
  .filter(file => file.endsWith('.log'))
  .map(file => {
    const filePath = path.join(LOGS_DIR, file);
    const stats = fs.statSync(filePath);
    return {
      name: file,
      path: filePath,
      size: stats.size,
      createdAt: stats.birthtime,
      lastModified: stats.mtime
    };
  });

console.log(`Tìm thấy ${logFiles.length} file log`);

// Tính tổng dung lượng của tất cả các file log (byte to MB)
const totalSizeMB = logFiles.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024);
console.log(`Tổng dung lượng: ${totalSizeMB.toFixed(2)} MB`);

// Xóa các file cũ hơn N ngày
const now = new Date();
const retentionThreshold = new Date(now.setDate(now.getDate() - RETENTION_DAYS));

let deletedByAge = 0;
let deletedBySize = 0;
let freedSpace = 0;

// Xóa theo thời gian
logFiles.forEach(file => {
  if (file.lastModified < retentionThreshold) {
    try {
      fs.unlinkSync(file.path);
      freedSpace += file.size;
      deletedByAge++;
      console.log(`Đã xóa file cũ: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
    } catch (error) {
      console.error(`Lỗi khi xóa file ${file.name}:`, error);
    }
  }
});

// Nếu tổng dung lượng vẫn vượt quá giới hạn, xóa thêm các file cũ nhất
if (totalSizeMB > MAX_LOG_SIZE_MB) {
  // Sắp xếp file theo thời gian sửa đổi (cũ nhất lên đầu)
  const remainingFiles = logFiles
    .filter(file => fs.existsSync(file.path))
    .sort((a, b) => a.lastModified.getTime() - b.lastModified.getTime());
  
  let currentSize = totalSizeMB - (freedSpace / (1024 * 1024));
  
  // Xóa từng file cho đến khi dung lượng nằm trong giới hạn
  for (const file of remainingFiles) {
    if (currentSize <= MAX_LOG_SIZE_MB) break;
    
    try {
      fs.unlinkSync(file.path);
      const fileSizeMB = file.size / (1024 * 1024);
      currentSize -= fileSizeMB;
      freedSpace += file.size;
      deletedBySize++;
      console.log(`Đã xóa file do vượt quá giới hạn dung lượng: ${file.name} (${fileSizeMB.toFixed(2)} MB)`);
    } catch (error) {
      console.error(`Lỗi khi xóa file ${file.name}:`, error);
    }
  }
}

// Hiển thị kết quả
console.log('-------- Kết quả dọn dẹp logs --------');
console.log(`Đã xóa ${deletedByAge} file do quá hạn lưu trữ`);
console.log(`Đã xóa ${deletedBySize} file do vượt quá giới hạn dung lượng`);
console.log(`Đã giải phóng ${(freedSpace / (1024 * 1024)).toFixed(2)} MB`);
console.log('------------------------------------'); 