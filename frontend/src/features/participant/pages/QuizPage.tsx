import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { QuizPlayer } from '../components/QuizPlayer';
import { useParticipant } from '../contexts/ParticipantContext';
import type { Question } from '../components/QuestionTypes';
import { QuestionType } from '../components/QuestionTypes';
import { Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BACKEND || 'http://localhost:3001/api';

// Tạo các component UI cơ bản
const Card: React.FC<{children: React.ReactNode, className?: string}> = ({children, className}) => {
  return <div className={`border rounded-lg shadow-sm ${className || ''}`}>{children}</div>;
};

const CardHeader: React.FC<{children: React.ReactNode, className?: string}> = ({children, className}) => {
  return <div className={`p-4 border-b ${className || ''}`}>{children}</div>;
};

const CardTitle: React.FC<{children: React.ReactNode, className?: string}> = ({children, className}) => {
  return <h3 className={`text-lg font-semibold ${className || ''}`}>{children}</h3>;
};

const CardDescription: React.FC<{children: React.ReactNode, className?: string}> = ({children, className}) => {
  return <p className={`text-sm text-gray-500 ${className || ''}`}>{children}</p>;
};

const CardContent: React.FC<{children: React.ReactNode, className?: string}> = ({children, className}) => {
  return <div className={`p-4 ${className || ''}`}>{children}</div>;
};

const CardFooter: React.FC<{children: React.ReactNode, className?: string}> = ({children, className}) => {
  return <div className={`p-4 border-t ${className || ''}`}>{children}</div>;
};

const Button: React.FC<{
  children: React.ReactNode, 
  onClick?: () => void, 
  disabled?: boolean,
  className?: string
}> = ({children, onClick, disabled, className}) => {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`px-4 py-2 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}
    >
      {children}
    </button>
  );
};

const Input: React.FC<{
  id: string,
  placeholder?: string,
  value: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  disabled?: boolean,
  className?: string
}> = ({id, placeholder, value, onChange, disabled, className}) => {
  return (
    <input 
      id={id}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md ${className || ''}`}
    />
  );
};

const Alert: React.FC<{
  children: React.ReactNode,
  variant?: 'default' | 'destructive',
  className?: string
}> = ({children, variant = 'default', className}) => {
  const variantClasses = {
    default: 'bg-blue-50 border-blue-200 text-blue-800',
    destructive: 'bg-red-50 border-red-200 text-red-800'
  };
  
  return (
    <div className={`border rounded-md p-4 ${variantClasses[variant]} ${className || ''}`}>
      {children}
    </div>
  );
};

const AlertTitle: React.FC<{children: React.ReactNode, className?: string}> = ({children, className}) => {
  return <h5 className={`font-medium mb-1 ${className || ''}`}>{children}</h5>;
};

const AlertDescription: React.FC<{children: React.ReactNode, className?: string}> = ({children, className}) => {
  return <div className={`text-sm ${className || ''}`}>{children}</div>;
};

// Định nghĩa các interface để tránh sử dụng any
interface QuestionApiData {
  id: string;
  content: string;
  type: string;
  timeLimit?: number;
  points: number;
  difficulty: string;
  order: number;
  imageUrl?: string;
  videoUrl?: string;
  options: OptionApiData[];
}

interface OptionApiData {
  id: string;
  content: string;
  order: number;
  imageUrl?: string;
  matchingText?: string;
}

interface ApiErrorResponse extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function QuizPage() {
  const { quizCode } = useParams<{ quizCode: string }>();
  
  const {
    participantId,
    sessionId,
    questions,
    setParticipantId,
    setSessionId,
    setQuestions,
    resetQuizState
  } = useParticipant();
  
