import { LocalisationENT, RcpFormData, StadeN, StadeT } from '../types';
import { SUBSTRUCTURES_MAP } from '../data/substructures';
import { ARTICLES, ArticleReference } from '../data/references';

/** Niveaux ganglionnaires (Grégoire 2014) utilisés dans les volumes prophylactiques. */
export type NodalLevel = 'Ia' | 'Ib' | 'II' | 'III' | 'IV' | 'V' | 'VIa' | 'VIb' | 'RP';

/** Niveaux du CTV N bas risque, du côté de la tumeur et du côté opposé. */
export interface NodalLevelsBySide {
  ipsilateral: NodalLevel[];
  contralateral: NodalLevel[];
}

export interface ContouringEvaluationResult {
  isStereoPostOp: boolean;
  isLarynxEarlyStageSingleDose: boolean;
  larynxSingleDoseLabel: string;
  ctvTHighRisk: string;
  ctvTInterRisk: string | null;
  ctvTLowRisk: string | null;
  ctvNHighRisk: string;
  ctvNInterRisk: string | null;
  ctvNLowRisk: string;
  ctvNLowRiskLevels: NodalLevelsBySide;
  isUnilateralIndication: boolean;
  unilateralReason?: string;
  recoradInclusions: string[];
  articlesToDisplay: ArticleReference[];
}

/** Paramètres cliniques dérivés du cas, partagés par toutes les règles de contourage. */
interface ContouringContext {
  loc: LocalisationENT;
  isAdjuvant: boolean;
  isStereoPostOp: boolean;
  isNasopharynx: boolean;
  isSalivaryAdjuvant: boolean;
  isLarynxEarlyStage: boolean;
  hasFlap: boolean;
  hasPositiveMargins: boolean;
  hasECE: boolean;
  hasInduction: boolean;
  stadeT: StadeT;
  stadeN: StadeN;
  isN0: boolean;
  medianLineReached: boolean;
  nodalAreas: string[];
  nodalLabels: string | null;
  substructureIds: string[];
  recoradInclusions: string[];
}

const LARYNX_SINGLE_DOSE_LABELS: Partial<Record<StadeT, string>> = {
  Tis: '60.75 Gy (2.25 Gy/fx)',
  '1': '63 Gy (2.25 Gy/fx)',
  '2': '64.8 Gy (2.4 Gy/fx)',
};

const TONSIL_SUBSTRUCTURES = ['amygdale', 'pilier_anterieur', 'pilier_posterieur', 'sillon_amygdaloglosse'];

const isEarlyT = (t: StadeT) => t === 'Tis' || t === '1' || t === '2';

const NO_LEVELS: NodalLevelsBySide = { ipsilateral: [], contralateral: [] };
const ipsi = (...levels: NodalLevel[]): NodalLevelsBySide => ({ ipsilateral: levels, contralateral: [] });
const bilat = (...levels: NodalLevel[]): NodalLevelsBySide => ({ ipsilateral: levels, contralateral: levels });
/** Ajoute les ganglions rétropharyngés aux côtés déjà irradiés. */
const plus = (levels: NodalLevelsBySide, extra: NodalLevel[]): NodalLevelsBySide => ({
  ipsilateral: [...levels.ipsilateral, ...extra],
  contralateral: levels.contralateral.length ? [...levels.contralateral, ...extra] : [],
});

interface LowRisk {
  text: string;
  levels: NodalLevelsBySide;
}

export function computeContouringRecommendations(
  formData: RcpFormData,
  selectedSubstructureIds: string[],
  isStereoPostOp = false
): ContouringEvaluationResult {
  const ctx = buildContext(formData, selectedSubstructureIds, isStereoPostOp);
  const unilateral = evaluateUnilateralIndication(ctx);

  return {
    isStereoPostOp,
    isLarynxEarlyStageSingleDose: ctx.isLarynxEarlyStage,
    larynxSingleDoseLabel: ctx.isLarynxEarlyStage ? LARYNX_SINGLE_DOSE_LABELS[ctx.stadeT] ?? '' : '',
    ctvTHighRisk: ctvTHighRisk(ctx),
    ctvTInterRisk: ctvTInterRisk(ctx),
    ctvTLowRisk: ctvTLowRisk(ctx),
    ...ctvN(ctx, unilateral.isUnilateral),
    isUnilateralIndication: unilateral.isUnilateral,
    unilateralReason: unilateral.reason,
    recoradInclusions: ctx.recoradInclusions,
    articlesToDisplay: selectArticles(ctx),
  };
}

