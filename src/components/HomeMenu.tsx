import React from 'react';
import { Activity, BookmarkCheck, ChevronRight, GitFork, Layers, LucideIcon, ShieldAlert, UserCheck } from 'lucide-react';
import { SavedCase } from '../types';
import { situationLabel } from '../utils/format';

interface HomeMenuProps {
  onSelectAvisRcp: () => void;
  onSelectContouring: () => void;
  onSelectDecisionTree: () => void;
  savedCases: SavedCase[];
  onOpenSavedCase: (c: SavedCase) => void;
}

/** Classes Tailwind complètes par couleur (les noms dynamiques ne sont pas détectés par Tailwind). */
const MENU_COLORS = {
  teal: {
    border: 'border-teal-100 hover:border-teal-500/50',
    stripe: 'bg-teal-600',
    icon: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400',
    title: 'group-hover:text-teal-700 dark:group-hover:text-teal-400',
    chevron: 'group-hover:text-teal-600 group-hover:bg-teal-50',
  },
  emerald: {
    border: 'border-emerald-100 hover:border-emerald-500/50',
    stripe: 'bg-emerald-600',
    icon: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400',
    title: 'group-hover:text-emerald-700 dark:group-hover:text-emerald-400',
    chevron: 'group-hover:text-emerald-600 group-hover:bg-emerald-50',
  },
  indigo: {
    border: 'border-indigo-100 hover:border-indigo-500/50',
    stripe: 'bg-indigo-600',
    icon: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400',
    title: 'group-hover:text-indigo-700 dark:group-hover:text-indigo-400',
    chevron: 'group-hover:text-indigo-600 group-hover:bg-indigo-50',
  },
};

interface MenuItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: keyof typeof MENU_COLORS;
  badge?: string;
  onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon: Icon, title, description, color, badge, onClick }) => {
  const c = MENU_COLORS[color];
  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white dark:bg-slate-800 rounded-2xl p-4 border dark:border-slate-700 shadow-sm hover:shadow-md active:scale-[0.99] transition-all group relative overflow-hidden ${c.border}`}
    >
      <div className={`absolute top-0 left-0 w-1.5 h-full rounded-l-2xl ${c.stripe}`} />
      <div className="flex items-center justify-between pl-2">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform ${c.icon}`}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className={`text-base font-bold text-slate-900 dark:text-white transition-colors ${c.title}`}>{title}</h4>
              {badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
          </div>
        </div>
        <div
          className={`w-8 h-8 shrink-0 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors ${c.chevron}`}
        >
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </button>
  );
};

export const HomeMenu: React.FC<HomeMenuProps> = ({
  onSelectAvisRcp,
  onSelectContouring,
  onSelectDecisionTree,
  savedCases,
  onOpenSavedCase,
}) => (
  <div className="p-4 space-y-5 animate-fade-in max-w-md mx-auto">
    <div className="bg-gradient-to-br from-teal-800 to-slate-900 rounded-2xl p-4 text-white shadow-sm border border-teal-700/50 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-2 -mr-2 w-24 h-24 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />
      <div className="relative z-10">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/20 text-teal-200 border border-teal-400/30 mb-2">
          <Activity className="w-3 h-3 text-teal-300" />
          Référentiel Oncologie ORL 2026
        </span>
        <h2 className="text-xl font-bold tracking-tight text-white">Guide décisionnel & Contourages</h2>
        <p className="text-xs text-teal-100/80 mt-1 leading-relaxed">
          Assistant de poche pour réunions de concertation pluridisciplinaire (RCP) et planification de dose en
          radiothérapie cervico-faciale.
        </p>
      </div>
    </div>

    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">Menu Principal</h3>
      <MenuItem
        icon={UserCheck}
        color="teal"
        title="Avis RCP"
        description="Tumeur en place ou Traitement adjuvant (dose & potentialisation)"
        onClick={onSelectAvisRcp}
      />
      <MenuItem
        icon={GitFork}
        color="emerald"
        title="Arbre décisionnel"
        badge="Synthèse"
        description="Vue d'ensemble par stade, histologie et situation (adjuvant vs en place)"
        onClick={onSelectDecisionTree}
      />
      <MenuItem
        icon={Layers}
        color="indigo"
        title="Recommandations de contourage"
        description="Volumes cibles (GTV/CTV), aires ganglionnaires & contraintes OAR"
        onClick={onSelectContouring}
      />
    </div>

    {savedCases.length > 0 && (
      <div className="pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2 px-1">
          <BookmarkCheck className="w-4 h-4 text-amber-500" />
          Dossiers récents ({savedCases.length})
        </h3>
        <div className="space-y-2">
          {savedCases.slice(0, 2).map((c) => (
            <button
              key={c.id}
              onClick={() => onOpenSavedCase(c)}
              className="w-full text-left bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:border-teal-500 transition shadow-2xs"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">{c.formData.localisation}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md font-medium">
                    {situationLabel(c.formData.situation)}
                  </span>
                </div>
                <p className="text-xs font-medium text-teal-700 dark:text-teal-400 mt-0.5 truncate">
                  {c.result.proposition}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          ))}
        </div>
      </div>
    )}

    <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2.5 text-amber-900 dark:text-amber-200">
      <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <p className="leading-tight text-[11px]">
        Aide à la décision médicale destinée aux professionnels de santé. Chaque dossier doit être validé
        individuellement en réunion de concertation pluridisciplinaire (RCP).
      </p>
    </div>
  </div>
);
