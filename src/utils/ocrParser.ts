import { createWorker } from 'tesseract.js';

export interface ParsedTimetableSlot {
  id: string;
  day: string; // 'Lunedì' | 'Martedì' | etc.
  dayIndex: number; // 0 for Lun, 1 for Mar, etc.
  startTime: string; // '09:00'
  endTime: string; // '11:00'
  courseName: string;
  room: string;
  professor?: string;
  notes?: string;
}

const DAYS_MAP: { [key: string]: { name: string; index: number } } = {
  lun: { name: 'Lunedì', index: 0 },
  luned: { name: 'Lunedì', index: 0 },
  lunedì: { name: 'Lunedì', index: 0 },
  lunedi: { name: 'Lunedì', index: 0 },
  mon: { name: 'Lunedì', index: 0 },
  monday: { name: 'Lunedì', index: 0 },

  mar: { name: 'Martedì', index: 1 },
  mart: { name: 'Martedì', index: 1 },
  martedì: { name: 'Martedì', index: 1 },
  martedi: { name: 'Martedì', index: 1 },
  tue: { name: 'Martedì', index: 1 },
  tuesday: { name: 'Martedì', index: 1 },

  mer: { name: 'Mercoledì', index: 2 },
  merc: { name: 'Mercoledì', index: 2 },
  mercoledì: { name: 'Mercoledì', index: 2 },
  mercoledi: { name: 'Mercoledì', index: 2 },
  wed: { name: 'Mercoledì', index: 2 },
  wednesday: { name: 'Mercoledì', index: 2 },

  gio: { name: 'Giovedì', index: 3 },
  giov: { name: 'Giovedì', index: 3 },
  giovedì: { name: 'Giovedì', index: 3 },
  giovedi: { name: 'Giovedì', index: 3 },
  thu: { name: 'Giovedì', index: 3 },
  thursday: { name: 'Giovedì', index: 3 },

  ven: { name: 'Venerdì', index: 4 },
  venerdì: { name: 'Venerdì', index: 4 },
  venerdi: { name: 'Venerdì', index: 4 },
  fri: { name: 'Venerdì', index: 4 },
  friday: { name: 'Venerdì', index: 4 },

  sab: { name: 'Sabato', index: 5 },
  sabato: { name: 'Sabato', index: 5 },
  sat: { name: 'Sabato', index: 5 },
  saturday: { name: 'Sabato', index: 5 },

  dom: { name: 'Domenica', index: 6 },
  domenica: { name: 'Domenica', index: 6 },
  sun: { name: 'Domenica', index: 6 },
  sunday: { name: 'Domenica', index: 6 },
};

/**
 * Format a time string like "9", "9:00", "09.30" into standard "09:00"
 */
const standardizeTime = (timeStr: string): string => {
  const clean = timeStr.trim().replace('.', ':');
  if (!clean.includes(':')) {
    const num = parseInt(clean, 10);
    if (!isNaN(num)) {
      return `${num < 10 ? '0' + num : num}:00`;
    }
  }
  const parts = clean.split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1] || '0', 10);
  if (isNaN(h)) return '09:00';
  const hh = h < 10 ? '0' + h : String(h);
  const mm = m < 10 ? '0' + m : String(m);
  return `${hh}:${mm}`;
};

/**
 * Run OCR recognition on an image File or Data URL using Tesseract
 */
export const runOCR = async (
  imageSource: File | string,
  onProgress?: (progress: number, status: string) => void
): Promise<string> => {
  try {
    const worker = await createWorker('ita+eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round((m.progress || 0) * 100), m.status);
        } else if (onProgress && m.status) {
          onProgress(30, m.status);
        }
      },
    });

    const ret = await worker.recognize(imageSource);
    await worker.terminate();
    return ret.data.text || '';
  } catch (error) {
    console.error('OCR Processing error:', error);
    throw error;
  }
};

/**
 * Parse raw text from OCR or copy-paste into structured timetable slots
 */
