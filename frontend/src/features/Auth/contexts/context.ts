import { createContext } from 'react';
import type { User } from '../api/authApi';

// Định nghĩa kiểu dữ liệu cho AuthContext
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Tạo context với giá trị mặc định
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: () => {},
}); 