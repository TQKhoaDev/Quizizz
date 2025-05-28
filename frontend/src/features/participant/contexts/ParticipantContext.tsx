import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Question } from '../components/QuestionTypes';

interface ParticipantContextType {
  participantId: string | null;
  sessionId: string | null;
  score: number;
  questions: Question[];
  currentQuestionIndex: number;
  isQuizCompleted: boolean;
  setParticipantId: (id: string) => void;
  setSessionId: (id: string) => void;
  setQuestions: (questions: Question[]) => void;
  setScore: (score: number) => void;
  incrementScore: (points: number) => void;
  setCurrentQuestionIndex: (index: number) => void;
  nextQuestion: () => void;
  setQuizCompleted: (completed: boolean) => void;
  resetQuizState: () => void;
}

const ParticipantContext = createContext<ParticipantContextType | undefined>(undefined);

export const useParticipant = () => {
  const context = useContext(ParticipantContext);
  if (!context) {
    throw new Error('useParticipant must be used within a ParticipantProvider');
  }
  return context;
};

interface ParticipantProviderProps {
  children: ReactNode;
}

export const ParticipantProvider: React.FC<ParticipantProviderProps> = ({ children }) => {
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isQuizCompleted, setQuizCompleted] = useState(false);

  // Khôi phục trạng thái từ localStorage khi component được mount
  useEffect(() => {
    const storedParticipantId = localStorage.getItem('participantId');
    const storedSessionId = localStorage.getItem('sessionId');
    const storedScore = localStorage.getItem('score');
    const storedQuizCompleted = localStorage.getItem('isQuizCompleted');
    const storedCurrentQuestionIndex = localStorage.getItem('currentQuestionIndex');
    
    if (storedParticipantId) setParticipantId(storedParticipantId);
    if (storedSessionId) setSessionId(storedSessionId);
    if (storedScore) setScore(parseInt(storedScore));
    if (storedQuizCompleted) setQuizCompleted(storedQuizCompleted === 'true');
    if (storedCurrentQuestionIndex) setCurrentQuestionIndex(parseInt(storedCurrentQuestionIndex));
    
    // Không lưu questions trong localStorage vì có thể rất lớn
  }, []);

  // Lưu trạng thái vào localStorage khi thay đổi
  useEffect(() => {
    if (participantId) localStorage.setItem('participantId', participantId);
    if (sessionId) localStorage.setItem('sessionId', sessionId);
    localStorage.setItem('score', score.toString());
    localStorage.setItem('isQuizCompleted', isQuizCompleted.toString());
    localStorage.setItem('currentQuestionIndex', currentQuestionIndex.toString());
  }, [participantId, sessionId, score, isQuizCompleted, currentQuestionIndex]);

  const incrementScore = (points: number) => {
    setScore((prev) => prev + points);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuizState = () => {
    setScore(0);
    setCurrentQuestionIndex(0);
    setQuizCompleted(false);
    setQuestions([]);
  };

  const value = {
    participantId,
    sessionId,
    score,
    questions,
    currentQuestionIndex,
    isQuizCompleted,
    setParticipantId,
    setSessionId,
    setQuestions,
    setScore,
    incrementScore,
    setCurrentQuestionIndex,
    nextQuestion,
    setQuizCompleted,
    resetQuizState
  };

  return (
    <ParticipantContext.Provider value={value}>
      {children}
    </ParticipantContext.Provider>
  );
}; 