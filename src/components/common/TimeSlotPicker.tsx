import React from 'react';
import { FASCE_ORARIE_UNIVERSITA } from '../../data/universityData';
import { Clock, Sparkles } from 'lucide-react';

interface TimeSlotPickerProps {
  startTime: string;
  endTime: string;
  onChange: (start: string, end: string, combinedFormatted: string) => void;
  label?: string;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  startTime,
  endTime,
  onChange,
  label = 'Orario Lezione',
}) => {
  const calculateDuration = (start: string, end: string) => {
    try {
      const [startH, startM] = start.split(':').map(Number);
      const [endH, endM] = end.split(':').map(Number);
      const totalStartMin = startH * 60 + startM;
      const totalEndMin = endH * 60 + endM;
      const diffMin = totalEndMin - totalStartMin;
      if (diffMin <= 0) return null;
      const hours = Math.floor(diffMin / 60);
      const mins = diffMin % 60;
      if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
      if (hours > 0) return `${hours} ${hours === 1 ? 'ora' : 'ore'}`;
      return `${mins} min`;
    } catch {
      return null;
    }
  };

  const duration = calculateDuration(startTime, endTime);

  const handleStartChange = (newStart: string) => {
    onChange(newStart, endTime, `${newStart} - ${endTime}`);
  };

  const handleEndChange = (newEnd: string) => {
    onChange(startTime, newEnd, `${startTime} - ${newEnd}`);
  };

  const handlePresetSelect = (presetStart: string, presetEnd: string) => {
    onChange(presetStart, presetEnd, `${presetStart} - ${presetEnd}`);
  };

  return (
    <div className="flex flex-col gap-2.5 p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
      {/* Header with selected preview & duration */}
      <div className="flex items-center justify-between">
        <label className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>{label}</span>
        </label>
        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-blue-600 text-white shadow-xs">
            {startTime} - {endTime}
          </span>
          {duration && (
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
              ({duration})
            </span>
          )}
        </div>
      </div>

      {/* Time Pickers Inputs */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
            ⏰ Ora Inizio
          </span>
          <input
            type="time"
            value={startTime}
            onChange={(e) => handleStartChange(e.target.value)}
            className="w-full bg-transparent text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
            ⏰ Ora Fine
          </span>
          <input
            type="time"
            value={endTime}
            onChange={(e) => handleEndChange(e.target.value)}
            className="w-full bg-transparent text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Quick University Preset Buttons */}
      <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Fasce orarie universitarie rapide:</span>
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
          {FASCE_ORARIE_UNIVERSITA.map((fascia) => {
            const isSelected = startTime === fascia.start && endTime === fascia.end;
            return (
              <button
                key={fascia.label}
                type="button"
                onClick={() => handlePresetSelect(fascia.start, fascia.end)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs scale-102'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600'
                }`}
              >
                {fascia.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
