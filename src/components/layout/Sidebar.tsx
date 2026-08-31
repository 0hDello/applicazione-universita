import React from 'react';
import { useApp } from '../../context/AppContext';
import type { NavView } from '../../types';
import {
  Calendar as CalendarIcon,
  GraduationCap,
  BookOpen,
  CheckSquare,
  BarChart3,
  Archive,
  Target,
  Settings,
  Sun,
  Moon,
  Quote,
} from 'lucide-react';

interface NavItem {
  id: NavView;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, userSettings, updateUserSettings } = useApp();

  const navItems: NavItem[] = [
    { id: 'calendario', label: 'Calendario', icon: CalendarIcon },
    { id: 'corsi', label: 'Corsi', icon: GraduationCap },
    { id: 'esami', label: 'Esami', icon: BookOpen },
    { id: 'compiti', label: 'Compiti', icon: CheckSquare },
    { id: 'statistiche', label: 'Statistiche', icon: BarChart3 },
    { id: 'risorse', label: 'Risorse', icon: Archive },
    { id: 'obiettivi', label: 'Obiettivi', icon: Target },
    { id: 'impostazioni', label: 'Impostazioni', icon: Settings },
  ];

  const isDark = userSettings.theme === 'dark';

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between h-screen sticky top-0 z-30 select-none transition-colors">
      <div className="p-5 flex flex-col gap-6 overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
              UniPlanner
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Organizza. Studia. Raggiungi.
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform duration-150 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                  }`}
                />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Area: Motivational Card & Theme Switch */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3 bg-slate-50/50 dark:bg-slate-900/50">
        {/* Quote Card */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-xs relative">
          <Quote className="w-4 h-4 text-slate-300 dark:text-slate-600 mb-1" />
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic">
            "La costanza batte il talento quando il talento non è costante."
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
            — Tim Notke
          </p>
        </div>

        {/* Theme Selector Button */}
        <button
          onClick={() => updateUserSettings({ theme: isDark ? 'light' : 'dark' })}
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            {isDark ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span>{isDark ? 'Scuro' : 'Chiaro'}</span>
          </div>
          <span className="text-[10px] text-slate-400 capitalize">Modalità</span>
        </button>
      </div>
    </aside>
  );
};
