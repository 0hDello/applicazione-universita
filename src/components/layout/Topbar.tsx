import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Bell,
  ChevronDown,
  Settings,
  BookOpen,
  GraduationCap,
  Sun,
  Moon,
  CheckCheck,
  Calendar,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

export const Topbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    userSettings,
    updateUserSettings,
    searchQuery,
    setSearchQuery,
    notifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
  } = useApp();

  const [isOpenNotif, setIsOpenNotif] = useState(false);
  const [isOpenProfile, setIsOpenProfile] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsOpenNotif(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsOpenProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

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

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'exam':
        return <GraduationCap className="w-4 h-4 text-purple-600" />;
      case 'task':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'lecture':
        return <Calendar className="w-4 h-4 text-emerald-600" />;
      case 'update':
        return <Sparkles className="w-4 h-4 text-blue-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const isDark = userSettings.theme === 'dark';

  return (
    <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Title & Greeting */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          Ciao {userSettings.name.split(' ')[0]}! <span className="inline-block animate-bounce">👋</span>
        </h2>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">
          {getSubtitle()}
        </p>
      </div>

      {/* Actions: Search, Notifications, Profile */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative w-60 hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca corsi, lezioni, esami..."
            className="w-full pl-10 pr-4 py-2 rounded-full text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          />
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setIsOpenNotif(!isOpenNotif);
              setIsOpenProfile(false);
            }}
            className="relative w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors"
            title="Notifiche"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Panel */}
          {isOpenNotif && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl p-4 flex flex-col gap-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Notifiche</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                      {unreadCount} nuove
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Lette tutte</span>
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Nessuna notifica presente.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        if (notif.linkView) {
                          setCurrentView(notif.linkView);
                          setIsOpenNotif(false);
                        }
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        notif.read
                          ? 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/60 opacity-75'
                          : 'bg-blue-50/40 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/60'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                        {getNotifIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {notif.title}
                          </h5>
                          <span className="text-[10px] font-bold text-slate-400 shrink-0">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setIsOpenProfile(!isOpenProfile);
              setIsOpenNotif(false);
            }}
            className="flex items-center gap-3 pl-2 border-l border-slate-200/80 dark:border-slate-800 text-left hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
              {userSettings.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="hidden sm:block">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {userSettings.name}
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold">
                {userSettings.role}
              </p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpenProfile ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Menu Popup */}
          {isOpenProfile && (
            <div className="absolute right-0 mt-3 w-64 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl p-3 flex flex-col gap-2 z-50 animate-in fade-in zoom-in-95">
              {/* User Header */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex flex-col gap-1">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {userSettings.name}
                </span>
                <span className="text-[10px] text-slate-400 font-medium truncate">
                  {userSettings.studyProgram}
                </span>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 truncate">
                  {userSettings.university}
                </span>
              </div>

              {/* Navigation Actions */}
              <div className="flex flex-col gap-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                <button
                  onClick={() => {
                    setCurrentView('impostazioni');
                    setIsOpenProfile(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Impostazioni & Profilo</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentView('corsi');
                    setIsOpenProfile(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>I Miei Corsi</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentView('esami');
                    setIsOpenProfile(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  <span>Appelli & Esami</span>
                </button>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                <button
                  onClick={() => {
                    updateUserSettings({ theme: isDark ? 'light' : 'dark' });
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-purple-400" />}
                    <span>Tema {isDark ? 'Chiaro' : 'Scuro'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">Switch</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

