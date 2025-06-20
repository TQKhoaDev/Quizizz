import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionScreen from '../components/QuestionScreen';
import type { QuizDetail } from '../../Quiz/api/quizApi';
import { quizApi } from '../../Quiz/api/quizApi';
import { participantApi } from '../../participant/api/participantApi';
import type { SubmitAnswerData } from '../../participant/api/participantApi';
import { useSocket } from '@/hooks';

const RoomPage: React.FC = () => {
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const quizId = queryParams.get('quizId');
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  // Thêm socket connection cho realtime events
  const { 
    isConnected,
    sessionStatus,
    shouldNavigate,
    setShouldNavigate,
    // Thêm question control states
    currentQuestion,
    submitAnswerEvent,
    getCurrentQuestion
  } = useSocket({
    sessionId: sessionCode || '',
    role: 'STUDENT',
    token: localStorage.getItem('token') || ''
  });

  // Xử lý auto navigation khi session kết thúc
  useEffect(() => {
    if (shouldNavigate) {
      // Lưu trạng thái hiện tại trước khi navigate
      if (quiz && answers) {
        localStorage.setItem(`quiz_${quizId}_answers`, JSON.stringify(answers));
        localStorage.setItem(`session_${sessionCode}`, quizId || '');
      }
      
      const delay = shouldNavigate.delay || 2000;
      const timer = setTimeout(() => {
        navigate(shouldNavigate.path);
        setShouldNavigate(null);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [shouldNavigate, navigate, setShouldNavigate, quiz, answers, quizId, sessionCode]);

  // Kết thúc bài làm - cải thiện với socket awareness
  const handleFinish = useCallback(async () => {
    if (!sessionCode) return;
    
    try {
      // Lưu kết quả vào localStorage (dự phòng)
      localStorage.setItem(`quiz_${quizId}_answers`, JSON.stringify(answers));
      localStorage.setItem(`session_${sessionCode}`, quizId || '');
      
      if (participantId) {
        localStorage.setItem(`participant_${sessionCode}`, participantId);
      }
      
      // Chuyển hướng đến trang kết quả
      const currentUserId = localStorage.getItem('userId') || participantId || 'guest';
      navigate(`/answers/participants/${currentUserId}/results?sessionCode=${sessionCode}`);
    } catch {
      navigate(`/result/${quizId}?sessionCode=${sessionCode}`);
    }
  }, [sessionCode, quizId, answers, participantId, navigate]);

  // Lấy thông tin quiz và sync với current question
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!sessionCode) {
        setError("Không tìm thấy mã phiên");
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Lấy thông tin session từ localStorage để có quiz code thực sự
        let realQuizCode: string | null = null;
        const sessionInfo = localStorage.getItem(`session_info_${sessionCode}`);
        if (sessionInfo) {
          try {
            const parsedSession = JSON.parse(sessionInfo);
            
            // Cần lấy quiz.code từ session.quiz.code, không phải session.code
            // session.code là session code, quiz.code là quiz code thực sự (như MATH01)
            if (parsedSession && parsedSession.quiz && parsedSession.quiz.code) {
              realQuizCode = parsedSession.quiz.code;
            } else if (parsedSession && parsedSession.code) {
              // Fallback: thử session.code nếu không có quiz.code
              realQuizCode = parsedSession.code;
            }
          } catch {
            // Silent
          }
        }
        
        // Thử lấy quiz theo thứ tự ưu tiên
        let fetchedQuiz: QuizDetail | null = null;
        
        // Ưu tiên lấy quiz bằng quizId từ URL params trước
        if (quizId) {
          try {
            fetchedQuiz = await quizApi.getQuizById(quizId);
          } catch {
            // Fallback sang logic cũ nếu quizId không hoạt động
            fetchedQuiz = await fallbackQuizFetch();
          }
        } else {
          // Nếu không có quizId, sử dụng logic fallback
          fetchedQuiz = await fallbackQuizFetch();
        }
        
        async function fallbackQuizFetch(): Promise<QuizDetail> {
          if (realQuizCode) {
            try {
              return await quizApi.getQuizByCode(realQuizCode);
            } catch {
              try {
                return await quizApi.getQuizByCode(sessionCode || '');
              } catch {
                throw new Error("Không thể lấy quiz bằng bất kỳ phương pháp nào");
              }
            }
          } else {
            // Fallback logic cũ
            try {
              return await quizApi.getQuizByCode(sessionCode || '');
            } catch {
              throw new Error("Không thể lấy quiz bằng sessionCode");
            }
          }
        }
        
        if (!fetchedQuiz) {
          throw new Error("Không thể lấy thông tin quiz");
        }
        
        setQuiz(fetchedQuiz);
        
        // Lấy participantId từ localStorage
        const storedParticipantId = localStorage.getItem(`participant_${sessionCode}`);
        
        if (storedParticipantId) {
          setParticipantId(storedParticipantId);
        }
        
        // Kiểm tra current question từ socket
        if (isConnected) {
          getCurrentQuestion();
        }
        
      } catch {
        setError('Không thể tải quiz. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [sessionCode, quizId, isConnected, getCurrentQuestion]);

  // Đồng bộ currentQuestion từ socket với local state
  useEffect(() => {
    if (currentQuestion && quiz) {
      // Cập nhật current question index từ socket
      setCurrentQuestionIndex(currentQuestion.questionIndex);
      
      // Reset start time cho tracking response time chính xác
      const elapsed = currentQuestion.question.timeLimit - currentQuestion.timeLeft;
      setStartTime(Date.now() - (elapsed * 1000));
    }
  }, [currentQuestion, quiz]);

  // Xử lý auto finish khi hết thời gian câu cuối
  useEffect(() => {
    if (currentQuestion && quiz && quiz.questions && currentQuestion.timeLeft <= 0) {
      // Nếu đây là câu hỏi cuối và hết thời gian
      if (currentQuestionIndex >= quiz.questions.length - 1) {
        handleFinish();
      }
    }
  }, [currentQuestion, quiz, currentQuestionIndex, handleFinish]);

  // Xử lý khi người dùng trả lời câu hỏi - CẢI THIỆN VỚI SOCKET
  const handleAnswer = async (optionId: string) => {
    if (!quiz || !quiz.questions || !sessionCode || !currentQuestion) return;
    
    // Kiểm tra index hợp lệ
    if (currentQuestionIndex >= quiz.questions.length || currentQuestionIndex < 0) {
      return;
    }
    
    const currentQuestionData = quiz.questions[currentQuestionIndex];
    if (!currentQuestionData) {
      return;
    }
    
    const responseTime = Math.round((Date.now() - startTime) / 1000);
    
    console.log('📝 [ROOM] Submitting answer:', {
      questionId: currentQuestionData.id,
      optionId: optionId,
      responseTime: responseTime,
      questionIndex: currentQuestion.questionIndex
    });
    
    try {
      // Lấy sessionId đầy đủ từ localStorage nếu có
      let fullSessionId = sessionCode;
      
      const sessionInfo = localStorage.getItem(`session_info_${sessionCode}`);
      if (sessionInfo) {
        try {
          const parsedSession = JSON.parse(sessionInfo);
          if (parsedSession && parsedSession.id) {
            fullSessionId = parsedSession.id;
          }
        } catch {
          // Silent
        }
      }
      
      // Chuẩn bị dữ liệu để gửi câu trả lời
      const answerData: SubmitAnswerData = {
        questionId: currentQuestionData.id,
        sessionId: fullSessionId,
        responseTime,
        optionId: optionId
      };
      
      if (participantId) {
        answerData.participantId = participantId;
      }
      
      console.log("📤 [ROOM] Dữ liệu gửi API:", answerData);
      
      // Gửi câu trả lời lên server qua API
      const response = await participantApi.submitAnswer(answerData);
      console.log('✅ [ROOM] Kết quả từ API:', response);
      
      // Gửi realtime event về việc submit answer
      submitAnswerEvent({
        questionId: currentQuestionData.id,
        optionId: optionId,
        responseTime: responseTime
      });
      console.log('📡 [ROOM] Đã gửi realtime event submit answer');
      
      // Lưu câu trả lời vào state và localStorage (dự phòng)
      setAnswers((prevAnswers) => {
        const updatedAnswers = {
          ...prevAnswers,
          [currentQuestionData.id]: optionId
        };
        localStorage.setItem(`quiz_${quizId}_answers`, JSON.stringify(updatedAnswers));
        console.log('💾 [ROOM] Đã lưu answer vào localStorage:', updatedAnswers);
        return updatedAnswers;
      });
      
      // Hiển thị feedback
      if (response.isCorrect) {
        console.log(`🎉 [ROOM] Chính xác! +${response.points} điểm`);
      } else {
        console.log('❌ [ROOM] Câu trả lời không chính xác');
      }
      
    } catch {
      console.error('❌ [ROOM] Lỗi khi gửi câu trả lời:');
      
      // Vẫn lưu câu trả lời local để dự phòng
      setAnswers((prevAnswers) => {
        const updatedAnswers = {
          ...prevAnswers,
          [currentQuestionData.id]: optionId
        };
        localStorage.setItem(`quiz_${quizId}_answers`, JSON.stringify(updatedAnswers));
        console.log('💾 [ROOM] Đã lưu answer fallback vào localStorage:', updatedAnswers);
        return updatedAnswers;
      });
    }
  };

  // Render loading state với session awareness
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-4"
          >
            🎮
          </motion.div>
          <h2 className="text-2xl font-bold text-purple-800 mb-2">Đang tải quiz...</h2>
          <div className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? '🟢 Kết nối realtime' : '🔴 Mất kết nối'}
          </div>
        </motion.div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl text-center max-w-md"
        >
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Quay lại
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
      {/* Overlay khi session kết thúc */}
      <AnimatePresence>
        {shouldNavigate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-600/90 backdrop-blur-md z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 text-center max-w-md mx-4"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                🏁
              </motion.div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">
                Quiz Đã Kết Thúc!
              </h2>
              <p className="text-gray-600 mb-4">
                Đang chuyển hướng đến trang kết quả...
              </p>
              <motion.div
                className="w-full bg-red-200 rounded-full h-2"
              >
                <motion.div
                  className="bg-red-600 h-2 rounded-full"
                  animate={{ width: "100%" }}
                  transition={{ duration: shouldNavigate.delay ? shouldNavigate.delay / 1000 : 2 }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hiển thị trạng thái session */}
      {sessionStatus === 'ENDED' && !shouldNavigate && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-40"
        >
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              🏁
            </motion.span>
            <span className="font-medium">Phiên quiz đã kết thúc!</span>
          </div>
        </motion.div>
      )}

      {/* Connection status indicator - cải thiện hiển thị */}
      <div className="fixed top-4 right-4 z-30">
        <motion.div
          className={`px-3 py-2 rounded-lg text-sm font-medium shadow-lg ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
          animate={isConnected ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: isConnected ? Infinity : 0 }}
        >
          {isConnected ? '🟢 Realtime' : '🔴 Mất kết nối'}
        </motion.div>
      </div>

      {/* Hiển thị thông báo trạng thái question realtime */}
      {currentQuestion && (
        <div className="fixed top-4 left-4 z-30">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className={`px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${
              currentQuestion.isActive 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>
                {currentQuestion.isActive ? '🎯' : '⏸️'}
              </span>
              <div>
                <div className="font-bold">
                  Câu {currentQuestion.questionIndex + 1}/{quiz?.questions?.length || 'N/A'}
                </div>
                <div className="text-xs">
                  {currentQuestion.isActive 
                    ? `${currentQuestion.timeLeft}s còn lại` 
                    : 'Đã kết thúc'}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Nội dung chính - Hiển thị câu hỏi từ socket */}
      {(() => {
        const shouldRender = quiz && 
          quiz.questions && 
          quiz.questions.length > 0 && 
          currentQuestion && 
          currentQuestion.questionIndex >= 0 &&
          currentQuestion.questionIndex < quiz.questions.length;
          
        if (shouldRender) {
          const questionData = quiz.questions[currentQuestion.questionIndex];
          
          return (
            <QuestionScreen
              question={{
                ...questionData,
                timeLimit: currentQuestion.question.timeLimit,
                imageUrl: null,
                videoUrl: null,  
                quizId: quiz.id,
                options: questionData.options.map(option => ({
                  ...option,
                  imageUrl: null,
                  matchingText: null,
                  questionId: questionData.id
                }))
              }}
              onAnswer={handleAnswer}
              timeLeft={Math.max(0, currentQuestion.timeLeft)}
              totalTime={currentQuestion.question.timeLimit}
              questionIndex={currentQuestion.questionIndex}
              totalQuestions={quiz.questions?.length || 0}
              isActive={currentQuestion.timeLeft > 0}
            />
          );
        }
        
        return null;
      })()}
      
      {/* Hiển thị waiting screen khi không có current question hoặc question không active */}
      {quiz && !currentQuestion && !isLoading && (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl text-center max-w-md"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              ⏳
            </motion.div>
            <h2 className="text-2xl font-bold text-purple-800 mb-2">
              Đang chờ câu hỏi...
            </h2>
            <p className="text-gray-600 mb-4">
              Giám thị sẽ bắt đầu câu hỏi sớm nhất có thể
            </p>
            <div className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? '🟢 Kết nối realtime' : '🔴 Mất kết nối'}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RoomPage; 