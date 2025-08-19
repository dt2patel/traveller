
import { useCallback } from 'react';

const ANALYTICS_STORAGE_KEY = 'local-analytics';

interface AnalyticsData {
  eventCounts: Record<string, number>;
  lastLogged: Record<string, string>;
}

export const useAnalytics = () => {
  const logEvent = useCallback((eventName: string) => {
    try {
      const storedData = localStorage.getItem(ANALYTICS_STORAGE_KEY);
      const data: AnalyticsData = storedData ? JSON.parse(storedData) : { eventCounts: {}, lastLogged: {} };

      data.eventCounts[eventName] = (data.eventCounts[eventName] || 0) + 1;
      data.lastLogged[eventName] = new Date().toISOString();

      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Could not log analytics event:', error);
    }
  }, []);

  return { logEvent };
};
