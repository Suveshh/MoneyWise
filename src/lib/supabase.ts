import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'expert';
  avatar_url?: string;
  level: number;
  xp: number;
  streak: number;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  xp_reward: number;
  created_at: string;
}

export interface GameSession {
  id: string;
  user_id: string;
  game_id: string;
  score: number;
  xp_earned: number;
  completed_at: string;
  game_data: any;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  author_id: string;
  tags: string[];
  votes: number;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface Answer {
  id: string;
  question_id: string;
  author_id: string;
  content: string;
  votes: number;
  is_best_answer: boolean;
  created_at: string;
}

export interface MentorSession {
  id: string;
  mentor_id: string;
  student_id: string;
  scheduled_at: string;
  duration: number;
  price: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  meeting_url?: string;
  created_at: string;
}