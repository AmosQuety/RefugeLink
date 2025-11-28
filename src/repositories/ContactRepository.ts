// src/repositories/ContactRepository.ts
import { supabase } from '../config/database/supabaseClient.js';
import { Contact } from '../types/database.js';
import { AppLogger } from '../config/logger.js';
import { NotFoundError } from '../types/index.js';

export class ContactRepository {
  constructor() {}

  public async getContactsByType(type: string): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('type', type)
      .order('is_urgent', { ascending: false })
      .order('entity', { ascending: true });

    if (error) {
      AppLogger.error('Failed to fetch contacts by type', error, { type });
      throw new Error(`Database error: ${error.message}`);
    }

    const contacts = data || [];
    AppLogger.debug(`Fetched ${contacts.length} contacts of type: ${type}`);
    return contacts;
  }

  public async getUrgentContacts(): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('is_urgent', true)
      .order('type', { ascending: true })
      .order('entity', { ascending: true });

    if (error) {
      AppLogger.error('Failed to fetch urgent contacts', error);
      throw new Error(`Database error: ${error.message}`);
    }

    const contacts = data || [];
    AppLogger.debug(`Fetched ${contacts.length} urgent contacts`);
    return contacts;
  }

  public async getAllContacts(): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('is_urgent', { ascending: false })
      .order('type', { ascending: true })
      .order('entity', { ascending: true });

    if (error) {
      AppLogger.error('Failed to fetch all contacts', error);
      throw new Error(`Database error: ${error.message}`);
    }

    const contacts = data || [];
    AppLogger.debug(`Fetched ${contacts.length} total contacts`);
    return contacts;
  }

  public async getContactById(id: number): Promise<Contact | null> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .limit(1)
      .single();

    if (error) {
      // Handle "not found" gracefully
      if (error.code === 'PGRST116') {
        return null;
      }
      AppLogger.error('Failed to fetch contact by ID', error, { id });
      throw new Error(`Database error: ${error.message}`);
    }

    AppLogger.debug(`Fetched contact by ID: ${id}`);
    return data;
  }

  public async createContact(contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at'>): Promise<Contact> {
    const { entity, phone, email, description, type, is_urgent, notes } = contactData;
    const payload = {
      entity,
      phone,
      email,
      description,
      type,
      is_urgent,
      notes,
    };

    const { data, error } = await supabase
      .from('contacts')
      .insert(payload)
      .select()
      .single();

    if (error) {
      AppLogger.error('Failed to create contact', error, { entity, type });
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundError('Contact');
    }

    AppLogger.info('Created new contact', { id: data.id, entity });
    return data;
  }
}