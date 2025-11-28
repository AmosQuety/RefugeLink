import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../types/index.js';
import { AppLogger } from '../config/logger.js';

export const validateTwilioWebhook = (req: Request, res: Response, next: NextFunction): void => {
  const { From, Body } = req.body;

  if (!From) {
    AppLogger.warn('Twilio webhook missing From field', { body: req.body });
    throw new ValidationError('Missing required field: From');
  }

  if (!Body) {
    AppLogger.warn('Twilio webhook missing Body field', { from: From });
    throw new ValidationError('Missing required field: Body');
  }

  // Basic phone number validation
  const phoneRegex = /^whatsapp:\+\d{1,15}$/;
  if (!phoneRegex.test(From)) {
    AppLogger.warn('Invalid phone number format in webhook', { from: From });
    throw new ValidationError('Invalid phone number format');
  }

  next();
};

export const validateHealthCheck = (req: Request, res: Response, next: NextFunction): void => {
  // Simple health check validation - can be expanded
  next();
};

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof ValidationError) {
    AppLogger.error('Validation error occurred', err, { path: req.path });
    res.status(400).json({ error: err.message });
  } else {
    AppLogger.error('Unexpected error occurred', err, { path: req.path });
    res.status(500).json({ error: 'Internal Server Error' });
  }
  next();
};

export const asyncHandler = (fn: Function) => (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};