import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../services/logger.service';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Tạo unique request ID cho mỗi request
  const requestId = uuidv4();
  req.requestId = requestId;

  // Thêm requestId vào response headers để dễ dàng theo dõi request
  res.setHeader('X-Request-ID', requestId);

  // Log khi request bắt đầu
  logger.info('Request received', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Ghi lại thời gian response
  const startTime = Date.now();
  
  // Theo dõi khi response được gửi
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[logLevel]('Request completed', {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('user-agent'),
    });
  });

  next();
}; 