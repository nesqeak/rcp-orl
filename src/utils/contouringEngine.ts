import { RcpFormData, LocalisationENT } from '../types';
import { SUBSTRUCTURES_MAP, SubstructureOption } from '../data/substructures';

export interface ContouringEvaluationResult {
  isStereoPostOp: boolean;
  isLarynxEarlyStageSingleDose?: boolean;
  larynxSingleDoseLabel?: string;
  ctvTHighRisk: string;
  ctvTInterRisk: string | null;
  ctvTLowRisk: string | null;
  ctvNHighRisk: string;
  ctvNInterRisk: string | null;
  ctvNLowRisk: string;
  isUnilateralIndication?: boolean;
  unilateralReason?: string;
  recoradInclusions: string[];
  salivaryGreenJournalNote?: string;
  articlesToDisplay: ArticleReference[];
}

export interface ArticleReference {
  id: string;
  title: string;
  authorsOrJournal: string;
  url: string;
  badge: string;
  summaryText: string;
}

export function computeContouringRecommendations(
  formData: RcpFormData,
  selectedSubstructureIds: string[],
  isStereoPostOpForced: boolean = false
): ContouringEvaluationResult {
  const loc = formData.localisation;
  const isAdjuvant = formData.situation === 'adjuvant';
  const hasFlap = isAdjuvant ? formData.lambeau : false;
  const hasPositiveMargins = isAdjuvant ? formData.marges === 'Envahies' : false;
  const ece = isAdjuvant ? formData.effractionExtraCapsulaire : 'Non';
  const hasECE = ece === 'Mineure' || ece === 'Majeure';
  const isNasopharynx = loc === 'Nasopharynx';
  const isSalivary = loc === 'Glande salivaire';

  // Check if Stereo Post-Op is indicated (either explicitly passed or via marges/indication)
  const isStereoPostOp = isStereoPostOpForced;

  // Larynx Tis / T1 / T2 N0 en place : niveau de dose unique et CTV T unique (pas de CTV N)
  const isLarynxEarlyStageSingleDose =
    !isAdjuvant &&
    loc === 'Larynx' &&
    (formData.stadeT === 'Tis' || formData.stadeT === '1' || formData.stadeT === '2') &&
    formData.stadeN === '0';

  let larynxSingleDoseLabel = '';
  if (isLarynxEarlyStageSingleDose) {
    if (formData.stadeT === 'Tis') {
      larynxSingleDoseLabel = '60.75 Gy (2.25 Gy/fx)';
    } else if (formData.stadeT === '1') {
      larynxSingleDoseLabel = '63 Gy (2.25 Gy/fx)';
    } else if (formData.stadeT === '2') {
      larynxSingleDoseLabel = '64.8 Gy (2.4 Gy/fx)';
    }
  }

  // ----------------------------------------------------
  // 1. CTV T HIGH RISK (HR) / NIVEAU UNIQUE
  // ----------------------------------------------------
  let ctvTHighRisk = '';

  if (isLarynxEarlyStageSingleDose) {
    ctvTHighRisk = 'GTV T + 5 mm, étendu à l’ensemble du larynx.';
  } else if (isStereoPostOp) {
    if (!hasFlap) {
      ctvTHighRisk =
        'Stéréo Post-Op (Sans Lambeau) : Zone de résection (zone R1 si marges positives, zone de résection simple sinon) + 5 mm.';
    } else {
      ctvTHighRisk =
        'Stéréo Post-Op (Avec Lambeau) : Suture du lambeau (en zone R1 si marge positive, suture totale sinon) + 5 mm.';
    }
  } else if (!isAdjuvant) {
    // Tumeur en place
    const hasInduction = formData.chimiotherapieInduction;
    if (!isNasopharynx) {
      if (!hasInduction) {
        ctvTHighRisk = 'GTV + 5 mm (extension anatomique ajustée aux barrières osseuses/fasciales).';
      } else {
        ctvTHighRisk =
          'GTV + 5 mm étendu au GTV initial (pré-chimiothérapie d’induction).';
      }
    } else {
      // Nasopharynx
      if (!hasInduction) {
        ctvTHighRisk = 'GTV + 0 mm (GTVnx pur selon recommandations internationales 2024).';
      } else {
        ctvTHighRisk =
          'GTV résiduel + 0 mm étendu au GTV initial au niveau osseux et de la base du crâne.';
      }
    }
  } else {
    // Post-opératoire (Adjuvant)
    if (hasPositiveMargins) {
      if (!hasFlap) {
        ctvTHighRisk = 'Zone R1 + 5 mm (reliquat microscopique prouvé).';
      } else {
        ctvTHighRisk = 'Suture au niveau R1 + 5 mm.';
      }
    } else {
      ctvTHighRisk =
        'Non indiqué en routine pour marges saines R0 (le volume est couvert par le CTV IR / site opératoire).';
    }
  }

  // ----------------------------------------------------
  // 2. CTV T INTERMEDIATE RISK (IR)
  // ----------------------------------------------------
  let ctvTInterRisk: string | null = null;

  if (isLarynxEarlyStageSingleDose) {
    ctvTInterRisk = null; // Uniquement un niveau de dose unique pour Larynx Tis/T1/T2 N0
  } else if (isStereoPostOp) {
    ctvTInterRisk = null; // Uniquement CTV HR en Stéréo Post-Op
  } else if (isNasopharynx) {
    const hasInduction = !isAdjuvant && formData.chimiotherapieInduction;
    if (hasInduction) {
      ctvTInterRisk =
        'Nasopharynx (Consensus 2024) : CTV T IR = CTV T HR + 5 mm étendu au GTV pré-chimiothérapie d’induction.';
    } else {
      ctvTInterRisk =
        'Nasopharynx (Consensus 2024) : CTV T IR = CTV T HR + 5 mm.';
    }
  } else if (isAdjuvant) {
    if (!hasFlap) {
      ctvTInterRisk = 'Site opératoire (loge tumorale initiale d’exérèse).';
    } else {
      ctvTInterRisk = 'Suture du lambeau + 5 mm.';
    }
  } else {
    ctvTInterRisk = null; // Non individualisé pour autres tumeurs en place (intégré dans HR/BR)
  }

  // ----------------------------------------------------
  // 3. CTV T LOW RISK (BR / Prophylactique - RECORAD & Green Journal)
  // ----------------------------------------------------
  let ctvTLowRisk: string | null = '';
  const availableSubstructures = SUBSTRUCTURES_MAP[loc] || [];
  const selectedSubstructures = availableSubstructures.filter((s) =>
    selectedSubstructureIds.includes(s.id)
  );

  let recoradInclusions: string[] = [];
  selectedSubstructures.forEach((sub) => {
    recoradInclusions.push(...sub.recoradBrInclusions);
  });
  // Deduplicate
  recoradInclusions = Array.from(new Set(recoradInclusions));

  if (isLarynxEarlyStageSingleDose) {
    ctvTLowRisk = null; // Un seul CTV T étendu à l'ensemble du larynx
  } else if (isStereoPostOp) {
    ctvTLowRisk = 'Non requis en Stéréo Post-Opératoire (irradiation focalisée HR).';
  } else if (isNasopharynx) {
    ctvTLowRisk =
      'Consensus International Nasopharynx 2024 : Inclusion prophylactique du cavum total, du sinus sphénoïdal inférieur/médian, du clivus antérieur, des choanes et fosses nasales postérieures, et de l’espace parapharyngé supérieur.';
    if (recoradInclusions.length > 0) {
      ctvTLowRisk += ` (Inclusions sous-structures : ${recoradInclusions.join(', ')}).`;
    }
  } else if (isSalivary && isAdjuvant) {
    ctvTLowRisk =
      'Glande Salivaire (Green Journal 2025) : Loge glandulaire révoquée, canal excréteur (Sténon/Wharton), extension à la base du crâne le long des nerfs facial/V3 si engainement périneural.';
    if (hasFlap) {
      ctvTLowRisk += ' + Inclure obligatoirement l’ensemble du lambeau de reconstruction dans le CTV T BR.';
    }
  } else {
    if (recoradInclusions.length > 0) {
      ctvTLowRisk = `Basé sur RECORAD (${recoradInclusions.join(', ')}).`;
    } else {
      ctvTLowRisk =
        'Structures mucosales et musculaires adjacentes selon les recommandations RECORAD.';
    }

    if (isAdjuvant && hasFlap) {
      ctvTLowRisk +=
        ' IMPORTANT : En situation adjuvante avec lambeau, inclure toujours le lambeau dans le CTV T BR.';
    }
  }

  // ----------------------------------------------------
  // 4. CTV N (VOLUMES GANGLIONNAIRES : HR, IR, BR)
  // ----------------------------------------------------
  let ctvNHighRisk = '';
  let ctvNInterRisk: string | null = null;
  let ctvNLowRisk = '';

  const stadeN = !isAdjuvant ? formData.stadeN : formData.stadePN;
  const stadeT = !isAdjuvant ? formData.stadeT : formData.stadePT;
  const isN0 = stadeN === '0';
  const isN1orN2a = stadeN === '1' || stadeN === '2a';
  const medianLineReached = formData.atteinteLigneMediane ?? false;

  const selectedNodalAreas = formData.nodalAreas || [];
  const selectedNodalLabels =
    selectedNodalAreas.length > 0
      ? selectedNodalAreas.join(', ')
      : null;

  // Rule: Unilateral cervical irradiation condition
  // Cavité buccale OR Amygdale without median line involvement and N1 or N2a (or pN1 pN2a)
  const isTonsilSubstructure =
    selectedSubstructureIds.includes('amygdale') ||
    selectedSubstructureIds.includes('pilier_anterieur') ||
    selectedSubstructureIds.includes('pilier_posterieure') ||
    selectedSubstructureIds.includes('sillon_amygdaloglosse');

  const isCaviteBuccaleOrAmygdale =
    loc === 'Cavité buccale' ||
    (loc === 'Oropharynx' && (selectedSubstructureIds.length === 0 || isTonsilSubstructure));

  const isSinusFaceOuEthmoide =
    loc === 'Sinus de la face (hors ethmoïde)' || loc === 'Sinus ethmoïde';

  const hasDroitNodes = selectedNodalAreas.some((area) => area.includes('Droit'));
  const hasGaucheNodes = selectedNodalAreas.some((area) => area.includes('Gauche'));
  const hasBilateralNodes = (hasDroitNodes && hasGaucheNodes) || stadeN === '2c';

  // For Sinus (maxillaire et ethmoïde): if median line is not invaded, and nodes are on the tumor side only (or N0/pN0)
  const isSinusUnilateral =
    isSinusFaceOuEthmoide && !medianLineReached && (isN0 || !hasBilateralNodes);

  const isUnilateralIndication =
    (isCaviteBuccaleOrAmygdale && !medianLineReached && isN1orN2a) ||
    isSinusUnilateral;

  let unilateralReason: string | undefined = undefined;
  if (isUnilateralIndication) {
    if (isSinusFaceOuEthmoide) {
      unilateralReason = `${loc} sans atteinte de la ligne médiane et ${
        isN0
          ? `stade ${isAdjuvant ? 'pN0' : 'N0'}`
          : `ganglions atteints uniquement du côté de la tumeur (stade ${isAdjuvant ? 'pN' : 'N'}${stadeN})`
      } : indication d’IRRADIATION CERVICALE UNILATÉRALE (du côté de la tumeur uniquement).`;
    } else {
      unilateralReason = `${loc} sans atteinte de la ligne médiane et stade ${
        isAdjuvant ? 'pN' : 'N'
      }${stadeN} : indication d’IRRADIATION CERVICALE UNILATÉRALE (ipsilatérale uniquement).`;
    }
  }

  if (isStereoPostOp) {
    ctvNHighRisk = 'Non inclus en Stéréo Post-Op (sauf adénopathie R1 ciblée en CTV HR).';
    ctvNInterRisk = null;
    ctvNLowRisk = 'Irradiation ganglionnaire prophylactique non indiquée en Stéréo Post-Op.';
  } else if (isNasopharynx) {
    // Recommandations Nasopharynx (Consensus 2024 + Règles spécifiques Cavum)
    ctvNHighRisk = isN0
      ? 'Pas de GTVn / CTVn HR ganglionnaire (N0).'
      : 'CTV N HR = GTV N';

    if (isN0) {
      ctvNInterRisk = null;
    } else {
      const nodalInfo = selectedNodalLabels ? ` [Aires envahies : ${selectedNodalLabels}]` : '';
      ctvNInterRisk = hasECE
        ? `CTV N IR = CTV N HR + 5 mm (présence d’ENE / effraction extra-capsulaire).${nodalInfo}`
        : `CTV N IR = CTV N HR + 5 mm si ENE uniquement.${nodalInfo}`;
    }

    ctvNLowRisk = isN0
      ? 'Consensus International Nasopharynx 2024 (N0) : Niveaux IIa, IIb, III, Va, Vb bilatéraux + Ganglions Rétropharyngés (RP). (Pas de niveau IV ni de niveau Vc dans les volumes prophylactiques en N0. Niveau Ib seulement si extension aux fosses nasales antérieures ou à la cavité buccale).'
      : `Consensus International Nasopharynx 2024 (N+) : Niveaux IIa, IIb, III, IV, V, VI bilatéraux + Ganglions Rétropharyngés (RP) ${selectedNodalLabels ? `(Aires envahies ciblées : ${selectedNodalLabels})` : ''} selon l’extension sous-claviculaire ou ganglionnaire massive.`;
  } else if (isSalivary && isAdjuvant) {
    // Green Journal 2025 Glandes Salivaires
    ctvNHighRisk = hasPositiveMargins
      ? 'Région ganglionnaire avec marges R1 ou effraction capsulaire majeure + 5 mm.'
      : 'Non indiqué si R0 ganglionnaire.';
    ctvNInterRisk = 'Loge opératoire ganglionnaire rétropharyngée/parotidienne.';
    ctvNLowRisk = isN0
      ? 'Irradiation prophylactique ciblée des niveaux Ib, II et III ipsilatéraux (si haut grade T3-T4, engainement périneural ou histologie agressive).'
      : 'Irradiation des niveaux Ia, Ib, II, III, IV, Va, Vb ipsilatéraux (et RP/parotidien si atteinte parotidienne).';
  } else {
    // Hors Nasopharynx / Hors Salivaire - Biau et al. 2019 DAHANCA / EORTC / GORTEC

    // 1. CTV N HIGH RISK (HR)
    if (!isAdjuvant) {
      ctvNHighRisk = isN0
        ? 'Aucun volume HR ganglionnaire en N0.'
        : 'CTV N HR = GTV N + 5 mm (adénopathies macroradiologiques envahies).';
    } else {
      // Situation adjuvante
      if (hasECE) {
        ctvNHighRisk =
          'CTV N HR = GTV N préopératoire + 5 mm (en raison de la rupture capsulaire / effraction extra-capsulaire).';
      } else if (hasPositiveMargins) {
        ctvNHighRisk =
          'CTV N HR = Loge ganglionnaire R1 + 5 mm (reliquat microscopique).';
      } else {
        ctvNHighRisk =
          'Non requis en adjuvant pour curage R0 sans rupture capsulaire.';
      }
    }

    // 2. CTV N INTERMEDIATE RISK (IR)
    if (isN0) {
      ctvNInterRisk = null;
    } else {
      const nodalListText = selectedNodalLabels
        ? `[ ${selectedNodalLabels} ]`
        : '(Veuillez cocher les aires ganglionnaires envahies dans le menu N ci-dessus)';
      if (!isAdjuvant) {
        ctvNInterRisk = `CTV N IR = Aire(s) ganglionnaire(s) envahie(s) : ${nodalListText}`;
      } else {
        ctvNInterRisk = `CTV N IR = Loge(s) opératoire(s) des aire(s) envahie(s) : ${nodalListText}`;
      }
    }

    // 3. CTV N LOW RISK (BR / Prophylactique)
    if (isN0) {
      switch (loc) {
        case 'Cavité buccale':
          if (medianLineReached) {
            ctvNLowRisk =
              'Niveaux Ia, Ib, II, III BILATÉRAUX (en raison de l’atteinte de la ligne médiane).';
          } else {
            ctvNLowRisk =
              'IRRADIATION CERVICALE UNILATÉRALE : Niveaux Ia, Ib, II, III IPSILATÉRAUX (sans atteinte de la ligne médiane).';
          }
          break;

        case 'Oropharynx':
          if (
            medianLineReached ||
            selectedSubstructureIds.includes('base_de_langue') ||
            selectedSubstructureIds.includes('voile') ||
            selectedSubstructureIds.includes('paroi_pharyngee_posterieure_oro')
          ) {
            ctvNLowRisk =
              'Niveaux II, III, IV BILATÉRAUX' +
              (selectedSubstructureIds.includes('paroi_pharyngee_posterieure_oro') ||
              selectedSubstructureIds.includes('voile')
                ? ' + Ganglions Rétropharyngés (RP).'
                : '.');
          } else {
            ctvNLowRisk =
              'IRRADIATION CERVICALE UNILATÉRALE : Niveaux II, III, IV IPSILATÉRAUX (sans atteinte de la ligne médiane).';
          }
          break;

        case 'Hypopharynx':
          ctvNLowRisk =
            'Niveaux II, III, IV, Va, Vb BILATÉRAUX + Ganglions Rétropharyngés (RP).';
          break;

        case 'Larynx':
          if (!isAdjuvant && (stadeT === 'Tis' || stadeT === '1' || stadeT === '2')) {
            ctvNLowRisk =
              'Pas de CTV N dans cette situation (Larynx Tis/T1/T2 N0 : pas d’irradiation ganglionnaire requise).';
          } else if (
            selectedSubstructureIds.includes('glotte_pure') &&
            (stadeT === '1' || stadeT === '2')
          ) {
            ctvNLowRisk =
              'Pas d’irradiation ganglionnaire prophylactique (0 Gy) pour glotte T1-T2 N0.';
          } else {
            ctvNLowRisk =
              'Niveaux II, III, IV BILATÉRAUX' +
              (selectedSubstructureIds.includes('sous_glottique')
                ? ' + Niveaux VIa, VIb (Prétrachéal / Paratrachéal).'
                : '.');
          }
          break;

        case 'Sinus de la face (hors ethmoïde)':
        case 'Sinus ethmoïde':
        case 'Fosses nasales':
          ctvNLowRisk =
            'Pas d’irradiation prophylactique ganglionnaire systématique en N0 sauf T3-T4 (Niveaux Ib et II ipsilatéraux).';
          break;

        default:
          ctvNLowRisk = 'Niveaux II, III, IV IPSILATÉRAUX.';
      }
    } else {
      // Statut N+ (N1, N2a, N2b, N2c, N3a, N3b)
      if (isUnilateralIndication) {
        if (loc === 'Cavité buccale') {
          ctvNLowRisk =
            'IRRADIATION CERVICALE UNILATÉRALE : Niveaux Ia, Ib, II, III, IV, Va, Vb IPSILATÉRAUX (côté lésionnel uniquement).';
        } else {
          // Oropharynx / Amygdale
          ctvNLowRisk =
            'IRRADIATION CERVICALE UNILATÉRALE : Niveaux II, III, IV, Va, Vb IPSILATÉRAUX (côté lésionnel uniquement).';
        }
      } else {
        switch (loc) {
          case 'Cavité buccale':
            if (medianLineReached || stadeN === '2c' || stadeN === '3a' || stadeN === '3b') {
              ctvNLowRisk =
                'Niveaux Ia, Ib, II, III, IV, Va, Vb BILATÉRAUX (incluant le niveau Ib controlatéral).';
            } else {
              ctvNLowRisk =
                'Niveaux Ia, Ib, II, III, IV, Va, Vb IPSILATÉRAUX + Niveaux Ia, Ib, II, III controlatéraux.';
            }
            break;

          case 'Oropharynx':
            ctvNLowRisk =
              'Niveaux II, III, IV, Va, Vb BILATÉRAUX' +
              (selectedNodalAreas.includes('RP') ||
              selectedSubstructureIds.includes('paroi_pharyngee_posterieure_oro') ||
              stadeN === '3b'
                ? ' + Ganglions Rétropharyngés (RP).'
                : '.');
            break;

          case 'Hypopharynx':
            ctvNLowRisk =
              'Niveaux II, III, IV, Va, Vb, VIa, VIb BILATÉRAUX + Ganglions Rétropharyngés (RP).';
            break;

          case 'Larynx':
            ctvNLowRisk =
              'Niveaux II, III, IV, Va, Vb BILATÉRAUX' +
              (selectedSubstructureIds.includes('sous_glottique')
                ? ' + Niveaux VIa, VIb (Prétrachéal / Paratrachéal).'
                : '.');
            break;

          default:
            ctvNLowRisk = 'Niveaux Ia à Vb BILATÉRAUX selon l’extension N.';
        }
      }
    }
  }

  // ----------------------------------------------------
  // 5. ARTICLES & REFERENCES TO DISPLAY AT BOTTOM
  // ----------------------------------------------------
  const articlesToDisplay: ArticleReference[] = [];

  if (isStereoPostOp) {
    articlesToDisplay.push({
      id: 'jama_stereo_2024',
      title: 'Postoperative Stereotactic Body Radiotherapy for Head and Neck Cancer',
      authorsOrJournal: 'JAMA Network Open (2024)',
      url: 'https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2842891',
      badge: 'Recommandations Stéréo Post-Op',
      summaryText:
        'Définit les marges de délimitation CTV HR à 5mm autour de la suture du lambeau et de la zone de résection R1/R0 sans irradiation des aires ganglionnaires prophylactiques.',
    });
  }

  if (isSalivary && isAdjuvant) {
    articlesToDisplay.push({
      id: 'green_journal_salivary_2025',
      title: 'ESTRO ACROP / DAHANCA guidelines for postoperative radiotherapy of salivary gland cancers',
      authorsOrJournal: 'Radiotherapy and Oncology / Green Journal (2025)',
      url: 'https://www.thegreenjournal.com/article/S0167-8140(25)05321-6/fulltext',
      badge: 'Glandes Salivaires Post-Op 2025',
      summaryText:
        'Recommandations internationales pour le contourage du CTV T (loge, trajet des nerfs, lambeau) et du CTV N dans les tumeurs des glandes salivaires.',
    });
  }

  if (isNasopharynx) {
    articlesToDisplay.push({
      id: 'nasopharynx_ijrobp_2024',
      title: 'International Consensus Guidelines for Target Volume Definition in Nasopharyngeal Carcinoma',
      authorsOrJournal: 'IJROBP / ScienceDirect (2024/2025)',
      url: 'https://www.sciencedirect.com/science/article/pii/S0360301625004870#fig0002',
      badge: 'Nasopharynx Consensus 2024',
      summaryText:
        'Directives internationales 2024 pour le CTV-GTV0mm, l’extension anatomique osseuse aux trous de la base du crâne et les niveaux ganglionnaires rétropharyngés.',
    });
  } else {
    // Non nasopharynx -> Article Nodal Biau 2019
    articlesToDisplay.push({
      id: 'biau_nodal_2019',
      title: 'Selection and delineation of lymph node target volumes in head and neck cancer: DAHANCA, EORTC, GORTEC, HKNPCSG, NCIC CTG, RTOG consensus',
      authorsOrJournal: 'Biau et al. - Radiotherapy and Oncology (2019)',
      url: 'https://www.sciencedirect.com/science/article/pii/S0167814019300234?via%3Dihub',
      badge: 'Consensus Ganglionnaire Biau 2019',
      summaryText:
        'Atlas de référence pour la sélection et le contourage des niveaux ganglionnaires I à VI selon la localisation tumorale initiale et le statut N.',
    });
  }

  // RECORAD is applicable for all CTV T BR except Nasopharynx (which uses International Consensus 2024)
  if (!isNasopharynx) {
    articlesToDisplay.push({
      id: 'recorad_2025',
      title: 'Recommandations RECORAD pour la définition des volumes cibles microscopiques et prophylactiques en radiothérapie ORL',
      authorsOrJournal: 'Cancer / Radiothérapie - Société Française de Radiothérapie Oncologique (SFRO)',
      url: 'https://www.sciencedirect.com/journal/cancer-radiotherapie/vol/29/issue/7',
      badge: 'Consensus RECORAD',
      summaryText:
        'Guide anatomique pour l’inclusion des sous-structures adjacentes et du lambeau de reconstruction dans le CTV T BR.',
    });
  }

  return {
    isStereoPostOp,
    isLarynxEarlyStageSingleDose,
    larynxSingleDoseLabel,
    ctvTHighRisk,
    ctvTInterRisk,
    ctvTLowRisk,
    ctvNHighRisk,
    ctvNInterRisk,
    ctvNLowRisk,
    isUnilateralIndication,
    unilateralReason,
    recoradInclusions,
    salivaryGreenJournalNote:
      isSalivary && isAdjuvant
        ? 'Référence ESTRO ACROP / DAHANCA Green Journal 2025 appliquée pour la parotide / sous-mandibulaire.'
        : undefined,
    articlesToDisplay,
  };
}