function buildContext(
  formData: RcpFormData,
  substructureIds: string[],
  isStereoPostOp: boolean
): ContouringContext {
  const loc = formData.localisation;
  const isAdjuvant = formData.situation === 'adjuvant';
  const stadeT = isAdjuvant ? formData.stadePT : formData.stadeT;
  const stadeN = isAdjuvant ? formData.stadePN : formData.stadeN;
  const ece = isAdjuvant ? formData.effractionExtraCapsulaire : 'Non';
  const nodalAreas = formData.nodalAreas ?? [];

  const recoradInclusions = Array.from(
    new Set(
      (SUBSTRUCTURES_MAP[loc] ?? [])
        .filter((s) => substructureIds.includes(s.id))
        .flatMap((s) => s.recoradBrInclusions)
    )
  );

  return {
    loc,
    isAdjuvant,
    isStereoPostOp,
    isNasopharynx: loc === 'Nasopharynx',
    isSalivaryAdjuvant: loc === 'Glande salivaire' && isAdjuvant,
    // Larynx Tis / T1 / T2 N0 en place : niveau de dose unique et CTV T unique (pas de CTV N)
    isLarynxEarlyStage: !isAdjuvant && loc === 'Larynx' && isEarlyT(stadeT) && stadeN === '0',
    hasFlap: isAdjuvant && formData.lambeau,
    hasPositiveMargins: isAdjuvant && formData.marges === 'Envahies',
    hasECE: ece === 'Mineure' || ece === 'Majeure',
    hasInduction: !isAdjuvant && formData.chimiotherapieInduction,
    stadeT,
    stadeN,
    isN0: stadeN === '0',
    medianLineReached: formData.atteinteLigneMediane ?? false,
    nodalAreas,
    nodalLabels: nodalAreas.length > 0 ? nodalAreas.join(', ') : null,
    substructureIds,
    recoradInclusions,
  };
}

// ----------------------------------------------------
// CTV T
// ----------------------------------------------------

function ctvTHighRisk(ctx: ContouringContext): string {
  if (ctx.isLarynxEarlyStage) {
    return 'GTV T + 5 mm, étendu à l’ensemble du larynx.';
  }
  if (ctx.isStereoPostOp) {
    return ctx.hasFlap
      ? 'Stéréo Post-Op (Avec Lambeau) : Suture du lambeau (en zone R1 si marge positive, suture totale sinon) + 5 mm.'
      : 'Stéréo Post-Op (Sans Lambeau) : Zone de résection (zone R1 si marges positives, zone de résection simple sinon) + 5 mm.';
  }
  if (!ctx.isAdjuvant) {
    if (ctx.isNasopharynx) {
      return ctx.hasInduction
        ? 'GTV résiduel + 0 mm étendu au GTV initial au niveau osseux et de la base du crâne.'
        : 'GTV + 0 mm (GTVnx pur selon recommandations internationales 2024).';
    }
    return ctx.hasInduction
      ? 'GTV + 5 mm étendu au GTV initial (pré-chimiothérapie d’induction).'
      : 'GTV + 5 mm (extension anatomique ajustée aux barrières osseuses/fasciales).';
  }
  if (ctx.hasPositiveMargins) {
    return ctx.hasFlap ? 'Suture au niveau R1 + 5 mm.' : 'Zone R1 + 5 mm (reliquat microscopique prouvé).';
  }
  return 'Non indiqué en routine pour marges saines R0 (le volume est couvert par le CTV IR / site opératoire).';
}

function ctvTInterRisk(ctx: ContouringContext): string | null {
  // Niveau de dose unique (larynx débutant) ou CTV HR seul (stéréo post-op)
  if (ctx.isLarynxEarlyStage || ctx.isStereoPostOp) return null;

  if (ctx.isNasopharynx) {
    return ctx.hasInduction
      ? 'Nasopharynx (Consensus 2024) : CTV T IR = CTV T HR + 5 mm étendu au GTV pré-chimiothérapie d’induction.'
      : 'Nasopharynx (Consensus 2024) : CTV T IR = CTV T HR + 5 mm.';
  }
  if (ctx.isAdjuvant) {
    return ctx.hasFlap ? 'Suture du lambeau + 5 mm.' : 'Site opératoire (loge tumorale initiale d’exérèse).';
  }
  // Non individualisé pour les autres tumeurs en place (intégré dans HR/BR)
  return null;
}

