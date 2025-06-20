import axios from 'axios';

// Cấu hình base URL cho API
const API_URL = import.meta.env.VITE_API_BACKEND || 'http://localhost:3001/api';

export interface Participant {
    id: string;
    joinTime: string;
    score: number;
    rank: number | null;
    userId: string;
    user: {
        id: string;
        fullName: string;
        email: string | null;
        isGuest: boolean;
    };
}

export interface Session {
    id: string;
    status: 'PENDING' | 'ACTIVE' | 'ENDED' | 'CANCELED';
    startTime: string;
    endTime: string | null;
    proctorId: string;
    quizId: string;
    quiz: {
        id: string;
        title: string;
        description: string;
        totalParticipants?: number;
    };
    _count?: {
        participants?: number;
    };
    participants?: Participant[];
    code?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSessionRequest {
    quizId: string;
}

// Dữ liệu mẫu cho testing
const mockSessions: Session[] = [
    {
        id: 'd15d6cae-722e-465d-9b4e-e5bc35b19332',
        status: 'ACTIVE',
        startTime: new Date().toISOString(),
        endTime: null,
        proctorId: '1',
        quizId: '1',
        quiz: {
            id: '1',
            title: 'Kiểm tra Demo Session',
            description: 'Session demo để test ứng dụng',
            totalParticipants: 20,
        },
        _count: {
            participants: 5,
        },
        code: 'DEMO123',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '1',
        status: 'ACTIVE',
        startTime: new Date().toISOString(),
        endTime: null,
        proctorId: '1',
        quizId: '1',
        quiz: {
            id: '1',
            title: 'Kiểm tra giữa kỳ Toán học',
            description: 'Bài kiểm tra 45 phút về Đại số và Giải tích',
            totalParticipants: 25,
        },
        _count: {
            participants: 18,
        },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '2',
        status: 'PENDING',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endTime: null,
        proctorId: '1',
        quizId: '2',
        quiz: {
            id: '2',
            title: 'Kiểm tra cuối kỳ Vật lý',
            description: 'Bài kiểm tra 60 phút về Cơ học và Điện từ học',
            totalParticipants: 30,
        },
        _count: {
            participants: 0,
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '3',
        status: 'ENDED',
        startTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
        proctorId: '1',
        quizId: '3',
        quiz: {
            id: '3',
            title: 'Kiểm tra 15 phút Hóa học',
            description: 'Bài kiểm tra ngắn về Hóa vô cơ',
            totalParticipants: 15,
        },
        _count: {
            participants: 15,
        },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
];

export const sessionApi = {
    // Lấy danh sách phiên
    getSessions: async (): Promise<Session[]> => {
        try {
            const response = await axios.get<{ data: Session[] }>(`${API_URL}/sessions`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                }
              });
              return response.data.data;
        } catch (error) {
            // Nếu lỗi, log và trả về dữ liệu mẫu
            console.error('Lỗi khi lấy danh sách phiên:', error);
            return mockSessions;
        }
    },

    // Lấy một phiên theo ID
    getSessionById: async (id: string): Promise<Session | null> => {
        try {
            console.log("id",id);
            const response = await axios.get<{ data: Session }>(`${API_URL}/sessions/${id}`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                }
              });
              console.log("response",response);
            return response.data.data;
        } catch (error) {
            console.error(`Lỗi khi lấy phiên có ID ${id}:`, error);
            // Trả về phiên mẫu nếu ID trùng khớp
            const mockSession = mockSessions.find(session => session.id === id);
            return mockSession || null;
        }
    },

    // Tạo phiên mới
    createSession: async (data: CreateSessionRequest): Promise<Session> => {
        try {
            const response = await axios.post<{ data: Session }>(`${API_URL}/sessions`, data, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                }
              });
              return response.data.data;
        } catch (error) {
            console.error('Lỗi khi tạo phiên mới:', error);
            // Trả về phiên mẫu mới
            const newSession: Session = {
                id: (mockSessions.length + 1).toString(),
                status: 'PENDING',
                startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                endTime: null,
                proctorId: '1',
                quizId: data.quizId,
                quiz: {
                    id: data.quizId,
                    title: `Bài kiểm tra ${data.quizId}`,
                    description: 'Mô tả bài kiểm tra',
                },
                _count: {
                    participants: 0,
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            return newSession;
        }
    },

    // Bắt đầu phiên
    startSession: async (id: string): Promise<Session> => {
        try {
            const response = await axios.post(`${API_URL}/sessions/${id}/start`);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi bắt đầu phiên ${id}:`, error);
            // Trả về phiên mẫu đã được cập nhật
            const mockSession = mockSessions.find(session => session.id === id);
            if (mockSession) {
                return {
                    ...mockSession,
                    status: 'ACTIVE',
                    startTime: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
            }
            throw new Error(`Không tìm thấy phiên có ID ${id}`);
        }
    },

    // Kết thúc phiên
    endSession: async (id: string): Promise<Session> => {
        try {
            const response = await axios.post(`${API_URL}/sessions/${id}/end`);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi kết thúc phiên ${id}:`, error);
            // Trả về phiên mẫu đã được cập nhật
            const mockSession = mockSessions.find(session => session.id === id);
            if (mockSession) {
                return {
                    ...mockSession,
                    status: 'ENDED',
                    endTime: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
            }
            throw new Error(`Không tìm thấy phiên có ID ${id}`);
        }
    },

    // Hủy phiên
    cancelSession: async (id: string): Promise<Session> => {
        try {
            const response = await axios.post(`${API_URL}/sessions/${id}/cancel`);
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi hủy phiên ${id}:`, error);
            // Trả về phiên mẫu đã được cập nhật
            const mockSession = mockSessions.find(session => session.id === id);
            if (mockSession) {
                return {
                    ...mockSession,
                    status: 'CANCELED',
                    updatedAt: new Date().toISOString(),
                };
            }
            throw new Error(`Không tìm thấy phiên có ID ${id}`);
        }
    },

    joinQuiz: async (code: string, displayName?: string) => {
        try {
            const response = await axios.post(`${API_URL}/quizzes/join`, { 
                code, 
                displayName 
            });
            
            // Lấy token từ response
            const { token } = response.data.data;
            
            if (token) {
                // Lưu token vào localStorage
                localStorage.setItem('token', token);
                console.log('✅ Đã lưu token:', token);
            } else {
                console.warn('⚠️ Không nhận được token từ server');
            }
            
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi tham gia phòng quiz:', error);
            throw error;
        }
    },
};
