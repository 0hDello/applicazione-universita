export interface UniversityOption {
  name: string;
  city?: string;
  type?: 'Statale' | 'Politecnico' | 'Privata' | 'Scuola Superiore' | 'Telematica';
}

export interface DegreeCourseCategory {
  category: string;
  courses: string[];
}

export const UNIVERSITA_ITALIANE: string[] = [
  'Politecnico di Milano (PoliMi)',
  'Politecnico di Torino (PoliTo)',
  'Politecnico di Bari (PoliBa)',
  'Sapienza Università di Roma',
  'Università di Bologna (UniBo)',
  'Università degli Studi di Padova (UniPd)',
  'Università degli Studi di Napoli Federico II',
  'Università degli Studi di Milano (UniMi - Statale)',
  'Università degli Studi di Milano-Bicocca (UniMib)',
  'Università degli Studi di Torino (UniTo)',
  'Università di Pisa (UniPi)',
  'Università degli Studi di Firenze (UniFi)',
  'Università degli Studi di Genova (UniGe)',
  'Università di Trento (UniTn)',
  'Università degli Studi di Verona (UniVr)',
  'Università degli Studi di Pavia (UniPv)',
  'Università degli Studi di Palermo (UniPa)',
  'Università degli Studi di Catania (UniCt)',
  'Università degli Studi di Bari Aldo Moro (UniBa)',
  'Università degli Studi di Parma (UniPr)',
  'Università degli Studi di Modena e Reggio Emilia (UniMoRe)',
  'Università degli Studi di Perugia (UniPg)',
  'Università degli Studi di Salerno (UniSa)',
  'Università della Calabria (UniCal)',
  'Università degli Studi di Cagliari (UniCa)',
  'Università degli Studi di Sassari (UniSs)',
  'Università degli Studi di Messina (UniMe)',
  'Università del Salento (UniSalento)',
  "Università Ca' Foscari Venezia",
  'Università IUAV di Venezia',
  'Università di Siena (UniSi)',
  'Università degli Studi di Trieste (UniTs)',
  'Università degli Studi di Udine (UniUd)',
  'Università degli Studi di Brescia (UniBs)',
  'Università degli Studi di Bergamo (UniBg)',
  'Università Politecnica delle Marche (UNIVPM)',
  "Università degli Studi dell'Aquila (UniVaq)",
  'Università degli Studi "G. d\'Annunzio" Chieti-Pescara',
  'Università degli Studi della Basilicata (UniBas)',
  'Università degli Studi della Campania Luigi Vanvitelli',
  'Università degli Studi di Napoli Parthenope',
  "Università degli Studi di Napoli L'Orientale",
  'Università degli Studi Roma Tre',
  'Università degli Studi di Roma Tor Vergata',
  'Università degli Studi di Roma "Foro Italico"',
  'Università Commerciale Luigi Bocconi',
  'Università Cattolica del Sacro Cuore (UCSC)',
  'LUISS Guido Carli',
  'IULM - Libera Università di Lingue e Comunicazione',
  'Università Vita-Salute San Raffaele',
  'Libera Università di Bolzano (Unibz)',
  'Scuola Normale Superiore di Pisa',
  'Scuola Superiore Sant\'Anna di Pisa',
  'Scuola IMT Alti Studi Lucca',
  'SISSA - Scuola Internazionale Superiore di Studi Avanzati',
  'Università Campus Bio-Medico di Roma',
  'Università LUMSA',
  'Università Telematica Pegaso',
  'Università Telematica Mercatorum',
  'Università Telematica Internazionale UniNettuno',
  'Università Telematica eCampus',
  'Università Telematica Unitelma Sapienza',
  'Altra università / Istituto'
];

