import React from 'react';

interface MobileFrameProps {
  children: React.ReactNode;
  isMobileFrame: boolean;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children, isMobileFrame }) => {
  if (!isMobileFrame) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-teal-500 selection:text-white">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-2 sm:p-6 select-none font-sans">
      {/* Smartphone frame container */}
      <div className="w-full max-w-[420px] h-[92vh] max-h-[850px] bg-slate-950 rounded-[42px] border-[10px] border-slate-800 shadow-2xl overflow-hidden flex flex-col relative ring-1 ring-white/10">
        {/* Notch / Dynamic Island */}
        <div className="w-32 h-4 bg-slate-800 rounded-b-xl mx-auto absolute top-0 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-slate-950/80 mr-2" />
          <div className="w-2 h-2 rounded-full bg-slate-950/60" />
        </div>

        {/* Scrollable Smartphone screen area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 pt-2 scrollbar-none">
          {children}
        </div>

        {/* Home Bar Indicator */}
        <div className="w-full h-5 bg-teal-900 flex items-center justify-center shrink-0">
          <div className="w-28 h-1 bg-teal-600/60 rounded-full" />
        </div>
      </div>
    </div>
  );
};
