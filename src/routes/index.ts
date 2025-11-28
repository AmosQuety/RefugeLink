import { Router, Request, Response } from 'express';
import { createWebhookRoutes } from './webhook.routes.js';
import { WebhookController } from '../controllers/WebhookController.js';

export const createRoutes = (webhookController: WebhookController): Router => {
  const router = Router();

  // Mount webhook routes
  const webhookRoutes = createWebhookRoutes(webhookController);
  router.use('/webhook', webhookRoutes);

  // Root endpoint
  router.get('/', (_req: Request, res: Response) => {
    res.json({
      message: 'Refugee WhatsApp Bot API',
      version: '1.0.0',
      endpoints: {
        webhook: '/webhook/twilio/whatsapp',
        health: '/webhook/health'
      }
    });
  });

  // 404 handler
  router.use('*', (_req: Request, res: Response) => {
    res.status(404).json({
      error: {
        message: 'Endpoint not found',
        code: 404
      }
    });
  });

  return router;
};