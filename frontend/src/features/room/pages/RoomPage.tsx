import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import QuestionScreen from '../components/QuestionScreen';
import type { Question } from '../../question/api/questionApi';
import type { QuizDetail } from '../../Quiz/api/quizApi';
import { quizApi } from '../../Quiz/api/quizApi';
import { participantApi } from '../../participant/api/participantApi';
import type { SubmitAnswerData } from '../../participant/api/participantApi';

const RoomPage: React.FC = () => {
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const quizId = queryParams.get('quizId');
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  // Chuyển sang câu hỏi tiếp theo
  const handleNextQuestion = useCallback(() => {
    if (!quiz) return;
    
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    
    // Cập nhật thời gian cho câu hỏi mới
    const nextQuestion = quiz.questions[nextIndex];
    setTimeLeft(nextQuestion.timeLimit || quiz.timeLimit || 30);
    // Reset thời gian bắt đầu cho câu hỏi mới
    setStartTime(Date.now());
  }, [quiz, currentQuestionIndex]);

  // Kết thúc bài làm
  const handleFinish = useCallback(async () => {
    if (!sessionCode) return;
    
    try {
      // Gọi API để kết thúc bài làm
      console.log("Đang kết thúc bài làm với sessionCode:", sessionCode);
      
      // Lưu kết quả vào localStorage (dự phòng)
      localStorage.setItem(`quiz_${quizId}_answers`, JSON.stringify(answers));
      localStorage.setItem(`session_${sessionCode}`, quizId || '');
      
      // Lưu participantId nếu chưa có
      if (participantId && !participantId) {
        localStorage.setItem(`participant_${sessionCode}`, participantId);
      }
      
      // Chuyển hướng đến trang kết quả với sessionCode để có thể lấy kết quả từ API
      navigate(`/answers/participants/${participantId}/results?sessionCode=${sessionCode}`);
    } catch (error) {
      console.error('Lỗi khi kết thúc bài làm:', error);
      // Vẫn chuyển trang kết quả dù có lỗi
      navigate(`/result/${quizId}?sessionCode=${sessionCode}`);
    }
  }, [sessionCode, quizId, answers, participantId, navigate]);

  // Lấy thông tin quiz
  useEffect(() => {
    console.log("SessionCode từ params:", sessionCode);
    console.log("quizId từ query:", quizId);
    
    const fetchQuiz = async () => {
      if (!sessionCode) {
        setError("Không tìm thấy mã phiên");
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const fetchedQuiz = await quizApi.getQuizById(quizId || '');
        console.log("Quiz đã tải:", fetchedQuiz);
        setQuiz(fetchedQuiz);
        
        // Lấy participantId từ localStorage (đã được lưu khi tham gia quiz)
        const storedParticipantId = localStorage.getItem(`participant_${sessionCode}`);
        console.log("Đã lấy được participantId từ localStorage:", storedParticipantId);
        
        if (storedParticipantId) {
          setParticipantId(storedParticipantId);
        } else {
          console.warn("Không tìm thấy participantId trong localStorage");
        }
        
        // Kiểm tra và log thông tin session đã lưu
        const sessionInfo = localStorage.getItem(`session_info_${sessionCode}`);
        if (sessionInfo) {
          try {
            const parsedSession = JSON.parse(sessionInfo);
            console.log("Thông tin session đầy đủ:", parsedSession);
          } catch (e) {
            console.warn("Không thể parse session info:", e);
          }
        } else {
          console.log("Không tìm thấy thông tin session đầy đủ trong localStorage");
        }
        
        // Khởi tạo thời gian cho câu hỏi đầu tiên
        if (fetchedQuiz.questions.length > 0) {
          const firstQuestion = fetchedQuiz.questions[0];
          setTimeLeft(firstQuestion.timeLimit || fetchedQuiz.timeLimit || 30);
          // Ghi lại thời điểm bắt đầu
          setStartTime(Date.now());
        }
      } catch (err) {
        console.error('Lỗi khi lấy thông tin quiz:', err);
        setError('Không thể tải quiz. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [sessionCode, quizId]);

  // Đếm ngược thời gian
  useEffect(() => {
    if (timeLeft <= 0 || !quiz) return;

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerId);
          // Tự động chuyển câu hỏi khi hết giờ
          if (currentQuestionIndex < quiz.questions.length - 1) {
            handleNextQuestion();
          } else {
            handleFinish();
          }
          return 0;
        } 
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, currentQuestionIndex, quiz, handleFinish, handleNextQuestion]);

  // Xử lý khi người dùng trả lời câu hỏi
  const handleAnswer = async (optionId: string) => {
    if (!quiz || !sessionCode) return;
    
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const responseTime = Math.round((Date.now() - startTime) / 1000); // Thời gian phản hồi tính bằng giây
    
    try {
      // Lấy sessionId đầy đủ từ localStorage nếu có
      let fullSessionId = sessionCode;
      
      const sessionInfo = localStorage.getItem(`session_info_${sessionCode}`);
      if (sessionInfo) {
        try {
          const parsedSession = JSON.parse(sessionInfo);
          if (parsedSession && parsedSession.id) {
            console.log(`Đang sử dụng session.id đầy đủ (${parsedSession.id}) thay vì code ngắn (${sessionCode})`);
            fullSessionId = parsedSession.id;
          }
        } catch (e) {
          console.warn("Không thể parse session info:", e);
        }
      }
      
      // Chuẩn bị dữ liệu để gửi câu trả lời theo định dạng API yêu cầu
      const answerData: SubmitAnswerData = {
        questionId: currentQuestion.id,
        sessionId: fullSessionId, // Sử dụng session ID đầy đủ
        responseTime,
        optionId: optionId
      };
      
      // Thêm participantId nếu có giá trị
      if (participantId) {
        answerData.participantId = participantId;
        console.log("Đã thêm participantId vào request:", participantId);
      } else {
        console.warn("Không có participantId khi gửi câu trả lời");
      }
      
      console.log("Dữ liệu gửi đi:", answerData);
      
      // Gửi câu trả lời lên server
      const response = await participantApi.submitAnswer(answerData);
      
      console.log('Kết quả câu trả lời:', response);
      
      // Lưu câu trả lời vào state và localStorage (dự phòng)
      setAnswers((prevAnswers) => {
        const updatedAnswers = {
          ...prevAnswers,
          [currentQuestion.id]: optionId
        };
        localStorage.setItem(`quiz_${quizId}_answers`, JSON.stringify(updatedAnswers));
        return updatedAnswers;
      });
      
      // Hiển thị thông báo nếu cần
      if (response.isCorrect) {
        console.log(`Chính xác! +${response.points} điểm`);
      } else {
        console.log('Câu trả lời không chính xác');
      }
      
      // Chuyển sang câu hỏi tiếp theo sau khi trả lời
      if (currentQuestionIndex < quiz.questions.length - 1) {
        handleNextQuestion();
      } else {
        handleFinish();
      }
    } catch (error) {
      console.error('Lỗi khi gửi câu trả lời:', error);
      // Vẫn lưu câu trả lời vào localStorage để dự phòng
      setAnswers((prevAnswers) => {
        const updatedAnswers = {
          ...prevAnswers,
          [currentQuestion.id]: optionId
        };
        localStorage.setItem(`quiz_${quizId}_answers`, JSON.stringify(updatedAnswers));
        return updatedAnswers;
      });
      
      // Vẫn chuyển câu hỏi để người dùng có thể tiếp tục làm bài
      if (currentQuestionIndex < quiz.questions.length - 1) {
        handleNextQuestion();
      } else {
        handleFinish();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          {error || 'Không tìm thấy quiz'}
        </h2>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => navigate('/')}
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
          <p className="text-gray-600">{quiz.description}</p>
          {sessionCode && <p className="text-sm text-gray-500 mt-1">Mã phiên: {sessionCode}</p>}
        </div>

        {currentQuestion && (
          <QuestionScreen
            question={currentQuestion as Question}
            onAnswer={handleAnswer}
            timeLeft={timeLeft}
            totalTime={currentQuestion.timeLimit || quiz.timeLimit || 30}
          />
        )}
      </div>
    </div>
  );
};

export default RoomPage; 