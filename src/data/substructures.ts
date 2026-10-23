import { LocalisationENT } from '../types';

export interface SubstructureOption {
  id: string;
  label: string;
  recoradBrInclusions: string[];
}

export interface BaseNodalLevel {
  id: string;
  shortName: string;
  label: string;
}

export const BASE_NODAL_LEVELS: BaseNodalLevel[] = [
  { id: 'Ia', shortName: 'Ia', label: 'Ia - Submentonnier' },
  { id: 'Ib', shortName: 'Ib', label: 'Ib - Submandibulaire' },
  { id: 'II', shortName: 'II', label: 'II - Jugulaire supérieur' },
  { id: 'III', shortName: 'III', label: 'III - Jugulaire moyen' },
  { id: 'IV', shortName: 'IV', label: 'IV - Jugulaire inférieur' },
  { id: 'Va', shortName: 'Va', label: 'Va - Spinal supérieur' },
  { id: 'Vb', shortName: 'Vb', label: 'Vb - Spinal inférieur' },
  { id: 'Vc', shortName: 'Vc', label: 'Vc - Supraclaviculaire' },
  { id: 'VIa', shortName: 'VIa', label: 'VIa - Antéro-inférieur' },
  { id: 'VIb', shortName: 'VIb', label: 'VIb - Paratrachéal / Récurrentiel' },
  { id: 'RP', shortName: 'RP', label: 'Rétro-pharyngés (RP)' },
  { id: 'Parotidiens', shortName: 'Parotidiens', label: 'Parotidiens' },
];

