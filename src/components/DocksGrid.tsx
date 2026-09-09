import React, { useState, useEffect } from 'react';
import { 
  Warehouse, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  Truck, 
  AlertCircle, 
  ArrowRightCircle, 
  Play, 
  RotateCcw,
  Sparkles,
  Filter
} from 'lucide-react';
import { Dock, Vehicle } from '../types';

interface DocksGridProps {
  docks: Dock[];
  vehicles: Vehicle[];
  onAssignDock: (dock: Dock) => void;
  onReleaseDock: (dock: Dock) => void;
  onToggleMaintenance: (dock: Dock) => void;
  onSelectVehicleToDock: (vehicleId: string, dockId: number) => void;
}

export const DocksGrid: React.FC<DocksGridProps> = ({
  docks,
  vehicles,
  onAssignDock,
  onReleaseDock,
  onToggleMaintenance,
}) => {
  const [filter, setFilter] = useState<'todos' | 'livre' | 'ocupada' | 'atrasada' | 'manutencao'>('todos');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  const waitingVehicles = vehicles.filter((v) => v.status === 'no_patio');

  // Compute stats
  const totalDocks = docks.length;
  const freeDocks = docks.filter((d) => d.status === 'livre').length;
  const occupiedDocks = docks.filter((d) => d.status === 'ocupada').length;
  const maintenanceDocks = docks.filter((d) => d.status === 'manutencao').length;

  const delayedDocks = docks.filter((d) => {
    if (d.status !== 'ocupada' || !d.occupiedAt) return false;
    const elapsedMinutes = Math.floor((now - new Date(d.occupiedAt).getTime()) / 60000);
    return elapsedMinutes > (d.estimatedMinutes || 45);
  });

  const filteredDocks = docks.filter((dock) => {
    if (filter === 'todos') return true;
    if (filter === 'livre') return dock.status === 'livre';
    if (filter === 'ocupada') return dock.status === 'ocupada';
    if (filter === 'manutencao') return dock.status === 'manutencao';
    if (filter === 'atrasada') {
      if (dock.status !== 'ocupada' || !dock.occupiedAt) return false;
      const elapsedMinutes = Math.floor((now - new Date(dock.occupiedAt).getTime()) / 60000);
      return elapsedMinutes > (dock.estimatedMinutes || 45);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top operational summary bar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Monitoramento em Tempo Real das 8 Docas</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Piso Operacional
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Controle de status, alocação de veículos e acompanhamento do tempo de permanência contra o SLA.
            </p>
          </div>

          {/* Metric cards inline */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-auto">
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-700/50 flex flex-col">
              <span className="text-[11px] font-medium text-slate-400">Docas Livres</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-lg font-extrabold text-emerald-400">{freeDocks}</span>
                <span className="text-xs text-slate-500">/ {totalDocks}</span>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-700/50 flex flex-col">
              <span className="text-[11px] font-medium text-slate-400">Em Operação</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-lg font-extrabold text-blue-400">{occupiedDocks}</span>
                <span className="text-xs text-slate-500">docas</span>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-700/50 flex flex-col">
              <span className="text-[11px] font-medium text-slate-400">Em Atraso</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2.5 h-2.5 rounded-full ${delayedDocks.length > 0 ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`}></span>
                <span className={`text-lg font-extrabold ${delayedDocks.length > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                  {delayedDocks.length}
                </span>
                <span className="text-xs text-slate-500">docas</span>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-700/50 flex flex-col">
              <span className="text-[11px] font-medium text-slate-400">Fila no Pátio</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-lg font-extrabold text-amber-400">{waitingVehicles.length}</span>
                <span className="text-xs text-slate-500">caminhões</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-slate-700/60 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Filtrar:
            </span>
            <button
              onClick={() => setFilter('todos')}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                filter === 'todos'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Todas (8)
            </button>
            <button
              onClick={() => setFilter('livre')}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                filter === 'livre'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Livres ({freeDocks})
            </button>
            <button
              onClick={() => setFilter('ocupada')}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                filter === 'ocupada'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Ocupadas ({occupiedDocks})
            </button>
            <button
              onClick={() => setFilter('atrasada')}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                filter === 'atrasada'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Com Atraso ({delayedDocks.length})
            </button>
            <button
              onClick={() => setFilter('manutencao')}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                filter === 'manutencao'
                  ? 'bg-slate-600 text-white shadow-sm'
                  : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Manutenção ({maintenanceDocks})
            </button>
          </div>

          {waitingVehicles.length > 0 && (
            <div className="text-xs text-amber-300/90 flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{waitingVehicles.length} veículo(s) pronto(s) para alocação imediata</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid of the 8 docks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredDocks.map((dock) => {
          const isOccupied = dock.status === 'ocupada';
          const isFree = dock.status === 'livre';
          const isMaintenance = dock.status === 'manutencao';

          // Dwell time calculations
          let elapsedMinutes = 0;
          let targetMinutes = dock.estimatedMinutes || 45;
          let isOverdue = false;
          let progressPct = 0;

          if (isOccupied && dock.occupiedAt) {
            elapsedMinutes = Math.max(0, Math.floor((now - new Date(dock.occupiedAt).getTime()) / 60000));
            isOverdue = elapsedMinutes > targetMinutes;
            progressPct = Math.min(100, Math.round((elapsedMinutes / targetMinutes) * 100));
          }

          const categoryColors: Record<string, { label: string; badge: string }> = {
            geral: { label: 'Carga Geral', badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
            descarga: { label: 'Recebimento', badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
            refrigerada: { label: 'Câmara Fria', badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
            pesada: { label: 'Pesada / Carretas', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
          };

          const cat = categoryColors[dock.category] || { label: 'Docagem Geral', badge: 'bg-slate-700 text-slate-300 border-slate-600' };

          return (
            <div
              key={dock.id}
              className={`rounded-2xl border flex flex-col justify-between transition-all duration-200 shadow-sm ${
                isOccupied
                  ? isOverdue
                    ? 'bg-slate-900/90 border-rose-500/60 ring-1 ring-rose-500/40'
                    : 'bg-slate-900/90 border-blue-500/40 ring-1 ring-blue-500/20'
                  : isFree
                  ? 'bg-slate-900/90 border-emerald-500/30 hover:border-emerald-500/60'
                  : 'bg-slate-900/90 border-slate-700/60 opacity-80'
              }`}
            >
              {/* Dock Card Header */}
              <div className="p-4 border-b border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-extrabold text-white tracking-tight">{dock.name}</span>
                    <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${cat.badge}`}>
                      {cat.label}
                    </span>
                  </div>

                  {/* Status Badge */}
                  {isFree && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Livre
                    </span>
                  )}
                  {isOccupied && (
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold border flex items-center gap-1 ${
                        isOverdue
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isOverdue ? 'bg-rose-400' : 'bg-blue-400'}`}></span>
                      {isOverdue ? 'Tempo Excedido' : 'Ocupada'}
                    </span>
                  )}
                  {isMaintenance && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                      <Wrench className="w-3 h-3" />
                      Manutenção
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-1">{dock.description}</p>
              </div>

              {/* Dock Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                {isOccupied ? (
                  <div className="space-y-3">
                    {/* Vehicle Plate Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 rounded-md bg-slate-950 border border-slate-700 font-mono font-bold text-sm tracking-wider text-white shadow-inner flex items-center gap-1.5">
                          <span className="text-[9px] px-1 py-0.2 rounded bg-blue-700 text-white">BR</span>
                          {dock.currentVehiclePlate || 'SEM PLACA'}
                        </div>
                        <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/40">
                          {dock.currentOperation === 'carga' ? 'Carga' : dock.currentOperation === 'descarga' ? 'Descarga' : 'Cross-Dock'}
                        </span>
                      </div>
                    </div>

                    {/* Carrier & Driver details */}
                    <div className="text-xs space-y-1 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-500">Transportadora:</span>
                        <span className="font-semibold text-slate-200 truncate max-w-[150px]">{dock.currentCarrier || 'Não inf.'}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-500">Motorista:</span>
                        <span className="font-medium text-slate-200 truncate max-w-[150px]">{dock.currentDriver || 'Não inf.'}</span>
                      </div>
                    </div>

                    {/* Timer & SLA Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Tempo em Doca:
                        </span>
                        <span className={`font-mono font-bold ${isOverdue ? 'text-rose-400' : 'text-slate-200'}`}>
                          {elapsedMinutes} min <span className="text-slate-500 font-normal">/ meta {targetMinutes}m</span>
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOverdue
                              ? 'bg-rose-500'
                              : progressPct > 80
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(100, isOverdue ? 100 : progressPct)}%` }}
                        ></div>
                      </div>

                      {isOverdue && (
                        <div className="flex items-center gap-1 text-[11px] text-rose-400 font-medium">
                          <AlertCircle className="w-3 h-3" />
                          <span>Estouro de SLA em {elapsedMinutes - targetMinutes} minutos!</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : isFree ? (
                  <div className="py-4 text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">Doca Desocupada</p>
                      <p className="text-[11px] text-slate-400">Pronta para atracamento e operação.</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                      <Wrench className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-amber-300">Doca em Manutenção</p>
                      <p className="text-[11px] text-slate-400">{dock.notes || 'Equipamentos em reparo.'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Dock Card Footer Actions */}
              <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2">
                {isFree && (
                  <>
                    <button
                      onClick={() => onAssignDock(dock)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <ArrowRightCircle className="w-4 h-4" />
                      <span>Alocar Veículo</span>
                    </button>
                    <button
                      onClick={() => onToggleMaintenance(dock)}
                      title="Pausar para manutenção preventiva ou reparo"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition"
                    >
                      <Wrench className="w-4 h-4" />
                    </button>
                  </>
                )}

                {isOccupied && (
                  <>
                    <button
                      onClick={() => onReleaseDock(dock)}
                      className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Liberar Doca (Concluir)</span>
                    </button>
                    <button
                      onClick={() => onAssignDock(dock)}
                      title="Substituir veículo ou alterar dados da operação"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </>
                )}

                {isMaintenance && (
                  <button
                    onClick={() => onToggleMaintenance(dock)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Concluir Manutenção (Reativar)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
