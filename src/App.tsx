import { useState } from 'react';
import { RcpFormData, RcpResultOutput, SavedCase, View } from './types';
import { evaluateRcpDecision } from './utils/rcpDecisionEngine';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { Header } from './components/Header';
import { HomeMenu } from './components/HomeMenu';
import { RcpForm } from './components/RcpForm';
import { RcpResult } from './components/RcpResult';
import { ContouringGuide } from './components/contouring/ContouringGuide';
import { DecisionTree } from './components/DecisionTree';
import { SavedCasesModal } from './components/SavedCasesModal';
import { MobileFrame } from './components/MobileFrame';

const SAVED_CASES_STORAGE_KEY = 'rcp_orl_saved_cases';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');

  // Dossier RCP en cours et pré-remplissage éventuel du formulaire
  const [formData, setFormData] = useState<RcpFormData | null>(null);
  const [result, setResult] = useState<RcpResultOutput | null>(null);
  const [presetData, setPresetData] = useState<Partial<RcpFormData> | null>(null);

  const [savedCases, setSavedCases] = useLocalStorageState<SavedCase[]>(SAVED_CASES_STORAGE_KEY, []);
  const [currentSavedCaseId, setCurrentSavedCaseId] = useState<string | null>(null);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  const goHome = () => setCurrentView('home');

  const openRcpForm = (preset: Partial<RcpFormData> | null) => {
    setPresetData(preset);
    setCurrentView('rcp_form');
  };

  const handleFormSubmit = (data: RcpFormData) => {
    setFormData(data);
    setResult(evaluateRcpDecision(data));
    setCurrentSavedCaseId(null);
    setCurrentView('rcp_result');
  };

  const openStandaloneContouring = () => {
    setFormData(null);
    setResult(null);
    setCurrentView('contouring');
  };

  const handleSaveCase = (patientRef?: string) => {
    if (!formData || !result) return;
    const newCase: SavedCase = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      patientRef,
      formData,
      result,
    };
    setSavedCases((prev) => [newCase, ...prev]);
    setCurrentSavedCaseId(newCase.id);
  };

  const handleDeleteSavedCase = (id: string) => {
    setSavedCases((prev) => prev.filter((c) => c.id !== id));
    if (currentSavedCaseId === id) setCurrentSavedCaseId(null);
  };

  const handleClearAllCases = () => {
    setSavedCases([]);
    setCurrentSavedCaseId(null);
  };

  const handleSelectSavedCase = (saved: SavedCase) => {
    setFormData(saved.formData);
    setResult(saved.result);
    setCurrentSavedCaseId(saved.id);
    setCurrentView('rcp_result');
  };

  return (
    <MobileFrame isMobileFrame={isMobileFrame}>
      <Header
        currentView={currentView}
        onNavigateHome={goHome}
        onOpenSavedCases={() => setIsSavedModalOpen(true)}
        onOpenDecisionTree={() => setCurrentView('decision_tree')}
        savedCasesCount={savedCases.length}
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={() => setIsMobileFrame((prev) => !prev)}
      />

      <main className="min-h-[calc(100vh-60px)] pb-10">
        {currentView === 'home' && (
          <HomeMenu
            onSelectAvisRcp={() => openRcpForm(null)}
            onSelectDecisionTree={() => setCurrentView('decision_tree')}
            onSelectContouring={openStandaloneContouring}
            savedCases={savedCases}
            onOpenSavedCase={handleSelectSavedCase}
          />
        )}

        {currentView === 'decision_tree' && <DecisionTree onSelectCase={openRcpForm} />}

        {currentView === 'rcp_form' && (
          <RcpForm initialData={presetData} onSubmit={handleFormSubmit} onCancel={goHome} />
        )}

        {currentView === 'rcp_result' && formData && result && (
          <RcpResult
            formData={formData}
            result={result}
            onGoToContouring={() => setCurrentView('contouring')}
            onSaveCase={handleSaveCase}
            isSaved={currentSavedCaseId !== null}
            onModifyForm={() => openRcpForm(formData)}
            onOpenDecisionTree={() => setCurrentView('decision_tree')}
          />
        )}

        {currentView === 'contouring' && <ContouringGuide formData={formData} rcpResult={result} />}
      </main>

      <SavedCasesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedCases={savedCases}
        onSelectCase={handleSelectSavedCase}
        onDeleteCase={handleDeleteSavedCase}
        onClearAll={handleClearAllCases}
      />
    </MobileFrame>
  );
}
