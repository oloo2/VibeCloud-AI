import { supabase, type QuizQuestion, type StudyTopic, type Flashcard, type UserProgress, type UserStudy, getSessionId } from '@/lib/supabase';

export async function fetchStudyTopics(): Promise<StudyTopic[]> {
  const { data, error } = await supabase
    .from('study_topics')
    .select('*')
    .order('order_index', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchQuizQuestions(topic?: string): Promise<QuizQuestion[]> {
  let query = supabase.from('quiz_questions').select('*');
  if (topic && topic !== 'all') {
    query = query.eq('topic', topic);
  }
  const { data, error } = await query.order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchFlashcards(topic?: string): Promise<Flashcard[]> {
  let query = supabase.from('flashcards').select('*');
  if (topic && topic !== 'all') {
    query = query.eq('topic', topic);
  }
  const { data, error } = await query.order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchUserProgress(): Promise<UserProgress[]> {
  const sessionId = getSessionId();
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchUserStudies(): Promise<UserStudy[]> {
  const sessionId = getSessionId();
  const { data, error } = await supabase
    .from('user_studies')
    .select('*')
    .eq('session_id', sessionId)
    .order('studied_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveProgress(
  mode: string,
  topic: string,
  score: number,
  total: number,
  answers: { question_id: string; selected_index: number; correct: boolean }[],
  durationSeconds: number
): Promise<void> {
  const sessionId = getSessionId();
  const { error } = await supabase.from('user_progress').insert({
    session_id: sessionId,
    mode,
    topic,
    score,
    total,
    answers,
    duration_seconds: durationSeconds,
  });
  if (error) throw error;
}

export async function markTopicStudied(topicId: string): Promise<void> {
  const sessionId = getSessionId();
  const { data: existing } = await supabase
    .from('user_studies')
    .select('id')
    .eq('session_id', sessionId)
    .eq('topic_id', topicId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('user_studies')
      .update({ studied_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('user_studies').insert({
      session_id: sessionId,
      topic_id: topicId,
    });
    if (error) throw error;
  }
}
