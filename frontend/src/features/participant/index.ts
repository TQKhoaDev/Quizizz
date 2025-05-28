import { participantApi } from './api/participantApi';
import { QuestionController } from './components/QuestionController';
import { QuizPlayer } from './components/QuizPlayer';
import { MCQQuestion, TrueFalseQuestion, MultipleSelectQuestion } from './components/QuestionTypes';
import type { Question, QuestionType, QuestionOption } from './components/QuestionTypes';
import { ParticipantProvider, useParticipant } from './contexts/ParticipantContext';
import QuizPage from './pages/QuizPage';

export {
  // API
  participantApi,
  
  // Components
  QuestionController,
  QuizPlayer,
  MCQQuestion,
  TrueFalseQuestion,
  MultipleSelectQuestion,
  
  // Context
  ParticipantProvider,
  useParticipant,
  
  // Pages
  QuizPage,
};

// Types
export type { Question, QuestionType, QuestionOption };
