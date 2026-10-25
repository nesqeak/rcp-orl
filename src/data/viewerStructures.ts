import type { NodalLevel } from '../utils/contouringEngine';

/**
 * Correspondance avec les structures de la visionneuse scanner (nesqeak.github.io/contourage) :
 * « CTV structures » de Lapeyre 2005 (GORTEC) et niveaux ganglionnaires de Grégoire 2014.
 * Les structures de la visionneuse sont latérales (copiées de chaque côté) sauf celles listées ici.
 */
export const VIEWER_URL = 'https://nesqeak.github.io/contourage/';

export const VIEWER_MEDIAN_STRUCTURES = new Set([
  // atlas
  'palais_dur', 'sinus_sphenoidal', 'voile', 'n_Ia', 'n_VIa', 'n_VIb',
  // structures ajoutées vides, à contourer dans la visionneuse
  'epiglotte', 'retrocricoide', 'pre_epiglottique', 'commissure_ant', 'sous_glotte', 'clivus', 'lame_criblee', 'septum_nasal',
]);

/** Structure de la visionneuse ; `bilateral` l'inclut des deux côtés quel que soit le côté tumoral. */
interface ViewerStructureRef {
  id: string;
  bilateral?: boolean;
}

const s = (id: string, bilateral = false): ViewerStructureRef => ({ id, bilateral });

/**
 * Structures de la visionneuse correspondant aux inclusions RECORAD de chaque sous-structure tumorale (CTV T BR).
 * Celles qui n'existaient pas dans l'atlas y ont été créées vides : elles entrent dans le CTV_T_BR dès qu'elles sont contourées.
 */
export const T_BR_VIEWER_STRUCTURES: Record<string, ViewerStructureRef[]> = {
  // Sinus de la face
  sinus_maxillaire: [s('sinus_maxillaire'), s('fosse_ptp'), s('masticateur'), s('adipeux_it')],
  sinus_sphenoide: [s('sinus_sphenoidal'), s('fissure_orbitaire_sup'), s('sinus_caverneux'), s('cavum')],
  // Cavité buccale
  levre: [s('levre'), s('gencive_inf')],
  gencive_inferieure: [s('gencive_inf'), s('mandibule'), s('racine_plancher')],
  gencive_superieure: [s('gencive_sup'), s('palais_dur'), s('sinus_maxillaire')],
  langue_mobile: [s('langue'), s('racine_plancher'), s('base_langue')],
  plancher: [s('racine_plancher'), s('langue'), s('glande_sublinguale'), s('glande_sm')],
  joue: [s('joue'), s('adipeux_buccal')],
  commissure_intermaxillaire: [s('trigone_rm'), s('gencive_sup'), s('gencive_inf'), s('pilier_ant')],
  palais_dur: [s('palais_dur'), s('fosse_nasale', true), s('sinus_maxillaire'), s('voile')],
  trigone_retromolaire_inf: [s('trigone_rm'), s('mandibule'), s('pilier_ant'), s('pterygo_mandibulaire')],
  trigone_retromolaire_sup: [s('trigone_rm'), s('gencive_sup'), s('voile'), s('pilier_ant'), s('fosse_ptp')],
  // Oropharynx
  pilier_anterieur: [s('pilier_ant'), s('trigone_rm'), s('voile')],
  amygdale: [s('amygdale'), s('pilier_ant'), s('parapharyngé')],
  pilier_posterieur: [s('amygdale'), s('paroi_laterale_oro'), s('voile')],
  voile: [s('voile'), s('pilier_ant'), s('amygdale'), s('palais_dur')],
  sillon_amygdaloglosse: [s('pilier_ant'), s('amygdale'), s('langue'), s('base_langue')],
  base_de_langue: [s('base_langue'), s('pilier_ant'), s('vallecule'), s('genio_glosse')],
  vallecule: [s('vallecule', true), s('epiglotte'), s('base_langue')],
  paroi_pharyngee_posterieure_oro: [s('paroi_post', true), s('retropharyngé'), s('paroi_laterale_oro')],
  // Hypopharynx
  paroi_pharyngee_posterieure_hypo: [s('paroi_post_hypo', true), s('retropharyngé'), s('paroi_laterale_hypo')],
  paroi_pharyngee_laterale: [s('paroi_laterale_hypo'), s('sinus_piriforme'), s('parapharyngé')],
  sinus_piriforme: [s('sinus_piriforme'), s('repli_ae'), s('paraglottique'), s('retrocricoide')],
  retrocricoide: [s('retrocricoide'), s('sinus_piriforme', true), s('paroi_post_hypo', true)],
  // Larynx (la thyroïde et la trachée sont hors du champ du scanner, arrêté au cricoïde)
  supra_glottique: [
    s('epiglotte'),
    s('repli_ae'),
    s('bande_ventriculaire'),
    s('pre_epiglottique'),
    s('paraglottique'),
    s('arytenoide'),
  ],
  glotte_pure: [s('corde_vocale'), s('commissure_ant'), s('sous_glotte')],
  sous_glottique: [s('sous_glotte'), s('paraglottique')],
  // Glandes salivaires
  parotide: [s('parotide'), s('parapharyngé')],
  sous_mandibulaire: [s('glande_sm'), s('racine_plancher')],
  // Nasopharynx
  toit_cavum: [s('cavum', true), s('sinus_sphenoidal'), s('clivus'), s('fosse_nasale', true)],
  fossette_rosenmuller: [s('cavum'), s('parapharyngé'), s('carotidien'), s('foramen_lacerum')],
  // Sinus ethmoïde, fosses nasales
  ethmoide_ant_post: [s('ethmoide'), s('lame_criblee'), s('fosse_nasale')],
  fosses_nasales_global: [s('fosse_nasale'), s('septum_nasal'), s('ethmoide')],
};

/** Inclusions systématiques du Consensus Nasopharynx 2024 (cavum total, sinus sphénoïdal, clivus, choanes, espace parapharyngé). */
export const NASOPHARYNX_T_BR_VIEWER_STRUCTURES: ViewerStructureRef[] = [
  s('cavum', true),
  s('sinus_sphenoidal'),
  s('clivus'),
  s('fosse_nasale', true),
  s('parapharyngé', true),
];

/** Niveaux ganglionnaires → structures de la visionneuse (null : hors champ du scanner, qui s'arrête au cricoïde). */
export const NODAL_LEVEL_VIEWER_STRUCTURES: Record<NodalLevel, string | null> = {
  Ia: 'n_Ia',
  Ib: 'n_Ib',
  II: 'n_II',
  III: 'n_III',
  IV: null,
  V: 'n_V',
  VIa: 'n_VIa',
  VIb: 'n_VIb',
  RP: 'n_VIIa',
};
