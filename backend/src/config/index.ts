import dotenv from 'dotenv';
import ms, { StringValue } from 'ms';

// Tải biến môi trường từ file .env
dotenv.config();

const rawExpire = process.env.JWT_EXPIRES_IN as StringValue;

const config = {
  app: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || '',
    jwtExpiresIn: Math.floor(ms(rawExpire) / 1000),
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  storage: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  azure: {
    storageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
    blobContainerName: process.env.AZURE_BLOB_CONTAINER || '',
  },
};

export default config;
