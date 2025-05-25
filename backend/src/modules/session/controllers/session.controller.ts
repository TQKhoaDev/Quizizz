import { Request, Response } from 'express';
import { sessionService } from '../services/session.service';

/**
 * Controller xử lý các yêu cầu liên quan đến phiên quiz
 */
class SessionController {
  /**
   * Tạo phiên quiz mới
   */
  async createSession(req: Request, res: Response) {
    const { quizId } = req.body;
    const userId = req.user!.id;
    
    const session = await sessionService.createSession(quizId, userId);
    
    res.status(201).json({
      success: true,
      data: session
    });
  }
  
  /**
   * Lấy danh sách phiên quiz của người dùng hiện tại
   */
  async getMySessions(req: Request, res: Response) {
    const userId = req.user!.id;
    
    const sessions = await sessionService.getSessionsByProctor(userId);
    
    res.status(200).json({
      success: true,
      data: sessions
    });
  }
  
  /**
   * Lấy thông tin chi tiết phiên quiz
   */
  async getSessionById(req: Request, res: Response) {
    const { sessionId } = req.params;
    const userId = req.user!.id;
    
    const session = await sessionService.getSessionById(sessionId, userId);
    
    res.status(200).json({
      success: true,
      data: session
    });
  }
  
  /**
   * Bắt đầu phiên quiz
   */
  async startSession(req: Request, res: Response) {
    const { sessionId } = req.params;
    const userId = req.user!.id;
    
    const session = await sessionService.startSession(sessionId, userId);
    
    res.status(200).json({
      success: true,
      data: session
    });
  }
  
  /**
   * Kết thúc phiên quiz
   */
  async endSession(req: Request, res: Response) {
    const { sessionId } = req.params;
    const userId = req.user!.id;
    
    const session = await sessionService.endSession(sessionId, userId);
    
    res.status(200).json({
      success: true,
      data: session
    });
  }
  
  /**
   * Hủy phiên quiz
   */
  async cancelSession(req: Request, res: Response) {
    const { sessionId } = req.params;
    const userId = req.user!.id;
    
    const session = await sessionService.cancelSession(sessionId, userId);
    
    res.status(200).json({
      success: true,
      data: session
    });
  }
}

export const sessionController = new SessionController(); 