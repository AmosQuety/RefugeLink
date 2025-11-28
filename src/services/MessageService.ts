import { BotResponse } from '../types/index.js';
import { DialogflowService } from './dialogflowService.js';
import { AppLogger } from '../config/logger.js';

export class MessageService {
  constructor(private dialogflowService: DialogflowService) {}

  public async processMessage(userMessage: string, userPhone: string): Promise<BotResponse> {
    try {
      AppLogger.info('Processing user message', { 
        userPhone: this.maskPhoneNumber(userPhone), 
        messageLength: userMessage.length 
      });

      // Basic message validation
      if (!userMessage || userMessage.trim().length === 0) {
        return {
          message: 'Please send a message with your question. I can help with registration, food, shelter, healthcare, and emergency contacts.'
        };
      }

      if (userMessage.length > 500) {
        return {
          message: 'Your message is too long. Please keep your questions brief and focused on one topic at a time.'
        };
      }

      // Generate session ID from user phone number for context
      const sessionId = this.generateSessionId(userPhone);
      
      // Get response from Dialogflow
      const response = await this.dialogflowService.getResponse(userMessage, sessionId);

      AppLogger.info('Message processed successfully', {
        userPhone: this.maskPhoneNumber(userPhone),
        responseLength: response.message.length
      });

      return response;

    } catch (error) {
      AppLogger.error('Message processing failed', error as Error, { 
        userPhone: this.maskPhoneNumber(userPhone),
        message: userMessage 
      });
      
      return {
        message: 'Sorry, I encountered an error while processing your message. Please try again in a moment.'
      };
    }
  }

  private generateSessionId(userPhone: string): string {
    // Create a consistent session ID from phone number for context maintenance
    return `user-${Buffer.from(userPhone).toString('base64').slice(0, 16)}`;
  }

  private maskPhoneNumber(phone: string): string {
    // Mask phone number for logging privacy
    if (phone.length < 4) return '***';
    return `${phone.slice(0, 2)}***${phone.slice(-2)}`;
  }
}