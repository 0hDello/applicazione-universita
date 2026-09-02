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

export const DAYS_LIST = [
  'Lunedì',
  'Martedì',
  'Mercoledì',
  'Giovedì',
  'Venerdì',
  'Sabato',
  'Domenica',
];

const DAYS_MAP: { [key: string]: { name: string; index: number } } = {
  lun: { name: 'Lunedì', index: 0 },
  lune: { name: 'Lunedì', index: 0 },
  luned: { name: 'Lunedì', index: 0 },
  lunedì: { name: 'Lunedì', index: 0 },
  lunedi: { name: 'Lunedì', index: 0 },
  luned1: { name: 'Lunedì', index: 0 },
  lunedl: { name: 'Lunedì', index: 0 },
  mon: { name: 'Lunedì', index: 0 },
  monday: { name: 'Lunedì', index: 0 },

  mar: { name: 'Martedì', index: 1 },
  mart: { name: 'Martedì', index: 1 },
  martedì: { name: 'Martedì', index: 1 },
  martedi: { name: 'Martedì', index: 1 },
  marted1: { name: 'Martedì', index: 1 },
  martedl: { name: 'Martedì', index: 1 },
  tue: { name: 'Martedì', index: 1 },
  tuesday: { name: 'Martedì', index: 1 },

  mer: { name: 'Mercoledì', index: 2 },
  merc: { name: 'Mercoledì', index: 2 },
  mercoledì: { name: 'Mercoledì', index: 2 },
  mercoledi: { name: 'Mercoledì', index: 2 },
  mercoled1: { name: 'Mercoledì', index: 2 },
  mercoledl: { name: 'Mercoledì', index: 2 },
  wed: { name: 'Mercoledì', index: 2 },
  wednesday: { name: 'Mercoledì', index: 2 },

  gio: { name: 'Giovedì', index: 3 },
  giov: { name: 'Giovedì', index: 3 },
  giovedì: { name: 'Giovedì', index: 3 },
  giovedi: { name: 'Giovedì', index: 3 },
  gioved1: { name: 'Giovedì', index: 3 },
  giovedl: { name: 'Giovedì', index: 3 },
  thu: { name: 'Giovedì', index: 3 },
  thursday: { name: 'Giovedì', index: 3 },

  ven: { name: 'Venerdì', index: 4 },
  vene: { name: 'Venerdì', index: 4 },
  venerdì: { name: 'Venerdì', index: 4 },
  venerdi: { name: 'Venerdì', index: 4 },
  venerd1: { name: 'Venerdì', index: 4 },
  venerdl: { name: 'Venerdì', index: 4 },
  fri: { name: 'Venerdì', index: 4 },
  friday: { name: 'Venerdì', index: 4 },

  sab: { name: 'Sabato', index: 5 },
  saba: { name: 'Sabato', index: 5 },
  sabato: { name: 'Sabato', index: 5 },
  sat: { name: 'Sabato', index: 5 },
  saturday: { name: 'Sabato', index: 5 },

  dom: { name: 'Domenica', index: 6 },
  dome: { name: 'Domenica', index: 6 },
  domenica: { name: 'Domenica', index: 6 },
  sun: { name: 'Domenica', index: 6 },
  sunday: { name: 'Domenica', index: 6 },
};

/**
 * Format time strings like "8", "8:30", "08.30", "8;30", "14" into "08:30"
 */
export const standardizeTime = (timeStr: string): string => {
  if (!timeStr) return '09:00';
  const clean = timeStr.trim().replace(/[.;,]/g, ':').replace(/\s+/g, '');
  
  if (!clean.includes(':')) {
    const num = parseInt(clean, 10);
    if (!isNaN(num)) {
      const h = num < 24 ? num : 9;
      return `${h < 10 ? '0' + h : h}:00`;
    }
  }
  
  const parts = clean.split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1] || '0', 10);
  
  if (isNaN(h)) return '09:00';
  const clampedH = Math.min(23, Math.max(0, h));
  const clampedM = Math.min(59, Math.max(0, isNaN(m) ? 0 : m));
  
  const hh = clampedH < 10 ? '0' + clampedH : String(clampedH);
  const mm = clampedM < 10 ? '0' + clampedM : String(clampedM);
  return `${hh}:${mm}`;
};

/**
 * Pre-clean OCR raw text to fix common recognition artifacts
 */
export const cleanOcrText = (raw: string): string => {
  return raw
    // Replace pipe or weird bar chars with space
    .replace(/[|│┃]/g, ' ')
    // Fix common OCR typos in days
    .replace(/Luned[1l|]/gi, 'Lunedì')
    .replace(/Marted[1l|]/gi, 'Martedì')
    .replace(/Mercoled[1l|]/gi, 'Mercoledì')
    .replace(/Gioved[1l|]/gi, 'Giovedì')
    .replace(/Venerd[1l|]/gi, 'Venerdì')
    // Fix time separators (e.g. 09;00 or 09.00 -> 09:00)
    .replace(/(\d{1,2})[.;](\d{2})/g, '$1:$2')
    // Fix common range patterns (e.g. 9-11 or 9:00 - 11:00)
    .replace(/(\d{1,2}(?::\d{2})?)\s*(?:[—–_~]|\s+a\s+|\s+alle\s+)\s*(\d{1,2}(?::\d{2})?)/gi, '$1 - $2');
};

