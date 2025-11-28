export const INTENT_NAMES = {
  FIND_REGISTRATION: 'find_registration',
  FIND_FOOD: 'find_food',
  FIND_SHELTER: 'find_shelter',
  FIND_HEALTHCARE: 'find_healthcare',
  FIND_EMERGENCY_CONTACTS: 'find_emergency_contacts',
  WELCOME: 'welcome',
  FALLBACK: 'Default Fallback Intent'
} as const;

export const CATEGORIES = {
  FOOD: 'Food',
  HEALTH: 'Health',
  SHELTER: 'Shelter',
  PROTECTION: 'Protection',
  LIVELIHOODS: 'Livelihoods'
} as const;

export const CONTACT_TYPES = {
  EMERGENCY: 'Emergency',
  GENERAL: 'General',
  FRAUD: 'Fraud',
  HOSPITAL: 'Hospital',
  SETTLEMENT: 'Settlement'
} as const;

export const BOT_MESSAGES = {
  WELCOME: 'Hello! I\'m here to provide information for refugees and displaced people in Mbarara. I can help you find information about registration, food, shelter, healthcare, and emergency contacts. What do you need help with today?',
  FALLBACK: 'I\'m sorry, I didn\'t quite understand that. I can help you with registration, food, shelter, healthcare, and emergency contacts. Please tell me what you need.',
  ERROR: 'Sorry, I encountered an error while processing your request. Please try again.',
  ESCALATION: 'For detailed support with this specific issue, I recommend you contact {organization} directly at {contact}.',
  GOODBYE: 'Thank you for using our service. Stay safe!'
} as const;

export const QUICK_REPLIES = {
  REGISTRATION: ['Contact Details', 'Required Documents', 'Registration Steps'],
  FOOD: ['Settlement Info', 'WFP Contacts', 'Distribution Points'],
  HEALTHCARE: ['Emergency Number', 'Hospital Info', 'Settlement Clinics'],
  SHELTER: ['Settlement Info', 'WFP Contacts', 'Distribution Points'],
  GENERAL: ['More Info', 'Contact Support', 'Main Menu']
} as const;

export const MESSAGE_TYPES = {
  TEXT: 'text',
  QUICK_REPLY: 'quick_reply',
  ERROR: 'error'
} as const;

export const SERVICE_CATEGORIES = {
  FOOD: 'Food',
  SHELTER: 'Shelter',
  HEALTH: 'Health',
  REGISTRATION: 'Registration',
  EMERGENCY: 'Emergency'
} as const;


