import React, { useState } from 'react';
import type { Corso, Lezione } from '../../types';
import {
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  RotateCcw,
} from 'lucide-react';

interface LezioniRecuperoSectionProps {
  course: Corso;
  onUpdateLezione: (lezioneId: string, updates: Partial<Lezione>) => void;
}

export const LezioniRecuperoSection: React.FC<LezioniRecuperoSectionProps> = ({
  course,
  onUpdateLezione,
}) => {
  const lezioni = course.lezioni || [];
  const daRecuperareList = lezioni.filter(
    (l) => (l.status === 'da_recuperare' || l.attendance === 'assente') && !l.recovered
  );
  const recuperateList = lezioni.filter((l) => l.recovered);

  const [selectedLezioneId, setSelectedLezioneId] = useState<string | null>(null);
  const [recoveryDate, setRecoveryDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [recoveryNotes, setRecoveryNotes] = useState<string>('');

  const handleMarkAsRecovered = (lezioneId: string) => {
    onUpdateLezione(lezioneId, {
      recovered: true,
      recoveredDate: recoveryDate,
      recoveredNotes: recoveryNotes.trim() || undefined,
      status: 'svolta',
    });
    setSelectedLezioneId(null);
    setRecoveryNotes('');
  };

  const handleUndoRecovered = (lezioneId: string) => {
    onUpdateLezione(lezioneId, {
      recovered: false,
      recoveredDate: undefined,
      status: 'da_recuperare',
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Info Box */}
      <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Lezioni da Recuperare ({daRecuperareList.length})
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Lezioni in cui eri assente o contrassegnate per lo studio autonomo e il recupero appunti.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs">
            {recuperateList.length} già recuperate
          </span>
        </div>
      </div>

      {/* LIST OF PENDING LESSONS TO RECOVER */}
      <div className="flex flex-col gap-3">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          DA RECUPERARE ({daRecuperareList.length})
        </h5>

        {daRecuperareList.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <h5 className="text-sm font-bold text-slate-900 dark:text-white">
              Nessuna lezione in arretrato!
            </h5>
            <p className="text-xs text-slate-400 max-w-sm">
              Tutte le lezioni del corso sono in pari o sono state già recuperate con successo.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {daRecuperareList.map((lez) => (
              <div
                key={lez.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                      #{lez.number}
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                        {lez.title}
                      </h5>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-amber-500" /> {lez.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" /> {lez.time}
                        </span>
                        {lez.room && <span>• {lez.room}</span>}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedLezioneId(selectedLezioneId === lez.id ? null : lez.id)
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 transition-colors shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Segna come recuperata</span>
                  </button>
                </div>

                {lez.topicsCovered && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                    <strong className="text-slate-800 dark:text-slate-200">Argomenti trattati:</strong>{' '}
                    {lez.topicsCovered}
                  </div>
                )}

                {/* Inline Recovery Form Drawer */}
                {selectedLezioneId === lez.id && (
                  <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex flex-col gap-3 animate-in fade-in duration-150">
                    <h6 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      Conferma recupero lezione #{lez.number}
                    </h6>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Data di recupero
                        </label>
                        <input
                          type="date"
                          value={recoveryDate}
                          onChange={(e) => setRecoveryDate(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Note / Appunti recuperati (opzionale)
                        </label>
                        <input
                          type="text"
                          value={recoveryNotes}
                          onChange={(e) => setRecoveryNotes(e.target.value)}
                          placeholder="Es. Slide lette e appunti presi da Luca"
                          className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setSelectedLezioneId(null)}
                        className="px-3 py-1.5 rounded-xl text-slate-500 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Annulla
                      </button>
                      <button
                        onClick={() => handleMarkAsRecovered(lez.id)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs"
                      >
                        Conferma recupero
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LIST OF ALREADY RECOVERED LESSONS */}
      {recuperateList.length > 0 && (
        <div className="flex flex-col gap-3 mt-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            LEZIONI GIÀ RECUPERATE ({recuperateList.length})
          </h5>
          <div className="flex flex-col gap-2">
            {recuperateList.map((lez) => (
              <div
                key={lez.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                    ✓
                  </span>
                  <div className="min-w-0">
                    <h6 className="font-bold text-slate-900 dark:text-white truncate">
                      {lez.title}
                    </h6>
                    <p className="text-[10px] text-slate-400">
                      Lezione del {lez.date} • Recuperata il {lez.recoveredDate || 'data registrata'}
                      {lez.recoveredNotes && ` • ${lez.recoveredNotes}`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleUndoRecovered(lez.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Annulla stato recuperato"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