/** CTV T bas risque (prophylactique) : RECORAD, Consensus Nasopharynx 2024 ou Green Journal 2025. */
function ctvTLowRisk(ctx: ContouringContext): string | null {
  const inclusions = ctx.recoradInclusions;

  if (ctx.isLarynxEarlyStage) return null;

  if (ctx.isStereoPostOp) {
    return 'Non requis en Stéréo Post-Opératoire (irradiation focalisée HR).';
  }

  if (ctx.isNasopharynx) {
    const base =
      'Consensus International Nasopharynx 2024 : Inclusion prophylactique du cavum total, du sinus sphénoïdal inférieur/médian, du clivus antérieur, des choanes et fosses nasales postérieures, et de l’espace parapharyngé supérieur.';
    return inclusions.length > 0 ? `${base} (Inclusions sous-structures : ${inclusions.join(', ')}).` : base;
  }

  if (ctx.isSalivaryAdjuvant) {
    const base =
      'Glande Salivaire (Green Journal 2025) : Loge glandulaire révoquée, canal excréteur (Sténon/Wharton), extension à la base du crâne le long des nerfs facial/V3 si engainement périneural.';
    return ctx.hasFlap
      ? `${base} + Inclure obligatoirement l’ensemble du lambeau de reconstruction dans le CTV T BR.`
      : base;
  }

  const base =
    inclusions.length > 0
      ? `Basé sur RECORAD (${inclusions.join(', ')}).`
      : 'Structures mucosales et musculaires adjacentes selon les recommandations RECORAD.';
  return ctx.hasFlap
    ? `${base} IMPORTANT : En situation adjuvante avec lambeau, inclure toujours le lambeau dans le CTV T BR.`
    : base;
}

// ----------------------------------------------------
// IRRADIATION CERVICALE UNILATÉRALE
// ----------------------------------------------------

function evaluateUnilateralIndication(ctx: ContouringContext): { isUnilateral: boolean; reason?: string } {
  const { loc, stadeN, isN0, isAdjuvant, medianLineReached, substructureIds, nodalAreas } = ctx;
  const nPrefix = isAdjuvant ? 'pN' : 'N';

  // Cavité buccale ou amygdale sans atteinte de la ligne médiane, N1 ou N2a (pN1 / pN2a)
  const isCaviteBuccaleOrAmygdale =
    loc === 'Cavité buccale' ||
    (loc === 'Oropharynx' &&
      (substructureIds.length === 0 || TONSIL_SUBSTRUCTURES.some((id) => substructureIds.includes(id))));
  const isOralOrTonsilUnilateral =
    isCaviteBuccaleOrAmygdale && !medianLineReached && (stadeN === '1' || stadeN === '2a');

  // Sinus (maxillaire et ethmoïde) sans atteinte de la ligne médiane, N0 ou ganglions du côté tumoral uniquement
  const isSinus = loc === 'Sinus de la face (hors ethmoïde)' || loc === 'Sinus ethmoïde';
  const hasBilateralNodes =
    (nodalAreas.some((a) => a.includes('Droit')) && nodalAreas.some((a) => a.includes('Gauche'))) ||
    stadeN === '2c';
  const isSinusUnilateral = isSinus && !medianLineReached && (isN0 || !hasBilateralNodes);

  if (!isOralOrTonsilUnilateral && !isSinusUnilateral) {
    return { isUnilateral: false };
  }

  const reason = isSinus
    ? `${loc} sans atteinte de la ligne médiane et ${
        isN0
          ? `stade ${nPrefix}0`
          : `ganglions atteints uniquement du côté de la tumeur (stade ${nPrefix}${stadeN})`
      } : indication d’IRRADIATION CERVICALE UNILATÉRALE (du côté de la tumeur uniquement).`
    : `${loc} sans atteinte de la ligne médiane et stade ${nPrefix}${stadeN} : indication d’IRRADIATION CERVICALE UNILATÉRALE (ipsilatérale uniquement).`;

  return { isUnilateral: true, reason };
}

