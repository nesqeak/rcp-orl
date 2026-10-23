import React, { useState } from 'react';
import {
  SituationType,
  LocalisationENT,
  StadeT,
  StadeN,
  HistologieENT,
  MargesResection,
  EffractionCapsulaire,
  NbGanglionsHpv,
  TailleTumeurT2,
  RcpFormData,
} from '../types';
import { getAvailableStadesT, getAvailableStadesN } from '../utils/rcpDecisionEngine';
import { CheckCircle2, ChevronDown, Stethoscope, AlertCircle, Sparkles } from 'lucide-react';

interface RcpFormProps {
  onSubmit: (data: RcpFormData) => void;
  onCancel: () => void;
  initialData?: Partial<RcpFormData> | null;
}

const LOCALISATIONS: LocalisationENT[] = [
  'Nasopharynx',
  'Sinus de la face (hors ethmoïde)',
  'Sinus ethmoïde',
  'Fosses nasales',
  'Cavité buccale',
  'Oropharynx',
  'Hypopharynx',
  'Larynx',
  'Glande salivaire',
];

const HISTOLOGIES: HistologieENT[] = [
  'Carcinome épidermoïde',
  'ADK',
  'UCNT',
  'SNUC',
  'CAC',
  'autre',
];

export const RcpForm: React.FC<RcpFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [situation, setSituation] = useState<SituationType>(initialData?.situation || 'tumeur_en_place');

  // Shared fields
  const [localisation, setLocalisation] = useState<LocalisationENT>(initialData?.localisation || 'Oropharynx');
  const [statutHPV, setStatutHPV] = useState<boolean>(initialData?.statutHPV ?? false);
  const [histologie, setHistologie] = useState<HistologieENT>(initialData?.histologie || 'Carcinome épidermoïde');
  const [cisplatineEligible, setCisplatineEligible] = useState<boolean>(initialData?.cisplatineEligible ?? true);

  // Tumeur en place fields
  const [stadeT, setStadeT] = useState<StadeT>(
    (initialData && 'stadeT' in initialData && initialData.stadeT) ? initialData.stadeT : '2'
  );
  const [stadeN, setStadeN] = useState<StadeN>(
    (initialData && 'stadeN' in initialData && initialData.stadeN) ? initialData.stadeN : '1'
  );
  const [nbGanglions, setNbGanglions] = useState<NbGanglionsHpv>(
    (initialData && 'nbGanglions' in initialData && initialData.nbGanglions) ? initialData.nbGanglions : '1'
  );
  const [chimiotherapieInduction, setChimiotherapieInduction] = useState<boolean>(
    (initialData && 'chimiotherapieInduction' in initialData && initialData.chimiotherapieInduction) ?? false
  );

  // Adjuvant fields
  const [stadePT, setStadePT] = useState<StadeT>(
    (initialData && 'stadePT' in initialData && initialData.stadePT) ? initialData.stadePT : '2'
  );
  const [tailleTumeur, setTailleTumeur] = useState<TailleTumeurT2>(
    (initialData && 'tailleTumeur' in initialData && initialData.tailleTumeur) ? initialData.tailleTumeur : '< 3cm'
  );
  const [stadePN, setStadePN] = useState<StadeN>(
    (initialData && 'stadePN' in initialData && initialData.stadePN) ? initialData.stadePN : '0'
  );
  const [embolesVasculaires, setEmbolesVasculaires] = useState<boolean>(
    (initialData && 'embolesVasculaires' in initialData && initialData.embolesVasculaires) ?? false
  );
  const [engainementPerineuronal, setEngainementPerineuronal] = useState<boolean>(
    (initialData && 'engainementPerineuronal' in initialData && initialData.engainementPerineuronal) ?? false
  );
  const [WPI, setWPI] = useState<boolean>(
    (initialData && 'WPI' in initialData && initialData.WPI) ?? false
  );
  const [marges, setMarges] = useState<MargesResection>(
    (initialData && 'marges' in initialData && initialData.marges) ? initialData.marges : '> 5mm'
  );
  const [effractionExtraCapsulaire, setEffractionExtraCapsulaire] =
    useState<EffractionCapsulaire>(
      (initialData && 'effractionExtraCapsulaire' in initialData && initialData.effractionExtraCapsulaire) ? initialData.effractionExtraCapsulaire : 'Non'
    );
  const [lambeau, setLambeau] = useState<boolean>(
    (initialData && 'lambeau' in initialData && initialData.lambeau) ?? false
  );

  const availableStadesT = getAvailableStadesT(localisation);
  const availableStadesN = getAvailableStadesN(localisation, statutHPV, situation);

  const handleSituationChange = (newSituation: SituationType) => {
    setSituation(newSituation);
    const newAvailN = getAvailableStadesN(localisation, statutHPV, newSituation);
    if (newSituation === 'tumeur_en_place') {
      if (!newAvailN.includes(stadeN)) {
        setStadeN(newAvailN[0]);
      }
    } else {
      if (!newAvailN.includes(stadePN)) {
        setStadePN(newAvailN[0]);
      }
    }
  };

  const handleLocalisationChange = (newLoc: LocalisationENT) => {
    setLocalisation(newLoc);
    const newAvailT = getAvailableStadesT(newLoc);
    const newAvailN = getAvailableStadesN(newLoc, statutHPV, situation);

    if (situation === 'tumeur_en_place') {
      if (!newAvailT.includes(stadeT)) {
        setStadeT(newAvailT.includes('2') ? '2' : newAvailT[0]);
      }
      if (!newAvailN.includes(stadeN)) {
        setStadeN(newAvailN[0]);
      }
    } else {
      if (!newAvailT.includes(stadePT)) {
        setStadePT(newAvailT.includes('2') ? '2' : newAvailT[0]);
      }
      if (!newAvailN.includes(stadePN)) {
        setStadePN(newAvailN[0]);
      }
    }
  };

  const handleHPVChange = (newHPV: boolean) => {
    setStatutHPV(newHPV);
    const newAvailN = getAvailableStadesN(localisation, newHPV, situation);
    if (situation === 'tumeur_en_place') {
      if (!newAvailN.includes(stadeN)) {
        setStadeN(newAvailN[0]);
      }
    } else {
      if (!newAvailN.includes(stadePN)) {
        setStadePN(newAvailN[0]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (situation === 'tumeur_en_place') {
      const formData: RcpFormData = {
        situation: 'tumeur_en_place',
        localisation,
        stadeT,
        stadeN,
        statutHPV,
        nbGanglions: statutHPV && stadeN === '1' ? nbGanglions : undefined,
        histologie,
        cisplatineEligible,
        chimiotherapieInduction,
      };
      onSubmit(formData);
    } else {
      const formData: RcpFormData = {
        situation: 'adjuvant',
        localisation,
        stadePT,
        tailleTumeur: stadePT === '2' ? tailleTumeur : undefined,
        stadePN,
        statutHPV,
        histologie,
        cisplatineEligible,
        embolesVasculaires,
        engainementPerineuronal,
        WPI,
        marges,
        effractionExtraCapsulaire,
        lambeau,
      };
      onSubmit(formData);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4 pb-24">
      {/* Title */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-600" />
            Saisie Dossier RCP
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sélectionnez les caractéristiques anatomocliniques du patient
          </p>
        </div>
      </div>

      {/* Choice 1: Situation selection */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          1. Situation clinique initialement prise en charge
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleSituationChange('tumeur_en_place')}
            className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
              situation === 'tumeur_en_place'
                ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-600 text-teal-800 dark:text-teal-300 shadow-2xs ring-2 ring-teal-500/20'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <span className="text-sm font-bold">Tumeur en place</span>
            <span className="text-[10px] font-normal opacity-80 text-center">
              Radiothérapie définitive premier trait.
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSituationChange('adjuvant')}
            className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
              situation === 'adjuvant'
                ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-600 text-teal-800 dark:text-teal-300 shadow-2xs ring-2 ring-teal-500/20'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            <span className="text-sm font-bold">Traitement adjuvant</span>
            <span className="text-[10px] font-normal opacity-80 text-center">
              Post-opératoire (après résection)
            </span>
          </button>
        </div>
      </div>

      {/* Main Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Localisation */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Localisation tumorale
          </label>
          <div className="relative">
            <select
              value={localisation}
              onChange={(e) => handleLocalisationChange(e.target.value as LocalisationENT)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-sm rounded-xl p-3 appearance-none focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {LOCALISATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Staging T & N */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Classification TNM / pTNM
          </label>

          <div className="grid grid-cols-2 gap-3">
            {/* Stade T or pT */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Stade {situation === 'tumeur_en_place' ? 'T' : 'pT'}
              </label>
              <div className="relative">
                <select
                  value={situation === 'tumeur_en_place' ? stadeT : stadePT}
                  onChange={(e) =>
                    situation === 'tumeur_en_place'
                      ? setStadeT(e.target.value as StadeT)
                      : setStadePT(e.target.value as StadeT)
                  }
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-sm rounded-xl p-2.5 appearance-none focus:ring-2 focus:ring-teal-500"
                >
                  {availableStadesT.map((t) => (
                    <option key={t} value={t}>
                      {situation === 'tumeur_en_place'
                        ? (t === 'Tis' ? 'Tis' : `T${t}`)
                        : (t === 'Tis' ? 'pTis' : `pT${t}`)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Stade N or pN */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Stade {situation === 'tumeur_en_place' ? 'N' : 'pN'}
              </label>
              <div className="relative">
                <select
                  value={situation === 'tumeur_en_place' ? stadeN : stadePN}
                  onChange={(e) =>
                    situation === 'tumeur_en_place'
                      ? setStadeN(e.target.value as StadeN)
                      : setStadePN(e.target.value as StadeN)
                  }
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-sm rounded-xl p-2.5 appearance-none focus:ring-2 focus:ring-teal-500"
                >
                  {availableStadesN.map((n) => (
                    <option key={n} value={n}>
                      {situation === 'tumeur_en_place'
                        ? (n === 'X' ? 'NX' : `N${n}`)
                        : (n === 'X' ? 'pNX' : `pN${n}`)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Conditional field: If situation = Adjuvant AND pT = 2 */}
          {situation === 'adjuvant' && stadePT === '2' && (
            <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 space-y-1.5 animate-fade-in">
              <label className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                Taille de la tumeur (spécifique pT2) :
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTailleTumeur('< 3cm')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border ${
                    tailleTumeur === '< 3cm'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  &lt; 3 cm
                </button>
                <button
                  type="button"
                  onClick={() => setTailleTumeur('≥ 3cm')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border ${
                    tailleTumeur === '≥ 3cm'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  ≥ 3 cm
                </button>
              </div>
            </div>
          )}
        </div>

        {/* HPV status & conditional node count */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Statut HPV (p16)
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Recherche par immunohistochimie / PCR
              </p>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => handleHPVChange(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  statutHPV
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Oui (Positif)
              </button>
              <button
                type="button"
                onClick={() => handleHPVChange(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  !statutHPV
                    ? 'bg-slate-700 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Non (Négatif)
              </button>
            </div>
          </div>

          {/* Conditional field for Tumeur en place: HPV positif AND Stade N == 1 */}
          {situation === 'tumeur_en_place' && statutHPV && stadeN === '1' && (
            <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 space-y-1.5 animate-fade-in">
              <label className="text-xs font-bold text-teal-900 dark:text-teal-200 block">
                Nombre de ganglions envahis (Statut HPV+ & N1) :
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNbGanglions('1')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border ${
                    nbGanglions === '1'
                      ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  1 seul ganglion
                </button>
                <button
                  type="button"
                  onClick={() => setNbGanglions('2 et plus')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border ${
                    nbGanglions === '2 et plus'
                      ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  2 et plus
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Histologie */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Histologie
          </label>
          <div className="relative">
            <select
              value={histologie}
              onChange={(e) => setHistologie(e.target.value as HistologieENT)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-sm rounded-xl p-3 appearance-none focus:ring-2 focus:ring-teal-500"
            >
              {HISTOLOGIES.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Medical Eligibility & Chemo */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Éligibilité aux traitements généraux
          </label>

          {/* Cisplatine */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Patient éligible au Cisplatine
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Clairance créat &gt; 60 mL/min, audition & neurologie préservées
                {situation === 'adjuvant' && histologie !== 'Carcinome épidermoïde' && (
                  <span className="block text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                    (En adjuvant, la potentialisation par cisplatine ne s'applique qu'aux carcinomes épidermoïdes)
                  </span>
                )}
              </p>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
              <button
                type="button"
                onClick={() => setCisplatineEligible(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  cisplatineEligible
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Oui
              </button>
              <button
                type="button"
                onClick={() => setCisplatineEligible(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  !cisplatineEligible
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Non
              </button>
            </div>
          </div>

          {/* If Tumeur en place: Chimiothérapie d'induction */}
          {situation === 'tumeur_en_place' && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Chimiothérapie d'induction réalisée
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Protocole TPF préalable
                </p>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                <button
                  type="button"
                  onClick={() => setChimiotherapieInduction(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    chimiotherapieInduction
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Oui
                </button>
                <button
                  type="button"
                  onClick={() => setChimiotherapieInduction(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    !chimiotherapieInduction
                      ? 'bg-slate-700 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Non
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Specific Adjuvant Criteria */}
        {situation === 'adjuvant' && (
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-fade-in">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Critères Histopathologiques Post-Opératoires
            </label>

            {/* Marges de résection */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Marges de résection chirurgicale :
              </label>
              <div className="relative">
                <select
                  value={marges}
                  onChange={(e) => setMarges(e.target.value as MargesResection)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-xs rounded-xl p-2.5 appearance-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Envahies">Envahies (R1/R2)</option>
                  <option value="Envahies mais recoupe négative">
                    Envahies mais recoupe extemporanée négative
                  </option>
                  <option value="< 5mm">&lt; 5 mm (Marges étroites)</option>
                  <option value="> 5mm">&gt; 5 mm (Marges saines)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Effraction / Rupture extra-capsulaire */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Rupture capsulaire (RC) / Effraction extra-capsulaire (ECE) ganglionnaire :
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Non', 'Mineure', 'Majeure'] as EffractionCapsulaire[]).map((ece) => (
                  <button
                    key={ece}
                    type="button"
                    onClick={() => setEffractionExtraCapsulaire(ece)}
                    className={`py-2 px-2 rounded-lg text-xs font-bold border ${
                      effractionExtraCapsulaire === ece
                        ? ece === 'Majeure'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : ece === 'Mineure'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-teal-600 text-white border-teal-600'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {ece}
                  </button>
                ))}
              </div>
            </div>

            {/* Binary Toggles for Adjuvant */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-700">
              {/* Emboles vasculaires */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  Emboles vasculaires (LVI)
                </span>
                <button
                  type="button"
                  onClick={() => setEmbolesVasculaires(!embolesVasculaires)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                    embolesVasculaires
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {embolesVasculaires ? 'Oui' : 'Non'}
                </button>
              </div>

              {/* Engainement peri-nerveux */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  Engainement péri-nerveux (PNI)
                </span>
                <button
                  type="button"
                  onClick={() => setEngainementPerineuronal(!engainementPerineuronal)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                    engainementPerineuronal
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {engainementPerineuronal ? 'Oui' : 'Non'}
                </button>
              </div>

              {/* WPI */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  Pattern d'invasion agressif (WPI)
                </span>
                <button
                  type="button"
                  onClick={() => setWPI(!WPI)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                    WPI
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {WPI ? 'Oui' : 'Non'}
                </button>
              </div>

              {/* Lambeau */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  Reconstruction par lambeau
                </span>
                <button
                  type="button"
                  onClick={() => setLambeau(!lambeau)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                    lambeau
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {lambeau ? 'Oui' : 'Non'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submit Actions */}
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
