import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import http from 'http';

// Import routes
import apiRoutes from './routes';
import cookieParser from 'cookie-parser';
// import các routes khác khi bạn triển khai chúng

// Khởi tạo biến môi trường
dotenv.config();

// Khởi tạo Prisma client
export const prisma = new PrismaClient();

// Tạo ứng dụng Express
const app: Express = express();
const httpServer = http.createServer(app); // Tạo HTTP server riêng
const port = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser()); // Thêm middleware xử lý cookie
app.use(express.urlencoded({ extended: true }));

// Endpoint kiểm tra trạng thái cơ bản
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Quizizz API đang chạy' });
});

// Áp dụng tất cả các routes
app.use('/api', apiRoutes);

// Khởi động server
httpServer.listen(port, async () => {
  console.log(`⚡️ Server đang chạy trên cổng ${port}`);

  // Khởi tạo Socket.io server (nếu cần)
  // socketService.initialize(httpServer);
  // console.log('✅ Socket.io server đã được khởi tạo');

  // Kiểm tra kết nối cơ sở dữ liệu
  try {
    await prisma.$connect();
    console.log('✅ Đã kết nối thành công với cơ sở dữ liệu');
  } catch (error) {
    console.error('❌ Không thể kết nối với cơ sở dữ liệu:', error);
    process.exit(1);
  }
});
