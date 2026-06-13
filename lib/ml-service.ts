import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

export interface SensorData {
  temperature: number;
  vibration: number;
  pressure: number;
  current: number;
  airTemperature?: number;
  rotationalSpeed?: number;
  torque?: number;
  toolWear?: number;
  tempDelta?: number;
  timestamp: string;
}

export interface EquipmentPrediction {
  equipmentId: string;
  productId?: string;
  type?: string;
  healthScore: number;
  failureProbability: number;
  riskScore: number;
  riskCategory: string;
  status: 'healthy' | 'warning' | 'critical';
  failurePrediction: number;
  nextMaintenance?: string;
  maintenanceAction: string;
  maintenancePriority: string;
  maintenanceDescription: string;
  sensorData: SensorData;
  failureTypes?: Record<string, number>;
  actualFailure?: number;
}

export interface ModelMetadata {
  best_model: string;
  dataset: string;
  dataset_size: number;
  failure_rate: number;
  comparison: Array<{
    model: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
  }>;
  best_metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
  };
  feature_importance: Array<{ feature: string; importance: number }>;
}

const ROOT = process.cwd();

function readJsonFile<T>(filePath: string): T | null {
  try {
    const fullPath = path.join(ROOT, filePath);
    if (!fs.existsSync(fullPath)) return null;
    return JSON.parse(fs.readFileSync(fullPath, 'utf-8')) as T;
  } catch {
    return null;
  }
}

export function getModelMetadata(): ModelMetadata | null {
  return readJsonFile<ModelMetadata>('models/model_metadata.json');
}

export function getEquipmentPredictions(): { equipment: EquipmentPrediction[]; generated_at: string } | null {
  return readJsonFile('data/equipment_predictions.json');
}

export function getAlertsData(): {
  alerts: Array<{
    id: string;
    equipmentId: string;
    type: string;
    message: string;
    timestamp: string;
    riskCategory: string;
  }>;
  criticalCount: number;
  warningCount: number;
  totalCount: number;
} | null {
  return readJsonFile('data/alerts.json');
}

export function refreshPredictionsViaPython(): Promise<boolean> {
  return new Promise((resolve) => {
    const python = spawn('python', ['predict.py'], { cwd: ROOT, shell: true });
    python.on('close', (code) => resolve(code === 0));
    python.on('error', () => resolve(false));
  });
}

export function generateHistoricalData(
  days: number = 7,
  equipment?: EquipmentPrediction
): SensorData[] {
  const data: SensorData[] = [];
  const now = new Date();
  const hours = days * 24;
  const base = equipment?.sensorData;

  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = timestamp.getHours();
    const dailyFactor = 0.8 + (hour >= 8 && hour <= 18 ? 0.2 : 0);
    const noise = () => (Math.random() - 0.5) * 2;

    if (base) {
      data.push({
        temperature: Math.round((base.temperature + noise() * 3 * dailyFactor) * 10) / 10,
        vibration: Math.round((base.vibration + noise() * 0.3) * 100) / 100,
        pressure: Math.round((base.pressure + noise() * 5) * 10) / 10,
        current: Math.round((base.current + noise() * 0.5) * 100) / 100,
        timestamp: timestamp.toISOString(),
      });
    } else {
      data.push({
        temperature: Math.round((50 + noise() * 10 * dailyFactor) * 10) / 10,
        vibration: Math.round((2.5 + noise() * 0.5) * 100) / 100,
        pressure: Math.round((110 + noise() * 8) * 10) / 10,
        current: Math.round((12.5 + noise() * 1.5) * 100) / 100,
        timestamp: timestamp.toISOString(),
      });
    }
  }

  return data;
}

export function getSummaryStats(equipment: EquipmentPrediction[]) {
  const healthy = equipment.filter((e) => e.status === 'healthy').length;
  const warning = equipment.filter((e) => e.status === 'warning').length;
  const critical = equipment.filter((e) => e.status === 'critical').length;

  const riskDistribution = {
    Healthy: equipment.filter((e) => e.riskCategory === 'Healthy').length,
    'Low Risk': equipment.filter((e) => e.riskCategory === 'Low Risk').length,
    'Medium Risk': equipment.filter((e) => e.riskCategory === 'Medium Risk').length,
    'High Risk': equipment.filter((e) => e.riskCategory === 'High Risk').length,
    Critical: equipment.filter((e) => e.riskCategory === 'Critical').length,
  };

  const avgHealth =
    equipment.length > 0
      ? Math.round(equipment.reduce((s, e) => s + e.healthScore, 0) / equipment.length)
      : 0;

  const avgRisk =
    equipment.length > 0
      ? Math.round(equipment.reduce((s, e) => s + e.riskScore, 0) / equipment.length)
      : 0;

  return {
    total: equipment.length,
    healthy,
    warning,
    critical,
    riskDistribution,
    avgHealth,
    avgRisk,
  };
}
