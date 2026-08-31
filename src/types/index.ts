export type NavView =
  | 'calendario'
  | 'corsi'
  | 'esami'
  | 'compiti'
  | 'statistiche'
  | 'risorse'
  | 'obiettivi'
  | 'impostazioni';

export interface TopicItem {
  id: string;
  name: string;
  completed: boolean;
}

export interface Corso {
  id: string;
  code: string;
  name: string;
  professor: string;
  cfu: number;
  color: string;
  icon: string;
  progress: number;
  nextLecture: {
    date: string;
    dayName: string;
    time: string;
    room: string;
  };
  notesOrganized: number;
  repetitionsDone: number;
  repetitionsTotal: number;
  topics: TopicItem[];
}

export interface Esame {
  id: string;
  courseId: string;
  courseName: string;
  professor: string;
  date: string; // e.g. "2026-05-31"
  time: string; // e.g. "09:00"
  room: string;
  registrationStatus: 'Confermata' | 'In attesa';
  daysRemaining: number;
  progress: number;
  notesPercentage: number;
  notesCompleted: number;
  notesTotal: number;
  repetitionsDone: number;
  repetitionsTotal: number;
  topicsToReview: TopicItem[];
  grade?: string; // e.g., "30L", "28"
  status: 'upcoming' | 'completed';
}

export interface Compito {
  id: string;
  title: string;
  courseName: string;
  dueDate: string;
  priority: 'Alta' | 'Media' | 'Bassa';
  status: 'todo' | 'in_progress' | 'completed';
  description?: string;
  progress?: number;
}

export type EventCategory = 'Lezione' | 'Esame' | 'Scadenza' | 'Studio' | 'Altro';

export interface EventoCalendario {
  id: string;
  title: string;
  category: EventCategory;
  date: string; // YYYY-MM-DD
  time: string; // "11:00 - 12:30"
  room?: string;
  courseName?: string;
  notes?: string;
  reminder?: string;
}

export type ResourceType = 'PDF' | 'Slide' | 'Link' | 'Video' | 'Registrazione' | 'Formulario' | 'Esercizio';

export interface Risorsa {
  id: string;
  title: string;
  type: ResourceType;
  size?: string;
  uploadDate: string;
  courseName: string;
  isFavorite: boolean;
  openCount?: number;
  url?: string;
}

export interface SemesterGoal {
  id: string;
  title: string;
  progress: number;
  current: number;
  total: number;
  priority: 'Alta' | 'Media' | 'Bassa';
}

export interface WeeklyGoal {
  id: string;
  title: string;
  completedSessions: number;
  totalSessions: number;
  days: boolean[]; // L, M, M, G, V, S, D
}

export interface Habit {
  id: string;
  title: string;
  streakDays: number;
  activeDays: boolean[];
}

export interface UserSettings {
  name: string;
  email: string;
  role: string;
  avatar: string;
  university: string;
  academicYear: string;
  studyProgram: string;
  studyYear: string;
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  notifications: {
    lessonReminders: boolean;
    examDeadlines: boolean;
    suggestedActivities: boolean;
    appUpdates: boolean;
  };
  startOfWeek: string;
  defaultReminder: string;
  autoBackup: boolean;
}