export const parseTimetableText = (rawText: string): ParsedTimetableSlot[] => {
  const slots: ParsedTimetableSlot[] = [];
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  let currentDay: { name: string; index: number } = { name: 'Lunedì', index: 0 };

  // Regular expression to find time ranges e.g. "09:00 - 11:00", "9:30-11:30", "14:00/16:00", "09:00 - 11.00"
  const timeRangeRegex = /(?:(?:dalle|ore)?\s*)?(\d{1,2}(?:[:.]\d{2})?)\s*(?:-|–|—|\/|a|alle|to)\s*(\d{1,2}(?:[:.]\d{2})?)/i;
  // Regex to detect days
  const dayRegex = /\b(luned[iì]|marted[iì]|mercoled[iì]|gioved[iì]|venerd[iì]|sabato|domenica|lun|mar|mer|gio|ven|sab|dom|mon|tue|wed|thu|fri|sat|sun)\b/i;
  // Regex for classroom / aula
  const aulaRegex = /(?:aula|lab(?:oratorio)?|edificio|ed\.|building|room)\s*([A-Za-z0-9_.-]+)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line specifies a day of week
    const dayMatch = line.match(dayRegex);
    if (dayMatch) {
      const key = dayMatch[1].toLowerCase().replace('ì', 'i');
      if (DAYS_MAP[key]) {
        currentDay = DAYS_MAP[key];
      }
    }

    // Check if line contains time range
    const timeMatch = line.match(timeRangeRegex);
    if (timeMatch) {
      const startTime = standardizeTime(timeMatch[1]);
      const endTime = standardizeTime(timeMatch[2]);

      // Extract classroom
      const aulaMatch = line.match(aulaRegex);
      const room = aulaMatch ? `Aula ${aulaMatch[1]}` : '';

      // Clean course name from line
      let courseName = line
        .replace(timeRangeRegex, '')
        .replace(dayRegex, '')
        .replace(aulaRegex, '')
        .replace(/[•\-|:;,()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // If courseName is too short, look at preceding or following line
      if (courseName.length < 3 && i > 0 && lines[i - 1].length > 3 && !lines[i - 1].match(timeRangeRegex)) {
        courseName = lines[i - 1];
      } else if (courseName.length < 3 && i + 1 < lines.length && lines[i + 1].length > 3 && !lines[i + 1].match(timeRangeRegex)) {
        courseName = lines[i + 1];
      }

      if (!courseName || courseName.length < 2) {
        courseName = 'Lezione';
      }

      slots.push({
        id: `slot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        day: currentDay.name,
        dayIndex: currentDay.index,
        startTime,
        endTime,
        courseName,
        room: room || 'Aula da definire',
      });
    }
  }

  // Fallback: If no structured time range matched, try to create placeholder slots from non-empty lines
  if (slots.length === 0 && lines.length > 0) {
    lines.slice(0, 5).forEach((line, idx) => {
      if (line.length > 2) {
        slots.push({
          id: `slot_${Date.now()}_${idx}`,
          day: 'Lunedì',
          dayIndex: 0,
          startTime: `${String(9 + idx * 2).padStart(2, '0')}:00`,
          endTime: `${String(11 + idx * 2).padStart(2, '0')}:00`,
          courseName: line.slice(0, 40),
          room: 'Aula 1',
        });
      }
    });
  }

  return slots;
};

/**
 * Parse CSV or TSV or JSON data
 */
export const parseBulkFile = (content: string): ParsedTimetableSlot[] => {
  const trimmed = content.trim();
  // Try JSON
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any, idx) => ({
          id: `slot_json_${Date.now()}_${idx}`,
          day: item.day || item.giorno || 'Lunedì',
          dayIndex: typeof item.dayIndex === 'number' ? item.dayIndex : 0,
          startTime: item.startTime || item.oraInizio || '09:00',
          endTime: item.endTime || item.oraFine || '11:00',
          courseName: item.courseName || item.corso || item.materia || 'Corso',
          room: item.room || item.aula || 'Aula 1',
          professor: item.professor || item.docente || '',
        }));
      }
    } catch {
      // fallback to CSV
    }
  }

  // Parse CSV
  const rows = trimmed.split(/\r?\n/).map((r) => r.split(/[,;\t]/).map((c) => c.trim()));
  const slots: ParsedTimetableSlot[] = [];

  rows.forEach((cols, idx) => {
    if (cols.length >= 3 && idx > 0) {
      const day = cols[0] || 'Lunedì';
      const timeStr = cols[1] || '09:00 - 11:00';
      const course = cols[2] || 'Corso';
      const room = cols[3] || 'Aula 1';

      const timeParts = timeStr.split('-').map((t) => t.trim());
      const startTime = standardizeTime(timeParts[0] || '09:00');
      const endTime = standardizeTime(timeParts[1] || '11:00');

      slots.push({
        id: `slot_csv_${Date.now()}_${idx}`,
        day,
        dayIndex: 0,
        startTime,
        endTime,
        courseName: course,
        room,
      });
    }
  });

  return slots;
};
