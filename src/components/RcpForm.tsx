import React, { useState } from 'react';
import { CheckCircle2, Stethoscope } from 'lucide-react';
import {
  EffractionCapsulaire,
  HistologieENT,
  LocalisationENT,
  MargesResection,
  NbGanglionsHpv,
  RcpFormData,
  SituationType,
  StadeN,
  StadeT,
  TailleTumeurT2,
} from '../types';
import { getAvailableStadesN, getAvailableStadesT, pickAvailableStade } from '../utils/rcpDecisionEngine';
import { formatStadeN, formatStadeT } from '../utils/format';
import { HISTOLOGIES, LOCALISATIONS, MARGES_OPTIONS } from '../data/options';
import { Card, FieldRow, SectionLabel, SegmentedControl, Select, ToggleRow, cx, yesNoOptions } from './ui';
import { EceChoice, HPV_OPTIONS, NbGanglionsChoice, TailleTumeurChoice } from './clinicalFields';

interface RcpFormProps {
  onSubmit: (data: RcpFormData) => void;
  onCancel: () => void;
  initialData?: Partial<RcpFormData> | null;
}

/** Tous les champs du formulaire, quelle que soit la situation clinique. */
interface FormState {
  situation: SituationType;
  localisation: LocalisationENT;
  statutHPV: boolean;
  histologie: HistologieENT;
  cisplatineEligible: boolean;
  // Tumeur en place
  stadeT: StadeT;
  stadeN: StadeN;
  nbGanglions: NbGanglionsHpv;
  chimiotherapieInduction: boolean;
  // Adjuvant
  stadePT: StadeT;
  tailleTumeur: TailleTumeurT2;
  stadePN: StadeN;
  embolesVasculaires: boolean;
  engainementPerineuronal: boolean;
  WPI: boolean;
  marges: MargesResection;
  effractionExtraCapsulaire: EffractionCapsulaire;
  lambeau: boolean;
}

const DEFAULT_STATE: FormState = {
  situation: 'tumeur_en_place',
  localisation: 'Oropharynx',
  statutHPV: false,
  histologie: 'Carcinome épidermoïde',
  cisplatineEligible: true,
  stadeT: '2',
  stadeN: '1',
  nbGanglions: '1',
  chimiotherapieInduction: false,
  stadePT: '2',
  tailleTumeur: '< 3cm',
  stadePN: '0',
  embolesVasculaires: false,
  engainementPerineuronal: false,
  WPI: false,
  marges: '> 5mm',
  effractionExtraCapsulaire: 'Non',
  lambeau: false,
};

function initialState(initialData?: Partial<RcpFormData> | null): FormState {
  const state = { ...DEFAULT_STATE };
  if (initialData) {
    for (const key of Object.keys(DEFAULT_STATE) as (keyof FormState)[]) {
      const value = (initialData as Partial<FormState>)[key];
      if (value !== undefined) (state as Record<keyof FormState, unknown>)[key] = value;
    }
  }
  return state;
}

/** Ramène les stades de la situation active dans la liste des stades disponibles. */
function normalizeStades(state: FormState): FormState {
  const availableT = getAvailableStadesT(state.localisation);
  const availableN = getAvailableStadesN(state.localisation, state.statutHPV, state.situation);
  return state.situation === 'tumeur_en_place'
    ? {
        ...state,
        stadeT: pickAvailableStade(state.stadeT, availableT, '2'),
        stadeN: pickAvailableStade(state.stadeN, availableN),
      }
    : {
        ...state,
        stadePT: pickAvailableStade(state.stadePT, availableT, '2'),
        stadePN: pickAvailableStade(state.stadePN, availableN),
      };
}

