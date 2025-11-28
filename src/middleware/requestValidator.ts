import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../types/index.js';
import { AppLogger } from '../config/logger.js';

/**
 * Validation schemas and rules for different request types
 */
export class RequestValidator {
  /**
   * Validates Twilio webhook payload structure
   */
  public static validateTwilioWebhookPayload(payload: any): void {
    const requiredFields = ['From', 'Body'];
    const missingFields = requiredFields.filter(field => !payload[field]);

    if (missingFields.length > 0) {
      throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate phone number format
    const phoneRegex = /^whatsapp:\+\d{1,15}$/;
    if (!phoneRegex.test(payload.From)) {
      throw new ValidationError('Invalid phone number format. Expected format: whatsapp:+1234567890');
    }

    // Validate message body length and content
    if (typeof payload.Body !== 'string') {
      throw new ValidationError('Message body must be a string');
    }

    if (payload.Body.trim().length === 0) {
      throw new ValidationError('Message body cannot be empty');
    }

    if (payload.Body.length > 1000) {
      throw new ValidationError('Message body too long. Maximum 1000 characters allowed');
    }

    // Validate optional fields if present
    if (payload.MessageSid && typeof payload.MessageSid !== 'string') {
      throw new ValidationError('MessageSid must be a string');
    }

    if (payload.AccountSid && typeof payload.AccountSid !== 'string') {
      throw new ValidationError('AccountSid must be a string');
    }
  }

  /**
   * Validates health check request parameters
   */
  public static validateHealthCheckRequest(query: any): void {
    const allowedParams = ['detailed', 'service', 'timestamp'];
    const invalidParams = Object.keys(query).filter(param => !allowedParams.includes(param));

    if (invalidParams.length > 0) {
      throw new ValidationError(`Invalid query parameters: ${invalidParams.join(', ')}. Allowed: ${allowedParams.join(', ')}`);
    }

    // Validate detailed flag if present
    if (query.detailed && !['true', 'false', '1', '0'].includes(query.detailed)) {
      throw new ValidationError('Detailed parameter must be boolean (true/false)');
    }

    // Validate timestamp format if present
    if (query.timestamp) {
      const timestamp = Date.parse(query.timestamp);
      if (isNaN(timestamp)) {
        throw new ValidationError('Invalid timestamp format. Use ISO 8601 format');
      }
    }
  }

  /**
   * Validates admin API requests
   */
  public static validateAdminRequest(payload: any, requiredFields: string[] = []): void {
    // Validate required fields
    const missingFields = requiredFields.filter(field => !payload[field]);
    if (missingFields.length > 0) {
      throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate field types and constraints
    if (payload.id && (typeof payload.id !== 'number' || payload.id <= 0)) {
      throw new ValidationError('ID must be a positive number');
    }

    if (payload.category && typeof payload.category !== 'string') {
      throw new ValidationError('Category must be a string');
    }

    if (payload.organization && typeof payload.organization !== 'string') {
      throw new ValidationError('Organization must be a string');
    }

    // Validate email format if present
    if (payload.contact_email && !this.isValidEmail(payload.contact_email)) {
      throw new ValidationError('Invalid email format');
    }

    // Validate phone number format if present
    if (payload.contact_phone && !this.isValidPhoneNumber(payload.contact_phone)) {
      throw new ValidationError('Invalid phone number format');
    }

    // Validate boolean fields
    const booleanFields = ['is_urgent', 'is_essential', 'is_active'];
    booleanFields.forEach(field => {
      if (payload[field] !== undefined && typeof payload[field] !== 'boolean') {
        throw new ValidationError(`${field} must be a boolean`);
      }
    });
  }

  /**
   * Validates query parameters for list endpoints
   */
  public static validateListQueryParams(query: any, allowedFilters: string[] = []): void {
    const allowedParams = ['page', 'limit', 'sort', 'order', ...allowedFilters];
    const invalidParams = Object.keys(query).filter(param => !allowedParams.includes(param));

    if (invalidParams.length > 0) {
      throw new ValidationError(`Invalid query parameters: ${invalidParams.join(', ')}. Allowed: ${allowedParams.join(', ')}`);
    }

    // Validate pagination parameters
    if (query.page && (!Number.isInteger(Number(query.page)) || Number(query.page) < 1)) {
      throw new ValidationError('Page must be a positive integer');
    }

    if (query.limit && (!Number.isInteger(Number(query.limit)) || Number(query.limit) < 1 || Number(query.limit) > 100)) {
      throw new ValidationError('Limit must be an integer between 1 and 100');
    }

    // Validate sort order
    if (query.order && !['asc', 'desc'].includes(query.order.toLowerCase())) {
      throw new ValidationError('Order must be either "asc" or "desc"');
    }
  }

  /**
   * Email validation helper
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Phone number validation helper
   */
  private static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }
}

/**
 * Middleware functions for Express
 */
export const validateTwilioWebhook = (req: Request, res: Response, next: NextFunction): void => {
  try {
    AppLogger.debug('Validating Twilio webhook request', {
      body: req.body,
      headers: {
        'user-agent': req.get('User-Agent'),
        'content-type': req.get('Content-Type')
      }
    });

    RequestValidator.validateTwilioWebhookPayload(req.body);

    AppLogger.debug('Twilio webhook validation passed');
    next();
  } catch (error) {
    AppLogger.warn('Twilio webhook validation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      body: req.body,
      ip: req.ip
    });

    if (error instanceof ValidationError) {
      res.status(400).json({
        error: {
          message: error.message,
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(400).json({
        error: {
          message: 'Invalid request payload',
          code: 'INVALID_PAYLOAD',
          timestamp: new Date().toISOString()
        }
      });
    }
  }
};

export const validateHealthCheck = (req: Request, res: Response, next: NextFunction): void => {
  try {
    RequestValidator.validateHealthCheckRequest(req.query);

    AppLogger.debug('Health check validation passed', { query: req.query });
    next();
  } catch (error) {
    AppLogger.warn('Health check validation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      query: req.query
    });

    if (error instanceof ValidationError) {
      res.status(400).json({
        error: {
          message: error.message,
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        }
      });
    } else {
      next(error);
    }
  }
};

export const validateAdminRequest = (requiredFields: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      AppLogger.debug('Validating admin request', {
        method: req.method,
        path: req.path,
        body: req.body
      });

      RequestValidator.validateAdminRequest(req.body, requiredFields);

      AppLogger.debug('Admin request validation passed');
      next();
    } catch (error) {
      AppLogger.warn('Admin request validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        body: req.body,
        user: (req as any).user?.id // Assuming user is attached by auth middleware
      });

      if (error instanceof ValidationError) {
        res.status(400).json({
          error: {
            message: error.message,
            code: 'VALIDATION_ERROR',
            timestamp: new Date().toISOString()
          }
        });
      } else {
        res.status(400).json({
          error: {
            message: 'Invalid request data',
            code: 'INVALID_REQUEST',
            timestamp: new Date().toISOString()
          }
        });
      }
    }
  };
};

