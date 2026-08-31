import React, { useState } from 'react';
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
} from 'lucide-react';

export const ImpostazioniView: React.FC = () => {
  const { userSettings, updateUserSettings } = useApp();

  const [formData, setFormData] = useState({ ...userSettings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const accentColors = ['#2563eb', '#7c3aed', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

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

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">Università</label>
              <select
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Politecnico di Milano">Politecnico di Milano</option>
                <option value="Università di Bologna">Università di Bologna</option>
                <option value="Sapienza Università di Roma">Sapienza Università di Roma</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">Anno accademico</label>
              <select
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="2025/2026">2025/2026</option>
                <option value="2026/2027">2026/2027</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">Corso di studi</label>
              <select
                value={formData.studyProgram}
                onChange={(e) => setFormData({ ...formData, studyProgram: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Ingegneria Informatica">Ingegneria Informatica</option>
                <option value="Economia e Management">Economia e Management</option>
                <option value="Medicina e Chirurgia">Medicina e Chirurgia</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">Anno di corso</label>
              <select
                value={formData.studyYear}
                onChange={(e) => setFormData({ ...formData, studyYear: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="1° anno">1° anno</option>
                <option value="2° anno">2° anno</option>
                <option value="3° anno">3° anno</option>
              </select>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 font-medium">
            ⓘ Queste informazioni vengono utilizzate per personalizzare la tua esperienza.
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

        {/* CARD 4: TEMA */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <Palette className="w-4 h-4 text-blue-600" />
            <span>Tema</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs text-center">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFormData({ ...formData, theme: t })}
                className={`p-3 rounded-2xl border font-bold capitalize flex flex-col items-center gap-2 ${
                  formData.theme === t
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600'
                }`}
              >
                <span>{t === 'light' ? 'Chiaro' : t === 'dark' ? 'Scuro' : 'Sistema'}</span>
              </button>
            ))}
          </div>

          <div>
            <label className="font-semibold text-slate-600 dark:text-slate-400 block text-xs mb-2">
              Colore principale
            </label>
            <div className="flex items-center gap-3">
              {accentColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, accentColor: color })}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: color }}
                >
                  {formData.accentColor === color && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
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
              <p className="font-semibold text-slate-900 dark:text-white">Ultimo backup</p>
              <p className="text-[10px] text-slate-400">31 Maggio 2026, 09:30 • Eseguito</p>
            </div>
            <button
              type="button"
              onClick={exportBackupJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Esegui backup ora</span>
            </button>
          </div>
        </div>

        {/* CARD 6: PRIVACY */}
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
    </form>
  );
};
