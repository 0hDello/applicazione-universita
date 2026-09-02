import type { EventCategory } from '../types';

export interface ExternalCalendarEvent {
  id: string;
  title: string;
  category: EventCategory;
  date: string; // YYYY-MM-DD
  time: string; // "09:00 - 11:00"
  room?: string;
  courseName?: string;
  notes?: string;
  selected: boolean;
}

/**
 * Format iCal date string (e.g. "20260315T090000Z" or "20260315" or "TZID=Europe/Rome:20260315T090000")
 */
export const parseIcsDate = (rawStr: string): { date: string; time: string } => {
  // Strip TZID or parameters before colon
  const colonIdx = rawStr.indexOf(':');
  const value = colonIdx !== -1 ? rawStr.substring(colonIdx + 1).trim() : rawStr.trim();

  // Pattern 1: YYYYMMDDTHHMMSS...
  if (value.includes('T')) {
    const [dPart, tPart] = value.split('T');
    const y = dPart.substring(0, 4);
    const m = dPart.substring(4, 6);
    const d = dPart.substring(6, 8);
    const date = `${y}-${m}-${d}`;

    const hh = tPart.substring(0, 2);
    const mm = tPart.substring(2, 4);
    const time = `${hh}:${mm}`;

    return { date, time };
  }

  // Pattern 2: YYYYMMDD (All day)
  if (value.length >= 8) {
    const y = value.substring(0, 4);
    const m = value.substring(4, 6);
    const d = value.substring(6, 8);
    return { date: `${y}-${m}-${d}`, time: '09:00' };
  }

  return { date: new Date().toISOString().split('T')[0], time: '09:00' };
};

/**
 * Unfold ICS multiline content (RFC 5545 allows line folding with leading space/tab)
 */
export const unfoldIcs = (icsText: string): string[] => {
  const rawLines = icsText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const unfolded: string[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    if ((line.startsWith(' ') || line.startsWith('\t')) && unfolded.length > 0) {
      unfolded[unfolded.length - 1] += line.substring(1);
    } else {
      unfolded.push(line);
    }
  }

  return unfolded;
};

/**
 * Guess category based on event title and description
 */
export const guessCategory = (title: string, desc: string = ''): EventCategory => {
  const combined = `${title} ${desc}`.toLowerCase();
  if (combined.includes('esame') || combined.includes('parziale') || combined.includes('appello') || combined.includes('orale') || combined.includes('scritto')) {
    return 'Esame';
  }
  if (combined.includes('scadenza') || combined.includes('consegna') || combined.includes('deadline') || combined.includes('progetto') || combined.includes('iscrizione')) {
    return 'Scadenza';
  }
  if (combined.includes('studio') || combined.includes('ripasso') || combined.includes('esercizi') || combined.includes('tesi') || combined.includes('pomodoro')) {
    return 'Studio';
  }
  return 'Lezione';
};

/**
 * Parse an .ICS file string into a list of preview events
 */
