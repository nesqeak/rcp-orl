import React, { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, ChevronDown, ChevronRight, Filter, GitFork, Search, ShieldAlert } from 'lucide-react';
import { RcpFormData, SituationType } from '../types';
import { DECISION_TREE_NODES, DEFAULT_EXPANDED_NODE_IDS, TreeNode } from '../data/decisionTree';
import { cx } from './ui';

interface DecisionTreeProps {
  onSelectCase: (presetData: Partial<RcpFormData>) => void;
}

type SituationFilter = 'all' | SituationType;
type HistologyFilter = 'all' | 'epidermoide' | 'non_epidermoide';

const SITUATION_FILTERS: { value: SituationFilter; label: string; activeClass: string; hoverClass: string }[] = [
  {
    value: 'all',
    label: 'Toutes situations',
    activeClass: 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white',
    hoverClass: 'hover:text-slate-900',
  },
  { value: 'adjuvant', label: 'Adjuvant (Post-op)', activeClass: 'bg-teal-600 text-white', hoverClass: 'hover:text-teal-600' },
  {
    value: 'tumeur_en_place',
    label: 'Tumeur en place',
    activeClass: 'bg-indigo-600 text-white',
    hoverClass: 'hover:text-indigo-600',
  },
];

const SECTIONS: { situation: SituationType; title: string; dotClass: string; borderClass: string; emptyText: string }[] = [
  {
    situation: 'adjuvant',
    title: 'SITUATION ADJUVANTE (POST-OPÉRATOIRE)',
    dotClass: 'bg-teal-600',
    borderClass: 'border-teal-200 dark:border-teal-900/60',
    emptyText: 'Aucune indication adjuvante ne correspond aux filtres actuels.',
  },
  {
    situation: 'tumeur_en_place',
    title: 'TUMEUR EN PLACE (TRAITEMENT DÉFINITIF)',
    dotClass: 'bg-indigo-600',
    borderClass: 'border-indigo-200 dark:border-indigo-900/60',
    emptyText: 'Aucune indication en place ne correspond aux filtres actuels.',
  },
];

function matchesSearch(node: TreeNode, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [node.title, node.condition, node.prescription, node.rationale, ...node.keyRules].some((text) =>
    text.toLowerCase().includes(q)
  );
}

