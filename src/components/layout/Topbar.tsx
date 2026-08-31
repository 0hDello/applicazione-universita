import React from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Bell, ChevronDown } from 'lucide-react';

export const Topbar: React.FC = () => {
  const { currentView, userSettings, searchQuery, setSearchQuery } = useApp();

  const getSubtitle = () => {
    switch (currentView) {
      case 'calendario':
        return 'Ecco il tuo piano di oggi.';
      case 'corsi':
        return 'Ecco tutti i tuoi corsi.';
      case 'esami':
        return 'Ecco tutti i tuoi esami in un unico posto.';
      case 'compiti':
        return 'Ogni compito completato è un passo avanti.';
      case 'statistiche':
        return 'Ecco le tue statistiche di studio.';
      case 'risorse':
        return 'Ecco tutte le risorse per il tuo percorso di studi.';
      case 'obiettivi':
        return 'Ogni giorno un passo verso i tuoi obiettivi.';
      case 'impostazioni':
        return 'Ecco le tue impostazioni personalizzate.';
      default:
        return 'Organizza. Studia. Raggiungi.';
    }
  };

  return (
    <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Title & Greeting */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          Ciao {userSettings.name.split(' ')[0]}! <span className="inline-block animate-bounce">👋</span>
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          {getSubtitle()}
        </p>
      </div>

      {/* Actions: Search, Notifications, Profile */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca..."
            className="w-full pl-10 pr-4 py-2 rounded-full text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Notification Bell */}
        <button className="relative w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
        </button>

        {/* User Profile Menu */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200/80 dark:border-slate-800">
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
            {userSettings.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div className="hidden sm:block text-left">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
              {userSettings.name}
            </h4>
            <p className="text-[10px] text-slate-400 font-medium">
              {userSettings.role}
            </p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </header>
  );
};
