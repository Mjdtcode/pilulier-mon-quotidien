// src/components/Contacts.jsx
import { useState, useRef } from 'react';
import { Phone, Mail, Plus, Trash2, Info } from 'lucide-react';

const mkId = () => crypto.randomUUID?.() ?? String(Date.now() + Math.random());

/*
⚠️ Prérequis côté App.jsx:
<Contacts
  contacts={contacts}
  setContacts={setContacts}
  onOpenPilulier={openPilulierForContact}
  setActivePatient={setActivePatient}
  patients={patients}
  setPatients={setPatients}
/>
*/

export default function Contacts({
  contacts,
  setContacts,
  onOpenPilulier,
  setActivePatient,
  patients,
  setPatients,
}) {
  /* ---------- état formulaire d’ajout de contact ---------- */
  const [form, setForm] = useState({
    type: 'proches',
    nom: '',
    specialite: '',
    telephone: '',
    email: '',
  });
  const [openInfo, setOpenInfo] = useState(null); // {type:'medecins|auxiliaires|proches|patients', id}
  const nameRef = useRef(null);

  const ensureType = (obj, type) => ({ ...obj, [type]: Array.isArray(obj?.[type]) ? obj[type] : [] });

  /* ==================== CONTACTS (médecins/auxiliaires/proches) ==================== */
  const addContact = (e) => {
    e?.preventDefault?.();
    const { type, nom, specialite, telephone, email } = form;
    const name = nom.trim();
    if (!name) return alert('Nom obligatoire');

    setContacts((prev0) => {
      const prev = ensureType(prev0 || {}, type);
      return {
        ...prev,
        [type]: [
          ...prev[type],
          {
            id: mkId(),
            nom: name,
            specialite: (specialite || '').trim(),
            telephone: (telephone || '').trim(),
            email: (email || '').trim(),
            notes: '',
            files: [],
          },
        ],
      };
    });

    setForm((f) => ({ ...f, nom: '', specialite: '', telephone: '', email: '' }));
    nameRef.current?.focus();
  };

  const removeContact = (type, id) => {
    setContacts((prev0) => {
      const prev = ensureType(prev0 || {}, type);
      return { ...prev, [type]: prev[type].filter((c) => c.id !== id) };
    });
    if (openInfo?.type === type && openInfo?.id === id) setOpenInfo(null);
  };

  const updateContact = (type, id, patch) => {
    setContacts((prev0) => {
      const prev = ensureType(prev0 || {}, type);
      return { ...prev, [type]: prev[type].map((c) => (c.id === id ? { ...c, ...patch } : c)) };
    });
  };

  const uploadToContact = async (type, id, files) => {
    const items = await Promise.all(
      [...files].slice(0, 8).map(
        (f) =>
          new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = () => res({ id: mkId(), name: f.name, dataUrl: r.result });
            r.onerror = rej;
            r.readAsDataURL(f);
          }),
      ),
    );
    setContacts((prev) => ({
      ...prev,
      [type]: prev[type].map((c) => (c.id === id ? { ...c, files: [...(c.files || []), ...items] } : c)),
    }));
  };

  /* ==================== PATIENTS (même UI que contacts) ==================== */
  const addPatient = () => {
    if (!setPatients) return;
    const name = prompt('Nom du patient à ajouter ?')?.trim();
    if (!name) return;

    setPatients((p) => {
      const exists = Object.values(p.byId).find((x) => x.name.toLowerCase() === name.toLowerCase());
      if (exists) return { ...p, activeId: exists.id };
      const id = mkId();
      return {
        ...p,
        activeId: id,
        byId: {
          ...p.byId,
          [id]: { id, name, meds: [], telephone: '', email: '', notes: '', files: [] },
        },
        order: [...p.order, id],
      };
    });
  };

  const removePatient = (id) => {
    if (!setPatients) return;
    setPatients((p) => {
      const { [id]: _drop, ...restById } = p.byId;
      const order = p.order.filter((x) => x !== id);
      const activeId = p.activeId === id ? (order[0] || 'me') : p.activeId;
      return { ...p, byId: restById, order, activeId };
    });
    if (openInfo?.type === 'patients' && openInfo?.id === id) setOpenInfo(null);
  };

  const updatePatient = (id, patch) => {
    if (!setPatients) return;
    setPatients((p) => ({ ...p, byId: { ...p.byId, [id]: { ...p.byId[id], ...patch } } }));
  };

  const uploadToPatient = async (id, files) => {
    if (!setPatients) return;
    const items = await Promise.all(
      [...files].slice(0, 8).map(
        (f) =>
          new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = () => res({ id: mkId(), name: f.name, dataUrl: r.result });
            r.onerror = rej;
            r.readAsDataURL(f);
          }),
      ),
    );
    setPatients((p) => ({
      ...p,
      byId: { ...p.byId, [id]: { ...p.byId[id], files: [...(p.byId[id].files || []), ...items] } },
    }));
  };

  /* ==================== Panneau Info réutilisable ==================== */
  const InfoPanel = ({ notes, files, onSaveNotes, onAddFiles, onRemoveFile }) => {
    const [txt, setTxt] = useState(notes || '');
    return (
      <div className="mt-3 border rounded-lg p-3 bg-slate-50">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold">Bloc-notes</h4>
          <button type="button" className="text-sm text-brand-700" onClick={() => onSaveNotes(txt)}>
            Enregistrer
          </button>
        </div>

        <textarea
          className="field w-full h-24"
          value={txt}
          onChange={(e) => setTxt(e.target.value)}
          placeholder="Notes (allergies, consignes…)"
        />

        <div className="mt-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Dossier • ordonnances</h4>
            <label className="btn btn-ghost text-sm cursor-pointer">
              Ajouter fichiers
              <input hidden type="file" accept="image/*,application/pdf" multiple onChange={(e) => onAddFiles(e.target.files)} />
            </label>
          </div>

          <ul className="mt-2 space-y-1">
            {(files || []).map((f) => (
              <li key={f.id} className="text-sm flex items-center justify-between">
                <a href={f.dataUrl} download={f.name} className="text-brand-700 underline truncate max-w-[75%]">
                  {f.name}
                </a>
                <button type="button" className="text-red-600 text-xs" onClick={() => onRemoveFile(f.id)}>
                  Supprimer
                </button>
              </li>
            ))}
            {(files || []).length === 0 && <li className="text-sm text-mute">Aucun fichier</li>}
          </ul>
        </div>
      </div>
    );
  };

  /* ==================== Cartes ==================== */
  const ContactCard = ({ type, contact }) => (
    <div className="bg-white rounded-lg p-4 shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
        <div>
          <button type="button" onClick={() => onOpenPilulier(contact.nom)} className="font-bold text-left hover:underline">
            {contact.nom}
          </button>
          {contact.specialite && <p className="text-sm text-gray-600">{contact.specialite}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => onOpenPilulier(contact.nom)} className="px-3 py-1 rounded bg-brand-600 text-white text-xs">
            Ouvrir pilulier
          </button>

          <button
            type="button"
            onClick={() =>
              setOpenInfo(openInfo?.type === type && openInfo?.id === contact.id ? null : { type, id: contact.id })
            }
            className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs inline-flex items-center gap-1"
          >
            <Info size={14} /> Info
          </button>

          <button type="button" onClick={() => removeContact(type, contact.id)} className="p-1 rounded bg-red-50 text-red-600 text-xs" title="Supprimer">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {contact.telephone && (
          <a href={`tel:${contact.telephone}`} className="flex items-center gap-2">
            <Phone size={16} /> {contact.telephone}
          </a>
        )}
        {contact.email && (
          <a href={`mailto:${contact.email}`} className="flex items-center gap-2">
            <Mail size={16} /> {contact.email}
          </a>
        )}
      </div>

      {openInfo?.type === type && openInfo?.id === contact.id && (
        <InfoPanel
          notes={contact.notes}
          files={contact.files}
          onSaveNotes={(txt) => {
            updateContact(type, contact.id, { notes: txt });
            setOpenInfo(null);
          }}
          onAddFiles={(files) => uploadToContact(type, contact.id, files)}
          onRemoveFile={(fid) =>
            updateContact(type, contact.id, { files: (contact.files || []).filter((x) => x.id !== fid) })
          }
        />
      )}
    </div>
  );

  const PatientCard = ({ patient }) => (
    <div className="bg-white rounded-lg p-4 shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
        <div>
          <button type="button" onClick={() => setActivePatient(patient.id)} className="font-bold text-left hover:underline">
            {patient.name}
          </button>
          <p className="text-sm text-transparent select-none">.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => onOpenPilulier(patient.name)} className="px-3 py-1 rounded bg-brand-600 text-white text-xs">
            Ouvrir pilulier
          </button>

          <button
            type="button"
            onClick={() =>
              setOpenInfo(openInfo?.type === 'patients' && openInfo?.id === patient.id ? null : { type: 'patients', id: patient.id })
            }
            className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs inline-flex items-center gap-1"
          >
            <Info size={14} /> Info
          </button>

          <button type="button" onClick={() => removePatient(patient.id)} className="p-1 rounded bg-red-50 text-red-600 text-xs" title="Supprimer">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {patient.telephone && (
          <a href={`tel:${patient.telephone}`} className="flex items-center gap-2">
            <Phone size={16} /> {patient.telephone}
          </a>
        )}
        {patient.email && (
          <a href={`mailto:${patient.email}`} className="flex items-center gap-2">
            <Mail size={16} /> {patient.email}
          </a>
        )}
      </div>

      {openInfo?.type === 'patients' && openInfo?.id === patient.id && (
        <InfoPanel
          notes={patient.notes}
          files={patient.files}
          onSaveNotes={(txt) => {
            updatePatient(patient.id, { notes: txt });
            setOpenInfo(null);
          }}
          onAddFiles={(files) => uploadToPatient(patient.id, files)}
          onRemoveFile={(fid) =>
            updatePatient(patient.id, { files: (patient.files || []).filter((x) => x.id !== fid) })
          }
        />
      )}
    </div>
  );

  /* ==================== Sections ==================== */
  const Section = ({ title, type, tint }) => {
    const list = (contacts && Array.isArray(contacts[type]) && contacts[type]) || [];
    return (
      <div className={`border-2 rounded-lg p-6 ${tint}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-brand-600 text-white text-sm"
            onClick={() => setForm((f) => ({ ...f, type }))}
          >
            <Plus size={16} /> Ajouter ici
          </button>
        </div>

        {list.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Aucun contact</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {list.map((c) => (
              <ContactCard key={c.id} type={type} contact={c} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const PatientsSection = () => {
    const list = patients.order.map((id) => patients.byId[id]);
    return (
      <div className="border-2 border-amber-200 rounded-lg p-6 bg-amber-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">🧑‍🦳 Patients</h3>
          <button type="button" className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-brand-600 text-white text-sm" onClick={addPatient}>
            <Plus size={16} /> Ajouter patient
          </button>
        </div>

        {list.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Aucun patient</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {list.map((p) => (
              <PatientCard key={p.id} patient={p} />
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ==================== Rendu ==================== */
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Formulaire d’ajout global pour contacts */}
      <form onSubmit={addContact} className="border-2 border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
        <h3 className="font-semibold">Ajouter un contact</h3>
        <div className="flex flex-wrap gap-3">
          <select className="field" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
            <option value="medecins">Médecins</option>
            <option value="auxiliaires">Auxiliaires</option>
            <option value="proches">Proches</option>
          </select>
          <input
            ref={nameRef}
            className="field flex-1 min-w-[180px]"
            placeholder="Nom"
            value={form.nom}
            onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
            required
          />
          <input
            className="field flex-1 min-w-[160px]"
            placeholder="Spécialité"
            value={form.specialite}
            onChange={(e) => setForm((f) => ({ ...f, specialite: e.target.value }))}
          />
          <input
            className="field"
            placeholder="Téléphone"
            value={form.telephone}
            onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
          />
          <input
            className="field"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <button type="submit" className="btn btn-primary">
            <Plus size={16} /> Ajouter
          </button>
        </div>
      </form>

      {/* Sections contacts */}
      <Section title="👨‍⚕️ Médecins" type="medecins" tint="border-blue-200 bg-blue-50" />
      <Section title="👩‍⚕️ Auxiliaires" type="auxiliaires" tint="border-green-200 bg-green-50" />
      <Section title="👨‍👩‍👧‍👦 Proches" type="proches" tint="border-purple-200 bg-purple-50" />

      {/* Section patients avec mêmes cartes */}
      <PatientsSection />
    </div>
  );
}