export const CORSI_DI_STUDIO_CATEGORIE: DegreeCourseCategory[] = [
  {
    category: 'Ingegneria & Tecnologia',
    courses: [
      'Ingegneria Informatica',
      'Ingegneria Gestionale',
      'Ingegneria Meccanica',
      'Ingegneria Elettronica',
      'Ingegneria Civile',
      'Ingegneria Biomedica',
      'Ingegneria Aerospaziale',
      'Ingegneria Chimica e dei Materiali',
      'Ingegneria per l\'Ambiente e il Territorio',
      'Ingegneria dell\'Automazione e Robotica',
      'Ingegneria Energetica e Nucleare',
      'Ingegneria delle Telecomunicazioni',
      'Ingegneria Navale',
      'Ingegneria Edile-Architettura',
      'Ingegneria della Sicurezza'
    ]
  },
  {
    category: 'Scienze Matematiche, Fisiche e Naturali',
    courses: [
      'Informatica / Computer Science',
      'Intelligenza Artificiale & Data Science',
      'Cybersecurity & Sicurezza Informatica',
      'Matematica',
      'Fisica',
      'Astrofisica e Scienze dello Spazio',
      'Chimica',
      'Scienze Biologiche / Biologia',
      'Biotecnologie',
      'Scienze Naturali e Ambientali',
      'Scienze Geologiche e del Territorio',
      'Statistica e Big Data Analytics'
    ]
  },
  {
    category: 'Medicina & Professioni Sanitarie',
    courses: [
      'Medicina e Chirurgia (Ciclo Unico)',
      'Odontoiatria e Protesi Dentaria',
      'Infermieristica',
      'Fisioterapia',
      'Farmacia e CTF (Chimica e Tecnologia Farmaceutiche)',
      'Ostetricia',
      'Scienze Motorie, Sport e Salute',
      'Dietistica e Nutrizione Umana',
      'Tecniche di Radiologia Medica',
      'Logopedia',
      'Igiene Dentale',
      'Medicina Veterinaria'
    ]
  },
  {
    category: 'Economia, Finanza & Management',
    courses: [
      'Economia e Management',
      'Economia e Commercio',
      'Economia Aziendale',
      'Finanza, Banche e Mercati',
      'Marketing e Comunicazione d\'Impresa',
      'Management Internazionale / Business Administration',
      'Accounting e Consulenza Professionale',
      'Economia del Turismo e degli Eventi',
      'Economia e Politiche Pubbliche'
    ]
  },
  {
    category: 'Giurisprudenza & Scienze Politiche',
    courses: [
      'Giurisprudenza (Ciclo Unico)',
      'Scienze dei Servizi Giuridici',
      'Scienze Politiche e Relazioni Internazionali',
      'Studi Europei e Global Studies',
      'Scienze dell\'Amministrazione e delle Organizzazioni',
      'Cooperazione Internazionale e Diritti Umani',
      'Consulenza del Lavoro e Relazioni Sindacali'
    ]
  },
  {
    category: 'Umanistiche, Lettere & Filosofia',
    courses: [
      'Lettere Classiche e Moderne',
      'Filosofia',
      'Storia e Culture Contemporanee',
      'Beni Culturali, Archeologia e Storia dell\'Arte',
      'DAMS (Discipline delle Arti, della Musica e dello Spettacolo)',
      'Archivistica e Biblioteconomia',
      'Geografia e Processi Territoriali'
    ]
  },
  {
    category: 'Lingue, Comunicazione & Media',
    courses: [
      'Lingue e Letterature Straniere',
      'Mediazione Linguistica e Interculturale',
      'Scienze della Comunicazione',
      'Comunicazione Digitale e Nuovi Media',
      'Editoria, Giornalismo e Scrittura Creativa',
      'Traduzione e Interpretariato'
    ]
  },
  {
    category: 'Psicologia, Sociologia & Formazione',
    courses: [
      'Psicologia e Neuroscienze',
      'Scienze dell\'Educazione e della Formazione',
      'Scienze della Formazione Primaria',
      'Sociologia e Ricerca Sociale',
      'Servizio Sociale (Assistente Sociale)',
      'Pedagogia e Progettazione Educativa'
    ]
  },
  {
    category: 'Architettura, Design & Arti Visive',
    courses: [
      'Architettura (Ciclo Unico)',
      'Design del Prodotto e Industriale',
      'Design della Comunicazione e Grafica',
      'Design degli Interni e Spazi',
      'Fashion Design e Moda',
      'Pianificazione Urbanistica e Paesaggio',
      'Belle Arti, Scenografia e Nuove Tecnologie dell\'Arte'
    ]
  },
  {
    category: 'Agraria, Alimentare & Veterinaria',
    courses: [
      'Scienze e Tecnologie Agrarie',
      'Scienze e Tecnologie Alimentari (Food Science)',
      'Scienze Gastronomiche e Cultura del Cibo',
      'Scienze Forestali e Ambientali',
      'Viticoltura ed Enologia'
    ]
  }
];

