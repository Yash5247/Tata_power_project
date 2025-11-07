// Enhanced ML model for predictive maintenance
// Generates realistic synthetic sensor data with patterns and trends

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
  sensorData: SensorData;
}

// Equipment base states - some equipment are in worse condition
const equipmentStates: Record<string, { baseHealth: number; degradation: number }> = {};

// Initialize equipment states with realistic distribution
function initializeEquipmentStates() {
  for (let i = 1; i <= 24; i++) {
    const id = `EQ-${i}`;
    // Create realistic distribution: 70% healthy, 20% warning, 10% critical
    const rand = Math.random();
    if (rand < 0.7) {
      // Healthy equipment
      equipmentStates[id] = {
        baseHealth: 75 + Math.random() * 20, // 75-95
        degradation: 0.1 + Math.random() * 0.2, // Slow degradation
      };
    } else if (rand < 0.9) {
      // Warning equipment
      equipmentStates[id] = {
        baseHealth: 55 + Math.random() * 15, // 55-70
        degradation: 0.3 + Math.random() * 0.4, // Moderate degradation
      };
    } else {
      // Critical equipment
      equipmentStates[id] = {
        baseHealth: 30 + Math.random() * 20, // 30-50
        degradation: 0.5 + Math.random() * 0.5, // Fast degradation
      };
    }
  }
}

// Initialize on first load
if (Object.keys(equipmentStates).length === 0) {
  initializeEquipmentStates();
}

// Generate realistic sensor data based on equipment health
export function generateSensorData(equipmentId?: string, healthScore?: number): SensorData {
  const baseHealth = healthScore || 80;
  
  // Base values for healthy equipment
  const optimalTemp = 50;
  const optimalVib = 2.5;
  const optimalPress = 110;
  const optimalCurrent = 12.5;
  
  // Deviation based on health (worse health = more deviation)
  const healthFactor = (100 - baseHealth) / 100;
  
  // Temperature varies more when unhealthy
  const tempDeviation = 10 + healthFactor * 25;
  const temperature = optimalTemp + (Math.random() - 0.5) * tempDeviation * 2;
  
  // Vibration increases with poor health
  const vibration = optimalVib + healthFactor * 3 + Math.random() * 1;
  
  // Pressure becomes unstable with poor health
  const pressure = optimalPress + (Math.random() - 0.5) * (10 + healthFactor * 30);
  
  // Current fluctuates more when unhealthy
  const current = optimalCurrent + (Math.random() - 0.5) * (3 + healthFactor * 5);
  
  return {
    temperature: Math.round(Math.max(20, Math.min(85, temperature)) * 10) / 10,
    vibration: Math.round(Math.max(0.5, Math.min(6, vibration)) * 100) / 100,
    pressure: Math.round(Math.max(80, Math.min(140, pressure)) * 10) / 10,
    current: Math.round(Math.max(5, Math.min(20, current)) * 100) / 100,
    timestamp: new Date().toISOString(),
  };
}

// Enhanced prediction algorithm
export function predictFailure(sensorData: SensorData, equipmentId?: string): Prediction {
  const { temperature, vibration, pressure, current } = sensorData;
  
  // Get base health for this equipment
  let baseHealth = 80;
  if (equipmentId && equipmentStates[equipmentId]) {
    baseHealth = equipmentStates[equipmentId].baseHealth;
    // Apply gradual degradation
    equipmentStates[equipmentId].baseHealth -= equipmentStates[equipmentId].degradation * 0.01;
    equipmentStates[equipmentId].baseHealth = Math.max(20, equipmentStates[equipmentId].baseHealth);
  }
  
  // Calculate health score (0-100)
  let healthScore = baseHealth;
  
  // Temperature factor (optimal: 40-60°C)
  if (temperature > 75 || temperature < 25) healthScore -= 35;
  else if (temperature > 65 || temperature < 35) healthScore -= 20;
  else if (temperature > 60 || temperature < 40) healthScore -= 10;
  
  // Vibration factor (optimal: < 3.5)
  if (vibration > 5.5) healthScore -= 30;
  else if (vibration > 4.5) healthScore -= 20;
  else if (vibration > 3.5) healthScore -= 10;
  
  // Pressure factor (optimal: 100-120)
  if (pressure > 135 || pressure < 85) healthScore -= 25;
  else if (pressure > 125 || pressure < 95) healthScore -= 15;
  else if (pressure > 120 || pressure < 100) healthScore -= 8;
  
  // Current factor (optimal: 10-15)
  if (current > 19 || current < 6) healthScore -= 25;
  else if (current > 17 || current < 8) healthScore -= 15;
  else if (current > 15 || current < 10) healthScore -= 8;
  
  healthScore = Math.max(0, Math.min(100, healthScore));
  
  // Calculate failure probability
  const failureProbability = Math.round((100 - healthScore) * 10) / 10;
  
  // Determine status
  let status: 'healthy' | 'warning' | 'critical';
  if (healthScore >= 80) status = 'healthy';
  else if (healthScore >= 60) status = 'warning';
  else status = 'critical';
  
  // Calculate next maintenance date
  let nextMaintenance: string | undefined;
  if (healthScore < 75) {
    const daysUntilMaintenance = Math.max(1, Math.ceil((75 - healthScore) / 3));
    const date = new Date();
    date.setDate(date.getDate() + daysUntilMaintenance);
    nextMaintenance = date.toISOString();
  }
  
  const eqId = equipmentId || `EQ-${Math.floor(Math.random() * 24) + 1}`;
  
  return {
    equipmentId: eqId,
    healthScore: Math.round(healthScore * 10) / 10,
    failureProbability,
    status,
    nextMaintenance,
    sensorData,
  };
}

