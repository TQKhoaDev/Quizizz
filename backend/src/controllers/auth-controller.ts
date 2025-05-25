import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import authService from '../services/auth-service';

/**
 * Controller xử lý các yêu cầu liên quan đến xác thực
 */
class AuthController {
  /**
   * Đăng nhập người dùng
   * @route POST /api/auth/login
   * @body {email, password}
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Kiểm tra lỗi validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: errors.array(),
        });
        return;
      }

      const { email, password } = req.body;

      // Thực hiện đăng nhập
      const result = await authService.login(email, password, res);

      // Trả về thông tin người dùng và token
      res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Đăng nhập thất bại',
      });
    }
  }

  /**
   * Lấy thông tin người dùng hiện tại
   * @route GET /api/auth/me
   * @header Authorization Bearer {token}
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({
          success: false,
          message: 'Vui lòng đăng nhập',
        });
        return;
      }

      // Lấy thông tin người dùng hiện tại từ ID trong token
      const user = await authService.getCurrentUser(req.user.id);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Không thể lấy thông tin người dùng',
      });
    }
  }
  /**
   * @route POST /api/auth/register
   * @body {email, password, fullName, role?}
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors: errors.array(),
        });
        return;
      }
      const { email, password, fullName, role } = req.body;

      const user = await authService.register({ email, password, fullName, role });
      res.status(201).json({
        success: true,
        message: 'Đăng ký thành công',
        data: user,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Đăng ký thất bại',
      });
    }
  }
  /**
   * Đăng xuất người dùng
   * @route POST /api/auth/logout
   */
  logout(req: Request, res: Response): void {
    // Xóa cookie
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công',
    });
  }
}

export default new AuthController();
