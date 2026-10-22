import { useState, useMemo, useCallback } from 'react';
import { Brain, ArrowLeft, ArrowRight, CheckCircle2, XCircle, Lightbulb, MapPin, RotateCcw, Trophy, Clock } from 'lucide-react';
import type { QuizQuestion } from '@/lib/supabase';
import { REGION_LABELS, DIFFICULTY_LABELS, TOPIC_CATEGORIES } from '@/lib/supabase';
import Disclaimer from './Disclaimer';

interface QuizViewProps {
  questions: QuizQuestion[];
  loading: boolean;
  onComplete: (score: number, total: number, answers: { question_id: string; selected_index: number; correct: boolean }[], durationSeconds: number, topic: string) => void;
}

type Phase = 'select' | 'quiz' | 'results';

export default function QuizView({ questions, loading, onComplete }: QuizViewProps) {
  const [phase, setPhase] = useState<Phase>('select');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ question_id: string; selected_index: number; correct: boolean }[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  const filteredQuestions = useMemo(() => {
    let qs = questions;
    if (selectedTopic !== 'all') {
      qs = qs.filter((q) => q.topic === selectedTopic);
    }
    // Shuffle and limit
    const shuffled = [...qs].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(questionCount, shuffled.length));
  }, [questions, selectedTopic, questionCount]);

  const startQuiz = useCallback(() => {
    setPhase('quiz');
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedOption(null);
    setShowFeedback(false);
    setStartTime(Date.now());
  }, []);

  const selectAnswer = (index: number) => {
    if (showFeedback) return;
    setSelectedOption(index);
    setShowFeedback(true);
    const q = filteredQuestions[currentIndex];
    const correct = index === q.correct_index;
    setAnswers((prev) => [...prev, { question_id: q.id, selected_index: index, correct }]);
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= filteredQuestions.length) {
      const score = answers.filter((a) => a.correct).length;
      const duration = Math.round((Date.now() - startTime) / 1000);
      onComplete(score, filteredQuestions.length, answers, duration, selectedTopic);
      setPhase('results');
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    }
  };

  const restart = () => {
    setPhase('select');
    setSelectedOption(null);
    setShowFeedback(false);
  };

  // Selection Phase
  if (phase === 'select') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Practice Quiz</h1>
          <p className="text-slate-500">Test your knowledge with original scenario-based questions</p>
        </div>

        {loading ? (
          <div className="animate-pulse rounded-2xl bg-slate-100 h-64" />
        ) : (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-6">
            {/* Topic selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Choose a topic</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedTopic('all')}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    selectedTopic === 'all'
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  All Topics
                </button>
                {TOPIC_CATEGORIES.map((topic) => {
                  const count = questions.filter((q) => q.topic === topic).length;
                  return (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        selectedTopic === topic
                          ? 'bg-sky-500 text-white shadow-md'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {topic}
                      <span className="block text-xs opacity-70 mt-0.5">{count} questions</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question count */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Number of questions</label>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map((n) => (
                  <button
                    key={n}
                    onClick={() => setQuestionCount(n)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      questionCount === n
                        ? 'bg-sky-500 text-white shadow-md'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startQuiz}
              disabled={filteredQuestions.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-sky-500/25 transition-all disabled:opacity-50"
            >
              Start Quiz
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 rounded-xl bg-sky-50 border border-sky-100 p-4">
              <Brain className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600">
                Each question includes a detailed explanation and an African-context analogy to help the concept stick. Take your time — there's no timer in practice mode.
              </p>
            </div>
          </div>
        )}

        <Disclaimer />
      </div>
    );
  }

  // Results Phase
  if (phase === 'results') {
    const score = answers.filter((a) => a.correct).length;
    const total = filteredQuestions.length;
    const percentage = Math.round((score / total) * 100);
    const duration = Math.round((Date.now() - startTime) / 1000);

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
          <div className="relative">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 items-center justify-center shadow-lg mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{percentage}%</h1>
            <p className="text-slate-400 text-sm">
              You scored <span className="text-sky-400 font-semibold">{score}</span> out of <span className="text-sky-400 font-semibold">{total}</span>
            </p>
            <div className="inline-flex items-center gap-1.5 mt-3 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              Completed in {Math.floor(duration / 60)}m {duration % 60}s
            </div>
          </div>
        </div>

        {/* Answer review */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-800">Review Your Answers</h2>
          {filteredQuestions.map((q, i) => {
            const answer = answers[i];
            const correct = answer?.correct;
            return (
              <div key={q.id} className="rounded-xl bg-white border border-slate-200 p-5">
                <div className="flex items-start gap-3">
                  {correct ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800 mb-2">{q.question_text}</p>
                    {!correct && (
                      <>
                        <p className="text-xs text-rose-600 mb-1">Your answer: {q.options[answer?.selected_index ?? 0]}</p>
                        <p className="text-xs text-emerald-600 mb-2">Correct answer: {q.options[q.correct_index]}</p>
                      </>
                    )}
                    <p className="text-xs text-slate-500 leading-relaxed mt-2">{q.explanation}</p>
                    {q.african_analogy && (
                      <div className="mt-3 flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-100 p-3">
                        <Lightbulb className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600 italic">{q.african_analogy}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={restart}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-sky-500/25 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Take Another Quiz
        </button>

        <Disclaimer />
      </div>
    );
  }

  // Quiz Phase
  const currentQ = filteredQuestions[currentIndex];
  if (!currentQ) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-500">No questions available for this topic. Try a different selection.</p>
        <button onClick={restart} className="mt-4 px-6 py-3 rounded-xl bg-sky-500 text-white font-semibold">Back to Quiz Setup</button>
      </div>
    );
  }

  const diff = DIFFICULTY_LABELS[currentQ.difficulty] || DIFFICULTY_LABELS.beginner;
  const region = REGION_LABELS[currentQ.region] || REGION_LABELS.general;
  const progress = ((currentIndex + (showFeedback ? 1 : 0)) / filteredQuestions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <button onClick={restart} className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600">
            <ArrowLeft className="w-4 h-4" /> Exit
          </button>
          <span className="text-sm font-medium text-slate-500">
            Question {currentIndex + 1} of {filteredQuestions.length}
          </span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question card */}
      <div key={currentIndex} className="rounded-2xl bg-white border border-slate-200 p-6 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${diff.color}`}>{diff.label}</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">{currentQ.topic}</span>
        </div>

        <p className="text-base sm:text-lg font-semibold text-slate-800 leading-relaxed mb-5">{currentQ.question_text}</p>

        <div className="space-y-2.5">
          {currentQ.options.map((option, i) => {
            const isSelected = selectedOption === i;
            const isCorrect = i === currentQ.correct_index;
            let style = 'bg-slate-50 border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 text-slate-700';
            if (showFeedback) {
              if (isCorrect) {
                style = 'bg-emerald-50 border-emerald-300 text-emerald-900';
              } else if (isSelected) {
                style = 'bg-rose-50 border-rose-300 text-rose-900';
              } else {
                style = 'bg-slate-50 border-slate-200 text-slate-400';
              }
            }

            return (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                disabled={showFeedback}
                className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${style}`}
              >
                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  showFeedback && isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' :
                  showFeedback && isSelected ? 'bg-rose-500 border-rose-500 text-white' :
                  'border-slate-300 text-slate-500'
                }`}>
                  {showFeedback && isCorrect ? <CheckCircle2 className="w-4 h-4" /> :
                   showFeedback && isSelected ? <XCircle className="w-4 h-4" /> :
                   String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm sm:text-base">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className="mt-5 space-y-3 animate-fade-in-up">
            <div className={`rounded-xl p-4 border ${
              selectedOption === currentQ.correct_index
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-rose-50 border-rose-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {selectedOption === currentQ.correct_index ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600" />
                )}
                <p className={`font-semibold text-sm ${
                  selectedOption === currentQ.correct_index ? 'text-emerald-800' : 'text-rose-800'
                }`}>
                  {selectedOption === currentQ.correct_index ? 'Correct!' : 'Not quite right'}
                </p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{currentQ.explanation}</p>
            </div>

            {currentQ.african_analogy && (
              <div className="rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-700">African Context Analogy</span>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="w-3 h-3" /> {region.emoji} {region.label}
                  </span>
                </div>
                <p className="text-sm text-slate-600 italic leading-relaxed">"{currentQ.african_analogy}"</p>
              </div>
            )}

            <button
              onClick={nextQuestion}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-sky-500/25 transition-all"
            >
              {currentIndex + 1 >= filteredQuestions.length ? 'See Results' : 'Next Question'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <Disclaimer />
    </div>
  );
}
