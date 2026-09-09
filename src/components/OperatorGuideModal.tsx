import React from 'react';
import { X, HelpCircle, CheckCircle2, Truck, Warehouse, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

interface OperatorGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OperatorGuideModal: React.FC<OperatorGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Manual Operacional POP (Procedimento Padrão)</h3>
              <p className="text-xs text-slate-400">Instruções de uso para operadores de pátio, portaria e docas</p>
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
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Step 1 */}
          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
              1
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Portaria / Guarita (Entrada de Veículo)</span>
                <Truck className="w-3.5 h-3.5 text-blue-400" />
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Ao chegar um caminhão no portão, clique em <strong>"+ Entrada Veículo"</strong> na barra superior. Informe a placa, transportadora, motorista, tipo de carga e prioridade (Normal, Alta para perecíveis/hospitalares). O veículo entra automaticamente na fila do pátio e o cronômetro de espera é iniciado.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
              2
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Alocação em Doca Livre (Atracamento)</span>
                <Warehouse className="w-3.5 h-3.5 text-emerald-400" />
              </h4>
              <p className="text-slate-400 leading-relaxed">
                No <strong>"Painel das 8 Docas"</strong>, localize uma doca livre (verde) compatível com o perfil da carga (Docas 1-3 Carga Geral, Docas 4-5 Descarga, Doca 6 Câmara Fria, Docas 7-8 Pesada). Clique em <strong>"Alocar Veículo"</strong>, selecione o caminhão da fila e confirme o atracamento. O status muda para "Ocupada" e o cronômetro de operação inicia.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
              3
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Controle de Tempo & Alertas de Congestionamento</span>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
              </h4>
              <p className="text-slate-400 leading-relaxed">
                A meta padrão é de <strong>40 a 45 minutos por doca</strong>. Caso uma operação ultrapasse esse tempo, o cartão da doca ficará destacado em vermelho com alerta sonoro/visual de estouro de SLA. Se a fila no pátio atingir 3 ou mais veículos, o alerta de congestionamento é acionado.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
              4
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Liberação da Doca & Registro de Histórico</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Finalizado o carregamento ou descarga, clique em <strong>"Liberar Doca (Concluir)"</strong>. Insira o nome do conferente responsável e observações eventuais. O sistema calcula a duração exata da permanência, grava no histórico auditável e deixa a doca livre para o próximo veículo.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
              5
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Relatórios & Auditoria</span>
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Na aba <strong>"Relatório Imprimível"</strong>, é possível visualizar o documento consolidado do turno e gerar versão impressa ou em PDF para assinatura da supervisão.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/60 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition"
          >
            Entendido, Voltar à Operação
          </button>
        </div>
      </div>
    </div>
  );
};
