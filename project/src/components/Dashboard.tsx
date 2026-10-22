import { Cloud, BookOpen, Brain, Layers, FileCheck, TrendingUp, ArrowRight, Sparkles, Zap, Target, Globe } from 'lucide-react';
import type { View } from './Sidebar';
import Disclaimer from './Disclaimer';
import { REGION_LABELS } from '@/lib/supabase';
import type { StudyTopic, UserProgress, UserStudy } from '@/lib/supabase';

interface DashboardProps {
  onNavigate: (view: View) => void;
  studyTopics: StudyTopic[];
  progress: UserProgress[];
  studies: UserStudy[];
  loading: boolean;
}

export default function Dashboard({ onNavigate, studyTopics, progress, studies, loading }: DashboardProps) {
  const totalQuestions = 30;
  const topicsStudied = studies.length;
  const totalTopics = studyTopics.length;
  const quizzesTaken = progress.filter((p) => p.mode === 'quiz').length;
  const examsTaken = progress.filter((p) => p.mode === 'exam').length;
  const avgScore = progress.length > 0
    ? Math.round(progress.reduce((sum, p) => sum + (p.score / p.total) * 100, 0) / progress.length)
    : 0;

  const cards = [
    {
      view: 'study' as View,
      icon: BookOpen,
      title: 'Study Topics',
      desc: 'Explore AZ-900 concepts through African-context analogies',
      gradient: 'from-sky-500 to-blue-600',
      stats: `${totalTopics} topics`,
    },
    {
      view: 'quiz' as View,
      icon: Brain,
      title: 'Practice Quiz',
      desc: 'Test your knowledge with original scenario-based questions',
      gradient: 'from-cyan-500 to-teal-600',
      stats: `${totalQuestions} questions`,
    },
    {
      view: 'flashcards' as View,
      icon: Layers,
      title: 'Flashcards',
      desc: 'Quick review of key terms and definitions',
      gradient: 'from-emerald-500 to-green-600',
      stats: '30 cards',
    },
    {
      view: 'exam' as View,
      icon: FileCheck,
      title: 'Mock Exam',
      desc: 'Timed full-length exam simulation',
      gradient: 'from-orange-500 to-amber-600',
      stats: 'Full exam',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 sm:p-10 lg:p-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-xs font-medium text-sky-300">Built for the #1MillionDevs Movement</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3">
            Your AI Study Buddy for<br />
            <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">Azure Fundamentals (AZ-900)</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed mb-6">
            Master cloud computing concepts through relatable African business analogies. From M-Pesa to Jumia to Takealot — learn Azure the way that makes sense to you.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('study')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-sky-500/25 transition-all duration-200"
            >
              Start Studying
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('quiz')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-all duration-200"
            >
              Take a Quiz
              <Brain className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={BookOpen}
          label="Topics Studied"
          value={loading ? '—' : `${topicsStudied}/${totalTopics}`}
          color="text-sky-600 bg-sky-50"
        />
        <StatCard
          icon={Brain}
          label="Quizzes Taken"
          value={loading ? '—' : String(quizzesTaken)}
          color="text-cyan-600 bg-cyan-50"
        />
        <StatCard
          icon={FileCheck}
          label="Mock Exams"
          value={loading ? '—' : String(examsTaken)}
          color="text-orange-600 bg-orange-50"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Score"
          value={loading ? '—' : `${avgScore}%`}
          color="text-emerald-600 bg-emerald-50"
        />
      </div>

      {/* Feature Cards */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">What would you like to do?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <button
                key={card.view}
                onClick={() => onNavigate(card.view)}
                className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 text-left card-hover hover:shadow-lg hover:shadow-slate-200/50 animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} items-center justify-center mb-4 shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{card.title}</h3>
                <p className="text-sm text-slate-500 mb-3">{card.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">{card.stats}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-sky-600 group-hover:gap-2 transition-all">
                    Go <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* African context highlight */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/50 p-6">
        <div className="flex items-start gap-4">
          <div className="inline-flex w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 items-center justify-center flex-shrink-0">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
              Learn Through African Context
              <span className="flex gap-1">
                <span className="text-base">🇰🇪</span>
                <span className="text-base">🇳🇬</span>
                <span className="text-base">🇿🇦</span>
              </span>
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              Every concept is explained using real-world African platforms you already know. We connect abstract cloud architecture to systems like M-Pesa, Jumia, Paystack, Takealot, and TymeBank — so the ideas stick.
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(REGION_LABELS).filter(([k]) => k !== 'general').map(([key, val]) => (
                <span key={key} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 border border-emerald-200/50 text-xs font-medium text-slate-700">
                  <span>{val.emoji}</span> {val.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Study path suggestion */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-sky-600" />
          <h3 className="text-base font-bold text-slate-800">Recommended Study Path</h3>
        </div>
        <div className="space-y-3">
          {[
            { step: 1, title: 'Start with Cloud Concepts', desc: 'Understand what the cloud is and why it matters', done: topicsStudied > 0 },
            { step: 2, title: 'Explore Core Azure Services', desc: 'Learn about compute, storage, and networking', done: topicsStudied > 3 },
            { step: 3, title: 'Master Security & Compliance', desc: 'Identity, access control, and data protection', done: topicsStudied > 6 },
            { step: 4, title: 'Take a Mock Exam', desc: 'Test your readiness with a full timed exam', done: examsTaken > 0 },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-4">
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${item.done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'}
              `}>
                {item.done ? <Zap className="w-4 h-4" /> : item.step}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${item.done ? 'text-slate-800' : 'text-slate-600'}`}>{item.title}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Disclaimer />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Cloud; label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4">
      <div className={`inline-flex w-9 h-9 rounded-lg ${color} items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}
