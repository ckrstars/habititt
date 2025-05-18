import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  date: string;
  count: number;
  completed: boolean;
  time_of_completion?: string;
  created_at: string;
}; 