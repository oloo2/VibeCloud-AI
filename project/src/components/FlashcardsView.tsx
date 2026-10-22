import { useState, useMemo, useCallback } from 'react';
import { Layers, ArrowLeft, ArrowRight, RotateCcw, MapPin, Lightbulb, Check } from 'lucide-react';
import type { Flashcard } from '@/lib/supabase';
import { REGION_LABELS, TOPIC_CATEGORIES, DIFFICULTY_LABELS } from '@/lib/supabase';
import Disclaimer from './Disclaimer';

interface FlashcardsViewProps {
  flashcards: Flashcard[];
  loading: boolean;
}

export default function FlashcardsView({ flashcards, loading }: FlashcardsViewProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());

  const filteredCards = useMemo(() => {
    if (selectedTopic === 'all') return flashcards;
    return flashcards.filter((c) => c.topic === selectedTopic);
  }, [flashcards, selectedTopic]);

  const next = useCallback(() => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
    }, 150);
  }, [filteredCards.length]);

  const prev = useCallback(() => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
    }, 150);
  }, [filteredCards.length]);

  const markKnown = useCallback(() => {
    if (filteredCards[currentIndex]) {
      setKnownIds((prev) => new Set(prev).add(filteredCards[currentIndex].id));
    }
    next();
  }, [filteredCards, currentIndex, next]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Flashcards</h1>
          <p className="text-slate-500">Quick review of key terms and definitions</p>
        </div>
        <div className="animate-pulse rounded-2xl bg-slate-100 h-80" />
      </div>
    );
  }

  if (filteredCards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Flashcards</h1>
          <p className="text-slate-500">Quick review of key terms and definitions</p>
        </div>
        <p className="text-slate-500 text-center py-20">No flashcards available for this topic.</p>
      </div>
    );
  }

  const card = filteredCards[currentIndex];
  const region = REGION_LABELS[
    card.african_analogy && card.african_analogy.includes('M-Pesa') || card.african_analogy?.includes('Safaricom') || card.african_analogy?.includes('Chama') || card.african_analogy?.includes('Nairobi') || card.african_analogy?.includes('Kenya') ? 'east' :
    card.african_analogy?.includes('Jumia') || card.african_analogy?.includes('Paystack') || card.african_analogy?.includes('Lagos') || card.african_analogy?.includes('Yaba') || card.african_analogy?.includes('Accra') || card.african_analogy?.includes('Flutterwave') ? 'west' :
    card.african_analogy?.includes('Takealot') || card.african_analogy?.includes('Capitec') || card.african_analogy?.includes('TymeBank') || card.african_analogy?.includes('Johannesburg') || card.african_analogy?.includes('Cape Town') ? 'south' : 'general'
  ] || REGION_LABELS.general;
  const diff = DIFFICULTY_LABELS[card.difficulty] || DIFFICULTY_LABELS.beginner;
  const isKnown = knownIds.has(card.id);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Flashcards</h1>
        <p className="text-slate-500">Tap the card to flip. Review key terms and definitions.</p>
      </div>

      {/* Topic filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setSelectedTopic('all'); setCurrentIndex(0); setFlipped(false); }}
          className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
            selectedTopic === 'all' ? 'bg-sky-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Topics
        </button>
        {TOPIC_CATEGORIES.map((topic) => {
          const count = flashcards.filter((c) => c.topic === topic).length;
          if (count === 0) return null;
          return (
            <button
              key={topic}
              onClick={() => { setSelectedTopic(topic); setCurrentIndex(0); setFlipped(false); }}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedTopic === topic ? 'bg-sky-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {topic}
            </button>
          );
        })}
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500 font-medium">
          Card {currentIndex + 1} of {filteredCards.length}
        </span>
        <span className="text-emerald-600 font-medium flex items-center gap-1">
          <Check className="w-4 h-4" /> {knownIds.size} known
        </span>
      </div>

      {/* Flashcard */}
      <div
        className="relative cursor-pointer animate-scale-in"
        style={{ perspective: '1000px', minHeight: '320px' }}
        onClick={() => setFlipped(!flipped)}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '320px',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${diff.color}`}>{diff.label}</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">{card.topic}</span>
              {isKnown && <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Known</span>}
            </div>
            <p className="text-lg sm:text-xl font-bold text-slate-800 leading-relaxed max-w-md">{card.front}</p>
            <p className="text-xs text-slate-400 mt-6 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Tap to flip
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 sm:p-8 flex flex-col items-center justify-center text-center"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <p className="text-base sm:text-lg text-white leading-relaxed max-w-md">{card.back}</p>
            {card.african_analogy && (
              <div className="mt-5 max-w-md w-full">
                <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-300">African Analogy</span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="w-3 h-3" /> {region.emoji}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 italic leading-relaxed">"{card.african_analogy}"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={prev}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>
        <button
          onClick={markKnown}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
        >
          <Check className="w-4 h-4" /> Known
        </button>
        <button
          onClick={next}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
        >
          Next <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Reset */}
      <button
        onClick={() => { setKnownIds(new Set()); setCurrentIndex(0); setFlipped(false); }}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-slate-400 hover:text-slate-600 font-medium text-xs transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" /> Reset progress
      </button>

      <Disclaimer />
    </div>
  );
}
