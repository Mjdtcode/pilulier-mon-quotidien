// src/components/CalendarModal.jsx
import { useEffect, useMemo, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar as CalIcon, Plus } from 'lucide-react';

const LS_KEY = 'pv_calendar_notes_v1';

// util
const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const daysInMonth = (y, m) => new Date(y, m+1, 0).getDate();
const weekDay = (y, m, d) => new Date(y, m, d).getDay(); // 0=Dimanche
const MO = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];

export default function CalendarModal({ open, onClose }) {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [notes, setNotes] = useState({});
  const [editing, setEditing] = useState(null); // date ISO en édition
  const [text, setText] = useState('');

  // load/save
  useEffect(() => {
    try { setNotes(JSON.parse(localStorage.getItem(LS_KEY)) || {}); } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(notes)); } catch {}
  }, [notes]);

  if (!open) return null;

  const openEditor = (dateIso) => {
    setEditing(dateIso);
    setText(notes[dateIso] || '');
  };
  const saveNote = () => {
    setNotes((n) => {
      const t = text.trim();
      const next = { ...n };
      if (t) next[editing] = t;
      else delete next[editing];
      return next;
    });
    setEditing(null);
    setText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2 text-brand-700">
            <CalIcon size={20}/>
            <h3 className="font-semibold">Calendrier annuel</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded hover:bg-slate-100"
              onClick={() => setYear((y) => y - 1)}
              aria-label="Année précédente"
            ><ChevronLeft size={18}/></button>
            <div className="px-3 py-1 rounded bg-brand-50 text-brand-700 font-semibold">{year}</div>
            <button
              className="p-2 rounded hover:bg-slate-100"
              onClick={() => setYear((y) => y + 1)}
              aria-label="Année suivante"
            ><ChevronRight size={18}/></button>

            <button
              className="ml-2 px-3 py-1 rounded bg-slate-100 text-slate-700 text-sm"
              onClick={() => setYear(today.getFullYear())}
            >
              Aujourd’hui
            </button>

            <button
              className="ml-2 p-2 rounded hover:bg-slate-100"
              onClick={onClose}
              aria-label="Fermer"
            ><X size={18}/></button>
          </div>
        </div>

        {/* Grid 12 mois */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 max-h-[78vh] overflow-auto">
          {Array.from({ length: 12 }, (_, m) => (
            <MonthCard
              key={m}
              year={year}
              month={m}
              notes={notes}
              onPickDate={openEditor}
            />
          ))}
        </div>

        {/* Éditeur de note */}
        {editing && (
          <div className="border-t p-4 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">
                Note du {new Date(editing).toLocaleDateString('fr-FR', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })}
              </div>
              <div className="flex gap-2">
                {notes[editing] && (
                  <button
                    className="px-3 py-1 rounded bg-red-50 text-red-700 text-sm"
                    onClick={() => { setText(''); saveNote(); }}
                  >
                    Supprimer
                  </button>
                )}
                <button
                  className="px-3 py-1 rounded bg-brand-600 text-white text-sm"
                  onClick={saveNote}
                >
                  Enregistrer
                </button>
              </div>
            </div>
            <textarea
              className="w-full min-h-[90px] p-3 rounded border"
              placeholder="Écrire une note, un rappel, un évènement…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function MonthCard({ year, month, notes, onPickDate }) {
  const first = new Date(year, month, 1);
  const days = daysInMonth(year, month);
  // décalage pour commencer Lundi
  const w0 = (d) => (d === 0 ? 6 : d - 1); // 0..6 => Lun..Dim
  const padStart = w0(weekDay(year, month, 1));
  const cells = padStart + days;
  const rows = Math.ceil(cells / 7);

  const hasNote = (d) => {
    const id = `${year}-${pad(month+1)}-${pad(d)}`;
    return !!notes[id];
  };

  return (
    <section className="rounded-xl border bg-white">
      <header className="px-3 py-2 border-b font-semibold text-ink flex items-center justify-between">
        <span>{MONTHS[month]} {year}</span>
        <span className="text-xs text-slate-500">{days} j</span>
      </header>

      <div className="px-2 py-2">
        <div className="grid grid-cols-7 text-[11px] text-slate-500 mb-1">
          {MO.map((l) => <div key={l} className="text-center">{l}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: rows * 7 }, (_, i) => {
            const d = i - padStart + 1;
            const inMonth = d >= 1 && d <= days;
            const id = inMonth ? `${year}-${pad(month+1)}-${pad(d)}` : null;
            const note = inMonth && notes[id];

            return (
              <button
                key={i}
                disabled={!inMonth}
                onClick={() => id && onPickDate(id)}
                className={`h-8 rounded border text-xs relative
                  ${inMonth ? 'bg-white hover:bg-brand-50 border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60 cursor-default'}
                `}
                title={note ? note : undefined}
              >
                <span className="absolute left-1 top-1 text-[11px] text-slate-700">
                  {inMonth ? d : ''}
                </span>
                {inMonth && (
                  <span className={`absolute right-1 bottom-1 w-2 h-2 rounded-full
                    ${note ? 'bg-brand-600' : 'bg-transparent'}
                  `}/>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
          <Plus size={12}/> cliquer un jour pour ajouter une note
        </div>
      </div>
    </section>
  );
}
