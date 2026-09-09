import React, { useState } from 'react';
import { 
  X, 
  HardDrive, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  Cloud, 
  FileJson, 
  Database,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { StorageExportData } from '../types';

interface StorageBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: (data: any) => Promise<void>;
  onResetDemo: () => Promise<void>;
  lastSavedAt: string;
}

export const StorageBackupModal: React.FC<StorageBackupModalProps> = ({
  isOpen,
  onClose,
  onExport,
  onImport,
  onResetDemo,
  lastSavedAt,
}) => {
  if (!isOpen) return null;

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setImportStatus(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        await onImport(json);
        setImportStatus('Backup restaurado com sucesso!');
        setTimeout(() => {
          onClose();
        }, 1200);
      } catch (err) {
        setImportStatus('Erro: Arquivo JSON inválido ou corrompido.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    if (window.confirm('Deseja reiniciar os dados para o cenário típico de demonstração (8 docas ativas, veículos no pátio e histórico)?')) {
      setLoading(true);
      try {
        await onResetDemo();
        setImportStatus('Cenário padrão restaurado com sucesso!');
        setTimeout(() => {
          onClose();
        }, 1000);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Persistência de Dados & Backup</h3>
              <p className="text-xs text-slate-400">Google Drive, Vercel Blob & Armazenamento em Disco</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status banner */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-white block">Persistência Ativa & Sincronizada</span>
              <p className="text-slate-300 leading-relaxed">
                Todas as entradas, liberações de docas e tempos de permanência são gravados automaticamente no backend em arquivo JSON persistente e espelhados no armazenamento local.
              </p>
              <p className="text-slate-500 font-mono text-[11px] pt-1">
                Última sincronização: {lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString('pt-BR') : 'Tempo real'}
              </p>
            </div>
          </div>

          {/* Export to Google Drive / Vercel Blob snapshot */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-sky-400" />
                <span className="text-sm font-bold text-white">Snapshot para Google Drive / Vercel Blob</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                JSON Estruturado
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Gera um arquivo de backup completo com o estado atual das 8 docas, veículos no pátio, registros de movimentação e KPIs, pronto para arquivamento na nuvem (Google Drive, Vercel Blob ou S3).
            </p>
            <button
              onClick={onExport}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/30"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Arquivo de Backup Completo (.JSON)</span>
            </button>
          </div>

          {/* Import / Restore */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-bold text-white">Restaurar Dados a partir de Arquivo</span>
            </div>
            <p className="text-xs text-slate-400">
              Carregue um arquivo JSON de backup previamente exportado para restaurar todo o histórico operacional do terminal.
            </p>
            <label className="w-full py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer border border-slate-600">
              <Upload className="w-4 h-4" />
              <span>Selecionar Arquivo JSON de Backup</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Reset to realistic demo data */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Cenário de Teste / Demonstração</span>
              <span className="text-[10px] text-amber-400 font-mono">Dados Operacionais Prontos</span>
            </div>
            <p className="text-xs text-slate-400">
              Restaura a base com 8 docas estruturadas (livres, ocupadas e manutenção), fila de caminhões com diferentes prioridades e histórico completo de movimentações.
            </p>
            <button
              onClick={handleReset}
              disabled={loading}
              className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Recarregar Dados de Demonstração (Seed)</span>
            </button>
          </div>

          {importStatus && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
