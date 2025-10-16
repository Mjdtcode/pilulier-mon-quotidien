import { Clock, Edit2, Trash2, Check, Pill } from 'lucide-react';
import { MOMENTS, JOURS } from '../constants';

export default function WeeklyGrid({ getMedsForMoment, takenMeds, toggleTaken, editMed, deleteMed }) {
  return (
    <div className="space-y-4">
      {JOURS.map(jour => (
        <div key={jour} className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
            <h3 className="text-xl font-bold">{jour}</h3>
          </div>
          <div className="grid md:grid-cols-4 gap-4 p-4">
            {MOMENTS.map(moment => (
              <div key={moment} className="border-2 border-gray-200 rounded-lg p-3">
                <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Clock size={16} />{moment}</h4>
                <div className="space-y-2">
                  {getMedsForMoment(moment, jour).length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-2">Aucun</p>
                  ) : (
                    getMedsForMoment(moment, jour).map(med => {
                      const key = `${med.id}-${moment}-${jour}`;
                      const isTaken = takenMeds[key];
                      return (
                        <div key={med.id} className={`border rounded p-2 text-sm ${isTaken ? 'border-green-400 bg-green-50' : 'border-gray-300'}`}>
                          <div className="flex justify-between items-start gap-1 mb-1">
                            <div className="flex items-start gap-1">
                              <Pill className="text-blue-600 mt-0.5" size={16} />
                              <div>
                                <p className="font-bold">{med.nom}</p>
                                <p className="text-xs text-gray-600">{med.dosage}</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => editMed(med)} className="p-0.5 text-blue-600 hover:bg-blue-100 rounded" aria-label="Modifier"><Edit2 size={14} /></button>
                              <button onClick={() => deleteMed(med.id)} className="p-0.5 text-red-600 hover:bg-red-100 rounded" aria-label="Supprimer"><Trash2 size={14} /></button>
                            </div>
                          </div>
                          <button onClick={() => toggleTaken(med.id, moment, jour)} className={`w-full flex items-center justify-center gap-1 py-1 rounded font-medium text-xs ${isTaken ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                            <Check size={14} /> {isTaken ? 'Pris' : 'Valider'}
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
        </div>
      ))}
    </div>
  );
}
