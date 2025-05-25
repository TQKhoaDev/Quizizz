import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth-service';
import { UserRole } from '../../prisma/enums';

// Mở rộng kiểu Request để thêm thuộc tính user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware xác thực người dùng thông qua token JWT
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    let token = null;

    // Thứ tự ưu tiên: 1. Cookie, 2. Authorization header
    if (req.cookies && req.cookies.auth_token) {
      token = req.cookies.auth_token;
    } else {
      // Hỗ trợ ngược để tương thích với các client cũ
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token ) {
      res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực',
      });
      return;
    }

    // Xác thực token
    const decoded = authService.verifyToken(token) as {
      id: string;
      email: string;
      role: string;
    };

    // Gán thông tin người dùng vào request để sử dụng ở các middleware tiếp theo
    req.user = decoded;

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message || 'Không có quyền truy cập',
    });
    return;
  }
};

/**
 * Middleware xác thực cho phép sử dụng token hoặc participantId
 * Nếu có participantId trong body, bỏ qua yêu cầu token
 */
export const authenticateWithParticipant = (req: Request, res: Response, next: NextFunction): void => {
  // Nếu có participantId trong body, cho phép tiếp tục mà không cần token
  if (req.body && req.body.participantId) {
    return next();
  }

  // Nếu không có participantId, yêu cầu xác thực bằng token
  authenticate(req, res, next);
};

/**
 * Middleware kiểm tra vai trò người dùng
 * @param roles Danh sách các vai trò được phép truy cập
 */
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Vui lòng đăng nhập',
        });
        return;
      }

      // Kiểm tra xem người dùng có vai trò được phép không
      if (!roles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          message: 'Không có quyền thực hiện hành động này',
        });
        return;
      }

      next();
    } catch (error: any) {
      res.status(403).json({
        success: false,
        message: error.message || 'Không có quyền thực hiện hành động này',
      });
      return;
    }
  };
};

// Hàm tiện ích kiểm tra quyền ADMIN
export const requireAdmin = authorize([UserRole.ADMIN]);

// Hàm tiện ích kiểm tra quyền PROCTOR (giáo viên)
export const requireProctor = authorize([UserRole.ADMIN, UserRole.PROCTOR]);

// Hàm tiện ích kiểm tra quyền của bất kỳ người dùng đã đăng nhập
export const requireAuth = authenticate;

// Hàm tiện ích cho phép người dùng đăng nhập hoặc khách với participantId
export const requireAuthOrParticipant = authenticateWithParticipant;
