import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Warehouse, 
  BarChart3, 
  AlertTriangle, 
  FileText, 
  PlusCircle, 
  HardDrive, 
  HelpCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { OperationalAlert } from '../types';

export type NavTab = 'docas' | 'veiculos' | 'kpis' | 'analise' | 'relatorio';

export interface NavbarProps {
  activeTab: NavTab;
  onSelectTab?: (tab: NavTab) => void;
  setActiveTab?: (tab: NavTab) => void;
  onOpenNewVehicle: () => void;
  onOpenStorage: () => void;
  onOpenGuide: () => void;
  alerts?: OperationalAlert[];
  waitingVehiclesCount?: number;
  occupiedDocksCount?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  setActiveTab,
  onOpenNewVehicle,
  onOpenStorage,
  onOpenGuide,
  alerts = [],
  waitingVehiclesCount,
  occupiedDocksCount,
  onRefresh,
  isRefreshing = false,
}) => {
  const switchTab = onSelectTab || setActiveTab || (() => {});
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const criticalAlerts = alerts.filter((a) => a.severity === 'danger');
  const warningAlerts = alerts.filter((a) => a.severity === 'warning');

  const systemStatus = criticalAlerts.length > 0 
    ? { label: 'Gargalo Crítico', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40' }
    : warningAlerts.length > 0
    ? { label: 'Atenção ao Fluxo', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' }
    : { label: 'Fluxo Normal', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };

  return (
    <header className="no-print sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar with system identity & status */}
        <div className="flex flex-col md:flex-row items-center justify-between py-3 gap-3 border-b border-slate-800/60">
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20">
                <Warehouse className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold tracking-tight text-white">LogiDoca</h1>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                    8 Docas
                  </span>
                </div>
                <p className="text-xs text-slate-400">Controle Operacional & Gestão de Congestionamento</p>
              </div>
            </div>

            {/* Status pill for mobile */}
            <div className={`md:hidden text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5 font-medium ${systemStatus.bg}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
              {systemStatus.label}
            </div>
          </div>

          {/* Quick operational metrics & current time */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end text-xs">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-mono font-semibold">
                {currentTime.toLocaleTimeString('pt-BR')}
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">
                {currentTime.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </span>
            </div>

            <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${systemStatus.bg}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
              {systemStatus.label}
            </div>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Atualizar dados operacionais"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            </button>

            <button
              onClick={onOpenStorage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Gerenciar persistência (Google Drive / Vercel Blob)"
            >
              <HardDrive className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Persistência</span>
            </button>

            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Guia rápido do operador"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Manual POP</span>
            </button>

            <button
              onClick={onOpenNewVehicle}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Entrada Veículo</span>
            </button>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex space-x-1 sm:space-x-2 py-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => switchTab('docas')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'docas'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Warehouse className="w-4 h-4" />
            <span>Painel das 8 Docas</span>
            {typeof occupiedDocksCount === 'number' && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-blue-500/30 text-blue-300">
                {occupiedDocksCount}/8
              </span>
            )}
          </button>

          <button
            onClick={() => switchTab('veiculos')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'veiculos'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Pátio & Fila de Veículos</span>
            {typeof waitingVehiclesCount === 'number' && waitingVehiclesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-500/30 text-amber-300">
                {waitingVehiclesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => switchTab('kpis')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'kpis'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Indicadores & Desempenho</span>
          </button>

          <button
            onClick={() => switchTab('analise')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'analise'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Gargalos & IA Logística</span>
            {alerts.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs font-mono bg-rose-500/30 text-rose-300 border border-rose-500/50">
                {alerts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => switchTab('relatorio')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'relatorio'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Relatório Imprimível</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
