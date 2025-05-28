import React, { useState, useEffect, useCallback } from 'react';
import type { Question } from './QuestionTypes';
import { QuestionController } from './QuestionController';
import { Timer, Award } from 'lucide-react';

// Tạo các component UI cơ bản để thay thế
const Progress: React.FC<{ value: number, className?: string }> = ({ value, className }) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className || ''}`}>
      <div 
        className="bg-blue-600 h-2.5 rounded-full" 
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} 
      />
    </div>
  );
};

const Badge: React.FC<{ 
  children: React.ReactNode, 
  variant?: 'default' | 'outline', 
  className?: string 
}> = ({ children, variant = 'default', className }) => {
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    outline: 'bg-transparent border border-gray-300 text-gray-700'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className || ''}`}>
      {children}
    </span>
  );
};

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({children, className}) => {
  return <div className={`border rounded-lg shadow-sm ${className || ''}`}>{children}</div>;
};

const CardContent: React.FC<{children: React.ReactNode, className?: string}> = ({children, className}) => {
  return <div className={`p-4 ${className || ''}`}>{children}</div>;
};

const Button: React.FC<{
  children: React.ReactNode, 
  onClick: () => void, 
  variant?: 'default' | 'outline',
  disabled?: boolean,
  className?: string
}> = ({children, onClick, variant = 'default', disabled, className}) => {
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50'
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`px-4 py-2 rounded-md font-medium ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}
    >
      {children}
    </button>
  );
};

interface QuizPlayerProps {
  questions: Question[];
  sessionId: string;
  participantId?: string;
  onComplete: (score: number, totalPoints: number) => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  questions,
  sessionId,
  participantId,
  onComplete
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  
  // Memoize handleNextQuestion để tránh re-render không cần thiết
  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Hoàn thành quiz
      const totalPoints = questions.reduce((total, q) => total + q.points, 0);
      setQuizCompleted(true);
      onComplete(score, totalPoints);
    }
  }, [currentQuestionIndex, questions, score, onComplete]);
  
  // Khởi tạo bộ đếm thời gian cho câu hỏi
  useEffect(() => {
    if (!currentQuestion) return;
    
    const timeLimit = currentQuestion.timeLimit || 30; // Mặc định 30 giây
    setRemainingTime(timeLimit);
    
    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentQuestion]);
  
  // Kiểm tra thời gian hết và tự động chuyển câu hỏi
  useEffect(() => {
    if (remainingTime === 0) {
      // Tự động chuyển câu hỏi khi hết thời gian
      handleNextQuestion();
    }
  }, [remainingTime, handleNextQuestion]);

  const handleAnswerSubmitted = (isCorrect: boolean, points: number) => {
    if (isCorrect) {
      setScore((prev) => prev + points);
    }
    setAnsweredQuestions((prev) => prev + 1);
  };

  if (!currentQuestion) {
    return <div>Không có câu hỏi nào.</div>;
  }

  if (quizCompleted) {
    return (
      <Card className="w-full max-w-3xl mx-auto mt-8">
        <CardContent className="p-8 text-center">
          <Award className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Quiz hoàn thành!</h2>
          <p className="text-gray-600 mb-4">
            Bạn đã trả lời {answeredQuestions} trên {questions.length} câu hỏi.
          </p>
          <div className="mb-6">
            <p className="text-xl font-semibold">
              Điểm số của bạn: {score}/{questions.reduce((total, q) => total + q.points, 0)}
            </p>
            <Progress 
              value={(score / questions.reduce((total, q) => total + q.points, 0)) * 100} 
              className="h-3 mt-2"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <Badge variant="outline" className="mb-2">
            Câu hỏi {currentQuestionIndex + 1}/{questions.length}
          </Badge>
          <h2 className="text-xl font-bold">
            Điểm: {score}
          </h2>
        </div>
        
        <div className="flex items-center">
          <Timer className="mr-2 h-5 w-5 text-orange-500" />
          <span className="font-medium">
            Thời gian còn lại: {remainingTime} giây
          </span>
        </div>
      </div>
      
      <Progress 
        value={((currentQuestionIndex + 1) / questions.length) * 100} 
        className="h-2 mb-6"
      />
      
      <QuestionController
        question={currentQuestion}
        sessionId={sessionId}
        participantId={participantId}
        onAnswerSubmitted={handleAnswerSubmitted}
      />
      
      <div className="flex justify-end mt-4">
        <Button 
          onClick={handleNextQuestion}
          variant="outline"
        >
          {currentQuestionIndex < questions.length - 1 ? 'Câu hỏi tiếp theo' : 'Hoàn thành quiz'}
        </Button>
      </div>
    </div>
  );
}; 