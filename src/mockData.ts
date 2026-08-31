import type {
  Corso,
  Esame,
  Compito,
  EventoCalendario,
  Risorsa,
  SemesterGoal,
  WeeklyGoal,
  Habit,
  UserSettings,
} from './types';

export const initialUserSettings: UserSettings = {
  name: 'Sara Luongo',
  email: 'sara.luongo@email.com',
  role: 'Studentessa',
  avatar: '',
  university: 'Politecnico di Milano',
  academicYear: '2025/2026',
  studyProgram: 'Ingegneria Informatica',
  studyYear: '2° anno',
  theme: 'light',
  accentColor: '#2563eb',
  notifications: {
    lessonReminders: true,
    examDeadlines: true,
    suggestedActivities: true,
    appUpdates: false,
  },
  startOfWeek: 'Lunedì',
  defaultReminder: '15 minuti prima',
  autoBackup: true,
};

export const initialCorsi: Corso[] = [];
export const initialEsami: Esame[] = [];
export const initialCompiti: Compito[] = [];
export const initialEventi: EventoCalendario[] = [];
export const initialRisorse: Risorsa[] = [];
export const initialSemesterGoals: SemesterGoal[] = [];
export const initialWeeklyGoals: WeeklyGoal[] = [];
export const initialHabits: Habit[] = [];
