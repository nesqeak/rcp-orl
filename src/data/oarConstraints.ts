import { OarConstraint } from '../types';

export const OAR_CONSTRAINTS: OarConstraint[] = [
  {
    name: 'Moelle épinière (Spinal Cord)',
    doseLimit: 'Dmax < 45 Gy (PRV < 48 Gy)',
    endpoint: 'Myélopathie radique',
    notes: 'Marge PRV de 2 à 3 mm autour du canal médullaire.',
  },
  {
    name: 'Tronc cérébral (Brainstem)',
    doseLimit: 'Dmax < 54 Gy (ou < 60 Gy sur < 1 cc)',
    endpoint: 'Nécrose du tronc cérébral',
    notes: 'Marge PRV de 3 mm.',
  },
  {
    name: 'Chiasma optique & Nerfs optiques',
    doseLimit: 'Dmax < 54 Gy',
    endpoint: 'Névrite optique radique / Cécité',
    notes: 'Crucial pour Nasopharynx et Sinus éthmoïde.',
  },
  {
    name: 'Glandes Parotides contrôlatérale / moyenne',
    doseLimit: 'Dmoy < 20 Gy (au moins 1 parotide) ou Dmoy < 26 Gy',
    endpoint: 'Xérostomie irréversible (> 50% réduction de salive)',
    notes: 'Contourer le parenchyme glandulaire sans le GTV.',
  },
  {
    name: 'Glandes Submandibulaires (si préservables)',
    doseLimit: 'Dmoy < 39 Gy',
    endpoint: 'Xérostomie nocturne et baisse de salive de repos',
    notes: 'Possible uniquement si N0 et non envahie.',
  },
  {
    name: 'Constricteurs du Pharynx (Supérieur, Moyen, Inférieur)',
    doseLimit: 'Dmoy < 50 Gy (V60 < 30%)',
    endpoint: 'Dysphagie chronique et risque d’aspiration / pneumopathie',
    notes: 'Segmenter le pharynx en 3 niveaux au TDM.',
  },
  {
    name: 'Larynx / Corde vocale / Glotte (si non cible)',
    doseLimit: 'Dmoy < 45 Gy / Dmax < 50 Gy',
    endpoint: 'Œdème laryngé, dysphonie, nécrose laryngée',
    notes: 'Protéger la sous-glotte et le cartilage cricoïde.',
  },
  {
    name: 'Mandibule / Os maxillaire',
    doseLimit: 'Dmax < 70 Gy (V60 < 10%)',
    endpoint: 'Ostéoradionécrose (ORN)',
    notes: 'Surtout en cas de mauvaise hygiène dentaire ou avulsion récente.',
  },
  {
    name: 'Plexus brachial',
    doseLimit: 'Dmax < 60-66 Gy',
    endpoint: 'Plexopathie brachiale / Douleurs / Parésie',
    notes: 'Contourer des racines C5 à T1 dans le creux sus-claviculaire.',
  },
  {
    name: 'Cochlée',
    doseLimit: 'Dmoy < 45 Gy (ou < 35 Gy si Cisplatine associé)',
    endpoint: 'Hypoacousie neurosensoriellle / Surdité',
    notes: 'Synergie de toxicité otologique avec le cisplatine.',
  },
  {
    name: 'Ophioglossus / Muscle Genioglosse / Plancher',
    doseLimit: 'Dmoy < 50 Gy',
    endpoint: 'Trismus et dysarthrie',
    notes: 'Limiter la dose moyenne aux structures musculaires.',
  },
];
