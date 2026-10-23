import React, { useState } from 'react';
import { Activity, CheckCircle2, Edit3, Layers, ShieldCheck, Sliders, Zap } from 'lucide-react';
import { LocalisationENT, RcpFormData, RcpResultOutput, SituationType } from '../../types';
import { SUBSTRUCTURES_MAP } from '../../data/substructures';
import { STEREO_POST_OP_PROPOSITION } from '../../data/options';
import { computeContouringRecommendations } from '../../utils/contouringEngine';
import { cx } from '../ui';
import {
  currentStadeN,
  defaultCase,
  showsMedianLineChoice,
  toggleItem,
  withLocalisation,
  withSituation,
} from './caseState';
import { CaseSummary } from './CaseSummary';
import { CaseEditor } from './CaseEditor';
import { NodalAreasChecklist, SubstructureChecklist } from './Checklists';
import { NodalVolumesPanel, OarPanel, ReferencesList, TargetVolumesPanel } from './RecommendationPanels';

interface ContouringGuideProps {
  formData?: RcpFormData | null;
  rcpResult?: RcpResultOutput | null;
}

type Tab = 'volumes' | 'nodal' | 'oar';

export const ContouringGuide: React.FC<ContouringGuideProps> = ({
  formData: initialFormData,
  rcpResult,
}) => {
  const isStereoRecommended = rcpResult?.proposition === STEREO_POST_OP_PROPOSITION;

  const [formData, setFormData] = useState<RcpFormData>(() => initialFormData ?? defaultCase());
  const [isEditingSituation, setIsEditingSituation] = useState(!initialFormData);
  // Sous-structures T et aires ganglionnaires N sont décochées par défaut
  const [selectedSubstructures, setSelectedSubstructures] = useState<string[]>([]);
  const [isStereoPostOp, setIsStereoPostOp] = useState(
    () => initialFormData?.situation === 'adjuvant' && isStereoRecommended
  );
  const [activeTab, setActiveTab] = useState<Tab>('volumes');

  const handleSituationChange = (situation: SituationType) => {
    setFormData((prev) => withSituation(prev, situation));
    // La stéréotaxie post-opératoire ne concerne que la situation adjuvante
    setIsStereoPostOp(situation === 'adjuvant' && isStereoRecommended);
  };

  const handleLocalisationChange = (localisation: LocalisationENT) => {
    setFormData((prev) => withLocalisation(prev, localisation));
    setSelectedSubstructures([]);
  };

  const availableSubstructures = SUBSTRUCTURES_MAP[formData.localisation] ?? [];
  const toggleAllSubstructures = () =>
    setSelectedSubstructures((prev) =>
      prev.length === availableSubstructures.length ? [] : availableSubstructures.map((s) => s.id)
    );

  const recs = computeContouringRecommendations(formData, selectedSubstructures, isStereoPostOp);
  const isNasopharynx = formData.localisation === 'Nasopharynx';
  const isAdjuvant = formData.situation === 'adjuvant';
  const showMedianLine = showsMedianLineChoice(formData.localisation, selectedSubstructures);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'volumes',
      label: recs.isLarynxEarlyStageSingleDose ? 'Volume CTV T (Niveau unique)' : 'Volumes CTV T (HR/IR/BR)',
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    { id: 'nodal', label: 'Aires Ganglionnaires (CTV N)', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'oar', label: 'Contraintes OAR', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="p-4 max-w-md mx-auto space-y-4 pb-28 animate-fade-in">
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 shadow-md border border-indigo-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold tracking-tight text-white">Recommandations de Contourage</h2>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-indigo-500/30 text-indigo-200 rounded-full border border-indigo-400/30">
            {isAdjuvant ? 'Post-op / Adjuvant' : 'Tumeur en place'}
          </span>
        </div>
        <p className="text-xs text-indigo-200/80 mt-1">
          Volumes cibles GTV/CTV HR, IR, BR, aires ganglionnaires & contraintes de dose OAR.
        </p>
      </div>

      {/* Cas clinique (résumé + édition) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Situation Clinique : {formData.localisation}</span>
          </div>
          <button
            onClick={() => setIsEditingSituation((prev) => !prev)}
            aria-expanded={isEditingSituation}
            className="px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition flex items-center gap-1 border border-indigo-200 dark:border-indigo-800"
          >
            <Edit3 className="w-3 h-3" />
            {isEditingSituation ? 'Masquer le menu' : 'Modifier le cas'}
          </button>
        </div>

        <CaseSummary formData={formData} showMedianLine={showMedianLine} />

        {isEditingSituation && (
          <CaseEditor
            formData={formData}
            onChange={setFormData}
            onSituationChange={handleSituationChange}
            onLocalisationChange={handleLocalisationChange}
            showMedianLine={showMedianLine}
          />
        )}
      </div>

      {recs.isUnilateralIndication && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-400/50 flex items-start gap-3 shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-emerald-950 dark:text-emerald-200 block uppercase tracking-wider text-[11px]">
              Irradiation Cervicale Unilatérale
            </span>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium mt-0.5 leading-snug">
              {recs.unilateralReason}
            </p>
          </div>
        </div>
      )}

      {isAdjuvant && (
        <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-200 dark:border-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
              Indication Stéréo Post-Opératoire (36 Gy)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsStereoPostOp((prev) => !prev)}
            aria-pressed={isStereoPostOp}
            className={cx(
              'px-3 py-1 rounded-lg text-xs font-bold transition',
              isStereoPostOp
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
            )}
          >
            {isStereoPostOp ? 'ACTIVÉ' : 'DÉSACTIVÉ'}
          </button>
        </div>
      )}

      <SubstructureChecklist
        substructures={availableSubstructures}
        selected={selectedSubstructures}
        onToggle={(id) => setSelectedSubstructures((prev) => toggleItem(prev, id))}
        onToggleAll={toggleAllSubstructures}
        isNasopharynx={isNasopharynx}
      />

      {currentStadeN(formData) !== '0' && (
        <NodalAreasChecklist
          selected={formData.nodalAreas ?? []}
          onToggle={(id) => setFormData((prev) => ({ ...prev, nodalAreas: toggleItem(prev.nodalAreas ?? [], id) }))}
          onClear={() => setFormData((prev) => ({ ...prev, nodalAreas: [] }))}
        />
      )}

      <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            aria-pressed={activeTab === tab.id}
            className={cx(
              'flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5',
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'volumes' && <TargetVolumesPanel recs={recs} isNasopharynx={isNasopharynx} />}
      {activeTab === 'nodal' && <NodalVolumesPanel recs={recs} isNasopharynx={isNasopharynx} />}
      {activeTab === 'oar' && <OarPanel />}

      <ReferencesList articles={recs.articlesToDisplay} />
    </div>
  );
};
