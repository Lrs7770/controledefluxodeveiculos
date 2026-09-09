import React, { useState } from 'react';
import { X, CheckCircle2, Truck, AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import { Dock, Vehicle } from '../types';

interface DockActionModalProps {
  dock: Dock | null;
  mode: 'assign' | 'release' | null;
  vehicles: Vehicle[];
  onClose: () => void;
  onConfirmAssign: (dockId: number, vehicleId: string, notes: string) => Promise<void>;
  onConfirmRelease: (dockId: number, operatorName: string, notes: string) => Promise<void>;
}

export const DockActionModal: React.FC<DockActionModalProps> = ({
  dock,
  mode,
  vehicles,
  onClose,
  onConfirmAssign,
  onConfirmRelease,
}) => {
  if (!dock || !mode) return null;

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [operatorName, setOperatorName] = useState<string>('Operador de Turno');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const waitingVehicles = vehicles.filter((v) => v.status === 'no_patio');

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId) return;
    setLoading(true);
    try {
      await onConfirmAssign(dock.id, selectedVehicleId, notes);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirmRelease(dock.id, operatorName, notes);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-extrabold text-sm">
              {dock.id}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {mode === 'assign' ? `Alocar Veículo na ${dock.name}` : `Concluir Operação na ${dock.name}`}
              </h3>
              <p className="text-xs text-slate-400">{dock.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {mode === 'assign' ? (
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Selecione o Veículo do Pátio (Fila de Espera)
                </label>

                {waitingVehicles.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-center space-y-2">
                    <Truck className="w-8 h-8 text-slate-500 mx-auto" />
                    <p className="text-sm font-medium text-slate-300">Nenhum veículo aguardando no pátio.</p>
                    <p className="text-xs text-slate-400">
                      Cadastre uma nova entrada de veículo pela barra superior para poder alocar nesta doca.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {waitingVehicles.map((v) => {
                      const isSelected = selectedVehicleId === v.id;
                      const priorityColor =
                        v.priority === 'critica'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : v.priority === 'alta'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-700 text-slate-300';

                      return (
                        <div
                          key={v.id}
                          onClick={() => setSelectedVehicleId(v.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500'
                              : 'bg-slate-800/70 border-slate-700/80 hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="px-2.5 py-1 rounded bg-slate-950 font-mono font-bold text-xs border border-slate-700 text-white">
                              {v.plate}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-white">{v.carrier}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium uppercase ${priorityColor}`}>
                                  {v.priority}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400">
                                {v.vehicleType} • {v.operationType === 'carga' ? 'Carregamento' : 'Descarga'} • Mot: {v.driverName}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0">
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                isSelected ? 'border-blue-500 bg-blue-600 text-white' : 'border-slate-600'
                              }`}
                            >
                              {isSelected && <CheckCircle2 className="w-4 h-4" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Instruções para o Manobrista / Conferente (Opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Verificar lacre 44812, encostar em ré com guia de solo..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!selectedVehicleId || loading}
                  className="px-5 py-2 text-sm rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>{loading ? 'Alocando...' : 'Confirmar Atracamento'}</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleReleaseSubmit} className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Veículo Concluído:</span>
                  <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-slate-950 border border-slate-700">
                    {dock.currentVehiclePlate || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Transportadora:</span>
                  <span className="font-semibold text-slate-200">{dock.currentCarrier || 'Não inf.'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Tipo de Operação:</span>
                  <span className="font-semibold text-blue-400 uppercase">
                    {dock.currentOperation === 'carga' ? 'Carregamento' : 'Descarga'}
                  </span>
                </div>
                {dock.occupiedAt && (
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-700/60">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-400" /> Início da Operação:
                    </span>
                    <span className="font-mono text-slate-300">
                      {new Date(dock.occupiedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Conferente / Responsável pela Liberação
                </label>
                <input
                  type="text"
                  required
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Observações Finais de Conferência / Liberação
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Carga conferida 100%, sem avarias, canhoto assinado e liberado para portaria..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-sm rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{loading ? 'Liberando...' : 'Confirmar e Liberar Doca'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
