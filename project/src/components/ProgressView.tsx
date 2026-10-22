import { useMemo } from 'react';
import { TrendingUp, Clock, Target, Award, BookOpen, Brain, FileCheck, BarChart3 } from 'lucide-react';
import type { UserProgress, UserStudy, StudyTopic } from '@/lib/supabase';
import Disclaimer from './Disclaimer';

interface ProgressViewProps {
  progress: UserProgress[];
  studies: UserStudy[];
  studyTopics: StudyTopic[];
  loading: boolean;
}

export default function ProgressView({ progress, studies, studyTopics, loading }: ProgressViewProps) {
  const stats = useMemo(() => {
    const quizzes = progress.filter((p) => p.mode === 'quiz');
    const exams = progress.filter((p) => p.mode === 'exam');

    const allScores = progress.map((p) => (p.score / p.total) * 100);
    const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;

    const quizScores = quizzes.map((p) => (p.score / p.total) * 100);
    const avgQuiz = quizScores.length > 0 ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : 0;

    const examScores = exams.map((p) => (p.score / p.total) * 100);
    const avgExam = examScores.length > 0 ? Math.round(examScores.reduce((a, b) => a + b, 0) / examScores.length) : 0;
    const bestExam = examScores.length > 0 ? Math.round(Math.max(...examScores)) : 0;

    const totalTime = progress.reduce((sum, p) => sum + (p.duration_seconds || 0), 0);

    // Per-topic performance
    const topicPerf: Record<string, { correct: number; total: number }> = {};
    progress.forEach((p) => {
      p.answers.forEach((a) => {
        // We need to map back to topic via question - but answers only have question_id
        // Instead, use the progress record's topic
        const topic = p.topic === 'all' ? 'Mixed' : p.topic;
        if (!topicPerf[topic]) topicPerf[topic] = { correct: 0, total: 0 };
        topicPerf[topic].total += 1;
        if (a.correct) topicPerf[topic].correct += 1;
      });
    });

    return {
      totalAttempts: progress.length,
      quizzes: quizzes.length,
      exams: exams.length,
      avgScore,
      avgQuiz,
      avgExam,
      bestExam,
      totalTime,
      topicPerf,
    };
  }, [progress]);

  const studiedTopicIds = useMemo(() => new Set(studies.map((s) => s.topic_id)), [studies]);
  const studiedCount = studiedTopicIds.size;
  const totalTopics = studyTopics.length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">My Progress</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-slate-100 rounded-2xl" />
          <div className="h-64 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (progress.length === 0 && studies.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">My Progress</h1>
          <p className="text-slate-500">Track your AZ-900 study journey</p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-slate-100 items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No progress yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Take a quiz, study some topics, or try a mock exam to start tracking your progress. Your stats will appear here.
          </p>
        </div>

        <Disclaimer />
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">My Progress</h1>
        <p className="text-slate-500">Track your AZ-900 study journey</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={Target} label="Avg Score" value={`${stats.avgScore}%`} color="from-sky-500 to-blue-600" />
        <StatCard icon={Brain} label="Quizzes" value={String(stats.quizzes)} color="from-cyan-500 to-teal-600" />
        <StatCard icon={FileCheck} label="Mock Exams" value={String(stats.exams)} color="from-orange-500 to-amber-600" />
        <StatCard icon={Clock} label="Study Time" value={formatTime(stats.totalTime)} color="from-emerald-500 to-green-600" />
      </div>

      {/* Study progress */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-sky-600" />
          <h3 className="text-base font-bold text-slate-800">Study Progress</h3>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-600">{studiedCount} of {totalTopics} topics studied</span>
          <span className="text-sm font-bold text-sky-600">{Math.round((studiedCount / totalTopics) * 100)}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full transition-all duration-500"
            style={{ width: `${(studiedCount / totalTopics) * 100}%` }}
          />
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {studyTopics.map((topic) => {
            const isStudied = studiedTopicIds.has(topic.id);
            return (
              <div key={topic.id} className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${isStudied ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span className={isStudied ? 'text-slate-700' : 'text-slate-400'}>{topic.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ScoreCard label="Quiz Average" value={stats.avgQuiz} icon={Brain} color="text-cyan-600" />
        <ScoreCard label="Exam Average" value={stats.avgExam} icon={FileCheck} color="text-orange-600" />
        <ScoreCard label="Best Exam Score" value={stats.bestExam} icon={Award} color="text-emerald-600" />
      </div>

      {/* Topic performance */}
      {Object.keys(stats.topicPerf).length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-800">Performance by Topic</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(stats.topicPerf).map(([topic, perf]) => {
              const pct = Math.round((perf.correct / perf.total) * 100);
              return (
                <div key={topic}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-700">{topic === 'all' ? 'Mixed Topics' : topic}</span>
                    <span className={`text-sm font-bold ${pct >= 70 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {pct}% ({perf.correct}/{perf.total})
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent activity */}
      {progress.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6">
          <h3 className="text-base font-bold text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-2">
            {progress.slice(0, 8).map((p) => {
              const pct = Math.round((p.score / p.total) * 100);
              const date = new Date(p.created_at);
              return (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                  <div className={`inline-flex w-8 h-8 rounded-lg items-center justify-center flex-shrink-0 ${
                    p.mode === 'exam' ? 'bg-orange-50' : 'bg-sky-50'
                  }`}>
                    {p.mode === 'exam' ? <FileCheck className="w-4 h-4 text-orange-600" /> : <Brain className="w-4 h-4 text-sky-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {p.mode === 'exam' ? 'Mock Exam' : `Quiz: ${p.topic === 'all' ? 'All Topics' : p.topic}`}
                    </p>
                    <p className="text-xs text-slate-400">{date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${pct >= 70 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {pct}%
                    </p>
                    <p className="text-xs text-slate-400">{p.score}/{p.total}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Disclaimer />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof TrendingUp; label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4">
      <div className={`inline-flex w-9 h-9 rounded-lg bg-gradient-to-br ${color} items-center justify-center mb-3 shadow-sm`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function ScoreCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: typeof Award; color: string }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 text-center">
      <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
      <p className="text-3xl font-bold text-slate-800">{value > 0 ? `${value}%` : '—'}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}
