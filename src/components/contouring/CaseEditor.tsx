import React from 'react';
import {
  LocalisationENT,
  RcpFormAdjuvant,
  RcpFormData,
  RcpFormTumeurEnPlace,
  SituationType,
} from '../../types';
import { getAvailableStadesN, getAvailableStadesT } from '../../utils/rcpDecisionEngine';
import { formatStadeN, formatStadeT } from '../../utils/format';
import { CONTOURING_LOCALISATIONS, HISTOLOGIES, MARGES_OPTIONS } from '../../data/options';
import { ChoiceGrid, FieldRow, cx, SegmentedControl, Select, ToggleRow, yesNoOptions } from '../ui';
import { EceChoice, HPV_OPTIONS, NbGanglionsChoice, TailleTumeurChoice } from '../clinicalFields';
import { currentStadeN, withHPV, withStadeN } from './caseState';

type CasePatch = Partial<RcpFormTumeurEnPlace> | Partial<RcpFormAdjuvant>;

interface CaseEditorProps {
  formData: RcpFormData;
  onChange: (update: (prev: RcpFormData) => RcpFormData) => void;
  onSituationChange: (situation: SituationType) => void;
  onLocalisationChange: (localisation: LocalisationENT) => void;
  showMedianLine: boolean;
}

const INDIGO_ACTIVE = 'bg-indigo-600 text-white';
const INDIGO_NO_YES = yesNoOptions(INDIGO_ACTIVE, INDIGO_ACTIVE).reverse();
const SMALL_SELECT = 'text-sm font-semibold p-1.5 rounded-lg bg-white dark:bg-slate-800';

const SITUATION_OPTIONS: { value: SituationType; label: string }[] = [
  { value: 'tumeur_en_place', label: 'Tumeur en place' },
  { value: 'adjuvant', label: 'Adjuvant (Post-op)' },
];

const SubLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="font-semibold block text-slate-600 dark:text-slate-400 text-[11px] mb-0.5">{children}</label>
);

const StepLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">{children}</label>
);

