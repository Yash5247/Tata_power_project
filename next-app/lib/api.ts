import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export const api = axios.create({ baseURL });

export async function getSensorData() {
  const res = await api.get('/api/sensor-data');
  return res.data;
}

export async function postPrediction(metrics: any) {
  const res = await api.post('/api/predictions', metrics);
  return res.data;
}


