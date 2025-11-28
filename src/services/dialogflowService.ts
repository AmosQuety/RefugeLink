import { SessionsClient } from '@google-cloud/dialogflow';
import { EnvironmentConfig } from '../config/env.js';
import { AppLogger } from '../config/logger.js';
import { BotResponse } from '../types/index.js';
import { ResponseFormatter } from '../utils/responseFormatter.js';
import { ServiceRepository } from '../repositories/ServiceRepository.js';
import { ContactRepository } from '../repositories/ContactRepository.js';
import { RegistrationStepRepository } from '../repositories/RegistrationStepRepository.js';
import { INTENT_NAMES } from '../utils/constants.js';

export class DialogflowService {
  private sessionsClient: SessionsClient | null = null;
  private projectId: string | null = null;
  private serviceRepo: ServiceRepository;
  private contactRepo: ContactRepository;
  private registrationRepo: RegistrationStepRepository;
  private isEnabled: boolean;

  constructor(
    serviceRepo: ServiceRepository,
    contactRepo: ContactRepository,
    registrationRepo: RegistrationStepRepository
  ) {
    this.serviceRepo = serviceRepo;
    this.contactRepo = contactRepo;
    this.registrationRepo = registrationRepo;
    this.isEnabled = EnvironmentConfig.dialogflowEnabled;

    if (this.isEnabled && EnvironmentConfig.dialogflowProjectId) {
      try {
        this.sessionsClient = new SessionsClient();
        this.projectId = EnvironmentConfig.dialogflowProjectId;
        AppLogger.info('Dialogflow service initialized successfully');
      } catch (error) {
        AppLogger.error('Failed to initialize Dialogflow client', error as Error);
        this.isEnabled = false;
      }
    } else {
      AppLogger.warn('Dialogflow is disabled. Using built-in response logic.');
      this.isEnabled = false;
    }
  }

  public async getResponse(message: string, sessionId: string = 'default-session'): Promise<BotResponse> {
    try {
      // If Dialogflow is disabled, use built-in logic
      if (!this.isEnabled) {
        return await this.handleMessageWithBuiltInLogic(message);
      }

      // Use Dialogflow for intent detection
      return await this.handleMessageWithDialogflow(message, sessionId);

    } catch (error) {
      AppLogger.error('Error in getResponse', error as Error, { message, sessionId });
      
      // Fallback to built-in logic on error
      return await this.handleMessageWithBuiltInLogic(message);
    }
  }

