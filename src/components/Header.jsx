import { MessageCircle, Palette, Bell, BellOff, Users } from "lucide-react";

export default function Header({
  showChatbot, setShowChatbot,
  setShowThemeSelector,
  remindersEnabled, setRemindersEnabled,
  view, setView,
  setShowContacts,
}) {
  return (
    <div className="bg-card rounded-xl shadow-soft p-5 mb-4">
      {/* Titre */}
      <div className="flex items-center gap-3 mb-4">
        <img src="/pill.svg" alt="" className="w-10 h-10 p-1 bg-brand-50 rounded-xl shadow-inner" />
        <div>
          <h1 className="text-2xl font-bold text-ink">Pilulier : Mon Quotidien</h1>
          <p className="text-sm text-mute">Gestion et suivi des médicaments</p>
        </div>
      </div>

      {/* Ligne 1 : actions principales */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {/* Assistant */}
        <button
          onClick={() => setShowChatbot(v => !v)}
          className={`px-3 py-2 rounded-lg text-sm font-medium ${
            showChatbot ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <MessageCircle size={18} /> Assistant
          </span>
        </button>

        {/* Thème */}
        <button
          onClick={() => setShowThemeSelector(true)}
          className="px-3 py-2 rounded-lg text-sm font-medium bg-purple-50 text-purple-700"
        >
          <span className="inline-flex items-center gap-2">
            <Palette size={18} /> Thème
          </span>
        </button>

        {/* Rappels */}
        <button
          onClick={() => setRemindersEnabled(v => !v)}
          className={`px-3 py-2 rounded-lg text-sm font-medium ${
            remindersEnabled ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            {remindersEnabled ? <Bell size={18} /> : <BellOff size={18} />} Rappels
          </span>
        </button>

        {/* Journalier */}
        <button
          onClick={() => { setView("journalier"); setShowContacts(false); }}
          className={`px-3 py-2 rounded-lg text-sm font-medium ${
            view === "journalier" ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700"
          }`}
        >
          Journalier
        </button>

        {/* Semainier */}
        <button
          onClick={() => { setView("semainier"); setShowContacts(false); }}
          className={`px-3 py-2 rounded-lg text-sm font-medium ${
            view === "semainier" ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700"
          }`}
        >
          Semainier
        </button>
      </div>

      {/* Ligne 2 : bouton Contacts */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowContacts(true)}
          className="px-3 py-2 rounded-lg text-sm font-medium bg-brand-50 text-brand-700 inline-flex items-center gap-2"
        >
          <Users size={18} /> Contacts
        </button>
      </div>
    </div>
  );
}
