import React, { useEffect } from 'react';

// ResultReader displays and speaks the latest detection result
// Props:
// - result: { name: string, confidence: number } | null
// - speak: (text: string) => void
// - lang: string
// - lowConfidenceThreshold: number
export default function ResultReader({ result, speak, lang = 'en-US', lowConfidenceThreshold = 0.8 }) {
  useEffect(() => {
    if (!result) return;
    const { name, confidence } = result;
    const confPct = Math.round(confidence * 100);
    if (confidence >= lowConfidenceThreshold) {
      speak(`${name}. ${confPct} percent confidence.`);
    } else {
      speak(`Unclear, please rescan.`);
    }
  }, [result, speak, lowConfidenceThreshold]);

  return (
    <div className="w-full rounded-xl p-4 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700" aria-live="polite">
      <div className="text-lg font-semibold mb-1">Result</div>
      {result ? (
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{result.name}</div>
          <div className="text-xl text-neutral-600 dark:text-neutral-300">{Math.round(result.confidence * 100)}%</div>
        </div>
      ) : (
        <div className="text-neutral-600 dark:text-neutral-300">No result yet. Say "scan" to start.</div>
      )}
    </div>
  );
}
