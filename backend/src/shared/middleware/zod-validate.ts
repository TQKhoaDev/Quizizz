import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Middleware validate dữ liệu với Zod schema
 */
export const validate = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message
        }));
        
        res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Lỗi xác thực dữ liệu',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };
}; 