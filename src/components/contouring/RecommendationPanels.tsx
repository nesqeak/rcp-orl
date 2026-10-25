import React, { useState } from 'react';
import { BookOpen, CheckCircle2, ExternalLink, ScanLine, Search } from 'lucide-react';
import { ContouringEvaluationResult } from '../../utils/contouringEngine';
import { ArticleReference } from '../../data/references';
import { OAR_CONSTRAINTS } from '../../data/oarConstraints';
import { Cote } from '../../types';
import { ViewerVolumes } from '../../utils/viewerLink';
import { cx } from '../ui';

/** Classes Tailwind complètes par niveau de risque (les noms dynamiques ne sont pas détectés par Tailwind). */
const TONES = {
  rose: {
    border: 'border-rose-200 dark:border-rose-900/60',
    dot: 'bg-rose-500',
    title: 'text-rose-700 dark:text-rose-400',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    body: 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/50',
  },
  amber: {
    border: 'border-amber-200 dark:border-amber-900/60',
    dot: 'bg-amber-500',
    title: 'text-amber-700 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    body: 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50',
  },
  teal: {
    border: 'border-teal-200 dark:border-teal-900/60',
    dot: 'bg-teal-500',
    title: 'text-teal-700 dark:text-teal-400',
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
    body: 'bg-teal-50/60 dark:bg-teal-950/30 border-teal-100 dark:border-teal-900/50',
  },
  indigo: {
    border: 'border-indigo-200 dark:border-indigo-900/60',
    dot: 'bg-indigo-600',
    title: 'text-indigo-700 dark:text-indigo-400',
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
    body: 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/50',
  },
  emerald: {
    border: 'border-emerald-200 dark:border-emerald-900/60',
    dot: 'bg-emerald-500',
    title: 'text-emerald-700 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    body: 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50',
  },
};

