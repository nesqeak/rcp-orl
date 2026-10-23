import React, { useState, useEffect } from 'react';
import { RcpFormData, LocalisationENT, RcpResultOutput, StadeT, StadeN, MargesResection, EffractionCapsulaire, HistologieENT } from '../types';
import { SUBSTRUCTURES_MAP, SubstructureOption, NODAL_AREAS_LIST, BASE_NODAL_LEVELS } from '../data/substructures';
import { computeContouringRecommendations, ArticleReference } from '../utils/contouringEngine';
import { getAvailableStadesT, getAvailableStadesN } from '../utils/rcpDecisionEngine';
import { OAR_CONSTRAINTS } from '../data/contouringData';
import {
  Layers,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Info,
  ExternalLink,
  BookOpen,
  Activity,
  CheckSquare,
  Square,
  Edit3,
  Sliders,
  Search,
  Sparkles,
  Zap
} from 'lucide-react';

interface ContouringGuideProps {
  initialLocalisation?: LocalisationENT;
  formData?: RcpFormData | null;
  rcpResult?: RcpResultOutput | null;
  onNavigateHome: () => void;
}

const LOCALISATIONS_LIST: LocalisationENT[] = [
  'Oropharynx',
  'Cavité buccale',
  'Nasopharynx',
  'Hypopharynx',
  'Larynx',
  'Sinus de la face (hors ethmoïde)',
  'Sinus ethmoïde',
  'Fosses nasales',
  'Glande salivaire',
];

const HISTOLOGIES_LIST: HistologieENT[] = [
  'Carcinome épidermoïde',
  'ADK',
  'UCNT',
  'SNUC',
  'CAC',
  'autre',
];

const STADES_T_LIST: StadeT[] = ['1', '2', '3', '4', 'X'];
const STADES_N_LIST: StadeN[] = ['0', '1', '2a', '2b', '2c', '3a', '3b', 'X'];

