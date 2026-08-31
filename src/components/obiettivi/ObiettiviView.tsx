import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Target,
  Plus,
  Flame,
  Zap,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

export const ObiettiviView: React.FC = () => {
  const { semesterGoals, weeklyGoals, habits } = useApp();
  const [activeSubtab, setActiveSubtab] = useState<'panoramica' | 'accademici' | 'abitudini' | 'traguardi' | 'storico'>('panoramica');

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-8">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Title Header & Main Action */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">I miei obiettivi</h2>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Pianifica, agisci, raggiungi. Ogni giorno un passo verso i tuoi traguardi.
            </p>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Nuovo obiettivo</span>
          </button>
        </div>

        {/* Subtabs Navigation Bar */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
          {(['panoramica', 'accademici', 'abitudini', 'traguardi', 'storico'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubtab(tab)}
              className={`pb-3 text-xs font-bold capitalize transition-all relative ${
                activeSubtab === tab
                  ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* SECTION 1: OBIETTIVI DEL SEMESTRE */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              OBIETTIVI DEL SEMESTRE
            </h4>
            <button className="text-xs font-bold text-blue-600 hover:underline">Visualizza tutti</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {semesterGoals.map((goal) => (
              <div
                key={goal.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col items-center text-center gap-3 relative"
              >
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold">
                  <Target className="w-5 h-5" />
                </div>

                <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-tight min-h-[32px]">
                  {goal.title}
                </h5>

                {/* Circular Gauge percentage */}
                <div className="w-20 h-20 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
                  <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                    {goal.progress}%
                  </span>
                </div>

                <span className="text-[10px] text-slate-400 font-semibold">
                  {goal.current} / {goal.total} attività
                </span>

                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-1">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>

                <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      goal.priority === 'Alta' ? 'bg-red-500' : 'bg-amber-500'
                    }`}
                  />
                  Priorità {goal.priority.toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: OBIETTIVI SETTIMANALI */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              OBIETTIVI SETTIMANALI
            </h4>
            <span className="text-xs font-semibold text-slate-400">Questa settimana ▾</span>
          </div>

          <div className="flex flex-col gap-4">
            {weeklyGoals.map((wg) => (
              <div
                key={wg.id}
                className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex-wrap sm:flex-nowrap"
              >
                <div className="flex items-center gap-3 min-w-[200px]">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {wg.title}
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-1 max-w-xs">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {wg.completedSessions} / {wg.totalSessions} sessioni
                  </span>
                  <div className="h-2 flex-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{
                        width: `${Math.round((wg.completedSessions / wg.totalSessions) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Day Check Circles: L M M G V S D */}
                <div className="flex items-center gap-1">
                  {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((day, idx) => {
                    const isDone = wg.days[idx];
                    return (
                      <span
                        key={idx}
                        className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${
                          isDone
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-200/80 dark:bg-slate-700 text-slate-400'
                        }`}
                      >
                        {day}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: ABITUDINI DI STUDIO */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ABITUDINI DI STUDIO
            </h4>
            <button className="text-xs font-bold text-blue-600 hover:underline">
              Visualizza tutte le abitudini
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                    <Flame className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {habit.title}
                  </h5>
                  <span className="text-xs font-extrabold text-amber-500 mt-1 block">
                    {habit.streakDays} giorni <span className="text-[10px] font-normal text-slate-400">streak attuale 🔥</span>
                  </span>
                </div>

                {/* Day bars */}
                <div className="flex items-end gap-1.5 h-10 pt-2">
                  {[4, 6, 8, 5, 9, 7, 10].map((h, i) => (
                    <div key={i} className="flex-1 bg-amber-200 dark:bg-amber-950/60 rounded-t-sm" style={{ height: `${h * 10}%` }}>
                      <div className="bg-amber-500 w-full h-full rounded-t-sm" />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span>L</span><span>M</span><span>M</span><span>G</span><span>V</span><span>S</span><span>D</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM MOTIVATIONAL BANNER */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/60 border border-blue-100 dark:border-slate-700 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💪</span>
            <div>
              <h5 className="text-sm font-bold text-slate-900 dark:text-white">Non fermarti ora!</h5>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ogni piccolo passo oggi costruisce il tuo grande risultato di domani.
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700">
            <span>Vedi il piano di studio</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Sidebar Widgets Panel */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        {/* Streak di studio badge */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-wider">
            <Flame className="w-4 h-4" />
            <span>STREAK DI STUDIO</span>
          </div>

          <div>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              0
            </h3>
            <span className="text-xs font-semibold text-slate-400">giorni consecutivi</span>
          </div>

          <div className="flex items-end gap-1.5 h-12 pt-2">
            {[30, 45, 60, 50, 75, 90, 100].map((val, i) => (
              <div
                key={i}
                className="flex-1 bg-emerald-500 rounded-t-sm"
                style={{ height: `${val}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-[9px] font-bold text-slate-400">
            <span>L</span><span>M</span><span>M</span><span>G</span><span>V</span><span>S</span><span>D</span>
          </div>
        </div>

        {/* Encouraging Banner */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-3xl p-5 border border-purple-100 dark:border-purple-900/40 flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center gap-2 text-purple-600 font-bold text-xs">
            <Zap className="w-4 h-4" />
            <span>Sei sulla strada giusta!</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            La disciplina di oggi è il successo di domani. 🎉
          </p>
        </div>

        {/* Prossimi traguardi milestone */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              PROSSIMI TRAGUARDI
            </h4>
          </div>

          <div className="flex flex-col gap-3 text-xs text-slate-500">
            Nessun traguardo in arrivo.
          </div>
        </div>

        {/* Obiettivi completati list */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              OBIETTIVI COMPLETATI
            </h4>
            <span className="text-xs font-bold text-emerald-600">0 questo semestre</span>
          </div>

          <div className="flex flex-col gap-2 text-xs text-slate-500">
            Nessun obiettivo completato.
          </div>
        </div>
      </div>
    </div>
  );
};
