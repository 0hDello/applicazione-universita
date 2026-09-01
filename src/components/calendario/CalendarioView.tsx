import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { EventoCalendario, EventCategory } from '../../types';
import { TimeSlotPicker } from '../common/TimeSlotPicker';
import { openGoogleMaps } from '../../utils/mapUtils';
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
  CalendarDays,
  Sparkles,
  Edit3,
  Copy,
  ExternalLink,
  Repeat,
} from 'lucide-react';

export const CalendarioView: React.FC = () => {
  const {
    eventi,
    addEvento,
    addEventoWithRecurrence,
    updateEvento,
    duplicateEvento,
    moveEvento,
    deleteEvento,
    esami,
    corsi,
    userSettings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'Mese' | 'Settimana' | 'Giorno'>('Mese');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<EventoCalendario | null>(eventi[0] || null);

  // New Event Form State
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<EventCategory>('Lezione');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('11:00');
  const [newRoom, setNewRoom] = useState('');
  const [newCourse, setNewCourse] = useState(corsi[0]?.name || '');
  const [newNotes, setNewNotes] = useState('');
  const [newRecurrenceWeeks, setNewRecurrenceWeeks] = useState<number>(1);

  // Edit Event Form State
  const [editingEvent, setEditingEvent] = useState<EventoCalendario | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<EventCategory>('Lezione');
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('09:00');
  const [editEndTime, setEditEndTime] = useState('11:00');
  const [editRoom, setEditRoom] = useState('');
  const [editCourse, setEditCourse] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Drag & Drop State
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate();

  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];
  const weekDays = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'];
  const weekDaysFull = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

  // Navigation Handlers
  const handlePrev = () => {
    if (activeTab === 'Mese') {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    } else if (activeTab === 'Settimana') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
    }
  };

  const handleNext = () => {
    if (activeTab === 'Mese') {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    } else if (activeTab === 'Settimana') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Helper for Week calculations (Monday-Sunday)
  const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(currentDate);
  const weekDaysDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const formatDateYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const getWeekRangeTitle = () => {
    const first = weekDaysDates[0];
    const last = weekDaysDates[6];
    const firstStr = `${first.getDate()} ${monthNames[first.getMonth()].substring(0, 3)}`;
    const lastStr = `${last.getDate()} ${monthNames[last.getMonth()].substring(0, 3)} ${last.getFullYear()}`;
    return `${firstStr} – ${lastStr}`;
  };

  // Month grid calculations
  const daysInMonthCount = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);

  let firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  firstDayOfMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const previousMonthDaysCount = new Date(currentYear, currentMonth, 0).getDate();
  const fillerDays = Array.from({ length: firstDayOfMonth }, (_, i) => previousMonthDaysCount - firstDayOfMonth + i + 1);

  const totalCells = firstDayOfMonth + daysInMonthCount;
  const nextMonthFillerDaysCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const nextMonthFillerDays = Array.from({ length: nextMonthFillerDaysCount }, (_, i) => i + 1);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const eventPayload = {
      title: newTitle.trim(),
      category: newCategory,
      date: newDate,
      time: `${newStartTime} - ${newEndTime}`,
      room: newRoom.trim() || 'Aula da definire',
      courseName: newCourse || 'Corso',
      notes: newNotes.trim(),
      reminder: '15 minuti prima',
    };

    if (newRecurrenceWeeks > 1) {
      addEventoWithRecurrence(eventPayload, newRecurrenceWeeks);
    } else {
      addEvento(eventPayload);
    }

    setIsAddingEvent(false);
    setNewTitle('');
    setNewNotes('');
    setNewRoom('');
    setNewRecurrenceWeeks(1);
  };

  const openEditModal = (ev: EventoCalendario) => {
    setEditingEvent(ev);
    setEditTitle(ev.title);
    setEditCategory(ev.category);
    setEditDate(ev.date);
    const parts = ev.time.split('-').map((s) => s.trim());
    setEditStartTime(parts[0] || '09:00');
    setEditEndTime(parts[1] || '11:00');
    setEditRoom(ev.room || '');
    setEditCourse(ev.courseName || '');
    setEditNotes(ev.notes || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !editTitle) return;

    const updatedData: Partial<EventoCalendario> = {
      title: editTitle.trim(),
      category: editCategory,
      date: editDate,
      time: `${editStartTime} - ${editEndTime}`,
      room: editRoom.trim() || 'Aula da definire',
      courseName: editCourse,
      notes: editNotes.trim(),
    };

    updateEvento(editingEvent.id, updatedData);
    if (selectedEvent && selectedEvent.id === editingEvent.id) {
      setSelectedEvent({ ...selectedEvent, ...updatedData } as EventoCalendario);
    }
    setEditingEvent(null);
  };

  const openAddForDate = (dateStr: string) => {
    setNewDate(dateStr);
    setIsAddingEvent(true);
  };

  const getCategoryBadgeClass = (category: EventCategory) => {
    switch (category) {
      case 'Lezione':
        return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/70';
      case 'Esame':
        return 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/70';
      case 'Scadenza':
        return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/70';
      case 'Studio':
        return 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/70';
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
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

  const getEventsForDay = (day: number) => {
    const dayStr = day.toString().padStart(2, '0');
    const monthStr = (currentMonth + 1).toString().padStart(2, '0');
    const fullDate = `${currentYear}-${monthStr}-${dayStr}`;
    return eventi.filter((e) => e.date === fullDate);
  };

  const getEventsForExactDate = (dateStr: string) => {
    return eventi.filter((e) => e.date === dateStr);
  };

  const todayYMD = formatDateYMD(new Date());
  const selectedDateYMD = formatDateYMD(currentDate);

  const hoursList = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-8">
      {/* Main Calendar View Area */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        {/* Calendar Header Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {activeTab === 'Mese' && `${monthNames[currentMonth]} ${currentYear}`}
                  {activeTab === 'Settimana' && getWeekRangeTitle()}
                  {activeTab === 'Giorno' && `${currentDay} ${monthNames[currentMonth]} ${currentYear}`}
                </h3>
                <p className="text-[11px] font-semibold text-slate-400">
                  {activeTab === 'Mese' && 'Vista Mensile (Trascina eventi per spostarli)'}
                  {activeTab === 'Settimana' && 'Orario Settimanale Interattivo'}
                  {activeTab === 'Giorno' && weekDaysFull[(currentDate.getDay() + 6) % 7]}
                </p>
              </div>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              {(['Mese', 'Settimana', 'Giorno'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToday}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            >
              Oggi
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
                title="Precedente"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
                title="Successivo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => {
                setNewDate(formatDateYMD(currentDate));
                setIsAddingEvent(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              <span>Aggiungi evento</span>
            </button>
          </div>
        </div>

        {/* 1. MESE VIEW */}
        {activeTab === 'Mese' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
            {/* Weekday Header */}
            <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Month Days Grid */}
            <div className="grid grid-cols-7 auto-rows-fr bg-slate-100 dark:bg-slate-800 gap-[1px]">
              {/* Previous Month filler days */}
              {fillerDays.map((day) => (
                <div
                  key={`prev-${day}`}
                  className="bg-white dark:bg-slate-900 p-2.5 min-h-[105px] text-slate-300 dark:text-slate-700 text-xs font-semibold opacity-40 select-none"
                >
                  {day}
                </div>
              ))}

              {/* Current Month Days */}
              {daysInMonth.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isToday =
                  day === new Date().getDate() &&
                  currentMonth === new Date().getMonth() &&
                  currentYear === new Date().getFullYear();
                const cellDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                return (
                  <div
                    key={day}
                    onClick={() => setCurrentDate(new Date(currentYear, currentMonth, day))}
                    onDoubleClick={() => openAddForDate(cellDateStr)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const evId = e.dataTransfer.getData('text/plain') || draggedEventId;
                      if (evId) {
                        moveEvento(evId, cellDateStr);
                        setDraggedEventId(null);
                      }
                    }}
                    className={`bg-white dark:bg-slate-900 p-2.5 min-h-[115px] flex flex-col gap-1.5 transition-colors hover:bg-blue-50/30 dark:hover:bg-slate-800/50 cursor-pointer group ${
                      isToday ? 'bg-blue-50/40 dark:bg-blue-950/20 ring-1 ring-inset ring-blue-500/30' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                          isToday
                            ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {day}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddForDate(cellDateStr);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 p-0.5 rounded transition-opacity"
                        title="Aggiungi evento qui"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Day Events Pills with Drag & Drop */}
                    <div className="flex flex-col gap-1 overflow-y-auto max-h-[85px] pr-0.5">
                      {dayEvents.map((ev) => (
                        <button
                          key={ev.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', ev.id);
                            setDraggedEventId(ev.id);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(ev);
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold text-left truncate border transition-transform hover:scale-98 shadow-2xs cursor-grab active:cursor-grabbing ${getCategoryBadgeClass(
                            ev.category
                          )}`}
                        >
                          <div className="truncate font-extrabold">{ev.title}</div>
                          <div className="text-[9px] opacity-80 truncate flex items-center gap-1">
                            <span>{ev.time.split(' ')[0]}</span>
                            {ev.room && <span>• {ev.room}</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Next month fillers */}
              {nextMonthFillerDays.map((day) => (
                <div
                  key={`next-${day}`}
                  className="bg-white dark:bg-slate-900 p-2.5 min-h-[105px] text-slate-300 dark:text-slate-700 text-xs font-semibold opacity-40 select-none"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Legend Bar */}
            <div className="p-3 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400 font-semibold">
              <div className="flex items-center gap-5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Lezione</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span>Esame</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>Scadenza</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <span>Studio</span>
                </div>
              </div>
              <span className="text-[11px] text-slate-400">Trascina gli eventi per spostarli • Doppio click per aggiungere</span>
            </div>
          </div>
        )}

        {/* 2. SETTIMANA VIEW */}
        {activeTab === 'Settimana' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
            {/* Week header columns */}
            <div className="grid grid-cols-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
              <div className="p-3 text-center text-xs font-bold text-slate-400 dark:text-slate-500 border-r border-slate-100 dark:border-slate-800">
                ORA
              </div>
              {weekDaysDates.map((dateObj, idx) => {
                const dateStr = formatDateYMD(dateObj);
                const isToday = dateStr === todayYMD;
                return (
                  <div
                    key={dateStr}
                    onClick={() => {
                      setCurrentDate(dateObj);
                      setActiveTab('Giorno');
                    }}
                    className={`p-3 text-center cursor-pointer transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60 ${
                      isToday ? 'bg-blue-50/50 dark:bg-blue-950/30' : ''
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      {weekDays[idx]}
                    </span>
                    <span
                      className={`text-xs font-extrabold inline-block px-2 py-0.5 rounded-full mt-0.5 ${
                        isToday ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {dateObj.getDate()} {monthNames[dateObj.getMonth()].substring(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Week Timetable Matrix with Drag & Drop */}
            <div className="overflow-y-auto max-h-[580px] divide-y divide-slate-100 dark:divide-slate-800/70">
              {hoursList.map((hour) => {
                const hourNum = parseInt(hour.split(':')[0]);
                const nextHourStr = `${String(hourNum + 2).padStart(2, '0')}:00`;

                return (
                  <div key={hour} className="grid grid-cols-8 min-h-[64px] auto-rows-fr">
                    {/* Hour Column */}
                    <div className="p-2 text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50/30 dark:bg-slate-900/40 border-r border-slate-100 dark:border-slate-800 flex items-start justify-center">
                      {hour}
                    </div>

                    {/* 7 Days Columns */}
                    {weekDaysDates.map((dateObj) => {
                      const dateStr = formatDateYMD(dateObj);
                      const dayEvents = getEventsForExactDate(dateStr).filter((ev) => {
                        const evStartHour = parseInt(ev.time.split(':')[0]);
                        return evStartHour === hourNum;
                      });

                      return (
                        <div
                          key={dateStr}
                          onClick={() => openAddForDate(dateStr)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const evId = e.dataTransfer.getData('text/plain') || draggedEventId;
                            if (evId) {
                              moveEvento(evId, dateStr, `${hour} - ${nextHourStr}`);
                              setDraggedEventId(null);
                            }
                          }}
                          className="p-1 border-r border-slate-100 dark:border-slate-800/50 hover:bg-blue-50/20 dark:hover:bg-slate-800/30 transition-colors flex flex-col gap-1 cursor-pointer"
                        >
                          {dayEvents.map((ev) => (
                            <button
                              key={ev.id}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', ev.id);
                                setDraggedEventId(ev.id);
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(ev);
                              }}
                              className={`p-2 rounded-xl text-left text-[10px] font-bold border shadow-2xs transition-transform hover:scale-98 cursor-grab active:cursor-grabbing ${getCategoryBadgeClass(
                                ev.category
                              )}`}
                            >
                              <div className="font-extrabold truncate">{ev.title}</div>
                              <div className="text-[9px] opacity-80 truncate">{ev.time}</div>
                              {ev.room && <div className="text-[9px] opacity-75 truncate font-normal">📍 {ev.room}</div>}
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. GIORNO VIEW */}
        {activeTab === 'Giorno' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Programma di {weekDaysFull[(currentDate.getDay() + 6) % 7]}, {currentDay} {monthNames[currentMonth]}
                </h4>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  {getEventsForExactDate(selectedDateYMD).length} eventi programmati per oggi
                </p>
              </div>

              <button
                onClick={() => openAddForDate(selectedDateYMD)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Nuova attività oggi</span>
              </button>
            </div>

            {/* Timeline of day */}
            <div className="flex flex-col gap-3">
              {getEventsForExactDate(selectedDateYMD).length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <CalendarDays className="w-7 h-7" />
                  </div>
                  <h5 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                    Nessun evento in programma per questa giornata
                  </h5>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Goditi la giornata libera oppure aggiungi una lezione, una sessione di studio o un promemoria.
                  </p>
                  <button
                    onClick={() => openAddForDate(selectedDateYMD)}
                    className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700"
                  >
                    + Aggiungi evento per questo giorno
                  </button>
                </div>
              ) : (
                getEventsForExactDate(selectedDateYMD).map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-start justify-between gap-4 cursor-pointer hover:border-blue-400 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs min-w-[75px]">
                        <Clock className="w-4 h-4 text-blue-600 mb-1" />
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white text-center leading-tight">
                          {ev.time.split('-')[0]?.trim()}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {ev.time.split('-')[1]?.trim()}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${getDotColor(ev.category)}`} />
                          <h5 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {ev.title}
                          </h5>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadgeClass(ev.category)}`}>
                            {ev.category}
                          </span>
                          {ev.recurrence && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60 flex items-center gap-1">
                              <Repeat className="w-3 h-3" />
                              <span>{ev.recurrence}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium flex-wrap">
                          {ev.courseName && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                              <span>{ev.courseName}</span>
                            </span>
                          )}
                          {ev.room && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openGoogleMaps(ev.room, userSettings.university);
                              }}
                              className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                              title="Apri indicazioni su Google Maps"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{ev.room}</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {ev.notes && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic bg-white/70 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                            "{ev.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(ev);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                        title="Modifica evento"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEvento(ev.id);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Elimina"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Selected Event Details Modal/Card */}
        {selectedEvent && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className={`w-3.5 h-3.5 rounded-full ${getDotColor(selectedEvent.category)}`} />
                <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {selectedEvent.title}
                </h4>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getCategoryBadgeClass(
                    selectedEvent.category
                  )}`}
                >
                  {selectedEvent.category}
                </span>
                {selectedEvent.recurrence && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60 flex items-center gap-1">
                    <Repeat className="w-3 h-3" />
                    <span>{selectedEvent.recurrence}</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(selectedEvent)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition-colors"
                  title="Modifica evento"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Modifica</span>
                </button>
                <button
                  onClick={() => duplicateEvento(selectedEvent.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors"
                  title="Duplica evento"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplica</span>
                </button>
                <button
                  onClick={() => {
                    deleteEvento(selectedEvent.id);
                    setSelectedEvent(null);
                  }}
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
                  <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Data e ora</p>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                      {selectedEvent.date} • {selectedEvent.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Aula / Sede</p>
                    {selectedEvent.room ? (
                      <button
                        onClick={() => openGoogleMaps(selectedEvent.room, userSettings.university)}
                        className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                        title="Apri su Google Maps"
                      >
                        <span>{selectedEvent.room}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    ) : (
                      <p className="text-slate-400">Non specificata</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <Bell className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Promemoria</p>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                      {selectedEvent.reminder || '15 minuti prima'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Column 2: Course */}
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 text-xs">
                  <BookOpen className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Corso di Riferimento</p>
                    <p className="text-slate-700 dark:text-slate-300 font-bold">
                      {selectedEvent.courseName || 'Corso Generale'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {corsi.find((c) => c.name === selectedEvent.courseName)?.professor || 'Docente Universitario'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Column 3: Notes */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Note & Argomenti</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-700">
                  {selectedEvent.notes || 'Nessuna nota aggiuntiva specificata per questo evento.'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar Widgets Panel */}
      <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
        {/* Eventi di Oggi Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-blue-600" />
              <span>Eventi di oggi</span>
            </h4>
            <span className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[11px] font-extrabold text-blue-600 dark:text-blue-400 flex items-center justify-center">
              {getEventsForExactDate(todayYMD).length}
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {getEventsForExactDate(todayYMD).length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">Nessun evento in programma per oggi.</p>
            ) : (
              getEventsForExactDate(todayYMD).map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-start justify-between gap-2 cursor-pointer hover:border-blue-400 transition-colors"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold text-blue-600 block">{ev.time}</span>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">{ev.title}</h5>
                    {ev.room && <p className="text-[10px] text-slate-400 truncate">📍 {ev.room}</p>}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${getCategoryBadgeClass(
                      ev.category
                    )}`}
                  >
                    {ev.category}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Prossimi Esami Widget Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Prossimi esami</span>
            </h4>
            <span className="w-5 h-5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-[11px] font-extrabold text-purple-600 dark:text-purple-400 flex items-center justify-center">
              {esami.filter((e) => e.status === 'upcoming').length}
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {esami.filter((e) => e.status === 'upcoming').length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">Nessun esame imminente registrato.</p>
            ) : (
              esami
                .filter((e) => e.status === 'upcoming')
                .slice(0, 3)
                .map((exam) => (
                  <div
                    key={exam.id}
                    className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {exam.courseName}
                      </h5>
                      <p className="text-[10px] text-slate-400 truncate">
                        📅 {exam.date} • {exam.room || 'Aula Magna'}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold shrink-0">
                      {exam.daysRemaining} gg
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Dynamic Courses Quick Badge Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-3">
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>I Tuoi Corsi ({corsi.length})</span>
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {corsi.map((c) => (
              <span
                key={c.id}
                className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold"
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* New Event Modal Overlay */}
      {isAddingEvent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Nuovo Evento in Calendario</h3>
              </div>
              <button
                onClick={() => setIsAddingEvent(false)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Titolo evento / Argomento lezione *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Es. Lezione 5: Derivate e Integrali"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-bold"
                  >
                    <option value="Lezione">📚 Lezione (si sincronizza nel corso)</option>
                    <option value="Esame">🎯 Esame (si sincronizza in esami)</option>
                    <option value="Scadenza">⏰ Scadenza / Consegna</option>
                    <option value="Studio">🧠 Sessione Studio</option>
                    <option value="Altro">📌 Altro</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Data Inizio</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              {/* Time Slot Picker */}
              <TimeSlotPicker
                label="Orario Evento"
                startTime={newStartTime}
                endTime={newEndTime}
                onChange={(s, e) => {
                  setNewStartTime(s);
                  setNewEndTime(e);
                }}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Corso</label>
                  <select
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-bold"
                  >
                    {corsi.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    <option value="Altro">Altro / Nessuno</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Aula / Sede</label>
                  <input
                    type="text"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    placeholder="Es. Aula Magna / 4B"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* Recurrence Selector */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-purple-600" />
                  <span>Ricorrenza settimanale (Crea orario automatico)</span>
                </label>
                <select
                  value={newRecurrenceWeeks}
                  onChange={(e) => setNewRecurrenceWeeks(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value={1}>Nessuna (Singolo evento)</option>
                  <option value={4}>Ripeti per 4 settimane</option>
                  <option value={8}>Ripeti per 8 settimane (2 mesi)</option>
                  <option value={12}>Ripeti per 12 settimane (3 mesi)</option>
                  <option value={16}>Intero Semestre (16 settimane)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Note o compiti</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Dettagli, argomenti trattati o note personali..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingEvent(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700"
                >
                  {newRecurrenceWeeks > 1 ? `Salva ${newRecurrenceWeeks} Eventi Ricorrenti` : 'Salva nel Calendario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal Overlay */}
      {editingEvent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Modifica Evento</h3>
              </div>
              <button
                onClick={() => setEditingEvent(null)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Titolo evento *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Categoria</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-bold"
                  >
                    <option value="Lezione">📚 Lezione</option>
                    <option value="Esame">🎯 Esame</option>
                    <option value="Scadenza">⏰ Scadenza</option>
                    <option value="Studio">🧠 Sessione Studio</option>
                    <option value="Altro">📌 Altro</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              {/* Time Slot Picker for Edit */}
              <TimeSlotPicker
                label="Orario Evento"
                startTime={editStartTime}
                endTime={editEndTime}
                onChange={(s, e) => {
                  setEditStartTime(s);
                  setEditEndTime(e);
                }}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Corso</label>
                  <select
                    value={editCourse}
                    onChange={(e) => setEditCourse(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-bold"
                  >
                    {corsi.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    <option value="Altro">Altro / Nessuno</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Aula / Sede</label>
                  <input
                    type="text"
                    value={editRoom}
                    onChange={(e) => setEditRoom(e.target.value)}
                    placeholder="Es. Aula Magna / 4B"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Note o compiti</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Dettagli ed argomenti..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
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
