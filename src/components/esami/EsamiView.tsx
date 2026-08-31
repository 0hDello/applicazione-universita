import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  Sun,
  FileCheck,
  CheckSquare,
  Award,
} from 'lucide-react';

export const EsamiView: React.FC = () => {
  const { esami, toggleExamTopic } = useApp();
  const [activeTab, setActiveTab] = useState<'prossimi' | 'tutti' | 'calendario' | 'statistiche'>('prossimi');

  const upcomingExams = esami.filter((e) => e.status === 'upcoming');
  const completedExams = esami.filter((e) => e.status === 'completed');
  const nextExam = upcomingExams[0];

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-8">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Header Title & Subtabs */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Esami</h2>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Pianifica, prepara e affronta i tuoi esami con metodo.
            </p>
          </div>

          {/* Subtabs Bar */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-px">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('prossimi')}
                className={`pb-3 text-xs font-bold transition-all relative ${
                  activeTab === 'prossimi'
                    ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Prossimi esami
              </button>
              <button
                onClick={() => setActiveTab('tutti')}
                className={`pb-3 text-xs font-bold transition-all relative ${
                  activeTab === 'tutti'
                    ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Tutti gli esami
              </button>
              <button
                onClick={() => setActiveTab('calendario')}
                className={`pb-3 text-xs font-bold transition-all relative ${
                  activeTab === 'calendario'
                    ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Calendario
              </button>
              <button
                onClick={() => setActiveTab('statistiche')}
                className={`pb-3 text-xs font-bold transition-all relative ${
                  activeTab === 'statistiche'
                    ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Statistiche
              </button>
            </div>

            <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtra e ordina</span>
            </button>
          </div>
        </div>

        {/* PROSSIMI ESAMI LIST */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              PROSSIMI ESAMI ({upcomingExams.length})
            </h4>
          </div>

          {upcomingExams.map((exam, idx) => {
            const cardBgColors = [
              { badgeBg: 'bg-purple-600 text-white', countdownBg: 'bg-purple-600 text-white', icon: '∫(x)' },
              { badgeBg: 'bg-sky-500 text-white', countdownBg: 'bg-sky-500 text-white', icon: '⚛' },
              { badgeBg: 'bg-emerald-500 text-white', countdownBg: 'bg-emerald-500 text-white', icon: '⚗' },
            ];
            const style = cardBgColors[idx % cardBgColors.length];

            return (
              <div
                key={exam.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-5 relative overflow-hidden transition-all hover:shadow-md"
              >
                {/* Header Row: Subject, Professor, Countdown badge */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl ${style.badgeBg} flex items-center justify-center font-bold text-lg shadow-md`}
                    >
                      {style.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {exam.courseName}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">{exam.professor}</p>
                    </div>
                  </div>

                  {/* Countdown Badge Card */}
                  <div
                    className={`px-5 py-3 rounded-2xl ${style.countdownBg} flex flex-col items-center justify-center shadow-lg text-center`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                      MANCANO
                    </span>
                    <span className="text-2xl font-extrabold leading-none my-0.5">
                      {exam.daysRemaining}
                    </span>
                    <span className="text-[10px] font-medium opacity-90">
                      giorni • {exam.date.split('-')[2]} Maggio
                    </span>
                  </div>
                </div>

                {/* Details Bar: Date, Time, Room, Registration */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 text-xs border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Data</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{exam.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Orario</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{exam.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Aula</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{exam.room}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Iscrizione</span>
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          exam.registrationStatus === 'Confermata'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {exam.registrationStatus}
                        {exam.registrationStatus === 'Confermata' && <CheckCircle2 className="w-3 h-3" />}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Indicators: Progresso Preparazione, Appunti, Ripetizioni */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Progresso Preparazione */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-400 uppercase tracking-wider text-[10px]">
                        PROGRESSO PREPARAZIONE
                      </span>
                      <span className="text-blue-600 dark:text-blue-400">{exam.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${exam.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {exam.notesCompleted} / {exam.notesTotal} argomenti completati
                    </span>
                  </div>

                  {/* Appunti Sistemati Card */}
                  <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        APPUNTI SISTEMATI
                      </span>
                      <h4 className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300 leading-tight">
                        {exam.notesPercentage}%
                      </h4>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                        {exam.notesCompleted} / {exam.notesTotal} argomenti
                      </span>
                    </div>
                    <CheckSquare className="w-8 h-8 text-emerald-500/40" />
                  </div>

                  {/* Ripetizioni Fatte Card */}
                  <div className="p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                        RIPETIZIONI FATTE
                      </span>
                      <h4 className="text-lg font-extrabold text-purple-700 dark:text-purple-300 leading-tight">
                        {exam.repetitionsDone} / {exam.repetitionsTotal}
                      </h4>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400">
                        Ripetizioni completate
                      </span>
                    </div>
                    <BookOpen className="w-8 h-8 text-purple-500/40" />
                  </div>
                </div>

                {/* Checklist: COSA DEVO ANCORA RIPASSARE */}
                {exam.topicsToReview.length > 0 && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      COSA DEVO ANCORA RIPASSARE
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {exam.topicsToReview.map((t) => (
                        <label
                          key={t.id}
                          className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={t.completed}
                            onChange={() => toggleExamTopic(exam.id, t.id)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
                          />
                          <span className={t.completed ? 'line-through text-slate-400' : ''}>
                            {t.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Sidebar Widgets Panel */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        {/* Sessione Estiva 2024 Summary Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">SESSIONE ESTIVA 2026</h4>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">27 Maggio – 26 Luglio 2026</p>

          <div className="grid grid-cols-4 gap-2 text-center py-2 border-y border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">0</span>
              <span className="text-[9px] text-slate-400 block font-medium">Esami in programma</span>
            </div>
            <div>
              <span className="text-base font-extrabold text-blue-600">0</span>
              <span className="text-[9px] text-slate-400 block font-medium">Completati</span>
            </div>
            <div>
              <span className="text-base font-extrabold text-emerald-600">0</span>
              <span className="text-[9px] text-slate-400 block font-medium">Confermati</span>
            </div>
            <div>
              <span className="text-base font-extrabold text-amber-600">0</span>
              <span className="text-[9px] text-slate-400 block font-medium">In attesa</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              <span>Avanzamento sessione</span>
              <span>0%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full w-[0%]" />
            </div>
          </div>
        </div>

        {/* Prossimo Esame Hero Banner */}
        {nextExam && (
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-3xl p-5 shadow-lg shadow-purple-600/20 flex flex-col gap-4 relative overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200">
              PROSSIMO ESAME
            </span>

            <div className="flex items-center justify-between gap-2">
              <div>
                <h4 className="text-lg font-extrabold leading-tight">{nextExam.courseName}</h4>
                <p className="text-xs text-purple-200 mt-0.5">
                  {nextExam.date} • {nextExam.time}
                </p>
                <p className="text-xs text-purple-200">
                  {nextExam.room} • {nextExam.professor}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-extrabold text-xl">
                {nextExam.daysRemaining}
              </div>
            </div>

            <button className="flex items-center justify-between w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors">
              <span>Apri scheda esame</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Calendario Esami Mini Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              CALENDARIO ESAMI
            </h4>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Maggio - Giugno 2026
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
            {['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'].map((d) => (
              <span key={d} className="text-[10px] text-slate-400 font-bold py-1">
                {d}
              </span>
            ))}
            {[27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].map(
              (day, i) => {
                const isExamDay = false;
                return (
                  <span
                    key={i}
                    className={`py-1.5 rounded-lg text-xs font-semibold ${
                      isExamDay
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {day}
                  </span>
                );
              }
            )}
          </div>
        </div>

        {/* Esami Completati List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              ESAMI COMPLETATI
            </h4>
            <button className="text-xs font-bold text-blue-600 hover:underline">Vedi tutti</button>
          </div>

          <div className="flex flex-col gap-3">
            {completedExams.map((exam) => (
              <div
                key={exam.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60"
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-emerald-500" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      {exam.courseName}
                    </h5>
                    <span className="text-[10px] text-slate-400">{exam.date}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs">
                  {exam.grade}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
