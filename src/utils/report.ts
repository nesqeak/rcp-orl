import { RcpFormData, RcpResultOutput } from '../types';
import { ADN_EBV_LABELS, formatStage, hpvLabel, yesNo } from './format';
import { isNasopharynxUcnt, stageTnm9Nasopharynx } from './nasopharynxUcnt';

/** Avis RCP au format texte, prêt à être collé dans un dossier patient. */
export function buildRcpReport(formData: RcpFormData, result: RcpResultOutput): string {
  const lines = [
    `=== AVIS RCP RADIOTHÉRAPIE ORL DE POCHE ===`,
    `Situation : ${formData.situation === 'tumeur_en_place' ? 'Tumeur en place' : 'Traitement adjuvant (Post-op)'}`,
    `Localisation : ${formData.localisation}`,
    `Stade : ${formatStage(formData)}`,
    `Statut HPV : ${hpvLabel(formData.statutHPV)}`,
    `Histologie : ${formData.histologie}`,
    `Éligibilité Cisplatine : ${yesNo(formData.cisplatineEligible)}`,
    formData.situation === 'tumeur_en_place'
      ? `Chimio d'induction : ${yesNo(formData.chimiotherapieInduction)}`
      : `Marges : ${formData.marges} | RC/ECE : ${formData.effractionExtraCapsulaire}`,
    ...(formData.situation === 'tumeur_en_place' && isNasopharynxUcnt(formData)
      ? [
          `Stade TNM9 : ${stageTnm9Nasopharynx(formData.stadeT, formData.stadeN)}`,
          `ADN EBV plasmatique : ${ADN_EBV_LABELS[formData.adnEbv ?? 'non_disponible']}`,
          ...(formData.volumeTumoralInf30cc !== undefined
            ? [`Volume tumoral < 30 cc : ${yesNo(formData.volumeTumoralInf30cc)}`]
            : []),
        ]
      : []),
    ``,
    `PROPOSITION THÉRAPEUTIQUE :`,
    `👉 ${result.proposition}`,
    `⚠️ ${result.inclusionEssaiNote}`,
    ``,
    `Justification :`,
    ...result.justification.map((j) => `- ${j}`),
  ];
  return lines.join('\n');
}
