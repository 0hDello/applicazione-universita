import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TimeSlotPicker } from '../common/TimeSlotPicker';
import { openGoogleMaps } from '../../utils/mapUtils';
import type { RegistrationStatus, Esame } from '../../types';
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
  ExternalLink,
  Edit3,
} from 'lucide-react';

export const EsamiView: React.FC = () => {
  const { esami, addEsame, updateEsame, deleteEsame, toggleExamTopic, corsi, setCurrentView, userSettings } = useApp();
  const [activeTab, setActiveTab] = useState<'prossimi' | 'tutti'>('prossimi');
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [editingExam, setEditingExam] = useState<Esame | null>(null);

  // New Exam Form State
  const [newCourseName, setNewCourseName] = useState(corsi[0]?.name || '');
  const [newProfessor, setNewProfessor] = useState(corsi[0]?.professor || '');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('11:00');
  const [newRoom, setNewRoom] = useState('Aula Magna');
  const [newRegStatus, setNewRegStatus] = useState<RegistrationStatus>('In attesa');

  // Edit Exam Form State
  const [editCourseName, setEditCourseName] = useState('');
  const [editProfessor, setEditProfessor] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('09:00');
  const [editEndTime, setEditEndTime] = useState('11:00');
  const [editRoom, setEditRoom] = useState('');
  const [editRegStatus, setEditRegStatus] = useState<RegistrationStatus>('In attesa');

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
      registrationStatus: newRegStatus,
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

  const openEditExamModal = (exam: Esame) => {
    setEditingExam(exam);
    setEditCourseName(exam.courseName);
    setEditProfessor(exam.professor);
    setEditDate(exam.date);
    const parts = exam.time.split('-').map((s) => s.trim());
    setEditStartTime(parts[0] || '09:00');
    setEditEndTime(parts[1] || '11:00');
    setEditRoom(exam.room || 'Aula Magna');
    setEditRegStatus(exam.registrationStatus || 'In attesa');
  };

  const handleSaveEditExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam || !editCourseName.trim()) return;

    updateEsame(editingExam.id, {
      courseName: editCourseName.trim(),
      professor: editProfessor.trim(),
      date: editDate,
      time: `${editStartTime} - ${editEndTime}`,
      room: editRoom.trim(),
      registrationStatus: editRegStatus,
    });

    setEditingExam(null);
  };

  const getStatusBadge = (status: RegistrationStatus) => {
    switch (status) {
      case 'Iscritto':
      case 'Confermata':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'In attesa':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Non iscritto':
        return 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'Verbalizzato':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200';
    }
  };

  const upcomingExams = esami.filter((e) => e.status === 'upcoming');
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
                Pianifica le sessioni d'esame, monitora il countdown, gestisci lo stato di iscrizione e sincronizza le date col calendario.
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
                  {/* Header Row: Subject, Professor, Countdown badge, Actions */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
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
                        className={`px-4 py-2 rounded-2xl ${style.countdownBg} flex flex-col items-center justify-center shadow-md text-center min-w-[100px]`}
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
                        onClick={() => openEditExamModal(exam)}
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                        title="Modifica esame"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteEsame(exam.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Elimina esame"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Details Bar: Date, Time, Room, Registration Status Selector */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 text-xs border border-slate-100 dark:border-slate-800 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <CalendarIcon className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-slate-400 block font-semibold">Data Appello</span>
                        <span className="font-bold text-slate-900 dark:text-white truncate block">{exam.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-slate-400 block font-semibold">Orario</span>
                        <span className="font-bold text-slate-900 dark:text-white truncate block">{exam.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <span className="text-[10px] text-slate-400 block font-semibold">Aula / Sede</span>
                        <button
                          onClick={() => openGoogleMaps(exam.room, userSettings.university)}
                          className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 max-w-full text-left truncate"
                          title="Apri su Google Maps"
                        >
                          <span className="truncate">{exam.room || 'Aula da definire'}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <span className="text-[10px] text-slate-400 block font-semibold">Stato Iscrizione</span>
                        <select
                          value={exam.registrationStatus || 'In attesa'}
                          onChange={(e) => updateEsame(exam.id, { registrationStatus: e.target.value as RegistrationStatus })}
                          className={`mt-0.5 px-2 py-0.5 rounded-lg text-xs font-bold border cursor-pointer focus:outline-none w-full max-w-full truncate ${getStatusBadge(
                            exam.registrationStatus || 'In attesa'
                          )}`}
                        >
                          <option value="In attesa">⏳ In attesa</option>
                          <option value="Iscritto">✅ Iscritto</option>
                          <option value="Confermata">🎯 Confermata</option>
                          <option value="Non iscritto">❌ Non iscritto</option>
                          <option value="Verbalizzato">🏆 Verbalizzato</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Topics to Review Checklist */}
                  {exam.topicsToReview && exam.topicsToReview.length > 0 && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Argomenti da ripassare per l'esame ({exam.topicsToReview.filter((t) => t.completed).length}/{exam.topicsToReview.length})
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {exam.topicsToReview.map((topic) => (
                          <div
                            key={topic.id}
                            onClick={() => toggleExamTopic(exam.id, topic.id)}
                            className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 cursor-pointer hover:bg-blue-50/30 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={topic.completed}
                              onChange={() => {}}
                              className="w-3.5 h-3.5 text-blue-600 rounded cursor-pointer"
                            />
                            <span
                              className={`text-xs font-semibold ${
                                topic.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {topic.name}
                            </span>
                          </div>
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

      {/* Right Sidebar Info */}
      <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Riepilogo Esami</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-center">
              <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400 block">
                {upcomingExams.length}
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Prossimi Appelli</span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-center">
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 block">
                {esami.filter((e) => e.registrationStatus === 'Iscritto' || e.registrationStatus === 'Confermata').length}
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Iscrizioni Confermate</span>
            </div>
          </div>
        </div>
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
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Aggiungi Appello Esame</h3>
              </div>
              <button
                onClick={() => setIsAddingExam(false)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Materia / Corso *</label>
                  <select
                    value={newCourseName}
                    onChange={(e) => handleCourseSelect(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-bold"
                  >
                    {corsi.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    <option value="Altro Corso">Altro Corso</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Docente</label>
                  <input
                    type="text"
                    value={newProfessor}
                    onChange={(e) => setNewProfessor(e.target.value)}
                    placeholder="Prof. Nome Cognome"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Data Appello *</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Stato Iscrizione</label>
                  <select
                    value={newRegStatus}
                    onChange={(e) => setNewRegStatus(e.target.value as RegistrationStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-bold"
                  >
                    <option value="In attesa">⏳ In attesa</option>
                    <option value="Iscritto">✅ Iscritto</option>
                    <option value="Confermata">🎯 Confermata</option>
                    <option value="Non iscritto">❌ Non iscritto</option>
                    <option value="Verbalizzato">🏆 Verbalizzato</option>
                  </select>
                </div>
              </div>

              {/* Time Slot Picker */}
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
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Aula / Sede *</label>
                <input
                  type="text"
                  required
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  placeholder="Es. Aula Magna / Aula 3"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold"
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
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700"
                >
                  Salva Appello & Sincronizza
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Exam Modal */}
      {editingExam && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Modifica Appello Esame</h3>
              </div>
              <button
                onClick={() => setEditingExam(null)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditExam} className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Materia / Corso *</label>
                  <input
                    type="text"
                    required
                    value={editCourseName}
                    onChange={(e) => setEditCourseName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Docente</label>
                  <input
                    type="text"
                    value={editProfessor}
                    onChange={(e) => setEditProfessor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Data Appello *</label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Stato Iscrizione</label>
                  <select
                    value={editRegStatus}
                    onChange={(e) => setEditRegStatus(e.target.value as RegistrationStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-bold"
                  >
                    <option value="In attesa">⏳ In attesa</option>
                    <option value="Iscritto">✅ Iscritto</option>
                    <option value="Confermata">🎯 Confermata</option>
                    <option value="Non iscritto">❌ Non iscritto</option>
                    <option value="Verbalizzato">🏆 Verbalizzato</option>
                  </select>
                </div>
              </div>

              {/* Time Slot Picker */}
              <TimeSlotPicker
                label="Orario Appello"
                startTime={editStartTime}
                endTime={editEndTime}
                onChange={(s, e) => {
                  setEditStartTime(s);
                  setEditEndTime(e);
                }}
              />

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Aula / Sede *</label>
                <input
                  type="text"
                  required
                  value={editRoom}
                  onChange={(e) => setEditRoom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingExam(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700"
                >
                  Salva Modifiche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