function toFormData(s: FormState): RcpFormData {
  const common = {
    localisation: s.localisation,
    statutHPV: s.statutHPV,
    histologie: s.histologie,
    cisplatineEligible: s.cisplatineEligible,
  };
  if (s.situation === 'tumeur_en_place') {
    return {
      situation: 'tumeur_en_place',
      ...common,
      stadeT: s.stadeT,
      stadeN: s.stadeN,
      nbGanglions: s.statutHPV && s.stadeN === '1' ? s.nbGanglions : undefined,
      chimiotherapieInduction: s.chimiotherapieInduction,
    };
  }
  return {
    situation: 'adjuvant',
    ...common,
    stadePT: s.stadePT,
    tailleTumeur: s.stadePT === '2' ? s.tailleTumeur : undefined,
    stadePN: s.stadePN,
    embolesVasculaires: s.embolesVasculaires,
    engainementPerineuronal: s.engainementPerineuronal,
    WPI: s.WPI,
    marges: s.marges,
    effractionExtraCapsulaire: s.effractionExtraCapsulaire,
    lambeau: s.lambeau,
  };
}

const SITUATIONS: { value: SituationType; title: string; subtitle: string }[] = [
  { value: 'tumeur_en_place', title: 'Tumeur en place', subtitle: 'Radiothérapie définitive premier trait.' },
  { value: 'adjuvant', title: 'Traitement adjuvant', subtitle: 'Post-opératoire (après résection)' },
];

