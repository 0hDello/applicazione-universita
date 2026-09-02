import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { CalendarioView } from './components/calendario/CalendarioView';
import { CorsiView } from './components/corsi/CorsiView';
import { EsamiView } from './components/esami/EsamiView';
import { CompitiView } from './components/compiti/CompitiView';
import { StatisticheView } from './components/statistiche/StatisticheView';
import { RisorseView } from './components/risorse/RisorseView';
import { ObiettiviView } from './components/obiettivi/ObiettiviView';
import { ImpostazioniView } from './components/impostazioni/ImpostazioniView';

const MainContent: React.FC = () => {
  const { currentView } = useApp();

  const renderView = () => {
    switch (currentView) {
      case 'calendario':
        return <CalendarioView />;
      case 'corsi':
        return <CorsiView />;
      case 'esami':
        return <EsamiView />;
      case 'compiti':
        return <CompitiView />;
      case 'statistiche':
        return <StatisticheView />;
      case 'risorse':
        return <RisorseView />;
      case 'obiettivi':
        return <ObiettiviView />;
      case 'impostazioni':
        return <ImpostazioniView />;
      default:
        return <CalendarioView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-black font-sans text-slate-900 dark:text-slate-100 transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1">{renderView()}</main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