export const validateListQuery = (allowedFilters: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      RequestValidator.validateListQueryParams(req.query, allowedFilters);

      AppLogger.debug('List query validation passed', { query: req.query });
      next();
    } catch (error) {
      AppLogger.warn('List query validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        query: req.query
      });

      if (error instanceof ValidationError) {
        res.status(400).json({
          error: {
            message: error.message,
            code: 'VALIDATION_ERROR',
            timestamp: new Date().toISOString()
          }
        });
      } else {
        next(error);
      }
    }
  };
};

/**
 * Generic request validation middleware
 */
export const validateRequest = (schema: {
  body?: any;
  query?: any;
  params?: any;
  headers?: any;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate request body
      if (schema.body) {
        RequestValidator.validateAdminRequest(req.body, Object.keys(schema.body));
      }

      // Validate query parameters
      if (schema.query) {
        RequestValidator.validateListQueryParams(req.query, Object.keys(schema.query));
      }

      // Validate route parameters
      if (schema.params) {
        const missingParams = Object.keys(schema.params).filter(param => !req.params[param]);
        if (missingParams.length > 0) {
          throw new ValidationError(`Missing route parameters: ${missingParams.join(', ')}`);
        }
      }

      AppLogger.debug('Generic request validation passed');
      next();
    } catch (error) {
      AppLogger.warn('Generic request validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.path,
        method: req.method
      });

      if (error instanceof ValidationError) {
        res.status(400).json({
          error: {
            message: error.message,
            code: 'VALIDATION_ERROR',
            timestamp: new Date().toISOString()
          }
        });
      } else {
        res.status(400).json({
          error: {
            message: 'Request validation failed',
            code: 'VALIDATION_FAILED',
            timestamp: new Date().toISOString()
          }
        });
      }
    }
  };
};

/**
 * Content-Type validation middleware
 */
export const validateContentType = (expectedType: string = 'application/json') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentType = req.get('Content-Type');

    if (!contentType || !contentType.includes(expectedType)) {
      AppLogger.warn('Invalid Content-Type header', {
        expected: expectedType,
        actual: contentType,
        path: req.path
      });

      res.status(415).json({
        error: {
          message: `Unsupported Media Type. Expected: ${expectedType}`,
          code: 'UNSUPPORTED_MEDIA_TYPE',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    next();
  };
};

/**
 * Rate limiting validation (basic implementation)
 */
export const validateRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  // This is a basic implementation. In production, use a proper rate limiting library
  // like express-rate-limit
  
  const clientIP = req.ip;
  const path = req.path;

  AppLogger.debug('Rate limit check', { clientIP, path });

  // Add your rate limiting logic here
  // For now, just pass through
  next();
};

export default {
  validateTwilioWebhook,
  validateHealthCheck,
  validateAdminRequest,
  validateListQuery,
  validateRequest,
  validateContentType,
  validateRateLimit,
  RequestValidator
};