import { Cloud, Home, BookOpen, Brain, Layers, BarChart3, Menu, X } from 'lucide-react';
import { useState } from 'react';

export type View = 'dashboard' | 'study' | 'quiz' | 'flashcards' | 'exam' | 'progress';

interface NavItem {
  view: View;
  label: string;
  icon: typeof Cloud;
}

const navItems: NavItem[] = [
  { view: 'dashboard', label: 'Dashboard', icon: Home },
  { view: 'study', label: 'Study Topics', icon: BookOpen },
  { view: 'quiz', label: 'Practice Quiz', icon: Brain },
  { view: 'flashcards', label: 'Flashcards', icon: Layers },
  { view: 'exam', label: 'Mock Exam', icon: BookOpen },
  { view: 'progress', label: 'My Progress', icon: BarChart3 },
];

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

export default function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">VibeCloud<span className="text-sky-400"> AI</span></span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-slate-300 hover:text-white p-1"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-10
        w-64 bg-slate-900 flex flex-col
        transform transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="px-6 py-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Cloud className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">VibeCloud<span className="text-sky-400"> AI</span></h1>
            <p className="text-slate-400 text-xs">AZ-900 Study Buddy</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => {
                  onNavigate(item.view);
                  setMobileOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${active
                    ? 'bg-gradient-to-r from-sky-500/20 to-cyan-500/10 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400" />}
              </button>
            );
          })}
        </nav>

        {/* Movement badge */}
        <div className="px-4 py-4 border-t border-slate-800">
          <div className="bg-gradient-to-br from-sky-500/10 to-cyan-500/5 rounded-xl p-3 border border-sky-500/20">
            <p className="text-sky-300 text-xs font-semibold mb-1">#1MillionDevs</p>
            <p className="text-slate-500 text-xs leading-relaxed">Join the movement. Learn cloud. Build the future.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
