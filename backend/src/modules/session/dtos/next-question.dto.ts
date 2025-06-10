import { z } from 'zod';

export const nextQuestionSchema = z.object({
  sessionId: z.string().uuid('ID phiên thi không hợp lệ').optional()
}); 