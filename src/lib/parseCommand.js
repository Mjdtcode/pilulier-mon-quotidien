
import { parse } from 'date-fns';
import { fr } from 'date-fns/locale';

const joursMap = ['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'];
const cap = (s)=> s ? s.charAt(0).toUpperCase()+s.slice(1) : s;

export function parseCommand(txt){
  const t = (txt||'').toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu,'')
    .replace(/[,.;:!?]/g,' ')
    .replace(/\s+/g,' ').trim();

  const qMatch = t.match(/\b(\d{1,2})\s*(?:x|fois)?\b/);
  const quantite = qMatch ? Math.max(1, parseInt(qMatch[1],10)) : 1;

  let nom = '';
  const medAfterQty = t.match(/\b(?:\d{1,2}\s*(?:x|fois)?\s*)?([a-z0-9\-]{3,})\b/);
  if (medAfterQty) nom = medAfterQty[1];
  const medAfterDe = t.match(/\b(?:de|d)\s+([a-z0-9\-]{3,})\b/);
  if (medAfterDe && medAfterDe[1]) nom = medAfterDe[1] || nom;

  const dMatch = t.match(/(\d{2,4}\s*(?:mg|ml|mcg|g))/);
  const dosage = dMatch ? dMatch[1] : 'à préciser';

  const jours = joursMap.filter(j=> t.includes(j)).map(j=> cap(j));

  let patient = 'Patient';
  const pMatch = t.match(/\b(?:a|à)\s+(mme|mr|m)\s+([a-z]+(?:\s+[a-z]+)*)/);
  if (pMatch) patient = cap(`${pMatch[1].toUpperCase()} ${pMatch[2]}`);

  let until;
  const uMatch = t.match(/jusqu(?:au|a)\s+(\d{1,2}\s+[a-zéû]+(?:\s+\d{4})?)/);
  if (uMatch) {
    const candidate = parse(uMatch[1], 'd MMMM yyyy', new Date(), { locale: fr });
    if (!isNaN(candidate.getTime())) until = candidate;
  }

  let moments = ['Matin'];
  if (t.includes('soir')) moments = ['Soir'];
  else if (t.includes('midi')) moments = ['Midi'];
  else if (t.includes('apres midi') || t.includes('après midi')) moments = ['Après-midi'];

  if (!nom || jours.length===0) return null;
  return { patient, nom, dosage, quantite, jours, until, moments };
}
