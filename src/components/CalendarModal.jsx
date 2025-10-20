
export default function CalendarModal({ open, onClose, selected = [], onSelect = ()=>{} }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-4 w-[90%] max-w-md">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Calendrier</h3>
          <button onClick={onClose} className="px-2 py-1 rounded bg-gray-100">Fermer</button>
        </div>
        <p className="text-sm text-gray-600">Module calendrier à venir.</p>
      </div>
    </div>
  );
}
