import {
  DoseProposition,
  LocalisationENT,
  RcpFormAdjuvant,
  RcpFormData,
  RcpFormTumeurEnPlace,
  RcpResultOutput,
  SituationType,
  StadeN,
  StadeT,
} from '../types';

const NOTE_ESSAI = 'Inclusion dans un essai clinique si disponible';

/** Stades N strictement supérieurs à N1 (classifications HPV- et HPV+ confondues). */
const N_GREATER_THAN_1: StadeN[] = ['2', '2a', '2b', '2c', '3', '3a', '3b', 'X'];

export function getAvailableStadesT(localisation: LocalisationENT): StadeT[] {
  if (localisation === 'Larynx') {
    return ['Tis', '1', '2', '3', '4', 'X'];
  }
  return ['1', '2', '3', '4', 'X'];
}

export function getAvailableStadesN(
  localisation: LocalisationENT,
  statutHPV: boolean,
  situation: SituationType
): StadeN[] {
  if (localisation === 'Nasopharynx') {
    return ['0', '1', '2', '3'];
  }
  if (statutHPV) {
    return situation === 'tumeur_en_place' ? ['0', '1', '2', '3'] : ['0', '1a', '1b', '2', '3'];
  }
  return ['0', '1', '2a', '2b', '2c', '3a', '3b', 'X'];
}

/** Conserve `value` s'il fait partie des stades disponibles, sinon se replie sur `preferred` puis sur le premier stade. */
export function pickAvailableStade<S extends string>(value: S | undefined, available: S[], preferred?: S): S {
  if (value !== undefined && available.includes(value)) return value;
  if (preferred !== undefined && available.includes(preferred)) return preferred;
  return available[0];
}

export function evaluateRcpDecision(data: RcpFormData): RcpResultOutput {
  const { proposition, justification } =
    data.situation === 'tumeur_en_place' ? evaluateTumeurEnPlace(data) : evaluateAdjuvant(data);

  return {
    proposition,
    justification: [justification],
    inclusionEssaiNote: NOTE_ESSAI,
    recommendedLocalisation: data.localisation,
  };
}

interface Decision {
  proposition: DoseProposition;
  justification: string;
}

const decide = (proposition: DoseProposition, justification: string): Decision => ({
  proposition,
  justification,
});

// --- TUMEUR EN PLACE ---

