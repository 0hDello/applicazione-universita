import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CorsoDetailModal } from './CorsoDetailModal';
import { CorsoVisualCustomizer } from './CorsoVisualCustomizer';
import { ImportOrarioModal } from './ImportOrarioModal';
import { TimeSlotPicker } from '../common/TimeSlotPicker';
import {
  GraduationCap,
  BookOpen,
  Search,
  ChevronDown,
  Plus,
  X,
  Calendar,
  ArrowRight,
  Sparkles,
  Palette,
  AlertTriangle,
  Award,
} from 'lucide-react';
import type { Corso } from '../../types';

export const CorsiView: React.FC = () => {
  const { corsi, toggleCourseTopic, addCorso, updateCorso } = useApp();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [customizingCourse, setCustomizingCourse] = useState<Corso | null>(null);
  const [isImportingOrario, setIsImportingOrario] = useState<boolean>(false);

  // New Course Modal State
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseCFU, setNewCourseCFU] = useState('6');
  const [newCourseProfessor, setNewCourseProfessor] = useState('');
  const [newCourseSemestre, setNewCourseSemestre] = useState('1° Semestre');
  const [newCourseAula, setNewCourseAula] = useState('');
  const [newCourseEmoji, setNewCourseEmoji] = useState('📚');
  const [newCourseColor, setNewCourseColor] = useState('#2563eb');
  const [newCourseAttendanceMandatory, setNewCourseAttendanceMandatory] = useState(false);
  const [newCourseMinAttendance, setNewCourseMinAttendance] = useState('75');
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('11:00');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemestre, setSelectedSemestre] = useState('Tutti');
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  const selectedCourse = corsi.find((c) => c.id === selectedCourseId);

  const filteredCorsi = corsi.filter((c) => {
    if (
      searchTerm &&
      !c.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !c.code.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !c.professor.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    if (selectedSemestre !== 'Tutti' && c.semestre && c.semestre !== selectedSemestre) return false;
    return true;
  });

  const toggleExpand = (courseId: string) => {
    setExpandedTopics((prev) => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  // Global counts
  const totalDaRecuperare = corsi.reduce((acc, c) => {
    const daRecup = (c.lezioni || []).filter(
      (l) => (l.status === 'da_recuperare' || l.attendance === 'assente') && !l.recovered
    ).length;
    return acc + daRecup;
  }, 0);

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Title Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Corsi Accademici</h2>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Gestisci i tuoi insegnamenti, calcola le presenze obbligatorie e monitora le lezioni da recuperare.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsImportingOrario(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Importa da Screenshot (OCR)</span>
          </button>

          <button
            onClick={() => setIsAddingCourse(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Aggiungi nuovo corso</span>
          </button>
        </div>
      </div>

      {/* TOP KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Corsi attivi */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block">Corsi attivi</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {corsi.length}
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Piano di studi</span>
          </div>
        </div>

        {/* KPI 2: Progresso medio */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold text-sm">
            {corsi.length > 0
              ? Math.round(corsi.reduce((acc, c) => acc + c.progress, 0) / corsi.length)
              : 0}
            %
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block">Progresso medio</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {corsi.length > 0
                ? Math.round(corsi.reduce((acc, c) => acc + c.progress, 0) / corsi.length)
                : 0}
              %
            </h3>
            <span className="text-[10px] text-emerald-600 font-medium">Programma d'esame</span>
          </div>
        </div>

        {/* KPI 3: CFU totali */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block">CFU Totali</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {corsi.reduce((acc, c) => acc + (c.cfu || 0), 0)}
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Crediti formativi</span>
          </div>
        </div>

        {/* KPI 4: Da recuperare */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block">Da recuperare</span>
            <h3 className="text-xl font-extrabold text-amber-600 leading-tight">
              {totalDaRecuperare}
            </h3>
            <span className="text-[10px] text-amber-600/80 font-medium">
              {totalDaRecuperare === 1 ? 'lezione in arretrato' : 'lezioni in arretrato'}
            </span>
          </div>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-xs font-semibold">
          {['Tutti', '1° Semestre', '2° Semestre', 'Annuale'].map((sem) => (
            <button
              key={sem}
              onClick={() => setSelectedSemestre(sem)}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                selectedSemestre === sem
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {sem}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cerca per nome, codice o docente..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
          />
        </div>
      </div>

      {/* COURSES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCorsi.map((course) => {
          const lezioni = course.lezioni || [];
          const totalLez = lezioni.length;
          const svolteLez = lezioni.filter(
            (l) => l.status === 'svolta' || l.attendance === 'presente'
          ).length;
          const daRecupCount = lezioni.filter(
            (l) => (l.status === 'da_recuperare' || l.attendance === 'assente') && !l.recovered
          ).length;

          // Attendance calculation
          const presenti = lezioni.filter((l) => l.attendance === 'presente').length;
          const assenti = lezioni.filter((l) => l.attendance === 'assente').length;
          const recorded = presenti + assenti;
          const attendancePct = recorded > 0 ? Math.round((presenti / recorded) * 100) : 100;

          const showAll = expandedTopics[course.id];
          const topicsToShow = showAll ? course.topics : course.topics.slice(0, 3);

          return (
            <div
              key={course.id}
              onClick={() => setSelectedCourseId(course.id)}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col overflow-hidden group"
            >
              {/* CARD BANNER HEADER */}
              <div
                className={`h-20 w-full bg-linear-to-r ${course.bannerGradient || 'from-blue-600 via-indigo-600 to-sky-500'} relative flex items-end px-5 pb-2.5`}
                style={
                  course.bannerUrl
                    ? {
                        backgroundImage: `url(${course.bannerUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                    : undefined
                }
              >
                <div className="absolute inset-0 bg-black/20" />

                <div className="flex items-center justify-between w-full relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 shadow-lg flex items-center justify-center text-xl border border-white/50"
                      style={{ color: course.color || '#2563eb' }}
                    >
                      {course.emoji || '📚'}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 backdrop-blur-xs text-white border border-white/30">
                      {course.cfu} CFU
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCustomizingCourse(course);
                    }}
                    className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs transition-colors"
                    title="Personalizza aspetto visivo"
                  >
                    <Palette className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* CARD BODY */}
              <div className="p-5 flex flex-col gap-4 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 transition-colors leading-snug line-clamp-1">
                      {course.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      Docente: {course.professor}
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-full border-3 border-blue-500/20 dark:border-blue-500/40 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400">
                      {course.progress}%
                    </span>
                  </div>
                </div>

                {/* BADGES ROW */}
                <div className="flex items-center gap-2 flex-wrap">
                  {course.attendanceMandatory ? (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        attendancePct >= (course.minAttendancePercentage || 75)
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                      }`}
                    >
                      <Award className="w-3 h-3" />
                      <span>Presenze {attendancePct}% (Min {course.minAttendancePercentage || 75}%)</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      Frequenza facoltativa
                    </span>
                  )}

                  {daRecupCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{daRecupCount} da recuperare</span>
                    </span>
                  )}
                </div>

                {/* Lecture Stats */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 font-medium block">Registro Lezioni</span>
                    <p className="font-bold text-slate-900 dark:text-white text-[11px] flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-blue-600" />
                      <span>{totalLez} {totalLez === 1 ? 'lezione' : 'lezioni'}</span>
                    </p>
                    <p className="text-[10px] text-emerald-600 font-semibold">{svolteLez} svolte</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-emerald-600 font-bold">Appunti</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {course.notesOrganized}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${course.notesOrganized}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Topics Preview */}
                <div className="flex flex-col gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      PROGRAMMA CORSO
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {course.topics.filter((t) => t.completed).length}/{course.topics.length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {topicsToShow.map((t) => (
                      <label
                        key={t.id}
                        className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={t.completed}
                          onChange={() => toggleCourseTopic(course.id, t.id)}
                          className="w-3.5 h-3.5 rounded text-blue-600"
                        />
                        <span className={t.completed ? 'line-through text-slate-400 truncate' : 'truncate'}>
                          {t.name}
                        </span>
                      </label>
                    ))}
                    {course.topics.length === 0 && (
                      <p className="text-[11px] text-slate-400 italic">Nessun argomento aggiunto.</p>
                    )}
                  </div>

                  {course.topics.length > 3 && (
                    <button
                      onClick={() => toggleExpand(course.id)}
                      className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1 mt-1"
                    >
                      <span>{showAll ? 'Mostra meno' : `Mostra tutti (${course.topics.length})`}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${showAll ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>

                {/* Bottom Action Hint */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-semibold group-hover:text-blue-700 mt-auto">
                  <span>Apri registro & presenze</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: COURSE DETAIL */}
      {selectedCourse && (
        <CorsoDetailModal
          course={selectedCourse}
          onClose={() => setSelectedCourseId(null)}
        />
      )}

      {/* MODAL: COURSE VISUAL CUSTOMIZER */}
      {customizingCourse && (
        <CorsoVisualCustomizer
          course={customizingCourse}
          onSave={(updates) => updateCorso(customizingCourse.id, updates)}
          onClose={() => setCustomizingCourse(null)}
        />
      )}

      {/* MODAL: IMPORT ORARIO OCR */}
      {isImportingOrario && (
        <ImportOrarioModal onClose={() => setIsImportingOrario(false)} />
      )}

      {/* MODAL: ADD COURSE */}
      {isAddingCourse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nuovo Corso</h3>
              <button
                onClick={() => setIsAddingCourse(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addCorso({
                  code: newCourseCode.trim() || 'CRS',
                  name: newCourseName.trim(),
                  cfu: parseInt(newCourseCFU) || 6,
                  professor: newCourseProfessor.trim(),
                  semestre: newCourseSemestre,
                  aulaAbituale: newCourseAula.trim(),
                  orarioAbituale: `${newStartTime} - ${newEndTime}`,
                  progress: 0,
                  emoji: newCourseEmoji,
                  color: newCourseColor,
                  attendanceMandatory: newCourseAttendanceMandatory,
                  minAttendancePercentage: parseInt(newCourseMinAttendance) || 75,
                  nextLecture: {
                    date: '-',
                    dayName: 'Da definire',
                    time: `${newStartTime} - ${newEndTime}`,
                    room: newCourseAula || '-',
                  },
                  notesOrganized: 0,
                  repetitionsDone: 0,
                  repetitionsTotal: 0,
                  topics: [],
                  lezioni: [],
                  icon: 'BookOpen',
                });
                setIsAddingCourse(false);
                setNewCourseName('');
                setNewCourseCode('');
                setNewCourseCFU('6');
                setNewCourseProfessor('');
                setNewCourseAula('');
              }}
              className="flex flex-col gap-3 text-xs"
            >
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nome Corso *
                </label>
                <input
                  type="text"
                  required
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="Es. Analisi Matematica 1"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Codice Corso
                  </label>
                  <input
                    type="text"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    placeholder="Es. MAT01"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    CFU *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newCourseCFU}
                    onChange={(e) => setNewCourseCFU(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Docente
                </label>
                <input
                  type="text"
                  value={newCourseProfessor}
                  onChange={(e) => setNewCourseProfessor(e.target.value)}
                  placeholder="Es. Prof. Rossi"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Emoji Icona
                  </label>
                  <input
                    type="text"
                    value={newCourseEmoji}
                    onChange={(e) => setNewCourseEmoji(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center text-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Semestre
                  </label>
                  <select
                    value={newCourseSemestre}
                    onChange={(e) => setNewCourseSemestre(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="1° Semestre">1° Semestre</option>
                    <option value="2° Semestre">2° Semestre</option>
                    <option value="Annuale">Annuale</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Aula Abituale (opzionale)
                  </label>
                  <input
                    type="text"
                    value={newCourseAula}
                    onChange={(e) => setNewCourseAula(e.target.value)}
                    placeholder="Es. Aula 4B"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Colore Riconoscimento
                  </label>
                  <div className="flex items-center gap-2 h-9">
                    <input
                      type="color"
                      value={newCourseColor}
                      onChange={(e) => setNewCourseColor(e.target.value)}
                      className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
                    />
                    <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">{newCourseColor}</span>
                  </div>
                </div>
              </div>

              {/* Time Slot Picker */}
              <TimeSlotPicker
                label="Orario Abituale Lezioni"
                startTime={newStartTime}
                endTime={newEndTime}
                onChange={(s, e) => {
                  setNewStartTime(s);
                  setNewEndTime(e);
                }}
              />

              {/* Attendance Mandatory Option */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCourseAttendanceMandatory}
                    onChange={(e) => setNewCourseAttendanceMandatory(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Frequenza Obbligatoria
                  </span>
                </label>

                {newCourseAttendanceMandatory && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-slate-500">Soglia minima:</span>
                    <input
                      type="number"
                      min="50"
                      max="100"
                      step="5"
                      value={newCourseMinAttendance}
                      onChange={(e) => setNewCourseMinAttendance(e.target.value)}
                      className="w-16 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center font-bold text-blue-600"
                    />
                    <span className="text-[11px] font-bold text-slate-500">%</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCourse(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20 hover:bg-blue-700"
                >
                  Crea Corso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
