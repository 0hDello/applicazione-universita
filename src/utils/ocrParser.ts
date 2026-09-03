import { createWorker } from 'tesseract.js';
import type { Corso } from '../types';
import { matchCourse } from './courseMatcher';

export interface ParsedTimetableSlot {
  id: string;
  day: string; // 'Lunedì' | 'Martedì' | etc.
  dayIndex: number; // 0 for Lun, 1 for Mar, etc.
  date?: string; // e.g. '2026-09-14'
  startTime: string; // '09:00'
  endTime: string; // '11:00'
  courseName: string;
  code?: string;
  matchedCourseId?: string;
  matchedCourseColor?: string;
  matchScore?: number;
  room: string;
  professor?: string;
  period?: string;
  notes?: string;
}

export interface OCRResult {
  text: string;
  slots: ParsedTimetableSlot[];
  isGridDetected: boolean;
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

const ITALIAN_MONTHS: { [key: string]: number } = {
  gennaio: 0,
  febbraio: 1,
  marzo: 2,
  aprile: 3,
  maggio: 4,
  giugno: 5,
  luglio: 6,
  agosto: 7,
  settembre: 8,
  ottobre: 9,
  novembre: 10,
  dicembre: 11,
  gen: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  mag: 4,
  giu: 5,
  lug: 6,
  ago: 7,
  set: 8,
  ott: 9,
  nov: 10,
  dic: 11,
};

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
    .replace(/[|│┃]/g, ' ')
    .replace(/Luned[1l|]/gi, 'Lunedì')
    .replace(/Marted[1l|]/gi, 'Martedì')
    .replace(/Mercoled[1l|]/gi, 'Mercoledì')
    .replace(/Gioved[1l|]/gi, 'Giovedì')
    .replace(/Venerd[1l|]/gi, 'Venerdì')
    .replace(/(\d{1,2})[.;](\d{2})/g, '$1:$2');
};

/**
 * Dedicated parser for UniBo Agenda / List View and copy-pasted text (image2.png)
 */
