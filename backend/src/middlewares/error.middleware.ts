import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Không tìm thấy ${req.originalUrl} trên máy chủ này`, 404));
};

export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Lỗi cơ sở dữ liệu Prisma
  if (err.code === 'P2002') {
    res.status(400).json({
      status: 'error',
      message: 'Đã tồn tại bản ghi với thông tin này',
    });
    return;
  }

  if (err.code === 'P2025') {
    res.status(404).json({
      status: 'error',
      message: 'Không tìm thấy bản ghi cần cập nhật',
    });
    return;
  }

  // Lỗi validation
  if (err.name === 'ValidationError') {
    res.status(400).json({
      status: 'error',
      message: 'Lỗi xác thực dữ liệu',
      errors: err.errors,
    });
    return;
  }

  // Lỗi JWT
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      status: 'error',
      message: 'Token không hợp lệ. Vui lòng đăng nhập lại!',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      status: 'error',
      message: 'Token đã hết hạn! Vui lòng đăng nhập lại!',
    });
    return;
  }

  // Lỗi từ các middleware
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    return;
  }

  // Lỗi không xác định
  console.error('LỖI 💥', err);
  res.status(500).json({
    status: 'error',
    message: 'Đã xảy ra lỗi không mong muốn!',
  });
};
