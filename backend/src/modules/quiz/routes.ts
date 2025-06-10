import { Router } from 'express';
import { quizController } from './controllers/quiz.controller';
import { requireAuth } from '../../middlewares/auth-middleware';
import { validate } from '../../shared/middleware/zod-validate';
import { createQuizSchema } from './dtos/create-quiz.dto';
import { updateQuizSchema } from './dtos/update-quiz.dto';
import { controllerWrapper } from '../../shared/utils/controller-wrapper';
import { JoinQuizSchema } from './dtos/join-quiz.dto';

const router = Router();

/**
 * @route POST /api/quizzes/join
 * @desc Tham gia vào phòng quiz bằng mã code
 * @access Public
 */
router.post('/join', validate(JoinQuizSchema), controllerWrapper(quizController.joinQuiz.bind(quizController)));

/**
 * @route GET /api/quizzes
 * @desc Lấy danh sách quiz của người dùng hiện tại
 * @access Private
 */
router.get('/', requireAuth, controllerWrapper(quizController.getMyQuizzes.bind(quizController)));

/**
 * @route GET /api/quizzes/code/:code
 * @desc Lấy quiz theo mã tham gia
 * @access Public
 */
router.get('/code/:code', controllerWrapper(quizController.getQuizByCode.bind(quizController)));

/**
 * @route GET /api/quizzes/:id
 * @desc Lấy chi tiết một quiz theo ID
 * @access Public
 */
router.get('/:id', controllerWrapper(quizController.getQuizById.bind(quizController)));

/**
 * @route POST /api/quizzes
 * @desc Tạo một bài quiz mới
 * @access Private
 */
router.post('/', requireAuth, validate(createQuizSchema), controllerWrapper(quizController.createQuiz.bind(quizController)));

/**
 * @route PUT /api/quizzes/:id
 * @desc Cập nhật thông tin quiz
 * @access Private
 */
router.put('/:id', requireAuth, validate(updateQuizSchema), controllerWrapper(quizController.updateQuiz.bind(quizController)));

/**
 * @route DELETE /api/quizzes/:id
 * @desc Xóa quiz
 * @access Private
 */
router.delete('/:id', requireAuth, controllerWrapper(quizController.deleteQuiz.bind(quizController)));

export default router;