import {
  LocalisationENT,
  RcpFormAdjuvant,
  RcpFormData,
  RcpFormTumeurEnPlace,
  SituationType,
  StadeN,
} from '../../types';
import { getAvailableStadesN, getAvailableStadesT, pickAvailableStade } from '../../utils/rcpDecisionEngine';

/**
 * Transitions pures du cas clinique édité dans le guide de contourage.
 * Le statut HPV n'est pris en compte que pour l'oropharynx.
 */

export function defaultCase(): RcpFormData {
  return {
    situation: 'tumeur_en_place',
    localisation: 'Oropharynx',
    stadeT: '1',
    stadeN: '0',
    statutHPV: false,
    histologie: 'Carcinome épidermoïde',
    cisplatineEligible: true,
    chimiotherapieInduction: false,
    atteinteLigneMediane: false,
    nodalAreas: [],
  };
}

export const currentStadeN = (data: RcpFormData): StadeN =>
  data.situation === 'tumeur_en_place' ? data.stadeN : data.stadePN;

/** Les aires ganglionnaires envahies n'ont de sens que pour un N+. */
const nodalAreasFor = (stadeN: StadeN, nodalAreas: string[] | undefined) => (stadeN === '0' ? [] : nodalAreas ?? []);

export function withStadeN(data: RcpFormData, stadeN: StadeN): RcpFormData {
  const nodalAreas = nodalAreasFor(stadeN, data.nodalAreas);
  return data.situation === 'tumeur_en_place'
    ? { ...data, stadeN, nodalAreas }
    : { ...data, stadePN: stadeN, nodalAreas };
}

export function withSituation(prev: RcpFormData, situation: SituationType): RcpFormData {
  // Les champs de l'autre situation sont conservés s'ils ont déjà été saisis
  const p = prev as Partial<RcpFormTumeurEnPlace> & Partial<RcpFormAdjuvant>;
  const statutHPV = prev.localisation === 'Oropharynx' ? prev.statutHPV : false;
  const availableT = getAvailableStadesT(prev.localisation);
  const availableN = getAvailableStadesN(prev.localisation, statutHPV, situation);
  const common = {
    localisation: prev.localisation,
    statutHPV,
    histologie: prev.histologie,
    cisplatineEligible: prev.cisplatineEligible,
    atteinteLigneMediane: prev.atteinteLigneMediane ?? false,
  };

  if (situation === 'tumeur_en_place') {
    const stadeN = pickAvailableStade(p.stadeN, availableN, '0');
    return {
      situation,
      ...common,
      stadeT: pickAvailableStade(p.stadeT, availableT, '1'),
      stadeN,
      nbGanglions: statutHPV && stadeN === '1' ? p.nbGanglions ?? '1' : undefined,
      chimiotherapieInduction: p.chimiotherapieInduction ?? false,
      nodalAreas: nodalAreasFor(stadeN, prev.nodalAreas),
    };
  }

  const stadePN = pickAvailableStade(p.stadePN, availableN, '0');
  return {
    situation,
    ...common,
    stadePT: pickAvailableStade(p.stadePT, availableT, '1'),
    tailleTumeur: p.tailleTumeur ?? '< 3cm',
    stadePN,
    embolesVasculaires: p.embolesVasculaires ?? false,
    engainementPerineuronal: p.engainementPerineuronal ?? false,
    WPI: p.WPI ?? false,
    marges: p.marges ?? '> 5mm',
    effractionExtraCapsulaire: p.effractionExtraCapsulaire ?? 'Non',
    lambeau: p.lambeau ?? false,
    nodalAreas: nodalAreasFor(stadePN, prev.nodalAreas),
  };
}

export function withLocalisation(prev: RcpFormData, localisation: LocalisationENT): RcpFormData {
  const statutHPV = localisation === 'Oropharynx' ? prev.statutHPV : false;
  const availableT = getAvailableStadesT(localisation);
  const availableN = getAvailableStadesN(localisation, statutHPV, prev.situation);

  if (prev.situation === 'tumeur_en_place') {
    const stadeN = pickAvailableStade(prev.stadeN, availableN, '0');
    return {
      ...prev,
      localisation,
      statutHPV,
      stadeT: pickAvailableStade(prev.stadeT, availableT, '1'),
      stadeN,
      nodalAreas: stadeN === '0' ? [] : prev.nodalAreas,
    };
  }
  const stadePN = pickAvailableStade(prev.stadePN, availableN, '0');
  return {
    ...prev,
    localisation,
    statutHPV,
    stadePT: pickAvailableStade(prev.stadePT, availableT, '1'),
    stadePN,
    nodalAreas: stadePN === '0' ? [] : prev.nodalAreas,
  };
}

export function withHPV(prev: RcpFormData, statutHPV: boolean): RcpFormData {
  const availableN = getAvailableStadesN(prev.localisation, statutHPV, prev.situation);
  return prev.situation === 'tumeur_en_place'
    ? { ...prev, statutHPV, stadeN: pickAvailableStade(prev.stadeN, availableN) }
    : { ...prev, statutHPV, stadePN: pickAvailableStade(prev.stadePN, availableN) };
}

export function toggleItem(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

/** La question « atteinte de la ligne médiane » ne conditionne la latéralité que pour certaines localisations. */
export function showsMedianLineChoice(localisation: LocalisationENT, selectedSubstructures: string[]): boolean {
  if (localisation === 'Cavité buccale') return true;
  if (localisation === 'Sinus de la face (hors ethmoïde)' || localisation === 'Sinus ethmoïde') return true;
  return (
    localisation === 'Oropharynx' &&
    !(selectedSubstructures.length === 1 && selectedSubstructures[0] === 'paroi_pharyngee_posterieure_oro')
  );
}
