// src/config/database/supabaseClient.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EnvironmentConfig } from '../env';

if (!EnvironmentConfig.supabaseUrl) {
  throw new Error('❌ Missing SUPABASE_URL in environment variables.');
}

if (!EnvironmentConfig.supabaseKey) {
  throw new Error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in environment variables.');
}

// Create a single Supabase client instance
export const supabase: SupabaseClient = createClient(
  EnvironmentConfig.supabaseUrl,
  EnvironmentConfig.supabaseKey,
  {
    auth: {
      persistSession: false,       // backend best practice
      autoRefreshToken: false,
    }
  }
);
