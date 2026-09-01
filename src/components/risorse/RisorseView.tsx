import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import type { ResourceType, Risorsa } from '../../types';
import { ResourceViewerModal } from './ResourceViewerModal';
import { storeFile } from '../../utils/fileStorage';
import {
  Archive,
  Search,
  Plus,
  Upload,
  FileText,
  Presentation,
  Link2,
  Video,
  Mic,
  FileSpreadsheet,
  Dumbbell,
  Star,
  HardDrive,
  X,
  Trash2,
  ExternalLink,
  FolderOpen,
  Eye,
} from 'lucide-react';

export const RisorseView: React.FC = () => {
  const { corsi, risorse, toggleFavoriteResource, addRisorsa, deleteRisorsa } = useApp();
  const [selectedType, setSelectedType] = useState<string>('Tutti');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('Tutti');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Modals state
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [viewingResource, setViewingResource] = useState<Risorsa | null>(null);

  // Hidden file input ref for native file uploads
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state for manual resource / link addition
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ResourceType>('PDF');
  const [newCourse, setNewCourse] = useState('Risorsa Generale (Tutti i corsi)');
  const [newUrl, setNewUrl] = useState('');
  const [newSize, setNewSize] = useState('');
  const [selectedUploadedFile, setSelectedUploadedFile] = useState<File | null>(null);

  // Helper to get matching icon
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
      default:
        return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  // Helper to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  // Helper to guess resource type from filename extension
  const guessTypeFromFileName = (fileName: string): ResourceType => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'PDF';
    if (['ppt', 'pptx', 'key', 'odp'].includes(ext || '')) return 'Slide';
    if (['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(ext || '')) return 'Video';
    if (['mp3', 'wav', 'm4a', 'aac', 'ogg'].includes(ext || '')) return 'Registrazione';
    if (['xlsx', 'xls', 'csv', 'ods'].includes(ext || '')) return 'Formulario';
    if (['doc', 'docx', 'txt', 'md'].includes(ext || '')) return 'Esercizio';
    return 'PDF';
  };

  // Handle native file selection directly from toolbar
  const handleNativeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const today = new Date().toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const targetCourse = selectedCourseFilter !== 'Tutti' ? selectedCourseFilter : 'Risorsa Generale (Tutti i corsi)';

    for (const file of Array.from(files)) {
      const detectedType = guessTypeFromFileName(file.name);
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      try {
        await storeFile(fileId, file, file.name);
      } catch (err) {
        console.error('Error saving to IndexedDB:', err);
      }

      addRisorsa({
        title: file.name.replace(/\.[^/.]+$/, ''),
        type: detectedType,
        size: formatFileSize(file.size),
        uploadDate: today,
        courseName: targetCourse,
        isFavorite: false,
        openCount: 0,
        fileName: file.name,
        mimeType: file.type,
        fileId: fileId,
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle manual form submission with optional file upload or link
  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const today = new Date().toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    let generatedFileId: string | undefined = undefined;
    let computedSize = newSize.trim();

    if (selectedUploadedFile) {
      generatedFileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      computedSize = formatFileSize(selectedUploadedFile.size);
      try {
        await storeFile(generatedFileId, selectedUploadedFile, selectedUploadedFile.name);
      } catch (err) {
        console.error('Error storing file in IndexedDB:', err);
      }
    }

    addRisorsa({
      title: newTitle.trim(),
      type: newType,
      size: computedSize || (newType === 'Link' ? 'Link web' : 'File'),
      uploadDate: today,
      courseName: newCourse || 'Risorsa Generale (Tutti i corsi)',
      isFavorite: false,
      url: newUrl.trim() || undefined,
      fileId: generatedFileId,
      fileName: selectedUploadedFile?.name,
      mimeType: selectedUploadedFile?.type,
      openCount: 0,
    });

    setIsAddingResource(false);
    setNewTitle('');
    setNewUrl('');
    setNewSize('');
    setSelectedUploadedFile(null);
  };

  // Dynamic category definitions
  const categoryDefinitions: {
    type: ResourceType;
    label: string;
    icon: React.FC<{ className?: string }>;
    color: string;
  }[] = [
    { type: 'PDF', label: 'PDF', icon: FileText, color: 'text-red-500 bg-red-50 dark:bg-red-950/40' },
    { type: 'Slide', label: 'Slide', icon: Presentation, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
    { type: 'Link', label: 'Link', icon: Link2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
    { type: 'Video', label: 'Video', icon: Video, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40' },
    { type: 'Registrazione', label: 'Registrazioni', icon: Mic, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
    { type: 'Formulario', label: 'Formulari', icon: FileSpreadsheet, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/40' },
    { type: 'Esercizio', label: 'Esercizi', icon: Dumbbell, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' },
  ];

  // List of course options including "Risorsa Generale"
  const courseOptions = Array.from(
    new Set([
      'Risorsa Generale (Tutti i corsi)',
      ...corsi.map((c) => c.name),
      ...risorse.map((r) => r.courseName),
    ])
  ).filter(Boolean);

  // Filtered resources
  const filteredRisorse = risorse.filter((r) => {
    if (selectedType !== 'Tutti' && r.type !== selectedType) return false;
    if (selectedCourseFilter !== 'Tutti' && r.courseName !== selectedCourseFilter) return false;
    if (searchFilter && !r.title.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    return true;
  });

  const favoritesList = risorse.filter((r) => r.isFavorite);
  const recentList = [...risorse].slice(-4).reverse();

  // Storage calculation
  const calculateTotalMB = (): number => {
    let totalMB = 0;
    risorse.forEach((r) => {
      if (!r.size) return;
      const sizeStr = r.size.toUpperCase();
      if (sizeStr.includes('MB')) {
        const val = parseFloat(sizeStr.replace('MB', '').trim());
        if (!isNaN(val)) totalMB += val;
      } else if (sizeStr.includes('KB')) {
        const val = parseFloat(sizeStr.replace('KB', '').trim());
        if (!isNaN(val)) totalMB += val / 1024;
      } else if (sizeStr.includes('GB')) {
        const val = parseFloat(sizeStr.replace('GB', '').trim());
        if (!isNaN(val)) totalMB += val * 1024;
      }
    });
    return totalMB;
  };

  const totalUsedMB = calculateTotalMB();
  const totalLimitMB = 10 * 1024; // 10 GB limit
  const usedPercent = Math.min(100, (totalUsedMB / totalLimitMB) * 100);

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-8">
      {/* Hidden file input for native uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleNativeFileUpload}
        multiple
        className="hidden"
      />

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
              Organizza, carica file PDF/slide per ciascun corso e visualizzali direttamente nell'app.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddingResource(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Aggiungi risorsa / Link</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Carica file dal PC</span>
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
              placeholder="Cerca risorse per titolo..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Filter by Course */}
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="Tutti">Tutti i corsi / Generali</option>
              {courseOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Filter by Type */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="Tutti">Tutti i tipi</option>
              {categoryDefinitions.map((cat) => (
                <option key={cat.type} value={cat.type}>
                  {cat.label} ({risorse.filter((r) => r.type === cat.type).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 7 Resource Category Count Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {categoryDefinitions.map((cat) => {
            const Icon = cat.icon;
            const realCount = risorse.filter((r) => r.type === cat.type).length;
            const isSelected = selectedType === cat.type;

            return (
              <button
                key={cat.type}
                onClick={() => setSelectedType(isSelected ? 'Tutti' : cat.type)}
                className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-1.5 text-center cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl ${cat.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {cat.label}
                </span>
                <span
                  className={`text-[10px] font-bold ${
                    realCount > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                  }`}
                >
                  {realCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Resource List / Real Data Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              {selectedType === 'Tutti' ? 'Tutte le risorse' : `Risorse: ${selectedType}`}
            </h4>
            <span className="text-xs text-slate-400 font-medium">
              Mostra {filteredRisorse.length} di {risorse.length} {risorse.length === 1 ? 'risorsa' : 'risorse'}
            </span>
          </div>

          {filteredRisorse.length === 0 ? (
            <div className="py-12 px-4 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <FolderOpen className="w-7 h-7" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                  {searchFilter || selectedType !== 'Tutti' || selectedCourseFilter !== 'Tutti'
                    ? 'Nessuna risorsa trovata per i filtri selezionati'
                    : 'Nessuna risorsa ancora caricata'}
                </h5>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Carica dispense, slide, PDF o link web per averli sempre disponibili con il visualizzatore integrato.
                </p>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xs hover:bg-blue-700 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Carica file dal computer</span>
                </button>
                <button
                  onClick={() => setIsAddingResource(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Aggiungi link / risorsa</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRisorse.map((res) => (
                <div
                  key={res.id}
                  className="py-3 flex items-center justify-between gap-4 group hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      {getResourceTypeIcon(res.type)}
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
                        {res.title}
                      </h5>
                      <p className="text-[10px] text-slate-400">
                        {res.type} • {res.size || 'Link web'} • Caricato il {res.uploadDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Course Badge */}
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold max-w-[140px] truncate">
                      {res.courseName}
                    </span>

                    {/* OPEN / VIEW BUTTON */}
                    <button
                      onClick={() => setViewingResource(res)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                      title="Apri e visualizza risorsa"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Apri</span>
                    </button>

                    {res.url && (
                      <a
                        href={res.url.startsWith('http') ? res.url : `https://${res.url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                        title="Apri link in nuova scheda"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      onClick={() => toggleFavoriteResource(res.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 transition-colors"
                      title={res.isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          res.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>

                    <button
                      onClick={() => deleteRisorsa(res.id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Elimina risorsa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
            <span className="text-[10px] font-bold text-blue-600">{recentList.length}</span>
          </div>

          {recentList.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">Nessun caricamento recente.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {recentList.map((res) => (
                <div
                  key={res.id}
                  onClick={() => setViewingResource(res)}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs cursor-pointer hover:border-blue-500 transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {getResourceTypeIcon(res.type)}
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white text-[11px] truncate max-w-[130px]">
                        {res.title}
                      </p>
                      <span className="text-[9px] text-slate-400 block truncate">{res.courseName}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 text-[9px] font-bold shrink-0">
                    {res.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Risorse preferite */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              RISORSE PREFERITE
            </h4>
            <span className="text-[10px] font-bold text-amber-600">{favoritesList.length}</span>
          </div>

          {favoritesList.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">
              Nessuna risorsa nei preferiti. Clicca sulla stella ⭐ per aggiungerla.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {favoritesList.slice(0, 5).map((res) => (
                <div
                  key={res.id}
                  onClick={() => setViewingResource(res)}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs cursor-pointer hover:border-amber-400 transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {getResourceTypeIcon(res.type)}
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white text-[11px] truncate max-w-[130px]">
                        {res.title}
                      </p>
                      <span className="text-[9px] text-slate-400 block truncate">{res.courseName}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 text-[9px] font-bold shrink-0">
                    {res.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Spazio Utilizzato Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Spazio utilizzato</h4>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">{risorse.length} file</span>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>
                {totalUsedMB > 1024
                  ? `${(totalUsedMB / 1024).toFixed(2)} GB`
                  : `${totalUsedMB.toFixed(1)} MB`}{' '}
                di 10 GB
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-extrabold">
                {usedPercent > 0 && usedPercent < 0.1 ? '<0.1%' : `${usedPercent.toFixed(1)}%`}
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(usedPercent, totalUsedMB > 0 ? 2 : 0)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal Aggiungi Risorsa / File / Link */}
      {isAddingResource && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nuova Risorsa</h3>
              <button
                onClick={() => setIsAddingResource(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Titolo risorsa *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Es. Slide Lezione 4 - Derivate"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* SELEZIONE CORSO ESPLICITA */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Associa al Corso *
                </label>
                <select
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none"
                >
                  <option value="Risorsa Generale (Tutti i corsi)">
                    🌐 Risorsa Generale (Tutti i corsi)
                  </option>
                  {corsi.map((c) => (
                    <option key={c.id} value={c.name}>
                      📚 {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Tipo di Risorsa
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as ResourceType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
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

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {newType === 'Link' ? 'Tipo Link' : 'Dimensione / Info'}
                  </label>
                  <input
                    type="text"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    placeholder={newType === 'Link' ? 'Link web' : 'Es. 2.4 MB'}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* URL OR FILE UPLOAD */}
              {newType === 'Link' ? (
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    URL Link *
                  </label>
                  <input
                    type="url"
                    required
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              ) : (
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Carica file da visualizzare (PDF, slide, immagini, ecc.)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedUploadedFile(file);
                        if (!newTitle) {
                          setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
                        }
                        setNewType(guessTypeFromFileName(file.name));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingResource(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
                >
                  Salva risorsa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOURCE VIEWER MODAL */}
      {viewingResource && (
        <ResourceViewerModal
          resource={viewingResource}
          onClose={() => setViewingResource(null)}
        />
      )}
    </div>
  );
};
