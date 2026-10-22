import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface QuizQuestion {
  id: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  question_text: string;
  options: string[];
  correct_index: number;
  explanation: string;
  african_analogy: string;
  region: string;
  created_at: string;
}

export interface StudyTopic {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: { heading: string; body: string }[];
  key_terms: { term: string; definition: string }[];
  african_analogy: string;
  region: string;
  icon_name: string;
  order_index: number;
}

export interface Flashcard {
  id: string;
  topic: string;
  front: string;
  back: string;
  african_analogy: string;
  difficulty: string;
  created_at: string;
}

export interface UserProgress {
  id: string;
  session_id: string;
  mode: string;
  topic: string;
  score: number;
  total: number;
  answers: { question_id: string; selected_index: number; correct: boolean }[];
  duration_seconds: number;
  created_at: string;
}

export interface UserStudy {
  id: string;
  session_id: string;
  topic_id: string;
  studied_at: string;
}

export const SESSION_ID_KEY = 'vibecloud_session_id';

export function getSessionId(): string {
  let id = localStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

export const TOPIC_CATEGORIES = [
  'Cloud Concepts',
  'Core Azure Services',
  'Security and Compliance',
  'Azure Pricing and Support',
] as const;

export const REGION_LABELS: Record<string, { label: string; emoji: string }> = {
  east: { label: 'East Africa', emoji: '🇰🇪' },
  west: { label: 'West Africa', emoji: '🇳🇬' },
  south: { label: 'South Africa', emoji: '🇿🇦' },
  general: { label: 'Pan-African', emoji: '🌍' },
};

export const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Beginner', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  intermediate: { label: 'Intermediate', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  advanced: { label: 'Advanced', color: 'text-rose-700 bg-rose-50 border-rose-200' },
};
