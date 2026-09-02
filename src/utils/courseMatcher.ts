import type { Corso } from '../types';

export interface CourseMatchResult {
  course: Corso | null;
  score: number; // 0 to 1
  matchedName: string;
}

/**
 * Standardize and clean a string for comparison
 */
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s]/g, ' ') // replace punctuation with spaces
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Extract meaningful keywords by filtering out stop words and common academic filler words
 */
const STOP_WORDS = new Set([
  'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', 'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra',
  'del', 'dello', 'della', 'dei', 'degli', 'delle', 'al', 'allo', 'alla', 'ai', 'agli', 'alle',
  'dal', 'dallo', 'dalla', 'dai', 'dagli', 'dalle', 'nel', 'nello', 'nella', 'nei', 'negli', 'nelle',
  'sul', 'sullo', 'sulla', 'sui', 'sugli', 'sulle', 'ed', 'e', 'o', 'd',
  'corso', 'lezione', 'lezioni', 'insegnamento', 'modulo', 'aula', 'prof', 'professore', 'docente',
  'anno', 'semestre', 'laurea', 'triennale', 'magistrale', 't', 'c', 'ci', 'lab', 'laboratorio',
]);

export const extractKeywords = (text: string): string[] => {
  const norm = normalizeText(text);
  return norm
    .split(' ')
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
};

/**
 * Common abbreviations and synonyms mapping to canonical keywords
 */
const ALIAS_MAP: { [key: string]: string[] } = {
  analisi: ['analisi', 'anal', 'am', 'calcolo', 'matematica'],
  geometria: ['geometria', 'geom', 'algebra', 'gal', 'vettori', 'matrici'],
  fisica: ['fisica', 'fis', 'fg', 'meccanica classica', 'elettromagnetismo'],
  chimica: ['chimica', 'chim', 'molecole', 'chimica generale'],
  inglese: ['inglese', 'english', 'lingua', 'cla', 'b2', 'b1', 'idoneita'],
  disegno: ['disegno', 'dis', 'cad', 'modellazione', 'tecnico', 'proiezioni'],
  informatica: ['informatica', 'info', 'fdi', 'programmazione', 'coding', 'software', 'algoritmi', 'c'],
  razionale: ['razionale', 'raz', 'mr', 'statica', 'dinamica'],
  costruzioni: ['costruzioni', 'sdc', 'scienza', 'deformazioni', 'sollecitazioni', 'travi'],
  elettrotecnica: ['elettrotecnica', 'elettro', 'et', 'circuiti', 'elettrica', 'elettrico'],
  metallurgia: ['metallurgia', 'met', 'acciai', 'leghe', 'trattamenti termici'],
  materiali: ['materiali', 'comportamento', 'snervamento', 'polimeri', 'metallici'],
  macchine: ['macchine', 'turbomacchine', 'motori', 'pompe', 'compressori', 'meccanismi', 'mam'],
  termodinamica: ['termodinamica', 'termica', 'calore', 'ft', 'fisica tecnica'],
  fluidi: ['fluidi', 'fluidodinamica', 'idraulica', 'bernoulli', 'condotte'],
  tecnologia: ['tecnologia', 'tec', 'lavorazioni', 'asportazione', 'truciolo', 'cnc', 'fonderia'],
  impianti: ['impianti', 'logistica', 'fabbrica', 'layout', 'produzione'],
  misure: ['misure', 'metrologia', 'sensori', 'collaudo', 'trasduttori'],
  economia: ['economia', 'gestione', 'aziendale', 'costi', 'bilancio'],
};

/**
 * Match an extracted course name or text against an array of existing courses
 */
export const matchCourse = (
  extractedText: string,
  courses: Corso[]
): CourseMatchResult => {
  if (!extractedText || courses.length === 0) {
    return { course: null, score: 0, matchedName: extractedText || '' };
  }

  const cleanInput = normalizeText(extractedText);
  const inputKeywords = extractKeywords(extractedText);

  let bestMatch: Corso | null = null;
  let highestScore = 0;

  for (const course of courses) {
    let score = 0;
    const cleanCourseName = normalizeText(course.name);
    const courseKeywords = extractKeywords(course.name);

    // 1. Direct or substring match
    if (cleanInput === cleanCourseName) {
      score = 1.0;
    } else if (cleanCourseName.includes(cleanInput) || cleanInput.includes(cleanCourseName)) {
      score = 0.9;
    } else {
      // 2. Course Code match (e.g. 28622, 28626)
      if (course.code && cleanInput.includes(course.code.toLowerCase())) {
        score = Math.max(score, 0.95);
      }

      // 3. Keyword overlap score
      if (inputKeywords.length > 0 && courseKeywords.length > 0) {
        let matchedCount = 0;
        for (const ik of inputKeywords) {
          if (courseKeywords.some((ck) => ck === ik || ck.includes(ik) || ik.includes(ck))) {
            matchedCount++;
          } else {
            // Check alias map
            for (const [canonical, aliases] of Object.entries(ALIAS_MAP)) {
              if (aliases.includes(ik) && courseKeywords.some((ck) => aliases.includes(ck) || ck.includes(canonical))) {
                matchedCount += 0.85;
                break;
              }
            }
          }
        }

        const keywordScore = (matchedCount / Math.max(courseKeywords.length, inputKeywords.length)) * 0.85;
        score = Math.max(score, keywordScore);
      }

      // 4. Sub-tag matches (T-A, T-B, 1, 2)
      const inputHasA = /\b(t[\s-]?a|ta|1|i)\b/i.test(extractedText);
      const inputHasB = /\b(t[\s-]?b|tb|2|ii)\b/i.test(extractedText);
      const courseHasA = /\b(t[\s-]?a|ta|1|i)\b/i.test(course.name);
      const courseHasB = /\b(t[\s-]?b|tb|2|ii)\b/i.test(course.name);

      if (inputHasA && courseHasA) score += 0.1;
      if (inputHasB && courseHasB) score += 0.1;
      if ((inputHasA && courseHasB) || (inputHasB && courseHasA)) score -= 0.3; // penalize mismatch between A and B
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = course;
    }
  }

  // Threshold check (minimum 0.35 to consider a real match)
  if (highestScore >= 0.35 && bestMatch) {
    return {
      course: bestMatch,
      score: Math.min(1.0, highestScore),
      matchedName: bestMatch.name,
    };
  }

  return {
    course: null,
    score: highestScore,
    matchedName: extractedText,
  };
};

/**
 * Fuzzy match array of course names
 */
export const findBestMatchingCourseName = (
  extractedText: string,
  courses: Corso[]
): string => {
  const res = matchCourse(extractedText, courses);
  return res.course ? res.course.name : extractedText;
};
