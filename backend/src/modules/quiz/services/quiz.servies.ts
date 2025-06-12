import { AppError } from '../../../middlewares/error.middleware';
import { prisma } from '../../../services/prisma.service';
import { CreateQuizDto } from '../dtos/create-quiz.dto';
import { UpdateQuizDto } from '../dtos/update-quiz.dto';
import jwt from 'jsonwebtoken';

/**
 * Tạo mã code ngẫu nhiên cho quiz
 */
function generateRandomCode(length = 6): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

/**
 * Service xử lý các hoạt động liên quan đến quiz
 */
class QuizService {
  /**
   * Tạo một quiz mới
   */
  async createQuiz(data: CreateQuizDto, userId: string) {
    try {
      // Tạo mã code ngẫu nhiên nếu chưa có
      const quizCode = data.code || generateRandomCode();
      
      // Kiểm tra xem mã code đã tồn tại chưa
      const existingQuiz = await prisma.quiz.findFirst({
        where: { code: quizCode }
      });
      
      if (existingQuiz) {
        throw new AppError('Mã phòng đã tồn tại', 400);
      }
      
      // Tạo quiz mới
      const quiz = await prisma.quiz.create({
        data: {
          title: data.title,
          description: data.description || '',
          timeLimit: data.duration, // Sử dụng timeLimit thay vì duration
          code: quizCode,
          isPublic: data.isPublic || false,
          creatorId: userId // Sử dụng creatorId thay vì authorId
        }
      });
      
      return quiz;
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new AppError(`Lỗi khi tạo quiz: ${errorMessage}`, 500);
    }
  }
    /**
   * Tham gia vào phòng quiz bằng mã code
   * @param code Mã code của phòng quiz
   * @param userId ID của người dùng (nếu đã đăng nhập)
   * @param displayName Tên hiển thị (nếu chưa đăng nhập)
   * @returns Thông tin về phòng quiz và người tham gia
   */
    async joinQuiz(code: string, userId?: string, displayName?: string) {
      try {
        // Tìm phiên quiz theo mã code
        const session = await prisma.quizSession.findUnique({
          where: { code },
          include: {
            quiz: {
              include: {
                creator: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true
                  }
                }
              }
            }
          }
        });

        if (!session) {
          throw new AppError('Không tìm thấy phòng quiz với mã này', 404);
        }

        if (session.status !== 'ACTIVE' && session.status !== 'PENDING') {
          throw new AppError('Phòng quiz này đã kết thúc hoặc bị hủy', 400);
        }

        let user;
        let token;

        // Nếu có userId, kiểm tra user hiện tại
        if (userId) {
          user = await prisma.user.findUnique({
            where: { id: userId }
          });

          if (!user) {
            throw new AppError('Không tìm thấy thông tin người dùng', 404);
          }
          
          // Tạo token cho user đã đăng nhập
          token = jwt.sign(
            { 
              id: user.id, 
              role: user.role,
              isGuest: false 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
          );
        } 
        // Nếu không có userId nhưng có displayName, tạo user khách
        else if (displayName) {
          // Tạo user ở trạng thái khách
          user = await prisma.user.create({
            data: {
              fullName: displayName,
              isGuest: true,
              role: 'STUDENT'
            }
          });

          // Tạo token cho user khách
          token = jwt.sign(
            { 
              id: user.id, 
              role: user.role,
              isGuest: true 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
          );
        } else {
          throw new AppError('Vui lòng cung cấp tên hiển thị để tham gia', 400);
        }

        // Kiểm tra xem người dùng đã tham gia phòng này chưa
        const existingParticipant = await prisma.participant.findUnique({
          where: {
            userId_sessionId: {
              userId: user.id,
              sessionId: session.id
            }
          }
        });

        if (existingParticipant) {
          return {
            session,
            quiz: session.quiz,
            participant: existingParticipant,
            token
          };
        }

        // Tạo participant mới
        const participant = await prisma.participant.create({
          data: {
            userId: user.id,
            sessionId: session.id,
            score: 0,
            joinTime: new Date()
          }
        });

        return {
          session,
          quiz: session.quiz,
          participant,
          token
        };
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        throw new AppError('Không thể tham gia phòng quiz: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'), 500);
      }
    }
  /**
   * Lấy danh sách quiz của một người dùng
   */
  async getQuizzesByUser(userId: string) {
    try {
      return await prisma.quiz.findMany({
        where: { creatorId: userId }, // Sử dụng creatorId thay vì authorId
        orderBy: { createdAt: 'desc' }
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new AppError(`Lỗi khi lấy danh sách quiz: ${errorMessage}`, 500);
    }
  }
  
  /**
   * Lấy chi tiết quiz theo ID
   */
  async getQuizById(quizId: string) {
    try {
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          questions: {
            include: { options: true },
            orderBy: { order: 'asc' }
          }
        }
      });
      
      if (!quiz) {
        throw new AppError('Quiz không tồn tại', 404);
      }
      
      return quiz;
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new AppError(`Lỗi khi lấy chi tiết quiz: ${errorMessage}`, 500);
    }
  }
  
  /**
   * Lấy quiz theo mã tham gia (code)
   */
  async getQuizByCode(code: string) {
    try {
      const quiz = await prisma.quiz.findFirst({
        where: { code }
      });
      
      if (!quiz) {
        throw new AppError('Không tìm thấy phòng với mã này', 404);
      }
      
      return quiz;
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new AppError(`Lỗi khi tìm quiz theo mã: ${errorMessage}`, 500);
    }
  }
  
  /**
   * Cập nhật thông tin quiz
   */
  async updateQuiz(quizId: string, data: UpdateQuizDto, userId: string) {
    try {
      // Kiểm tra quiz tồn tại và thuộc về người dùng hiện tại
      const existingQuiz = await prisma.quiz.findFirst({
        where: {
          id: quizId,
          creatorId: userId // Sử dụng creatorId thay vì authorId
        }
      });
      
      if (!existingQuiz) {
        throw new AppError('Quiz không tồn tại hoặc bạn không có quyền sửa', 404);
      }
      
      // Nếu có cập nhật mã code, kiểm tra xem đã tồn tại chưa
      if (data.code && data.code !== existingQuiz.code) {
        const codeExists = await prisma.quiz.findFirst({
          where: {
            code: data.code,
            id: { not: quizId }
          }
        });
        
        if (codeExists) {
          throw new AppError('Mã phòng đã tồn tại', 400);
        }
      }
      
      // Cập nhật quiz
      return await prisma.quiz.update({
        where: { id: quizId },
        data: {
          title: data.title,
          description: data.description,
          timeLimit: data.duration, // Sử dụng timeLimit thay vì duration
          code: data.code,
          isPublic: data.isPublic
        }
      });
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new AppError(`Lỗi khi cập nhật quiz: ${errorMessage}`, 500);
    }
  }
  
  /**
   * Xóa quiz
   */
  async deleteQuiz(quizId: string, userId: string) {
    try {
      // Kiểm tra quiz tồn tại và thuộc về người dùng hiện tại
      const existingQuiz = await prisma.quiz.findFirst({
        where: {
          id: quizId,
          creatorId: userId // Sử dụng creatorId thay vì authorId
        }
      });
      
      if (!existingQuiz) {
        throw new AppError('Quiz không tồn tại hoặc bạn không có quyền xóa', 404);
      }
      
      // Xóa quiz
      await prisma.quiz.delete({
        where: { id: quizId }
      });
      
      return { success: true };
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new AppError(`Lỗi khi xóa quiz: ${errorMessage}`, 500);
    }
  }
}

export const quizService = new QuizService();