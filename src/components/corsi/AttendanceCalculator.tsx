import React, { useState } from 'react';
import type { Corso, Lezione, AttendanceStatus } from '../../types';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Settings2,
  Award,
} from 'lucide-react';

interface AttendanceCalculatorProps {
  course: Corso;
  onUpdateCourse: (updates: Partial<Corso>) => void;
  onUpdateLezione: (lezioneId: string, updates: Partial<Lezione>) => void;
}

export const AttendanceCalculator: React.FC<AttendanceCalculatorProps> = ({
  course,
  onUpdateCourse,
  onUpdateLezione,
}) => {
  const [isConfiguring, setIsConfiguring] = useState<boolean>(false);
  const [isMandatory, setIsMandatory] = useState<boolean>(course.attendanceMandatory ?? false);
  const [minPercentage, setMinPercentage] = useState<number>(course.minAttendancePercentage ?? 75);
  const [startDate, setStartDate] = useState<string>(course.startDate || '');
  const [endDate, setEndDate] = useState<string>(course.endDate || '');

  const lezioni = course.lezioni || [];
  const totalLezioni = lezioni.length;

  // Counts
  const presentiCount = lezioni.filter((l) => l.attendance === 'presente').length;
  const assentiCount = lezioni.filter((l) => l.attendance === 'assente').length;
  const nonRegistrateCount = lezioni.filter(
    (l) => !l.attendance || l.attendance === 'non_registrata'
  ).length;

  // Recorded count (only considering lessons that have been marked)
  const recordedCount = presentiCount + assentiCount;
  const currentAttendancePct =
    recordedCount > 0 ? Math.round((presentiCount / recordedCount) * 100) : 100;

  // Projected attendance if total lessons known
  const projectedMaxAbsences =
    totalLezioni > 0
      ? Math.floor(totalLezioni * (1 - (minPercentage / 100)))
      : 0;
  const remainingAllowedAbsences = Math.max(0, projectedMaxAbsences - assentiCount);
  const isOverAbsenceLimit = assentiCount > projectedMaxAbsences && totalLezioni > 0;

  const isSatisfied = currentAttendancePct >= minPercentage;

  const handleSaveConfig = () => {
    onUpdateCourse({
      attendanceMandatory: isMandatory,
      minAttendancePercentage: minPercentage,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    setIsConfiguring(false);
  };

  const handleToggleAttendance = (lezione: Lezione, newStatus: AttendanceStatus) => {
    const isAbsence = newStatus === 'assente';
    onUpdateLezione(lezione.id, {
      attendance: newStatus,
      attendanceRecordedAt: new Date().toISOString().split('T')[0],
      // If marked absent, suggest/flag for recovery
      status: isAbsence ? 'da_recuperare' : (lezione.status === 'da_recuperare' ? 'svolta' : lezione.status),
      recovered: isAbsence ? false : lezione.recovered,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* TOP NOTION-STYLE BANNER / STATS CARD */}
      <div className="p-6 rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl border border-slate-700/60 relative overflow-hidden">
        {/* Ambient background glow */}
        <div
          className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{ backgroundColor: course.color || '#2563eb' }}
        />

        <div className="flex items-start justify-between gap-4 flex-wrap relative z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-widest font-extrabold text-blue-400">
                CALCOLATORE FREQUENZA & PRESENZE
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  course.attendanceMandatory
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-700/60 text-slate-300'
                }`}
              >
                {course.attendanceMandatory
                  ? `Frequenza Obbligatoria (Min. ${course.minAttendancePercentage || 75}%)`
                  : 'Frequenza Facoltativa'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">{course.name}</h3>
            {(course.startDate || course.endDate) && (
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>
                  Periodo lezioni: {course.startDate || 'Inizio'} → {course.endDate || 'Fine'}
                </span>
              </p>
            )}
          </div>

          <button
            onClick={() => setIsConfiguring(!isConfiguring)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors border border-white/10"
          >
            <Settings2 className="w-4 h-4" />
            <span>{isConfiguring ? 'Chiudi impostazioni' : 'Configura parametri'}</span>
          </button>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 relative z-10">
          {/* Metric 1: Attendance % */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col justify-between">
            <span className="text-[11px] text-slate-300 font-semibold">Tasso di presenza</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-2xl sm:text-3xl font-extrabold ${
                  !course.attendanceMandatory
                    ? 'text-blue-400'
                    : isSatisfied
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }`}
              >
                {recordedCount > 0 ? `${currentAttendancePct}%` : '100%'}
              </span>
              {course.attendanceMandatory && (
                <span className="text-[10px] text-slate-400 font-bold">
                  / {course.minAttendancePercentage || 75}% min
                </span>
              )}
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  !course.attendanceMandatory
                    ? 'bg-blue-500'
                    : isSatisfied
                    ? 'bg-emerald-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, currentAttendancePct)}%` }}
              />
            </div>
          </div>

          {/* Metric 2: Presenti */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-emerald-300 font-semibold">Presenze effettuate</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-2xl font-extrabold text-emerald-400 mt-1">
              {presentiCount}
              <span className="text-xs font-semibold text-emerald-200/70 ml-1">
                / {totalLezioni} lezioni
              </span>
            </h4>
            <span className="text-[10px] text-emerald-300/80 font-medium">Registrate con successo</span>
          </div>

          {/* Metric 3: Assenze */}
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-red-300 font-semibold">Assenze registrate</span>
              <XCircle className="w-4 h-4 text-red-400" />
            </div>
            <h4 className="text-2xl font-extrabold text-red-400 mt-1">
              {assentiCount}
              <span className="text-xs font-semibold text-red-200/70 ml-1">
                {assentiCount === 1 ? 'lezione' : 'lezioni'}
              </span>
            </h4>
            <span className="text-[10px] text-red-300/80 font-medium">
              {course.attendanceMandatory
                ? `Max consentite: ${projectedMaxAbsences}`
                : 'Tracciamento statistico'}
            </span>
          </div>

          {/* Metric 4: Status / Assenze residue */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col justify-between">
            <span className="text-[11px] text-slate-300 font-semibold">Stato frequenza</span>
            <div>
              {course.attendanceMandatory ? (
                isOverAbsenceLimit ? (
                  <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs mt-1">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Soglia superata!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs mt-1">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Soglia rispettata ({remainingAllowedAbsences} assenze rimaste)</span>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs mt-1">
                  <Award className="w-4 h-4 shrink-0" />
                  <span>Nessuna soglia vincolante</span>
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-1">
              {nonRegistrateCount > 0
                ? `${nonRegistrateCount} lezioni ancora da registrare`
                : 'Tutte le lezioni registrate'}
            </span>
          </div>
        </div>
      </div>

      {/* CONFIGURATION DRAWER */}
      {isConfiguring && (
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col gap-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-blue-600" />
              <span>Parametri Frequenza Corso</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Mandatory Toggle */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Frequenza Obbligatoria
              </label>
              <div className="flex items-center gap-3 h-10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMandatory}
                    onChange={(e) => setIsMandatory(e.target.checked)}
                    className="w-5 h-5 rounded text-blue-600"
                  />
                  <span className="font-bold text-slate-900 dark:text-white">
                    {isMandatory ? 'Obbligatoria' : 'Facoltativa'}
                  </span>
                </label>
              </div>
            </div>

            {/* Min % Slider/Input */}
            {isMandatory && (
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Percentuale Minima: <strong className="text-blue-600">{minPercentage}%</strong>
                </label>
                <input
                  type="range"
                  min={50}
                  max={100}
                  step={5}
                  value={minPercentage}
                  onChange={(e) => setMinPercentage(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer mt-3"
                />
              </div>
            )}

            {/* Start Date */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Data Inizio Lezioni
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Data Fine Lezioni
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsConfiguring(false)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold"
            >
              Annulla
            </button>
            <button
              onClick={handleSaveConfig}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
            >
              Salva parametri
            </button>
          </div>
        </div>
      )}

      {/* QUICK ATTENDANCE TOGGLE LIST FOR LEZIONI */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Registro Presenze per Lezione ({lezioni.length})
          </h4>
          <span className="text-xs text-slate-400 font-medium">
            Clicca sui pulsanti per segnare presenza o assenza
          </span>
        </div>

        {lezioni.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 text-xs">
            Nessuna lezione registrata in questo corso. Aggiungi lezioni per calcolare le presenze.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {lezioni.map((lez) => {
              const status = lez.attendance || 'non_registrata';

              return (
                <div
                  key={lez.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                      #{lez.number}
                    </span>
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {lez.title}
                      </h5>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {lez.date} • {lez.time} • {lez.room || 'Aula da definire'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleAttendance(lez, 'presente')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        status === 'presente'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Presente</span>
                    </button>

                    <button
                      onClick={() => handleToggleAttendance(lez, 'assente')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        status === 'assente'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Assente</span>
                    </button>

                    {status !== 'non_registrata' && (
                      <button
                        onClick={() => handleToggleAttendance(lez, 'non_registrata')}
                        className="px-2 py-1.5 rounded-xl text-[10px] text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Reimposta non registrata"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
