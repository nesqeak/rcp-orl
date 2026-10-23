import React from 'react';
import { UserCheck, Layers, ChevronRight, BookmarkCheck, Sparkles, ShieldAlert, Activity, GitFork } from 'lucide-react';
import { SavedCase } from '../types';

interface HomeMenuProps {
  onSelectAvisRcp: () => void;
  onSelectContouring: () => void;
  onSelectDecisionTree: () => void;
  savedCases: SavedCase[];
  onOpenSavedCase: (c: SavedCase) => void;
}

export const HomeMenu: React.FC<HomeMenuProps> = ({
  onSelectAvisRcp,
  onSelectContouring,
  onSelectDecisionTree,
  savedCases,
  onOpenSavedCase,
}) => {
  return (
    <div className="p-4 space-y-5 animate-fade-in max-w-md mx-auto">
      {/* Intro banner */}
      <div className="bg-gradient-to-br from-teal-800 to-slate-900 rounded-2xl p-4 text-white shadow-sm border border-teal-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-2 -mr-2 w-24 h-24 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-start justify-between relative z-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/20 text-teal-200 border border-teal-400/30 mb-2">
              <Activity className="w-3 h-3 text-teal-300" />
              Référentiel Oncologie ORL 2026
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Guide décisionnel & Contourages
            </h2>
            <p className="text-xs text-teal-100/80 mt-1 leading-relaxed">
              Assistant de poche pour réunions de concertation pluridisciplinaire (RCP) et planification de dose en radiothérapie cervico-faciale.
            </p>
          </div>
        </div>
      </div>

      {/* Main 2 choices requested */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          Menu Principal
        </h3>

        {/* Choice 1: Avis RCP */}
        <button
          onClick={onSelectAvisRcp}
          className="w-full text-left bg-white dark:bg-slate-800 rounded-2xl p-4 border border-teal-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-teal-500/50 active:scale-[0.99] transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-600 rounded-l-2xl" />
          <div className="flex items-center justify-between pl-2">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold shadow-inner group-hover:scale-105 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                  Avis RCP
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tumeur en place ou Traitement adjuvant (dose & potentialisation)
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:text-teal-600 group-hover:bg-teal-50 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </button>

        {/* Choice 2: Arbre décisionnel récapitulatif */}
        <button
          onClick={onSelectDecisionTree}
          className="w-full text-left bg-white dark:bg-slate-800 rounded-2xl p-4 border border-emerald-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-emerald-500/50 active:scale-[0.99] transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-600 rounded-l-2xl" />
          <div className="flex items-center justify-between pl-2">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold shadow-inner group-hover:scale-105 transition-transform">
                <GitFork className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    Arbre décisionnel
                  </h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Synthèse
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Vue d'ensemble par stade, histologie et situation (adjuvant vs en place)
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </button>

        {/* Choice 3: Recommandations de contourage */}
        <button
          onClick={onSelectContouring}
          className="w-full text-left bg-white dark:bg-slate-800 rounded-2xl p-4 border border-indigo-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-500/50 active:scale-[0.99] transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600 rounded-l-2xl" />
          <div className="flex items-center justify-between pl-2">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold shadow-inner group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                  Recommandations de contourage
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Volumes cibles (GTV/CTV), aires ganglionnaires & contraintes OAR
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </button>
      </div>

      {/* Saved cases preview if any */}
      {savedCases.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <BookmarkCheck className="w-4 h-4 text-amber-500" />
              Dossiers récents ({savedCases.length})
            </h3>
          </div>
          <div className="space-y-2">
            {savedCases.slice(0, 2).map((c) => (
              <div
                key={c.id}
                onClick={() => onOpenSavedCase(c)}
                className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:border-teal-500 transition shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {c.formData.localisation}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md font-medium">
                      {c.formData.situation === 'tumeur_en_place' ? 'Tumeur en place' : 'Adjuvant'}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-teal-700 dark:text-teal-400 mt-0.5 truncate max-w-[240px]">
                    {c.result.proposition}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Disclaimer */}
      <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2.5 text-amber-900 dark:text-amber-200 text-xs">
        <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-tight text-[11px]">
          Aide à la décision médicale destinée aux professionnels de santé. Chaque dossier doit être validé individuellement en réunion de concertation pluridisciplinaire (RCP).
        </p>
      </div>
    </div>
  );
};
