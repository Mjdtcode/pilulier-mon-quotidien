
import { MessageCircle, X, Send, Mic, MicOff } from 'lucide-react';
import { useState } from 'react';
import useSpeech from '../hooks/useSpeech';
import { parseCommand } from '../lib/parseCommand.js';

export default function Chatbot({ open, onClose, medications = [], patientName = 'Moi', onAddMedication }) {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { supported, isRecording, recordOnce, stop } = useSpeech?.('fr-FR') ?? { supported: false };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMessage = chatInput.trim();
    setChatInput('');
    const next = [...chatMessages, { role: 'user', content: userMessage }];
    setChatMessages(next);
    setIsLoading(true);
    try {
      const context = { patient: patientName, meds: medications.map(m => ({ nom: m.nom, dosage: m.dosage, moments: m.moments })) };
      const res = await fetch('/.netlify/functions/local-assistant', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userMessage, context })
      });
      const payload = await res.json();
      let reply = payload?.content ?? 'Réponse indisponible.';

      const cmd = parseCommand(userMessage);
      if (cmd && onAddMedication) {
        onAddMedication(cmd);
        const untilText = cmd.until ? ` jusqu'au ${new Date(cmd.until).toLocaleDateString('fr-FR')}` : '';
        reply += `\n\n✅ Ajout pour ${patientName}: ${cmd.quantite} ${cmd.nom} — ${cmd.jours.join(', ')}${untilText}.`;
      }

      setChatMessages([...next, { role: 'assistant', content: reply }]);
    } catch {
      setChatMessages([...next, { role: 'assistant', content: 'Service indisponible. Réessayer.' }]);
    } finally { setIsLoading(false); }
  };

  const handleMicClick = async () => {
    if (!supported) return;
    if (isRecording) { stop(); return; }
    try { const t = await recordOnce(); if (t) setChatInput(t); } catch {}
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] card border border-slate-200 shadow-card">
      <div className="bg-brand-600 text-white p-4 rounded-t-2xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageCircle size={24} />
            <div>
              <h3 className="font-bold">Assistant</h3>
              <p className="text-xs text-blue-100">Pilulier de {patientName}</p>
            </div>
          </div>
          <button aria-label="Fermer" onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-1">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="h-80 overflow-y-auto p-4 space-y-3 bg-muted">
        {chatMessages.length === 0 ? (
          <div className="text-center py-8 text-mute">
            Ex: « 2 doliprane lundi et vendredi à Mme Martin jusqu’au 3 décembre »
          </div>
        ) : chatMessages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg px-4 py-2 ${m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-white border text-gray-800'}`}>
              <p className="text-sm whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-brand-600 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-brand-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-brand-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        )}
      </div>

      <div className="p-3 bg-white border-t">
        <div className="flex gap-2">
          {supported && (
            <button aria-label={isRecording ? 'Arrêter' : 'Dicter'}
              onClick={handleMicClick}
              className={`p-3 rounded-lg ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-700'}`}>
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          )}
          <input
            type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
            placeholder="Tapez ou parlez…" className="flex-1 field" disabled={isLoading}
          />
          <button aria-label="Envoyer" onClick={sendChatMessage} disabled={isLoading || !chatInput.trim()} className="btn btn-primary">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
