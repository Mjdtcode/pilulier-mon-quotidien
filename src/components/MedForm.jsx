import { Mic, MicOff, X } from 'lucide-react';
import { useState } from 'react';
import useSpeech from '../hooks/useSpeech';
import { JOURS, MOMENTS } from '../constants';

export default function MedForm({ initial, modeSemainier, onSubmit, onCancel }) {
  const [voiceMode, setVoiceMode] = useState(false);
  const [form, setForm] = useState(initial);
  const { supported, isRecording, recordOnce, stop } = useSpeech('fr-FR');

  const recTo = async (field) => {
    try {
      if (isRecording) { stop(); return; }
      const t = await recordOnce();
      if (!t) return;
      setForm(prev => ({ ...prev, [field]: t }));
    } catch {}
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="mb-4 flex justify-between bg-purple-50 p-3 rounded-lg">
        <span className="text-sm font-medium">Mode :</span>
        <div className="flex bg-white rounded-lg p-1">
          <button onClick={() => setVoiceMode(false)} className={`px-4 py-2 rounded-md text-sm font-medium ${!voiceMode ? 'bg-purple-600 text-white' : 'text-gray-600'}`}>✍️ Manuel</button>
          <button onClick={() => setVoiceMode(true)} className={`px-4 py-2 rounded-md text-sm font-medium ${voiceMode ? 'bg-purple-600 text-white' : 'text-gray-600'}`}>🎤 Vocal</button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nom *</label>
            <div className="flex gap-2">
              <input type="text" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} className="flex-1 px-4 py-2 border rounded-lg" placeholder="Paracétamol" />
              {voiceMode && supported && (
                <button aria-label="Dicter nom" onClick={() => recTo('nom')} className={`p-2 rounded-lg ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-purple-100 text-purple-600'}`}>
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Dosage *</label>
            <div className="flex gap-2">
              <input type="text" value={form.dosage} onChange={e => setForm({ ...form, dosage: e.target.value })} className="flex-1 px-4 py-2 border rounded-lg" placeholder="500mg" />
              {voiceMode && supported && (
                <button aria-label="Dicter dosage" onClick={() => recTo('dosage')} className={`p-2 rounded-lg ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-purple-100 text-purple-600'}`}>
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Moments *</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {MOMENTS.map(m => (
              <label key={m} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50">
                <input type="checkbox" checked={form.moments.includes(m)}
                  onChange={e => setForm({ ...form, moments: e.target.checked ? Array.from(new Set([...form.moments, m])) : form.moments.filter(x => x !== m) })}
                  className="w-5 h-5" />
                <span className="text-sm font-medium">{m}</span>
              </label>
            ))}
          </div>
        </div>

        {modeSemainier && (
          <div>
            <label className="block text-sm font-medium mb-2">Jours *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {JOURS.map(j => (
                <label key={j} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-blue-50">
                  <input type="checkbox" checked={form.jours.includes(j)}
                    onChange={e => setForm({ ...form, jours: e.target.checked ? Array.from(new Set([...form.jours, j])) : form.jours.filter(x => x !== j) })}
                    className="w-5 h-5" />
                  <span className="text-sm font-medium">{j}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-2 border rounded-lg" rows="3" />
        </div>

        <div className="flex gap-3">
          <button onClick={() => onSubmit(form)} className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">{initial?.id ? 'Modifier' : 'Ajouter'}</button>
          <button onClick={onCancel} className="px-6 py-3 border rounded-lg font-medium hover:bg-gray-50"><X size={18} className="inline mr-2"/> Annuler</button>
        </div>
      </div>
    </div>
  );
}
