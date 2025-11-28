// src/types/index.ts

// Re-export types from database for backward compatibility
export * from './database.js';

// Custom error classes
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class DatabaseError extends Error {
  public code?: string;
  
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
  }
}

export class TwilioError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TwilioError';
  }
}

// Bot response types
export interface BotResponse {
  message: string;
  quickReplies?: string[];
  metadata?: Record<string, any>;
}

export interface WebhookPayload {
  From: string;
  Body: string;
  MessageSid?: string;
  AccountSid?: string;
  NumMedia?: string;
}

export interface HealthCheckResponse {
  status: string;
  service: string;
  timestamp: string;
  environment: string;
  version: string;
  details?: Record<string, any>;
}

// Request types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ListResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Admin types
export interface AdminUserCreate {
  username: string;
  email: string;
  role?: string;
}

export interface AdminUserUpdate {
  username?: string;
  email?: string;
  role?: string;
}

// Service types (already defined in database.ts, but adding specific ones if needed)
export interface ServiceCreate {
  category: string;
  organization: string;
  services: string;
  contact_phone?: string | null;
  contact_email?: string | null;
  location?: string | null;
  notes?: string | null;
}

export interface ServiceUpdate {
  category?: string;
  organization?: string;
  services?: string;
  contact_phone?: string | null;
  contact_email?: string | null;
  location?: string | null;
  notes?: string | null;
}

// Contact types
export interface ContactCreate {
  entity: string;
  phone?: string | null;
  email?: string | null;
  description?: string | null;
  type: string;
  is_urgent?: boolean;
  notes?: string | null;
}

export interface ContactUpdate {
  entity?: string;
  phone?: string | null;
  email?: string | null;
  description?: string | null;
  type?: string;
  is_urgent?: boolean;
  notes?: string | null;
}

// Registration step types
export interface RegistrationStepCreate {
  step_number: number;
  title: string;
  description: string;
  requirements?: string | null;
  estimated_duration?: string | null;
}

export interface RegistrationStepUpdate {
  step_number?: number;
  title?: string;
  description?: string;
  requirements?: string | null;
  estimated_duration?: string | null;
}

// Required document types
export interface RequiredDocumentCreate {
  document_name: string;
  description?: string | null;
  is_essential?: boolean;
  notes?: string | null;
}

export interface RequiredDocumentUpdate {
  document_name?: string;
  description?: string | null;
  is_essential?: boolean;
  notes?: string | null;
}

// Dialogflow types
export interface DialogflowConfig {
  enabled: boolean;
  projectId: string;
  credentials?: string;
}

export interface DialogflowResponse {
  intent: string;
  confidence: number;
  fulfillmentText: string;
  parameters: Record<string, any>;
  allRequiredParamsPresent: boolean;
}

// Twilio types
export interface TwilioMessage {
  body: string;
  from: string;
  to: string;
  messageSid: string;
  numMedia: string;
}

export interface TwilioWebhookValidation {
  isValid: boolean;
  reason?: string;
}

// Logger types
export interface LogMetadata {
  [key: string]: any;
}

export interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  service: string;
  meta?: LogMetadata;
}

// Environment types
export interface EnvironmentSummary {
  environment: string;
  supabaseConfigured: boolean;
  twilioConfigured: boolean;
  dialogflowEnabled: boolean;
  allowedOrigins: string[];
  baseUrl?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    version: string;
    requestId?: string;
  };
}

export interface ErrorResponse {
  error: {
    message: string;
    code: string;
    timestamp: string;
    details?: any;
    path?: string;
  };
}

// Middleware types
export interface RequestWithId extends Request {
  requestId?: string;
}

// Constants for intent names (used in DialogflowService)
export const INTENT_NAMES = {
  FIND_REGISTRATION: 'find.registration',
  FIND_FOOD: 'find.food', 
  FIND_SHELTER: 'find.shelter',
  FIND_HEALTHCARE: 'find.healthcare',
  FIND_EMERGENCY_CONTACTS: 'find.emergency.contacts',
  WELCOME: 'welcome',
  FALLBACK: 'default.fallback'
} as const;

// Utility types
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Type guards
export function isValidationError(error: any): error is ValidationError {
  return error instanceof ValidationError || error?.name === 'ValidationError';
}

export function isNotFoundError(error: any): error is NotFoundError {
  return error instanceof NotFoundError || error?.name === 'NotFoundError';
}

export function isDatabaseError(error: any): error is DatabaseError {
  return error instanceof DatabaseError || error?.name === 'DatabaseError';
}

// Response formatter types
export interface FormattedResponse {
  message: string;
  quickReplies?: string[];
  metadata?: {
    type: string;
    count?: number;
    hasUrgent?: boolean;
  };
}

// Export commonly used types for easier imports
export type {
  Contact,
  Service, 
  RegistrationStep,
  RequiredDocument,
  AdminUser
} from './database.js';