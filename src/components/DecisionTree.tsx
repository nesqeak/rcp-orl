import React, { useState, useMemo } from 'react';
import {
  GitFork,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Layers,
  Sparkles,
  ShieldAlert,
  SlidersHorizontal,
  Bookmark,
  Activity,
  FileCheck2,
} from 'lucide-react';
import { SituationType, HistologieENT, RcpFormData } from '../types';

interface DecisionTreeProps {
  onSelectCase?: (presetData: Partial<RcpFormData>) => void;
  onNavigateHome: () => void;
}

interface TreeNode {
  id: string;
  situation: SituationType;
  title: string;
  badge?: string;
  badgeColor?: string;
  condition: string;
  histologyScope: 'all' | 'epidermoide_only' | 'non_epidermoide_only' | 'cac';
  keyRules: string[];
  prescription: string;
  doseBadgeColor: string;
  rationale: string;
  sampleForm?: Partial<RcpFormData>;
}

export const DecisionTree: React.FC<DecisionTreeProps> = ({
  onSelectCase,
  onNavigateHome,
}) => {
  const [activeSituation, setActiveSituation] = useState<'all' | SituationType>('all');
  const [histologyFilter, setHistologyFilter] = useState<'all' | 'epidermoide' | 'non_epidermoide'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'adj-r1r2-cddp': true,
    'adj-r1r2-nocddp': true,
    'adj-stereo': true,
    'adj-interm-cddp': true,
    'adj-interm-nocddp': true,
    'def-larynx-hypo': true,
    'def-hpv-pos': true,
    'def-hpv-neg-cddp100': true,
  });

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allIds: Record<string, boolean> = {};
    nodes.forEach((n) => (allIds[n.id] = true));
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  const nodes: TreeNode[] = useMemo(
    () => [
      // ================= SITUATION ADJUVANTE =================
      {
        id: 'adj-r1r2-cddp',
        situation: 'adjuvant',
        title: 'Haut Risque Post-Opératoire : Carcinome Épidermoïde + Éligible Cisplatine',
        badge: 'Haut Risque Majeur',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
        condition: 'Marges Envahies (R1/R2) OU Rupture Capsulaire (RC/ECE) Majeure (hors Stéréo 36Gy)',
        histologyScope: 'epidermoide_only',
        keyRules: [
          'Histologie : Carcinome épidermoïde OBLIGATOIRE',
          'Patient médicalement éligible au cisplatine',
          'Critère : Marges R1/R2 OU RC majeure ganglionnaire',
          'Hors critères Stéréotaxie Post-Op 36Gy (Cavité buccale/Oropharynx pN0 sans embols pT1/pT2 < 3 cm)',
        ],
        prescription: 'Radiothérapie 66Gy potentialisée par du cisplatine 40mg/m2',
        doseBadgeColor: 'bg-rose-600 text-white font-bold',
        rationale:
          'En situation R1/R2 ou RC majeure (hors indication de stéréotaxie post-op 36Gy), la dose est portée à 66 Gy avec potentialisation par cisplatine hebdomadaire chez les carcinomes épidermoïdes éligibles.',
        sampleForm: {
          situation: 'adjuvant',
          localisation: 'Cavité buccale',
          histologie: 'Carcinome épidermoïde',
          cisplatineEligible: true,
          marges: 'Envahies',
          effractionExtraCapsulaire: 'Non',
          stadePT: '3',
          stadePN: '1',
          embolesVasculaires: false,
          engainementPerineuronal: false,
          WPI: false,
        },
      },
      {
        id: 'adj-r1r2-nocddp',
        situation: 'adjuvant',
        title: 'Haut Risque Post-Opératoire : Non-Épidermoïde OU Inéligible Cisplatine',
        badge: 'Haut Risque (sans CDDP)',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
        condition: 'Marges Envahies (R1/R2) OU Rupture Capsulaire Majeure SANS Cisplatine (hors Stéréo 36Gy)',
        histologyScope: 'all',
        keyRules: [
          'Marges R1/R2 OU RC majeure (hors critères Stéréo Post-Op 36Gy)',
          'ET SOIT histologie non-épidermoïde (ADK, CAC, UCNT, autre)',
          'SOIT patient inéligible au cisplatine (clairance < 60, neuropathie/audition)',
          'Règle d’or : Le cisplatine adjuvant est exclu hors carcinome épidermoïde',
        ],
        prescription: 'Radiothérapie 63.6Gy',
        doseBadgeColor: 'bg-amber-600 text-white font-bold',
        rationale:
          'Toute tumeur R1/R2 ou RC majeure ne pouvant pas recevoir de cisplatine (histologie non épidermoïde ou contre-indication médicale) et hors critères de stéréotaxie post-op reçoit 63.6 Gy.',
        sampleForm: {
          situation: 'adjuvant',
          localisation: 'Glande salivaire',
          histologie: 'CAC',
          cisplatineEligible: true,
          marges: 'Envahies',
          effractionExtraCapsulaire: 'Non',
          stadePT: '2',
          stadePN: '0',
          embolesVasculaires: false,
          engainementPerineuronal: false,
          WPI: false,
        },
      },
      {
        id: 'adj-stereo',
        situation: 'adjuvant',
        title: 'Stéréotaxique Post-Opératoire (STEREO POST-OP 36Gy)',
        badge: 'Stéréotaxie Post-Op (36Gy)',
        badgeColor: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
        condition: 'Cavité buccale ou Oropharynx STRICTEMENT + pN0 + SANS embols vasculaires',
        histologyScope: 'all',
        keyRules: [
          'Localisation : Cavité buccale ou Oropharynx STRICTEMENT',
          'Curage ganglionnaire pN0 ET absence totale d’emboles vasculaires',
          'Cas 1 : pT2 ≥ 3 cm avec marges saines (> 5 mm)',
          'Cas 2 : pT1 ou pT2 < 3 cm avec marges suboptimales (< 5 mm ou recoupe négative)',
          'Cas 3 (NOUVEAU) : pT1 ou pT2 < 3 cm avec marges R1/R2 (envahies)',
        ],
        prescription: 'Radiothérapie STEREO POST OP 36Gy',
        doseBadgeColor: 'bg-sky-600 text-white font-bold',
        rationale:
          'Protocole hypofractionné ciblé de 36 Gy sur le lit opératoire pour la cavité buccale ou l’oropharynx STRICTEMENT, avec pN0 et sans embols vasculaires : soit pT2 ≥ 3 cm à marges saines, soit pT1 ou pT2 < 3 cm avec marges suboptimales (< 5 mm ou recoupe négative) ou marges R1/R2.',
        sampleForm: {
          situation: 'adjuvant',
          localisation: 'Cavité buccale',
          histologie: 'Carcinome épidermoïde',
          cisplatineEligible: true,
          marges: 'Envahies',
          stadePT: '1',
          stadePN: '0',
          tailleTumeur: '< 3cm',
          embolesVasculaires: false,
          engainementPerineuronal: false,
          WPI: false,
          effractionExtraCapsulaire: 'Non',
        },
      },
      {
        id: 'adj-surveillance',
        situation: 'adjuvant',
        title: 'Faible Risque Post-Opératoire : Surveillance Simple',
        badge: 'Surveillance',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
        condition: 'pT1 / pT2 < 3 cm + pN0 + Marges > 5 mm',
        histologyScope: 'all',
        keyRules: [
          'Stade précoce : pT1 ou pT2 < 3 cm',
          'Curage pN0',
          'Marges saines franches (> 5 mm)',
          'Absence d’embols ou d’engainements majeurs',
        ],
        prescription: 'Surveillance',
        doseBadgeColor: 'bg-emerald-600 text-white font-bold',
        rationale:
          'Résection chirurgicale complète à marge saine d’une tumeur débutante pN0 : abstention de radiothérapie adjuvante et surveillance clinique rapprochée.',
        sampleForm: {
          situation: 'adjuvant',
          localisation: 'Cavité buccale',
          histologie: 'Carcinome épidermoïde',
          cisplatineEligible: true,
          marges: '> 5mm',
          stadePT: '1',
          stadePN: '0',
          tailleTumeur: '< 3cm',
          embolesVasculaires: false,
          engainementPerineuronal: false,
          WPI: false,
          effractionExtraCapsulaire: 'Non',
        },
      },
      {
        id: 'adj-interm-cddp',
        situation: 'adjuvant',
        title: 'Risque Intermédiaire : Carcinome Épidermoïde + Éligible Cisplatine',
        badge: 'Risque Intermédiaire (≥ 2 critères)',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
        condition: '≥ 2 critères parmi {pT4, Emboles, WPI, Engainement, pN > 1, RC mineure}',
        histologyScope: 'epidermoide_only',
        keyRules: [
          'Histologie : Carcinome épidermoïde EXCLUSIVEMENT',
          'Patient éligible au cisplatine',
          'Au moins 2 facteurs de risque intermédiaire cumulés',
          'En l’absence de marge R1/R2 et de RC majeure',
        ],
        prescription: 'Radiothérapie 60Gy potentialisée par du cisplatine 40mg/m2',
        doseBadgeColor: 'bg-purple-600 text-white font-bold',
        rationale:
          'Potentialisation par cisplatine hebdomadaire adjuvante sur 60 Gy réservée aux carcinomes épidermoïdes cumulant au moins 2 critères péjoratifs.',
        sampleForm: {
          situation: 'adjuvant',
          localisation: 'Oropharynx',
          histologie: 'Carcinome épidermoïde',
          cisplatineEligible: true,
          marges: '> 5mm',
          stadePT: '4',
          stadePN: '2a',
          embolesVasculaires: true,
          engainementPerineuronal: false,
          WPI: false,
          effractionExtraCapsulaire: 'Non',
        },
      },
      {
        id: 'adj-interm-nocddp',
        situation: 'adjuvant',
        title: 'Adjuvant Standard (ou non épidermoïde / inéligible cisplatine)',
        badge: 'Adjuvant Standard',
        badgeColor: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        condition: 'Facteurs de risque intermédiaire SANS cisplatine OU Histologie CAC / autre',
        histologyScope: 'all',
        keyRules: [
          'Présence de critères intermédiaires mais patient non éligible au cisplatine',
          'OU Histologie non épidermoïde (CAC, ADK, etc.) : cisplatine proscrit',
          'OU 1 seul facteur de risque intermédiaire isolé',
        ],
        prescription: 'Radiothérapie 60Gy',
        doseBadgeColor: 'bg-teal-700 text-white font-bold',
        rationale:
          'Radiothérapie adjuvante standard 60 Gy sans potentialisation chimiothérapique.',
        sampleForm: {
          situation: 'adjuvant',
          localisation: 'Larynx',
          histologie: 'Carcinome épidermoïde',
          cisplatineEligible: false,
          marges: '< 5mm',
          stadePT: '3',
          stadePN: '1',
          embolesVasculaires: true,
          engainementPerineuronal: true,
          WPI: false,
          effractionExtraCapsulaire: 'Non',
        },
      },

      // ================= TUMEUR EN PLACE (DÉFINITIF) =================
      {
        id: 'def-larynx-hypo',
        situation: 'tumeur_en_place',
        title: 'Larynx Tis / T1 / T2 N0 : Schémas Hypofractionnés Défininitifs',
        badge: 'Larynx Débutant N0',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
        condition: 'Larynx + Carcinome épidermoïde + N0',
        histologyScope: 'epidermoide_only',
        keyRules: [
          'Tis N0 ➔ Radiothérapie 60.75Gy (2.25Gy/fx)',
          'T1 N0 ➔ Radiothérapie 63Gy (2.25Gy/fx)',
          'T2 N0 ➔ Radiothérapie 64.8Gy (2.4Gy/fx)',
          'Exclusivement réservé au carcinome épidermoïde laryngé N0',
        ],
        prescription: 'Radiothérapie 60.75Gy à 64.8Gy (Hypofractionnée)',
        doseBadgeColor: 'bg-emerald-600 text-white font-bold',
        rationale:
          'Schémas hypofractionnés de référence internationale pour les carcinomes épidermoïdes de la glotte / larynx débutants N0.',
        sampleForm: {
          situation: 'tumeur_en_place',
          localisation: 'Larynx',
          histologie: 'Carcinome épidermoïde',
          stadeT: '1',
          stadeN: '0',
          cisplatineEligible: true,
          statutHPV: false,
          chimiotherapieInduction: false,
        },
      },
      {
        id: 'def-nasopharynx',
        situation: 'tumeur_en_place',
        title: 'Nasopharynx (UCNT / Épidermoïde)',
        badge: 'Nasopharynx',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
        condition: 'Localisation Nasopharynx',
        histologyScope: 'all',
        keyRules: [
          'Localement avancé (T > 2 ou N > 1) + éligible CDDP ➔ RT 70Gy + Cisplatine 40mg/m2',
          'Stade limité (T ≤ 2 et N ≤ 1) OU inéligible CDDP ➔ RT 70Gy seule',
        ],
        prescription: 'RT 70Gy + Cisplatine 40mg/m2 (ou 70Gy seule)',
        doseBadgeColor: 'bg-indigo-600 text-white font-bold',
        rationale:
          'Chimioradiothérapie concomitante de référence pour les formes localement avancées du cavum.',
        sampleForm: {
          situation: 'tumeur_en_place',
          localisation: 'Nasopharynx',
          histologie: 'UCNT',
          stadeT: '3',
          stadeN: '2',
          cisplatineEligible: true,
          statutHPV: false,
          chimiotherapieInduction: false,
        },
      },
      {
        id: 'def-hpv-pos',
        situation: 'tumeur_en_place',
        title: 'Oropharynx HPV Positif (p16+)',
        badge: 'HPV Positif',
        badgeColor: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800',
        condition: 'Statut HPV Positif (Oropharynx p16+)',
        histologyScope: 'all',
        keyRules: [
          'Haut risque (T > 2 OU N > 1 OU ≥ 2 ganglions) + éligible CDDP ➔ RT 70Gy + Cisplatine 40mg/m2',
          'Bon pronostic (T ≤ 2, N ≤ 1 et 1 seul ganglion) ➔ RT 70Gy seule',
          'Inéligible au cisplatine ➔ RT 70Gy seule (désescalade)',
        ],
        prescription: 'RT 70Gy + Cisplatine 40mg/m2 (ou 70Gy seule)',
        doseBadgeColor: 'bg-teal-600 text-white font-bold',
        rationale:
          'Stratification pronostique majeure selon le nombre de ganglions et le stade T/N, avec cisplatine 40mg/m² hebdomadaire.',
        sampleForm: {
          situation: 'tumeur_en_place',
          localisation: 'Oropharynx',
          histologie: 'Carcinome épidermoïde',
          statutHPV: true,
          stadeT: '3',
          stadeN: '2',
          nbGanglions: '2 et plus',
          cisplatineEligible: true,
          chimiotherapieInduction: false,
        },
      },
      {
        id: 'def-hpv-neg-cddp100',
        situation: 'tumeur_en_place',
        title: 'HPV Négatif Localement Avancé (Sans induction)',
        badge: 'HPV Négatif Standard',
        badgeColor: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800',
        condition: 'HPV- et (T > 2 ou N > 0) + Éligible Cisplatine + Sans Induction',
        histologyScope: 'all',
        keyRules: [
          'Stade localement avancé (T > 2 ou N > 0)',
          'Statut HPV négatif',
          'Sans chimiothérapie d’induction',
          'Éligible au cisplatine',
        ],
        prescription: 'Radiothérapie 70Gy potentialisée par du cisplatine 100mg/m2',
        doseBadgeColor: 'bg-red-600 text-white font-bold',
        rationale:
          'Cisplatine haute dose tri-hebdomadaire (100 mg/m² J1-J22-J43) concomitant de référence pour les tumeurs HPV négatives localement avancées.',
        sampleForm: {
          situation: 'tumeur_en_place',
          localisation: 'Cavité buccale',
          histologie: 'Carcinome épidermoïde',
          statutHPV: false,
          stadeT: '3',
          stadeN: '1',
          cisplatineEligible: true,
          chimiotherapieInduction: false,
        },
      },
      {
        id: 'def-hpv-neg-post-induction',
        situation: 'tumeur_en_place',
        title: 'HPV Négatif Après Chimiothérapie d’Induction',
        badge: 'Post-Induction TPF',
        badgeColor: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800',
        condition: 'HPV- et (T > 2 ou N > 0) + Éligible Cisplatine + Avec Induction',
        histologyScope: 'all',
        keyRules: [
          'Chimiothérapie d’induction préalable reçue',
          'Si réponse tumorale > 80% ➔ Radiothérapie 70Gy seule possible',
          'Sinon ➔ Radiothérapie 70Gy potentialisée par cisplatine 40mg/m2 hebdomadaire',
        ],
        prescription: 'RT 70Gy + Cisplatine 40mg/m2 ou RT 70Gy si réponse > 80%',
        doseBadgeColor: 'bg-violet-600 text-white font-bold',
        rationale:
          'Adaptation de dose du cisplatine (hebdomadaire à 40 mg/m²) après toxicité cumulée d’une induction, ou radiothérapie seule en cas de réponse majeure.',
        sampleForm: {
          situation: 'tumeur_en_place',
          localisation: 'Hypopharynx',
          histologie: 'Carcinome épidermoïde',
          statutHPV: false,
          stadeT: '3',
          stadeN: '2a',
          cisplatineEligible: true,
          chimiotherapieInduction: true,
        },
      },
      {
        id: 'def-hpv-neg-cetuximab',
        situation: 'tumeur_en_place',
        title: 'HPV Négatif : Inéligible Cisplatine (N > 0 ou T > 2)',
        badge: 'Cetuximab (Alternative CDDP)',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
        condition: 'Inéligible Cisplatine + N > 0 ou T > 2 + HPV- + Sans Induction',
        histologyScope: 'all',
        keyRules: [
          'Contre-indication médicale au cisplatine',
          'Atteinte ganglionnaire (N > 0) ou T > 2',
          'Statut HPV négatif',
          'Sans chimiothérapie d’induction préalable',
        ],
        prescription: 'Radiothérapie 70Gy potentialisée par du cetuximab',
        doseBadgeColor: 'bg-amber-600 text-white font-bold',
        rationale:
          'Alternative validée au cisplatine par thérapie ciblée anti-EGFR (Cetuximab) pour les patients inaptes aux sels de platine.',
        sampleForm: {
          situation: 'tumeur_en_place',
          localisation: 'Larynx',
          histologie: 'Carcinome épidermoïde',
          statutHPV: false,
          stadeT: '3',
          stadeN: '1',
          cisplatineEligible: false,
          chimiotherapieInduction: false,
        },
      },
      {
        id: 'def-early-hpv-neg',
        situation: 'tumeur_en_place',
        title: 'HPV Négatif Précoce (T ≤ 2 et N0)',
        badge: 'Stade Précoce N0',
        badgeColor: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        condition: 'T ≤ 2 ET N = 0 (hors larynx épidermoïde)',
        histologyScope: 'all',
        keyRules: [
          'Tumeur primitive T1 ou T2',
          'Bilan ganglionnaire N0',
          'Statut HPV négatif',
          'Hors indication d’hypofractionnement laryngé pur',
        ],
        prescription: 'Radiothérapie 70Gy',
        doseBadgeColor: 'bg-slate-700 text-white font-bold',
        rationale:
          'Radiothérapie normofractionnée exclusive 70 Gy sans chimiothérapie concomitante pour les stades précoces N0.',
        sampleForm: {
          situation: 'tumeur_en_place',
          localisation: 'Cavité buccale',
          histologie: 'Carcinome épidermoïde',
          statutHPV: false,
          stadeT: '2',
          stadeN: '0',
          cisplatineEligible: true,
          chimiotherapieInduction: false,
        },
      },
    ],
    []
  );

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      // Situation filter
      if (activeSituation !== 'all' && node.situation !== activeSituation) {
        return false;
      }
      // Histology filter
      if (histologyFilter === 'epidermoide' && node.histologyScope === 'non_epidermoide_only') {
        return false;
      }
      if (histologyFilter === 'non_epidermoide' && node.histologyScope === 'epidermoide_only') {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = node.title.toLowerCase().includes(query);
        const matchesCondition = node.condition.toLowerCase().includes(query);
        const matchesPrescription = node.prescription.toLowerCase().includes(query);
        const matchesRationale = node.rationale.toLowerCase().includes(query);
        const matchesRules = node.keyRules.some((r) => r.toLowerCase().includes(query));
        return matchesTitle || matchesCondition || matchesPrescription || matchesRationale || matchesRules;
      }
      return true;
    });
  }, [nodes, activeSituation, histologyFilter, searchQuery]);

  // Group by situation
  const adjuvantNodes = filteredNodes.filter((n) => n.situation === 'adjuvant');
  const enPlaceNodes = filteredNodes.filter((n) => n.situation === 'tumeur_en_place');

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6 pb-24 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white rounded-2xl p-5 shadow-sm border border-teal-700/50 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-200 border border-teal-400/30">
                <GitFork className="w-3.5 h-3.5" />
                Arbre Décisionnel Interactif
              </span>
              <span className="text-xs px-2 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">
                Référentiel 2026
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Synthèse des Indications & Doses
            </h2>
            <p className="text-xs text-teal-100/80 mt-1 max-w-xl">
              Cartographie complète selon la situation (adjuvante vs en place), le stade T/N, l’histologie, les marges chirurgicales et l’éligibilité au cisplatine.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="text-xs px-2.5 py-1.5 bg-teal-800/80 hover:bg-teal-700 rounded-lg text-teal-100 transition border border-teal-600/40"
            >
              Tout déplier
            </button>
            <button
              onClick={collapseAll}
              className="text-xs px-2.5 py-1.5 bg-teal-800/80 hover:bg-teal-700 rounded-lg text-teal-100 transition border border-teal-600/40"
            >
              Tout replier
            </button>
          </div>
        </div>
      </div>

      {/* Critical Rules Notice Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-xl p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-950 dark:text-amber-100">
            Règles d’or de prescription (Doses & Potentialisations) :
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-amber-800 dark:text-amber-300/90 text-[11px]">
            <li>
              <strong>Haut risque adjuvant (R1/R2 ou RC majeure) :</strong> Dose = <strong>66 Gy</strong> si potentialisée par cisplatine, ou <strong>63.6 Gy</strong> sans cisplatine.
            </li>
            <li>
              <strong>Cisplatine de potentialisation en adjuvant :</strong> Strictement réservé aux <strong>carcinomes épidermoïdes</strong>. Toute autre histologie (CAC, ADK, etc.) reçoit une radiothérapie seule sans chimiothérapie.
            </li>
            <li>
              <strong>Stéréotaxie post-opératoire (36 Gy) :</strong> Réservée à la <strong>Cavité buccale ou Oropharynx STRICTEMENT</strong>, impérativement <strong>pN0 et sans embols vasculaires</strong> : pT2 ≥ 3 cm avec marges &gt; 5 mm, ou pT1/pT2 &lt; 3 cm avec marges &lt; 5 mm, recoupe négative ou <strong>marges R1/R2</strong>.
            </li>
          </ul>
        </div>
      </div>

      {/* Interactive Filters Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Situation Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setActiveSituation('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeSituation === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Toutes situations
            </button>
            <button
              onClick={() => setActiveSituation('adjuvant')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeSituation === 'adjuvant'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-teal-600'
              }`}
            >
              Adjuvant (Post-op)
            </button>
            <button
              onClick={() => setActiveSituation('tumeur_en_place')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeSituation === 'tumeur_en_place'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600'
              }`}
            >
              Tumeur en place
            </button>
          </div>

          {/* Histology Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={histologyFilter}
              onChange={(e) => setHistologyFilter(e.target.value as any)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">Toutes histologies</option>
              <option value="epidermoide">Carcinomes épidermoïdes uniquement</option>
              <option value="non_epidermoide">Non-épidermoïdes (CAC, ADK, autre)</option>
            </select>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher une dose (ex: 66Gy, 63.6Gy), un critère (R1, ECE, pT4), cisplatine, larynx..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-200 placeholder-slate-400"
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

      {/* SECTION 1: TRAITEMENT ADJUVANT */}
      {(activeSituation === 'all' || activeSituation === 'adjuvant') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-teal-200 dark:border-teal-900/60 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-teal-600 inline-block" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                SITUATION ADJUVANTE (POST-OPÉRATOIRE)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {adjuvantNodes.length} branche(s)
            </span>
          </div>

          {adjuvantNodes.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              Aucune indication adjuvante ne correspond aux filtres actuels.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {adjuvantNodes.map((node) => (
                <TreeNodeCard
                  key={node.id}
                  node={node}
                  isExpanded={!!expandedNodes[node.id]}
                  onToggle={() => toggleNode(node.id)}
                  onSelectCase={onSelectCase}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: TUMEUR EN PLACE */}
      {(activeSituation === 'all' || activeSituation === 'tumeur_en_place') && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-indigo-200 dark:border-indigo-900/60 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                TUMEUR EN PLACE (TRAITEMENT DÉFINITIF)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {enPlaceNodes.length} branche(s)
            </span>
          </div>

          {enPlaceNodes.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              Aucune indication en place ne correspond aux filtres actuels.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {enPlaceNodes.map((node) => (
                <TreeNodeCard
                  key={node.id}
                  node={node}
                  isExpanded={!!expandedNodes[node.id]}
                  onToggle={() => toggleNode(node.id)}
                  onSelectCase={onSelectCase}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface TreeNodeCardProps {
  node: TreeNode;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectCase?: (presetData: Partial<RcpFormData>) => void;
}

const TreeNodeCard: React.FC<TreeNodeCardProps> = ({
  node,
  isExpanded,
  onToggle,
  onSelectCase,
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-xl border transition-all ${
        isExpanded
          ? 'border-slate-300 dark:border-slate-700 shadow-xs'
          : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300'
      }`}
    >
      {/* Header bar of node */}
      <div
        onClick={onToggle}
        className="p-3.5 cursor-pointer flex items-center justify-between gap-3 select-none"
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
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  node.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {node.badge || node.situation}
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {node.condition}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {node.title}
            </h4>
          </div>
        </div>

        {/* Prescription pill */}
        <div className="shrink-0 text-right">
          <span
            className={`inline-block px-2.5 py-1 rounded-lg text-xs tracking-tight ${node.doseBadgeColor}`}
          >
            {node.prescription}
          </span>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/60 space-y-3 text-xs">
          {/* Rules checklist */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg space-y-1.5 border border-slate-200/60 dark:border-slate-700/50">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              Critères requis :
            </span>
            {node.keyRules.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <span>{rule}</span>
              </div>
            ))}
          </div>

          {/* Clinical Rationale */}
          <div className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
            <strong className="text-slate-900 dark:text-white font-medium">
              Justification RCP :{' '}
            </strong>
            {node.rationale}
          </div>

          {/* Action button to test this case in RCP Form */}
          {onSelectCase && node.sampleForm && (
            <div className="pt-1 flex items-center justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCase(node.sampleForm!);
                }}
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
};
