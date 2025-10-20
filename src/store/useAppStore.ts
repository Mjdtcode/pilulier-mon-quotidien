import { create } from 'zustand';

export type Moment = 'Matin'|'Midi'|'Après-midi'|'Soir';
export type Jour = 'Lundi'|'Mardi'|'Mercredi'|'Jeudi'|'Vendredi'|'Samedi'|'Dimanche';

export interface Med {
  id: number;
  nom: string;
  dosage: string;
  moments: Moment[];
  jours: Jour[];
  notes?: string;
  patient?: string;
}

interface State {
  medications: Med[];
  addMed: (m: Omit<Med,'id'>) => number;
  addPrescription: (p:{
    patient: string;
    nom: string;
    dosage: string;
    quantite?: number;
    jours: Jour[];
    until?: Date;
    moments?: Moment[];
  })=>void;
  reset: () => void;
}

export const useAppStore = create<State>((set,get)=>({
  medications: [],
  addMed: (m)=>{
    const id = Date.now() + Math.floor(Math.random()*1000);
    set(s=>({ medications: [...s.medications, { ...m, id }] }));
    return id;
  },
  addPrescription: ({patient,nom,dosage,quantite=1,jours,until,moments=['Matin']} )=>{
    const notes = until ? `Jusqu'au ${new Date(until).toLocaleDateString('fr-FR')}` : '';
    for (let i=0;i<quantite;i++) {
      get().addMed({ nom, dosage, jours, moments, notes, patient });
    }
  },
  reset: ()=> set({ medications: [] })
}));

// LocalStorage persistence
try {
  if (typeof window !== 'undefined') {
    const LS = 'medications';
    const raw = window.localStorage.getItem(LS);
    if (raw) {
      const parsed = JSON.parse(raw);
      useAppStore.setState({ medications: parsed });
    }
    useAppStore.subscribe((s)=>{
      window.localStorage.setItem(LS, JSON.stringify(s.medications));
    });
  }
} catch {}
