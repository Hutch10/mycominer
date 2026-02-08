import { ForecastingLogCategory, ForecastingLogEntry } from './forecastingTypes';

const forecastingLog: ForecastingLogEntry[] = [];

export function addForecastLog(params: {
  category: ForecastingLogCategory;
  message: string;
  context?: ForecastingLogEntry['context'];
  details?: unknown;
}): ForecastingLogEntry {
  const entry: ForecastingLogEntry = {
    entryId: `${params.category}-${Date.now()}`,
    timestamp: new Date().toISOString(),
    category: params.category,
    message: params.message,
    context: params.context,
    details: params.details,
  };
  forecastingLog.unshift(entry);
  return entry;
}

export function getForecastLog(limit = 50): ForecastingLogEntry[] {
  return forecastingLog.slice(0, limit);
}

export function filterForecastLog(category: ForecastingLogCategory): ForecastingLogEntry[] {
  return forecastingLog.filter((e) => e.category === category);
}