export const DecisionTree: React.FC<DecisionTreeProps> = ({ onSelectCase }) => {
  const [activeSituation, setActiveSituation] = useState<SituationFilter>('all');
  const [histologyFilter, setHistologyFilter] = useState<HistologyFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(DEFAULT_EXPANDED_NODE_IDS));

  const toggleNode = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const filteredNodes = useMemo(
    () =>
      DECISION_TREE_NODES.filter(
        (node) =>
          (activeSituation === 'all' || node.situation === activeSituation) &&
          !(histologyFilter === 'non_epidermoide' && node.epidermoidOnly) &&
          matchesSearch(node, searchQuery)
      ),
    [activeSituation, histologyFilter, searchQuery]
  );

  const visibleSections = SECTIONS.filter((s) => activeSituation === 'all' || activeSituation === s.situation);

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6 pb-24 animate-fade-in">
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white rounded-2xl p-5 shadow-sm border border-teal-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-200 border border-teal-400/30">
                <GitFork className="w-3.5 h-3.5" />
                Arbre Décisionnel Interactif
              </span>
              <span className="text-xs px-2 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">Référentiel 2026</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Synthèse des Indications & Doses</h2>
            <p className="text-xs text-teal-100/80 mt-1 max-w-xl">
              Cartographie complète selon la situation (adjuvante vs en place), le stade T/N, l’histologie, les marges
              chirurgicales et l’éligibilité au cisplatine.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {[
              { label: 'Tout déplier', onClick: () => setExpandedIds(new Set(DECISION_TREE_NODES.map((n) => n.id))) },
              { label: 'Tout replier', onClick: () => setExpandedIds(new Set()) },
            ].map(({ label, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className="text-xs px-2.5 py-1.5 bg-teal-800/80 hover:bg-teal-700 rounded-lg text-teal-100 transition border border-teal-600/40"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-xl p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-950 dark:text-amber-100">
            Règles d’or de prescription (Doses & Potentialisations) :
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-amber-800 dark:text-amber-300/90 text-[11px]">
            <li>
              <strong>Haut risque adjuvant (R1/R2 ou RC majeure) :</strong> Dose = <strong>66 Gy</strong> si
              potentialisée par cisplatine, ou <strong>63.6 Gy</strong> sans cisplatine.
            </li>
            <li>
              <strong>Cisplatine de potentialisation en adjuvant :</strong> Strictement réservé aux{' '}
              <strong>carcinomes épidermoïdes</strong>. Toute autre histologie (CAC, ADK, etc.) reçoit une radiothérapie
              seule sans chimiothérapie.
            </li>
            <li>
              <strong>Stéréotaxie post-opératoire (36 Gy) :</strong> Réservée à la{' '}
              <strong>Cavité buccale ou Oropharynx STRICTEMENT</strong>, impérativement{' '}
              <strong>pN0 et sans embols vasculaires</strong> : pT2 ≥ 3 cm avec marges &gt; 5 mm, ou pT1/pT2 &lt; 3 cm
              avec marges &lt; 5 mm, recoupe négative ou <strong>marges R1/R2</strong>.
            </li>
          </ul>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {SITUATION_FILTERS.map(({ value, label, activeClass, hoverClass }) => (
              <button
                key={value}
                onClick={() => setActiveSituation(value)}
                aria-pressed={activeSituation === value}
                className={cx(
                  'px-3 py-1.5 text-xs font-semibold rounded-lg transition',
                  activeSituation === value
                    ? cx(activeClass, 'shadow-xs')
                    : cx('text-slate-600 dark:text-slate-400', hoverClass)
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={histologyFilter}
              onChange={(e) => setHistologyFilter(e.target.value as HistologyFilter)}
              aria-label="Filtrer par histologie"
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">Toutes histologies</option>
              <option value="epidermoide">Carcinomes épidermoïdes uniquement</option>
              <option value="non_epidermoide">Non-épidermoïdes (CAC, ADK, autre)</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher une dose (ex: 66Gy, 63.6Gy), un critère (R1, ECE, pT4), cisplatine, larynx..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-16 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-200 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Effacer
            </button>
          )}
        </div>
      </div>

      {visibleSections.map((section) => {
        const nodes = filteredNodes.filter((n) => n.situation === section.situation);
        return (
          <div key={section.situation} className="space-y-4">
            <div className={cx('flex items-center justify-between border-b pb-2', section.borderClass)}>
              <div className="flex items-center gap-2">
                <span className={cx('w-3 h-3 rounded-full inline-block', section.dotClass)} />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{section.title}</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">{nodes.length} branche(s)</span>
            </div>

            {nodes.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                {section.emptyText}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {nodes.map((node) => (
                  <TreeNodeCard
                    key={node.id}
                    node={node}
                    isExpanded={expandedIds.has(node.id)}
                    onToggle={() => toggleNode(node.id)}
                    onSelectCase={onSelectCase}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

interface TreeNodeCardProps {
  node: TreeNode;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectCase: (presetData: Partial<RcpFormData>) => void;
}

const TreeNodeCard: React.FC<TreeNodeCardProps> = ({ node, isExpanded, onToggle, onSelectCase }) => (
  <div
    className={cx(
      'bg-white dark:bg-slate-900 rounded-xl border transition-all',
      isExpanded
        ? 'border-slate-300 dark:border-slate-700 shadow-xs'
        : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300'
    )}
  >
    <button
      onClick={onToggle}
      aria-expanded={isExpanded}
      className="w-full text-left p-3.5 flex items-center justify-between gap-3 select-none"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="text-slate-400 dark:text-slate-500 shrink-0">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={cx('text-[10px] font-bold px-2 py-0.5 rounded-full border', node.badgeColor)}>
              {node.badge}
            </span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{node.condition}</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{node.title}</h4>
        </div>
      </div>

      <span className={cx('shrink-0 inline-block px-2.5 py-1 rounded-lg text-xs tracking-tight', node.doseBadgeColor)}>
        {node.prescription}
      </span>
    </button>

    {isExpanded && (
      <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/60 space-y-3 text-xs">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg space-y-1.5 border border-slate-200/60 dark:border-slate-700/50">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Critères requis :
          </span>
          {node.keyRules.map((rule) => (
            <div key={rule} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <span>{rule}</span>
            </div>
          ))}
        </div>

        <div className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
          <strong className="text-slate-900 dark:text-white font-medium">Justification RCP : </strong>
          {node.rationale}
        </div>

        {node.sampleForm && (
          <div className="pt-1 flex items-center justify-end">
            <button
              onClick={() => onSelectCase(node.sampleForm!)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 font-semibold text-xs transition border border-teal-200 dark:border-teal-800"
            >
              <span>Tester cette situation dans l'Avis RCP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    )}
  </div>
);
