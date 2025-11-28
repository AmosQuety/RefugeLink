import { AppError } from ".";

// types/errors.ts - NEW FILE
export class DatabaseError extends AppError {
  constructor(message: string, public originalError?: Error) {
    super(message, 500);
    this.name = 'DatabaseError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string) {
    super(`${service} Error: ${message}`, 502);
    this.name = 'ExternalServiceError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super('Too many requests', 429);
    this.name = 'RateLimitError';
  }
}