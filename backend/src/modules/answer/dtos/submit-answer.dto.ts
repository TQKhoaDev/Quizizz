    import { z } from 'zod';

    export const submitAnswerSchema = z.object({
        questionId: z.string({ required_error: 'ID câu hỏi không hợp lệ' })
        .nonempty('ID câu hỏi không được để trống'),
      optionId: z.string({ required_error: 'ID đáp án không hợp lệ' })
        .nonempty('ID đáp án không được để trống'),
      sessionId: z.string({ required_error: 'ID phiên quiz không hợp lệ' })
        .nonempty('ID phiên quiz không được để trống'),
      responseTime: z.number()
        .int('Thời gian trả lời phải là số nguyên')
        .positive('Thời gian trả lời phải là số dương'),
      participantId: z.string({ required_error: 'ID người tham gia không hợp lệ' })
        .nonempty('ID người tham gia không được để trống')
        .optional(),    
    });

    export type SubmitAnswerDto = z.infer<typeof submitAnswerSchema>; 