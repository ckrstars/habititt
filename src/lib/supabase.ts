import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Types for our database tables
export type Habit = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  target: number;
  frequency: 'daily' | 'weekly' | 'custom';
  category: 'health' | 'productivity' | 'learning' | 'mindfulness' | 'finance' | 'social' | 'custom';
  custom_days?: number[];
  progress: number;
  streak: number;
  reminder_time?: string;
  reminder_enabled: boolean;
  count_type: 'completion' | 'count';
  count_unit: string;
  created_at: string;
  updated_at: string;
};

export type HabitHistory = {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  completed: boolean;
  count: number;
  streak: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}; 