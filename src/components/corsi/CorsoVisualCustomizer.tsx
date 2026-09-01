import React, { useState } from 'react';
import type { Corso } from '../../types';
import {
  Palette,
  Smile,
  Image as ImageIcon,
  Check,
  X,
} from 'lucide-react';

interface CorsoVisualCustomizerProps {
  course: Corso;
  onSave: (updates: Partial<Corso>) => void;
  onClose: () => void;
}

const EMOJI_PRESETS = [
  '💻', '📐', '🧪', '⚖️', '🩺', '📚', '🔬', '🏛️',
  '📊', '🌍', '🎨', '🧠', '⚡', '⚙️', '🚀', '💡',
  '📝', '🌿', '🧬', '🏆', '🎯', '📖', '💼', '🔢',
];

const COLOR_PRESETS = [
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#059669', // Emerald
  '#ea580c', // Orange
  '#db2777', // Pink
  '#0284c7', // Sky
  '#d97706', // Amber
  '#dc2626', // Red
  '#0d9488', // Teal
  '#4f46e5', // Indigo
];

const BANNER_GRADIENT_PRESETS = [
  { id: 'grad-blue', name: 'Blu Oceano', class: 'from-blue-600 via-indigo-600 to-sky-500' },
  { id: 'grad-purple', name: 'Ametista', class: 'from-purple-600 via-fuchsia-600 to-pink-500' },
  { id: 'grad-emerald', name: 'Smeraldo', class: 'from-emerald-600 via-teal-600 to-cyan-500' },
  { id: 'grad-sunset', name: 'Tramonto', class: 'from-amber-500 via-orange-600 to-rose-600' },
  { id: 'grad-dark', name: 'Notte Fondente', class: 'from-slate-900 via-indigo-950 to-slate-800' },
  { id: 'grad-rose', name: 'Rubino', class: 'from-rose-600 via-pink-600 to-purple-600' },
];

export const CorsoVisualCustomizer: React.FC<CorsoVisualCustomizerProps> = ({
  course,
  onSave,
  onClose,
}) => {
  const [selectedColor, setSelectedColor] = useState<string>(course.color || '#2563eb');
  const [selectedEmoji, setSelectedEmoji] = useState<string>(course.emoji || '📚');
  const [selectedGradient, setSelectedGradient] = useState<string>(
    course.bannerGradient || 'from-blue-600 via-indigo-600 to-sky-500'
  );
  const [bannerUrl, setBannerUrl] = useState<string>(course.bannerUrl || '');

  const handleSave = () => {
    onSave({
      color: selectedColor,
      emoji: selectedEmoji,
      bannerGradient: selectedGradient,
      bannerUrl: bannerUrl.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Personalizza Aspetto Corso
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LIVE PREVIEW CARD */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Anteprima Scheda Corso
          </label>
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
            {/* Banner preview */}
            <div
              className={`h-16 w-full bg-linear-to-r ${selectedGradient} relative flex items-end px-4 pb-2`}
              style={
                bannerUrl
                  ? {
                      backgroundImage: `url(${bannerUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : undefined
              }
            >
              <div className="absolute inset-0 bg-black/20" />
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 shadow-lg flex items-center justify-center text-xl relative z-10 border border-white/40">
                {selectedEmoji}
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: selectedColor }}
                />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {course.name}
                </h4>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {course.code} • {course.cfu} CFU • {course.professor}
              </p>
            </div>
          </div>
        </div>

        {/* EMOJI PICKER */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Smile className="w-4 h-4 text-amber-500" />
            <span>Icona Emoji del Corso</span>
          </label>
          <div className="grid grid-cols-8 gap-2 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            {EMOJI_PRESETS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setSelectedEmoji(emoji)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                  selectedEmoji === emoji
                    ? 'bg-blue-600 text-white scale-110 shadow-xs'
                    : 'hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* COLOR PICKER */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-blue-600" />
            <span>Colore di Riconoscimento</span>
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  selectedColor === color ? 'ring-3 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              >
                {selectedColor === color && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            ))}
            {/* Custom color input */}
            <label
              className="w-7 h-7 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
              title="Scegli colore libero"
            >
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="opacity-0 w-0 h-0"
              />
              <span className="text-[10px] font-bold text-slate-500">+</span>
            </label>
          </div>
        </div>

        {/* BANNER PRESETS / IMAGE URL */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-purple-500" />
            <span>Banner Copertina</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {BANNER_GRADIENT_PRESETS.map((grad) => (
              <button
                key={grad.id}
                type="button"
                onClick={() => {
                  setSelectedGradient(grad.class);
                  setBannerUrl('');
                }}
                className={`h-9 rounded-xl bg-linear-to-r ${grad.class} flex items-center justify-center text-[10px] font-bold text-white shadow-xs transition-all ${
                  selectedGradient === grad.class && !bannerUrl
                    ? 'ring-2 ring-blue-500 scale-102 font-extrabold'
                    : 'opacity-80 hover:opacity-100'
                }`}
              >
                {grad.name}
              </button>
            ))}
          </div>

          <input
            type="url"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder="Oppure inserisci URL immagine personalizzata (https://...)"
            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
          >
            Salva personalizzazione
          </button>
        </div>
      </div>
    </div>
  );
};
