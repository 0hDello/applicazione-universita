import React, { useState, useEffect } from 'react';
import type { Risorsa } from '../../types';
import { getStoredFile } from '../../utils/fileStorage';
import {
  X,
  Download,
  ExternalLink,
  FileText,
  Presentation,
  Link2,
  Video,
  Mic,
  FileSpreadsheet,
  Dumbbell,
  Maximize2,
  Minimize2,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface ResourceViewerModalProps {
  resource: Risorsa;
  onClose: () => void;
}

export const ResourceViewerModal: React.FC<ResourceViewerModalProps> = ({
  resource,
  onClose,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    let currentUrl: string | null = null;

    const loadResourceContent = async () => {
      setLoading(true);
      setError(null);

      try {
        if (resource.fileId) {
          const blob = await getStoredFile(resource.fileId);
          if (blob) {
            currentUrl = URL.createObjectURL(blob);
            setBlobUrl(currentUrl);
            setLoading(false);
            return;
          }
        }

        if (resource.fileData) {
          setBlobUrl(resource.fileData);
          setLoading(false);
          return;
        }

        if (resource.url) {
          setBlobUrl(resource.url.startsWith('http') ? resource.url : `https://${resource.url}`);
          setLoading(false);
          return;
        }

        // If no file data or URL exists
        setLoading(false);
      } catch (err) {
        console.error('Error loading resource preview:', err);
        setError('Impossibile caricare l\'anteprima del file.');
        setLoading(false);
      }
    };

    loadResourceContent();

    return () => {
      if (currentUrl && currentUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [resource]);

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = resource.fileName || `${resource.title}.${resource.type.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const getResourceTypeIcon = () => {
    switch (resource.type) {
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

  const isPdf = resource.type === 'PDF' || resource.fileName?.toLowerCase().endsWith('.pdf') || (blobUrl && blobUrl.includes('application/pdf'));
  const isImage = resource.fileName?.match(/\.(png|jpe?g|gif|webp|svg)$/i) || resource.fileData?.startsWith('data:image/');
  const isVideo = resource.type === 'Video' || resource.fileName?.match(/\.(mp4|webm|ogg|mov)$/i);
  const isAudio = resource.type === 'Registrazione' || resource.fileName?.match(/\.(mp3|wav|m4a|aac)$/i);
  const isWebLink = resource.type === 'Link' || (resource.url && !resource.fileData && !resource.fileId);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div
        className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-all duration-300 ${
          isFullscreen ? 'w-full h-full rounded-none' : 'max-w-5xl w-full h-[88vh]'
        }`}
      >
        {/* HEADER BAR */}
        <div className="p-4 sm:px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-xs">
              {getResourceTypeIcon()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                  {resource.title}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
                  {resource.courseName}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                {resource.type} • {resource.size || 'Documento'} • Caricato il {resource.uploadDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {blobUrl && !isWebLink && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xs hover:bg-blue-700 transition-colors"
                title="Scarica file"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Scarica</span>
              </button>
            )}

            {isWebLink && resource.url && (
              <a
                href={resource.url.startsWith('http') ? resource.url : `https://${resource.url}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xs hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Apri link</span>
              </a>
            )}

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isFullscreen ? 'Riduci' : 'Schermo intero'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Chiudi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MAIN VIEWER AREA */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-950/60 p-2 sm:p-4 overflow-auto flex items-center justify-center relative">
          {loading && (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-xs font-medium">Caricamento risorsa in corso...</span>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center gap-3 text-slate-400 max-w-sm text-center p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <AlertCircle className="w-10 h-10 text-amber-500" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{error}</h4>
              <p className="text-xs text-slate-400">
                Se il file è stato salvato su storage esterno, assicurati di avere i permessi di lettura.
              </p>
            </div>
          )}

          {!loading && !error && isPdf && blobUrl && (
            <iframe
              src={blobUrl}
              title={resource.title}
              className="w-full h-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner bg-white"
            />
          )}

          {!loading && !error && isImage && blobUrl && (
            <div className="max-w-full max-h-full flex items-center justify-center p-4">
              <img
                src={blobUrl}
                alt={resource.title}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800"
              />
            </div>
          )}

          {!loading && !error && isVideo && blobUrl && (
            <video
              src={blobUrl}
              controls
              autoPlay
              className="max-w-full max-h-[75vh] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 bg-black"
            />
          )}

          {!loading && !error && isAudio && blobUrl && (
            <div className="flex flex-col items-center gap-6 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full text-center">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                <Mic className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{resource.title}</h4>
                <span className="text-xs text-slate-400">{resource.courseName}</span>
              </div>
              <audio src={blobUrl} controls className="w-full" />
            </div>
          )}

          {!loading && !error && isWebLink && (
            <div className="flex flex-col items-center gap-4 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <Link2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{resource.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{resource.url || 'Link web esterno'}</p>
              </div>
              <a
                href={resource.url?.startsWith('http') ? resource.url : `https://${resource.url}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
              >
                <span>Visita la risorsa online</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {!loading && !error && !isPdf && !isImage && !isVideo && !isAudio && !isWebLink && (
            <div className="flex flex-col items-center gap-4 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{resource.title}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Formato: {resource.type} • {resource.size || 'File'}
                </p>
              </div>
              {blobUrl ? (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Scarica e apri sul computer</span>
                </button>
              ) : (
                <p className="text-xs text-slate-400">File informativo registrato.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
