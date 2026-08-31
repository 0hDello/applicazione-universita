import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  NavView,
  Corso,
  Esame,
  Compito,
  EventoCalendario,
  Risorsa,
  SemesterGoal,
  WeeklyGoal,
  Habit,
  UserSettings,
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
  updateCorsoProgress: (courseId: string, progress: number) => void;
  toggleCourseTopic: (courseId: string, topicId: string) => void;
  esami: Esame[];
  toggleExamTopic: (examId: string, topicId: string) => void;
  compiti: Compito[];
  updateTaskStatus: (taskId: string, status: Compito['status']) => void;
  addCompito: (task: Omit<Compito, 'id'>) => void;
  deleteCompito: (taskId: string) => void;
  eventi: EventoCalendario[];
  addEvento: (event: Omit<EventoCalendario, 'id'>) => void;
  deleteEvento: (eventId: string) => void;
  risorse: Risorsa[];
  toggleFavoriteResource: (resourceId: string) => void;
  addRisorsa: (resource: Omit<Risorsa, 'id'>) => void;
  deleteRisorsa: (resourceId: string) => void;
  semesterGoals: SemesterGoal[];
  weeklyGoals: WeeklyGoal[];
  habits: Habit[];
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
  const [semesterGoals] = useState<SemesterGoal[]>(() =>
    loadStorage('semesterGoals', initialSemesterGoals)
  );
  const [weeklyGoals] = useState<WeeklyGoal[]>(() =>
    loadStorage('weeklyGoals', initialWeeklyGoals)
  );
  const [habits] = useState<Habit[]>(() => loadStorage('habits', initialHabits));

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
    if (userSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userSettings.theme]);

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
        const newProgress = Math.round((completedCount / updatedTopics.length) * 100);
        return { ...c, topics: updatedTopics, progress: newProgress };
      })
    );
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
    const newTask: Compito = {
      ...task,
      id: `task_${Date.now()}`,
    };
    setCompiti((prev) => [newTask, ...prev]);
  };

  const deleteCompito = (taskId: string) => {
    setCompiti((prev) => prev.filter((t) => t.id !== taskId));
  };

  const addEvento = (event: Omit<EventoCalendario, 'id'>) => {
    const newEvent: EventoCalendario = {
      ...event,
      id: `ev_${Date.now()}`,
    };
    setEventi((prev) => [...prev, newEvent]);
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

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        userSettings,
        updateUserSettings,
        corsi,
        addCorso,
        updateCorsoProgress,
        toggleCourseTopic,
        esami,
        toggleExamTopic,
        compiti,
        updateTaskStatus,
        addCompito,
        deleteCompito,
        eventi,
        addEvento,
        deleteEvento,
        risorse,
        toggleFavoriteResource,
        addRisorsa,
        deleteRisorsa,
        semesterGoals,
        weeklyGoals,
        habits,
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
