import { z } from 'zod';

export const createSessionSchema = z.object({
  quizId: z.string().uuid('ID quiz không hợp lệ')
});

export type CreateSessionDto = z.infer<typeof createSessionSchema>; 