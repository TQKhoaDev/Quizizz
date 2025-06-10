import { useState, useEffect, useCallback } from 'react';

interface UseQuizTimerProps {
  initialTime: number;
  onTimeUp: () => void;
  isPaused?: boolean;
}

const useQuizTimer = ({ initialTime, onTimeUp, isPaused = false }: UseQuizTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  // Reset timer
  const resetTimer = useCallback((newTime: number) => {
    setTimeLeft(newTime);
  }, []);

  // Start timer countdown
  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerId);
          onTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, isPaused, onTimeUp]);

  // Tính phần trăm thời gian còn lại
  const getTimePercentage = useCallback(() => {
    return (timeLeft / initialTime) * 100;
  }, [timeLeft, initialTime]);

  return {
    timeLeft,
    resetTimer,
    getTimePercentage
  };
};

export default useQuizTimer; 