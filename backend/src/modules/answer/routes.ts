import { Router } from 'express';
import { answerController } from './controllers/answer.controller';
import { validate } from '../../shared/middleware/zod-validate';
import { submitAnswerSchema } from './dtos/submit-answer.dto';
import { controllerWrapper } from '../../shared/utils/controller-wrapper';
import { requireAuth, requireAuthOrParticipant } from '../../middlewares/auth-middleware';

const router = Router();

/**
 * @route POST /api/answers
 * @desc Gửi câu trả lời và tính điểm
 * @access Public (có thể dùng token hoặc không)
 */
router.post('/', requireAuthOrParticipant, validate(submitAnswerSchema), controllerWrapper(answerController.submitAnswer.bind(answerController)));

/**
 * @route GET /api/answers/participants/:participantId/results
 * @desc Lấy kết quả của người tham gia
 * @access Public
 */
router.get('/participants/:participantId/results', controllerWrapper(answerController.getParticipantResults.bind(answerController)));

export default router; 