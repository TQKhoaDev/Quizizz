import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sessionApi, type Session, type CreateSessionRequest } from "../api/sessionApi";
import { quizApi, type Quiz } from "@/features/Quiz/api/quizApi";

export function useSessionManagement() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [isQuizzesLoading, setIsQuizzesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  
  // State cho form tạo session mới
  const [newSession, setNewSession] = useState<CreateSessionRequest>({
    quizId: ""
  });
  
  // Lấy danh sách session và quiz khi component được mount
  useEffect(() => {
    fetchSessions();
    fetchQuizzes();
  }, []);
  
  // Hàm lấy danh sách session
  const fetchSessions = async () => {
    setIsSessionLoading(true);
    setError(null);
    
    try {
      const data = await sessionApi.getSessions();
      setSessions(data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách session:", err);
      setError("Không thể lấy danh sách session. Vui lòng thử lại sau.");
    } finally {
      setIsSessionLoading(false);
    }
  };

  // Hàm lấy danh sách quiz
  const fetchQuizzes = async () => {
    setIsQuizzesLoading(true);
    
    try {
      const data = await quizApi.getQuizzes();
      setQuizzes(data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách quiz:", err);
      // Không set error để không ảnh hưởng đến việc hiển thị danh sách session
    } finally {
      setIsQuizzesLoading(false);
    }
  };

  // Hàm xử lý thay đổi quiz được chọn
  const handleQuizChange = (quizId: string) => {
    setNewSession({
      ...newSession,
      quizId
    });
  };
  
  // Hàm xử lý tạo session mới
  const handleCreateSession = async () => {
    if (!newSession.quizId) {
      alert("Vui lòng chọn một bài kiểm tra");
      return;
    }
    
    try {
      await sessionApi.createSession(newSession);
      
      // Đóng dialog và làm mới danh sách session
      setIsCreateSessionOpen(false);
      fetchSessions();
      
      // Reset form
      setNewSession({
        quizId: ""
      });
    } catch (err) {
      console.error("Lỗi khi tạo session:", err);
    }
  };
  
  // Xử lý các hành động trên session
  const handleStartSession = async (sessionId: string) => {
    try {
      await sessionApi.startSession(sessionId);
      fetchSessions();
    } catch (err) {
      console.error("Lỗi khi bắt đầu session:", err);
    }
  };
  
  const handleEndSession = async (sessionId: string) => {
    try {
      await sessionApi.endSession(sessionId);
      fetchSessions();
    } catch (err) {
      console.error("Lỗi khi kết thúc session:", err);
    }
  };
  
  const handleCancelSession = async (sessionId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy phiên này?")) {
      try {
        await sessionApi.cancelSession(sessionId);
        fetchSessions();
      } catch (err) {
        console.error("Lỗi khi hủy session:", err);
      }
    }
  };
  
  const handleViewSession = (sessionId: string) => {
    navigate(`/sessions/${sessionId}`);
  };

  const openCreateSessionDialog = () => setIsCreateSessionOpen(true);
  const closeCreateSessionDialog = () => setIsCreateSessionOpen(false);

  return {
    // State
    sessions,
    quizzes,
    isSessionLoading,
    isQuizzesLoading,
    error,
    isCreateSessionOpen,
    newSession,
    
    // Actions
    fetchSessions,
    fetchQuizzes,
    handleQuizChange,
    handleCreateSession,
    handleStartSession,
    handleEndSession,
    handleCancelSession,
    handleViewSession,
    openCreateSessionDialog,
    closeCreateSessionDialog,
    setIsCreateSessionOpen
  };
} 