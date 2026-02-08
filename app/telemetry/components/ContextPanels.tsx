'use client';

interface ContextPanelsProps {
  species: string;
  stage: string;
  onSpeciesChange: (species: string) => void;
  onStageChange: (stage: string) => void;
}

const speciesList = [
  { id: 'oyster', label: 'Oyster Mushroom' },
  { id: 'shiitake', label: 'Shiitake' },
  { id: 'lions-mane', label: 'Lion\'s Mane' },
  { id: 'reishi', label: 'Reishi' },
  { id: 'turkey-tail', label: 'Turkey Tail' },
  { id: 'king-oyster', label: 'King Oyster' },
  { id: 'enoki', label: 'Enoki' },
  { id: 'pioppino', label: 'Pioppino' },
  { id: 'chestnut', label: 'Chestnut' },
  { id: 'cordyceps', label: 'Cordyceps' },
  { id: 'chaga', label: 'Chaga' },
  { id: 'maitake', label: 'Maitake' },
];

const stages = [
  { id: 'spawn-inoculation', label: 'Spawn Inoculation' },
  { id: 'colonization', label: 'Colonization' },
  { id: 'fruiting', label: 'Fruiting' },
  { id: 'harvesting', label: 'Harvesting' },
];

export function ContextPanels({ species, stage, onSpeciesChange, onStageChange }: ContextPanelsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Species</label>
        <select
          value={species}
          onChange={(e) => onSpeciesChange(e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Select species...</option>
          {speciesList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Growth Stage</label>
        <select
          value={stage}
          onChange={(e) => onStageChange(e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Select stage...</option>
          {stages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
