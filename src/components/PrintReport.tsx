import React from 'react';
import { Printer, Download, Warehouse, Clock, CheckCircle2, AlertTriangle, FileText, Calendar } from 'lucide-react';
import { Dock, Movement, LogisticsKPIs, Vehicle } from '../types';

interface PrintReportProps {
  docks: Dock[];
  vehicles: Vehicle[];
  movements: Movement[];
  kpis: LogisticsKPIs;
}

export const PrintReport: React.FC<PrintReportProps> = ({
  docks,
  vehicles,
  movements,
  kpis,
}) => {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Print Trigger Button (Hidden on actual print) */}
      <div className="no-print bg-slate-800 border border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Relatório Operacional de Gestão de Docas & Pátio</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Documento formal para auditoria diária, troca de turno e acompanhamento gerencial.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Relatório (PDF)</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-10 shadow-2xl border border-slate-200 print:shadow-none print:border-none print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold">
                <Warehouse className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                  LogiDoca • Relatório de Desempenho
                </h1>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest">
                  Centro de Distribuição & Terminal de Cargas
                </p>
              </div>
            </div>
          </div>

          <div className="text-right text-xs text-slate-600 space-y-0.5 font-mono">
            <div><strong className="text-slate-900">Emissão:</strong> {currentDate} às {currentTime}</div>
            <div><strong className="text-slate-900">Turno:</strong> Operacional Diurno (A/B)</div>
            <div><strong className="text-slate-900">Instalação:</strong> 8 Docas de Carga/Descarga</div>
          </div>
        </div>

        {/* Executive Summary Grid */}
        <div className="mb-6 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1">
            1. Resumo Executivo de Desempenho (KPIs do Turno)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Tempo Médio em Doca</span>
              <span className="text-2xl font-extrabold text-slate-900">{kpis.averageDockDwellMinutes} min</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Meta CD: &le; 45 min</span>
            </div>

            <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Taxa de Utilização</span>
              <span className="text-2xl font-extrabold text-slate-900">{kpis.overallUtilizationRate}%</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Capacidade ativa das 8 docas</span>
            </div>

            <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Espera no Pátio</span>
              <span className="text-2xl font-extrabold text-slate-900">{kpis.averageYardWaitMinutes} min</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Fila externa média</span>
            </div>

            <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Conformidade SLA</span>
              <span className="text-2xl font-extrabold text-slate-900">{kpis.slaComplianceRate}%</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{kpis.completedToday} veículos atendidos</span>
            </div>
          </div>
        </div>

        {/* Status of the 8 Docks */}
        <div className="mb-6 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1">
            2. Situação Operacional das 8 Docas
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2 px-3 border-r border-slate-300">Doca</th>
                  <th className="py-2 px-3 border-r border-slate-300">Perfil / Categoria</th>
                  <th className="py-2 px-3 border-r border-slate-300">Status Atual</th>
                  <th className="py-2 px-3 border-r border-slate-300">Veículo / Placa</th>
                  <th className="py-2 px-3 border-r border-slate-300">Transportadora</th>
                  <th className="py-2 px-3">Tempo Méd. Registrado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {docks.map((dock) => {
                  const avg = kpis.averageDwellByDock[dock.id] || dock.estimatedMinutes || 40;
                  return (
                    <tr key={dock.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-300">{dock.name}</td>
                      <td className="py-2 px-3 capitalize text-slate-700 border-r border-slate-300">{dock.category}</td>
                      <td className="py-2 px-3 font-semibold uppercase border-r border-slate-300">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            dock.status === 'livre'
                              ? 'bg-emerald-100 text-emerald-800'
                              : dock.status === 'ocupada'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {dock.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-800 border-r border-slate-300">
                        {dock.currentVehiclePlate || '—'}
                      </td>
                      <td className="py-2 px-3 text-slate-700 border-r border-slate-300">{dock.currentCarrier || '—'}</td>
                      <td className="py-2 px-3 font-mono text-slate-800 font-semibold">{avg} min</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Movements History */}
        <div className="mb-6 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1">
            3. Registro de Movimentações e Duração de Permanência
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2 px-2.5 border-r border-slate-300">Placa</th>
                  <th className="py-2 px-2.5 border-r border-slate-300">Transportadora</th>
                  <th className="py-2 px-2.5 border-r border-slate-300">Doca</th>
                  <th className="py-2 px-2.5 border-r border-slate-300">Operação</th>
                  <th className="py-2 px-2.5 border-r border-slate-300">Entrada</th>
                  <th className="py-2 px-2.5 border-r border-slate-300">Saída</th>
                  <th className="py-2 px-2.5 border-r border-slate-300">Doca (min)</th>
                  <th className="py-2 px-2.5 border-r border-slate-300">Pátio (min)</th>
                  <th className="py-2 px-2.5 border-r border-slate-300">Total (min)</th>
                  <th className="py-2 px-2.5">SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td className="py-1.5 px-2.5 font-mono font-bold text-slate-900 border-r border-slate-300">{m.plate}</td>
                    <td className="py-1.5 px-2.5 text-slate-700 border-r border-slate-300">{m.carrier}</td>
                    <td className="py-1.5 px-2.5 font-bold text-slate-800 border-r border-slate-300">Doca 0{m.dockId}</td>
                    <td className="py-1.5 px-2.5 capitalize text-slate-600 border-r border-slate-300">{m.operationType}</td>
                    <td className="py-1.5 px-2.5 font-mono text-slate-600 border-r border-slate-300">
                      {new Date(m.enteredDockAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-1.5 px-2.5 font-mono text-slate-600 border-r border-slate-300">
                      {new Date(m.leftDockAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-1.5 px-2.5 font-mono font-bold text-slate-900 border-r border-slate-300">{m.dockDwellMinutes}m</td>
                    <td className="py-1.5 px-2.5 font-mono text-slate-700 border-r border-slate-300">{m.yardWaitMinutes}m</td>
                    <td className="py-1.5 px-2.5 font-mono font-bold text-slate-900 border-r border-slate-300">{m.totalDwellMinutes}m</td>
                    <td className="py-1.5 px-2.5 font-semibold">
                      <span className={m.slaStatus === 'no_prazo' ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                        {m.slaStatus === 'no_prazo' ? 'OK' : 'Atrasado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Observations & Bottleneck Notes */}
        <div className="mb-8 p-4 rounded-lg border border-slate-300 bg-slate-50 space-y-2 text-xs">
          <h4 className="font-bold text-slate-800 uppercase tracking-wide">4. Parecer e Recomendações Logísticas de Turno</h4>
          <p className="text-slate-700 leading-relaxed">
            • Pico de chegadas registrado na faixa das 08h00 às 10h30. Recomenda-se acionar a transportadora Rodonaves e TransLog para agendamento vespertino a partir das 13h30.
          </p>
          <p className="text-slate-700 leading-relaxed">
            • A Doca 06 (Câmara Fria) encontra-se sob manutenção preventiva programada. Veículos com carga perecível devem ser redirecionados para atracamento prioritário na Doca 05.
          </p>
        </div>

        {/* Signatures */}
        <div className="pt-6 border-t-2 border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="space-y-1">
            <div className="w-3/4 mx-auto border-b border-slate-500 h-8"></div>
            <p className="font-bold text-slate-900">Supervisor de Operações & Pátio</p>
            <p className="text-slate-500">Gestão Logística e Controle de Docas</p>
          </div>

          <div className="space-y-1">
            <div className="w-3/4 mx-auto border-b border-slate-500 h-8"></div>
            <p className="font-bold text-slate-900">Conferente Líder / Auditoria WMS</p>
            <p className="text-slate-500">Liberação de Manifesto e NF-e</p>
          </div>
        </div>
      </div>
    </div>
  );
};