export const ContouringGuide: React.FC<ContouringGuideProps> = ({
  initialLocalisation,
  formData: initialFormData,
  rcpResult,
  onNavigateHome,
}) => {
  // Clinical situation state
  const [formData, setFormData] = useState<RcpFormData>(() => {
    if (initialFormData) return initialFormData;
    return {
      situation: 'tumeur_en_place',
      localisation: initialLocalisation || 'Oropharynx',
      stadeT: '1',
      stadeN: '0',
      statutHPV: false,
      histologie: 'Carcinome épidermoïde',
      cisplatineEligible: true,
      chimiotherapieInduction: false,
      atteinteLigneMediane: false,
      nodalAreas: [],
    };
  });

  const [isEditingSituation, setIsEditingSituation] = useState<boolean>(!initialFormData);
  const [selectedSubstructures, setSelectedSubstructures] = useState<string[]>([]);
  const [isStereoPostOp, setIsStereoPostOp] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'volumes' | 'nodal' | 'oar'>('volumes');
  const [searchOarQuery, setSearchOarQuery] = useState('');

  // Both T substructures and N nodal areas start DECOCHED by default
  useEffect(() => {
    setSelectedSubstructures([]);
  }, [formData.localisation]);

  // Check if RCP recommended Stereo Post-Op (only in adjuvant situation)
  useEffect(() => {
    if (formData.situation === 'adjuvant' && rcpResult?.proposition === 'Radiothérapie STEREO POST OP 36Gy') {
      setIsStereoPostOp(true);
    } else if (formData.situation !== 'adjuvant') {
      setIsStereoPostOp(false);
    }
  }, [rcpResult, formData.situation]);

  const toggleSubstructure = (id: string) => {
    setSelectedSubstructures((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllSubstructures = () => {
    const allIds = (SUBSTRUCTURES_MAP[formData.localisation] || []).map((s) => s.id);
    if (selectedSubstructures.length === allIds.length) {
      setSelectedSubstructures([]);
    } else {
      setSelectedSubstructures(allIds);
    }
  };

  const toggleNodalArea = (id: string) => {
    setFormData((prev) => {
      const current = prev.nodalAreas || [];
      const updated = current.includes(id)
        ? current.filter((a) => a !== id)
        : [...current, id];
      return { ...prev, nodalAreas: updated } as RcpFormData;
    });
  };

  const toggleSelectAllNodalAreas = () => {
    const allIds = NODAL_AREAS_LIST.map((a) => a.id);
    const current = formData.nodalAreas || [];
    if (current.length === allIds.length) {
      setFormData((prev) => ({ ...prev, nodalAreas: [] } as RcpFormData));
    } else {
      setFormData((prev) => ({ ...prev, nodalAreas: allIds } as RcpFormData));
    }
  };

  // Dynamic staging lists
  const availableStadesT = getAvailableStadesT(formData.localisation);
  const availableStadesN = getAvailableStadesN(formData.localisation, formData.statutHPV, formData.situation);

  const handleGuideSituationChange = (newSituation: 'tumeur_en_place' | 'adjuvant') => {
    setFormData((prev) => {
      const isOropharynx = prev.localisation === 'Oropharynx';
      const hpvStatus = isOropharynx ? prev.statutHPV : false;
      const newAvailN = getAvailableStadesN(prev.localisation, hpvStatus, newSituation);
      if (newSituation === 'tumeur_en_place') {
        const newN = newAvailN.includes(prev.stadeN || '0') ? prev.stadeN : (newAvailN.includes('0') ? '0' : newAvailN[0]);
        return {
          situation: 'tumeur_en_place',
          localisation: prev.localisation,
          stadeT: prev.stadeT || '1',
          stadeN: newN,
          statutHPV: hpvStatus,
          nbGanglions: hpvStatus && newN === '1' ? prev.nbGanglions || '1' : undefined,
          histologie: prev.histologie,
          cisplatineEligible: prev.cisplatineEligible,
          chimiotherapieInduction: prev.chimiotherapieInduction ?? false,
          atteinteLigneMediane: prev.atteinteLigneMediane ?? false,
          nodalAreas: newN === '0' ? [] : (prev.nodalAreas || []),
        };
      } else {
        const newPN = newAvailN.includes((prev as any).stadePN || '0') ? (prev as any).stadePN : (newAvailN.includes('0') ? '0' : newAvailN[0]);
        return {
          situation: 'adjuvant',
          localisation: prev.localisation,
          stadePT: (prev as any).stadePT || '1',
          tailleTumeur: (prev as any).tailleTumeur || '< 3cm',
          stadePN: newPN,
          statutHPV: hpvStatus,
          histologie: prev.histologie,
          cisplatineEligible: prev.cisplatineEligible,
          embolesVasculaires: (prev as any).embolesVasculaires ?? false,
          engainementPerineuronal: (prev as any).engainementPerineuronal ?? false,
          WPI: (prev as any).WPI ?? false,
          marges: (prev as any).marges || '> 5mm',
          effractionExtraCapsulaire: (prev as any).effractionExtraCapsulaire || 'Non',
          lambeau: (prev as any).lambeau ?? false,
          atteinteLigneMediane: prev.atteinteLigneMediane ?? false,
          nodalAreas: newPN === '0' ? [] : (prev.nodalAreas || []),
        };
      }
    });
  };

  const handleGuideLocalisationChange = (newLoc: LocalisationENT) => {
    setFormData((prev) => {
      const isOropharynx = newLoc === 'Oropharynx';
      const newHPV = isOropharynx ? prev.statutHPV : false;
      const newAvailT = getAvailableStadesT(newLoc);
      const newAvailN = getAvailableStadesN(newLoc, newHPV, prev.situation);

      if (prev.situation === 'tumeur_en_place') {
        const newT = newAvailT.includes(prev.stadeT) ? prev.stadeT : (newAvailT.includes('1') ? '1' : newAvailT[0]);
        const newN = newAvailN.includes(prev.stadeN) ? prev.stadeN : (newAvailN.includes('0') ? '0' : newAvailN[0]);
        return {
          ...prev,
          localisation: newLoc,
          statutHPV: newHPV,
          stadeT: newT,
          stadeN: newN,
          nodalAreas: newN === '0' ? [] : prev.nodalAreas,
        };
      } else {
        const newPT = newAvailT.includes(prev.stadePT) ? prev.stadePT : (newAvailT.includes('1') ? '1' : newAvailT[0]);
        const newPN = newAvailN.includes(prev.stadePN) ? prev.stadePN : (newAvailN.includes('0') ? '0' : newAvailN[0]);
        return {
          ...prev,
          localisation: newLoc,
          statutHPV: newHPV,
          stadePT: newPT,
          stadePN: newPN,
          nodalAreas: newPN === '0' ? [] : prev.nodalAreas,
        };
      }
    });
  };

  const handleGuideHPVChange = (newHPV: boolean) => {
    setFormData((prev) => {
      const newAvailN = getAvailableStadesN(prev.localisation, newHPV, prev.situation);
      if (prev.situation === 'tumeur_en_place') {
        const newN = newAvailN.includes(prev.stadeN) ? prev.stadeN : newAvailN[0];
        return {
          ...prev,
          statutHPV: newHPV,
          stadeN: newN,
        };
      } else {
        const newPN = newAvailN.includes(prev.stadePN) ? prev.stadePN : newAvailN[0];
        return {
          ...prev,
          statutHPV: newHPV,
          stadePN: newPN,
        };
      }
    });
  };

  // Compute contouring rules using calculation engine
  const recs = computeContouringRecommendations(
    formData,
    selectedSubstructures,
    isStereoPostOp
  );

  const availableSubstructures = SUBSTRUCTURES_MAP[formData.localisation] || [];

  const currentStadeN = formData.situation === 'tumeur_en_place' ? formData.stadeN : formData.stadePN;
  const isNPlus = formData.situation === 'adjuvant'
    ? formData.stadePN !== '0'
    : formData.stadeN !== '0';

  const isCaviteBuccale = formData.localisation === 'Cavité buccale';
  const isOropharynxNotOnlyParoiPost =
    formData.localisation === 'Oropharynx' &&
    !(
      selectedSubstructures.length === 1 &&
      selectedSubstructures[0] === 'paroi_pharyngee_posterieure_oro'
    );
  const isSinusFaceOuEthmoide =
    formData.localisation === 'Sinus de la face (hors ethmoïde)' ||
    formData.localisation === 'Sinus ethmoïde';

  const showLigneMedianeChoice =
    isCaviteBuccale || isOropharynxNotOnlyParoiPost || isSinusFaceOuEthmoide;

  // Filtered OAR list
  const filteredOars = OAR_CONSTRAINTS.filter(
    (oar) =>
      oar.name.toLowerCase().includes(searchOarQuery.toLowerCase()) ||
      oar.notes.toLowerCase().includes(searchOarQuery.toLowerCase()) ||
      oar.doseLimit.toLowerCase().includes(searchOarQuery.toLowerCase())
  );

  return (
    <div className="p-4 max-w-md mx-auto space-y-4 pb-28 animate-fade-in">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 shadow-md border border-indigo-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold tracking-tight text-white">
              Recommandations de Contourage
            </h2>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-indigo-500/30 text-indigo-200 rounded-full border border-indigo-400/30">
            {formData.situation === 'tumeur_en_place' ? 'Tumeur en place' : 'Post-op / Adjuvant'}
          </span>
        </div>
        <p className="text-xs text-indigo-200/80 mt-1">
          Volumes cibles GTV/CTV HR, IR, BR, aires ganglionnaires & contraintes de dose OAR.
        </p>
      </div>

      {/* Clinical Situation Summary Banner (With button to edit) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Situation Clinique : {formData.localisation}</span>
          </div>
          <button
            onClick={() => setIsEditingSituation(!isEditingSituation)}
            className="px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition flex items-center gap-1 border border-indigo-200 dark:border-indigo-800"
          >
            <Edit3 className="w-3 h-3" />
            {isEditingSituation ? 'Masquer le menu' : 'Modifier le cas'}
          </button>
        </div>

        {/* Short Summary pill badges */}
        <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-md">
            {formData.situation === 'tumeur_en_place'
              ? `Stade T${formData.stadeT} N${formData.stadeN}`
              : `pT${formData.stadePT}${formData.stadePT === '2' && formData.tailleTumeur ? ` (${formData.tailleTumeur})` : ''} pN${formData.stadePN}`}
          </span>
          {formData.localisation === 'Oropharynx' && (
            <span
              className={`px-2 py-0.5 rounded-md font-bold ${
                formData.statutHPV
                  ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              HPV: {formData.statutHPV ? 'p16+' : 'Négatif'}
            </span>
          )}
          {formData.localisation === 'Oropharynx' && formData.situation === 'tumeur_en_place' && formData.statutHPV && formData.stadeN === '1' && (
            <span className="px-2 py-0.5 bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 rounded-md">
              Ganglion: {formData.nbGanglions === '2 et plus' ? '≥ 2' : '1 seul'}
            </span>
          )}
          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-md">
            Histo: {formData.histologie}
          </span>
          {formData.situation === 'tumeur_en_place' && formData.chimiotherapieInduction && (
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200 rounded-md">
              Induction TPF
            </span>
          )}
          {showLigneMedianeChoice && (
            <span className={`px-2 py-0.5 rounded-md ${formData.atteinteLigneMediane ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold' : 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}>
              Ligne Médiane: {formData.atteinteLigneMediane ? 'Atteinte (Oui)' : 'Non atteinte'}
            </span>
          )}
          {formData.situation === 'adjuvant' && (
            <>
              <span className={`px-2 py-0.5 rounded-md ${formData.marges === 'Envahies' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                Marges: {formData.marges}
              </span>
              <span className={`px-2 py-0.5 rounded-md ${formData.effractionExtraCapsulaire !== 'Non' ? 'bg-rose-100 text-rose-800 font-bold' : 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}>
                ECE: {formData.effractionExtraCapsulaire}
              </span>
              {formData.embolesVasculaires && (
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md font-bold">LVI+</span>
              )}
              {formData.engainementPerineuronal && (
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md font-bold">PNI+</span>
              )}
              {formData.WPI && (
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md font-bold">WPI+</span>
              )}
              {formData.lambeau && (
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200 rounded-md">
                  Lambeau
                </span>
              )}
            </>
          )}
        </div>

        {/* Expanded Form to edit clinical situation directly if needed */}
        {isEditingSituation && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3.5 text-xs bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="font-bold text-indigo-900 dark:text-indigo-300">
              Édition complète du cas clinique :
            </div>

            {/* Situation Switch */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                1. Situation clinique :
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleGuideSituationChange('tumeur_en_place')}
                  className={`py-2 px-3 rounded-xl font-bold border transition ${
                    formData.situation === 'tumeur_en_place'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  Tumeur en place
                </button>
                <button
                  type="button"
                  onClick={() => handleGuideSituationChange('adjuvant')}
                  className={`py-2 px-3 rounded-xl font-bold border transition ${
                    formData.situation === 'adjuvant'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  Adjuvant (Post-op)
                </button>
              </div>
            </div>

            {/* Localisation select */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                2. Localisation tumorale :
              </label>
              <select
                value={formData.localisation}
                onChange={(e) => handleGuideLocalisationChange(e.target.value as LocalisationENT)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-semibold text-slate-900 dark:text-white"
              >
                {LOCALISATIONS_LIST.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Staging TNM / pTNM */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                3. Classification TNM / pTNM :
              </label>
              {formData.situation === 'tumeur_en_place' ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold block text-slate-600 dark:text-slate-400 text-[11px] mb-0.5">Stade T :</label>
                    <select
                      value={formData.stadeT}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, stadeT: e.target.value as StadeT } as RcpFormData))
                      }
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 font-semibold text-slate-900 dark:text-white"
                    >
                      {availableStadesT.map((t) => (
                        <option key={t} value={t}>
                          {t === 'Tis' ? 'Tis' : `T${t}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold block text-slate-600 dark:text-slate-400 text-[11px] mb-0.5">Stade N :</label>
                    <select
                      value={formData.stadeN}
                      onChange={(e) => {
                        const val = e.target.value as StadeN;
                        setFormData((prev) => ({
                          ...prev,
                          stadeN: val,
                          nodalAreas: val === '0' ? [] : prev.nodalAreas,
                        } as RcpFormData));
                      }}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 font-semibold text-slate-900 dark:text-white"
                    >
                      {availableStadesN.map((n) => (
                        <option key={n} value={n}>
                          {n === 'X' ? 'NX' : `N${n}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold block text-slate-600 dark:text-slate-400 text-[11px] mb-0.5">Stade pT :</label>
                      <select
                        value={formData.stadePT}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, stadePT: e.target.value as StadeT } as RcpFormData))
                        }
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 font-semibold text-slate-900 dark:text-white"
                      >
                        {availableStadesT.map((t) => (
                          <option key={t} value={t}>
                            {t === 'Tis' ? 'pTis' : `pT${t}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold block text-slate-600 dark:text-slate-400 text-[11px] mb-0.5">Stade pN :</label>
                      <select
                        value={formData.stadePN}
                        onChange={(e) => {
                          const val = e.target.value as StadeN;
                          setFormData((prev) => ({
                            ...prev,
                            stadePN: val,
                            nodalAreas: val === '0' ? [] : prev.nodalAreas,
                          } as RcpFormData));
                        }}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 font-semibold text-slate-900 dark:text-white"
                      >
                        {availableStadesN.map((n) => (
                          <option key={n} value={n}>
                            {n === 'X' ? 'pNX' : `pN${n}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Taille si pT2 */}
                  {formData.stadePT === '2' && (
                    <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800 space-y-1">
                      <label className="font-bold text-amber-900 dark:text-amber-200 block text-[11px]">
                        Taille tumeur (spécifique pT2) :
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, tailleTumeur: '< 3cm' } as RcpFormData))}
                          className={`py-1 px-2 rounded-md font-bold text-xs border transition ${
                            (formData.tailleTumeur || '< 3cm') === '< 3cm'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          &lt; 3 cm
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, tailleTumeur: '≥ 3cm' } as RcpFormData))}
                          className={`py-1 px-2 rounded-md font-bold text-xs border transition ${
                            formData.tailleTumeur === '≥ 3cm'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          ≥ 3 cm
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Encadré unique sous le stade TNM / pTNM : Reconstruction par lambeau & Atteinte de la ligne médiane */}
            {(showLigneMedianeChoice || formData.situation === 'adjuvant') && (
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 shadow-2xs space-y-2.5">
                {/* Atteinte de la ligne médiane */}
                {showLigneMedianeChoice && (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                        Atteinte de la ligne médiane :
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        Tumeur franchissant ou touchant la ligne médiane
                      </span>
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, atteinteLigneMediane: false } as RcpFormData))}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                          !formData.atteinteLigneMediane
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Non
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, atteinteLigneMediane: true } as RcpFormData))}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                          formData.atteinteLigneMediane
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Oui
                      </button>
                    </div>
                  </div>
                )}

                {showLigneMedianeChoice && formData.situation === 'adjuvant' && (
                  <div className="border-t border-slate-100 dark:border-slate-700" />
                )}

                {/* Reconstruction par lambeau (Adjuvant) */}
                {formData.situation === 'adjuvant' && (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                        Reconstruction par lambeau :
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        Chirurgie reconstructrice avec lambeau libre ou pédiculé
                      </span>
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, lambeau: false } as RcpFormData))}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                          !formData.lambeau
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Non
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, lambeau: true } as RcpFormData))}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                          formData.lambeau
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Oui
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Statut HPV (p16) - UNIQUEMENT SI OROPHARYNX */}
            {formData.localisation === 'Oropharynx' && (
              <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Statut HPV (p16) :
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Immunohistochimie / PCR (Spécifique Oropharynx)
                    </span>
                  </div>
                  <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => handleGuideHPVChange(true)}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                        formData.statutHPV
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Oui (Positif)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGuideHPVChange(false)}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                        !formData.statutHPV
                          ? 'bg-slate-700 text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Non (Négatif)
                    </button>
                  </div>
                </div>

                {/* Conditional nbGanglions if HPV+ and N1 (Tumeur en place) */}
                {formData.situation === 'tumeur_en_place' && formData.statutHPV && formData.stadeN === '1' && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-1">
                    <label className="font-bold text-teal-900 dark:text-teal-200 block text-[11px]">
                      Nombre de ganglions envahis (Statut HPV+ & N1) :
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, nbGanglions: '1' } as RcpFormData))}
                        className={`py-1 px-2 rounded-md font-bold text-xs border transition ${
                          (formData.nbGanglions || '1') === '1'
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        1 seul ganglion
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, nbGanglions: '2 et plus' } as RcpFormData))}
                        className={`py-1 px-2 rounded-md font-bold text-xs border transition ${
                          formData.nbGanglions === '2 et plus'
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        2 et plus
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Histologie */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Histologie :
              </label>
              <select
                value={formData.histologie}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    histologie: e.target.value as HistologieENT,
                  }))
                }
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-semibold text-slate-900 dark:text-white"
              >
                {HISTOLOGIES_LIST.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {/* Chimiothérapie d'induction si tumeur en place */}
            {formData.situation === 'tumeur_en_place' && (
              <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Chimiothérapie d'induction :
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Protocole TPF préalable
                  </span>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, chimiotherapieInduction: true } as RcpFormData))}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                      formData.chimiotherapieInduction
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Oui
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, chimiotherapieInduction: false } as RcpFormData))}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                      !formData.chimiotherapieInduction
                        ? 'bg-slate-700 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Non
                  </button>
                </div>
              </div>
            )}

            {/* Critères Adjuvant Spécifiques */}
            {formData.situation === 'adjuvant' && (
              <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 block uppercase tracking-wider text-[11px]">
                  Critères Histopathologiques Post-Op :
                </span>

                {/* Marges de résection */}
                <div>
                  <label className="font-semibold block text-slate-700 dark:text-slate-300 text-[11px] mb-1">
                    Marges de résection chirurgicale :
                  </label>
                  <select
                    value={formData.marges}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, marges: e.target.value as MargesResection } as RcpFormData))
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="> 5mm">&gt; 5 mm (Marges saines)</option>
                    <option value="< 5mm">&lt; 5 mm (Marges étroites)</option>
                    <option value="Envahies">Envahies (R1/R2)</option>
                    <option value="Envahies mais recoupe négative">Envahies mais recoupe extemporanée négative</option>
                  </select>
                </div>

                {/* ECE */}
                <div>
                  <label className="font-semibold block text-slate-700 dark:text-slate-300 text-[11px] mb-1">
                    Effraction extra-capsulaire (ECE) :
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['Non', 'Mineure', 'Majeure'] as EffractionCapsulaire[]).map((ece) => (
                      <button
                        key={ece}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, effractionExtraCapsulaire: ece } as RcpFormData))}
                        className={`py-1.5 px-2 rounded-md font-bold text-xs border transition ${
                          formData.effractionExtraCapsulaire === ece
                            ? ece === 'Majeure'
                              ? 'bg-rose-600 text-white border-rose-600'
                              : ece === 'Mineure'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-teal-600 text-white border-teal-600'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {ece}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Binary Toggles for Adjuvant */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                  {/* LVI */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Emboles vasculaires (LVI) :
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, embolesVasculaires: !prev.embolesVasculaires } as RcpFormData))}
                      className={`px-3 py-1 rounded-md text-xs font-bold border transition ${
                        formData.embolesVasculaires
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {formData.embolesVasculaires ? 'Oui' : 'Non'}
                    </button>
                  </div>

                  {/* PNI */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Engainement péri-nerveux (PNI) :
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, engainementPerineuronal: !prev.engainementPerineuronal } as RcpFormData))}
                      className={`px-3 py-1 rounded-md text-xs font-bold border transition ${
                        formData.engainementPerineuronal
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {formData.engainementPerineuronal ? 'Oui' : 'Non'}
                    </button>
                  </div>

                  {/* WPI */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Pattern d'invasion agressif (WPI) :
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, WPI: !prev.WPI } as RcpFormData))}
                      className={`px-3 py-1 rounded-md text-xs font-bold border transition ${
                        formData.WPI
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {formData.WPI ? 'Oui' : 'Non'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* UNILATERAL IRRADIATION CALLOUT BANNER */}
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

      {/* STÉRÉO POST-OP INDICATION TOGGLE BUTTON (Adjuvant uniquement) */}
      {formData.situation === 'adjuvant' && (
        <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-200 dark:border-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
              Indication Stéréo Post-Opératoire (36 Gy)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsStereoPostOp(!isStereoPostOp)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              isStereoPostOp
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
            }`}
          >
            {isStereoPostOp ? 'ACTIVÉ' : 'DÉSACTIVÉ'}
          </button>
        </div>
      )}

      {/* SUB-STRUCTURES CHECKLIST (T) - DECOCHÉES PAR DÉFAUT */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              Sous-structures tumorales atteintes (T)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Cochez les sous-localisations anatomiques pour préciser les inclusions {formData.localisation === 'Nasopharynx' ? 'du Consensus 2024' : 'RECORAD'} (décochées par défaut).
            </p>
          </div>
          <button
            onClick={toggleSelectAllSubstructures}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
          >
            {selectedSubstructures.length === availableSubstructures.length ? 'Tout décocher' : 'Tout cocher'}
          </button>
        </div>

        {/* Checkbox grid */}
        <div className="grid grid-cols-1 gap-1.5 pt-1">
          {availableSubstructures.length > 0 ? (
            availableSubstructures.map((sub) => {
              const isChecked = selectedSubstructures.includes(sub.id);
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => toggleSubstructure(sub.id)}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl text-xs font-semibold text-left transition border ${
                    isChecked
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-950 dark:text-indigo-100 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
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
            })
          ) : (
            <div className="text-xs text-slate-500 italic py-2">
              Sélectionnez une localisation tumorale pour afficher les sous-structures.
            </div>
          )}
        </div>
      </div>

      {/* NODAL AREAS CHECKLIST (N+) - DISPLAYED IF PATIENT IS NOT N0 / pN0 - DECOCHÉES PAR DÉFAUT */}
      {isNPlus && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-600" />
                Aires ganglionnaires envahies (N+) par côté
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Indiquez les relais ganglionnaires atteints par côté (D / G) à inclure dans le CTV N IR.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, nodalAreas: [] } as RcpFormData))}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:underline"
              >
                Tout décocher
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
            {BASE_NODAL_LEVELS.map((level) => {
              const idDroit = `${level.id} Droit`;
              const idGauche = `${level.id} Gauche`;
              const currentAreas = formData.nodalAreas || [];
              const isCheckedDroit = currentAreas.includes(idDroit);
              const isCheckedGauche = currentAreas.includes(idGauche);

              return (
                <div
                  key={level.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs"
                >
                  <span className="font-bold text-slate-900 dark:text-white truncate pr-2">
                    {level.label}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleNodalArea(idDroit)}
                      className={`w-8 h-7 flex items-center justify-center rounded-lg font-extrabold text-xs transition border ${
                        isCheckedDroit
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-indigo-400'
                      }`}
                      title={`${level.label} (Droit)`}
                    >
                      D
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleNodalArea(idGauche)}
                      className={`w-8 h-7 flex items-center justify-center rounded-lg font-extrabold text-xs transition border ${
                        isCheckedGauche
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-indigo-400'
                      }`}
                      title={`${level.label} (Gauche)`}
                    >
                      G
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB NAVIGATION FOR CONTOURING RECOMMENDATIONS */}
      <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold">
        <button
          onClick={() => setActiveTab('volumes')}
          className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'volumes'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          {recs.isLarynxEarlyStageSingleDose ? 'Volume CTV T (Niveau unique)' : 'Volumes CTV T (HR/IR/BR)'}
        </button>

        <button
          onClick={() => setActiveTab('nodal')}
          className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'nodal'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Aires Ganglionnaires (CTV N)
        </button>

        <button
          onClick={() => setActiveTab('oar')}
          className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'oar'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Contraintes OAR
        </button>
      </div>

      {/* TAB 1 : VOLUMES CIBLES TUMORAUX (CTV T : HR, IR, BR OU NIVEAU UNIQUE) */}
      {activeTab === 'volumes' && (
        <div className="space-y-3.5">
          {recs.isLarynxEarlyStageSingleDose ? (
            /* LARYNX Tis, T1, T2 N0 : UN SEUL NIVEAU DE DOSE ET UN SEUL CTV T */
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-600 animate-pulse" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
                    CTV T (Niveau de dose unique)
                  </h4>
                </div>
                <span className="text-xs font-extrabold px-2.5 py-1 bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  {recs.larynxSingleDoseLabel || 'Radiothérapie'}
                </span>
              </div>

              <div className="text-xs text-slate-900 dark:text-slate-100 whitespace-pre-line leading-relaxed font-semibold bg-indigo-50/70 dark:bg-indigo-950/40 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                {recs.ctvTHighRisk}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Règle de contourage spécifique :
                </span>
                <p>
                  Pour les tumeurs en place du larynx Tis, T1 ou T2 N0, il n'y a qu'un niveau de dose et donc un seul CTV T (GTV T + 5mm étendu à l'ensemble du larynx), sans volume prophylactique IR ou BR séparé.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* CTV T HIGH RISK (HR) */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                      CTV T Haut Risque (CTV_HR)
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 rounded-md">
                    66 - 70 Gy
                  </span>
                </div>
                <div className="text-xs text-slate-900 dark:text-slate-100 whitespace-pre-line leading-relaxed font-semibold bg-rose-50/60 dark:bg-rose-950/30 p-3 rounded-xl border border-rose-100 dark:border-rose-900/50">
                  {recs.ctvTHighRisk}
                </div>
              </div>

              {/* CTV T INTERMEDIATE RISK (IR) */}
              {recs.ctvTInterRisk && (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500" />
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                        CTV T Risque Intermédiaire (CTV_IR)
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-md">
                      60 - 64 Gy
                    </span>
                  </div>
                  <div className="text-xs text-slate-900 dark:text-slate-100 whitespace-pre-line leading-relaxed font-semibold bg-amber-50/60 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-100 dark:border-amber-900/50">
                    {recs.ctvTInterRisk}
                  </div>
                </div>
              )}

              {/* CTV T LOW RISK (BR / Prophylactique - RECORAD & Green Journal) */}
              {recs.ctvTLowRisk && (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-teal-200 dark:border-teal-900/60 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-teal-500" />
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                        CTV T Bas Risque ({formData.localisation === 'Nasopharynx' ? 'CTV_BR / Consensus 2024' : 'CTV_BR / RECORAD'})
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 rounded-md">
                      50 - 54 Gy
                    </span>
                  </div>
                  <div className="text-xs text-slate-900 dark:text-slate-100 whitespace-pre-line leading-relaxed font-semibold bg-teal-50/60 dark:bg-teal-950/30 p-3 rounded-xl border border-teal-100 dark:border-teal-900/50">
                    {recs.ctvTLowRisk}
                  </div>

                  {/* List of sub-structures included in CTV BR */}
                  {recs.recoradInclusions.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-teal-100 dark:border-teal-900/40 text-[11px] space-y-1">
                      <span className="font-bold text-teal-900 dark:text-teal-300">
                        {formData.localisation === 'Nasopharynx' ? 'Zones anatomiques (Consensus 2024) à inclure dans le CTV T BR :' : 'Zones anatomiques RECORAD à inclure dans le CTV T BR :'}
                      </span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300 font-medium">
                        {recs.recoradInclusions.map((inc, i) => (
                          <li key={i}>{inc}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB 2 : AIRES GANGLIONNAIRES (CTV N) */}
      {activeTab === 'nodal' && (
        <div className="space-y-3.5">
          {recs.isLarynxEarlyStageSingleDose ? (
            /* LARYNX Tis, T1, T2 N0 : PAS DE CTV N */
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                  Aires Ganglionnaires (CTV N) : Non Indiqué
                </h4>
              </div>
              <div className="text-xs text-slate-800 dark:text-slate-200 font-medium bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 leading-relaxed">
                Il n'y a <strong>pas de CTV N</strong> dans cette situation (Larynx Tis, T1 ou T2 N0 : absence d’irradiation des aires ganglionnaires prophylactiques cervicales).
              </div>
            </div>
          ) : (
            <>
              {/* CTV N HR */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 rounded-md font-bold text-xs">
                      CTV N Haut Risque
                    </span>
                    Ganglions Thérapeutiques (GTVn)
                  </h4>
                </div>
                <div className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-semibold bg-rose-50/40 dark:bg-rose-950/20 p-3 rounded-xl border border-rose-100 dark:border-rose-900/40">
                  {recs.ctvNHighRisk}
                </div>
              </div>

              {/* CTV N IR */}
              {recs.ctvNInterRisk && (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 rounded-md font-bold text-xs">
                        CTV N Risque Intermédiaire
                      </span>
                      Relais de Drainage direct
                    </h4>
                  </div>
                  <div className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-semibold bg-indigo-50/40 dark:bg-indigo-950/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                    {recs.ctvNInterRisk}
                  </div>
                </div>
              )}

              {/* CTV N BR Prophylactique */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-md font-bold text-xs">
                      CTV N Prophylactique (BR)
                    </span>
                    {formData.localisation === 'Nasopharynx' ? 'Consensus International Nasopharynx 2024' : 'Atlas DAHANCA / EORTC / Biau 2019'}
                  </h4>
                </div>
                <div className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-semibold bg-emerald-50/40 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                  {recs.ctvNLowRisk}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 3 : CONTRAINTES DE DOSE OAR */}
      {activeTab === 'oar' && (
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un organe (ex. Parotide, Moelle, Cochlée...)"
              value={searchOarQuery}
              onChange={(e) => setSearchOarQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white pl-9 pr-4 py-2.5 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-2xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </div>

          <div className="space-y-2.5">
            {filteredOars.map((oar, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2 hover:border-indigo-300 transition"
              >
                <div className="flex items-start justify-between">
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
      )}

      {/* ARTICLES SCIENTIFIQUES & ILLUSTRATIONS SECTION AT BOTTOM */}
      <div className="pt-4 space-y-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Références Scientifiques & Articles de Consensus
          </h3>
        </div>

        <div className="space-y-4">
          {recs.articlesToDisplay.map((article) => (
            <div
              key={article.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-block px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 rounded-md text-[10px] font-bold mb-1 border border-indigo-200 dark:border-indigo-800">
                    {article.badge}
                  </span>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug">
                    {article.title}
                  </h4>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {article.authorsOrJournal}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                {article.summaryText}
              </p>

              {/* External Article Link Button */}
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
    </div>
  );
};
