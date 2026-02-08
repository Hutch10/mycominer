/**
 * GrowLogCard Component
 * Display grow log entry with status, species, dates, and yield information
 */

'use client';

import React from 'react';
import type { GrowLogEntry } from '../utils/communityTypes';

interface GrowLogCardProps {
  log: GrowLogEntry;
  onEdit?: (log: GrowLogEntry) => void;
  onDelete?: (logId: string) => void;
  onLinkPage?: (logId: string, pageSlug: string) => void;
}

export function GrowLogCard({ log, onEdit, onDelete, onLinkPage }: GrowLogCardProps) {
  const getDaysSinceStart = () => {
    const start = new Date(log.inoculationDate).getTime();
    const now = Date.now();
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
  };

  const getStageColor = () => {
    if (log.harvestDate) return 'bg-green-900';
    if (log.fruitingStartDate) return 'bg-purple-900';
    if (log.colonizationStartDate) return 'bg-blue-900';
    return 'bg-slate-700';
  };

  const getStageLabel = () => {
    if (log.harvestDate) return 'Completed';
    if (log.fruitingStartDate) return 'Fruiting';
    if (log.colonizationStartDate) return 'Colonizing';
    return 'Inoculated';
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`${getStageColor()} text-white px-2 py-1 rounded text-sm font-medium`}>
              {getStageLabel()}
            </span>
            <h3 className="text-lg font-semibold text-white capitalize">{log.species}</h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">{log.substrate} • {log.quantity} container{log.quantity !== 1 ? 's' : ''}</p>
        </div>

        {/* Quality Rating */}
        {log.qualityRating && (
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">★{log.qualityRating}</div>
            <p className="text-xs text-slate-500">/5</p>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-sm">
        <div>
          <p className="text-slate-500 text-xs">Inoculated</p>
          <p className="text-white font-medium">{new Date(log.inoculationDate).toLocaleDateString()}</p>
        </div>
        
        {log.colonizationStartDate && (
          <div>
            <p className="text-slate-500 text-xs">Colonization</p>
            <p className="text-white font-medium">{new Date(log.colonizationStartDate).toLocaleDateString()}</p>
          </div>
        )}
        
        {log.fruitingStartDate && (
          <div>
            <p className="text-slate-500 text-xs">Fruiting</p>
            <p className="text-white font-medium">{new Date(log.fruitingStartDate).toLocaleDateString()}</p>
          </div>
        )}
        
        {log.harvestDate && (
          <div>
            <p className="text-slate-500 text-xs">Harvested</p>
            <p className="text-white font-medium">{new Date(log.harvestDate).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      {/* Environmental Parameters */}
      {Object.values(log.environmentalParameters).some(v => v !== undefined) && (
        <div className="bg-slate-700/30 rounded p-2 mb-3 text-xs">
          <p className="text-slate-400 font-medium mb-1">Environment</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-300">
            {log.environmentalParameters.temperature && (
              <div>🌡️ {log.environmentalParameters.temperature}°C</div>
            )}
            {log.environmentalParameters.humidity && (
              <div>💧 {log.environmentalParameters.humidity}%</div>
            )}
            {log.environmentalParameters.fae && (
              <div>💨 {log.environmentalParameters.fae} FAE</div>
            )}
            {log.environmentalParameters.light && (
              <div>💡 {log.environmentalParameters.light}</div>
            )}
          </div>
        </div>
      )}

      {/* Yield */}
      {log.yield && (
        <div className="bg-green-900/20 border border-green-800 rounded p-2 mb-3 text-sm">
          <p className="text-green-300 font-semibold">Yield: {log.yield}g</p>
        </div>
      )}

      {/* Observations */}
      {log.observations && (
        <div className="mb-3">
          <p className="text-slate-500 text-xs font-medium mb-1">Observations</p>
          <p className="text-slate-300 text-sm line-clamp-2">{log.observations}</p>
        </div>
      )}

      {/* Tags */}
      {log.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {log.tags.map(tag => (
            <span key={tag} className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Issues */}
      {log.issues.length > 0 && (
        <div className="mb-3">
          <p className="text-red-400 text-xs font-medium mb-1">Issues Encountered</p>
          <div className="flex flex-wrap gap-1">
            {log.issues.map(issue => (
              <span key={issue} className="bg-red-900/30 text-red-300 text-xs px-2 py-1 rounded">
                ⚠️ {issue}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-slate-700">
        <button
          onClick={() => onEdit?.(log)}
          className="flex-1 text-sm px-3 py-1 rounded bg-blue-900 hover:bg-blue-800 text-blue-100 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete?.(log.id)}
          className="flex-1 text-sm px-3 py-1 rounded bg-red-900 hover:bg-red-800 text-red-100 transition-colors"
        >
          Delete
        </button>
        <button
          onClick={() => onLinkPage?.(log.id, 'species')}
          className="flex-1 text-sm px-3 py-1 rounded bg-purple-900 hover:bg-purple-800 text-purple-100 transition-colors"
        >
          Link
        </button>
      </div>

      {/* Metadata */}
      <p className="text-xs text-slate-600 mt-2 text-right">
        {getDaysSinceStart()} days | {new Date(log.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
