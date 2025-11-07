import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useSensorData() {
  const { data, error, isLoading, mutate } = useSWR('/api/sensor-data', fetcher, {
    refreshInterval: 5000, // Refresh every 5 seconds
  });
  
  return { data, error, isLoading, mutate };
}

export function usePredictions() {
  const { data, error, isLoading, mutate } = useSWR('/api/predictions', fetcher, {
    refreshInterval: 10000, // Refresh every 10 seconds
  });
  
  return { data, error, isLoading, mutate };
}

export function useAlerts() {
  const { data, error, isLoading, mutate } = useSWR('/api/alerts', fetcher, {
    refreshInterval: 8000, // Refresh every 8 seconds
  });
  
  return { data, error, isLoading, mutate };
}

export function useHistoricalData(days: number = 7) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/historical/${days}`,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );
  
  return { data, error, isLoading, mutate };
}

