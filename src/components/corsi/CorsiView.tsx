import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CorsoDetailModal } from './CorsoDetailModal';
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
} from 'lucide-react';

export const CorsiView: React.FC = () => {
  const { corsi, toggleCourseTopic, addCorso } = useApp();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseCFU, setNewCourseCFU] = useState('6');
  const [newCourseProfessor, setNewCourseProfessor] = useState('');
  const [newCourseSemestre, setNewCourseSemestre] = useState('1° Semestre');
  const [newCourseAula, setNewCourseAula] = useState('');
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('11:00');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemestre, setSelectedSemestre] = useState('Tutti');
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  const selectedCourse = corsi.find((c) => c.id === selectedCourseId);

  const filteredCorsi = corsi.filter((c) => {
    if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase()) && !c.code.toLowerCase().includes(searchTerm.toLowerCase()) && !c.professor.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedSemestre !== 'Tutti' && c.semestre && c.semestre !== selectedSemestre) return false;
    return true;
  });

  const toggleExpand = (courseId: string) => {
    setExpandedTopics((prev) => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  const getCourseBadgeColor = (index: number) => {
    const colors = [
      'bg-indigo-600 text-white',
      'bg-sky-500 text-white',
      'bg-emerald-600 text-white',
      'bg-purple-600 text-white',
      'bg-amber-500 text-white',
      'bg-cyan-600 text-white',
    ];
    return colors[index % colors.length];
  };

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
            Gestisci i tuoi corsi universitari, traccia il registro lezioni e monitora lo studio.
          </p>
        </div>
        <button
          onClick={() => setIsAddingCourse(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Aggiungi nuovo corso</span>
        </button>
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
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold text-sm">
            {corsi.length > 0 ? Math.round(corsi.reduce((acc, c) => acc + c.progress, 0) / corsi.length) : 0}%
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block">Progresso medio</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {corsi.length > 0 ? Math.round(corsi.reduce((acc, c) => acc + c.progress, 0) / corsi.length) : 0}%
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

        {/* KPI 4: Lezioni Totali */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block">Lezioni registrate</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {corsi.reduce((acc, c) => acc + (c.lezioni?.length || 0), 0)}
            </h3>
            <span className="text-[10px] text-purple-600 font-medium">Registro attivo</span>
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

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca corso, docente o codice..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* COURSE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCorsi.map((course, idx) => {
          const badgeClass = getCourseBadgeColor(idx);
          const showAll = expandedTopics[course.id];
          const topicsToShow = showAll ? course.topics : course.topics.slice(0, 3);
          const totalLezioni = (course.lezioni || []).length;
          const svolteLezioni = (course.lezioni || []).filter((l) => l.status === 'svolta').length;

          return (
            <div
              key={course.id}
              onClick={() => setSelectedCourseId(course.id)}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4 relative hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group"
            >
              {/* Top Row: Course Icon, Title, CFU, Progress ring */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${badgeClass} flex items-center justify-center font-bold text-sm shadow-md shrink-0 group-hover:scale-105 transition-transform`}>
                    {course.code ? course.code.slice(0, 3).toUpperCase() : 'CRS'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {course.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">{course.professor}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-500 font-semibold">{course.cfu} CFU</span>
                      {course.semestre && (
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded">
                          {course.semestre}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 dark:border-blue-500/40 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400">
                    {course.progress}%
                  </span>
                </div>
              </div>

              {/* Lecture Stats & Next Lecture Row */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 font-medium block">Registro Lezioni</span>
                  <p className="font-bold text-slate-900 dark:text-white text-[11px] flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-blue-600" />
                    <span>{totalLezioni} {totalLezioni === 1 ? 'lezione' : 'lezioni'}</span>
                  </p>
                  <p className="text-[10px] text-emerald-600 font-semibold">{svolteLezioni} svolte</p>
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

                  <div className="flex items-center justify-between text-[10px] mt-1">
                    <span className="text-purple-600 font-bold">Ripetizioni</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {course.repetitionsDone} / {course.repetitionsTotal}
                    </span>
                  </div>
                </div>
              </div>

              {/* Topics Checklist Preview */}
              <div className="flex flex-col gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    ARGOMENTI PRINCIPALI
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
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-semibold group-hover:text-blue-700">
                <span>Vedi lezioni & dettagli</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* COURSE DETAIL MODAL WITH LECTURE REGISTRY */}
      {selectedCourse && (
        <CorsoDetailModal
          course={selectedCourse}
          onClose={() => setSelectedCourseId(null)}
        />
      )}

      {/* Add Course Modal */}
      {isAddingCourse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nuovo Corso Universitario</h3>
              <button onClick={() => setIsAddingCourse(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
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
                  nextLecture: { date: '-', dayName: 'Da definire', time: `${newStartTime} - ${newEndTime}`, room: newCourseAula || '-' },
                  notesOrganized: 0,
                  repetitionsDone: 0,
                  repetitionsTotal: 0,
                  topics: [],
                  lezioni: [],
                  color: 'bg-blue-600',
                  icon: 'BookOpen'
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
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nome Corso *</label>
                <input
                  type="text"
                  required
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="Es. Analisi Matematica 1"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Codice Corso</label>
                  <input
                    type="text"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    placeholder="Es. MAT01"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">CFU (Crediti) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newCourseCFU}
                    onChange={(e) => setNewCourseCFU(e.target.value)}
                    placeholder="Es. 9"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Docente</label>
                <input
                  type="text"
                  value={newCourseProfessor}
                  onChange={(e) => setNewCourseProfessor(e.target.value)}
                  placeholder="Es. Prof. Rossi"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Semestre</label>
                  <select
                    value={newCourseSemestre}
                    onChange={(e) => setNewCourseSemestre(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="1° Semestre">1° Semestre</option>
                    <option value="2° Semestre">2° Semestre</option>
                    <option value="Annuale">Annuale</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Aula abituale</label>
                  <input
                    type="text"
                    value={newCourseAula}
                    onChange={(e) => setNewCourseAula(e.target.value)}
                    placeholder="Es. Aula 4B"
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Time Slot Picker for Course Usual Time */}
              <TimeSlotPicker
                label="Orario Abituale Lezioni"
                startTime={newStartTime}
                endTime={newEndTime}
                onChange={(s, e) => {
                  setNewStartTime(s);
                  setNewEndTime(e);
                }}
              />

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
