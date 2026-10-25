import type { NodalLevel } from '../utils/contouringEngine';

/**
 * Correspondance avec les structures de la visionneuse scanner (nesqeak.github.io/contourage) :
 * « CTV structures » de Lapeyre 2005 (GORTEC) et niveaux ganglionnaires de Grégoire 2014.
 * Les structures de la visionneuse sont latérales (copiées de chaque côté) sauf celles listées ici.
 */
export const VIEWER_URL = 'https://nesqeak.github.io/contourage/';

export const VIEWER_MEDIAN_STRUCTURES = new Set(['palais_dur', 'sinus_sphenoidal', 'voile', 'n_Ia', 'n_VIa', 'n_VIb']);

/** Structure de la visionneuse ; `bilateral` l'inclut des deux côtés quel que soit le côté tumoral. */
interface ViewerStructureRef {
  id: string;
  bilateral?: boolean;
}

const s = (id: string, bilateral = false): ViewerStructureRef => ({ id, bilateral });

/**
 * Structures de la visionneuse correspondant aux inclusions RECORAD de chaque sous-structure tumorale (CTV T BR).
 * Les sous-structures sans équivalent dans la visionneuse (lèvre, larynx, sinus ethmoïde...) ne produisent aucun volume.
 */
export const T_BR_VIEWER_STRUCTURES: Record<string, ViewerStructureRef[]> = {
  // Sinus de la face
  sinus_maxillaire: [s('fosse_ptp'), s('adipeux_it')],
  sinus_sphenoide: [s('sinus_sphenoidal'), s('sinus_caverneux'), s('cavum')],
  // Cavité buccale
  levre: [],
  gencive_inferieure: [s('racine_plancher')],
  gencive_superieure: [s('palais_dur')],
  langue_mobile: [s('langue'), s('racine_plancher'), s('base_langue')],
  plancher: [s('racine_plancher'), s('langue'), s('glande_sm')],
  joue: [s('joue'), s('adipeux_buccal')],
  commissure_intermaxillaire: [s('trigone_rm'), s('pilier_ant')],
  palais_dur: [s('palais_dur'), s('voile')],
  trigone_retromolaire_inf: [s('trigone_rm'), s('pilier_ant')],
  trigone_retromolaire_sup: [s('trigone_rm'), s('voile'), s('pilier_ant'), s('fosse_ptp')],
  // Oropharynx
  pilier_anterieur: [s('pilier_ant'), s('trigone_rm'), s('voile')],
  amygdale: [s('amygdale'), s('pilier_ant'), s('parapharyngé')],
  pilier_posterieur: [s('amygdale'), s('voile')],
  voile: [s('voile'), s('pilier_ant'), s('amygdale'), s('palais_dur')],
  sillon_amygdaloglosse: [s('pilier_ant'), s('amygdale'), s('langue'), s('base_langue')],
  base_de_langue: [s('base_langue'), s('pilier_ant'), s('vallecule'), s('genio_glosse')],
  vallecule: [s('vallecule', true), s('base_langue')],
  paroi_pharyngee_posterieure_oro: [s('paroi_post', true), s('retropharyngé')],
  // Hypopharynx (la visionneuse s'arrête au cricoïde : seuls les espaces profonds sont disponibles)
  paroi_pharyngee_posterieure_hypo: [s('retropharyngé')],
  paroi_pharyngee_laterale: [s('parapharyngé')],
  sinus_piriforme: [],
  retrocricoide: [],
  // Larynx : pas de structure dans la visionneuse
  supra_glottique: [],
  glotte_pure: [],
  sous_glottique: [],
  // Glandes salivaires
  parotide: [s('parapharyngé')],
  sous_mandibulaire: [s('glande_sm'), s('racine_plancher')],
  // Nasopharynx
  toit_cavum: [s('cavum', true), s('sinus_sphenoidal')],
  fossette_rosenmuller: [s('cavum'), s('parapharyngé'), s('carotidien')],
  // Sinus ethmoïde, fosses nasales : pas de structure dans la visionneuse
  ethmoide_ant_post: [],
  fosses_nasales_global: [],
};

/** Inclusions systématiques du Consensus Nasopharynx 2024 (cavum total, sinus sphénoïdal, espace parapharyngé). */
export const NASOPHARYNX_T_BR_VIEWER_STRUCTURES: ViewerStructureRef[] = [
  s('cavum', true),
  s('sinus_sphenoidal'),
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
