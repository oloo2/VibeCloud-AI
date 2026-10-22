import { useState, useEffect, useCallback } from 'react';
import Sidebar, { type View } from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import StudyView from '@/components/StudyView';
import QuizView from '@/components/QuizView';
import FlashcardsView from '@/components/FlashcardsView';
import ExamView from '@/components/ExamView';
import ProgressView from '@/components/ProgressView';
import type { StudyTopic, QuizQuestion, Flashcard, UserProgress, UserStudy } from '@/lib/supabase';
import {
  fetchStudyTopics,
  fetchQuizQuestions,
  fetchFlashcards,
  fetchUserProgress,
  fetchUserStudies,
  saveProgress,
  markTopicStudied,
} from '@/lib/api';

export default function App() {
  const [view, setView] = useState<View>('dashboard');

  // Data
  const [studyTopics, setStudyTopics] = useState<StudyTopic[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [studies, setStudies] = useState<UserStudy[]>([]);

  // Loading states
  const [loadingContent, setLoadingContent] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(true);

  // Load content data once
  useEffect(() => {
    Promise.all([fetchStudyTopics(), fetchQuizQuestions(), fetchFlashcards()])
      .then(([topics, questions, cards]) => {
        setStudyTopics(topics);
        setQuizQuestions(questions);
        setFlashcards(cards);
      })
      .catch((err) => console.error('Failed to load content:', err))
      .finally(() => setLoadingContent(false));
  }, []);

  // Load progress data
  const loadProgress = useCallback(() => {
    Promise.all([fetchUserProgress(), fetchUserStudies()])
      .then(([prog, stud]) => {
        setProgress(prog);
        setStudies(stud);
      })
      .catch((err) => console.error('Failed to load progress:', err))
      .finally(() => setLoadingProgress(false));
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const handleNavigate = (newView: View) => {
    setView(newView);
  };

  const handleQuizComplete = useCallback(
    (score: number, total: number, answers: { question_id: string; selected_index: number; correct: boolean }[], durationSeconds: number, topic: string) => {
      saveProgress('quiz', topic, score, total, answers, durationSeconds)
        .then(() => loadProgress())
        .catch((err) => console.error('Failed to save quiz progress:', err));
    },
    [loadProgress]
  );

  const handleExamComplete = useCallback(
    (score: number, total: number, answers: { question_id: string; selected_index: number; correct: boolean }[], durationSeconds: number, topic: string) => {
      saveProgress('exam', topic, score, total, answers, durationSeconds)
        .then(() => loadProgress())
        .catch((err) => console.error('Failed to save exam progress:', err));
    },
    [loadProgress]
  );

  const handleTopicStudied = useCallback(
    (topicId: string) => {
      markTopicStudied(topicId)
        .then(() => loadProgress())
        .catch((err) => console.error('Failed to mark topic as studied:', err));
    },
    [loadProgress]
  );

  const studiedTopicIds = new Set(studies.map((s) => s.topic_id));

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar currentView={view} onNavigate={handleNavigate} />

      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        {view === 'dashboard' && (
          <Dashboard
            onNavigate={handleNavigate}
            studyTopics={studyTopics}
            progress={progress}
            studies={studies}
            loading={loadingProgress}
          />
        )}
        {view === 'study' && (
          <StudyView
            topics={studyTopics}
            loading={loadingContent}
            onTopicStudied={handleTopicStudied}
            studiedTopicIds={studiedTopicIds}
          />
        )}
        {view === 'quiz' && (
          <QuizView questions={quizQuestions} loading={loadingContent} onComplete={handleQuizComplete} />
        )}
        {view === 'flashcards' && (
          <FlashcardsView flashcards={flashcards} loading={loadingContent} />
        )}
        {view === 'exam' && (
          <ExamView questions={quizQuestions} loading={loadingContent} onComplete={handleExamComplete} />
        )}
        {view === 'progress' && (
          <ProgressView
            progress={progress}
            studies={studies}
            studyTopics={studyTopics}
            loading={loadingProgress}
          />
        )}
      </main>
    </div>
  );
}
