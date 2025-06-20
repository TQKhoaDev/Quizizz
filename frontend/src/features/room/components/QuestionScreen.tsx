import React, { useState } from 'react';
import type { Question } from '../../question/api/questionApi';

interface QuestionScreenProps {
  question: Question;
  onAnswer: (optionId: string) => void;
  timeLeft: number;
  totalTime: number;
  questionIndex?: number;
  totalQuestions?: number;
  isActive?: boolean;
}

const QuestionScreen: React.FC<QuestionScreenProps> = ({ 
  question, 
  onAnswer, 
  timeLeft, 
  totalTime,
  questionIndex,
  totalQuestions,
  isActive = true
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  // Tính toán phần trăm thời gian còn lại
  const timePercentage = (timeLeft / totalTime) * 100;

  const handleOptionClick = (optionId: string) => {
    if (!isActive) return; // Không cho phép chọn khi question inactive
    setSelectedOption(optionId);
  };

  const handleSubmit = () => {
    if (selectedOption && isActive) {
      onAnswer(selectedOption);
    }
  };

  return (
    <div className={`p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md ${!isActive ? 'opacity-60' : ''}`}>
      {/* Thanh tiến trình thời gian */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className={`h-2.5 rounded-full transition-all duration-1000 ${
            timePercentage > 30 ? 'bg-blue-600' : timePercentage > 10 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${timePercentage}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm font-medium text-gray-500">
          Câu hỏi {(questionIndex !== undefined ? questionIndex + 1 : question.order)}/{totalQuestions || 'N/A'}
        </span>
        <span className={`text-sm font-medium ${timeLeft <= 10 ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
          {timeLeft} giây
        </span>
      </div>

      {/* Trạng thái câu hỏi */}
      {!isActive && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded-lg">
          <p className="text-yellow-800 text-sm font-medium">
            ⏳ Câu hỏi đã kết thúc hoặc chưa được kích hoạt
          </p>
        </div>
      )}

      {/* Điểm và độ khó */}
      <div className="flex justify-between items-center mb-4">
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          {question.points} điểm
        </span>
        <span className={`px-3 py-1 rounded-full text-sm ${
          question.difficulty === 'EASY' 
            ? 'bg-green-100 text-green-800' 
            : question.difficulty === 'MEDIUM'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {question.difficulty === 'EASY' 
            ? 'Dễ' 
            : question.difficulty === 'MEDIUM' 
            ? 'Trung bình' 
            : 'Khó'}
        </span>
      </div>

      {/* Nội dung câu hỏi */}
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        {question.content}
      </h2>

      {/* Hình ảnh câu hỏi nếu có */}
      {question.imageUrl && (
        <div className="mb-6">
          <img 
            src={question.imageUrl} 
            alt="Question" 
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}

      {/* Video câu hỏi nếu có */}
      {question.videoUrl && (
        <div className="mb-6">
          <video 
            controls 
            className="w-full h-auto rounded-lg"
          >
            <source src={question.videoUrl} type="video/mp4" />
            Trình duyệt của bạn không hỗ trợ video.
          </video>
        </div>
      )}

      {/* Danh sách các lựa chọn */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        {question.options.map((option) => (
          <button
            key={option.id}
            className={`p-4 border rounded-lg text-left transition-all hover:shadow-md ${
              selectedOption === option.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200'
            } ${!isActive ? 'cursor-not-allowed' : 'hover:border-blue-300'}`}
            onClick={() => handleOptionClick(option.id)}
            disabled={!isActive}
          >
            <div className="flex items-center">
              <span className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${
                selectedOption === option.id 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {String.fromCharCode(65 + option.order - 1)}
              </span>
              <span>{option.content}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Nút xác nhận */}
      <div className="flex justify-end">
        <button
          className={`px-6 py-2 rounded-lg text-white font-medium ${
            selectedOption && isActive
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          onClick={handleSubmit}
          disabled={!selectedOption || !isActive}
        >
          {!isActive ? 'Đã hết thời gian' : 'Xác nhận'}
        </button>
      </div>
    </div>
  );
};

export default QuestionScreen; 