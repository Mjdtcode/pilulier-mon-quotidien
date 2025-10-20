// CJS ONLY: Netlify Functions tournent en CommonJS
const fs = require('fs');
const path = require('path');

// charge le mini-Vidal local
const medsDb = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'medicaments.json'), 'utf-8')
);

// ---------- handler ----------
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { text = '', context = {} } = JSON.parse(event.body || '{}');
  const t = norm(text);

  // 1) FICHE MÉDICAMENT si l’utilisateur tape juste un nom
  const info = findMedInfo(text);
  if (info) return ok(info);

  // 2) intents simples liés au patient actif
  if (context.patient) {
    if (/(^|\b)(bonjour|salut)\b/.test(t)) return ok(`Bonjour. Vous consultez le pilulier de ${context.patient}.`);
    if (/\b(contact|contacts?)\b/.test(t)) return ok(`Onglet Contacts pour gérer le réseau de ${context.patient}.`);
    if (/\b(rappel|notif)\w*\b/.test(t)) return ok('Activez les rappels et laissez le son du téléphone actif.');
  }

  // 3) détection "ajouter ..."
  const cmd = parseAdd(t);
  if (cmd) {
    const untilTxt = cmd.until ? ` jusqu'au ${cmd.until}` : '';
    return okPlus(
      `Ajout: ${cmd.quantite} ${cmd.nom} ${cmd.dosage} — ${cmd.moments.join(', ')} — ${cmd.jours.join(', ')}${untilTxt}.`,
      { add: cmd }
    );
  }

  // 4) écho
  const meds = Array.isArray(context.meds) ? context.meds : [];
  if (meds.length) return ok(`Médicaments notés: ${meds.slice(0,3).map(m=>m.nom).join(', ')}.`);

  return ok("Tapez un nom (ex: doliprane) ou dites: « ajouter 2 forlax 10 g vendredi après-midi jusqu’au 3 décembre ».");
};

// ---------- fiches ----------
function findMedInfo(raw) {
  if (!raw) return null;
  const q = norm(raw);
  const hit = medsDb.find(m => {
    const n = norm(m.nom);
    const s = norm(m.substance || '');
    return q.includes(n) || (s && q.includes(s));
  });
  if (!hit) return null;

  const lines = [
    `🔎 ${cap(hit.nom)}${hit.substance ? ` (${hit.substance})` : ''}${hit.classe ? ` — ${hit.classe}` : ''}`,
    hit.indications ? `Indications : ${hit.indications}` : null,
    hit.posologie_adulte ? `Posologie adulte : ${hit.posologie_adulte}` : null,
    hit.posologie_enfant ? `Posologie enfant : ${hit.posologie_enfant}` : null,
    hit.contre_indications ? `Contre-indications : ${hit.contre_indications}` : null,
    hit.interactions ? `Interactions : ${hit.interactions}` : null,
    hit.effets_indesirables ? `Effets indésirables : ${hit.effets_indesirables}` : null
  ].filter(Boolean);
  return lines.join('\n');
}

// ---------- parse "ajouter ..." ----------
function parseAdd(t) {
  if (!/\b(ajout|ajouter|mets?|mettre|cr[eé]er)\b/.test(t)) return null;
  const q = pickInt(t.match(/\b(\d{1,2})\s*(?:x|fois)?\b/), 1);
  let nom = pickStr(t.match(/\b(?:ajout(?:er)?|mets?|mettre|cr[eé]er)\s+(?:\d{1,2}\s*(?:x|fois)?\s*)?([a-z0-9\-]{3,})\b/));
  if (!nom) nom = pickStr(t.match(/\b(?:de|d)\s+([a-z0-9\-]{3,})\b/));
  if (!nom) return null;
  const dosage = pickStr(t.match(/(\d{2,4}\s*(?:mg|ml|mcg|g))/)) || 'à préciser';

  const moments = [];
  if (/\bmatin\b/.test(t)) moments.push('Matin');
  if (/\bmidi\b/.test(t)) moments.push('Midi');
  if (/\b(apres\s*midi|apres\-midi|apresmidi|après\s*midi|après\-midi|aprèsmidi)\b/.test(t)) moments.push('Après-midi');
  if (/\bsoir\b/.test(t)) moments.push('Soir');
  if (moments.length === 0) moments.push('Matin');

  const J = ['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'];
  const jours = J.filter(j => t.includes(j)).map(cap);
  if (jours.length === 0) return null;

  let patient = 'Patient';
  const pm1 = t.match(/\b(?:a|à)\s+(mme|mr|m)\s+([a-z]+(?:\s+[a-z]+)*)/);
  const pm2 = t.match(/\bpour\s+([a-z]+(?:\s+[a-z]+)*)/);
  if (pm1) patient = cap(`${pm1[1].toUpperCase()} ${pm1[2]}`); else if (pm2) patient = cap(pm2[1]);

  let until;
  const um = t.match(/jusqu(?:au|a)\s+([0-9]{1,2}\s+[a-zéû]+)(?:\s+([0-9]{4}))?/);
  if (um) until = `${um[1]} ${um[2] || new Date().getFullYear()}`;

  return { patient, nom, dosage, quantite: q, jours, until, moments };
}

// ---------- utils ----------
function ok(msg){ return { statusCode: 200, headers: {'content-type':'application/json'}, body: JSON.stringify({ content: msg }) }; }
function okPlus(msg, extra){ return { statusCode: 200, headers: {'content-type':'application/json'}, body: JSON.stringify({ content: msg, ...extra }) }; }
function norm(s){ return (s||'').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[,:;.!?]/g,' ').replace(/\s+/g,' ').trim(); }
function cap(s){ return s ? s.charAt(0).toUpperCase()+s.slice(1) : s; }
function pickInt(m,d){ return m && m[1] ? Math.max(1, parseInt(m[1],10)) : d; }
function pickStr(m){ return m && m[1] ? m[1] : ''; }


