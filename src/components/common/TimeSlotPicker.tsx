import React, { useState } from 'react';
import { FASCE_ORARIE_UNIVERSITA } from '../../data/universityData';
import { Clock, Sparkles, ChevronDown } from 'lucide-react';

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
  label = 'Orario',
}) => {
  const [showPresets, setShowPresets] = useState(false);

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

  const handleQuickDuration = (hoursToAdd: number) => {
    try {
      const [h, m] = startTime.split(':').map(Number);
      const newEndH = Math.min(23, h + Math.floor(hoursToAdd));
      const newEndM = hoursToAdd % 1 !== 0 ? (m + 30) % 60 : m;
      const formattedEnd = `${String(newEndH).padStart(2, '0')}:${String(newEndM).padStart(2, '0')}`;
      onChange(startTime, formattedEnd, `${startTime} - ${formattedEnd}`);
    } catch {
      // fallback
    }
  };

  const handlePresetSelect = (presetStart: string, presetEnd: string) => {
    onChange(presetStart, presetEnd, `${presetStart} - ${presetEnd}`);
    setShowPresets(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>{label}</span>
          {duration && (
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full">
              {duration}
            </span>
          )}
        </label>

        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="text-[11px] font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
        >
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Fasce universitarie</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${showPresets ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Inputs in a clean single row with quick duration chips */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Dalle</span>
          <input
            type="time"
            value={startTime}
            onChange={(e) => handleStartChange(e.target.value)}
            className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Alle</span>
          <input
            type="time"
            value={endTime}
            onChange={(e) => handleEndChange(e.target.value)}
            className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Quick Duration Chips */}
      <div className="flex items-center gap-1.5 pt-0.5">
        <span className="text-[10px] font-semibold text-slate-400">Durata rapida:</span>
        {[
          { label: '1h', hours: 1 },
          { label: '1h 30m', hours: 1.5 },
          { label: '2h', hours: 2 },
          { label: '3h', hours: 3 },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => handleQuickDuration(item.hours)}
            className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50 dark:hover:text-blue-400 transition-colors"
          >
            +{item.label}
          </button>
        ))}
      </div>

      {/* Expandable University Presets (only if toggled) */}
      {showPresets && (
        <div className="p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 grid grid-cols-3 gap-1.5 animate-in fade-in zoom-in-95">
          {FASCE_ORARIE_UNIVERSITA.slice(0, 9).map((fascia) => {
            const isSelected = startTime === fascia.start && endTime === fascia.end;
            return (
              <button
                key={fascia.label}
                type="button"
                onClick={() => handlePresetSelect(fascia.start, fascia.end)}
                className={`px-2 py-1.5 rounded-xl text-[10px] font-bold transition-all text-center ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {fascia.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