export const SUBSTRUCTURES_MAP: Record<LocalisationENT, SubstructureOption[]> = {
  'Sinus de la face (hors ethmoïde)': [
    {
      id: 'sinus_maxillaire',
      label: 'Sinus maxillaire',
      recoradBrInclusions: [
        'Parois osseuses du sinus maxillaire (antérieure, postérieure, supérieure/plancher de l’orbite, médiale)',
        'Fosse ptérygo-maxillaire et espace masticateur adjacent',
        'Fosse infratemporelle en cas d’extension postérieure',
      ],
    },
    {
      id: 'sinus_sphenoide',
      label: 'Sinus sphénoïde',
      recoradBrInclusions: [
        'Cavité du sinus sphénoïdal et clivus supérieur',
        'Fissure orbitaire supérieure et sinus caverneux ipsilatéral si érosion osseuse',
        'Toit du cavum / sinus sphénoïdal antéro-inférieur',
      ],
    },
  ],
  'Cavité buccale': [
    {
      id: 'levre',
      label: 'Lèvre',
      recoradBrInclusions: [
        'Versant mucosal et cutané de la lèvre touchée',
        'Commissure labiale adjacente',
        'Versant gingival antérieur ipsilatéral',
      ],
    },
    {
      id: 'gencive_inferieure',
      label: 'Gencive inférieure',
      recoradBrInclusions: [
        'Versant gingivo-mandibulaire et sillon gingivo-lingual',
        'Corticale mandibulaire adjacente et trou mentonnier ipsilatéral',
        'Plancher buccal adjacent',
      ],
    },
    {
      id: 'gencive_superieure',
      label: 'Gencive supérieure',
      recoradBrInclusions: [
        'Versant gingivo-maxillaire et palais dur adjacent',
        'Plancher du sinus maxillaire sous-jacent',
        'Sillon gingivo-jugal supérieur',
      ],
    },
    {
      id: 'langue_mobile',
      label: 'Langue mobile',
      recoradBrInclusions: [
        'Loge linguale intrinsèque ipsilatérale',
        'Sillon gingivo-lingual ipsilatéral',
        'Plancher buccal adjacent et base de langue ipsilatérale',
      ],
    },
    {
      id: 'plancher',
      label: 'Plancher',
      recoradBrInclusions: [
        'Plancher buccal antérieur et postérieur ipsilatéral',
        'Face ventrale de la langue et sillon gingivo-lingual',
        'Glandes sublinguale et submandibulaire ipsilatérales',
      ],
    },
    {
      id: 'joue',
      label: 'Joue',
      recoradBrInclusions: [
        'Mucose jugale et espace buccinateur',
        'Sillons gingivo-jugaux supérieur et inférieur',
        'Commissure inter-maxillaire si postérieure',
      ],
    },
    {
      id: 'commissure_intermaxillaire',
      label: 'Commissure inter-maxillaire',
      recoradBrInclusions: [
        'Espace rétromolaire ipsilatéral',
        'Partie postérieure des gencives supérieure et inférieure',
        'Pilier antérieur de l’amygdale adjacent',
      ],
    },
    {
      id: 'palais_dur',
      label: 'Palais dur',
      recoradBrInclusions: [
        'Mucopérioste du palais dur',
        'Plancher de la cavité nasale et plancher du sinus maxillaire',
        'Voile du palais antérieur (jonction)',
      ],
    },
    {
      id: 'trigone_retromolaire_inf',
      label: 'Trigone rétro-molaire inférieur',
      recoradBrInclusions: [
        'Trigone rétromolaire et branche montante de la mandibule',
        'Pilier antérieur de l’amygdale',
        'Espace pterygo-mandibulaire et sillon gingivo-lingual postérieur',
      ],
    },
    {
      id: 'trigone_retromolaire_sup',
      label: 'Trigone rétro-molaire supérieur',
      recoradBrInclusions: [
        'Trigone rétromolaire supérieur et tubérosité du maxillaire',
        'Voile du palais adjacent et pilier antérieur',
        'Fosse ptérygo-maxillaire (partie basse)',
      ],
    },
  ],
  'Oropharynx': [
    {
      id: 'pilier_anterieur',
      label: 'Pilier antérieur',
      recoradBrInclusions: [
        'Pilier antérieur de l’amygdale',
        'Trigone rétromolaire et sillon amygdalo-glosse',
        'Partie latérale du voile du palais',
      ],
    },
    {
      id: 'amygdale',
      label: 'Amygdale',
      recoradBrInclusions: [
        'Loge amygdalienne complète et piliers antérieur/postérieur',
        'Sillon amygdalo-glosse',
        'Espace parapharyngé latéral adjacent',
      ],
    },
    {
      id: 'pilier_posterieur',
      label: 'Pilier postérieur',
      recoradBrInclusions: [
        'Pilier postérieur de l’amygdale',
        'Paroi pharyngée latérale adjacente',
        'Partie postéro-latérale du voile',
      ],
    },
    {
      id: 'voile',
      label: 'Voile',
      recoradBrInclusions: [
        'Voile du palais en totalité (ou hémi-voile si très latéralisé)',
        'Piliers antérieurs et postérieurs de l’amygdale',
        'Marges postérieures du palais dur',
      ],
    },
    {
      id: 'sillon_amygdaloglosse',
      label: 'Sillon amygdalo-glosse',
      recoradBrInclusions: [
        'Sillon amygdalo-glosse ipsilatéral',
        'Bas-fond de la loge amygdalienne',
        'Bord postéro-latéral de la langue mobile et base de langue adjacente',
      ],
    },
    {
      id: 'base_de_langue',
      label: 'Base de langue',
      recoradBrInclusions: [
        'Base de langue ipsilatérale (ou bilatérale si médiane/T3-T4)',
        'Sillon amygdalo-glosse et vallécule',
        'Muscles génioglosses et hyoglosses supérieurs',
      ],
    },
    {
      id: 'vallecule',
      label: 'Vallécule',
      recoradBrInclusions: [
        'Vallécules (droite et gauche) et repli glosso-épiglottique',
        'Face antérieure de l’épiglotte supra-hyoïdienne',
        'Base de langue postérieure',
      ],
    },
    {
      id: 'paroi_pharyngee_posterieure_oro',
      label: 'Paroi pharyngée postérieure',
      recoradBrInclusions: [
        'Paroi pharyngée postérieure au niveau oropharyngé',
        'Espace rétropharyngé adjacent',
        'Parois pharyngées latérales adjacentes',
      ],
    },
  ],
  'Hypopharynx': [
    {
      id: 'paroi_pharyngee_posterieure_hypo',
      label: 'Paroi pharyngée postérieure',
      recoradBrInclusions: [
        'Paroi pharyngée postérieure de la hauteur de hyoïde à cricoïde',
        'Espace rétropharyngé postérieur',
        'Parois pharyngées latérales et jonction avec sinus piriforme',
      ],
    },
    {
      id: 'paroi_pharyngee_laterale',
      label: 'Paroi pharyngée latérale',
      recoradBrInclusions: [
        'Paroi pharyngée latérale de l’hypopharynx',
        'Sinus piriforme adjacent (versant externe)',
        'Espace parapharyngé inférieur',
      ],
    },
    {
      id: 'sinus_piriforme',
      label: 'Sinus piriforme',
      recoradBrInclusions: [
        'Sinus piriforme ipsilatéral (sommet et versants interne/externe)',
        'Repli aryéno-épiglottique ipsilatéral',
        'Espace paraglottique et région rétrocricoïdienne adjacente',
      ],
    },
    {
      id: 'retrocricoide',
      label: 'Rétrocricoïde',
      recoradBrInclusions: [
        'Région rétrocricoïdienne en totalité',
        'Partie basse des deux sinus piriformes',
        'Paroi postérieure de l’hypopharynx / jonction œsophagienne supérieure',
      ],
    },
  ],
  'Larynx': [
    {
      id: 'supra_glottique',
      label: 'Supra-glottique',
      recoradBrInclusions: [
        'Épiglotte (libre et pétiole), replis ary-épiglottiques et bandes ventriculaires',
        'Espace pré-épiglottique et espaces paraglottiques supérieurs',
        'Aryténoïdes',
      ],
    },
    {
      id: 'glotte_pure',
      label: 'Glotte pure',
      recoradBrInclusions: [
        'Cordes vocales vraies (droite et gauche si commissure atteinte)',
        'Commissure antérieure',
        'Sous-glotte immédiate (< 5 mm)',
      ],
    },
    {
      id: 'sous_glottique',
      label: 'Sous-glottique',
      recoradBrInclusions: [
        'Étage sous-glottique du cartilage cricoïde à la première bague trachéale',
        'Espace paraglottique inférieur',
        'Glande thyroïde et loge récurrentielle (selon T)',
      ],
    },
  ],
  'Glande salivaire': [
    {
      id: 'parotide',
      label: 'Parotide',
      recoradBrInclusions: [
        'Loge parotidienne complète (lobes superficiel et profond)',
        'Canal de Sténon (si atteinte antérieure)',
        'Espace parapharyngé pré-stylien et ganglions intra-parotidien',
      ],
    },
    {
      id: 'sous_mandibulaire',
      label: 'Sous mandibulaire',
      recoradBrInclusions: [
        'Loge sous-mandibulaire ipsilatérale',
        'Canal de Wharton et plancher buccal adjacent',
        'Ganglions du niveau IB',
      ],
    },
  ],
  'Nasopharynx': [
    {
      id: 'toit_cavum',
      label: 'Paroi supérieure / Toit du cavum',
      recoradBrInclusions: [
        'Ensemble du cavum / nasopharynx',
        'Sinus sphénoïdal inféro-antérieur et clivus antérieur',
        'Choanes postérieures',
      ],
    },
    {
      id: 'fossette_rosenmuller',
      label: 'Fossette de Rosenmüller / Paroi latérale',
      recoradBrInclusions: [
        'Fossette de Rosenmüller et ostium tubaire',
        'Espace parapharyngé pré- et rétrostylien haut',
        'Trou déchiré et trou ovale si T3-T4',
      ],
    },
  ],
  'Sinus ethmoïde': [
    {
      id: 'ethmoide_ant_post',
      label: 'Cellules ethmoïdales antérieures et postérieures',
      recoradBrInclusions: [
        'Labyrinthe ethmoïdal complet ipsilatéral',
        'Lame criblée et planum sphénoïdal',
        'Partie supérieure des fosses nasales',
      ],
    },
  ],
  'Fosses nasales': [
    {
      id: 'fosses_nasales_global',
      label: 'Septum, cornets et vestibule nasal',
      recoradBrInclusions: [
        'Fosse nasale atteinte et meulage des cornets',
        'Septum nasal antérieur et postérieur',
        'Sinus ethmoïdal inférieur adjacent',
      ],
    },
  ],
};