/**
 * Fuzzy match extracted subject name with known course names
 */
export const matchWithKnownCourses = (extractedName: string, knownCourses: string[]): string => {
  if (!extractedName || knownCourses.length === 0) return extractedName;
  const lowerExtracted = extractedName.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const course of knownCourses) {
    const lowerCourse = course.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (lowerExtracted.includes(lowerCourse) || lowerCourse.includes(lowerExtracted)) {
      return course;
    }
    // Check initials or word overlap
    const courseWords = course.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const extractedWords = extractedName.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const matchCount = courseWords.filter((cw) => extractedWords.some((ew) => ew.includes(cw) || cw.includes(ew))).length;
    if (matchCount >= 2 || (courseWords.length === 1 && matchCount === 1)) {
      return course;
    }
  }

  return extractedName;
};

/**
 * Run OCR recognition on an image File or Data URL using Tesseract.js
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
          onProgress(25, m.status);
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
 * Multi-pass parser that extracts structured timetable slots from OCR or raw text
 */
export const parseTimetableText = (
  rawText: string,
  knownCourseNames: string[] = []
): ParsedTimetableSlot[] => {
  const cleanedText = cleanOcrText(rawText);
  const slots: ParsedTimetableSlot[] = [];
  const lines = cleanedText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  let currentDay: { name: string; index: number } = { name: 'Lunedì', index: 0 };

  // Regular expressions
  const timeRangeRegex = /(?:(?:dalle|ore|h)?\s*)?(\d{1,2}(?::\d{2})?)\s*(?:-|–|—|\/|to)\s*(\d{1,2}(?::\d{2})?)/i;
  const singleTimeRegex = /\b(\d{1,2}:\d{2})\b/;
  const dayRegex = /\b(luned[iì1l]|marted[iì1l]|mercoled[iì1l]|gioved[iì1l]|venerd[iì1l]|sabato|domenica|lun|mar|mer|gio|ven|sab|dom|mon|tue|wed|thu|fri|sat|sun)\b/i;
  const aulaRegex = /(?:aula|lab(?:oratorio)?|edificio|ed\.|building|room|sede)\s*([A-Za-z0-9_./-]+)/i;
  const profRegex = /(?:prof(?:\.ssa|\.se|\.)?|docente)\s*([A-Za-zÀ-ÿ'\s]+)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line specifies a day of week
    const dayMatch = line.match(dayRegex);
    if (dayMatch) {
      const key = dayMatch[1].toLowerCase().replace(/[ì1l]/g, 'i');
      if (DAYS_MAP[key]) {
        currentDay = DAYS_MAP[key];
      }
    }

    // Check if line contains a time range
    const timeMatch = line.match(timeRangeRegex);
    if (timeMatch) {
      let startTime = standardizeTime(timeMatch[1]);
      let endTime = standardizeTime(timeMatch[2]);

      // If end time equals start time or is before start time, advance by 2 hours
      const [sh] = startTime.split(':').map(Number);
      const [eh] = endTime.split(':').map(Number);
      if (eh <= sh) {
        endTime = `${Math.min(23, sh + 2 < 10 ? 0 : 0) + (sh + 2)}:00`.padStart(5, '0');
        if (sh + 2 > 23) endTime = '20:00';
      }

      // Extract classroom
      const aulaMatch = line.match(aulaRegex) || (i + 1 < lines.length ? lines[i + 1].match(aulaRegex) : null);
      const room = aulaMatch ? `Aula ${aulaMatch[1].replace(/^[A-Za-z]+\s*/, '')}` : 'Aula da definire';

      // Extract professor
      const profMatch = line.match(profRegex) || (i + 1 < lines.length ? lines[i + 1].match(profRegex) : null);
      const professor = profMatch ? profMatch[1].trim() : undefined;

      // Extract Course Name
      let rawCourseName = line
        .replace(timeRangeRegex, '')
        .replace(dayRegex, '')
        .replace(aulaRegex, '')
        .replace(profRegex, '')
        .replace(/[[\](){}<>•\-|:;,_~]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // If course name is too short, look at surrounding lines
      if (rawCourseName.length < 3) {
        if (i > 0 && lines[i - 1].length > 3 && !lines[i - 1].match(timeRangeRegex) && !lines[i - 1].match(dayRegex)) {
          rawCourseName = lines[i - 1].replace(aulaRegex, '').replace(profRegex, '').trim();
        } else if (i + 1 < lines.length && lines[i + 1].length > 3 && !lines[i + 1].match(timeRangeRegex) && !lines[i + 1].match(dayRegex)) {
          rawCourseName = lines[i + 1].replace(aulaRegex, '').replace(profRegex, '').trim();
        }
      }

      // Match with known courses if available
      const finalCourseName = matchWithKnownCourses(
        rawCourseName || 'Lezione Universitaria',
        knownCourseNames
      );

      slots.push({
        id: `slot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        day: currentDay.name,
        dayIndex: currentDay.index,
        startTime,
        endTime,
        courseName: finalCourseName,
        room,
        professor,
      });
    } else {
      // Check if line has a single time and nearby line has subject
      const singleMatch = line.match(singleTimeRegex);
      if (singleMatch && i + 1 < lines.length && lines[i + 1].length > 3) {
        const startTime = standardizeTime(singleMatch[1]);
        const [sh, sm] = startTime.split(':').map(Number);
        const endH = Math.min(23, sh + 2);
        const endTime = `${endH < 10 ? '0' + endH : endH}:${sm < 10 ? '0' + sm : sm}`;

        const nextLine = lines[i + 1];
        const aulaMatch = nextLine.match(aulaRegex);
        const room = aulaMatch ? `Aula ${aulaMatch[1]}` : 'Aula da definire';

        const rawCourseName = nextLine
          .replace(aulaRegex, '')
          .replace(dayRegex, '')
          .replace(/[[\](){}<>•\-|:;,_~]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (rawCourseName.length > 2) {
          slots.push({
            id: `slot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            day: currentDay.name,
            dayIndex: currentDay.index,
            startTime,
            endTime,
            courseName: matchWithKnownCourses(rawCourseName, knownCourseNames),
            room,
          });
          i++; // skip next line as it was consumed
        }
      }
    }
  }

  // Fallback: If no slots parsed, create structured editable slots from meaningful lines
  if (slots.length === 0 && lines.length > 0) {
    const validLines = lines.filter((l) => l.length > 2 && !l.match(dayRegex)).slice(0, 6);
    validLines.forEach((line, idx) => {
      const startH = 9 + (idx % 4) * 2;
      slots.push({
        id: `slot_${Date.now()}_${idx}`,
        day: DAYS_LIST[idx % 5],
        dayIndex: idx % 5,
        startTime: `${String(startH).padStart(2, '0')}:00`,
        endTime: `${String(startH + 2).padStart(2, '0')}:00`,
        courseName: matchWithKnownCourses(line.slice(0, 40), knownCourseNames),
        room: 'Aula 1',
      });
    });
  }

  return slots;
};

