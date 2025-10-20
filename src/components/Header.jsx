// src/components/Header.jsx
import { MessageCircle, Palette, Bell, BellOff, BookOpen, Users } from 'lucide-react';

export default function Header({
  showChatbot, setShowChatbot,
  setShowThemeSelector,
  remindersEnabled, setRemindersEnabled,
  view, setView, setShowContacts,
}) {
  return (
    <div className="bg-card rounded-xl shadow-soft p-5 mb-4">
      <div className="flex flex-col gap-4">
        {/* Titre */}
        <div className="flex items-center gap-3">
          <img src="/pill.svg" alt="" className="w-10 h-10 p-1 bg-brand-50 rounded-xl shadow-inner" />
          <div>
            <h1 className="text-2xl font-bold text-ink">Pilulier : Mon Quotidien</h1>
            <p className="text-sm text-mute">Gestion et suivi des médicaments</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            aria-label="Assistant"
            onClick={() => setShowChatbot(v => !v)}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              showChatbot ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <MessageCircle size={18} /> Assistant
            </span>
          </button>

          <button
            aria-label="Sélecteur de thème"
            onClick={() => setShowThemeSelector(true)}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-purple-50 text-purple-700"
          >
            <span className="inline-flex items-center gap-2">
              <Palette size={18} /> Thème
            </span>
          </button>

          <button
            aria-label="Activer ou désactiver les rappels"
            onClick={() => setRemindersEnabled(v => !v)}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              remindersEnabled ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              {remindersEnabled ? <Bell size={18} /> : <BellOff size={18} />} Rappels
            </span>
          </button>

          {/* Switch vues */}
          <div className="ml-auto flex bg-brand-50 rounded-lg p-1">
            <button
              onClick={() => { setView('journalier'); setShowChatbot(false); setShowContacts(false); }}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                view === 'journalier' ? 'bg-white text-brand-700 shadow' : 'text-brand-700'
              }`}
            >
              Journalier
            </button>
            <button
              onClick={() => { setView('semainier'); setShowChatbot(false); setShowContacts(false); }}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                view === 'semainier' ? 'bg-white text-brand-700 shadow' : 'text-brand-700'
              }`}
            >
              Semainier
            </button>
            <button
              onClick={() => { setShowChatbot(true); setShowContacts(false); }}
              className="px-3 py-2 rounded-md text-sm font-medium text-brand-700"
            >
              <span className="inline-flex items-center gap-2">
                <BookOpen size={18} /> Info
              </span>
            </button>
            <button
              onClick={() => { setShowContacts(true); setShowChatbot(false); }}
              className="px-3 py-2 rounded-md text-sm font-medium text-brand-700"
            >
              <span className="inline-flex items-center gap-2">
                <Users size={18} /> Contacts
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
