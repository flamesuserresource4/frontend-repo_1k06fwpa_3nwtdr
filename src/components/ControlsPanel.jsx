import React from 'react';

// ControlsPanel provides large, high-contrast controls for manual operation
// Props:
// - onScan(): trigger scan
// - onStop(): stop actions
// - onRepeat(): repeat last spoken result
// - speechRate, setSpeechRate
// - lang, setLang
export default function ControlsPanel({
  onScan,
  onStop,
  onRepeat,
  speechRate,
  setSpeechRate,
  lang,
  setLang,
}) {
  return (
    <div className="w-full bg-white dark:bg-neutral-900 rounded-xl p-4 shadow border border-neutral-200 dark:border-neutral-800">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <button
          onClick={onScan}
          className="w-full py-4 text-xl font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white focus:outline-none focus:ring-4 focus:ring-emerald-400"
          aria-label="Scan product"
        >
          Scan
        </button>
        <button
          onClick={onRepeat}
          className="w-full py-4 text-xl font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white focus:outline-none focus:ring-4 focus:ring-indigo-400"
          aria-label="Repeat last result"
        >
          Repeat
        </button>
        <button
          onClick={onStop}
          className="w-full py-4 text-xl font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white focus:outline-none focus:ring-4 focus:ring-rose-400"
          aria-label="Stop voice and camera"
        >
          Stop
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="group" aria-label="Preferences">
        <label className="flex items-center justify-between gap-4 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
          <span className="text-base">Language</span>
          <select
            className="px-3 py-2 rounded bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            aria-label="Language"
          >
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="es-ES">Español</option>
            <option value="fr-FR">Français</option>
            <option value="de-DE">Deutsch</option>
          </select>
        </label>

        <label className="flex items-center justify-between gap-4 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
          <span className="text-base">Speech rate</span>
          <input
            type="range"
            min={0.6}
            max={1.6}
            step={0.1}
            value={speechRate}
            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            aria-label="Speech rate"
          />
          <span className="tabular-nums w-10 text-right" aria-hidden>
            {speechRate.toFixed(1)}x
          </span>
        </label>
      </div>
    </div>
  );
}
