import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Corso, Risorsa } from '../../types';
import { AttendanceCalculator } from './AttendanceCalculator';
import { LezioniRecuperoSection } from './LezioniRecuperoSection';
import { CorsoVisualCustomizer } from './CorsoVisualCustomizer';
import { ResourceViewerModal } from '../risorse/ResourceViewerModal';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  CheckCircle2,
  FileText,
  Plus,
  Trash2,
  Edit3,
  FolderOpen,
  Award,
  AlertTriangle,
  Palette,
  Eye,
} from 'lucide-react';
import { TimeSlotPicker } from '../common/TimeSlotPicker';

interface CorsoDetailModalProps {
  course: Corso;
  onClose: () => void;
}

export const CorsoDetailModal: React.FC<CorsoDetailModalProps> = ({ course, onClose }) => {
  const {
    updateCorso,
    deleteCorso,
    addTopicToCorso,
    deleteTopicFromCorso,
    toggleCourseTopic,
    addLezioneToCorso,
    updateLezione,
    deleteLezione,
    risorse,
    addRisorsa,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'lezioni' | 'presenze' | 'recupero' | 'programma' | 'risorse' | 'info'>('lezioni');
  const [isCustomizingVisual, setIsCustomizingVisual] = useState<boolean>(false);
  const [viewingResource, setViewingResource] = useState<Risorsa | null>(null);

  // Initial time parsing
  const initialTimeParts = (course.orarioAbituale || '09:00 - 11:00').split('-').map((s) => s.trim());
  const defaultStart = initialTimeParts[0]?.includes(':') ? initialTimeParts[0] : '09:00';
  const defaultEnd = initialTimeParts[1]?.includes(':') ? initialTimeParts[1] : '11:00';

  // New Lecture Form State
  const [isAddingLezione, setIsAddingLezione] = useState(false);
  const [newLezioneTitle, setNewLezioneTitle] = useState('');
  const [newLezioneDate, setNewLezioneDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState(defaultStart);
  const [newEndTime, setNewEndTime] = useState(defaultEnd);
  const [newLezioneRoom, setNewLezioneRoom] = useState(course.aulaAbituale || '');
  const [newLezioneTopics, setNewLezioneTopics] = useState('');
  const [newLezioneNotes, setNewLezioneNotes] = useState('');
  const [newLezioneAttendance, setNewLezioneAttendance] = useState<'presente' | 'assente' | 'non_registrata'>('presente');
  const [newLezioneHasNotes, setNewLezioneHasNotes] = useState(true);

  // New Topic Form State
  const [newTopicName, setNewTopicName] = useState('');

  // Edit Course Info State
  const [editName, setEditName] = useState(course.name);
  const [editCode, setEditCode] = useState(course.code);
  const [editProf, setEditProf] = useState(course.professor);
  const [editCFU, setEditCFU] = useState(String(course.cfu));
  const [editSemestre, setEditSemestre] = useState(course.semestre || '1° Semestre');
  const [editAula, setEditAula] = useState(course.aulaAbituale || '');
  const [editStartTime, setEditStartTime] = useState(defaultStart);
  const [editEndTime, setEditEndTime] = useState(defaultEnd);
  const [editLink, setEditLink] = useState(course.linkAulaVirtuale || '');
  const [editNote, setEditNote] = useState(course.noteCorso || '');

  // Quick Resource Attachment
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [newResTitle, setNewResTitle] = useState('');
  const [newResType, setNewResType] = useState<'PDF' | 'Slide' | 'Link' | 'Video' | 'Registrazione' | 'Formulario' | 'Esercizio'>('PDF');
  const [newResUrl, setNewResUrl] = useState('');

  // Note editing state for existing lectures
  const [editingNotesLezId, setEditingNotesLezId] = useState<string | null>(null);
  const [tempNotesText, setTempNotesText] = useState<string>('');
  const [notesFilter, setNotesFilter] = useState<'tutte' | 'con_appunti' | 'senza_appunti'>('tutte');

  const lezioni = course.lezioni || [];
  const courseResources = risorse.filter((r) => r.courseName === course.name);

  const svolteCount = lezioni.filter((l) => l.status === 'svolta' || l.attendance === 'presente').length;
  const recuperareCount = lezioni.filter(
    (l) => (l.status === 'da_recuperare' || l.attendance === 'assente') && !l.recovered
  ).length;
  const notesCount = lezioni.filter((l) => l.hasNotes).length;

  const filteredLezioni = lezioni.filter((l) => {
    if (notesFilter === 'con_appunti') return l.hasNotes;
    if (notesFilter === 'senza_appunti') return !l.hasNotes;
    return true;
  });

  const handleSaveCourseInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateCorso(course.id, {
      name: editName.trim(),
      code: editCode.trim(),
      professor: editProf.trim(),
      cfu: parseInt(editCFU) || course.cfu,
      semestre: editSemestre,
      aulaAbituale: editAula.trim(),
      orarioAbituale: `${editStartTime} - ${editEndTime}`,
      linkAulaVirtuale: editLink.trim(),
      noteCorso: editNote.trim(),
    });
  };

  const handleAddLezione = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLezioneTitle.trim()) return;

    addLezioneToCorso(course.id, {
      number: lezioni.length + 1,
      title: newLezioneTitle.trim(),
      date: newLezioneDate,
      time: `${newStartTime} - ${newEndTime}`,
      room: newLezioneRoom.trim(),
      topicsCovered: newLezioneTopics.trim() || newLezioneTitle.trim(),
      notes: newLezioneNotes.trim(),
      status: newLezioneAttendance === 'assente' ? 'da_recuperare' : 'svolta',
      attendance: newLezioneAttendance,
      hasNotes: newLezioneHasNotes,
      topicCompleted: newLezioneAttendance === 'presente',
    });

    setIsAddingLezione(false);
    setNewLezioneTitle('');
    setNewLezioneTopics('');
    setNewLezioneNotes('');
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    addTopicToCorso(course.id, newTopicName.trim());
    setNewTopicName('');
  };

  const handleAttachResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResTitle.trim()) return;
    addRisorsa({
      title: newResTitle.trim(),
      type: newResType,
      size: newResType === 'Link' ? 'Link web' : '1.2 MB',
      uploadDate: 'Oggi',
      courseName: course.name,
      isFavorite: false,
      url: newResUrl.trim() || undefined,
      openCount: 0,
    });
    setIsAddingResource(false);
    setNewResTitle('');
    setNewResUrl('');
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
          {/* BANNER HEADER */}
          <div
            className={`h-24 w-full bg-linear-to-r ${course.bannerGradient || 'from-blue-600 via-indigo-600 to-sky-500'} relative flex items-end px-6 pb-3 shrink-0`}
            style={
              course.bannerUrl
                ? {
                    backgroundImage: `url(${course.bannerUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : undefined
            }
          >
            <div className="absolute inset-0 bg-black/25" />

            <div className="flex items-center justify-between w-full relative z-10">
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 shadow-xl flex items-center justify-center text-2xl border-2 border-white/60 dark:border-slate-700 shrink-0"
                  style={{ color: course.color || '#2563eb' }}
                >
                  {course.emoji || '📚'}
                </div>
                <div className="text-white drop-shadow-md">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-white leading-tight">
                      {course.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-white/20 backdrop-blur-xs text-white border border-white/30">
                      {course.cfu} CFU
                    </span>
                  </div>
                  <p className="text-xs text-white/90 font-medium">
                    Docente: <strong>{course.professor}</strong> • {course.code}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCustomizingVisual(true)}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs transition-colors border border-white/20 shadow-xs"
                  title="Personalizza colore, emoji e banner"
                >
                  <Palette className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveTab('info')}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs transition-colors border border-white/20 shadow-xs"
                  title="Modifica informazioni corso"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Sei sicuro di voler eliminare il corso "${course.name}" e tutte le sue lezioni?`)) {
                      deleteCorso(course.id);
                      onClose();
                    }
                  }}
                  className="p-2 rounded-xl bg-white/20 hover:bg-red-500/80 text-white backdrop-blur-xs transition-colors border border-white/20 shadow-xs"
                  title="Elimina corso"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs transition-colors border border-white/20 shadow-xs"
                  title="Chiudi"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* SUB-TABS NAVIGATION */}
          <div className="flex items-center gap-4 px-6 border-b border-slate-100 dark:border-slate-800 text-xs font-bold overflow-x-auto bg-white dark:bg-slate-900 shrink-0">
            <button
              onClick={() => setActiveTab('lezioni')}
              className={`py-3.5 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'lezioni'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Registro Lezioni ({lezioni.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('presenze')}
              className={`py-3.5 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'presenze'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Presenze & Frequenza</span>
            </button>

            <button
              onClick={() => setActiveTab('recupero')}
              className={`py-3.5 border-b-2 transition-all flex items-center gap-2 relative ${
                activeTab === 'recupero'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Da Recuperare</span>
              {recuperareCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[9px] font-extrabold">
                  {recuperareCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('programma')}
              className={`py-3.5 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'programma'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Programma & Argomenti</span>
            </button>

            <button
              onClick={() => setActiveTab('risorse')}
              className={`py-3.5 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'risorse'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Materiali & Slide ({courseResources.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('info')}
              className={`py-3.5 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'info'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Dettagli & Note</span>
            </button>
          </div>

          {/* MODAL BODY */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[62vh] flex flex-col gap-6">
            {/* TAB 1: REGISTRO LEZIONI */}
            {activeTab === 'lezioni' && (
              <div className="flex flex-col gap-4">
                {/* Summary KPIs Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setNotesFilter('tutte')}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      notesFilter === 'tutte'
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800'
                        : 'bg-slate-50 dark:bg-zinc-900/60 border-slate-100 dark:border-zinc-800'
                    }`}
                  >
                    <span className="text-[10px] font-semibold text-slate-400 block">Totale lezioni</span>
                    <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">{lezioni.length}</h4>
                  </button>
                  <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 block">Svolte / Presente</span>
                    <h4 className="text-lg font-extrabold text-emerald-600">{svolteCount}</h4>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                    <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 block">Da recuperare</span>
                    <h4 className="text-lg font-extrabold text-amber-600">{recuperareCount}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotesFilter((prev) => (prev === 'con_appunti' ? 'senza_appunti' : prev === 'senza_appunti' ? 'tutte' : 'con_appunti'))}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      notesFilter !== 'tutte'
                        ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800'
                        : 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/40'
                    }`}
                    title="Clicca per filtrare per stato appunti"
                  >
                    <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-400 block">
                      Appunti presi {notesFilter === 'con_appunti' ? '(Solo con appunti)' : notesFilter === 'senza_appunti' ? '(Senza appunti)' : ''}
                    </span>
                    <h4 className="text-lg font-extrabold text-purple-600">{notesCount} / {lezioni.length}</h4>
                  </button>
                </div>

                {/* Action: Add Lecture Button */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Registro cronologico lezioni
                    </h4>
                    {notesFilter !== 'tutte' && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                        Filtro: {notesFilter === 'con_appunti' ? 'Con appunti' : 'Senza appunti'} ({filteredLezioni.length})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {notesFilter !== 'tutte' && (
                      <button
                        type="button"
                        onClick={() => setNotesFilter('tutte')}
                        className="text-[11px] font-bold text-slate-400 hover:text-slate-600 underline"
                      >
                        Mostra tutte
                      </button>
                    )}
                    <button
                      onClick={() => setIsAddingLezione(true)}
                      className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xs hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Aggiungi lezione</span>
                    </button>
                  </div>
                </div>

                {/* Add Lecture Form Drawer */}
                {isAddingLezione && (
                  <form
                    onSubmit={handleAddLezione}
                    className="p-5 rounded-3xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col gap-4 text-xs animate-in fade-in duration-150"
                  >
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                      Nuova Lezione #{lezioni.length + 1}
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Titolo / Argomento lezione *
                        </label>
                        <input
                          type="text"
                          required
                          value={newLezioneTitle}
                          onChange={(e) => setNewLezioneTitle(e.target.value)}
                          placeholder="Es. Introduzione agli Integrali"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white font-bold focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Data Lezione *
                        </label>
                        <input
                          type="date"
                          required
                          value={newLezioneDate}
                          onChange={(e) => setNewLezioneDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <TimeSlotPicker
                      label="Orario Lezione"
                      startTime={newStartTime}
                      endTime={newEndTime}
                      onChange={(s, e) => {
                        setNewStartTime(s);
                        setNewEndTime(e);
                      }}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Aula (opzionale)
                        </label>
                        <input
                          type="text"
                          value={newLezioneRoom}
                          onChange={(e) => setNewLezioneRoom(e.target.value)}
                          placeholder="Es. Aula 4B"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Presenza / Frequenza
                        </label>
                        <select
                          value={newLezioneAttendance}
                          onChange={(e) => setNewLezioneAttendance(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white font-bold focus:outline-none"
                        >
                          <option value="presente">🟢 Presente a lezione</option>
                          <option value="assente">🔴 Assente (da recuperare)</option>
                          <option value="non_registrata">⚪ Non registrata / Futura</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Argomenti dettagliati trattati (sincronizzati con il Programma)
                      </label>
                      <input
                        type="text"
                        value={newLezioneTopics}
                        onChange={(e) => setNewLezioneTopics(e.target.value)}
                        placeholder="Es. Teorema di Weierstrass, continuità, derivabilità"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Note e Appunti presi a lezione
                      </label>
                      <textarea
                        rows={3}
                        value={newLezioneNotes}
                        onChange={(e) => {
                          setNewLezioneNotes(e.target.value);
                          if (e.target.value.trim().length > 0) {
                            setNewLezioneHasNotes(true);
                          }
                        }}
                        placeholder="Trascrivi o incolla qui appunti, formule o collegamenti al materiale di studio..."
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newLezioneHasNotes}
                          onChange={(e) => setNewLezioneHasNotes(e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="font-semibold text-slate-700 dark:text-zinc-300">
                          Ho già preso o caricato gli appunti per questa lezione
                        </span>
                      </label>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingLezione(false)}
                          className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-800 font-semibold"
                        >
                          Annulla
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold shadow-xs hover:bg-blue-700 transition-colors"
                        >
                          Salva lezione
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Lectures List */}
                {filteredLezioni.length === 0 ? (
                  <div className="py-12 px-4 flex flex-col items-center justify-center text-center gap-3 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl">
                    <Calendar className="w-8 h-8 text-slate-400" />
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                        {notesFilter !== 'tutte'
                          ? `Nessuna lezione trovata con filtro "${notesFilter === 'con_appunti' ? 'Con appunti' : 'Senza appunti'}"`
                          : 'Nessuna lezione registrata per questo corso'}
                      </h5>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        Aggiungi le lezioni per tracciare presenze, appunti e programma trattato dal docente.
                      </p>
                    </div>
                    {notesFilter !== 'tutte' ? (
                      <button
                        onClick={() => setNotesFilter('tutte')}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-semibold"
                      >
                        Mostra tutte le lezioni
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsAddingLezione(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xs hover:bg-blue-700 transition-colors mt-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Aggiungi la prima lezione</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {filteredLezioni.map((lez) => {
                      const isEditingThisNote = editingNotesLezId === lez.id;

                      return (
                        <div
                          key={lez.id}
                          className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-xs flex flex-col gap-3 hover:border-slate-300 dark:hover:border-zinc-700 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2.5">
                              <span className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                                #{lez.number}
                              </span>
                              <div>
                                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                  {lez.title}
                                </h5>
                                <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-slate-400" /> {lez.date}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-400" /> {lez.time}
                                  </span>
                                  {lez.room && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-slate-400" /> {lez.room}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              {/* ATTENDANCE TOGGLE BADGE */}
                              <button
                                type="button"
                                onClick={() => {
                                  const nextAtt =
                                    lez.attendance === 'presente'
                                      ? 'assente'
                                      : lez.attendance === 'assente'
                                      ? 'non_registrata'
                                      : 'presente';
                                  updateLezione(course.id, lez.id, {
                                    attendance: nextAtt,
                                    status: nextAtt === 'assente' ? 'da_recuperare' : 'svolta',
                                    topicCompleted: nextAtt === 'presente',
                                  });
                                }}
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer ${
                                  lez.attendance === 'presente'
                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                    : lez.attendance === 'assente'
                                    ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-800'
                                    : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                                }`}
                                title="Clicca per cambiare presenza"
                              >
                                {lez.attendance === 'presente'
                                  ? '🟢 Presente'
                                  : lez.attendance === 'assente'
                                  ? '🔴 Assente'
                                  : '⚪ Non registrata'}
                              </button>

                              {/* APPUNTI PRESI TOGGLE BUTTON */}
                              <button
                                type="button"
                                onClick={() => {
                                  updateLezione(course.id, lez.id, {
                                    hasNotes: !lez.hasNotes,
                                  });
                                }}
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                                  lez.hasNotes
                                    ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                                    : 'bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500 border-slate-200 dark:border-zinc-700 hover:text-purple-600 dark:hover:text-purple-300'
                                }`}
                                title={lez.hasNotes ? 'Segna come non presi' : 'Segna come appunti presi'}
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>{lez.hasNotes ? 'Appunti presi ✓' : 'Senza appunti'}</span>
                              </button>

                              {/* WRITE / EDIT NOTE BUTTON */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (isEditingThisNote) {
                                    setEditingNotesLezId(null);
                                  } else {
                                    setEditingNotesLezId(lez.id);
                                    setTempNotesText(lez.notes || '');
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                                title="Scrivi o modifica appunti"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => deleteLezione(course.id, lez.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                title="Elimina lezione"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Topics line */}
                          {lez.topicsCovered && (
                            <p className="text-[11px] text-slate-600 dark:text-zinc-300 bg-slate-50 dark:bg-black/60 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                              <strong>Argomenti:</strong> {lez.topicsCovered}
                            </p>
                          )}

                          {/* Existing Notes Preview */}
                          {!isEditingThisNote && lez.notes && (
                            <div className="p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  Appunti lezione #{lez.number}:
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingNotesLezId(lez.id);
                                    setTempNotesText(lez.notes || '');
                                  }}
                                  className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline"
                                >
                                  Modifica
                                </button>
                              </div>
                              <p className="text-xs text-slate-800 dark:text-zinc-200 whitespace-pre-wrap">
                                {lez.notes}
                              </p>
                            </div>
                          )}

                          {/* INLINE NOTE EDITOR DRAWER */}
                          {isEditingThisNote && (
                            <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-zinc-950 border border-purple-200 dark:border-purple-900/60 flex flex-col gap-2.5 animate-in fade-in duration-150">
                              <div className="flex items-center justify-between">
                                <label className="font-bold text-xs text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5 text-purple-600" />
                                  <span>Modifica Appunti Lezione #{lez.number}</span>
                                </label>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingNotesLezId(null)}
                                    className="px-2.5 py-1 rounded-xl text-slate-500 text-[11px] font-bold hover:bg-slate-200 dark:hover:bg-zinc-800"
                                  >
                                    Annulla
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateLezione(course.id, lez.id, {
                                        notes: tempNotesText.trim(),
                                        hasNotes: tempNotesText.trim().length > 0 ? true : lez.hasNotes,
                                      });
                                      setEditingNotesLezId(null);
                                    }}
                                    className="px-3.5 py-1 rounded-xl bg-purple-600 text-white font-bold text-[11px] shadow-xs hover:bg-purple-700 transition-colors cursor-pointer"
                                  >
                                    Salva Appunti
                                  </button>
                                </div>
                              </div>
                              <textarea
                                rows={4}
                                value={tempNotesText}
                                onChange={(e) => setTempNotesText(e.target.value)}
                                placeholder="Scrivi o incolla qui i tuoi appunti della lezione..."
                                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-purple-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                autoFocus
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CALCOLATORE PRESENZE NOTION-STYLE */}
            {activeTab === 'presenze' && (
              <AttendanceCalculator
                course={course}
                onUpdateCourse={(updates) => updateCorso(course.id, updates)}
                onUpdateLezione={(lezId, updates) => updateLezione(course.id, lezId, updates)}
              />
            )}

            {/* TAB 3: LEZIONI DA RECUPERARE */}
            {activeTab === 'recupero' && (
              <LezioniRecuperoSection
                course={course}
                onUpdateLezione={(lezId, updates) => updateLezione(course.id, lezId, updates)}
              />
            )}

            {/* TAB 4: PROGRAMMA & ARGOMENTI SINCRONIZZATO */}
            {activeTab === 'programma' && (
              <div className="flex flex-col gap-6">
                {/* Progress Card */}
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-blue-950 dark:text-blue-200">
                      Avanzamento Programma d'Esame
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {lezioni.filter((l) => l.topicCompleted || l.status === 'svolta').length + course.topics.filter((t) => t.completed).length} di {lezioni.length + course.topics.length} punti completati
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                      {course.progress}%
                    </span>
                  </div>
                </div>

                {/* Section A: Lecture Topics (Ordered by Lecture Number) */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      ARGOMENTI DELLE LEZIONI ({lezioni.length})
                    </h5>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Sincronizzato in tempo reale con il registro lezioni
                    </span>
                  </div>

                  {lezioni.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                      Nessuna lezione registrata. Aggiungi lezioni nel registro per vederne gli argomenti.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {lezioni.map((lez) => {
                        const isDone = lez.topicCompleted ?? (lez.status === 'svolta');

                        return (
                          <div
                            key={lez.id}
                            className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 flex items-center justify-between gap-3 text-xs"
                          >
                            <label className="flex items-start gap-3 cursor-pointer flex-1 min-w-0">
                              <input
                                type="checkbox"
                                checked={isDone}
                                onChange={() => {
                                  updateLezione(course.id, lez.id, {
                                    topicCompleted: !isDone,
                                    status: !isDone ? 'svolta' : lez.status,
                                  });
                                }}
                                className="w-4 h-4 rounded text-blue-600 cursor-pointer mt-0.5 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-[11px] text-blue-600 dark:text-blue-400">
                                    Lezione #{lez.number}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">({lez.date})</span>
                                </div>
                                <p className={`mt-0.5 text-xs ${isDone ? 'line-through text-slate-400' : 'font-medium text-slate-900 dark:text-slate-100'}`}>
                                  {lez.topicsCovered || lez.title}
                                </p>
                              </div>
                            </label>

                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                isDone
                                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                                  : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                              }`}
                            >
                              {isDone ? 'Fatto' : 'Da fare'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Section B: General Course Topics */}
                <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      ALTRI ARGOMENTI DEL PROGRAMMA ({course.topics.length})
                    </h5>
                  </div>

                  {/* Add Topic Form */}
                  <form onSubmit={handleAddTopic} className="flex gap-2">
                    <input
                      type="text"
                      value={newTopicName}
                      onChange={(e) => setNewTopicName(e.target.value)}
                      placeholder="Aggiungi argomento generale (es. Calcolo Differenziale)..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xs hover:bg-blue-700 transition-colors shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Aggiungi</span>
                    </button>
                  </form>

                  {/* Topics List */}
                  {course.topics.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                      Nessun argomento generico extra inserito.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {course.topics.map((t) => (
                        <div
                          key={t.id}
                          className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                        >
                          <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={t.completed}
                              onChange={() => toggleCourseTopic(course.id, t.id)}
                              className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                            />
                            <span className={`font-medium truncate ${t.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                              {t.name}
                            </span>
                          </label>
                          <button
                            onClick={() => deleteTopicFromCorso(course.id, t.id)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                            title="Rimuovi argomento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: MATERIALI & RISORSE */}
            {activeTab === 'risorse' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Materiali didattici di {course.name}
                    </h4>
                    <p className="text-xs text-slate-400">PDF, slide, dispense e link utili</p>
                  </div>
                  <button
                    onClick={() => setIsAddingResource(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xs hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Aggiungi materiale</span>
                  </button>
                </div>

                {isAddingResource && (
                  <form
                    onSubmit={handleAttachResource}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col gap-3 text-xs"
                  >
                    <h5 className="font-bold text-slate-900 dark:text-white">Nuovo Materiale</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Titolo materiale..."
                        value={newResTitle}
                        onChange={(e) => setNewResTitle(e.target.value)}
                        className="sm:col-span-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                      <select
                        value={newResType}
                        onChange={(e) => setNewResType(e.target.value as any)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="PDF">PDF</option>
                        <option value="Slide">Slide</option>
                        <option value="Link">Link web</option>
                        <option value="Video">Video</option>
                        <option value="Registrazione">Registrazione</option>
                        <option value="Formulario">Formulario</option>
                        <option value="Esercizio">Esercizio</option>
                      </select>
                    </div>

                    {newResType === 'Link' && (
                      <input
                        type="url"
                        placeholder="URL Link (https://...)"
                        value={newResUrl}
                        onChange={(e) => setNewResUrl(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    )}

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingResource(false)}
                        className="px-3 py-1.5 rounded-xl text-slate-500 font-semibold"
                      >
                        Annulla
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-bold"
                      >
                        Salva materiale
                      </button>
                    </div>
                  </form>
                )}

                {courseResources.length === 0 ? (
                  <div className="py-10 text-center flex flex-col items-center gap-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                    <FolderOpen className="w-8 h-8 text-slate-400" />
                    <p className="text-xs text-slate-400">Nessun file ancora collegato a questo corso.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {courseResources.map((res) => (
                      <div
                        key={res.id}
                        className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                            {res.type}
                          </span>
                          <div>
                            <h5 className="font-bold text-slate-900 dark:text-white">{res.title}</h5>
                            <span className="text-[10px] text-slate-400">{res.size || 'File'} • Caricato il {res.uploadDate}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewingResource(res)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Visualizza</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: DETTAGLI & NOTE CORSO */}
            {activeTab === 'info' && (
              <form onSubmit={handleSaveCourseInfo} className="flex flex-col gap-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nome Insegnamento</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Docente Titolare</label>
                    <input
                      type="text"
                      value={editProf}
                      onChange={(e) => setEditProf(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Codice Corso</label>
                    <input
                      type="text"
                      value={editCode}
                      onChange={(e) => setEditCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">CFU</label>
                    <input
                      type="number"
                      value={editCFU}
                      onChange={(e) => setEditCFU(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Semestre</label>
                    <select
                      value={editSemestre}
                      onChange={(e) => setEditSemestre(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="1° Semestre">1° Semestre</option>
                      <option value="2° Semestre">2° Semestre</option>
                      <option value="Annuale">Annuale</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Aula Abituale</label>
                    <input
                      type="text"
                      value={editAula}
                      onChange={(e) => setEditAula(e.target.value)}
                      placeholder="Es. Aula Magna"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Link Aula Virtuale (Teams/Meet/Zoom)</label>
                    <input
                      type="url"
                      value={editLink}
                      onChange={(e) => setEditLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <TimeSlotPicker
                  label="Orario Abituale Lezioni"
                  startTime={editStartTime}
                  endTime={editEndTime}
                  onChange={(s, e) => {
                    setEditStartTime(s);
                    setEditEndTime(e);
                  }}
                />

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Note del Corso & Modalità d'Esame</label>
                  <textarea
                    rows={3}
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="Informazioni sulla prova d'esame, criteri di valutazione, libri consigliati..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
                  >
                    Salva modifiche corso
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* VISUAL CUSTOMIZER MODAL */}
      {isCustomizingVisual && (
        <CorsoVisualCustomizer
          course={course}
          onSave={(updates) => updateCorso(course.id, updates)}
          onClose={() => setIsCustomizingVisual(false)}
        />
      )}

      {/* RESOURCE VIEWER MODAL */}
      {viewingResource && (
        <ResourceViewerModal
          resource={viewingResource}
          onClose={() => setViewingResource(null)}
        />
      )}
    </>
  );
};
