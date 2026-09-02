import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CorsoDetailModal } from './CorsoDetailModal';
import { CorsoVisualCustomizer } from './CorsoVisualCustomizer';
import { ImportOrarioModal } from './ImportOrarioModal';
import { TimeSlotPicker } from '../common/TimeSlotPicker';
import { DEGREE_PROGRAMS } from '../../data/degreePrograms';
import {
  GraduationCap,
  BookOpen,
  Search,
  Plus,
  Sparkles,
  Palette,
  AlertTriangle,
  Award,
  MapPin,
  Clock,
  ChevronRight,
  BookMarked,
  Trash2,
  X,
} from 'lucide-react';
import type { Corso } from '../../types';

export const CorsiView: React.FC = () => {
  const {
    corsi,
    addCorso,
    updateCorso,
    deleteCorso,
    loadPredefinedCoursesForProgram,
  } = useApp();

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [customizingCourse, setCustomizingCourse] = useState<Corso | null>(null);
  const [isImportingOrario, setIsImportingOrario] = useState<boolean>(false);
  const [showProgramPicker, setShowProgramPicker] = useState<boolean>(false);

  // New Course Modal State
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseCFU, setNewCourseCFU] = useState('6');
  const [newCourseProfessor, setNewCourseProfessor] = useState('');
  const [newCourseSemestre, setNewCourseSemestre] = useState('1° Semestre');
  const [newCourseYear, setNewCourseYear] = useState<number>(1);
  const [newCourseAula, setNewCourseAula] = useState('');
  const [newCourseEmoji] = useState('📚');
  const [newCourseColor] = useState('#2563eb');
  const [newCourseAttendanceMandatory, setNewCourseAttendanceMandatory] = useState(false);
  const [newCourseMinAttendance, setNewCourseMinAttendance] = useState('75');
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('11:00');

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<'Tutti' | '1' | '2' | '3'>('Tutti');
  const [selectedSemestre, setSelectedSemestre] = useState('Tutti');

  const selectedCourse = corsi.find((c) => c.id === selectedCourseId);

  // Filtered Courses List
  const filteredCorsi = corsi.filter((c) => {
    // Search query filter
    if (
      searchTerm &&
      !c.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !c.code.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !c.professor.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Year filter
    if (selectedYear !== 'Tutti') {
      const targetYear = parseInt(selectedYear);
      if (c.year && c.year !== targetYear) return false;
    }

    // Semester filter
    if (selectedSemestre !== 'Tutti' && c.semestre && c.semestre !== selectedSemestre) {
      return false;
    }

    return true;
  });

  // Global counts
  const totalDaRecuperare = corsi.reduce((acc, c) => {
    const daRecup = (c.lezioni || []).filter(
      (l) => (l.status === 'da_recuperare' || l.attendance === 'assente') && !l.recovered
    ).length;
    return acc + daRecup;
  }, 0);

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    addCorso({
      name: newCourseName.trim(),
      code: newCourseCode.trim() || `CORSO-${Date.now().toString().slice(-4)}`,
      cfu: parseInt(newCourseCFU) || 6,
      professor: newCourseProfessor.trim() || 'Docente da definire',
      semestre: newCourseSemestre,
      year: newCourseYear,
      aulaAbituale: newCourseAula.trim(),
      orarioAbituale: `${newStartTime} - ${newEndTime}`,
      color: newCourseColor,
      icon: 'BookOpen',
      emoji: newCourseEmoji,
      bannerGradient: 'from-blue-600 via-indigo-600 to-sky-500',
      progress: 0,
      attendanceMandatory: newCourseAttendanceMandatory,
      minAttendancePercentage: parseInt(newCourseMinAttendance) || 75,
      notesOrganized: 0,
      repetitionsDone: 0,
      repetitionsTotal: 10,
      topics: [
        { id: `t_${Date.now()}_1`, name: 'Modulo 1: Fondamenti e Teoria', completed: false },
        { id: `t_${Date.now()}_2`, name: 'Modulo 2: Esercitazioni e Casi Studio', completed: false },
        { id: `t_${Date.now()}_3`, name: 'Modulo 3: Prova Pratica e Preparazione Esame', completed: false },
      ],
      lezioni: [],
    });

    // Reset Form
    setNewCourseName('');
    setNewCourseCode('');
    setNewCourseCFU('6');
    setNewCourseProfessor('');
    setNewCourseAula('');
    setIsAddingCourse(false);
  };

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Title & Action Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Corsi Accademici & Piano di Studi</h2>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Visualizzazione compatta del piano di studi, calcolo presenze e lezioni da recuperare.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Load Degree Program Button */}
          <div className="relative">
            <button
              onClick={() => setShowProgramPicker(!showProgramPicker)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold hover:bg-purple-100 transition-colors shadow-xs"
              title="Carica corsi tipici del corso di laurea"
            >
              <BookMarked className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Carica Piano di Studi</span>
            </button>

            {showProgramPicker && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xl p-3 z-40 animate-in fade-in zoom-in-95">
                <div className="p-2 border-b border-slate-100 dark:border-zinc-800 mb-2">
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                    Seleziona Indirizzo di Studi
                  </h5>
                  <p className="text-[10px] text-slate-400">
                    Carica automaticamente l'elenco dei corsi ufficiali per il percorso selezionato.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto">
                  {DEGREE_PROGRAMS.map((prog) => (
                    <button
                      key={prog.id}
                      onClick={() => {
                        if (
                          corsi.length === 0 ||
                          window.confirm(
                            `Vuoi caricare i corsi per "${prog.shortName}"? I corsi verranno aggiunti al tuo piano di studi.`
                          )
                        ) {
                          loadPredefinedCoursesForProgram(prog.id, corsi.length === 0);
                          setShowProgramPicker(false);
                        }
                      }}
                      className="p-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors flex flex-col gap-0.5"
                    >
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {prog.shortName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {prog.university} • {prog.courses.length} insegnamenti ({prog.totalCFU} CFU)
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsImportingOrario(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Importa Orario OCR</span>
          </button>

          <button
            onClick={() => setIsAddingCourse(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nuovo corso</span>
          </button>
        </div>
      </div>

      {/* TOP KPI CARDS ROW (Compact & Clean) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Insegnamenti */}
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block">Corsi attivi</span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
              {corsi.length} insegnamenti
            </h3>
          </div>
        </div>

        {/* KPI 2: CFU Totali */}
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block">CFU Totali</span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
              {corsi.reduce((acc, c) => acc + (c.cfu || 0), 0)} Crediti
            </h3>
          </div>
        </div>

        {/* KPI 3: Progresso Medio */}
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold text-xs">
            {corsi.length > 0
              ? Math.round(corsi.reduce((acc, c) => acc + c.progress, 0) / corsi.length)
              : 0}%
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block">Progresso medio</span>
            <h3 className="text-base font-extrabold text-emerald-600 leading-tight">
              {corsi.length > 0
                ? Math.round(corsi.reduce((acc, c) => acc + c.progress, 0) / corsi.length)
                : 0}% completato
            </h3>
          </div>
        </div>

        {/* KPI 4: Da recuperare */}
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block">Da recuperare</span>
            <h3 className="text-base font-extrabold text-amber-600 leading-tight">
              {totalDaRecuperare} {totalDaRecuperare === 1 ? 'lezione' : 'lezioni'}
            </h3>
          </div>
        </div>
      </div>

      {/* FILTER BAR: YEAR, SEMESTER & SEARCH */}
      <div className="p-3 bg-white dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-xs flex items-center justify-between flex-wrap gap-3">
        {/* Filter Pills Group */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Year Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl text-xs font-bold">
            <span className="px-2 text-[10px] text-slate-400 uppercase tracking-wider">Anno:</span>
            {[
              { id: 'Tutti', label: 'Tutti' },
              { id: '1', label: '1° Anno' },
              { id: '2', label: '2° Anno' },
              { id: '3', label: '3° Anno' },
            ].map((y) => (
              <button
                key={y.id}
                onClick={() => setSelectedYear(y.id as any)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  selectedYear === y.id
                    ? 'bg-white dark:bg-black text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {y.label}
              </button>
            ))}
          </div>

          {/* Semester Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl text-xs font-bold">
            <span className="px-2 text-[10px] text-slate-400 uppercase tracking-wider">Semestre:</span>
            {['Tutti', '1° Semestre', '2° Semestre', 'Annuale'].map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemestre(sem)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  selectedSemestre === sem
                    ? 'bg-white dark:bg-black text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {sem}
              </button>
            ))}
          </div>
        </div>

        {/* Realtime Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cerca per materia, docente o codice..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* COMPACT RESPONSIVE COURSES GRID (2-3 Columns) */}
      {filteredCorsi.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center gap-3 bg-white dark:bg-zinc-950 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 p-8">
          <BookOpen className="w-10 h-10 text-slate-300 dark:text-zinc-700" />
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Nessun corso trovato con i filtri attuali
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              {searchTerm || selectedYear !== 'Tutti' || selectedSemestre !== 'Tutti'
                ? 'Prova a modificare i filtri di ricerca o l\'anno selezionato.'
                : 'Puoi caricare un piano di studi predefinito (es. Ingegneria Meccanica UniBo) o aggiungere un corso manualmente.'}
            </p>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedYear('Tutti');
                setSelectedSemestre('Tutti');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold"
            >
              Azzera filtri
            </button>
            <button
              onClick={() => loadPredefinedCoursesForProgram('ingegneria_meccanica_unibo', true)}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors"
            >
              Carica Corsi Ingegneria Meccanica Bologna
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCorsi.map((course) => {
            const lezioni = course.lezioni || [];
            const totalLez = lezioni.length;
            const svolteLez = lezioni.filter(
              (l) => l.status === 'svolta' || l.attendance === 'presente'
            ).length;
            const daRecupCount = lezioni.filter(
              (l) => (l.status === 'da_recuperare' || l.attendance === 'assente') && !l.recovered
            ).length;

            const presenti = lezioni.filter((l) => l.attendance === 'presente').length;
            const assenti = lezioni.filter((l) => l.attendance === 'assente').length;
            const recorded = presenti + assenti;
            const attendancePct = recorded > 0 ? Math.round((presenti / recorded) * 100) : 100;

            return (
              <div
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                className="bg-white dark:bg-zinc-950 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-xs hover:shadow-xl hover:border-slate-300 dark:hover:border-zinc-700 transition-all cursor-pointer flex flex-col overflow-hidden group"
              >
                {/* Visual Banner Header */}
                <div
                  className={`h-16 w-full bg-linear-to-r ${course.bannerGradient || 'from-blue-600 via-indigo-600 to-sky-500'} relative flex items-end px-4 pb-2`}
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
                  <div className="absolute inset-0 bg-black/25" />

                  <div className="flex items-center justify-between w-full relative z-10">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-900 shadow-md flex items-center justify-center text-lg border border-white/40"
                        style={{ color: course.color || '#2563eb' }}
                      >
                        {course.emoji || '📚'}
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 backdrop-blur-xs text-white border border-white/30">
                        {course.cfu} CFU
                      </span>
                      {course.year && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/30 backdrop-blur-xs text-white border border-white/20">
                          {course.year}° Anno
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setCustomizingCourse(course)}
                        className="p-1 rounded-lg bg-white/20 hover:bg-white/40 text-white backdrop-blur-xs transition-colors"
                        title="Personalizza grafica corso"
                      >
                        <Palette className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Vuoi eliminare il corso "${course.name}"?`)) {
                            deleteCorso(course.id);
                          }
                        }}
                        className="p-1 rounded-lg bg-white/20 hover:bg-red-600/80 text-white backdrop-blur-xs transition-colors"
                        title="Elimina corso"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Compact Card Body */}
                <div className="p-4 flex flex-col gap-3 flex-1">
                  {/* Title & Professor */}
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-1">
                      {course.name}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                      <span className="truncate">{course.professor}</span>
                      {course.semestre && (
                        <span className="shrink-0 font-medium text-slate-500 dark:text-zinc-400">
                          {course.semestre}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Room & Time info */}
                  {(course.aulaAbituale || course.orarioAbituale) && (
                    <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900/80 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                      {course.aulaAbituale && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="truncate">{course.aulaAbituale}</span>
                        </span>
                      )}
                      {course.orarioAbituale && (
                        <span className="flex items-center gap-1 shrink-0 ml-auto">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{course.orarioAbituale}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Badges: Attendance & Recovery */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {course.attendanceMandatory ? (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                          attendancePct >= (course.minAttendancePercentage || 75)
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                            : 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800/40'
                        }`}
                      >
                        <Award className="w-3 h-3" />
                        <span>Presenze {attendancePct}% (Min {course.minAttendancePercentage || 75}%)</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
                        Frequenza libera
                      </span>
                    )}

                    {daRecupCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{daRecupCount} da recuperare</span>
                      </span>
                    )}
                  </div>

                  {/* Progress & Quick Detail Action */}
                  <div className="pt-1 mt-auto flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-400">Progresso programma</span>
                      <span className="text-slate-900 dark:text-white">{course.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                      <span>{totalLez} lezioni registrate ({svolteLez} svolte)</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: ADD NEW COURSE */}
      {isAddingCourse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/60">
              <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>Aggiungi Nuovo Insegnamento</span>
              </h4>
              <button
                onClick={() => setIsAddingCourse(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="p-6 overflow-y-auto flex flex-col gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Nome Insegnamento / Corso *
                </label>
                <input
                  type="text"
                  required
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="Es. Meccanica Applicata alle Macchine"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Codice Corso
                  </label>
                  <input
                    type="text"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    placeholder="Es. 32005"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Crediti Formativi (CFU)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={newCourseCFU}
                    onChange={(e) => setNewCourseCFU(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Docente
                  </label>
                  <input
                    type="text"
                    value={newCourseProfessor}
                    onChange={(e) => setNewCourseProfessor(e.target.value)}
                    placeholder="Es. Prof. Rossi"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Anno di Corso
                  </label>
                  <select
                    value={newCourseYear}
                    onChange={(e) => setNewCourseYear(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white font-bold focus:outline-none"
                  >
                    <option value="1">1° Anno</option>
                    <option value="2">2° Anno</option>
                    <option value="3">3° Anno</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Semestre
                  </label>
                  <select
                    value={newCourseSemestre}
                    onChange={(e) => setNewCourseSemestre(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white font-bold focus:outline-none"
                  >
                    <option value="1° Semestre">1° Semestre</option>
                    <option value="2° Semestre">2° Semestre</option>
                    <option value="Annuale">Annuale</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Aula Abituale
                  </label>
                  <input
                    type="text"
                    value={newCourseAula}
                    onChange={(e) => setNewCourseAula(e.target.value)}
                    placeholder="Es. Aula Magna"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <TimeSlotPicker
                label="Orario Abituale Lezioni"
                startTime={newStartTime}
                endTime={newEndTime}
                onChange={(s, e) => {
                  setNewStartTime(s);
                  setNewEndTime(e);
                }}
              />

              {/* Attendance Toggle */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCourseAttendanceMandatory}
                    onChange={(e) => setNewCourseAttendanceMandatory(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="font-bold text-slate-800 dark:text-zinc-200">
                    Frequenza Obbligatoria (Notion Presenze)
                  </span>
                </label>

                {newCourseAttendanceMandatory && (
                  <div className="flex items-center gap-2 pt-1 pl-6">
                    <span className="text-slate-500">Soglia minima presenze:</span>
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={newCourseMinAttendance}
                      onChange={(e) => setNewCourseMinAttendance(e.target.value)}
                      className="w-16 px-2 py-1 rounded-lg bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-center font-bold text-slate-900 dark:text-white"
                    />
                    <span className="font-bold text-slate-500">%</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddingCourse(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
                >
                  Salva Corso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COURSE DETAILS */}
      {selectedCourse && (
        <CorsoDetailModal
          course={selectedCourse}
          onClose={() => setSelectedCourseId(null)}
        />
      )}

      {/* MODAL: VISUAL CUSTOMIZER */}
      {customizingCourse && (
        <CorsoVisualCustomizer
          course={customizingCourse}
          onSave={(updates) => {
            updateCorso(customizingCourse.id, updates);
            setCustomizingCourse(null);
          }}
          onClose={() => setCustomizingCourse(null)}
        />
      )}

      {/* MODAL: TIMETABLE OCR IMPORT */}
      {isImportingOrario && (
        <ImportOrarioModal onClose={() => setIsImportingOrario(false)} />
      )}
    </div>
  );
};
