/**
 * Grow Logs Manager Page
 * Create, view, filter, and manage grow logs
 */

'use client';

import React, { useState, useEffect } from 'react';
import { GrowLogCard } from '../components/GrowLogCard';
import { TagSelector } from '../components/TagSelector';
import {
  getGrowLogs,
  createGrowLog,
  updateGrowLog,
  deleteGrowLog,
  filterGrowLogs,
  getLogTags,
  getLoggedSpecies,
  getLoggedSubstrates,
  exportGrowLogs,
  importGrowLogs,
  validateGrowLog,
} from '../utils/growLogSystem';
import { exportAllData, downloadFile, importData } from '../utils/exportImportSystem';
import type { GrowLogEntry } from '../utils/communityTypes';

type FormState = {
  species: string;
  substrate: string;
  quantity: number;
  startDate: string;
  inoculationDate: string;
  colonizationStartDate: string;
  fruitingStartDate: string;
  harvestDate: string;
  temperature: number;
  humidity: number;
  fae: number;
  lightHours: number;
  observations: string;
  issues: string[];
  yieldGrams: number;
  qualityRating: 1 | 2 | 3 | 4 | 5;
  tags: string[];
};

const MUSHROOM_SPECIES = [
  'oyster', 'shiitake', 'lions-mane', 'reishi', 'cordyceps',
  'turkey-tail', 'chestnut', 'enoki', 'king-oyster', 'pioppino', 'maitake', 'chaga'
];

const SUBSTRATES = [
  'hardwood sawdust', 'straw', 'wood chips', 'coffee grounds', 'compost',
  'cardboard', 'logs', 'grain', 'bran', 'hemp hurd', 'rice husk', 'tea grounds'
];

