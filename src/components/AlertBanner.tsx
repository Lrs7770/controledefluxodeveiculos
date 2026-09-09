import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, X, ChevronRight } from 'lucide-react';
import { OperationalAlert } from '../types';

interface AlertBannerProps {
  alerts: OperationalAlert[];
  onNavigateToDocks: () => void;
  onNavigateToAnalysis: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  alerts,
  onNavigateToDocks,
  onNavigateToAnalysis,
}) => {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const activeAlerts = alerts.filter((a) => !dismissedIds.includes(a.id));

  if (activeAlerts.length === 0) return null;

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
  };

  return (
    <div className="no-print max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 space-y-2">
      {activeAlerts.slice(0, 3).map((alert) => {
        const isDanger = alert.severity === 'danger';
        const isWarning = alert.severity === 'warning';

        const colorClasses = isDanger
          ? 'bg-rose-950/50 border-rose-600/50 text-rose-200'
          : isWarning
          ? 'bg-amber-950/50 border-amber-600/50 text-amber-200'
          : 'bg-blue-950/50 border-blue-600/50 text-blue-200';

        const icon = isDanger ? (
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
        ) : isWarning ? (
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
        ) : (
          <Info className="w-5 h-5 text-blue-400 shrink-0" />
        );

        return (
          <div
            key={alert.id}
            className={`p-3 sm:p-4 rounded-xl border flex items-start justify-between gap-3 shadow-sm transition-all ${colorClasses}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{icon}</div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-white tracking-wide">{alert.title}</h4>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black/30 border border-current">
                    {alert.type}
                  </span>
                </div>
                <p className="text-xs sm:text-sm mt-0.5 opacity-90">{alert.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {alert.dockId ? (
                <button
                  onClick={onNavigateToDocks}
                  className="text-xs font-semibold px-2.5 py-1 rounded bg-black/40 hover:bg-black/60 border border-current transition flex items-center gap-1"
                >
                  <span>Ver Doca</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={onNavigateToAnalysis}
                  className="text-xs font-semibold px-2.5 py-1 rounded bg-black/40 hover:bg-black/60 border border-current transition flex items-center gap-1"
                >
                  <span>Analisar</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => handleDismiss(alert.id)}
                className="p-1 rounded hover:bg-white/10 opacity-70 hover:opacity-100 transition"
                title="Ignorar notificação"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
