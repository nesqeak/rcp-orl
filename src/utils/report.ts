import { RcpFormData, RcpResultOutput } from '../types';
import { formatStage, hpvLabel, yesNo } from './format';

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
