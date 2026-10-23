import React, { useState, useEffect } from 'react';
import {
  RcpFormData,
  RcpResultOutput,
  SavedCase,
  LocalisationENT,
} from './types';
import { evaluateRcpDecision } from './utils/rcpDecisionEngine';
import { Header } from './components/Header';
import { HomeMenu } from './components/HomeMenu';
import { RcpForm } from './components/RcpForm';
import { RcpResult } from './components/RcpResult';
import { ContouringGuide } from './components/ContouringGuide';
import { DecisionTree } from './components/DecisionTree';
import { SavedCasesModal } from './components/SavedCasesModal';
import { MobileFrame } from './components/MobileFrame';

export default function App() {
  const [currentView, setCurrentView] = useState<
    'home' | 'rcp_form' | 'rcp_result' | 'contouring' | 'decision_tree'
  >('home');

  const [formData, setFormData] = useState<RcpFormData | null>(null);
  const [presetData, setPresetData] = useState<Partial<RcpFormData> | null>(null);
  const [result, setResult] = useState<RcpResultOutput | null>(null);
  const [contouringLocalisation, setContouringLocalisation] = useState<
    LocalisationENT | undefined
  >(undefined);

  const [savedCases, setSavedCases] = useState<SavedCase[]>(() => {
    try {
      const stored = localStorage.getItem('rcp_orl_saved_cases');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [currentSavedCaseId, setCurrentSavedCaseId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('rcp_orl_saved_cases', JSON.stringify(savedCases));
    } catch {
      // ignore
    }
  }, [savedCases]);

  const handleFormSubmit = (data: RcpFormData) => {
    const res = evaluateRcpDecision(data);
    setFormData(data);
    setResult(res);
    setCurrentSavedCaseId(null);
    setCurrentView('rcp_result');
  };

  const handleGoToContouring = (loc: LocalisationENT) => {
    setContouringLocalisation(loc);
    setCurrentView('contouring');
  };

  const handleSaveCase = (patientRef?: string) => {
    if (!formData || !result) return;
    const newCase: SavedCase = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      patientRef,
      formData,
      result,
    };
    setSavedCases((prev) => [newCase, ...prev]);
    setCurrentSavedCaseId(newCase.id);
  };

  const handleDeleteSavedCase = (id: string) => {
    setSavedCases((prev) => prev.filter((c) => c.id !== id));
    if (currentSavedCaseId === id) {
      setCurrentSavedCaseId(null);
    }
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
        onNavigateHome={() => setCurrentView('home')}
        onOpenSavedCases={() => setIsSavedModalOpen(true)}
        onOpenDecisionTree={() => setCurrentView('decision_tree')}
        savedCasesCount={savedCases.length}
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={() => setIsMobileFrame((prev) => !prev)}
      />

      <main className="min-h-[calc(100vh-60px)] pb-10">
        {currentView === 'home' && (
          <HomeMenu
            onSelectAvisRcp={() => {
              setPresetData(null);
              setCurrentView('rcp_form');
            }}
            onSelectDecisionTree={() => setCurrentView('decision_tree')}
            onSelectContouring={() => {
              setFormData(null);
              setResult(null);
              setContouringLocalisation(undefined);
              setCurrentView('contouring');
            }}
            savedCases={savedCases}
            onOpenSavedCase={handleSelectSavedCase}
          />
        )}

        {currentView === 'decision_tree' && (
          <DecisionTree
            onNavigateHome={() => setCurrentView('home')}
            onSelectCase={(preset) => {
              setPresetData(preset);
              setCurrentView('rcp_form');
            }}
          />
        )}

        {currentView === 'rcp_form' && (
          <RcpForm
            initialData={presetData}
            onSubmit={handleFormSubmit}
            onCancel={() => setCurrentView('home')}
          />
        )}

        {currentView === 'rcp_result' && formData && result && (
          <RcpResult
            formData={formData}
            result={result}
            onGoToContouring={handleGoToContouring}
            onSaveCase={handleSaveCase}
            isSaved={Boolean(currentSavedCaseId)}
            onModifyForm={() => setCurrentView('rcp_form')}
            onOpenDecisionTree={() => setCurrentView('decision_tree')}
          />
        )}

        {currentView === 'contouring' && (
          <ContouringGuide
            initialLocalisation={contouringLocalisation}
            formData={formData}
            rcpResult={result}
            onNavigateHome={() => setCurrentView('home')}
          />
        )}
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
