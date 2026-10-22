import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Trophy, Clock, AlertCircle, FileCheck } from 'lucide-react';
import type { QuizQuestion } from '@/lib/supabase';
import Disclaimer from './Disclaimer';

interface ExamViewProps {
  questions: QuizQuestion[];
  loading: boolean;
  onComplete: (score: number, total: number, answers: { question_id: string; selected_index: number; correct: boolean }[], durationSeconds: number, topic: string) => void;
}

const EXAM_DURATION = 45 * 60; // 45 minutes
const EXAM_QUESTION_COUNT = 25;

type Phase = 'intro' | 'exam' | 'results';

export default function ExamView({ questions, loading, onComplete }: ExamViewProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [examQuestions, setExamQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [startTime, setStartTime] = useState(0);

  const startExam = useCallback(() => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, Math.min(EXAM_QUESTION_COUNT, questions.length));
    setExamQuestions(shuffled);
    setCurrentIndex(0);
    setAnswers(new Map());
    setTimeLeft(EXAM_DURATION);
    setStartTime(Date.now());
    setPhase('exam');
  }, [questions]);

  // Timer
  useEffect(() => {
    if (phase !== 'exam') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const selectAnswer = (questionIndex: number, optionIndex: number) => {
    setAnswers((prev) => new Map(prev).set(questionIndex, optionIndex));
  };

  const finishExam = useCallback(() => {
    const results = examQuestions.map((q, i) => {
      const selected = answers.get(i);
      return {
        question_id: q.id,
        selected_index: selected ?? -1,
        correct: selected === q.correct_index,
      };
    });
    const score = results.filter((r) => r.correct).length;
    const duration = Math.round((Date.now() - startTime) / 1000);
    onComplete(score, examQuestions.length, results, duration, 'all');
    setPhase('results');
  }, [examQuestions, answers, startTime, onComplete]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Intro
  if (phase === 'intro') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Mock Exam</h1>
          <p className="text-slate-500">Simulate the real AZ-900 exam experience</p>
        </div>

        {loading ? (
          <div className="animate-pulse rounded-2xl bg-slate-100 h-64" />
        ) : (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 items-center justify-center shadow-md">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Exam Overview</h3>
                <p className="text-sm text-slate-500">Test your full knowledge under time pressure</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-center">
                <FileCheck className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-800">{Math.min(EXAM_QUESTION_COUNT, questions.length)}</p>
                <p className="text-xs text-slate-500">Questions</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-center">
                <Clock className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-800">45</p>
                <p className="text-xs text-slate-500">Minutes</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-center">
                <Trophy className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-800">70%</p>
                <p className="text-xs text-slate-500">Pass Mark</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-600 space-y-1.5">
                <p className="font-semibold text-amber-800">Before you begin:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>You will have 45 minutes to answer all questions</li>
                  <li>Questions cover all four AZ-900 domains</li>
                  <li>You can navigate between questions and review before submitting</li>
                  <li>You can change your answers before submitting the exam</li>
                  <li>The exam auto-submits when time runs out</li>
                </ul>
              </div>
            </div>

            <button
              onClick={startExam}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-orange-500/25 transition-all"
            >
              Start Mock Exam
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <Disclaimer />
      </div>
    );
  }

  // Results
  if (phase === 'results') {
    const score = examQuestions.filter((q, i) => answers.get(i) === q.correct_index).length;
    const total = examQuestions.length;
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= 70;
    const duration = Math.round((Date.now() - startTime) / 1000);
    const unanswered = examQuestions.filter((_, i) => !answers.has(i)).length;

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
        <div className={`rounded-2xl p-8 text-center relative overflow-hidden ${passed ? 'bg-gradient-to-br from-emerald-600 to-green-700' : 'bg-gradient-to-br from-slate-900 to-slate-800'}`}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
          <div className="relative">
            <div className={`inline-flex w-16 h-16 rounded-2xl items-center justify-center shadow-lg mb-4 ${passed ? 'bg-white/20' : 'bg-orange-500/20'}`}>
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">{percentage}%</h1>
            <p className={`text-sm font-semibold mb-2 ${passed ? 'text-emerald-200' : 'text-orange-300'}`}>
              {passed ? 'Congratulations! You passed!' : 'Keep practicing — you\'ll get there!'}
            </p>
            <p className="text-white/60 text-sm">
              You scored <span className="text-white font-semibold">{score}</span> out of <span className="text-white font-semibold">{total}</span>
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-white/50">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {Math.floor(duration / 60)}m {duration % 60}s</span>
              {unanswered > 0 && <span>{unanswered} unanswered</span>}
            </div>
          </div>
        </div>

        {/* Answer review */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-800">Review Your Answers</h2>
          {examQuestions.map((q, i) => {
            const selectedIdx = answers.get(i);
            const correct = selectedIdx === q.correct_index;
            const unanswered = selectedIdx === undefined;
            return (
              <div key={q.id} className="rounded-xl bg-white border border-slate-200 p-5">
                <div className="flex items-start gap-3">
                  {unanswered ? (
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  ) : correct ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800 mb-2">
                      <span className="text-slate-400 mr-1">Q{i + 1}.</span> {q.question_text}
                    </p>
                    {unanswered ? (
                      <p className="text-xs text-amber-600 mb-2">Not answered</p>
                    ) : (
                      <>
                        {!correct && <p className="text-xs text-rose-600 mb-1">Your answer: {q.options[selectedIdx]}</p>}
                        <p className="text-xs text-emerald-600 mb-2">Correct answer: {q.options[q.correct_index]}</p>
                      </>
                    )}
                    <p className="text-xs text-slate-500 leading-relaxed mt-2">{q.explanation}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setPhase('intro')}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-orange-500/25 transition-all"
        >
          Back to Exam Overview
        </button>

        <Disclaimer />
      </div>
    );
  }

  // Exam phase
  const currentQ = examQuestions[currentIndex];
  if (!currentQ) return null;

  const answeredCount = answers.size;
  const progress = (answeredCount / examQuestions.length) * 100;
  const isLowTime = timeLeft < 300; // < 5 min

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-5">
      {/* Top bar with timer */}
      <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">
            Question {currentIndex + 1} / {examQuestions.length}
          </span>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-sm ${isLowTime ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-700'}`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <div key={currentIndex} className="rounded-2xl bg-white border border-slate-200 p-6 animate-fade-in-up">
        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 mb-4">
          {currentQ.topic}
        </span>

        <p className="text-base sm:text-lg font-semibold text-slate-800 leading-relaxed mb-5">{currentQ.question_text}</p>

        <div className="space-y-2.5">
          {currentQ.options.map((option, i) => {
            const isSelected = answers.get(currentIndex) === i;
            return (
              <button
                key={i}
                onClick={() => selectAnswer(currentIndex, i)}
                className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                  isSelected
                    ? 'bg-sky-50 border-sky-400 text-sky-900'
                    : 'bg-slate-50 border-slate-200 hover:border-sky-300 hover:bg-sky-50/30 text-slate-700'
                }`}
              >
                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  isSelected ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-300 text-slate-500'
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm sm:text-base">{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" /> Prev
        </button>
        <button
          onClick={() => setCurrentIndex((prev) => Math.min(examQuestions.length - 1, prev + 1))}
          disabled={currentIndex === examQuestions.length - 1}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next <ArrowRight className="w-4 h-4" />
        </button>
        <div className="flex-1" />
        <button
          onClick={finishExam}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-orange-500/25 transition-all"
        >
          Submit Exam
        </button>
      </div>

      {/* Question grid */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5">
        <p className="text-xs font-semibold text-slate-500 mb-3">Jump to question</p>
        <div className="grid grid-cols-10 sm:grid-cols-12 gap-2">
          {examQuestions.map((_, i) => {
            const answered = answers.has(i);
            const isCurrent = i === currentIndex;
            return (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`aspect-square rounded-lg text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-sky-500 text-white ring-2 ring-sky-300 ring-offset-1'
                    : answered
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
          <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-200" /> Answered</span>
          <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-200" /> Not answered</span>
        </div>
      </div>

      <Disclaimer />
    </div>
  );
}
