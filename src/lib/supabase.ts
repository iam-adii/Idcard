import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vbjreqsaqbkfrghodsle.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_secret_n3MtJY0jnbyTAYuBWxRS4Q_PdFfYdqj';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false, // No authentication required
        autoRefreshToken: false,
    },
});

// Database types
export interface TemplateRow {
    id: string;
    name: string;
    category: string;
    front_image_url: string;
    back_image_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface IDCardRow {
    id: string;
    employee_id: string;
    employee_name: string | null;
    designation: string | null;
    date_of_birth: string | null;
    blood_group: string | null;
    emergency_contact: string | null;
    identification_marks: string | null;
    photo_url: string | null;
    template_id: string | null;
    created_at: string;
    updated_at: string;
}
