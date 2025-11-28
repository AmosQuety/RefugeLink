import winston from 'winston';
import { EnvironmentConfig } from './env.js';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const developmentFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.colorize(),
  winston.format.simple()
);

export const logger = winston.createLogger({
  level: EnvironmentConfig.logLevel,
  format: EnvironmentConfig.isProduction() ? logFormat : developmentFormat,
  defaultMeta: { service: 'refugee-bot-backend' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
});

export class AppLogger {
  public static info(message: string, meta?: any): void {
    logger.info(message, meta);
  }

  public static error(message: string, error?: Error, meta?: any): void {
    logger.error(message, { error: error?.message, stack: error?.stack, ...meta });
  }

  public static warn(message: string, meta?: any): void {
    logger.warn(message, meta);
  }

  public static debug(message: string, meta?: any): void {
    logger.debug(message, meta);
  }
}