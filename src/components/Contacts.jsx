import { Users, Edit2, Trash2, Phone, Mail, UserPlus, X } from 'lucide-react';
import { useState } from 'react';

export default function Contacts({ contacts, setContacts }) {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('medecins');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nom: '', specialite: '', telephone: '', email: '', notes: '' });

  const submit = () => {
    if (!form.nom || !form.telephone) { alert('Nom et téléphone requis'); return; }
    if (editing) {
      setContacts(prev => ({ ...prev, [type]: prev[type].map(c => c.id === editing.id ? { ...form, id: editing.id } : c) }));
      setEditing(null);
    } else {
      const id = crypto.randomUUID?.() ?? Date.now();
      setContacts(prev => ({ ...prev, [type]: [...prev[type], { ...form, id }] }));
    }
    setForm({ nom: '', specialite: '', telephone: '', email: '', notes: '' });
    setShowForm(false);
  };

  const del = (t, id) => setContacts(prev => ({ ...prev, [t]: prev[t].filter(c => c.id !== id) }));
  const edit = (t, c) => { setType(t); setEditing(c); setForm(c); setShowForm(true); };

  const Block = ({ title, color, list, tkey }) => (
    <div className={`border-2 rounded-lg p-6 bg-${color}-50 border-${color}-200`}>
      <h3 className={`text-xl font-bold text-${color}-900 mb-4`}>{title}</h3>
      {list.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Aucun</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {list.map(c => (
            <div key={c.id} className="bg-white rounded-lg p-4 shadow">
              <div className="flex justify-between mb-3">
                <div>
                  <h4 className="font-bold">{c.nom}</h4>
                  {c.specialite && <p className={`text-sm text-${color}-600`}>{c.specialite}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => edit(tkey, c)} className="p-1 text-blue-600 hover:bg-blue-100 rounded" aria-label="Modifier"><Edit2 size={16} /></button>
                  <button onClick={() => del(tkey, c.id)} className="p-1 text-red-600 hover:bg-red-100 rounded" aria-label="Supprimer"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {c.telephone && <a href={`tel:${c.telephone}`} className="flex items-center gap-2"><Phone size={16} />{c.telephone}</a>}
                {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-2"><Mail size={16} />{c.email}</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Users size={32} className="text-green-600" />
          <div>
            <h2 className="text-2xl font-bold">Mes Contacts</h2>
            <p className="text-gray-600">Contacts médicaux et personnels</p>
          </div>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ nom:'', specialite:'', telephone:'', email:'', notes:'' }); }} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          <UserPlus size={20} /> Ajouter
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-gray-50 rounded-lg p-6 border-2 border-green-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">{editing ? 'Modifier' : 'Nouveau contact'}</h3>
            <button aria-label="Fermer" onClick={() => setShowForm(false)}><X size={24} /></button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type *</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                <option value="medecins">Médecin</option>
                <option value="auxiliaires">Auxiliaire</option>
                <option value="proches">Proche</option>
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom *</label>
                <input type="text" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Spécialité</label>
                <input type="text" value={form.specialite} onChange={e => setForm({ ...form, specialite: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Téléphone *</label>
                <input type="tel" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-2 border rounded-lg" rows="2" />
            </div>

            <div className="flex gap-3">
              <button onClick={submit} className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">{editing ? 'Modifier' : 'Ajouter'}</button>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-6 py-3 border rounded-lg hover:bg-gray-50">Annuler</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <Block title="👨‍⚕️ Médecins" color="blue" list={contacts.medecins} tkey="medecins" />
        <Block title="👩‍⚕️ Auxiliaires" color="green" list={contacts.auxiliaires} tkey="auxiliaires" />
        <Block title="👨‍👩‍👧‍👦 Proches" color="purple" list={contacts.proches} tkey="proches" />
      </div>
    </div>
  );
}
