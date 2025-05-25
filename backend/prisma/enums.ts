export enum UserRole {
  ADMIN = 'ADMIN',
  PROCTOR = 'PROCTOR',
  STUDENT = 'STUDENT'
}

export enum QuestionType {
  MCQ = 'MCQ',
  TRUE_FALSE = 'TRUE_FALSE',
  MULTIPLE_SELECT = 'MULTIPLE_SELECT',
  MATCHING = 'MATCHING',
  ESSAY = 'ESSAY'
}

export enum QuestionDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum SessionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
} 