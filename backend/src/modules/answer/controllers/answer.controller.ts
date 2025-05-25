import { Request, Response } from 'express';
import { answerService } from '../services/answer.service';
import { SubmitAnswerDto } from '../dtos/submit-answer.dto';

/**
 * Controller xử lý các yêu cầu liên quan đến câu trả lời và kết quả
 */
class AnswerController {
  /**
   * Gửi câu trả lời và tính điểm
   */
  async submitAnswer(req: Request, res: Response) {
    const { questionId, optionId, sessionId, responseTime } = req.body as SubmitAnswerDto;
    
    // Nếu người dùng đã đăng nhập, lấy userId từ token
    // Nếu là khách, lấy participantId từ request body
    const participantId = req.user?.id || req.body.participantId;
    
    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin người tham gia'
      });
    }
    
    const result = await answerService.submitAnswer(
      participantId,
      questionId,
      optionId,
      sessionId,
      responseTime
    );
    
    res.status(200).json({
      success: true,
      data: result
    });
  }
  
  /**
   * Lấy kết quả của người tham gia
   */
  async getParticipantResults(req: Request, res: Response) {
    const { participantId } = req.params;
    
    const results = await answerService.getParticipantResults(participantId);
    
    res.status(200).json({
      success: true,
      data: results
    });
  }
}

export const answerController = new AnswerController(); 