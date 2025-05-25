/**
 * Tạo mã code ngẫu nhiên với độ dài cho trước
 * @param length Độ dài của mã code
 * @returns Mã code ngẫu nhiên
 */
export function generateRandomCode(length: number): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Loại bỏ các ký tự dễ nhầm lẫn như I, O, 0, 1
    let result = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars.charAt(randomIndex);
    }
    
    return result;
  }