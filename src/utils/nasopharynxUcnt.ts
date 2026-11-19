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

const DOSE =
  'Radiothérapie IMRT avec guidage par l’image quotidien : 70 Gy en 33–35 fractions (2–2,12 Gy), 5 fractions par semaine sur 7 semaines ; 66–68 Gy envisageables pour une petite tumeur très répondeuse.';
const CISPLATINE =
  'Cisplatine concomitant : 100 mg/m² toutes les 3 semaines (3 cures) ou 40 mg/m² hebdomadaire (7 cures), dose cumulée visée ≥ 200 mg/m².';
const ADN_EBV =
  'ADN EBV plasmatique à interpréter selon le test et le seuil validés localement : aucun seuil universel n’est recommandé.';
const INDUCTION =
  'Induction : GP (gemcitabine 1000 mg/m² J1 et J8, cisplatine 80 mg/m² J1) ou TPF (docétaxel 60–75 mg/m² J1, cisplatine 60–75 mg/m² J1, 5-FU 600–750 mg/m²/j en continu J1-J5), toutes les 3 semaines, 3 cycles (2 au minimum). Si indisponibles ou contre-indiqués : TP, PF, LF ou PX.';
const SANS_INDUCTION =
  'Sans chimiothérapie d’induction : radiochimiothérapie concomitante puis chimiothérapie adjuvante (PF toutes les 4 semaines × 3, GP toutes les 3 semaines × 3, ou capécitabine).';
const CAPECITABINE_METRONOMIQUE =
  'Capécitabine métronomique adjuvante 650 mg/m² deux fois par jour pendant 1 an à proposer après induction et radiochimiothérapie, en particulier en cas d’ADN EBV persistant ou de maladie résiduelle à l’imagerie.';

export function evaluateNasopharynxUcnt(data: RcpFormTumeurEnPlace): {
  proposition: DoseProposition;
  justification: string[];
} {
  const { stadeT, stadeN, cisplatineEligible, chimiotherapieInduction, adnEbv, volumeTumoralInf30cc } = data;
  const stage = stageTnm9Nasopharynx(stadeT, stadeN);
  const tn = `T${stadeT}N${stadeN}`;
  const intro = `Carcinome indifférencié du nasopharynx (UCNT) ${tn} : stade TNM9 ${stage} (recommandations CSCO-ASCO 2026).`;
  const ebvBas = adnEbv === 'bas';
  const decide = (proposition: DoseProposition, ...justification: string[]) => ({ proposition, justification });

  if (stage === 'IA') {
    return decide(
      RT_SEULE,
      `${intro} Le stade IA est hors du champ des recommandations (stades IB à III) : radiothérapie exclusive.`,
      DOSE
    );
  }

  // Patient inéligible au cisplatine : radiothérapie seule, quel que soit le stade
  if (!cisplatineEligible) {
    return decide(RT_SEULE, `${intro} Patient inéligible au cisplatine : radiothérapie 70 Gy seule.`, DOSE);
  }

  if (stage === 'indéterminé') {
    return decide(
      RT_CISPLATINE,
      `${intro} Stade non déterminable sans le T : radiochimiothérapie concomitante par défaut, à discuter en RCP.`,
      DOSE,
      CISPLATINE
    );
  }

  if (stage === 'IB') {
    const isT2N1 = stadeT === '2' && stadeN === '1';
    if (ebvBas && !isT2N1) {
      return decide(
        RT_SEULE,
        `${intro} Stade IB à faible risque (ADN EBV plasmatique bas) : la chimiothérapie concomitante peut être omise (RT 70 Gy seule).`,
        DOSE,
        ADN_EBV
      );
    }
    return decide(
      RT_CISPLATINE,
      isT2N1
        ? `${intro} Stade IB T2N1 : radiochimiothérapie concomitante recommandée.`
        : `${intro} Stade IB : radiochimiothérapie concomitante recommandée ; elle peut être omise dans un sous-groupe à faible risque (ADN EBV bas et/ou atteinte ganglionnaire limitée).`,
      DOSE,
      CISPLATINE
    );
  }

  if (stadeT === '3' && stadeN === '0') {
    if (ebvBas && volumeTumoralInf30cc) {
      return decide(
        RT_SEULE,
        `${intro} T3N0 de petit volume (< 30 cc) avec ADN EBV plasmatique bas : RT 70 Gy seule.`,
        DOSE,
        ADN_EBV
      );
    }
    return decide(
      RT_CISPLATINE,
      `${intro} T3N0 : radiochimiothérapie concomitante recommandée, sauf facteurs de faible risque (petite tumeur < 30 cc et/ou ADN EBV bas). Une chimiothérapie d’induction ou adjuvante peut aussi être proposée.`,
      DOSE,
      CISPLATINE
    );
  }

  // Stades II–III hors T3N0 : justification limitée aux schémas d'induction, à la chimiothérapie adjuvante
  // et à la capécitabine métronomique (non indiquée pour les T3N1)
  const capecitabine = stadeT === '3' && stadeN === '1' ? [] : [CAPECITABINE_METRONOMIQUE];
  return decide(
    chimiotherapieInduction ? RT_CISPLATINE : INDUCTION_PUIS_RT_CISPLATINE,
    INDUCTION,
    SANS_INDUCTION,
    ...capecitabine
  );
}
