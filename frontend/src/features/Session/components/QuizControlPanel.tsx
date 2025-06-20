import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Clock,
  Hash,
  AlertTriangle,
  Volume2,
  VolumeX,
  BarChart3,
  Users
} from 'lucide-react';
import type { QuizControlState, QuizRealtimeStats } from '../types/sessionControl';

/**
 * Props cho QuizControlPanel component
 */
interface QuizControlPanelProps {
  /** State điều khiển quiz */
  quizState: QuizControlState;
  /** Thống kê realtime */
  realTimeStats: QuizRealtimeStats;
  /** Có đang phát âm thanh cảnh báo không */
  audioEnabled: boolean;
  /** Actions điều khiển quiz */
  actions: {
    handleStartQuestion: () => void;
    handleEndQuestion: () => void;
    handleNextQuestion: () => void;
    handlePreviousQuestion: () => void;
    goToQuestion: (index: number) => void;
    toggleAudio: () => void;
  };
}

/**
 * Component điều khiển quiz realtime
 * Bao gồm điều khiển câu hỏi, timer, và thống kê
 */
const QuizControlPanel: React.FC<QuizControlPanelProps> = ({
  quizState,
  realTimeStats,
  audioEnabled,
  actions
}) => {
  
  /**
   * Format thời gian từ giây sang mm:ss
   */
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  /**
   * Tính phần trăm thời gian còn lại
   */
  const getTimePercentage = (): number => {
    if (!quizState.currentQuestion?.timeLimit) return 0;
    return (quizState.timeLeft / quizState.currentQuestion.timeLimit) * 100;
  };

  /**
   * Kiểm tra có thể next question không
   */
  const canGoNext = (): boolean => {
    return quizState.currentQuestionIndex < (quizState.quizQuestions?.length ?? 0) - 1;
  };

  /**
   * Kiểm tra có thể previous question không
   */
  const canGoPrevious = (): boolean => {
    return quizState.currentQuestionIndex > 0;
  };

  /**
   * Render timer với animation
   */
  const renderTimer = () => {
    const timePercentage = getTimePercentage();
    const isLowTime = quizState.isLowTime;
    
    return (
      <Card className={`p-4 ${isLowTime ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={isLowTime ? {
                scale: [1, 1.2, 1],
                rotate: [0, -5, 5, 0]
              } : {}}
              transition={{
                duration: 0.5,
                repeat: isLowTime ? Infinity : 0,
                repeatType: "reverse"
              }}
            >
              <Clock className={`w-5 h-5 ${isLowTime ? 'text-red-600' : 'text-blue-600'}`} />
            </motion.div>
            <span className={`font-semibold ${isLowTime ? 'text-red-800' : 'text-blue-800'}`}>
              Thời gian còn lại
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.toggleAudio}
            className="h-8 w-8 p-0"
          >
            {audioEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </Button>
        </div>

        <motion.div
          className={`text-3xl font-bold mb-3 ${isLowTime ? 'text-red-600' : 'text-blue-600'}`}
          animate={isLowTime ? {
            color: ['#DC2626', '#EF4444', '#DC2626']
          } : {}}
          transition={{ duration: 1, repeat: isLowTime ? Infinity : 0 }}
        >
          {formatTime(quizState.timeLeft)}
        </motion.div>

        <Progress 
          value={timePercentage} 
          className={`h-2 ${isLowTime ? 'bg-red-100' : 'bg-blue-100'}`}
        />
        
        {isLowTime && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-2"
          >
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-600 font-medium">
              Thời gian sắp hết!
            </span>
          </motion.div>
        )}
      </Card>
    );
  };

  /**
   * Render thông tin câu hỏi hiện tại
   */
  const renderCurrentQuestion = () => {
    if (!quizState.currentQuestion) {
      return (
        <Card className="p-6 text-center">
          <p className="text-gray-500">Chưa có câu hỏi nào được chọn</p>
        </Card>
      );
    }

    return (
      <motion.div
        key={quizState.currentQuestion.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="flex items-center gap-1">
                <Hash className="w-3 h-3" />
                Câu {quizState.currentQuestionIndex + 1}
              </Badge>
              <Badge 
                variant={
                  quizState.currentQuestion.difficulty === 'EASY' ? 'secondary' :
                  quizState.currentQuestion.difficulty === 'MEDIUM' ? 'default' : 'destructive'
                }
              >
                {quizState.currentQuestion.difficulty === 'EASY' ? 'Dễ' :
                 quizState.currentQuestion.difficulty === 'MEDIUM' ? 'Trung bình' : 'Khó'}
              </Badge>
              <Badge variant="outline">
                {quizState.currentQuestion.points} điểm
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {quizState.currentQuestion.timeLimit}s
              </Badge>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-4 line-clamp-2">
            {quizState.currentQuestion.content}
          </h3>

          {/* Hiển thị các options */}
          <div className="grid gap-2 mb-4">
            {quizState.currentQuestion.options.map((option, index) => (
              <div 
                key={option.id}
                className={`p-3 rounded-lg border ${
                  option.isCorrect 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span>{option.content}</span>
                  {option.isCorrect && (
                    <Badge variant="secondary" className="ml-auto">
                      Đúng
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    );
  };

  /**
   * Render thống kê realtime
   */
  const renderRealtimeStats = () => {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <span className="font-semibold text-purple-800">Thống kê realtime</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">Đã trả lời</span>
            </div>
            <p className="text-xl font-bold text-blue-600">
              {realTimeStats.totalAnswers}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-600">Đúng</span>
            </div>
            <p className="text-xl font-bold text-green-600">
              {realTimeStats.correctAnswers}
            </p>
          </div>
        </div>

        {/* Thống kê theo option */}
        {realTimeStats.optionStats && Object.keys(realTimeStats.optionStats).length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Phân bố lựa chọn:
            </p>
            <div className="space-y-2">
              {Object.entries(realTimeStats.optionStats).map(([optionId, count], index) => (
                <div key={optionId} className="flex items-center gap-2">
                  <span className="text-sm font-medium w-6">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div 
                        className="h-2 bg-blue-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: realTimeStats.totalAnswers > 0 
                            ? `${(count / realTimeStats.totalAnswers) * 100}%` 
                            : '0%'
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  };

  /**
   * Render điều khiển navigation
   */
  const renderNavigationControls = () => {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Điều khiển Quiz</h3>
          <Badge variant="outline">
            {quizState.currentQuestionIndex + 1} / {quizState.quizQuestions?.length ?? 0}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Start/End Question */}
          <Button
            onClick={quizState.isQuestionActive ? actions.handleEndQuestion : actions.handleStartQuestion}
            className={
              quizState.isQuestionActive 
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-green-600 hover:bg-green-700"
            }
          >
            {quizState.isQuestionActive ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Kết thúc câu hỏi
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Bắt đầu câu hỏi
              </>
            )}
          </Button>

          {/* Navigation */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={actions.handlePreviousQuestion}
              disabled={!canGoPrevious()}
              className="flex-1"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={actions.handleNextQuestion}
              disabled={!canGoNext()}
              className="flex-1"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quick navigation */}
        {quizState.quizQuestions && quizState.quizQuestions.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Chuyển đến câu hỏi:
            </p>
            <div className="flex flex-wrap gap-2">
              {quizState.quizQuestions.map((_, index) => (
                <Button
                  key={index}
                  variant={index === quizState.currentQuestionIndex ? "default" : "outline"}
                  size="sm"
                  onClick={() => actions.goToQuestion(index)}
                  className="w-10 h-8 p-0"
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Timer */}
      {quizState.isQuestionActive && renderTimer()}

      {/* Navigation Controls */}
      {renderNavigationControls()}

      {/* Current Question */}
      <AnimatePresence mode="wait">
        {renderCurrentQuestion()}
      </AnimatePresence>

      {/* Realtime Stats */}
      {quizState.isQuestionActive && renderRealtimeStats()}
    </div>
  );
};

export default QuizControlPanel;