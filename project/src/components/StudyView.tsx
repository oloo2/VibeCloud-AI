import { useState } from 'react';
import * as Icons from 'lucide-react';
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, Lightbulb, KeyRound } from 'lucide-react';
import type { StudyTopic } from '@/lib/supabase';
import { REGION_LABELS } from '@/lib/supabase';
import Disclaimer from './Disclaimer';

interface StudyViewProps {
  topics: StudyTopic[];
  loading: boolean;
  onTopicStudied: (topicId: string) => void;
  studiedTopicIds: Set<string>;
}

export default function StudyView({ topics, loading, onTopicStudied, studiedTopicIds }: StudyViewProps) {
  const [selectedTopic, setSelectedTopic] = useState<StudyTopic | null>(null);

  if (selectedTopic) {
    return (
      <TopicDetail
        topic={selectedTopic}
        onBack={() => setSelectedTopic(null)}
        onStudied={() => onTopicStudied(selectedTopic.id)}
        isStudied={studiedTopicIds.has(selectedTopic.id)}
      />
    );
  }

  const grouped = topics.reduce((acc, topic) => {
    if (!acc[topic.category]) acc[topic.category] = [];
    acc[topic.category].push(topic);
    return acc;
  }, {} as Record<string, StudyTopic[]>);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Study Topics</h1>
        <p className="text-slate-500">Master AZ-900 concepts through African-context analogies</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-slate-100 h-32" />
          ))}
        </div>
      ) : (
        Object.entries(grouped).map(([category, categoryTopics]) => (
          <div key={category}>
            <h2 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-sky-500" />
              {category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categoryTopics.map((topic, i) => {
                const IconComp = (Icons[topic.icon_name as keyof typeof Icons] as typeof Icons.Cloud) || Icons.Cloud;
                const isStudied = studiedTopicIds.has(topic.id);
                const region = REGION_LABELS[topic.region] || REGION_LABELS.general;
                return (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic)}
                    className="group text-left rounded-2xl bg-white border border-slate-200 p-5 card-hover hover:shadow-lg hover:shadow-slate-200/50 animate-fade-in-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="inline-flex w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 items-center justify-center flex-shrink-0 shadow-md">
                        <IconComp className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {isStudied && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                          <h3 className="font-bold text-slate-800 truncate">{topic.title}</h3>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-2">{topic.summary}</p>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <MapPin className="w-3 h-3" /> {region.emoji} {region.label}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-sky-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))
      )}

      <Disclaimer />
    </div>
  );
}

function TopicDetail({ topic, onBack, onStudied, isStudied }: { topic: StudyTopic; onBack: () => void; onStudied: () => void; isStudied: boolean }) {
  const region = REGION_LABELS[topic.region] || REGION_LABELS.general;
  const IconComp = (Icons[topic.icon_name as keyof typeof Icons] as typeof Icons.Cloud) || Icons.Cloud;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6 animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-sky-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Topics
      </button>

      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 items-center justify-center shadow-lg">
              <IconComp className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs font-medium text-sky-400">{topic.category}</span>
              <h1 className="text-xl sm:text-2xl font-bold text-white">{topic.title}</h1>
            </div>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">{topic.summary}</p>
        </div>
      </div>

      {/* Content sections */}
      <div className="space-y-4">
        {topic.content.map((section, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white border border-slate-200 p-6 animate-fade-in-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {i + 1}
              </span>
              <h3 className="text-lg font-bold text-slate-800">{section.heading}</h3>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{section.body}</p>
          </div>
        ))}
      </div>

      {/* African Analogy */}
      {topic.african_analogy && (
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/50 p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="inline-flex w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 items-center justify-center">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base font-bold text-slate-800">African Context Analogy</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/60 border border-emerald-200/50 font-medium text-slate-600">
              {region.emoji} {region.label}
            </span>
          </div>
          <p className="text-slate-700 leading-relaxed text-sm sm:text-base italic">"{topic.african_analogy}"</p>
        </div>
      )}

      {/* Key Terms */}
      {topic.key_terms.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-800">Key Terms</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topic.key_terms.map((kt, i) => (
              <div key={i} className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <p className="font-semibold text-sky-700 text-sm mb-1">{kt.term}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{kt.definition}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mark as studied */}
      <button
        onClick={onStudied}
        disabled={isStudied}
        className={`
          w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200
          ${isStudied
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-sky-500/25'
          }
        `}
      >
        <CheckCircle2 className="w-5 h-5" />
        {isStudied ? 'Topic Studied' : 'Mark as Studied'}
      </button>

      <Disclaimer />
    </div>
  );
}
