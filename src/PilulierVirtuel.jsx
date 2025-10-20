import React, { useState } from 'react';
import { Bell, BellOff, Clock, Pill } from 'lucide-react';
import Chatbot from './components/Chatbot';
import CalendarModal from './components/CalendarModal';
import AssistantFab from './components/AssistantFab';
import { useAppStore } from './store/useAppStore';

function DoctorAvatar(){
  return (
    <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center shadow-card">
      <svg viewBox="0 0 64 64" className="w-9 h-9 text-white">
        <circle cx="32" cy="24" r="10" fill="currentColor"/>
        <rect x="18" y="36" width="28" height="16" rx="8" fill="currentColor"/>
        <circle cx="40" cy="22" r="3" fill="#22d3ee"/>
      </svg>
    </div>
  );
}

export default function PilulierVirtuel() {
  const [view, setView] = useState('journalier');
  const [showChatbot, setShowChatbot] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const medications = useAppStore(s=>s.medications);

  const moments = ['Matin', 'Midi', 'Après-midi', 'Soir'];
  const jours = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];

  const getMedicationsForMoment = (moment, jour = null) =>
    medications.filter(med => {
      const momentMatch = (med.moments||[]).includes(moment);
      if (view === 'journalier') return momentMatch;
      return momentMatch && (med.jours||[]).includes(jour);
    });

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="card p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <DoctorAvatar/>
              <div>
                <h1 className="text-3xl font-bold text-brand-800">Pilulier : Mon Quotidien</h1>
                <p className="text-slate-500">Assistant relié au Journalier · Semainier · Contacts</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={()=>setShowCalendar(true)} className="btn-ghost">📅 Calendrier</button>
              <div className="segmented">
                <button aria-pressed={view==='journalier'} onClick={()=>{setView('journalier'); setShowContacts(false);}}>Journalier</button>
                <button aria-pressed={view==='semainier'} onClick={()=>{setView('semainier'); setShowContacts(false);}}>Semainier</button>
                <button aria-pressed={showContacts} onClick={()=>{setShowContacts(true);}}>Contacts</button>
              </div>
              <button onClick={()=>setRemindersEnabled(v=>!v)} className={`btn ${remindersEnabled?'btn-success':'btn-ghost'}`}>
                {remindersEnabled ? <Bell size={18}/> : <BellOff size={18}/>} Rappels
              </button>
            </div>
          </div>
        </div>

        {view === 'journalier' && !showContacts && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {moments.map(moment => (
              <div key={moment} className="card overflow-hidden">
                <div className="bg-brand-600 text-white px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">{moment}</h3>
                    <Clock size={20}/>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {getMedicationsForMoment(moment).length === 0 ? (
                    <p className="text-slate-400 text-center py-4">Aucun médicament</p>
                  ) : (
                    getMedicationsForMoment(moment).map(med => (
                      <div key={med.id} className="border rounded-xl p-3 border-slate-200">
                        <div className="flex items-start gap-3 mb-2">
                          <Pill className="text-brand-600 mt-1" size={20}/>
                          <div>
                            <h4 className="font-semibold">{med.nom}</h4>
                            <p className="text-sm text-slate-600">{med.dosage}</p>
                            {med.notes && <p className="text-xs text-slate-500">{med.notes}</p>}
                          </div>
                        </div>
                        <button className="w-full btn-ghost">Valider</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'semainier' && !showContacts && (
          <div className="space-y-4">
            {jours.map(jour => (
              <div key={jour} className="card overflow-hidden">
                <div className="bg-mint-600 text-white px-4 py-3">
                  <h3 className="text-xl font-bold">{jour}</h3>
                </div>
                <div className="grid md:grid-cols-4 gap-4 p-4">
                  {['Matin','Midi','Après-midi','Soir'].map(moment => (
                    <div key={moment} className="border border-slate-200 rounded-xl p-3">
                      <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><Clock size={16}/>{moment}</h4>
                      <div className="space-y-2">
                        {getMedicationsForMoment(moment, jour).length === 0 ? (
                          <p className="text-slate-400 text-sm text-center py-2">Aucun</p>
                        ) : (
                          getMedicationsForMoment(moment, jour).map(med => (
                            <div key={med.id} className="border rounded p-2 text-sm border-slate-300">
                              <div className="flex items-start gap-2">
                                <Pill className="text-brand-600 mt-0.5" size={16}/>
                                <div>
                                  <p className="font-semibold">{med.nom}</p>
                                  <p className="text-xs text-slate-600">{med.dosage}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {showContacts && (
          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-2">Mes Contacts</h2>
            <p className="text-slate-600">Réintègre ici ta section Contacts existante.</p>
          </div>
        )}

        <AssistantFab onClick={()=>setShowChatbot(true)}/>
        <Chatbot open={showChatbot} onClose={()=>setShowChatbot(false)} meds={medications} />
        <CalendarModal open={showCalendar} onClose={()=>setShowCalendar(false)} selected={[]} onSelect={()=>{}} />
      </div>
    </div>
  );
}
