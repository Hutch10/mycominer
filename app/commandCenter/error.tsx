"use client";

import { useEffect } from "react";

export default function CommandCenterError({ error, reset }: { error: Error & { digest?: string }; reset: () => void; }) {
  useEffect(() => {
    // Log the full error to the console for debugging
    // eslint-disable-next-line no-console
    console.error("CommandCenterError:", error);
  }, [error]);

  const message = (() => {
    try {
      // If someone threw a non-Error object, stringify to help visibility
      if (!(error instanceof Error)) {
        return typeof error === "object" ? JSON.stringify(error) : String(error);
      }
      return error.message || "Unexpected error";
    } catch {
      return "Unexpected error";
    }
  })();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 break-words">{message}</p>

        {error?.stack && (
          <details className="mb-4">
            <summary className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">View stack trace</summary>
            <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-auto text-gray-800 dark:text-gray-200">
{error.stack}
            </pre>
          </details>
        )}

        {error?.digest && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">Digest: {error.digest}</div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Try again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-sm rounded text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  );
}
