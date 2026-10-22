import { AlertTriangle } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50/80 border border-amber-200/60 rounded-lg">
      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
      <p className="text-xs text-amber-800 leading-relaxed">
        <span className="font-semibold">Unofficial Study Tool:</span> VibeCloud AI is an independent educational resource and is not affiliated with, endorsed by, or sponsored by Microsoft. All practice questions are originally created for learning purposes.
      </p>
    </div>
  );
}
