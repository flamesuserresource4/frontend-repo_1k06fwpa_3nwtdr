import React, { useEffect, useRef, useState, useCallback } from 'react';

// VoiceAssistant handles:
// - SpeechRecognition for commands: "scan", "repeat", "stop"
// - SpeechSynthesis for feedback
// Props:
// - onCommand(cmd: 'scan'|'repeat'|'stop'): callback when a command is recognized
// - speechRate (number) 0.5 - 2
// - lang (string) BCP-47 language tag (e.g., 'en-US')
// - autoStart (boolean) start recognition on mount
export default function VoiceAssistant({ onCommand, speechRate = 1, lang = 'en-US', autoStart = true }) {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [voices, setVoices] = useState([]);

  // Initialize voices list
  useEffect(() => {
    function loadVoices() {
      const v = window.speechSynthesis?.getVoices?.() || [];
      setVoices(v);
    }
    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Speak helper
  const speak = useCallback(
    (text) => {
      if (!('speechSynthesis' in window)) return;
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = speechRate;
      utter.lang = lang;
      // Prefer a voice matching the selected lang
      const preferred = voices.find((v) => v.lang === lang);
      if (preferred) utter.voice = preferred;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    },
    [speechRate, lang, voices]
  );

  // Expose speak on window for debugging if needed
  useEffect(() => {
    window.__speak = speak;
  }, [speak]);

  // Set up SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const results = Array.from(event.results);
      const transcript = results.map((r) => r[0].transcript).join(' ').toLowerCase();
      setLastTranscript(transcript);
      if (transcript.includes('scan')) {
        onCommand?.('scan');
      } else if (transcript.includes('repeat')) {
        onCommand?.('repeat');
      } else if (transcript.includes('stop')) {
        onCommand?.('stop');
      }
    };

    recognition.onend = () => {
      // auto-restart for robustness while listening
      if (listening) {
        try {
          recognition.start();
        } catch (e) {
          // swallow if already started
        }
      }
    };

    recognitionRef.current = recognition;

    if (autoStart) {
      try {
        recognition.start();
        setListening(true);
      } catch (e) {
        console.warn('Failed to start recognition:', e);
      }
    }

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [onCommand, lang, autoStart, listening]);

  const start = () => {
    try {
      recognitionRef.current?.start();
      setListening(true);
      speak('Voice control enabled. Say scan to capture.');
    } catch (e) {
      console.warn(e);
    }
  };

  const stop = () => {
    try {
      recognitionRef.current?.stop();
      setListening(false);
      speak('Voice control stopped.');
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between bg-black text-white rounded-lg p-3">
        <div className="text-sm md:text-base">Voice: {listening ? 'Listening' : 'Stopped'}</div>
        <div className="flex gap-2">
          <button
            onClick={start}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 rounded text-white text-sm md:text-base"
            aria-label="Start voice recognition"
          >
            Start
          </button>
          <button
            onClick={stop}
            className="px-3 py-2 bg-rose-600 hover:bg-rose-700 rounded text-white text-sm md:text-base"
            aria-label="Stop voice recognition"
          >
            Stop
          </button>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">{listening ? 'Voice listening enabled' : 'Voice listening disabled'}</p>
      <p className="text-xs text-neutral-500 mt-2" aria-hidden>
        Last heard: {lastTranscript || '—'}
      </p>
    </div>
  );
}
