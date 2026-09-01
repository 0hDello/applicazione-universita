import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckSquare,
  Plus,
  Calendar as CalendarIcon,
  Trash2,
  X,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export const CompitiView: React.FC = () => {
  const { corsi, compiti, updateTaskStatus, addCompito, deleteCompito } = useApp();
  const [selectedCourse, setSelectedCourse] = useState('Tutte');
  const [selectedPriority, setSelectedPriority] = useState('Tutte');
  const [showCompleted, setShowCompleted] = useState(true);
  const [isAddingTask, setIsAddingTask] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState(corsi[0]?.name || '');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newPriority, setNewPriority] = useState<'Alta' | 'Media' | 'Bassa'>('Alta');
  const [newDesc, setNewDesc] = useState('');

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    addCompito({
      title: newTitle,
      courseName: newCourse || (corsi[0]?.name || 'Compito'),
      dueDate: newDate,
      priority: newPriority,
      status: 'todo',
      description: newDesc,
    });
    setIsAddingTask(false);
    setNewTitle('');
    setNewDesc('');
  };

  const filteredTasks = compiti.filter((t) => {
    if (selectedCourse !== 'Tutte' && t.courseName !== selectedCourse) return false;
    if (selectedPriority !== 'Tutte' && t.priority !== selectedPriority) return false;
    if (!showCompleted && t.status === 'completed') return false;
    return true;
  });

  const todoTasks = filteredTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress');
  const completedTasks = filteredTasks.filter((t) => t.status === 'completed');

  const getPriorityBadgeClass = (priority: 'Alta' | 'Media' | 'Bassa') => {
    switch (priority) {
      case 'Alta':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200/60';
      case 'Media':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200/60';
      case 'Bassa':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60';
    }
  };

  const donutData = [
    { name: 'Da fare', value: todoTasks.length, color: '#3b82f6' },
    { name: 'In corso', value: inProgressTasks.length, color: '#a855f7' },
    { name: 'Completati', value: completedTasks.length, color: '#10b981' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-8">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Title Header & Main Action */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Compiti</h2>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Organizza e tieni traccia di tutti i tuoi compiti e scadenze.
            </p>
          </div>

          <button
            onClick={() => setIsAddingTask(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Aggiungi compito</span>
          </button>
        </div>

        {/* Filters Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Materia</span>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="Tutte">Tutte</option>
                {corsi.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Priorità</span>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="Tutte">Tutte</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Bassa">Bassa</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Mostra completati</span>
            </label>
          </div>
        </div>

        {/* KANBAN BOARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Da fare */}
          <div className="bg-slate-50/70 dark:bg-slate-900/40 rounded-3xl p-4 border border-slate-100 dark:border-slate-800/80 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Da fare</h4>
                <span className="px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                  {todoTasks.length}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {todoTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/80 shadow-xs flex flex-col gap-3 group relative hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      {task.title}
                    </h5>
                    <button
                      onClick={() => deleteCompito(task.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      {task.courseName}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[10px]">
                    <div className="flex items-center gap-1 text-slate-400 font-medium">
                      <CalendarIcon className="w-3 h-3" />
                      <span>{task.dueDate}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full font-bold border ${getPriorityBadgeClass(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => updateTaskStatus(task.id, 'in_progress')}
                      className="flex-1 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 text-[10px] font-bold hover:bg-purple-100 transition-colors"
                    >
                      Inizia ➔
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setIsAddingTask(true)}
                className="py-2.5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-400 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Aggiungi compito</span>
              </button>
            </div>
          </div>

          {/* Column 2: In corso */}
          <div className="bg-slate-50/70 dark:bg-slate-900/40 rounded-3xl p-4 border border-slate-100 dark:border-slate-800/80 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">In corso</h4>
                <span className="px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                  {inProgressTasks.length}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {inProgressTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/80 shadow-xs flex flex-col gap-3 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      {task.title}
                    </h5>
                    <button
                      onClick={() => deleteCompito(task.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      {task.courseName}
                    </span>
                  </div>

                  {task.progress !== undefined && (
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px] font-bold text-purple-600">
                        <span>Avanzamento</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[10px]">
                    <div className="flex items-center gap-1 text-slate-400 font-medium">
                      <CalendarIcon className="w-3 h-3" />
                      <span>{task.dueDate}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full font-bold border ${getPriorityBadgeClass(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <button
                    onClick={() => updateTaskStatus(task.id, 'completed')}
                    className="py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 text-[10px] font-bold hover:bg-emerald-100 transition-colors"
                  >
                    Completa ✓
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Completati */}
          <div className="bg-slate-50/70 dark:bg-slate-900/40 rounded-3xl p-4 border border-slate-100 dark:border-slate-800/80 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Completati</h4>
                <span className="px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                  {completedTasks.length}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/80 shadow-xs flex flex-col gap-2 opacity-80"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white line-through text-slate-400">
                      {task.title}
                    </h5>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {task.courseName} • {task.dueDate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table: Scadenze in arrivo */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Scadenze in arrivo</h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3">Compito</th>
                  <th className="pb-3">Materia</th>
                  <th className="pb-3">Scadenza</th>
                  <th className="pb-3">Priorità</th>
                  <th className="pb-3">Stato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {compiti.slice(0, 5).map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">
                      {task.title}
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{task.courseName}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{task.dueDate}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadgeClass(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">
                        {task.status === 'todo' ? 'Da fare' : task.status === 'in_progress' ? 'In corso' : 'Completato'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Sidebar Widgets Panel */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        {/* Oggi Summary Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Oggi</h4>
          <div className="grid grid-cols-3 gap-2 text-center py-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
            <div>
              <span className="text-xl font-extrabold text-amber-500">0</span>
              <span className="text-[9px] text-slate-400 block font-medium">In scadenza oggi</span>
            </div>
            <div>
              <span className="text-xl font-extrabold text-purple-500">0</span>
              <span className="text-[9px] text-slate-400 block font-medium">In corso</span>
            </div>
            <div>
              <span className="text-xl font-extrabold text-emerald-500">0</span>
              <span className="text-[9px] text-slate-400 block font-medium">Completati oggi</span>
            </div>
          </div>
        </div>

        {/* Carico di Studio Donut Chart Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Carico di studio</h4>
            <PieChartIcon className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex items-center gap-4">
            <div className="w-28 h-28 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    innerRadius={30}
                    outerRadius={45}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-extrabold text-slate-900 dark:text-white leading-none">
                  {compiti.length}
                </span>
                <span className="text-[9px] text-slate-400">totali</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-600 dark:text-slate-400 font-medium">Da fare: {todoTasks.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="text-slate-600 dark:text-slate-400 font-medium">In corso: {inProgressTasks.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-400 font-medium">Completati: {completedTasks.length}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Tempo stimato:</span>
              <span className="text-slate-900 dark:text-white font-bold">0h 0m</span>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
                <span>Obiettivo settimanale: 25h</span>
                <span className="text-blue-600 font-bold">0%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-[0%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddingTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nuovo Compito</h3>
              <button onClick={() => setIsAddingTask(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTaskSubmit} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Titolo compito</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Es. Esercizi di derivate"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Materia</label>
                  <select
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Seleziona corso...</option>
                    {corsi.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Priorità</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Bassa">Bassa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Data Scadenza</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Descrizione</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Note, capitoli o dettagli per il compito..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20 hover:bg-blue-700"
                >
                  Crea Compito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
