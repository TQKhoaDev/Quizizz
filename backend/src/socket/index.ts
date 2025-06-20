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
  fullName?: string;
  joinTime: string;
}

interface ParticipantInfo {
  userId: string;
  fullName: string;
  role: SessionRole;
  isGuest: boolean;
  ready: boolean;
  timestamp: string;
  isOnline: boolean;
}

class SocketService {
  private io: Server | null = null;
  // Map để track participants trong memory cho realtime updates
  private sessionParticipants = new Map<string, Map<string, ParticipantInfo>>();

  initialize(httpServer: http.Server) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:5173',
        credentials: true,
      },
    });

    // Tạo namespace cho các phiên quiz
    const quizSessionsNamespace = this.io.of('/quiz-sessions');

    quizSessionsNamespace.use(async (socket, next) => {
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

        // Lấy thông tin user từ database - cải thiện để luôn có tên
        let userInfo = null;
        let displayName = `Khách ${decoded.id.slice(-4)}`;
        
        if (!decoded.isGuest) {
          userInfo = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { 
              fullName: true, 
              email: true,
              isGuest: true,
              role: true
            }
          });
          
          console.log('🔍 [SOCKET] User info from DB:', {
            userId: decoded.id,
            userInfo,
            hasFullName: !!userInfo?.fullName
          });
          
          // Sử dụng fullName từ database nếu có, ngược lại dùng email hoặc tên mặc định
          if (userInfo?.fullName) {
            displayName = userInfo.fullName;
          } else if (userInfo?.email) {
            displayName = userInfo.email.split('@')[0]; // Lấy phần trước @ của email
          } else {
            displayName = `Người dùng ${decoded.id.slice(-4)}`;
          }
        } else {
          // Đối với guest user, kiểm tra xem có thông tin trong database không
          const guestInfo = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { fullName: true, isGuest: true }
          });
          
          if (guestInfo?.fullName) {
            displayName = guestInfo.fullName;
          }
          
          console.log('🔍 [SOCKET] Guest user info:', {
            userId: decoded.id,
            guestInfo,
            displayName
          });
        }

        // Lưu thông tin user vào socket
        socket.data.user = {
          userId: decoded.id,
          sessionId: sessionId as string,
          role: role as SessionRole,
          isGuest: decoded.isGuest,
          fullName: displayName,
          joinTime: new Date().toISOString()
        };

        console.log('✅ [SOCKET] User authenticated:', {
          userId: decoded.id,
          fullName: displayName,
          role: role,
          isGuest: decoded.isGuest,
          sessionId: sessionId
        });

        next();
      } catch (error) {
        console.error('❌ [SOCKET] Authentication error:', error);
        return next(new Error('Token không hợp lệ'));
      }
    });

    // Xử lý kết nối
    quizSessionsNamespace.on('connection', async (socket) => {
      const user = socket.data.user as SessionUser;
      
      try {
        // Tham gia vào phòng chờ
        socket.join(user.sessionId);
        
        // Kiểm tra session tồn tại
        const session = await prisma.quizSession.findUnique({
          where: { id: user.sessionId }
        });

        if (!session) {
          socket.emit('error', { message: 'Session không tồn tại' });
          return;
        }

        // Tạo hoặc cập nhật participant trong database
        await prisma.participant.upsert({
          where: {
            userId_sessionId: {
              sessionId: user.sessionId,
              userId: user.userId
            }
          },
          update: {
            joinTime: new Date()
          },
          create: {
            sessionId: user.sessionId,
            userId: user.userId,
            joinTime: new Date()
          }
        });

        // Lấy thông tin participant với user relation để có fullName chính xác
        const participantWithUser = await prisma.participant.findUnique({
          where: {
            userId_sessionId: {
              sessionId: user.sessionId,
              userId: user.userId
            }
          },
          include: {
            user: {
              select: {
                fullName: true,
                role: true,
                isGuest: true,
                email: true
              }
            }
          }
        });

        // Xác định tên hiển thị từ participant relation
        let participantDisplayName: string = user.fullName || `Khách ${user.userId.slice(-4)}`; // Fallback từ socket authentication
        if (participantWithUser?.user) {
          const userData = participantWithUser.user;
          if (userData.fullName) {
            participantDisplayName = userData.fullName;
          } else if (userData.email && !userData.isGuest) {
            participantDisplayName = userData.email.split('@')[0];
          }
        }

        console.log('📋 [SOCKET] Participant info:', {
          userId: user.userId,
          originalName: user.fullName,
          finalName: participantDisplayName,
          fromDatabase: !!participantWithUser?.user?.fullName
        });

        // Thêm participant vào memory map
        if (!this.sessionParticipants.has(user.sessionId)) {
          this.sessionParticipants.set(user.sessionId, new Map());
        }

        const sessionMap = this.sessionParticipants.get(user.sessionId)!;
        const participantInfo: ParticipantInfo = {
          userId: user.userId,
          fullName: participantDisplayName,
          role: user.role,
          isGuest: user.isGuest,
          ready: false,
          timestamp: user.joinTime,
          isOnline: true
        };

        sessionMap.set(user.userId, participantInfo);

        console.log(`✅ Người dùng ${participantDisplayName} (${user.userId}) đã kết nối tới phiên ${user.sessionId}`);

        // Gửi danh sách participants hiện tại cho user mới tham gia
        const currentParticipants = Array.from(sessionMap.values());
        socket.emit('participant-list-updated', currentParticipants);

        // Thông báo cho tất cả người trong phòng có người mới tham gia
        socket.to(user.sessionId).emit('participant-joined', {
          userId: user.userId,
          fullName: participantDisplayName,
          role: user.role,
          isGuest: user.isGuest,
          timestamp: user.joinTime,
          totalParticipants: currentParticipants.length
        });

        // Gửi cập nhật danh sách đầy đủ cho tất cả
        quizSessionsNamespace.to(user.sessionId).emit('participant-list-updated', currentParticipants);

        // Xử lý khi người dùng đánh dấu sẵn sàng
        socket.on('mark-ready', () => {
          const participant = sessionMap.get(user.userId);
          if (participant) {
            participant.ready = true;
            sessionMap.set(user.userId, participant);
            
            // Thông báo cho tất cả trong phòng
            quizSessionsNamespace.to(user.sessionId).emit('participant-ready', {
              userId: user.userId,
              fullName: participant.fullName,
              timestamp: new Date().toISOString()
            });

            // Gửi danh sách cập nhật
            const updatedParticipants = Array.from(sessionMap.values());
            quizSessionsNamespace.to(user.sessionId).emit('participant-list-updated', updatedParticipants);
          }
        });

        // Xử lý khi người dùng hủy sẵn sàng
        socket.on('mark-not-ready', () => {
          const participant = sessionMap.get(user.userId);
          if (participant) {
            participant.ready = false;
            sessionMap.set(user.userId, participant);
            
            // Thông báo cho tất cả trong phòng
            quizSessionsNamespace.to(user.sessionId).emit('participant-not-ready', {
              userId: user.userId,
              fullName: participant.fullName,
              timestamp: new Date().toISOString()
            });

            // Gửi danh sách cập nhật
            const updatedParticipants = Array.from(sessionMap.values());
            quizSessionsNamespace.to(user.sessionId).emit('participant-list-updated', updatedParticipants);
          }
        });

        // Xử lý yêu cầu danh sách participants (cho các client muốn sync lại)
        socket.on('get-participant-list', () => {
          const currentParticipants = Array.from(sessionMap.values());
          socket.emit('participant-list-updated', currentParticipants);
        });

        // Xử lý khi giám thị bắt đầu phiên
        socket.on('start-session', async () => {
          if (user.role === 'PROCTOR') {
            try {
              // Cập nhật session status trong database
              await prisma.quizSession.update({
                where: { id: user.sessionId },
                data: { status: 'ACTIVE' }
              });

              quizSessionsNamespace.to(user.sessionId).emit('session-started', {
                timestamp: new Date().toISOString()
              });
            } catch (error) {
              console.error('Lỗi khi bắt đầu session:', error);
              socket.emit('error', { message: 'Không thể bắt đầu session' });
            }
          }
        });

        // Xử lý khi giám thị kết thúc phiên
        socket.on('end-session', async () => {
          if (user.role === 'PROCTOR') {
            try {
              // Cập nhật session status trong database
              await prisma.quizSession.update({
                where: { id: user.sessionId },
                data: { status: 'COMPLETED' }
              });

              quizSessionsNamespace.to(user.sessionId).emit('session-ended', {
                timestamp: new Date().toISOString()
              });
            } catch (error) {
              console.error('Lỗi khi kết thúc session:', error);
              socket.emit('error', { message: 'Không thể kết thúc session' });
            }
          }
        });

        // Xử lý ping để maintain connection
        socket.on('ping', () => {
          socket.emit('pong', { timestamp: new Date().toISOString() });
        });

        // Xử lý ngắt kết nối
        socket.on('disconnect', async () => {
          // Lấy participant info từ memory để có tên chính xác
          const participant = sessionMap.get(user.userId);
          const participantName = participant?.fullName || user.fullName || 'Người tham gia';
          
          await this.handleDisconnect(user.sessionId, user.userId, participantName);
        });

      } catch (error) {
        console.error('Lỗi khi xử lý connection:', error);
        socket.emit('error', { message: 'Lỗi server' });
      }
    });

    console.log('✅ Socket.IO server đã được khởi tạo với namespace /quiz-sessions');
    console.log('port web socket', process.env.PORT);
  }

  // Hàm xử lý disconnect
  private async handleDisconnect(sessionId: string, userId: string, fullName: string) {
    try {
      console.log(`❌ Người dùng ${fullName} (${userId}) đã ngắt kết nối khỏi phiên ${sessionId}`);

      // Không xóa participant khỏi database khi disconnect, chỉ cập nhật memory
      // Vì họ có thể reconnect

      // Xóa khỏi memory map
      const sessionMap = this.sessionParticipants.get(sessionId);
      if (sessionMap) {
        sessionMap.delete(userId);
        
        const remainingParticipants = Array.from(sessionMap.values());
        
        // Thông báo cho những người còn lại
        if (this.io) {
          this.io.of('/quiz-sessions').to(sessionId).emit('participant-left', {
            userId: userId,
            fullName: fullName,
            timestamp: new Date().toISOString(),
            remainingParticipants: remainingParticipants.length
          });

          // Gửi danh sách cập nhật
          this.io.of('/quiz-sessions').to(sessionId).emit('participant-list-updated', remainingParticipants);
        }

        // Nếu không còn ai trong session, xóa map
        if (remainingParticipants.length === 0) {
          this.sessionParticipants.delete(sessionId);
        }
      }
    } catch (error) {
      console.error('Lỗi khi xử lý disconnect:', error);
    }
  }

  // Hàm để lấy số lượng participants hiện tại của session
  public getSessionParticipantCount(sessionId: string): number {
    const sessionMap = this.sessionParticipants.get(sessionId);
    return sessionMap ? sessionMap.size : 0;
  }

  // Hàm để lấy danh sách participants của session
  public getSessionParticipants(sessionId: string): ParticipantInfo[] {
    const sessionMap = this.sessionParticipants.get(sessionId);
    return sessionMap ? Array.from(sessionMap.values()) : [];
  }
}

export const socketService = new SocketService(); 