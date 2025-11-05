'use client';

import { useParams } from 'next/navigation';
import { usePredictions, useHistoricalData } from '@/lib/hooks';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function EquipmentDetailPage() {
  const params = useParams();
  const equipmentId = params.id as string;
  const { data: predictionsData } = usePredictions();
  const { data: historicalData } = useHistoricalData(30);

  const equipment = predictionsData?.equipment?.find((eq: any) => eq.equipmentId === equipmentId);

  if (!equipment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Equipment Not Found</h1>
          <p className="text-gray-600">The equipment with ID {equipmentId} could not be found.</p>
        </div>
      </div>
    );
  }

  const chartData = historicalData?.data?.slice(-168).map((point: any) => ({
    time: new Date(point.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    temperature: point.temperature,
    vibration: point.vibration * 10,
    pressure: point.pressure,
    current: point.current,
  })) || [];

  const getStatusColor = (status: string) => {
    if (status === 'healthy') return 'bg-green-100 text-green-800';
    if (status === 'warning') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <a
            href="/"
            className="inline-flex items-center text-white hover:text-blue-200 mb-4"
          >
            ← Back to Dashboard
          </a>
          <h1 className="text-4xl font-bold text-white mb-2">{equipmentId}</h1>
          <p className="text-blue-100">Equipment Details & History</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Status</h3>
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-600">Current Status</span>
                <div className={`mt-1 px-3 py-2 rounded-full inline-block font-semibold ${getStatusColor(equipment.status)}`}>
                  {equipment.status.toUpperCase()}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Health Score</span>
                <div className="text-3xl font-bold text-gray-800 mt-1">{equipment.healthScore}%</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Failure Risk</span>
                <div className="text-3xl font-bold text-red-600 mt-1">{equipment.failureProbability}%</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Current Sensor Readings</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Temperature</span>
                <span className="font-semibold">{equipment.sensorData?.temperature}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vibration</span>
                <span className="font-semibold">{equipment.sensorData?.vibration} mm/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pressure</span>
                <span className="font-semibold">{equipment.sensorData?.pressure} psi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current</span>
                <span className="font-semibold">{equipment.sensorData?.current} A</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Maintenance</h3>
            <div className="space-y-4">
              {equipment.nextMaintenance ? (
                <>
                  <div>
                    <span className="text-sm text-gray-600">Next Scheduled</span>
                    <div className="text-lg font-semibold text-gray-800 mt-1">
                      {new Date(equipment.nextMaintenance).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Days Until</span>
                    <div className="text-2xl font-bold text-blue-600 mt-1">
                      {Math.ceil(
                        (new Date(equipment.nextMaintenance).getTime() - new Date().getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No maintenance scheduled
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">30-Day Sensor History</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} name="Temperature (°C)" />
              <Line type="monotone" dataKey="vibration" stroke="#3b82f6" strokeWidth={2} name="Vibration (x10)" />
              <Line type="monotone" dataKey="pressure" stroke="#10b981" strokeWidth={2} name="Pressure (psi)" />
              <Line type="monotone" dataKey="current" stroke="#f59e0b" strokeWidth={2} name="Current (A)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

