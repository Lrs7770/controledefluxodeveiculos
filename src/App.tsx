import React, { useState, useEffect, useCallback } from 'react';
import { 
  Navbar, 
  NavTab 
} from './components/Navbar';
import { AlertBanner } from './components/AlertBanner';
import { DocksGrid } from './components/DocksGrid';
import { VehicleManager } from './components/VehicleManager';
import { DashboardKPIs } from './components/DashboardKPIs';
import { CongestionAnalysis } from './components/CongestionAnalysis';
import { PrintReport } from './components/PrintReport';
import { NewVehicleModal } from './components/NewVehicleModal';
import { DockActionModal } from './components/DockActionModal';
import { StorageBackupModal } from './components/StorageBackupModal';
import { OperatorGuideModal } from './components/OperatorGuideModal';
import { initialDocks, initialVehicles, initialMovements, initialKpis, initialPeriodComparison } from './data/initialData';
import { 
  Dock, 
  Vehicle, 
  Movement, 
  LogisticsKPIs, 
  OperationalAlert, 
  PeriodComparison, 
  AiLogisticsSuggestion,
  VehicleType,
  OperationType,
  VehiclePriority
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('docas');
  const [docks, setDocks] = useState<Dock[]>(initialDocks);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [movements, setMovements] = useState<Movement[]>(initialMovements);
  const [kpis, setKpis] = useState<LogisticsKPIs>(initialKpis);
  const [alerts, setAlerts] = useState<OperationalAlert[]>([]);
  const [periodComparison, setPeriodComparison] = useState<PeriodComparison>(initialPeriodComparison);
  const [lastSavedAt, setLastSavedAt] = useState<string>(new Date().toISOString());

  // AI Analysis state
  const [aiSuggestions, setAiSuggestions] = useState<AiLogisticsSuggestion[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Modals state
  const [isNewVehicleOpen, setIsNewVehicleOpen] = useState<boolean>(false);
  const [selectedDockForAction, setSelectedDockForAction] = useState<Dock | null>(null);
  const [dockActionMode, setDockActionMode] = useState<'assign' | 'release' | null>(null);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);

  // Sync state from server
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        if (data.docks) setDocks(data.docks);
        if (data.vehicles) setVehicles(data.vehicles);
        if (data.movements) setMovements(data.movements);
        if (data.kpis) setKpis(data.kpis);
        if (data.alerts) setAlerts(data.alerts);
        if (data.periodComparison) setPeriodComparison(data.periodComparison);
        if (data.lastSavedAt) setLastSavedAt(data.lastSavedAt);
      }
    } catch (err) {
      console.warn('Backend fetch failed, relying on client memory:', err);
    }
  }, []);

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 5000);
    return () => clearInterval(interval);
  }, [fetchState]);

  // Handlers for Dock Actions
  const handleAssignDockClick = (dock: Dock) => {
    setSelectedDockForAction(dock);
    setDockActionMode('assign');
  };

  const handleReleaseDockClick = (dock: Dock) => {
    setSelectedDockForAction(dock);
    setDockActionMode('release');
  };

  const handleToggleMaintenance = async (dock: Dock) => {
    try {
      const res = await fetch(`/api/docks/${dock.id}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: dock.status === 'manutencao' ? 'Reativada' : 'Manutenção preventiva de rampa niveladora e batentes',
        }),
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmAssign = async (dockId: number, vehicleId: string, notes: string) => {
    try {
      const res = await fetch(`/api/docks/${dockId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId, notes }),
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmRelease = async (dockId: number, operatorName: string, notes: string) => {
    try {
      const res = await fetch(`/api/docks/${dockId}/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorName, notes }),
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handlers for Vehicle Actions
  const handleNewVehicleSubmit = async (vehicleData: {
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
  }) => {
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleData),
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDepartVehicle = async (vehicleId: string) => {
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/depart`, {
        method: 'POST',
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (window.confirm('Tem certeza que deseja remover este veículo?')) {
      try {
        const res = await fetch(`/api/vehicles/${vehicleId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          await fetchState();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      await fetch(`/api/alerts/${alertId}/dismiss`, { method: 'POST' });
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (err) {
      console.error(err);
    }
  };

  // Run AI Logistics Analysis
  const handleRunAiAnalysis = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/analyze', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.analysis?.suggestions) {
          setAiSuggestions(data.analysis.suggestions);
        }
        if (data.analysis?.summary) {
          setAiSummary(data.analysis.summary);
        }
      }
    } catch (err) {
      console.error('AI analysis error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Storage / Backup handlers
  const handleExportBackup = () => {
    const exportPayload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      docks,
      vehicles,
      movements,
      kpis,
      periodComparison,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logidoca_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = async (data: any) => {
    try {
      const res = await fetch('/api/storage/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleResetDemo = async () => {
    try {
      const res = await fetch('/api/storage/reset', { method: 'POST' });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const waitingVehiclesCount = vehicles.filter((v) => v.status === 'no_patio').length;
  const occupiedDocksCount = docks.filter((d) => d.status === 'ocupada').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white font-sans antialiased">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        waitingVehiclesCount={waitingVehiclesCount}
        occupiedDocksCount={occupiedDocksCount}
        onOpenNewVehicle={() => setIsNewVehicleOpen(true)}
        onOpenStorage={() => setIsStorageModalOpen(true)}
        onOpenGuide={() => setIsGuideModalOpen(true)}
      />

      {/* Real-time Operational Alerts Banner */}
      <div className="no-print">
        <AlertBanner alerts={alerts} onDismiss={handleDismissAlert} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'docas' && (
          <DocksGrid
            docks={docks}
            vehicles={vehicles}
            onAssignDock={handleAssignDockClick}
            onReleaseDock={handleReleaseDockClick}
            onToggleMaintenance={handleToggleMaintenance}
            onSelectVehicleToDock={(vehicleId, dockId) => handleConfirmAssign(dockId, vehicleId, '')}
          />
        )}

        {activeTab === 'veiculos' && (
          <VehicleManager
            vehicles={vehicles}
            docks={docks}
            onOpenNewVehicle={() => setIsNewVehicleOpen(true)}
            onAssignVehicleToDock={(vehicle) => {
              // Find first free dock or open dock selector
              const firstFreeDock = docks.find((d) => d.status === 'livre');
              if (firstFreeDock) {
                handleAssignDockClick(firstFreeDock);
              } else {
                alert('Todas as 8 docas estão ocupadas ou em manutenção no momento. Aguarde a liberação de uma doca.');
              }
            }}
            onDepartVehicle={handleDepartVehicle}
            onDeleteVehicle={handleDeleteVehicle}
          />
        )}

        {activeTab === 'kpis' && (
          <DashboardKPIs
            kpis={kpis}
            docks={docks}
            movements={movements}
          />
        )}

        {activeTab === 'analise' && (
          <CongestionAnalysis
            kpis={kpis}
            periodComparison={periodComparison}
            onRunAiAnalysis={handleRunAiAnalysis}
            aiSuggestions={aiSuggestions}
            aiSummary={aiSummary}
            isAiLoading={isAiLoading}
          />
        )}

        {activeTab === 'relatorio' && (
          <PrintReport
            docks={docks}
            vehicles={vehicles}
            movements={movements}
            kpis={kpis}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>LogiDoca Operações Logísticas • Sistema de Gestão de Fluxo & 8 Docas</span>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setIsGuideModalOpen(true)} className="hover:text-white transition">
              Manual do Operador
            </button>
            <span>•</span>
            <button onClick={() => setIsStorageModalOpen(true)} className="hover:text-white transition">
              Persistência & Backup
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <NewVehicleModal
        isOpen={isNewVehicleOpen}
        onClose={() => setIsNewVehicleOpen(false)}
        onSubmit={handleNewVehicleSubmit}
      />

      <DockActionModal
        dock={selectedDockForAction}
        mode={dockActionMode}
        vehicles={vehicles}
        onClose={() => {
          setSelectedDockForAction(null);
          setDockActionMode(null);
        }}
        onConfirmAssign={handleConfirmAssign}
        onConfirmRelease={handleConfirmRelease}
      />

      <StorageBackupModal
        isOpen={isStorageModalOpen}
        onClose={() => setIsStorageModalOpen(false)}
        onExport={handleExportBackup}
        onImport={handleImportBackup}
        onResetDemo={handleResetDemo}
        lastSavedAt={lastSavedAt}
      />

      <OperatorGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
}
