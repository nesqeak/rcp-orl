import { DoseProposition, RcpFormTumeurEnPlace, StadeN, StadeT } from '../types';

/**
 * Carcinome indifférencié du nasopharynx (UCNT), tumeur en place :
 * recommandations CSCO-ASCO 2026 (Chen et al., J Clin Oncol, doi:10.1200/JCO-26-02648), classification TNM 9e édition.
 */

export type StadeTnm9 = 'IA' | 'IB' | 'II' | 'III' | 'indéterminé';

/** Regroupement TNM9 : IA = T1N0 ; IB = T1N1, T2N0, T2N1 ; II = T1-2 N2, T3 N0-2 ; III = T4 ou N3. */
export function stageTnm9Nasopharynx(t: StadeT, n: StadeN): StadeTnm9 {
  if (t === '4' || n === '3') return 'III';
  if (t === 'X') return n === '2' ? 'II' : 'indéterminé';
  if (t === '3' || n === '2') return 'II';
  if (t === '1' && n === '0') return 'IA';
  return 'IB';
}

export const isNasopharynxUcnt = (data: { localisation: string; histologie: string }) =>
  data.localisation === 'Nasopharynx' && data.histologie === 'UCNT';

const RT_SEULE: DoseProposition = 'Radiothérapie 70Gy';
const RT_CISPLATINE: DoseProposition =
  'Radiothérapie 70Gy potentialisée par du cisplatine 100mg/m2 toutes les 3 semaines ou 40mg/m2 hebdomadaire';
const INDUCTION_PUIS_RT_CISPLATINE: DoseProposition =
  'Chimiothérapie d’induction GP (ou TPF) puis radiothérapie 70Gy potentialisée par du cisplatine';
const RT_PLATINE_ALTERNATIF: DoseProposition =
  'Radiothérapie 70Gy potentialisée par un sel de platine alternatif (carboplatine, nédaplatine ou lobaplatine)';

const DOSE =
  'Radiothérapie IMRT avec guidage par l’image quotidien : 70 Gy en 33–35 fractions (2–2,12 Gy), 5 fractions par semaine sur 7 semaines ; 66–68 Gy envisageables pour une petite tumeur très répondeuse.';
const CISPLATINE =
  'Cisplatine concomitant : 100 mg/m² toutes les 3 semaines (3 cures) ou 40 mg/m² hebdomadaire (7 cures), dose cumulée visée ≥ 200 mg/m².';
const PLATINE_ALTERNATIF =
  'Contre-indication au cisplatine : carboplatine AUC 2 hebdomadaire ou AUC 5 toutes les 3 semaines, lobaplatine 30 mg/m² ou nédaplatine 100 mg/m² toutes les 3 semaines. Contre-indication à tous les sels de platine : fluoropyrimidine concomitante (capécitabine, 5-FU ou tégafur) ou radiothérapie seule.';
const ADN_EBV =
  'ADN EBV plasmatique à interpréter selon le test et le seuil validés localement : aucun seuil universel n’est recommandé.';
const INDUCTION =
  'Induction : GP (gemcitabine 1000 mg/m² J1 et J8, cisplatine 80 mg/m² J1) ou TPF (docétaxel 60–75 mg/m² J1, cisplatine 60–75 mg/m² J1, 5-FU 600–750 mg/m²/j en continu J1-J5), toutes les 3 semaines, 3 cycles (2 au minimum). Si indisponibles ou contre-indiqués : TP, PF, LF ou PX.';
const APRES_INDUCTION =
  'Après induction : bilan d’imagerie dans les 14 jours suivant la dernière cure et radiochimiothérapie débutée dans les 28 jours suivant le 1er jour de la dernière cure ; le résidu tumoral post-induction reçoit 70 Gy et l’extension tumorale pré-induction au moins 60 Gy.';
const SANS_INDUCTION =
  'Sans chimiothérapie d’induction : radiochimiothérapie concomitante puis chimiothérapie adjuvante (PF toutes les 4 semaines × 3, GP toutes les 3 semaines × 3, ou capécitabine).';
const CAPECITABINE_METRONOMIQUE =
  'Capécitabine métronomique adjuvante 650 mg/m² deux fois par jour pendant 1 an à proposer après induction et radiochimiothérapie, en particulier en cas d’ADN EBV persistant ou de maladie résiduelle à l’imagerie.';
