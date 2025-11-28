// src/routes/webhook.routes.ts
import { Router } from 'express';
import { WebhookController } from '../controllers/WebhookController.js';
import { 
  validateTwilioWebhook, 
  validateHealthCheck 
} from '../middleware/requestValidator.js';
import { twilioWebhookValidator } from '../middleware/twilioValidator.js';

export const createWebhookRoutes = (webhookController: WebhookController): Router => {
  const router = Router();

  // Twilio WhatsApp webhook endpoint
  router.post(
    '/twilio/whatsapp',
    twilioWebhookValidator,        // Signature validation first
    validateTwilioWebhook,         // Then payload validation
    webhookController.handleWhatsAppWebhook
  );

  // Health check endpoint
  router.get(
    '/health',
    validateHealthCheck,
    webhookController.handleHealthCheck
  );

  return router;
};