export const parseUniBoAgendaText = (
  text: string,
  availableCourses: Corso[] = []
): ParsedTimetableSlot[] => {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const slots: ParsedTimetableSlot[] = [];

  let currentDay: { name: string; index: number } = { name: 'Lunedì', index: 0 };
  let currentDateStr = '';

  const dateHeaderRegex = /^(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)(?:\s+(\d{4}))?/i;
  const dayAbbrRegex = /^(?:[•\-\*]\s*)?(LUN|MAR|MER|GIO|VEN|SAB|DOM)(?:ED[IÌ])?\s*(\d{1,2})[\/\.-](\d{1,2})(?:[\/\.-](\d{2,4}))?/i;
  const timeSlotRegex = /^(\d{1,2}:\d{2})\s*(?:-|–|—|\/|to)\s*(\d{1,2}:\d{2})\s*(.*)$/i;
  const periodoRegex = /^(?:periodo|dal|date)\s*:?/i;

  let currentSlot: ParsedTimetableSlot | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. Check Date Header: e.g. "14 SETTEMBRE 2026"
    const dateHeaderMatch = line.match(dateHeaderRegex);
    if (dateHeaderMatch) {
      if (currentSlot) {
        slots.push(currentSlot);
        currentSlot = null;
      }
      const dayNum = parseInt(dateHeaderMatch[1], 10);
      const monthStr = dateHeaderMatch[2].toLowerCase();
      const monthNum = ITALIAN_MONTHS[monthStr] ?? 8;
      const yearNum = dateHeaderMatch[3] ? parseInt(dateHeaderMatch[3], 10) : 2026;

      const dateObj = new Date(yearNum, monthNum, dayNum);
      const jsDay = dateObj.getDay(); // 0 = Sun, 1 = Mon ...
      const dayIndex = jsDay === 0 ? 6 : jsDay - 1;
      currentDay = { name: DAYS_LIST[dayIndex], index: dayIndex };
      currentDateStr = `${yearNum}-${String(monthNum + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      continue;
    }

    // 1b. Check Day Abbrev header: e.g. "LUN 14/9"
    const dayAbbrMatch = line.match(dayAbbrRegex);
    if (dayAbbrMatch) {
      if (currentSlot) {
        slots.push(currentSlot);
        currentSlot = null;
      }
      const abbrMap: { [k: string]: number } = { LUN: 0, MAR: 1, MER: 2, GIO: 3, VEN: 4, SAB: 5, DOM: 6 };
      const idx = abbrMap[dayAbbrMatch[1].toUpperCase()] ?? 0;
      currentDay = { name: DAYS_LIST[idx], index: idx };
      continue;
    }

    // 2. Check if line starts with a Time Range: e.g. "09:00 - 11:00 29228 - GEOMETRIA..."
    const timeMatch = line.match(timeSlotRegex);
    if (timeMatch) {
      if (currentSlot) {
        slots.push(currentSlot);
        currentSlot = null;
      }

      const startTime = timeMatch[1];
      const endTime = timeMatch[2];
      const rest = timeMatch[3].trim();

      // Extract course code and name from rest
      let code: string | undefined = undefined;
      let courseName = rest;
      const codeMatch = rest.match(/^(\d{5})\s*-\s*(.+)$/);
      if (codeMatch) {
        code = codeMatch[1];
        courseName = codeMatch[2];
      }
      courseName = courseName.replace(/\(\d+\s*CFU\)/i, '').trim();

      const matchRes = matchCourse(`${code || ''} ${courseName}`, availableCourses);

      currentSlot = {
        id: `slot_agenda_${Date.now()}_${slots.length}`,
        day: currentDay.name,
        dayIndex: currentDay.index,
        date: currentDateStr || undefined,
        startTime,
        endTime,
        code,
        courseName: matchRes.matchedName,
        matchedCourseId: matchRes.course?.id,
        matchedCourseColor: matchRes.course?.color,
        matchScore: matchRes.score,
        room: 'Aula da definire',
      };
      continue;
    }

    // 3. Sub-lines of currentSlot: Docente, Luogo, Periodo
    if (currentSlot) {
      // Period line: e.g. "Periodo: 14 settembre 2026 - 16 dicembre 2026"
      if (
        line.match(periodoRegex) ||
        (line.toLowerCase().includes('settembre') && line.toLowerCase().includes('dicembre')) ||
        (line.toLowerCase().includes('febbraio') && line.toLowerCase().includes('giugno'))
      ) {
        currentSlot.period = line.replace(/^periodo\s*:?/i, '').trim();
        continue;
      }

      const docenteMatch = line.match(/^(?:docente|prof(?:essore|essoressa)?)\s*:\s*(.+)$/i);
      if (docenteMatch) {
        currentSlot.professor = docenteMatch[1].trim();
        continue;
      }

      const luogoMatch = line.match(/^(?:luogo|aula|room)\s*:\s*(.+)$/i);
      if (luogoMatch) {
        let roomText = luogoMatch[1].trim();
        const parts = roomText.split(/\s*-\s*/);
        currentSlot.room = parts[0].trim();
        continue;
      }
    }
  }

  if (currentSlot) {
    slots.push(currentSlot);
  }

  return slots;
};

/**
 * Geometric reconstruction of calendar grid from OCR bounding boxes (image.png)
 */
export const parseCalendarGrid = (
  words: any[],
  imageWidth: number,
  imageHeight: number,
  availableCourses: Corso[] = []
): ParsedTimetableSlot[] => {
  if (!words || words.length === 0) return [];

  const dayPatterns = [
    { regex: /^(?:LUN|LUNED[IÌ])/i, day: 'Lunedì', index: 0 },
    { regex: /^(?:MAR|MARTED[IÌ])/i, day: 'Martedì', index: 1 },
    { regex: /^(?:MER|MERCOLED[IÌ])/i, day: 'Mercoledì', index: 2 },
    { regex: /^(?:GIO|GIOVED[IÌ])/i, day: 'Giovedì', index: 3 },
    { regex: /^(?:VEN|VENERD[IÌ])/i, day: 'Venerdì', index: 4 },
    { regex: /^(?:SAB|SABATO)/i, day: 'Sabato', index: 5 },
    { regex: /^(?:DOM|DOMENICA)/i, day: 'Domenica', index: 6 },
  ];

  // Find day headers in top 25% of image
  const headerWords = words.filter((w) => w.bbox.y0 < imageHeight * 0.25);
  const detectedCols: { day: string; index: number; centerX: number; x0: number; x1: number }[] = [];

  for (const pat of dayPatterns) {
    const match = headerWords.find((w) => pat.regex.test(w.text.trim()));
    if (match) {
      detectedCols.push({
        day: pat.day,
        index: pat.index,
        centerX: (match.bbox.x0 + match.bbox.x1) / 2,
        x0: match.bbox.x0,
        x1: match.bbox.x1,
      });
    }
  }

  // Need at least 2 detected day headers to confirm it's a grid
  if (detectedCols.length < 2) return [];

  detectedCols.sort((a, b) => a.centerX - b.centerX);

  // Identify hour labels on left margin (X < 15% of width)
  const hourWords = words.filter(
    (w) => w.bbox.x0 < imageWidth * 0.15 && /^\d{1,2}$/.test(w.text.trim())
  );
  const detectedHours: { hour: number; centerY: number; y0: number; y1: number }[] = [];
  for (const hw of hourWords) {
    const val = parseInt(hw.text.trim(), 10);
    if (val >= 7 && val <= 22) {
      detectedHours.push({
        hour: val,
        centerY: (hw.bbox.y0 + hw.bbox.y1) / 2,
        y0: hw.bbox.y0,
        y1: hw.bbox.y1,
      });
    }
  }
  detectedHours.sort((a, b) => a.hour - b.hour);

  let hourHeight = 60;
  if (detectedHours.length >= 2) {
    const diffs: number[] = [];
    for (let i = 1; i < detectedHours.length; i++) {
      const hDiff = detectedHours[i].hour - detectedHours[i - 1].hour;
      const yDiff = detectedHours[i].centerY - detectedHours[i - 1].centerY;
      if (hDiff > 0 && yDiff > 0) {
        diffs.push(yDiff / hDiff);
      }
    }
    if (diffs.length > 0) {
      hourHeight = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    }
  }

  const leftBound =
    detectedHours.length > 0
      ? Math.max(...detectedHours.map((h) => h.y0 !== undefined ? 40 : 0)) + 15
      : imageWidth * 0.08;

  const totalCols = 7;
  const colWidth = (imageWidth - leftBound) / totalCols;
  const columns = [];
  for (let i = 0; i < totalCols; i++) {
    columns.push({
      day: DAYS_LIST[i],
      index: i,
      x0: leftBound + i * colWidth,
      x1: leftBound + (i + 1) * colWidth,
    });
  }

  const getHourFromY = (y: number): number => {
    if (detectedHours.length > 0) {
      const firstH = detectedHours[0];
      const hourOffset = (y - firstH.centerY) / hourHeight;
      const h = Math.round(firstH.hour + hourOffset);
      return Math.max(8, Math.min(21, h));
    }
    return 9;
  };

  // Content words below header and right of hour column
  const contentWords = words.filter(
    (w) => w.bbox.y0 > imageHeight * 0.08 && w.bbox.x0 >= leftBound - 5
  );

  const wordsByCol = new Map<number, any[]>();
  for (const cw of contentWords) {
    const cx = (cw.bbox.x0 + cw.bbox.x1) / 2;
    let colIdx = columns.findIndex((c) => cx >= c.x0 && cx < c.x1);
    if (colIdx === -1) {
      if (cx < columns[0].x0) colIdx = 0;
      else colIdx = totalCols - 1;
    }
    if (!wordsByCol.has(colIdx)) wordsByCol.set(colIdx, []);
    wordsByCol.get(colIdx)!.push(cw);
  }

  const slots: ParsedTimetableSlot[] = [];

  for (const [colIdx, colWords] of wordsByCol.entries()) {
    const colDef = columns[colIdx];
    colWords.sort((a, b) => a.bbox.y0 - b.bbox.y0);

    const clusters: any[][] = [];
    let currentCluster: any[] = [];

    for (const w of colWords) {
      if (currentCluster.length === 0) {
        currentCluster.push(w);
      } else {
        const lastW = currentCluster[currentCluster.length - 1];
        const gap = w.bbox.y0 - lastW.bbox.y1;
        if (gap > hourHeight * 0.45) {
          clusters.push(currentCluster);
          currentCluster = [w];
        } else {
          currentCluster.push(w);
        }
      }
    }
    if (currentCluster.length > 0) clusters.push(currentCluster);

    for (const cluster of clusters) {
      const minY = Math.min(...cluster.map((w) => w.bbox.y0));
      const maxY = Math.max(...cluster.map((w) => w.bbox.y1));

      let startH = getHourFromY(minY);
      let endH = getHourFromY(maxY);
      if (endH <= startH) endH = Math.min(22, startH + 2);

      const clusterText = cluster.map((w) => w.text).join(' ').trim();
      if (clusterText.length < 3) continue;

      let code: string | undefined = undefined;
      const codeMatch = clusterText.match(/\b(\d{5})\b/);
      if (codeMatch) code = codeMatch[1];

      let room = 'Aula da definire';
      const aulaMatch = clusterText.match(/\b(?:AULA\s+[\w\.]+|RANZANI\s+[A-Z0-9]+)\b/i);
      if (aulaMatch) room = aulaMatch[0].trim();

      const matchRes = matchCourse(`${code || ''} ${clusterText}`, availableCourses);

      slots.push({
        id: `grid_slot_${Date.now()}_${slots.length}`,
        day: colDef.day,
        dayIndex: colDef.index,
        startTime: `${String(startH).padStart(2, '0')}:00`,
        endTime: `${String(endH).padStart(2, '0')}:00`,
        code,
        courseName: matchRes.matchedName,
        matchedCourseId: matchRes.course?.id,
        matchedCourseColor: matchRes.course?.color,
        matchScore: matchRes.score,
        room,
      });
    }
  }

  return slots;
};

/**
 * General multi-pass text parser for plain timetable strings
 */
export const parseTimetableText = (
  rawText: string,
  availableCourses: Corso[] = []
): ParsedTimetableSlot[] => {
  // 1. Try specialized UniBo Agenda parser first
  const agendaSlots = parseUniBoAgendaText(rawText, availableCourses);
  if (agendaSlots.length > 0) {
    return agendaSlots;
  }

  // 2. Fallback to standard line parser
  const cleanedText = cleanOcrText(rawText);
  const slots: ParsedTimetableSlot[] = [];
  const lines = cleanedText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  let currentDay: { name: string; index: number } = { name: 'Lunedì', index: 0 };

  const timeRangeRegex = /(?:(?:dalle|ore|h)?\s*)?(\d{1,2}(?::\d{2})?)\s*(?:-|–|—|\/|to)\s*(\d{1,2}(?::\d{2})?)/i;
  const singleTimeRegex = /\b(\d{1,2}:\d{2})\b/;
  const dayRegex = /\b(luned[iì1l]|marted[iì1l]|mercoled[iì1l]|gioved[iì1l]|venerd[iì1l]|sabato|domenica|lun|mar|mer|gio|ven|sab|dom|mon|tue|wed|thu|fri|sat|sun)\b/i;
  const aulaRegex = /(?:aula|lab(?:oratorio)?|edificio|ed\.|building|room|sede)\s*([A-Za-z0-9_./-]+)/i;
  const profRegex = /(?:prof(?:\.ssa|\.se|\.)?|docente)\s*([A-Za-zÀ-ÿ'\s]+)/i;
  const periodoRegex = /^(?:periodo|dal|date)\s*:?/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Exclude Periodo lines
    if (
      line.match(periodoRegex) ||
      (line.toLowerCase().includes('settembre') && line.toLowerCase().includes('dicembre')) ||
      (line.toLowerCase().includes('febbraio') && line.toLowerCase().includes('giugno'))
    ) {
      continue;
    }

    const dayMatch = line.match(dayRegex);
    if (dayMatch) {
      const key = dayMatch[1].toLowerCase().replace(/[ì1l]/g, 'i');
      if (DAYS_MAP[key]) {
        currentDay = DAYS_MAP[key];
      }
    }

    const timeMatch = line.match(timeRangeRegex);
    if (timeMatch) {
      let startTime = standardizeTime(timeMatch[1]);
      let endTime = standardizeTime(timeMatch[2]);

      const [sh] = startTime.split(':').map(Number);
      const [eh] = endTime.split(':').map(Number);
      if (eh <= sh) {
        endTime = `${Math.min(23, sh + 2 < 10 ? 0 : 0) + (sh + 2)}:00`.padStart(5, '0');
        if (sh + 2 > 23) endTime = '20:00';
      }

      const aulaMatch = line.match(aulaRegex) || (i + 1 < lines.length ? lines[i + 1].match(aulaRegex) : null);
      const room = aulaMatch ? `Aula ${aulaMatch[1].replace(/^[A-Za-z]+\s*/, '')}` : 'Aula da definire';

      const profMatch = line.match(profRegex) || (i + 1 < lines.length ? lines[i + 1].match(profRegex) : null);
      const professor = profMatch ? profMatch[1].trim() : undefined;

      let rawCourseName = line
        .replace(timeRangeRegex, '')
        .replace(dayRegex, '')
        .replace(aulaRegex, '')
        .replace(profRegex, '')
        .replace(/[[\](){}<>•\-|:;,_~]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (rawCourseName.length < 3) {
        if (i > 0 && lines[i - 1].length > 3 && !lines[i - 1].match(timeRangeRegex) && !lines[i - 1].match(dayRegex)) {
          rawCourseName = lines[i - 1].replace(aulaRegex, '').replace(profRegex, '').trim();
        } else if (i + 1 < lines.length && lines[i + 1].length > 3 && !lines[i + 1].match(timeRangeRegex) && !lines[i + 1].match(dayRegex)) {
          rawCourseName = lines[i + 1].replace(aulaRegex, '').replace(profRegex, '').trim();
        }
      }

      const matchRes = matchCourse(rawCourseName || 'Lezione Universitaria', availableCourses);

      slots.push({
        id: `slot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        day: currentDay.name,
        dayIndex: currentDay.index,
        startTime,
        endTime,
        courseName: matchRes.matchedName,
        matchedCourseId: matchRes.course?.id,
        matchedCourseColor: matchRes.course?.color,
        matchScore: matchRes.score,
        room,
        professor,
      });
    } else {
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
          const matchRes = matchCourse(rawCourseName, availableCourses);
          slots.push({
            id: `slot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            day: currentDay.name,
            dayIndex: currentDay.index,
            startTime,
            endTime,
            courseName: matchRes.matchedName,
            matchedCourseId: matchRes.course?.id,
            matchedCourseColor: matchRes.course?.color,
            matchScore: matchRes.score,
            room,
          });
          i++;
        }
      }
    }
  }

  return slots;
};

/**
 * Get image natural dimensions in browser
 */
const getImageDimensions = (imageSource: File | string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve({ width: 1200, height: 800 });
      return;
    }
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth || img.width || 1200, height: img.naturalHeight || img.height || 800 });
    img.onerror = () => resolve({ width: 1200, height: 800 });
    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      img.src = URL.createObjectURL(imageSource);
    }
  });
};

/**
 * Run OCR recognition on an image File or Data URL using Tesseract.js
 * Automatically detects if image is a 2D Calendar Grid (image.png) or List/Text View (image2.png)
 */
export const runOCR = async (
  imageSource: File | string,
  onProgress?: (progress: number, status: string) => void,
  availableCourses: Corso[] = []
): Promise<OCRResult> => {
  try {
    const { width, height } = await getImageDimensions(imageSource);

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

    const rawText = ret.data.text || '';
    const pageAny = ret.data as any;
    const words: any[] = pageAny.words ||
      (pageAny.blocks
        ? pageAny.blocks.flatMap((b: any) => b.paragraphs?.flatMap((p: any) => p.lines?.flatMap((l: any) => l.words || []) || []) || [])
        : (pageAny.lines ? pageAny.lines.flatMap((l: any) => l.words || []) : []));

    // Attempt 1: Try geometric 2D grid recognition if words with bounding boxes exist
    let isGridDetected = false;
    let slots: ParsedTimetableSlot[] = [];

    if (words.length > 0) {
      const gridSlots = parseCalendarGrid(words, width, height, availableCourses);
      if (gridSlots.length > 0) {
        slots = gridSlots;
        isGridDetected = true;
      }
    }

    // Attempt 2: If not a grid or no grid slots found, use robust multi-pass text parser
    if (slots.length === 0) {
      slots = parseTimetableText(rawText, availableCourses);
    }

    return {
      text: rawText,
      slots,
      isGridDetected,
    };
  } catch (error) {
    console.error('OCR Processing error:', error);
    throw error;
  }
};

/**
 * Parse CSV, TSV, or JSON bulk import
 */
export const parseBulkFile = (
  content: string,
  availableCourses: Corso[] = []
): ParsedTimetableSlot[] => {
  const trimmed = content.trim();

  // Try JSON
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item, idx) => {
          const matchRes = matchCourse(item.courseName || item.corso || item.materia || '', availableCourses);
          return {
            id: `slot_json_${idx}`,
            day: item.day || item.giorno || 'Lunedì',
            dayIndex: DAYS_LIST.indexOf(item.day || item.giorno) !== -1 ? DAYS_LIST.indexOf(item.day || item.giorno) : 0,
            startTime: item.startTime || item.inizio || '09:00',
            endTime: item.endTime || item.fine || '11:00',
            courseName: matchRes.matchedName,
            matchedCourseId: matchRes.course?.id,
            matchedCourseColor: matchRes.course?.color,
            matchScore: matchRes.score,
            room: item.room || item.aula || 'Aula da definire',
            professor: item.professor || item.docente,
          };
        });
      }
    } catch {
      // not json, continue
    }
  }

  // If text contains UniBo Agenda structure, parse it
  const agendaSlots = parseUniBoAgendaText(content, availableCourses);
  if (agendaSlots.length > 0) {
    return agendaSlots;
  }

  // Parse CSV / TSV lines
  const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const slots: ParsedTimetableSlot[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const sep = line.includes(';') ? ';' : line.includes('\t') ? '\t' : ',';
    const parts = line.split(sep).map((p) => p.trim());

    if (parts.length >= 3) {
      const dayRaw = parts[0].toLowerCase();
      let dayName = 'Lunedì';
      let dayIdx = 0;
      for (const [key, val] of Object.entries(DAYS_MAP)) {
        if (dayRaw.includes(key)) {
          dayName = val.name;
          dayIdx = val.index;
          break;
        }
      }

      const timeRaw = parts[1];
      const timeParts = timeRaw.split(/[-–—to]/).map((t) => t.trim());
      const startTime = standardizeTime(timeParts[0] || '09:00');
      const endTime = standardizeTime(timeParts[1] || '11:00');

      const courseRaw = parts[2];
      const matchRes = matchCourse(courseRaw, availableCourses);
      const room = parts[3] || 'Aula da definire';

      slots.push({
        id: `slot_bulk_${i}`,
        day: dayName,
        dayIndex: dayIdx,
        startTime,
        endTime,
        courseName: matchRes.matchedName,
        matchedCourseId: matchRes.course?.id,
        matchedCourseColor: matchRes.course?.color,
        matchScore: matchRes.score,
        room,
      });
    }
  }

  return slots;
};
