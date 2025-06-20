import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { QuizDetail } from '../../Quiz/api/quizApi';
import { quizApi } from '../../Quiz/api/quizApi';
import { participantApi } from '../api/participantApi';
import type { ParticipantResult } from '../api/participantApi';

const ResultPage: React.FC = () => {
  const { participantId } = useParams<{ participantId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [result, setResult] = useState<ParticipantResult | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResultData = async () => {
      // Lấy participantId từ URL params
      if (!participantId) {
        console.warn('Không tìm thấy participantId trong URL params');
        setError('Không thể lấy kết quả - thiếu thông tin người tham gia');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log(`Đã tìm thấy participantId từ URL: ${participantId}`);
        
        // Gọi API với participantId từ URL params
        const apiResult = await participantApi.getParticipantResults(participantId);
        console.log("Dữ liệu kết quả từ API:", apiResult);
        setResult(apiResult);
        setScore(apiResult.statistics.correctAnswers);
        setTotalQuestions(apiResult.statistics.totalQuestions);

        // Lấy quiz chi tiết để có options cho từng câu hỏi
        if (apiResult.quiz && apiResult.quiz.id) {
          const quizDetail = await quizApi.getQuizById(apiResult.quiz.id);
          setQuiz(quizDetail);
        }

        // Chuyển đổi dữ liệu câu trả lời từ API thành format cần thiết
        if (apiResult.answers && apiResult.answers.length > 0) {
          const answersMap: Record<string, string> = {};
          apiResult.answers.forEach(answer => {
            answersMap[answer.questionId] = answer.selectedOption;
          });
          setAnswers(answersMap);
        }
      } catch (error) {
        console.error('Lỗi khi lấy kết quả:', error);
        setError('Không thể lấy kết quả bài làm. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResultData();
  }, [participantId]);

  const handleGoHome = () => {
    navigate('/');
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
          {error || 'Không tìm thấy thông tin bài làm'}
        </h2>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={handleGoHome}
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }
  // Tính phần trăm đúng
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-blue-400 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/20 rounded-xl p-6 mb-8 flex items-center gap-4 shadow-lg">
          <div className="text-4xl text-white"><i className="fa-solid fa-trophy"></i></div>
          <div>
            <h1 className="text-2xl font-bold text-white">Kết quả bài làm</h1>
            <p className="text-white/80">Hoàn thành xuất sắc!</p>
            <span className="inline-block mt-2 px-3 py-1 bg-white/30 text-white rounded-full text-xs font-semibold">{quiz?.title}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cột trái: Vòng tròn điểm số */}
          <div className="col-span-1 flex flex-col items-center bg-white rounded-xl shadow-lg p-8">
            {/* Vòng tròn phần trăm */}
            <div className="relative mb-4">
              <svg className="w-32 h-32">
                <circle cx="64" cy="64" r="56" fill="none" stroke="#e5e7eb" strokeWidth="12"/>
                <circle
                  cx="64" cy="64" r="56" fill="none"
                  stroke="#6366f1" strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 56}
                  strokeDashoffset={2 * Math.PI * 56 * (1 - percentage / 100)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-indigo-600">{percentage}%</span>
                <span className="text-gray-500 text-sm">Điểm số</span>
              </div>
            </div>
            {/* Nhận xét */}
            <div className="text-xl font-semibold text-indigo-700 flex items-center gap-2 mb-2">
              <i className="fa-solid fa-trophy text-yellow-400"></i>
              {percentage >= 80 ? 'Xuất sắc!' : percentage >= 60 ? 'Tốt lắm!' : percentage >= 40 ? 'Cố gắng thêm!' : 'Hãy luyện tập nhé!'}
            </div>
            {/* Số câu đúng, điểm, hạng */}
            <div className="text-gray-700 text-lg mb-1">
              <span className="text-green-600 font-bold">{score}</span>
              <span> / {totalQuestions} câu đúng</span>
            </div>
            {result && (
              <div className="flex gap-4 text-gray-600 text-base mt-2">
                <span>Điểm: <b>{result.participant.score}</b></span>
                {result.participant.rank !== null && (
                  <span>Hạng: <b>#{result.participant.rank}</b></span>
                )}
              </div>
            )}
          </div>

          {/* Cột phải: Các chỉ số phụ */}
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <div className="text-green-500 text-2xl mb-2"><i className="fa-solid fa-circle-check"></i></div>
              <div className="text-2xl font-bold">{result?.statistics.accuracy}%</div>
              <div className="text-gray-500">Độ chính xác</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <div className="text-blue-500 text-2xl mb-2"><i className="fa-solid fa-users"></i></div>
              <div className="text-2xl font-bold">{totalQuestions}</div>
              <div className="text-gray-500">Tổng câu hỏi</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <div className="text-purple-500 text-2xl mb-2"><i className="fa-solid fa-clock"></i></div>
              <div className="text-2xl font-bold">2:35</div>
              <div className="text-gray-500">Thời gian</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <div className="text-yellow-500 text-2xl mb-2"><i className="fa-solid fa-trophy"></i></div>
              <div className="text-2xl font-bold">#{result?.participant.rank ?? '-'}</div>
              <div className="text-gray-500">Xếp hạng</div>
            </div>
          </div>
        </div>

        {/* Chi tiết bài làm */}
        <div className="max-w-4xl mx-auto mt-10">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-lg font-semibold mb-4 text-indigo-700">Chi tiết bài làm</h3>
            <div className="space-y-4">
              {quiz.questions.map((question, index) => {
                const userAnswerContent = answers[question.id];
                const userOption = question.options.find(opt => opt.content === userAnswerContent);
                const correctOption = question.options.find(opt => opt.isCorrect);
                const isCorrect = userOption && correctOption && userOption.content === correctOption.content;

                return (
                  <div
                    key={question.id}
                    className={`p-4 border rounded-lg ${
                      isCorrect ? 'bg-green-50 border-green-200' :
                      userAnswerContent ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Câu {index + 1}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isCorrect ? 'bg-green-200 text-green-800' :
                        userAnswerContent ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-800'
                      }`}>
                        {isCorrect ? 'Đúng' : userAnswerContent ? 'Sai' : 'Không trả lời'}
                      </span>
                    </div>
                    <p className="text-gray-800 mb-3">{question.content}</p>
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="font-medium w-32">Đáp án của bạn:</span>
                        <span className={
                          isCorrect ? 'text-green-600' :
                          userAnswerContent ? 'text-red-600' : 'text-gray-500 italic'
                        }>
                          {userOption ? userOption.content : 'Không trả lời'}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div className="flex">
                          <span className="font-medium w-32">Đáp án đúng:</span>
                          <span className="text-green-600">
                            {correctOption ? correctOption.content : 'Không có đáp án đúng'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage; 