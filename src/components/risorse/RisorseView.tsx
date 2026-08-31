import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { ResourceType } from '../../types';
import {
  Archive,
  Search,
  Plus,
  Upload,
  SlidersHorizontal,
  FileText,
  Presentation,
  Link2,
  Video,
  Mic,
  FileSpreadsheet,
  Dumbbell,
  Star,
  MoreVertical,
  HardDrive,
  X,
} from 'lucide-react';

export const RisorseView: React.FC = () => {
  const { corsi, risorse, toggleFavoriteResource, addRisorsa } = useApp();
  const [selectedType, setSelectedType] = useState<string>('Tutti');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('Tutti');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isAddingResource, setIsAddingResource] = useState(false);

  // New resource state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ResourceType>('PDF');
  const [newCourse, setNewCourse] = useState('');
  const [newSize, setNewSize] = useState('1.5 MB');

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    addRisorsa({
      title: newTitle,
      type: newType,
      size: newSize,
      uploadDate: 'Oggi',
      courseName: newCourse,
      isFavorite: false,
      openCount: 1,
    });
    setIsAddingResource(false);
    setNewTitle('');
  };

  const getResourceTypeIcon = (type: ResourceType) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'Slide':
        return <Presentation className="w-5 h-5 text-amber-500" />;
      case 'Link':
        return <Link2 className="w-5 h-5 text-emerald-500" />;
      case 'Video':
        return <Video className="w-5 h-5 text-purple-500" />;
      case 'Registrazione':
        return <Mic className="w-5 h-5 text-blue-500" />;
      case 'Formulario':
        return <FileSpreadsheet className="w-5 h-5 text-teal-500" />;
      case 'Esercizio':
        return <Dumbbell className="w-5 h-5 text-indigo-500" />;
    }
  };

  const resourceCategories = [
    { type: 'PDF', count: 128, icon: FileText, color: 'text-red-500 bg-red-50' },
    { type: 'Slide', count: 86, icon: Presentation, color: 'text-amber-500 bg-amber-50' },
    { type: 'Link', count: 54, icon: Link2, color: 'text-emerald-500 bg-emerald-50' },
    { type: 'Video', count: 32, icon: Video, color: 'text-purple-500 bg-purple-50' },
    { type: 'Registrazioni', count: 27, icon: Mic, color: 'text-blue-500 bg-blue-50' },
    { type: 'Formulari', count: 18, icon: FileSpreadsheet, color: 'text-teal-500 bg-teal-50' },
    { type: 'Esercizi', count: 64, icon: Dumbbell, color: 'text-indigo-500 bg-indigo-50' },
  ];

  const filteredRisorse = risorse.filter((r) => {
    if (selectedType !== 'Tutti' && r.type !== selectedType) return false;
    if (selectedCourseFilter !== 'Tutti' && r.courseName !== selectedCourseFilter) return false;
    if (searchFilter && !r.title.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    return true;
  });

  const favoritesList = risorse.filter((r) => r.isFavorite);

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-8">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Title Header & Main Actions */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Archive className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Libreria Risorse</h2>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Organizza e accedi facilmente a tutti i materiali utili per i tuoi studi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddingResource(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200"
            >
              <Plus className="w-4 h-4" />
              <span>Aggiungi risorsa</span>
            </button>
            <button
              onClick={() => setIsAddingResource(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-600/20 hover:bg-blue-700"
            >
              <Upload className="w-4 h-4" />
              <span>Carica file</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center justify-between flex-wrap gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Cerca risorse..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="Tutti">Tutti i corsi</option>
              <option value="Analisi Matematica I">Analisi Matematica I</option>
              <option value="Fisica Generale I">Fisica Generale I</option>
              <option value="Chimica Generale">Chimica Generale</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="Tutti">Tutti i tipi</option>
              <option value="PDF">PDF</option>
              <option value="Slide">Slide</option>
              <option value="Link">Link</option>
              <option value="Video">Video</option>
              <option value="Registrazione">Registrazione</option>
              <option value="Formulario">Formulario</option>
            </select>

            <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtri</span>
            </button>
          </div>
        </div>

        {/* 7 Resource Category Count Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {resourceCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.type}
                onClick={() => setSelectedType(selectedType === cat.type ? 'Tutti' : cat.type)}
                className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-1.5 text-center ${
                  selectedType === cat.type
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl ${cat.color} dark:bg-slate-800 flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {cat.type}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">{cat.count}</span>
              </button>
            );
          })}
        </div>

        {/* Main Resource List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Tutte le risorse</h4>
            <span className="text-xs text-slate-400">Mostra 1–{filteredRisorse.length} di 409 risorse</span>
          </div>

          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {filteredRisorse.map((res) => (
              <div
                key={res.id}
                className="py-3 flex items-center justify-between gap-4 group hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {getResourceTypeIcon(res.type)}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {res.title}
                    </h5>
                    <p className="text-[10px] text-slate-400">
                      {res.type} • {res.size || 'Link web'} • Caricato il {res.uploadDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                    {res.courseName}
                  </span>

                  <button
                    onClick={() => toggleFavoriteResource(res.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-amber-500 transition-colors"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        res.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>

                  <button className="p-1 rounded-lg text-slate-300 hover:text-slate-600 dark:hover:text-slate-200">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar Widgets Panel */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        {/* Caricamenti recenti */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              CARICAMENTI RECENTI
            </h4>
            <button className="text-xs font-bold text-blue-600 hover:underline">Vedi tutti</button>
          </div>

          <div className="flex flex-col gap-2.5 text-xs text-slate-500">
            Nessun caricamento recente.
          </div>
        </div>

        {/* Risorse preferite */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              RISORSE PREFERITE
            </h4>
            <button className="text-xs font-bold text-blue-600 hover:underline">Vedi tutti</button>
          </div>

          <div className="flex flex-col gap-2">
            {favoritesList.slice(0, 4).map((res) => (
              <div
                key={res.id}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  {getResourceTypeIcon(res.type)}
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-[11px] truncate max-w-[140px]">
                      {res.title}
                    </p>
                    <span className="text-[9px] text-slate-400">{res.courseName}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 text-[9px] font-bold">
                  {res.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Spazio Utilizzato Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Spazio utilizzato</h4>
            </div>
            <button className="text-[10px] font-bold text-blue-600 hover:underline">Gestisci spazio</button>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              <span>0 GB di 10 GB utilizzati</span>
              <span className="text-blue-600">0%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full w-[0%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Modal Aggiungi Risorsa */}
      {isAddingResource && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nuova Risorsa</h3>
              <button onClick={() => setIsAddingResource(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nome risorsa</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Es. Formulario Integrali"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tipo</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as ResourceType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="PDF">PDF</option>
                    <option value="Slide">Slide</option>
                    <option value="Link">Link</option>
                    <option value="Video">Video</option>
                    <option value="Registrazione">Registrazione</option>
                    <option value="Formulario">Formulario</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Corso</label>
                  <select
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="">Seleziona corso...</option>
                    {corsi.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Dimensione o URL</label>
                <input
                  type="text"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  placeholder="Es. 2.4 MB o https://..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

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
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20 hover:bg-blue-700"
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
