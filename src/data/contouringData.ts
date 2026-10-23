import { ContouringGuideline, OarConstraint, LocalisationENT } from '../types';

export const CONTOURING_GUIDELINES: Record<LocalisationENT, ContouringGuideline> = {
  Oropharynx: {
    localisation: 'Oropharynx',
    title: 'Oropharynx (Amygdale, Base de langue, Voile, Paroi postérieure)',
    description:
      'Recommandations DAHANCA / ESTRO / EORTC pour le contourage des volumes cibles de l’oropharynx.',
    gtvDefinition:
      'GTV_T = Tumeur primitive macroscopique visible (TDM + IRM T2/T1+C + TEP 18-FDG).\nGTV_N = Tous les ganglions métastatiques pathologiques (>10mm, centre nécrotique, ou fixation TEP).',
    ctvHighRisk:
      'CTV_HR (66-70 Gy en définitif / 60-66 Gy post-op) :\n• GTV_T + 5 à 10 mm de marge isotrope adaptée aux barrières anatomiques (os, muscle ptérygoïdien si non envahi, fascia prévertébral).\n• Inclure l’ensemble de la loge amygdalienne ou de la base de langue si extension unilatérale étendue.\n• CTV_HR_N = GTV_N + 5 mm.',
    ctvLowRisk:
      'CTV_LR / IR (50-54 Gy ou 56 Gy) :\n• Extension prophylactique muqueuse locale (ex. base de langue adjacente, sillon amygdaloglosse).\n• Aires ganglionnaires prophylactiques bilatérales.',
    nodalLevelsN0:
      'Inclusion prophylactique des niveaux IIa, IIb, III, IVa et Vb bilatéraux.\n• Note p16+ / HPV+ : Possibilité de limiter le niveau IV si N0 strict et tumeur limitée.',
    nodalLevelsNPlus:
      'Inclusion systématique des niveaux Ia, Ib, IIa, IIb, III, IVa, IVb, V bilatéraux.\n• Si atteinte de la paroi postérieure ou de la base de langue : inclure les ganglions rétropharyngés (RP).',
    pitfallsAndNotes: [
      'Toujours fusionner l’IRM T2 et T1 injectée avec la TDM de centrage pour la base de langue.',
      'Ne pas sous-estimer l’extension à la fossette hyo-épiglottique et à l’espace pré-épiglottique.',
      'En cas d’atteinte du pilier antérieur, étendre le CTV-HR vers la région rétromolaire.',
    ],
  },
  'Cavité buccale': {
    localisation: 'Cavité buccale',
    title: 'Cavité buccale (Langue mobile, Plancher, Gencive, Trigone rétromolaire)',
    description:
      'Guide de contourage post-opératoire et définitif des tumeurs de la cavité buccale.',
    gtvDefinition:
      'GTV_T = Masse tumorale primitive (examen clinique / palper + IRM + TDM).\nGTV_N = Ganglions métastatiques visibles.',
    ctvHighRisk:
      'CTV_HR (66 Gy post-op si marges envahies / ECE+ / 70 Gy définitif) :\n• Lit opératoire / GTV_T + 10 mm de marge.\n• Inclure la totalité du compartiment du plancher ou de l’hémilangue si exérèse incomplète.\n• Si lambeau de reconstruction : inclure la jonction hôte-greffon (ne pas englober le centre du lambeau non tumoral de manière inutile pour limiter la toxicité).',
    ctvLowRisk:
      'CTV_LR (50-54 Gy) :\n• Aires ganglionnaires prophylactiques contiguës.',
    nodalLevelsN0:
      'N0 : Niveaux Ia, Ib, IIa, IIb, III ipsilatéraux (ou bilatéraux si tumeur médiane / franchissant la ligne médiane ou du plancher buccal).',
    nodalLevelsNPlus:
      'N+ : Niveaux Ia, Ib, IIa, IIb, III, IV, V ipsilatéraux et contrôlatéraux systématiques.',
    pitfallsAndNotes: [
      'Pour le plancher buccal, la couverture du niveau Ib ipsi et contrôlatéral est cruciale.',
      'Attention au risque d’engainement péri-nerveux le long du nerf lingual et V3 (foramen ovale) pour le trigone rétromolaire.',
      'Ajuster la marge aux structures osseuses (mandibule non envahie).',
    ],
  },
  Nasopharynx: {
    localisation: 'Nasopharynx',
    title: 'Nasopharynx (Cavum)',
    description:
      'Guidelines internationales ICRU 87 / DAHANCA / US-European Consensus pour le cancer du cavum.',
    gtvDefinition:
      'GTV_P = Tumeur primitive sur IRM T1+C / T2 / TEP-FDG.\nGTV_N = Ganglions rétropharyngés et cervicaux envahis.',
    ctvHighRisk:
      'CTV_HR 70 Gy :\n• GTV_P + 5 mm.\n• GTV_N + 5 mm.',
    ctvLowRisk:
      'CTV_LR / IR 54-60 Gy :\n• Totalité du nasopharynx, sinus sphénoïdal (partie inférieure si T1-T2, totalité si T3-T4), clivus (antérieur si T1-T2, total si T3-T4), espace parapharyngé, fente ptérygomaxillaire, partie postérieure des fosses nasales et des sinus éthmoïdaux, base du crâne (foramen ovale, spinosum, lacerum, canal carotidien).\n• Aires ganglionnaires rétropharyngées + niveaux II, III, IV, V, VI.',
    nodalLevelsN0:
      'Aires ganglionnaires rétropharyngées (RP) bilatérales et niveaux II, III, IVa, V bilatéraux systématiques.',
    nodalLevelsNPlus:
      'Aires RP + niveaux I à V bilatéraux complétés selon le niveau d’envahissement (niveau IVb et creux sus-claviculaire si N+ bas).',
    pitfallsAndNotes: [
      'L’IRM est obligatoire pour apprécier l’infiltration du clivus, du sinus caverneux et des trous de la base du crâne.',
      'Attention au respect strict des contraintes aux voies optiques et au tronc cérébral.',
      'Les ganglions rétropharyngés (Rouvière) doivent être scrupuleusement englobés.',
    ],
  },
  Hypopharynx: {
    localisation: 'Hypopharynx',
    title: 'Hypopharynx (Sinus piriforme, Paroi postérieure, Région rétro-cricoïdienne)',
    description:
      'Guide de contourage des cancers de l’hypopharynx (volontiers lymphophiles et infiltrants).',
    gtvDefinition:
      'GTV_T = Tumeur hypopharyngée (fibroscopie + TDM + IRM/TEP).\nGTV_N = Adénopathies cervicales.',
    ctvHighRisk:
      'CTV_HR (70 Gy / 66 Gy post-op) :\n• GTV_T + 10 mm en hauteur (extension sous-muqueuse microscopique fréquente).\n• Inclure le larynx si envahissement du mur pharyngolaryngé ou fixation cordale.',
    ctvLowRisk:
      'CTV_LR (50-54 Gy) :\n• Totalité de l’hypopharynx et du larynx suprapromontorique.\n• Aires ganglionnaires prophylactiques bilatérales.',
    nodalLevelsN0:
      'Niveaux IIa, IIb, III, IVa, Vb et aires rétropharyngées inférieures bilatérales.',
    nodalLevelsNPlus:
      'Niveaux IIa, IIb, III, IVa, IVb, V bilatéraux + Niveaux VI (récurrentiels) si extension sous-glottique ou de la région rétro-cricoïdienne.',
    pitfallsAndNotes: [
      'Extension sous-muqueuse longitudinale très fréquente (marge crânio-caudale de 10-15 mm indispensable).',
      'Surveiller l’extension à l’espace pré-épi-glottique et au cartilage thyroïde.',
      'Penser aux ganglions récurrentiels (niveau VI) en cas d’extension bas située.',
    ],
  },
  Larynx: {
    localisation: 'Larynx',
    title: 'Larynx (Supraglotte, Glotte, Sous-glotte)',
    description:
      'Guidelines pour la conservation laryngée et le traitement post-opératoire des cancers du larynx.',
    gtvDefinition:
      'GTV_T = Tumeur laryngée macroscopique.\nGTV_N = Ganglions métastatiques.',
    ctvHighRisk:
      'CTV_HR (70 Gy définitif / 60-66 Gy post-op) :\n• Glotte T1/T2 : GTV + 5 mm (pas d’irradiation ganglionnaire pour T1a N0).\n• Supraglotte / T3-T4 : GTV_T + 10 mm englobant l’espace pré-épiglottique et paraglottique.',
    ctvLowRisk:
      'CTV_LR (50-54 Gy) :\n• Structure laryngée complète + aires ganglionnaires prophylactiques (pour supraglotte et T2-T4 glottiques).',
    nodalLevelsN0:
      '• Glotte T1N0 : Pas d’aires ganglionnaires.\n• Glotte T2-T4 N0 et Supraglotte N0 : Niveaux IIa, III, IVa bilatéraux.',
    nodalLevelsNPlus:
      'Niveaux IIa, IIb, III, IVa, IVb, V bilatéraux + Niveau VI (récurrentiel et pré-trachéal) si T4 ou extension sous-glottique > 10 mm.',
    pitfallsAndNotes: [
      'Pour le larynx glottique T1aN0 : faisceau personnalisé étroit ciblant uniquement les cordes vocales.',
      'Vérifier la recherche d’invasion du cartilage thyroïde (fenêtre osseuse au TDM / IRM).',
    ],
  },
  'Sinus de la face (hors ethmoïde)': {
    localisation: 'Sinus de la face (hors ethmoïde)',
    title: 'Sinus Maxillaire et Sinus Frontal/Sphénoïde',
    description:
      'Recommandations pour les tumeurs des sinus maxillaires et sinus de la face.',
    gtvDefinition:
      'GTV_T = Tumeur sinusienne macroscopique (corrélation étroite TDM fenêtre osseuse + IRM T1+C/T2).',
    ctvHighRisk:
      'CTV_HR (70 Gy définitif / 66 Gy post-op) :\n• GTV + 10 mm adapté aux limites osseuses et durales.',
    ctvLowRisk:
      'CTV_LR (50-54 Gy) :\n• Totalité du sinus maxillaire atteint, fosse ptérygopalatine, partie inférieure de l’orbite si effraction du plancher, fosses nasales adjacentes.',
    nodalLevelsN0:
      'N0 : Niveaux Ib, II, III unilatéraux (du côté de la tumeur uniquement si pas d’atteinte de la ligne médiane ; bilatéraux si atteinte de la ligne médiane). Optionnelle pour T1-T2 N0, recommandée pour T3-T4.',
    nodalLevelsNPlus:
      'N+ : Niveaux Ia, Ib, II, III, IV unilatéraux du côté de la tumeur si pas d’atteinte de la ligne médiane et adénopathies homolatérales ; bilatéraux si franchissement de la ligne médiane ou N+ bilatéral.',
    pitfallsAndNotes: [
      'Analyse fine de la fente ptérygomaxillaire et de la fosse ptérygopalatine (voie de propagation neurophile).',
      'Protection drastique des structures optiques (chiasma, nerfs optiques) et des voies lacrymales.',
    ],
  },
  'Sinus ethmoïde': {
    localisation: 'Sinus ethmoïde',
    title: 'Ethmoïde et Tumeurs Sino-Nasales Complexe (SNUC, ADK, Epidermoïde)',
    description:
      'Guide de contourage hautement spécialisé pour le sinus ethmoïde et la base du crâne.',
    gtvDefinition:
      'GTV_T = Tumeur de l’ethmoïde (IRM indispensable pour différencier rétention de mucus et invasion tumorale).',
    ctvHighRisk:
      'CTV_HR (66-70 Gy / 60-66 Gy post-op) :\n• GTV + 10 mm englobant la lame criblée et les cellules ethmoïdales antérieures/postérieures.',
    ctvLowRisk:
      'CTV_LR (50-54 Gy) :\n• Sinus sphénoïdal, sinus maxillaire adjacent, fosses nasales antéro-supérieures, dure-mère de la fosse cérébrale antérieure si extension suprajacente.',
    nodalLevelsN0:
      'N0 : Niveaux Ib, II, III unilatéraux (du côté de la tumeur uniquement si pas d’atteinte de la ligne médiane ; bilatéraux si atteinte de la ligne médiane). Surveillance fréquente pour T1-T2, prophylaxie pour T3-T4 ou histologie agressive (SNUC, épidermoïde).',
    nodalLevelsNPlus:
      'N+ : Niveaux Ib, II, III, IV unilatéraux (du côté de la tumeur uniquement) si pas d’atteinte de la ligne médiane et adénopathies homolatérales ; bilatéraux si franchissement de la ligne médiane ou N+ bilatéral.',
    pitfallsAndNotes: [
      'Séparer strictement les sécrétions retenues dans le sinus frontal/maxillaire du tissu tumoral actif via l’IRM (T2 hypersignal clair du mucus vs T1+C rehaussement tumoral).',
      'Si extension méningée : prévoir une marge dural au CTV.',
    ],
  },
  'Fosses nasales': {
    localisation: 'Fosses nasales',
    title: 'Fosses Nasales et Cloison Nasale',
    description: 'Contourage des tumeurs primitives des fosses nasales.',
    gtvDefinition:
      'GTV_T = Tumeur des fosses nasales sur examen clinique (endoscopie) et imagerie.',
    ctvHighRisk: 'CTV_HR = GTV + 10 mm d’extension locale.',
    ctvLowRisk:
      'CTV_LR = Cavité nasale ipsilatérale ou bilatérale, sinus éthmoïdal homolatéral, méat moyen.',
    nodalLevelsN0:
      'N0 : Généralement non irradié pour T1-T2. Niveaux Ib, IIa pour T3-T4.',
    nodalLevelsNPlus: 'N+ : Niveaux Ib, II, III, IV bilatéraux.',
    pitfallsAndNotes: [
      'Attention à la cartographie endoscopique pré-opératoire.',
      'Contrôler l’extension au vestibule nasal et à la lèvre supérieure.',
    ],
  },
  'Glande salivaire': {
    localisation: 'Glande salivaire',
    title: 'Glande Parotide et Glande Submandibulaire (CAC, ADK, Mucoépidermoïde)',
    description:
      'Contourage pour tumeurs des glandes salivaires principales (CAC, Carcinome Épidermoïde, ADK).',
    gtvDefinition:
      'GTV_T / Lit opératoire = Loge parotidienne ou submandibulaire + extensions tumorales.',
    ctvHighRisk:
      'CTV_HR (60-66 Gy post-op) :\n• Lit de la loge salivaire + 10 mm.\n• Pour le Carcinome Adénoïde Kystique (CAC) : inclure obligatoirement le trajet des nerfs crâniens (VII pour la parotide jusqu’au trou stylo-mastoïdien ; V3/V2 et V1 selon la branche concernée).',
    ctvLowRisk:
      'CTV_LR (50-54 Gy) :\n• Loge salivaire élargie + aires ganglionnaires de drainage.',
    nodalLevelsN0:
      '• CAC N0 : Irradiation ganglionnaire prophylactique non recommandée systématiquement sauf si haut grade.\n• Carcinome épidermoïde / ADK / Mucoépidermoïde haut grade N0 : Niveaux Ib, II, III, IV ipsilatéraux.',
    nodalLevelsNPlus:
      'Niveaux Ib, IIa, IIb, III, IV, V ipsilatéraux (+ rétropharyngés si parotide postérieure ou N+ volumineux).',
    pitfallsAndNotes: [
      'Pour le CAC (Carcinome Adénoïde Kystique) : Trajets nerveux du VII et du V3 à contourer spécifiquement jusqu’à la base du crâne (Foramen Stylo-mastoïdien et Foramen Ovale) !',
      'Éviter d’irradier inutilement le côté contrôlatéral si parotide unilatérale.',
    ],
  },
};

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
