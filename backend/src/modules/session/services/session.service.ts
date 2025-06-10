import { AppError } from '../../../middlewares/error.middleware';
import { prisma } from '../../../services/prisma.service';
import type { QuizSession, SessionStatus } from '../types/session.types';

/**
 * Service xử lý các hoạt động liên quan đến phiên quiz
 */
class SessionService {
  /**
   * Tạo phiên quiz mới
   * @param quizId ID của quiz
   * @param proctorId ID của người giám sát
   * @returns Thông tin phiên quiz vừa tạo
   */
  async createSession(quizId: string, proctorId: string): Promise<QuizSession> {
    try {
      // Kiểm tra quiz tồn tại
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId }
      });
      
      if (!quiz) {
        throw new AppError('Quiz không tồn tại', 404);
      }
      
      // Tạo mã phòng ngẫu nhiên
      const sessionCode = this.generateSessionCode();
      
      // Kiểm tra xem mã phòng đã tồn tại chưa
      const existingSession = await prisma.quizSession.findFirst({
        where: { code: sessionCode }
      });
      
      if (existingSession) {
        // Nếu trùng, gọi đệ quy để tạo mã khác
        return this.createSession(quizId, proctorId);
      }
      
      // Tạo phiên mới
      const session = await prisma.quizSession.create({
        data: {
          quizId,
          proctorId,
          code: sessionCode,
          status: 'PENDING'
        },
        include: {
          quiz: true
        }
      });
      
      return session;
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new AppError(`Lỗi khi tạo phiên quiz: ${errorMessage}`, 500);
    }
  }
  
  /**
   * Bắt đầu phiên quiz
   * @param sessionId ID của phiên quiz
   * @param proctorId ID của người giám sát (để kiểm tra quyền)
   * @returns Thông tin phiên quiz đã cập nhật
   */
  async startSession(sessionId: string, proctorId: string) {
    try {
      // Kiểm tra phiên tồn tại và thuộc về người giám sát
      const session = await prisma.quizSession.findFirst({
        where: {
          id: sessionId,
          proctorId
        }
      });
      
      if (!session) {
        throw new AppError('Phiên quiz không tồn tại hoặc bạn không có quyền', 404);
      }
      
      if (session.status !== 'PENDING') {
        throw new AppError('Phiên quiz đã bắt đầu hoặc đã kết thúc', 400);
      }
      
      // Cập nhật trạng thái và thời gian bắt đầu
      const updatedSession = await prisma.quizSession.update({
        where: { id: sessionId },
        data: {
          status: 'ACTIVE',
          startTime: new Date()
        },
        include: {
          quiz: true,
          participants: true
        }
      });
      
      return updatedSession;
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new AppError(`Lỗi khi bắt đầu phiên quiz: ${errorMessage}`, 500);
    }
  }
  
  /**
   * Kết thúc phiên quiz
   * @param sessionId ID của phiên quiz
   * @param proctorId ID của người giám sát (để kiểm tra quyền)
   * @returns Thông tin phiên quiz đã cập nhật
   */
  async endSession(sessionId: string, proctorId: string) {
    try {
      // Kiểm tra phiên tồn tại và thuộc về người giám sát
      const session = await prisma.quizSession.findFirst({
        where: {
          id: sessionId,
          proctorId
        }
      });
      
      if (!session) {
        throw new AppError('Phiên quiz không tồn tại hoặc bạn không có quyền', 404);
      }
      
      if (session.status !== 'ACTIVE') {
        throw new AppError('Phiên quiz chưa bắt đầu hoặc đã kết thúc', 400);
      }
      
      // Cập nhật trạng thái và thời gian kết thúc
      const updatedSession = await prisma.quizSession.update({
        where: { id: sessionId },
        data: {
          status: 'COMPLETED',
          endTime: new Date()
        },
        include: {
          quiz: true,
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  isGuest: true
                }
              }
            }
          }
        }
      });
      
      // Tính toán xếp hạng cho người tham gia
      await this.calculateRankings(sessionId);
      
      return updatedSession;
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new AppError(`Lỗi khi kết thúc phiên quiz: ${errorMessage}`, 500);
    }
  }
  
  /**
   * Hủy phiên quiz
   * @param sessionId ID của phiên quiz
   * @param proctorId ID của người giám sát (để kiểm tra quyền)
   * @returns Thông tin phiên quiz đã cập nhật
   */
  async cancelSession(sessionId: string, proctorId: string) {
    try {
      // Kiểm tra phiên tồn tại và thuộc về người giám sát
      const session = await prisma.quizSession.findFirst({
        where: {
          id: sessionId,
          proctorId
        }
      });
      
      if (!session) {
        throw new AppError('Phiên quiz không tồn tại hoặc bạn không có quyền', 404);
      }
      
      if (session.status === 'COMPLETED' || session.status === 'CANCELLED') {
        throw new AppError('Phiên quiz đã kết thúc hoặc đã bị hủy', 400);
      }
      
      // Cập nhật trạng thái
      const updatedSession = await prisma.quizSession.update({
        where: { id: sessionId },
        data: {
          status: 'CANCELLED',
          endTime: new Date()
        }
      });
      
      return updatedSession;
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new AppError(`Lỗi khi hủy phiên quiz: ${errorMessage}`, 500);
    }
  }
  
  /**
   * Lấy danh sách phiên quiz của người giám sát
   * @param proctorId ID của người giám sát
   * @returns Danh sách phiên quiz
   */
  async getSessionsByProctor(proctorId: string) {
    try {
      return await prisma.quizSession.findMany({
        where: { proctorId },
        include: {
          quiz: true,
          _count: {
            select: { participants: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new AppError(`Lỗi khi lấy danh sách phiên quiz: ${errorMessage}`, 500);
    }
  }
  
  /**
   * Lấy thông tin chi tiết phiên quiz
   * @param sessionId ID của phiên quiz
   * @param proctorId ID của người giám sát (để kiểm tra quyền)
   * @returns Thông tin chi tiết phiên quiz
   */
  async getSessionById(sessionId: string, proctorId?: string) {
    try {
      const whereCondition: any = { id: sessionId };
      
      // Nếu có proctorId, kiểm tra quyền
      if (proctorId) {
        whereCondition.proctorId = proctorId;
      }
      
      const session = await prisma.quizSession.findFirst({
        where: whereCondition,
        include: {
          quiz: {
            include: {
              questions: {
                include: { options: true },
                orderBy: { order: 'asc' }
              }
            }
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  isGuest: true
                }
              }
            },
            orderBy: { score: 'desc' }
          }
        }
      });
      
      if (!session) {
        throw new AppError('Phiên quiz không tồn tại hoặc bạn không có quyền', 404);
      }
      
      return session;
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new AppError(`Lỗi khi lấy thông tin phiên quiz: ${errorMessage}`, 500);
    }
  }
  
  /**
   * Tính toán xếp hạng cho người tham gia
   * @param sessionId ID của phiên quiz
   */
  private async calculateRankings(sessionId: string) {
    try {
      // Lấy danh sách người tham gia theo điểm số giảm dần
      const participants = await prisma.participant.findMany({
        where: { sessionId },
        orderBy: { score: 'desc' }
      });
      
      // Cập nhật xếp hạng
      for (let i = 0; i < participants.length; i++) {
        await prisma.participant.update({
          where: { id: participants[i].id },
          data: { rank: i + 1 }
        });
      }
    } catch (error) {
      console.error('Lỗi khi tính toán xếp hạng:', error);
    }
  }
  
  /**
   * Tạo mã phòng ngẫu nhiên
   * @returns Mã phòng ngẫu nhiên
   */
  private generateSessionCode(length = 6): string {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
  }

  /**
   * Chuyển sang câu hỏi tiếp theo
   * @param sessionId ID của phiên quiz
   * @param proctorId ID của người giám sát
   * @returns Thông tin phiên quiz sau khi cập nhật
   */
  async nextQuestion(sessionId: string, proctorId: string): Promise<QuizSession> {
    try {
      // Kiểm tra phiên tồn tại và quyền truy cập
      const session = await prisma.quizSession.findFirst({
        where: {
          id: sessionId,
          proctorId
        },
        include: {
          quiz: {
            include: {
              questions: {
                orderBy: { order: 'asc' }
              }
            }
          }
        }
      });

      if (!session) {
        throw new AppError('Phiên quiz không tồn tại hoặc bạn không có quyền', 404);
      }

      // Kiểm tra trạng thái phiên
      if (session.status !== 'ACTIVE' && session.status !== 'WAITING_NEXT_QUESTION') {
        throw new AppError('Phiên quiz không ở trạng thái phù hợp', 400);
      }

      // Kiểm tra xem còn câu hỏi tiếp theo không
      const nextQuestionIndex = (session.currentQuestionIndex ?? 0) + 1;
      if (nextQuestionIndex >= session.quiz.questions.length) {
        throw new AppError('Đã đến câu hỏi cuối cùng của quiz', 400);
      }

      // Cập nhật phiên với câu hỏi mới
      const updatedSession = await prisma.quizSession.update({
        where: { id: sessionId },
        data: {
          currentQuestionIndex: nextQuestionIndex,
          questionStartTime: new Date(),
          status: 'ACTIVE'
        },
        include: {
          quiz: {
            include: {
              questions: {
                include: { options: true },
                orderBy: { order: 'asc' }
              }
            }
          }
        }
      });

      return updatedSession;
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new AppError(`Lỗi khi chuyển câu hỏi: ${errorMessage}`, 500);
    }
  }

  /**
   * Lấy lịch sử câu hỏi
   * @param sessionId ID của phiên quiz
   * @param proctorId ID của người giám sát
   * @returns Lịch sử câu hỏi
   */
  async getQuestionHistory(sessionId: string, proctorId: string) {
    try {
      const session = await prisma.quizSession.findFirst({
        where: {
          id: sessionId,
          proctorId
        },
        include: {
          quiz: {
            include: {
              questions: {
                include: { 
                  options: true,
                  answers: {
                    include: {
                      participant: {
                        include: {
                          user: {
                            select: {
                              id: true,
                              fullName: true
                            }
                          }
                        }
                      }
                    }
                  }
                },
                orderBy: { order: 'asc' }
              }
            }
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true
                }
              },
              answers: true
            },
            orderBy: { score: 'desc' }
          }
        }
      });

      if (!session) {
        throw new AppError('Phiên quiz không tồn tại hoặc bạn không có quyền', 404);
      }

      // Lọc các câu hỏi đã qua
      const passedQuestions = session.quiz.questions
        .filter((_: any, index: number) => index < session.currentQuestionIndex)
        .map((question: any) => {
          const answers = question.answers;
          const totalAnswers = answers.length;
          const correctAnswers = answers.filter((a: any) => a.isCorrect).length;
          
          // Thống kê theo từng lựa chọn
          const optionStats = question.options.map((option: any) => {
            const selectedAnswers = answers.filter((a: any) => a.optionId === option.id);
            return {
              optionId: option.id,
              content: option.content,
              isCorrect: option.isCorrect,
              selectedCount: selectedAnswers.length,
              percentage: totalAnswers > 0 ? 
                Math.round((selectedAnswers.length / totalAnswers) * 100) : 0,
              // Thêm thông tin về người chọn
              selectedBy: selectedAnswers.map((a: any) => ({
                userId: a.participant.user.id,
                fullName: a.participant.user.fullName,
                score: a.participant.score,
                rank: a.participant.rank
              }))
            };
          });

          // Thống kê điểm số
          const scoreStats = {
            average: answers.reduce((sum: number, a: any) => sum + a.points, 0) / totalAnswers,
            highest: Math.max(...answers.map((a: any) => a.points)),
            lowest: Math.min(...answers.map((a: any) => a.points)),
            distribution: {
              perfect: answers.filter((a: any) => a.points === question.points).length,
              partial: answers.filter((a: any) => a.points > 0 && a.points < question.points).length,
              zero: answers.filter((a: any) => a.points === 0).length
            }
          };

          // Thống kê thời gian
          const responseTimes = answers.map((a: any) => a.responseTime || 0);
          const minTime = Math.min(...responseTimes);
          const maxTime = Math.max(...responseTimes);
          const avgTime = this.calculateAverageResponseTime(answers);

          return {
            id: question.id,
            content: question.content,
            type: question.type,
            timeLimit: question.timeLimit,
            points: question.points,
            difficulty: question.difficulty,
            order: question.order,
            options: question.options,
            statistics: {
              // Thống kê cơ bản
              totalAnswers,
              correctAnswers,
              accuracy: totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0,
              
              // Thống kê điểm số
              scoreStats,
              
              // Thống kê thời gian
              timeStats: {
                average: avgTime,
                minimum: minTime,
                maximum: maxTime
              },
              
              // Thống kê theo lựa chọn
              optionStats,
              
              // Thống kê theo độ khó
              difficultyStats: {
                easy: answers.filter((a: any) => a.isCorrect && question.difficulty === 'EASY').length,
                medium: answers.filter((a: any) => a.isCorrect && question.difficulty === 'MEDIUM').length,
                hard: answers.filter((a: any) => a.isCorrect && question.difficulty === 'HARD').length
              }
            }
          };
        });

      return {
        sessionId: session.id,
        currentQuestionIndex: session.currentQuestionIndex,
        passedQuestions,
        // Thêm thông tin tổng quan về phiên
        sessionStats: {
          totalParticipants: session.participants.length,
          averageScore: session.participants.reduce((sum: number, p: any) => sum + p.score, 0) / session.participants.length,
          topParticipants: session.participants.slice(0, 3).map((p: any) => ({
            userId: p.user.id,
            fullName: p.user.fullName,
            score: p.score,
            rank: p.rank
          }))
        }
      };
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new AppError(`Lỗi khi lấy thông tin câu hỏi đã qua: ${errorMessage}`, 500);
    }
  }

  /**
   * Tính thời gian trả lời trung bình
   * @param answers Danh sách câu trả lời
   * @returns Thời gian trả lời trung bình (milliseconds)
   */
  private calculateAverageResponseTime(answers: any[]): number {
    const validTimes = answers
      .map(a => a.responseTime)
      .filter(time => time !== null && time !== undefined);
    
    if (validTimes.length === 0) return 0;
    
    return Math.round(
      validTimes.reduce((sum: number, time: number) => sum + time, 0) / validTimes.length
    );
  }
}

export const sessionService = new SessionService(); 