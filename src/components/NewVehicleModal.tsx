import React, { useState } from 'react';
import { X, Truck, PlusCircle, Check } from 'lucide-react';
import { VehicleType, OperationType, VehiclePriority } from '../types';

interface NewVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vehicleData: {
    plate: string;
    vehicleType: VehicleType;
    carrier: string;
    driverName: string;
    driverPhone: string;
    operationType: OperationType;
    cargoDescription: string;
    cargoWeightKg: number;
    priority: VehiclePriority;
    notes: string;
  }) => Promise<void>;
}

export const NewVehicleModal: React.FC<NewVehicleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const [plate, setPlate] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('Truck');
  const [carrier, setCarrier] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [operationType, setOperationType] = useState<OperationType>('descarga');
  const [cargoDescription, setCargoDescription] = useState('');
  const [cargoWeightKg, setCargoWeightKg] = useState<number | ''>('');
  const [priority, setPriority] = useState<VehiclePriority>('normal');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const carriersSuggestions = [
    'TransLog Brasil',
    'Rodonaves Express',
    'Braspress Transportes',
    'Jamef Encomendas',
    'Jadlog Logística',
    'DHL Supply Chain',
    'Patrus Transportes',
    'Coopercargo',
    'Frota Própria',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate || !carrier || !driverName) return;

    setLoading(true);
    try {
      await onSubmit({
        plate: plate.toUpperCase().trim(),
        vehicleType,
        carrier,
        driverName,
        driverPhone,
        operationType,
        cargoDescription: cargoDescription || 'Carga geral fracionada',
        cargoWeightKg: typeof cargoWeightKg === 'number' ? cargoWeightKg : 0,
        priority,
        notes,
      });
      // reset form
      setPlate('');
      setCarrier('');
      setDriverName('');
      setDriverPhone('');
      setCargoDescription('');
      setCargoWeightKg('');
      setNotes('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Check-in Portaria: Novo Veículo</h3>
              <p className="text-xs text-slate-400">Entrada e registro na fila de espera do pátio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Plate */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Placa do Veículo *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: BRA2E19 ou ABC-1234"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                maxLength={8}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-950 border border-slate-700 font-mono font-bold tracking-wider text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 uppercase"
              />
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Tipo de Veículo *
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="VUC">VUC (Veículo Urbano de Carga)</option>
                <option value="Toco (3/4)">Toco / 3/4 (Semileve)</option>
                <option value="Truck">Truck (Semipesado)</option>
                <option value="Carreta">Carreta / Cavalo Mecânico (Pesado)</option>
                <option value="Bitrem">Bitrem / Rodotrem</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Carrier */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Transportadora / Frotista *
              </label>
              <input
                type="text"
                required
                list="carriers-list"
                placeholder="Ex: TransLog, Rodonaves..."
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <datalist id="carriers-list">
                {carriersSuggestions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            {/* Driver */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Nome do Motorista *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: João Carlos da Silva"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                placeholder="(11) 99999-9999"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Operation Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Operação Pretendida *
              </label>
              <select
                value={operationType}
                onChange={(e) => setOperationType(e.target.value as OperationType)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="descarga">Descarga (Recebimento)</option>
                <option value="carga">Carga (Expedição)</option>
                <option value="cross_docking">Cross-docking (Rápido)</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Prioridade SLA *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as VehiclePriority)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500 font-semibold"
              >
                <option value="normal">Normal</option>
                <option value="alta">Alta (Agendamento)</option>
                <option value="critica">Crítica (Perecível / Urgente)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Cargo Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Descrição da Carga / Mercadoria
              </label>
              <input
                type="text"
                placeholder="Ex: 24 pallets de autopeças, NF 1290"
                value={cargoDescription}
                onChange={(e) => setCargoDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Peso Aprox. (Kg)
              </label>
              <input
                type="number"
                placeholder="Ex: 8500"
                value={cargoWeightKg}
                onChange={(e) => setCargoWeightKg(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Observações de Portaria (Lacre, Agendamento, Doca Sugerida)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Lacre conferido nº 99812. Sugestão para doca 04 de descarga."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            ></textarea>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
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
              className="px-5 py-2 text-sm rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{loading ? 'Registrando...' : 'Confirmar Entrada no Pátio'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
