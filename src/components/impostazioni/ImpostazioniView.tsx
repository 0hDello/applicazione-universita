import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  User,
  GraduationCap,
  Bell,
  Palette,
  Shield,
  Database,
  Check,
  Download,
  RotateCcw,
  Save,
  RefreshCw,
  Sparkles,
  DownloadCloud,
  CheckCircle2,
  AlertCircle,
  BookMarked,
} from 'lucide-react';

import {
  UNIVERSITA_ITALIANE,
  CORSI_DI_STUDIO_CATEGORIE,
  ANNI_ACCADEMICI,
  ANNI_DI_CORSO,
} from '../../data/universityData';
import { DEGREE_PROGRAMS } from '../../data/degreePrograms';

interface UpdateInfo {
  status: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error' | 'dev';
  message: string;
  percent?: number;
  version?: string;
}

export const ImpostazioniView: React.FC = () => {
  const { userSettings, updateUserSettings, corsi, loadPredefinedCoursesForProgram } = useApp();

  const [formData, setFormData] = useState({ ...userSettings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [isInstallingUpdate, setIsInstallingUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({
    status: 'idle',
    message: '',
  });

  useEffect(() => {
    try {
      const electron = typeof window !== 'undefined' && (window as any).require ? (window as any).require('electron') : null;
      if (electron && electron.ipcRenderer) {
        electron.ipcRenderer.invoke('get-app-version').then((v: string) => {
          if (v) setAppVersion(v);
        }).catch(() => {});

        const handleUpdaterStatus = (_: any, data: UpdateInfo) => {
          setUpdateInfo(data);
        };

        electron.ipcRenderer.on('updater-status', handleUpdaterStatus);
        return () => {
          electron.ipcRenderer.removeListener('updater-status', handleUpdaterStatus);
        };
      }
    } catch {
      // Ambiente web
    }
  }, []);

  const handleCheckForUpdates = () => {
    try {
      const electron = typeof window !== 'undefined' && (window as any).require ? (window as any).require('electron') : null;
      if (electron && electron.ipcRenderer) {
        setUpdateInfo({ status: 'checking', message: 'Controllo aggiornamenti in corso su GitHub...' });
        electron.ipcRenderer.invoke('check-for-updates').catch((err: any) => {
          setUpdateInfo({ status: 'error', message: err?.message || 'Errore durante la verifica.' });
        });
      } else {
        setUpdateInfo({
          status: 'dev',
          message: 'Sei nell\'ambiente web/sviluppo (v1.0.0). Gli aggiornamenti si attivano nell\'app Windows installata.',
        });
      }
    } catch {
      setUpdateInfo({
        status: 'error',
        message: 'Impossibile verificare gli aggiornamenti in questa modalità.',
      });
    }
  };

  const handleDownloadUpdate = () => {
    try {
      const electron = typeof window !== 'undefined' && (window as any).require ? (window as any).require('electron') : null;
      if (electron && electron.ipcRenderer) {
        setUpdateInfo((prev) => ({
          ...prev,
          status: 'downloading',
          message: 'Scaricamento aggiornamento in corso...',
          percent: 0,
        }));
        electron.ipcRenderer.invoke('download-update').catch((err: any) => {
          setUpdateInfo({ status: 'error', message: err?.message || 'Errore durante il download.' });
        });
      }
    } catch {
      // fallback
    }
  };

  const handleInstallUpdate = () => {
    setIsInstallingUpdate(true);
    setTimeout(() => {
      try {
        const electron = typeof window !== 'undefined' && (window as any).require ? (window as any).require('electron') : null;
        if (electron && electron.ipcRenderer) {
          electron.ipcRenderer.invoke('quit-and-install');
        }
      } catch {
        // fallback
      }
    }, 1200);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const accentColors = ['#2563eb', '#7c3aed', '#059669', '#ea580c', '#db2777', '#0284c7', '#d97706'];

  const exportBackupJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(localStorage));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `UniPlanner_Backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 p-8 max-w-6xl mx-auto">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Impostazioni</h2>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Ecco le tue impostazioni personalizzate.
          </p>
        </div>

        {saveSuccess && (
          <span className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center gap-2">
            <Check className="w-4 h-4" /> Impostazioni salvate con successo!
          </span>
        )}
      </div>

      {/* Grid Settings Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: PROFILO */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <User className="w-4 h-4 text-blue-600" />
            <span>Profilo</span>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
              {formData.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{formData.name}</h4>
              <p className="text-xs text-slate-400">{formData.email}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">Nome completo</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">Ruolo</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Studentessa">Studentessa</option>
                <option value="Studente">Studente</option>
                <option value="Ricercatore">Ricercatore</option>
              </select>
            </div>
          </div>
        </div>

        {/* CARD 2: DATI UNIVERSITARI */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Dati universitari</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Università o Ateneo
              </label>
              <select
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {!UNIVERSITA_ITALIANE.includes(formData.university) && formData.university && (
                  <option value={formData.university}>{formData.university}</option>
                )}
                {UNIVERSITA_ITALIANE.map((uni) => (
                  <option key={uni} value={uni}>
                    {uni}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Anno accademico
              </label>
              <select
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {ANNI_ACCADEMICI.map((anno) => (
                  <option key={anno} value={anno}>
                    {anno}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Corso di laurea / studi
              </label>
              <select
                value={formData.studyProgram}
                onChange={(e) => {
                  const val = e.target.value;
                  const matched = DEGREE_PROGRAMS.find((p) => p.name === val || p.shortName === val);
                  if (matched) {
                    setFormData({
                      ...formData,
                      studyProgram: matched.name,
                      university: matched.university,
                    });
                  } else {
                    setFormData({ ...formData, studyProgram: val });
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <optgroup label="Corsi di Laurea con Piano di Studi Integrato">
                  {DEGREE_PROGRAMS.map((prog) => (
                    <option key={prog.id} value={prog.name}>
                      ★ {prog.name}
                    </option>
                  ))}
                </optgroup>
                {CORSI_DI_STUDIO_CATEGORIE.map((cat) => (
                  <optgroup key={cat.category} label={cat.category}>
                    {cat.courses.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <option value="Altro corso di studi">Altro corso di studi</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Anno di corso
              </label>
              <select
                value={formData.studyYear}
                onChange={(e) => setFormData({ ...formData, studyYear: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {ANNI_DI_CORSO.map((anno) => (
                  <option key={anno} value={anno}>
                    {anno}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Matricola (opzionale)
              </label>
              <input
                type="text"
                value={formData.matricola || ''}
                onChange={(e) => setFormData({ ...formData, matricola: e.target.value })}
                placeholder="Es. 1094821"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Dipartimento / Facoltà (opzionale)
              </label>
              <input
                type="text"
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Es. Dipartimento di Ingegneria"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* DEGREE PROGRAM PREDEFINED COURSES LOADER BANNER */}
          {(() => {
            const matchedProg = DEGREE_PROGRAMS.find(
              (p) =>
                p.name.toLowerCase() === formData.studyProgram?.toLowerCase() ||
                formData.studyProgram?.toLowerCase().includes(p.shortName.toLowerCase()) ||
                (formData.studyProgram?.toLowerCase().includes('ingegneria meccanica') &&
                  (formData.university?.toLowerCase().includes('forlì')
                    ? p.id === 'ingegneria_meccanica_forli'
                    : p.id === 'ingegneria_meccanica_bologna'))
            );

            if (!matchedProg) return null;

            const currentYearNum = parseInt(formData.studyYear) || 1;
            const yearCourses = matchedProg.courses.filter((c) => c.year === currentYearNum);

            return (
              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 flex flex-col gap-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <BookMarked className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-purple-950 dark:text-purple-200">
                        Piano di Studi Ufficiale Disponibile ({matchedProg.courses.length} insegnamenti - {matchedProg.totalCFU} CFU)
                      </p>
                      <p className="text-[10px] text-purple-700 dark:text-purple-400">
                        {matchedProg.name} • 📍 {matchedProg.campus}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-purple-200/50 dark:border-purple-800/40">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[10px] text-purple-900 dark:text-purple-300 font-bold">
                      {yearCourses.length} corsi del {currentYearNum}° Anno ({yearCourses.reduce((sum, c) => sum + (c.cfu || 0), 0)} CFU)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          corsi.length === 0 ||
                          window.confirm(
                            `Vuoi caricare solo i ${yearCourses.length} corsi del ${currentYearNum}° anno per "${matchedProg.shortName}"?`
                          )
                        ) {
                          loadPredefinedCoursesForProgram(matchedProg.id, true, currentYearNum);
                          setSaveSuccess(true);
                          setTimeout(() => setSaveSuccess(false), 2000);
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      ⚡ Carica solo {currentYearNum}° Anno
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (
                          corsi.length === 0 ||
                          window.confirm(
                            `Vuoi caricare tutti i ${matchedProg.courses.length} corsi del triennio per "${matchedProg.shortName}"?`
                          )
                        ) {
                          loadPredefinedCoursesForProgram(matchedProg.id, true, 'all');
                          setSaveSuccess(true);
                          setTimeout(() => setSaveSuccess(false), 2000);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-900/60 hover:bg-purple-200 dark:hover:bg-purple-800/60 text-purple-900 dark:text-purple-200 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Tutto il Triennio
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          <p className="text-[10px] text-slate-400 font-medium">
            ⓘ Queste informazioni vengono utilizzate per personalizzare il tuo piano di studi.
          </p>
        </div>

        {/* CARD 3: NOTIFICHE */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <Bell className="w-4 h-4 text-blue-600" />
            <span>Notifiche</span>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Promemoria lezioni</p>
                <p className="text-[10px] text-slate-400">Ricevi promemoria prima delle lezioni</p>
              </div>
              <input
                type="checkbox"
                checked={formData.notifications.lessonReminders}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notifications: { ...formData.notifications, lessonReminders: e.target.checked },
                  })
                }
                className="w-5 h-5 text-blue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Scadenze ed esami</p>
                <p className="text-[10px] text-slate-400">Avvisi per scadenze, compiti ed esami</p>
              </div>
              <input
                type="checkbox"
                checked={formData.notifications.examDeadlines}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notifications: { ...formData.notifications, examDeadlines: e.target.checked },
                  })
                }
                className="w-5 h-5 text-blue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Nuove attività suggerite</p>
                <p className="text-[10px] text-slate-400">Suggerimenti su attività e obiettivi</p>
              </div>
              <input
                type="checkbox"
                checked={formData.notifications.suggestedActivities}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notifications: { ...formData.notifications, suggestedActivities: e.target.checked },
                  })
                }
                className="w-5 h-5 text-blue-600 rounded"
              />
            </div>
          </div>
        </div>

        {/* CARD 4: TEMA & COLORI */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-5">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <Palette className="w-4 h-4 text-blue-600" />
            <span>Tema & Personalizzazione Visiva</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs text-center">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, theme: t }));
                  updateUserSettings({ theme: t });
                }}
                className={`p-3 rounded-2xl border font-bold capitalize flex flex-col items-center gap-2 transition-all ${
                  formData.theme === t
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>{t === 'light' ? '☀️ Chiaro' : t === 'dark' ? '🌙 Scuro' : '💻 Sistema'}</span>
              </button>
            ))}
          </div>

          {/* FREE COLOR PICKER (SCELTA LIBERA) */}
          <div className="flex flex-col gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-bold text-slate-900 dark:text-white block text-xs">
                  Colore tema (Accent Color Libero)
                </label>
                <p className="text-[10px] text-slate-400">
                  Scegli qualsiasi colore con il selettore o digita il codice HEX/RGB
                </p>
              </div>

              {/* Color preview badge */}
              <div
                className="px-3 py-1 rounded-xl text-white font-mono text-xs font-bold shadow-xs flex items-center gap-2"
                style={{ backgroundColor: formData.accentColor || '#2563eb' }}
              >
                <span>{formData.accentColor || '#2563eb'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Native color wheel picker */}
              <label
                className="w-10 h-10 rounded-2xl border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-all shadow-xs shrink-0 overflow-hidden relative"
                title="Apri tavolozza colori"
              >
                <input
                  type="color"
                  value={formData.accentColor || '#2563eb'}
                  onChange={(e) => {
                    const newCol = e.target.value;
                    setFormData((prev) => ({ ...prev, accentColor: newCol }));
                    updateUserSettings({ accentColor: newCol });
                  }}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
                <div
                  className="w-full h-full"
                  style={{ backgroundColor: formData.accentColor || '#2563eb' }}
                />
              </label>

              {/* Text HEX input */}
              <div className="flex-1 min-w-[140px] max-w-[200px]">
                <input
                  type="text"
                  value={formData.accentColor || '#2563eb'}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (!val.startsWith('#') && val.length > 0) {
                      val = `#${val}`;
                    }
                    setFormData((prev) => ({ ...prev, accentColor: val }));
                    if (/^#[0-9A-F]{6}$/i.test(val) || /^#[0-9A-F]{3}$/i.test(val)) {
                      updateUserSettings({ accentColor: val });
                    }
                  }}
                  placeholder="#2563eb"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Swatch Presets */}
              <div className="flex items-center gap-2 flex-wrap">
                {accentColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, accentColor: color }));
                      updateUserSettings({ accentColor: color });
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-xs ${
                      formData.accentColor?.toLowerCase() === color.toLowerCase()
                        ? 'ring-3 ring-offset-2 ring-slate-400 dark:ring-slate-500 scale-105'
                        : ''
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    {formData.accentColor?.toLowerCase() === color.toLowerCase() && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FONT SIZE PREFERENCE (DIMENSIONE FONT REGOLABILE) */}
          <div className="flex flex-col gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="font-bold text-slate-900 dark:text-white block text-xs">
                Dimensione Font dell'Applicazione
              </label>
              <p className="text-[10px] text-slate-400">
                Regola la grandezza del testo per adattarla alle tue preferenze di lettura (predefinito aumentato a 16px)
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'small', label: 'Piccolo (14px)', desc: 'Compatto' },
                { id: 'medium', label: 'Medio (16px)', desc: 'Predefinito' },
                { id: 'large', label: 'Grande (18px)', desc: 'Più leggibile' },
                { id: 'xlarge', label: 'Molto Grande (20px)', desc: 'Massima leggibilità' },
              ].map((item) => {
                const isSelected = (formData.fontSize || 'medium') === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, fontSize: item.id as any }));
                      updateUserSettings({ fontSize: item.id as any });
                    }}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold">{item.label}</span>
                    <span className="text-[10px] text-slate-400 mt-1">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CARD 5: BACKUP DATI */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Backup dati</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Esporta dati</p>
              <p className="text-[10px] text-slate-400">Salva un file JSON di backup di tutti i tuoi dati</p>
            </div>
            <button
              type="button"
              onClick={exportBackupJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Scarica backup</span>
            </button>
          </div>
        </div>

        {/* CARD 6: AGGIORNAMENTI APPLICAZIONE */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Aggiornamenti & Versione</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800">
              v{appVersion}
            </span>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Stato aggiornamenti</p>
                <p className="text-[10px] text-slate-400">
                  Verifica automatica con GitHub Releases
                </p>
              </div>
              <button
                type="button"
                onClick={handleCheckForUpdates}
                disabled={updateInfo.status === 'checking' || updateInfo.status === 'downloading'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${updateInfo.status === 'checking' ? 'animate-spin' : ''}`} />
                <span>{updateInfo.status === 'checking' ? 'Verifica in corso...' : 'Verifica ora'}</span>
              </button>
            </div>

            {/* Status Feedback Box */}
            {updateInfo.message && (
              <div
                className={`p-3 rounded-2xl border text-xs flex flex-col gap-2 ${
                  updateInfo.status === 'downloaded' || updateInfo.status === 'not-available'
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : updateInfo.status === 'available' || updateInfo.status === 'downloading'
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
                    : updateInfo.status === 'error'
                    ? 'bg-red-50/80 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {(updateInfo.status === 'downloaded' || updateInfo.status === 'not-available') && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  {updateInfo.status === 'available' && <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />}
                  {updateInfo.status === 'downloading' && <DownloadCloud className="w-4 h-4 text-blue-600 shrink-0 animate-bounce" />}
                  {updateInfo.status === 'error' && <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
                  <span className="font-medium text-[11px] leading-snug">{updateInfo.message}</span>
                </div>

                {/* Progress bar during download */}
                {updateInfo.status === 'downloading' && typeof updateInfo.percent === 'number' && (
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${updateInfo.percent}%` }}
                    />
                  </div>
                )}

                {/* Button if Update Available: user decides when to download */}
                {updateInfo.status === 'available' && (
                  <button
                    type="button"
                    onClick={handleDownloadUpdate}
                    className="mt-1 w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
                  >
                    <DownloadCloud className="w-4 h-4" />
                    <span>Scarica aggiornamento ora</span>
                  </button>
                )}

                {/* Restart Button if Downloaded: user decides when to restart */}
                {updateInfo.status === 'downloaded' && (
                  <div className="flex flex-col gap-2 mt-1">
                    <button
                      type="button"
                      onClick={handleInstallUpdate}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
                    >
                      Riavvia e Installa Aggiornamento 🚀
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpdateInfo({ status: 'idle', message: '' })}
                      className="w-full py-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-semibold text-[11px] transition-colors text-center"
                    >
                      Riavvia più tardi
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CARD 7: PRIVACY */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Privacy</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Profilo pubblico</p>
              <p className="text-[10px] text-slate-400">Rendi visibile il tuo profilo ad altri studenti</p>
            </div>
            <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
          </div>
        </div>
      </div>

      {/* BOTTOM ACTIONS BAR */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setFormData({ ...userSettings })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Ripristina impostazioni predefinite</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
          >
            Annulla
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-600/20 hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            <span>Salva modifiche</span>
          </button>
        </div>
      </div>
      {/* Dark Minimalist Installation Overlay */}
      {isInstallingUpdate && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center gap-6 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

            {/* Glowing Modern Spinner Wheel */}
            <div className="relative w-16 h-16 flex items-center justify-center mt-2">
              <div className="absolute inset-0 rounded-full border-3 border-blue-500/20 border-t-blue-500 animate-spin" />
              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Installazione Aggiornamento
              </h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Applicazione dei nuovi file e riavvio dell'applicazione in corso...
              </p>
            </div>

            {/* Subtle Progress / Status */}
            <div className="w-full flex flex-col gap-2 pt-2 border-t border-slate-800/80">
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-full animate-pulse" />
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">
                Non chiudere la finestra, richiederà solo un istante
              </span>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
