import { Phone, Mail } from 'lucide-react';

export default function Contacts({ contacts, setContacts, onOpenPilulier, setActivePatient, patients }) {
  const openFor = (name) => onOpenPilulier(name);

  const Section = ({ title, type, tint }) => {
    const list = contacts?.[type] ?? [];
    return (
      <div className={`border-2 rounded-lg p-6 ${tint}`}>
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        {list.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Aucun contact</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {list.map(contact => (
              <div key={contact.id} className="bg-white rounded-lg p-4 shadow">
                <div className="flex justify-between mb-3">
                  <div>
                    <button
                      type="button"
                      onClick={() => onOpenPilulier(contact.nom)}
                      className="font-bold text-left hover:underline"
                    >
                      {contact.nom}
                    </button>
                    {contact.specialite && (
                      <p className="text-sm text-gray-600">{contact.specialite}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openFor(contact.nom)}
                      className="px-2 py-1 rounded bg-brand-600 text-white text-xs"
                    >
                      Ouvrir pilulier
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {contact.telephone && (
                    <a href={`tel:${contact.telephone}`} className="flex items-center gap-2">
                      <Phone size={16} />{contact.telephone}
                    </a>
                  )}
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="flex items-center gap-2">
                      <Mail size={16} />{contact.email}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mes Contacts</h2>
        <div className="text-sm text-mute">Patients actifs : {patients.order.length}</div>
      </div>

      <Section title="👨‍⚕️ Médecins" type="medecins" tint="border-blue-200 bg-blue-50" />
      <Section title="👩‍⚕️ Auxiliaires" type="auxiliaires" tint="border-green-200 bg-green-50" />
      <Section title="👨‍👩‍👧‍👦 Proches" type="proches" tint="border-purple-200 bg-purple-50" />

      {/* Patients directs */}
      <div className="border-2 border-amber-200 rounded-lg p-6 bg-amber-50">
        <h3 className="text-xl font-bold mb-4">🧑‍🦳 Patients</h3>
        <div className="flex flex-wrap gap-2">
          {patients.order.map(id => (
            <button
              key={id}
              onClick={() => setActivePatient(id)}
              className="px-3 py-2 rounded-lg bg-white shadow text-sm"
            >
              {patients.byId[id].name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
