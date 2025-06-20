import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { quizApi } from '@/features/Quiz/api/quizApi';
import type { JoinQuizResponse } from '@/features/Quiz/api/quizApi';


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

interface ApiErrorResponse extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function QuizPage() {
  const { quizCode } = useParams<{ quizCode: string }>();
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Hàm tham gia phiên quiz
  const handleJoinQuiz = async () => {
    if (!quizCode || !displayName.trim()) return;
    
    setIsJoining(true);
    setError(null);
    
    try {
      console.log(quizCode, displayName)
      // Gọi API tham gia quiz
      const response: JoinQuizResponse = await quizApi.joinQuiz({
        code: quizCode,
        displayName: displayName
      });
      console.log("Response:", response);
      
      // Lấy mã quiz và mã phiên từ response
      const sessionIdFromResponse = response.session.id;
      const quizIdFromResponse = response.quiz.id;
      
      // Debug logging để kiểm tra values
      console.log("🔍 [JOIN] Debug values:", {
        sessionIdFromResponse,
        quizIdFromResponse,
        hasQuizId: !!quizIdFromResponse,
        quizObject: response.quiz
      });
      
      // Lưu token vào localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);
        console.log("Lưu token:", response.token);
      }

      // Lưu participantId vào localStorage để sử dụng sau này
      if (response.participant && response.participant.id) {
        console.log("Lưu participantId:", response.participant.id);
        localStorage.setItem(`participant_${sessionIdFromResponse}`, response.participant.id);
      }

      // Lưu thông tin session đầy đủ vào localStorage
      if (response.session) {
        console.log("Lưu thông tin session đầy đủ:", response.session);
        // Lưu cả session và quiz info để có quiz.code
        const sessionWithQuiz = {
          ...response.session,
          quiz: response.quiz // Thêm quiz info để có quiz.code
        };
        localStorage.setItem(`session_info_${sessionIdFromResponse}`, JSON.stringify(sessionWithQuiz));
        
        // Đặc biệt in ra session.id và quiz.code để debug
        if (response.session.id) {
          console.log("Session ID đầy đủ:", response.session.id);
        }
        if (response.quiz.code) {
          console.log("Quiz code đầy đủ:", response.quiz.code);
        }
      }
      
      if(response.session.status === 'PENDING'){
        // Chuyển hướng đến trang chờ với quizId
        const waitingURL = `/quiz/waiting/${sessionIdFromResponse}?quizId=${quizIdFromResponse}`;
        console.log("🔗 [JOIN] Navigating to waiting:", waitingURL);
        navigate(waitingURL);
      } else {
        // Chuyển hướng đến trang chơi quiz với sessionId và quizId
        const playURL = `/quiz/play/${sessionIdFromResponse}?quizId=${quizIdFromResponse}`;
        console.log("🔗 [JOIN] Navigating to play:", playURL);
        navigate(playURL);
      }
    } catch (error) {
      console.error('Lỗi khi tham gia quiz:', error);
      const apiError = error as ApiErrorResponse;
      setError(apiError.response?.data?.message || 'Không thể tham gia quiz. Vui lòng thử lại sau.');
    } finally {
      setIsJoining(false);
    }
  };
  
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