const DPYD = 'Rechercher un déficit en DPD (génotypage DPYD) avant toute fluoropyrimidine (5-FU, capécitabine).';

export function evaluateNasopharynxUcnt(data: RcpFormTumeurEnPlace): {
  proposition: DoseProposition;
  justification: string[];
} {
  const { stadeT, stadeN, cisplatineEligible, chimiotherapieInduction, adnEbv, volumeTumoralInf30cc } = data;
  const stage = stageTnm9Nasopharynx(stadeT, stadeN);
  const tn = `T${stadeT}N${stadeN}`;
  const intro = `Carcinome indifférencié du nasopharynx (UCNT) ${tn} : stade TNM9 ${stage} (recommandations CSCO-ASCO 2026).`;
  const ebvBas = adnEbv === 'bas';
  const concomitant = cisplatineEligible ? RT_CISPLATINE : RT_PLATINE_ALTERNATIF;
  const chimioConcomitante = cisplatineEligible ? CISPLATINE : PLATINE_ALTERNATIF;
  const decide = (proposition: DoseProposition, ...justification: string[]) => ({ proposition, justification });

  if (stage === 'IA') {
    return decide(
      RT_SEULE,
      `${intro} Le stade IA est hors du champ des recommandations (stades IB à III) : radiothérapie exclusive.`,
      DOSE
    );
  }

  if (stage === 'indéterminé') {
    return decide(
      concomitant,
      `${intro} Stade non déterminable sans le T : radiochimiothérapie concomitante par défaut, à discuter en RCP.`,
      DOSE,
      chimioConcomitante
    );
  }

  if (stage === 'IB') {
    const isT2N1 = stadeT === '2' && stadeN === '1';
    if (ebvBas && !isT2N1) {
      return decide(
        RT_SEULE,
        `${intro} Stade IB à faible risque (ADN EBV plasmatique bas) : la chimiothérapie concomitante peut être omise (IMRT seule).`,
        DOSE,
        ADN_EBV
      );
    }
    return decide(
      concomitant,
      isT2N1
        ? `${intro} Stade IB T2N1 : radiochimiothérapie concomitante recommandée.`
        : `${intro} Stade IB : radiochimiothérapie concomitante recommandée ; elle peut être omise dans un sous-groupe à faible risque (ADN EBV bas et/ou atteinte ganglionnaire limitée).`,
      DOSE,
      chimioConcomitante
    );
  }

  if (stadeT === '3' && stadeN === '0') {
    if (ebvBas && volumeTumoralInf30cc) {
      return decide(
        RT_SEULE,
        `${intro} T3N0 de petit volume (< 30 cc) avec ADN EBV plasmatique bas : IMRT seule envisageable.`,
        DOSE,
        ADN_EBV
      );
    }
    return decide(
      concomitant,
      `${intro} T3N0 : radiochimiothérapie concomitante recommandée, sauf facteurs de faible risque (petite tumeur < 30 cc et/ou ADN EBV bas). Une chimiothérapie d’induction ou adjuvante peut aussi être proposée.`,
      DOSE,
      chimioConcomitante
    );
  }

  // Stades II–III hors T3N0
  const capecitabine = stadeT === '3' && stadeN === '1' ? [] : [CAPECITABINE_METRONOMIQUE];
  if (!cisplatineEligible) {
    return decide(
      RT_PLATINE_ALTERNATIF,
      `${intro} Stade II–III (hors T3N0) chez un patient inéligible au cisplatine.`,
      DOSE,
      PLATINE_ALTERNATIF,
      'Les inductions de référence (GP, TPF) contiennent du cisplatine ; si une induction est envisagée, LF (lobaplatine + 5-FU) est une alternative.',
      DPYD
    );
  }
  if (chimiotherapieInduction) {
    return decide(
      RT_CISPLATINE,
      `${intro} Après chimiothérapie d’induction : radiochimiothérapie concomitante.`,
      DOSE,
      APRES_INDUCTION,
      CISPLATINE,
      ...capecitabine,
      ...(capecitabine.length ? [DPYD] : [])
    );
  }
  return decide(
    INDUCTION_PUIS_RT_CISPLATINE,
    `${intro} Stade II–III (hors T3N0) : chimiothérapie d’induction puis radiochimiothérapie concomitante.`,
    INDUCTION,
    DOSE,
    APRES_INDUCTION,
    CISPLATINE,
    SANS_INDUCTION,
    ...capecitabine,
    DPYD
  );
}
