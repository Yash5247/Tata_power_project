// Simple ML model for predictive maintenance
// Generates synthetic sensor data and predictions

interface SensorData {
  temperature: number;
  vibration: number;
  pressure: number;
  current: number;
  timestamp: string;
}

interface Prediction {
  equipmentId: string;
  healthScore: number;
  failureProbability: number;
  status: 'healthy' | 'warning' | 'critical';
  nextMaintenance?: string;
}

// Generate synthetic sensor data
export function generateSensorData(): SensorData {
  const baseTemp = 45 + Math.random() * 15;
  const baseVibration = 2 + Math.random() * 3;
  const basePressure = 100 + Math.random() * 20;
  const baseCurrent = 10 + Math.random() * 5;

  return {
    temperature: Math.round(baseTemp * 10) / 10,
    vibration: Math.round(baseVibration * 100) / 100,
    pressure: Math.round(basePressure * 10) / 10,
    current: Math.round(baseCurrent * 100) / 100,
    timestamp: new Date().toISOString(),
  };
}

// Simple prediction algorithm
export function predictFailure(sensorData: SensorData): Prediction {
  const { temperature, vibration, pressure, current } = sensorData;
  
  // Calculate health score (0-100)
  let healthScore = 100;
  
  // Temperature factor (optimal: 40-60°C)
  if (temperature > 70 || temperature < 30) healthScore -= 30;
  else if (temperature > 60 || temperature < 40) healthScore -= 15;
  
  // Vibration factor (optimal: < 3.5)
  if (vibration > 5) healthScore -= 25;
  else if (vibration > 4) healthScore -= 15;
  
  // Pressure factor (optimal: 100-120)
  if (pressure > 130 || pressure < 90) healthScore -= 20;
  else if (pressure > 120 || pressure < 100) healthScore -= 10;
  
  // Current factor (optimal: 10-15)
  if (current > 18 || current < 8) healthScore -= 20;
  else if (current > 15 || current < 10) healthScore -= 10;
  
  healthScore = Math.max(0, Math.min(100, healthScore));
  
  // Calculate failure probability (inverse of health)
  const failureProbability = Math.round((100 - healthScore) * 10) / 10;
  
  // Determine status
  let status: 'healthy' | 'warning' | 'critical';
  if (healthScore >= 80) status = 'healthy';
  else if (healthScore >= 60) status = 'warning';
  else status = 'critical';
  
  // Calculate next maintenance date (if needed)
  let nextMaintenance: string | undefined;
  if (healthScore < 70) {
    const daysUntilMaintenance = Math.ceil((70 - healthScore) / 2);
    const date = new Date();
    date.setDate(date.getDate() + daysUntilMaintenance);
    nextMaintenance = date.toISOString().split('T')[0];
  }
  
  return {
    equipmentId: `EQ-${Math.floor(Math.random() * 24) + 1}`,
    healthScore: Math.round(healthScore * 10) / 10,
    failureProbability,
    status,
    nextMaintenance,
  };
}

// Generate equipment data
export function generateEquipmentData(count: number = 24): Array<Prediction & { sensorData: SensorData }> {
  return Array.from({ length: count }, () => {
    const sensorData = generateSensorData();
    const prediction = predictFailure(sensorData);
    return {
      ...prediction,
      sensorData,
    };
  });
}