/** Formulaire d'édition du cas clinique, directement dans le guide de contourage. */
export const CaseEditor: React.FC<CaseEditorProps> = ({
  formData,
  onChange,
  onSituationChange,
  onLocalisationChange,
  showMedianLine,
}) => {
  const patch = (p: CasePatch) => onChange((prev) => ({ ...prev, ...p }) as RcpFormData);
  const isEnPlace = formData.situation === 'tumeur_en_place';
  const availableT = getAvailableStadesT(formData.localisation);
  const availableN = getAvailableStadesN(formData.localisation, formData.statutHPV, formData.situation);

  return (
    <div className="mt-3 pt-3 space-y-3.5 text-xs bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
      <div className="font-bold text-indigo-900 dark:text-indigo-300">Édition complète du cas clinique :</div>

      <div className="space-y-1">
        <StepLabel>1. Situation clinique :</StepLabel>
        <ChoiceGrid
          value={formData.situation}
          options={SITUATION_OPTIONS}
          onChange={onSituationChange}
          activeClass="bg-indigo-600 text-white border-indigo-600 shadow-2xs rounded-xl"
          inactiveClass="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 rounded-xl"
        />
      </div>

      <div>
        <StepLabel>2. Localisation tumorale :</StepLabel>
        <Select
          value={formData.localisation}
          options={CONTOURING_LOCALISATIONS}
          onChange={onLocalisationChange}
          className="text-xs font-semibold p-2 bg-white dark:bg-slate-800"
        />
      </div>

      <div className="space-y-2">
        <StepLabel>3. Classification TNM / pTNM :</StepLabel>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <SubLabel>Stade {isEnPlace ? 'T' : 'pT'} :</SubLabel>
            <Select
              value={isEnPlace ? formData.stadeT : formData.stadePT}
              options={availableT}
              formatOption={(t) => formatStadeT(t, !isEnPlace)}
              onChange={(t) => patch(isEnPlace ? { stadeT: t } : { stadePT: t })}
              className={SMALL_SELECT}
            />
          </div>
          <div>
            <SubLabel>Stade {isEnPlace ? 'N' : 'pN'} :</SubLabel>
            <Select
              value={currentStadeN(formData)}
              options={availableN}
              formatOption={(n) => formatStadeN(n, !isEnPlace)}
              onChange={(n) => onChange((prev) => withStadeN(prev, n))}
              className={SMALL_SELECT}
            />
          </div>
        </div>

        {!isEnPlace && formData.stadePT === '2' && (
          <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800 space-y-1">
            <label className="font-bold text-amber-900 dark:text-amber-200 block text-[11px]">
              Taille tumeur (spécifique pT2) :
            </label>
            <TailleTumeurChoice
              compact
              value={formData.tailleTumeur ?? '< 3cm'}
              onChange={(tailleTumeur) => patch({ tailleTumeur })}
            />
          </div>
        )}
      </div>

      {(showMedianLine || !isEnPlace) && (
        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 shadow-2xs space-y-2.5">
          {showMedianLine && (
            <FieldRow title="Atteinte de la ligne médiane :" hint="Tumeur franchissant ou touchant la ligne médiane">
              <SegmentedControl
                compact
                value={formData.atteinteLigneMediane ?? false}
                options={INDIGO_NO_YES}
                onChange={(atteinteLigneMediane) => patch({ atteinteLigneMediane })}
              />
            </FieldRow>
          )}
          {!isEnPlace && (
            <FieldRow
              className={cx(showMedianLine && 'pt-2.5 border-t border-slate-100 dark:border-slate-700')}
              title="Reconstruction par lambeau :"
              hint="Chirurgie reconstructrice avec lambeau libre ou pédiculé"
            >
              <SegmentedControl
                compact
                value={formData.lambeau}
                options={INDIGO_NO_YES}
                onChange={(lambeau) => patch({ lambeau })}
              />
            </FieldRow>
          )}
        </div>
      )}

      {formData.localisation === 'Oropharynx' && (
        <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
          <FieldRow title="Statut HPV (p16) :" hint="Immunohistochimie / PCR (Spécifique Oropharynx)">
            <SegmentedControl
              compact
              value={formData.statutHPV}
              options={HPV_OPTIONS}
              onChange={(statutHPV) => onChange((prev) => withHPV(prev, statutHPV))}
            />
          </FieldRow>

          {isEnPlace && formData.statutHPV && formData.stadeN === '1' && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-1">
              <label className="font-bold text-teal-900 dark:text-teal-200 block text-[11px]">
                Nombre de ganglions envahis (Statut HPV+ & N1) :
              </label>
              <NbGanglionsChoice
                compact
                value={formData.nbGanglions ?? '1'}
                onChange={(nbGanglions) => patch({ nbGanglions })}
              />
            </div>
          )}
        </div>
      )}

      <div>
        <StepLabel>Histologie :</StepLabel>
        <Select
          value={formData.histologie}
          options={HISTOLOGIES}
          onChange={(histologie) => patch({ histologie })}
          className="text-xs font-semibold p-2 bg-white dark:bg-slate-800"
        />
      </div>

      {isEnPlace && (
        <FieldRow
          className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
          title="Chimiothérapie d'induction :"
          hint="Protocole TPF préalable"
        >
          <SegmentedControl
            compact
            value={formData.chimiotherapieInduction}
            options={yesNoOptions(INDIGO_ACTIVE)}
            onChange={(chimiotherapieInduction) => patch({ chimiotherapieInduction })}
          />
        </FieldRow>
      )}

      {!isEnPlace && (
        <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
          <span className="font-bold text-slate-800 dark:text-slate-200 block uppercase tracking-wider text-[11px]">
            Critères Histopathologiques Post-Op :
          </span>

          <div>
            <SubLabel>Marges de résection chirurgicale :</SubLabel>
            <Select
              value={formData.marges}
              options={MARGES_OPTIONS}
              onChange={(marges) => patch({ marges })}
              className="text-xs font-semibold p-2 rounded-lg"
            />
          </div>

          <div>
            <SubLabel>Effraction extra-capsulaire (ECE) :</SubLabel>
            <EceChoice
              compact
              value={formData.effractionExtraCapsulaire}
              onChange={(effractionExtraCapsulaire) => patch({ effractionExtraCapsulaire })}
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <ToggleRow
              label="Emboles vasculaires (LVI) :"
              value={formData.embolesVasculaires}
              onChange={(embolesVasculaires) => patch({ embolesVasculaires })}
            />
            <ToggleRow
              label="Engainement péri-nerveux (PNI) :"
              value={formData.engainementPerineuronal}
              onChange={(engainementPerineuronal) => patch({ engainementPerineuronal })}
            />
            <ToggleRow label="Pattern d'invasion agressif (WPI) :" value={formData.WPI} onChange={(WPI) => patch({ WPI })} />
          </div>
        </div>
      )}
    </div>
  );
};
