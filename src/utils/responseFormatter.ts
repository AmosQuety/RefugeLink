import { BotResponse } from '../types/index.js';
import { QUICK_REPLIES, INTENT_NAMES } from './constants.js';

export class ResponseFormatter {
  public static formatRegistrationResponse(steps: any[], documents: any[], contacts: any[]): BotResponse {
    const stepDescriptions = steps
      .sort((a, b) => a.step_number - b.step_number)
      .map(step => `${step.step_number}. ${step.title}: ${step.description}`)
      .join('\n');

    const documentList = documents
      .map(doc => `• ${doc.document_name}${doc.is_essential ? ' (Essential)' : ''}`)
      .join('\n');

    const message = `I can help with refugee registration. Here's the process:\n\n${stepDescriptions}\n\nRequired Documents:\n${documentList}\n\nWould you like more details about any specific step?`;

    return {
      message,
      quickReplies: QUICK_REPLIES.REGISTRATION
    };
  }

  public static formatFoodResponse(services: any[]): BotResponse {
    const foodServices = services.filter(service => 
      service.category === 'Food' || service.organization.includes('WFP')
    );

    if (foodServices.length === 0) {
      return {
        message: 'Food assistance is primarily provided by the World Food Programme (WFP) to registered refugees in settlements. Please ensure you are registered with OPM to access these services.',
        quickReplies: QUICK_REPLIES.FOOD
      };
    }

    const serviceInfo = foodServices
      .map(service => `• ${service.organization}: ${service.services}${service.location ? ` (${service.location})` : ''}`)
      .join('\n');

    const message = `Food assistance options:\n\n${serviceInfo}\n\nNote: Most food aid requires official registration and is distributed through settlements.`;

    return {
      message,
      quickReplies: QUICK_REPLIES.FOOD
    };
  }

  public static formatHealthcareResponse(services: any[], contacts: any[]): BotResponse {
    const healthServices = services.filter(service => service.category === 'Health');
    const emergencyContacts = contacts.filter(contact => contact.type === 'Emergency' || contact.type === 'Hospital');

    let message = 'Healthcare services available:\n\n';

    if (healthServices.length > 0) {
      message += healthServices
        .map(service => `• ${service.organization}: ${service.services}${service.contact_phone ? ` - ${service.contact_phone}` : ''}`)
        .join('\n');
    }

    if (emergencyContacts.length > 0) {
      message += '\n\nEmergency Contacts:\n';
      message += emergencyContacts
        .map(contact => `• ${contact.entity}: ${contact.phone}${contact.description ? ` - ${contact.description}` : ''}`)
        .join('\n');
    }

    return {
      message,
      quickReplies: QUICK_REPLIES.HEALTHCARE
    };
  }

  public static formatEmergencyContacts(contacts: any[]): BotResponse {
    const urgentContacts = contacts
      .filter(contact => contact.is_urgent || contact.type === 'Emergency')
      .sort((a, b) => (b.is_urgent ? 1 : 0) - (a.is_urgent ? 1 : 0));

    const generalContacts = contacts.filter(contact => !contact.is_urgent && contact.type !== 'Emergency');

    let message = '🚨 **Emergency & Important Contacts**\n\n';

    if (urgentContacts.length > 0) {
      message += '**URGENT CONTACTS:**\n';
      message += urgentContacts
        .map(contact => `• ${contact.entity}: ${contact.phone || contact.email}${contact.description ? ` - ${contact.description}` : ''}`)
        .join('\n');
    }

    if (generalContacts.length > 0) {
      message += '\n\n**OTHER IMPORTANT CONTACTS:**\n';
      message += generalContacts
        .map(contact => `• ${contact.entity}: ${contact.phone || contact.email}${contact.description ? ` - ${contact.description}` : ''}`)
        .join('\n');
    }

    return {
      message,
      quickReplies: ['More Contacts', 'Registration Help', 'Healthcare Info']
    };
  }

  public static formatErrorResponse(error?: Error): BotResponse {
    return {
      message: 'Sorry, I encountered an error while processing your request. Please try again or contact support if the issue persists.'
    };
  }

  public static formatWelcomeResponse(): BotResponse {
    return {
      message: 'Hello! I\'m here to provide information for refugees and displaced people in Mbarara. I can help you find information about registration, food, shelter, healthcare, and emergency contacts. What do you need help with today?',
      quickReplies: ['Registration', 'Food', 'Shelter', 'Healthcare', 'Emergency Contacts']
    };
  }
}