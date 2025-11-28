// src/middleware/requestLogger.ts
import { Request, Response, NextFunction } from 'express';
import { AppLogger } from '../config/logger.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // Generate request ID using timestamp and random number (fallback if crypto is unavailable)
  const requestId = generateRequestId();

  // Attach request ID to request object for use in other middleware
  (req as any).requestId = requestId;

  // Log incoming request
  AppLogger.info('Incoming request', {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
  });

  // Capture response details when request completes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    AppLogger.info('Request completed', {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length') || '0',
    });
  });

  // Capture response errors
  res.on('error', (error) => {
    AppLogger.error('Response error', error, {
      requestId,
      method: req.method,
      path: req.path,
    });
  });

  next();
};

// Helper function to generate request IDs
function generateRequestId(): string {
  try {
    // Try to use crypto if available (Node.js built-in)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback for environments without crypto support
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `req-${timestamp}-${random}`;
  } catch (error) {
    // Ultimate fallback
    return `req-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
}

// Enhanced request logger with additional features
export const detailedRequestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = process.hrtime();
  const requestId = generateRequestId();
  
  (req as any).requestId = requestId;

  // Log detailed request information
  AppLogger.debug('Request details', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    headers: {
      'content-type': req.get('Content-Type'),
      'user-agent': req.get('User-Agent'),
      'accept': req.get('Accept'),
    },
    ip: req.ip,
    ips: req.ips,
    hostname: req.hostname,
  });

  const originalSend = res.send;
  let responseBody: any;

  // Capture response body for logging (in development)
  if (process.env.NODE_ENV === 'development') {
    res.send = function(body: any): any {
      responseBody = body;
      return originalSend.call(this, body);
    };
  }

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = (seconds * 1000 + nanoseconds / 1000000).toFixed(2);
    
    const logData: any = {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    };

    // Only log response body in development for debugging
    if (process.env.NODE_ENV === 'development' && responseBody) {
      try {
        const bodyStr = typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody);
        logData.responseBody = bodyStr.substring(0, 500); // Limit length
      } catch (e) {
        logData.responseBody = '[Unable to stringify]';
      }
    }

    // Different log levels based on status code
    if (res.statusCode >= 400) {
      AppLogger.warn('Request completed with error', logData);
    } else {
      AppLogger.info('Request completed successfully', logData);
    }
  });

  next();
};

// Export both loggers
export default {
  requestLogger,
  detailedRequestLogger,
};