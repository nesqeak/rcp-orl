import { Cote, RcpFormData } from '../types';
import {
  NASOPHARYNX_T_BR_VIEWER_STRUCTURES,
  NODAL_LEVEL_VIEWER_STRUCTURES,
  T_BR_VIEWER_STRUCTURES,
  VIEWER_MEDIAN_STRUCTURES,
  VIEWER_URL,
} from '../data/viewerStructures';
import { ContouringEvaluationResult, NodalLevel } from './contouringEngine';
import { formatStage } from './format';

const SUFFIX: Record<Cote, string> = { Droit: '_d', Gauche: '_g' };
const opposite = (side: Cote): Cote => (side === 'Droit' ? 'Gauche' : 'Droit');

/** Identifiant latéralisé dans la visionneuse (`n_II_d`), ou identifiant seul pour une structure médiane. */
const sided = (id: string, side: Cote) => (VIEWER_MEDIAN_STRUCTURES.has(id) ? id : id + SUFFIX[side]);

export interface ViewerVolumes {
  /** Sous-CTV du CTV T bas risque (CTV_P_BR). */
  ctvPBr: string[];
  /** Sous-CTV du CTV N bas risque (CTV_N_BR). */
  ctvNBr: string[];
  /** Niveaux recommandés absents de la visionneuse (hors champ). */
  missingLevels: NodalLevel[];
}

export function computeViewerVolumes(
  formData: RcpFormData,
  selectedSubstructures: string[],
  recs: ContouringEvaluationResult,
  side: Cote
): ViewerVolumes {
  const ctvPBr = new Set<string>();
  if (recs.ctvTLowRisk && !recs.isStereoPostOp) {
    const refs = [
      ...(formData.localisation === 'Nasopharynx' ? NASOPHARYNX_T_BR_VIEWER_STRUCTURES : []),
      ...selectedSubstructures.flatMap((id) => T_BR_VIEWER_STRUCTURES[id] ?? []),
    ];
    // Atteinte de la ligne médiane : inclusions des deux côtés
    const bothSides = formData.atteinteLigneMediane ?? false;
    for (const ref of refs) {
      ctvPBr.add(sided(ref.id, side));
      if (ref.bilateral || bothSides) ctvPBr.add(sided(ref.id, opposite(side)));
    }
  }

  const ctvNBr = new Set<string>();
  const missing = new Set<NodalLevel>();
  const addLevels = (levels: NodalLevel[], levelSide: Cote) => {
    for (const level of levels) {
      const id = NODAL_LEVEL_VIEWER_STRUCTURES[level];
      if (id) ctvNBr.add(sided(id, levelSide));
      else missing.add(level);
    }
  };
  addLevels(recs.ctvNLowRiskLevels.ipsilateral, side);
  addLevels(recs.ctvNLowRiskLevels.contralateral, opposite(side));

  return { ctvPBr: [...ctvPBr], ctvNBr: [...ctvNBr], missingLevels: [...missing] };
}

/** Lien vers la visionneuse : atlas complet sans cas, volumes composites CTV_P_BR / CTV_N_BR sinon. */
export function buildViewerUrl(case_?: { formData: RcpFormData; side: Cote; volumes: ViewerVolumes }): string {
  if (!case_) return VIEWER_URL;
  const { formData, side, volumes } = case_;
  const params = new URLSearchParams();
  params.set('cas', `${formData.localisation} · ${formatStage(formData)} · côté ${side.toLowerCase()}`);
  if (volumes.ctvPBr.length) params.set('ctv_p_br', volumes.ctvPBr.join(','));
  if (volumes.ctvNBr.length) params.set('ctv_n_br', volumes.ctvNBr.join(','));
  return `${VIEWER_URL}?${params.toString()}`;
}
