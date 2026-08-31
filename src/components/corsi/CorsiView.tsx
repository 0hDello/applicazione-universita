import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  SlidersHorizontal,
  Search,
  ChevronDown,
  Plus,
  X,
} from 'lucide-react';

export const CorsiView: React.FC = () => {
  const { corsi, toggleCourseTopic, addCorso } = useApp();
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseCFU, setNewCourseCFU] = useState('');
  const [newCourseProfessor, setNewCourseProfessor] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemestre, setSelectedSemestre] = useState('Tutti');
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  const filteredCorsi = corsi.filter((c) => {
    if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Corsi</h2>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">Ecco tutti i tuoi corsi.</p>
        </div>
        <button
          onClick={() => setIsAddingCourse(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Aggiungi corso</span>
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
            <span className="text-[10px] text-slate-400 font-medium">Totali</span>
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
            <span className="text-[10px] text-emerald-600 font-medium">+8% questa settimana</span>
          </div>
        </div>

        {/* KPI 3: CFU totali */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block">CFU totali</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {corsi.reduce((acc, c) => acc + c.cfu, 0)}
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Su 180 previsti</span>
          </div>
        </div>

        {/* KPI 4: Argomenti completati */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block">
              Argomenti completati
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {corsi.reduce((acc, c) => acc + c.topics.filter(t => t.completed).length, 0)}
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Di {corsi.reduce((acc, c) => acc + c.topics.length, 0)} totali</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <select
            value={selectedSemestre}
            onChange={(e) => setSelectedSemestre(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="Tutti">Semestre: Tutti</option>
            <option value="1">1° Semestre</option>
            <option value="2">2° Semestre</option>
          </select>

          <select className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none">
            <option>Docente: Tutti</option>
          </select>

          <select className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none">
            <option>Stato: Tutti</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca corso..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
          <button className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* COURSE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCorsi.map((course, idx) => {
          const badgeClass = getCourseBadgeColor(idx);
          const showAll = expandedTopics[course.id];
          const topicsToShow = showAll ? course.topics : course.topics.slice(0, 3);

          return (
            <div
              key={course.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4 relative hover:shadow-md transition-all"
            >
              {/* Top Row: Course Icon, Title, CFU, Progress ring */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${badgeClass} flex items-center justify-center font-bold text-sm shadow-md`}>
                    {course.code.slice(0, 3)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {course.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">{course.professor}</p>
                    <span className="text-[10px] text-slate-500 font-semibold">{course.cfu} CFU</span>
                  </div>
                </div>

                <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 dark:border-blue-500/40 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400">
                    {course.progress}%
                  </span>
                </div>
              </div>

              {/* Next Lecture & Progress Details */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 font-medium block">Prossima lezione</span>
                  <p className="font-bold text-slate-900 dark:text-white text-[11px]">
                    {course.nextLecture.dayName}, {course.nextLecture.time}
                  </p>
                  <p className="text-[10px] text-slate-400">{course.nextLecture.room}</p>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-emerald-600 font-bold">Appunti sistemati</span>
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
                    <span className="text-purple-600 font-bold">Ripetizioni fatte</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {course.repetitionsDone} / {course.repetitionsTotal}
                    </span>
                  </div>
                </div>
              </div>

              {/* Topics Checklist */}
              <div className="flex flex-col gap-2 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  ARGOMENTI DELLA LEZIONE
                </span>

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
                      <span className={t.completed ? 'line-through text-slate-400' : ''}>
                        {t.name}
                      </span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={() => toggleExpand(course.id)}
                  className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1 mt-1"
                >
                  <span>{showAll ? 'Mostra meno' : `Mostra tutti (${course.topics.length})`}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showAll ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Course Modal */}
      {isAddingCourse && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nuovo Corso</h3>
              <button onClick={() => setIsAddingCourse(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addCorso({
                  code: newCourseCode,
                  name: newCourseName,
                  cfu: parseInt(newCourseCFU) || 0,
                  professor: newCourseProfessor,
                  progress: 0,
                  nextLecture: { date: '-', dayName: 'Da definire', time: '-', room: '-' },
                  notesOrganized: 0,
                  repetitionsDone: 0,
                  repetitionsTotal: 0,
                  topics: [],
                  color: 'bg-blue-600',
                  icon: 'BookOpen'
                });
                setIsAddingCourse(false);
                setNewCourseName('');
                setNewCourseCode('');
                setNewCourseCFU('');
                setNewCourseProfessor('');
              }}
              className="flex flex-col gap-4 text-xs"
            >
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Codice Corso</label>
                <input
                  type="text"
                  required
                  value={newCourseCode}
                  onChange={(e) => setNewCourseCode(e.target.value)}
                  placeholder="Es. INF01"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nome Corso</label>
                <input
                  type="text"
                  required
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="Es. Informatica Generale"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Docente</label>
                  <input
                    type="text"
                    required
                    value={newCourseProfessor}
                    onChange={(e) => setNewCourseProfessor(e.target.value)}
                    placeholder="Es. Prof. Rossi"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">CFU</label>
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
