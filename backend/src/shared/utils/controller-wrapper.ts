import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wrapper cho controller để xử lý lỗi TypeScript với Express
 */
export const controllerWrapper = (
    controller: (req: Request, res: Response, next: NextFunction) => any
  ): RequestHandler => {
    return async (req, res, next) => {
      try {
        await controller(req, res, next);
        // Không return kết quả, đảm bảo wrapper trả về void
      } catch (error) {
        next(error);
      }
    };
  };