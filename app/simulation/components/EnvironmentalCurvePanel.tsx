'use client';

import { EnvironmentalCurve } from '@/app/simulation/engine/simulationTypes';

export default function EnvironmentalCurvePanel({ curve }: { curve: EnvironmentalCurve }) {
  const { dataPoints, stability, deviations } = curve;

  const avgTemp =
    dataPoints.length > 0
      ? (dataPoints.reduce((sum, d) => sum + d.temperatureC, 0) / dataPoints.length).toFixed(1)
      : '0';
  const avgHumidity =
    dataPoints.length > 0
      ? (dataPoints.reduce((sum, d) => sum + d.humidityPercent, 0) / dataPoints.length).toFixed(1)
      : '0';
  const avgCO2 =
    dataPoints.length > 0
      ? Math.round(dataPoints.reduce((sum, d) => sum + d.co2Ppm, 0) / dataPoints.length)
      : 0;

  const stabilityColor = {
    stable: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    drifting: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    oscillating: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
  }[stability];

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">Environmental Curve</h4>
        <span className={`px-2 py-1 text-xs rounded ${stabilityColor}`}>
          {stability}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm mb-3">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-xs">Avg Temp</p>
          <p className="font-medium">{avgTemp}°C</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-xs">Avg Humidity</p>
          <p className="font-medium">{avgHumidity}%</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-xs">Avg CO₂</p>
          <p className="font-medium">{avgCO2} ppm</p>
        </div>
      </div>

      {deviations.length > 0 && (
        <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
          <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Deviations:</p>
          <ul className="list-disc list-inside text-xs text-yellow-700 dark:text-yellow-300 space-y-0.5">
            {deviations.slice(0, 3).map((dev, idx) => (
              <li key={idx}>{dev}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-3">
        {dataPoints.length} data points over {((curve.endTime - curve.startTime) / 60000).toFixed(0)} minutes
      </p>
    </div>
  );
}
