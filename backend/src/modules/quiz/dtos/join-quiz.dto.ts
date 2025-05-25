import { z } from 'zod';

// Schema Zod để validate dữ liệu tham gia quiz
export const JoinQuizSchema = z.object({
  // Mã code để tham gia quiz
  code: z.string().min(4).max(10),
  
  // Tên người tham gia (có thể là tên hiển thị nếu không đăng nhập)
  displayName: z.string().min(3).max(50).optional(),
});

// Kiểu dữ liệu TypeScript từ schema
export type JoinQuizDto = z.infer<typeof JoinQuizSchema>;
