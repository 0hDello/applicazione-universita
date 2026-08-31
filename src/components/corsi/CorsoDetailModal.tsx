import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Corso, Lezione } from '../../types';
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
  ExternalLink,
  FolderOpen,
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

  const [activeTab, setActiveTab] = useState<'lezioni' | 'programma' | 'risorse' | 'info'>('lezioni');

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
  const [newLezioneStatus, setNewLezioneStatus] = useState<Lezione['status']>('svolta');
  const [newLezioneHasNotes, setNewLezioneHasNotes] = useState(true);

  // New Topic Form State
  const [newTopicName, setNewTopicName] = useState('');

  // Edit Course Info State
  const [isEditingCourse, setIsEditingCourse] = useState(false);
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

  const lezioni = course.lezioni || [];
  const courseResources = risorse.filter((r) => r.courseName === course.name);

  const svolteCount = lezioni.filter((l) => l.status === 'svolta').length;
  const recuperareCount = lezioni.filter((l) => l.status === 'da_recuperare').length;
  const notesCount = lezioni.filter((l) => l.hasNotes).length;

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
    setIsEditingCourse(false);
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
      status: newLezioneStatus,
      hasNotes: newLezioneHasNotes,
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* MODAL HEADER */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${course.color || 'bg-blue-600'} text-white flex items-center justify-center font-extrabold text-base shadow-md shrink-0`}>
              {course.code ? course.code.slice(0, 3).toUpperCase() : 'CRS'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                  {course.name}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  {course.cfu} CFU
                </span>
                {course.semestre && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {course.semestre}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                Docente: <strong className="text-slate-700 dark:text-slate-200">{course.professor}</strong>
                {course.aulaAbituale && ` • Aula: ${course.aulaAbituale}`}
                {course.orarioAbituale && ` • Orario: ${course.orarioAbituale}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsEditingCourse(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Modifica corso"
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
              className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Elimina corso"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SUB-TABS NAVIGATION */}
        <div className="flex items-center gap-6 px-6 border-b border-slate-100 dark:border-slate-800 text-xs font-bold overflow-x-auto">
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
            onClick={() => setActiveTab('programma')}
            className={`py-3.5 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'programma'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Programma & Argomenti ({course.topics.length})</span>
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
            <span>Dettagli & Note Corso</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[60vh] flex flex-col gap-6">
          {/* TAB 1: REGISTRO LEZIONI */}
          {activeTab === 'lezioni' && (
            <div className="flex flex-col gap-4">
              {/* Summary KPIs Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-semibold text-slate-400 block">Totale lezioni</span>
                  <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">{lezioni.length}</h4>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 block">Svolte</span>
                  <h4 className="text-lg font-extrabold text-emerald-600">{svolteCount}</h4>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                  <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 block">Da recuperare</span>
                  <h4 className="text-lg font-extrabold text-amber-600">{recuperareCount}</h4>
                </div>
                <div className="p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
                  <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-400 block">Appunti presi</span>
                  <h4 className="text-lg font-extrabold text-purple-600">{notesCount} / {lezioni.length}</h4>
                </div>
              </div>

              {/* Action: Add Lecture Button */}
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Registro cronologico lezioni
                </h4>
                <button
                  onClick={() => setIsAddingLezione(true)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xs hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Aggiungi lezione</span>
                </button>
              </div>

              {/* Lectures List */}
              {lezioni.length === 0 ? (
                <div className="py-12 px-4 flex flex-col items-center justify-center text-center gap-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                  <Calendar className="w-8 h-8 text-slate-400" />
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                      Nessuna lezione registrata per questo corso
                    </h5>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      Aggiungi le lezioni svolte o in programma per tracciare presenze, appunti e argomenti trattati dal professore.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddingLezione(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xs hover:bg-blue-700 transition-colors mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Aggiungi la prima lezione</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {lezioni.map((lez) => (
                    <div
                      key={lez.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 shadow-xs flex flex-col gap-2.5 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                            #{lez.number}
                          </span>
                          <div>
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                              {lez.title}
                            </h5>
                            <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5">
                              {lez.date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  {lez.date}
                                </span>
                              )}
                              {lez.time && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {lez.time}
                                </span>
                              )}
                              {lez.room && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  {lez.room}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Toggle & Actions */}
                        <div className="flex items-center gap-2">
                          <select
                            value={lez.status}
                            onChange={(e) =>
                              updateLezione(course.id, lez.id, {
                                status: e.target.value as Lezione['status'],
                              })
                            }
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border focus:outline-none cursor-pointer ${
                              lez.status === 'svolta'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                : lez.status === 'da_recuperare'
                                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                                : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                            }`}
                          >
                            <option value="svolta">✓ Svolta</option>
                            <option value="da_recuperare">⚠️ Da recuperare</option>
                            <option value="programmata">📅 Programmata</option>
                          </select>

                          <button
                            onClick={() =>
                              updateLezione(course.id, lez.id, {
                                hasNotes: !lez.hasNotes,
                              })
                            }
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                              lez.hasNotes
                                ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
                                : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                            title="Stato appunti"
                          >
                            <FileText className="w-3 h-3" />
                            <span>{lez.hasNotes ? 'Appunti completati' : 'Appunti mancanti'}</span>
                          </button>

                          <button
                            onClick={() => deleteLezione(course.id, lez.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                            title="Elimina lezione"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Topics covered / notes preview */}
                      {lez.topicsCovered && lez.topicsCovered !== lez.title && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          <strong className="text-slate-900 dark:text-white">Argomenti trattati:</strong>{' '}
                          {lez.topicsCovered}
                        </p>
                      )}

                      {lez.notes && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                          "{lez.notes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROGRAMMA & ARGOMENTI */}
          {activeTab === 'programma' && (
            <div className="flex flex-col gap-4">
              {/* Progress Summary */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-blue-950 dark:text-blue-200">
                    Avanzamento Programma d'Esame
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {course.topics.filter((t) => t.completed).length} di {course.topics.length} argomenti studiati
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
                    {course.progress}%
                  </span>
                </div>
              </div>

              {/* Add Topic Form */}
              <form onSubmit={handleAddTopic} className="flex gap-2">
                <input
                  type="text"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="Aggiungi nuovo argomento al programma (es. Calcolo Differenziale)..."
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
                <p className="text-xs text-slate-400 text-center py-6">
                  Nessun argomento ancora inserito. Scrivi il primo argomento qui sopra per iniziare!
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
          )}

          {/* TAB 3: MATERIALI & RISORSE */}
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
                      className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px] text-blue-600">
                          {res.type}
                        </span>
                        <div>
                          <h5 className="font-bold text-slate-900 dark:text-white">{res.title}</h5>
                          <span className="text-[10px] text-slate-400">{res.size || 'File'} • Caricato il {res.uploadDate}</span>
                        </div>
                      </div>
                      {res.url && (
                        <a
                          href={res.url.startsWith('http') ? res.url : `https://${res.url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DETTAGLI & NOTE CORSO */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">Orari & Aule</span>
                <p className="text-slate-600 dark:text-slate-400">
                  <strong>Aula abituale:</strong> {course.aulaAbituale || 'Non specificata'}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  <strong>Orario abituale:</strong> {course.orarioAbituale || 'Non specificato'}
                </p>
                {course.linkAulaVirtuale && (
                  <p className="text-slate-600 dark:text-slate-400">
                    <strong>Aula virtuale:</strong>{' '}
                    <a
                      href={course.linkAulaVirtuale.startsWith('http') ? course.linkAulaVirtuale : `https://${course.linkAulaVirtuale}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      Accedi alla lezione online
                    </a>
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">Note & Ricevimento</span>
                <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                  {course.noteCorso || 'Nessuna nota aggiuntiva per questo corso.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">
            Progresso completamento: <strong className="text-blue-600 font-extrabold">{course.progress}%</strong>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>

      {/* SUB-MODAL: AGGIUNGI LEZIONE */}
      {isAddingLezione && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Nuova Lezione per {course.name}
              </h4>
              <button onClick={() => setIsAddingLezione(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLezione} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Titolo o Argomento principale *
                </label>
                <input
                  type="text"
                  required
                  value={newLezioneTitle}
                  onChange={(e) => setNewLezioneTitle(e.target.value)}
                  placeholder="Es. Lezione 3: Calcolo delle Probabilità"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Data Lezione</label>
                  <input
                    type="date"
                    value={newLezioneDate}
                    onChange={(e) => setNewLezioneDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Aula</label>
                  <input
                    type="text"
                    value={newLezioneRoom}
                    onChange={(e) => setNewLezioneRoom(e.target.value)}
                    placeholder="Es. Aula Magna"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Time Slot Picker for Lecture */}
              <TimeSlotPicker
                startTime={newStartTime}
                endTime={newEndTime}
                onChange={(s, e) => {
                  setNewStartTime(s);
                  setNewEndTime(e);
                }}
              />

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Stato Lezione</label>
                <select
                  value={newLezioneStatus}
                  onChange={(e) => setNewLezioneStatus(e.target.value as Lezione['status'])}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="svolta">✓ Svolta</option>
                  <option value="da_recuperare">⚠️ Da recuperare</option>
                  <option value="programmata">📅 Programmata</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Note aggiuntive o compiti assegnati
                </label>
                <textarea
                  rows={2}
                  value={newLezioneNotes}
                  onChange={(e) => setNewLezioneNotes(e.target.value)}
                  placeholder="Es. Esercizi da pagina 45 a 48 per la prossima volta"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newLezioneHasNotes}
                  onChange={(e) => setNewLezioneHasNotes(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Ho già preso e sistemato gli appunti per questa lezione
                </span>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingLezione(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 font-semibold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-xs hover:bg-blue-700"
                >
                  Salva Lezione
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL: MODIFICA CORSO */}
      {isEditingCourse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Modifica Informazioni Corso
              </h4>
              <button onClick={() => setIsEditingCourse(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourseInfo} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nome Corso</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Codice</label>
                  <input
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">CFU</label>
                  <input
                    type="number"
                    min="1"
                    value={editCFU}
                    onChange={(e) => setEditCFU(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Docente</label>
                <input
                  type="text"
                  value={editProf}
                  onChange={(e) => setEditProf(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Semestre</label>
                  <select
                    value={editSemestre}
                    onChange={(e) => setEditSemestre(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="1° Semestre">1° Semestre</option>
                    <option value="2° Semestre">2° Semestre</option>
                    <option value="Annuale">Annuale</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Aula abituale</label>
                  <input
                    type="text"
                    value={editAula}
                    onChange={(e) => setEditAula(e.target.value)}
                    placeholder="Es. Aula 4B"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Time Slot Picker for Course Usual Time */}
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
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Link aula virtuale (Teams / Zoom / Meet)</label>
                <input
                  type="text"
                  value={editLink}
                  onChange={(e) => setEditLink(e.target.value)}
                  placeholder="Es. https://teams.microsoft.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Note del corso</label>
                <textarea
                  rows={2}
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Note, orari di ricevimento, modalità d'esame..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingCourse(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 font-semibold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-xs hover:bg-blue-700"
                >
                  Salva Modifiche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL: AGGIUNGI MATERIALE */}
      {isAddingResource && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Aggiungi Materiale a {course.name}
              </h4>
              <button onClick={() => setIsAddingResource(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAttachResource} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Titolo risorsa *</label>
                <input
                  type="text"
                  required
                  value={newResTitle}
                  onChange={(e) => setNewResTitle(e.target.value)}
                  placeholder="Es. Slide Capitolo 2 - Limiti"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tipo</label>
                <select
                  value={newResType}
                  onChange={(e) => setNewResType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="PDF">PDF</option>
                  <option value="Slide">Slide</option>
                  <option value="Link">Link web</option>
                  <option value="Video">Video</option>
                  <option value="Formulario">Formulario</option>
                </select>
              </div>

              {newResType === 'Link' && (
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">URL</label>
                  <input
                    type="url"
                    value={newResUrl}
                    onChange={(e) => setNewResUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingResource(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 font-semibold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-xs hover:bg-blue-700"
                >
                  Aggiungi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
