import { MessageCircle, Palette, Bell, BellOff, BookOpen, Users } from 'lucide-react';

export default function Header({
  showChatbot, setShowChatbot,
  setShowThemeSelector,
  remindersEnabled, setRemindersEnabled,
  view, setView, setShowChat, setShowContacts,
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2 flex items-center gap-3">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
              <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="2"/>
              <line x1="3" y1="14" x2="21" y2="14" stroke="currentColor" strokeWidth="2"/>
              <line x1="8" y1="4" x2="8" y2="20" stroke="currentColor" strokeWidth="2"/>
              <line x1="13" y1="4" x2="13" y2="20" stroke="currentColor" strokeWidth="2"/>
              <line x1="18" y1="4" x2="18" y2="20" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Pilulier : Mon Quotidien
          </h1>
          <p className="text-gray-600">Gestion et suivi des médicaments</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            aria-label="Assistant"
            onClick={() => setShowChatbot(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              showChatbot ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            <MessageCircle size={20} /> Assistant
          </button>

          <button
            aria-label="Sélecteur de thème"
            onClick={() => setShowThemeSelector(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-purple-100 text-purple-700 hover:bg-purple-200"
          >
            <Palette size={20} /> Thème
          </button>

          <button
            aria-label="Activer ou désactiver les rappels"
            onClick={() => setRemindersEnabled(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
              remindersEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {remindersEnabled ? <Bell size={20} /> : <BellOff size={20} />} Rappels
          </button>

          <div className="flex bg-blue-100 rounded-lg p-1">
            <button
              onClick={() => { setView('journalier'); setShowChat(false); setShowContacts(false); }}
              className={`px-4 py-2 rounded-md font-medium ${
                view === 'journalier' ? 'bg-white text-blue-700 shadow' : 'text-blue-600'
              }`}
            >Journalier</button>
            <button
              onClick={() => { setView('semainier'); setShowChat(false); setShowContacts(false); }}
              className={`px-4 py-2 rounded-md font-medium ${
                view === 'semainier' ? 'bg-white text-blue-700 shadow' : 'text-blue-600'
              }`}
            >Semainier</button>
            <button
              onClick={() => { setShowChat(true); setShowContacts(false); }}
              className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 text-blue-600`}
            >
              <BookOpen size={18} /> Info
            </button>
            <button
              onClick={() => { setShowContacts(true); setShowChat(false); }}
              className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 text-blue-600`}
            >
              <Users size={18} /> Contacts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
