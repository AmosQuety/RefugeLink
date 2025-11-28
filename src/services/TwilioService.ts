// src/services/TwilioService.ts
import twilio from 'twilio';
import { EnvironmentConfig } from '../config/env.js';
import { AppLogger } from '../config/logger.js';
import { BotResponse, TwilioError } from '../types/index.js';

export class TwilioService {
  private client: twilio.Twilio;
  private isConfigured: boolean;

  constructor() {
    // Check if Twilio is properly configured
    this.isConfigured = !!(EnvironmentConfig.twilioAccountSid && EnvironmentConfig.twilioAuthToken);
    
    if (this.isConfigured) {
      this.client = twilio(
        EnvironmentConfig.twilioAccountSid,
        EnvironmentConfig.twilioAuthToken
      );
      AppLogger.info('Twilio service initialized successfully');
    } else {
      AppLogger.warn('Twilio service not configured - missing account SID or auth token');
      // @ts-ignore - client will be undefined but we'll handle it in methods
      this.client = null;
    }
  }

  public async sendWhatsAppMessage(to: string, message: string): Promise<void> {
    if (!this.isConfigured) {
      AppLogger.error('Twilio not configured - cannot send message');
      throw new TwilioError('Twilio service is not configured');
    }

    if (!EnvironmentConfig.twilioWhatsAppNumber) {
      AppLogger.error('Twilio WhatsApp number not configured');
      throw new TwilioError('Twilio WhatsApp number is not configured');
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: `whatsapp:${EnvironmentConfig.twilioWhatsAppNumber}`,
        to: `whatsapp:${to}`
      });

      AppLogger.info('WhatsApp message sent successfully', {
        to: this.maskPhoneNumber(to),
        messageLength: message.length,
        messageSid: result.sid,
        status: result.status
      });

    } catch (error) {
      const twilioError = error as any;
      AppLogger.error('Failed to send WhatsApp message', twilioError, {
        to: this.maskPhoneNumber(to),
        errorCode: twilioError.code,
        status: twilioError.status
      });
      
      throw new TwilioError(`Failed to send WhatsApp message: ${twilioError.message}`);
    }
  }

  /**
   * Validates Twilio webhook signature for security
   * This should be used in production environments
   */
  public validateWebhookSignature(url: string, body: any, signature: string): boolean {
    if (!this.isConfigured) {
      AppLogger.warn('Twilio not configured - skipping webhook signature validation');
      return false;
    }

    if (!signature) {
      AppLogger.warn('Missing Twilio signature header');
      return false;
    }

    try {
      const authToken = EnvironmentConfig.twilioAuthToken;
      const isValid = twilio.validateRequest(
        authToken,
        signature,
        url,
        body
      );

      if (!isValid) {
        AppLogger.warn('Invalid Twilio webhook signature', {
          url,
          signature: this.maskSignature(signature)
        });
      }

      return isValid;
    } catch (error) {
      AppLogger.error('Error validating Twilio webhook signature', error as Error, {
        url
      });
      return false;
    }
  }

  /**
   * Get Twilio client status and configuration
   */
  public getStatus(): { configured: boolean; hasWhatsAppNumber: boolean } {
    return {
      configured: this.isConfigured,
      hasWhatsAppNumber: !!EnvironmentConfig.twilioWhatsAppNumber
    };
  }

  /**
   * Test Twilio connectivity by making a simple API call
   */
  public async testConnection(): Promise<boolean> {
    if (!this.isConfigured) {
      return false;
    }

    try {
      // Make a simple API call to test connectivity
      await this.client.api.accounts(EnvironmentConfig.twilioAccountSid).fetch();
      AppLogger.info('Twilio connection test successful');
      return true;
    } catch (error) {
      AppLogger.error('Twilio connection test failed', error as Error);
      return false;
    }
  }

  /**
   * Format phone number for WhatsApp
   */
  public formatWhatsAppNumber(phoneNumber: string): string {
    // Ensure phone number starts with + and country code
    let formatted = phoneNumber.trim();
    
    if (!formatted.startsWith('whatsapp:')) {
      formatted = `whatsapp:${formatted}`;
    }
    
    if (!formatted.includes('+') && formatted.length > 10) {
      // Add + if missing (assuming international format)
      formatted = formatted.replace('whatsapp:', 'whatsapp:+');
    }
    
    return formatted;
  }

  private maskPhoneNumber(phone: string): string {
    // Mask phone number for logging privacy
    if (!phone || phone.length < 4) return '***';
    
    try {
      // Extract just the number part if it's in whatsapp:+123456 format
      const numberPart = phone.replace('whatsapp:', '');
      if (numberPart.length < 4) return '***';
      
      return `whatsapp:${numberPart.slice(0, 2)}***${numberPart.slice(-2)}`;
    } catch {
      return '***';
    }
  }

  private maskSignature(signature: string): string {
    // Mask signature for logging
    if (!signature || signature.length < 8) return '***';
    return `${signature.slice(0, 4)}...${signature.slice(-4)}`;
  }
}

// Export singleton instance
let twilioServiceInstance: TwilioService | null = null;

export const createTwilioService = (): TwilioService => {
  if (!twilioServiceInstance) {
    twilioServiceInstance = new TwilioService();
  }
  return twilioServiceInstance;
};

export default TwilioService;