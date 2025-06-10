export type SessionStatus = 'PENDING' | 'ACTIVE' | 'WAITING_NEXT_QUESTION' | 'ENDED' | 'CANCELED';

export interface Participant {
  id: string;
  fullName: string;
  avatar?: string;
  isGuest: boolean;
  joinTime?: string;
  score?: number;
  rank?: number;
  userId?: string;
}

export interface Session {
  id: string;
  status: SessionStatus;
  startTime: string;
  endTime: string | null;
  proctorId: string;
  quizId: string;
  code?: string;
  quiz: {
    id: string;
    title: string;
    description: string;
    totalParticipants?: number;
  };
  _count?: {
    participants?: number;
  };
  createdAt: string;
  updatedAt: string;
  participants: Participant[];
} 