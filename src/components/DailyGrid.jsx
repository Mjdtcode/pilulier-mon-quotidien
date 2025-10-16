import { Clock, Edit2, Trash2, Check, Pill } from 'lucide-react';
import { MOMENTS } from '../constants';

export default function DailyGrid({ medications, getMedsForMoment, takenMeds, toggleTaken, editMed, deleteMed }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {MOMENTS.map(moment => (
        <div key={moment} className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
            <div className="flex items-center justify-between"><h3 className="text-lg font-bold">{moment}</h3><Clock size={20} /></div>
          </div>
          <div className="p-4 space-y-3">
            {getMedsForMoment(moment).length === 0 ? (
              <p className="text-gray-400 text-center py-4">Aucun médicament</p>
            ) : (
              getMedsForMoment(moment).map(med => {
                const key = `${med.id}-${moment}`;
                const isTaken = takenMeds[key];
                return (
                  <div key={med.id} className={`border-2 rounded-lg p-3 ${isTaken ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 flex items-start gap-2">
                        <Pill className="text-blue-600 mt-1" size={20} />
                        <div>
                          <h4 className="font-bold">{med.nom}</h4>
                          <p className="text-sm text-gray-600">{med.dosage}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => editMed(med)} className="p-1 text-blue-600 hover:bg-blue-100 rounded" aria-label="Modifier"><Edit2 size={16} /></button>
                        <button onClick={() => deleteMed(med.id)} className="p-1 text-red-600 hover:bg-red-100 rounded" aria-label="Supprimer"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    {med.notes && <p className="text-xs text-gray-500 mb-2">{med.notes}</p>}
                    <button onClick={() => toggleTaken(med.id, moment)} className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium ${isTaken ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                      <Check size={18} /> {isTaken ? 'Pris' : 'Valider'}
                    </button>
                    {isTaken && <p className="text-xs text-gray-500 text-center mt-1">{isTaken}</p>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
