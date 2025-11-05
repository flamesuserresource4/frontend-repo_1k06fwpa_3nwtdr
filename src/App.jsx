import React, { useCallback, useRef, useState } from 'react';
import VoiceAssistant from './components/VoiceAssistant.jsx';
import CameraScanner from './components/CameraScanner.jsx';
import ControlsPanel from './components/ControlsPanel.jsx';
import ResultReader from './components/ResultReader.jsx';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export default function App() {
  const cameraRef = useRef(null);
  const [result, setResult] = useState(null); // {name, confidence}
  const [speechRate, setSpeechRate] = useState(1);
  const [lang, setLang] = useState('en-US');
  const [busy, setBusy] = useState(false);

  const speak = useCallback(
    (text) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = speechRate;
      utter.lang = lang;
      const voices = window.speechSynthesis.getVoices?.() || [];
      const preferred = voices.find((v) => v.lang === lang);
      if (preferred) utter.voice = preferred;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    },
    [speechRate, lang]
  );

  const doScan = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setResult(null);
    try {
      const blob = await cameraRef.current?.capture();
      if (!blob) throw new Error('Capture failed');
      const form = new FormData();
      form.append('file', blob, 'capture.jpg');
      const res = await fetch(`${BACKEND_URL}/predict`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      // Expect: { labels:[{name,confidence,bbox}] }
      const top = Array.isArray(data?.labels) && data.labels.length > 0 ?
        data.labels.sort((a, b) => b.confidence - a.confidence)[0] : null;
      if (top) {
        setResult({ name: top.name, confidence: Number(top.confidence) });
      } else {
        setResult(null);
        speak('No item detected. Please rescan.');
      }
    } catch (e) {
      console.error(e);
      speak('Error during scan. Check connection and try again.');
      setResult(null);
    } finally {
      setBusy(false);
    }
  }, [busy, speak]);

  const handleCommand = useCallback(
    (cmd) => {
      if (cmd === 'scan') doScan();
      if (cmd === 'repeat' && result) {
        const confPct = Math.round(result.confidence * 100);
        speak(`${result.name}. ${confPct} percent confidence.`);
      }
      if (cmd === 'stop') {
        cameraRef.current?.stop?.();
        window.speechSynthesis?.cancel?.();
      }
    },
    [doScan, result, speak]
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="px-6 py-4 border-b border-neutral-800">
        <h1 className="text-2xl md:text-3xl font-extrabold">A11y Shop Assistant</h1>
        <p className="text-neutral-400 mt-1">Voice-controlled product scanner for independent shopping.</p>
      </header>

      <main className="max-w-4xl mx-auto p-4 grid gap-4">
        <section>
          <VoiceAssistant onCommand={handleCommand} speechRate={speechRate} lang={lang} />
        </section>

        <section>
          <CameraScanner ref={cameraRef} className="relative" />
        </section>

        <section>
          <ControlsPanel
            onScan={doScan}
            onStop={() => handleCommand('stop')}
            onRepeat={() => handleCommand('repeat')}
            speechRate={speechRate}
            setSpeechRate={setSpeechRate}
            lang={lang}
            setLang={setLang}
          />
        </section>

        <section>
          <ResultReader result={result} speak={speak} lang={lang} lowConfidenceThreshold={0.8} />
          <div className="sr-only" aria-live="assertive">
            {busy ? 'Scanning in progress' : 'Idle'}
          </div>
        </section>
      </main>

      <footer className="px-6 py-6 text-sm text-neutral-400">
        Voice commands: say "scan", "repeat", or "stop". Ensure microphone and camera permissions are granted.
      </footer>
    </div>
  );
}
