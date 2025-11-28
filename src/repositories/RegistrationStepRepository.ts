// src/repositories/RegistrationStepRepository.ts
import { supabase } from '../config/database/supabaseClient.js';
import { RegistrationStep, RequiredDocument } from '../types/database.js';
import { AppLogger } from '../config/logger.js';

export class RegistrationStepRepository {
  constructor() {}

  public async getAllSteps(): Promise<RegistrationStep[]> {
    const { data, error } = await supabase
      .from('registration_steps')
      .select('*')
      .order('step_number', { ascending: true });

    if (error) {
      AppLogger.error('Failed to fetch registration steps', error);
      throw new Error(`Database error: ${error.message}`);
    }

    const steps = data || [];
    AppLogger.debug(`Fetched ${steps.length} registration steps`);
    return steps;
  }

  public async getStepByNumber(stepNumber: number): Promise<RegistrationStep | null> {
    const { data, error } = await supabase
      .from('registration_steps')
      .select('*')
      .eq('step_number', stepNumber)
      .limit(1)
      .single();

    if (error) {
      // Handle "not found" gracefully
      if (error.code === 'PGRST116') {
        return null;
      }
      AppLogger.error('Failed to fetch registration step by number', error, { stepNumber });
      throw new Error(`Database error: ${error.message}`);
    }

    AppLogger.debug(`Fetched registration step: ${stepNumber}`);
    return data;
  }

  public async getRequiredDocuments(): Promise<RequiredDocument[]> {
    const { data, error } = await supabase
      .from('required_documents')
      .select('*')
      .order('is_essential', { ascending: false })
      .order('document_name', { ascending: true });

    if (error) {
      AppLogger.error('Failed to fetch required documents', error);
      throw new Error(`Database error: ${error.message}`);
    }

    const docs = data || [];
    AppLogger.debug(`Fetched ${docs.length} required documents`);
    return docs;
  }

  public async getEssentialDocuments(): Promise<RequiredDocument[]> {
    const { data, error } = await supabase
      .from('required_documents')
      .select('*')
      .eq('is_essential', true)
      .order('document_name', { ascending: true });

    if (error) {
      AppLogger.error('Failed to fetch essential documents', error);
      throw new Error(`Database error: ${error.message}`);
    }

    const docs = data || [];
    AppLogger.debug(`Fetched ${docs.length} essential documents`);
    return docs;
  }
}