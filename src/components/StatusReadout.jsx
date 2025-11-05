import React from 'react';

export default function StatusReadout({ status, lastResult }) {
  return (
    <div className="mt-4 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
      <div className="text-xl font-bold">Status</div>
      <p className="mt-1 text-lg" aria-live="polite">{status}</p>
      {lastResult && (
        <div className="mt-3">
          <div className="text-lg font-semibold">Last Detection</div>
          <div className="text-lg">
            {lastResult.name}
            {typeof lastResult.confidence === 'number' && (
              <span className="ml-2 text-neutral-600">({(lastResult.confidence * 100).toFixed(1)}%)</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
