import { useMemo, useState, useEffect } from 'react';
import Header from './components/Header';
import Chatbot from './components/Chatbot';
import MedForm from './components/MedForm';
import Contacts from './components/Contacts';
import DailyGrid from './components/DailyGrid';
import WeeklyGrid from './components/WeeklyGrid';
import useLocalStorage from './hooks/useLocalStorage';
import { playReminderSound } from './utils/audio';
import { ensureNotifPermission, notify } from './utils/notify';

export default function App() {
  const [view, setView] = useState('journalier');
  const [medications, setMedications] = useLocalStorage('pv_meds', []);
  const [contacts, setContacts] = useLocalStorage('pv_contacts', { medecins: [], auxiliaires: [], proches: [] });
  const [takenMeds, setTakenMeds] = useLocalStorage('pv_taken', {});

  const [showForm, setShowForm] = useState(false);
  const [editingMed, setEditingMed] = useState(null);

  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => { ensureNotifPermission(); }, []);

  const initialForm = useMemo(() => ({ nom: '', dosage: '', moments: [], jours: [], notes: '' }), []);

  const getMedsForMoment = (moment, jour = null) => {
    return medications.filter(med => {
      const momentMatch = med.moments.includes(moment);
      if (view === 'journalier') return momentMatch;
      return momentMatch && med.jours.includes(jour);
    });
  };

  const toggleTaken = (medId, moment, jour = null) => {
    const key = jour ? `${medId}-${moment}-${jour}` : `${medId}-${moment}`;
    const now = new Date().toLocaleString('fr-FR');
    setTakenMeds(prev => {
      const was = !!prev[key];
      const next = { ...prev, [key]: was ? null : now };
      if (!was && remindersEnabled) { playReminderSound(); notify('Pilulier', 'Médicament validé.'); }
      return next;
    });
  };

  const editMed = (med) => { setEditingMed(med); setShowForm(true); };
  const deleteMed = (id) => setMedications(medications.filter(m => m.id !== id));

  const submitMed = (data) => {
    const nom = data.nom.trim();
    const dosage = data.dosage.trim();
    const momentsUniq = Array.from(new Set(data.moments));
    if (!nom || !dosage || momentsUniq.length === 0) { alert('Champs obligatoires manquants'); return; }
    if (view === 'semainier' && data.jours.length === 0) { alert('Sélectionnez au moins un jour'); return; }

    const payload = { ...data, nom, dosage, moments: momentsUniq };
    if (editingMed) {
      setMedications(medications.map(m => m.id === editingMed.id ? { ...payload, id: editingMed.id } : m));
      setEditingMed(null);
    } else {
      const id = crypto.randomUUID?.() ?? Date.now();
      setMedications([...medications, { ...payload, id }]);
    }
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-surface overflow-x-hidden">
      <div className="mx-auto w-full max-w-xl md:max-w-2xl px-4 pb-28">
        <Header
          showChatbot={showChatbot}
          setShowChatbot={setShowChatbot}
          setShowThemeSelector={() => {}}
          remindersEnabled={remindersEnabled}
          setRemindersEnabled={setRemindersEnabled}
          view={view} setView={setView}
          setShowChat={setShowChat}
          setShowContacts={setShowContacts}
        />

        {showChatbot && <Chatbot open={showChatbot} onClose={() => setShowChatbot(false)} />}

        {showForm && (
          <MedForm
            initial={editingMed ?? initialForm}
            modeSemainier={view === 'semainier'}
            onSubmit={submitMed}
            onCancel={() => { setShowForm(false); setEditingMed(null); }}
          />
        )}

        {showContacts && <Contacts contacts={contacts} setContacts={setContacts} />}

        {showChat && !showContacts && (
          <div className="bg-card rounded-xl shadow-soft overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-ink">Connaître son médicament</h2>
              <p className="text-sm text-mute">Utilisez l’assistant virtuel pour poser vos questions.</p>
            </div>
            <div className="p-5 text-center text-mute">Ouvrez l’Assistant en bas à droite.</div>
          </div>
        )}

        {view === 'journalier' && !showChat && !showContacts && (
          <DailyGrid
            medications={medications}
            getMedsForMoment={getMedsForMoment}
            takenMeds={takenMeds}
            toggleTaken={toggleTaken}
            editMed={editMed}
            deleteMed={deleteMed}
          />
        )}

        {view === 'semainier' && !showChat && !showContacts && (
          <WeeklyGrid
            getMedsForMoment={getMedsForMoment}
            takenMeds={takenMeds}
            toggleTaken={toggleTaken}
            editMed={editMed}
            deleteMed={deleteMed}
          />
        )}
      </div>

      <button
        onClick={() => { setShowForm(v => !v); setEditingMed(null); }}
        className="fixed bottom-6 right-6 bg-brand-600 text-white w-14 h-14 rounded-full shadow-soft text-2xl"
        aria-label="Ajouter un médicament"
      >
        ＋
      </button>
    </div>
  );
}
