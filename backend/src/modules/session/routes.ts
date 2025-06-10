import { Router } from 'express';
import { sessionController } from './controllers/session.controller';
import { requireAuth } from '../../middlewares/auth-middleware';
import { validate } from '../../shared/middleware/zod-validate';
import { createSessionSchema } from './dtos/create-session.dto';
import { controllerWrapper } from '../../shared/utils/controller-wrapper';
import { nextQuestionSchema } from './dtos/next-question.dto';
import { param } from 'express-validator';

const router = Router();

/**
 * @route POST /api/sessions
 * @desc Tạo phiên quiz mới
 * @access Private
 */
router.post('/', requireAuth, validate(createSessionSchema), controllerWrapper(sessionController.createSession.bind(sessionController)));

/**
 * @route GET /api/sessions
 * @desc Lấy danh sách phiên quiz của người dùng hiện tại
 * @access Private
 */
router.get('/', requireAuth, controllerWrapper(sessionController.getMySessions.bind(sessionController)));

/**
 * @route GET /api/sessions/:sessionId
 * @desc Lấy thông tin chi tiết phiên quiz
 * @access Private
 */
router.get('/:sessionId', requireAuth, controllerWrapper(sessionController.getSessionById.bind(sessionController)));

/**
 * @route PUT /api/sessions/:sessionId/start
 * @desc Bắt đầu phiên quiz
 * @access Private
 */
router.put('/:sessionId/start', requireAuth, controllerWrapper(sessionController.startSession.bind(sessionController)));

/**
 * @route PUT /api/sessions/:sessionId/end
 * @desc Kết thúc phiên quiz
 * @access Private
 */
router.put('/:sessionId/end', requireAuth, controllerWrapper(sessionController.endSession.bind(sessionController)));

/**
 * @route PUT /api/sessions/:sessionId/cancel
 * @desc Hủy phiên quiz
 * @access Private
 */
router.put('/:sessionId/cancel', requireAuth, controllerWrapper(sessionController.cancelSession.bind(sessionController)));

/**
 * @route POST /api/sessions/:sessionId/next-question
 * @desc Chuyển sang câu hỏi tiếp theo
 * @access Private
 */
router.post('/:sessionId/next-question', 
  requireAuth,
  param('sessionId').isUUID(),
  controllerWrapper(sessionController.nextQuestion.bind(sessionController))
);

/**
 * @route GET /api/sessions/:sessionId/question-history
 * @desc Lấy thông tin câu hỏi đã qua
 * @access Private
 */
router.get('/:sessionId/question-history',
  requireAuth,
  param('sessionId').isUUID(),
  controllerWrapper(sessionController.getQuestionHistory.bind(sessionController))
);

export default router; 