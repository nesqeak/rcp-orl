import React from 'react';
import { Activity, CheckSquare, Square } from 'lucide-react';
import { BASE_NODAL_LEVELS, SubstructureOption } from '../../data/substructures';
import { cx } from '../ui';

const ChecklistHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  actionClassName: string;
}> = ({ icon, title, description, actionLabel, onAction, actionClassName }) => (
  <div className="flex items-center justify-between gap-2">
    <div>
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
        {icon}
        {title}
      </h3>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
    </div>
    <button type="button" onClick={onAction} className={cx('text-[11px] font-bold hover:underline shrink-0', actionClassName)}>
      {actionLabel}
    </button>
  </div>
);

interface SubstructureChecklistProps {
  substructures: SubstructureOption[];
  selected: string[];
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  isNasopharynx: boolean;
}

/** Sous-structures tumorales atteintes (T), décochées par défaut. */
export const SubstructureChecklist: React.FC<SubstructureChecklistProps> = ({
  substructures,
  selected,
  onToggle,
  onToggleAll,
  isNasopharynx,
}) => (
  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 shadow-xs space-y-3">
    <ChecklistHeader
      icon={<CheckSquare className="w-4 h-4 text-indigo-600" />}
      title="Sous-structures tumorales atteintes (T)"
      description={`Cochez les sous-localisations anatomiques pour préciser les inclusions ${
        isNasopharynx ? 'du Consensus 2024' : 'RECORAD'
      } (décochées par défaut).`}
      actionLabel={selected.length === substructures.length ? 'Tout décocher' : 'Tout cocher'}
      onAction={onToggleAll}
      actionClassName="text-indigo-600 dark:text-indigo-400"
    />

    <div className="grid grid-cols-1 gap-1.5 pt-1">
      {substructures.map((sub) => {
        const isChecked = selected.includes(sub.id);
        return (
          <button
            key={sub.id}
            type="button"
            role="checkbox"
            aria-checked={isChecked}
            onClick={() => onToggle(sub.id)}
            className={cx(
              'flex items-start gap-2.5 p-2.5 rounded-xl text-xs font-semibold text-left transition border',
              isChecked
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-950 dark:text-indigo-100 shadow-2xs'
                : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            )}
          >
            {isChecked ? (
              <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            ) : (
              <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">{sub.label}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal line-clamp-1">
                Inclusions : {sub.recoradBrInclusions.slice(0, 2).join(', ')}...
              </span>
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

interface NodalAreasChecklistProps {
  selected: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
}

const SIDES = [
  { suffix: 'Droit', short: 'D' },
  { suffix: 'Gauche', short: 'G' },
] as const;

/** Aires ganglionnaires envahies (N+) par côté, décochées par défaut. */
export const NodalAreasChecklist: React.FC<NodalAreasChecklistProps> = ({ selected, onToggle, onClear }) => (
  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 shadow-xs space-y-3">
    <ChecklistHeader
      icon={<Activity className="w-4 h-4 text-indigo-600" />}
      title="Aires ganglionnaires envahies (N+) par côté"
      description="Indiquez les relais ganglionnaires atteints par côté (D / G) à inclure dans le CTV N IR."
      actionLabel="Tout décocher"
      onAction={onClear}
      actionClassName="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
    />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
      {BASE_NODAL_LEVELS.map((level) => (
        <div
          key={level.id}
          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs"
        >
          <span className="font-bold text-slate-900 dark:text-white truncate pr-2">{level.label}</span>
          <div className="flex items-center gap-1.5 shrink-0">
            {SIDES.map(({ suffix, short }) => {
              const id = `${level.id} ${suffix}`;
              const isChecked = selected.includes(id);
              return (
                <button
                  key={suffix}
                  type="button"
                  onClick={() => onToggle(id)}
                  aria-pressed={isChecked}
                  className={cx(
                    'w-8 h-7 flex items-center justify-center rounded-lg font-extrabold text-xs transition border',
                    isChecked
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-indigo-400'
                  )}
                  title={`${level.label} (${suffix})`}
                >
                  {short}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  </div>
);