  const [displayName, setDisplayName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Memoize loadQuestions để tránh re-render không cần thiết
  const loadQuestions = useCallback(async () => {
    try {
      // Gọi API lấy danh sách câu hỏi của phiên quiz
      const response = await axios.get(`${API_URL}/quizzes/sessions/${sessionId}/questions`);
      const questionData: QuestionApiData[] = response.data.data;
      
      // Chuyển đổi dữ liệu từ API sang định dạng Question
      const formattedQuestions: Question[] = questionData.map((q: QuestionApiData) => ({
        id: q.id,
        content: q.content,
        type: q.type as QuestionType,
        timeLimit: q.timeLimit,
        points: q.points,
        difficulty: q.difficulty,
        order: q.order,
        imageUrl: q.imageUrl,
        videoUrl: q.videoUrl,
        options: q.options.map((opt: OptionApiData) => ({
          id: opt.id,
          content: opt.content,
          order: opt.order,
          imageUrl: opt.imageUrl,
          matchingText: opt.matchingText
        }))
      }));
      
      // Sắp xếp câu hỏi theo thứ tự
      formattedQuestions.sort((a, b) => a.order - b.order);
      
      setQuestions(formattedQuestions);
    } catch (error) {
      console.error('Lỗi khi tải câu hỏi:', error);
      setError('Không thể tải câu hỏi. Vui lòng thử lại sau.');
    }
  }, [sessionId, setQuestions, setError]);
  
  // Kiểm tra trạng thái hiện tại và tải dữ liệu nếu cần
  useEffect(() => {
    const checkSession = async () => {
      // Nếu đã có sessionId và participantId, kiểm tra trạng thái hiện tại
      if (sessionId && participantId) {
        try {
          // Kiểm tra xem phiên có tồn tại không
          await axios.get(`${API_URL}/quizzes/sessions/${sessionId}`);
          
          // Tải câu hỏi nếu chưa có
          if (questions.length === 0) {
            await loadQuestions();
          }
          
          setIsLoading(false);
        } catch (error) {
          console.error('Lỗi khi kiểm tra phiên:', error);
          // Phiên không tồn tại hoặc đã kết thúc, reset trạng thái
          resetQuizState();
          setIsLoading(false);
        }
      } else {
        // Chưa có thông tin phiên, chuyển sang màn hình tham gia
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, [sessionId, participantId, questions.length, resetQuizState, loadQuestions]);
  
  // Hàm tham gia phiên quiz
  const handleJoinQuiz = async () => {
    if (!quizCode) return;
    
    setIsJoining(true);
    setError(null);
    
    try {
      // Gọi API tham gia quiz
      const response = await axios.post(`${API_URL}/quizzes/join`, {
        code: quizCode,
        displayName
      });
      
      const data = response.data.data;
      
      // Lưu thông tin phiên và người tham gia
      setSessionId(data.session.id);
      setParticipantId(data.participant.id);
      
      // Tải danh sách câu hỏi
      await loadQuestions();
    } catch (error) {
      console.error('Lỗi khi tham gia quiz:', error);
      const apiError = error as ApiErrorResponse;
      setError(apiError.response?.data?.message || 'Không thể tham gia quiz. Vui lòng thử lại sau.');
    } finally {
      setIsJoining(false);
    }
  };
  
  // Xử lý khi hoàn thành quiz
  const handleQuizComplete = (score: number, totalPoints: number) => {
    // Có thể lưu kết quả hoặc hiển thị màn hình kết quả
    console.log(`Quiz completed! Score: ${score}/${totalPoints}`);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-blue-600 font-medium">Đang tải...</span>
      </div>
    );
  }
  
  // Hiển thị màn hình tham gia nếu chưa có phiên
  if (!sessionId || !participantId) {
    return (
      <div className="container max-w-lg mx-auto p-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Tham gia Quiz</CardTitle>
            <CardDescription className="text-center">
              Nhập tên hiển thị của bạn để tham gia quiz với mã: <span className="font-bold">{quizCode}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="displayName" className="block text-sm font-medium">
                  Tên hiển thị
                </label>
                <Input
                  id="displayName"
                  placeholder="Nhập tên của bạn"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isJoining}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={handleJoinQuiz}
              disabled={!displayName || isJoining}
            >
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tham gia...
                </>
              ) : (
                'Tham gia Quiz'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Hiển thị màn hình quiz khi đã có phiên và câu hỏi
  return (
    <div className="container mx-auto p-4">
      {questions.length > 0 ? (
        <QuizPlayer
          questions={questions}
          sessionId={sessionId}
          participantId={participantId}
          onComplete={handleQuizComplete}
        />
      ) : (
        <div className="text-center p-8">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-lg">Đang tải câu hỏi...</p>
        </div>
      )}
    </div>
  );
} 