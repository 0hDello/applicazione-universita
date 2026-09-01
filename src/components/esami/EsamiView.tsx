import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TimeSlotPicker } from '../common/TimeSlotPicker';
import {
  BookOpen,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  FileCheck,
  Award,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

export const EsamiView: React.FC = () => {
  const { esami, addEsame, deleteEsame, toggleExamTopic, corsi, setCurrentView } = useApp();
  const [activeTab, setActiveTab] = useState<'prossimi' | 'tutti' | 'statistiche'>('prossimi');
  const [isAddingExam, setIsAddingExam] = useState(false);

  // New Exam Form State
  const [newCourseName, setNewCourseName] = useState(corsi[0]?.name || '');
  const [newProfessor, setNewProfessor] = useState(corsi[0]?.professor || '');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('11:00');
  const [newRoom, setNewRoom] = useState('Aula Magna');

  const handleCourseSelect = (courseName: string) => {
    setNewCourseName(courseName);
    const matched = corsi.find((c) => c.name === courseName);
    if (matched && matched.professor) {
      setNewProfessor(matched.professor);
    }
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    const matchedCourse = corsi.find((c) => c.name === newCourseName);
    const daysRem = Math.max(0, Math.ceil((new Date(newDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

    addEsame({
      courseId: matchedCourse?.id || `course_${Date.now()}`,
      courseName: newCourseName.trim(),
      professor: newProfessor.trim() || 'Docente Corso',
      date: newDate,
      time: `${newStartTime} - ${newEndTime}`,
      room: newRoom.trim() || 'Aula Magna',
      registrationStatus: 'In attesa',
      daysRemaining: daysRem,
      progress: 0,
      notesPercentage: 0,
      notesCompleted: 0,
      notesTotal: 0,
      repetitionsDone: 0,
      repetitionsTotal: 10,
      topicsToReview: matchedCourse?.topics ? [...matchedCourse.topics] : [],
      status: 'upcoming',
    });

    setIsAddingExam(false);
  };

  const upcomingExams = esami.filter((e) => e.status === 'upcoming');
  const completedExams = esami.filter((e) => e.status === 'completed');
  const nextExam = upcomingExams[0];

  const displayedExams = activeTab === 'prossimi' ? upcomingExams : esami;

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-8">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        {/* Header Title & Subtabs */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Appelli ed Esami</h2>
              </div>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                Pianifica le sessioni d'esame, monitora il countdown e sincronizza le date col calendario.
              </p>
            </div>

            <button
              onClick={() => setIsAddingExam(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              <span>Aggiungi Appello Esame</span>
            </button>
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
                Prossimi esami ({upcomingExams.length})
              </button>
              <button
                onClick={() => setActiveTab('tutti')}
                className={`pb-3 text-xs font-bold transition-all relative ${
                  activeTab === 'tutti'
                    ? 'text-blue-600 dark:text-blue-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Tutti gli esami ({esami.length})
              </button>
              <button
                onClick={() => setCurrentView('calendario')}
                className="pb-3 text-xs font-bold transition-all text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Vai al Calendario</span>
              </button>
            </div>
          </div>
        </div>

        {/* EXAMS LIST */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              {activeTab === 'prossimi' ? `PROSSIMI APPELLI (${upcomingExams.length})` : `TUTTI GLI ESAMI (${esami.length})`}
            </h4>
          </div>

          {displayedExams.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h5 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                Nessun esame registrato in questa sezione
              </h5>
              <p className="text-xs text-slate-400 max-w-sm">
                Aggiungi le date dei tuoi prossimi appelli per tenere d'occhio il countdown e sincronizzarli nel calendario.
              </p>
              <button
                onClick={() => setIsAddingExam(true)}
                className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700"
              >
                + Aggiungi il tuo primo esame
              </button>
            </div>
          ) : (
            displayedExams.map((exam, idx) => {
              const cardBgColors = [
                { badgeBg: 'bg-purple-600 text-white', countdownBg: 'bg-purple-600 text-white' },
                { badgeBg: 'bg-blue-600 text-white', countdownBg: 'bg-blue-600 text-white' },
                { badgeBg: 'bg-emerald-600 text-white', countdownBg: 'bg-emerald-600 text-white' },
              ];
              const style = cardBgColors[idx % cardBgColors.length];

              return (
                <div
                  key={exam.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-5 relative overflow-hidden transition-all hover:shadow-md"
                >
                  {/* Header Row: Subject, Professor, Countdown badge, Delete */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl ${style.badgeBg} flex items-center justify-center font-extrabold text-base shadow-md`}
                      >
                        {exam.courseName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                          {exam.courseName}
                        </h3>
                        <p className="text-xs text-slate-400 font-semibold">{exam.professor}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Countdown Badge Card */}
                      <div
                        className={`px-4 py-2.5 rounded-2xl ${style.countdownBg} flex flex-col items-center justify-center shadow-md text-center min-w-[100px]`}
                      >
                        <span className="text-[9px] font-extrabold uppercase tracking-wider opacity-90">
                          {exam.daysRemaining === 0 ? 'OGGI' : 'MANCANO'}
                        </span>
                        <span className="text-xl font-extrabold leading-none my-0.5">
                          {exam.daysRemaining} {exam.daysRemaining === 1 ? 'giorno' : 'giorni'}
                        </span>
                        <span className="text-[9px] font-semibold opacity-90">
                          {exam.date}
                        </span>
                      </div>

                      <button
                        onClick={() => deleteEsame(exam.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Elimina esame"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Details Bar: Date, Time, Room, Registration */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 text-xs border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Data Appello</span>
                        <span className="font-bold text-slate-900 dark:text-white">{exam.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Orario</span>
                        <span className="font-bold text-slate-900 dark:text-white">{exam.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Aula</span>
                        <span className="font-bold text-slate-900 dark:text-white">{exam.room || 'Aula Magna'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Stato Iscrizione</span>
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                          {exam.registrationStatus || 'Confermata'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Topics checklist if available */}
                  {exam.topicsToReview && exam.topicsToReview.length > 0 && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        Argomenti da ripassare:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {exam.topicsToReview.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => toggleExamTopic(exam.id, t.id)}
                            className="flex items-center gap-2 text-left p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                          >
                            <span className={`w-4 h-4 rounded-md flex items-center justify-center border ${t.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                              {t.completed && '✓'}
                            </span>
                            <span className={t.completed ? 'line-through opacity-60' : ''}>{t.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
        {/* Session Stats Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-600" />
            <span>Riepilogo Sessione</span>
          </h4>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900">
              <span className="text-xl font-extrabold text-purple-600 dark:text-purple-400 block leading-tight">
                {upcomingExams.length}
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Da Sostenere</span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 block leading-tight">
                {completedExams.length}
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Completati</span>
            </div>
          </div>
        </div>

        {/* Next Exam Banner */}
        {nextExam && (
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-3xl p-5 shadow-lg shadow-purple-600/20 flex flex-col gap-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-200">
                PROSSIMO APPELLO
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold">
                {nextExam.daysRemaining} gg
              </span>
            </div>

            <div>
              <h4 className="text-base font-extrabold leading-tight">{nextExam.courseName}</h4>
              <p className="text-xs text-purple-100 mt-1">
                📅 {nextExam.date} • ⏰ {nextExam.time}
              </p>
              <p className="text-xs text-purple-200">
                📍 {nextExam.room || 'Aula Magna'} • {nextExam.professor}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add Exam Modal */}
      {isAddingExam && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Nuovo Appello d'Esame</h3>
              </div>
              <button
                onClick={() => setIsAddingExam(false)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Corso / Materia *</label>
                {corsi.length > 0 ? (
                  <select
                    value={newCourseName}
                    onChange={(e) => handleCourseSelect(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 font-bold"
                  >
                    {corsi.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.professor})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    placeholder="Es. Analisi Matematica 1"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 font-bold"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Docente</label>
                  <input
                    type="text"
                    value={newProfessor}
                    onChange={(e) => setNewProfessor(e.target.value)}
                    placeholder="Es. Prof.ssa Rossi"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Data Appello *</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 font-bold"
                  />
                </div>
              </div>

              {/* Time Slot Picker for Exam */}
              <TimeSlotPicker
                label="Orario Appello"
                startTime={newStartTime}
                endTime={newEndTime}
                onChange={(s, e) => {
                  setNewStartTime(s);
                  setNewEndTime(e);
                }}
              />

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Aula d'esame</label>
                <input
                  type="text"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  placeholder="Es. Aula Magna / Lab Informatico"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingExam(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20 hover:bg-purple-700"
                >
                  Salva Appello (Sincronizza in Calendario)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
