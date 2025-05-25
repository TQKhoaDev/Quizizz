import { Router } from 'express';
import authController from '../controllers/auth-controller';
import { requireAuth } from '../middlewares/auth-middleware';
import { loginValidation, registerValidator } from '../middlewares/validation.middleware';

const router = Router();

/**
 * @route POST /api/auth/login
 * @desc Đăng nhập người dùng
 * @access Public
 */
// @ts-ignore - Bỏ qua lỗi TypeScript
router.post('/login', loginValidation, authController.login);

/**
 * @route POST /api/auth/register
 * @desc Đăng ký tài khoản mới
 * @access Public
 */
// @ts-ignore - Bỏ qua lỗi TypeScript
router.post('/register', registerValidator, authController.register);

/**
 * @route GET /api/auth/me
 * @desc Lấy thông tin người dùng hiện tại
 * @access Private
 */
// @ts-ignore - Bỏ qua lỗi TypeScript
router.get('/me', requireAuth, authController.getCurrentUser);

/**
 * @route POST /api/auth/logout
 * @desc Đăng xuất người dùng
 * @access Public
 */
// @ts-ignore - Bỏ qua lỗi TypeScript
router.post('/logout', authController.logout);

export default router;
