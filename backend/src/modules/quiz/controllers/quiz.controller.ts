import { Request, Response } from 'express';
import { quizService } from '../services/quiz.servies';
import { CreateQuizDto } from '../dtos/create-quiz.dto';
import { UpdateQuizDto } from '../dtos/update-quiz.dto';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Controller xử lý các request liên quan đến quiz
 */
class QuizController {
  /**
   * Tạo quiz mới
   */
  async createQuiz(req: AuthRequest, res: Response) {
    try {
      // Kiểm tra người dùng đã đăng nhập
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để thực hiện hành động này'
        });
        return;
      }
      
      // Dữ liệu đã được validate bởi middleware
      const validData = req.body as CreateQuizDto;
      
      // Gọi service để tạo quiz
      const quiz = await quizService.createQuiz(validData, req.user.id);
      
      res.status(201).json({
        success: true,
        message: 'Đã tạo bài quiz mới thành công',
        data: quiz
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi tạo quiz',
        errors: error.errors
      });
    }
  }

  /**
   * Lấy danh sách quiz của người dùng hiện tại
   */
  async getMyQuizzes(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để thực hiện hành động này'
        });
        return;
      }
      
      const quizzes = await quizService.getQuizzesByUser(req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'Lấy danh sách quiz thành công',
        data: quizzes
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi lấy danh sách quiz'
      });
    }
  }

  /**
   * Lấy chi tiết quiz theo ID
   */
  async getQuizById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const quiz = await quizService.getQuizById(id);
      
      res.status(200).json({
        success: true,
        message: 'Lấy thông tin quiz thành công',
        data: quiz
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi lấy thông tin quiz'
      });
    }
  }
  
  /**
   * Lấy quiz theo mã tham gia
   */
  async getQuizByCode(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const quiz = await quizService.getQuizByCode(code);
      
      res.status(200).json({
        success: true,
        message: 'Tìm thấy phòng',
        data: quiz
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi tìm phòng'
      });
    }
  }

  /**
   * Cập nhật thông tin quiz
   */
  async updateQuiz(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để thực hiện hành động này'
        });
        return;
      }
      
      const { id } = req.params;
      // Dữ liệu đã được validate bởi middleware
      const validData = req.body as UpdateQuizDto;
      
      const updatedQuiz = await quizService.updateQuiz(id, validData, req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'Cập nhật quiz thành công',
        data: updatedQuiz
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi cập nhật quiz'
      });
    }
  }

  /**
   * Xóa quiz
   */
  async deleteQuiz(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để thực hiện hành động này'
        });
        return;
      }
      
      const { id } = req.params;
      await quizService.deleteQuiz(id, req.user.id);
      
      res.status(200).json({
        success: true,
        message: 'Xóa quiz thành công'
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi xóa quiz'
      });
    }
  }

  /**
   * Tham gia vào phòng quiz bằng mã code
   */
  async joinQuiz(req: AuthRequest, res: Response) {
    try {
      const { code, displayName } = req.body;
      
      // Lấy userId nếu người dùng đã đăng nhập
      const userId = req.user?.id;
      
      // Nếu người dùng không đăng nhập, yêu cầu displayName
      if (!userId && !displayName) {
        return res.status(400).json({
          success: false,
          message: 'Bạn cần cung cấp tên hiển thị để tham gia'
        });
      }
      
      const result = await quizService.joinQuiz(code, userId, displayName);
      
      res.status(200).json({
        success: true,
        message: 'Tham gia phòng quiz thành công',
        data: result
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Đã xảy ra lỗi khi tham gia phòng quiz'
      });
    }
  }
}

export const quizController = new QuizController();