// Generate equipment data with consistent IDs and realistic distribution
export function generateEquipmentData(count: number = 24): Array<Prediction & { sensorData: SensorData }> {
  return Array.from({ length: count }, (_, index) => {
    const equipmentId = `EQ-${index + 1}`;
    
    // Get or initialize equipment state
    if (!equipmentStates[equipmentId]) {
      const rand = Math.random();
      if (rand < 0.7) {
        equipmentStates[equipmentId] = {
          baseHealth: 75 + Math.random() * 20,
          degradation: 0.1 + Math.random() * 0.2,
        };
      } else if (rand < 0.9) {
        equipmentStates[equipmentId] = {
          baseHealth: 55 + Math.random() * 15,
          degradation: 0.3 + Math.random() * 0.4,
        };
      } else {
        equipmentStates[equipmentId] = {
          baseHealth: 30 + Math.random() * 20,
          degradation: 0.5 + Math.random() * 0.5,
        };
      }
    }
    
    const baseHealth = equipmentStates[equipmentId].baseHealth;
    const sensorData = generateSensorData(equipmentId, baseHealth);
    const prediction = predictFailure(sensorData, equipmentId);
    
    return {
      ...prediction,
      sensorData,
    };
  });
}

// Generate historical sensor data with trends
export function generateHistoricalData(days: number = 7): SensorData[] {
  const data: SensorData[] = [];
  const now = new Date();
  const hours = days * 24;
  
  // Generate data points every hour
  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    
    // Create realistic patterns with some variation
    const hour = timestamp.getHours();
    const dayOfWeek = timestamp.getDay();
    
    // Simulate daily patterns (equipment works harder during day)
    const dailyFactor = 0.8 + (hour >= 8 && hour <= 18 ? 0.2 : 0);
    
    // Add some random equipment selection for variety
    const equipmentIndex = Math.floor(Math.random() * 24) + 1;
    const equipmentId = `EQ-${equipmentIndex}`;
    
    if (!equipmentStates[equipmentId]) {
      equipmentStates[equipmentId] = {
        baseHealth: 70 + Math.random() * 25,
        degradation: 0.1 + Math.random() * 0.3,
      };
    }
    
    const baseHealth = equipmentStates[equipmentId].baseHealth;
    const healthFactor = (100 - baseHealth) / 100;
    
    // Base values with daily patterns
    const optimalTemp = 50 + dailyFactor * 5;
    const optimalVib = 2.5 + dailyFactor * 0.5;
    const optimalPress = 110 + dailyFactor * 5;
    const optimalCurrent = 12.5 + dailyFactor * 1.5;
    
    // Add realistic variation and trends
    const tempDeviation = 8 + healthFactor * 20;
    const temperature = optimalTemp + (Math.random() - 0.5) * tempDeviation * 2;
    
    const vibration = optimalVib + healthFactor * 2.5 + Math.random() * 0.8;
    
    const pressure = optimalPress + (Math.random() - 0.5) * (8 + healthFactor * 25);
    
    const current = optimalCurrent + (Math.random() - 0.5) * (2.5 + healthFactor * 4);
    
    // Add occasional anomalies (5% chance)
    let anomaly = false;
    if (Math.random() < 0.05) {
      anomaly = true;
      if (Math.random() < 0.5) {
        // Temperature spike
        data.push({
          temperature: Math.round((temperature + 15 + Math.random() * 10) * 10) / 10,
          vibration: Math.round(Math.max(0.5, Math.min(6, vibration + 1)) * 100) / 100,
          pressure: Math.round(Math.max(80, Math.min(140, pressure)) * 10) / 10,
          current: Math.round(Math.max(5, Math.min(20, current)) * 100) / 100,
          timestamp: timestamp.toISOString(),
        });
      } else {
        // Vibration spike
        data.push({
          temperature: Math.round(Math.max(20, Math.min(85, temperature)) * 10) / 10,
          vibration: Math.round(Math.min(6, vibration + 2 + Math.random() * 1) * 100) / 100,
          pressure: Math.round(Math.max(80, Math.min(140, pressure)) * 10) / 10,
          current: Math.round(Math.max(5, Math.min(20, current)) * 100) / 100,
          timestamp: timestamp.toISOString(),
        });
      }
    } else {
      data.push({
        temperature: Math.round(Math.max(20, Math.min(85, temperature)) * 10) / 10,
        vibration: Math.round(Math.max(0.5, Math.min(6, vibration)) * 100) / 100,
        pressure: Math.round(Math.max(80, Math.min(140, pressure)) * 10) / 10,
        current: Math.round(Math.max(5, Math.min(20, current)) * 100) / 100,
        timestamp: timestamp.toISOString(),
      });
    }
  }
  
  return data;
}
