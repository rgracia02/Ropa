import React from 'react';
import { Shirt, Sparkles, Calendar, WashingMachine, AlertTriangle, CheckCircle2, TrendingUp, Plus } from 'lucide-react';
import { Garment } from '../types';
import { calculateWardrobeStats } from '../utils/clothingUtils';

interface HeaderProps {
  activeTab: 'armario' | 'combinador' | 'calendario' | 'lavanderia';
  setActiveTab: (tab: 'armario' | 'combinador' | 'calendario' | 'lavanderia') => void;
  garments: Garment[];
  onQuickWashAll: () => void;
  onOpenAddModal?: () => void;
}

const TAB_TITLES = {
  armario: { title: 'Mi Armario', subtitle: 'Prendas limpias, en uso y estado de lavado' },
  combinador: { title: 'Stylist IA', subtitle: 'Combinaciones según clima y ocasión' },
  calendario: { title: 'Esta Semana', subtitle: 'Planificador diario de lunes a domingo' },
  lavanderia: { title: 'Lavandería & Usos', subtitle: 'Control de higiene y frecuencia de uso' },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  garments,
  onQuickWashAll,
  onOpenAddModal,
}) => {
  const stats = calculateWardrobeStats(garments);
  const currentInfo = TAB_TITLES[activeTab];

  return (
    <header className="mb-4">
      {/* iOS Large Title Header */}
      <div className="flex items-start justify-between gap-2 pt-1 pb-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5 truncate">
            <span>{currentInfo.title}</span>
            {activeTab === 'combinador' && (
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-amber-300/40 shrink-0" />
            )}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug truncate">
            {currentInfo.subtitle}
          </p>
        </div>

        {/* Quick action button */}
        {activeTab === 'armario' && onOpenAddModal && (
          <button
            onClick={onOpenAddModal}
            className="liquid-glass-pill px-3 py-1.5 rounded-full text-xs font-bold text-sky-700 hover:bg-white flex items-center gap-1 shadow-2xs active:scale-95 transition cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir</span>
          </button>
        )}
      </div>

      {/* iOS Liquid Glass Quick Stats Pill Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-[11px]">
        <div className="liquid-glass-pill px-2.5 py-1 rounded-full text-slate-700 font-medium shrink-0 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span><strong>{stats.clean}</strong> limpias</span>
        </div>

        <div className="liquid-glass-pill px-2.5 py-1 rounded-full text-amber-900 font-medium shrink-0 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span><strong>{stats.inUse}</strong> en uso</span>
        </div>

        <button
          onClick={() => setActiveTab('lavanderia')}
          className={`liquid-glass-pill px-2.5 py-1 rounded-full font-medium shrink-0 flex items-center gap-1 cursor-pointer transition ${
            stats.laundry > 0 ? 'text-rose-700 font-bold bg-rose-50/80 border-rose-200' : 'text-slate-600'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${stats.laundry > 0 ? 'bg-rose-500 animate-pulse' : 'bg-slate-400'}`} />
          <span><strong>{stats.laundry}</strong> al lavado</span>
        </button>

        <div className="liquid-glass-pill px-2.5 py-1 rounded-full text-sky-900 font-medium shrink-0 flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-sky-600" />
          <span>{stats.polerasWornThisWeek} poleras / {stats.pantalonesWornThisWeek} pantalones</span>
        </div>
      </div>

      {/* iOS Alert Banner if items need wash */}
      {stats.needingWashCount > 0 && activeTab !== 'lavanderia' && (
        <div className="mt-2.5 p-2.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 backdrop-blur-md flex items-center justify-between gap-2 text-xs text-amber-950 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="truncate text-[11px]">
              <strong>{stats.needingWashCount}</strong> prenda(s) necesitan lavado pronto
            </span>
          </div>
          <button
            onClick={() => setActiveTab('lavanderia')}
            className="text-[11px] font-bold text-amber-800 underline hover:text-amber-950 shrink-0 cursor-pointer"
          >
            Ver
          </button>
        </div>
      )}
    </header>
  );
};

