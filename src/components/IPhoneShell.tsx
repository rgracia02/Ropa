import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Github, Sparkles, Wifi, Battery, Volume2 } from 'lucide-react';
import { DynamicIsland } from './DynamicIsland';
import { IOSBottomDock } from './IOSBottomDock';
import { Garment } from '../types';
import { IPhoneContext } from '../context/IPhoneContext';

interface IPhoneShellProps {
  children: React.ReactNode;
  garments: Garment[];
  activeTab: 'armario' | 'combinador' | 'calendario' | 'lavanderia';
  setActiveTab: (tab: 'armario' | 'combinador' | 'calendario' | 'lavanderia') => void;
  onOpenAddModal: () => void;
  onNavigateToLaundry: () => void;
  onNavigateToStylist: () => void;
  onOpenGitHubModal: () => void;
}

export const IPhoneShell: React.FC<IPhoneShellProps> = ({
  children,
  garments,
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onNavigateToLaundry,
  onNavigateToStylist,
  onOpenGitHubModal,
}) => {
  const [isIPhoneFrame, setIsIPhoneFrame] = useState(true);
  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${h}:${m}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <IPhoneContext.Provider value={{ isIPhoneFrame, setIsIPhoneFrame }}>
      <div className="min-h-screen bg-gradient-to-br from-slate-200 via-slate-100 to-indigo-100/60 relative flex flex-col items-center justify-start overflow-x-hidden text-slate-900 selection:bg-sky-500/20">
      {/* Ambient iOS Liquid Glass Background Blobs */}
      <div className="ambient-liquid-mesh">
        <div className="ambient-blob-1" />
        <div className="ambient-blob-2" />
        <div className="ambient-blob-3" />
      </div>

      {/* Top Desktop Controls Bar */}
      <header className="w-full max-w-6xl mx-auto px-4 py-3 z-30 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Smartphone className="w-4 h-4 text-sky-400" />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-slate-900">Armario iOS</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/80 border border-white/60 text-slate-600 shadow-2xs">
              Liquid Glass UI
            </span>
          </div>
        </div>

        {/* View Switcher & GitHub Button */}
        <div className="flex items-center gap-2">
          <div className="liquid-glass-pill p-1 rounded-full flex items-center gap-1 border border-white/80 shadow-xs">
            <button
              onClick={() => setIsIPhoneFrame(true)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                isIPhoneFrame
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>iPhone 16 Pro</span>
            </button>
            <button
              onClick={() => setIsIPhoneFrame(false)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                !isIPhoneFrame
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Expandida</span>
            </button>
          </div>

          <button
            id="btn-subir-a-github"
            onClick={onOpenGitHubModal}
            className="px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-900 border border-slate-300/80 font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer hover:shadow-sm"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Subir a</span>
            <span>GitHub</span>
          </button>
        </div>
      </header>

      {/* Main Container: Either realistic iPhone 16 Pro chassis OR responsive full view */}
      <main className="w-full flex-1 flex justify-center items-start p-1 sm:p-4 z-10 pb-16 overflow-x-hidden">
        {isIPhoneFrame ? (
          /* iPhone 16 Pro Chassis Mockup */
          <div className="relative w-full max-w-[390px] sm:max-w-[410px] mx-auto my-1">
            {/* Outer Titanium Frame Edge */}
            <div className="p-2 sm:p-2.5 rounded-[46px] sm:rounded-[52px] bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.4),0_0_0_1px_rgba(255,255,255,0.18)] border-2 border-slate-600/50 relative">
              {/* Hardware Button Accents - Flush to border, no outer spill */}
              <div className="hidden sm:block absolute -left-1 top-24 w-1 h-10 bg-slate-500/80 rounded-l-xs shadow-2xs" title="Action Button" />
              <div className="hidden sm:block absolute -left-1 top-38 w-1 h-14 bg-slate-500/80 rounded-l-xs shadow-2xs" title="Volume Up" />
              <div className="hidden sm:block absolute -left-1 top-56 w-1 h-14 bg-slate-500/80 rounded-l-xs shadow-2xs" title="Volume Down" />
              <div className="hidden sm:block absolute -right-1 top-36 w-1 h-18 bg-slate-500/80 rounded-r-xs shadow-2xs" title="Power Button" />

              {/* Inner Screen Bezel */}
              <div className="relative w-full bg-slate-100/95 rounded-[38px] sm:rounded-[44px] overflow-hidden border border-slate-900/40 flex flex-col h-[740px] sm:h-[800px] max-h-[85vh] shadow-inner">
                {/* iOS Top Status Bar */}
                <div className="w-full pt-2.5 px-5 pb-0.5 flex items-center justify-between text-xs font-bold text-slate-900 shrink-0 select-none z-20">
                  <span className="tracking-tight text-[12px] sm:text-[13px]">{currentTime}</span>

                  <div className="flex items-center gap-1.5 text-slate-800 text-[11px]">
                    <span className="font-extrabold text-[9px] tracking-tighter">5G</span>
                    <Wifi className="w-3.5 h-3.5" />
                    <div className="flex items-center gap-0.5">
                      <span className="text-[9px]">100%</span>
                      <div className="w-4.5 h-2.2 rounded-xs border border-slate-800 p-0.2 flex items-center">
                        <div className="w-full h-full bg-slate-900 rounded-2xs" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* iPhone Dynamic Island */}
                <div className="shrink-0 -mt-0.5">
                  <DynamicIsland
                    garments={garments}
                    onNavigateToLaundry={onNavigateToLaundry}
                    onNavigateToStylist={onNavigateToStylist}
                  />
                </div>

                {/* iPhone Screen Scrollable Body */}
                <div className="flex-1 overflow-y-auto no-scrollbar px-3 sm:px-3.5 pt-1 pb-24 relative">
                  {children}
                </div>

                {/* iOS Bottom Dock - Locked inside iPhone screen */}
                <div className="absolute bottom-3 inset-x-0 flex justify-center z-40 px-2.5 pointer-events-auto">
                  <IOSBottomDock
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    garments={garments}
                    onOpenAddModal={onOpenAddModal}
                  />
                </div>

                {/* iOS Bottom Home Indicator Bar */}
                <div className="absolute bottom-1 inset-x-0 flex justify-center pointer-events-none z-50">
                  <div className="w-28 h-1 bg-slate-900/40 rounded-full backdrop-blur-xs" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Full Screen Responsive View with iOS Glass Aesthetic */
          <div className="w-full max-w-5xl mx-auto liquid-glass-surface rounded-[2rem] sm:rounded-[2.5rem] border border-white/80 shadow-xl overflow-hidden p-3.5 sm:p-6 relative pb-24">
            <div className="max-w-xs mx-auto mb-2 sm:mb-3">
              <DynamicIsland
                garments={garments}
                onNavigateToLaundry={onNavigateToLaundry}
                onNavigateToStylist={onNavigateToStylist}
              />
            </div>
            {children}

            {/* Floating iOS Bottom Dock in expanded view */}
            <div className="fixed bottom-4 inset-x-0 flex justify-center z-40 px-4 pointer-events-auto">
              <IOSBottomDock
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                garments={garments}
                onOpenAddModal={onOpenAddModal}
              />
            </div>
          </div>
        )}
      </main>
    </div>
    </IPhoneContext.Provider>
  );
};
