import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  runOCR,
  parseTimetableText,
  parseBulkFile,
  DAYS_LIST,
  type ParsedTimetableSlot,
} from '../../utils/ocrParser';
import {
  Sparkles,
  Upload,
  FileImage,
  FileText,
  Check,
  X,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  RotateCcw,
  Edit3,
} from 'lucide-react';

interface ImportOrarioModalProps {
  onClose: () => void;
}

export const ImportOrarioModal: React.FC<ImportOrarioModalProps> = ({ onClose }) => {
  const { corsi, addEvento, addLezioneToCorso } = useApp();

  const [activeTab, setActiveTab] = useState<'ocr' | 'bulk'>('ocr');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [ocrStatus, setOcrStatus] = useState<string>('');
  const [rawOcrText, setRawOcrText] = useState<string>('');
  const [showRawTextEditor, setShowRawTextEditor] = useState<boolean>(false);
  const [rawBulkText, setRawBulkText] = useState<string>('');

  // Editable parsed slots
  const [parsedSlots, setParsedSlots] = useState<ParsedTimetableSlot[]>([]);
  const [recurrenceWeeks, setRecurrenceWeeks] = useState<number>(12); // standard semester weeks
  const [importTarget, setImportTarget] = useState<'both' | 'calendar' | 'course'>('both');
  const [importSuccess, setImportSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const knownCourseNames = corsi.map((c) => c.name);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);
    // Reset previous extraction
    setParsedSlots([]);
    setRawOcrText('');
    setShowRawTextEditor(false);
  };

  const handleStartOCR = async () => {
    if (!selectedImage) return;
    setIsProcessing(true);
    setOcrProgress(10);
    setOcrStatus('Inizializzazione motore OCR in corso...');

    try {
      const text = await runOCR(selectedImage, (prog, status) => {
        setOcrProgress(prog);
        setOcrStatus(status === 'recognizing text' ? `Riconoscimento testo... ${prog}%` : status);
      });

      setRawOcrText(text);
      const slots = parseTimetableText(text, knownCourseNames);
      setParsedSlots(slots);
      setIsProcessing(false);
    } catch (err) {
      console.error('OCR Error:', err);
      setIsProcessing(false);
      alert('Errore durante l\'estrazione OCR. Puoi inserire o incollare il testo nella scheda Importazione Testo/CSV.');
    }
  };

  const handleReanalyzeOcrText = () => {
    if (!rawOcrText.trim()) return;
    const slots = parseTimetableText(rawOcrText, knownCourseNames);
    setParsedSlots(slots);
  };

  const handleParseBulk = () => {
    if (!rawBulkText.trim()) return;
    const slots = parseBulkFile(rawBulkText, knownCourseNames);
    if (slots.length === 0) {
      const textSlots = parseTimetableText(rawBulkText, knownCourseNames);
      setParsedSlots(textSlots);
    } else {
      setParsedSlots(slots);
    }
  };

  const handleSlotChange = (id: string, field: keyof ParsedTimetableSlot, value: any) => {
    setParsedSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleRemoveSlot = (id: string) => {
    setParsedSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddNewSlot = () => {
    const defaultCourse = corsi[0]?.name || 'Nuovo Corso';
    const newSlot: ParsedTimetableSlot = {
      id: `slot_custom_${Date.now()}`,
      day: 'Lunedì',
      dayIndex: 0,
      startTime: '09:00',
      endTime: '11:00',
      courseName: defaultCourse,
      room: 'Aula 1',
    };
    setParsedSlots((prev) => [...prev, newSlot]);
  };

  // Helper: compute target dates from weekday index
  const getDatesForWeekday = (dayName: string, weeksCount: number): string[] => {
    const dayMap: { [k: string]: number } = {
      lunedì: 1,
      martedì: 2,
      mercoledì: 3,
      giovedì: 4,
      venerdì: 5,
      sabato: 6,
      domenica: 0,
    };

    const targetDayIndex = dayMap[dayName.toLowerCase()] ?? 1;
    const dates: string[] = [];
    const today = new Date();

    // Find next matching weekday
    let current = new Date(today);
    while (current.getDay() !== targetDayIndex) {
      current.setDate(current.getDate() + 1);
    }

    for (let w = 0; w < weeksCount; w++) {
      const d = new Date(current);
      d.setDate(d.getDate() + w * 7);
      dates.push(d.toISOString().split('T')[0]);
    }

    return dates;
  };

  // Commit imported slots to Calendar events and Course lectures
  const handleCommitImport = () => {
    if (parsedSlots.length === 0) return;

    parsedSlots.forEach((slot) => {
      const dates = getDatesForWeekday(slot.day, recurrenceWeeks);

      // Find matching course or use slot courseName
      const matchedCourse = corsi.find(
        (c) => c.name.toLowerCase() === slot.courseName.toLowerCase()
      );

      dates.forEach((dateStr, idx) => {
        // 1. Add to Calendar
        if (importTarget === 'both' || importTarget === 'calendar') {
          addEvento({
            title: slot.courseName,
            category: 'Lezione',
            date: dateStr,
            time: `${slot.startTime} - ${slot.endTime}`,
            room: slot.room || 'Aula da definire',
            courseName: slot.courseName,
            notes: slot.professor ? `Docente: ${slot.professor}` : '',
          });
        }

        // 2. Add to Course Lectures Register
        if ((importTarget === 'both' || importTarget === 'course') && matchedCourse) {
          addLezioneToCorso(matchedCourse.id, {
            number: (matchedCourse.lezioni?.length || 0) + idx + 1,
            title: `Lezione ${slot.courseName} (${slot.day})`,
            date: dateStr,
            time: `${slot.startTime} - ${slot.endTime}`,
            room: slot.room || 'Aula da definire',
            topicsCovered: '',
            status: 'programmata',
            attendance: 'non_registrata',
            hasNotes: false,
          });
        }
      });
    });

    setImportSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#0d0d0f] rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Importa Orario delle Lezioni (OCR & Bulk)
              </h3>
              <p className="text-xs text-slate-400">
                Carica uno screenshot dell'orario universitario per estrarre e pianificare automaticamente le lezioni.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4 flex gap-2 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#0d0d0f] shrink-0">
          <button
            onClick={() => setActiveTab('ocr')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'ocr'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <FileImage className="w-4 h-4" />
            <span>Da Screenshot (OCR Intelligente)</span>
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'bulk'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Importazione Testo / CSV / JSON</span>
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
                Orario importato con successo!
              </h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Tutte le lezioni sono state inserite nel calendario e associate ai tuoi corsi per le prossime {recurrenceWeeks} settimane.
              </p>
            </div>
          ) : (
            <>
              {/* TAB 1: OCR SCREENSHOT */}
              {activeTab === 'ocr' && (
                <div className="flex flex-col gap-4">
                  {/* Upload Box */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-3 cursor-pointer bg-slate-50/50 dark:bg-zinc-950/40 transition-colors"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {selectedImage ? selectedImage.name : 'Seleziona o trascina lo screenshot dell\'orario'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Supporta PNG, JPG, JPEG. Algoritmo ottimizzato per orari universitari italiani.
                      </p>
                    </div>
                  </div>

                  {/* Image Preview & Actions */}
                  {imagePreviewUrl && (
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={imagePreviewUrl}
                          alt="Preview orario"
                          className="w-16 h-16 object-cover rounded-xl border border-slate-200 dark:border-zinc-700"
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            Screenshot caricato
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {selectedImage ? `${(selectedImage.size / 1024).toFixed(1)} KB` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {rawOcrText && (
                          <button
                            type="button"
                            onClick={() => setShowRawTextEditor((prev) => !prev)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{showRawTextEditor ? 'Nascondi Testo OCR' : 'Visualizza / Correggi Testo OCR'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={handleStartOCR}
                          disabled={isProcessing}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50 transition-all cursor-pointer"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>{ocrStatus || 'Elaborazione in corso...'}</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              <span>{parsedSlots.length > 0 ? 'Riesegui OCR' : 'Estrai Lezioni con OCR'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Progress bar during OCR */}
                  {isProcessing && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[11px] font-bold text-slate-500">
                        <span>{ocrStatus}</span>
                        <span>{ocrProgress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                          style={{ width: `${ocrProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* RAW OCR TEXT EDITABLE AREA */}
                  {showRawTextEditor && rawOcrText && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-800 dark:text-zinc-200">
                          Testo Riconosciuto da OCR (Modificabile)
                        </label>
                        <button
                          type="button"
                          onClick={handleReanalyzeOcrText}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-600 text-white text-[11px] font-bold shadow-xs hover:bg-blue-700"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>⚡ Rianalizza Testo Modificato</span>
                        </button>
                      </div>
                      <textarea
                        rows={5}
                        value={rawOcrText}
                        onChange={(e) => setRawOcrText(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white font-mono text-[11px] focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: BULK CSV / TEXT */}
              {activeTab === 'bulk' && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="font-bold text-slate-900 dark:text-white block mb-1">
                      Incolla tabella orario (CSV, TSV o JSON)
                    </label>
                    <p className="text-[11px] text-slate-400 mb-2">
                      Formato CSV supportato: <code className="bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono">Giorno, Orario, Materia, Aula</code>
                    </p>
                    <textarea
                      rows={6}
                      value={rawBulkText}
                      onChange={(e) => setRawBulkText(e.target.value)}
                      placeholder="Lunedì, 09:00 - 11:00, Analisi Matematica 1, Aula Magna&#10;Martedì, 11:00 - 13:00, Fisica Generale, Lab 2&#10;Mercoledì, 14:00 - 16:00, Informatica, Aula 4B"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() =>
                        setRawBulkText(
                          "Lunedì, 09:00 - 11:00, Ingegneria del Software, Aula A1\nMartedì, 11:00 - 13:00, Fisica Generale, Aula 3B\nMercoledì, 14:00 - 16:30, Analisi Matematica 1, Aula Magna\nGiovedì, 09:00 - 11:00, Basi di Dati, Lab 2\nVenerdì, 11:00 - 13:00, Algoritmi e Strutture Dati, Aula 4"
                        )
                      }
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      Carica esempio di orario tipo
                    </button>

                    <button
                      type="button"
                      onClick={handleParseBulk}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
                    >
                      Analizza Tabella
                    </button>
                  </div>
                </div>
              )}

              {/* RECOGNIZED SLOTS INTERACTIVE TABLE */}
              {parsedSlots.length > 0 && (
                <div className="flex flex-col gap-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Slot Riconosciuti ({parsedSlots.length}) — Verifica e Modifica
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddNewSlot}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 font-bold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Aggiungi slot</span>
                    </button>
                  </div>

                  {/* Editable slots list */}
                  <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {parsedSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-3 rounded-2xl bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 flex items-center gap-3 flex-wrap sm:flex-nowrap"
                      >
                        {/* Day Selector */}
                        <div className="w-28 shrink-0">
                          <label className="text-[9px] font-bold text-slate-400 block uppercase">Giorno</label>
                          <select
                            value={slot.day}
                            onChange={(e) => handleSlotChange(slot.id, 'day', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white font-bold"
                          >
                            {DAYS_LIST.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Times */}
                        <div className="flex items-center gap-1 shrink-0">
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 block uppercase">Inizio</label>
                            <input
                              type="text"
                              value={slot.startTime}
                              onChange={(e) => handleSlotChange(slot.id, 'startTime', e.target.value)}
                              className="w-16 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-700 text-center font-mono font-bold text-slate-900 dark:text-white"
                            />
                          </div>
                          <span className="text-slate-400 mt-3">-</span>
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 block uppercase">Fine</label>
                            <input
                              type="text"
                              value={slot.endTime}
                              onChange={(e) => handleSlotChange(slot.id, 'endTime', e.target.value)}
                              className="w-16 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-700 text-center font-mono font-bold text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>

                        {/* Course Name with Course Preset Dropdown or Input */}
                        <div className="flex-1 min-w-[140px]">
                          <label className="text-[9px] font-bold text-slate-400 block uppercase">Materia / Corso</label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={slot.courseName}
                              onChange={(e) => handleSlotChange(slot.id, 'courseName', e.target.value)}
                              placeholder="Nome corso..."
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white font-bold"
                            />
                            {corsi.length > 0 && (
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleSlotChange(slot.id, 'courseName', e.target.value);
                                  }
                                }}
                                className="w-8 px-1 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 font-bold"
                                title="Seleziona corso esistente"
                              >
                                <option value="">▼</option>
                                {corsi.map((c) => (
                                  <option key={c.id} value={c.name}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>

                        {/* Room */}
                        <div className="w-28 shrink-0">
                          <label className="text-[9px] font-bold text-slate-400 block uppercase">Aula</label>
                          <input
                            type="text"
                            value={slot.room}
                            onChange={(e) => handleSlotChange(slot.id, 'room', e.target.value)}
                            placeholder="Aula..."
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white"
                          />
                        </div>

                        {/* Remove Slot */}
                        <div className="pt-3 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(slot.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Rimuovi slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Import Configuration Panel */}
                  <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div>
                        <label className="font-bold text-slate-900 dark:text-white block mb-1">
                          Settimane di ripetizione
                        </label>
                        <select
                          value={recurrenceWeeks}
                          onChange={(e) => setRecurrenceWeeks(parseInt(e.target.value))}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 font-bold text-slate-900 dark:text-white"
                        >
                          <option value="1">1 sola settimana (solo prossima)</option>
                          <option value="6">6 settimane</option>
                          <option value="12">12 settimane (1 Semestre standard)</option>
                          <option value="16">16 settimane</option>
                          <option value="24">24 settimane (Anno accademico)</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-900 dark:text-white block mb-1">
                          Destinazione importazione
                        </label>
                        <select
                          value={importTarget}
                          onChange={(e) => setImportTarget(e.target.value as any)}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 font-bold text-slate-900 dark:text-white"
                        >
                          <option value="both">📅 Calendario + 📚 Registro Corsi</option>
                          <option value="calendar">Solo 📅 Calendario</option>
                          <option value="course">Solo 📚 Registro Corsi</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCommitImport}
                      className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white font-extrabold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Conferma e Importa nell'App</span>
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
