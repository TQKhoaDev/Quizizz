import { z } from "zod";
import { createQuizSchema } from "./create-quiz.dto";

// Định nghĩa schema validation cho DTO cập nhật quiz
export const updateQuizSchema = createQuizSchema.partial();

// Export type từ schema
export type UpdateQuizDto = z.infer<typeof updateQuizSchema>;