function evaluateTumeurEnPlace(data: RcpFormTumeurEnPlace): Decision {
  const {
    localisation,
    stadeT,
    stadeN,
    statutHPV,
    nbGanglions,
    histologie,
    cisplatineEligible,
    chimiotherapieInduction,
  } = data;

  const isN0 = stadeN === '0';
  const isNGreaterThan1 = N_GREATER_THAN_1.includes(stadeN);
  const isTGreaterThan2 = stadeT === '3' || stadeT === '4' || stadeT === 'X';
  const isTLessOrEqual2 = !isTGreaterThan2;

  // Carcinome épidermoïde du larynx Tis / T1 / T2 N0 : schémas hypofractionnés
  if (localisation === 'Larynx' && histologie === 'Carcinome épidermoïde' && isN0) {
    switch (stadeT) {
      case 'Tis':
        return decide(
          'Radiothérapie 60.75Gy (2.25Gy/fx)',
          'Carcinome épidermoïde du larynx Tis N0 : radiothérapie exclusive hypofractionnée (60.75 Gy à 2.25 Gy/fraction).'
        );
      case '1':
        return decide(
          'Radiothérapie 63Gy (2.25Gy/fx)',
          'Carcinome épidermoïde du larynx T1 N0 : radiothérapie exclusive hypofractionnée (63 Gy à 2.25 Gy/fraction).'
        );
      case '2':
        return decide(
          'Radiothérapie 64.8Gy (2.4Gy/fx)',
          'Carcinome épidermoïde du larynx T2 N0 : radiothérapie exclusive hypofractionnée (64.8 Gy à 2.4 Gy/fraction).'
        );
    }
  }

  // Inéligible au cisplatine, N+ et HPV-
  if (!cisplatineEligible && !isN0 && !statutHPV) {
    return chimiotherapieInduction
      ? decide(
          'Radiothérapie 70Gy',
          'Inéligibilité au cisplatine, atteinte ganglionnaire (N > 0), statut HPV négatif avec chimiothérapie d’induction préalable.'
        )
      : decide(
          'Radiothérapie 70Gy potentialisée par du cetuximab',
          'Inéligibilité au cisplatine, atteinte ganglionnaire (N > 0), statut HPV négatif et absence de chimiothérapie d’induction.'
        );
  }

  if (localisation === 'Nasopharynx') {
    return (isTGreaterThan2 || isNGreaterThan1) && cisplatineEligible
      ? decide(
          'Radiothérapie 70Gy potentialisée par du cisplatine 40mg/m2',
          'Carcinome du nasopharynx localement avancé (T > 2 ou N > 1) chez un patient éligible au cisplatine.'
        )
      : decide(
          'Radiothérapie 70Gy',
          'Carcinome du nasopharynx de stade limité (T ≤ 2 et N ≤ 1) ou patient inéligible au cisplatine.'
        );
  }

  if (statutHPV) {
    if (!cisplatineEligible) {
      return decide('Radiothérapie 70Gy', 'Tumeur HPV positive chez un patient non éligible au cisplatine.');
    }
    const isHighRiskHpv = isTGreaterThan2 || isNGreaterThan1 || nbGanglions === '2 et plus';
    return isHighRiskHpv
      ? decide(
          'Radiothérapie 70Gy potentialisée par du cisplatine 40mg/m2',
          'Tumeur HPV positive localement avancée (T > 2, N > 1 ou ≥ 2 ganglions) chez un patient éligible au cisplatine.'
        )
      : decide(
          'Radiothérapie 70Gy',
          'Tumeur HPV positive de bon pronostic (T ≤ 2, N ≤ 1 et 1 seul ganglion envahi).'
        );
  }

  // HPV négatif
  if ((isTGreaterThan2 || !isN0) && cisplatineEligible) {
    return chimiotherapieInduction
      ? decide(
          'Radiothérapie 70Gy potentialisée par du cisplatine 40mg/m2 ou Radiothérapie 70Gy si réponse > 80%',
          'Tumeur HPV négative localement avancée (T > 2 ou N > 0), patient éligible au cisplatine, après chimiothérapie d’induction.'
        )
      : decide(
          'Radiothérapie 70Gy potentialisée par du cisplatine 100mg/m2',
          'Tumeur HPV négative localement avancée (T > 2 ou N > 0), patient éligible au cisplatine, sans chimiothérapie d’induction.'
        );
  }

  if ((isTGreaterThan2 || isNGreaterThan1) && !cisplatineEligible && !chimiotherapieInduction) {
    return decide(
      'Radiothérapie 70Gy potentialisée par du cetuximab',
      'Tumeur HPV négative (T > 2 ou N > 1), patient non éligible au cisplatine, sans chimiothérapie d’induction.'
    );
  }

  if (isTLessOrEqual2 && isN0) {
    return decide('Radiothérapie 70Gy', 'Tumeur HPV négative de stade précoce (T ≤ 2 et N = 0).');
  }

  return decide('Radiothérapie 70Gy', 'Traitement standard de première intention pour tumeur en place.');
}

// --- TRAITEMENT ADJUVANT ---

