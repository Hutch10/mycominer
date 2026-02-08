// Developer Mode Banner Component
// Displays when dev mode is active

'use client';

import { useState, useEffect } from 'react';
import { devMode } from '@/app/config/developerMode';

export function DeveloperModeBanner() {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const checkDevMode = () => {
      setIsActive(devMode.getConfig().enabled);
    };

    checkDevMode();
    const interval = setInterval(checkDevMode, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isActive) return null;

  return (
    <div className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 text-center text-sm font-medium">
      <span className="inline-flex items-center gap-2">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <strong>Developer Mode Active</strong> 
        <span className="opacity-90">— Auto-approvals enabled, optional audits skipped</span>
      </span>
    </div>
  );
}