  private async handleMessageWithDialogflow(message: string, sessionId: string): Promise<BotResponse> {
    if (!this.sessionsClient || !this.projectId) {
      throw new Error('Dialogflow client not initialized');
    }

    const sessionPath = this.sessionsClient.projectAgentSessionPath(this.projectId, sessionId);
    
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode: 'en',
        },
      },
    };

    AppLogger.debug('Sending request to Dialogflow', { message, sessionId });

    const [response] = await this.sessionsClient.detectIntent(request);
    
    if (!response.queryResult) {
      throw new Error('No response from Dialogflow');
    }

    const intent = response.queryResult.intent?.displayName;
    const parameters = response.queryResult.parameters;
    const fulfillmentText = response.queryResult.fulfillmentText;

    AppLogger.debug('Received Dialogflow response', { 
      intent, 
      parameters: JSON.stringify(parameters),
      fulfillmentText 
    });

    // Handle specific intents with custom logic
    if (intent && this.shouldUseCustomLogic(intent)) {
      return await this.handleIntentWithCustomLogic(intent, parameters);
    }

    // Use Dialogflow's default response
    return {
      message: fulfillmentText || 'I apologize, but I could not process your request.'
    };
  }

  private async handleMessageWithBuiltInLogic(message: string): Promise<BotResponse> {
    const lowerMessage = message.toLowerCase().trim();

    // Simple keyword-based intent detection
    if (lowerMessage.includes('register') || lowerMessage.includes('registration') || lowerMessage.includes('opm')) {
      return await this.handleRegistrationIntent();
    } else if (lowerMessage.includes('food') || lowerMessage.includes('hungry') || lowerMessage.includes('eat')) {
      return await this.handleFoodIntent();
    } else if (lowerMessage.includes('shelter') || lowerMessage.includes('place to stay') || lowerMessage.includes('sleep')) {
      return await this.handleShelterIntent();
    } else if (lowerMessage.includes('health') || lowerMessage.includes('hospital') || lowerMessage.includes('doctor') || lowerMessage.includes('sick')) {
      return await this.handleHealthcareIntent();
    } else if (lowerMessage.includes('emergency') || lowerMessage.includes('help') || lowerMessage.includes('contact')) {
      return await this.handleEmergencyContactsIntent();
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('start')) {
      return ResponseFormatter.formatWelcomeResponse();
    } else {
      return {
        message: "I'm here to help with registration, food, shelter, healthcare, and emergency contacts for refugees in Mbarara. What specific information do you need?"
      };
    }
  }

  private shouldUseCustomLogic(intent: string): boolean {
    const customIntents: string[] = [
      INTENT_NAMES.FIND_REGISTRATION,
      INTENT_NAMES.FIND_FOOD,
      INTENT_NAMES.FIND_SHELTER,
      INTENT_NAMES.FIND_HEALTHCARE,
      INTENT_NAMES.FIND_EMERGENCY_CONTACTS
    ];
    return customIntents.includes(intent);
  }

  private async handleIntentWithCustomLogic(intent: string, parameters: any): Promise<BotResponse> {
    try {
      switch (intent) {
        case INTENT_NAMES.FIND_REGISTRATION:
          return await this.handleRegistrationIntent();
        
        case INTENT_NAMES.FIND_FOOD:
          return await this.handleFoodIntent();
        
        case INTENT_NAMES.FIND_SHELTER:
          return await this.handleShelterIntent();
        
        case INTENT_NAMES.FIND_HEALTHCARE:
          return await this.handleHealthcareIntent();
        
        case INTENT_NAMES.FIND_EMERGENCY_CONTACTS:
          return await this.handleEmergencyContactsIntent();
        
        default:
          return {
            message: 'I can help you with registration, food, shelter, healthcare, and emergency contacts. What specific information do you need?'
          };
      }
    } catch (error) {
      AppLogger.error('Error in custom intent handling', error as Error, { intent, parameters });
      return ResponseFormatter.formatErrorResponse(error as Error);
    }
  }

  private async handleRegistrationIntent(): Promise<BotResponse> {
    const [steps, documents, contacts] = await Promise.all([
      this.registrationRepo.getAllSteps(),
      this.registrationRepo.getRequiredDocuments(),
      this.contactRepo.getContactsByType('General')
    ]);

    return ResponseFormatter.formatRegistrationResponse(steps, documents, contacts);
  }

  private async handleFoodIntent(): Promise<BotResponse> {
    const services = await this.serviceRepo.getServicesByCategory('Food');
    return ResponseFormatter.formatFoodResponse(services);
  }

  private async handleShelterIntent(): Promise<BotResponse> {
    const services = await this.serviceRepo.getServicesByCategory('Shelter');
    
    if (services.length === 0) {
      return {
        message: 'Shelter assistance is arranged through the official registration process with OPM. You need to report to the OPM Refugee Desk to be assigned a place in a settlement. Would you like their contact information?',
        quickReplies: ['OPM Contact', 'Registration Info', 'Main Menu']
      };
    }

    const serviceInfo = services
      .map(service => `• ${service.organization}: ${service.services}${service.location ? ` (${service.location})` : ''}`)
      .join('\n');

    return {
      message: `Shelter assistance options:\n\n${serviceInfo}\n\nNote: Most shelter assistance requires official registration with OPM.`,
      quickReplies: ['OPM Contact', 'Registration Steps', 'More Info']
    };
  }

  private async handleHealthcareIntent(): Promise<BotResponse> {
    const [services, contacts] = await Promise.all([
      this.serviceRepo.getServicesByCategory('Health'),
      this.contactRepo.getContactsByType('Hospital')
    ]);

    return ResponseFormatter.formatHealthcareResponse(services, contacts);
  }

  private async handleEmergencyContactsIntent(): Promise<BotResponse> {
    const contacts = await this.contactRepo.getAllContacts();
    return ResponseFormatter.formatEmergencyContacts(contacts);
  }
}

// Export singleton instance factory
let dialogflowServiceInstance: DialogflowService | null = null;

export const createDialogflowService = (
  serviceRepo: ServiceRepository,
  contactRepo: ContactRepository,
  registrationRepo: RegistrationStepRepository
): DialogflowService => {
  if (!dialogflowServiceInstance) {
    dialogflowServiceInstance = new DialogflowService(serviceRepo, contactRepo, registrationRepo);
  }
  return dialogflowServiceInstance;
};

export default DialogflowService;





