import { AppError } from '../../../middlewares/error.middleware';
import { prisma } from '../../../services/prisma.service';
import { QuestionDifficulty } from '@prisma/client';

/**
 * Service xử lý các hoạt động liên quan đến câu trả lời và tính điểm
 */
class AnswerService {
  /**
   * Gửi câu trả lời và tính điểm
   * @param participantId ID của người tham gia
   * @param questionId ID của câu hỏi
   * @param optionId ID của đáp án đã chọn
   * @param sessionId ID của phiên quiz
   * @param responseTime Thời gian trả lời (milliseconds)
   * @returns Thông tin về câu trả lời và điểm số
   */
  async submitAnswer(
    participantId: string,
    questionId: string,
    optionId: string,
    sessionId: string,
    responseTime: number
  ) {
    try {
      // Kiểm tra phiên quiz
      const session = await prisma.quizSession.findUnique({
        where: { id: sessionId }
      });
      
      if (!session) {
        throw new AppError('Phiên quiz không tồn tại', 404);
      }
      
      if (session.status !== 'ACTIVE') {
        throw new AppError('Phiên quiz chưa bắt đầu hoặc đã kết thúc', 400);
      }
      console.log('session', session);
      console.log('participantId', participantId);
      // Kiểm tra người tham gia
      const participant = await prisma.participant.findUnique({
        where: {
          id: participantId,  
          sessionId: sessionId
        }
      });
      console.log('participant', participant);
      if (!participant) {
        throw new AppError('Bạn chưa tham gia phiên quiz này', 404);
      }
      
      // Kiểm tra câu hỏi thuộc về quiz
      const question = await prisma.quizQuestion.findFirst({
        where: {
          id: questionId,
          quizId: session.quizId
        },
        include: {
          options: true
        }
      });
      
      if (!question) {
        throw new AppError('Câu hỏi không tồn tại trong quiz này', 404);
      }
      
      // Kiểm tra đáp án đã chọn
      const selectedOption = question.options.find(option => option.id === optionId);
      
      if (!selectedOption) {
        throw new AppError('Đáp án không tồn tại', 404);
      }
      
      // Kiểm tra xem đã trả lời câu hỏi này chưa
      const existingAnswer = await prisma.answer.findUnique({
        where: {
          participantId_questionId: {
            participantId: participant.id,
            questionId
          }
        }
      });
      
      if (existingAnswer) {
        throw new AppError('Bạn đã trả lời câu hỏi này rồi', 400);
      }
      
      // Tính điểm
      const points = this.calculatePoints(
        selectedOption.isCorrect,
        question.difficulty,
        responseTime,
        question.timeLimit || 30
      );
      
      // Lưu câu trả lời
      const answer = await prisma.answer.create({
        data: {
          participantId: participant.id,
          questionId,
          optionId,
          isCorrect: selectedOption.isCorrect,
          points,
          responseTime
        }
      });
      
      // Cập nhật tổng điểm của người tham gia
      await prisma.participant.update({
        where: { id: participant.id },
        data: {
          score: {
            increment: points
          }
        }
      });
      
      return {
        answer,
        isCorrect: selectedOption.isCorrect,
        points
      };
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new AppError(`Lỗi khi gửi câu trả lời: ${errorMessage}`, 500);
    }
  }
  
  /**
   * Tính điểm dựa trên độ chính xác, độ khó và thời gian trả lời
   * @param isCorrect Câu trả lời có đúng không
   * @param difficulty Độ khó của câu hỏi
   * @param responseTime Thời gian trả lời (milliseconds)
   * @param timeLimit Thời gian giới hạn cho câu hỏi (seconds)
   * @returns Số điểm
   */
  private calculatePoints(
    isCorrect: boolean,
    difficulty: QuestionDifficulty,
    responseTime: number,
    timeLimit: number
  ): number {
    // Nếu trả lời sai, không có điểm
    if (!isCorrect) {
      return 0;
    }
    
    // Điểm cơ bản dựa trên độ khó
    let basePoints = 0;
    switch (difficulty) {
      case 'EASY':
        basePoints = 5;
        break;
      case 'MEDIUM':
        basePoints = 10;
        break;
      case 'HARD':
        basePoints = 15;
        break;
      default:
        basePoints = 10;
    }
    
    // Điểm thưởng dựa trên thời gian trả lời
    // Chuyển đổi timeLimit từ giây sang millisecond
    const timeLimitMs = timeLimit * 1000;
    
    // Nếu trả lời trong 25% thời gian đầu
    if (responseTime <= timeLimitMs * 0.25) {
      return Math.round(basePoints * 1.5); // Thưởng 50%
    }
    
    // Nếu trả lời trong 50% thời gian đầu
    if (responseTime <= timeLimitMs * 0.5) {
      return Math.round(basePoints * 1.25); // Thưởng 25%
    }
    
    // Nếu trả lời trong 75% thời gian đầu
    if (responseTime <= timeLimitMs * 0.75) {
      return Math.round(basePoints * 1.1); // Thưởng 10%
    }
    
    // Trả lời trong thời gian còn lại
    return basePoints;
  }
  
  /**
   * Lấy kết quả của người tham gia
   * @param participantId ID của người tham gia
   * @returns Thông tin kết quả và chi tiết các câu trả lời
   */
  async getParticipantResults(participantId: string) {
    try {
      const participant = await prisma.participant.findUnique({
        where: { id: participantId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              isGuest: true
            }
          },
          answers: {
            include: {
              question: true,
              option: true
            }
          },
          session: {
            include: {
              quiz: true
            }
          }
        }
      });
      
      if (!participant) {
        throw new AppError('Không tìm thấy thông tin người tham gia', 404);
      }
      
      // Tính toán thống kê
      const totalQuestions = await prisma.quizQuestion.count({
        where: { quizId: participant.session.quizId }
      });
      
      const correctAnswers = participant.answers.filter(answer => answer.isCorrect).length;
      const incorrectAnswers = participant.answers.length - correctAnswers;
      const unanswered = totalQuestions - participant.answers.length;
      
      // Định dạng lại kết quả
      const formattedAnswers = participant.answers.map(answer => ({
        questionId: answer.questionId,
        question: answer.question.content,
        selectedOption: answer.option?.content,
        isCorrect: answer.isCorrect,
        points: answer.points,
        responseTime: answer.responseTime
      }));
      
      return {
        participant: {
          id: participant.id,
          user: participant.user,
          score: participant.score,
          rank: participant.rank
        },
        quiz: {
          id: participant.session.quiz.id,
          title: participant.session.quiz.title
        },
        session: {
          id: participant.session.id,
          code: participant.session.code,
          status: participant.session.status
        },
        statistics: {
          totalQuestions,
          answered: participant.answers.length,
          correctAnswers,
          incorrectAnswers,
          unanswered,
          accuracy: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
        },
        answers: formattedAnswers
      };
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      throw new AppError(`Lỗi khi lấy kết quả: ${errorMessage}`, 500);
    }
  }
}

export const answerService = new AnswerService(); 