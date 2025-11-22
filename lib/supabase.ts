import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DbTournament {
  id: string;
  name: string;
  number_of_courts: number;
  status: 'setup' | 'in-progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface DbPlayer {
  id: string;
  tournament_id: string;
  name: string;
  created_at: string;
}

export interface DbTeam {
  id: string;
  tournament_id: string;
  player1_id: string;
  player2_id: string;
  created_at: string;
}

export interface DbMatch {
  id: string;
  tournament_id: string;
  team1_id: string;
  team2_id: string;
  team1_score: number | null;
  team2_score: number | null;
  status: 'pending' | 'in-progress' | 'completed';
  court_number: number | null;
  created_at: string;
  updated_at: string;
}
