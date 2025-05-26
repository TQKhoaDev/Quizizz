import { useContext } from 'react';
import { AuthContext } from '../contexts/context';

/**
 * Custom hook để sử dụng AuthContext
 * Cung cấp truy cập đến trạng thái xác thực và các phương thức liên quan
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  
  return context;
}; 