import React from 'react';
import { ChevronDown } from 'lucide-react';

export const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');

export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={cx('bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700', className)}>
    {children}
  </div>
);

export const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">{children}</label>
);

interface SelectProps<T extends string> {
  value: T;
  options: readonly (T | { value: T; label: string })[];
  onChange: (value: T) => void;
  className?: string;
  formatOption?: (value: T) => string;
}

export function Select<T extends string>({ value, options, onChange, className, formatOption }: SelectProps<T>) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={cx(
          'w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium rounded-xl pr-8 appearance-none focus:ring-2 focus:ring-teal-500 focus:outline-none',
          className ?? 'text-sm p-3'
        )}
      >
        {options.map((option) => {
          const { value: v, label } = typeof option === 'string' ? { value: option, label: undefined } : option;
          return (
            <option key={v} value={v}>
              {label ?? formatOption?.(v) ?? v}
            </option>
          );
        })}
      </select>
      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

export interface SegmentOption<T> {
  value: T;
  label: React.ReactNode;
  /** Classes appliquées au segment sélectionné. */
  activeClass?: string;
}

interface SegmentedControlProps<T> {
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
  compact?: boolean;
}

/** Sélecteur en « pilule » (ex. Oui / Non). */
export function SegmentedControl<T>({ value, options, onChange, compact }: SegmentedControlProps<T>) {
  return (
    <div
      className={cx(
        'flex bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-700 shrink-0',
        compact ? 'rounded-lg' : 'rounded-xl'
      )}
    >
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={option.value === value}
          className={cx(
            'px-3 text-xs font-bold transition',
            compact ? 'py-1 rounded-md' : 'py-1.5 rounded-lg',
            option.value === value
              ? cx(option.activeClass ?? 'bg-teal-600 text-white', 'shadow-2xs')
              : 'text-slate-600 dark:text-slate-400'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** Options Oui / Non, avec couleurs actives personnalisables. */
export function yesNoOptions(yesClass?: string, noClass = 'bg-slate-700 text-white'): SegmentOption<boolean>[] {
  return [
    { value: true, label: 'Oui', activeClass: yesClass },
    { value: false, label: 'Non', activeClass: noClass },
  ];
}

interface ChoiceGridProps<T extends string> {
  value: T;
  options: readonly { value: T; label: React.ReactNode }[];
  onChange: (value: T) => void;
  activeClass: string | ((value: T) => string);
  inactiveClass?: string;
  compact?: boolean;
}

/** Grille de boutons à choix unique (taille tumorale, nombre de ganglions, ECE...). */
export function ChoiceGrid<T extends string>({
  value,
  options,
  onChange,
  activeClass,
  inactiveClass = 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  compact,
}: ChoiceGridProps<T>) {
  return (
    <div
      className={cx('grid', options.length === 3 ? 'grid-cols-3' : 'grid-cols-2', compact ? 'gap-1.5' : 'gap-2')}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={option.value === value}
          className={cx(
            'font-bold text-xs border transition',
            compact ? 'py-1.5 px-2 rounded-md' : 'py-2 px-3 rounded-lg',
            option.value === value
              ? typeof activeClass === 'function'
                ? activeClass(option.value)
                : activeClass
              : inactiveClass
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  activeClass?: string;
}

/** Ligne « libellé + bouton Oui/Non » basculant au clic. */
export const ToggleRow: React.FC<ToggleRowProps> = ({
  label,
  value,
  onChange,
  activeClass = 'bg-rose-600 text-white border-rose-600',
}) => (
  <div className="flex items-center justify-between">
    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{label}</span>
    <button
      type="button"
      onClick={() => onChange(!value)}
      aria-pressed={value}
      className={cx(
        'px-3 py-1 rounded-lg text-xs font-bold border transition',
        value
          ? activeClass
          : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
      )}
    >
      {value ? 'Oui' : 'Non'}
    </button>
  </div>
);

interface FieldRowProps {
  title: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** Ligne « titre + aide » à gauche, contrôle à droite. */
export const FieldRow: React.FC<FieldRowProps> = ({ title, hint, children, className }) => (
  <div className={cx('flex items-center justify-between gap-3', className)}>
    <div>
      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{title}</span>
      {hint && <div className="text-[11px] text-slate-500 dark:text-slate-400">{hint}</div>}
    </div>
    {children}
  </div>
);
