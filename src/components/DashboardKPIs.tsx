import React from 'react';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Truck, 
  AlertTriangle, 
  Activity, 
  Zap,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { LogisticsKPIs, Dock, Movement } from '../types';

interface DashboardKPIsProps {
  kpis: LogisticsKPIs;
  docks: Dock[];
  movements: Movement[];
}

export const DashboardKPIs: React.FC<DashboardKPIsProps> = ({
  kpis,
  docks,
  movements,
}) => {
  // Max count for hourly flow chart scaling
  const maxHourlyCount = Math.max(...kpis.peakHours.map((h) => h.count), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Indicadores de Desempenho Logístico (KPIs)</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              Tempo Real
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Métricas críticas de ocupação das 8 docas, tempos médios de giro, conformidade de SLA e análise de fluxo.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-700">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Meta Operacional CD: <strong>&le; 45 min/doca</strong></span>
        </div>
      </div>

      {/* Top Cards: 4 Primary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Tempo Médio de Ocupação */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tempo Médio em Doca</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{kpis.averageDockDwellMinutes}</span>
            <span className="text-xs text-slate-400 font-medium">minutos/veículo</span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80">
            <span className="text-slate-400">Meta Estabelecida:</span>
            <span className={kpis.averageDockDwellMinutes <= 45 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {kpis.averageDockDwellMinutes <= 45 ? 'Dentro da Meta (45 min)' : 'Acima da Meta (+ excedente)'}
            </span>
          </div>
        </div>

        {/* Metric 2: Taxa de Utilização das 8 Docas */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Taxa de Utilização</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{kpis.overallUtilizationRate}%</span>
            <span className="text-xs text-slate-400 font-medium">capacidade ativa</span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80">
            <span className="text-slate-400">Status Operacional:</span>
            <span className="text-emerald-400 font-bold">
              {kpis.overallUtilizationRate > 80 ? 'Alta Produtividade' : kpis.overallUtilizationRate > 50 ? 'Fluxo Estável' : 'Capacidade Ociosa'}
            </span>
          </div>
        </div>

        {/* Metric 3: Espera Média no Pátio */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Espera Média no Pátio</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{kpis.averageYardWaitMinutes}</span>
            <span className="text-xs text-slate-400 font-medium">minutos até atracar</span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80">
            <span className="text-slate-400">Veículos em Espera Hoje:</span>
            <span className="text-amber-300 font-bold">{kpis.currentlyInYard} no pátio</span>
          </div>
        </div>

        {/* Metric 4: Nível de Serviço / SLA */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Conformidade SLA</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{kpis.slaComplianceRate}%</span>
            <span className="text-xs text-slate-400 font-medium">operações no prazo</span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80">
            <span className="text-slate-400">Giro de Veículos:</span>
            <span className="text-slate-200 font-semibold">{kpis.completedToday} finalizados</span>
          </div>
        </div>
      </div>

      {/* Charts Section: Utilization by Dock & Hourly Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Utilização e Tempo Médio por Doca */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span>Taxa de Utilização & Tempo Médio por Doca</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Desempenho individual das 8 docas operacionais no turno.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Meta &le; 45min
            </span>
          </div>

          {/* Bar Visualization */}
          <div className="space-y-2.5 pt-2">
            {docks.map((dock) => {
              const util = kpis.docksUtilization[dock.id] || 0;
              const avgDwell = kpis.averageDwellByDock[dock.id] || dock.estimatedMinutes || 40;
              const isMaintenance = dock.status === 'manutencao';

              return (
                <div key={dock.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white w-14">{dock.name}</span>
                      <span className="text-slate-400 text-[11px] truncate max-w-[120px]">{dock.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-mono text-[11px]">Méd. {avgDwell}m</span>
                      <span className={`font-bold font-mono text-xs ${isMaintenance ? 'text-amber-400' : 'text-blue-400'}`}>
                        {isMaintenance ? 'Parada' : `${util}%`}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    {isMaintenance ? (
                      <div className="h-full bg-amber-500/50 w-full stripe-pattern"></div>
                    ) : (
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          util > 85 ? 'bg-indigo-500' : util > 65 ? 'bg-blue-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${util}%` }}
                      ></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Fluxo Horário e Identificação de Picos */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Fluxo Horário & Identificação de Períodos de Pico</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Volume de veículos atendidos por faixa horária (06h às 18h).
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Pico (&ge;9)
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Moderado
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Fluido
              </span>
            </div>
          </div>

          {/* Histogram Chart */}
          <div className="pt-4 flex items-end justify-between gap-1.5 h-44 border-b border-slate-800 pb-2">
            {kpis.peakHours.map((flow) => {
              const heightPct = Math.round((flow.count / maxHourlyCount) * 100);
              const isPeak = flow.status === 'pico';
              const isMod = flow.status === 'moderado';

              const barColor = isPeak
                ? 'bg-rose-500 hover:bg-rose-400'
                : isMod
                ? 'bg-amber-500 hover:bg-amber-400'
                : 'bg-emerald-500 hover:bg-emerald-400';

              return (
                <div key={flow.hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-950 text-white text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-700 pointer-events-none whitespace-nowrap z-10">
                    {flow.count} veículos
                  </div>

                  <span className="text-[10px] font-mono font-bold text-slate-300">{flow.count}</span>

                  <div className="w-full bg-slate-800/60 rounded-t-md h-28 flex items-end">
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${barColor}`}
                      style={{ height: `${heightPct}%` }}
                    ></div>
                  </div>

                  <span className="text-[9px] text-slate-500 font-mono rotate-[-45deg] origin-top-left mt-2">
                    {flow.hour.replace(':00', 'h')}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Peak hour takeaway */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-start gap-2.5 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-200">Gargalo Crítico Detectado: Janela das 08h00 às 11h00 e 14h00</span>
              <p className="text-slate-400 text-[11px]">
                Maior concentração de veículos no pátio aguardando liberação de docas. Recomenda-se redistribuição de agendamentos para a faixa das 12h-13h ou após as 16h.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Movement Log: Recent Cycles & Dwell Durations */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Registro de Movimentações Recentes (Timestamps & Duração de Permanência)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Histórico auditável de veículos que passaram pelas docas hoje.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-3 py-1 rounded-lg">
            {movements.length} operações registradas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Veículo / Placa</th>
                <th className="py-2.5 px-3">Transportadora</th>
                <th className="py-2.5 px-3">Doca</th>
                <th className="py-2.5 px-3">Operação</th>
                <th className="py-2.5 px-3">Entrada Doca</th>
                <th className="py-2.5 px-3">Saída Doca</th>
                <th className="py-2.5 px-3">Tempo Doca</th>
                <th className="py-2.5 px-3">Espera Pátio</th>
                <th className="py-2.5 px-3">Tempo Total</th>
                <th className="py-2.5 px-3">SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {movements.map((mov) => {
                const inTime = new Date(mov.enteredDockAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const outTime = new Date(mov.leftDockAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                return (
                  <tr key={mov.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-white">{mov.plate}</td>
                    <td className="py-2.5 px-3 text-slate-300 font-medium">{mov.carrier}</td>
                    <td className="py-2.5 px-3 font-bold text-blue-400">Doca 0{mov.dockId}</td>
                    <td className="py-2.5 px-3 capitalize text-slate-400">{mov.operationType}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{inTime}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{outTime}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-white">{mov.dockDwellMinutes} min</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{mov.yardWaitMinutes} min</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-300">{mov.totalDwellMinutes} min</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          mov.slaStatus === 'no_prazo'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {mov.slaStatus === 'no_prazo' ? 'No Prazo' : 'Atrasado'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
