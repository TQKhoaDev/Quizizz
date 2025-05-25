import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Response } from 'express';
import config from '../config';
import { prisma } from '../index'; // Đảm bảo index.ts export đúng prisma instance
import { UserRole } from '@prisma/client';

/**
 * Service xử lý các hoạt động liên quan đến xác thực
 */
class AuthService {
  /**
   * Đăng nhập và trả về thông tin người dùng cùng token
   * @param email Email người dùng
   * @param password Mật khẩu người dùng
   * @param res Response object set cookie
   * @returns Thông tin người dùng và token
   */
  async login(email: string, password: string, res: Response) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Tài khoản không tồn tại');
    }

    // Kiểm tra mật khẩu với passwordHash
    const isPasswordValid = await bcrypt.compare(password, user.password ?? '');
    if (!isPasswordValid) {
      throw new Error('Mật khẩu không chính xác');
    }

    // Tạo token từ payload gồm id:string, email, role
    const token = this.generateToken({
      id: user.id,
      email: user.email ?? '',
      role: user.role,
    });
    // Lưu token vào cookie
    res.cookie('auth_token', token, {
      httpOnly: true, // Cookie chỉ được truy cập qua HTTP, không qua JavaScript
      secure: process.env.NODE_ENV === 'production', // Chỉ gửi qua HTTPS trong production
      sameSite: 'lax', // Giúp ngăn CSRF
      maxAge: 24 * 60 * 60 * 1000, // 24 giờ (millisecond)
      path: '/', // Cookie có hiệu lực trên toàn bộ trang
    });
    // Trả về user không kèm passwordHash
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  /**
   * Tạo JWT token từ payload
   */
  generateToken(payload: { id: string; email: string; role: string }) {
    return jwt.sign(payload, config.auth.jwtSecret, {
      expiresIn: config.auth.jwtExpiresIn,
    });
  }

  /**
   * Xác thực token JWT
   */
  verifyToken(token: string) {
    try {
      return jwt.verify(token, config.auth.jwtSecret);
    } catch {
      throw new Error('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  /**
   * Lấy thông tin user hiện tại từ ID
   * @param userId ID (string) của người dùng
   */
  async getCurrentUser(userId: string) {
    // Dùng luôn userId: string
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Đăng ký tài khoản người dùng mới
   * @param userData Thông tin người dùng
   * @returns Thông tin người dùng và token
   */
  async register(userData: { email: string; password: string; fullName: string; role?: string }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new Error('Email đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Tạo người dùng mới
    const newUser = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        fullName: userData.fullName,
        role: userData.role ? (userData.role as UserRole) : 'STUDENT',
      },
    });

    // Trả về user không kèm password
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }
}

export default new AuthService();
