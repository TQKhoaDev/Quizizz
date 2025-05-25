import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

// Định nghĩa format cho log
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Tạo transport cho việc log rotation
const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join('logs', 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
});

// Transport cho error logs
const errorFileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join('logs', 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error',
});

// Tạo logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'quizizz-api' },
  transports: [
    fileRotateTransport,
    errorFileRotateTransport,
    // Log ra console trong môi trường development
    ...(process.env.NODE_ENV !== 'production'
      ? [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            ),
          }),
        ]
      : []),
  ],
});

// Lớp LoggerFactory để tạo logger theo context
export class LoggerFactory {
  /**
   * Tạo logger theo domain/context cụ thể
   * @param domain Tên domain/module/context của logger
   * @returns Logger instance với domain được chỉ định
   */
  static getLogger(domain: string) {
    return {
      debug: (message: string, meta?: Record<string, any>) => {
        logger.debug(message, { ...meta, domain });
      },
      info: (message: string, meta?: Record<string, any>) => {
        logger.info(message, { ...meta, domain });
      },
      warn: (message: string, meta?: Record<string, any>) => {
        logger.warn(message, { ...meta, domain });
      },
      error: (message: string, meta?: Record<string, any>) => {
        logger.error(message, { ...meta, domain });
      },
    };
  }
}

export default logger; 