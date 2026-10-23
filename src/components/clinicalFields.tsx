import React from 'react';
import { EffractionCapsulaire, NbGanglionsHpv, TailleTumeurT2 } from '../types';
import { ECE_ACTIVE_CLASS, ECE_OPTIONS } from '../data/options';
import { ChoiceGrid, SegmentOption } from './ui';

export const HPV_OPTIONS: SegmentOption<boolean>[] = [
  { value: true, label: 'Oui (Positif)', activeClass: 'bg-teal-600 text-white' },
  { value: false, label: 'Non (Négatif)', activeClass: 'bg-slate-700 text-white' },
];

const TAILLE_OPTIONS: { value: TailleTumeurT2; label: string }[] = [
  { value: '< 3cm', label: '< 3 cm' },
  { value: '≥ 3cm', label: '≥ 3 cm' },
];

const NB_GANGLIONS_OPTIONS: { value: NbGanglionsHpv; label: string }[] = [
  { value: '1', label: '1 seul ganglion' },
  { value: '2 et plus', label: '2 et plus' },
];

interface ChoiceProps<T> {
  value: T;
  onChange: (value: T) => void;
  compact?: boolean;
}

export const TailleTumeurChoice: React.FC<ChoiceProps<TailleTumeurT2>> = (props) => (
  <ChoiceGrid {...props} options={TAILLE_OPTIONS} activeClass="bg-amber-600 text-white border-amber-600 shadow-2xs" />
);

export const NbGanglionsChoice: React.FC<ChoiceProps<NbGanglionsHpv>> = (props) => (
  <ChoiceGrid {...props} options={NB_GANGLIONS_OPTIONS} activeClass="bg-teal-600 text-white border-teal-600 shadow-2xs" />
);

export const EceChoice: React.FC<ChoiceProps<EffractionCapsulaire>> = (props) => (
  <ChoiceGrid
    {...props}
    options={ECE_OPTIONS.map((ece) => ({ value: ece, label: ece }))}
    activeClass={(ece) => ECE_ACTIVE_CLASS[ece]}
    inactiveClass="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
  />
);
