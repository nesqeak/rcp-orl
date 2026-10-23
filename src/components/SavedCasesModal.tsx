import React from 'react';
import { SavedCase } from '../types';
import { X, Trash2, ChevronRight, BookmarkCheck, Calendar, FileText } from 'lucide-react';

interface SavedCasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedCases: SavedCase[];
  onSelectCase: (c: SavedCase) => void;
  onDeleteCase: (id: string) => void;
  onClearAll: () => void;
}

export const SavedCasesModal: React.FC<SavedCasesModalProps> = ({
  isOpen,
  onClose,
  savedCases,
  onSelectCase,
  onDeleteCase,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Dossiers RCP Enregistrés
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {savedCases.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-500">
                Aucun dossier RCP enregistré pour le moment.
              </p>
              <p className="text-[11px] text-slate-400">
                Vous pouvez enregistrer les avis RCP validés pour consultation ultérieure.
              </p>
            </div>
          ) : (
            savedCases.map((c) => (
              <div
                key={c.id}
                className="bg-slate-50 dark:bg-slate-900/70 rounded-xl p-3 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 group hover:border-teal-500 transition shadow-2xs"
              >
                <div
                  className="flex-1 cursor-pointer space-y-1"
                  onClick={() => {
                    onSelectCase(c);
                    onClose();
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {c.patientRef ? c.patientRef : `Dossier ${c.formData.localisation}`}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3" />
                      {c.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded font-semibold">
                      {c.formData.localisation}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {c.formData.situation === 'tumeur_en_place' ? 'Tumeur en place' : 'Adjuvant'}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 truncate">
                    {c.result.proposition}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onDeleteCase(c.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Supprimer ce dossier"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      onSelectCase(c);
                      onClose();
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        {savedCases.length > 0 && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900 rounded-b-2xl">
            <span className="text-xs text-slate-500 font-medium">
              Total : {savedCases.length} dossier(s)
            </span>
            <button
              onClick={onClearAll}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
            >
              Tout effacer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
