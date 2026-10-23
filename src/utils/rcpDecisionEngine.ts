import {
  RcpFormData,
  RcpResultOutput,
  DoseProposition,
  LocalisationENT,
  StadeT,
  StadeN,
  SituationType,
} from '../types';

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
    if (situation === 'tumeur_en_place') {
      return ['0', '1', '2', '3'];
    } else {
      return ['0', '1a', '1b', '2', '3'];
    }
  }
  return ['0', '1', '2a', '2b', '2c', '3a', '3b', 'X'];
}

export function evaluateRcpDecision(data: RcpFormData): RcpResultOutput {
  const noteEssai = 'Inclusion dans un essai clinique si disponible';
  const defaultLocalisation = data.localisation;

  if (data.situation === 'tumeur_en_place') {
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

    const isTGreaterThan2 = stadeT === '3' || stadeT === '4' || stadeT === 'X';
    const isNGreaterThan0 = stadeN !== '0';
    const isNGreaterThan1 = ['2', '2a', '2b', '2c', '3', '3a', '3b', 'X'].includes(stadeN);
    const isN0 = stadeN === '0';
    const isTLessOrEqual2 = stadeT === 'Tis' || stadeT === '1' || stadeT === '2';

    const justifications: string[] = [];

    // Carcinome épidermoïde du larynx Tis / T1 / T2 N0 (Schémas hypofractionnés)
    if (localisation === 'Larynx' && histologie === 'Carcinome épidermoïde' && isN0) {
      if (stadeT === 'Tis') {
        justifications.push(
          'Carcinome épidermoïde du larynx Tis N0 : radiothérapie exclusive hypofractionnée (60.75 Gy à 2.25 Gy/fraction).'
        );
        return {
          proposition: 'Radiothérapie 60.75Gy (2.25Gy/fx)',
          justification: justifications,
          inclusionEssaiNote: noteEssai,
          recommendedLocalisation: localisation,
        };
      }
      if (stadeT === '1') {
        justifications.push(
          'Carcinome épidermoïde du larynx T1 N0 : radiothérapie exclusive hypofractionnée (63 Gy à 2.25 Gy/fraction).'
        );
        return {
          proposition: 'Radiothérapie 63Gy (2.25Gy/fx)',
          justification: justifications,
          inclusionEssaiNote: noteEssai,
          recommendedLocalisation: localisation,
        };
      }
      if (stadeT === '2') {
        justifications.push(
          'Carcinome épidermoïde du larynx T2 N0 : radiothérapie exclusive hypofractionnée (64.8 Gy à 2.4 Gy/fraction).'
        );
        return {
          proposition: 'Radiothérapie 64.8Gy (2.4Gy/fx)',
          justification: justifications,
          inclusionEssaiNote: noteEssai,
          recommendedLocalisation: localisation,
        };
      }
    }

    // Rule 1 & 2: Cisplatine non éligible, N != 0, HPV-
    if (!cisplatineEligible && isNGreaterThan0 && !statutHPV) {
      if (!chimiotherapieInduction) {
        justifications.push(
          'Inéligibilité au cisplatine, atteinte ganglionnaire (N > 0), statut HPV négatif et absence de chimiothérapie d’induction.'
        );
        return {
          proposition: 'Radiothérapie 70Gy potentialisée par du cetuximab',
          justification: justifications,
          inclusionEssaiNote: noteEssai,
          recommendedLocalisation: localisation,
        };
      } else {
        justifications.push(
          'Inéligibilité au cisplatine, atteinte ganglionnaire (N > 0), statut HPV négatif avec chimiothérapie d’induction préalable.'
        );
        return {
          proposition: 'Radiothérapie 70Gy',
          justification: justifications,
          inclusionEssaiNote: noteEssai,
          recommendedLocalisation: localisation,
        };
      }
    }

    // Nasopharynx
    if (localisation === 'Nasopharynx') {
      if ((isTGreaterThan2 || isNGreaterThan1) && cisplatineEligible) {
        justifications.push(
          'Carcinome du nasopharynx localement avancé (T > 2 ou N > 1) chez un patient éligible au cisplatine.'
        );
        return {
          proposition:
            'Radiothérapie 70Gy potentialisée par du cisplatine 40mg/m2',
          justification: justifications,
          inclusionEssaiNote: noteEssai,
          recommendedLocalisation: localisation,
        };
      } else {
        justifications.push(
          'Carcinome du nasopharynx de stade limité (T ≤ 2 et N ≤ 1) ou patient inéligible au cisplatine.'
        );
        return {
          proposition: 'Radiothérapie 70Gy',
          justification: justifications,
          inclusionEssaiNote: noteEssai,
          recommendedLocalisation: localisation,
        };
      }
    }

    // HPV Positif
    if (statutHPV) {
      const highRiskHpv =
        isTGreaterThan2 || isNGreaterThan1 || nbGanglions === '2 et plus';
      if (highRiskHpv && cisplatineEligible) {
        justifications.push(
          'Tumeur HPV positive localement avancée (T > 2, N > 1 ou ≥ 2 ganglions) chez un patient éligible au cisplatine.'
        );
        return {
          proposition:
            'Radiothérapie 70Gy potentialisée par du cisplatine 40mg/m2',
          justification: justifications,
          inclusionEssaiNote: noteEssai,
          recommendedLocalisation: localisation,
        };
      } else if (!cisplatineEligible) {
        justifications.push(
          'Tumeur HPV positive chez un patient non éligible au cisplatine.'
        );
        return {
          proposition: 'Radiothérapie 70Gy',
          justification: justifications,
          inclusionEssaiNote: noteEssai,
          recommendedLocalisation: localisation,
        };
      } else {
        justifications.push(
          'Tumeur HPV positive de bon pronostic (T ≤ 2, N ≤ 1 et 1 seul ganglion envahi).'
        );
        return {
          proposition: 'Radiothérapie 70Gy',
          justification: justifications,
          inclusionEssaiNote: noteEssai,
          recommendedLocalisation: localisation,
        };
      }
    }

    // HPV Négatif
    if (!statutHPV) {
      if ((isTGreaterThan2 || isNGreaterThan0) && cisplatineEligible) {
        if (!chimiotherapieInduction) {
          justifications.push(
            'Tumeur HPV négative localement avancée (T > 2 ou N > 0), patient éligible au cisplatine, sans chimiothérapie d’induction.'
          );
          return {
            proposition:
              'Radiothérapie 70Gy potentialisée par du cisplatine 100mg/m2',
            justification: justifications,
            inclusionEssaiNote: noteEssai,
            recommendedLocalisation: localisation,
          };
        } else {
          justifications.push(
            'Tumeur HPV négative localement avancée (T > 2 ou N > 0), patient éligible au cisplatine, après chimiothérapie d’induction.'
          );
          return {
            proposition:
              'Radiothérapie 70Gy potentialisée par du cisplatine 40mg/m2 ou Radiothérapie 70Gy si réponse > 80%',
            justification: justifications,
            inclusionEssaiNote: noteEssai,
            recommendedLocalisation: localisation,
          };
        }
      }

      if ((isTGreaterThan2 || isNGreaterThan1) && !cisplatineEligible && !chimiotherapieInduction) {
        justifications.push(
          'Tumeur HPV négative (T > 2 ou N > 1), patient non éligible au cisplatine, sans chimiothérapie d’induction.'
        );
        return {
          proposition: 'Radiothérapie 70Gy potentialisée par du cetuximab',
          justification: justifications,
          inclusionEssaiNote: noteEssai,
          recommendedLocalisation: localisation,
        };
      }

      if (isTLessOrEqual2 && isN0) {
        justifications.push('Tumeur HPV négative de stade précoce (T ≤ 2 et N = 0).');
        return {
          proposition: 'Radiothérapie 70Gy',
          justification: justifications,
          inclusionEssaiNote: noteEssai,
          recommendedLocalisation: localisation,
        };
      }
    }

    // Default fallback pour Tumeur en place
    justifications.push('Traitement standard de première intention pour tumeur en place.');
    return {
      proposition: 'Radiothérapie 70Gy',
      justification: justifications,
      inclusionEssaiNote: noteEssai,
      recommendedLocalisation: localisation,
    };
  }

  // --- TRAITEMENT ADJUVANT ---
  if (data.situation === 'adjuvant') {
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
    const isSansEmbols = !embolesVasculaires;
    const isCaviteBuccaleOrOropharynx =
      localisation === 'Cavité buccale' || localisation === 'Oropharynx';
    const isPNGreaterThan1 = ['2', '2a', '2b', '2c', '3', '3a', '3b', 'X'].includes(stadePN);
    const isHistologieEpidermoide = histologie === 'Carcinome épidermoïde';

    const justifications: string[] = [];

    // 1. STEREO POST-OP 36Gy
    // Indications pour Cavité buccale et Oropharynx STRICTEMENT (obligatoirement pN0 et sans embols vasculaires) :
    // - Cas 1 : pT2 ≥ 3 cm avec marges saines (> 5 mm)
    // - Cas 2 : pT1 ou pT2 < 3 cm avec marges suboptimales (< 5 mm ou envahies mais recoupe négative)
    // - Cas 3 : Cavité buccale ou Oropharynx STRICTEMENT, avec pN0 ET sans embols vasculaires pT1 ou pT2 < 3 cm avec marges R1/R2
    const isPT1orPT2Under3cm =
      stadePT === 'Tis' ||
      stadePT === '1' ||
      (stadePT === '2' && (tailleTumeur === '< 3cm' || !tailleTumeur));

    if (
      isCaviteBuccaleOrOropharynx &&
      isPN0 &&
      isSansEmbols &&
      effractionExtraCapsulaire !== 'Majeure'
    ) {
      const isIndicationStereo1 =
        stadePT === '2' && tailleTumeur === '≥ 3cm' && marges === '> 5mm';

      const isMargeSuboptimale =
        marges === '< 5mm' ||
        marges === 'Envahies mais recoupe négative';

      const isIndicationStereo2 =
        isPT1orPT2Under3cm && isMargeSuboptimale;

      const isIndicationStereo3 =
        isPT1orPT2Under3cm && marges === 'Envahies';

      if (isIndicationStereo1 || isIndicationStereo2 || isIndicationStereo3) {
        if (isIndicationStereo3) {
          justifications.push(
            'Indication de Radiothérapie Stéréotaxique Post-Opératoire (36Gy) : Cavité buccale ou Oropharynx STRICTEMENT, pT1 ou pT2 < 3 cm avec marges R1/R2 (envahies), chez un patient pN0 et sans embols vasculaires.'
          );
        } else if (isIndicationStereo1) {
          justifications.push(
            'Indication de Radiothérapie Stéréotaxique Post-Opératoire (36Gy) : Cavité buccale ou Oropharynx STRICTEMENT, pT2 ≥ 3 cm avec marges > 5 mm, chez un patient pN0 et sans embols vasculaires.'
          );
        } else {
          justifications.push(
            'Indication de Radiothérapie Stéréotaxique Post-Opératoire (36Gy) : Cavité buccale ou Oropharynx STRICTEMENT, pT1 ou pT2 < 3 cm avec marges suboptimales (< 5 mm ou recoupe négative), chez un patient pN0 et sans embols vasculaires.'
          );
        }
        return {
          proposition: 'Radiothérapie STEREO POST OP 36Gy',
          justification: justifications,
          inclusionEssaiNote: noteEssai,
          recommendedLocalisation: localisation,
        };
      }
    }

    // 2. RÈGLE HAUT RISQUE : Toute tumeur R1/R2 (hors critères stéréotaxie post-op) ou si RC majeure
    // Dose requise : soit 66Gy s'il y a du cisplatine, soit 63,6Gy
    // Le cisplatine de potentialisation en adjuvant ne doit s'appliquer qu'aux carcinomes épidermoïdes
    const isR1orR2 = marges === 'Envahies';
    const isRCMajeure = effractionExtraCapsulaire === 'Majeure';
    const isHighRiskR1R2OrRCMajeure = isR1orR2 || isRCMajeure;

    if (isHighRiskR1R2OrRCMajeure) {
      const riskDetails: string[] = [];
      if (isR1orR2) riskDetails.push('résection R1/R2 (marges envahies)');
      if (isRCMajeure) riskDetails.push('rupture capsulaire ganglionnaire majeure (RC majeure / ECE)');

      const canReceiveAdjuvantCisplatine =
        cisplatineEligible && isHistologieEpidermoide;

      if (canReceiveAdjuvantCisplatine) {
        justifications.push(
          `Critère(s) de haut risque post-opératoire (${riskDetails.join(' et ')}) pour un carcinome épidermoïde chez un patient éligible au cisplatine : indication de Radiothérapie 66Gy potentialisée par du cisplatine 40mg/m2.`
        );
        return {
          proposition:
            'Radiothérapie 66Gy potentialisée par du cisplatine 40mg/m2',
          justification: justifications,
          inclusionEssaiNote: noteEssai,
          recommendedLocalisation: localisation,
        };
      } else {
        const reasonNoCisplatine = !isHistologieEpidermoide
          ? `histologie non épidermoïde (${histologie || 'non précisée'}) : le cisplatine de potentialisation en adjuvant est strictement réservé aux carcinomes épidermoïdes`
          : 'patient non éligible au cisplatine';
        justifications.push(
          `Critère(s) de haut risque post-opératoire (${riskDetails.join(' et ')}), sans cisplatine (${reasonNoCisplatine}) : indication de Radiothérapie 63.6Gy.`
        );
        return {
          proposition: 'Radiothérapie 63.6Gy',
          justification: justifications,
          inclusionEssaiNote: noteEssai,
          recommendedLocalisation: localisation,
        };
      }
    }

    // 3. Surveillance
    const isPT1orPT2 = stadePT === 'Tis' || stadePT === '1' || stadePT === '2';
    const isSizeLessThan3 = stadePT === 'Tis' || stadePT === '1' || tailleTumeur === '< 3cm';
    if (isPT1orPT2 && isPN0 && marges === '> 5mm' && isSizeLessThan3) {
      justifications.push(
        'Faible risque de récidive (pT1/pT2 N0, marges de résection saines > 5 mm et taille < 3 cm).'
      );
      return {
        proposition: 'Surveillance',
        justification: justifications,
        inclusionEssaiNote: noteEssai,
        recommendedLocalisation: localisation,
      };
    }

    // 4. Risque intermédiaire : 60Gy + Cisplatine 40mg/m2 (2 critères parmi 6)
    // S'applique strictement aux carcinomes épidermoïdes
    const criteria = [
      stadePT === '4',
      embolesVasculaires === true,
      WPI === true,
      engainementPerineuronal === true,
      isPNGreaterThan1,
      effractionExtraCapsulaire === 'Mineure',
    ];
    const criteriaCount = criteria.filter(Boolean).length;

    if (
      cisplatineEligible &&
      isHistologieEpidermoide &&
      criteriaCount >= 2
    ) {
      justifications.push(
        `Présence de ${criteriaCount} facteurs de risque intermédiaire (pT4, emboles, WPI, engainement, pN > 1, RC/ECE mineure) pour un carcinome épidermoïde chez un patient éligible au cisplatine.`
      );
      return {
        proposition:
          'Radiothérapie 60Gy potentialisée par du cisplatine 40mg/m2',
        justification: justifications,
        inclusionEssaiNote: noteEssai,
        recommendedLocalisation: localisation,
      };
    }

    // 5. Histologie = CAC ou "autre" (en l'absence de R1/R2 ou RC majeure)
    if (histologie === 'CAC' || histologie === 'autre') {
      justifications.push(
        `Histologie particulière (${histologie}) en situation adjuvante standard (sans potentialisation par cisplatine).`
      );
      return {
        proposition: 'Radiothérapie 60Gy',
        justification: justifications,
        inclusionEssaiNote: noteEssai,
        recommendedLocalisation: localisation,
      };
    }

    // 6. Autre situation adjuvante standard
    if (criteriaCount >= 2 && (!cisplatineEligible || !isHistologieEpidermoide)) {
      const reasonNoCisplatine = !isHistologieEpidermoide
        ? `histologie non épidermoïde (${histologie}) : le cisplatine de potentialisation en adjuvant est réservé aux carcinomes épidermoïdes`
        : 'patient non éligible au cisplatine';
      justifications.push(
        `Présence de ${criteriaCount} facteurs de risque intermédiaire, sans cisplatine (${reasonNoCisplatine}) : indication de Radiothérapie 60Gy.`
      );
    } else {
      justifications.push(
        'Indication adjuvante standard en présence de facteurs de risque histologiques ou anatomiques.'
      );
    }
    return {
      proposition: 'Radiothérapie 60Gy',
      justification: justifications,
      inclusionEssaiNote: noteEssai,
      recommendedLocalisation: localisation,
    };
  }

  return {
    proposition: 'Radiothérapie 70Gy',
    justification: ['Décision par défaut.'],
    inclusionEssaiNote: noteEssai,
    recommendedLocalisation: defaultLocalisation,
  };
}
