import { MessageCircle, X, Send, Mic, MicOff } from 'lucide-react';
import { useState } from 'react';
import useSpeech from '../hooks/useSpeech';

export default function Chatbot({ open, onClose }) {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { supported, isRecording, recordOnce, stop } = useSpeech('fr-FR');

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMessage = chatInput.trim();
    setChatInput('');
    const next = [...chatMessages, { role: 'user', content: userMessage }];
    setChatMessages(next);
    setIsLoading(true);
    try {
      const response = await fetch('/api/anthropic-proxy', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-3.5-sonnet-20240620', max_tokens: 300,
          messages: [{ role: 'user', content: `Assistant Pilulier. Réponses ≤100 mots. Question: ${userMessage}` }]
        })
      });
      const data = await response.json();
      const text = data?.content?.[0]?.text ?? 'Réponse indisponible.';
      setChatMessages([...next, { role: 'assistant', content: text }]);
    } catch {
      setChatMessages([...next, { role: 'assistant', content: 'Désolé, service indisponible.' }]);
    } finally { setIsLoading(false); }
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border-2 border-blue-200">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageCircle size={24} />
            <div>
              <h3 className="font-bold">Assistant Virtuel</h3>
              <p className="text-xs text-blue-100">Je suis là pour vous aider</p>
            </div>
          </div>
          <button aria-label="Fermer" onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-1">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {chatMessages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 mb-4">Bonjour ! Comment puis-je vous aider ?</p>
          </div>
        ) : (
          chatMessages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg px-4 py-2 ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-800'}`}>
                <p className="text-sm">{m.content}</p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay:'0.1s'}} />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay:'0.2s'}} />
          </div>
        )}
      </div>

      <div className="p-3 bg-white border-t">
        <div className="flex gap-2">
          {supported && (
            <button
              aria-label={isRecording ? 'Arrêter dictée' : 'Dicter'}
              onClick={async () => {
                if (isRecording) { stop(); return; }
                try { const t = await recordOnce(); if (t) setChatInput(t); } catch {}
              }}
              className={`p-3 rounded-lg ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-700'}`}
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          )}
          <input
            type="text" value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
            placeholder={isRecording ? 'Parlez…' : 'Tapez ou parlez…'}
            className="flex-1 px-4 py-3 border rounded-lg"
            disabled={isLoading}
          />
          <button aria-label="Envoyer" onClick={sendChatMessage} disabled={isLoading || !chatInput.trim()} className="bg-blue-600 text-white px-4 py-3 rounded-lg disabled:bg-gray-300">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
