import { RcpFormData, SituationType, StadeN, StadeT } from '../types';

export function formatStadeT(stade: StadeT, pathologic = false): string {
  const prefix = pathologic ? 'p' : '';
  return stade === 'Tis' ? `${prefix}Tis` : `${prefix}T${stade}`;
}

export function formatStadeN(stade: StadeN, pathologic = false): string {
  return `${pathologic ? 'p' : ''}N${stade}`;
}

/** Ex. « T2 N1 » ou « pT2 (< 3cm) pN0 ». */
export function formatStage(data: RcpFormData): string {
  if (data.situation === 'tumeur_en_place') {
    return `${formatStadeT(data.stadeT)} ${formatStadeN(data.stadeN)}`;
  }
  const taille = data.stadePT === '2' && data.tailleTumeur ? ` (${data.tailleTumeur})` : '';
  return `${formatStadeT(data.stadePT, true)}${taille} ${formatStadeN(data.stadePN, true)}`;
}

export function situationLabel(situation: SituationType): string {
  return situation === 'tumeur_en_place' ? 'Tumeur en place' : 'Adjuvant (Post-op)';
}

export function hpvLabel(statutHPV: boolean): string {
  return statutHPV ? 'Positif (p16+)' : 'Négatif';
}

export const yesNo = (value: boolean): string => (value ? 'Oui' : 'Non');