function evaluateAdjuvant(data: RcpFormAdjuvant): Decision {
  const {
    localisation,
    stadePT,
    tailleTumeur,
    stadePN,
    histologie,
    cisplatineEligible,
    embolesVasculaires,
    engainementPerineuronal,
    WPI,
    marges,
    effractionExtraCapsulaire,
  } = data;

  const isPN0 = stadePN === '0';
  const isEpidermoide = histologie === 'Carcinome épidermoïde';
  const isR1orR2 = marges === 'Envahies';
  const isRCMajeure = effractionExtraCapsulaire === 'Majeure';
  const isPT1orPT2Under3cm =
    stadePT === 'Tis' || stadePT === '1' || (stadePT === '2' && tailleTumeur !== '≥ 3cm');

  // 1. Stéréotaxie post-opératoire 36 Gy : cavité buccale ou oropharynx STRICTEMENT,
  // obligatoirement pN0 et sans embols vasculaires.
  const isStereoCandidate =
    (localisation === 'Cavité buccale' || localisation === 'Oropharynx') &&
    isPN0 &&
    !embolesVasculaires &&
    !isRCMajeure;

  if (isStereoCandidate) {
    const stereoCase =
      isPT1orPT2Under3cm && isR1orR2
        ? 'pT1 ou pT2 < 3 cm avec marges R1/R2 (envahies)'
        : stadePT === '2' && tailleTumeur === '≥ 3cm' && marges === '> 5mm'
          ? 'pT2 ≥ 3 cm avec marges > 5 mm'
          : isPT1orPT2Under3cm && (marges === '< 5mm' || marges === 'Envahies mais recoupe négative')
            ? 'pT1 ou pT2 < 3 cm avec marges suboptimales (< 5 mm ou recoupe négative)'
            : null;

    if (stereoCase) {
      return decide(
        'Radiothérapie STEREO POST OP 36Gy',
        `Indication de Radiothérapie Stéréotaxique Post-Opératoire (36Gy) : Cavité buccale ou Oropharynx STRICTEMENT, ${stereoCase}, chez un patient pN0 et sans embols vasculaires.`
      );
    }
  }

  // 2. Haut risque : R1/R2 ou rupture capsulaire majeure → 66 Gy + cisplatine, sinon 63.6 Gy.
  // Le cisplatine de potentialisation en adjuvant est réservé aux carcinomes épidermoïdes.
  if (isR1orR2 || isRCMajeure) {
    const riskDetails = [
      isR1orR2 && 'résection R1/R2 (marges envahies)',
      isRCMajeure && 'rupture capsulaire ganglionnaire majeure (RC majeure / ECE)',
    ]
      .filter(Boolean)
      .join(' et ');

    if (cisplatineEligible && isEpidermoide) {
      return decide(
        'Radiothérapie 66Gy potentialisée par du cisplatine 40mg/m2',
        `Critère(s) de haut risque post-opératoire (${riskDetails}) pour un carcinome épidermoïde chez un patient éligible au cisplatine : indication de Radiothérapie 66Gy potentialisée par du cisplatine 40mg/m2.`
      );
    }
    const reasonNoCisplatine = isEpidermoide
      ? 'patient non éligible au cisplatine'
      : `histologie non épidermoïde (${histologie || 'non précisée'}) : le cisplatine de potentialisation en adjuvant est strictement réservé aux carcinomes épidermoïdes`;
    return decide(
      'Radiothérapie 63.6Gy',
      `Critère(s) de haut risque post-opératoire (${riskDetails}), sans cisplatine (${reasonNoCisplatine}) : indication de Radiothérapie 63.6Gy.`
    );
  }

  // 3. Surveillance
  const isPT1orPT2 = stadePT === 'Tis' || stadePT === '1' || stadePT === '2';
  const isSizeLessThan3 = stadePT === 'Tis' || stadePT === '1' || tailleTumeur === '< 3cm';
  if (isPT1orPT2 && isPN0 && marges === '> 5mm' && isSizeLessThan3) {
    return decide(
      'Surveillance',
      'Faible risque de récidive (pT1/pT2 N0, marges de résection saines > 5 mm et taille < 3 cm).'
    );
  }

  // 4. Risque intermédiaire : au moins 2 critères parmi 6
  const criteriaCount = [
    stadePT === '4',
    embolesVasculaires,
    WPI,
    engainementPerineuronal,
    N_GREATER_THAN_1.includes(stadePN),
    effractionExtraCapsulaire === 'Mineure',
  ].filter(Boolean).length;

  if (cisplatineEligible && isEpidermoide && criteriaCount >= 2) {
    return decide(
      'Radiothérapie 60Gy potentialisée par du cisplatine 40mg/m2',
      `Présence de ${criteriaCount} facteurs de risque intermédiaire (pT4, emboles, WPI, engainement, pN > 1, RC/ECE mineure) pour un carcinome épidermoïde chez un patient éligible au cisplatine.`
    );
  }

  // 5. Histologie CAC ou « autre » (en l'absence de R1/R2 ou RC majeure)
  if (histologie === 'CAC' || histologie === 'autre') {
    return decide(
      'Radiothérapie 60Gy',
      `Histologie particulière (${histologie}) en situation adjuvante standard (sans potentialisation par cisplatine).`
    );
  }

  // 6. Autre situation adjuvante standard
  if (criteriaCount >= 2) {
    const reasonNoCisplatine = isEpidermoide
      ? 'patient non éligible au cisplatine'
      : `histologie non épidermoïde (${histologie}) : le cisplatine de potentialisation en adjuvant est réservé aux carcinomes épidermoïdes`;
    return decide(
      'Radiothérapie 60Gy',
      `Présence de ${criteriaCount} facteurs de risque intermédiaire, sans cisplatine (${reasonNoCisplatine}) : indication de Radiothérapie 60Gy.`
    );
  }

  return decide(
    'Radiothérapie 60Gy',
    'Indication adjuvante standard en présence de facteurs de risque histologiques ou anatomiques.'
  );
}
