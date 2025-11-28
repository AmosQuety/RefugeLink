// src/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'http';
import { EnvironmentConfig } from './config/env.js';
import { AppLogger } from './config/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

// Import repositories
import { ServiceRepository } from './repositories/ServiceRepository.js';
import { ContactRepository } from './repositories/ContactRepository.js';
import { RegistrationStepRepository } from './repositories/RegistrationStepRepository.js';

// Import services
import { createDialogflowService } from './services/dialogflowService.js';
import { MessageService } from './services/MessageService.js';
import { createTwilioService } from './services/TwilioService.js';

// Import controllers and routes
import { WebhookController } from './controllers/WebhookController.js';
import { createRoutes } from './routes/index.js';

class Application {
  public app: express.Application;
  private server: Server | null = null;

  constructor() {
    this.app = express();
    this.setupMiddleware();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
          },
        },
        crossOriginEmbedderPolicy: false,
      })
    );

    // Request logging - ADDED
    this.app.use(requestLogger);

    // CORS configuration
    const corsOptions = {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin) {
          // Allow requests with no origin (like mobile apps or curl requests)
          callback(null, true);
          return;
        }

        const allowedOrigins = EnvironmentConfig.allowedOrigins || [];

        if (allowedOrigins.includes('*')) {
          if (EnvironmentConfig.isProduction()) {
            AppLogger.warn('CORS allows all origins in production - security risk');
          }
          callback(null, true);
        } else if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          AppLogger.warn('CORS blocked request', { origin, allowedOrigins });
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Twilio-Signature'],
      maxAge: 86400, // 24 hours
    };

    this.app.use(cors(corsOptions));

    // Body parsing middleware with size limits
    this.app.use(express.json({ 
      limit: '10kb',
      verify: (req: any, res, buf) => {
        // Store raw body for Twilio signature validation
        req.rawBody = buf;
      }
    }));
    this.app.use(express.urlencoded({ 
      extended: true, 
      limit: '10kb',
      verify: (req: any, res, buf) => {
        // Store raw body for Twilio signature validation
        if (!req.rawBody) {
          req.rawBody = buf;
        }
      }
    }));

    // Trust proxy
    this.app.set('trust proxy', 1);

    // Health check endpoint (early, before auth)
    this.app.get('/health', (req, res) => {
      const healthStatus = {
        status: 'OK',
        service: 'Refugee WhatsApp Bot Backend',
        timestamp: new Date().toISOString(),
        environment: EnvironmentConfig.nodeEnv,
        version: process.env.npm_package_version || '1.0.0',
        supabase: EnvironmentConfig.supabaseUrl ? 'Connected' : 'Not Configured',
        twilio: EnvironmentConfig.twilioAccountSid ? 'Connected' : 'Not Configured',
        dialogflow: EnvironmentConfig.dialogflowEnabled ? 'Enabled' : 'Disabled',
      };

      res.json(healthStatus);
    });
  }

  private async setupRoutes(): Promise<void> {
    try {
      AppLogger.info('Initializing repositories and services...');

      // Initialize repositories
      const serviceRepo = new ServiceRepository();
      const contactRepo = new ContactRepository();
      const registrationRepo = new RegistrationStepRepository();
      AppLogger.info('✅ Repositories initialized');

      // Initialize services
      const dialogflowService = createDialogflowService(serviceRepo, contactRepo, registrationRepo);
      const messageService = new MessageService(dialogflowService);
      const twilioService = createTwilioService();
      AppLogger.info('✅ Services initialized');

      // Test Twilio connection if configured
      if (EnvironmentConfig.twilioAccountSid) {
        try {
          const twilioStatus = await twilioService.testConnection();
          AppLogger.info(`Twilio connection test: ${twilioStatus ? 'SUCCESS' : 'FAILED'}`);
        } catch (error) {
          AppLogger.error('Twilio connection test failed', error as Error);
        }
      }

      // Initialize controller
      const webhookController = new WebhookController(messageService);
      AppLogger.info('✅ Controller initialized');

      // Setup routes
      const routes = createRoutes(webhookController);
      this.app.use(routes);
      AppLogger.info('✅ Routes configured');

    } catch (error) {
      AppLogger.error('❌ Failed to setup application routes', error as Error);
      throw error;
    }
  }

  public async start(): Promise<void> {
    try {
      // Validate environment configuration
      EnvironmentConfig.validate();
      
      // Setup routes
      await this.setupRoutes();

      // Setup error handling LAST (after routes)
      this.setupErrorHandling();

      const port = EnvironmentConfig.port;

      this.server = this.app.listen(port, () => {
        AppLogger.info(`🚀 Server running on port ${port}`);
        AppLogger.info(`🌍 Environment: ${EnvironmentConfig.nodeEnv}`);
        AppLogger.info(`📱 Twilio webhook: ${this.getBaseUrl()}/webhook/twilio/whatsapp`);
        AppLogger.info(`❤️  Health check: ${this.getBaseUrl()}/health`);
        AppLogger.info(`🔧 Supabase: ${EnvironmentConfig.supabaseUrl ? 'Configured' : 'Not Configured'}`);
        AppLogger.info(`💬 Twilio: ${EnvironmentConfig.twilioAccountSid ? 'Configured' : 'Not Configured'}`);
        AppLogger.info(`🤖 Dialogflow: ${EnvironmentConfig.dialogflowEnabled ? 'Enabled' : 'Disabled'}`);
      });

      this.setupGracefulShutdown();

    } catch (error) {
      AppLogger.error('Failed to start application', error as Error);
      process.exit(1);
    }
  }

  private setupErrorHandling(): void {
    // 404 handler - must be after all routes
    this.app.use('*', (req, res) => {
      AppLogger.warn('404 - Endpoint not found', {
        method: req.method,
        path: req.originalUrl,
        ip: req.ip
      });

      res.status(404).json({
        error: {
          message: 'Endpoint not found',
          code: 'NOT_FOUND',
          path: req.originalUrl,
          timestamp: new Date().toISOString()
        }
      });
    });

    // Global error handler - must be last
    this.app.use(errorHandler);
  }

  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      AppLogger.info(`Received ${signal}, starting graceful shutdown...`);

      const forceShutdownTimeout = setTimeout(() => {
        AppLogger.error('Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);

      forceShutdownTimeout.unref();

      if (this.server) {
        this.server.close((err) => {
          clearTimeout(forceShutdownTimeout);
          
          if (err) {
            AppLogger.error('Error during server shutdown', err);
            process.exit(1);
          }

          AppLogger.info('✅ Server closed gracefully');
          AppLogger.info('✅ Graceful shutdown completed');
          process.exit(0);
        });
      } else {
        clearTimeout(forceShutdownTimeout);
        process.exit(0);
      }
    };

    // Handle graceful shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      AppLogger.error('Uncaught exception', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      AppLogger.error('Unhandled promise rejection', reason as Error, { promise });
      gracefulShutdown('UNHANDLED_REJECTION');
    });
  }

  private getBaseUrl(): string {
    const port = EnvironmentConfig.port;
    if (EnvironmentConfig.isProduction() && EnvironmentConfig.baseUrl) {
      return EnvironmentConfig.baseUrl;
    }
    return `http://localhost:${port}`;
  }

  /**
   * Get Express app instance for testing
   */
  public getApp(): express.Application {
    return this.app;
  }

  /**
   * Stop the server (for testing)
   */
  public async stop(): Promise<void> {
    if (this.server) {
      return new Promise((resolve) => {
        this.server!.close(() => {
          AppLogger.info('Server stopped');
          resolve();
        });
      });
    }
  }
}

// Start the application
const app = new Application();
app.start().catch((error) => {
  AppLogger.error('Failed to start application', error);
  process.exit(1);
});

export default app;