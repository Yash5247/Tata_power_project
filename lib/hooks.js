"use client";
import useSWR from 'swr';
import { api } from './api';

// Shared fetchers
const getFetcher = (url) => api.get(url).then((r) => r.data);
const onErrorRetry = (error, key, config, revalidate, { retryCount }) => {
  // Do not retry on 404 or 401
  if (error?.response?.status === 404 || error?.response?.status === 401) return;
  if (retryCount >= 5) return;
  setTimeout(() => revalidate({ retryCount }), Math.min(1000 * Math.pow(2, retryCount), 15000));
};

export function useEquipmentData() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/equipment-status',
    getFetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: false,
      onErrorRetry,
    }
  );
  return { data, error, isLoading, refresh: mutate };
}

export function useAlerts() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/alerts',
    getFetcher,
    {
      refreshInterval: 3000,
      revalidateOnFocus: false,
      onErrorRetry,
    }
  );
  return { data, error, isLoading, refresh: mutate };
}

export function useSensorData() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/sensor-data',
    getFetcher,
    {
      refreshInterval: 2000,
      revalidateOnFocus: false,
      onErrorRetry,
    }
  );
  return { data, error, isLoading, refresh: mutate };
}

// metrics: { temperature, vibration, pressure, current } or null to disable
export function usePredictions(metrics) {
  const key = metrics && typeof metrics === 'object'
    ? `/api/predict?temperature=${encodeURIComponent(metrics.temperature)}&vibration=${encodeURIComponent(metrics.vibration)}&pressure=${encodeURIComponent(metrics.pressure)}&current=${encodeURIComponent(metrics.current)}`
    : null;
  const { data, error, isLoading, mutate } = useSWR(
    key,
    getFetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      shouldRetryOnError: true,
      onErrorRetry,
    }
  );
  return { data, error, isLoading, refresh: mutate };
}