// ----------------------------------------------------
// CTV N (volumes ganglionnaires HR, IR, BR)
// ----------------------------------------------------

type CtvN = Pick<ContouringEvaluationResult, 'ctvNHighRisk' | 'ctvNInterRisk' | 'ctvNLowRisk' | 'ctvNLowRiskLevels'>;

function ctvN(ctx: ContouringContext, isUnilateral: boolean): CtvN {
  if (ctx.isStereoPostOp) {
    return {
      ctvNHighRisk: 'Non inclus en Stéréo Post-Op (sauf adénopathie R1 ciblée en CTV HR).',
      ctvNInterRisk: null,
      ctvNLowRisk: 'Irradiation ganglionnaire prophylactique non indiquée en Stéréo Post-Op.',
      ctvNLowRiskLevels: NO_LEVELS,
    };
  }
  if (ctx.isNasopharynx) return ctvNNasopharynx(ctx);
  if (ctx.isSalivaryAdjuvant) return ctvNSalivary(ctx);
  return ctvNStandard(ctx, isUnilateral);
}

/** Consensus International Nasopharynx 2024. */
function ctvNNasopharynx({ isN0, hasECE, nodalLabels }: ContouringContext): CtvN {
  if (isN0) {
    return {
      ctvNHighRisk: 'Pas de GTVn / CTVn HR ganglionnaire (N0).',
      ctvNInterRisk: null,
      ctvNLowRisk:
        'Consensus International Nasopharynx 2024 (N0) : Niveaux IIa, IIb, III, Va, Vb bilatéraux + Ganglions Rétropharyngés (RP). (Pas de niveau IV ni de niveau Vc dans les volumes prophylactiques en N0. Niveau Ib seulement si extension aux fosses nasales antérieures ou à la cavité buccale).',
      ctvNLowRiskLevels: bilat('II', 'III', 'V', 'RP'),
    };
  }

  const nodalInfo = nodalLabels ? ` [Aires envahies : ${nodalLabels}]` : '';
  return {
    ctvNHighRisk: 'CTV N HR = GTV N',
    ctvNInterRisk: hasECE
      ? `CTV N IR = CTV N HR + 5 mm (présence d’ENE / effraction extra-capsulaire).${nodalInfo}`
      : `CTV N IR = CTV N HR + 5 mm si ENE uniquement.${nodalInfo}`,
    ctvNLowRisk: `Consensus International Nasopharynx 2024 (N+) : Niveaux IIa, IIb, III, IV, V, VI bilatéraux + Ganglions Rétropharyngés (RP) ${
      nodalLabels ? `(Aires envahies ciblées : ${nodalLabels})` : ''
    } selon l’extension sous-claviculaire ou ganglionnaire massive.`,
    ctvNLowRiskLevels: bilat('II', 'III', 'IV', 'V', 'VIa', 'VIb', 'RP'),
  };
}

/** Green Journal 2025 — glandes salivaires en situation adjuvante. */
function ctvNSalivary({ isN0, hasPositiveMargins }: ContouringContext): CtvN {
  return {
    ctvNHighRisk: hasPositiveMargins
      ? 'Région ganglionnaire avec marges R1 ou effraction capsulaire majeure + 5 mm.'
      : 'Non indiqué si R0 ganglionnaire.',
    ctvNInterRisk: 'Loge opératoire ganglionnaire rétropharyngée/parotidienne.',
    ctvNLowRisk: isN0
      ? 'Irradiation prophylactique ciblée des niveaux Ib, II et III ipsilatéraux (si haut grade T3-T4, engainement périneural ou histologie agressive).'
      : 'Irradiation des niveaux Ia, Ib, II, III, IV, Va, Vb ipsilatéraux (et RP/parotidien si atteinte parotidienne).',
    ctvNLowRiskLevels: isN0 ? ipsi('Ib', 'II', 'III') : ipsi('Ia', 'Ib', 'II', 'III', 'IV', 'V'),
  };
}

