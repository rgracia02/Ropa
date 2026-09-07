import React from 'react';
import { Shirt, Sparkles, Calendar, WashingMachine, Plus } from 'lucide-react';
import { Garment } from '../types';

interface IOSBottomDockProps {
  activeTab: 'armario' | 'combinador' | 'calendario' | 'lavanderia';
  setActiveTab: (tab: 'armario' | 'combinador' | 'calendario' | 'lavanderia') => void;
  garments: Garment[];
  onOpenAddModal: () => void;
  className?: string;
}

export const IOSBottomDock: React.FC<IOSBottomDockProps> = ({
  activeTab,
  setActiveTab,
  garments,
  onOpenAddModal,
  className = '',
}) => {
  const laundryCount = garments.filter((g) => g.status === 'laundry').length;
  const needingWashCount = garments.filter(
    (g) => g.status !== 'laundry' && g.totalWearsSinceWash >= g.maxWearsBeforeWash
  ).length;
  const totalAlertCount = laundryCount + needingWashCount;

  const tabs = [
    {
      id: 'armario' as const,
      label: 'Armario',
      icon: Shirt,
      badge: garments.length,
    },
    {
      id: 'combinador' as const,
      label: 'Stylist IA',
      icon: Sparkles,
      highlight: true,
    },
    {
      id: 'calendario' as const,
      label: 'Semana',
      icon: Calendar,
    },
    {
      id: 'lavanderia' as const,
      label: 'Lavandería',
      icon: WashingMachine,
      badge: totalAlertCount > 0 ? totalAlertCount : null,
      badgeColor: laundryCount > 0 ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white',
    },
  ];

  return (
    <nav
      id="ios-bottom-dock"
      className={`pointer-events-auto liquid-glass-dock px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-full flex items-center justify-between gap-1 max-w-[370px] w-full shadow-[0_12px_36px_rgba(15,23,42,0.18)] border border-white/80 transition-all ${className}`}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            id={`ios-dock-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex-1 min-w-0 flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 sm:px-1.5 rounded-full transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 active:scale-95'
            }`}
          >
            <div className="relative">
              <Icon
                className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${
                  tab.highlight && isActive ? 'text-amber-300' : ''
                }`}
              />
              {tab.badge !== undefined && tab.badge !== null && (
                <span
                  className={`absolute -top-1.5 -right-2 px-1 min-w-3.5 h-3.5 flex items-center justify-center rounded-full text-[8px] sm:text-[9px] font-bold ${
                    tab.badgeColor || (isActive ? 'bg-white text-slate-900' : 'bg-slate-200 text-slate-700')
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] font-medium tracking-tight mt-0.5 whitespace-nowrap truncate max-w-full">
              {tab.label}
            </span>
          </button>
        );
      })}

      {/* Quick Add Garment Action Pill */}
      <button
        id="btn-ios-dock-agregar"
        onClick={onOpenAddModal}
        title="Añadir nueva prenda al armario"
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white flex items-center justify-center shadow-md shadow-sky-500/25 active:scale-90 transition-transform cursor-pointer shrink-0 ml-0.5"
      >
        <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
      </button>
    </nav>
  );
};
