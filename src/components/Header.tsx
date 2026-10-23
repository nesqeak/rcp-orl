import React from 'react';
import { ArrowLeft, BookmarkCheck, GitFork, Smartphone, Stethoscope } from 'lucide-react';
import { View } from '../types';
import { cx } from './ui';

interface HeaderProps {
  currentView: View;
  onNavigateHome: () => void;
  onOpenSavedCases: () => void;
  onOpenDecisionTree: () => void;
  savedCasesCount: number;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
}

const iconButtonClass = (isActive: boolean) =>
  cx('p-2 rounded-lg transition', isActive ? 'bg-teal-700 text-white' : 'hover:bg-teal-800 active:bg-teal-700 text-teal-100');

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigateHome,
  onOpenSavedCases,
  onOpenDecisionTree,
  savedCasesCount,
  isMobileFrame,
  onToggleMobileFrame,
}) => (
  <header className="sticky top-0 z-40 bg-teal-900 text-white shadow-md border-b border-teal-800">
    <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {currentView === 'home' ? (
          <div className="p-2 bg-teal-800/80 rounded-xl text-teal-300">
            <Stethoscope className="w-5 h-5" />
          </div>
        ) : (
          <button
            onClick={onNavigateHome}
            className="p-1.5 -ml-1 rounded-full hover:bg-teal-800 active:bg-teal-700 transition text-teal-100 flex items-center justify-center"
            title="Retour au menu principal"
            aria-label="Retour au menu principal"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div>
          <h1 className="font-bold text-base tracking-tight leading-none text-white">
            Radiothérapie ORL{' '}
            <span className="text-teal-300 font-semibold text-xs ml-1 px-1.5 py-0.5 bg-teal-800/60 rounded-md">
              de poche
            </span>
          </h1>
          <p className="text-[11px] text-teal-200/80 font-medium mt-0.5">Aide à la décision RCP & Contourages</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenDecisionTree}
          className={iconButtonClass(currentView === 'decision_tree')}
          title="Arbre décisionnel des indications"
          aria-label="Arbre décisionnel des indications"
        >
          <GitFork className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenSavedCases}
          className={cx(iconButtonClass(false), 'relative')}
          title="Dossiers enregistrés"
          aria-label="Dossiers enregistrés"
        >
          <BookmarkCheck className="w-5 h-5" />
          {savedCasesCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-400 text-teal-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-teal-900">
              {savedCasesCount}
            </span>
          )}
        </button>

        <button
          onClick={onToggleMobileFrame}
          className={iconButtonClass(isMobileFrame)}
          title={isMobileFrame ? 'Mode plein écran' : 'Vue maquette smartphone'}
          aria-label={isMobileFrame ? 'Mode plein écran' : 'Vue maquette smartphone'}
          aria-pressed={isMobileFrame}
        >
          <Smartphone className="w-4 h-4" />
        </button>
      </div>
    </div>
  </header>
);
