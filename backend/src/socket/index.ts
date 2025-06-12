import { Server } from 'socket.io';
import http from 'http';
import { prisma } from '../index';
import jwt from 'jsonwebtoken';

type SessionRole = 'PROCTOR' | 'STUDENT' | 'ADMIN';

interface SessionUser {
  userId: string;
  sessionId: string;
  role: SessionRole;
  isGuest: boolean;
}

class SocketService {
  private io: Server | null = null;

  initialize(httpServer: http.Server) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:5173',
        credentials: true,
      },
    });

    // Tạo namespace cho các phiên quiz
    const quizSessionsNamespace = this.io.of('/quiz-sessions');

    quizSessionsNamespace.use((socket, next) => {
      const { token, sessionId, role } = socket.handshake.query;
      
      if (!token || !sessionId || !role) {
        return next(new Error('Thiếu thông tin xác thực'));
      }

      try {
        // Xác thực token
        const decoded = jwt.verify(token as string, process.env.JWT_SECRET || 'your-secret-key') as {
          id: string;
          role: string;
          isGuest: boolean;
        };

        // Kiểm tra role hợp lệ
        if (role !== 'PROCTOR' && role !== 'STUDENT' && role !== 'ADMIN') {
          return next(new Error('Role không hợp lệ'));
        }

        // Lưu thông tin user vào socket
        socket.data.user = {
          userId: decoded.id,
          sessionId: sessionId as string,
          role: role as SessionRole,
          isGuest: decoded.isGuest
        };

        next();
      } catch (error) {
        return next(new Error('Token không hợp lệ'));
      }
    });

    // Xử lý kết nối
    quizSessionsNamespace.on('connection', (socket) => {
      const user = socket.data.user as SessionUser;
      
      // Tham gia vào phòng chờ
      socket.join(user.sessionId);
      console.log(`✅ Người dùng ${user.userId} đã kết nối tới phiên ${user.sessionId}`);

      // Thông báo cho tất cả người trong phòng có người mới tham gia
      quizSessionsNamespace.to(user.sessionId).emit('participant-joined', {
        userId: user.userId,
        role: user.role,
        timestamp: new Date().toISOString()
      });

      // Xử lý khi người dùng sẵn sàng
      socket.on('ready', () => {
        quizSessionsNamespace.to(user.sessionId).emit('participant-ready', {
          userId: user.userId,
          timestamp: new Date().toISOString()
        });
      });

      // Xử lý khi người dùng không sẵn sàng
      socket.on('not-ready', () => {
        quizSessionsNamespace.to(user.sessionId).emit('participant-not-ready', {
          userId: user.userId,
          timestamp: new Date().toISOString()
        });
      });

      // Xử lý khi giám thị bắt đầu phiên
      socket.on('start-session', () => {
        if (user.role === 'PROCTOR') {
          quizSessionsNamespace.to(user.sessionId).emit('session-started', {
            timestamp: new Date().toISOString()
          });
        }
      });

      // Xử lý khi giám thị kết thúc phiên
      socket.on('end-session', () => {
        if (user.role === 'PROCTOR') {
          quizSessionsNamespace.to(user.sessionId).emit('session-ended', {
            timestamp: new Date().toISOString()
          });
        }
      });

      // Xử lý ngắt kết nối
      socket.on('disconnect', () => {
        console.log(`❌ Người dùng ${user.userId} đã ngắt kết nối`);
        quizSessionsNamespace.to(user.sessionId).emit('participant-left', {
          userId: user.userId,
          timestamp: new Date().toISOString()
        });
      });
    });

    console.log('✅ Socket.IO server đã được khởi tạo với namespace /quiz-sessions');
    console.log('port web socket',process.env.PORT)
  }
}

export const socketService = new SocketService(); 