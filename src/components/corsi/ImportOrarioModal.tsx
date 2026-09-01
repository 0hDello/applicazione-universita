import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { runOCR, parseTimetableText, parseBulkFile, type ParsedTimetableSlot } from '../../utils/ocrParser';
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
  const [rawBulkText, setRawBulkText] = useState<string>('');

  // Editable parsed slots
  const [parsedSlots, setParsedSlots] = useState<ParsedTimetableSlot[]>([]);
  const [recurrenceWeeks, setRecurrenceWeeks] = useState<number>(12); // standard semester weeks
  const [importTarget, setImportTarget] = useState<'both' | 'calendar' | 'course'>('both');
  const [importSuccess, setImportSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);
    // Reset previous extraction
    setParsedSlots([]);
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

      const slots = parseTimetableText(text);
      setParsedSlots(slots);
      setIsProcessing(false);
    } catch (err) {
      console.error('OCR Error:', err);
      setIsProcessing(false);
      alert('Errore durante l\'estrazione OCR. Puoi provare a incollare il testo nella scheda Importazione Testo/CSV.');
    }
  };

  const handleParseBulk = () => {
    if (!rawBulkText.trim()) return;
    const slots = parseBulkFile(rawBulkText);
    if (slots.length === 0) {
      // Fallback text parser
      const textSlots = parseTimetableText(rawBulkText);
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
    const newSlot: ParsedTimetableSlot = {
      id: `slot_custom_${Date.now()}`,
      day: 'Lunedì',
      dayIndex: 0,
      startTime: '09:00',
      endTime: '11:00',
      courseName: corsi[0]?.name || 'Nuovo Corso',
      room: 'Aula 1',
    };
    setParsedSlots((prev) => [...prev, newSlot]);
  };

  // Execute import into Calendar & Courses
  const handleConfirmImport = () => {
    if (parsedSlots.length === 0) return;

    const dayOffsets: { [key: string]: number } = {
      Lunedì: 0,
      Martedì: 1,
      Mercoledì: 2,
      Giovedì: 3,
      Venerdì: 4,
      Sabato: 5,
      Domenica: 6,
    };

    // Calculate current week Monday
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const thisMonday = new Date(today);
    thisMonday.setDate(today.getDate() + distanceToMonday);

    parsedSlots.forEach((slot) => {
      const offset = dayOffsets[slot.day] ?? 0;

      for (let week = 0; week < recurrenceWeeks; week++) {
        const lectureDate = new Date(thisMonday);
        lectureDate.setDate(thisMonday.getDate() + offset + week * 7);
        const dateStr = lectureDate.toISOString().split('T')[0];

        // 1. Add to calendar if enabled
        if (importTarget === 'both' || importTarget === 'calendar') {
          addEvento({
            title: `Lezione: ${slot.courseName}`,
            category: 'Lezione',
            date: dateStr,
            time: `${slot.startTime} - ${slot.endTime}`,
            room: slot.room,
            courseName: slot.courseName,
            recurrence: recurrenceWeeks > 1 ? `Settimanale (${week + 1}/${recurrenceWeeks})` : undefined,
          });
        }

        // 2. Add to course registry if course exists and target enabled
        if (importTarget === 'both' || importTarget === 'course') {
          const matchedCourse = corsi.find(
            (c) =>
              c.name.toLowerCase() === slot.courseName.toLowerCase() ||
              slot.courseName.toLowerCase().includes(c.name.toLowerCase())
          );
          if (matchedCourse) {
            addLezioneToCorso(
              matchedCourse.id,
              {
                number: (matchedCourse.lezioni || []).length + 1,
                title: `${slot.courseName} - Lezione ${week + 1}`,
                date: dateStr,
                time: `${slot.startTime} - ${slot.endTime}`,
                room: slot.room,
                topicsCovered: `${slot.courseName} (${slot.day})`,
                status: 'programmata',
                hasNotes: false,
              },
              false // don't duplicate calendar event
            );
          }
        }
      }
    });

    setImportSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* MODAL HEADER */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Importa Orario Lezioni (OCR & Bulk)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Estrai automaticamente le lezioni da uno screenshot dell'orario o carica da file/testo.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-4 px-6 border-b border-slate-100 dark:border-slate-800 text-xs font-bold bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('ocr')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'ocr'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileImage className="w-4 h-4" />
            <span>Screenshot Orario (OCR)</span>
          </button>

          <button
            onClick={() => setActiveTab('bulk')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'bulk'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Importa da CSV / Testo</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
          {importSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Orario importato con successo!
              </h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Le lezioni sono state sincronizzate nel calendario e nei registri dei corsi.
              </p>
            </div>
          ) : (
            <>
              {/* TAB 1: OCR SCREENSHOT */}
              {activeTab === 'ocr' && (
                <div className="flex flex-col gap-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:border-blue-500 transition-all bg-slate-50/50 dark:bg-slate-800/30"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                        {selectedImage ? selectedImage.name : 'Carica screenshot dell\'orario'}
                      </h5>
                      <p className="text-xs text-slate-400 mt-1">
                        Formati supportati: PNG, JPG, JPEG, WebP, Screenshot schermate universitarie
                      </p>
                    </div>
                  </div>

                  {imagePreviewUrl && (
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <img
                          src={imagePreviewUrl}
                          alt="Screenshot Preview"
                          className="w-16 h-16 object-cover rounded-xl border border-slate-300 dark:border-slate-600"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-xs">
                            {selectedImage?.name}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            Pronto per l'estrazione OCR automatica
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handleStartOCR}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Elaborazione...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Avvia OCR & Estrai</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex flex-col gap-2">
                      <div className="flex justify-between text-xs font-bold text-blue-900 dark:text-blue-200">
                        <span>{ocrStatus || 'Elaborazione in corso...'}</span>
                        <span>{ocrProgress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-blue-200 dark:bg-blue-800 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${ocrProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: BULK CSV / TEXT */}
              {activeTab === 'bulk' && (
                <div className="flex flex-col gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Incolla dati orario (CSV, JSON o testo formattato)
                    </label>
                    <textarea
                      rows={5}
                      value={rawBulkText}
                      onChange={(e) => setRawBulkText(e.target.value)}
                      placeholder="Esempio CSV:&#10;Giorno,Orario,Materia,Aula&#10;Lunedì,09:00 - 11:00,Analisi Matematica,Aula 3&#10;Martedì,14:00 - 16:00,Fisica 1,Aula Magna"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={handleParseBulk}
                    className="self-end px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Elabora testo & compila tabella
                  </button>
                </div>
              )}

              {/* EDITABLE CONFIRMATION TABLE */}
              {parsedSlots.length > 0 && (
                <div className="flex flex-col gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Lezioni Rilevate ({parsedSlots.length})
                      </h4>
                      <p className="text-xs text-slate-400">
                        Verifica e correggi i dati prima di salvarli nel tuo orario.
                      </p>
                    </div>

                    <button
                      onClick={handleAddNewSlot}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Aggiungi riga</span>
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    {parsedSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center text-xs"
                      >
                        {/* Day Selector */}
                        <div className="sm:col-span-3">
                          <select
                            value={slot.day}
                            onChange={(e) => handleSlotChange(slot.id, 'day', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200"
                          >
                            {['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'].map(
                              (d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        {/* Times */}
                        <div className="sm:col-span-3 flex items-center gap-1">
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => handleSlotChange(slot.id, 'startTime', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center font-mono"
                          />
                          <span>-</span>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => handleSlotChange(slot.id, 'endTime', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center font-mono"
                          />
                        </div>

                        {/* Course Name */}
                        <div className="sm:col-span-4">
                          <input
                            type="text"
                            value={slot.courseName}
                            onChange={(e) => handleSlotChange(slot.id, 'courseName', e.target.value)}
                            placeholder="Materia / Insegnamento"
                            className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
                          />
                        </div>

                        {/* Room */}
                        <div className="sm:col-span-2 flex items-center gap-1.5">
                          <input
                            type="text"
                            value={slot.room}
                            onChange={(e) => handleSlotChange(slot.id, 'room', e.target.value)}
                            placeholder="Aula"
                            className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                          />
                          <button
                            onClick={() => handleRemoveSlot(slot.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* IMPORT SETTINGS */}
                  <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Ripeti orario per quante settimane del semestre?
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={24}
                        value={recurrenceWeeks}
                        onChange={(e) => setRecurrenceWeeks(parseInt(e.target.value) || 1)}
                        className="w-32 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-blue-600"
                      />
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Genera automaticamente le lezioni settimanali per l'intero semestre.
                      </span>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Destinazione importazione
                      </label>
                      <select
                        value={importTarget}
                        onChange={(e) => setImportTarget(e.target.value as any)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
                      >
                        <option value="both">Calendario + Registro Corsi (Consigliato)</option>
                        <option value="calendar">Solo Calendario</option>
                        <option value="course">Solo Registro Corsi</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* MODAL FOOTER */}
        {!importSuccess && (
          <div className="p-4 sm:px-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
            >
              Annulla
            </button>

            {parsedSlots.length > 0 && (
              <button
                onClick={handleConfirmImport}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Importa {parsedSlots.length} lezioni nell'app</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