interface VolumeCardProps {
  tone: keyof typeof TONES;
  title: React.ReactNode;
  badge?: React.ReactNode;
  pulse?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const VolumeCard: React.FC<VolumeCardProps> = ({ tone, title, badge, pulse, children, footer }) => {
  const t = TONES[tone];
  return (
    <div className={cx('bg-white dark:bg-slate-800 p-4 rounded-2xl border space-y-2 shadow-2xs', t.border)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={cx('w-3 h-3 rounded-full shrink-0', t.dot, pulse && 'animate-pulse')} />
          <h4 className={cx('text-xs font-extrabold uppercase tracking-wider', t.title)}>{title}</h4>
        </div>
        {badge && <span className={cx('text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0', t.badge)}>{badge}</span>}
      </div>
      <div
        className={cx(
          'text-xs text-slate-900 dark:text-slate-100 whitespace-pre-line leading-relaxed font-semibold p-3 rounded-xl border',
          t.body
        )}
      >
        {children}
      </div>
      {footer}
    </div>
  );
};

interface PanelProps {
  recs: ContouringEvaluationResult;
  isNasopharynx: boolean;
}

/** Onglet 1 : volumes cibles tumoraux (CTV T HR / IR / BR, ou niveau unique). */
export const TargetVolumesPanel: React.FC<PanelProps> = ({ recs, isNasopharynx }) => {
  if (recs.isLarynxEarlyStageSingleDose) {
    return (
      <VolumeCard
        tone="indigo"
        pulse
        title="CTV T (Niveau de dose unique)"
        badge={recs.larynxSingleDoseLabel || 'Radiothérapie'}
        footer={
          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">Règle de contourage spécifique :</span>
            <p>
              Pour les tumeurs en place du larynx Tis, T1 ou T2 N0, il n'y a qu'un niveau de dose et donc un seul CTV T
              (GTV T + 5mm étendu à l'ensemble du larynx), sans volume prophylactique IR ou BR séparé.
            </p>
          </div>
        }
      >
        {recs.ctvTHighRisk}
      </VolumeCard>
    );
  }

  const referential = isNasopharynx ? 'Consensus 2024' : 'RECORAD';

  return (
    <div className="space-y-3.5">
      <VolumeCard tone="rose" pulse title="CTV T Haut Risque (CTV_HR)" badge="66 - 70 Gy">
        {recs.ctvTHighRisk}
      </VolumeCard>

      {recs.ctvTInterRisk && (
        <VolumeCard tone="amber" title="CTV T Risque Intermédiaire (CTV_IR)" badge="60 - 64 Gy">
          {recs.ctvTInterRisk}
        </VolumeCard>
      )}

      {recs.ctvTLowRisk && (
        <VolumeCard
          tone="teal"
          title={`CTV T Bas Risque (CTV_BR / ${referential})`}
          badge="50 - 54 Gy"
          footer={
            recs.recoradInclusions.length > 0 && (
              <div className="mt-2 pt-2 border-t border-teal-100 dark:border-teal-900/40 text-[11px] space-y-1">
                <span className="font-bold text-teal-900 dark:text-teal-300">
                  {isNasopharynx
                    ? 'Zones anatomiques (Consensus 2024) à inclure dans le CTV T BR :'
                    : 'Zones anatomiques RECORAD à inclure dans le CTV T BR :'}
                </span>
                <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300 font-medium">
                  {recs.recoradInclusions.map((inc) => (
                    <li key={inc}>{inc}</li>
                  ))}
                </ul>
              </div>
            )
          }
        >
          {recs.ctvTLowRisk}
        </VolumeCard>
      )}
    </div>
  );
};

/** Onglet 2 : aires ganglionnaires (CTV N HR / IR / BR). */
export const NodalVolumesPanel: React.FC<PanelProps> = ({ recs, isNasopharynx }) => {
  if (recs.isLarynxEarlyStageSingleDose) {
    return (
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
            Aires Ganglionnaires (CTV N) : Non Indiqué
          </h4>
        </div>
        <div className="text-xs text-slate-800 dark:text-slate-200 font-medium bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 leading-relaxed">
          Il n'y a <strong>pas de CTV N</strong> dans cette situation (Larynx Tis, T1 ou T2 N0 : absence d’irradiation
          des aires ganglionnaires prophylactiques cervicales).
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      <VolumeCard tone="rose" title="CTV N Haut Risque" badge="Ganglions Thérapeutiques (GTVn)">
        {recs.ctvNHighRisk}
      </VolumeCard>

      {recs.ctvNInterRisk && (
        <VolumeCard tone="indigo" title="CTV N Risque Intermédiaire" badge="Relais de Drainage direct">
          {recs.ctvNInterRisk}
        </VolumeCard>
      )}

      <VolumeCard
        tone="emerald"
        title="CTV N Prophylactique (BR)"
        badge={isNasopharynx ? 'Consensus International Nasopharynx 2024' : 'Atlas DAHANCA / EORTC / Biau 2019'}
      >
        {recs.ctvNLowRisk}
      </VolumeCard>
    </div>
  );
};

/** Onglet 3 : contraintes de dose aux organes à risque. */
export const OarPanel: React.FC = () => {
  const [query, setQuery] = useState('');
  const q = query.toLowerCase();
  const oars = OAR_CONSTRAINTS.filter((oar) =>
    [oar.name, oar.notes, oar.doseLimit].some((text) => text.toLowerCase().includes(q))
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher un organe (ex. Parotide, Moelle, Cochlée...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white pl-9 pr-4 py-2.5 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-2xs"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
      </div>

      <div className="space-y-2.5">
        {oars.map((oar) => (
          <div
            key={oar.name}
            className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2 hover:border-indigo-300 transition"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{oar.name}</h4>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-0.5">
                  Toxicité : {oar.endpoint}
                </p>
              </div>
              <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-extrabold border border-indigo-200 dark:border-indigo-800 shrink-0">
                {oar.doseLimit}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-500">Note : </span>
              {oar.notes}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Articles de consensus correspondant au cas. */
export const ReferencesList: React.FC<{ articles: ArticleReference[] }> = ({ articles }) => (
  <div className="pt-4 space-y-4 border-t border-slate-200 dark:border-slate-800">
    <div className="flex items-center gap-2">
      <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
        Références Scientifiques & Articles de Consensus
      </h3>
    </div>

    <div className="space-y-4">
      {articles.map((article) => (
        <div
          key={article.id}
          className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3"
        >
          <div>
            <span className="inline-block px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 rounded-md text-[10px] font-bold mb-1 border border-indigo-200 dark:border-indigo-800">
              {article.badge}
            </span>
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug">{article.title}</h4>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{article.authorsOrJournal}</p>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            {article.summaryText}
          </p>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition active:scale-[0.98]"
          >
            <span>Consulter l'article sur la revue scientifique</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      ))}
    </div>
  </div>
);

interface ViewerLinkProps {
  url: string;
  /** null : aucun cas renseigné, la visionneuse affiche l'atlas complet. */
  volumes: ViewerVolumes | null;
  side: Cote;
}

/** Lien vers la visionneuse scanner, avec les volumes composites du cas quand il est renseigné. */
export const ViewerLink: React.FC<ViewerLinkProps> = ({ url, volumes, side }) => {
  const composites = volumes && [
    volumes.ctvPBr.length > 0 && `CTV_P_BR (${volumes.ctvPBr.length} sous-CTV)`,
    volumes.ctvNBr.length > 0 && `CTV_N_BR (${volumes.ctvNBr.length} niveaux)`,
  ].filter(Boolean);

  let description: string;
  if (!volumes) {
    description = 'Atlas complet des CTV tumoraux (Lapeyre 2005) et ganglionnaires (Grégoire 2014), des deux côtés.';
  } else if (composites && composites.length > 0) {
    description = `Volumes composites du cas, côté ${side.toLowerCase()} : ${composites.join(' et ')}.`;
  } else {
    description =
      'Aucun volume bas risque de ce cas n’a d’équivalent dans la visionneuse : elle affichera l’atlas complet.';
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3">
      <div className="flex items-center gap-2">
        <ScanLine className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          Visionneuse scanner
        </h3>
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>
      {volumes && volumes.missingLevels.length > 0 && (
        <p className="text-[11px] text-amber-700 dark:text-amber-400">
          Hors champ du scanner (arrêt au cricoïde) : niveau{volumes.missingLevels.length > 1 ? 'x' : ''}{' '}
          {volumes.missingLevels.join(', ')}.
        </p>
      )}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition active:scale-[0.98]"
      >
        <span>Ouvrir la visionneuse scanner</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
};
