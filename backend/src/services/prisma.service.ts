import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

// Create Prisma client instance with error logging
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

// Use global type for PrismaClient to ensure singleton pattern
type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

// Create a global variable for the Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

// Export Prisma client as a singleton
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// Set the Prisma client instance to the global variable in non-production environments
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