export const parseIcsContent = (icsText: string, knownCourseNames: string[] = []): ExternalCalendarEvent[] => {
  const lines = unfoldIcs(icsText);
  const events: ExternalCalendarEvent[] = [];

  let inEvent = false;
  let currentSummary = '';
  let currentStart = '';
  let currentEnd = '';
  let currentLocation = '';
  let currentDescription = '';

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('BEGIN:VEVENT')) {
      inEvent = true;
      currentSummary = '';
      currentStart = '';
      currentEnd = '';
      currentLocation = '';
      currentDescription = '';
      continue;
    }

    if (trimmed.startsWith('END:VEVENT')) {
      if (inEvent && (currentSummary || currentStart)) {
        const startParsed = parseIcsDate(currentStart);
        const endParsed = currentEnd ? parseIcsDate(currentEnd) : null;
        const timeStr = endParsed ? `${startParsed.time} - ${endParsed.time}` : `${startParsed.time} - 11:00`;

        const titleClean = currentSummary.replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\n/g, ' ').trim();
        const locClean = currentLocation.replace(/\\,/g, ',').replace(/\\;/g, ';').trim();
        const descClean = currentDescription.replace(/\\n/g, '\n').replace(/\\,/g, ',').trim();

        // Check if title matches any known course
        let matchedCourse = '';
        const lowerTitle = titleClean.toLowerCase();
        for (const cName of knownCourseNames) {
          if (lowerTitle.includes(cName.toLowerCase()) || cName.toLowerCase().includes(lowerTitle)) {
            matchedCourse = cName;
            break;
          }
        }

        events.push({
          id: `ext_${Date.now()}_${events.length}_${Math.random().toString(36).substring(2, 6)}`,
          title: titleClean || 'Evento Importato',
          category: guessCategory(titleClean, descClean),
          date: startParsed.date,
          time: timeStr,
          room: locClean || undefined,
          courseName: matchedCourse || undefined,
          notes: descClean || undefined,
          selected: true,
        });
      }
      inEvent = false;
      continue;
    }

    if (inEvent) {
      if (trimmed.startsWith('SUMMARY:')) {
        currentSummary = trimmed.substring(8);
      } else if (trimmed.startsWith('DTSTART')) {
        currentStart = trimmed;
      } else if (trimmed.startsWith('DTEND')) {
        currentEnd = trimmed;
      } else if (trimmed.startsWith('LOCATION:')) {
        currentLocation = trimmed.substring(9);
      } else if (trimmed.startsWith('DESCRIPTION:')) {
        currentDescription = trimmed.substring(12);
      }
    }
  }

  return events;
};

/**
 * Parse Notion / Generic CSV export
 */
export const parseCsvContent = (csvText: string, knownCourseNames: string[] = []): ExternalCalendarEvent[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''));
  const events: ExternalCalendarEvent[] = [];

  const titleIdx = headers.findIndex((h) => h.includes('name') || h.includes('title') || h.includes('titolo') || h.includes('evento') || h.includes('lezione'));
  const dateIdx = headers.findIndex((h) => h.includes('date') || h.includes('data') || h.includes('giorno'));
  const timeIdx = headers.findIndex((h) => h.includes('time') || h.includes('ora') || h.includes('orario'));
  const roomIdx = headers.findIndex((h) => h.includes('room') || h.includes('aula') || h.includes('luogo') || h.includes('location'));
  const courseIdx = headers.findIndex((h) => h.includes('course') || h.includes('corso') || h.includes('materia'));
  const notesIdx = headers.findIndex((h) => h.includes('note') || h.includes('descrizione') || h.includes('description'));

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].trim();
    if (!row) continue;

    // Simple CSV row parser handling quotes
    const cols = row.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    const title = titleIdx !== -1 ? cols[titleIdx] : cols[0];
    const dateStr = dateIdx !== -1 ? cols[dateIdx] : new Date().toISOString().split('T')[0];
    const timeStr = timeIdx !== -1 && cols[timeIdx] ? cols[timeIdx] : '09:00 - 11:00';
    const room = roomIdx !== -1 ? cols[roomIdx] : undefined;
    const course = courseIdx !== -1 ? cols[courseIdx] : undefined;
    const notes = notesIdx !== -1 ? cols[notesIdx] : undefined;

    if (!title) continue;

    // Normalize date format (DD/MM/YYYY -> YYYY-MM-DD)
    let formattedDate = dateStr;
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          formattedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        } else {
          formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
    }

    let matchedCourse = course;
    if (!matchedCourse && knownCourseNames.length > 0) {
      matchedCourse = knownCourseNames.find((cn) =>
        title.toLowerCase().includes(cn.toLowerCase()) || (notes && notes.toLowerCase().includes(cn.toLowerCase()))
      );
    }

    events.push({
      id: `csv_${Date.now()}_${i}`,
      title,
      category: guessCategory(title, notes || ''),
      date: formattedDate,
      time: timeStr.includes('-') ? timeStr : `${timeStr} - 11:00`,
      room: room || undefined,
      courseName: matchedCourse || undefined,
      notes: notes || undefined,
      selected: true,
    });
  }

  return events;
};
