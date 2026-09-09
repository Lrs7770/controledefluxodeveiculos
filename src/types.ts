export type DockStatus = 'livre' | 'ocupada' | 'manutencao';
export type OperationType = 'carga' | 'descarga' | 'mista' | 'cross_docking';
export type DockCategory = 'geral' | 'descarga' | 'refrigerada' | 'pesada';

export interface Dock {
  id: number;
  name: string;
  status: DockStatus;
  category: DockCategory;
  description: string;
  currentVehicleId: string | null;
  currentVehiclePlate: string | null;
  currentDriver: string | null;
  currentCarrier: string | null;
  currentOperation: OperationType | null;
  occupiedAt: string | null;
  estimatedMinutes: number;
  notes: string;
}

export type VehicleType = 'VUC' | 'Toco (3/4)' | 'Truck' | 'Carreta' | 'Bitrem';
export type VehiclePriority = 'normal' | 'alta' | 'critica';
export type VehicleStatus = 'no_patio' | 'na_doca' | 'concluido' | 'saiu';

export interface Vehicle {
  id: string;
  plate: string;
  vehicleType: VehicleType;
  carrier: string;
  driverName: string;
  driverPhone: string;
  operationType: OperationType;
  cargoDescription: string;
  cargoWeightKg?: number;
  priority: VehiclePriority;
  status: VehicleStatus;
  dockId: number | null;
  arrivedAt: string;
  dockEnteredAt: string | null;
  dockLeftAt: string | null;
  departedAt: string | null;
  notes: string;
}

export interface Movement {
  id: string;
  vehicleId: string;
  plate: string;
  carrier: string;
  dockId: number;
  operationType: OperationType;
  enteredDockAt: string;
  leftDockAt: string;
  dockDwellMinutes: number;
  yardWaitMinutes: number;
  totalDwellMinutes: number;
  operatorName: string;
  slaStatus: 'no_prazo' | 'atrasado';
  notes?: string;
}

export interface OperationalAlert {
  id: string;
  type: 'congestion' | 'dock_overflow' | 'maintenance' | 'yard_delay';
  severity: 'info' | 'warning' | 'danger';
  title: string;
  message: string;
  dockId?: number;
  vehiclePlate?: string;
  timestamp: string;
}

export interface HourlyFlow {
  hour: string;
  count: number;
  status: 'baixo' | 'moderado' | 'pico';
}

export interface LogisticsKPIs {
  totalVehiclesToday: number;
  currentlyInYard: number;
  currentlyInDocks: number;
  completedToday: number;
  averageDockDwellMinutes: number;
  averageYardWaitMinutes: number;
  overallUtilizationRate: number;
  slaComplianceRate: number;
  docksUtilization: Record<number, number>;
  averageDwellByDock: Record<number, number>;
  peakHours: HourlyFlow[];
  bottlenecks: string[];
}

export interface PeriodComparison {
  currentPeriod: {
    name: string;
    avgDockTime: number;
    avgWaitTime: number;
    throughput: number;
    utilization: number;
  };
  previousPeriod: {
    name: string;
    avgDockTime: number;
    avgWaitTime: number;
    throughput: number;
    utilization: number;
  };
  improvementPct: {
    dockTimeReduction: number;
    waitTimeReduction: number;
    throughputIncrease: number;
  };
}

export interface AiLogisticsSuggestion {
  category: 'redistribuicao_horarios' | 'priorizacao_rotas' | 'balanceamento_docas' | 'processo_conferencia';
  priority: 'alta' | 'media' | 'baixa';
  title: string;
  diagnostic: string;
  action: string;
  expectedImpact: string;
}

export interface StorageExportData {
  version: string;
  exportedAt: string;
  docks: Dock[];
  vehicles: Vehicle[];
  movements: Movement[];
  settings: {
    warehouseName: string;
    targetDockMinutes: number;
    maxWaitMinutes: number;
  };
}