export default function GrowLogsPage() {
  const [logs, setLogs] = useState<GrowLogEntry[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<FormState>({
    species: '',
    substrate: '',
    quantity: 1,
    startDate: new Date().toISOString().split('T')[0],
    inoculationDate: new Date().toISOString().split('T')[0],
    colonizationStartDate: '',
    fruitingStartDate: '',
    harvestDate: '',
    temperature: 20,
    humidity: 65,
    fae: 2,
    lightHours: 12,
    observations: '',
    issues: [],
    yieldGrams: 0,
    qualityRating: 3 as 1 | 2 | 3 | 4 | 5,
    tags: [],
  });

  // Filter state
  const [filters, setFilters] = useState({
    species: '',
    substrate: '',
    startDate: '',
    endDate: '',
    minQuality: 0,
    tags: [] as string[],
  });

  useEffect(() => {
    const allLogs = getGrowLogs();
    setLogs(allLogs);
    setAllTags(getLogTags());
  }, []);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    const filtered = filterGrowLogs(newFilters);
    setLogs(filtered);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const entry: GrowLogEntry = {
      id: editingId || crypto.randomUUID(),
      timestamp: formData.startDate,
      species: formData.species,
      substrate: formData.substrate,
      quantity: formData.quantity,
      inoculationDate: formData.inoculationDate,
      colonizationStartDate: formData.colonizationStartDate || undefined,
      fruitingStartDate: formData.fruitingStartDate || undefined,
      harvestDate: formData.harvestDate || undefined,
      environmentalParameters: {
        temperature: formData.temperature,
        humidity: formData.humidity,
        fae: formData.fae,
        light: `${formData.lightHours}h`,
      },
      observations: formData.observations,
      issues: formData.issues,
      tags: formData.tags,
      yield: formData.yieldGrams,
      qualityRating: formData.qualityRating,
      isPrivate: true,
      linkedPages: [],
      createdAt: editingId ? new Date(logs.find(l => l.id === editingId)?.createdAt || Date.now()).toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const validation = validateGrowLog(entry);
    if (!validation.valid) {
      alert(`Validation errors:\n${validation.errors.join('\n')}`);
      return;
    }

    if (editingId) {
      updateGrowLog(editingId, entry);
    } else {
      createGrowLog(entry);
    }

    setLogs(getGrowLogs());
    setAllTags(getLogTags());
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      species: '',
      substrate: '',
      quantity: 1,
      startDate: new Date().toISOString().split('T')[0],
      inoculationDate: new Date().toISOString().split('T')[0],
      colonizationStartDate: '',
      fruitingStartDate: '',
      harvestDate: '',
      temperature: 20,
      humidity: 65,
      fae: 2,
      lightHours: 12,
      observations: '',
      issues: [],
      yieldGrams: 0,
      qualityRating: 3 as 1 | 2 | 3 | 4 | 5,
      tags: [],
    });
  };

  const handleDeleteLog = (logId: string) => {
    if (confirm('Delete this grow log?')) {
      deleteGrowLog(logId);
      setLogs(getGrowLogs());
    }
  };

  const handleExport = () => {
    const data = exportAllData();
    downloadFile(JSON.stringify(data, null, 2), 'mushroom-community-backup.json');
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      const text = await file.text();
      try {
        JSON.parse(text); // validate JSON
        importData(text, { mergeStrategy: 'merge', preserveTimestamps: true, validateData: true });
        setLogs(getGrowLogs());
        setAllTags(getLogTags());
        alert('Data imported successfully!');
      } catch (err) {
        alert('Failed to import data: ' + (err instanceof Error ? err.message : 'Unknown error'));
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900 to-emerald-900 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">📝 Grow Logs</h1>
          <p className="text-green-200 text-lg">
            Track your cultivation progress with detailed grow logs
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Actions */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-green-900 hover:bg-green-800 text-white rounded-lg font-medium transition-colors"
          >
            {showForm ? '✕ Cancel' : '+ New Grow Log'}
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-medium transition-colors"
          >
            ⬇ Export
          </button>
          <button
            onClick={handleImport}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-medium transition-colors"
          >
            ⬆ Import
          </button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">{editingId ? 'Edit' : 'New'} Grow Log</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Species */}
                <div>
                  <label className="block text-sm font-medium mb-1">Species</label>
                  <select
                    value={formData.species}
                    onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    required
                  >
                    <option value="">Select species...</option>
                    {MUSHROOM_SPECIES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Substrate */}
                <div>
                  <label className="block text-sm font-medium mb-1">Substrate</label>
                  <select
                    value={formData.substrate}
                    onChange={(e) => setFormData({ ...formData, substrate: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    required
                  >
                    <option value="">Select substrate...</option>
                    {SUBSTRATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity (jars/bags)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    required
                  />
                </div>

                {/* Inoculation Date */}
                <div>
                  <label className="block text-sm font-medium mb-1">Inoculation Date</label>
                  <input
                    type="date"
                    value={formData.inoculationDate}
                    onChange={(e) => setFormData({ ...formData, inoculationDate: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    required
                  />
                </div>

                {/* Colonization Date */}
                <div>
                  <label className="block text-sm font-medium mb-1">Colonization Start Date (optional)</label>
                  <input
                    type="date"
                    value={formData.colonizationStartDate}
                    onChange={(e) => setFormData({ ...formData, colonizationStartDate: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  />
                </div>

                {/* Fruiting Date */}
                <div>
                  <label className="block text-sm font-medium mb-1">Fruiting Start Date (optional)</label>
                  <input
                    type="date"
                    value={formData.fruitingStartDate}
                    onChange={(e) => setFormData({ ...formData, fruitingStartDate: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  />
                </div>

                {/* Harvest Date */}
                <div>
                  <label className="block text-sm font-medium mb-1">Harvest Date (optional)</label>
                  <input
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  />
                </div>

                {/* Temperature */}
                <div>
                  <label className="block text-sm font-medium mb-1">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  />
                </div>

                {/* Humidity */}
                <div>
                  <label className="block text-sm font-medium mb-1">Humidity (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.humidity}
                    onChange={(e) => setFormData({ ...formData, humidity: parseInt(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  />
                </div>

                {/* FAE */}
                <div>
                  <label className="block text-sm font-medium mb-1">Fresh Air Exchanges/day</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.fae}
                    onChange={(e) => setFormData({ ...formData, fae: parseFloat(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  />
                </div>

                {/* Light Hours */}
                <div>
                  <label className="block text-sm font-medium mb-1">Light Hours/day</label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={formData.lightHours}
                    onChange={(e) => setFormData({ ...formData, lightHours: parseInt(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  />
                </div>

                {/* Yield */}
                <div>
                  <label className="block text-sm font-medium mb-1">Yield (grams)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.yieldGrams}
                    onChange={(e) => setFormData({ ...formData, yieldGrams: parseFloat(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  />
                </div>

                {/* Quality Rating */}
                <div>
                  <label className="block text-sm font-medium mb-1">Quality Rating (1-5)</label>
                  <select
                    value={formData.qualityRating}
                    onChange={(e) => setFormData({ ...formData, qualityRating: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  >
                    <option value="1">⭐ Poor</option>
                    <option value="2">⭐⭐ Fair</option>
                    <option value="3">⭐⭐⭐ Good</option>
                    <option value="4">⭐⭐⭐⭐ Very Good</option>
                    <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                  </select>
                </div>
              </div>

              {/* Observations */}
              <div>
                <label className="block text-sm font-medium mb-1">Observations</label>
                <textarea
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  placeholder="Record any observations about this grow..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <TagSelector
                  availableTags={['slow-colonization', 'contamination', 'high-yield', 'beautiful-caps', 'outdoor', 'first-attempt']}
                  selectedTags={formData.tags}
                  onTagsChange={(tags) => setFormData({ ...formData, tags })}
                  maxTags={10}
                  allowCustom={true}
                />
              </div>

              {/* Submit */}
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-900 hover:bg-green-800 text-white rounded-lg font-medium transition-colors"
                >
                  {editingId ? 'Update' : 'Create'} Grow Log
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Filter Logs</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Species</label>
              <select
                value={filters.species}
                onChange={(e) => handleFilterChange('species', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
              >
                <option value="">All species</option>
                {getLoggedSpecies().map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Substrate</label>
              <select
                value={filters.substrate}
                onChange={(e) => handleFilterChange('substrate', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
              >
                <option value="">All substrates</option>
                {getLoggedSubstrates().map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Min Quality</label>
              <select
                value={filters.minQuality}
                onChange={(e) => handleFilterChange('minQuality', parseInt(e.target.value))}
                className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
              >
                <option value="0">All qualities</option>
                <option value="3">Good+</option>
                <option value="4">Very Good+</option>
                <option value="5">Excellent</option>
              </select>
            </div>

            <div>
              <button
                onClick={() => {
                  setFilters({
                    species: '',
                    substrate: '',
                    startDate: '',
                    endDate: '',
                    minQuality: 0,
                    tags: [],
                  });
                  setLogs(getGrowLogs());
                }}
                className="w-full px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Logs Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {logs.length > 0 ? (
            logs.map(log => (
              <GrowLogCard
                key={log.id}
                log={log}
                onDelete={handleDeleteLog}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-400 text-lg">No grow logs found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
