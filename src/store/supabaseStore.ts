import { create } from 'zustand';
import { supabase, Habit, HabitHistory } from '../lib/supabase';

interface SupabaseHabitState {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  fetchHabits: () => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateHabit: (id: string, habit: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  addHabitHistory: (history: Omit<HabitHistory, 'id' | 'created_at'>) => Promise<void>;
  getHabitHistory: (habitId: string) => Promise<HabitHistory[]>;
}

const useSupabaseStore = create<SupabaseHabitState>((set, get) => ({
  habits: [],
  loading: false,
  error: null,

  fetchHabits: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ habits: data || [], loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addHabit: async (habit) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('habits')
        .insert([habit])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({ habits: [data, ...state.habits], loading: false }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateHabit: async (id, habit) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('habits')
        .update(habit)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        habits: state.habits.map((h) => (h.id === id ? data : h)),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteHabit: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('habits').delete().eq('id', id);

      if (error) throw error;
      set((state) => ({
        habits: state.habits.filter((h) => h.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addHabitHistory: async (history) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('habit_history').insert([history]);

      if (error) throw error;
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  getHabitHistory: async (habitId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('habit_history')
        .select('*')
        .eq('habit_id', habitId)
        .order('date', { ascending: false });

      if (error) throw error;
      set({ loading: false });
      return data || [];
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return [];
    }
  },
}));

export default useSupabaseStore; 