export const CORSI_DI_STUDIO_FLAT: string[] = [
  ...CORSI_DI_STUDIO_CATEGORIE.flatMap(c => c.courses),
  'Altro corso di studi / Personalizzato'
];

export const ANNI_ACCADEMICI: string[] = [
  '2023/2024',
  '2024/2025',
  '2025/2026',
  '2026/2027',
  '2027/2028',
  '2028/2029',
  '2029/2030'
];

export const ANNI_DI_CORSO: string[] = [
  '1° anno (Triennale)',
  '2° anno (Triennale)',
  '3° anno (Triennale)',
  '1° anno (Magistrale)',
  '2° anno (Magistrale)',
  '1° anno (Ciclo Unico)',
  '2° anno (Ciclo Unico)',
  '3° anno (Ciclo Unico)',
  '4° anno (Ciclo Unico)',
  '5° anno (Ciclo Unico)',
  '6° anno (Ciclo Unico)',
  'Fuori corso (1° anno)',
  'Fuori corso (2° anno e oltre)',
  'Master Universitario',
  'Dottorato di Ricerca (PhD)'
];

export interface TimeSlotOption {
  label: string;
  start: string;
  end: string;
  tag?: string;
}

export const FASCE_ORARIE_UNIVERSITA: TimeSlotOption[] = [
  { label: '08:30 - 10:30', start: '08:30', end: '10:30', tag: 'Mattina' },
  { label: '09:00 - 11:00', start: '09:00', end: '11:00', tag: 'Mattina' },
  { label: '10:30 - 12:30', start: '10:30', end: '12:30', tag: 'Mattina' },
  { label: '11:00 - 13:00', start: '11:00', end: '13:00', tag: 'Mattina' },
  { label: '11:30 - 13:30', start: '11:30', end: '13:30', tag: 'Mattina' },
  { label: '13:30 - 15:30', start: '13:30', end: '15:30', tag: 'Pomeriggio' },
  { label: '14:00 - 16:00', start: '14:00', end: '16:00', tag: 'Pomeriggio' },
  { label: '14:30 - 16:30', start: '14:30', end: '16:30', tag: 'Pomeriggio' },
  { label: '15:30 - 17:30', start: '15:30', end: '17:30', tag: 'Pomeriggio' },
  { label: '16:00 - 18:00', start: '16:00', end: '18:00', tag: 'Pomeriggio' },
  { label: '16:30 - 18:30', start: '16:30', end: '18:30', tag: 'Pomeriggio' },
  { label: '17:00 - 19:00', start: '17:00', end: '19:00', tag: 'Sera' },
  { label: '09:00 - 12:00', start: '09:00', end: '12:00', tag: '3 Ore' },
  { label: '14:00 - 17:00', start: '14:00', end: '17:00', tag: '3 Ore' },
  { label: '15:00 - 18:00', start: '15:00', end: '18:00', tag: '3 Ore' },
];