/** Hors nasopharynx / glande salivaire : Biau et al. 2019 (DAHANCA / EORTC / GORTEC). */
function ctvNStandard(ctx: ContouringContext, isUnilateral: boolean): CtvN {
  const { isAdjuvant, isN0, hasECE, hasPositiveMargins, nodalLabels } = ctx;

  let ctvNHighRisk: string;
  if (!isAdjuvant) {
    ctvNHighRisk = isN0
      ? 'Aucun volume HR ganglionnaire en N0.'
      : 'CTV N HR = GTV N + 5 mm (adénopathies macroradiologiques envahies).';
  } else if (hasECE) {
    ctvNHighRisk =
      'CTV N HR = GTV N préopératoire + 5 mm (en raison de la rupture capsulaire / effraction extra-capsulaire).';
  } else if (hasPositiveMargins) {
    ctvNHighRisk = 'CTV N HR = Loge ganglionnaire R1 + 5 mm (reliquat microscopique).';
  } else {
    ctvNHighRisk = 'Non requis en adjuvant pour curage R0 sans rupture capsulaire.';
  }

  let ctvNInterRisk: string | null = null;
  if (!isN0) {
    const nodalListText = nodalLabels
      ? `[ ${nodalLabels} ]`
      : '(Veuillez cocher les aires ganglionnaires envahies dans le menu N ci-dessus)';
    ctvNInterRisk = isAdjuvant
      ? `CTV N IR = Loge(s) opératoire(s) des aire(s) envahie(s) : ${nodalListText}`
      : `CTV N IR = Aire(s) ganglionnaire(s) envahie(s) : ${nodalListText}`;
  }

  const lowRisk = isN0 ? ctvNLowRiskN0(ctx) : ctvNLowRiskNPlus(ctx, isUnilateral);
  return { ctvNHighRisk, ctvNInterRisk, ctvNLowRisk: lowRisk.text, ctvNLowRiskLevels: lowRisk.levels };
}

function ctvNLowRiskN0({ loc, isAdjuvant, stadeT, medianLineReached, substructureIds }: ContouringContext): LowRisk {
  const has = (id: string) => substructureIds.includes(id);

  switch (loc) {
    case 'Cavité buccale':
      return medianLineReached
        ? {
            text: 'Niveaux Ia, Ib, II, III BILATÉRAUX (en raison de l’atteinte de la ligne médiane).',
            levels: bilat('Ia', 'Ib', 'II', 'III'),
          }
        : {
            text: 'IRRADIATION CERVICALE UNILATÉRALE : Niveaux Ia, Ib, II, III IPSILATÉRAUX (sans atteinte de la ligne médiane).',
            levels: ipsi('Ia', 'Ib', 'II', 'III'),
          };

    case 'Oropharynx':
      if (medianLineReached || has('base_de_langue') || has('voile') || has('paroi_pharyngee_posterieure_oro')) {
        const withRP = has('paroi_pharyngee_posterieure_oro') || has('voile');
        return {
          text: `Niveaux II, III, IV BILATÉRAUX${withRP ? ' + Ganglions Rétropharyngés (RP).' : '.'}`,
          levels: plus(bilat('II', 'III', 'IV'), withRP ? ['RP'] : []),
        };
      }
      return {
        text: 'IRRADIATION CERVICALE UNILATÉRALE : Niveaux II, III, IV IPSILATÉRAUX (sans atteinte de la ligne médiane).',
        levels: ipsi('II', 'III', 'IV'),
      };

    case 'Hypopharynx':
      return {
        text: 'Niveaux II, III, IV, Va, Vb BILATÉRAUX + Ganglions Rétropharyngés (RP).',
        levels: bilat('II', 'III', 'IV', 'V', 'RP'),
      };

    case 'Larynx': {
      if (!isAdjuvant && isEarlyT(stadeT)) {
        return {
          text: 'Pas de CTV N dans cette situation (Larynx Tis/T1/T2 N0 : pas d’irradiation ganglionnaire requise).',
          levels: NO_LEVELS,
        };
      }
      if (has('glotte_pure') && (stadeT === '1' || stadeT === '2')) {
        return { text: 'Pas d’irradiation ganglionnaire prophylactique (0 Gy) pour glotte T1-T2 N0.', levels: NO_LEVELS };
      }
      const withVI = has('sous_glottique');
      return {
        text: `Niveaux II, III, IV BILATÉRAUX${withVI ? ' + Niveaux VIa, VIb (Prétrachéal / Paratrachéal).' : '.'}`,
        levels: plus(bilat('II', 'III', 'IV'), withVI ? ['VIa', 'VIb'] : []),
      };
    }

    case 'Sinus de la face (hors ethmoïde)':
    case 'Sinus ethmoïde':
    case 'Fosses nasales':
      return {
        text: 'Pas d’irradiation prophylactique ganglionnaire systématique en N0 sauf T3-T4 (Niveaux Ib et II ipsilatéraux).',
        levels: stadeT === '3' || stadeT === '4' ? ipsi('Ib', 'II') : NO_LEVELS,
      };

    default:
      return { text: 'Niveaux II, III, IV IPSILATÉRAUX.', levels: ipsi('II', 'III', 'IV') };
  }
}

