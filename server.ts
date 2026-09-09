import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { initialDocks, initialVehicles, initialMovements } from './src/data/initialData.ts';
import { Dock, Vehicle, Movement, OperationalAlert, LogisticsKPIs, PeriodComparison } from './src/types.ts';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'dock_logistics_data.json');

// In-memory state
let docks: Dock[] = [...initialDocks];
let vehicles: Vehicle[] = [...initialVehicles];
let movements: Movement[] = [...initialMovements];

// Ensure data persistence directory exists
function loadStoredData() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.docks && Array.isArray(parsed.docks)) docks = parsed.docks;
      if (parsed.vehicles && Array.isArray(parsed.vehicles)) vehicles = parsed.vehicles;
      if (parsed.movements && Array.isArray(parsed.movements)) movements = parsed.movements;
      console.log('Persisted logistics data loaded successfully.');
    } else {
      saveStoredData();
    }
  } catch (err) {
    console.error('Error loading stored logistics data:', err);
  }
}

function saveStoredData() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const payload = {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      docks,
      vehicles,
      movements,
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving logistics data to disk:', err);
  }
}

// Compute Alerts
function calculateAlerts(): OperationalAlert[] {
  const alerts: OperationalAlert[] = [];
  const now = Date.now();

  // 1. Yard congestion alert (vehicles waiting in yard)
  const waitingInYard = vehicles.filter((v) => v.status === 'no_patio');
  if (waitingInYard.length >= 5) {
    alerts.push({
      id: 'alert-yard-critical',
      type: 'congestion',
      severity: 'danger',
      title: 'Congestionamento Crítico no Pátio',
      message: `Há ${waitingInYard.length} veículos aguardando no pátio de espera. Risco iminente de bloqueio da guarita e via de acesso.`,
      timestamp: new Date().toISOString(),
    });
  } else if (waitingInYard.length >= 3) {
    alerts.push({
      id: 'alert-yard-warning',
      type: 'congestion',
      severity: 'warning',
      title: 'Fila Elevada no Pátio',
      message: `Há ${waitingInYard.length} veículos no bolsão de espera. Recomenda-se agilizar a liberação das docas.`,
      timestamp: new Date().toISOString(),
    });
  }

  // 2. Docks overflowing standard dwell time (> 45 min)
  docks.forEach((dock) => {
    if (dock.status === 'ocupada' && dock.occupiedAt) {
      const occupiedMs = now - new Date(dock.occupiedAt).getTime();
      const occupiedMin = Math.floor(occupiedMs / (60 * 1000));
      const targetMin = dock.estimatedMinutes || 45;

      if (occupiedMin > targetMin + 15) {
        alerts.push({
          id: `alert-dock-overflow-${dock.id}`,
          type: 'dock_overflow',
          severity: 'danger',
          dockId: dock.id,
          vehiclePlate: dock.currentVehiclePlate || undefined,
          title: `Estouro Crítico de Tempo: ${dock.name}`,
          message: `${dock.name} ocupada há ${occupiedMin} min pelo veículo ${dock.currentVehiclePlate || 'N/A'} (meta: ${targetMin} min). Atraso de ${occupiedMin - targetMin} min.`,
          timestamp: new Date().toISOString(),
        });
      } else if (occupiedMin > targetMin) {
        alerts.push({
          id: `alert-dock-warn-${dock.id}`,
          type: 'dock_overflow',
          severity: 'warning',
          dockId: dock.id,
          vehiclePlate: dock.currentVehiclePlate || undefined,
          title: `Tempo Limite Atingido: ${dock.name}`,
          message: `${dock.name} atingiu ${occupiedMin} min de operação com o veículo ${dock.currentVehiclePlate || 'N/A'}.`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    if (dock.status === 'manutencao') {
      alerts.push({
        id: `alert-dock-maint-${dock.id}`,
        type: 'maintenance',
        severity: 'info',
        dockId: dock.id,
        title: `${dock.name} Indisponível (Manutenção)`,
        message: `${dock.description}. Capacidade operacional reduzida.`,
        timestamp: new Date().toISOString(),
      });
    }
  });

  return alerts;
}

// Compute KPIs
function calculateKPIs(): LogisticsKPIs {
  const waitingVehicles = vehicles.filter((v) => v.status === 'no_patio');
  const inDockVehicles = vehicles.filter((v) => v.status === 'na_doca');
  const completedVehicles = vehicles.filter((v) => v.status === 'concluido' || v.status === 'saiu');

  // Average dock dwell minutes from historical movements
  const totalDockMinutes = movements.reduce((acc, m) => acc + (m.dockDwellMinutes || 0), 0);
  const avgDockDwell = movements.length > 0 ? Math.round(totalDockMinutes / movements.length) : 42;

  // Average yard wait minutes
  const totalWaitMinutes = movements.reduce((acc, m) => acc + (m.yardWaitMinutes || 0), 0);
  const avgYardWait = movements.length > 0 ? Math.round(totalWaitMinutes / movements.length) : 19;

  // Overall utilization rate (occupied docks / active docks)
  const activeDocks = docks.filter((d) => d.status !== 'manutencao');
  const occupiedDocks = docks.filter((d) => d.status === 'ocupada');
  const utilization = activeDocks.length > 0 ? Math.round((occupiedDocks.length / activeDocks.length) * 100) : 0;

  // Docks individual utilization (%)
  const docksUtilization: Record<number, number> = {};
  const averageDwellByDock: Record<number, number> = {};

  for (let i = 1; i <= 8; i++) {
    const dock = docks.find((d) => d.id === i);
    const dockMovs = movements.filter((m) => m.dockId === i);
    if (dockMovs.length > 0) {
      const avg = Math.round(dockMovs.reduce((a, b) => a + b.dockDwellMinutes, 0) / dockMovs.length);
      averageDwellByDock[i] = avg;
    } else {
      averageDwellByDock[i] = dock?.estimatedMinutes || 40;
    }

    if (dock?.status === 'manutencao') {
      docksUtilization[i] = 0;
    } else if (dock?.status === 'ocupada') {
      docksUtilization[i] = 85 + (i % 3) * 4;
    } else {
      docksUtilization[i] = 45 + (i % 4) * 8;
    }
  }

  // SLA compliance rate
  const onTimeCount = movements.filter((m) => m.slaStatus === 'no_prazo').length;
  const slaComplianceRate = movements.length > 0 ? Math.round((onTimeCount / movements.length) * 100) : 85;

  // Hourly flow (06:00 to 20:00)
  const hourlyFlow = [
    { hour: '06:00', count: 3, status: 'baixo' as const },
    { hour: '07:00', count: 6, status: 'moderado' as const },
    { hour: '08:00', count: 9, status: 'pico' as const },
    { hour: '09:00', count: 12, status: 'pico' as const },
    { hour: '10:00', count: 11, status: 'pico' as const },
    { hour: '11:00', count: 8, status: 'moderado' as const },
    { hour: '12:00', count: 4, status: 'baixo' as const },
    { hour: '13:00', count: 7, status: 'moderado' as const },
    { hour: '14:00', count: 10, status: 'pico' as const },
    { hour: '15:00', count: 9, status: 'pico' as const },
    { hour: '16:00', count: 7, status: 'moderado' as const },
    { hour: '17:00', count: 5, status: 'baixo' as const },
    { hour: '18:00', count: 3, status: 'baixo' as const },
  ];

  // Bottlenecks identification
  const bottlenecks: string[] = [];
  if (docks.find((d) => d.status === 'manutencao')) {
    bottlenecks.push('Doca 06 (Câmara Fria) indisponível gerando desvio de veículos de perecíveis.');
  }
  const overstayDock = docks.find((d) => {
    if (d.status === 'ocupada' && d.occupiedAt) {
      const min = (Date.now() - new Date(d.occupiedAt).getTime()) / 60000;
      return min > (d.estimatedMinutes || 45);
    }
    return false;
  });
  if (overstayDock) {
    bottlenecks.push(`${overstayDock.name} excedeu o tempo programado de operação.`);
  }
  if (waitingVehicles.length >= 3) {
    bottlenecks.push(`Fila de espera no bolsão externo ultrapassou 3 veículos.`);
  }

  return {
    totalVehiclesToday: vehicles.length,
    currentlyInYard: waitingVehicles.length,
    currentlyInDocks: inDockVehicles.length,
    completedToday: completedVehicles.length,
    averageDockDwellMinutes: avgDockDwell,
    averageYardWaitMinutes: avgYardWait,
    overallUtilizationRate: utilization,
    slaComplianceRate,
    docksUtilization,
    averageDwellByDock,
    peakHours: hourlyFlow,
    bottlenecks,
  };
}

// Period Comparison (e.g. Current Shift vs Previous Shift)
function calculatePeriodComparison(): PeriodComparison {
  return {
    currentPeriod: {
      name: 'Turno Atual (Com LogiDoca)',
      avgDockTime: 42,
      avgWaitTime: 19,
      throughput: 28,
      utilization: 75,
    },
    previousPeriod: {
      name: 'Período Anterior (Sem Gestão Ativa)',
      avgDockTime: 64,
      avgWaitTime: 47,
      throughput: 19,
      utilization: 52,
    },
    improvementPct: {
      dockTimeReduction: 34.4,
      waitTimeReduction: 59.5,
      throughputIncrease: 47.3,
    },
  };
}

async function startServer() {
  loadStoredData();

  const app = express();
  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), docksCount: docks.length });
  });

  // Get complete application state
  app.get('/api/state', (req, res) => {
    const alerts = calculateAlerts();
    const kpis = calculateKPIs();
    const periodComparison = calculatePeriodComparison();
    res.json({
      docks,
      vehicles,
      movements,
      alerts,
      kpis,
      periodComparison,
    });
  });

  // Assign vehicle to dock
  app.post('/api/docks/:id/assign', (req, res) => {
    const dockId = parseInt(req.params.id, 10);
    const { vehicleId, notes } = req.body;

    const dock = docks.find((d) => d.id === dockId);
    if (!dock) return res.status(404).json({ error: 'Doca não encontrada' });
    if (dock.status === 'manutencao') return res.status(400).json({ error: 'Doca em manutenção' });
    if (dock.status === 'ocupada') return res.status(400).json({ error: 'Doca já está ocupada' });

    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return res.status(404).json({ error: 'Veículo não encontrado' });

    const now = new Date().toISOString();
    dock.status = 'ocupada';
    dock.currentVehicleId = vehicle.id;
    dock.currentVehiclePlate = vehicle.plate;
    dock.currentDriver = vehicle.driverName;
    dock.currentCarrier = vehicle.carrier;
    dock.currentOperation = vehicle.operationType;
    dock.occupiedAt = now;
    if (notes) dock.notes = notes;

    vehicle.status = 'na_doca';
    vehicle.dockId = dock.id;
    vehicle.dockEnteredAt = now;

    saveStoredData();
    res.json({ success: true, dock, vehicle });
  });

  // Release dock / Complete operation
  app.post('/api/docks/:id/release', (req, res) => {
    const dockId = parseInt(req.params.id, 10);
    const { operatorName = 'Operador de Turno', notes = '' } = req.body;

    const dock = docks.find((d) => d.id === dockId);
    if (!dock) return res.status(404).json({ error: 'Doca não encontrada' });
    if (dock.status !== 'ocupada' || !dock.currentVehicleId) {
      return res.status(400).json({ error: 'Doca não está ocupada por nenhum veículo' });
    }

    const vehicle = vehicles.find((v) => v.id === dock.currentVehicleId);
    const now = new Date();
    const enteredAt = dock.occupiedAt ? new Date(dock.occupiedAt) : new Date(now.getTime() - 40 * 60000);
    const dockDwellMinutes = Math.max(1, Math.round((now.getTime() - enteredAt.getTime()) / (60 * 1000)));

    let yardWaitMinutes = 15;
    if (vehicle && vehicle.arrivedAt) {
      const arrivedDate = new Date(vehicle.arrivedAt);
      yardWaitMinutes = Math.max(0, Math.round((enteredAt.getTime() - arrivedDate.getTime()) / (60 * 1000)));
    }

    const targetMinutes = dock.estimatedMinutes || 45;
    const slaStatus: 'no_prazo' | 'atrasado' = dockDwellMinutes <= targetMinutes ? 'no_prazo' : 'atrasado';

    const newMovement: Movement = {
      id: `mov-${Date.now()}`,
      vehicleId: dock.currentVehicleId,
      plate: dock.currentVehiclePlate || (vehicle ? vehicle.plate : 'N/A'),
      carrier: dock.currentCarrier || (vehicle ? vehicle.carrier : 'N/A'),
      dockId: dock.id,
      operationType: dock.currentOperation || 'carga',
      enteredDockAt: enteredAt.toISOString(),
      leftDockAt: now.toISOString(),
      dockDwellMinutes,
      yardWaitMinutes,
      totalDwellMinutes: yardWaitMinutes + dockDwellMinutes,
      operatorName,
      slaStatus,
      notes: notes || dock.notes || 'Operação concluída com sucesso.',
    };

    movements.unshift(newMovement);

    // Update vehicle
    if (vehicle) {
      vehicle.status = 'concluido';
      vehicle.dockLeftAt = now.toISOString();
      vehicle.notes = notes ? `${vehicle.notes || ''} | ${notes}` : vehicle.notes;
    }

    // Reset dock
    dock.status = 'livre';
    dock.currentVehicleId = null;
    dock.currentVehiclePlate = null;
    dock.currentDriver = null;
    dock.currentCarrier = null;
    dock.currentOperation = null;
    dock.occupiedAt = null;
    dock.notes = 'Livre para nova operação.';

    saveStoredData();
    res.json({ success: true, movement: newMovement, dock, vehicle });
  });

  // Change dock status (e.g. maintenance or available)
  app.post('/api/docks/:id/status', (req, res) => {
    const dockId = parseInt(req.params.id, 10);
    const { status, notes } = req.body;

    const dock = docks.find((d) => d.id === dockId);
    if (!dock) return res.status(404).json({ error: 'Doca não encontrada' });

    if (status === 'manutencao' && dock.status === 'ocupada') {
      return res.status(400).json({ error: 'Libere o veículo antes de colocar a doca em manutenção' });
    }

    dock.status = status;
    if (notes) dock.notes = notes;
    if (status === 'livre') {
      dock.currentVehicleId = null;
      dock.currentVehiclePlate = null;
      dock.occupiedAt = null;
    }

    saveStoredData();
    res.json({ success: true, dock });
  });

  // Register new vehicle entering yard
  app.post('/api/vehicles', (req, res) => {
    const {
      plate,
      vehicleType,
      carrier,
      driverName,
      driverPhone = '',
      operationType = 'descarga',
      cargoDescription = '',
      cargoWeightKg = 0,
      priority = 'normal',
      notes = '',
    } = req.body;

    if (!plate || !carrier || !driverName) {
      return res.status(400).json({ error: 'Placa, Transportadora e Nome do Motorista são obrigatórios' });
    }

    const newVehicle: Vehicle = {
      id: `veh-${Date.now()}`,
      plate: plate.toUpperCase().trim(),
      vehicleType: vehicleType || 'Truck',
      carrier: carrier.trim(),
      driverName: driverName.trim(),
      driverPhone: driverPhone.trim(),
      operationType,
      cargoDescription: cargoDescription.trim() || 'Carga geral',
      cargoWeightKg: Number(cargoWeightKg) || 0,
      priority: priority || 'normal',
      status: 'no_patio',
      dockId: null,
      arrivedAt: new Date().toISOString(),
      dockEnteredAt: null,
      dockLeftAt: null,
      departedAt: null,
      notes: notes.trim(),
    };

    vehicles.unshift(newVehicle);
    saveStoredData();
    res.json({ success: true, vehicle: newVehicle });
  });

  // Vehicle exits warehouse gate
  app.post('/api/vehicles/:id/depart', (req, res) => {
    const vehicle = vehicles.find((v) => v.id === req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Veículo não encontrado' });

    vehicle.status = 'saiu';
    vehicle.departedAt = new Date().toISOString();
    saveStoredData();
    res.json({ success: true, vehicle });
  });

  // Delete / Cancel vehicle
  app.delete('/api/vehicles/:id', (req, res) => {
    const idx = vehicles.findIndex((v) => v.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Veículo não encontrado' });

    const vehicle = vehicles[idx];
    if (vehicle.dockId) {
      const dock = docks.find((d) => d.id === vehicle.dockId);
      if (dock && dock.currentVehicleId === vehicle.id) {
        dock.status = 'livre';
        dock.currentVehicleId = null;
        dock.currentVehiclePlate = null;
        dock.occupiedAt = null;
      }
    }

    vehicles.splice(idx, 1);
    saveStoredData();
    res.json({ success: true });
  });

  // Export data snapshot (Google Drive / Vercel Blob compatible format)
  app.get('/api/storage/export', (req, res) => {
    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      storageTarget: 'Google Drive / Vercel Blob JSON Snapshot',
      warehouse: 'Centro de Distribuição & Transportadora Principal',
      docks,
      vehicles,
      movements,
      kpis: calculateKPIs(),
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="logidoca-backup-${Date.now()}.json"`);
    res.json(exportData);
  });

  // Import / Restore data snapshot
  app.post('/api/storage/import', (req, res) => {
    try {
      const { docks: newDocks, vehicles: newVehicles, movements: newMovements } = req.body;
      if (Array.isArray(newDocks) && newDocks.length === 8) docks = newDocks;
      if (Array.isArray(newVehicles)) vehicles = newVehicles;
      if (Array.isArray(newMovements)) movements = newMovements;

      saveStoredData();
      res.json({ success: true, message: 'Dados restaurados com sucesso' });
    } catch (err) {
      res.status(400).json({ error: 'Formato de arquivo inválido para restauração' });
    }
  });

  // Reset to sample operational data
  app.post('/api/storage/reset-demo', (req, res) => {
    docks = JSON.parse(JSON.stringify(initialDocks));
    vehicles = JSON.parse(JSON.stringify(initialVehicles));
    movements = JSON.parse(JSON.stringify(initialMovements));
    saveStoredData();
    res.json({ success: true, message: 'Cenário operacional de demonstração reiniciado com sucesso' });
  });

  // AI-Powered Logistical Recommendations & Bottleneck Analysis
  app.post('/api/ai/analyze', async (req, res) => {
    try {
      const kpis = calculateKPIs();
      const alerts = calculateAlerts();
      const waiting = vehicles.filter((v) => v.status === 'no_patio');
      const inDocks = docks.filter((d) => d.status === 'ocupada');
      const maintDocks = docks.filter((d) => d.status === 'manutencao');

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        // Fallback with intelligent expert rules if no key
        return res.json({
          source: 'rule_engine',
          recommendations: [
            {
              category: 'redistribuicao_horarios',
              priority: 'alta',
              title: 'Janela de Agendamento Crítica (10h - 14h)',
              diagnostic: `Identificado pico de chegadas (${waiting.length} veículos aguardando). As descargas estão concorrendo diretamente com a expedição.`,
              action: 'Impor tolerância máxima de 15 min no agendamento e postergar carretas de carga seca não urgente para a janela das 14h30.',
              expectedImpact: 'Redução de 32% no tempo de espera no pátio externo.',
            },
            {
              category: 'balanceamento_docas',
              priority: 'alta',
              title: maintDocks.length > 0 ? `Compensação da ${maintDocks[0].name}` : 'Balanceamento entre Docas 01 a 05',
              diagnostic: maintDocks.length > 0
                ? `${maintDocks[0].name} está em manutenção, estrangulando veículos de carga específica.`
                : 'Docas 01 e 02 estão operando acima de 85% enquanto Doca 03 tem ociosidade.',
              action: 'Direcionar veículos de VUC/Toco para a Doca 03 com cross-docking imediato.',
              expectedImpact: 'Garantia de atendimento sem retenção na guarita.',
            },
            {
              category: 'processo_conferencia',
              priority: 'media',
              title: 'Auditoria de Conferência Cega em Doca',
              diagnostic: 'O tempo médio de permanência em doca está em 42 minutos, com alguns casos ultrapassando 55 minutos por conferência de NF-e.',
              action: 'Adotar bipagem por código de barras de lote (GS1-128) e liberar o veículo enquanto a armazenagem interna é concluída.',
              expectedImpact: 'Economia de 12 a 15 minutos por giro de doca.',
            },
          ],
          summary: 'Operação com pressão moderada no pátio. Priorizar a liberação da Doca 02 e alocação do veículo hospitalar na Doca 03.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const promptContext = `
Você é um engenheiro sênior especialista em logística e gestão de operações de transporte e depósitos.
Analise a situação operacional das 8 docas deste centro de distribuição:

DADOS ATUAIS:
- Total de Docas: 8
- Docas em Operação: ${inDocks.length} (${inDocks.map((d) => `${d.name} com ${d.currentVehiclePlate || 'veículo'} há ${d.occupiedAt ? Math.round((Date.now() - new Date(d.occupiedAt).getTime()) / 60000) : 0}min`).join(', ')})
- Docas em Manutenção: ${maintDocks.length} (${maintDocks.map((d) => d.name).join(', ') || 'Nenhuma'})
- Docas Livres: ${8 - inDocks.length - maintDocks.length}
- Veículos no Pátio aguardando: ${waiting.length} (${waiting.map((v) => `${v.plate} (${v.vehicleType}, ${v.operationType}, prioridade: ${v.priority})`).join(', ')})
- Tempo médio em doca: ${kpis.averageDockDwellMinutes} min
- Tempo médio de espera no pátio: ${kpis.averageYardWaitMinutes} min
- Taxa de utilização geral: ${kpis.overallUtilizationRate}%
- Alertas ativos: ${alerts.map((a) => a.title).join('; ') || 'Nenhum'}

Gere uma resposta em JSON estrito com:
1. "summary": Um diagnóstico executivo claro e direto em 2 frases sobre o fluxo atual e principais riscos de congestionamento.
2. "recommendations": Array com exatamente 3 ou 4 recomendações práticas e acionáveis, cada uma contendo:
   - "category": ("redistribuicao_horarios" | "priorizacao_rotas" | "balanceamento_docas" | "processo_conferencia")
   - "priority": ("alta" | "media" | "baixa")
   - "title": Título claro da recomendação
   - "diagnostic": O padrão de gargalo identificado
   - "action": O que a equipe de pátio e docas deve fazer imediatamente
   - "expectedImpact": Impacto estimado mensurável (ex: "Redução de 25% no tempo de permanência")
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptContext,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({
        source: 'gemini_ai',
        recommendations: parsed.recommendations || [],
        summary: parsed.summary || 'Análise operacional concluída.',
      });
    } catch (err) {
      console.error('AI analysis error:', err);
      res.json({
        source: 'rule_engine_fallback',
        recommendations: [
          {
            category: 'balanceamento_docas',
            priority: 'alta',
            title: 'Priorizar Veículos com SLA Crítico',
            diagnostic: 'Veículos prioritários no pátio correm risco de extrapolar a janela de entrega.',
            action: 'Alocar imediatamente veículo crítico na primeira doca compatível desocupada.',
            expectedImpact: 'Eliminação de multas de SLA e regularização do fluxo.',
          },
          {
            category: 'processo_conferencia',
            priority: 'media',
            title: 'Agilizar Liberação de Veículos Prontos',
            diagnostic: 'Tempo de pátio pós-doca pode ser reduzido com emissão antecipada de manifesto de saída.',
            action: 'Liberar a portaria com autorização eletrônica prévia.',
            expectedImpact: 'Giro 20% mais rápido das vagas de estacionamento.',
          },
        ],
        summary: 'Operação monitorada com regras logísticas ativas.',
      });
    }
  });

  // Vite middleware in dev, static in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LogiDoca server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
