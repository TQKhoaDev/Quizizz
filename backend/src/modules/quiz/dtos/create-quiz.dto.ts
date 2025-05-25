import { z } from "zod";

// Định nghĩa schema validation cho DTO tạo quiz
export const createQuizSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional(),
  duration: z.number().int().positive("Thời gian phải là số dương").default(30),
  code: z.string().optional(), // Nếu không cung cấp, service sẽ tự động tạo
  isPublic: z.boolean().default(false),
});

// Export type từ schema
export type CreateQuizDto = z.infer<typeof createQuizSchema>;