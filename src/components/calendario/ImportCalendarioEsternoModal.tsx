import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  parseIcsContent,
  parseCsvContent,
  type ExternalCalendarEvent,
} from '../../utils/calendarImporter';
import type { EventCategory } from '../../types';
import {
  Calendar as CalendarIcon,
  Upload,
  Globe,
  FileSpreadsheet,
  Check,
  X,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface ImportCalendarioEsternoModalProps {
  onClose: () => void;
}

export const ImportCalendarioEsternoModal: React.FC<ImportCalendarioEsternoModalProps> = ({ onClose }) => {
  const { corsi, addEvento } = useApp();

  const [activeTab, setActiveTab] = useState<'ics' | 'url' | 'notion'>('ics');
  const [importedEvents, setImportedEvents] = useState<ExternalCalendarEvent[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [icalUrl, setIcalUrl] = useState<string>('');
  const [isLoadingUrl, setIsLoadingUrl] = useState<boolean>(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [notionCsvText, setNotionCsvText] = useState<string>('');
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const knownCourses = corsi.map((c) => c.name);

  // Handle ICS file upload
  const handleIcsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const events = parseIcsContent(text, knownCourses);
        setImportedEvents(events);
      }
    };
    reader.readAsText(file);
  };

  // Handle URL fetch (or fallback instructions)
  const handleFetchIcalUrl = async () => {
    if (!icalUrl.trim()) return;
    setIsLoadingUrl(true);
    setUrlError(null);

    let cleanUrl = icalUrl.trim().replace(/^webcal:\/\//, 'https://');
    try {
      const response = await fetch(cleanUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      const events = parseIcsContent(text, knownCourses);
      if (events.length === 0) {
        setUrlError('Nessun evento trovato nel feed fornito.');
      } else {
        setImportedEvents(events);
      }
    } catch (err) {
      console.warn('Direct fetch failed due to CORS:', err);
      setUrlError(
        'Impossibile scaricare direttamente dal browser per via delle restrizioni CORS del provider. Scarica il file .ics dal tuo calendario e caricalo nella scheda "File .ICS".'
      );
    } finally {
      setIsLoadingUrl(false);
    }
  };

  // Handle CSV file upload
  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setNotionCsvText(text);
        const events = parseCsvContent(text, knownCourses);
        setImportedEvents(events);
      }
    };
    reader.readAsText(file);
  };

  const handleParseCsvText = () => {
    if (!notionCsvText.trim()) return;
    const events = parseCsvContent(notionCsvText, knownCourses);
    setImportedEvents(events);
  };

  // Toggle selection
  const handleToggleSelectAll = (select: boolean) => {
    setImportedEvents((prev) => prev.map((ev) => ({ ...ev, selected: select })));
  };

  const handleToggleEvent = (id: string) => {
    setImportedEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, selected: !ev.selected } : ev))
    );
  };

  const handleEventChange = (id: string, field: keyof ExternalCalendarEvent, value: any) => {
    setImportedEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, [field]: value } : ev))
    );
  };

  const handleRemoveEvent = (id: string) => {
    setImportedEvents((prev) => prev.filter((ev) => ev.id !== id));
  };

  // Commit selected events to AppContext
  const handleCommitImport = () => {
    const toImport = importedEvents.filter((ev) => ev.selected);
    if (toImport.length === 0) return;

    toImport.forEach((ev) => {
      addEvento({
        title: ev.title,
        category: ev.category,
        date: ev.date,
        time: ev.time,
        room: ev.room || 'Aula da definire',
        courseName: ev.courseName || (ev.category === 'Lezione' ? corsi[0]?.name : undefined),
        notes: ev.notes || '',
      });
    });

    setImportSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const selectedCount = importedEvents.filter((e) => e.selected).length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#0d0d0f] rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Importa da Calendario Esterno
              </h3>
              <p className="text-xs text-slate-400">
                Sincronizza e carica eventi da Google Calendar, Notion, Apple Calendar e file iCal (.ics).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTutorial(!showTutorial)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-blue-500" />
              <span>{showTutorial ? 'Nascondi Guida' : 'Come esportare?'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tutorial Banner (Expandable) */}
        {showTutorial && (
          <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/40 text-xs text-slate-700 dark:text-zinc-300 flex flex-col gap-2.5">
            <h5 className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Come esportare da Notion e Google Calendar</span>
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-blue-100 dark:border-zinc-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">📅 Google Calendar</span>
                <p>1. Apri Google Calendar sul PC e clicca l'ingranaggio ⚙️ <em>Impostazioni</em>.</p>
                <p>2. Clicca <strong>Importazione ed esportazione</strong> nella colonna sinistra.</p>
                <p>3. Clicca <strong>Esporta</strong> per scaricare l'archivio contenente i file <code>.ics</code>.</p>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-blue-100 dark:border-zinc-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">📝 Notion Calendar / Database</span>
                <p>1. Apri il database o calendario delle lezioni in Notion.</p>
                <p>2. Clicca i tre puntini <strong>...</strong> in alto a destra.</p>
                <p>3. Clicca <strong>Export</strong> e seleziona formato <strong>CSV</strong> (o Markdown & CSV).</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-6 pt-4 flex gap-2 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#0d0d0f] shrink-0">
          <button
            onClick={() => setActiveTab('ics')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'ics'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>File iCal (.ics)</span>
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'url'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Link URL iCal</span>
          </button>
          <button
            onClick={() => setActiveTab('notion')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'notion'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Notion / CSV</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 text-xs">
          {importSuccess ? (
            <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Eventi importati con successo!
              </h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Gli eventi selezionati sono stati aggiunti al tuo calendario e organizzati per data e orario.
              </p>
            </div>
          ) : (
            <>
              {/* TAB 1: FILE ICS */}
              {activeTab === 'ics' && (
                <div className="flex flex-col gap-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-3 cursor-pointer bg-slate-50/50 dark:bg-zinc-950/40 transition-colors"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleIcsFileChange}
                      accept=".ics,text/calendar"
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {selectedFile ? selectedFile.name : 'Seleziona o trascina il file .ics'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Compatibile con Google Calendar, Apple iCal, Outlook e calendari universitari.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: URL ICAL */}
              {activeTab === 'url' && (
                <div className="flex flex-col gap-3">
                  <label className="font-bold text-slate-900 dark:text-white">
                    Incolla l'indirizzo privato o pubblico iCal (URL / Webcal)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={icalUrl}
                      onChange={(e) => setIcalUrl(e.target.value)}
                      placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-xs font-mono focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleFetchIcalUrl}
                      disabled={isLoadingUrl || !icalUrl.trim()}
                      className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0"
                    >
                      {isLoadingUrl ? 'Caricamento...' : 'Scarica Eventi'}
                    </button>
                  </div>
                  {urlError && (
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                      <span>{urlError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: NOTION / CSV */}
              {activeTab === 'notion' && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-900 dark:text-white">
                      Incolla o carica l'export CSV da Notion
                    </label>
                    <button
                      type="button"
                      onClick={() => csvFileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 font-bold text-slate-700 dark:text-zinc-300"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Carica file CSV</span>
                    </button>
                    <input
                      type="file"
                      ref={csvFileInputRef}
                      onChange={handleCsvFileChange}
                      accept=".csv,text/csv"
                      className="hidden"
                    />
                  </div>

                  <textarea
                    rows={5}
                    value={notionCsvText}
                    onChange={(e) => setNotionCsvText(e.target.value)}
                    placeholder="Titolo, Data, Orario, Corso, Aula&#10;Lezione Meccanica, 2026-03-15, 09:00 - 11:00, Meccanica Applicata, Aula Magna&#10;Esame Analisi 1, 2026-06-10, 10:00 - 13:00, Analisi Matematica 1, Aula 2B"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none"
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleParseCsvText}
                      className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                    >
                      Elabora CSV Notion
                    </button>
                  </div>
                </div>
              )}

              {/* PREVIEW & MAPPING TABLE */}
              {importedEvents.length > 0 && (
                <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Eventi Rilevati ({importedEvents.length})
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-[10px]">
                        {selectedCount} selezionati
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => handleToggleSelectAll(true)}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Seleziona tutti
                      </button>
                      <span className="text-slate-300 dark:text-zinc-700">|</span>
                      <button
                        type="button"
                        onClick={() => handleToggleSelectAll(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                      >
                        Deseleziona tutti
                      </button>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="max-h-72 overflow-y-auto flex flex-col gap-2 pr-1">
                    {importedEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className={`p-3 rounded-2xl border transition-all flex items-center gap-3 flex-wrap sm:flex-nowrap ${
                          ev.selected
                            ? 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-xs'
                            : 'bg-slate-50/60 dark:bg-zinc-950/40 border-slate-100 dark:border-zinc-900 opacity-60'
                        }`}
                      >
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={ev.selected}
                          onChange={() => handleToggleEvent(ev.id)}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer shrink-0"
                        />

                        {/* Title */}
                        <div className="flex-1 min-w-[140px]">
                          <input
                            type="text"
                            value={ev.title}
                            onChange={(e) => handleEventChange(ev.id, 'title', e.target.value)}
                            className="w-full px-2 py-1 rounded-lg bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-700 font-bold text-slate-900 dark:text-white"
                          />
                        </div>

                        {/* Category */}
                        <div className="w-28 shrink-0">
                          <select
                            value={ev.category}
                            onChange={(e) => handleEventChange(ev.id, 'category', e.target.value as EventCategory)}
                            className="w-full px-2 py-1 rounded-lg bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-700 font-bold text-slate-900 dark:text-white text-[11px]"
                          >
                            <option value="Lezione">Lezione</option>
                            <option value="Esame">Esame</option>
                            <option value="Scadenza">Scadenza</option>
                            <option value="Studio">Studio</option>
                          </select>
                        </div>

                        {/* Date & Time */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <input
                            type="date"
                            value={ev.date}
                            onChange={(e) => handleEventChange(ev.id, 'date', e.target.value)}
                            className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white font-mono text-[11px]"
                          />
                          <input
                            type="text"
                            value={ev.time}
                            onChange={(e) => handleEventChange(ev.id, 'time', e.target.value)}
                            className="w-24 px-2 py-1 rounded-lg bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white font-mono text-[11px] text-center"
                          />
                        </div>

                        {/* Course mapping */}
                        <div className="w-36 shrink-0">
                          <select
                            value={ev.courseName || ''}
                            onChange={(e) => handleEventChange(ev.id, 'courseName', e.target.value || undefined)}
                            className="w-full px-2 py-1 rounded-lg bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-[11px]"
                          >
                            <option value="">Nessun corso</option>
                            {corsi.map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Delete row */}
                        <button
                          type="button"
                          onClick={() => handleRemoveEvent(ev.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0"
                          title="Rimuovi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Actions bar */}
                  <div className="pt-3 flex items-center justify-between flex-wrap gap-3">
                    <p className="text-slate-400 text-[11px]">
                      Verranno inseriti <strong>{selectedCount}</strong> eventi nel calendario con sincronizzazione automatica.
                    </p>
                    <button
                      type="button"
                      onClick={handleCommitImport}
                      disabled={selectedCount === 0}
                      className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Importa {selectedCount} Eventi nel Calendario</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