/**
 * Parse CSV, TSV, or JSON bulk import
 */
export const parseBulkFile = (
  content: string,
  knownCourseNames: string[] = []
): ParsedTimetableSlot[] => {
  const trimmed = content.trim();

  // Try JSON
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any, idx) => {
          const rawCourse = item.courseName || item.corso || item.materia || 'Corso';
          const dayName = item.day || item.giorno || 'Lunedì';
          const matchedDay = DAYS_MAP[dayName.toLowerCase()] || { name: 'Lunedì', index: 0 };
          return {
            id: `slot_json_${Date.now()}_${idx}`,
            day: matchedDay.name,
            dayIndex: matchedDay.index,
            startTime: standardizeTime(item.startTime || item.oraInizio || '09:00'),
            endTime: standardizeTime(item.endTime || item.oraFine || '11:00'),
            courseName: matchWithKnownCourses(rawCourse, knownCourseNames),
            room: item.room || item.aula || 'Aula 1',
            professor: item.professor || item.docente || '',
          };
        });
      }
    } catch {
      // fallback to CSV
    }
  }

  // Parse CSV / TSV
  const rows = trimmed.split(/\r?\n/).map((r) => r.split(/[,;\t]/).map((c) => c.trim()));
  const slots: ParsedTimetableSlot[] = [];

  rows.forEach((cols, idx) => {
    if (cols.length >= 2) {
      // Skip header if contains 'giorno' or 'day'
      if (idx === 0 && (cols[0].toLowerCase().includes('giorno') || cols[0].toLowerCase().includes('day'))) {
        return;
      }

      const rawDay = cols[0] || 'Lunedì';
      const matchedDay = DAYS_MAP[rawDay.toLowerCase()] || { name: 'Lunedì', index: 0 };
      const timeStr = cols[1] || '09:00 - 11:00';
      const course = cols[2] || cols[0] || 'Corso';
      const room = cols[3] || 'Aula 1';

      const timeParts = timeStr.split('-').map((t) => t.trim());
      const startTime = standardizeTime(timeParts[0] || '09:00');
      const endTime = standardizeTime(timeParts[1] || '11:00');

      slots.push({
        id: `slot_csv_${Date.now()}_${idx}`,
        day: matchedDay.name,
        dayIndex: matchedDay.index,
        startTime,
        endTime,
        courseName: matchWithKnownCourses(course, knownCourseNames),
        room,
      });
    }
  });

  return slots;
};
