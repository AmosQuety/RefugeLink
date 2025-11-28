// src/config/env.ts

import dotenv from 'dotenv';
dotenv.config();

export class EnvironmentConfig {
  // Node environment
  static readonly nodeEnv = process.env.NODE_ENV || 'development';

  // Server details
  static readonly port = parseInt(process.env.PORT || '3000', 10);
  static readonly baseUrl = process.env.BASE_URL;

  // Supabase Configuration
  static readonly supabaseUrl = process.env.Supabase_Url || '';
  static readonly supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

  // Twilio Configuration
  static readonly twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || '';
  static readonly twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || '';
  static readonly twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || '';

  // Dialogflow
  static readonly dialogflowEnabled =
    process.env.DIALOGFLOW_ENABLED === 'true';

  static readonly dialogflowProjectId =
    process.env.DIALOGFLOW_PROJECT_ID || '';

  // CORS
  static readonly allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['*'];

  // Logging
  static readonly logLevel = process.env.LOG_LEVEL || 'info';

  // Validation
  static validate(): void {
    const errors: string[] = [];

    // Core: Supabase must exist ALWAYS
    if (!this.supabaseUrl) errors.push('SUPABASE_URL is required');
    if (!this.supabaseKey) errors.push('SUPABASE_SERVICE_ROLE_KEY is required');

    // Production-specific checks
    if (this.isProduction()) {
      if (!this.baseUrl) errors.push('BASE_URL is required in production');

      if (this.allowedOrigins.includes('*')) {
        console.warn('⚠️ CORS allows all origins in production — not recommended.');
      }

      // Twilio is optional in dev, REQUIRED in prod
      if (!this.twilioAccountSid) errors.push('TWILIO_ACCOUNT_SID is required in production');
      if (!this.twilioAuthToken) errors.push('TWILIO_AUTH_TOKEN is required in production');
      if (!this.twilioWhatsAppNumber) errors.push('TWILIO_WHATSAPP_NUMBER is required in production');
    }

    if (errors.length > 0) {
      throw new Error(`Environment configuration errors:\n${errors.join('\n')}`);
    }
  }

  static isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  static getSummary(): Record<string, any> {
    return {
      environment: this.nodeEnv,
      supabaseConfigured: !!(this.supabaseUrl && this.supabaseKey),
      twilioConfigured: !!(this.twilioAccountSid && this.twilioAuthToken),
      dialogflowEnabled: this.dialogflowEnabled,
      allowedOrigins: this.allowedOrigins,
    };
  }
}

// Validate immediately
try {
  EnvironmentConfig.validate();
  console.log('✅ Environment configuration validated successfully');
  console.log('📋 Summary:', EnvironmentConfig.getSummary());
} catch (error) {
  console.error('❌ Environment config failed:', error instanceof Error ? error.message : String(error));
  if (EnvironmentConfig.isProduction()) process.exit(1);
}
