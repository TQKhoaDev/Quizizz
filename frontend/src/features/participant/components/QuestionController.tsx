import React, { useState } from 'react';
import { MCQQuestion, TrueFalseQuestion, MultipleSelectQuestion, QuestionType } from './QuestionTypes';
import type { Question } from './QuestionTypes';
import { participantApi } from '../api/participantApi';
import { Loader2 } from 'lucide-react';

interface ToastOptions {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
}

// Hàm toast tạm thời để thay thế cho useToast
const toast = (options: ToastOptions) => {
  console.log(`Toast: ${options.title} - ${options.description}`);
  // Trong trường hợp thực tế, bạn sẽ sử dụng một thư viện toast thực sự
  alert(`${options.title}\n${options.description}`);
};

interface QuestionControllerProps {
  question: Question;
  sessionId: string;
  participantId?: string;
  onAnswerSubmitted: (isCorrect: boolean, points: number) => void;
}

export const QuestionController: React.FC<QuestionControllerProps> = ({
  question,
  sessionId,
  participantId,
  onAnswerSubmitted
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [startTime] = useState(Date.now());

  const handleSubmit = async (optionIds: string[], responseTime: number) => {
    setIsSubmitting(true);
    try {
      // Chỉ lấy optionId đầu tiên cho câu hỏi MCQ và TRUE_FALSE
      const optionId = optionIds[0];
      
      const result = await participantApi.submitAnswer({
        questionId: question.id,
        optionId,
        sessionId,
        responseTime,
        participantId
      });

      setHasSubmitted(true);
      onAnswerSubmitted(result.isCorrect, result.points);
      
      toast({
        title: result.isCorrect ? "Chính xác!" : "Chưa chính xác!",
        description: `Bạn ${result.isCorrect ? "đã" : "chưa"} trả lời đúng và nhận được ${result.points} điểm.`,
        variant: result.isCorrect ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Lỗi khi gửi câu trả lời:', error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi câu trả lời, vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hiển thị loại câu hỏi tương ứng
  const renderQuestion = () => {
    const commonProps = {
      question,
      onSubmit: handleSubmit,
      isDisabled: isSubmitting || hasSubmitted,
      startTime
    };

    switch (question.type) {
      case QuestionType.MCQ:
        return <MCQQuestion {...commonProps} />;
      case QuestionType.TRUE_FALSE:
        return <TrueFalseQuestion {...commonProps} />;
      case QuestionType.MULTIPLE_SELECT:
        return <MultipleSelectQuestion {...commonProps} />;
      default:
        return <div>Loại câu hỏi không được hỗ trợ</div>;
    }
  };

  return (
    <div className="relative">
      {isSubmitting && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-blue-600 font-medium">Đang gửi câu trả lời...</span>
        </div>
      )}
      {renderQuestion()}
    </div>
  );
}; 