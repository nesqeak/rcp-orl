import {
  EffractionCapsulaire,
  HistologieENT,
  LocalisationENT,
  MargesResection,
} from '../types';

export const LOCALISATIONS: LocalisationENT[] = [
  'Nasopharynx',
  'Sinus de la face (hors ethmoïde)',
  'Sinus ethmoïde',
  'Fosses nasales',
  'Cavité buccale',
  'Oropharynx',
  'Hypopharynx',
  'Larynx',
  'Glande salivaire',
];

/** Ordre d'affichage du guide de contourage (localisations les plus fréquentes en premier). */
export const CONTOURING_LOCALISATIONS: LocalisationENT[] = [
  'Oropharynx',
  'Cavité buccale',
  'Nasopharynx',
  'Hypopharynx',
  'Larynx',
  'Sinus de la face (hors ethmoïde)',
  'Sinus ethmoïde',
  'Fosses nasales',
  'Glande salivaire',
];

export const HISTOLOGIES: HistologieENT[] = [
  'Carcinome épidermoïde',
  'ADK',
  'UCNT',
  'SNUC',
  'CAC',
  'autre',
];

export const MARGES_OPTIONS: { value: MargesResection; label: string }[] = [
  { value: 'Envahies', label: 'Envahies (R1/R2)' },
  { value: 'Envahies mais recoupe négative', label: 'Envahies mais recoupe extemporanée négative' },
  { value: '< 5mm', label: '< 5 mm (Marges étroites)' },
  { value: '> 5mm', label: '> 5 mm (Marges saines)' },
];

export const ECE_OPTIONS: EffractionCapsulaire[] = ['Non', 'Mineure', 'Majeure'];

/** Couleur du bouton actif selon la gravité de l'effraction capsulaire. */
export const ECE_ACTIVE_CLASS: Record<EffractionCapsulaire, string> = {
  Non: 'bg-teal-600 text-white border-teal-600',
  Mineure: 'bg-amber-600 text-white border-amber-600',
  Majeure: 'bg-rose-600 text-white border-rose-600',
};

export const STEREO_POST_OP_PROPOSITION = 'Radiothérapie STEREO POST OP 36Gy';
