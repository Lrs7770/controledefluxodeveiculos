import React, { useState } from 'react';
import { 
  Truck, 
  Search, 
  Filter, 
  Plus, 
  ArrowUpRight, 
  LogOut, 
  Trash2, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  User,
  Phone,
  PackageCheck
} from 'lucide-react';
import { Vehicle, Dock } from '../types';

interface VehicleManagerProps {
  vehicles: Vehicle[];
  docks: Dock[];
  onOpenNewVehicle: () => void;
  onAssignVehicleToDock: (vehicle: Vehicle) => void;
  onDepartVehicle: (vehicleId: string) => void;
  onDeleteVehicle: (vehicleId: string) => void;
}

export const VehicleManager: React.FC<VehicleManagerProps> = ({
  vehicles,
  docks,
  onOpenNewVehicle,
  onAssignVehicleToDock,
  onDepartVehicle,
  onDeleteVehicle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'no_patio' | 'na_doca' | 'concluido' | 'saiu'>('todos');

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.carrier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.cargoDescription.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todos' ? true : v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const waitingCount = vehicles.filter((v) => v.status === 'no_patio').length;
  const inDockCount = vehicles.filter((v) => v.status === 'na_doca').length;
  const completedCount = vehicles.filter((v) => v.status === 'concluido').length;
  const departedCount = vehicles.filter((v) => v.status === 'saiu').length;

  const freeDocksCount = docks.filter((d) => d.status === 'livre').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header with quick stats */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Gestão de Veículos e Fila de Pátio</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
              Controle de Fluxo
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registro de chegadas, controle de tempo de permanência no pátio e direcionamento inteligente para as docas.
          </p>
        </div>

        <button
          onClick={onOpenNewVehicle}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-md shadow-blue-600/30 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Chegada na Portaria</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por placa (ex: BRA2E19), transportadora, motorista..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === 'todos' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Todos ({vehicles.length})
          </button>
          <button
            onClick={() => setStatusFilter('no_patio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              statusFilter === 'no_patio'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            No Pátio ({waitingCount})
          </button>
          <button
            onClick={() => setStatusFilter('na_doca')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              statusFilter === 'na_doca'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            Na Doca ({inDockCount})
          </button>
          <button
            onClick={() => setStatusFilter('concluido')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              statusFilter === 'concluido'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Concluídos ({completedCount})
          </button>
          <button
            onClick={() => setStatusFilter('saiu')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === 'saiu' ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Saíram ({departedCount})
          </button>
        </div>
      </div>

      {/* Vehicles Table / Cards */}
      {filteredVehicles.length === 0 ? (
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-12 text-center space-y-3">
          <Truck className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">Nenhum veículo encontrado</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchTerm
              ? 'Tente alterar os termos da busca para encontrar o veículo desejado.'
              : 'Não há veículos registrados para o filtro selecionado.'}
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800 font-semibold">
                <tr>
                  <th className="py-3 px-4">Veículo & Placa</th>
                  <th className="py-3 px-4">Transportadora & Motorista</th>
                  <th className="py-3 px-4">Operação & Carga</th>
                  <th className="py-3 px-4">Prioridade</th>
                  <th className="py-3 px-4">Status & Local</th>
                  <th className="py-3 px-4">Horários / Permanência</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredVehicles.map((vehicle) => {
                  const arrivedDate = new Date(vehicle.arrivedAt);
                  const waitMinutes = Math.floor((Date.now() - arrivedDate.getTime()) / 60000);

                  const priorityBadge =
                    vehicle.priority === 'critica'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : vehicle.priority === 'alta'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700';

                  const statusBadge =
                    vehicle.status === 'no_patio'
                      ? { label: 'Aguardando Pátio', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' }
                      : vehicle.status === 'na_doca'
                      ? { label: `Doca 0${vehicle.dockId}`, bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40' }
                      : vehicle.status === 'concluido'
                      ? { label: 'Liberado Pátio', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' }
                      : { label: 'Saiu da Portaria', bg: 'bg-slate-700 text-slate-400 border-slate-600' };

                  return (
                    <tr key={vehicle.id} className="hover:bg-slate-800/40 transition">
                      {/* Vehicle & Plate */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="px-2.5 py-1 rounded bg-slate-950 border border-slate-700 font-mono font-bold text-xs text-white">
                            {vehicle.plate}
                          </div>
                          <span className="text-slate-400 text-[11px]">{vehicle.vehicleType}</span>
                        </div>
                      </td>

                      {/* Carrier & Driver */}
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="font-semibold text-white text-xs">{vehicle.carrier}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3 text-slate-500" />
                            <span>{vehicle.driverName}</span>
                            {vehicle.driverPhone && (
                              <span className="text-slate-500">({vehicle.driverPhone})</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Operation & Cargo */}
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-medium text-xs text-blue-300 uppercase">
                            {vehicle.operationType === 'carga'
                              ? 'Carregamento'
                              : vehicle.operationType === 'descarga'
                              ? 'Descarga'
                              : 'Cross-Docking'}
                          </span>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {vehicle.cargoDescription}
                            {vehicle.cargoWeightKg ? ` • ${(vehicle.cargoWeightKg / 1000).toFixed(1)}t` : ''}
                          </p>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${priorityBadge}`}>
                          {vehicle.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5 ${statusBadge.bg}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Timestamps */}
                      <td className="py-3.5 px-4">
                        <div className="text-[11px] space-y-0.5">
                          <div className="text-slate-400">
                            Entrada: <span className="font-mono text-slate-300">{arrivedDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          {vehicle.status === 'no_patio' && (
                            <div className="text-amber-400 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Espera: {waitMinutes} min</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {vehicle.status === 'no_patio' && (
                            <button
                              onClick={() => onAssignVehicleToDock(vehicle)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center gap-1 shadow-sm"
                              title="Alocar em uma das docas disponíveis"
                            >
                              <span>Alocar Doca</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {vehicle.status === 'concluido' && (
                            <button
                              onClick={() => onDepartVehicle(vehicle.id)}
                              className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-xs transition flex items-center gap-1"
                              title="Registrar saída definitiva pelo portão principal"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              <span>Liberar Portão</span>
                            </button>
                          )}

                          <button
                            onClick={() => onDeleteVehicle(vehicle.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                            title="Remover veículo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
