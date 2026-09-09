import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Sliders, 
  Calendar,
  Layers,
  Zap,
  Target,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { LogisticsKPIs, PeriodComparison, AiLogisticsSuggestion } from '../types';

interface CongestionAnalysisProps {
  kpis: LogisticsKPIs;
  periodComparison: PeriodComparison;
  onRunAiAnalysis: () => Promise<void>;
  aiSuggestions: AiLogisticsSuggestion[];
  aiSummary: string;
  isAiLoading: boolean;
}

export const CongestionAnalysis: React.FC<CongestionAnalysisProps> = ({
  kpis,
  periodComparison,
  onRunAiAnalysis,
  aiSuggestions,
  aiSummary,
  isAiLoading,
}) => {
  const [activeStrategyFilter, setActiveStrategyFilter] = useState<string>('todos');

  // Hardcoded initial logistical best practices if no AI response yet
  const defaultSuggestions: AiLogisticsSuggestion[] = [
    {
      category: 'redistribuicao_horarios',
      priority: 'alta',
      title: 'Janela de Agendamento Dinâmico (Slot Booking)',
      diagnostic: 'Identificado congestionamento de 60% das descargas entre 08h00 e 10h30, saturando o bolsão de espera.',
      action: 'Distribuir janelas de recebimento com faixas dedicadas de 45 minutos e incentivar chegadas de carretas a partir das 13h30.',
      expectedImpact: 'Redução estimada de 38% no tempo de espera no pátio externo.',
    },
    {
      category: 'balanceamento_docas',
      priority: 'alta',
      title: 'Priorização de Rotas Críticas e Veículos Leves (VUC/Toco)',
      diagnostic: 'Veículos rápidos (VUC) ocupando docas pesadas ou aguardando carretas lentas terminarem a despaletização.',
      action: 'Dedicar exclusivamente as Docas 01 e 03 para distribuição urbana e cross-docking ágil (< 30 min).',
      expectedImpact: 'Aumento de 40% na rotatividade de entregas metropolitanas.',
    },
    {
      category: 'processo_conferencia',
      priority: 'media',
      title: 'Conferência Cega Digitalizada por Código de Barras (WMS)',
      diagnostic: 'Atrasos de até 22 minutos decorrentes de contagem manual e conferência física de faturas na rampa.',
      action: 'Implantar pré-conferência eletrônica via leitor óptico com liberação imediata do cavalo mecânico.',
      expectedImpact: 'Ganho médio de 15 minutos por giro de doca.',
    },
    {
      category: 'priorizacao_rotas',
      priority: 'media',
      title: 'Roteirização com Chegada Escalonada por Macro-região',
      diagnostic: 'Chegada simultânea de carretas vindas da mesma rota regional gerando pico pontual.',
      action: 'Integrar rastreamento de rota (telemetria) para acionar equipe de doca 30 min antes da chegada do veículo.',
      expectedImpact: 'Eliminação da fila ociosa na guarita de entrada.',
    },
  ];

  const suggestionsToDisplay = aiSuggestions.length > 0 ? aiSuggestions : defaultSuggestions;

  const filteredSuggestions = suggestionsToDisplay.filter((s) => {
    if (activeStrategyFilter === 'todos') return true;
    return s.category === activeStrategyFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner with AI trigger */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-600/40 rounded-2xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">Análise de Gargalos & Otimização Logística</h2>
          </div>
          <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Diagnóstico algorítmico e recomendações inteligentes para balanceamento de fluxo, eliminação de gargalos e mitigação de congestionamento em docas.
          </p>
        </div>

        <button
          onClick={onRunAiAnalysis}
          disabled={isAiLoading}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-blue-600/30 shrink-0 disabled:opacity-50 active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${isAiLoading ? 'animate-spin' : ''}`} />
          <span>{isAiLoading ? 'Analisando Fluxo com IA...' : 'Atualizar Diagnóstico com IA'}</span>
        </button>
      </div>

      {aiSummary && (
        <div className="bg-blue-950/40 border border-blue-600/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-blue-200">
          <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block mb-0.5">Parecer da Inteligência Operacional:</span>
            <span>{aiSummary}</span>
          </div>
        </div>
      )}

      {/* Primary Analytical Patterns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pattern 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
              Gargalo Temporal
            </span>
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <h4 className="text-sm font-bold text-white">Concentração de Recebimento Matutino</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Mais de <strong>55% dos caminhões de descarga</strong> chegam entre 08h00 e 10h00, enquanto a tarde apresenta ociosidade de docas.
          </p>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
            <strong>Impacto:</strong> Fila de espera atinge pico de até 4 veículos no bolsão externo.
          </div>
        </div>

        {/* Pattern 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              Desbalanceamento Físico
            </span>
            <Sliders className="w-4 h-4 text-amber-400" />
          </div>
          <h4 className="text-sm font-bold text-white">Pressão Excessiva nas Docas 01, 02 e 07</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Docas centrais operam a <strong>&gt; 85% de taxa de utilização</strong>, enquanto as docas 03 e 05 ficam livres aguardando alocação.
          </p>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
            <strong>Impacto:</strong> Desgaste acelerado de niveladores e tempo de espera desigual entre transportadoras.
          </div>
        </div>

        {/* Pattern 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
              Gargalo de Processo
            </span>
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <h4 className="text-sm font-bold text-white">Conferência Fiscal & Assinatura de Canhoto</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Veículos com carregamento concluído permanecem atracados na doca por até <strong>18 minutos</strong> apenas aguardando liberação do sistema de faturamento.
          </p>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
            <strong>Impacto:</strong> Perda de até 2 ciclos operacionais completos por doca a cada turno.
          </div>
        </div>
      </div>

      {/* Period Comparison Section: Current vs Previous */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Comparativo de Períodos: Antes vs Depois da Otimização</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Avaliação do impacto operacional após a aplicação das boas práticas logísticas e controle de docas.
            </p>
          </div>

          <span className="text-xs font-mono font-semibold px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Ganhos Comprovados
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Comparison 1: Tempo em Doca */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Tempo Médio em Doca</span>
              <span className="flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <TrendingDown className="w-3.5 h-3.5" /> -{periodComparison.improvementPct.dockTimeReduction}%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Anterior</span>
                <span className="text-lg font-bold text-slate-400">{periodComparison.previousPeriod.avgDockTime} min</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 uppercase font-semibold block">Atual (Otimizado)</span>
                <span className="text-xl font-extrabold text-white">{periodComparison.currentPeriod.avgDockTime} min</span>
              </div>
            </div>
          </div>

          {/* Comparison 2: Espera no Pátio */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Espera Média no Pátio</span>
              <span className="flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <TrendingDown className="w-3.5 h-3.5" /> -{periodComparison.improvementPct.waitTimeReduction}%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Anterior</span>
                <span className="text-lg font-bold text-slate-400">{periodComparison.previousPeriod.avgWaitTime} min</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 uppercase font-semibold block">Atual (Otimizado)</span>
                <span className="text-xl font-extrabold text-white">{periodComparison.currentPeriod.avgWaitTime} min</span>
              </div>
            </div>
          </div>

          {/* Comparison 3: Produtividade / Giro */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Giro de Veículos / Turno</span>
              <span className="flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <TrendingUp className="w-3.5 h-3.5" /> +{periodComparison.improvementPct.throughputIncrease}%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Anterior</span>
                <span className="text-lg font-bold text-slate-400">{periodComparison.previousPeriod.throughput} veículos</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 uppercase font-semibold block">Atual (Otimizado)</span>
                <span className="text-xl font-extrabold text-white">{periodComparison.currentPeriod.throughput} veículos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Recommendations List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Recomendações Práticas e Acionáveis</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Medidas imediatas para a equipe de supervisão de pátio e operadores de doca.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveStrategyFilter('todos')}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                activeStrategyFilter === 'todos' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setActiveStrategyFilter('redistribuicao_horarios')}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                activeStrategyFilter === 'redistribuicao_horarios' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Horários
            </button>
            <button
              onClick={() => setActiveStrategyFilter('balanceamento_docas')}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                activeStrategyFilter === 'balanceamento_docas' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Docas
            </button>
            <button
              onClick={() => setActiveStrategyFilter('processo_conferencia')}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                activeStrategyFilter === 'processo_conferencia' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Conferência
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredSuggestions.map((item, index) => {
            const priorityBadge =
              item.priority === 'alta'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40';

            return (
              <div
                key={index}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 text-xs font-bold flex items-center justify-center border border-blue-500/30">
                      {index + 1}
                    </span>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border self-start sm:self-auto ${priorityBadge}`}>
                    Prioridade {item.priority}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="space-y-1">
                    <span className="text-slate-500 font-semibold uppercase text-[10px]">Diagnóstico de Causa Raiz:</span>
                    <p className="text-slate-300">{item.diagnostic}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-blue-400 font-semibold uppercase text-[10px]">Ação Operacional Recomendada:</span>
                    <p className="text-white font-medium">{item.action}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs text-emerald-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Impacto Estimado: {item.expectedImpact}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
