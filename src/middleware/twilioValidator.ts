import { Request, Response, NextFunction } from 'express';
import twilio from 'twilio';
import { EnvironmentConfig } from '../config/env.js';
import { AppLogger } from '../config/logger.js';

/**
 * Validates Twilio webhook requests by verifying the X-Twilio-Signature header
 * This prevents unauthorized requests from hitting your webhook endpoint
 */
export const twilioWebhookValidator = (req: Request, res: Response, next: NextFunction): void => {
  // Skip validation in development for easier testing
  if (!EnvironmentConfig.isProduction()) {
    AppLogger.debug('Skipping Twilio signature validation in development mode');
    next();
    return;
  }

  try {
    const signature = req.headers['x-twilio-signature'] as string;
    
    if (!signature) {
      AppLogger.warn('Missing Twilio signature header', { 
        ip: req.ip,
        path: req.path 
      });
      res.status(403).json({
        error: {
          message: 'Forbidden: Missing signature',
          code: 'MISSING_SIGNATURE'
        }
      });
      return;
    }

    // Construct the full URL that Twilio used to make the request
    // IMPORTANT: Twilio validates against the exact URL it called
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const url = `${protocol}://${host}${req.originalUrl}`;

    AppLogger.debug('Validating Twilio signature', { 
      url,
      hasSignature: !!signature,
      contentType: req.get('Content-Type')
    });

    // Get the auth token from environment
    const authToken = EnvironmentConfig.twilioAuthToken;
    
    if (!authToken) {
      AppLogger.error('Twilio auth token not configured');
      res.status(500).json({
        error: {
          message: 'Server configuration error',
          code: 'CONFIG_ERROR'
        }
      });
      return;
    }

    // Validate the request signature
    const isValid = twilio.validateRequest(
      authToken,
      signature,
      url,
      req.body
    );

    if (!isValid) {
      AppLogger.warn('Invalid Twilio webhook signature', { 
        ip: req.ip,
        url,
        bodyKeys: Object.keys(req.body)
      });
      
      res.status(403).json({
        error: {
          message: 'Forbidden: Invalid signature',
          code: 'INVALID_SIGNATURE'
        }
      });
      return;
    }

    AppLogger.debug('Twilio signature validation successful');
    next();

  } catch (error) {
    AppLogger.error('Error during Twilio signature validation', error as Error, {
      ip: req.ip,
      path: req.path
    });
    
    res.status(500).json({
      error: {
        message: 'Error validating request',
        code: 'VALIDATION_ERROR'
      }
    });
  }
};

/**
 * Alternative validator for testing - validates basic Twilio payload structure
 * Use this only in development/testing environments
 */
export const twilioWebhookValidatorBasic = (req: Request, res: Response, next: NextFunction): void => {
  const requiredFields = ['From', 'Body', 'MessageSid'];
  const missingFields = requiredFields.filter(field => !req.body[field]);

  if (missingFields.length > 0) {
    AppLogger.warn('Invalid Twilio webhook payload', { 
      missingFields,
      receivedFields: Object.keys(req.body)
    });
    
    res.status(400).json({
      error: {
        message: `Missing required fields: ${missingFields.join(', ')}`,
        code: 'INVALID_PAYLOAD'
      }
    });
    return;
  }

  next();
};