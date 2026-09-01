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

export type AttendanceStatus = 'presente' | 'assente' | 'non_registrata';

export interface Lezione {
  id: string;
  number: number;
  title: string;
  date: string; // e.g. "2026-03-12"
  time: string; // e.g. "09:00 - 11:00"
  room: string; // e.g. "Aula 4B"
  topicsCovered: string;
  notes?: string;
  status: 'svolta' | 'programmata' | 'da_recuperare';
  hasNotes: boolean;
  attendance?: AttendanceStatus;
  attendanceRecordedAt?: string;
  recovered?: boolean;
  recoveredDate?: string;
  recoveredNotes?: string;
  topicCompleted?: boolean;
}

export interface Corso {
  id: string;
  code: string;
  name: string;
  professor: string;
  cfu: number;
  color: string;
  icon: string;
  emoji?: string;
  bannerUrl?: string;
  bannerGradient?: string;
  progress: number;
  attendanceMandatory?: boolean;
  minAttendancePercentage?: number;
  startDate?: string;
  endDate?: string;
  nextLecture?: {
    date: string;
    dayName: string;
    time: string;
    room: string;
  };
  notesOrganized: number;
  repetitionsDone: number;
  repetitionsTotal: number;
  topics: TopicItem[];
  lezioni?: Lezione[];
  semestre?: string;
  aulaAbituale?: string;
  orarioAbituale?: string;
  linkAulaVirtuale?: string;
  noteCorso?: string;
}

export type RegistrationStatus =
  | 'In attesa'
  | 'Iscritto'
  | 'Confermata'
  | 'Non iscritto'
  | 'Verbalizzato';

export interface Esame {
  id: string;
  courseId: string;
  courseName: string;
  professor: string;
  date: string; // e.g. "2026-05-31"
  time: string; // e.g. "09:00"
  room: string;
  registrationStatus: RegistrationStatus;
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
  calendarEventId?: string;
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
  recurrence?: string;
  relatedTaskId?: string;
  relatedCourseId?: string;
  relatedExamId?: string;
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
  fileData?: string;
  mimeType?: string;
  fileName?: string;
  fileId?: string;
}

export interface SemesterGoal {
  id: string;
  title: string;
  progress: number;
  current: number;
  total: number;
  priority: 'Alta' | 'Media' | 'Bassa';
  category?: string;
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

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'exam' | 'task' | 'lecture' | 'update' | 'info';
  read: boolean;
  linkView?: NavView;
}

export type FontSizeOption = 'small' | 'medium' | 'large' | 'xlarge';

export interface UserSettings {
  name: string;
  email: string;
  role: string;
  avatar: string;
  university: string;
  academicYear: string;
  studyProgram: string;
  studyYear: string;
  matricola?: string;
  department?: string;
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  fontSize?: FontSizeOption;
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

