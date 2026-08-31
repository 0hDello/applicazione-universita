import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { EventoCalendario, EventCategory } from '../../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  BookOpen,
  Bell,
  Trash2,
  X,
  FileText,
} from 'lucide-react';

export const CalendarioView: React.FC = () => {
  const { eventi, addEvento, deleteEvento, esami, corsi } = useApp();
  const [activeTab, setActiveTab] = useState<'Mese' | 'Settimana' | 'Giorno'>('Mese');
  const [selectedEvent, setSelectedEvent] = useState<EventoCalendario | null>(eventi[0] || null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate();
  const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  const weekDays = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'];

  const daysInMonthCount = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);

  let firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  firstDayOfMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const previousMonthDaysCount = new Date(currentYear, currentMonth, 0).getDate();
  const fillerDays = Array.from({ length: firstDayOfMonth }, (_, i) => previousMonthDaysCount - firstDayOfMonth + i + 1);

  const totalCells = firstDayOfMonth + daysInMonthCount;
  const nextMonthFillerDaysCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const nextMonthFillerDays = Array.from({ length: nextMonthFillerDaysCount }, (_, i) => i + 1);

  // New Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<EventCategory>('Lezione');
  const [newDate, setNewDate] = useState(() => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
  });
  const [newTime, setNewTime] = useState('11:00 - 12:30');
  const [newRoom, setNewRoom] = useState('Aula C1');
  const [newCourse, setNewCourse] = useState('Chimica Generale');
  const [newNotes, setNewNotes] = useState('');

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    addEvento({
      title: newTitle,
      category: newCategory,
      date: newDate,
      time: newTime,
      room: newRoom,
      courseName: newCourse,
      notes: newNotes,
      reminder: '15 minuti prima',
    });
    setIsAddingEvent(false);
    setNewTitle('');
    setNewNotes('');
  };

  const getCategoryBadgeClass = (category: EventCategory) => {
    switch (category) {
      case 'Lezione':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60';
      case 'Esame':
        return 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200/60 dark:border-red-800/60';
      case 'Scadenza':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60';
      case 'Studio':
        return 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/60';
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200';
    }
  };

  const getDotColor = (category: EventCategory) => {
    switch (category) {
      case 'Lezione':
        return 'bg-emerald-500';
      case 'Esame':
        return 'bg-red-500';
      case 'Scadenza':
        return 'bg-amber-500';
      case 'Studio':
        return 'bg-purple-500';
      default:
        return 'bg-slate-400';
    }
  };

  // Map events to day numbers for current month
  const getEventsForDay = (day: number) => {
    const dayStr = day.toString().padStart(2, '0');
    const monthStr = (currentMonth + 1).toString().padStart(2, '0');
    const fullDate = `${currentYear}-${monthStr}-${dayStr}`;
    return eventi.filter((e) => e.date === fullDate);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-8">
      {/* Main Calendar View Area */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Calendar Header Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{monthNames[currentMonth]} {currentYear}</h3>
            </div>
            {/* View Switcher Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['Mese', 'Settimana', 'Giorno'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => setIsAddingEvent(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Aggiungi evento</span>
            </button>
          </div>
        </div>

        {/* Calendar Month Grid */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Weekday Header */}
          <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr bg-slate-100 dark:bg-slate-800 gap-[1px]">
            {/* Previous Month filler days */}
            {fillerDays.map(day => (
              <div key={`prev-${day}`} className="bg-white dark:bg-slate-900 p-2 min-h-[95px] text-slate-300 dark:text-slate-700 text-xs font-semibold opacity-50">{day}</div>
            ))}

            {/* Current Month Days */}
            {daysInMonth.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isToday = day === currentDay;
              return (
                <div
                  key={day}
                  className={`bg-white dark:bg-slate-900 p-2 min-h-[105px] flex flex-col gap-1 transition-colors hover:bg-blue-50/20 dark:hover:bg-slate-800/50 ${
                    isToday ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {day}
                    </span>
                  </div>

                  {/* Day Events Pills */}
                  <div className="flex flex-col gap-1 overflow-y-auto max-h-[85px]">
                    {dayEvents.map((ev) => (
                      <button
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className={`px-2 py-1 rounded-md text-[10px] font-semibold text-left truncate border transition-transform hover:scale-98 ${getCategoryBadgeClass(
                          ev.category
                        )}`}
                      >
                        <div className="font-bold truncate">{ev.time.split(' ')[0]} {ev.title}</div>
                        {ev.room && <div className="text-[9px] opacity-80 truncate">{ev.room}</div>}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Next month fillers */}
            {nextMonthFillerDays.map(day => (
              <div key={`next-${day}`} className="bg-white dark:bg-slate-900 p-2 min-h-[95px] text-slate-300 dark:text-slate-700 text-xs font-semibold opacity-50">{day}</div>
            ))}
          </div>

          {/* Calendar Legend Bar */}
          <div className="p-3 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center gap-6 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Lezione</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>Esame</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Scadenza</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <span>Studio</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <span>Altro</span>
            </div>
          </div>
        </div>

        {/* Selected Event Details Modal/Card */}
        {selectedEvent && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${getDotColor(selectedEvent.category)}`} />
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedEvent.title}
                </h4>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryBadgeClass(
                    selectedEvent.category
                  )}`}
                >
                  {selectedEvent.category}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => deleteEvento(selectedEvent.id)}
                  className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Elimina evento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column 1: Date, Time, Room */}
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 text-xs">
                  <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Data e ora</p>
                    <p className="text-slate-500 dark:text-slate-400">
                      {selectedEvent.date} • {selectedEvent.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Aula</p>
                    <p className="text-slate-500 dark:text-slate-400">
                      {selectedEvent.room || 'Non specificata'} • Edificio di Scienze
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <Bell className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Promemoria</p>
                    <p className="text-slate-500 dark:text-slate-400">
                      {selectedEvent.reminder || '15 minuti prima'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Column 2: Course & Category */}
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 text-xs">
                  <BookOpen className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Corso</p>
                    <p className="text-slate-500 dark:text-slate-400">
                      {selectedEvent.courseName || 'Chimica Generale'}
                    </p>
                    <p className="text-[10px] text-slate-400">Prof.ssa Gallo</p>
                  </div>
                </div>
              </div>

              {/* Column 3: Notes */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Note</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-700">
                  {selectedEvent.notes || 'Capitoli 5-6: Reazioni chimiche, stechiometria e resa di reazione.'}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Chiudi
              </button>
              <button className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-colors">
                Salva modifiche
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar Widgets Panel */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        {/* Eventi di Oggi Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Eventi di oggi</h4>
            <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center">
              3
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {eventi.slice(0, 3).map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-start justify-between gap-2"
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-400">{ev.time.split(' ')[0]}</span>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">{ev.title}</h5>
                  {ev.room && <p className="text-[10px] text-slate-500 dark:text-slate-400">{ev.room}</p>}
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getCategoryBadgeClass(
                    ev.category
                  )}`}
                >
                  {ev.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Prossimi Esami Widget Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Prossimi esami</h4>
            <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center">
              {esami.filter((e) => e.status === 'upcoming').length}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {esami
              .filter((e) => e.status === 'upcoming')
              .map((exam) => (
                <div
                  key={exam.id}
                  className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                      ∫(x)
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                        {exam.courseName}
                      </h5>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {exam.date} • {exam.room}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 text-[10px] font-bold">
                    {exam.daysRemaining} giorni
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Agenda Timeline Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Agenda</h4>
            <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center">
              {eventi.length}
            </span>
          </div>

          <div className="flex flex-col gap-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
            {eventi.length === 0 ? (
              <div className="pl-6 py-2 text-xs text-slate-500">Nessun evento in agenda.</div>
            ) : (
              eventi.slice(0, 5).map((ev, i) => (
                <div key={ev.id} className="flex items-start gap-3 pl-6 relative">
                  <span className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-amber-500' : 'bg-blue-500'} absolute left-2 top-1.5 ring-4 ring-white dark:ring-slate-900`} />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400">{ev.date}</span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{ev.time} {ev.title}</p>
                    <p className="text-[10px] text-slate-500">{ev.room}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* New Event Modal Overlay */}
      {isAddingEvent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nuovo Evento</h3>
              <button onClick={() => setIsAddingEvent(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Titolo evento</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Es. Lezione Analisi Matematica"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Lezione">Lezione</option>
                    <option value="Esame">Esame</option>
                    <option value="Scadenza">Scadenza</option>
                    <option value="Studio">Studio</option>
                    <option value="Altro">Altro</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Data</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Orario</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="11:00 - 12:30"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Aula</label>
                  <input
                    type="text"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    placeholder="Aula C1"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Corso</label>
                <select
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  {corsi.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Note</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Dettagli ed argomenti della lezione..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingEvent(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20 hover:bg-blue-700"
                >
                  Crea Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
