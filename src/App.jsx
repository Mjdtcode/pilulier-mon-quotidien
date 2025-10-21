// src/App.jsx
import { useMemo, useState, useEffect } from 'react';
import Header from './components/Header';
import Chatbot from './components/Chatbot';
import MedForm from './components/MedForm';
import Contacts from './components/Contacts';
import DailyGrid from './components/DailyGrid';
import WeeklyGrid from './components/WeeklyGrid';
import ThemeSelector from './components/ThemeSelector';
import AssistantFab from './components/AssistantFab';
import CalendarModal from './components/CalendarModal';
import useLocalStorage from './hooks/useLocalStorage';
import { playReminderSound } from './utils/audio';
import { ensureNotifPermission, notify } from './utils/notify';

const LS_KEY = 'pv_patients_v2';
const mkId = () => crypto.randomUUID?.() ?? String(Date.now());

export default function App() {
  // --- Contacts (médecins, auxiliaires, proches)
  const [contacts, setContacts] = useLocalStorage('pv_contacts', {
    medecins: [],
    auxiliaires: [],
    proches: [],
  });

  // handler d’ajout de contact (utilisé par <Contacts/>)
  function addContact(type, data) {
    setContacts((c) => ({
      ...c,
      [type]: [...c[type], { id: mkId(), ...data }],
    }));
  }

  // --- Patients avec pilulier séparé
  const [patients, setPatients] = useLocalStorage(LS_KEY, {
    byId: { me: { id: 'me', name: 'Moi', meds: [] } },
    order: ['me'],
    activeId: 'me',
  });

  // Sauvegarde auto
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(patients));
    } catch {}
  }, [patients]);

  const active = patients.byId[patients.activeId];
  const setActivePatient = (id) =>
    setPatients((p) => ({ ...p, activeId: id in p.byId ? id : 'me' }));

  // --- États UI
  const [view, setView] = useState('journalier');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showContactsView, setShowContactsView] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  useEffect(() => {
    ensureNotifPermission();
  }, []);

  const initialForm = useMemo(
    () => ({ nom: '', dosage: '', moments: [], jours: [], notes: '' }),
    []
  );

  // --- Médicaments du patient actif
  const medications = active?.meds ?? [];
  const setMedications = (updater) => {
    setPatients((p) => {
      const cur = p.byId[p.activeId];
      const nextMeds = typeof updater === 'function' ? updater(cur.meds) : updater;
      return { ...p, byId: { ...p.byId, [p.activeId]: { ...cur, meds: nextMeds } } };
    });
  };

  // --- Actions pilulier
  const getMedsForMoment = (moment, jour = null) =>
    medications.filter(
      (m) => m.moments.includes(moment) && (view === 'journalier' || m.jours.includes(jour))
    );

  const [takenMeds, setTakenMeds] = useLocalStorage('pv_taken', {});
  const toggleTaken = (medId, moment, jour = null) => {
    const key = jour ? `${active.id}:${medId}-${moment}-${jour}` : `${active.id}:${medId}-${moment}`;
    const now = new Date().toLocaleString('fr-FR');
    setTakenMeds((prev) => {
      const was = !!prev[key];
      const next = { ...prev, [key]: was ? null : now };
      if (!was && remindersEnabled) {
        playReminderSound();
        notify('Pilulier', 'Médicament validé.');
      }
      return next;
    });
  };

  // --- Formulaire manuel
  const [showForm, setShowForm] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const editMed = (med) => {
    setEditingMed(med);
    setShowForm(true);
  };
  const deleteMed = (id) => setMedications(medications.filter((m) => m.id !== id));

  const submitMed = (data) => {
    const nom = data.nom.trim();
    const dosage = data.dosage.trim();
    const momentsUniq = Array.from(new Set(data.moments));
    if (!nom || !dosage || momentsUniq.length === 0) {
      alert('Champs obligatoires manquants');
      return;
    }
    if (view === 'semainier' && data.jours.length === 0) {
      alert('Sélectionnez au moins un jour');
      return;
    }
    const payload = { ...data, nom, dosage, moments: momentsUniq };
    if (editingMed) {
      setMedications(
        medications.map((m) => (m.id === editingMed.id ? { ...payload, id: editingMed.id } : m))
      );
      setEditingMed(null);
    } else {
      setMedications([...medications, { ...payload, id: mkId() }]);
    }
    setShowForm(false);
  };

  // --- Ajout depuis l’assistant
  const addMedFromAssistant = ({
    nom,
    dosage,
    quantite = 1,
    jours = [],
    until,
    moments = ['Matin'],
  }) => {
    const base = {
      nom,
      dosage,
      moments,
      jours,
      notes: until ? `Jusqu’au ${new Date(until).toLocaleDateString('fr-FR')}` : '',
    };
    const items = Array.from({ length: quantite }, () => ({ ...base, id: mkId() }));
    setMedications([...medications, ...items]);
  };

  // --- Ouvrir pilulier d’un proche
  const openPilulierForContact = (displayName) => {
    setPatients((p) => {
      const existingId = Object.values(p.byId).find((x) => x.name === displayName)?.id;
      if (existingId) return { ...p, activeId: existingId };
      const id = mkId();
      return {
        ...p,
        activeId: id,
        byId: { ...p.byId, [id]: { id, name: displayName, meds: [] } },
        order: [...p.order, id],
      };
    });
    setShowContactsView(false);
  };

  // --- UI
  return (
    <div className="min-h-screen bg-surface overflow-x-hidden">
      <div className="mx-auto w-full max-w-xl md:max-w-2xl px-4 pb-28">
        <Header
          showChatbot={assistantOpen}
          setShowChatbot={setAssistantOpen}
          setShowThemeSelector={setShowThemeSelector}
          remindersEnabled={remindersEnabled}
          setRemindersEnabled={setRemindersEnabled}
          view={view}
          setView={setView}
          setShowChat={setAssistantOpen}
          setShowContacts={setShowContactsView}
        />

        <div className="mb-3 text-sm text-mute">
          Pilulier de <span className="font-semibold text-ink">{active?.name || 'Moi'}</span>
        </div>

        {showThemeSelector && <ThemeSelector onClose={() => setShowThemeSelector(false)} />}

        {assistantOpen && (
          <Chatbot
            key="assistant"
            open={assistantOpen}
            onClose={() => setAssistantOpen(false)}
            medications={medications}
            patientName={active?.name || 'Moi'}
            onAddMedication={addMedFromAssistant}
          />
        )}

        {showForm && (
          <MedForm
            initial={editingMed ?? initialForm}
            modeSemainier={view === 'semainier'}
            onSubmit={submitMed}
            onCancel={() => {
              setShowForm(false);
              setEditingMed(null);
            }}
          />
        )}

        {showContactsView && (
          <Contacts
            contacts={contacts}
            onAddContact={addContact}
            onOpenPilulier={openPilulierForContact}
            setActivePatient={setActivePatient}
            patients={patients}
          />
        )}

        {!assistantOpen && !showContactsView && view === 'journalier' && (
          <DailyGrid
            medications={medications}
            getMedsForMoment={getMedsForMoment}
            takenMeds={takenMeds}
            toggleTaken={toggleTaken}
            editMed={editMed}
            deleteMed={deleteMed}
          />
        )}

        {!assistantOpen && !showContactsView && view === 'semainier' && (
          <WeeklyGrid
            activePatientId={active?.id}
            getMedsForMoment={getMedsForMoment}
            takenMeds={takenMeds}
            toggleTaken={toggleTaken}
            editMed={editMed}
            deleteMed={deleteMed}
          />
        )}
      </div>

      <AssistantFab onClick={() => setAssistantOpen(true)} />

      <button
        onClick={() => setShowCalendar(true)}
        className="fixed bottom-6 left-6 btn btn-ghost shadow-soft"
        aria-label="Calendrier"
      >
        📅 Calendrier
      </button>

      <CalendarModal
        open={showCalendar}
        onClose={() => setShowCalendar(false)}
        selected={[]}
        onSelect={() => {}}
      />

      <button
        onClick={() => {
          setShowForm((v) => !v);
          setEditingMed(null);
        }}
        className="fixed bottom-6 right-20 bg-brand-600 text-white w-14 h-14 rounded-full shadow-soft text-2xl"
        aria-label="Ajouter un médicament"
      >
        ＋
      </button>
    </div>
  );
}