function ctvNLowRiskNPlus(
  { loc, stadeN, medianLineReached, substructureIds, nodalAreas }: ContouringContext,
  isUnilateral: boolean
): LowRisk {
  if (isUnilateral) {
    return loc === 'Cavité buccale'
      ? {
          text: 'IRRADIATION CERVICALE UNILATÉRALE : Niveaux Ia, Ib, II, III, IV, Va, Vb IPSILATÉRAUX (côté lésionnel uniquement).',
          levels: ipsi('Ia', 'Ib', 'II', 'III', 'IV', 'V'),
        }
      : {
          text: 'IRRADIATION CERVICALE UNILATÉRALE : Niveaux II, III, IV, Va, Vb IPSILATÉRAUX (côté lésionnel uniquement).',
          levels: ipsi('II', 'III', 'IV', 'V'),
        };
  }

  switch (loc) {
    case 'Cavité buccale':
      return medianLineReached || stadeN === '2c' || stadeN === '3a' || stadeN === '3b'
        ? {
            text: 'Niveaux Ia, Ib, II, III, IV, Va, Vb BILATÉRAUX (incluant le niveau Ib controlatéral).',
            levels: bilat('Ia', 'Ib', 'II', 'III', 'IV', 'V'),
          }
        : {
            text: 'Niveaux Ia, Ib, II, III, IV, Va, Vb IPSILATÉRAUX + Niveaux Ia, Ib, II, III controlatéraux.',
            levels: { ipsilateral: ['Ia', 'Ib', 'II', 'III', 'IV', 'V'], contralateral: ['Ia', 'Ib', 'II', 'III'] },
          };

    case 'Oropharynx': {
      const withRP =
        nodalAreas.includes('RP') || substructureIds.includes('paroi_pharyngee_posterieure_oro') || stadeN === '3b';
      return {
        text: `Niveaux II, III, IV, Va, Vb BILATÉRAUX${withRP ? ' + Ganglions Rétropharyngés (RP).' : '.'}`,
        levels: plus(bilat('II', 'III', 'IV', 'V'), withRP ? ['RP'] : []),
      };
    }

    case 'Hypopharynx':
      return {
        text: 'Niveaux II, III, IV, Va, Vb, VIa, VIb BILATÉRAUX + Ganglions Rétropharyngés (RP).',
        levels: bilat('II', 'III', 'IV', 'V', 'VIa', 'VIb', 'RP'),
      };

    case 'Larynx': {
      const withVI = substructureIds.includes('sous_glottique');
      return {
        text: `Niveaux II, III, IV, Va, Vb BILATÉRAUX${withVI ? ' + Niveaux VIa, VIb (Prétrachéal / Paratrachéal).' : '.'}`,
        levels: plus(bilat('II', 'III', 'IV', 'V'), withVI ? ['VIa', 'VIb'] : []),
      };
    }

    default:
      return {
        text: 'Niveaux Ia à Vb BILATÉRAUX selon l’extension N.',
        levels: bilat('Ia', 'Ib', 'II', 'III', 'IV', 'V'),
      };
  }
}

// ----------------------------------------------------
// RÉFÉRENCES BIBLIOGRAPHIQUES
// ----------------------------------------------------

function selectArticles(ctx: ContouringContext): ArticleReference[] {
  const articles: ArticleReference[] = [];
  if (ctx.isStereoPostOp) articles.push(ARTICLES.stereoPostOp);
  if (ctx.isSalivaryAdjuvant) articles.push(ARTICLES.salivaryGland);
  if (ctx.isNasopharynx) {
    articles.push(ARTICLES.nasopharynx);
  } else {
    // RECORAD s'applique à tous les CTV T BR sauf le nasopharynx (Consensus International 2024)
    articles.push(ARTICLES.biauNodal, ARTICLES.recorad);
  }
  return articles;
}
