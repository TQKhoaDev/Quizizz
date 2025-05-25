import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, body } from 'express-validator';
import { AppError } from './error.middleware';

/**
 * Middleware xác nhận dữ liệu yêu cầu sử dụng quy tắc của express-validator
 * @param validations Mảng các chuỗi xác nhận express-validator
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Thực hiện tất cả các xác nhận
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Kiểm tra lỗi xác nhận
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    // Định dạng lỗi xác nhận
    const extractedErrors: { [key: string]: string } = {};
    errors.array().forEach((err) => {
      if (err.type === 'field') {
        extractedErrors[err.path] = err.msg;
      }
    });

    // Gửi phản hồi lỗi xác nhận
    res.status(400).json({
      status: 'error',
      message: 'Xác nhận không thành công',
      errors: extractedErrors,
    });
  };
};

/**
 * Middleware xử lý lỗi không đồng bộ trong các trình xử lý tuyến đường
 * @param fn Hàm xử lý tuyến đường không đồng bộ
 */
export const catchAsync = (fn: any) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware kiểm tra kết quả validation từ express-validator
 * và trả về lỗi nếu có
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu đầu vào không hợp lệ',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Tạo middleware validation cho đăng nhập
 */
export const loginValidation = (req: Request, res: Response, next: NextFunction) => {
  // Kiểm tra xem có các trường cần thiết không
  const { email, password } = req.body;

  const errors = [];

  if (!email) {
    errors.push({
      param: 'email',
      msg: 'Email không được để trống',
    });
  } else if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
    errors.push({
      param: 'email',
      msg: 'Email không hợp lệ',
    });
  }

  if (!password) {
    errors.push({
      param: 'password',
      msg: 'Mật khẩu không được để trống',
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu đầu vào không hợp lệ',
      errors,
    });
  }

  next();
};
export const registerValidator = [
  // Email phải hợp lệ
  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  
  // Mật khẩu phải đủ mạnh
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
    .matches(/[A-Z]/)
    .withMessage('Mật khẩu phải có ít nhất 1 chữ hoa')
    .matches(/[0-9]/)
    .withMessage('Mật khẩu phải có ít nhất 1 số'),
  
  // Tên đầy đủ là bắt buộc
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Tên đầy đủ không được để trống')
    .isLength({ min: 2, max: 100 })
    .withMessage('Tên phải từ 2-100 ký tự'),
  
  // Role phải hợp lệ nếu được cung cấp
  body('role')
    .optional()
    .isIn(['ADMIN', 'PROCTOR', 'STUDENT'])
    .withMessage('Vai trò không hợp lệ'),
];