export const RcpForm: React.FC<RcpFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [state, setState] = useState<FormState>(() => normalizeStades(initialState(initialData)));
  const update = (patch: Partial<FormState>) => setState((prev) => normalizeStades({ ...prev, ...patch }));

  const isEnPlace = state.situation === 'tumeur_en_place';
  const isPathologic = !isEnPlace;
  const stadeT = isEnPlace ? state.stadeT : state.stadePT;
  const stadeN = isEnPlace ? state.stadeN : state.stadePN;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(toFormData(state));
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4 pb-24">
      <Card className="shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-teal-600" />
          Saisie Dossier RCP
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Sélectionnez les caractéristiques anatomocliniques du patient
        </p>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="space-y-3">
          <SectionLabel>1. Situation clinique initialement prise en charge</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {SITUATIONS.map(({ value, title, subtitle }) => (
              <button
                key={value}
                type="button"
                onClick={() => update({ situation: value })}
                aria-pressed={state.situation === value}
                className={cx(
                  'p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all',
                  state.situation === value
                    ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-600 text-teal-800 dark:text-teal-300 shadow-2xs ring-2 ring-teal-500/20'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                )}
              >
                <span className="text-sm font-bold">{title}</span>
                <span className="text-[10px] font-normal opacity-80 text-center">{subtitle}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="space-y-1.5">
          <SectionLabel>Localisation tumorale</SectionLabel>
          <Select
            value={state.localisation}
            options={LOCALISATIONS}
            onChange={(localisation) => update({ localisation })}
          />
        </Card>

        <Card className="space-y-3">
          <SectionLabel>Classification TNM / pTNM</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Stade {isPathologic ? 'pT' : 'T'}
              </label>
              <Select
                value={stadeT}
                options={getAvailableStadesT(state.localisation)}
                formatOption={(t) => formatStadeT(t, isPathologic)}
                onChange={(t) => update(isEnPlace ? { stadeT: t } : { stadePT: t })}
                className="text-sm font-semibold p-2.5"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Stade {isPathologic ? 'pN' : 'N'}
              </label>
              <Select
                value={stadeN}
                options={getAvailableStadesN(state.localisation, state.statutHPV, state.situation)}
                formatOption={(n) => formatStadeN(n, isPathologic)}
                onChange={(n) => update(isEnPlace ? { stadeN: n } : { stadePN: n })}
                className="text-sm font-semibold p-2.5"
              />
            </div>
          </div>

          {!isEnPlace && state.stadePT === '2' && (
            <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 space-y-1.5 animate-fade-in">
              <label className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                Taille de la tumeur (spécifique pT2) :
              </label>
              <TailleTumeurChoice value={state.tailleTumeur} onChange={(tailleTumeur) => update({ tailleTumeur })} />
            </div>
          )}
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <SectionLabel>Statut HPV (p16)</SectionLabel>
              <p className="text-xs text-slate-500 dark:text-slate-400">Recherche par immunohistochimie / PCR</p>
            </div>
            <SegmentedControl
              value={state.statutHPV}
              options={HPV_OPTIONS}
              onChange={(statutHPV) => update({ statutHPV })}
            />
          </div>

          {isEnPlace && state.statutHPV && state.stadeN === '1' && (
            <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 space-y-1.5 animate-fade-in">
              <label className="text-xs font-bold text-teal-900 dark:text-teal-200 block">
                Nombre de ganglions envahis (Statut HPV+ & N1) :
              </label>
              <NbGanglionsChoice value={state.nbGanglions} onChange={(nbGanglions) => update({ nbGanglions })} />
            </div>
          )}
        </Card>

        <Card className="space-y-1.5">
          <SectionLabel>Histologie</SectionLabel>
          <Select value={state.histologie} options={HISTOLOGIES} onChange={(histologie) => update({ histologie })} />
        </Card>

        <Card className="space-y-3">
          <SectionLabel>Éligibilité aux traitements généraux</SectionLabel>
          <FieldRow
            className="pt-1"
            title="Patient éligible au Cisplatine"
            hint={
              <>
                Clairance créat &gt; 60 mL/min, audition & neurologie préservées
                {!isEnPlace && state.histologie !== 'Carcinome épidermoïde' && (
                  <span className="block text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                    (En adjuvant, la potentialisation par cisplatine ne s'applique qu'aux carcinomes épidermoïdes)
                  </span>
                )}
              </>
            }
          >
            <SegmentedControl
              value={state.cisplatineEligible}
              options={yesNoOptions('bg-teal-600 text-white', 'bg-rose-600 text-white')}
              onChange={(cisplatineEligible) => update({ cisplatineEligible })}
            />
          </FieldRow>

          {isEnPlace && (
            <FieldRow
              className="pt-2 border-t border-slate-100 dark:border-slate-700"
              title="Chimiothérapie d'induction réalisée"
              hint="Protocole TPF préalable"
            >
              <SegmentedControl
                value={state.chimiotherapieInduction}
                options={yesNoOptions('bg-indigo-600 text-white')}
                onChange={(chimiotherapieInduction) => update({ chimiotherapieInduction })}
              />
            </FieldRow>
          )}
        </Card>

        {!isEnPlace && (
          <Card className="space-y-4 animate-fade-in">
            <SectionLabel>Critères Histopathologiques Post-Opératoires</SectionLabel>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Marges de résection chirurgicale :
              </label>
              <Select
                value={state.marges}
                options={MARGES_OPTIONS}
                onChange={(marges) => update({ marges })}
                className="text-xs p-2.5"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Rupture capsulaire (RC) / Effraction extra-capsulaire (ECE) ganglionnaire :
              </label>
              <EceChoice
                value={state.effractionExtraCapsulaire}
                onChange={(effractionExtraCapsulaire) => update({ effractionExtraCapsulaire })}
              />
            </div>

            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-700">
              <ToggleRow
                label="Emboles vasculaires (LVI)"
                value={state.embolesVasculaires}
                onChange={(embolesVasculaires) => update({ embolesVasculaires })}
              />
              <ToggleRow
                label="Engainement péri-nerveux (PNI)"
                value={state.engainementPerineuronal}
                onChange={(engainementPerineuronal) => update({ engainementPerineuronal })}
              />
              <ToggleRow label="Pattern d'invasion agressif (WPI)" value={state.WPI} onChange={(WPI) => update({ WPI })} />
              <ToggleRow
                label="Reconstruction par lambeau"
                value={state.lambeau}
                onChange={(lambeau) => update({ lambeau })}
                activeClass="bg-indigo-600 text-white border-indigo-600"
              />
            </div>
          </Card>
        )}

        <div className="pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-1/3 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="w-2/3 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Valider et Calculer
          </button>
        </div>
      </form>
    </div>
  );
};
