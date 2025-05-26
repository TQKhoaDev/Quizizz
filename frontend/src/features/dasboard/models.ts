// Các interface mô tả cấu trúc dữ liệu sử dụng trong dashboard

export interface Stats {
  totalQuizzes: number
  totalSessions: number
  totalParticipants: number
  avgScore: number
}

export interface Quiz {
  id: number
  title: string
  questions: number
  participants: number
  avgScore: number
  status: "active" | "draft" | "completed"
  createdAt: string
}

export interface Session {
  id: number
  quizTitle: string
  code: string
  participants: number
  status: "live" | "ended"
  startTime: string
}

// Dữ liệu mẫu
export const mockStats: Stats = {
  totalQuizzes: 24,
  totalSessions: 156,
  totalParticipants: 1247,
  avgScore: 78.5,
}

export const mockQuizzes: Quiz[] = [
  {
    id: 1,
    title: "Toán học cơ bản",
    questions: 15,
    participants: 45,
    avgScore: 82,
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    title: "Lịch sử Việt Nam",
    questions: 20,
    participants: 32,
    avgScore: 75,
    status: "draft",
    createdAt: "2024-01-14",
  },
  {
    id: 3,
    title: "Tiếng Anh giao tiếp",
    questions: 25,
    participants: 67,
    avgScore: 88,
    status: "completed",
    createdAt: "2024-01-13",
  },
]

export const mockSessions: Session[] = [
  {
    id: 1,
    quizTitle: "Toán học cơ bản",
    code: "ABC123",
    participants: 25,
    status: "live",
    startTime: "14:30",
  },
  {
    id: 2,
    quizTitle: "Lịch sử Việt Nam",
    code: "XYZ789",
    participants: 18,
    status: "ended",
    startTime: "13:15",
  },
] 