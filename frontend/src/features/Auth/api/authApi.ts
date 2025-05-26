// src/features/auth/api/authApi.ts
import axios from 'axios';

// Cấu hình base URL cho API
const API_URL = import.meta.env.VITE_API_BACKEND ;

// Định nghĩa các kiểu dữ liệu
export interface User {
  id: string;
  email: string;
  username: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Tạo đối tượng authApi với các phương thức gọi API
export const authApi = {
  /**
   * Đăng nhập người dùng
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data.data;
  },
  
  /**
   * Đăng xuất người dùng
   */
  logout: async (): Promise<void> => {
    await axios.post(`${API_URL}/auth/logout`);
  },
  
  /**
   * Lấy thông tin người dùng hiện tại
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }
};