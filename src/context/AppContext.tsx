import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type {
  NavView,
  Corso,
  Lezione,
  Esame,
  Compito,
  EventoCalendario,
  Risorsa,
  SemesterGoal,
  WeeklyGoal,
  Habit,
  UserSettings,
  AppNotification,
} from '../types';
import {
  initialUserSettings,
  initialCorsi,
  initialEsami,
  initialCompiti,
  initialEventi,
  initialRisorse,
  initialSemesterGoals,
  initialWeeklyGoals,
  initialHabits,
} from '../mockData';

interface AppContextType {
  currentView: NavView;
  setCurrentView: (view: NavView) => void;
  userSettings: UserSettings;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
  corsi: Corso[];
  addCorso: (corso: Omit<Corso, 'id'>) => void;
  updateCorso: (courseId: string, updates: Partial<Corso>) => void;
  deleteCorso: (courseId: string) => void;
  updateCorsoProgress: (courseId: string, progress: number) => void;
  toggleCourseTopic: (courseId: string, topicId: string) => void;
  addTopicToCorso: (courseId: string, topicName: string) => void;
  deleteTopicFromCorso: (courseId: string, topicId: string) => void;
  addLezioneToCorso: (courseId: string, lezione: Omit<Lezione, 'id'>, syncWithCalendar?: boolean) => void;
  updateLezione: (courseId: string, lezioneId: string, updates: Partial<Lezione>) => void;
  deleteLezione: (courseId: string, lezioneId: string) => void;
  esami: Esame[];
  addEsame: (esame: Omit<Esame, 'id'>, syncWithCalendar?: boolean) => void;
  updateEsame: (examId: string, updates: Partial<Esame>) => void;
  deleteEsame: (examId: string) => void;
  toggleExamTopic: (examId: string, topicId: string) => void;
  compiti: Compito[];
  updateTaskStatus: (taskId: string, status: Compito['status']) => void;
  addCompito: (task: Omit<Compito, 'id'>) => void;
  updateCompito: (taskId: string, updates: Partial<Compito>) => void;
  deleteCompito: (taskId: string) => void;
  eventi: EventoCalendario[];
  addEvento: (event: Omit<EventoCalendario, 'id'>) => void;
  addEventoWithRecurrence: (event: Omit<EventoCalendario, 'id'>, weeksCount: number) => void;
  updateEvento: (eventId: string, updates: Partial<EventoCalendario>) => void;
  duplicateEvento: (eventId: string, targetDate?: string) => void;
  moveEvento: (eventId: string, newDate: string, newTime?: string) => void;
  deleteEvento: (eventId: string) => void;
  risorse: Risorsa[];
  toggleFavoriteResource: (resourceId: string) => void;
  addRisorsa: (resource: Omit<Risorsa, 'id'>) => void;
  deleteRisorsa: (resourceId: string) => void;
  semesterGoals: SemesterGoal[];
  addSemesterGoal: (goal: Omit<SemesterGoal, 'id'>) => void;
  updateSemesterGoal: (goalId: string, updates: Partial<SemesterGoal>) => void;
  deleteSemesterGoal: (goalId: string) => void;
  weeklyGoals: WeeklyGoal[];
  addWeeklyGoal: (goal: Omit<WeeklyGoal, 'id'>) => void;
  toggleWeeklyGoal: (goalId: string) => void;
  toggleWeeklyGoalDay: (goalId: string, dayIndex: number) => void;
  deleteWeeklyGoal: (goalId: string) => void;
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id'>) => void;
  toggleHabitDay: (habitId: string, dayIndex: number) => void;
  deleteHabit: (habitId: string) => void;
  notifications: AppNotification[];
  markAllNotificationsAsRead: () => void;
  markNotificationAsRead: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const loadStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(`uni_planner_v2_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
    return defaultValue;
  }
};

const saveStorage = <T,>(key: string, value: T) => {
  try {
    localStorage.setItem(`uni_planner_v2_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<NavView>('calendario');
  const [searchQuery, setSearchQuery] = useState('');

  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    const loaded = loadStorage('userSettings', initialUserSettings);
    if (!loaded.name || loaded.name === 'Martina Rossi') {
      return { ...loaded, name: 'Sara Luongo', email: 'sara.luongo@email.com', avatar: '' };
    }
    return loaded;
  });
  const [corsi, setCorsi] = useState<Corso[]>(() => loadStorage('corsi', initialCorsi));
  const [esami, setEsami] = useState<Esame[]>(() => loadStorage('esami', initialEsami));
  const [compiti, setCompiti] = useState<Compito[]>(() => loadStorage('compiti', initialCompiti));
  const [eventi, setEventi] = useState<EventoCalendario[]>(() => loadStorage('eventi', initialEventi));
  const [risorse, setRisorse] = useState<Risorsa[]>(() => loadStorage('risorse', initialRisorse));
  const [semesterGoals, setSemesterGoals] = useState<SemesterGoal[]>(() =>
    loadStorage('semesterGoals', initialSemesterGoals)
  );
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>(() =>
    loadStorage('weeklyGoals', initialWeeklyGoals)
  );
  const [habits, setHabits] = useState<Habit[]>(() => loadStorage('habits', initialHabits));

  // Sync effect to localStorage
  useEffect(() => saveStorage('userSettings', userSettings), [userSettings]);
  useEffect(() => saveStorage('corsi', corsi), [corsi]);
  useEffect(() => saveStorage('esami', esami), [esami]);
  useEffect(() => saveStorage('compiti', compiti), [compiti]);
  useEffect(() => saveStorage('eventi', eventi), [eventi]);
  useEffect(() => saveStorage('risorse', risorse), [risorse]);
  useEffect(() => saveStorage('semesterGoals', semesterGoals), [semesterGoals]);
  useEffect(() => saveStorage('weeklyGoals', weeklyGoals), [weeklyGoals]);
  useEffect(() => saveStorage('habits', habits), [habits]);

  // Apply dark mode class to html element
  useEffect(() => {
    const applyTheme = () => {
      const isDark =
        userSettings.theme === 'dark' ||
        (userSettings.theme === 'system' &&
          typeof window !== 'undefined' &&
          window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);

      if (isDark) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    };

    applyTheme();

    if (userSettings.theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [userSettings.theme]);

  // Apply font size class to html element
  useEffect(() => {
    const size = userSettings.fontSize || 'medium';
    document.documentElement.setAttribute('data-font-size', size);
  }, [userSettings.fontSize]);

  // Apply accent color to CSS variables
  useEffect(() => {
    const color = userSettings.accentColor || '#2563eb';
    let cleanHex = color.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map((c) => c + c).join('');
    }
    let rgb = '37, 99, 235';
    let hoverColor = color;
    if (cleanHex.length === 6) {
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        rgb = `${r}, ${g}, ${b}`;
        const darkR = Math.max(0, Math.floor(r * 0.85));
        const darkG = Math.max(0, Math.floor(g * 0.85));
        const darkB = Math.max(0, Math.floor(b * 0.85));
        hoverColor = `rgb(${darkR}, ${darkG}, ${darkB})`;
      }
    }
    document.documentElement.style.setProperty('--color-primary', color);
    document.documentElement.style.setProperty('--color-primary-hover', hoverColor);
    document.documentElement.style.setProperty('--color-primary-rgb', rgb);
  }, [userSettings.accentColor]);

  // Notifications State & Generator
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() =>
    loadStorage('readNotificationIds', [])
  );
  useEffect(() => saveStorage('readNotificationIds', readNotificationIds), [readNotificationIds]);

  const notifications: AppNotification[] = useMemo(() => {
    const list: AppNotification[] = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // 1. Upcoming exams in next 7 days
    esami.forEach((e) => {
      if (e.status === 'upcoming' && e.daysRemaining <= 7) {
        list.push({
          id: `notif_exam_${e.id}`,
          title: `Appello Esame: ${e.courseName}`,
          message: e.daysRemaining === 0 ? 'Il tuo esame è OGGI!' : `Mancano ${e.daysRemaining} giorni all'esame (${e.date}).`,
          time: e.daysRemaining === 0 ? 'Oggi' : `${e.daysRemaining} gg`,
          type: 'exam',
          read: readNotificationIds.includes(`notif_exam_${e.id}`),
          linkView: 'esami',
        });
      }
    });

    // 2. Tasks due soon (within 2 days or overdue)
    compiti.forEach((t) => {
      if (t.status !== 'completed' && t.dueDate) {
        const diffDays = Math.ceil((new Date(t.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 2) {
          list.push({
            id: `notif_task_${t.id}`,
            title: `Scadenza Compito: ${t.title}`,
            message: diffDays < 0 ? `Scaduto il ${t.dueDate}` : diffDays === 0 ? 'Scade OGGI!' : `Scade domani (${t.dueDate}).`,
            time: diffDays <= 0 ? 'Urgente' : 'In scadenza',
            type: 'task',
            read: readNotificationIds.includes(`notif_task_${t.id}`),
            linkView: 'compiti',
          });
        }
      }
    });

    // 3. Lessons today
    eventi.forEach((ev) => {
      if (ev.date === todayStr && ev.category === 'Lezione') {
        list.push({
          id: `notif_lez_${ev.id}`,
          title: `Lezione di oggi: ${ev.title}`,
          message: `Orario ${ev.time} • ${ev.room || 'Aula da definire'}`,
          time: ev.time.split('-')[0]?.trim() || 'Oggi',
          type: 'lecture',
          read: readNotificationIds.includes(`notif_lez_${ev.id}`),
          linkView: 'calendario',
        });
      }
    });

    // 4. Welcome / system notification
    list.push({
      id: 'notif_sys_welcome',
      title: 'Benvenuto su Università App!',
      message: 'Il tuo piano di studi, esami e calendario sono sincronizzati.',
      time: 'Adesso',
      type: 'info',
      read: readNotificationIds.includes('notif_sys_welcome'),
      linkView: 'impostazioni',
    });

    return list;
  }, [esami, compiti, eventi, readNotificationIds]);

  const markAllNotificationsAsRead = () => {
    setReadNotificationIds(notifications.map((n) => n.id));
  };

  const markNotificationAsRead = (id: string) => {
    setReadNotificationIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const updateUserSettings = (newSettings: Partial<UserSettings>) => {
    setUserSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const addCorso = (corso: Omit<Corso, 'id'>) => {
    const newCorso: Corso = {
      ...corso,
      id: crypto.randomUUID(),
    };
    setCorsi((prev) => [...prev, newCorso]);
  };

  const updateCorso = (courseId: string, updates: Partial<Corso>) => {
    setCorsi((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, ...updates } : c))
    );
  };

  const deleteCorso = (courseId: string) => {
    setCorsi((prev) => prev.filter((c) => c.id !== courseId));
  };

  const updateCorsoProgress = (courseId: string, progress: number) => {
    setCorsi((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, progress } : c))
    );
  };

  const toggleCourseTopic = (courseId: string, topicId: string) => {
    setCorsi((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        const updatedTopics = c.topics.map((t) =>
          t.id === topicId ? { ...t, completed: !t.completed } : t
        );
        const completedCount = updatedTopics.filter((t) => t.completed).length;
        const newProgress = updatedTopics.length > 0 ? Math.round((completedCount / updatedTopics.length) * 100) : 0;
        return { ...c, topics: updatedTopics, progress: newProgress };
      })
    );
  };

  const addTopicToCorso = (courseId: string, topicName: string) => {
    if (!topicName.trim()) return;
    setCorsi((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        const newTopic = { id: `top_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, name: topicName.trim(), completed: false };
        const updatedTopics = [...c.topics, newTopic];
        const completedCount = updatedTopics.filter((t) => t.completed).length;
        const newProgress = Math.round((completedCount / updatedTopics.length) * 100);
        return { ...c, topics: updatedTopics, progress: newProgress };
      })
    );
  };

  const deleteTopicFromCorso = (courseId: string, topicId: string) => {
    setCorsi((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        const updatedTopics = c.topics.filter((t) => t.id !== topicId);
        const completedCount = updatedTopics.filter((t) => t.completed).length;
        const newProgress = updatedTopics.length > 0 ? Math.round((completedCount / updatedTopics.length) * 100) : 0;
        return { ...c, topics: updatedTopics, progress: newProgress };
      })
    );
  };

  const addLezioneToCorso = (courseId: string, lezione: Omit<Lezione, 'id'>, syncWithCalendar = true) => {
    let targetCourseName = '';
    let targetAula = '';
    setCorsi((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        targetCourseName = c.name;
        targetAula = c.aulaAbituale || '';
        const currentLezioni = c.lezioni || [];
        const newLezione: Lezione = {
          ...lezione,
          id: `lez_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          number: currentLezioni.length + 1,
        };
        const updatedLezioni = [...currentLezioni, newLezione];
        const notesCount = updatedLezioni.filter((l) => l.hasNotes).length;
        const notesPercent = Math.round((notesCount / updatedLezioni.length) * 100);
        return { ...c, lezioni: updatedLezioni, notesOrganized: notesPercent };
      })
    );

    if (syncWithCalendar) {
      const newEvent: EventoCalendario = {
        id: `ev_lez_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: lezione.title,
        category: 'Lezione',
        date: lezione.date,
        time: lezione.time,
        room: lezione.room || targetAula || 'Aula Università',
        courseName: targetCourseName || 'Corso',
        notes: lezione.notes || '',
        reminder: '15 minuti prima',
      };
      setEventi((prev) => [...prev, newEvent]);
    }
  };

  const updateLezione = (courseId: string, lezioneId: string, updates: Partial<Lezione>) => {
    setCorsi((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        const currentLezioni = c.lezioni || [];
        const updatedLezioni = currentLezioni.map((l) =>
          l.id === lezioneId ? { ...l, ...updates } : l
        );
        const notesCount = updatedLezioni.filter((l) => l.hasNotes).length;
        const notesPercent = updatedLezioni.length > 0 ? Math.round((notesCount / updatedLezioni.length) * 100) : 0;

        // Reactive progress computation
        const completedLectures = updatedLezioni.filter((l) => l.topicCompleted || l.status === 'svolta').length;
        const totalItems = (c.topics.length || 0) + updatedLezioni.length;
        const totalDone = (c.topics.filter((t) => t.completed).length) + completedLectures;
        const calculatedProgress = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : c.progress;

        return {
          ...c,
          lezioni: updatedLezioni,
          notesOrganized: notesPercent,
          progress: calculatedProgress,
        };
      })
    );
  };

  const deleteLezione = (courseId: string, lezioneId: string) => {
    setCorsi((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        const currentLezioni = c.lezioni || [];
        const updatedLezioni = currentLezioni
          .filter((l) => l.id !== lezioneId)
          .map((l, idx) => ({ ...l, number: idx + 1 }));
        const notesCount = updatedLezioni.filter((l) => l.hasNotes).length;
        const notesPercent = updatedLezioni.length > 0 ? Math.round((notesCount / updatedLezioni.length) * 100) : 0;
        return { ...c, lezioni: updatedLezioni, notesOrganized: notesPercent };
      })
    );
  };

  const addEsame = (esame: Omit<Esame, 'id'>, syncWithCalendar = true) => {
    const newExamId = `exam_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newExam: Esame = {
      ...esame,
      id: newExamId,
    };
    setEsami((prev) => [newExam, ...prev]);

    if (syncWithCalendar) {
      const newEvent: EventoCalendario = {
        id: `ev_exam_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: `Esame: ${esame.courseName}`,
        category: 'Esame',
        date: esame.date,
        time: esame.time || '09:00',
        room: esame.room || 'Aula Magna',
        courseName: esame.courseName,
        notes: `Docente: ${esame.professor}`,
        reminder: '1 giorno prima',
        relatedExamId: newExamId,
      };
      setEventi((prev) => [...prev, newEvent]);
    }
  };

  const updateEsame = (examId: string, updates: Partial<Esame>) => {
    setEsami((prev) =>
      prev.map((e) => {
        if (e.id !== examId) return e;
        const updated = { ...e, ...updates };
        if (updates.date) {
          updated.daysRemaining = Math.max(0, Math.ceil((new Date(updates.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
        }
        return updated;
      })
    );

    // Sync with calendar event
    if (updates.date || updates.time || updates.room || updates.courseName) {
      setEventi((prev) =>
        prev.map((ev) => {
          if (ev.relatedExamId === examId || (ev.category === 'Esame' && ev.title.includes(examId))) {
            return {
              ...ev,
              date: updates.date || ev.date,
              time: updates.time || ev.time,
              room: updates.room !== undefined ? updates.room : ev.room,
              title: updates.courseName ? `Esame: ${updates.courseName}` : ev.title,
            };
          }
          return ev;
        })
      );
    }
  };

  const deleteEsame = (examId: string) => {
    setEsami((prev) => prev.filter((e) => e.id !== examId));
    setEventi((prev) => prev.filter((ev) => ev.relatedExamId !== examId));
  };

  const toggleExamTopic = (examId: string, topicId: string) => {
    setEsami((prev) =>
      prev.map((e) => {
        if (e.id !== examId) return e;
        const updatedTopics = e.topicsToReview.map((t) =>
          t.id === topicId ? { ...t, completed: !t.completed } : t
        );
        return { ...e, topicsToReview: updatedTopics };
      })
    );
  };

  const updateTaskStatus = (taskId: string, status: Compito['status']) => {
    setCompiti((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
  };

  const addCompito = (task: Omit<Compito, 'id'>) => {
    const newTaskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const calEventId = `ev_task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newTask: Compito = {
      ...task,
      id: newTaskId,
      calendarEventId: calEventId,
    };
    setCompiti((prev) => [newTask, ...prev]);

    // Cross-sync: automatically create a calendar event of category Scadenza
    if (task.dueDate) {
      const newEvent: EventoCalendario = {
        id: calEventId,
        title: `Consegna: ${task.title}`,
        category: 'Scadenza',
        date: task.dueDate,
        time: '23:59',
        room: task.courseName || 'Online',
        courseName: task.courseName || 'Compito',
        notes: task.description || `Priorità: ${task.priority}`,
        reminder: '1 giorno prima',
        relatedTaskId: newTaskId,
      };
      setEventi((prev) => [...prev, newEvent]);
    }
  };

  const updateCompito = (taskId: string, updates: Partial<Compito>) => {
    let updatedCalId = '';
    setCompiti((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        updatedCalId = t.calendarEventId || '';
        return { ...t, ...updates };
      })
    );

    // Sync with calendar event
    setEventi((prev) =>
      prev.map((ev) => {
        if (ev.relatedTaskId === taskId || (updatedCalId && ev.id === updatedCalId)) {
          return {
            ...ev,
            title: updates.title ? `Consegna: ${updates.title}` : ev.title,
            date: updates.dueDate || ev.date,
            courseName: updates.courseName || ev.courseName,
            notes: updates.description !== undefined ? updates.description : ev.notes,
          };
        }
        return ev;
      })
    );
  };

  const deleteCompito = (taskId: string) => {
    setCompiti((prev) => prev.filter((t) => t.id !== taskId));
    setEventi((prev) => prev.filter((ev) => ev.relatedTaskId !== taskId));
  };

  const addEvento = (event: Omit<EventoCalendario, 'id'>) => {
    const newEvent: EventoCalendario = {
      ...event,
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setEventi((prev) => [...prev, newEvent]);

    // Cross-sync: If it's a Lezione, also add it into the matching course
    if (event.category === 'Lezione') {
      const matchedCourse = corsi.find(
        (c) =>
          (event.courseName && c.name.toLowerCase() === event.courseName.toLowerCase()) ||
          (event.title && event.title.toLowerCase().includes(c.name.toLowerCase()))
      );
      if (matchedCourse) {
        addLezioneToCorso(
          matchedCourse.id,
          {
            number: (matchedCourse.lezioni || []).length + 1,
            title: event.title,
            date: event.date,
            time: event.time,
            room: event.room || '',
            topicsCovered: event.title,
            notes: event.notes || '',
            status: 'programmata',
            hasNotes: false,
          },
          false // don't duplicate event on calendar
        );
      }
    }

    // Cross-sync: If it's an Esame, also add it into the Exams list
    if (event.category === 'Esame') {
      const matchedCourse = corsi.find(
        (c) =>
          (event.courseName && c.name.toLowerCase() === event.courseName.toLowerCase()) ||
          (event.title && event.title.toLowerCase().includes(c.name.toLowerCase()))
      );
      const cleanCourseName = matchedCourse?.name || event.courseName || event.title.replace(/^Esame:\s*/i, '');
      const daysRem = Math.max(0, Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
      const newExamObj: Esame = {
        id: `exam_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        courseId: matchedCourse?.id || 'gen_course',
        courseName: cleanCourseName,
        professor: matchedCourse?.professor || 'Docente Corso',
        date: event.date,
        time: event.time || '09:00',
        room: event.room || 'Aula Magna',
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
      };
      setEsami((prev) => [newExamObj, ...prev]);
    }
  };

  const addEventoWithRecurrence = (event: Omit<EventoCalendario, 'id'>, weeksCount: number) => {
    const baseDate = new Date(event.date);
    const newEvents: EventoCalendario[] = [];

    for (let i = 0; i < weeksCount; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i * 7);
      const dateStr = d.toISOString().split('T')[0];
      newEvents.push({
        ...event,
        id: `ev_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
        date: dateStr,
        recurrence: weeksCount > 1 ? `Settimanale (${i + 1}/${weeksCount})` : undefined,
      });
    }

    setEventi((prev) => [...prev, ...newEvents]);

    // Also sync lectures into the course
    if (event.category === 'Lezione') {
      const matchedCourse = corsi.find(
        (c) =>
          (event.courseName && c.name.toLowerCase() === event.courseName.toLowerCase()) ||
          (event.title && event.title.toLowerCase().includes(c.name.toLowerCase()))
      );
      if (matchedCourse) {
        newEvents.forEach((ev) => {
          addLezioneToCorso(
            matchedCourse.id,
            {
              number: (matchedCourse.lezioni || []).length + 1,
              title: ev.title,
              date: ev.date,
              time: ev.time,
              room: ev.room || '',
              topicsCovered: ev.title,
              notes: ev.notes || '',
              status: 'programmata',
              hasNotes: false,
            },
            false
          );
        });
      }
    }
  };

  const updateEvento = (eventId: string, updates: Partial<EventoCalendario>) => {
    setEventi((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, ...updates } : e))
    );
  };

  const duplicateEvento = (eventId: string, targetDate?: string) => {
    const source = eventi.find((e) => e.id === eventId);
    if (!source) return;
    const duplicated: EventoCalendario = {
      ...source,
      id: `ev_dup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: `${source.title} (Copia)`,
      date: targetDate || source.date,
    };
    setEventi((prev) => [...prev, duplicated]);
  };

  const moveEvento = (eventId: string, newDate: string, newTime?: string) => {
    setEventi((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, date: newDate, time: newTime || e.time } : e))
    );
  };

  const deleteEvento = (eventId: string) => {
    setEventi((prev) => prev.filter((e) => e.id !== eventId));
  };

  const toggleFavoriteResource = (resourceId: string) => {
    setRisorse((prev) =>
      prev.map((r) => (r.id === resourceId ? { ...r, isFavorite: !r.isFavorite } : r))
    );
  };

  const addRisorsa = (resource: Omit<Risorsa, 'id'>) => {
    const newRisorsa: Risorsa = {
      ...resource,
      id: `res_${Date.now()}`,
    };
    setRisorse((prev) => [newRisorsa, ...prev]);
  };

  const deleteRisorsa = (resourceId: string) => {
    setRisorse((prev) => prev.filter((r) => r.id !== resourceId));
  };

  // Goals & Habits CRUD
  const addSemesterGoal = (goal: Omit<SemesterGoal, 'id'>) => {
    const newGoal: SemesterGoal = {
      ...goal,
      id: `sem_goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setSemesterGoals((prev) => [...prev, newGoal]);
  };

  const updateSemesterGoal = (goalId: string, updates: Partial<SemesterGoal>) => {
    setSemesterGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const updated = { ...g, ...updates };
        if (updated.total > 0 && updated.current !== undefined) {
          updated.progress = Math.min(100, Math.round((updated.current / updated.total) * 100));
        }
        return updated;
      })
    );
  };

  const deleteSemesterGoal = (goalId: string) => {
    setSemesterGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  const addWeeklyGoal = (goal: Omit<WeeklyGoal, 'id'>) => {
    const newGoal: WeeklyGoal = {
      ...goal,
      id: `w_goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      days: goal.days || [false, false, false, false, false, false, false],
    };
    setWeeklyGoals((prev) => [...prev, newGoal]);
  };

  const toggleWeeklyGoal = (goalId: string) => {
    setWeeklyGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const isComplete = g.completedSessions >= g.totalSessions;
        const newCount = isComplete ? 0 : g.totalSessions;
        return {
          ...g,
          completedSessions: newCount,
          days: isComplete ? [false, false, false, false, false, false, false] : [true, true, true, true, true, true, true],
        };
      })
    );
  };

  const toggleWeeklyGoalDay = (goalId: string, dayIndex: number) => {
    setWeeklyGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const newDays = [...g.days];
        newDays[dayIndex] = !newDays[dayIndex];
        const completedCount = newDays.filter(Boolean).length;
        return { ...g, days: newDays, completedSessions: completedCount };
      })
    );
  };

  const deleteWeeklyGoal = (goalId: string) => {
    setWeeklyGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  const addHabit = (habit: Omit<Habit, 'id'>) => {
    const newHabit: Habit = {
      ...habit,
      id: `habit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      activeDays: habit.activeDays || [false, false, false, false, false, false, false],
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const toggleHabitDay = (habitId: string, dayIndex: number) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const newDays = [...h.activeDays];
        newDays[dayIndex] = !newDays[dayIndex];
        const activeCount = newDays.filter(Boolean).length;
        return { ...h, activeDays: newDays, streakDays: activeCount };
      })
    );
  };

  const deleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        userSettings,
        updateUserSettings,
        corsi,
        addCorso,
        updateCorso,
        deleteCorso,
        updateCorsoProgress,
        toggleCourseTopic,
        addTopicToCorso,
        deleteTopicFromCorso,
        addLezioneToCorso,
        updateLezione,
        deleteLezione,
        esami,
        addEsame,
        updateEsame,
        deleteEsame,
        toggleExamTopic,
        compiti,
        updateTaskStatus,
        addCompito,
        updateCompito,
        deleteCompito,
        eventi,
        addEvento,
        addEventoWithRecurrence,
        updateEvento,
        duplicateEvento,
        moveEvento,
        deleteEvento,
        risorse,
        toggleFavoriteResource,
        addRisorsa,
        deleteRisorsa,
        semesterGoals,
        addSemesterGoal,
        updateSemesterGoal,
        deleteSemesterGoal,
        weeklyGoals,
        addWeeklyGoal,
        toggleWeeklyGoal,
        toggleWeeklyGoalDay,
        deleteWeeklyGoal,
        habits,
        addHabit,
        toggleHabitDay,
        deleteHabit,
        notifications,
        markAllNotificationsAsRead,
        markNotificationAsRead,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
