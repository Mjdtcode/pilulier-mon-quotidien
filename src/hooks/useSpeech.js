import { useEffect, useRef, useState } from 'react';

export default function useSpeech(lang = 'fr-FR') {
  const [supported, setSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = false;
    recognitionRef.current = rec;
    setSupported(true);
  }, [lang]);

  const recordOnce = () => new Promise((resolve, reject) => {
    if (!recognitionRef.current) return reject(new Error('no-speech'));
    const rec = recognitionRef.current;

    const cleanup = () => {
      rec.onresult = null; rec.onerror = null; rec.onend = null;
      setIsRecording(false);
    };

    rec.onresult = (e) => { const t = e.results[0][0].transcript; cleanup(); resolve(t); };
    rec.onerror  = () => { cleanup(); reject(new Error('speech-error')); };
    rec.onend    = () => { cleanup(); };

    try { setIsRecording(true); rec.start(); } catch (e) { cleanup(); reject(e); }
  });

  const stop = () => { try { recognitionRef.current?.stop(); } catch {} };

  return { supported, isRecording, recordOnce, stop };
}
