import { useMemo, useState, useEffect } from 'react';
import Header from './components/Header';
import ThemeSelector from './components/ThemeSelector';
import Chatbot from './components/Chatbot';
import MedForm from './components/MedForm';
import Contacts from './components/Contacts';
import DailyGrid from './components/DailyGrid';
import WeeklyGrid from './components/WeeklyGrid';
import { MOMENTS } from './constants';
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
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [backgroundColor, setBackgroundColor] = useLocalStorage('pv_theme', 'from-blue-50 to-green-50');
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
    <div className={`min-h-screen bg-gradient-to-br ${backgroundColor} p-4`}>
      <div className="max-w-7xl mx-auto">
        <Header
          showChatbot={showChatbot}
          setShowChatbot={setShowChatbot}
          setShowThemeSelector={setShowThemeSelector}
          remindersEnabled={remindersEnabled}
          setRemindersEnabled={setRemindersEnabled}
          view={view} setView={setView}
          setShowChat={setShowChat}
          setShowContacts={setShowContacts}
        />

        {showChatbot && <Chatbot open={showChatbot} onClose={() => setShowChatbot(false)} />}
        {showThemeSelector && (
          <ThemeSelector backgroundColor={backgroundColor} setBackgroundColor={setBackgroundColor} onClose={() => setShowThemeSelector(false)} />
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 flex justify-end">
          <button
            onClick={() => { setShowForm(v => !v); setEditingMed(null); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
          >Ajouter</button>
        </div>

        {showForm && (
          <MedForm
            initial={editingMed ?? initialForm}
            modeSemainier={view === 'semainier'}
            onSubmit={submitMed}
            onCancel={() => { setShowForm(false); setEditingMed(null); }}
          />
        )}

        {showContacts && (
          <Contacts contacts={contacts} setContacts={setContacts} />
        )}

        {showChat && !showContacts && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
              <h2 className="text-2xl font-bold">Connaître son médicament</h2>
              <p className="text-blue-100">Utilisez l'assistant virtuel pour poser vos questions</p>
            </div>
            <div className="p-6 text-center text-gray-600">Ouvrez l'Assistant en bas à droite.</div>
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
    </div>
  );
}
