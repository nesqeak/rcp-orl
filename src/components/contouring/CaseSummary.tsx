import React from 'react';
import { RcpFormData } from '../../types';
import { formatStage } from '../../utils/format';
import { cx } from '../ui';
import { tumourSide } from './caseState';

const NEUTRAL = 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300';
const ALERT = 'bg-rose-100 text-rose-800 font-bold';
const INDIGO = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200';
const TEAL = 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300';

const Pill: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = NEUTRAL, children }) => (
  <span className={cx('px-2 py-0.5 rounded-md', className)}>{children}</span>
);

interface CaseSummaryProps {
  formData: RcpFormData;
  showMedianLine: boolean;
}

/** Résumé du cas clinique sous forme de pastilles. */
export const CaseSummary: React.FC<CaseSummaryProps> = ({ formData, showMedianLine }) => {
  const isOropharynx = formData.localisation === 'Oropharynx';

  return (
    <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
      <Pill>{formData.situation === 'tumeur_en_place' ? `Stade ${formatStage(formData)}` : formatStage(formData)}</Pill>

      <Pill>Côté: {tumourSide(formData)}</Pill>

      {isOropharynx && (
        <Pill className={cx('font-bold', formData.statutHPV ? TEAL : NEUTRAL)}>
          HPV: {formData.statutHPV ? 'p16+' : 'Négatif'}
        </Pill>
      )}

      {isOropharynx && formData.situation === 'tumeur_en_place' && formData.statutHPV && formData.stadeN === '1' && (
        <Pill className={TEAL}>Ganglion: {formData.nbGanglions === '2 et plus' ? '≥ 2' : '1 seul'}</Pill>
      )}

      <Pill>Histo: {formData.histologie}</Pill>

      {formData.situation === 'tumeur_en_place' && formData.chimiotherapieInduction && (
        <Pill className={INDIGO}>Induction TPF</Pill>
      )}

      {showMedianLine && (
        <Pill
          className={
            formData.atteinteLigneMediane
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold'
              : NEUTRAL
          }
        >
          Ligne Médiane: {formData.atteinteLigneMediane ? 'Atteinte (Oui)' : 'Non atteinte'}
        </Pill>
      )}

      {formData.situation === 'adjuvant' && (
        <>
          <Pill className={formData.marges === 'Envahies' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}>
            Marges: {formData.marges}
          </Pill>
          <Pill className={formData.effractionExtraCapsulaire !== 'Non' ? ALERT : NEUTRAL}>
            ECE: {formData.effractionExtraCapsulaire}
          </Pill>
          {formData.embolesVasculaires && <Pill className={ALERT}>LVI+</Pill>}
          {formData.engainementPerineuronal && <Pill className={ALERT}>PNI+</Pill>}
          {formData.WPI && <Pill className={ALERT}>WPI+</Pill>}
          {formData.lambeau && <Pill className={INDIGO}>Lambeau</Pill>}
        </>
      )}
    </div>
  );
};
