// src/repositories/ServiceRepository.ts
import { supabase } from '../config/database/supabaseClient.js';
import { Service } from '../types/database.js';
import { AppLogger } from '../config/logger.js';
import { NotFoundError } from '../types/index.js';

export class ServiceRepository {
  constructor() {}

  public async getServicesByCategory(category: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('category', category)
      .order('organization', { ascending: true });

    if (error) {
      AppLogger.error('Failed to fetch services by category', error, { category });
      throw new Error(`Database error: ${error.message}`);
    }

    const services = data || [];
    AppLogger.debug(`Fetched ${services.length} services for category: ${category}`);
    return services;
  }

  public async getAllServices(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('category', { ascending: true })
      .order('organization', { ascending: true });

    if (error) {
      AppLogger.error('Failed to fetch all services', error);
      throw new Error(`Database error: ${error.message}`);
    }

    const services = data || [];
    AppLogger.debug(`Fetched ${services.length} total services`);
    return services;
  }

  public async getServiceById(id: number): Promise<Service | null> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .limit(1)
      .single();

    if (error) {
      // Handle "not found" gracefully
      if (error.code === 'PGRST116') {
        return null;
      }
      AppLogger.error('Failed to fetch service by ID', error, { id });
      throw new Error(`Database error: ${error.message}`);
    }

    AppLogger.debug(`Fetched service by ID: ${id}`);
    return data;
  }

  public async getServicesByOrganization(organization: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .ilike('organization', `%${organization}%`)
      .order('category', { ascending: true });

    if (error) {
      AppLogger.error('Failed to fetch services by organization', error, { organization });
      throw new Error(`Database error: ${error.message}`);
    }

    const services = data || [];
    AppLogger.debug(`Fetched ${services.length} services for organization: ${organization}`);
    return services;
  }

  public async createService(serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> {
    const { category, organization, services, contact_phone, contact_email, location, notes } = serviceData;
    const payload = {
      category,
      organization,
      services,
      contact_phone,
      contact_email,
      location,
      notes,
    };

    const { data, error } = await supabase
      .from('services')
      .insert(payload)
      .select()
      .single();

    if (error) {
      AppLogger.error('Failed to create service', error, { organization, category });
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundError('Service');
    }

    AppLogger.info('Created new service', { id: data.id, organization });
    return data;
  }
}