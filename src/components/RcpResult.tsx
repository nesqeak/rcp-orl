import React, { useState } from 'react';
import {
  BookmarkPlus,
  Check,
  ChevronRight,
  Copy,
  FileText,
  GitFork,
  Info,
  Layers,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { EffractionCapsulaire, RcpFormData, RcpResultOutput } from '../types';
import { formatStage, hpvLabel, situationLabel, yesNo } from '../utils/format';
import { buildRcpReport } from '../utils/report';
import { cx } from './ui';

interface RcpResultProps {
  formData: RcpFormData;
  result: RcpResultOutput;
  onGoToContouring: () => void;
  onSaveCase: (patientRef?: string) => void;
  isSaved: boolean;
  onModifyForm: () => void;
  onOpenDecisionTree: () => void;
}

const DEFAULT_VALUE_CLASS = 'text-slate-800 dark:text-slate-200';

const ECE_VALUE_CLASS: Record<EffractionCapsulaire, string> = {
  Non: 'text-teal-600 dark:text-teal-400',
  Mineure: 'text-amber-600 dark:text-amber-400',
  Majeure: 'text-rose-600 dark:text-rose-400',
};

interface RecapItem {
  label: string;
  value: string;
  valueClass?: string;
  wide?: boolean;
}

function recapItems(formData: RcpFormData): RecapItem[] {
  const items: RecapItem[] = [
    { label: 'Situation', value: situationLabel(formData.situation) },
    { label: 'Stade', value: formatStage(formData) },
    {
      label: 'Statut HPV',
      value: hpvLabel(formData.statutHPV),
      valueClass: formData.statutHPV ? 'text-teal-600 dark:text-teal-400' : 'text-slate-700 dark:text-slate-300',
    },
    {
      label: 'Cisplatine',
      value: formData.cisplatineEligible ? 'Éligible' : 'Inéligible',
      valueClass: formData.cisplatineEligible ? 'text-emerald-600' : 'text-rose-600',
    },
    { label: 'Histologie', value: formData.histologie },
  ];

  if (formData.situation === 'adjuvant') {
    items.push(
      {
        label: 'Marges',
        value: formData.marges,
        valueClass: formData.marges === 'Envahies' ? 'text-rose-600 dark:text-rose-400' : undefined,
      },
      {
        label: 'Rupture capsulaire (RC / ECE)',
        value: formData.effractionExtraCapsulaire,
        valueClass: ECE_VALUE_CLASS[formData.effractionExtraCapsulaire],
        wide: true,
      }
    );
  } else {
    items.push({ label: "Chimio d'induction", value: yesNo(formData.chimiotherapieInduction) });
  }
  return items;
}

export const RcpResult: React.FC<RcpResultProps> = ({
  formData,
  result,
  onGoToContouring,
  onSaveCase,
  isSaved,
  onModifyForm,
  onOpenDecisionTree,
}) => {
  const [copied, setCopied] = useState(false);
  const [patientRef, setPatientRef] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(buildRcpReport(formData, result));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papier indisponible (contexte non sécurisé, permission refusée)
    }
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCase(patientRef.trim() || undefined);
    setShowSaveInput(false);
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4 pb-24 animate-fade-in">
      {/* Proposition thérapeutique */}
      <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-teal-950 text-white rounded-2xl p-5 shadow-lg border border-teal-700/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            Proposition Thérapeutique RCP
          </span>
          <span className="text-xs text-teal-200/80 font-medium">{formData.localisation}</span>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 my-3">
          <h3 className="text-lg font-extrabold text-white leading-tight tracking-tight">{result.proposition}</h3>
        </div>

        <div className="flex items-center gap-2 text-amber-300 bg-amber-500/15 px-3 py-2 rounded-lg border border-amber-400/30 text-xs font-semibold">
          <Info className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{result.inclusionEssaiNote}</span>
        </div>

        <div className="mt-4 pt-3 border-t border-teal-800/80 space-y-1.5 text-xs text-teal-100/90">
          <p className="font-bold text-teal-300 uppercase tracking-wider text-[10px]">Justification décisionnelle :</p>
          {result.justification.map((just) => (
            <p key={just} className="flex items-start gap-1.5 leading-relaxed">
              <span className="text-teal-400 font-bold">•</span>
              <span>{just}</span>
            </p>
          ))}
        </div>
      </div>

      <button
        onClick={onGoToContouring}
        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold p-4 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-between group active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold shadow-inner">
            <Layers className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-sm font-extrabold tracking-tight">Recommandations de contourage adaptées</div>
            <div className="text-xs text-indigo-100 font-normal">
              Voir volumes cibles (GTV/CTV) pour {result.recommendedLocalisation}
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>

      <button
        onClick={onOpenDecisionTree}
        className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl shadow-2xs transition-all flex items-center justify-between group active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold">
            <GitFork className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Comparer avec l'arbre décisionnel complet
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Visualiser toutes les alternatives selon le stade et l'histologie
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
      </button>

      {/* Récapitulatif du dossier */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-teal-600" />
            Récapitulatif du dossier
          </h4>
          <button
            onClick={onModifyForm}
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Modifier
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {recapItems(formData).map(({ label, value, valueClass, wide }) => (
            <div
              key={label}
              className={cx(
                'p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800',
                wide && 'col-span-2'
              )}
            >
              <span className="text-slate-400 block text-[10px] font-semibold">{label}</span>
              <span className={cx('font-bold', valueClass ?? DEFAULT_VALUE_CLASS)}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Copier / enregistrer */}
      <div className="flex gap-2">
        <button
          onClick={handleCopyReport}
          className="flex-1 py-3 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Copié dans le presse-papier !</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-500" />
              <span>Copier l'Avis RCP</span>
            </>
          )}
        </button>

        <button
          onClick={() => setShowSaveInput((prev) => !prev)}
          disabled={isSaved}
          className={cx(
            'flex-1 py-3 px-3 border rounded-xl text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition active:scale-[0.98]',
            isSaved
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-500 text-slate-800 dark:text-slate-200'
          )}
        >
          <BookmarkPlus className={cx('w-4 h-4', isSaved ? 'text-emerald-600' : 'text-amber-500')} />
          <span>{isSaved ? 'Dossier Enregistré' : 'Enregistrer le dossier'}</span>
        </button>
      </div>

      {showSaveInput && !isSaved && (
        <form
          onSubmit={handleSaveSubmit}
          className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 space-y-2 animate-fade-in"
        >
          <label htmlFor="patient-ref" className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
            Référence anonyme du patient (optionnel) :
          </label>
          <div className="flex gap-2">
            <input
              id="patient-ref"
              type="text"
              placeholder="Ex: Patient #4021 ou Initiales ML"
              value={patientRef}
              onChange={(e) => setPatientRef(e.target.value)}
              className="flex-1 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold shadow-2xs hover:bg-amber-700"
            >
              Sauvegarder
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
