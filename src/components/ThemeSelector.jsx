import { X, Palette } from 'lucide-react';
import { THEME_OPTIONS } from '../constants';

export default function ThemeSelector({ backgroundColor, setBackgroundColor, onClose }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Palette size={24} className="text-purple-600" /> Choisir un thème
        </h2>
        <button aria-label="Fermer" onClick={onClose}><X size={24} /></button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {THEME_OPTIONS.map((theme, i) => (
          <button key={i} onClick={() => { setBackgroundColor(theme.gradient); onClose?.(); }}
            className={`p-4 rounded-lg border-4 ${backgroundColor === theme.gradient ? 'border-blue-600 shadow-lg' : 'border-gray-200'}`}
          >
            <div className={`h-24 rounded-lg ${theme.preview} mb-3`} />
            <p className="text-sm font-medium text-center">{theme.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
