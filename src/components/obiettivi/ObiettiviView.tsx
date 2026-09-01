import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Target,
  Plus,
  Flame,
  Zap,
  Trash2,
  X,
  Award,
  Sparkles,
  Check,
} from 'lucide-react';

export const ObiettiviView: React.FC = () => {
  const {
    semesterGoals,
    addSemesterGoal,
    updateSemesterGoal,
    deleteSemesterGoal,
    weeklyGoals,
    addWeeklyGoal,
    toggleWeeklyGoal,
    toggleWeeklyGoalDay,
    deleteWeeklyGoal,
    habits,
    addHabit,
    toggleHabitDay,
    deleteHabit,
  } = useApp();

  const [activeSubtab, setActiveSubtab] = useState<'panoramica' | 'accademici' | 'abitudini' | 'traguardi' | 'storico'>('panoramica');

  // Modal State
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [goalType, setGoalType] = useState<'semestrale' | 'settimanale' | 'abitudine'>('semestrale');
  const [title, setTitle] = useState('');
  const [totalSessions, setTotalSessions] = useState(5);
  const [priority, setPriority] = useState<'Alta' | 'Media' | 'Bassa'>('Alta');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (goalType === 'semestrale') {
      addSemesterGoal({
        title: title.trim(),
        current: 0,
        total: totalSessions || 10,
        progress: 0,
        priority,
      });
    } else if (goalType === 'settimanale') {
      addWeeklyGoal({
        title: title.trim(),
        completedSessions: 0,
        totalSessions: totalSessions || 5,
        days: [false, false, false, false, false, false, false],
      });
    } else {
      addHabit({
        title: title.trim(),
        streakDays: 0,
        activeDays: [false, false, false, false, false, false, false],
      });
    }

    setIsAddingGoal(false);
    setTitle('');
  };

  const weekDayLabels = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-8">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        {/* Title Header & Main Action */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">I miei obiettivi</h2>
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              Pianifica, agisci, raggiungi. Ogni giorno un passo verso i tuoi traguardi.
            </p>
          </div>

          <button
            onClick={() => setIsAddingGoal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all hover:scale-102"
          >
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
        {(activeSubtab === 'panoramica' || activeSubtab === 'accademici') && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                OBIETTIVI DEL SEMESTRE ({semesterGoals.length})
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {semesterGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col items-center text-center gap-3 relative group hover:shadow-md transition-all"
                >
                  <button
                    onClick={() => deleteSemesterGoal(goal.id)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                    title="Elimina obiettivo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
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

                  <span className="text-[10px] text-slate-400 font-bold">
                    {goal.current} / {goal.total} attività
                  </span>

                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-1">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>

                  {/* Increment Action Button */}
                  <button
                    onClick={() =>
                      updateSemesterGoal(goal.id, {
                        current: Math.min(goal.total, goal.current + 1),
                      })
                    }
                    className="w-full py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold hover:bg-blue-100 transition-colors"
                  >
                    +1 Attività svolta
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 2: OBIETTIVI SETTIMANALI */}
        {(activeSubtab === 'panoramica' || activeSubtab === 'accademici') && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                OBIETTIVI SETTIMANALI ({weeklyGoals.length})
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weeklyGoals.map((goal) => {
                const percent =
                  goal.totalSessions > 0
                    ? Math.round((goal.completedSessions / goal.totalSessions) * 100)
                    : 0;

                return (
                  <div
                    key={goal.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4 group hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="text-xs font-extrabold text-slate-900 dark:text-white">
                            {goal.title}
                          </h5>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {goal.completedSessions} di {goal.totalSessions} sessioni
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleWeeklyGoal(goal.id)}
                          className={`p-1.5 rounded-xl border transition-colors ${
                            goal.completedSessions >= goal.totalSessions
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800'
                              : 'text-slate-400 hover:text-emerald-600 border-slate-200 dark:border-slate-700'
                          }`}
                          title="Spunta obiettivo completo"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteWeeklyGoal(goal.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 transition-all"
                          title="Elimina"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Weekday check-in bubbles */}
                    <div className="flex items-center justify-between gap-1 pt-1">
                      {weekDayLabels.map((dayLabel, idx) => (
                        <button
                          key={idx}
                          onClick={() => toggleWeeklyGoalDay(goal.id, idx)}
                          className={`w-8 h-8 rounded-full text-xs font-extrabold flex items-center justify-center transition-all ${
                            goal.days[idx]
                              ? 'bg-blue-600 text-white shadow-xs scale-105'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {dayLabel}
                        </button>
                      ))}
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 3: ABITUDINI E STREAK TRACKER */}
        {(activeSubtab === 'panoramica' || activeSubtab === 'abitudini') && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                ABITUDINI GIORNALIERE & RECORD ({habits.length})
              </h4>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {habits.map((habit) => (
                  <div
                    key={habit.id}
                    className="py-3 flex items-center justify-between gap-4 flex-wrap first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center">
                        <Flame className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {habit.title}
                        </h5>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {habit.streakDays} giorni consecutivi
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        {weekDayLabels.map((dayLabel, idx) => (
                          <button
                            key={idx}
                            onClick={() => toggleHabitDay(habit.id, idx)}
                            className={`w-7 h-7 rounded-full text-[10px] font-extrabold flex items-center justify-center transition-all ${
                              habit.activeDays[idx]
                                ? 'bg-red-500 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            {dayLabel}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                        title="Elimina abitudine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: TRAGUARDI ACCADEMICI */}
        {(activeSubtab === 'traguardi' || activeSubtab === 'storico') && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Traguardi Raggiunti & Badge
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-extrabold">
                  🏆
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">Primo Esame Superato</h5>
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold">Badge Sbloccato</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-extrabold">
                  ⚡
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">Costanza 7 Giorni</h5>
                  <span className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold">Streak Perfetto</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500 text-white flex items-center justify-center font-extrabold">
                  📚
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">Appunti Completi</h5>
                  <span className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold">Tutti i Corsi Sincronizzati</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar Info */}
      <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Ispirazione del Giorno</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-blue-50/50 dark:bg-blue-950/30 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-900/60 leading-relaxed">
            "Il successo universitario non è fatto da grandi exploit improvvisi, ma da piccole abitudini ripetute con costanza ogni singolo giorno."
          </p>
        </div>
      </div>

      {/* New Goal Modal */}
      {isAddingGoal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Nuovo Obiettivo o Abitudine</h3>
              </div>
              <button
                onClick={() => setIsAddingGoal(false)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tipo Obiettivo</label>
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-bold"
                >
                  <option value="semestrale">🎯 Obiettivo Semestrale (es. 4 Esami Superati)</option>
                  <option value="settimanale">⚡ Obiettivo Settimanale (es. 5 Sessioni di studio)</option>
                  <option value="abitudine">🔥 Abitudine Giornaliera (es. Ripasso serale 30min)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Titolo / Descrizione *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Es. Superare Analisi Matematica con 28+"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              {goalType !== 'abitudine' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {goalType === 'semestrale' ? 'Attività Totali' : 'Sessioni Settimanali'}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={totalSessions}
                      onChange={(e) => setTotalSessions(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Priorità</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-bold"
                    >
                      <option value="Alta">Alta</option>
                      <option value="Media">Media</option>
                      <option value="Bassa">Bassa</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingGoal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700"
                >
                  Crea Obiettivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
