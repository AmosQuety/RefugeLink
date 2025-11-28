import { Request, Response } from 'express';
import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';
import { MessageService } from '../services/MessageService.js';
import { AppLogger } from '../config/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export class WebhookController {
  constructor(private messageService: MessageService) {}

  public handleWhatsAppWebhook = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userMessage = req.body.Body;
    const userPhone = req.body.From;

    AppLogger.info('Received WhatsApp webhook', {
      userPhone: this.maskPhoneNumber(userPhone),
      message: userMessage
    });

    // Process the message
    const botResponse = await this.messageService.processMessage(userMessage, userPhone);

    // Format Twilio response
    const twiml = new MessagingResponse();
    twiml.message(botResponse.message);

    // Add quick replies if available (WhatsApp quick replies format)
    if (botResponse.quickReplies && botResponse.quickReplies.length > 0) {
      // Note: WhatsApp quick replies have specific format requirements
      // This is a simplified implementation
      AppLogger.debug('Quick replies available', { 
        quickReplies: botResponse.quickReplies 
      });
    }

    res.type('text/xml');
    res.send(twiml.toString());

    AppLogger.info('Webhook response sent', {
      userPhone: this.maskPhoneNumber(userPhone),
      responseLength: botResponse.message.length
    });
  });

  public handleHealthCheck = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const healthStatus = {
      status: 'OK',
      service: 'Refugee WhatsApp Bot Backend',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };

    res.json(healthStatus);
  });

  private maskPhoneNumber(phone: string): string {
    if (phone.length < 4) return '***';
    return `${phone.slice(0, 2)}***${phone.slice(-2)}`;
  }
}