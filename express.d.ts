import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; username: string }; // Define the shape of the user object
    }
  }
}
