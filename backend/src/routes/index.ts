import { Router } from 'express';
import authRoutes from './auth-routes';
import quizModule from '../modules/quiz/quiz.module';
import sessionModule from '../modules/session/session.module';
import answerModule from '../modules/answer/answer.module';

const router = Router();

// Đăng ký các routes
router.use('/auth', authRoutes);
router.use('/quizzes', quizModule.router);
router.use('/sessions', sessionModule.router);
router.use('/answers', answerModule.router);

export default router;
