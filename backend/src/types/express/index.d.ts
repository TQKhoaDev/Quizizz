import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface User {
      id: string;
      email?: string | null;
      fullName: string;
      role: UserRole;
      isGuest: boolean;
    }
  }
} 