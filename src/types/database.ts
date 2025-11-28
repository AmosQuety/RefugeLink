// src/types/database.ts
export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: number
          username: string
          email: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          username: string
          email: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          username?: string
          email?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: number
          entity: string
          phone: string | null
          email: string | null
          description: string | null
          type: string
          is_urgent: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          entity: string
          phone?: string | null
          email?: string | null
          description?: string | null
          type: string
          is_urgent?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          entity?: string
          phone?: string | null
          email?: string | null
          description?: string | null
          type?: string
          is_urgent?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: number
          category: string
          organization: string
          services: string
          contact_phone: string | null
          contact_email: string | null
          location: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          category: string
          organization: string
          services: string
          contact_phone?: string | null
          contact_email?: string | null
          location?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          category?: string
          organization?: string
          services?: string
          contact_phone?: string | null
          contact_email?: string | null
          location?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      registration_steps: {
        Row: {
          id: number
          step_number: number
          title: string
          description: string
          requirements: string | null
          estimated_duration: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          step_number: number
          title: string
          description: string
          requirements?: string | null
          estimated_duration?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          step_number?: number
          title?: string
          description?: string
          requirements?: string | null
          estimated_duration?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      required_documents: {
        Row: {
          id: number
          document_name: string
          description: string | null
          is_essential: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          document_name: string
          description?: string | null
          is_essential?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          document_name?: string
          description?: string | null
          is_essential?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Export type aliases for easier use
export type Contact = Database['public']['Tables']['contacts']['Row'];
export type Service = Database['public']['Tables']['services']['Row'];
export type RegistrationStep = Database['public']['Tables']['registration_steps']['Row'];
export type RequiredDocument = Database['public']['Tables']['required_documents']['Row'];
export type AdminUser = Database['public']['Tables']['admin_users']['Row'];